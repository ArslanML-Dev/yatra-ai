import type { Place } from "@/types/place";
import type { Trip } from "@/types/trip";
import { findNearestPlaces } from "@/lib/geo/nearest-places";
import { formatDistanceWithSource } from "@/lib/geo/format-distance";
import type { TripContextValue } from "@/lib/trip/trip-store";
import type { EditIntent } from "./parse-edit-command";
import { EDIT_COMMAND_EXAMPLES } from "./parse-edit-command";
import { formatCategoryLabel } from "@/lib/utils/format";

const BUDGET_STEP_RATIO = 0.2;
const DEFAULT_DAILY_BUDGET_INR = 1500;

export function findSlotByPlaceId(trip: Trip, placeId: string) {
  for (const day of trip.itinerary.days) {
    const slot = day.slots.find((s) => s.placeId === placeId);
    if (slot) return { dayNumber: day.dayNumber, slot };
  }
  return null;
}

function findDayContainingPlace(trip: Trip, placeId: string): number | null {
  const found = findSlotByPlaceId(trip, placeId);
  return found ? found.dayNumber : null;
}

/**
 * Executes a parsed edit intent against the current trip via the trip
 * store's primitive actions, returning a user-facing confirmation or
 * honest explanation. Never a silent no-op.
 */
export function executeEditIntent(
  intent: EditIntent,
  trip: Trip | null,
  allPlaces: Place[],
  actions: TripContextValue,
): string {
  if (intent.kind === "unrecognized") {
    return `I didn't understand that — try things like "${EDIT_COMMAND_EXAMPLES[0]}", "${EDIT_COMMAND_EXAMPLES[2]}", or "${EDIT_COMMAND_EXAMPLES[3]}".`;
  }

  if (!trip) {
    return "Start a trip first, then I can help you edit it.";
  }

  const placesById = new Map(allPlaces.map((p) => [p.id, p]));

  switch (intent.kind) {
    case "remove-category": {
      const allSlots = trip.itinerary.days.flatMap((d) => d.slots);
      const matching = allSlots.filter((s) => placesById.get(s.placeId)?.category === intent.category);
      const removable = matching.filter((s) => !s.locked);

      if (matching.length === 0) {
        return `There's nothing in ${formatCategoryLabel(intent.category)} in your trip right now.`;
      }
      if (removable.length === 0) {
        return `Everything in ${formatCategoryLabel(intent.category)} is locked — unlock it first if you want it removed.`;
      }

      actions.removeMatchingCategory(intent.category, placesById);
      const skipped = matching.length - removable.length;
      return `Removed ${removable.length} ${formatCategoryLabel(intent.category).toLowerCase()} stop${removable.length > 1 ? "s" : ""}.${skipped > 0 ? ` (${skipped} locked stop${skipped > 1 ? "s" : ""} kept.)` : ""}`;
    }

    case "remove-place": {
      const found = findSlotByPlaceId(trip, intent.placeId);
      if (!found) return `${intent.placeName} isn't in your trip.`;
      if (found.slot.locked) {
        return `${intent.placeName} is locked — unlock it first if you want to remove it.`;
      }
      actions.removeStop(found.slot.id);
      return `Removed ${intent.placeName}.`;
    }

    case "keep-place": {
      const found = findSlotByPlaceId(trip, intent.placeId);
      if (found) {
        if (found.slot.locked) return `${intent.placeName} is already locked in.`;
        actions.toggleLock(found.slot.id);
        return `Locked ${intent.placeName} as a must-visit.`;
      }
      const place = placesById.get(intent.placeId);
      if (!place) return `${intent.placeName} isn't in the Lucknow dataset.`;
      actions.addAndLockStop(0, place);
      return `Added and locked ${intent.placeName} as a must-visit.`;
    }

    case "add-near": {
      const anchor = placesById.get(intent.anchorPlaceId);
      if (!anchor) return `${intent.anchorName} isn't in the Lucknow dataset.`;

      const usedIds = trip.itinerary.days.flatMap((d) => d.slots.map((s) => s.placeId));
      const nearest = findNearestPlaces(anchor.coordinates, allPlaces, {
        excludeIds: [...usedIds, anchor.id],
        limit: 1,
      });
      if (nearest.length === 0) {
        return `I couldn't find anything nearby that isn't already in your trip.`;
      }

      const dayNumber = findDayContainingPlace(trip, anchor.id) ?? trip.itinerary.days[0]?.dayNumber ?? 1;
      actions.addStop(dayNumber, nearest[0].place);
      return `Added ${nearest[0].place.name} (${formatDistanceWithSource(nearest[0].distanceKm, intent.anchorName)}).`;
    }

    case "move-place": {
      const found = findSlotByPlaceId(trip, intent.placeId);
      if (!found) return `${intent.placeName} isn't in your trip.`;
      if (found.dayNumber === intent.toDayNumber) {
        return `${intent.placeName} is already on Day ${intent.toDayNumber}.`;
      }
      actions.moveStopToDay(found.slot.id, intent.toDayNumber);
      return `Moved ${intent.placeName} to Day ${intent.toDayNumber}.`;
    }

    case "day-pace": {
      const dayExists = trip.itinerary.days.some((d) => d.dayNumber === intent.dayNumber);
      if (!dayExists) return `Your trip doesn't have a Day ${intent.dayNumber}.`;
      actions.regenerateDay(intent.dayNumber, allPlaces, intent.pace);
      return `Made Day ${intent.dayNumber} more ${intent.pace}.`;
    }

    case "budget-adjust": {
      const current = trip.itinerary.preferences.budget?.amount ?? trip.itinerary.days.length * DEFAULT_DAILY_BUDGET_INR;
      const delta = current * BUDGET_STEP_RATIO;
      const nextAmount = Math.round(
        (intent.direction === "reduce" ? current - delta : current + delta) / 100,
      ) * 100;
      actions.updatePreferences({ budget: { amount: Math.max(500, nextAmount), currency: "INR" } }, allPlaces);
      return `Adjusted your estimated budget to ~₹${Math.max(500, nextAmount).toLocaleString("en-IN")} and refreshed your plan.`;
    }

    default:
      return "I didn't understand that.";
  }
}
