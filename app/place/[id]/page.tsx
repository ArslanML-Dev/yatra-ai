import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlaceProvider } from "@/lib/providers/provider-registry";
import { PlaceDetail } from "@/components/place/PlaceDetail";
import { NearbyList } from "@/components/place/NearbyList";

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

  const nearby = await provider.getNearby(id);

  return (
    <div>
      <PlaceDetail place={place} />
      {nearby.length > 0 && (
        <div className="mx-auto max-w-4xl px-6 pb-16">
          <NearbyList places={nearby} />
        </div>
      )}
    </div>
  );
}
