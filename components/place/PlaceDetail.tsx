import Image from "next/image";
import type { Place } from "@/types/place";
import { formatCategoryLabel, formatMinutes } from "@/lib/utils/format";
import { SourceBadge } from "./SourceBadge";
import { Badge } from "@/components/ui/Badge";

export function PlaceDetail({ place }: { place: Place }) {
  const image = place.images[0];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`;

  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="navy">{formatCategoryLabel(place.category)}</Badge>
        <SourceBadge status={place.verificationStatus} />
      </div>

      <h1 className="mt-4 font-display text-4xl text-navy-900 sm:text-5xl">{place.name}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">{place.description}</p>

      {image && (
        <div className="relative mt-8 h-80 w-full overflow-hidden rounded-2xl bg-sandstone-100 sm:h-[420px]">
          <Image src={image.url} alt={image.alt} fill className="object-cover" priority sizes="(min-width: 768px) 800px, 100vw" />
        </div>
      )}
      {image && (
        <p className="mt-2 text-xs text-ink-soft/60">
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

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
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
            Get directions
          </a>
          {place.sourceUrl && (
            <a
              href={place.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ink-soft/70 underline"
            >
              View source
            </a>
          )}
        </aside>
      </div>
    </article>
  );
}
