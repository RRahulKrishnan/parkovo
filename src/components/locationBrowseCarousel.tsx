import PromoCarousel, { type CategorySlide } from "./promoCarousel";

import {
  PLACE_CATEGORY_OPTIONS,
  type PlaceCategory,
} from "../types/placeCategory";

import type { ParkingSpotSummary } from "../types/search";

import metroParkingImage from "../../assets/CARO/parkngo_metro_parking.png";
import mallParkingImage from "../../assets/CARO/parkngo_mall_parking.png";
import luxeValetImage from "../../assets/CARO/parkngo_luxe_valet.png";

interface LocationBrowseCarouselProps {
  spots: ParkingSpotSummary[];
  onSelect: (category: PlaceCategory) => void;
  className?: string;
}

const FEATURED_CATEGORIES: PlaceCategory[] = [
  "metro",
  "mall",
  "events",
];

const CATEGORY_IMAGES: Partial<Record<PlaceCategory, string>> = {
  metro: metroParkingImage,
  mall: mallParkingImage,
  events: luxeValetImage,
};

/** Persistent, location-led discovery entry points for the Explore screen. */
function LocationBrowseCarousel({
  spots,
  onSelect,
  className,
}: LocationBrowseCarouselProps) {
  const slides: CategorySlide[] = FEATURED_CATEGORIES.map((category) => {
    const option = PLACE_CATEGORY_OPTIONS.find(
      (item) => item.value === category
    );

    if (!option) {
      throw new Error(
        `Missing place category configuration: ${category}`
      );
    }

    return {
      category,
      title: option.promoTitle,
      subtitle: option.promoSubtitle,
      image: CATEGORY_IMAGES[category],
      spotCount: spots.filter((spot) =>
        spot.nearbyPlaces?.includes(category)
      ).length,
    };
  });

  return (
    <PromoCarousel
      className={className}
      slides={slides}
      onSlideClick={(slide) => onSelect(slide.category)}
    />
  );
}

export default LocationBrowseCarousel;