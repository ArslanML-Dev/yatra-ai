const SAVED_PLACES_KEY = "yatra-ai:saved-places:v1";

/**
 * Independent persistence lifecycle from the trip itself — clearing or
 * regenerating a trip must never wipe out a user's saved/favourite places.
 */
export function loadSavedPlaceIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_PLACES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveSavedPlaceIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(ids));
  } catch {
    // ignore — favourites simply won't persist this session
  }
}
