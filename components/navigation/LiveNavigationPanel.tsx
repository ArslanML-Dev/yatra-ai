"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          nav.start();
        }}
        className="inline-flex items-center gap-1.5 text-xs text-ink-soft/70 underline"
      >
        🧭 Navigate with Yatra (beta)
      </button>
    );
  }

  return (
    <div className="rounded-card border border-navy-900/10 bg-navy-950 p-4 text-sm text-ivory shadow-soft">
      {/* HUD header row: destination + a single icon-style end control,
          mirroring the map's recenter/mode-toggle control language. */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="text-base">
            🧭
          </span>
          <p className="truncate font-medium text-ivory">Live guidance to {destinationName}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            nav.stop();
            setOpen(false);
          }}
          aria-label="End navigation"
          className="shrink-0 rounded-full p-1.5 text-ivory/60 transition-colors hover:bg-ivory/10 hover:text-ivory"
        >
          ✕
        </button>
      </div>

      {nav.status === "unsupported" && (
        <p className="mt-3 text-xs text-ivory/60">
          Live location isn&rsquo;t supported in this browser.
        </p>
      )}
      {nav.status === "error" && (
        <p className="mt-3 text-xs text-ivory/60">
          Couldn&rsquo;t get your location. Check permissions and try again.
        </p>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {(nav.status === "watching" || nav.status === "arrived") && (
          <motion.div
            key={nav.status === "arrived" ? "arrived" : "watching"}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 flex flex-col gap-2"
          >
            {nav.status === "arrived" ? (
              <p className="font-display text-lg text-leaf-500">You have arrived 🎉</p>
            ) : (
              <>
                <p className="font-display text-2xl text-ivory">
                  {nav.distanceKm !== null
                    ? nav.distanceKm < 1
                      ? `${Math.round(nav.distanceKm * 1000)} m`
                      : `${nav.distanceKm.toFixed(1)} km`
                    : "Locating…"}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ivory/60">
                  {nav.bearingDegrees !== null && (
                    <span>Direction: {Math.round(nav.bearingDegrees)}° from north</span>
                  )}
                  {nav.heading !== null ? (
                    <span>Your heading: {Math.round(nav.heading)}°</span>
                  ) : (
                    <span>Heading unavailable while stationary</span>
                  )}
                  {nav.accuracyMeters !== null && (
                    <span>GPS accuracy: ±{Math.round(nav.accuracyMeters)} m</span>
                  )}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={nav.toggleVoice}
              aria-pressed={nav.voiceEnabled}
              className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-ivory/10 px-3 py-1.5 text-xs font-medium text-ivory transition-colors hover:bg-ivory/20"
            >
              {nav.voiceEnabled ? "🔊 Voice on" : "🔇 Voice off"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 text-xs text-ivory/40">
        This shows straight-line distance and direction from GPS, not a road route.{" "}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="underline">
          Open in Google Maps for full turn-by-turn
        </a>
        .
      </p>
    </div>
  );
}
