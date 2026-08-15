import type { Place, PlaceCategory, TimeOfDaySuitability } from "@/types/place";
import type { Itinerary, ItineraryDay, ItinerarySlot } from "@/types/itinerary";
import type { Pace, UserPreferences } from "@/types/user-preferences";
import type { NamedLocation, NavigationMode, ReferencePoint, Trip } from "@/types/trip";
import { generateItinerary } from "@/lib/itinerary/generate-itinerary";

export type TripState = Trip | null;

export type TripAction =
  | { type: "START_TRIP"; trip: Trip }
  | { type: "CLEAR_TRIP" }
  | { type: "ADD_STOP"; dayNumber: number; place: Place }
  | { type: "ADD_AND_LOCK_STOP"; dayNumber: number; place: Place }
  | { type: "REMOVE_STOP"; slotId: string }
  | { type: "REMOVE_MATCHING_CATEGORY"; category: PlaceCategory; placesById: Map<string, Place> }
  | { type: "REORDER_STOP"; dayNumber: number; slotId: string; direction: "up" | "down" }
  | { type: "MOVE_STOP_TO_DAY"; slotId: string; toDayNumber: number }
  | { type: "TOGGLE_LOCK"; slotId: string }
  | { type: "REGENERATE_DAY"; dayNumber: number; allPlaces: Place[]; paceOverride?: Pace }
  | { type: "UPDATE_PREFERENCES"; preferences: Partial<UserPreferences>; allPlaces: Place[] }
  | {
      type: "UPDATE_PREFERENCE_METADATA";
      preferences: Partial<Pick<UserPreferences, "walkingTolerance" | "foodPreferences">>;
    }
  | { type: "SET_REFERENCE_POINT"; referencePoint: ReferencePoint | null }
  | { type: "SET_CURRENT_STOP"; dayNumber: number; slotId: string }
  | { type: "MARK_VISITED"; slotId: string }
  | { type: "MARK_SKIPPED"; slotId: string }
  | { type: "SET_NAVIGATION_MODE"; mode: NavigationMode }
  | { type: "SET_ACCOMMODATION_LOCATION"; location: NamedLocation | null }
  | { type: "SET_START_LOCATION"; location: NamedLocation | null }
  | { type: "ADVANCE_TO_NEXT_STOP" };

const TIME_ORDER: TimeOfDaySuitability[] = ["morning", "afternoon", "evening", "night"];

function createSlotId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Keeps a day's time-of-day labels sequential after structural edits
 * (add/remove/reorder/move) rather than leaving stale/duplicate labels. */
export function relabelSlots(slots: ItinerarySlot[]): ItinerarySlot[] {
  return slots.map((slot, i) => ({
    ...slot,
    timeOfDay: TIME_ORDER[Math.min(i, TIME_ORDER.length - 1)],
  }));
}

export function deriveLockedPlaceIds(itinerary: Itinerary): string[] {
  const ids = new Set<string>();
  for (const day of itinerary.days) {
    for (const slot of day.slots) {
      if (slot.locked) ids.add(slot.placeId);
    }
  }
  return Array.from(ids);
}

function touch(trip: Trip, itinerary: Itinerary): Trip {
  return {
    ...trip,
    itinerary,
    lockedPlaceIds: deriveLockedPlaceIds(itinerary),
    updatedAt: new Date().toISOString(),
  };
}

function findDay(itinerary: Itinerary, dayNumber: number): ItineraryDay | undefined {
  return itinerary.days.find((d) => d.dayNumber === dayNumber);
}

function findLeastFullDay(itinerary: Itinerary): ItineraryDay {
  return itinerary.days.reduce((least, day) =>
    day.slots.length < least.slots.length ? day : least,
  );
}

function findSlotLocation(
  itinerary: Itinerary,
  slotId: string,
): { day: ItineraryDay; index: number } | null {
  for (const day of itinerary.days) {
    const index = day.slots.findIndex((s) => s.id === slotId);
    if (index >= 0) return { day, index };
  }
  return null;
}

/** Every slot in display order (day array order, then slot array order
 * within each day) — both already display order elsewhere in this file
 * (e.g. REORDER_STOP). Empty days simply contribute nothing. */
function flattenSlotsInOrder(itinerary: Itinerary): { dayNumber: number; slot: ItinerarySlot }[] {
  const flat: { dayNumber: number; slot: ItinerarySlot }[] = [];
  for (const day of itinerary.days) {
    for (const slot of day.slots) flat.push({ dayNumber: day.dayNumber, slot });
  }
  return flat;
}

function isPending(slot: ItinerarySlot): boolean {
  return !slot.visited && !slot.skipped;
}

export function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case "START_TRIP":
      return action.trip;

    case "CLEAR_TRIP":
      return null;

    case "ADD_STOP": {
      if (!state) return state;
      const day = findDay(state.itinerary, action.dayNumber);
      if (!day) return state;

      const newSlot: ItinerarySlot = {
        id: createSlotId(),
        timeOfDay: "night",
        placeId: action.place.id,
        note: action.place.bestTime ?? "Approximate timing — allow extra time to enjoy each stop",
        locked: false,
      };

      const days = state.itinerary.days.map((d) =>
        d.dayNumber === action.dayNumber
          ? { ...d, slots: relabelSlots([...d.slots, newSlot]) }
          : d,
      );
      return touch(state, { ...state.itinerary, days });
    }

    case "ADD_AND_LOCK_STOP": {
      if (!state) return state;
      const day = findDay(state.itinerary, action.dayNumber) ?? findLeastFullDay(state.itinerary);

      const newSlot: ItinerarySlot = {
        id: createSlotId(),
        timeOfDay: "night",
        placeId: action.place.id,
        note: action.place.bestTime ?? "Approximate timing — allow extra time to enjoy each stop",
        locked: true,
      };

      const days = state.itinerary.days.map((d) =>
        d.dayNumber === day.dayNumber ? { ...d, slots: relabelSlots([...d.slots, newSlot]) } : d,
      );
      return touch(state, { ...state.itinerary, days });
    }

    case "REMOVE_MATCHING_CATEGORY": {
      if (!state) return state;
      const days = state.itinerary.days.map((d) => ({
        ...d,
        slots: relabelSlots(
          d.slots.filter((s) => {
            if (s.locked) return true;
            const place = action.placesById.get(s.placeId);
            return !place || place.category !== action.category;
          }),
        ),
      }));
      return touch(state, { ...state.itinerary, days });
    }

    case "REMOVE_STOP": {
      if (!state) return state;
      const location = findSlotLocation(state.itinerary, action.slotId);
      if (!location || location.day.slots[location.index].locked) return state;

      const days = state.itinerary.days.map((d) =>
        d.dayNumber === location.day.dayNumber
          ? { ...d, slots: relabelSlots(d.slots.filter((s) => s.id !== action.slotId)) }
          : d,
      );
      return touch(state, { ...state.itinerary, days });
    }

    case "REORDER_STOP": {
      if (!state) return state;
      const day = findDay(state.itinerary, action.dayNumber);
      if (!day) return state;

      const index = day.slots.findIndex((s) => s.id === action.slotId);
      if (index < 0) return state;
      const targetIndex = action.direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= day.slots.length) return state;

      const slots = [...day.slots];
      [slots[index], slots[targetIndex]] = [slots[targetIndex], slots[index]];

      const days = state.itinerary.days.map((d) =>
        d.dayNumber === action.dayNumber ? { ...d, slots: relabelSlots(slots) } : d,
      );
      return touch(state, { ...state.itinerary, days });
    }

    case "MOVE_STOP_TO_DAY": {
      if (!state) return state;
      const location = findSlotLocation(state.itinerary, action.slotId);
      if (!location) return state;
      if (location.day.dayNumber === action.toDayNumber) return state;

      const movingSlot = location.day.slots[location.index];
      const targetDay = findDay(state.itinerary, action.toDayNumber);
      if (!targetDay) return state;

      const days = state.itinerary.days.map((d) => {
        if (d.dayNumber === location.day.dayNumber) {
          return { ...d, slots: relabelSlots(d.slots.filter((s) => s.id !== action.slotId)) };
        }
        if (d.dayNumber === action.toDayNumber) {
          return { ...d, slots: relabelSlots([...d.slots, movingSlot]) };
        }
        return d;
      });
      return touch(state, { ...state.itinerary, days });
    }

    case "TOGGLE_LOCK": {
      if (!state) return state;
      const location = findSlotLocation(state.itinerary, action.slotId);
      if (!location) return state;

      const days = state.itinerary.days.map((d) =>
        d.dayNumber === location.day.dayNumber
          ? {
              ...d,
              slots: d.slots.map((s) =>
                s.id === action.slotId ? { ...s, locked: !s.locked } : s,
              ),
            }
          : d,
      );
      return touch(state, { ...state.itinerary, days });
    }

    case "REGENERATE_DAY": {
      if (!state) return state;
      const targetDay = findDay(state.itinerary, action.dayNumber);
      if (!targetDay) return state;

      const usedElsewhere = new Set<string>();
      for (const day of state.itinerary.days) {
        if (day.dayNumber === action.dayNumber) continue;
        for (const slot of day.slots) usedElsewhere.add(slot.placeId);
      }

      const lockedHereIds = targetDay.slots.filter((s) => s.locked).map((s) => s.placeId);
      const availablePlaces = action.allPlaces.filter((p) => !usedElsewhere.has(p.id));

      const regenerated = generateItinerary(
        availablePlaces,
        {
          ...state.itinerary.preferences,
          days: 1,
          pace: action.paceOverride ?? state.itinerary.preferences.pace,
        },
        { lockedPlaceIds: lockedHereIds },
      );

      const newDay: ItineraryDay = {
        ...regenerated.days[0],
        dayNumber: action.dayNumber,
      };

      const days = state.itinerary.days.map((d) =>
        d.dayNumber === action.dayNumber ? newDay : d,
      );
      return touch(state, { ...state.itinerary, days });
    }

    case "UPDATE_PREFERENCES": {
      if (!state) return state;
      const mergedPreferences: UserPreferences = {
        ...state.itinerary.preferences,
        ...action.preferences,
      };
      const regenerated = generateItinerary(action.allPlaces, mergedPreferences, {
        lockedPlaceIds: state.lockedPlaceIds,
      });
      return touch(state, regenerated);
    }

    case "SET_REFERENCE_POINT":
      if (!state) return state;
      return { ...state, referencePoint: action.referencePoint, updatedAt: new Date().toISOString() };

    /**
     * Patches ONLY walkingTolerance/foodPreferences on the trip's
     * preferences object. Deliberately does NOT call generateItinerary
     * and does NOT go through touch() — itinerary.days must come out
     * byte-identical, since these fields don't yet feed scoring (see
     * lib/itinerary/*, frozen). This is a metadata write, not an edit
     * to the plan.
     */
    case "UPDATE_PREFERENCE_METADATA": {
      if (!state) return state;
      return {
        ...state,
        itinerary: {
          ...state.itinerary,
          preferences: { ...state.itinerary.preferences, ...action.preferences },
        },
        updatedAt: new Date().toISOString(),
      };
    }

    case "SET_CURRENT_STOP": {
      if (!state) return state;
      const day = findDay(state.itinerary, action.dayNumber);
      if (!day || !day.slots.some((s) => s.id === action.slotId)) return state;
      return {
        ...state,
        currentDayNumber: action.dayNumber,
        currentSlotId: action.slotId,
        updatedAt: new Date().toISOString(),
      };
    }

    case "MARK_VISITED": {
      if (!state) return state;
      const location = findSlotLocation(state.itinerary, action.slotId);
      if (!location) return state;

      const days = state.itinerary.days.map((d) =>
        d.dayNumber === location.day.dayNumber
          ? {
              ...d,
              slots: d.slots.map((s) =>
                s.id === action.slotId ? { ...s, visited: true, skipped: false } : s,
              ),
            }
          : d,
      );
      return touch(state, { ...state.itinerary, days });
    }

    case "MARK_SKIPPED": {
      if (!state) return state;
      const location = findSlotLocation(state.itinerary, action.slotId);
      if (!location) return state;

      const days = state.itinerary.days.map((d) =>
        d.dayNumber === location.day.dayNumber
          ? {
              ...d,
              slots: d.slots.map((s) =>
                s.id === action.slotId ? { ...s, skipped: true, visited: false } : s,
              ),
            }
          : d,
      );
      return touch(state, { ...state.itinerary, days });
    }

    case "SET_NAVIGATION_MODE":
      if (!state) return state;
      return { ...state, navigationMode: action.mode, updatedAt: new Date().toISOString() };

    case "SET_ACCOMMODATION_LOCATION":
      if (!state) return state;
      return { ...state, accommodationLocation: action.location, updatedAt: new Date().toISOString() };

    case "SET_START_LOCATION":
      if (!state) return state;
      return { ...state, startLocation: action.location, updatedAt: new Date().toISOString() };

    /**
     * Marks the current slot visited (unless it was already explicitly
     * skipped — advancing past a skipped stop must never silently turn
     * it into a visited one) then moves currentDayNumber/currentSlotId
     * to the next pending (neither visited nor skipped) slot in display
     * order, walking across day boundaries and over empty days. If
     * nothing is currently set, it just finds the first pending slot
     * without marking anything. If nothing pending remains anywhere,
     * clears currentDayNumber/currentSlotId to null. Genuinely no-op
     * calls (nothing to mark, nothing to advance to) return `state`
     * unchanged rather than bumping updatedAt, matching the no-op
     * convention already used elsewhere in this reducer (e.g.
     * REORDER_STOP at an invalid index).
     */
    case "ADVANCE_TO_NEXT_STOP": {
      if (!state) return state;

      let days = state.itinerary.days;
      let markedSomething = false;

      if (state.currentSlotId) {
        const location = findSlotLocation(state.itinerary, state.currentSlotId);
        if (location && !location.day.slots[location.index].skipped) {
          markedSomething = true;
          days = days.map((d) =>
            d.dayNumber === location.day.dayNumber
              ? {
                  ...d,
                  slots: d.slots.map((s) =>
                    s.id === state.currentSlotId ? { ...s, visited: true, skipped: false } : s,
                  ),
                }
              : d,
          );
        }
      }

      const updatedItinerary = { ...state.itinerary, days };
      const next = flattenSlotsInOrder(updatedItinerary).find(({ slot }) => isPending(slot));

      const nextDayNumber = next?.dayNumber ?? null;
      const nextSlotId = next?.slot.id ?? null;
      const positionChanged = nextDayNumber !== (state.currentDayNumber ?? null) || nextSlotId !== (state.currentSlotId ?? null);

      if (!markedSomething && !positionChanged) return state;

      const touched = touch(state, updatedItinerary);
      return { ...touched, currentDayNumber: nextDayNumber, currentSlotId: nextSlotId };
    }

    default:
      return state;
  }
}
