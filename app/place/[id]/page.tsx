import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlaceProvider } from "@/lib/providers/provider-registry";
import { PlaceDetail } from "@/components/place/PlaceDetail";
import { NearbySuggestions } from "@/components/place/NearbySuggestions";

type PlacePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { id } = await params;
  const provider = getPlaceProvider("lucknow");
  const place = await provider.getPlaceById(id);
  if (!place) return {};
  return {
    title: `${place.name} — Yatra AI`,
    description: place.description,
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const provider = getPlaceProvider("lucknow");
  const place = await provider.getPlaceById(id);

  if (!place) notFound();

  const [nearby, allPlaces] = await Promise.all([
    provider.getNearby(id),
    provider.getAllPlaces("lucknow"),
  ]);

  return (
    <div>
      <PlaceDetail place={place} allPlaces={allPlaces} />
      <div className="mx-auto max-w-4xl px-6 pb-16">
        <NearbySuggestions
          origin={place}
          curatedNearby={nearby}
          allPlaces={allPlaces}
          framing="around-this-place"
        />
      </div>
    </div>
  );
}
