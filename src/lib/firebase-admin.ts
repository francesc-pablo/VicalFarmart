
import * as admin from 'firebase-admin';

// =================================================================
// IMPORTANT: Service Account credentials should be stored securely
// in environment variables, not in the source code.
//
// This setup expects the service account JSON to be stored in
// the `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable.
// =================================================================

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

export function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (!serviceAccountString) {
    throw new Error('The "FIREBASE_SERVICE_ACCOUNT_JSON" environment variable is not set. The application cannot start.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Error parsing Firebase service account JSON:", error);
    throw new Error("Could not initialize Firebase Admin SDK. The service account JSON might be malformed.");
  }
}
