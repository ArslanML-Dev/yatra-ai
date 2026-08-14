import type { Coordinates } from "@/types/place";

/** Builds a real, working Google Maps directions deep link — no API key
 * required. Shared across place detail, itinerary stops and map markers
 * so every "Get directions" link uses the identical, already-proven
 * pattern rather than each re-deriving its own URL. */
export function buildGoogleMapsDirectionsUrl(destination: Coordinates, origin?: Coordinates): string {
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
  });
  if (origin) params.set("origin", `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
