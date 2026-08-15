"use client";

import { useEffect, useState } from "react";
import type { Place } from "@/types/place";
import { useTrip } from "@/lib/trip/use-trip";
import { useGeolocation } from "@/lib/hooks/use-geolocation";

interface ReferencePointPickerProps {
  places: Place[];
}

export function ReferencePointPicker({ places }: ReferencePointPickerProps) {
  const { referencePoint, setReferencePoint } = useTrip();
  const { coordinates, status, error, requestLocation } = useGeolocation();
  const [pickerOpen, setPickerOpen] = useState(false);

  const startingPointOptions = places.filter((p) => p.category === "transport");

  // Commits a successful geolocation grant into the trip's reference
  // point — a single, deliberate sync from the geolocation hook's state
  // into the trip store, not a recurring effect.
  useEffect(() => {
    if (status === "granted" && coordinates) {
      setReferencePoint({
        kind: "geolocation",
        label: "your location",
        coordinates,
        capturedAt: new Date().toISOString(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, coordinates]);

  function handlePlaceSelect(place: Place) {
    setReferencePoint({
      kind: "place",
      label: place.name,
      coordinates: place.coordinates,
      placeId: place.id,
      capturedAt: new Date().toISOString(),
    });
    setPickerOpen(false);
  }

  function handleClear() {
    setReferencePoint(null);
    setPickerOpen(false);
  }

  if (referencePoint) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-soft">
          Measuring distance from{" "}
          <strong className="text-navy-900">{referencePoint.label}</strong>
        </span>
        <button type="button" onClick={handleClear} className="text-saffron-600 underline">
          Clear
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={requestLocation}
          disabled={status === "requesting"}
          className="rounded-full bg-navy-900 px-4 py-1.5 text-xs font-medium text-ivory transition-colors hover:bg-navy-800 disabled:opacity-60"
        >
          {status === "requesting" ? "Locating…" : "📍 Use my location"}
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="rounded-full border border-navy-900/20 px-4 py-1.5 text-xs font-medium text-navy-900 transition-colors hover:bg-sandstone-100"
        >
          Choose starting point
        </button>
        {status === "denied" && (
          <span className="text-xs text-ink-soft/70">
            {error ?? "Location permission denied"} — choose a starting point instead.
          </span>
        )}
        {status === "unsupported" && (
          <span className="text-xs text-ink-soft/70">Location isn&rsquo;t supported in this browser.</span>
        )}
      </div>

      {pickerOpen && (
        <div className="flex flex-wrap gap-2">
          {startingPointOptions.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => handlePlaceSelect(place)}
              className="rounded-full bg-sandstone-100 px-4 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-sandstone-200"
            >
              {place.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
