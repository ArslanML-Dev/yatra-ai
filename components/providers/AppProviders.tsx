"use client";

import type { ReactNode } from "react";
import { TripProvider } from "@/lib/trip/trip-store";
import { ConversationProvider } from "@/lib/conversation/conversation-provider";
import { ProfileProvider } from "@/lib/profile/profile-store";
import { ProfileUIProvider, ProfilePanel } from "@/components/profile/ProfilePanel";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <TripProvider>
        <ConversationProvider>
          <ProfileUIProvider>
            {children}
            <ProfilePanel />
          </ProfileUIProvider>
        </ConversationProvider>
      </TripProvider>
    </ProfileProvider>
  );
}
