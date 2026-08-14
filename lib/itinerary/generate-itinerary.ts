import type { Place } from "@/types/place";
import type { Itinerary, ItineraryDay } from "@/types/itinerary";
import type { UserPreferences } from "@/types/user-preferences";
import { selectCandidates, sortByScoreDesc } from "./scoring";
import { clusterPlaces, type PlaceCluster } from "./cluster-places";
import { assignSlots } from "./slot-rules";

const LEISURE_DAY_THEME = "Leisure day — revisit a favourite area at your own pace";

function buildDay(
  dayNumber: number,
  cluster: PlaceCluster,
  usedPlaceIds: Set<string>,
  preferences: UserPreferences,
): ItineraryDay {
  const fresh = cluster.places.filter((p) => !usedPlaceIds.has(p.id));
  const slots = assignSlots(fresh, preferences.pace);
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

export function generateItinerary(allPlaces: Place[], preferences: UserPreferences): Itinerary {
  const candidates = selectCandidates(allPlaces, preferences);
  const sorted = sortByScoreDesc(candidates, preferences);
  const clusters = clusterPlaces(sorted);

  const usedPlaceIds = new Set<string>();
  const days: ItineraryDay[] = [];
  let dataRanOut = false;

  for (let dayNumber = 1; dayNumber <= preferences.days; dayNumber++) {
    if (dayNumber <= clusters.length) {
      days.push(buildDay(dayNumber, clusters[dayNumber - 1], usedPlaceIds, preferences));
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
    days.push(buildDay(dayNumber, secondaryCluster, usedPlaceIds, preferences));
  }

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
