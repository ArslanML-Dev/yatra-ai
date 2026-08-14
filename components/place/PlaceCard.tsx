import Image from "next/image";
import Link from "next/link";
import type { Place } from "@/types/place";
import { formatMinutes } from "@/lib/utils/format";
import { SourceBadge } from "./SourceBadge";

export function PlaceCard({ place }: { place: Place }) {
  const image = place.images[0];

  return (
    <Link
      href={`/place/${place.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sandstone-200/70 bg-white transition-shadow hover:shadow-lg hover:shadow-navy-900/5"
    >
      <div className="relative h-48 w-full overflow-hidden bg-sandstone-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sandstone-300">
            <span className="font-display text-2xl">Yatra AI</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg text-navy-900">{place.name}</h3>
          <SourceBadge status={place.verificationStatus} />
        </div>
        <p className="line-clamp-2 text-sm text-ink-soft">{place.description}</p>
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-ink-soft/80">
          <span>{formatMinutes(place.estimatedVisitMinutes)}</span>
          {place.bestTime && (
            <>
              <span aria-hidden="true">·</span>
              <span>{place.bestTime}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
