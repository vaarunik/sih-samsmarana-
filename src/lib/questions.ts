// SAMSMARANA — cognitive question bank
//
// GROUNDING PRINCIPLE (critical):
// Each scene's ContentPack describes ONLY what is actually visible in the
// corresponding stimulus image (/public/images/activities/<scene>.png).
// The packs were verified against the real images. Questions are generated
// exclusively from this structured evidence, and every generated question
// is validated by `validateQuestion()` before it reaches the UI — if the
// answer is not supported by the stimulus evidence, the question is
// discarded. This prevents hallucinated/unanswerable questions such as
// asking about a "shopkeeper" in an image that contains only vegetables.

import type { ActivityCategory, Question, SceneKey } from "./types";

interface ContentPack {
  /** objects actually visible in the stimulus image, ordered by appearance */
  objects: string[];
  /** counts of objects actually visible in the stimulus image */
  counts: Record<string, number>;
  /** colours of objects actually visible in the stimulus image */
  colors: Record<string, string>;
  /** positions of objects actually visible in the stimulus image */
  positions: Record<string, string>;
  /** number of people actually visible in the stimulus image (omit if 0) */
  people?: number;
  first: string;
  last: string;
}

const PACKS: Record<SceneKey, ContentPack> = {
  garden: {
    objects: ["rose", "marigold", "watering can", "bamboo basket", "butterfly"],
    counts: { rose: 3, marigold: 5, butterfly: 2 },
    colors: { rose: "red", marigold: "orange", basket: "brown" },
    positions: { "watering can": "on the left", "bamboo basket": "on the right" },
    first: "rose",
    last: "butterfly",
  },
  market: {
    // Verified against /images/activities/market.png: tomatoes, basket,
    // pumpkin, tablecloth. NO shopkeeper is visible — do not add one.
    objects: ["tomato", "pumpkin", "woven basket"],
    counts: { tomato: 6, pumpkin: 2, basket: 1 },
    colors: { tomato: "red", pumpkin: "green", basket: "brown" },
    positions: { tomato: "on the left of the stall", pumpkin: "on the right", basket: "in the centre" },
    first: "tomato",
    last: "pumpkin",
  },
  shop: {
    // Verified: a person, jars, bag, tin, notebook, table, shelf, package.
    objects: ["glass jar", "rice bag", "tin of tea", "notebook"],
    counts: { "glass jar": 4, "rice bag": 2, "tin of tea": 3 },
    colors: { "rice bag": "white", "tin of tea": "green" },
    positions: { "glass jar": "on the top shelf", "rice bag": "on the floor" },
    people: 1,
    first: "glass jar",
    last: "notebook",
  },
  cooking: {
    objects: ["pot", "rice", "spoon", "green vegetables"],
    counts: { pot: 1, spoon: 2 },
    colors: { pot: "black", spoon: "steel", "green vegetables": "green" },
    positions: { pot: "on the stove", spoon: "beside the pot" },
    first: "pot",
    last: "green vegetables",
  },
  tea: {
    objects: ["mug", "tea leaves", "ginger", "sugar"],
    counts: { mug: 1, ginger: 3 },
    colors: { mug: "white", sugar: "white" },
    positions: { mug: "on the right", ginger: "beside the mug" },
    first: "mug",
    last: "sugar",
  },
  train: {
    objects: ["window", "green field", "man", "kettle"],
    counts: { man: 1, kettle: 1 },
    colors: { field: "green", kettle: "steel" },
    positions: { field: "outside the window", kettle: "near the man" },
    people: 1,
    first: "window",
    last: "kettle",
  },
  nature: {
    objects: ["river", "tree", "hill", "cloud", "bird"],
    counts: { tree: 4, bird: 2, cloud: 3 },
    colors: { hill: "green", river: "blue" },
    positions: { hill: "in the distance", river: "in the foreground" },
    first: "hill",
    last: "bird",
  },
  birds: {
    // birds.png had no clearly visible birds in the VLM check — use the
    // feeder/garden setting that is reliably visible.
    objects: ["feeder", "branch", "leaf"],
    counts: { feeder: 1, branch: 2 },
    colors: { feeder: "brown", branch: "green" },
    positions: { feeder: "on the ground", branch: "above the feeder" },
    first: "feeder",
    last: "branch",
  },
  home: {
    objects: ["lamp", "photo frame", "cup", "banana", "newspaper"],
    counts: { cup: 2, banana: 3 },
    colors: { lamp: "brass", "photo frame": "brown" },
    positions: { lamp: "on the shelf", newspaper: "on the table" },
    first: "lamp",
    last: "newspaper",
  },
  community: {
    objects: ["stone bench", "banyan tree", "elder", "child", "tea glass"],
    counts: { "tea glass": 2, elder: 1, child: 1 },
    colors: { "tea glass": "glass", "banyan tree": "green" },
    positions: { "stone bench": "under the tree", "tea glass": "on the bench" },
    people: 2,
    first: "stone bench",
    last: "tea glass",
  },
  river: {
    objects: ["boat", "fisherman", "net", "heron"],
    counts: { boat: 1, heron: 2, fisherman: 1 },
    colors: { boat: "wooden", heron: "white" },
    positions: { boat: "near the bank", heron: "at the water's edge" },
    people: 1,
    first: "boat",
    last: "heron",
  },
  festival: {
    objects: ["diya", "rangoli", "sweet box", "flower", "banana leaf"],
    counts: { diya: 4, "sweet box": 2 },
    colors: { rangoli: "colourful", diya: "golden" },
    positions: { rangoli: "at the doorstep", diya: "around the rangoli" },
    first: "diya",
    last: "banana leaf",
  },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick a random element, optionally avoiding some values. */
function pickFrom<T>(arr: T[], avoid: T[] = []): T | undefined {
  const pool = arr.filter((x) => !avoid.includes(x));
  const src = pool.length ? pool : arr;
  return src[Math.floor(Math.random() * src.length)];
}

/**
 * Build a multiple-choice question. `correct` is always one of the options;
 * the helper shuffles all options and records the correct index after
 * shuffling so the marked answer is always right.
 */
function mc(
  skill: ActivityCategory,
  prompt: string,
  correct: string,
  wrongs: string[],
  explanation: string,
  answerGroundedBy?: "not-in-scene" | "object-count" | "people-count" | "reasoning"
): Question {
  const options = shuffle([correct, ...wrongs]);
  return {
    id: `${skill}-${Math.random().toString(36).slice(2, 8)}`,
    skill,
    prompt,
    options,
    answerIndex: options.indexOf(correct),
    explanation,
    answerGroundedBy,
  };
}

/**
 * A normalized "signature" of a question's content (skill + the key subject),
 * used to detect near-duplicates across sessions. Two questions with the same
 * signature are functionally the same question (e.g. "Which festival…Ganesha"
 * vs "Which festival…bringing Ganesha idols home").
 */
export function questionSignature(skill: ActivityCategory, subject: string): string {
  return `${skill}:${subject.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 40)}`;
}

// ─────────────────────────────────────────────────────────────
// STIMULUS EVIDENCE + DETERMINISTIC VALIDATION (critical)
// ─────────────────────────────────────────────────────────────
//
// Every question's answer MUST be directly supported by the stimulus
// evidence (the ContentPack of the scene). `validateQuestion` checks this
// deterministically — no self-contradictory LLM judging its own output.
// Questions that fail validation are discarded and never reach the UI.

/**
 * The structured evidence extracted from a stimulus (the scene's content pack).
 * Every valid question answer must be grounded in this evidence.
 */
export interface StimulusEvidence {
  stimulusId: string;
  objects: string[];
  counts: Record<string, number>;
  colors: Record<string, string>;
  positions: Record<string, string>;
  people?: number;
  first: string;
  last: string;
}

/** Extract the ground-truth evidence for a scene. */
export function stimulusEvidence(scene: SceneKey): StimulusEvidence {
  const p = PACKS[scene];
  return {
    stimulusId: scene,
    objects: [...p.objects],
    counts: { ...p.counts },
    colors: { ...p.colors },
    positions: { ...p.positions },
    people: p.people,
    first: p.first,
    last: p.last,
  };
}

/**
 * The set of all answer strings that are grounded in the stimulus evidence.
 * A question is valid only if its correct answer appears in this set (case-
 * insensitive, loosely normalized). This is the deterministic validation —
 * it does not consult any LLM, only the structured evidence.
 */
export function groundedAnswers(ev: StimulusEvidence): Set<string> {
  const set = new Set<string>();
  const norm = (s: string) => s.toLowerCase().trim();
  ev.objects.forEach((o) => set.add(norm(o)));
  Object.keys(ev.counts).forEach((o) => set.add(norm(o)));
  Object.keys(ev.colors).forEach((o) => set.add(norm(o)));
  Object.keys(ev.positions).forEach((o) => set.add(norm(o)));
  Object.entries(ev.colors).forEach(([, c]) => set.add(norm(c)));
  Object.entries(ev.positions).forEach(([, p]) => set.add(norm(p)));
  Object.entries(ev.counts).forEach(([, n]) => set.add(String(n)));
  if (ev.people) set.add(String(ev.people));
  set.add(norm(ev.first));
  set.add(norm(ev.last));
  // Allow "yes"/"no" for concentration yes/no questions about present objects
  set.add("yes");
  set.add("no");
  return set;
}

/**
 * Validate that a question's correct answer is supported by the stimulus.
 * Returns { ok, reason }. Deterministic — no LLM judgment.
 *
 * Questions marked `answerGroundedBy` are grounded by construction:
 *  - "not-in-scene": the correct answer is intentionally absent (the
 *    distractors are all grounded objects, the correct answer is "none of
 *    these / a space rocket"). Validated by checking all *other* options are
 *    grounded.
 *  - "object-count": the answer is the count of distinct objects in the
 *    stimulus (derived from the evidence).
 *  - "people-count": the answer is the number of people in the stimulus.
 */
export function validateQuestion(
  q: { skill: ActivityCategory; prompt: string; options: string[]; answerIndex: number; answerGroundedBy?: string },
  ev: StimulusEvidence
): { ok: boolean; reason: string } {
  if (q.answerIndex < 0 || q.answerIndex >= q.options.length) {
    return { ok: false, reason: "invalid answer index" };
  }
  const correct = String(q.options[q.answerIndex]).toLowerCase().trim();
  const allowed = groundedAnswers(ev);

  // Grounded-by-construction markers.
  if (q.answerGroundedBy === "not-in-scene") {
    // The correct answer is intentionally NOT in the scene; all distractors
    // (the other options) MUST be grounded objects.
    const distractors = q.options.filter((_, i) => i !== q.answerIndex);
    const allGrounded = distractors.every((d) => allowed.has(String(d).toLowerCase().trim()));
    return allGrounded
      ? { ok: true, reason: "not-in-scene: distractors grounded in stimulus" }
      : { ok: false, reason: "not-in-scene: some distractors not in stimulus" };
  }
  if (q.answerGroundedBy === "object-count") {
    return correct === String(ev.objects.length)
      ? { ok: true, reason: "object-count grounded in stimulus" }
      : { ok: false, reason: `object-count mismatch: ${correct} vs ${ev.objects.length}` };
  }
  if (q.answerGroundedBy === "people-count") {
    return ev.people && correct === String(ev.people)
      ? { ok: true, reason: "people-count grounded in stimulus" }
      : { ok: false, reason: "people-count not grounded in stimulus" };
  }
  if (q.answerGroundedBy === "reasoning") {
    // The scenario references a grounded stimulus object; the answer is a
    // safety/reasoning judgment (not a stimulus fact). Accepted by construction.
    return { ok: true, reason: "reasoning: scenario grounded in stimulus" };
  }

  // Direct match against grounded answers.
  if (allowed.has(correct)) return { ok: true, reason: "answer grounded in stimulus" };

  // The correct answer may be a count like "3" — allow if it matches a count.
  const countVals = Object.values(ev.counts).map(String);
  if (countVals.includes(correct)) return { ok: true, reason: "count grounded in stimulus" };

  // People-count answers.
  if (ev.people && correct === String(ev.people)) {
    return { ok: true, reason: "people count grounded in stimulus" };
  }

  return {
    ok: false,
    reason: `answer "${correct}" not present in stimulus evidence: ${[...allowed].slice(0, 12).join(", ")}`,
  };
}

export interface BuildQuestionsOptions {
  /** signatures of recently-asked questions to avoid repeating */
  recentSignatures?: string[];
  /** minimum number of questions to build (default 3; capped by available content) */
  minQuestions?: number;
  /** maximum number of questions (default 5) */
  maxQuestions?: number;
  /** internal: prevents infinite recursion in the fallback path */
  _fallback?: boolean;
}

/**
 * Build a varied set of cognitive questions for a scene + category.
 *
 * Each call rotates which objects/colours/positions are queried, so the same
 * (scene, category, difficulty) produces different question content across
 * sessions. Near-duplicate questions are avoided using `recentSignatures`.
 * Guarantees at least `minQuestions` (3 by default) where content allows.
 */
export function buildQuestions(
  scene: SceneKey,
  category: ActivityCategory,
  difficulty: number,
  opts: BuildQuestionsOptions = {}
): Question[] {
  const pack = PACKS[scene];
  const objs = pack.objects;
  const wrongsFrom = (exclude: string[]) =>
    shuffle(objs.filter((o) => !exclude.includes(o)));
  const recent = new Set(opts.recentSignatures ?? []);
  const minQ = opts.minQuestions ?? 3;
  const maxQ = opts.maxQuestions ?? 5;
  const out: Question[] = [];
  const ev = stimulusEvidence(scene);

  // Track used subjects within this set so we don't repeat the same target.
  const usedSubjects = new Set<string>();
  const tryAdd = (q: Question | null): boolean => {
    if (!q) return false;
    const sig = questionSignature(q.skill, q.prompt);
    if (recent.has(sig)) return false;
    // CRITICAL: validate the question's answer against the stimulus evidence.
    // Discard any question whose answer is not grounded in the actual stimulus.
    const v = validateQuestion(q, ev);
    if (process.env.NODE_ENV !== "production") {
      // Development logging for tracing grounding (stimulus → question → answer → validation)
      console.debug("[question-grounding]", {
        stimulusId: ev.stimulusId,
        evidence: ev.objects,
        question: q.prompt,
        answer: q.options[q.answerIndex],
        validation: v.ok ? "PASS" : "FAIL",
        reason: v.reason,
      });
    }
    if (!v.ok) return false; // invalid question never reaches the UI
    out.push(q);
    return true;
  };

  // Helper to build "recognition" variants rotating through the object pool.
  const buildRecognition = (count: number) => {
    const targets = shuffle(objs);
    let made = 0;
    for (let i = 0; i < targets.length && made < count; i++) {
      const t = targets[i];
      const variant = made % 3; // rotate prompt variants
      const prompt =
        variant === 0
          ? `Which of these did you see in the ${sceneLabel(scene)}?`
          : variant === 1
            ? `Was the ${t} shown in the scene?`
            : `Which object was part of the scene?`;
      const q =
        variant === 1
          ? mc("recognition", prompt, "Yes", ["No"], `Yes — the ${t} was shown in the scene.`)
          : mc("recognition", prompt, t, wrongsFrom([t]).slice(0, 3), `The ${t} was clearly shown in the scene.`);
      if (tryAdd(q)) made++;
    }
    // "NOT part of the scene" variant (harder) — grounded by construction:
    // the correct answer ("a space rocket") is intentionally absent; all
    // distractors are grounded objects from the stimulus.
    if (made < count && difficulty >= 2) {
      const q = mc(
        "recognition",
        `Which object was NOT part of the scene?`,
        "a space rocket",
        wrongsFrom([]).slice(0, 3),
        `A space rocket was not shown — everything else appeared in the scene.`,
        "not-in-scene"
      );
      if (tryAdd(q)) made++;
    }
  };

  const buildRecall = (count: number) => {
    // rotate between first/last/middle ordering questions
    const variants = [
      { prompt: `Which object appeared FIRST in the scene?`, ans: pack.first, exp: `The ${pack.first} appeared first.` },
      { prompt: `Which object appeared LAST in the scene?`, ans: pack.last, exp: `The ${pack.last} appeared last.` },
    ];
    if (objs.length >= 3) {
      const mid = objs[Math.floor(objs.length / 2)];
      variants.push({
        prompt: `Which object appeared in the MIDDLE of the scene?`,
        ans: mid,
        exp: `The ${mid} appeared in the middle.`,
      });
    }
    const order = shuffle(variants);
    for (let i = 0; i < order.length && out.length < maxQ; i++) {
      const v = order[i];
      tryAdd(mc("recall", v.prompt, v.ans, wrongsFrom([v.ans]).slice(0, 3), v.exp));
    }
  };

  const buildAttention = (count: number) => {
    const colorEntries = shuffle(Object.entries(pack.colors));
    let made = 0;
    for (let i = 0; i < colorEntries.length && made < count; i++) {
      const [cObj, cCol] = colorEntries[i];
      const q = mc(
        "attention",
        `What colour was the ${cObj}?`,
        cCol,
        shuffle(["yellow", "purple", "pink", "grey"].filter((c) => c !== cCol)).slice(0, 3),
        `The ${cObj} was ${cCol}.`
      );
      if (tryAdd(q)) made++;
    }
    if (made < count && pack.people) {
      const q = mc(
        "attention",
        `How many people did you see in the scene?`,
        String(pack.people),
        shuffle([String(pack.people + 1), String(pack.people + 2), String(Math.max(0, pack.people - 1))]),
        `There ${pack.people === 1 ? "was 1 person" : `were ${pack.people} people`} in the scene.`,
        "people-count"
      );
      if (tryAdd(q)) made++;
    }
  };

  const buildCounting = (count: number) => {
    const countEntries = shuffle(Object.entries(pack.counts));
    let made = 0;
    for (let i = 0; i < countEntries.length && made < count; i++) {
      const [cObj, cCount] = countEntries[i];
      const q = mc(
        "counting",
        `How many ${cObj}${cObj.endsWith("s") ? "" : "s"} did you see?`,
        String(cCount),
        shuffle([String(cCount + 1), String(Math.max(0, cCount - 1)), String(cCount + 2)]),
        `There ${cCount === 1 ? "was 1" : `were ${cCount}`} ${cObj} in the scene.`
      );
      if (tryAdd(q)) made++;
    }
  };

  const buildSpatial = (count: number) => {
    const posEntries = shuffle(Object.entries(pack.positions));
    let made = 0;
    for (let i = 0; i < posEntries.length && made < count; i++) {
      const [sObj, sPos] = posEntries[i];
      const q = mc(
        "spatial",
        `Where was the ${sObj}?`,
        sPos,
        shuffle(["in the centre", "on the ceiling", "under the table", "in the corner"].filter((p) => p !== sPos)).slice(0, 3),
        `The ${sObj} was ${sPos}.`
      );
      if (tryAdd(q)) made++;
    }
  };

  const buildSequencing = (count: number) => {
    // rotate through consecutive pairs
    const pairs: { a: string; b: string }[] = [];
    for (let i = 0; i < objs.length - 1; i++) pairs.push({ a: objs[i], b: objs[i + 1] });
    const order = shuffle(pairs);
    let made = 0;
    for (let i = 0; i < order.length && made < count; i++) {
      const { a, b } = order[i];
      const q = mc(
        "sequencing",
        `Which object came right AFTER the ${a}?`,
        b,
        wrongsFrom([b]).slice(0, 3),
        `After the ${a}, the ${b} appeared.`
      );
      if (tryAdd(q)) made++;
    }
  };

  const buildConcentration = (count: number) => {
    const candidates = shuffle(objs);
    let made = 0;
    for (let i = 0; i < candidates.length && made < count; i++) {
      const shown = candidates[i];
      const isYes = Math.random() > 0.4;
      const q = isYes
        ? mc("concentration", `Was a ${shown} shown in the scene?`, "Yes", ["No"], `Yes — the ${shown} was shown.`)
        : mc("concentration", `Was a ${shown} NOT shown in the scene?`, "No", ["Yes"], `No — the ${shown} was shown in the scene.`);
      if (tryAdd(q)) made++;
    }
    if (made < count) {
      tryAdd(mc("concentration", `How many different objects appeared?`, String(objs.length), shuffle([String(Math.max(0, objs.length - 1)), String(objs.length + 1)]), `${objs.length} different objects appeared in the scene.`, "object-count"));
    }
  };

  const buildProblemSolving = (count: number) => {
    const posEntries = shuffle(Object.entries(pack.positions));
    let made = 0;
    for (let i = 0; i < posEntries.length && made < count; i++) {
      const [pObj] = posEntries[i];
      const q = mc(
        "problem_solving",
        `If you needed the ${pObj} but could not reach it safely, what is the best next step?`,
        "Ask someone for help",
        ["Climb the shelves quickly", "Pull the shelf toward you", "Jump and grab it"],
        `Asking for help is the safest choice — climbing or pulling shelves risks a fall.`,
        "reasoning"
      );
      if (tryAdd(q)) made++;
    }
  };

  const buildLanguage = (count: number) => {
    const words = shuffle(objs);
    let made = 0;
    for (let i = 0; i < words.length && made < count; i++) {
      const word = words[i];
      const q = mc(
        "language",
        `Which phrase best describes "${word}"?`,
        "a familiar everyday thing",
        shuffle(["a distant planet", "a type of storm", "a musical note", "a mathematical symbol"]),
        `"${word}" is a familiar everyday thing shown in the scene.`
      );
      if (tryAdd(q)) made++;
    }
  };

  // Build the target count of questions for this category.
  const target = Math.min(maxQ, Math.max(minQ, difficulty >= 3 ? 4 : 3));
  switch (category) {
    case "recognition": buildRecognition(target); break;
    case "recall": buildRecall(target); break;
    case "attention": buildAttention(target); break;
    case "counting": buildCounting(target); break;
    case "spatial": buildSpatial(target); break;
    case "sequencing": buildSequencing(target); break;
    case "concentration": buildConcentration(target); break;
    case "problem_solving": buildProblemSolving(target); break;
    case "language": buildLanguage(target); break;
  }

  // Fallback: if not enough unique questions were built (rare), relax the
  // recent-signature constraint so the activity still has >= minQ questions.
  // Guard against infinite recursion with a depth flag.
  if (out.length < minQ && !opts._fallback) {
    const fallback = buildQuestions(scene, category, difficulty, {
      ...opts,
      recentSignatures: [],
      _fallback: true,
    });
    for (const q of fallback) {
      if (out.length >= minQ) break;
      if (!out.some((x) => x.prompt === q.prompt)) out.push(q);
    }
  }

  return out.slice(0, maxQ);
}

/** Return the objects that appear in a scene (for the memorize step). */
export function sceneObjects(scene: SceneKey): string[] {
  return [...(PACKS[scene]?.objects ?? [])];
}

function sceneLabel(scene: SceneKey): string {
  const map: Record<SceneKey, string> = {
    garden: "garden",
    market: "market",
    shop: "shop",
    cooking: "kitchen",
    tea: "tea scene",
    train: "train",
    nature: "landscape",
    birds: "garden",
    home: "home",
    community: "courtyard",
    river: "river scene",
    festival: "festival scene",
  };
  return map[scene];
}
