"use client";

import type { ReactNode } from "react";
import { TripProvider } from "@/lib/trip/trip-store";
import { ConversationProvider } from "@/lib/conversation/conversation-provider";
import { TravelAgentUIProvider, TravelAgentPanel } from "@/components/agent/TravelAgentPanel";
import { ProfileProvider } from "@/lib/profile/profile-store";
import { ProfileUIProvider, ProfilePanel } from "@/components/profile/ProfilePanel";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <TripProvider>
        <ConversationProvider>
          <TravelAgentUIProvider>
            <ProfileUIProvider>
              {children}
              <TravelAgentPanel />
              <ProfilePanel />
            </ProfileUIProvider>
          </TravelAgentUIProvider>
        </ConversationProvider>
      </TripProvider>
    </ProfileProvider>
  );
}
