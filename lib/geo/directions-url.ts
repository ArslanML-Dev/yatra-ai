import type { Coordinates } from "@/types/place";

/** Builds a real, working Google Maps directions deep link — no API key
 * required. `dir_action=navigate` tells the Google Maps app, when
 * installed, to jump straight into turn-by-turn navigation instead of a
 * route-selection screen the user has to act on first. Has no effect in
 * a desktop browser (there's no GPS to navigate with there) — desktop
 * correctly just gets the full route/directions panel, which is the
 * right desktop behavior, not a bug. */
export function buildGoogleMapsDirectionsUrl(destination: Coordinates, origin?: Coordinates): string {
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving",
    dir_action: "navigate",
  });
  if (origin) params.set("origin", `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Apple Maps' directions deep link — the `http://maps.apple.com` form
 * works both as a universal link (opens the Maps app on iOS if
 * installed) and as a plain web fallback, so it doesn't need the
 * custom `maps://` scheme or a try/catch fallback dance. */
export function buildAppleMapsDirectionsUrl(destination: Coordinates, origin?: Coordinates): string {
  const params = new URLSearchParams({
    daddr: `${destination.lat},${destination.lng}`,
    dirflg: "d",
  });
  if (origin) params.set("saddr", `${origin.lat},${origin.lng}`);
  return `http://maps.apple.com/?${params.toString()}`;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  // Modern iPadOS reports as "MacIntel" but (unlike a real Mac) exposes
  // touch points — the standard feature-detection workaround.
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** The one place that decides which maps app a "Get directions" link
 * should target: Apple Maps on iOS (where it's the OS default many
 * users never change), Google Maps everywhere else. Server-rendered
 * output always defaults to Google Maps (there's no real platform to
 * detect yet); call sites that need the iOS-correct link should read
 * this from a client-only render pass, not trust the SSR value. */
export function getDirectionsLink(
  destination: Coordinates,
  origin?: Coordinates,
): { url: string; label: string } {
  if (isIOS()) {
    return { url: buildAppleMapsDirectionsUrl(destination, origin), label: "Apple Maps" };
  }
  return { url: buildGoogleMapsDirectionsUrl(destination, origin), label: "Google Maps" };
}
