// SAMSMARANA — generate DISTINCT realistic scene images for 8 stories.
// Each scene has its own action-specific visual (no reused images).
// Character continuity via consistent descriptors within each story.
// Run: bun scripts/gen-stories.mjs
import { execSync } from "child_process";
import { existsSync, mkdirSync, statSync } from "fs";

const AMMA = "an elderly Indian woman around 70 with grey hair tied back, wearing a muted teal cotton saree, gentle warm expression";
const ELDER_MAN = "an elderly Indian man around 72 with grey hair, wearing a muted kurta, gentle warm expression";

const jobs = [
  // ── 1. Vegetable Market (7 scenes) ─────────────────────────
  ["public/images/story/market/s1.png","1344x768",`Realistic documentary photograph, ${AMMA} walking toward the entrance of a small Indian vegetable market in the morning, carrying an empty woven basket, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/market/s2.png","1344x768",`Realistic documentary photograph, ${AMMA} standing inside a small Indian vegetable market looking toward the stalls, vegetable baskets visible around her, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/market/s3.png","1344x768",`Realistic documentary photograph, ${AMMA}'s hand reaching toward fresh tomatoes and vegetables on a market stall, a shopkeeper in a muted blue shirt nearby, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/market/s4.png","1344x768",`Realistic documentary photograph, vegetables placed on a weighing scale at an Indian market stall, a shopkeeper's hands adjusting the scale, ${AMMA} waiting beside the counter, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/market/s5.png","1344x768",`Realistic documentary photograph, ${AMMA} handing payment to the shopkeeper at an Indian vegetable market stall, vegetables nearby, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/market/s6.png","1344x768",`Realistic documentary photograph, a shopkeeper's hands packing vegetables into a cloth bag at an Indian market stall, ${AMMA} watching, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/market/s7.png","1344x768",`Realistic documentary photograph, ${AMMA} walking away from a small Indian vegetable market carrying a full cloth bag of vegetables, market behind her, soft daylight, shallow depth of field, photorealistic`],

  // ── 2. Preparing Tea (6 scenes) ────────────────────────────
  ["public/images/story/tea/s1.png","1344x768",`Realistic photograph, ${AMMA} filling a steel kettle with water at a home kitchen sink in the morning, soft window light, shallow depth of field, photorealistic`],
  ["public/images/story/tea/s2.png","1344x768",`Realistic photograph, a steel kettle heating on a home kitchen stove with steam rising, ${AMMA} standing beside the stove, warm morning light, shallow depth of field, photorealistic`],
  ["public/images/story/tea/s3.png","1344x768",`Realistic photograph, ${AMMA}'s hand adding tea leaves and a slice of ginger into a steel pot on the stove, warm light, steam, shallow depth of field, photorealistic`],
  ["public/images/story/tea/s4.png","1344x768",`Realistic photograph, tea being poured from a steel pot into a steel tumbler on a kitchen counter, ${AMMA}'s hands visible, warm morning light, shallow depth of field, photorealistic`],
  ["public/images/story/tea/s5.png","1344x768",`Realistic photograph, ${AMMA}'s hands placing a steel tumbler of tea on a wooden table beside a small brass lamp, warm morning light, shallow depth of field, photorealistic`],
  ["public/images/story/tea/s6.png","1344x768",`Realistic photograph, a younger family member entering a warm Indian living room where a steel tumbler of tea sits on a wooden table, soft daylight from a window, shallow depth of field, photorealistic`],

  // ── 3. Morning in the Garden (6 scenes) ────────────────────
  ["public/images/story/garden/s1.png","1344x768",`Realistic photograph, ${AMMA} stepping into a calm Indian home garden in the soft morning light, green plants and flowers around, shallow depth of field, photorealistic`],
  ["public/images/story/garden/s2.png","1344x768",`Realistic photograph, ${AMMA} pausing beside red rose bushes in a home garden, looking at the roses, soft golden morning light, shallow depth of field, photorealistic`],
  ["public/images/story/garden/s3.png","1344x768",`Realistic photograph, ${AMMA} admiring orange marigold flowers in a home garden, marigolds in focus, soft morning light, shallow depth of field, photorealistic`],
  ["public/images/story/garden/s4.png","1344x768",`Realistic photograph, ${AMMA} picking up a steel watering can from the ground in a home garden, soft morning light, shallow depth of field, photorealistic`],
  ["public/images/story/garden/s5.png","1344x768",`Realistic photograph, ${AMMA} watering plants with a steel watering can in a home garden, water flowing gently, soft morning light, shallow depth of field, photorealistic`],
  ["public/images/story/garden/s6.png","1344x768",`Realistic photograph, ${AMMA} sitting on a small bench in a home garden resting, a butterfly near the flowers, soft morning light, shallow depth of field, photorealistic`],

  // ── 4. Visit to the Local Shop (6 scenes) ──────────────────
  ["public/images/story/shop/s1.png","1344x768",`Realistic photograph, ${AMMA} approaching the entrance of a small Indian neighbourhood shop, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/shop/s2.png","1344x768",`Realistic photograph, ${AMMA} browsing glass jars on a shelf inside a small Indian shop, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/shop/s3.png","1344x768",`Realistic photograph, ${AMMA} speaking with a shopkeeper at the counter of a small Indian shop, a green tin of tea on the counter, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/shop/s4.png","1344x768",`Realistic photograph, the shopkeeper's hands placing a tin of tea and a small bag of rice on the counter of an Indian shop, ${AMMA} watching, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/shop/s5.png","1344x768",`Realistic photograph, ${AMMA} handing payment to the shopkeeper at the counter of a small Indian shop, items on the counter, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/shop/s6.png","1344x768",`Realistic photograph, ${AMMA} leaving a small Indian neighbourhood shop carrying a small bag of groceries, soft daylight, shallow depth of field, photorealistic`],

  // ── 5. Preparing a Family Meal (7 scenes) ──────────────────
  ["public/images/story/meal/s1.png","1344x768",`Realistic photograph, ${AMMA} washing vegetables at a home kitchen sink, water running, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/meal/s2.png","1344x768",`Realistic photograph, ${AMMA}'s hands cutting vegetables on a wooden cutting board in a home kitchen, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/meal/s3.png","1344x768",`Realistic photograph, a black steel pot heating on a home kitchen stove, ${AMMA} standing beside it, warm light, shallow depth of field, photorealistic`],
  ["public/images/story/meal/s4.png","1344x768",`Realistic photograph, ${AMMA}'s hand adding mustard seeds and curry leaves to a pot on the stove, warm light, steam, shallow depth of field, photorealistic`],
  ["public/images/story/meal/s5.png","1344x768",`Realistic photograph, ${AMMA} stirring a cooking pot on a home kitchen stove with a steel spoon, warm light, steam, shallow depth of field, photorealistic`],
  ["public/images/story/meal/s6.png","1344x768",`Realistic photograph, ${AMMA}'s hands serving food from a pot onto a plate on a kitchen counter, warm light, shallow depth of field, photorealistic`],
  ["public/images/story/meal/s7.png","1344x768",`Realistic photograph, ${AMMA} placing a plate of food on a dining table where family members are gathering, warm light, shallow depth of field, photorealistic`],

  // ── 6. A Family Visit (6 scenes) ───────────────────────────
  ["public/images/story/visit/s1.png","1344x768",`Realistic photograph, a younger family member arriving at the door of an Indian home, ${AMMA} opening the door to greet them, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/visit/s2.png","1344x768",`Realistic photograph, ${AMMA} warmly greeting a younger family member at the entrance of an Indian home, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/visit/s3.png","1344x768",`Realistic photograph, ${AMMA} and a younger family member sitting together on a sofa in an Indian living room, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/visit/s4.png","1344x768",`Realistic photograph, ${AMMA}'s hands serving tea and snacks on a tray to a family member in an Indian living room, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/visit/s5.png","1344x768",`Realistic photograph, ${AMMA} and a younger family member looking at an old photograph album together in an Indian living room, warm light, shallow depth of field, photorealistic`],
  ["public/images/story/visit/s6.png","1344x768",`Realistic photograph, ${AMMA} waving a warm farewell to a younger family member at the door of an Indian home, soft daylight, shallow depth of field, photorealistic`],

  // ── 7. Going to the Market (fruit) (6 scenes) ──────────────
  ["public/images/story/fruit/s1.png","1344x768",`Realistic photograph, ${AMMA} arriving at a fruit stall in an Indian market, mangoes and bananas displayed, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/fruit/s2.png","1344x768",`Realistic photograph, ${AMMA} examining mangoes at a fruit stall in an Indian market, holding a mango, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/fruit/s3.png","1344x768",`Realistic photograph, ${AMMA} handing a bunch of bananas to the shopkeeper to weigh at an Indian fruit stall, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/fruit/s4.png","1344x768",`Realistic photograph, bananas and mangoes on a weighing scale at an Indian fruit stall, the shopkeeper's hands visible, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/fruit/s5.png","1344x768",`Realistic photograph, ${AMMA} paying the shopkeeper at an Indian fruit stall, fruit nearby, soft daylight, shallow depth of field, photorealistic`],
  ["public/images/story/fruit/s6.png","1344x768",`Realistic photograph, ${AMMA} leaving an Indian fruit market carrying a bag of fruit, soft daylight, shallow depth of field, photorealistic`],

  // ── 8. An Evening at Home (6 scenes) ───────────────────────
  ["public/images/story/evening/s1.png","1344x768",`Realistic photograph, ${AMMA} lighting a small brass oil lamp at dusk in an Indian home, warm golden light, shallow depth of field, photorealistic`],
  ["public/images/story/evening/s2.png","1344x768",`Realistic photograph, ${AMMA} sitting in a chair in a warmly lit Indian living room at dusk, a lit brass lamp nearby, warm light, shallow depth of field, photorealistic`],
  ["public/images/story/evening/s3.png","1344x768",`Realistic photograph, ${AMMA} holding a tablet showing a family photograph in a warmly lit Indian living room at dusk, warm light, shallow depth of field, photorealistic`],
  ["public/images/story/evening/s4.png","1344x768",`Realistic photograph, ${AMMA} pouring a cup of tea from a steel pot in a warmly lit Indian kitchen at dusk, warm light, shallow depth of field, photorealistic`],
  ["public/images/story/evening/s5.png","1344x768",`Realistic photograph, ${AMMA} sitting with a cup of tea and a folded newspaper at a table in a warmly lit Indian home at dusk, warm light, shallow depth of field, photorealistic`],
  ["public/images/story/evening/s6.png","1344x768",`Realistic photograph, ${AMMA} resting peacefully in a chair near a lit brass lamp in an Indian home at dusk, warm golden evening light, shallow depth of field, photorealistic`],
];

for (const [out] of jobs) {
  const d = out.split("/").slice(0, -1).join("/");
  mkdirSync(d, { recursive: true });
}

async function run(job) {
  const [out, size, prompt] = job;
  if (existsSync(out) && statSync(out).size > 2000) { console.log("skip", out); return; }
  try {
    execSync(`z-ai image -p ${JSON.stringify(prompt)} -o ${out} -s ${size}`, { stdio: "pipe", timeout: 120000 });
    console.log("OK", out);
  } catch (e) {
    console.log("FAIL", out, String(e?.message || e).slice(0, 80));
  }
}

(async () => {
  const CONCURRENCY = 5;
  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    await Promise.all(jobs.slice(i, i + CONCURRENCY).map(run));
  }
  console.log("ALL DONE", jobs.length, "images");
})();
