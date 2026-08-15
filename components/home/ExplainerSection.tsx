const steps = [
  {
    title: "Tell us how you want to travel",
    body: "Duration, who's coming, what you care about — heritage, food, shopping, a slower pace.",
  },
  {
    title: "See Lucknow organized, not listed",
    body: "Heritage, food, shopping and parks grouped so the city makes sense at a glance.",
  },
  {
    title: "Get a day-wise plan that fits",
    body: "A geographically sensible itinerary for exactly as many days as you're staying — one or ten.",
  },
];

export function ExplainerSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <p className="text-caption font-medium uppercase text-saffron-600">
          How Yatra AI works
        </p>
        <h2 className="mt-3 text-h2 font-display text-navy-900">
          Tell us how you want to travel. We&rsquo;ll help you experience the destination.
        </h2>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="flex flex-col gap-3">
            <span className="text-h3 font-display text-saffron-600">0{i + 1}</span>
            <h3 className="text-h4 font-display text-navy-900">{step.title}</h3>
            <p className="text-body-sm text-ink-soft">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
