import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/** Server only. Never import into a client component or expose private keys. */
export function getAdmin() {
  if (typeof window !== "undefined") throw new Error("Server-only Firebase credentials.");
  const emulator = process.env.VIHAR_ID_EMULATOR === "true";
  if (emulator && process.env.VERCEL) throw new Error("Emulators cannot run on Vercel.");
  const projectId = emulator ? "demo-vihar" : process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Firebase Admin is not configured.");
  const app = getApps().find((item) => item.name === "vihar-server") || initializeApp({
    projectId,
    ...(emulator ? {} : { credential: process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? cert({ projectId, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n") }) : applicationDefault() }),
  }, "vihar-server");
  return { db: getFirestore(app), auth: getAuth(app) };
}
