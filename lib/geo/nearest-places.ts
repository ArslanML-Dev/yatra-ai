import type { Coordinates, Place } from "@/types/place";
import { haversineDistanceKm } from "./distance";

export interface NearbyResult {
  place: Place;
  distanceKm: number;
}

interface FindNearestOptions {
  excludeIds?: string[];
  limit?: number;
  maxKm?: number;
}

export function findNearestPlaces(
  origin: Coordinates,
  places: Place[],
  options: FindNearestOptions = {},
): NearbyResult[] {
  const { excludeIds = [], limit = 6, maxKm } = options;
  const excluded = new Set(excludeIds);

  return places
    .filter((p) => !excluded.has(p.id))
    .map((place) => ({ place, distanceKm: haversineDistanceKm(origin, place.coordinates) }))
    .filter((result) => (maxKm === undefined ? true : result.distanceKm <= maxKm))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
