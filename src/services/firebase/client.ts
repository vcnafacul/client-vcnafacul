import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Push (FE-03). Não é segredo: é o número do meio do appId.
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _messaging: Promise<Messaging | null> | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps()[0] ?? initializeApp(config);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function getFirestoreDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}

/**
 * Messaging do FCM, ou `null` quando o navegador não suporta (Safari fora do
 * PWA instalado, navegador sem Push API…). ⚠️ Lazy e só depois do
 * `isSupported()`: o `getMessaging` lança em navegador sem suporte.
 */
export function getFirebaseMessaging(): Promise<Messaging | null> {
  if (_messaging) return _messaging;
  _messaging = isSupported()
    .then((ok) => (ok ? getMessaging(getFirebaseApp()) : null))
    .catch(() => null);
  return _messaging;
}
