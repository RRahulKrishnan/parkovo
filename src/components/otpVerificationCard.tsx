import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Button from "./button";
import OtpInput from "./otpInput";
import { theme } from "../theme/theme";
import { usePhoneVerification, type PhoneVerificationMode } from "../hooks/usePhoneVerification";

interface OtpVerificationCardProps {
  phoneNumber: string;
  onClose: () => void;
  onChangeNumber: () => void;
  onComplete: () => void;
  /** "signin" (default) when no one is authenticated yet — verifying the
   * phone IS how the account gets created. "link" when a user is already
   * signed in (e.g. via Google) and this phone needs to attach to that
   * same account instead of starting a separate session. */
  mode?: PhoneVerificationMode;
}

function OtpVerificationCard({
  phoneNumber,
  onClose,
  onChangeNumber,
  onComplete,
  mode = "signin",
}: OtpVerificationCardProps) {
  const { status, error, resendSecondsLeft, sendOtp, verifyOtp, resendOtp } =
    usePhoneVerification(mode);
  const [code, setCode] = useState("");

  // Kick off the send as soon as the card mounts. Guarded with a ref
  // (not just the dependency array) because React StrictMode
  // double-invokes effects in development — without this guard, two
  // invisible reCAPTCHA widgets would race to render into the same
  // container and Firebase throws auth/internal-error.
  const hasSentRef = useRef(false);
  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;
    sendOtp(phoneNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber]);

  // Auto-submit once all 6 digits are in.
  useEffect(() => {
    if (code.length === 6 && status === "awaiting-code") {
      verifyOtp(code);
    }
  }, [code, status, verifyOtp]);

  const isVerified = status === "verified";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-card-title"
    >
      {/* Firebase mounts its invisible reCAPTCHA challenge here */}
      <div id="firebase-recaptcha-container" />

      <div
        className={`relative w-full max-w-sm rounded-2xl border ${theme.border.default} bg-white p-6 shadow-xl`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel verification"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 id="otp-card-title" className={`pr-10 text-lg font-bold ${theme.text.primary}`}>
          Verify your phone
        </h3>
        <p className={`mt-1 text-sm ${theme.text.secondary}`}>
          {status === "sending"
            ? `Sending a code to ${phoneNumber}…`
            : `Enter the 6-digit code sent to ${phoneNumber}`}
        </p>

        <div className="mt-5">
          <OtpInput
            value={code}
            onChange={setCode}
            disabled={status === "verifying" || status === "sending"}
            error={status === "awaiting-code" || status === "error" ? error ?? undefined : undefined}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onChangeNumber}
            className={`text-sm font-medium ${theme.text.link} transition`}
          >
            Change phone number
          </button>

          <button
            type="button"
            onClick={resendOtp}
            disabled={resendSecondsLeft > 0 || status === "sending"}
            className={`text-sm font-medium transition ${
              resendSecondsLeft > 0 || status === "sending"
                ? `${theme.text.muted} cursor-not-allowed`
                : theme.text.link
            }`}
          >
            {resendSecondsLeft > 0 ? `Resend in ${resendSecondsLeft}s` : "Resend code"}
          </button>
        </div>

        {isVerified && (
          <p className="mt-3 text-sm font-medium text-emerald-600">
            Phone number verified ✓
          </p>
        )}

        <div className="mt-5">
          <Button type="button" disabled={!isVerified} onClick={onComplete}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OtpVerificationCard;