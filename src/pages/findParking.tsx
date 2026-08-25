import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, SearchX } from "lucide-react";
import { theme } from "../theme/theme";
import ParkingSpotCard from "../components/parkingSpotCard";
import FilterSheet from "../components/filterSheet";
import type { ParkingSpotSummary } from "../types/search";
import { countActiveFilters, DEFAULT_FILTERS } from "../types/search";
import type { SearchFilters } from "../types/search"

// TODO: replace with a real API call, passing the user's coordinates and
// `filters` (amenities, radiusKm, price range, durationHours) as query params.
// const spots = await api.searchParkingSpots({ lat, lng, ...filters });
const MOCK_SPOTS: ParkingSpotSummary[] = [
  {
    id: "1",
    title: "Covered spot near MG Road",
    address: "MG Road, Bengaluru",
    distanceKm: 0.8,
    pricePerHour: 40,
    imageUrl: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=200&h=200&fit=crop",
    amenities: ["covered", "cctv", "well_lit"],
    spotSize: "sedan",
    rating: 4.8,
  },
  {
    id: "2",
    title: "Gated community driveway",
    address: "Indiranagar, Bengaluru",
    distanceKm: 1.4,
    pricePerHour: 30,
    imageUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200&h=200&fit=crop",
    amenities: ["gated_community", "security_guard", "24_7_access"],
    spotSize: "suv",
    rating: 4.6,
  },
  {
    id: "3",
    title: "Open spot with EV charging",
    address: "Koramangala, Bengaluru",
    distanceKm: 2.6,
    pricePerHour: 50,
    imageUrl: "https://images.unsplash.com/photo-1621977544450-4b6b0ce6c7ea?w=200&h=200&fit=crop",
    amenities: ["ev_charging", "cctv"],
    spotSize: "hatchback",
    rating: 4.9,
  },
  {
    id: "4",
    title: "Basement parking, wide entry",
    address: "HSR Layout, Bengaluru",
    distanceKm: 3.9,
    pricePerHour: 25,
    imageUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200&h=200&fit=crop",
    amenities: ["covered", "wide_entry"],
    spotSize: "compact",
    rating: 4.3,
  },
];

function FindParking() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const filteredSpots = useMemo(() => {
    return MOCK_SPOTS.filter((spot) => {
      if (spot.distanceKm > filters.radiusKm) return false;
      if (spot.pricePerHour < filters.minPricePerHour) return false;
      if (spot.pricePerHour > filters.maxPricePerHour) return false;
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

  return (
    <main className={`min-h-screen flex flex-col ${theme.surface.page} ${theme.text.primary}`}>
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Find parking</h1>
        <p className={`mt-1 text-sm ${theme.text.secondary}`}>
          {filteredSpots.length} spot{filteredSpots.length === 1 ? "" : "s"} within{" "}
          {filters.radiusKm} km
        </p>

        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className={`mt-4 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${theme.border.default} hover:bg-slate-50`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </header>

      <section className="flex-1 px-6 pb-8">
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
    </main>
  );
}

export default FindParking;