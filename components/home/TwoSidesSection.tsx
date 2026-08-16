import Link from "next/link";
import type { Place } from "@/types/place";
import { PlaceImage } from "@/components/place/PlaceImage";

interface Side {
  key: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  place?: Place;
}

export function TwoSidesSection({
  heritagePlace,
  modernPlace,
}: {
  heritagePlace?: Place;
  modernPlace?: Place;
}) {
  const sides: Side[] = [
    {
      key: "old",
      title: "Old Lucknow",
      body: "Imambaras, gateways, Chowk's narrow lanes and the food stalls that have anchored them for generations.",
      href: "/explore/heritage",
      cta: "See heritage Lucknow",
      place: heritagePlace,
    },
    {
      key: "modern",
      title: "Modern Lucknow",
      body: "Gomti Nagar's malls, Ekana Stadium and a riverfront that comes alive as the evening cools down.",
      href: "/explore/modern",
      cta: "See modern Lucknow",
      place: modernPlace,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-caption font-medium uppercase text-saffron-600">
        One city, two rhythms
      </p>
      <h2 className="mt-3 text-h2 font-display text-navy-900">Two sides of Lucknow</h2>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {sides.map((side) => (
          <Link
            key={side.key}
            href={side.href}
            className="group relative flex h-80 flex-col justify-end overflow-hidden rounded-card p-8 shadow-soft transition-shadow hover:shadow-lift"
          >
            <div className="absolute inset-0">
              {side.place ? (
                <PlaceImage place={side.place} sizes="(min-width: 640px) 50vw, 100vw" tone="dark" iconSize="lg" />
              ) : (
                <div className="h-full w-full bg-navy-900" />
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent transition-opacity group-hover:from-navy-950" />

            <div className="relative z-10">
              <h3 className="text-h3 font-display text-ivory [text-shadow:0_2px_16px_rgba(0,0,0,0.7)]">
                {side.title}
              </h3>
              <p className="mt-3 max-w-sm text-body-sm text-ivory/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.7)]">
                {side.body}
              </p>
              <span className="mt-6 inline-flex items-center text-body-sm font-medium text-saffron-400 [text-shadow:0_1px_10px_rgba(0,0,0,0.7)] transition-transform group-hover:translate-x-1">
                {side.cta} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
