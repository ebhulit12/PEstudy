/* Site configuration.
 *
 * ACCOUNTS: logins are handled by this site's own Vercel Functions (the /api folder) and
 * stored in a Redis database you connect in the Vercel dashboard (Storage → Upstash Redis).
 * Nothing to configure here — once the database is connected, the "Account" tab on the
 * login screen turns on automatically. See README.md ("Setting up user accounts").
 */
window.APP_CONFIG = {
  siteName: 'PE MDM Prep',

  // Where the API lives. Leave '' when the site and /api are on the same Vercel project.
  apiBase: '',

  // Allow people to use the site without an account (guest / device profiles — free sample only)
  allowLocalProfiles: true,

  // Wording on the subscribe screens. Prices are charged by Polar; keep this in sync with the product.
  subscription: {
    name: 'PE MDM Prep — full access',
    price: '$20/month',
    trial: '7-day free trial'
  }
};
