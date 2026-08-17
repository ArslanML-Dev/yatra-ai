"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A small, corner-anchored accent rather than a dominant block — the
 * rotating carousel photography is the hero's main visual, not the text
 * sitting over it.
 */
export function HeroHeadline() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.h1
      className="text-h2 font-display text-ivory [text-shadow:0_2px_20px_rgba(0,0,0,0.55)]"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      Smile, you&rsquo;re in Lucknow.
    </motion.h1>
  );
}
