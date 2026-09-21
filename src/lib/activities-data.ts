// SAMSMARANA — regional & activity reference data

import type { ActivityCategory, SceneKey } from "./types";

export interface RegionGroup {
  name: string;
  states: string[];
}

// North Eastern Region is a core requirement (SIH context).
export const REGION_GROUPS: RegionGroup[] = [
  {
    name: "North Eastern Region",
    states: [
      "Assam",
      "Arunachal Pradesh",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Sikkim",
      "Tripura",
    ],
  },
  {
    name: "South India",
    states: ["Karnataka", "Kerala", "Tamil Nadu", "Andhra Pradesh", "Telangana"],
  },
  {
    name: "North India",
    states: ["Delhi", "Uttar Pradesh", "Punjab", "Haryana", "Rajasthan"],
  },
  {
    name: "East India",
    states: ["West Bengal", "Odisha", "Bihar", "Jharkhand"],
  },
  {
    name: "West India",
    states: ["Maharashtra", "Gujarat", "Goa"],
  },
];

export const INTERESTS: string[] = [
  "Gardening",
  "Cooking",
  "Music",
  "Stories",
  "Nature",
  "Devotion",
  "Farming",
  "Weaving",
  "Tea",
  "Birds",
  "Festivals",
  "Family",
  "Travel",
  "Reading",
];

export const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; blurb: string; icon: string }
> = {
  recognition: {
    label: "Recognition",
    blurb: "Identify objects, people and scenes.",
    icon: "Eye",
  },
  recall: {
    label: "Recall",
    blurb: "Remember the order and details of what appeared.",
    icon: "Brain",
  },
  attention: {
    label: "Attention",
    blurb: "Notice specific details and changes.",
    icon: "Focus",
  },
  counting: {
    label: "Counting",
    blurb: "Count objects accurately and quickly.",
    icon: "Hash",
  },
  problem_solving: {
    label: "Problem Solving",
    blurb: "Reason through small everyday puzzles.",
    icon: "Puzzle",
  },
  sequencing: {
    label: "Sequencing",
    blurb: "Reconstruct the order of events.",
    icon: "ListOrdered",
  },
  language: {
    label: "Language",
    blurb: "Connect familiar words and meanings.",
    icon: "Languages",
  },
  concentration: {
    label: "Concentration",
    blurb: "Stay focused through a short task.",
    icon: "Target",
  },
  spatial: {
    label: "Spatial Awareness",
    blurb: "Recall where things were placed.",
    icon: "Compass",
  },
  story: {
    label: "Story",
    blurb: "Follow a short visual story and recall what happened.",
    icon: "BookOpen",
  },
};

export const SCENE_META: Record<SceneKey, { label: string; setting: string; image: string }> = {
  garden: { label: "Garden", setting: "a calm home garden with familiar plants and flowers", image: "/images/activities/garden.png" },
  market: { label: "Vegetable Market", setting: "a small local vegetable market stall", image: "/images/activities/market.png" },
  shop: { label: "Local Shop", setting: "a familiar neighbourhood shop", image: "/images/activities/shop.png" },
  cooking: { label: "Cooking", setting: "a home kitchen preparing a familiar meal", image: "/images/activities/cooking.png" },
  tea: { label: "Tea Preparation", setting: "tea being prepared in a familiar kitchen", image: "/images/activities/tea.png" },
  train: { label: "Train Journey", setting: "a gentle train journey through countryside", image: "/images/activities/train.png" },
  nature: { label: "Nature", setting: "a peaceful natural landscape", image: "/images/activities/nature.png" },
  birds: { label: "Birds", setting: "familiar birds visiting a garden in the morning", image: "/images/activities/birds.png" },
  home: { label: "Home", setting: "a familiar home living room with everyday objects", image: "/images/activities/home.png" },
  community: { label: "Community", setting: "a quiet community courtyard", image: "/images/activities/community.png" },
  river: { label: "River", setting: "a calm river bank at dawn", image: "/images/activities/river.png" },
  festival: { label: "Festival", setting: "a modest, warm festival preparation at home", image: "/images/activities/festival.png" },
};

export interface ActivityTemplate {
  id: string;
  category: ActivityCategory;
  title: string;
  description: string;
  scene: SceneKey;
  difficulty: number;
  standard: boolean;
  video: boolean;
  icon: string;
}

// A curated library of cognitive activities. Each can be played as a
// standard drill; those flagged `video` can also request a real Veo clip.
export const ACTIVITIES: ActivityTemplate[] = [
  {
    id: "act-recognition-market",
    category: "recognition",
    title: "What Did You See?",
    description: "Watch the market scene and recognise the objects on the stall.",
    scene: "market",
    difficulty: 2,
    standard: true,
    video: true,
    icon: "Eye",
  },
  {
    id: "act-recall-garden",
    category: "recall",
    title: "What Came First?",
    description: "Recall the order of things that appeared in the garden.",
    scene: "garden",
    difficulty: 3,
    standard: true,
    video: true,
    icon: "Brain",
  },
  {
    id: "act-attention-tea",
    category: "attention",
    title: "Notice the Details",
    description: "Pay attention to colours and movement during tea preparation.",
    scene: "tea",
    difficulty: 2,
    standard: true,
    video: true,
    icon: "Focus",
  },
  {
    id: "act-counting-birds",
    category: "counting",
    title: "How Many?",
    description: "Count the birds that visit the garden.",
    scene: "birds",
    difficulty: 2,
    standard: true,
    video: true,
    icon: "Hash",
  },
  {
    id: "act-spatial-home",
    category: "spatial",
    title: "Where Was It?",
    description: "Recall where everyday objects were placed in the home.",
    scene: "home",
    difficulty: 3,
    standard: true,
    video: true,
    icon: "Compass",
  },
  {
    id: "act-sequencing-cooking",
    category: "sequencing",
    title: "What Happened Next?",
    description: "Reconstruct the order of steps in a familiar cooking scene.",
    scene: "cooking",
    difficulty: 3,
    standard: true,
    video: true,
    icon: "ListOrdered",
  },
  {
    id: "act-concentration-river",
    category: "concentration",
    title: "Stay With the Scene",
    description: "Focus gently on the calm river scene and answer afterwards.",
    scene: "river",
    difficulty: 2,
    standard: true,
    video: true,
    icon: "Target",
  },
  {
    id: "act-problem-shop",
    category: "problem_solving",
    title: "Everyday Reasoning",
    description: "Reason through a small situation at the local shop.",
    scene: "shop",
    difficulty: 4,
    standard: true,
    video: false,
    icon: "Puzzle",
  },
  {
    id: "act-language-festival",
    category: "language",
    title: "Familiar Words",
    description: "Connect familiar festival words and meanings.",
    scene: "festival",
    difficulty: 2,
    standard: true,
    video: false,
    icon: "Languages",
  },
  {
    id: "act-recognition-train",
    category: "recognition",
    title: "Along the Journey",
    description: "Recognise what passes by during a gentle train journey.",
    scene: "train",
    difficulty: 3,
    standard: true,
    video: true,
    icon: "Eye",
  },
  {
    id: "act-counting-market",
    category: "counting",
    title: "At the Stall",
    description: "Count the vegetables and baskets at the market stall.",
    scene: "market",
    difficulty: 2,
    standard: true,
    video: true,
    icon: "Hash",
  },
  {
    id: "act-recall-community",
    category: "recall",
    title: "Courtyard Memories",
    description: "Recall the people and objects in the community courtyard.",
    scene: "community",
    difficulty: 3,
    standard: true,
    video: true,
    icon: "Brain",
  },
  {
    id: "act-story-tea",
    category: "story",
    title: "Lakshmi's Morning Tea",
    description: "Follow a short visual story about a morning tea, then recall what happened.",
    scene: "tea",
    difficulty: 2,
    standard: true,
    video: false,
    icon: "BookOpen",
  },
];

export function activitiesForCategory(cat: ActivityCategory): ActivityTemplate[] {
  return ACTIVITIES.filter((a) => a.category === cat);
}

export function activityById(id: string): ActivityTemplate | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}
