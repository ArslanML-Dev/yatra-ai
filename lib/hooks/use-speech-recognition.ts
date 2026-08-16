"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionResultLike {
  transcript: string;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type SpeechRecognitionStatus =
  | "idle"
  | "listening"
  | "received"
  | "denied"
  | "unsupported"
  | "error";

/** Real Web Speech API error codes, mapped to honest copy — never a
 * generic silent failure. https://wicg.github.io/speech-api/#speechreco-error */
const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone access was denied. Allow it in your browser settings to use voice input.",
  "service-not-allowed": "Microphone access was denied. Allow it in your browser settings to use voice input.",
  "audio-capture": "No microphone was found on this device.",
  "no-speech": "Didn't catch that — try again.",
  network: "Voice recognition needs a network connection.",
  aborted: "Voice input was cancelled.",
};

export interface UseSpeechRecognitionResult {
  status: SpeechRecognitionStatus;
  transcript: string;
  errorMessage: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Single-utterance capture, feature-detected, only starts listening
 * (and only then triggers the browser's microphone permission prompt)
 * when start() is explicitly called from a user action. Every real
 * Web Speech API error is classified into `status` and a human message
 * — never silently swallowed into an unlabeled "not listening" state.
 */
/** If the browser's recognizer never fires onresult/onerror/onend at all
 * (confirmed via real testing: this happens, leaving the mic stuck on
 * "listening" indefinitely with no feedback), this is the longest a user
 * should ever be left waiting before we force an honest failure state. */
const LISTENING_TIMEOUT_MS = 8000;

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [status, setStatus] = useState<SpeechRecognitionStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearListeningTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // One-time client-only capability detection after mount — required to
    // avoid an SSR/hydration mismatch (the server has no `window` at all).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (getSpeechRecognitionConstructor() === null) setStatus("unsupported");
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      clearListeningTimeout();
      const result = event.results[0]?.[0];
      if (result) {
        setTranscript(result.transcript);
        setStatus("received");
      }
    };
    recognition.onerror = (event) => {
      clearListeningTimeout();
      const code = event.error;
      setErrorMessage(ERROR_MESSAGES[code] ?? "Couldn't hear that — try again.");
      setStatus(code === "not-allowed" || code === "service-not-allowed" ? "denied" : "error");
    };
    recognition.onend = () => {
      clearListeningTimeout();
      // onresult/onerror already moved status away from "listening" on
      // a real outcome; only downgrade to idle if the session ended
      // with neither (e.g. the browser gave up with no result at all).
      setStatus((prev) => (prev === "listening" ? "idle" : prev));
    };

    recognitionRef.current = recognition;
    setTranscript("");
    setErrorMessage(null);
    setStatus("listening");
    recognition.start();

    // Belt-and-braces: some browsers/environments never fire onresult,
    // onerror, or onend at all (confirmed via real testing — the mic
    // just stays "listening" forever with no recourse but the manual
    // stop button). Force an honest timeout instead of an silent hang.
    timeoutRef.current = setTimeout(() => {
      recognitionRef.current?.stop();
      setErrorMessage("Didn't catch that — try again.");
      setStatus("error");
    }, LISTENING_TIMEOUT_MS);
  }, [clearListeningTimeout]);

  const stop = useCallback(() => {
    clearListeningTimeout();
    recognitionRef.current?.stop();
  }, [clearListeningTimeout]);

  const reset = useCallback(() => {
    clearListeningTimeout();
    setTranscript("");
    setErrorMessage(null);
    setStatus("idle");
  }, [clearListeningTimeout]);

  return { status, transcript, errorMessage, start, stop, reset };
}
