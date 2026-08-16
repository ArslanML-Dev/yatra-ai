import type { Metadata } from "next";
import type { PlaceCategory } from "@/types/place";
import { getPlaceProvider } from "@/lib/providers/provider-registry";
import { selectRepresentativePlace } from "@/lib/data/select-representative-place";
import { CategoryCard } from "@/components/discovery/CategoryCard";

export const metadata: Metadata = {
  title: "Explore Lucknow — Yatra AI",
  description: "Heritage, food, shopping, parks and more, organized by category.",
};

const CATEGORIES: PlaceCategory[] = [
  "heritage",
  "food",
  "shopping",
  "parks",
  "riverfront_evening",
  "modern",
  "transport",
];

export default async function ExplorePage() {
  const places = await getPlaceProvider("lucknow").getAllPlaces("lucknow");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-saffron-600">
        Explore
      </p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl text-navy-900">
        Lucknow, organized so it makes sense
      </h1>
      <p className="mt-4 max-w-xl text-ink-soft">
        Instead of one long list, Lucknow is grouped the way you&rsquo;d actually plan around
        it — old city and modern, food and shopping, heritage and green space.
      </p>
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <CategoryCard key={category} category={category} place={selectRepresentativePlace(places, category)} />
        ))}
      </div>
    </div>
  );
}
