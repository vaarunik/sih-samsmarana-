// SAMSMARANA — per-user 30-day content/stimulus rotation
//
// The same stimulus (scene) must NOT be shown to the same user for the same
// activity type again for CONTENT_COOLDOWN_DAYS. The activity TYPE stays the
// same; only the underlying stimulus/content rotates.
//
// This is server-only (uses the DB). The client calls /api/stimulus to get
// the selected stimulus for an activity, then builds stimulus-grounded
// questions from it.

import "server-only";
import { db } from "./db";

/** A stimulus becomes eligible again after this many days. Configurable. */
export const CONTENT_COOLDOWN_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const COOLDOWN_MS = CONTENT_COOLDOWN_DAYS * MS_PER_DAY;

/**
 * The full pool of available stimuli (scenes). Each scene has its own
 * realistic image + content pack in questions.ts. The pool is the same for
 * every activity type — variety comes from rotating across the pool.
 */
export const STIMULUS_POOL = [
  "garden",
  "market",
  "shop",
  "cooking",
  "tea",
  "train",
  "nature",
  "birds",
  "home",
  "community",
  "river",
  "festival",
] as const;

export type StimulusId = (typeof STIMULUS_POOL)[number];

/**
 * Select a fresh stimulus for a given user + activity type.
 *
 * Algorithm:
 *  1. Get all stimuli used by this user for this activityType in the last
 *     CONTENT_COOLDOWN_DAYS days → these are blocked.
 *  2. From the full pool, exclude the blocked ones.
 *  3. If any remain, pick the one least-recently-used (oldest `shownAt`,
 *     or never-used first). This maximizes variety.
 *  4. If ALL are blocked (pool exhausted within cooldown), pick the one
 *     used longest ago (maximizes distance from the cooldown boundary) and
 *     record it — never silently re-shows the most-recent stimulus.
 *
 * Records the selection in ActivityContentHistory (shownAt = now).
 * Never selects the first item deterministically.
 */
export async function selectStimulus(
  profileId: string,
  activityType: string
): Promise<StimulusId> {
  const cutoff = new Date(Date.now() - COOLDOWN_MS);

  // All history for this user+activity, oldest first.
  const history = await db.activityContentHistory.findMany({
    where: { profileId, activityType },
    orderBy: { shownAt: "desc" },
  });

  // Stimuli used within the cooldown window → blocked.
  const blocked = new Set(
    history
      .filter((h) => h.shownAt > cutoff)
      .map((h) => h.stimulusId)
  );

  // Stimuli never used (by this user for this activity) → highest priority.
  const neverUsed = STIMULUS_POOL.filter((s) => !history.some((h) => h.stimulusId === s));

  let chosen: StimulusId;

  if (neverUsed.length > 0) {
    // Prefer never-used stimuli; pick randomly among them for variety.
    chosen = neverUsed[Math.floor(Math.random() * neverUsed.length)];
  } else {
    // All stimuli have been used at least once. Prefer those NOT in the
    // cooldown window (eligible again).
    const eligible = STIMULUS_POOL.filter((s) => !blocked.has(s));
    if (eligible.length > 0) {
      // Pick the least-recently-used among eligible.
      // Build a map of lastShown per stimulus.
      const lastShown = new Map<string, Date>();
      for (const h of history) {
        const prev = lastShown.get(h.stimulusId);
        if (!prev || h.shownAt > prev) lastShown.set(h.stimulusId, h.shownAt);
      }
      eligible.sort((a, b) => {
        const aT = lastShown.get(a)?.getTime() ?? 0;
        const bT = lastShown.get(b)?.getTime() ?? 0;
        return aT - bT; // oldest first (least-recently-used)
      });
      chosen = eligible[0];
    } else {
      // Pool exhausted within cooldown — pick the one used LONGEST ago
      // (maximizes distance from re-showing the most recent). This is the
      // graceful fallback: never re-shows the most-recent stimulus.
      const lastShown = new Map<string, Date>();
      for (const h of history) {
        const prev = lastShown.get(h.stimulusId);
        if (!prev || h.shownAt > prev) lastShown.set(h.stimulusId, h.shownAt);
      }
      const sorted = [...STIMULUS_POOL].sort((a, b) => {
        const aT = lastShown.get(a)?.getTime() ?? 0;
        const bT = lastShown.get(b)?.getTime() ?? 0;
        return aT - bT; // oldest first
      });
      chosen = sorted[0];
    }
  }

  // Record the selection.
  await db.activityContentHistory.create({
    data: { profileId, activityType, stimulusId: chosen },
  });

  return chosen;
}

/**
 * Mark a stimulus as completed (the user finished the activity).
 */
export async function completeStimulus(
  profileId: string,
  activityType: string,
  stimulusId: string
): Promise<void> {
  // Mark the most-recent shown (not yet completed) record as completed.
  const rec = await db.activityContentHistory.findFirst({
    where: { profileId, activityType, stimulusId, completedAt: null },
    orderBy: { shownAt: "desc" },
  });
  if (rec) {
    await db.activityContentHistory.update({
      where: { id: rec.id },
      data: { completedAt: new Date() },
    });
  }
}

/**
 * Get the recent stimulus history for a user+activity (for debugging / the
 * content-freshness indicator). Returns most-recent first.
 */
export async function recentStimuli(
  profileId: string,
  activityType: string,
  take = 10
): Promise<{ stimulusId: string; shownAt: Date; completedAt: Date | null }[]> {
  return db.activityContentHistory.findMany({
    where: { profileId, activityType },
    orderBy: { shownAt: "desc" },
    take,
  });
}
