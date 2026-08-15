import type { AgentIntent, ConversationState, ConversationTurn } from "@/types/conversation";
import { MAX_RECENT_MENTIONS } from "@/types/conversation";
import { parsePreferences } from "@/lib/nlu/parse-preferences";

/** Records a place as the most recent referent, deduplicating and
 * capping the list — see resolve-reference.ts for how this is consumed
 * by deictic references ("it", "this place"). */
export function recordMention(state: ConversationState, placeId: string): ConversationState {
  const withoutDuplicate = state.recentlyMentionedPlaceIds.filter((id) => id !== placeId);
  return {
    ...state,
    recentlyMentionedPlaceIds: [placeId, ...withoutDuplicate].slice(0, MAX_RECENT_MENTIONS),
  };
}

export function recordTurn(state: ConversationState, turn: ConversationTurn): ConversationState {
  return { ...state, turns: [...state.turns, turn] };
}

/**
 * Pre-trip preference accumulation across turns — this is the first
 * real call site for parsePreferences's `defaults` parameter, which
 * existed since the original build but was never passed by the one
 * existing caller (PlannerForm.tsx, untouched by this phase). Only
 * meaningful before a Trip exists; once START_TRIP fires,
 * `accumulated` is no longer read by anything.
 */
export function accumulatePreferences(state: ConversationState, rawText: string): ConversationState {
  const parsed = parsePreferences(rawText, state.accumulated);
  return { ...state, accumulated: { ...state.accumulated, ...parsed } };
}

/**
 * Given an already-resolved AgentIntent, returns the placeId (if any)
 * that should become the next "recently mentioned" referent — e.g. after
 * "keep Bara Imambara" succeeds, a later "remove it" should resolve to
 * Bara Imambara. Only intents that genuinely name/act on one specific
 * place qualify; read-only or place-less intents return null rather than
 * guessing a referent.
 */
export function mentionedPlaceIdFromIntent(intent: AgentIntent): string | null {
  switch (intent.kind) {
    case "remove-place":
    case "keep-place":
    case "mark-visited":
    case "skip-this":
    case "move-place":
      return intent.placeId;
    case "add-near":
      return intent.anchorPlaceId;
    case "navigation-start":
      return intent.destinationPlaceId;
    default:
      return null;
  }
}
