# Yatra AI — Data Sources & Trust

## Principle

No place, coordinate, price, hour, or superlative claim in this build was invented.
Every `Place` record carries `source`, `sourceUrl`, `retrievedAt`, and a
`verificationStatus`. Where a fact could not be independently verified, it was either
omitted or written with hedged language ("known for", "widely described as", "reportedly")
rather than stated as settled fact.

## Verification statuses used

- **VERIFIED_STATIC** — coordinates and core facts cross-checked against Wikipedia's
  infobox and/or an independent OpenStreetMap lookup. Used for all heritage sites, both
  parks, Ekana Stadium, and both transport hubs.
- **CURATED** — coordinates confirmed against at least one mapping source, but either
  the exact business/outlet identity has some ambiguity, or facts came from secondary
  sources (food/travel write-ups) rather than a primary record. Used for the food
  establishments, the shopping/market entries, the two malls, and Gomti Riverfront Park.
- **ESTIMATED** — not currently used; reserved for values that are a reasonable guess
  rather than sourced (e.g. a future field with no available source at all).

## Deliberately omitted

- **SEWA Chikankari** was researched and dropped entirely. Two similarly-named
  entities exist (the original women-artisans' NGO vs. a commercially-reviewed
  "Seva Chikan" store), and no single current, verifiable address could be confirmed
  for the genuine outlet. Rather than publish a guessed pin, it was left out.
- **Opening hours, ticket prices, and event schedules** are not shown anywhere in this
  build. Every place they were mentioned in secondary sources, those sources
  disagreed with each other (e.g. Gomti Riverfront Park's hours) or came from a single
  non-primary listing — not a safe basis for a fact shown to a tourist.
- **Superlative claims** ("largest", "oldest", "tallest") are only ever shown with
  attribution ("widely described as...", "self-described by the operator as...") —
  e.g. Bara Imambara's arched-hall size, Janeshwar Mishra Park's "largest in Asia",
  Lulu Mall/Phoenix Palassio's "biggest mall" claims, and Ekana Stadium's boundary/
  capacity records.

## Sources used

Wikipedia (primary source for most heritage sites, parks, the stadium, and both
transport hubs), OpenStreetMap/Nominatim (coordinate cross-checks and for places
without a dedicated Wikipedia article), and a small set of food/travel write-ups for
restaurant-level detail (Tunday Kababi, Raheem's, Royal Café, Chowk food street) where
no primary record exists — these are marked `CURATED`, not `VERIFIED_STATIC`. Full
per-place citations are in each record's `sourceUrl` field and visible on every place
detail page.

## Images

All images are Wikimedia Commons photographs under an open license (GFDL or
CC BY-SA), each with `alt` text, `source`, and a `sourceUrl` crediting the original
file page. Several restaurant/market/mall entries have no image yet rather than a
stock or invented photo — the UI shows a plain placeholder in that case.
