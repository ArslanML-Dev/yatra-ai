"use client";

import { useContext } from "react";
import { ConversationContext, type ConversationContextValue } from "./conversation-provider";

export function useConversation(): ConversationContextValue {
  const ctx = useContext(ConversationContext);
  if (!ctx) {
    throw new Error("useConversation() must be used within <ConversationProvider>");
  }
  return ctx;
}
