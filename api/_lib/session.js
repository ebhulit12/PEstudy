/* Password hashing, sessions, rate limiting. Data layout in Redis:
     user:<id>             JSON { id, email, name, pw, rc, created }
     email:<lowercased>    -> user id
     sess:<sha256(token)>  -> user id   (TTL 30 days, sliding)
     usess:<id>            SET of session hashes (to revoke all sessions)
     progress:<id>         HASH { rev, data, updatedAt }
     rl:<bucket>:<key>     rate-limit counters */
'use strict';
const crypto = require('crypto');
const { cmd, pipeline } = require('./redis');
const { cookies } = require('./http');

const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

function scrypt(secret, salt) {
  return new Promise((resolve, reject) =>
    crypto.scrypt(secret, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (err, key) => (err ? reject(err) : resolve(key))));
}
async function hashSecret(secret) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(String(secret), salt);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}
async function verifySecret(secret, stored) {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const [, s, k] = stored.split('$');
  const key = await scrypt(String(secret), Buffer.from(s, 'base64'));
  const expected = Buffer.from(k, 'base64');
  return expected.length === key.length && crypto.timingSafeEqual(expected, key);
}

const sha256 = (t) => crypto.createHash('sha256').update(t).digest('hex');
const newToken = () => crypto.randomBytes(32).toString('base64url');

/** Human-friendly one-time recovery code, e.g. 7KQM-X3PD-9WTF-H2RB */
function newRecoveryCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const b = crypto.randomBytes(16);
  let s = '';
  for (let i = 0; i < 16; i++) s += A[b[i] % A.length];
  return s.match(/.{4}/g).join('-');
}
const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').match(/.{1,4}/g)?.join('-') || '';

async function getUser(id) {
  const raw = await cmd('GET', 'user:' + id);
  return raw ? JSON.parse(raw) : null;
}
async function saveUser(u) { await cmd('SET', 'user:' + u.id, JSON.stringify(u)); }
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, created: u.created });

async function createSession(userId) {
  const token = newToken(), h = sha256(token);
  await pipeline([['SET', 'sess:' + h, userId, 'EX', SESSION_TTL], ['SADD', 'usess:' + userId, h], ['EXPIRE', 'usess:' + userId, SESSION_TTL]]);
  return token;
}
/** Returns { user, hash } for a valid session cookie, else null. Refreshes the TTL. */
async function currentSession(req) {
  const token = cookies(req).pe_session;
  if (!token) return null;
  const h = sha256(token);
  const id = await cmd('GET', 'sess:' + h);
  if (!id) return null;
  const user = await getUser(id);
  if (!user) return null;
  pipeline([['EXPIRE', 'sess:' + h, SESSION_TTL], ['EXPIRE', 'usess:' + id, SESSION_TTL]]).catch(() => {});
  return { user, hash: h };
}
async function destroySession(h, userId) {
  await pipeline([['DEL', 'sess:' + h], ['SREM', 'usess:' + userId, h]]);
}
/** Revoke every session for a user, optionally keeping one. */
async function destroyAllSessions(userId, keepHash) {
  const all = (await cmd('SMEMBERS', 'usess:' + userId)) || [];
  const drop = all.filter((h) => h !== keepHash);
  if (drop.length) await pipeline(drop.map((h) => ['DEL', 'sess:' + h]).concat([['SREM', 'usess:' + userId, ...drop]]));
}

/** Fixed-window rate limit. Returns true if the request is allowed. */
async function rateLimit(bucket, key, max, windowSec) {
  const k = `rl:${bucket}:${key}`;
  const n = await cmd('INCR', k);
  if (n === 1) await cmd('EXPIRE', k, windowSec);
  return n <= max;
}

module.exports = {
  SESSION_TTL, hashSecret, verifySecret, newRecoveryCode, normCode, getUser, saveUser, publicUser,
  createSession, currentSession, destroySession, destroyAllSessions, rateLimit
};
