import { theme } from "../theme/theme";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
}: SliderControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${theme.text.primary}`}>{label}</span>
        <span className={`text-sm font-semibold text-blue-600`}>
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
        aria-label={label}
      />
      <div className="flex items-center justify-between mt-1">
        <span className={`text-xs ${theme.text.muted}`}>
          {formatValue ? formatValue(min) : min}
        </span>
        <span className={`text-xs ${theme.text.muted}`}>
          {formatValue ? formatValue(max) : max}
        </span>
      </div>
    </div>
  );
}

export default SliderControl;