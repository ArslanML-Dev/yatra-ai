import type { Coordinates } from "./place";

/**
 * Deliberately not a Place — practical POIs (nearest ATM, nearest
 * hospital) don't carry curated-tourism fields like whyVisit or
 * historicalContext, and never will. Kept as its own minimal shape so a
 * live/uncurated data source is never forced into the curated-content
 * type and can't accidentally leak into itinerary generation, which
 * only ever reads Place.
 */
export type EssentialCategory = "hospital" | "pharmacy" | "atm" | "police" | "grocery" | "mall";

export interface EssentialPOI {
  id: string;
  name: string;
  category: EssentialCategory;
  coordinates: Coordinates;
  distanceKm: number;
  address?: string;
}
