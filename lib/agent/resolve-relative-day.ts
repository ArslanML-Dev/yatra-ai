/**
 * Resolves "today"/"tomorrow"/"next day" to an absolute day number,
 * anchored on `currentDayNumber`. Documented fallback: when nothing is
 * currently tracked (`currentDayNumber` is null — true for every trip
 * until Phase 6 navigation starts setting it), day 1 is treated as
 * "today", since a freshly generated trip's first day is the common-case
 * "today" for most users. This is a disclosed assumption, not a guess
 * presented as fact — if the resolved day doesn't exist in the trip,
 * the existing "Your trip doesn't have a Day N" honesty check in
 * execute-edit-intent.ts catches it downstream.
 */
export function resolveRelativeDay(text: string, currentDayNumber: number | null): number | null {
  const anchor = currentDayNumber ?? 1;
  if (/\btoday\b/.test(text)) return anchor;
  if (/\btomorrow\b/.test(text) || /\bnext day\b/.test(text)) return anchor + 1;
  return null;
}
