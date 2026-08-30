import { useState } from "react";
import Button from "../../components/button";
import { theme } from "../../theme/theme";
import AmenitySelector from "../../components/amenitySelector";
import SpotSizeSelector from "../../components/spotSizeSelector";
import type { AmenitiesData, AmenityId } from "../../types/listing";

interface AmenitiesStepProps {
  data: AmenitiesData;
  onNext: (data: AmenitiesData) => void;
  onBack: () => void;
}

function AmenitiesStep({ data, onNext, onBack }: AmenitiesStepProps) {
  const [amenities, setAmenities] = useState<AmenityId[]>(data.amenities);
  const [spotSize, setSpotSize] = useState<AmenitiesData["spotSize"]>(data.spotSize);
  const [spotSizeError, setSpotSizeError] = useState<string | undefined>();

  const handleToggleAmenity = (id: AmenityId) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!spotSize) {
      setSpotSizeError("Select the largest vehicle size that fits");
      return;
    }
    onNext({ amenities, spotSize });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${theme.text.primary}`}>
          Spot details
        </h2>
        <p className={`mt-1 text-sm ${theme.text.secondary}`}>
          Tell renters what to expect.
        </p>
      </div>

      <div>
        <h3 className={`mb-3 text-sm font-semibold ${theme.text.primary}`}>Amenities</h3>
        <AmenitySelector selected={amenities} onToggle={handleToggleAmenity} />
      </div>

      <div>
        <h3 className={`mb-3 text-sm font-semibold ${theme.text.primary}`}>
          Maximum vehicle size
        </h3>
        <SpotSizeSelector
          value={spotSize}
          onChange={(value) => {
            setSpotSize(value);
            setSpotSizeError(undefined);
          }}
          error={spotSizeError}
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}

export default AmenitiesStep;