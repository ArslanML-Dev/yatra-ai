"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { CategoryFilter } from "@/types/map";
import type { Coordinates, Place } from "@/types/place";
import { useTrip } from "@/lib/trip/use-trip";
import { CategoryToggle } from "./CategoryToggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const MapView = dynamic(() => import("./MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

interface MapExplorerProps {
  places: Place[];
  center: Coordinates;
  highlightPlaceId?: string;
}

export function MapExplorer({ places, center, highlightPlaceId }: MapExplorerProps) {
  const { trip } = useTrip();
  const [active, setActive] = useState<CategoryFilter>("all");
  const [showTripOnly, setShowTripOnly] = useState(Boolean(highlightPlaceId));

  const tripPlaceIds = useMemo(() => {
    if (!trip) return new Set<string>();
    return new Set(trip.itinerary.days.flatMap((d) => d.slots.map((s) => s.placeId)));
  }, [trip]);

  const filtered = useMemo(() => {
    const byCategory = active === "all" ? places : places.filter((p) => p.category === active);
    if (showTripOnly && trip) return byCategory.filter((p) => tripPlaceIds.has(p.id));
    return byCategory;
  }, [active, places, showTripOnly, trip, tripPlaceIds]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-sandstone-200/70 bg-white p-2.5 shadow-soft">
        <CategoryToggle active={active} onChange={setActive} />
        {trip && (
          <button
            type="button"
            onClick={() => setShowTripOnly((v) => !v)}
            aria-pressed={showTripOnly}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              showTripOnly ? "bg-leaf-600 text-ivory" : "bg-sandstone-100 text-ink-soft hover:bg-sandstone-200"
            }`}
          >
            🗺️ Show my trip only
          </button>
        )}
      </div>
      <div className="relative h-[65vh] min-h-[420px] w-full overflow-hidden rounded-card border border-sandstone-200/70 shadow-soft">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <EmptyState
              title="Nothing here yet"
              description={
                showTripOnly
                  ? "Your trip doesn't have any stops in this category."
                  : "Try another category — we're still curating this one."
              }
            />
          </div>
        ) : (
          <MapView places={filtered} center={center} highlightPlaceId={highlightPlaceId} />
        )}
      </div>
    </div>
  );
}
