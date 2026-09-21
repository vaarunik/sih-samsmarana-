"use client";

import { useEffect } from "react";
import { Header } from "@/components/samsmarana/Header";
import { Footer } from "@/components/samsmarana/Footer";
import { Logo } from "@/components/samsmarana/Logo";
import { LandingView } from "@/components/samsmarana/LandingView";
import { OnboardingView } from "@/components/samsmarana/OnboardingView";
import { ElderView } from "@/components/samsmarana/ElderView";
import { CaregiverView } from "@/components/samsmarana/CaregiverView";
import { FamilyView } from "@/components/samsmarana/FamilyView";
import { useApp } from "@/lib/store";
import {
  idbCacheProfile,
  idbCacheReminders,
  idbCacheFamily,
  idbGetAttempts,
} from "@/lib/idb";
import { syncPending } from "@/lib/sync";
import type { AttemptRecord, Profile, ReminderItem, FamilyMessageItem } from "@/lib/types";

export default function Home() {
  const view = useApp((s) => s.view);
  const profile = useApp((s) => s.profile);
  const loadingProfile = useApp((s) => s.loadingProfile);
  const setProfile = useApp((s) => s.setProfile);
  const setLoadingProfile = useApp((s) => s.setLoadingProfile);
  const setAttempts = useApp((s) => s.setAttempts);
  const setReminders = useApp((s) => s.setReminders);
  const setFamily = useApp((s) => s.setFamily);
  const setView = useApp((s) => s.setView);

  useOfflineCache();

  // Restore session on first load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.profile) {
          setProfile(data.profile);
          setView("elder");
          await hydrate(data.profile.id);
        } else {
          await loadOfflineCache();
        }
      } catch {
        await loadOfflineCache();
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function hydrate(profileId: string) {
    try {
      const [att, rem, fam] = await Promise.all([
        fetch("/api/attempts", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/reminders", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/family", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setAttempts(att.attempts ?? []);
      setReminders(rem.reminders ?? []);
      setFamily(fam.messages ?? []);
      // merge with any offline-only attempts
      const local = await idbGetAttempts().catch(() => [] as AttemptRecord[]);
      if (local.length) {
        const known = new Set((att.attempts ?? []).map((a: AttemptRecord) => a.syncId));
        const extra = local.filter((a) => !known.has(a.syncId));
        if (extra.length) setAttempts([...(att.attempts ?? []), ...extra]);
      }
      void syncPending();
    } catch {
      await loadOfflineCache();
    }
  }

  async function loadOfflineCache() {
    const idb = await import("@/lib/idb");
    const [p, r, f, a] = await Promise.all([
      idb.idbGetCachedProfile(),
      idb.idbGetCachedReminders(),
      idb.idbGetCachedFamily(),
      idbGetAttempts().catch(() => [] as AttemptRecord[]),
    ]);
    if (p) {
      setProfile(p as Profile);
      setView("elder");
    }
    if (r) setReminders(r as ReminderItem[]);
    if (f) setFamily(f as FamilyMessageItem[]);
    if (a.length) setAttempts(a);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      {view === "landing" && <LandingView />}
      {view === "onboarding" && <OnboardingView />}
      {view === "elder" && profile && <ElderView />}
      {view === "caregiver" && profile && <CaregiverView />}
      {view === "family" && profile && <FamilyView />}
      {((view === "elder" || view === "caregiver" || view === "family") && !profile) && (
        <LandingView />
      )}
      <Footer
        onNavigate={(id) => {
          if (view !== "landing") {
            setView("landing");
            setTimeout(() => {
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          } else {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />
    </div>
  );
}

/** Cache profile + data for offline use (module-level effect-free helpers). */
export function useOfflineCache() {
  const profile = useApp((s) => s.profile);
  const reminders = useApp((s) => s.reminders);
  const family = useApp((s) => s.family);
  useEffect(() => {
    if (profile) idbCacheProfile(profile).catch(() => {});
  }, [profile]);
  useEffect(() => {
    idbCacheReminders(reminders).catch(() => {});
  }, [reminders]);
  useEffect(() => {
    idbCacheFamily(family).catch(() => {});
  }, [family]);
}
