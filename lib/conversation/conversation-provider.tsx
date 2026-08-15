"use client";

import { createContext, useReducer, type ReactNode } from "react";
import type { ConversationState, ConversationTurn } from "@/types/conversation";
import { createConversationState } from "@/types/conversation";
import { accumulatePreferences, recordMention, recordTurn } from "./conversation-reducer";

type ConversationAction =
  | { type: "RECORD_TURN"; turn: ConversationTurn }
  | { type: "RECORD_MENTION"; placeId: string }
  | { type: "ACCUMULATE_PREFERENCES"; rawText: string };

const initialConversationState: ConversationState = createConversationState();

/**
 * Thin action-dispatch wrapper around the canonical pure transition
 * functions in conversation-reducer.ts — mirrors exactly how
 * trip-store.tsx's storeReducer wraps tripReducer. Every actual
 * conversation-state transition is delegated to the existing Phase 5
 * helpers; this switch never reimplements any of that logic.
 */
function conversationStateReducer(
  state: ConversationState,
  action: ConversationAction,
): ConversationState {
  switch (action.type) {
    case "RECORD_TURN":
      return recordTurn(state, action.turn);
    case "RECORD_MENTION":
      return recordMention(state, action.placeId);
    case "ACCUMULATE_PREFERENCES":
      return accumulatePreferences(state, action.rawText);
    default:
      return state;
  }
}

export interface ConversationContextValue {
  state: ConversationState;
  recordTurn: (turn: ConversationTurn) => void;
  recordMention: (placeId: string) => void;
  accumulatePreferences: (rawText: string) => void;
}

export const ConversationContext = createContext<ConversationContextValue | null>(null);

/**
 * Global, session-only conversation state — deliberately not persisted
 * (see the approved Phase 5 scope: it's dialogue history + reference
 * pointers + pre-trip accumulation only, never a second source of trip
 * truth). Mounted once via AppProviders so every UI surface that calls
 * useConversation() shares the same recentlyMentionedPlaceIds/turns.
 */
export function ConversationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(conversationStateReducer, initialConversationState);

  const value: ConversationContextValue = {
    state,
    recordTurn: (turn) => dispatch({ type: "RECORD_TURN", turn }),
    recordMention: (placeId) => dispatch({ type: "RECORD_MENTION", placeId }),
    accumulatePreferences: (rawText) => dispatch({ type: "ACCUMULATE_PREFERENCES", rawText }),
  };

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
}
