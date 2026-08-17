import type { Place } from "@/types/place";

/**
 * The homepage's "Lucknow, at a glance" section is a monuments-only
 * highlight reel — heritage sites exclusively, no food/market/mall/park
 * cards, so it reads as a highlight of iconic architecture rather than a
 * mixed grab-bag. Anchor-tagged monuments (the must-see set) come first,
 * then the rest of the heritage places, in their curated data order.
 * Never invents entries — may legitimately return fewer than `target` if
 * the curated heritage dataset doesn't support it.
 */
export function selectMonumentHighlights(places: Place[], target = 8): Place[] {
  const heritage = places.filter((p) => p.category === "heritage");
  const anchors = heritage.filter((p) => p.tags.includes("anchor"));
  const rest = heritage.filter((p) => !p.tags.includes("anchor"));
  return [...anchors, ...rest].slice(0, target);
}
