"use client";

import { useState } from "react";
import Image from "next/image";
import type { Place } from "@/types/place";
import { formatCategoryLabel, formatMinutes } from "@/lib/utils/format";
import { getSource } from "@/lib/data/sources";
import { buildGoogleMapsDirectionsUrl } from "@/lib/geo/directions-url";
import { useTrip } from "@/lib/trip/use-trip";
import { SourceBadge } from "./SourceBadge";
import { DistanceBadge } from "./DistanceBadge";
import { ReferencePointPicker } from "./ReferencePointPicker";
import { SavedToggle } from "./SavedToggle";
import { LiveNavigationPanel } from "@/components/navigation/LiveNavigationPanel";
import { Badge } from "@/components/ui/Badge";

export function PlaceDetail({ place, allPlaces }: { place: Place; allPlaces: Place[] }) {
  const { referencePoint } = useTrip();
  // A hotlinked Wikimedia source can rate-limit or fail transiently —
  // confirmed via real browser testing on this exact page. Falls back
  // to the same honest no-image layout used for places that never had
  // one, rather than leaving a broken/invisible hero.
  const [imageFailed, setImageFailed] = useState(false);
  const image = imageFailed ? undefined : place.images[0];
  const directionsUrl = buildGoogleMapsDirectionsUrl(
    place.coordinates,
    referencePoint?.coordinates,
  );
  const sourceLabel = getSource(place.source)?.label;

  return (
    <article>
      {image ? (
        <div className="relative flex h-[52vh] min-h-[320px] w-full items-end overflow-hidden bg-navy-950">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            onError={() => setImageFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-navy-950/10" />
          <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="translucent">{formatCategoryLabel(place.category)}</Badge>
              <SourceBadge status={place.verificationStatus} />
              <DistanceBadge coordinates={place.coordinates} tone="light" />
            </div>
            <h1 className="mt-4 text-h1 font-display text-ivory">{place.name}</h1>
            <p className="mt-3 max-w-2xl text-body-lg text-ivory/80">{place.description}</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl px-6 pt-16">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="navy">{formatCategoryLabel(place.category)}</Badge>
            <SourceBadge status={place.verificationStatus} />
            <DistanceBadge coordinates={place.coordinates} />
          </div>
          <h1 className="mt-4 text-h1 font-display text-navy-900">{place.name}</h1>
          <p className="mt-3 max-w-2xl text-body-lg text-ink-soft">{place.description}</p>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ReferencePointPicker places={allPlaces} />
          <SavedToggle placeId={place.id} placeName={place.name} />
        </div>
        {image && (
          <p className="mt-3 text-xs text-ink-soft/60">
            Image: {image.source}
            {image.sourceUrl && (
              <>
                {" "}
                &middot;{" "}
                <a href={image.sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">
                  source
                </a>
              </>
            )}
          </p>
        )}
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-6 pb-16 sm:grid-cols-3">
        <div className="sm:col-span-2 flex flex-col gap-8">
          <section>
            <h2 className="font-display text-xl text-navy-900">Why visit</h2>
            <p className="mt-2 text-ink-soft">{place.whyVisit}</p>
          </section>

          {place.historicalContext && (
            <section>
              <h2 className="font-display text-xl text-navy-900">History</h2>
              <p className="mt-2 text-ink-soft">{place.historicalContext}</p>
            </section>
          )}

          {place.knownFor && place.knownFor.length > 0 && (
            <section>
              <h2 className="font-display text-xl text-navy-900">Known for</h2>
              <ul className="mt-2 flex flex-col gap-1.5 text-ink-soft">
                {place.knownFor.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-saffron-600">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {place.transportNote && (
            <section>
              <h2 className="font-display text-xl text-navy-900">Getting there</h2>
              <p className="mt-2 text-ink-soft">{place.transportNote}</p>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-6 rounded-2xl border border-sandstone-200/70 bg-white p-6 h-fit">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/70">
              Time required
            </p>
            <p className="mt-1 font-display text-lg text-navy-900">
              {formatMinutes(place.estimatedVisitMinutes)}
            </p>
          </div>
          {place.bestTime && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/70">
                Best time
              </p>
              <p className="mt-1 text-sm text-ink-soft">{place.bestTime}</p>
            </div>
          )}
          {place.address && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/70">
                Address
              </p>
              <p className="mt-1 text-sm text-ink-soft">{place.address}</p>
            </div>
          )}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-navy-900 px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-navy-800"
          >
            🧭 Open in Google Maps
          </a>
          <LiveNavigationPanel destinationName={place.name} destination={place.coordinates} />
          {place.sourceUrl && (
            <a
              href={place.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ink-soft/70 underline"
            >
              View source{sourceLabel ? `: ${sourceLabel}` : ""}
            </a>
          )}
        </aside>
      </div>
    </article>
  );
}
