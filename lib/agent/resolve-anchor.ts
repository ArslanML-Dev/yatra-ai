import type { Place } from "@/types/place";
import type { ReferencePoint, Trip } from "@/types/trip";
import type { ResolvedAnchor } from "@/types/conversation";

/**
 * Resolves "here"/"nearby"/an unspecified location anchor in this fixed
 * priority order, stopping at the first available source:
 *
 *  1. Live location — a fresh `referencePoint` of kind "geolocation".
 *     Trip-independent (see types/trip.ts) — available even before a
 *     trip exists.
 *  2. Current physical/navigation position — NOT implemented here. Live
 *     GPS tracking during navigation lives in the client-side
 *     use-live-navigation hook (Phase 6 territory) and isn't wired to
 *     Trip yet, so this pure function genuinely has no access to it.
 *     Skipping this tier honestly rather than pretending to check it.
 *  3. Current itinerary stop (`trip.currentSlotId`) — requires a trip.
 *  4. Accommodation or start location — requires a trip.
 *  5. Unresolved — returns null; the caller must ask the user, never
 *     guess or fabricate a location.
 *
 * A navigation *destination* is never used here — resolving "here" to
 * where the user is heading instead of where they are would silently
 * conflate two different concepts. Nothing in this function reads a
 * destination.
 */
export function resolveContextualAnchor(
  trip: Trip | null,
  referencePoint: ReferencePoint | null,
  placesById: Map<string, Place>,
): ResolvedAnchor | null {
  if (referencePoint?.kind === "geolocation") {
    return {
      label: referencePoint.label,
      coordinates: referencePoint.coordinates,
      source: "live-location",
    };
  }

  if (!trip) return null;

  if (trip.currentSlotId) {
    for (const day of trip.itinerary.days) {
      const slot = day.slots.find((s) => s.id === trip.currentSlotId);
      if (slot) {
        const place = placesById.get(slot.placeId);
        if (place) {
          return { label: place.name, coordinates: place.coordinates, source: "current-stop" };
        }
        break;
      }
    }
  }

  const named = trip.startLocation ?? trip.accommodationLocation;
  if (named) {
    return {
      label: named.label,
      coordinates: named.coordinates,
      source: named === trip.startLocation ? "start-location" : "accommodation",
    };
  }

  return null;
}
