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

function extractPace(text: string): Pace {
  if (PACE_KEYWORDS.relaxed.some((kw) => text.includes(kw))) return "relaxed";
  if (PACE_KEYWORDS.packed.some((kw) => text.includes(kw))) return "packed";
  return "moderate";
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

export function parsePreferences(
  rawText: string,
  defaults?: Partial<UserPreferences>,
): UserPreferences {
  const text = rawText.toLowerCase();

  const { days, matched: daysMatched } = extractDays(text);
  const { group, matched: groupMatched } = extractGroup(text);
  const interests = extractInterests(text);
  const pace = extractPace(text);
  const budget = extractBudget(text);

  const unresolvedFields: string[] = [];
  if (!daysMatched) unresolvedFields.push("days");
  if (!groupMatched) unresolvedFields.push("group");
  if (interests.length === 0) unresolvedFields.push("interests");

  const confidence: UserPreferences["confidence"] = !daysMatched
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
