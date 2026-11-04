/* /api/auth?action=...
     GET  status            -> { configured, user }
     POST signup            { email, password, name }        -> { user, recoveryCode }
     POST login             { email, password }              -> { user }
     POST logout
     POST recover           { email, recoveryCode, password } -> { user, recoveryCode }  (resets password)
     POST change-password   { password, newPassword }        -> { ok, recoveryCode? }
     POST new-recovery      { password }                     -> { recoveryCode }
     POST rename            { name }                         -> { user }
     POST set-password      { newPassword }                  -> { ok, recoveryCode }  (Google-only accounts)
     POST delete            { password } or { confirm: 'DELETE' } for Google-only accounts -> { ok } */
'use strict';
const { config, cmd, pipeline } = require('./_lib/redis');
const { send, readBody, sessionCookie, sameOrigin, clientIp, query } = require('./_lib/http');
const S = require('./_lib/session');
const crypto = require('crypto');

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const cleanName = (n, email) => String(n || '').trim().slice(0, 40) || String(email || '').split('@')[0].slice(0, 40) || 'Student';
const cleanEmail = (e) => String(e || '').trim().toLowerCase();
const googleConfigured = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const checkPassword = (p) => (typeof p === 'string' && p.length >= 8 && p.length <= 200) ? null : 'Password must be at least 8 characters.';

async function deleteUser(req, res, user) {
  await S.destroyAllSessions(user.id);
  const keys = [['DEL', 'user:' + user.id], ['DEL', 'email:' + user.email], ['DEL', 'progress:' + user.id], ['DEL', 'usess:' + user.id]];
  if (user.google) keys.push(['DEL', 'google:' + user.google]);
  await pipeline(keys);
  return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req, null) });
}

module.exports = async function handler(req, res) {
  const action = query(req).action || 'status';
  try {
    if (!config()) {
      return send(res, action === 'status' ? 200 : 503, { configured: false, google: false, user: null, error: 'Accounts are not set up on this site yet (no database connected).' });
    }
    if (action === 'status') {
      const s = await S.currentSession(req);
      return send(res, 200, { configured: true, google: googleConfigured(), user: s ? S.publicUser(s.user) : null });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
    if (!sameOrigin(req)) return send(res, 403, { error: 'Cross-site request blocked' });
    const body = await readBody(req);
    const ip = clientIp(req);

    if (action === 'signup') {
      if (!(await S.rateLimit('signup', ip, 10, 3600))) return send(res, 429, { error: 'Too many sign-ups from this network. Try again later.' });
      const email = cleanEmail(body.email);
      if (!EMAIL_RE.test(email)) return send(res, 400, { error: 'Please enter a valid email address.' });
      const pwErr = checkPassword(body.password); if (pwErr) return send(res, 400, { error: pwErr });
      const id = crypto.randomUUID();
      const claimed = await cmd('SET', 'email:' + email, id, 'NX');
      if (claimed !== 'OK') return send(res, 409, { error: 'An account with that email already exists — try signing in.' });
      const recoveryCode = S.newRecoveryCode();
      const user = { id, email, name: cleanName(body.name, email), pw: await S.hashSecret(body.password), rc: await S.hashSecret(recoveryCode), created: Date.now() };
      await S.saveUser(user);
      const token = await S.createSession(id);
      return send(res, 200, { user: S.publicUser(user), recoveryCode }, { 'Set-Cookie': sessionCookie(req, token, S.SESSION_TTL) });
    }

    if (action === 'login') {
      const email = cleanEmail(body.email);
      if (!(await S.rateLimit('login-ip', ip, 30, 900)) || !(await S.rateLimit('login-email', email, 10, 900)))
        return send(res, 429, { error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' });
      const id = email && (await cmd('GET', 'email:' + email));
      const user = id && (await S.getUser(id));
      if (user && !user.pw) return send(res, 401, { error: 'This account uses Google sign-in — click “Continue with Google”. (You can add a password from the Account page.)' });
      const ok = user ? await S.verifySecret(body.password || '', user.pw) : (await S.hashSecret('x'), false); // constant-ish timing
      if (!ok) return send(res, 401, { error: 'Email or password is incorrect.' });
      const token = await S.createSession(user.id);
      return send(res, 200, { user: S.publicUser(user) }, { 'Set-Cookie': sessionCookie(req, token, S.SESSION_TTL) });
    }

    if (action === 'recover') {
      const email = cleanEmail(body.email);
      if (!(await S.rateLimit('recover', ip, 10, 3600)) || !(await S.rateLimit('recover-email', email, 5, 3600)))
        return send(res, 429, { error: 'Too many recovery attempts. Try again in an hour.' });
      const pwErr = checkPassword(body.password); if (pwErr) return send(res, 400, { error: pwErr });
      const id = email && (await cmd('GET', 'email:' + email));
      const user = id && (await S.getUser(id));
      if (user && !user.rc) return send(res, 401, { error: 'This account uses Google sign-in — use “Continue with Google” instead.' });
      if (!user || !(await S.verifySecret(S.normCode(body.recoveryCode), user.rc))) return send(res, 401, { error: 'Email or recovery code is incorrect.' });
      const recoveryCode = S.newRecoveryCode();
      user.pw = await S.hashSecret(body.password);
      user.rc = await S.hashSecret(recoveryCode);
      await S.saveUser(user);
      await S.destroyAllSessions(user.id);
      const token = await S.createSession(user.id);
      return send(res, 200, { user: S.publicUser(user), recoveryCode }, { 'Set-Cookie': sessionCookie(req, token, S.SESSION_TTL) });
    }

    // ---- everything below requires a signed-in user
    const s = await S.currentSession(req);
    if (action === 'logout') {
      if (s) await S.destroySession(s.hash, s.user.id);
      return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req, null) });
    }
    if (!s) return send(res, 401, { error: 'Your session has expired. Please sign in again.' });
    const user = s.user;

    if (action === 'rename') {
      user.name = cleanName(body.name, user.email);
      await S.saveUser(user);
      return send(res, 200, { user: S.publicUser(user) });
    }

    // Google-only accounts (no password yet)
    if (!user.pw) {
      if (action === 'set-password') {
        const pwErr = checkPassword(body.newPassword); if (pwErr) return send(res, 400, { error: pwErr });
        const recoveryCode = S.newRecoveryCode();
        user.pw = await S.hashSecret(body.newPassword);
        user.rc = await S.hashSecret(recoveryCode);
        await S.saveUser(user);
        return send(res, 200, { ok: true, recoveryCode });
      }
      if (action === 'delete') {
        if (body.confirm !== 'DELETE') return send(res, 400, { error: 'Type DELETE to confirm.' });
        return deleteUser(req, res, user);
      }
      return send(res, 400, { error: 'Set a password first (Account page).' });
    }

    // Sensitive actions re-check the current password
    if (!(await S.rateLimit('reauth', user.id, 10, 900))) return send(res, 429, { error: 'Too many attempts. Please wait 15 minutes.' });
    if (!(await S.verifySecret(body.password || '', user.pw))) return send(res, 401, { error: 'Current password is incorrect.' });

    if (action === 'change-password') {
      const pwErr = checkPassword(body.newPassword); if (pwErr) return send(res, 400, { error: pwErr });
      user.pw = await S.hashSecret(body.newPassword);
      await S.saveUser(user);
      await S.destroyAllSessions(user.id, s.hash); // sign out other devices
      return send(res, 200, { ok: true });
    }
    if (action === 'new-recovery') {
      const recoveryCode = S.newRecoveryCode();
      user.rc = await S.hashSecret(recoveryCode);
      await S.saveUser(user);
      return send(res, 200, { recoveryCode });
    }
    if (action === 'delete') return deleteUser(req, res, user);
    return send(res, 400, { error: 'Unknown action' });
  } catch (e) {
    console.error(e);
    return send(res, e.status || 500, { error: e.status ? e.message : 'Server error — please try again.' });
  }
};
