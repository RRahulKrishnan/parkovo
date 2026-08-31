import type { RentalPricing } from "./search";

export type SpotSize = "hatchback" | "compact" | "sedan" | "suv" | "truck";

export const SPOT_SIZE_OPTIONS: { value: SpotSize; label: string; helper: string }[] = [
  { value: "hatchback", label: "Hatchback", helper: "Small cars, e.g. Swift, i10" },
  { value: "compact", label: "Compact sedan", helper: "e.g. Baleno, Honda City" },
  { value: "sedan", label: "Full-size sedan", helper: "e.g. Camry, Skoda Superb" },
  { value: "suv", label: "Full-size SUV", helper: "e.g. Fortuner, Scorpio" },
  { value: "truck", label: "Truck / large vehicle", helper: "Pickups, vans" },
];

export type AmenityId =
  | "covered"
  | "cctv"
  | "security_guard"
  | "gated_community"
  | "ev_charging"
  | "well_lit"
  | "wide_entry"
  | "24_7_access";

export const AMENITY_OPTIONS: { value: AmenityId; label: string }[] = [
  { value: "covered", label: "Covered parking" },
  { value: "cctv", label: "CCTV surveillance" },
  { value: "security_guard", label: "Security guard" },
  { value: "gated_community", label: "Gated community" },
  { value: "ev_charging", label: "EV charging point" },
  { value: "well_lit", label: "Well-lit area" },
  { value: "wide_entry", label: "Wide entry (easy to maneuver)" },
  { value: "24_7_access", label: "24/7 access" },
];

export interface AddressData {
  useCurrentLocation: boolean;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface PhotosData {
  files: File[];
  previewUrls: string[];
}

// Maps 1:1 onto the "About this spot" / "How to get there" sections shown
// on the ad detail page — same field names, same copy, no translation layer.
export interface AboutData {
  description: string;
  howToGetThere: string;
}

// hourly is required, longer-term rates are opt-in per host.
export interface PricingData extends RentalPricing {
  offersDaily: boolean;
  offersWeekly: boolean;
  offersMonthly: boolean;
}

export interface AmenitiesData {
  amenities: AmenityId[];
  spotSize: SpotSize | "";
}

export interface AvailabilityData {
  isOngoing: boolean;
  startDate: string;
  endDate: string;
}

export interface ListingFormData {
  address: AddressData;
  photos: PhotosData;
  about: AboutData;
  pricing: PricingData;
  amenities: AmenitiesData;
  availability: AvailabilityData;
}

export const EMPTY_LISTING_FORM: ListingFormData = {
  address: {
    useCurrentLocation: false,
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
  },
  photos: {
    files: [],
    previewUrls: [],
  },
  about: {
    description: "",
    howToGetThere: "",
  },
  pricing: {
    hourly: 0,
    offersDaily: false,
    offersWeekly: false,
    offersMonthly: false,
  },
  amenities: {
    amenities: [],
    spotSize: "",
  },
  availability: {
    isOngoing: true,
    startDate: "",
    endDate: "",
  },
};

export const LISTING_STEPS = [
  "Address",
  "Photos",
  "About",
  "Pricing",
  "Amenities",
  "Availability",
] as const;
export const MIN_PHOTOS_REQUIRED = 4;