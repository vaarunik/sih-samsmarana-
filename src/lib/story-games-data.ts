// SAMSMARANA — Story Games data
//
// 8 distinct visual stories. Every scene has its OWN realistic image
// (no reused images across scenes within a story). Character continuity
// is maintained via consistent descriptions in the generation prompts.
// After the story finishes, visuals are HIDDEN and memory questions
// test recall.
//
// Stories are regionally adaptable via `regionTags` and `interests`.

import type { Question, SceneKey } from "./types";

export type KenBurns = "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down";

export interface StoryScene {
  /** each scene has its OWN distinct image */
  image: string;
  alt: string;
  narration: string;
  caption: string;
  motion: KenBurns;
  accent?: { icon: string; label: string };
}

export interface StoryGame {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Moderate" | "Advanced";
  scene: SceneKey;
  scenes: StoryScene[];
  questions: Question[];
  regionTags: string[];
  interests: string[];
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

export const STORY_GAMES: StoryGame[] = [
  // ── 1. Vegetable Market ──────────────────────────────────
  {
    id: "story-vegetable-market",
    title: "A Morning at the Vegetable Market",
    description: "Follow Amma's morning visit to the local vegetable market.",
    difficulty: "Moderate",
    scene: "market",
    icon: "ShoppingBasket",
    regionTags: ["Assam", "Karnataka", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura", "Arunachal Pradesh"],
    interests: ["Cooking", "Family"],
    scenes: [
      { image: "/images/story/market/s1.png", alt: "Amma walking toward the market entrance with an empty basket", narration: "Amma arrives at the vegetable market in the morning.", caption: "Scene 1 — Arriving", motion: "zoom-in", accent: { icon: "Footprints", label: "Arriving" } },
      { image: "/images/story/market/s2.png", alt: "Amma standing inside the market looking at the stalls", narration: "She looks around the market at the fresh vegetables.", caption: "Scene 2 — Looking around", motion: "pan-right", accent: { icon: "Eye", label: "Looking" } },
      { image: "/images/story/market/s3.png", alt: "Amma's hand reaching for tomatoes at the stall", narration: "She chooses some fresh tomatoes and vegetables.", caption: "Scene 3 — Choosing", motion: "zoom-in", accent: { icon: "Hand", label: "Choosing" } },
      { image: "/images/story/market/s4.png", alt: "Vegetables on a weighing scale", narration: "The shopkeeper weighs the vegetables on the scale.", caption: "Scene 4 — Weighing", motion: "pan-left", accent: { icon: "Scale", label: "Weighing" } },
      { image: "/images/story/market/s5.png", alt: "Amma paying the shopkeeper", narration: "Amma pays the shopkeeper for her vegetables.", caption: "Scene 5 — Paying", motion: "zoom-out", accent: { icon: "Coins", label: "Paying" } },
      { image: "/images/story/market/s6.png", alt: "Shopkeeper packing vegetables into a bag", narration: "The vegetables are packed into a cloth bag.", caption: "Scene 6 — Packing", motion: "pan-up", accent: { icon: "ShoppingBag", label: "Packing" } },
      { image: "/images/story/market/s7.png", alt: "Amma leaving the market carrying a full bag", narration: "Amma leaves the market with her bag of vegetables.", caption: "Scene 7 — Leaving", motion: "zoom-out", accent: { icon: "Footprints", label: "Leaving" } },
    ],
    questions: [
      q("sequencing", "What did Amma do first?", "She arrived at the market", ["She paid for the vegetables", "She left the market", "She packed the vegetables"], "Amma arrived at the market first."),
      q("sequencing", "What happened after Amma chose the vegetables?", "The shopkeeper weighed them", ["Amma left the market", "Amma arrived at the market", "The vegetables were packed"], "After choosing, the shopkeeper weighed the vegetables."),
      q("sequencing", "What was done before Amma paid?", "The vegetables were weighed", ["The vegetables were packed", "Amma left the market", "Amma arrived"], "The vegetables were weighed before Amma paid."),
      q("recall", "Who weighed the vegetables?", "The shopkeeper", ["Amma", "A neighbour", "A child"], "The shopkeeper weighed the vegetables on the scale."),
      q("sequencing", "What happened at the end?", "Amma left with her bag of vegetables", ["Amma arrived at the market", "The shopkeeper weighed the vegetables", "Amma chose vegetables"], "At the end, Amma left with her bag of vegetables."),
    ],
  },

  // ── 2. Preparing Tea ─────────────────────────────────────
  {
    id: "story-preparing-tea",
    title: "Preparing Morning Tea",
    description: "Watch Amma prepare the morning tea, step by step.",
    difficulty: "Easy",
    scene: "tea",
    icon: "Coffee",
    regionTags: ["Assam", "Karnataka", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura", "Arunachal Pradesh"],
    interests: ["Tea", "Cooking"],
    scenes: [
      { image: "/images/story/tea/s1.png", alt: "Amma filling a steel kettle with water", narration: "Amma fills the kettle with water.", caption: "Scene 1 — Filling the kettle", motion: "zoom-in", accent: { icon: "Droplet", label: "Water" } },
      { image: "/images/story/tea/s2.png", alt: "The kettle heating on the stove with steam", narration: "She heats the water on the stove.", caption: "Scene 2 — Heating the water", motion: "zoom-in", accent: { icon: "Flame", label: "Heating" } },
      { image: "/images/story/tea/s3.png", alt: "Adding tea leaves and ginger to the pot", narration: "She adds tea leaves and ginger to the pot.", caption: "Scene 3 — Adding tea and ginger", motion: "pan-right", accent: { icon: "Leaf", label: "Tea leaves" } },
      { image: "/images/story/tea/s4.png", alt: "Tea being poured into a steel tumbler", narration: "She pours the tea into a steel tumbler.", caption: "Scene 4 — Pouring the tea", motion: "pan-down", accent: { icon: "CupSoda", label: "Pouring" } },
      { image: "/images/story/tea/s5.png", alt: "The tumbler placed on a table beside a brass lamp", narration: "She places the tumbler on the table.", caption: "Scene 5 — Tea is ready", motion: "zoom-out", accent: { icon: "Heart", label: "Ready" } },
      { image: "/images/story/tea/s6.png", alt: "A family member entering the room", narration: "A family member arrives to share the tea.", caption: "Scene 6 — Sharing the tea", motion: "zoom-in", accent: { icon: "Users", label: "Family" } },
    ],
    questions: [
      q("sequencing", "What did Amma do first?", "She filled the kettle with water", ["She poured the tea", "She heated the water", "She added tea leaves"], "Filling the kettle with water was the first step."),
      q("sequencing", "What happened immediately before the tea was shared?", "A family member arrived", ["Amma filled the kettle", "Amma heated the water", "Amma added ginger"], "A family member arrived just before the tea was shared."),
      q("sequencing", "What happened after the water heated?", "Amma added tea leaves and ginger", ["Amma filled the kettle", "Amma poured the tea", "A family member arrived"], "After heating, she added tea leaves and ginger."),
      q("recall", "What did Amma add to the pot?", "Tea leaves and ginger", ["Sugar and milk only", "Rice and spices", "Flowers and fruit"], "She added tea leaves and ginger to the pot."),
      q("sequencing", "What happened last?", "A family member arrived to share the tea", ["Amma filled the kettle", "Amma heated the water", "Amma poured the tea"], "The family member arriving was the last event."),
    ],
  },

  // ── 3. Morning in the Garden ─────────────────────────────
  {
    id: "story-garden-morning",
    title: "A Morning in the Garden",
    description: "A calm morning tending to the home garden.",
    difficulty: "Easy",
    scene: "garden",
    icon: "Flower2",
    regionTags: ["Assam", "Karnataka", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura", "Arunachal Pradesh"],
    interests: ["Gardening", "Nature"],
    scenes: [
      { image: "/images/story/garden/s1.png", alt: "Amma stepping into the garden", narration: "Amma steps into the garden in the morning.", caption: "Scene 1 — Entering the garden", motion: "zoom-in", accent: { icon: "Sunrise", label: "Morning" } },
      { image: "/images/story/garden/s2.png", alt: "Amma beside red rose bushes", narration: "She pauses beside the red roses.", caption: "Scene 2 — The red roses", motion: "pan-left", accent: { icon: "Flower2", label: "Roses" } },
      { image: "/images/story/garden/s3.png", alt: "Amma admiring orange marigolds", narration: "She admires the orange marigolds.", caption: "Scene 3 — The marigolds", motion: "pan-right", accent: { icon: "Flower2", label: "Marigolds" } },
      { image: "/images/story/garden/s4.png", alt: "Amma picking up a steel watering can", narration: "She picks up the watering can.", caption: "Scene 4 — The watering can", motion: "zoom-in", accent: { icon: "Droplet", label: "Watering can" } },
      { image: "/images/story/garden/s5.png", alt: "Amma watering the plants", narration: "She waters the plants gently.", caption: "Scene 5 — Watering", motion: "pan-down", accent: { icon: "Droplet", label: "Watering" } },
      { image: "/images/story/garden/s6.png", alt: "Amma sitting on a bench resting", narration: "She sits on the bench to rest, as a butterfly visits.", caption: "Scene 6 — A moment of rest", motion: "zoom-out", accent: { icon: "Bird", label: "Butterfly" } },
    ],
    questions: [
      q("sequencing", "What did Amma do first in the garden?", "She stepped into the garden", ["She watered the plants", "She picked up the watering can", "She sat on the bench"], "Stepping into the garden was the first thing she did."),
      q("sequencing", "What happened immediately before she watered the plants?", "She picked up the watering can", ["She stepped into the garden", "She admired the marigolds", "She sat on the bench"], "She picked up the watering can just before watering."),
      q("recall", "What flowers did Amma see?", "Red roses and orange marigolds", ["White lilies and blue bells", "Pink lotus and yellow sunflowers", "Purple orchids"], "She saw red roses and orange marigolds."),
      q("sequencing", "What happened at the end?", "Amma sat on the bench to rest", ["She stepped into the garden", "She watered the plants", "She admired the roses"], "At the end, she sat on the bench to rest."),
      q("recall", "What visited the garden while Amma rested?", "A butterfly", ["A cat", "A dog", "A bird"], "A butterfly visited the flowers while she rested."),
    ],
  },

  // ── 4. Visit to the Local Shop ───────────────────────────
  {
    id: "story-local-shop",
    title: "A Visit to the Local Shop",
    description: "A short trip to the neighbourhood shop.",
    difficulty: "Moderate",
    scene: "shop",
    icon: "Store",
    regionTags: ["Assam", "Karnataka", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura", "Arunachal Pradesh"],
    interests: ["Cooking", "Family"],
    scenes: [
      { image: "/images/story/shop/s1.png", alt: "Amma approaching the shop entrance", narration: "Amma approaches the neighbourhood shop.", caption: "Scene 1 — Approaching the shop", motion: "zoom-in", accent: { icon: "Footprints", label: "Approaching" } },
      { image: "/images/story/shop/s2.png", alt: "Amma browsing jars on the shelf", narration: "She browses the jars on the shelf.", caption: "Scene 2 — Browsing", motion: "pan-right", accent: { icon: "Eye", label: "Browsing" } },
      { image: "/images/story/shop/s3.png", alt: "Amma speaking with the shopkeeper", narration: "She asks the shopkeeper for what she needs.", caption: "Scene 3 — Asking the shopkeeper", motion: "zoom-in", accent: { icon: "MessageCircle", label: "Asking" } },
      { image: "/images/story/shop/s4.png", alt: "Items placed on the counter", narration: "The shopkeeper places the items on the counter.", caption: "Scene 4 — Items on the counter", motion: "pan-down", accent: { icon: "Package", label: "Items" } },
      { image: "/images/story/shop/s5.png", alt: "Amma paying at the counter", narration: "Amma pays for her items.", caption: "Scene 5 — Paying", motion: "zoom-out", accent: { icon: "Coins", label: "Paying" } },
      { image: "/images/story/shop/s6.png", alt: "Amma leaving the shop with a bag", narration: "Amma leaves the shop with her bag.", caption: "Scene 6 — Leaving", motion: "zoom-out", accent: { icon: "Footprints", label: "Leaving" } },
    ],
    questions: [
      q("sequencing", "What did Amma do first?", "She approached the shop", ["She paid for items", "She left the shop", "She browsed the jars"], "Approaching the shop was the first thing she did."),
      q("sequencing", "What happened after Amma browsed the jars?", "She asked the shopkeeper", ["She approached the shop", "She paid", "She left"], "After browsing, she asked the shopkeeper."),
      q("recall", "What did the shopkeeper do?", "Placed the items on the counter", ["Watered the plants", "Cooked a meal", "Lit a lamp"], "The shopkeeper placed the items on the counter."),
      q("sequencing", "What happened before Amma left?", "She paid for her items", ["She approached the shop", "She browsed the jars", "She asked the shopkeeper"], "She paid just before leaving."),
    ],
  },

  // ── 5. Preparing a Family Meal ───────────────────────────
  {
    id: "story-family-meal",
    title: "Preparing a Family Meal",
    description: "Watch Amma prepare a warm family meal.",
    difficulty: "Moderate",
    scene: "cooking",
    icon: "Utensils",
    regionTags: ["Assam", "Karnataka", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura", "Arunachal Pradesh"],
    interests: ["Cooking", "Family"],
    scenes: [
      { image: "/images/story/meal/s1.png", alt: "Amma washing vegetables at the sink", narration: "Amma washes the vegetables at the sink.", caption: "Scene 1 — Washing vegetables", motion: "zoom-in", accent: { icon: "Droplet", label: "Washing" } },
      { image: "/images/story/meal/s2.png", alt: "Amma cutting vegetables on a board", narration: "She cuts the vegetables on the board.", caption: "Scene 2 — Cutting", motion: "pan-right", accent: { icon: "Scissors", label: "Cutting" } },
      { image: "/images/story/meal/s3.png", alt: "A pot heating on the stove", narration: "She heats a pot on the stove.", caption: "Scene 3 — Heating the pot", motion: "zoom-in", accent: { icon: "Flame", label: "Heating" } },
      { image: "/images/story/meal/s4.png", alt: "Adding spices to the pot", narration: "She adds mustard seeds and curry leaves.", caption: "Scene 4 — Adding spices", motion: "pan-down", accent: { icon: "Leaf", label: "Spices" } },
      { image: "/images/story/meal/s5.png", alt: "Amma stirring the pot", narration: "She stirs the cooking food.", caption: "Scene 5 — Stirring", motion: "zoom-in", accent: { icon: "Utensils", label: "Stirring" } },
      { image: "/images/story/meal/s6.png", alt: "Serving food onto a plate", narration: "She serves the food onto a plate.", caption: "Scene 6 — Serving", motion: "pan-down", accent: { icon: "Plate", label: "Serving" } },
      { image: "/images/story/meal/s7.png", alt: "Family gathering at the table", narration: "The family gathers at the table to eat.", caption: "Scene 7 — Family gathers", motion: "zoom-out", accent: { icon: "Users", label: "Family" } },
    ],
    questions: [
      q("sequencing", "What did Amma do first?", "She washed the vegetables", ["She cut the vegetables", "She heated the pot", "She served the food"], "Washing the vegetables was the first step."),
      q("sequencing", "What happened immediately before she stirred the food?", "She added spices", ["She washed the vegetables", "She cut the vegetables", "She served the food"], "She added spices just before stirring."),
      q("sequencing", "What happened after she served the food?", "The family gathered at the table", ["She washed the vegetables", "She heated the pot", "She cut the vegetables"], "After serving, the family gathered."),
      q("recall", "What spices did Amma add?", "Mustard seeds and curry leaves", ["Sugar and milk", "Rice and wheat", "Salt and pepper"], "She added mustard seeds and curry leaves."),
      q("sequencing", "What happened last?", "The family gathered at the table", ["Amma washed vegetables", "Amma cut vegetables", "Amma heated the pot"], "The family gathering was the final event."),
    ],
  },

  // ── 6. A Family Visit ────────────────────────────────────
  {
    id: "story-family-visit",
    title: "A Family Visit",
    description: "A warm visit from a younger family member.",
    difficulty: "Easy",
    scene: "home",
    icon: "Users",
    regionTags: ["Assam", "Karnataka", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura", "Arunachal Pradesh"],
    interests: ["Family", "Stories"],
    scenes: [
      { image: "/images/story/visit/s1.png", alt: "A family member arriving at the door", narration: "A family member arrives at the door.", caption: "Scene 1 — Arriving", motion: "zoom-in", accent: { icon: "DoorOpen", label: "Arriving" } },
      { image: "/images/story/visit/s2.png", alt: "Amma greeting the family member", narration: "Amma warmly greets them at the door.", caption: "Scene 2 — Greeting", motion: "zoom-in", accent: { icon: "Heart", label: "Greeting" } },
      { image: "/images/story/visit/s3.png", alt: "Sitting together in the living room", narration: "They sit together in the living room.", caption: "Scene 3 — Sitting together", motion: "pan-right", accent: { icon: "Sofa", label: "Sitting" } },
      { image: "/images/story/visit/s4.png", alt: "Amma serving tea and snacks", narration: "Amma serves tea and snacks.", caption: "Scene 4 — Serving snacks", motion: "pan-down", accent: { icon: "CupSoda", label: "Tea" } },
      { image: "/images/story/visit/s5.png", alt: "Looking at a photo album together", narration: "They look at old photographs together.", caption: "Scene 5 — Old photographs", motion: "zoom-in", accent: { icon: "Image", label: "Photographs" } },
      { image: "/images/story/visit/s6.png", alt: "A warm farewell at the door", narration: "Amma says a warm farewell at the door.", caption: "Scene 6 — Farewell", motion: "zoom-out", accent: { icon: "Hand", label: "Farewell" } },
    ],
    questions: [
      q("sequencing", "What happened first?", "A family member arrived at the door", ["Amma served tea", "They looked at photographs", "Amma said farewell"], "The family member arriving was the first event."),
      q("sequencing", "What happened after they sat together?", "Amma served tea and snacks", ["The family member arrived", "They looked at photographs", "Amma said farewell"], "After sitting, Amma served tea and snacks."),
      q("recall", "What did they look at together?", "Old photographs", ["A newspaper", "A television", "A map"], "They looked at old photographs together."),
      q("sequencing", "What happened at the end?", "Amma said a warm farewell", ["The family member arrived", "Amma served tea", "They sat together"], "The farewell at the door was the last event."),
    ],
  },

  // ── 7. Going to the Market (fruit) ───────────────────────
  {
    id: "story-fruit-market",
    title: "Going to the Fruit Market",
    description: "A trip to buy fresh fruit at the market.",
    difficulty: "Moderate",
    scene: "market",
    icon: "Apple",
    regionTags: ["Assam", "Karnataka", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura", "Arunachal Pradesh"],
    interests: ["Cooking", "Nature"],
    scenes: [
      { image: "/images/story/fruit/s1.png", alt: "Amma arriving at a fruit stall", narration: "Amma arrives at the fruit stall.", caption: "Scene 1 — At the fruit stall", motion: "zoom-in", accent: { icon: "Footprints", label: "Arriving" } },
      { image: "/images/story/fruit/s2.png", alt: "Amma examining mangoes", narration: "She examines the mangoes carefully.", caption: "Scene 2 — Examining mangoes", motion: "zoom-in", accent: { icon: "Eye", label: "Examining" } },
      { image: "/images/story/fruit/s3.png", alt: "Handing bananas to the shopkeeper", narration: "She hands bananas to the shopkeeper to weigh.", caption: "Scene 3 — Handing over bananas", motion: "pan-right", accent: { icon: "Hand", label: "Handing" } },
      { image: "/images/story/fruit/s4.png", alt: "Fruit on the weighing scale", narration: "The fruit is weighed on the scale.", caption: "Scene 4 — Weighing", motion: "pan-left", accent: { icon: "Scale", label: "Weighing" } },
      { image: "/images/story/fruit/s5.png", alt: "Amma paying at the fruit stall", narration: "Amma pays for the fruit.", caption: "Scene 5 — Paying", motion: "zoom-out", accent: { icon: "Coins", label: "Paying" } },
      { image: "/images/story/fruit/s6.png", alt: "Amma leaving with a bag of fruit", narration: "Amma leaves with her bag of fruit.", caption: "Scene 6 — Leaving", motion: "zoom-out", accent: { icon: "ShoppingBag", label: "Leaving" } },
    ],
    questions: [
      q("sequencing", "What did Amma do first?", "She arrived at the fruit stall", ["She examined the mangoes", "She paid for the fruit", "She left the market"], "Arriving at the fruit stall was the first event."),
      q("sequencing", "What happened after Amma examined the mangoes?", "She handed bananas to the shopkeeper", ["She arrived at the stall", "She paid for the fruit", "She left the market"], "After examining mangoes, she handed bananas to be weighed."),
      q("recall", "What fruit did Amma examine?", "Mangoes", ["Apples", "Oranges", "Grapes"], "She examined the mangoes carefully."),
      q("sequencing", "What happened before Amma paid?", "The fruit was weighed", ["She arrived at the stall", "She examined the mangoes", "She left the market"], "The fruit was weighed before she paid."),
      q("sequencing", "What happened last?", "Amma left with her bag of fruit", ["She arrived at the stall", "She examined the mangoes", "The fruit was weighed"], "Leaving with the bag of fruit was the last event."),
    ],
  },

  // ── 8. An Evening at Home ────────────────────────────────
  {
    id: "story-evening-home",
    title: "An Evening at Home",
    description: "A calm evening routine as the day ends.",
    difficulty: "Easy",
    scene: "home",
    icon: "Moon",
    regionTags: ["Assam", "Karnataka", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura", "Arunachal Pradesh"],
    interests: ["Family", "Devotion"],
    scenes: [
      { image: "/images/story/evening/s1.png", alt: "Amma lighting a brass oil lamp", narration: "Amma lights the brass oil lamp at dusk.", caption: "Scene 1 — Lighting the lamp", motion: "zoom-in", accent: { icon: "Flame", label: "Lighting" } },
      { image: "/images/story/evening/s2.png", alt: "Amma sitting in a chair near the lamp", narration: "She sits in her chair near the lamp.", caption: "Scene 2 — Settling down", motion: "zoom-out", accent: { icon: "Armchair", label: "Settling" } },
      { image: "/images/story/evening/s3.png", alt: "Amma holding a tablet showing a family photo", narration: "She looks at a family photograph on the tablet.", caption: "Scene 3 — A family photograph", motion: "zoom-in", accent: { icon: "Image", label: "Photograph" } },
      { image: "/images/story/evening/s4.png", alt: "Amma pouring tea from a steel pot", narration: "She pours herself a cup of evening tea.", caption: "Scene 4 — Pouring tea", motion: "pan-down", accent: { icon: "CupSoda", label: "Tea" } },
      { image: "/images/story/evening/s5.png", alt: "Amma with tea and a newspaper", narration: "She enjoys her tea with the newspaper.", caption: "Scene 5 — Tea and the news", motion: "pan-right", accent: { icon: "Newspaper", label: "Newspaper" } },
      { image: "/images/story/evening/s6.png", alt: "Amma resting peacefully near the lamp", narration: "She rests peacefully as the evening deepens.", caption: "Scene 6 — A peaceful rest", motion: "zoom-out", accent: { icon: "Moon", label: "Rest" } },
    ],
    questions: [
      q("sequencing", "What did Amma do first in the evening?", "She lit the brass lamp", ["She poured tea", "She looked at a photograph", "She rested"], "Lighting the brass lamp was the first thing she did."),
      q("sequencing", "What happened after she looked at the photograph?", "She poured herself tea", ["She lit the lamp", "She sat in the chair", "She rested"], "After looking at the photograph, she poured tea."),
      q("recall", "What did Amma look at on the tablet?", "A family photograph", ["A movie", "A news article", "A game"], "She looked at a family photograph on the tablet."),
      q("sequencing", "What happened at the end?", "Amma rested peacefully", ["She lit the lamp", "She poured tea", "She looked at a photograph"], "Resting peacefully was the final event."),
      q("recall", "What did Amma light at dusk?", "A brass oil lamp", ["A candle", "A stove", "A fire"], "She lit the brass oil lamp at dusk."),
    ],
  },
];

export function storyGameById(id: string): StoryGame | undefined {
  return STORY_GAMES.find((s) => s.id === id);
}

export function recommendedStories(regionState?: string, interests?: string[]): StoryGame[] {
  const all = STORY_GAMES;
  if (!regionState && !interests) return all;
  const matched = all.filter((s) => {
    const regionMatch = !s.regionTags.length || s.regionTags.includes(regionState || "");
    const interestMatch = !interests?.length || s.interests.some((i) => interests.includes(i));
    return regionMatch || interestMatch;
  });
  return matched.length ? matched : all;
}
