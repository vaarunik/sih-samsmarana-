"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  X,
  RotateCw,
  Trophy,
  BookOpen,
  Sparkles,
  EyeOff,
  Pause,
  Play,
  Footprints,
  Eye,
  Hand,
  Scale,
  Coins,
  ShoppingBag,
  Droplet,
  Flame,
  Leaf,
  CupSoda,
  Heart,
  Sunrise,
  Lamp,
  Image as ImageIcon,
  Apple,
  Newspaper,
  Flower2,
  Bird,
  TreePine,
  Home,
  Users,
  Store,
  Utensils,
  Scissors,
  DoorOpen,
  Sofa,
  Moon,
  MessageCircle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BackButton } from "./BackButton";
import { ListenButton, VoiceSpeedControl } from "./VoiceControls";
import { useVoiceSpeed } from "@/lib/voice";
import { useApp } from "@/lib/store";
import { recordAttempt } from "@/lib/sync";
import type { StoryGame } from "@/lib/story-games-data";
import type { AttemptRecord } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const ACCENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  Footprints, Eye, Hand, Scale, Coins, ShoppingBag, Droplet, Flame, Leaf,
  CupSoda, Heart, Sunrise, Lamp, Image: ImageIcon, Apple, Newspaper, Flower2,
  Bird, TreePine, Home, Users, Store, Utensils, Scissors, DoorOpen, Sofa,
  Moon, MessageCircle, Package, Plate: Utensils, Armchair: Sofa,
};

type Phase = "scene" | "transition" | "questions" | "feedback" | "complete";

export function StoryGamePlayer({
  story,
  onExit,
}: {
  story: StoryGame;
  onExit: () => void;
}) {
  const profile = useApp((s) => s.profile);
  const [speed, setSpeed] = useVoiceSpeed();
  const [phase, setPhase] = useState<Phase>("scene");
  const [sceneIdx, setSceneIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const startRef = useRef(0);
  const qStartRef = useRef(0);
  const [responseMs, setResponseMs] = useState(0);

  const lang = (profile?.language ?? "en") as never;
  const total = story.scenes.length;
  const scene = story.scenes[sceneIdx];
  const Accent = scene?.accent ? ACCENTS[scene.accent.icon] ?? Sparkles : null;

  // Auto-advance scenes unless paused (give elders enough time: 6s per scene)
  useEffect(() => {
    if (phase !== "scene" || paused) return;
    if (sceneIdx >= total - 1) return; // last scene: wait for manual continue
    const t = setTimeout(() => {
      setPhase("transition");
      setTimeout(() => {
        setSceneIdx((i) => i + 1);
        setPhase("scene");
      }, 700);
    }, 6000);
    return () => clearTimeout(t);
  }, [phase, sceneIdx, paused, total]);

  function continueStory() {
    if (sceneIdx >= total - 1) {
      // story ends → go to questions (visuals hidden)
      setPhase("questions");
      startRef.current = Date.now();
      qStartRef.current = Date.now();
    } else {
      setPhase("transition");
      setTimeout(() => {
        setSceneIdx((i) => i + 1);
        setPhase("scene");
      }, 700);
    }
  }

  function pickAnswer(idx: number) {
    const next = [...answers];
    next[qi] = idx;
    setAnswers(next);
    setResponseMs((r) => r + (Date.now() - qStartRef.current));
    setPhase("feedback");
  }

  function nextQuestion() {
    if (qi < story.questions.length - 1) {
      setQi(qi + 1);
      setPhase("questions");
      qStartRef.current = Date.now();
    } else {
      finish();
    }
  }

  async function finish() {
    const correct = story.questions.reduce(
      (s, q, i) => s + (answers[i] === q.answerIndex ? 1 : 0),
      0
    );
    const accuracy = story.questions.length ? correct / story.questions.length : 0;
    const attempt: AttemptRecord = {
      id: crypto.randomUUID(),
      profileId: profile?.id ?? "anon",
      activityId: story.id,
      category: "story",
      title: story.title,
      difficulty: story.difficulty === "Easy" ? 1 : story.difficulty === "Moderate" ? 2 : 3,
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
    setPhase("complete");
  }

  // ── SCENE phase (visuals visible, with motion) ─────────
  if (phase === "scene" || phase === "transition") {
    const sceneSpeech = `Scene ${sceneIdx + 1}. ${scene.narration}`;
    return (
      <Shell onExit={onExit} backLabel="Back to Story Games" speed={speed} setSpeed={setSpeed}>
        {/* Story header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-700" />
            <h2 className="font-serif text-xl font-semibold text-foreground">{story.title}</h2>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700">
            Scene {sceneIdx + 1} of {total}
          </Badge>
        </div>

        {/* Scene progress dots */}
        <div className="mb-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-all ${
                i === sceneIdx ? "w-6 bg-emerald-600" : i < sceneIdx ? "bg-emerald-400" : "bg-emerald-200"
              }`}
            />
          ))}
        </div>

        {/* Scene visual with Ken Burns motion */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sceneIdx}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="overflow-hidden p-0">
              <div className="relative overflow-hidden">
                <motion.div
                  className="aspect-video w-full"
                  initial={kenBurnsInitial(scene.motion)}
                  animate={kenBurnsAnimate(scene.motion)}
                  transition={{ duration: 8, ease: "easeInOut" }}
                >
                  { }
                  <img src={scene.image} alt={scene.alt} className="h-full w-full object-cover" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Floating accent badge */}
                {Accent && scene.accent && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-sm font-medium text-emerald-800 backdrop-blur shadow-soft"
                  >
                    <Accent className="h-4 w-4" />
                    {scene.accent.label}
                  </motion.div>
                )}

                {/* Caption + narration */}
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-wider text-white/80">{scene.caption}</p>
                  <p className="mt-1 font-serif text-xl leading-snug drop-shadow">{scene.narration}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <ListenButton text={sceneSpeech} lang={lang} speed={speed} />
          <Button
            size="lg"
            variant="outline"
            className="h-14 min-w-[120px] gap-2.5 rounded-2xl text-base font-semibold"
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            {paused ? "Play" : "Pause"}
          </Button>
          <Button
            size="lg"
            className="h-14 min-w-[160px] gap-2.5 rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
            onClick={continueStory}
          >
            {sceneIdx >= total - 1 ? "Answer questions" : "Continue"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        {paused && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Paused — take your time. Press Play to continue.
          </p>
        )}
      </Shell>
    );
  }

  // ── QUESTIONS phase (visuals HIDDEN) ───────────────────
  if (phase === "questions" || phase === "feedback") {
    const q = story.questions[qi];
    const answered = answers[qi];
    const reveal = phase === "feedback" && answered != null;
    return (
      <Shell onExit={onExit} backLabel="Back" speed={speed} setSpeed={setSpeed}>
        <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
          <span className="text-base font-medium text-foreground">
            Question {qi + 1} of {story.questions.length}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" /> {story.title}
          </span>
        </div>
        <Progress value={((qi + 1) / story.questions.length) * 100} className="mb-4 h-2.5" />

        {/* Story visuals are HIDDEN — answer from memory */}
        <Card className="mb-4 bg-emerald-50/60 p-4 text-center text-sm text-emerald-800">
          <EyeOff className="mx-auto mb-1 h-5 w-5" />
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

        {reveal && (
          <div className="mt-4 flex justify-center">
            <Button
              size="lg"
              className="h-14 min-w-[160px] gap-2.5 rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
              onClick={nextQuestion}
            >
              {qi < story.questions.length - 1 ? "Next question" : "See results"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </Shell>
    );
  }

  // ── COMPLETE ───────────────────────────────────────────
  const correct = story.questions.reduce(
    (s, q, i) => s + (answers[i] === q.answerIndex ? 1 : 0),
    0
  );
  const accuracy = story.questions.length ? correct / story.questions.length : 0;
  const headline =
    accuracy >= 0.8 ? "Well done!" : accuracy >= 0.5 ? "Nice effort." : "That's okay. Let's try another one.";
  const sub = `${correct} of ${story.questions.length} correct.`;
  return (
    <Shell onExit={onExit} backLabel="Back to Story Games" speed={speed} setSpeed={setSpeed}>
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
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="Accuracy" value={`${Math.round(accuracy * 100)}%`} />
          <Stat label="Scenes" value={String(total)} />
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
            <RotateCw className="h-4 w-4" /> Watch again
          </Button>
          <Button size="lg" className="h-12 gap-1.5 bg-primary text-primary-foreground" onClick={onExit}>
            <Trophy className="h-4 w-4" /> Done
          </Button>
        </div>
      </Card>
    </Shell>
  );
}

// ── Ken Burns motion helpers ──────────────────────────────
function kenBurnsInitial(motion: string) {
  switch (motion) {
    case "zoom-in": return { scale: 1.0, x: 0, y: 0 };
    case "zoom-out": return { scale: 1.18, x: 0, y: 0 };
    case "pan-left": return { scale: 1.12, x: "3%", y: 0 };
    case "pan-right": return { scale: 1.12, x: "-3%", y: 0 };
    case "pan-up": return { scale: 1.12, x: 0, y: "3%" };
    case "pan-down": return { scale: 1.12, x: 0, y: "-3%" };
    default: return { scale: 1.05 };
  }
}
function kenBurnsAnimate(motion: string) {
  switch (motion) {
    case "zoom-in": return { scale: 1.15, x: 0, y: 0 };
    case "zoom-out": return { scale: 1.0, x: 0, y: 0 };
    case "pan-left": return { scale: 1.12, x: "-3%", y: 0 };
    case "pan-right": return { scale: 1.12, x: "3%", y: 0 };
    case "pan-up": return { scale: 1.12, x: 0, y: "-3%" };
    case "pan-down": return { scale: 1.12, x: 0, y: "3%" };
    default: return { scale: 1.05 };
  }
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
