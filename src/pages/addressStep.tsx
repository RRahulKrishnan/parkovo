import { useState } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import Input from "../components/input";
import Button from "../components/button";
import { theme } from "../theme/theme";
import type { AddressData } from "../types/listing";

interface AddressStepProps {
  data: AddressData;
  onNext: (data: AddressData) => void;
}

interface AddressErrors {
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

const POSTAL_CODE_PATTERN = /^[0-9]{6}$/;

function validate(data: AddressData): AddressErrors {
  // Once we have coordinates from geolocation the backend can reverse
  // geocode, so we don't force the manual fields in that case.
  if (data.useCurrentLocation && data.latitude && data.longitude) return {};

  const errors: AddressErrors = {};
  if (!data.line1.trim()) errors.line1 = "Enter the street address";
  if (!data.city.trim()) errors.city = "Enter the city";
  if (!data.state.trim()) errors.state = "Enter the state";
  if (!data.postalCode.trim()) {
    errors.postalCode = "Enter the postal code";
  } else if (!POSTAL_CODE_PATTERN.test(data.postalCode)) {
    errors.postalCode = "Enter a valid 6-digit postal code";
  }
  return errors;
}

function AddressStep({ data, onNext }: AddressStepProps) {
  const [formData, setFormData] = useState<AddressData>(data);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("Location access isn't available on this device.");
      return;
    }

    setLocationError(null);
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // TODO: reverse geocode lat/lng into a human-readable address
        // const address = await api.reverseGeocode(latitude, longitude);
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          useCurrentLocation: true,
          latitude,
          longitude,
        }));
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location access was denied. You can enter the address manually instead."
            : "Couldn't get your location. Try again or enter the address manually."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const switchToManualEntry = () => {
    setFormData((prev) => ({
      ...prev,
      useCurrentLocation: false,
      latitude: undefined,
      longitude: undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onNext(formData);
  };

  const usingDetectedLocation = formData.useCurrentLocation && Boolean(formData.latitude);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${theme.text.primary}`}>
          Where's the spot?
        </h2>
        <p className={`mt-1 text-sm ${theme.text.secondary}`}>
          Use your current location or enter the address manually.
        </p>
      </div>

      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isLocating}
        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
          usingDetectedLocation
            ? "border-blue-600 bg-blue-50"
            : `${theme.border.default} hover:bg-slate-50`
        }`}
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <LocateFixed className="h-4 w-4 text-blue-600" />
          )}
        </span>
        <span>
          <span className={`block text-sm font-semibold ${theme.text.primary}`}>
            {usingDetectedLocation ? "Current location detected" : "Use current location"}
          </span>
          <span className={`block text-xs ${theme.text.muted}`}>
            {usingDetectedLocation
              ? `${formData.latitude?.toFixed(5)}, ${formData.longitude?.toFixed(5)}`
              : isLocating
                ? "Detecting…"
                : "We'll ask for location access"}
          </span>
        </span>
      </button>

      {locationError && (
        <p role="alert" className={`text-xs ${theme.text.error}`}>
          {locationError}
        </p>
      )}

      {usingDetectedLocation ? (
        <button
          type="button"
          onClick={switchToManualEntry}
          className={`text-sm font-medium ${theme.text.link}`}
        >
          Enter address manually instead
        </button>
      ) : (
        <div className="space-y-5">
          <Input
            id="line1"
            name="line1"
            label="Street address"
            type="text"
            autoComplete="address-line1"
            placeholder="Flat / House no., building, street"
            value={formData.line1}
            onChange={handleChange}
            error={errors.line1}
            required
          />

          <Input
            id="line2"
            name="line2"
            label="Landmark (optional)"
            type="text"
            autoComplete="address-line2"
            placeholder="Nearby landmark"
            value={formData.line2}
            onChange={handleChange}
          />

          <Input
            id="city"
            name="city"
            label="City"
            type="text"
            autoComplete="address-level2"
            placeholder="Bengaluru"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            required
          />

          <Input
            id="state"
            name="state"
            label="State"
            type="text"
            autoComplete="address-level1"
            placeholder="Karnataka"
            value={formData.state}
            onChange={handleChange}
            error={errors.state}
            required
          />

          <Input
            id="postalCode"
            name="postalCode"
            label="Postal code"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="560001"
            value={formData.postalCode}
            onChange={handleChange}
            error={errors.postalCode}
            required
            maxLength={6}
          />
        </div>
      )}

      <Button type="submit">Continue</Button>
    </form>
  );
}

export default AddressStep;