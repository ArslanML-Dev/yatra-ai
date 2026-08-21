import type { Coordinates } from "@/types/place";
import type { EssentialCategory } from "@/types/essentials";
import type { EssentialsProvider, EssentialsQueryResult } from "./essentials-provider";

const REQUEST_TIMEOUT_MS = 15000;

/**
 * Calls the app's own /api/nearby-essentials route, never LocationIQ
 * directly — the API key lives server-side only (see that route for why).
 * A genuinely independent second data source from the Overpass mirrors:
 * different infrastructure, different operator, not subject to the same
 * outage. Used as a fallback, not a primary — see FallbackEssentialsProvider.
 */
class LocationIQEssentialsProvider implements EssentialsProvider {
  async findNearby(
    center: Coordinates,
    categories: EssentialCategory[],
    radiusKm: number,
  ): Promise<EssentialsQueryResult> {
    if (categories.length === 0) return { status: "ok", results: [] };

    const params = new URLSearchParams({
      lat: String(center.lat),
      lon: String(center.lng),
      radiusMeters: String(Math.round(radiusKm * 1000)),
      categories: categories.join(","),
    });

    try {
      const res = await fetch(`/api/nearby-essentials?${params.toString()}`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) return { status: "unreachable", results: [] };
      const body: unknown = await res.json();
      const results = Array.isArray((body as { results?: unknown }).results)
        ? (body as { results: EssentialsQueryResult["results"] }).results
        : [];
      return { status: "ok", results };
    } catch {
      return { status: "unreachable", results: [] };
    }
  }
}

export const locationIQEssentialsProvider: EssentialsProvider = new LocationIQEssentialsProvider();
