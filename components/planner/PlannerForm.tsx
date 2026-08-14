"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserPreferences } from "@/types/user-preferences";
import { ruleBasedAIProvider } from "@/lib/providers/rule-based-ai-provider";
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

function toQueryString(preferences: UserPreferences): string {
  const params = new URLSearchParams({
    days: String(preferences.days),
    group: preferences.group,
    interests: preferences.interests.join(","),
    pace: preferences.pace,
  });
  if (preferences.budget) params.set("budget", String(preferences.budget.amount));
  return params.toString();
}

export function PlannerForm() {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  function handleParse() {
    if (!rawText.trim()) return;
    setPreferences(ruleBasedAIProvider.parsePreferences(rawText));
  }

  function handleGenerate() {
    router.push(`/plan/itinerary?${toQueryString(preferences)}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <FreeTextInput value={rawText} onChange={setRawText} onParse={handleParse} />
      <PreferencesSummary preferences={preferences} />
      <StructuredFallbackForm preferences={preferences} onChange={setPreferences} />
      <Button onClick={handleGenerate} variant="primary" className="self-start">
        Generate my itinerary
      </Button>
    </div>
  );
}
