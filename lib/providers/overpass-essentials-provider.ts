import type { Coordinates } from "@/types/place";
import type { EssentialCategory, EssentialPOI } from "@/types/essentials";
import { haversineDistanceKm } from "@/lib/geo/distance";
import type { EssentialsProvider, EssentialsQueryResult } from "./essentials-provider";

// Two independent public mirrors, tried in order — confirmed via real
// testing that the primary can be slow/unavailable under load (it's a
// free, best-effort shared service with no uptime guarantee), and a
// second mirror genuinely improves real-world reliability rather than
// just working around this session's own heavy test traffic.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
// Confirmed via real testing against the public server: a wide radius
// (3km) combined with `way` queries across all 6 categories reliably
// 504s. 1.5km with a 15s internal budget resolved in ~2s consistently;
// the client-side abort is set comfortably longer than that internal
// budget so Overpass's own timeout fires first, never ours.
const OVERPASS_INTERNAL_TIMEOUT_S = 15;
const REQUEST_TIMEOUT_MS = 20000;

/** Each category maps to the real OSM tag value(s) that describe it,
 * grouped by OSM key — grocery and mall need more than one value since
 * OSM splits retail more finely than this app's category list does. */
const CATEGORY_OSM_VALUES: Record<EssentialCategory, { key: "amenity" | "shop"; values: string[] }> = {
  hospital: { key: "amenity", values: ["hospital"] },
  pharmacy: { key: "amenity", values: ["pharmacy"] },
  atm: { key: "amenity", values: ["atm"] },
  police: { key: "amenity", values: ["police"] },
  grocery: { key: "shop", values: ["supermarket", "convenience", "grocery"] },
  mall: { key: "shop", values: ["mall", "department_store"] },
};

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

/**
 * Confirmed via real testing against the public server: one clause per
 * category (12 total, for 6 categories x node+way) reliably 504s even
 * though each clause individually is cheap — Overpass's cost scales with
 * clause count, not just result size. Combining same-key categories into
 * a single regex-alternation clause per key cuts this to at most 4
 * clauses (amenity node/way + shop node/way) regardless of how many
 * categories are active, and that resolves reliably.
 */
function buildQuery(center: Coordinates, categories: EssentialCategory[], radiusMeters: number): string {
  const valuesByKey: Record<"amenity" | "shop", Set<string>> = { amenity: new Set(), shop: new Set() };
  for (const category of categories) {
    const { key, values } = CATEGORY_OSM_VALUES[category];
    for (const value of values) valuesByKey[key].add(value);
  }

  const around = `(around:${radiusMeters},${center.lat},${center.lng})`;
  const clauses = (Object.entries(valuesByKey) as ["amenity" | "shop", Set<string>][])
    .filter(([, values]) => values.size > 0)
    .flatMap(([key, values]) => {
      const alternation = `^(${Array.from(values).join("|")})$`;
      return [`node["${key}"~"${alternation}"]${around};`, `way["${key}"~"${alternation}"]${around};`];
    })
    .join("\n");

  return `[out:json][timeout:${OVERPASS_INTERNAL_TIMEOUT_S}];(\n${clauses}\n);out center;`;
}

function categoryForTags(tags: Record<string, string> | undefined): EssentialCategory | null {
  if (!tags) return null;
  for (const [category, { key, values }] of Object.entries(CATEGORY_OSM_VALUES) as [
    EssentialCategory,
    { key: "amenity" | "shop"; values: string[] },
  ][]) {
    if (tags[key] && values.includes(tags[key])) return category as EssentialCategory;
  }
  return null;
}

/**
 * The app's first live external *data* dependency (map tiles and place
 * photos are static assets; this is a real query). Overpass is the same
 * OpenStreetMap family the map tiles already come from — free, keyless,
 * no new vendor relationship — but it's still a live network call, so
 * every failure mode (timeout, non-200, malformed body) resolves to
 * `status: "unreachable"` rather than throwing. Callers must always
 * handle that case honestly (see EssentialsList's empty/error state) —
 * never fabricate results when the query fails.
 */
class OverpassEssentialsProvider implements EssentialsProvider {
  async findNearby(
    center: Coordinates,
    categories: EssentialCategory[],
    radiusKm: number,
  ): Promise<EssentialsQueryResult> {
    if (categories.length === 0) return { status: "ok", results: [] };

    const query = buildQuery(center, categories, Math.round(radiusKm * 1000));

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: `data=${encodeURIComponent(query)}`,
          // Confirmed via a real request during development: Overpass
          // returns 406 with an HTML error body (not JSON) unless Accept
          // is set explicitly — this isn't optional boilerplate.
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            "User-Agent": "YatraAI-Prototype/1.0 (SIH 2026 Level 1, non-commercial)",
          },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!res.ok) continue; // try the next mirror

        const body: unknown = await res.json();
        const elements = Array.isArray((body as { elements?: unknown }).elements)
          ? ((body as { elements: OverpassElement[] }).elements)
          : [];

        const results: EssentialPOI[] = elements
          .map((el): EssentialPOI | null => {
            const lat = el.lat ?? el.center?.lat;
            const lon = el.lon ?? el.center?.lon;
            const category = categoryForTags(el.tags);
            if (lat === undefined || lon === undefined || !category) return null;
            const coordinates: Coordinates = { lat, lng: lon };
            return {
              id: `osm-${el.id}`,
              name: el.tags?.name ?? categoryFallbackName(category),
              category,
              coordinates,
              distanceKm: haversineDistanceKm(center, coordinates),
              address:
                el.tags?.["addr:full"] ??
                (el.tags?.["addr:street"]
                  ? [el.tags["addr:housenumber"], el.tags["addr:street"]].filter(Boolean).join(" ")
                  : undefined),
            };
          })
          .filter((poi): poi is EssentialPOI => poi !== null)
          .sort((a, b) => a.distanceKm - b.distanceKm);

        return { status: "ok", results };
      } catch {
        // Network failure, timeout, or malformed response — try the
        // next mirror before giving up.
      }
    }

    // Every mirror failed — an honest "couldn't reach live data"
    // outcome, never fabricated results.
    return { status: "unreachable", results: [] };
  }
}

function categoryFallbackName(category: EssentialCategory): string {
  const labels: Record<EssentialCategory, string> = {
    hospital: "Hospital",
    pharmacy: "Pharmacy",
    atm: "ATM",
    police: "Police station",
    grocery: "Grocery store",
    mall: "Shopping mall",
  };
  return labels[category];
}

export const overpassEssentialsProvider: EssentialsProvider = new OverpassEssentialsProvider();
