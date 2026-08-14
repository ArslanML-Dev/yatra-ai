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
