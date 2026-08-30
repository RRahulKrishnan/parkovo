import { useState } from "react";
import Button from "../../components/button";
import { theme } from "../../theme/theme";
import AvailabilityCalendar from "../../components/availabilityCalendar";
import type { AvailabilityData } from "../../types/listing";

interface AvailabilityStepProps {
  data: AvailabilityData;
  onSubmit: (data: AvailabilityData) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

function AvailabilityStep({ data, onSubmit, onBack, isSubmitting }: AvailabilityStepProps) {
  const [availability, setAvailability] = useState<AvailabilityData>(data);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!availability.isOngoing) {
      if (!availability.startDate) {
        setError("Pick a start date");
        return;
      }
      if (!availability.endDate) {
        setError("Pick an end date");
        return;
      }
    }

    setError(undefined);
    onSubmit(availability);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${theme.text.primary}`}>
          When can you host?
        </h2>
        <p className={`mt-1 text-sm ${theme.text.secondary}`}>
          Choose how long this spot will be listed for.
        </p>
      </div>

      <AvailabilityCalendar
        startDate={availability.startDate}
        endDate={availability.endDate}
        isOngoing={availability.isOngoing}
        onChangeRange={(startDate, endDate) => {
          setAvailability((prev) => ({ ...prev, startDate, endDate }));
          setError(undefined);
        }}
        onChangeOngoing={(isOngoing) => {
          setAvailability((prev) => ({ ...prev, isOngoing }));
          setError(undefined);
        }}
        error={error}
      />

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? "Publishing…" : "Publish listing"}
        </Button>
      </div>
    </form>
  );
}

export default AvailabilityStep;