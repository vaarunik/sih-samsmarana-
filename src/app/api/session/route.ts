// SAMSMARANA — session API
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionProfileId, clearSession } from "@/lib/session";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ profile: null });
  const p = await db.profile.findUnique({ where: { id } });
  if (!p) return NextResponse.json({ profile: null });
  return NextResponse.json({ profile: toProfile(p) });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}

export function toProfile(p: {
  id: string;
  role: string;
  name: string;
  age: number;
  language: string;
  regionGroup: string;
  regionState: string;
  interests: string;
  preferredActivities: string;
  caregiverName: string | null;
  caregiverRelation: string | null;
  familyName: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Profile {
  return {
    id: p.id,
    role: p.role as Profile["role"],
    name: p.name,
    age: p.age,
    language: p.language as Profile["language"],
    regionGroup: p.regionGroup,
    regionState: p.regionState,
    interests: safeArr(p.interests),
    preferredActivities: safeArr(p.preferredActivities) as Profile["preferredActivities"],
    caregiverName: p.caregiverName,
    caregiverRelation: p.caregiverRelation,
    familyName: p.familyName,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function safeArr(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
