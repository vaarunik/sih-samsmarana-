// SAMSMARANA — Veo prompt builder
// Builds a realistic, calm, slow-paced, culturally familiar video
// specification for Google Veo. Strictly server-side usage.

import type { Activity, Profile, SceneKey } from "./types";
import { SCENE_META } from "./activities-data";

interface PromptInput {
  profile: Pick<
    Profile,
    "language" | "regionGroup" | "regionState" | "interests" | "name"
  >;
  activity: Pick<Activity, "title" | "scene" | "category" | "difficulty">;
}

/**
 * Build a Veo text-to-video prompt. The prompt is deliberately
 * constrained to produce REALISTIC, CALM, CLEAR, SLOW-PACED, WARM,
 * CULTURALLY FAMILIAR, ELDER-FRIENDLY footage — no cartoons, anime,
 * surreal visuals, rapid movement or flashing.
 */
export function buildVideoPrompt(input: PromptInput): string {
  const { profile, activity } = input;
  const scene = SCENE_META[activity.scene as SceneKey];
  const region = `${profile.regionState}, ${profile.regionGroup}, India`;
  const interests = (profile.interests ?? []).slice(0, 3).join(", ");
  const pace = activity.difficulty >= 4 ? "moderate" : "slow and gentle";

  return [
    `Cinematic, photorealistic 8-second video of ${scene.setting} in ${region}.`,
    `Warm, soft natural morning light; peaceful, ${pace} camera movement with a slow forward dolly and no rapid pans.`,
    `Culturally authentic details of ${profile.regionState}: familiar everyday objects, local produce, modest clothing, natural textures.`,
    interests ? `Subtle references to familiar interests (${interests}) woven naturally into the scene.` : "",
    `Documentary realism, shallow depth of field, lifelike colour, gentle ambient sound of the environment.`,
    `No text overlays, no captions, no logos, no watermarks.`,
    `No cartoon, no animation, no anime, no exaggerated 3D, no surreal elements, no flashing lights, no fast cuts.`,
    `Elder-friendly, calm and reassuring atmosphere. People, if visible, are engaged in quiet everyday activity and never face the camera directly.`,
    `Subjects: ${activity.title}. Composition favours clarity so a viewer can notice and remember specific objects, colours and their positions.`,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * A short human label describing the scene for UI display.
 */
export function sceneDescription(scene: SceneKey): string {
  return SCENE_META[scene].setting;
}
