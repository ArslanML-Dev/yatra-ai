import type { Place, TimeOfDaySuitability } from "@/types/place";
import type { ItinerarySlot } from "@/types/itinerary";
import type { Pace } from "@/types/user-preferences";

const SLOT_ORDER: TimeOfDaySuitability[] = ["morning", "afternoon", "evening", "night"];

const SLOTS_BY_PACE: Record<Pace, number> = {
  relaxed: 3,
  moderate: 3,
  packed: 4,
};

function createSlotId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Assigns places to a day's morning/afternoon/evening/night slots.
 * Prefers a place whose suitableTimesOfDay includes the slot; falls back
 * to any unused place if nothing matches, so a day is never left empty
 * when candidates exist. Relaxed pace deliberately fills fewer slots
 * rather than forcing an unrealistic schedule.
 *
 * Locked candidates are guaranteed a slot: if pace-based capacity would
 * otherwise exclude one, it bumps the lowest-priority unlocked pick
 * rather than being silently dropped (a user's explicit choice always
 * wins — see generate-itinerary.ts's guaranteeLockedPlacement for the
 * cross-day backstop).
 */
export function assignSlots(
  candidates: Place[],
  pace: Pace,
  lockedPlaceIds: string[] = [],
): ItinerarySlot[] {
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
      id: createSlotId(),
      timeOfDay,
      placeId: fallback.id,
      note: fallback.bestTime ?? "Approximate timing — allow extra time to enjoy each stop",
      locked: lockedPlaceIds.includes(fallback.id),
    });
  }

  const unplacedLocked = candidates.filter(
    (p) => lockedPlaceIds.includes(p.id) && !used.has(p.id),
  );

  for (const place of unplacedLocked) {
    let victimIndex = -1;
    for (let i = slots.length - 1; i >= 0; i--) {
      if (!slots[i].locked) {
        victimIndex = i;
        break;
      }
    }

    const newSlot: ItinerarySlot = {
      id: createSlotId(),
      timeOfDay: place.suitableTimesOfDay[0] ?? SLOT_ORDER[0],
      placeId: place.id,
      note: place.bestTime ?? "Approximate timing — allow extra time to enjoy each stop",
      locked: true,
    };

    if (victimIndex >= 0) {
      used.delete(slots[victimIndex].placeId);
      slots[victimIndex] = newSlot;
    } else {
      slots.push(newSlot);
    }
    used.add(place.id);
  }

  return slots;
}
