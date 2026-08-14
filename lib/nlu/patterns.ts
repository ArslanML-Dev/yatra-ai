import type { GroupType, Pace } from "@/types/user-preferences";
import type { PlaceCategory } from "@/types/place";

export const WORD_NUMBERS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

export const GROUP_KEYWORDS: Record<GroupType, string[]> = {
  family: ["family", "kids", "kid", "children", "child", "parents"],
  couple: ["wife", "husband", "partner", "honeymoon", "girlfriend", "boyfriend", "couple"],
  friends: ["friends", "buddies", "group of friends", "gang"],
  solo: ["solo", "alone", "by myself", "myself"],
  business: ["business", "work trip", "conference", "colleagues", "corporate"],
};

export const INTEREST_KEYWORDS: Record<PlaceCategory, string[]> = {
  heritage: [
    "heritage",
    "history",
    "historical",
    "imambara",
    "monument",
    "monuments",
    "culture",
    "cultural",
    "architecture",
  ],
  food: [
    "food",
    "eat",
    "eating",
    "kebab",
    "kebabs",
    "cuisine",
    "restaurant",
    "restaurants",
    "street food",
    "awadhi",
    "biryani",
    "kababi",
  ],
  shopping: ["shopping", "chikankari", "chikan", "markets", "market", "bazaar", "souvenirs"],
  parks: ["park", "parks", "garden", "gardens", "green", "nature", "walk", "riverfront"],
  modern: ["mall", "malls", "modern", "entertainment", "stadium", "contemporary"],
  riverfront_evening: ["evening", "gomti", "riverside", "sunset"],
  transport: ["airport", "station", "transport"],
};

export const PACE_KEYWORDS: Record<Exclude<Pace, "moderate">, string[]> = {
  relaxed: ["relaxed", "slow", "not rushed", "no rush", "leisurely", "peaceful", "easy"],
  packed: ["packed", "fast", "maximum", "see everything", "jam-packed", "jam packed", "action-packed"],
};
