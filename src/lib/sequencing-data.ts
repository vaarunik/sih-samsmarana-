// SAMSMARANA — Sequencing activity data
//
// Each sequencing activity shows a real sequence of 4–5 events (with
// motion), then HIDES the sequence and asks the elder to reconstruct
// the order from memory. Not a single still picture — an actual
// sequence of events the elder watches, then remembers.

import type { Question, SceneKey } from "./types";
import type { KenBurns } from "./story-games-data";

export interface SequenceEvent {
  image: string;
  alt: string;
  narration: string;
  caption: string;
  motion: KenBurns;
  accent?: { icon: string; label: string };
}

export interface SequencingActivity {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  scene: SceneKey;
  events: SequenceEvent[];
  questions: Question[];
  icon: string;
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

export const SEQUENCING_ACTIVITIES: SequencingActivity[] = [
  {
    id: "seq-preparing-tea",
    title: "Preparing Tea — What's the Order?",
    description: "Watch the tea being prepared, then recall the order of events.",
    difficulty: 2,
    scene: "tea",
    icon: "Coffee",
    events: [
      {
        image: "/images/story/tea-1.png",
        alt: "Water being poured into a kettle",
        narration: "First, water is poured into the kettle.",
        caption: "Event 1 — Filling the kettle",
        motion: "zoom-in",
        accent: { icon: "Droplet", label: "Water" },
      },
      {
        image: "/images/activities/tea.png",
        alt: "The kettle heating on the stove with steam",
        narration: "Then, the water heats on the stove.",
        caption: "Event 2 — Heating the water",
        motion: "zoom-in",
        accent: { icon: "Flame", label: "Heating" },
      },
      {
        image: "/images/story/tea-2.png",
        alt: "Tea being poured into a steel cup",
        narration: "Next, the tea is poured into a cup.",
        caption: "Event 3 — Pouring the tea",
        motion: "pan-down",
        accent: { icon: "CupSoda", label: "Pouring" },
      },
      {
        image: "/images/story/tea-3.png",
        alt: "The cup of tea placed on a table",
        narration: "Finally, the tea is served on the table.",
        caption: "Event 4 — Serving the tea",
        motion: "zoom-out",
        accent: { icon: "Heart", label: "Served" },
      },
    ],
    questions: [
      q("sequencing", "What happened first?", "Water was poured into the kettle", ["The tea was poured into a cup", "The water heated on the stove", "The tea was served"], "Filling the kettle with water was the first event."),
      q("sequencing", "What happened immediately before the tea was served?", "The tea was poured into a cup", ["Water was poured into the kettle", "The water heated on the stove", "The kettle was washed"], "The tea was poured into a cup just before it was served."),
      q("sequencing", "What happened after the water heated on the stove?", "The tea was poured into a cup", ["Water was poured into the kettle", "The tea was served", "The stove was turned off"], "After the water heated, the tea was poured into a cup."),
      q("sequencing", "What happened last?", "The tea was served on the table", ["Water was poured into the kettle", "The water heated on the stove", "The tea was poured into a cup"], "Serving the tea on the table was the final event."),
    ],
  },
  {
    id: "seq-vegetable-market",
    title: "At the Market — What's the Order?",
    description: "Watch the market visit, then recall the order of events.",
    difficulty: 3,
    scene: "market",
    icon: "ShoppingBasket",
    events: [
      {
        image: "/images/activities/market.png",
        alt: "Arriving at the vegetable market",
        narration: "First, Amma arrives at the market.",
        caption: "Event 1 — Arriving",
        motion: "zoom-in",
        accent: { icon: "Footprints", label: "Arriving" },
      },
      {
        image: "/images/activities/market.png",
        alt: "Choosing vegetables at the stall",
        narration: "Then, she chooses the vegetables.",
        caption: "Event 2 — Choosing",
        motion: "pan-right",
        accent: { icon: "Hand", label: "Choosing" },
      },
      {
        image: "/images/activities/market.png",
        alt: "Vegetables being weighed",
        narration: "Next, the vegetables are weighed.",
        caption: "Event 3 — Weighing",
        motion: "pan-left",
        accent: { icon: "Scale", label: "Weighing" },
      },
      {
        image: "/images/activities/market.png",
        alt: "Paying at the market stall",
        narration: "Then, Amma pays for the vegetables.",
        caption: "Event 4 — Paying",
        motion: "zoom-out",
        accent: { icon: "Coins", label: "Paying" },
      },
      {
        image: "/images/activities/market.png",
        alt: "Leaving the market with a bag",
        narration: "Finally, Amma leaves with her bag of vegetables.",
        caption: "Event 5 — Leaving",
        motion: "zoom-out",
        accent: { icon: "ShoppingBag", label: "Leaving" },
      },
    ],
    questions: [
      q("sequencing", "What happened first?", "Amma arrived at the market", ["She chose the vegetables", "The vegetables were weighed", "She paid for the vegetables"], "Arriving at the market was the first event."),
      q("sequencing", "What happened immediately after Amma chose the vegetables?", "The vegetables were weighed", ["Amma arrived at the market", "Amma paid for the vegetables", "Amma left the market"], "After choosing, the vegetables were weighed."),
      q("sequencing", "What happened before Amma paid?", "The vegetables were weighed", ["Amma left the market", "Amma arrived at the market", "The vegetables were packed"], "The vegetables were weighed before Amma paid."),
      q("sequencing", "What happened last?", "Amma left with her bag of vegetables", ["Amma arrived at the market", "Amma chose the vegetables", "The vegetables were weighed"], "Leaving with the bag of vegetables was the final event."),
    ],
  },
];

export function sequencingById(id: string): SequencingActivity | undefined {
  return SEQUENCING_ACTIVITIES.find((s) => s.id === id);
}
