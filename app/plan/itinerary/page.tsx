import Link from "next/link";
import type { Metadata } from "next";
import type { GroupType, Pace, UserPreferences } from "@/types/user-preferences";
import type { PlaceCategory } from "@/types/place";
import { getPlaceProvider } from "@/lib/providers/provider-registry";
import { generateItinerary } from "@/lib/itinerary/generate-itinerary";
import { ruleBasedAIProvider } from "@/lib/providers/rule-based-ai-provider";
import { ItineraryDayCard } from "@/components/itinerary/ItineraryDayCard";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Your Lucknow Itinerary — Yatra AI",
};

const VALID_GROUPS: GroupType[] = ["solo", "couple", "family", "friends", "business"];
const VALID_PACES: Pace[] = ["relaxed", "moderate", "packed"];
const VALID_INTERESTS: PlaceCategory[] = [
  "heritage",
  "food",
  "shopping",
  "parks",
  "riverfront_evening",
  "modern",
  "transport",
];

type ItineraryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readPreferencesFromParams(
  params: Record<string, string | string[] | undefined>,
): UserPreferences {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const daysRaw = Number(first(params.days));
  const days = Number.isFinite(daysRaw) ? Math.min(14, Math.max(1, Math.round(daysRaw))) : 3;

  const groupRaw = first(params.group);
  const group: GroupType = VALID_GROUPS.includes(groupRaw as GroupType)
    ? (groupRaw as GroupType)
    : "family";

  const paceRaw = first(params.pace);
  const pace: Pace = VALID_PACES.includes(paceRaw as Pace) ? (paceRaw as Pace) : "moderate";

  const interestsRaw = first(params.interests) ?? "";
  const interests = interestsRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is PlaceCategory => VALID_INTERESTS.includes(s as PlaceCategory));

  const budgetRaw = Number(first(params.budget));
  const budget = Number.isFinite(budgetRaw) && budgetRaw > 0 ? { amount: budgetRaw, currency: "INR" as const } : null;

  return {
    destinationId: "lucknow",
    days,
    group,
    interests,
    pace,
    budget,
    confidence: "high",
    unresolvedFields: [],
  };
}

export default async function ItineraryPage({ searchParams }: ItineraryPageProps) {
  const params = await searchParams;
  const preferences = readPreferencesFromParams(params);

  const provider = getPlaceProvider(preferences.destinationId);
  const places = await provider.getAllPlaces(preferences.destinationId);
  const itinerary = generateItinerary(places, preferences);
  const summary = ruleBasedAIProvider.explainItinerary?.(itinerary);
  const placesById = new Map(places.map((p) => [p.id, p]));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/plan" className="text-sm font-medium text-saffron-600 hover:underline">
        ← Adjust preferences
      </Link>
      <h1 className="mt-3 font-display text-4xl text-navy-900">Your Lucknow itinerary</h1>
      {summary && <p className="mt-4 text-ink-soft">{summary}</p>}
      <p className="mt-2 text-sm text-ink-soft/70">{itinerary.disclaimer}</p>

      <div className="mt-10 flex flex-col gap-6">
        {itinerary.days.map((day) => (
          <ItineraryDayCard key={day.dayNumber} day={day} placesById={placesById} />
        ))}
      </div>

      <div className="mt-10 flex gap-4">
        <Button href="/map" variant="outline">
          View on map
        </Button>
        <Button href="/plan" variant="ghost">
          Start over
        </Button>
      </div>
    </div>
  );
}
