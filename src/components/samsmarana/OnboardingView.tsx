"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "./BackButton";
import { FadeIn } from "./motion";
import { useApp } from "@/lib/store";
import { REGION_GROUPS, INTERESTS, CATEGORY_META } from "@/lib/activities-data";
import { LANGUAGES } from "@/lib/i18n";
import type {
  ActivityCategory,
  LanguageCode,
  OnboardingData,
} from "@/lib/types";
import { toast } from "sonner";

const STEPS = [
  "Name",
  "Age",
  "Language",
  "Region & State",
  "Interests",
  "Preferred activities",
  "Caregiver connection",
  "Confirmation",
];

export function OnboardingView() {
  const setView = useApp((s) => s.setView);
  const setProfile = useApp((s) => s.setProfile);

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    age: 70,
    language: "en",
    regionGroup: "North Eastern Region",
    regionState: "Assam",
    interests: [],
    preferredActivities: [],
    caregiverName: "",
    caregiverRelation: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const total = STEPS.length;
  const progress = ((step + 1) / total) * 100;

  async function finish(demo?: "lakshmi" | "anima") {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demo ? { demo } : data),
      });
      const json = await res.json();
      if (!res.ok || !json.profile) {
        throw new Error(json.message || "Could not create profile");
      }
      setProfile(json.profile);
      useApp.getState().setMode("elder");
      setView("elder");
      toast.success(`Welcome, ${json.profile.name}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const canContinue = (() => {
    switch (step) {
      case 0: return data.name.trim().length > 0;
      case 1: return data.age > 0 && data.age < 120;
      case 2: return !!data.language;
      case 3: return !!data.regionGroup && !!data.regionState;
      case 4: return data.interests.length > 0;
      case 5: return data.preferredActivities.length > 0;
      case 6: return data.caregiverName.trim().length > 0;
      default: return true;
    }
  })();

  return (
    <main className="flex-1 bg-aurora">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <BackButton label="Back to home" onClick={() => setView("landing")} />

        <div className="mt-4 mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {step + 1} of {total}</span>
            <span>{STEPS[step]}</span>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>

        {step === 0 && (
          <Card className="p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">Let&apos;s begin with a name</h2>
            <p className="mt-1 text-sm text-muted-foreground">This is how Samsmarana will greet the elder.</p>
            <div className="mt-5 space-y-2">
              <Label htmlFor="name">Elder&apos;s name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="e.g. Lakshmi"
                autoFocus
                className="h-12 text-lg"
              />
            </div>
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Quick start · demo profiles</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <DemoButton name="Lakshmi" sub="Karnataka · Kannada · 72" onClick={() => finish("lakshmi")} disabled={submitting} />
                <DemoButton name="Anima" sub="Assam (NER) · English · 70" onClick={() => finish("anima")} disabled={submitting} />
              </div>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card className="p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">What is the age?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Used only to personalize tone and difficulty.</p>
            <div className="mt-5 space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={50}
                max={110}
                value={data.age}
                onChange={(e) => setData({ ...data, age: Number(e.target.value) })}
                className="h-12 text-lg"
              />
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">Choose a language</h2>
            <p className="mt-1 text-sm text-muted-foreground">Region and language are independent. You can change this later.</p>
            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Common languages
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {LANGUAGES.filter((l) => l.group === "common").map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setData({ ...data, language: l.code as LanguageCode })}
                      className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                        data.language === l.code
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-foreground">{l.native}</div>
                        <div className="text-xs text-muted-foreground">{l.name}</div>
                      </div>
                      {data.language === l.code && <Check className="h-5 w-5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  North Eastern Region languages
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {LANGUAGES.filter((l) => l.group === "ner").map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setData({ ...data, language: l.code as LanguageCode })}
                      className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                        data.language === l.code
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-foreground">{l.native}</div>
                        <div className="text-xs text-muted-foreground">
                          {l.name}
                          {!l.voiceLikely && <span className="ml-1 text-amber-600">· voice limited</span>}
                        </div>
                      </div>
                      {data.language === l.code && <Check className="h-5 w-5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Language and region are independent. English is suggested based on your device — but the choice is always yours.
            </p>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">Region &amp; state</h2>
            <p className="mt-1 text-sm text-muted-foreground">Stored separately so activities reflect familiar everyday settings.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Region group</Label>
                <select
                  value={data.regionGroup}
                  onChange={(e) => {
                    const g = REGION_GROUPS.find((r) => r.name === e.target.value)!;
                    setData({ ...data, regionGroup: g.name, regionState: g.states[0] });
                  }}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-foreground"
                >
                  {REGION_GROUPS.map((r) => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <select
                  value={data.regionState}
                  onChange={(e) => setData({ ...data, regionState: e.target.value })}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-foreground"
                >
                  {REGION_GROUPS.find((r) => r.name === data.regionGroup)?.states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            {data.regionGroup === "North Eastern Region" && (
              <Badge className="mt-4 bg-emerald-100 text-emerald-700">NER context enabled</Badge>
            )}
          </Card>
        )}

        {step === 4 && (
          <Card className="p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">Familiar interests</h2>
            <p className="mt-1 text-sm text-muted-foreground">These gently shape the scenes Samsmarana creates.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const on = data.interests.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() =>
                      setData({
                        ...data,
                        interests: on
                          ? data.interests.filter((x) => x !== i)
                          : [...data.interests, i],
                      })
                    }
                    className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                      on ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {step === 5 && (
          <Card className="p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">Preferred activity types</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pick a few to start. The adaptive engine will learn from here.</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {(Object.entries(CATEGORY_META) as [ActivityCategory, typeof CATEGORY_META[ActivityCategory]][]).map(
                ([key, m]) => {
                  const on = data.preferredActivities.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setData({
                          ...data,
                          preferredActivities: on
                            ? data.preferredActivities.filter((x) => x !== key)
                            : [...data.preferredActivities, key],
                        })
                      }
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-colors ${
                        on ? "border-emerald-400 bg-emerald-50" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-foreground">{m.label}</div>
                        <div className="text-xs text-muted-foreground">{m.blurb}</div>
                      </div>
                      {on && <Check className="h-5 w-5 text-emerald-600" />}
                    </button>
                  );
                }
              )}
            </div>
          </Card>
        )}

        {step === 6 && (
          <Card className="p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">Caregiver connection</h2>
            <p className="mt-1 text-sm text-muted-foreground">So the right person can see supportive, non-diagnostic insights.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cg">Caregiver name</Label>
                <Input
                  id="cg"
                  value={data.caregiverName}
                  onChange={(e) => setData({ ...data, caregiverName: e.target.value })}
                  placeholder="e.g. Arjun"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cr">Relation</Label>
                <Input
                  id="cr"
                  value={data.caregiverRelation}
                  onChange={(e) => setData({ ...data, caregiverRelation: e.target.value })}
                  placeholder="e.g. Grandson"
                  className="h-11"
                />
              </div>
            </div>
          </Card>
        )}

        {step === 7 && (
          <FadeIn>
            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">All set, {data.name || "friend"}?</h2>
                  <p className="text-sm text-muted-foreground">Confirm the details to enter Elder Mode.</p>
                </div>
              </div>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <Confirm label="Name" value={data.name} />
                <Confirm label="Age" value={String(data.age)} />
                <Confirm label="Language" value={LANGUAGES.find((l) => l.code === data.language)?.name ?? data.language} />
                <Confirm label="Region" value={`${data.regionState}, ${data.regionGroup}`} />
                <Confirm label="Interests" value={data.interests.join(", ") || "—"} />
                <Confirm label="Activities" value={data.preferredActivities.map((a) => CATEGORY_META[a].label).join(", ") || "—"} />
                <Confirm label="Caregiver" value={data.caregiverName ? `${data.caregiverName} (${data.caregiverRelation})` : "—"} />
              </dl>
            </Card>
          </FadeIn>
        )}

        {/* nav */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? setView("landing") : setStep(step - 1))}
            disabled={submitting}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? "Back to home" : "Back"}
          </Button>
          {step < total - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canContinue}
              className="gap-1.5 bg-primary text-primary-foreground"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => finish()}
              disabled={submitting}
              className="gap-1.5 bg-primary text-primary-foreground"
            >
              {submitting ? "Preparing…" : "Enter Elder Mode"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

function DemoButton({
  name,
  sub,
  onClick,
  disabled,
}: {
  name: string;
  sub: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white p-3 text-left transition-colors hover:border-emerald-400 disabled:opacity-60"
    >
      <div>
        <div className="font-medium text-foreground">{name}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-emerald-600" />
    </button>
  );
}

function Confirm({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  );
}
