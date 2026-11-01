import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// Firebase web configuration identifies the project; authorization lives in
// Firebase Authentication and firestore.rules, never in hiding this key.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let client: { auth: ReturnType<typeof getAuth>; db: ReturnType<typeof getFirestore> } | undefined;
export function getFirebase() {
  if (typeof window === "undefined") throw new Error("Firebase client must run in the browser.");
  if (client) return client;
  const emulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true";
  if (emulators && !["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)) {
    throw new Error("Firebase emulators are restricted to local development.");
  }
  if (!emulators && (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId)) {
    throw Object.assign(new Error("Firebase web configuration is missing."), { code: "firebase/not-configured" });
  }
  const app = getApps().length ? getApp() : initializeApp(emulators ? { ...firebaseConfig, projectId: "demo-vihar", apiKey: "demo-vihar-key", authDomain: "demo-vihar.firebaseapp.com", appId: "demo-vihar-web" } : firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  if (emulators && !auth.emulatorConfig) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  auth.languageCode = "en";
  client = { auth, db };
  return client;
}
