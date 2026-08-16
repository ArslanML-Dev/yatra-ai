"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/**
 * The single homepage entry point into trip planning. Previously paired
 * with a second "Ask Yatra" card that opened a chat widget replying with
 * the same generic message regardless of input — removed entirely rather
 * than fixed, so this is the one primary CTA, not two doing the same job.
 */
export function HeroModeSelect() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="mt-9 sm:max-w-xs"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href="/plan"
        className="group flex flex-col items-start gap-1.5 rounded-card bg-saffron-600 p-5 text-left shadow-soft transition-colors hover:bg-saffron-500"
      >
        <span aria-hidden="true" className="text-xl">
          🧭
        </span>
        <span className="font-display text-lg text-ivory">Plan My Trip</span>
        <span className="text-body-sm text-ivory/85">
          Choose your days, interests, and pace yourself.
        </span>
      </Link>
    </motion.div>
  );
}
