"use client";

import type { GroupType, Pace, UserPreferences } from "@/types/user-preferences";
import type { PlaceCategory } from "@/types/place";
import { cn } from "@/lib/utils/cn";
import { formatCategoryLabel } from "@/lib/utils/format";

const GROUPS: GroupType[] = ["solo", "couple", "family", "friends", "business"];
const PACES: Pace[] = ["relaxed", "moderate", "packed"];
const INTERESTS: PlaceCategory[] = ["heritage", "food", "shopping", "parks", "modern"];

interface StructuredFallbackFormProps {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}

export function StructuredFallbackForm({ preferences, onChange }: StructuredFallbackFormProps) {
  function toggleInterest(interest: PlaceCategory) {
    const has = preferences.interests.includes(interest);
    onChange({
      ...preferences,
      interests: has
        ? preferences.interests.filter((i) => i !== interest)
        : [...preferences.interests, interest],
    });
  }

  return (
    <div className="rounded-2xl border border-sandstone-200/70 bg-white p-6">
      <h2 className="font-display text-lg text-navy-900">Or fine-tune it directly</h2>

      <div className="mt-5">
        <p className="text-sm font-medium text-ink-soft">How many days?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...preferences, days: n })}
              className={cn(
                "h-10 w-10 rounded-full text-sm font-medium transition-colors",
                preferences.days === n
                  ? "bg-navy-900 text-ivory"
                  : "bg-sandstone-100 text-ink-soft hover:bg-sandstone-200",
              )}
            >
              {n}
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={14}
            value={preferences.days}
            onChange={(e) => onChange({ ...preferences, days: Number(e.target.value) || 1 })}
            className="h-10 w-16 rounded-full border border-sandstone-200 px-3 text-center text-sm"
            aria-label="Custom number of days"
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-ink-soft">Who&rsquo;s coming?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => onChange({ ...preferences, group })}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
                preferences.group === group
                  ? "bg-navy-900 text-ivory"
                  : "bg-sandstone-100 text-ink-soft hover:bg-sandstone-200",
              )}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-ink-soft">What are you interested in?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                preferences.interests.includes(interest)
                  ? "bg-leaf-600 text-ivory"
                  : "bg-sandstone-100 text-ink-soft hover:bg-sandstone-200",
              )}
            >
              {formatCategoryLabel(interest)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-ink-soft">Pace</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PACES.map((pace) => (
            <button
              key={pace}
              type="button"
              onClick={() => onChange({ ...preferences, pace })}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
                preferences.pace === pace
                  ? "bg-navy-900 text-ivory"
                  : "bg-sandstone-100 text-ink-soft hover:bg-sandstone-200",
              )}
            >
              {pace}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-ink-soft">Budget (optional, ₹)</p>
        <input
          type="number"
          min={0}
          value={preferences.budget?.amount ?? ""}
          onChange={(e) => {
            const amount = Number(e.target.value);
            onChange({
              ...preferences,
              budget: e.target.value && amount > 0 ? { amount, currency: "INR" } : null,
            });
          }}
          placeholder="e.g. 25000"
          className="mt-2 w-40 rounded-xl border border-sandstone-200 px-4 py-2 text-sm outline-none focus-visible:border-saffron-500"
        />
      </div>
    </div>
  );
}
