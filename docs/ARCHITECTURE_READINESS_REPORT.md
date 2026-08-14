# Yatra AI — Architecture Readiness Report

## What's demonstrated

A complete, working slice of the intended product: destination discovery, a place
detail system with sourcing, an interactive map, and an AI-assisted planner that
generates a real, non-repeating, geographically-clustered itinerary for any requested
trip length — all running on zero external API keys.

## Readiness for expansion

| Capability | Today | To add it |
|---|---|---|
| A second city | `destinationId` is threaded through every type and provider call, but only `"lucknow"` has data | Write a new curated data set + register it in `getPlaceProvider` |
| Real database | `PlaceProvider` is already async-shaped over local data | Implement a new class (e.g. Supabase/Prisma-backed) with the same interface |
| Real LLM | `AIProvider.parsePreferences`/`explainItinerary` is a stable contract | Implement a new class calling Claude/OpenAI server-side with the same method signatures |
| Real maps provider | `MapProvider` abstracts tile config, default center, and marker mapping | Implement a Mapbox/Google-backed class; swap in `provider-registry.ts` |
| Auth / bookings / "My Area" | Not built | Out of scope for Level 1 by design — see PRD.md non-goals |

## Known limitations at this stage

- Curated dataset is intentionally small (19 places) — enough for 1–7 day itineraries
  to feel non-repeating, but a 10-day trip will honestly degrade into labelled
  "leisure days" once the curated set is exhausted rather than repeat content. This
  is a data-depth limitation, not an algorithm bug (verified working as designed for
  N up to 10).
- No opening hours, prices, or live availability anywhere — a deliberate scope
  decision, not an oversight (see DATA_SOURCES_AND_TRUST.md).
- The rule-based NLU handles the demo's target phrasing well but is not a real
  language model — unusual phrasing may under-extract, which is why the structured
  fallback form is always shown alongside free text, never hidden behind a failure
  state.
- No automated test suite; correctness was verified through manual build/lint checks
  and route-by-route smoke testing (documented in TECHNICAL_REQUIREMENTS.md).

## Overall assessment

The provider-seam architecture is the main technical bet of this build: it lets the
demo be fully honest about using no real backend, no real LLM, and no paid maps API,
while still being structurally ready to add all three without a rewrite. That is the
basis for the claim that this is "a Lucknow-first pilot of a system built to expand,"
not a one-off city page.
