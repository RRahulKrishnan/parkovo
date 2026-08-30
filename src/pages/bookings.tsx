import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, MapPin } from "lucide-react";
import { theme } from "../theme/theme";

interface Booking {
  id: string;
  spotName: string;
  address: string;
  date: string;
  timeRange: string;
  status: "upcoming" | "active" | "completed";
}

// Placeholder data so the screen is reviewable before Firestore is wired
// in. Replace with a query against a `bookings` collection filtered by
// the signed-in user's uid (see TODO below).
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
};

function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    // TODO: replace with a Firestore query, e.g.
    // const q = query(collection(db, "bookings"), where("userId", "==", auth.currentUser?.uid));
    // const snap = await getDocs(q);
    const timer = setTimeout(() => setBookings(MOCK_BOOKINGS), 300);
    return () => clearTimeout(timer);
  }, []);

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
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Bookings;