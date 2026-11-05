/* Flashcards with a Leitner spaced-repetition schedule (boxes 1–5). */
(function (global) {
  'use strict';
  const { $, $$, esc, renderMath } = U;
  const VIEWS = (global.VIEWS = global.VIEWS || {});
  const INTERVAL = [0, 1, 2, 4, 8, 16]; // days until next review, by box

  function cardState(id) { return Store.s.cards[id] || { box: 1, due: 0 }; }
  function isDue(id) { return cardState(id).due <= Date.now(); }
  global.Flash = { dueCount: (topic) => FLASHCARDS.filter((c) => (!topic || topic === 'all' || c.topic === topic) && isDue(c.id)).length };

  VIEWS.flashcards = function (el, params, q) {
    if (Paywall.gate(el, 'Flashcards are part of full access')) return;
    let topic = q.topic || 'all', cram = false, deck = [], i = 0, flipped = false, sess = { right: 0, wrong: 0 };

    el.innerHTML = `
      <div class="page-head"><h1>🃏 Flashcards</h1><p class="muted">Spaced repetition: cards you know move to higher boxes and come back less often (1 → 2 → 4 → 8 → 16 days). Missed cards return to box 1.</p></div>
      <div class="filters card">
        <label>Topic <select id="ft"><option value="all">All topics</option>${SPEC.topics.map((t) => `<option value="${t.id}">${t.name}</option>`).join('')}</select></label>
        <label class="chk"><input type="checkbox" id="cram"> Cram mode (all cards, ignore schedule)</label>
        <span class="spacer"></span><div id="boxes" class="boxes"></div>
      </div>
      <div id="fcArea"></div>`;
    $('#ft', el).value = topic;

    function boxes() {
      const cnt = [0, 0, 0, 0, 0, 0];
      FLASHCARDS.filter((c) => topic === 'all' || c.topic === topic).forEach((c) => cnt[cardState(c.id).box]++);
      $('#boxes', el).innerHTML = [1, 2, 3, 4, 5].map((b) => `<span class="box b${b}" title="Box ${b}">${b}<small>${cnt[b]}</small></span>`).join('');
    }
    function load() {
      const all = FLASHCARDS.filter((c) => topic === 'all' || c.topic === topic);
      deck = U.makeRng(U.newSeed()).shuffle(cram ? all : all.filter((c) => isDue(c.id)));
      i = 0; flipped = false; sess = { right: 0, wrong: 0 };
      boxes(); show();
    }
    function show() {
      const area = $('#fcArea', el);
      if (i >= deck.length) {
        const nextDue = FLASHCARDS.filter((c) => topic === 'all' || c.topic === topic).map((c) => cardState(c.id).due).filter((d) => d > Date.now()).sort((a, b) => a - b)[0];
        area.innerHTML = `<div class="card center"><h2>${deck.length ? '🎉 Session complete' : '✅ No cards due'}</h2>
          ${deck.length ? `<p>${sess.right} known · ${sess.wrong} to review</p>` : ''}
          <p class="muted">${nextDue ? 'Next card due ' + new Date(nextDue).toLocaleDateString() : ''}</p>
          <button class="btn" id="cramNow">Cram all cards anyway</button></div>`;
        $('#cramNow', el).addEventListener('click', () => { $('#cram', el).checked = true; cram = true; load(); });
        return;
      }
      const c = deck[i], tp = SPEC.byId[c.topic];
      area.innerHTML = `
        <div class="fc-progress">${i + 1} / ${deck.length}</div>
        <div class="flashcard ${flipped ? 'flipped' : ''}" id="card" tabindex="0">
          <div class="face front"><span class="tag" style="--c:${tp.color}">${tp.short}</span><div class="fc-text">${c.front}</div><div class="muted small">Click or press space to flip</div></div>
          <div class="face back"><span class="tag" style="--c:${tp.color}">${tp.short}</span><div class="fc-text">${c.back}</div></div>
        </div>
        <div class="row gap center-row ${flipped ? '' : 'invisible'}" id="grade">
          <button class="btn danger big" id="miss">✗ Missed it (1)</button>
          <button class="btn primary big" id="got">✓ Got it (2)</button>
        </div>`;
      renderMath(area);
      const flip = () => { flipped = !flipped; $('#card', el).classList.toggle('flipped', flipped); $('#grade', el).classList.toggle('invisible', !flipped); };
      $('#card', el).addEventListener('click', flip);
      $('#miss', el).addEventListener('click', () => grade(false));
      $('#got', el).addEventListener('click', () => grade(true));
      area.__flip = flip;
    }
    function grade(ok) {
      const c = deck[i], s = cardState(c.id);
      s.box = ok ? Math.min(5, s.box + 1) : 1;
      s.due = Date.now() + INTERVAL[s.box] * U.DAY - 3600e3; // an hour of slack
      s.t = Date.now();
      Store.s.cards[c.id] = s;
      Store.logActivity(0.5);
      Store.save();
      ok ? sess.right++ : sess.wrong++;
      if (!ok && !cram) deck.push(c); // see it again this session
      i++; flipped = false; boxes(); show();
    }
    const key = (e) => {
      if (/INPUT|SELECT/.test(document.activeElement.tagName)) return;
      const area = $('#fcArea', el);
      if (e.key === ' ') { e.preventDefault(); area.__flip && area.__flip(); }
      if (flipped && e.key === '1') grade(false);
      if (flipped && e.key === '2') grade(true);
    };
    document.addEventListener('keydown', key);
    $('#ft', el).addEventListener('change', (e) => { topic = e.target.value; load(); });
    $('#cram', el).addEventListener('change', (e) => { cram = e.target.checked; load(); });
    load();
    return () => document.removeEventListener('keydown', key);
  };
})(window);
