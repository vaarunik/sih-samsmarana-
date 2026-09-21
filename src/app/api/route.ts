// SAMSMARANA — API health check.
// Reports whether the Gemini/Veo video feature is configured (server-side),
// without ever exposing the API key itself.
import { NextResponse } from "next/server";
import { isVeoAvailable } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    name: "Samsmarana",
    status: "ok",
    veoAvailable: isVeoAvailable(),
  });
}
