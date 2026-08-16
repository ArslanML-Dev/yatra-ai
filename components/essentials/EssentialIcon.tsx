import type { EssentialCategory } from "@/types/essentials";

/** Same hand-authored, stroke-based icon language as PlaceImage's
 * category fallbacks — one consistent icon system across the app. */
const ICONS: Record<EssentialCategory, React.ReactNode> = {
  hospital: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  pharmacy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M12 14v3M10.5 15.5h3" />
    </svg>
  ),
  atm: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 14h4" />
    </svg>
  ),
  police: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="M9.5 12l1.8 1.8L15 10" />
    </svg>
  ),
  grocery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h2l1.2 10.4a1.5 1.5 0 0 0 1.5 1.3h8.6a1.5 1.5 0 0 0 1.5-1.3L20 8H7" />
      <circle cx="10" cy="21" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="21" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  mall: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8h12l-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
};

export function EssentialIcon({ category, className }: { category: EssentialCategory; className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {ICONS[category]}
    </span>
  );
}
