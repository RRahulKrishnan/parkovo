import { EMPTY_LISTING_FORM } from "../types/listing";
import type { ListingFormData } from "../types/listing";

export interface Hosting {
  id: string;
  status: "active" | "paused";
  bookingsThisMonth: number;
  listing: ListingFormData;
}

// TODO: replace with a real Supabase query once the `listings` table
// exists, e.g.
// const { data } = await supabase.from("listings").select("*").eq("host_id", user.id);
export const MOCK_HOSTINGS: Hosting[] = [
  {
    id: "1",
    status: "active",
    bookingsThisMonth: 6,
    listing: {
      ...EMPTY_LISTING_FORM,
      address: {
        useCurrentLocation: false,
        line1: "80 Feet Rd",
        line2: "",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560034",
      },
      about: {
        description:
          "Secure, gated driveway space with room for one sedan or hatchback. Well-lit at night, and just a short walk from the main road.",
        howToGetThere: "",
      },
      pricing: {
        hourly: 35,
        daily: 200,
        offersDaily: true,
        offersWeekly: false,
        offersMonthly: false,
      },
      amenities: {
        amenities: ["gated_community", "well_lit"],
        spotSize: "sedan",
      },
    },
  },
];

// List views (hostings.tsx) shouldn't need to know the shape of
// ListingFormData just to show a name — since there's no dedicated
// "title" field in the form, derive one from the street address.
export function hostingTitle(hosting: Hosting): string {
  return hosting.listing.address.line1 || "Untitled listing";
}

export function hostingSubtitle(hosting: Hosting): string {
  const { city, state } = hosting.listing.address;
  return [city, state].filter(Boolean).join(", ");
}