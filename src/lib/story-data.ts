// SAMSMARANA — visual story activities
// Each story is a sequence of realistic scene images with short narration,
// followed by cognitive recall questions. Scenes reference files in
// /public/images/story/.

import type { Question } from "./types";

export interface StoryScene {
  image: string;
  narration: string;
  /** short caption shown under the image */
  caption: string;
}

export interface StoryDef {
  id: string;
  title: string;
  scenes: StoryScene[];
  questions: Question[];
}

function q(
  skill: Question["skill"],
  prompt: string,
  correct: string,
  wrongs: string[],
  explanation: string
): Question {
  const options = shuffle([correct, ...wrongs]);
  return {
    id: `${skill}-${Math.random().toString(36).slice(2, 8)}`,
    skill,
    prompt,
    options,
    answerIndex: options.indexOf(correct),
    explanation,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const STORIES: StoryDef[] = [
  {
    id: "story-tea",
    title: "Lakshmi's Morning Tea",
    scenes: [
      {
        image: "/images/story/tea-1.png",
        narration: "In the morning, Lakshmi prepares tea in her kitchen.",
        caption: "Scene 1 — Preparing tea",
      },
      {
        image: "/images/story/tea-2.png",
        narration: "She places a cup of tea on the table beside a small brass lamp.",
        caption: "Scene 2 — A cup on the table",
      },
      {
        image: "/images/story/tea-3.png",
        narration: "A family member enters the room to join her.",
        caption: "Scene 3 — Family arrives",
      },
    ],
    questions: [
      q(
        "recall",
        "Who entered the room?",
        "A family member",
        ["A neighbour", "A postman", "A doctor"],
        "A family member entered the room in the final scene."
      ),
      q(
        "recall",
        "What did Lakshmi place on the table?",
        "A cup of tea",
        ["A book", "A newspaper", "A plate of food"],
        "Lakshmi placed a cup of tea on the table, beside the brass lamp."
      ),
      q(
        "sequencing",
        "What happened first?",
        "Lakshmi prepared tea in the kitchen",
        [
          "A family member entered the room",
          "She placed a cup on the table",
          "She watered the garden",
        ],
        "Preparing tea in the kitchen was the first scene."
      ),
      q(
        "spatial",
        "Where was the cup placed?",
        "Beside the brass lamp",
        ["On the stove", "In the garden", "On the shelf"],
        "The cup was placed on the table beside the brass lamp."
      ),
    ],
  },
];

export function storyById(id: string): StoryDef | undefined {
  return STORIES.find((s) => s.id === id);
}
