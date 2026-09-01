import { forwardRef } from "react";
import { theme } from "../theme/theme";

type ButtonVariant = "primary" | "secondary" | "destructive" | "destructiveSolid";
type ButtonSize = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "h-12 px-4 text-sm gap-2",
  sm: "h-9 px-3.5 text-xs gap-1.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      type = "button",
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = true,
      disabled,
      className = "",
      ...rest
    },
    ref
  ) => {
    const base =
      "rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center justify-center";

    const variantClass = theme.button[variant];
    const sizeClass = SIZE_CLASSES[size];
    const spinnerSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${base} ${sizeClass} ${variantClass} ${fullWidth ? "w-full" : ""} ${className}`}
        {...rest}
      >
        {isLoading && (
          <svg
            className={`${spinnerSize} animate-spin`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;