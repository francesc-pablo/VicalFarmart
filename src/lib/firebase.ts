import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, indexedDBLocalPersistence, Auth, browserLocalPersistence } from "firebase/auth";
import { Capacitor } from '@capacitor/core';

// =================================================================
// IMPORTANT: This configuration is now loaded from environment variables.
// Create a `.env.local` file in the root of your project and add your
// Firebase project's configuration there.
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
let app;
if (firebaseConfig.apiKey) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
    console.warn("Firebase configuration is missing. Firebase services will not be available.");
    app = {
      name: "dummy",
      options: {},
      automaticDataCollectionEnabled: false,
    } as any;
}

let auth: Auth;

if (app.name !== 'dummy') {
  if (typeof window !== 'undefined') {
    if (Capacitor.isNativePlatform()) {
      // Use IndexedDB for native platforms to persist auth state between app reloads/webview resets
      try {
        auth = initializeAuth(app, {
          persistence: [indexedDBLocalPersistence, browserLocalPersistence]
        });
      } catch (e) {
        // If already initialized (common during development HMR), get the existing instance
        auth = getAuth(app);
      }
    } else {
      // Standard web behavior
      auth = getAuth(app);
    }
  } else {
    // Server-side
    auth = getAuth(app);
  }
} else {
  auth = {} as any;
}

const db = app.name !== 'dummy' ? getFirestore(app) : ({} as any);

export { db, auth };