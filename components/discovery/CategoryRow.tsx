import Link from "next/link";
import type { Place, PlaceCategory } from "@/types/place";
import { formatCategoryLabel } from "@/lib/utils/format";
import { PlaceCard } from "@/components/place/PlaceCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface CategoryRowProps {
  category: PlaceCategory;
  places: Place[];
  limit?: number;
}

export function CategoryRow({ category, places, limit = 3 }: CategoryRowProps) {
  const visible = places.slice(0, limit);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl text-navy-900">{formatCategoryLabel(category)}</h2>
        {places.length > 0 && (
          <Link
            href={`/explore/${category}`}
            className="text-sm font-medium text-saffron-600 hover:underline"
          >
            View more
          </Link>
        )}
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title="More on the way"
          description="We're still curating this category — check back soon."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </section>
  );
}
