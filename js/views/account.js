/* Login screen (#/login) and account page (#/account). */
(function (global) {
  'use strict';
  const { $, $$, esc } = U;
  const VIEWS = (global.VIEWS = global.VIEWS || {});

  function rel(ts) {
    if (!ts) return 'never';
    const d = Math.round((Date.now() - ts) / 60000);
    if (d < 1) return 'just now';
    if (d < 60) return d + ' min ago';
    if (d < 1440) return Math.round(d / 60) + ' h ago';
    return Math.round(d / 1440) + ' days ago';
  }
  const initials = (n) => String(n || '?').trim().split(/\s+/).map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  global.userInitials = initials;

  /** After creating a brand-new account/profile, offer to bring over guest progress. */
  function offerGuestImport() {
    const g = Store.peek('guest');
    if (!g || !(g.attempts || []).length && !g.plan) return;
    if (Store.key && Store.key.endsWith(':guest')) return;
    if (confirm(`Found progress from the Guest profile on this device (${(g.attempts || []).length} attempts${g.plan ? ', a study plan' : ''}).\n\nCopy it into your new account?`)) {
      Store.replace(Store.merge(Store.s, g));
      Store.save();
      U.toast('Guest progress imported');
    }
  }

  function done() {
    const back = sessionStorage.getItem('pe-after-login');
    sessionStorage.removeItem('pe-after-login');
    location.hash = back && !/login/.test(back) ? back : '#/dashboard';
    global.App && App.refresh();
  }

  VIEWS.login = function (el) {
    if (Auth.user) { location.hash = '#/dashboard'; return; }
    const cloud = Auth.cloudEnabled, local = Auth.localAllowed;
    let tab = cloud ? 'cloud' : 'device';
    let mode = 'signin'; // signin | signup | reset

    el.innerHTML = `
      <div class="login-wrap">
        <section class="login-hero">
          <div class="brand-mark xl">PE</div>
          <h1>Machine Design &amp; Materials<br><span>exam prep</span></h1>
          <ul class="login-points">
            <li>🗓️ A personal study timeline to your exam date</li>
            <li>✏️ Unlimited randomized practice problems with solutions</li>
            <li>▶️ Narrated video walkthroughs</li>
            <li>⏱️ Timed CBT-style practice exams</li>
            <li>📈 Progress tracking for every topic</li>
          </ul>
          ${Auth.statusMsg ? `<div class="callout warn">${esc(Auth.statusMsg)}</div>` : ''}
        </section>
        <section class="card login-card">
          <div class="tabs">
            <button class="tab" data-tab="cloud">☁️ Account</button>
            ${local ? '<button class="tab" data-tab="device">💻 This device</button>' : ''}
          </div>
          <div id="tabBody"></div>
        </section>
      </div>`;

    const body = $('#tabBody', el);
    const setTab = (t) => { tab = t; $$('.tab', el).forEach((b) => b.classList.toggle('active', b.dataset.tab === t)); render(); };
    $$('.tab', el).forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));

    function busy(btn, on, label) { btn.disabled = on; if (label) btn.textContent = on ? 'Please wait…' : label; }
    function err(msg) { const e = $('#authErr', el); e.innerHTML = msg ? `<div class="fb bad">${esc(msg)}</div>` : ''; }

    function render() {
      if (tab === 'cloud') return renderCloud();
      renderDevice();
    }

    function renderCloud() {
      if (!cloud) {
        body.innerHTML = `
          <h2>Sign in</h2>
          <p class="muted">Cloud accounts (sync across phone, laptop and work computer) aren’t switched on for this site yet.</p>
          <div class="callout"><b>Site owner:</b> follow “Setting up user accounts” in <code>README.md</code> — it takes about 10 minutes with a free Firebase project, then paste the config into <code>js/config.js</code>.</div>
          ${local ? '<button class="btn primary" id="goDevice">Use a profile on this device instead →</button>' : ''}`;
        const g = $('#goDevice', el); if (g) g.addEventListener('click', () => setTab('device'));
        return;
      }
      body.innerHTML = `
        <h2>${mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset password' : 'Welcome back'}</h2>
        <p class="muted small">${mode === 'signup' ? 'Your progress will sync to every device you sign in on.' : mode === 'reset' ? 'We’ll email you a link to set a new password.' : 'Sign in to pick up where you left off.'}</p>
        ${Auth.googleEnabled && mode !== 'reset' ? `<button class="btn big full google" id="google"><span class="g">G</span> Continue with Google</button><div class="or"><span>or</span></div>` : ''}
        <form id="cf" class="auth-form" novalidate>
          ${mode === 'signup' ? '<label>Name<input id="cn" type="text" autocomplete="name" placeholder="Your name"></label>' : ''}
          <label>Email<input id="ce" type="email" autocomplete="email" required placeholder="you@example.com"></label>
          ${mode !== 'reset' ? `<label>Password<input id="cp" type="password" autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" required minlength="6" placeholder="${mode === 'signup' ? 'At least 6 characters' : ''}"></label>` : ''}
          <div id="authErr"></div>
          <button class="btn primary big full" id="csub" type="submit">${mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</button>
        </form>
        <div class="auth-links">
          ${mode === 'signin' ? '<a href="javascript:void 0" data-mode="signup">Create an account</a><a href="javascript:void 0" data-mode="reset">Forgot password?</a>' : '<a href="javascript:void 0" data-mode="signin">← Back to sign in</a>'}
        </div>`;
      $$('[data-mode]', el).forEach((a) => a.addEventListener('click', () => { mode = a.dataset.mode; renderCloud(); }));
      const g = $('#google', el);
      if (g) g.addEventListener('click', async () => {
        busy(g, true); err('');
        try { const isNew = await Auth.signInGoogle(); if (isNew) offerGuestImport(); done(); }
        catch (e) { err(Auth.friendly(e)); busy(g, false); g.innerHTML = '<span class="g">G</span> Continue with Google'; }
      });
      $('#cf', el).addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = $('#csub', el), label = btn.textContent;
        const email = $('#ce', el).value, pw = $('#cp', el) ? $('#cp', el).value : '';
        if (!email) return err('Please enter your email.');
        busy(btn, true, label); err('');
        try {
          if (mode === 'reset') { await Auth.resetPassword(email); body.querySelector('#authErr').innerHTML = '<div class="fb ok">Check your inbox for a reset link.</div>'; busy(btn, false, label); return; }
          const isNew = mode === 'signup' ? await Auth.signUp(email, pw, $('#cn', el).value) : await Auth.signIn(email, pw);
          if (isNew) offerGuestImport();
          done();
        } catch (ex) { err(Auth.friendly(ex)); busy(btn, false, label); }
      });
    }

    function renderDevice() {
      const list = Auth.profiles();
      body.innerHTML = `
        <h2>Profiles on this device</h2>
        <p class="muted small">Progress stays in this browser only. Great for a shared home computer.${cloud ? ' Use ☁️ Account to sync between devices.' : ''}</p>
        <div class="profile-list">${list.map((p) => {
          const s = Auth.profileSummary('local:' + p.id);
          return `<button class="profile" data-id="${p.id}"><span class="avatar">${esc(initials(p.name))}</span>
            <span class="pinfo"><b>${esc(p.name)} ${p.pinHash ? '<span title="PIN protected">🔒</span>' : ''}</b><small class="muted">${s.attempts} problems · active ${rel(s.lastActive)}</small></span><span>→</span></button>`;
        }).join('') || '<p class="muted small">No profiles yet.</p>'}</div>
        <div id="pinBox"></div>
        <details class="new-profile" ${list.length ? '' : 'open'}><summary>＋ Create a new profile</summary>
          <form id="lf" class="auth-form">
            <label>Name<input id="ln" type="text" maxlength="40" placeholder="e.g. Alex" required></label>
            <label>PIN (optional)<input id="lp" type="password" inputmode="numeric" maxlength="12" placeholder="4+ digits, keeps others out of your profile"></label>
            <button class="btn primary full" type="submit">Create profile</button>
          </form></details>
        <div id="authErr"></div>
        <div class="or"><span>or</span></div>
        <button class="btn full" id="guest">Continue as guest</button>`;
      $$('.profile', el).forEach((b) => b.addEventListener('click', async () => {
        const p = list.find((x) => x.id === b.dataset.id);
        if (!p.pinHash) { await Auth.loginLocal(p.id); return done(); }
        $('#pinBox', el).innerHTML = `<form id="pf2" class="auth-form inline"><label>PIN for ${esc(p.name)}<input id="pin" type="password" inputmode="numeric" autofocus></label><button class="btn primary" type="submit">Unlock</button></form>`;
        $('#pin', el).focus();
        $('#pf2', el).addEventListener('submit', async (e) => {
          e.preventDefault();
          try { await Auth.loginLocal(p.id, $('#pin', el).value); done(); } catch (ex) { err(ex.message); }
        });
      }));
      $('#lf', el).addEventListener('submit', async (e) => {
        e.preventDefault();
        const pin = $('#lp', el).value.trim();
        if (pin && pin.length < 4) return err('PIN must be at least 4 characters.');
        try { await Auth.createLocal($('#ln', el).value, pin); offerGuestImport(); done(); } catch (ex) { err(ex.message); }
      });
      $('#guest', el).addEventListener('click', () => { Auth.loginGuest(); done(); });
    }

    setTab(tab);
  };

  VIEWS.account = function (el) {
    const u = Auth.user;
    if (!u) { location.hash = '#/login'; return; }
    const typeLabel = u.type === 'cloud' ? '☁️ Cloud account — syncs across devices' : u.type === 'local' ? '💻 Profile on this device' : '👤 Guest on this device';
    const prof = u.type === 'local' ? Auth.profiles().find((p) => p.id === u.id) : null;
    const st = Store.s;
    el.innerHTML = `
      <div class="page-head"><h1>👤 Account</h1></div>
      <div class="card account-head">
        <span class="avatar xl">${u.photo ? `<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">` : esc(initials(u.name))}</span>
        <div><h2>${esc(u.name)}</h2><p class="muted">${u.email ? esc(u.email) + ' · ' : ''}${typeLabel}</p>
        <p class="small">${st.attempts.length} problems attempted · ${st.exams.length} practice exams · last active ${rel(st.lastActive)}</p></div>
      </div>
      ${u.type === 'cloud' ? `
      <div class="card"><div class="card-head"><h2>Sync</h2><span id="syncPill"></span></div>
        <p class="muted small">Progress saves to this device instantly and to the cloud a few seconds later. When you open the site on another device, the two copies are merged — nothing you studied on either is lost.</p>
        <button class="btn" id="syncNow">🔄 Sync now</button></div>` : ''}
      ${u.type === 'guest' ? `
      <div class="card"><h2>Save your progress to a profile</h2>
        <p class="muted">Guest progress lives only in this browser. ${Auth.cloudEnabled ? 'Create an account to sync it across devices — you’ll be offered to copy guest progress over.' : 'Create a named profile so others on this device can have their own.'}</p>
        <button class="btn primary" id="toLogin">${Auth.cloudEnabled ? 'Create account / sign in' : 'Create a profile'}</button></div>` : `
      <div class="card"><h2>Profile</h2>
        <form id="rn" class="auth-form inline"><label>Display name<input id="rnv" type="text" maxlength="40" value="${esc(u.name)}"></label><button class="btn" type="submit">Save</button></form>
        ${u.type === 'local' ? `<form id="pinf" class="auth-form inline"><label>${prof && prof.pinHash ? 'Change PIN' : 'Add a PIN'}<input id="pinv" type="password" inputmode="numeric" maxlength="12" placeholder="4+ digits"></label><button class="btn" type="submit">Save PIN</button>
          ${prof && prof.pinHash ? '<button class="btn ghost" type="button" id="rmPin">Remove PIN</button>' : ''}</form>` : ''}
      </div>`}
      <div class="card"><h2>Session</h2><div class="row gap wrap">
        <button class="btn" id="switch">🔁 Switch user</button>
        <button class="btn" id="signout">↩ Sign out</button>
        <a class="btn" href="#/progress">⬇ Backup / import data</a>
      </div></div>
      ${u.type !== 'guest' ? `<div class="card danger-zone"><h2>Danger zone</h2>
        <p class="muted small">${u.type === 'cloud' ? 'Permanently deletes your account and all synced progress.' : 'Deletes this profile and its progress from this device.'}</p>
        <button class="btn danger" id="del">Delete ${u.type === 'cloud' ? 'account' : 'profile'}</button></div>` : ''}`;

    const pill = () => {
      const p = $('#syncPill', el); if (!p) return;
      const s = Auth.status;
      p.className = 'pill ' + (s === 'synced' ? 'good' : s === 'error' || s === 'offline' ? 'warn' : '');
      p.textContent = s === 'synced' ? `✓ Synced ${rel(Auth.lastSync)}` : s === 'syncing' || s === 'pending' ? 'Syncing…' : s === 'error' ? '⚠ ' + Auth.statusMsg : s === 'offline' ? 'Offline' : 'Not synced yet';
    };
    pill();
    const off = setInterval(pill, 2000);
    const sn = $('#syncNow', el); if (sn) sn.addEventListener('click', async () => { await Auth.syncNow(); pill(); U.toast(Auth.status === 'synced' ? 'Synced ✓' : Auth.statusMsg || 'Sync attempted'); });
    const tl = $('#toLogin', el); if (tl) tl.addEventListener('click', async () => { sessionStorage.setItem('pe-after-login', '#/dashboard'); await Auth.signOut(); location.hash = '#/login'; });
    const rn = $('#rn', el); if (rn) rn.addEventListener('submit', async (e) => {
      e.preventDefault(); const v = $('#rnv', el).value.trim(); if (!v) return;
      try { if (u.type === 'cloud') await Auth.renameCloud(v); else await Auth.updateLocal(u.id, { name: v }); U.toast('Name updated'); VIEWS.account(el); } catch (ex) { U.toast(Auth.friendly(ex)); }
    });
    const pf = $('#pinf', el); if (pf) pf.addEventListener('submit', async (e) => {
      e.preventDefault(); const v = $('#pinv', el).value.trim();
      if (v.length < 4) return U.toast('PIN must be at least 4 characters');
      await Auth.updateLocal(u.id, { pin: v }); U.toast('PIN saved'); VIEWS.account(el);
    });
    const rp = $('#rmPin', el); if (rp) rp.addEventListener('click', async () => { await Auth.updateLocal(u.id, { removePin: true }); U.toast('PIN removed'); VIEWS.account(el); });
    $('#switch', el).addEventListener('click', async () => { await Auth.signOut(); location.hash = '#/login'; });
    $('#signout', el).addEventListener('click', async () => { await Auth.signOut(); U.toast('Signed out'); location.hash = '#/login'; });
    const del = $('#del', el); if (del) del.addEventListener('click', async () => {
      if (!confirm(`Permanently delete ${u.type === 'cloud' ? 'your account and all synced progress' : `the profile "${u.name}" and its progress`}? This cannot be undone.`)) return;
      try {
        if (u.type === 'cloud') await Auth.deleteCloudAccount(); else Auth.deleteLocal(u.id);
        U.toast('Deleted'); location.hash = '#/login';
      } catch (ex) { U.toast(Auth.friendly(ex)); }
    });
    return () => clearInterval(off);
  };
})(window);
