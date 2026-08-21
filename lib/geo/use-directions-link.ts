"use client";

import { useEffect, useState } from "react";
import type { Coordinates } from "@/types/place";
import { buildGoogleMapsDirectionsUrl, getDirectionsLink } from "./directions-url";

/** Client-only wrapper around getDirectionsLink — starts with the SSR-safe
 * Google Maps default (unconditionally, ignoring the real platform, so
 * the client's hydration render matches the server-rendered HTML byte
 * for byte), then upgrades to Apple Maps in a post-mount effect if the
 * device is actually iOS. The naive version of this — branching on
 * platform inside the useState initializer — still causes a real
 * hydration-mismatch error: that initializer re-runs during hydration
 * using the browser's *real* navigator, which resolves immediately to
 * Apple Maps on an iPhone, one render before the effect that's supposed
 * to be the "client-only" branch even gets a chance to run. Confirmed via
 * live testing with an emulated iPhone user agent. `destination` may be
 * undefined so callers can use this hook unconditionally even when
 * their own render has an early-return-on-missing-data path above it
 * (Rules of Hooks) — returns undefined until a real destination exists. */
export function useDirectionsLink(destination: Coordinates | undefined, origin?: Coordinates) {
  const [link, setLink] = useState(() =>
    destination ? { url: buildGoogleMapsDirectionsUrl(destination, origin), label: "Google Maps" } : undefined,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from the browser's navigator, which is unavailable during SSR/hydration and must not affect the first render
    setLink(destination ? getDirectionsLink(destination, origin) : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination?.lat, destination?.lng, origin?.lat, origin?.lng]);

  return link;
}
