import type { Itinerary } from "@/types/itinerary";
import type { UserPreferences } from "@/types/user-preferences";
import { parsePreferences } from "@/lib/nlu/parse-preferences";
import type { AIProvider } from "./ai-provider";

export class RuleBasedAIProvider implements AIProvider {
  parsePreferences(rawText: string, defaults?: Partial<UserPreferences>): UserPreferences {
    return parsePreferences(rawText, defaults);
  }

  explainItinerary(itinerary: Itinerary): string {
    const dayCount = itinerary.days.length;
    const interestList = itinerary.preferences.interests.join(", ") || "a balanced mix";
    return `A ${dayCount}-day plan for ${itinerary.preferences.group}, built around ${interestList}, at a ${itinerary.preferences.pace} pace.`;
  }
}

export const ruleBasedAIProvider = new RuleBasedAIProvider();
