import type { FoodPreferences, GroupType, Pace, WalkingTolerance } from "./user-preferences";
import type { PlaceCategory } from "./place";

/**
 * The lightweight local-only profile — name + long-lived travel
 * preferences, never trip-specific fields like days/budget. Explicitly
 * not a real account: no server, no auth, localStorage only.
 */
export interface ProfilePreferences {
  group?: GroupType;
  pace?: Pace;
  interests?: PlaceCategory[];
  walkingTolerance?: WalkingTolerance;
  foodPreferences?: FoodPreferences;
}

export interface Profile {
  name?: string;
  preferences: ProfilePreferences;
  updatedAt: string;
}
