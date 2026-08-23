import { Check } from "lucide-react";
import { theme } from "../theme/theme";
import { AMENITY_OPTIONS } from "../types/listing";
import type { AmenityId } from "../types/listing";

interface AmenitySelectorProps {
  selected: AmenityId[];
  onToggle: (id: AmenityId) => void;
}

function AmenitySelector({ selected, onToggle }: AmenitySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {AMENITY_OPTIONS.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            aria-pressed={isSelected}
            className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm font-medium transition ${
              isSelected
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : `${theme.border.default} ${theme.text.primary} hover:bg-slate-50`
            }`}
          >
            <span
              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                isSelected ? "border-blue-600 bg-blue-600" : theme.border.default
              }`}
            >
              {isSelected && <Check className="h-3 w-3 text-white" />}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default AmenitySelector;