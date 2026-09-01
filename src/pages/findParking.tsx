import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, SearchX, MapPin } from "lucide-react";
import { theme } from "../theme/theme";
import ParkingSpotCard from "../components/parkingSpotCard";
import FilterSheet from "../components/filterSheet";
import LocationPicker, { type LocationResult } from "../components/locationPicker";
import type { ParkingSpotSummary } from "../types/search";
import { countActiveFilters, DEFAULT_FILTERS } from "../types/search";
import type { SearchFilters } from "../types/search";

// TODO: replace with a real API call, passing the user's coordinates and
// `filters` (amenities, radiusKm, price range, durationHours, statuses) as
// query params.
// const spots = await api.searchParkingSpots({ lat, lng, ...filters });
const MOCK_SPOTS: ParkingSpotSummary[] = [
  {
    id: "1",
    title: "Covered spot near MG Road",
    address: "MG Road, Bengaluru",
    distanceKm: 0.8,
    pricing: { hourly: 40, daily: 250, monthly: 4500 },
    imageUrl: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=200&h=200&fit=crop",
    amenities: ["covered", "cctv", "well_lit"],
    spotSize: "sedan",
    status: "available",
    rating: 4.8,
  },
  {
    id: "2",
    title: "Gated community driveway",
    address: "Indiranagar, Bengaluru",
    distanceKm: 1.4,
    pricing: { hourly: 30, daily: 180 },
    imageUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200&h=200&fit=crop",
    amenities: ["gated_community", "security_guard", "24_7_access"],
    spotSize: "suv",
    status: "available_soon",
    rating: 4.6,
  },
  {
    id: "3",
    title: "Open spot with EV charging",
    address: "Koramangala, Bengaluru",
    distanceKm: 2.6,
    pricing: { hourly: 50, daily: 320, weekly: 1800, monthly: 6000 },
    imageUrl: "https://images.unsplash.com/photo-1621977544450-4b6b0ce6c7ea?w=200&h=200&fit=crop",
    amenities: ["ev_charging", "cctv"],
    spotSize: "hatchback",
    status: "available",
    rating: 4.9,
  },
  {
    id: "4",
    title: "Basement parking, wide entry",
    address: "HSR Layout, Bengaluru",
    distanceKm: 3.9,
    pricing: { hourly: 25 },
    imageUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200&h=200&fit=crop",
    amenities: ["covered", "wide_entry"],
    spotSize: "compact",
    status: "booked",
    rating: 4.3,
  },
];

function FindParking() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Search location");
  // Not yet wired into the mock filtering below — MOCK_SPOTS uses static
  // distanceKm values. Once a real API call replaces the mock data, pass
  // these coordinates along so distance can be computed server-side.
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const filteredSpots = useMemo(() => {
    return MOCK_SPOTS.filter((spot) => {
      if (spot.distanceKm > filters.radiusKm) return false;
      if (spot.pricing.hourly < filters.minPricePerHour) return false;
      if (spot.pricing.hourly > filters.maxPricePerHour) return false;
      if (!filters.statuses.includes(spot.status)) return false;
      if (
        filters.amenities.length > 0 &&
        !filters.amenities.every((id) => spot.amenities.includes(id))
      )
        return false;
      return true;
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [filters]);

  const handleApplyFilters = (next: SearchFilters) => {
    setFilters(next);
    setIsFilterOpen(false);
  };

  const handleLocationConfirmed = (result: LocationResult) => {
    setLocationLabel(result.label);
    setCoordinates({ lat: result.lat, lng: result.lng });
    setIsLocationPickerOpen(false);
  };

  return (
    <main className={`min-h-screen flex flex-col ${theme.surface.page} ${theme.text.primary}`}>
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Find parking</h1>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLocationPickerOpen(true)}
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${theme.border.default} hover:bg-slate-50`}
          >
            <MapPin className="h-4 w-4 flex-shrink-0 text-blue-600" />
            <span className="truncate">{locationLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${theme.border.default} hover:bg-slate-50`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <section className="flex-1 px-4 pb-28">
        {filteredSpots.length > 0 ? (
          <div className="space-y-4">
            {filteredSpots.map((spot) => (
              <ParkingSpotCard
                key={spot.id}
                spot={spot}
                onClick={() => navigate(`/find-parking/${spot.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <SearchX className={`h-8 w-8 ${theme.text.muted}`} />
            <p className={`text-sm font-semibold ${theme.text.primary}`}>No spots match yet</p>
            <p className={`text-xs ${theme.text.muted}`}>
              Try widening your radius or loosening a filter
            </p>
          </div>
        )}
      </section>

      <FilterSheet
        isOpen={isFilterOpen}
        filters={filters}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilters}
      />

      {isLocationPickerOpen && (
        <LocationPicker
          initialCenter={coordinates ?? undefined}
          onClose={() => setIsLocationPickerOpen(false)}
          onConfirm={handleLocationConfirmed}
        />
      )}
    </main>
  );
}

export default FindParking;