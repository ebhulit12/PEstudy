/* "Video problems": narrated, auto-advancing animated walkthroughs of worked problems.
   Uses the Web Speech API for narration when available, with captions always shown. */
(function (global) {
  'use strict';
  const { $, $$, esc, fmt, renderMath, speakable } = U;
  const VIEWS = (global.VIEWS = global.VIEWS || {});

  VIEWS.videos = function (el, params, q) {
    if (params[0]) return player(el, params[0], q);
    const vids = PROBLEMS.filter((p) => p.video);
    const topicSel = q.topic || 'all';
    const groups = SPEC.topics.filter((t) => topicSel === 'all' || t.id === topicSel)
      .map((t) => ({ t, items: vids.filter((v) => v.topic === t.id) }));
    el.innerHTML = `
      <div class="page-head"><h1>▶️ Video Problems</h1>
      <p class="muted">Narrated, step-by-step walkthroughs of exam-style problems. Each one starts with the problem and a <b>“pause &amp; try”</b> countdown — attempt it on paper first, then watch the solution unfold. Turn on 🔊 narration for audio. Every replay can use new numbers.</p></div>
      <div class="filters card"><label>Topic <select id="vt"><option value="all">All topics</option>${SPEC.topics.map((t) => `<option value="${t.id}">${t.name}</option>`).join('')}</select></label>
      <span class="spacer"></span><span class="muted small">${vids.length} walkthroughs</span></div>
      ${groups.map((g) => `
        <section class="vgroup"><h2><span class="dot" style="background:${g.t.color}"></span>${g.t.name}</h2>
        <div class="vgrid">${g.items.map((v) => `
          <a class="vcard" href="#/videos/${v.id}">
            <div class="thumb" style="--c:${g.t.color}">${v.fig && FIG[v.fig] ? FIG[v.fig]({}) : `<div class="thumb-icon">▶</div>`}<span class="play">▶</span></div>
            <div class="vtitle">${esc(v.title)}</div><div class="muted small">${esc(v.sub)} · ${'★'.repeat(v.diff)}</div>
          </a>`).join('') || '<p class="muted">No walkthroughs yet for this topic — see external videos below.</p>'}</div>
        <details class="ext"><summary>External video lessons on YouTube (${g.t.short})</summary><ul>${(RESOURCES.videoSearches[g.t.id] || []).map(([n, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(n)} ↗</a></li>`).join('')}</ul></details>
        </section>`).join('')}`;
    $('#vt', el).value = topicSel;
    $('#vt', el).addEventListener('change', (e) => { location.hash = '#/videos' + (e.target.value === 'all' ? '' : '?topic=' + e.target.value); });
  };

  function player(el, id, q) {
    const item = PROBLEMS.find((p) => p.id === id);
    if (!item) { el.innerHTML = '<p>Walkthrough not found.</p>'; return; }
    let seed = q.seed ? +q.seed : 12345 + id.length * 97;
    let inst, scenes, idx = 0, playing = false, timer = null, rate = 1, narrate = false, tryCount = 0;
    const synth = global.speechSynthesis;
    const tp = SPEC.byId[item.topic];
    const related = PROBLEMS.filter((p) => p.video && p.id !== id && p.topic === item.topic).slice(0, 4);

    el.innerHTML = `
      <div class="page-head"><a href="#/videos" class="muted">← All video problems</a><h1>${esc(item.title)}</h1>
        <p class="muted"><span class="tag" style="--c:${tp.color}">${tp.name}</span> ${esc(item.sub)}</p></div>
      <div class="player card">
        <div class="stage" id="stage"></div>
        <div class="timeline" id="timeline"></div>
        <div class="controls">
          <button class="btn" id="prev" title="Previous step (←)">⏮</button>
          <button class="btn primary" id="play" title="Play/Pause (space)">▶ Play</button>
          <button class="btn" id="nextS" title="Next step (→)">⏭</button>
          <span class="muted small" id="pos"></span>
          <span class="spacer"></span>
          <label class="small">Speed <select id="rate"><option>0.75</option><option selected>1</option><option>1.25</option><option>1.5</option><option>2</option></select></label>
          <button class="btn" id="narr" title="Narration">${synth ? '🔇 Narration off' : '🔇 No speech support'}</button>
          <button class="btn" id="newNums" title="Same problem, new numbers">🎲 New numbers</button>
        </div>
      </div>
      <div class="row gap wrap">
        <a class="btn" href="#/practice/${item.id}">✏️ Try an interactive version</a>
        ${related.map((r) => `<a class="btn ghost" href="#/videos/${r.id}">▶ ${esc(r.title)}</a>`).join('')}
      </div>
      <details class="card ext"><summary>More on this topic — external video lessons</summary><ul>${(RESOURCES.videoSearches[item.topic] || []).map(([n, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(n)} ↗</a></li>`).join('')}</ul></details>`;

    function build() {
      inst = Bank.instance(id, seed);
      const fig = Bank.figureHTML(inst);
      scenes = [];
      scenes.push({ kind: 'title', html: `<div class="sc-title"><div class="sc-kicker">${tp.name}</div><h2>${esc(item.title)}</h2><p>PE Mechanical · Machine Design &amp; Materials</p></div>`, say: `${item.title}. A ${tp.name} problem.`, dur: 3500 });
      scenes.push({ kind: 'problem', html: `<div class="sc-split"><div><div class="sc-kicker">The problem</div><div class="sc-prompt">${inst.prompt}</div></div>${fig ? `<div>${fig}</div>` : ''}</div>`, say: speakable(inst.prompt), dur: Math.max(7000, speakable(inst.prompt).length * 65) });
      scenes.push({ kind: 'try', html: `<div class="sc-try"><div class="sc-kicker">Pause &amp; try it</div><div class="big-count" id="count">20</div><p>Work it on paper — the solution starts when the countdown ends.<br><span class="muted">Press ⏭ to skip.</span></p></div>`, say: 'Pause the video and try this one yourself. The solution starts in twenty seconds.', dur: 20000 });
      inst.steps.forEach((s, i) => {
        scenes.push({
          kind: 'step',
          html: `<div class="sc-split"><div><div class="sc-kicker">Step ${i + 1} of ${inst.steps.length}</div><div class="sc-text">${s.t}</div>${s.m ? `<div class="sc-math">\\[${s.m}\\]</div>` : ''}</div>${fig && i === 0 ? `<div class="sc-fig-small">${fig}</div>` : ''}</div>`,
          say: speakable(s.t), dur: Math.max(6000, speakable(s.t).length * 70 + (s.m ? 3500 : 0))
        });
      });
      scenes.push({ kind: 'answer', html: `<div class="sc-answer"><div class="sc-kicker">Answer</div><div class="answer-big">${fmt(inst.answer, 4)} <span>${esc(inst.unit || '')}</span></div><p class="muted">Tip: ${tipFor(item)}</p></div>`, say: `The answer is ${fmt(inst.answer, 3)} ${unitSay(inst.unit)}.`, dur: 6000 });
      $('#timeline', el).innerHTML = scenes.map((s, i) => `<button class="seg" data-i="${i}" title="${s.kind}"><span class="fill"></span></button>`).join('');
      $$('.seg', el).forEach((b) => b.addEventListener('click', () => go(+b.dataset.i, playing)));
      go(0, false);
    }
    function unitSay(u) {
      const map = { 'lbf·in': 'pound-inches', 'lbf·ft': 'foot-pounds', 'ft·lbf': 'foot-pounds', 'lbf/in': 'pounds per inch', lbf: 'pounds', psi: 'P S I', ksi: 'K S I', 'in³': 'cubic inches', 'in/s': 'inches per second', 'ft/s': 'feet per second', rpm: 'R P M', hp: 'horsepower', Hz: 'hertz', in: 'inches', h: 'hours', rev: 'revolutions', 'slug·ft²': 'slug feet squared', min: 'minutes', '$': 'dollars', '$/yr': 'dollars per year', weeks: 'weeks' };
      return map[u] || u || '';
    }
    function tipFor(it) {
      const tips = {
        som: 'Find the matching beam/stress formula in the handbook first, then plug in — don’t derive.',
        vib: 'Keep units consistent: lbf/in stiffness needs mass in lbf·s²/in (W/386.1).',
        mc: 'Write down every unit conversion explicitly: rpm → rad/s, in → ft, hp → ft·lbf/min.',
        jf: 'Check whether the problem gives diametral or radial values, and single vs. double shear.',
        mat: 'Distractor answers often come from a missed factor — re-read what is restrained or corrected.',
        esm: 'Always draw the free-body diagram — it takes 20 seconds and prevents sign errors.',
        bep: 'Draw the cash-flow diagram and label every arrow before choosing a factor.',
        sk: 'Read the tolerance callout carefully: which limit gives the extreme condition?'
      };
      return tips[it.topic] || 'Check units at every step.';
    }

    function clear() { clearTimeout(timer); clearInterval(countInt); if (synth) synth.cancel(); }
    let countInt = null;
    function go(i, autoplay) {
      clear();
      idx = Math.max(0, Math.min(scenes.length - 1, i));
      const sc = scenes[idx];
      const stage = $('#stage', el);
      stage.innerHTML = `<div class="scene sc-${sc.kind}">${sc.html}</div><div class="caption">${esc(sc.say)}</div>`;
      renderMath(stage);
      $$('.seg', el).forEach((b, j) => { b.classList.toggle('done', j < idx); b.classList.toggle('cur', j === idx); b.querySelector('.fill').style.animation = 'none'; });
      $('#pos', el).textContent = `${idx + 1} / ${scenes.length}`;
      if (autoplay) run(sc); else setPlaying(false);
    }
    function run(sc) {
      setPlaying(true);
      const seg = $$('.seg', el)[idx].querySelector('.fill');
      const dur = sc.dur / rate;
      seg.style.animation = 'none'; void seg.offsetWidth;
      seg.style.animation = `segfill ${dur}ms linear forwards`;
      if (sc.kind === 'try') {
        let n = Math.round(dur / 1000);
        const c = $('#count', el); if (c) c.textContent = n;
        countInt = setInterval(() => { n--; const c2 = $('#count', el); if (c2) c2.textContent = Math.max(0, n); }, 1000);
      }
      let spoken = !narrate || !synth, elapsed = false;
      const advance = () => { if (spoken && elapsed) { if (idx < scenes.length - 1) go(idx + 1, true); else { setPlaying(false); tryCount++; U.toast('Walkthrough complete ✔'); Store.logActivity(5); } } };
      timer = setTimeout(() => { elapsed = true; advance(); }, narrate && synth && sc.kind !== 'try' ? Math.min(dur, 2500) : dur);
      if (narrate && synth) {
        const u = new SpeechSynthesisUtterance(sc.say);
        u.rate = Math.min(2, rate);
        u.onend = () => { spoken = true; setTimeout(advance, 600); };
        u.onerror = () => { spoken = true; advance(); };
        synth.speak(u);
      }
    }
    function setPlaying(p) { playing = p; $('#play', el).textContent = p ? '⏸ Pause' : '▶ Play'; }

    $('#play', el).addEventListener('click', () => { if (playing) { clear(); setPlaying(false); const f = $$('.seg', el)[idx].querySelector('.fill'); f.style.animationPlayState = 'paused'; } else { if (idx === scenes.length - 1) go(0, true); else run(scenes[idx]); } });
    $('#prev', el).addEventListener('click', () => go(idx - 1, playing));
    $('#nextS', el).addEventListener('click', () => go(idx + 1, playing));
    $('#rate', el).addEventListener('change', (e) => { rate = +e.target.value; if (playing) go(idx, true); });
    $('#narr', el).addEventListener('click', (e) => {
      if (!synth) return;
      narrate = !narrate; e.target.textContent = narrate ? '🔊 Narration on' : '🔇 Narration off';
      if (playing) go(idx, true);
    });
    $('#newNums', el).addEventListener('click', () => { seed = U.newSeed(); build(); });
    const key = (e) => {
      if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
      if (e.key === ' ') { e.preventDefault(); $('#play', el).click(); }
      if (e.key === 'ArrowRight') go(idx + 1, playing);
      if (e.key === 'ArrowLeft') go(idx - 1, playing);
    };
    document.addEventListener('keydown', key);
    build();
    return () => { clear(); document.removeEventListener('keydown', key); };
  }
})(window);
