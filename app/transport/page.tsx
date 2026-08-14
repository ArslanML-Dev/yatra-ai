import type { Metadata } from "next";
import { getPlaceProvider } from "@/lib/providers/provider-registry";
import { PlaceCard } from "@/components/place/PlaceCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Getting Around Lucknow — Yatra AI",
  description: "Airports, railway stations, and practical mobility guidance for Lucknow.",
};

const GUIDANCE = [
  {
    area: "Old Lucknow (Chowk, Aminabad, Akbari Gate)",
    advice:
      "Lanes here are narrow and busy, especially around Chowk. Consider being dropped near your destination and walking the final stretch — an e-rickshaw or auto is usually the most practical way to cover short distances between stops.",
  },
  {
    area: "Modern Lucknow (Gomti Nagar, Hazratganj)",
    advice:
      "Wider roads and more parking make a cab or your own vehicle more practical here. App-based cabs are commonly available in these areas.",
  },
  {
    area: "Between old and modern Lucknow",
    advice:
      "The two halves of the city are several kilometres apart. Plan a cab or auto for the journey between them rather than walking, and build transit time into your itinerary.",
  },
];

export default async function TransportPage() {
  const provider = getPlaceProvider("lucknow");
  const places = await provider.getPlacesByCategory("lucknow", "transport");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-saffron-600">
        Getting around
      </p>
      <h1 className="mt-3 font-display text-4xl text-navy-900">Practical travel in Lucknow</h1>
      <p className="mt-4 text-ink-soft">
        Yatra AI won&rsquo;t book your travel, but it will tell you what to realistically expect
        moving around the city.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl text-navy-900">Arriving in the city</h2>
        {places.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Still curating this section"
              description="Airport and railway station details are on the way."
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-navy-900">Moving around once you&rsquo;re here</h2>
        <div className="mt-4 flex flex-col gap-4">
          {GUIDANCE.map((item) => (
            <div key={item.area} className="rounded-2xl border border-sandstone-200/70 bg-white p-5">
              <p className="font-display text-base text-navy-900">{item.area}</p>
              <p className="mt-2 text-sm text-ink-soft">{item.advice}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-soft/60">
          General guidance based on the city&rsquo;s layout — not live traffic or parking data.
        </p>
      </section>
    </div>
  );
}
