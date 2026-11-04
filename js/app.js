/* Hash router, theme, countdown. Routes look like #/view/param?key=value */
(function (global) {
  'use strict';
  const { $, $$ } = U;
  let cleanup = null;

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '') || 'dashboard';
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const q = Object.fromEntries(new URLSearchParams(qs || ''));
    return { view: parts[0] || 'dashboard', params: parts.slice(1), q };
  }

  function route() {
    const { view, params, q } = parseHash();
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
      el.innerHTML = `<div class="card"><h2>Something went wrong</h2><pre>${U.esc(err.stack || err.message)}</pre></div>`;
    }
    $$('.sidebar a').forEach((a) => a.classList.toggle('active', a.dataset.route === view));
    document.body.classList.remove('nav-open');
    window.scrollTo(0, 0);
    el.focus({ preventScroll: true });
  }

  function updateCountdown() {
    const c = $('#countdown');
    const plan = Store.s.plan;
    if (!plan) { c.innerHTML = '<a href="#/planner">Set exam date</a>'; return; }
    const d = U.daysBetween(U.today(), U.parseDate(plan.settings.examDate));
    c.textContent = d > 0 ? `🎯 ${d} days to exam` : d === 0 ? '🎯 Exam day!' : '🎯 Exam complete';
  }
  global.updateCountdown = updateCountdown;

  function applyTheme() {
    const t = Store.s.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = t;
  }

  $('#themeBtn').addEventListener('click', () => {
    Store.s.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    Store.save(); applyTheme();
  });
  $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));

  applyTheme();
  updateCountdown();
  window.addEventListener('hashchange', route);
  route();
})(window);
