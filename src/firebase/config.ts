import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Pulled from Vite env vars — add these to a .env file at your project
// root, all prefixed with VITE_ so Vite exposes them to the client bundle.
// Get the values from Firebase Console > Project settings > Your apps.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseAuth(): Auth {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  if (!auth) {
    auth = getAuth(app);

    // DEV ONLY: skips reCAPTCHA entirely for phone auth. This only works
    // with a number added under Authentication > Sign-in method > Phone >
    // "Phone numbers for testing" in Firebase Console — real numbers still
    // require a working reCAPTCHA setup. Gated by import.meta.env.DEV so
    // this can never accidentally ship to production, where it would be a
    // real security hole (it disables Firebase's anti-abuse check).
    if (import.meta.env.DEV) {
      auth.settings.appVerificationDisabledForTesting = true;
    }
  }
  return auth;
}

export function getFirestoreDb(): Firestore {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}

/**
 * Creates an invisible reCAPTCHA verifier attached to the given container
 * id. Firebase requires this to exist before signInWithPhoneNumber runs.
 * Create it lazily, right before sending the OTP, so the DOM node it
 * targets is guaranteed to already be mounted.
 */
export function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  const authInstance = getFirebaseAuth();
  return new RecaptchaVerifier(authInstance, containerId, {
    size: "invisible",
  });
}