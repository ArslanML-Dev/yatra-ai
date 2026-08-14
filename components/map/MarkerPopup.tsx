import Link from "next/link";
import type { Place } from "@/types/place";
import { formatCategoryLabel } from "@/lib/utils/format";

export function MarkerPopup({ place }: { place: Place }) {
  return (
    <div className="min-w-[180px]">
      <p className="text-xs font-medium uppercase tracking-wide text-saffron-600">
        {formatCategoryLabel(place.category)}
      </p>
      <p className="mt-1 font-display text-base text-navy-900">{place.name}</p>
      <Link href={`/place/${place.id}`} className="mt-2 inline-block text-sm text-saffron-600 underline">
        View details
      </Link>
    </div>
  );
}
