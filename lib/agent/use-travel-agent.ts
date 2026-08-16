"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Place } from "@/types/place";
import { useTrip } from "@/lib/trip/use-trip";
import { useConversation } from "@/lib/conversation/use-conversation";
import { mentionedPlaceIdFromIntent } from "@/lib/conversation/conversation-reducer";
import { buildItineraryQueryString } from "@/lib/trip/itinerary-query";
import { routeMessage } from "./intent-router";
import { executeAgentIntent } from "./execute-agent-intent";

/**
 * The single orchestration path for turning a raw message into a Trip
 * mutation — the itinerary page's TripEditChat ("Adapt my trip") calls
 * this hook rather than wiring routeMessage/executeAgentIntent itself,
 * so there is exactly one place a message turns into a Trip mutation
 * plus a conversation-state update. (A second UI surface, a global
 * "Ask Yatra" chat panel, previously called this hook too; it was
 * removed for replying with the same generic message regardless of
 * input — this hook and the conversation-state pipeline it drives are
 * unrelated to that bug and remain the real, working edit pathway.)
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
          referencePoint: tripCtx.referencePoint,
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
        } else if (intent.kind === "create-trip" && intent.ready) {
          // Same boundary as navigation-start: execute-agent-intent.ts
          // has no router access by design. Navigates through the exact
          // route PlannerForm already uses, so generation runs through
          // the one existing generateItinerary pipeline either way.
          router.push(`/plan/itinerary?${buildItineraryQueryString(intent.preferences)}`);
          navigated = true;
          message = `Building your ${intent.preferences.days}-day Lucknow trip…`;
        } else {
          const result = executeAgentIntent(intent, tripCtx.trip, allPlaces, tripCtx);
          message = result.message;
        }

        // Keeps ConversationState.accumulated current for the next turn
        // — the same pre-existing, previously-uncalled action Phase 5
        // added for exactly this purpose.
        if (intent.kind === "create-trip") conversation.accumulatePreferences(text);

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
