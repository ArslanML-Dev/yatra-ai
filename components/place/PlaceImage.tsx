"use client";

import { useState } from "react";
import Image from "next/image";
import type { Place, PlaceCategory } from "@/types/place";

/**
 * One category-icon set, used everywhere a place image can fail or be
 * missing — hand-authored inline (no icon-library dependency), 24x24,
 * stroke-based to match a single consistent visual language.
 */
const CATEGORY_ICON: Record<PlaceCategory, React.ReactNode> = {
  heritage: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V10.5L12 4l8 6.5V21" />
      <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
      <path d="M4 21h16" />
    </svg>
  ),
  food: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3v7a2 2 0 0 0 2 2v9" />
      <path d="M7 3v5M11 3v5" />
      <path d="M17 3c-1.5 0-3 1.5-3 4s1.5 4 3 4v10" />
    </svg>
  ),
  shopping: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8h12l-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  parks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 6 12h3l-4 6h5" />
      <path d="M12 8l5 8h-3l3.5 5H9" />
      <path d="M12 21v-4" />
    </svg>
  ),
  riverfront_evening: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 5a3 3 0 1 1-3 3" />
      <path d="M3 15q2-2 4 0t4 0 4 0 4 0" />
      <path d="M3 19q2-2 4 0t4 0 4 0 4 0" />
    </svg>
  ),
  modern: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21V7l6-4 6 4v14" />
      <path d="M9 21v-5h4v5M9 10h.01M13 10h.01M9 14h.01M13 14h.01" />
    </svg>
  ),
  transport: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <path d="M4 12h16M8 16v2M16 16v2" />
      <circle cx="8" cy="19" r="0.5" fill="currentColor" />
      <circle cx="16" cy="19" r="0.5" fill="currentColor" />
    </svg>
  ),
};

/** Soft, category-tinted ground for the icon on a light (card/thumbnail)
 * surface — reuses the app's existing palette so a fallback never looks
 * like a foreign/decorative element. */
const CATEGORY_TINT_LIGHT: Record<PlaceCategory, string> = {
  heritage: "bg-saffron-400/15 text-saffron-600",
  food: "bg-leaf-500/15 text-leaf-600",
  shopping: "bg-sandstone-300/40 text-saffron-600",
  parks: "bg-leaf-500/15 text-leaf-600",
  riverfront_evening: "bg-navy-700/15 text-navy-700",
  modern: "bg-navy-700/15 text-navy-700",
  transport: "bg-sandstone-300/40 text-ink-soft",
};

/** Same icon set, tinted for a dark hero band — used where the surrounding
 * copy expects a photographic backdrop with light overlay text (place
 * detail hero), so a missing photo still reads as a deliberate hero, not
 * an absent one. */
const CATEGORY_TINT_DARK: Record<PlaceCategory, string> = {
  heritage: "bg-navy-950 text-saffron-400",
  food: "bg-navy-950 text-leaf-500",
  shopping: "bg-navy-950 text-saffron-400",
  parks: "bg-navy-950 text-leaf-500",
  riverfront_evening: "bg-navy-950 text-sandstone-200",
  modern: "bg-navy-950 text-sandstone-200",
  transport: "bg-navy-950 text-sandstone-200",
};

interface PlaceImageProps {
  place: Place;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** "sm" for compact list/slot thumbnails, "lg" for hero/card imagery. */
  iconSize?: "sm" | "lg";
  /** "light" (default) for white/sandstone card surfaces, "dark" for a
   * photographic hero band expecting light overlay text. */
  tone?: "light" | "dark";
}

/**
 * The single place-image renderer, used everywhere a place photo can
 * appear. Empty `images[]` and a failed load are the same case — both
 * land on the same category-tinted icon fallback, never a broken-image
 * glyph or blank box.
 */
export function PlaceImage({ place, sizes, priority, className, iconSize = "lg", tone = "light" }: PlaceImageProps) {
  const [failed, setFailed] = useState(false);
  const image = failed ? undefined : place.images[0];

  if (image) {
    return (
      <Image
        src={image.url}
        alt={image.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  const tint = tone === "dark" ? CATEGORY_TINT_DARK : CATEGORY_TINT_LIGHT;
  return (
    <div className={`flex h-full w-full items-center justify-center ${tint[place.category]}`}>
      <span className={iconSize === "sm" ? "h-6 w-6" : "h-12 w-12"}>{CATEGORY_ICON[place.category]}</span>
    </div>
  );
}
