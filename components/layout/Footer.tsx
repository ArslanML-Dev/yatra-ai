"use client";

import Link from "next/link";
import { useTravelAgentUI } from "@/components/agent/TravelAgentPanel";
import { useProfileUI } from "@/components/profile/ProfilePanel";

const exploreLinks = [
  { href: "/explore", label: "Explore Lucknow" },
  { href: "/map", label: "Map" },
  { href: "/transport", label: "Getting Around" },
];

/**
 * A real multi-column footer mirroring NavBar's actual entry points —
 * not a placeholder link set. Every link/button here maps to a genuinely
 * working feature.
 */
export function Footer() {
  const { togglePanel: toggleAgentPanel } = useTravelAgentUI();
  const { togglePanel: toggleProfilePanel } = useProfileUI();

  return (
    <footer className="border-t border-sandstone-200/70 bg-navy-950 text-ivory/70">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="text-h4 font-display text-ivory">
            Yatra <span className="text-saffron-400">AI</span>
          </p>
          <p className="mt-3 max-w-sm text-body-sm">
            An AI-powered tourism platform, currently showcased in Lucknow. Every place
            shown is curated and sourced — see each listing for its verification status.
          </p>
        </div>

        <div>
          <p className="text-caption font-medium uppercase text-ivory/40">Explore</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-body-sm transition-colors hover:text-ivory">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-caption font-medium uppercase text-ivory/40">Plan</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            <li>
              <Link href="/plan" className="text-body-sm transition-colors hover:text-ivory">
                Plan My Trip
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={toggleAgentPanel}
                className="text-body-sm transition-colors hover:text-ivory"
              >
                Ask the Travel Agent
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={toggleProfilePanel}
                className="text-body-sm transition-colors hover:text-ivory"
              >
                Travel Preferences
              </button>
            </li>
            <li>
              <Link href="/saved" className="text-body-sm transition-colors hover:text-ivory">
                Saved Places
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <p className="mx-auto max-w-6xl px-6 py-6 text-caption text-ivory/40">
          Prototype build for SIH 2026, Level 1 screening. Not affiliated with any
          government tourism body.
        </p>
      </div>
    </footer>
  );
}
