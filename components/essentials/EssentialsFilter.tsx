import type { EssentialCategory } from "@/types/essentials";
import { formatEssentialCategoryLabel } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const ALL_CATEGORIES: EssentialCategory[] = ["hospital", "pharmacy", "atm", "police", "grocery", "mall"];

interface EssentialsFilterProps {
  active: EssentialCategory[];
  onChange: (categories: EssentialCategory[]) => void;
}

/**
 * Same pill-chip visual language as CategoryToggle (components/map/
 * CategoryToggle.tsx), but independently multi-select rather than
 * single-select — "ATM + Pharmacy" together is a normal request here in
 * a way "Heritage + Food" isn't for the curated-places map filter.
 */
export function EssentialsFilter({ active, onChange }: EssentialsFilterProps) {
  function toggle(category: EssentialCategory) {
    onChange(
      active.includes(category) ? active.filter((c) => c !== category) : [...active, category],
    );
  }

  return (
    <div role="group" aria-label="Filter by essential type" className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={active.length === ALL_CATEGORIES.length}
        onClick={() => onChange(active.length === ALL_CATEGORIES.length ? [] : ALL_CATEGORIES)}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition-colors",
          active.length === ALL_CATEGORIES.length
            ? "bg-navy-900 text-ivory"
            : "bg-sandstone-100 text-ink-soft hover:bg-sandstone-200",
        )}
      >
        All
      </button>
      {ALL_CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={active.includes(category)}
          onClick={() => toggle(category)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            active.includes(category)
              ? "bg-navy-900 text-ivory"
              : "bg-sandstone-100 text-ink-soft hover:bg-sandstone-200",
          )}
        >
          {formatEssentialCategoryLabel(category)}
        </button>
      ))}
    </div>
  );
}
