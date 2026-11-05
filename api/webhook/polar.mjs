/* POST /api/webhook/polar — receives Polar webhook events.
   The signature (webhook-id / webhook-timestamp / webhook-signature headers) is verified against
   POLAR_WEBHOOK_SECRET on the raw request body before any event is handled. The route stays public:
   the signature is the authentication, and Polar doesn't follow redirects. */
import { webhooks } from '@polar-sh/sdk/2026-10';

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

  switch (event.type) {
    case 'order.paid':
      // TODO: event.data is the Order — grant the purchase (e.g. mark the user's subscription active).
      break;

    case 'customer.state_changed':
      // TODO: event.data is the full customer state — reconcile the user's access from it.
      break;
  }

  return Response.json({ received: true }, { status: 202 });
}
