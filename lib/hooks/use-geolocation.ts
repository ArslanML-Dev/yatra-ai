"use client";

import { useCallback, useState } from "react";
import type { Coordinates } from "@/types/place";

export type GeolocationStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported";

export interface UseGeolocationResult {
  coordinates: Coordinates | null;
  status: GeolocationStatus;
  error: string | null;
  requestLocation: () => void;
}

/**
 * Never requests location on mount — only when requestLocation() is
 * explicitly called from a user action (a button click), per the
 * contextual-permission requirement.
 */
export function useGeolocation(): UseGeolocationResult {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("granted");
      },
      (err) => {
        setStatus("denied");
        setError(err.message || "Location permission was denied.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return { coordinates, status, error, requestLocation };
}
