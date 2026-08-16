import type { Place } from "@/types/place";
import type { Itinerary, ItineraryDay } from "@/types/itinerary";
import type { UserPreferences } from "@/types/user-preferences";
import { haversineDistanceKm } from "@/lib/geo/distance";
import { selectCandidates, sortByScoreDesc } from "./scoring";
import { clusterPlaces, type PlaceCluster } from "./cluster-places";
import { assignSlots } from "./slot-rules";

const LEISURE_DAY_THEME = "Leisure day — revisit a favourite area at your own pace";

interface GenerateItineraryOptions {
  lockedPlaceIds?: string[];
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

    const newSlot = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timeOfDay: place.suitableTimesOfDay[0] ?? "morning",
      placeId: place.id,
      note: place.bestTime ?? "Approximate timing — allow extra time to enjoy each stop",
      locked: true,
    } as const;

    const victimIndex = nearestDay.slots.findIndex((s) => !s.locked);
    if (victimIndex >= 0) {
      nearestDay.slots[victimIndex] = newSlot;
    } else {
      nearestDay.slots.push(newSlot);
    }
    usedPlaceIds.add(place.id);
  }
}

/**
 * After the main day-building loop, guarantees every day that has any
 * stops at all also has at least one food stop — clustering is purely
 * geographic (see cluster-places.ts), so a day's cluster can end up with
 * zero food candidates purely by chance of geography, even though other
 * days end up with several. Eating isn't an optional "interest" the way
 * shopping or parks are, so this runs regardless of the user's selected
 * interests — unless they explicitly deselected food, which is treated
 * the same as the heritage-anchor safety net in scoring.ts: an explicit
 * exclusion is always honored, never silently overridden.
 *
 * Finds the nearest unused food place to each day's existing stops and
 * swaps it in for that day's lowest-priority unlocked slot (bumping
 * rather than appending, mirroring guaranteeLockedPlacement above) — or
 * leaves the day as-is, an honest gap, if no unused food candidate
 * exists anywhere in the data.
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

  for (const day of days) {
    if (day.slots.length === 0) continue; // leisure day — leave alone
    const hasFood = day.slots.some((slot) => placesById.get(slot.placeId)?.category === "food");
    if (hasFood) continue;

    let nearestFood: Place | undefined;
    let nearestDistance = Infinity;
    for (const place of allPlaces) {
      if (place.category !== "food" || usedPlaceIds.has(place.id)) continue;
      for (const slot of day.slots) {
        const slotPlace = placesById.get(slot.placeId);
        if (!slotPlace) continue;
        const distance = haversineDistanceKm(place.coordinates, slotPlace.coordinates);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestFood = place;
        }
      }
    }
    if (!nearestFood) continue;

    const newSlot = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timeOfDay: nearestFood.suitableTimesOfDay[0] ?? "afternoon",
      placeId: nearestFood.id,
      note: nearestFood.bestTime ?? "Approximate timing — allow extra time to enjoy each stop",
      locked: false,
    } as const;

    let victimIndex = -1;
    for (let i = day.slots.length - 1; i >= 0; i--) {
      if (!day.slots[i].locked) {
        victimIndex = i;
        break;
      }
    }

    if (victimIndex >= 0) {
      usedPlaceIds.delete(day.slots[victimIndex].placeId);
      day.slots[victimIndex] = newSlot;
    } else {
      day.slots.push(newSlot);
    }
    usedPlaceIds.add(nearestFood.id);
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
