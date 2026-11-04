/* Persistent state in localStorage, with export/import. */
(function (global) {
  'use strict';
  const KEY = 'pe-mdm-prep.v1';

  const defaults = () => ({
    version: 1,
    theme: null,
    plan: null,            // planner settings + generated plan
    planDone: {},          // taskId -> true
    attempts: [],          // {pid, topic, correct, ts, mode}
    exams: [],             // {ts, n, correct, durationSec, byTopic}
    cards: {},             // cardId -> {box, due}
    notesRead: {},         // topicId:sectionIdx -> ts
    bookmarks: {},         // pid -> true
    studyLog: {},          // yyyy-mm-dd -> minutes (approx, from activity)
    lastActive: null
  });

  let state;
  try {
    state = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch (e) {
    state = defaults();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }

  function logActivity(minutes = 1) {
    const d = U.isoDate(new Date());
    state.studyLog[d] = (state.studyLog[d] || 0) + minutes;
    state.lastActive = Date.now();
    save();
  }

  function recordAttempt(pid, topic, correct, mode = 'practice') {
    state.attempts.push({ pid, topic, correct: !!correct, ts: Date.now(), mode });
    if (state.attempts.length > 5000) state.attempts = state.attempts.slice(-5000);
    logActivity(mode === 'exam' ? 0 : 3);
  }

  function topicStats() {
    const s = {};
    for (const a of state.attempts) {
      const t = (s[a.topic] = s[a.topic] || { n: 0, c: 0, recent: [] });
      t.n++; if (a.correct) t.c++;
      t.recent.push(a.correct ? 1 : 0);
      if (t.recent.length > 20) t.recent.shift();
    }
    return s;
  }

  function streak() {
    let n = 0;
    let d = U.today();
    if (!state.studyLog[U.isoDate(d)]) d = U.addDays(d, -1); // today not studied yet: count from yesterday
    while (state.studyLog[U.isoDate(d)]) { n++; d = U.addDays(d, -1); }
    return n;
  }

  function exportJSON() { return JSON.stringify(state, null, 2); }
  function importJSON(text) {
    const obj = JSON.parse(text);
    if (typeof obj !== 'object' || !obj) throw new Error('Invalid file');
    state = Object.assign(defaults(), obj);
    save();
  }
  function reset() { state = defaults(); save(); }

  global.Store = {
    get s() { return state; },
    save, logActivity, recordAttempt, topicStats, streak, exportJSON, importJSON, reset
  };
})(window);
