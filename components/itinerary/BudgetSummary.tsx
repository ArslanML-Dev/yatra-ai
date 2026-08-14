"use client";

import { useState } from "react";
import type { GroupType } from "@/types/user-preferences";
import { estimateBudget, tierForBudgetAmount, type BudgetTier } from "@/lib/trip/budget-estimator";
import { formatRupees } from "@/lib/utils/format";

const TIER_LABELS: Record<BudgetTier, string> = {
  budget: "Budget-conscious",
  moderate: "Moderate",
  premium: "Premium",
};

interface BudgetSummaryProps {
  days: number;
  group: GroupType;
  budgetAmount: number | null;
}

export function BudgetSummary({ days, group, budgetAmount }: BudgetSummaryProps) {
  const [tier, setTier] = useState<BudgetTier>(() => tierForBudgetAmount(budgetAmount, days));
  const breakdown = estimateBudget({ days, group, tier });

  return (
    <div className="rounded-2xl border border-sandstone-200/70 bg-white p-6">
      <h2 className="font-display text-lg text-navy-900">Estimated budget</h2>
      <div role="group" aria-label="Budget tier" className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(TIER_LABELS) as BudgetTier[]).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tier === t}
            onClick={() => setTier(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              tier === t ? "bg-navy-900 text-ivory" : "bg-sandstone-100 text-ink-soft hover:bg-sandstone-200"
            }`}
          >
            {TIER_LABELS[t]}
          </button>
        ))}
      </div>

      <p className="mt-4 font-display text-2xl text-navy-900">
        {formatRupees(breakdown.totalEstimate)}{" "}
        <span className="text-sm font-normal text-ink-soft">estimated total</span>
      </p>
      <p className="text-xs text-ink-soft/70">
        Based on {breakdown.groupSize} {breakdown.groupSize === 1 ? "traveller" : "travellers"} ×{" "}
        {days} day{days > 1 ? "s" : ""} × {formatRupees(breakdown.perDayPerPerson)}/day/person
      </p>

      <ul className="mt-4 flex flex-col gap-1.5 text-sm">
        {breakdown.categories.map((c) => (
          <li key={c.label} className="flex items-center justify-between text-ink-soft">
            <span>{c.label}</span>
            <span className="font-medium text-navy-900">{formatRupees(c.amount)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-ink-soft/60">{breakdown.disclaimer}</p>
    </div>
  );
}
