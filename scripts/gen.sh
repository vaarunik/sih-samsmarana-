#!/bin/bash
# Generate remaining realistic images in parallel batches of 3.
cd /home/z/my-project
mkdir -p public/images/activities public/images/hero public/images/story

gen() {
  local out="$1"; local size="$2"; local prompt="$3"
  if [ -s "$out" ]; then echo "skip $out"; return; fi
  z-ai image -p "$prompt" -o "$out" -s "$size" >/dev/null 2>&1 \
    && echo "OK $out" || echo "FAIL $out"
}
export -f gen

# Run 3 at a time
{
gen "public/images/hero/hero.png" "1344x768" "Warm candid documentary photograph of an elderly Indian woman's hands resting on a wooden table holding a tablet showing a family photograph, beside a small brass diya lamp and a cup of tea, soft morning window light, shallow depth of field, calm dignified premium wellness brand aesthetic, no text no faces, photorealistic"
gen "public/images/activities/garden.png" "1344x768" "Realistic photograph of a calm Indian home garden in the morning, red roses on the left, orange marigolds, a steel watering can, a small bamboo basket, a butterfly, soft golden light, shallow depth of field, photorealistic"
gen "public/images/activities/tea.png" "1344x768" "Realistic photograph of tea being prepared in a home kitchen, a steel tumbler on the right, tea leaves, milk, a small piece of ginger, sugar, warm stove light, steam, shallow depth of field, photorealistic"
gen "public/images/activities/home.png" "1344x768" "Realistic photograph of a quiet Indian living room shelf, a brass lamp on the shelf, a wooden photo frame, two steel glasses, three bananas on a table, a folded newspaper, soft daylight, shallow depth of field, photorealistic"
gen "public/images/activities/cooking.png" "1344x768" "Realistic photograph of an Indian home kitchen during cooking, a black pot on the stove, rice, a steel spoon, mustard seeds, fresh curry leaves, warm light, steam, shallow depth of field, photorealistic"
gen "public/images/activities/birds.png" "1344x768" "Realistic photograph of a garden bird feeder in the morning, a brown sparrow, a green parrot, a myna, a branch above the feeder, soft natural light, shallow depth of field, wildlife photography, photorealistic"
gen "public/images/activities/river.png" "1344x768" "Realistic photograph of a calm river bank at dawn, a small wooden boat near the bank, a fisherman with a net, a white heron at the water edge, soft morning mist, muted blue and green tones, shallow depth of field, photorealistic"
gen "public/images/activities/community.png" "1344x768" "Realistic photograph of a quiet community courtyard, a stone bench under a large banyan tree, an elder and a child sitting, two tea glasses on the bench, soft afternoon light, shallow depth of field, documentary photography, photorealistic"
gen "public/images/activities/train.png" "1344x768" "Realistic photograph from inside a train looking out the window, green fields outside, a tea vendor in the aisle, a river in the distance, soft daylight, shallow depth of field, photorealistic"
gen "public/images/activities/festival.png" "1344x768" "Realistic photograph of a modest Indian festival preparation at home, small clay diyas with golden flames around a colourful rangoli, a sweet box, a flower garland, a banana leaf, warm evening light, shallow depth of field, photorealistic"
gen "public/images/activities/nature.png" "1344x768" "Realistic photograph of a peaceful natural landscape, a green hill in the distance, trees, a small stream in the foreground, soft clouds, a bird in the sky, muted green and blue tones, soft daylight, shallow depth of field, photorealistic"
gen "public/images/activities/shop.png" "1344x768" "Realistic photograph of a small Indian neighbourhood shop interior, glass jars on the top shelf, white rice bags on the floor, a green tin of tea, a notebook, a shopkeeper partially visible, soft daylight, shallow depth of field, photorealistic"
gen "public/images/story/tea-1.png" "1344x768" "Realistic photograph of an elderly Indian woman from behind, preparing tea at a home kitchen stove in the morning, warm light, steam, shallow depth of field, documentary photography, photorealistic"
gen "public/images/story/tea-2.png" "1344x768" "Realistic photograph of an elderly Indian woman hands placing a steel cup of tea on a wooden table beside a small brass lamp, warm morning light, shallow depth of field, photorealistic"
gen "public/images/story/tea-3.png" "1344x768" "Realistic photograph of a young family member entering a warm Indian living room where a cup of tea sits on a table, soft daylight from a window, shallow depth of field, documentary photography, photorealistic"
} | xargs -P 3 -I {} bash -c '{}'
echo "ALL DONE"
