import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SlidersHorizontal,
  SearchX,
  MapPin,
  Loader2,
  X,
} from "lucide-react";

import { theme } from "../theme/theme";
import ParkingSpotCard from "../components/parkingSpotCard";
import PromoCarousel, {
  type CategorySlide,
} from "../components/promoCarousel";
import FilterSheet from "../components/filterSheet";
import LocationPicker, {
  type LocationResult,
} from "../components/locationPicker";
import { listParkingSpots } from "../firebase/listings";
import {
  PLACE_CATEGORY_OPTIONS,
  type PlaceCategory,
} from "../types/placeCategory";
import type {
  ParkingSpotSummary,
  SearchFilters,
} from "../types/search";
import {
  countActiveFilters,
  DEFAULT_FILTERS,
} from "../types/search";

function FindParking() {
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] =
    useState<SearchFilters>(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] =
    useState(false);
  const [locationLabel, setLocationLabel] =
    useState("Search location");
  const [spots, setSpots] =
    useState<ParkingSpotSummary[] | null>(null);
  const [loadError, setLoadError] =
    useState<string | null>(null);
  // Set by tapping a carousel slide; kept out of SearchFilters so the
  // filter sheet doesn't need to know about it.
  const [category, setCategory] =
    useState<PlaceCategory | null>(null);

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters]
  );

  useEffect(() => {
    let mounted = true;

    listParkingSpots()
      .then((listings) => {
        if (mounted) {
          setSpots(listings);
        }
      })
      .catch((error) => {
        console.error("Failed to load parking spots:", error);

        if (mounted) {
          setLoadError(
            "Couldn't load parking spots. Please try again."
          );
          setSpots([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredSpots = useMemo(
    () =>
      (spots ?? []).filter(
        (spot) =>
          spot.distanceKm <= filters.radiusKm &&
          spot.pricing.hourly >= filters.minPricePerHour &&
          spot.pricing.hourly <= filters.maxPricePerHour &&
          filters.statuses.includes(spot.status) &&
          (filters.amenities.length === 0 ||
            filters.amenities.every((id) =>
              spot.amenities.includes(id)
            ))
      ),
    [spots, filters]
  );

  // One slide per place category that has at least one matching spot, so
  // a slide never leads to an empty list. Counts respect active filters.
  const slides = useMemo<CategorySlide[]>(
    () =>
      PLACE_CATEGORY_OPTIONS.map((option) => ({
        category: option.value,
        title: option.promoTitle,
        subtitle: option.promoSubtitle,
        spotCount: filteredSpots.filter((spot) =>
          spot.nearbyPlaces?.includes(option.value)
        ).length,
      })).filter((slide) => slide.spotCount > 0),
    [filteredSpots]
  );

  const visibleSpots = useMemo(
    () =>
      category
        ? filteredSpots.filter((spot) =>
            spot.nearbyPlaces?.includes(category)
          )
        : filteredSpots,
    [filteredSpots, category]
  );

  const activeCategory = PLACE_CATEGORY_OPTIONS.find(
    (option) => option.value === category
  );

  const handleSlideClick = (slide: CategorySlide) => {
    setCategory(slide.category);
    // Wait for the list to re-render, then bring it into view.
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    );
  };

  const confirmLocation = (result: LocationResult) => {
    setLocationLabel(result.label);
    setIsLocationPickerOpen(false);
  };

  return (
    <main
      className={`min-h-screen flex flex-col ${theme.surface.page} ${theme.text.primary}`}
    >
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Find parking
        </h1>

        <div className="mt-4 flex items-center gap-2">
          {/* Location */}
          <button
            type="button"
            onClick={() => setIsLocationPickerOpen(true)}
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${theme.border.default}`}
          >
            <MapPin className="h-4 w-4 text-blue-600" />

            <span className="truncate">
              {locationLabel}
            </span>
          </button>

          {/* Filters */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${theme.border.default}`}
          >
            <SlidersHorizontal className="h-4 w-4" />

            Filters

            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 px-4 pb-28">
        {/* Browse by place (renders nothing until a spot is tagged) */}
        <PromoCarousel
          className="mb-4"
          slides={slides}
          onSlideClick={handleSlideClick}
        />

        {/* Error */}
        {loadError && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
          >
            {loadError}
          </p>
        )}

        <div ref={resultsRef} className="scroll-mt-4">
          {/* Active category */}
          {activeCategory && (
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="min-w-0 truncate text-base font-bold">
                {activeCategory.promoTitle}
              </h2>

              <button
                type="button"
                onClick={() => setCategory(null)}
                className={`flex flex-shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold hover:bg-slate-50 ${theme.border.default}`}
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          )}

          {/* Loading */}
          {spots === null ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : visibleSpots.length ? (
            /* Parking spots */
            <div className="space-y-4">
              {visibleSpots.map((spot) => (
                <ParkingSpotCard
                  key={spot.id}
                  spot={spot}
                  onClick={() =>
                    navigate(`/find-parking/${spot.id}`)
                  }
                />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <SearchX
                className={`h-8 w-8 ${theme.text.muted}`}
              />

              <p className="text-sm font-semibold">
                No spots match yet
              </p>

              <p
                className={`text-xs ${theme.text.muted}`}
              >
                Try widening your radius or loosening a filter
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Filter sheet */}
      <FilterSheet
        isOpen={isFilterOpen}
        filters={filters}
        onClose={() => setIsFilterOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setIsFilterOpen(false);
        }}
      />

      {/* Location picker */}
      {isLocationPickerOpen && (
        <LocationPicker
          onClose={() =>
            setIsLocationPickerOpen(false)
          }
          onConfirm={confirmLocation}
        />
      )}
    </main>
  );
}

export default FindParking;