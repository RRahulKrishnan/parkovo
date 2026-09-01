import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import Input from "../components/input";
import Button from "../components/button";
import AmenitySelector from "../components/amenitySelector";
import SliderControl from "../components/sliderControl";
import ConfirmDialog from "../components/confirmDialog";
import { theme } from "../theme/theme";
import { MOCK_HOSTINGS, type Hosting } from "../data/mockHostings";
import { FILTER_BOUNDS } from "../types/search";
import type { AmenityId } from "../types/listing";

function formatPrice(value: number) {
  return `₹${value}`;
}

function EditHosting() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // undefined = still loading, null = no listing found with this id
  const [hosting, setHosting] = useState<Hosting | null | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyPrice, setHourlyPrice] = useState(0);
  const [amenities, setAmenities] = useState<AmenityId[]>([]);
  const [status, setStatus] = useState<"active" | "paused">("active");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // TODO: replace with a real Supabase fetch, e.g.
    // const { data } = await supabase.from("listings").select("*").eq("id", id).single();
    const timer = setTimeout(() => {
      const found = MOCK_HOSTINGS.find((h) => h.id === id) ?? null;
      setHosting(found);
      if (found) {
        setTitle(found.title);
        setDescription(found.description);
        setHourlyPrice(found.pricing.hourly);
        setAmenities(found.amenities);
        setStatus(found.status);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [id]);

  const handleToggleAmenity = (amenityId: AmenityId) => {
    setAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  const handleSave = async () => {
    if (!hosting) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      // TODO: replace with a real Supabase update, e.g.
      // await supabase.from("listings").update({
      //   title, description, hourly_price: hourlyPrice, amenities, status,
      // }).eq("id", hosting.id);
      await new Promise((resolve) => setTimeout(resolve, 600));
      navigate("/hostings");
    } catch (err) {
      console.error("Failed to save listing:", err);
      setSaveError("Couldn't save your changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!hosting) return;
    setIsDeleting(true);
    try {
      // TODO: replace with a real Supabase delete, e.g.
      // await supabase.from("listings").delete().eq("id", hosting.id);
      await new Promise((resolve) => setTimeout(resolve, 600));
      navigate("/hostings");
    } catch (err) {
      console.error("Failed to remove listing:", err);
      setIsDeleting(false);
    }
  };

  if (hosting === undefined) {
    return (
      <main className={`min-h-screen ${theme.surface.page}`}>
        <div className="px-6 pt-14">
          <div
            className={`h-40 animate-pulse rounded-2xl border ${theme.border.default} bg-slate-50`}
          />
        </div>
      </main>
    );
  }

  if (hosting === null) {
    return (
      <main
        className={`flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center ${theme.surface.page}`}
      >
        <p className={`text-sm font-medium ${theme.text.secondary}`}>Listing not found</p>
        <button
          type="button"
          onClick={() => navigate("/hostings")}
          className={`text-sm font-medium ${theme.text.link}`}
        >
          Back to hostings
        </button>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${theme.surface.page} ${theme.text.primary}`}>
      <div className="flex items-center gap-3 px-6 pt-8 pb-4">
        <button
          type="button"
          onClick={() => navigate("/hostings")}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-extrabold tracking-tight">Edit listing</h1>
      </div>

      <section className="space-y-6 px-6 pb-28">
        {saveError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {saveError}
          </div>
        )}

        <Input
          id="title"
          name="title"
          label="Listing title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div>
          <label
            htmlFor="description"
            className={`mb-2 block text-sm font-medium ${theme.text.primary}`}
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`w-full rounded-lg border ${theme.border.default} p-3 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600`}
          />
        </div>

        <SliderControl
          label="Price per hour"
          value={hourlyPrice}
          min={FILTER_BOUNDS.price.min}
          max={FILTER_BOUNDS.price.max}
          step={FILTER_BOUNDS.price.step}
          onChange={setHourlyPrice}
          formatValue={formatPrice}
        />

        <div>
          <h3 className={`mb-3 text-sm font-semibold ${theme.text.primary}`}>Amenities</h3>
          <AmenitySelector selected={amenities} onToggle={handleToggleAmenity} />
        </div>

        <div>
          <h3 className={`mb-3 text-sm font-semibold ${theme.text.primary}`}>Status</h3>
          <div className="flex gap-2">
            {(["active", "paused"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold capitalize transition ${
                  status === option
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : `${theme.border.default} ${theme.text.secondary} hover:bg-slate-50`
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className={`mt-2 text-xs ${theme.text.muted}`}>
            Paused listings won't show up in search results until reactivated.
          </p>
        </div>

        <Button type="button" onClick={handleSave} isLoading={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </Button>

        <div className={`mt-8 border-t pt-6 ${theme.border.default}`}>
          <h3 className="text-sm font-semibold text-red-600">Danger zone</h3>
          <p className={`mt-1 text-xs ${theme.text.muted}`}>
            Removing a listing is permanent and can't be undone.
          </p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            fullWidth={false}
            className="mt-3"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove listing
          </Button>
        </div>
      </section>

      {isDeleteDialogOpen && (
        <ConfirmDialog
          title="Remove this listing?"
          description={`"${hosting.title}" will be permanently removed and will no longer accept bookings. This can't be undone.`}
          confirmLabel={isDeleting ? "Removing…" : "Remove listing"}
          cancelLabel="Keep listing"
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </main>
  );
}

export default EditHosting;