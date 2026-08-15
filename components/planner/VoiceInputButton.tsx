"use client";

import { useRef } from "react";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
}

export function VoiceInputButton({ onTranscript }: VoiceInputButtonProps) {
  const { status, transcript, errorMessage, start, stop, reset } = useSpeechRecognition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (status === "unsupported") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft/50">
        <span aria-hidden="true" className="text-base opacity-40">
          🎙️
        </span>
        Voice input isn&rsquo;t supported in this browser.
      </span>
    );
  }

  function handleUseThis() {
    onTranscript(textareaRef.current?.value ?? transcript);
    reset();
  }

  if (status === "received") {
    return (
      <div className="mt-3 rounded-xl bg-sandstone-100 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/70">I heard:</p>
        {/* Uncontrolled + keyed on transcript so each new capture seeds a
            fresh editable draft without needing an effect to sync state. */}
        <textarea
          key={transcript}
          ref={textareaRef}
          defaultValue={transcript}
          rows={2}
          className="mt-2 w-full rounded-lg border border-sandstone-200 bg-white px-3 py-2 text-sm outline-none focus-visible:border-saffron-500"
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handleUseThis}
            className="rounded-full bg-navy-900 px-4 py-1.5 text-xs font-medium text-ivory transition-colors hover:bg-navy-800"
          >
            Use this
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-navy-900/20 px-4 py-1.5 text-xs font-medium text-navy-900 transition-colors hover:bg-sandstone-100"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (status === "denied" || status === "error") {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
        <span aria-hidden="true">⚠️</span>
        <span>{errorMessage ?? "Voice input failed — try again."}</span>
        <button
          type="button"
          onClick={reset}
          className="font-medium text-saffron-600 underline underline-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  const listening = status === "listening";

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-label={listening ? "Stop listening" : "Speak your trip request"}
      aria-pressed={listening}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg transition-colors ${
        listening ? "animate-pulse bg-saffron-600 text-ivory" : "bg-sandstone-100 text-ink-soft hover:bg-sandstone-200"
      }`}
    >
      {listening ? "⏹️" : "🎙️"}
    </button>
  );
}
