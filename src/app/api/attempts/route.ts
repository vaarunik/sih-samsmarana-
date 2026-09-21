// SAMSMARANA — attempts API (offline sync target, idempotent via syncId)

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionProfileId } from "@/lib/session";
import type { AttemptRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ attempts: [] });
  const rows = await db.attempt.findMany({
    where: { profileId: id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ attempts: rows.map(toAttempt) });
}

export async function POST(req: Request) {
  const id = await getSessionProfileId();
  if (!id) {
    return NextResponse.json({ message: "Session required." }, { status: 401 });
  }
  let body: Partial<AttemptRecord>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  if (!body.syncId) {
    return NextResponse.json({ message: "syncId is required." }, { status: 400 });
  }

  // Idempotent: if a record with this syncId exists, just mark synced.
  const existing = await db.attempt.findUnique({ where: { syncId: body.syncId } });
  if (existing) {
    const updated = await db.attempt.update({
      where: { syncId: body.syncId },
      data: { syncState: "synced" },
    });
    return NextResponse.json({ attempt: toAttempt(updated) });
  }

  const created = await db.attempt.create({
    data: {
      profileId: id,
      activityId: body.activityId || "unknown",
      category: body.category || "recognition",
      title: body.title || "Activity",
      difficulty: Number(body.difficulty) || 1,
      accuracy: Number(body.accuracy) || 0,
      responseMs: Number(body.responseMs) || 0,
      completed: !!body.completed,
      skipped: !!body.skipped,
      score: Number(body.score) || 0,
      syncState: "synced",
      syncId: body.syncId,
      stimulusId: body.stimulusId || null,
    },
  });
  return NextResponse.json({ attempt: toAttempt(created) });
}

function toAttempt(r: {
  id: string; profileId: string; activityId: string; category: string;
  title: string; difficulty: number; accuracy: number; responseMs: number;
  completed: boolean; skipped: boolean; score: number; syncState: string;
  syncId: string; createdAt: Date; stimulusId?: string | null;
}): AttemptRecord {
  return {
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
    stimulusId: r.stimulusId ?? undefined,
  };
}
