import { MapPin, Star } from "lucide-react";
import { theme } from "../theme/theme";
import { AMENITY_OPTIONS } from "../types/listing";
import type { ParkingSpotSummary } from "../types/search";

interface ParkingSpotCardProps {
  spot: ParkingSpotSummary;
  onClick?: () => void;
}

function ParkingSpotCard({ spot, onClick }: ParkingSpotCardProps) {
  const amenityLabels = spot.amenities
    .map((id) => AMENITY_OPTIONS.find((option) => option.value === id)?.label)
    .filter(Boolean)
    .slice(0, 3) as string[];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full gap-3 rounded-xl border p-3 text-left transition hover:bg-slate-50 ${theme.border.default}`}
    >
      <img
        src={spot.imageUrl}
        alt={spot.title}
        className="h-20 w-20 flex-shrink-0 rounded-lg object-cover bg-slate-100"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`text-sm font-semibold truncate ${theme.text.primary}`}>
            {spot.title}
          </h3>
          {spot.rating !== undefined && (
            <span className="flex items-center gap-1 flex-shrink-0 text-xs font-medium text-slate-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {spot.rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className={`mt-0.5 flex items-center gap-1 text-xs truncate ${theme.text.muted}`}>
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {spot.address} · {spot.distanceKm.toFixed(1)} km away
        </p>

        {amenityLabels.length > 0 && (
          <p className={`mt-1 text-xs truncate ${theme.text.secondary}`}>
            {amenityLabels.join(" · ")}
          </p>
        )}

        <p className="mt-1.5 text-sm font-bold text-blue-600">
          ₹{spot.pricePerHour}
          <span className={`text-xs font-medium ${theme.text.muted}`}> / hour</span>
        </p>
      </div>
    </button>
  );
}

export default ParkingSpotCard;