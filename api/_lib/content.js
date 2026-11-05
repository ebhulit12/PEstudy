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

/** Evaluate a pure-data file (notes / concepts / flashcards) and return its window globals. */
function evalData(file) {
  const win = {};
  const ctx = vm.createContext({ window: win, R: String.raw });
  vm.runInContext(read(file), ctx, { filename: file, timeout: 2000 });
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
  const notesSrc = read('notes.js'), problemsSrc = read('problems.js'), conceptsSrc = read('concepts.js'), cardsSrc = read('flashcards.js');
  const NOTES = evalData('notes.js').NOTES;
  const CONCEPTS = evalData('concepts.js').CONCEPTS;
  const FLASHCARDS = evalData('flashcards.js').FLASHCARDS;
  const parts = splitProblems(problemsSrc);
  const adds = parts.filter((p) => p.add);

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
  const sampleProblemsSrc = parts.filter((p) => !p.add || keepProblem.has(p.id)).map((p) => p.text).join('\n');

  const totals = {
    problems: adds.length, concepts: CONCEPTS.length, flashcards: FLASHCARDS.length,
    videos: adds.filter((p) => p.video).length,
    sections: Object.values(NOTES).reduce((n, s) => n + s.length, 0)
  };
  const header = (tier, extra) => `/* PE MDM Prep study content (${tier}) */\nwindow.CONTENT_TIER = ${JSON.stringify(tier)};\nwindow.CONTENT_META = ${JSON.stringify(Object.assign({ totals }, extra || {}))};\n`;

  cache = {
    full: header('full') + [notesSrc, problemsSrc, conceptsSrc, cardsSrc].join('\n;\n'),
    sample: header('sample', { lockedSections, sample: SAMPLE }) + [
      `window.NOTES = ${JSON.stringify(sampleNotes)};`,
      sampleProblemsSrc,
      `window.CONCEPTS = ${JSON.stringify(sampleConcepts)};`,
      'window.FLASHCARDS = [];'
    ].join('\n;\n'),
    stats: { totals, sampleProblems: keepProblem.size, sampleConcepts: sampleConcepts.length }
  };
  return cache;
}

module.exports = { build, splitProblems, SAMPLE };
