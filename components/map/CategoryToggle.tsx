import type { CategoryFilter } from "@/types/map";
import type { PlaceCategory } from "@/types/place";
import { formatCategoryLabel } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const CATEGORIES: PlaceCategory[] = ["heritage", "food", "shopping", "parks", "modern", "transport"];

interface CategoryToggleProps {
  active: CategoryFilter;
  onChange: (category: CategoryFilter) => void;
}

export function CategoryToggle({ active, onChange }: CategoryToggleProps) {
  const options: CategoryFilter[] = ["all", ...CATEGORIES];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            active === option
              ? "bg-navy-900 text-ivory"
              : "bg-sandstone-100 text-ink-soft hover:bg-sandstone-200",
          )}
        >
          {option === "all" ? "All" : formatCategoryLabel(option)}
        </button>
      ))}
    </div>
  );
}
