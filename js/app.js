/* Boot, hash router, login guard, theme, countdown and user chip.
   Routes look like #/view/param?key=value */
(function (global) {
  'use strict';
  const { $, $$, esc } = U;
  let cleanup = null;
  const PUBLIC = ['login', 'oauth'];
  // Views that are safe to re-render when newer progress arrives from another device
  const LIVE = ['dashboard', 'progress', 'planner', 'topics', 'account'];

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '') || 'dashboard';
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const q = Object.fromEntries(new URLSearchParams(qs || ''));
    return { view: parts[0] || 'dashboard', params: parts.slice(1), q };
  }

  function route() {
    let { view, params, q } = parseHash();
    if (!Auth.user && !PUBLIC.includes(view)) {
      sessionStorage.setItem('pe-after-login', location.hash || '#/dashboard');
      if (location.hash !== '#/login') { location.replace('#/login'); return; }
      view = 'login';
    }
    document.body.classList.toggle('gate', PUBLIC.includes(view));
    const fn = VIEWS[view] || VIEWS.dashboard;
    if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { /* ignore */ } }
    if (global.speechSynthesis) global.speechSynthesis.cancel();
    const el = $('#app');
    el.innerHTML = '';
    el.className = 'main view-' + view;
    try {
      cleanup = fn(el, params, q) || null;
    } catch (err) {
      console.error(err);
      el.innerHTML = `<div class="card"><h2>Something went wrong</h2><pre>${esc(err.stack || err.message)}</pre></div>`;
    }
    $$('.sidebar a').forEach((a) => a.classList.toggle('active', a.dataset.route === view));
    trackView(view, params);
    document.body.classList.remove('nav-open');
    window.scrollTo(0, 0);
    el.focus({ preventScroll: true });
  }

  /* Vercel Web Analytics: report one page view per screen. Routes are grouped (e.g. /topics/[id])
     and contain only page names and content ids — never user details or query strings. */
  let lastTracked = null;
  function trackView(view, params) {
    if (location.protocol === 'file:' || typeof global.va !== 'function') return;
    const path = '/' + [view].concat(params.map(encodeURIComponent)).join('/');
    if (path === lastTracked) return; // ignore re-renders of the same screen
    lastTracked = path;
    const route = '/' + view + (params.length ? '/[id]' : '');
    try { global.va('pageview', { route, path }); } catch (e) { /* analytics must never break the app */ }
  }

  function updateCountdown() {
    const c = $('#countdown');
    const plan = Auth.user && Store.s.plan;
    if (!Auth.user) { c.textContent = ''; return; }
    if (!plan) { c.innerHTML = '<a href="#/planner">Set exam date</a>'; return; }
    const d = U.daysBetween(U.today(), U.parseDate(plan.settings.examDate));
    c.textContent = d > 0 ? `🎯 ${d} days to exam` : d === 0 ? '🎯 Exam day!' : '🎯 Exam complete';
  }
  global.updateCountdown = updateCountdown;

  function updateUserChip() {
    const chip = $('#userChip'), u = Auth.user;
    chip.classList.toggle('hidden', !u);
    updateSyncDot();
    if (!u) return;
    chip.innerHTML = `<span class="avatar">${u.photo ? `<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">` : esc(userInitials(u.name))}</span><span class="uname">${esc(u.name)}</span>`;
    chip.title = u.type === 'cloud' ? `Signed in as ${u.email || u.name} (cloud sync)` : u.type === 'local' ? `${u.name} — profile on this device` : 'Guest on this device';
    updateSyncDot();
  }
  function updateSyncDot() {
    const d = $('#syncDot'), u = Auth.user;
    if (!u || u.type !== 'cloud') { d.className = 'sync-dot hidden'; return; }
    const s = Auth.status;
    d.className = 'sync-dot ' + (s === 'synced' ? 'ok' : s === 'error' || s === 'offline' ? 'bad' : 'busy');
    d.title = s === 'synced' ? 'All progress synced' : s === 'error' ? 'Sync problem: ' + Auth.statusMsg : s === 'offline' ? 'Offline — will sync later' : 'Syncing…';
  }

  function applyTheme() {
    const t = (Auth.user && Store.s.theme) || localStorage.getItem('pe-mdm-prep.theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = t;
  }

  function refresh() {
    applyTheme(); updateCountdown(); updateUserChip();
    const up = $('#navUpgrade');
    if (up) up.classList.toggle('hidden', !Auth.user || global.CONTENT_TIER === 'full' || global.CONTENT_TIER === 'unavailable' || !Auth.cloudEnabled);
  }

  /* Study content is served by /api/content: the full set for subscribers, a free sample otherwise.
     It defines window.NOTES / PROBLEMS / CONCEPTS / FLASHCARDS / CONTENT_TIER / CONTENT_META. */
  const CONTENT_KEYS = ['NOTES', 'PROBLEMS', 'CONCEPTS', 'FLASHCARDS', 'CONTENT_TIER', 'CONTENT_META'];
  let contentLoading = null;
  const wantedTier = () => (Auth.isSubscriber ? 'full' : 'sample');
  function loadContent() {
    if (contentLoading) return contentLoading;
    contentLoading = new Promise((resolve) => {
      CONTENT_KEYS.forEach((k) => { try { delete global[k]; } catch (e) { global[k] = undefined; } });
      const s = document.createElement('script');
      s.src = ((global.APP_CONFIG && APP_CONFIG.apiBase) || '') + '/api/content?t=' + Date.now();
      const finish = () => {
        s.remove();
        if (!Array.isArray(global.PROBLEMS)) { // offline, opened from a file, or server error
          Object.assign(global, { NOTES: {}, PROBLEMS: [], CONCEPTS: [], FLASHCARDS: [], CONTENT_TIER: 'unavailable', CONTENT_META: { totals: {} } });
        }
        if (global.Bank) { Bank._all = null; Bank._by = null; }
        resolve(global.CONTENT_TIER);
      };
      s.onload = finish; s.onerror = finish;
      document.head.appendChild(s);
    }).finally(() => { contentLoading = null; });
    return contentLoading;
  }
  /** Reload content if the user's tier changed (sign in/out, subscribed, subscription ended). */
  async function syncContent() {
    if (global.CONTENT_TIER === 'unavailable' || global.CONTENT_TIER === wantedTier()) return;
    await loadContent();
    refresh();
    // On the login / OAuth screens, don't re-render: they may be showing a one-time recovery code,
    // and they navigate onward themselves (which renders with the new content).
    if (!PUBLIC.includes(parseHash().view)) route();
  }
  global.App = { refresh, route, loadContent, syncContent };

  $('#themeBtn').addEventListener('click', () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('pe-mdm-prep.theme', t); } catch (e) { /* ignore */ }
    if (Auth.user) { Store.s.theme = t; Store.save(); }
    applyTheme();
  });
  $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));

  Auth.onChange((evt) => {
    if (evt === 'user') { refresh(); syncContent(); }
    if (evt === 'access') { refresh(); syncContent(); }
    if (evt === 'sync') updateSyncDot();
    if (evt === 'remote-update') {
      refresh();
      if (LIVE.includes(parseHash().view)) route();
      U.toast('Progress updated from another device');
    }
  });

  // Coming back to the tab after starting a checkout: ask the server (and Polar) for fresh access.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !Auth.user || Auth.user.type !== 'cloud' || Auth.isSubscriber) return;
    const started = +sessionStorage.getItem('pe-checkout-started') || 0;
    if (Date.now() - started < 2 * 60 * 60 * 1000) Auth.refreshAccess(true);
  });

  applyTheme();
  Auth.init().catch(() => {}).then(loadContent).finally(() => {
    refresh();
    window.addEventListener('hashchange', route);
    route();
  });
})(window);
