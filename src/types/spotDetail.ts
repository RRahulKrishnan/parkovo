import type { ParkingSpotSummary } from "./search";

export interface ParkingSpotDetail extends ParkingSpotSummary {
  images: string[];
  description: string;
  howToGetThere: string;
  hostName: string;
  hostRating?: number;
  reviewCount?: number;
  availableFrom?: string;
}