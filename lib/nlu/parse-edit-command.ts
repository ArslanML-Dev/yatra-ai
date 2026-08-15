import type { Place, PlaceCategory } from "@/types/place";
import type { Pace } from "@/types/user-preferences";
import { INTEREST_KEYWORDS } from "./patterns";
import { matchNamedPlaces } from "./named-place-matcher";
import {
  ADD_NEAR_PHRASES,
  extractDayNumber,
  INCREASE_BUDGET_WORDS,
  KEEP_VERBS,
  MOVE_VERBS,
  PACK_WORDS,
  REDUCE_BUDGET_WORDS,
  RELAX_WORDS,
  REMOVE_VERBS,
} from "./edit-command-patterns";

export type EditIntent =
  | { kind: "remove-category"; category: PlaceCategory }
  | { kind: "remove-place"; placeId: string; placeName: string }
  | { kind: "keep-place"; placeId: string; placeName: string }
  | { kind: "add-near"; anchorPlaceId: string; anchorName: string }
  | { kind: "move-place"; placeId: string; placeName: string; toDayNumber: number }
  | { kind: "day-pace"; dayNumber: number; pace: Pace }
  | { kind: "budget-adjust"; direction: "reduce" | "increase" }
  | { kind: "unrecognized" };

function matchesAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

function findCategory(text: string): PlaceCategory | null {
  for (const [category, keywords] of Object.entries(INTEREST_KEYWORDS) as [
    PlaceCategory,
    string[],
  ][]) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return null;
}

/**
 * Deterministic, keyword/regex-based edit-command recognizer — no LLM.
 * Always returns a concrete intent, including an honest "unrecognized"
 * result rather than ever silently no-op-ing on unmatched input.
 */
export function parseEditCommand(rawText: string, places: Place[]): EditIntent {
  const text = rawText.toLowerCase().trim();

  const dayNumber = extractDayNumber(text);
  if (dayNumber !== null) {
    if (matchesAny(text, RELAX_WORDS)) return { kind: "day-pace", dayNumber, pace: "relaxed" };
    if (matchesAny(text, PACK_WORDS)) return { kind: "day-pace", dayNumber, pace: "packed" };
  }

  if (matchesAny(text, REDUCE_BUDGET_WORDS)) return { kind: "budget-adjust", direction: "reduce" };
  if (matchesAny(text, INCREASE_BUDGET_WORDS)) return { kind: "budget-adjust", direction: "increase" };

  if (KEEP_VERBS.some((verb) => text.includes(verb))) {
    const named = matchNamedPlaces(text, places);
    if (named.length > 0) return { kind: "keep-place", placeId: named[0].id, placeName: named[0].name };
  }

  const nearPhrase = ADD_NEAR_PHRASES.find((phrase) => text.includes(phrase));
  if (nearPhrase) {
    const afterPhrase = text.slice(text.indexOf(nearPhrase) + nearPhrase.length);
    const named = matchNamedPlaces(afterPhrase, places);
    if (named.length > 0) {
      return { kind: "add-near", anchorPlaceId: named[0].id, anchorName: named[0].name };
    }
  }

  if (dayNumber !== null && MOVE_VERBS.some((verb) => text.includes(verb))) {
    const named = matchNamedPlaces(text, places);
    if (named.length > 0) {
      return { kind: "move-place", placeId: named[0].id, placeName: named[0].name, toDayNumber: dayNumber };
    }
  }

  if (REMOVE_VERBS.some((verb) => text.includes(verb))) {
    const named = matchNamedPlaces(text, places);
    if (named.length > 0) {
      return { kind: "remove-place", placeId: named[0].id, placeName: named[0].name };
    }
    const category = findCategory(text);
    if (category) return { kind: "remove-category", category };
  }

  return { kind: "unrecognized" };
}

export const EDIT_COMMAND_EXAMPLES = [
  "remove shopping",
  "keep Tunday Kababi",
  "add something near Bara Imambara",
  "make day 2 more relaxed",
  "reduce the budget",
];
