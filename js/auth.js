/* Authentication & sync.
 *  - Cloud accounts: Firebase Auth (email/password, Google) + Firestore (one doc per user).
 *    Enabled only when APP_CONFIG.firebase is set. Progress syncs across devices.
 *  - Device profiles: multiple named profiles stored in this browser, optional PIN.
 *    (A PIN only keeps housemates out of each other's stats — it is not real security.)
 *  - Guest: a single unnamed profile on this device.
 */
(function (global) {
  'use strict';
  const CFG = global.APP_CONFIG || {};
  const SESSION_KEY = 'pe-mdm-prep.session';
  const PROFILES_KEY = 'pe-mdm-prep.profiles';
  const FB_VER = '10.12.2';

  let user = null;          // { type: 'cloud'|'local'|'guest', id, name, email? }
  let fb = null;            // { auth, db }
  let status = 'idle';      // idle | syncing | synced | error | offline
  let lastSync = null, lastPull = 0, pushTimer = null, statusMsg = '';
  const listeners = [];
  const emit = (evt) => listeners.forEach((fn) => { try { fn(evt); } catch (e) { console.error(e); } });

  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };

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

  // ---------------- Firebase (cloud) ----------------
  const cloudEnabled = !!(CFG.firebase && CFG.firebase.apiKey);
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  }
  async function initFirebase() {
    if (fb) return fb;
    const base = `https://www.gstatic.com/firebasejs/${FB_VER}/`;
    await loadScript(base + 'firebase-app-compat.js');
    await Promise.all([loadScript(base + 'firebase-auth-compat.js'), loadScript(base + 'firebase-firestore-compat.js')]);
    const app = global.firebase.apps.length ? global.firebase.app() : global.firebase.initializeApp(CFG.firebase);
    fb = { auth: app.auth(), db: app.firestore() };
    return fb;
  }
  const userDoc = () => fb.db.collection('users').doc(user.id);

  function setStatus(s, msg) { status = s; statusMsg = msg || ''; if (s === 'synced') lastSync = Date.now(); emit('sync'); }

  async function activateCloud(fu) {
    user = { type: 'cloud', id: fu.uid, name: fu.displayName || (fu.email || '').split('@')[0] || 'Student', email: fu.email, photo: fu.photoURL };
    Store.open('cloud:' + fu.uid);
    lsSet(SESSION_KEY, { type: 'cloud', id: fu.uid });
    const isNew = await pull(true);
    emit('user');
    return isNew;
  }

  /** Pull the cloud copy and merge it in. Returns true if no cloud copy existed yet. */
  async function pull(initial) {
    if (!user || user.type !== 'cloud' || !fb) return false;
    if (!navigator.onLine) { setStatus('offline', 'Offline — changes are saved on this device and will sync later.'); return false; }
    setStatus('syncing');
    try {
      const snap = await userDoc().get();
      lastPull = Date.now();
      if (!snap.exists) { await push(); return true; }
      const remote = JSON.parse(snap.data().data || '{}');
      const before = JSON.stringify(Store.s);
      const merged = Store.merge(Store.s, remote);
      const changedLocal = JSON.stringify(merged) !== before;
      Store.replace(merged, true);
      if (JSON.stringify(merged) !== JSON.stringify(Object.assign(Store.defaults(), remote))) await push();
      else setStatus('synced');
      if (changedLocal && !initial) emit('remote-update');
      return false;
    } catch (e) {
      console.error(e);
      setStatus('error', friendly(e));
      return false;
    }
  }
  /** Read-merge-write so two devices saving at nearly the same time never overwrite each other. */
  async function push() {
    clearTimeout(pushTimer); pushTimer = null;
    if (!user || user.type !== 'cloud' || !fb) return;
    if (!navigator.onLine) { setStatus('offline', 'Offline — will sync when you reconnect.'); return; }
    setStatus('syncing');
    try {
      const snap = await userDoc().get();
      if (snap.exists) {
        const remote = JSON.parse(snap.data().data || '{}');
        const before = JSON.stringify(Store.s);
        const merged = Store.merge(Store.s, remote);
        if (JSON.stringify(merged) !== before) { Store.replace(merged, true); emit('remote-update'); }
      }
      await userDoc().set({
        data: JSON.stringify(Store.s),
        name: user.name || '', email: user.email || '',
        updatedAt: global.firebase.firestore.FieldValue.serverTimestamp()
      });
      lastPull = Date.now();
      setStatus('synced');
    } catch (e) {
      console.error(e);
      setStatus('error', friendly(e));
    }
  }
  function schedulePush() {
    if (!user || user.type !== 'cloud') return;
    clearTimeout(pushTimer);
    status = 'pending'; emit('sync');
    pushTimer = setTimeout(push, 2500);
  }

  function friendly(e) {
    const code = (e && e.code) || '';
    const map = {
      'auth/invalid-credential': 'Email or password is incorrect.',
      'auth/invalid-login-credentials': 'Email or password is incorrect.',
      'auth/wrong-password': 'Email or password is incorrect.',
      'auth/user-not-found': 'No account found with that email.',
      'auth/email-already-in-use': 'An account with that email already exists — try signing in.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'That email address doesn’t look right.',
      'auth/missing-password': 'Please enter a password.',
      'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
      'auth/network-request-failed': 'Network error — check your connection.',
      'auth/popup-closed-by-user': 'Sign-in window was closed.',
      'auth/popup-blocked': 'Your browser blocked the sign-in pop-up. Allow pop-ups for this site and try again.',
      'auth/unauthorized-domain': 'This website’s domain isn’t authorized in Firebase (Authentication → Settings → Authorized domains).',
      'auth/operation-not-allowed': 'This sign-in method isn’t enabled in the Firebase console.',
      'auth/requires-recent-login': 'For security, please sign out and sign back in, then try again.',
      'permission-denied': 'The cloud database refused access — check the Firestore security rules in README.md.',
      unavailable: 'Cloud database unavailable — you may be offline.'
    };
    return map[code] || (e && e.message) || 'Something went wrong.';
  }

  async function signUp(email, password, name) {
    await initFirebase();
    const cred = await fb.auth.createUserWithEmailAndPassword(String(email).trim(), password);
    if (name) { try { await cred.user.updateProfile({ displayName: String(name).trim().slice(0, 40) }); } catch (e) { /* non-fatal */ } }
    return activateCloud(fb.auth.currentUser || cred.user);
  }
  async function signIn(email, password) {
    await initFirebase();
    const cred = await fb.auth.signInWithEmailAndPassword(String(email).trim(), password);
    return activateCloud(cred.user);
  }
  async function signInGoogle() {
    await initFirebase();
    const cred = await fb.auth.signInWithPopup(new global.firebase.auth.GoogleAuthProvider());
    return activateCloud(cred.user);
  }
  async function resetPassword(email) {
    await initFirebase();
    await fb.auth.sendPasswordResetEmail(String(email).trim());
  }
  async function renameCloud(name) {
    if (!fb || !fb.auth.currentUser) return;
    await fb.auth.currentUser.updateProfile({ displayName: name });
    user.name = name; emit('user'); schedulePush();
  }
  async function deleteCloudAccount() {
    if (!fb || !fb.auth.currentUser) return;
    await userDoc().delete();
    await fb.auth.currentUser.delete();
    Store.remove('cloud:' + user.id);
    user = null;
    lsSet(SESSION_KEY, null);
    emit('user');
  }

  async function signOut() {
    if (user && user.type === 'cloud' && fb) {
      if (pushTimer) await push();
      try { await fb.auth.signOut(); } catch (e) { /* ignore */ }
    }
    user = null;
    lsSet(SESSION_KEY, null);
    emit('user');
  }

  // ---------------- boot ----------------
  async function init() {
    Store.onSave(() => schedulePush());
    const sess = lsGet(SESSION_KEY, null);
    if (cloudEnabled && sess && sess.type === 'cloud') {
      try {
        await initFirebase();
        const fu = await new Promise((res) => {
          const off = fb.auth.onAuthStateChanged((u) => { off(); res(u); });
          setTimeout(() => res(fb.auth.currentUser), 8000);
        });
        if (fu) {
          // Show cached data immediately, then merge cloud data in the background
          user = { type: 'cloud', id: fu.uid, name: fu.displayName || (fu.email || '').split('@')[0], email: fu.email, photo: fu.photoURL };
          Store.open('cloud:' + fu.uid);
          pull(false);
        }
      } catch (e) {
        console.error(e);
        statusMsg = 'Could not reach the sign-in service. ' + friendly(e);
      }
    } else if (sess && sess.type === 'local' && CFG.allowLocalProfiles !== false) {
      const p = profiles().find((x) => x.id === sess.id);
      if (p && !p.pinHash) activate({ type: 'local', id: p.id, name: p.name }); // PIN profiles must re-enter PIN
    } else if (sess && sess.type === 'guest' && CFG.allowLocalProfiles !== false) {
      loginGuest();
    }
    if (cloudEnabled) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && user && user.type === 'cloud' && Date.now() - lastPull > 30000) pull(false);
        if (document.visibilityState === 'hidden' && pushTimer) push();
      });
      global.addEventListener('online', () => { if (user && user.type === 'cloud') pull(false); });
    }
    return user;
  }

  global.Auth = {
    init, onChange: (fn) => listeners.push(fn),
    get user() { return user; },
    get cloudEnabled() { return cloudEnabled; },
    get localAllowed() { return CFG.allowLocalProfiles !== false; },
    get googleEnabled() { return cloudEnabled && CFG.googleSignIn !== false; },
    get status() { return status; },
    get statusMsg() { return statusMsg; },
    get lastSync() { return lastSync; },
    profiles, profileSummary, createLocal, loginLocal, updateLocal, deleteLocal, loginGuest,
    signUp, signIn, signInGoogle, resetPassword, renameCloud, deleteCloudAccount, signOut,
    syncNow: () => pull(false), friendly
  };
})(window);
