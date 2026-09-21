"use client";

import {
  Brain,
  Eye,
  Focus,
  Hash,
  Puzzle,
  ListOrdered,
  Languages,
  Target,
  Compass,
  MapPin,
  WifiOff,
  Video,
  Heart,
  ShieldCheck,
  CalendarCheck,
  Route,
  Building2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Users,
  CloudOff,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroScrollReveal } from "@/components/ui/hero-scroll-video-pin-reveal";
import { Logo } from "./Logo";
import { Waves } from "./Waves";
import { BrandedHero } from "./BrandedHero";
import { FadeIn, AnimatedGroup, TextEffect, HoverLift } from "./motion";
import { useApp } from "@/lib/store";
import { CATEGORY_META } from "@/lib/activities-data";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Eye, Brain, Focus, Hash, Puzzle, ListOrdered, Languages, Target, Compass,
};

export function LandingView() {
  const setView = useApp((s) => s.setView);

  return (
    <main className="flex-1">
      {/* ── Branded opening hero (staggered entrance, balanced) ─────── */}
      <BrandedHero
        onGetStarted={() => setView("onboarding")}
        onExplore={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
      />

      {/* ── GSAP scroll-reveal (kinetic headline + pinned image) ────── */}
      <HeroScrollReveal
        topText={
          <>
            A little memory.
            <br />A little connection.
          </>
        }
        headingText={
          <>
            Familiar scenes, <br /> gently revealed.
          </>
        }
        tags={[
          { text: "Personalized", background: "oklch(0.46 0.09 162)", color: "#ffffff" },
          { text: "Culturally familiar", background: "oklch(0.60 0.07 190)", color: "#ffffff" },
          { text: "Offline-first", background: "oklch(0.93 0.03 165)", color: "#1b3a2a" },
          { text: "Elder-friendly", background: "oklch(0.34 0.05 240)", color: "#ffffff" },
        ]}
        subText="Every activity draws on the elder's language, region, interests and recent performance — adapting gently, never abruptly."
        imageSrc="/images/hero/hero.png"
        imageAlt="An elder's hands holding a tablet showing a family photograph, beside a brass lamp and a cup of tea"
        bottomText={
          <>
            Where every scroll feels
            <br />
            intentional
          </>
        }
      />

      {/* ── How it works ─────────────────────────────────── */}
      <Section id="how" eyebrow="How Samsmarana works" title="A calm, guided path to staying engaged">
        <AnimatedGroup className="grid gap-4 md:grid-cols-4">
          {[
            { n: "01", t: "Know the elder", d: "Name, age, language, region, state, interests and preferred activities." },
            { n: "02", t: "Personalize", d: "Familiar scenes, regional context and adaptive difficulty shape every activity." },
            { n: "03", t: "Engage", d: "Recognition, recall, attention, counting and more — with optional AI video." },
            { n: "04", t: "Observe & connect", d: "Caregivers see factual trends; families share warm moments." },
          ].map((s) => (
            <HoverLift key={s.n}>
              <Card className="h-full p-5">
                <div className="font-serif text-2xl font-semibold text-emerald-700">{s.n}</div>
                <h3 className="mt-2 font-medium text-foreground">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </Card>
            </HoverLift>
          ))}
        </AnimatedGroup>
      </Section>

      {/* ── Activities ───────────────────────────────────── */}
      <Section id="activities" eyebrow="Personalized cognitive activities" title="Nine active cognitive categories">
        <AnimatedGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(CATEGORY_META).map(([key, m]) => {
            const Icon = ICONS[m.icon] ?? Eye;
            return (
              <HoverLift key={key}>
                <Card className="flex h-full items-start gap-3 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground">{m.label}</h3>
                    <p className="text-sm text-muted-foreground">{m.blurb}</p>
                  </div>
                </Card>
              </HoverLift>
            );
          })}
        </AnimatedGroup>
      </Section>

      {/* ── Story Games Preview ──────────────────────────── */}
      <Section id="stories" eyebrow="Story Games" title="Short visual stories that feel like a film">
        <FadeIn>
          <p className="mb-6 max-w-2xl text-muted-foreground">
            Each story unfolds across 5–7 distinct scenes — every scene has its own
            realistic visual with subtle motion. Watch the story, then answer memory
            questions from what you remember.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-3 gap-0.5">
              {[
                { img: "/images/story/market/s1.png", label: "Arriving" },
                { img: "/images/story/market/s3.png", label: "Choosing" },
                { img: "/images/story/market/s7.png", label: "Leaving" },
              ].map((s, i) => (
                <div key={i} className="relative overflow-hidden">
                  { }
                  <img
                    src={s.img}
                    alt={`Story scene: ${s.label}`}
                    className="aspect-video w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-emerald-800 backdrop-blur">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-5">
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  A Morning at the Vegetable Market
                </h3>
                <p className="text-sm text-muted-foreground">7 scenes · Moderate · regionally adaptable</p>
              </div>
              <Badge className="bg-teal-100 text-teal-700">Story Game</Badge>
            </div>
          </Card>
        </FadeIn>
      </Section>

      {/* ── Regional ─────────────────────────────────────── */}
      <Section id="regional" eyebrow="Regional & cultural personalization" title="Familiarity, not tourism">
        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn>
            <Card className="h-full p-6">
              <MapPin className="h-6 w-6 text-emerald-700" />
              <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">
                North Eastern Region, and beyond
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Region and state are stored separately — Assam, Arunachal Pradesh,
                Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura — so activities
                reflect familiar everyday environments, food, markets and nature.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Assam", "Manipur", "Meghalaya", "Karnataka", "Tamil Nadu"].map((s) => (
                  <Badge key={s} variant="secondary" className="bg-emerald-50 text-emerald-700">
                    {s}
                  </Badge>
                ))}
              </div>
            </Card>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Card className="h-full p-6">
              <Languages className="h-6 w-6 text-teal-700" />
              <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">
                Five languages, independent of region
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                English, Kannada, Hindi, Tamil and Telugu. Region and language are
                independent — Assam + English and Karnataka + Kannada are both valid.
                The device locale is only ever a suggestion.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["English", "ಕನ್ನಡ", "हिन्दी", "தமிழ்", "తెలుగు"].map((s) => (
                  <Badge key={s} variant="secondary" className="bg-teal-50 text-teal-700">
                    {s}
                  </Badge>
                ))}
              </div>
            </Card>
          </FadeIn>
        </div>
      </Section>

      {/* ── Adaptive ─────────────────────────────────────── */}
      <Section id="adaptive" eyebrow="Adaptive experiences" title="Difficulty that changes gradually">
        <FadeIn>
          <Card className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { t: "Strong performance", d: "Slightly increase difficulty.", i: RefreshCw },
                { t: "Stable", d: "Maintain the current level.", i: Target },
                { t: "Repeated difficulty", d: "Simplify, gently.", i: Heart },
              ].map((c) => (
                <div key={c.t} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <c.i className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <div className="font-medium text-foreground">{c.t}</div>
                    <div className="text-sm text-muted-foreground">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Changes use accuracy, response time, completion, skips and recent
              performance. They are gradual and never diagnostic.
            </p>
          </Card>
        </FadeIn>
      </Section>

      {/* ── AI Video (Coming Soon) ─────────────────────── */}
      <Section id="video" eyebrow="AI-powered cognitive video" title="Personalized memory videos, coming soon">
        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn>
            <Card className="h-full overflow-hidden p-0">
              <div className="relative aspect-video">
                { }
                <img src="/images/activities/market.png" alt="Preview of a personalized memory video scene" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                <Waves className="absolute inset-x-0 bottom-0 h-20 w-full opacity-30 text-white" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-emerald-700 shadow-lift">
                    <Video className="h-7 w-7" />
                  </div>
                  <Badge className="mt-4 bg-amber-400 px-3 py-1 text-sm font-semibold text-amber-950">Coming Soon</Badge>
                </div>
                <div className="absolute bottom-3 left-3 rounded-md bg-black/40 px-2 py-1 text-xs text-white backdrop-blur">
                  Personalized memory video
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-medium text-foreground">Personalized Memory Videos</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI-generated personalized videos designed to support memory recall
                  and cognitive engagement — tailored to each elder&apos;s interests,
                  language and region.
                </p>
              </div>
            </Card>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Card className="h-full p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">
                Designed for gentle, reliable engagement
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {[
                  "Calm, realistic scenes tailored to familiar everyday experiences.",
                  "Paired with cognitive questions to support memory recall.",
                  "Built to complement the visual activities that work today.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                This feature is coming soon. The visual cognitive activities work fully today.
              </p>
            </Card>
          </FadeIn>
        </div>
      </Section>

      {/* ── Offline ──────────────────────────────────────── */}
      <Section id="offline" eyebrow="Offline-first support" title="Works without the internet">
        <FadeIn>
          <Card className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <WifiOff className="h-6 w-6 text-emerald-700" />
                <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">
                  Activities, scoring and records — even offline
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Core activities remain available offline, while activity records
                  created without connectivity are securely synchronized with the
                  backend when a connection returns. Previously generated videos can
                  also be replayed offline.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  ["Offline", "Records saved locally", CloudOff],
                  ["Syncing…", "Queue draining", RefreshCw],
                  ["Synced", "Backend updated", CheckCircle2],
                ].map(([label, desc, Icon]) => {
                  const I = Icon as typeof CloudOff;
                  return (
                    <div key={label as string} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-700">
                        <I className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="text-sm font-medium text-foreground">{label}</div>
                        <div className="text-xs text-muted-foreground">{desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </FadeIn>
      </Section>

      {/* ── Caregiver & Family ───────────────────────────── */}
      <Section id="care" eyebrow="Caregiver support & family engagement" title="Meaningful, non-diagnostic visibility">
        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn>
            <Card className="h-full p-6">
              <Target className="h-6 w-6 text-emerald-700" />
              <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">Caregiver dashboard</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Factual observations: completion, accuracy, response time, trends,
                reminders and offline sync status. No diagnosis — only engagement signals.
              </p>
            </Card>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Card className="h-full p-6">
              <Users className="h-6 w-6 text-teal-700" />
              <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">Family engagement</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A warm, separate space for messages, voice notes, familiar photos,
                short clips, occasion messages and shared memories.
              </p>
            </Card>
          </FadeIn>
        </div>
      </Section>

      {/* ── Privacy ──────────────────────────────────────── */}
      <Section id="privacy" eyebrow="Privacy & security" title="Minimal data, role-based access">
        <FadeIn>
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { t: "Role-based access", d: "Elder, caregiver and family roles with scoped permissions." },
                { t: "Server-side keys", d: "The Gemini API key never reaches the browser or Git." },
                { t: "Secure sync", d: "Idempotent offline sync — no duplicate records, no data loss." },
              ].map((c) => (
                <div key={c.t} className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <div>
                    <div className="font-medium text-foreground">{c.t}</div>
                    <div className="text-sm text-muted-foreground">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>
      </Section>

      {/* ── Validation ───────────────────────────────────── */}
      <Section id="validation" eyebrow="Proposed validation" title="How we plan to measure impact">
        <FadeIn>
          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Engagement", "Activity completion and daily streak over 4–8 weeks."],
                ["Adaptive response", "Stability of difficulty and reduced skips."],
                ["Caregiver confidence", "Survey on clarity and usefulness of insights."],
                ["Cultural fit", "Field notes from NER and South India elders."],
              ].map(([t, d]) => (
                <div key={t} className="flex items-start gap-3">
                  <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                  <div>
                    <div className="font-medium text-foreground">{t}</div>
                    <div className="text-sm text-muted-foreground">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>
      </Section>

      {/* ── Roadmap ──────────────────────────────────────── */}
      <Section id="roadmap" eyebrow="Roadmap" title="What's active and what's coming">
        <div className="grid gap-6 lg:grid-cols-3">
          <FadeIn>
            <Card className="h-full p-6">
              <Badge className="bg-emerald-100 text-emerald-700">Active now</Badge>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {["Elder & caregiver modes", "9 cognitive activities", "5 languages + NER", "Gemini/Veo video", "Offline-first + sync", "Family engagement"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {t}
                  </li>
                ))}
              </ul>
            </Card>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Card className="h-full p-6">
              <Badge className="bg-amber-100 text-amber-700">Upcoming</Badge>
              <p className="mt-3 font-medium text-foreground">Music &amp; familiar stimuli</p>
              <ul className="mt-1 space-y-1.5 text-sm text-muted-foreground">
                {["Familiar songs", "Nature sounds", "Regional music", "Everyday sounds"].map((t) => (
                  <li key={t}>· {t}</li>
                ))}
              </ul>
            </Card>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Card className="h-full p-6" id="healthcare">
              <Route className="h-5 w-5 text-sky-700" />
              <Badge variant="outline" className="mt-2 text-sky-700">Future</Badge>
              <p className="mt-3 font-medium text-foreground">Healthcare / Institution</p>
              <ul className="mt-1 space-y-1.5 text-sm text-muted-foreground">
                {["Hospitals & NGOs", "Elder-care centres", "Institutional dashboards", "Aggregated activity data"].map((t) => (
                  <li key={t}>· {t}</li>
                ))}
              </ul>
            </Card>
          </FadeIn>
        </div>
      </Section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <Section id="cta" eyebrow="" title="">
        <FadeIn>
          <Card className="relative overflow-hidden p-8 text-center sm:p-12">
            <div className="absolute inset-0 bg-aurora opacity-70" />
            <div className="relative">
              <Building2 className="mx-auto h-8 w-8 text-emerald-700" />
              <h2 className="mt-3 font-serif text-3xl font-semibold text-foreground text-balance">
                Begin a familiar, engaging routine
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                A calm, premium, human-centered platform for older adults, caregivers and families.
              </p>
              <Button
                size="lg"
                className="mt-6 gap-2 bg-primary text-primary-foreground"
                onClick={() => setView("onboarding")}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </FadeIn>
      </Section>
    </main>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
      {(eyebrow || title) && (
        <FadeIn className="mb-8 max-w-2xl">
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {eyebrow}
            </div>
          )}
          {title && (
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
              {title}
            </h2>
          )}
        </FadeIn>
      )}
      {children}
    </section>
  );
}
