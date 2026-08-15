"use client";

import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { allLucknowPlaces } from "@/lib/data";
import { useTrip } from "@/lib/trip/use-trip";
import { useTravelAgent } from "@/lib/agent/use-travel-agent";
import { EDIT_COMMAND_EXAMPLES } from "@/lib/nlu/parse-edit-command";
import { VoiceInputButton } from "@/components/planner/VoiceInputButton";

const CREATION_QUICK_PROMPTS = [
  "Plan me 3 days focused on heritage and food",
  "Plan a relaxed 2-day family trip",
];
const EDIT_QUICK_PROMPTS = EDIT_COMMAND_EXAMPLES.slice(0, 3);

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
  const { trip, hydrated } = useTrip();
  const { turns, submit } = useTravelAgent(allLucknowPlaces);
  const [text, setText] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const quickPrompts = trip ? EDIT_QUICK_PROMPTS : CREATION_QUICK_PROMPTS;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns.length]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { navigated } = submit(text);
    setText("");
    if (navigated) closePanel();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-60 flex justify-end"
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close Travel Agent"
            onClick={closePanel}
            className="absolute inset-0 bg-navy-950/40"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Travel Agent"
            className="relative flex h-full w-full flex-col bg-ivory shadow-lift sm:w-105 sm:border-l sm:border-sandstone-200/70"
            initial={prefersReducedMotion ? undefined : { x: "100%" }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? undefined : { x: "100%" }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-sandstone-200/70 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-base"
                >
                  🧭
                </span>
                <div>
                  <h2 className="text-h4 font-display text-navy-900">Travel Agent</h2>
                  <p className="text-caption text-ink-soft/60">Deterministic, no guessing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close Travel Agent"
                className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-sandstone-100"
              >
                ✕
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
              {!hydrated ? null : turns.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-sandstone-300 px-6 py-12 text-center">
                  <span aria-hidden="true" className="text-3xl">
                    💬
                  </span>
                  <p className="text-body font-display text-navy-900">
                    {trip ? "Ask Yatra anything about your trip" : "Tell Yatra what kind of trip you want"}
                  </p>
                  <p className="max-w-xs text-body-sm text-ink-soft">
                    {trip
                      ? "Edits, navigation, and questions about your itinerary — try one below or type your own."
                      : "Give it your days, group, and interests — in one message or a few — and it'll build the plan."}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setText(prompt)}
                        className="rounded-full border border-sandstone-200 bg-white px-3.5 py-1.5 text-body-sm text-ink-soft transition-colors hover:border-saffron-400 hover:text-navy-900"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <ul className="flex flex-col gap-3 text-sm">
                  <AnimatePresence initial={false}>
                    {turns.map((turn, i) => (
                      <motion.li
                        key={i}
                        layout={!prefersReducedMotion}
                        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        className={
                          turn.role === "user"
                            ? "flex items-end justify-end gap-2 self-end"
                            : "flex items-end gap-2 self-start"
                        }
                      >
                        {turn.role === "agent" && (
                          <span
                            aria-hidden="true"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs text-ivory"
                          >
                            🧭
                          </span>
                        )}
                        <span
                          className={
                            turn.role === "user"
                              ? "max-w-[85%] rounded-2xl rounded-br-sm bg-navy-900 px-4 py-2.5 text-ivory shadow-soft"
                              : "max-w-[85%] rounded-2xl rounded-bl-sm bg-sandstone-100 px-4 py-2.5 text-navy-900"
                          }
                        >
                          {turn.text}
                        </span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            <div className="border-t border-sandstone-200/70 px-6 py-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <label htmlFor="travel-agent-input" className="sr-only">
                  Message the Travel Agent
                </label>
                <input
                  id="travel-agent-input"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={trip ? "Remove shopping, what's next..." : "Plan me 3 days focused on food..."}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
