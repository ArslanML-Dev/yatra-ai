/**
 * Shown while the server renders /plan/itinerary — i.e. for however long
 * the real generateItinerary() pipeline (lib/itinerary/generate-itinerary.ts)
 * actually takes. The three stages named below are that pipeline's real
 * steps (selectCandidates → clusterPlaces → assignSlots), not decorative
 * copy — and there's deliberately no percentage or countdown, since the
 * engine is synchronous and doesn't expose (or fake) sub-step timing.
 */
const STAGES = [
  { icon: "🧭", label: "Understanding your trip", detail: "Matching places to your interests and pace" },
  { icon: "📍", label: "Finding places", detail: "Grouping candidates geographically across Lucknow" },
  { icon: "🗓️", label: "Balancing days", detail: "Building a day-wise rhythm around meals and travel" },
] as const;

export default function ItineraryLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
      <p className="text-caption font-medium uppercase text-saffron-600">Plan my trip</p>
      <h1 className="mt-3 text-h2 font-display text-navy-900">Building your Lucknow trip</h1>
      <ul className="mt-10 flex w-full max-w-sm flex-col gap-4 text-left">
        {STAGES.map((stage) => (
          <li
            key={stage.label}
            className="flex items-center gap-4 rounded-card border border-sandstone-200/70 bg-white p-4 shadow-soft"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-sandstone-100 text-lg"
            >
              {stage.icon}
            </span>
            <div>
              <p className="text-body-sm font-medium text-navy-900">{stage.label}</p>
              <p className="text-xs text-ink-soft/70">{stage.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
