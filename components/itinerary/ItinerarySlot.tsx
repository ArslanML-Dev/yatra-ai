import Link from "next/link";
import Image from "next/image";
import type { ItinerarySlot as ItinerarySlotType } from "@/types/itinerary";
import type { Place } from "@/types/place";

const TIME_LABELS: Record<ItinerarySlotType["timeOfDay"], string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
};

export function ItinerarySlot({ slot, place }: { slot: ItinerarySlotType; place?: Place }) {
  if (!place) return null;
  const image = place.images[0];

  return (
    <Link
      href={`/place/${place.id}`}
      className="flex gap-4 rounded-xl border border-sandstone-200/70 bg-white p-4 transition-colors hover:border-saffron-400"
    >
      <div className="w-20 shrink-0">
        <p className="text-xs font-medium uppercase tracking-wide text-saffron-600">
          {TIME_LABELS[slot.timeOfDay]}
        </p>
      </div>
      {image && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sandstone-100">
          <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="64px" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-display text-base text-navy-900">{place.name}</p>
        {slot.note && <p className="mt-0.5 text-xs text-ink-soft">{slot.note}</p>}
      </div>
    </Link>
  );
}
