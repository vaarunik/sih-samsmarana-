// SAMSMARANA — profile API (settings)

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionProfileId } from "@/lib/session";
import { toProfile } from "@/app/api/session/route";
import type { ActivityCategory, LanguageCode } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ profile: null });
  const p = await db.profile.findUnique({ where: { id } });
  return NextResponse.json({ profile: p ? toProfile(p) : null });
}

export async function PATCH(req: Request) {
  const id = await getSessionProfileId();
  if (!id) return NextResponse.json({ message: "Session required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const updated = await db.profile.update({
    where: { id },
    data: {
      ...(body.name ? { name: String(body.name) } : {}),
      ...(body.age ? { age: Number(body.age) } : {}),
      ...(body.language ? { language: body.language as LanguageCode } : {}),
      ...(body.regionGroup ? { regionGroup: String(body.regionGroup) } : {}),
      ...(body.regionState ? { regionState: String(body.regionState) } : {}),
      ...(body.interests
        ? { interests: JSON.stringify(body.interests) }
        : {}),
      ...(body.preferredActivities
        ? {
            preferredActivities: JSON.stringify(
              body.preferredActivities as ActivityCategory[]
            ),
          }
        : {}),
    },
  });
  return NextResponse.json({ profile: toProfile(updated) });
}
