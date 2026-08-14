import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import type { PlaceCategory } from "@/types/place";
import { getPlaceProvider } from "@/lib/providers/provider-registry";
import { formatCategoryLabel } from "@/lib/utils/format";
import { PlaceCard } from "@/components/place/PlaceCard";
import { EmptyState } from "@/components/ui/EmptyState";

const VALID_CATEGORIES: PlaceCategory[] = [
  "heritage",
  "food",
  "shopping",
  "parks",
  "riverfront_evening",
  "modern",
  "transport",
];

function isPlaceCategory(value: string): value is PlaceCategory {
  return (VALID_CATEGORIES as string[]).includes(value);
}

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isPlaceCategory(category)) return {};
  return { title: `${formatCategoryLabel(category)} — Yatra AI` };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  if (!isPlaceCategory(category)) notFound();

  const provider = getPlaceProvider("lucknow");
  const places = await provider.getPlacesByCategory("lucknow", category);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/explore" className="text-sm font-medium text-saffron-600 hover:underline">
        ← All categories
      </Link>
      <h1 className="mt-3 font-display text-4xl text-navy-900">
        {formatCategoryLabel(category)}
      </h1>

      {places.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Still curating this category"
            description="We're actively researching and verifying places here — check back soon."
          />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}
