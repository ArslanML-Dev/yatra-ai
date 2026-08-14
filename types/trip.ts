import type { Coordinates } from "./place";
import type { Itinerary } from "./itinerary";

export type ReferencePointKind = "geolocation" | "place" | "none";

export interface ReferencePoint {
  kind: ReferencePointKind;
  label: string;
  coordinates: Coordinates;
  placeId?: string;
  capturedAt: string;
}

/**
 * Device-local, editable trip state. Distinct from Itinerary (a pure
 * generation output) because a Trip is what the user has actually done
 * to it — locked/removed/reordered stops, a chosen reference point —
 * and persists across sessions via localStorage.
 */
export interface Trip {
  id: string;
  itinerary: Itinerary;
  lockedPlaceIds: string[];
  referencePoint: ReferencePoint | null;
  createdAt: string;
  updatedAt: string;
}
