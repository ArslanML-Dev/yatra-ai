# Yatra AI — Provider Status

| Seam | Interface | Current implementation | Status |
|---|---|---|---|
| Places/content | `PlaceProvider` (`lib/providers/place-provider.ts`) | `LucknowCuratedProvider` — reads typed local data in `lib/data/` | Live, async-shaped for a future DB swap |
| AI / trip understanding | `AIProvider` (`lib/providers/ai-provider.ts`) | `RuleBasedAIProvider` — deterministic regex/keyword NLU (`lib/nlu/`) | Live. No LLM API key available for this build; swapping in a real LLM means writing a new class with the same `parsePreferences`/`explainItinerary` signature |
| Maps | `MapProvider` (`lib/providers/map-provider.ts`) | `LeafletMapProvider` — OpenStreetMap tiles via `react-leaflet` | Live. No Mapbox/Google Maps key available; the interface (`getTileConfig`, `getDefaultCenter`, `toMarkers`) is provider-agnostic |
| Database | — | None. Structured local TypeScript data, not Supabase/Prisma | Deliberately deferred — see PRD.md non-goals. The `Place`/`Destination` types already mirror what a Postgres schema would look like |
| Booking / hotels / bookings ecosystem | — | Not built | Explicitly out of scope for Level 1 |

## Investigated and deferred

- **TryBloom.ai** — no credentials or documentation were available in this environment
  within the project's time budget; not integrated. If credentials become available, it
  would sit behind a new provider, not require touching UI code.
- **Supabase / Vercel / Chrome DevTools / Context7 / Sentry MCP** — none were connected
  in the development environment for this build. Standard CLI tooling (`npm`, `git`,
  `vercel` CLI) was used instead; no time was spent configuring unavailable tooling.
