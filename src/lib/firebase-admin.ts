
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : undefined;

let app: admin.app.App;

export function initializeAdminApp() {
  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
    return app;
  }

  if (!serviceAccount) {
    throw new Error('Firebase service account credentials are not set in environment variables.');
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return app;
}
