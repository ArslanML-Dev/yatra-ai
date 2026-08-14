import { getPlaceProvider } from "@/lib/providers/provider-registry";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ExplainerSection } from "@/components/home/ExplainerSection";
import { HighlightsGrid } from "@/components/home/HighlightsGrid";
import { TwoSidesSection } from "@/components/home/TwoSidesSection";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const provider = getPlaceProvider("lucknow");
  const [destination, places] = await Promise.all([
    provider.getDestination("lucknow"),
    provider.getAllPlaces("lucknow"),
  ]);

  const highlights = places.filter((p) => p.tags.includes("anchor")).slice(0, 4);

  return (
    <div>
      <section className="relative flex min-h-[88vh] items-end overflow-hidden">
        <HeroCarousel images={destination?.heroImages ?? []} />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-saffron-400">
            Smile, you are in Lucknow
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight text-ivory sm:text-6xl">
            Experience Lucknow. We&rsquo;ll organize the journey.
          </h1>
          <p className="mt-5 max-w-xl text-base text-ivory/80 sm:text-lg">
            An AI travel companion for one city, done properly — heritage, food, shopping
            and parks, turned into a day-wise plan built around how you actually want to
            travel.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/plan" variant="primary">
              Plan My Lucknow Trip
            </Button>
            <Button href="/explore" variant="secondary">
              Explore Lucknow
            </Button>
          </div>
        </div>
      </section>

      {destination && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <p className="max-w-3xl text-lg leading-relaxed text-ink-soft">
            {destination.shortOverview}
          </p>
        </section>
      )}

      <HighlightsGrid places={highlights} />
      <TwoSidesSection />
      <ExplainerSection />
    </div>
  );
}
