// SAMSMARANA — family engagement API

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionProfileId } from "@/lib/session";
import type { FamilyMessageItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ messages: [] });
  const rows = await db.familyMessage.findMany({
    where: { profileId: id },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  return NextResponse.json({ messages: rows.map(toMsg) });
}

export async function POST(req: Request) {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ message: "Session required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.content) {
    return NextResponse.json({ message: "content required." }, { status: 400 });
  }
  const created = await db.familyMessage.create({
    data: {
      profileId: id,
      fromName: body.fromName || "Family",
      type: body.type || "text",
      content: body.content,
      caption: body.caption || null,
    },
  });
  return NextResponse.json({ message: toMsg(created) });
}

export async function DELETE(req: Request) {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ message: "Session required." }, { status: 401 });
  const mid = new URL(req.url).searchParams.get("id");
  if (!mid) return NextResponse.json({ message: "id required." }, { status: 400 });
  await db.familyMessage.delete({ where: { id: mid } });
  return NextResponse.json({ ok: true });
}

function toMsg(r: {
  id: string; profileId: string; fromName: string; type: string;
  content: string; caption: string | null; createdAt: Date;
}): FamilyMessageItem {
  return {
    id: r.id,
    profileId: r.profileId,
    fromName: r.fromName,
    type: r.type as FamilyMessageItem["type"],
    content: r.content,
    caption: r.caption,
    createdAt: r.createdAt.toISOString(),
  };
}
