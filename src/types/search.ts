import type { AmenityId, SpotSize } from "./listing";

export interface ParkingSpotSummary {
  id: string;
  title: string;
  address: string;
  distanceKm: number;
  pricePerHour: number;
  imageUrl: string;
  amenities: AmenityId[];
  spotSize: SpotSize;
  rating?: number;
}

export interface SearchFilters {
  amenities: AmenityId[];
  radiusKm: number;
  minPricePerHour: number;
  maxPricePerHour: number;
  durationHours: number;
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
  return count;
}