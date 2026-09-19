import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Navigation, Loader2 } from "lucide-react";
import { theme } from "../theme/theme";
import { AMENITY_OPTIONS } from "../types/listing";
import { STATUS_META } from "../types/search";
import { getParkingSpot } from "../firebase/listings";
import { isSpotBooked, savePendingCheckout } from "../types/checkout";
import type { ParkingSpotDetail } from "../types/spotDetail";

type RentalPeriod = "hourly" | "daily" | "weekly" | "monthly";
const PERIOD_LABEL: Record<RentalPeriod, string> = { hourly: "/ hour", daily: "/ day", weekly: "/ week", monthly: "/ month" };

function ParkingSpotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [spot, setSpot] = useState<ParkingSpotDetail | null | undefined>(undefined);
  const [period, setPeriod] = useState<RentalPeriod>("hourly");

  useEffect(() => {
    if (!id) { setSpot(null); return; }
    let mounted = true;
    getParkingSpot(id)
      .then((result) => {
        if (!mounted || !result) return;
        // Overlay the client-side "just booked" flag from checkout.ts,
        // same as findParking.tsx does, so a spot booked moments ago
        // shows correctly without waiting on a fresh Firestore read.
        setSpot(isSpotBooked(result.id) ? { ...result, status: "booked" } : result);
      })
      .catch((error) => {
        console.error("Failed to load parking spot:", error);
        if (mounted) setSpot(null);
      });
    return () => { mounted = false; };
  }, [id]);

  const periods = useMemo(
    () => (spot ? (["hourly", "daily", "weekly", "monthly"] as RentalPeriod[]).filter((item) => spot.pricing[item] !== undefined) : []),
    [spot]
  );

  if (spot === undefined) {
    return (
      <main className={`flex min-h-screen items-center justify-center ${theme.surface.page}`}>
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </main>
    );
  }

  if (!spot) {
    return (
      <main className={`flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center ${theme.surface.page}`}>
        <p className="text-sm font-semibold">Spot not found</p>
        <button onClick={() => navigate("/find-parking")} className={theme.text.link}>Back to search</button>
      </main>
    );
  }

  const price = spot.pricing[period] ?? spot.pricing.hourly;
  const status = STATUS_META[spot.status];

  const handleReserve = () => {
    if (spot.status === "booked") return;
    savePendingCheckout({
      listingId: spot.id,
      spotName: spot.title,
      address: spot.address,
      period,
      unitPrice: price,
      quantity: 1,
      startAt: new Date().toISOString(),
      maxBookingHours: spot.maxBookingHours,
      availableUntil: spot.availableUntil,
    });
    navigate("/booking/confirm");
  };

  return (
    <main className={`min-h-screen pb-28 ${theme.surface.page} ${theme.text.primary}`}>
      <div className="relative h-72 w-full bg-slate-100">
        <img src={spot.imageUrl} alt={spot.title} className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:bg-white"
        >
          <ArrowLeft className="h-5 w-5 text-slate-900" />
        </button>
        {spot.images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            1 / {spot.images.length}
          </div>
        )}
      </div>

      <section className="px-6 pt-5">
        <h2 className="text-2xl font-extrabold">{spot.title}</h2>
        <p className={`mt-2 flex items-center gap-1.5 text-sm ${theme.text.muted}`}>
          <MapPin className="h-4 w-4" />
          {spot.address}
        </p>
        <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClass}`}>
          {status.label}
        </span>

        {periods.length > 1 && (
          <div className="mt-5 flex gap-2">
            {periods.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  period === item
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : `${theme.border.default} ${theme.text.secondary} hover:bg-slate-50`
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {spot.amenities.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold">Amenities</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {spot.amenities.map((amenity) => (
                <span key={amenity} className={`rounded-full border px-3 py-1.5 text-xs ${theme.border.default} ${theme.text.secondary}`}>
                  {AMENITY_OPTIONS.find((item) => item.value === amenity)?.label ?? amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-bold">About this spot</h3>
          <p className={`mt-2 text-sm leading-relaxed ${theme.text.secondary}`}>
            {spot.description || "No description added yet."}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="flex items-center gap-1.5 text-sm font-bold">
            <Navigation className="h-4 w-4" />
            How to get there
          </h3>
          <p className={`mt-2 text-sm leading-relaxed ${theme.text.secondary}`}>
            {spot.howToGetThere || "Directions haven't been added yet."}
          </p>
        </div>

        {spot.hostName && (
          <p className={`mt-6 text-sm ${theme.text.secondary}`}>Hosted by {spot.hostName}</p>
        )}
      </section>

      <footer className={`fixed inset-x-0 bottom-0 flex items-center justify-between border-t px-6 py-4 ${theme.surface.page} ${theme.border.default}`}>
        <p className="text-lg font-bold text-blue-600">
          ₹{price}
          <span className={`text-xs font-medium ${theme.text.muted}`}> {PERIOD_LABEL[period]}</span>
        </p>
        <button
          type="button"
          disabled={spot.status === "booked"}
          onClick={handleReserve}
          className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
            spot.status === "booked" ? "cursor-not-allowed bg-slate-200 text-slate-400" : theme.button.primary
          }`}
        >
          {spot.status === "booked" ? "Not available" : "Reserve spot"}
        </button>
      </footer>
    </main>
  );
}

export default ParkingSpotDetailPage;
