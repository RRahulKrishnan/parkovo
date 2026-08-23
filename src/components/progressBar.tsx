import { theme } from "../theme/theme";

interface ProgressBarProps {
  currentStep: number; // 1-indexed
  totalSteps: number;
  stepLabels?: readonly string[];
}

function ProgressBar({ currentStep, totalSteps, stepLabels }: ProgressBarProps) {
  const percent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${theme.text.secondary}`}>
          Step {currentStep} of {totalSteps}
          {stepLabels?.[currentStep - 1] ? ` · ${stepLabels[currentStep - 1]}` : ""}
        </span>
        <span className={`text-xs font-semibold ${theme.text.muted}`}>{percent}%</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        className={`h-1.5 w-full rounded-full overflow-hidden ${theme.divider}`}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;