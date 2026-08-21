import type { Coordinates } from "@/types/place";
import type { EssentialCategory } from "@/types/essentials";
import type { EssentialsProvider, EssentialsQueryResult } from "./essentials-provider";
import { overpassEssentialsProvider } from "./overpass-essentials-provider";
import { locationIQEssentialsProvider } from "./locationiq-essentials-provider";

/**
 * Tries Overpass (free, unlimited, no key) first — it's the primary
 * source and works fine the overwhelming majority of the time. Falls
 * back to LocationIQ (a genuinely independent operator/infrastructure,
 * capped at a 5,000/day free quota) only when Overpass's own internal
 * retries have all failed, so the limited LocationIQ quota is spent on
 * real outages, not burned on every request. Only reports "unreachable"
 * once both independent sources have failed — never fabricates results
 * from either.
 */
class FallbackEssentialsProvider implements EssentialsProvider {
  async findNearby(
    center: Coordinates,
    categories: EssentialCategory[],
    radiusKm: number,
  ): Promise<EssentialsQueryResult> {
    const primary = await overpassEssentialsProvider.findNearby(center, categories, radiusKm);
    if (primary.status === "ok") return primary;

    return locationIQEssentialsProvider.findNearby(center, categories, radiusKm);
  }
}

export const fallbackEssentialsProvider: EssentialsProvider = new FallbackEssentialsProvider();
