# Yatra AI — Enhancement Implementation Report

This documents the interactive, location-aware enhancement pass built on top of the
existing Level 1 Lucknow prototype (see PRD.md, TECHNICAL_REQUIREMENTS.md for the base
build). Executed as 7 phases, each independently typechecked, linted, built, regression
-tested, and deployed before starting the next.

## 1. Features already present (preserved, not duplicated)

Routing, the 19-place curated Lucknow dataset, the pure itinerary-generation engine,
the rule-based NLU parser, the Leaflet/OpenStreetMap map with category filtering, the
"Get directions" Google Maps deep link (originally place-detail-only), mobile nav,
accessibility basics, and the zero-secrets/zero-env-var security posture — all reused
and extended, never rebuilt.

## 2. Features enhanced

- **Itinerary engine**: gained an optional `lockedPlaceIds` parameter so an explicit
  user choice is never silently dropped for being off-category or geographically
  distant (cluster reordering + a `guaranteeLockedPlacement` backstop pass).
- **NLU**: named-place detection (locks explicitly mentioned places as anchors) and
  a deterministic edit-command parser — both still 100% rule-based, no LLM.
- **"Get directions"**: extended from place-detail-only to itinerary stops and map
  markers, all sharing one URL builder; itinerary stops default their origin to the
  previous stop that day (an honest literal default) or the trip's reference point.
- **Nearby places**: `NearbyList` (bare `nearbyIds` list) replaced by
  `NearbySuggestions` — curated + proximity fallback, distance-with-source, "Add to
  my trip" — reused for both "Around this place" and "What should you do next?"
  rather than building two competing implementations.
- **Homepage discovery**: highlights raised from a hardcoded 4 to 8 (anchors +
  round-robin category backfill, no invented filler); hero carousel gained 2 more
  curated images and a subtler continuous pan.
- **Map**: gained `?highlight=` (pans/zooms/opens a marker from an itinerary stop)
  and a "Show my trip only" overlay.

## 3. Features newly implemented

- **Editable, lockable itinerary**: a localStorage-backed trip store (React Context +
  reducer, no new dependency) supporting add/remove/reorder/move-to-day/lock/
  regenerate-single-day, while `/plan/itinerary` stays a deep-linkable, shareable URL.
- **Natural-language trip editing**: "remove shopping", "keep Tunday Kababi", "add
  something near Bara Imambara", "make day 2 more relaxed", "reduce the budget" — via
  the deterministic edit-command parser; unrecognized input always gets an honest
  message, never a silent no-op.
- **Packed-day realism check**: a day at pace-capacity with a high total visit-time
  shows "⚠️ This day is quite packed" with a one-click relax action.
- **Distance-with-source + location**: contextual "Use my location" (never requested
  on page load) / "Choose starting point" sets a labeled reference point; every
  distance shown is always "X km from &lt;source&gt;", never a bare number.
- **Budget planner**: deterministic tier-based (budget/moderate/premium) category
  breakdown, every figure explicitly labelled "Estimated", documented group-size
  assumption, no invented real prices.
- **Saved places**: heart toggle, independent localStorage lifecycle from the trip.
- **Share My Trip**: Web Share API primary, clipboard fallback, explicit WhatsApp
  deep link — shares the current *edited* itinerary as human-readable text, never
  JSON.
- **Voice input**: browser-native Speech Recognition, feature-detected, mic-triggered
  only, transcript-confirmation step before handing off to the same parsing pipeline
  typed text uses. Wired into both the trip planner and the itinerary edit chat.
- **Honest live navigation (beta)**: `watchPosition`-based straight-line distance/
  bearing, real device heading only when the browser reports it, radius-based arrival
  detection, at-most-once speech announcements. No fake route line or turn-by-turn —
  the Google Maps link remains the labelled primary path.
- **Trip summary**: day/destination/must-visit/pace badges added directly to the
  existing itinerary page (chosen over a new `/trip` route — see rationale in the
  approved plan's Architecture Decision 5).

## 4. Features intentionally not implemented

- **Micro-itineraries** ("I have 2 hours near X") — not built this pass; the
  day-length/pace controls partially cover the underlying need. Flagged as future
  work rather than shipped shallow.
- **Numbered/day-colored map markers for the trip overlay** — the "Show my trip only"
  toggle filters to standard markers rather than custom day-numbered icons, to avoid
  a Leaflet DivIcon subsystem for a cosmetic gain.
- **A `<Suspense>`-scoped `loading.tsx` per route** — a global one was removed (see
  §5) rather than re-added per-segment, since the data layer is fully synchronous and
  a loading skeleton rarely if ever would show.
- **Any real routing/turn-by-turn** — explicitly out of scope per the no-new-API
  constraint; the external Google Maps handoff is the intended "real" path.

## 5. Notable fix found during this pass

Every `notFound()` call sitewide (e.g. an unknown place id) was returning **HTTP 200**
instead of 404 — a genuine bug in the already-live deployment, not introduced this
session. Root cause: the previously-added global `app/loading.tsx` created an implicit
root-level Suspense boundary, which per Next.js's own documented behavior causes a
response to start streaming as 200 before a `notFound()` check inside it can change
the status ("soft 404", with an automatic `noindex` meta tag as Next's built-in
mitigation). Since this app's data layer is fully synchronous, the loading skeleton
rarely showed anyway — it was removed, restoring correct 404 status codes sitewide.
Confirmed via the production build and the live deployment before and after.

## 6. Files touched

~45 new files (trip store, NLU editing, geo/distance/directions utilities, voice,
navigation, budget, sharing, saved places, new UI components) and ~20 modified
existing files (itinerary engine, planner, map, place detail, homepage, root layout).
See git history for the complete list — each of the 7 phases is its own commit with a
detailed message.

## 7. Dependencies added

**None.** Every capability (state, persistence, voice, geolocation, sharing) uses
React's built-in Context/reducer or browser-native APIs, per the explicit
no-unnecessary-dependencies constraint. One new npm script (`typecheck`) was added
since none existed and there's no automated test suite to otherwise catch regressions.

## 8. Tests run

No automated test suite exists (none was added, per the "don't overengineer" guidance
— `node --test` would suit the many pure functions here if desired later). Verification
was: `npm run typecheck` / `npm run lint` / `npm run build` clean after every phase; a
full manual route regression pass (every page, every category, a 404 case) against the
production build after every phase; the locked-place guarantee tested directly (an
off-category, geographically distant locked place confirmed to survive a 1-day
heritage-only itinerary); the homepage highlight count confirmed at 8 real places.

## 9. Build status

Clean at every checkpoint. Final state: `npm run typecheck`, `npm run lint`, and
`npm run build` all pass with zero errors/warnings; live production deployment
verified serving all routes correctly, including the 404 fix.

## 10. Known limitations

- Interactive client-side behavior (button clicks, drag/reorder, voice capture, live
  GPS) was verified through code review, SSR-safety checks, and manual route/status
  testing — not through live browser automation, since no browser tool was available
  in this environment. A manual click-through in an actual browser is recommended
  before the panel demo.
- The curated dataset (19 places) means longer/edit-heavy trips can exhaust available
  unused places faster than a larger dataset would — the itinerary engine already
  degrades honestly in this case (a labelled "leisure day") rather than repeating.
- Speech Recognition has inconsistent browser support (strong in Chromium-based
  browsers, weak/absent in Firefox and some mobile browsers) — the mic button simply
  doesn't render when unsupported, with text input always available.

## 11. Security findings

No secrets, API keys, or credentials anywhere in the codebase or repo (confirmed via
grep for `process.env` — zero matches — and no `.env*` files present). No
`dangerouslySetInnerHTML` or `eval` anywhere. All new user-facing text (place names,
edit-command confirmations, share text) renders through normal JSX interpolation,
which React auto-escapes. localStorage holds only the current trip (place ids,
preferences, an optional single approximate reference-point coordinate captured on
explicit user action) and saved-place ids — never transmitted anywhere (there is no
backend), user-clearable at any time, and never continuously tracked. Geolocation and
microphone permissions are requested only on explicit user action, never on page load.

## 12. Manual setup required

None. Zero new environment variables, zero new accounts/API keys, zero new
dependencies to install. `npm install && npm run build` continues to work exactly as
before.
