// SAMSMARANA — onboarding API
// Creates an elder profile (or a demo profile) and issues a session.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSession } from "@/lib/session";
import { toProfile } from "@/app/api/session/route";
import { seedFamilyForProfile } from "@/lib/seed";
import type { OnboardingData, ActivityCategory, LanguageCode } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMOS: Record<
  string,
  {
    name: string;
    age: number;
    language: LanguageCode;
    regionGroup: string;
    regionState: string;
    interests: string[];
    preferredActivities: ActivityCategory[];
    caregiverName: string;
    caregiverRelation: string;
    familyName: string;
  }
> = {
  lakshmi: {
    name: "Lakshmi",
    age: 72,
    language: "kn",
    regionGroup: "South India",
    regionState: "Karnataka",
    interests: ["Gardening", "Cooking", "Music"],
    preferredActivities: ["recognition", "recall", "counting"],
    caregiverName: "Arjun",
    caregiverRelation: "Grandson",
    familyName: "Arjun",
  },
  anima: {
    name: "Anima",
    age: 70,
    language: "en",
    regionGroup: "North Eastern Region",
    regionState: "Assam",
    interests: ["Gardening", "Stories", "Music"],
    preferredActivities: ["recognition", "attention", "spatial"],
    caregiverName: "Rohan",
    caregiverRelation: "Son",
    familyName: "Rohan",
  },
};

export async function POST(req: Request) {
  let body: Partial<OnboardingData> & { demo?: keyof typeof DEMOS };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const demo = body.demo ? DEMOS[body.demo] : undefined;
  if (body.demo && !demo) {
    return NextResponse.json({ message: "Unknown demo profile." }, { status: 400 });
  }

  const data = demo ?? {
    name: (body.name || "").trim(),
    age: Number(body.age) || 70,
    language: (body.language as LanguageCode) || "en",
    regionGroup: body.regionGroup || "South India",
    regionState: body.regionState || "Karnataka",
    interests: body.interests ?? [],
    preferredActivities: (body.preferredActivities ?? []) as ActivityCategory[],
    caregiverName: body.caregiverName || "Caregiver",
    caregiverRelation: body.caregiverRelation || "Family",
  };

  if (!demo && !data.name) {
    return NextResponse.json({ message: "Name is required." }, { status: 400 });
  }

  const created = await db.profile.create({
    data: {
      role: "ELDER",
      name: data.name,
      age: data.age,
      language: data.language,
      regionGroup: data.regionGroup,
      regionState: data.regionState,
      interests: JSON.stringify(data.interests),
      preferredActivities: JSON.stringify(data.preferredActivities),
      caregiverName: data.caregiverName || null,
      caregiverRelation: data.caregiverRelation || null,
      familyName: data.familyName || data.caregiverName || null,
    },
  });

  await seedFamilyForProfile(created.id, created.name, data.caregiverName || "Family");

  await setSession(created.id);
  return NextResponse.json({ profile: toProfile(created) });
}
