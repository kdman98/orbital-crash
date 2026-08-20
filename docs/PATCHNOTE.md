# ORBITAL CRASH — Patch notes

What changed, newest first. **The reasoning lives in the commit body** — every entry from `git init`
(2026-07-31) onward has its writeup attached to the diff that made the change, 10 to 156 lines of it
depending on how much argument the change needed. `git show <hash>` is the long version of any line here.

Entries before 2026-07-31 predate version control, so they are the only record of those passes.

Rules that constrain future work — laws, traps, rejected approaches — are **not** here. They live in
[MECHANICS.md](MECHANICS.md), because a dated entry is the wrong place for something you need to read
*before* you edit.

---

## 2026-08-20

### The post-purge calm is halved `v2` `029478f`
Author: *"shorten the calm after purge."* Follows directly from the sweep below — and from the finding
underneath it, that the calm never emptied anything.

`max(6, 10 − act*0.4)` → **`max(3, 5 − act*0.2)`**: the same curve with both terms and the floor halved,
so it still flattens at Epoch X exactly where it used to. Epoch I's 5s opener is not a post-purge calm
and does not move, which is why Epoch I is the only total unchanged.

| Epoch | I | II | III | IV | V | VI | VII | VIII | IX | X | XI |
|---|---|---|---|---|---|---|---|---|---|---|---|
| calm | 5.0\* | 4.6 | 4.4 | 4.2 | 4.0 | 3.8 | 3.6 | 3.4 | 3.2 | 3.0 | 3.0 |
| build | 11.0 | 10.4 | 9.8 | 9.2 | 8.6 | 8.0 | 8.0 | 8.0 | 8.0 | 8.0 | 8.0 |
| storm | 14.7 | 14.4 | 14.1 | 13.8 | 13.5 | 13.2 | 12.9 | 12.6 | 12.3 | 12.0 | 11.7 |
| **total** | **30.7** | **29.4** | **28.3** | **27.2** | **26.1** | **25.0** | **24.5** | **24.0** | **23.5** | **23.0** | **22.7** |

⚠️ **What the calm was *for* is not what its clock controls.** It never emptied anything — it only stopped
*adding*, which is why the field sat flat at 30–70 bodies for the whole phase. The sweep delivers the
emptiness now, so this clock only decides how fast the field **refills**.

⚠️ **Two floors decide the 3, and neither is taste.** The Epoch cue is a **2.6s** animation fired one tick
into the phase, and `intensity` lerps at **τ = 0.71s** (95% closed at 2.1s) — below that the phase never
reaches its target and becomes a label rather than a state. Measured at the moment calm ends: **0.12
through Epoch VII, 0.13 at the floor**, against a target of 0.12.

**The breath survives; only the wait is gone.** The first ~5s after a purge are unchanged — that window
belongs to the sweep, not the clock — and the curves separate only at 8s (10–19 bodies before, 14–30
after). Time under 20 bodies falls from ~12s to ~7–8s. Storm and build untouched.

Two claims corrected because this or the sweep falsified them: `enterCalm`'s *"a deep start gets its own
Epoch's real clock… LONGER, not shorter"* is now backwards, and MECHANICS' *"build floors at Epoch 12"*
was the pre-cut `max(12, 19−act*0.6)` outliving its own formula (it clamps from Epoch **VI**).

---

### Killing an Anomaly clears the board `v2` `6fe49df`
Author: *"let's clear the board (without score) after anomaly kill."*

A white ring travels outward from wherever the Anomaly died and every Dot it reaches dies. **It pays
nothing** — no score, no Motes, no combo, no streak, no Bomber detonation — the same `dead=true` rather
than `queueKill` construction `planetBlast` already uses. Verified on a controlled field where the sweep
was the only kill path: score moved by **exactly `200×act`** and combo by **exactly 0** while 33–72
bodies were erased, 7 seeds of 7.

⚠️ **Paying zero is the anti-farm argument, not tidiness.** A fight leaves **26–75 bodies** standing, a
comfortable multiple of the purge reward at `KILL_SCORE` 20 plus Motes. A sweep that paid would make
stalling a fight while the field fills the highest-value play in the game.

**The ring is the kill boundary, not a drawing near one.** Both run the same ramp over the same `R`, and
`t` is read before it advances so the edge can trail the hoop but never lead it — measured at exactly
**36.7px behind**, one frame at 2200px/s, across 7 purges.

⚠️ **The reach is where a body *will* be, and two guesses died first.** `max(W,H)` misses the far corner
(1280 against a 1509 diagonal). Furthest-body+96 also missed, because `spawnStormSurge` places bodies on
a circle around the **arena centre**, ~370px outside the rect. Even sweeping to the true furthest body
left 2 of 32 standing: a Drifter at 1090 receding at 3.4px/frame gained 115px while the hoop was crossing.
**A margin cannot fix that by being bigger** — the escape scales with the crossing time, which scales with
`R`. Solving for the meeting (`d*SPD/(SPD−vr)`) clears 100% in 7 of 7.

**And the finding underneath the change: the calm was never calm.** Population after a purge, five fights,
against the identical run with the sweep neutralised:

| t after purge | 0.5s | 1s | 2s | 3s | 5s | 8s | 12s |
|---|---|---|---|---|---|---|---|
| **sweep** | 0–2 | 0–4 | 2–6 | 4–9 | 6–13 | 10–19 | 19–38 |
| **none** | 32–69 | 33–72 | 29–69 | 31–67 | 31–66 | 29–67 | 30–91 |

The lower row is flat — `enterCalm` only ever stopped *adding*. The breath now lasts about **8 seconds
under 20 bodies**. Priced in Integrity over the 12s after a purge, 16 paired fights: damage taken falls
**37.1 → 7.8**, a paired difference of **−23.4 ±4.8 SE, t = −4.87**, negative in 14 of 16.

⚠️ **Quoted against an A/A control, because this rig is not fully deterministic.** The same case run twice
repeats exactly 11 times in 16 and drifts on the other 5; A/A gives **−2.9 ±3.0, t = −0.99**. The effect
is ~8× the noise floor and the noise carries no sign. A single arm read naively put the figure anywhere in
the −23 to −29 band.

**Phone arena checked separately**, because the reach argument is entirely geometric: 4 seeds of 4 clear
100% of a 35–94 body field at 800×1732 world units. ⚠️ The sweep runs **0.54–0.82s** there against
0.43–0.58s on desktop and so outlasts the purge's slow-motion — deliberate, since this is a *world* speed
like every other speed in the file, and a CSS-normalised one would travel four times faster relative to
the matter it clears on a phone.

**An open tension, left open on purpose:** an emptier stretch is exactly the complaint `enterBuild` was cut
7.4s for. If the post-purge calm reads as dead air, the lever is the calm clock, not the sweep.

---

⚠️ **EVERY AUDIO ENTRY BELOW LANDED INSIDE A CSS COMMIT, AND NEITHER MESSAGE MENTIONS SOUND.** `b04329e`
("`touch-action:none` on html,body…") carries the drone and storm removal, the anchor, the sawtooth
partner, the pluck bus sweep, the note pools and the deeper heartbeat — 153 insertions on `index.html`.
`809c7ca` ("Set the callout suppression on `*`…") carries the Melody row, its two languages and its
persistence. Both were taken while this work sat uncommitted in the same file, and both were pushed
before it was noticed.
  The precedent is already in this file, from the other direction: `2e73c06` swept in *another* session's
uncommitted whitespace, and the ruling there holds here — **the change is applied and not lost, only
misattributed, and force-pushing a shared branch to fix a message is the worse trade.** So the history
stands and this note is the index into it. `git log -- index.html` will not find these changes by their
subject lines; `git log -S'PLK_POOL'` will.


### A deeper heartbeat `v2` `b04329e`
Author: *"heartbeat should be a little lower or deeper than this but can hear well."*

**The tick owns the apparent pitch, so the sine was nearly free to drop.** Measured as the centroid of
the energy surviving a 300 Hz rolloff: taking the sine 52 → 42 Hz moves the heard pitch **992 → 991 Hz**,
i.e. nothing at all; taking the tick's lowpass 1100 → 700 Hz moves it **992 → 686 Hz**. The sine is what
you feel, the tick is what you hear. Lowering the tick costs survival, and its level buys that straight
back for almost nothing:

| | heard pitch | survives 300 Hz | flat level |
|---|---|---|---|
| before | 992 Hz | −15.9 dB | 0.01854 |
| **now** — 42/35 Hz, tick 700 Hz @ 0.80 | **686 Hz** | **−15.8 dB** | 0.01951 |

---

### A Melody setting, three note pools `v2` `809c7ca`
Asked for as *"diverse pluck note option in-game — none / DEFAB (current) / more?"*

`none` `[0]` — the line stops moving and the bed becomes a pulse; `pent` `[0,2,4,7,9]` — what the game
has always played; `wide` `[0,2,4,5,7,9,11]` — the full major. Both languages, persisted, `.on` marking
the row only when it is off its default.

⚠️ **`PLK_POOL` shipped one commit ahead of the setting that selects it, and survived only on a
fallback.** `b04329e` carries `PLK_POOL[store.plkScale]||PLK_POOL.pent` while `store.plkScale` does not
exist until `809c7ca` — so at that commit the subscript is `undefined`, the `||` catches it, and the bed
plays the pentatonic exactly as before. Checked rather than assumed, because it is on the public remote.

⚠️ **Widening the pool does not add a clash, which is not the obvious answer.** Notes overlap now, so
pairs genuinely sound together, and the worry was the 4th grating against the major 3rd. Measured with
Plomp–Levelt roughness over every pair each pool can produce: the roughest pair in the seven-note set is
**D–E at 0.2025** — the same whole tone already inside the five-note set, at the identical figure. Mean
roughness moves 0.0597 → 0.0604, about 1%. The pentatonic was never protecting anything here. Note
density is unchanged across all three: 262 / 266 / 266 melody notes over ten simulated minutes.

---

### The plucks escalate, and the heartbeat is finally audible `v2` `b04329e`
Author: *"the mechanic that applied to melody that intensified the melody each intensity of game,
would be good to apply to plucks"* and *"heartbeat is still somewhat unsensible."*

**The drone's one good idea was kept after the drone itself went.** What made the old bed feel like it
escalated was not its pitch, it was its filter opening as `intensity` rose; the plucks only ever got
faster and louder, which reads as more of the same rather than as more intense. Three things now climb
together:

| | at calm | at storm |
|---|---|---|
| octave-jump chance | 0.20 | 0.60 *(was a flat 0.40)* |
| sawtooth partner | 0.00 | 0.35 |
| pluck bus lowpass | 1600 Hz | 3500 Hz |

⚠️ **A filter sweep over a triangle is inaudible, and that is why the saw is there.** A triangle keeps
about 97% of its energy in the fundamental, so opening a lowpass over one moves the note's energy share
in 1.5–6 kHz by **+0.0 dB**. A sawtooth's harmonics fall as 1/n against a triangle's 1/n², so the two
together are worth **+13.2 dB** of that band across the range. Spectral CENTROID reports the same change
as 35 Hz and is simply the wrong instrument — anything weighted by energy mass is dominated by the
fundamental no matter what the harmonics do.

**1600 Hz is the calm end because it leaves calm exactly where it already was** (−38.2 dB against the
unfiltered note's −38.0), so nothing is taken away at rest and the whole climb is added on top. Measured
live across the phases, the melody's mean pitch runs 193 → 251 → 283 Hz.

**The heartbeat gets a noise tick, and it is noise rather than a brighter waveform on purpose.** A bare
sine has one partial, so at 52 Hz a small speaker reproduces nothing of it. A triangle would fix that and
land partials at 156/260/364 Hz, inside the 150–700 Hz band `bomb()`'s comment block spent real
measurement keeping clear. Noise separates on TIMBRE instead — the same argument the storm drum used to
make in that block. `noise(0.05, v*0.60, master, 1100)` beside both the lub and the dub takes the layer
from **−39 dB to −16 dB** through a 300 Hz rolloff, for **+0.15 dB** of flat level, and the tick is 3–5%
of the energy, so on headphones the thump is still nearly all of what you hear.

⚠️ **That +23 dB was first measured as +13, and the smaller number was a bug in the measuring
model — not, as first written here, a windowing artefact.** `exponentialRampToValueAtTime` runs from the
value *at the attack's end* over the *remaining* time. A hand-written model that decays from t=0 instead
leaves a **36% amplitude step** at the attack/decay junction, and a step is broadband, so it inflated the
*untreated* sine's high-frequency content by ~15 dB and made the fix look half its size. With the
envelope corrected, the model and an `OfflineAudioContext` render of the real thing agree to **0.4 dB**
on both the treated and the untreated case.

The first explanation offered here — that a 130 ms window could not outrun the highpass's own settling
transient — was wrong, and wrong in the comfortable direction: it exonerated the model. The tell was
available and unread. The two rigs agreed within 2 dB on the *treated* case and diverged by 12 on the
*untreated* one, which points at the signal, not at the filter.

---


### The drone and the storm drum are gone; the plucks carry the bed alone `v2` `b04329e`
Author: *"i dont feel drone and storm drum doing something harmony to BGM"* — then, after the argument
for keeping them: *"drum and drone feels like bad ASMR currently."* Both layers removed, and `ambPluck`
rebuilt to cover what they were doing.

**The complaint was right about the experience and the measurement says why.** Rendering each voice
through a 4th-order Butterworth highpass at 300Hz — a phone speaker's low-end rolloff — the drone
survives at −26dB (calm) to −28dB (storm) and the drum at −25dB, against the plucks' −7dB. The two
loudest layers in the bed were the two that never reached the speaker, so on the target device they
were texture with no part in it. Raising them would only have spent compressor headroom in a band the
speaker does not reproduce.

⚠️ **The drone was carrying the harmony, and deleting it without a replacement would have flattened
the acts.** It was an A+E open fifth, deliberately third-less, and it was the only reason four pluck
roots read as four chords: act 1 (D) a suspension, act 2 (C) an Am7, act 3 (E) landing a major 7th,
act 4 (A) home. Strip the pedal and only the note pools remain — **acts 1 and 4 share four notes of
five, and so do acts 3 and 4**, so three of the four acts collapse into one another.

So the root is now stated by the pluck layer itself. Every fifth note is an ANCHOR: the bare root, a
longer tail, slightly louder — the same harmonic information delivered as an event instead of as a
held tone, which is the whole point, because an event cannot become the hum that got the drone cut.
Forced on an act change as well as on the counter, or a new act would open in the previous key.

**Spacing and decay moved together, and they are one change, not two.** With the drone gone the
plucks are the entire bed, and at the old spacing it was silent nearly half the time. Measured on the
audio seam — same rig both sides, both builds paused so `audio()` feeds a fixed intensity of 0.08, 300
simulated seconds each:

| | before | after |
|---|---|---|
| notes per 300s | 117 | 159 |
| mean gap | 2.55s | 1.89s |
| note length | 1.4s | 2.3s melody / 3.3s anchor |
| mean voices sounding | 0.55 | 1.33 |
| **bed sounding** | **55.0%** | **99.1%** |
| root anchors | none | 20% of notes |

Tails now outlast the gap between notes, so **the overlap is the pad** — a decaying overlap rises and
falls and cannot settle into a steady hum. Density roughly doubles, worth about +3.6dB on the layer,
which is near enough to what the drone contributed that the per-note level is deliberately unchanged.

`STORM_AT`, `stormHit`, `stormT`, `ambGain` and `ambFilter` are all gone; `bus()` drops `stormAt` and
`audio()` reports `ambNoteT` in place of `stormT`. The gameplay storm phase is untouched — it shares
the word and nothing else. `bomb()`'s band-protection comment keeps the heartbeat half of its argument
and loses the storm half, because the argument was never about the storm: it is about which channel a
low voice may claim, and the heartbeat still claims one.

---

## 2026-08-19

### The Charger's arrowhead remembers where it went `v2` `cad5e12`
The hull's heading is state now (`e.ha`), eased toward a target in the step, instead of a three-way
expression evaluated in the draw. Author: *"why does charger changes direction after dash? doesnt affect
game since it enters resting time, but it changes direction."*

**The old expression fell through to `e.ph` below 0.4 px/frame, and `e.ph` is `rand(0,TAU)` stamped at
spawn** — a rotation phase for the Bomber's blink and the hexagon's spin, not a heading. Traced with `ph`
pinned to 108.9°:

| frame | state | source | heading | jump |
|---|---|---|---|---|
| 85 | dash → rest, speed 6.96 | velocity | 170.1° | 0.0° |
| **102** | rest, **speed 0.36** | **`e.ph`** | **108.9°** | **61.3°** |
| 140 | spent, speed 1.43 | velocity | 128.0° | 19.2° |

A parked body has no velocity to derive a heading from, so the target is simply **absent** when nothing
defines it, and absent means hold. It keeps the heading it dashed on.

⚠️ **A second disagreement went with it, and it was never reported.** During the wind-up the hull and the
nose glow read `e.aimx/e.aimy` — captured when the wind *starts*, never updated — while the dashed lane in
the same block draws to the locked point from the *current* position, and the dash re-derives its heading
from that same vector. The two marks pointed at different things for the whole wind-up, and the body flew
the lane's line. All three now show the line the dash will actually fly (verified mid-wind-up: hull 140.8°,
lane 140.8°).

**Eased, with a cap on the step.** The ease is what makes rest → wind → dash read as one movement — the
wind-up becomes the Charger visibly *taking aim* over its 0.9s. The cap exists because an exponential ease
front-loads: 25% of a 180° reversal is 45° on the first frame, measured at 37.4°. `CHG_TURN_MAX` = 0.15
rad/frame is sized against the body's own turn rate (median 1.34°/frame over 337 approach frames, p90
7.21 — both inside it), so the arrow cannot lag a Charger that is genuinely travelling.

Two defects caught while verifying, neither of which a syntax check finds: `nha` reached for a const in a
different branch of the draw loop (a ReferenceError on every wind-up), and the two charger blocks in the
step loop are sequential rather than exclusive, so a re-arming body ran the turn twice and the worst step
went 8.59° → 11.0°. The heading is also wrapped each step — `+=` alone had it at −512° after three cycles.

The **Harrier has the identical defect and is left alone**; its comment claimed "parked bodies keep their
last sensible axis", which is not what `e.ph` does, so the claim is corrected in place.

### The Anomaly hits for 20 on contact, and the ternary that priced the difference is gone with it `v2` `1d9c373`
All four kinds now deal `BOSS_DMG` = 20 on contact. The three older kinds were 30; the Singularity was
already 20 through `DRAW_DMG`, so the two arms of `variant==='singularity' ? DRAW_DMG : 30` became the
same number and the ternary collapsed — two constants agreeing by accident, which is the fault `dc3b242`
is named after, three commits earlier. `DRAW_DMG` retires into `BOSS_DMG`; its IFRAME arithmetic moves
with it unchanged (20 is **not** 20 dps — `IFRAME` is 0.8, so contact is ~25 effective dps delivered in
20-point bites, and the bite is what the player reads).

⚠️ **What the old split was pricing is still true and is now unpriced.** The 30 was priced against
RECOIL: the three older kinds land one hit and break off, so it was one readable hit you could have
walked away from, while the Singularity does not recoil and the same 30 would have been ~37 unanswerable
dps parked on your skin. The recoil difference has not gone anywhere — it is simply no longer paid for,
so at a flat 20 the **Singularity now has the harshest contact in the roster** in dps terms (20 per
`IFRAME` window, continuously) against three kinds that take 20 once and let go. If that needs answering,
the lever is the recoil, not this number. MECHANICS' "do not tidy the dmg back to the shared 30" is
rewritten around that: the surviving half of the instruction is *do not fold this kind into the recoil
branch*, and it carries more weight now than when it was written.

Contact stays **flat across Epochs**, unlike a Dot's — `spawnEnemy` scales by `aDmg` and this does not.
Verified live: all four variants report `dmg: 20` at spawn, and a Star parked on an Emitter takes
20-point bites where it took 30.

### Larger Dots — a setting that grows the hull and leaves the hitbox where it was `v2` `fc8c10e` `v2-ios` `2428dfb`
A Dot's drawn hull is now `e.r + DOT_BLOOM` (3 design units) when **Larger Dots** is on, and `e.r`
when it is off. `ETYPE` is byte-identical either way: **not one line of the stat table is in the diff**,
so contact, annihilation, the spatial grid, ring capture, formation spacing and every telegraph
envelope are exactly where they were. Author: *"can it be only size gets bigger, and hitbox is old one?
… i cant see well, but i dont want difficulty going up."*

**The default reads the device and the player overrides it.** On for a coarse pointer or a short axis
under the 800 reference, off otherwise — *"law 4 doesnt apply to Mobile, like when screen is too small.
but it is now too big for PC/Web."* A stored answer is never second-guessed, the same contract the
language selector keeps. The size test carries `resize()`'s own 0-viewport guard: `Math.min(0,0) < 800`
is true, so an ungated one would hand a default to every desktop that boots through a 0-frame.

The add is **flat, not proportional** — +27% on the Dart against +13% on the Planet, which is the
opposite of what scaling gives and the right way round for a complaint about absolute size. Order and
every absolute gap between species are untouched. It is in **world units, not screen-locked**, so the
hull/collider relationship is identical on every device; screen-locking would make a near miss learned
on one device false on the other.

⚠️ **This breaks law 4 deliberately, and MECHANICS' law 4 is rewritten rather than quietly violated.**
The direction is the defence: a hull drawn *smaller* than its collider kills you before anything
visibly touches you, and this lies the other way — the worst it produces is two discs visibly kissing
with nothing happening. Law 4 already named three silhouettes that overhang (Brute hexagon, Charger
arrowhead, Planet ring) and already called that the forgiving direction. Marks drawn *outside* a hull
may not carry the bloom and do not: the Charger's reticle and the dashed envelope ring stay on `e.r`,
labelled at the point of use. **The Star does not bloom**, so one true edge survives to calibrate
against.

Verified per species on both branches, with the collider bracketed and the hull sampled off the canvas:

| | drawn edge | collider | hits at | misses at |
|---|---|---|---|---|
| off | 11 | 11 | 25.5 | 26.5 and 29 |
| on | 14 | 11 | 25.5 | 26.5 and 29 |

That last column is the feature: 29 is where the drawn discs first touch, and nothing happens there.
The Star reads its own 15 in both rows and is the control that makes the 14 mean anything.

⚠️ **A first pass moved the collider with the hull and was reverted wholesale** — +3 on every `ETYPE`
radius, +8–13% on the contact envelope, and five derived thresholds dragged along with it (the 52px
walkable bound, the 22px self-annihilation floor, the Noose's N<8, the Pulse density bound, the Cross
hub). None of that survives. The measurement that priced it does not survive either and should not be
quoted: a parked pilot at n=12 put the intake change at −5.2 ±18.6 (SE), i.e. nothing findable, on a
pilot that does not dodge.

### The Draw slowed the Star and never touched the target `v2` `43ecd1d` `v2-ios` `db90b96`
The Singularity's speed cap now releases through a ceiling that **opens** rather than one that lifts.
`DRAW_REL` = 60 px/frame per second of elapsed release, applied at the same site in `stepPlayer` the
cap uses. Author: *"stacked movement that was restricted by Singularity are done at once, when the
Singularity's pull is ended, making too much movement instantly."*

**The cap never stacked anything — what accumulates is the gap.** Two of the three input models chase a
target: the mouse's is the cursor, and v2-ios's ABS mode accumulates thumb travel into the same
`pointer`. The clamp slows only the Star, so the target runs for 2.2s while the body crawls, and the
frame the cap lifts the chase spends the whole arrears at 18.5% of a gap that is now arena-sized.

Measured at 1440×900, Anomaly pinned, cursor flicked to the far corner on the first drawing frame and
then held still — the player does nothing except stop moving the mouse:

| | while drawing | release frame | after |
|---|---|---|---|
| 1110px banked | 1.87 px/f | **205.05 px/f** | 7.2 → peak 42.2, 0.68s |
| 346px banked | 1.86 px/f | 63.73 px/f | 7.2 → peak 22.2, 0.38s |
| v2-ios ABS, 521px banked | 1.86 px/f | 96.3 px/f | 8.2, paid over 0.88s |

**The release frame keeps exactly `DRAW_CAP`, and the ramp ends on "the clamp no longer binds" rather
than on a clock** — so there is no step at the release and no cliff at the end of one. A fixed-duration
version was built first and thrown away: 6.2→14 over 0.5s spends 303px, so an 1110px gap still had ~800
left when the window closed and the teleport merely happened half a second later. The rate is set by
the ordinary chase, not the worst case — a 100px gap asks 18.5 px/f, which the ceiling reaches in 0.21s.

⚠️ **The ramp clock is the one piece of Draw state not on the boss**, and the comment forbidding
module-level flags is corrected rather than left standing: a release has to outlive the body that
caused it, and killing a Singularity mid-Draw is the commonest release there is. It carries the
obligation that rule was protecting — one reset site, in `startRun`, beside `settleT`. Verified with
the boss killed mid-Draw (ramp runs, no null read), with a second Draw landing mid-release (snaps back
to 1.87), and with a run restarted mid-release (no residual ceiling).

The ramp **bounds** the payout rather than cancelling it: on v2-ios's ABS mode the Star still ends
where the thumb asked, 0.88s later instead of instantly. Leashing `pointer` to the Star during a Draw
is the lever if the payout itself is ever unwanted. STICK mode banks nothing — it is a rate.

### The link row drops the pill and the hard shadow it was given under the scrim bug `v2` `c5f756d` `v2-ios` `9de953f`
In landscape (`min-aspect-ratio:3/2`) the links carried a `rgba(5,8,16,.62)` pill on `.refs` and a
`0 1px 3px #000, 0 0 10px rgba(0,0,0,.95)` double shadow on `.ref`. Both were added while `#menuScrim`
was painting on top of that row rather than behind it — `da84034` fixed the stacking and deliberately
left these two standing, because removing them is a look change and not a repair. Landscape now uses
the same `0 1px 6px rgba(0,0,0,.9)` as portrait; size, colour and the .62 underline are unchanged.

⚠️ **Portrait is the control group, and it is what settles it.** It has never carried either
compensation, its links sit on the same planet limb, and they read white — so the case for the pill was
already falsified by a shipping configuration rather than by a constructed one. Toggling both off costs
no legibility at 844×390, nor at 780×520, the 3/2 boundary where the layout is tallest and the limb
passes directly behind the row — which is the exact case the retired paragraph was written about.

**The pill was invisible before it was removed.** The landscape scrim sits around .71–.83 behind that
row and reaches .94 at the bottom edge; .62 of black over that does not register in a 1:1 screenshot at
either viewport. The 10px cloud at 95% was the half that cost something — it fattened thin Korean
strokes and blotted out the limb arc wherever a word crossed it.

The clearance an earlier pass bought this row is intact, and was measured rather than assumed, since
the pill's padding went with it and the links drop 4px:

| viewport | link bottom, before → after | gap under the row |
|---|---|---|
| 844×390 | 90.77% → 91.79% | 36px → 32px |
| 780×520 | 93.08% → 93.85% | 36px → 32px |

Both are clear of the 95.4% this row had been bottoming out at, and the 26px the overlay reserves below
it does not move — that is `margin-bottom` plus the safe-area padding, neither of which was the pill.
The same commit corrects the base-rule comment that still said "the two text-only rows have no box to
make opaque" with a single rule under it; `.doornote` was the other row and went with the practice
doors (`e9f7d19` on v2, `71eb905` on v2-ios).

## 2026-08-18

### The tutorial stops showing two numbers it was already throwing away `v2` `9039869` `v2-ios` `178ebca` `ebc2005`
`#score` and `#best` are hidden for the whole tutorial. The mode already declared itself unscored — the
record is not reachable from a tutorial, so its score is discarded the moment it ends, and the HUD was
the last part of the game not told.
  ⚠️ **THE MECHANISM NAMED HERE WAS WRONG AND THE CONCLUSION WAS NOT**, and the correction arrived on
the branch this entry did not come from. This read "written under a guard that excludes `tutMode`";
the best-record write at `index.html` carries no such guard, and what actually stops a tutorial
reaching it is an early `return` in `die()` — `if(tutMode){ endOverdrive(); killQ.length=0;
tutFinish(); return; }` — several lines above. Verified in the merge rather than copied: the v2-ios
entry for the same change carried this correction, the v2 entry that superseded it did not, and
merging the two branches is what put them side by side. Answering the flag `907548e` raised and left
open; author chose hide-during-tutorial.

⚠️ **The collision is caused by the bar's width cap, not by the score, and only one step reaches it.**
Measured at 667x375, ko, gap from `#score`'s right edge to `#tutBar`'s left — positive is clear:

| step | bar width | at cap | score 0 | 20 | 100 | 1,000 | first overlap |
|---|---|---|---|---|---|---|---|
| 1 | 214.4 | no | 180.1 | 152.0 | 123.8 | 85.3 | 1,000,000 |
| 2 | 402.6 | no | 86.0 | 57.9 | 29.7 | **-8.8** | 1,000 |
| 3 | 243.2 | no | 165.7 | **137.6** | 109.4 | 70.9 | 1,000,000 |
| 4 | 235.1 | no | 169.8 | 141.6 | 113.5 | 75.0 | 1,000,000 |
| 5 | **540.0** | **yes** | 17.3 | **-10.8** | **-39.0** | -77.5 | **10** |
| 6 | 394.9 | no | 89.9 | 61.7 | 33.6 | **-4.9** | 1,000 |

Step 5's line is the only one of six long enough to hit the 540 cap; a capped bar is pinned at
(667-540)/2 = 63.5 while every narrower one is centred far to the right. Steps 2 and 6 also overlap
from 1,000 — step 2 precedes the kill step so it sits at 0 in any real run, and whether a tutorial
reaches 1,000 by step 6 is not established here. Step 5 is the only one that collides at a score the
tutorial **guarantees**, which is the one the repair rests on. ⚠️ **And there it is guaranteed
rather than reachable**: step 3 gates on five kills at `KILL_SCORE` 20 with no `tutMode` guard on any
`score+=` site, so nobody arrives at step 5 below **100**, and the 17.3px-clear zero column cannot occur
in a real run. Minimum real gap **-39.0px**, with `#tutBar` at z-index 6 over the HUD's 5 — covered, not
blended. `#best` needs a five-digit record *and* a returning player; `#score` needs nothing.

Landscape-only, which is why it survived: in portrait `@media (max-width:560px)` moves the bar to
top:112, clear of both stats. Verified with the fix disabled — `#score` -39.0px, `#best` -8.7px — because
a check that cannot produce a red has not been shown to detect anything.

⚠️ *Two mechanisms were asserted for this before it was measured, and both were wrong: "step 3 asks for
five motes, reaching 25" (motes are shed BY kills and cannot arrive first) and "it lands on the first
kill of step 3" (step 3 clears by 137.6px). The conclusion held both times; the route did not.*

### The Bestiary stops being reachable by iOS, in the two ways it still was `v2` `51204ca` `v2-ios` `af20d79`
Double-tapping the roster raised the iOS selection loupe, and the Dynamic Island sat on the first card.
One cause for both: `bestiary.html` is a **separate document** loaded as an `<iframe>`, so nothing
index.html sets on its own `html,body` applies to it — not `user-select`, not `touch-action`, and not
the parent's `user-scalable=no`, which governs page zoom and says nothing about gestures inside a
subframe. Meanwhile `#bestiary` carried an inline `padding:0` that wiped `.overlay`'s three
`max(22px,env(safe-area-inset-*))` lines.

Measured in the shipping WebView, iPhone 17 Pro, landscape 874x402:

| | before | after |
|---|---|---|
| frame body `user-select` | `text` | `none` |
| frame body `touch-action` | `auto` | `manipulation` |
| selectable characters | **1294** | **0** |
| `#bestiary` padding T/R/B/L | 0,0,0,0 | 0,62,20,62 |
| iframe rect inset T/R/B/L | 0,0,0,0 | 0,62,20,62 |
| ✕ from raw edge | 16px | 62px |
| page still scrolls | yes | yes |

`manipulation` rather than index's `none`, because this page scrolls and `none` would end that. Sweep
across all three safe-area classes — iPhone SE 3 (`env` 0, no notch), iPhone 14 Pro Max (59px), iPhone
17 Pro (62px) — no horizontal overflow anywhere, and every value on SE 3 returns to the number the
design was built on, which is what the `env()`-only rule was for.

Selection goes on the standalone web page too, not only in the frame. Records, Skins and Settings were
already unselectable by living inside index's `html,body`; the Bestiary was the one reading room where
text could be selected, and the only reason was which document it happens to live in.

## 2026-08-14

### The clearance proved for the tutorial bar was portrait-only `v2` `907548e`
Comment only, no behaviour. `8027466` argued the bar's clearance survives because `#best` ends at y104
and the bar starts at y112 — true exactly where it was measured, and written as though general. ⚠️ **In
landscape `@media (max-width:560px)` never fires**, top stays 58, and the bar straddles `#best`'s
y 74-104 outright: the vertical gap the argument rests on does not exist there. What separates them is
horizontal and only conditionally, the bar being pinned at x63.5 by its 540 cap while `#best`'s right
edge grows with the digits. At 667x375, ko: **0 -> 25.0px clear · 5,165 -> 0.8 · 48,320 -> -8.7 ·
1,204,880 -> -32.5**. Not a regression from the type bump — a cap is a width, so a long string pins the
left edge at any font size — but the bump widened the exposure from 3 of 28 cases on the cap to 8 of 28.
Left as found and flagged to the author, since every repair is a layout decision with a visible cost.
Also recorded because nothing in portrait would warn you: `#pauseBtn` starts at x617, so the bar clears
it by 13.5px, and raising the cap past 567 slides the bar under it. *(The flag was answered on 08-18 and
the fix is `9039869`; the `#score` half, which is worse and guaranteed, was not in this analysis.)*

### The tutorial reads 23% larger `v2` `8027466`
The bar's four type sizes move together — sentence 13->16, step counter and live note 11->14, the beat's
checkmark 13->16. Author asked for at least 20%; the smallest is +23%. ⚠️ **The rule that would have
blocked it was already broken.** The comment above it promised "none of the six wraps to three lines at
375px", and that was false at the shipping 13px: measured in the real element at a real 375px viewport,
`tut.2.ok` renders three lines and had done so for as long as the string existed. A stale claim taken at
face value would have vetoed a change it never governed. The whole cost is `tut.5` — the longest
instruction in the game — joining it at three lines; nothing else changes line count and nothing reaches
four. Height was the thing worth checking rather than wrapping, the bar hanging over live play on a
phone: worst case 118px tall against 81, occupying y 112-230 of an 812px screen, with `#best` ending at
104 so the clearance above is untouched. Pacing does not move with size — `readS()` counts words and
syllables, never lines or pixels — and nothing in the JS reads the bar's geometry, so a taller box cannot
feed back. ⚠️ *The commit records "Oracle `b713a7`, unchanged" and that figure certifies nothing —
the fold producing it was never committed, so it is not reproducible; see the note in `.oracle.js`,
which measures the same suite at `6af5363e`. Repeated here as what was claimed, not as evidence. The
argument that holds is that the edit is CSS-only.*

### "Left half" was true only at the default `v2-ios` `ecf1599`
The touch legend and the tutorial named the move zone a **half** in both languages. That was accurate
the day the partition shipped — `ZONE.x` was `vw*0.5` and nothing moved it. Then the sensitivity slider
shipped, and it works *by moving that seam*: `vw*min(0.85, 0.5*100/sens)`. Measured at 767px across the
five stops, the move zone runs **50.0 / 55.6 / 62.5 / 71.4 / 83.3%** of the width — so at 60% the "half"
is five sixths of the screen and the two "quarters" are 16.7%-wide strips.

⚠️ **The word was wrong for exactly the players who went looking for the setting.** Everyone on the
default read a true legend; only someone who had already decided the steering needed adjusting saw the
lie. Now *Left side* / *왼쪽*, true at every stop, and it costs nothing to say: the seam is not drawn, so
"half" was never a claim a thumb could check. The right-hand rows are untouched — those zones stay on
the right at every stop.

Two claims that had outlived their arguments went with it. The `sensRange` handler justified `input`
over `change` by saying a player could **watch the seam widen under their thumb**; `ZONE.x` is read by
`stickSet`, `zoneOf` and the probe and is drawn by *nothing*. `input` is still right — the value is live
the moment you let go — but its stated reason was fiction. That same absence is why `set.sensD` keeps a
second sentence where every sibling row makes do with one: it carries information with no visual form,
which [MECHANICS](MECHANICS.md) had already said out loud and the panel now records. And MECHANICS still
called the zone **"a virtual stick"** two rewrites after the stick was retired, while the string-table
comment credited "the stick" for not parking the thumb on the star — a property of the zone being
narrower than the screen, not of any steering model. Which makes the 85% cap load-bearing twice over:
it is also what keeps `TOUCH_LIFT` retired.

Found by opening the settings panel after merging `v2`'s contrast pass, which bumped `.setrow .sd` from
11.5px to 12.5px and made the row long enough to look at.

### The scrim was painting over the menu, not behind it `v2`
`#menuScrim` goes to **`z-index:-1`**. It was `0`, and a *positioned* element at `z-index:0` paints in a
later layer than a non-positioned block — so the backdrop whose entire job is to darken the key art was
being drawn **on top of** `.titlewrap`, `.btn`, `.doors` and `.refs`, every one of them a plain in-flow
block. At the bottom stop of the landscape ramp that is `rgba(4,6,14,.94)`: **the four entry links were
being read through 94% black.** Nothing was ever wrong with their colour.

⚠️ **The tell was on screen for two passes before it was read.** `.contact` looked *brighter* than the
links while being `#8494ba` against their `#eaf2ff` — not a subtlety, a contradiction. `.contact` and
`.langsel` are `position:absolute`, so they land in the scrim's own layer and, being later in the DOM,
paint above it. They were the only menu text never washed, and therefore the only two whose numbers
were honest. What finally settled it was painting three links `#ff0000`/`#ffffff`/`#00ff00` inline and
screenshotting: **pure red rendered as a muted dark red**, which no colour theory survives.
`getComputedStyle` reported `#eaf2ff` for all four throughout — *including the ones carrying an inline
red* — because computed style goes stale in a hidden pane. The screenshot was the only witness that
could not be argued with.

`829eb7a`'s subject claims *"the links come up in front"*. It added a `rgba(5,8,16,.62)` pill behind
them and **no stacking change at all**, so the pill paints in the links' own layer and was washed with
them. A symptom was decorated. That pill and the `text-shadow` on `#menu .ref` are both compensations
for this bug and can probably go now — left alone here, since this commit is the cause and removing the
plasters is a separate call.

With it, on the author's call: **`.ref` is true white at every viewport**, not only inside the
`min-aspect-ratio:3/2` branch, with the underline lifted `.24 → .55` so it does not read as switched
off under `#fff`.

Oracle `b713a7`. Checked at 844×390, 780×560 and **400×290** — the last because at `dpr:2` that is the
only viewport whose screenshot returns at 1:1 device pixels instead of a 0.51 downscale that was itself
greying the evidence.

### The reading rooms take the brighter `--dim`, and the multiplier was the real defect `v2`
Reverting the white sheet put the small grey text back on a near-black panel, so the complaint the
sheet was built to answer came back with it. The narrower answer is one rule —
`#records,#skins,#settings,#bestiary{--dim:var(--dim2)}` — because `--dim` is not wrong, it is doing
**two jobs**. Over the playfield (`.stat .k`, `#combo`, `#time`, `#best .v`) it is correct and
deliberately quiet: that text sits beside a live game and its neighbours are lit. Inside a panel there
is no live game and no lit neighbour, and the same value is just grey on black. Scoped by ID, so the
HUD cannot be caught by it — verified after the change that `#hud`, `#pause` and `#dead` still resolve
`--dim` to `#68789e`. The two run-overlays are out on purpose; they answer to the field.

⚠️ **The `opacity` multipliers were doing more damage than the token**, and three more rules carried
the one `.contact` had. Every stacked instance measured **worse than the raw token**:

| | was | now |
|---|---|---|
| `.skinreq` unlock text | **2.86:1** @10px (`--dim`×.72) | 6.67 @11px |
| `.skincat` category | **3.01:1** @10px (×.75) | 6.67 @11px |
| `.depthlab` Epoch label | **3.01:1** @10px (×.75) | 6.67 @11px |
| `.acvfl` flavour | **3.58:1** @11.5 (×.85) | 5.04 @12.5 (×.85 kept) |
| `.setrow .sd` description | 4.59:1 @11.5 | 6.67 @12.5 |
| `.sw` switch label | 4.59:1 @11 | 6.67 @12 |
| `.rcT .c.d` cause | 4.59:1 @11.5 | 6.67 @12.5 |

`.skinreq` at .72 composited to `rgb(96,108,138)` — **darker than the raw `--dim`** — on the line that
tells you how to unlock what you are looking at. `.acvfl` keeps its .85 because there italic and size
already carry the rank; on Skins the multiplier *was* the rank, and it had pushed one text under the
floor to make a distinction two other properties could have made for free.

⚠️ **`.depthlab` is on the menu, not in a panel**, so the scoped rule cannot reach it and it is written
out separately. It is invisible in review because `#depthSel` is `display:none` until a second Epoch is
unlocked — latent rather than absent, at 3.01:1 on a control the player has just earned.

bestiary.html takes the value as a **literal**: it is a reading room living in an iframe, where no rule
from the parent reaches it. Its header comment claimed the tokens matched index.html *exactly*, which
stopped being true the moment index's `:root` and index's panels diverged.

Oracle `b713a7`, bit-identical. Zero overflow on the skin cards and no horizontal overflow on Records
after the size bumps.

### The service worker had been serving the first key art since the day it was replaced `v2`
`CACHE` is `orbital-crash-v4`. It should have moved twice already: `5670cb0` and `ac23e56` each
**replaced** `art/keyart-wide.webp` — 62048 → 70788 → **42984 bytes** — while the `SHELL` list stayed
identical and `CACHE` stayed at v3. Everything below the document branch is served **cache-first**, and
`activate` only deletes caches whose key differs from `CACHE`, so any client that installed the worker
before those commits keeps its copy of the superseded art **permanently**, with no error and nothing to
notice. The comment said *"bump when the shell changes"* and was read as *"bump when the list changes"*;
it now says the bytes.

Not cosmetic: `ac23e56` re-exported at native size, so the stale copy is exactly the upscaled one that
commit exists to stop shipping. ⚠️ Found by accident, and the accident is the lesson — clearing `caches`
for an unrelated reason changed the artwork on screen, which means **every menu screenshot taken before
that was of superseded art**. No player is exposed today (Pages serves `master`, which carries no art),
so this is latent rather than live, but it would have shipped with v2.

### The reading rooms go back to dark, and the two texts that were failing were in the corners `v2`
RECORDS, SKINS, BESTIARY and SETTINGS spent part of a day as a white sheet, on the author's call, and
are the near-black panels again on the same authority. Nothing in that argument was wrong — the
reserved hues really are emissive and really do measure 1.26–1.58:1 against white — the direction
changed. Reverted rather than unpicked by hand, because four of its edits are load-bearing in the dark
theme: the panels' `rgba(4,6,15,.97)` had **moved out of their inline styles** into the `.sheet` block
(drop the class alone and all four go transparent over the playfield), `#bestiary` lost its
`backdrop-filter:none` the same way, the Records table had been rewired off the literal `#c3ccdb`, and
bestiary.html's wordmark ramp was inverted for paper — invisible on a dark page.

**The brightness half.** Sweeping every text node in `#menu` with the backdrop **composited** instead of
assumed — key art sampled per-pixel through its own cover math, then the `#menu` radial, then
`#menuScrim`, then any element background — put the **contact line at 2.31:1** and the **inactive
language button at 3.63:1**, both under the 4.5 floor. Now 6.64 and 6.12. Those two numbers are sound:
`.contact` and `.langsel` are `position:absolute`, so the scrim genuinely is behind them.

> ⚠️ **CORRECTION (same day, see the scrim entry above).** This entry originally reported the
> 기록/외형/도감/설정 row as "already at the ceiling" at **18.2–19.7:1**, and said editing it would
> change nothing visible. **That was wrong, and it was the author's actual complaint.** The sweep
> composited `#menuScrim` as a *backdrop*; for every non-positioned block in `#menu` — the links, the
> wordmark, the buttons — it paints in **front**. The links were being read through up to 94% black.
> The model was measuring an assumption about paint order, not the screen, and it returned confident
> four-figure numbers while doing so. Left in place rather than quietly edited out: a patch note that
> silently swaps a false measurement for a true one teaches nothing about how the false one was got.

Both were `--dim` used with **nothing beside them**. `--dim` was drawn for labels that sit next to the
thing they label, where the neighbour carries the contrast; alone in a corner over key art it stops
being quiet and becomes a rumour. The contact line was worse than its number because it stacked
`opacity:.6` *on top of* `--dim`. `--dim2` (`#8494ba`) is the rung between `--dim` and `--ink`, a token
rather than two literals because both sites want the same thing for the same reason; `--dim` itself is
deliberately not lifted, since 32 of its uses are the second half of a pair where dimness is the point.

⚠️ **The rank is preserved, which a contrast number alone would have broken.** Both lifted texts still
sit under ORBITAL at 7.92:1 and under every control, so they moved from illegible to quiet, not from
quiet to loud. `.ref` was left at 13px outside the 3/2 branch on purpose — the comment above it records
a measured fit (348px of English against 331px of usable width on a 375px phone) and a size bump
reintroduces the wrap the tracking was cut to fix.

Oracle `b713a7`, bit-identical. Checked at 844×390 and 1024×768. ⚠️ **v2-ios still carries the light
theme** and needs the same revert, or the two builds disagree.

## 2026-08-12

### The Singularity, tuned by playing it — seven passes, and the rig missed most of them `v2`
The kind shipped and then got fixed, and the shape of the fixes is the entry. **Six of the seven were
reported by a player, not caught by a harness**, and each one measured cleanly right up until somebody
looked at it. Grouped, newest first:

- **The entrance stopped charging.** `SING_ENTRY` was clamping the *horizontal* tracking as well as the
  dive, so it closed diagonally at 4.81px/frame — **5.34× the amble, flat, then an instant drop.**
  Sideways is clamped to the walk and the dive decays into it: 3.52 peak, settling smoothly.
  *"singularity is too fast when spawned. is this bug or my mislook."* Not a mislook.
- **The wind-up raises the danger badge**, replacing a converging ring and inward streaks that were
  geometrically honest and unreadable. *"just give danger sign on wind-up, not geometric lines."* A
  telegraph **names**; it does not illustrate. `dangerBadge` is extracted so the symbol has one copy.
- **The integrity bar stopped telling you to dodge it.** The Draw runs through `b.hunt`, so it matched
  the generic hunt branch and read *IT IS GOING TO RAM YOU!* for its whole duration. It does not ram.
- **Recovery halved**, and the constant that was too long was not the one that looked it: ring outage ran
  **2.20 / 3.07 / >5s** against a 1.2s window, because the return trip dominates. Halving the hold gave
  **1.12 / 1.68 / 1.12s with the impulse bit-identical**.
- **The push got stronger** (2.8 → 4.4), then **twice as frequent** — a third of which came free, because
  the countdown was gated on no-wave-in-flight and the crossing time was being charged to the cooldown.
- **The front travels.** It was an instantaneous disc with a fast ring beside it: cause and effect on the
  same frame, from two objects that merely agreed. *"oh what happened?" "um it was pushed a bit i think?"*
  The ring is drawn from the front's own radius now, so it cannot disagree.
- **The front is white.** Drawn in the boss's hue it claimed a polarity it does not have and was read
  exactly as written — *"push away ALL dots, not only same color."* It always did; the picture lied.

⚠️ **Two rig faults worth more than any of the tuning.** The game's **service worker serves a stale build
to every reload**, and a cache-busting query does not help because the worker answers first — three
reloads of an edited file measured the old code. It was caught only because the stale values happened to
be strings that appeared in the output; a physics change would have returned clean, plausible numbers
about the wrong build. A **new-code marker** is now standing procedure. And `e.seek=0` **does not make a
Dot inert** — `LIKE_GRAV` keeps acting on same-colour matter, so zeroing seek silences one colour and not
the other and manufactures the exact colour asymmetry a colour test is looking for.

### The fourth Anomaly restricts movement, and one clamp makes that mean the same on a mouse and a thumb `v2`
The parked `bossBody` arm is reachable at last. **The Singularity** ambles at you forever, breathes matter
off itself with the **Wind**, and periodically **Draws** — a speed cap plus a tax on retreating, while it
closes. Its verb is restricting movement, so the thing that kills you is the **field**: the other three
kinds ask where you are standing, this one asks whether you can still get there. It **throws nothing**,
which is how it clears the roster ceiling rather than waiving it — the old argument was that a fourth kind
firing aimed shots from a hover is the Emitter with a gimmick, and that is still true, so this one is not
on that axis at all. Contact is 20 rather than 30 and it is the only kind that does not recoil; those two
are one decision, not two.

⚠️ **The Draw is a cap rather than a force, and that is what makes it portable.** Retreating, a mouse at a
wide pointer gap moves **92.3 units/frame and is unbounded**, a thumb at full deflection **14.00** and is
hard-capped — because one is a position control whose restoring force grows with the gap while the hand
does nothing, and the other is a rate control with nothing left to give. A pull sized for a phone is
invisible on a desktop. Clamping the frame's *total* displacement is what makes "the player's top speed"
a defined quantity at all, and it is the only reason the retreat tax can be a ratio. Measured after:
**1.860 on both devices, a 1.00× gap.** The clamp is therefore a prerequisite for any future force on the
Star, not an alternative to one.

⚠️ **Three faults, each found by measuring rather than reading, and each already answered somewhere in the
repo.** *Clamp-before-tax* was dead code that measured identical — every raw displacement is above the
cap, so taxing first removes a share of a number the clamp discards, and it would have bitten only below
the cap, taxing gentle movement and leaving full-speed retreat alone. *The Wind did nothing* (14.5px at
r=60, against a 26px contact) because it left seek running — which the Fling's own entry in MECHANICS
already forbids in as many words; it now takes the existing `e.flung` path and measures 98.3px. *The push
drew itself pulling*: `spawnRing`'s default converges, and a converging ring is already this game's word
for **arrival** — the danger sign and the mine's arming ring both mean it — so the cue was borrowing the
vocabulary of its own opposite. Author: *"push telegraph is pulling."*

`inhale` and `release` were **orphans** in the sound bank, defined with no call site anywhere. Taken as
the kind's matched pair, which is what the sound rule prefers over two variations on one idea.

**Proven inert until a Singularity spawns:** ambient / emitter / sentinel / bastion × 2 seeds × 900
frames, all 8 bit-identical to the pre-change build. That needed the two new `rand()` calls guarded on
the variant — unconditional in the shared boss literal they drew from the seeded stream on *every* spawn
in the game and moved all three existing kinds.

### The Singularity gets an entrance, because the amble was still above the HUD floor when the clamp armed `v2`
Reported as a teleport at the start of the fight, and it was: **111.6px in one frame, at frame 96 =
1.600s exactly**, against the Emitter's 3.4px. `stepEnemyForces` clamps `boss.y` to ≥138 once
`bossTime > 1.6`, and its comment says it runs *"once its entrance dive is done"* — an **assumption about
every kind rather than something it tests**. The Emitter and Bastion sit at y≈141 by then so it is a
no-op for them; the Singularity ambles at 0.9 and was at y≈13. The amble was doing two jobs and is only
good at the second: it now has an entrance, and only ambles once on station.

⚠️ **The entry drives `y` at a fixed rate rather than easing toward the Star**, because an ease has no
guaranteed vertical component — with the Star high and off to one side the approach is nearly horizontal
and can still be short of the floor at 1.6s. Verified position-independent: 3.4px max frame delta at three
Star positions including that worst case, floor cleared at frame 58 against a guard arming at 96.

⚠️ **It reproduces only in real play, which is why it shipped.** `bossTime` advances inside `director()`,
so a harness calling `spawnBoss` directly never arms the guard and traces a perfectly smooth walk — eight
times. The rig agreed with itself while measuring a state the game does not run in. ⚠️ **And the margin on
the existing kinds is four frames**: the Emitter clears 138 at frame 92. Nothing is wrong today and
nothing warns.

### The Sentinel throws two patterns on one beat, and never both at once `v2`
It had **one** firing routine and had never had more — `firePincer` on a free timer, no branch, no
alternation, no Epoch escalation past one extra Dart. It was also the only Anomaly whose fire **never
aimed**: `hexRot += 0.7` is a blind 40° precession with no term for where you are standing. The seeker's
own homing hid that for months, because the missile corrects for a launch bearing that means nothing.

**The swarmer trail is out, and the orbit screen replaces it** — five nodes that open to 340px, ride the
boss for 3.2s, then sling off on the tangent. The trail's defence was *"half threat, half ammo"*, but
`doSpawns` never pauses for a boss and already leans 65% to the Anomaly's opposite colour, so it topped up
a supply that was never interrupted. As a *pattern* it asked nothing the ambient swarm was not asking.

**One inner timer.** `fireT` is the only firing clock; `pinLeft` (rolled `irand(1,3)`) counts the pincers
owed before a screen, and a screen consumes its own duration out of the next gap. ⚠️ **The first version
kept two timers and had the screen suppress seeker fire — and that measured perfectly, zero seekers born
during any screen, and was still wrong.** Suppression only stops the pattern that has not started; a
seeker fired 0.2s before a screen opens is in the air for its whole 9.6s life. Author: *"Two patterns are
done together currently."* The question was never what the timers allow, it was what they schedule.

Seeker tracking 0.85 → **1.45** (turn authority 160° → **274°**), and the arena orbit rate now wanders in
`[0.40, 0.50]` instead of sitting on 0.40.

**The hunt telegraph was lying, for one kind of three.** The dashed line to the Star is true of the
Emitter and the Bastion — they hunt with `b.x += dx/d*s`, literally that line. The Sentinel spirals and
never flew it. It now draws the **circle it is actually coming around**, collapsing to contact.

Measured, 300s, boss pinned, Epoch II pace: **24.0 seekers/min** (23.3 before any of this, 14.8 at strict
alternation) · screen every **10.9s** · **0** pincers launched during a live screen · min gap between any
two patterns **2.0s**. ⚠️ Two estimates came in low and both had one cause: a deferred screen fires a
pincer *without* spending `pinLeft`, so hunt deferrals add pincers on top of the roll. `SEN_PIN` must be
measured, not solved.

⚠️ **`2e73c06` carries two blank-line deletions in `formComet` that are not mine.** They were another
session's uncommitted whitespace tidy, and I swept them in by finishing with `git commit --only
index.html` — **`--only` takes the content from the WORKING TREE and silently discards what you staged**,
so a carefully filtered index counted for nothing. The commit was pushed before I noticed, so it stands
rather than being rewritten: force-pushing a shared branch over two blank lines is the worse trade. The
change is applied and not lost, only misattributed. *Use `git add` + a pathless `git commit` when
splitting a contended file; `--only` and `--include` both re-read the working tree.*

### A Neutral sheds both colours, and the Comet announces itself `v2`
**A Neutral drops one red Mote and one cyan.** It wears both poles and is the one Dot the colour law does
not reach, so *"the colour of the Dot that died"* has no single answer for it — one of each is the same
rule every other species follows rather than an exception to it. It used to shed **nothing**, which was
the other way of answering an unanswerable question and made the only Dot you kill with a reversal the
only Dot that paid no loot for it. It is now also the one drop that **cannot be the wrong colour**:
ordinary Motes carry the dead Dot's charge, so through hold-a-pole play most sit inert, while a Neutral
always leaves one you can hoover on the polarity you are already holding.

**The Comet is telegraphed** (`COMET_TEL` 1.1s) — and it is the arrival that most needed it. The Drift's
note has long said every other spawner *"is fair by geometry (off-screen, past the corner, from an edge)
and so never needed a warning."* The Comet is off-screen too, and that is precisely what made it unfair:
at `COMET_SPD` **7.6**, four times a Drifter's cruise, off-screen buys about **0.2s** where an ordinary
arrival gives a second. **Distance is only fair when it converts into time.**

⚠️ **A lane, not a point, and that chose the primitive.** `warnSpawn`'s converging ring answers "a body
will be *here*", the wrong question for a threat whose shape is a line across the arena — and five point
marks along one edge say nothing about where any of them is going. `warnForm` is right for the same
reason the Cross uses it: the shape draws its own mark **and owns its own spawn**, so the geometry is
solved once and the lane drawn comes from the very numbers the bodies will fly. **A sign computed
separately from the thing it promises is a sign that can be wrong.** Band at the true contact envelope
(`ETYPE.heavy.r + P.r`) per the danger-edge law; dashes travel along the heading, because a static line
states a place and omits the half you act on. The lead resolves at telegraph time, so a shower arrives
aimed where you stood ~1.1s ago — move once the lanes are drawn and you have dodged.

⚠️ **The oracle cannot certify this.** Both changes add and move `rand()` calls — a Neutral consumed none
and now consumes six, and the Comet's draws are resolved a beat earlier — so the seeded stream shifts and
fingerprints move without any behaviour regressing. That is the documented property of any change that
adds or removes an RNG-consuming call, not a regression.

### The caution is raised when the pattern fires, not derived from the comets `v2`
⚠️ **Four versions of this sign flickered and every one failed the same way.** The mark was recomputed
each frame from a set that changes each frame — which comets are alive, which are still off-screen, which
group is "first", which shower owns a side. Each fix removed one source of churn and the next
frame-derived quantity took over. **There is no stable answer down that road, because the inputs are not
stable.** Author: *"can we show caution sign when initiating pattern, not comet-based?"*

That is the correct object and a **smaller** one. A caution is raised once at `formComet` with a
position, a heading and a clock — the same shape as `warnSpawn` and `warnForm`, and the third member of
that family. Nothing recomputes it, so nothing can disagree with it. One per side, by **refresh** rather
than grouping: a second shower on the same border re-arms the existing mark instead of adding one.

Deleted with it: `cometSeq`, the per-body `e.sgn` stamp, the warn's `w.sgn`, the two-source grouping pass
and `drawCometLanes` — every mechanism that existed to make a derived value hold still.

**The lifetime is solved, not guessed:** `COMET_TEL + tFirst + CAUTION_FADE`, `tFirst` being how long the
earliest-arriving member takes to reach the border. Over six runs the first body becomes visible at frame
66–93 and the caution expires at 94–123, so the sign outlives visibility by ~30 frames every time — the
blind-gap property from `27300ca` survives the rewrite.

Measured: 480 frames, ten patterns through one run — **max 3 signs, zero reversals**, clears at the end,
and **zero position changes** across a caution's 108-frame life.

*One test of mine was wrong before the code was:* a first pass reported 33 blind frames, which turned out
to be counting comets **leaving** on the far side, where no warning is owed. The direct measurement above
replaced it.

### The telegraph drew its own sign, so overlaps flickered `v2`
The last one. `formComet`'s `warnForm` called the mark **directly** — one sign per *warn*, outside the
per-side grouping — so a shower still telegraphing and another already flying on the **same side** each
drew a badge, and the pair collapsed to one the instant the second spawned. **Two marks, then one, at
every overlap**, which is why it only showed once several comet patterns ran in a single session.

`drawCometLanes` now walks **both** sources in one grouping pass: pending warns and live bodies. The
warn's alpha is its own progress — 0 at the announcement, 1 at arrival — which is exactly where the live
side's alpha starts, so the handoff meets at the same brightness with no step.

⚠️ **There is now exactly one `cometSign` call site, and that is what makes the measurement mean
anything.** Signs drawn per frame therefore equals the number of side entries, so counting the grouping
counts the drawing. Measured over 400 frames with ten showers fired through a run so telegraphs and live
crossings overlap constantly: **max 3 signs, 20 set changes, zero reversals.**

*Diagnosed from a 3.8MB Save-Page-As capture, which could not show the flicker — the sign is on the
canvas — but did settle the question that mattered: it carried `sides=new Map()`, `cometSeq` and
`SIGN_R=23`, confirming the report was against the current build and not a stale one.*

### One sign per border side, not per shower `v2`
Ten comets fired back to back put **ten badges on the border.** Per-shower grouping was the fix for the
original flicker and it created the opposite failure: a wall of marks instead of a warning.
⚠️ **The side is the right grain**, because it is the read the sign exists to deliver — *comets, from the
right* — and two showers entering stage right are one fact to the player, not two. At most four signs now,
however many showers are in the air.

The side is recorded **before** the inset clamp: every crossing lands exactly on a border, so the
un-clamped coordinate says which one, and after clamping a corner entry is indistinguishable from a
mid-edge one. ⚠️ **The side's representative is chosen by announcement `id`, never by position in
`enemies`** — that is the whole lesson of the first flicker: any ordering derived from the entity array is
re-derived every frame and changes under you. Lowest id is the earliest-announced group still live on that
side, so the mark holds still while that shower lasts and moves only when it finishes.

Measured with **ten showers airborne across three sides**, entity array churned by a kill every fourth
frame over 120 frames: **three signs at once, four set changes, zero reversals** — the set only ever
shrinks as a group finishes, which is the signature the flickering versions did not have.

### Two showers, two signs — and the mark is bigger `v2`
⚠️ **`6724ab2` carries someone else's change and does not mention it.** Of its 202 added lines, about
**seven** are this entry's; the rest is the Epoch cue and the `--grantop` grant overlay, swept out of a
shared working tree by a `git add index.html` and pushed under a subject about comet signs. Nothing was
lost or broken — but `git show 6724ab2` is not the long version of *either* change, and the Epoch cue has
no commit body at all. Read this entry for the sign, and the *Epoch cue* material in MECHANICS for that.
*The rule this broke is already in this repo twice over:* an explicit path takes every hunk in the file,
so a contended file is staged hunk-level or not at all. What disarmed it was a `git status` run minutes
earlier showing only my own files — **true when it ran, false by commit time**, which is the very hazard
the check exists to catch. Run it inside the same block as the `git add`, and never let "this edit is
small" decide the staging method: the method guards against the *other* session's write, whose size has
nothing to do with yours.

⚠️ **The live renderer took the *first* anchor it found in `enemies`.** With two crossings overlapping,
that picked whichever group came first in an array whose order changes as bodies spawn and are culled —
so the single badge **flickered between the two crossings**, and carried the brighter of their two alphas
into whichever it landed on. Members of one shower share the same `sgn` **object**, so grouping is by
object identity and needs no id; each group now keeps the brightness of its own furthest member, so a
shower nearly on screen does not ride on one just announced. Verified with two overlapping showers and
the array churned by kills: two anchors on opposite edges, and the drawn set only **shrinks** as a group
finishes — it never alternates.

**`SIGN_R` 17 → 23**, and every dimension now derives from it — arrow offset, arrowhead, streaks, bang,
and the `cometEdge` inset (`SIGN_R*4`). The previous resize meant re-finding each by eye, and the inset
is the one where being wrong is invisible on three of the four entry sides.

### The warning sign stops walking, and it is brighter `v2`
⚠️ **The anchor was the mean of whichever members were still off-screen *this frame*** — so it moved every
time a comet entered the arena or was destroyed, which means it moved **fastest exactly when the player
was busy killing them.** A sign that moves is a sign you have to re-find, and the whole value of this one
is that a single glance suffices — only true if the second glance lands in the same place. It is now
solved once when the shower is announced, stamped onto every body (`e.sgn`, one shared object) and read
back, so members leaving cannot shift it. Verified across 3 kills and 40 frames of flight: 44 samples,
**one position**.

Brightness raised on every layer of the badge — base alpha `0.5+0.5a` → `0.74+0.26a`, a shallower pulse
so it never dips as dark, and a stronger fill, inner rim and streaks.

### One warning sign, no path — the lane was louder than the thing it warned about `v2`
The lane version was accurate and unusable: two violet bands across most of the arena, painting over the
field you are trying to read, with the band doing the announcing for something **that is not here yet.**
⚠️ **A warning about a thing that has not arrived must not cost more attention than the thing.**

What replaces it is one glance — *comets, from the right.* A **single badge at the border crossing**: a
rounded triangle with a bang, an arrow outboard of it pointing the way they travel, speed streaks behind
it. **Only the arrow rotates** — a warning triangle is a read, not a vector, and a bang turned with the
heading hangs upside down on a right-to-left crossing and stops being an exclamation mark. **One sign per
shower**, at the mean of its members' border crossings: five badges within a few pixels is a smear on the
edge you are reading, and it collides with the HUD buttons on the right rail.

⚠️ **Two geometry bugs, each invisible except on one entry side.** The border solve is a slab test and the
obvious version is wrong at a corner — smallest positive `t` per axis crosses `x=W` while the body is
still above the top edge, so a shower from the top right planted its sign on the **bottom** border; entry
is the **max** of the near times. And the inset has to cover the whole mark rather than the badge: the
arrow sits 34 outboard plus tail and streaks, ~62 past the centre, on exactly the edge with no room.
Written as 26 (bang invisible), then 62 (streaks clipped), now 92.

### The Comet's lane outlives its telegraph `v2`
The first version marked **only the entry**, and that was worse than no warning. `warnForm` clears its
mark the instant it fires, but a Comet spawns off-screen and `trail` pushes later bodies much further
out — measured at the moment the lanes vanished: **4 bodies, 616–691px outside the viewport, 1.63s of
blind time** before the first was visible. A 1.1s warning that then withdraws its information for longer
than it showed it says *something is coming*, refuses to say where, and makes you wait.
⚠️ **A telegraph has to last until the thing it announces can be seen.**

Same lane now drawn from two places — `warnForm` before the bodies exist, `drawCometLanes` after, for any
Comet still off-screen — through one shared `cometLane` helper so the halves cannot drift into drawing
different lines for one flight. It self-terminates on the off-screen test rather than a timer: in frame,
a body *is* its own sign. Re-measured: **0 blind frames**, 66 of telegraph handing to 176 of live lane.

### The Wish is out of the live path, one commit after landing `v2`
Played, and it **cuts the tempo of the whole game**. An auto-opening picker in a game whose texture is
continuous stops the run several times a minute, and ⚠️ **no threshold fixes the shape of that** — the
interruption is the pause itself, not its frequency, so pricing it higher only changes how often you are
stopped. That is a verdict about *when a choice may interrupt*, not about the four effects or the numbers,
and it is the question any second attempt has to answer before either of those matter.

⚠️ **Deleted, not flagged off, and that is this file's own rule.** `0b408c4` removed 245 lines of arsenal
that had been *"written, tuned, switched off"* and said why: **git keeps them instead.** A mechanic parked
behind a false constant is precisely what that commit exists to prevent — nothing runs it, nothing checks
it, and the next reader cannot tell whether it still works. **The working copy is `fdcafc1`**, whole and
verified; `git show fdcafc1` restores it, and the entry below is its argument.

**Kept from `fdcafc1`, both independent of the Wish:** the Neutral shedding one Mote of each colour, and
the Comet telegraph. `MOTE_SCORE` never changed, so scoring is exactly where it was.

### The Wish: Motes bank into called help `v2`
Motes now also bank; at `WISH_COST` the bank opens a picker by itself and you call for help — **Allies**
(matter arrives in your polarity), **Integrity**, **Shockwave** (arena-wide push, never an erase) or
**Gilded Storm**. An experience-bar gauge across the top reports progress as a *length*, never a count.

⚠️ **Not the powerup roster returning.** `0b408c4` deleted 245 lines of arsenal, and those were **dormant
passive flags** — `P.*` fields set by a pickup and read forever after. A Wish is **instant**, bought with
a banked resource and spent on choosing. It must stay instant: the moment one leaves a lasting `P.*`
behind, that argument stops being true.

**It clears the bar the last Mote bank failed.** `motesBank` fed `mult` and went in `71c961e` for
measuring bimodal (median ×1.9 with hits, ×15 in 46s without, nothing between, 1.30× total effect). The
bar set there is *"it must separate outcomes, not decorate them"* — a Wish changes whether you live, and
it inverts the old halve-on-hit coupling that drained the resource of the player already struggling.

**No input of its own and no dismiss**, both forced rather than chosen: touch is a full partition with no
fourth zone, and the picker opens *because* the bank is full, so a close that spent nothing would re-open
on the next Mote.

⚠️ **Every constant is a placeholder.** Nothing has measured Mote income in this build; the only figure
that exists is the 761-in-a-clean-run from `71c961e`, which predates the −20% damage pass and was one
reading — pricing on it is `759ae0f`'s trap verbatim. `MOTE_SCORE` is deliberately **not** removed:
score has two persisted consumers, and `71c961e` shows the right way to cut a term is to reprice the
flat values against the measured median.

*Two bugs caught by the tests rather than by reading:* `startRun` cleared every overlay except this one,
so a picker could sit over a live run doing nothing (`pickWish` guards on state, and the state had moved
on); and the card row used `max-width` under an `align-items:center` parent, which is shrink-to-fit — it
settled at 570px against an 804px cap and wrapped 3+1 while reading as though it had room. **The same
mechanism was written into `.chiplog.slide` earlier the same day and writing it down did not prevent
repeating it two hundred lines away.**

---

## 2026-08-11

### Touch steering gets a sensitivity slider, and it can only be the zone's width `v2-ios`
Author: *"make sensitivity option then"* — after being told the absolute map costs 2× the pre-v2
sensitivity. Settings → **Touch steering**, 60–100%, default 100, coarse pointers only, persisted.

⚠️ **It moves the ZONE'S WIDTH, because nothing else was available to move.** An absolute map's scale is
pinned by "the zone shows the whole arena" — `k = zoneWidth / W` — so arena-units-per-pixel is not a free
parameter. Turning it down any other way would either stop the thumb reaching the arena edges or start
bending the diagonals. Widening the steering half IS narrowing the Overdrive and flip quarters, and the
setting's own copy says so instead of hiding it.

| setting | zone width | sensitivity |
|---|---|---|
| 100% *(default)* | 437px — half | 3.98 u/px |
| 80% | 546px | 3.18 u/px |
| 60% | 728px | 2.39 u/px |

Capped at 85% of the width so the action quarters stay above ~131px. ⚠️ **Even 60% does not reach the
pre-v2 1.99**: that number needed the whole screen, which is exactly what the partition spends.

⚠️ **The value lives on `ZONE`, not on `store`, and the reason is boot order.** `resize()` is called at
line 1467 and `store` is declared at 1550, so reading `store.touchSens` from `resize()` is a
temporal-dead-zone `ReferenceError` at load — caught by reading the ordering before trusting it, not by
running it, because it is exactly what `node --check` misses.

Verified at 874×402: slider sweeps 437→546→728px of zone and 3.98→3.18→2.39 u/px, both arena edges stay
reachable at every setting (15 and 1724 of 1739), flip and Overdrive still fire in the narrowed
quarters, the value persists, the row is hidden on a fine pointer, and both languages render.

### The move zone is an absolute map now, and that is the third model `v2-ios`
Author: *"still i dont feel natural. alternative stick control would solve the problem? idk"* — after the
rate stick, and after the displacement drag that replaced it. Two models, one complaint, and it turns
out one cause.

| model | what a thumb position meant | why it failed |
|---|---|---|
| rate stick | "keep going this way" | never says *where*; capped at 14/frame against the mouse's 74–148 |
| displacement | "move the star this far from wherever it was" | the thumb↔star relationship **drifted** with every re-grip |
| **absolute** *(now)* | **"the star is here"** | — |

**Neither of the first two ever answered "where".** A trackpad gets away with that because the pad is
not the screen and there is a cursor to watch; on glass, beside the thing you are steering, it does not.
So the zone is a **miniature of the arena**: one thumb position means one arena position, the same one,
all run. Lift and replace the thumb in the same spot and the star is where it was.

It writes `pointer` rather than moving `P`, so the star is carried by **the same chase line the mouse
uses** — touch inherits the mouse's responsiveness by construction, and the "5× slower than a mouse"
defect cannot come back because an absolute model never names a speed.

⚠️ **Your thumb is not on the star, and cannot be.** Half a screen mapped onto a whole arena means a
thumb at zone x=200 puts the star at arena x≈796. It *points at* the star. Every absolute scheme that
fits in a half-width zone pays that; the pre-v2 control had the star under the thumb only because it
steered from the whole screen.

⚠️ **Letterboxed, never stretched.** Zone aspect 1.09 against arena 2.17 — stretching would scale x twice
as hard as y and send a 45° sweep off at ~63°. Fitting costs vertical range: the arena's height lands in
the middle 201px, and outside it the star pins to the edge. **And the honest cost: 3.98 units per CSS px
against the pre-v2 1.99 — half the width for the same arena is exactly 2× the sensitivity**, which is
arithmetic, not tuning. The only ways out are giving up the partition or giving up isotropy.

*Verified at 874×402:* thumb (100,200) → star (398,396); sweep to (380,260) → (1512,635); return to the
same thumb spot → (398.6,396.2), **within 0.6 units — no drift**. x=3 pins at 15, x=434 reaches 1724 of
1739, so the whole arena is reachable. Flip, Overdrive, steer-while-burning, mouse and the Draw clamp
all unaffected.

⚠️ **Caught by a symbol diff, not by reading:** the edit that installed this swallowed `zoneOf`,
`isTouch` and `odTouchId` along with the stick internals it meant to remove — a `ReferenceError` at load
that no syntax check sees. Comparing the top-level declaration list before and after found all three in
one pass. ⚠️ And the dev pane's console **does not clear on navigation**: the stale error survived the
fix and had to be disproved by asking the live page, not by reading the buffer.

### Tilt is removed outright, because the control it would come back to no longer exists `v2-ios`
Author: *"we might remove tilt from now on."* Gone: `stepTilt`, `onTilt`, `tiltMap`, `tiltCurve`,
`tiltCalibrate`, the `TILT` constants, `tiltVec`/`tiltRaw`, `window.__nativeTilt`, `#tiltDiag` and
`updateTiltDiag`, plus the CoreMotion bridge on the native side. ~180 lines of JS and ~60 of Swift.
`MotionBridgeViewController` is now **`AppViewController`** — the motion is gone and a class named for
it would be a name that lies; it carries only the DEBUG JS probe. Storyboard and pbxproj follow.

⚠️ **This retires *"The bridge is kept intact and unwired"* from the port entry below.** That was a real
argument — ~40 lines of verified Swift, and a `TILT.tau` that took two passes and a measurement to
settle, both worth preserving rather than re-deriving. It was overtaken by the very next change rather
than by anyone changing their mind: **the move zone is a *displacement* now and tilt is a *rate***, so
restoring it would not be re-enabling a feature, it would be designing a second steering model and
arbitrating between it and a finger. **The decision was always the work; the code never was** — which is
exactly what stopped the code being worth keeping.

⚠️ **The measured finding outlives the deleted code.** On a real iPhone in this WebView,
`DeviceOrientationEvent.requestPermission()` exists and its promise **rejects**, and attaching the
listener anyway delivers **nothing** — even though Capacitor implements the documented host hook and
answers `.grant`. Anyone reviving tilt starts from `git log -- ios/App/App/*ViewController.swift`, not
from the web API. Two lessons stay behind in the STICK block: the **rate argument** (why that model was
wrong for a finger) and the **sample-rate scar** (per-event smoothing meant a 30→60Hz bridge change
silently halved the control speed — the reason the stick banks its displacement and applies it on the
fixed tick).

Verified at 874×402: `__orbital.tilt`, `__orbital.TILT` and `window.__nativeTilt` are all `undefined`,
`#tiltDiag` is gone, no seam key matches `/tilt/i`, and steer / flip / Overdrive all still fire
(50px → exactly 159.2 units) with **zero console errors**. `BUILD SUCCEEDED` on iPhone 17 after the
rename.

### The move zone follows your finger now, because a finger is not an angle `v2-ios`
Author, from the device: *"moving is not following my finger movement, acceleration is applied little
late."* Both halves were real, and both trace to one mistake — **the virtual stick inherited tilt's rate
model along with tilt's own speed constant.**

**It was speed-capped and the mouse is not.** `stepPlayer` chases the pointer at `0.185 × gap` per frame,
uncapped; the stick's ceiling was a flat 14.

| | rate model | mouse |
|---|---|---|
| across a 400-unit gap | 14/frame | **74/frame** |
| across an 800-unit gap | 14/frame | **148/frame** |

In an arena 1739 × 800 that is a touch player **~5× slower across open ground than a mouse player**.
⚠️ And 14 is the number `settleT` uses for the engine's *deliberate slow glide on resume* — the stick ran
permanently at the speed the game reserves for slowing you down on purpose.

**Reversals cost 128px of thumb.** At full deflection the floating origin sat 64px behind the finger, so
full speed the other way meant crossing the dead zone and the whole ramp again. That is precisely what
"acceleration applied a little late" feels like.

**The rate argument never applied to a finger.** The tilt block argues, correctly, that an angle means
*keep going this way* rather than *be there* — inherent to an angle, which has no position to offer.
**A finger has a position and a displacement.** None of it transferred; it came across because the code
did, and nobody re-derived it at the new site.

So the move zone is a **displacement**: the star travels as far as the finger did on the glass, times
`STICK.gain` 1.6, through the same `/S` divide `setPointer` uses for the mouse. Measured at 874×402
(`unitsPerCssPx` 3.184): touch-down alone moves **0**; 50px moves exactly **159.2**; **reversal is free**
at −31.84 on the same frame; a 2px nudge moves 6.37 so there is no dead zone; a re-grip 300px away moves
0; 60 frames held still drift **0.000**; a 200px swipe banks 636.8 against the old ceiling of 14. Zero
console errors, and the flip, Overdrive and mouse paths are all unchanged.

⚠️ **Given up deliberately: you cannot hold a heading.** Crossing the arena is a drag and a re-grip
rather than a lean. Re-gripping is lossless by construction — a fresh touch sets a fresh reference.
⚠️ **`gain` is not multiplied by `moveMult`**, unlike every other movement — moveMult scales a speed and
there is no speed here. Overdrive lifting a displacement would change the control under you mid-ride.
⚠️ **Not yet felt on the device.** The numbers are exact and the model is right; whether 1.6 is the right
gain is a hand judgement. It is a live object, so the probe can sweep it between runs
(`__orbital.STICK.gain=2.2`) rather than costing a rebuild per guess.

### The sky cache has a number at last, and it is half the size it was `v2`
**The open question is answered for a composited rig.** `__orbital.probe()` — a frame-interval instrument
that flushes to `localStorage` so a later launch reads it and nothing touches the machine mid-measurement
— gives the sky cache **~13fps** on the iPhone 17 Pro simulator: **56.0fps against 42.5** in the same
menu scene at `every=8` vs `every=1`. It also confirms the software-raster claim the file has leaned on
for months: with **27 entities on field, cached frames still held 61fps, p95=17ms, 0.2% over 20ms.** The
play layer really is nearly free; the background really was all of it.

⚠️ **This does not close the open item, for the reason that item already gave itself.** The simulator
composites — the defect that voided every earlier attempt — but it draws on the host Mac's GPU, and the
cache was bet on fill-rate-bound phone silicon. The paragraph predicting exactly this was written before
the run and is kept.

**A repaint cost +6.7 to +10.8ms over a cache hit, and an Act transition pays it on EVERY frame** for the
150–176 frames `easePalette` takes to close — four times a lap, measured at **42fps sustained**. That was
the finding the rest of this entry fixes.

**`SKY.scale=0.5` — the cache is painted at half linear resolution and stretched on the blit**, a quarter
of the pixels. Legal only because `paintSky` is eight full-screen fills that are *all* smooth gradients
(a radial base, five clouds, a linear haze, the vignette — not the "gradient plus five clouds" the docs
said), and because the one layer with crisp marks, the starfield, is drawn per frame **over** the cache.
Repaint premium fell to **+0.8 to +1.9ms**, and a real Act transition — 149 frames caught live, against
the 150 the ease was computed to take — ran at **17.0ms · 58.7fps with zero frames over 20ms**.

**ProMotion enabled**, `CADisableMinimumFrameDurationOnPhone`. iOS clamps a WKWebView's `rAF` to 60Hz
without it. Safe because the sim is fixed-step — but ⚠️ **two things counted RENDERED FRAMES, which is
correct at 60 and wrong at 120**: the sky cadence (now wall-clock; a frame counter would have doubled the
repaint rate and undone the paragraph above) and the death shatter drift, the one particle path outside
`step()` (now `Math.pow(0.92, dt*60)`). ⚠️ **Unverified — the host Mac is a 60Hz Air, so every 60fps
ceiling in these tables is the laptop's display, not the game's.** Needs a real device.

**Starfield: 258 → 232** (135/70/27), thinned 10% uniformly so the layer ratio that carries the depth
survives. A look decision, and it bought nothing: measured off the stars' own radii, **~101 survive the
cull per frame for 404 device px of ink — 0.03% of ONE full-screen fill**, where the sky does eight.
⚠️ I first reported 258 drawn per frame; **only ~101 are**, the rest sit outside the padded field.
What actually cost was per-star bookkeeping, independent of count and brightness: a fresh `rgba(...)`
string per star per frame — `toFixed(3)`, template literal, and a CSS parse the engine cannot cache — and
its own `beginPath`/`fill`. Now colour tables at 1/64 alpha and one fill per bucket: **101 fills and 96
allocations → 46 and zero**, proven output-identical (same stars, same positions, zero hue mismatches,
worst alpha error 0.00759 against the 0.00781 bound, zero chained arcs). ⚠️ **No frame-time gain is
claimed** — vsync hides anything under 16.7ms.

⚠️ **A full 45-second measurement window was scored as data while the app ran a dead script.** The probe
was armed by patching the gitignored device copy; the patch ended in a `//` comment that swallowed the
rest of its line, `}catch(e){…}` included. The *source* was syntax-checked and passed; the *patched copy*
was not. And a packaged web app with a dead script does not look dead — the static markup still rendered
a laid-out menu. Staging now parses the artefact it is about to ship. See *Traps*.

### The Anomalies are cosmic now, the missiles are five shapes, and the sky drifts `v2`
**Anomaly bodies.** Emitter = a **star** — limb-darkened photosphere, granulation, six prominences on
`hexRot`. Sentinel = a **vortex**, three spiral arms, because this is the kind that orbits you and a
spiral is orbital motion made visible. Bastion = a **nebula** with its crown of rays kept on top, still
lengthening as the nova winds up. A **singularity** is written for the fourth Anomaly and is
**unreachable** — `spawnBoss` throws on any variant not in `HUNT_SPD`, confirmed by calling it. Giving it
a spawn path needs a hunt speed, an `updateBoss` arm and a firing pattern; that is a gameplay change.

⚠️ **The hexagon was never the telegraph its own comment claimed.** `fireHexVolley` assigns
`b.hexRot = leadAngle(...)` **on the same line that fires the volley** — it records the shot rather than
predicting it, so there was never anything to read in advance. I repeated that claim to the author twice
before reading the four lines under it. What a body actually owes the volley is symmetry locked to
`hexRot` **at the moment of firing**; `spawnRing` + `bossFlash` already carry the announcement, so the
bodies do not repeat it and there are no permanent six-fold marks.

Every core is built **from** the polarity colour rather than decorated with it — white only where it
means heat. Measured on both poles: **72–94%** of each core's lit pixels are channel-dominated by the
pole. That check killed an earlier fourth core (an aurora veil) which was `mix(pole, tint)` and would
have been invisible on cyan.

⚠️ **Tuned at `b.r`, and the study's radius lied.** The study drew these at R=52 on a desktop canvas; the
Anomaly is **R=37**, and at S≈0.5 on the device it is an **eighteen-pixel disc**. The nebula collapsed
into "crown plus a bright dot" at true size — base lightened, lobes pushed, and the centre knot **shrunk**
0.36R → 0.26R, because a big white centre erases the cloud it is supposed to sit inside.

**Missiles: five kinds, five silhouettes.** Colour was already spent — every missile is `COL.neutral` by
rule, so a same-colour missile can never read as safe — which left shape carrying everything, and shape
was carrying almost nothing: **volley, ring and a committed seeker were the same drawing** at the same
radius, separated only by streak lengths of 10.8 / 9.2 / 6.6 units. Now: barbed shard, blunt slug, hollow
annulus, swept dart, and the mine unchanged. **The seeker's fins stay on after it commits** and merely
stop wavering — the old bracket vanished at commit, i.e. exactly when knowing what is arriving matters
most. Same draw-call count.

**Sky: it drifts.** Parallax was driven *only* by the player's position, so the sky stopped dead whenever
you did — which is most of a boss fight. Each layer now carries a constant `flow` (1.6 / 4.2 / 9.0 design
units/s, keeping the depth ordering). Deliberately **not** damped by reduced-motion: that mode exists to
remove the sudden player-coupled swing, and a slow constant drift is the opposite kind of motion. Keyed
to `elapsed`, so it correctly freezes on pause.

A **depth haze** and a **vignette** join the cached sky, so both are paid once every `SKY.every` frames
rather than per frame. ⚠️ **The vignette ships at 0.20, not the study's 0.42** — a vignette darkens the
rim, and the rim is where every Dot *enters*. The study looked better at 0.42 because nothing flies into
a study. Check it against incoming matter at the border, never against an empty field.

⚠️ **The Anomaly's halo was a flat additive disc with a hard edge at 2.1r**, while every ordinary Dot's
glow is a ramped sprite specifically so there is "no boundary to aim at". A pre-existing inconsistency on
the one body you spend a whole fight judging distance to — invisible while the body under it was a flat
hexagon of the same colour, obvious the moment the core became a bright star. Now a gradient: same
extent, same peak alpha, ramped to zero.

⚠️ **The Bestiary duplicates the art, and it went stale the moment the game changed.** `bestiary.html`
carries `anomBody()`, a hand-copy of `bossBody()`, and it went on drawing a hexagon, a hollow pincer ring
and a rays crown after the game stopped — teaching a body the player would never meet. Ported, along with
the same flat-halo fix, which that file had its own copy of too. **A wrong picture in the reference is
worse than no picture**, and unlike a wrong number it cannot be grepped for — it is not a literal.
It cannot be shared out: the game is deliberately one self-contained file, and the Bestiary is opened
standalone as well as in the iframe, so it cannot reach `parent.__orbital`. The duplication is now loud
instead of silent — a warning block at `anomBody` naming `bossBody`, and a paragraph in MECHANICS.

Verified: seeded runs reproduce exactly, and a run **with** rendering produces the identical fingerprint
to one without — the whole change is draw-only. All three variants render distinctly (control 0). No
console errors over 2,400 stepped frames. The Bestiary builds 12 cards and 19 canvases with none blank.

### The star is yours, the field is themed, and the number that decided it was wrong `v2`
The two tiers stop overlapping. **The star is per-element; everything else is themed.** A theme cannot
reach the star, and the field has no per-element categories left — the `drift` wardrobe row is gone after
one commit, having done its job as the test case that proved `DOT_FACE` works. The faces stay in
`DOT_FACE`, where a theme is now the only thing that can reach them.

⚠️ **The measurement behind the decision was re-run and the first version of it was wrong.** Changed
pixels at 874×402, five sim states carrying 2 to 19 Drifters, control 0 in every one:

| | per body | totals |
|---|---|---|
| Drifter, Bead vs Plain | **88–115 px** | 225 / 336 / 669 / 1062 / 2185 |
| Star, Redoubt vs Core | **312–341 px** | one body |

Previously quoted as **102 px** and **~33 px** — both roughly **3× too small**, from a single unrepeated
reading, and written into a code comment, MECHANICS *and* a commit message. The **ratio** survived
(2.8–3.9×, still ~3×) and the decision rests on the ratio, so nothing about the design moved. But **one
reading with a passing control is still one reading** — the control being clean is what made it feel
finished. Repeat across states before a number becomes an argument.

**What the split buys back** is the honest cost of winner-takes-all: nobody gives up a look they earned in
order to wear a theme.

Three things came out with the tier, rather than being left inert:

- **`elementPick`.** It existed so the wardrobe could show a stored pick while the field drew something
  else. The tiers are disjoint now, so the two answers cannot disagree — and two names for one answer is
  how they drift apart.
- **The `.off` card state**, styled deliberately unlike `.lock` so "not earned" and "asleep" could not be
  confused. Nothing is asleep any more.
- **The suppression note.** *"{name} is dressing the whole game"* described something a player could now
  watch not happening.

⚠️ **`OVERALL_FACE` must never carry a `star` key**, and `skinPick` enforces it by answering the star
before themes are consulted at all — so an entry there would be **dead while reading as live**, which is
worse than forbidden. Verified by planting one and rendering: the player's pick stays.

Two labels went stale the moment the star was exempted, both fixed. **"Everything" → "Theme"**: a tier
label is a claim about coverage, and coverage is exactly what moved — the same failure that killed this
panel's heading twice. And the theme row **previews on a Drifter, not on the star**: it was showing a
picture of the one body the choice does not affect.

### A Drifter skin, a shorter Turret, and the wardrobe stops having a heading `v2`
**Turret is 30 seconds, down from 60.** `TURRET_T` is quoted in `achv.turret.ds` in both languages and the
string cannot follow it automatically — every other row's description is a sentence rather than a number,
and one templated row would be the odd one out. Both strings walked by hand; the constant now says so.

**`DOT_FACE`, and it starts at one species.** `drift` gets a face table — **Plain** (the disc the game has
always drawn, lifted out of the shared `else` branch unchanged) and **Bead** (the core opened into a
ring). Everything else still draws inline. `drawEnemies` is the most heavily argued draw code in the file
and a seventeen-branch extraction would put every one of those arguments at risk to serve a wardrobe.

The Dot contract is `STAR_FACE`'s plus one clause the star does not need: **a Dot's silhouette is its
species**, so a Dot face may not touch the disc at all. Interior only. A face also draws its **own core
dot** — hence `drift` joining `noCore` — because leaving the shared 0.34r mark to be stamped on afterwards
would put a fixed white dot inside every future Drifter skin whatever it had drawn there.

⚠️ **Bead's first version punched its ring out with `destination-out`, which does not do what it looks
like.** This is the shared world canvas with the sky already on it, so the cut goes through the sky as
well and leaves a transparent bite in the field. Caught before it shipped. Additive blending needs no
erasing: the hole is the body's own colour, never drawn over. **Negative space here means not drawing** —
exactly how the Planet's plate gaps already work. Nothing in this pass may use a `destination-*` operator.

Bead is gated on `devlock`, so it is unreachable in play. Proven rather than assumed: setting
`skin.drift = 'bead'` changes **0** pixels of the rendered field and `skinPick('drift')` returns `plain`.
Opening the lock through the harness changes **98** pixels across three Drifters, which is what makes the
zero mean something — the same rig detects the face when the face is allowed to draw.

**The heading is gone**, on the author's call, after going stale twice in two passes — *"The look of your
star"* while the star was the only category, then *"The look of it all"* once the overall tier landed. **A
heading is copy about scope, and scope is what moves every time this panel grows.** That is an argument
for not having one, not for keeping one current. The kicker stays: it is the panel's name, not a claim
about its contents.

⚠️ **Three stacked tiers overflowed by 32px in English and 39px in Korean** even with the heading gone.
The fix is not more shrinking — it is the right axis. The shipping WebView is **874×402**, wide and short,
so one full-width row per category spends the scarce axis and wastes the plentiful one. The per-element
tiers are now a wrapping row of **columns**: three fit with room, and a fourth category wraps instead of
pushing anything past the fold. Columns align to the top, because a locked card is taller than an unlocked
one and centring would stagger the category labels.

The suppression note moved out of the sections and sits **once**, between the tiers. Per-section was fine
at one category and becomes the same sentence printed N times as the roster grows.

### The wardrobe grows a second tier, and a lock that cannot open `v2`
Skins are now **two tiers**. *Per-element* skins dress one species — `star` today, Dots when the draw
code has a seam to hang them on. An *overall* skin dresses the whole game and **suppresses** every
per-element pick while worn. First one declared: **Pixel Graphic**.

⚠️ **Suppresses, not overwrites**, which is why there are two resolvers. `skinPick` is what the drawing
code asks; `elementPick` is what the wardrobe asks. They disagree by design while an overall skin is on,
and a test that cannot tell them apart cannot prove the difference. Measured: Pixel Graphic over a stored
Redoubt gives `star_drawn: core` / `star_stored: turret`, and taking it off returns both to `turret`.

The overall tier **answers even where it has nothing to say** — its own face if it has one, otherwise the
category default, never the player's pick. A hand-picked smooth star inside a pixel field is not a
customisation, it is the skin failing. The fall-through alternative would make that bug appear and
disappear as art landed, which is the worst schedule a bug can keep.

**`devlock` is an achievement with no path**: `grantAchv` refuses the id outright rather than relying on
nothing calling it. "No caller today" is a fact about one commit. It stays out of Records — `hid` means
*undiscovered*, and a row nobody can ever tick is not a secret, it is a bug report with a tick box. What
it buys is a skin that ships **visible and unwearable**, which is the honest state for art that does not
exist yet. Pixel Graphic sits behind it.

⚠️ **The empty slot is a different call from the dimmed lock.** Locked skins show their art — withholding
art you *have* is a choice this panel declines. Drawing the default star under a label reading "Pixel
Graphic" would be showing art you do **not** have. `skinSwatch` falls back to Core so the field never
fails to draw; the wardrobe uses `skinSwatchEmpty`, because nothing is the only honest picture of nothing.

The heading stopped saying *"The look of your star"*. It was accurate while the star was the only
category and became the narrowest thing on the panel the moment the overall tier landed — **a heading is
copy about scope, so it goes stale when scope moves.**

The description under it is gone, on the author's call: the cards state the hue law and the unlock better
than a sentence about them did. Losing it cost nothing and the second tier immediately spent the space —
**23px past the fold at 874×402**, measured, so the short-screen branch now shrinks the heading, the
sections and the swatch. The swatch needed `!important`: `skinSwatch` writes its size as an **inline**
style (the backing store is dpr-scaled and the CSS size un-scales it), and an inline style outranks a
media query — without the flag the rule is ignored in silence.

### Skins get their own panel, and the locked slot finally says what unlocks it `v2`
Out of the Settings row, into a **Skins** link on the menu — second in the row, next to Records, because
Records is where the thing that unlocks them lives. Each slot draws the actual star through `STAR_FACE`,
so what you pick is what the field draws, at a swatch size rather than as a word.

⚠️ **The row's locked pill carried its trigger in `title=`, which needs a hover — so on iOS it said
"Locked" and nothing else, forever.** Not a smaller version of the feature: the feature absent, on the
only device this ships on. A panel has room to print the sentence under the slot, so it does. **A
tooltip is not a fallback on a touchscreen; it is a deletion.**

Locked art is **shown, dimmed** rather than withheld. A cosmetic has no secret to keep, and a locked
slot's whole job is to be wanted.

Two measured fixes came out of building it:

- **The four-link row wrapped, exactly as the CSS comment said it would last time** — 348px of English
  against 331px usable on a 375px phone, with SETTINGS alone on a second line. The gap had nothing left
  (10px would be needed and reads as jammed); the width was in the **tracking**, `.13em` across 28
  characters being ~47px of pure air. `.06em` under 560px → a measured **316px**, one line. Korean never
  wrapped at all: 158px.
- **`word-break:keep-all` was scoped to `.setrow .sd`, and the new panel reuses `.sd` outside a
  `.setrow`** — so the Korean note split 무늬 across two lines on its first render, the exact defect that
  rule exists to prevent, in a class that already had the fix. **A container-scoped rule does not follow
  a class into a new container.**

The swatch is always cyan, the pole the colourblind palette leaves alone, so it reads identically in
both palettes. No repaint poll: Settings polls at 400ms because a key can move a switch while it is
open, and nothing here changes without a click here.

### The baited charge is trimmed 20% because of what it is, not what it costs `v2`
`CHARGE_DMG` **12 → 10**. Nothing about the boss pool moved this time — every previous move here was a
repricing against a pool that had changed under it. This one is about the channel's *role*.

The baited charge appears in no player copy, in no tutorial and in no hint; it is found by accident or
not at all. Author: *"it was an easter egg but it deals too much damage."* A route almost nobody knows
about should not also be the shortest way through the fight for the few who do.

**In share it is the lowest this channel has ever been — 40 / 33 / 29 / 25 / 22% of a bar across the five
Epochs. In baits it is the original design.** 3 / 3 / 4 / 4 / 5 against the current pool, against
2 / 3 / 4 / 4 / 5 for the 8-vs-15 the game shipped with: identical from Epoch II onward, one dearer at
Epoch I. The whole 20% buys **one extra bait at Epoch III and one at Epoch V**; Epochs I, II and IV do
not move. A percentage and a bait count pointed in opposite directions here, and the bait count is the
one a player can feel.

The Bastion has its own row, because ×0.75 lands it off every round number: 19 / 23 / 26 / 30 / 34 HP is
2/2/3/3/3 baits at 12 and **2/3/3/3/4** at 10. The lowest Bastion the game can actually spawn — the Epoch
II one at 23 — goes from two baits to three.

Nothing that makes a bait *feel* like a bait is priced off this constant: the hitstop, the trauma kick,
the twin impact rings and the gold `fx.poked` line are all flat. The arithmetic moved and the moment did
not. **11 lands on the same bait table as 10**, so the value is the requested 20% and not a figure
derived from bait counts — noted at the constant so nobody reconstructs it backwards and concludes 10
was forced.

Three stale claims fell out of walking this. `ETYPE.charger.dmg` became 13 in the −20% Dot pass and the
comment pricing the misread still said **16**. `MECHANICS.md` still called 4× a live coincidence in one
section and, three screens away in *Open*, still required *"any further move must carry the
`CHARGE_DMG` = 4 × `VOLLEY_DMG` pin"* — a pin retired in the same file. **A retired rule survives
wherever it was repeated**, and the copy nobody is looking at is the copy that stays wrong.

### The receipt says what killed you, not how much meter you spent `v2`
⚠️ **This one has no commit body, and the file's opening rule promises it does.** The work landed inside
`d8389b9`, whose subject is *"Skins get a room of their own, and the baited charge gets 20% off"* — a
concurrent session staged it out of a shared tree along with its own, so `git show d8389b9` is the long
version of a different change. **Nothing is missing from the diff**; what is missing is the argument, and
this entry is the whole of it rather than a summary of somewhere better. Read it as the commit body.
*The general case is worth more than this instance:* in a contended tree the entry you write here may be
the only place the reasoning survives, and **git reports nothing when that happens** — a swept commit is
clean by every check there is. Write it long enough to stand alone before the commit exists.

The Overdrive ride row and the Anomaly fight row are **off the death screen**. In their place, one row of
chips naming every **kind** that landed on you and how often — `떠돌이 ×6` · `변이체 창 ×5` · `덩치 ×4` —
most-frequent first, ties in first-hit order.

**A tally, not a trace.** No damage numbers and no order of arrival: the cause line already names the last
hit, and what the receipt was missing is the shape of the whole bleed. It is worth showing *now* because
Integrity no longer comes back — every hit in that row is still on the bill at the end, which was not true
of a build that healed you between them.

⚠️ **Colour is dropped, and that is accuracy rather than brevity.** A Dot of your own colour passes through
the core harmlessly, so every Dot that ever lands is the opposite colour *by construction* — splitting
`Drifter (red)` from `Drifter (cyan)` would print your own polarity history back at you as two species.
Hence `srcKind()` beside `srcName()` rather than a flag on it: the cause line is a sentence and wants the
colour, a tally is a column of nouns where the same parenthesis repeats down every row.

**It slides instead of capping.** Bounded at **15 rows by construction** — nine species plus six missile
kinds — so it can never reach the wallpaper problem `CHIP_SHOW` exists for, and a `+N` here would hide
*names* the total cannot reconstruct. `.chiplog.slide` is the only chiplog that does not wrap.
⚠️ `justify-content:safe center` is load-bearing **only in the overflow case**, and the obvious reading of
it is wrong: the row looks centred when it fits because `#dead` is `align-items:center` and the box is
shrink-to-fit — measured at 375px, a two-chip row is a 172px box at x=102 with `justify-content`
distributing nothing. It matters once the box clamps to `max-width`, where plain `center` would push the
first chips off the left edge with no scroll position able to reach them — and the first chip is the
most-frequent killer.

**This also settles the overflow entry below it.** That fix shrank the score because *"the death screen got
worse the better you played"* — the overflow **was** the two logs. The receipt's height is now constant:
13 kinds render on the same one line as 1. Measured at the shipping WebView viewport **874×402**, Korean,
new best, 13 distinct kinds and 34 hits: panel 402 against 402 available, Reforge at 299, chip row
scrollWidth 1111 over clientWidth 560 on a single line. The earlier failure was 515 against 382.

⚠️ **NOTHING WAS DELETED TO MAKE ROOM.** `odLog` · `odCount` · `odTotal` · `anomLog` are still built every
run and the **pause panel still shows both rows** — mid-run "how much Capacitor have I spent" is a decision
you can act on, and post-mortem it is trivia. `anomLog` also grants **Untouched**, so a tidy-up that
removes it on the grounds that the death screen no longer reads it breaks an achievement.
*This retires an invariant MECHANICS stated as absolute* — "a stat that appears in one and not the other is
a bug, not a decision" — recorded there rather than edited away, because a rule that strong gets
re-derived by whoever next notices the panels disagree.

**The share card truncates at 4** where the receipt scrolls, because a canvas has no scroll to offer — the
one place `cardChipRow`'s `+N` stub earns its keep. Cap 4 rather than the 5–6 the old rows used because a
species chip is a *name*: `불안정한 행성 ×2` is three times the width of `2.4s`.

---

## 2026-08-10

### Reforge was below the fold on the device, and so were Quit and Settings `v2`
At the shipping WebView viewport (**874×402**) the death screen measured **515px against 382 available**
and the pause panel **523**. Past the fold: **Reforge**, and on pause **Quit** and **Settings**. Both
overlays scroll, so nothing was strictly unreachable — but the menu branch already states the rule that
a primary action behind an undiscoverable scroll has failed at its job. The menu got that fix when the
landscape lock went in; these two never did.

⚠️ **The death screen got worse the better you played.** The overflow *is* the two run logs, so more
Overdrive rides and more Anomaly fights push Reforge further down — and a good run is exactly when you
most want to go again. It cannot be reproduced by dying early, which is why walking the tutorial on the
device never showed it: a tutorial death routes to `tutFinish` and has no logs. On pause, **Resume
survived and the other two did not**, so the panel looked fine.

Fixed by the method the wordmark established — find the block taking a quarter of the screen and shrink
*that*: the score (116px) on the death card, the `❚❚` glyph (84px) on pause. Both now clear a **21px**
bottom safe-area inset with every control reachable, in Korean, with a new best, and a full receipt.
Chip rows are bounded (`CHIP_SHOW` 12 + one overflow), so a longer run cannot undo it.

⚠️ **Five inline styles moved into CSS first** — an inline style outranks a media query, so the branch
could not reach them. Verified layout-neutral at 1280×800 with the branch inactive: every moved property
computes to the value it had inline.

*Caught by a bad test first.* The initial check used `class="chip"`; the real class is `bchip`, so the
mock rendered one chip row where the real receipt wraps to two, and it reported a comfortable fit that
did not exist. The numbers above are all from `.bchip`.

### Dot damage is −20%, not −2 `v2`
The flat −2 is re-derived as **20% off each original value, rounded to an integer**: Dart 6, Drifter 8,
Bomber 8, Harrier 10, **Neutral 12**, **Charger 13**, **Planet 16**, **Brute 18**. Four moved; the four
small ones already landed on −20% by coincidence, which is why Drifter felt right. Actual cuts run
16.7%–25% because rounding integers is the point — no decimals in a damage table.

**The Brute figures move with it:** from **Epoch X** one contact costs **31.0**, more than an entire
Epoch's income, and at **Epoch LVIII** it is **100.1** and one-shots a full pool.

⚠️ **It produced a byte-identical death census** — same 37.7s median, same 31.1–53.2 range, same
7/4/4/1 killer split. That is not the change failing; it is the *instrument* failing, and finding out
which was the whole job:

> **Only 2 of 16 runs ever had a Brute or Charger on the field, and none ever saw a Neutral or Planet.**
> Brute and Charger enter the ambient table at `t≥45`, Neutral and Planet at `t≥125`, and the pilot's
> median death is 37.7s. It dies inside the first two bands.

The flat −2 *appeared* to work only because it touched Drifter and Dart, which are the early table. Any
tuning of the mid or late roster is unmeasurable by this bot **by construction**, and a green suite will
report "no change" whether the change is inert or enormous. Recorded in MECHANICS as a standing limit.

### A run you can hand to somebody `v2`
A **1080×1350** card built from the run that just ended — score, Epoch, killer, time, peak combo, the
Overdrive and Anomaly strips, and your star in the skin it was wearing. Share sits beside Menu, *below*
Reforge: one tap to play again is what that screen is for, and a card is a garnish.

**Drawn, not screenshotted.** A DOM capture needs a rasteriser this game does not ship and would hand
over whatever the viewport happened to be. The card is composed for the medium instead — 4:5, the shape
every messenger shows uncropped — and it reuses the *real* skin code: `starHull`/`STAR_FACE` now take a
context and geometry rather than reading `P` and `ctx`, so the card draws the same star at 68px that the
field draws at 15 with no second copy to drift.

**It touches no network and must not start.** `connect-src 'none'` is the policy and a share feature is
the obvious place to break it. Everything is canvas → data URL → blob. Measured: 811 KB, 37 ms to
encode, valid PNG magic, and a `blob:` URL creates cleanly under the policy with no console error.

⚠️ **`toDataURL`, not `toBlob`, and that is deliberate.** Safari only honours `navigator.share` inside
the task that handled the gesture; awaiting a `toBlob` callback leaves it and the sheet silently never
opens — on the one platform this is shipping to. The whole path to `share()` is synchronous, and the
button is bound directly rather than through a wrapper for the same reason.

**Two layout faults found by looking at it.** The wordmark printed twice (header and footer) — cut, the
star closes the card and needs no caption. And the start-Epoch read `EPOCH III · ECLIPSE · from III` on
a deep start that never advanced: true, and nonsense. It is its own line now, because how deep you got
and whether you were handed a head start are two facts, and the second is what makes the first
comparable. The block rhythm is set by the busiest card — both strips present — because that is the run
worth sharing, and at the first spacing the star's halo washed over the Anomaly chips on exactly those.

### The five original achievements are gone `v2`
Roster **16 → 11, one hidden**. Deleted: `firstBoss`, `combo60`, `act3`, `redline`, `lancegild`.

**They were written when a row paid nothing, and it showed.** Most asked for a *number* rather than a
decision, and each is now either trivial beside what replaced it or said twice: `combo60` sat under
`wombo`'s 250 on the same line of code; `act3` measured depth, which the Epoch-start ladder now owns and
prices properly instead of paying one tick for; `firstBoss` fired on the first purge every player makes,
so it certified nothing.

**`odFrom` went with `redline`.** Charge-at-ignition had exactly one consumer, and a field kept alive for
a deleted reader is how `P.blastR` became a tombstone in this file already. The trap its comment carried
— that `odT` is accumulated and must never be derived from charge spent, because milestones and the
purge both pay *through* a burn — is a property of the economy rather than of the field, so it was
rephrased and kept.

**Old saves keep the dead ids and that is harmless.** Records renders from `ACHV`, so an id with no row
is invisible, and nothing counts the set. No migration: one that runs on every player's save to delete
five strings nobody can see is more risk than the strings are worth. Verified against a save holding
`firstBoss` and `redline` — eleven rows, no ghosts, skin unlock unaffected.

⚠️ **Fingerprints are identical across the deletion**, on three seeds, one of which was earning
`combo60` mid-run and now is not. Worth checking rather than assuming: this project's own notes warn
that sound draws from the same `Math.random` stream as the simulation, and removing grants removes
`sfx.level()` calls.

### Skins, and one to earn `v2`
A skin system with one category (`star`) and two faces: **Core** and **Redoubt**, the second gated on
the Turret achievement. Chosen in **Settings** rather than a room of its own — *one question per
surface*, and "which star am I looking at" is Settings' question; a fourth entry in the menu's link row
would have made a two-item wardrobe look like a system.

**Two structural properties, not two promises.** Nothing a skin touches is read by `step()`, so a skin
cannot move a fingerprint — **measured: both faces produce the identical `a17adc13`** over 1,200 seeded
frames while `skinPick` genuinely returned different faces. And `starHull()` fills and rims to exactly
`P.r` for every face, because contact is `e.r + P.r` and a star drawn smaller than its collider dies
before its own visible edge touches anything; a face owns the **interior** only and is handed the
polarity colour rather than picking one. Redoubt is therefore an octagonal keep with four buttresses
*inside* an unchanged circular silhouette.

⚠️ **Neither property is bolted shut.** A future skin that wants its own silhouette makes that argument
at `starHull`, in the open. Hue is the one thing that stays non-negotiable. State readouts — the
hold-charge ring, the immunity blink, the halo — are drawn outside the face function, so a skin cannot
make a meter harder to read. A selection you no longer own falls back rather than failing to draw.

⚠️ **Correction to the entry below:** it says "the count gates the skin ladder". It does not. Skins key
on a **specific achievement id**, not on `store.achv.size`. The count threshold was the plan and was
never built — an unused branch in a gate is a gate nobody has tested. Either shape makes a row a
currency, so nothing else in that entry changes.

### Twelve more achievements, and they stopped being harmless `v2`
Roster 5 → **16**, two hidden. Each row now carries a **trigger** and a **flavour** line, and Records
shows the flavour only once the row is earned — unearned, a row has to read as a goal, and a punchline
where the instruction goes competes with it. Korean flavour is authored, not translated.

**The count gates the skin ladder, so a row is a currency now.** Three consequences that were harmless
while achievements paid nothing:
- **`grantAchv` gained a survival-only guard.** It had none. Boss Rush hands out Anomalies from an
  endless supply and could farm `firstBoss`, `combo60`, `redline` and `lancegild`; the Lab spawns shapes
  on demand. Same condition the best score and records list already share.
- **Reach-style rows need the cold-start guard** or a deep start grants them at t=0. `speedrunner`
  carries it; `makeawish` keys on the *advance* into a Shower rather than the Epoch you are in, which
  gets the same protection for free.
- **Adding or retiring a row is no longer a single line** — it moves the ladder's denominator.

**All twelve verified through their real code paths**, not by writing to `store.achv`: Turret at 61.7s
of measured stillness, Flappy Star at 40 spaced flips, Untouched + Ka-me-ha on a clean full-health
Overdrive purge, Headbutt by putting a gilded Dot on the core, Bounty Hunter through four `onKill`s,
Wombo Combo at a real 255-chain, Demolition through `planetBlast`, Friendly Fire on a committed Charger
dash, Make a Wish on an actual advance into Epoch IV, Speedrunner granted on a cold start at 14.4s and
**withheld on a deep start that died at 10.2s**. The mode guard was proven in all four modes.

⚠️ **`speedrunner`'s 30s is not reachable by accident.** Across the 16-seed census the fastest natural
bot death was 31.1s. It is a deliberate act, which is what a hidden joke row wants.

⚠️ **The counters are `FEAT`, not `AC`.** `AC` is the AudioContext and both are top-level in the same
script — the collision is a SyntaxError that takes the entire file down, not a shadowing bug that
degrades one feature. Caught before it shipped; recorded because a single-file game has one namespace
and ~8,500 lines of neighbours.

### You can begin at a deeper Epoch, once you have earned it `v2`
Score unlocks a starting Epoch — **8,000 · 18,000 · 28,000 · 38,000** for II through V. A deep start
skips the early Epochs' easy score and buys `200×act` purges and `250×act` Bounties from the first
minute, at a difficulty that kills faster. **It grants no power**: `freshRun()` is byte-identical either
way. The menu selector is *absent*, not disabled, until Epoch II is unlocked.

**Thresholds are anchored on the one human tape, not on the bot.** The 271s tape reaches Epoch V with
39,105; an immortal pilot reaches it at 475s with ~69,000 — 1.75× the time for 1.76× the score, which
would have set every gate about twice too high.

**The real work was the `elapsed`-keyed gates.** The ambient table, the formation clock and the Neutral
Drift are all keyed on elapsed rather than act, so a cold Epoch-V start would have served the `t<20`
all-Drifter teaching band at Epoch-V damage. `introT()` warps the intro *gates* only and never `elapsed`
itself, so Time Survived stays honest and the sim keeps one clock. Verified: a cold start sees `drift`
alone in its first 15s, a deep start sees seven species.

**Proven inert for existing play:** cold-start fingerprints are **bit-identical** to the previous build
across three seeds, while the same seeds started deep differ on all three. `startActMax` is a high-water
mark so Erase Records cannot revoke it, and `act3` gained a cold-start guard — measured both ways, the
grant fires on a cold run and is withheld on a deep one that cleared the same Anomaly.

**Two latent bugs surfaced, neither of them new.** The sky cache repaints on `palMoving` or every
`SKY.every` frames, and `beginRun` *jumps* `palCur` rather than easing it — so a start landed exactly
between the two conditions and served the previous sky for up to 8 frames. Invisible while every run
began at Epoch I and both were the same colour; a deep start is the first thing that can open in a
different sky. Boss Rush had the identical defect. And `epochGlyph` was written as a `const` arrow while
`applyLang()` calls into it *from above* during boot — a temporal-dead-zone `ReferenceError` that
aborted the rest of `applyLang` silently. Both found by looking at the screen, not by reading the diff.

### Every Dot hits for 2 less, and the death census says where that lands `v2`
A flat **−2** on all eight `ETYPE` rows: Dart 8→**6**, Drifter 10→**8**, Bomber 10→**8**, Harrier
12→**10**, Neutral 15→**13**, Charger 16→**14**, Planet 20→**18**, Brute 22→**20**. Dots only — the
Anomaly's body (30), its missiles (10) and its mines (20) are not Dots and did not move.

**Measured, paired on eight seeds:** median survival **34.0 → 36.85s, +8.5%**, and no seed got worse.
**It did not move the wall:** 0 of 8 reached Epoch II before, 0 of 8 after.

**The census explains why, and it is the first one this project has run** — `lastDmg` has shipped the
instrument for weeks and nothing ever aggregated it. Sixteen seeded runs: **16 of 16 died inside Epoch
I, and 16 of 16 died with `phase === 'boss'`**, killing blow **7 Anomaly body · 8 ambient Dots · 1
missile**. Not one run ended in the 30.7s of ambient field before the fight. So the ambient economy is
not the wall — **the first Anomaly is** — and roughly half of what kills you there was never a Dot, which
is exactly the half a Dot nerf cannot reach. Caveat that matters: *when* is trustworthy, *what* is not,
because a pilot that never dodges walks into the body repeatedly.

**Three comments were re-derived rather than find-replaced**, and one of them was already wrong: the
Neutral hexagon bound said six of them cross the pool "from about Epoch V", which at the old base of 15
was Epoch **III** (104.4). At 13 the sentence is true. The −2 pass did not fix that line, it collided
with it. The damage-size ladder also still listed a Mini, deleted back in `6324914`.

### Integrity does not come back `v2`
Passive regeneration is gone from survival. The purge is the whole heal now — **+30, one an Epoch,
against a pool of 100.**

**It was never healing you.** The gate was `hurtT > 3.8`, and any hit rearms it while `IFRAME` bounds
intake at 1.25 events a second, so under pressure the window never opens and it recovered **literally 0
HP** — the thing it was credited with doing, it never did. What it actually did was top you back to
full *between* encounters: the 271s reference tape ends at exactly **100.0 HP** at Epoch V. So it was a
per-encounter **reset**, and its real effect was that Integrity cost nothing across a run.

**What that buys is a second axis, which this game did not have.** Score is spawn-limited and therefore
very nearly a clock — throughput holds 268–292 Dots/min in every condition ever measured and a kill pays
a flat 20 — so two runs of the same length score about the same however they were played. Remaining
Integrity does not. It is now the only quantity that separates a clean run from a lucky one.

**It is also what makes a run end, and no new difficulty scalar was added.** Heal income is flat at 30
an Epoch; contact damage is `dmg × (1+(act-1)×0.08)` and never floors. Against the Brute's 22 base:
**from Epoch VI one contact costs 30.8, more than an entire Epoch's income**, and **at Epoch XLVI one
contact is 101.2 and one-shots a full pool.** Flat income against unbounded expense is terminal by
construction. Both figures are arithmetic off `aDmg`, confirmed by reading `e.dmg` off freshly-spawned
bodies at eight Epochs (I · II · III · V · VIII · XII · XX · XL), `maxDmg` reproducing the formula exactly.

**The practice rooms keep it, deliberately.** Boss Rush, Pattern Lab and the tutorial still regenerate
2.6/s after 3.8s. A fight costs a median 94 HP, so on survival rules Boss Rush would grant about one and
a half attempts a session and teach nothing — and teaching an Anomaly's pattern is the only reason it
exists. Verified per mode on the seam: survival **0.000 HP over 5s**, Pattern Lab **+13.000** (2.6 × 5),
Boss Rush **+1.300 per 0.5s across 5 clean trials**, the sixth trial correctly interrupted by an Anomaly
hit that reset the gate.

⚠️ **A drain sweep was run and thrown away rather than published.** It reported HP/s per Epoch and both
its axes were wrong: `killBoss()` on sight silently **advances `act`**, so every row was labelled with an
Epoch it was not measured at, and Epoch I came back at **49.2 HP/s against a ceiling of 27.5** that
`IFRAME` makes arithmetically impossible — a number that large is the rig failing, not the game being
hard. Recorded because the replacement measurement (read the scalar off the bodies, pin `act` every
batch, no pilot at all) is the one that should have been run first.

⚠️ **Where a run actually ends is unmeasured, and this project's bot cannot measure it** — it does not
dodge, so it prices every hit as unavoidable and will always report the economy as harsher than a human
finds it. The +30 is **not tuned**; it is the previous value, kept deliberately until someone plays
this. The tuning knob is the purge heal, never the damage scalar — the scalar is what ends runs, and
that is the feature.

*Also:* the Aegis hole (−23.5% survival, variance halved) is now **wider than its own numbers say**,
since those were measured on a build that still refunded damage. MECHANICS' *no heal beats the lockout*
closes — there is no lockout — and the half of it that mattered, **"is a bad Epoch still recoverable?"**,
is promoted from footnote to the sharpest open question in the file.

### The port: the zones verified on a real device, CSP closed, and a probe to measure with `v2-ios`
The three-zone control was measured on the seam in a browser and shipped **unverified on iOS**. It is
verified now, and the certifier is the game itself: the tutorial gates each step on actually performing
the verb, so walking it end to end on iPhone 17 / iOS 26.5 proves all three zones —
**1/6 → 2/6** (drag the left half), **4/6 → 5/6** (press bottom-right, star cyan → pink),
**5/6 → 6/6** (hold top-right, meter drained). Holding Overdrive did **not** trip Pause, which is the one
ergonomic question `66d8244` recorded as unmeasurable.

The WebView reports **874 × 402**, so the seams land on 437/201 exactly as designed — the safe-area insets
do not shrink the viewport, they only inset `#hud`.

**`connect-src` is `'none'` on both pages.** `7b2f75a` left it at `'self'` for one stated reason: iOS had
never been built against the file and a broken policy would break *silently*. The runtime was then read
rather than guessed at — Capacitor patches fetch/XHR only when `CapacitorHttp` is set (it is not, and a
patched request routes natively, outside any page CSP), and the service worker never registers in the
shell because its call site is guarded `if(!window.Capacitor …)`. Verified live on device.

⚠️ **Found only on the device: the Overdrive button said "SHIFT 유지" on a phone.** A keyboard hint on the
one control a touch player presses — the same lie `#controls` was hidden for, surviving that sweep by
living *inside a button* rather than in a legend. Hidden on coarse pointers.

**`npm run sync` carries the locale now.** `pod install` dies with an `Encoding::CompatibilityError`
whose backtrace names only ruby and cocoapods and reads like a broken install; it is `LC_CTYPE=C` making
`Dir.pwd` ASCII-8BIT under CocoaPods 1.17.0 / Ruby 4.0.6. Proven by deleting `Pods/` and resyncing.

**A DEBUG-only JS probe now exists in the shell**, because it had no way in *or* out: Capacitor prints
JS console output with `print()`, which stdout-only and invisible to `log show`, and the WebView loads a
fixed URL with no query string. `--evalJS` + `NSLog`, gated `#if DEBUG` because it evaluates arbitrary JS.
It polls for readiness rather than sleeping a guess — a flat 1s delay reported
*"undefined is not an object"*, which reads exactly like a stale build and was really a 600KB page still
parsing.

⚠️ **The sky cache is still not measured, and the reason is worth more than the number would have been.**
Two rigs disagreed by **4×** (+37% vs +150%) and the cause was the *reading*: a simulator screenshot is
expensive and lands on the machine being measured, and one fell inside a window. That is the same defect
that invalidated every earlier attempt at this figure, in a new place. Polling `log show` is the same
mistake in different clothes. See MECHANICS *Open* for the table and for why **even a clean simulator
number would not close the item** — the simulator runs on the host Mac's GPU, and the cache was bet on
fill-rate-bound hardware.

### Touch is three zones now, and tilt stops steering `66d8244`
Author: *"three touching point for control (move half, overdrive quart, flip quart)"* — v2's feature, on
the `v2` branch. The canvas partitions by geometry: **move on the left half, Overdrive on the top-right
quarter, flip on the bottom-right quarter**, decided by `zoneOf(x,y)` in CSS pixels.

**Overdrive sits above flip because the two have to work at the same time.** Overdrive is held for
seconds and you keep flipping through the ride, so they cannot share a thumb; top-right is where a
landscape grip already rests an index finger. Verified with three fingers down at once — stick at full
deflection, a flip landing mid-burn, and the burn surviving it.

**Flip fires on PRESS, and that is the change with the most feel in it.** Under the intent-split scheme
it could not: until you lifted there was no way to know a press was not the start of a drag, so flip
carried up to `TAP_TIME` **300ms** of latency a player could neither see nor shorten — on a *timing*
verb. `TAP_SLOP`, `TAP_TIME` and `tapMoved` go with it. So does `TOUCH_LIFT`, which was a correction for
a problem the old scheme created: absolute steering put the finger over the whole arena, so the star had
to be drawn 55px above the fingertip to stay readable. A stick does not park your thumb on the star.

**The move zone is a virtual stick with a floating origin**, and `STICK.speed` is **the one tuned number
inherited intact from tilt** — 14 units/frame, set against the game (Charger dash 9.5) rather than
against a sensor. Measured on the seam: **exactly 14.00/frame idle, 19.60 under Overdrive** (14 × 1.4).
The origin follows past full deflection — shoved 200px from a 100px origin it lands on exactly 236 —
because otherwise a thumb going down near the left edge runs out of zone before it runs out of stick.

⚠️ **One dead zone on the magnitude, not one per axis.** Per-axis is right for tilt, where the axes are
two readings; a stick has one offset, and dead-zoning components independently **notches the diagonals**.
Verified un-notched: (5,5) gives both components 0.013 rather than both zero.

**Selected by the event, not the device.** `isTouch(e)` decides per event — the third selector this file
has had and the first that cannot be wrong about the hardware, because it makes no claim about it. The
two it replaced were guesses (`pointer: coarse`, then a stored preference) and both stranded real players.

**Tilt is retired as a steering path.** `stepTilt`, `touchSteers`, `refreshTouchSteer`, `#tiltDiag`,
`TILT_STALE_MS` and the tutorial's third device case are gone. ⚠️ **The bridge is kept intact and
unwired** — `MotionBridgeViewController.swift` still feeds `__nativeTilt` at 60Hz and `tiltVec` is still
maintained and readable from the seam; what no longer exists is a consumer. The stale-feed warning went
because a silent sensor is no longer a fault the player can be hurt by: touch cannot stop working.

⚠️ **The utility cluster had to move.** `#muteBtn`/`#motionBtn`/`#pauseBtn` were stacked up the right edge
**inside the flip zone** — three holes in the quarter a thumb taps most. Mute and Reduced motion duplicate
Settings rows and are hidden on coarse pointers; Pause moves to the top-right corner.

⚠️ **What is NOT verified is whether it fits a hand.** Partition, dead zone, ramp, origin-follow,
diagonals and all three verbs concurrently are measured on the seam at 874×402 with zero console errors.
Ergonomics are argued. The median scripted pilot has no thumbs.

### MECHANICS said "portrait" for five days after the code said landscape `66d8244`
Found while building the zones on the landscape geometry. `c6b59b5` moved `Info.plist` and the manifest
to `LandscapeLeft`/`LandscapeRight` **and refuted the fairness argument that had justified the portrait
lock** — `S` keys on the short side, so rotating is area- and spawn-radius-neutral (1.391M and 1044 both
ways). MECHANICS kept making the refuted argument anyway, under the heading *"Portrait is enforced
natively, and it is a fairness rule"*.

**The fact was changed and the reasoning resting on it was not grepped** — this file's own recurring
failure, and it would have told a reader that the new touch layout was built on the wrong axis. Corrected
in place with the retirement recorded rather than quietly overwritten. ⚠️ Note which side stayed right:
the **plist comment** tracked the change and the **prose two directories away** did not, so the hazard is
not the language boundary — it is that a restated fact has two owners and only one of them edits.

### The iOS shell builds, and the CoreMotion NaN guard has now been compiled `(no code change)`
`e82194d` shipped a Swift guard against a non-finite attitude reaching `%.3f` — where `.nan` renders as
the bare word `nan`, an undeclared identifier that throws a ReferenceError 60×/second — and PATCHNOTE
recorded it as *"edited but **not built** this session"*. It builds: `** BUILD SUCCEEDED **`, one warning,
`App.app` produced against iPhone 17 / Xcode 26.6.

⚠️ **`pod install` on this machine dies for an unrelated reason worth writing down**, because the
backtrace names only ruby and cocoapods files and reads like a broken install. The shell locale is
`LC_CTYPE=C`, so `Dir.pwd` is ASCII-8BIT and CocoaPods 1.17.0 calls `String#unicode_normalize` on it:
`Encoding::CompatibilityError`. `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` fixes it, verified both ways, and
`npm run sync` shells out to `pod install` so it belongs in package.json rather than in someone's memory.


Author: the two later kinds felt sluggish. `VAR_PAT` gives each kind a firing-gap multiplier at
**0.8**, folded into a `pcad` that is `pace.cad × pace.pat` — **a separate axis from the Epoch ramp,
and deliberately not on the hunt.** Speeding up the hunt answers *"the Anomaly crowds me"*, which is a
different complaint; `huntT` still takes `cadence` alone, verified at both its sites.

Measured, 3 independent sweeps, 363s per arm, Epoch III:

| | control | pat 0.8 | |
|---|---|---|---|
| Sentinel seekers/min | 44.6 | 56.5 | **+27%** |
| Bastion mines/min | 59.0 | 75.5 | **+27%** |
| Bastion novas/min | 12.8 | 15.0 | **+18%** |

**The nova gains less and that is correct, not a shortfall.** Its cycle is `novaT` *plus* a flat 0.9s
`novaCharge` wind-up — the telegraph that lets you find the seam — and only the gap scales. Mean cycle
`3.6 + 0.9 = 4.50s` becomes `2.88 + 0.9 = 3.78s`, so **+19% predicted against +18% measured**.
Shortening the tell would be a fairness change wearing a tempo change's clothes.

⚠️ **The oracle changing here is the pass, not the failure.** `boss-sentinel` and `boss-bastion` moved;
`boss-emitter` and all three survival seeds are byte-identical. Those are exactly the two keys in
`VAR_PAT` and nothing else — **an all-identical suite would have meant the rig was broken, not the
change safe.**

*Getting there took three rigs.* The first read **3.4×** for a change designed to buy 25%, because a
long boss run is a blend of kinds (see *Traps*); the second counted the contamination instead of
excluding it, its tell being that the identity break landed on the same frame every run. Only the third,
cut at `boss !== b`, gives kind-pure counts.

### Four fixes that cost the game nothing, proven `79f788e`..`e82194d`
- **`spawnBoss` refuses an unknown variant** (`b9a5073`) — it used to build a *complete Emitter* under
  the wrong name, silently. See *Traps*.
- **CSP on both pages** (`7b2f75a`) — `default-src 'self'`, `object-src`/`base-uri`/`form-action` `'none'`.
  ⚠️ `connect-src` is `'self'` rather than `'none'` **on purpose**: the same file loads in the Capacitor
  WebView and iOS was not built this session, so tightening it blind would break there silently. It is
  one word to change once someone runs an iOS build against it. ⚠️ `frame-ancestors`, `report-uri` and
  `sandbox` are absent because **a `<meta>` CSP ignores all three** and Pages cannot set headers — so
  there is no clickjacking protection on this host at all. A host limitation, not an omission.
- **CoreMotion NaN guard** (`e82194d`) — Swift, edited but **not built** this session.
- **A mine death names itself in Korean**, and the legacy string is escaped at the records sink (`396db20`).

A–D run as their own arm measure **96/96 identical**, so all four are provably play-neutral.

## 2026-08-09

### The repository goes public, and a note that was true while it was private stopped being true `4878bdc`
`kdman98/orbital-crash` is public and Pages is live, so all three links the submission prints resolve —
play, source and video, measured 200 logged-out. 18 backed-up commits were pushed first, so Pages serves
current HEAD; verified byte-identical by SHA-256, then loaded and confirmed to boot with no console
errors. README is cut to a landing page, 167 lines → 33.

⚠️ **`docs/SCOPE.md` is readable in the published history and this was decided, not overlooked.** It left
the tree at `f2eae31` but survives in 7 commits; a clone of the public URL recovers 317 lines including
the price points. Purging would rewrite every SHA from 2026-08-04, breaking **2 of the 3 evidence hashes
printed in the submission PDF** (`bf2eb84`, `7b68016`; `1a980bb` predates it) and most of this file's 110
hash citations — against a plan the author says has been superseded twice since. Accepted on that trade.

**The reusable part is how the note went wrong.** `.gitignore` justified the arrangement in its own
words — *"Removed from tracking rather than from history"* — and that was **correct while the repo was
private**. Flipping visibility inverted it, and **nobody edited anything, so nothing looked stale**. It is
the conclusions-outliving-arguments failure with the argument living *outside the tree*: the premise was
the audience. Filed in *Traps* with the check, which is a calendar item rather than a diff — before making
any repo public, re-read every note that justifies itself with "it's private".

### The tutorial stops opening itself, and the menu door glows instead `f122816`
Author: *"when entering game for the first time, don't show tutorial as soon as game start, just highlight
tutorial."* A mode that starts itself answers a question the player has not asked — a new arrival met a
lesson about the game before the game, on a screen they never chose to open. The menu now always opens and
`.btn.tut` carries a `fresh` class while the profile has never started a run. `refreshTutBeacon()`
re-evaluates at boot and in `toMenu()`, so the pulse stops on return rather than at the next reload; under
`prefers-reduced-motion` it becomes a static tint rather than nothing.

Verified on a genuinely fresh profile: flag `null`, state `menu`, menu visible, beacon on — then `'1'` the
moment a run is chosen.

⚠️ **The boot-time harness hazard is gone at the source, not merely gated.** The old auto-start could drop
a scripted pilot into a mode with the wave clock parked and damage off, and every tape and fingerprint
would have measured that silently. `tutSuppressed` is kept for the beacon but is **no longer load-bearing
for correctness**. The timing lesson it taught is kept anyway, because it outlives its hazard: `__H` works
because `preload.js` runs first, `__oracle` never could because `.oracle.js` is pasted after load, and **a
gate that cannot fire is worse than no gate because it looks like cover.**

⚠️ **`tutSeen()` changed predicate and the key did not.** `orbitalcrash_tut` meant *"this profile loaded
the page"* when `markTutSeen()` fired on the boot run; it now means *"this profile played something,"* set
by the first run the player chooses. Same key, same name, different question — invisible to a grep.

### The Brute gets its Overdrive widening back, and the fix was the Brute rather than the ring `ecfbdf2` `130797e`
The eddy retune below left heavy Dots with no widening at all: the burning ring is ceiling-limited, the
Brute had the lowest ceiling, and pulling the orbit in took back everything the ceiling was giving it.
`heavy.maxsp` goes **2.0 → 3.2** and the orbit is untouched — the ring was never where the fault was.

Measured: the repair moves the Brute's burning shell by **+27.6px**, so Overdrive now opens its ring by
**+24.7px** against a resting 116.4, where before the gain was too small to have a reliable sign.
**The resting shell is 116.4 before and after** — a 60% raise of a number that reads like a speed moves it
by nothing, which is the prediction the spin-limited/ceiling-limited split makes and the reason this edit
is inert everywhere except the one regime that reads a ceiling. ⚠️ **The Brute is not faster in play:**
`maxsp` is a ceiling, pace is `seek × 6.1429`, and cruise is **0.921 before and after**. Ring ordering is
unchanged too — Mini 26.00, Drifter 20.74, Brute 19.52.

⚠️ **The pre-fix residual is quoted nowhere on purpose.** Two rigs measured it at **−2.9px** and
**+1.3px** — opposite signs, both effectively zero, and *smaller than the standing 2–3% disagreement
between the rigs*. The repair itself measures **+27.6px** against **+27.1px**, inside 2%. **A delta from
two rigs that disagree on level is trustworthy; a level is not.** An effect smaller than the disagreement
about it is not a finding, however many decimals it has.

⚠️ **"Sixty-four bodies" in the Cross note was a measurement of the harness.** `resize()` early-returns on
a zero viewport, so `W`/`H` keep their seeded `REF_SHORT` and the design arena stays a plausible-looking
**800×800 square**. Real counts, reproduced on both rigs: **64 / 84 / 92 / 116** at 800×800 / 1280×800 /
1440×900 / 1920×1080, and **100 on a 390×844 phone** — more than a 1440×900 desktop, because the short
side sets the scale so a tall viewport is a tall arena. A wrong arena does not look wrong; it looks square.

### The Cross is telegraphed, because "you start mid-quadrant" was an argument and not a signal `bee3201`
Four arms landing on open ground in one frame, with nothing before them. The defence in the file was
real — the arms are rotated half a sector off your own bearing, so you always begin mid-quadrant, about
1.7s from the nearest arm — and it is also **something only a reader of the source can collect**. The
author reported the Cross arriving with no warning and was right; a head start is not a cue.

`warnSpawn` could not do it per body. Each mark draws its incoming ring at 3r = 78px against 44px arm
spacing, so the marks would overlap into a violet wall and hide the shape, which is the only part worth
reading — and warning a subset is the sign-without-a-body the danger-sign law forbids. So `warnForm`
lets **one mark own a whole formation**: it draws the shape and then spawns the shape, from the same
closure over the same geometry, keeping the invariant that there is no second list to disagree.

Verified: nothing spawns on the call, bodies land at **frame 72 = 1.200s** exactly, four bearings at
45/135/225/315°, **0.0000px** off-axis, hub **65px** off the star = `CROSS_R0 + P.r + 20`.

### The burning ring is pulled in toward the resting one, and the coefficient now points the wrong way `bee3201`
`P.eddy`'s orbit fraction goes **0.72 → 0.45** on a play note: the burning shell sat so far off the
resting one that the two read as unrelated states rather than as one ring opening up. Measured at HEAD
on a Drifter, star pinned, damage off: the shell settles at **145.0** against a resting **114.2**, and
turns **1.367 rev/s** against **0.401**. A full meter is a 3.02s ride and buys **4.12 revolutions**.

⚠️ **The coefficient is now BELOW the resting one (0.45 against 0.6) while the shell stays 30.8px
wider.** They no longer even order the same way, because the overshoot is not a constant fraction — 2%
at rest, 70% while burning, and it *grows* as the target shrinks, since the body's speed is pinned at
its ceiling and a tighter circle needs a bigger standing spring error to hold it. Anything computed by
scaling the old overshoot lands about 60px wrong, in the reassuring direction.

**What it cost: the species spread.** The resting ring is spin-limited and every species sits at
4.8px/frame; the burning ring is ceiling-limited and each species rides its own. So burning opens a
Mini by **+55.7px**, a Drifter by **+30.8px**, and left a Brute with **nothing measurable** — the
tutorial promises "a wider, faster circle" and for a Brute only the second half was true. Accepted
knowingly at the time: Drifters are the modal spawn. ⚠️ **Superseded the same day by `ecfbdf2` above**,
which gave the Brute its widening back through `heavy.maxsp` instead of through the orbit. *(This entry
first reported the Brute residual as −2.9px. That figure is withdrawn: the other rig read +1.3px, and
the effect was smaller than the disagreement about it.)*

**What it did not cost: the lever.** Re-measured in the standing-population regime — *flipping every 47
frames, damage off, star stationary, 120s, paired on seed, n=16* — suppression is **−3.67** against the
old coefficient's −3.42 (95% CI [−5.21, −2.14], *t* = −4.69). Nominally 107% retained, inside noise,
so call it unchanged: the spin rose to meet the shorter reach and the ring sweeps the same area.

⚠️ **The code comment and the docs disagree on the third digit and on one sign.** The comment reads
Drifter 148.1 / Mini 160.2 / Brute 117.5 and calls the Brute `+1.0px`. The two rigs agree *exactly* on
everything that is not a burning settle — resting 114.2, the 20.74px/frame ceiling — and scatter ±2–3%
with no consistent sign on the settle itself. Two candidate causes were tested and refuted (not a
global scale term, not star motion). Unresolved, and recorded as unresolved.

## 2026-08-08

### The sky is painted once instead of sixty times, and the GPU number is not measurable from here `262d334`
One full-screen radial gradient plus five nebula clouds, repainted from scratch sixty times a second —
for a picture that moves **half a device pixel per frame**. It is now painted into an offscreen canvas
and blitted, rebuilt every eighth frame — **except while the palette is easing after an Epoch flip,
when it repaints every frame. That second trigger is what lets the first one be wide.** The palette is
the only input that can move fast, and it only moves for ~2s a lap; `palMoving` (set in `easePalette`
from the largest channel gap the ease still had to close, thresholded at half a channel — below that
the cache cannot round to a different byte) pays the full old price for those two seconds rather than
pinning the counter to the worst thing that ever happens. Everything else is slower than the eye:
clouds 0.25 design units/frame, parallax ~0.14, breath 0.006 of a 0.9–1.05 factor, intensity 0.0007 of
an alpha of ~0.04.

Measured at 2560×1600 under software rasterisation, one canvas, one raster mode:

| | |
|---|---|
| full-screen flat `fillRect` | 0.63ms |
| full-screen radial gradient | **9.35ms** — ~15× the flat fill of the same area |
| `drawNebula`, five clouds | 59.30ms |
| every enemy, mote, particle and lance on the field | **0.60ms** |
| blitting the cached picture | 0.03ms |

**The background was 68.7ms of a 69.3ms frame. The entire game you are actually playing is the last
row.** ⚠️ **The rebuild counter is FRAMES, not `elapsed`** — `elapsed` only advances inside `step()`, so
a time-based clock would freeze the sky on the menu, the pause and the death screen, which are exactly
the states where `palCur` is still easing somewhere new.

Stars now composite above the clouds rather than between them. The reordering is exact in principle —
both layers use `lighter`, which is addition, and `min(1,min(1,a+b)+c) == min(1,a+b+c)` for non-negative
terms — and **very nearly exact in fact**: of 7,500 sampled channels **three differ, each by exactly
1/255**, with whole-frame luma moving 346 out of 310,968,828. That residue is the intermediate 8-bit
round landing on `(bg+clouds)` instead of `(bg+stars)`; it is bounded at one step and cannot grow.

⚠️ **AN EARLIER VERSION OF THIS ENTRY WOULD HAVE SAID "all 4,096,000 pixels identical, FNV `50619787`
both sides." THAT MEASUREMENT WAS BROKEN AND IS RETRACTED.** `navigate` was silently failing, so the
"old" and "new" captures both ran on the *same page* — two readings of one build, read as agreement.
**A comparison that never compared anything returns perfect agreement, which is the most convincing
result it could possibly give.** The corrected rig asserts the URL and a build marker on every load.

⚠️ **THERE IS NO MEASURED GPU-PATH IMPROVEMENT, AND THIS ENTRY CLAIMS NONE.** Every GPU figure produced
for this change is withdrawn. The instrument inverts the work it is aimed at: a hidden or uncomposited
pane lets the browser discard frames it never shows — each frame's opaque background `fillRect`
overwrites the last, so the sky never rasterises — while the cache canvas **is** read every frame by
`drawImage` and cannot be discarded. Regressing total time against batch size exposes it, with "cost per
frame" falling from 81.7ms at batch 1 to 1.36ms at batch 90, because it is one ~80ms readback stall
divided by *M*. **The honest status is: a measured win in software rasterisation, unverified on GPU, and
the real test is a frame counter on the iOS build.**

**Sim untouched, verified independently on both sides:** oracle len 1651 / FNV `e9cc1d16` at `262d334`,
identical to the reading at `9f5d7fd`, re-run with the URL guard and two build assertions (`blitSky`
present, `GRAZE_SCORE` absent) *before* measuring — because a silently-failing navigate is what produced
the retracted number in the first place.

### The graze is removed, and it was never a dodge `9f5d7fd`
Author: *"i'd like to remove graze system, dead score mult. is graze point-blank dodge, right?"*

**No — and that is the argument for cutting it.** A dangerous Dot entering `P.r+e.r+16` and leaving past
`+28` paid 10 points, a white burst and a rising blip, and **no input was required**. It fired on the
Dot's trajectory rather than the player's reaction, and opposite polarity is *attracted* to the Star, so
your own field bent Dots onto the arcs that paid. ⚠️ **The tell had been sitting above it since it
shipped** — *"grazes are luck as often as skill"*, which is why it never paid Capacitor. **A channel the
game would not trust with meter income was still allowed to print score.** If a reward is too lucky to
pay the meter, ask what it is doing paying anything.

**`P.scoreMult` went with it: initialised to 1 and never assigned in 201 commits.** `git log -S
"scoreMult="` returns nothing across the entire history — five read sites multiplying by a permanent 1,
left behind when `mult` was removed. `Math.round` went too, since 20, 5, `200×act` and `250×act` are all
integers and nothing was ever rounding.

**Scoring is now five write sites and that list is the whole model** — `+MOTE_SCORE` on a pickup,
`+KILL_SCORE` on a kill, `+200×act` on an Epoch purge, `+250×act` on a Bounty, `score=0` on reset.
Enumerated statically, which is a stronger proof than any fingerprint. ⚠️ **The two `×act` terms are the
only thing in scoring that scales**, so a claim of "no multiplier" is true of the player's *skill* and
not of the depth they reach — flagged for the submission copy, which currently states it flat.

⚠️ **The oracle moved, and it cannot certify this change.** len 1654 / `9f659ef7` → len 1651 /
`e9cc1d16`. The move was predicted **for the wrong reason** — "graze feeds score" — and the prediction
came true anyway, which is how it nearly passed. Two of six pilot runs then scored *higher* without
graze (emitter 500→785, survival-202 3080→3650), and removing a points source cannot do that. **The real
cause is that the graze's `spawnBurst(…,3,…)` drew 12 `rand()` calls**, so deleting it shifts the seeded
xorshift stream and desynchronises every downstream spawn. Any removal of an effect call has this
property; a moved fingerprint there is not a regression, and the restore point in the code says so.

Verified in place of the oracle: the baseline reproduced at len 1654 / `9f659ef7` off a gitignored copy
of HEAD *before* the rig was trusted; the new build asserted free of `GRAZE_SCORE` in source **and** seam
before measuring; 5,400 frames of `tick()` driving `stepPlayerContact` every frame with zero errors and
zero `console.error`; viewport forced to 1280×900 first, because `innerWidth` reads 0 in that harness.

### The streak label stops fighting the Epoch label for the same row `b241f77`
`{n} no-hit streak` → `{n} streak`, `{n}콤보` → `{n} 콤보`. `#combo` is right-aligned on the same line as
the centred Epoch label, and the English string was 16 characters against Korean's 5 — **which is the
whole reason English overlapped at every phone width and Korean at none.**

⚠️ **Measured before blaming the name, because the obvious suspect was wrong.** Shortening the Epoch does
not fix it: one-word *Meteor* still overlaps 22px at 430, and `EPOCH I · NEBULA` — the *shortest* name in
the set — was already overlapping 43px at 375. **This predates every Epoch rename** and was simply never
looked at, because every name in that slot had been one short word since the first commit. At 375px,
before → after: Nebula 43 → 0, Aurora 43 → 0, Eclipse 43 → 0 (3–5px past a 150 streak), **Meteor Shower
87 → 21–40px**.

⚠️ **Epoch IV is not fixed, and typography cannot fix it.** Sweeping font-size against tracking at the
worst case: 11px/.20em leaves 29, 10px/.16em leaves 15, and even 9px/.18em — far smaller than this HUD's
language — still leaves 8. **At 375px a 24-character centred label and a right-aligned counter do not
both fit.** The remaining options are structural: move `#combo` off the row, or shorten the English name.

*"no-hit" is not lost with the string* — GLOSSARY and MECHANICS both define the streak that way, and the
HUD never taught it anyway; the mechanic is taught by the counter dropping to zero when you are hit.
Korean takes the space deliberately: `23콤보` reads as one token, `23 콤보` reads as a count, and in the
HUD it is a count.

### The Run section pointed at a directory layout that exists only on one machine `bbd1a61`
`git clone` gives you a directory called `orbital-crash`. There is no `ddd-games` root on anyone else's
disk, so *"from the ddd-games root"* plus `localhost:8755/orbital-crash/index.html` was **a 404 for every
visitor who followed it** — paths written from inside a parent that is not part of this repository and
never gets cloned with it. Now: serve the repository root, and the game is at the root of the server.
Kept rather than deleted, because it answers the first question a repository gets.

### The Epochs become celestial, and Meteor Shower earns its name instead of just wearing it `7044f56`
Nebula / Aurora / Eclipse / Meteor Shower, 성운 / 극광 / 월식 / 유성우. **Why the old four felt
arbitrary: no shared domain.** 표류 is motion, 잔불 is fire, 개화 is botany, 밀물 is ocean — each fine
alone, together generating nothing. One idea has to produce all four.

⚠️ **The rename also freed a word that was doing three jobs.** `Drift` was the Epoch, `lab.drift` the
formation, and `Drifter` the Dot. MECHANICS had documented the Epoch-vs-Dot half for weeks and **never
noticed the formation shared it outright, in both languages** — the note named the *site* of the
collision rather than the rule, so it died when the site moved. `lab.drift` is still `Drift` / 표류 and
the Pattern Lab legend still prints it while Drifters are on screen: same rule, one slot over.

**Meteor Shower is a mechanic, not a label.** `isShower(act)` — Epoch IV, VIII, XII, every fourth — puts
the comet formation on formation cadence, `rand(9,16)`, against its ordinary `rand(200,300)`. The
arithmetic is the argument: an Epoch's non-boss window is about 38s, so on the base clock a comet lands
inside any given shower roughly **one time in seven**, and an Epoch named for the shower would have shown
nothing six times out of seven. ⚠️ **Re-armed at the boundary in `onBossCleared`, not only at the fire
site** — `cometT` survives the Epoch change, so re-rolling only where it fires fails in *both*
directions: arrive with 180s left and the shower shows none, leave with 12s left and a stray comet lands
in the next Epoch where nothing explains it. The boundary roll is `rand(3,7)` on entry, which puts the
first one inside the opening calm so the name is true immediately rather than a minute in. Measured
walking Epoch 1→8 purging on sight: **17 comet bodies at IV and 11 at VIII, zero in all six non-shower
Epochs** — including V immediately after, which is the exit re-arm working.

**The palette was re-solved with it**, because a tint is a claim about what you are looking at and a warm
sand sky for an *aurora* is simply wrong. Same floor and same chroma ceiling as `ffebcfe` below, new
arcs — and **the L\* ladder is the point**: hue is capped at chroma 22, so the Epochs carry identity in
lightness instead, Eclipse 46 the darkest sky in the game and Meteor Shower 74 the brightest. That is the
one channel polarity does not own.

⚠️ **`#center` was capped at half the screen, and had been since the first commit.** `left:50%` with no
`right` gets `100% − 50%` of the containing block to lay out in, and the transform re-centres a box that
was *already* squeezed — so at 375px the slot was 187.5 and the new name wrapped onto the timer. **Not
caused by the name**: `EPOCH XXXIX · ECLIPSE` measured 161px, already within 27px of wrapping, unnoticed
only because every name in that slot had been one short word for the project's whole history.
`left:0;right:0` hands it the full width and lets `text-align:center` do what the transform was
imitating. `#hud` is `pointer-events:none` and the subtree opts nothing back in, so a full-width box
intercepts nothing. **`#achv` still has the same bug** — its `max-width:90vw` cannot exceed the 50vw it is
given — and was left alone on purpose: different element, different change.

⚠️ **Measured and left rather than fixed:** the English centre label overlaps `#combo`, 43px at 375 and
16px at 430 for `EPOCH I · NEBULA`, 87px and 60px for Meteor Shower. **Shortening the Epoch name does not
fix it** — one-word *Meteor* still overlaps 22px at 430. The long string is English's `{n} no-hit streak`
at 16 characters against Korean's `{n}콤보` at 5, which is why **Korean overlaps by zero at every width**.
The fix belongs on that string and it is a copy call, so it is open rather than guessed at.

Oracle byte-identical, len 1654 / FNV `9f659ef7` — the pilots run 40s and the comet gate is
`elapsed>42`, so no pilot ever reaches a shower and the suite could not have caught a regression here.

### The Epoch palette stops spending polarity's colours, and Epoch XIII stops calling itself I `ffebcfe`
**Drift's tint was `#38e0ff` — `COL.cyan` character for character.** Not "close to"; the same six digits,
and `git log -S` puts both hexes in the same first commit, so nobody chose it. One blue got typed twice.
Bloom sat ΔE 13.3 from `COL.violet`, the event flash, so a violet cue fired against a violet sky. Ember
sat ΔE 13.7 from colourblind red — `#ff7a4d` against `#ff7a2f`, differing in the blue channel alone —
inside the "unsafe on a small fast object" band declared above `PAL`, **in the mode a player turns on
precisely to find red things**.

`tint` is not scenery: it paints the nebula's accent clouds, 22% of every star layer, and the Epoch
label. It is drawn among the Dots, so it owes the same one-colour-one-meaning law they do.

⚠️ **The wheel is full, and that is the finding.** Solving for four tints ≥ΔE 32 from every colour the
game has already claimed has **no solution above chroma 22** — the rose wedge Bloom needs is walled in by
violet at 307° and red at 15°. Four saturated biome colours do not fit next to polarity plus the cue
vocabulary. So these are a cast rather than a colour: L\* 58–70 at chroma 22, four skies still 30.3 apart
at the closest, nearest claimed colour 32.4. **Adding a fifth mood means re-solving, not guessing.**
`bg1`/`bg2` untouched on purpose — at L\* 1–7 they are black with a hint, and the measured sky medians sit
ΔE 85–96 from both poles. They were never what was competing.

⚠️ **The four tints this commit chose no longer exist — the constraint it discovered does.** `7044f56`
re-solved inside the same floor and the same chroma ceiling and replaced every hex, so `#709bbb`
`#c3a685` `#a97f99` `#83b6a0` return **zero hits** at HEAD, and the ladder above reads L\* 46–74 there
rather than 58–70. **The order is the part worth keeping**: the chroma-22 wall was proven here and only
*inherited* by the rename, which had to re-solve within it rather than arriving with it. Read as dated
history, not as the current palette. (`#38e0ff` and `#ff7a2f` above are still live at HEAD, being
polarity and colourblind red; Ember's own `#ff7a4d` went with this commit, which is the point of it.)

⚠️ **`palCur`'s seed held its own literal copy of `#38e0ff`** and still did after Drift's moved — a fourth
copy of the polarity blue, painting the boot frame in the exact colour the change existed to remove. It
eased away within two seconds of first render, which is why nobody would ever have caught it by looking.
Now derived from `ACTS[0]`.

**Separately, the numeral lied.** `ROMAN` was a 12-entry array and every site indexed `[(act-1)%12]`, so
at Epoch 13 the HUD printed `EPOCH I · DRIFT` — byte-identical to the run's opening frame — and Records
filed the deepest run anyone had played under `I`, sorting and reading as the shallowest. **Korean never
had it**: its templates take `{n}`, so it counted 13 while English reset. Same run, two languages, two
different claims about how far you got. Reachable rather than theoretical — 428s of phase clock across
Epochs I–XII plus twelve Anomaly fights, and no boss has a deadline. A wider array would only move the
lie; `roman()` is a greedy subtractive table, exact to 3999.

Verified in-engine on the served file with a new-code marker asserted first: EPOCH XIII / XIV / XVII / XX
/ XXXIX, Korean 13/20/39단계, Records XIII against 13 for one 13-Epoch row. Oracle byte-identical, len
1654, FNV `9f659ef7`.

### The repository becomes publishable: a licence, a play link, and the plan leaves the tree `f2eae31`
Prompted by a public release that wants a public repository, a Pages link, and the full source with its
commit record intact. **All 193 commits audited for secrets first** — every blob ever committed,
against key / token / private-key / provisioning patterns. Zero hits, and no `.env` or certificate has
ever been in this tree, so nothing below is a redaction.

**`LICENSE` is PolyForm Noncommercial 1.0.0**, fetched verbatim rather than retyped. ⚠️ **Not CC BY-NC-ND**
— Creative Commons says in its own FAQ not to use CC licences for software, and ND has no clear meaning
for source code. PolyForm Noncommercial is built for this exact shape: source available, free to read and
run and modify, commercial use reserved. It also leaves ownership with the author, which is what the
terms this release goes out under require.

**`docs/SCOPE.md` leaves the tree** — it is the free/paid split, the recommended price, the Steam page
timing and the revenue expectations, and a reader who came to look at the craft is the wrong audience
for that document.
⚠️ **Removed from tracking, not from history.** A `filter-repo` purge would rewrite all 193 SHAs and need
a force-push, and this checkout is shared by parallel sessions that would then be working against a
rewritten base; the submission rules also ask for the commit record to be kept. The file stays on disk,
gitignored, and still being written. **Its one inbound link, a README row, went with it** — `.gitignore`
is now the only place the string `SCOPE` appears anywhere in the repository.

⚠️ *Two corrections, both dated 2026-08-09.* **That last sentence was false when written** — `SCOPE`
also appeared in a MECHANICS paragraph and in the graze restore-point comment, neither of which a
README-row search would surface. It is the same shape as the sweep that reported *"did this commit touch
`index.html`"* as *"did the game change"*: **the claim was broader than the check behind it.** And **the
file is now deleted from disk too**, at the author's call, once every live item in it had migrated into
MECHANICS or into a code comment — the two inbound citations were repointed at those, and `build_pdfs.py`
now derives the document count and names from its own list, so the submission can no longer print the
name of a document that is not there.

README gains the three things a first-time visitor needs — the play link, the control table, and what
actually kills you — above the developer material, which stays because the source is itself part of the
submission. `.nojekyll` because Pages runs Jekyll by default; `index.html` has no Liquid syntax (0 hits
for `{{` and `{%`, both checked) so nothing would have broken, but one empty file removes the question
permanently. Verified for the subpath Pages serves from: 0 absolute paths in either HTML file, manifest
`start_url` and `scope` both `./`, `sw.js` registered relatively — so `/orbital-crash/` needs no build
step and no rewriting.

### Epoch is 단계, and the Records column stopped disagreeing with the HUD about it `d8de275`
Author: *"Epoch reads 단계 in Korean."* Five sites — `hud.epoch`, `dead.cause`, `dead.causeDev`,
`rc.hEpoch`, `achv.act3.ds` — and 제 dropped with it, because *"제3단계"* is stiff where a game says
*"3단계"*.

⚠️ **And the Records column was numbering the same quantity differently.** The HUD and the death receipt
render `{n}`, arabic; the Records row printed `ROMAN[]` as a raw expression with **no template at all**.
So one Korean run read *"3단계"* on two screens and *"III"* on a third. English is Roman everywhere and
stays that way — the value is now `rc.epochVal`, `'{r}'` in `en` and `'{n}'` in `ko`, so **each language
picks its own numeral out of the same data**. This is the general shape of the rule in *Language*:
templates are handed every variable a language might want, and each takes what it needs.

The anomaly-log chips keep Roman, and their comment stops justifying it by matching the Epoch label,
since Korean no longer numbers that way. They count **Anomalies met**, a different quantity, which is the
reason that actually holds.

Corpus scan of all 159 `ko` keys, clean: no 당신, no ~할 수 있습니다 padding, no imported passive, no 의
chains, no stacked connectives, no latin `s` units left. One term per concept — 콤보, 변이체, 단계,
빨간색/청록색 — with no survivors of any retired name. Placeholder parity holds, the four `{r}`/`{n}`
differences being the per-language numeral, and `<b>`/`<kbd>` counts match on every key.

⚠️ **The first register scan was wrong and nearly reported four false islands**: the pattern listed
습니다/합니다/입니다 literally and missed every other -ㅂ니다 form, so 건너뜁니다, 바뀝니다, 마칩니다 and
지워집니다 all classified as 한다체. **Same shape as the grep that missed `` .oracle.js` leaves `` — a
check whose pattern does not match what it claims to test.** Corrected, and the real answer is five, all
of them achievement descriptions.

## 2026-08-07

### The Moment Engine's audio half `a96d813`
The time side has been live for months (`timeScale`, `slowmo`, `hitstop`); the sound meant to sit under it
had been on the Open list as *"agreed direction that has never been started."* Three pieces, and the
register argument at `bomb()` decided all three.

**Kills are panned by the dying Dot's `x`** — a second axis of separation that register cannot buy, since
two kills at opposite edges no longer stack in the same place in the image. ⚠️ **A panner per voice, not
one shared node re-aimed**: at 5.6 kills/s a shared panner would be re-pointed while earlier blips were
still ringing, sliding every tail to wherever the newest kill happened. ⚠️ **`mote()` is excluded on
purpose** — motes are collected *at the core*, so panning them would report the Star's position as the
event's. `PAN_MAX` is 0.7, because a hard-panned mono voice vanishes from one ear and reads as a broken
channel rather than a location.

**A low-HP heartbeat**, on a clock rather than on damage — it reports a state you are already in, and
`hurt()` stays the only voice that speaks when the core is struck. A *pair*, because lub-dub is a rhythm
nobody hears as a hit. ⚠️ **Gated on alive-and-playing, not on the number**: `P.hp` keeps its last value
through the death screen, so testing HP alone leaves a corpse with a pulse under the receipt. `HP_LOW`
now backs both this and the HP bar's red state — two consumers make a literal a contract.

**A storm bed** — noise through a 150Hz lowpass under a falling sub, faded in from `STORM_AT` so `calm`
stays calm.

**Neither tonal layer is in `bomb()`'s register at all** — the heartbeat runs 30–52Hz and the storm's sub
32–46Hz against its 75Hz floor, **6.3 semitones clear**. Exactly one thing collides: the storm's *noise*
body against `bomb()`'s sub weight, answered on timbre (noise against a sine). **The band that must stay
clear is the triangle at 150–700Hz that identifies the cue, and nothing added goes near it.**

⚠️ *This entry first read "both layers sit in the sub-bass `bomb()` owns … and get away with it."* That
was false about the code and dangerous as a rule — it licensed a periodic voice anywhere `bomb()` lives,
**including 150–700Hz**, where a 200Hz heartbeat variant would satisfy the sentence and destroy the cue.
Corrected after orbital main pulled the actual bands. **A conclusion that is right on a reason broader
than its evidence.**

Measured with **sound on**, which is the inversion of every other test loop this week:

| | peak | rms | clipped |
|---|---|---|---|
| worst-case barrage **+ new layers** | 0.3606 | 0.02753 | **0** |
| same barrage, heartbeat off | 0.3094 | 0.02262 | 0 |

Pan read off a channel splitter rather than off the pan parameter: left bias 1.62, right 0.59
(reciprocal), no-position 0.99 and `mote` 1.00 — both centred. Heartbeat over 6s windows: 0 beats at 31%,
5 at 1.13s at 29%, 7 at 0.85s at 15%, 9 at 0.62s at 4%, **0 at hp=0**. Oracle byte-identical, len 1654,
FNV `9f659ef7`.

⚠️ **The first pan rig reported `R=0` for un-panned cues and the game was fine** — `ChannelSplitter` is
spec-locked to `discrete`, so a mono input leaves channel 1 silent where the destination up-mixes to both
ears. Re-measured through an explicit two-channel speakers-mode gain.

⚠️ **The storm layer's level is not independently verified**, and this is stated rather than implied. Its
gate is readable code; isolating its *contribution* from outside failed, because the ambient bed's gain
also scales with intensity and `ambPluck` fires on a random timer.

**The debug seam gains `audio(dt)` and `bus()`** — fourth of the `render()` / `hud()` / `title()` family
and for the identical reason: these layers step from `frameBody`, so in a hidden tab they never run, a
test hears nothing and reports silence. `bus()` hands back the live nodes so a test can put an
`AnalyserNode` on the mix and measure it, which is exactly what *"it sounds fine to me"* cannot do.

### Dead-point sweep: two CSS rules with no user since `git init` `5a78bb3`
Detectors rather than reading — orphan CSS classes and ids, dangling `el()` ids, ids nothing reads, `L`
keys with no consumer, backticked symbols absent from code, unread consts, uncalled functions,
unreferenced `@keyframes` and `--custom-properties`, across both documents. ⚠️ **Every detector was run
against a planted defect first** (an injected orphan class, a dangling `el('zzNoSuchId')`, an unused key
and a fake symbol — all four caught), because otherwise a clean result is only a tool agreeing with you.

`.deadstats .ds .v.gold` and `--panel` both went: `class="gold"` appears **zero** times, nothing adds it
dynamically, and `git log -S 'v gold'` returns nothing at all — **neither has had a user in recorded
history.** Both arrived with `e21eda6`, the pre-version-control snapshot, and neither could have been
caught by reading, because a dead rule looks exactly like a working one.

GLOSSARY still pointed at the Codex — it had not been touched since `8f32215`, well before `c7da498` —
so *"an in-run feat recorded in the Codex"* now reads **Records**, the Codex moved to *Retired names*,
and a **Records** entry was added that had never existed despite the screen shipping in `1271fe3`.

*Recorded so the next sweep does not re-chase them:* ternary-computed keys (`sw.on`/`sw.off`,
`dead.cause`, `tc.drag`), keys arriving through `data-tt` / `data-ta`, twelve ids built as `pfx+'OdLog'`,
`tdot` as a computed className, and all 26 backticked symbols — every one inside a comment about its own
removal, which the backtick rule allows.

### A Korean playthrough, and the Charger's floating text still named 돌격체 `83e665d`
Played start to finish in Korean on a fresh profile. ⚠️ **`fx.poked` read "돌격체 명중!"** while the
Charger has been 쐐기 since `466efcd` — **the only string in the game that names a Dot outside the name
table**, so the rename swept every other site and left this one pointing at a creature that does not
exist. Nothing but playing could have caught it: it fires only when a Charger's dash is aimed through an
Anomaly. The seconds unit was also hardcoded `'s'` in three places, so one run showed *"25초"* on the
tutorial counter and *"1.5s"* on the death receipt.

*Recorded rather than fixed, because it is unreachable today:* `applyLang()` repaints the run-log labels
but not the chips, so an English label could sit over *"2.2초"* — impossible while the language selector
is menu-only, and reachable the moment one returns to Settings, which opens from pause.

### The Records empty state is one line, and the sentence it dropped lives on the menu `36db0a3`
Author: *"remove everything, leave 아직 기록이 없어요!"* ⚠️ **Checked before cutting, because the deleted
sentence had a stated reason** — the comment above `openRecords` argued the empty state *must* say that
Boss Rush and Pattern Lab never record. That fact does not leave the game: `menu.note` states it in
`.doornote`, under the two mode buttons, which reaches the player *before* they spend a run rather than
after. **This is the `706673e` pattern with the answer coming out the other way** — there the backup was
deleted because the primary existed and the primary was later removed; here the survivor is on the
earlier screen, which is the better home. The comment records where it went.

### Step 5's note reports a state instead of promising an action `0d72439`
The note slot is a live readout — its neighbours are *"{n} / 4 수집"*, *"연소 중"*, *"{n}초"* — and the old
text promised something that had already happened, since the step's setup writes `P.charge=1` before the
line is shown. ⚠️ **Spaced 충전되어, not 충전 되어**: 되다 as a passive suffix binds to the noun, so the
space is a 띄어쓰기 error rather than a choice — same class as 빨강색 → 빨간색 in `466efcd`.

### 연쇄 반응 → 콤보 반응, which retires 연쇄 from the game entirely `7c67307`
Closes the loose end `466efcd` left: that commit moved 연쇄 → 콤보 everywhere *except* this achievement
name, kept because 연쇄반응 is the pun the English *"Chain Reactor"* is making. Rendered in Records it read
*"연쇄 반응 · 60콤보를 달성한다"* — **a name using a word the game no longer used, next to its own
description using the word it does.** English keeps *"Chain Reactor"*: the pun survives translation
either way and both names mean the same thing, so it is a wordplay difference rather than a content one.

### The Codex is deleted, and the two comments that leaned on it now say so `c7da498`
Author: *"remove codex."* Gone entirely — the overlay, the menu link, `openCodex` / `closeCodex`, the
Escape handler, the seam export, `#codexBody` and the `.cxs` rules with their two Korean overrides, and
the `codex.*` keys in both tables. **157 keys per language**, down from 161, `L.en` and `L.ko` still equal
with nothing missing either side.

**Nothing needed rehoming**, and the argument that it did was retired first — see the two entries below.
Two of the four "irreplaceable" facts are taught by contrast in the tutorial, one was contradicted by
`flip()`, and the last was a true claim about progression whose literal surface Records had already made
conspicuous.

⚠️ **Two comments justified a rule by citing the Codex as a second source, which is exactly how `706673e`
spent the Settings footnote.** Both read *"the Codex and the Bestiary both state"*, about a reversal being
the only thing that pops a Neutral. **The Bestiary is the last copy in the game now**, in both languages,
and both sites say so in as many words — because the next person to trim that card will go looking for the
other copy the comment promised them. This is the `706673e` failure caught *before* it landed rather than
two months later: a redundancy cited as a reason is a claim about a file you are not editing.

**The 2×2 `.refs` grid went with the fourth link.** It existed because four labels could not share a phone
row (`1271fe3` measured 305.7px against 331px usable), and at three links it did the precise thing it was
written to prevent — 2 then 1, which reads as a layout that ran out of room. Re-measured after the cut
rather than trusted: one row needs **278.5px of 331px in English, 114.5px in Korean**. The comment says to
restore it if a fourth link ever arrives.

**The sweep went after the reasoning, not only the references** — the achievements-live-here note, the
prose-block rule (the 649-word body is what forced it; the rule outlives it), GLOSSARY's *"recorded in the
Codex"*, MECHANICS' `steer into` rule (which had quoted *"Your own colour is drawn to you"* as its worked
example — deleted copy now, so the rule states the mechanism directly), and the one-question-per-surface
table, which settles its Codex row by having removed the surface.

### The HUD streak reads `{n}콤보` `e603dae`
Author: *"무피격 n콤보 → 콤보."* 콤보 already carries the unbroken sense in a Korean game HUD, so 무피격 was
naming a condition the word implies — and the same counter is 콤보 everywhere else in the Korean build
(`rc.combo`, `rc.hCombo`, `dead.combo`), so the HUD was the one place wearing a prefix.

⚠️ **English is deliberately unchanged and this is a divergence, not an oversight.** `'{n} no-hit streak'`
still names the condition; the Korean no longer does. By `a2fb7a2`'s own rule that is a **content**
difference rather than a register one, and content differences get aligned — but the author asked for the
Korean specifically, so the English is left as written rather than guessed at, the way `02c183f` flagged
its six cards. One key if it should follow.

⚠️ **Staged with the filtered-copy recipe**, because `index.html` held another session's uncommitted Codex
removal at the time (30 insertions, 127 deletions, `codex.body` already gone). `git add index.html` would
have shipped a half-finished removal under this message. Staged diff asserted at `1 1` with zero `codex`
matches; the unstaged 30/127 survived intact. **The strip script fails closed** — non-zero unless it finds
exactly one occurrence, since a replacement matching nothing stages HEAD verbatim and looks like success.
⚠️ **The recipe is not a lock**: the tree is briefly the filtered copy, so a concurrent write in that
window is clobbered by the restore.

### The four "irreplaceable" Codex facts go, and one of them was false `e7444d0`
Author: *"three of them you know from tutorial, and 3 — that is false anyway? remove them."* Both halves
land, and the second is a defect rather than a wording preference.

⚠️ **"It will not touch an Anomaly. Nothing you press will." is false.** `flip()` sets `vdmg=1` on every
ringed Dot when a boss is on the field, and `flip()` is called from tap, from the tap-vs-drag branch and
from keydown. **Pressing the flip button is one of the three erosion channels** — which the Codex states
itself two sections down. The defensible version is the Anomaly section's own, *"there is no button
anywhere that does it **for you**"*, which is a claim about automation.

⚠️ **RETRACTED — "a fact about absence can never be demonstrated"** (`6753f28`, endorsed by both sessions).
**Absence is demonstrable by contrast, and the tutorial already supplies it.** Step 5 has you hold
Overdrive and watch the Capacitor drain, then release — that *is* "drains while held, can be spent
part-way". Steps 2 and 3 put same-colour and opposite-colour on screen back to back, so you watch one come
to you and the other chase you — that *is* "you have no hold over the opposite colour". Two of the four
were being taught the whole time the rule said they could not be.

**The method failure is the part worth keeping.** This pass verified staging parity, key parity, text
overflow, the oracle fingerprint and a misleading comment in the force loop — and nobody checked whether
the four sentences being argued *for* were true. `LIKE_GRAV` had been traced through `stepEnemyForces` an
hour earlier by the same session that then quoted *"nothing you press will"* without opening `flip()`.
**Scrutiny went to what was doubted, not to what was being defended.**

⚠️ **And the fourth — "nothing carries from one run to the next" — should not be restored either**, which
retires the *"removing the Codex is a four-fact deletion"* framing entirely. `store.best`, `store.achv`,
`store.runs` and `store.totals` all persist, and **Records has a section headed `Lifetime` / `누적`** that
tallies runs, time in the field, best combo and Anomalies met. A player reading that sentence is one
button from a screen listing exactly what carries.

Precisely: the sentence is **true about what it claims** — its own paragraph opens *"Nothing here levels
up. There are no upgrades"*, and no *capability* carries; achievements unlock nothing and there is no meta
economy. It is the **literal** reading that fails. ⚠️ **And that reading was already loose before Records
existed** — `orbitalcrash_best2` is present in `1271fe3`'s parent, so the best score always carried.
`1271fe3` did not falsify the sentence; it gave the loose reading a screen with a heading on it. The order
still matters, because `706673e` had deleted the Settings footnote *because the Codex carried the fact*,
ten minutes and two commits before Records shipped.

English 649 → 636 → **559** words; Korean 1655 → **1457** characters. *Capacitor and Overdrive* drops to
two paragraphs in both languages.

⚠️ **The first verification run was a stale build and looked like a failed edit.** The server on 8777 had
died; `navigate` still reported success, the page rendered from cache, and every removed string came back
*present* with the word count unchanged at 636. `curl` returning an empty body is what settled it. Asserting
the removed strings absent from the **served** HTML — before taking any measurement — is the check that
makes the numbers mean anything.

### Achievements move to Records, and the Codex trims by paragraph `80f59b8`
Author: *"move achievements into records and trim the codex."* Records is headed **"What you have done"**
and the achievement list was a second answer to that question one menu entry away — two entries for one
question, which is the fault the `.doors`/`.refs` grouping exists to prevent. The rows were already
detachable (`{achRows}` was a template variable), so the builder moved to `openRecords` whole. `.cxa`
becomes `.acv` and `codex.secret*` becomes `rc.secret*`, because both names claimed the wrong panel.

⚠️ **The trim is by paragraph, not by section, and the section-level version was my recommendation.** I
had argued to the author that the tutorial made *The charge law* and *Capacitor and Overdrive* redundant.
Read at HEAD that is false: **the sections are mixed, not redundant.** Cutting them whole would have
deleted four things six tutorial steps never reach — that nothing carries between runs, that Overdrive
drains while held and can be spent part-way, that it cannot touch an Anomaly, and that you have no hold
over the opposite colour at all. What went instead is exactly what steps 2, 3 and 5 *demonstrate*: the
charge law 3 paragraphs → 2, Overdrive 4 → 3. In English 649 → 636 words, small on purpose — the page's
real reduction is the five achievement rows leaving. A bigger prose cut means removing things the tutorial
does **not** cover, which is a different decision.

⚠️ **`rc.wipe` does not clear `store.achv`.** `onWipe` resets runs, totals and best and never touched the
feats — right, since a feat is not a record — but the list now sits on the same screen as that button.

Key arithmetic: **160 → 161 per language**, being +3 new `rc.*` and −2 retired `codex.*`, with `L.en` and
`L.ko` at 161 each and zero missing either way. Verified in both languages at 1000×1000 and 375×812: zero
text overflow, no horizontal page scroll, no console errors, and the rows compute `display:flex` — which
is the check that proves `.acv` binds rather than being a class with no rule behind it.

⚠️ **The first overflow reading was fiction**, and `0fe12c5`'s guard is what caught it: 112.85px of
"overflow" against an 18px-wide container, because the Browser pane's viewport had collapsed to 0×0 and
`94vw` resolved to nothing. Asserting `innerWidth` non-zero *before* measuring is not optional here.

### English follows the Korean, because the Korean is the one that was authored `a2fb7a2`
The author rewrote the copy in Korean and the English stayed as it was, so the two languages **stated
different things on fourteen strings**. English is the stale half, so it moved: all six flagged Bestiary
cards plus the Pulsar and the Brute, and in the game the Anomaly's hunt line, the touch legend, the
colourblind row and five tutorial lines.

**Register differences were kept, content differences were not** — *"Enter the field"* against 게임 시작,
*"Reforge"* against 재시도, *"How to play"* against 튜토리얼 are each language's own voice for one meaning,
and flattening the English into a literal echo would lose the voice without fixing anything.

The Brute's card **loses a sharper claim on purpose**: the English had said *"the one Dot that walks out of
a Bomber blast"*, which is true and measurable (`BOMB_DMG` 2 against heavy's hp 3), but the author's
reference reads 가끔 광역 공격을 버팁니다 and the English now matches that. The code still says it survives
every blast, not sometimes.

Side effect worth recording: the English tutorial lines got longer, so **the Korean/English pacing gap
closed on its own** — +16.8% back to +12.7%, inside the ±15% band it had left. Each language now has
exactly one line at its ceiling.

### The Bestiary copy pass, and the Brute's card names the blast it survives `02c183f`
Author revisions across every card, and the register moves with them: the Bestiary goes from 한다체 to
합니다체. The author rewrote eight tags; leaving the other four in the old register beside them would have
put **two voices in adjacent cards of one grid**.

**Two renames travel into the game, not just the card** — 무극 → 중립 입자, and 행성 → 불안정한 행성 /
Unstable Planet. A Dot named one thing on the death receipt and another in the Bestiary is a card a player
cannot connect to the run that sent them looking for it. Measured at 375px: the Records *사인* column holds
청록색 불안정한 행성 on one line with 97.6px to spare in a 194px cell.

⚠️ **EN and KO now diverge on six cards** — the author gave Korean only for bomber, charger, neutral,
planet, boss and sentinel. The English on those is left as written rather than guessed at. (`a2fb7a2`
above is the pass that closed this.)

### The author's copy pass: 변이체, 콤보, 청록색, and eight Dot names that read as Korean `466efcd`
Four terminology sweeps, running through the Codex prose and the Bestiary as well as the tables:
변칙체 → **변이체**, 연쇄 → **콤보**, 시안 → **청록색**, 빨강 → **빨간색** (not 빨강색 — 빨강 and 빨간색
are the standard forms and 빨강색 is not one of them). 연쇄 반응 keeps 연쇄, because that name *is* the
chain-reaction pun; only the term moves.

**Four of the eight Dot names ended in -체** — 폭격체·돌격체·중성체·추격체 — which is the stiffest way to
name a creature in Korean and made the roster read as one part of speech repeated eight times. Concrete
nouns instead, each naming the thing's one property the way the English does: 떠돌이, 화살, 덩치, 폭탄,
쐐기, 무극, 위성. 행성 / 위성 is a pair the English does not have and earns its place — the Harrier is too
fast to turn, so your field cannot pull it in; it catches it into a long orbit and it circles you until it
runs out of speed. **A satellite is what it becomes, and it names the one property a still image cannot
show.**

⚠️ **The read-time ceiling is now per-language, and that is a consequence rather than a tidy-up.** The new
copy is longer, and at the old 5.2s cap the two longest lines read ~14% faster per syllable than every
other step — the flat-floor fault of `9beb77b` wearing a hat. 6.0s for Korean uncaps `tut.2.ok` and still
bounds `tut.5`.

### The language switch moves to the menu, where you can find it without reading `c148c26`
**A player who cannot read the menu cannot be asked to work out which of four ghost links says
"Settings".** That is the one control whose discoverability must not depend on reading the language it
exists to get you out of. It shows **both** languages rather than the current one: a single pill reading
*"English"* tells a Korean speaker nothing about what pressing it does, while two labels each in their own
script need no reading at all. Neither string goes through `T()`.

⚠️ **The obvious home was the HUD's corner cluster beside ♪ and ✺, and it is a trap.** Those buttons
*render* under the menu and are dead to a click — the overlay is z-index 10 over the HUD's 5 — so in a
screenshot they look perfectly available. Caught by hit-testing `elementFromPoint` against the button,
not by looking.

The Settings row stays, because the panel also opens from **pause**, which is the only route to a language
change mid-run. Two entry points, one setter. 플레이 환경 also becomes 보이고 들리는 방식: nothing in that
panel changes how the game *plays* — language, colour, shake and volume are all how it reaches your eyes
and ears, and the Korean was inheriting a claim the loose English headline got away with.

### The Bestiary follows the language `cbae402`
`bestiary.html` is a separate document sharing no code with the game, so it carries **its own table and
its own reader**, and the language travels **in the URL** — an iframe cannot reliably reach the opener's
`localStorage` under storage partitioning, and a `postMessage` handshake would race the first paint of
nineteen canvases.

⚠️ **The frame is cached on purpose, and that turned into a language trap.** Reloading it restarts every
animation on the page, so `openBestiary` tested `if(!f.getAttribute('src'))` — which would have served
whichever language it was first opened in for the rest of the session. It compares the src now, verified
in both directions with the frame already loaded.

⚠️ **`bare` tested `spec.tag`, and every tag had moved into the table.** Left alone it would have read
`undefined` on every card and stacked the Anomaly like a Pattern: wrong layout, no error, nothing in the
console.

IDs are namespaced by kind because `drift` is both a Dot type and a Pattern key — 드리프터 for the
creature, 표류 for the shape. That is a distinction the English does not make while showing both on one
screen. (The creature is **떠돌이** from `466efcd` above; the split is the durable part, the transliteration
was not.) 19 cards, 19 canvases, zero overflow at 375px and at desktop.

### The game speaks Korean, and five things worked only because it spoke English `70f4431` `9b7608e` `0fe12c5`
The layer is `L`, `T(key,vars)`, `applyLang()`, `data-t` on the markup, a Settings row, and auto-detect
from `navigator.language` **on first visit only**. `70f4431` shipped it with `L.ko` empty, so every lookup
fell through to English and the commit is provably a no-op on screen; the copy landed after it.

**The translation was the small half.** Five things in this file worked only because the copy was English,
and every one of them fails silently:

1. **Sentences built by `+`.** English survives `'Lost to '+name+' · Epoch '+n` because it is SVO with no
   case marking. Korean puts the epoch first, gives the killer 에게, and infixes the numeral (제3기). A
   frame with a hole in it is one language's frame. Templates now take every variable a language might
   want — `{r}` roman **and** `{n}` arabic — and each uses what it needs.
   **This is what retired `tutVerb()`** (below, `31816ec`): it slotted *"Click"* / *"Tap"* into a shared
   sentence, and in Korean the verb inflects into the clause after it (클릭해서 / 탭해서) — there is no
   seam to slot a noun into. `tutDev()` returns the **case** now, and the three device sentences are
   written rather than assembled.
2. **`readS()` counted whitespace tokens**, and it sets every tutorial step's dwell time. A Korean 어절
   carries roughly an English clause, so the same instruction word-counts a third shorter — which is
   exactly the complaint `9beb77b` existed to answer. `ko` is measured in syllables instead.
3. **Records stored the display name.** `die()` wrote `lastDmg.src` straight into the save, so every row
   was frozen as *"Brute (cyan)"* in the language it was played in. A damage source is a key pair now —
   `{t,c}` for a Dot, `{m}` for a missile. Rows written by the old build hold a string and render as-is:
   nothing to migrate, nothing erased.
4. **`ctx.font` carries its own stack and cannot inherit.** Three literals said
   `-apple-system,system-ui,sans-serif`, which resolves no Hangul on Windows or Android — canvas text
   would have picked a different fallback from every other string on screen. One `CANVAS_FONT`, three
   users. **No webfont anywhere**: *no build step, no dependencies, no network* is what makes `file://`,
   the service worker and the Capacitor shell all work.
5. **`openRecords` had a local `const T=store.totals`**, which shadows the translator. Renamed, along with
   the twin in `die()` where block scope saves it by a hair.

**The copy is re-authored, not translated.** Carrying the English sentence for sentence is what makes
translated Korean sound translated — 당신의 for every *your*, 의 chains where Korean compounds,
~할 수 있습니다 where 하면 된다 does the job. Register splits the way the English already does:
instructions and settings speak to the player (하세요체), rules and lore state facts (한다체). The Codex's
649 words got their own pass, with the long declaratives **split where the thought splits** rather than
carried across at length — *"Touching it kills it, but it hurts on the way past, so let the rings do that
job instead"* becomes three sentences. Structure is identical to the English by construction: same eight
sections, same paragraph counts, same `<b>` counts, asserted rather than eyeballed.

⚠️ **Two things in this stylesheet were built for Latin, and only one is harmless.** Tracking is the
harmful one: 48 rules carry `letter-spacing` up to `.28em`, which reads as small-caps styling because
Latin capitals are narrow and want the air. A Hangul syllable is already a full square block, so the same
value does not read as styling — it reads as 축 전 기. Every label class is pulled to roughly a third
under `html[lang="ko"]` (`#actlab` 3.08px → 1.1px, `.barlabel` 2.16 → 0.72). `text-transform:uppercase`
is the harmless one and is a no-op on Hangul. **`word-break:keep-all` is the single highest-value line** —
Korean's default breaks between any two syllables, so a wrapped sentence splits words down the middle.

The Korean tutorial rate was **derived, not assumed**: swept 0.13–0.18 s/char against the English total
across all eleven lines, and 0.16 lands at +1.9%. Measured at 1280×800, 375×812 and the 740×420
short-screen branch in both languages, with visibility asserted before every comparison — zero page
overflow anywhere, and the 165px door cells hold Korean on **one** line where English needs two on a
phone. Oracle unchanged with the copy in: len 1654, FNV `9f659ef7`.

### The colourblind option is real, and the diagnosis its name suggests is wrong `7b1cacc`
Author: *"add option for red-green colorblind."* That points at the red/cyan law, and **the law is fine.**
Cyan sits on the blue axis, which is exactly what protan and deutan vision keep: red/cyan measures CIE76
dE **46** after a Brettel/Viénot simulation. The Neutral looked far worse on paper — `COL.neutral`
collapses into cyan at dE 5 — and is also fine, because that body is drawn half red and half cyan across a
turning seam and never wears that colour on the field.

**The real fault is contrast with the background, and only simulating a rendered frame showed it.** Under
deuteranopia `#ff3f6c` desaturates to a dull olive at dE 44 against the `#060814` field. In a real frame —
glow and bloom included, which no palette table captures — the cyan ring reads bright white and the red
bodies sink into the dark. They do not merely resemble each other; **the colour that kills you stops being
easy to see.**

| | vs cyan | vs background |
|---|---|---|
| red `#ff3f6c` | 46 | 44 |
| **orange `#ff7a2f`** | **76** | **79** |

Gold moves to violet `#9b6bff` because orange lands dE 20 from gold — inside the unsafe band and exactly
where it must not be, since the Gilded Bounty is a ring drawn *on* a Dot on a 6s timer and finding it is
the whole task. Violet scores 102 against orange. **Lime is deliberately not reassigned**: it scored best
of any bounty-ring candidate (35), which is why gold moved instead — the Bomber's fuse already owns lime,
and a bounty ring and a live blast fuse must never be the same green. Warm yellow beat orange on
background contrast (96) and was **rejected** at dE 3 from gold: it would have made the Bounty invisible
to fix a problem the Bounty did not have.

⚠️ **Three hardcoded reds surfaced only because the palette moved.** The HP bar faded orange into *pink*
(`#ff8aa6`, a tint of the old red), and the bossbar glow, its label shadow and the title's red dot all
carried `rgba(255,63,108,…)`. A hex cannot be interpolated into `rgba()`, so `--red` now has two derived
forms — `--red2` and `--redRGB` — and `applyPalette` sets all three.

### The primary button's glow was a drop shadow wearing a glow's colour `2cb6c80`
Author: *"Enter the field background glow seems a little misfit, slightly bottom."* The offset is why:
`0 12px 32px` is a 32px blur pushed **12px down**, which is a drop shadow's geometry. A light source does
not sit below the thing it lights, so the button read as hovering above its own halo rather than emitting
one — and directly under a wordmark ringed by two centred ellipses, that mismatch is exactly what shows.
Centring it at `0 0` was the other fix and was **not** taken: the gradient fill carries the button on its
own, and a halo under a title that has two glows of its own is one too many on the screen. The inset
hairline stays — that is an edge, not a light.

### The menu's five-line paragraph becomes six steps you play `4db9f8e` `9beb77b` `31816ec`
Author: *"instead of tedious description under title, what about a tutorial? give simple dots and explain
annihilation, overdrive, and throw all kind of enemies at tutorial finish."* Steer, gather, annihilate,
flip, Overdrive, then every species at once. Each step's `done` test reads state the game already keeps —
travel, ringed bodies, kills, flips, seconds of Overdrive — so **no step can be satisfied by waiting, and
none can be failed either.**

**Steps 1–5 take no damage; the finale does.** Teaching the flip while a Dart kills you teaches nothing,
and a finale that cannot hurt you does not communicate that any of this is dangerous. `tutSafe()` is the
whole rule and both damage paths call it — *not* a pinned `P.iframe`, which would have made the star blink
for the entire tutorial, because the hurt flash keys off exactly that value. Per the author it ends after
the finale whether or not you survive, and **dying does not reach the death screen at all**: that screen
counts up a score, prints a receipt and offers Reforge, none of which mean anything here.

The finale spawns its own roster because it has to — the tutorial parks the wave clock at `phaseT=1e9`
(the Lab's trick), so nothing arrives unless a step asks. It cycles all eight **by name in roster order**
rather than drawing at random, which guarantees all eight appear; a random draw over 25s leaves one or two
out about a third of the time.

**A step that ends the instant its test passes cannot be read.** Author: *"tutorial might skip too fast."*
One symptom, two faults. The advance was `if(!S.done()) return;` with the next sentence on the very next
line, so a player already dragging satisfied step 1 in under a second and the instruction was replaced
before it had been read — the tutorial did not teach, it scrolled. And passing a step was
indistinguishable from the text changing on its own. There is a readable floor before a step may complete,
and completion now holds the step and swaps the instruction for **what it taught**, with the counters
visible on their own line so a changing number never reflows the words above it.

⚠️ **Both durations are derived from the sentence, and measuring is what proved a constant could not
work.** With a flat 2.5s floor every teaching step held for *exactly* 2.5s — the floor, not the task, was
setting the pace — and it gave a 7-word line the same time as a 14-word one. `readS()` is 0.32 s/word,
~190wpm: slow for prose, right for a line read once while something is moving. Per step,
instruction / beat: 2.23/2.25, 3.85/2.57, 3.22/2.25, 4.82/2.88, 4.48/2.57. **It also means editing the
copy cannot silently outrun the pacing.**

⚠️ *The auto-start described below was removed in `f122816` (2026-08-09) — the menu always opens now and
the tutorial button glows instead, so this hazard is gone at the source rather than gated. The gate-timing
lesson survives it and is in* Traps.

⚠️ **The auto-start must never fire under test, and that failure would have been quiet rather than loud.**
`.oracle.js` and `.harness/record.html` drive `startRun()` themselves; a tutorial launching at boot would
drop a scripted pilot into a mode with the wave clock parked and damage off, and every tape and every
fingerprint would measure that instead — no error, just the wrong game. `window.__H` is the gate, and it
works because of *when* it exists: `preload.js` is injected ahead of the inline script. A first version
also tested `window.__oracle`, which does not exist and never has — `.oracle.js` is pasted *after* load —
and was removed rather than left in looking like cover.

`31816ec` replaced all eleven lines with the author's own copy, verbatim but for four mechanical edits
(one grammar error, three British spellings). ⚠️ **Only the bracketed verbs may vary, and they must**:
steps 1, 4 and 5 were written as *"Move the mouse"*, *"Click"* and *"Hold shift"*, all three describing a
desktop — the exact fault the deleted menu paragraph carried for months. `tutVerb()` substitutes those
three phrases and nothing else. **The end card no longer grades you**: it carried a sentence per ending, so
the last thing the tutorial did was mark your work. Author: *"no other comments, go simple."*

⚠️ **Removing `.tag` broke the menu in a way nothing warns about, and only measuring found it.** That
paragraph sat between the lockup and the primary button with 14px above and 24px below, so deleting it
left *Enter the field* at 0px from the logo's box and **28px inside the outer title ring** — which is
860px wide, hangs well below the letters it circles, and is absolutely positioned, so it contributes no
layout height and no overlap is detectable from the flow. `.titlewrap` carries the clearance explicitly
now, measured against `.tring`'s bottom edge rather than the logo's. `.tag`'s three rules are deleted
rather than kept for "something else that wants body text" — a rule with no user is a rule nobody can tell
is wrong.

### RECORDS: the run data was already being computed at death and thrown away `1271fe3`
Author: *"make RECORDS somewhere, save there high-score, recent runs."* A single best score was this
game's entire memory, which made every run either a record or nothing at all. **Nothing new is measured** —
every field in a row already existed at `die()` and was discarded a line later: score, elapsed, act,
peakCombo, `lastDmg.src`. `runs` is the last 10 newest-first; `totals` is the flat lifetime tally.

⚠️ **No date column, and it is the obvious next one.** It would have to come from `new Date()`, and
`.oracle.js` has to reproduce byte-for-byte — a wall clock in the save is not something to have to reason
about later. Insertion order is the only thing the screen reads anyway.

The write sits under **exactly** the guard that protects the best score, sharing the condition rather than
restating it: Boss Rush pays `200*act` per purge from an endless supply and the Lab spawns on demand, so
either would fill the list with runs that are not comparable. One condition, two consumers — a fourth mode
makes them wrong together or right together, never half. Measured: 13 consecutive deaths recorded 13 times
and capped at 10; both practice modes recorded 0 and left `best` untouched.

Wipe is **press-twice, not `window.confirm`** — that dialog is blocked in the Capacitor WebView and reads
as a browser error over a fullscreen canvas. It disarms itself after 3s so a stray tap cannot leave a live
destructive button under whatever gets pressed next.

⚠️ **The `.refs` row needed real measurement and the arithmetic decided it, not taste.** Four labels total
305.7px against 331px usable on a 375px phone — 8.4px per gap — and at 320px they do not fit on one row at
*any* gap. Left to flex-wrap they broke 3-then-1, which reads as a layout that ran out of room. Under
420px they are a 2×2 grid instead: the same four links wrapping on purpose.

### ORBITAL doubles and CRASH halves — but the tracking is in `em`, so it doubled too `0fdfdd8`
Author: *"adjust title. ORBITAL twice bigger, CRASH half a size."* The sizes are the literal brief —
23 → 46 and 158 → 79 at the desktop cap — which takes the pair from a 6.9× ratio to **1.7**. It stops
being a kicker over a headline and starts being two words of one name.

Two things had to move with them, and neither is taste. `letter-spacing` was `.62em`, and `em` scales with
the type: ORBITAL measured 159px at 375px wide, so the doubled version would have run to 318px against
331px of usable width — surviving a 375px phone by 13px and overflowing anything narrower. `.24em` is also
what makes the lockup work, putting the two words at 284px and 273px so they stack as one block.
`text-indent` tracks it, or the trailing space after the L throws the centring by half the tracking.

⚠️ **The `max-height:520px` branch must not take the same 2×/0.5×, and applying it there first is what
proved it.** At 844×390 it put ORBITAL at 22px and CRASH at 17px — the headline word rendering smaller
than its own kicker — because that branch had *already* shrunk CRASH once, for height. It holds the base
1.72 ratio and scales both words together now.

### Sound becomes a level, and mute stays a switch beside it `706673e`
Author: *"make sound can be set 0%~100%."* **Level and mute are two flags, not one number with zero doing
double duty.** The tempting version folds mute into `vol === 0` and deletes a flag — and it would have
broken every measuring tool in this repo silently, because `.oracle.js`, `.harness/record.html` and every
rig write `store:{mute:true}` or set `orbitalcrash_mute` directly. It is also the better model for a
player: mute is a thing you do for a moment and undo, a level is a thing you set once. Collapsed, the M
key has to invent a volume to come back to, and it cannot know which one you wanted.

`gainNow()` is now the single place the output level is computed and everything asks it. Before there were
two `store.mute?0:0.9` literals sitting a long way apart — survivable for a boolean, and not survivable
the moment a slider can land anywhere between them. `MASTER_GAIN` 0.9 stays the **ceiling** rather than the
setting: the compressor downstream was tuned against it.

⚠️ **`paintSettings` never writes `.value` while the slider has focus.** It repaints on a 400ms poll, and
assigning `value` mid-drag snaps the handle back under the finger — a control that fights you, only on
slow drags. The blip fires on `change`, not `input` (≈20 cues per drag is useless as a reference) while
the level itself follows on `input`, because a volume you cannot hear until you let go is the one thing a
volume control must not ask of you.

### Tilt is chosen by delivery now, and the off switch goes with the guess `73dc075`
Author: *"remove tilt enable/disable option from settings. my native app should be able to tilt still."*
⚠️ **Deleting only the row would have made the web build worse**, through a coupling neither half of it
admitted to: `tiltWanted()` had no stored default and fell back to `pointer: coarse`,
`touchSteers = !tiltWanted()`, and strict tilt-only means a tilt device does not steer by touch **at all**.
Compose those three and every phone *browser* boots tilt-steered before a single reading has arrived — and
if none ever does (an iOS Safari player who dismisses the motion prompt, an insecure context) the star
cannot be moved. That is why all four strings in `tiltFault()` ended *"Turn Tilt off in Settings"*: the
switch was load-bearing.

**So the selector moved instead, to the rule `onTilt` already applied one level down — delivery is the
verdict, not a promise and not a media query.** `tiltDevice` is false until `window.__nativeTilt` hands
over a reading and nothing else can set it. Web and desktop steer by pointer from boot; the iOS shell is
on tilt from its first bridge callback. **A scheme chosen by a guess about the device needs an escape
hatch; one chosen by proof of a working sensor does not.** Measured on the mobile preset: a drag moves the
star 216.9px where HEAD moved it 0, and `__nativeTilt(4,4)` flips the same build to tilt.

⚠️ This retires the tilt rows in *"A settings screen, and tilt gets an off switch"* (`5a75dbd`) and *"Every
tilt failure now names the way out"* (`5ceac84`) below — **the switch and all four `tiltFault()` strings
are gone**, and `#tiltDiag` now reports off `tiltLastT` the one failure still possible, the feed stopping.
Three deliberate deletions, each with its reason in the file: `orbitalcrash_tilt` is no longer *read* (a
stored `'1'` from a browser would strand a player with no switch left); the web `deviceorientation` path
is gone rather than merely unused (on Android Chrome `requestPermission` does not exist, so arming just
worked — which under a no-switch build hands an Android web player tilt with nothing to press); and
`tiltFault()` is deleted rather than reworded, because it cannot fire.

Touch steers again, so the touch legend returns (`#touchCtl`) while the keyboard one stays hidden on
coarse pointers — it still advertises a mouse. Its steer line is written from `touchSteers`, not from the
media query, or the native app would tell a tilt player to drag. Two stale facts fixed while sweeping:
**the bridge is 60Hz, not the 30Hz both `index.html` and MECHANICS claimed** (Swift went 30→60 to halve
reading staleness against a 16ms step), and README's *"tilt does not work under live reload"* predates the
CoreMotion bridge — nothing about tilt goes through the page origin now, so it does.

---

## 2026-08-06

### The Harrier was the sixth-fastest Dot in the game `4801983`
Author: *"harrier should be faster than this, when not caught in ring."* Correct, and by a wide margin.
`seek` 0.16 → **0.34**, which is cruise **0.983 → 2.089 px/frame**.

Measured, every species, position-pinned so only the velocity integrates:

| | Dart | **Harrier** | Charger | Drifter | Neutral | Bomber | Brute | Planet |
|---|---|---|---|---|---|---|---|---|
| **was** | 2.580 | *0.983* | 1.530 | 1.351 | 1.229 | 1.044 | 0.921 | 0.799 |
| **now** | 2.580 | **2.089** | 1.530 | 1.351 | 1.229 | 1.044 | 0.921 | 0.799 |

It was sixth of eight — slower than a Bomber, barely above a Brute — on the species whose own stat row
reads second-fastest in the game. **The confusion is `maxsp` vs cruise:** `maxsp 5.0` is a *ceiling* no
ordinary Dot ever reaches, and the Harrier's is high for an unrelated reason (to keep the ring clamp away
from the ellipse, which needs the cap never to bind). The pace is `seek * 6.1429` and nothing else.

**The tell was switched off too, and that was invisible from the drawing code.** The velocity-scaled wake
is gated at `hv > 1.2` so a parked body cannot wear a speed streak — and 0.983 is *under* the gate. So the
Harrier drew its trail for the one second of the entry window, lost it for the entire approach, and got it
back only on capture. It read "fast" exactly when it was already yours. At 2.089 the trail is continuous
from the edge of the screen.

⚠️ **The comment being replaced claimed 0.16 was "the slow turn half", and that was false at any value.**
Turning here is *friction*-bound, not `seek`-bound. Reversal excursion — how far a cruising Dot carries on
the wrong way once you get behind it — is **exactly `1.5653 × cruise` for the seven species that share the
0.86 bleed**, identical to floating-point precision, because friction sets the shape of the turn and `seek`
sets only its scale. In pixels: 1.25 for a Planet, 4.04 for a Dart, over 5 frames. (The armed Charger runs
its own accel and bleed, so it sits off this basis at 2.4341 over 7 frames.)

⚠️ *Which means the buff above also widened the Harrier's turn* — doubling cruise doubles excursion, 1.54px
to 3.27px. That is the trade the ratio makes visible and a per-species pixel figure hides. The slow turn is
real, but it lives inside the ring where the bleed is `ARC_FR`; no free-flight number can buy it.

**And it does not move the orbit, which is why it was safe.** For a constant central accel `a` the turning
points solve `½k²r0³/r² + r = r0(½k²+1)` — `a` cancels, so the ellipse is set by `ARC_INJ` and the capture
radius alone. Measured across 0.16 / 0.30 / 0.34 / 0.38, 60s each:

| seek | ecc (per revolution) | apogee | perigee | period | ring flickers | clamped frames |
|---|---|---|---|---|---|---|
| 0.16 | 2.37–2.45 | 176 | 72 | 1.67s | 0 | 0 |
| 0.30 | 2.40–2.43 | 180 | 74 | 1.25s | 0 | 0 |
| **0.34** | **2.33–2.43** | **179** | **74** | **1.18s** | **0** | **0** |
| 0.38 | 2.35–2.43 | 181 | 75 | 1.12s | 0 | 0 |

Only the **period** moves. The orbit decays on a per-frame bleed, so it still halves its apogee in ~20
seconds either way — it just shows you **19 revolutions instead of 14** on the way down. Raising `seek`
buys revolutions, not lifetime.

**Ceiling 0.39.** `spawnAtEdge` launches at `cruise * ENTRY_K` against the `maxsp*1.25` opposite-charge
clamp of 6.25. 0.34 sits at 87% — the Bomber's figure — and 0.39 sits at 100%, where the Harrier would take
over from the Planet (98%) as the species that binds `ENTRY_K`.

### THE HARRIER — the first Dot that orbits you `4bad67a`+
Author, from the original to-do list: *"fast velocity, slow turn → making a ellipse ring when chasing or
being pulled."* It was never built, because it was filed under the three species that got deleted instead —
and the Orbiter, which it was aimed at, was the one deleted for exactly this reason.

**The Orbiter's tombstone said what was missing and it was right about the physics:** *"with friction at
0.86 and the speed clamp… it produced a damped inward spiral, not an orbit."* The blocker is dissipation —
the ring's 0.80 bleed is a 1/e decay in **4.5 frames**, so there is no momentum for an ellipse to be made
of. So the Harrier keeps ring capture (it is your ammunition like anything else) and switches off the three
terms that manufacture a circle:

- **no spring** — the ring spring pulls toward a *radius* from both sides, which is an annular well: it
  makes a wobbling circle, never an ellipse. Removing it leaves `seek`, a force toward the *centre*, and a
  central force plus momentum is an orbit.
- **no spin** — the tangential shove is a drive, not a force. Under the near-zero bleed it accumulates to
  `spin/(1-fr)` and slams into the speed clamp, and a body pinned at its clamp travels a circle at constant
  speed. The whirl and the ellipse are mutually exclusive.
- **almost no bleed** — 0.999. This is the one place the file's own *"TUNE THE SPIN, NOT THE BLEED"*
  warning is deliberately overruled, and the shared 0.80 is untouched.

⚠️ **The piece that was missing from the first build, and it failed loudly.** `seek` points straight at
you, so a body that has been steering toward the Star all the way in arrives with almost **no angular
momentum** — it does not enter an orbit, it falls down the middle. Measured over 12 natural edge arrivals:
every one captured and held 28s with zero drops, and eccentricity ranged **6.2 to 29**, with perigees of
13–58px *inside* the 28px contact envelope. A comet on a plunging line, with its shape set by arrival luck.

**Capture is now an event, not just a flag** — a tangential velocity injected once, on the frame the Field
catches the body. Discrete, so unlike a force it cannot accumulate. That makes the orbit a property of the
mechanic rather than of the approach, and it is consistent from every edge:

| | apogee | perigee | eccentricity | period |
|---|---|---|---|---|
| orbit 1 | 182 | 74 | **2.52** | 1.68s |
| orbit 3 | 155 | 59 | 2.79 | 1.60s |
| orbit 10 | 106 | 39 | 2.91 | 1.32s |

A genuine ellipse that **holds its shape while the whole orbit spirals in**, over ~18 revolutions. Zero
ring flickers, and the speed clamp never binds once.

⚠️ **Two measurement traps caught on the way, both mine.** Max/min radius over a *lifetime* reports 8.4
where the per-orbit figure is 2.5 — it measures the spiral decay, not the ellipse. And catching the body at
the extended *retention* leash rather than at the Field sets an orbit scaled to 361px: apogees of 360 and a
body living out by the arena edge. Catch at the Field, keep on the longer leash.

**Silhouette: the Splitter's retired twin-lobe, turned through 90° of meaning.** Its release note is also
its warning — a new species wearing a retired one's outline inherits what the old one taught, and the
Splitter taught *"pop this and you get MORE of them"*. The Splitter's seam turned on its own clock with the
lobes straining apart; the Harrier's axis is pinned to its **direction of travel** and does not breathe.
Same outline, opposite statement — and identity and behaviour end up in the same mark.

⚠️ **The hull is not the ellipse, deliberately.** Law 4 is unconditional — `e.r` is both hull and collider —
so an outline running long down the heading would claim lethal space that does not collide, in a direction
that *rotates*. The path is expressed by a **wake** instead, the Dart's own division of labour.

The roster is **eight**. ⚠️ Three places state that count and at one point all three disagreed at once —
six, seven, and "nine" over a seven-row table. All corrected, with a note at each: grep the word, not the
number.

### Every tilt failure now names the way out `5ceac84`
**These strings are read by someone holding a game that is not responding.** On a tilt device touch does
not steer at all, so a message that said *"allow motion access"* left a player whose OS had already
refused with nowhere to go — while the Settings switch that hands finger steering straight back went
unmentioned. Every failure now names it: *no sensor*, *access denied*, *sensor did not start*, *still
waiting* — each one ends by pointing at the switch.

**They also stopped saying "app".** Tilt is chosen by `pointer: coarse`, not by Capacitor, so a phone
**browser** takes this path too — and the web build is the one shipping first. Telling a web player to
reopen the app is advice they cannot act on.

### The Planet's charge was wearing its silhouette `4bd5bd0`
Author: *"i find planet dot somewhat hard to identify, and its image is unstable by time."* Two complaints
with one cause, and it is a law-level mistake rather than a tuning one: **the charge state had been made
the silhouette, which leaves the species without one.**

The plate gaps ran `0.03 → 0.25` rad with charge — an **eightfold** swing. So an uncharged Planet was a
disc with five hairline slits, i.e. a plain disc, separated from a Drifter and a Brute by *size alone*,
which is the channel the silhouette law exists to avoid relying on — and a Planet spends most of its life
uncharged, because charging it is something the player has to choose to do. The other half is that a shape
whose character changes over its life cannot be learned at all: the recognition target keeps moving.

**Identity and state are separate channels now, sharing one budget.** The gaps floor at 0.22 rad (~10px of
arc at the rim, ~5 CSS px on a phone) and breathe by 36% instead of 800%, turning at a constant rate near
the Brute's own. The charge moved onto **brightness** — already this game's state channel, the one the
Bomber's fuse uses — and the core's range was widened to compensate for the outline's being narrowed:
0.14r → 0.36r, a 2.6× span.

The spin used to **accelerate** with charge, justified as this game's idiom for imminence (the mine runs
9 → 15 rad/s). That was sound in isolation and still lost: **imminence is worth less than identification.**
Generalised into the silhouette law, with the check that catches it — screenshot a species at both ends of
every state it has, and if the two frames read as different bodies, the state is on the identity's channel.

### A danger sign that owns the spawn it warns about `7b68016`
Author: *"neutrals spawn from nowhere might seem dangerous. show danger sign, and spawn neutrals there,
six in a hexagon position. it would be good to re-use danger sign like hostile singularity spawn or
something."*

**The problem was real and it was exactly one place.** Every other spawner in the game is fair by
*geometry* rather than by warning — `spawnAtEdge` starts outside the viewport, the Wall and the Pulse start
off-screen, the Noose starts past the farthest corner. A body has always arrived from somewhere you could
have been watching, which is why nothing had ever needed a telegraph. The Drift below places bodies **on**
the field, so random placement with no warning was the one combination the game had never shipped.

`warnSpawn(x, y, type, colour, secs)` draws a mark and then spawns that body there, and **the mark and the
body are one object.** There has never been a scheduled spawn in this file, and the reason formations fake
delay with geometry is that two lists which must agree are two lists that can disagree — so type, colour
and position all live in the mark. Measured: every body lands on its own sign with **0.00px** offset, no
body exists while a sign is up, and a pending spawn is cleared on reset (leaving one alive would drop a
body into the next run out of nowhere, which is the fault the sign exists to remove, wearing its own sign).

It is **generic on purpose** — verified across all seven species, rejecting unknown kinds — so the next
thing that arrives on open ground uses it rather than inventing a second warning vocabulary.

**The sign's one distinctive property: its ring closes onto the true footprint and stops.** The mine's
arming ring is the nearest existing idiom and it closes to *nothing*, because it is a clock running out.
Same family, opposite information — one says "time is up", this says "here, this much". It is drawn at the
**contact envelope** (`body.r + P.r`), not the hull, because drawing the hull understates the denied space
by the Star's own radius. Violet, since violet already means *matter is arriving*, and it is the only thing
in the game drawn on bare ground away from a body.

**The Drift also arrives on a hexagon now**, replacing six independent `rand` draws — the only
*arrangement* in the game rolled twice per body, and it showed: two of six routinely landed nearly on top
of each other, reading as an accident rather than an event. A hexagon's side equals its radius, so 260
gives 260px between neighbours against the 60px that would be walkable for r15 bodies. The **centre** is
clamped rather than the vertices (clamping vertices collapses the figure into a line for a player in a
corner and destroys the equal spacing that is the whole point), and the rotation is solved so the Star
always begins mid-sector — worst case 132px to the nearest vertex against a 30px contact, measured over
eight player positions including all four corners.

### The Neutral Ring was not a ring `c738967`
Same-day reversal of the shape below. Author: *"neutral rings are not ring, just random 6 neutrals float
around field."* It becomes **the Drift**: six Neutrals placed across the field with **no formation flight
at all** — no held vector, no polar path, ordinary from frame one. Weather, like the Comet, and it keeps
its own long timer.

**The cage failed three of the file's own tests, which is a better reason than taste.** The three pattern
rules did not apply to it — rule 2 has no referent because Neutrals have no polarity, rule 1's thresholds
were the wrong ones (a Neutral is r15, so contact is 30 and walkable 60, not 26/52), and rule 3 was only
satisfiable by bolting convergence on. **A shape that has to be argued past all three rules is not a
shape.** Measured, it was also binary: **0 of 16 popped at every hold below 1.18s and 16 of 16 at a full
hold**, because every body sat at one radius — no partial credit in either direction. And the livery lied
about it, since sixteen half-red/half-cyan bodies on a 145px ring read as an alternating Noose, i.e. as
something answered by matching colour, which is the exact opposite of true.

`NDRIFT_CLEAR` is new and exists because this is the **first spawner in the file that places bodies on the
field** rather than at an edge or off-screen, so it is the first that had to think about materialising
inside the player. 220, measured at 225px minimum clearance over 40 trials.

### Three species out, the Planet in, and the Sorter replaced `6324914` `50c2389`
**The roster is seven Dots, down from nine.** The **Splitter**, the **Mini** it spawned, and the
**Orbiter** are gone. The Splitter took a standing open question with it: the one Dot whose death made
the field *worse* had no answer the player could aim, because the only clean kill was a Bomber blast you
could not arrange on purpose. Deleting the species answers an identity question bluntly, and the general
form is kept in [MECHANICS.md](MECHANICS.md) because it outlives the Splitter — **an answer the player
cannot choose to use is not an answer.**

**The Planet is the new one, and it is the first Dot you *charge*.** Biggest and slowest thing in the
sky. Hold it in your ring and a fuse burns down; let it go and it drains faster than it filled, so
dropping costs more than the hold earned. Carry it to the end and it erases **every Dot of the opposite
colour, arena-wide**. That asymmetry is the point: it is a decision, not a timer you wait out. Measured:
detonates at 7.02s, clears the far corners, **pays 0 score and 0 combo**, leaves the Anomaly's integrity
untouched and Neutrals alive. Flip mid-charge and it is thrown clear at 13.9 px/frame while the charge
drains at 2.0/s.

**The Sorter is gone; the Cross and the Drift take its place**, so patterns go five to six. The Cross
quarters the arena from a hub that slides off you rather than bending around you. (The Sorter's stated
reason for existing was geometric and false: each of its two walls only ever covered **half** the arena,
so the advertised "match one, flip for the other" was reachable for nobody except a player at x=W/2 — for
whom both walls arrived in the same instant.)

The Bestiary is rebuilt to match in `50c2389`.

### Mines landed 35% past the point they were aimed at `6324914`
A live bug in the one function whose entire job is putting a mine where it was aimed. `stepLances` decays
a mine's velocity **only while it is arming**, but integrates its position **every frame**, so the flight
has two phases and the reach was solved from one:

```
arming     sp · 0.965·(1−0.965⁷²)/0.035 = 25.45·sp
post-arm   sp · 0.0769 · 132 frames     = 10.15·sp
total                                     35.6·sp    against the 26.3·sp assumed
```

**It read as correct for one reason and it was a coincidence:** at Epoch I `pace.spd` is 0.75 and
1.354 × 0.75 = 1.015, so the only Epoch anyone checks by hand was the only Epoch it was right at.
Landings now match prediction to within 0.1px. Fixing the model also showed the **speed ceiling had been
set against the wrong arithmetic** — `MINE_SPMAX` 13 → 16.

**Separately, the scatter had no angular distribution at all.** It was the only multi-shot pattern in the
game with no index term while every sibling stratifies by one, so two uniform draws in a 260px box against
a 104px blast **overlapped 60.7% of the time and put one centre inside the other's blast in 20.9%**. Now
stratified by bearing with a jitter budget computed from the blast rather than written down: **0%
overlapping**. Out-of-reach stations are dropped per-mine rather than cancelling the volley — all-or-
nothing silenced the kind across most of the arena.

### The Pulsar lays a box `6324914`
Epoch III escalation of the mine scatter, and the author's *"square-lineup mine spawn"* — built as an
Anomaly attack rather than a wave, because as a wave it broke eight things, four of them architectural
(mines live outside the enemy array, need a boss-shaped emitter, are wiped by `killBoss`, and would print
"Lost to Anomaly Mine" on a run with no Anomaly in it).

Eight stations on a square around the Star, one omitted as the door, and **every number derived from the
blast** rather than chosen: 165 spacing so the perimeter is one continuous denied band (≤ one blast
diameter), a 46px pocket at the centre (side/2 minus the 119px damage radius), and 92px of clear passage
through the door. It earns a 2.2× longer cadence, which is the density guard `lances` does not have.

### One role per colour, and score stops being text `6324914`
The kill `+20` and the hurt `−N` were the **same spawner, the same 800-weight face, the same rise, the
same fade** — and on a red Dot the same bytes of colour. Author: *"체력 닳는거랑 구분이 안감."* The `+20`
is gone; the running total at top-left was always the true channel, and the popup was firing on 40% of
kills, so 60% already printed nothing.

**The worse collision was elsewhere and the glyph could not fix it.** Damage you *deal* to the Anomaly
printed `−1` in a polarity colour while damage you *take* printed `−10` in the same colour — both
negative, concurrent through every boss fight. Sign was spent, so the channel had to be colour. The text
layer now has exactly one role per colour: **red is damage taken, gold is a reward, white is damage
dealt**, and income has no text at all.

Mote consumption finally has a visual — an inward ring at the consume radius, in the Mote's own colour.
It was the only event in the game with no visual whatsoever, audio only, despite being the moment the
whole hoover arc exists for.

### The flip's push lives in the matter, not the hoops `6324914`
Author: *"when flipping, it gives pulling visual, but actually pushing away visual is more buying."* The
complaint was right and the obvious fix was wrong. Every ring the flip spawns takes `spawnRing`'s inward
default, so hoops contract while the physics throws everything outward — but **inverting them destroys
the one job the main ring does**: an inward ring draws its true radius on frame 0 at alpha 0.50, and
outward it arrives 0.48s late at alpha 0.14, by which time the Dots it is describing are 370–575px out.
It would also spend the Bomber's only exclusive signature, since an outward hoop wearing lime means a
Bomber and nothing else.

So the second contracting hoop is deleted and **flung Dots trail wakes** — sparks thrown backward along
the launch vector, the idiom the Dart already uses. Measured: 100% of sparks emitted backward, within
exactly the 0.55 rad cone, and no `out` spent anywhere.

**One dead constant found on the way.** The Shockwave's radius was `Math.min(310, 104*amp)` and the clamp
had never bound once: `amp` maxes at 1.5, so R never passed 156.

### The Bomber wears its own explosion `6324914`
Its blink core was white — the same white every other Dot has, saying nothing about the one body that
clears matter when it dies. It is **lime** now, `COL.lime`, the blast's own colour and the only thing else
in the play field wearing it, so the hull pre-teaches the detonation it carries.

**It has to be drawn under `source-over` and that is the whole subtlety.** The enemy pass runs additive,
where lime over a red hull resolves to cream and over cyan to pale blue — not merely washed out but a
*different colour on each polarity*, i.e. a mark that cannot be self-consistent. The boss body already
takes the same escape hatch for the same reason.

**The blink rate stays at 7 rad/s and must not be detuned.** The author asked for "unstable", and the
obvious build — summing two incommensurate sines — is wrong here, because **periodicity is the detection
channel**: the blink exists so a Bomber reads when its silhouette cannot, and a beat envelope passing
through near-zero means it periodically stops blinking. Nor may it accelerate, which is this game's idiom
for imminence, because a Bomber has no fuse — it detonates when killed. The instability is spatial
instead: a sub-pixel wobble on the core's position, leaving the brightness cadence exactly as periodic.

---

## 2026-08-05

### "Doesn't have to" is not "must never" `79e5783`
Comment only, and it undoes something written an hour earlier. The rule at the head of the `MSL` table read
**"⚠️ A MISSILE MUST NEVER EXPIRE WHERE YOU CAN SEE IT"**, sourced in the same line to the author's *"it
doesnt have to expire on screen."* Author: *"it is not a 'MUST', but, yeah, whatsoever. not currently."* A
permission had been upgraded into a prohibition, at the one place in the file that constrains every
projectile anyone adds later.

**The counter-example was inside the same comment block** — two paragraphs down, the mine exemption
explaining that mines deliberately expire on screen because that is how they detonate. It now reads as what
it is: a tuning state, with the argument for holding it (a shot winking out mid-arena is the game
withdrawing a threat it already made) and a note that a projectile with a good enough reason can overrule
it. Measurements and the exemption are unchanged; only the modality. General form in
[MECHANICS.md](MECHANICS.md) → *Traps*: **a rule stated hard enough that the code beneath it is an
exception is not a rule.**

### A comet shower, a remark instead of a readout, and nothing dies where you can see it `9fd8dcb`
Three author notes from one message.

**1 · Nothing but a mine expires on screen now.** *"fizzle - it doesnt have to expire on screen."* So `life`
becomes a **backstop** against a projectile that never leaves — a curving seeker, mostly — rather than the
thing that ends an ordinary flight. Non-mine values raised past the longest crossing with margin: volley
4.2 → 6.0, ring 4.2 → 6.0, spear 2.8 → 4.0, seeker 6.9 → 9.6. Measured after: **zero non-mine mid-arena
expiries, all three variants, both Epochs.** Surplus life past that threshold costs nothing, because a
straight missile is culled the frame it exits and never reaches its `life` at all. ⚠️ **The mine is exempt
and its `life` means something else — a fuse.** It is *supposed* to run out on screen; that is how it
detonates. Stays at 3.4.

⚠️ **That measurement is one viewport wide, found while writing this up.** Reach is a table product and
does not scale with the display, but the arena does — `W = vw / S`, floored only on the short axis — so
1656–2208 design units of reach clears a 1440-wide arena and does not clear a 2560-wide one. Arithmetic,
not an observed fault; filed under *Open* in [MECHANICS.md](MECHANICS.md) with the run that would settle it.

⚠️ **And the problem was reported wrong before it was found.** The author was told the Pulsar fizzled
15–18% and might want investigating. Counted by kind, **16 of its 20 expiries were mines going off exactly
as designed**, and genuine fizzle was 2 of 84 rings. A rate whose numerator contains a working mechanic
describes neither the mechanic nor the fault. The seeker fix in `085a7f1` was still right — the Sentinel
fires seekers and nothing else, 36 of 36 — but that was confirmed after the fact, not before it was acted on.

**2 · The baited charge makes a remark, not a readout.** `BAITED  -12` → `Charger Poked!`. Author:
*"somewhat not fun and explaining."* The number was the redundant half: the ordinary erosion readout draws
`-12` at the same instant, 26px below — verified drawn together from frame 0 onward. Gold line says **what
happened**, the red/cyan number says **how much**; the same second-encoding fault as the chain text, caught
inside a single label this time. **Mixed case is the design tell**, and this is the only mixed-case string
in the world layer, where everything else is a caps readout.

**3 · The Comet is a shower, 3–5 bodies on one heading.** *"wont it be cosmic?"* It is. A single body
crossing the sky was a curio; a stream is weather, which is what that formation's own note always wanted it
to be. ⚠️ **The spread is the whole thing, or it becomes a Wall** — another formation's job and a different
demand on the player. Three spreads keep it a stream you weave through: **lateral**, abreast of the shared
heading; **trail**, pushing each body back along it so they cross in sequence rather than in rank; and a
**separate near-miss aim per body**, so the group fans out instead of converging — one shared target would
make it a noose. Speed varies per body on top. Measured over 6 showers: counts 3/3/4/5/5/5, holds staggered
2.42–4.38s, speeds 6.86–8.49, every body crossed and exited, none stranded. The `max(0.5, …)` floor on the
hold is new and load-bearing — trail can push a body further out than the base point, and a negative
ray-vs-box solve hands `holdBody` a zero hold, which drops that comet out of formation flight on its first
frame to sit in the margin as an ordinary Brute.

**Open, and flagged rather than settled:** the event timer did not move, so comet *mass* is up 3–5× on the
same schedule. See *Open* in [MECHANICS.md](MECHANICS.md) — the timer is the lever if it reads as too much,
not the count.

### Reach is speed × lifetime, with nothing correcting it `085a7f1`
**`fireMissile` no longer divides `life` by `pace.spd`.** Author: *"having lifetime and speed, so reach is
actually lifetime * speed, easy calculation. isnt this better?"* It is. `life` is a lifetime in seconds,
reach falls out as `sp × 60 × life`, and a slowed missile covers proportionally less ground instead of the
same ground more slowly. Reach ratio at `spd 0.75` measures exactly 0.750 where it used to be invariant.
Law 15 in [MECHANICS.md](MECHANICS.md) is inverted by this, and the algebraic identity that used to pin it
is retired in *Traps*.

⚠️ **Sold as a no-op. It was not.** The rig that said so held `act` at 3 and varied only `pace` — correct
for the on-screen-count question it was built for, and it therefore never ran the boss whose projectiles
*curve*. At real Epoch I the fizzle-on-screen rate went Emitter 0 → 6.8%, Pulsar 14.5 → 20%, **Sentinel
11.1 → 44.4%**. Missiles were visibly winking out inside the arena — exactly the failure the deleted
comment had predicted in capitals. The old comment was right and the measurement could not see it.

**Same shape as the figure it replaced: a probe that could not fail.** The old block cited 599px measured
at both Epoch I and III as proof the reach identity held. That was the **screen edge**, not the life
budget — compensated reach is 1361px and uncompensated 1021px, both past what the arena shows, so it
returned 599 either way.

**The fix belongs in the table, which is the point of the model.** `MSL.seeker.life` 5.2 → 6.9, exactly
`5.2 / 0.75`, the old effective value. The seeker is the only kind that curves — 0.85s turning toward you
before it commits — so its path is far longer than the distance it closes and reach must buy the arc as
well as the approach. Straight flyers clear the arena at 0.75 speed with room to spare and are untouched.
**The per-shot correction had been *hiding* a table value too low for a slowed curve;** holding reach
constant meant it could never show. General form, now recorded at the table: with nothing correcting reach,
**a table value must be sized for the slowest pace it will ever fly at.**

Measured after, against the pre-change baseline — Epoch I: Emitter 0% (was 0), Pulsar 15.7% (14.5),
Sentinel 11.1% (11.1). Epoch III: 11.8 / 17.9 / 0%, unchanged, since at `ps=1` nothing about it moved.
On-screen lance count and firing rate 3.02 / 80 at Epoch I against 5.00 / 151 at III, identical to the
decimal either side.

**Also, one dead parameter.** `sfx.milestone(c)` took the combo and never read it, with the call site
dutifully passing it; both dropped. Scaling the sting by streak was considered and declined — the HUD
no-hit line is the identification channel, and a rising pitch would be a second encoding of it. A sweep
over 502 declarations found no other dead symbol; its one hit was a false positive from stripping template
literals.

### Tilt got twice as slow without anyone touching it `bf48f87`
**The smoothing on the tilt reading was a fixed fraction applied once per sensor event**, tuned against
the browser's own feed at 60Hz. When iOS started reading the sensor natively it delivered at 30Hz — and
the identical coefficient, unchanged, went from **117ms to reach 63% of a new reading to 233ms**. The
control got twice as laggy because the *transport* changed. Nothing in the code moved, so nothing looked
wrong.

**It is a time constant now**, integrated against the real gap between samples, so the feel is the same
whatever the rate: the same 200ms of held tilt lands on the same value at 20, 30, 40, 60 and 120Hz, to
six decimal places. `tilt().lagMs` reports the delay in milliseconds, because that is the number a person
can judge and a coefficient is not.

### A settings screen, and tilt gets an off switch `5a75dbd` `97d31b7`
**Tilt has been on by default on every phone and there was no way to turn it off.** The setter existed
and was reachable only from the debug seam, which made it an accessibility hole for anyone who cannot
play by leaning a device — in bed, on a bus, or at all. There is a Settings screen now, from the menu and
**from the pause panel**, on the reasoning that the moment you need to change tilt is the moment tilt is
not working, and that moment is always mid-run.

Turning tilt off hands steering back to your finger immediately, no reload. Three switches: tilt, reduced
motion, sound — each with a sentence saying what it does, because a toggle whose name is its only
explanation is how "reduced motion" comes to mean nothing to the person it was built for.

**The tilt row says why nothing is happening.** If motion access was denied, or the sensor is not
reporting, it says so where you can act on it, and it says *"Motion is live"* when readings are arriving —
silence would otherwise mean both "working" and "nothing tried yet", which a phone cannot tell you apart.

### A limiter on the master bus `7f90646`
**Nothing was catching the peaks.** Every voice summed into a 0.9 master and went straight out, so about
four concurrent voices over the ambient bed cleared 1.0 and hard-clipped. That matters more than it
sounds: **clipping preferentially destroys transients**, and the transient is precisely what makes one
short cue tellable from another — so the moments where you most need to identify a sound were the
moments the mix was flattening it. Now compressed rather than brickwalled: 6:1 over a soft 12dB knee at
−14dB, 3ms attack and 180ms release.

Landed as its own commit on purpose. It changes every sound in the game, and bundling it with a single
cue's rebuild would make the next person read one as the cause of the other.

⚠️ **Unheard.** See the note on `bf2eb84`.

### The blast expands, in a colour nothing else wears `bf2eb84`
**The Bomber detonation was imploding.** `spawnRing` collapses inward by default — right for a
telegraph, backwards for a blast — so the ring that should have swept out to the kill radius was
travelling the wrong way the whole time. It expands now, and it is the only expanding ring in the game.

**And it has its own colour.** `COL.lime` was worn by nothing else on the play field, so the blast, its
sparks and its survivors' scorch all read as **one event** rather than six coincidental deaths.

**The voice moved out of the crowded band, which is the part with a general lesson.** The previous
rebuild obeyed the sound rule perfectly — it rose, correct valence — and the player still could not find
it: *"I can't identify bomb sound in complex battle."* In a late fight `kill()` fires 5.6 times a second
and `mote()` 6.2, **both square**, so four voices crowd one timbre in one narrow band, and the bomb's
lead had been put right inside it. It was not competing with the mix; it *was* the mix. The lead is a
triangle now, rising over a sine sub that sits below everything else in combat. The general form is in
[MECHANICS.md](MECHANICS.md): valence picks the direction, register picks whether it is heard at all.

⚠️ **CHANGED AND UNHEARD — read this before trusting any of it.** None of the audio in `bf2eb84` or
`7f90646` has been listened to. The harness tab runs `document.hidden`, so `requestAnimationFrame` never
fires and nothing plays; every claim above is spectrum and geometry, not a verdict. If the blast still
does not read in a fight, **the measurements stay true and the conclusion is the wrong part** — the band
analysis would not need redoing, the choice of where to move to would.

**The open question under *The Bomber gets rarer* got a partial answer, and it was not one of the two on
offer.** That entry asks whether the blast reads as an event or as a tax. The first honest answer was
**neither: it did not read at all.** Recorded because the question as written implies the outcome must
be one of its two candidates, and the real first result was invisibility.

### Overdrive cools, the Bomber stops sounding like damage, Neutrals go rare `f0b2f72`
**Overdrive now cools for a second after a ride, timed from release.** Hold-to-burn had fixed igniting
and forgetting, but it made *tapping* free — feather the trigger and you hold the Overdrive physics on a
duty cycle while paying drain only during the pressed fraction, which turns a spend into a modulation.
Every end path cools, including a double-tap too short to reach the ride log. Measured identically after
a very short ride and a very long one, so sipping buys no head start on the next burn. The full rule is
in [MECHANICS.md](MECHANICS.md) — it is the game's third cooldown and it had been documented nowhere.

**Neutrals are much rarer.** Measured **3.35% → 1.07%** of bodies, **15.5 → 5.2 arrivals a minute**. The
Neutral is the one Dot no polarity makes safe, so its job is to punctuate rather than to populate.

⚠️ *Measuring that needed an immortal pilot run out to t=400.* Neutrals enter no spawn table until
`t≥125` and the bot dies around 57s, so the first census returned a confident **0%** — a clean number
describing a table the run never reached.

### The iOS app runs `6430ebe`
**Built, installed and played through on an iPhone 17 Pro simulator** — a full run, an Anomaly met and
died to, and the death receipt drawn. The port is real rather than merely compiling. No game code
changed: `index.html` is untouched by this commit, and the touch handling it exercises was already
there, which is why the **web build plays on a phone browser too**.

**Touch was confirmed by measurement, not by looking at it.** A drag ended at (95, 320) points and the
star came to rest at (95.4, 264.6) — under half a point from where `TOUCH_LIFT` predicts. That single
figure proves both the coordinate mapping and the fingertip offset at once, because the lift is applied
*only* inside the touch branch: if the touch path were not live, it could not appear at all. A tap at
(201, 600) then flipped the core and left the star exactly where it was, which is the other half of the
design — the tap reverses poles and does not drag you to your fingertip.

**Portrait is enforced in the plist, not merely requested in the manifest**, and it is a fairness rule.
The short side fixes the world scale and the long side decides how much arena you get, so landscape
would hand out a wider field at an unchanged spawn rate: an easier run on the same score table. Across
the iPhone lineup every device lands within **8 design units of the same world, 0.46%** — tune once,
tuned everywhere. Area against desktop barely moves; **shape** does, aspect 0.46 against 1.78.

**Three Capacitor template defaults were wrong for this app.** `UIRequiredDeviceCapabilities` shipped
`armv7`, a 32-bit leftover that no device running a 13.0 target can satisfy — a requirement that could
never be met by a device that could also run the app. Portrait had to be set on **both** device
families, with `UIRequiresFullScreen`, because iPad refuses a partial orientation set without it. And
the status bar had to be hidden with `UIViewControllerBasedStatusBarAppearance` switched off, or
Capacitor's bridge controller keeps deciding and the clock lands on the score readout.

**534KB of unreferenced splash art deleted**, after grep found no reference from any `Contents.json`,
storyboard, pbxproj or plist and the app still built and launched. The six byte-identical `Default@*`
files were *left alone* on purpose: all six are genuinely referenced and the generator recreates them,
so pruning by hand would be undone by the next documented regenerate.

⚠️ **Two HUD faults are now confirmed on device rather than predicted**, and both are open: the
top-centre readout is swallowed by the Dynamic Island, and the keyboard legend overlaps the HP and
Capacitor bars while telling a touchscreen player to hold Shift. The HUD is untouched here because the
gameplay pass owns it. `appId` is also still the placeholder `com.orbitalcrash.game`.

⚠️ **`xcodebuild` deadlocks under a sandbox** — it wedges at 0% CPU inside `ibtool`'s handshake, with
the storyboard step never completing; a second attempt blocked earlier still, during IDE plugin
scanning. Neither is a project fault: the same workspace and scheme build clean unsandboxed. Diagnosed
by sampling the stuck process rather than by guessing, which is the only way to tell *blocked* from
*slow* when both look like a build that never returns.

### The streak stops narrating itself `695779b`
**Three floating words are gone, and the Capacitor says one of them itself.** A milestone or a streak
burst drops a chunk of charge in a single frame, and a bar that lurches with no visible cause reads as
the game moving on its own rather than as the game paying you — so those two texts passed the file's
own test for a cue and were not simply deleted. They moved onto the thing they were about: a white
pulse over the Capacitor **fill**. The burst is the sharp case, because it fires *during* a hit, where
the damage number, the red flash and the shake are already competing at the core.

**`N CHAIN` just went.** It announced the combo — which the HUD already shows permanently and already
recolours by the same tier — in the largest text in the game. Measured across 6 runs, 364s and 1110
kills, it fired **89 times, once every 4.1 seconds**, against 19 milestones and 16 bursts. A second
encoding of a number that never leaves the screen, which is the same argument used three lines away to
delete the bolt glyph. The shake and the sting stay; those were never the redundant part.

**Two design mistakes went in first and were caught by screenshotting rather than by reasoning.** The
wash was hung on the whole bar, which whitened the *empty track* too and blurred the fill boundary — a
cue that hid the exact quantity it exists to report. And it was tinted by streak tier, which looked
like free information and was nearly invisible where it mattered: the fill runs violet to cyan, and a
cyan wash over the cyan end screen-blends to almost nothing. White drives any base toward white. The
tint was also itself a second encoding, since the HUD line already carries tier colour continuously —
the same defect being removed, reintroduced one commit later.

⚠️ **Fresh RNG baseline, not a regression — old fingerprints no longer compare.** The `+N` popup was an
`else if` on the chain branch, so it was suppressed on exactly the kills that got the fanfare. Fixing
that makes `Math.random()` draw on every kill, which shifts the seeded stream: **seed 404 goes 85.5s →
66.4s**. Difficulty is unchanged — n=30, mean 59.5 → 61.5, **median 57.3 both**, sd 16.1 both, Welch
t=0.49. This is the case the `rand()`-at-run-start trap in [MECHANICS.md](MECHANICS.md) already
describes; read the re-roll as a new baseline, not as a balance change.

`MCOL` went with the text it coloured, and `updateHUD` was always carrying its own inline copy of that
palette — one array was live and one was not.

### The menu stops presenting five different things as one list `3f03e45`
**Two of the four side buttons start a run and two open a page, and the menu now says so with shape.**
They had been four identical ghost pills stacked in a column, distinguished by an 8px-versus-12px
margin — which is the same failure as the decorative glyphs removed from them earlier that day, just
with the decoration taken off: a column of five pills reads as a list of five equal things, and these
are one door, two rooms and two pages. The modes are a pair of boxes now, side by side; the Bestiary
and the Codex are links, because a link is what you press expecting to come back.

**"Practice only · neither can set your best" has only one group it can be about.** The rule is
unchanged and so is its wording — it was hanging *between* the two pairs, where it could have been
captioning either one.

**Only one of the four labels was ever undecodable, and it is the one we invented.** Boss Rush,
Bestiary and Codex are conventions a first-time player has met elsewhere; Pattern Lab is ours, and it
told them nothing. Both modes carry a short line now — *Every Anomaly, back to back* and *Every wave
shape, on a key* — built to hold one line inside the cell and to open on the same word, so the pair
scans as a pair.

⚠️ **This landed inside a commit about something else.** `3f03e45`'s message covers the settle-radius
comment corrections in `stepOverdrive`/`stepEnemyForces` — that commit is where the last invented
settle-radius symbol left the file, which is why no symbol is quoted for it here. The menu was swept
in from the working tree by a parallel session staging the whole file. Both halves are intact and
neither damaged the other: `git show 3f03e45` is two unrelated changes, and the menu is the hunks at
`@@ -197` and `@@ -279`.

### Overdrive stops widening the Field, and the ring gets faster for free `fbe4d18`
**Burning no longer stretches your gathering reach.** The Field is now the same size in every state.
Overdrive used to widen it as well as the ring, which made a burn read as unexpected extra *reach*
rather than as a faster sweep — the shell bulged past the rim instead of filling it.

**Nothing about the ring was retuned, and it came out quicker anyway.** The ring's orbit is a fraction
*of* the Field, so pinning one pulled the other in on its own — and ringed matter rides a fixed speed
ceiling, so a tighter orbit hands the difference back as rotation. **The shell now turns about 17%
faster and a full meter buys more revolutions than it did**, with no constant touched. Angular rate is
speed over radius; this is that trade running in the direction that pays.

**One silent bug went with it.** The fling shell has a fixed ceiling, and the widened Field had grown
*past* it — so a fully-loaded hungry flip while burning threw **no** loose Dots at all, where the same
flip at base threw a share of them. Nothing surfaced it: the ring-spend path reports a fling either way,
so a count of thrown Dots looked healthy in both states. The shell is now pinned clear of the Field in
every state.

### Early Anomalies are slower, the pool is trimmed, and the volley finally gets repriced `d214716`
**The Anomaly's first fights now run slower on two axes**, easing to full speed by Epoch III and flat
after. Every gap between its attacks is stretched and every projectile is slowed. Both, because either
alone reads wrong: thinning the stream does not slow the shot that beats you, and slow shots at full
cadence just fill the field. The pace is **fixed when the Anomaly spawns** — the one in front of you
never speeds up, and the next one is faster only because you survived to reach it.

Projectile **reach is unchanged** by the slowdown, exactly rather than approximately, because flight time
is divided by the same factor that scales speed. Without that, slowing a shot would make patterns fall
short instead of arriving later.

**The HP pool is trimmed back**: yesterday's raise overshot, and this keeps most of it. The curve is the
point rather than the level — early Anomalies still take the bulk of the increase, which is where the
complaint was.

**And the volley is repriced, which is the fix that should have shipped with the pool raise.** Raising
the pool silently makes every unchanged damage channel cost more connecting bodies. That was caught for
the baited charge and acted on; the *aimed* channel, the one the whole fight is built around, was left
standing through both the raise and this trim. Nobody was arguing the volley should get harder — it just
was not on the list. It now sits a shade harder early and a shade easier late than before any of this,
and identical at Epoch II.

### The Codex and the Bestiary are written for a person now `28c4ea8`
**Every glyph used as a bullet or a button prefix is gone**, and with it the mixed-marker lists — the
Codex ran eight different shapes across six sections with no rule saying which meant what. What stays
are the marks in real icon slots: pause, mute, reduced motion, close, and the achievement tick, which
is the only glyph left in the Codex and earns it by carrying state.

Three removals were a second encoding of something already said: the bolt on a 5+ combo sat beside a
line the next statement recolours by tier, and the bolt on the live Overdrive chip sat inside a gold
border that already reads "left". The achievement star became a **word** instead of vanishing — the
gold pill said *something happened* without saying what kind.

**The Codex lost all 21 of its figures** and is now a welcome rather than a spec; `MECHANICS.md` holds
the values. **Bestiary cards came down to about fifteen words each with no numbers at all**, and the
`r · hp · dmg` stat line went with the footer that advertised it. Pattern cards are name and animation
only: working a shape out is part of playing it.

Two corrections fell out of the rewrite. The old Codex said both *"opposite charge drifts toward you"*
and *"your star never pulls matter in"* three lines apart — both true, and a contradiction as printed.
And **the Charger card had been understating the baited charge by half again since `06fbc15`**, which
is the drift [MECHANICS.md](MECHANICS.md) had warned about on that exact constant.

The Neutral card **gained** a line: with the Codex no longer listing rules, nothing in the game said a
flip pops one outright.

### The baited charge is repriced, and the pin comes off on purpose `06fbc15`
**`CHARGE_DMG` raised, and its pin to `VOLLEY_DMG` deliberately released.** The pool buff had halved the
bait's share of a bar — the one erosion channel costing no ammunition and no Capacitor, and with the
grind what a stripped player has left.

**The pin was never the invariant.** *Pinned at 4 × `VOLLEY_DMG`, and that ratio is the constant* had
been true and useful, but the ratio was only ever how you reached a **share of a bar** at the pool of
the day. When the pool moved, *hold the ratio* and *reprice with the pool* pointed opposite ways, and
only the second was the point.

**Restored short of where it stood, on purpose.** Epoch I goes back to three baits rather than the old
two: the pool went up for difficulty, and the answer to a harder fight should not undo the difficulty.

*And the value now used was once rejected as a ceiling*, on the grounds that it would one-shot an Epoch
I Pulsar. That Pulsar carries roughly twice the HP today, so it takes two baits — exactly what the old
number took against the old Pulsar. The argument was never wrong; the pool moved out from under it.

---

## 2026-08-04

### Overdrive is held, costs four times as much, and the Anomaly hits back `6eec910`
Three difficulty changes at once, and the first is a change of verb.

**Overdrive is held, not toggled.** Press and it ignites; let go and the remainder banks. The design
consequence is that **every ignite path needs a matching release, and the releases live on the window
rather than the canvas** — a right-drag released off-canvas fires no canvas `pointerup`, and a keyup
swallowed by a window-switch fires nothing at all, either of which drains the meter while the game is
not in front of you. Losing focus mid-hold ends the ride for the same reason. The HUD button moved to
pointerdown/up, because a click only exists *after* the release. `contextmenu` no longer ignites:
pointerdown already had, and on platforms that raise it on press the gesture fired twice.

**Repriced 4×, twice in each direction.** The drain doubled and income halved, and the two compound: a
meter is twice as slow to earn and buys half as long a ride. **Measured 1.67 meters and 5.0s of
Overdrive per minute, against 3.34 and 20.0s.** Income halved through `P.chargeGain`, which is now
plainly **the global Capacitor income rate** — the purge reward was the one income site that skipped
it, and was added to it so a purge would not silently become worth double everything else the moment
the rate moved. Law 16 is unaffected in structure: both caps still bind at the same combo, they just
pay half. `OD_MIN` is unchanged, but its justification is not — the cheapest ride is now half as long,
and still several times the ring's travel time, which is the property that mattered.

**The Anomaly pool up a flat amount at every Epoch, which changed the curve as well as the level.** It
used to triple from Epoch I to V and now less than doubles: **+100% at Epoch I against +43% at Epoch
V**, so the early fights took nearly all of it, which is where the complaint was.

**The buff could not be priced, and that is recorded rather than papered over.** The pilot purged 1 of
5 before and 0 of 5 after — a floor effect in the pilot, not evidence about the change. The one figure
that survived is cost per fight off `anomLog`: **78 → 94 HP median, +21%**. See *Open*; it is a lead,
not a finding.

*Knock-on for anyone reading older numbers:* the ring geometry did not move, but the seconds did, so
the **2.78 revolutions** that used to cost half a gauge now cost a full one.

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
player. The same class of leak as the phase readout, which was gated behind `DEV` at the time.
⚠️ *`fbe2bd8` removed that seam entirely; the phase is now recorded on `lastDmg` and never rendered.*

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

*Answered in part by `bf2eb84`, and with neither option.* A human said it did not read **at all** — the
ring was expanding the wrong way and the voice sat inside the busiest band in the mix. Left as written
because this is dated history, but note the shape: a question offering two outcomes quietly assumes the
thing is perceptible, and "invisible" was not on the ballot.

### Score is addition; the multiplier was a coin flip `71c961e`
Deleted `mult`, `motesBank`, `recalcMult`, `bankMote`, the `#mult` HUD stat and the `sfx.streakLost`
voice. Score is now flat: **`KILL_SCORE` 20 · `MOTE_SCORE` 5 · `GRAZE_SCORE` 10**, priced at the old
expressions evaluated at the measured median, so a median run scores **0.88×** what it used to.
**It measured as a coin flip, not a curve.** Median **×1.9** / P99 ×7.0 over 12 runs taking hits, versus
a hard cap at **×15 inside 46s on 6 of 6** runs taking none — nothing in between, and **1.30×** total
effect on final score. The halving punished backwards: a clean run banks 761 Motes against the 140
needed to cap, so the first two hits cost a deep bank nothing while a shallow one lost half.
*Also:* `STREAK LOST` and the `MULT ×a → ×b` popup are gone — the latter computed uncapped, so a
saturated bank rendered the literal string `MULT ×15.0 → ×39.0`. `STREAK BURST` stays alone. *(It did
not stay: `695779b` removed it too, along with the milestone text and `N CHAIN`. Left as written because
this is dated history — but "stays alone" was a claim about the future, and those are the sentences in
here that go false.)*
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
