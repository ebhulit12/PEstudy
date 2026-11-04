/* Small HTTP helpers for Vercel Node functions (also work with a plain Node http server). */
'use strict';

function send(res, status, obj, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(obj));
}

const MAX_BODY = 3 * 1024 * 1024; // 3 MB (Vercel's hard limit is 4.5 MB)

async function readBody(req) {
  if (req.body !== undefined && req.body !== null && typeof req.body !== 'string' && !Buffer.isBuffer(req.body)) return req.body;
  let raw = typeof req.body === 'string' ? req.body : Buffer.isBuffer(req.body) ? req.body.toString('utf8') : null;
  if (raw === null) {
    raw = await new Promise((resolve, reject) => {
      let size = 0; const chunks = [];
      req.on('data', (c) => { size += c.length; if (size > MAX_BODY) { reject(Object.assign(new Error('Too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }
  if (raw.length > MAX_BODY) throw Object.assign(new Error('Too large'), { status: 413 });
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (e) { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}

function cookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function isSecure(req) {
  const proto = req.headers['x-forwarded-proto'];
  if (proto) return proto.split(',')[0].trim() === 'https';
  const host = String(req.headers.host || '');
  return !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

function sessionCookie(req, token, maxAgeSec) {
  return [
    `pe_session=${token ? encodeURIComponent(token) : ''}`,
    'Path=/', 'HttpOnly', 'SameSite=Lax',
    `Max-Age=${token ? maxAgeSec : 0}`,
    isSecure(req) ? 'Secure' : ''
  ].filter(Boolean).join('; ');
}

/** Block cross-site requests that change data (defense in depth on top of SameSite cookies). */
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch (e) { return false; }
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket && req.socket.remoteAddress || 'unknown').split(',')[0].trim();
}

function query(req) {
  if (req.query) return req.query;
  const u = new URL(req.url, 'http://x');
  return Object.fromEntries(u.searchParams);
}

module.exports = { send, readBody, cookies, sessionCookie, sameOrigin, clientIp, query };
