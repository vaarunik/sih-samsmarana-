// SAMSMARANA — start a real Veo video generation (server-only).
// Reads GEMINI_API_KEY from the environment. If the key is missing or
// Veo rejects the request, returns a clean "unavailable" status so the
// client can fall back to a standard cognitive activity.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionProfileId } from "@/lib/session";
import { startVideoGeneration, isVeoAvailable } from "@/lib/gemini";
import { buildVideoPrompt } from "@/lib/prompt-builder";
import { buildQuestions } from "@/lib/questions";
import { activityById } from "@/lib/activities-data";
import type { ActivityCategory, Question, SceneKey } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const profileId = await getSessionProfileId();
  if (!profileId) {
    return NextResponse.json({ message: "Session required." }, { status: 401 });
  }

  let body: { activityId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const activityId = body.activityId;
  if (!activityId) {
    return NextResponse.json({ message: "activityId is required." }, { status: 400 });
  }

  const activity = activityById(activityId);
  if (!activity) {
    return NextResponse.json({ message: "Activity not found." }, { status: 404 });
  }

  const profile = await db.profile.findUnique({ where: { id: profileId } });
  if (!profile) {
    return NextResponse.json({ message: "Profile not found." }, { status: 404 });
  }

  const prompt = buildVideoPrompt({
    profile: {
      language: profile.language as never,
      regionGroup: profile.regionGroup,
      regionState: profile.regionState,
      interests: safeParse(profile.interests),
      name: profile.name,
    },
    activity: {
      title: activity.title,
      scene: activity.scene,
      category: activity.category,
      difficulty: activity.difficulty,
    },
  });

  const questions: Question[] = buildQuestions(
    activity.scene as SceneKey,
    activity.category as ActivityCategory,
    activity.difficulty
  );

  // If the key is missing, persist an "unavailable" record so the UI can
  // show the clean fallback and the user can continue with a standard activity.
  if (!isVeoAvailable()) {
    const row = await db.videoGeneration.create({
      data: {
        profileId,
        activityId,
        category: activity.category,
        prompt,
        model: process.env.VEO_MODEL || "veo-3.0-generate-001",
        operationId: null,
        status: "unavailable",
        questions: JSON.stringify(questions),
        message:
          "Video generation is temporarily unavailable. You can continue with a standard activity.",
      },
    });
    return NextResponse.json({
      id: row.id,
      status: "unavailable",
      message: row.message,
      questions,
    });
  }

  const started = await startVideoGeneration(prompt);
  if (!started.ok || !started.operationId) {
    const row = await db.videoGeneration.create({
      data: {
        profileId,
        activityId,
        category: activity.category,
        prompt,
        model: started.model,
        operationId: null,
        status: "failed",
        questions: JSON.stringify(questions),
        message:
          started.message ||
          "Video generation is temporarily unavailable. You can continue with a standard activity.",
      },
    });
    return NextResponse.json({
      id: row.id,
      status: "failed",
      message: row.message,
      questions,
    });
  }

  const row = await db.videoGeneration.create({
    data: {
      profileId,
      activityId,
      category: activity.category,
      prompt,
      model: started.model,
      operationId: started.operationId,
      status: "generating",
      questions: JSON.stringify(questions),
    },
  });

  return NextResponse.json({
    id: row.id,
    status: "generating",
    operationId: started.operationId,
    model: started.model,
    questions,
    promptPreview: prompt.slice(0, 160),
  });
}

function safeParse(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
