/* Dashboard: countdown, readiness, this week's plan, topic mastery, quick actions. */
(function (global) {
  'use strict';
  const { $, $$, esc, fmt } = U;
  const VIEWS = (global.VIEWS = global.VIEWS || {});

  const TIPS = [
    'Download the NCEES PE Mechanical Reference Handbook and practice with ONLY that PDF — it is the only reference allowed in the exam.',
    'Learn to Ctrl+F the handbook for keywords like "Goodman", "spring", "Euler", "bolt" — speed of lookup is a major time saver.',
    'Budget ≈6 minutes per question. If you’re stuck at 3 minutes, flag it, guess, and move on.',
    'Unit mistakes are the #1 cause of wrong answers: lbf vs. lbm, in vs. ft, rpm vs. rad/s.',
    'Wrong answer choices are usually the results of common mistakes. If your answer matches a choice, double-check the step you’re least sure of.',
    'Use the same approved calculator every day so the keystrokes are automatic by exam day.',
    'After every practice set, re-work the problems you missed without looking at the solution.',
    'Mixing topics in practice (interleaving) builds the recognition skill the exam requires.',
    'Sleep matters: memory consolidation happens overnight. Protect your sleep the week before the exam.'
  ];

  function readiness() {
    const st = Store.topicStats();
    let num = 0, den = 0, covered = 0;
    SPEC.topics.forEach((t) => {
      const w = SPEC.weight(t.id), s = st[t.id];
      const acc = s && s.n ? s.recent.reduce((a, b) => a + b, 0) / s.recent.length : 0;
      const cov = s ? Math.min(1, s.n / 15) : 0;
      num += w * acc * cov; den += w; covered += cov * w;
    });
    return { score: Math.round((100 * num) / den), coverage: Math.round((100 * covered) / den) };
  }
  global.readiness = readiness;

  VIEWS.dashboard = function (el) {
    const plan = Store.s.plan;
    const examDate = plan ? U.parseDate(plan.settings.examDate) : null;
    const daysLeft = examDate ? U.daysBetween(U.today(), examDate) : null;
    const stats = Store.topicStats();
    const total = Store.s.attempts.length, correct = Store.s.attempts.filter((a) => a.correct).length;
    const rd = readiness();
    const wk = plan && Planner.currentWeek(plan);
    const prog = plan && Planner.progress(plan);
    const due = global.Flash ? Flash.dueCount() : 0;
    const tip = TIPS[Math.floor(Date.now() / U.DAY) % TIPS.length];
    const weak = SPEC.topics.map((t) => ({ t, s: stats[t.id] })).filter((x) => x.s && x.s.n >= 3).sort((a, b) => a.s.c / a.s.n - b.s.c / b.s.n)[0];

    el.innerHTML = `
      ${Paywall.isLocked() && Auth.cloudEnabled ? Paywall.banner('You’re on the free sample. Get every note, problem, video, flashcard and timed practice exam.') : ''}
      <div class="hero card">
        <div class="hero-main">
          <h1>${daysLeft != null ? (daysLeft > 0 ? `<span class="big-num">${daysLeft}</span> days to your exam` : daysLeft === 0 ? 'Exam day — you’ve got this! 💪' : 'Exam date has passed') : 'Welcome to your PE MDM prep'}</h1>
          <p class="muted">${examDate ? `${U.niceDate(examDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · ${plan.nWeeks}-week plan` : 'Set your exam date in the Study Planner to get a personalized week-by-week schedule.'}</p>
          ${plan ? `<div class="phase-strip">${phaseStrip(plan)}</div>` : '<a class="btn primary big" href="#/planner">🗓️ Build my study plan</a>'}
        </div>
        <div class="hero-stats">
          <div class="stat"><div class="stat-v">${rd.score}<small>%</small></div><div class="stat-l">Readiness<span class="info" title="Spec-weighted recent accuracy × topic coverage (15+ attempts per topic for full credit)">ⓘ</span></div></div>
          <div class="stat"><div class="stat-v">${total}</div><div class="stat-l">Problems done</div></div>
          <div class="stat"><div class="stat-v">${total ? Math.round((100 * correct) / total) : 0}<small>%</small></div><div class="stat-l">Accuracy</div></div>
          <div class="stat"><div class="stat-v">${Store.streak()}<small>🔥</small></div><div class="stat-l">Day streak</div></div>
        </div>
      </div>

      <div class="grid-dash">
        <section class="card">
          <div class="card-head"><h2>${wk ? `This week · ${wk.phase === 'learn' ? 'Learn' : wk.phase === 'practice' ? 'Practice exams' : 'Final review'}` : 'Today'}</h2>
            ${prog ? `<span class="pill ${prog.behind > 0 ? 'warn' : 'good'}">${prog.behind > 0 ? `${prog.behind} task${prog.behind > 1 ? 's' : ''} behind` : 'On track ✓'}</span>` : ''}</div>
          ${wk ? `<ul class="tasks">${wk.tasks.map((t) => taskLi(t)).join('')}</ul><a href="#/planner" class="small">Full plan →</a>`
               : `<p class="muted">No plan yet. Start with a quick diagnostic to find your baseline:</p><a class="btn" href="#/exam?n=20">Take a 20-question diagnostic</a>`}
        </section>
        <section class="card">
          <h2>Quick start</h2>
          <div class="quick">
            <a class="qa" href="#/practice?topic=${weak ? weak.t.id : 'all'}"><span>🎯</span><b>${weak ? 'Drill weakest topic' : 'Mixed practice'}</b><small>${weak ? esc(weak.t.name) : 'Random problems, all topics'}</small></a>
            <a class="qa" href="#/flashcards"><span>🃏</span><b>Flashcards</b><small>${due} due now</small></a>
            <a class="qa" href="#/videos"><span>▶️</span><b>Video problems</b><small>${PROBLEMS.filter((p) => p.video).length} walkthroughs</small></a>
            <a class="qa" href="#/exam"><span>⏱️</span><b>Practice exam</b><small>${Store.s.activeExam ? 'Resume in-progress exam' : 'Timed, CBT-style'}</small></a>
          </div>
          <div class="tip">💡 <b>Tip:</b> ${esc(tip)}</div>
        </section>
      </div>

      <section class="card">
        <div class="card-head"><h2>Topic mastery</h2><span class="muted small">bar = accuracy · ▮ = 70% target · number = attempts</span></div>
        ${SPEC.topics.map((t) => {
          const s = stats[t.id], acc = s && s.n ? Math.round((100 * s.c) / s.n) : 0;
          return `<a class="bar-row link" href="#/topics/${t.id}"><span class="bar-label">${t.name} <small class="muted">${t.range[0]}–${t.range[1]}Q</small></span>
            <div class="bar target"><div style="width:${acc}%;background:${t.color}"></div></div><span class="bar-val">${s ? acc + '%' : '—'} <small class="muted">${s ? s.n : 0}</small></span></a>`;
        }).join('')}
      </section>`;
    bindTasks(el);
    Paywall.bind(el);
  };

  function phaseStrip(plan) {
    const segs = [['learn', plan.learnWeeks, 'Learn'], ['practice', plan.practiceWeeks, 'Practice'], ['final', plan.finalWeeks, 'Final']].filter((s) => s[1] > 0);
    const t = U.isoDate(U.today());
    const ci = plan.weeks.findIndex((w) => w.start <= t && t <= w.end);
    const pos = ci < 0 ? (t < plan.weeks[0].start ? 0 : 100) : ((ci + 0.5) / plan.nWeeks) * 100;
    return `<div class="pstrip">${segs.map(([k, n, l]) => `<div class="pseg ${k}" style="flex:${n}"><span>${l} · ${n}w</span></div>`).join('')}<div class="pnow" style="left:${pos}%" title="You are here"></div></div>`;
  }
  global.phaseStrip = phaseStrip;

  function taskLi(t) {
    const done = !!Store.s.planDone[t.id];
    const d = U.parseDate(t.date);
    const late = !done && t.date < U.isoDate(U.today());
    return `<li class="task ${done ? 'done' : ''} ${late ? 'late' : ''}"><label><input type="checkbox" data-task="${esc(t.id)}" ${done ? 'checked' : ''}>
      <span class="tdate">${U.niceDate(d, { weekday: 'short', month: 'numeric', day: 'numeric' })}</span>
      <span class="tlabel">${esc(t.label)}</span></label>
      <span class="tmeta">${t.minutes ? `${t.minutes >= 60 ? fmt(t.minutes / 60, 2) + ' h' : t.minutes + ' min'}` : ''}${t.link ? ` <a href="${t.link}">go →</a>` : ''}</span></li>`;
  }
  global.taskLi = taskLi;

  function bindTasks(el) {
    $$('[data-task]', el).forEach((c) => c.addEventListener('change', () => {
      if (c.checked) Store.s.planDone[c.dataset.task] = Date.now(); else delete Store.s.planDone[c.dataset.task];
      Store.save();
      c.closest('.task').classList.toggle('done', c.checked);
      c.closest('.task').classList.remove('late');
      if (c.checked) U.toast('Nice! Task complete ✔');
    }));
  }
  global.bindTasks = bindTasks;
})(window);
