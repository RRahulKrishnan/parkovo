import type { AmenityId, SpotSize } from "../types/listing";
import type { RentalPricing } from "../types/search";

export interface Hosting {
  id: string;
  title: string;
  description: string;
  address: string;
  pricing: RentalPricing;
  amenities: AmenityId[];
  spotSize: SpotSize;
  status: "active" | "paused";
  bookingsThisMonth: number;
}

// TODO: replace with a real Supabase query once the `listings` table
// exists, e.g.
// const { data } = await supabase.from("listings").select("*").eq("host_id", user.id);
export const MOCK_HOSTINGS: Hosting[] = [
  {
    id: "1",
    title: "Private driveway, Koramangala",
    description:
      "Secure, gated driveway space with room for one sedan or hatchback. Well-lit at night, and just a short walk from the main road.",
    address: "80 Feet Rd, Koramangala, Bengaluru",
    pricing: { hourly: 35, daily: 200 },
    amenities: ["gated_community", "well_lit"],
    spotSize: "sedan",
    status: "active",
    bookingsThisMonth: 6,
  },
];