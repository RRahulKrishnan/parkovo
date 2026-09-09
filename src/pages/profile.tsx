import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, updateProfile as updateAuthProfile, type User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ChevronRight, LogOut, UserCircle2, Check, X as XIcon } from "lucide-react";
import { theme } from "../theme/theme";
import Button from "../components/button";
import { getFirebaseAuth, getFirestoreDb } from "../firebase/config";

interface ProfileDoc {
  fullName: string;
  email: string;
  phoneNumber: string;
  phoneVerified?: boolean;
}

const SETTINGS_ROWS = ["Payment methods", "Notifications", "Help & support"];
const NAME_PATTERN = /^[a-zA-Z\s]{2,}$/;

function Profile() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSavingName, setIsSavingName] = useState(false);

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
          const data = snap.data() as ProfileDoc;
          setProfile(data);
          setNameDraft(data.fullName);
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

  const handleStartEditName = () => {
    setNameDraft(profile?.fullName ?? authUser?.displayName ?? "");
    setNameError(undefined);
    setIsEditingName(true);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setNameError(undefined);
  };

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameError("Enter your name");
      return;
    }
    if (!NAME_PATTERN.test(trimmed)) {
      setNameError("Letters and spaces only");
      return;
    }
    if (!authUser) return;

    setIsSavingName(true);
    try {
      await updateDoc(doc(getFirestoreDb(), "users", authUser.uid), { fullName: trimmed });
      await updateAuthProfile(authUser, { displayName: trimmed });
      setProfile((prev) => (prev ? { ...prev, fullName: trimmed } : prev));
      setIsEditingName(false);
    } catch (err) {
      console.error("Failed to update name:", err);
      setNameError("Couldn't save. Please try again.");
    } finally {
      setIsSavingName(false);
    }
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
          <div className={`h-24 animate-pulse rounded-2xl border ${theme.border.default} bg-slate-50`} />
        ) : (
          <div className={`rounded-2xl border ${theme.border.default} p-4`}>
            <div className="flex items-start gap-4">
              <UserCircle2 className="h-12 w-12 flex-shrink-0 text-slate-300" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                {isEditingName ? (
                  <div>
                    <input
                      autoFocus
                      value={nameDraft}
                      onChange={(e) => {
                        setNameDraft(e.target.value);
                        setNameError(undefined);
                      }}
                      className={`w-full rounded-lg border px-3 py-1.5 text-sm font-bold outline-none transition focus:ring-1 ${
                        nameError
                          ? `${theme.border.error} ${theme.border.focusError} ${theme.ring.focusError}`
                          : `${theme.border.default} ${theme.border.focus} ${theme.ring.focus}`
                      }`}
                    />
                    {nameError && <p className={`mt-1 text-xs ${theme.text.error}`}>{nameError}</p>}
                    <div className="mt-2 flex gap-2">
                      <Button type="button" size="sm" isLoading={isSavingName} onClick={handleSaveName}>
                        <Check className="h-3.5 w-3.5" />
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isSavingName}
                        onClick={handleCancelEditName}
                      >
                        <XIcon className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="truncate text-base font-bold">{displayName}</p>
                    {email && <p className={`truncate text-sm ${theme.text.secondary}`}>{email}</p>}
                    {phoneNumber && <p className={`text-sm ${theme.text.secondary}`}>{phoneNumber}</p>}
                    <button
                      type="button"
                      onClick={handleStartEditName}
                      className={`mt-2 text-xs font-semibold ${theme.text.link}`}
                    >
                      Edit profile
                    </button>
                  </>
                )}
              </div>
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