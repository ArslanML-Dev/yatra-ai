export const REMOVE_VERBS = ["remove", "drop", "delete", "cut", "skip"];
export const KEEP_VERBS = ["keep", "lock", "must visit", "must-visit"];
export const MOVE_VERBS = ["move", "shift", "reschedule"];
export const ADD_NEAR_PHRASES = ["add something near", "add a place near", "something near", "add near"];
export const RELAX_WORDS = ["relaxed", "relax", "slower", "less packed", "lighter"];
export const PACK_WORDS = ["packed", "pack", "busier", "more to do", "fuller"];
export const REDUCE_BUDGET_WORDS = ["reduce the budget", "lower the budget", "cheaper", "less budget"];
export const INCREASE_BUDGET_WORDS = ["increase the budget", "higher budget", "more budget", "bigger budget"];

const DAY_WORD_NUMBERS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
};

export function extractDayNumber(text: string): number | null {
  const digitMatch = text.match(/day\s*(\d{1,2})/i);
  if (digitMatch) return Number(digitMatch[1]);

  for (const [word, value] of Object.entries(DAY_WORD_NUMBERS)) {
    if (new RegExp(`day\\s*${word}\\b`, "i").test(text)) return value;
  }
  return null;
}
