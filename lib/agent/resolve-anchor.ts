import type { Place } from "@/types/place";
import type { Trip } from "@/types/trip";
import type { ResolvedAnchor } from "@/types/conversation";

/**
 * Resolves "here"/"nearby"/an unspecified location anchor in this fixed
 * priority order, stopping at the first available source:
 *
 *  1. Live location — a fresh `referencePoint` of kind "geolocation".
 *  2. Current physical/navigation position — NOT implemented here. Live
 *     GPS tracking during navigation lives in the client-side
 *     use-live-navigation hook (Phase 6 territory) and isn't wired to
 *     Trip yet, so this pure function genuinely has no access to it.
 *     Skipping this tier honestly rather than pretending to check it.
 *  3. Current itinerary stop (`trip.currentSlotId`).
 *  4. Accommodation or start location.
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
  placesById: Map<string, Place>,
): ResolvedAnchor | null {
  if (!trip) return null;

  if (trip.referencePoint?.kind === "geolocation") {
    return {
      label: trip.referencePoint.label,
      coordinates: trip.referencePoint.coordinates,
      source: "live-location",
    };
  }

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
