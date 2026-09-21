// SAMSMARANA — Google Gemini / Veo video generation (SERVER-ONLY)
//
// This module talks to Google's Gemini API using the Veo video model.
// The API key is read from process.env.GEMINI_API_KEY and NEVER leaves
// the server: it is never sent to the client, never logged, and never
// embedded in the saved video file or its public URL.
//
// Flow:
//   1. startVideoGeneration() -> POST :predictLongRunning -> operation name
//   2. pollVideoGeneration()  -> GET operations/{name} until done
//   3. downloadVideo()        -> fetch the returned uri (server-side)
//                                and save bytes to /public/generated/{id}.mp4
//
// If the key is missing, or Veo generation fails for any reason, callers
// receive a clean "unavailable"/"failed" status with a human message —
// never a raw API error, never the key.

import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Question } from "./types";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const DEFAULT_MODEL =
  process.env.VEO_MODEL || "veo-3.0-generate-001";

const POLL_TIMEOUT_MS = Number(process.env.VEO_POLL_TIMEOUT_MS || 180000);

export function isVeoAvailable(): boolean {
  const k = process.env.GEMINI_API_KEY;
  return typeof k === "string" && k.trim().length > 0;
}

export interface VeoStartResult {
  ok: boolean;
  operationId?: string;
  model: string;
  /** key-safe human message; never contains the API key */
  message?: string;
}

interface PredictParams {
  aspectRatio?: string;
  sampleCount?: number;
  durationSeconds?: number;
  personGeneration?: "dont_allow" | "allow_adult" | "allow_all";
  enablePromptRewrite?: boolean;
  negativePrompt?: string;
}

/**
 * Kick off a long-running Veo generation. Returns the operation name
 * used for polling.
 */
export async function startVideoGeneration(
  prompt: string,
  opts?: { model?: string }
): Promise<VeoStartResult> {
  const model = opts?.model || DEFAULT_MODEL;
  if (!isVeoAvailable()) {
    return {
      ok: false,
      model,
      message:
        "Video generation is temporarily unavailable. You can continue with a standard activity.",
    };
  }

  const parameters: PredictParams = {
    aspectRatio: "16:9",
    sampleCount: 1,
    durationSeconds: 8,
    personGeneration: "allow_adult",
    enablePromptRewrite: false,
    negativePrompt:
      "cartoon, anime, illustration, 3d render, text, caption, watermark, logo, fast camera movement, flashing, chaotic, surreal, distorted faces, childish",
  };

  const body = {
    instances: [{ prompt }],
    parameters,
  };

  try {
    const res = await fetch(
      `${API_BASE}/models/${model}:predictLongRunning`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY as string,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      return {
        ok: false,
        model,
        message: friendlyError(await safeReadError(res)),
      };
    }

    const data = (await res.json()) as { name?: string };
    if (!data.name) {
      return {
        ok: false,
        model,
        message:
          "Video generation is temporarily unavailable. You can continue with a standard activity.",
      };
    }
    return { ok: true, operationId: data.name, model };
  } catch {
    return {
      ok: false,
      model,
      message:
        "Video generation is temporarily unavailable. You can continue with a standard activity.",
    };
  }
}

export type PollStatus =
  | { status: "preparing" }
  | { status: "generating" }
  | { status: "ready"; videoUrl: string }
  | { status: "failed"; message: string };

export interface PollOptions {
  /** download the produced video and return a public URL */
  downloadToId: string;
  questions: Question[];
}

/**
 * Poll a long-running operation once. If complete, downloads the video
 * bytes (server-side) into /public/generated/{id}.mp4 and returns the
 * public URL. The API key is never placed in the returned URL.
 */
export async function pollVideoGeneration(
  operationId: string,
  opts: PollOptions
): Promise<PollStatus> {
  if (!isVeoAvailable()) {
    return {
      status: "failed",
      message:
        "Video generation is temporarily unavailable. You can continue with a standard activity.",
    };
  }

  try {
    const res = await fetch(`${API_BASE}/${operationId}`, {
      method: "GET",
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY as string },
    });

    if (!res.ok) {
      return {
        status: "failed",
        message: friendlyError(await safeReadError(res)),
      };
    }

    const data = (await res.json()) as {
      done?: boolean;
      metadata?: { progress?: number };
      response?: {
        generatedSamples?: { video?: { uri?: string; bytesBase64Encoded?: string } }[];
      };
      error?: { code?: number; message?: string; status?: string };
    };

    if (data.error) {
      return {
        status: "failed",
        message: friendlyError(data.error),
      };
    }

    if (!data.done) {
      const progress = data.metadata?.progress;
      return {
        status:
          typeof progress === "number" && progress > 0.5 ? "generating" : "preparing",
      };
    }

    const sample = data.response?.generatedSamples?.[0]?.video;
    if (!sample) {
      return {
        status: "failed",
        message:
          "Video generation is temporarily unavailable. You can continue with a standard activity.",
      };
    }

    // Download the actual video bytes (server-side only).
    const bytes = await downloadVideoBytes(sample);
    if (!bytes) {
      return {
        status: "failed",
        message:
          "Video generation is temporarily unavailable. You can continue with a standard activity.",
      };
    }

    const publicUrl = await saveVideo(opts.downloadToId, bytes);
    return { status: "ready", videoUrl: publicUrl };
  } catch {
    return {
      status: "failed",
      message:
        "Video generation is temporarily unavailable. You can continue with a standard activity.",
    };
  }
}

async function downloadVideoBytes(sample: {
  uri?: string;
  bytesBase64Encoded?: string;
}): Promise<Uint8Array | null> {
  // Some responses embed the video as base64.
  if (sample.bytesBase64Encoded) {
    try {
      const bin = atob(sample.bytesBase64Encoded);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    } catch {
      return null;
    }
  }
  if (!sample.uri) return null;

  // The returned uri is a Google-hosted, time-limited download link.
  // We try a few auth strategies, all server-side, never exposing the key
  // to the browser or saving it into the file/URL.
  const key = process.env.GEMINI_API_KEY as string;
  const candidates = [
    { url: sample.uri, headers: { "x-goog-api-key": key } },
    { url: sample.uri, headers: {} },
    {
      url: appendKey(sample.uri, key),
      headers: {},
    },
  ];

  for (const c of candidates) {
    try {
      const res = await fetch(c.url, { headers: c.headers });
      if (res.ok) {
        const buf = new Uint8Array(await res.arrayBuffer());
        if (buf.byteLength > 0) return buf;
      }
    } catch {
      // try next strategy
    }
  }
  return null;
}

function appendKey(uri: string, key: string): string {
  if (!key) return uri;
  const sep = uri.includes("?") ? "&" : "?";
  return `${uri}${sep}key=${encodeURIComponent(key)}`;
}

async function saveVideo(id: string, bytes: Uint8Array): Promise<string> {
  const dir = path.join(process.cwd(), "public", "generated");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${id}.mp4`);
  await fs.writeFile(file, bytes);
  return `/generated/${id}.mp4`;
}

async function safeReadError(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    try {
      return await res.text();
    } catch {
      return null;
    }
  }
}

/**
 * Convert any provider error into a clean, human, key-safe message.
 * Never surfaces the API key, raw JSON, or provider stack traces.
 */
function friendlyError(err: unknown): string {
  if (!err)
    return "Video generation is temporarily unavailable. You can continue with a standard activity.";
  const e = err as { error?: { message?: string }; message?: string };
  const raw = e?.error?.message || e?.message || "";
  if (/api key|api_key|permission|quota|rate|unauthor/i.test(raw)) {
    return "Video generation is temporarily unavailable. You can continue with a standard activity.";
  }
  return "Video generation is temporarily unavailable. You can continue with a standard activity.";
}

export { POLL_TIMEOUT_MS };
