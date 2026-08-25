import { MapPin, Star } from "lucide-react";
import { theme } from "../theme/theme";
import type { ParkingSpotSummary } from "../types/search";

interface CompactSpotCardProps {
  spot: ParkingSpotSummary;
  onClick?: () => void;
}

function CompactSpotCard({ spot, onClick }: CompactSpotCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-44 flex-shrink-0 snap-start rounded-xl border text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${theme.border.default}`}
    >
      <img
        src={spot.imageUrl}
        alt={spot.title}
        className="h-28 w-full rounded-t-xl object-cover bg-slate-100"
      />
      <div className="p-2.5">
        <h3 className={`text-xs font-semibold leading-snug line-clamp-2 ${theme.text.primary}`}>
          {spot.title}
        </h3>
        <p className={`mt-1 flex items-center gap-1 text-[11px] truncate ${theme.text.muted}`}>
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {spot.distanceKm.toFixed(1)} km
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-sm font-bold text-blue-600">
            ₹{spot.pricePerHour}
            <span className={`text-[10px] font-medium ${theme.text.muted}`}>/hr</span>
          </p>
          {spot.rating !== undefined && (
            <span className="flex items-center gap-0.5 text-[11px] font-medium text-slate-600">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {spot.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default CompactSpotCard;