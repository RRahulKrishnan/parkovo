import { useState } from "react";
import Button from "../../components/button";
import { theme } from "../../theme/theme";
import type { AboutData } from "../../types/listing";

interface AboutStepProps {
  data: AboutData;
  onNext: (data: AboutData) => void;
  onBack: () => void;
}

const DESCRIPTION_MIN_LENGTH = 20;

interface AboutErrors {
  description?: string;
  howToGetThere?: string;
}

function AboutStep({ data, onNext, onBack }: AboutStepProps) {
  const [formData, setFormData] = useState<AboutData>(data);
  const [errors, setErrors] = useState<AboutErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors: AboutErrors = {};

    if (!formData.description.trim()) {
      validationErrors.description = "Describe the spot for renters";
    } else if (formData.description.trim().length < DESCRIPTION_MIN_LENGTH) {
      validationErrors.description = `Add a bit more detail (at least ${DESCRIPTION_MIN_LENGTH} characters)`;
    }

    if (!formData.howToGetThere.trim()) {
      validationErrors.howToGetThere = "Let renters know how to find the entrance";
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${theme.text.primary}`}>
          Describe your spot
        </h2>
        <p className={`mt-1 text-sm ${theme.text.secondary}`}>
          This shows up as "About this spot" on your listing.
        </p>
      </div>

      <div>
        <label htmlFor="description" className={`mb-1.5 block text-sm font-semibold ${theme.text.primary}`}>
          About this spot
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="What makes this spot easy to park in — surface, size, lighting, access hours…"
          value={formData.description}
          onChange={handleChange}
          className={`w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition ${
            errors.description
              ? `${theme.border.error} ${theme.ring.focusError}`
              : `${theme.border.default} ${theme.border.focus} ${theme.ring.focus}`
          } focus:ring-1`}
        />
        {errors.description && (
          <p role="alert" className={`mt-1 text-xs ${theme.text.error}`}>
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="howToGetThere" className={`mb-1.5 block text-sm font-semibold ${theme.text.primary}`}>
          How to get there
        </label>
        <textarea
          id="howToGetThere"
          name="howToGetThere"
          rows={3}
          placeholder="Entry gate, floor/level, parking number, any landmarks to look for…"
          value={formData.howToGetThere}
          onChange={handleChange}
          className={`w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition ${
            errors.howToGetThere
              ? `${theme.border.error} ${theme.ring.focusError}`
              : `${theme.border.default} ${theme.border.focus} ${theme.ring.focus}`
          } focus:ring-1`}
        />
        {errors.howToGetThere && (
          <p role="alert" className={`mt-1 text-xs ${theme.text.error}`}>
            {errors.howToGetThere}
          </p>
        )}
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

export default AboutStep;