import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Input from "../components/input";
import Button from "../components/button";
import { theme } from "../theme/theme";
import { getFirebaseAuth, getFirestoreDb } from "../firebase/config";
import { getAuthErrorMessage } from "../firebase/authErrors";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.email.trim()) {
    errors.email = "Enter your email";
  } else if (!EMAIL_PATTERN.test(data.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!data.password) {
    errors.password = "Enter your password";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

function Login() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Someone can be authenticated with Firebase but never have finished
  // signup (e.g. they abandoned it right after the phone-verification
  // step). We treat "has a Firestore profile doc" as the real signal
  // that signup was completed, matching how signup.tsx only writes that
  // doc once phone verification succeeds.
  const proceedIfProfileExists = async (user: User) => {
    const snap = await getDoc(doc(getFirestoreDb(), "users", user.uid));
    if (snap.exists()) {
      navigate("/find-parking");
      return;
    }
    await signOut(getFirebaseAuth());
    setAuthError("Looks like you haven't finished creating your account. Please sign up to continue.");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setResetMessage(null);

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await proceedIfProfileExists(credential.user);
    } catch (err: unknown) {
      console.error("Sign in failed:", err);
      setAuthError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setResetMessage(null);
    setIsGoogleSigningIn(true);
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await proceedIfProfileExists(result.user);
    } catch (err: unknown) {
      console.error("Google sign-in failed:", err);
      setAuthError(getAuthErrorMessage(err));
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    setAuthError(null);
    setResetMessage(null);

    if (!formData.email.trim() || !EMAIL_PATTERN.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Enter your email above first" }));
      return;
    }

    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), formData.email);
      setResetMessage(`Password reset link sent to ${formData.email}.`);
    } catch (err: unknown) {
      console.error("Password reset failed:", err);
      setAuthError(getAuthErrorMessage(err));
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <main
      className={`min-h-screen flex flex-col ${theme.surface.page} ${theme.text.primary}`}
    >
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative px-6 pt-14 pb-4 flex flex-col items-start text-left">
          <h2 className="text-[2.75rem] leading-[0.95] font-extrabold tracking-tight">
            Welcome
            <br />
            back
          </h2>
          <p className={`mt-3 text-base font-medium ${theme.text.secondary}`}>
            Sign in to find or list a spot
          </p>
        </div>
      </div>

      {/* Form */}
      <section className="flex-1 px-6 pt-4 pb-8">
        {authError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {authError}
          </div>
        )}

        {resetMessage && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {resetMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Input
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <div className="flex items-center justify-end -mt-1">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isSendingReset}
              className={`text-sm font-medium ${theme.text.link} transition disabled:opacity-60`}
            >
              {isSendingReset ? "Sending…" : "Forgot password?"}
            </button>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className={`h-px flex-1 ${theme.divider}`} />
          <span className={`text-sm ${theme.text.muted}`}>OR</span>
          <div className={`h-px flex-1 ${theme.divider}`} />
        </div>

        <Button
          variant="secondary"
          type="button"
          isLoading={isGoogleSigningIn}
          onClick={handleGoogleSignIn}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 01-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A11.998 11.998 0 0012 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.27a7.2 7.2 0 010-4.54v-3.1H1.27a12 12 0 000 10.74l4-3.1z"
            />
            <path
              fill="#EA4335"
              d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.63l4 3.1C6.22 6.88 8.87 4.77 12 4.77z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className={`mt-8 text-center text-sm ${theme.text.secondary}`}>
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className={`font-medium ${theme.text.link} transition`}
          >
            Sign up
          </button>
        </p>
      </section>

      <footer className="px-6 pb-6 text-center">
        <p className={`text-xs ${theme.text.muted}`}>
          © 2026 ParkingO. All rights reserved.
        </p>
      </footer>
    </main>
  );
}

export default Login;