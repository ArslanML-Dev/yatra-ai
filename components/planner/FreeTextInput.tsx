"use client";

import { Button } from "@/components/ui/Button";
import { VoiceInputButton } from "./VoiceInputButton";

const EXAMPLE =
  "I'm visiting Lucknow for 4 days with my family. I want heritage, good local food and a relaxed pace.";

interface FreeTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
}

export function FreeTextInput({ value, onChange, onParse }: FreeTextInputProps) {
  return (
    <div className="rounded-2xl border border-sandstone-200/70 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label htmlFor="trip-description" className="font-display text-lg text-navy-900">
            Describe your trip
          </label>
          <p className="mt-1 text-sm text-ink-soft">
            Duration, who&rsquo;s coming, what you care about — write it like you&rsquo;d tell a friend.
          </p>
        </div>
        <VoiceInputButton onTranscript={onChange} />
      </div>
      <textarea
        id="trip-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={EXAMPLE}
        rows={4}
        className="mt-4 w-full rounded-xl border border-sandstone-200 bg-ivory px-4 py-3 text-sm text-ink outline-none focus-visible:border-saffron-500"
      />
      <div className="mt-4 flex items-center gap-3">
        <Button type="button" onClick={onParse} variant="dark">
          Understand my trip
        </Button>
        <button
          type="button"
          onClick={() => onChange(EXAMPLE)}
          className="text-sm text-saffron-600 hover:underline"
        >
          Try an example
        </button>
      </div>
    </div>
  );
}
