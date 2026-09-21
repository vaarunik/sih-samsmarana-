// SAMSMARANA — reminders API

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionProfileId } from "@/lib/session";
import type { ReminderItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ reminders: [] });
  const rows = await db.reminder.findMany({
    where: { profileId: id },
    orderBy: { time: "asc" },
  });
  return NextResponse.json({ reminders: rows.map(toReminder) });
}

export async function POST(req: Request) {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ message: "Session required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.title || !body.type) {
    return NextResponse.json({ message: "title and type required." }, { status: 400 });
  }
  const created = await db.reminder.create({
    data: {
      profileId: id,
      type: body.type,
      title: body.title,
      time: body.time || "09:00",
      days: JSON.stringify(body.days ?? []),
      enabled: body.enabled ?? true,
    },
  });
  return NextResponse.json({ reminder: toReminder(created) });
}

export async function PATCH(req: Request) {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ message: "Session required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ message: "id required." }, { status: 400 });
  const updated = await db.reminder.update({
    where: { id: body.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.time !== undefined ? { time: body.time } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.days !== undefined ? { days: JSON.stringify(body.days) } : {}),
      ...(body.enabled !== undefined ? { enabled: body.enabled } : {}),
    },
  });
  return NextResponse.json({ reminder: toReminder(updated) });
}

export async function DELETE(req: Request) {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ message: "Session required." }, { status: 401 });
  const rid = new URL(req.url).searchParams.get("id");
  if (!rid) return NextResponse.json({ message: "id required." }, { status: 400 });
  await db.reminder.delete({ where: { id: rid } });
  return NextResponse.json({ ok: true });
}

function toReminder(r: {
  id: string; profileId: string; type: string; title: string;
  time: string; days: string; enabled: boolean; createdAt: Date;
}): ReminderItem {
  let days: string[] = [];
  try {
    const v = JSON.parse(r.days);
    if (Array.isArray(v)) days = v.map(String);
  } catch {}
  return {
    id: r.id,
    profileId: r.profileId,
    type: r.type as ReminderItem["type"],
    title: r.title,
    time: r.time,
    days,
    enabled: r.enabled,
    createdAt: r.createdAt.toISOString(),
  };
}
