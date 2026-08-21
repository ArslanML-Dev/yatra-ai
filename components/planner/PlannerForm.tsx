"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Place } from "@/types/place";
import type { UserPreferences } from "@/types/user-preferences";
import { ruleBasedAIProvider } from "@/lib/providers/rule-based-ai-provider";
import { matchNamedPlaces } from "@/lib/nlu/named-place-matcher";
import { useProfile } from "@/lib/profile/use-profile";
import { buildItineraryQueryString } from "@/lib/trip/itinerary-query";
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

export function PlannerForm({ places }: { places: Place[] }) {
  const router = useRouter();
  const { profile, hydrated: profileHydrated } = useProfile();
  const [rawText, setRawText] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [lockedPlaces, setLockedPlaces] = useState<Place[]>([]);
  const [appliedProfileDefaults, setAppliedProfileDefaults] = useState(false);
  const [interestsError, setInterestsError] = useState<string | undefined>(undefined);

  // Pre-fills known preferences from a saved local profile, once, the
  // first render after the profile store finishes hydrating — never
  // overwrites the trip itself (no Trip exists yet at this point) and
  // never re-applies after that, so it can't clobber an in-progress
  // edit. Adjusted during render (React's sanctioned pattern for
  // reacting to a dependency becoming ready) rather than in an effect.
  if (profileHydrated && !appliedProfileDefaults) {
    setAppliedProfileDefaults(true);
    if (profile) {
      const p = profile.preferences;
      setPreferences((prev) => ({
        ...prev,
        ...(p.group ? { group: p.group } : {}),
        ...(p.pace ? { pace: p.pace } : {}),
        ...(p.interests && p.interests.length > 0 ? { interests: p.interests } : {}),
        ...(p.walkingTolerance ? { walkingTolerance: p.walkingTolerance } : {}),
        ...(p.foodPreferences ? { foodPreferences: p.foodPreferences } : {}),
      }));
    }
  }

  function handleParse() {
    if (!rawText.trim()) return;
    const parsed = ruleBasedAIProvider.parsePreferences(rawText);
    if (parsed.interests.length > 0) setInterestsError(undefined);
    setPreferences(parsed);
    setLockedPlaces(matchNamedPlaces(rawText, places));
  }

  function handleGenerate() {
    if (preferences.interests.length === 0) {
      setInterestsError("Please select at least one interest so we know what to plan around.");
      return;
    }
    setInterestsError(undefined);
    const lockedPlaceIds = lockedPlaces.map((p) => p.id);
    router.push(`/plan/itinerary?${buildItineraryQueryString(preferences, lockedPlaceIds)}`);
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
      <StructuredFallbackForm
        preferences={preferences}
        onChange={(next) => {
          if (next.interests.length > 0) setInterestsError(undefined);
          setPreferences(next);
        }}
        interestsError={interestsError}
      />
      <Button onClick={handleGenerate} variant="primary" className="self-start">
        Generate my itinerary
      </Button>
    </div>
  );
}
