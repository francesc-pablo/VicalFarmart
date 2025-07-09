import admin from 'firebase-admin';

// This prevents reloading of the app in dev mode.
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key must be formatted as a single-line string in the .env file
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  try {
      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error('Firebase admin credentials are not set in environment variables.');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
  } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
