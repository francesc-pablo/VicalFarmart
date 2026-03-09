import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";
import { Capacitor } from "@capacitor/core";

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

const auth = getAuth(app);
const db = getFirestore(app);

// Optimize persistence for Native/WebView environments
if (typeof window !== "undefined") {
    // indexedDB is much more reliable in Capacitor than default sessionStorage
    const persistence = Capacitor.isNativePlatform() ? indexedDBLocalPersistence : browserLocalPersistence;
    setPersistence(auth, persistence).catch((err) => {
        console.warn("Firebase persistence error:", err);
    });
}

export { db, auth, app };