import type { Place } from "@/types/place";
import type { Trip } from "@/types/trip";
import type { AgentIntent, ConversationState } from "@/types/conversation";
import { parseEditCommand } from "@/lib/nlu/parse-edit-command";
import { matchNamedPlaces } from "@/lib/nlu/named-place-matcher";
import { ADD_NEAR_PHRASES, PACK_WORDS, RELAX_WORDS } from "@/lib/nlu/edit-command-patterns";
import { resolveDeicticReference } from "./resolve-reference";
import { resolveContextualAnchor } from "./resolve-anchor";
import { resolveRelativeDay } from "./resolve-relative-day";
import {
  FIND_NEARBY_PHRASES,
  FOOD_MILD_PHRASES,
  FOOD_NONVEG_PHRASES,
  FOOD_SPICY_PHRASES,
  FOOD_VEG_PHRASES,
  HOW_FAR_PHRASES,
  MARK_VISITED_PHRASES,
  NEAR_HERE_WORDS,
  SKIP_THIS_PHRASES,
  STAYING_PHRASES,
  STOP_NAVIGATION_PHRASES,
  TAKE_ME_TO_PHRASES,
  WALKING_HIGH_PHRASES,
  WALKING_MINIMAL_PHRASES,
  WHATS_NEXT_PHRASES,
} from "./agent-intent-patterns";

export interface RouteMessageContext {
  trip: Trip | null;
  allPlaces: Place[];
  conversation: ConversationState;
}

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((p) => text.includes(p));
}

function afterPhrase(text: string, phrase: string): string {
  return text.slice(text.indexOf(phrase) + phrase.length);
}

/**
 * The Travel Agent's single interpretation entry point: raw text +
 * context in, one closed AgentIntent out. Pure function — never touches
 * TripState. See execute-agent-intent.ts for the only place any of
 * these intents result in an actual mutation.
 *
 * Priority order (checked top to bottom, first match wins):
 *  1. Navigation phrases — recognized, never executed this phase.
 *  2. The existing deterministic edit-command parser (remove/keep/
 *     add-near-named/day-pace/budget/move-place) — reused verbatim,
 *     never reimplemented.
 *  3. Relative-day pace changes ("make tomorrow slower") — only once
 *     step 2 has already failed to find an absolute "day N".
 *  4. Contextual intents requiring reference/anchor resolution.
 *  5. Preference-metadata and accommodation phrases.
 *  6. Unrecognized — the honest terminal case.
 */
export function routeMessage(rawText: string, context: RouteMessageContext): AgentIntent {
  const text = rawText.toLowerCase().trim();
  const placesById = new Map(context.allPlaces.map((p) => [p.id, p]));

  // 1. Navigation — recognized, never executed in Phase 5.
  const takeMePhrase = TAKE_ME_TO_PHRASES.find((p) => text.includes(p));
  if (takeMePhrase) {
    const named = matchNamedPlaces(afterPhrase(text, takeMePhrase), context.allPlaces);
    if (named.length > 0) {
      return { kind: "navigation-start", destinationPlaceId: named[0].id, destinationName: named[0].name };
    }
  }
  if (includesAny(text, STOP_NAVIGATION_PHRASES)) return { kind: "navigation-stop" };

  // 2. Existing edit-command parser — only meaningful once a trip exists.
  if (context.trip) {
    const editIntent = parseEditCommand(rawText, context.allPlaces);
    if (editIntent.kind !== "unrecognized") return editIntent;
  }

  // 3. Relative-day pace changes.
  if (includesAny(text, RELAX_WORDS) || includesAny(text, PACK_WORDS)) {
    const relativeDay = resolveRelativeDay(text, context.trip?.currentDayNumber ?? null);
    if (relativeDay !== null) {
      return {
        kind: "day-pace",
        dayNumber: relativeDay,
        pace: includesAny(text, RELAX_WORDS) ? "relaxed" : "packed",
      };
    }
  }

  // 4a. Deictic mark-visited / skip-this.
  if (includesAny(text, MARK_VISITED_PHRASES)) return resolveDeicticIntent(context, "mark-visited");
  if (includesAny(text, SKIP_THIS_PHRASES)) return resolveDeicticIntent(context, "skip-this");

  // 4b. Contextual add-near — a near-phrase with a deictic word instead
  // of a named place (the existing edit-command parser above already
  // handles the named-place case and would have returned before we get
  // here).
  const nearPhrase = ADD_NEAR_PHRASES.find((p) => text.includes(p));
  if (nearPhrase && includesAny(text, NEAR_HERE_WORDS)) {
    const anchor = resolveContextualAnchor(context.trip, placesById);
    if (anchor) return { kind: "add-near-anchor", anchor };
    return { kind: "clarification-needed", reason: "anchor-unavailable" };
  }

  // 4c. Read-only contextual queries.
  if (includesAny(text, WHATS_NEXT_PHRASES)) return { kind: "whats-next" };
  if (includesAny(text, FIND_NEARBY_PHRASES) || includesAny(text, HOW_FAR_PHRASES)) {
    const anchor = resolveContextualAnchor(context.trip, placesById);
    if (anchor) return { kind: "find-nearby", anchor };
    return { kind: "clarification-needed", reason: "anchor-unavailable" };
  }

  // 5a. Preference metadata (state-only — see UPDATE_PREFERENCE_METADATA).
  if (includesAny(text, WALKING_MINIMAL_PHRASES)) {
    return { kind: "update-preference-metadata", preferences: { walkingTolerance: "minimal" } };
  }
  if (includesAny(text, WALKING_HIGH_PHRASES)) {
    return { kind: "update-preference-metadata", preferences: { walkingTolerance: "high" } };
  }
  if (includesAny(text, FOOD_VEG_PHRASES) || includesAny(text, FOOD_NONVEG_PHRASES)) {
    return {
      kind: "update-preference-metadata",
      preferences: { foodPreferences: { dietary: includesAny(text, FOOD_VEG_PHRASES) ? "veg" : "non-veg" } },
    };
  }
  if (includesAny(text, FOOD_SPICY_PHRASES) || includesAny(text, FOOD_MILD_PHRASES)) {
    return {
      kind: "update-preference-metadata",
      preferences: { foodPreferences: { spiceTolerance: includesAny(text, FOOD_SPICY_PHRASES) ? "spicy" : "mild" } },
    };
  }

  // 5b. Accommodation.
  const stayingPhrase = STAYING_PHRASES.find((p) => text.includes(p));
  if (stayingPhrase) {
    const named = matchNamedPlaces(afterPhrase(text, stayingPhrase), context.allPlaces);
    if (named.length > 0) {
      return {
        kind: "set-accommodation",
        location: {
          label: named[0].name,
          coordinates: named[0].coordinates,
          source: "user-stated",
          capturedAt: new Date().toISOString(),
        },
      };
    }
  }

  return { kind: "unrecognized" };
}

function resolveDeicticIntent(
  context: RouteMessageContext,
  kind: "mark-visited" | "skip-this",
): AgentIntent {
  const resolution = resolveDeicticReference(context.conversation);
  if (resolution.status === "resolved") {
    const place = context.allPlaces.find((p) => p.id === resolution.placeId);
    return { kind, placeId: resolution.placeId, placeName: place?.name ?? resolution.placeId };
  }
  if (resolution.status === "ambiguous") {
    const names = resolution.candidateIds
      .map((id) => context.allPlaces.find((p) => p.id === id)?.name ?? id);
    return { kind: "clarification-needed", reason: "ambiguous-reference", candidateNames: names };
  }
  return { kind: "clarification-needed", reason: "no-reference" };
}
