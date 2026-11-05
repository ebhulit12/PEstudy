# Polar payments setup

Polar ([dashboard](https://polar.sh/dashboard/pe-prepsite)) handles checkout and billing for PE MDM Prep. The integration is built on `@polar-sh/sdk` directly (API version `2026-10`) as plain Vercel Functions. There's no framework adapter.

> ⚠️ **This runs against the live _production_ Polar environment.** Real customers will be charged real money once the organization leaves test mode. To develop against sandbox instead, set `POLAR_SERVER=sandbox` with a sandbox token. Sandbox and production are completely separate (tokens, products, webhooks).

## Files

| File | Status | Purpose |
|---|---|---|
| `package.json`, `package-lock.json` | new | npm manifest with `@polar-sh/sdk` (^1.0.2); `engines.node >=22` (required by SDK 1.x) |
| `api/_lib/polar.mjs` | new | Single shared SDK client; environment read from `POLAR_SERVER` |
| `api/checkout.mjs` | new | `GET /checkout?products=<id>` creates a checkout session and 302-redirects to Polar's hosted checkout (no success URL; Polar shows its own confirmation) |
| `api/webhook/polar.mjs` | new | `POST /api/webhook/polar` verifies the signature on the raw body, then handles `order.paid` and `customer.state_changed` (**TODO stubs; no access is granted yet**) |
| `vercel.json` | changed | Rewrite `/checkout` → `/api/checkout` |
| `.gitignore` | new | Ignores `.env`, `.env.*`, `node_modules/`, `.vercel/` |
| `.env` (not committed) | new | Local placeholders for `vercel dev` |

## Environment variables (names only)

Set in **Vercel → Settings → Environment Variables** (Production), plus `.env` for local `vercel dev`:

- `POLAR_ACCESS_TOKEN`: organization access token (production; scopes: products, checkouts, webhooks, read and write)
- `POLAR_WEBHOOK_SECRET`: signing secret of the webhook endpoint below
- `POLAR_SERVER`: `production` (or `sandbox`)

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

## Verify-before-merging checklist

- [ ] Complete one checkout with the 100% discount code and confirm the webhook delivery shows `202` in Polar
- [ ] Confirm the webhook endpoint's API version in the dashboard matches the SDK import (`2026-10`)
- [ ] `POLAR_*` variables are set for **Production** in Vercel (and Preview only if you intend previews to take payments)
- [ ] Implement the `order.paid` / `customer.state_changed` handlers. Until then, **paying does not grant access**. `validateEvent` checks the signature and event type, not the payload's shape, so validate the fields you use. Deduplicate on the `webhook-id` header and respond quickly (< 2 s).
- [ ] Decide whether `/checkout` should require sign-in, so purchases can be tied to an app account via `external_customer_id`
- [ ] Before going live: complete Polar's organization review so real payments are accepted, then remove any test discount codes
