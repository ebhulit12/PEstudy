/* GET /checkout?products=<product_id>  (rewritten to /api/checkout in vercel.json)
   Creates a Polar checkout session for the signed-in user and 302-redirects to Polar's hosted checkout.
   The Polar customer is linked to the app user via external_customer_id = app user id, taken from the
   server-side session (never from the query string). Signed-out visitors are sent to sign in first.
   No success URL: Polar shows its own hosted confirmation after payment. */
import { getPolar } from './_lib/polar.mjs';
import session from './_lib/session.js';
import access from './_lib/access.js';

const redirect = (location) => new Response(null, { status: 302, headers: { Location: location, 'Cache-Control': 'no-store' } });

export async function GET(request) {
  const url = new URL(request.url);
  const products = url.searchParams.getAll('products');

  if (products.length === 0) {
    return Response.json({ error: 'Missing products in query params' }, { status: 400 });
  }
  if (!products.every((id) => access.productIds().includes(id))) {
    return Response.json({ error: 'Unknown product' }, { status: 400 });
  }

  let user = null;
  try {
    const s = await session.currentSession({ headers: { cookie: request.headers.get('cookie') || '' } });
    user = s && s.user;
  } catch (error) {
    console.error('Session lookup failed', error);
  }
  if (!user) return redirect('/#/subscribe'); // sign in (online account) first, then subscribe

  const current = await access.getAccess(user, { refresh: 'auto' });
  if (current.active) return redirect('/#/account'); // already subscribed

  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    undefined;

  try {
    const checkout = await getPolar().checkouts.create({
      products,
      external_customer_id: user.id,
      customer_email: user.email,
      customer_name: user.name || undefined,
      customer_ip_address: ipAddress,
    });
    return Response.redirect(checkout.url, 302);
  } catch (error) {
    console.error('Polar checkout failed', error);
    return new Response(null, { status: 500 });
  }
}
