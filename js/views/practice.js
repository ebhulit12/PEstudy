/* Problem bank helpers + interactive Practice view. */
(function (global) {
  'use strict';
  const { $, $$, esc, fmt, renderMath } = U;

  // ---------------- Bank ----------------
  const Bank = {
    all() {
      if (!this._all) {
        this._all = PROBLEMS.map((p) => Object.assign({ kind: 'num' }, p))
          .concat(CONCEPTS.map((c) => Object.assign({ kind: c.type === 'multi' ? 'multi' : 'mc', title: c.q.length > 70 ? c.q.slice(0, 67) + '…' : c.q, diff: c.type === 'multi' ? 2 : 1 }, c)));
        this._by = Object.fromEntries(this._all.map((p) => [p.id, p]));
      }
      return this._all;
    },
    get(id) { this.all(); return this._by[id]; },
    /** Create a concrete instance from a seed (deterministic). */
    instance(id, seed) {
      const item = this.get(id);
      if (!item) return null;
      if (item.kind === 'num') {
        const d = item.gen(U.makeRng(seed));
        const mc = U.makeChoices(d.answer, d.distract, U.makeRng(seed + 7));
        return Object.assign({ item, seed, kind: 'num', tol: 0.02 }, d, { choices: mc.choices, correct: mc.correct });
      }
      const rng = U.makeRng(seed);
      const order = rng.shuffle(item.choices.map((_, i) => i));
      if (item.kind === 'multi') { // "select all that apply": all-or-nothing, like the CBT
        return {
          item, seed, kind: 'multi', prompt: esc(item.q) + ' <b>(Select all that apply.)</b>',
          choices: order.map((i) => item.choices[i]), correct: item.answers.map((a) => order.indexOf(a)).sort((a, b) => a - b),
          explanation: item.exp
        };
      }
      return {
        item, seed, kind: 'mc', prompt: esc(item.q),
        choices: order.map((i) => item.choices[i]), correct: order.indexOf(item.ans),
        explanation: item.exp
      };
    },
    /** Grade an answer: index (single choice), array of indices (multi), or typed value (fill-in). */
    isCorrect(inst, answer, fill) {
      if (answer == null || answer === '') return false;
      if (inst.kind === 'multi') {
        const a = (Array.isArray(answer) ? answer : []).slice().sort((x, y) => x - y);
        return a.length === inst.correct.length && a.every((v, i) => v === inst.correct[i]);
      }
      if (fill && inst.kind === 'num') return this.checkNumeric(inst, answer);
      return answer === inst.correct;
    },
    correctLabel(inst) {
      if (inst.kind === 'num') return `${fmt(inst.answer, 4)} ${esc(inst.unit || '')}`;
      if (inst.kind === 'multi') return inst.correct.map((i) => esc(inst.choices[i])).join('; ');
      return esc(inst.choices[inst.correct]);
    },
    checkNumeric(inst, value) {
      const v = parseFloat(String(value).replace(/,/g, ''));
      if (!isFinite(v)) return false;
      const tol = inst.tol || 0.02;
      return Math.abs(v - inst.answer) <= tol * Math.abs(inst.answer) + 1e-12;
    },
    choiceLabel(inst, i) {
      if (inst.kind === 'num') return `${fmt(inst.choices[i], 3)}${inst.unit ? ' ' + esc(inst.unit) : ''}`;
      return esc(inst.choices[i]);
    },
    figureHTML(inst) {
      if (!inst.fig || !FIG[inst.fig.name]) return '';
      return `<div class="fig-wrap">${FIG[inst.fig.name](inst.fig.data || {})}</div>`;
    },
    solutionHTML(inst) {
      if (inst.kind === 'mc') return `<div class="solution"><p><b>Answer:</b> ${esc(inst.choices[inst.correct])}</p><p>${esc(inst.explanation)}</p></div>`;
      if (inst.kind === 'multi') return `<div class="solution"><p><b>Correct selections:</b></p><ul>${inst.correct.map((i) => `<li>${esc(inst.choices[i])}</li>`).join('')}</ul><p>${esc(inst.explanation)}</p></div>`;
      const steps = inst.steps.map((s, i) => `<li><div>${s.t}</div>${s.m ? `<div class="m">\\[${s.m}\\]</div>` : ''}</li>`).join('');
      return `<div class="solution"><ol class="steps">${steps}</ol><p class="final"><b>Answer:</b> ${fmt(inst.answer, 4)} ${esc(inst.unit || '')}</p></div>`;
    },
    /** Pick items for a topic list, weighting toward weak topics if requested. */
    pool(filter = {}) {
      return this.all().filter((p) =>
        (!filter.topic || filter.topic === 'all' || p.topic === filter.topic) &&
        (!filter.kind || filter.kind === 'all' || p.kind === filter.kind || (filter.kind === 'mc' && p.kind === 'multi')) &&
        (!filter.diff || filter.diff === 'all' || String(p.diff) === String(filter.diff)) &&
        (!filter.bookmarked || Store.s.bookmarks[p.id]));
    },
    lastResult(id) {
      for (let i = Store.s.attempts.length - 1; i >= 0; i--) if (Store.s.attempts[i].pid === id) return Store.s.attempts[i].correct;
      return null;
    }
  };
  global.Bank = Bank;

  // ---------------- Practice view ----------------
  const VIEWS = (global.VIEWS = global.VIEWS || {});

  VIEWS.practice = function (el, params, q) {
    const st = {
      topic: q.topic || 'all', kind: q.kind || 'all', diff: 'all', bookmarked: false, mode: 'numeric',
      session: { n: 0, c: 0 }, history: [], current: null, answered: false
    };
    if (params[0]) st.forceId = params[0];

    el.innerHTML = `
      <div class="page-head"><h1>✏️ Practice Problems</h1>
        <p class="muted">Numbers are randomized every time — click <b>New numbers</b> to re-practice the same concept. Answers within ±2% count as correct.</p></div>
      ${Paywall.isLocked() ? Paywall.banner(`Free sample: ${PROBLEMS.length + CONCEPTS.length} of ${((CONTENT_META.totals || {}).problems || 0) + ((CONTENT_META.totals || {}).concepts || 0)} problems.`) : ''}
      <div class="filters card">
        <label>Topic <select id="fTopic"><option value="all">All topics</option>${SPEC.topics.map((t) => `<option value="${t.id}">${t.name}</option>`).join('')}</select></label>
        <label>Type <select id="fKind"><option value="all">Calculation + concept</option><option value="num">Calculations only</option><option value="mc">Concepts only</option><option value="multi">Select all that apply</option></select></label>
        <label>Difficulty <select id="fDiff"><option value="all">Any</option><option value="1">★ Basic</option><option value="2">★★ Exam-level</option><option value="3">★★★ Challenging</option></select></label>
        <label>Answer as <select id="fMode"><option value="numeric">Type the number</option><option value="mc">Multiple choice</option></select></label>
        <label class="chk"><input type="checkbox" id="fBook"> Bookmarked only</label>
        <span class="spacer"></span>
        <span class="pill" id="sessStat">Session: 0 / 0</span>
      </div>
      <div id="probArea"></div>
      <details class="card" id="listWrap"><summary>Browse all problems in this filter</summary><div id="probList" class="plist"></div></details>`;

    $('#fTopic', el).value = st.topic;
    $('#fKind', el).value = st.kind;
    Paywall.bind(el);
    const area = $('#probArea', el);

    const onFilter = () => {
      st.topic = $('#fTopic', el).value; st.kind = $('#fKind', el).value; st.diff = $('#fDiff', el).value;
      st.bookmarked = $('#fBook', el).checked; st.mode = $('#fMode', el).value;
      st.history = [];
      renderList(); next();
    };
    $$('select, input', $('.filters', el)).forEach((x) => x.addEventListener('change', onFilter));

    function renderList() {
      const pool = Bank.pool(st);
      $('#probList', el).innerHTML = pool.map((p) => {
        const lr = Bank.lastResult(p.id);
        return `<a href="javascript:void 0" data-id="${p.id}" class="pl-item"><span class="dot" style="background:${SPEC.byId[p.topic].color}"></span>
          <span class="pl-title">${esc(p.title)}</span><span class="muted small">${p.kind === 'num' ? '🔢' : p.kind === 'multi' ? '☑️' : '💡'} ${'★'.repeat(p.diff || 1)}</span>
          ${lr === true ? '<span class="ok">✓</span>' : lr === false ? '<span class="bad">✗</span>' : ''}</a>`;
      }).join('') || '<p class="muted">No problems match.</p>';
      $$('.pl-item', el).forEach((a) => a.addEventListener('click', () => { show(a.dataset.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }));
    }

    function choose() {
      const pool = Bank.pool(st);
      if (!pool.length) return null;
      // Prefer items not recently seen and items last answered wrong
      const recent = new Set(st.history.slice(-Math.min(pool.length - 1, 12)));
      const cands = pool.filter((p) => !recent.has(p.id));
      const weights = cands.map((p) => { const lr = Bank.lastResult(p.id); return lr === false ? 3 : lr === null ? 2 : 1; });
      let tot = weights.reduce((a, b) => a + b, 0), x = Math.random() * tot;
      for (let i = 0; i < cands.length; i++) { x -= weights[i]; if (x <= 0) return cands[i].id; }
      return (cands[0] || pool[0]).id;
    }

    function next() { const id = choose(); if (id) show(id); else area.innerHTML = '<div class="card"><p>No problems match these filters.</p></div>'; }

    function show(id, seed) {
      const inst = Bank.instance(id, seed || U.newSeed());
      st.current = inst; st.answered = false;
      st.history.push(id);
      const it = inst.item, tp = SPEC.byId[it.topic];
      const multi = inst.kind === 'multi';
      const useMC = inst.kind === 'mc' || (inst.kind === 'num' && st.mode === 'mc');
      area.innerHTML = `
        <article class="card problem">
          <div class="prob-meta"><span class="tag" style="--c:${tp.color}">${tp.name}</span><span class="muted small">${esc(it.sub || '')}</span>
            <span class="spacer"></span><span class="muted small">${'★'.repeat(it.diff || 1)}</span>
            <button class="icon-btn" id="bm" title="Bookmark">${Store.s.bookmarks[it.id] ? '🔖' : '📑'}</button></div>
          <h2>${esc(it.title)}</h2>
          <div class="prompt">${inst.prompt}</div>
          ${Bank.figureHTML(inst)}
          <div class="answer-area">
            ${multi
              ? `<div class="choices multi">${inst.choices.map((_, i) => `<button class="choice" data-i="${i}" aria-pressed="false"><span class="letter box">☐</span> ${Bank.choiceLabel(inst, i)}</button>`).join('')}</div>
                 <button class="btn primary" id="checkMulti">Check answer</button>`
              : useMC
              ? `<div class="choices">${inst.choices.map((_, i) => `<button class="choice" data-i="${i}"><span class="letter">${'ABCDEF'[i]}</span> ${Bank.choiceLabel(inst, i)}</button>`).join('')}</div>`
              : `<div class="num-entry"><input id="ans" type="text" inputmode="decimal" placeholder="Your answer" autocomplete="off"><span class="unit">${esc(inst.unit || '')}</span><button class="btn primary" id="submit">Check</button></div>`}
          </div>
          <div id="feedback"></div>
          <div class="row gap">
            ${inst.kind === 'num' ? '<button class="btn" id="hint">💡 Hint</button>' : ''}
            <button class="btn" id="showSol">Show solution</button>
            ${inst.kind === 'num' ? '<button class="btn" id="variant">🎲 New numbers</button>' : ''}
            ${it.video ? `<a class="btn" href="#/videos/${it.id}">▶️ Video walkthrough</a>` : ''}
            <span class="spacer"></span>
            <button class="btn primary" id="next">Next problem →</button>
          </div>
          <div id="sol"></div>
        </article>`;
      renderMath(area);

      const grade = (ok, chosen) => {
        if (!st.answered) {
          st.answered = true;
          Store.recordAttempt(it.id, it.topic, ok, 'practice');
          st.session.n++; if (ok) st.session.c++;
          $('#sessStat', el).textContent = `Session: ${st.session.c} / ${st.session.n}`;
        }
        $('#feedback', area).innerHTML = ok
          ? `<div class="fb ok">✅ Correct! ${inst.kind === 'num' ? `Answer: ${fmt(inst.answer, 4)} ${esc(inst.unit || '')}` : ''}</div>`
          : `<div class="fb bad">❌ Not quite. Correct answer: <b>${Bank.correctLabel(inst)}</b></div>`;
        showSolution();
      };
      const showSolution = () => { $('#sol', area).innerHTML = `<h3>Solution</h3>${Bank.solutionHTML(inst)}`; renderMath($('#sol', area)); };

      if (multi) {
        const picked = new Set();
        $$('.choice', area).forEach((b) => b.addEventListener('click', () => {
          if (st.answered) return;
          const i = +b.dataset.i;
          if (picked.has(i)) picked.delete(i); else picked.add(i);
          b.classList.toggle('sel', picked.has(i));
          b.setAttribute('aria-pressed', String(picked.has(i)));
          b.querySelector('.box').textContent = picked.has(i) ? '☑' : '☐';
        }));
        $('#checkMulti', area).addEventListener('click', () => {
          if (st.answered) return;
          if (!picked.size) return U.toast('Select one or more answers');
          $$('.choice', area).forEach((x, i) => {
            x.classList.add('locked');
            if (inst.correct.includes(i)) x.classList.add('right');
            else if (picked.has(i)) x.classList.add('wrong');
          });
          grade(Bank.isCorrect(inst, [...picked]));
        });
      } else if (useMC) {
        $$('.choice', area).forEach((b) => b.addEventListener('click', () => {
          if (st.answered) return;
          const i = +b.dataset.i;
          $$('.choice', area).forEach((x) => x.classList.add('locked'));
          b.classList.add(i === inst.correct ? 'right' : 'wrong');
          $$('.choice', area)[inst.correct].classList.add('right');
          grade(i === inst.correct, i);
        }));
      } else {
        const sub = () => { const v = $('#ans', area).value; if (!v.trim()) return; grade(Bank.checkNumeric(inst, v)); };
        $('#submit', area).addEventListener('click', sub);
        $('#ans', area).addEventListener('keydown', (e) => { if (e.key === 'Enter') sub(); });
        setTimeout(() => $('#ans', area) && $('#ans', area).focus(), 50);
      }
      const hb = $('#hint', area);
      if (hb) hb.addEventListener('click', () => {
        const s = inst.steps[0];
        $('#feedback', area).innerHTML = `<div class="fb hint">💡 ${s.t}${s.m ? `<div class="m">\\[${s.m}\\]</div>` : ''}</div>`;
        renderMath($('#feedback', area));
      });
      $('#showSol', area).addEventListener('click', () => {
        if (!st.answered) { st.answered = true; Store.recordAttempt(it.id, it.topic, false, 'practice'); st.session.n++; $('#sessStat', el).textContent = `Session: ${st.session.c} / ${st.session.n}`; }
        showSolution();
      });
      const vb = $('#variant', area);
      if (vb) vb.addEventListener('click', () => { st.history.pop(); show(it.id); });
      $('#next', area).addEventListener('click', next);
      $('#bm', area).addEventListener('click', (e) => {
        if (Store.s.bookmarks[it.id]) delete Store.s.bookmarks[it.id]; else Store.s.bookmarks[it.id] = true;
        Store.save(); e.target.textContent = Store.s.bookmarks[it.id] ? '🔖' : '📑';
        U.toast(Store.s.bookmarks[it.id] ? 'Bookmarked' : 'Bookmark removed');
      });
    }

    renderList();
    if (st.forceId && Bank.get(st.forceId)) show(st.forceId); else next();
  };
})(window);
