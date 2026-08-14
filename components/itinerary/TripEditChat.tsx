"use client";

import { useState } from "react";
import type { Place } from "@/types/place";
import { useTrip } from "@/lib/trip/use-trip";
import { parseEditCommand, EDIT_COMMAND_EXAMPLES } from "@/lib/nlu/parse-edit-command";
import { executeEditIntent } from "@/lib/nlu/execute-edit-intent";

interface LogEntry {
  input: string;
  message: string;
}

export function TripEditChat({ allPlaces }: { allPlaces: Place[] }) {
  const trip = useTrip();
  const [text, setText] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const intent = parseEditCommand(text, allPlaces);
    const message = executeEditIntent(intent, trip.trip, allPlaces, trip);
    setLog((prev) => [{ input: text, message }, ...prev].slice(0, 5));
    setText("");
  }

  return (
    <div className="rounded-2xl border border-sandstone-200/70 bg-white p-6">
      <h2 className="font-display text-lg text-navy-900">Adapt my trip</h2>
      <p className="mt-1 text-sm text-ink-soft">
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

      {log.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 text-sm">
          {log.map((entry, i) => (
            <li key={i} className="rounded-xl bg-sandstone-100 px-4 py-2.5">
              <p className="text-ink-soft/70">&ldquo;{entry.input}&rdquo;</p>
              <p className="mt-0.5 text-navy-900">{entry.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
