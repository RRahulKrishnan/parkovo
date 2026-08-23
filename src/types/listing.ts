// Shared types for the "list your parking spot" flow.
// Keeping these in one file means every step + component agrees on shape.

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
  // File objects live in memory only for the duration of the flow.
  // previewUrls are the object URLs generated for each file, kept in
  // lockstep with `files` by index.
  files: File[];
  previewUrls: string[];
}

export interface AmenitiesData {
  amenities: AmenityId[];
  spotSize: SpotSize | "";
}

export interface AvailabilityData {
  isOngoing: boolean; // host indefinitely, no fixed end date
  startDate: string; // ISO date, e.g. "2026-08-20"
  endDate: string; // ISO date, ignored when isOngoing is true
}

export interface ListingFormData {
  address: AddressData;
  photos: PhotosData;
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

export const LISTING_STEPS = ["Address", "Photos", "Amenities", "Availability"] as const;
export const MIN_PHOTOS_REQUIRED = 4;