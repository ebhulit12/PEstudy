/* /api/progress
     GET -> { rev, data, updatedAt }   (data is the JSON string of the user's study state, or null)
     PUT { baseRev, data } -> { rev } | 409 { rev, data } if someone else (another device) saved first.
   Optimistic concurrency: the client merges on 409 and retries, so devices never overwrite each other. */
'use strict';
const { config, cmd, hash } = require('./_lib/redis');
const { send, readBody, sameOrigin } = require('./_lib/http');
const S = require('./_lib/session');

const MAX_DATA = 2.5 * 1024 * 1024;
const SAVE_SCRIPT = `
local cur = redis.call('HGET', KEYS[1], 'rev')
if not cur then cur = '0' end
if cur ~= ARGV[1] then return {0, cur} end
local nr = tostring(tonumber(cur) + 1)
redis.call('HSET', KEYS[1], 'rev', nr, 'data', ARGV[2], 'updatedAt', ARGV[3])
return {1, nr}`;

module.exports = async function handler(req, res) {
  try {
    if (!config()) return send(res, 503, { error: 'Accounts are not set up on this site yet.' });
    const s = await S.currentSession(req);
    if (!s) return send(res, 401, { error: 'Your session has expired. Please sign in again.' });
    const key = 'progress:' + s.user.id;

    if (req.method === 'GET') {
      const h = hash(await cmd('HGETALL', key)) || {};
      return send(res, 200, { rev: h.rev || '0', data: h.data || null, updatedAt: h.updatedAt ? +h.updatedAt : null });
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      if (!sameOrigin(req)) return send(res, 403, { error: 'Cross-site request blocked' });
      const body = await readBody(req);
      const data = typeof body.data === 'string' ? body.data : JSON.stringify(body.data || {});
      if (data.length > MAX_DATA) return send(res, 413, { error: 'Progress data is too large.' });
      try { JSON.parse(data); } catch (e) { return send(res, 400, { error: 'Invalid progress data' }); }
      const [ok, rev] = await cmd('EVAL', SAVE_SCRIPT, 1, key, String(body.baseRev || '0'), data, Date.now());
      if (+ok === 1) return send(res, 200, { rev: String(rev) });
      const h = hash(await cmd('HGETALL', key)) || {};
      return send(res, 409, { rev: h.rev || '0', data: h.data || null });
    }
    return send(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return send(res, e.status || 500, { error: e.status ? e.message : 'Server error — please try again.' });
  }
};
