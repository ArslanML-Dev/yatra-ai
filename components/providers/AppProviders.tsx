"use client";

import type { ReactNode } from "react";
import { TripProvider } from "@/lib/trip/trip-store";

export function AppProviders({ children }: { children: ReactNode }) {
  return <TripProvider>{children}</TripProvider>;
}
