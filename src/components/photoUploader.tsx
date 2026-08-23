import { useRef } from "react";
import { Camera, X, ImagePlus } from "lucide-react";
import { theme } from "../theme/theme";
import { MIN_PHOTOS_REQUIRED } from "../types/listing";

interface PhotoUploaderProps {
  files: File[];
  previewUrls: string[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  error?: string;
}

function PhotoUploader({ files, previewUrls, onAdd, onRemove, error }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    onAdd(Array.from(selected));

    // Reset so selecting the same file again still fires onChange
    e.target.value = "";
  };

  const remaining = Math.max(MIN_PHOTOS_REQUIRED - files.length, 0);

  return (
    <div className="space-y-4">
      {/* Hidden input drives both "take photo" and "choose from library" on
          mobile — capture is a hint, the OS decides which picker to show. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFilesSelected}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition ${theme.border.default} hover:bg-slate-50`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
          <Camera className="h-5 w-5 text-blue-600" />
        </span>
        <span className={`text-sm font-semibold ${theme.text.primary}`}>
          Add photos of your parking spot
        </span>
        <span className={`text-xs ${theme.text.muted}`}>
          Tap to take a photo or choose from your gallery
        </span>
      </button>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previewUrls.map((url, index) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden group">
              <img
                src={url}
                alt={`Parking spot photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Empty slot nudging the user toward the minimum count */}
          {remaining > 0 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={`flex aspect-square items-center justify-center rounded-lg border border-dashed ${theme.border.default} hover:bg-slate-50`}
            >
              <ImagePlus className="h-5 w-5 text-slate-400" />
            </button>
          )}
        </div>
      )}

      <p className={`text-xs ${error ? theme.text.error : theme.text.muted}`}>
        {error
          ? error
          : remaining > 0
            ? `Add at least ${remaining} more photo${remaining === 1 ? "" : "s"} (${files.length}/${MIN_PHOTOS_REQUIRED} minimum)`
            : `${files.length} photo${files.length === 1 ? "" : "s"} added`}
      </p>
    </div>
  );
}

export default PhotoUploader;