import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, Auth, indexedDBLocalPersistence, initializeAuth, browserLocalPersistence } from "firebase/auth";
import { Capacitor } from '@capacitor/core';

// Configuration is loaded from environment variables.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;

// Simplified Auth initialization to avoid auth/argument-error
if (typeof window !== 'undefined') {
  if (Capacitor.isNativePlatform()) {
    // Native platforms require specific persistence handling
    try {
      auth = initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence]
      });
    } catch (e) {
      // Fallback if already initialized
      auth = getAuth(app);
    }
  } else {
    auth = getAuth(app);
  }
} else {
  // Server-side
  auth = getAuth(app);
}

const db = getFirestore(app);

export { db, auth };
