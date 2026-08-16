import type { Coordinates } from "@/types/place";
import type { EssentialCategory, EssentialPOI } from "@/types/essentials";

export interface EssentialsQueryResult {
  status: "ok" | "unreachable";
  results: EssentialPOI[];
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
