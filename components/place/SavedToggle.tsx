"use client";

import { useTrip } from "@/lib/trip/use-trip";

export function SavedToggle({ placeId, placeName }: { placeId: string; placeName: string }) {
  const { isSaved, toggleSavedPlace } = useTrip();
  const saved = isSaved(placeId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSavedPlace(placeId);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${placeName} from saved places` : `Save ${placeName}`}
      className={`rounded-full p-1.5 text-lg transition-colors ${
        saved ? "text-saffron-600" : "text-ink-soft/50 hover:text-saffron-600"
      }`}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}
