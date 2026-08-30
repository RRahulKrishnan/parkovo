import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Warehouse, MapPin, Plus } from "lucide-react";
import Button from "../components/button";
import { theme } from "../theme/theme";

interface Hosting {
  id: string;
  spotName: string;
  address: string;
  status: "active" | "paused";
  bookingsThisMonth: number;
}

// Placeholder data so the screen is reviewable before Firestore is wired
// in. Replace with a query against a `listings` collection filtered by
// the signed-in user's uid as hostId (see TODO below).
const MOCK_HOSTINGS: Hosting[] = [
  {
    id: "1",
    spotName: "Private driveway, Koramangala",
    address: "80 Feet Rd, Koramangala, Bengaluru",
    status: "active",
    bookingsThisMonth: 6,
  },
];

function Hostings() {
  const navigate = useNavigate();
  const [hostings, setHostings] = useState<Hosting[] | null>(null);

  useEffect(() => {
    // TODO: replace with a Firestore query, e.g.
    // const q = query(collection(db, "listings"), where("hostId", "==", auth.currentUser?.uid));
    // const snap = await getDocs(q);
    const timer = setTimeout(() => setHostings(MOCK_HOSTINGS), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className={`min-h-screen ${theme.surface.page} ${theme.text.primary}`}>
      <div className="px-6 pt-14 pb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Hostings</h1>
          <p className={`mt-1 text-sm ${theme.text.secondary}`}>
            Spots you've listed for others to book.
          </p>
        </div>
      </div>

      <section className="px-6 pb-24">
        {hostings === null && (
          <div className="space-y-3">
            <div className={`h-28 animate-pulse rounded-2xl border ${theme.border.default} bg-slate-50`} />
          </div>
        )}

        {hostings !== null && hostings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Warehouse className="h-10 w-10 text-slate-300" />
            <p className={`mt-4 text-sm font-medium ${theme.text.secondary}`}>
              You haven't listed a spot yet
            </p>
            <div className="mt-4 w-full max-w-xs">
              <Button type="button" onClick={() => navigate("/host-onboarding")}>
                <Plus className="h-4 w-4" />
                Host a spot
              </Button>
            </div>
          </div>
        )}

        {hostings !== null && hostings.length > 0 && (
          <div className="space-y-3">
            {hostings.map((hosting) => (
              <div
                key={hosting.id}
                className={`rounded-2xl border ${theme.border.default} p-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold">{hosting.spotName}</h3>
                    <p className={`mt-1 flex items-center gap-1 text-xs ${theme.text.secondary}`}>
                      <MapPin className="h-3.5 w-3.5" />
                      {hosting.address}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      hosting.status === "active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {hosting.status}
                  </span>
                </div>
                <p className={`mt-3 text-xs ${theme.text.secondary}`}>
                  {hosting.bookingsThisMonth} bookings this month
                </p>
              </div>
            ))}

            <button
              type="button"
              onClick={() => navigate("/host-onboarding")}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed ${theme.border.default} py-4 text-sm font-semibold ${theme.text.link}`}
            >
              <Plus className="h-4 w-4" />
              Host another spot
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Hostings;