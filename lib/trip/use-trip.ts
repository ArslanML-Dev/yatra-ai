"use client";

import { useContext } from "react";
import { TripContext, type TripContextValue } from "./trip-store";

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error("useTrip() must be used within <TripProvider>");
  }
  return ctx;
}
