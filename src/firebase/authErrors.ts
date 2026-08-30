import { FirebaseError } from "firebase/app";

const MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "That email is already registered. Try logging in instead.",
  "auth/credential-already-in-use": "That email is already linked to another account.",
  "auth/weak-password": "Choose a stronger password (at least 8 characters).",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/provider-already-linked": "This phone number is already linked to an account.",
  "auth/requires-recent-login": "Your verification session expired. Please verify your phone again.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled yet. Check Firebase Console > Authentication > Sign-in method.",
  "auth/popup-closed-by-user": "The sign-in window was closed before finishing. Please try again.",
  "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups for this site and try again.",
  "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",
  "auth/unauthorized-domain": "This domain isn't authorized for sign-in. Check Firebase Console > Authentication > Settings > Authorized domains.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
};

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    return MESSAGES[err.code] ?? `Couldn't complete that action. (${err.code})`;
  }
  return "Couldn't create your account. Please try again.";
}