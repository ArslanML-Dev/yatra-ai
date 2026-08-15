"use client";

import { createContext, useEffect, useReducer, type ReactNode } from "react";
import type { Profile, ProfilePreferences } from "@/types/profile";
import { clearStoredProfile, loadProfile, saveProfile as persistProfile } from "./persist";

interface StoreState {
  profile: Profile | null;
  hydrated: boolean;
}

type StoreAction =
  | { type: "HYDRATE"; profile: Profile | null }
  | { type: "SAVE"; name: string | undefined; preferences: ProfilePreferences }
  | { type: "CLEAR" };

const initialState: StoreState = { profile: null, hydrated: false };

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "HYDRATE":
      return { profile: action.profile, hydrated: true };
    case "SAVE":
      return {
        ...state,
        profile: {
          name: action.name,
          preferences: action.preferences,
          updatedAt: new Date().toISOString(),
        },
      };
    case "CLEAR":
      return { ...state, profile: null };
    default:
      return state;
  }
}

export interface ProfileContextValue {
  profile: Profile | null;
  hydrated: boolean;
  saveProfile: (name: string | undefined, preferences: ProfilePreferences) => void;
  clearProfile: () => void;
}

export const ProfileContext = createContext<ProfileContextValue | null>(null);

/**
 * Local-only profile store — hydrate-then-persist pattern mirrors
 * lib/trip/trip-store.tsx exactly. Never reads or writes Trip; the one
 * place a saved profile has any effect on trip creation is
 * PlannerForm.tsx, which reads `profile.preferences` once to pre-fill
 * its own defaults — a one-way feed, not a second source of truth.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  useEffect(() => {
    dispatch({ type: "HYDRATE", profile: loadProfile() });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    if (state.profile) persistProfile(state.profile);
    else clearStoredProfile();
  }, [state.profile, state.hydrated]);

  const value: ProfileContextValue = {
    profile: state.profile,
    hydrated: state.hydrated,
    saveProfile: (name, preferences) => dispatch({ type: "SAVE", name, preferences }),
    clearProfile: () => dispatch({ type: "CLEAR" }),
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
