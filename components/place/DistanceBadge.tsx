"use client";

import type { Coordinates } from "@/types/place";
import { useTrip } from "@/lib/trip/use-trip";
import { haversineDistanceKm } from "@/lib/geo/distance";
import { formatDistanceWithSource } from "@/lib/geo/format-distance";

export function DistanceBadge({
  coordinates,
  tone = "muted",
}: {
  coordinates: Coordinates;
  /** "light" for use over a photo/dark background — see the place-page hero. */
  tone?: "muted" | "light";
}) {
  const { referencePoint } = useTrip();

  if (!referencePoint) return null;

  const distanceKm = haversineDistanceKm(referencePoint.coordinates, coordinates);

  return (
    <span className={`text-xs font-medium ${tone === "light" ? "text-ivory/80" : "text-ink-soft"}`}>
      {formatDistanceWithSource(distanceKm, referencePoint.label)}
    </span>
  );
}
