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
    if (!g || (!(g.attempts || []).length && !g.plan)) return;
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

  /** Full-card screen showing a recovery code the user must save. */
  function recoveryScreen(container, code, intro, onContinue) {
    container.innerHTML = `
      <h2>🔑 Save your recovery code</h2>
      <p class="muted small">${intro} This site doesn't send emails, so this code is the <b>only way to reset your password</b> if you forget it. It is shown only once.</p>
      <div class="recovery-code" id="rcode">${esc(code)}</div>
      <div class="row gap wrap">
        <button class="btn" id="rcCopy">📋 Copy</button>
        <button class="btn" id="rcDl">⬇ Download .txt</button>
      </div>
      <label class="chk saved-chk"><input type="checkbox" id="rcSaved"> I saved my recovery code somewhere safe</label>
      <button class="btn primary big full" id="rcGo" disabled>Continue</button>`;
    $('#rcCopy', container).addEventListener('click', () => {
      (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => U.toast('Copied'), () => U.toast('Select the code and copy it manually'));
    });
    $('#rcDl', container).addEventListener('click', () => U.download('pe-prep-recovery-code.txt', `PE MDM Prep recovery code\n${location.origin}\n\n${code}\n\nUse this with your email on the sign-in screen ("Forgot password?") to set a new password.\n`, 'text/plain'));
    $('#rcSaved', container).addEventListener('change', (e) => ($('#rcGo', container).disabled = !e.target.checked));
    $('#rcGo', container).addEventListener('click', onContinue);
  }

  VIEWS.login = function (el) {
    if (Auth.user) { location.hash = '#/dashboard'; return; }
    const cloud = Auth.cloudEnabled, local = Auth.localAllowed;
    let tab = cloud ? 'cloud' : 'device';
    let mode = 'signin'; // signin | signup | recover

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

    function busy(btn, on, label) { btn.disabled = on; btn.textContent = on ? 'Please wait…' : label; }
    function err(msg) { const e = $('#authErr', el); if (e) e.innerHTML = msg ? `<div class="fb bad">${esc(msg)}</div>` : ''; }
    const render = () => (tab === 'cloud' ? renderCloud() : renderDevice());

    function renderCloud() {
      if (!cloud) {
        body.innerHTML = `
          <h2>Sign in</h2>
          <p class="muted">Online accounts (sync across phone, laptop and work computer) aren’t switched on for this site yet.</p>
          <div class="callout"><b>Site owner:</b> in your Vercel project open <b>Storage → Create Database → Upstash (Redis)</b>, connect it to this project, and redeploy. See “Setting up user accounts” in <code>README.md</code>.</div>
          ${local ? '<button class="btn primary" id="goDevice">Use a profile on this device instead →</button>' : ''}`;
        const g = $('#goDevice', el); if (g) g.addEventListener('click', () => setTab('device'));
        return;
      }
      const title = { signin: 'Welcome back', signup: 'Create your account', recover: 'Reset your password' }[mode];
      const sub = { signin: 'Sign in to pick up where you left off.', signup: 'Your progress will sync to every device you sign in on.', recover: 'Enter your email, the recovery code you saved when you signed up, and a new password.' }[mode];
      body.innerHTML = `
        <h2>${title}</h2>
        <p class="muted small">${sub}</p>
        <form id="cf" class="auth-form" novalidate>
          ${mode === 'signup' ? '<label>Name<input id="cn" type="text" autocomplete="name" maxlength="40" placeholder="Your name"></label>' : ''}
          <label>Email<input id="ce" type="email" autocomplete="email" required placeholder="you@example.com"></label>
          ${mode === 'recover' ? '<label>Recovery code<input id="cr" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX"></label>' : ''}
          <label>${mode === 'signin' ? 'Password' : 'New password'}<input id="cp" type="password" autocomplete="${mode === 'signin' ? 'current-password' : 'new-password'}" required minlength="8" placeholder="${mode === 'signin' ? '' : 'At least 8 characters'}"></label>
          <div id="authErr"></div>
          <button class="btn primary big full" id="csub" type="submit">${{ signin: 'Sign in', signup: 'Create account', recover: 'Reset password & sign in' }[mode]}</button>
        </form>
        <div class="auth-links">
          ${mode === 'signin' ? '<a href="javascript:void 0" data-mode="signup">Create an account</a><a href="javascript:void 0" data-mode="recover">Forgot password?</a>' : '<a href="javascript:void 0" data-mode="signin">← Back to sign in</a>'}
        </div>`;
      $$('[data-mode]', el).forEach((a) => a.addEventListener('click', () => { mode = a.dataset.mode; renderCloud(); }));
      $('#cf', el).addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = $('#csub', el), label = btn.textContent;
        const email = $('#ce', el).value.trim(), pw = $('#cp', el).value;
        if (!email) return err('Please enter your email.');
        if (!pw) return err('Please enter a password.');
        if (mode !== 'signin' && pw.length < 8) return err('Password must be at least 8 characters.');
        busy(btn, true, label); err('');
        try {
          if (mode === 'signup') {
            const r = await Auth.signUp(email, pw, $('#cn', el).value);
            recoveryScreen(body, r.recoveryCode, 'Account created!', () => { if (r.isNew) offerGuestImport(); done(); });
            return;
          }
          if (mode === 'recover') {
            const code = await Auth.recover(email, $('#cr', el).value, pw);
            recoveryScreen(body, code, 'Password reset — your old recovery code no longer works. Here is your new one.', done);
            return;
          }
          await Auth.signIn(email, pw);
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
        $('#pinBox', el).innerHTML = `<form id="pf2" class="auth-form inline"><label>PIN for ${esc(p.name)}<input id="pin" type="password" inputmode="numeric"></label><button class="btn primary" type="submit">Unlock</button></form>`;
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
    const typeLabel = u.type === 'cloud' ? '☁️ Online account — syncs across devices' : u.type === 'local' ? '💻 Profile on this device' : '👤 Guest on this device';
    const prof = u.type === 'local' ? Auth.profiles().find((p) => p.id === u.id) : null;
    const st = Store.s;
    el.innerHTML = `
      <div class="page-head"><h1>👤 Account</h1></div>
      <div class="card account-head">
        <span class="avatar xl">${esc(initials(u.name))}</span>
        <div><h2>${esc(u.name)}</h2><p class="muted">${u.email ? esc(u.email) + ' · ' : ''}${typeLabel}</p>
        <p class="small">${st.attempts.length} problems attempted · ${st.exams.length} practice exams · last active ${rel(st.lastActive)}</p></div>
      </div>
      ${u.type === 'cloud' ? `
      <div class="card"><div class="card-head"><h2>Sync</h2><span id="syncPill"></span></div>
        <p class="muted small">Progress saves to this device instantly and to your account a few seconds later. When you open the site on another device, the two copies are merged — nothing you studied on either is lost.</p>
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
      ${u.type === 'cloud' ? `
      <div class="card"><h2>Security</h2>
        <form id="cpf" class="auth-form inline">
          <label>Current password<input id="cpo" type="password" autocomplete="current-password"></label>
          <label>New password<input id="cpn" type="password" autocomplete="new-password" placeholder="At least 8 characters"></label>
          <button class="btn" type="submit">Change password</button></form>
        <p class="muted small">Changing your password signs out your other devices.</p>
        <form id="nrf" class="auth-form inline">
          <label>Lost your recovery code? Enter your password to get a new one<input id="nrp" type="password" autocomplete="current-password"></label>
          <button class="btn" type="submit">New recovery code</button></form>
        <div id="rcBox"></div>
      </div>` : ''}
      <div class="card"><h2>Session</h2><div class="row gap wrap">
        <button class="btn" id="switch">🔁 Switch user</button>
        <button class="btn" id="signout">↩ Sign out</button>
        <a class="btn" href="#/progress">⬇ Backup / import data</a>
      </div></div>
      ${u.type !== 'guest' ? `<div class="card danger-zone"><h2>Danger zone</h2>
        <p class="muted small">${u.type === 'cloud' ? 'Permanently deletes your account and all synced progress.' : 'Deletes this profile and its progress from this device.'}</p>
        ${u.type === 'cloud' ? '<form id="delf" class="auth-form inline"><label>Confirm with your password<input id="delp" type="password" autocomplete="current-password"></label><button class="btn danger" type="submit">Delete account</button></form>' : '<button class="btn danger" id="del">Delete profile</button>'}
      </div>` : ''}`;

    const pill = () => {
      const p = $('#syncPill', el); if (!p) return;
      const s = Auth.status;
      p.className = 'pill ' + (s === 'synced' ? 'good' : s === 'error' || s === 'offline' ? 'warn' : '');
      p.textContent = s === 'synced' ? `✓ Synced ${rel(Auth.lastSync)}` : s === 'syncing' || s === 'pending' ? 'Syncing…' : s === 'error' ? '⚠ ' + Auth.statusMsg : s === 'offline' ? 'Offline' : 'Not synced yet';
    };
    pill();
    const off = setInterval(pill, 2000);
    const on = (id, evt, fn) => { const x = $(id, el); if (x) x.addEventListener(evt, fn); };
    on('#syncNow', 'click', async () => { await Auth.syncNow(); pill(); U.toast(Auth.status === 'synced' ? 'Synced ✓' : Auth.statusMsg || 'Sync attempted'); });
    on('#toLogin', 'click', async () => { sessionStorage.setItem('pe-after-login', '#/dashboard'); await Auth.signOut(); location.hash = '#/login'; });
    on('#rn', 'submit', async (e) => {
      e.preventDefault(); const v = $('#rnv', el).value.trim(); if (!v) return;
      try { if (u.type === 'cloud') await Auth.renameCloud(v); else await Auth.updateLocal(u.id, { name: v }); U.toast('Name updated'); VIEWS.account(el); } catch (ex) { U.toast(Auth.friendly(ex)); }
    });
    on('#pinf', 'submit', async (e) => {
      e.preventDefault(); const v = $('#pinv', el).value.trim();
      if (v.length < 4) return U.toast('PIN must be at least 4 characters');
      await Auth.updateLocal(u.id, { pin: v }); U.toast('PIN saved'); VIEWS.account(el);
    });
    on('#rmPin', 'click', async () => { await Auth.updateLocal(u.id, { removePin: true }); U.toast('PIN removed'); VIEWS.account(el); });
    on('#cpf', 'submit', async (e) => {
      e.preventDefault();
      const n = $('#cpn', el).value;
      if (n.length < 8) return U.toast('New password must be at least 8 characters');
      try { await Auth.changePassword($('#cpo', el).value, n); U.toast('Password changed'); $('#cpo', el).value = $('#cpn', el).value = ''; } catch (ex) { U.toast(Auth.friendly(ex)); }
    });
    on('#nrf', 'submit', async (e) => {
      e.preventDefault();
      try {
        const code = await Auth.newRecoveryCode($('#nrp', el).value);
        recoveryScreen($('#rcBox', el), code, 'Your previous recovery code no longer works.', () => { $('#rcBox', el).innerHTML = '<div class="fb ok">New recovery code saved ✓</div>'; });
        $('#nrp', el).value = '';
      } catch (ex) { U.toast(Auth.friendly(ex)); }
    });
    on('#switch', 'click', async () => { await Auth.signOut(); location.hash = '#/login'; });
    on('#signout', 'click', async () => { await Auth.signOut(); U.toast('Signed out'); location.hash = '#/login'; });
    on('#del', 'click', () => {
      if (!confirm(`Permanently delete the profile "${u.name}" and its progress from this device? This cannot be undone.`)) return;
      Auth.deleteLocal(u.id); U.toast('Profile deleted'); location.hash = '#/login';
    });
    on('#delf', 'submit', async (e) => {
      e.preventDefault();
      if (!confirm('Permanently delete your account and all synced progress? This cannot be undone.')) return;
      try { await Auth.deleteCloudAccount($('#delp', el).value); U.toast('Account deleted'); location.hash = '#/login'; } catch (ex) { U.toast(Auth.friendly(ex)); }
    });
    return () => clearInterval(off);
  };
})(window);
