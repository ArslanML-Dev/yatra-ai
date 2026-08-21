import type { PlaceCategory } from "./place";

/** Hard ceiling on trip length, enforced everywhere `days` can enter the
 * system (the day-selector UI and the itinerary-page query parser) so
 * the two can't silently drift apart. */
export const MAX_TRIP_DAYS = 15;

export type GroupType = "solo" | "couple" | "family" | "friends" | "business";
export type Pace = "relaxed" | "moderate" | "packed";
export type ParseConfidence = "high" | "medium" | "low";
export type WalkingTolerance = "minimal" | "moderate" | "high";

export interface Budget {
  amount: number;
  currency: "INR";
}

export interface FoodPreferences {
  dietary?: "veg" | "non-veg" | "no-preference";
  spiceTolerance?: "mild" | "medium" | "spicy";
}

export interface UserPreferences {
  destinationId: string;
  days: number;
  group: GroupType;
  interests: PlaceCategory[];
  pace: Pace;
  budget: Budget | null;
  rawText?: string;
  confidence: ParseConfidence;
  unresolvedFields: string[];
  /**
   * State only as of Phase 4 — carried through parsing/updates, stored
   * on the trip's preferences, but not read by the itinerary engine
   * (lib/itinerary/* is frozen this phase). Do not treat these as
   * functional itinerary controls until a later phase actually
   * consumes them.
   */
  walkingTolerance?: WalkingTolerance;
  foodPreferences?: FoodPreferences;
}
