import { useCallback, useEffect, useRef, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  linkWithPhoneNumber,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type RecaptchaVerifier,
} from "firebase/auth";
import { getFirebaseAuth, getRecaptchaVerifier } from "../firebase/config";

export type PhoneVerificationMode =
  | "signin" // no one is signed in yet — phone verification IS the sign-in
  | "link"; // a user is already signed in (e.g. via Google) — attach phone to that same account

export type PhoneVerificationStatus =
  | "idle"
  | "sending"
  | "awaiting-code"
  | "verifying"
  | "verified"
  | "error";

const RESEND_COOLDOWN_SECONDS = 30;
const RECAPTCHA_CONTAINER_ID = "firebase-recaptcha-container";

// Adjust if you support countries beyond India, or better, collect a
// country code from the user alongside the phone number.
const DEFAULT_COUNTRY_CODE = "+91";

interface UsePhoneVerificationResult {
  status: PhoneVerificationStatus;
  error: string | null;
  resendSecondsLeft: number;
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  reset: () => void;
}

function toE164(phoneNumber: string, countryCode = DEFAULT_COUNTRY_CODE) {
  const digits = phoneNumber.replace(/\D/g, "");
  return `${countryCode}${digits}`;
}

export function usePhoneVerification(
  mode: PhoneVerificationMode = "signin"
): UsePhoneVerificationResult {
  const [status, setStatus] = useState<PhoneVerificationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const rawPhoneRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      verifierRef.current?.clear();
      verifierRef.current = null;
      confirmationRef.current = null;
    };
  }, []);

  const startResendTimer = useCallback(() => {
    setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendOtp = useCallback(
    async (phoneNumber: string) => {
      setError(null);
      setStatus("sending");
      rawPhoneRef.current = phoneNumber;
      try {
        const auth = getFirebaseAuth();
        if (!verifierRef.current) {
          verifierRef.current = getRecaptchaVerifier(RECAPTCHA_CONTAINER_ID);
        }

        if (mode === "link") {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            throw new Error("No signed-in user to link this phone number to.");
          }
          confirmationRef.current = await linkWithPhoneNumber(
            currentUser,
            toE164(phoneNumber),
            verifierRef.current
          );
        } else {
          confirmationRef.current = await signInWithPhoneNumber(
            auth,
            toE164(phoneNumber),
            verifierRef.current
          );
        }

        setStatus("awaiting-code");
        startResendTimer();
      } catch (err) {
        console.error("Failed to send OTP:", err);
        const code = err instanceof FirebaseError ? ` (${err.code})` : "";
        setError(`Couldn't send the code. Check the number and try again.${code}`);
        setStatus("error");
        // A failed attempt can leave the widget in a bad state — drop it
        // so the next attempt renders a fresh one.
        verifierRef.current?.clear();
        verifierRef.current = null;
      }
    },
    [mode, startResendTimer]
  );

  const verifyOtp = useCallback(async (code: string) => {
    setError(null);
    setStatus("verifying");
    try {
      if (!confirmationRef.current) {
        throw new Error("No verification in progress");
      }
      await confirmationRef.current.confirm(code);
      setStatus("verified");
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError("That code didn't match. Check it and try again.");
      setStatus("awaiting-code");
    }
  }, []);

  const resendOtp = useCallback(async () => {
    if (resendSecondsLeft > 0 || !rawPhoneRef.current) return;
    await sendOtp(rawPhoneRef.current);
  }, [resendSecondsLeft, sendOtp]);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setResendSecondsLeft(0);
    confirmationRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return { status, error, resendSecondsLeft, sendOtp, verifyOtp, resendOtp, reset };
}