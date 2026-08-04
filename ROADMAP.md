# ORBITAL CRASH — Feature Ledger

The living record of what's shipped, what's being built, what's parked, and what needs
balance attention. Vocabulary per [GLOSSARY.md](GLOSSARY.md).

---

## ✅ Shipped

### The score multiplier was a coin flip pretending to be a curve (2026-08-04)
Pilot: *"streak lost, mult decreasing - is also too much for this game, i think. is multiplier is even
needed for our game?"* Both halves turned out to be right, for reasons that only showed up once measured.

**They were never two scoring systems.** The Streak pays **zero score** — its whole output is Capacitor.
`motesBank → mult` was the score system, and it scaled only **3 of 6** income sites; the Anomaly purge
(200×act), the Gilded Bounty (250×act) and the Collapse tally (N²×4) were always flat. So the two were not
redundant in what they paid. They were redundant in what they **punished**, and in how loudly. One hit at
combo 15 with 12 Motes banked stacked **three** popups above the star — the damage number at `−18`,
`STREAK LOST` at `−32`, `MULT ×… → ×…` at `−60`. That is the exact pile-up the previous entry removed;
`breakStreak` runs inside both damage paths, so it was always the same rule, and it had been missed.

**The multiplier was binary, not a curve.** 12 runs with a blind pilot that takes hits, against 6 with
damage forced off:

| | median mult | P90 | P99 | time at ≥×10 |
|---|---|---|---|---|
| taking hits (~8 halvings/run) | **1.9** | 4.6 | 7.0 | **0%** |
| untouched | **×15 inside 46s, 6 of 6 runs** | — | — | 100% after 46s |

Nothing in between. The advertised range's top two-thirds was a 25-second transit on a clean run and
unreachable on a dirty one, and the whole system moved final score by **1.30×** (median 2,336 free vs
1,795 pinned at ×1) — for a 44px gold HUD stat and two popups.

**And the halving punished backwards.** An untouched 180s run banks **761** Motes against the **140**
needed to cap, so: 761→380 still ×15, →190 still ×15, →95 ×10.5, →47 ×5.7. **Two entirely free hits when
you are deep, then a cliff.** The player who least needed mercy got it.

**Two bugs fell out of the measurement.** The penalty popup computed the new value *without* the cap, so a
saturated bank rendered the literal string `MULT ×15.0 → ×39.0` — a red penalty announcing a rise to a
number the cap makes impossible. And `breakStreak` still set `hitstop=0.12` at combo ≥50: the frame freeze
the previous entry removed from the contact path, leaking back in through the streak.

**Shipped:** `mult`, `motesBank`, `recalcMult`, `bankMote`, the `#mult` HUD stat and the `sfx.streakLost`
voice are gone. Score is plain addition — `KILL_SCORE` 20, `MOTE_SCORE` 5, `GRAZE_SCORE` 10, priced at the
old expressions evaluated at the measured median so a median run scores about what it used to. The Mote
was raised 2.5× above that line (2 → 5) because it now has to justify its own collection: a kill sheds
1–2, so sweeping your debris pays ~35% on top of the kill. `STREAK LOST` and the mult popup are gone;
**`STREAK BURST` stays**, alone, because it reports Capacitor you can now spend and without it a 20% jump
in the bar has no cause on screen.

**Measured after:** median score **2,050 vs 2,336**, i.e. **0.88×** over 12 matched runs — held. On the
contact frame, combo 5 / 15 / 24 draw **only** the damage number; combo 25 / 55 draw that plus the burst.
All four surviving `hitstop` writes audited and every one is a non-hit event (purge, baited charge, Bomber
blast, your own Collapse) — there is no longer a path from taking damage to a freeze.

**A dead CSS rule surfaced while moving the HUD.** `#combo` carries no class, so it never picked up
`.stat`'s `position:absolute` — which means its `right`/`top` had **always** been ignored and the streak
line had been laying out as a full-width in-flow block flush into the corner with zero inset. Invisible as
a bug while the Multiplier stat sat beneath it and took the eye; the sole occupant of that corner now.
Fixed and verified at 20/18 inset across 1280 / 430 / 375 / 320px.

**Flagged, not acted on:** the Collapse tally is quadratic against a now-flat income table — a 20-kill
Collapse pays 1,600 on top of 400, **+400%**. Not a consequence of this change: at the multiplier's
measured ×1.9 it was already **+421%**. It is what drives the 1,070–7,706 score spread across identical
runs. Whether hoarding should dominate scoring is a design call; `N²×1` is the one-line change.

### Getting hit says one thing (2026-08-03)
Pilot, after playing the contact ghost and not being able to pick it out: *"i dont feel red sparks are good for this. too much informations are popping up then getting hit. only damage, size dependent to its amount would be good. / not screen shake, for now. / blinking + immune - a little more immune time, with blinking frames same as immune / no frame freeze on contact."*

They were right, and it explains the previous entry's failure. A hit used to fire **five** cues at once — a
full-screen red flash, 12–14 red sparks at the core, a screen shake, a 0.05s freeze, and the damage
number — and the contact ghost was a sixth, small, and often red-on-red. It was not invisible because it
was short. It was invisible because it was buried.

**A hit now says three things and nothing else:** the hurt sound, one damage number, and the star blinking
through its immunity. Applied to **both** damage paths — body contact and `coreHit` — which also fixes an
old inconsistency: the readout used to be contact-only, so a 20-damage mine gave no number at all. With
the flash and the burst gone that would have been silence.

**The number carries the magnitude**, since it is now the only readout — `14 + dmg × 0.40` clamped 14–28,
so 6 (Mini) → 16px, 10 (Drifter or a missile) → 18, 20 (mine) → 22, 22 (Brute) → 23, 30 (the Anomaly's
body) → 26. Size is the one channel a number has that a shake or a colour does not.

**Immunity 0.55 / 0.5 → one `IFRAME` of 0.8**, and the blink now runs off `P.iframe` itself instead of the
global clock. On the global clock a hit lands mid-cycle, so the first thing you see can be the star fully
lit — the cue drifts out of phase with the thing it reports. Off the timer it starts on the frame you are
hit and ends on the frame you are vulnerable, for **any** source that sets `iframe`, with none of them
needing to know: damage 0.8, a shield block 0.7, an orb pickup 0.14.

Kept deliberately: the shield-block branch still flashes, shakes and fires `ruptureBlast`. A block is not
damage — it is the powerup doing its job, and it should feel like an event.

**Measured** (mute on; `iframe === 0.8` on every species is the new-code marker):

| check | result |
|---|---|
| 7 species, contact | damage exact, `iframe` **0.8** on all, `trauma` **0**, `timeScale` **1** |
| full-screen flash | corner pixel **rgb 5,11,22** — pure background, no tint |
| number scales | text height 26.7 → 27.2 → 29.4 and width 23.9 → 33.3 → 42.2 for 6 / 10 / 22 damage |
| blink tracks immunity | 12 of 12 sampled `iframe` values matched the prediction — dim **175**, lit **233**, cleanly separated, solid at `iframe` 0 |
| what 0.8 cost | hits/min **26 → 22**, about **−15%**, five paired runs on a fixed flight path |
| console | clean |

### You can finally see the thing that hit you (2026-08-03)
Pilot: *"i still feel like i'm colliding a very little earlier. can we give a little mercy? about 2~3 px?"*
It was real. It was never the hitbox.

**First attempt: a 2.5px grace on the star's hurt radius. Built, measured, reverted.** The pilot's verdict
was *"i dont feel any change"*, and the measurement says why — **the gap closes at a median 3.9 px/frame**
at the moment of contact (p25 2.2, p75 5.5, over 100 hits), so 2.5px is **0.64 of one frame**. Below the
resolution of the simulation. The lever also has a hard ceiling: `FORM_STEP` 44 keeps a formation's
midpoint unwalkable only while `e.r + P.r − mercy > 22`, so **mercy < 4** — barely one frame, ever. It was
costing the exact hull-touch parity and half the formation margin for nothing perceptible.

**The real cause is the render order.** `processKills()` and the dead sweep both run *inside* `step()`;
`render()` runs after. So the body that hits you is spliced out of `enemies` **before the frame is drawn**
— you never see the touch. Measured over 127 hits: the last frame it appeared in still showed a median
**2.44px** hull-to-hull gap. That is the reported 2–3px, almost exactly, and it explains why shrinking the
hitbox did nothing: a smaller radius moves where contact happens, but the body is still culled one frame
before it, so the same gap survives.

**And it is not the glow either** — that was my hypothesis and the measurement killed it. Probed on an
isolated Drifter: the hull is a **129-point luminance cliff** at exactly r=11 (184 → 55), while the glow
outside it is only **27 above background** and is gone by 18.9px. The eye reads the hull. The glow also
errs *wide*, so if it were being read it would make hits feel late, not early.

**The fix is render-only: a contact ghost.** Snapshot the body just before `queueKill` — while it is still
at the position it touched you and still un-flagged — and draw it once more through the same species path,
then cut. It rides the existing `drawEnemies` loop, which is safe precisely because that loop never writes
to `e`, so every species' art applies for free. Held `GHOST_HOLD` 0.07s, which outlives the 0.05s hitstop a
contact already sets, so it reads as a frozen impact rather than a one-frame flash; it ticks in real time
in `frameBody` rather than `step()`, because it has to keep counting down through a hitstop that stops the
sim, and that is also what lets comfort mode — which pins hitstop to 0 — see it at all.

**Measured.** Placed a Drifter at 23 (inside the 26 envelope), let contact fire, confirmed the body was
consumed, then **cleared every remaining live body** so that anything still drawn could only be the ghost:

| probe | control (no contact) | after contact |
|---|---|---|
| body fill, +16 | rgb 26,72,93 | **rgb 255,134,204** — red pinned |
| body core, +23 | rgb 39,133,165 | rgb 255,220,228 |
| mirror side, −16 | rgb 105,204,236 | rgb 62,65,92 — stays dark |

Plus 5,400 frames of live play across 75 hits: no console errors, no leaked bodies (`enemies` peaked at a
normal 37), `freshRun` clears the slot. Nothing in the sim changed — difficulty is identical, only what
you see.

*(Test note worth keeping: the first version of this measurement ran the contact case before the control,
and the ghost survived into the control because `ghostT` ticks in `frameBody`, which never runs inside a
synchronous probe script. Order the control first.)*

### Every hull tells the truth, and the Neutral pop stops being a number (2026-08-03)
Two follow-ups from the comment pass. Pilot: *"is this ok?"* on the missile-life rule, *"should we manage this with HP? not system adjustment?"* on the Neutral, and *"all hitbox should have same size with visual, i think?"*

**The missile-`life` rule needed no change, and that is worth recording so it is not re-investigated.**
`step()` opens with `const dt=1/60`, a literal, and `timeScale` is applied to the *accumulator*
(`acc += dt*timeScale`), so slow-motion runs **fewer steps**, never shorter ones. `L.life -= dt` and
`L.x += L.vx` are therefore locked together by construction. The comment is a guardrail against a future
per-missile speed multiplier, not a description of a live bug.

**The Neutral pop is now structural.** `NEUTRAL_POP` (2) had to equal Neutral HP (2) or the first
shockwave becomes invisible — the pulse fires only every 0.5s however fast you flip, and a damaged
Neutral is drawn identically to a fresh one, so a two-hit kill reads as "Neutrals are immune". Nothing
enforced that equality, and three places promise *"one reversal, not two"*.

Re-tuning HP would only re-couple the two numbers, so the subtraction became `queueKill(o)` and the
constant is gone. **Sim-identical today** — at HP 2 the old expression already killed in one hit, same
frame; it diverges only if Neutral HP is ever raised, which is the point.

Worth recording from the audit: **Neutral HP 2 currently changes nothing.** Every damage source against a
regular body is Collapse wave **2**, Collapse chain **3**, Bomber blast **2**, shockwave **2** — and
`P.blastDmg` = 1 exists but is **unreachable**, because `P.blastR` is 0 so the non-Collapse chain never
clears its `bR>18` gate. A Neutral dies to all of them at HP 1 or 2 alike; only the Brute at 3 survives
anything. HP 2 is the largest value that still dies to everything, which is a defensible place to sit.

**Hitbox parity: it was already true almost everywhere.** `e.r` is both the drawn hull and the collider
for six of nine dots plus the Anomaly. Three silhouettes overhang — Brute hexagon 1.15×, Charger
arrowhead ~1.33×, Splitter lobes 1.07× — but those draw *bigger* than they collide, which is the
forgiving direction and is their species identity, so they were left alone.

**Exactly two things were drawn smaller than the radius that kills, and both were fixed:**

| | was | now |
|---|---|---|
| the star's crisp white rim | `P.r*0.86` = 12.9 against a real 15 — **you died 2.1px before your own edge touched** | outer edge of the stroke on exactly `P.r` |
| Gilded Bounty ring | `e.r*1.8` = 19.8 on a Drifter against a 26px kill radius — **keeping clear of the gold still killed you** | `e.r + P.r` = 26 |

The star was not a one-liner: the rim is stroked 0.6px outside a solid fill, so moving it alone detaches
it into a floating ring. Body fills to `P.r`, rim inset by half its 2.2 stroke width, specular highlight
scaled ×1.22 to keep the sphere read.

**What this buys is one rule with no exceptions: two hulls meeting on screen IS the frame of contact.**
15 + 11 = 26 = `e.r + P.r`.

**Measured** (mute on; the HP-99 pop below is also the new-code marker, since the old code could not
produce it):

| check | result |
|---|---|
| Neutral pop at HP 2 / 5 / 99 | **dead in one reversal in all three**, and `hp` left untouched — a kill, not a subtraction |
| contact threshold, all 9 dots + Anomaly | lands on `e.r + P.r` for **10 of 10** (drift 25→26.6 vs 26 · dart 21.7→23.3 vs 23 · brute 34.7→36.4 vs 35 · split 28.2→29.8 vs 29 · mini 21.7→23.3 vs 22 · orbiter 25→26.6 vs 25 · bomber 31.5→33.1 vs 32 · charger 26.4→28.1 vs 28 · neutral 29.8→31.5 vs 30 · boss 51.9→52.1 vs 52) |
| star rim, pixel-probed | full-bright to 14.44, boundary pixel at **15.00**, atmosphere plateau beyond — edge is `P.r` |
| Gilded ring, pixel-probed | stroke spans 25.0–26.66, centred on **26** = `e.r + P.r` |
| console | clean |

**And then the atmosphere discs went too, same day.** Flagged first, then measured, then removed on the
pilot's call: *"i dont think we need that opacity circle around our star. that is not a hitbox, just
design - but i dont think i works well."*

Two flat-alpha fills sat at `1.45r` and `2.4r`. **Flat alpha means a hard boundary however soft the
colour looks** — every pixel at the same opacity, then a cliff to zero at the rim. Measured on the
rendered frame: **51** luminance at 22px and **73** across 35.6–36.7px, against the **9** that the
enemy glow's gradient measures. Two more rings claiming to be an edge, on the one body whose edge has
to be unambiguous.

**Deleted rather than converted to a gradient sprite**, which was the other option on the table. Nothing
replaces them: `drawField` already lays a real radial gradient under the star (0.16 → 0 across
`P.fieldR`), so the soft light was already there, and a gradient promises no distance.

**Measured after:** biggest cliff outside the hull **4** — below the enemy gradient's own residual — and
the ray decays 51 → 47 → 46 → 45 → 44 → 43 monotonically from 16px to 40px. One crisp edge on the star,
at exactly `P.r`, and nothing else. That was the last flat-alpha edge in the game.

### The Anomaly gets smaller, cheaper, and stops lying about its edge (2026-08-03)
Player brief: *"change volley damage to 2, reduce anomaly hp, starting from 15. also reduce anomaly size by 15%. make sure contact range is same."* Then, on seeing the first build: *"what i meant was contact range is same as anomaly's visual size."*

**That clarification reversed the implementation, and the discarded version is worth recording.** The
first build read "contact range is same" as *unchanged*, so it shrank only the drawing and left `b.r` at
44 — a render-only scale. That is exactly the defect [GLOSSARY §2](GLOSSARY.md) exists to ban: it would
have put the star's kill edge **22px outside a hull that looked safe**. The correct reading is the
stronger one — **the Anomaly obeys the same law as every other body in the sky: what you see is what
hits you.** So it is one number.

| | before | after |
|---|---|---|
| `boss.r` | 44 | **37** (−15.9%) |
| contact envelope `b.r+P.r` | 59 | **52** |
| integrity ring | `b.r+11` = 55 (**4px inside lethal**) | `b.r+P.r` = **52** (exact) |
| `VOLLEY_DMG` | 3 | **2** |
| `CHARGE_DMG` | 12 | **8** |
| boss HP | `round((13+act*5)*1.5)` → 27/35/42/50/57 | `10+act*5` → **15/20/25/30/35** |
| Pulsar (×0.75) | 20/26/32/38/43 | **11/15/19/23/26** |
| purge cost, Epoch I | 9 connecting volley bodies | **8** |
| purge cost, Epoch III | 14 | **13** |

**The pool and the price moved together on purpose.** Read apart the change looks enormous; read together
the purge cost barely moves. What changed is the **grain**: at 3 into 27 the pool did not divide by the
price, so the last body of every purge was 3 thrown at a 2 HP boss. At 2 into 15 the bar steps in units
it actually has. The ×1.5 that made 27 went on in 2026-07-31 to stop a hoard alone killing an 18 HP boss;
since then the baited charge went 5 → 12 **and** the Anomaly stopped fleeing, so a pool sized for length
was sitting on top of a fight with no exit.

**`CHARGE_DMG` was repriced because its own comment pre-registered the rule** — *"sized against the pool
it faces; if boss HP moves again, re-price this with it"* — and 8 holds both invariants that chose 12:
still exactly 4 × `VOLLEY_DMG`, still the biggest single hit in the game. Against the new pool a bait is
worth **more of a bar than it ever has been — 53% / 40% / 32%** at Epoch I / II / III, against 44/34/29
before. Left at 12 it would have been a **one-shot purge on an Epoch I Pulsar** (11 HP).

**'Danger Close' retired.** *"Take a Bomber's impact and live"* was written when a Bomber hit 26 with a
30-through-shields payload; at Drifter parity (10 vs 100 max HP) it certified nothing. It had survived one
pass longer on the argument that *"the roster count is documented (six, one secret)"* — which is backwards,
and is the actual lesson: **the docs describe the game, not the other way round.** Roster is now **five,
one secret**. Deliberately *not* find-replaced onto the Brute; that is a different achievement and
deserves designing.

**Measured** (mute on, new-code marker `boss.r === 37` asserted before trusting any number):

| check | result |
|---|---|
| contact envelope, 93 one-frame trials × 3 bearings | largest separation that **hit 51.6**, smallest that **missed 52.2** — predicted `b.r+P.r` = **52.0** |
| volley, per connecting body | **2** (body consumed) |
| baited charge, `cst==='dash'` | **8** (charger consumed) |
| drift-in contact | **0** — two-channel rule intact |
| boss HP at Epoch I | **15** / **15** / **11** (emitter / sentinel / pulsar) |
| Codex "Ways in" rows | **2 · 1 · 8 · 15%** |
| Codex achievements | **5 rows, exactly 1 secret**, no 'Danger Close' |
| console | clean, both pages |

**The envelope measurement needed a better instrument than the first attempt.** Seeding `P.x` and reading
the result is wrong, because the star **chases the pointer** — it is yanked up to 18.5% of the way toward
a stale pointer position *before* `stepPlayerContact` runs, so the distance tested is not the distance
seeded. (The same class of error as pinning `P` outside the arena and forgetting it is clamped.) The fix
is to bracket on the separation that **actually existed at the end of the frame**, which is why the
threshold lands inside a 0.6px band instead of a 2px one. Boss drift while hovering: **1.08 px/frame**.

### The Bomber detonates again — but only the half that clears matter (2026-08-03)
Player brief: *"bomber should destroy dots around it when it explodes. this is for removing excessive ring shield and too much leftover dots / except that, everything else is just a normal dot."* Told plainly that this reverses the 2026-07-29 removal: *"yeah some patches might collide - but this way was what i meant actually."*

**The scoping is the whole design.** The old payload was removed for specific reasons, and this one keeps
none of the offending parts. It is a 120px, colour-blind, 2-damage blast on death, and:

- **It does not touch you.** The old one dealt **30 to the core through any shield**, which is why it read
  as an unfair body rather than a hazard. Contact stays `ETYPE.bomber.dmg` = 10, Drifter parity, and the
  blast adds no second damage channel at the core. Verified: a Bomber detonating **99px** from the star —
  well inside the 120px radius — costs **0 HP** while clearing 8 dots.
- **It does not touch the Anomaly.** The old one chipped it for 2, a straight violation of the
  two-channel rule: a boss walks the arena through a field full of matter, so "things exploding near it
  hurt it" means density kills bosses, not skill. Verified **27 → 27**.
- **It pays nothing.** `dead` alone, never `queueKill` — no score, no combo, no Mote, no Capacitor. This
  is the point rather than a limitation. The brief is to *punish* hoarding; a paying blast would make
  hoard-then-pop a score fountain that rewards the very behaviour it exists to remove, and a Bomber in a
  20-body crowd would pay 200+ off density. Same principle as the Sorter's self-collision.
- **It does not chain.** A Bomber killed by another's blast dies via `dead`, so `onKill` never runs and it
  never detonates. Verified: the second Bomber died and **8 dots 160px away all survived**.

**Colour-blind is load-bearing, not an oversight.** Your rings are *your own colour*, so a blast that
respected polarity could not remove ring shield at all — which is the entire brief.

**Sizing is measured, not picked.** The ring orbit radius is `P.fieldR*0.6` = **114**. `BOMB_R=120` sits
just past it, so a Bomber that reaches your core clears the hoard, while one popped out on the ring takes
a bite. `BOMB_DMG=2` is Collapse parity — trash dies, a Brute (3hp) crawls out burned — chosen so the game
has **one** blast strength rather than inventing a third.

**Measured:**

| | |
|---|---|
| 16-body ring at radius 114, Bomber popped at the core | **0 survivors** |
| paid by that blast | **0** — the 11 score alongside is the Bomber's own death by core contact, a real kill |
| Brute in the blast | **survives at 1 hp**, while 6/6 trash die |
| Anomaly in the blast | **27 → 27** |
| second Bomber in the blast | dies, **does not detonate** |
| ordinary field (median 22 bodies) | clears a median of **2**, up to **9** in a dense field |

The bite scaling with local density is the desired shape: sparse field, small declutter; packed ring,
total. 300s run to Epoch II at 36,933 with no console errors.

*Measurement note.* The crowd figure first came back as "clears −1", i.e. the field growing. Cause: the
star had died during the 100s warm-up, and `onKill` returns early on `state==='dead'`, so the blast never
fired at all. Pinning HP was what made the test real — the third time this session a measurement has been
silently voided by the pilot dying inside the warm-up.

### The Sorter stops invoicing you for its own suicide · Escape works inside the Bestiary (2026-08-03)
Player report: *"the sorter will collide each other, making significant score."* · *"close bestiary or codex via esc doesnt work if i clicked page once."*

**1 — A shape that kills itself now pays nothing.**

Measured with the star parked in a corner touching nothing, per Sorter:

| | before | after |
|---|---|---|
| score | **454** | **0** |
| Capacitor | **+0.58** (over half a Collapse) | **0** |
| Motes | **4** | **0** |
| combo | up to **41** (crossed the 25 streak milestone, fanfare and all) | **0** |

The Sorter is two walls in opposite colours converging, so its ending *is* a mutual annihilation —
"what ends the shape: not a timer". About **35 of its 40 bodies** die that way, and every one was being
invoiced to a player who did not do it. The Capacitor line is the one that mattered most: half a Collapse,
free, for standing still.

**This is the two-channel rule one level down.** That rule exists because a moving Anomaly would otherwise
damage *itself* and pay you for it. Same defect, same answer: you are paid for what you did, and two
bodies flying their assigned vectors into each other is the field resolving itself.

The collision still **happens** — it has to, it is the shape's ending — and still reads as one, with a
burst in both colours at the meeting point. It just does not pay: `dead` alone, never `queueKill`, so no
score, no combo, no Mote, no Capacitor and no blast chain. Exactly the comet/pulse retirement, applied to
a pair.

Gated on **both** bodies being in formation flight, so nothing the player owns is caught — your ring
bodies carry no `hold`. Gated on `!unstable`, so a Collapse (which is yours) is never silenced. In
practice this is the Sorter alone: the Wall's two-wave release already measures 0 pair-kills, the Noose's
`rmin` floors it out of self-contact, and the Pulse puts one colour per arc at different radii.

**Regression-checked, because silencing the wrong pair would be worse than the bug:** an ordinary opposite
pair still pays **20**, and a formation body killed by an *ordinary* body still pays **20** (only one side
held → falls through to the normal path). A 300s run reaches Epoch III at 56,864 with no console errors.

*Measurement note — this number was first published as 15 score / 1 combo, and that was wrong.* The
residual was read as a leak in the gate; it was contamination, and clearing it took **four** attempts,
each defeated by a different mechanism. Worth recording in full because every one of them looked like a
clean isolation at the time:

1. **Star parked in-arena** — mixed in kills the star itself caused.
2. **Star pinned to (−9000, −9000)** — but `P` is **clamped to the arena**, so it merely sat in the corner
   at (15, 15), where a wall spanning every `y` walked into it. The "leaked" kill was a *real* player kill,
   correctly paid, 27.5px away against a 26px envelope.
3. **Ambient culled every frame** — but `doSpawns` runs **inside** `tick()`, so an ambient dot still spawns
   and collides mid-frame. Worse, the end-of-frame dead-sweep then removes it from `enemies`, so checking
   after the tick reads "0 ambient present" and reads as exoneration.
4. **Clean at last:** suppress ambient *at source* by filling the spawn cap (`enemies.length < cap`) with
   inert Neutrals — `opposite` requires both sides non-neutral, so they can never annihilate anything —
   and shrink `P.r`/`P.fieldR` to nothing so the star cannot touch or attract.

The result: exactly **one stray ambient dot per Sorter**, worth 10 score, and the runs where none appears
pay **0 score, 0 combo, 0 Motes, 0 Capacitor** across 36 self-kills. The gate has no leak. The lesson is
the one this ledger keeps relearning: a residual is a claim about a *cause*, and it needs the same standard
of proof as the headline number.

**2 — Escape now works after clicking inside the Bestiary.**

Reproduced exactly, and it is the **Bestiary only** — the Codex is a plain div in this document and was
never affected (verified: open → click inside → Escape → closes). The Bestiary is an `<iframe>`, and one
click anywhere inside it moves `document.activeElement` to `IFRAME#bestiaryFrame`, which delivers the
keystroke to the **child** document. A `window` listener in the parent never sees it. Worse, the overlay
fills the screen, so there is nothing obvious to click back out onto.

Same-origin, so the parent simply listens on the child document too — bound on every `load` (a reload
replaces the document) and again on open, which covers the second and later opens where the load event
fired long ago. A `WeakSet` keyed on the document makes it idempotent without leaking; the try/catch
exists because a failed bind must never stop the overlay opening, which would turn a dead key into a dead
button. Deliberately parent-side: `bestiary.html` is also a standalone page, and teaching it to reach for
`parent` would give it a second, worse identity.

**A latent bug found next to it.** Both overlay handlers called `stopPropagation()`, but they and the main
input handler are registered on the **same target** (`window`) — and `stopPropagation` only stops the walk
to the *next* target, doing nothing about other listeners on this one. So Escape closed the overlay and
then also reached `if(k==='p'||k==='escape') togglePause()`. Invisible today because these overlays only
open from the menu, where `togglePause` is inert; it would have become real the moment either became
reachable mid-run. Now `stopImmediatePropagation()`, which is the call that actually means what the code
always intended.

Verified end to end: open → click inside the iframe → `activeElement` is the iframe → **Escape closes it**,
with pause untouched and state still `menu`.

### The Pulse: 3 arcs → 2, and the gap doubles — plus a survey of what else should retire (2026-08-03)
Player brief: *"gap between pulse walls are too short, and let's reduce them to 2 walls. it would be hard if done in complex fights"* · *"i think we should retire some of dots exiting screen, without making scores. Do you agree? i'm worrying / thinking of which things we should retire though."*

**Both halves of the first brief are one complaint.** Three arcs 70px apart arrive **0.57s** apart. This
game's own standard for a warning you can act on is **`CHG_WIND` 0.9s** and **`LUNGE_TEL` 1.3s** — both
numbers set by telegraphs that were explicitly retuned *until they were answerable*. The Pulse was asking
for a **polarity** decision on under half the notice the Charger gives you for a dodge, three times in a
row, and the answer to an arc is a **flip**, the one input with a cooldown on it.

`PULSE_ARCS=2`, `PULSE_GAP=150`. **Measured over 10 spawns: 2 arcs, 68 bodies, arrival gap 1.22s** (median,
zero spread) — inside the established band, right beside `LUNGE_TEL`. Body count **102 → 68**, which is the
"complex fights" half of the brief.

Two properties worth recording because they constrain any future retune:
- **The gap is exactly linear in ΔR.** Every arc passes through the player's radius `arrive` at
  `(arrive−R)/FORM_SPD`, so the arrival difference is `ΔR/FORM_SPD` and nothing else. That is why the old
  figure can be stated exactly as 0.57s rather than estimated.
- **Spacing must stay expressed in radius, not time.** Per-arc density where it reaches you is
  `PULSE_ARC*arrive/(N−1)` *regardless of R* — every arc crosses the same meeting radius — so R buys
  arrival time and only arrival time. R must also stay under `back` (190–230) or the outer arc pokes back
  on-screen at spawn and loses the 0%-visible-at-birth property.

Colour alternation survives the cut: two arcs are red then cyan, so no single polarity walks through both.

---

**On the second brief — the general "retire dots exiting the screen" rule. Measured, and the answer is no.**

The instinct is right and it is already the rule for the two shapes that needed it. But as a *general*
mechanism it would be code that never runs. Instrumented over **300s of real play, tracking every body
individually**:

| | |
|---|---|
| bodies that entered the arena | **1,374** |
| ever left again | **2 (0.1%)** |
| of those, came back | **2 (100%)** |
| median off-screen population | **0** |
| peak off-screen population | **1** |

**Ambient dots cannot leave — they seek you.** `ax += dx/d*e.seek*P.seekMult` runs on every body every
frame; that is what `seek` is. Nothing loiters off-screen, so there is nothing for an exit rule to collect.

**And after the Pulse fix there is very little sediment left anyway.** Per-shape, 6 trials each, counting
only bodies born from that shape still alive 30s later:

| shape | born | left behind |
|---|---|---|
| Wall | 20 | **6** |
| Sorter | 40 | **2** |
| Noose | 20 | **2** |
| Pulse | 68 | **0** |
| Comet | 1 | **0** |

Against a median live field of **23**, the worst remaining offender is the Wall at 6 — and the Wall's
leftovers are *deliberate*: its hold is `cross*2+0.6` precisely so it goes out **and back**, because
"ignoring it does not end it" is the shape's whole thesis. Retiring those would delete the design.

**The hazard of a blanket rule, stated plainly.** The one population that *would* start qualifying if the
physics ever changed is **flung** bodies. The Fling is defence and only defence (two-channel rule) — a body
you pushed away is explicitly not a shot you took. Auto-deleting anything that leaves would quietly promote
the Fling from "push them away" into "delete them", which is a strictly stronger verb than the damage rules
allow, arrived at by accident rather than decision. (Measured: 0 of the 2 exiters were flung, so this is a
latent hole, not a live one — the same category as the Brute barge that was removed for being a hole
waiting to be walked into.)

**The rule that is actually operating, and the one to keep:** *retire a body that has finished a committed
trajectory it was born with; never retire one that is still hunting you.* The Comet and the Pulse qualify —
they are born with a path, they fly it, they are done. A hunter is never done. "Is it off-screen?" is a
proxy that happens to coincide for those two and misleads everywhere else.

### The Pulse sweeps through and leaves the sky (2026-08-03)
Player brief: *"too many bullets when pulse finished, what about just let it go away in screen and disappear."*

**The aftermath was bigger than the shape.** The Pulse expanded to 300px past you and then **lapsed** — and
a lapsed formation body becomes an ordinary hunter. Three arcs of up to 34 meant **up to 102 hunters
appearing in a single frame**, with no telegraph of their own, at the exact moment the player had just
finished answering the wave. That sediment is the "bullets": not the Pulse, the debris field behind it.

**It now sweeps through and retires once it has left the padded viewport.** Two things forced the shape of
the fix, and both are worth keeping:

1. **It has to be positional, not a clock.** The front fans across 150°, so a body on the near edge of the
   arc clears the screen long before one aimed down the long axis. A single timer would either strand the
   near bodies visibly or leave the far ones lapsing on screen.
2. **It has to require having entered the arena first.** Pulse bodies are *born* off-screen — the arcs
   start 40–170px from an origin placed 190–230px outside the edge — so a bare "is it outside?" test would
   delete the entire shape on frame one. This is the same `seen`-then-gone idiom the Anomaly's missiles
   already use (`L.seen`), reused rather than reinvented.

`hold` is now sized to the furthest padded corner, so it can only ever act as a failsafe — it catches the
body whose bearing misses the arena entirely and therefore never sets `seen`, which would otherwise lapse
off-screen and walk back in later as a hunter (the exact failure the comet's note warns about).

**Retirement, not a kill.** `dead` alone, never `queueKill` — no score, no Mote, no blast, no death FX.
Nothing was destroyed; it left. Intercepting one in flight is completely untouched and still pays in full,
because opposite-colour annihilation is not gated on `hold`. The wave is still worth meeting with the right
polarity; it just leaves no wreckage.

**Measured, 8 trials per condition, control run in the same build by clearing the tag:**

| | Pulse bodies left behind 20s after the wave |
|---|---|
| before | 24, 28, 27, 29, 30, 31, 32, 24 — **median 29** |
| after | 0, 0, 0, 0, 0, 0, 0, 0 — **median 0** |

Zero variance in the new condition. A first pass at this measurement read **8 left behind** and was wrong:
it counted every live body, and the Lab still runs ambient traffic. Re-run against only the 102 bodies born
from that Pulse, the figure is 0 — the residual was unrelated dots.

**The sweep itself is unchanged** — same flight speed, same time on screen, same three-arc read (confirmed
visually mid-sweep); the extra `hold` is spent entirely off-screen. Verified over **400s of real play to
Epoch IV**: zero leftover Pulse bodies, zero console errors, peak field 97 bodies.

**What it costs, stated plainly:** the Pulse is no longer an **ammunition** source. A held body ignores the
Field and so can never be ring-captured, and previously the lapse handed you a hoard of up to 102 gatherable
dots. That is a real loss of income during and after the shape, and it is the intended trade — but if the
Pulse starts to feel like an event with no upside, that is the reason.

### The Anomaly stops leaving; the bait starts landing; the well is excised (2026-08-03)
Player brief: *"remove the dead code too"* · *"make charger dash into anormaly stronger, with visually (or sonically) i can realize. this build-up for attack is hard"* · *"remove Anomaly Destabilization and flee, and i'll handle difficulty more detailed."*

**1 — The Singularity machinery is gone: 166 lines.** Disabled and excised the same day. Out: the well
in `stepEnemyForces`, `blackholeCollapse()`, `drawEHorizon()` (44 lines of rendering), the `e.eh` contact
skip, the Flare swallow, the Charger override, `ehT`/`EH_MAX`/`ehStrain`/`EH_CLOSE`/`ehWarned`,
`P.ehorizon`, the run resets and the `ehT`/`ehStrain`/`heldByWell` seam getters. **Kept:** `sfx.closing()`
— shared with the Charger wind-up and the Pulsar's station break, and deleting it would have silenced two
live telegraphs. Verified: 2,440 frames, `FX` down to `{aegis, overdrive}`, `P.ehorizon` undefined, all
three surviving powerups still collect, zero console errors.

**2 — Destabilize and the flee are removed.** `fast = bossTime>45 ? 0.62 : 1` is now `fast = 1`, the
DESTABILIZING HUD line is gone, and the 60s failsafe is deleted.

**The flee was doing more than it looked.** It called `onBossCleared()`, which increments `act` — so
running the clock out handed you *the Epoch advance for free*. The fight had a second win condition that
asked nothing of you, and it fired precisely for the players losing. The cadence ramp was that failsafe's
partner: a 15-second "finish it" window before the boss left. With nothing to race, a ramp keyed to a
timer is a difficulty spike attached to nothing the player did.

**There is now exactly one way past an Anomaly: purge it.** No soft-lock — Collapse chips a flat 15%
regardless of the field, so seven of them end any Anomaly unaided, and volley / grind / baited charge are
untouched. The failure mode is losing the run, which is the correct failure mode for a boss.

**Verified:** `bossTime` driven to **120s**, twice the old deadline — boss alive, phase still `boss`,
`act` unchanged at 1, and the DESTABILIZING line never printed once across the whole fight. (First attempt
at this test proved nothing and is worth recording: the boss *died* at ~43s of `bossTime`, short of the
60s deadline, so the run never reached the code under test. Pinning its HP was what made the test real.)

**3 — The baited charge: `CHARGE_DMG` 5 → 12, and it announces itself.**

**The price never matched the setup.** The lane locks at wind-up along the charger→**you** ray, so the
only way it crosses the Anomaly is to put the Anomaly on that line — which means **standing in the kill
lane and leaving it late**, paying 16 damage and a broken streak if you misread. At 5 that bought 12–18%
of a bar (HP is `(13+act*5)*1.5` → 27 / 35 / 42). At 12 it is **44% / 34% / 29%**. 12 is also exactly four
volley bodies, which is the ratio the risk earns — a volley body is one of a dozen thrown from a hoard you
already had; this is a single body bought with position.

**And it was the least legible hit in the game.** The connect printed a 15px damage number in the enemy's
own colour — the same readout a 1-damage grind prints — into the busiest moment the game has. Damage alone
would not have fixed that: a number nobody sees is not a reward. The impact now gets a signature on every
channel the game already uses for "that mattered", and no new one: **hitstop 0.09** (above a shield block's
0.05, below a 50-combo's 0.12), a **screen kick**, **two rings at the impact point** rather than the boss
centre (white at contact scale, wider in the charger's colour), a **gold ◆ BAITED −12 at 22px** — the size
reserved for a purge and a streak tier — and **`sfx.baited()`**, its own voice. Deliberately **not** slowmo:
the dash resolves in ~0.17s and a Charger is rarely alone, so stretching time would take the field away
mid-exchange.

The voice is built as bosshit's opposite so the two are tellable apart with your eyes elsewhere: bosshit is
one short square blip falling 300→180 in 0.09s; this is a heavy low slam falling 110→44 over 0.20s that
then **rises** (523→784, 784→1175). Every reward voice in this game goes up, every damage voice goes down;
a baited charge is both, in that order.

**Verified in-engine, muted, isolated geometry** — charger 90px above the Anomaly, player 145px below, so
charger→player is 235px (inside the 237.5px lock) and the lock happens *clear* of the hull: state machine
ran approach → wind (f26) → dash (f80), impact at **f81 for exactly 12.0**, 34.3% of an Act-2 bar, with the
gold readout and both rings captured on screen. Two false starts worth keeping: the first run measured **1**
because an ambient ring body reached the boss first (Boss Rush runs a live field), and the second measured
**0** because the charger matched the boss colour — `chips` requires `X.color !== B.color`.

### ◉ Singularity disabled — the free wipe was beating the earned one (2026-08-03)
Player brief: *"actually i think singularity is too strong, i am even thinking about disabling it."*

**Removed from the roster; the machinery is left in place behind a permanently-0 timer.** One line went.

**Why it was too strong, in one number.** The devour horizon is **32px**. The largest contact envelope in
the game is **also 32px** (Bomber `r`17 + `P.r`15), and a captured body's velocity is damped ×0.55/frame
while infall walks it inward — so anything the well held died *at or before your skin*. Its immunity was
**geometric, not tuned**: no balance pass reaches it, you would have to move the radii. The proof was
already in this ledger from the 2026-07-29 pass — **12/12 hostiles + 6/6 Neutrals devoured, 0 HP lost**,
against **−14 HP** in the control.

**And it dominated its own sibling.** Aegis is 6s and 3 blocked hits. Singularity was 5s of *unlimited*
blocked hits, plus a field wipe that killed regardless of toughness, plus a banked Mote per body — for
zero input. One roster entry strictly dominating another is the roster being broken, not spicy.

**The deeper reason, and why this is really a Collapse change.** For those 5 seconds the game's one rule
is suspended: opposite matter cannot reach you, and your own colour was already spared, so **the flip
decides nothing** and the star is a walking delete bubble. GLOSSARY §2 has carried an open question since
Corona was removed — the most-*earned* action (Collapse) has the least identity among the "everything near
me dies" effects. Singularity was the free, automatic, strongest member of that set. Removing it is the
first half of the answer, not a separate nerf. Collapse's competitor count is now **two → one** (Nova).

**A measurement failure worth recording alongside it.** The reason no bot data ever flagged either problem:
the scripted pilot **has never picked up an orb** (the watch-list says so) and **has never detonated a
Collapse**. `.oracle.js` calls `g.collapse()` every 311 frames, but `collapse()` refuses unless
`P.charge>=1 && inhaleT<=0 && unstable<=0`, and the oracle drives `step()` directly so the real-time
`inhaleT` countdown in `frameBody` never runs — `inhaleT` pins at 0.45 after the first successful call and
every later one is refused. The blast never fires. Both sides of this comparison were invisible to the
only instrument pointed at them.

**How the disable works.** Deleting the `POW` entry is the whole change: `POWMAP` loses the key, so nothing
rolls it and `__orbital.grant('blackhole')` no-ops; `FX.blackhole` stays 0 forever; and `stepFX` is the
**only** writer of `P.ehorizon`, so every well path below it is unreachable. Nothing else force-grants it.

**Verified** (muted, current build, in-engine — `node --check` proves nothing here): 3,600 frames of play
with `FX.blackhole` max **0**, `P.ehorizon` max **0**, `heldByWell` **0**, `grant('blackhole',5)` → **0**,
and **zero console errors**. All three surviving powerups force-drop, draw in and collect: Aegis → 6.0s,
Overdrive → 6.0s, Nova → fires instantly.

**Knock-on, measured not assumed.** With 3 entries the `noNova` down-weight redistributes. Over 6,000
rolls: **Aegis 45.1%, Overdrive 43.9%, Nova 11.0%** (previously ~30.5 / 30.5 / 8.5). Aegis is now the most
common pickup in the game — a much weaker one than what it replaced, so expect the powerup layer overall to
read quieter. A second-order effect for the watch-list: with ◉ gone **nothing erases a Brute outright**, so
the Brute is now the most durable body in the game.

**Not deleted yet, on purpose.** The well (`stepEnemyForces`), `blackholeCollapse`, `drawEHorizon`, the
Flare swallow and the Charger override all remain, so re-enabling is one line while the decision is being
played. If it sticks, excise it the way the dormant arsenal went in `0b408c4` — git keeps it better than a
comment does.

### The frame budget, measured — and a recorder that stops perturbing it (2026-08-03)
Player brief: *"how can we manage this then?"* — after a reported ~10% frame-rate regression.

**There was no regression, and the game is nowhere near its budget.** Both claims are now measured
rather than inferred.

**The false alarm.** Frame rate had been reconstructed by comparing `elapsed` against `frames/60`. That
inference is invalid: `elapsed` advances 1/60 per **step**, and slowmo (`timeScale`) plus hitstop make
steps-per-frame vary, so the ratio measures *how much time the run spent in slow motion*, not how fast it
drew. It read a healthy run as a 10% regression. The tape carried per-frame `dt` in quanta the whole
time — ground truth that never needed inferring.

**Real frame times, from the dt column:**

| tape | build | median | mean | p90 | max |
|---|---|---|---|---|---|
| 1 (old) | c76dd415 | 17.0ms | 20.43 | 29 | 95 |
| 2 (old) | c76dd415 | 17.0ms | 20.97 | 28 | 54 |
| 3 (current) | 54852171 | 17.0ms | 21.08 | 29 | 43 |

Old-vs-old differs by 2.6%; old-vs-current by 0.5%. **No build regression.** The median is a clean
58.8fps in all three; the mean is dragged down by a bimodal tail — 61.6% of frames at ~17ms, 38.3% at
~28ms, almost nothing between.

**The 28ms stretches are environmental, not ours.** Three independent proofs:
1. **Anticorrelated with load.** Tape 3 ran at 36fps from 15.3–44.8s (the sparse opening, before
   formations start at ~42s) and at 58.8fps from 44.8–90.3s — the heaviest 45 seconds of the run,
   spanning formations, Chargers and Bombers. A cost that scaled with bodies would do the opposite.
2. **Not per-frame.** Only 9 fast/slow runs across 5,925 frames; blocks of 1060, 611, 430 frames, and one
   unbroken 2,730-frame stretch (46s) at full rate. Per-frame cost interleaves; this switches modes.
3. **Same signature on both builds.** Slow blocks of 1032 / 1056 / 1060 / 1031 frames recur across three
   tapes and two builds.

**What the game actually costs** (in-engine, 1710×842 @ dpr 2 = 3420×1684, same viewport as the tapes;
run driven to Act 4 / t=267s with realistic director spawns, peak 132 live bodies):

- **step(): 0.10ms worst** · **render(): 0.70ms, flat** · **total 0.80ms = 4.8% of the 16.7ms budget.
  21× headroom.**
- Render is flat from 50 to 596 bodies (0.64–0.87ms) — the cached gradient sprite did its job.

**The cost driver is overlapping pairs, not body count.** Controlled sweep, single colour so rule 2
prevents annihilation from changing the population mid-measurement:

| bodies | uniform (spread) | edge band (packed) |
|---|---|---|
| 50 | 0.057ms | 0.32ms |
| 137 | 0.113ms | 2.23ms |
| 300 | 0.265ms | 10.16ms |
| 600 | 0.618ms | 40.64ms |

Spread is **linear** (12× bodies → 10.8× cost): the 64px spatial hash in `stepAnnihilation` works. The
quadratic branch is real but only reachable by packing bodies tightly enough that O(n²) genuinely
*overlapping* pairs exist. Two existing decisions already prevent that in play: the same-colour shove
lives **inside** the grid-accelerated pair loop rather than in a pass of its own, and formation bodies
(`hold>0`) are exempt from it, so staged arcs never pay. **Rejected: optimising anything here.** At 21×
headroom it would be effort spent against a non-problem.

**Rejected measurements, recorded so they are not repeated.** A first sweep reported step() as quadratic
in body count (596 bodies → 37.9ms). It spawned everything at the edges, which packs the spawn band; the
uniform control above is 66× cheaper at the same count. A second attempt read 0.015ms for 600 bodies —
`step()` early-returns when `state !== 'play'`, and nothing had checked. Every timing loop here now
asserts the state before and after, and keeps `diag()` out of the timed region (it allocates and walks
the enemy array).

**The recorder was competing with the game it records.** `record.html`'s status loop ran every rAF: a
`diag()` call, a `reduce` over **every row recorded so far** to re-count events (an O(frames) scan that
grew unbounded — by frame 6000 it re-summed 6000 rows sixty times a second), then an `innerHTML` write
forcing an HTML parse and layout in the parent document while the game rendered 3420×1684 beside it. Now
4Hz with a running event total. A recorder that steals frames from its subject makes every frame-time
number in the tape a measurement of the recorder.

**Tapes now self-report frame health.** `tape.perf` carries median/mean/p90/p99/max ms, median and mean
fps, and `overBudgetPct`, computed from the dt column with the first 30 warm-up frames dropped (boot
frames run 40–90ms). `tape.end.peakBodies` tracks the peak live count — the one number that predicts
step() cost. **The median is the headline, not the mean:** a run holding 58.8fps for two thirds of its
length still reports a mean near 47. Validated against a synthetic bimodal input (⅓ slow frames): median
60fps, mean 48.9fps, overBudget 33.2%.

### The danger edge stops lying (2026-08-02)
Player brief: *"can we fix this? or is fixing this right?"*

**The rule this project already had was banning the wrong thing.** Since the 1.55r standoff ring was deleted on 2026-07-29 the rule has been *nothing may be drawn outside a body*. But the real contact envelope is **`e.r + P.r` = `e.r + 15`** (`P.r` is set once at boot and never reassigned, so it is a constant per species), and the actual defect was never the geometry — it was decorations stating a **false value**. The rule is now: *a ring outside a hull must sit at exactly `e.r + P.r`, or not exist.*

**The universal halo was the largest instance, on every body on screen.** `fillStyle=hexA(c,0.28)` + `arc(e.r*1.9)` is a FLAT-alpha disc, so it had a hard visible boundary — and `1.9·r` equals `r+15` only at r=16.67, so it was wrong in *both* directions: Mini 13.3 drawn vs **22** lethal, Dart 15.2 vs 23, Drifter 20.9 vs 26, Bomber 32.3 vs 32, Brute 38.0 vs 35 with 3px to spare. Clip a Brute's halo and live; stay clear of a Mini's and die.

It is now a **cached radial-gradient sprite per polarity**, blitted with `drawImage`. Measured by sampling luminance outward from a Drifter, before vs after:

| | before | after |
|---|---|---|
| profile from d=11 | 151, 151, 151 … 139, **33** | 96, 88, 83, 75, 71, 62, 57, 48, 44, 36, 33 |
| biggest single-step drop | **106**, at d=21 | **9** |

The cliff landed at exactly the predicted 20.9 edge. Extent is unchanged, so it looks the same — it simply stops asserting a boundary. Render cost with 41 bodies: **0.23ms/frame**, cheaper than the arc+fill it replaced.

**Deliberately NOT resized to the envelope.** Sizing the halo to `e.r+15` puts a 22px cloud around a 7px Mini and, across 40 bodies, turns the field into fog — while promoting a decorative bloom to a HUD element on everything, which is how nothing ends up standing out. The precision was the defect; the radius was fine.

**The Charger's wind-up ring: deleted.** A closed white circle swelling 17→23px and brightening to 0.9 alpha, against a **28px** kill radius — the brightest mark on screen halting 5px inside lethal, during the exact 0.9s the player is deciding where to stand. Structurally the deleted standoff ring rebuilt closed, brighter and animated. No comment defended it; it escaped the rule the Bomber and the spent-Charger arc were both written to obey. Replaced by a nose that heats up **inside** the hull (peak 0.93r).

**The reticle: now true.** It collapsed to **8px** against a 28px envelope, so a player 20px off centre was visibly outside the mark and still took 16 damage. It now settles on exactly `e.r + P.r` = **28**. This is the legitimate exception to the rule: it marks the **ground**, not a body, and it is honest — the same precedent the mine telegraph already set.

*(Both remaining items in this class were closed on 2026-08-03: the boss integrity ring moved to `b.r+P.r`, and the Gilded Bounty ring — the standoff ring's exact form, on the one body the game baits you toward — moved from 1.8r to `e.r+P.r`. See "Every hull tells the truth" above.)*

### The Wall stops eating itself (2026-08-02)
Player brief: *"wall pattern collides each other in conclusion. should we have same color in same axis? idk"*

**Right diagnosis, and "in conclusion" was the load-bearing word.** Measured over 6 Lab walls, classifying every death by whether bodies died in **pairs** (each other) or **alone** (the player): the vertical orientation lost **16–22 of 29 bodies in pairs** — 55–76% of the shape — and every one of those deaths landed *after* the hold lapsed at ~981 frames, not during the march. The horizontal wall showed 0 pair-kills only because its traverse is twice as long and the measurement window ended first; it is the same shape with the same defect.

**The cause is rule 2 meeting the release.** `formAlt` alternates every body, so a wall is a row in which every neighbour is its own annihilator. While `hold` runs they fly a fixed vector and ignore the field, holding ~42px apart. The instant it lapses — all at once, for the whole line — they become ordinary matter, converge down the polarity field, interleave, and delete each other. This is precisely the Noose's release problem, which was diagnosed and fixed on 2026-07-31 and never propagated to the Wall.

**Same fix, same constant.** The Wall now releases in two polarity waves `NOOSE_WAVE` (0.8s) apart, keyed off `gapAt`'s parity so it varies per wall without spending another `rand()`. Measured after, 8 walls / 199 bodies: **0 pair-kills**, both orientations; survivors 114/145 vertical and 35/54 horizontal, with the remaining losses being deaths to the player, which is the shape doing its job.

**The player's own suggestion — one colour per wall — was not taken, and it is worth recording why.** A single-colour wall is a free door for anyone holding that polarity: rule 2 exists precisely so no wave is solved by one keypress. The **Sorter** does use solid single-colour walls, but only as a *pair* in opposite colours, so no polarity is safe from both. A lone Wall does not have that structure, so the stagger is the fix and the colour law stays intact.

### The Bomber becomes an ordinary dot (2026-08-02)
Player brief: *"reduce bomber damage to normal dots, it is already lethal by bombing dots around it, removing shield and player intentions."*

**The premise was checked before the number was changed, and half of it is not what the code does.** There is no Bomber blast: `P.blastR` is declared **0** and is **never assigned anywhere in the file**, so the chain-blast branch in `processKills` can only fire while `unstable > 0` — i.e. during the player's own Collapse. The death payload went on 2026-07-29 and nothing replaced it. **Nothing a Bomber does harms the dots around it.**

**The other half is real, and it is the better argument.** A hit is never only HP: `breakStreak` zeroes `combo` and **halves the Mote bank**, so the hardest-hitting body in the sky was also the one most likely to land the blow that deletes a run's accumulated multiplier. "Removing player intentions" is exactly right — it just came from the hit table, not from an explosion.

**`dmg` 26 → 10, Drifter parity.** Verified in-engine by driving one body of each species into a pinned Star and reading the actual loss: mini 6, Dart 8, **Drifter 10, Bomber 10**, Orbiter 11, Splitter 12, Neutral 15, Charger 16, **Brute 22**. The Brute is now the hardest contact hit in the sky.

**Two consequences, stated rather than hidden.** The Bomber is now **strictly weaker than a Drifter** — same damage, slower (2.5 vs 3.4), lower seek, and a far bigger target at r=17 — so its spiked hull is species identity rather than a threat warning, and it has no stat that makes it dangerous. And **'Danger Close'** ("take a Bomber's impact and live") now fires on almost any contact from full health; it is left in place because the roster count is documented, but it should be repointed at the Brute.

**The suite cannot see this change, measured rather than assumed.** The first Bomber can spawn at **t=82s** and the median pilot dies at **57s**, so no scripted run ever meets one. Boss fights and 90s survival came back identical (emitter dead, sentinel 53.3, pulsar 15.1; survival 49/49/57/57/72/86). Worth noting the player's own 71.9s tape ended before a Bomber could exist either — this is a change to a part of the game neither the bot nor the recorded run has actually played.

### Nine species, nine silhouettes (2026-08-02)
Player brief: *"charger identification when cooldown? also i want each enemies identified well while fast/complex combat too. will the difficulty go too high?"*

**A 22-agent audit of the draw code found 43 candidate collisions; adversarial refutation killed all but 5.** Several plausible-sounding ones died on inspection and are worth recording so they are not "found" again: Splitter vs Neutral (the Neutral overrides the fill to hard red/cyan halves, so colour separates them), armed Charger vs Splitter (measures radial extent, not silhouette), Bomber star vs the disc band (the S-scale premise was simply wrong).

**The Charger's cooldown was the worst of the confirmed set, and it was self-inflicted the day before.** Making a spent Charger a plain disc meant a **dmg 16** body wore the exact drawing of the **dmg 10** Drifter for ~62% of its life, with no spent exemption in the contact check. It now keeps the arrowhead and loses only the *fill* — a hollow hull says "the shell is inert, the Field owns it" without lying about the species, and the re-arm becomes a one-frame flood to solid instead of a size change. Stroked rather than double-filled because the enemy pass runs under `lighter`, where stacked fills saturate to white and destroy the polarity contrast.

**The cooldown arc is gone, replaced by a wedge from the centre.** Its own comment defended it as "a PARTIAL sweep, not a closed ring" — but `frac` starts at exactly 1.0, so it *was* a closed ring at the instant every cooldown began, and sat 0.34 units from the Orbiter's arc. A pie has no rim: it cannot be read as a radius and cannot collide with any other ring in the vocabulary.

**Four more species were sharing one silhouette.** Drifter, Dart, Mini and Orbiter all fell through to the same plain disc, separated by radii of 11 / 8 / 7 / 10. Census over six 90s runs: **20.1 Drifters and 8.1 Darts per sample**, co-occurring in **77%** of samples — i.e. ~85% of everything on screen was two bodies distinguished by three pixels.

| species | mark | why |
|---|---|---|
| Drifter | plain disc + core — **the deliberate null** | legibility is differential; if everything is marked, nothing is. The unmarked slot belongs to the most common body. |
| Dart | backward **wake** | aspect ratio is the only cue that survives ~3.9 CSS px on a phone, and it encodes the real difference (maxsp 6.4 vs 3.4) |
| Mini | **no core dot** — solid pellet | at r=7 the dot is under 2px on a phone; its absence is cheaper and louder than any addition |
| Orbiter | **annulus** + pip | replaces a 1.5r arc that stated nothing — its angles were fixed in *world* space, so every Orbiter's gap pointed the same way regardless of curve. The pip now runs clockwise, matching the tangential push. |
| Brute | **hexagon** | flats on exactly `e.r`; straight edges survive scaling where an internal mark does not |

**Difficulty: it went down, not up.** Anchored against the exact build in the player's tape — hash `c76dd415` matches `3dd14fc` — over 10 seeds:

| | tape build | now |
|---|---|---|
| median HP at 40s | 39.3 | **65.5** |
| median score at 40s | 6,109 | 6,661 |
| median survival, 90s run | 58s | 56.5s |
| deaths by 90s | 9/10 | 10/10 |

The early game is markedly softer; the mid-game is statistically identical (survival distributions overlap almost entirely, means 60.5 vs 60.1). What rose is **bodies on screen** — mean 32.9, peak 137 — so the cost of the recent work was never difficulty, it was reading load. Which is why these two questions were the same question.

All changes are draw-only: the sim is untouched, and the boss suite returns the same values as before.

### A mine you can name, a Charger that ends, and matter that takes up space (2026-08-01)
Player brief: *"we should have way to identify bomber"* · *"dodging just continues so long cuz it survives too long"* · *"if same color dots collide, they push each other for space, not merging"*

**The Bomber looked like a jackpot.** It hits hardest in the sky — **26**, against a Drifter's 10 — and was drawn as a plain disc wearing a faint pulsing ring, which is very nearly what a **Gilded Bounty** is: a big dot wearing a ring. One of those you steer into for a jackpot; the other ends the run. It is now a **spiked mine with a blinking fuse**, joining the language the game already speaks (Charger = arrowhead, Splitter = two cores, Neutral = seam). The first pass used **9 teeth at 0.72r**, which at speed still integrates to "a circle with a rough edge" — the exact read it existed to break; **7 points at 0.50r** survives peripheral vision, and an odd count stops it reading as a symmetrical flower at any rotation. The old pulsing 0.7r ring was replaced rather than kept: a concentric circle is the Gilded Bounty's vocabulary, while a core that visibly *ticks* says **armed** — and gives a second, redundant channel for when the silhouette is crowded or distant. The spikes are cut at **exactly `e.r`** and never reach past the hull — deliberately, because that is the trap the old dashed standoff ring fell into: anything drawn outside the body reads as *the danger edge*, while the real contact envelope is `e.r + P.r`, far wider. An honest outline promises nothing it cannot keep.

**The Charger never ended.** Its loop was approach → wind-up → dash → rest → **approach again, forever**. Nothing finished a Charger except killing it, and killing it is precisely what your Field cannot help with, so the answer was to dodge and then dodge again with no resolution.

**Retiring it permanently was built first, and was wrong.** It made the Charger *spent* forever after one dash — measured resolving in **3.13s** — but that deletes a threat rather than resolving an exchange, and a species that answers itself in three seconds is not a species. Player's correction: *"charger dash once, then have cooldown which it makes a ring during duration."*

**So spent is a COOLDOWN.** One committed lunge, then **5s** as ordinary matter, then it re-arms. Measured cycle: dash at 1.73s → **spent at 3.13s** → **re-arms at 8.15s** (5.02s) → dashes again at 9.05s. During the window the Field owns it: across 9.55s spent it was **ringed for 9.52s** — it genuinely becomes your armour. Kill it there and it is gone for good; ignore it and you buy the lunge again. The telegraph, the locked lane and the 5-damage Anomaly kill-lane are untouched.

**The shape carries the state.** A spent Charger is drawn as a **disc**, not an arrowhead, because the hull's whole job is to say *this one is not yours to gather* — and while it is spent that is false. A draining arc at 1.18r shows the cooldown; it is a **partial sweep tight to the hull**, deliberately not a closed ring further out, because that is the standoff-ring mistake again (a ring outside a body reads as a danger radius, and the contact envelope is always wider).

**The colour law now answers the Charger, and gives two different answers.** Measured: **match its colour** → contact is harmless, it rides your ring, and then re-arms **at 117px — inside your own guard**, winding up immediately rather than approaching. **Stay opposite** → your ring annihilates it (dead at 2.12s, before it ever went spent). Armour with a catch, or a clean kill. **Open question for a human:** a 0.9s telegraph at 117px is dodgeable on paper — the lane locks at wind-up and stepping 28px off it is trivial in 0.9s — but whether it *feels* fair is not something a bot can answer.

**Same-colour matter now takes up space.** Rule 1 says like charges cannot annihilate; it turned out they did not interact *at all*, so they overlapped freely and a one-polarity crowd rendered as a single smear. Overlaps resolve positionally, split by mass. **Positions only, never velocity** — impulse would pump energy into the ring orbit that carries your armour. Formation bodies are exempt, since `holdOrbit` writes x/y every frame and a shove would corrupt geometry measured to the pixel.

| | before | after |
|---|---|---|
| 14 stacked same-colour bodies, mean nearest neighbour | **0.9px** | **21.8px** (diameter is 22) |
| player's ring radius, 16 bodies, after 8s | 114.2 | **114.3**, spread 0.4 (design 114) |
| median live bodies over 8 seeds | 31 | **42** |

The ring survives untouched because the shove between ring bodies is **tangential** — it spreads them *around* the orbit rather than off it. The denser field is the real cost: bodies that no longer overlap also no longer drift through each other into opposite matter, so incidental mutual annihilation drops. Median score fell 7,584 → 6,014 with median HP flat (61.9 → 61.5), i.e. fewer free kills rather than a harder game.

### Everything arrives from off-screen (2026-08-01)
Player brief: *"all dots should appear from outside the screen, not inside. it just appears from nowhere"* → *"if all patterns are coming in from off-screen well, we might not need warnings. just make sure all patterns not just 'appear'"*

**Ambient matter used one flat margin for every species,** `m=30`, so a body's leading edge broke the screen almost at once: a **Brute (r=20) had 10px** of clearance, a Bomber 13, a Drifter 19 — under a tenth of a second at their speeds. The margin is now each body's **own radius plus a fixed 46px**, so every species gets identical off-screen approach, and they enter *moving* along the edge normal instead of accelerating from rest.

**Aiming the entry at the arena centre was measured and rejected.** It funnels all four sides into one point, where opposite colours delete each other before reaching you: median HP went the *wrong* way (63.1 → **77.2**) and live bodies *fell* 41 → 36.5. The edge normal keeps the spread and lands at 61.9.

**Cost, accepted deliberately:** over 8 seeded 40s runs, median HP-at-40s **42.0 → 61.9**, with median score flat (6,789 → 7,584). The clearance itself is what costs the pressure — entry speed barely moves it. Player's call: *"accept the easier game."*

**Patterns had the same disease, and one of them could not be cured the same way.** Measured across 4 player positions × spawns:

| | visible on spawn frame, before | after |
|---|---|---|
| Wall / Sorter / Comet | 0% | 0% |
| **Noose** | diagonal arcs on-screen | **0%** |
| **Pulse** | **45.8%** | **0%** |

- **Noose:** its radius was `max(W,H)*0.58` — a constant that ignored where you stand. At 1280×800 that is 742 against a 754 corner distance, so its four diagonal arcs were on-screen from frame one, and standing off-centre put a whole flank in open space. Now measured from the **farthest corner** + 70. Cage geometry untouched (`NOOSE_MIN_R` still 106); only the approach lengthens.
- **Pulse:** the leading arc used to start at `arrive-140` — **140px from your face**. It now starts near its origin, and the origin is placed outside a chosen **edge** rather than on a free bearing.

**The Pulse cannot come from as far out as the others, and that is geometry.** Its front is sized for the radius where it *meets* you, so bodies-needed grows with origin distance against a fixed 34-per-arc cap: 500px → 39px spacing, 700px → **54px**, past the 52px contact diameter. Bound is **~675px**. Hence measuring to the nearest edge, which is always closer than the far corner. Re-verified after the change: **max gap 42.3px** where it reaches you — still a wall, not a fence.

**The 40s suite is blind to most of the game, and that is now measured, not suspected.** The standard 2400-frame pilot stops at **40s**, but formations begin at ~42s, **Chargers at 45s** and **Bombers at 80s** — so the survival numbers came back *byte-identical* across three separate changes to those systems. Anything touching a species or a pattern must be verified some other way (direct spawn geometry, single-body probes) or with longer pilots.

At **5400 frames (90s)** the pilot reaches all of it — and dies every time in **both** builds: control **6/6 deaths, median 61s**; new **6/6, median 57s**. The scripted pilot cannot survive the end of Act 1 regardless of these changes, so mid-game numbers are dominated by its incompetence, not by the build. Median score 18,037 → 13,898, consistent with the same-charge shove removing incidental kills. This is the clearest statement yet of why a human playtest is the missing measurement. Emitter across 6 seeds went 2/6 → 3/6 deaths (mean HP 21.0 → 14.2) — inside the noise of a fight that already kills the scripted pilot a third of the time, and still awaiting its human playtest.

### The comet crosses and leaves (2026-08-01)
Player brief: *"make comet fly away and disappear, going out of screen like real comet"*

**The comet never left.** Its flight ran a fixed `d+m*3` — the distance to a point near you, plus 360px — and the code and GLOSSARY both called what happened next a feature: *"its nucleus is a Brute, so when the flight lapses it stays as ordinary matter."* Measured over 14 isolated spawns, that meant **11 of 14 lapsed while still on screen**, and **every** body that lapsed was still alive two seconds later — several having closed to **92–116px** of the Star. The rarest event in the game, on a 200–300s timer specifically so it would read as *a thing that happens to the sky*, was ending as one more Brute hunting you.

**One constant could never have worked, and that is geometry, not tuning.** The comet is aimed at a point near the *middle*, so the far half of its journey is never the same length as the near half — a level crossing and a steep corner-to-corner one need different distances. The flight is now **solved ray-vs-box** against the viewport padded by the same margin it spawned outside of, so it ends past the far edge by construction. Both components are finite-guarded: the direction is a unit vector, so at least one axis always crosses.

**Reaching the edge retires it, and a retirement is not a kill.** `dead` alone, never `queueKill` — no score, no Mote, no blast, no death FX, because nothing was destroyed. Intercepting it in flight never reaches that line and still pays in full.

| over 14 isolated spawns | before | after |
|---|---|---|
| crossed and left the sky | 0 | **13** |
| lapsed still on screen | **11** | 0 |
| intercepted by the Star | 2 | 1 |
| alive 2s after lapsing | **12 of 12** | — |

The one comet that did not leave ended **35px** from the Star — an interception, which is the ±230px pass-near aim working as designed.

**What it costs you:** a missed comet used to become a large body of ammunition (or a threat) that stayed. Now it is gone, so the opportunity is genuinely lost. That is the point — an event you failed to meet, which is what a comet is.

Verified: `node --check` clean and the page loads with **zero console errors** (the check does not catch ReferenceErrors, so both were run); the full oracle suite green — six pilots, three survival seeds and all three bosses, **all survived**, 464ms, no errors.

### Title lockup, and the World becomes the Star (2026-08-01)
Player brief: *"괜찮은 게임 타이틀 디자인"* → *"we are going cosmic game"*

**The title screen now states the rule instead of describing it.** The old logo was a
white→cyan→violet gradient on the words, which left **red — half the game — off its own title
screen**. It is replaced by a colourless wordmark and four charges on two orbits: an outer red/cyan
pair pinned half a lap apart that can never touch (~282px is as close as they get), and an inner
red/cyan counter-rotating pair that annihilates every 7.6s, impact alternating right/left. Tunables
and the three traps are in [TITLE.md](TITLE.md); drive it in tests with `__orbital.title(t)`.

**World → Star.** `world` had been doing three unrelated jobs — the avatar, the coordinate space
(*world space*, *design units*), and the game's setting (*the silent world*) — told apart only by
capitalisation. Renaming the avatar frees the word: **lowercase `world` now means the space and the
setting, and never you.** 76 lines across index.html, bestiary.html, GLOSSARY.md, ROADMAP.md and
README.md. Entries below this one still say World, on purpose — they were true when written, and
the two that record the *original* core→World re-skin — the ORBITAL CRASH fork (2026-07-21) and the
Cosmic Awe menu ideation (2026-07-17) — would be nonsense rewritten. No code identifier changed; `world` was never one.

**Three real bugs fell out of the work**, all pre-existing:
- **Menu content above the fold was unreachable.** `.overlay` used `justify-content:center`, which
  overflows a short viewport in *both* directions, and `scrollTop` cannot go negative. At 1280×720
  the word ORBITAL sat at `top:-19px` with the menu already scrolled to 0. Now `safe center`.
- **`overflow-y` alone computes the other axis to `auto`**, so the title rings — wider than the
  wordmark — were one stray horizontal scrollbar away from appearing. `overflow-x:hidden` is explicit.
- **Depth was a boolean.** Ring particles used `sin(a)>0`, so scale and opacity both snapped
  (.62→1.18, .45→1) on the single frame a charge crossed a horizontal extreme — a visible flicker
  twice a lap. Continuous in `sin(a)` now: worst step per frame went **0.55 → 0.0014**.

**Menu copy cut from ~65 words to 40**, five one-line beats. Everything removed — scoring, Motes,
rings as armour, powerup orbs — is already stated in full under ❖ Codex, so the menu had been
teaching the game twice. Editing rule, now in TITLE.md: *every beat must hold one line at `.tag`'s
26em measure*; the longest currently sets 353px against 416px, so ~62px is the whole budget.

### The Noose stops eating itself (2026-07-31)
Player brief: *"noose result in colliding each other"*

**The bug was real and total.** The ring closed on the centre while keeping all 20 bodies, so its own spacing ran out before it arrived: at `R=77` every body crossed the 22px self-contact threshold **in the same frame** — uniform spacing means it is not a gradual fray but a simultaneous wipe. Measured against a player pinned motionless at the centre, the shape's closest approach was **77.6px**, and **zero** bodies ever touched them. Both the code comment and GLOSSARY claimed it "travels past the centre, so standing still is not an option." Neither half had ever been true.

**It cannot be tuned into a crusher, and that is a geometric result, not an opinion.** A ring of N converging bodies self-annihilates at `22/(2·sin(π/N))` and only touches you at 26 — the two cross only for **N<8**, and a 7-body ring is a picket fence at every radius worth arriving at. Any ring dense enough to be a wall deletes itself before it lands.

**So: a wall that stops, plus a bite that is under the bound.** The ring locks at `NOOSE_MIN_R=106` (30px spacing — 8px clear of self-contact, well inside the 52px walkable limit) and holds with the seam still turning, while **five strands keep going to 24px** and land on the core. The bite needs no scheduling: it closes at the same rate with a lower floor, so it parts from the ring on the exact frame the ring stops — one continuous motion.

**Peeling the bite out costs the cage five one-slot doors, and that is the good half of the trade.** Locked, it measures one **88.1px seam** (36.1px clear), four **59.7px needles** whose midpoints sit 29.9px from each flank against a 26px contact — a **7.7px thread** — and eleven 30.2px spans that are simply wall.

**Measured, with a no-noose control to separate the shape from ambient traffic:**

| | noose fired | control | cost of the shape |
|---|---|---|---|
| player stands still | 11.3 | 3.8 | **7.5** |
| player circles at r=180 | 7.5 | 2.5 | **5.0** |

A bot bolting blind on each of 24 bearings at the moment of the lock was stopped on **22 of 24** — 8% clean, against the seam's 13% share of the circumference. The cage is a wall in practice; you have to run *at the door*. During flight `minPair` now holds at exactly the designed **30.2px** and all 20 bodies arrive.

**One rejected intermediate, recorded because it measured worse than the bug.** Stopping the ring *alone* left a still player untouched at **104.4px** — 27px further out than the broken version managed. A cage you can park in the middle of is not a noose either.

Regression: Pulse still expands (83→371px in 2s — it shares `holdOrbit` and the new `rmin` clamp is inert for `vr<0`), all five Lab shapes fire at unchanged counts (29/20/99/36/1), Boss Rush unaffected, 301s soak with zero non-finite state.

#### …and how it lets go (same day)
Player follow-up: *"still, noose sometimes dies at the end — can we finish pattern before getting too tight, giving them free will? will this help?"*

Right instinct, wrong lever — and the measurement is worth keeping because **two plausible fixes were built and both failed.**

The end-of-shape die-off is the release, not the tightness. Dropped as one synchronised shell a body-gap apart, the cage funnels back down the polarity field onto the core; rule 2 makes every neighbour *opposite*, and the field moves the two colours at wildly different speeds (same-colour is hauled in and captured into rings, opposite only drifts at 1.35px/frame). They interleave and detonate **within five frames** — 12 of 20, in pairs, at the cage radius.

- **Rejected: finish the pattern earlier, at a wide radius.** Swept over release radii 106/150/200/300 × stagger 0/0.6/1.5s. A cut at **300px left as few survivors as one at 106**. Chord scales with radius, so a converging ring always meets itself at R=77 wherever it was set free.
- **Rejected: bloom outward on release** (112px of `flung` travel). It separated the ring exactly as designed — peak radius 223 — and still lost **7.4** bodies to each other, because the field simply re-converged them. Worse, it threw them out through the player's ring orbit and back, so *more* died to the grind (6.4 vs 4.4) and *fewer* ever reached the player (2.8 vs 4.8). Built, measured, deleted.

**What worked came from the colour law, not geometry: same-colour matter cannot annihilate itself.** The cage now releases in **two polarity waves 0.8s apart** (`NOOSE_WAVE`), so adjacent bodies are never in the field together. Of ~15.5 cage bodies, mutual kills fall **9.7 → 4.0** standing still and 6.5 → 5.3 moving; bodies that reach the player rise **0.7 → 2.3**. One line, keyed off `gapAt` parity so it varies per noose without spending another `rand()`.

**The control that reframes the whole complaint.** Sixteen *ordinary* bodies simply placed on the same 106px ring around a still player — no formation, no flight, no script — annihilate **16 of 16**. A dense alternating group near the core always eats itself; that is the game's physics, not this shape's bug. The Noose cannot beat the field, only be less bad than it, and it now loses 4 of 15.5 where raw matter in the same place loses everything. Closing the rest would mean breaking rule 2 or the colour law, so it is deliberately left here.

Deaths that read as "other" turned out to be the **player's own rings** — median radius at death 114px, exactly the ring orbit. That is armour eating the shape, which is the player earning it, not the pattern failing.

Re-verified after the change: bite still lands at 24px with 1–2 bodies touching a still player, `minPair` on rails 26px+, blind bolt at cage-lock stopped on 18 of 24 bearings, all five Lab shapes fire, 301s soak and Boss Rush clean, zero non-finite state, console clean.

### The comet gets rare, Point-Blank goes, and a Pattern Lab (2026-07-31)
Player brief: *"make comet rarer / remove point blank x3 feature / where can i test patterns?"*

**The comet is rarer — and the first attempt made it commoner, which measurement caught.** In the shape rotation at 1-in-5 it ran **1.3 per 10 minutes** against ~6.3 formations. Pulling it out onto its own 75–120s timer produced **3 per 10 minutes**: more than twice as often as the thing it was meant to undercut. Two facts had been missed — the timer only advances **outside a boss**, which is only ~301s of any 600s run, and formations are gated the same way, so the comparison is against a much smaller denominator than wall-clock suggests. At **200–300s** it measures **1 per 10 minutes** across five seeded runs, which is what "an event, not a wave" needed.

**Point-Blank Resonance removed.** Kills inside the Field paid ×2 and ×3 deep inside, with crash-kills denied the bonus so courage paid and collisions did not. Every annihilation now pays a flat **10 × multiplier** wherever it happens — verified at 20px, at the 170px rim and at 400px, all **10**. Where you stand is already priced by the things that decide the fight: closing the range is how a Volley connects, and it is what walks you into an Anomaly's point-blank fire. The `_contact` flag went with it; it existed only to deny the bonus and had no other reader, so `queueKill` lost its second parameter.

**Pattern Lab**, a third mode beside Boss Rush. A live ambient field with **no Anomaly and no Epoch phases**, and **1–5 fire the five shapes on demand**. Auto-formations are suppressed there, so nothing arrives unless you press for it. It exists because Boss Rush structurally cannot serve this: formations are gated on `wavePhase!=='boss'`, which is most of what Boss Rush is. Like Boss Rush it cannot set the best score. Verified: 150s with no boss and no unrequested shape, all five keys firing (29 / 20 / 99 / 36 / 1 bodies), and Boss Rush still working.

**A note on the seeded traces, which all moved.** Two causes, and only one of them is a gameplay change. The scoring change is intended: survival scores fall 12–28%. The other is incidental — initialising `cometT` adds one `rand()` call at run start, which shifts the whole RNG stream, so every seeded run re-rolls. Neither is a defect, but it does mean these traces are a **fresh baseline** rather than a comparison, and old fingerprints are not meaningful against them.

### Three patterns that make COLOUR the puzzle (2026-07-31)
Player brief: *"i was thinking about more fun and creative patterns, like tilt to live."*

Tilt to Live is a useful comparison for what it *cannot* do. It has one enemy type and one verb, so geometry is its entire design space, and its patterns are brilliant spatial puzzles because that is the only axis available. **This game has a second axis and the patterns were not using it.** Rule 2 in the pattern header — *alternate every body* — employs colour **defensively**, to stop a wave being solved with one keypress. Both shipped shapes, the Wall and the Noose, are pure space: neither needs a polarity button to exist.

**◉ The Pulse** — a shockwave from elsewhere in the sky. Three nested **arcs** wash outward over you, each a **single colour**, alternating arc to arc, so it is answered by *matching* rather than dodging. Measured: 150° of front, 31 bodies per arc, radii 120 / 250 / 380 at a centre ~500px away, and **45px spacing at the radius where each arc reaches you** — under the 52px contact diameter, so rule 1 holds where it actually matters even though the arc fans out as it expands. Arcs rather than full rings because a circle sized that way costs ~72 bodies each, and because an arc leaves running around its edge as a real second answer.

**◈ The Sorter** — two **solid** walls converging, one red and one cyan, doors at different heights. Neither door helps you with the other wall and no polarity is safe from both: match the one arriving first, then flip for the second. This breaks the *letter* of rule 2 while keeping its spirit — one solid red wall is a free door if you are red; two, in opposite colours, cannot both be. The walls **annihilate each other** where they meet, which is what ends the shape rather than a timer.

**☄ The Comet** — an event rather than a formation: one body crossing the sky at **7.6 px/frame**, three times anything else, trailing a tail emitted in world space so it drifts behind the nucleus instead of being welded to it. Charged, so it is either a large ammunition delivery you intercept by positioning or a fast threat that crosses. Aimed to pass **near** you (±230px), so measured over five passes it touches you **1 time in 5** — an opportunity, not a hit. Its nucleus is a Brute, so it stays as ordinary matter when the flight lapses.

**Two bugs caught by measurement, both in the Pulse.** `o.a += o.va` steps per **frame**, and I had computed the arc's drift per **second** — 60× too fast. Because the flight is polar the error compounds with radius, and the second bug fed it: a flat 9.5s hold let arcs expand past R≈1700 offscreen, where even a small angular rate is enormous tangentially. Peak body speed measured **210 px/frame**. Fixed by dividing the drift by frames of flight and giving each arc a hold just long enough to sweep past and clear: peak is now **12 px/frame**, which is the same figure the Sorter shows and is ordinary post-flight ring physics rather than anything the shape does.

**Existing measured behaviour untouched**: 97 fingerprints across the six seeded traces, identical. That holds by construction — formations only fire after `elapsed > 42` and never during a boss, so the survival traces (40s) and the boss traces never reach one. A separate 300-second run does reach formation time repeatedly: no errors, all state finite.

### The sky becomes a sky: parallax starfield in, the square grid out (2026-07-31)
Player brief: *"i'm planning to make our game to have more cosmic feeling in game overall."* — presentation layer, with the fight held exactly as measured.

**The game had no stars.** Not one: all 32 matches for "star" in the file were inside `start` or `starburst`. The background was a radial gradient, three nebula blobs, and **a 54px square grid** — and that grid was the most structured element on screen. A Cartesian lattice is the visual language of a scoreboard, so the most legible thing behind the arena was actively saying *arcade playfield* over the top of a nebula.

Now three depths, all drawn outside the shake transform (a starfield that shakes with the arena reads as a painted backdrop wobbling, not as distance):
- **Stars** — three layers, 150 / 78 / 30 bodies, parallax 0.012 / 0.032 / 0.075 against the Star's position, so the near layer travels six times further than the far one when you move. Twinkle on a per-star phase; about a fifth carry the biome tint instead of white.
- **Gas** — five clouds instead of three, drifting slower, one of them in the deep biome colour rather than the accent so the sky has some variation instead of a flat wash, on its own 0.02 parallax between the stars and the arena.
- `reduceMotion` keeps the depth and removes 70% of the travel.

The grid is gone. It did carry one real job — something fixed to judge your own motion against — and the parallax does that job better, because layers moving at different rates encode distance as well as movement.

**Generated from a local fixed-seed PRNG, never `Math.random`.** `initStars()` runs from `resize()`, and a resize mid-run that consumed global entropy would shift every spawn after it and silently invalidate the oracle. Side benefit: the sky is identical across reloads.

**Two things this pass had to fix in itself.** `initStars` first used `TAU`, which is declared *below* the boot-time `resize()` call — a temporal dead zone throw at load, and exactly the class `node --check` cannot see. And the harness could not verify any of this: the Browser pane runs with `document.hidden === true`, so `requestAnimationFrame` never fires and the canvas had been blank for every pixel sample taken this session. The seam now exposes `render()`, which is how this change was measured and looked at at all.

**Verified presentation-only**: 97 fingerprints across the six seeded traces, **identical** with and without the whole pass. Readability held — the core measures 248 brightness against an 18 background, and the starfield lifts the background by 0.2 (17.8 → 18.0) while the brightest pixel in a clean frame is still a star, not gas.

### The volley flies further and faster — and that turns out not to be the constraint (2026-07-31)
Player brief: *"volley velocity and range should be little stronger."*

`VOLLEY_SPD` **7.2 → 8.4** px/frame and `VOLLEY_HOLD` **1.5 → 1.75s**. Measured on a single tracked body, boss and player 950px apart with the colours forced so the shot is genuinely a volley: launch **9.05 → 10.25 px/frame** (the extra over `VOLLEY_SPD` is the same flip's Shockwave pushing the body it just fired), peak reach **449 → 542px**, and it is still un-clamped at the 1.5s mark where it used to already be reeled home by seek.

**The old comment was wrong and is now corrected.** It claimed "~640px of dead-straight travel"; straight travel is `v0·(1-0.985^N)/0.015` with `N = hold·60`, which at 7.2 / 1.5s is **357px**, not 640 — the figure had read the *asymptote* of the friction series rather than its 90-frame sum. Both numbers in that comment are now measured rather than derived.

**What it does not buy — worth recording, because it is the interesting half.** Across 8 seeded fights per kind at **150 / 300 / 400px**, before and after, the outcomes are **identical at every range**: 1 / 7 / 4 kills at 150px, 0 / 0 / 2 at 300px, 0 / 0 / 0 at 400px, both builds. Reach was never what stopped long-range fighting. Ring fire is **radial**, and at 300px the Anomaly subtends ~4.6% of the circle — so a longer shot delivers more matter to where you were already not aiming. The buff is felt as *shots landing that used to stall and be dragged back*, not as a new way to fight from safety, and the "Why range is the skill" row still holds unchanged.

### Balance pass: core damage repriced, the close reversal removed, HP ×1.5 (2026-07-31)
Player brief: *"dmg to core: missile to 10, mine blast to 20, contact to 30 / Emitter second pressure dash also available at Epoch II / delete close reversal dmg for anormaly, only removing neutral dots / make ring grind dmg 1, charger dash 5, and buff anomaly HP 1.5x."*

**What it costs you**, now ranked by how much warning the hit carries: **missile 14 → 10** (the thing you eat most often, so the cheapest), **mine blast 12 → 20** (it announces itself twice — it arms, and it draws its own blast radius — so standing in one is a decision, and at 12 it was the one hit you could ignore), **body contact 34 → 30** (the most expensive and the least excusable: a 44px object that walks at you slowly and audibly).

**The close reversal is gone.** A charged reversal used to chip the Anomaly if its Shockwave reached the body. It shipped at **2**, measured *dominant* — solo-killed an Epoch I Anomaly in 26s for 5 HP — was cut to **1**, and is now removed outright. Every repricing was answering the same objection at a smaller scale: it let you park in the band and spam the flip. The argument that kept it was always the weakest one on the page — *a player with no rings needs something* — and the answer to having no rings is to gather more, which is the loop. **The Shockwave's job is Neutrals and repositioning.** Verified: 12 fully-charged flips at point-blank take the boss from full to full, **0 damage**.

**Erosion repriced around that**: ring grind **0.5 → 1**, baited charge **4 → 5** (since the close reversal went, it is now the *only* erosion needing neither ammunition nor Capacitor). **Boss HP ×1.5** — `round((13 + Epoch×5) × 1.5)`, so Epoch I–VI is **27 / 35 / 42 / 50 / 57 / 65**, Pulsar **20 / 26 / 32 / 38 / 43 / 49**. Raising the pool rather than holding the prices down: the grind at 1 against 18 HP is what the 0.5 repricing was avoiding, and against 27 it pays about a third of a fight instead of most of one.

**The Emitter's dash arrives at Epoch II, not III.** The tip on the integrity bar switches on the same epoch, so the bar and the behaviour cannot disagree.

**Measured, same 12-seed bot both sides** (fixed 150px orbit, flips on cooldown, no dodging):

|  | before, kills/12 | after, kills/12 | before, deaths | after, deaths |
|---|---|---|---|---|
| Emitter | 0 | 1 | 12 | 11 |
| Sentinel | 3 | 10 | 9 | 2 |
| Pulsar | 3 | 7 | 9 | 5 |

Net **6/36 → 18/36** kills and **30/36 → 18/36** deaths: despite +50% HP the pass made boss fights markedly *more survivable*, because cutting the missile — the hit you take dozens of times a fight — from 14 to 10 outweighs everything else. The mine going 12 → 20 did not reverse that for the Pulsar; there are 2–3 mines a cycle against 13 ring shots.

**The Emitter is the outlier in both builds** and should be read as a bot artifact before a balance signal: this bot holds a fixed 150px orbit and never dodges, which is exactly the worst way to fight the kind that hovers and shoots you point-blank. Worth one human playtest before acting on it. Logged on the watch-list.

### The Sentinel's hunt becomes a walk like the others (2026-07-31)
Player brief: *"hunt of sentinel is too fast."*

Correct, and the cause was not the hunt speed constant — `HUNT_SPD.sentinel` is 1.3 against the Emitter's 1.15, and all three kinds already **arrived in the same ~4s**. The Sentinel spirals rather than walks, and that shape hid two separate ways for the body to move much faster than a walk.

**`orbA` was never seeded.** `huntR` was initialised from the boss's real distance, but the angle was left wherever the arena orbit had got to — so a hunt handed the boss a point somewhere else on its circle and it sprinted sideways to reach it. Frame 1 of a hunt measured **10.71 px/frame**, decaying over about twelve frames. That is nine times the Emitter's walk, at the exact moment the telegraph is asking you to read the threat.

**The angular rate was fixed, so the sweep speed scaled with radius.** `orbA += dt*0.85` runs a tangential **4.96 px/frame at 350px** and 2.13 at 150 — fastest when furthest, which is backwards for something closing on you: it whipped in and then slowed down as it arrived.

Measured from a 350px station against a still player — median **2.68 px/frame**, peak **10.71**, and **825px of ground travelled** to close 350 — against the Emitter's flat 1.15 / 1.15 / 273.

Three changes, all shape rather than speed:
- **Seed `orbA` from the bearing the boss is already on**, so the spiral starts where the body actually is and there is nothing to sprint to.
- **Cap the tangential speed (`HUNT_TANG` 1.1 px/frame) instead of the angular rate**, with the old 0.85 rad/s left as an upper bound it only reaches close in. The spiral now reads as one steady pace at every radius.
- **Cap the per-frame step (`HUNT_STEP` 2.0)** instead of following 10% of the gap. That follow was a proportion, not a speed: a 400px player flick would have moved the boss 40px in a single frame. The cap has to stay above the target point's own speed (radial 1.17 + tangential 1.1 ≈ 1.6) or the body trails its own target and never arrives — the failure a `dt*2.2` follow produced once already.

After, from the same station: median **1.37**, peak **2.0**, path **402**. Arrival **4.15s** against the Emitter's 3.95 and the Pulsar's 4.33 — unchanged, so the threat timing is untouched and the spiral simply costs it the extra distance it travels. Against a moving player all three land together (5.28 / 5.32 / 5.33s), and against a player strolling away **none of the three make contact**, which is the promise the Hunt row makes.

**It is not more dangerous for being slower**, which was worth checking because a straighter approach could easily connect more often: **62.5% → 54.2%** of hunts land, over 24 hunts apiece across 15 seeded 120s fights. One seeded oracle trace did flip from surviving at 90 HP to dying at 13s — a fixed script that does not dodge, and exactly the single-trial swing this ledger has been caught by before. The 24-hunt sample is the answer, not that trace.

Scoped, per the oracle: five of the six traces are **byte-identical**, and `boss-sentinel` diverges at exactly the fingerprint where its first hunt begins.

### Cleanup pass — 12-agent audit, 83 findings, and a behaviour oracle (2026-07-31)
Player brief: *"time to refactor / clean up codes and documents?"*

Fifteen gameplay passes had gone in without a sweep behind them. A 12-agent audit over six lenses (dead code · dormant mechanics · doc↔code drift · duplication · structure · document hygiene), every finding then re-derived by an adversarial verifier, returned **83 confirmed and 3 refuted**. The refutations earned their keep: one finder wanted to delete `GRIND_MULT`, the deliberately-empty table this ledger says was left in place *"so the idea is not re-attempted from scratch."*

**The oracle came first.** Refactoring a game tuned by measurement needs proof, not confidence: seeded PRNG in place of `Math.random`, the rAF chain frozen so manual ticks are the only driver, `store.achv` restored per run (achievements unlock perks and would otherwise leak between runs), and a scripted pilot — Lissajous pointer path, a flip every 47 frames, a Collapse every 311 — over 3 survival seeds × 40s and all 3 boss kinds × 25s. **93 state fingerprints per run, reproducible byte-for-byte.** Every commit below was checked against it and every one came back identical. Harness and baseline: see the pass's scratchpad, or re-derive from this description.

**Two bugs surfaced that were not debt.**
- **`hexA()` is six-digit only.** `parseInt('fff',16)` is 4095, so `hexA('#fff')` returned `rgb(0,15,255)` — saturated blue, silently. Three boss strokes used it: the Sentinel's two rings, the Emitter's hex outline, the Pulsar's telegraph ring. The other 13 `hexA` calls in the file spell white as `#ffffff`, and `bestiary.html` drew the same shapes white — so the game and the bestiary had been painting **different silhouettes**. Fixed, with the trap documented on `hexA` itself.
- **The Codex told players missiles are blocked by matter.** *"an Anomaly's missiles are stopped by the first body in their path"* — the rule deleted on 2026-07-29 — printed eleven lines above the same Codex saying missiles pass through everything and nothing is cover. Rewritten to the shipped rule.

**Deleted: 14 dead symbols** (`camX`/`camY`, `COLd`, `achvDone()`, `fireOneLance()`, `MNAME`, `lastKillT`, `bossPulseT`, `surgeTimer`, `comboTimer`, `actTime`, `orb.born`, the grid's `cols`, `P.pullMul`, `P.volN`, `id="bosslabel"`), each verified by exhaustive grep across all five files, the debug seam and every inline handler before removal.

**Deleted: the dormant arsenal, 245 lines.** `P.singularity` (74), `P.congreg` (50), `P.sats` (26), `P.ferro` (26), `P.arc` (24) and seven smaller flags (45) — every one gated on a field `freshRun()` set to 0 that nothing ever wrote. GLOSSARY §11 had kept them as "written, tuned, switched off"; git keeps them better, and §11 is now an index of what went and where to find it (`git show 0b408c4^:index.html`) rather than a list of live-but-unreachable code. Kept on purpose: `ruptureBlast()` (live via Aegis), `P.shield` (Aegis grants it), `P.blastR`/`blastDmg` (reachable when `unstable>0`), and the identity-valued multipliers, which sit inside live arithmetic and would cost edits to save nothing.

**`node --check` passed the whole time `discharging` was still referenced in `flip()`.** It cannot see a ReferenceError; only loading the page caught it. That trap is now three-for-three across sessions.

**Structure.** `step()` was 471 lines — its seams were already banner-marked, so it lifted verbatim into `stepPlayer` · `stepEnemyForces` · `stepCollapseWave` · `stepAnnihilation` · `stepPlayerContact` · `stepRunTimers` · `stepDecay`, leaving 33 lines that read as the phase list they always were. Checked before moving anything: every block brace-balanced, no local crossing a boundary, exactly one `return` (in the contact block, now `true`/`false`). `flip()` split into `hungryFlipBurst` + `flipShockwave`, which shared only `hc`. `render()` was **not** oversized — 54 lines, already decomposed — a premise the audit corrected rather than accepted.

**One home each** for the fling law (written twice, differing only by a clamp that was a no-op at the first site), the multiplier law (five sites), the Neutral's seam angle (computed twice per body per frame), and `COL[e.color]` (a no-op ternary, three sites). Ten `document.getElementById` calls now use the `el()` helper the file already defines — line 251 keeps the long form, because `el` is a `const` declared far below and calling it during module evaluation would hit the temporal dead zone.

**Documents.** 34 drift fixes. The largest were structural: **286 lines of this file — 40% — were a byte-identical copy of POLARIS's ledger**, and the Backlog, Balance watch-list and Decisions log the file presented as its own were *POLARIS's*, six of nine backlog items naming systems this fork deleted. Those were separated out and later dropped entirely — the surviving Backlog and watch-list are this game's, written fresh. Also: the 2026-07-17 comfort pass was recorded twice with identical numbers (the shorter copy went); three stale `index.html:NNNN` citations now name stable identifiers instead of line numbers into a file that changes daily; entries superseded later the same day carry a `⤴` marker rather than being edited, so the measurements and the reasoning stay verbatim; and the folder-rename date was **2026-07-22 in README and 2026-07-27 in its own entry** — 07-27 is right.

**Also:** `git init` — this was 228KB of measurement-derived tuning with no version control at all.

`3585 → 3384` lines, and the file no longer contains anything that cannot run.

### The reversal stops narrating itself (2026-07-29)
Player brief: *"dont have to show volley x6 things in text."*

`VOLLEY ×n` and `FLUNG ×n` popped over the core on every hungry flip. They were a **third text channel** that GLOSSARY §8 had never sanctioned — that section lists exactly two, the pickup pill and the achievement toast — and they failed its rule for the same reason a centre banner does: they printed a tally *of the thing you had just watched happen*, on the exact frame your eyes should have been on the matter you threw. The reversal already announces itself with a ring at the burst's true radius, the bodies visibly launching, a screen kick and a sound. Both counters survive as variables because they gate that feedback; they are simply never rendered. A dead `fired` counter — incremented, never read, and never printed even before this — went with them.

### Gathering stops punishing movement · the Charger becomes an arrowhead and a weapon (2026-07-29)
Player brief: *"grinding in-game is quite difficult, evading all missiles, need to move slow to keep dots in ring, etc."* · *"charger should look little different to expect not pulling into ring, maybe dealing significant damage to anormaly when charging might be good choice"*

**Two halves — and the first pass got one of them wrong.** I initially reported that "you have to move slow to keep dots in the ring" was false, on a test that strafed smoothly at up to 13 px/frame and kept 100%. The player pushed back — *"no it doesnt, it just might followed core. move faster than you tested"* — and was right. The follow is `(pointer − P) × 0.185` with **no cap** outside the brief post-resume window, so 13 px/frame is roughly a third of what a real input reaches. Re-measured: **sustained** speed genuinely does not shed a ring (13 / 25 / 45 / 80 px/frame all keep **93–100%**, because bodies settle into a steady lag inside the Field) — but a **corner-to-corner flick peaks at 135 px/frame** and leaves the ring hundreds of px behind on the wrong side, keeping **only 36%**. Direction reversal is the shredder, and dodging is nothing but direction reversal. A test of smooth motion at a third of top speed could not see the thing being reported.

**Ring hysteresis** fixes it: once gathered, a body keeps membership for **0.8s** after a move outruns it and the spring reels it back the whole time; past **2.4× the Field** it is genuinely lost rather than lagging. Flick every 0.75s → **93%** (from 36%), every 0.42s and 0.25s → **100%**, sustained 45/80 → 100%. The boundary is real, not stickiness: a 300px displacement keeps 10/10, a 600px one drops to 4.

**The other half was the gather rate.** A Drifter's ceiling is `3.4×1.9` ≈ **6.5 px/frame** while a steering Star reaches **13+**, so a player weaving to survive simply outruns their own ammunition — measured average ring **3.2 while dodging against 4.3 standing still**. Gathering and surviving were pulling against each other, which is exactly wrong for a mechanic whose whole premise is holding close range under fire.

Fixed by removing the friction rather than paying more for enduring it: core gravity **0.16 → 0.30** with reach **1.5× → 1.8×** the Field, and like-charge that is closing under that pull now gets **ring-grade speed headroom (2.9 instead of 1.9)** so it can actually follow a moving Star. Result over 8 trials each: **3.3 dodging vs 2.6 still** — movement no longer costs you the gather. The approach still settles cleanly (272→227→154→111→**114px**, no overshoot, no re-exits), the hostile side is untouched (opposite colour still enters the Field at **1.47s**, unchanged), TTK holds at **15.0 / 13.5 / 14.3**, and grind-only remains **0 solo kills in 5** per kind (medians 3.5 / 5 / 7).

*Two measurement cautions from this pass, both recorded because they nearly produced wrong ships.* First, the retention test above: **scope the input to what players actually do** — smooth motion at a third of top speed said "no problem" about a problem that only appears on reversal. Second, a three-trial reading of the gather change said it made things **worse**; ring size in a live fight swings 0.5 to 5.5 between runs, so three trials is an anecdote and eight is a signal.

**The Charger is an arrowhead now.** It is the only body the Field does not own — it will never join your ring — but it was drawn as one more soft disc, so players waited for it to be gathered and it never was. It now draws as a hard angular hull pointed along its heading, the only directional silhouette in the sky, which reads instantly against the discs around it and doubles as a read on where the dash is going.

**And a committed charge driven into an Anomaly is worth 4** — the one sanctioned exception to the two-channel rule, admitted only because it passes that rule's own test. You cannot aim a Charger, but you can stand so its locked lane runs through the boss, which is real positioning under fire and the same bait the Charger already rewards against the swarm. Gated on `cst==='dash'` so a drifting one pays nothing. Measured before shipping: **0 accidental hits across 8 idle 45s fights** — the boss cannot walk into it — while a deliberate line-up lands **4** and consumes the Charger, and the identical setup off the line lands **0**. Priced above a volley body on purpose: a volley is one of a dozen from a hoard, this is a single body you kept alive, read, and stood in front of.

### Ring grind priced down 2 → 0.5 · the "runner bonus" measured backwards (2026-07-29)
Player brief: *"isnt ring grind too strong? 6 should be enough. some bosses(mostly running away) might taking more dmg from ring grind might be good too"*

**Too strong, and a single trial hid how much.** At 2/body a hoarded ring dumped **18–20** in one pass — an outright kill on an 18 HP Epoch I boss. Halving to 1 fixed the burst, and one measurement of the sustained rate came back reassuring (4 / 8 / 13, no kills) — but repeating it six times per kind told a different story: a bot orbiting at 130px that **never fired a single volley** solo-killed the Anomaly in **2–4 fights out of 6**, median **11 / 17 / 14**. A supplement that solo-kills two thirds of the time makes the Volley — the intended main line — optional. The lesson is the measurement discipline, not the number: one run of a stochastic fight is an anecdote.

At **0.5/body** it lands on the brief exactly. Grind-only over 45s: medians **5 / 4.5 / 11** with **0 / 0 / 1** solo kills in six. A 12-body hoard burst: **6 / 7 / 6**. Full-fight TTK returns to the pre-grind baseline — **15.1 / 13.5 / 12.8** against **15.2 / 13.7 / 11.2** before the grind existed, 4/4 kills. The floating readout now formats fractions, so a grind reads `-0.5` rather than a float artefact.

**The runner bonus was a good idea that measurement refuted.** Giving the chase kind more grind damage looks obviously right — you had to catch it, so the ring should be worth more. Built it (Sentinel ×2), measured it, and the premise was false: closing on the **Sentinel** is the **cheapest** of the three, not the dearest. Hoard a ring, walk in and hold contact for 5s and you pay **−27 HP** — you *regenerate*, because its orbit carries it away instead of parking on you and firing — against **82** for the Emitter and **66** for the Pulsar, both of which sit still and shoot you point-blank. At ×2 that was a free 18-damage kill for less than no cost. **Hard to catch and dangerous to stand next to are different axes**, and a contact-damage channel is priced on the second one. `GRIND_MULT` is left in place but empty, with the finding written beside it so the idea is not re-attempted from scratch.

### The two-channel rule: a moving Anomaly must not damage itself (2026-07-29)
Player brief: *"any opposing color may hit anormaly, so its movement hits himself, by colliding. so we need to limit damage, only ring spin and volley, not simple collision."*

**The player spotted a structural consequence of the Hunt that the pricing had not caught up with.** Damage from matter was priced by *how deliberate the delivery was*, which is a sound idea while the boss holds station — but the Hunt now walks it the length of the arena through a field full of matter. Any rule shaped like "opposite-charge contact hurts it" therefore means **the Anomaly damages itself by travelling**, and the player need do nothing at all. The list cannot be about what touches it; it has to be about what **you aimed** or **what you carried**.

So the list is now closed at two: **VOLLEY** (3, you fired it) and **RING GRIND** (2 — repriced to **0.5** later the same day, see "Ring grind priced down" above; you gathered it and steered it into contact). Everything else pays zero and bounces. Removed: the **Brute barge** — priced when the Hunt still halted 117px short and Brutes measurably never reached the boss on their own, which stopped being true the moment it crossed the whole arena — and the **Fling**'s 1.4s `e.fdmg` "still counts as your shot" window, since a body you shoved *away from yourself* is not a shot you took at something. `BARGE_MASS`, `BARGE_DMG`, `FLING_DMG`, `FLING_DMG_T` and the `fdmg` field are all gone.

**Measurement said the removal costs nothing.** Over 6 idle 45s fights the self-inflicted contacts were **13 grind, 0 barge, 0 fling** — both channels were already worth nothing in practice and were purely latent holes. After removal, damage by channel: **volley 4 · grind 18 · fling 0 · barge 0 · drift-in 0**. TTK unchanged within noise (emitter 15.8→14.3s, sentinel 11.5→13.0, pulsar 12.8→11.8), and idle self-damage sits at **1.5 HP average** against 18, with the player dead in all six.

**Recorded as a standing rule, not a table row.** This is the *fourth* time this exact clause has had to be re-tightened — a flat 1-per-contact chip once took an Epoch I Anomaly from 18 to 12 HP in 15s with the player idle; an `unstable>0 ? 2 : 0` paid drift-in matter double a deliberate hit during a Collapse (12 Dots on its skin → 33 damage in one frame, 24 Dots → 95); then the barge; then the fling. GLOSSARY §7 now opens with the rule and the full history, and the boss-contact block carries the same reasoning inline with a one-line test for any future proposal: **could the Anomaly earn this by moving?** If yes, it does not belong.

### Ring spin dialled back · the Singularity stops eating your hoard (2026-07-29)
Player brief: *"our dots spin with ring membership is too fast it makes seniors dizzy"* · *"singularity is sometimes a mess when we are farming for anormaly kill"*

**The spin overshot.** Raising it from 0.9 to 1.6 earlier the same day fixed a ring that read as *parked* (3.6 px/frame, 3.2s per revolution) but landed at **6.4 px/frame, 2.05s** — and a ring whipping that fast around a core you are simultaneously steering is a comfort problem, not a taste one. Now **1.2** (Eddy 2.1) → **4.8 px/frame, 2.49s**, which sits between the two failures. The existing **`reduceMotion`** toggle — already wired to shake, flash and hitstop — now scales the spin too: **3.36 px/frame, 3.44s**. Players who need a calm ring get one without the default being flattened for everyone.

**The Singularity was eating the ammunition it was supposed to protect.** The well captured and devoured every body except the boss — including **your own colour**, which during an Anomaly fight *is* your entire volley supply. So the sequence was: hold a pole to gather rings, Singularity lands, hoard gone. And since the boss is immune to the well anyway, in that fight the only thing it reliably destroyed was yours. Like-charge is now skipped at the **capture gate**, not merely spared at the horizon — which also stops `blackholeCollapse()` flinging your rings across the arena when the well expires. Verified with the well running: **14/14 ring bodies alive, 14 still ringed, 0 frames seized, radius unchanged at 114px** — bit-for-bit identical to no Singularity — while it still devoured **12/12** hostiles and **6/6** Neutrals for **0** damage taken.

One trap worth recording: the first patch went to the wrong black hole. `hole` is the **dormant** `P.singularity` Collapse variant (§11); the live powerup is `FX.blackhole` → `P.ehorizon`, devouring inside the enemy force loop. Both now carry the same rule, so the dormant one cannot wake up with a bug the reachable path has already fixed.

**Docs audited against the code in the same pass.** Four rows were stale and are gone or corrected: a row describing the missile **block** VFX and `e.blk` (both deleted when missiles stopped interacting with matter, and it still claimed Skeet Shooter fires on a block); the Mine entry claiming blasts **scatter** matter (they touch nothing now); *"Three ways in"*, which predated the Brute barge and the ring grind and undercounted by two; and the Brute's *"everything lighter bounces off"*, false since ring bodies grind. Ring-spin figures and the Field entry were refreshed to match.

Verified: `node --check` clean on both files, no console errors, 240s survival + 120s Boss Rush + a 90s run re-granting the Singularity every 5s, all with **no non-finite** values.

### The ring grinds · the Hunt goes for the core · the Charger's lane (2026-07-29)
Player brief: *"anomaly currently doesnt get hit by spin of dots, only fling/purge hits? i think both should damage it"* · *"anomaly may try to hit the core, but not too fast"* · *"charger telegraph is hard to predict when it is far away"*

**A loaded ring was inert until you spent it.** Boss contact is priced by how deliberate the delivery was, and a body whirling at 6.4 px/frame had no `vdmg`, no `fdmg` and (unless a Brute) mass < 2 — so it paid **0 and bounced off**. Only the flip-burst connected. The spin now cuts for **2**, the fling's price: you did not aim it, but you spent a hold gathering that ring and you have to carry it into contact range. Contact consumes the body, which bounds a grind to the hoard you actually built — verified 12 ringed → 12 consumed → ring empties, no perpetual grind. It does **not** open a free-damage hole: an idle player deals **0.5 HP average** to an 18 HP Anomaly and dies in **6 of 6** fights. *(An earlier reading of 10–16 free HP was my own harness artifact — it kept ticking for 45s after the player had already died.)*

**The Hunt stopped 117px short, and nobody knew it existed.** It halted at `b.r+P.r+58` on the reasoning that its touch is 34 and it is never consumed, so a boss on your skin would be an unanswerable hit — 34 per 0.55s of i-frames ≈ **62 dps**. That was sound about *parking* and wrong about *arriving*, and it cost twice: the Hunt became a non-event, and 117px is almost exactly the ring radius (114), so once rings began grinding the Anomaly would have sat *inside the grinder* taking free damage. It now walks all the way onto the core, slowly — **~5s to cross ~400px** — and the parking problem is solved where it actually lives: **one 34-damage hit, then an immediate break-off**. Verified exactly one hit, **1 frame in contact**, clean retreat 106 → 388px. Two of my own bugs surfaced under measurement: `huntR` was read but never assigned on the first frame, so the Sentinel's spiral never tightened; and its `dt*2.2` follow closed only 3.7% of the gap per frame — slower than the spiral shrank — so it trailed its own target and never arrived in 12s.

**And it is telegraphed now.** Three echo rings at 0.34 alpha and one Codex line was far too quiet for the moment the Anomaly is closest. Brighter, longer wake (0.62 alpha, four rings); a dashed lane drawn to your core in the same grammar as the dash telegraph; a descending tone as it breaks station (`sfx.closing`, shared with the dash wind-up); and the integrity bar switching to **"IT IS COMING FOR THE CORE — MOVE"** in red — a line that names a movement answer, per the rule written above that string table.

**The Charger had three defects, not one.** The aim was rewritten every frame of the wind-up and froze only on commit — the same bug the Anomaly's dash had, so the line was never a commitment. The drawn line ran **40→100px** while the wind-up triggered at up to **330px**, under a third of the gap. And the trigger sat *outside its own reach* (dash ≈ 250px), so a Charger winding up at range spent its whole cycle on a lunge that stopped short — a telegraph that resolved into nothing. Two more surfaced only under measurement: locking a *direction* is insufficient, because the body keeps drifting while it winds, so the dash ran **parallel** to the lane and missed a stationary target by 2px (closest 30px against a 28px contact radius); and the dash ended on a **clock** that expired 30px before the drawn reticle. It now locks the **end point**, re-derives its heading from where it actually is, and ends on **distance covered**. Standing still is hit **8/8**; stepping off the lane, **0/8** at 126px clear.

**TTK held.** Same orbiting bot, before → after at 150px: emitter 15.2 → 15.8s, sentinel 13.7 → 11.5s, pulsar 11.2 → 12.8s. What changed is the danger — player HP lost per fight went 0 → 34 (emitter), 7 → 18 (sentinel), 0 → 26 (pulsar), and 29 → 60 for sentinel at 270px. Rings became a weapon and the Hunt became a real threat, without the fight getting shorter.

Verified: `node --check` clean on both files, no console errors, 240s survival + 120s Boss Rush with **no non-finite** values.

### Missiles and matter stop interacting entirely · core gravity for your own colour (2026-07-29)
Player brief: *"please have no interaction between dots and missiles"* · *"core gravity for same dots should be a little stronger."*

**The collision loop is gone, and it should stay gone.** A missile now passes straight through every Dot: it does not kill them, it is not stopped by them, and nothing is drawn when it crosses one. Missiles are aimed at you and answered by **moving**; matter is answered by **colour**. Two systems, one arena, no overlap.

This closes a bug that was never in the physics. **v1 annihilated** on a colour rule backwards twice over — a missile is `bossOpp(boss.color)`, the colour you *hold*, so it killed precisely the matter about to hurt you, invisibly, since missiles wear neutral livery. **v2 absorbed**, killed nothing, and was *measured* killing nothing (lance deaths **0 / 0 / 0** across the three kinds with nothing stripped from the arena) — and was still reported as annihilation, because a bolt vanishing on a Dot looks like the Dot did it. Two separate attempts at fixing the *effect* (a white spark; then a white shell hugging the blocker) did not shift that read. Matter a missile simply flies through cannot be misread. Verified: **28 sampled crossings, 28 survived (100%)**, travelling a median **70px past** the body twelve frames later, every Dot alive. Mine blasts went the same way — a blast that shoves the swarm around is still the Anomaly's fire reaching into the matter economy: **0 bodies kicked, 14 of 14 untouched** over a 30s Pulsar fight.

The cost was accepted knowingly and is written into the glossary: **Rings are no longer armour against the Anomaly's fire and a Neutral is no longer cover.** Nothing on the field blocks a missile; positioning is the whole defence. The Anomaly's *body* is the one remaining exception and it is not fire — it still consumes matter that actually chips it, or a flung body parked inside its skin would chip every frame. **'Skeet Shooter' has now outlived two rules** (missile pops your Gilded Bounty → Bounty blocks a missile) and lands on the surviving sense of the name: volley your Bounty into an Anomaly. Verified reachable.

**Core gravity.** Holding a pole exerted no claim at all on the matter it was meant to gather — the magnetic loop skips like-charge (ring-captured instead) and ring capture is gated on `d < fieldR`, so the two colours approached at rates **identical to the frame**: from 300 / 260 / 220px, same *and* opposite both entered the Field at **1.47 / 0.97 / 0.48s**. Like-charge now gets a gentle inward term outside the Field, full at the rim and fading to zero at 1.5× it: **1.23 / 0.73 / 0.35s**, 16–27% faster. Kept small next to a Drifter's own 0.22 seek — your colour should lean toward you, not be vacuumed. The hostile side is **unchanged** (1.47 / 0.97 / 0.48 — the Star never sucks in another charge) and the ring equilibrium inside is untouched (119.5px at 6.4 px/frame, as before).

**The Neutral wears both poles.** Player brief: *"make white dot like half-half color so we can easily understand 'this guy doesnt care about color'"*. It was a flat violet disc, which reads as *some third colour* — the wrong idea entirely, since the point of the body is that the colour law does not reach it. Now it draws as half red / half cyan down a turning seam (turning so it is never edge-on and lost in a crowd, the same trick the Splitter's seam uses). The old white marker ring at `0.62r` went with it: it sat straight across the seam and chopped the two halves into a thin outer band, carrying the "this is a Neutral" job that the split now does far better while actively obscuring it. A thin seam line replaces it, and the nucleus shrinks `0.34r → 0.24r` so the halves dominate. Mirrored in the bestiary.

Verified: `node --check` clean on both files, no console errors, 240s survival + 120s Boss Rush simulated with **no non-finite** values.

### The dash gets a real telegraph · the Fling starts firing · the Anomaly stops erasing matter (2026-07-29)
Player brief: *"anormaly dash is too unexpected, telegraph-dash timing is too fast."* · *"some of boss bullets (maybe burst 2 shots) can not pierce through dots. it anhilates"* · *"why is fling range too short?"*

**The dash's warning carried no information, which is a different bug from being short.** `tx,ty` were snapshotted when the wind-up **expired**, while the warning line was drawn to the player's **live** position — so the line tracked you for 0.5s and locked wherever you happened to be standing. Moving during the wind-up did nothing at all; the only dodge was to move *after* the lock, and the dash covers **63% of its run in 0.15s** and reaches contact in **0.17s**. A ~0.17s window on a warning you could not act on. The lane is now locked when the wind-up **begins**, the warning draws *that* lane, and the dash drives **150px past** the locked point so the threat is the lane rather than the dot — backing straight down it does not save you. Warning **0.5 → 1.3s**, warning-to-contact **0.69s → 1.42s**, plus a descending tone and a reticle collapsing onto the lock. Measured against a bot that steps perpendicular the moment the warning appears: **0 body hits dodging, hit every time standing still**, clearing 103–169px against a 59px contact radius.

**And the commit now throws three spears instead of one.** A move announced for 1.3s cannot also be answered by a single sidestep, so the punctuation covers the angles you might leave **by** rather than the point you were standing **on** — the hex burst's own logic, applied to the dash. Three at 0.20 rad apart. The one non-obvious part: a spear stays glued to the muzzle and **re-aims at you** for its 0.55s charge, so a naive fan collapses to a single angle before it launches; each spear carries its own offset (`aoff`) through that re-aim. Verified holding a constant **0.4 rad** spread across the full charge and launching on three distinct headings. Against the same off-the-lane bot: still **0 body hits**, but **14–29 HP** now comes off the dash and its fan, against **57** for standing in it. The render was also normalising against a stale `0.65` while the timer ran `0.5` — a leftover from an earlier nerf — so the warning opened at 23% lit and never reached full: it *appeared* rather than wound up.

**The Fling was unreachable code.** Ring capture is `d < P.fieldR` — the **whole 190px Field**, not a band near the ring radius — while the fling radius topped out at **170px**, and the fling loop skips anything ring-flagged. Every body the Fling existed for had already been claimed by the ring branch, which gave it a 3→8 px/frame nudge (**~107px**, then friction and seek pulled it home). Measured on a full-charge flip with 30 bodies around the core: **25 ringed, 0 flung.** The headline verb of the game's headline move was running at about a seventh of its own strength — and no amount of tuning the throw physics, which is what the two previous "fling further" passes did, could ever have reached it. Radius now `80 + charge·70 + rings·6` → **80–210px**, reaching just past the Field so the circle you can see is the promise; spent rings with no Anomaly to volley at take the **full fling**. Same test: **30 of 30 thrown.** By hold-charge — minimum hungry **442px peak / home at 3.6s**, three-quarters **558px / 5.0s**, full **706px / 6.9s**; Field swept in **0.17–0.27s** every time and *nothing lost* — every body comes back. `FLING_HOLD` 1.4 → **1.6** only (then solved back to **0.8s** in the speed pass recorded below); a first pass at 1.9 with a 0.99 friction put the entire arena off-screen for six seconds, which is not a reward, it is an empty sky. **The boss fight is untouched**: rings opposite the Anomaly → 20 volleyed / 0 flung; rings matching it → 20 flung / 0 volleyed / **0 damage**.

**The missiles were innocent, and two quieter erasers were not.** With ambient traffic and mutual annihilation stripped out — a pinned wall of 16 Dots against each kind for 40s — the Anomaly's fire killed **0, 0 and 0**. The first attempt at this measurement scored 18/26, 21/26 and 26/26 and was pure artefact: adjacent opposite-colour wall Dots annihilating each other, and ambient spawns crossing the wall. What *was* real: **the mine blast** deleted every non-matching body inside 104px, on the same backwards colour rule the direct-hit path had already abandoned — it now scatters them; and **the Anomaly's body** consumed any opposite-colour body that touched it *even when that body paid 0 damage*, quietly deleting the cover and ammunition you were about to use, so drift-in now bounces off. Consumption still applies to matter that actually chips it, where it must. The last of it was a lie told by a particle effect: an absorbed missile burst **7 particles in the blocker's own colour, on top of the blocker** — pixel-for-pixel what a Dot popping looks like. Hence a real report of annihilation that the code was measurably not doing. The bolt now dies white and the blocker flares to say it survived. The hidden achievement **Skeet Shooter** moved with the rule — it fired when an Anomaly missile popped your Gilded Bounty, which nothing can do any more, and now fires when your Bounty **blocks** one.

**Follow-up the same day — three reports, and the first one was a rendering bug wearing a logic bug's clothes.** *"boss shots should not remove dots, currently, it kills dots"* was checked a third time, now with **nothing stripped from the arena** (the earlier isolation deleted the Sentinel's swarmers each frame — it removed a candidate cause and then reported the cause absent, which is not a measurement). Attributing every wall death by what overlapped it the frame before: **lance 0, lance 0, lance 0** across the three kinds. The deaths were ambient opposite-colour traffic (7 / 10 / 3 per 40s), the Sentinel's swarmers (**1 of 20** — matter, not shots, so the colour law owns them), and the player's own Collapse. So the fix was the *feedback*, twice over: the original burst fired in the blocker's colour on top of the blocker, and the replacement — a white spark plus an **expanding coloured ring** — was no better, because an expanding ring in a body's own colour is exactly what a pop, a gild expiry and a mine blast draw. The blocker now takes a hard **white shell at its own radius** for 0.28s: a shape that says *still standing* instead of *gone*. 24 blocks fired cleanly in a 40s check.

**The Brute barges.** *"brute can't hit anomaly"* was a direct consequence of the drift-in bounce shipped hours earlier — the heaviest body in the sky visibly pinging off the Anomaly. Drift-in pays nothing for a good reason (**11.3** unaimed contacts per 45s fight with the player idle would otherwise be free DPS), but the measurement that set that price also answers this one: that traffic is **Drifters (28) and Darts (6)**, and across three fights the number of Brutes arriving under their own steam was **zero** — it is the slowest body on the field and it is gathered or annihilated long before it gets there. So a mass gate (≥2.0, which is the Brute and nothing else; the Bomber is next at 1.5) hands the Brute a role nothing else has at no cost: **6/6 consumed for 12 damage** driven into an Anomaly, while Drifters and Bombers still bounce for 0, and **0 ambient barges / 0 HP lost** across 5 idle fights.

**Fling speed ×1.5, reach untouched.** *"range is enough, but speed should be faster x1.5"* — impulse `7.2→12.0` became `10.8→18.0`, and the hold was **solved** back down rather than left to multiply the distance: throw distance is `v0·(1-0.985^N)/0.015`, so a 1.5× impulse needs that sum cut to two-thirds → `N ≈ 47` frames, `FLING_HOLD` 1.6 → **0.8s**. Launch speed **10.5 → 15.8 px/frame**, time-to-peak **1.7s → 0.96s**, and the landing spots hold: **441 / 508 / 689px** against 442 / 558 / 706 before.

Verified: `node --check` clean, no console errors, 300s and 240s simulated runs with **no non-finite** position or velocity anywhere.

### Corona removed · the Bomber becomes an ordinary Dot (2026-07-29)
Player brief: *"remove corona. bombers are all the same as other dots but just has critical impact dmg"*

**Corona was the roster's only passive effect, and it showed.** 6s, `1.1` hp/s to every opposite body inside the Field — nothing to aim, nothing to time, and (uniquely among the powerups) **no VFX of its own anywhere in 3,200 lines**. Five literal tokens removed; every HUD chip, pause chip, pickup toast and Codex row is generic over `POW`, so all of them followed for free, exactly as Cryo's removal recorded earlier today. Roster **6 → 4**.

**One judgement call, made against two of the four audit passes.** Corona's `hzn` term shared a single damage block with `cor`, driven by `P.decay` — which nothing writes. Two auditors read that as "the block is now unreachable, delete it and `decay:0` with it." **Kept instead, with only the Corona half removed.** `P.decay`'s status is byte-identical before and after (initialized, never assigned, read once), so this is *not* a new instance of the `P.blastR` bug; and GLOSSARY §11 documents it beside `P.congreg` and `P.arc`, whose blocks are **already** fully unreachable today. Shipping unreachable documented dormant blocks is this repo's deliberate pattern, not its bug — deleting it would have been unrequested demolition and would have falsified §11.

**The Bomber's specialness was six exemption guards and a 38-line payload, and one guard did all the work.** `if(e.type==='bomber') continue;` in the contact loop had two effects, not one: the Bomber never damaged you, *and* it never reached `queueKill`, so it phased through your core forever. Deleting that single line routes it down the ordinary path — same-colour pass-through, Aegis block, `e.dmg*P.armor`, i-frames, a streak break under its real species name, consumption. The other five exempted it from congregation, Singularity capture, ring capture, the graze band and Arc targeting; all five are gone. That also resolves a live contradiction: the Collapse-evolution well already had **no** bomber exemption, so the game's two black holes disagreed with each other.

**It was also the answer to "why does the Bomber run away from me?"** — logged the same day. Bombers were excluded from ring capture, but the repel branch only diverts like-charge that is *ring-eligible*, so a same-colour Bomber fell through to full-strength repulsion. Measured then: 150px → **190px** in 2s, while a same-colour Drifter was captured at 111px. Measured now: **ringed, 0 damage, holding orbit.**

**26, not 30.** The retired payload was 30, which looks like the natural migration and is wrong: `ETYPE` dmg is multiplied at spawn by `aDmg = 1+(act-1)*0.08` while the Anomaly's 34 is hardcoded and *not* scaled. A 30 Bomber reads **42 by Epoch VI — 24% above the boss**. 26 clears the Brute's 22 by 18%, is exactly a four-touch death from full at Epoch I, and stays under the boss through Epoch IV. `hp:1` deliberately untouched: the Bomber is now the game's only **fragile-lethal** — hardest hit in the sky, least durable body in it.

**Two achievements were in the blast radius.** `goldberg` ("Rube Goldberg") is **deleted** — its whole fantasy was a chain you *built* through a Bomber and no surviving mechanic can produce it, and `hid:true` meant an orphan would render forever as a `???` no player could resolve. `bomberPoint` **survives, re-pointed**: "Survive a point-blank Bomber" → "Take a Bomber's impact and live", granted in the contact branch (not the shield branch — a block should not count). Achievements 7 → 6, secrets 2 → 1. Also cleaned: `_cause='plow'` and `_cause='mine'` were left **write-only** once Goldberg's condition went, so both assignments were removed. `_cause` is now exactly one writer and one reader, both `'lance'`.

**The one thing deliberately preserved rather than deleted.** `pushText('-N')` inside the payload was **the only damage readout in the entire file**, and it sat in the block being cut. It has been moved onto the ordinary contact path, where a 26 Bomber and an 8 Dart now have to be told apart by the number alone. Same reasoning as the Neutral-damage fix recorded below: partial damage must never be silent.

**And one telegraph that would have become a lie.** The Bomber's dashed standoff ring at `1.55r` was a scale model of the 108px blast. With no blast it promises a danger radius that does not exist — and a player reading it as one holds station just outside it, which is *inside* the new contact-kill envelope. Deleted from the game and mirrored in the bestiary; the pulsing inner ring stays.

**Verified in-engine** (`node --check` proves nothing here — this ledger records a debug-seam ReferenceError that passed it). Zero console errors. `POW` reads `blackhole,aegis,overdrive,nova`; `FX` has three keys; `P.corona` is `undefined` and `P.decay` is still `0`. Bomber contact: **26 dealt, body consumed** (it never was before), vs. a Drifter's 10. Same-colour Bomber: **ringed, 0 damage**. Singularity: **captured and devoured** (`eh:1`). Aegis: **blocks it, 3 → 2 charges, 0 hp lost** — new, the payload used to pierce shields. Payload gone: a Bomber killed in a crowd beside the boss cost the boss **0**, its neighbours **0**, the player **0**. "Danger Close" grants on surviving the hit. Achievements: 6 rows, exactly 1 hidden.

**Two knock-ons worth watching.** Aegis is now **exception-free** — the payload was the only shield-piercing damage in the game, and `stepFX` re-pins `P.shield` every frame, so its 6s is absolute. And the drop bag going 5 → 4 types raises every surviving powerup's odds ~31% relative, which compounds it.

### Cryo removed (2026-07-29)
Player brief: *"let's remove cryo"*

**Cut whole, not disabled.** The orb, the near-freeze, the Mend, the Shatter cascade, the overheal-into-Capacitor, the frost ring and cold halo, and every flag that existed only to serve them. Powerup roster **6 → 5**; the Codex's powerup list, the HUD effect chips and the active-effect readout all render from `POW`, so they followed for free.

**Removed with it, because Cryo was their only writer:**
- `P.enemySlow` — the whole point of a global enemy time-scale was the freeze. Left behind it would have been initialized-to-1 and never assigned, which is precisely the `P.blastR` / `P.discharge` shape this ledger flagged twice on 2026-07-29. Its four consumers (`stepCharger`'s clamp and integration, the speed clamp, the position integration) now read at their true values.
- `ls` in `stepLances` — the ×0.4 missile slow, and the five `*ls` multiplies it fed.
- `fs` in the formation-flight branch — the freeze also held Walls and Nooses.

**The one comment kept.** The `L.life` tick carries a note that life is a **distance** budget, not a clock, and that any future time-scale multiplier must scale it too. That invariant was learned the hard way: Cryo shipped slowing `L.vx/L.vy` while ticking `L.life` at full speed, which drained it 2.5× too fast and fizzled missiles mid-flight (2026-07-28 regression). The mechanic is gone; the trap it taught is not.

**The honest consequence: there is now no healing that beats the lockout.** Integrity regenerates `2.6/s` only after **3.8s untouched**, and Cryo was the sole exception — the one thing that mended you with the arena still full. Disengaging is now the entire healing verb. That is a real difficulty increase and it is deliberate, but it is the number to watch: the 2026-07-28 rework existed *because* "cryo is still somewhat useless", and the answer chosen then was to make it the heal. Nothing inherited that role.

**Verified in-engine** (not just `node --check` — this ledger already records that syntax-checking this file does not prove it boots). Page loads with zero console errors; `POW` reads `blackhole/aegis/corona/overdrive/nova` and `FX` has four keys; a 600-tick run plays clean through spawns, a boss and a missile volley.

### Missiles absorb instead of annihilate (2026-07-29)
Player note: *"boss missiles not killing dots seems more constant i think?"*

**Correct, and the old rule was backwards twice over.** A missile killed the first body in its path whose colour did not match its own. But a missile is `bossOpp(boss.color)` — the colour you *hold* to erode that Anomaly — so it destroyed bodies of the **other** colour: precisely the matter that was about to hurt you. **The Anomaly's own fire had been clearing your threats for free.** It was also completely invisible, because missiles wear NEUTRAL livery by design (they hurt you whatever your polarity), so a white bolt vaporising some Dots and sailing through others had no readable cause.

**New rule: any body stops a missile, and no body is destroyed by one.** The missile is absorbed; the matter shrugs. This makes two things the docs already claimed actually true — **Rings are armour** (they now really do block the Anomaly's fire instead of letting it pass through) and a **Neutral is reusable cover** rather than a one-shot sandbag. Nothing about it depends on the missile's hidden colour any more, which is what the player meant by *consistent*.

**Verified:** 60 missiles fired into a frozen wall of 10 Dots (5 of each colour) → **all 10 survive**, both colours blocking equally. With a live field of 50-65 bodies, missiles still land **1.4-3.6 dps** by kind — cover absorbs roughly half the incoming fire without walling it off.

**It made the game harder, which is the tell that the diagnosis was right.** Removing a mechanic that was helping the player shows up as more deaths: **8K/7D → 7K/8D** orbiting at 270px, **11K/4D → 9K/6D** closing to 150px. Same bot, same 15 fights.


### The Fling · radial ring fire (2026-07-29)
Player brief, in two parts: *"why does dots pop when i hungry flip? hungry flip must fling away opposing dots, so i can be safe and hit boss. not poping"* — then, after it shipped: *"fling should not curve or have direction - just straight away, as it did in older times. it is too easy to kill anormaly now."*

**The first note caught a real bug, not a feel problem.** The Purge loop ran *before* the Volley loop and spared only bodies matching your **new** polarity — but Rings are the **old** colour, so they were killed and `queueKill`'d, and the Volley then skipped them as `queued`. Measured: **10 Rings gathered → 10 popped → 0 volleyed.** The boss-fight erosion path shipped the previous turn was barely firing; it only ever launched rings that happened to sit outside the burst radius. Same test after the change: **10 → 10 → boss dead.**

**The Purge is now the Fling.** A hungry flip throws hostile matter outward, alive, instead of annihilating it. Three gains: it stops eating your own ammunition; it retires the game's fifth "everything near me dies" effect (the crowding the glossary already blamed for Collapse having no identity); and **Bombers are now included** — the old rule spared them so a panic button could not cook one in your lap, but a fling detonates nothing, so this is the clean answer to a Bomber sitting on you. First attempt read as a nudge: 12 bodies thrown from 120px reached only 163px before their own seek (0.22/frame → ~12px/frame inward over the 0.9s window) cancelled a 10.6px/frame impulse and dragged them back onto the core. Seek is now **zero** while thrown — the second half of the brief, "no curve" — and the same test carries them **120px → 329px**.

**Ring fire went back to radial, and that fixed the difficulty.** Homing every gathered body onto the Anomaly made each one a guaranteed hit, so the fight collapsed into "hold a pole, press flip" and asked nothing about where you stood — measured at **10 kills / 2 deaths, median 18s, 2-4 volleys**, with the 45s destabilize unreachable. Rings now fire **straight away from the core** along the radius each already sat on (measured angular drift: **0.000°**). What connects is now set by the angle the Anomaly subtends: ~4.6% of the circle at 300px, ~9% at 150px, ~13% at 100px. **Closing the range is the only way to raise your hit rate, and it walks you into point-blank fire** — which is exactly the decision the boss fight was missing.

| | kills / deaths | volleys | median kill |
|---|---|---|---|
| homing (before) | 10 / 2 | 2-4 | 18s |
| radial, orbiting 270px | 8 / 7 | 1-19 | 33s |
| radial, closing to 150px | **11 / 4** | 1-17 | 28s |

**The Sentinel needed a second look.** At 0.55 rad/s it went **0-for-8** while the Emitter and Pulsar sat at 8-for-4 — a moving target is far harder to line a straight shot on, on top of seekers (the most punishing missile) and a swarmer trail that denies the 3.8s regen window. Its arena orbit is now **0.40 rad/s**: still the kind you must chase, no longer a wall. It is 0/5 at 270px but **2/3 once you close to 150px**, which is the right lesson rather than the right number.


### The boss bar was still ordering players to bait (2026-07-29)

A docs pass that turned up something worse than the docs. The Codex taught **"Bait its Flares through its own body to erode it"** — an interaction the code cannot produce since every missile moved to launching from the Anomaly's own body. But the same fiction was also sitting in `ANOM[].tip`, and **those strings render on the boss's integrity bar**, which makes them the most-read text in the fight:

- `'◆ EMITTER — BAIT ITS FLARES (BURST & STREAM) INTO IT'` → `'◆ EMITTER — CROSS ITS BURSTS · VOLLEY YOUR RINGS'`
- `'◆ PULSAR — WEAVE THE RINGS · BAIT ITS AIMED FLARE'` → `'◆ PULSAR — BE IN THE SEAM · LEAVE THE MINES'`
- Sentinel's (`CHASE IT · RUN DOWN ITS TRAIL`) was already a verb that still works.

**This is the second time these tips have outlived their mechanic** — the comment above them still records the first, when they read `REFLECT TO ERODE` after Reflect was removed. Twice is a pattern, so the roster now carries an explicit note that a tip must name something the code can produce, and that erosion is the Volley, the close reversal, a Bomber and Collapse — never a bait.

**Also stale, and bigger than the flagged line.** The Codex's **Mastery** section still said a charged reversal *"PURGES: every opposite-charge body inside the burst is annihilated where it stands"* — the flip became the **Fling** and now kills nothing. It taught the panic button as a kill button. Rewritten around what the Fling actually is (throws your own newly-hostile Rings off you, alive), plus the rule the old text got backwards: Rings are never flung, they are **volleyed**; Bombers now **are**.

**Corrected in this pass:** Codex — *The Anomaly* (rewritten to the real loop, the four ways in, silhouettes and the Hunt), *Mastery*, *Capacitor & Collapse* (15% is flat — herding matter onto the boss first buys nothing), *The Charge Law*; two achievement descriptions still saying "Flare"; the bestiary's boss card (volley was still documented at **2 dmg** — the reprice below made it 3 — plus the close reversal and the flat 15%); and a comment in `flip()` reading *"flipping does NOT damage the anomaly — bait its own lances into it instead"*, which sat **25 lines below the close-reversal branch that damages the boss on a charged flip**.

**Vestigial, found while checking:** `P.discharge` is initialized to `0` and never assigned, so `discharging` in `flip()` is permanently false and a charged reversal can never annihilate — the same dead-flag shape as `P.blastR` below.

### Collapse laundered its own kills into boss damage · erosion repriced (2026-07-29)
Player brief: *"dot contact damage to anormaly is too weak, and i feel like there is bug when collapse hits anormaly, sequencing damage(i think dot hit) is too strong"*

Both halves were the same wound seen from two sides, and the second one was a real defect against a contract this repo had already written down twice.

**The bug.** `processKills()` fires a chain-blast on every death, and during a Collapse (`unstable>0`) that blast is a blanket **78px / 3 damage** instead of the player's own `P.blastR`/`P.blastDmg`. Its boss branch chipped the Anomaly for the full `bd` per opposite-colour death inside the radius — **no per-wave dedupe**, and the actual defect: **`bd` never decayed.** The comment promises `0.7^gen` generational decay, but only `bR` is multiplied by it; the damage stays 3 at every hop. Since a Collapse kills the entire screen simultaneously, the wave's own kills came straight back as boss damage in a single frame. A second, smaller leak sat in the contact chip: `X.fdmg>0 ? 1 : (unstable>0 ? 2 : 0)` paid drift-in matter **2 for the 2.4s of a Collapse** — double a deliberate fling — three lines below a comment stating that drifting matter must pay nothing.

**Measured against an Epoch I Anomaly (18 HP, intended loss 3):**

| field around the boss | damage dealt | vs. intended |
|---|---|---|
| nothing | 3 | ✅ 1× |
| 12 Dots @ 68px (blast only) | 21 | 7× |
| 12 Dots @ 50px (contact + blast) | **33 — purged, one frame** | 11× |
| 24 Dots @ 50px | **95** | 32× |

That is not a boss chip, it is a delete key, and **what scaled it was ambient density — not a single decision the player made.** It also explains the first half of the brief on its own: the intended channel felt weak because it was never the thing killing bosses. `unstable` blasts now stop at the Anomaly's skin, and drift pays 0 always. A Collapse is **15%, flat**, at every density tested (0/12/24/40 Dots → 3 damage each time).

**Then the honest consequence: with the cascade gone the fight is much longer, so the deliberate channels had to carry it.** Volley **2→3**, fling **1→2** (now a named `FLING_DMG` beside `VOLLEY_DMG`, so this is one number to tune, not a literal buried in a collision loop). The ordering that gives the prices meaning is preserved — **aimed 3 > opportunistic 2 > drift 0**. Purge cost: **6 volleyed bodies at Epoch I, 11 at Epoch IV** (was 9 / 17). Verified per-contact after the change: volley 3, fling 2, drift 0, drift-during-Collapse 0.

**Wholly unrelated find, worth recording:** `P.blastR` is initialized to `0` at declaration and **never assigned anywhere in the file**. Outside a Collapse `bR` is therefore always 0, fails `bR>18`, and the chain never runs — so the entire blast system is Collapse-only, and the comment naming it "(Volatile / collapse)" refers to a keystone that no longer exists. Everything that branch did to a boss was Collapse damage; there was no legitimate case to preserve.

### Missiles · the Volley — the boss loop rebuilt (2026-07-29)
Player brief: *"instead of shooting some dots and enemies from boss, i would like to make missiles and evading more default for bosses. so you may dodge attacking patterns, scavenge same color dots, evade opposing color dots, shoot dots with hungry flip to hit anormally."*

**The old boss fight did not run on the game's weapon.** Erosion came from *baiting the Anomaly's own Flares through it* — they spawned off-screen at flat 3 damage, which is why they came from off-screen at all. Meanwhile the hungry flip, the thing the whole rest of the game is about, did nothing to a boss. The requested loop fixes that, and one change collapses most of the work: **every missile now launches from the Anomaly's own body**, so nothing can be walked back through it and the bait loop ends by construction rather than by decision.

**The colours already lined up — no new rules were needed.** A missile is `bossOpp(boss.color)`, which is the colour you want to *hold*, because your rings only chip the Anomaly if they are not its colour. So the ammo you gather and the fire you dodge are the same colour, and holding the useful pole never makes you safe (lances damage the core regardless of polarity). Better still, a missile is stopped by the first non-matching body in its path — i.e. by boss-coloured matter, which is exactly the matter that hurts you. **The stuff you are evading is also your cover.** All four steps of the brief fall out of rules that already existed.

**FIVE MISSILE KINDS**, per the "variety appropriate to evade" call — each with a different answer, so a fight asks more than one question: **volley** (a spread that leads your motion → cross it), **seeker** (turns onto you 0.85s then commits → run, don't juke: turn radius `v/ω` = 60px so it out-turns you, but 3.3px/frame cannot out-run a Star doing 6.2), **ring** (expanding wall of 13 with one seam → be in the seam), **mine** (lobbed onto the ground around *you*, arms, draws its exact blast → leave), **spear** (telegraphs a line and tracks you along it, then fires → leave the line).

**THE VOLLEY.** With an Anomaly alive, a hungry flip stops merely scattering your rings: every gathered body that is not its colour is launched at it at 7.2px/frame, guided 1.6s, then ballistic — 2 damage each. This is the direct answer to the failure recorded in `flip()`, where firing rings radially "exported" them off-screen and paid nothing: **aimed at something, the same act becomes the reason you were hoarding matter.** The purge is untouched and still owns the panic-button role.

**Two things measurement caught that reading the code would not have:**
- **Ambient matter was killing the boss for free.** With the pre-existing 1-per-contact chip, drifting Dots alone took an Epoch I Anomaly from 18 to 12 HP in 15 seconds *while the player stood still* — a third of the boss, unearned. Plain contact now pays **0**; only matter you deliberately volleyed erodes it. Verified after: 15s of standing still, zero damage.
- **The hex burst was decorative.** It fired at a free-running `hexRot`, never aimed — a fact hidden by the old system, where those same shots came from off-screen *aimed at your position*. Measured 1.8 dps **and dodging made no difference**, which is the signature of a pattern pointed at nothing. Anchoring one spoke with `leadAngle` took it to 3.2 dps naive / 2.1 dodging — dodging finally pays 34%. Mines had the same disease from the other end: dropped around the *boss* they armed 270px from anyone and did 12 damage across a 40s fight; lobbed at the ground around the player (speed solved from the arming decay, `travel ≈ 26.3·sp`) they now land where you actually are.

**Balance, measured across 12 bot fights** (crude bot: orbits at a fixed radius, evades only inside 150px, never purges defensively, never picks up a powerup — a floor, not a verdict): **Pulsar 4K/0D · Emitter 3K/1D · Sentinel 1K/3D**, 8 kills / 4 deaths, fights running 18–33s against a 45s destabilize. The Sentinel started **0-for-4** while the others went 4-for-4; the diagnosis was not damage (112 dmg/25s vs the Emitter's 110/31s — nearly identical) but **rhythm**: seekers plus swarmers plus its orbit meant you never got 3.8s untouched, so Integrity regen never started once. Its trail now leans 62% toward your ammo colour, matching what ambient spawn already does during a boss — half threat, half volley ammo, and a better read besides: chasing it through its own trail should feed you.

**Still needs human confirmation.** Everything above is bot-derived, and the ROADMAP already records why that has limits (the 2026-07-2x Monte-Carlo hard-countered two kinds and read them at 0% regardless). The Sentinel remains the hardest of the three by a clear margin, and the mine/panic interaction — fleeing the nearest mine walks you into the next one — is either good design or a trap, which only real hands can settle.

### Anomaly silhouettes · The Hunt (2026-07-29)
Player brief: *"each anomaly should have different model, so we can identify by sight. also, i think some anomaly should chase core sometimes."*

**Every Anomaly rendered as the same object.** One glowing disc, one white pip, one integrity ring — the only per-kind difference was a *telegraph overlay*, which by definition only appears once the thing is already attacking. So you picked your position before you knew which fight you were in. Each kind now has a body whose shape **is** its mechanic:
- **EMITTER** — a faceted **hexagon** that turns on `hexRot`, the same value that aims its crossfire, so the shell you watch rotating is literally the volley it is about to throw. Six muzzle nodes on the vertices, counter-rotating inner hex.
- **SENTINEL** — a hollow **ring** with two opposed pincer wings sitting on its firing axis. Never solid: it reads as something on an orbit, which is what it is.
- **PULSAR** — a dense core inside a crown of **rays** that lengthen with `novaCharge`. The one kind you cannot bait announces itself with its own outline.

**The bug that ate the first attempt.** The shapes drew, but every overlap came back pure white — sampled `(255,255,255)` at the wing angles where red-over-cyan should give `(235,79,123)`. Cause: `drawScene` sets `globalCompositeOperation='lighter'` for the whole particle/enemy/boss pass, and additively `255+56, 63+224, 108+255` all clamp to 255. The old single-disc body survived that because one fill has nothing to blow out against; **layered** silhouettes lose exactly the colour contrast they exist to carry. `bossBody()` is now wrapped in `save()` + `source-over`, with the additive halo still drawn above it for glow. Worth remembering as a general rule for this renderer: anything with internal colour structure must opt out of the additive pass.

**THE HUNT.** Left alone an Anomaly parked on its station for the whole fight, which made the arena a shooting gallery — find a comfortable spot, stay in it. Every ~9–14s it now leaves station and comes for you for 3–4s, trailing echo rings off its back edge. Deliberately a **walk, not a dash**: the Emitter's lunge is the one committed unavoidable thing and there should only be one of those. It stops at `b.r+P.r+58`, because the Anomaly's touch is 34 damage and it is *never consumed* — a boss that could park on your skin would be an unanswerable hit rather than a threat. The **Sentinel** expresses the hunt in its own grammar: instead of advancing, it re-centres its orbit on **your core** and tightens from 250→150px, so the kind whose identity is "you chase it" starts circling you. Guards: a hunt never *starts* mid-dash or mid-charge (both are commitments already read and answered), an in-progress hunt carries through one (a Pulsar closing while it winds up is the point), and the Emitter will not schedule a lunge while hunting — a dash from 117px is an unreadable hit, not a telegraph.

**Verified in-engine.** All three kinds hunt twice per 60s fight; closest approach 110–117px against a **contact distance of 59px**, so it crowds without ever touching. Silhouettes confirmed by pixel-sampling the live canvas, not by eye: the Sentinel's wing arcs read as true opposite-colour after the composite fix. Bestiary portraits now draw the **same** shapes via a mirrored `anomBody()` — the whole point of the cards is that you can name the Anomaly on sight, which fails if the card and the game disagree. The wide "The Anomaly" card draws the Emitter deliberately: there is no generic body any more, and the first Anomaly of every run is always the Emitter.

**Doc drift caught in passing:** GLOSSARY still documented **Deflect** and **Reflect** as live player verbs, plus Reflect as a Capacitor source, as the Pulsar's counter and in a floating-text example. Both were removed from `flip()` earlier the same day (the reflect window measured a flat 4 frames / 66.7ms — shorter than human reaction time and 4.25× shorter than the 280ms flip cooldown gating it). Removed from §2, §3, §7 and §10.

### Patterns 4→2 · Anomalies 5→3 · bestiary (2026-07-29)
Player brief: *"each pattern should not resolve by itself"* → *"fix the bestiary, and review anomalies and merge pattern/boss of similar ones."*

**Every one of the four formations was already solved by standing still or pressing one key.** Measured, not guessed:
- **The Gate** — slots sat 66.7px apart against a **26px** contact radius (core `r15` + drift `r11`). The midpoint between *any* two adjacent bodies is 33px from both, i.e. outside contact. You could walk through the wall anywhere; the "one gap" was decorative. Worse, at that spacing you were only ever in range of *one* body, so matching its colour also cleared it — and paid you ring ammo for it.
- **The Vice** — the comment claimed *"whichever pole you pick, one side will kill you."* False. Both walls were **solid single colours**, and same-colour matter passes through the core (the like-charge `continue` in the contact loop). Go red, sit in the left half: the red wall sweeps through you as free ammo and the cyan wall's travel ends at x≈537, never reaching you. It was a gift.
- **The Noose** — the only one that worked. It overshoots the centre (823px travelled vs a 794px radius) and its arc spacing falls under contact in the last stretch, so it genuinely shuts.
- **The Comb** — worst of the four: 178px of clear channel against a 30px core, and each lane a single colour.

**Root causes, all three now rules in code:** (1) spacing must be **under 52px** = 2× contact radius, else every pair has a walkable midpoint; (2) colour must alternate **every body**, because block-of-two granularity is coarser than the player's own 30px footprint so you only ever met one colour at a time; (3) a shape must not **end on a timer alone**.

**Merged 4 shapes → 2 ideas.** Gate and Comb were the same object at two densities → **THE WALL**: `N=ceil(span/44)+1` bodies (29 on a 1280-wide march), per-body alternation, one gap whose flanking bodies slide inward so **the door shuts as it advances**, then the whole line **turns around** for a return pass. Vice was a Noose flattened onto one axis → folded into **THE NOOSE**, which now also **rotates its seam** as it closes. That needed a new **polar flight mode** (`holdOrbit`, `e.orb`): a constant-velocity tangent travels a straight line and would miss the centre by `R·sin(atan(va/vr))`, so the ring would never shut.

**Merged 5 Anomalies → 3.** Four of the five fired the same off-screen aimed Flares from the same hover and differed only by a bolted-on gimmick. **Lunger was the Emitter plus a dash** → the Emitter now lunges from **Epoch III**, so the boss you learned first grows up instead of being replaced by a near-copy. **Seeder was the Sentinel's pincers from a standstill plus a pile of adds** → the Sentinel now sheds swarmers *while orbiting*, so its path writes a **trail** you have to run down; movement and adds finally reinforce each other. **Pulsar** stands alone as the only kind firing from its own body — it cannot be baited through itself, which is why it exists and why it carries 25% less HP. Nothing was cut: each surviving kind owns a distinct weapon **and** a distinct verb — bait · chase · dodge. *(Written as "reflect" originally; corrected the same day when Reflect was removed from `flip()` for being unreachable as a skill.)*

**Verified in-engine.** Wall: 42.7px spacing across all 27 inter-body gaps, **zero walkable midpoints**, longest same-colour run **1**, door 128→85.3px over the traverse, direction flips at 7.87s, and a stationary core took exactly 10 dmg (one Drifter) as it swept past. Noose: 20 bodies, ring 742→94→closed, body spacing 212→27px, seam rotated 0.70 rad. Bosses: Epoch I Emitter does **not** lunge, Epoch III Emitter telegraphs **and** dashes, Sentinel travelled 590px while adding 15 bodies, and 80 draws yielded exactly `emitter/sentinel/pulsar`.

**Caught before it shipped:** the debug seam still exported `formGate/formVice/formComb`, which is a **load-time `ReferenceError`** — `node --check` passes it because it's a reference error, not a syntax error. Worth remembering: syntax-checking this file does not prove it boots.

**Bestiary fixed.** It had no Patterns section at all — the shapes were entirely undocumented. Added one with live schematics for both (the Wall's closing door, the Noose's rotating seam). Cut the dead `s.key==='spiral'` branch in `drawAnomMini` (no anomaly has had that key since the Emitter/Spiral merge). Anomaly cards 5→3, each labelled with its verb; the Sentinel portrait now draws its swarmer trail. Boss card corrected: "five KINDS" → three, and it now states the +30 HP / +40% charge on purge.

### The Purge · Deflect + Reflect removed · Neutral pops (2026-07-29)
Player brief: *"i don't need reflect or deflect. we only need hungry flip to purge other color instantly for safety. also, hungry flip power is kinda strong that flies everything out of screen."* Plus, mid-work: *"i cant kill white orb by flip."*

**Deflect and Reflect are gone.** Both were fully implemented and both worked — but neither was reachable as a skill, and the measurements are why:

| | |
|---|---|
| Reflect window (measured, 19 consecutive samples) | **4 frames — no variance** |
| …in milliseconds | **66.7 ms** |
| Flip cooldown gating it (`P.flipCd`) | 280 ms — **4.25× the window** |
| Typical human visual reaction | ~200–250 ms |

The geometry forced it: capture at `P.r+L.r+30` = 54px, strike at `L.r+P.r` = 24px, lance speed 7.4px/frame → 30px of approach → 4.05 frames, every single time. You could not react to a Flare, only pre-commit and get lucky. Deflect had the opposite problem: it fired constantly but its only feedback was a white ring (`P.r+16+defl*5`) and `sfx.deflect` — both already owned by the ring discharge (`P.r+14+fired*3`, same sound, same frame). A parry was indistinguishable from an ordinary charged flip. Removed both, plus `reflN`, the now-unobtainable `reflector` achievement, and every dead `L.refl` branch.

**The hungry flip is now a PURGE.** Hold a pole to load, reverse, and every body that is opposite-charge *after the flip resolves* and inside the burst is annihilated in one frame. The reference frame is the point: a tap already makes the swarm harmless, since matching its colour is what safety means here — what makes reversing dangerous under pressure is that **your own Rings turn hostile the instant you flip**, in close orbit. The Purge deletes exactly those.

- Radius `64 + charge·56 + min(rings,10)·5` → **64→170px**, always inside your own Field (190). Charge sets the floor; gathered matter sets the ceiling, so Rings pay twice — armour in, reach out.
- Damage `2`: 1hp bodies die, a Brute walks out at 1hp. **Bombers** are never purged (a safety valve must not cook one in your lap) and **Neutrals** are ignored (uncharged is not "the other colour").

**The fling nerf.** The old discharge pushed ring matter at `8+chg*24` (8→32 px/frame); under the 0.985 flung-friction that carries a body **~900px — clean off a 1280px screen**, so every hungry flip exported the ammo you had just spent a hold gathering. Now `3+chg*5` (3→8), netting ~25px. **Measured: 0 bodies left the screen in any trial.** With a real ring loaded the burst consumes the rings outright, so the scatter only applies to stragglers outside the radius.

**"I can't kill the white orb."** A real bug. Neutral has `hp:2` and the Shockwave did `1.2` — so it needed **two** pulses, while the pulse only fires every 0.5s however fast you flip, and a half-killed Neutral is drawn identically to a fresh one. The first hit was invisible, so the body read as immune. Both the Codex and the Bestiary have always said "pop it with a reversal", singular. Now that is true: `NEUTRAL_POP=2`, and a survivor sparks so partial damage can never be silent again.

**Pulsar survived the cut.** It was the "reflect boss" (`tip:'REFLECT TO ERODE'`, 25% less HP to pay for it), so removing Reflect looked like it would leave an unkillable Anomaly. It doesn't: line 980 already fires a sparse *aimed* Flare from off-screen every ~2.7s, commented "keeps bait-through alive". That is now its erosion window and the HP discount pays for how rarely it opens. Tip rewritten to `BAIT ITS AIMED FLARE`. Verified by killing one in a 167s automated run.

**Also corrected while in there:** the Codex still described **Lunger** and **Seeder** as separate Anomaly kinds — they were absorbed into the Emitter long ago. Rewritten to the actual three.

### Splitter silhouette · Bomber card corrected (2026-07-29)
Player brief: *"splitter need unique UI, and bomber description needs change."*

**Splitter had no visual identity at all.** It fell through every `else if` in `drawEnemies()` and rendered as a plain circle — identical to a Drifter but for 3px of radius (r14 vs r11) — while popping one *adds two bodies to the field*. The single decision it asks of you ("pop now, or reposition first?") had zero signal.

Now drawn as a **binary**: two overlapping lobes with two white nuclei, on a slowly turning seam (so it is never edge-on and lost) that breathes as if the shell can barely hold. Every other body is one circle with one centre dot, so *"this one multiplies"* reads off the silhouette before you know its name. Silhouette was the only channel available — enemies draw under `'lighter'` (the additive pass set in `render()`) so a dark fracture line adds nothing and is invisible, and rings stacked *outside* the body (Bomber, Charger) are legible one at a time but smear together in a crowd. Lobe radius 0.72 at offset 0.30 holds the drawn extent at ~1.02r, so the shape never lies about the r14 hitbox. Mirrored in `bestiary.html`.

**Bomber's card stated a number that cannot happen.** It listed `12 dmg`, but `drawEnemies`' contact path `continue`d on bombers *before* the `e.dmg` read (since deleted) — so contact damage is dead data for this species. Meta line is now `0 on contact · 30 blast`.

The tag also omitted both rules that matter: the **108px** blast radius, and that the payload **shatters your shield outright, Aegis included**, at any range inside the blast (`P.shield=0` runs regardless of i-frames). Rewritten to state both, plus the two upsides already true in code — it is a herdable grenade that damages every body in range and chips the Anomaly, and a Collapse vaporizes it harmlessly. GLOSSARY §5 already had these facts right; the bestiary was the stale copy, and the two are now in agreement. Splitter tag updated to match its new look, and "several Minis" corrected to **exactly 2**.

**Noted, not done:** `mini` is also a plain circle, near-identical to a Dart (r7 vs r8), so the fragments still don't read as *belonging to* the Splitter that made them.

### Singularity · The Strain (2026-07-29)
Player brief: *"singularity must have 'oh, this is gonna end soon' moment… crowd is coming back."*

**The bug underneath the request.** `stepFX` pinned `ehT=EH_MAX` for the whole 5 s, and every visual in `drawEHorizon()` derives from `grip=ehT/EH_MAX` — so grip was `1.0` on every frame, the black hole rendered **byte-identical** for 5 seconds, then vanished in one frame. `drawEHorizon` even guards `if(ehT<=0.05) return;` — a fade that the pin made unreachable. Audit finding worth keeping: **no timed effect in this game has any ending cue at all**; every one of the ~11 `FX` read sites is a binary `>0`. Singularity was the fifth instance, and the worst-consequence one.

**The threat was mis-identified at first.** The parting fling looks like the danger but isn't — captives sit at ≥32 px, contact radius is only 23–30 px (`P.r=15`), and they're pushed *outward*. The real cost is `if(e.eh && P.ehorizon)continue;` — **while the well is open you are immune to everything it holds**, and that immunity died in the same frame as the visual.

**What shipped.** A separate `ehStrain` (0→1 over the last `EH_CLOSE=2.0` s) read *only* by the renderer, the captives' shudder and a one-shot audio latch:
- Rim pulse **1.75 → 3.5 Hz**, amplitude doubled; radius/colour/width untouched. This is the game's own urgency grammar — Gilded Bounty steps 7→14 rad/s for its last 2 s, an expiring orb blinks for its last 2 s, and both express it as *tempo only*. 3.5 Hz lands exactly on the Lunger's telegraph rung.
- Captives shudder at 5.4 Hz (per-body phase) and the swirl whips 46→176 px/s — the cue rides **the hoard**, which is what's about to be standing on you. `reduceMotion`-gated.
- New `sfx.closing()` — falling octave-paired drone, deliberately the mirror of `inhale()`'s 55→220 / 200→1800. Latched like `chargeFull` because `step()` can run 5× per frame.
- `sfx.deflect(2)` on expiry **replaced** with `sfx.release()`. `deflect` is the game's *rising* "nice block" chirp — a reward sound on the one moment that takes your armour away. Kick and ring size now scale with hoard size.

**The trap that shaped the design.** Telegraphing by shrinking the well is the intuitive fix and it's self-defeating: `else if(e.eh) e.eh=0` releases a body the moment it leaves `reach`, so a contracting well leaks the hoard out early at zero velocity and `blackholeCollapse()` finds nothing to fling. Grip therefore stays pinned at full — only the *appearance* of coping degrades. Bonus: holding `reach` at 230 preserves its exact coincidence with the hardcoded `230` in the charger-suppression test, which a wind-down would have split into a widening dead annulus.

**Measured:** strain ramps exactly `1 − t/2.0` (0.25/0.75/0.96 at t=1.5/0.5/0.08). Held count holds **steady through the whole telegraph** instead of draining; a packed field went **46 held → 40 flung in one frame** at ~10.6 px/frame. Re-grabbing the orb mid-strain resets and re-arms (0.41 → 0 → 0.42). A sub-window `grant(0.8)` starts already straining, no NaN. No console errors; `node --check` clean.

### Glossary rewrite (2026-07-28)
- **GLOSSARY.md rewritten from scratch.** It was describing a game that no longer exists — Offer, level-ups, augments, keystones, Specials, Arsenal, shards, XP, rarity and cards were all still documented behind a single "predates the fork" note, and the boss section still said "HEX / SPIRAL". Deleted all of it and wrote the current game: rings-as-ammo, the powerup roster with Cryo's mend numbers, the five Anomaly kinds, Formations, Boss Rush, the silent-world rule, and the Core Fault screen. Added **§11 Dormant mechanics** — the 16 implemented-but-switched-off flags (`congreg`, `arc`, `sats`, `ferro`, `pulse`, `aftershock`, `rupture`, `afterimage`, `vamp`, `decay`…), each ~1 line to wake, as the standing shortlist for future work.

### Reverted: Collapse "flip mid-breath to invert" (2026-07-28)
Built and then **reverted at the player's call** — *"there is a better one, creative, even different feature."* The diagnosis stands and is worth keeping: **Collapse is the game's fourth "everything near me dies" button**, the most-earned action has the least identity, and its 0.45s inhale is a dead pause. The attempted fix (flip during the breath to swap the outward crush for the dormant `P.singularity` implosion) was a *variant*, not a new idea — same fantasy, two flavours. Fully reverted: `collapseInvert` state, the `flip()` arming block, the detonate condition, the breath ring, the inhale drag, the control hint and the Codex paragraph. `P.singularity` is dormant again (§11 of the glossary).
- **Lesson recorded for the retry:** a measurement I reported was wrong. I claimed the added inhale-drag "pulls the crowd 92px"; re-measuring after the revert showed ~89px with the code *removed* — that was enemies walking toward you at normal speed over 0.45s. The drag was doing almost nothing. Isolate the effect from baseline motion before quoting a number.

### Silent world · formation waves (2026-07-28)
- **The centre banner is gone — all of it.** Player call: *"this events are not necessary, player might just feel it."* Right: a storm already **looks** like a storm, and a word across the middle of the screen pulled the eyes off the field at exactly the moment they needed to be on it. Removed all 13 call sites (epoch, calm, storm, storm-shift, anomaly arrival, anomaly-fled, Boss Rush, Collapse, Singularity, collapse-count, streak tiers) plus the `banner()` function, its DOM node, its CSS, and the now-dead `ANOM.banner` fields. Every one of those beats still lands as matter, colour, ring, shake, hitstop and sound — and the streak tier already pushed a `STREAK 25 · ⚡+8%` floater at the core, so the banner was pure duplication. **Two channels remain**: the powerup pickup pill (kept — a powerup's *effect* is the one thing you genuinely can't read off the screen) and the gold achievement toast.
- **Reverted the storm advice line, which was wrong.** The previous entry shipped *"be CYAN to annihilate it"* on a red storm. Player caught it: **being CYAN does not help.** Verified against `flip()` — same-colour matter is **caught into your rings** as ammo, holding a pole **loads** it, and a charged flip **fires** it outward (`red meets cyan → both annihilate`). So in a red flood, RED shelters *and* loads your rings *and* feeds the actual kill engine; CYAN just means opposite matter is attracted to your core and you take contact damage with nothing around to load. The old line described attrition as if it were a strategy — misleading advice is worse than none. All sub-lines removed with the banners.
- **FORMATIONS — waves that look designed.** Player ask: *"sometimes make some irregular pattern waves (like tilt to live) to make player say WTF?"* Ambient spawn is edge-random, so after a few minutes the field reads as drizzle — threatening, never surprising. Added four hand-placed shapes that fly in from off-screen (self-telegraphing, no text): **THE GATE** (a wall marches across, one gap to thread), **THE VICE** (two walls close from opposite sides, one red one cyan — whichever pole you pick, one side kills you), **THE NOOSE** (a ring contracts on where you were standing, one seam to run for), **THE COMB** (alternating bands sweep across with channels between).
  - **The key design constraint, found by reading the contact rules**: same-colour matter passes through your core harmlessly, so a *single-colour* formation is defused by flipping to match it — no decision, no threat. Every formation is therefore **mixed colour**, so no polarity is safe and you have to **move**, which is the one thing the rest of the game rarely forces.
  - New `hold`/`fvx`/`fvy` formation-flight mode: a held body flies its assigned vector and ignores seek *and* the polarity field, otherwise every shape converges on the core and dissolves into the same blob formations exist to break. When `hold` lapses the shape falls apart and survivors hunt normally — it reads as a wave that *breaks*. Cryo freezes formations too. `spawnEnemy` now returns the body so formations can place it.
  - Cadence: first at ~60s, then every 30–46s, paused during a boss, skipped above 230 bodies. Verified: all four shapes spawn mixed-colour and hold 100% of formation through flight; a full 267s run fired them at 60s / 148s / 209s.
- Verified: 267s run to Epoch IV (145k score, no NaN), all five powerups grant and expire, all five Anomalies still move and fire, banner element confirmed absent, `node --check` clean, zero console errors.

### Cryo → the healing moment · three separate feedback channels (2026-07-28)
- **Cryo is now the heal.** Player report: *"cryo is still somewhat useless."* Correct — freezing the field just made things passive, and the shatter chain was offence the player already had. The freeze is now the *setup*, not the payoff: while the field is frozen the **core mends**, and crucially the mend **ignores the out-of-combat regen lockout** (`hurtT>3.8`). That is the whole point — it is the only healing in the game that works while the arena is still full and still shooting at you. Measured: under constant fire, normal regen recovers **0 hp**; Cryo recovers **+44** over its 5.5s. Carving the frozen crowd **accelerates** it (+1.5/body, capped +20 → **+64** total when you actively carve), so the shatter chain now feeds the heal instead of being a separate toy. At full HP the cold **banks as Capacitor charge** (+0.26 of a Collapse) rather than evaporating, so the pickup is never dead weight. New: `mendCore()`, `CRYO_MEND`/`CRYO_SHATTER_MEND`/`CRYO_SHATTER_CAP`, `cryoBank`, batched `+N MEND` floaters, and a breathing cold halo + inward frost motes at the core so the heal is something you *see* happening to your star.
- **Powerups and phase changes no longer look identical.** Player report: *"phase changing dialogue and powerups are not different, making me confused."* Root cause: `banner()` was the single channel for *everything* — a `❄ CRYO` pickup rendered at the same place, size and animation as `EPOCH II · EMBER` and `◈ RED STORM ◈`; only the colour differed. Split into three: **centre banner = the world changed**, **left pill = you gained something** (flies in and lands on the powerup chip column it belongs to), **gold top toast = a feat** (already distinct). `collectOrb` now calls `pickupToast()`, never `banner()`.
- **Phase banners now say what they MEAN.** Player report: *"phase changing dialogues are not understandable easily."* `banner()` takes a plain-language `sub` line, and every world event carries one. The storm was the worst offender — `◈ RED STORM ◈` names a colour but hides the actual decision, so it now reads *"a flood of RED — be RED to shelter it, be CYAN to annihilate it."* **Advice verified empirically before shipping it**: during a red flood, a red core takes 0 damage on contact, a cyan core takes damage (and annihilates). Also rewrote the cryptic `· breathe ·` → **CALM** *"the field thins — your core mends if you stay untouched"*, plus subs for Epoch, storm-shift, Anomaly arrival, anomaly-fled and streak tiers. Verified through a real director run: all six banners fire with correct sub text.
- Verified end to end: 116s immortal run (no NaN in hp/charge, 28.5k score, Epoch II), all five timed powerups grant and expire cleanly, all five Anomaly kinds still fire and move, `node --check` clean, zero console errors.

### Production-readiness hardening — ship blockers, resilience, two merge regressions (2026-07-27)
A 6-lens audit (correctness / performance / persistence / platform / polish / post-merge consistency) with every
finding adversarially re-checked against the code. 8 confirmed; fixed all but the touch rework, which is parked
pending the launch-environment decision. Folder also renamed `pulsar/` → `orbital-crash/`; added [README.md](README.md).
- **BLOCKER — blocked storage killed the whole game.** `const LS=window.localStorage` ran at top level, and merely *touching* that property throws `SecurityError` when site data is blocked (incognito, "block all cookies", sandboxed/cross-origin iframes — i.e. how every game portal embeds you). The throw aborted the entire script: dead canvas, dead buttons, no message. Now a try/catch shim falls back to an in-memory store, and `save()` is guarded (Safari private mode throws on *write* even when reads work). **Verified in a real `sandbox="allow-scripts"` opaque-origin iframe**: raw storage reports `THROWS: SecurityError` while the shim round-trips — and the game boots to a full playable menu in that same sandbox.
- **Corrupt save no longer bricks boot.** `JSON.parse(LS.getItem('orbitalcrash_achv'))` was unguarded and nothing ever cleared the bad key, so one corrupt write meant *every* reload threw — unrecoverable without manually clearing site data. Added `list()` (Array-checked, catch→`[]`) and `num()` (`Number.isFinite`, so a junk best degrades to 0 instead of NaN). Verified: with `'{{{NOT JSON'` and `'not-a-number'` stored, the game boots clean at best 0 / 0 achievements.
- **One bad frame no longer freezes the game forever.** `frame()` re-scheduled rAF only at the very end, so a single uncaught throw anywhere in the per-frame path broke the chain permanently — frozen canvas, ambient still humming, no message, and no `window.onerror` anywhere. Split into `frameBody()` + a `frame()` wrapper that **drops** a bad frame and keeps looping, with a circuit breaker at 8 consecutive faults → a self-contained `◆ CORE FAULT ◆` overlay (suspends audio, shows the error, RELOAD button). Verified by injecting a fault into a hot global: survived 4+ faults still running (old code died at #1), halted with the overlay at exactly 8, best score preserved.
- **Cryo fizzled reflected Flares** — a regression from the 2026-07-21 rework. `stepLances` slowed Flare *movement* ×0.4 but ticked `L.life` at full speed; life is a distance budget, so it drained 2.5× too fast. Fixed to `L.life -= dt*ls`. Honest scope, measured: a *fresh* Flare's budget is ~2.5× its crossing time, which nearly cancels the slow — those died at ~100% of path, at the far edge (the audit's "~40% of path" over-stated this case). The real casualty was **reflected** Flares, whose life resets to a flat 3s: those died at ~40% of the return trip, silently disabling "reflect to erode" — the advertised boss counter — whenever Cryo was up. Verified: with Cryo a Flare now covers the full 915px and exits, taking 309 ticks vs 124 (the ×0.4 slow, intact).
- **Boss Rush no longer farms the survival best.** `die()` wrote `store.best` with no `testMode` guard (Gilded Bounty was already `!testMode`-gated — this one was missed), so one practice death could overwrite the real best from an endless boss supply. Verified: 2,010 earned in Boss Rush left best at 10 and the "New Best!" banner hidden, while a normal run still records and persists (2,732).
- **Emitter opened with the wrong pattern** — the other merge regression. `emitMode:false` + toggle-*before*-branch meant the merged Emitter's first volley was always the hard-to-read spiral stream, contradicting the design comment that the first Anomaly always teaches the clean bait loop. Seeded `emitMode:true`. Verified: volley pattern is now `6,1,1,1,1,1,1,1` — the teaching hex burst first, then the stream.
- **Parked:** touch controls. Every touch-down calls `flip()` (steering requires a finger down, so every re-grip reverses polarity — and since `holdT` accrues by *time*, any re-grip after 0.75s also discharges the ring). Android long-press additionally synthesizes `contextmenu` → unintended Collapse. Fix is either a real touch scheme (drag = steer, quick tap = flip, primary-pointer guard) or an honest desktop-only gate — **pending the launch-environment call**.
- Clean bill from the audit, worth recording: audio unlock is correct (context built only on user gesture, `webkitAudioContext` fallback, suspend-on-hide, silent degrade), retina/DPR scaling is right, resize/orientation handled, pause fully implemented, zero `console.log` noise, no fetches/fonts/CDNs — fully self-contained and offline-safe. Perf findings all self-rated non-blocking. `node --check` clean; all five Anomaly kinds re-verified firing and moving after the changes.

### ORBITAL CRASH — Cryo rework · Boss Rush dots · Emitter/Spiral merge (2026-07-21)
Three player-driven fixes:
- **Cryo was useless** ("slowed enemies = nothing to annihilate"). Reworked from a mild 0.34 slow into a real tool: the field **near-freezes** (`enemySlow` 0.34→**0.14**), the Anomaly's **Flares slow too** (×0.4 in `stepLances` — you can weave a Flare storm in slow-mo, which the old Cryo couldn't help with at all), and **every annihilation SHATTERS** — a one-hop ~74px chain-pop (`onKill`, guarded by `_cause!=='shatter'` so no runaway field-wipe). So a frozen crowd becomes a field of satisfying chain-clears. Added a crystalline frost ring on the field + icy shatter bursts; card text updated. Verified: enemySlow 0.14, Flare step 7.4→2.96, one annihilation chain-cleared a tight 8-cluster (0 with Cryo off).
- **Boss Rush** (renamed from "Anomaly Arena"): **dots now spawn** during the practice fights, so it replicates a real Epoch environment instead of an empty room. Director test branch now runs `doSpawns` (held at intensity 0.62) and `doSpawns` jumps to the full mid-game mix (`t=testMode?130:elapsed`). Still boss-focused: one Anomaly always present, cycles to the next kind on kill, 1–5 jump to a kind. Verified: ambient dots peak ~17–20 with the boss present.
- **Emitter + Spiral merged** into one boss. They were "the same boss with two patterns" (both hover and hurl Flares), so **Emitter now ALTERNATES** a hexagon crossfire **burst** and a sweeping single-Flare **stream** (`b.emitMode` toggles each fire cycle). Roster 6→**5** kinds (emitter/sentinel/pulsar/lunger/seeder); variant key `hex`/`spiral`→`emitter`; bestiary two cards→one, codex + HUD updated. Verified: one Emitter shows both burst (7 concurrent Flares) and stream. `node --check` clean on both files; zero console errors.

### ORBITAL CRASH — Anomaly Arena (boss-only practice) (2026-07-21)
A **testing ground where only Anomalies spawn** — no ambient waves, no Epoch phases — for feeling out boss balance. Menu button **"◆ Anomaly Arena — bosses only"** (or `startRun(true)`).
- **Director test branch**: when `testMode`, the director skips `doSpawns`/phase-timing entirely and just keeps one Anomaly alive; killing it **cycles to the next kind** (`TEST_ORDER` = hex→spiral→sentinel→pulsar→lunger→seeder). Boss-spawned minions (Seeder's swarmers) still appear — they're the boss's mechanic, not an ambient wave. Gilded Bounty suppressed in the Arena.
- **1–6 keys** jump straight to a specific kind (`testPick`); the current one is retired and the chosen kind spawns fresh (Flares cleared). HUD Epoch label shows **"◆ ANOMALY ARENA · 1–6 SWITCH KIND"**.
- Fixed HP tier (Epoch-II scaling), real damage — you can still die; **Reforge** restarts in the same mode (`lastWasTest`). `spawnBoss(forceVariant)` now takes an optional forced variant.
- Verified in-engine: entering spawns the Emitter, `nonBossEnemiesPeak=0` (no ambient), `4`→Pulsar, kill→cycles to Lunger, Seeder's swarmers still spawn; `node --check` clean, zero errors, and the live screenshot shows the boss-only arena + label.

### ORBITAL CRASH — Anomaly balance pass (2026-07-21)
Ran a headless Monte-Carlo: a "flee-field + reflect + Collapse" bot fought each variant N=12–22× per Act (1/2/3), from full HP, measuring kill/survive/death. **Finding**: every variant is killable *and* survivable (no boss ever went un-eroded past the fight window; even the hardest is killed ~45% by the worst-case bot) and you genuinely sometimes lose — but difficulty was **uneven**. Death-rate spread at Act 2 (pre-tune): Spiral 75% · Sentinel 50% · Emitter/Pulsar 25% · Seeder 8% · Lunger 0%.
- **Caveat that shaped the tuning**: the flee-bot *hard-counters* Lunger & Seeder (it just outruns swarms and sidesteps the telegraphed dash) so it reads them ~0% regardless — it is only a valid proxy for the tracking/dense-fire bosses (Emitter/Spiral/Sentinel/Pulsar). Those got data-driven tuning; Lunger/Seeder got mechanical buffs that need human feel-testing.
- **Spiral nerfed** (was the spike): stream 9→7 Flares, per-Flare cadence 0.22→0.26s, rest between streams 2.6–3.4→3.2–4.2s. Verified: Act-2 death 75%→~55% (N=22). Left there — the bot can't use Spiral's real counter (bait the stream through its body), so 55% is a worst-case; over-nerfing would trivialize it for humans.
- **Clean N=22 revealed Pulsar is also a hard boss** (~50%) — its telegraphed radial nova-rings are tough to weave while staying close to reflect. Left as-is (telegraph makes it fair; it already carries 0.75× HP).
- **Lunger buffed** (bot read 0% every act — the dash was a free firing-break): telegraph 0.65→0.5s, dashes more often (lungeT 4.5–6.5→3.6–5.2s), and it now flings a pincer as it commits the dash.
- **Seeder buffed** (bot read ~0–8%, only ~4 HP at Act 1): 2→3 swarmers per wave (4 at Epoch III+), faster (seedT 2.6–3.8→2.2–3.2s), and the mix now includes **Orbiters** that curve in (a fleeing star can't just outrun them).
- **Net gradient** (target): Emitter easy → Sentinel mid → Pulsar/Spiral hard; Lunger/Seeder need real-play confirmation. `node --check` clean.

### ORBITAL CRASH — Anomaly variety (2026-07-21)
With the arsenal gone, the **Anomalies** now carry the game's variety. The single hex/spiral boss is now a **roster of six distinct kinds**, each a different puzzle on the same "bait its Flares / erode it" loop — chosen per Epoch (the first is always the teaching **Emitter**; meaner kinds unlock deeper). Each names itself + its counter on the integrity bar.
- **Emitter** (`hex`) — rotating 6-Flare crossfire. The teacher. *(existing)*
- **Spiral** — a sweeping single-Flare stream. *(existing)*
- **Sentinel** *(new)* — **circles the arena** (`bossMove`) firing aimed pincers; you chase it to keep it in your baiting line. (Named Sentinel, not "Orbiter", to avoid clashing with the Orbiter enemy Dot.)
- **Pulsar** *(new)* — **charges (telegraphed), then erupts a radial ring** of Flares (`bossNovaRing`/`fireNovaLance`) — a bullet-hell weave. Since the ring flies outward, you erode it by **reflecting** Flares back + Collapse, so it carries 0.75× HP. A collapsing charge-ring telegraphs the burst.
- **Lunger** *(new, Epoch III+)* — hex fire **plus a telegraphed body-dash** at your core (reuses the boss's existing 34-dmg contact). A pink dashed aim-line + swelling warning ring wind up the dash.
- **Seeder** *(new)* — sheds **fast minion swarms** (`spawnEnemy`) while firing sparse pincers — swarm pressure during the fight.
- **Architecture**: generalized `boss.variant` via an `ANOM` table (banner + HUD tip per kind) and `pickAnomalyVariant()` (Epoch-gated, no back-to-back repeats). `updateBoss` dispatches per variant; `bossMove` owns position (boss `seek:0`, so the well is fully position-controlled — orbiter circles, lunger dashes, the rest hover with a gentle sway). The HUD boss-bar label and Codex now name each kind + its counter.
- **Verified in-engine**: all six fire/move/spawn correctly — Emitter 6 Flares, Spiral 9-stream, Sentinel ranges 471px firing pincers, Pulsar charges + rings 11 Flares (+sparse aimed), Lunger telegraphs→dashes (moved 325px), Seeder spawns swarmers + moves 292px. Both new telegraphs (Pulsar charge-ring, Lunger aim-line) render clean; zero console errors; `node --check` passes.
- **Bestiary updated** (`bestiary.html`): the stale "hexagon / later a SPIRAL" boss text is replaced by a live-rendered **Anomaly-kinds** section — all six kinds, each with a distinct animated attack-cue portrait (`drawAnomMini`) + behavior/counter line — plus a rewritten intro card. Renamed the arena-circling Anomaly from "Orbiter" → **Sentinel** to disambiguate from the Orbiter enemy Dot.

### ORBITAL CRASH fork — vanilla survival + instant powerup drops (2026-07-21)
Forked POLARIS into a new `pulsar/` folder (later renamed to `orbital-crash/` on 2026-07-27; the game is titled **ORBITAL CRASH**) and **stripped the whole meta-progression** — the game is now pure arcade survival, spiced by temporary powerup pickups. There are **no level-ups and no permanent upgrades**.
- **Removed entirely**: XP / levels / `gainXP`, the level-up card **Offer**, **keystones** (the 5/10/15 fork), **Anomaly "Special" rewards**, **reroll/banish**, the menu **Arsenal shop**, and the cross-run **shard / unlock economy**. Also removed the "**hold to open Event Horizon**" flip — **flip is a pure tap** again (reverse poles). Collapse (the charged Capacitor ult) is unchanged and stays.
- **Added — powerup drops (the only progression).** Any annihilation has a small chance to shed a glowing **orb** (a safety drop floats in when the field is empty; a purged Anomaly drops a cache). Rates are tunable constants near the top: `ORB_DROP_CHANCE` (0.008/kill), `ORB_CAP` (2 on field), `ORB_SAFETY_MIN/MAX` (22–34s, empty-field only), Anomaly cache = 1 orb. **Tuned down 2026-07-21** ("spawns too frequently"): from ~1 orb / 5–7s to ~1 / 15s under sustained aggressive play (measured), sparser in calm. **Steer your star into an orb** to collect — the effect is **instant and temporary**; grabbing the same one refreshes its timer. Roster (`const POW`): **◉ Singularity** (5s black hole that devours nearby matter), **🛡 Aegis** (6s shield), **❄ Cryo** (5.5s — incoming matter crawls), **☀ Corona** (6s — field burns opposite matter), **⚡ Overdrive** (6s — faster star + wide/whirling rings), **✺ Nova** (instant screen-clear shockwave, rarer weight).
- **Key architecture**: with no permanent upgrades, base stats are constants, so `stepFX(dt)` just **toggles the existing tuned physics flags** each frame from the effect timers — `P.corona`, `P.eddy` (Overdrive borrows Eddy's wide/fast rings), `P.enemySlow` (Cryo 0.34), `P.moveMult` (1.4), `P.fieldR` (BASE_FIELDR 190 → ×1.28), `P.ringMul`, `P.shield` (Aegis = 3), and `P.ehorizon`+`ehT` (the black hole **reuses the old Event-Horizon devour code**, pinned open at full grip). Every effect rides code the game already balanced; it just expires. New: `stepFX`, `dropOrb`, `stepOrbs`, `collectOrb`, `fireNova`, `blackholeCollapse`, `drawOrbs`.
- **HUD**: XP bar → a left-column stack of **active-powerup chips** (icon + name + draining timer bar). Menu Arsenal → a one-line powerup blurb. Death screen dropped shards/next-unlock; pause "build" → "active powerups". Codex "Offers/Keystones" section → a **Powerups** section.
- **Verified**: `node --check` clean; dangling-symbol grep clean; in-engine bot confirmed all 6 powerups toggle **and restore** on expiry, black hole grips 12 planted bodies (frame 2) → devours all + banks 27 motes, orbs drop from kills + collect on contact, flip taps reverse polarity, 25s active run scored 4523 with zero errors. POLARIS (roguelite) is untouched in its own folder.
- **Renamed** the game to **ORBITAL CRASH** (title/logo/codex/bestiary + doc headers); own localStorage namespace `orbitalcrash_*` (independent best score). Debug seam is now `window.__orbital` (with `__polaris`/`__flux` aliases for the harness).
- **Post-review fixes** (from a 23-agent adversarial pass — 4 confirmed, the rest correctly ruled intended-design false-positives):
  - **[medium] Singularity had a protection gap**: **Chargers** (early-out before the devour block) and **Anomaly Flares** (separate array) still hit the core full mid-black-hole and broke the streak. Rather than blanket i-frames (which would make it strictly better than Aegis), the well now **grips chargers within 230px** (they fall through to the devour) and **swallows Flares within 170px** — matching "devours nearby matter" while staying distinct from Aegis's pure shield. Verified: 6 chargers + a core-bound Flare → 0 HP lost, streak kept (control with no black hole: −14 HP).
  - **[low]** removed orphaned `.bchip.spec` CSS, the dead `state==='levelup'` render disjunct, and stale `menu|levelup|shop` comments.
  - Hardened `stepOrbs` collection (splice before `collectOrb`, since a Nova pickup can `killBoss`→`dropOrb` and mutate `orbs` mid-loop).

## 🧊 Backlog (agreed direction, not yet started)

- **Touch controls** — parked pending the launch-environment decision (see the 2026-07-27 hardening entry).
- **Moment Engine stretch** — stereo-panned kill pops, low-HP heartbeat + lowpass, storm drum layer. The
  Moment Engine itself is live here (`timeScale`, GLOSSARY §10); this is the audio half of it.
- **HUD hierarchy pass** — the meters read as equals; only Capacitor + Streak deserve to be loud
  (deferred from the player review).
- **A chase reward for the Sentinel that is not contact damage** — the obvious version measured backwards
  (see "Ring grind priced down"), so the idea needs a different vehicle, not a different number.
- **The powerup roster is still mundane** — three temporary drops, all of them straightforward. Noted
  repeatedly, never designed.

## ⚖️ Balance watch-list

- 🔴 **`RING_GRIND_DMG` is stranded above its pool (2026-08-03) — the top item on this list.** The grind
  sat at **0.5** while Epoch I was **18 HP**, and was raised back to **1** for one stated reason: *"the
  pool moved underneath it: boss HP is now ×1.5."* That ×1.5 is gone — Epoch I is **15**, *below* the 18
  that made 0.5 necessary — and `RING_GRIND_DMG` was **not** touched in that pass, so this is an
  oversight of the HP change rather than a decision about the grind. **Re-ran the historical test:** an
  immortal bot orbiting at 130px that never fires a volley and never Collapses, 60s cap, 3 phases × 3
  kinds — **5 of 9 runs solo-killed the Epoch I Anomaly**, median ~30s (emitter 32.6 / 39.1s, sentinel
  25.8s, pulsar 30.8 / 28.7s). That is the exact failure mode that forced 1 → 0.5 the first time.
  **Both caveats stated, because they decide whether to act:** the bot is *immortal*, and a real player
  holding that orbit pays **−27 HP** against the Sentinel and **−82** against the Emitter — so this
  demonstrates the strategy *exists*, not that it is free. Left unchanged deliberately: the brief was HP
  and volley damage, and the pilot has said difficulty tuning is theirs. The one-line fix if it should
  not exist is **`RING_GRIND_DMG` 1 → 0.5**.
- **The three-powerup bag** — Aegis 45.1% / Overdrive 43.9% / Nova 11.0%, and Aegis is exception-free.
  Watch whether three reads as too few over a long run, and whether the most common pickup being the
  dullest one is a problem.
- **No heal beats the lockout** — Integrity regenerates only after 3.8s untouched and nothing else heals.
  Disengaging is the entire healing verb; watch that a bad Epoch is still recoverable.
- **Boss balance is bot-derived** — every TTK number in this ledger comes from a scripted pilot, not a
  human. The Sentinel measures hardest. Confirm against a real player before trusting that ordering.
- **The Emitter kills the test bot 11 times in 12.** The bot holds a fixed 150px orbit and never dodges,
  which is the worst possible way to fight the kind that hovers and shoots point-blank, so this is
  probably an artifact. Needs one human playtest to say whether the Emitter is genuinely the hardest kind
  or just the least bot-legible.
- **Bomber spawn weight vs. its role** — `['bomber',9]` and `['bomber',7+a]` were priced when a Bomber was
  a body you could walk through. It is back to being one on contact (10, Drifter parity) but now clears a
  120px hole in your hoard when it dies, so the weight is priced against the wrong property in a new
  direction. Measure Epoch IV–VI before moving it.
