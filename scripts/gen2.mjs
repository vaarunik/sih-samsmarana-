import { execSync } from "child_process";
import { existsSync, statSync } from "fs";

const jobs = [
  ["public/images/activities/cooking.png","1344x768","Realistic photograph of an Indian home kitchen during cooking, a black pot on the stove, rice, a steel spoon, mustard seeds, fresh curry leaves, warm light, steam, shallow depth of field, photorealistic"],
  ["public/images/activities/birds.png","1344x768","Realistic photograph of a garden bird feeder in the morning, a brown sparrow, a green parrot, a myna, a branch above the feeder, soft natural light, shallow depth of field, wildlife photography, photorealistic"],
  ["public/images/activities/river.png","1344x768","Realistic photograph of a calm river bank at dawn, a small wooden boat near the bank, a fisherman with a net, a white heron at the water edge, soft morning mist, muted blue and green tones, shallow depth of field, photorealistic"],
  ["public/images/activities/community.png","1344x768","Realistic photograph of a quiet community courtyard, a stone bench under a large banyan tree, an elder and a child sitting, two tea glasses on the bench, soft afternoon light, shallow depth of field, documentary photography, photorealistic"],
  ["public/images/activities/train.png","1344x768","Realistic photograph from inside a train looking out the window, green fields outside, a tea vendor in the aisle, a river in the distance, soft daylight, shallow depth of field, photorealistic"],
  ["public/images/activities/festival.png","1344x768","Realistic photograph of a modest Indian festival preparation at home, small clay diyas with golden flames around a colourful rangoli, a sweet box, a flower garland, a banana leaf, warm evening light, shallow depth of field, photorealistic"],
  ["public/images/activities/nature.png","1344x768","Realistic photograph of a peaceful natural landscape, a green hill in the distance, trees, a small stream in the foreground, soft clouds, a bird in the sky, muted green and blue tones, soft daylight, shallow depth of field, photorealistic"],
  ["public/images/activities/shop.png","1344x768","Realistic photograph of a small Indian neighbourhood shop interior, glass jars on the top shelf, white rice bags on the floor, a green tin of tea, a notebook, a shopkeeper partially visible, soft daylight, shallow depth of field, photorealistic"],
  ["public/images/story/tea-1.png","1344x768","Realistic photograph of an elderly Indian woman from behind, preparing tea at a home kitchen stove in the morning, warm light, steam, shallow depth of field, documentary photography, photorealistic"],
  ["public/images/story/tea-2.png","1344x768","Realistic photograph of an elderly Indian woman hands placing a steel cup of tea on a wooden table beside a small brass lamp, warm morning light, shallow depth of field, photorealistic"],
  ["public/images/story/tea-3.png","1344x768","Realistic photograph of a young family member entering a warm Indian living room where a cup of tea sits on a table, soft daylight from a window, shallow depth of field, documentary photography, photorealistic"],
];

async function run(job) {
  const [out, size, prompt] = job;
  if (existsSync(out) && statSync(out).size > 1000) { console.log("skip", out); return; }
  try {
    execSync(`z-ai image -p ${JSON.stringify(prompt)} -o ${out} -s ${size}`, {stdio:"pipe", timeout: 120000});
    console.log("OK", out);
  } catch (e) { console.log("FAIL", out, String(e?.message||e).slice(0,80)); }
}

(async () => {
  for (let i=0; i<jobs.length; i+=3) {
    await Promise.all(jobs.slice(i, i+3).map(run));
  }
  console.log("ALL DONE");
})();
