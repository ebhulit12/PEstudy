# Polar payments setup

Polar ([dashboard](https://polar.sh/dashboard/pe-prepsite)) handles checkout and billing for PE MDM Prep. The integration is built on `@polar-sh/sdk` directly (API version `2026-10`) as plain Vercel Functions. There's no framework adapter.

> ⚠️ **This runs against the live _production_ Polar environment.** Real customers will be charged real money once the organization leaves test mode. To develop against sandbox instead, set `POLAR_SERVER=sandbox` with a sandbox token. Sandbox and production are completely separate (tokens, products, webhooks).

## Files

| File | Status | Purpose |
|---|---|---|
| `package.json`, `package-lock.json` | new | npm manifest with `@polar-sh/sdk` (^1.0.2); `engines.node >=22` (required by SDK 1.x) |
| `api/_lib/polar.mjs` | new | Single shared SDK client; environment read from `POLAR_SERVER` |
| `api/checkout.mjs` | new | `GET /checkout?products=<id>` requires a signed-in online account, creates a checkout with `external_customer_id` = app user id, and 302-redirects to Polar's hosted checkout (no success URL; Polar shows its own confirmation). Signed-out → `/#/subscribe`; already subscribed → `/#/account`; non-access products → 400 |
| `api/webhook/polar.mjs` | new | `POST /api/webhook/polar` verifies the signature on the raw body, then updates the user's access from `customer.state_changed` (source of truth) and `order.paid` (immediate grant). Deduplicates on `webhook-id`, ignores out-of-order states |
| `api/_lib/access.js` | new | Access records in Redis (`access:<userId>`), derived from Polar customer state; direct Polar lookup (`customers.getStateExternal`) when missing or stale; comp emails |
| `api/content.js`, `api/_lib/content.js` | new | `GET /api/content` serves the study content: everything for subscribers, a free sample otherwise |
| `api/_content/*` | moved | Full notes, problems, concepts and flashcards (previously public in `js/data/`); only served through `/api/content` |
| `api/auth.js` | changed | `status` returns `access` (+ `?refresh=1` to re-check Polar, rate-limited); account deletion also deletes the access record |
| `js/views/subscribe.js` + views | new/changed | Paywall card/banners, `#/subscribe` page, subscription status on the Account page |
| `vercel.json` | changed | Rewrite `/checkout` → `/api/checkout`; bundle `api/_content/**` with the content function |
| `.gitignore` | new | Ignores `.env`, `.env.*`, `node_modules/`, `.vercel/` |
| `.env` (not committed) | new | Local placeholders for `vercel dev` |

## Environment variables (names only)

Set in **Vercel → Settings → Environment Variables** (Production), plus `.env` for local `vercel dev`:

- `POLAR_ACCESS_TOKEN`: organization access token (production; scopes: products, checkouts, webhooks, read and write)
- `POLAR_WEBHOOK_SECRET`: signing secret of the webhook endpoint below
- `POLAR_SERVER`: `production` (or `sandbox`)
- `POLAR_PRODUCT_IDS` *(optional)*: comma-separated product ids that grant access. Defaults to the Monthly Subscription below; the first one is what the Subscribe button checks out.
- `FREE_ACCESS_EMAILS` *(optional)*: comma-separated account emails that get full access without paying (e.g. your own account)

## How paid access works

1. **Linking:** `/checkout` takes the user from the server-side session cookie and sets Polar's `external_customer_id` to the app user id (plus email and name). It's never read from the URL.
2. **Granting:** the webhook resolves `external_id` back to the app user. A user has access when their Polar customer state has an **active or trialing** subscription to an access product. `order.paid` grants immediately; `customer.state_changed` is the source of truth (cancel at period end keeps access until the period ends; revoked removes it).
3. **Safety net:** if a webhook is missed, the status check re-asks Polar when the record is stale (15 min for non-subscribers, 6 h for subscribers), and the paywall's **"Already subscribed? Refresh"** button forces a check.
4. **Protection:** paid content is only sent by `/api/content` to users with access. Guests and device profiles get the free sample (first notes section per topic, 2 calculation problems + 2 concept questions per topic, sample videos); practice exams, flashcards and the formula sheet are full-access only.

## Polar resources

| Resource | Value |
|---|---|
| Organization | `pe-prepsite` (`68cb0c1d-0b95-4d42-a9cb-5d90752db724`) |
| Product | **Monthly Subscription**: `8a2628e9-5ac5-4791-9977-10e359d778bc` ($20/month, 7-day free trial) |
| Webhook endpoint | `https://pestudy-brown.vercel.app/api/webhook/polar`, format Raw, events `order.paid` + `customer.state_changed`. Created in the dashboard; its id is under Settings → Webhooks (not recorded here) |

**Checkout link:** <https://pestudy-brown.vercel.app/checkout?products=8a2628e9-5ac5-4791-9977-10e359d778bc>
(locally with `vercel dev`: `http://localhost:3000/checkout?products=8a2628e9-5ac5-4791-9977-10e359d778bc`)

## Testing without a real charge

While the organization is in test mode, Polar only completes free or 100%-discounted orders. Create a test code in the dashboard: **Products → Discounts → New discount**.

- Type **Percentage**, **100%**, a code such as `TEST100`, limited to the Monthly Subscription product, with a low max-redemptions count.

Enter the code on the Polar checkout page with **Add discount code**. A plain checkout link can't pre-apply it. Afterwards, check **Settings → Webhooks → deliveries** for `order.paid` / `customer.state_changed` deliveries with a `202` response. Delete or disable the code when you're done.

## Customer portal

Polar hosts the customer portal (manage the subscription, invoices, payment method) and emails customers a link to it automatically. No app code is needed. An in-app "Manage billing" link can be added later.

## Verified so far

- `GET /checkout` without products → `400`; with the product id → `302` to `polar.sh/checkout/…` (shows the Monthly Subscription; confirms the access token and product)
- `POST /api/webhook/polar` unsigned or with a bad signature → `403` (confirms `POLAR_WEBHOOK_SECRET` is loaded)
- Locally: signed events reach the handlers (`202`), tampered bodies are rejected (`403`), and a missing secret or token returns `500` without crashing
- Locally, end to end against a simulated Polar API with real signed webhooks (33 checks): sample vs. full content, paywalls, checkout carries the app user id, webhook grants access (trialing), duplicate and out-of-order deliveries ignored, cancel-at-period-end keeps access, revoke removes it, missed-webhook recovery through a direct Polar lookup, comp emails, forged webhooks rejected, account deletion removes the access record

## Verify-before-merging checklist

- [ ] Complete one checkout with the 100% discount code and confirm the webhook delivery shows `202` in Polar
- [ ] Confirm the webhook endpoint's API version in the dashboard matches the SDK import (`2026-10`)
- [ ] `POLAR_*` variables are set for **Production** in Vercel (and Preview only if you intend previews to take payments)
- [ ] With a real account: subscribe using the 100% discount code, then confirm the app unlocks (Account page shows the subscription) and the access record appears in Redis as `access:<userId>`
- [ ] Add your own email to `FREE_ACCESS_EMAILS` in Vercel if you want full access without a subscription
- [ ] Deleting an app account does **not** cancel the Polar subscription. Users are warned on the Account page; cancel in Polar if someone asks you to delete their account
- [ ] Before going live: complete Polar's organization review so real payments are accepted, then remove any test discount codes
