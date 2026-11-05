/* Paywall helpers and the #/subscribe page. Access itself is decided on the server (/api/content
   serves the full study content only to subscribers); this file is just the UI around it. */
(function (global) {
  'use strict';
  const { $, $$, esc } = U;
  const VIEWS = (global.VIEWS = global.VIEWS || {});
  const SUB = (global.APP_CONFIG && APP_CONFIG.subscription) || { name: 'Full access', price: '', trial: '' };

  const totals = () => (global.CONTENT_META && CONTENT_META.totals) || {};
  const isLocked = () => global.CONTENT_TIER !== 'full';
  const offer = () => [SUB.trial, SUB.trial && SUB.price ? 'then ' + SUB.price : SUB.price].filter(Boolean).join(', ');

  /** Start checkout for an online account, or send guests / device profiles to sign in first. */
  async function subscribe() {
    const u = Auth.user;
    if (!Auth.cloudEnabled) return U.toast('Subscriptions aren’t available on this site yet.');
    if (u && u.type === 'cloud') {
      if (!Auth.checkoutProductId) return U.toast('Checkout is not configured yet.');
      sessionStorage.setItem('pe-checkout-started', String(Date.now()));
      location.href = '/checkout?products=' + encodeURIComponent(Auth.checkoutProductId);
      return;
    }
    // Device profile or guest: a subscription needs an online account.
    sessionStorage.setItem('pe-after-login', '#/subscribe');
    if (u) await Auth.signOut();
    location.hash = '#/login';
  }

  async function recheck(btn) {
    if (btn) { btn.disabled = true; btn.textContent = 'Checking…'; }
    await Auth.refreshAccess(true);
    if (Auth.isSubscriber) U.toast('Subscription active — welcome! 🎉');
    else U.toast('No active subscription found yet. If you just paid, wait a few seconds and try again.');
    if (btn) { btn.disabled = false; btn.textContent = 'Already subscribed? Refresh'; }
  }

  function features() {
    const t = totals();
    return [
      `All ${t.sections || ''} study-note sections for every exam topic`,
      `${t.problems || 'All'} randomized calculation problems + ${t.concepts || 'all'} concept questions`,
      `${t.videos || 'All'} narrated video walkthroughs`,
      'Timed CBT-style practice exams (10–80 questions)',
      `${t.flashcards || 'All'} flashcards and the searchable formula sheet`
    ];
  }

  const cta = (cls = '') => {
    const cloudUser = Auth.user && Auth.user.type === 'cloud';
    return `<div class="row gap wrap ${cls}">
      <button class="btn primary big" data-subscribe>${cloudUser ? `⭐ Start ${esc(SUB.trial || 'subscription')}` : '⭐ Create an account to subscribe'}</button>
      ${cloudUser ? '<button class="btn ghost" data-recheck>Already subscribed? Refresh</button>' : ''}
    </div>`;
  };

  const Paywall = {
    isLocked,
    /** Full-size card that replaces a premium screen. */
    card(title) {
      return `<div class="card paywall">
        <div class="paywall-badge">⭐ Full access</div>
        <h2>${esc(title || 'This is part of full access')}</h2>
        <p class="muted">${esc(SUB.name)}${offer() ? ' — ' + esc(offer()) : ''}. Cancel anytime.</p>
        <ul class="paywall-list">${features().map((f) => `<li>✓ ${esc(f)}</li>`).join('')}</ul>
        ${cta()}
      </div>`;
    },
    /** Slim banner shown above sample content. */
    banner(text) {
      return `<div class="paywall-banner"><span>🔓 ${text}</span><button class="btn small primary" data-subscribe>Unlock everything</button></div>`;
    },
    /** Replace a premium view with the paywall card. Returns true if the view is locked. */
    gate(el, title) {
      if (!isLocked()) return false;
      el.innerHTML = Paywall.card(title);
      Paywall.bind(el);
      return true;
    },
    bind(root) {
      $$('[data-subscribe]', root).forEach((b) => b.addEventListener('click', subscribe));
      $$('[data-recheck]', root).forEach((b) => b.addEventListener('click', () => recheck(b)));
    },
    subscribe, recheck
  };
  global.Paywall = Paywall;

  VIEWS.subscribe = function (el) {
    if (!isLocked() && Auth.isSubscriber) {
      el.innerHTML = `<div class="card paywall"><h2>✅ You have full access</h2><p class="muted">Thanks for subscribing! Everything is unlocked.</p>
        <div class="row gap"><a class="btn primary" href="#/dashboard">Go to dashboard</a><a class="btn" href="#/account">Subscription details</a></div></div>`;
      return;
    }
    if (!isLocked()) { // comp access
      el.innerHTML = `<div class="card paywall"><h2>✅ You have full access</h2><p class="muted">Your account has complimentary access.</p><a class="btn primary" href="#/dashboard">Go to dashboard</a></div>`;
      return;
    }
    el.innerHTML = `<div class="page-head"><h1>⭐ Get full access</h1>
      <p class="muted">You’re using the free sample. Subscribe to unlock everything for your PE Mechanical MDM prep.</p></div>
      ${Paywall.card('Everything you need to pass the PE MDM exam')}
      <p class="muted small">Payments are handled securely by Polar. You’ll get an email with a link to manage or cancel your subscription anytime.</p>`;
    Paywall.bind(el);
  };
})(window);
