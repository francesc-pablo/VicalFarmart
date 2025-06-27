
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
  apiKey: "AIzaSyCgM9UTT07zSaVV1_HdefYyu1qz7y2KOBU",
  authDomain: "vicalfarmart.firebaseapp.com",
  projectId: "vicalfarmart",
  storageBucket: "vicalfarmart.firebasestorage.app",
  messagingSenderId: "318375487368",
  appId: "1:318375487368:web:c0599eab4f20baf04ffc3d",
  measurementId: "G-FEVVJSHFXL"
};

// Initialize Firebase
// This check prevents re-initializing the app on every hot-reload in development
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
