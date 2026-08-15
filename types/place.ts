import type { DataType, VerificationStatus } from "./source";

export type PlaceCategory =
  | "heritage"
  | "food"
  | "shopping"
  | "parks"
  | "riverfront_evening"
  | "modern"
  | "transport";

export type TimeOfDaySuitability = "morning" | "afternoon" | "evening" | "night";

export type PriceRange = "free" | "₹" | "₹₹" | "₹₹₹" | "unknown";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ImageRef {
  url: string;
  alt: string;
  source: string;
  sourceUrl?: string;
  license?: string;
}

/** Structured hours, populated only where confidently sourceable from
 * multiple independent tourism sources — most places in this dataset
 * won't have this field, and that's the honest default, not a gap to
 * fill in with a guess. */
export interface OpeningHours {
  weekdayText: string[];
  note?: string;
}

export interface Place {
  id: string;
  destinationId: string;
  name: string;
  category: PlaceCategory;
  subcategory?: string;
  description: string;
  whyVisit: string;
  historicalContext?: string;
  bestTime?: string;
  openingHours?: OpeningHours;
  estimatedVisitMinutes: number;
  suitableTimesOfDay: TimeOfDaySuitability[];
  coordinates: Coordinates;
  address?: string;
  images: ImageRef[];
  priceRange?: PriceRange;
  knownFor?: string[];
  tags: string[];
  nearbyIds: string[];
  transportNote?: string;
  source: string;
  sourceUrl?: string;
  retrievedAt: string;
  verificationStatus: VerificationStatus;
  dataType: DataType;
}
