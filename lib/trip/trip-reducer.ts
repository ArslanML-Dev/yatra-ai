import type { Place, PlaceCategory, TimeOfDaySuitability } from "@/types/place";
import type { Itinerary, ItineraryDay, ItinerarySlot } from "@/types/itinerary";
import type { Pace, UserPreferences } from "@/types/user-preferences";
import type { ReferencePoint, Trip } from "@/types/trip";
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
  | { type: "SET_REFERENCE_POINT"; referencePoint: ReferencePoint | null };

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

    default:
      return state;
  }
}
