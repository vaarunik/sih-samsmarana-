// SAMSMARANA — poll a Veo video generation (server-only).
// Downloads the real video bytes server-side and serves the saved file
// from /generated/*.mp4. The API key never appears in the response.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionProfileId } from "@/lib/session";
import { pollVideoGeneration, isVeoAvailable } from "@/lib/gemini";
import type { Question } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const profileId = await getSessionProfileId();
  if (!profileId) {
    return NextResponse.json({ message: "Session required." }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "id is required." }, { status: 400 });
  }

  // The client polls by the Veo operationId; direct status checks may use the
  // DB record id. Resolve either way (operationId first, then record id).
  const row = await db.videoGeneration.findFirst({
    where: { profileId, OR: [{ operationId: id }, { id }] },
  });
  if (!row) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const questions: Question[] = safeParseQ(row.questions);

  // Terminal states — return immediately.
  if (row.status === "ready") {
    return NextResponse.json({
      id: row.id,
      status: "ready",
      videoUrl: row.videoUrl,
      questions,
    });
  }
  if (row.status === "failed" || row.status === "unavailable") {
    return NextResponse.json({
      id: row.id,
      status: row.status,
      message: row.message,
      questions,
    });
  }

  // No operation id => cannot poll (key was missing at creation time).
  if (!row.operationId) {
    return NextResponse.json({
      id: row.id,
      status: "unavailable",
      message:
        "Video generation is temporarily unavailable. You can continue with a standard activity.",
      questions,
    });
  }

  if (!isVeoAvailable()) {
    await db.videoGeneration.update({
      where: { id },
      data: {
        status: "unavailable",
        message:
          "Video generation is temporarily unavailable. You can continue with a standard activity.",
      },
    });
    return NextResponse.json({
      id: row.id,
      status: "unavailable",
      message:
        "Video generation is temporarily unavailable. You can continue with a standard activity.",
      questions,
    });
  }

  const result = await pollVideoGeneration(row.operationId, {
    downloadToId: row.id,
    questions,
  });

  if (result.status === "ready") {
    const updated = await db.videoGeneration.update({
      where: { id },
      data: { status: "ready", videoUrl: result.videoUrl },
    });
    return NextResponse.json({
      id: updated.id,
      status: "ready",
      videoUrl: updated.videoUrl,
      questions,
    });
  }

  if (result.status === "failed") {
    await db.videoGeneration.update({
      where: { id },
      data: { status: "failed", message: result.message },
    });
    return NextResponse.json({
      id: row.id,
      status: "failed",
      message: result.message,
      questions,
    });
  }

  // preparing / generating — keep polling
  return NextResponse.json({
    id: row.id,
    status: result.status,
    questions,
  });
}

function safeParseQ(s: string): Question[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
