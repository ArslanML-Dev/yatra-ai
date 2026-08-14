import Link from "next/link";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/map", label: "Map" },
  { href: "/transport", label: "Getting Around" },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-sandstone-200/70 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-semibold text-navy-900">
          Yatra <span className="text-saffron-600">AI</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-navy-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/plan"
          className="rounded-full bg-navy-900 px-5 py-2 text-sm font-medium text-ivory transition-colors hover:bg-navy-800"
        >
          Plan My Trip
        </Link>
      </div>
    </header>
  );
}
