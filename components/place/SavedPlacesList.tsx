"use client";

import type { Place } from "@/types/place";
import { useTrip } from "@/lib/trip/use-trip";
import { PlaceCard } from "./PlaceCard";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * `allPlaces` is fetched server-side (see app/saved/page.tsx) since the
 * curated place data is static; which of them are saved is client-only
 * (localStorage via useTrip), so the filter has to happen here.
 */
export function SavedPlacesList({ allPlaces }: { allPlaces: Place[] }) {
  const { savedPlaceIds } = useTrip();
  const saved = allPlaces.filter((place) => savedPlaceIds.includes(place.id));

  if (saved.length === 0) {
    return (
      <EmptyState
        title="No saved places yet"
        description={'Tap the heart on any place — while exploring, on a place page, or in your itinerary — and it’ll show up here.'}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {saved.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
