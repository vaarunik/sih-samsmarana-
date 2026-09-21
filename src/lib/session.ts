// SAMSMARANA — lightweight server session (httpOnly, signed cookie)
// Pragmatic for the demo flow: onboarding creates a profile and issues
// a session. The key is never exposed to client JS. Role switching is a
// client-side view change (no second login), per the master spec.

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "sm_session";
const SECRET =
  process.env.SESSION_SECRET || "samsmarana-dev-secret-change-me";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function makeToken(profileId: string): string {
  const payload = Buffer.from(profileId).toString("base64url");
  return `${payload}.${sign(profileId)}`;
}

function verifyToken(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx < 1) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  let id: string;
  try {
    id = Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = sign(id);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return id;
}

export async function setSession(profileId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeToken(profileId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getSessionProfileId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
