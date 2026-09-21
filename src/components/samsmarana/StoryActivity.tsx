"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, X, RotateCw, Trophy, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BackButton } from "./BackButton";
import { ListenButton, VoiceSpeedControl } from "./VoiceControls";
import { useVoiceSpeed } from "@/lib/voice";
import { useApp } from "@/lib/store";
import { recordAttempt } from "@/lib/sync";
import { storyById } from "@/lib/story-data";
import { activityById } from "@/lib/activities-data";
import type { AttemptRecord } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "scene" | "questions" | "result";

export function StoryActivity({
  activityId,
  onExit,
}: {
  activityId: string;
  onExit: () => void;
}) {
  const activity = activityById(activityId);
  const story = storyById("story-tea");
  const profile = useApp((s) => s.profile);
  const [speed, setSpeed] = useVoiceSpeed();
  const [phase, setPhase] = useState<Phase>("scene");
  const [sceneIdx, setSceneIdx] = useState(0);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const startRef = useRef(0);
  const qStartRef = useRef(0);
  const answerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [responseMs, setResponseMs] = useState(0);

  const lang = (profile?.language ?? "en") as any;

  // cleanup pending answer timer on unmount
  useEffect(() => {
    return () => {
      if (answerTimer.current) clearTimeout(answerTimer.current);
    };
  }, []);

  if (!story || !activity) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <BackButton label="Back to activities" onClick={onExit} />
          <Card className="mt-4 p-6 text-center text-muted-foreground">
            Story not found.
          </Card>
        </div>
      </main>
    );
  }

  const scene = story.scenes[sceneIdx];
  const questions = story.questions;
  const isLastScene = sceneIdx === story.scenes.length - 1;

  function nextScene() {
    if (isLastScene) {
      setPhase("questions");
      startRef.current = Date.now();
      qStartRef.current = Date.now();
    } else {
      setSceneIdx(sceneIdx + 1);
    }
  }

  function answer(idx: number) {
    const next = [...answers];
    next[qi] = idx;
    setAnswers(next);
    setResponseMs((r) => r + (Date.now() - qStartRef.current));
    if (answerTimer.current) clearTimeout(answerTimer.current);
    answerTimer.current = setTimeout(() => {
      if (qi < questions.length - 1) {
        setQi(qi + 1);
        qStartRef.current = Date.now();
      } else {
        finish(next);
      }
    }, 900);
  }

  async function finish(finalAnswers: (number | null)[]) {
    const correct = questions.reduce(
      (s, q, i) => s + (finalAnswers[i] === q.answerIndex ? 1 : 0),
      0
    );
    const accuracy = questions.length ? correct / questions.length : 0;
    const attempt: AttemptRecord = {
      id: crypto.randomUUID(),
      profileId: profile?.id ?? "anon",
      activityId,
      category: "story",
      title: story.title,
      difficulty: activity.difficulty,
      accuracy,
      responseMs: Date.now() - startRef.current,
      completed: true,
      skipped: false,
      score: Math.round(accuracy * 100),
      syncState: "synced",
      syncId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await recordAttempt(attempt);
    setPhase("result");
  }

  // ── Scene phase ───────────────────────────────────────
  if (phase === "scene") {
    const sceneSpeech = `Scene ${sceneIdx + 1}. ${scene.narration}`;
    return (
      <Shell onExit={onExit} backLabel="Back to activities" speed={speed} setSpeed={setSpeed}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-700" />
            <h2 className="font-serif text-xl font-semibold text-foreground">{story.title}</h2>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700">
            Scene {sceneIdx + 1} of {story.scenes.length}
          </Badge>
        </div>
        <Progress value={((sceneIdx + 1) / story.scenes.length) * 100} className="mb-4 h-2.5" />

        <motion.div
          key={sceneIdx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden p-0">
            { }
            <img src={scene.image} alt={scene.caption} className="aspect-video w-full object-cover" />
            <div className="p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{scene.caption}</p>
              <p className="mt-2 font-serif text-2xl leading-relaxed text-foreground">{scene.narration}</p>
            </div>
          </Card>
        </motion.div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            className="h-14 min-w-[140px] gap-2.5 rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
            onClick={nextScene}
          >
            {isLastScene ? "Answer questions" : "Next scene"}
            <ArrowRight className="h-5 w-5" />
          </Button>
          <ListenButton text={sceneSpeech} lang={lang} speed={speed} />
        </div>
      </Shell>
    );
  }

  // ── Questions phase ───────────────────────────────────
  if (phase === "questions") {
    const q = questions[qi];
    const answered = answers[qi];
    const reveal = answered != null;
    return (
      <Shell onExit={onExit} backLabel="Back" speed={speed} setSpeed={setSpeed}>
        <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
          <span className="text-base font-medium text-foreground">
            Question {qi + 1} of {questions.length}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" /> {story.title}
          </span>
        </div>
        <Progress value={((qi + 1) / questions.length) * 100} className="mb-4 h-2.5" />

        {/* Story scenes are HIDDEN during questions — the elder answers from memory */}
        <Card className="mb-4 bg-emerald-50/60 p-4 text-center text-sm text-emerald-800">
          <BookOpen className="mx-auto mb-1 h-5 w-5" />
          The story is hidden. Answer from what you remember.
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-2xl font-semibold leading-snug text-foreground text-balance">
            {q.prompt}
          </h2>
          <div className="mt-3">
            <ListenButton text={q.prompt} lang={lang} speed={speed} />
          </div>
          <div className="mt-5 grid gap-3">
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answerIndex;
              const isPicked = answered === i;
              return (
                <button
                  key={i}
                  disabled={reveal}
                  onClick={() => answer(i)}
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
          <AnimatePresence>
            {reveal && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl bg-muted/60 p-4 text-base text-foreground"
              >
                {q.explanation}
              </motion.p>
            )}
          </AnimatePresence>
        </Card>
      </Shell>
    );
  }

  // ── Result ────────────────────────────────────────────
  const correct = questions.reduce(
    (s, q, i) => s + (answers[i] === q.answerIndex ? 1 : 0),
    0
  );
  const accuracy = questions.length ? correct / questions.length : 0;
  const headline =
    accuracy >= 0.8 ? "Well done!" : accuracy >= 0.5 ? "Nice effort." : "That's okay. Let's try another one.";
  const sub = `${correct} of ${questions.length} correct.`;
  return (
    <Shell onExit={onExit} backLabel="Back to activities" speed={speed} setSpeed={setSpeed}>
      <Card className="p-8 text-center">
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
        >
          <Sparkles className="h-8 w-8" />
        </motion.span>
        <h2 className="mt-4 font-serif text-3xl font-semibold text-foreground">{headline}</h2>
        <p className="mt-1 text-muted-foreground">{sub}</p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="Accuracy" value={`${Math.round(accuracy * 100)}%`} />
          <Stat label="Time" value={`${Math.round(responseMs / 1000)}s`} />
          <Stat label="Score" value={String(Math.round(accuracy * 100))} />
        </div>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            className="h-12 gap-1.5"
            onClick={() => {
              setAnswers([]);
              setQi(0);
              setSceneIdx(0);
              setResponseMs(0);
              setPhase("scene");
            }}
          >
            <RotateCw className="h-4 w-4" /> Read again
          </Button>
          <Button size="lg" className="h-12 gap-1.5 bg-primary text-primary-foreground" onClick={onExit}>
            <Trophy className="h-4 w-4" /> Done
          </Button>
        </div>
      </Card>
    </Shell>
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
