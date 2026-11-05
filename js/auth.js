/* Authentication & sync.
 *  - Accounts: hosted by this site's own Vercel Functions (/api/auth, /api/progress) backed by
 *    a Redis database connected in the Vercel dashboard. Progress syncs across devices.
 *    Enabled automatically when /api/auth reports a database is connected.
 *  - Device profiles: multiple named profiles stored in this browser, optional PIN.
 *    (A PIN only keeps housemates out of each other's stats — it is not real security.)
 *  - Guest: a single unnamed profile on this device.
 */
(function (global) {
  'use strict';
  const CFG = global.APP_CONFIG || {};
  const API = (CFG.apiBase || '') + '/api';
  const SESSION_KEY = 'pe-mdm-prep.session';
  const PROFILES_KEY = 'pe-mdm-prep.profiles';

  let user = null;          // { type: 'cloud'|'local'|'guest', id, name, email? }
  let cloudEnabled = false, googleEnabled = false;
  let access = null;            // { active, status, currentPeriodEnd, cancelAtPeriodEnd, trialEnd } for online accounts
  let checkoutProductId = null; // product the "Subscribe" button checks out
  let rev = '0';            // server revision of this user's progress
  let status = 'idle';      // idle | pending | syncing | synced | error | offline
  let lastSync = null, lastPull = 0, pushTimer = null, statusMsg = '', inflight = null;
  const listeners = [];
  const emit = (evt) => listeners.forEach((fn) => { try { fn(evt); } catch (e) { console.error(e); } });

  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };

  // ---------------- API helper ----------------
  async function api(path, { method = 'GET', body, timeout = 15000 } = {}) {
    const ctl = global.AbortController ? new AbortController() : null;
    const t = ctl && setTimeout(() => ctl.abort(), timeout);
    let r;
    try {
      r = await fetch(API + path, {
        method, credentials: 'same-origin', cache: 'no-store', signal: ctl && ctl.signal,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (e) {
      throw Object.assign(new Error(navigator.onLine === false ? 'You appear to be offline.' : 'Could not reach the server.'), { code: 'network' });
    } finally { if (t) clearTimeout(t); }
    let j = {};
    try { j = await r.json(); } catch (e) { /* non-JSON (e.g. static host without /api) */ }
    if (!r.ok) throw Object.assign(new Error(j.error || `Request failed (${r.status})`), { status: r.status, data: j });
    return j;
  }

  // ---------------- hashing (for device-profile PINs) ----------------
  async function hash(text) {
    try {
      if (global.crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) { /* fall through */ }
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return 'f' + (h >>> 0).toString(16);
  }
  const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  // ---------------- device profiles ----------------
  function profiles() { return lsGet(PROFILES_KEY, []); }
  function saveProfiles(p) { lsSet(PROFILES_KEY, p); }
  function profileSummary(ns) {
    const d = Store.peek(ns);
    if (!d) return { attempts: 0, lastActive: null, examDate: null };
    return { attempts: (d.attempts || []).length, lastActive: d.lastActive, examDate: d.plan ? d.plan.settings.examDate : null };
  }
  async function createLocal(name, pin) {
    name = String(name || '').trim().slice(0, 40);
    if (!name) throw new Error('Please enter a name.');
    const list = profiles();
    if (list.some((p) => p.name.toLowerCase() === name.toLowerCase())) throw new Error('A profile with that name already exists on this device.');
    const salt = rid();
    const p = { id: rid(), name, salt, pinHash: pin ? await hash(salt + pin) : null, created: Date.now() };
    list.push(p); saveProfiles(list);
    activate({ type: 'local', id: p.id, name: p.name });
    return p;
  }
  async function loginLocal(id, pin) {
    const p = profiles().find((x) => x.id === id);
    if (!p) throw new Error('Profile not found.');
    if (p.pinHash && (await hash(p.salt + (pin || ''))) !== p.pinHash) throw new Error('Incorrect PIN.');
    activate({ type: 'local', id: p.id, name: p.name });
  }
  async function updateLocal(id, { name, pin, removePin }) {
    const list = profiles(), p = list.find((x) => x.id === id);
    if (!p) return;
    if (name) p.name = String(name).trim().slice(0, 40) || p.name;
    if (removePin) p.pinHash = null;
    else if (pin) p.pinHash = await hash(p.salt + pin);
    saveProfiles(list);
    if (user && user.type === 'local' && user.id === id) { user.name = p.name; emit('user'); }
  }
  function deleteLocal(id) {
    saveProfiles(profiles().filter((x) => x.id !== id));
    Store.remove('local:' + id);
    if (user && user.type === 'local' && user.id === id) signOut();
  }
  function loginGuest() { activate({ type: 'guest', id: 'guest', name: 'Guest' }); }

  function nsFor(u) { return u.type === 'guest' ? 'guest' : `${u.type}:${u.id}`; }
  function activate(u) {
    user = u;
    Store.open(nsFor(u));
    lsSet(SESSION_KEY, { type: u.type, id: u.id });
    emit('user');
  }

  // ---------------- cloud accounts ----------------
  function setStatus(s, msg) { status = s; statusMsg = msg || ''; if (s === 'synced') lastSync = Date.now(); emit('sync'); }
  const asCloudUser = (u) => ({ type: 'cloud', id: u.id, name: u.name, email: u.email, hasPassword: u.hasPassword !== false, google: !!u.google });

  function sessionLost() {
    setStatus('error', 'You were signed out (session expired or password changed). Sign in again to keep syncing — your progress is safe on this device.');
  }

  /** Merge server copy into local; returns true if no server copy existed yet. */
  async function pull(initial) {
    if (!user || user.type !== 'cloud') return false;
    if (navigator.onLine === false) { setStatus('offline', 'Offline — changes are saved on this device and will sync later.'); return false; }
    setStatus('syncing');
    try {
      const r = await api('/progress');
      lastPull = Date.now();
      rev = r.rev || '0';
      if (!r.data) { await push(); return true; }
      const remote = JSON.parse(r.data);
      const before = JSON.stringify(Store.s);
      const merged = Store.merge(Store.s, remote);
      const changedLocal = JSON.stringify(merged) !== before;
      Store.replace(merged, true);
      if (JSON.stringify(merged) !== JSON.stringify(Object.assign(Store.defaults(), remote))) await push();
      else setStatus('synced');
      if (changedLocal && !initial) emit('remote-update');
      return false;
    } catch (e) {
      if (e.status === 401) sessionLost();
      else setStatus(e.code === 'network' ? 'offline' : 'error', e.message);
      return false;
    }
  }

  /** Save with optimistic concurrency: on conflict, merge the newer server copy and retry. */
  async function push() {
    clearTimeout(pushTimer); pushTimer = null;
    if (!user || user.type !== 'cloud') return;
    if (inflight) { await inflight; return push(); }
    if (navigator.onLine === false) { setStatus('offline', 'Offline — will sync when you reconnect.'); return; }
    setStatus('syncing');
    inflight = (async () => {
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const r = await api('/progress', { method: 'PUT', body: { baseRev: rev, data: JSON.stringify(Store.s) } });
          rev = r.rev; lastPull = Date.now();
          setStatus('synced');
          return;
        } catch (e) {
          if (e.status === 409 && e.data) {
            rev = e.data.rev || '0';
            if (e.data.data) {
              const before = JSON.stringify(Store.s);
              const merged = Store.merge(Store.s, JSON.parse(e.data.data));
              Store.replace(merged, true);
              if (JSON.stringify(merged) !== before) emit('remote-update');
            }
            continue;
          }
          if (e.status === 401) return sessionLost();
          return setStatus(e.code === 'network' ? 'offline' : 'error', e.message);
        }
      }
      setStatus('error', 'Could not save after several tries — will retry shortly.');
    })();
    try { await inflight; } finally { inflight = null; }
  }
  function schedulePush() {
    if (!user || user.type !== 'cloud') return;
    clearTimeout(pushTimer);
    status = 'pending'; emit('sync');
    pushTimer = setTimeout(push, 2000);
  }

  async function startCloud(u) {
    user = asCloudUser(u);
    Store.open('cloud:' + u.id);
    lsSet(SESSION_KEY, { type: 'cloud', id: u.id });
    rev = '0';
    const isNew = await pull(true);
    await refreshAccess(false);
    emit('user');
    return isNew;
  }

  /** Re-read subscription access from the server (force: ask Polar right now, e.g. after paying). */
  async function refreshAccess(force) {
    try {
      const r = await api('/auth?action=status' + (force ? '&refresh=1' : ''));
      checkoutProductId = r.checkoutProductId || checkoutProductId;
      const before = JSON.stringify(access);
      access = r.user && user && user.type === 'cloud' ? r.access : null;
      if (JSON.stringify(access) !== before) emit('access');
    } catch (e) { /* keep the last known value */ }
    return access;
  }

  async function signUp(email, password, name) {
    const r = await api('/auth?action=signup', { method: 'POST', body: { email, password, name } });
    const isNew = await startCloud(r.user);
    return { isNew, recoveryCode: r.recoveryCode };
  }
  async function signIn(email, password) {
    const r = await api('/auth?action=login', { method: 'POST', body: { email, password } });
    return startCloud(r.user);
  }
  async function recover(email, recoveryCode, password) {
    const r = await api('/auth?action=recover', { method: 'POST', body: { email, recoveryCode, password } });
    await startCloud(r.user);
    return r.recoveryCode;
  }
  async function renameCloud(name) {
    const r = await api('/auth?action=rename', { method: 'POST', body: { name } });
    user.name = r.user.name; emit('user');
  }
  async function changePassword(password, newPassword) {
    await api('/auth?action=change-password', { method: 'POST', body: { password, newPassword } });
  }
  async function newRecoveryCode(password) {
    return (await api('/auth?action=new-recovery', { method: 'POST', body: { password } })).recoveryCode;
  }
  async function setPassword(newPassword) {
    const r = await api('/auth?action=set-password', { method: 'POST', body: { newPassword } });
    user.hasPassword = true; emit('user');
    return r.recoveryCode;
  }
  function googleSignIn() { location.href = API + '/google?start=1'; }
  async function deleteCloudAccount(password) {
    await api('/auth?action=delete', { method: 'POST', body: user.hasPassword ? { password } : { confirm: 'DELETE' } });
    Store.remove('cloud:' + user.id);
    user = null; access = null;
    lsSet(SESSION_KEY, null);
    emit('user');
  }

  async function signOut() {
    if (user && user.type === 'cloud') {
      if (pushTimer) await push();
      try { await api('/auth?action=logout', { method: 'POST' }); } catch (e) { /* ignore */ }
    }
    user = null; access = null;
    lsSet(SESSION_KEY, null);
    emit('user');
  }

  const friendly = (e) => (e && e.message) || 'Something went wrong.';

  // ---------------- boot ----------------
  async function init() {
    Store.onSave(() => schedulePush());
    const sess = lsGet(SESSION_KEY, null);
    let server = null;
    if (location.protocol !== 'file:') {
      try {
        server = await api('/auth?action=status', { timeout: 8000 });
        cloudEnabled = !!server.configured;
        googleEnabled = cloudEnabled && !!server.google;
        checkoutProductId = server.checkoutProductId || null;
      } catch (e) { cloudEnabled = false; }
    }
    // Coming back from Google sign-in always means "use the online account"
    const fromOAuth = /^#\/oauth\?ok=1/.test(location.hash);
    const wantsCloud = fromOAuth || (sess && sess.type === 'cloud');
    if (cloudEnabled && server.user && (wantsCloud || !sess)) {
      // Show cached data immediately, then merge server data in the background
      user = asCloudUser(server.user);
      access = server.access || null;
      Store.open('cloud:' + server.user.id);
      lsSet(SESSION_KEY, { type: 'cloud', id: server.user.id });
      pull(false);
    } else if (wantsCloud) {
      lsSet(SESSION_KEY, null); // server session ended — ask to sign in again
      if (cloudEnabled) statusMsg = 'Your session ended. Please sign in again — progress saved on this device will sync.';
    } else if (sess && sess.type === 'local' && CFG.allowLocalProfiles !== false) {
      const p = profiles().find((x) => x.id === sess.id);
      if (p && !p.pinHash) activate({ type: 'local', id: p.id, name: p.name }); // PIN profiles must re-enter PIN
    } else if (sess && sess.type === 'guest' && CFG.allowLocalProfiles !== false) {
      loginGuest();
    }
    if (cloudEnabled) {
      document.addEventListener('visibilitychange', () => {
        if (!user || user.type !== 'cloud') return;
        if (document.visibilityState === 'visible' && Date.now() - lastPull > 30000) pull(false);
        if (document.visibilityState === 'hidden' && pushTimer) push();
      });
      global.addEventListener('online', () => { if (user && user.type === 'cloud') pull(false); });
      global.addEventListener('pagehide', () => {
        // best-effort save if the tab closes with unsaved changes
        if (pushTimer && user && user.type === 'cloud') {
          try { fetch(API + '/progress', { method: 'PUT', keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ baseRev: rev, data: JSON.stringify(Store.s) }) }); } catch (e) { /* ignore */ }
        }
      });
    }
    return user;
  }

  global.Auth = {
    init, onChange: (fn) => listeners.push(fn),
    get user() { return user; },
    get cloudEnabled() { return cloudEnabled; },
    get googleEnabled() { return googleEnabled; },
    get localAllowed() { return CFG.allowLocalProfiles !== false; },
    get status() { return status; },
    get statusMsg() { return statusMsg; },
    get lastSync() { return lastSync; },
    get access() { return access; },
    get isSubscriber() { return !!(access && access.active); },
    get checkoutProductId() { return checkoutProductId; },
    refreshAccess,
    profiles, profileSummary, createLocal, loginLocal, updateLocal, deleteLocal, loginGuest,
    signUp, signIn, recover, renameCloud, changePassword, newRecoveryCode, setPassword, googleSignIn, deleteCloudAccount, signOut,
    syncNow: () => pull(false), friendly
  };
})(window);
