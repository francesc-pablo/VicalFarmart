
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// =================================================================
// IMPORTANT: Replace the configuration below with your own
// Firebase project's configuration.
//
// How to get this:
// 1. Go to your Firebase project's console.
// 2. In the project overview, click the "</>" (web) icon to add a web app.
// 3. Follow the setup steps, and you'll be given a `firebaseConfig` object.
// 4. Copy that object and paste it here.
//
// For more information, visit:
// https://firebase.google.com/docs/web/setup#available-libraries
// =================================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
// This check prevents re-initializing the app on every hot-reload in development
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
