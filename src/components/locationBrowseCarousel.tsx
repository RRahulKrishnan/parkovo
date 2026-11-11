
import {
  PLACE_CATEGORY_OPTIONS,
  type PlaceCategory,
} from "../types/placeCategory";

import type { ParkingSpotSummary } from "../types/search";

import metroParkingImage from "../../assets/CARO/parkngo_metro_parking.png";
import mallParkingImage from "../../assets/CARO/parkngo_mall_parking.png";
import luxeValetImage from "../../assets/CARO/parkngo_luxe_valet.png";
import airportParkingImage from "../../assets/CARO/parkngo_airport_parking.png";
import foodDrinksImage from "../../assets/CARO/parkngo_food_drinks.png";

interface LocationBrowseCarouselProps {
  spots: ParkingSpotSummary[];
  onSelect: (category: PlaceCategory) => void;
  className?: string;
}

const FEATURED_CATEGORIES: PlaceCategory[] = [
  "metro",
  "mall",
  "events",
  "airport",
  "food_drink",
];

const CATEGORY_IMAGES: Partial<Record<PlaceCategory, string>> = {
  metro: metroParkingImage,
  mall: mallParkingImage,
  events: luxeValetImage,
  airport: airportParkingImage,
  food_drink: foodDrinksImage,
};

function LocationBrowseCarousel({
  spots,
  onSelect,
  className,
}: LocationBrowseCarouselProps) {
  const categories = FEATURED_CATEGORIES.map((category) => {
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

  const [metro, ...secondaryCategories] = categories;

  return (
    <div className={`w-full space-y-3 ${className ?? ""}`}>
      {/* Metro featured banner */}
      <button
        type="button"
        onClick={() => onSelect(metro.category)}
        className="
          group relative w-full overflow-hidden
          rounded-2xl text-left
          aspect-[16/5] min-h-[110px]
          bg-gray-900
          active:scale-[0.99]
          transition-transform duration-200
        "
      >
        <img
          src={metro.image}
          alt={metro.title}
          className="
            absolute inset-0 h-full w-full
            object-cover
            transition-transform duration-300
            group-hover:scale-105
          "
        />

        <div className="
          absolute inset-0
          bg-gradient-to-r
          from-black/75 via-black/30 to-transparent
        " />

        <div className="
          absolute inset-0 flex flex-col
          justify-center items-start
          p-4 sm:p-5
        ">
          <span className="text-white text-lg sm:text-xl font-bold">
            {metro.title}
          </span>

          <span className="mt-1 text-white/85 text-xs sm:text-sm">
            {metro.subtitle}
          </span>
        </div>
      </button>

      {/* Mall, Events, Airport and Food & Drinks */}
      <div className="grid grid-cols-2 gap-3">
        {secondaryCategories.map((item) => (
          <button
            key={item.category}
            type="button"
            onClick={() => onSelect(item.category)}
            className="
              group min-w-0 overflow-hidden
              rounded-xl border border-gray-200
              bg-white text-left
              active:scale-[0.98]
              transition-all duration-200
              hover:border-blue-300
            "
          >
            <div className="aspect-[2/1] overflow-hidden bg-gray-100">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="
                  h-full w-full object-cover
                  transition-transform duration-300
                  group-hover:scale-105
                "
              />
            </div>

            <div className="p-2.5">
              <p className="text-sm font-semibold text-gray-900">
                {item.title}
              </p>

              <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                {item.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LocationBrowseCarousel;
