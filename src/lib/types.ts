// SAMSMARANA — shared domain types

export type Role = "ELDER" | "CAREGIVER" | "FAMILY";

// Re-exported from i18n so the language set stays in one place.
export type { LanguageCode } from "./i18n";
import type { LanguageCode } from "./i18n";

export type ActivityCategory =
  | "recognition"
  | "recall"
  | "attention"
  | "counting"
  | "problem_solving"
  | "sequencing"
  | "language"
  | "concentration"
  | "spatial"
  | "story";

export type ViewKey =
  | "landing"
  | "onboarding"
  | "elder"
  | "caregiver"
  | "family";

export interface Profile {
  id: string;
  role: Role;
  name: string;
  age: number;
  language: LanguageCode;
  regionGroup: string;
  regionState: string;
  interests: string[];
  preferredActivities: ActivityCategory[];
  caregiverName?: string | null;
  caregiverRelation?: string | null;
  familyName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  /** which cognitive skill the question exercises */
  skill: ActivityCategory;
  prompt: string;
  options: string[];
  answerIndex: number;
  /** human-readable explanation shown after answering */
  explanation: string;
  /**
   * Optional grounding marker. When set, the answer is grounded in the
   * stimulus by construction (e.g. "not in scene" questions, or counts
   * derived from the object list) and bypasses the strict membership check.
   */
  answerGroundedBy?: "not-in-scene" | "object-count" | "people-count" | "reasoning";
}

export interface Activity {
  id: string;
  category: ActivityCategory;
  title: string;
  description: string;
  /** scene used to drive the Veo prompt */
  scene: SceneKey;
  difficulty: number; // 1..5
  /** activity can be played as a standard (no video) drill */
  standard: boolean;
  /** activity can request an AI personalised video */
  video: boolean;
  icon: string;
}

export type SceneKey =
  | "garden"
  | "market"
  | "shop"
  | "cooking"
  | "tea"
  | "train"
  | "nature"
  | "birds"
  | "home"
  | "community"
  | "river"
  | "festival";

export interface AttemptRecord {
  id: string;
  profileId: string;
  activityId: string;
  category: ActivityCategory;
  title: string;
  difficulty: number;
  accuracy: number; // 0..1
  responseMs: number;
  completed: boolean;
  skipped: boolean;
  score: number;
  syncState: "synced" | "pending";
  syncId: string;
  createdAt: string;
  /** the stimulus (scene) shown for this attempt — supports content rotation */
  stimulusId?: string;
}

export interface ReminderItem {
  id: string;
  profileId: string;
  type:
    | "medication"
    | "appointment"
    | "meal"
    | "hydration"
    | "activity"
    | "routine";
  title: string;
  time: string;
  days: string[];
  enabled: boolean;
  createdAt: string;
}

export interface FamilyMessageItem {
  id: string;
  profileId: string;
  fromName: string;
  type: "text" | "voice" | "photo" | "clip" | "occasion" | "note";
  content: string;
  caption?: string | null;
  createdAt: string;
}

export interface VideoState {
  id: string;
  profileId: string;
  activityId: string;
  category: ActivityCategory;
  prompt: string;
  model: string;
  operationId?: string | null;
  status: "preparing" | "generating" | "ready" | "failed" | "unavailable";
  videoUrl?: string | null;
  questions: Question[];
  message?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingData {
  name: string;
  age: number;
  language: LanguageCode;
  regionGroup: string;
  regionState: string;
  interests: string[];
  preferredActivities: ActivityCategory[];
  caregiverName: string;
  caregiverRelation: string;
}
