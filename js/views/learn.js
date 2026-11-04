/* Study notes (topic list + detail) and the searchable formula sheet. */
(function (global) {
  'use strict';
  const { $, $$, esc, renderMath } = U;
  const VIEWS = (global.VIEWS = global.VIEWS || {});

  function readPct(id) {
    const n = (NOTES[id] || []).length;
    if (!n) return 0;
    let r = 0;
    for (let i = 0; i < n; i++) if (Store.s.notesRead[`${id}:${i}`]) r++;
    return Math.round((100 * r) / n);
  }
  global.readPct = readPct;

  VIEWS.topics = function (el, params) {
    if (params[0]) return detail(el, params[0]);
    const stats = Store.topicStats();
    el.innerHTML = `
      <div class="page-head"><h1>📘 Study Notes</h1><p class="muted">Organized by the NCEES Machine Design &amp; Materials specification. Approximate number of exam questions shown for each area.</p></div>
      ${['Principles', 'Applications'].map((area) => `
        <h2 class="area-h">${area}</h2>
        <div class="tgrid">${SPEC.topics.filter((t) => t.area === area).map((t) => {
          const s = stats[t.id], acc = s && s.n ? Math.round((100 * s.c) / s.n) : null;
          return `<a class="tcard" href="#/topics/${t.id}" style="--c:${t.color}">
            <div class="tcard-head"><h3>${t.name}</h3><span class="qrange">${t.range[0]}–${t.range[1]} Q</span></div>
            <ul class="subs">${t.subs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
            <div class="tcard-foot"><span>📖 ${readPct(t.id)}% read</span><span>${acc === null ? 'no attempts yet' : `🎯 ${acc}% (${s.n})`}</span></div>
            <div class="mini-bar"><div style="width:${readPct(t.id)}%"></div></div></a>`;
        }).join('')}</div>`).join('')}`;
  };

  function detail(el, id) {
    const t = SPEC.byId[id];
    if (!t) { el.innerHTML = '<p>Topic not found.</p>'; return; }
    const secs = NOTES[id] || [];
    const nProb = Bank.pool({ topic: id }).length, nVid = PROBLEMS.filter((p) => p.topic === id && p.video).length;
    const idx = SPEC.topics.findIndex((x) => x.id === id);
    const prev = SPEC.topics[idx - 1], next = SPEC.topics[idx + 1];
    el.innerHTML = `
      <div class="page-head"><a href="#/topics" class="muted">← All topics</a>
        <h1><span class="dot big" style="background:${t.color}"></span>${t.name}</h1>
        <p class="muted">${t.area} · approx. ${t.range[0]}–${t.range[1]} of 80 questions</p>
        <div class="row gap wrap">
          <a class="btn primary" href="#/practice?topic=${id}">✏️ ${nProb} practice problems</a>
          ${nVid ? `<a class="btn" href="#/videos?topic=${id}">▶️ ${nVid} video walkthroughs</a>` : ''}
          <a class="btn" href="#/flashcards?topic=${id}">🃏 Flashcards</a>
          <a class="btn" href="#/exam?n=10">⏱️ Quick 10-Q quiz</a>
        </div></div>
      <div class="notes-layout">
        <nav class="toc card"><b>Contents</b>${secs.map((s, i) => `<a href="javascript:void 0" data-sec="${i}">${Store.s.notesRead[`${id}:${i}`] ? '✅' : '○'} ${esc(s.title)}</a>`).join('')}</nav>
        <div class="notes">${secs.map((s, i) => `
          <section class="card note" id="sec${i}"><h2>${esc(s.title)}</h2>${s.html}
          <label class="chk read-chk"><input type="checkbox" data-read="${i}" ${Store.s.notesRead[`${id}:${i}`] ? 'checked' : ''}> I've studied this section</label></section>`).join('')}
          <section class="card"><h3>📺 External video lessons</h3><ul>${(RESOURCES.videoSearches[id] || []).map(([n, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(n)} ↗</a></li>`).join('')}</ul></section>
          <div class="row gap">${prev ? `<a class="btn" href="#/topics/${prev.id}">← ${prev.name}</a>` : ''}<span class="spacer"></span>${next ? `<a class="btn" href="#/topics/${next.id}">${next.name} →</a>` : ''}</div>
        </div>
      </div>`;
    renderMath(el);
    $$('[data-sec]', el).forEach((a) => a.addEventListener('click', () => $('#sec' + a.dataset.sec, el).scrollIntoView({ behavior: 'smooth', block: 'start' })));
    $$('[data-read]', el).forEach((c) => c.addEventListener('change', () => {
      const k = `${id}:${c.dataset.read}`;
      if (c.checked) { Store.s.notesRead[k] = Date.now(); Store.logActivity(10); } else delete Store.s.notesRead[k];
      Store.save();
      $(`[data-sec="${c.dataset.read}"]`, el).textContent = `${c.checked ? '✅' : '○'} ${secs[+c.dataset.read].title}`;
    }));
  }

  VIEWS.formulas = function (el) {
    el.innerHTML = `
      <div class="page-head"><h1>∑ Formula Sheet</h1>
      <p class="muted">Quick-reference equations by topic. In the exam you'll only have the NCEES handbook — use this sheet to learn <i>what</i> to look for, then practice finding each in the handbook PDF.</p></div>
      <div class="filters card"><input id="fq" type="search" placeholder="Search formulas (e.g. spring, buckling, Goodman)…" class="grow">
        <button class="btn" onclick="window.print()">🖨 Print</button></div>
      <div id="fl"></div>`;
    const render = () => {
      const qv = $('#fq', el).value.toLowerCase().trim();
      $('#fl', el).innerHTML = SPEC.topics.map((t) => {
        const rows = FLASHCARDS.filter((c) => c.topic === t.id && (!qv || (c.front + ' ' + c.back).toLowerCase().includes(qv)));
        if (!rows.length) return '';
        return `<section class="card formula-sec"><h2><span class="dot" style="background:${t.color}"></span>${t.name}</h2>
          <table class="tbl formula">${rows.map((c) => `<tr><td>${c.front}</td><td>${c.back}</td></tr>`).join('')}</table></section>`;
      }).join('') || '<p class="muted">No matches.</p>';
      renderMath($('#fl', el));
    };
    $('#fq', el).addEventListener('input', render);
    render();
  };
})(window);
