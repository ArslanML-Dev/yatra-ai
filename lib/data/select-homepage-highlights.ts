import type { Place, PlaceCategory } from "@/types/place";

/**
 * Anchor places first (the must-see set), then a round-robin backfill
 * across remaining categories up to the target count. Never invents
 * entries — may legitimately return fewer than `target` if the curated
 * dataset doesn't support it.
 */
export function selectHighlights(places: Place[], target = 8): Place[] {
  const anchors = places.filter((p) => p.tags.includes("anchor"));
  const selected = [...anchors];
  const selectedIds = new Set(selected.map((p) => p.id));

  const remainingByCategory = new Map<PlaceCategory, Place[]>();
  for (const place of places) {
    if (selectedIds.has(place.id)) continue;
    const list = remainingByCategory.get(place.category) ?? [];
    list.push(place);
    remainingByCategory.set(place.category, list);
  }

  const categories = Array.from(remainingByCategory.keys());
  let categoryIndex = 0;
  while (selected.length < target && categories.length > 0) {
    const category = categories[categoryIndex % categories.length];
    const bucket = remainingByCategory.get(category) ?? [];
    const next = bucket.shift();
    if (next) {
      selected.push(next);
      selectedIds.add(next.id);
    }
    if (bucket.length === 0) {
      categories.splice(categoryIndex % categories.length, 1);
      continue;
    }
    categoryIndex++;
  }

  return selected.slice(0, target);
}
