"use client";

import { createContext, useContext, useState, type FormEvent, type ReactNode } from "react";
import { allLucknowPlaces } from "@/lib/data";
import { useTrip } from "@/lib/trip/use-trip";
import { useTravelAgent } from "@/lib/agent/use-travel-agent";
import { EDIT_COMMAND_EXAMPLES } from "@/lib/nlu/parse-edit-command";
import { VoiceInputButton } from "@/components/planner/VoiceInputButton";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Open/close visibility only — deliberately not part of ConversationState
 * (which is dialogue history + reference pointers + pre-trip
 * accumulation, nothing else) or TripState. A separate, minimal context
 * because NavBar (the trigger) and this panel are siblings under
 * AppProviders with no other shared parent to lift boolean state into
 * without restructuring the root layout.
 */
interface TravelAgentUIContextValue {
  open: boolean;
  togglePanel: () => void;
  closePanel: () => void;
}

const TravelAgentUIContext = createContext<TravelAgentUIContextValue | null>(null);

export function TravelAgentUIProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value: TravelAgentUIContextValue = {
    open,
    togglePanel: () => setOpen((v) => !v),
    closePanel: () => setOpen(false),
  };
  return <TravelAgentUIContext.Provider value={value}>{children}</TravelAgentUIContext.Provider>;
}

export function useTravelAgentUI(): TravelAgentUIContextValue {
  const ctx = useContext(TravelAgentUIContext);
  if (!ctx) {
    throw new Error("useTravelAgentUI() must be used within <TravelAgentUIProvider>");
  }
  return ctx;
}

/**
 * Global Travel Agent overlay — mounted once via AppProviders, reachable
 * from any route via the NavBar trigger. Renders nothing when closed, so
 * it has zero effect on the page underneath. Uses allLucknowPlaces
 * directly (static bundled data, not a network fetch) rather than
 * requiring every page to thread a places prop down through the root
 * layout.
 */
export function TravelAgentPanel() {
  const { open, closePanel } = useTravelAgentUI();
  const { hydrated } = useTrip();
  const { turns, submit } = useTravelAgent(allLucknowPlaces);
  const [text, setText] = useState("");

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(text);
    setText("");
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Close Travel Agent"
        onClick={closePanel}
        className="absolute inset-0 bg-navy-950/40"
      />
      <div className="relative flex h-full w-full flex-col bg-ivory p-6 shadow-xl sm:w-[420px] sm:border-l sm:border-sandstone-200/70">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-navy-900">Travel Agent</h2>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close Travel Agent"
            className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-sandstone-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {!hydrated ? null : turns.length === 0 ? (
            <EmptyState
              title="Ask Yatra anything about your trip"
              description={`Try things like "${EDIT_COMMAND_EXAMPLES[0]}" or "${EDIT_COMMAND_EXAMPLES[3]}".`}
            />
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {turns.map((turn, i) => (
                <li
                  key={i}
                  className={
                    turn.role === "user"
                      ? "self-end rounded-2xl bg-navy-900 px-4 py-2.5 text-ivory"
                      : "self-start rounded-2xl bg-sandstone-100 px-4 py-2.5 text-navy-900"
                  }
                >
                  {turn.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <label htmlFor="travel-agent-input" className="sr-only">
            Message the Travel Agent
          </label>
          <input
            id="travel-agent-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Remove shopping, what's next..."
            className="flex-1 rounded-full border border-sandstone-200 px-4 py-2.5 text-sm outline-none focus-visible:border-saffron-500"
          />
          <button
            type="submit"
            className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-navy-800"
          >
            Send
          </button>
        </form>
        <div className="mt-2">
          <VoiceInputButton onTranscript={setText} />
        </div>
      </div>
    </div>
  );
}
