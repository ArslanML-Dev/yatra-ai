"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Coordinates } from "@/types/place";
import { haversineDistanceKm } from "@/lib/geo/distance";
import { computeBearingDegrees } from "@/lib/geo/bearing";

export type NavigationStatus = "idle" | "watching" | "arrived" | "error" | "unsupported";

const ARRIVAL_RADIUS_KM = 0.05;
const APPROACH_RADIUS_KM = 0.3;

export interface UseLiveNavigationResult {
  status: NavigationStatus;
  distanceKm: number | null;
  bearingDegrees: number | null;
  /** Only ever a real value from the browser's GPS — never fabricated
   * or defaulted to 0 when the device doesn't report heading. */
  heading: number | null;
  accuracyMeters: number | null;
  voiceEnabled: boolean;
  toggleVoice: () => void;
  start: () => void;
  stop: () => void;
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export function useLiveNavigation(destinationName: string, destination: Coordinates): UseLiveNavigationResult {
  const [status, setStatus] = useState<NavigationStatus>("idle");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [bearingDegrees, setBearingDegrees] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const watchIdRef = useRef<number | null>(null);
  const announcedApproachRef = useRef(false);
  const announcedArrivalRef = useRef(false);
  const voiceEnabledRef = useRef(voiceEnabled);
  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setStatus("idle");
  }, []);

  const start = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    announcedApproachRef.current = false;
    announcedArrivalRef.current = false;
    setStatus("watching");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const current: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const distance = haversineDistanceKm(current, destination);
        setDistanceKm(distance);
        setBearingDegrees(computeBearingDegrees(current, destination));
        setHeading(position.coords.heading ?? null);
        setAccuracyMeters(position.coords.accuracy ?? null);

        if (distance <= ARRIVAL_RADIUS_KM) {
          setStatus("arrived");
          if (!announcedArrivalRef.current) {
            announcedArrivalRef.current = true;
            if (voiceEnabledRef.current) speak(`You have arrived at ${destinationName}.`);
          }
        } else if (distance <= APPROACH_RADIUS_KM && !announcedApproachRef.current) {
          announcedApproachRef.current = true;
          if (voiceEnabledRef.current) speak(`You are approaching ${destinationName}.`);
        }
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  }, [destination, destinationName]);

  const toggleVoice = useCallback(() => setVoiceEnabled((v) => !v), []);

  return {
    status,
    distanceKm,
    bearingDegrees,
    heading,
    accuracyMeters,
    voiceEnabled,
    toggleVoice,
    start,
    stop,
  };
}
