
import * as admin from 'firebase-admin';

// Check if the service account details are available in environment variables
const hasServiceAccount = 
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL;

let adminApp: admin.app.App;

if (hasServiceAccount) {
    // If the app is already initialized, use it. Otherwise, initialize it.
    if (!admin.apps.length) {
        try {
            adminApp = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
            });
             console.log('Firebase Admin SDK initialized successfully.');
        } catch (error: any) {
            console.error('Firebase Admin SDK initialization error:', error.code, error.message);
            // Re-throw if it's not a duplicate app error, which can happen with hot-reloading
            if (error.code !== 'app/duplicate-app') {
                throw error;
            }
            adminApp = admin.app(); // Get the already initialized app
        }
    } else {
        adminApp = admin.app(); // Get the already initialized app
    }
} else {
    console.warn("Firebase Admin SDK credentials are not set in environment variables. Admin features will be disabled.");
    // Assign a dummy object if not configured, to prevent crashes on import
    adminApp = {} as admin.app.App;
}

const adminAuth = adminApp.auth ? adminApp.auth() : undefined;
const adminDb = adminApp.firestore ? adminApp.firestore() : undefined;

export { adminApp, adminAuth, adminDb };
