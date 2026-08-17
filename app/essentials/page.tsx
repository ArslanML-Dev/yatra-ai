import type { Metadata } from "next";
import { EssentialsExplorer } from "@/components/essentials/EssentialsExplorer";

export const metadata: Metadata = {
  title: "Nearby Essentials — Yatra AI",
  description: "Hospitals, pharmacies, ATMs, police stations, grocery stores and malls near you.",
};

export default function EssentialsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-saffron-600">Nearby</p>
      <h1 className="mt-3 font-display text-4xl text-navy-900">Nearby essentials</h1>
      <p className="mt-4 max-w-xl text-ink-soft">
        Hospitals, pharmacies, ATMs, police stations, grocery stores and malls near your current
        location or where you&rsquo;re staying. Live data from OpenStreetMap, not curated like the
        rest of Yatra AI.
      </p>
      <div className="mt-10">
        <EssentialsExplorer />
      </div>
    </div>
  );
}
