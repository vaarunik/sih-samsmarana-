"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  X,
  Video as VideoIcon,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Trophy,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BackButton } from "./BackButton";
import { Waves } from "./Waves";
import { useApp } from "@/lib/store";
import { recordAttempt } from "@/lib/sync";
import { idbPutVideo } from "@/lib/idb";
import { SCENE_META } from "@/lib/activities-data";
import type { ActivityTemplate } from "@/lib/activities-data";
import type { AttemptRecord, Question, VideoState } from "@/lib/types";

type Phase =
  | "intro"
  | "starting"
  | "generating"
  | "ready"
  | "questions"
  | "result"
  | "fallback";

export function VideoActivity({
  activity,
  onExit,
  onUseStandard,
}: {
  activity: ActivityTemplate;
  onExit: () => void;
  onUseStandard: () => void;
}) {
  const profile = useApp((s) => s.profile);
  const effectiveOnline = useApp((s) => s.effectiveOnline());
  const scene = SCENE_META[activity.scene];

  const [phase, setPhase] = useState<Phase>("intro");
  const [video, setVideo] = useState<VideoState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startRef, setStartRef] = useState(0);
  const [responseMs, setResponseMs] = useState(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  async function generate() {
    if (!effectiveOnline) {
      setPhase("fallback");
      return;
    }
    setPhase("starting");
    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: activity.id }),
      });
      const data = await res.json();
      setQuestions(data.questions ?? []);
      if (data.status === "unavailable" || data.status === "failed") {
        setPhase("fallback");
        return;
      }
      // generating — begin polling
      setVideo({
        id: data.id,
        profileId: profile?.id ?? "",
        activityId: activity.id,
        category: activity.category,
        prompt: "",
        model: data.model ?? "veo-3.0-generate-001",
        operationId: data.operationId ?? null,
        status: "generating",
        questions: data.questions ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setPhase("generating");
      if (!data.operationId) {
        // No operation to poll (shouldn't happen in "generating" state) — fall back.
        setPhase("fallback");
        return;
      }
      poll(data.operationId);
    } catch {
      setPhase("fallback");
    }
  }

  async function poll(operationId: string) {
    try {
      const res = await fetch(`/api/video/status?id=${encodeURIComponent(operationId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.questions) setQuestions(data.questions);

      if (data.status === "ready") {
        setVideo((v) =>
          v ? { ...v, status: "ready", videoUrl: data.videoUrl } : v
        );
        // cache the real video blob offline for replay (key by record id)
        if (data.id) cacheVideo(data.videoUrl, data.id).catch(() => {});
        setPhase("ready");
        return;
      }
      if (data.status === "failed" || data.status === "unavailable") {
        setPhase("fallback");
        return;
      }
      // preparing / generating — keep polling
      pollRef.current = setTimeout(() => poll(operationId), 4000);
    } catch {
      pollRef.current = setTimeout(() => poll(operationId), 5000);
    }
  }

  async function cacheVideo(url: string, id: string) {
    try {
      const r = await fetch(url);
      const blob = await r.blob();
      const objUrl = URL.createObjectURL(blob);
      await idbPutVideo({
        id,
        blob,
        url: objUrl,
        prompt: scene.setting,
        category: activity.category,
        createdAt: new Date().toISOString(),
      });
    } catch {
      // best-effort offline cache
    }
  }

  function answer(idx: number) {
    const next = [...answers];
    next[qi] = idx;
    setAnswers(next);
    setResponseMs((r) => r + (Date.now() - startRef));
    setTimeout(() => {
      if (qi < questions.length - 1) {
        setQi(qi + 1);
        setStartRef(Date.now());
      } else {
        finish(next);
      }
    }, 450);
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
      activityId: activity.id,
      category: activity.category,
      title: `${activity.title} (Video)`,
      difficulty: activity.difficulty,
      accuracy,
      responseMs: responseMs,
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

  // ── Intro ──────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <Shell onExit={onExit}>
        <Card className="overflow-hidden p-0">
          <div className={`relative bg-gradient-to-br ${sceneTone(activity.scene)} p-8 text-white`}>
            <Waves className="absolute inset-0 h-full w-full opacity-25" />
            <div className="relative">
              <Badge className="bg-white/20 text-white">
                <Sparkles className="mr-1 h-3 w-3" /> AI cognitive video
              </Badge>
              <h2 className="mt-3 font-serif text-3xl font-semibold">{activity.title}</h2>
              <p className="mt-1 text-white/85">{activity.description}</p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-muted-foreground">
              Samsmarana will generate a calm, realistic 8-second scene based on{" "}
              <span className="font-medium text-foreground">{profile?.regionState}</span>, your
              interests and this activity — using Google&apos;s Gemini &amp; Veo. After watching,
              you&apos;ll answer a few cognitive questions.
            </p>
            {!effectiveOnline && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <AlertCircle className="h-4 w-4" />
                You&apos;re offline. AI video needs the internet — you can continue with a standard activity.
              </p>
            )}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground"
                onClick={generate}
              >
                <VideoIcon className="h-4 w-4" />
                Generate Personalized Video
              </Button>
              <Button size="lg" variant="outline" onClick={onUseStandard}>
                Continue with Standard Activity
              </Button>
            </div>
          </div>
        </Card>
      </Shell>
    );
  }

  // ── Starting / Generating ──────────────────────────────
  if (phase === "starting" || phase === "generating") {
    const label = phase === "starting" ? "Preparing…" : "Generating…";
    return (
      <Shell onExit={onExit}>
        <Card className="overflow-hidden p-0">
          <div className={`relative flex h-64 items-center justify-center bg-gradient-to-br ${sceneTone(activity.scene)} text-white`}>
            <Waves className="absolute inset-0 h-full w-full opacity-30" />
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-emerald-700 shadow-lift">
                <RefreshCw className="h-7 w-7 animate-spin" />
              </div>
              <p className="mt-4 font-serif text-2xl font-semibold">{label}</p>
              <p className="text-white/80">
                {phase === "starting"
                  ? "Setting up your personalized scene…"
                  : "Veo is rendering a calm, realistic clip…"}
              </p>
            </div>
          </div>
          <div className="p-6">
            <Progress value={phase === "starting" ? 15 : 60} className="h-2" />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              This usually takes 1–3 minutes. You can continue with a standard activity anytime.
            </p>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => { if (pollRef.current) clearTimeout(pollRef.current); setPhase("fallback"); }}>
                Continue with Standard Activity
              </Button>
            </div>
          </div>
        </Card>
      </Shell>
    );
  }

  // ── Fallback (key missing or generation failed) ────────
  if (phase === "fallback") {
    return (
      <Shell onExit={onExit}>
        <Card className="p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertCircle className="h-7 w-7" />
          </span>
          <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">
            Video generation is temporarily unavailable
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            You can continue with a standard cognitive activity. Your progress is
            still recorded and the adaptive engine keeps learning.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button variant="outline" className="gap-1.5" onClick={generate}>
              <RefreshCw className="h-4 w-4" /> Try again
            </Button>
            <Button className="gap-1.5 bg-primary text-primary-foreground" onClick={onUseStandard}>
              Continue with Standard Activity
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </Shell>
    );
  }

  // ── Ready (show the real video) ────────────────────────
  if (phase === "ready") {
    return (
      <Shell onExit={onExit}>
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-video w-full bg-black">
            {video?.videoUrl && (
              <video
                src={video.videoUrl}
                controls
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PlayCircle className="h-4 w-4 text-emerald-600" />
              Watch the short scene, then answer the questions.
            </div>
            <Button
              size="lg"
              className="mt-4 w-full gap-2 bg-primary text-primary-foreground sm:w-auto"
              onClick={() => {
                setQi(0);
                setAnswers([]);
                setResponseMs(0);
                setStartRef(Date.now());
                setPhase("questions");
              }}
            >
              Continue to questions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </Shell>
    );
  }

  // ── Questions ──────────────────────────────────────────
  if (phase === "questions") {
    const q = questions[qi];
    const answered = answers[qi];
    return (
      <Shell onExit={onExit}>
        <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {qi + 1} of {questions.length}</span>
          <span className="capitalize">{activity.category.replace("_", " ")}</span>
        </div>
        <Progress value={((qi + 1) / questions.length) * 100} className="mb-4 h-2" />
        <Card className="p-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground text-balance">
            {q.prompt}
          </h2>
          <div className="mt-5 grid gap-2.5">
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answerIndex;
              const isPicked = answered === i;
              const reveal = answered != null;
              return (
                <button
                  key={i}
                  disabled={reveal}
                  onClick={() => answer(i)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left text-base transition-colors ${
                    reveal && isAnswer
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : reveal && isPicked && !isAnswer
                        ? "border-rose-300 bg-rose-50 text-rose-800"
                        : "border-border hover:bg-muted/60"
                  }`}
                >
                  <span className="capitalize">{opt}</span>
                  {reveal && isAnswer && <Check className="h-5 w-5 text-emerald-600" />}
                  {reveal && isPicked && !isAnswer && <X className="h-5 w-5 text-rose-500" />}
                </button>
              );
            })}
          </div>
          {answered !== null && q.explanation && (
            <p className="mt-4 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
              {q.explanation}
            </p>
          )}
        </Card>
      </Shell>
    );
  }

  // ── Result ─────────────────────────────────────────────
  const correct = questions.reduce(
    (s, q, i) => s + (answers[i] === q.answerIndex ? 1 : 0),
    0
  );
  const accuracy = questions.length ? correct / questions.length : 0;
  return (
    <Shell onExit={onExit}>
      <Card className="p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Trophy className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-serif text-3xl font-semibold text-foreground">
          {accuracy >= 0.8 ? "Well done!" : accuracy >= 0.5 ? "Nice effort." : "Good try."}
        </h2>
        <p className="mt-1 text-muted-foreground">
          {correct} of {questions.length} correct.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="Accuracy" value={`${Math.round(accuracy * 100)}%`} />
          <Stat label="Time" value={`${Math.round(responseMs / 1000)}s`} />
          <Stat label="Score" value={String(Math.round(accuracy * 100))} />
        </div>
        <Button className="mt-6 gap-1.5 bg-primary text-primary-foreground" onClick={onExit}>
          Done
          <ArrowRight className="h-4 w-4" />
        </Button>
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
}: {
  children: React.ReactNode;
  onExit: () => void;
}) {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <BackButton label="Back to activities" onClick={onExit} />
        <div className="mt-4">{children}</div>
      </div>
    </main>
  );
}

function sceneTone(scene: string): string {
  const tones: Record<string, string> = {
    garden: "from-emerald-600 to-teal-600",
    market: "from-emerald-600 to-sky-600",
    shop: "from-teal-600 to-emerald-600",
    cooking: "from-amber-600 to-emerald-600",
    tea: "from-emerald-600 to-amber-600",
    train: "from-sky-600 to-emerald-600",
    nature: "from-emerald-600 to-sky-600",
    birds: "from-teal-600 to-sky-600",
    home: "from-emerald-700 to-teal-700",
    community: "from-emerald-600 to-teal-600",
    river: "from-sky-600 to-teal-600",
    festival: "from-amber-500 to-emerald-600",
  };
  return tones[scene] ?? "from-emerald-600 to-teal-600";
}
