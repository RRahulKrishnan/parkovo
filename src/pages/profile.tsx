import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ChevronRight, LogOut, UserCircle2 } from "lucide-react";
import { theme } from "../theme/theme";
import { getFirebaseAuth, getFirestoreDb } from "../firebase/config";

interface ProfileDoc {
  fullName: string;
  email: string;
  phoneNumber: string;
}

const SETTINGS_ROWS = ["Edit profile", "Payment methods", "Notifications", "Help & support"];

function Profile() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(getFirestoreDb(), "users", user.uid));
        if (snap.exists()) {
          setProfile(snap.data() as ProfileDoc);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogOut = async () => {
    await signOut(getFirebaseAuth());
    navigate("/login");
  };

  const displayName = profile?.fullName || authUser?.displayName || "Your account";
  const email = profile?.email || authUser?.email || "";
  const phoneNumber = profile?.phoneNumber || authUser?.phoneNumber || "";

  return (
    <main className={`min-h-screen ${theme.surface.page} ${theme.text.primary}`}>
      <div className="px-6 pt-14 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Profile</h1>
      </div>

      <section className="px-6 pb-24">
        {isLoading ? (
          <div className={`h-20 animate-pulse rounded-2xl border ${theme.border.default} bg-slate-50`} />
        ) : (
          <div className={`flex items-center gap-4 rounded-2xl border ${theme.border.default} p-4`}>
            <UserCircle2 className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <div className="min-w-0">
              <p className="truncate text-base font-bold">{displayName}</p>
              {email && <p className={`truncate text-sm ${theme.text.secondary}`}>{email}</p>}
              {phoneNumber && <p className={`text-sm ${theme.text.secondary}`}>{phoneNumber}</p>}
            </div>
          </div>
        )}

        <div className={`mt-6 divide-y divide-slate-200 rounded-2xl border ${theme.border.default}`}>
          {SETTINGS_ROWS.map((label) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium transition hover:bg-slate-50"
            >
              {label}
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogOut}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </section>
    </main>
  );
}

export default Profile;