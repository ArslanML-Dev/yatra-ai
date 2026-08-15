import type { Place } from "@/types/place";
import type { UserPreferences } from "@/types/user-preferences";
import type { Trip } from "@/types/trip";
import { generateItinerary } from "@/lib/itinerary/generate-itinerary";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTripFromPreferences(
  places: Place[],
  preferences: UserPreferences,
  lockedPlaceIds: string[] = [],
): Trip {
  const itinerary = generateItinerary(places, preferences, { lockedPlaceIds });
  const now = new Date().toISOString();

  return {
    id: createId(),
    itinerary,
    lockedPlaceIds,
    createdAt: now,
    updatedAt: now,
  };
}
