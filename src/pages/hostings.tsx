import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Warehouse, MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import Button from "../components/button";
import ConfirmDialog from "../components/confirmDialog";
import { theme } from "../theme/theme";
import { getFirebaseAuth } from "../firebase/config";
import { listMyListings, deleteListing, hostingTitle, hostingSubtitle, type Hosting } from "../firebase/listings";

function Hostings() {
  const navigate = useNavigate();
  const [hostings, setHostings] = useState<Hosting[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setHostings([]);
        return;
      }
      try {
        const rows = await listMyListings(user.uid);
        setHostings(rows);
      } catch (err) {
        console.error("Failed to load listings:", err);
        setLoadError("Couldn't load your listings. Please try again.");
        setHostings([]);
      }
    });
    return unsubscribe;
  }, []);

  const deleteTarget = hostings?.find((h) => h.id === deleteTargetId) ?? null;

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteListing(deleteTargetId);
      setHostings((prev) => prev?.filter((h) => h.id !== deleteTargetId) ?? prev);
      setDeleteTargetId(null);
    } catch (err) {
      console.error("Failed to remove listing:", err);
      setLoadError("Couldn't remove that listing. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

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
        {loadError && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {loadError}
          </div>
        )}

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
              <div key={hosting.id} className={`rounded-2xl border ${theme.border.default} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold">{hostingTitle(hosting)}</h3>
                    <p className={`mt-1 flex items-center gap-1 text-xs ${theme.text.secondary}`}>
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{hostingSubtitle(hosting)}</span>
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

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/host-onboarding/${hosting.id}`)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTargetId(hosting.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
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

      {deleteTarget && (
        <ConfirmDialog
          title="Remove this listing?"
          description={`"${hostingTitle(deleteTarget)}" will be permanently removed and will no longer accept bookings. This can't be undone.`}
          confirmLabel={isDeleting ? "Removing…" : "Remove listing"}
          cancelLabel="Keep listing"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTargetId(null)}
        />
      )}
    </main>
  );
}

export default Hostings;