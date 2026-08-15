"use client";

import { useProfileUI } from "./ProfilePanel";

export function ProfileTrigger() {
  const { togglePanel } = useProfileUI();
  return (
    <button
      type="button"
      onClick={togglePanel}
      aria-label="Open your profile"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-900/20 text-sm text-navy-900 transition-colors hover:bg-sandstone-100"
    >
      👤
    </button>
  );
}
