import { useState } from "react";
import Button from "../components/button";
import { theme } from "../theme/theme";
import PhotoUploader from "../components/photoUploader";
import { MIN_PHOTOS_REQUIRED } from "../types/listing";
import type { PhotosData } from "../types/listing";

interface PhotosStepProps {
  data: PhotosData;
  onNext: (data: PhotosData) => void;
  onBack: () => void;
}

function PhotosStep({ data, onNext, onBack }: PhotosStepProps) {
  const [files, setFiles] = useState<File[]>(data.files);
  const [previewUrls, setPreviewUrls] = useState<string[]>(data.previewUrls);
  const [error, setError] = useState<string | undefined>();

  const handleAdd = (newFiles: File[]) => {
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setError(undefined);
  };

  const handleRemove = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length < MIN_PHOTOS_REQUIRED) {
      setError(`Add at least ${MIN_PHOTOS_REQUIRED} photos so renters can see the spot clearly`);
      return;
    }
    onNext({ files, previewUrls });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${theme.text.primary}`}>
          Add some photos
        </h2>
        <p className={`mt-1 text-sm ${theme.text.secondary}`}>
          Clear photos help renters trust the listing. Add at least {MIN_PHOTOS_REQUIRED}.
        </p>
      </div>

      <PhotoUploader
        files={files}
        previewUrls={previewUrls}
        onAdd={handleAdd}
        onRemove={handleRemove}
        error={error}
      />

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}

export default PhotosStep;