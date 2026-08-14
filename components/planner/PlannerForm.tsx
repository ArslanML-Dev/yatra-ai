"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Place } from "@/types/place";
import type { UserPreferences } from "@/types/user-preferences";
import { ruleBasedAIProvider } from "@/lib/providers/rule-based-ai-provider";
import { matchNamedPlaces } from "@/lib/nlu/named-place-matcher";
import { FreeTextInput } from "./FreeTextInput";
import { PreferencesSummary } from "./PreferencesSummary";
import { StructuredFallbackForm } from "./StructuredFallbackForm";
import { Button } from "@/components/ui/Button";

const DEFAULT_PREFERENCES: UserPreferences = {
  destinationId: "lucknow",
  days: 3,
  group: "family",
  interests: [],
  pace: "moderate",
  budget: null,
  confidence: "low",
  unresolvedFields: ["days", "group", "interests"],
};

function toQueryString(preferences: UserPreferences, lockedPlaceIds: string[]): string {
  const params = new URLSearchParams({
    days: String(preferences.days),
    group: preferences.group,
    interests: preferences.interests.join(","),
    pace: preferences.pace,
  });
  if (preferences.budget) params.set("budget", String(preferences.budget.amount));
  if (lockedPlaceIds.length > 0) params.set("locked", lockedPlaceIds.join(","));
  return params.toString();
}

export function PlannerForm({ places }: { places: Place[] }) {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [lockedPlaces, setLockedPlaces] = useState<Place[]>([]);

  function handleParse() {
    if (!rawText.trim()) return;
    setPreferences(ruleBasedAIProvider.parsePreferences(rawText));
    setLockedPlaces(matchNamedPlaces(rawText, places));
  }

  function handleGenerate() {
    const lockedPlaceIds = lockedPlaces.map((p) => p.id);
    router.push(`/plan/itinerary?${toQueryString(preferences, lockedPlaceIds)}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <FreeTextInput value={rawText} onChange={setRawText} onParse={handleParse} />
      <PreferencesSummary preferences={preferences} />
      {lockedPlaces.length > 0 && (
        <div className="rounded-2xl bg-leaf-600/10 p-4 text-sm text-navy-900">
          <p className="font-medium">🔒 We&rsquo;ll make sure these are in your trip:</p>
          <p className="mt-1 text-ink-soft">{lockedPlaces.map((p) => p.name).join(", ")}</p>
        </div>
      )}
      <StructuredFallbackForm preferences={preferences} onChange={setPreferences} />
      <Button onClick={handleGenerate} variant="primary" className="self-start">
        Generate my itinerary
      </Button>
    </div>
  );
}
