/* Timed practice exam simulating the CBT: navigator, flags, timer, scoring by topic, review. */
(function (global) {
  'use strict';
  const { $, $$, esc, fmt, renderMath } = U;
  const VIEWS = (global.VIEWS = global.VIEWS || {});

  /* Fixed full-length forms: the same 80 questions (and numbers) every attempt, so scores are comparable.
     Selection is deterministic from the seed and the current content. */
  const FORMS = [
    { id: 'A', title: 'Practice Exam A', seed: 20270301 },
    { id: 'B', title: 'Practice Exam B', seed: 20270315 }
  ];
  const FILL_SHARE = 0.1; // CBT-style: about 1 in 10 calculation questions is fill-in-the-blank

  function buildExam(n, mix, topic, includeConcepts, opts = {}) {
    const rng = opts.rng || U.makeRng(U.newSeed());
    const seed = () => Math.floor(rng.next() * 2 ** 31);
    const pool = Bank.all().filter((p) => includeConcepts || p.kind === 'num');
    const stats = Store.topicStats();
    let weights;
    if (mix === 'single') weights = Object.fromEntries(SPEC.topics.map((t) => [t.id, t.id === topic ? 1 : 0]));
    else weights = Object.fromEntries(SPEC.topics.map((t) => {
      let w = SPEC.weight(t.id);
      if (mix === 'weak') { const s = stats[t.id]; const acc = s && s.n ? s.c / s.n : 0.5; w *= 1.6 - acc; }
      return [t.id, w];
    }));
    const tot = Object.values(weights).reduce((a, b) => a + b, 0);
    // Number of questions per topic (largest remainder)
    const ideal = SPEC.topics.map((t) => ({ id: t.id, x: (weights[t.id] / tot) * n }));
    ideal.forEach((o) => (o.k = Math.floor(o.x)));
    let rem = n - ideal.reduce((s, o) => s + o.k, 0);
    ideal.slice().sort((a, b) => (b.x - b.k) - (a.x - a.k)).forEach((o) => { if (rem > 0 && weights[o.id] > 0) { o.k++; rem--; } });
    const qs = [];
    ideal.forEach((o) => {
      const items = rng.shuffle(pool.filter((p) => p.topic === o.id));
      if (!items.length) return;
      // Use each item once; if more are needed, repeat calculation problems (fresh numbers each time)
      const nums = items.filter((p) => p.kind === 'num');
      for (let i = 0; i < o.k; i++) {
        const it = i < items.length ? items[i] : (nums.length ? nums[(i - items.length) % nums.length] : items[i % items.length]);
        qs.push({ id: it.id, seed: seed(), fill: it.kind === 'num' && rng.next() < (opts.fillShare || 0) });
      }
    });
    return rng.shuffle(qs);
  }
  const buildForm = (form) => buildExam(80, 'spec', null, true, { rng: U.makeRng(form.seed), fillShare: FILL_SHARE });

  VIEWS.exam = function (el, params, q) {
    if (Paywall.gate(el, 'Timed practice exams are part of full access')) return;
    const active = Store.s.activeExam;
    if (active && !active.submitted) return runExam(el, active);
    if (params[0] === 'review' && Store.s.lastExamDetail) return results(el, Store.s.lastExamDetail);
    setup(el, q);
  };

  function setup(el, q) {
    const hist = Store.s.exams.slice(-5).reverse();
    const formStats = (id) => {
      const xs = Store.s.exams.filter((x) => x.form === id);
      if (!xs.length) return 'Not attempted yet';
      const pc = xs.map((x) => Math.round((100 * x.correct) / x.n));
      return `Best ${Math.max(...pc)}% · last ${pc[pc.length - 1]}% · ${xs.length} attempt${xs.length > 1 ? 's' : ''}`;
    };
    el.innerHTML = `
      <div class="page-head"><h1>⏱️ Practice Exam</h1>
      <p class="muted">Simulates the computer-based test: one question at a time, flag for review, a running clock, and a navigator. The real exam is 80 questions in about 8 hours of testing time (≈6 min/question). Like the CBT, exams mix multiple-choice, <b>select-all-that-apply</b> and <b>fill-in-the-number</b> questions.</p></div>
      <div class="forms-grid">${FORMS.map((fo) => `
        <div class="card form-card"><div class="paywall-badge">Full length · 80 Q · 8 h</div>
          <h2>${fo.title}</h2><p class="muted small">The same questions every attempt, so you can measure improvement. Weighted like the NCEES spec.</p>
          <p class="small"><b>${formStats(fo.id)}</b></p>
          <button class="btn primary" data-form="${fo.id}">Start ${fo.title}</button></div>`).join('')}
      </div>
      <h2 class="area-h">Custom exam (new random questions each time)</h2>
      <div class="card exam-setup">
        <div class="grid2">
          <label>Number of questions
            <select id="xn">${[10, 20, 40, 80].map((n) => `<option ${+q.n === n ? 'selected' : ''} value="${n}">${n}${n === 80 ? ' (full length)' : n === 40 ? ' (half: one session)' : ''}</option>`).join('')}</select></label>
          <label>Minutes per question
            <select id="xt"><option value="6" selected>6 (real exam pace)</option><option value="5">5 (push the pace)</option><option value="8">8 (relaxed)</option><option value="0">Untimed</option></select></label>
          <label>Topic mix
            <select id="xm"><option value="spec">Weighted like the NCEES spec</option><option value="weak">Emphasize my weak topics</option><option value="single">Single topic…</option></select></label>
          <label id="xtopicWrap" class="hidden">Topic <select id="xtopic">${SPEC.topics.map((t) => `<option value="${t.id}">${t.name}</option>`).join('')}</select></label>
          <label class="chk"><input type="checkbox" id="xc" checked> Include conceptual questions</label>
          <label class="chk"><input type="checkbox" id="xfill"> All calculation questions as fill-in (no choices)</label>
        </div>
        <button class="btn primary big" id="start">Start exam</button>
      </div>
      ${hist.length ? `<div class="card"><h3>Recent exams</h3><table class="tbl"><tr><th>Date</th><th>Questions</th><th>Score</th><th>Time</th></tr>
        ${hist.map((h) => `<tr><td>${new Date(h.ts).toLocaleDateString()}${h.form ? ` · Form ${h.form}` : ''}</td><td>${h.n}</td><td><b>${Math.round((100 * h.correct) / h.n)}%</b> (${h.correct}/${h.n})</td><td>${U.fmtTime(h.durationSec)}</td></tr>`).join('')}</table>
        ${Store.s.lastExamDetail ? '<a class="btn" href="#/exam/review">Review last exam</a>' : ''}</div>` : ''}`;
    $('#xm', el).addEventListener('change', (e) => $('#xtopicWrap', el).classList.toggle('hidden', e.target.value !== 'single'));
    const begin = (qs, extra) => {
      Store.s.activeExam = Object.assign({ qs, answers: {}, flags: {}, cur: 0, startTs: Date.now(), submitted: false }, extra);
      Store.save();
      runExam(el, Store.s.activeExam);
    };
    $('#start', el).addEventListener('click', () => {
      const n = +$('#xn', el).value, mpq = +$('#xt', el).value;
      const qs = buildExam(n, $('#xm', el).value, $('#xtopic', el).value, $('#xc', el).checked, { fillShare: FILL_SHARE });
      if (!qs.length) return U.toast('No questions available for that selection');
      begin(qs, { limitSec: mpq ? mpq * 60 * qs.length : 0, fill: $('#xfill', el).checked });
    });
    $$('[data-form]', el).forEach((b) => b.addEventListener('click', () => {
      const fo = FORMS.find((x) => x.id === b.dataset.form);
      if (!confirm(`Start ${fo.title}?\n\n80 questions, 8 hours on the clock. Your progress is saved if you leave and come back.`)) return;
      begin(buildForm(fo), { limitSec: 480 * 60, fill: false, form: fo.id, title: fo.title });
    }));
  }
  global.ExamForms = { FORMS, buildForm };

  function runExam(el, ex) {
    const insts = ex.qs.map((qq) => Bank.instance(qq.id, qq.seed));
    let tick = null;
    el.innerHTML = `
      <div class="exam-bar card">
        <b>${esc(ex.title || 'Practice Exam')}</b><span class="muted">${insts.length} questions</span><span class="spacer"></span>
        <span class="timer" id="timer"></span>
        <button class="btn" id="navBtn">☰ Navigator</button>
        <button class="btn danger" id="submitX">Submit exam</button>
      </div>
      <div class="exam-wrap">
        <aside class="navigator card hidden" id="nav"></aside>
        <div class="exam-q" id="eq"></div>
      </div>`;

    function timeLeft() { return ex.limitSec ? ex.limitSec - (Date.now() - ex.startTs) / 1000 : null; }
    function updTimer() {
      const t = timeLeft();
      const tEl = $('#timer', el);
      if (!tEl) return clearInterval(tick);
      if (t === null) tEl.textContent = '⏱ ' + U.fmtTime((Date.now() - ex.startTs) / 1000) + ' elapsed';
      else {
        tEl.textContent = '⏳ ' + U.fmtTime(t) + ' left';
        tEl.classList.toggle('low', t < 300);
        if (t <= 0) { clearInterval(tick); U.toast('Time is up!'); finish(); }
      }
    }
    tick = setInterval(updTimer, 1000); updTimer();

    const isFill = (i) => insts[i].kind === 'num' && (ex.fill || !!ex.qs[i].fill);
    const answered = (i) => { const a = ex.answers[i]; return Array.isArray(a) ? a.length > 0 : a != null && a !== ''; };
    function renderNav() {
      $('#nav', el).innerHTML = `<div class="navgrid">${insts.map((_, i) => `<button class="nq ${answered(i) ? 'ans' : ''} ${ex.flags[i] ? 'flag' : ''} ${i === ex.cur ? 'cur' : ''}" data-i="${i}">${i + 1}</button>`).join('')}</div>
        <p class="small muted">■ answered · 🚩 flagged</p>`;
      $$('.nq', el).forEach((b) => b.addEventListener('click', () => { ex.cur = +b.dataset.i; Store.save(); renderQ(); }));
    }
    function renderQ() {
      const i = ex.cur, inst = insts[i];
      const fill = isFill(i), multi = inst.kind === 'multi';
      const sel = multi ? (Array.isArray(ex.answers[i]) ? ex.answers[i] : []) : null;
      $('#eq', el).innerHTML = `<article class="card problem">
        <div class="prob-meta"><b>Question ${i + 1} of ${insts.length}</b>${fill ? '<span class="pill">Fill in the answer</span>' : ''}<span class="spacer"></span>
          <button class="btn ${ex.flags[i] ? 'flagged' : ''}" id="flag">🚩 ${ex.flags[i] ? 'Flagged' : 'Flag for review'}</button></div>
        <div class="prompt">${inst.prompt}</div>${Bank.figureHTML(inst)}
        ${fill
          ? `<div class="num-entry"><input id="fillA" type="text" inputmode="decimal" value="${ex.answers[i] != null ? esc(ex.answers[i]) : ''}" placeholder="Answer"><span class="unit">${esc(inst.unit || '')}</span></div>`
          : multi
          ? `<div class="choices multi">${inst.choices.map((_, k) => `<button class="choice ${sel.includes(k) ? 'sel' : ''}" data-k="${k}" aria-pressed="${sel.includes(k)}"><span class="letter box">${sel.includes(k) ? '☑' : '☐'}</span> ${Bank.choiceLabel(inst, k)}</button>`).join('')}</div>`
          : `<div class="choices">${inst.choices.map((_, k) => `<button class="choice ${ex.answers[i] === k ? 'sel' : ''}" data-k="${k}"><span class="letter">${'ABCDEF'[k]}</span> ${Bank.choiceLabel(inst, k)}</button>`).join('')}</div>`}
        <div class="row gap"><button class="btn" id="prevQ" ${i === 0 ? 'disabled' : ''}>← Previous</button><span class="spacer"></span>
        <button class="btn primary" id="nextQ">${i === insts.length - 1 ? 'Review & submit' : 'Next →'}</button></div></article>`;
      renderMath($('#eq', el));
      if (fill) $('#fillA', el).addEventListener('input', (e) => { const v = e.target.value.trim(); if (v) ex.answers[i] = v; else delete ex.answers[i]; Store.save(); renderNav(); });
      if (multi) {
        $$('.choice', el).forEach((b) => b.addEventListener('click', () => {
          const k = +b.dataset.k, cur = new Set(Array.isArray(ex.answers[i]) ? ex.answers[i] : []);
          if (cur.has(k)) cur.delete(k); else cur.add(k);
          if (cur.size) ex.answers[i] = [...cur].sort((x, y) => x - y); else delete ex.answers[i];
          Store.save();
          b.classList.toggle('sel', cur.has(k)); b.setAttribute('aria-pressed', String(cur.has(k)));
          b.querySelector('.box').textContent = cur.has(k) ? '☑' : '☐';
          renderNav();
        }));
      } else {
        $$('.choice', el).forEach((b) => b.addEventListener('click', () => { ex.answers[i] = +b.dataset.k; Store.save(); $$('.choice', el).forEach((x) => x.classList.toggle('sel', x === b)); renderNav(); }));
      }
      $('#flag', el).addEventListener('click', () => { ex.flags[i] = !ex.flags[i]; Store.save(); renderQ(); });
      $('#prevQ', el).addEventListener('click', () => { ex.cur--; Store.save(); renderQ(); });
      $('#nextQ', el).addEventListener('click', () => { if (ex.cur < insts.length - 1) { ex.cur++; Store.save(); renderQ(); } else { $('#nav', el).classList.remove('hidden'); confirmSubmit(); } });
      renderNav();
    }
    function confirmSubmit() {
      const un = insts.filter((_, i) => !answered(i)).length;
      const fl = Object.values(ex.flags).filter(Boolean).length;
      if (confirm(`Submit exam?\n\nUnanswered: ${un}\nFlagged: ${fl}`)) finish();
    }
    function finish() {
      clearInterval(tick);
      const dur = (Date.now() - ex.startTs) / 1000;
      const byTopic = {};
      let correct = 0;
      const detail = insts.map((inst, i) => {
        const a = ex.answers[i], fill = isFill(i);
        const ok = Bank.isCorrect(inst, a, fill);
        if (ok) correct++;
        const t = (byTopic[inst.item.topic] = byTopic[inst.item.topic] || { n: 0, c: 0 });
        t.n++; if (ok) t.c++;
        Store.recordAttempt(inst.item.id, inst.item.topic, ok, 'exam');
        return { id: inst.item.id, seed: inst.seed, answer: a, ok, fill };
      });
      Store.s.exams.push({ ts: Date.now(), n: insts.length, correct, durationSec: dur, byTopic, form: ex.form || null });
      Store.s.lastExamDetail = { ts: Date.now(), fill: ex.fill, detail, durationSec: dur, byTopic, correct, form: ex.form || null, title: ex.title || null };
      Store.s.activeExam = null;
      Store.logActivity(Math.round(dur / 60));
      Store.save();
      results(el, Store.s.lastExamDetail);
    }

    $('#navBtn', el).addEventListener('click', () => $('#nav', el).classList.toggle('hidden'));
    $('#submitX', el).addEventListener('click', confirmSubmit);
    renderQ();
    return () => clearInterval(tick);
  }

  function results(el, r) {
    const n = r.detail.length, pct = Math.round((100 * r.correct) / n);
    const verdict = pct >= 75 ? ['great', 'Strong — at or above a typical passing level. Keep it sharp.'] : pct >= 60 ? ['ok', 'Close to the line. Target your weakest topics below.'] : ['low', 'Keep building — review the solutions and drill the weak topics.'];
    el.innerHTML = `
      <div class="page-head"><h1>${r.title ? esc(r.title) + ' — results' : 'Exam results'}</h1><p class="muted">NCEES does not publish a fixed cut score; many candidates target ≈70%+ on quality practice exams.</p></div>
      <div class="card results">
        <div class="score-ring ${verdict[0]}" style="--p:${pct}"><span>${pct}%</span></div>
        <div><h2>${r.correct} / ${n} correct</h2><p>${verdict[1]}</p><p class="muted">Time used: ${U.fmtTime(r.durationSec)} (${fmt(r.durationSec / 60 / n, 2)} min/question)</p>
        <div class="row gap"><a class="btn primary" href="#/exam">New exam</a><a class="btn" href="#/progress">Progress</a></div></div>
      </div>
      <div class="card"><h3>By topic</h3>
        ${SPEC.topics.filter((t) => r.byTopic[t.id]).map((t) => { const b = r.byTopic[t.id], p = Math.round((100 * b.c) / b.n); return `
          <div class="bar-row"><span class="bar-label">${t.name}</span><div class="bar"><div style="width:${p}%;background:${t.color}"></div></div><span class="bar-val">${b.c}/${b.n}</span>
          <a class="small" href="#/practice?topic=${t.id}">drill →</a></div>`; }).join('')}
      </div>
      <div class="card"><h3>Review questions</h3><div class="row gap"><label class="chk"><input type="checkbox" id="onlyWrong" checked> Show only missed</label></div><div id="rev"></div></div>`;
    const renderRev = () => {
      const only = $('#onlyWrong', el).checked;
      $('#rev', el).innerHTML = r.detail.map((d, i) => {
        if (only && d.ok) return '';
        const inst = Bank.instance(d.id, d.seed);
        if (!inst) return '';
        const fill = d.fill != null ? d.fill : (r.fill && inst.kind === 'num');
        const empty = d.answer == null || (Array.isArray(d.answer) && !d.answer.length);
        const yours = empty ? '<i>no answer</i>'
          : inst.kind === 'multi' ? d.answer.map((k) => Bank.choiceLabel(inst, k)).join('; ')
          : fill ? esc(d.answer) + ' ' + esc(inst.unit || '') : Bank.choiceLabel(inst, d.answer);
        return `<details class="rev-item ${d.ok ? 'ok' : 'bad'}"><summary>${d.ok ? '✅' : '❌'} Q${i + 1}. ${esc(inst.item.title)} <span class="muted small">— ${SPEC.byId[inst.item.topic].short}${inst.kind === 'multi' ? ' · select all' : fill ? ' · fill-in' : ''}</span></summary>
          <div class="prompt">${inst.prompt}</div>${Bank.figureHTML(inst)}<p>Your answer: <b>${yours}</b> · Correct: <b>${Bank.correctLabel(inst)}</b></p>${Bank.solutionHTML(inst)}
          <a class="btn small" href="#/practice/${inst.item.id}">Practice this type again</a></details>`;
      }).join('') || '<p class="muted">Nothing missed — nice work! 🎉</p>';
      $$('.rev-item', el).forEach((d) => d.addEventListener('toggle', () => renderMath(d), { once: true }));
    };
    $('#onlyWrong', el).addEventListener('change', renderRev);
    renderRev();
  }
})(window);
