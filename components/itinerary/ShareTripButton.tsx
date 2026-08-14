"use client";

import { useState } from "react";
import type { Itinerary } from "@/types/itinerary";
import type { Place } from "@/types/place";
import { formatTripAsText } from "@/lib/trip/share-formatter";

interface ShareTripButtonProps {
  itinerary: Itinerary;
  placesById: Map<string, Place>;
}

export function ShareTripButton({ itinerary, placesById }: ShareTripButtonProps) {
  const [copied, setCopied] = useState(false);
  const text = formatTripAsText(itinerary, placesById);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

  async function handleShare() {
    if (canShare) {
      try {
        await navigator.share({ title: "My Lucknow Trip", text });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard unavailable — WhatsApp link below still works
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleShare}
        className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-navy-800"
      >
        {canShare ? "📤 Share my trip" : copied ? "Copied!" : "📋 Copy itinerary"}
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-navy-900/20 px-5 py-2.5 text-sm font-medium text-navy-900 transition-colors hover:bg-sandstone-100"
      >
        Share on WhatsApp
      </a>
    </div>
  );
}
