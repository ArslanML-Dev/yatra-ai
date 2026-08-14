# Yatra AI — Technical Requirements (Level 1)

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS v4
(CSS-first `@theme` tokens), Framer Motion, Leaflet + react-leaflet. No external API
keys required to run this build.

## Architecture

```
UI (app/, components/)
  -> lib/providers/*        PlaceProvider, AIProvider, MapProvider interfaces
       -> lib/providers/lucknow-curated-provider.ts   (implements PlaceProvider)
       -> lib/providers/rule-based-ai-provider.ts      (implements AIProvider)
       -> lib/providers/leaflet-map-provider.ts         (implements MapProvider)
  -> lib/data/*              typed, sourced Lucknow records (destination-scoped)
  -> lib/itinerary/*         scoring -> clustering -> slot assignment -> Itinerary
  -> lib/nlu/*                free-text -> UserPreferences (regex/keyword, no ML)
```

`lib/providers/provider-registry.ts` is the single place callers resolve a provider from
a `destinationId`; today every id resolves to the Lucknow implementations, but the
branch point already exists for a second city or a swapped backend.

## Data model

Core types in `/types`: `Place`, `Destination`, `Source`, `UserPreferences`,
`Itinerary`/`ItineraryDay`/`ItinerarySlot`. Every `Place` carries `source`, `sourceUrl`,
`retrievedAt`, `verificationStatus` (`VERIFIED_STATIC`/`CURATED`/`ESTIMATED`) and
`dataType` — see DATA_SOURCES_AND_TRUST.md for how these are actually populated.

## Itinerary algorithm

Deterministic and destination-agnostic: filter by interest tags → score (interest
match, family/pace bonuses, anchor landmarks) → greedy geographic clustering
(haversine distance, no external geocoding) → best-cluster-first day assignment with a
global `usedPlaceIds` set so longer trips never repeat a place → time-of-day slot
assignment respecting each place's `suitableTimesOfDay` and the requested pace. See
`lib/itinerary/generate-itinerary.ts`.

## NLU

`lib/nlu/parse-preferences.ts` — pure regex/keyword extraction for duration, group
type, interests, pace, and budget, with a confidence score and an `unresolvedFields`
list driving the UI's structured-fallback nudge. No network call, no API key.

## Maps

`react-leaflet` against OpenStreetMap tiles. `MapView` is dynamically imported with
`ssr: false` (Leaflet touches `window` at import time) and default marker icons are
re-pointed to bundled assets to work under Turbopack.

## Security & env

No secrets in this build — everything ships with zero required environment variables.
Sensitive values (a future LLM key, a future Mapbox/Google Maps key) would be read
server-side only, consistent with the provider seam already in place.

## Testing performed

`next build` and `eslint` run clean. Itinerary scaling manually verified for N = 1, 4,
7, 10 days (non-repetition and honest degradation confirmed). Full route click-through
(home → explore → category → place → plan → itinerary → map → transport) verified via
the dev server, including a 404 for an unknown place id.

## Deployment

Vercel. No environment variables required for this build to run in production.
Live at **https://yatra-ai-five.vercel.app** — every route (home, explore, category
listings, place detail, map, planner, itinerary, transport) verified 200 in production,
including Wikimedia remote-image optimization.
