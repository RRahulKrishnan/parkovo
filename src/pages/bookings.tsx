import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, MapPin, Ban } from "lucide-react";
import Button from "../components/button";
import ConfirmDialog from "../components/confirmDialog";
import { theme } from "../theme/theme";

interface Booking {
  id: string;
  spotName: string;
  address: string;
  date: string;
  timeRange: string;
  status: "upcoming" | "active" | "completed" | "cancelled";
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    spotName: "Covered spot near MG Road",
    address: "12 Residency Rd, Bengaluru",
    date: "Aug 28, 2026",
    timeRange: "9:00 AM – 6:00 PM",
    status: "upcoming",
  },
  {
    id: "2",
    spotName: "Driveway spot, Indiranagar",
    address: "100ft Rd, Indiranagar, Bengaluru",
    date: "Aug 20, 2026",
    timeRange: "2:00 PM – 8:00 PM",
    status: "completed",
  },
];

const STATUS_STYLES: Record<Booking["status"], string> = {
  upcoming: "bg-blue-50 text-blue-600",
  active: "bg-emerald-50 text-emerald-600",
  completed: "bg-slate-100 text-slate-500",
  cancelled: "bg-red-50 text-red-600",
};

function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBookings(MOCK_BOOKINGS), 300);
    return () => clearTimeout(timer);
  }, []);

  const cancelTarget = bookings?.find((b) => b.id === cancelTargetId) ?? null;

  const handleConfirmCancel = async () => {
    if (!cancelTargetId) return;
    setIsCancelling(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setBookings((prev) =>
        prev
          ? prev.map((b) => (b.id === cancelTargetId ? { ...b, status: "cancelled" } : b))
          : prev
      );
      setCancelTargetId(null);
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <main className={`min-h-screen ${theme.surface.page} ${theme.text.primary}`}>
      <div className="px-6 pt-14 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Bookings</h1>
        <p className={`mt-1 text-sm ${theme.text.secondary}`}>
          Spots you've booked, upcoming and past.
        </p>
      </div>

      <section className="px-6 pb-24">
        {bookings === null && (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-24 animate-pulse rounded-2xl border ${theme.border.default} bg-slate-50`}
              />
            ))}
          </div>
        )}

        {bookings !== null && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarCheck className="h-10 w-10 text-slate-300" />
            <p className={`mt-4 text-sm font-medium ${theme.text.secondary}`}>
              No bookings yet
            </p>
            <button
              type="button"
              onClick={() => navigate("/find-parking")}
              className={`mt-2 text-sm font-medium ${theme.text.link}`}
            >
              Find a parking spot
            </button>
          </div>
        )}

        {bookings !== null && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`rounded-2xl border ${theme.border.default} p-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold">{booking.spotName}</h3>
                    <p className={`mt-1 flex items-center gap-1 text-xs ${theme.text.secondary}`}>
                      <MapPin className="h-3.5 w-3.5" />
                      {booking.address}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className={`mt-3 flex items-center gap-2 text-xs ${theme.text.secondary}`}>
                  <span>{booking.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{booking.timeRange}</span>
                </div>

                {booking.status === "upcoming" && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    fullWidth={false}
                    onClick={() => setCancelTargetId(booking.id)}
                    className="mt-3"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Cancel booking
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {cancelTarget && (
        <ConfirmDialog
          title="Cancel this booking?"
          description={`${cancelTarget.spotName} · ${cancelTarget.date}, ${cancelTarget.timeRange}. This can't be undone, and any applicable cancellation policy will apply.`}
          confirmLabel={isCancelling ? "Cancelling…" : "Cancel booking"}
          cancelLabel="Keep booking"
          isLoading={isCancelling}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelTargetId(null)}
        />
      )}
    </main>
  );
}

export default Bookings;