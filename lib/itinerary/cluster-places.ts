import type { Place, PlaceCategory } from "@/types/place";
import { haversineDistanceKm } from "@/lib/geo/distance";

export interface PlaceCluster {
  id: string;
  label: string;
  places: Place[];
  densityScore: number;
}

const CLUSTER_RADIUS_KM = 4;
const MAX_CLUSTER_SIZE = 6;

const CATEGORY_CLUSTER_LABELS: Record<PlaceCategory, string> = {
  heritage: "Heritage & Old City",
  food: "Food Trail",
  shopping: "Markets & Chikankari",
  parks: "Parks & Green Spaces",
  riverfront_evening: "Riverfront & Evening",
  modern: "Modern Lucknow & Leisure",
  transport: "Getting Around",
};

function dominantCategory(places: Place[]): PlaceCategory {
  const counts = new Map<PlaceCategory, number>();
  for (const place of places) {
    counts.set(place.category, (counts.get(place.category) ?? 0) + 1);
  }
  let best: PlaceCategory = places[0].category;
  let bestCount = 0;
  for (const [category, count] of counts) {
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Greedy geographic clustering: repeatedly seeds a cluster from the
 * highest-scored unclustered place, then attaches nearby unclustered
 * places within CLUSTER_RADIUS_KM, up to MAX_CLUSTER_SIZE. Places is
 * expected pre-sorted by score descending (see scoring.ts) so seeds are
 * chosen best-first and clusters read as day-quality-ranked.
 */
export function clusterPlaces(scoredPlaces: Place[]): PlaceCluster[] {
  const remaining = [...scoredPlaces];
  const clusters: PlaceCluster[] = [];

  while (remaining.length > 0) {
    const seed = remaining.shift()!;
    const members = [seed];

    for (let i = remaining.length - 1; i >= 0 && members.length < MAX_CLUSTER_SIZE; i--) {
      const candidate = remaining[i];
      const withinRadius = members.some(
        (m) => haversineDistanceKm(m.coordinates, candidate.coordinates) <= CLUSTER_RADIUS_KM,
      );
      if (withinRadius) {
        members.push(candidate);
        remaining.splice(i, 1);
      }
    }

    const category = dominantCategory(members);
    clusters.push({
      id: `cluster-${clusters.length + 1}`,
      label: CATEGORY_CLUSTER_LABELS[category],
      places: members,
      densityScore: members.length,
    });
  }

  return clusters.sort((a, b) => b.densityScore - a.densityScore);
}
