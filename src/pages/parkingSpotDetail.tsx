import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Warehouse, Camera, Lightbulb, ShieldCheck, Clock, Zap, UserCheck, MoveHorizontal, Circle, Navigation, type LucideIcon } from "lucide-react";
import { theme } from "../theme/theme";
import { AMENITY_OPTIONS } from "../types/listing";
import { STATUS_META } from "../types/search";
import type { ParkingSpotDetail } from "../types/spotDetail";
import CompactSpotCard from "../components/compactSpotCard";

type RentalPeriod = "hourly" | "daily" | "weekly" | "monthly";

const PERIOD_LABEL: Record<RentalPeriod, string> = {
  hourly: "/ hour",
  daily: "/ day",
  weekly: "/ week",
  monthly: "/ month",
};

// TODO: replace with real API calls:
// const spot = await api.getParkingSpot(id);
// const nearby = await api.getNearbySpots(id, { limit: 8 });
const MOCK_SPOT_DETAILS: ParkingSpotDetail[] = [
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
    images: [
      "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=600&fit=crop",
    ],
    description:
      "A secure, covered spot just off MG Road with easy access to metro and shopping. Well-lit and monitored around the clock, ideal for daily commuters or weekend visits.",
    howToGetThere:
      "Enter through the main gate on MG Road, take the ramp down to level B1, and the spot is marked B1-14 next to the elevator.",
    hostName: "Ramesh K.",
    hostRating: 4.9,
    reviewCount: 132,
    availableFrom: "Available now",
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
    images: ["https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=600&fit=crop"],
    description:
      "Private driveway inside a gated residential community with round-the-clock security. Plenty of turning room for larger vehicles.",
    howToGetThere:
      "Show your booking confirmation to the security guard at the main gate; they'll direct you to the visitor driveway on the left.",
    hostName: "Priya S.",
    hostRating: 4.7,
    reviewCount: 58,
    availableFrom: "Available now",
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
    images: ["https://images.unsplash.com/photo-1621977544450-4b6b0ce6c7ea?w=800&h=600&fit=crop"],
    description:
      "Open-air spot with a Type 2 EV charger on site. Steps away from Koramangala's cafes and coworking spaces.",
    howToGetThere:
      "Spot is street-side, directly opposite the Koramangala Social entrance. Look for the green EV charging bay marking.",
    hostName: "Arjun M.",
    hostRating: 4.8,
    reviewCount: 91,
    availableFrom: "Available from 6 PM",
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
    images: ["https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&h=600&fit=crop"],
    description:
      "Basement level spot with a wide entry ramp, easy for compact and hatchback vehicles to maneuver.",
    howToGetThere:
      "Drive into the building's basement ramp on 27th Main, take the first left, spot is #12.",
    hostName: "Fatima N.",
    hostRating: 4.4,
    reviewCount: 27,
    availableFrom: "Available now",
  },
];

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

function ParkingSpotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<RentalPeriod>("hourly");

  const spot = useMemo(() => MOCK_SPOT_DETAILS.find((s) => s.id === id), [id]);

  const nearbySpots = useMemo(() => {
    if (!spot) return [];
    return MOCK_SPOT_DETAILS.filter((s) => s.id !== spot.id).sort(
      (a, b) => a.distanceKm - b.distanceKm
    );
  }, [spot]);

  if (!spot) {
    return (
      <main className={`flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center ${theme.surface.page}`}>
        <p className={`text-sm font-semibold ${theme.text.primary}`}>Spot not found</p>
        <button
          type="button"
          onClick={() => navigate("/find-parking")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${theme.button.primary}`}
        >
          Back to search
        </button>
      </main>
    );
  }

  const amenities = spot.amenities
    .map((a) => {
      const label = AMENITY_OPTIONS.find((o) => o.value === a)?.label;
      return label ? { id: a, label } : null;
    })
    .filter(Boolean) as { id: string; label: string }[];

  const driveMinutes = estimateDriveMinutes(spot.distanceKm);
  const statusMeta = STATUS_META[spot.status];

  // Only offer period toggles the host actually set a rate for.
  const availablePeriods = (["hourly", "daily", "weekly", "monthly"] as RentalPeriod[]).filter(
    (p) => spot.pricing[p] !== undefined
  );
  const activePrice = spot.pricing[period] ?? spot.pricing.hourly;

  return (
    <main className={`min-h-screen pb-28 ${theme.surface.page} ${theme.text.primary}`}>
      <div className="relative h-72 w-full bg-slate-100">
        <img src={spot.images[0]} alt={spot.title} className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:bg-white"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-slate-900" />
        </button>
        {spot.images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            1 / {spot.images.length}
          </div>
        )}
      </div>

      <div className="px-6 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-extrabold tracking-tight">{spot.title}</h1>
          {spot.rating !== undefined && (
            <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {spot.rating.toFixed(1)}
              {spot.reviewCount !== undefined && (
                <span className="font-normal text-amber-700/70">({spot.reviewCount})</span>
              )}
            </span>
          )}
        </div>

        <p className={`mt-1.5 flex items-center gap-1.5 text-sm ${theme.text.muted}`}>
          <MapPin className="h-4 w-4 flex-shrink-0" />
          {spot.address}
        </p>
        <p className={`mt-0.5 text-sm font-medium ${theme.text.secondary}`}>
          {spot.distanceKm.toFixed(1)} km away · ~{driveMinutes} min drive
        </p>

        <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
          {statusMeta.label}
        </p>

        {/* Rental period picker */}
        {availablePeriods.length > 1 && (
          <div className="mt-5 flex gap-2">
            {availablePeriods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  period === p
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : `${theme.border.default} ${theme.text.secondary} hover:bg-slate-50`
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {amenities.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-bold">Amenities</h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {amenities.map(({ id: amenityId, label }) => {
                const Icon = AMENITY_ICONS[amenityId] ?? Circle;
                const isEv = amenityId === "ev_charging";
                return (
                  <span
                    key={amenityId}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                      isEv
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : `${theme.border.default} ${theme.surface.subtle} ${theme.text.secondary}`
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${isEv ? "text-emerald-500" : ""}`} />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5">
          <h2 className="text-sm font-bold">About this spot</h2>
          <p className={`mt-1.5 text-sm leading-relaxed ${theme.text.secondary}`}>
            {spot.description}
          </p>
        </div>

        <div className="mt-5">
          <h2 className="flex items-center gap-1.5 text-sm font-bold">
            <Navigation className="h-3.5 w-3.5" />
            How to get there
          </h2>
          <p className={`mt-1.5 text-sm leading-relaxed ${theme.text.secondary}`}>
            {spot.howToGetThere}
          </p>
        </div>

        <div className={`mt-5 flex items-center justify-between rounded-xl border p-3.5 ${theme.border.default}`}>
          <div>
            <p className="text-sm font-semibold">Hosted by {spot.hostName}</p>
            {spot.hostRating !== undefined && (
              <p className={`mt-0.5 flex items-center gap-1 text-xs ${theme.text.muted}`}>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {spot.hostRating.toFixed(1)} host rating
              </p>
            )}
          </div>
        </div>

        {nearbySpots.length > 0 && (
          <div className="mt-7">
            <h2 className="text-sm font-bold">Similar spots nearby</h2>
            {/* pb-2 -> pb-5 so the scrollbar track sits clear of the card
                shadows instead of hugging them */}
            <div className="mt-3 -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-5">
              {nearbySpots.map((nearby) => (
                <CompactSpotCard
                  key={nearby.id}
                  spot={nearby}
                  onClick={() => navigate(`/find-parking/${nearby.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={`fixed inset-x-0 bottom-0 flex items-center justify-between border-t px-6 py-4 ${theme.surface.page} ${theme.border.default}`}>
        <div>
          <p className="text-lg font-bold text-blue-600">
            ₹{activePrice}
            <span className={`text-xs font-medium ${theme.text.muted}`}> {PERIOD_LABEL[period]}</span>
          </p>
        </div>
        <button
          type="button"
          disabled={spot.status === "booked"}
          className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
            spot.status === "booked"
              ? "cursor-not-allowed bg-slate-200 text-slate-400"
              : theme.button.primary
          }`}
        >
          {spot.status === "booked" ? "Not available" : "Reserve spot"}
        </button>
      </div>
    </main>
  );
}

export default ParkingSpotDetailPage;