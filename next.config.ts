import type { NextConfig } from "next";
import path from "node:path";

/**
 * Curated Wikimedia photos never change once sourced — the default 60s
 * cache meant Next re-fetched them constantly, which was enough to trip
 * Wikimedia's own rate limiting and show a broken image mid-session
 * (confirmed via real browser testing: 429s on repeated requests to the
 * same file). A year-long cache is safe here specifically because these
 * URLs are hand-curated, not user-submitted or frequently rotated.
 */
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// React's dev mode needs eval() for debugging features (stack
// reconstruction) — it never uses eval() in production, so this is
// scoped strictly to development, not loosened for real deployments.
const scriptSrc =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const CSP = [
  "default-src 'self'",
  "img-src 'self' data: https://upload.wikimedia.org https://*.tile.openstreetmap.org",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  // overpass-api.de + kumi.systems: primary + fallback live query
  // endpoints for Nearby Essentials.
  "connect-src 'self' https://*.tile.openstreetmap.org https://overpass-api.de https://overpass.kumi.systems",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
    minimumCacheTTL: ONE_YEAR_SECONDS,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // geolocation: Nearby Essentials / "Use my location". microphone:
          // voice input (Web Speech API). Both are real, used features —
          // everything else stays denied.
          { key: "Permissions-Policy", value: "geolocation=(self), microphone=(self), camera=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
