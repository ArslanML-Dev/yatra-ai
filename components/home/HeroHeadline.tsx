"use client";

import { motion, useReducedMotion } from "framer-motion";

const LINES = ["Smile,", "you're in", "Lucknow."];

/**
 * The commanding hero moment — three staggered lines instead of one
 * flat headline. Each line is its own motion.span so the entrance
 * choreography reads deliberately, not as one block fading in.
 */
export function HeroHeadline() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <h1 className="text-display font-display text-ivory [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
      {LINES.map((line, i) => (
        <motion.span
          key={line}
          className="block"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          {line}
        </motion.span>
      ))}
    </h1>
  );
}
