/* GET /api/content — the study-content script for the current visitor.
   Subscribers (and FREE_ACCESS_EMAILS accounts) get the full content; everyone else, including guests
   and device profiles, gets the free sample. Loaded by the app with <script src="/api/content">. */
'use strict';
const { config } = require('./_lib/redis');
const S = require('./_lib/session');
const A = require('./_lib/access');
const C = require('./_lib/content');

module.exports = async function handler(req, res) {
  let tier = 'sample';
  try {
    if (config()) {
      const s = await S.currentSession(req);
      // The status endpoint already refreshed access from Polar if needed; don't call Polar again here
      // unless there's no record at all yet.
      if (s && (await A.getAccess(s.user, { refresh: (await A.read(s.user.id)) ? 'never' : 'auto' })).active) tier = 'full';
    }
  } catch (e) {
    console.error('Access check failed; serving sample content', e);
  }
  let body;
  try {
    body = C.build()[tier];
  } catch (e) {
    console.error('Content build failed', e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    return res.end('window.CONTENT_TIER = "error";');
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Cookie');
  res.end(body);
};
