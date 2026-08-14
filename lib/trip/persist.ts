import type { Trip } from "@/types/trip";

const TRIP_KEY = "yatra-ai:trip:v1";

function isTrip(value: unknown): value is Trip {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.itinerary === "object" &&
    Array.isArray(v.lockedPlaceIds)
  );
}

/** Reads the stored trip, if any. Never throws — private-mode/quota errors
 * and shape mismatches from an older schema version are treated as "no
 * trip" rather than crashing the app. */
export function loadTrip(): Trip | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TRIP_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isTrip(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveTrip(trip: Trip): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TRIP_KEY, JSON.stringify(trip));
  } catch {
    // Quota exceeded or storage disabled — the trip simply won't persist
    // across reloads this session; the app must keep working regardless.
  }
}

export function clearStoredTrip(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TRIP_KEY);
  } catch {
    // ignore
  }
}
