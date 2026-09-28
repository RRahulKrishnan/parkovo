import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "../firebase/config";

function LoadingScreen() {
  return <main className="flex min-h-screen items-center justify-center bg-white"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" /></main>;
}

/** Requires both a Firebase session and a completed profile document. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
    if (!nextUser) { setUser(null); return; }
    try {
      const profile = await getDoc(doc(getFirestoreDb(), "users", nextUser.uid));
      setUser(profile.exists() ? nextUser : null);
    } catch {
      // Do not expose protected screens when the profile cannot be verified.
      setUser(null);
    }
  }), []);

  if (user === undefined) return <LoadingScreen />;
  return user ? <>{children}</> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export function RequireCheckout({ children }: { children: ReactNode }) {
  const hasCheckout = Boolean(sessionStorage.getItem("parkovo-pending-checkout"));
  return hasCheckout ? <>{children}</> : <Navigate to="/find-parking" replace />;
}
