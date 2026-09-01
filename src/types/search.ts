import type { AmenityId, SpotSize } from "./listing";

export type SpotStatus = "available" | "available_soon" | "booked";

export const STATUS_META: Record<
  SpotStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  available: {
    label: "Available",
    badgeClass: "bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  available_soon: {
    label: "Available for short period",
    badgeClass: "bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
  },
  booked: {
    label: "Booked",
    badgeClass: "bg-slate-100 text-slate-500",
    dotClass: "bg-slate-400",
  },
};

export const ALL_STATUSES = Object.keys(STATUS_META) as SpotStatus[];

// Hourly is always required; the longer-term rates are optional since not
// every host offers weekly/monthly rentals.
export interface RentalPricing {
  hourly: number;
  daily?: number;
  weekly?: number;
  monthly?: number;
}

export interface ParkingSpotSummary {
  id: string;
  title: string;
  address: string;
  distanceKm: number;
  pricing: RentalPricing;
  imageUrl: string;
  amenities: AmenityId[];
  spotSize: SpotSize;
  status: SpotStatus;
  rating?: number;
}

export interface SearchFilters {
  amenities: AmenityId[];
  radiusKm: number;
  minPricePerHour: number;
  maxPricePerHour: number;
  durationHours: number;
  statuses: SpotStatus[];
}

export const FILTER_BOUNDS = {
  radiusKm: { min: 1, max: 20, step: 1, default: 5 },
  price: { min: 0, max: 500, step: 10 }, // ₹ per hour
  durationHours: { min: 1, max: 24, step: 1, default: 2 },
};

export const DEFAULT_FILTERS: SearchFilters = {
  amenities: [],
  radiusKm: FILTER_BOUNDS.radiusKm.default,
  minPricePerHour: FILTER_BOUNDS.price.min,
  maxPricePerHour: FILTER_BOUNDS.price.max,
  durationHours: FILTER_BOUNDS.durationHours.default,
  statuses: ALL_STATUSES,
};

export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.amenities.length > 0) count += 1;
  if (filters.radiusKm !== FILTER_BOUNDS.radiusKm.default) count += 1;
  if (
    filters.minPricePerHour !== FILTER_BOUNDS.price.min ||
    filters.maxPricePerHour !== FILTER_BOUNDS.price.max
  )
    count += 1;
  if (filters.durationHours !== FILTER_BOUNDS.durationHours.default) count += 1;
  if (filters.statuses.length !== ALL_STATUSES.length) count += 1;
  return count;
}