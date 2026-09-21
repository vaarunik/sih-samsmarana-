// SAMSMARANA — stimulus selection API
//
// Returns a fresh, per-user stimulus (scene) for a given activity type,
// excluding any stimulus shown to this user for this activity in the last
// CONTENT_COOLDOWN_DAYS (30). The client uses the stimulus image + the
// grounded questions generated from that exact stimulus.
//
// POST /api/stimulus  { activityType, difficulty }
// → { stimulusId, image, label, questions, recentlyUsed }
//
// The questions are generated server-side from the selected stimulus's
// content pack and validated by the deterministic validator before being
// returned — so no hallucinated/unanswerable question ever reaches the UI.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionProfileId } from "@/lib/session";
import { selectStimulus, recentStimuli, CONTENT_COOLDOWN_DAYS } from "@/lib/content-rotation";
import { buildQuestions, stimulusEvidence, validateQuestion, sceneObjects } from "@/lib/questions";
import { SCENE_META } from "@/lib/activities-data";
import type { ActivityCategory, SceneKey, Question } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const profileId = await getSessionProfileId();
  if (!profileId) {
    return NextResponse.json({ message: "Session required." }, { status: 401 });
  }

  let body: { activityType?: string; difficulty?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const activityType = body.activityType;
  const difficulty = Number(body.difficulty) || 2;
  if (!activityType) {
    return NextResponse.json({ message: "activityType is required." }, { status: 400 });
  }

  // Select a fresh stimulus (30-day cooldown per user+activity).
  const stimulusId = await selectStimulus(profileId, activityType);
  const scene = stimulusId as SceneKey;
  const meta = SCENE_META[scene];

  // Generate grounded questions from the EXACT selected stimulus.
  const questions: Question[] = buildQuestions(scene, activityType as ActivityCategory, difficulty, {
    minQuestions: 3,
    maxQuestions: 5,
  });

  // Double-check: validate every question against this stimulus's evidence.
  // (buildQuestions already does this, but we re-validate here for defense in
  // depth — any invalid question is filtered out before reaching the UI.)
  const ev = stimulusEvidence(scene);
  const validQuestions = questions.filter((q) => validateQuestion(q, ev).ok);

  // Recent stimuli for this user+activity (for the freshness indicator).
  const recent = await recentStimuli(profileId, activityType, 6);

  return NextResponse.json({
    stimulusId,
    image: meta.image,
    label: meta.label,
    setting: meta.setting,
    objects: sceneObjects(scene),
    questions: validQuestions,
    cooldownDays: CONTENT_COOLDOWN_DAYS,
    recentlyUsed: recent.map((r) => ({
      stimulusId: r.stimulusId,
      shownAt: r.shownAt.toISOString(),
      completed: !!r.completedAt,
    })),
  });
}

/** Mark a stimulus as completed (called when the elder finishes the activity). */
export async function PATCH(req: Request) {
  const profileId = await getSessionProfileId();
  if (!profileId) {
    return NextResponse.json({ message: "Session required." }, { status: 401 });
  }
  let body: { activityType?: string; stimulusId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  if (!body.activityType || !body.stimulusId) {
    return NextResponse.json({ message: "activityType and stimulusId required." }, { status: 400 });
  }
  const { completeStimulus } = await import("@/lib/content-rotation");
  await completeStimulus(profileId, body.activityType, body.stimulusId);
  return NextResponse.json({ ok: true });
}
