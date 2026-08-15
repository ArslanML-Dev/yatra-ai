"use client";

import type { ReactNode } from "react";
import { TripProvider } from "@/lib/trip/trip-store";
import { ConversationProvider } from "@/lib/conversation/conversation-provider";
import { TravelAgentUIProvider, TravelAgentPanel } from "@/components/agent/TravelAgentPanel";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TripProvider>
      <ConversationProvider>
        <TravelAgentUIProvider>
          {children}
          <TravelAgentPanel />
        </TravelAgentUIProvider>
      </ConversationProvider>
    </TripProvider>
  );
}
