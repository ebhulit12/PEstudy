# PE Mechanical — Machine Design & Materials Study Prep

A self-contained study site for the NCEES **PE Mechanical: Machine Design and Materials (MDM)** exam.
No build step or server needed — open `index.html` in a browser, or host it free on GitHub Pages.

## Features

| Area | What you get |
|---|---|
| 🗓️ **Study Planner** | Enter your exam date, start date, weekly hours, study days and a 1–5 confidence rating per topic. It builds a week-by-week, day-by-day plan in three phases (**Learn → Practice exams → Final review**), with hours weighted by the NCEES spec, your confidence, and (optionally) your measured accuracy. Tasks can be checked off, it tells you when you're behind, and the plan exports to your calendar (`.ics`). |
| 📘 **Study Notes** | Notes for all 8 spec areas (Eng. Practice, Statics/Dynamics, Materials, Strength of Materials, Vibration, Mechanical Components, Joints & Fasteners, Supportive Knowledge), with key equations, tables, pitfalls and NCEES-handbook search tips. |
| ✏️ **Practice Problems** | 51 **randomized** calculation problems (new numbers every attempt, so effectively unlimited practice) plus 70 conceptual questions. Answer by typing the number (±2% tolerance) or multiple choice, with hints and full step-by-step solutions. |
| ▶️ **Video Problems** | 20 narrated, auto-advancing walkthroughs. Each shows the problem, gives a 20-second "pause & try" countdown, then plays the solution step by step with diagrams, captions and optional spoken narration (browser text-to-speech). You can replay with new numbers. Curated YouTube lesson searches for every topic are included too. |
| ⏱️ **Practice Exam** | CBT-style timed exams (10/20/40/80 questions, 6 min/question by default) weighted like the spec or toward your weak topics, with a navigator, flag-for-review, results by topic, and a review of every missed question. |
| 🃏 **Flashcards** | 73 formula/concept cards with Leitner spaced repetition. |
| ∑ **Formula Sheet** | Searchable, printable quick reference. |
| 📈 **Progress** | Readiness score, accuracy by topic, activity heatmap, exam history, and backup export/import. |
| 🎯 **Exam Strategy** / 🔗 **Resources** | Exam format, time management, handbook tips, exam-day checklist, official NCEES links and recommended references. |

All progress is saved in your browser's `localStorage`. Use **Progress → Export backup** to move it between devices.

## Running it

- **Locally:** open `index.html` in Chrome, Edge, Firefox or Safari. (Math rendering uses KaTeX from a CDN, so you need an internet connection for equations to display nicely.)
- **GitHub Pages:** in the repo go to *Settings → Pages*, set the source to this branch and the root folder. The site will be served at `https://<user>.github.io/<repo>/`.

## Adding content

- **Problems:** `js/data/problems.js`. Each problem has a `gen(rng)` function that picks random inputs and returns the prompt, answer, unit, solution `steps`, and likely wrong answers (`distract`) used to build multiple-choice options. Set `video: true` to also get a video walkthrough.
- **Concept questions:** `js/data/concepts.js` · **Flashcards:** `js/data/flashcards.js` · **Notes:** `js/data/notes.js` · **Exam spec/weights:** `js/data/spec.js`.

## Disclaimer

Not affiliated with NCEES. Topic question ranges are approximate; always check the current exam specification at [ncees.org](https://ncees.org/exams/pe-exam/mechanical/). Use the official NCEES PE Mechanical Reference Handbook for all practice, since it's the only reference allowed in the exam.
