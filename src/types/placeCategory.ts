
export type PlaceCategory =
  | "metro"
  | "mall"
  | "events"
  | "airport"
  | "food_drink";

export const PLACE_CATEGORY_OPTIONS: {
  value: PlaceCategory;
  /** Shown to hosts when tagging a listing. */
  label: string;
  /** Discovery copy shown to drivers. */
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
    promoTitle: "Parking near events",
    promoSubtitle: "Walk to the gate, skip the lines",
  },
  {
    value: "airport",
    label: "Near the airport",
    promoTitle: "Parking near airports",
    promoSubtitle: "Park first, fly stress-free",
  },
  {
    value: "food_drink",
    label: "Near cafes, restaurants, bars & breweries",
    promoTitle: "Parking near hangouts",
    promoSubtitle: "Park close to your next favourite spot",
  },
];

// Fallback for listings a host hasn't explicitly tagged.
const PLACE_KEYWORDS: Record<PlaceCategory, RegExp> = {
  metro: /\bmetro\b/i,

  mall: /\bmalls?\b/i,

  events:
    /\b(events?|stadium|arena|concert|exhibition|convention)\b/i,

  airport: /\bairport\b/i,

  food_drink:
    /\b(cafes?|coffee shops?|restaurants?|dhabas?|bars?|pubs?|brewer(?:y|ies)|brewpubs?|sushi|bistros?|diners?|lounges?|fine dining|nightclubs?|taverns?)\b/i,
};

export function inferPlaceCategories(text: string): PlaceCategory[] {
  return (
    Object.keys(PLACE_KEYWORDS) as PlaceCategory[]
  ).filter((category) => PLACE_KEYWORDS[category].test(text));
}
