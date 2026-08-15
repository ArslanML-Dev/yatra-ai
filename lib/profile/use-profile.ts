"use client";

import { useContext } from "react";
import { ProfileContext, type ProfileContextValue } from "./profile-store";

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile() must be used within <ProfileProvider>");
  }
  return ctx;
}
