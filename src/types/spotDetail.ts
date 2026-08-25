import type { ParkingSpotSummary } from "./search";

export interface ParkingSpotDetail extends ParkingSpotSummary {
  images: string[];
  description: string;
  hostName: string;
  hostRating?: number;
  reviewCount?: number;
  availableFrom?: string; // e.g. "Available now" or an ISO time
}