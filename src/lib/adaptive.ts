// SAMSMARANA — adaptive engine
// Adjusts recommended difficulty gradually based on recent performance.
// No medical claims — purely an engagement/education adjustment.

import type { ActivityCategory, AttemptRecord } from "./types";

export interface AdaptiveRecommendation {
  category: ActivityCategory;
  difficulty: number; // 1..5
  reason: string;
}

const CATEGORY_ORDER: ActivityCategory[] = [
  "recognition",
  "recall",
  "attention",
  "counting",
  "spatial",
  "sequencing",
  "concentration",
  "language",
  "problem_solving",
];

/**
 * Analyse recent attempts and recommend the next activity.
 * Rules (gradual changes only):
 *  - Strong recent performance (accuracy >= 0.8, few skips) -> +1 difficulty (cap 5)
 *  - Stable -> maintain
 *  - Repeated difficulty / low accuracy (< 0.5) -> -1 difficulty (floor 1)
 *  - Repeated skips of a category -> reduce its recommendation frequency
 */
export function recommend(
  attempts: AttemptRecord[],
  opts?: { forcedCategory?: ActivityCategory }
): AdaptiveRecommendation {
  const recent = [...attempts]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 8);

  if (recent.length === 0) {
    return {
      category: opts?.forcedCategory ?? "recognition",
      difficulty: 2,
      reason: "A gentle start with a recognition activity.",
    };
  }

  // Per-category stats
  const byCat = new Map<ActivityCategory, AttemptRecord[]>();
  for (const a of recent) {
    const arr = byCat.get(a.category) ?? [];
    arr.push(a);
    byCat.set(a.category, arr);
  }

  // Choose a category: prefer the forced one; otherwise rotate through the
  // order, avoiding categories the user keeps skipping.
  let chosen: ActivityCategory = opts?.forcedCategory ?? recent[0].category;
  if (!opts?.forcedCategory) {
    const skipHeavy = new Set<ActivityCategory>();
    for (const [cat, arr] of byCat) {
      const skips = arr.filter((a) => a.skipped).length;
      if (skips >= 2 && arr.length >= 2) skipHeavy.add(cat);
    }
    const pool = CATEGORY_ORDER.filter((c) => !skipHeavy.has(c));
    chosen = pool.length ? pool[recent.length % pool.length] : CATEGORY_ORDER[0];
  }

  const catAttempts = byCat.get(chosen) ?? recent;
  const acc = avg(catAttempts.map((a) => a.accuracy));
  const skips = catAttempts.filter((a) => a.skipped).length;
  const currentDiff = catAttempts[0]?.difficulty ?? 2;

  let difficulty = currentDiff;
  let reason = "Maintaining the current level based on steady performance.";

  if (acc >= 0.8 && skips === 0 && currentDiff < 5) {
    difficulty = currentDiff + 1;
    reason =
      "Strong recent accuracy — slightly increasing the challenge.";
  } else if (acc < 0.5 && currentDiff > 1) {
    difficulty = currentDiff - 1;
    reason = "Simplifying slightly to keep the activity comfortable.";
  } else if (skips >= 2) {
    difficulty = Math.max(1, currentDiff - 1);
    reason = "Offering an easier option after a couple of skipped sessions.";
  }

  return { category: chosen, difficulty, reason };
}

function avg(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

/**
 * Produce a small set of factual, non-diagnostic caregiver insights.
 */
export function buildInsights(attempts: AttemptRecord[]): string[] {
  if (!attempts.length) return ["No activities recorded yet."];
  const sorted = [...attempts].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
  );
  const out: string[] = [];

  const today = new Date();
  const todays = sorted.filter(
    (a) => new Date(a.createdAt).toDateString() === today.toDateString()
  );
  if (todays.length === 0) out.push("No activity completed today yet.");

  const last7 = sorted.slice(-7);
  if (last7.length >= 3) {
    const early = last7.slice(0, Math.ceil(last7.length / 2));
    const late = last7.slice(Math.ceil(last7.length / 2));
    const earlyRt = avg(early.map((a) => a.responseMs));
    const lateRt = avg(late.map((a) => a.responseMs));
    if (lateRt > earlyRt * 1.15) {
      out.push("Average response time increased over the last few sessions.");
    } else if (lateRt < earlyRt * 0.9) {
      out.push("Average response time improved over the last few sessions.");
    }
    const earlyAcc = avg(early.map((a) => a.accuracy));
    const lateAcc = avg(late.map((a) => a.accuracy));
    if (lateAcc > earlyAcc + 0.1) {
      out.push("Activity accuracy increased this week.");
    } else if (lateAcc < earlyAcc - 0.1) {
      out.push("Accuracy dipped slightly in recent sessions.");
    }
  }

  const recallSkips = sorted
    .filter((a) => a.category === "recall" && a.skipped)
    .length;
  if (recallSkips >= 2) {
    out.push("Repeated difficulty observed in recent recall activities.");
  }

  const completed = sorted.filter((a) => a.completed).length;
  if (completed >= 5) {
    out.push(`Activity completion is steady (${completed} completed so far).`);
  }

  const pending = sorted.filter((a) => a.syncState === "pending").length;
  if (pending > 0) {
    out.push("Offline activity data is waiting to sync.");
  }

  return out.length ? out : ["Engagement is stable."];
}

// ─────────────────────────────────────────────────────────────
// SESSION PLANNING — adaptive, fresh, anti-repetition
// ─────────────────────────────────────────────────────────────

export interface SessionPlanItem {
  category: ActivityCategory;
  difficulty: number;
  reason: string;
}

export interface SessionPlan {
  items: SessionPlanItem[];
  summary: string;
}

/**
 * Per-skill performance summary from recent attempts.
 */
interface SkillStats {
  category: ActivityCategory;
  avgAccuracy: number;
  count: number;
  lastDifficulty: number;
  skips: number;
}

function skillStats(attempts: AttemptRecord[]): Map<ActivityCategory, SkillStats> {
  const byCat = new Map<ActivityCategory, AttemptRecord[]>();
  for (const a of attempts) {
    const arr = byCat.get(a.category) ?? [];
    arr.push(a);
    byCat.set(a.category, arr);
  }
  const out = new Map<ActivityCategory, SkillStats>();
  for (const [cat, arr] of byCat) {
    out.set(cat, {
      category: cat,
      avgAccuracy: avg(arr.map((a) => a.accuracy)),
      count: arr.length,
      lastDifficulty: arr[0]?.difficulty ?? 2,
      skips: arr.filter((a) => a.skipped).length,
    });
  }
  return out;
}

/**
 * Build a fresh 3-activity session plan that:
 *  - rotates categories across sessions (anti-repetition)
 *  - reinforces weak skills more often
 *  - adapts difficulty per skill based on recent accuracy
 *  - avoids the exact same category combination as recent sessions
 *
 * `recentCategories` = the categories practiced in the last few sessions
 * (most-recent first), used to avoid repeating the same combo.
 */
export function planSession(
  attempts: AttemptRecord[],
  recentCategories: ActivityCategory[] = []
): SessionPlan {
  const stats = skillStats(attempts);
  const recentSet = new Set(recentCategories.slice(0, 3));

  // Score each category: weak skills score higher (need reinforcement),
  // recently-practiced skills score lower (rotation). Skills never practiced
  // get a moderate score so they get a turn.
  const scored = CATEGORY_ORDER.map((cat) => {
    const s = stats.get(cat);
    let score: number;
    if (!s) {
      score = 0.5; // never practiced — give it a turn
    } else {
      // weak accuracy → higher priority; but cap so we don't overwhelm
      const weakness = 1 - s.avgAccuracy; // 0 (strong) .. 1 (weak)
      const recencyPenalty = recentSet.has(cat) ? 0.4 : 0;
      score = weakness - recencyPenalty;
    }
    return { cat, score };
  }).sort((a, b) => b.score - a.score);

  // Pick 3 distinct categories: top-2 by weakness (reinforce weak skills),
  // plus 1 from the remaining pool that hasn't been used recently (rotation).
  const picked: ActivityCategory[] = [];
  for (const { cat } of scored) {
    if (picked.length >= 3) break;
    // Allow a weak skill to recur even if recent, but prefer fresh ones for slot 3
    if (picked.length < 2 || !recentSet.has(cat)) {
      picked.push(cat);
    }
  }
  // fill remaining slots from the rest
  for (const { cat } of scored) {
    if (picked.length >= 3) break;
    if (!picked.includes(cat)) picked.push(cat);
  }

  const items: SessionPlanItem[] = picked.map((cat) => {
    const s = stats.get(cat);
    const lastDiff = s?.lastDifficulty ?? 2;
    const acc = s?.avgAccuracy ?? 0.7;
    let difficulty = lastDiff;
    let reason: string;

    if (!s) {
      difficulty = 2;
      reason = "A fresh cognitive skill to explore.";
    } else if (acc >= 0.8 && s.skips === 0 && lastDiff < 5) {
      difficulty = lastDiff + 1;
      reason = "Strong recent accuracy — slightly increasing the challenge.";
    } else if (acc < 0.5 && lastDiff > 1) {
      difficulty = lastDiff - 1;
      reason = "Simplifying slightly to keep this skill comfortable.";
    } else if (s.skips >= 2 && lastDiff > 1) {
      difficulty = lastDiff - 1;
      reason = "Offering an easier option after a couple of skipped sessions.";
    } else {
      reason = "Maintaining the current level for this skill.";
    }

    return { category: cat, difficulty, reason };
  });

  const labels = items.map((i) => skillLabel(i.category));
  const summary = `This session: ${labels.join(" · ")}.`;

  return { items, summary };
}

function skillLabel(cat: ActivityCategory): string {
  const map: Record<ActivityCategory, string> = {
    recognition: "Recognition",
    recall: "Memory Recall",
    attention: "Attention",
    counting: "Counting",
    spatial: "Spatial Awareness",
    sequencing: "Sequencing",
    concentration: "Concentration",
    language: "Language",
    problem_solving: "Problem Solving",
    story: "Story",
  };
  return map[cat] ?? cat;
}
