"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ItinerarySlot } from "@/types/itinerary";
import type { Place } from "@/types/place";
import { useTrip } from "@/lib/trip/use-trip";
import { buildGoogleMapsDirectionsUrl } from "@/lib/geo/directions-url";

const TIME_LABELS: Record<ItinerarySlot["timeOfDay"], string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
};

interface EditableItinerarySlotProps {
  slot: ItinerarySlot;
  place?: Place;
  previousPlace?: Place;
  dayNumber: number;
  isFirst: boolean;
  isLast: boolean;
  totalDays: number;
}

export function EditableItinerarySlot({
  slot,
  place,
  previousPlace,
  dayNumber,
  isFirst,
  isLast,
  totalDays,
}: EditableItinerarySlotProps) {
  const { trip, toggleLock, removeStop, reorderStop, moveStopToDay } = useTrip();
  const prefersReducedMotion = useReducedMotion();

  if (!place) return null;
  const image = place.images[0];

  // Honest default origin: the previous stop that day, or the trip's
  // chosen reference point for the first stop, or nothing.
  const directionsOrigin = previousPlace?.coordinates ?? trip?.referencePoint?.coordinates;
  const directionsUrl = buildGoogleMapsDirectionsUrl(place.coordinates, directionsOrigin);

  return (
    <motion.li
      layout={!prefersReducedMotion}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
      className="relative flex gap-3 sm:gap-4"
    >
      {/* Timeline rail: a dot per stop plus a connecting line down to the
          next one — the visual structure that makes this a timeline
          rather than a stack of database rows. */}
      <div aria-hidden="true" className="flex w-4 shrink-0 flex-col items-center">
        <span
          className={`mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 ${
            slot.locked ? "border-saffron-600 bg-saffron-600" : "border-navy-900/30 bg-ivory"
          }`}
        />
        {!isLast && <span className="mt-1 w-px flex-1 bg-sandstone-200" />}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-card border border-sandstone-200/70 bg-white p-4 shadow-soft sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="w-16 shrink-0">
            <p className="text-caption font-medium uppercase text-saffron-600">
              {TIME_LABELS[slot.timeOfDay]}
            </p>
          </div>

          {image && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sandstone-100">
              <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="64px" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <Link href={`/place/${place.id}`} className="font-display text-base text-navy-900 hover:underline">
              {place.name}
            </Link>
            {slot.note && <p className="mt-0.5 text-xs text-ink-soft">{slot.note}</p>}
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-saffron-600 underline"
              >
                🧭 Open in Google Maps{previousPlace ? ` from ${previousPlace.name}` : ""}
              </a>
              <Link href={`/map?highlight=${place.id}`} className="text-xs text-saffron-600 underline">
                View on map
              </Link>
            </div>
          </div>
        </div>

        {/* Actions wrap onto their own line on narrow screens instead of
            forcing the card wider than the viewport. */}
        <div className="flex shrink-0 flex-wrap items-center gap-1 border-t border-sandstone-100 pt-3 sm:border-t-0 sm:pt-0">
          <button
            type="button"
            onClick={() => reorderStop(dayNumber, slot.id, "up")}
            disabled={isFirst}
            aria-label="Move earlier in the day"
            className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-sandstone-100 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => reorderStop(dayNumber, slot.id, "down")}
            disabled={isLast}
            aria-label="Move later in the day"
            className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-sandstone-100 disabled:opacity-30"
          >
            ↓
          </button>
          {totalDays > 1 && (
            <select
              aria-label={`Move ${place.name} to another day`}
              value={dayNumber}
              onChange={(e) => moveStopToDay(slot.id, Number(e.target.value))}
              className="rounded-lg border border-sandstone-200 bg-white px-1 py-1 text-xs text-ink-soft"
            >
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Day {d}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => toggleLock(slot.id)}
            aria-pressed={Boolean(slot.locked)}
            aria-label={slot.locked ? `Unlock ${place.name}` : `Lock ${place.name} as must-visit`}
            className={`overflow-hidden rounded-full p-1.5 transition-colors ${
              slot.locked ? "text-saffron-600" : "text-ink-soft hover:bg-sandstone-100"
            }`}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={slot.locked ? "locked" : "unlocked"}
                className="inline-block"
                initial={prefersReducedMotion ? undefined : { scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 400 }}
              >
                {slot.locked ? "🔒" : "🔓"}
              </motion.span>
            </AnimatePresence>
          </button>
          {!slot.locked && (
            <button
              type="button"
              onClick={() => removeStop(slot.id)}
              aria-label={`Remove ${place.name} from your trip`}
              className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-saffron-600/10 hover:text-saffron-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </motion.li>
  );
}
