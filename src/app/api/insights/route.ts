// SAMSMARANA — caregiver insights API
// Returns aggregated, factual, non-diagnostic performance observations.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionProfileId } from "@/lib/session";
import { buildInsights } from "@/lib/adaptive";
import type { AttemptRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ insights: [], metrics: null });

  const rows = await db.attempt.findMany({
    where: { profileId: id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const attempts: AttemptRecord[] = rows.map((r) => ({
    id: r.id, profileId: r.profileId, activityId: r.activityId,
    category: r.category as AttemptRecord["category"], title: r.title,
    difficulty: r.difficulty, accuracy: r.accuracy, responseMs: r.responseMs,
    completed: r.completed, skipped: r.skipped, score: r.score,
    syncState: r.syncState as "synced" | "pending", syncId: r.syncId,
    createdAt: r.createdAt.toISOString(),
  }));

  const completed = attempts.filter((a) => a.completed);
  const metrics = {
    totalAttempts: attempts.length,
    totalCompleted: completed.length,
    avgAccuracy: avgPct(completed.map((a) => a.accuracy)),
    avgResponseMs: avg(completed.map((a) => a.responseMs)),
    pendingSync: attempts.filter((a) => a.syncState === "pending").length,
    streak: computeStreak(completed),
    byCategory: byCategory(completed),
    last7: last7Days(attempts),
    recent: attempts.slice(0, 12),
  };

  return NextResponse.json({ insights: buildInsights(attempts), metrics });
}

function avg(xs: number[]): number {
  if (!xs.length) return 0;
  return Math.round(xs.reduce((s, x) => s + x, 0) / xs.length);
}

/** average of 0..1 accuracies, returned as a 0..100 percentage */
function avgPct(xs: number[]): number {
  if (!xs.length) return 0;
  return Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 100);
}

function byCategory(attempts: AttemptRecord[]) {
  const map = new Map<string, { count: number; acc: number[]; rt: number[] }>();
  for (const a of attempts) {
    const e = map.get(a.category) ?? { count: 0, acc: [], rt: [] };
    e.count++;
    e.acc.push(a.accuracy);
    e.rt.push(a.responseMs);
    map.set(a.category, e);
  }
  return Array.from(map.entries()).map(([cat, e]) => ({
    category: cat,
    count: e.count,
    avgAccuracy: avgPct(e.acc),
    avgResponseMs: avg(e.rt),
  }));
}

function last7Days(attempts: AttemptRecord[]) {
  const days: { date: string; completed: number; accuracy: number[] }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const dayAttempts = attempts.filter(
      (a) => new Date(a.createdAt).toDateString() === key && a.completed
    );
    days.push({
      date: d.toLocaleDateString("en-US", { weekday: "short" }),
      completed: dayAttempts.length,
      accuracy: dayAttempts.map((a) => a.accuracy),
    });
  }
  return days.map((d) => ({
    date: d.date,
    completed: d.completed,
    avgAccuracy: avgPct(d.accuracy),
  }));
}

function computeStreak(completed: AttemptRecord[]): number {
  if (!completed.length) return 0;
  const days = new Set(completed.map((a) => new Date(a.createdAt).toDateString()));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
