import Link from "next/link";
import type { Place } from "@/types/place";

export function NearbyList({ places }: { places: Place[] }) {
  if (places.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-xl text-navy-900">Nearby</h2>
      <ul className="mt-4 flex flex-col gap-2">
        {places.map((place) => (
          <li key={place.id}>
            <Link
              href={`/place/${place.id}`}
              className="flex items-center justify-between rounded-xl border border-sandstone-200/70 px-4 py-3 text-sm transition-colors hover:border-saffron-400"
            >
              <span className="font-medium text-navy-900">{place.name}</span>
              <span className="text-ink-soft">{place.category.replace("_", " ")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
