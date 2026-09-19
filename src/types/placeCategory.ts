export type PlaceCategory = "metro" | "mall" | "events" | "airport" | "hospital";

export const PLACE_CATEGORY_OPTIONS: {
  value: PlaceCategory;
  /** Shown to hosts when tagging a listing. */
  label: string;
  /** Carousel copy shown to drivers. */
  promoTitle: string;
  promoSubtitle: string;
}[] = [
  {
    value: "metro",
    label: "Near a metro station",
    promoTitle: "Parking near metro stations",
    promoSubtitle: "Save time on your daily commute",
  },
  {
    value: "mall",
    label: "Near a mall",
    promoTitle: "Parking near malls",
    promoSubtitle: "Shop longer, park closer",
  },
  {
    value: "events",
    label: "Near an event venue",
    promoTitle: "Parking near event venues",
    promoSubtitle: "Walk to the gate, skip the crush",
  },
  {
    value: "airport",
    label: "Near the airport",
    promoTitle: "Parking near the airport",
    promoSubtitle: "Park first, fly stress-free",
  },
  {
    value: "hospital",
    label: "Near a hospital",
    promoTitle: "Parking near hospitals",
    promoSubtitle: "Close by when every minute counts",
  },
];

// Fallback for listings a host hasn't explicitly tagged: guess the place
// from words in their own title / description / directions.
const PLACE_KEYWORDS: Record<PlaceCategory, RegExp> = {
  metro: /\bmetro\b/i,
  mall: /\bmalls?\b/i,
  events: /\b(events?|stadium|arena|concert|exhibition|convention)\b/i,
  airport: /\bairport\b/i,
  hospital: /\bhospitals?\b/i,
};

export function inferPlaceCategories(text: string): PlaceCategory[] {
  return (Object.keys(PLACE_KEYWORDS) as PlaceCategory[]).filter((category) =>
    PLACE_KEYWORDS[category].test(text)
  );
}