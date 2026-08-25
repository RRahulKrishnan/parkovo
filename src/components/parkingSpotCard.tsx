import { MapPin, Star } from "lucide-react";
import { theme } from "../theme/theme";
import { AMENITY_OPTIONS } from "../types/listing";
import type { ParkingSpotSummary } from "../types/search";

interface ParkingSpotCardProps {
  spot: ParkingSpotSummary;
  onClick?: () => void;
}

// Icon per amenity id. Falls back to a plain dot if an id isn't mapped here,
// so new amenity types never break the card.
import {
  Camera,
  Lightbulb,
  ShieldCheck,
  Clock,
  Zap,
  Warehouse,
  UserCheck,
  MoveHorizontal,
  Circle,
  type LucideIcon,
} from "lucide-react";

const AMENITY_ICONS: Record<string, LucideIcon> = {
  covered: Warehouse,
  cctv: Camera,
  well_lit: Lightbulb,
  gated_community: ShieldCheck,
  security_guard: UserCheck,
  "24_7_access": Clock,
  ev_charging: Zap,
  wide_entry: MoveHorizontal,
};

// Rough city-driving estimate — swap for a real ETA once directions/routing
// is wired up.
function estimateDriveMinutes(distanceKm: number) {
  const AVG_CITY_KMH = 20;
  return Math.max(1, Math.round((distanceKm / AVG_CITY_KMH) * 60));
}

function ParkingSpotCard({ spot, onClick }: ParkingSpotCardProps) {
  const amenities = spot.amenities
    .map((id) => {
      const label = AMENITY_OPTIONS.find((option) => option.value === id)?.label;
      return label ? { id, label } : null;
    })
    .filter(Boolean) as { id: string; label: string }[];

  const visibleAmenities = amenities.slice(0, 3);
  const overflowCount = amenities.length - visibleAmenities.length;
  const driveMinutes = estimateDriveMinutes(spot.distanceKm);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full gap-4 rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${theme.border.default}`}
    >
      <img
        src={spot.imageUrl}
        alt={spot.title}
        className="h-28 w-28 flex-shrink-0 rounded-xl object-cover bg-slate-100"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`text-base font-bold leading-snug truncate ${theme.text.primary}`}>
            {spot.title}
          </h3>
          {spot.rating !== undefined && (
            <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {spot.rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className={`mt-1 flex items-center gap-1 text-xs truncate ${theme.text.muted}`}>
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          {spot.address}
        </p>

        <p className={`mt-0.5 text-xs font-medium ${theme.text.secondary}`}>
          {spot.distanceKm.toFixed(1)} km away · ~{driveMinutes} min drive
        </p>

        {visibleAmenities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visibleAmenities.map(({ id, label }) => {
              const Icon = AMENITY_ICONS[id] ?? Circle;
              return (
                <span
                  key={id}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${theme.border.default} ${theme.surface.subtle} ${theme.text.secondary}`}
                >
                  <Icon className="h-3 w-3 flex-shrink-0" />
                  {label}
                </span>
              );
            })}
            {overflowCount > 0 && (
              <span
                className={`flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${theme.border.default} ${theme.text.muted}`}
              >
                +{overflowCount} more
              </span>
            )}
          </div>
        )}

        <p className="mt-2.5 text-base font-bold text-blue-600">
          ₹{spot.pricePerHour}
          <span className={`text-xs font-medium ${theme.text.muted}`}> / hour</span>
        </p>
      </div>
    </button>
  );
}

export default ParkingSpotCard;