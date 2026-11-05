/* POST /api/webhook/polar — receives Polar webhook events.
   The signature (webhook-id / webhook-timestamp / webhook-signature headers) is verified against
   POLAR_WEBHOOK_SECRET on the raw request body before any event is handled. The route stays public:
   the signature is the authentication, and Polar doesn't follow redirects.
   Handled events update the subscriber's access record (see api/_lib/access.js):
     customer.state_changed  source of truth — active/trialing subscription to an access product
     order.paid              grants access immediately (details are filled in from Polar afterwards) */
import { webhooks } from '@polar-sh/sdk/2026-10';
import redis from '../_lib/redis.js';
import session from '../_lib/session.js';
import access from '../_lib/access.js';

const DEDUPE_TTL = 7 * 24 * 60 * 60; // seconds; Polar retries for well under a week

/** App user id for a Polar customer (external_customer_id was set to our user id at checkout). */
async function appUser(externalId) {
  if (typeof externalId !== 'string' || !externalId) return null;
  return session.getUser(externalId);
}
const eventTime = (event) => Date.parse(event.timestamp) || Date.now();

async function onCustomerStateChanged(event) {
  const state = event.data || {};
  const user = await appUser(state.external_id);
  if (!user) return; // customer not created through our checkout (or user deleted) — nothing to grant
  const prev = await access.read(user.id);
  const ts = eventTime(event);
  if (prev && prev.eventTs && prev.eventTs > ts) return; // a newer state was already applied
  const rec = access.fromCustomerState(state);
  await access.write(user.id, Object.assign(rec, { source: 'webhook', eventTs: ts, checkedAt: Date.now() }));
}

async function onOrderPaid(event) {
  const order = event.data || {};
  if (order.paid === false || !access.productIds().includes(order.product_id)) return;
  const user = await appUser(order.customer && order.customer.external_id);
  if (!user) return;
  const prev = await access.read(user.id);
  if (prev && prev.active) return; // already granted with full details from customer state
  // Grant right away; checkedAt 0 makes the next status check fetch full details from Polar.
  await access.write(user.id, {
    active: true, status: 'active', productId: order.product_id, currentPeriodEnd: null,
    cancelAtPeriodEnd: false, trialEnd: null, polarCustomerId: order.customer_id || null,
    source: 'order', eventTs: prev && prev.eventTs, checkedAt: 0
  });
}

export async function POST(request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    console.error('POLAR_WEBHOOK_SECRET is not set');
    return Response.json({ received: false }, { status: 500 });
  }

  const body = await request.text(); // must be the raw body, not parsed JSON
  const headers = {
    'webhook-id': request.headers.get('webhook-id') ?? '',
    'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
    'webhook-signature': request.headers.get('webhook-signature') ?? '',
  };

  let event;
  try {
    event = await webhooks.validateEvent(body, headers, secret);
  } catch (error) {
    if (error instanceof webhooks.PolarWebhookVerificationError) {
      return Response.json({ received: false }, { status: 403 });
    }
    if (error instanceof webhooks.PolarWebhookUnknownTypeError) {
      // Signed, but an event type this SDK version doesn't know. Acknowledge so Polar doesn't retry.
      return Response.json({ received: true }, { status: 202 });
    }
    if (error instanceof webhooks.PolarWebhookError) {
      return Response.json({ received: false }, { status: 400 });
    }
    throw error;
  }

  // Polar may redeliver: the webhook-id header is unique per delivery and reused on retries.
  const dedupeKey = 'whk:' + headers['webhook-id'];
  if (await redis.cmd('GET', dedupeKey)) return Response.json({ received: true, duplicate: true }, { status: 202 });

  try {
    switch (event.type) {
      case 'order.paid':
        await onOrderPaid(event);
        break;
      case 'customer.state_changed':
        await onCustomerStateChanged(event);
        break;
    }
  } catch (error) {
    console.error('Polar webhook handling failed', event.type, error);
    return Response.json({ received: false }, { status: 500 }); // Polar will retry
  }

  await redis.cmd('SET', dedupeKey, '1', 'EX', DEDUPE_TTL);
  return Response.json({ received: true }, { status: 202 });
}
