
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

// This check provides a clear, actionable error if the keys are missing.
// It's better to fail early and loudly than to proceed with an invalid config.
if (!firebaseConfig.apiKey) {
  throw new Error(
    "Firebase API Key is missing. The app cannot connect to Firebase. Please follow these steps: \n1. Create a file named `.env.local` in the root of your project. \n2. Copy the contents of `.env.local.example` into it. \n3. Replace the placeholder values with your actual Firebase project credentials. \n4. Restart the development server."
  );
}

// Initialize Firebase
// This check prevents re-initializing the app on every hot-reload in development
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
