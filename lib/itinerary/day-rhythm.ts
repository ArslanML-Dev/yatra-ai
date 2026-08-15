import type { MealSlot, TimeOfDaySuitability } from "@/types/place";
import type { Pace } from "@/types/user-preferences";

/**
 * A day-rhythm phase is a finer-grained slot than the display-level
 * TimeOfDaySuitability bucket — it's what lets the engine reason about
 * "this is the lunch phase" separately from "this is just an afternoon
 * activity", without changing the ItinerarySlot.timeOfDay type the rest
 * of the app already reads.
 */
export type RhythmPhase =
  | "breakfast"
  | "morning"
  | "lunch"
  | "afternoon"
  | "leisure"
  | "evening"
  | "dinner";

export const MEAL_PHASES: RhythmPhase[] = ["breakfast", "lunch", "dinner"];

/**
 * How many rhythm phases a day carries, by pace. A relaxed day
 * deliberately has fewer, longer phases; a packed day has the full
 * breakfast-through-dinner arc. This replaces the old flat 3/4-slot
 * count — the point isn't "fill every slot", it's "a day a real
 * traveler would recognize".
 */
export const RHYTHM_BY_PACE: Record<Pace, RhythmPhase[]> = {
  relaxed: ["breakfast", "morning", "lunch", "afternoon", "dinner"],
  moderate: ["breakfast", "morning", "lunch", "afternoon", "leisure", "dinner"],
  packed: ["breakfast", "morning", "lunch", "afternoon", "leisure", "evening", "dinner"],
};

/**
 * Maps each rhythm phase back to the existing four-value
 * TimeOfDaySuitability, so ItinerarySlot.timeOfDay (and every component
 * that already reads it) keeps working unchanged.
 */
export const PHASE_TO_TIME_OF_DAY: Record<RhythmPhase, TimeOfDaySuitability> = {
  breakfast: "morning",
  morning: "morning",
  lunch: "afternoon",
  afternoon: "afternoon",
  leisure: "evening",
  evening: "evening",
  dinner: "night",
};

/**
 * A representative clock hour per phase — used only as an internal
 * heuristic to check a candidate's sourced openingHours against, never
 * shown to the user as a precise scheduled time (the UI still shows
 * "Approximate timing" throughout).
 */
export const PHASE_REPRESENTATIVE_HOUR: Record<RhythmPhase, number> = {
  breakfast: 8,
  morning: 10.5,
  lunch: 13,
  afternoon: 15.5,
  leisure: 17,
  evening: 18.5,
  dinner: 20,
};

export function isMealPhase(phase: RhythmPhase): phase is Extract<RhythmPhase, MealSlot> {
  return MEAL_PHASES.includes(phase);
}
