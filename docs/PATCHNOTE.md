# ORBITAL CRASH — Patch notes

What changed, newest first. **The reasoning lives in the commit body** — every entry from `git init`
(2026-07-31) onward has its writeup attached to the diff that made the change, 10 to 156 lines of it
depending on how much argument the change needed. `git show <hash>` is the long version of any line here.

Entries before 2026-07-31 predate version control, so they are the only record of those passes.

Rules that constrain future work — laws, traps, rejected approaches — are **not** here. They live in
[MECHANICS.md](MECHANICS.md), because a dated entry is the wrong place for something you need to read
*before* you edit.

---

## 2026-08-04

### The receipt lists every ride, and what each Anomaly cost `b4110ab`
The run summary recorded score, cause, time and peak combo — **nothing about Overdrive**, which is one
of the two verbs. It gains two chip rows, on both the pause and death panels: one per completed ride,
one per Anomaly fight.

**Both are logs, not totals**, because four sips and a redline is a different run from two full burns
and the two sum to the same number. The Anomaly figure bills the **whole encounter** — every point of
damage taken while that boss was alive, not only damage the boss dealt — since the field does not stop
for a fight and that is most of what a fight really costs.

`endOverdrive()` is now the single place a ride ends. `die()` used to clear the flag directly, so the
ride a player was in when they lost never reached the log; **Redline** moved into the same function
rather than being copied.

**Removed the `⚡ OVERDRIVE READY ⚡` world text.** Its flag only re-armed *below* the arming floor —
every Collapse spend crossed that line, almost no bankable Overdrive does — so it announced itself
about once a run. The HUD already carries availability at the identical threshold and keeps carrying
it. The chime is untouched; its cadence was already right. See law 9.

**Fixed:** the death receipt printed `Lost to boss (red)` — the Anomaly damages you through the
ordinary Dot-contact path and had no display name in that table, so the raw internal type reached the
player. The same class of leak as the phase readout that now sits behind `DEV`.

### Overdrive gets faster instead of only bigger `84d5aee`
*The diff is in `84d5aee`, whose message is about a documentation pass — it was swept in by a `git add -A`
from a parallel session. The reasoning is here and in the code comments at both sites, because it did not
survive into the commit body where this repo normally keeps it.*

Pilot report after `b3a95a3`: *"overdrive should be faster, since with half a gauge, i could barely spin
once."* Measured at **1.59 revolutions per half gauge**. Correct, and the cause was not the spin number.

**The spin constant had no authority at all.** Under Overdrive a ringed Drifter sat on its speed clamp
*exactly* — 12.03 px/frame against a cap of 12.03 — so raising the eddy spin 1.4× on its own moved the
ring from **1.59 to 1.61** revolutions. Every point of the advertised spin was being eaten by a ceiling
last tuned for the base ring. **And a wider ring is a slower-looking one:** angular rate is v/r, so the
Field widening was cancelling most of the spin it shipped alongside. The two levers were fighting each
other, which is why Overdrive read as *bigger* and never as *faster*.

Three numbers move together and only work together — eddy orbit `0.85` → **`0.72`**, eddy spin `2.1` →
**`3.6`**, and the ringed-matter speed ceiling (now named `RING_CAP`) `2.9` → **`5.0`**.
**Measured:** angular rate **3.33 → 5.82 rad/s**, one revolution every **1.08s** instead of 1.89s, so half
a gauge buys **2.78 revolutions instead of 1.59**. Settled radius is **unchanged at 214px** — the faster
spin pushes back out against the tighter target, so this is pure speed, not a size cut. Burn timing
untouched.
**Nothing else moved.** The base ring is byte-identical (Drifter 114px, 2.52 rad/s) because `RING_CAP`
does not bind at base spin. Mass shows *more* ordering, not less — the cap is `e.maxsp * RING_CAP`, so
every species scales together: Brute 3.84, Drifter 5.82, Dart 6.81 rad/s, each still clamped at its own.
*Side effects checked rather than assumed:* a 20.7 px/frame ring **holds better** (14 of 14 retained while
dodging, against 13 of 14 at base), and ring grind rises 2 damage over 10s — the existing channel getting
slightly better while you burn, not a new one. `closing` is split off the clamp and keeps its old value,
because like-charge on its way in is not a ring yet and ring-grade speed would make gathering feel like a
vacuum.
**And it is what finally made Overdrive worth using to a player who flips.** The same cell measured
**+0.3%** on standing crowd before this change — a rounding error — and **−9.9% (Welch t=−4.36, n=8)**
after, independently **−16.0%** on a second harness. The effect existed only for a hoarding player
before; it is now roughly half-strength for a flipping one, which turns the Overdrive-rewards-hoarding
tension from a trap into a trade. None of that was the goal: the change was aimed at a pilot saying the
ring felt slow.

### Two verbs: flip, and Overdrive `b3a95a3`
Collapse and the entire powerup system are deleted. The Capacitor now buys **Overdrive** — the effect the
orb used to grant free, made **drainable**: ignite from `OD_MIN` rather than only when full, `OD_DRAIN`
empties the meter over the six seconds the orb gave, press again to bank the remainder. A spend that must
be full and total is a button; a spend you can meter is a choice.
**Deleted:** `unstable`, `cwave`, `stepCollapseWave`, `collapse`, `detonateCollapse`, `inhaleT`, the
tally, `POW`/`POWMAP`/`orbs`/`FX`/`dropOrb`/`collectOrb`/`fireNova`, `pickupToast`, `ruptureBlast`,
`P.shield`, `SHIELD_IFRAME`, `PICKUP_IFRAME`, `P.blastR`/`P.blastDmg`. `supercollapse` → **`redline`**.
Nova going with the roster is what made this clean — it was the second writer of `unstable`/`cwave`, so
the whole Collapse apparatus deleted rather than surviving for one orb.
**The Anomaly is down to three channels** — Volley, ring grind, baited charge, law 2 exactly satisfied
with nothing left over. No softlock: the Volley closes all three kinds unaided (**53.1s** Emitter,
**39.8s** Sentinel, **33.4s** Pulsar), and grind alone takes the Sentinel and the Pulsar but **not** the
Emitter — the kind that hovers and shoots point-blank, which is what the old note about holding an orbit
against it predicted.
**Ring shell** 114 → **217px**, 95% of the way there in **0.18s** against a 1.5s cheapest ride; rim speed
4.8 → 10.7 px/frame, but the *angular* rate rises only **1.17×** because the radius nearly doubled. The
3.15× the raw multipliers suggest is arithmetic, not what a player sees.
> ⚠️ *That last sentence was written as a design note and was actually the bug.* The spin was being eaten
> by a speed clamp, and the widening was cancelling it. Fixed the same day — see **Overdrive gets faster
> instead of only bigger** above, which is also where the ring numbers here stop being current.
**Cost: −23.5% survival** (34.9 → 26.7s, Welch t=2.18, n=30) and **variance halved** (sd 18.8 → 8.5).
Aegis was most of the long tail, so the best runs went rather than the average one getting worse.
*One deliberate leak:* kill and Mote income are fully suppressed mid-burn, but a **streak milestone**
still pays through — it is a streak payout, fires ≤4× a run, and gating it would make the streak worth
less during the thing you spent it to earn. `store.best` → `orbitalcrash_best2`; old scores carried the
tally.
*Doc-side consequence, recorded because it is a difficulty change wearing a copy edit:* the Splitter's
only named clean death was a Collapse. It is now the Bomber blast alone — 47.8% rarer as of the previous
commit. See `MECHANICS.md ## Open`.

### The Capacitor stops being two systems wearing one bar
`CHG_KILL_CAP` bounds the per-kill charge award, which was `0.006 + combo*0.0002` — linear in `combo`
and uncapped. `combo` is a *no-hit* streak with no decay and no timeout, so on a clean run it compounds:
measured on an untouchable pilot it climbed **0 → 699 over 180s**, and time-to-fill fell from **20.1s to
1.8s — an elevenfold swing inside one run**. That single line, not the Collapse design, is what made the
meter read as two different systems: a pilot taking hits sits near combo 0 and fires **0 times in 8 of 10
runs**, while a clean run fires every couple of seconds.

Not a new rule — the streak trickle in `stepRunTimers` was **already** capped, binding at combo ~88. The
per-kill term was simply the stream nobody capped. `CHG_KILL_CAP` binds at combo 90 so the two agree.

**It cannot touch a run that takes hits, by construction.** Verified per-kill at combo 0 / 50 / 89 / 90:
identical to the old expression to four decimals, with the cap engaging only at 150 and 400 (0.024 where
the old paid 0.036 and 0.086). And across 25 blind-pilot runs the **peak combo reached was 78 — 0 of 25
ever reached 90**, so the capped branch is unreachable without a long clean streak.

Per-kill income is now flat from combo 50 up (~0.037–0.049) instead of climbing to 0.145. Spend cadence
on a clean run goes **18 → 14 per 180s**.

*Found while measuring a proposal to replace Collapse and the powerups with a charged Overdrive. Three
other measurements from that pass, recorded because they constrain any future version of it:* kill
throughput is **spawn-limited, not player-limited** — 216–230 kills/min in every condition tested — so
removing Collapse costs **2.7% of kills** but **71% of score** (the tally) and **doubles standing crowd
density** (17.1 → 33.5). Widening the Field does not help and hurts: a wider Field pulls more matter
onto you at the same rate it catches more. And of the three powerups only **Aegis** is measurably
load-bearing: suppressing it costs **−32.8% survival, Welch t=4.06 at n=30**, against t=1.12 for
Overdrive and t=1.56 for Nova.

**Correction, recorded because the retracted version is the more quotable one.** That same pass first
concluded that *no setting of Overdrive's levers moves crowd density*. **That was withdrawn by its
author after re-measurement, and Overdrive does reduce standing crowd.**

**The cause was sample size, not a confound.** The original sweep held flip cadence constant across
every arm and controlled everything it meant to; it simply read `n=4` of an effect sitting near the
detection floor and stated the result as a fact. Re-run four times at identical cadence, that same cell
gives **+0.3%, −1.2%, −4.7% and −7.0%**, with Welch *t* bouncing between 0.40 and 2.82. Star-stationary
versus steering accounts for about 3 points of spread, not the rest.

Where the measurements do agree: the effect is **large when you never flip** — −13.6%, −15.1%, −16.7%,
one −24.5% — and **small and barely detectable when you do**. One harness reported −17.8% and −20.7% for
the flipping case, outside every other measurement of it and never explained; it is recorded here as an
unreproduced outlier rather than a range endpoint. Overdrive does not reach Collapse's number under any
of them.

**Do not quote a single figure for the flipping case.** Seven independent measurements of it disagree.

*Method note for anyone re-running this:* the arms must match on flip cadence **and** run length.
Measurements straddling `CHG_KILL_CAP` **are** comparable unless the run spends the Capacitor — it
changes fill rate and nothing else, and a run that never fires a Collapse never observes it. An earlier
version of this note claimed the fling radius reads charge and so was affected; it does not. The flip
path reads **hold-charge** (`P.holdT/P.holdMax`) and rings held, and `P.charge` appears nowhere in it.
See `MECHANICS.md` *Pressure is spawn-limited* for the standing rule that came out of all this.

### The Bomber gets rarer
`BOMB_RARITY` scales the Bomber's spawn weight in **both** bands — the time-ramped intro table and the
Epoch-scaled one past it — so the species is reduced by the same factor at every Act. Halving only the
intro band would have let it creep back at high Act, where its weight climbs with Epoch.

This closes the open question that had been standing against it: the weight was priced when a Bomber was a
Dot you could walk through, and contact went back to Drifter parity while the death blast kept clearing a
large hole in your hoard — it was paying for the wrong property.

**Measured**, 4 matched 240s runs, counting every arrival by object identity: Bombers **293 → 153**,
**−47.8%**. Share of all arrivals **8.61% → 4.95%** in the intro band and **7.15% → 3.76%** past it. The
shortfall against a clean −50% is arithmetic, not a bug: these are shares in a bag, so removing weight
shrinks the bag and every other species gains a little. The denominator is 95.5, not 100.

Worth recording because it surprised the measurement: the real mix is wider than either table. Formations
and storm surges spawn outside `doSpawns`, and Minis — which appear in **no** table, coming only from
Splitters dying — are about an eighth of everything that arrives.

Not settled, and the bot cannot settle it: whether the blast now reads as an event rather than a tax. The
median scripted pilot dies before the first Bomber can spawn.

### Score is addition; the multiplier was a coin flip `71c961e`
Deleted `mult`, `motesBank`, `recalcMult`, `bankMote`, the `#mult` HUD stat and the `sfx.streakLost`
voice. Score is now flat: **`KILL_SCORE` 20 · `MOTE_SCORE` 5 · `GRAZE_SCORE` 10**, priced at the old
expressions evaluated at the measured median, so a median run scores **0.88×** what it used to.
**It measured as a coin flip, not a curve.** Median **×1.9** / P99 ×7.0 over 12 runs taking hits, versus
a hard cap at **×15 inside 46s on 6 of 6** runs taking none — nothing in between, and **1.30×** total
effect on final score. The halving punished backwards: a clean run banks 761 Motes against the 140
needed to cap, so the first two hits cost a deep bank nothing while a shallow one lost half.
*Also:* `STREAK LOST` and the `MULT ×a → ×b` popup are gone — the latter computed uncapped, so a
saturated bank rendered the literal string `MULT ×15.0 → ×39.0`. `STREAK BURST` stays alone.
`breakStreak` was still setting `hitstop=0.12` at combo ≥50, leaking the freeze-frame `407b74e` removed
from contact back in through the streak path; gone, and all four surviving `hitstop` writes are
non-hit events. And `#combo` carried no class, so it never picked up `.stat`'s `position:absolute` and
its `right`/`top` had **always** been ignored.

### Getting hit says one thing `407b74e`
A hit now produces the hurt sound, **one damage number**, and the star's blink — nothing else. Removed
from **every** damage path: the 12–14 particle red burst, the full-screen red flash, the screen shake and
the hitstop.
The number carries the magnitude, since it is the only readout left: `14 + dmg × 0.40` clamped 14–28, so
6 → 16px and 30 → 26px. It also fires on **every** hit; it was contact-only, so a 20-damage mine gave no
readout at all.
**Immunity unified to 0.8s** across every *damage* source (was 0.55 contact / 0.5 missile; a shield block
keeps its own shorter window) and the blink is driven off
`P.iframe` itself, so it cannot drift out of phase with the window it reports. Cost: hits per minute
**26 → 22**, about −15%, over five paired runs on a fixed flight path.
*This is why the contact ghost should read better rather than worse* — it was never invisible for being
short, it was buried under the four cues that went with this pass.

### You can finally see the thing that hit you `1a980bb`
Added a **contact ghost**: the Dot that hits you is snapshotted before `queueKill` and drawn once more
where it touched, held `GHOST_HOLD` 0.07s. Nothing in the sim changed.
The reported "I collide 2–3px early" was real and was never the hitbox — `processKills` runs inside
`step()` and `render()` after, so the Dot was culled before the frame was drawn (median 2.44px gap on the
last frame it appeared in, over 127 hits).
*Rejected first:* a 2.5px hurt-radius mercy. Measured 0.64 of one frame at a 3.9 px/frame closing speed;
the pilot felt nothing. `FORM_STEP` also caps any such grace under 4px, so the lever can never buy more
than a frame.

### Remove the star's atmosphere discs `a209e11`
Deleted the two flat-alpha discs at 1.45r and 2.4r. Flat alpha is a *hard* boundary however soft the
colour looks — they measured luminance cliffs of 51 and 73 against the 9 a gradient measures, on the one
hull whose edge has to be unambiguous — the star's. `drawField` already lays a real radial gradient underneath, so the
soft light was never lost. Biggest cliff outside the hull after: **4**.

### Every hull tells the truth, and the Neutral pop stops being a number `2a8085f`
Star rim `P.r*0.86` → outer edge on exactly `P.r`; Gilded ring `1.8r` → `e.r + P.r`. Contact now lands on
`e.r + P.r` for all nine species plus the Anomaly.
`NEUTRAL_POP` removed — the subtraction became `queueKill`, so the pop is a kill at any HP rather than
damage that happens to equal it. Sim-identical today; it diverges only if Neutral HP is ever raised.

---

## 2026-08-03

### The Anomaly gets smaller, cheaper, and stops lying about its edge `7789571`
`boss.r` 44 → **37** · `VOLLEY_DMG` 3 → **2** · `CHARGE_DMG` 12 → **8** · boss HP `round((13+act*5)*1.5)`
→ `10+act*5`, so Epoch I–V is 27/35/42/50/57 → **15/20/25/30/35**. Integrity ring moved to `b.r+P.r`.
Purge cost barely moved; what changed is the **grain** — at 3 into 27 the pool did not divide by the price.
`CHARGE_DMG` stays pinned at 4 × `VOLLEY_DMG`.
*Also:* 'Danger Close' retired (it certified nothing at Drifter parity), roster 6 → **5, one secret**.

### The Bomber detonates again — but only the half that clears matter `800e5da`
Restored a death blast: `BOMB_R` 120, `BOMB_DMG` 2, colour-blind. **Three exclusions kept it scoped** — it
does not touch you, does not touch the Anomaly, and pays nothing. It also does not chain.
Sized just past the ring orbit (114), so a Bomber at your core clears the hoard and one popped on the ring
takes a bite. Clears a median of 2 in an ordinary field, up to 9 in a dense one.

### The Sorter stops invoicing you for its own suicide · Escape works inside the Bestiary `76a8a0c` `88070dd`
Formation-vs-formation kills now pay nothing: per Sorter, score **454 → 0**, Capacitor **+0.58 → 0**,
combo up to **41 → 0**. Gated on both Dots holding `hold`, and on `!unstable`.
Escape now closes the Bestiary after a click inside it — the iframe was taking the keystroke. Fixed
parent-side. Found alongside: both overlay handlers used `stopPropagation` where only
`stopImmediatePropagation` does what they meant.
*(`88070dd` corrected the published figure — the residual was contamination, not a leak. It took four
isolation attempts.)*

### The Pulse: 3 arcs → 2, and the gap doubles `d7c3fb0` `e1448a9`
`PULSE_ARCS` 3 → **2**, `PULSE_GAP` 70 → **150**. Arrival gap 0.57s → **1.22s**, inside the band
`CHG_WIND` 0.9s / `LUNGE_TEL` 1.3s. Dot count **102 → 68**.
*Surveyed and rejected:* a general "retire anything off-screen" rule. Over 300s, 1,374 Dots entered and
**2 ever left** — both came back. Ambient matter seeks you; nothing loiters off-screen.

### The Pulse sweeps through and leaves the sky `5ffc306`
Pulse Dots now retire once past the padded viewport. Left behind 20s after the wave: median **29 → 0**,
zero variance over 8 trials. Positional, not a clock, and gated on having entered first (`seen`).
*Cost:* the Pulse is no longer an ammunition source — a held Dot can never be ring-captured.

### Compact the bestiary `3e16892` `8f7e5b0`
Every card rewritten under 30 words for a first-time player. The Bomber card was warning against a
confusion the code cannot produce.

### The Anomaly stops leaving; the bait starts landing; the well is excised `f335a3b`
Excised the Singularity machinery — 166 lines. Kept `sfx.closing()`, shared with two live telegraphs.
**Destabilize and the flee are gone.** The flee called `onBossCleared()`, so running the clock out handed
out the Epoch advance for free — a second win condition that asked nothing. There is now exactly one way
past an Anomaly: purge it.
`CHARGE_DMG` 5 → **12**, plus a full impact signature (hitstop 0.09, screen kick, twin rings, a gold
readout at purge scale, `sfx.baited`). Deliberately not slowmo — the dash resolves in ~0.17s.

### ◉ Singularity disabled `e8c3136`
Removed from the roster; one line. Its devour horizon (32px) equalled the largest contact envelope in the
game, so anything it held died at or before your skin — immunity that was **geometric, not tuned**. It also
strictly dominated Aegis. Roll rates redistribute to Aegis 45.1 / Overdrive 43.9 / Nova 11.0.
*Knock-on:* nothing erases a Brute outright any more.

### Measure the frame budget; stop the recorder perturbing it `fe8de1b` `4b24577`
**There was no regression.** The reported ~10% was an artifact of inferring fps from `elapsed` vs
`frames/60`, which measures time spent in slow motion. Real cost: step() 0.10ms, render() 0.70ms flat —
**4.8% of budget, 21× headroom**. The 28ms stretches are environmental, proven three ways.
Cost driver is *overlapping pairs*, not Dot count; the 64px spatial hash works. **Rejected: optimising
anything here.**
Recorder now runs at 4Hz with a running total instead of an O(frames) rescan every rAF, and unregisters the
service worker so a dead server fails loudly.

---

## 2026-08-02

### Nine species, nine silhouettes · an honest danger edge · a Wall that stops eating itself `95d56aa`
**Silhouettes.** Dart wake, Mini solid pellet, Orbiter annulus + pip, Brute hexagon, spent Charger hollow
rather than a plain disc (it had worn the Drifter's exact drawing at `dmg` 16 for 62% of its life). Drifter
stays the deliberate null.
**The danger edge rule changed** from *nothing outside a hull* to *a ring outside a hull sits at exactly
`e.r + P.r`, or does not exist*. The universal halo became a cached gradient sprite — biggest luminance
step **106 → 9**, and cheaper than the arc it replaced. Charger wind-up ring deleted; reticle now true.
**The Wall** releases in two polarity waves like the Noose: pair-kills 16–22 of 29 → **0** over 8 walls.
The player's own suggestion (one colour per wall) was measured and declined — it is a free door.
**Bomber `dmg` 26 → 10**, Drifter parity. The Brute is now the hardest contact hit in the sky.
Difficulty went *down*: median HP at 40s 39.3 → **65.5**.

---

## 2026-08-01

### Matter arrives instead of appearing; a Bomber you can name; a Charger that ends `7192d2d` `7a2590d`
**Everything enters from off-screen.** Ambient margin is now each Dot's own radius + 46 rather than a flat
30 (a Brute had 10px of clearance). Aiming entries at the arena centre was measured and rejected — it
funnels colours into one point and deletes them. Patterns: Noose measured from the farthest corner, Pulse
started near its origin. Visible-on-spawn **45.8% → 0%** for the Pulse.
**Bomber → spiked mine with a blinking fuse.** 7 deep points at 0.50r; 9 shallow teeth still integrated to
"a circle with a rough edge" at speed. Spikes cut at exactly `e.r`.
**The Charger's dash became a cooldown, not a retirement** — `CHG_COOL` 5s as ordinary matter, then it
re-arms. Match its colour and it rides your ring, then re-arms inside your guard.
**Same-charge shove:** overlaps resolve positionally, split by mass. 14 stacked Dots spread 0.9px →
21.8px; ring radius held 114.2 → 114.3. Live field is denser (median 31 → 42) because fewer Dots drift
through each other into opposite matter.
*Cost accepted:* the off-screen clearance made the game easier — median HP at 40s 42.0 → 61.9.

### The comet crosses and leaves `3dd14fc`
Flight solved **ray-vs-box** against the padded viewport instead of a fixed `d+m*3`. Crossed and left:
**0 → 13 of 14**; lapsed on screen **11 → 0**. Reaching the edge retires it — no score, no Mote, no blast.

### Title lockup, and the World becomes the Star `b563e70` `1ccc890`
Replaced the gradient wordmark — which left red, half the game, off its own title screen — with a colourless
wordmark and four charges on two orbits. Tunables and the traps are in MECHANICS.
**`world` → Star.** The word had been doing three jobs; lowercase `world` now means the coordinate space
and the setting, never you.
Three pre-existing bugs fell out: menu content above the fold was unreachable (`justify-content:center`
overflows both ways), `overflow-y` alone computes the other axis to `auto`, and ring-particle depth was a
boolean (`sin(a)>0`) that snapped twice a lap — worst step per frame **0.55 → 0.0014**.
Menu copy cut ~65 → 40 words, five one-line beats.

### Play recorder and exact replay `b60714e` `7800a71`
Added `.harness/record.html` — frame-exact tapes with per-frame `dt`. Found two holes in the oracle. The
game was booting twice; the iframe was 150px tall.

---

## 2026-07-31

*Version control starts here (`e21eda6`). Everything above has a commit body; everything below does not.*

### Cleanup pass — 12-agent audit, 83 findings, and a behaviour oracle `e21eda6`…`dcbc3cc`
Built the **oracle** first: seeded PRNG, frozen rAF, a scripted pilot, 93 state fingerprints per run,
reproducible byte-for-byte. Every commit in this pass verified against it.
Deleted **14 dead symbols** and **the dormant arsenal, 245 lines**. Split `step()` into seven phases along
its own banner comments, and `flip()` into two. One home each for the fling law, the multiplier law, the
Neutral's seam angle.
Two real bugs: `hexA()` is six-digit only, so `hexA('#fff')` returned saturated blue on three boss strokes —
the game and the bestiary had been drawing different silhouettes. And the Codex told players missiles are
blocked by matter, eleven lines above the text saying they are not.
**Docs: 34 drift fixes.** 286 lines — 40% of the ledger — were a byte-identical copy of POLARIS's.
`3585 → 3384` lines. Also: `git init`.

### The Sentinel's hunt becomes a walk `f4002a7`
Cause was not the speed constant. `orbA` was never seeded, so a hunt handed the boss a point elsewhere on
its circle and it sprinted sideways — frame 1 measured **10.71 px/frame**. And the angular rate was fixed,
so sweep speed scaled with radius: fastest when furthest.
Three shape changes: seed `orbA` from the current bearing, cap **tangential** speed (`HUNT_TANG`) not the
angular rate, cap the per-frame step (`HUNT_STEP`) instead of following 10% of the gap.
After: median **1.37**, peak **2.0**, path 402px. Arrival unchanged at 4.15s. Not more dangerous for being
slower — hunts connecting 62.5% → **54.2%**.

### Balance pass: core damage repriced, the close reversal removed, HP ×1.5 `f77e3a2`
Hits repriced by warning: missile **14 → 10**, mine blast **12 → 20**, Dot contact **34 → 30**.
**The close reversal is gone** — a charged flip chipping the boss let you park in the band and spam the
input. Shipped at 2, measured dominant, cut to 1, then removed. The Shockwave's job is Neutrals and
repositioning.
Ring grind **0.5 → 1**, baited charge **4 → 5**, boss HP **×1.5**. Emitter dash moves to Epoch II.
Despite +50% HP the pass made fights markedly *more* survivable (kills 6/36 → 18/36) — cutting the missile,
the hit you take dozens of times, outweighs everything else.

### The volley flies further and faster `5bbecdd` `bd1c8bb`
`VOLLEY_SPD` 7.2 → **8.4**, `VOLLEY_HOLD` 1.5 → **1.75s**. Peak reach 449 → **542px**.
**It bought nothing at range** — outcomes identical at 150/300/400px, before and after. Ring fire is radial;
more reach delivers more matter to where you were already not aiming. The old comment claimed 640px of
straight travel by reading the *asymptote* of the friction series rather than its 90-frame sum; the real
figure was 357px.

### The sky becomes a sky `cdcd07a`
Three parallax star layers + gas clouds, drawn outside the shake transform. **The 54px square grid is
gone** — a Cartesian lattice is the visual language of a scoreboard. Generated from a local fixed-seed
PRNG, never `Math.random`.
Verified presentation-only: 97 fingerprints identical.

### Three patterns that make COLOUR the puzzle `36c7a00`
Added **the Pulse** (nested single-colour arcs, answered by matching), **the Sorter** (two solid walls in
opposite colours) and **the Comet** (an event, not a wave). The Wall and the Noose are pure space and would
exist in a game with no polarity button; these two make colour the question.
Two bugs caught by measurement, both in the Pulse: `o.a += o.va` steps per **frame**, and the drift had been
computed per second — 60× too fast, compounding with radius. Peak Dot speed 210 → 12 px/frame.

### The comet gets rare, Point-Blank goes, and a Pattern Lab `be82c0a`
Comet moved to its own 200–300s timer — **1 per 10 minutes**. A first attempt at 75–120s made it *commoner*
(3 per 10 min), because the timer only advances outside a boss.
**Point-Blank Resonance removed** — every annihilation now pays a flat 10 × multiplier wherever it happens.
**Pattern Lab** added: a live field, no Anomaly, five shapes on keys.

### The Noose stops eating itself `2ad0fb5`
The ring kept all 20 Dots while closing, so its own spacing ran out at R=77 and every Dot crossed the
self-contact threshold **in the same frame**. Closest approach was 77.6px and **zero** Dots ever touched
a still player — both the comment and the docs had claimed it overshoots the centre.
It cannot be tuned into a crusher: a converging ring self-annihilates before it touches you for all N≥8.
So: the ring **locks** at `NOOSE_MIN_R` 106 and **five strands** carry on to 24px.
**And how it lets go:** two polarity waves 0.8s apart. Mutual kills 9.7 → **4.0**; Dots reaching you
0.7 → **2.3**. Two geometric alternatives were built and both failed — releasing wider changes nothing, and
blooming outward gets re-converged by the field.
*Control that reframes it:* sixteen ordinary Dots on the same ring annihilate 16 of 16. The shape cannot
beat the field, only be less bad than it.

### Mobile, PWA and iOS shell `6671f81` `2073863` `b4f68a0`
A world scale for small viewports, and touch that steers without flipping. Installable and offline-capable
(`manifest.webmanifest`, `sw.js`) — plus a NaN that was killing whole runs. Capacitor scaffold with `www/`
as build output rather than a fork.

---

## 2026-07-29

*Pre-`git init`. These twenty entries are the only record of the pass that built most of the boss fight.*

### The boss loop rebuilt: missiles and the Volley
Erosion used to come from baiting the Anomaly's own fire back through it. **Every missile now launches from
its own body**, so the bait loop ends by construction. Added **five missile kinds**, each with a different
answer. A hungry flip now **volleys** gathered rings at the boss.
Measurement caught two things reading the code would not: ambient matter was killing the boss for free
(18 → 12 HP in 15s with the player idle), and the hex burst was **decorative** — free-running, never aimed,
1.8 dps with dodging making no difference.

### The Fling · radial ring fire
The Purge loop ran before the Volley loop and spared only Dots matching your **new** polarity — but rings
are the **old** colour, so 10 rings gathered → 10 popped → **0 volleyed**. The boss erosion path was barely
firing.
**The Purge became the Fling:** hostile matter is thrown outward *alive*. Seek is zeroed while thrown, or a
Dot's own seek cancels the impulse and drags it back.
**Ring fire went radial.** Homing made every Dot a guaranteed hit and the fight collapsed into "hold a
pole, press flip". Radial makes what connects a function of the angle the boss subtends — closing is the
only way to raise your hit rate, and it walks you into point-blank fire.

### The two-channel rule: a moving Anomaly must not damage itself
The Hunt walks the boss the length of the arena through a field full of matter, so "opposite-charge contact
hurts it" means the boss damages itself by travelling. The damage list closed to what you **aimed** or
**carried**. Removed the Brute barge and the Fling's "still counts as your shot" window.
**Fourth re-tightening of this clause.** Recorded as a standing rule with a one-line test: *could the
Anomaly earn this by moving?*

### Collapse laundered its own kills into boss damage · erosion repriced
`processKills` fired a chain-blast on every death, and during a Collapse its boss branch chipped for the
full amount per opposite-colour death inside the radius — with **no per-wave dedupe** and no generational
decay on the damage (only the radius decayed). Since a Collapse kills the whole screen at once, the wave's
own kills came back as boss damage in one frame: **12 Dots → 33 damage** against an 18 HP boss, **24 Dots →
95**. Scaled by ambient density, not by anything the player did.
`unstable` blasts now stop at the boss's skin. A Collapse is **15%, flat**, at every density tested.

### The ring grinds · the Hunt goes for the core · the Charger's lane
A loaded ring was inert until spent — it paid 0 and bounced. The spin now cuts on contact, and contact
consumes the Dot, which bounds a grind to the hoard you built.
**The Hunt stopped 117px short and nobody knew it existed.** It now walks all the way onto the core, slowly,
lands one hit and breaks off — and it is telegraphed (bright wake, dashed lane, descending tone, a red
movement instruction on the integrity bar).
**The Charger had three defects:** the aim was rewritten every frame and froze only on commit, the drawn
line ran 40–100px while the wind-up triggered at up to 330, and the trigger sat outside its own reach. Two
more surfaced under measurement — locking a *direction* is insufficient because the Dot drifts while it
winds, and the dash ended on a clock that expired 30px before the reticle. It now locks the **end point**
and ends on **distance covered**. Standing still: hit 8/8. Stepping off the lane: 0/8.

### Ring grind priced down 2 → 0.5 · the "runner bonus" measured backwards
At 2/Dot a hoarded ring dumped 18–20 in one pass. At 1, a bot that **never fired a volley** solo-killed the
boss in 2–4 fights of 6.
**The runner bonus was refuted by measurement.** Giving the chase kind more grind damage looks obviously
right; closing on the Sentinel is in fact the **cheapest** of the three (−27 HP against 82 and 66), because
its orbit carries it away instead of parking on you. *Hard to catch* and *dangerous to stand next to* are
different axes. `GRIND_MULT` left empty as a signpost.

### The dash gets a real telegraph · the Fling starts firing · the Anomaly stops erasing matter
The dash's warning **carried no information**: the lane was drawn to your live position and locked only when
the wind-up expired, so moving during it did nothing. Lane now locks at wind-up; warning 0.5 → **1.3s**,
warning-to-contact 0.69 → **1.42s**, and the commit throws **three spears**.
**The Fling was unreachable code.** Ring capture is the whole Field while the fling radius topped out
inside it, and the fling loop skips ring-flagged Dots — **25 ringed, 0 flung** on a full-charge flip. No
amount of tuning the throw physics could have reached it. Radius now scales with rings gathered: **30 of 30
thrown**.
**The missiles were innocent.** Isolated, the Anomaly's fire killed 0. The real erasers were the mine blast
and the Anomaly's own body consuming matter that paid 0 damage. The reported "annihilation" was a *particle
effect* — an absorbed missile burst 7 particles in the blocker's own colour, pixel-for-pixel what a Dot
popping looks like.

### Missiles and matter stop interacting entirely · core gravity for your own colour
The collision loop is gone and should stay gone. **28 sampled crossings, 28 survived.** Cost accepted
knowingly: rings are not armour against boss fire, a Neutral is not cover, nothing blocks a missile.
**Core gravity** added — holding a pole had exerted no claim at all on the matter it was meant to gather;
both colours approached at rates identical to the frame.
**The Neutral now wears both poles** on a turning seam, replacing a flat violet disc that read as *some
third colour* — the wrong idea entirely.

### Gathering stops punishing movement · the Charger becomes an arrowhead and a weapon
I first reported the complaint as false, on a test that strafed at a third of real pointer speed. The pilot
pushed back and was right: sustained speed keeps 93–100%, but a **corner-to-corner flick peaks at 135
px/frame** and keeps only 36%. **Direction reversal is the shredder, and dodging is nothing but direction
reversal.**
**Ring hysteresis** fixes it — 0.8s of grace, lost past 2.4× the Field. Flick retention 36% → **93%**.
Core gravity 0.16 → **0.30**, reach 1.5 → **1.8×**, with ring-grade speed headroom for closing like-charge.
Ring while dodging **3.2 → 3.3 vs 2.6 still**.
**The Charger became an arrowhead**, and a committed dash driven into an Anomaly became worth 4 — the one
sanctioned exception to the two-channel rule, because it passes that rule's own test.

### Corona removed · Cryo removed · Missiles absorb instead of annihilate · Ring spin dialled back
**Cryo** cut whole (roster 6 → 5), taking `P.enemySlow` with it. The honest consequence: **there is now no
healing that beats the lockout**, and Cryo was the sole exception.
**Corona** removed (roster 6 → 4) — the only passive effect, with no VFX of its own anywhere.
**The Bomber became an ordinary Dot:** one exemption guard had been making it both harmless *and*
un-killable, so it phased through your core forever.
**Ring spin** 1.6 → **1.2** (6.4 → 4.8 px/frame) after an earlier raise overshot, plus a `reduceMotion`
scale — "our dots spin too fast, it makes seniors dizzy".

### The Purge · Deflect + Reflect removed · Neutral pops
**Both were fully implemented and both worked, and neither was reachable as a skill.** The Reflect window
measured a flat **4 frames (66.7ms)** with no variance, against a 280ms flip cooldown and a ~200–250ms human
reaction. The geometry forced it. Deflect fired constantly but its feedback was already owned by the ring
discharge — a parry was indistinguishable from an ordinary charged flip.
**"I can't kill the white orb"** was a real bug: Neutral had 2 hp and the Shockwave did 1.2, and a damaged
Neutral is drawn identically to a fresh one, so the first hit was invisible and the Dot read as immune.

### Patterns 4→2 · Anomalies 5→3 · Anomaly silhouettes · The Hunt
**Every one of the four formations was already solved by standing still or one keypress**, measured. Merged
into **the Wall** and **the Noose**, and the three pattern rules became rules in code.
**Five Anomalies → three.** Four of the five fired the same off-screen flares and differed by a bolted-on
gimmick. Lunger folded into the Emitter's dash, Seeder into the Sentinel's trail.
**Each kind now draws its own body, and the shape is the mechanic.** The first attempt came back pure white
on every overlap — `lighter` clamps additively, so layered silhouettes lose exactly the contrast they carry.
`bossBody()` now opts out.

### Splitter silhouette · Singularity strain · the boss bar stops ordering players to bait
Splitter drawn as a **binary** — it had fallen through every branch and rendered as a plain circle while
popping one *adds two Dots*.
The Singularity rendered **byte-identical for 5 seconds** then vanished in one frame; audit finding worth
keeping: **no timed effect in the game had any ending cue at all.**
The boss integrity bar — the most-read text in a fight — was still instructing players to bait flares
through the boss, an interaction the code could no longer produce. **Second time those tips outlived their
mechanic**, so the roster now carries a note that a tip must name something the code can do.

---

## 2026-07-28

### Silent world · formation waves · Cryo rework · glossary rewrite
**The centre banner is gone — all 13 call sites**, plus `banner()`, its DOM node, its CSS and the dead
`ANOM.banner` fields. Every beat still lands as matter, colour, ring, shake and sound. Two channels remain.
*Also reverted, in the same pass:* a storm advice line that was simply wrong — it told you to be CYAN in a
red flood, when RED shelters *and* loads your rings *and* feeds the kill engine.
**Formations added** — four hand-placed shapes flying in from off-screen, self-telegraphing.
**Cryo became the heal**, the one thing that mended you with the arena still full. (Removed the next day.)
**GLOSSARY rewritten from scratch** — it was describing a game that no longer existed.
*Reverted:* Collapse "flip mid-breath to invert" — a *variant*, not a new idea. The diagnosis stands.

---

## 2026-07-27

### Production-readiness hardening
**Ship blocker:** `const LS=window.localStorage` at top level — merely *touching* that property throws
`SecurityError` when site data is blocked, which aborted the entire script. Dead canvas, no message. That is
how every game portal embeds you.
**Corrupt save no longer bricks boot.** One bad write meant every reload threw, unrecoverable without
clearing site data.
**One bad frame no longer freezes the game forever** — `frame()` now drops a bad frame and keeps looping,
with a **Core Fault** overlay at 8 consecutive faults.
Boss Rush no longer farms the survival best. Folder renamed `pulsar/` → `orbital-crash/`.
**Parked:** touch controls.

---

## 2026-07-21

### The ORBITAL CRASH fork
Forked POLARIS and **stripped the whole meta-progression** — XP, levels, the level-up Offer, keystones,
reroll/banish, the Arsenal shop, the cross-run shard economy. The game became pure arcade survival.
**Added: instant temporary powerup drops** as the only progression.
Then, over the same day: **Anomaly variety** (one boss → a roster of six kinds), the **Anomaly Arena**
practice mode (later Boss Rush), a Monte-Carlo **balance pass**, and the **Emitter/Spiral merge** (roster
6 → 5).
*Caveat that shaped that tuning, and still worth knowing:* the flee-bot **hard-counters** two of the kinds
and reads them at ~0% regardless, so it was only ever a valid proxy for the tracking/dense-fire bosses.

---

## Housekeeping

Doc and comment passes, recorded because they moved documents rather than the game.

- **`04fe3e4`** — split GLOSSARY (present tense) from ROADMAP (dated ledger). GLOSSARY 347 → 275 lines.
- **`f1183d2`** → **`04fe3e4`** — `FACTS.md` was created to hold every tuning number extracted from the
  running game, then folded back in the same day. The spawn-mix table is what survived it.
- **`b8f086f`** — thinned the code comments to what is still true.
- **`dcbc3cc`** — 34 doc drift fixes; the ledger stopped being POLARIS's.
