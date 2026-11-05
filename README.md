# PE Mechanical — Machine Design & Materials Study Prep

**Live site:** <https://pestudy-brown.vercel.app>

A self-contained study site for the NCEES **PE Mechanical: Machine Design and Materials (MDM)** exam.
No build step needed. Host it free on **Vercel** (Hobby plan). Full access is a paid subscription through Polar (see [`POLAR_SETUP.md`](POLAR_SETUP.md)); everyone else gets a free sample.

## Features

| Area | What you get |
|---|---|
| 🗓️ **Study Planner** | Enter your exam date, start date, weekly hours, study days and a 1–5 confidence rating per topic. It builds a week-by-week, day-by-day plan in three phases (**Learn → Practice exams → Final review**), with hours weighted by the NCEES spec, your confidence, and (optionally) your measured accuracy. Tasks can be checked off, it tells you when you're behind, and the plan exports to your calendar (`.ics`). |
| 📘 **Study Notes** | 50 sections across all 8 spec areas (Eng. Practice, Statics/Dynamics, Materials, Strength of Materials, Vibration, Mechanical Components, Joints & Fasteners, Supportive Knowledge), with key equations, tables, pitfalls, NCEES-handbook search tips, and a worked example in every topic. |
| ✏️ **Practice Problems** | 177 **randomized** calculation problem types (new numbers every attempt, so effectively unlimited practice; weighted by exam share, most exam-level or multi-step) plus 323 conceptual questions, including 36 CBT-style **select-all-that-apply**. Answer by typing the number (±2% tolerance) or multiple choice, with hints and full step-by-step solutions. |
| ▶️ **Video Problems** | 49 narrated, auto-advancing walkthroughs covering every topic. Each shows the problem, gives a 20-second "pause & try" countdown, then plays the solution step by step with diagrams, captions and optional spoken narration (browser text-to-speech). You can replay with new numbers. Curated YouTube lesson searches for every topic are included too. |
| ⏱️ **Practice Exam** | Two fixed full-length forms (**Practice Exam A and B**: the same 80 questions every attempt, so scores are comparable) plus custom timed exams (10/20/40/80 questions) weighted like the spec or toward your weak topics. Exams mix multiple-choice, select-all-that-apply and fill-in-the-number questions like the CBT, with a navigator, flag-for-review, results by topic, and a review of every missed question. |
| 🃏 **Flashcards** | 206 formula/concept cards with Leitner spaced repetition. |
| ∑ **Formula Sheet** | Searchable, printable quick reference. |
| 📈 **Progress** | Readiness score, accuracy by topic, activity heatmap, exam history, and backup export/import. |
| 👤 **Logins** | Each person gets their own progress, plan and stats. **Online accounts** (email + password or Google, hosted on Vercel) sync across devices; **device profiles** (optional PIN) let several people share one browser; or continue as a guest. |
| ⭐ **Subscriptions** | Polar checkout (7-day free trial, then monthly). Subscribers get all notes, problems, videos, flashcards and practice exams; the content is served only to them by `/api/content`. Guests, device profiles and non-subscribers get a free sample. |
| 🎯 **Exam Strategy** / 🔗 **Resources** | Exam format, time management, handbook tips, exam-day checklist, official NCEES links and recommended references. |

Progress is saved per user. Device profiles and guests are stored in that browser's `localStorage`; online accounts are also synced to the site's database and merged across devices (nothing studied on one device is lost when you open another).

## Running it

- **Locally:** run `npm install`, then `vercel dev` (see *Testing locally* below), and open <http://localhost:3000>. The study content is served by `/api/content`, so opening `index.html` directly from disk shows the app without any study content. KaTeX loads from a CDN, so you need an internet connection for equations to render.
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

## Setting up user accounts

Logins run entirely on Vercel:

- **Vercel Functions** in [`api/`](api) handle sign-up, sign-in, sessions and progress sync. They have no dependencies and nothing to build.
- A **Redis database** from the Vercel dashboard (Upstash, free tier) stores accounts and progress.

Until a database is connected, the login screen offers only *This device* profiles and guest mode.

**One-time setup (about 3 minutes):**

1. Open the project in the [Vercel dashboard](https://vercel.com/dashboard) and go to the **Storage** tab.
2. Click **Create Database**, choose **Upstash → Redis** (*Serverless Redis*), and accept the free plan. Pick a region close to you, ideally the same as your functions (US East by default).
3. When asked, **connect it to this project** for all environments (Production, Preview, Development). Vercel adds the connection settings as environment variables automatically (`KV_REST_API_URL` / `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_*`; any of these names works).
4. **Redeploy** so the functions pick up the new variables: *Deployments → ⋯ on the latest → Redeploy* (or just push a commit).
5. Open the site. The **☁️ Account** tab is now active. Create your account.

To confirm it worked, visit `https://pestudy-brown.vercel.app/api/auth?action=status`. It should say `"configured":true`.

### Optional: "Continue with Google"

This uses your own Google OAuth client; the sign-in code runs in [`api/google.js`](api/google.js). It needs the database above. Takes about 5 minutes:

1. Go to <https://console.cloud.google.com/>, create a project (any name), then open **APIs & Services → OAuth consent screen** (shown as *Google Auth Platform* in newer consoles) and click **Get started**:
   - App name: `PE MDM Prep`, user support email: yours, **Audience: External**, contact email: yours.
2. Under **Audience**, click **Publish app** so any Google account can sign in. While in *Testing*, only the test users you list can. The app only asks for the basic `openid email profile` scopes, so Google doesn't need to review it.
3. Under **Clients** (or *Credentials → Create credentials → OAuth client ID*), create a **Web application** client:
   - **Authorized JavaScript origins:** `https://pestudy-brown.vercel.app`
   - **Authorized redirect URIs:** `https://pestudy-brown.vercel.app/api/google`
   - (Optional, for `vercel dev`: also add `http://localhost:3000` and `http://localhost:3000/api/google`.)
4. Copy the **Client ID** and **Client secret**. In Vercel → your project → **Settings → Environment Variables**, add:
   - `GOOGLE_CLIENT_ID` = the client ID
   - `GOOGLE_CLIENT_SECRET` = the client secret (keep this one private; it lives only in Vercel)
5. **Redeploy**. A **Continue with Google** button appears on the sign-in screen. `…/api/auth?action=status` now shows `"google":true`.

Details:
- **One account per email.** Signing in with Google using the same email as an existing email/password account logs into that account. Email/password sign-ups don't verify ownership of the address, so when Google links to such an account, its old password is removed and other sessions are signed out. The user can add a new password on the Account page.
- **Google-only users** can add a password later, which also gives them a recovery code.
- Sign-in uses the authorization-code flow with PKCE, `state` and `nonce` checks. The client secret never reaches the browser.
- If you add a custom domain later, add it to the origins/redirect URIs too. Preview deployments use different URLs, so Google sign-in only works on them if you add those URLs.

**How it works**

| | |
|---|---|
| Passwords | Hashed with scrypt (random salt per user); never stored or logged in plain text. |
| Sessions | Random 256-bit token in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie; only a SHA-256 hash is stored server-side. Valid for 30 days, refreshed on use. |
| Google sign-in | Optional; see above. |
| Forgot password | No email service is needed. Each account gets a one-time **recovery code** at sign-up (copy/download). *Forgot password?* + email + code lets the user set a new password and issues a fresh code. Users can generate a new code from the Account page. |
| Abuse protection | Rate limits on sign-up, sign-in and recovery (per IP and per email), cross-site request blocking, 8+ character passwords. |
| Sync | Each save carries a revision number; if another device saved first, the browser merges both copies and retries, so devices never overwrite each other. |
| Changing password | Signs out the user's other devices. |
| Deleting an account | Removes the user, their sessions and their progress. |

**Data layout in Redis:** `user:<id>`, `email:<address>` → id, `sess:<hash>`, `progress:<id>` (hash of `rev`, `data`, `updatedAt`). You can browse it in the Upstash console (Vercel → Storage → your database → *Open in Upstash*).

**Free-tier limits:** Upstash's free plan allows a generous monthly command count and plenty of storage for a study group; each save is about 1–2 commands. Vercel Hobby includes the function invocations this site needs. Vercel Hobby is for personal, non-commercial use.

**Testing locally:** install the Vercel CLI (`npm i -g vercel`), run `vercel link` then `vercel env pull`, and start `vercel dev`. This serves the site and `/api` with your database settings at <http://localhost:3000>. Opening `index.html` directly still works but only offers device profiles.

**Device profile PINs** only keep people sharing a computer out of each other's stats. They aren't real security; use online accounts when that matters.

## Adding content

Study content lives in `api/_content/` (served only through `/api/content`, never as public files). The free sample is chosen automatically (first notes section per topic, first 2 problems and concept questions per topic; see `SAMPLE` in `api/_lib/content.js`). Keep the existing layout in the problem files (each problem is a top-level `  add({ … });` block), since the sample builder relies on it.

Each kind has a base file plus per-topic add-on files that the builder loads automatically (base first, then alphabetically): `problems.js` + `problems-<topic>.js`, `concepts.js` + `concepts-<topic>.js`, `flashcards.js` + `flashcards-<topic>.js`, `notes.js` + `notes-<topic>.js`.

- **Problems:** each has a `gen(rng)` function that picks random inputs and returns the prompt, answer, unit, solution `steps`, and likely wrong answers (`distract`) used to build multiple-choice options. Set `video: true` to also get a video walkthrough. Problem ids must be unique (the builder rejects duplicates).
- **Concept questions:** single answer `{ q, choices, ans, exp }`, or select-all-that-apply `{ type: 'multi', q, choices, answers: [ … ], exp }` (see `concepts-multi.js`; graded all-or-nothing).
- **Notes:** add-on files push sections onto `window.NOTES[topic]`. · **Exam spec/weights:** `js/data/spec.js` (public). · **Fixed exam forms:** `FORMS` in `js/views/exam.js` (changing content changes which questions a form draws).

## Disclaimer

Not affiliated with NCEES. Topic question ranges are approximate; always check the current exam specification at [ncees.org](https://ncees.org/exams/pe-exam/mechanical/). Use the official NCEES PE Mechanical Reference Handbook for all practice, since it's the only reference allowed in the exam.
