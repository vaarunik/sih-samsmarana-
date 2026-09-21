"use client";

import { ArrowRight, Sparkles, Lock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "./BackButton";
import { useApp } from "@/lib/store";
import { SCENE_META } from "@/lib/activities-data";
import type { ActivityTemplate } from "@/lib/activities-data";

/**
 * Personalized Memory Videos — COMING SOON.
 *
 * The real Veo generation infrastructure (src/lib/gemini.ts, /api/video/*)
 * is kept intact but deliberately not triggered from the UI. This screen
 * presents the feature as intentionally planned — no spinners, no errors,
 * no "unavailable" messaging, no API calls.
 */
export function VideoComingSoon({
  activity,
  onExit,
  onUseStandard,
}: {
  activity: ActivityTemplate;
  onExit: () => void;
  onUseStandard: () => void;
}) {
  const profile = useApp((s) => s.profile);
  const scene = SCENE_META[activity.scene];

  return (
    <main className="flex-1 bg-muted/20">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <BackButton label="Back to activities" onClick={onExit} />

        <div className="mt-4">
          <Badge className="bg-amber-100 text-amber-800">
            <Sparkles className="mr-1 h-3 w-3" /> Coming Soon
          </Badge>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
            Personalized Memory Videos
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            AI-generated personalized videos designed to support memory recall
            and cognitive engagement — tailored to each elder&apos;s interests,
            language and region.
          </p>
        </div>

        {/* Calm locked preview — intentional, not broken */}
        <Card className="mt-5 overflow-hidden p-0">
          <div className="relative">
            { }
            <img
              src={scene.image}
              alt={`${scene.label} preview`}
              className="aspect-video w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-emerald-700 shadow-lift">
                <PlayCircle className="h-10 w-10" />
              </div>
              <Badge className="mt-4 bg-amber-400/95 px-4 py-1.5 text-sm font-semibold text-amber-950">
                Coming Soon
              </Badge>
              <p className="mt-2 text-center text-white/90">
                Personalized memory videos for {profile?.regionState ?? "your region"}
              </p>
            </div>
            {/* subtle locked state, top-right */}
            <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              <Lock className="h-3.5 w-3.5" /> Coming soon
            </div>
          </div>
          <div className="border-t border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
            A calm, realistic visual experience — designed for gentle cognitive engagement.
          </div>
        </Card>

        {/* Working visual activity */}
        <Card className="mt-6 p-6">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            For now, try the visual activity
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This {scene.label.toLowerCase()} activity works fully today — look carefully, then
            answer the questions.
          </p>
          <Button
            size="lg"
            className="mt-4 h-14 min-w-[180px] gap-2.5 rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
            onClick={onUseStandard}
          >
            Start visual activity
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Card>
      </div>
    </main>
  );
}
