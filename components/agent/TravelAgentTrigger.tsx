"use client";

import { useTravelAgentUI } from "./TravelAgentPanel";

export function TravelAgentTrigger() {
  const { togglePanel } = useTravelAgentUI();
  return (
    <button
      type="button"
      onClick={togglePanel}
      aria-label="Open Travel Agent"
      className="rounded-full border border-navy-900/20 px-3 py-2 text-sm font-medium text-navy-900 transition-colors hover:bg-sandstone-100 sm:px-4"
    >
      💬 <span className="hidden sm:inline">Ask Yatra</span>
    </button>
  );
}
