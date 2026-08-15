import type { Itinerary } from "@/types/itinerary";
import type { Trip } from "@/types/trip";
import { deriveLockedPlaceIds } from "./trip-reducer";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Wraps an already-generated Itinerary (e.g. from server-side
 * generateItinerary()) into a device-local editable Trip, without
 * re-running generation. */
export function wrapItineraryAsTrip(itinerary: Itinerary): Trip {
  const now = new Date().toISOString();
  return {
    id: createId(),
    itinerary,
    lockedPlaceIds: deriveLockedPlaceIds(itinerary),
    referencePoint: null,
    accommodationLocation: null,
    startLocation: null,
    currentDayNumber: null,
    currentSlotId: null,
    navigationMode: "off",
    createdAt: now,
    updatedAt: now,
  };
}
