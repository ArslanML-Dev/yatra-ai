import type { PlaceCategory } from "./place";

export type GroupType = "solo" | "couple" | "family" | "friends" | "business";
export type Pace = "relaxed" | "moderate" | "packed";
export type ParseConfidence = "high" | "medium" | "low";

export interface Budget {
  amount: number;
  currency: "INR";
}

export interface UserPreferences {
  destinationId: string;
  days: number;
  group: GroupType;
  interests: PlaceCategory[];
  pace: Pace;
  budget: Budget | null;
  rawText?: string;
  confidence: ParseConfidence;
  unresolvedFields: string[];
}
