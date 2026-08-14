export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${hours} hr ${rest} min`;
}

export function formatCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    heritage: "Heritage & History",
    food: "Food & Cuisine",
    shopping: "Shopping & Chikankari",
    parks: "Parks & Green Spaces",
    riverfront_evening: "Riverfront & Evening",
    modern: "Modern Lucknow",
    transport: "Getting Around",
  };
  return labels[category] ?? category;
}

export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
