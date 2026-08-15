"use client";

import { useState, type FormEvent } from "react";
import type { Place } from "@/types/place";
import { useTravelAgent } from "@/lib/agent/use-travel-agent";
import { EDIT_COMMAND_EXAMPLES } from "@/lib/nlu/parse-edit-command";
import { VoiceInputButton } from "@/components/planner/VoiceInputButton";

const RECENT_TURNS_SHOWN = 10;

/**
 * Page-scoped edit surface. Migrated from directly calling
 * parseEditCommand/executeEditIntent to the shared useTravelAgent hook,
 * which now runs the verified Phase 5 routeMessage/executeAgentIntent
 * pipeline and reads/writes the same global ConversationState the
 * TravelAgentPanel uses — a place mentioned here is resolvable there,
 * and vice versa.
 */
export function TripEditChat({ allPlaces }: { allPlaces: Place[] }) {
  const { turns, submit } = useTravelAgent(allPlaces);
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(text);
    setText("");
  }

  const recentTurns = turns.slice(-RECENT_TURNS_SHOWN);

  return (
    <div className="rounded-card border border-sandstone-200/70 bg-white p-6 shadow-soft">
      <h2 className="text-h4 font-display text-navy-900">Adapt my trip</h2>
      <p className="mt-1 text-body-sm text-ink-soft">
        Tell it what to change — e.g. &ldquo;{EDIT_COMMAND_EXAMPLES[0]}&rdquo; or &ldquo;
        {EDIT_COMMAND_EXAMPLES[3]}&rdquo;.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <label htmlFor="trip-edit-input" className="sr-only">
          Describe a change to your trip
        </label>
        <input
          id="trip-edit-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Remove shopping, keep Tunday Kababi..."
          className="flex-1 rounded-full border border-sandstone-200 px-4 py-2.5 text-sm outline-none focus-visible:border-saffron-500"
        />
        <button
          type="submit"
          className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-navy-800"
        >
          Apply
        </button>
      </form>
      <VoiceInputButton onTranscript={setText} />

      {recentTurns.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 text-sm">
          {recentTurns.map((turn, i) => (
            <li
              key={i}
              className={
                turn.role === "user"
                  ? "rounded-xl bg-sandstone-100 px-4 py-2.5 text-ink-soft/70"
                  : "rounded-xl bg-sandstone-100 px-4 py-2.5 text-navy-900"
              }
            >
              {turn.role === "user" ? `“${turn.text}”` : turn.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
