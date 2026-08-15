import type { UserPreferences } from "@/types/user-preferences";

/**
 * Serializes preferences into the exact query-string contract
 * app/plan/itinerary/page.tsx reads — the one shared function behind
 * every path that starts a trip via that route, so PlannerForm's
 * structured/free-text flow and the Travel Agent's chat-creation flow
 * both run through the same generateItinerary pipeline, never a
 * parallel one.
 */
export function buildItineraryQueryString(
  preferences: UserPreferences,
  lockedPlaceIds: string[] = [],
): string {
  const params = new URLSearchParams({
    days: String(preferences.days),
    group: preferences.group,
    interests: preferences.interests.join(","),
    pace: preferences.pace,
  });
  if (preferences.budget) params.set("budget", String(preferences.budget.amount));
  if (lockedPlaceIds.length > 0) params.set("locked", lockedPlaceIds.join(","));
  return params.toString();
}
