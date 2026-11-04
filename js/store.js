/* Persistent per-user state. Each user (guest, local profile, or cloud account) has its own
   localStorage namespace; cloud accounts additionally sync through Auth (see auth.js). */
(function (global) {
  'use strict';
  const PREFIX = 'pe-mdm-prep.v1';
  const LEGACY_KEY = 'pe-mdm-prep.v1'; // single-user data from the first version

  const defaults = () => ({
    version: 2,
    updatedAt: 0,
    theme: null,
    plan: null,            // planner settings + generated plan
    planDone: {},          // taskId -> ts
    attempts: [],          // {pid, topic, correct, ts, mode}
    exams: [],             // {ts, n, correct, durationSec, byTopic}
    cards: {},             // cardId -> {box, due, t}
    notesRead: {},         // topicId:sectionIdx -> ts
    bookmarks: {},         // pid -> true
    studyLog: {},          // yyyy-mm-dd -> minutes
    checklist: {},
    activeExam: null,
    lastExamDetail: null,
    lastActive: null
  });

  let state = defaults();
  let key = null;
  const listeners = [];

  function read(k) {
    try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }

  /** Switch to a user namespace, e.g. 'guest', 'local:abc', 'cloud:uid'. */
  function open(ns) {
    key = `${PREFIX}:${ns}`;
    let data = read(key);
    if (!data && ns === 'guest') data = read(LEGACY_KEY); // migrate v1 data into the guest profile
    state = Object.assign(defaults(), data || {});
    if (!data) persist();
    return state;
  }
  function peek(ns) { return read(`${PREFIX}:${ns}`) || (ns === 'guest' ? read(LEGACY_KEY) : null); }
  function remove(ns) { try { localStorage.removeItem(`${PREFIX}:${ns}`); } catch (e) { /* ignore */ } }

  function persist() {
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }
  function save() {
    state.updatedAt = Date.now();
    persist();
    listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } });
  }
  function onSave(fn) { listeners.push(fn); }

  function logActivity(minutes = 1) {
    const d = U.isoDate(new Date());
    state.studyLog[d] = (state.studyLog[d] || 0) + minutes;
    state.lastActive = Date.now();
    save();
  }

  function recordAttempt(pid, topic, correct, mode = 'practice') {
    state.attempts.push({ pid, topic, correct: !!correct, ts: Date.now(), mode });
    if (state.attempts.length > 4000) state.attempts = state.attempts.slice(-4000);
    logActivity(mode === 'exam' ? 0 : 3);
  }

  function topicStats(s = state) {
    const out = {};
    for (const a of s.attempts) {
      const t = (out[a.topic] = out[a.topic] || { n: 0, c: 0, recent: [] });
      t.n++; if (a.correct) t.c++;
      t.recent.push(a.correct ? 1 : 0);
      if (t.recent.length > 20) t.recent.shift();
    }
    return out;
  }

  function streak(s = state) {
    let n = 0;
    let d = U.today();
    if (!s.studyLog[U.isoDate(d)]) d = U.addDays(d, -1);
    while (s.studyLog[U.isoDate(d)]) { n++; d = U.addDays(d, -1); }
    return n;
  }

  /** Merge two copies of a user's data (e.g. two devices). Nothing studied on either side is lost. */
  function merge(a, b) {
    a = Object.assign(defaults(), a || {});
    b = Object.assign(defaults(), b || {});
    // A reset on one side wins over anything the other side recorded before the reset
    if ((a.resetAt || 0) > (b.updatedAt || 0)) return a;
    if ((b.resetAt || 0) > (a.updatedAt || 0)) return b;
    const newer = (a.updatedAt || 0) >= (b.updatedAt || 0) ? a : b;
    const older = newer === a ? b : a;
    const out = Object.assign(defaults(), newer);
    const uniq = (arr, k) => { const seen = new Set(); return arr.filter((x) => { const id = k(x); if (seen.has(id)) return false; seen.add(id); return true; }); };
    out.attempts = uniq(a.attempts.concat(b.attempts), (x) => `${x.ts}|${x.pid}`).sort((x, y) => x.ts - y.ts).slice(-4000);
    out.exams = uniq(a.exams.concat(b.exams), (x) => x.ts).sort((x, y) => x.ts - y.ts);
    out.planDone = Object.assign({}, older.planDone, newer.planDone);
    out.notesRead = Object.assign({}, older.notesRead, newer.notesRead);
    out.bookmarks = Object.assign({}, older.bookmarks, newer.bookmarks);
    out.checklist = Object.assign({}, older.checklist, newer.checklist);
    out.studyLog = {};
    for (const d of new Set(Object.keys(a.studyLog).concat(Object.keys(b.studyLog)))) out.studyLog[d] = Math.max(a.studyLog[d] || 0, b.studyLog[d] || 0);
    out.cards = {};
    for (const id of new Set(Object.keys(a.cards).concat(Object.keys(b.cards)))) {
      const x = a.cards[id], y = b.cards[id];
      out.cards[id] = !x ? y : !y ? x : ((x.t || x.due) >= (y.t || y.due) ? x : y);
    }
    const pa = a.plan, pb = b.plan;
    out.plan = !pa ? pb : !pb ? pa : (pa.generatedAt >= pb.generatedAt ? pa : pb);
    const ld = [a.lastExamDetail, b.lastExamDetail].filter(Boolean).sort((x, y) => y.ts - x.ts);
    out.lastExamDetail = ld[0] || null;
    out.activeExam = newer.activeExam || null;
    out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
    out.resetAt = Math.max(a.resetAt || 0, b.resetAt || 0);
    if (out.resetAt) {
      out.attempts = out.attempts.filter((x) => x.ts >= out.resetAt);
      out.exams = out.exams.filter((x) => x.ts >= out.resetAt);
    }
    return out;
  }

  /** Replace the current state (used after merging with cloud data). */
  function replace(s, silent) {
    state = Object.assign(defaults(), s);
    persist();
    if (!silent) listeners.forEach((fn) => { try { fn(state); } catch (e) { /* ignore */ } });
  }

  function exportJSON() { return JSON.stringify(state, null, 2); }
  function importJSON(text) {
    const obj = JSON.parse(text);
    if (typeof obj !== 'object' || !obj) throw new Error('Invalid file');
    state = merge(state, obj);
    save();
  }
  function reset() { const theme = state.theme; state = defaults(); state.theme = theme; state.resetAt = Date.now() + 1; save(); }

  global.Store = {
    get s() { return state; },
    get key() { return key; },
    open, peek, remove, save, onSave, replace, merge, logActivity, recordAttempt, topicStats, streak, exportJSON, importJSON, reset, defaults
  };
})(window);
