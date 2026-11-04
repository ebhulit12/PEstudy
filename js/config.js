/* Site configuration.
 *
 * CLOUD ACCOUNTS (optional): to let users create accounts and sync progress across
 * devices, create a free Firebase project and paste its web config below.
 * Step-by-step instructions are in README.md ("Setting up user accounts").
 * Remember to add pestudy-brown.vercel.app under Firebase → Authentication → Settings →
 * Authorized domains, or sign-in will fail with "unauthorized domain".
 *
 * These values are NOT secrets — Firebase web config is meant to be public. Your data is
 * protected by the Firestore security rules (each user can only read/write their own doc).
 *
 * Leave `firebase: null` to run without cloud accounts. Users can then still create
 * separate profiles on each device ("This device" tab on the login screen).
 */
window.APP_CONFIG = {
  siteName: 'PE MDM Prep',

  firebase: null,
  // firebase: {
  //   apiKey: 'AIza...',
  //   authDomain: 'your-project.firebaseapp.com',
  //   projectId: 'your-project',
  //   storageBucket: 'your-project.appspot.com',
  //   messagingSenderId: '1234567890',
  //   appId: '1:1234567890:web:abcdef123456'
  // },

  // Show the "Continue with Google" button (enable the Google provider in Firebase first)
  googleSignIn: true,

  // Allow people to use the site without signing in (guest / device profiles)
  allowLocalProfiles: true
};
