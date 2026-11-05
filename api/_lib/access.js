/* Subscription access ("entitlements"). One Redis record per app user:
     access:<userId>  JSON { active, status, productId, currentPeriodEnd, cancelAtPeriodEnd, trialEnd,
                             polarCustomerId, source, eventTs, checkedAt, updatedAt }
   Polar customers are linked to app users via external_customer_id = app user id (set at checkout).
   Sources of truth, in order: customer.state_changed webhook → order.paid webhook (provisional) →
   a direct Polar lookup (customers.getStateExternal) when the record is missing or stale.
   Env:
     POLAR_PRODUCT_IDS   comma-separated product ids that grant access (default: Monthly Subscription)
     FREE_ACCESS_EMAILS  comma-separated emails that always have access (comp / admin accounts) */
'use strict';
const { cmd } = require('./redis');

const DEFAULT_PRODUCT_IDS = ['8a2628e9-5ac5-4791-9977-10e359d778bc']; // Monthly Subscription
const ACTIVE_STATUSES = ['active', 'trialing'];
const STALE_ACTIVE_MS = 6 * 60 * 60 * 1000;   // re-check active subscribers with Polar every 6 h
const STALE_INACTIVE_MS = 15 * 60 * 1000;     // and non-subscribers every 15 min (missed webhooks)

const list = (v) => String(v || '').split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
const productIds = () => (process.env.POLAR_PRODUCT_IDS ? list(process.env.POLAR_PRODUCT_IDS) : DEFAULT_PRODUCT_IDS);
const isCompEmail = (email) => !!email && list(process.env.FREE_ACCESS_EMAILS).map((e) => e.toLowerCase()).includes(String(email).toLowerCase());

/** Derive access from a Polar CustomerState (webhook payload or getStateExternal response). */
function fromCustomerState(state) {
  const subs = (Array.isArray(state && state.active_subscriptions) ? state.active_subscriptions : [])
    .filter((s) => s && productIds().includes(s.product_id) && ACTIVE_STATUSES.includes(s.status))
    .sort((a, b) => Date.parse(b.current_period_end || 0) - Date.parse(a.current_period_end || 0));
  const s = subs[0];
  return {
    active: !!s,
    status: s ? s.status : 'none',
    productId: s ? s.product_id : null,
    currentPeriodEnd: s ? s.current_period_end || null : null,
    cancelAtPeriodEnd: s ? !!s.cancel_at_period_end : false,
    trialEnd: s ? s.trial_end || null : null,
    polarCustomerId: state && typeof state.id === 'string' ? state.id : null
  };
}

async function read(userId) {
  const raw = await cmd('GET', 'access:' + userId);
  try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
async function write(userId, rec) {
  await cmd('SET', 'access:' + userId, JSON.stringify(Object.assign({}, rec, { updatedAt: Date.now() })));
}
async function remove(userId) { await cmd('DEL', 'access:' + userId); }

/** Ask Polar directly (handles missed or delayed webhooks). */
async function refreshFromPolar(userId) {
  const { getPolar } = await import('./polar.mjs');
  let rec;
  try {
    rec = fromCustomerState(await getPolar().customers.getStateExternal(userId));
  } catch (e) {
    if (e && e.statusCode === 404) rec = fromCustomerState(null); // not a Polar customer yet
    else throw e;
  }
  rec.source = 'polar';
  rec.checkedAt = Date.now();
  const prev = await read(userId);
  if (prev && prev.eventTs) rec.eventTs = prev.eventTs;
  await write(userId, rec);
  return rec;
}

/** Public view sent to the browser. */
function view(rec, comp) {
  if (comp) return { active: true, status: 'comp' };
  if (!rec) return { active: false, status: 'none' };
  return {
    active: !!rec.active, status: rec.status || 'none',
    currentPeriodEnd: rec.currentPeriodEnd || null, cancelAtPeriodEnd: !!rec.cancelAtPeriodEnd, trialEnd: rec.trialEnd || null
  };
}

/** Access for a signed-in user. refresh: 'auto' (re-check Polar when stale), 'force', or 'never'. */
async function getAccess(user, { refresh = 'auto' } = {}) {
  if (isCompEmail(user.email)) return view(null, true);
  let rec = await read(user.id);
  const age = rec ? Date.now() - (rec.checkedAt || 0) : Infinity;
  const stale = !rec || age > (rec.active ? STALE_ACTIVE_MS : STALE_INACTIVE_MS) ||
    (rec.active && rec.currentPeriodEnd && Date.parse(rec.currentPeriodEnd) < Date.now() && age > 5 * 60 * 1000);
  if (refresh !== 'never' && (refresh === 'force' || stale) && process.env.POLAR_ACCESS_TOKEN) {
    try { rec = await refreshFromPolar(user.id); } catch (e) { console.error('Polar access refresh failed', e && (e.statusCode || e.message)); }
  }
  return view(rec);
}

module.exports = { productIds, isCompEmail, fromCustomerState, read, write, remove, refreshFromPolar, getAccess };
