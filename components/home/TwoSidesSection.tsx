import Link from "next/link";

const sides = [
  {
    key: "old",
    title: "Old Lucknow",
    body: "Imambaras, gateways, Chowk's narrow lanes and the food stalls that have anchored them for generations.",
    href: "/explore/heritage",
    cta: "See heritage Lucknow",
    tone: "bg-navy-900 text-ivory",
  },
  {
    key: "modern",
    title: "Modern Lucknow",
    body: "Gomti Nagar's malls, Ekana Stadium and a riverfront that comes alive as the evening cools down.",
    href: "/explore/modern",
    cta: "See modern Lucknow",
    tone: "bg-sandstone-100 text-navy-900",
  },
];

export function TwoSidesSection() {
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
            className={`flex flex-col justify-between gap-8 rounded-card p-8 shadow-soft transition-[opacity,box-shadow] hover:opacity-90 hover:shadow-lift ${side.tone}`}
          >
            <div>
              <h3 className="text-h3 font-display">{side.title}</h3>
              <p className="mt-3 max-w-sm text-body-sm opacity-80">{side.body}</p>
            </div>
            <span className="text-body-sm font-medium">{side.cta} →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
