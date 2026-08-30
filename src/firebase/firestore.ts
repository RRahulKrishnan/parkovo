import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "./config";

export interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
}

/**
 * Creates the user's profile document at users/{uid}. Called once, right
 * after the Firebase Auth user is fully set up (phone verified, email +
 * password linked). Uses setDoc rather than addDoc so the profile lives
 * at a predictable path keyed by uid, matching how you'll look it up
 * elsewhere in the app (auth.currentUser.uid).
 */
export async function createUserProfile(uid: string, profile: UserProfile): Promise<void> {
  const db = getFirestoreDb();
  await setDoc(doc(db, "users", uid), {
    ...profile,
    createdAt: serverTimestamp(),
  });
}