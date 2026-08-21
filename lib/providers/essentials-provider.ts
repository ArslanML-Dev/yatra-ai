import type { Coordinates } from "@/types/place";
import type { EssentialCategory, EssentialPOI } from "@/types/essentials";

export interface EssentialsQueryResult {
  status: "ok" | "unreachable";
  results: EssentialPOI[];
  /** The radius actually searched, in km. Only set (and only ever
   * smaller than what was requested) when a provider had to narrow the
   * search to get a real answer under load — callers use this to keep
   * "within Xkm" copy honest rather than silently overstating the
   * search area. Absent when the requested radius was used as-is. */
  radiusUsedKm?: number;
}

/**
 * Seam over a live nearby-POI data source. Unlike PlaceProvider (static,
 * curated, always succeeds), this is the app's first genuinely live
 * external data dependency — so the interface itself makes failure a
 * first-class, honest outcome (`status: "unreachable"`) rather than
 * something a caller has to remember to try/catch. Never throws.
 */
export interface EssentialsProvider {
  findNearby(
    center: Coordinates,
    categories: EssentialCategory[],
    radiusKm: number,
  ): Promise<EssentialsQueryResult>;
}
