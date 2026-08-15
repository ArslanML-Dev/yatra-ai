import type { Place, PlaceCategory, PriceRange } from "@/types/place";
import type { UserPreferences } from "@/types/user-preferences";

const ANCHOR_HERITAGE_TAGS = ["anchor"];

/**
 * How gracefully a category tolerates repeating within a single day,
 * applied as `tolerance ^ countAlreadyPlacedToday` — a value near 1
 * barely decays (multiple food stops in a day is normal travel
 * behaviour), a value near 0 decays sharply (a second mall in the same
 * day almost never happens in real trip planning). One uniform formula;
 * only these constants are category-specific.
 */
export const CATEGORY_REPETITION_TOLERANCE: Record<PlaceCategory, number> = {
  modern: 0.35,
  shopping: 0.5,
  parks: 0.6,
  riverfront_evening: 0.6,
  heritage: 0.7,
  food: 0.8,
  transport: 1,
};

/** Guarantees a user-locked place always sorts before anything else. */
const LOCKED_PLACE_BONUS = 100;

/** Rough per-day budget below which premium-priced places are nudged down. */
const TIGHT_BUDGET_PER_DAY_INR = 1200;
const PREMIUM_PRICE_RANGES: PriceRange[] = ["₹₹₹"];

export function scorePlace(
  place: Place,
  preferences: UserPreferences,
  lockedPlaceIds: string[] = [],
): number {
  let score = 0;

  if (lockedPlaceIds.includes(place.id)) score += LOCKED_PLACE_BONUS;

  const interestTags = new Set<string>(preferences.interests);
  const interestMatches = place.tags.filter((tag) => interestTags.has(tag)).length;
  if (interestTags.has(place.category)) score += 2;
  score += interestMatches;

  if (preferences.group === "family" && place.tags.includes("family-friendly")) score += 2;

  if (preferences.pace === "packed" && place.estimatedVisitMinutes < 60) score += 1;
  if (preferences.pace === "relaxed" && place.estimatedVisitMinutes > 90) score += 1;

  if (place.tags.some((tag) => ANCHOR_HERITAGE_TAGS.includes(tag))) score += 3;

  if (preferences.budget && place.priceRange && PREMIUM_PRICE_RANGES.includes(place.priceRange)) {
    const perDay = preferences.budget.amount / Math.max(1, preferences.days);
    if (perDay < TIGHT_BUDGET_PER_DAY_INR) score -= 1;
  }

  return score;
}

/**
 * Selects the candidate pool for itinerary generation: places matching the
 * user's interests, plus a small always-included anchor set (major
 * landmarks a first-time visitor expects) unless the user explicitly
 * excluded heritage from their interests.
 */
const DEFAULT_BALANCED_CATEGORIES = new Set(["heritage", "food", "parks", "shopping"]);

/**
 * Selects the candidate pool for itinerary generation: places matching the
 * user's interests, a small always-included heritage-anchor safety net
 * (major landmarks a first-time visitor expects, e.g. Bara Imambara),
 * and — critically — any explicitly locked places, which are included
 * unconditionally regardless of interest/category filtering. A user's
 * explicit choice must never be silently excluded for not matching their
 * stated interests.
 *
 * The anchor safety net is deliberately scoped to `category: "heritage"`
 * only — it exists so a heritage-interested trip never misses an iconic
 * landmark, not as a blanket bypass for every category. Earlier this also
 * let anchor-tagged places from *unrequested* categories (e.g. a park)
 * leak into unrelated trips; scoping it to heritage fixes that while
 * keeping the one legitimate fallback reason intact.
 */
export function selectCandidates(
  places: Place[],
  preferences: UserPreferences,
  lockedPlaceIds: string[] = [],
): Place[] {
  const hasExplicitInterests = preferences.interests.length > 0;
  const interestSet = new Set<string>(preferences.interests);

  const matching = hasExplicitInterests
    ? places.filter((p) => interestSet.has(p.category))
    : places.filter((p) => DEFAULT_BALANCED_CATEGORIES.has(p.category));

  const excludedHeritage = hasExplicitInterests && !preferences.interests.includes("heritage");
  const anchors = excludedHeritage
    ? []
    : places.filter(
        (p) => p.category === "heritage" && p.tags.includes("anchor") && !matching.includes(p),
      );

  const locked = places.filter((p) => lockedPlaceIds.includes(p.id));

  const pool = [...matching, ...anchors, ...locked];
  return Array.from(new Set(pool));
}

export function sortByScoreDesc(
  places: Place[],
  preferences: UserPreferences,
  lockedPlaceIds: string[] = [],
): Place[] {
  return [...places].sort((a, b) => {
    const diff =
      scorePlace(b, preferences, lockedPlaceIds) - scorePlace(a, preferences, lockedPlaceIds);
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });
}
