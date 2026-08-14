import type { TimeOfDaySuitability } from "./place";
import type { UserPreferences } from "./user-preferences";

export interface ItinerarySlot {
  timeOfDay: TimeOfDaySuitability;
  placeId: string;
  note?: string;
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
