import type { Place } from "@/types/place";
import { PlaceCard } from "@/components/place/PlaceCard";

export function HighlightsGrid({ places }: { places: Place[] }) {
  if (places.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-caption font-medium uppercase text-saffron-600">
            Start here
          </p>
          <h2 className="mt-3 text-h2 font-display text-navy-900">Lucknow, at a glance</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </section>
  );
}
