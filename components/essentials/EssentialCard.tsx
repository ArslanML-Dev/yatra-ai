"use client";

import type { EssentialPOI } from "@/types/essentials";
import type { Coordinates } from "@/types/place";
import { formatEssentialCategoryLabel } from "@/lib/utils/format";
import { formatDistanceKm } from "@/lib/geo/format-distance";
import { useDirectionsLink } from "@/lib/geo/use-directions-link";
import { EssentialIcon } from "./EssentialIcon";

export function EssentialCard({ poi, origin }: { poi: EssentialPOI; origin?: Coordinates }) {
  const directions = useDirectionsLink(poi.coordinates, origin);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-sandstone-200/70 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sandstone-100 text-navy-700">
        <EssentialIcon category={poi.category} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-saffron-600">
          {formatEssentialCategoryLabel(poi.category)}
        </p>
        <p className="mt-0.5 truncate font-display text-base text-navy-900">{poi.name}</p>
        {poi.address && <p className="mt-0.5 truncate text-xs text-ink-soft">{poi.address}</p>}
        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="text-ink-soft/80">{formatDistanceKm(poi.distanceKm)} away</span>
          <a href={directions?.url} target="_blank" rel="noopener noreferrer" className="font-medium text-saffron-600 underline">
            🧭 Directions
          </a>
        </div>
      </div>
    </div>
  );
}
