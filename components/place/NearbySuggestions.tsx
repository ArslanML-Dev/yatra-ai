"use client";

import Link from "next/link";
import type { Place } from "@/types/place";
import { useTrip } from "@/lib/trip/use-trip";
import { haversineDistanceKm } from "@/lib/geo/distance";
import { findNearestPlaces } from "@/lib/geo/nearest-places";
import { formatDistanceWithSource } from "@/lib/geo/format-distance";

const MIN_CURATED_BEFORE_FALLBACK = 3;
const MAX_RESULTS = 5;

interface NearbySuggestionsProps {
  origin: Place;
  curatedNearby: Place[];
  allPlaces: Place[];
  framing: "around-this-place" | "whats-next";
}

const COPY = {
  "around-this-place": {
    title: "Around this place",
    subtitle: "Recommended because it's nearby, or pairs naturally with this stop.",
  },
  "whats-next": {
    title: "What should you do next?",
    subtitle: "A few options near your last stop.",
  },
};

export function NearbySuggestions({ origin, curatedNearby, allPlaces, framing }: NearbySuggestionsProps) {
  const { trip, addStop } = useTrip();
  const copy = COPY[framing];

  let results: { place: Place; distanceKm: number }[] = curatedNearby.map((place) => ({
    place,
    distanceKm: haversineDistanceKm(origin.coordinates, place.coordinates),
  }));

  if (results.length < MIN_CURATED_BEFORE_FALLBACK) {
    const existingIds = new Set(results.map((r) => r.place.id));
    const fallback = findNearestPlaces(origin.coordinates, allPlaces, {
      excludeIds: [origin.id, ...existingIds],
      limit: MAX_RESULTS - results.length,
      maxKm: 5,
    });
    results = [...results, ...fallback];
  }

  results = results.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, MAX_RESULTS);

  if (results.length === 0) return null;

  function handleAdd(place: Place) {
    const dayNumber = trip?.itinerary.days[0]?.dayNumber;
    if (!dayNumber) return;
    addStop(dayNumber, place);
  }

  return (
    <div>
      <h2 className="font-display text-xl text-navy-900">{copy.title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{copy.subtitle}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {results.map(({ place, distanceKm }) => (
          <li
            key={place.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sandstone-200/70 px-4 py-3 text-sm"
          >
            <div className="min-w-0">
              <Link href={`/place/${place.id}`} className="font-medium text-navy-900 hover:underline">
                {place.name}
              </Link>
              <p className="text-xs text-ink-soft">
                {formatDistanceWithSource(distanceKm, origin.name)}
              </p>
            </div>
            {trip ? (
              <button
                type="button"
                onClick={() => handleAdd(place)}
                className="shrink-0 rounded-full bg-navy-900 px-4 py-1.5 text-xs font-medium text-ivory transition-colors hover:bg-navy-800"
              >
                Add to my trip
              </button>
            ) : (
              <span className="shrink-0 text-xs text-ink-soft/60">Start a trip to add this</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
