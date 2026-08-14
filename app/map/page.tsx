import type { Metadata } from "next";
import { getMapProvider, getPlaceProvider } from "@/lib/providers/provider-registry";
import { MapExplorer } from "@/components/map/MapExplorer";

export const metadata: Metadata = {
  title: "Map — Yatra AI",
  description: "Every curated Lucknow place, on one interactive map.",
};

export default async function MapPage() {
  const placeProvider = getPlaceProvider("lucknow");
  const mapProvider = getMapProvider();
  const places = await placeProvider.getAllPlaces("lucknow");
  const center = mapProvider.getDefaultCenter("lucknow");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-saffron-600">Map</p>
      <h1 className="mt-3 font-display text-4xl text-navy-900">Lucknow, on the map</h1>
      <p className="mt-4 max-w-xl text-ink-soft">
        Toggle a category to see just what you care about — everything shown here has a
        curated, sourced location.
      </p>
      <div className="mt-10">
        <MapExplorer places={places} center={center} />
      </div>
    </div>
  );
}
