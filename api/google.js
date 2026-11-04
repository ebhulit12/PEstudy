/* Google sign-in (OAuth 2.0 authorization code flow with PKCE), no third-party SDKs.
     GET /api/google?start=1   -> redirects to Google's consent screen
     GET /api/google?code=...  -> Google redirects back here; we verify, sign in, redirect to the app
   Requires env vars GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (Vercel → Settings → Environment Variables).
   Optional GOOGLE_REDIRECT_URI to override the callback URL (default https://<host>/api/google). */
'use strict';
const crypto = require('crypto');
const { config, cmd } = require('./_lib/redis');
const { cookies, sessionCookie, query } = require('./_lib/http');
const S = require('./_lib/session');

const b64url = (buf) => Buffer.from(buf).toString('base64url');
const googleConfigured = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

function origin(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = (req.headers['x-forwarded-proto'] || (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) ? 'http' : 'https')).split(',')[0].trim();
  return `${proto}://${host}`;
}
const redirectUri = (req) => process.env.GOOGLE_REDIRECT_URI || origin(req) + '/api/google';

function redirect(res, location, setCookies = []) {
  res.statusCode = 302;
  res.setHeader('Location', location);
  res.setHeader('Cache-Control', 'no-store');
  if (setCookies.length) res.setHeader('Set-Cookie', setCookies);
  res.end();
}
function oauthCookie(req, value) {
  const secure = origin(req).startsWith('https') ? '; Secure' : '';
  return `pe_oauth=${value ? encodeURIComponent(value) : ''}; Path=/api/google; HttpOnly; SameSite=Lax; Max-Age=${value ? 600 : 0}${secure}`;
}
const fail = (req, res, msg) => redirect(res, '/#/oauth?error=' + encodeURIComponent(msg), [oauthCookie(req, null)]);

module.exports = async function handler(req, res) {
  const q = query(req);
  try {
    if (!config()) return fail(req, res, 'Accounts are not set up on this site yet (no database connected).');
    if (!googleConfigured()) return fail(req, res, 'Google sign-in is not set up on this site yet.');

    // ---- step 1: send the user to Google
    if (q.start) {
      const state = b64url(crypto.randomBytes(24));
      const nonce = b64url(crypto.randomBytes(24));
      const verifier = b64url(crypto.randomBytes(48));
      const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri(req),
        response_type: 'code',
        scope: 'openid email profile',
        state, nonce,
        code_challenge: challenge, code_challenge_method: 'S256',
        prompt: 'select_account'
      });
      return redirect(res, 'https://accounts.google.com/o/oauth2/v2/auth?' + params, [oauthCookie(req, [state, nonce, verifier].join('.'))]);
    }

    // ---- step 2: Google redirected back
    if (q.error) return fail(req, res, q.error === 'access_denied' ? 'Google sign-in was cancelled.' : 'Google sign-in failed: ' + q.error);
    if (!q.code) return fail(req, res, 'Missing authorization code.');
    const [state, nonce, verifier] = String(cookies(req).pe_oauth || '').split('.');
    if (!state || !q.state || q.state !== state) return fail(req, res, 'Sign-in session expired or was tampered with. Please try again.');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: q.code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri(req), grant_type: 'authorization_code', code_verifier: verifier
      })
    });
    const tok = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tok.id_token) {
      console.error('Google token exchange failed', tokenRes.status, tok.error, tok.error_description);
      return fail(req, res, 'Google sign-in failed (' + (tok.error_description || tok.error || tokenRes.status) + ').');
    }
    // The ID token came straight from Google's token endpoint over TLS, so its signature
    // need not be re-verified (OpenID Connect Core §3.1.3.7); we still validate the claims.
    let claims;
    try { claims = JSON.parse(Buffer.from(tok.id_token.split('.')[1], 'base64url').toString('utf8')); } catch (e) { return fail(req, res, 'Invalid response from Google.'); }
    const now = Math.floor(Date.now() / 1000);
    if (!['https://accounts.google.com', 'accounts.google.com'].includes(claims.iss)) return fail(req, res, 'Invalid token issuer.');
    if (claims.aud !== process.env.GOOGLE_CLIENT_ID) return fail(req, res, 'Token was not issued for this site.');
    if (!claims.exp || claims.exp < now - 60) return fail(req, res, 'Google sign-in expired. Please try again.');
    if (claims.nonce !== nonce) return fail(req, res, 'Sign-in check failed. Please try again.');
    if (!claims.sub) return fail(req, res, 'Invalid Google account.');
    const email = String(claims.email || '').toLowerCase();
    if (!email || claims.email_verified === false || claims.email_verified === 'false') return fail(req, res, 'Your Google account email is not verified.');

    // ---- find or create the user: by Google ID, else link an existing account with the same verified email
    let isNew = false, linked = false;
    let id = await cmd('GET', 'google:' + claims.sub);
    let user = id && (await S.getUser(id));
    if (!user) {
      id = await cmd('GET', 'email:' + email);
      user = id && (await S.getUser(id));
      if (user) {
        // Link Google to the existing account with this (now Google-verified) email.
        // Password sign-ups don't verify email ownership, so whoever set that password may not be
        // this person: drop the old password/recovery code and sign out other sessions.
        user.google = claims.sub;
        if (user.pw) { user.pw = null; user.rc = null; linked = true; }
        await S.saveUser(user);
        await S.destroyAllSessions(user.id);
      } else {
        id = crypto.randomUUID();
        if ((await cmd('SET', 'email:' + email, id, 'NX')) !== 'OK') return fail(req, res, 'Please try again.');
        user = { id, email, name: String(claims.name || email.split('@')[0]).slice(0, 40), pw: null, rc: null, google: claims.sub, created: Date.now() };
        await S.saveUser(user);
        isNew = true;
      }
      await cmd('SET', 'google:' + claims.sub, user.id);
    }
    const token = await S.createSession(user.id);
    return redirect(res, '/#/oauth?ok=1' + (isNew ? '&new=1' : '') + (linked ? '&linked=1' : ''), [oauthCookie(req, null), sessionCookie(req, token, S.SESSION_TTL)]);
  } catch (e) {
    console.error(e);
    return fail(req, res, 'Server error during Google sign-in. Please try again.');
  }
};
module.exports.googleConfigured = googleConfigured;
