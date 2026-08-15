"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const submit = useCallback(
    (rawText: string): { navigated: boolean } => {
      const text = rawText.trim();
      if (!text) return { navigated: false };

      let message: string;
      let navigated = false;
      try {
        const intent = routeMessage(text, {
          trip: tripCtx.trip,
          allPlaces,
          conversation: conversation.state,
        });

        if (intent.kind === "navigation-start") {
          // Real application navigation to the place page, where actual
          // live guidance (LiveNavigationPanel) already exists — this is
          // the honest scope of "navigation" here, not turn-by-turn.
          // execute-agent-intent.ts is deliberately not involved: it has
          // no router access, and its contract (zero side effects for
          // navigation intents) stays exactly as Phase 5 verified it —
          // navigation-stop still goes through it, unchanged, below.
          router.push(`/place/${intent.destinationPlaceId}`);
          navigated = true;
          message = `Taking you to ${intent.destinationName} — you can try live guidance from there.`;
        } else {
          const result = executeAgentIntent(intent, tripCtx.trip, allPlaces, tripCtx);
          message = result.message;
        }

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
      return { navigated };
    },
    [tripCtx, conversation, allPlaces, router],
  );

  return { turns: conversation.state.turns, submit };
}
