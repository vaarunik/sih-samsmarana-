"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  X,
  RotateCw,
  Clock,
  Trophy,
  Eye,
  Sparkles,
  EyeOff,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BackButton } from "./BackButton";
import { ListenButton, VoiceSpeedControl, SpeakAnswerButton } from "./VoiceControls";
import { useVoiceSpeed } from "@/lib/voice";
import { useApp } from "@/lib/store";
import { recordAttempt } from "@/lib/sync";
import { buildQuestions, sceneObjects } from "@/lib/questions";
import { SCENE_META, CATEGORY_META } from "@/lib/activities-data";
import type { ActivityTemplate } from "@/lib/activities-data";
import type { AttemptRecord, Question } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Activity state machine — enforces the cognitive memory flow:
 *
 *   intro → observe → remember → question → answering → feedback → complete
 *
 * CRITICAL: the scene image is visible ONLY during `observe`. It is fully
 * hidden (removed from the DOM) during `remember`, `question`, `answering`
 * and `feedback`, so the elder must rely on memory — not a still-visible
 * reference. Voice instructions accompany each phase.
 */
type Phase = "intro" | "observe" | "remember" | "question" | "answering" | "feedback" | "complete";

const PHASE_STEPS: { key: Phase; label: string }[] = [
  { key: "observe", label: "Observe" },
  { key: "remember", label: "Remember" },
  { key: "question", label: "Answer" },
  { key: "feedback", label: "Feedback" },
];

export function ActivityPlayer({
  activity,
  onExit,
}: {
  activity: ActivityTemplate;
  onExit: () => void;
}) {
  const profile = useApp((s) => s.profile);
  const [speed, setSpeed] = useVoiceSpeed();
  const [phase, setPhase] = useState<Phase>("intro");

  // ── Per-user 30-day stimulus rotation ──
  // Fetch a fresh stimulus (scene) for this user+activity from the API on mount.
  // The same stimulus is excluded for this user for 30 days. Falls back to the
  // activity's default scene if the API is unavailable (e.g. offline).
  const [stimulus, setStimulus] = useState<{
    scene: SceneKey;
    image: string;
    label: string;
    questions: Question[];
    loading: boolean;
  }>({
    scene: activity.scene,
    image: SCENE_META[activity.scene].image,
    label: SCENE_META[activity.scene].label,
    questions: buildQuestions(activity.scene, activity.category, activity.difficulty, {
      minQuestions: 3,
      maxQuestions: 5,
    }),
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stimulus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityType: activity.category,
            difficulty: activity.difficulty,
          }),
        });
        const data = await res.json();
        if (cancelled || !data.stimulusId) return;
        const scene = data.stimulusId as SceneKey;
        const meta = SCENE_META[scene];
        setStimulus({
          scene,
          image: meta.image,
          label: meta.label,
          questions: data.questions ?? [],
          loading: false,
        });
      } catch {
        if (!cancelled) setStimulus((s) => ({ ...s, loading: false }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activity]);

  // Use the rotated stimulus's questions (or fallback to locally-built ones).
  const questions = stimulus.questions;
  const scene = stimulus.scene;
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const startRef = useRef<number>(0);
  const qStartRef = useRef<number>(0);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [responseMs, setResponseMs] = useState(0);

  // cleanup any pending feedback timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  // observe phase: gentle dot timer (8s), no stressful countdown
  const [observeDots, setObserveDots] = useState(0);
  useEffect(() => {
    if (phase !== "observe") return;
    setObserveDots(0);
    const total = 8;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setObserveDots(i);
      if (i >= total) {
        clearInterval(t);
        setPhase("remember");
      }
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // remember phase: short 1.2s transition, then question
  useEffect(() => {
    if (phase !== "remember") return;
    const t = setTimeout(() => {
      setPhase("question");
      qStartRef.current = Date.now();
    }, 1200);
    return () => clearTimeout(t);
  }, [phase]);

  function pickAnswer(idx: number) {
    if (phase !== "question" && phase !== "answering") return;
    const next = [...answers];
    next[qi] = idx;
    setAnswers(next);
    setResponseMs((r) => r + (Date.now() - qStartRef.current));
    setPhase("answering");
    // brief pause to show selection, then feedback (cleaned up on unmount)
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setPhase("feedback"), 500);
  }

  function nextQuestion() {
    if (qi < questions.length - 1) {
      setQi(qi + 1);
      setPhase("question");
      qStartRef.current = Date.now();
    } else {
      finish();
    }
  }

  async function finish() {
    const correct = questions.reduce(
      (s, q, i) => s + (answers[i] === q.answerIndex ? 1 : 0),
      0
    );
    const accuracy = questions.length ? correct / questions.length : 0;
    const totalRt = Date.now() - startRef.current;
    const attempt: AttemptRecord = {
      id: crypto.randomUUID(),
      profileId: profile?.id ?? "anon",
      activityId: activity.id,
      category: activity.category,
      title: activity.title,
      difficulty: activity.difficulty,
      accuracy,
      responseMs: totalRt,
      completed: true,
      skipped: false,
      score: Math.round(accuracy * 100),
      syncState: "synced",
      syncId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      stimulusId: scene,
    };
    await recordAttempt(attempt);
    // Mark the stimulus as completed (for the 30-day rotation history).
    fetch("/api/stimulus", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityType: activity.category, stimulusId: scene }),
    }).catch(() => {});
    setPhase("complete");
  }

  const objects = useMemo(() => sceneObjects(scene), [scene]);
  const lang = (profile?.language ?? "en") as never;
  const currentQ = questions[qi];

  // Voice instructions per phase
  const introInstruction = `Activity: ${activity.title}. ${activity.description} Look carefully at the picture, then answer the questions.`;
  const observeInstruction = `Look carefully at this ${stimulus.label.toLowerCase()} scene. Try to remember the objects, colours and where things are. Take your time.`;
  const questionInstruction = currentQ?.prompt ?? "";

  // ── INTRO ──────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <Shell onExit={onExit} backLabel="Back to activities" speed={speed} setSpeed={setSpeed}>
        <Card className="overflow-hidden p-0">
          <div className="relative">
            { }
            <img
              src={stimulus.image}
              alt={stimulus.label}
              className="aspect-video w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <Badge className="bg-white/25 text-white backdrop-blur">{stimulus.label}</Badge>
              <h2 className="mt-2 font-serif text-3xl font-semibold drop-shadow">{activity.title}</h2>
              <p className="text-white/90 drop-shadow">{activity.description}</p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-base text-foreground">{introInstruction}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5">
                Difficulty {activity.difficulty}/5
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5">
                <Clock className="h-3.5 w-3.5" /> ~2 minutes
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                <Eye className="h-3.5 w-3.5" /> Visual memory activity
              </span>
            </div>
            <p className="mt-4 rounded-lg bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800">
              You&apos;ll see the scene, then it will be hidden. Answer from memory.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-14 min-w-[160px] gap-2.5 rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
                onClick={() => {
                  setPhase("observe");
                  startRef.current = Date.now();
                }}
              >
                Start activity
                <ArrowRight className="h-5 w-5" />
              </Button>
              <ListenButton text={introInstruction} lang={lang} speed={speed} />
            </div>
          </div>
        </Card>
      </Shell>
    );
  }

  // ── OBSERVE (image visible) ───────────────────────────
  if (phase === "observe") {
    return (
      <Shell onExit={onExit} backLabel="Back" speed={speed} setSpeed={setSpeed}>
        <PhaseIndicator current="observe" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">Look carefully</h2>
          {/* gentle dot timer — no stressful countdown */}
          <div className="flex items-center gap-1.5" aria-label="observation timer">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i < observeDots ? "bg-emerald-500" : "bg-emerald-200"
                }`}
              />
            ))}
          </div>
        </div>
        <Card className="overflow-hidden p-0">
          { }
          <img src={stimulus.image} alt={stimulus.label} className="aspect-video w-full object-cover" />
        </Card>
        <p className="mt-3 text-center text-sm text-muted-foreground">Take your time…</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <ListenButton text={observeInstruction} lang={lang} speed={speed} />
          <Button
            size="lg"
            className="h-14 min-w-[160px] gap-2.5 rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
            onClick={() => setPhase("remember")}
          >
            I&apos;ve seen it
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </Shell>
    );
  }

  // ── REMEMBER (image HIDDEN — transition) ──────────────
  if (phase === "remember") {
    return (
      <Shell onExit={onExit} backLabel="Back" speed={speed} setSpeed={setSpeed}>
        <PhaseIndicator current="remember" />
        <Card className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
          >
            <EyeOff className="h-8 w-8" />
          </motion.span>
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            Now, remember what you saw
          </h2>
          <p className="text-sm text-muted-foreground">The scene is hidden. Answer from memory.</p>
        </Card>
      </Shell>
    );
  }

  // ── QUESTION / ANSWERING (image HIDDEN) ───────────────
  if (phase === "question" || phase === "answering") {
    const answered = answers[qi];
    const reveal = phase === "answering" && answered != null;
    return (
      <Shell onExit={onExit} backLabel="Back" speed={speed} setSpeed={setSpeed}>
        <PhaseIndicator current="question" />
        <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
          <span className="text-base font-medium text-foreground">
            Question {qi + 1} of {questions.length}
          </span>
          <span className="capitalize">{activity.category.replace("_", " ")}</span>
        </div>
        <Progress value={((qi + 1) / questions.length) * 100} className="mb-4 h-2.5" />

        {/* NO scene image here — the elder must answer from memory */}
        <Card className="p-6">
          <h2 className="font-serif text-2xl font-semibold leading-snug text-foreground text-balance">
            {currentQ.prompt}
          </h2>
          <div className="mt-3">
            <ListenButton text={questionInstruction} lang={lang} speed={speed} />
          </div>
          <div className="mt-5 grid gap-3">
            {currentQ.options.map((opt, i) => {
              const isAnswer = i === currentQ.answerIndex;
              const isPicked = answered === i;
              return (
                <button
                  key={i}
                  disabled={reveal}
                  onClick={() => pickAnswer(i)}
                  className={`flex min-h-[56px] items-center justify-between rounded-2xl border-2 px-5 py-4 text-left text-lg font-medium transition-all ${
                    reveal && isAnswer
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : reveal && isPicked && !isAnswer
                        ? "border-amber-400 bg-amber-50 text-amber-800"
                        : "border-border bg-card hover:border-emerald-300 hover:bg-emerald-50/40"
                  }`}
                >
                  <span className="capitalize">{opt}</span>
                  {reveal && isAnswer && <Check className="h-6 w-6 text-emerald-600" />}
                  {reveal && isPicked && !isAnswer && <X className="h-6 w-6 text-amber-500" />}
                </button>
              );
            })}
          </div>

          {/* Voice input (graceful fallback handled inside the component) */}
          <div className="mt-5">
            <p className="mb-2 text-xs text-muted-foreground">
              Voice input isn&apos;t available on this device? You can select an answer above.
            </p>
            <SpeakAnswerButton lang={lang} onTranscript={() => { /* selection-based; voice is assistive */ }} />
          </div>
        </Card>
      </Shell>
    );
  }

  // ── FEEDBACK (image still HIDDEN) ─────────────────────
  if (phase === "feedback") {
    const correct = answers[qi] === currentQ.answerIndex;
    return (
      <Shell onExit={onExit} backLabel="Back" speed={speed} setSpeed={setSpeed}>
        <PhaseIndicator current="feedback" />
        <Card className="p-6 text-center">
          <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 16 }}
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              correct ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {correct ? <Sparkles className="h-8 w-8" /> : <Check className="h-8 w-8" />}
          </motion.span>
          <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">
            {correct ? "Well done!" : "That's okay. Let's try another one."}
          </h2>
          <p className="mt-2 rounded-xl bg-muted/60 p-4 text-base text-foreground">
            {currentQ.explanation}
          </p>
          <div className="mt-5 flex justify-center">
            <ListenButton
              text={`${correct ? "Well done!" : "That's okay."} ${currentQ.explanation}`}
              lang={lang}
              speed={speed}
            />
          </div>
          <Button
            size="lg"
            className="mt-5 h-14 min-w-[160px] gap-2.5 rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
            onClick={nextQuestion}
          >
            {qi < questions.length - 1 ? "Next question" : "See results"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Card>
      </Shell>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────
  const correct = questions.reduce(
    (s, q, i) => s + (answers[i] === q.answerIndex ? 1 : 0),
    0
  );
  const accuracy = questions.length ? correct / questions.length : 0;
  const headline =
    accuracy >= 0.8 ? "Well done!" : accuracy >= 0.5 ? "Nice effort." : "That's okay. Let's try another one.";
  const sub = `${correct} of ${questions.length} correct.`;
  const skillName = CATEGORY_META[activity.category]?.label ?? activity.category;
  return (
    <Shell onExit={onExit} backLabel="Back to activities" speed={speed} setSpeed={setSpeed}>
      <Card className="p-8 text-center">
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
        >
          <Trophy className="h-8 w-8" />
        </motion.span>
        <h2 className="mt-4 font-serif text-3xl font-semibold text-foreground">{headline}</h2>
        <p className="mt-1 text-muted-foreground">{sub}</p>
        <p className="mt-2 text-sm font-medium text-emerald-700">
          Cognitive skill practiced: {skillName}
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="Accuracy" value={`${Math.round(accuracy * 100)}%`} />
          <Stat label="Time" value={`${Math.round(responseMs / 1000)}s`} />
          <Stat label="Score" value={String(Math.round(accuracy * 100))} />
        </div>
        <div className="mt-4 flex justify-center">
          <ListenButton text={`${headline} ${sub}`} lang={lang} speed={speed} />
        </div>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            className="h-12 gap-1.5"
            onClick={() => {
              setAnswers([]);
              setQi(0);
              setResponseMs(0);
              setPhase("intro");
            }}
          >
            <RotateCw className="h-4 w-4" /> Try again
          </Button>
          <Button
            size="lg"
            className="h-12 gap-1.5 bg-primary text-primary-foreground"
            onClick={onExit}
          >
            <ArrowRight className="h-4 w-4" /> Try another activity
          </Button>
        </div>
      </Card>
    </Shell>
  );
}

function PhaseIndicator({ current }: { current: Phase }) {
  const order: Phase[] = ["observe", "remember", "question", "feedback"];
  const idx = order.indexOf(current);
  return (
    <div className="mb-4 flex items-center justify-center gap-2" aria-label="activity phase">
      {PHASE_STEPS.map((s, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : done
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {done && <Check className="h-3 w-3" />}
              {s.label}
            </div>
            {i < PHASE_STEPS.length - 1 && (
              <span className={`h-0.5 w-4 ${done ? "bg-emerald-300" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-serif text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Shell({
  children,
  onExit,
  backLabel,
  speed,
  setSpeed,
}: {
  children: React.ReactNode;
  onExit: () => void;
  backLabel: string;
  speed: any;
  setSpeed: any;
}) {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <BackButton label={backLabel} onClick={onExit} />
          <VoiceSpeedControl speed={speed} setSpeed={setSpeed} />
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </main>
  );
}
