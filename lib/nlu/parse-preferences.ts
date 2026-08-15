import type { PlaceCategory } from "@/types/place";
import type {
  Budget,
  GroupType,
  Pace,
  UserPreferences,
} from "@/types/user-preferences";
import { GROUP_KEYWORDS, INTEREST_KEYWORDS, PACE_KEYWORDS, WORD_NUMBERS } from "./patterns";

const DEFAULT_DAYS = 3;
const MIN_DAYS = 1;
const MAX_DAYS = 14;

function clampDays(value: number): number {
  return Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.round(value)));
}

function extractDays(text: string): { days: number; matched: boolean } {
  if (/fortnight/.test(text)) return { days: 14, matched: true };
  if (/long weekend/.test(text)) return { days: 3, matched: true };
  if (/\ba week\b/.test(text)) return { days: 7, matched: true };
  if (/\btwo weeks?\b/.test(text)) return { days: 14, matched: true };

  const nightsMatch = text.match(/(\d{1,2})\s*(?:-|to)?\s*nights?/);
  if (nightsMatch) return { days: clampDays(Number(nightsMatch[1]) + 1), matched: true };

  const digitMatch = text.match(/(\d{1,2})\s*(?:-|to)?\s*days?/);
  if (digitMatch) return { days: clampDays(Number(digitMatch[1])), matched: true };

  for (const [word, value] of Object.entries(WORD_NUMBERS)) {
    if (new RegExp(`\\b${word}\\b\\s*(?:-|to)?\\s*days?`).test(text)) {
      return { days: clampDays(value), matched: true };
    }
  }

  return { days: DEFAULT_DAYS, matched: false };
}

function extractGroup(text: string): { group: GroupType; matched: boolean } {
  for (const [group, keywords] of Object.entries(GROUP_KEYWORDS) as [GroupType, string[]][]) {
    if (keywords.some((kw) => text.includes(kw))) {
      return { group, matched: true };
    }
  }
  return { group: "family", matched: false };
}

function extractInterests(text: string): PlaceCategory[] {
  const found = new Set<PlaceCategory>();
  for (const [category, keywords] of Object.entries(INTEREST_KEYWORDS) as [
    PlaceCategory,
    string[],
  ][]) {
    if (keywords.some((kw) => text.includes(kw))) found.add(category);
  }
  return Array.from(found);
}

function extractPace(text: string): { pace: Pace; matched: boolean } {
  if (PACE_KEYWORDS.relaxed.some((kw) => text.includes(kw))) return { pace: "relaxed", matched: true };
  if (PACE_KEYWORDS.packed.some((kw) => text.includes(kw))) return { pace: "packed", matched: true };
  return { pace: "moderate", matched: false };
}

function extractBudget(text: string): Budget | null {
  const nearBudgetWord = /(budget|spend|spending|rupees|inr|₹)/.test(text);
  if (!nearBudgetWord) return null;

  const match = text.match(/₹?\s?(\d{1,3}(?:,\d{3})*|\d{4,7})\s*(k|thousand)?/);
  if (!match) return null;

  let amount = Number(match[1].replace(/,/g, ""));
  if (Number.isNaN(amount)) return null;
  if (match[2]) amount *= 1000;

  if (amount < 500 || amount > 2_000_000) return null;
  return { amount, currency: "INR" };
}

/**
 * Parses one message's preferences, honoring `defaults` (typically the
 * conversation's accumulated preferences so far) for any field this
 * specific message doesn't itself mention — this is what makes
 * multi-turn accumulation genuine rather than each new message
 * resetting anything unmentioned back to a hardcoded default.
 */
export function parsePreferences(
  rawText: string,
  defaults?: Partial<UserPreferences>,
): UserPreferences {
  const text = rawText.toLowerCase();

  const { days: parsedDays, matched: daysMatched } = extractDays(text);
  const { group: parsedGroup, matched: groupMatched } = extractGroup(text);
  const parsedInterests = extractInterests(text);
  const { pace: parsedPace, matched: paceMatched } = extractPace(text);
  const parsedBudget = extractBudget(text);

  const days = daysMatched ? parsedDays : (defaults?.days ?? parsedDays);
  const group = groupMatched ? parsedGroup : (defaults?.group ?? parsedGroup);
  const interests = parsedInterests.length > 0 ? parsedInterests : (defaults?.interests ?? parsedInterests);
  const pace = paceMatched ? parsedPace : (defaults?.pace ?? parsedPace);
  const budget = parsedBudget ?? defaults?.budget ?? null;

  const daysResolved = daysMatched || defaults?.days !== undefined;
  const groupResolved = groupMatched || defaults?.group !== undefined;
  const interestsResolved = interests.length > 0;

  const unresolvedFields: string[] = [];
  if (!daysResolved) unresolvedFields.push("days");
  if (!groupResolved) unresolvedFields.push("group");
  if (!interestsResolved) unresolvedFields.push("interests");

  const confidence: UserPreferences["confidence"] = !daysResolved
    ? "low"
    : unresolvedFields.length > 0
      ? "medium"
      : "high";

  return {
    destinationId: defaults?.destinationId ?? "lucknow",
    days,
    group,
    interests,
    pace,
    budget,
    rawText,
    confidence,
    unresolvedFields,
  };
}
