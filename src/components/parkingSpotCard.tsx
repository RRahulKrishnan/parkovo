import { MapPin, Star, Zap, Warehouse, Camera, Lightbulb, ShieldCheck, Clock, UserCheck, MoveHorizontal, Circle, type LucideIcon } from "lucide-react";
import { theme } from "../theme/theme";
import { AMENITY_OPTIONS } from "../types/listing";
import { STATUS_META } from "../types/search";
import type { ParkingSpotSummary } from "../types/search";

interface ParkingSpotCardProps {
  spot: ParkingSpotSummary;
  onClick?: () => void;
}

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
  const statusMeta = STATUS_META[spot.status];

  return (
    <button
      type="button"
      onClick={onClick}
      // was p-4 with a 28x28 image; widened by trimming outer padding and
      // giving the text column more room instead of growing the whole card
      className={`flex w-full gap-4 rounded-2xl border p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${theme.border.default}`}
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

        <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusMeta.badgeClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
          {statusMeta.label}
        </span>

        <p className={`mt-1.5 flex items-center gap-1 text-xs truncate ${theme.text.muted}`}>
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
              const isEv = id === "ev_charging";
              return (
                <span
                  key={id}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                    isEv
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : `${theme.border.default} ${theme.surface.subtle} ${theme.text.secondary}`
                  }`}
                >
                  <Icon className={`h-3 w-3 flex-shrink-0 ${isEv ? "text-emerald-500" : ""}`} />
                  {label}
                </span>
              );
            })}
            {overflowCount > 0 && (
              <span className={`flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${theme.border.default} ${theme.text.muted}`}>
                +{overflowCount} more
              </span>
            )}
          </div>
        )}

        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <p className="text-base font-bold text-blue-600">
            ₹{spot.pricing.hourly}
            <span className={`text-xs font-medium ${theme.text.muted}`}> / hour</span>
          </p>
          {spot.pricing.daily !== undefined && (
            <p className={`text-xs font-medium ${theme.text.muted}`}>₹{spot.pricing.daily}/day</p>
          )}
          {spot.pricing.weekly !== undefined && (
            <p className={`text-xs font-medium ${theme.text.muted}`}>₹{spot.pricing.weekly}/wk</p>
          )}
          {spot.pricing.monthly !== undefined && (
            <p className={`text-xs font-medium ${theme.text.muted}`}>₹{spot.pricing.monthly}/mo</p>
          )}
        </div>
      </div>
    </button>
  );
}

export default ParkingSpotCard;