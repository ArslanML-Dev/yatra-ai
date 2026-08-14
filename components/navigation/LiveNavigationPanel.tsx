"use client";

import { useState } from "react";
import type { Coordinates } from "@/types/place";
import { useLiveNavigation } from "@/lib/hooks/use-live-navigation";
import { buildGoogleMapsDirectionsUrl } from "@/lib/geo/directions-url";

interface LiveNavigationPanelProps {
  destinationName: string;
  destination: Coordinates;
}

export function LiveNavigationPanel({ destinationName, destination }: LiveNavigationPanelProps) {
  const [open, setOpen] = useState(false);
  const nav = useLiveNavigation(destinationName, destination);
  const mapsUrl = buildGoogleMapsDirectionsUrl(destination);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          nav.start();
        }}
        className="text-xs text-ink-soft/70 underline"
      >
        Try live guidance (beta)
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-sandstone-200/70 bg-sandstone-100 p-4 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-medium text-navy-900">Live guidance to {destinationName}</p>
        <button
          type="button"
          onClick={() => {
            nav.stop();
            setOpen(false);
          }}
          className="text-xs text-saffron-600 underline"
        >
          End navigation
        </button>
      </div>

      {nav.status === "unsupported" && (
        <p className="mt-2 text-xs text-ink-soft">
          Live location isn&rsquo;t supported in this browser.
        </p>
      )}
      {nav.status === "error" && (
        <p className="mt-2 text-xs text-ink-soft">
          Couldn&rsquo;t get your location. Check permissions and try again.
        </p>
      )}

      {(nav.status === "watching" || nav.status === "arrived") && (
        <div className="mt-3 flex flex-col gap-1">
          {nav.status === "arrived" ? (
            <p className="font-display text-lg text-leaf-600">You have arrived 🎉</p>
          ) : (
            <>
              <p className="font-display text-lg text-navy-900">
                {nav.distanceKm !== null
                  ? nav.distanceKm < 1
                    ? `${Math.round(nav.distanceKm * 1000)} m remaining`
                    : `${nav.distanceKm.toFixed(1)} km remaining`
                  : "Locating…"}
              </p>
              {nav.bearingDegrees !== null && (
                <p className="text-xs text-ink-soft">
                  Direction to destination: {Math.round(nav.bearingDegrees)}° from north
                </p>
              )}
              {nav.heading !== null ? (
                <p className="text-xs text-ink-soft">Your heading: {Math.round(nav.heading)}°</p>
              ) : (
                <p className="text-xs text-ink-soft/60">Heading unavailable while stationary</p>
              )}
              {nav.accuracyMeters !== null && (
                <p className="text-xs text-ink-soft/60">GPS accuracy: ±{Math.round(nav.accuracyMeters)} m</p>
              )}
            </>
          )}

          <button
            type="button"
            onClick={nav.toggleVoice}
            aria-pressed={nav.voiceEnabled}
            className="mt-2 self-start rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-soft"
          >
            {nav.voiceEnabled ? "🔊 Voice on" : "🔇 Voice off"}
          </button>
        </div>
      )}

      <p className="mt-3 text-xs text-ink-soft/60">
        This shows straight-line distance and direction from GPS, not a road route.{" "}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="underline">
          Open in Google Maps for full turn-by-turn
        </a>
        .
      </p>
    </div>
  );
}
