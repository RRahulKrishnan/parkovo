import { theme } from "../theme/theme";
import { SPOT_SIZE_OPTIONS } from "../types/listing";
import type {SpotSize} from "../types/listing"

interface SpotSizeSelectorProps {
  value: SpotSize | "";
  onChange: (value: SpotSize) => void;
  error?: string;
}

function SpotSizeSelector({ value, onChange, error }: SpotSizeSelectorProps) {
  return (
    <div>
      <div className="space-y-2">
        {SPOT_SIZE_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : `${theme.border.default} hover:bg-slate-50`
              }`}
            >
              <span>
                <span
                  className={`block text-sm font-semibold ${
                    isSelected ? "text-blue-700" : theme.text.primary
                  }`}
                >
                  {option.label}
                </span>
                <span className={`block text-xs ${theme.text.muted}`}>{option.helper}</span>
              </span>
              <span
                className={`h-4 w-4 flex-shrink-0 rounded-full border ${
                  isSelected ? "border-blue-600" : theme.border.default
                }`}
              >
                {isSelected && <span className="block h-full w-full scale-50 rounded-full bg-blue-600" />}
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className={`mt-2 text-xs ${theme.text.error}`}>{error}</p>}
    </div>
  );
}

export default SpotSizeSelector;