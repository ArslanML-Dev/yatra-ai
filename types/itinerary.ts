import type { TimeOfDaySuitability } from "./place";
import type { UserPreferences } from "./user-preferences";

export interface ItinerarySlot {
  id: string;
  timeOfDay: TimeOfDaySuitability;
  placeId: string;
  note?: string;
  locked?: boolean;
  /** Mutually exclusive with `skipped` — enforced by the reducer
   * (MARK_VISITED/MARK_SKIPPED/ADVANCE_TO_NEXT_STOP), never left for a
   * caller or the UI to maintain. */
  visited?: boolean;
  skipped?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  theme?: string;
  clusterId: string;
  slots: ItinerarySlot[];
}

export interface Itinerary {
  destinationId: string;
  preferences: UserPreferences;
  days: ItineraryDay[];
  generatedAt: string;
  disclaimer: string;
}
