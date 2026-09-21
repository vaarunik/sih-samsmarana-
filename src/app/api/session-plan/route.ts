// SAMSMARANA — session-plan API
// Returns a fresh, adaptive 3-activity session plan based on the elder's
// recent performance. Rotates categories across sessions (anti-repetition),
// reinforces weak skills, and adapts difficulty per skill.
//
// Also returns recent activityIds + categories so the client can avoid
// repeating the same activity combination, and a lightweight "recent
// question subjects" hint (derived from recent attempt titles/categories)
// to reduce near-duplicate questions.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionProfileId } from "@/lib/session";
import { planSession } from "@/lib/adaptive";
import type { ActivityCategory, AttemptRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = await getSessionProfileId();
  if (!id) {
    return NextResponse.json({ plan: null, recent: { categories: [], activityIds: [] } });
  }

  const rows = await db.attempt.findMany({
    where: { profileId: id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const attempts: AttemptRecord[] = rows.map((r) => ({
    id: r.id,
    profileId: r.profileId,
    activityId: r.activityId,
    category: r.category as AttemptRecord["category"],
    title: r.title,
    difficulty: r.difficulty,
    accuracy: r.accuracy,
    responseMs: r.responseMs,
    completed: r.completed,
    skipped: r.skipped,
    score: r.score,
    syncState: r.syncState as "synced" | "pending",
    syncId: r.syncId,
    createdAt: r.createdAt.toISOString(),
  }));

  // Recent categories (most-recent first) for rotation/anti-repetition.
  const recentCategories: ActivityCategory[] = [];
  const seenCat = new Set<ActivityCategory>();
  for (const a of attempts) {
    if (!seenCat.has(a.category)) {
      recentCategories.push(a.category);
      seenCat.add(a.category);
    }
    if (recentCategories.length >= 6) break;
  }

  // Recent activityIds (to avoid re-launching the exact same activity card).
  const recentActivityIds = attempts.slice(0, 8).map((a) => a.activityId);

  const plan = planSession(attempts, recentCategories);

  return NextResponse.json({
    plan,
    recent: { categories: recentCategories, activityIds: recentActivityIds },
  });
}
