import { NextResponse } from "next/server";
import type { EssentialCategory, EssentialPOI } from "@/types/essentials";

/**
 * The app's first server-side code — a thin proxy to LocationIQ's Nearby
 * API, added specifically so the free-tier key never reaches the browser
 * (LocationIQ's key is meant to be used server-side; a client-exposed key
 * on a public POI endpoint is an open invitation to have someone else's
 * traffic burn through the 5,000/day free quota). This route holds the
 * key and does the actual fetch; the client-side LocationIQEssentialsProvider
 * only ever calls this same-origin route, never locationiq.com directly.
 *
 * This is a genuine, deliberate exception to the rest of the app's
 * purely-static architecture — added as a second, independent data
 * source for Nearby Essentials specifically because the free public
 * Overpass mirrors this app also uses have no uptime guarantee and, as
 * of this route being added, are experiencing a real outage. Everything
 * else in the app remains static/client-side.
 */

const LOCATIONIQ_BASE = "https://us1.locationiq.com/v1/nearby";
const REQUEST_TIMEOUT_MS = 8000;

// LocationIQ's own `tag` values for each of the app's 6 essential
// categories — see docs.locationiq.com/docs/nearby-poi. One request per
// category (the API doesn't document reliable multi-tag support), run
// sequentially with a small gap to respect the free tier's 2 req/s cap.
const LOCATIONIQ_TAG: Record<EssentialCategory, string> = {
  hospital: "hospital",
  pharmacy: "pharmacy",
  atm: "atm",
  police: "police",
  grocery: "supermarket",
  mall: "mall",
};

const VALID_CATEGORIES = new Set<EssentialCategory>(Object.keys(LOCATIONIQ_TAG) as EssentialCategory[]);

interface LocationIQResult {
  place_id?: string;
  name?: string;
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: { name?: string; road?: string; house_number?: string };
  distance?: number;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function queryCategory(
  apiKey: string,
  lat: number,
  lon: number,
  radiusMeters: number,
  category: EssentialCategory,
): Promise<EssentialPOI[]> {
  const params = new URLSearchParams({
    key: apiKey,
    lat: String(lat),
    lon: String(lon),
    tag: LOCATIONIQ_TAG[category],
    radius: String(radiusMeters),
    format: "json",
  });

  const res = await fetch(`${LOCATIONIQ_BASE}?${params.toString()}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  // LocationIQ returns a 404 with a JSON body for "no results" — an
  // honest empty result, not a failure. Only treat other non-2xx codes
  // as a real error.
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`LocationIQ returned ${res.status} for tag=${category}`);

  const body: unknown = await res.json();
  const results = Array.isArray(body) ? (body as LocationIQResult[]) : [];

  return results
    .map((r): EssentialPOI | null => {
      const lat = r.lat ? Number(r.lat) : NaN;
      const lon = r.lon ? Number(r.lon) : NaN;
      if (!r.place_id || Number.isNaN(lat) || Number.isNaN(lon)) return null;
      return {
        id: `locationiq-${r.place_id}`,
        name: r.name?.trim() || r.address?.name || categoryFallbackName(category),
        category,
        coordinates: { lat, lng: lon },
        distanceKm: typeof r.distance === "number" ? r.distance / 1000 : 0,
        address: r.address?.road
          ? [r.address.house_number, r.address.road].filter(Boolean).join(" ")
          : undefined,
      };
    })
    .filter((poi): poi is EssentialPOI => poi !== null);
}

export async function GET(request: Request): Promise<NextResponse> {
  const apiKey = process.env.LOCATIONIQ_API_KEY;
  if (!apiKey) {
    // Honest, non-fabricated failure — the caller's own fallback logic
    // treats this exactly like any other unreachable data source. Never
    // silently returns fake results just because the key isn't set yet.
    return NextResponse.json({ error: "LOCATIONIQ_API_KEY not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const radiusMeters = Number(searchParams.get("radiusMeters"));
  const categoriesRaw = (searchParams.get("categories") ?? "").split(",").filter(Boolean);
  const categories = categoriesRaw.filter((c): c is EssentialCategory =>
    VALID_CATEGORIES.has(c as EssentialCategory),
  );

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || categories.length === 0) {
    return NextResponse.json({ error: "Missing or invalid lat/lon/categories" }, { status: 400 });
  }

  try {
    const results: EssentialPOI[] = [];
    // Sequential with a small gap, not Promise.all — the free tier caps
    // at 2 requests/second and up to 6 categories can be active at once.
    for (let i = 0; i < categories.length; i++) {
      if (i > 0) await delay(550);
      results.push(...(await queryCategory(apiKey, lat, lon, radiusMeters, categories[i])));
    }
    results.sort((a, b) => a.distanceKm - b.distanceKm);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown LocationIQ error" },
      { status: 502 },
    );
  }
}
