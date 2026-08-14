import type { GroupType } from "@/types/user-preferences";

export type BudgetTier = "budget" | "moderate" | "premium";

export interface BudgetCategoryEstimate {
  label: string;
  amount: number;
}

export interface BudgetBreakdown {
  tier: BudgetTier;
  totalEstimate: number;
  perDayPerPerson: number;
  groupSize: number;
  categories: BudgetCategoryEstimate[];
  disclaimer: string;
}

/** Documented, explicit assumption — not a live or scraped figure. */
const GROUP_SIZE_HEURISTIC: Record<GroupType, number> = {
  solo: 1,
  couple: 2,
  family: 4,
  friends: 4,
  business: 1,
};

const PER_PERSON_PER_DAY_INR: Record<BudgetTier, number> = {
  budget: 700,
  moderate: 1400,
  premium: 2800,
};

/** Category split of the per-day estimate — local transport, food,
 * attractions/shopping and a buffer. Excludes accommodation (no hotel
 * data in this build). */
const CATEGORY_SPLIT: { label: string; share: number }[] = [
  { label: "Food", share: 0.35 },
  { label: "Local transport", share: 0.2 },
  { label: "Attractions & shopping", share: 0.3 },
  { label: "Buffer / miscellaneous", share: 0.15 },
];

export function tierForBudgetAmount(amount: number | null, days: number): BudgetTier {
  if (!amount || days <= 0) return "moderate";
  const perDay = amount / days;
  if (perDay <= PER_PERSON_PER_DAY_INR.budget * 1.3) return "budget";
  if (perDay >= PER_PERSON_PER_DAY_INR.premium * 0.8) return "premium";
  return "moderate";
}

export function estimateBudget(params: {
  days: number;
  group: GroupType;
  tier: BudgetTier;
}): BudgetBreakdown {
  const { days, group, tier } = params;
  const groupSize = GROUP_SIZE_HEURISTIC[group];
  const perDayPerPerson = PER_PERSON_PER_DAY_INR[tier];
  const totalEstimate = perDayPerPerson * Math.max(1, days) * groupSize;

  const categories = CATEGORY_SPLIT.map((c) => ({
    label: c.label,
    amount: Math.round((totalEstimate * c.share) / 100) * 100,
  }));

  return {
    tier,
    totalEstimate,
    perDayPerPerson,
    groupSize,
    categories,
    disclaimer:
      "Estimated — based on typical Lucknow costs for this group size and pace, not live prices. Accommodation isn't included.",
  };
}
