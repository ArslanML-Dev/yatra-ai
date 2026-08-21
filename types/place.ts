import type { DataType, VerificationStatus } from "./source";

export type PlaceCategory =
  | "heritage"
  | "food"
  | "shopping"
  | "parks"
  | "riverfront_evening"
  | "modern"
  | "transport";

export type TimeOfDaySuitability = "morning" | "afternoon" | "evening" | "night";

/** Marks a food place as the natural anchor for a specific meal, used by
 * the day-rhythm model. Not every food place needs one — a quick chaat
 * stop isn't a meal anchor, for instance. */
export type MealSlot = "breakfast" | "lunch" | "dinner";

/** Coarse geographic grouping used for day-rhythm continuity (avoiding
 * cross-city zig-zag) and cluster labeling. Deliberately coarse — this is
 * not a replacement for the radius-based haversine clustering, just a
 * human-readable area a place belongs to. */
export type LucknowArea = "old-lucknow" | "hazratganj-central" | "gomti-nagar-modern" | "riverfront";

export type PriceRange = "free" | "₹" | "₹₹" | "₹₹₹" | "unknown";

/** Real dietary classification for a food place, populated only where
 * genuinely verifiable — never guessed. Drives the itinerary engine's
 * dietary filter. */
export type DietaryClassification = "vegetarian" | "non-veg" | "both";

export interface Coordinates {
  lat: number;
  lng: number;
}

/** One real, independently-verified branch of a multi-location place
 * (e.g. Tunday Kababi — Aminabad vs Kapoorthala). Coordinates/address are
 * specific to that branch, never inherited from the parent or another
 * branch. The parent Place carries the shared brand-level content
 * (history, verification tier, dietary tags, card image); branches carry
 * only what's genuinely branch-specific. */
export interface PlaceBranch {
  id: string;
  label: string;
  coordinates: Coordinates;
  address?: string;
  note?: string;
}

export interface ImageRef {
  url: string;
  alt: string;
  source: string;
  sourceUrl?: string;
  license?: string;
}

/** Structured hours, populated only where confidently sourceable from
 * multiple independent tourism sources — most places in this dataset
 * won't have this field, and that's the honest default, not a gap to
 * fill in with a guess. `weekdayText`/`note` are the human-readable
 * display text; `opensHour`/`closesHour` (24h) are the same real,
 * sourced hours in a form the itinerary engine can actually use to
 * avoid scheduling a place outside them — set only alongside a real
 * `weekdayText`, never invented on their own. */
export interface OpeningHours {
  weekdayText: string[];
  note?: string;
  opensHour?: number;
  closesHour?: number;
}

export interface Place {
  id: string;
  destinationId: string;
  name: string;
  category: PlaceCategory;
  subcategory?: string;
  description: string;
  whyVisit: string;
  historicalContext?: string;
  bestTime?: string;
  openingHours?: OpeningHours;
  estimatedVisitMinutes: number;
  suitableTimesOfDay: TimeOfDaySuitability[];
  mealSlot?: MealSlot;
  area?: LucknowArea;
  coordinates: Coordinates;
  address?: string;
  images: ImageRef[];
  priceRange?: PriceRange;
  knownFor?: string[];
  tags: string[];
  nearbyIds: string[];
  transportNote?: string;
  /** Real dietary classification — food places only, populated where
   * genuinely verifiable. */
  dietary?: DietaryClassification;
  /** For an active place of worship (temple/mosque/dargah/gurudwara):
   * real, sourced visiting norms — dress code, non-adherent access,
   * footwear, photography rules, prayer-time closures. Not optional for
   * that group; omitted everywhere else. */
  visitingNorms?: string[];
  /** Real, independently-verified branches for a place that genuinely
   * operates multiple locations (e.g. Tunday Kababi, Dastarkhwan). When
   * present, this entry is the parent/brand card — the browsing UI shows
   * a branch selector instead of a single set of coordinates, and the
   * itinerary engine picks whichever branch is nearest that day's
   * cluster. Absent for every place with just one real location. */
  branches?: PlaceBranch[];
  source: string;
  sourceUrl?: string;
  retrievedAt: string;
  verificationStatus: VerificationStatus;
  dataType: DataType;
}
