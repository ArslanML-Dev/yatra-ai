import { getPlaceProvider } from "@/lib/providers/provider-registry";
import { selectHighlights } from "@/lib/data/select-homepage-highlights";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HeroHeadline } from "@/components/home/HeroHeadline";
import { HeroModeSelect } from "@/components/home/HeroModeSelect";
import { ExplainerSection } from "@/components/home/ExplainerSection";
import { HighlightsGrid } from "@/components/home/HighlightsGrid";
import { TwoSidesSection } from "@/components/home/TwoSidesSection";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const provider = getPlaceProvider("lucknow");
  const [destination, places] = await Promise.all([
    provider.getDestination("lucknow"),
    provider.getAllPlaces("lucknow"),
  ]);

  const highlights = selectHighlights(places, 8);

  return (
    <div>
      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        <HeroCarousel images={destination?.heroImages ?? []} />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24">
          <p className="text-caption font-medium uppercase text-saffron-400">
            AI-powered tourism platform · Now showcasing Lucknow
          </p>
          <HeroHeadline />
          <p className="mt-5 max-w-xl text-body-lg text-ivory/80">
            Yatra AI turns how you actually want to travel into a real day-wise plan —
            heritage, food, shopping and parks, organized around you, not a generic
            checklist.
          </p>
          <HeroModeSelect />
        </div>
        <div className="absolute right-0 bottom-0 left-0 z-10">
          <SectionDivider tone="ivory" />
        </div>
      </section>

      {destination && (
        <section className="mx-auto max-w-3xl px-6 pt-16 pb-6 text-center">
          <p className="text-body-lg leading-relaxed text-ink-soft">
            {destination.shortOverview}
          </p>
        </section>
      )}

      <ExplainerSection />
      <HighlightsGrid places={highlights} />
      <TwoSidesSection />

      <SectionDivider tone="navy" />
      <section className="bg-navy-950 px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-caption font-medium uppercase text-saffron-400">
            Ready when you are
          </p>
          <h2 className="mt-3 text-h2 font-display text-ivory">
            Your Lucknow itinerary, built around how you actually travel.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/plan" variant="primary">
              Plan My Lucknow Trip
            </Button>
            <Button href="/explore" variant="secondary">
              Explore Lucknow
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
