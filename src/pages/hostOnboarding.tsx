import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { theme } from "../theme/theme";
import ProgressBar from "../components/progressBar";
import AddressStep from "./onboarding-steps/addressStep";
import PhotosStep from "./onboarding-steps/photosStep";
import AboutStep from "./onboarding-steps/aboutStep";
import PricingStep from "./onboarding-steps/pricingStep";
import AmenitiesStep from "./onboarding-steps/amenitiesStep";
import AvailabilityStep from "./onboarding-steps/availabilityStep";
import { EMPTY_LISTING_FORM, LISTING_STEPS } from "../types/listing";
import type {
  AboutData,
  AddressData,
  AmenitiesData,
  AvailabilityData,
  ListingFormData,
  PhotosData,
  PricingData,
} from "../types/listing";
import { getFirebaseAuth } from "../firebase/config";
import { getListing, createListing, updateListing } from "../firebase/listings";

const TOTAL_STEPS = LISTING_STEPS.length;

function ListingFlow() {
  // Present (e.g. /host-onboarding/:id) when editing an existing listing;
  // absent (/host-onboarding) for the normal creation flow.
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>(EMPTY_LISTING_FORM);
  const [isLoadingExisting, setIsLoadingExisting] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Edit mode: seed the form with the existing listing's data instead of
  // starting empty.
  useEffect(() => {
    if (!id) return;
    getListing(id)
      .then((existing) => {
        if (existing) {
          setFormData(existing.listing);
        }
      })
      .catch((err) => {
        console.error("Failed to load listing:", err);
        setSubmitError("Couldn't load that listing. Please try again.");
      })
      .finally(() => setIsLoadingExisting(false));
  }, [id]);

  const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleAddressNext = (address: AddressData) => {
    setFormData((prev) => ({ ...prev, address }));
    setStep(2);
  };

  const handlePhotosNext = (photos: PhotosData) => {
    setFormData((prev) => ({ ...prev, photos }));
    setStep(3);
  };

  const handleAboutNext = (about: AboutData) => {
    setFormData((prev) => ({ ...prev, about }));
    setStep(4);
  };

  const handlePricingNext = (pricing: PricingData) => {
    setFormData((prev) => ({ ...prev, pricing }));
    setStep(5);
  };

  const handleAmenitiesNext = (amenities: AmenitiesData) => {
    setFormData((prev) => ({ ...prev, amenities }));
    setStep(6);
  };

  const handleAvailabilitySubmit = async (availability: AvailabilityData) => {
    const finalData: ListingFormData = { ...formData, availability };
    setFormData(finalData);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) {
        throw new Error("You need to be signed in to publish a listing.");
      }

      // Photos aren't persisted yet — they live in Firebase Storage, not
      // this document, and that upload flow isn't wired in. finalData.photos
      // is intentionally not sent here.
      if (isEditMode && id) {
        await updateListing(id, finalData);
      } else {
        await createListing(user.uid, finalData);
      }

      navigate("/hostings");
    } catch (err: unknown) {
      console.error("Listing submit failed:", err);
      const message =
        err instanceof Error
          ? err.message
          : `Couldn't ${isEditMode ? "save" : "publish"} your listing. Please try again.`;
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingExisting) {
    return (
      <main className={`flex min-h-screen items-center justify-center ${theme.surface.page}`}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </main>
    );
  }

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
            {isEditMode ? "Edit your parking spot" : "List your parking spot"}
          </span>
        </div>

        <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} stepLabels={LISTING_STEPS} />
      </header>

      <section className="flex-1 px-6 pb-8">
        {submitError && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        {step === 1 && <AddressStep data={formData.address} onNext={handleAddressNext} />}

        {step === 2 && (
          <PhotosStep data={formData.photos} onNext={handlePhotosNext} onBack={goBack} />
        )}

        {step === 3 && (
          <AboutStep data={formData.about} onNext={handleAboutNext} onBack={goBack} />
        )}

        {step === 4 && (
          <PricingStep data={formData.pricing} onNext={handlePricingNext} onBack={goBack} />
        )}

        {step === 5 && (
          <AmenitiesStep data={formData.amenities} onNext={handleAmenitiesNext} onBack={goBack} />
        )}

        {step === 6 && (
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