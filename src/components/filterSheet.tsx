import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "./button";
import { theme } from "../theme/theme";
import AmenitySelector from "./amenitySelector";
import SliderControl from "./sliderControl";
import type { AmenityId } from "../types/listing";
import { DEFAULT_FILTERS, FILTER_BOUNDS } from "../types/search";
import type {SearchFilters} from "../types/search"

interface FilterSheetProps {
  isOpen: boolean;
  filters: SearchFilters;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
}

function formatKm(value: number) {
  return `${value} km`;
}

function formatPrice(value: number) {
  return `₹${value}`;
}

function formatHours(value: number) {
  return `${value} hr${value === 1 ? "" : "s"}`;
}

function FilterSheet({ isOpen, filters, onClose, onApply }: FilterSheetProps) {
  const [draft, setDraft] = useState<SearchFilters>(filters);

  // Re-sync the draft whenever the sheet is (re)opened, so stale edits
  // from a previous open/close don't linger.
  useEffect(() => {
    if (isOpen) setDraft(filters);
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handleToggleAmenity = (id: AmenityId) => {
    setDraft((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter((item) => item !== id)
        : [...prev.amenities, id],
    }));
  };

  const handleMinPriceChange = (value: number) => {
    setDraft((prev) => ({
      ...prev,
      minPricePerHour: Math.min(value, prev.maxPricePerHour),
    }));
  };

  const handleMaxPriceChange = (value: number) => {
    setDraft((prev) => ({
      ...prev,
      maxPricePerHour: Math.max(value, prev.minPricePerHour),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white px-6 pt-5 pb-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-lg font-bold ${theme.text.primary}`}>Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-7">
          <div>
            <h3 className={`mb-3 text-sm font-semibold ${theme.text.primary}`}>Amenities</h3>
            <AmenitySelector selected={draft.amenities} onToggle={handleToggleAmenity} />
          </div>

          <SliderControl
            label="Search radius"
            value={draft.radiusKm}
            min={FILTER_BOUNDS.radiusKm.min}
            max={FILTER_BOUNDS.radiusKm.max}
            step={FILTER_BOUNDS.radiusKm.step}
            onChange={(radiusKm) => setDraft((prev) => ({ ...prev, radiusKm }))}
            formatValue={formatKm}
          />

          <div>
            <h3 className={`mb-3 text-sm font-semibold ${theme.text.primary}`}>
              Price per hour
            </h3>
            <div className="space-y-5">
              <SliderControl
                label="Min"
                value={draft.minPricePerHour}
                min={FILTER_BOUNDS.price.min}
                max={FILTER_BOUNDS.price.max}
                step={FILTER_BOUNDS.price.step}
                onChange={handleMinPriceChange}
                formatValue={formatPrice}
              />
              <SliderControl
                label="Max"
                value={draft.maxPricePerHour}
                min={FILTER_BOUNDS.price.min}
                max={FILTER_BOUNDS.price.max}
                step={FILTER_BOUNDS.price.step}
                onChange={handleMaxPriceChange}
                formatValue={formatPrice}
              />
            </div>
          </div>

          <SliderControl
            label="Duration needed"
            value={draft.durationHours}
            min={FILTER_BOUNDS.durationHours.min}
            max={FILTER_BOUNDS.durationHours.max}
            step={FILTER_BOUNDS.durationHours.step}
            onChange={(durationHours) => setDraft((prev) => ({ ...prev, durationHours }))}
            formatValue={formatHours}
          />
        </div>

        <div className="mt-8 flex gap-3">
          <Button type="button" variant="secondary" onClick={() => setDraft(DEFAULT_FILTERS)}>
            Reset
          </Button>
          <Button type="button" onClick={() => onApply(draft)}>
            Show results
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FilterSheet;