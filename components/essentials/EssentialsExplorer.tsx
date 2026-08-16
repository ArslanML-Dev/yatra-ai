"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Coordinates } from "@/types/place";
import type { EssentialCategory, EssentialPOI } from "@/types/essentials";
import { useTrip } from "@/lib/trip/use-trip";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { getEssentialsProvider } from "@/lib/providers/provider-registry";
import { getMapProvider } from "@/lib/providers/provider-registry";
import { EssentialsFilter } from "./EssentialsFilter";
import { EssentialCard } from "./EssentialCard";
import { MapErrorBoundary } from "@/components/map/MapErrorBoundary";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const MapView = dynamic(() => import("@/components/map/MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const ALL_CATEGORIES: EssentialCategory[] = ["hospital", "pharmacy", "atm", "police", "grocery", "mall"];
const SEARCH_RADIUS_KM = 1.5;

type QueryStatus = "idle" | "loading" | "ok" | "unreachable";

export function EssentialsExplorer() {
  const { referencePoint, setReferencePoint, trip } = useTrip();
  const geolocation = useGeolocation();
  const [activeCategories, setActiveCategories] = useState<EssentialCategory[]>(ALL_CATEGORIES);
  const [results, setResults] = useState<EssentialPOI[]>([]);
  const [status, setStatus] = useState<QueryStatus>("idle");

  const anchor: Coordinates | null =
    referencePoint?.coordinates ?? trip?.accommodationLocation?.coordinates ?? null;
  const anchorLabel = referencePoint?.label ?? trip?.accommodationLocation?.label ?? null;

  useEffect(() => {
    if (geolocation.status === "granted" && geolocation.coordinates) {
      setReferencePoint({
        kind: "geolocation",
        label: "your location",
        coordinates: geolocation.coordinates,
        capturedAt: new Date().toISOString(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation.status, geolocation.coordinates]);

  useEffect(() => {
    // Preconditions not met — nothing to fetch. Handled directly in the
    // render below (no-anchor screen / "pick a category" empty state)
    // rather than via setState here, so this effect never needs to
    // synchronously update state just to represent "there's no query".
    if (!anchor || activeCategories.length === 0) return;

    let cancelled = false;
    // Small debounce so rapidly toggling several filter chips doesn't
    // fire a live network request per click. setStatus("loading") is
    // deliberately inside this callback, not synchronously in the effect
    // body, so the loading flag only flips once a query is actually
    // about to fire.
    const timer = setTimeout(async () => {
      if (cancelled) return;
      setStatus("loading");
      const result = await getEssentialsProvider().findNearby(anchor, activeCategories, SEARCH_RADIUS_KM);
      if (cancelled) return;
      setResults(result.results);
      setStatus(result.status);
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [anchor, activeCategories]);

  const mapCenter = anchor ?? getMapProvider().getDefaultCenter("lucknow");

  if (!anchor) {
    return (
      <div className="rounded-card border border-sandstone-200/70 bg-white p-8 text-center">
        <p className="font-display text-lg text-navy-900">Where should we look nearby?</p>
        <p className="mt-2 text-sm text-ink-soft">
          Nearby Essentials needs a starting point — your live location, or where you&rsquo;re staying.
        </p>
        <button
          type="button"
          onClick={geolocation.requestLocation}
          disabled={geolocation.status === "requesting"}
          className="mt-4 rounded-full bg-navy-900 px-5 py-2 text-sm font-medium text-ivory transition-colors hover:bg-navy-800 disabled:opacity-60"
        >
          {geolocation.status === "requesting" ? "Locating…" : "📍 Use my location"}
        </button>
        {geolocation.status === "denied" && (
          <p className="mt-2 text-xs text-ink-soft/70">
            {geolocation.error ?? "Location permission denied"} — set where you&rsquo;re staying from a
            place page instead.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-sandstone-200/70 bg-white p-2.5 shadow-soft">
        <EssentialsFilter active={activeCategories} onChange={setActiveCategories} />
        {anchorLabel && (
          <span className="px-2 text-xs text-ink-soft/70">Near {anchorLabel}</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto">
          {activeCategories.length === 0 && (
            <EmptyState title="Pick a category" description="Choose at least one type above to see what's nearby." />
          )}
          {activeCategories.length > 0 && status === "loading" && (
            <>
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </>
          )}
          {activeCategories.length > 0 && status === "unreachable" && (
            <EmptyState
              title="Couldn't reach live data"
              description="Nearby Essentials needs a live connection to OpenStreetMap's data service, and that request didn't go through. Try again in a moment."
            />
          )}
          {activeCategories.length > 0 && status === "ok" && results.length === 0 && (
            <EmptyState
              title="Nothing found nearby"
              description="No matches within 1.5km for the selected categories. Try a different category, or a different starting point."
            />
          )}
          {activeCategories.length > 0 &&
            status === "ok" &&
            results.map((poi) => <EssentialCard key={poi.id} poi={poi} origin={anchor} />)}
        </div>

        <div className="relative h-[65vh] min-h-105 w-full overflow-hidden rounded-card border border-sandstone-200/70 shadow-soft">
          <MapErrorBoundary>
            <MapView
              places={[]}
              center={mapCenter}
              essentials={activeCategories.length > 0 && status === "ok" ? results : []}
            />
          </MapErrorBoundary>
        </div>
      </div>
    </div>
  );
}
