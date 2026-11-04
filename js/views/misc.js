/* Progress analytics, exam strategy guide, resources. */
(function (global) {
  'use strict';
  const { $, $$, esc, fmt } = U;
  const VIEWS = (global.VIEWS = global.VIEWS || {});

  VIEWS.progress = function (el) {
    const st = Store.topicStats();
    const rd = readiness();
    const exams = Store.s.exams;
    // Heatmap: last 16 weeks
    const today = U.today();
    const startH = U.addDays(today, -7 * 16 + 1 - today.getDay());
    let cells = '';
    for (let d = startH; d <= today; d = U.addDays(d, 1)) {
      const m = Store.s.studyLog[U.isoDate(d)] || 0;
      const lv = m === 0 ? 0 : m < 15 ? 1 : m < 45 ? 2 : m < 90 ? 3 : 4;
      cells += `<span class="hm l${lv}" title="${U.niceDate(d)}: ~${Math.round(m)} min"></span>`;
    }
    // accuracy per day last 30 days
    const byDay = {};
    Store.s.attempts.forEach((a) => { const k = U.isoDate(new Date(a.ts)); (byDay[k] = byDay[k] || { n: 0, c: 0 }); byDay[k].n++; if (a.correct) byDay[k].c++; });
    const days30 = Array.from({ length: 30 }, (_, i) => U.isoDate(U.addDays(today, i - 29)));
    const maxN = Math.max(1, ...days30.map((k) => (byDay[k] ? byDay[k].n : 0)));
    const cardsKnown = Object.values(Store.s.cards).filter((c) => c.box >= 3).length;

    el.innerHTML = `
      <div class="page-head"><h1>📈 Progress</h1></div>
      <div class="hero-stats card wide">
        <div class="stat"><div class="stat-v">${rd.score}<small>%</small></div><div class="stat-l">Readiness</div></div>
        <div class="stat"><div class="stat-v">${rd.coverage}<small>%</small></div><div class="stat-l">Spec coverage</div></div>
        <div class="stat"><div class="stat-v">${Store.s.attempts.length}</div><div class="stat-l">Attempts</div></div>
        <div class="stat"><div class="stat-v">${exams.length}</div><div class="stat-l">Practice exams</div></div>
        <div class="stat"><div class="stat-v">${cardsKnown}<small>/${FLASHCARDS.length}</small></div><div class="stat-l">Cards known (box 3+)</div></div>
        <div class="stat"><div class="stat-v">${Math.round(Object.values(Store.s.studyLog).reduce((a, b) => a + b, 0) / 6) / 10}<small>h</small></div><div class="stat-l">Logged study time</div></div>
      </div>
      <div class="card"><h2>Accuracy by topic</h2><p class="muted small">Overall accuracy and the last 20 attempts (recent). Aim for 70%+ in every topic, especially the heavily weighted ones.</p>
        <table class="tbl"><tr><th>Topic</th><th>Exam Qs</th><th>Attempts</th><th>Overall</th><th>Recent</th><th></th></tr>
        ${SPEC.topics.map((t) => { const s = st[t.id]; const o = s ? Math.round((100 * s.c) / s.n) : null; const r = s ? Math.round((100 * s.recent.reduce((a, b) => a + b, 0)) / s.recent.length) : null;
          return `<tr><td><span class="dot" style="background:${t.color}"></span>${t.name}</td><td>${t.range[0]}–${t.range[1]}</td><td>${s ? s.n : 0}</td>
            <td class="${o == null ? '' : o >= 70 ? 'ok' : o >= 55 ? 'warn' : 'bad'}">${o == null ? '—' : o + '%'}</td><td>${r == null ? '—' : r + '%'}</td><td><a href="#/practice?topic=${t.id}">practice →</a></td></tr>`; }).join('')}
        </table></div>
      <div class="grid-dash">
        <div class="card"><h2>Study activity (16 weeks)</h2><div class="heatmap">${cells}</div><p class="muted small">Approximate minutes logged from problems, notes, cards and exams. Current streak: ${Store.streak()} days 🔥</p></div>
        <div class="card"><h2>Problems per day (30 days)</h2><div class="spark">${days30.map((k) => { const b = byDay[k]; const h = b ? (100 * b.n) / maxN : 0; const acc = b ? b.c / b.n : 0;
          return `<span title="${k}: ${b ? b.c + '/' + b.n : 0}" style="height:${Math.max(2, h)}%;background:${b ? `hsl(${Math.round(acc * 120)},65%,50%)` : 'var(--line)'}"></span>`; }).join('')}</div>
          <p class="muted small">Bar color = accuracy (red → green).</p></div>
      </div>
      <div class="card"><h2>Practice exam history</h2>
        ${exams.length ? `<div class="spark exams">${exams.slice(-20).map((x) => { const p = Math.round((100 * x.correct) / x.n); return `<span title="${new Date(x.ts).toLocaleDateString()}: ${p}% (${x.n} Q)" style="height:${p}%"><i>${p}</i></span>`; }).join('')}<div class="target-line" style="bottom:70%"></div></div>` : '<p class="muted">No practice exams yet. <a href="#/exam">Take one →</a></p>'}
      </div>
      <div class="card"><h2>Your data</h2><p class="muted small">Everything is stored locally in this browser. Export a backup to move devices or keep it safe.</p>
        <div class="row gap wrap"><button class="btn" id="exp">⬇ Export backup</button><label class="btn">⬆ Import backup<input type="file" id="imp" accept="application/json" hidden></label><button class="btn danger" id="rst">Reset all progress</button></div></div>`;

    $('#exp', el).addEventListener('click', () => U.download(`pe-mdm-backup-${U.isoDate(new Date())}.json`, Store.exportJSON()));
    $('#imp', el).addEventListener('change', (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((t) => { try { Store.importJSON(t); U.toast('Backup imported'); VIEWS.progress(el); updateCountdown(); } catch (err) { U.toast('Import failed: ' + err.message); } });
    });
    $('#rst', el).addEventListener('click', () => { if (confirm('Erase ALL progress, plan and settings? This cannot be undone.')) { Store.reset(); U.toast('Progress reset'); VIEWS.progress(el); updateCountdown(); } });
  };

  VIEWS.strategy = function (el) {
    el.innerHTML = `
      <div class="page-head"><h1>🎯 Exam Strategy</h1><p class="muted">Knowing the format and having a game plan is a big part of confidence. Verify current details at ncees.org.</p></div>
      <div class="grid-dash">
        <section class="card"><h2>The exam at a glance</h2>
          <ul>
            <li><b>Format:</b> computer-based test (CBT) at a Pearson VUE center, offered year-round.</li>
            <li><b>Length:</b> 80 questions; 9-hour appointment including a tutorial, a scheduled break, and ≈8 hours of testing.</li>
            <li><b>Sections:</b> questions are split into two parts with an optional break between them; once you submit a section you can't return to it.</li>
            <li><b>Question types:</b> mostly multiple choice, plus alternative item types — multiple correct ("select all that apply"), point-and-click on a figure, drag-and-drop, and fill-in-the-blank numeric.</li>
            <li><b>Reference:</b> only the searchable electronic <b>NCEES PE Mechanical Reference Handbook</b> provided on-screen. No books or notes.</li>
            <li><b>Calculator:</b> NCEES-approved models only (Casio fx-115/fx-991 series, HP 33s/35s, TI-30X/TI-36X series).</li>
            <li><b>Results:</b> typically within 7–10 days by email; pass/fail with a diagnostic report if you don't pass.</li>
          </ul></section>
        <section class="card"><h2>Time management</h2>
          <ul>
            <li><b>≈6 minutes per question</b> on average. Many conceptual questions take 1–2 minutes — bank that time for calculations.</li>
            <li><b>Two-pass method:</b> pass 1 — answer everything you can in &lt; 4 min, flag the rest with a best guess. Pass 2 — work flagged items.</li>
            <li><b>Never leave a blank.</b> There is no penalty for guessing.</li>
            <li>Check the clock at question 10, 20, 30, 40 of each section: you should have ≈60 min used per 10 questions.</li>
            <li>Take the break. Eat, hydrate, and reset.</li>
          </ul></section>
        <section class="card"><h2>Mastering the handbook</h2>
          <ul>
            <li>Download it from your MyNCEES account <b>now</b> and use it for every practice problem — never a textbook.</li>
            <li>Learn the handbook's section order (units → math → mechanics → materials → machine design → …) so you can jump to a section via the bookmarks.</li>
            <li>Ctrl+F works on exact strings. Search distinctive terms: “Goodman”, “Euler”, “Bergstrasser”, “preload”, “fillet weld”, “transmissibility”.</li>
            <li>Note which equations are <i>not</i> in the handbook (or are hard to find) and memorize them — the flashcards here focus on those plus the high-frequency ones.</li>
            <li>Watch the handbook's sign conventions and units — they may differ from your textbook.</li>
          </ul></section>
        <section class="card"><h2>Solving technique</h2>
          <ol>
            <li>Read the <b>last sentence first</b> — what exactly is asked, and in what units?</li>
            <li>Sketch an FBD or diagram. Write knowns with units.</li>
            <li>Find the governing equation in the handbook.</li>
            <li>Convert units <i>before</i> substituting.</li>
            <li>Sanity-check magnitude: is a 1-inch steel shaft stress really 2 Msi?</li>
            <li>If your answer is between two choices, re-check rounding and constants (g, 33,000, 63,025).</li>
          </ol></section>
        <section class="card"><h2>Building confidence</h2>
          <ul>
            <li>Confidence comes from evidence: track your accuracy on the Progress page and watch it climb.</li>
            <li>Simulate the real thing at least twice: full-length, timed, handbook-only, approved calculator, in one sitting.</li>
            <li>Review every miss: categorize as concept gap, handbook lookup, units, or careless — fix the category, not just the problem.</li>
            <li>In the final week, stop learning new material. Review, sleep, and do light confidence-building sets.</li>
            <li>On exam day, expect a few questions you can't do — that's normal. Flag, guess, move on.</li>
          </ul></section>
        <section class="card"><h2>Exam-day checklist</h2>
          <ul class="checklist">${['Government-issued ID (name matches NCEES account exactly)', 'Approved calculator (+ a backup approved calculator)', 'Confirmation email / appointment time & test-center address', 'Plan to arrive 30 minutes early', 'Snacks & water for the break (stored in locker)', 'Comfortable layers — test centers can be cold', 'Good night’s sleep the two nights before'].map((x, i) => `<li><label><input type="checkbox" data-cl="${i}" ${(Store.s.checklist || {})[i] ? 'checked' : ''}> ${x}</label></li>`).join('')}</ul></section>
      </div>`;
    $$('[data-cl]', el).forEach((c) => c.addEventListener('change', () => { Store.s.checklist = Store.s.checklist || {}; Store.s.checklist[c.dataset.cl] = c.checked; Store.save(); }));
  };

  VIEWS.resources = function (el) {
    const R0 = RESOURCES;
    const li = (r) => `<li>${r.url ? `<a href="${r.url}" target="_blank" rel="noopener">${esc(r.name)} ↗</a>` : `<b>${esc(r.name)}</b>`}<div class="muted small">${esc(r.note)}</div></li>`;
    el.innerHTML = `
      <div class="page-head"><h1>🔗 Resources</h1><p class="muted">Official sources, recommended references, and curated video searches for every topic.</p></div>
      <div class="grid-dash">
        <section class="card"><h2>Official (NCEES)</h2><ul class="res">${R0.official.map(li).join('')}</ul></section>
        <section class="card"><h2>Books &amp; prep providers</h2><ul class="res">${R0.books.map(li).join('')}</ul></section>
        <section class="card"><h2>Free learning</h2><ul class="res">${R0.free.map(li).join('')}</ul></section>
        <section class="card"><h2>General video searches</h2><ul class="res">${R0.videoSearches.general.map(([n, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(n)} ↗</a></li>`).join('')}</ul></section>
      </div>
      <div class="card"><h2>Video lessons by topic</h2><div class="grid-dash">${SPEC.topics.map((t) => `<div><h3><span class="dot" style="background:${t.color}"></span>${t.name}</h3><ul>${(R0.videoSearches[t.id] || []).map(([n, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(n)} ↗</a></li>`).join('')}</ul></div>`).join('')}</div></div>`;
  };
})(window);
