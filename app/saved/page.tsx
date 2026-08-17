import type { Metadata } from "next";
import { getPlaceProvider } from "@/lib/providers/provider-registry";
import { SavedPlacesList } from "@/components/place/SavedPlacesList";

export const metadata: Metadata = {
  title: "Saved places — Yatra AI",
  description: "Places you've saved while exploring Lucknow.",
};

export default async function SavedPlacesPage() {
  const provider = getPlaceProvider("lucknow");
  const allPlaces = await provider.getAllPlaces("lucknow");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-saffron-600">Saved</p>
      <h1 className="mt-3 font-display text-4xl text-navy-900">Your saved places</h1>
      <p className="mt-4 max-w-xl text-ink-soft">
        Stored on this device, the same way your travel preferences are. No account needed.
      </p>
      <div className="mt-10">
        <SavedPlacesList allPlaces={allPlaces} />
      </div>
    </div>
  );
}
