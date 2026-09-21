"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Home,
  ListChecks,
  Bell,
  TrendingUp,
  UserRound,
  Video,
  ArrowRight,
  Flame,
  Target,
  Clock,
  Plus,
  LogOut,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ListOrdered,
  Eye,
  Brain,
  Focus,
  Hash,
  Puzzle,
  Languages,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FadeIn } from "./motion";
import { ActivityPlayer } from "./ActivityPlayer";
import { StoryActivity } from "./StoryActivity";
import { StoryGamePlayer } from "./StoryGamePlayer";
import { SequencingPlayer } from "./SequencingPlayer";
import { VideoComingSoon } from "./VideoComingSoon";
import { useApp } from "@/lib/store";
import { syncPending } from "@/lib/sync";
import {
  ACTIVITIES,
  CATEGORY_META,
  REGION_GROUPS,
  INTERESTS,
  SCENE_META,
} from "@/lib/activities-data";
import { LANGUAGES } from "@/lib/i18n";
import { recommend, planSession, type SessionPlan } from "@/lib/adaptive";
import { STORY_GAMES, recommendedStories, type StoryGame } from "@/lib/story-games-data";
import { SEQUENCING_ACTIVITIES, sequencingById, type SequencingActivity } from "@/lib/sequencing-data";
import { toast } from "sonner";
import type {
  ActivityCategory,
  ActivityTemplate,
  AttemptRecord,
  ReminderItem,
} from "@/lib/types";

// Category → icon lookup for the adaptive session plan cards.
const ICONS_FOR: Record<string, React.ComponentType<{ className?: string }>> = {
  Eye, Brain, Focus, Hash, Puzzle, ListOrdered, Languages, Target, Compass,
};

type Tab = "home" | "activities" | "reminders" | "progress" | "profile";

type Launched =
  | { kind: "standard"; activity: ActivityTemplate }
  | { kind: "video"; activity: ActivityTemplate }
  | { kind: "storygame"; story: StoryGame }
  | { kind: "sequencing"; activity: SequencingActivity };

export function ElderView() {
  const profile = useApp((s) => s.profile);
  const attempts = useApp((s) => s.attempts);
  const [tab, setTab] = useState<Tab>("home");
  const [launched, setLaunched] = useState<Launched | null>(null);

  const recommendation = recommend(attempts);

  // Adaptive session plan — pure function of recent attempts, so useMemo
  // avoids re-planning during a session. Each new visit (new attempts in the
  // store) produces a fresh, balanced 3-activity combination.
  const sessionPlan = useMemo<SessionPlan>(
    () => planSession(attempts),
    [attempts]
  );

  useEffect(() => {
    syncPending();
  }, []);

  if (launched) {
    if (launched.kind === "storygame") {
      return <StoryGamePlayer story={launched.story} onExit={() => setLaunched(null)} />;
    }
    if (launched.kind === "sequencing") {
      return <SequencingPlayer activity={launched.activity} onExit={() => setLaunched(null)} />;
    }
    if (launched.kind === "video") {
      return (
        <VideoComingSoon
          activity={launched.activity}
          onExit={() => setLaunched(null)}
          onUseStandard={() => setLaunched({ kind: "standard", activity: launched.activity })}
        />
      );
    }
    return <ActivityPlayer activity={launched.activity} onExit={() => setLaunched(null)} />;
  }

  const recActivity =
    ACTIVITIES.find((a) => a.category === recommendation.category) ?? ACTIVITIES[0];

  return (
    <main className="flex-1 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* tabs */}
        <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border/60 bg-card p-1 shadow-soft">
          {([
            ["home", "Home", Home],
            ["activities", "Activities", ListChecks],
            ["reminders", "Reminders", Bell],
            ["progress", "Progress", TrendingUp],
            ["profile", "Profile", UserRound],
          ] as [Tab, string, typeof Home][]).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {tab === "home" && (
          <FadeIn>
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="relative overflow-hidden p-6">
                  <div className="absolute inset-0 bg-aurora opacity-60" />
                  <div className="relative">
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                    <h1 className="mt-1 font-serif text-3xl font-semibold text-foreground">
                      Welcome, {profile?.name}
                    </h1>
                    <p className="mt-1 text-muted-foreground">What can I do now?</p>

                    <Card className="mt-5 border-emerald-200 bg-white/70 p-5 backdrop-blur">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <Sparkles className="mr-1 h-3 w-3" /> Recommended
                          </Badge>
                          <h2 className="mt-2 font-serif text-xl font-semibold text-foreground">
                            {recActivity.title}
                          </h2>
                          <p className="text-sm text-muted-foreground">{recActivity.description}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {recommendation.reason}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {recActivity.category === "sequencing" ? (
                          <Button
                            className="gap-1.5 bg-primary text-primary-foreground"
                            onClick={() => {
                              const seq = SEQUENCING_ACTIVITIES[0];
                              if (seq) setLaunched({ kind: "sequencing", activity: seq });
                            }}
                          >
                            <ListOrdered className="h-4 w-4" /> Watch the sequence
                          </Button>
                        ) : recActivity.category === "story" ? (
                          <Button
                            className="gap-1.5 bg-primary text-primary-foreground"
                            onClick={() => {
                              const sg = recommendedStories(profile?.regionState, profile?.interests)[0];
                              if (sg) setLaunched({ kind: "storygame", story: sg });
                            }}
                          >
                            <BookOpen className="h-4 w-4" /> Play story
                          </Button>
                        ) : (
                          <>
                            {recActivity.video && (
                              <Button
                                variant="outline"
                                className="gap-1.5 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                onClick={() => setLaunched({ kind: "video", activity: recActivity })}
                              >
                                <Video className="h-4 w-4" /> Personalized Video
                                <span className="ml-0.5 rounded bg-amber-200 px-1 text-[9px] font-semibold text-amber-900">SOON</span>
                              </Button>
                            )}
                            <Button
                              className="gap-1.5 bg-primary text-primary-foreground"
                              onClick={() => setLaunched({ kind: "standard", activity: recActivity })}
                            >
                              Start activity <ArrowRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <StatCard icon={Flame} label="Day streak" value={String(streak(attempts))} tone="emerald" />
                <StatCard icon={Target} label="Avg accuracy" value={`${pct(avgAccuracy(attempts))}%`} tone="teal" />
                <StatCard icon={Clock} label="Activities today" value={String(doneToday(attempts))} tone="sky" />
              </div>
            </div>

            {/* Adaptive session plan — fresh, balanced 3-activity combination */}
            {sessionPlan && sessionPlan.items.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-serif text-xl font-semibold text-foreground">Today&apos;s session</h2>
                  <span className="text-xs text-muted-foreground">{sessionPlan.summary}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {sessionPlan.items.map((item, i) => {
                    const meta = CATEGORY_META[item.category];
                    const Icon = ICONS_FOR[meta?.icon] ?? Sparkles;
                    const a = ACTIVITIES.find((x) => x.category === item.category);
                    return (
                      <Card key={i} className="flex h-full flex-col p-4">
                        <div className="flex items-center justify-between">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <Icon className="h-4.5 w-4.5" />
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Level {item.difficulty}
                          </span>
                        </div>
                        <h3 className="mt-2 font-medium text-foreground">{meta?.label}</h3>
                        <p className="mt-0.5 flex-1 text-xs text-muted-foreground">{item.reason}</p>
                        {a && (
                          <Button
                            size="sm"
                            className="mt-3 gap-1 bg-primary text-primary-foreground"
                            onClick={() => setLaunched({ kind: "standard", activity: a })}
                          >
                            Start <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">Quick activities</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ACTIVITIES.filter((a) => a.category !== "story").slice(0, 6).map((a) => (
                  <ActivityCard
                    key={a.id}
                    activity={a}
                    onStart={() => setLaunched({ kind: "standard", activity: a })}
                    onVideo={() => setLaunched({ kind: "video", activity: a })}
                  />
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {tab === "activities" && (
          <FadeIn>
            {/* ── Cognitive Activities ── */}
            <div className="mb-2 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-emerald-700" />
              <h1 className="font-serif text-2xl font-semibold text-foreground">Cognitive Activities</h1>
            </div>
            <p className="mb-5 text-sm text-muted-foreground">
              Visual memory activities — observe, then answer from memory.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ACTIVITIES.filter((a) => a.category !== "story").map((a) => {
                const isSeq = a.category === "sequencing";
                const seq = isSeq ? SEQUENCING_ACTIVITIES[0] : null;
                return (
                  <ActivityCard
                    key={a.id}
                    activity={a}
                    onStart={() => {
                      if (isSeq && seq) setLaunched({ kind: "sequencing", activity: seq });
                      else setLaunched({ kind: "standard", activity: a });
                    }}
                    onVideo={() => setLaunched({ kind: "video", activity: a })}
                  />
                );
              })}
            </div>

            {/* ── Story Games ── */}
            <div className="mt-10 mb-2 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal-700" />
              <h2 className="font-serif text-2xl font-semibold text-foreground">Story Games</h2>
            </div>
            <p className="mb-5 text-sm text-muted-foreground">
              Short visual stories designed around familiar everyday experiences.
              Watch the story, then answer memory questions.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedStories(profile?.regionState, profile?.interests).map((sg) => (
                <StoryGameCard
                  key={sg.id}
                  story={sg}
                  onPlay={() => setLaunched({ kind: "storygame", story: sg })}
                />
              ))}
            </div>
          </FadeIn>
        )}

        {tab === "reminders" && <RemindersTab />}
        {tab === "progress" && <ProgressTab />}
        {tab === "profile" && <ProfileTab />}
      </div>
    </main>
  );
}

function ActivityCard({
  activity,
  onStart,
  onVideo,
}: {
  activity: ActivityTemplate;
  onStart: () => void;
  onVideo: () => void;
}) {
  const meta = CATEGORY_META[activity.category];
  const scene = SCENE_META[activity.scene];
  const isStory = activity.category === "story";
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <div className="relative">
        { }
        <img src={scene.image} alt={scene.label} className="h-32 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <Badge className="absolute left-2 top-2 bg-white/85 text-emerald-800 backdrop-blur">
          {meta.label}
        </Badge>
        <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white backdrop-blur">
          Level {activity.difficulty}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium text-foreground">{activity.title}</h3>
        <p className="mt-0.5 flex-1 text-sm text-muted-foreground">{activity.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" className="gap-1 bg-primary text-primary-foreground" onClick={onStart}>
            {isStory ? "Read" : "Start"} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          {activity.video && (
            <Button size="sm" variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100" onClick={onVideo}>
              <Video className="h-3.5 w-3.5" /> Video
              <span className="ml-0.5 rounded bg-amber-200 px-1 text-[9px] font-semibold text-amber-900">SOON</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function StoryGameCard({
  story,
  onPlay,
}: {
  story: StoryGame;
  onPlay: () => void;
}) {
  const scene = SCENE_META[story.scene];
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <div className="relative">
        { }
        <img src={scene.image} alt={story.title} className="h-36 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <Badge className="absolute left-2 top-2 bg-teal-600/90 text-white backdrop-blur">
          <BookOpen className="mr-1 h-3 w-3" /> Story · {story.scenes.length} scenes
        </Badge>
        <span className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          {story.difficulty}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium text-foreground">{story.title}</h3>
        <p className="mt-0.5 flex-1 text-sm text-muted-foreground">{story.description}</p>
        {story.interests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {story.interests.slice(0, 3).map((i) => (
              <span key={i} className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                {i}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3">
          <Button size="sm" className="gap-1 bg-primary text-primary-foreground" onClick={onPlay}>
            <BookOpen className="h-3.5 w-3.5" /> Play story <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function RemindersTab() {
  const profile = useApp((s) => s.profile);
  const reminders = useApp((s) => s.reminders);
  const upsertReminder = useApp((s) => s.upsertReminder);
  const removeReminder = useApp((s) => s.removeReminder);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ type: "activity", title: "", time: "09:00" });

  async function toggle(r: ReminderItem) {
    const next = { ...r, enabled: !r.enabled };
    upsertReminder(next);
    await fetch("/api/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  }

  async function remove(id: string) {
    removeReminder(id);
    await fetch(`/api/reminders?id=${id}`, { method: "DELETE" });
  }

  async function add() {
    if (!form.title.trim()) return;
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] }),
    });
    const json = await res.json();
    if (json.reminder) {
      upsertReminder(json.reminder);
      setForm({ type: "activity", title: "", time: "09:00" });
      setAdding(false);
      toast.success("Reminder added.");
    }
  }

  return (
    <FadeIn>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Reminders</h1>
          <p className="text-sm text-muted-foreground">Gentle reminders only — never medical advice.</p>
        </div>
        <Button className="gap-1.5 bg-primary text-primary-foreground" onClick={() => setAdding((a) => !a)}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {adding && (
        <Card className="mb-4 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["medication","appointment","meal","hydration","activity","routine"].map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Evening walk" />
            </div>
            <div className="space-y-1">
              <Label>Time</Label>
              <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="bg-primary text-primary-foreground" onClick={add}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-2">
        {reminders.length === 0 && (
          <Card className="p-6 text-center text-sm text-muted-foreground">No reminders yet.</Card>
        )}
        {reminders.map((r) => (
          <Card key={r.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <div className="font-medium capitalize text-foreground">{r.title}</div>
                <div className="text-xs text-muted-foreground">
                  {r.time} · {r.type} · {r.days?.length === 7 ? "Every day" : r.days?.join(", ")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={r.enabled} onCheckedChange={() => toggle(r)} />
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>Remove</Button>
            </div>
          </Card>
        ))}
      </div>
    </FadeIn>
  );
}

function ProgressTab() {
  const attempts = useApp((s) => s.attempts);
  const last7 = last7Days(attempts);
  const max = Math.max(1, ...last7.map((d) => d.completed));
  return (
    <FadeIn>
      <h1 className="mb-1 font-serif text-2xl font-semibold text-foreground">Progress</h1>
      <p className="mb-5 text-sm text-muted-foreground">A factual, non-diagnostic view of recent engagement.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Flame} label="Day streak" value={String(streak(attempts))} tone="emerald" />
        <StatCard icon={Target} label="Avg accuracy" value={`${pct(avgAccuracy(attempts))}%`} tone="teal" />
        <StatCard icon={Clock} label="Total completed" value={String(attempts.filter((a) => a.completed).length)} tone="sky" />
      </div>

      <Card className="mt-5 p-5">
        <h2 className="mb-3 font-medium text-foreground">Last 7 days</h2>
        <div className="flex items-end justify-between gap-2">
          {last7.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-32 w-full items-end justify-center">
                <div
                  className="w-full max-w-[2.5rem] rounded-t-md bg-gradient-to-t from-emerald-500 to-teal-400"
                  style={{ height: `${(d.completed / max) * 100}%`, minHeight: d.completed ? "8px" : "2px" }}
                  title={`${d.completed} completed`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{d.date}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <h2 className="mb-3 font-medium text-foreground">Recent activity</h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities yet — try one from the Home tab.</p>
        ) : (
          <ul className="space-y-2">
            {attempts.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-foreground">{a.title}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="capitalize">{a.category.replace("_", " ")}</span>
                  <span>{pct(a.accuracy)}%</span>
                  <span>{Math.round(a.responseMs / 1000)}s</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </FadeIn>
  );
}

function ProfileTab() {
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const setView = useApp((s) => s.setView);
  const reset = useApp((s) => s.reset);
  const [name, setName] = useState(profile?.name ?? "");
  const [language, setLanguage] = useState(profile?.language ?? "en");
  const [regionGroup, setRegionGroup] = useState(profile?.regionGroup ?? "South India");
  const [regionState, setRegionState] = useState(profile?.regionState ?? "Karnataka");
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);

  async function save() {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, language, regionGroup, regionState, interests }),
    });
    const json = await res.json();
    if (json.profile) {
      setProfile(json.profile);
      toast.success("Profile updated.");
    }
  }

  async function signOut() {
    await fetch("/api/session", { method: "DELETE" });
    reset();
    setView("landing");
  }

  if (!profile) return null;

  return (
    <FadeIn>
      <h1 className="mb-1 font-serif text-2xl font-semibold text-foreground">Profile</h1>
      <p className="mb-5 text-sm text-muted-foreground">Adjust language, region and interests anytime.</p>
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Age</Label>
            <Input value={profile.age} disabled />
          </div>
          <div className="space-y-1">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.native} ({l.name})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Region group</Label>
            <Select
              value={regionGroup}
              onValueChange={(v) => {
                setRegionGroup(v);
                const g = REGION_GROUPS.find((r) => r.name === v)!;
                setRegionState(g.states[0]);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REGION_GROUPS.map((r) => (
                  <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>State</Label>
            <Select value={regionState} onValueChange={setRegionState}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REGION_GROUPS.find((r) => r.name === regionGroup)?.states.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <Label>Interests</Label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => {
              const on = interests.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => setInterests(on ? interests.filter((x) => x !== i) : [...interests, i])}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${on ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-border hover:bg-muted"}`}
                >
                  {i}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <Button variant="outline" className="gap-1.5 text-rose-600" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
          <Button className="bg-primary text-primary-foreground" onClick={save}>Save changes</Button>
        </div>
      </Card>
    </FadeIn>
  );
}

// ── helpers ─────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Home;
  label: string;
  value: string;
  tone: "emerald" | "teal" | "sky";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    teal: "bg-teal-50 text-teal-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-serif text-2xl font-semibold text-foreground">{value}</div>
      </div>
    </Card>
  );
}

function streak(attempts: AttemptRecord[]): number {
  const completed = attempts.filter((a) => a.completed);
  if (!completed.length) return 0;
  const days = new Set(completed.map((a) => new Date(a.createdAt).toDateString()));
  let s = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
}
function avgAccuracy(attempts: AttemptRecord[]): number {
  const c = attempts.filter((a) => a.completed);
  if (!c.length) return 0;
  return c.reduce((s, a) => s + a.accuracy, 0) / c.length;
}
function doneToday(attempts: AttemptRecord[]): number {
  const t = new Date().toDateString();
  return attempts.filter((a) => a.completed && new Date(a.createdAt).toDateString() === t).length;
}
function pct(n: number): number {
  return Math.round(n * 100);
}
function last7Days(attempts: AttemptRecord[]) {
  const out: { date: string; completed: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    out.push({
      date: d.toLocaleDateString("en-US", { weekday: "short" }),
      completed: attempts.filter((a) => a.completed && new Date(a.createdAt).toDateString() === key).length,
    });
  }
  return out;
}
