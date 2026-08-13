# ORBITAL CRASH — key art generation brief

For generating the title-screen background. **Background layer only** — the wordmark, every button and
all text stay vector on top, because they must scale, stay crisp, and swap between English and Korean.

---

## ⚠️ Read this first: the menu currently hides whatever is behind it

`.overlay` (which `#menu` uses) ships this:

```css
background:radial-gradient(120% 90% at 50% 40%,rgba(14,22,44,.55),rgba(6,8,20,.94));
backdrop-filter:blur(4px);
```

So anything behind the menu is **blurred 4px and washed 55% opaque at the centre, rising to 94% at the
edges.** Drop key art behind the menu as it stands today and you will see almost none of it — the
corners are 94% covered, which is where you'd naturally put the planet limb and the debris.

**The art cannot land until `#menu` gets its own overlay treatment** — a much lighter wash (~0.25–0.45
at the edges), no `backdrop-filter`, and a local scrim behind the button column only, so the buttons
keep their contrast without flattening the whole frame. That is a code change, not a generation
change, and it has to happen in the same commit as the first image.

---

## Deliverables

| file | size | ratio | use |
|---|---|---|---|
| `art/keyart-wide.webp` | 2560×1440 | 16:9 | desktop / landscape, `object-fit:cover` |
| `art/keyart-tall.webp` | 1440×2560 | 9:16 | phone portrait, `object-fit:cover` |
| `og-image.png` | 1200×630 | — | crop from wide + wordmark composited |
| itch capsule | 630×500 | — | crop from wide + wordmark |

Generate **wide and tall as separate images**, not one cropped both ways. A 16:9 crop of a portrait
frame throws away the composition, and `cover` will centre-crop exactly the part you cared about.

**Weight budget: ≤250 KB each, hard cap 400 KB.** The entire web build is currently ~800 KB and makes
zero network requests; a 3 MB background changes what the product is on a phone connection.

---

## Safe areas — measured from the live layout, not estimated

Percentages of frame height, from a real title screen:

| band | contents |
|---|---|
| 0 – 25% | free (language pills sit top-right, 87–98% across, 1.4–4% down) |
| **25 – 80%** | **UI. Keep all detail out.** wordmark 29.5–41.9%, primary button 51.8–56.5%, mode row 57.8–61.4%, links 64.7–66.9%, hint 68.6–70.5% |
| 80 – 100% | free |

Horizontally the title's outer orbit ring spans **8% – 92%**, so it crosses almost the full width at
30–43% height. Nothing bright or busy in that band.

**Put the interest in the top quarter and the bottom quarter.** The middle must be near-empty and
near-black or the wordmark and buttons lose contrast. On a landscape phone the layout compresses
further, so treat 20–80% as the reserved band if in doubt.

---

## Palette — taken from the code, not chosen

```
page background   #060814
epoch darks       #0a1526  #04060f  #07181a  #03080b  #1c0e0a  #0a0403  #160b26  #08040f
epoch tints       #6a96b5 (slate)  #7ea487 (green)  #906257 (copper)  #cfb190 (straw)
polarity          #ff3f6c red      #38e0ff cyan
```

**Polarity red and cyan are light sources, never surfaces.** They may appear as the glow of two distant
bodies, or as rim light. They must not tint large areas of dust or rock.

⚠️ **These three colours are reserved and must not appear as significant areas of the art**, because the
game has already assigned them meanings the player has to read instantly:

- **gold `#ffcf4d`** — rewards
- **violet `#9b6bff`** — incoming danger warnings
- **lime `#8dff6b`** — the Bomber's fuse, and nothing else

A gold nebula in the background is not a taste problem; it is the title screen teaching a colour that
means something else in play.

**The frame must be very dark.** The game's own nebula ships at 0.062 brightness. Aim for roughly 85%
of pixels below L\*15 — far darker than a generator will give you by default.

---

## The prompt

```
Deep space photograph, extremely dark, near-black field. An enormous planet sits
almost entirely below the frame — only its topmost sliver enters the very bottom edge,
its curve so shallow it is nearly a straight line, lit only by a thin rim of light.
Two small distant point-light sources far apart in the upper half, one crimson, one
blue-cyan, each a tiny bright core with a soft falloff. Sparse faint starfield. Very low-contrast dust and nebula, cold
slate blue and dim copper, heavily desaturated. Empty black space across the middle of
the frame. Scientific astronomical photography, Hubble and JWST deep field, ESO imagery.
Emissive light only, no ambient fill, no cast shadows. Wide vista, enormous scale,
silent and cold.
```

Append for the wide version: `16:9 composition, the planet edge a shallow almost-flat arc entering the very bottom edge of the frame.`
Append for the tall version: `9:16 vertical composition, the planet edge a shallow almost-flat arc entering the very bottom edge, empty sky filling everything above.`

⚠️ **THIS LINE USED TO SAY "LOWER THIRD" AND THAT WAS WRONG.** The lower third is 67–100% of the
frame, and the reserved band above runs to 80% — so the old wording asked for the brightest curve in
the image to land exactly where the buttons are. The first real candidate peaked its rim at 66%,
which is precisely what was asked for. **The limb must occupy only the bottom ~15%, peaking no higher
than 85%.** Percentages do not steer a generator, so the phrasing that does the work is *shallow*,
*almost-flat*, *only a sliver*, and *so large its edge is nearly a straight line* — a planet whose
curve is visibly round is a planet small enough to climb into the composition.

### Negative prompt

```
text, letters, words, title, logo, watermark, signature, UI, buttons, HUD, frame, border,
reticle, spaceship, spacecraft, ship, rocket, satellite, astronaut, character, creature,
lens flare, light leak, bokeh, chromatic aberration, vignette, heavy grain, bright
background, daylight, warm gold, yellow, orange, purple, magenta, green, busy detail in
the center, high contrast center, sun in frame, planet fully visible, cartoon,
illustration, concept art, painterly, Unreal Engine render
```

Two of those matter more than the rest: **no text** (models garble letterforms, and the wordmark is
vector) and **no vignette** (the game applies its own, deliberately capped at 0.20 because the rim is
where every enemy enters — a baked-in vignette would double it).

---

## Your edit pass — what to fix after generation

In roughly this order:

1. **Crush the blacks.** Generated space art is always too bright. Pull the black point until the
   empty regions read as genuinely black, not dark grey. This single step does more than anything else
   to make it match the game.
2. **Desaturate everything that is not the two poles.** Dust and rock should be near-neutral.
3. **Remove any gold, violet or lime regions** — see the reserved colours above.
4. **Flatten the middle band.** Anything with structure between 25% and 80% height gets darkened or
   cloned out.
5. **Soften every hard edge in the central third.** A hard bright edge behind the wordmark competes
   with it; the game's own Law 3 argument is that a hard luminance boundary reads as something to aim
   at.
6. **Composite the real wordmark over it and check contrast** before accepting the image. If the
   wordmark needs a scrim to be readable, the art is too bright.
7. **Export WebP**, quality ~82, and check the file size against the budget above.

---

## Integration checklist — three traps that each fail silently

- ⚠️ **Put files in `art/`, never `assets/`.** `assets/` is gitignored (`.gitignore:27`) *and*
  `npm run icons:ios` starts with `rm -rf assets`. Anything there is deleted by the next icon build.
- ⚠️ **Add `art/` to the `build` script's copy list** in `package.json`. It currently copies only
  `index.html bestiary.html manifest.webmanifest sw.js` and `icons/`, so new art will 404 in `www/`
  and in the iOS build **while the dev server keeps working perfectly**.
- ⚠️ **Add the files to `SHELL` in `sw.js` and bump `CACHE`.** The comment there states the bump is
  the whole release mechanism; without it the first offline load misses the art.
- **CSP:** `img-src 'self'` permits same-origin files and **blocks `data:`** — ship as files, never
  inlined base64.
- **Lighten the `#menu` overlay** — see the warning at the top. Without this, none of the above shows.
- **Update `README.md`.** *"every graphic is drawn on the canvas"* and *"Nothing here comes from
  anywhere else"* both become false the moment this lands.

---

## How to actually run this

**Your part is two steps: pick a tool, paste a prompt. Everything downstream is code.**

### Step 1 — pick a tool, and know the catch

⚠️ **Negative prompts only work in some tools.** The negative list above is not a universal feature —
in ChatGPT/DALL·E and Gemini it does nothing, and writing "no spaceships" can even *summon* one.

| tool | negative prompt | aspect ratio | notes |
|---|---|---|---|
| **Midjourney** | yes, `--no a, b, c` | `--ar 16:9` | best fit for this kind of atmospheric space art |
| **Stable Diffusion** (Automatic1111, ComfyUI, Leonardo) | yes, own field | width/height | most control, most setup |
| **ChatGPT / DALL·E** | **no** | ask in words | easiest if you already pay for it — use the positive-only prompt below |
| **Gemini / Imagen** | **no** | ask in words | same as above |

### Step 2 — paste the right version

**Midjourney** (one line):

```
deep space photograph, extremely dark near-black field, only the topmost sliver of an enormous planet entering the very bottom edge, its edge almost a straight line, lit only by a thin rim of light, two small distant point lights far apart in the upper half, one crimson one blue-cyan, sparse faint starfield, very low contrast dust and nebula in cold slate blue and dim copper, heavily desaturated, empty black space across the middle of the frame, scientific astronomical photography, Hubble JWST deep field, emissive light only, no ambient fill, enormous scale, silent and cold --ar 16:9 --no text, letters, logo, watermark, UI, buttons, HUD, frame, border, spaceship, rocket, satellite, astronaut, character, lens flare, bokeh, vignette, bright background, gold, yellow, orange, purple, green, teal, turquoise, busy center, cartoon, illustration, concept art
```

Swap `--ar 16:9` for `--ar 9:16` to get the portrait version.

**ChatGPT / Gemini** — negatives don't work, so everything is stated positively:

```
Generate a 16:9 image, 2560x1440.

A photograph of deep space, taken from orbit. The frame is overwhelmingly black —
about 85% of the image should be near-black, darker than you would normally make it.

Composition: an ENORMOUS planet sits mostly below the frame. Only the topmost sliver
of it enters the very bottom edge — so large that its edge is almost a straight line,
a shallow arc rising no higher than one sixth of the way up the image. It is visible
only as a thin bright rim of light; the planet body itself is unlit and reads as a
solid dark mass. Everything above it is empty black sky with a sparse scattering of
faint stars. Two small distant point-lights sit far apart in the UPPER portion of the
frame, one cool blue-cyan, one crimson, each a tiny bright core with a soft glow.

The MIDDLE of the frame must stay empty and black — no detail, no structure, nothing
bright between roughly 25% and 80% of the image height. Nothing should rise into the
middle from below.

Colour: near-black with faint cold slate-blue and dim copper dust, heavily desaturated.
The only saturated colours anywhere are the two small red and cyan point-lights.

Style: real scientific astronomical photography, in the manner of Hubble and JWST deep
field images. Light is emissive only — objects glow on their own against black, with no
ambient fill and no cast shadows. The mood is silent, cold and enormous.
```

For the portrait version, change the first line to `9:16 image, 1440x2560` and move the planet limb
to the lower quarter.

### Step 3 — generate several, not one

Make **6–8 candidates**, not one. Variation is cheap and the first result is rarely the best. Don't
try to fix a near-miss by re-prompting the same seed; generate a fresh batch instead.

Don't try to generate the whole title screen the way the reference images did — those had buttons
baked into the picture, which cannot be used. **Background only.**

### Step 4 — send them to me

Save the candidates anywhere and hand them over. From that point it is code, not craft. I will:

- **Audit each one against this brief** — measure the actual brightness inside the 25–80% reserved
  band, detect any gold/violet/lime regions, and check the black point.
- **Do the edit pass** — crush the blacks, desaturate everything that is not the two poles, flatten
  the middle band, crop the wide and tall masters, export WebP inside the size budget.
- **Composite the real wordmark on top** and verify it is still the brightest thing in frame.
- **Wire it in** — the `#menu` overlay change, the build-script copy list, the `sw.js` precache entry.

**What is genuinely yours to judge:** whether a candidate *feels* right, and whether anything needs
cloning out that a filter cannot fix. If you do want to hand-edit, [Photopea](https://photopea.com) is
free, runs in a browser and opens PSDs.

---

## How to judge a candidate

Ask in this order, and stop at the first no:

1. With the wordmark on top, is the wordmark still the brightest thing in the frame?
2. Is the middle band empty enough that the buttons read without a scrim?
3. Are red and cyan the only saturated colours present?
4. Does it look like a photograph of somewhere real, or like an illustration of a spaceship game?
5. Under 250 KB?
