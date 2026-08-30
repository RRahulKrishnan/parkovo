import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { theme } from "../theme/theme";
import ProgressBar from "../components/progressBar";
import AddressStep from "./onboarding-steps/addressStep";
import PhotosStep from "./onboarding-steps/photosStep";
import AmenitiesStep from "./onboarding-steps/amenitiesStep";
import AvailabilityStep from "./onboarding-steps/availabilityStep";
import {
  EMPTY_LISTING_FORM,
  LISTING_STEPS,
} from "../types/listing";
import type {
  AddressData,
  AmenitiesData,
  AvailabilityData,
  ListingFormData,
  PhotosData,
} from "../types/listing";

const TOTAL_STEPS = LISTING_STEPS.length;

function ListingFlow() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>(EMPTY_LISTING_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleAddressNext = (address: AddressData) => {
    setFormData((prev) => ({ ...prev, address }));
    setStep(2);
  };

  const handlePhotosNext = (photos: PhotosData) => {
    setFormData((prev) => ({ ...prev, photos }));
    setStep(3);
  };

  const handleAmenitiesNext = (amenities: AmenitiesData) => {
    setFormData((prev) => ({ ...prev, amenities }));
    setStep(4);
  };

  const handleAvailabilitySubmit = async (availability: AvailabilityData) => {
    const finalData: ListingFormData = { ...formData, availability };
    setFormData(finalData);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // TODO: submit the listing
      // const payload = new FormData();
      // payload.append("address", JSON.stringify(finalData.address));
      // finalData.photos.files.forEach((file) => payload.append("photos", file));
      // payload.append("amenities", JSON.stringify(finalData.amenities));
      // payload.append("availability", JSON.stringify(finalData.availability));
      // await api.createListing(payload);
      await new Promise((resolve) => setTimeout(resolve, 900));

      console.log("Listing published successfully!", finalData);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Couldn't publish your listing. Please try again.";
      console.error("Listing submit failed:", err);
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`min-h-screen flex flex-col ${theme.surface.page} ${theme.text.primary}`}>
      <header className="px-6 pt-8 pb-4">
        <div className="mb-5 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              aria-label="Go to previous step"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <span className={`text-sm font-semibold ${theme.text.secondary}`}>
            List your parking spot
          </span>
        </div>

        <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} stepLabels={LISTING_STEPS} />
      </header>

      <section className="flex-1 px-6 pb-8">
        {submitError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {submitError}
          </div>
        )}

        {step === 1 && <AddressStep data={formData.address} onNext={handleAddressNext} />}

        {step === 2 && (
          <PhotosStep data={formData.photos} onNext={handlePhotosNext} onBack={goBack} />
        )}

        {step === 3 && (
          <AmenitiesStep data={formData.amenities} onNext={handleAmenitiesNext} onBack={goBack} />
        )}

        {step === 4 && (
          <AvailabilityStep
            data={formData.availability}
            onSubmit={handleAvailabilitySubmit}
            onBack={goBack}
            isSubmitting={isSubmitting}
          />
        )}
      </section>
    </main>
  );
}

export default ListingFlow;