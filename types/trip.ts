import type { Coordinates } from "./place";
import type { Itinerary } from "./itinerary";

export type ReferencePointKind = "geolocation" | "place" | "none";

/** Ephemeral, live-GPS-or-chosen point used for one-off distance/
 * directions display — "where the user physically is right now",
 * re-derived per use. Deliberately NOT a field on Trip: it's offered on
 * every place page regardless of whether a trip exists yet (e.g. while
 * still browsing/exploring), so it lives at the trip-store level as a
 * sibling of `trip` — see TripContextValue.referencePoint — the same
 * pattern already used for savedPlaceIds. Not a planning input; see
 * NamedLocation below for that. */
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
 * one-off "where am I right now" convenience. Never conflate the two. */
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
 * to it — locked/removed/reordered stops, day-by-day progress — and
 * persists across sessions via localStorage.
 */
export interface Trip {
  id: string;
  itinerary: Itinerary;
  lockedPlaceIds: string[];
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
