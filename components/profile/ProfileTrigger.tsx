"use client";

import { useProfileUI } from "./ProfilePanel";

export function ProfileTrigger() {
  const { togglePanel } = useProfileUI();
  return (
    <button
      type="button"
      onClick={togglePanel}
      aria-label="Travel preferences"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-900/20 text-navy-900 transition-colors hover:bg-sandstone-100"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="4" y1="7" x2="20" y2="7" />
        <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
        <line x1="4" y1="14" x2="20" y2="14" />
        <circle cx="16" cy="14" r="2" fill="currentColor" stroke="none" />
        <line x1="4" y1="19" x2="20" y2="19" />
        <circle cx="11" cy="19" r="2" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}
