/* Minimal Upstash Redis REST client (no dependencies).
   Works with the env vars Vercel injects when you connect an Upstash Redis database
   from the Vercel dashboard (KV_REST_API_URL / KV_REST_API_TOKEN, or
   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, or a custom prefix). */
'use strict';

function config() {
  const e = process.env;
  let url = e.UPSTASH_REDIS_REST_URL || e.KV_REST_API_URL;
  let token = e.UPSTASH_REDIS_REST_TOKEN || e.KV_REST_API_TOKEN;
  if (!url || !token) {
    for (const k of Object.keys(e)) {
      if (!url && /(_REST_API_URL|_REDIS_REST_URL)$/.test(k)) url = e[k];
      if (!token && /(_REST_API_TOKEN|_REDIS_REST_TOKEN)$/.test(k) && !/READ_ONLY/.test(k)) token = e[k];
    }
  }
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null;
}

async function call(path, body) {
  const c = config();
  if (!c) { const err = new Error('Database not configured'); err.code = 'NO_DB'; throw err; }
  const r = await fetch(c.url + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
  if (!r.ok && !Array.isArray(j)) throw new Error('Redis error: ' + (j.error || r.status));
  return j;
}

/** Run one command: cmd('SET', 'k', 'v') */
async function cmd(...args) {
  const j = await call('', args.map(String));
  if (j.error) throw new Error('Redis error: ' + j.error);
  return j.result;
}

/** Run several commands in one round trip: pipeline([['GET','a'],['GET','b']]) */
async function pipeline(cmds) {
  const j = await call('/pipeline', cmds.map((c) => c.map(String)));
  return j.map((x) => { if (x.error) throw new Error('Redis error: ' + x.error); return x.result; });
}

/** HGETALL returns a flat [k, v, k, v] array over REST; normalize to an object. */
function hash(result) {
  if (!result) return null;
  if (!Array.isArray(result)) return result;
  if (!result.length) return null;
  const o = {};
  for (let i = 0; i < result.length; i += 2) o[result[i]] = result[i + 1];
  return o;
}

module.exports = { config, cmd, pipeline, hash };
