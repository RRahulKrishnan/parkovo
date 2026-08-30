import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import Input from "../components/input";
import Button from "../components/button";
import OtpVerificationCard from "../components/otpVerificationCard";
import TermsCard from "../components/termsCard";
import { theme } from "../theme/theme";
import { getFirebaseAuth } from "../firebase/config";
import { createUserProfile } from "../firebase/firestore";
import { getAuthErrorMessage } from "../firebase/authErrors";

type Step = "details" | "phone";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[a-zA-Z\s]{2,}$/;
const PHONE_PATTERN = /^[0-9]{10}$/;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Enter your full name";
  } else if (!NAME_PATTERN.test(data.fullName.trim())) {
    errors.fullName = "Enter a valid name (letters and spaces only)";
  }

  if (!data.email.trim()) {
    errors.email = "Enter your email";
  } else if (!EMAIL_PATTERN.test(data.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!data.password) {
    errors.password = "Create a password";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Confirm your password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

function validatePhoneNumber(phoneNumber: string): string | undefined {
  if (!phoneNumber.trim()) return "Enter your phone number";
  if (!PHONE_PATTERN.test(phoneNumber)) return "Enter a valid 10-digit phone number";
  return undefined;
}

function SignUp() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("details");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsCardOpen, setIsTermsCardOpen] = useState(false);

  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // The Firebase Auth user created (email/password) or signed in (Google)
  // in step 1. Nothing is written to Firestore, and the person isn't
  // considered "signed up," until their phone is verified in step 2.
  const [authUser, setAuthUser] = useState<User | null>(null);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isOtpCardOpen, setIsOtpCardOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const finalizeAccount = async (user: User, verifiedPhoneNumber: string) => {
    setIsFinalizing(true);
    setAuthError(null);
    try {
      await createUserProfile(user.uid, {
        fullName: user.displayName ?? formData.fullName,
        email: user.email ?? formData.email,
        phoneNumber: verifiedPhoneNumber,
      });
      navigate("/role");
    } catch (err: unknown) {
      console.error("Couldn't finish setting up your account:", err);
      setAuthError(getAuthErrorMessage(err));
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleContinueDetails = async () => {
    setAuthError(null);
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (!termsAccepted) return;

    setIsSubmittingDetails(true);
    try {
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await updateProfile(credential.user, { displayName: formData.fullName });
      setAuthUser(credential.user);
      setStep("phone");
    } catch (err: unknown) {
      console.error("Account creation failed:", err);
      setAuthError(getAuthErrorMessage(err));
    } finally {
      setIsSubmittingDetails(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!termsAccepted) return;
    setAuthError(null);
    setIsGoogleSigningIn(true);
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      setAuthUser(result.user);

      if (result.user.phoneNumber) {
        // This Google-linked account already has a verified phone number
        // somehow — nothing left to gate on, finish immediately.
        await finalizeAccount(result.user, result.user.phoneNumber);
      } else {
        setStep("phone");
      }
    } catch (err: unknown) {
      console.error("Google sign-in failed:", err);
      setAuthError(getAuthErrorMessage(err));
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleOpenPhoneVerification = () => {
    const error = validatePhoneNumber(phoneNumber);
    setPhoneError(error);
    if (error) return;
    setIsOtpCardOpen(true);
  };

  // Fired by the OTP card once the code is confirmed and the phone number
  // has been linked to the signed-in Firebase user. This is the gate —
  // only from here does the account actually get finalized and the
  // person allowed into the app.
  const handlePhoneVerified = async () => {
    setIsOtpCardOpen(false);
    setPhoneVerified(true);

    const user = getFirebaseAuth().currentUser;
    if (!user) {
      setAuthError("Your session expired. Please start again.");
      setStep("details");
      setAuthUser(null);
      return;
    }
    await finalizeAccount(user, user.phoneNumber ?? phoneNumber);
  };

  const handleStartOver = async () => {
    await signOut(getFirebaseAuth());
    setAuthUser(null);
    setPhoneNumber("");
    setPhoneError(undefined);
    setPhoneVerified(false);
    setAuthError(null);
    setStep("details");
  };

  return (
    <main className={`min-h-screen flex flex-col ${theme.surface.page} ${theme.text.primary}`}>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative px-6 pt-10 pb-3 flex flex-col items-start text-left">
          <h2 className="text-[2.25rem] leading-[0.95] font-extrabold tracking-tight">
            {step === "details" ? (
              <>
                Create
                <br />
                account
              </>
            ) : (
              <>
                Verify
                <br />
                your phone
              </>
            )}
          </h2>
          <p className={`mt-2 text-base font-medium ${theme.text.secondary}`}>
            {step === "details"
              ? "Join ParkingO to find or list a spot"
              : "One last step before you're in"}
          </p>
        </div>
      </div>

      <section className="flex-1 px-6 pt-2 pb-8">
        {authError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {authError}
          </div>
        )}

        {step === "details" ? (
          <>
            <form
              onSubmit={(e) => e.preventDefault()}
              noValidate
              className="space-y-4"
            >
              <Input
                id="fullName"
                name="fullName"
                label="Full name"
                type="text"
                inputMode="text"
                autoComplete="name"
                placeholder="Enter Name"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required
              />

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
                required
              />

              <Input
                id="password"
                name="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />

              <p className={`text-sm ${theme.text.secondary}`}>
                By continuing, you agree to our{" "}
                <button
                  type="button"
                  onClick={() => setIsTermsCardOpen(true)}
                  className={`font-medium ${theme.text.link} underline underline-offset-2 transition`}
                >
                  Terms & Privacy Policy
                </button>
                {termsAccepted && <span className="ml-1 font-semibold text-emerald-600">✓</span>}
              </p>

              <Button
                type="button"
                isLoading={isSubmittingDetails}
                disabled={!termsAccepted}
                onClick={handleContinueDetails}
              >
                {isSubmittingDetails ? "Creating account…" : "Continue"}
              </Button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className={`h-px flex-1 ${theme.divider}`} />
              <span className={`text-sm ${theme.text.muted}`}>OR</span>
              <div className={`h-px flex-1 ${theme.divider}`} />
            </div>

            <Button
              variant="secondary"
              type="button"
              isLoading={isGoogleSigningIn}
              disabled={!termsAccepted}
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

            {!termsAccepted && (
              <p className={`mt-2 text-center text-xs ${theme.text.muted}`}>
                Accept the Terms & Privacy Policy above to continue
              </p>
            )}

            <p className={`mt-6 text-center text-sm ${theme.text.secondary}`}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={`font-medium ${theme.text.link} transition`}
              >
                Log in
              </button>
            </p>
          </>
        ) : (
          <div>
            <p className={`text-sm ${theme.text.secondary}`}>
              {authUser?.email ? `Signed in as ${authUser.email}. ` : ""}
              We verify every phone number, even for Google sign-ins, so
              hosts and drivers can always reach each other.
            </p>

            <div className="mt-5">
              <Input
                id="phoneNumber"
                name="phoneNumber"
                label="Phone number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhoneNumber(digits);
                  setPhoneError(undefined);
                }}
                error={phoneError}
                required
                maxLength={10}
                disabled={isFinalizing}
                trailing={
                  phoneVerified ? (
                    <span className="text-xs font-semibold text-emerald-600">Verified ✓</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenPhoneVerification}
                      className={`text-xs font-semibold ${theme.text.link}`}
                    >
                      Verify
                    </button>
                  )
                }
              />
            </div>

            {isFinalizing && (
              <p className={`mt-4 text-sm ${theme.text.secondary}`}>Setting up your account…</p>
            )}

            <button
              type="button"
              onClick={handleStartOver}
              disabled={isFinalizing}
              className={`mt-6 block text-center text-sm ${theme.text.link} disabled:opacity-50`}
            >
              Use a different email or account
            </button>
          </div>
        )}
      </section>

      <footer className="px-6 pb-6 text-center">
        <p className={`text-xs ${theme.text.muted}`}>© 2026 ParkingO. All rights reserved.</p>
      </footer>

      {isOtpCardOpen && (
        <OtpVerificationCard
          mode="link"
          phoneNumber={phoneNumber}
          onClose={() => setIsOtpCardOpen(false)}
          onChangeNumber={() => setIsOtpCardOpen(false)}
          onComplete={handlePhoneVerified}
        />
      )}

      {isTermsCardOpen && (
        <TermsCard
          onClose={() => setIsTermsCardOpen(false)}
          onAccept={() => {
            setTermsAccepted(true);
            setIsTermsCardOpen(false);
          }}
        />
      )}
    </main>
  );
}

export default SignUp;