import type { Place } from "@/types/place";
import type { UserPreferences } from "@/types/user-preferences";

const ANCHOR_HERITAGE_TAGS = ["anchor"];

export function scorePlace(place: Place, preferences: UserPreferences): number {
  let score = 0;

  const interestTags = new Set<string>(preferences.interests);
  const interestMatches = place.tags.filter((tag) => interestTags.has(tag)).length;
  if (interestTags.has(place.category)) score += 2;
  score += interestMatches;

  if (preferences.group === "family" && place.tags.includes("family-friendly")) score += 2;

  if (preferences.pace === "packed" && place.estimatedVisitMinutes < 60) score += 1;
  if (preferences.pace === "relaxed" && place.estimatedVisitMinutes > 90) score += 1;

  if (place.tags.some((tag) => ANCHOR_HERITAGE_TAGS.includes(tag))) score += 3;

  return score;
}

/**
 * Selects the candidate pool for itinerary generation: places matching the
 * user's interests, plus a small always-included anchor set (major
 * landmarks a first-time visitor expects) unless the user explicitly
 * excluded heritage from their interests.
 */
const DEFAULT_BALANCED_CATEGORIES = new Set(["heritage", "food", "parks", "shopping"]);

export function selectCandidates(places: Place[], preferences: UserPreferences): Place[] {
  const hasExplicitInterests = preferences.interests.length > 0;
  const interestSet = new Set<string>(preferences.interests);

  const matching = hasExplicitInterests
    ? places.filter((p) => interestSet.has(p.category))
    : places.filter((p) => DEFAULT_BALANCED_CATEGORIES.has(p.category));

  const excludedHeritage = hasExplicitInterests && !preferences.interests.includes("heritage");
  const anchors = excludedHeritage
    ? []
    : places.filter((p) => p.tags.includes("anchor") && !matching.includes(p));

  const pool = [...matching, ...anchors];
  return Array.from(new Set(pool));
}

export function sortByScoreDesc(places: Place[], preferences: UserPreferences): Place[] {
  return [...places].sort((a, b) => {
    const diff = scorePlace(b, preferences) - scorePlace(a, preferences);
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });
}
