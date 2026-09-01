/**
 * Design tokens for ParkingO.
 *
 * IMPORTANT: values here are always COMPLETE Tailwind class strings
 * (e.g. "text-blue-600"), never bare tokens (e.g. "blue-600") that get
 * concatenated at runtime. Tailwind's compiler scans source files for
 * literal class-name strings at build time — it can't execute
 * `` `text-${theme.colors.primary}` `` — so anything assembled from a
 * fragment like that gets silently purged from the production build.
 * Keeping full strings here means they're greppable in this file and
 * safe under Tailwind's JIT scanner.
 */
export const theme = {
  raw: {
    primary: "#2563eb", // blue-600
    primaryHover: "#1d4ed8", // blue-700
    primaryActive: "#1e40af", // blue-800
  },

  text: {
    primary: "text-slate-950",
    secondary: "text-slate-500",
    muted: "text-slate-400",
    link: "text-blue-600 hover:text-blue-700",
    error: "text-red-500",
  },

  surface: {
    page: "bg-white",
    subtle: "bg-slate-50",
  },

  border: {
    default: "border-slate-300",
    error: "border-red-400",
    focus: "focus:border-blue-600",
    focusError: "focus:border-red-500",
  },

  ring: {
    focus: "focus:ring-blue-600",
    focusError: "focus:ring-red-500",
  },

  divider: "bg-slate-200",

  button: {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-600",
    secondary:
      "bg-white text-slate-950 border border-slate-300 hover:bg-slate-50 focus:ring-blue-600",
    destructive:
      "bg-white text-red-600 border border-red-200 hover:bg-red-50 active:bg-red-100 focus:ring-red-500",
    destructiveSolid:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500",
  },
} as const;