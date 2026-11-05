/* Shared Polar SDK client (server-only). One client per function instance, reused across requests.
   Environment comes from POLAR_SERVER ("production" | "sandbox"), so switching is an env change only.
   Required env vars (set in Vercel → Settings → Environment Variables):
     POLAR_ACCESS_TOKEN  organization access token for the chosen environment
     POLAR_SERVER        production | sandbox   (defaults to production) */
import { createPolar } from '@polar-sh/sdk/2026-10';

let client = null;

export function getPolar() {
  if (client) return client;
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) throw new Error('POLAR_ACCESS_TOKEN is required');
  const environment = process.env.POLAR_SERVER === 'sandbox' ? 'sandbox' : 'production';
  client = createPolar({ accessToken, environment });
  return client;
}
