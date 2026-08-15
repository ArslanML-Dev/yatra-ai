import type { Place } from "@/types/place";
import type { Trip } from "@/types/trip";
import type { UserPreferences } from "@/types/user-preferences";
import type { AgentIntent } from "@/types/conversation";
import type { TripContextValue } from "@/lib/trip/trip-store";
import { executeEditIntent, findSlotByPlaceId } from "@/lib/nlu/execute-edit-intent";
import { findNearestPlaces } from "@/lib/geo/nearest-places";
import { formatDistanceWithSource } from "@/lib/geo/format-distance";
import { formatCategoryLabel } from "@/lib/utils/format";

export interface AgentExecutionResult {
  message: string;
}

/**
 * Honest progress message for a still-accumulating creation flow — only
 * states what parsePreferences actually matched (per unresolvedFields),
 * never claims certainty about a guessed/defaulted field.
 */
function buildCreationFollowUp(preferences: UserPreferences): string {
  const known: string[] = [];
  if (!preferences.unresolvedFields.includes("days")) {
    known.push(`${preferences.days} day${preferences.days > 1 ? "s" : ""}`);
  }
  if (!preferences.unresolvedFields.includes("group")) known.push(preferences.group);
  if (!preferences.unresolvedFields.includes("interests") && preferences.interests.length > 0) {
    known.push(preferences.interests.map(formatCategoryLabel).join(", "));
  }

  const summary = known.length > 0 ? `Got it — ${known.join(", ")} so far. ` : "";
  const missing =
    preferences.unresolvedFields.length > 0
      ? `Tell me ${preferences.unresolvedFields.join(", ")} whenever you're ready, or `
      : "";
  return `${summary}${missing}say "plan my trip" and I'll build it with what I have.`;
}

/**
 * The ONLY place any AgentIntent results in a TripContextValue call.
 * Exhaustive switch over a closed union — the `default` branch's `never`
 * assignment makes an unhandled AgentIntent.kind a compile error, not a
 * silent runtime fallthrough. There is no generic string-to-action
 * dispatch anywhere in this function: every branch calls a specific,
 * named TripContextValue method, or calls none at all.
 */
export function executeAgentIntent(
  intent: AgentIntent,
  trip: Trip | null,
  allPlaces: Place[],
  actions: TripContextValue,
): AgentExecutionResult {
  switch (intent.kind) {
    // Existing edit-command machinery, reused verbatim — never
    // reimplemented. Covers remove-category, remove-place, keep-place,
    // add-near (named), move-place, day-pace, budget-adjust, and its
    // own "unrecognized" terminal.
    case "remove-category":
    case "remove-place":
    case "keep-place":
    case "add-near":
    case "move-place":
    case "day-pace":
    case "budget-adjust":
    case "unrecognized":
      return { message: executeEditIntent(intent, trip, allPlaces, actions) };

    case "create-trip":
      // Real generation + navigation to /plan/itinerary (the existing
      // generateItinerary pipeline) happens in use-travel-agent.ts when
      // intent.ready is true — see navigation-start immediately below
      // for the identical precedent: this function has no router
      // access by design. This branch only ever actually runs for the
      // still-accumulating (ready: false) case.
      return {
        message: intent.ready
          ? `Building your ${intent.preferences.days}-day Lucknow trip…`
          : buildCreationFollowUp(intent.preferences),
      };

    case "navigation-start":
      // Recognized, never executed this phase — no TripContextValue
      // call, no fake navigation state. See Phase 6 for real wiring.
      return {
        message: `Live navigation isn't available yet in this build. (I understood you want to go to ${intent.destinationName}.)`,
      };

    case "navigation-stop":
      return { message: "Live navigation isn't available yet in this build." };

    case "clarification-needed": {
      if (intent.reason === "ambiguous-reference") {
        const names = intent.candidateNames?.join(" or ") ?? "several places";
        return { message: `Did you mean ${names}? Tell me which one.` };
      }
      if (intent.reason === "anchor-unavailable") {
        return {
          message: "I don't know where to search from yet — share your location, or tell me a starting point.",
        };
      }
      return { message: "Which place do you mean?" };
    }

    case "mark-visited": {
      if (!trip) return { message: "Start a trip first." };
      const found = findSlotByPlaceId(trip, intent.placeId);
      if (!found) return { message: `${intent.placeName} isn't part of your trip.` };
      actions.markVisited(found.slot.id);
      return { message: `Marked ${intent.placeName} as visited.` };
    }

    case "skip-this": {
      if (!trip) return { message: "Start a trip first." };
      const found = findSlotByPlaceId(trip, intent.placeId);
      if (!found) return { message: `${intent.placeName} isn't part of your trip.` };
      // Per the approved interaction model: "skip this" both flags the
      // stop and moves the current-stop pointer forward — not just a
      // flag with no progress consequence.
      actions.markSkipped(found.slot.id);
      actions.advanceToNextStop();
      return { message: `Marked ${intent.placeName} as skipped — it'll stay in your plan, just flagged.` };
    }

    case "add-near-anchor": {
      if (!trip) return { message: "Start a trip first." };
      const usedIds = trip.itinerary.days.flatMap((d) => d.slots.map((s) => s.placeId));
      const nearest = findNearestPlaces(intent.anchor.coordinates, allPlaces, { excludeIds: usedIds, limit: 1 });
      if (nearest.length === 0) {
        return { message: "I couldn't find anything nearby that isn't already in your trip." };
      }
      const dayNumber = trip.itinerary.days[0]?.dayNumber ?? 1;
      actions.addStop(dayNumber, nearest[0].place);
      return {
        message: `Added ${nearest[0].place.name} (${formatDistanceWithSource(nearest[0].distanceKm, intent.anchor.label)}).`,
      };
    }

    case "find-nearby": {
      if (!trip) return { message: "Start a trip first." };
      const usedIds = trip.itinerary.days.flatMap((d) => d.slots.map((s) => s.placeId));
      const nearest = findNearestPlaces(intent.anchor.coordinates, allPlaces, { excludeIds: usedIds, limit: 3 });
      if (nearest.length === 0) return { message: `Nothing new nearby ${intent.anchor.label}.` };
      return {
        message: `Near ${intent.anchor.label}: ${nearest.map((n) => n.place.name).join(", ")}.`,
      };
    }

    case "whats-next": {
      if (!trip) return { message: "Start a trip first." };
      if (!trip.currentSlotId) return { message: "You haven't started today's stops yet." };
      for (const day of trip.itinerary.days) {
        const slot = day.slots.find((s) => s.id === trip.currentSlotId);
        if (slot) {
          const place = allPlaces.find((p) => p.id === slot.placeId);
          return { message: place ? `Next: ${place.name}.` : "Next stop isn't in the current dataset." };
        }
      }
      return { message: "Nothing else planned right now." };
    }

    case "update-preference-metadata":
      actions.updatePreferenceMetadata(intent.preferences);
      return {
        message: "Noted — I've saved that preference. It doesn't change today's plan yet.",
      };

    case "set-accommodation": {
      if (!trip) return { message: "Start a trip first, then tell me where you're staying." };
      actions.setAccommodationLocation(intent.location);
      return { message: `Got it — using ${intent.location.label} as your accommodation area.` };
    }

    default: {
      const exhaustiveCheck: never = intent;
      throw new Error(`Unhandled AgentIntent kind: ${JSON.stringify(exhaustiveCheck)}`);
    }
  }
}
