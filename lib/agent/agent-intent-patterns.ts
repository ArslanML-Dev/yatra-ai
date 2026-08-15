/**
 * Deterministic phrase tables for the agent-level intents that sit above
 * the existing edit-command parser (navigation, contextual, preference-
 * metadata, accommodation). Same style/spirit as lib/nlu/edit-command-
 * patterns.ts — plain substring matching, no fuzzy tolerance.
 */

export const TAKE_ME_TO_PHRASES = ["take me to", "navigate to", "directions to", "go to"];
export const STOP_NAVIGATION_PHRASES = ["stop navigation", "end navigation", "cancel navigation"];

export const WHATS_NEXT_PHRASES = ["what's next", "whats next", "what is next", "next stop"];
export const HOW_FAR_PHRASES = ["how far", "how much further", "distance to"];
export const FIND_NEARBY_PHRASES = ["find something nearby", "what's nearby", "anything nearby", "find nearby"];

/** "this"/"that" without a named place elsewhere in the sentence is what
 * makes these deictic rather than a normal named-place edit — the router
 * only reaches these checks after the existing parseEditCommand has
 * already failed to find a named-place match. */
export const MARK_VISITED_PHRASES = [
  "already visited",
  "i've visited",
  "i have visited",
  "visited this",
  "visited that",
  "been here",
  "been there",
];
export const SKIP_THIS_PHRASES = ["skip this", "skip that", "skip it"];
export const REMOVE_THIS_PHRASES = ["remove it", "remove this", "delete it", "delete this"];

/** Reuses the existing ADD_NEAR_PHRASES from edit-command-patterns.ts —
 * this table only adds the "...but no named place, just a deictic
 * location" signal on top. */
export const NEAR_HERE_WORDS = ["here", "nearby", "my location", "close by", "around me"];

export const STAYING_PHRASES = [
  "staying near",
  "staying at",
  "staying in",
  "i'm staying",
  "im staying",
  "my hotel is near",
  "based near",
];

export const WALKING_MINIMAL_PHRASES = [
  "don't want much walking",
  "dont want much walking",
  "not much walking",
  "less walking",
  "avoid walking",
  "minimal walking",
  "not a lot of walking",
];
export const WALKING_HIGH_PHRASES = [
  "happy to walk",
  "walk a lot",
  "lots of walking",
  "don't mind walking",
  "dont mind walking",
];

export const FOOD_VEG_PHRASES = ["vegetarian", "veg only", "veg food", "no meat"];
export const FOOD_NONVEG_PHRASES = ["non-vegetarian", "non vegetarian", "non-veg", "meat"];
export const FOOD_SPICY_PHRASES = ["spicy food", "extra spicy", "like it spicy"];
export const FOOD_MILD_PHRASES = ["not spicy", "less spicy", "mild food"];
