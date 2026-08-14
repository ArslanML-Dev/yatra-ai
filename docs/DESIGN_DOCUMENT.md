# Yatra AI — Design Document (Level 1)

Visual language: warm ivory/sandstone neutrals, deep navy, a restrained saffron accent —
conveyed through imagery, typography (Fraunces display serif + Inter body) and
composition rather than flags or tricolour iconography. Motion is purposeful (hero
crossfade, hover states) and respects `prefers-reduced-motion`.

## Screens

**Homepage** (`/`) — Cinematic hero (rotating sourced photography), one-line product
promise, primary CTA ("Plan My Lucknow Trip") and secondary CTA ("Explore Lucknow"), a
short city overview, a highlights grid of anchor places, and a "Two Sides of Lucknow"
section contrasting old and modern Lucknow. Sets expectations before any interaction.

**Explore hub** (`/explore`) — All seven categories as cards, each with a one-line
description, linking to its listing page. Prevents the "wall of places" problem the
directive explicitly warns against.

**Category listing** (`/explore/[category]`) — A grid of `PlaceCard`s for one category,
with an empty state for categories still being curated.

**Place detail** (`/place/[id]`) — Image, category + verification badges, why-visit,
history, "known for" (hedged claims only), time required, best time, address, a
"Get directions" external link, source link, and a nearby-places list. One consistent
shape reused everywhere a place is shown in depth.

**Map** (`/map`) — Full Leaflet map (OpenStreetMap tiles, no API key) with category
toggle buttons filtering markers client-side. Dynamically imported to avoid SSR issues.

**Planner** (`/plan`) — A free-text box parsed by the rule-based NLU, an always-visible
structured fallback form (day stepper, group, interests, pace, budget), and a live
"here's what we understood" chip summary so either input path stays editable before
generating.

**Itinerary** (`/plan/itinerary`) — Preferences are carried via URL query params (a
stateless, deep-linkable design). Renders one card per day with morning/afternoon/
evening/night slots, an honest disclaimer, and links back to adjust preferences or view
the plan on the map.

**Transport** (`/transport`) — Airport/station cards plus static, area-specific mobility
guidance (old-city walking vs. modern-area cabs) — deliberately not live traffic data.

## Responsive & accessibility

Mobile-first grid utilities throughout (`grid-cols-1` base, `sm:`/`lg:` overrides); a
collapsible mobile nav menu; semantic landmarks (`header`/`main`/`footer`); visible
focus rings; `aria-pressed`/`role="group"` on toggle-button clusters; alt text and
source attribution on every image; a contrast-checked accent color for text-on-white
usage; global and per-route loading/error/not-found states.
