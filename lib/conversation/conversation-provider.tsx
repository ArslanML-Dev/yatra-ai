"use client";

import { createContext, useReducer, useState, type ReactNode } from "react";
import type { ConversationState, ConversationTurn } from "@/types/conversation";
import { createConversationState } from "@/types/conversation";
import type { UserPreferences } from "@/types/user-preferences";
import { accumulatePreferences, recordMention, recordTurn } from "./conversation-reducer";
import { useProfile } from "@/lib/profile/use-profile";

type ConversationAction =
  | { type: "RECORD_TURN"; turn: ConversationTurn }
  | { type: "RECORD_MENTION"; placeId: string }
  | { type: "ACCUMULATE_PREFERENCES"; rawText: string }
  | { type: "SEED_FROM_PROFILE"; preferences: Partial<UserPreferences> };

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
    case "SEED_FROM_PROFILE":
      // Any conversational input already accumulated wins over a
      // profile default — this only ever fills gaps, never overrides.
      return { ...state, accumulated: { ...action.preferences, ...state.accumulated } };
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
  const { profile, hydrated: profileHydrated } = useProfile();
  const [seededFromProfile, setSeededFromProfile] = useState(false);

  // Pre-fills `accumulated` from a saved local profile, once, the first
  // render after the profile store hydrates — the "feeds Travel Agent
  // conversation defaults" half of the Local Profile scope. Only
  // meaningful now that chat-based trip creation actually reads
  // `accumulated`; never touches Trip. Adjusted during render (React's
  // sanctioned pattern, not an effect) so it can't fire after a real
  // conversation is already in progress.
  if (profileHydrated && !seededFromProfile) {
    setSeededFromProfile(true);
    if (profile && Object.keys(profile.preferences).length > 0) {
      dispatch({ type: "SEED_FROM_PROFILE", preferences: profile.preferences });
    }
  }

  const value: ConversationContextValue = {
    state,
    recordTurn: (turn) => dispatch({ type: "RECORD_TURN", turn }),
    recordMention: (placeId) => dispatch({ type: "RECORD_MENTION", placeId }),
    accumulatePreferences: (rawText) => dispatch({ type: "ACCUMULATE_PREFERENCES", rawText }),
  };

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
}
