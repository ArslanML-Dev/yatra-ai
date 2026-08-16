import type { Place, PlaceCategory } from "@/types/place";

/** One representative place for a category — prefers an anchor-tagged
 * place with a real image, then any place with a real image, then just
 * the first place (PlaceImage's category-tinted fallback icon handles
 * the rest honestly if no image exists). Shared by any section that
 * needs one representative photo per category (Explore cards, the
 * homepage's Old/Modern Lucknow section, etc.) so the selection logic
 * lives in exactly one place. */
export function selectRepresentativePlace(places: Place[], category: PlaceCategory): Place | undefined {
  const inCategory = places.filter((p) => p.category === category);
  return (
    inCategory.find((p) => p.tags.includes("anchor") && p.images.length > 0) ??
    inCategory.find((p) => p.images.length > 0) ??
    inCategory[0]
  );
}
