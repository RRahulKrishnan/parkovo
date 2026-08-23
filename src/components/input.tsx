import { useId, useState } from "react";
import { theme } from "../theme/theme";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  id?: string;
  label: string;
  error?: string;
}

function Input({
  id,
  label,
  type = "text",
  error,
  className = "",
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && show ? "text" : type;

  return (
    <div>
      <label
        htmlFor={inputId}
        className={`block mb-2 text-sm font-medium ${theme.text.primary}`}
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`w-full h-12 px-4 ${isPassword ? "pr-14" : ""} rounded-lg border ${
            theme.surface.page
          } ${theme.text.primary} placeholder:text-slate-400 outline-none transition focus:ring-1 ${
            error
              ? `${theme.border.error} ${theme.border.focusError} ${theme.ring.focusError}`
              : `${theme.border.default} ${theme.border.focus} ${theme.ring.focus}`
          } ${className}`}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 hover:text-slate-600 transition"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className={`mt-1.5 text-sm ${theme.text.error}`}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;