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
    document.body.classList.remove('nav-open');
    window.scrollTo(0, 0);
    el.focus({ preventScroll: true });
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

  function refresh() { applyTheme(); updateCountdown(); updateUserChip(); }
  global.App = { refresh, route };

  $('#themeBtn').addEventListener('click', () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('pe-mdm-prep.theme', t); } catch (e) { /* ignore */ }
    if (Auth.user) { Store.s.theme = t; Store.save(); }
    applyTheme();
  });
  $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));

  Auth.onChange((evt) => {
    if (evt === 'user') refresh();
    if (evt === 'sync') updateSyncDot();
    if (evt === 'remote-update') {
      refresh();
      if (LIVE.includes(parseHash().view)) route();
      U.toast('Progress updated from another device');
    }
  });

  applyTheme();
  Auth.init().finally(() => {
    refresh();
    window.addEventListener('hashchange', route);
    route();
  });
})(window);
