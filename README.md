# PE Mechanical — Machine Design & Materials Study Prep

**Live site:** <https://pestudy-brown.vercel.app>

A self-contained study site for the NCEES **PE Mechanical: Machine Design and Materials (MDM)** exam.
No build step needed — open `index.html` in a browser, or host it free on **Vercel** (Hobby plan).

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
| 👤 **Logins** | Each person gets their own progress, plan and stats. **Cloud accounts** (email/password or Google, via free Firebase) sync across devices; **device profiles** (optional PIN) let several people share one browser; or continue as a guest. |
| 🎯 **Exam Strategy** / 🔗 **Resources** | Exam format, time management, handbook tips, exam-day checklist, official NCEES links and recommended references. |

Progress is saved per user. Device profiles and guests are stored in that browser's `localStorage`; cloud accounts are also synced to Firebase and merged across devices (nothing studied on one device is lost when you open another).

## Running it

- **Locally:** open `index.html` in Chrome, Edge, Firefox or Safari. (Math rendering uses KaTeX from a CDN, so you need an internet connection for equations to display nicely.)
- **Vercel (recommended):** see *Deploying to Vercel* below.

## Deploying to Vercel

1. Sign in at <https://vercel.com> with your GitHub account (Hobby plan is fine).
2. Click **Add New… → Project** and **Import** the `PEstudy` repository. If it isn't listed, click *Adjust GitHub App Permissions* and give Vercel access to the repo.
3. On the configure screen:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** leave empty
   - **Output Directory:** leave empty (the repo root is served as-is)
4. Click **Deploy**. In under a minute you'll get a URL (this project's is <https://pestudy-brown.vercel.app>).
5. **Production branch:** Vercel deploys your repository's default branch (`main`) to production. Every other branch, including this feature branch, gets a *preview* URL. Either merge this branch into `main`, or change it under *Project → Settings → Git → Production Branch*.

After that, every `git push` redeploys automatically. On phones, use the browser's **Share → Add to Home Screen** to install it like an app. `vercel.json` adds clean URLs and a few security headers. Optional: add your own domain under *Project → Settings → Domains*.

## Setting up user accounts (cloud sync)

The site is static (no server code), so accounts use **Firebase** (Google's free backend) for sign-in and storage. Until you do this, the login screen offers only *This device* profiles and guest mode, which work fine with no setup.

1. Go to <https://console.firebase.google.com>, click **Create a project**, and give it a name (Google Analytics is optional; you can turn it off).
2. **Turn on sign-in:** *Build → Authentication → Get started → Sign-in method*.
   - Enable **Email/Password**.
   - Optional: enable **Google** (pick a support email). If you skip this, set `googleSignIn: false` in `js/config.js`.
3. **Allow your site's domain:** *Authentication → Settings → Authorized domains → Add domain* and enter **`pestudy-brown.vercel.app`** (plus any custom domain you add later). `localhost` is already allowed for local testing. Preview deployments use different URLs (`pestudy-git-<branch>-<you>.vercel.app`), so sign-in only works on them if you add those domains too.
4. **Create the database:** *Build → Firestore Database → Create database*, choose **production mode**, and pick a location near you.
5. **Lock it down:** in Firestore, open the **Rules** tab, replace everything with the contents of [`firestore.rules`](firestore.rules) and click **Publish**. This makes sure each user can only read and write their own progress.
6. **Get the web config:** *Project settings (gear icon) → General → Your apps →* the **`</>`** (Web) icon. Register an app (no Firebase Hosting needed), then copy the `firebaseConfig` values.
7. Paste them into [`js/config.js`](js/config.js) in place of `firebase: null`:
   ```js
   firebase: {
     apiKey: 'AIza…',
     authDomain: 'your-project.firebaseapp.com',
     projectId: 'your-project',
     storageBucket: 'your-project.appspot.com',
     messagingSenderId: '…',
     appId: '…'
   },
   ```
8. Commit and push. The login screen's **☁️ Account** tab now lets people create accounts.

**Is it safe to put that config in a public repo?** Yes. Firebase web config values are identifiers, not passwords; access is controlled by the security rules from step 5. Firebase's free *Spark* plan (50k reads / 20k writes per day) is far more than a study group will use.

**Managing users:** you can see and disable accounts under *Authentication → Users*, and each user's saved progress lives at `users/{uid}` in Firestore.

**Device profile PINs** only keep people sharing a computer out of each other's stats. They are not real security, since anyone with access to the browser can read its storage. Use cloud accounts when that matters.

Testing locally with cloud accounts: Firebase sign-in doesn't work from `file://` URLs. Run a local server instead (for example `python3 -m http.server` in the project folder, then open <http://localhost:8000>). `localhost` is authorized by default.

## Adding content

- **Problems:** `js/data/problems.js`. Each problem has a `gen(rng)` function that picks random inputs and returns the prompt, answer, unit, solution `steps`, and likely wrong answers (`distract`) used to build multiple-choice options. Set `video: true` to also get a video walkthrough.
- **Concept questions:** `js/data/concepts.js` · **Flashcards:** `js/data/flashcards.js` · **Notes:** `js/data/notes.js` · **Exam spec/weights:** `js/data/spec.js`.

## Disclaimer

Not affiliated with NCEES. Topic question ranges are approximate; always check the current exam specification at [ncees.org](https://ncees.org/exams/pe-exam/mechanical/). Use the official NCEES PE Mechanical Reference Handbook for all practice, since it's the only reference allowed in the exam.
