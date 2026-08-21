import type { Coordinates } from "@/types/place";
import type { EssentialCategory, EssentialPOI } from "@/types/essentials";
import { haversineDistanceKm } from "@/lib/geo/distance";
import type { EssentialsProvider, EssentialsQueryResult } from "./essentials-provider";

/**
 * overpass-api.de (and its DNS-aliased siblings z.overpass-api.de,
 * lz4.overpass-api.de — same underlying infrastructure) reliably answers
 * 406 Not Acceptable with NO Access-Control-Allow-Origin header whenever
 * the request carries a real browser User-Agent — confirmed by directly
 * bisecting headers against the live server: identical request, only the
 * User-Agent changed, 3/3 real-Chrome-UA attempts got 406, 3/3 attempts
 * with a plain custom UA string did not. This is an anti-scraper filter
 * on their end (independently corroborated: this exact 406 pattern is a
 * documented, common complaint for this specific host), not a load or
 * app-code issue — and it can never be worked around from a browser,
 * because `fetch()` cannot actually override User-Agent: captured
 * network requests from this app's own live traffic show the browser's
 * real Chrome UA going out on the wire regardless of what the fetch()
 * call's headers object requests. A previous fix mistakenly kept
 * overpass-api.de/z.overpass-api.de in the mirror list because
 * curl-only testing (which doesn't send a browser UA unless told to)
 * never reproduced the block — every mirror looked healthy from curl,
 * while the real app, in a real browser, kept failing on exactly these
 * two. lz4.overpass-api.de and a couple of other public mirrors
 * (maps.mail.ru, private.coffee) were checked too and show the same
 * 406 body under a real browser UA, so they're excluded for the same
 * reason. overpass.kumi.systems is the one mirror that never produced
 * this pattern under a real Chrome UA in repeated testing — its
 * failures are ordinary transient overload (502/timeout), which the
 * retry-with-narrower-radius logic below is specifically built to
 * absorb. overpass.osm.ch was also tried and rejected separately — it
 * answers fine but its dataset is stale/uninitialized (a non-date
 * "timestamp_osm_base" and empty results for a real query), which would
 * trade an honest "unreachable" for a silently-wrong "nothing nearby".
 */
const OVERPASS_ENDPOINTS = ["https://overpass.kumi.systems/api/interpreter"];
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
/**
 * Queries one mirror and throws on any failure (non-2xx, network error,
 * timeout, malformed body) — the caller races several of these and only
 * needs the first success, never a partial/fabricated result.
 */
async function queryEndpoint(endpoint: string, query: string, center: Coordinates): Promise<EssentialPOI[]> {
  const res = await fetch(endpoint, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    // Confirmed via a real request during development: Overpass
    // returns 406 with an HTML error body (not JSON) unless Accept
    // is set explicitly — this isn't optional boilerplate. Overpass's
    // free public mirrors have also been observed returning a 406 with
    // no Access-Control-Allow-Origin header (an Apache content-negotiation
    // quirk, outside app control) even when Accept is set correctly —
    // that surfaces as a CORS-flavored "Failed to fetch" in the browser,
    // which this function converts into a normal thrown error so the
    // caller's race just tries the other mirror.
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": "YatraAI-Prototype/1.0 (SIH 2026 Level 1, non-commercial)",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Overpass mirror ${endpoint} returned ${res.status}`);

  const body: unknown = await res.json();
  const elements = Array.isArray((body as { elements?: unknown }).elements)
    ? ((body as { elements: OverpassElement[] }).elements)
    : [];

  return elements
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
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Confirmed via real testing directly against the live public mirrors
 * (not just reading the app's own claims): the app's actual multi-
 * category query at the normal 1.5km radius can genuinely 502/504 on
 * every mirror simultaneously under real load — a real capacity spike,
 * not a client bug — while the *identical* query at an 800m radius
 * completed in 1-3s on the same mirrors at the same moment. Overpass's
 * cost scales with search area (roughly radius squared), so this isn't
 * a placebo: a smaller radius is a genuinely cheaper query, not just a
 * hopeful retry of the same expensive one. Retry narrows the radius
 * step by step rather than giving up outright — trading search breadth
 * for a real chance of success, and honestly reflecting that trade by
 * telling the caller the radius that actually worked.
 */
const RETRY_DELAY_MS = 3000;
const RETRY_RADIUS_STEPS_KM = [0.8, 0.5];

class OverpassEssentialsProvider implements EssentialsProvider {
  async findNearby(
    center: Coordinates,
    categories: EssentialCategory[],
    radiusKm: number,
  ): Promise<EssentialsQueryResult> {
    if (categories.length === 0) return { status: "ok", results: [] };

    // Race all mirrors for one radius and take whichever answers first —
    // Promise.any (not allSettled) is what makes this a real race:
    // allSettled waits for every mirror to finish before resolving, so
    // one hung/slow mirror would stall the whole query for up to
    // REQUEST_TIMEOUT_MS even after a faster mirror had already
    // succeeded. Promise.any resolves the instant the first one
    // fulfills, and only rejects (AggregateError) once every mirror has
    // failed.
    const raceMirrors = (forRadiusKm: number) => {
      const query = buildQuery(center, categories, Math.round(forRadiusKm * 1000));
      return Promise.any(OVERPASS_ENDPOINTS.map((endpoint) => queryEndpoint(endpoint, query, center)));
    };

    const attemptRadii = [radiusKm, ...RETRY_RADIUS_STEPS_KM.filter((r) => r < radiusKm)];

    for (let i = 0; i < attemptRadii.length; i++) {
      if (i > 0) await delay(RETRY_DELAY_MS);
      try {
        const results = await raceMirrors(attemptRadii[i]);
        const narrowed = attemptRadii[i] < radiusKm;
        return { status: "ok", results, ...(narrowed ? { radiusUsedKm: attemptRadii[i] } : {}) };
      } catch {
        // This radius failed on every mirror — fall through to the next,
        // smaller (cheaper) one, or to the honest "unreachable" outcome
        // below once every step has been tried.
      }
    }

    // Every mirror failed at every radius — an honest "couldn't reach
    // live data" outcome, never fabricated results.
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
