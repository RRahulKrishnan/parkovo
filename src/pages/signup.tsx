import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/input";
import Button from "../components/button";
import { theme } from "../theme/theme";
import { ArrowLeft } from "lucide-react";

interface FormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
}

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[a-zA-Z\s]{2,}$/;
const PHONE_PATTERN = /^[0-9]{10}$/;

function validate(data: FormData, isOtpStep: boolean): FormErrors {
  const errors: FormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Enter your full name";
  } else if (!NAME_PATTERN.test(data.fullName.trim())) {
    errors.fullName = "Enter a valid name (letters and spaces only)";
  }

  if (!data.phoneNumber.trim()) {
    errors.phoneNumber = "Enter your phone number";
  } else if (!PHONE_PATTERN.test(data.phoneNumber)) {
    errors.phoneNumber = "Enter a valid 10-digit phone number";
  }

  if (!data.email.trim()) {
    errors.email = "Enter your email";
  } else if (!EMAIL_PATTERN.test(data.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!isOtpStep) {
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
  }

  if (isOtpStep) {
    if (!data.otp.trim()) {
      errors.otp = "Enter the verification code";
    } else if (data.otp.trim().length < 6) {
      errors.otp = "OTP must be 6 digits";
    }
  }

  return errors;
}

function SignUp() {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For phone number, only allow digits and limit to 10 characters
    if (name === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) {
        setFormData((prev) => ({
          ...prev,
          [name]: digitsOnly,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);

    // Validate the first step fields (name, phone, email, password, confirm)
    const validationErrors = validate(formData, false);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // TODO: Send OTP to phone number
      // await api.sendOTP(formData.phoneNumber);
      await new Promise((resolve) => setTimeout(resolve, 900));
      
      // Show OTP step
      setStep("otp");
      setResendTimer(30);
      
      // Start resend timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send verification code. Please try again.";
      console.error("OTP send failed:", err);
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);

    const validationErrors = validate(formData, true);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // TODO: Verify OTP
      // await api.verifyOTP(formData.phoneNumber, formData.otp);
      await new Promise((resolve) => setTimeout(resolve, 900));
      
      // TODO: Create account after successful verification
      // const { error } = await supabase.auth.signUp({
      //   email: formData.email,
      //   password: formData.password,
      //   options: {
      //     data: {
      //       full_name: formData.fullName,
      //       phone: formData.phoneNumber,
      //     },
      //   },
      // });
      // if (error) throw error;
      
      console.log("Account created successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid verification code. Please try again.";
      console.error("OTP verification failed:", err);
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setAuthError(null);
    setIsSubmitting(true);
    try {
      // TODO: Resend OTP
      // await api.sendOTP(formData.phoneNumber);
      await new Promise((resolve) => setTimeout(resolve, 900));
      
      setResendTimer(30);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to resend verification code. Please try again.";
      console.error("OTP resend failed:", err);
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={`min-h-screen flex flex-col ${theme.surface.page} ${theme.text.primary}`}
    >
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative px-6 pt-14 pb-4 flex flex-col items-start text-left">
          {/* Back button for OTP step */}
          {step === "otp" && (
            <button
              type="button"
              onClick={() => setStep("details")}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
          
          <h2 className="text-[2.75rem] leading-[0.95] font-extrabold tracking-tight">
            {step === "details" ? "Create" : "Verify"}
            <br />
            {step === "details" ? "account" : "your phone"}
          </h2>
          <p className={`mt-3 text-base font-medium ${theme.text.secondary}`}>
            {step === "details" 
              ? "Join ParkingO to find or list a spot" 
              : `Enter the 6-digit code sent to ${formData.phoneNumber}`}
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

        {step === "details" ? (
          <form onSubmit={handleSendOTP} noValidate className="space-y-5">
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
              id="phoneNumber"
              name="phoneNumber"
              label="Phone number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="9876543210"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              required
              maxLength={10}
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

            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Sending code…" : "Continue"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} noValidate className="space-y-5">
            <div className="mb-2">
              <Input
                id="otp"
                name="otp"
                label="Verification code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                value={formData.otp}
                onChange={handleChange}
                error={errors.otp}
                required
              />
              
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || isSubmitting}
                  className={`text-sm font-medium transition ${
                    resendTimer > 0 || isSubmitting
                      ? `${theme.text.muted} cursor-not-allowed`
                      : theme.text.link
                  }`}
                >
                  {resendTimer > 0 
                    ? `Resend code in ${resendTimer}s` 
                    : "Resend code"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className={`text-sm font-medium ${theme.text.link} transition`}
                >
                  Edit phone number
                </button>
              </div>
            </div>

            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Verifying…" : "Verify & create account"}
            </Button>
          </form>
        )}

        <div className="flex items-center gap-4 my-8">
          <div className={`h-px flex-1 ${theme.divider}`} />
          <span className={`text-sm ${theme.text.muted}`}>OR</span>
          <div className={`h-px flex-1 ${theme.divider}`} />
        </div>

        <Button variant="secondary" type="button" onClick={ ()=> navigate("/role")}>
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
          Already have an account?{" "}
          <button
            type="button"
            onClick={()=> navigate("/login")}
            className={`font-medium ${theme.text.link} transition`}
          >
            Log in
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

export default SignUp;