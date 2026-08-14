# Yatra AI — Product Requirements (Level 1: Lucknow Pilot)

## Problem

Travel information for a city is fragmented across booking sites, blog posts, and maps. A
tourist can rarely see, in one place: what's worth visiting, what to eat and where, how to
move between neighbourhoods, and how all of that fits into the number of days they actually
have. Generic listicles don't adapt to trip length, group type, or pace.

## Target users

Families, first-time visitors, and independent travellers planning a trip to Lucknow of
any length — from a single day to a week or more.

## Level 1 objective

Prove that an AI-assisted, data-backed trip planner can turn a few stated preferences
(duration, group, interests, pace, optional budget) into a geographically sensible,
non-repeating, day-wise itinerary — for one deeply-developed pilot city, not a shallow
multi-city clone.

## Core user journey

Homepage → Explore Lucknow by category → (optional) place detail → Plan My Trip
(free text or structured form) → generated day-wise itinerary → map view → practical
transport guidance.

## Features (this build)

- Categorized discovery: heritage, food, shopping, parks, riverfront/evening, modern
  Lucknow, transport.
- Place detail pages with sourcing/verification status on every record.
- Interactive map (OpenStreetMap/Leaflet) with category filters.
- AI trip planner: rule-based natural-language parsing of free text, plus a structured
  fallback form; both feed the same itinerary engine.
- Itinerary generator: geographic clustering + interest/pace-aware slot assignment,
  scaling correctly to any requested trip length (tested 1–10+ days) without repeating
  places, and degrading honestly (a labelled "leisure day") when curated data runs out
  rather than fabricating content.

## Non-goals (this build)

No booking flows, no hotel search, no live pricing/availability, no claimed business
partnerships, no multi-agent AI orchestration, no real database (data lives in typed,
sourced local files behind a repository interface — see TECHNICAL_REQUIREMENTS.md).

## Future expansion

The `PlaceProvider` / `AIProvider` / `MapProvider` seams are destination-agnostic by
design. Adding a second city means writing a new curated data set and provider, not
rearchitecting the app. Future layers (real LLM, real database, hotel/booking
integrations, live maps API) plug into the same interfaces.

## Success criteria for Level 1

A panel member can: land on the homepage, describe a trip in plain language, get a
itinerary that visibly respects trip length and interests, open a place's sourced
detail page, see it on the map, and understand the transport/mobility reality of the
city — without encountering a fabricated fact or a broken page.
