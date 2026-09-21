// SAMSMARANA — activities API
// Returns the activity library plus an adaptive recommendation based
// on the elder's recent performance.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionProfileId } from "@/lib/session";
import { ACTIVITIES, CATEGORY_META } from "@/lib/activities-data";
import { recommend } from "@/lib/adaptive";
import type { AttemptRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = await getSessionProfileId();
  let attempts: AttemptRecord[] = [];
  if (id) {
    const rows = await db.attempt.findMany({
      where: { profileId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    attempts = rows.map((r) => ({
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
  }

  const rec = recommend(attempts);
  return NextResponse.json({
    activities: ACTIVITIES,
    categories: CATEGORY_META,
    recommendation: rec,
  });
}
