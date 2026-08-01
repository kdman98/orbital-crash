# Title screen

## What a player sees

The wordmark has no colour in it. The only colour on the menu is four charges on two orbits, and
between them they state the whole game before you press anything:

- **Outer ring** — one red, one blue, pinned exactly half a lap apart and turning the same way.
  Opposite charge, so they should annihilate. The geometry never lets them: ~280px is as close as
  they ever get, forever. A standoff that cannot resolve.
- **Inner ring** — one red, one blue, turning *against* each other. Here contact is not optional.
  They hang apart, fall together, and annihilate in a flash. Every 7.6 seconds, impact alternating
  right, left, right.

That is the game's one rule — opposite charge annihilates — running on a loop, with no copy.

The previous logo was a white→blue→violet gradient on the words. It looked fine and said nothing:
red never appeared, so half the game was missing from its own title screen.

## What a dev needs to know

Everything lives in `index.html`. Nothing is loaded, nothing is drawn to canvas — it is four divs,
28 trail divs, two ring divs and two FX divs, moved by transform.

| Where | What |
|---|---|
| `<style>`, `.titlewrap` block | all title CSS, including the two `@keyframes` for the annihilation |
| markup, `#titleLock` | the lockup: two rings, the FX wrapper, `<h1 class="logo">` with `.l1`/`.l2` |
| `titleOrbit(t)` | the whole motion model, ~40 lines, right after `requestAnimationFrame(frame)` |
| `TITLE` const | every tunable number in one object |
| `frameBody()` | the single call site, guarded by `state==='menu'` |

### Tunables — `const TITLE`

| Key | Now | Effect |
|---|---|---|
| `CYCLE` | `7.6` | seconds between annihilations |
| `DIE` | `.62` | where in the cycle contact lands (0–1). The rest of the cycle is empty inner ring. |
| `SPREAD` | `.82π` | how far apart the doomed pair starts |
| `SPIN` | `.30` | outer pair angular speed, rad/s — one lap ≈ 21s |
| `IN` | `.62` | inner ring size as a fraction of the outer |
| `FLAT` | `.19` | ellipse squash. Lower = more edge-on. |

`FLAT` is the one to leave alone. At `.30` the outer ring stood 258px tall against a 132px wordmark:
it hung off the top of the screen and its lower arc cut 41px into the body copy, which read as a
strikethrough through the first line. `.19` keeps it framing the words and clear of both.

The exponent `2.6` in `gap=SPREAD*(1-k**2.6)` is what makes the doomed pair *hang* apart and then
fall in, instead of sliding together evenly. That is the attraction read; it is not a lerp.

### Three things that will bite if you edit it

1. **Every absolute child is anchored at `left:50%; top:56%`,** and the JS supplies only an *offset*
   from there. Do not reintroduce a measured origin. An earlier version cached the wrap width and
   centred on it while the orbit radius read a live `window.innerWidth`; on a phone the two
   disagreed and threw both rings 168px off-centre.
2. **`.overlay` sets `overflow-x:hidden` explicitly.** Setting only `overflow-y` computes the other
   axis to `auto`, and the rings are wider than the wordmark — that is a horizontal scrollbar
   waiting to appear on the menu.
3. **`.tfx` carries the impact position, its children carry the animation.** Put both on one element
   and the keyframe's `transform` wipes out the translate that placed it at the impact point.
4. **Depth is continuous in `sin(a)`, never a boolean.** It was `sin(a)>0` once, which snapped scale
   and opacity in a single frame each time a charge crossed a horizontal extreme — a visible flicker
   twice a lap, at the ends of the outer ring.

## Copy

Five one-line beats and nothing else — 40 words, down from ~65:

> You are a wandering star, **red** or **cyan**.
> **Steer into** your own colour to catch it in a ring.
> **Click** to reverse.
> Make opposite colours **collide** with each other.
> Beware colliding your star with **opposite Matter**!

Everything cut — scoring, Motes, rings as armour, powerup orbs — is stated in full one button down
under **❖ Codex**, so the menu had been teaching the game twice. What is left is only what a player
cannot infer.

**The word `opposite` in the last beat is load-bearing.** Without it that line forbids the thing the
second line requires: same-colour matter is harmless and passes through your core, and steering into
it is the *only* way to build rings. Only the opposite colour hurts you.

**`steer into`, never `pull`.** The Star exerts no pull on another charge, ever — GLOSSARY says so
three times, and Core gravity on your own colour is "small on purpose … it should lean toward you,
not be vacuumed". Copy that says matter comes to you teaches the most expensive misconception in
the game.

**The rule for editing it: every beat must hold one line at `.tag`'s 26em measure.** Go over and the
beat spills a single word onto a line of its own, which looks like a mistake. The longest beat
currently sets 370px against the 416px cap; that ~46px is the whole edit budget. Below ~400px
viewport width one beat wraps anyway, which is unavoidable and fine.

### Testing it

`titleOrbit` only runs from `frameBody`, which a hidden tab never calls — so in a headless or
backgrounded check all four charges keep `transform:''` and read as simply absent. Drive it by hand
through the debug seam, same as `render()` and `hud()`:

```js
__orbital.title(4.72)   // t in SECONDS — returns dot positions + which impact cycle last fired
```

`title(0)` … `title(4.72)` walks the inner pair from full spread to contact. `lastImpactCycle` steps
0, 1, 2… once per annihilation, so it is the cheap assertion that the loop is alive.

### Comfort mode

`store.reduceMotion` keeps the flash but drops the expanding shockwave. The orbits are unaffected —
they are slow and continuous, which is the thing comfort mode exists to protect, not to remove.

### Cost

One transform pass over 36 elements while the menu is up, and nothing at all during a run. A fault
inside `titleOrbit` is caught at the call site and latches `titleOff`, leaving a still wordmark —
a cosmetic bug must not be able to reach the frame guard and halt a game that is otherwise fine.
