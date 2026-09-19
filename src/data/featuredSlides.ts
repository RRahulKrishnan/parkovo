import type { AmenityId } from "../types/listing";
import type { ParkingSpotSummary } from "../types/search";
import type { PromoSlide } from "../types/promo";

// Listings have no category field (metro / mall / valet), so slides are
// themed by the amenities hosts actually set. Order = slide order.
const FEATURES: { amenity: AmenityId; eyebrow: string; title: string }[] = [
  { amenity: "ev_charging", eyebrow: "EV charging", title: "Charge while you park" },
  { amenity: "security_guard", eyebrow: "Guarded parking", title: "Park with peace of mind" },
  { amenity: "covered", eyebrow: "Covered parking", title: "Keep your car out of the sun and rain" },
  { amenity: "24_7_access", eyebrow: "24/7 access", title: "Park at any hour" },
  { amenity: "cctv", eyebrow: "CCTV monitored", title: "Watched around the clock" },
];

const MIN_SLIDES = 3;

// Most amenities first, then cheapest.
const byBest = (a: ParkingSpotSummary, b: ParkingSpotSummary) =>
  b.amenities.length - a.amenities.length || a.pricing.hourly - b.pricing.hourly;

function toSlide(spot: ParkingSpotSummary, eyebrow: string, title: string): PromoSlide {
  return {
    spotId: spot.id,
    eyebrow,
    title,
    subtitle: spot.title,
    imageUrl: spot.imageUrl,
    priceLabel: `₹${spot.pricing.hourly} / hour`,
  };
}

export function buildFeaturedSlides(spots: ParkingSpotSummary[], max = 4): PromoSlide[] {
  const bookable = spots.filter((spot) => spot.status !== "booked");
  const used = new Set<string>();
  const slides: PromoSlide[] = [];

  for (const feature of FEATURES) {
    if (slides.length >= max) break;
    const best = bookable
      .filter((spot) => !used.has(spot.id) && spot.amenities.includes(feature.amenity))
      .sort(byBest)[0];
    if (!best) continue;
    used.add(best.id);
    slides.push(toSlide(best, feature.eyebrow, feature.title));
  }

  // Too few amenity matches: pad with the best remaining spots.
  for (const spot of [...bookable].sort(byBest)) {
    if (slides.length >= Math.min(max, MIN_SLIDES)) break;
    if (used.has(spot.id)) continue;
    used.add(spot.id);
    slides.push(toSlide(spot, "Top pick", "Popular with drivers"));
  }

  return slides;
}