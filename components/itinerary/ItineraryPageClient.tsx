"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { Itinerary } from "@/types/itinerary";
import type { Place } from "@/types/place";
import { useTrip } from "@/lib/trip/use-trip";
import { wrapItineraryAsTrip } from "@/lib/trip/wrap-itinerary";
import { ruleBasedAIProvider } from "@/lib/providers/rule-based-ai-provider";
import { EditableItineraryDayCard } from "./EditableItineraryDayCard";
import { TripEditChat } from "./TripEditChat";
import { BudgetSummary } from "./BudgetSummary";
import { ShareTripButton } from "./ShareTripButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ItineraryPageClientProps {
  serverItinerary: Itinerary;
  places: Place[];
  hasQueryParams: boolean;
}

export function ItineraryPageClient({
  serverItinerary,
  places,
  hasQueryParams,
}: ItineraryPageClientProps) {
  const { trip, hydrated, startTrip, clearTrip } = useTrip();
  const initializedRef = useRef(false);

  const placesById = useMemo(() => new Map(places.map((p) => [p.id, p])), [places]);

  useEffect(() => {
    if (!hydrated || initializedRef.current) return;
    initializedRef.current = true;
    if (hasQueryParams || !trip) {
      startTrip(wrapItineraryAsTrip(serverItinerary));
    }
  }, [hydrated, hasQueryParams, trip, serverItinerary, startTrip]);

  const itinerary = trip?.itinerary ?? serverItinerary;
  const summary = ruleBasedAIProvider.explainItinerary?.(itinerary);

  const allSlots = itinerary.days.flatMap((d) => d.slots);
  const destinationCount = new Set(allSlots.map((s) => s.placeId)).size;
  const mustVisitCount = allSlots.filter((s) => s.locked).length;

  function handleStartOver() {
    clearTrip();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/plan" className="text-sm font-medium text-saffron-600 hover:underline">
        ← Adjust preferences
      </Link>
      <h1 className="mt-3 font-display text-4xl text-navy-900">Your Lucknow trip</h1>
      {summary && <p className="mt-4 text-ink-soft">{summary}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="navy">
          {itinerary.days.length} day{itinerary.days.length > 1 ? "s" : ""}
        </Badge>
        <Badge tone="sandstone">{destinationCount} destinations</Badge>
        {mustVisitCount > 0 && <Badge tone="leaf">🔒 {mustVisitCount} must-visit</Badge>}
        <Badge tone="sandstone" className="capitalize">
          {itinerary.preferences.pace} pace
        </Badge>
      </div>
      <p className="mt-2 text-sm text-ink-soft/70">{itinerary.disclaimer}</p>

      <div className="mt-8">
        <TripEditChat allPlaces={places} />
      </div>

      <div className="mt-8">
        <BudgetSummary
          days={itinerary.days.length}
          group={itinerary.preferences.group}
          budgetAmount={itinerary.preferences.budget?.amount ?? null}
        />
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {itinerary.days.map((day) => (
          <EditableItineraryDayCard
            key={day.dayNumber}
            day={day}
            placesById={placesById}
            allPlaces={places}
            totalDays={itinerary.days.length}
          />
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4">
          <Button href="/map" variant="outline">
            View on map
          </Button>
          <Button href="/plan" variant="ghost" onClick={handleStartOver}>
            Start over
          </Button>
        </div>
        <ShareTripButton itinerary={itinerary} placesById={placesById} />
      </div>
    </div>
  );
}
