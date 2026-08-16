"use client";

import Link from "next/link";
import type { Place } from "@/types/place";
import { formatMinutes } from "@/lib/utils/format";
import { PlaceImage } from "./PlaceImage";
import { SourceBadge } from "./SourceBadge";
import { SavedToggle } from "./SavedToggle";

export function PlaceCard({ place }: { place: Place }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-sandstone-200/70 bg-white transition-shadow hover:shadow-lg hover:shadow-navy-900/5">
      <div className="absolute right-3 top-3 z-10 rounded-full bg-white/90 backdrop-blur">
        <SavedToggle placeId={place.id} placeName={place.name} />
      </div>
      <Link href={`/place/${place.id}`} className="flex flex-1 flex-col">
        <div className="relative h-48 w-full overflow-hidden bg-sandstone-100">
          <PlaceImage
            place={place}
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg text-navy-900">{place.name}</h3>
            <SourceBadge status={place.verificationStatus} />
          </div>
          <p className="line-clamp-2 text-sm text-ink-soft">{place.description}</p>
          <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-ink-soft/80">
            <span>
              <span aria-hidden="true">🕐</span> Visit: {formatMinutes(place.estimatedVisitMinutes)}
            </span>
            {place.bestTime && (
              <>
                <span aria-hidden="true">·</span>
                <span>{place.bestTime}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
