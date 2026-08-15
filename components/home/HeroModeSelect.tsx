"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTravelAgentUI } from "@/components/agent/TravelAgentPanel";

/**
 * The two creation paths, made to feel like two distinct journeys
 * instead of two identically-styled buttons: a translucent "AI does
 * it" card that opens the existing Travel Agent panel (no new state —
 * reuses useTravelAgentUI verbatim), and a solid "you control it" card
 * linking to the existing /plan route. Same underlying capabilities as
 * before, just visually differentiated by mental model.
 */
export function HeroModeSelect() {
  const { togglePanel } = useTravelAgentUI();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="mt-9 grid grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-2"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        onClick={togglePanel}
        className="group flex flex-col items-start gap-1.5 rounded-card border border-ivory/25 bg-ivory/10 p-5 text-left shadow-soft backdrop-blur-sm transition-colors hover:bg-ivory/15"
      >
        <span aria-hidden="true" className="text-xl">
          ✨
        </span>
        <span className="font-display text-lg text-ivory">Ask Yatra</span>
        <span className="text-body-sm text-ivory/70">
          Tell it what you want — the AI plans the trip.
        </span>
      </button>
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
