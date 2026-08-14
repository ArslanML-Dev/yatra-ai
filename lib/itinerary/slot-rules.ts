import type { Place, TimeOfDaySuitability } from "@/types/place";
import type { ItinerarySlot } from "@/types/itinerary";
import type { Pace } from "@/types/user-preferences";

const SLOT_ORDER: TimeOfDaySuitability[] = ["morning", "afternoon", "evening", "night"];

const SLOTS_BY_PACE: Record<Pace, number> = {
  relaxed: 3,
  moderate: 3,
  packed: 4,
};

/**
 * Assigns places to a day's morning/afternoon/evening/night slots.
 * Prefers a place whose suitableTimesOfDay includes the slot; falls back
 * to any unused place if nothing matches, so a day is never left empty
 * when candidates exist. Relaxed pace deliberately fills fewer slots
 * rather than forcing an unrealistic schedule.
 */
export function assignSlots(candidates: Place[], pace: Pace): ItinerarySlot[] {
  const maxSlots = SLOTS_BY_PACE[pace];
  const used = new Set<string>();
  const slots: ItinerarySlot[] = [];

  for (const timeOfDay of SLOT_ORDER.slice(0, maxSlots)) {
    const preferred = candidates.find(
      (p) => !used.has(p.id) && p.suitableTimesOfDay.includes(timeOfDay),
    );
    const fallback = preferred ?? candidates.find((p) => !used.has(p.id));

    if (!fallback) continue;

    used.add(fallback.id);
    slots.push({
      timeOfDay,
      placeId: fallback.id,
      note: fallback.bestTime ?? "Approximate timing — allow extra time to enjoy each stop",
    });
  }

  return slots;
}
