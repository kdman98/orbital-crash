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
Deep space photograph, extremely dark, near-black field. The curved limb of a large
planet low in the frame, lit only by a thin rim of light along its edge. Two small
distant point-light sources far apart, one cool red, one cyan, each a tiny bright core
with a soft falloff. Sparse faint starfield. Very low-contrast dust and nebula, cold
slate blue and dim copper, heavily desaturated. Empty black space across the middle of
the frame. Scientific astronomical photography, Hubble and JWST deep field, ESO imagery.
Emissive light only, no ambient fill, no cast shadows. Wide vista, enormous scale,
silent and cold.
```

Append for the wide version: `16:9 composition, planet limb sweeping across the lower third.`
Append for the tall version: `9:16 vertical composition, planet limb across the lower quarter, empty sky above.`

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

## How to judge a candidate

Ask in this order, and stop at the first no:

1. With the wordmark on top, is the wordmark still the brightest thing in the frame?
2. Is the middle band empty enough that the buttons read without a scrim?
3. Are red and cyan the only saturated colours present?
4. Does it look like a photograph of somewhere real, or like an illustration of a spaceship game?
5. Under 250 KB?
