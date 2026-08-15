"use client";

import { useCallback } from "react";
import type { Place } from "@/types/place";
import { useTrip } from "@/lib/trip/use-trip";
import { useConversation } from "@/lib/conversation/use-conversation";
import { mentionedPlaceIdFromIntent } from "@/lib/conversation/conversation-reducer";
import { routeMessage } from "./intent-router";
import { executeAgentIntent } from "./execute-agent-intent";

/**
 * The single orchestration path shared by every UI surface — the global
 * TravelAgentPanel and the itinerary page's TripEditChat both call this
 * hook rather than wiring routeMessage/executeAgentIntent themselves.
 * This is what makes "same pipeline, same conversation state, same trip
 * state" true by construction rather than by convention: there is
 * exactly one place a raw message turns into a Trip mutation plus a
 * conversation-state update.
 */
export function useTravelAgent(allPlaces: Place[]) {
  const tripCtx = useTrip();
  const conversation = useConversation();

  const submit = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      if (!text) return;

      let message: string;
      try {
        const intent = routeMessage(text, {
          trip: tripCtx.trip,
          allPlaces,
          conversation: conversation.state,
        });
        const result = executeAgentIntent(intent, tripCtx.trip, allPlaces, tripCtx);
        message = result.message;

        const mentionedId = mentionedPlaceIdFromIntent(intent);
        if (mentionedId) conversation.recordMention(mentionedId);
      } catch {
        // Defensive only — the exhaustive switch in executeAgentIntent
        // means this should never fire in practice; if it somehow does,
        // fail into an honest message rather than crashing the panel.
        message = "Something went wrong processing that — please try again.";
      }

      conversation.recordTurn({ role: "user", text });
      conversation.recordTurn({ role: "agent", text: message });
    },
    [tripCtx, conversation, allPlaces],
  );

  return { turns: conversation.state.turns, submit };
}
