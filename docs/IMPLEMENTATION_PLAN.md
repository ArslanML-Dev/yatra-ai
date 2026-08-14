# Yatra AI — Implementation Plan (as executed)

Budget: 3 days, ≤5 hours/day, ~15 hours total. Every day ended in a demoable state.

## Day 1 — Skeleton, data foundation, homepage

Next.js 16 scaffold (TS, Tailwind v4, App Router); `PlaceProvider`/`AIProvider`/
`MapProvider` interfaces and their first implementations; the itinerary-generation
engine and rule-based NLU parser (pulled forward from Day 2 since the design didn't
depend on content); first-pass verified heritage/food/park data with researched,
sourced coordinates; design tokens and typography; the homepage.

## Day 2 — Core features end-to-end

`/explore` hub and category listing pages; `/place/[id]` detail; the interactive map
(Leaflet, dynamic import, category toggles); the `/plan` planner (free text +
structured fallback + editable preference chips) and `/plan/itinerary` result page.
Itinerary scaling verified for N = 1, 4, 7, 10 days.

## Day 3 — Remaining content, hardening, polish, deploy

Remaining categories (shopping/Chikankari, modern Lucknow, riverfront/evening,
transport) researched and authored; `/transport` practical-guidance page; responsive
pass (mobile nav, grid breakpoints); accessibility pass (contrast fix on the accent
color, `aria-pressed`/`role="group"` on toggle controls, reduced-motion handling on the
animated hero); global `error`/`not-found`/`loading` boundaries; documentation; Vercel
deploy; final demo walkthrough.

## What was deliberately cut or deferred

Real database (Supabase/Prisma), a live LLM call, Mapbox/Google Maps, hotel/booking
flows, budget-estimation math beyond capturing the number, and a "My Area" feature —
all explicitly out of scope for a 15-hour Level 1 build (see PRD.md non-goals). Where
cut, the provider seam was still built wide enough to accept the real thing later
without a rewrite.
