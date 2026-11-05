/* Builds the study-content script served by /api/content.
   The full content lives in api/_content/ (never served statically). Two tiers:
     full    everything (subscribers and comp accounts)
     sample  first notes section per topic, a few problems/concept questions per topic, no flashcards
   The script defines window.NOTES / PROBLEMS / CONCEPTS / FLASHCARDS like the original data files,
   plus window.CONTENT_TIER and window.CONTENT_META (totals + locked section titles for teasers). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = path.join(__dirname, '..', '_content');
const SAMPLE = { problemsPerTopic: 2, conceptsPerTopic: 2, notesSectionsPerTopic: 1 };
const read = (f) => fs.readFileSync(path.join(DIR, f), 'utf8');

/** Content files of one kind: the base file (e.g. problems.js) first, then problems-*.js alphabetically.
    Add-on files extend the base: problems/concepts/flashcards concat onto the window array,
    notes push sections onto window.NOTES[topic]. */
function filesOf(kind) {
  const extra = fs.readdirSync(DIR).filter((f) => f.startsWith(kind + '-') && f.endsWith('.js')).sort();
  return [kind + '.js'].concat(extra);
}

/** Evaluate pure-data files (notes / concepts / flashcards) in order and return their window globals. */
function evalData(files) {
  const win = {};
  const ctx = vm.createContext({ window: win, R: String.raw });
  for (const file of files) vm.runInContext(read(file), ctx, { filename: file, timeout: 2000 });
  return win;
}

/** Split problems.js into shared code and one block per `add({...})` call (the file's fixed layout). */
function splitProblems(src) {
  const parts = [];
  let cur = null;
  for (const line of src.split('\n')) {
    if (!cur && line.startsWith('  add({')) { cur = [line]; continue; }
    if (cur) {
      cur.push(line);
      if (line === '  });') {
        const text = cur.join('\n');
        parts.push({ add: true, id: (text.match(/\bid: '([^']+)'/) || [])[1], topic: (text.match(/\btopic: '([^']+)'/) || [])[1], video: /\bvideo: true\b/.test(text), text });
        cur = null;
      }
      continue;
    }
    parts.push({ add: false, text: line });
  }
  if (cur) throw new Error('problems.js: unterminated add({ block');
  return parts;
}

let cache = null;
function build() {
  if (cache) return cache;
  const F = { notes: filesOf('notes'), problems: filesOf('problems'), concepts: filesOf('concepts'), flashcards: filesOf('flashcards') };
  const src = (kind) => F[kind].map(read).join('\n;\n');
  const NOTES = evalData(F.notes).NOTES;
  const CONCEPTS = evalData(F.concepts).CONCEPTS;
  const FLASHCARDS = evalData(F.flashcards).FLASHCARDS;
  const fileParts = F.problems.map((f) => splitProblems(read(f)));
  const adds = fileParts.flat().filter((p) => p.add);
  const ids = new Set();
  for (const p of adds) { if (!p.id || ids.has(p.id)) throw new Error('Duplicate or missing problem id: ' + p.id); ids.add(p.id); }

  // ---- choose the free sample (first N per topic, in file order)
  const perTopic = {};
  const keepProblem = new Set();
  for (const p of adds) {
    perTopic[p.topic] = (perTopic[p.topic] || 0) + 1;
    if (perTopic[p.topic] <= SAMPLE.problemsPerTopic) keepProblem.add(p.id);
  }
  const cPer = {};
  const sampleConcepts = CONCEPTS.filter((c) => (cPer[c.topic] = (cPer[c.topic] || 0) + 1) <= SAMPLE.conceptsPerTopic);
  const sampleNotes = {}, lockedSections = {};
  for (const [topic, secs] of Object.entries(NOTES)) {
    sampleNotes[topic] = secs.slice(0, SAMPLE.notesSectionsPerTopic);
    lockedSections[topic] = secs.slice(SAMPLE.notesSectionsPerTopic).map((s) => s.title);
  }
  const sampleProblemsSrc = fileParts.map((parts) => parts.filter((p) => !p.add || keepProblem.has(p.id)).map((p) => p.text).join('\n')).join('\n;\n');

  const totals = {
    problems: adds.length, concepts: CONCEPTS.length, flashcards: FLASHCARDS.length,
    videos: adds.filter((p) => p.video).length,
    sections: Object.values(NOTES).reduce((n, s) => n + s.length, 0)
  };
  const header = (tier, extra) => `/* PE MDM Prep study content (${tier}) */\nwindow.CONTENT_TIER = ${JSON.stringify(tier)};\nwindow.CONTENT_META = ${JSON.stringify(Object.assign({ totals }, extra || {}))};\n`;

  cache = {
    full: header('full') + [src('notes'), src('problems'), src('concepts'), src('flashcards')].join('\n;\n'),
    sample: header('sample', { lockedSections, sample: SAMPLE }) + [
      `window.NOTES = ${JSON.stringify(sampleNotes)};`,
      sampleProblemsSrc,
      `window.CONCEPTS = ${JSON.stringify(sampleConcepts)};`,
      'window.FLASHCARDS = [];'
    ].join('\n;\n'),
    stats: { totals, files: F, sampleProblems: keepProblem.size, sampleConcepts: sampleConcepts.length }
  };
  return cache;
}

module.exports = { build, splitProblems, SAMPLE };
