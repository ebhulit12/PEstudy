/* GET /checkout?products=<product_id>  (rewritten to /api/checkout in vercel.json)
   Creates a Polar checkout session and 302-redirects to Polar's hosted checkout.
   No success URL: Polar shows its own hosted confirmation after payment. */
import { getPolar } from './_lib/polar.mjs';

export async function GET(request) {
  const url = new URL(request.url);
  const products = url.searchParams.getAll('products');

  if (products.length === 0) {
    return Response.json({ error: 'Missing products in query params' }, { status: 400 });
  }

  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    undefined;

  try {
    const checkout = await getPolar().checkouts.create({
      products,
      customer_ip_address: ipAddress,
    });
    return Response.redirect(checkout.url, 302);
  } catch (error) {
    console.error('Polar checkout failed', error);
    return new Response(null, { status: 500 });
  }
}
