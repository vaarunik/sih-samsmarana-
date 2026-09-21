"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  History,
  BarChart3,
  Lightbulb,
  Bell,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  CheckCircle2,
  CloudOff,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "./motion";
import { useApp } from "@/lib/store";
import { ACTIVITIES, CATEGORY_META } from "@/lib/activities-data";
import { recommend } from "@/lib/adaptive";
import type { ActivityCategory } from "@/lib/types";

type Tab = "overview" | "history" | "performance" | "recommendations" | "reminders";

interface Metrics {
  totalAttempts: number;
  totalCompleted: number;
  avgAccuracy: number;
  avgResponseMs: number;
  pendingSync: number;
  streak: number;
  byCategory: { category: string; count: number; avgAccuracy: number; avgResponseMs: number }[];
  last7: { date: string; completed: number; avgAccuracy: number }[];
  recent: {
    id: string; title: string; category: string; difficulty: number;
    accuracy: number; responseMs: number; completed: boolean; skipped: boolean;
    createdAt: string;
  }[];
}

export function CaregiverView() {
  const profile = useApp((s) => s.profile);
  const attempts = useApp((s) => s.attempts);
  const setView = useApp((s) => s.setView);
  const [tab, setTab] = useState<Tab>("overview");
  const [insights, setInsights] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/api/insights", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setInsights(d.insights ?? []);
        setMetrics(d.metrics ?? null);
      })
      .catch(() => {});
  }, [attempts.length]);

  const rec = recommend(attempts);

  return (
    <main className="flex-1 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">Caregiver dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Supporting <span className="font-medium text-foreground">{profile?.name}</span> · {profile?.caregiverRelation ?? "Caregiver"}
            </p>
          </div>
          <Button variant="outline" className="gap-1.5" onClick={() => setView("family")}>
            <Users className="h-4 w-4" /> Family Engagement
          </Button>
        </div>

        <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border/60 bg-card p-1 shadow-soft">
          {([
            ["overview", "Overview", LayoutDashboard],
            ["history", "Activity History", History],
            ["performance", "Performance", BarChart3],
            ["recommendations", "Recommendations", Lightbulb],
            ["reminders", "Reminders", Bell],
          ] as [Tab, string, typeof Home][]).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>

        {tab === "overview" && (
          <FadeIn>
            <div className="grid gap-4 sm:grid-cols-4">
              <Metric icon={Target} label="Avg accuracy" value={`${display(metrics?.avgAccuracy ?? avgAccuracy(attempts))}%`} tone="emerald" />
              <Metric icon={Clock} label="Avg response" value={`${Math.round((metrics?.avgResponseMs ?? avgRt(attempts)) / 1000)}s`} tone="teal" />
              <Metric icon={CheckCircle2} label="Completed" value={String(metrics?.totalCompleted ?? attempts.filter((a) => a.completed).length)} tone="sky" />
              <Metric icon={CloudOff} label="Pending sync" value={String(metrics?.pendingSync ?? 0)} tone="amber" />
            </div>

            <Card className="mt-5 p-5">
              <h2 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                <Lightbulb className="h-4 w-4 text-emerald-700" /> Observations
              </h2>
              <ul className="space-y-2">
                {(insights.length ? insights : ["No observations yet."]).map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                These are engagement observations only — not a diagnosis.
              </p>
            </Card>
          </FadeIn>
        )}

        {tab === "history" && (
          <FadeIn>
            <Card className="p-5">
              <h2 className="mb-3 font-medium text-foreground">Recent activity</h2>
              {(metrics?.recent ?? attempts.slice(0, 12)).length === 0 ? (
                <p className="text-sm text-muted-foreground">No activities recorded yet.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {(metrics?.recent ?? attempts.slice(0, 12)).map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-foreground">{a.title}</span>
                        <Badge variant="secondary" className="capitalize">{a.category.replace("_", " ")}</Badge>
                        {a.skipped && <Badge variant="outline" className="text-amber-700">Skipped</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Level {a.difficulty}</span>
                        <span>{display(a.accuracy)}%</span>
                        <span>{Math.round(a.responseMs / 1000)}s</span>
                        <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </FadeIn>
        )}

        {tab === "performance" && (
          <FadeIn>
            <Card className="p-5">
              <h2 className="mb-3 font-medium text-foreground">By category</h2>
              {(metrics?.byCategory ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough data yet.</p>
              ) : (
                <ul className="space-y-3">
                  {(metrics?.byCategory ?? []).map((c) => {
                    const meta = CATEGORY_META[c.category as ActivityCategory];
                    return (
                      <li key={c.category}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{meta?.label ?? c.category}</span>
                          <span className="text-muted-foreground">{c.count} · {c.avgAccuracy}% · {Math.round(c.avgResponseMs / 1000)}s</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${c.avgAccuracy}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card className="mt-5 p-5">
              <h2 className="mb-3 font-medium text-foreground">Last 7 days</h2>
              <div className="flex items-end justify-between gap-2">
                {(metrics?.last7 ?? []).map((d, i) => {
                  const max = Math.max(1, ...(metrics?.last7 ?? []).map((x) => x.completed));
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex h-28 w-full items-end justify-center">
                        <div className="w-full max-w-[2.5rem] rounded-t-md bg-gradient-to-t from-emerald-500 to-teal-400" style={{ height: `${(d.completed / max) * 100}%`, minHeight: d.completed ? "8px" : "2px" }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{d.date}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </FadeIn>
        )}

        {tab === "recommendations" && (
          <FadeIn>
            <Card className="p-5">
              <h2 className="mb-1 font-medium text-foreground">Adaptive recommendation</h2>
              <p className="mb-4 text-sm text-muted-foreground">Gradual, non-diagnostic adjustments based on recent performance.</p>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-emerald-700">Next suggested</div>
                    <div className="font-serif text-xl font-semibold text-foreground capitalize">
                      {CATEGORY_META[rec.category]?.label ?? rec.category}
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Level {rec.difficulty}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{rec.reason}</p>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {ACTIVITIES.filter((a) => a.category === rec.category).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div>
                      <div className="font-medium text-foreground">{a.title}</div>
                      <div className="text-xs text-muted-foreground">Level {a.difficulty}{a.video ? " · AI video" : ""}</div>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setView("elder")}>
                      Open <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </FadeIn>
        )}

        {tab === "reminders" && (
          <FadeIn>
            <Card className="p-5">
              <h2 className="mb-3 font-medium text-foreground">Reminders</h2>
              <RemindersList />
            </Card>
          </FadeIn>
        )}
      </div>
    </main>
  );
}

function RemindersList() {
  const reminders = useApp((s) => s.reminders);
  if (!reminders.length) return <p className="text-sm text-muted-foreground">No reminders set.</p>;
  return (
    <ul className="space-y-2">
      {reminders.map((r) => (
        <li key={r.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-700" />
            <span className="font-medium text-foreground">{r.title}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {r.time} · {r.days?.length === 7 ? "Every day" : r.days?.join(", ")} · {r.enabled ? "On" : "Off"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Home;
  label: string;
  value: string;
  tone: "emerald" | "teal" | "sky" | "amber";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    teal: "bg-teal-50 text-teal-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 font-serif text-2xl font-semibold text-foreground">{value}</div>
    </Card>
  );
}

function avgAccuracy(attempts: { completed: boolean; accuracy: number }[]): number {
  const c = attempts.filter((a) => a.completed);
  if (!c.length) return 0;
  return c.reduce((s, a) => s + a.accuracy, 0) / c.length;
}
function avgRt(attempts: { completed: boolean; responseMs: number }[]): number {
  const c = attempts.filter((a) => a.completed);
  if (!c.length) return 0;
  return c.reduce((s, a) => s + a.responseMs, 0) / c.length;
}
/** Accepts either a 0..1 ratio or a 0..100 percentage and returns 0..100. */
function display(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n > 1 ? n : n * 100);
}
