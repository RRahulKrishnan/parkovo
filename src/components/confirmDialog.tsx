import { X } from "lucide-react";
import Button from "./button";
import { theme } from "../theme/theme";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  isLoading = false,
  destructive = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className={`relative w-full max-w-sm rounded-2xl border ${theme.border.default} bg-white p-6 shadow-xl`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          disabled={isLoading}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-60"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 id="confirm-dialog-title" className={`pr-10 text-lg font-bold ${theme.text.primary}`}>
          {title}
        </h3>
        <p className={`mt-2 text-sm ${theme.text.secondary}`}>{description}</p>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructiveSolid" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;