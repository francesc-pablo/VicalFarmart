
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// =================================================================
// IMPORTANT: This configuration is now loaded from environment variables.
// Create a `.env.local` file in the root of your project and add your
// Firebase project's configuration there.
//
// See `.env.local.example` for a template.
//
// For more information, visit:
// https://firebase.google.com/docs/web/setup#available-libraries
// =================================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
// This check prevents re-initializing the app on every hot-reload in development.
let app;
if (firebaseConfig.apiKey) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
    console.warn("Firebase configuration is missing. Firebase services will not be available.");
    // Create a dummy app object to avoid crashing the app if firebaseConfig is not available
    app = {
      name: "dummy",
      options: {},
      automaticDataCollectionEnabled: false,
    };
}

const db = app.name !== 'dummy' ? getFirestore(app) : ({} as any);
const auth = app.name !== 'dummy' ? getAuth(app) : ({} as any);

export { db, auth };
