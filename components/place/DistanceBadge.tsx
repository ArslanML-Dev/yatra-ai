"use client";

import type { Coordinates } from "@/types/place";
import { useTrip } from "@/lib/trip/use-trip";
import { haversineDistanceKm } from "@/lib/geo/distance";
import { formatDistanceWithSource } from "@/lib/geo/format-distance";

export function DistanceBadge({ coordinates }: { coordinates: Coordinates }) {
  const { trip } = useTrip();
  const referencePoint = trip?.referencePoint;

  if (!referencePoint) return null;

  const distanceKm = haversineDistanceKm(referencePoint.coordinates, coordinates);

  return (
    <span className="text-xs font-medium text-ink-soft">
      {formatDistanceWithSource(distanceKm, referencePoint.label)}
    </span>
  );
}
