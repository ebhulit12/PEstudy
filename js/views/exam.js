/* Timed practice exam simulating the CBT: navigator, flags, timer, scoring by topic, review. */
(function (global) {
  'use strict';
  const { $, $$, esc, fmt, renderMath } = U;
  const VIEWS = (global.VIEWS = global.VIEWS || {});

  function buildExam(n, mix, topic, includeConcepts) {
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
      const items = U.makeRng(U.newSeed()).shuffle(pool.filter((p) => p.topic === o.id));
      if (!items.length) return;
      // Use each item once; if more are needed, repeat calculation problems (fresh numbers each time)
      const nums = items.filter((p) => p.kind === 'num');
      for (let i = 0; i < o.k; i++) {
        const it = i < items.length ? items[i] : (nums.length ? nums[(i - items.length) % nums.length] : items[i % items.length]);
        qs.push({ id: it.id, seed: U.newSeed() });
      }
    });
    return U.makeRng(U.newSeed()).shuffle(qs);
  }

  VIEWS.exam = function (el, params, q) {
    if (Paywall.gate(el, 'Timed practice exams are part of full access')) return;
    const active = Store.s.activeExam;
    if (active && !active.submitted) return runExam(el, active);
    if (params[0] === 'review' && Store.s.lastExamDetail) return results(el, Store.s.lastExamDetail);
    setup(el, q);
  };

  function setup(el, q) {
    const hist = Store.s.exams.slice(-5).reverse();
    el.innerHTML = `
      <div class="page-head"><h1>⏱️ Practice Exam</h1>
      <p class="muted">Simulates the computer-based test: one question at a time, flag for review, a running clock, and a navigator. The real exam is 80 questions in about 8 hours of testing time (≈6 min/question).</p></div>
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
          <label class="chk"><input type="checkbox" id="xfill"> Calculation questions as fill-in (no choices)</label>
        </div>
        <button class="btn primary big" id="start">Start exam</button>
      </div>
      ${hist.length ? `<div class="card"><h3>Recent exams</h3><table class="tbl"><tr><th>Date</th><th>Questions</th><th>Score</th><th>Time</th></tr>
        ${hist.map((h) => `<tr><td>${new Date(h.ts).toLocaleDateString()}</td><td>${h.n}</td><td><b>${Math.round((100 * h.correct) / h.n)}%</b> (${h.correct}/${h.n})</td><td>${U.fmtTime(h.durationSec)}</td></tr>`).join('')}</table>
        ${Store.s.lastExamDetail ? '<a class="btn" href="#/exam/review">Review last exam</a>' : ''}</div>` : ''}`;
    $('#xm', el).addEventListener('change', (e) => $('#xtopicWrap', el).classList.toggle('hidden', e.target.value !== 'single'));
    $('#start', el).addEventListener('click', () => {
      const n = +$('#xn', el).value, mpq = +$('#xt', el).value;
      const qs = buildExam(n, $('#xm', el).value, $('#xtopic', el).value, $('#xc', el).checked);
      if (!qs.length) return U.toast('No questions available for that selection');
      Store.s.activeExam = {
        qs, answers: {}, flags: {}, cur: 0, startTs: Date.now(), limitSec: mpq ? mpq * 60 * qs.length : 0,
        fill: $('#xfill', el).checked, submitted: false
      };
      Store.save();
      runExam(el, Store.s.activeExam);
    });
  }

  function runExam(el, ex) {
    const insts = ex.qs.map((qq) => Bank.instance(qq.id, qq.seed));
    let tick = null;
    el.innerHTML = `
      <div class="exam-bar card">
        <b>Practice Exam</b><span class="muted">${insts.length} questions</span><span class="spacer"></span>
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

    function renderNav() {
      $('#nav', el).innerHTML = `<div class="navgrid">${insts.map((_, i) => `<button class="nq ${ex.answers[i] != null ? 'ans' : ''} ${ex.flags[i] ? 'flag' : ''} ${i === ex.cur ? 'cur' : ''}" data-i="${i}">${i + 1}</button>`).join('')}</div>
        <p class="small muted">■ answered · 🚩 flagged</p>`;
      $$('.nq', el).forEach((b) => b.addEventListener('click', () => { ex.cur = +b.dataset.i; Store.save(); renderQ(); }));
    }
    function renderQ() {
      const i = ex.cur, inst = insts[i];
      const fill = ex.fill && inst.kind === 'num';
      $('#eq', el).innerHTML = `<article class="card problem">
        <div class="prob-meta"><b>Question ${i + 1} of ${insts.length}</b><span class="spacer"></span>
          <button class="btn ${ex.flags[i] ? 'flagged' : ''}" id="flag">🚩 ${ex.flags[i] ? 'Flagged' : 'Flag for review'}</button></div>
        <div class="prompt">${inst.prompt}</div>${Bank.figureHTML(inst)}
        ${fill
          ? `<div class="num-entry"><input id="fillA" type="text" inputmode="decimal" value="${ex.answers[i] != null ? esc(ex.answers[i]) : ''}" placeholder="Answer"><span class="unit">${esc(inst.unit || '')}</span></div>`
          : `<div class="choices">${inst.choices.map((_, k) => `<button class="choice ${ex.answers[i] === k ? 'sel' : ''}" data-k="${k}"><span class="letter">${'ABCD'[k]}</span> ${Bank.choiceLabel(inst, k)}</button>`).join('')}</div>`}
        <div class="row gap"><button class="btn" id="prevQ" ${i === 0 ? 'disabled' : ''}>← Previous</button><span class="spacer"></span>
        <button class="btn primary" id="nextQ">${i === insts.length - 1 ? 'Review & submit' : 'Next →'}</button></div></article>`;
      renderMath($('#eq', el));
      if (fill) $('#fillA', el).addEventListener('input', (e) => { const v = e.target.value.trim(); if (v) ex.answers[i] = v; else delete ex.answers[i]; Store.save(); renderNav(); });
      $$('.choice', el).forEach((b) => b.addEventListener('click', () => { ex.answers[i] = +b.dataset.k; Store.save(); $$('.choice', el).forEach((x) => x.classList.toggle('sel', x === b)); renderNav(); }));
      $('#flag', el).addEventListener('click', () => { ex.flags[i] = !ex.flags[i]; Store.save(); renderQ(); });
      $('#prevQ', el).addEventListener('click', () => { ex.cur--; Store.save(); renderQ(); });
      $('#nextQ', el).addEventListener('click', () => { if (ex.cur < insts.length - 1) { ex.cur++; Store.save(); renderQ(); } else { $('#nav', el).classList.remove('hidden'); confirmSubmit(); } });
      renderNav();
    }
    function confirmSubmit() {
      const un = insts.length - Object.keys(ex.answers).length;
      const fl = Object.values(ex.flags).filter(Boolean).length;
      if (confirm(`Submit exam?\n\nUnanswered: ${un}\nFlagged: ${fl}`)) finish();
    }
    function finish() {
      clearInterval(tick);
      const dur = (Date.now() - ex.startTs) / 1000;
      const byTopic = {};
      let correct = 0;
      const detail = insts.map((inst, i) => {
        const a = ex.answers[i];
        const ok = a == null ? false : (ex.fill && inst.kind === 'num') ? Bank.checkNumeric(inst, a) : a === inst.correct;
        if (ok) correct++;
        const t = (byTopic[inst.item.topic] = byTopic[inst.item.topic] || { n: 0, c: 0 });
        t.n++; if (ok) t.c++;
        Store.recordAttempt(inst.item.id, inst.item.topic, ok, 'exam');
        return { id: inst.item.id, seed: inst.seed, answer: a, ok };
      });
      Store.s.exams.push({ ts: Date.now(), n: insts.length, correct, durationSec: dur, byTopic });
      Store.s.lastExamDetail = { ts: Date.now(), fill: ex.fill, detail, durationSec: dur, byTopic, correct };
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
      <div class="page-head"><h1>Exam results</h1><p class="muted">NCEES does not publish a fixed cut score; many candidates target ≈70%+ on quality practice exams.</p></div>
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
        const yours = d.answer == null ? '<i>no answer</i>' : (r.fill && inst.kind === 'num') ? esc(d.answer) + ' ' + esc(inst.unit || '') : Bank.choiceLabel(inst, d.answer);
        return `<details class="rev-item ${d.ok ? 'ok' : 'bad'}"><summary>${d.ok ? '✅' : '❌'} Q${i + 1}. ${esc(inst.item.title)} <span class="muted small">— ${SPEC.byId[inst.item.topic].short}</span></summary>
          <div class="prompt">${inst.prompt}</div>${Bank.figureHTML(inst)}<p>Your answer: <b>${yours}</b> · Correct: <b>${inst.kind === 'num' ? fmt(inst.answer, 4) + ' ' + esc(inst.unit || '') : esc(inst.choices[inst.correct])}</b></p>${Bank.solutionHTML(inst)}
          <a class="btn small" href="#/practice/${inst.item.id}">Practice this type again</a></details>`;
      }).join('') || '<p class="muted">Nothing missed — nice work! 🎉</p>';
      $$('.rev-item', el).forEach((d) => d.addEventListener('toggle', () => renderMath(d), { once: true }));
    };
    $('#onlyWrong', el).addEventListener('change', renderRev);
    renderRev();
  }
})(window);
