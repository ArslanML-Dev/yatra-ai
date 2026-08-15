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

/** A user-stated or profile-derived location, distinct from
 * ReferencePoint: this represents a *planning* input (where someone is
 * staying, or where they want today's plan to start), not a live/
 * one-off "where am I right now" convenience. Never conflate the two —
 * see NamedLocation-vs-ReferencePoint note on Trip below. */
export interface NamedLocation {
  label: string;
  coordinates: Coordinates;
  source: "user-stated" | "geolocation" | "profile-default";
  capturedAt: string;
}

export type NavigationMode = "off" | "straight-line" | "routed";

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
  /** Ephemeral, live-GPS-or-chosen point used for one-off distance/
   * directions display — "where the user physically is right now",
   * re-derived per use. Not a planning input; see accommodationLocation/
   * startLocation for that. */
  referencePoint: ReferencePoint | null;
  /**
   * All fields below are optional — deliberately, not an oversight.
   * A trip persisted before Phase 4 genuinely won't have them at
   * runtime no matter what the type says, so every read site must
   * default gracefully (`trip.navigationMode ?? "off"`), never assume
   * presence. This is why the storage key/isTrip() guard didn't need
   * to change: an old object is still a structurally valid Trip.
   */
  /** Persistent for the whole trip — where the user is staying. */
  accommodationLocation?: NamedLocation | null;
  /** Optional override for "begin today's plan from here" when it
   * differs from accommodation; falls back to accommodationLocation
   * when null. */
  startLocation?: NamedLocation | null;
  currentDayNumber?: number | null;
  currentSlotId?: string | null;
  navigationMode?: NavigationMode;
  createdAt: string;
  updatedAt: string;
}
