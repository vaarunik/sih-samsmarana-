// SAMSMARANA — batch realistic image generation (server-side, one-off).
// Generates realistic photographs for each cognitive activity scene,
// the hero visual, and the story sequence. Run once: `bun run gen:images`.

import ZAI from "z-ai-web-dev-sdk";
import { promises as fs } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "public", "images");

const JOBS: { out: string; size: string; prompt: string }[] = [
  {
    out: "hero/hero.png",
    size: "1344x768",
    prompt:
      "Warm, candid documentary photograph of an elderly Indian woman's hands resting on a wooden table holding a tablet showing a family photograph, beside a small brass diya lamp and a cup of tea, soft morning window light, shallow depth of field, calm and dignified, premium wellness brand aesthetic, no text, no faces visible, photorealistic",
  },
  {
    out: "activities/market.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of a small Indian vegetable market stall from the front, red tomatoes on the left, green pumpkins on the right, a woven bamboo basket, a shopkeeper in a muted blue shirt partially visible, soft daylight, shallow depth of field, documentary photography, no text, photorealistic",
  },
  {
    out: "activities/garden.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of a calm Indian home garden in the morning, red roses on the left, orange marigolds, a steel watering can, a small bamboo basket, a butterfly, soft golden light, shallow depth of field, photorealistic",
  },
  {
    out: "activities/tea.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of tea being prepared in a home kitchen, a steel tumbler on the right, tea leaves, milk, a small piece of ginger, sugar, warm stove light, steam, shallow depth of field, photorealistic",
  },
  {
    out: "activities/home.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of a quiet Indian living room shelf, a brass lamp on the shelf, a wooden photo frame, two steel glasses, three bananas on a table, a folded newspaper, soft daylight, shallow depth of field, photorealistic",
  },
  {
    out: "activities/cooking.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of an Indian home kitchen during cooking, a black pot on the stove, rice, a steel spoon, mustard seeds, fresh curry leaves, warm light, steam, shallow depth of field, photorealistic",
  },
  {
    out: "activities/birds.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of a garden bird feeder in the morning, a brown sparrow, a green parrot, a myna, a branch above the feeder, soft natural light, shallow depth of field, wildlife photography, photorealistic",
  },
  {
    out: "activities/river.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of a calm river bank at dawn, a small wooden boat near the bank, a fisherman with a net, a white heron at the water's edge, soft morning mist, muted blue and green tones, shallow depth of field, photorealistic",
  },
  {
    out: "activities/community.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of a quiet community courtyard, a stone bench under a large banyan tree, an elder and a child sitting, two tea glasses on the bench, soft afternoon light, shallow depth of field, documentary photography, photorealistic",
  },
  {
    out: "activities/train.png",
    size: "1344x768",
    prompt:
      "Realistic photograph taken from inside a train looking out the window, green fields outside, a tea vendor in the aisle, a river in the distance, soft daylight, shallow depth of field, photorealistic",
  },
  {
    out: "activities/festival.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of a modest Indian festival preparation at home, small clay diyas with golden flames around a colourful rangoli, a sweet box, a flower garland, a banana leaf, warm evening light, shallow depth of field, photorealistic",
  },
  {
    out: "activities/nature.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of a peaceful natural landscape, a green hill in the distance, trees, a small stream in the foreground, soft clouds, a bird in the sky, muted green and blue tones, soft daylight, shallow depth of field, photorealistic",
  },
  {
    out: "activities/shop.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of a small Indian neighbourhood shop interior, glass jars on the top shelf, white rice bags on the floor, a green tin of tea, a notebook, a shopkeeper partially visible, soft daylight, shallow depth of field, photorealistic",
  },
  {
    out: "story/tea-1.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of an elderly Indian woman from behind, preparing tea at a home kitchen stove in the morning, warm light, steam, shallow depth of field, documentary photography, photorealistic",
  },
  {
    out: "story/tea-2.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of an elderly Indian woman's hands placing a steel cup of tea on a wooden table beside a small brass lamp, warm morning light, shallow depth of field, photorealistic",
  },
  {
    out: "story/tea-3.png",
    size: "1344x768",
    prompt:
      "Realistic photograph of a young family member entering a warm Indian living room where a cup of tea sits on a table, soft daylight from a window, shallow depth of field, documentary photography, photorealistic",
  },
];

async function main() {
  const zai = await ZAI.create();
  await fs.mkdir(path.join(ROOT, "activities"), { recursive: true });
  await fs.mkdir(path.join(ROOT, "hero"), { recursive: true });
  await fs.mkdir(path.join(ROOT, "story"), { recursive: true });

  let ok = 0;
  let failed = 0;
  for (const job of JOBS) {
    const outPath = path.join(ROOT, job.out);
    try {
      if (await exists(outPath)) {
        console.log(`skip (exists): ${job.out}`);
        ok++;
        continue;
      }
      console.log(`generating: ${job.out} (${job.size})`);
      const res = await zai.images.generations.create({
        prompt: job.prompt,
        size: job.size as never,
      });
      const b64 = res.data?.[0]?.base64;
      if (!b64) throw new Error("no image data");
      await fs.writeFile(outPath, Buffer.from(b64, "base64"));
      console.log(`  ✓ ${job.out}`);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${job.out}: ${(e as Error).message}`);
      failed++;
    }
  }
  console.log(`\nDone. ok=${ok} failed=${failed} total=${JOBS.length}`);
}

async function exists(p: string): Promise<boolean> {
  try {
    const s = await fs.stat(p);
    return s.size > 1000;
  } catch {
    return false;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
