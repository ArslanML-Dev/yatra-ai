import type { Itinerary } from "@/types/itinerary";
import type { UserPreferences } from "@/types/user-preferences";

/**
 * Seam between the planner UI and whatever does natural-language
 * understanding. RuleBasedAIProvider implements this with deterministic
 * regex/keyword parsing today; a real LLM-backed implementation can be
 * dropped in later with the same method signature.
 */
export interface AIProvider {
  parsePreferences(rawText: string, defaults?: Partial<UserPreferences>): UserPreferences;
  explainItinerary?(itinerary: Itinerary): string;
}
