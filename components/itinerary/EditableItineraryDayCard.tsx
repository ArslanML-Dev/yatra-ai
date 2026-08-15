"use client";

import { AnimatePresence } from "framer-motion";
import type { ItineraryDay } from "@/types/itinerary";
import type { Place } from "@/types/place";
import type { Pace } from "@/types/user-preferences";
import { useTrip } from "@/lib/trip/use-trip";
import { EditableItinerarySlot } from "./EditableItinerarySlot";
import { NearbySuggestions } from "@/components/place/NearbySuggestions";
import { EmptyState } from "@/components/ui/EmptyState";

// A day now normally carries 5-7 rhythm-phase stops (breakfast through
// dinner — see lib/itinerary/day-rhythm.ts), so the packed-day warning
// needs a higher bar than the old flat 3/4-slot count: only flag days
// that are genuinely heavy, not every moderate-pace day with a full
// meal rhythm.
const PACKED_SLOT_THRESHOLD = 6;
const PACKED_MINUTES_THRESHOLD = 480;

interface EditableItineraryDayCardProps {
  day: ItineraryDay;
  placesById: Map<string, Place>;
  allPlaces: Place[];
  totalDays: number;
}

export function EditableItineraryDayCard({
  day,
  placesById,
  allPlaces,
  totalDays,
}: EditableItineraryDayCardProps) {
  const { regenerateDay } = useTrip();

  const totalMinutes = day.slots.reduce((sum, slot) => {
    const place = placesById.get(slot.placeId);
    return sum + (place?.estimatedVisitMinutes ?? 0);
  }, 0);
  const isPacked = day.slots.length >= PACKED_SLOT_THRESHOLD && totalMinutes >= PACKED_MINUTES_THRESHOLD;

  const lastSlot = day.slots[day.slots.length - 1];
  const lastPlace = lastSlot ? placesById.get(lastSlot.placeId) : undefined;

  function handleRegenerate(paceOverride?: Pace) {
    regenerateDay(day.dayNumber, allPlaces, paceOverride);
  }

  return (
    <section className="rounded-card border border-sandstone-200/70 bg-ivory-dim p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-h3 font-display text-saffron-600">Day {day.dayNumber}</span>
          {day.theme && <span className="text-body-sm font-medium text-ink-soft">{day.theme}</span>}
        </div>
        <button
          type="button"
          onClick={() => handleRegenerate()}
          className="rounded-full border border-navy-900/20 px-4 py-1.5 text-xs font-medium text-navy-900 transition-colors hover:bg-sandstone-100"
        >
          Regenerate this day
        </button>
      </div>

      {isPacked && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-saffron-600/10 px-4 py-3 text-sm text-navy-900">
          <span>⚠️ This day is quite packed.</span>
          <button
            type="button"
            onClick={() => handleRegenerate("relaxed")}
            className="font-medium text-saffron-600 underline"
          >
            Make it more relaxed
          </button>
        </div>
      )}

      {day.slots.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="A lighter day"
            description="No fresh recommendations left for this day yet — use it to revisit a favourite spot at your own pace."
          />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {day.slots.map((slot, i) => (
              <EditableItinerarySlot
                key={slot.id}
                slot={slot}
                place={placesById.get(slot.placeId)}
                previousPlace={i > 0 ? placesById.get(day.slots[i - 1].placeId) : undefined}
                dayNumber={day.dayNumber}
                isFirst={i === 0}
                isLast={i === day.slots.length - 1}
                totalDays={totalDays}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {lastPlace && (
        <details className="mt-4 rounded-xl bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-navy-900">
            What should you do next?
          </summary>
          <div className="mt-3">
            <NearbySuggestions
              origin={lastPlace}
              curatedNearby={lastPlace.nearbyIds
                .map((id) => placesById.get(id))
                .filter((p): p is Place => Boolean(p))}
              allPlaces={allPlaces}
              framing="whats-next"
            />
          </div>
        </details>
      )}
    </section>
  );
}
