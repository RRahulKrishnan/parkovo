import { useState } from "react";
import Button from "../../components/button";
import { theme } from "../../theme/theme";
import type { PricingData } from "../../types/listing";

interface PricingStepProps {
  data: PricingData;
  onNext: (data: PricingData) => void;
  onBack: () => void;
}

interface PricingErrors {
  hourly?: string;
  daily?: string;
  weekly?: string;
  monthly?: string;
}

function toNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function PricingStep({ data, onNext, onBack }: PricingStepProps) {
  const [formData, setFormData] = useState<PricingData>(data);
  const [errors, setErrors] = useState<PricingErrors>({});

  const handleRateChange =
    (field: "hourly" | "daily" | "weekly" | "monthly") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [field]: digitsOnly === "" ? 0 : Number(digitsOnly) }));
      if (field in errors) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const toggleOffer = (field: "offersDaily" | "offersWeekly" | "offersMonthly") => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors: PricingErrors = {};

    if (!formData.hourly || formData.hourly <= 0) {
      validationErrors.hourly = "Set an hourly rate";
    }
    if (formData.offersDaily && (!formData.daily || formData.daily <= 0)) {
      validationErrors.daily = "Set a daily rate or turn this off";
    }
    if (formData.offersWeekly && (!formData.weekly || formData.weekly <= 0)) {
      validationErrors.weekly = "Set a weekly rate or turn this off";
    }
    if (formData.offersMonthly && (!formData.monthly || formData.monthly <= 0)) {
      validationErrors.monthly = "Set a monthly rate or turn this off";
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${theme.text.primary}`}>
          Set your price
        </h2>
        <p className={`mt-1 text-sm ${theme.text.secondary}`}>
          Hourly is required. Add daily, weekly, or monthly rates for longer stays.
        </p>
      </div>

      <RateInput
        label="Hourly rate"
        required
        value={formData.hourly}
        onChange={handleRateChange("hourly")}
        error={errors.hourly}
      />

      <RateToggleRow
        label="Daily rate"
        enabled={formData.offersDaily}
        onToggle={() => toggleOffer("offersDaily")}
        value={formData.daily}
        onChange={handleRateChange("daily")}
        error={errors.daily}
      />

      <RateToggleRow
        label="Weekly rate"
        enabled={formData.offersWeekly}
        onToggle={() => toggleOffer("offersWeekly")}
        value={formData.weekly}
        onChange={handleRateChange("weekly")}
        error={errors.weekly}
      />

      <RateToggleRow
        label="Monthly rate"
        enabled={formData.offersMonthly}
        onToggle={() => toggleOffer("offersMonthly")}
        value={formData.monthly}
        onChange={handleRateChange("monthly")}
        error={errors.monthly}
      />

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}

interface RateInputProps {
  label: string;
  value: number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

function RateInput({ label, value, onChange, error, required }: RateInputProps) {
  return (
    <div>
      <label className={`mb-1.5 block text-sm font-semibold ${theme.text.primary}`}>
        {label} {required && <span className={theme.text.error}>*</span>}
      </label>
      <div className="relative">
        <span className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium ${theme.text.muted}`}>
          ₹
        </span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={value || ""}
          onChange={onChange}
          className={`w-full rounded-lg border py-3 pl-8 pr-4 text-sm outline-none transition ${
            error
              ? `${theme.border.error} ${theme.ring.focusError}`
              : `${theme.border.default} ${theme.border.focus} ${theme.ring.focus}`
          } focus:ring-1`}
        />
      </div>
      {error && (
        <p role="alert" className={`mt-1 text-xs ${theme.text.error}`}>
          {error}
        </p>
      )}
    </div>
  );
}

interface RateToggleRowProps extends RateInputProps {
  enabled: boolean;
  onToggle: () => void;
}

function RateToggleRow({ label, enabled, onToggle, value, onChange, error }: RateToggleRowProps) {
  return (
    <div className={`rounded-xl border p-4 ${theme.border.default}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between"
      >
        <span className={`text-sm font-semibold ${theme.text.primary}`}>{label}</span>
        <span
          className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${
            enabled ? "bg-blue-600" : "bg-slate-200"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
              enabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </span>
      </button>

      {enabled && (
        <div className="mt-3">
          <RateInput label="" value={value} onChange={onChange} error={error} />
        </div>
      )}
    </div>
  );
}

export default PricingStep;