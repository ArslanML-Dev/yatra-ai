import type { ConversationState } from "@/types/conversation";

export type ReferenceResolution =
  | { status: "resolved"; placeId: string }
  | { status: "ambiguous"; candidateIds: string[] }
  | { status: "none" };

/**
 * Resolves a bare deictic reference ("it", "this place", "that") against
 * the conversation's recently-mentioned places. Deliberately conservative:
 * resolves only when exactly one candidate is present. Two or more —
 * even if one "feels" more recent — is treated as ambiguous rather than
 * guessed, per the standing "never guess a destructive action" rule.
 * Zero candidates means nothing to resolve against at all.
 */
export function resolveDeicticReference(conversation: ConversationState): ReferenceResolution {
  const ids = conversation.recentlyMentionedPlaceIds;
  if (ids.length === 0) return { status: "none" };
  if (ids.length === 1) return { status: "resolved", placeId: ids[0] };
  return { status: "ambiguous", candidateIds: ids };
}
