import type { ItineraryDay } from "@/types/itinerary";
import type { Place } from "@/types/place";
import { ItinerarySlot } from "./ItinerarySlot";
import { EmptyState } from "@/components/ui/EmptyState";

interface ItineraryDayCardProps {
  day: ItineraryDay;
  placesById: Map<string, Place>;
}

export function ItineraryDayCard({ day, placesById }: ItineraryDayCardProps) {
  return (
    <section className="rounded-2xl border border-sandstone-200/70 bg-ivory-dim p-6">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl text-saffron-600">Day {day.dayNumber}</span>
        {day.theme && <span className="text-sm font-medium text-ink-soft">{day.theme}</span>}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {day.slots.length === 0 ? (
          <EmptyState
            title="A lighter day"
            description="No fresh recommendations left for this day yet — use it to revisit a favourite spot at your own pace."
          />
        ) : (
          day.slots.map((slot) => (
            <ItinerarySlot key={`${slot.timeOfDay}-${slot.placeId}`} slot={slot} place={placesById.get(slot.placeId)} />
          ))
        )}
      </div>
    </section>
  );
}
