"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ImageRef } from "@/types/place";

const ROTATE_MS = 5500;

export function HeroCarousel({ images: allImages }: { images: ImageRef[] }) {
  const [index, setIndex] = useState(0);
  // A hotlinked Wikimedia source can rate-limit or fail transiently —
  // confirmed via real browser testing (429s during Next's image
  // optimization fetch). Failed URLs drop out of rotation instead of
  // leaving a blank void with only alt text visible; never a fabricated
  // replacement image, just skipping to the next real one.
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const prefersReducedMotion = useReducedMotion();

  const images = allImages.filter((img) => !failedUrls.has(img.url));

  useEffect(() => {
    if (images.length < 2 || prefersReducedMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [images.length, prefersReducedMotion]);

  if (images.length === 0) {
    return <div className="absolute inset-0 bg-navy-900" aria-hidden="true" />;
  }

  const current = images[index % images.length];

  function handleError() {
    setFailedUrls((prev) => new Set(prev).add(current.url));
  }

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-navy-950">
        <Image
          src={current.url}
          alt={current.alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          onError={handleError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/70 to-navy-950/35" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-950">
      <AnimatePresence mode="sync">
        <motion.div
          key={current.url}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.06 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.2, ease: "easeOut" },
            scale: { duration: ROTATE_MS / 1000 + 1, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <Image
            src={current.url}
            alt={current.alt}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
            onError={handleError}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/70 to-navy-950/35" />
    </div>
  );
}
