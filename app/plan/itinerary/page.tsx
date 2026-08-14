import type { Metadata } from "next";
import type { GroupType, Pace, UserPreferences } from "@/types/user-preferences";
import type { PlaceCategory } from "@/types/place";
import { getPlaceProvider } from "@/lib/providers/provider-registry";
import { generateItinerary } from "@/lib/itinerary/generate-itinerary";
import { ItineraryPageClient } from "@/components/itinerary/ItineraryPageClient";

export const metadata: Metadata = {
  title: "Your Lucknow Trip — Yatra AI",
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

function readLockedPlaceIds(params: Record<string, string | string[] | undefined>): string[] {
  const raw = Array.isArray(params.locked) ? params.locked[0] : params.locked;
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function ItineraryPage({ searchParams }: ItineraryPageProps) {
  const params = await searchParams;
  const preferences = readPreferencesFromParams(params);
  const lockedPlaceIds = readLockedPlaceIds(params);
  const hasQueryParams = Object.keys(params).length > 0;

  const provider = getPlaceProvider(preferences.destinationId);
  const places = await provider.getAllPlaces(preferences.destinationId);
  const itinerary = generateItinerary(places, preferences, { lockedPlaceIds });

  return (
    <ItineraryPageClient serverItinerary={itinerary} places={places} hasQueryParams={hasQueryParams} />
  );
}
