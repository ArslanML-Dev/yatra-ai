import type { Profile } from "@/types/profile";

const PROFILE_KEY = "yatra-ai:profile:v1";

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.preferences === "object" &&
    v.preferences !== null &&
    typeof v.updatedAt === "string"
  );
}

/** Reads the stored profile, if any. Never throws — private-mode/quota
 * errors and shape mismatches are treated as "no profile" rather than
 * crashing the app. Mirrors lib/trip/persist.ts exactly. */
export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Quota exceeded or storage disabled — the profile simply won't
    // persist across reloads; the app must keep working regardless.
  }
}

export function clearStoredProfile(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    // ignore
  }
}
