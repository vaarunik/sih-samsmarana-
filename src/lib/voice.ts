"use client";

// SAMSMARANA — voice layer (Web Speech API)
// Voice OUTPUT (TTS) for activity instructions, and voice INPUT (STT)
// for spoken answers. Uses the browser's SpeechSynthesis /
// SpeechRecognition with a graceful, key-safe fallback when a language
// or engine is unavailable. Voice speed preference (Slow default).

import { useCallback, useEffect, useRef, useState } from "react";
import { speechLocaleFor, languageDef, type LanguageCode } from "./i18n";

export type VoiceSpeed = "slow" | "normal";

const SPEED_RATE: Record<VoiceSpeed, number> = {
  slow: 0.8,
  normal: 1,
};

/** Speak text aloud in the user's language, at the chosen speed. */
export function useSpeak(lang: LanguageCode, speed: VoiceSpeed) {
  const [speaking, setSpeaking] = useState(false);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const def = languageDef(lang);
        u.lang = def.speechLocale;
        u.rate = SPEED_RATE[speed];
        u.pitch = 1;
        // Try to pick a matching voice; fall back to any en-IN voice,
        // then any voice. Never throw if none match.
        const voices = window.speechSynthesis.getVoices();
        const exact = voices.find((v) => v.lang?.toLowerCase() === def.speechLocale.toLowerCase());
        const fallback = exact ?? voices.find((v) => v.lang?.toLowerCase().startsWith("en"));
        if (exact || fallback) u.voice = (exact ?? fallback)!;
        u.onstart = () => setSpeaking(true);
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(u);
      } catch {
        setSpeaking(false);
      }
    },
    [lang, speed, supported]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    setSpeaking(false);
  }, [supported]);

  // Load voices (some browsers populate asynchronously).
  useEffect(() => {
    if (!supported) return;
    const handler = () => {};
    try {
      window.speechSynthesis.onvoiceschanged = handler;
      window.speechSynthesis.getVoices();
    } catch {}
    return () => {
      try {
        window.speechSynthesis.onvoiceschanged = null;
      } catch {}
    };
  }, [supported]);

  return { speak, stop, speaking, supported };
}

/** Listen for a spoken answer (SpeechRecognition). */
export function useListen(lang: LanguageCode) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [supported, setSupported] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    // defer to avoid synchronous setState-in-effect cascading render
    const id = setTimeout(() => setSupported(!!SR), 0);
    return () => clearTimeout(id);
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;
    try {
      const rec = new SR();
      rec.lang = speechLocaleFor(lang);
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      rec.continuous = false;
      rec.onstart = () => {
        setListening(true);
        setTranscript("");
      };
      rec.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript ?? "";
        setTranscript(text);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
    } catch {
      setListening(false);
    }
  }, [lang]);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {}
    setListening(false);
  }, []);

  const reset = useCallback(() => setTranscript(""), []);

  return { start, stop, reset, listening, transcript, supported };
}

/** Persist voice-speed preference in localStorage. */
export function useVoiceSpeed(): [VoiceSpeed, (s: VoiceSpeed) => void] {
  const [speed, setSpeed] = useState<VoiceSpeed>(() => {
    if (typeof window === "undefined") return "slow";
    try {
      const v = localStorage.getItem("sm_voice_speed");
      if (v === "normal" || v === "slow") return v;
    } catch {}
    return "slow";
  });
  const set = useCallback((s: VoiceSpeed) => {
    setSpeed(s);
    try {
      localStorage.setItem("sm_voice_speed", s);
    } catch {}
  }, []);
  return [speed, set];
}
