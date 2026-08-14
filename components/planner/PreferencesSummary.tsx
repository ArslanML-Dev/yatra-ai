import type { UserPreferences } from "@/types/user-preferences";
import { formatCategoryLabel } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";

const GROUP_LABELS: Record<UserPreferences["group"], string> = {
  solo: "Solo",
  couple: "Couple",
  family: "Family",
  friends: "Friends",
  business: "Business",
};

const PACE_LABELS: Record<UserPreferences["pace"], string> = {
  relaxed: "Relaxed pace",
  moderate: "Moderate pace",
  packed: "Packed pace",
};

export function PreferencesSummary({ preferences }: { preferences: UserPreferences }) {
  const confidenceCopy =
    preferences.confidence === "high"
      ? "Here's what we understood — looks right?"
      : "Here's our best guess — adjust anything below.";

  return (
    <div className="rounded-2xl bg-sandstone-100 p-6">
      <p className="text-sm font-medium text-ink-soft">{confidenceCopy}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="navy">{preferences.days} day{preferences.days > 1 ? "s" : ""}</Badge>
        <Badge tone="navy">{GROUP_LABELS[preferences.group]}</Badge>
        {preferences.interests.length > 0 ? (
          preferences.interests.map((interest) => (
            <Badge key={interest} tone="leaf">
              {formatCategoryLabel(interest)}
            </Badge>
          ))
        ) : (
          <Badge tone="sandstone">A balanced mix</Badge>
        )}
        <Badge tone="sandstone">{PACE_LABELS[preferences.pace]}</Badge>
        {preferences.budget && <Badge tone="sandstone">₹{preferences.budget.amount.toLocaleString("en-IN")}</Badge>}
      </div>
    </div>
  );
}
