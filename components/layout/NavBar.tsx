"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/map", label: "Map" },
  { href: "/transport", label: "Getting Around" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-sandstone-200/70 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-semibold text-navy-900" onClick={() => setOpen(false)}>
          Yatra <span className="text-saffron-600">AI</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-navy-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/plan"
            className="rounded-full bg-navy-900 px-5 py-2 text-sm font-medium text-ivory transition-colors hover:bg-navy-800"
          >
            Plan My Trip
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy-900 sm:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {open ? (
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="flex flex-col gap-1 border-t border-sandstone-200/70 px-6 py-4 sm:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-sandstone-100 hover:text-navy-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
