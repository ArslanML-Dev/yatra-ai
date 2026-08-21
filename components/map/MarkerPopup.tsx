"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Place } from "@/types/place";
import { formatCategoryLabel } from "@/lib/utils/format";
import { useDirectionsLink } from "@/lib/geo/use-directions-link";
import { useTrip } from "@/lib/trip/use-trip";

export function MarkerPopup({ place }: { place: Place }) {
  const { referencePoint } = useTrip();
  const prefersReducedMotion = useReducedMotion();
  const directions = useDirectionsLink(place.coordinates, referencePoint?.coordinates);

  return (
    <motion.div
      className="min-w-[180px]"
      initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.16 }}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-saffron-600">
        {formatCategoryLabel(place.category)}
      </p>
      <p className="mt-1 font-display text-base text-navy-900">{place.name}</p>
      <div className="mt-2 flex flex-col gap-1">
        <Link href={`/place/${place.id}`} className="text-sm text-saffron-600 underline">
          View details
        </Link>
        <a
          href={directions?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-saffron-600 underline"
        >
          🧭 Open in {directions?.label ?? "Google Maps"}
        </a>
      </div>
    </motion.div>
  );
}
