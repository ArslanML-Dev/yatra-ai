import type { Place, PlaceCategory } from "@/types/place";
import type { ItinerarySlot } from "@/types/itinerary";
import type { Pace } from "@/types/user-preferences";
import { haversineDistanceKm } from "@/lib/geo/distance";
import { CATEGORY_REPETITION_TOLERANCE } from "./scoring";
import {
  MEAL_PHASES,
  PHASE_REPRESENTATIVE_HOUR,
  PHASE_TO_TIME_OF_DAY,
  RHYTHM_BY_PACE,
  type RhythmPhase,
} from "./day-rhythm";

const MEAL_MATCH_BONUS = 50;
const MEAL_CATEGORY_FALLBACK_BONUS = 5;
const TIME_OF_DAY_MATCH_BONUS = 3;
const PROXIMITY_BONUS_CAP_KM = 10;
const OPENING_HOURS_PENALTY = 40;

/**
 * Experience-redundancy penalty: one uniform value applied whenever a
 * candidate shares a `subcategory` with something already placed today
 * (e.g. two "mall" entries) — distinct from, and stricter than, the
 * category-level tolerance in scoring.ts, which only discourages
 * repeated broad categories. `anchor`-tagged places are exempt (see
 * scoreForPhase) because that tag is real curated evidence a place is
 * independently distinctive, not interchangeable with a same-subcategory
 * peer — this is why two anchor imambaras still coexist normally while
 * two non-anchor malls don't.
 */
const SUBCATEGORY_REPEAT_PENALTY = 35;

/**
 * A phase's winning candidate must clear this net score to be included
 * at all. When every remaining candidate for a phase is experientially
 * redundant (or otherwise heavily penalized) and nothing clears the bar,
 * the day is left shorter rather than padded with a poor repeat — an
 * honest gap beats a forced stop. Locked places are always exempt (see
 * assignSlots) since a user's explicit choice is never rejected for
 * scoring low.
 */
const MIN_INCLUSION_SCORE = 0;

function createSlotId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Scores one candidate for one specific rhythm phase, combining:
 *  - its pre-computed base rank (from the incoming score-sorted order)
 *  - a strong bonus for actually being the right meal (breakfast/lunch/
 *    dinner) anchor, a smaller one for merely being food-category during
 *    a meal phase, so a day never forces a fake meal stop when no real
 *    food candidate exists in the cluster
 *  - a bonus for matching the legacy suitableTimesOfDay bucket
 *  - the category-repetition-tolerance decay (see scoring.ts) — the same
 *    one formula for every category, only the tolerance constant differs
 *  - a subcategory experience-redundancy penalty for non-anchor places
 *    repeating an already-used subcategory (see SUBCATEGORY_REPEAT_PENALTY)
 *  - a geographic-continuity bonus toward whatever was placed last, which
 *    is what actually produces greedy-nearest-next ordering rather than
 *    relying on cluster membership alone
 *  - an opening-hours penalty, applied only when the candidate has real
 *    sourced hours and skipped entirely for locked places, since a user's
 *    explicit choice is never penalized away
 */
function scoreForPhase(
  place: Place,
  phase: RhythmPhase,
  baseRank: number,
  categoryCountsToday: Map<PlaceCategory, number>,
  subcategoryCountsToday: Map<string, number>,
  lastPlaced: Place | undefined,
  locked: boolean,
): number {
  let score = baseRank;

  if (MEAL_PHASES.includes(phase)) {
    if (place.mealSlot === phase) score += MEAL_MATCH_BONUS;
    else if (place.category === "food") score += MEAL_CATEGORY_FALLBACK_BONUS;
  }

  const timeOfDay = PHASE_TO_TIME_OF_DAY[phase];
  if (place.suitableTimesOfDay.includes(timeOfDay)) score += TIME_OF_DAY_MATCH_BONUS;

  const tolerance = CATEGORY_REPETITION_TOLERANCE[place.category] ?? 1;
  const countSoFar = categoryCountsToday.get(place.category) ?? 0;
  score *= Math.pow(tolerance, countSoFar);

  const isAnchor = place.tags.includes("anchor");
  if (!isAnchor && place.subcategory && (subcategoryCountsToday.get(place.subcategory) ?? 0) > 0) {
    score -= SUBCATEGORY_REPEAT_PENALTY;
  }

  if (lastPlaced) {
    const distanceKm = haversineDistanceKm(lastPlaced.coordinates, place.coordinates);
    score += Math.max(0, PROXIMITY_BONUS_CAP_KM - distanceKm);
  }

  if (!locked && place.openingHours?.opensHour !== undefined && place.openingHours?.closesHour !== undefined) {
    const representativeHour = PHASE_REPRESENTATIVE_HOUR[phase];
    if (representativeHour < place.openingHours.opensHour || representativeHour > place.openingHours.closesHour) {
      score -= OPENING_HOURS_PENALTY;
    }
  }

  return score;
}

/**
 * Assigns places to a day's rhythm phases (breakfast through dinner,
 * scaled by pace — see day-rhythm.ts). For each phase in order, picks
 * the highest-scoring unused candidate (see scoreForPhase) rather than a
 * static pre-sorted pick, so meal anchoring, category diversity,
 * geographic continuity and opening hours all genuinely influence
 * placement — not just a single upfront sort. Falls back gracefully
 * when a cluster is too small to fill every phase: a day is never
 * padded with a fake stop, and never forces a fake meal when no food
 * candidate exists.
 *
 * Locked candidates are guaranteed a slot: if capacity would otherwise
 * exclude one, it bumps the lowest-priority unlocked pick rather than
 * being silently dropped (a user's explicit choice always wins — see
 * generate-itinerary.ts's guaranteeLockedPlacement for the cross-day
 * backstop). Locked candidates are also exempt from the minimum-
 * inclusion floor below — an explicit choice is never rejected for
 * scoring low.
 *
 * A phase is left empty, rather than filled with the least-bad option,
 * when nothing remaining clears MIN_INCLUSION_SCORE — e.g. when the
 * only candidates left are experientially redundant with something
 * already placed today (see SUBCATEGORY_REPEAT_PENALTY). A shorter,
 * honest day beats a padded one.
 */
export function assignSlots(
  candidates: Place[],
  pace: Pace,
  lockedPlaceIds: string[] = [],
): ItinerarySlot[] {
  const phases = RHYTHM_BY_PACE[pace];
  const baseRank = new Map(candidates.map((p, i) => [p.id, candidates.length - i]));
  const categoryCountsToday = new Map<PlaceCategory, number>();
  const subcategoryCountsToday = new Map<string, number>();
  const used = new Set<string>();
  const slots: ItinerarySlot[] = [];
  let lastPlaced: Place | undefined;

  for (const phase of phases) {
    let best: Place | undefined;
    let bestScore = -Infinity;

    for (const place of candidates) {
      if (used.has(place.id)) continue;
      const score = scoreForPhase(
        place,
        phase,
        baseRank.get(place.id) ?? 0,
        categoryCountsToday,
        subcategoryCountsToday,
        lastPlaced,
        lockedPlaceIds.includes(place.id),
      );
      if (score > bestScore) {
        bestScore = score;
        best = place;
      }
    }

    if (!best) continue;

    const bestIsLocked = lockedPlaceIds.includes(best.id);
    if (!bestIsLocked && bestScore < MIN_INCLUSION_SCORE) continue;

    used.add(best.id);
    categoryCountsToday.set(best.category, (categoryCountsToday.get(best.category) ?? 0) + 1);
    if (best.subcategory) {
      subcategoryCountsToday.set(best.subcategory, (subcategoryCountsToday.get(best.subcategory) ?? 0) + 1);
    }
    lastPlaced = best;

    slots.push({
      id: createSlotId(),
      timeOfDay: PHASE_TO_TIME_OF_DAY[phase],
      placeId: best.id,
      note: best.bestTime ?? "Approximate timing — allow extra time to enjoy each stop",
      locked: lockedPlaceIds.includes(best.id),
    });
  }

  const unplacedLocked = candidates.filter(
    (p) => lockedPlaceIds.includes(p.id) && !used.has(p.id),
  );

  for (const place of unplacedLocked) {
    let victimIndex = -1;
    for (let i = slots.length - 1; i >= 0; i--) {
      if (!slots[i].locked) {
        victimIndex = i;
        break;
      }
    }

    const newSlot: ItinerarySlot = {
      id: createSlotId(),
      timeOfDay: place.suitableTimesOfDay[0] ?? "morning",
      placeId: place.id,
      note: place.bestTime ?? "Approximate timing — allow extra time to enjoy each stop",
      locked: true,
    };

    if (victimIndex >= 0) {
      used.delete(slots[victimIndex].placeId);
      slots[victimIndex] = newSlot;
    } else {
      slots.push(newSlot);
    }
    used.add(place.id);
  }

  return slots;
}
