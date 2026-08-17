import type { TimeOfDaySuitability } from "./place";
import type { RhythmPhase } from "@/lib/itinerary/day-rhythm";
import type { UserPreferences } from "./user-preferences";

export interface ItinerarySlot {
  id: string;
  timeOfDay: TimeOfDaySuitability;
  /** The day-rhythm phase this slot fills (breakfast/lunch/dinner/etc) —
   * set by assignSlots, optional only because slots created before this
   * field existed (or by paths that bypass day-rhythm entirely) won't
   * have it. Lets meal-coverage backfill know exactly which meal a slot
   * represents instead of reverse-guessing from timeOfDay, since two
   * phases (e.g. breakfast/morning) can share the same timeOfDay. */
  phase?: RhythmPhase;
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
