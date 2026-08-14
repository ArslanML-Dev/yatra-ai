"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { ImageRef } from "@/types/place";

const ROTATE_MS = 5500;

export function HeroCarousel({ images }: { images: ImageRef[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [images.length]);

  if (images.length === 0) {
    return <div className="absolute inset-0 bg-navy-900" aria-hidden="true" />;
  }

  const current = images[index];

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-950">
      <AnimatePresence mode="sync">
        <motion.div
          key={current.url}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={current.url}
            alt={current.alt}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-navy-950/10" />
    </div>
  );
}
