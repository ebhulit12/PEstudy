/* Study plan generator: turns exam date + availability + self-assessment into a
   week-by-week, day-by-day plan weighted by the NCEES spec and your weak areas. */
(function (global) {
  'use strict';
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function defaultSettings() {
    const t = U.today();
    // Default exam date: mid-March of the upcoming March
    let y = t.getFullYear();
    if (t.getMonth() > 2 || (t.getMonth() === 2 && t.getDate() > 15)) y++;
    return {
      startDate: U.isoDate(t),
      examDate: `${y}-03-15`,
      hoursPerWeek: 12,
      days: [false, true, true, false, true, false, true], // Mon, Tue, Thu, Sat
      ratings: Object.fromEntries(SPEC.topics.map((tp) => [tp.id, 3])),
      useStats: true
    };
  }

  /** Blend self-rating with measured accuracy (if enough attempts). 1 = weak, 5 = strong. */
  function effectiveRating(id, settings) {
    let r = settings.ratings[id] || 3;
    if (settings.useStats) {
      const st = Store.topicStats()[id];
      if (st && st.n >= 8) {
        const acc = st.c / st.n; // 0..1 -> 1..5
        r = 0.5 * r + 0.5 * (1 + acc * 4);
      }
    }
    return r;
  }

  function generate(settings) {
    const start = U.parseDate(settings.startDate);
    const exam = U.parseDate(settings.examDate);
    const totalDays = U.daysBetween(start, exam);
    if (totalDays < 1) throw new Error('Exam date must be after the start date.');
    const studyDows = settings.days.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    if (!studyDows.length) throw new Error('Select at least one study day.');
    const hpw = Math.max(1, +settings.hoursPerWeek || 10);

    const nWeeks = Math.max(1, Math.ceil(totalDays / 7));
    let finalWeeks = nWeeks >= 3 ? 1 : 0;
    let practiceWeeks = nWeeks >= 4 ? Math.min(4, Math.max(1, Math.round(nWeeks * 0.2))) : nWeeks >= 2 ? 1 : 0;
    let learnWeeks = nWeeks - finalWeeks - practiceWeeks;
    if (learnWeeks < 1) { learnWeeks = Math.max(1, nWeeks - practiceWeeks); finalWeeks = 0; practiceWeeks = nWeeks - learnWeeks; }

    // Topic hour allocation for learning phase
    const topics = SPEC.topics.slice().sort((a, b) => a.order - b.order);
    const learnCap = hpw * 0.8; // 20% of each learn week reserved for spaced review
    const totalLearn = Math.max(learnWeeks * learnCap * 0.5, learnWeeks * learnCap - 2 - (learnWeeks >= 4 ? 4 : 0));
    const raw = topics.map((t) => {
      const r = effectiveRating(t.id, settings);
      const factor = 0.5 + (5 - r) * 0.25; // rating 5 -> 0.5, rating 1 -> 1.5
      return { id: t.id, w: SPEC.weight(t.id) * factor, rating: r };
    });
    const wsum = raw.reduce((s, x) => s + x.w, 0);
    raw.forEach((x) => (x.hours = (x.w / wsum) * totalLearn));

    // Lay topics sequentially into learn weeks
    const weeks = [];
    for (let w = 0; w < nWeeks; w++) {
      const ws = U.addDays(start, w * 7);
      const we = U.addDays(ws, 6) > exam ? U.addDays(exam, -1) : U.addDays(ws, 6);
      weeks.push({
        idx: w, start: U.isoDate(ws), end: U.isoDate(we), focus: [], tasks: [],
        phase: w < learnWeeks ? 'learn' : w < learnWeeks + practiceWeeks ? 'practice' : 'final'
      });
    }
    const midLearn = learnWeeks >= 4 ? Math.floor(learnWeeks / 2) : -1;
    const capFor = (w) => Math.max(1, learnCap - (w === 0 ? 2 : 0) - (w === midLearn ? 4 : 0)); // leave room for diagnostic / mid-point exams
    let wi = 0, room = capFor(0);
    const seen = new Set();
    for (const t of raw) {
      let h = t.hours;
      while (h > 0.01 && wi < learnWeeks) {
        const take = Math.min(h, room);
        const existing = weeks[wi].focus.find((x) => x.topic === t.id);
        if (existing) existing.hours += take; else weeks[wi].focus.push({ topic: t.id, hours: take });
        h -= take; room -= take;
        if (room <= 0.01) { wi++; room = capFor(wi); }
      }
    }

    // Build tasks
    const vidCount = (id) => PROBLEMS.filter((p) => p.topic === id && p.video).length;
    const weakest = raw.slice().sort((a, b) => a.rating - b.rating).slice(0, 3).map((x) => x.id);

    weeks.forEach((wk) => {
      const T = (type, label, minutes, extra = {}) =>
        wk.tasks.push(Object.assign({ id: `${wk.start}:${type}:${extra.topic || ''}:${wk.tasks.length}`, type, label, minutes: Math.round(minutes) }, extra));
      if (wk.phase === 'learn') {
        if (wk.idx === 0) T('exam', 'Diagnostic: 20-question mixed practice exam (find your baseline)', 120, { link: '#/exam?n=20' });
        if (wk.idx === midLearn) T('exam', 'Mid-point check: 40-question timed practice exam', 240, { link: '#/exam?n=40' });
        wk.focus.forEach((fx) => {
          const name = SPEC.byId[fx.topic].name;
          const mins = fx.hours * 60;
          if (!seen.has(fx.topic)) {
            seen.add(fx.topic);
            T('read', `Read study notes: ${name}`, mins * 0.35, { topic: fx.topic, link: `#/topics/${fx.topic}` });
            if (vidCount(fx.topic)) T('video', `Watch video walkthroughs: ${name}`, mins * 0.15, { topic: fx.topic, link: `#/videos?topic=${fx.topic}` });
            const n = Math.max(3, Math.round((mins * 0.5) / 12));
            T('practice', `Solve ${n} practice problems: ${name}`, mins * 0.5, { topic: fx.topic, link: `#/practice?topic=${fx.topic}` });
          } else {
            const n = Math.max(3, Math.round(mins / 12));
            T('practice', `Continue ${name}: ${n} more problems + re-read weak sections`, mins, { topic: fx.topic, link: `#/practice?topic=${fx.topic}` });
          }
        });
        const rev = hpw * 60 * 0.2;
        T('flash', 'Flashcard review (due cards)', rev * 0.5, { link: '#/flashcards' });
        if (wk.idx > 0) T('mixed', 'Mixed review: 10 problems from previous topics', rev * 0.5, { link: '#/practice?topic=all' });
        else T('mixed', 'Bookmark the NCEES handbook PDF and practice Ctrl+F searches', rev * 0.5, { link: '#/strategy' });
      } else if (wk.phase === 'practice') {
        const pIdx = wk.idx - learnWeeks;
        if (pIdx === 0) T('exam', 'Full-length timed practice exam (80 questions, 8 h)', 480, { link: '#/exam?n=80' });
        else if (pIdx === 1) T('exam', 'NCEES official MDM practice exam under real conditions', 480, { link: '#/resources' });
        else T('exam', 'Timed 40-question practice exam (weak-topic emphasis)', 240, { link: '#/exam?n=40' });
        const left = Math.max(60, hpw * 60 - (pIdx <= 1 ? 480 : 240));
        T('review', 'Review EVERY missed exam question — redo it without looking', left * 0.3, { link: '#/progress' });
        weakest.forEach((id) => T('practice', `Weak-area drill: ${SPEC.byId[id].name}`, (left * 0.45) / weakest.length, { topic: id, link: `#/practice?topic=${id}` }));
        T('flash', 'Flashcards + formula sheet pass', left * 0.25, { link: '#/formulas' });
      } else {
        T('review', 'Skim all formula sheets & your notes on missed problems', hpw * 60 * 0.35, { link: '#/formulas' });
        T('flash', 'Flashcards — all boxes', hpw * 60 * 0.25, { link: '#/flashcards' });
        T('mixed', 'Light mixed set: 15–20 problems (confidence builder)', hpw * 60 * 0.3, { link: '#/practice?topic=all' });
        T('logistics', 'Exam logistics: ID, calculator (+ spare batteries), route to Pearson VUE center, sleep schedule', 20, { link: '#/strategy' });
        T('rest', 'Rest the day before the exam — no new material', 0, { link: '#/strategy' });
      }
    });

    // Assign tasks to study days
    weeks.forEach((wk) => {
      const ws = U.parseDate(wk.start), we = U.parseDate(wk.end);
      const days = [];
      for (let d = ws; d <= we; d = U.addDays(d, 1)) if (studyDows.includes(d.getDay())) days.push(U.isoDate(d));
      if (!days.length) days.push(wk.start);
      const perDay = (hpw * 60) / Math.max(1, studyDows.length);
      const load = Object.fromEntries(days.map((d) => [d, 0]));
      const lastDay = days[days.length - 1];
      const weekendDay = days.find((d) => [0, 6].includes(U.parseDate(d).getDay())) || lastDay;
      wk.tasks.forEach((t) => {
        if (t.type === 'exam') { t.date = weekendDay; load[weekendDay] += t.minutes; return; }
        if (t.type === 'rest') { t.date = U.isoDate(U.addDays(exam, -1)); return; }
        let best = days[0];
        for (const d of days) {
          if (load[d] + t.minutes <= perDay * 1.15) { best = d; break; }
          if (load[d] < load[best]) best = d;
        }
        t.date = best;
        load[best] += t.minutes;
      });
      wk.tasks.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    });

    return {
      settings: JSON.parse(JSON.stringify(settings)),
      generatedAt: Date.now(),
      nWeeks, learnWeeks, practiceWeeks, finalWeeks,
      allocation: raw.map((x) => ({ topic: x.id, hours: x.hours, rating: x.rating })),
      weeks
    };
  }

  function currentWeek(plan) {
    if (!plan) return null;
    const t = U.isoDate(U.today());
    return plan.weeks.find((w) => w.start <= t && t <= w.end) || (t < plan.weeks[0].start ? plan.weeks[0] : null);
  }

  function progress(plan) {
    let total = 0, done = 0, dueTotal = 0, dueDone = 0;
    const t = U.isoDate(U.today());
    plan.weeks.forEach((w) => w.tasks.forEach((k) => {
      total++;
      const isDone = !!Store.s.planDone[k.id];
      if (isDone) done++;
      if (k.date <= t) { dueTotal++; if (isDone) dueDone++; }
    }));
    return { total, done, dueTotal, dueDone, behind: dueTotal - dueDone };
  }

  function toICS(plan) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PE MDM Prep//Study Plan//EN', 'CALSCALE:GREGORIAN'];
    const byDay = {};
    plan.weeks.forEach((w) => w.tasks.forEach((t) => (byDay[t.date] = byDay[t.date] || []).push(t)));
    const escI = (s) => String(s).replace(/[\\;,]/g, (c) => '\\' + c);
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    Object.keys(byDay).sort().forEach((d) => {
      const tasks = byDay[d];
      const mins = tasks.reduce((s, t) => s + t.minutes, 0);
      const next = U.isoDate(U.addDays(U.parseDate(d), 1)).replace(/-/g, '');
      lines.push('BEGIN:VEVENT', `UID:${d}-pe-mdm@studyplan`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${next}`,
        `SUMMARY:${escI(`PE study (${Math.round(mins / 6) / 10} h): ` + tasks.map((t) => t.label.split(':')[0]).join(' / '))}`,
        `DESCRIPTION:${tasks.map((t) => escI(`• ${t.label} (${t.minutes} min)`)).join('\\n')}`, 'END:VEVENT');
    });
    const ex = plan.settings.examDate.replace(/-/g, '');
    const exNext = U.isoDate(U.addDays(U.parseDate(plan.settings.examDate), 1)).replace(/-/g, '');
    lines.push('BEGIN:VEVENT', `UID:exam-${ex}-pe-mdm@studyplan`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ex}`, `DTEND;VALUE=DATE:${exNext}`, 'SUMMARY:🎯 PE Mechanical MDM exam day', 'END:VEVENT');
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  global.Planner = { DOW, defaultSettings, generate, currentWeek, progress, toICS, effectiveRating };
})(window);
