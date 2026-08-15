import type { Coordinates } from "./place";
import type { UserPreferences } from "./user-preferences";
import type { EditIntent } from "@/lib/nlu/parse-edit-command";
import type { NamedLocation } from "./trip";

export interface ConversationTurn {
  role: "user" | "agent";
  text: string;
}

/**
 * Everything the Travel Agent's interpretation layer needs across turns.
 * Deliberately NOT a second source of truth for the trip itself — see
 * the approved Phase 5 scope: `accumulated` only matters pre-trip, and
 * `recentlyMentionedPlaceIds` are IDs pointing into real place/trip
 * data, never copies of it.
 */
export interface ConversationState {
  turns: ConversationTurn[];
  /** Most-recent-first, capped small. A bare reference ("it"/"this
   * place") resolves only when exactly one candidate is present here —
   * see lib/agent/resolve-reference.ts. */
  recentlyMentionedPlaceIds: string[];
  /** Pre-trip only. Authoritative only until START_TRIP fires — once a
   * Trip exists, every read comes from the Trip, never from here. */
  accumulated: Partial<UserPreferences>;
}

export const MAX_RECENT_MENTIONS = 3;

export function createConversationState(): ConversationState {
  return { turns: [], recentlyMentionedPlaceIds: [], accumulated: {} };
}

/** A location resolved from context (live position, current stop,
 * accommodation) rather than a named place — see resolve-anchor.ts.
 * Distinct from NamedLocation only in that it always carries a `source`
 * tag identifying which tier of the resolution chain produced it, so a
 * reply can honestly state where "here" came from. */
export interface ResolvedAnchor {
  label: string;
  coordinates: Coordinates;
  source: "live-location" | "current-stop" | "accommodation" | "start-location";
}

/**
 * The Travel Agent's complete, closed set of possible interpretations.
 * This union is the deterministic boundary the architecture requires:
 * everything upstream of producing an AgentIntent is pure
 * interpretation (no Trip access); everything downstream
 * (execute-agent-intent.ts) is an exhaustive switch that calls exactly
 * one validated TripContextValue method per kind. No generic
 * string-to-action dispatch exists anywhere in this pipeline.
 */
export type AgentIntent =
  | EditIntent
  | { kind: "add-near-anchor"; anchor: ResolvedAnchor }
  | { kind: "whats-next" }
  | { kind: "find-nearby"; anchor: ResolvedAnchor }
  | { kind: "mark-visited"; placeId: string; placeName: string }
  | { kind: "skip-this"; placeId: string; placeName: string }
  | { kind: "navigation-start"; destinationPlaceId: string; destinationName: string }
  | { kind: "navigation-stop" }
  | {
      kind: "update-preference-metadata";
      preferences: Partial<Pick<UserPreferences, "walkingTolerance" | "foodPreferences">>;
    }
  | { kind: "set-accommodation"; location: NamedLocation }
  | {
      kind: "clarification-needed";
      reason: "ambiguous-reference" | "no-reference" | "anchor-unavailable";
      candidateNames?: string[];
    };
