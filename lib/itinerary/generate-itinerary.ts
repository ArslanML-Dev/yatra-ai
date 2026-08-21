import type { Place } from "@/types/place";
import type { Itinerary, ItineraryDay, ItinerarySlot } from "@/types/itinerary";
import type { Pace, UserPreferences } from "@/types/user-preferences";
import { haversineDistanceKm } from "@/lib/geo/distance";
import { selectCandidates, sortByScoreDesc } from "./scoring";
import { clusterPlaces, type PlaceCluster } from "./cluster-places";
import { assignSlots } from "./slot-rules";
import { MEAL_PHASES, PHASE_TO_TIME_OF_DAY, RHYTHM_BY_PACE, type RhythmPhase } from "./day-rhythm";

const LEISURE_DAY_THEME = "Leisure day — revisit a favourite area at your own pace";

interface GenerateItineraryOptions {
  lockedPlaceIds?: string[];
}

function createSlotId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildDay(
  dayNumber: number,
  cluster: PlaceCluster,
  usedPlaceIds: Set<string>,
  preferences: UserPreferences,
  lockedPlaceIds: string[],
): ItineraryDay {
  const fresh = cluster.places.filter((p) => !usedPlaceIds.has(p.id));
  const slots = assignSlots(fresh, preferences.pace, lockedPlaceIds);
  slots.forEach((slot) => usedPlaceIds.add(slot.placeId));

  return {
    dayNumber,
    theme: cluster.label,
    clusterId: cluster.id,
    slots,
  };
}

function buildLeisureDay(dayNumber: number): ItineraryDay {
  return {
    dayNumber,
    theme: LEISURE_DAY_THEME,
    clusterId: "leisure",
    slots: [],
  };
}

/**
 * After the main day-building loop, guarantees every locked place made it
 * into the trip — even if its natural cluster fell outside the requested
 * trip length. Finds the geographically nearest day (by distance to that
 * day's existing stops) and inserts the place there, bumping that day's
 * lowest-priority unlocked stop if it's already at capacity. A user's
 * explicit choice is never silently dropped for being "too far" or "too
 * late" — see constraint in the itinerary plan.
 */
function guaranteeLockedPlacement(
  days: ItineraryDay[],
  allPlaces: Place[],
  lockedPlaceIds: string[],
  usedPlaceIds: Set<string>,
): void {
  const placesById = new Map(allPlaces.map((p) => [p.id, p]));
  const daysWithSlots = days.filter((d) => d.slots.length > 0);
  if (daysWithSlots.length === 0) return;

  for (const placeId of lockedPlaceIds) {
    if (usedPlaceIds.has(placeId)) continue;
    const place = placesById.get(placeId);
    if (!place) continue;

    let nearestDay = daysWithSlots[0];
    let nearestDistance = Infinity;
    for (const day of daysWithSlots) {
      for (const slot of day.slots) {
        const slotPlace = placesById.get(slot.placeId);
        if (!slotPlace) continue;
        const distance = haversineDistanceKm(place.coordinates, slotPlace.coordinates);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestDay = day;
        }
      }
    }

    const newSlot: ItinerarySlot = {
      id: createSlotId(),
      timeOfDay: place.suitableTimesOfDay[0] ?? "morning",
      placeId: place.id,
      note: place.bestTime ?? "Approximate timing — allow extra time to enjoy each stop",
      locked: true,
    };

    const victimIndex = nearestDay.slots.findIndex((s) => !s.locked);
    if (victimIndex >= 0) {
      nearestDay.slots[victimIndex] = newSlot;
    } else {
      nearestDay.slots.push(newSlot);
    }
    usedPlaceIds.add(place.id);
  }
}

/** Which of a day's required meal phases (per its pace's rhythm) don't
 * yet have a real food-category stop filling them — checked via each
 * slot's `phase` field (set by assignSlots), not `timeOfDay`, since two
 * phases can share a timeOfDay (e.g. breakfast and morning both map to
 * "morning"). */
function computeMissingMealPhases(
  day: ItineraryDay,
  placesById: Map<string, Place>,
  pace: Pace,
): RhythmPhase[] {
  const required = RHYTHM_BY_PACE[pace].filter((phase) => MEAL_PHASES.includes(phase));
  const covered = new Set(
    day.slots
      .filter(
        (slot) =>
          slot.phase &&
          MEAL_PHASES.includes(slot.phase) &&
          placesById.get(slot.placeId)?.category === "food",
      )
      .map((slot) => slot.phase as RhythmPhase),
  );
  return required.filter((phase) => !covered.has(phase));
}

/** Nearest-to-the-day's-existing-stops pick from a candidate list —
 * shared by every tier in pickBestFoodMatch below. Falls back to the
 * tier's first entry only if none of the day's stops resolve to a real
 * place (defensive; shouldn't happen for a day with any slots). */
function nearestByDistance(
  candidates: Place[],
  day: ItineraryDay,
  placesById: Map<string, Place>,
): Place | undefined {
  let best: Place | undefined;
  let bestDistance = Infinity;
  for (const place of candidates) {
    for (const slot of day.slots) {
      const slotPlace = placesById.get(slot.placeId);
      if (!slotPlace) continue;
      const distance = haversineDistanceKm(place.coordinates, slotPlace.coordinates);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = place;
      }
    }
  }
  return best ?? candidates[0];
}

/** Picks the best unused food place for one specific missing meal phase:
 * an exact `mealSlot` match first, then a place with no `mealSlot` at
 * all, then any remaining (mismatched) food place — only falling
 * through a tier when it's genuinely empty, and breaking ties within a
 * tier by distance to the day's existing stops. */
function pickBestFoodMatch(
  phase: RhythmPhase,
  day: ItineraryDay,
  pool: Place[],
  placesById: Map<string, Place>,
): Place | undefined {
  const tiers = [pool.filter((p) => p.mealSlot === phase), pool.filter((p) => !p.mealSlot), pool];
  for (const tier of tiers) {
    if (tier.length === 0) continue;
    const match = nearestByDistance(tier, day, placesById);
    if (match) return match;
  }
  return undefined;
}

/**
 * After the main day-building loop, guarantees every day that has any
 * stops at all gets sensible meal coverage — not just "one food place
 * somewhere", but a real backfill of whichever breakfast/lunch/dinner
 * phases its pace's rhythm calls for and its own cluster didn't
 * naturally supply. Clustering is purely geographic (see
 * cluster-places.ts), so a day's cluster can end up with zero, one, or
 * several food candidates purely by chance of geography. Eating isn't
 * an optional "interest" the way shopping or parks are, so this runs
 * regardless of the user's selected interests — unless they explicitly
 * deselected food, which is treated the same as the heritage-anchor
 * safety net in scoring.ts: an explicit exclusion is always honored,
 * never silently overridden.
 *
 * Assigns in breadth-first rounds across days (every day's first missing
 * phase, then every day's second, …) from one shared pool of unused food
 * places, rather than looping day-by-day — a single day's backfill can
 * no longer exhaust the dataset before other days get a turn. Each
 * day's victim slots (which existing unlocked stops get bumped) are
 * chosen once, up front, from the day's original slots — never a
 * freshly-inserted meal slot from an earlier round in this same pass, so
 * adding lunch can never silently overwrite the breakfast just added.
 * Leaves a phase unfilled — an honest gap — if the shared pool runs out.
 */
function guaranteeMealCoverage(
  days: ItineraryDay[],
  allPlaces: Place[],
  preferences: UserPreferences,
  usedPlaceIds: Set<string>,
): void {
  const hasExplicitInterests = preferences.interests.length > 0;
  const excludedFood = hasExplicitInterests && !preferences.interests.includes("food");
  if (excludedFood) return;

  const placesById = new Map(allPlaces.map((p) => [p.id, p]));

  const tasks = days
    .filter((day) => day.slots.length > 0)
    .map((day) => {
      const missing = computeMissingMealPhases(day, placesById, preferences.pace);
      // Each missing phase's victim is the slot already labeled with that
      // exact phase (it's occupying the meal's rightful position with a
      // non-food place) — never a different, already-correct phase's slot
      // grabbed just because it's near the end of the array. When the day
      // has no slot for that phase at all (e.g. a short day with no
      // dinner slot), push a new one instead of stealing another phase's.
      const victimIndices: (number | undefined)[] = missing.map((phase) => {
        const idx = day.slots.findIndex((s) => s.phase === phase && !s.locked);
        return idx >= 0 ? idx : undefined;
      });
      return { day, missing, victimIndices };
    })
    .filter((task) => task.missing.length > 0);

  if (tasks.length === 0) return;

  let pool = allPlaces.filter((p) => p.category === "food" && !usedPlaceIds.has(p.id));
  const maxMissing = Math.max(...tasks.map((task) => task.missing.length));

  for (let round = 0; round < maxMissing; round++) {
    for (const task of tasks) {
      const phase = task.missing[round];
      if (!phase || pool.length === 0) continue;

      const picked = pickBestFoodMatch(phase, task.day, pool, placesById);
      if (!picked) continue;

      const newSlot: ItinerarySlot = {
        id: createSlotId(),
        timeOfDay: PHASE_TO_TIME_OF_DAY[phase],
        phase,
        placeId: picked.id,
        note: picked.bestTime ?? "Approximate timing — allow extra time to enjoy each stop",
        locked: false,
      };

      const victimIndex = task.victimIndices[round];
      if (victimIndex !== undefined) {
        usedPlaceIds.delete(task.day.slots[victimIndex].placeId);
        task.day.slots[victimIndex] = newSlot;
      } else {
        task.day.slots.push(newSlot);
      }

      usedPlaceIds.add(picked.id);
      pool = pool.filter((p) => p.id !== picked.id);
    }
  }
}

export function generateItinerary(
  allPlaces: Place[],
  preferences: UserPreferences,
  options: GenerateItineraryOptions = {},
): Itinerary {
  const lockedPlaceIds = options.lockedPlaceIds ?? [];

  const candidates = selectCandidates(allPlaces, preferences, lockedPlaceIds);
  const sorted = sortByScoreDesc(candidates, preferences, lockedPlaceIds);
  const clusters = clusterPlaces(sorted);

  // Clusters containing a locked place must be reachable within the
  // requested trip length even if they'd otherwise rank behind a denser
  // cluster — a locked place always wins over pure cluster density.
  const lockedClusters = clusters.filter((c) =>
    c.places.some((p) => lockedPlaceIds.includes(p.id)),
  );
  const otherClusters = clusters.filter(
    (c) => !c.places.some((p) => lockedPlaceIds.includes(p.id)),
  );
  const orderedClusters = [...lockedClusters, ...otherClusters];

  const usedPlaceIds = new Set<string>();
  const days: ItineraryDay[] = [];
  let dataRanOut = false;

  for (let dayNumber = 1; dayNumber <= preferences.days; dayNumber++) {
    if (dayNumber <= orderedClusters.length) {
      days.push(
        buildDay(dayNumber, orderedClusters[dayNumber - 1], usedPlaceIds, preferences, lockedPlaceIds),
      );
      continue;
    }

    // Longer trip than we have clusters for: pull unused places into a
    // fresh ad-hoc cluster rather than repeating an earlier day.
    const leftover = sorted.filter((p) => !usedPlaceIds.has(p.id));
    if (leftover.length === 0) {
      days.push(buildLeisureDay(dayNumber));
      dataRanOut = true;
      continue;
    }

    const secondaryCluster: PlaceCluster = {
      id: `secondary-${dayNumber}`,
      label: "More of Lucknow",
      places: leftover,
      densityScore: leftover.length,
    };
    days.push(buildDay(dayNumber, secondaryCluster, usedPlaceIds, preferences, lockedPlaceIds));
  }

  guaranteeLockedPlacement(days, allPlaces, lockedPlaceIds, usedPlaceIds);
  guaranteeMealCoverage(days, allPlaces, preferences, usedPlaceIds);

  const disclaimer = dataRanOut
    ? "Timings and pairings are approximate. For the later days of this trip, our curated Lucknow data ran out of fresh recommendations, so we've suggested a lighter leisure day instead of repeating earlier stops."
    : "Timings and pairings are approximate — allow extra time to enjoy each stop, especially during festivals or peak season.";

  return {
    destinationId: preferences.destinationId,
    preferences,
    days,
    generatedAt: new Date().toISOString(),
    disclaimer,
  };
}
