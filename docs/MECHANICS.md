# How ORBITAL CRASH works

Everything the game does, present tense. Three docs, one job each:

| | |
|---|---|
| [GLOSSARY.md](GLOSSARY.md) | what a word means — one line per term |
| **MECHANICS.md** (this file) | how it works, and what must not break |
| [PATCHNOTE.md](PATCHNOTE.md) | what changed and when — the reasoning lives in the commit body |

**The numbers rule.** This file names tunable constants (`CHG_COOL`, `VOLLEY_DMG`) and does not
restate their values — `index.html` is the only place a value lives, so there is nothing here to
drift. A number appears only when the number *is* the argument: contact happens at 26px, so pattern
spacing must stay under 52px. That relationship is the content; `FORM_STEP`'s actual setting is not.

**The rule now reaches the game too, and it got there by deletion.** `bestiary.html` and the in-game
Codex are *copy*, not generated, so every figure printed in them was a second copy of a value that
lives in `index.html`. They used to print a lot of them: the Charger card carried the baited-charge
damage, and the Codex carried the four streak thresholds against `MILES`, the per-Dot erosion table,
and the Bounty multiplier. `28c4ea8` removed **every tunable value from both**, because a screen
written for somebody who has not played yet cannot use a figure anyway. This file is the spec, and it
is now the only place the numbers live.

⚠️ **That warning had already come true, on the exact constant it named, and nobody caught it.**
`CHARGE_DMG` went to 12 in `06fbc15`. Both surfaces still said **8** fifteen hours later — so the game
spent that time understating its hardest-to-set-up attack by half again, to the one player who had
gone looking for the number. Two sessions audited comment liveness across that same file in that
window and neither looked at the copy, because the checkers are all identifier-shaped and *`8` is not
an identifier*. **A grep-shaped audit cannot see a wrong number, only a wrong name.**

The general form, and the reason this file is allowed to keep its own duplicates: **a duplicated value
is only checkable where it is duplicated with its name.** MECHANICS may print a figure because it
writes `CHARGE_DMG` beside it, so a checker has a handle. Player copy never could — *"the baited charge
does 8"* cannot carry the identifier without reading like a spec sheet to the one person it is written
for. That is why the fix was deletion rather than a better checker: the duplicate was in the one place
no tool could ever reach it.

The measured argument for deleting rather than re-syncing: `VOLLEY_DMG` was repriced 2 → 3 about a
minute after `28c4ea8` landed. Under the old Codex that was a third site to remember; under the new
one there was nothing to edit. **Copy that states a value is a copy of that value** — and the cheap
fix is usually not a better checker, it is a sentence that does not need the number.

**Two literals survive on purpose.** The achievement rows `Land a 60-chain` and `Reach Epoch III`
restate the thresholds tested at `combo>=60` and `act>=3`; a criterion without its number is not a
criterion. They are the same shape of hazard and are only safer because an achievement threshold is
not a tuning knob and has never moved. Change one, grep the other.

---

## The laws

Sixteen rules the game is built on. Each has been broken at least once, and most were expensive to
find. Read this before touching anything.

### 1. The colour law
Opposite-charge things that touch **both die**. Same-colour matter is harmless and passes straight
through your core.

*Breaks as:* one polarity becoming a universal answer, or a wave you can walk through by matching it.
*Catch it:* drive one Dot of each colour into a pinned star and read the HP delta — same must be 0.

### 2. The two-channel rule — do not add a third
A Dot erodes the Anomaly **if and only if** it is (a) a **Volley** you fired, (b) a **Ring** you
gathered and carried into it, or (c) a **Charger in its committed dash** that you stood so as to aim.
Everything else pays zero and bounces. The boss-contact expression should stay three branches.

The reason is that **the Anomaly moves**. The Hunt walks it the length of the arena through a field
full of matter, so any rule shaped like *"opposite-charge contact hurts it"* means the boss damages
itself by travelling and the player need do nothing. The list cannot be about what touches it; it has
to be about what you **aimed** or what you **carried**.

*The test for any proposed fourth channel: could the Anomaly earn this by moving?* If yes, it does not
belong. This has had to be re-tightened four separate times — a flat per-contact chip, a Collapse
double-pay, the Brute barge, the Fling — which is why it is first.

*Catch it:* park the player 500px away for a 45s fight and read boss HP. Idle self-damage must be 0.

### 3. The danger edge
Anything drawn **outside** a hull reads as *the edge where I die*. The real envelope is `e.r + P.r`.
**A ring outside a hull sits at exactly `e.r + P.r`, or it does not exist.** The defect is a false
*value*, not the geometry — a mark at the wrong radius teaches a lethal lie.

Live and obeying it: the Charger's reticle, the Anomaly's integrity ring, the Gilded Bounty ring.
Exempt by decision: the universal halo, because it is a radial-gradient sprite with a luminance cliff
of 9 at its edge — there is no boundary left to aim at. A *flat*-alpha fill has a hard boundary
however soft the colour looks, which is why the star's two atmosphere discs were deleted rather than
resized.

*Catch it:* sample luminance outward from a hull. Any step over ~10 outside it is a claimed edge.

### 4. Hitbox is hull
`e.r` is both the drawn hull and the collider, for every species and the Anomaly. **Never split them.**
A render-only shrink puts the kill edge outside a hull that looks safe, which is law 3 in its worst
form. Three silhouettes overhang — Brute hexagon, Charger arrowhead, Planet ring — but those draw
*bigger* than they collide, which is the forgiving direction.

*Catch it:* bracket the separation at which contact actually fires; it must land on `e.r + P.r` for
all nine species plus the boss. Bracket on the separation that **existed at end of frame**, not the
one you seeded — the star chases the pointer and is yanked before contact resolves.

### 5. The silhouette law
Every species owns a distinct outline or internal marking, and **colour is never one of them** — hue
is reserved for polarity. The Drifter's plain disc is the deliberate null: legibility is differential,
so the unmarked slot goes to the most common Dot.

Marks are **negative space, not stacked fills** — the enemy pass runs under `lighter`, where layered
fills saturate to white and erase the polarity contrast the colour law depends on.

⚠️ **A SILHOUETTE THAT CHANGES OVER A BODY'S LIFE IS NOT A SILHOUETTE**, and the Planet broke this on its
first day. Its plate gaps ran `0.03 → 0.25` rad with charge — an *eightfold* swing — so an uncharged
Planet was a disc with five hairline slits (i.e. a plain disc, separated from a Drifter and a Brute by
**size alone**, the channel this law exists to avoid) and a charged one was a rosette. Author: *"i find
planet dot somewhat hard to identify, and its image is unstable by time."* Two complaints, one cause: the
**charge state had been made the silhouette, which leaves the species without one.** You cannot learn to
recognise a shape whose recognition target keeps moving.

**So identity and state are separate channels, and they share one budget.** Identity gets the outline and
it is held nearly still — the Planet's gaps now floor at 0.22 rad (~10px of arc at the rim, ~5 CSS px on a
phone) and breathe by 36% rather than 800%, turning at a constant rate near the Brute's. State gets
**brightness**, which is already this game's state channel (it is what the Bomber's fuse uses) and which
can vary freely because a brightening point inside a hull cannot be mistaken for a different body. Having
narrowed the outline's travel, the core's was widened to compensate: 0.14r → 0.36r, a 2.6× span.

*A rejected justification worth recording, because it was sound in isolation:* the Planet's spin used to
**accelerate** with charge, on the grounds that rate increase is this game's idiom for imminence (the
mine runs 9 → 15 rad/s as its fuse burns). True, and it still lost — **imminence is worth less than
identification**, and the core carries it at no cost to the outline.

*Catch it:* screenshot a species at both ends of every state it has. If the two frames would be
identified as different bodies, the state is wearing the identity's channel.

*Ceiling:* nine species is the edge of what a shape vocabulary carries at 40+ Dots, and a tenth should
reuse a silhouette and differ by behaviour. **The roster is eight**, so there is one slot left. It was
nine until `6324914` cut three and added one, and the Harrier took it back to eight.

⚠️ *And the count itself is the least reliable line in this file.* Three separate places have stated the
roster size — this one, the Matter table below, and the `ETYPE` comment in `index.html` — and at one point
**all three disagreed simultaneously** (six / seven / nine, with a seven-row table under the "nine"). A
count is the easiest thing to leave behind because nothing reads it and nothing can fail on it. When a
species is added or cut, grep the *word*, not the number.

### 6. The three pattern rules
A shape that breaks any one of these is decorative, not a pattern.

1. **Spacing under 52px** — contact is 26px centre-to-centre, so anything wider has a walkable midpoint.
2. **Alternate every Dot** — any run of two same-colour Dots is a free door costing one keypress.
3. **Never end on a timer alone** — a shape that just crosses and dissolves is beaten by standing still.

*Catch it:* measure every inter-Dot gap and the longest same-colour run; check the shape has a
terminating *event* (the Wall's return, the Noose's bite, the Cross's arms clearing the field).

### 7. The two-wave release
Rule 6.2 makes every neighbour in a shape its own annihilator, so a formation that lapsed on one
frame would delete itself. Formations therefore let go **by polarity**, one colour `NOOSE_WAVE` after
the other. Used by the Noose and the Wall, keyed off `gapAt` parity so it varies without spending
another `rand()`.

*Catch it:* classify deaths as pairs (each other) vs alone (the player). Pair-kills should be ~0.

### 8. Retirement pays nothing
A Dot that finishes a committed trajectory it was born with is **retired**: `dead` alone, **never**
`queueKill` — no score, no combo, no Mote, no Capacitor, no blast chain, no death FX. Nothing was
destroyed; it left.

Applies to: the Comet crossing the sky, the Pulse leaving the viewport, the Cross sweeping through and
out, and the Bomber's blast.

**The general "delete anything off-screen" rule was measured and rejected.** Over 300s tracking every
Dot: 1,374 entered, **2 ever left**, and both came back. Ambient matter cannot leave — it seeks you.
The rule that operates is *retire a Dot that has finished a committed trajectory; never retire one
that is still hunting you.* "Is it off-screen?" is a proxy that coincides for two shapes and misleads
everywhere else — and a blanket version would quietly promote the Fling from "push away" to "delete",
which law 2 does not allow.

### 9. The silent world
**No centre banner, ever.** Storms, Epochs, the Anomaly's arrival, an Overdrive igniting and streak
tiers are announced by matter, colour, ring, shake and sound. Text across the middle pulls the eyes off the
field at exactly the wrong moment.

**One *persistent* text channel**, outside the play area: the **achievement toast**. It was two — the
pickup pill named a powerup's effect, the one thing you genuinely could not read off the screen. With
the powerups gone the pill had nothing left to say and went with them, which is the correct outcome: a
channel exists to carry something unreadable, not to be preserved.

**Everything else is floating text, and floating text must be drawn where its event happened.** `-8`
rises off the Anomaly you just bit, `BOUNTY +` off the Dot that paid, and `-8` off your own star when
something bites **you**.

⚠️ **Position is necessary and it is NOT sufficient, and this section used to claim otherwise.** It read
*"nothing but where they are drawn tells them apart, which is the rule demonstrating itself"* — and that
was the defect, not a demonstration of the rule. Matter is attracted to the core, so the Dot you bit and
your own star are frequently within 30px of each other; during a boss fight `-1` dealt and `-10` taken
were **the same sign, the same digits, the same face and the same bytes of colour**, concurrently, a few
pixels apart. Two events cannot be separated by position when the events happen in the same place.

**So the text layer now carries exactly one role per colour, and that is the second half of the rule:**

| colour | role |
|---|---|
| `COL.red` | damage **taken**. Nothing else prints it. |
| `COL.gold` | a reward — bounty, purge, the baited charge. |
| white | damage **dealt**. |
| *(none)* | income. Score has no floating text at all. |

A number in a polarity colour was also competing with the polarity read the whole game runs on, so
moving erosion to white bought back a channel as well as fixing a collision.

*Catch it:* two readouts that can fire in the same frame need two channels, and "different place" only
counts if the places cannot coincide. (A streak announcement stood here as the
third example until `695779b` deleted it — under this same section's other test, not this one: the HUD
already carried the streak permanently, so the text was a second encoding. The rule ate its own
example, which is the right outcome and not a reason to restore it.) A label placed anywhere other than
its own event is a banner with extra steps: it moves your
eyes off the field to read about something that happened somewhere else.

`VOLLEY ×n` and `FLUNG ×n` were removed under exactly this test, and it is worth being precise about
why, because "no tallies" is the wrong lesson. They printed **at the core** a count of matter that had
just launched **outward, away from the core** — on the exact frame your eyes should have been following
the bodies you threw. Had they been drawn on the bodies, they would have been legal and useless.

**A second encoding can live *inside* one label, and then only half of it goes.** The baited charge drew
`BAITED  -12`; it now draws `Charger Poked!`. The number was the redundant part — the ordinary erosion
readout fires on the same frame, 26px below, and says `-12` itself. Author: *"somewhat not fun and
explaining."* So the gold line says **what happened** and the red/cyan number says **how much**, which is
the split every other event in the game already uses. Worth being precise that this was the same test as
the streak text above and not a copy rule: had no other readout been drawing that number, the label
carrying it would have been correct. Its **mixed case** is the design tell — the only mixed-case string
in the world layer, where everything else is a caps readout, so a remark is visibly not a number.

**A cue for a state that persists must itself persist**, and passing the position rule does not excuse
a blink. `⚡ OVERDRIVE READY ⚡` was drawn at the core, which is where availability lives — legal, and
still deleted. A blink announces a durable state once and then says nothing for as long as it stays
true, and the failure is *silent*: the flag only re-arms on the far side of the threshold, so under a
spend you can part-pay it re-armed almost never. Availability is carried on the HUD instead, on the
identical test, and the HUD keeps saying it. Position-legal is necessary, not sufficient.

### 10. Taking damage says one thing
A hit says exactly three things and **nothing else**: the hurt sound, **one damage number**, and the star
blinking through its immunity. No particle burst, no full-screen flash, no screen shake, no hitstop — on
**any** damage path, Dot contact and missile alike.

The moment of a hit is the moment you most need to read the *field*, and four cues firing at once is
what made the contact ghost invisible. The number is the only readout, so **size carries the magnitude**
(`HURT_SZ0 + dmg × HURT_SZK`, clamped) — the one channel a number has that a shake or a colour does not.
It fires on every hit; it used to be contact-only, so a mine gave no readout at all.

*Catch it:* a hit should change exactly one thing on screen besides the star's own blink.

### 11. Missiles and matter never interact
A missile passes straight through every Dot: it does not kill them, it is not stopped by them, and
**nothing is drawn** when it crosses one. Mine blasts touch you and nothing else.

Missiles are aimed at you and answered by **moving**; matter is answered by **colour**. Two systems,
one arena, zero overlap.

*The cost is accepted knowingly:* Rings are not armour against the Anomaly's fire, a Neutral is not
cover, **nothing blocks a missile** — positioning is the whole defence. Every attempt to make the
interaction *read* correctly failed; matter a missile simply flies through cannot be misread.

### 12. The additive pass
`render()` sets `globalCompositeOperation='lighter'` before `drawParticles` → `drawPlayer`, so the whole
particle / matter / boss pass is additive. **Anything with internal colour structure must opt out**
(`save()` + `source-over`) or every overlap clamps to white — `255+56, 63+224, 108+255` all saturate. A
single flat fill survives it; layered silhouettes lose exactly the contrast they exist to carry.

### 13. Positions only, never velocity
The same-charge shove resolves overlaps **positionally**, split by mass. An impulse here would pump
energy into the ring orbit that carries your armour. Formation Dots are exempt — `holdBody` and
`holdOrbit` write x/y every frame, so a shove would be overwritten or would corrupt measured geometry.

### 14. The sky never touches `Math.random`
`initStars()` runs from `resize()`. A mid-run resize that consumed global entropy would shift every
spawn after it and silently invalidate the oracle. It carries a fixed-seed xorshift, which also makes
the sky identical across reloads.

### 15. Missile `life` is a lifetime, and reach is the product
`reach = sp × 60 × life`, in pixels, and **nothing corrects it**. Slow a missile with `pace.spd` and it
covers proportionally less ground — that is the model, not a defect in it. Author: *"having lifetime and
speed, so reach is actually lifetime * speed, easy calculation."*

**This law said the opposite until `085a7f1`**, and the inversion is the whole of that commit. `fireMissile`
divided `life` by `pace.spd` so that reach came out invariant, which made `life` a *distance* budget
wearing a clock's units. The compensation is gone; `life` decrements by `dt` and means what it decrements by.

⚠️ **So a table value must be sized for the slowest pace it will ever fly at**, not for the nominal one.
That is the only new obligation the change creates, and it cost one value immediately — see *Pace*.

The old law's trap survives in a narrower form: a per-lance velocity scale that **bypasses `pace.spd`**
still breaks the model, because reach stops being the product of the two numbers you can read. `pace.spd`
itself is safe by construction, and so is global slow motion — `step()` opens with a literal `dt=1/60`
and `timeScale` is applied to the *accumulator*, so slow motion runs **fewer steps, never shorter ones**,
and position and `life` advance in lockstep whatever it does.

⚠️ **The mine is exempt, and its `life` means something else entirely: it is a fuse.** A mine is *supposed*
to run out where you can see it — that is how it detonates. There is no reach to preserve, so do not
scale it to preserve one.

⚠️ **But the mine still travels, and its flight has TWO phases while its reach was modelled from one.**
This cost 35% of accuracy in the one function whose whole job is landing a mine where it was aimed.
`stepLances` decays `L.vx` **only inside `if(L.arm>0)`**, while `L.x += L.vx` runs unconditionally below
it — so after arming a mine keeps its residual `sp·0.965⁷²` for the rest of its fuse:

```
arming     sp · 0.965·(1−0.965⁷²)/0.035 = 25.45·sp     ← the decay is applied BEFORE the move
post-arm   sp · 0.0769 · 132 frames     = 10.15·sp     ← the term that was missing
total                                     35.6·sp  =  MINE_TRAVEL
```

**It read as correct for one reason and the reason was a coincidence.** At Epoch I `pace.spd` is 0.75 and
1.354 × 0.75 = 1.015, so the only Epoch anyone checks by hand was the only Epoch the one-phase model was
right at. It was 35% long from Epoch II on.

*The general form, and it is not about mines:* **a decay applied under a condition, with integration
applied unconditionally, is a two-phase flight** — and a closed-form reach derived from the conditional
branch alone will be wrong by whatever the unconditional tail contributes. Grep for the integration, not
for the decay. And if either `arm` or `MSL.mine.life` moves, re-derive **both** terms; `MINE_TRAVEL` is a
solved constant, not a tuning knob, and `MINE_SPMAX` was itself set against the wrong arithmetic (13,
because 13 × 26.3 "looked like" a sensible reach) until the model was fixed.

### 16. Every combo-driven income term must be capped
`combo` is a *no-hit* streak: nothing decays it and nothing times it out, so it only falls when you are
hit, and on a clean run it climbs without bound. **Any income term linear in it compounds across the run
rather than converging.** Both such terms are capped at combo ~90 and must stay in step —
`CHG_KILL_CAP` on the per-kill award in `onKill`, and the streak trickle's own inline cap in
`stepRunTimers`. The trickle was always capped; the per-kill term was not, and the asymmetry was
invisible because both read the same counter.

Uncapped, the Capacitor was two different systems wearing one bar: time-to-fill fell **elevenfold within
a single run**, so a player taking hits sat near the bottom of the curve and rarely filled it at all
while a clean run filled it every couple of seconds. **A cap makes skill *raise* the rate; no cap makes
skill *change the game being played*.** Reintroducing an uncapped combo term is the same defect in a new
place, whatever it pays into.

*Catch it:* run an untouchable pilot for 180s and read time-to-fill at the start against the end. They
should be the same number.

---

## The star

You steer a wandering star with the pointer. It carries a **polarity** — red or cyan — and a circular
**Field**.

**The Field gathers your own colour.** Like-charge matter inside the Field is captured into orbiting
**Rings**; it also leans toward you from *outside* the Field under **core gravity**, full at the rim
and fading to zero at `LIKE_GRAV_R`× the Field. Opposite-charge matter gets **no magnetic pull at all,
ever** — it only drifts in under its own seek, and annihilates against you. The star never vacuums
another charge.

Core gravity is deliberately small next to a Drifter's own seek: your colour should *lean* toward you,
not be sucked in. Like-charge closing under that pull gets ring-grade speed headroom so a dodging
player does not outrun their own ammunition.

**Rings are three things at once** — armour (they annihilate opposite matter before it reaches you),
fuel, and a weapon on contact via the grind. They are *not* armour against Anomaly fire (law 11).

**Ring hysteresis.** Once a Dot is yours it stays yours for `RING_GRACE` seconds after a move outruns
it, and the spring reels it back the whole time; past `RING_GRACE_R`× the Field it is genuinely gone.
**Direction reversal sheds a ring, not sustained speed** — the pointer follow is uncapped, so a
corner-to-corner flick outruns the ring by hundreds of px while steady strafing at any speed keeps
100%, because Dots settle into a stable lag inside the Field.

**Integrity** regenerates after a lockout with no hit. **Nothing else heals — disengaging is the
entire healing verb.**

**Immunity** is one window for every source of damage — `IFRAME`, the same value whether you were hit
by a Dot, a missile or a mine. The blink that reports it is driven off `P.iframe` itself rather than
the global clock, so it starts on the frame you are hit and ends on the frame you are vulnerable and
**cannot drift out of phase with the thing it reports**. Any source that sets `iframe` gets a correct
blink for free.

**Contact ghost.** `processKills()` and the dead sweep run inside `step()`; `render()` runs after — so
the Dot that hits you is spliced out of `enemies` before the frame is drawn, and you never see the
touch. Over 127 hits the last frame a Dot appeared in still showed a median 2.44px gap, which reads
as "I collided early". The fix is render-only: snapshot the Dot before `queueKill`, draw it once more
through the same species path, then cut. Held `GHOST_HOLD`, and ticked in `frameBody` rather than
`step()` so it survives a hitstop from elsewhere. It was never invisible because it was short — it was
invisible because it was buried under the four other cues a hit used to fire.

### Touch

**Steering is offset, not direct.** The target sits `TOUCH_LIFT` above the contact point, because a
thumb on the star covers the one thing the game asks you to read — the colour arriving at your core. The
core still clamps to the arena, so pushing the target off the top of the screen reaches the top edge
rather than stalling short of it.

**A tap flips; a drag steers.** Both `TAP_SLOP` and `TAP_TIME` have to hold for a press to count as a
tap, and a tap never moves the star — it would otherwise yank the core to wherever your finger landed,
which is the opposite of aiming. Under tilt a drag must not steer either: `stepTilt` clears the pointer
every frame, so writing a target there buys a one-frame twitch and nothing else.

**Tilt is a rate, and its smoothing is a time constant.** An angle means *keep going this way*, not *be
there*, so `stepTilt` adds velocity to the star directly rather than naming a target for the position
chase to follow — feeding a rate through that chase would weld tilt's speed to the chase coefficient,
and retuning the mouse would change tilt for reasons nobody would think to look for. The low-pass on the
reading is `TILT.tau`, in **seconds**, integrated against the real gap between samples. It has to be time
and not a per-sample fraction, because the bridge's rate is a tuning knob and has already moved once
(30Hz → 60Hz, to halve how stale a reading is against a 16ms step); see the trap on that below, which is
what it cost to learn the smoothing must not depend on it. `tilt().lagMs`
reports the resulting delay in milliseconds, which is the number to put in front of a human — nobody can
feel a coefficient.

**Tilt is native-only, and delivery is the only thing that selects it.** `tiltDevice` is false everywhere
until `window.__nativeTilt` hands over a reading, and nothing else can set it. Web and desktop steer by
pointer from boot; the iOS shell is on tilt from its first bridge callback, ~33ms in.

⚠️ **The old default and the Settings switch were one mechanism, and they had to be removed together.**
Tilt used to be selected by `matchMedia('(pointer: coarse)')`, which combines with the strict-tilt-only
rule above into a phone **browser** that boots tilt-steered before any reading has arrived — and if none
ever does (an iOS Safari player who dismisses the motion prompt, an insecure context), the star cannot be
moved at all. The Settings switch was the sole escape, which is why every string in the deleted
`tiltFault()` ended *"Turn Tilt off in Settings to steer by touch"*. Removing the switch without moving
the default would have stranded exactly those players. **A control scheme selected by a guess about the
device needs an escape hatch; one selected by proof of a working sensor does not.**

⚠️ `orbitalcrash_tilt` **is deliberately not read.** Anyone who ever switched tilt on in a phone browser
still has `'1'` in localStorage, and honouring it now would strand them with no switch left. The key is
inert, not migrated. There is a regression test for this: plant the key, reload, confirm a drag still
steers — a fresh profile cannot show you that one.

⚠️ **There is no `requestPermission` call anywhere in the file, and adding one back needs a switch.** The
web sensor path was measured and abandoned: on Android Chrome `requestPermission` does not exist, so
arming attached the listener and readings simply flowed — which under a no-switch build hands an Android
web player a tilt-steered game with nothing to press. Inside the Capacitor WebView the promise rejects
outright even though Capacitor's `WKUIDelegate` answers the real permission with `.grant`; the JS
permission API and the native sensor gate are two different doors, and the JS one is nailed shut.

**The one failure left is the feed stopping.** The four permission faults are unreachable — `tiltDevice`
is set *by* a delivered reading, so any device reading that branch has already heard from the sensor at
least once. What remains is CoreMotion going quiet mid-run (an app resumed from background before
`MotionBridgeViewController` restarts updates), which is a question about time: `#tiltDiag` reports it
off `tiltLastT` past `TILT_STALE_MS`.

**None of this reaches mouse play.** The lift is applied only inside the `isTouch(e)` branch — pointer
input takes an early return with the raw coordinates — which is also what made the port measurable:
the on-device drag landing within half a point of `TOUCH_LIFT`'s prediction could not have happened
unless the touch path were live.

**Portrait is enforced natively, and it is a fairness rule rather than a taste one.** `S` is
`min(1, min(vw,vh)/REF_SHORT)`, so the *short* side fixes the scale and the *long* side decides how much
arena you get. Landscape would hand the player a wider field at an unchanged spawn rate — an easier run
scored on the same table. The web manifest's `orientation` is advisory and applies only to an installed
PWA; `Info.plist` is the enforcement.

**The scale is why one tuning pass covers the lineup.** Across iPhone 17 Pro / 17 Pro Max / 17e / Air,
every device gets a world exactly `REF_SHORT` across — that is the definition of `S`, not a measurement
— by **1731 to 1739 tall, an 8-unit spread of 0.46%**. Tune for one and
you have tuned for all of them. Against desktop the *area* barely moves either (1.39M vs 2.07M square
units). What moves is **shape**: aspect 0.46 against 1.78, a 3.9× difference, and that is the part no
bot can sign off on.

⚠️ `Info.plist` restates `REF_SHORT`'s **value** inside a comment explaining the portrait rule, rather
than its name. It is the numbers rule broken across a language and a directory boundary: nothing that
greps the JS will ever surface it, so changing `REF_SHORT` leaves a confident, wrong sentence behind in
a file nobody re-reads. Left in place rather than fixed here, because it is the app target's file and
this is a note, not a licence to edit it — but it is the first cross-language instance we have.

---

## The two verbs

The verb set is exactly two: **the flip**, and **Overdrive**. The flip carries two states — a plain
reverse, and a reverse made while loaded — which is one verb with a condition on it, not two inputs.
Now that Overdrive is held rather than toggled, both verbs are things you *do with a button held down*,
which is the clearest the pairing has ever been.

**There is no third input, and the rejected one is worth naming.** A separate action gated behind the
flip cooldown cannot be reachable as a skill — a parry window measured a flat 4 frames, shorter than
human reaction time and 4.25× shorter than the cooldown gating it.

### Reverse
Click or space swaps your polarity. Short cooldown — deliberate, not spammable.

Every reversal emits a **Shockwave**: an outward push on matter that **pops a Neutral outright**. Its
radius and force scale with hold-charge. It has its own, longer cooldown — a tool, not a constant
shield. **It does not touch an Anomaly at all.**

The Neutral pop is a **kill, not damage**. Damage cannot express that rule safely: the pulse fires on
its own cooldown however fast you flip, and a damaged Neutral is drawn identically to a fresh one, so
any multi-hit kill makes the first hit invisible and the Dot reads as immune.

### Hungry flip
**Hold-charge** accrues on time since your last flip, not on holding a button. Past the threshold your
rings are **loaded**, and a reversal becomes a hungry flip that does two things at once.

**The Fling** — every Dot that is opposite-charge *after the flip resolves* and inside the burst is
thrown outward, **alive**. Nothing dies.

Why that framing: a tap already turns the swarm harmless, because matching its colour is what safety
means here. What makes reversing dangerous under pressure is that **your own rings turn hostile the
instant you flip**, in close orbit. The Fling throws exactly that off you.

- Radius = a floor from charge + a ceiling from **matter you actually gathered**, so rings are armour
  on the way in and reach on the way out. A full burst reaches just past your Field, so the circle you
  can see is the promise.
- Impulse scales with proximity, hardest point-blank. For `FLING_HOLD` the Dot skips the speed clamp,
  runs on flung friction, and has **seek at zero** — dead straight, or its own seek would cancel the
  impulse and drag it back onto the core.
- **Never flung:** Neutrals (uncharged is not "the other colour" — that is the Shockwave's job) and
  rings while an Anomaly is alive (they are the Volley's business). Bombers *are* flung; a fling
  detonates nothing, so it is the clean answer to a Bomber sitting on you.
- Nothing is lost — every Dot flies out, decelerates and comes home. Hold longer, breathe longer.

**The Volley** — with an Anomaly alive, the same act launches every gathered Dot that is not the
boss's colour **straight away from the core**, along the radius it already sat on. See *The Anomaly*.

### Overdrive
Spend the **Capacitor** to burn a wider, faster ring shell. It is the second verb, and the only thing
the meter buys.

**It is a throttle, not a button, and it is held rather than toggled.** Ignite from `OD_MIN` upward —
you do not have to be full — and it **drains while you hold it** (`OD_DRAIN`), so a full meter buys a
fixed number of seconds and a quarter meter buys a quarter of them. **Let go and the remainder banks.**
That is the whole decision: spend now at the pressure you can see, or keep it for the pressure you
expect. A spend that must be full and must be total is a button; a spend you can meter is a choice, and
holding puts the meter in your hand for exactly as long as you are willing to pay for it.

**Every ignite path needs a matching release, and the releases live on the *window*.** A hold is only
as good as the event that ends it, and the two ways an end goes missing are both ordinary: a right-drag
released off-canvas fires no canvas `pointerup`, and a keyup swallowed by a window-switch fires nothing
at all. Either one drains the meter while the game is not in front of you. Losing focus mid-hold ends
the ride for the same reason. `endOverdrive()` being a no-op when nothing is burning is what lets every
release path fire unconditionally.

**It cools for `OD_CD` after a ride, and the clock starts at RELEASE — not at ignition.** Measured
identically after a ten-frame ride and a hundred-and-twenty-frame one, so the wait is the same whether
you sipped or emptied the bar. **Every** end path sets it, including a double-tap too short to reach the
ride log at all. This is the third cooldown in the game, alongside the flip's and the Shockwave's
longer one.

*It is there because hold-to-burn made tapping free.* Holding fixed the older failure — igniting and
forgetting — but it opened a worse one: feather the trigger and you hold the Overdrive **physics** on a
duty cycle, paying drain only during the pressed fraction. That converts a spend into a modulation, and
a resource you can modulate for free is not a resource. Cooling from release is what makes the tap cost
the same as the commitment.

While cooling, the Capacitor drops its spendable glow and the Overdrive button **dims in place rather
than hiding**. Deliberate: on touch that button is the only Overdrive control a thumb has, and a control
that vanishes reads as broken, where a dimmed one reads as *not yet*.

**Repriced 4× — twice in each direction, compounding.** The drain doubled (`OD_DRAIN`) *and* income
halved (`P.chargeGain`), so a meter is twice as slow to earn and buys half as long a ride. Measured:
**1.67 meters and 5.0s of Overdrive per minute, against 3.34 and 20.0s** before. It is now a resource
you spend on a moment rather than a mode you live in.

**What it does is reach, and speed.** `P.eddy` moves the ring orbit outward and spins it harder,
`P.ringMul` raises capacity, `P.moveMult` speeds the star. Measured on a Drifter, the shell settles at
**183px** against a base 114px and gets most of the way there inside a fifth of a second — it arrives as
a snap, not a drift — and turns at **6.80 rad/s against a base 2.52**, one revolution every **0.92s**. A
**full** meter buys **3.25 revolutions**.

⚠️ **`P.fieldR` is no longer one of the levers.** The Field is `BASE_FIELDR` in every state; Overdrive
used to widen it too and stopped in `fbe4d18`, because a shell bulging past the rim read as unexpected
reach rather than as a faster sweep. **Nothing about the ring was retuned** — `orbR` is a fraction *of*
`fieldR`, so it fell on its own, the shell came in from 214px, and **the spin rose 17% for free**. That
is the v/r trade below running in the direction that pays: ring speed is pinned at a ceiling, so pulling
the orbit in returns the difference as rotation.

⚠️ *Two older restatements of the revolutions figure, both now superseded.* It read **2.78** until the
Field change, and before that it read "half a meter" when the drain was half what it is. Neither the
geometry nor the drain is what moved this time. **Any figure here quoted per *half* gauge is a figure per
*full* gauge today, and any 2.78 predates `fbe4d18`.**

**Three constants own that, and they only work together.** The eddy orbit, the eddy spin, and the
ringed-matter speed ceiling `RING_CAP`. Widening the shell and spinning it faster *fight each other* —
angular rate is v/r, so a wider ring is a slower-looking one — and the ceiling caps the result of both.
**Since `fbe4d18` there is only one widener left**, the eddy fraction; the Field no longer contributes,
which is why removing it bought rotation instead of costing sweep. Change one and you will measure almost
nothing; that is the whole reason they are documented as a set.
`closing` is deliberately **not** on `RING_CAP`: like-charge on its way in is not a ring yet, and giving
it ring-grade speed makes gathering feel like a vacuum, which is the misconception the game works
hardest to avoid.

The cap is `e.maxsp * RING_CAP`, so every species scales together and the ordering survives — Brute
slowest, Dart fastest, each clamped at its own ceiling. A faster ring also **holds better** rather than
worse under dodging, and grinds an Anomaly slightly harder while you burn: the existing channel
improving, not a new one.

**It does not touch the Anomaly** — law 2, and no exception. The meter buys field control, never boss
damage. Erosion stays Volley, ring grind, baited charge.

**Income is suppressed while burning** (`odOn` gates the kill and Mote awards) — you cannot refill mid-burn,
so the length of a burn is decided when you ignite it. One deliberate exception: a **streak milestone**
still pays through, because it is a streak payout rather than a kill payout, it fires at most four times
a run, and gating it would make the streak silently worth less during the thing you spent the streak to
earn.

**The per-kill Capacitor award is capped** (`CHG_KILL_CAP`), as is the streak trickle — see law 16.
Uncapped, this meter was two systems wearing one bar.

**⚠️ The known tension — real, but a trade rather than a trap, and only since the spin fix.** Overdrive
multiplies *rings you are holding*, and the flip **dumps** your rings: ~2.3–3.0 held while flipping
against ~6.9–9.1 while not. So it pays more the less you flip, and that much has always been true.

What changed is whether it pays *at all* to a player who flips. Before the ring-speed fix the flipping
case measured **+0.3%** — a rounding error, so the tension was total and using the game's central input
made the second verb worthless. After it, two harnesses measure **−9.9% (t=−4.36, n=8)** and **−16.0%
(n=8)** — disagreeing on size, agreeing it is now a solid effect where it used to be nothing.

So the honest statement is: **the payoff still scales with the hoard, so it rewards hoarding more — but
it is no longer worthless to a player who flips.** Roughly half the effect either way. That is a
legitimate risk/reward axis rather than a design fault, and it is worth noticing that the fix which
bought it was not aimed at this at all — it was aimed at a pilot saying the ring felt slow.

**The hoarding pressure is still shared with the grind exploit** — see *Open* — and the two are one
problem whenever someone decides to act on either.

---

## Matter

**Matter** (a **Dot**) is any regular, non-boss enemy. Each carries a charge, so opposite-charge
Dots are your threat *and* your ammunition.

**Eight species**, each with its own silhouette (law 5):

| | |
|---|---|
| **Drifter** | baseline Dot, steady approach — the deliberate unmarked null |
| **Dart** | small, very fast, light hit; backward wake |
| **Brute** | big, slow, 3 hp, the hardest contact hit in the sky; hexagon. The only Dot that walks out of a Bomber blast, and nothing erases it outright — it must be annihilated by colour like anything else |
| **Bomber** | an ordinary Dot in every stat that **detonates when it dies** |
| **Planet** | the biggest and slowest thing in the sky, and the only Dot you **charge**. Hold it in your ring and `burn` accumulates; let it go and it drains at `PLANET_COOL`, which costs you more than the hold earned. Carry it to `PLANET_FUSE` and it erases **everything of the opposite colour, arena-wide** |
| **Charger** | the only Dot your magnetism does not own; arrowhead, solid armed and hollow spent |
| **Neutral** | wears both poles on a turning seam; the one Dot the colour law does not reach |
| **Harrier** | the only Dot that **orbits** you instead of arriving at you. Second only to the Dart in free flight (cruise 2.089 against 2.580). Caught by the Field like anything else, but inside it keeps its momentum and loses the whirl, so it flies an ellipse — apogee ~180, perigee ~75, ~1.2s a revolution — halving its apogee over 19 turns. Twin lobes strung along its heading, plus a wake |

### The Bomber's detonation
Colour-blind, sized just past the ring orbit radius, and priced so trash dies and a
Brute crawls out burned. **Colour-blind is load-bearing:** your rings are your own colour, so a blast
that respected polarity could not remove ring shield at all, which is the entire point.

**Three exclusions.** It does not touch **you** (contact damage is unchanged; the blast adds nothing at
the core). It does not touch the **Anomaly** (law 2 — a boss walking through a crowded field must not
die to density). And it **pays nothing** (law 8) — the brief is to *punish* hoarding, and a paying
blast would make hoard-then-pop a score fountain rewarding the behaviour it exists to remove. It also
does not chain: a Bomber killed by a blast dies via `dead`, so `onKill` never runs.

The bite scales with local density — a sparse field loses a couple of Dots, a packed ring loses all
of it. That scaling is the design.

### The Charger
It ignores your Field entirely, which is why it is drawn as a hard arrowhead rather than a soft disc:
every other Dot is something you gather or annihilate, this one travels a line of its own and will
never join your ring.

It **locks its end point the instant the wind-up starts** and draws that lane in full, to a reticle
collapsing on the end point — so the line is a promise and stepping off it is the answer. It re-derives
its heading from where it actually is (it drifts while winding) and ends on **distance covered, not on
a clock**. A dashing Charger plows through opposite-charge matter.

**One lunge at a time.** After the dash it is `spent` for `CHG_COOL` — hull hollow and inert, a filling
wedge counting the cooldown down — then it re-arms. Kill it in that window and it is gone; leave it and
you buy the lunge again. Match its colour and it rides your ring as harmless armour, then re-arms
**inside your guard**. Stay opposite and your own ring annihilates it for free.

### The Neutral
The Field ignores it, the Fling ignores it, and no polarity you can hold makes it safe or makes it
ammunition — so it carries both charges instead of a colour of its own. One Shockwave pops it. It is
**not** cover; nothing is (law 11).

### Same-charge shove
Like charges cannot annihilate, so same-colour Dots **take up space** instead — overlaps resolve
positionally, split by mass, so a Brute shoulders a Drifter aside. Between ring Dots the shove is
**tangential**, so it spreads them around the orbit rather than off it and the ring radius holds.

*Consequence:* Dots that no longer overlap also no longer drift through each other into opposite
matter, so incidental mutual annihilation drops and the live field is denser.

---

## Patterns

Ambient spawning is edge-random, so it reads as weather. Every so often the field instead does
something with obvious **intent**. Every pattern flies in from off-screen, which telegraphs it without
a word of text. Patterns are paused during a boss and skipped above a Dot cap.

All five obey the three pattern rules (law 6). **Linear flight** (`hold`, `fvx/fvy`) flies an assigned
vector and ignores seek *and* the polarity field — otherwise every shape converges on the core and
dissolves into ordinary drizzle. **Polar flight** (`holdOrbit`) steps an angle and a radius about a
centre, needed because a constant-velocity tangent travels a straight line and would miss the centre
entirely — the ring would never actually shut.

### The Wall
A solid line spans the arena and marches across. **One gap**, and the gap *shuts* as it advances, so it
is widest the moment it arrives. At the far edge the whole line **turns around** and comes back once —
"ignoring it does not end it" is the shape's thesis, which is why its leftovers are deliberate.

Releases in two polarity waves (law 7).

### The Noose
A ring shuts on where you are standing, its **seam rotating** as it comes in, and **locks** at
`NOOSE_MIN_R` — still solid, not yet crushing itself. `NOOSE_BITE` strands keep going and land on your
core.

**Why it cannot simply be tightened, and this is geometry rather than taste.** Dots on a ring of S
slots sit a chord of `2R·sin(π/S)` apart. Two thresholds bracket a shrinking ring: **52px** is where a
gap becomes walkable, **22px** is where the ring annihilates *itself* on the colour law. A ring of N
converging Dots self-annihilates at `22/(2·sin(π/N))` and only touches you at 26 — and those cross
**only for N<8**. Any ring dense enough to be a wall deletes itself before it arrives.

Hence the design: the ring stops where it is still a wall, and five strands — under the N<8 bound —
carry on. Stopping the ring alone leaves a still player untouched, so the bite is not optional.

Peeling the bite out costs the cage five one-slot doors, which is the good half of the trade: locked,
it measures one wide seam, four needles threaded by a few px, and eleven spans that are simply wall.
The shape asks three questions at once — dodge the bite, thread a needle, or find the seam.

**Two geometric alternatives do not work, both built and measured.** Releasing at a wider radius
changes nothing, because chord scales with radius and a converging ring always meets itself at the
same radius wherever it was set free. Blooming outward on release separates the ring exactly as
intended and the field simply re-converges it — while throwing it out through your own ring orbit, so
*more* of it dies to the grind and *fewer* Dots reach you.

### The Pulse
A shockwave from somewhere else in the sky: nested **arcs** wash outward over you, each arc a **single
colour**, alternating arc to arc. Answered by *matching*, not by dodging — the one shape whose question
is colour rather than geometry.

Arcs rather than full rings for two reasons: a full circle sized for tight spacing costs ~72 Dots
each, and an arc leaves running around its edge as a real second answer.

**Its origin is placed outside a chosen edge**, and measured to the nearest *edge* rather than pushed
to a fixed distance — because the front is sized for the radius where it *meets* you, so the Dots it
needs grow with origin distance while the per-arc cap does not. Past roughly 675px the spacing exceeds
the 52px contact diameter and it stops being a wall. Same family of result as the Noose's N<8 bound.

Two spacing constraints, both geometry:

- **Arrival gap.** `PULSE_GAP` is the only lever on it. Every arc expands at exactly `FORM_SPD` —
  `holdOrbit` is handed `-FORM_SPD` as its radial rate — so **standing still, the gap is `ΔR/FORM_SPD`
  and nothing else**: at the shipped setting, **1.04s**. That is the floor, and it is what to scale
  from when retuning.

  **Moving, the gap is larger, and this is worth understanding rather than papering over.** An arc
  lands when its radius reaches *your current* distance from its origin, not the distance you were at
  when it spawned — so retreating adds travel:

  > `gap = ΔR / (FORM_SPD − your radial retreat speed)`

  Both live measurements are this equation, not a mystery. At 3 arcs / 70px the shape measured 0.57s
  against a 0.486s floor; at 2 arcs / 150px it measured 1.22s against 1.042s. That is the **same
  1.17× ratio across a 2.1× change in `ΔR`** — a constant ratio can only come from a term proportional
  to `ΔR`, which rules out a measurement offset and points straight at a velocity. Solve for it and
  both tapes imply the same retreat: **21.2 px/s** and **21.0 px/s**. A player backing away from an
  incoming wall, twice, at the same speed.

  So the shape's guaranteed warning is **1.04s** and backing off buys more — the design argument is
  stronger this way round, not weaker. The band it has to sit inside is this game's own telegraphs
  (`CHG_WIND` 0.9s, `LUNGE_TEL` 1.3s), both retuned until they were answerable, and the answer to an
  arc is a **flip**, the one input carrying a cooldown. 1.04s standing still clears that bar.

  *If you retune `PULSE_GAP`, scale from 1.04s. The 1.22s figure has a player in it and will not
  transfer unless the next tester happens to retreat at 21 px/s.*
- **Spacing must stay expressed in radius, not time.** Per-arc density where it reaches you is
  independent of R, because every arc crosses the same meeting radius — so R buys arrival time and
  nothing else. R must also stay under the origin's edge clearance, or the outer arc pokes back
  on-screen at spawn and loses the 0%-visible-at-birth property.

**It leaves the sky.** The Pulse sweeps through and retires once it has left the padded viewport — the
same `seen`-then-gone idiom the Anomaly's missiles use. It must be **positional, not a clock**, because
the front fans across 150° and a Dot on the near edge clears the screen long before one aimed down the
long axis. And it **must** require having entered first, since Pulse Dots are born off-screen and a
bare "is it outside?" test would delete the shape on frame one. `hold` is sized to the furthest padded
corner, so it can only ever be a failsafe.

*What it costs:* the Pulse is not an ammunition source, because a held Dot ignores the Field and can
never be ring-captured. Intercepting one in flight is untouched and still pays in full.

### The Cross

Four arms from a hub, sweeping the arena into quadrants. **The hub is the arena's centre, not yours** —
and if you happen to be standing on it, the hub slides off *you* rather than the arms bending around it,
so the shape never deforms to accommodate where you are. The arms reach past the furthest padded corner,
which is the Noose's measurement and is there for the Noose's reason: there must be no *outside the
Cross* to walk to. The answer is a quadrant, chosen early.

### The Drift

**Six Neutrals arriving on a telegraphed hexagon**, with no choreography after arrival — no held vector,
no polar path, ordinary from frame one. It is on its own long timer rather than in the shape rotation, and
it is not a formation: it is weather, like the Comet. What makes it worth an event is what was always true
of a Neutral — the Field ignores it, the Fling ignores it, the colour law cannot touch it, and only a
Shockwave or your own hull ends one — delivered six at a time instead of one every thirteen seconds.

**A hexagon's side equals its radius**, so at `NDRIFT_R` = 260 the neighbours sit 260px apart against the
60px that would be walkable for r15 bodies. This is six bodies distributed around you, not a wall, and it
cannot become one by raising the count without also changing what the thing is. *(Compare the Noose: 22
slots on 106px, chord 30. That is a wall.)*

Two guards, and the choice of **what** to clamp is the interesting half:

- **The centre is clamped, not the vertices.** Clamping vertices would push three of them onto the same
  edge for a player in a corner, collapsing the figure into a line and destroying the equal spacing that
  is the entire reason it is a hexagon. Clamping the centre keeps it regular and simply stops it being
  centred on you near an edge. `R` shrinks first if the arena cannot hold one at all.
- **The rotation is solved, not rolled** — half a sector off the Star's bearing from the centre, the same
  trick the Cross's arms use, so the Star always begins mid-sector. Worst case (Star exactly on the ring)
  leaves the nearest vertex `2R·sin(15°)` = 135px away against a 30px contact. Measured over eight player
  positions including all four corners: regular and on-screen every time, minimum 132px.

### Telegraphed spawn — the danger sign

⚠️ **Every other spawner in this file is fair by GEOMETRY, not by warning**, and that is why nothing needed
a telegraph until now. `spawnAtEdge` starts outside the viewport; the Wall and the Pulse start off-screen;
the Noose starts past the farthest corner. A body has always arrived from somewhere you could have been
watching. The Drift is the first thing that places bodies **on** the field, so it is the first that could
be accused of appearing out of nowhere. Author: *"neutrals spawn from nowhere might seem dangerous."*

`warnSpawn(x, y, type, colour, secs)` draws a mark for `secs` and then spawns that body at that point.

**The mark and the body are ONE OBJECT, and that is the design rather than a convenience.** There has never
been a scheduled spawn in this file — no queue, no `setTimeout`, no delayed-spawn list — and the reason
formations fake delay with geometry is that *two lists which must agree are two lists that can disagree*.
A warn owns the spawn it advertises: type, colour and position all live in the mark, so a sign cannot
promise a body the spawn does not deliver and a sign cannot be orphaned by a spawn that never happens.
Measured: every body lands on its own mark with **0.00px** offset, and no body exists while a sign is up.

**It is generic on purpose.** Any `ETYPE` kind can be telegraphed, verified across all seven, and an
unknown kind is rejected rather than silently spawning nothing — so the next thing that wants to arrive on
open ground uses this instead of inventing a second warning vocabulary.

**The mark is the contact envelope (`body.r + P.r`), not the hull** — 30px for a Neutral, 38 for a Planet.
Drawing the hull would understate the space about to be denied by the Star's own radius, which is the
danger-edge law's exact failure mode.

**Its one distinctive property: the incoming ring closes onto the true footprint and STOPS.** The mine's
arming ring is the closest existing idiom and it closes to *nothing*, because it is a clock running out.
Same family, opposite information — one says "time is up", this says "here, this much". Being outside the
footprint on the way in is legal because it is visibly *moving*: the law forbids a mark that **sits**
outside a real envelope claiming to be it, and a converging one states its destination by arriving there.

Violet, because violet already means *matter is arriving* (it is the formation flash's colour), so the
mark inherits a meaning rather than inventing one — and because this is **the only thing in the game drawn
on bare ground away from a body**, which is what makes it unmistakable before any of the rest of it lands.

⚠️ A pending spawn is cleared on run reset. Leaving one alive drops a body into the next run out of
nowhere, i.e. the exact fault the mark exists to remove, wearing its own sign.

⚠️ **A closing 16-slot cage stood here for one commit, and its failure is the reusable part.** It was
floored at 145 so that only a flip held past 1.18s could reach it, which is a lot of derivation — and
three of this file's own tests say the object was wrong, not the tuning:

- **The three pattern rules did not apply to it.** Rule 2 has no referent (Neutrals have no polarity),
  rule 1's thresholds are the wrong ones (a Neutral is r15, so contact is 30 and walkable 60, not 26/52),
  and rule 3 was only satisfiable by bolting convergence on. **A shape that has to be argued past all
  three rules is not a shape; it is something else wearing a shape's costume.**
- **A cage answered by exactly one input is a quiz, not a question.** Measured: 0 of 16 popped at every
  hold below 1.18s, 16 of 16 at a full hold. Binary, because every body sat at one radius — the player's
  move was not positioning or timing but "have I pre-loaded the one answer", with no partial credit in
  either direction.
- **The livery lied about it.** Sixteen half-red/half-cyan bodies on a 145px ring read at a glance as an
  alternating Noose, i.e. as a shape you solve by matching colour, which is the exact opposite of true.
  Same fault class as a drawn boundary that states a reach the code does not have.

### The Comet
Not a formation but an **event**, on its own much longer timer rather than in the shape rotation — and
that timer only advances **outside a boss**, which is roughly half a run, so a naive "make it rarer"
pass lands at twice the intended rate.

**Three to five Dots crossing the whole sky on one shared heading**, several times faster than anything
else, each trailing a tail emitted in world space so it drifts behind its nucleus instead of being welded
to it. They carry a charge like everything else, so a shower is either a large delivery of ammunition you
intercept by positioning or a fast threat that crosses — which keeps it inside the core verb instead of
being decoration. Every nucleus is a **Brute**, so intercepting one is a real hit.

It was a single body until `9fd8dcb`, and the change is what the section header always claimed: **one
crossing is a curio, a stream is weather.** Author: *"shower 3-5 comets at a pattern. wont it be cosmic?"*

⚠️ **The spread is the whole thing, or it becomes a Wall** — which is another formation's job and a
different demand on the player. Three separate spreads keep it a stream you weave through rather than a
line you must be outside of: **lateral**, abreast of the shared heading; **trail**, pushing each body
back along it so they cross in sequence instead of in rank; and a **separate near-miss aim point per
body**, so the group fans out — one shared target would converge them into a noose. Speed varies per body
on top of that. Measured over six showers: counts 3/3/4/5/5/5, holds staggered 2.42–4.38s, every body
crossed and exited, none stranded.

Aimed to pass **near** you rather than at you, so a body touches you about one pass in five: an
opportunity, not a hit. Flight distance is solved **ray-vs-box** against the padded viewport per body, so
each ends past the *far* edge — a fixed distance cannot serve both a level crossing and a corner-to-corner
one. Reaching the edge **retires** them (law 8). Miss a shower and you lost the opportunity rather than
gained enemies.

⚠️ **The hold has a `max(0.5, …)` floor and it is load-bearing.** Trail can push a body further out than
the base spawn point, and a negative ray-vs-box solve hands `holdBody` a zero hold — which drops that
comet out of formation flight on its first frame and leaves it sitting in the margin as an ordinary
Brute. A spread that widens will meet this again.

### A ring near your core always eats itself
Control measurement, worth knowing before anyone "fixes" a shape: sixteen **ordinary** Dots simply
placed on a ring around a still player — no formation, no flight, no script — annihilate **16 of 16**.
The two colours converge at very different speeds and cross.

So no formation obeying rule 6.2 can end cleanly near the core; it can only be *less bad* than raw
matter in the same place. Don't chase the remainder to zero — the path runs through rule 6.2 or the
colour law itself.

---

## The Anomaly

The boss. **Immune to your pole reversal** — you cannot flip it to death. Position-controlled; it never
merely chases. **There is no clock in the fight and it never leaves: the only exit is purging it.**
That is a deliberate property, not an oversight — a second win condition on a timer asks nothing of the
player, and the one that used to exist here handed out the Epoch advance for free. **The failure mode is
losing the run, which is the correct failure mode for a boss; it is never being stuck in one.** See
*Ways in* for the measurement that keeps it true now that the Capacitor buys no boss damage.

**The pool is therefore the whole length of the fight**, which is why it is priced in **connecting
bodies** against `VOLLEY_DMG` and never in raw HP, and why the baited charge is repriced whenever it
moves. Padding it makes the third answer a chore rather than a question.

*It was raised by a flat amount at every Epoch, and that changed the curve as well as the level.* The
pool used to **triple** from Epoch I to V and now less than doubles, so the early Anomalies took nearly
all of the increase — which is where the complaint was. The Anomaly row of the run summary is the
readout for whether it landed: it prices each fight in the HP that fight actually cost.

⚠️ **The size of that raise has moved once already and the figures here are deliberately gone.** The
first attempt overshot and was trimmed the next day (`d214716`), which briefly left this paragraph
quoting the intermediate percentages as though they were the change. The shape of the curve is the
durable claim and it survived the trim; the percentage attached to it did not, and belongs in the two
commit bodies rather than here. **A number that has been restated once is a number that will be
restated again** — see *Traps*.

**Three kinds, one verb each** — volleys · chase · ground denial:

| | |
|---|---|
| **Emitter** | hovers and alternates a hexagon **burst** (one arm leads you, the other five close your escape angles) with a sweeping **stream** of leading fans. From Epoch II it also **dashes** |
| **Sentinel** | circles the arena firing pincers **and sheds swarmers as it goes**, so its orbit writes a **trail** you have to run down |
| **Pulsar** | telegraphs a collapsing charge-ring, then erupts a **radial wall with one seam** — be in the seam. Between rings it lobs **mines** onto the ground around *you*. Carries less HP: the kind that moves you rather than out-damaging you |

The first Anomaly of a run is always the **Emitter**, whose opening hex burst teaches the loop. Each
kind draws a different body and **the shape is the mechanic** — the Emitter's hexagon turns on the same
value that aims its crossfire; the Pulsar's rays lengthen as the nova winds up. Drawn `source-over`
inside the additive pass (law 12).

**Its size is its hitbox** (law 4). Everything follows the one number: the star's contact envelope, the
volley and grind connect radius, the hunt's contact floor, the bounce-out push, the missile launch
offset and every shock ring.

### The Hunt
Every so often an Anomaly **leaves its station and walks onto your core**. A walk, not a dash — strolling
away is always possible. **It lands one hit and immediately breaks off**; it never parks, because its
touch is the most expensive hit in the game and it is never consumed, so a boss standing on your skin
would be unanswerable rather than threatening.

It never starts mid-dash or mid-charge, and the Emitter will not wind up a lunge while hunting — a dash
from point-blank is an unreadable hit, not a telegraph.

**The Sentinel walks too**, in its own grammar: it re-centres its orbit on your core and spirals in. The
spiral starts on the bearing it is already on (or it sprints sideways to reach a point elsewhere on its
circle), its **tangential** speed is capped rather than its angular rate (or it sweeps fastest when
furthest, which is backwards for something closing on you), and the follow is a **capped step** rather
than a proportion of the gap (a proportion would move the boss 40px in one frame on a long player flick).
The cap must stay above the target point's own speed, or the Dot trails its own target and never arrives.

**It is telegraphed**, because it is the moment the Anomaly is closest: a bright long wake, a dashed lane
drawn to your core in the same grammar as the dash telegraph, a descending tone as it breaks station, a
ring-flash on departure, and the integrity bar switching to a red **movement instruction**. That bar
names a movement answer — which is the rule for that line.

### The Dash
The Emitter's one committed, unavoidable-once-launched move, so its warning has to be *information*.
**It locks its lane when the wind-up begins**, draws *that* lane, and drives past the locked point — the
threat is the **lane**, not the Dot, so backing straight down it does not save you; you have to leave it.
A reticle collapses onto the lock so *when* reads as clearly as *where*.

**The commit throws three spears, not one.** A move announced this heavily cannot also be answered by one
sidestep, so its punctuation covers the angles you might leave **by** rather than the point you were
standing **on**. Each spear carries its own angular offset through the muzzle re-aim, or all three
converge on the same player-facing angle mid-charge and land as one.

### Missiles
Everything the Anomaly throws. All of them launch from its **own body**, so none can be walked back
through it — its fire cannot erode it, by construction rather than by rule. A missile **hurts you
regardless of your polarity**: you dodge a missile, you never match it.

**Five kinds, five answers**, so a fight asks more than one question:

| | |
|---|---|
| **Volley** | a spread that leads your motion — cross it |
| **Seeker** | turns onto you, then commits. It out-turns you but cannot out-run you — so run, don't juke |
| **Ring** | an expanding wall with one seam — be in the seam |
| **Mine** | lobbed at the ground around *you*, arms, then detonates; it draws its exact blast — leave |
| **Spear** | telegraphs a line and tracks you along it, then fires — leave the line |

**Mines come two ways, and the second is the Pulsar's Epoch III escalation.** The **scatter** lays 2–3 at
stratified bearings on a jittered 140–190px ring around you; **the Box** (`fireMineSquare`) lays eight
stations on a square, one omitted as the door. Every dimension of the Box is *derived from the blast*
rather than chosen — 165px spacing so the perimeter is a single continuous denied band (≤ one blast
diameter), a 46px pocket at the centre (half-side minus the 119px damage radius), and 92px of clear
passage through the door — so the shape asks "hold the pocket or run the door", and the arming ring that
closes inward is already the telegraph for the 1.2s you have to decide in.

⚠️ The Box is **all-or-nothing on reach** while the scatter drops individual out-of-reach stations, and
that asymmetry is deliberate: three loose mines are still three loose mines, but a box with a side missing
is a different, easier shape wearing the same telegraph. The consequence is that the Box only fires from
about **46% of arena positions** — it is a *proximity punisher*, which is the right shape for the kind,
because closing the range is exactly what eroding an Anomaly demands of you.

⚠️ And **a mine's reach is not `sp × 60 × life`** — it decelerates while arming and then coasts, so it is
`35.6 × sp`. See law 15; getting this wrong put every mine 35% past its aim point for months.

Its hits are priced by **how much warning you get**: a missile is the cheapest (the thing you eat most
often), a mine blast is double (it announces itself twice — it arms, and it draws its own blast radius,
so standing in one is a decision), and its **body** is the most expensive and the least excusable.

**Reach is `sp × 60 × life` and nothing corrects it** (law 15). `MSL` in `index.html` is the only thing
that sets it. The relationship that matters is the **margin against the arena**, and the arena is not a
constant — `resize()` gives `W = vw / S` with `S = min(1, min(vw,vh)/800)`, so in design units the play
field is the viewport itself on any display whose short axis clears `REF_SHORT`. At full pace the four
flying kinds reach **1656–2208** design units; at Epoch I's `pace.spd` that becomes **1242–1656**. A lance
is removed by whichever comes first, leaving the screen or running out of life, and on a laptop-sized
arena the edge gets there.

⚠️ **Which means the margin shrinks as the display grows, and nobody has measured the big end.** At
1440×900 the arena is 1440 wide and every reach clears it; at 2560×1440 it is 2560 wide and *no* kind
reaches across, spear included. Whether that ever shows depends on where the Anomaly stands when it
fires — it shoots from its own body, not from an edge — so this is arithmetic, not an observed fault, and
it is listed under *Open* rather than stated as one. **Every fizzle figure in this file was taken at one
viewport size.**

⚠️ **Nothing but a mine currently expires where you can see it, and that is a tuning state rather than a
law.** Author: *"it doesnt have to expire on screen."* The argument for holding it: a shot winking out
mid-arena is the game withdrawing a threat it already made, and there is no way to read that as anything
but the arena flickering. So `life` is kept as a **backstop** against a projectile that never leaves — a
curving seeker, mostly — rather than as the thing that ends an ordinary flight. `9fd8dcb` raised every
non-mine value past the longest crossing with margin (volley 4.2 → 6.0, ring 4.2 → 6.0, spear 2.8 → 4.0,
seeker 6.9 → 9.6) and measured **zero non-mine mid-arena expiries, all three variants, both Epochs** — at
the harness viewport, per the warning above. Surplus life past that point costs nothing, because a
straight missile is culled the frame it exits and never reaches its `life` at all.

**The mine is the standing exception, and it is why this is written as a state and not a rule:** its
`life` is a fuse, running out on screen is how it detonates, and it stays where it is. A future
projectile with as good a reason can overrule the paragraph above. *(An earlier draft of this stated it
as a law in capitals, with the mine contradicting it two paragraphs later — see* Traps.*)*

### Pace
The Anomaly's first fights are **slower**, on two axes at once, reaching full speed at Epoch III and
staying there. `pace.cad` stretches every gap between attacks; `pace.spd` slows every projectile.

**Both axes, because either alone reads wrong.** Fewer shots at full speed is still unreadable — the
thing that beats a new player is a projectile crossing faster than they can decide, and thinning the
stream does not slow the one that arrives. Slow shots at full cadence just fill the field, which is
harder rather than gentler. Only moving both makes an early fight legible instead of merely sparser.

**`pace` is frozen at spawn, and that is the design claim rather than an implementation note.** It is
computed once from the Epoch and stored on the boss. The Anomaly in front of you never changes pace; the
next one is faster only because you survived to reach it. This is what makes the ramp *compatible with*
the no-intra-fight-clock rule rather than an exception to it — the objection that a ramp must not hang on
elapsed time is an objection to a clock running **inside** a fight, and the Epoch is the axis the pool
already ramps on. If this sampled `act` live, an Epoch rolling over mid-fight would speed the patterns up
while the player was standing inside them: difficulty attached to nothing they did.

⚠️ **`pace.spd` shortens reach, deliberately — and it used to be corrected away.** `fireMissile` divided
`life` by `pace.spd`, so `(sp × ps) × (life / ps) = sp × life` and `ps` cancelled exactly. This section
used to argue that as an *identity, not a measurement*, the strongest pin a number can have. `085a7f1`
removed it (law 15). An Epoch I missile now covers three-quarters the ground of an Epoch III one, because
it is three-quarters as fast for the same seconds of life.

**The fear the old text named was real, and it was real for exactly one of the five kinds.** It predicted
patterns that stop *arriving* rather than arrive later — the Pulsar's ring falling short of you, the
Emitter's fan dying before the end of its lane. Straight flyers clear the arena at 0.75 speed with room to
spare and were untouched. The **seeker** was not: it spends `seekFor` turning onto you before it commits,
so its path is far longer than the distance it closes, and it has to buy the arc as well as the approach.
Removing the correction put the Sentinel's fizzle-on-screen rate at **44.4%** against 11.1% before, with
missiles visibly winking out inside the arena.

**The fix went into the table, which is the point of the model** — `MSL.seeker.life` 5.2 → 6.9, exactly
the old effective value, and the rate came back to 11.1% with Epoch III unmoved (nothing about it changes
at `ps=1`). ⚠️ **What that says about the correction is the part worth keeping: it had been *hiding* a
table value too low for a slowed curve.** Holding reach constant meant the deficit could never show. A
compensation that makes a wrong number harmless is a compensation that makes it permanent.

The cost accounting flips with the model, and in the direction that helps. A slowed missile is on screen
longer per pixel but covers less ground, so an early Epoch is not more cluttered than a late one —
measured, Epoch I runs **3.02 lances on screen and 80 fired** against Epoch III's **5.00 and 151**, and
neither figure moved by a decimal across the change.

⚠️ **The depth of the ramp has nothing behind it.** It was picked from a menu of options rather than
derived from a measurement or a playtest, and no result contradicts it because no result exists. Recorded
because **an undated design choice reads like a tuned one** to the next person, who then treats it as
load-bearing and tunes around it. It is free to move — and this paragraph deliberately does not name the
figure, since a sentence whose point is *"this number is arbitrary"* should not be the thing that goes
stale when the number changes. `index.html` has it.

### Erosion
**The loop:** dodge the missiles · scavenge your colour into your rings · evade the other colour ·
**position so the Anomaly is downrange of your rings** · then hungry-flip and they fire straight through
it. A loaded ring also grinds on contact, so closing pays twice.

**The Volley** launches every gathered Dot that is not the boss's colour straight away from the core,
along the radius it already sat on, un-clamped and seek-suppressed for a hold window — dead straight,
**no homing**. A ring reaches the Anomaly only if you put it between yourself and the Anomaly.

**Why range is the skill.** Ring fire is **radial**, so what fraction of a discharge connects is set by
the angle the Anomaly subtends from where you stand: ~3.9% of the circle at 300px, ~7.9% at 150px,
~11.9% at 100px. Closing is the *only* way to raise your hit rate, and it walks you into point-blank
fire. Measured across 15 fights: orbiting at 270px → 8 kills / 7 deaths; closing to 150px → 11 / 4.

**And reach is not range.** A reach buff was measured across 8 seeded fights per kind at three ranges and
the outcomes were **identical at every one**. Out there the binding constraint was never whether the shot
arrives — more reach just delivers more matter to where you were already not aiming.

**`VOLLEY_DMG` was repriced for the same reason the bait was, one commit later, and the gap between the
two is the interesting part.** A pool raise silently reprices every channel that does not move with it:
double the pool and an unchanged channel costs twice the connecting bodies it did. That was spotted for
`CHARGE_DMG` and acted on, and the *aimed* channel — the one the whole fight is built around — was left
standing through the same buff and the trim after it. Nobody was arguing the volley should get harder;
it simply was not on the list.

Priced back in **connecting bodies**, which is the unit this section insists on, the aimed channel now
sits a shade harder at the early Epochs and a shade easier at the late ones than before any of it, and
lands **identical at Epoch II**. That is the honest shape of it: not a restoration, a re-derivation that
happens to cross the old curve.

⚠️ **Walk `VOLLEY_DMG` and `CHARGE_DMG` together whenever the pool moves.** They are not pinned to each
other — see the ratio warning below, which is now sharper than it was — but they answer to the same
input, and this defect has now been introduced twice by fixing one and not the other.

**The ring grinds.** A Dot whirling in your rings that sweeps through an Anomaly cuts it. You did not
aim it, but you spent a hold gathering that ring and you have to carry it into contact range — that is
what makes it yours rather than an accident. Contact **consumes** the Dot, which bounds a grind to the
hoard you actually built.

**Overdrive does not make grinding stronger. It moves where grinding works, and inside your usual range
it makes it far worse.** This was assumed the other way round for a long time, and one balance decision
was taken partly on the assumption. Measured:

**The band is an identity, and it is written as one because every attempt to write it as numbers has
been wrong.** Contact requires the gap between the shell and the Anomaly to fall under `boss.r + dot.r`,
so:

> band = *settle radius* ± `(boss.r + dot.r)`  ·  width = `2 × (boss.r + dot.r)`

*The settle radius has no name in the code* — it is an emergent equilibrium, not a variable, so it is
written here in words rather than backticks. Only `orbR`, the target it overshoots, is a symbol.

⚠️ **The settle radius, not `orbR` — and this doc said `orbR` for two commits, which was wrong.** `orbR` is only
the spring's *target*; the tangential spin drives the shell past it and the two balance out further
along. At rest they agree, but while burning the shell settles about a third beyond the target. Quoting
`orbR` understates every consequence of the orbit by that much. The correction is in `index.html` at the
ring-capture block, with the measurement.

**Centred on where the shell actually sits, with a width that does not contain the radius at all.** So
Overdrive **shifts the band outward and cannot widen it** — retune the orbit and the width provably does
not move; only `boss.r` or the Dot's own radius can change it.

*Two things the numbers hid, and species-dependence turned out to enter twice.* A Brute ring grinds
across a window wider than a Dart ring's by **twice the difference in their hull radii** — and, separately,
each species **settles at a different radius**, because every Dot rides its own speed ceiling and the
shell balances at v/r. So the band's width *and* its centre both vary by species. **There is no single
band, and there is no single shell radius either**; a rig that feeds one species is measuring that
species, which is exactly how the endpoints went wrong.

⚠️ *Endpoints were quoted here and are gone on purpose.* They read as measurements and were arithmetic —
computed from a hull radius that did not even match the species the rig fed. The measurement bracketed
the band; it never produced its edges. **The qualitative result is robust and was never the part at
risk**: at every distance tested inside your usual fighting range, grinding is **several times worse**
while burning, varying about threefold across the band, so it is a range and not a factor.

At the range the rest of the fight pushes you toward, Overdrive takes the grind away rather than adding
to it. **Closing to raise your volley hit rate and burning to grind harder are not compatible plans.**

⚠️ *That conclusion survived `fbe4d18` but its mechanism changed, which is the more interesting half.*
When Overdrive also widened the Field the two bands were **disjoint** — burning moved the shell clean off
everything the base ring could reach. With the Field pinned they now **overlap**, and the conclusion
holds anyway, on the measurement rather than on the geometry: close in, grinding is still several times
worse while burning. **A conclusion that outlives the argument it was built on has to be re-derived, not
re-asserted** — this one was checked and kept; it could as easily have gone the other way.

**The mechanism is why this is a finding and not a table.** Grind throughput is **feed-limited, not
speed-limited**: usable ring Dots run *inverse* to damage dealt, because the grind eats its own supply on
contact. Ring **speed** therefore cannot raise the ceiling at all — only gathering more matter can. Any
future proposal of the form *"make the ring faster / wider to help the grind"* is answered by this line
before it is built.

*Absolute throughput figures are deliberately absent.* The rig's ceiling was its own feed rate, not the
game's, so the ratios and the band are the content and the raw rate would only be quoted back as if it
described play. The four rigs that preceded this one all returned zero — see *Traps*.

**No per-kind bonus, and the obvious one is backwards.** A bonus for the kind you have to *chase* looks
right and measures wrong: closing on the **Sentinel** is the **cheapest** of the three, because its orbit
carries it away rather than parking on you and firing, while the Emitter and Pulsar sit still and shoot
you point-blank. **Hard to catch and dangerous to stand next to are different axes**, and the grind is
priced on the second. `GRIND_MULT` is an empty table on purpose — the signpost that stops this being
rebuilt.

**The baited charge is priced as a share of a bar, not as a ratio to the volley.** `CHARGE_DMG` sat at
4 × `VOLLEY_DMG` for a long time and the *ratio* was written down as the constant — but the ratio was
only ever how you reached the share at the pool of the day. When the pool was raised, the two readings
came apart: *hold the ratio* said leave the number alone, *reprice with the pool* said raise it, and
only the second was ever the point. **The share is the invariant. The ratio was a way of computing it.**

⚠️ **And the ratio is now 4× again, by coincidence, which is the worst possible outcome for a rule that
was just retired.** Two independent decisions — raising the bait for the pool, then raising the volley
for the same reason — happened to land back on the old number. Nothing was restored and no pin came
back. **A coincidence that reproduces a discarded rule is more dangerous than the rule was**, because
the rule at least had an argument attached and the coincidence arrives looking like confirmation. The
next reader to "tidy" 4× back into a rule reintroduces exactly the defect this section exists to
record, and the next pool move is when it bites. `index.html` carries the same warning at the constant;
it is repeated here because the person who re-pins the ratio will be reading about the *pricing rule*,
not standing at the definition.

The bait is deliberately restored **short of** where it stood, because the pool went up for difficulty
and the answer to a harder fight should not undo the difficulty. It is the one erosion channel costing
**no ammunition and no Capacitor**, which makes it — with the grind — what a stripped player has left,
and the same reason `RING_GRIND_DMG` is protected from being halved.

*The ceiling that was once rejected is now the fix* — and the rejection turns out to have been invalid
from the start, which is a sharper lesson than the one recorded here before.

The current value was argued down for one-shotting an **Epoch I Pulsar**. That fight does not exist and
never has: `pickAnomalyVariant` gates the Pulsar behind `act>=2` in the repo's first commit and every
one since, `bossN===0` is unconditionally the Emitter, and Boss Rush pins `act=2`. The 11 HP figure the
rejection used needs `act=1`, which is reachable only by calling `spawnBoss` directly from a harness.

At the lowest Pulsar the game can actually spawn, the value being rejected **never one-shot anything** —
it left that Pulsar alive on 3 HP. So the constraint was not a constraint, the ceiling was not a
ceiling, and the number spent months excluded on the strength of a fight nobody could be in.

⚠️ **A constraint derived from a state the game cannot reach is not a constraint.** It is the same
family as *a zero from a rig you have not proven can produce a non-zero* (see *Traps*) and strictly
worse, because a suspicious zero at least invites a second look, while a plausible number from an
impossible state reads as a finished argument and gets filed. **Before a measurement becomes a rule,
show that the state it was taken in is one the game can produce** — for anything Anomaly-shaped that
means naming the Epoch and checking it against the variant gate.

The outcome was survivable, which is exactly why it lasted: the value is defensible at the current pool
on its own merits. Being right by accident is not the same as being right, and it leaves nothing behind
that the next reader can check.

**The Fling never erodes.** Not "rarely" — never, by rule. A Dot you pushed *away from yourself* is not
a shot you took at something. The Fling is defence, and only defence.

**Ways in — three, and law 2 has nothing left over.** Two from matter you gathered (**Volley**, the main
line, and **Ring grind**, for carrying a loaded ring into it), plus the **baited charge** (matter you did
not gather but did aim). **The Capacitor buys no boss damage at all.** The grind needs neither a flip nor
the meter, which makes it the fallback when you have been stripped of everything else — and now the
*only* fallback, which is why halving it is not a free move.

*No softlock:* the Volley closes all three kinds unaided — measured 53.1s Emitter, 39.8s Sentinel,
33.4s Pulsar. Grind alone takes the Sentinel and the Pulsar but **not** the Emitter, which is the kind
that hovers and shoots you point-blank; holding an orbit against it is the thing that does not work.

⚠️ *Those four results predate the pool buff and none has been re-run against it.* The pool doubled at
Epoch I, so the three times are floors rather than estimates, and **whether grind-alone still closes the
Sentinel and the Pulsar is now an open question, not a recorded fact.** No-softlock is the safety
property of this whole section; treat it as unverified at current numbers until someone re-runs it.

**Purge** — destroying the boss; the word means only this. Pays score scaled by Epoch, an Integrity heal,
and a Capacitor chunk.

### What still deletes matter near an Anomaly
Worth naming, because none of it is the Anomaly's fire and all of it gets blamed on the Anomaly's fire.
**Ambient opposite-colour traffic** is overwhelmingly the answer — ordinary matter meeting matter. The
**Sentinel's swarmers** are the only boss-emitted eraser, and they are *matter* rather than shots, so the
colour law owns them like anything else.

The Anomaly's **body** is the one exception, and it is not fire: it consumes matter that actually chips
it, or a flung Dot parked inside its skin would chip every frame. Matter that pays zero — ordinary
drift-in — **bounces off**. It is a solid object, not a vacuum; consuming it would quietly delete the
ammunition you were about to use.

---

## The run

**Epochs** are the major stages, each with its own name and palette — **Nebula → Aurora → Eclipse →
Meteor Shower**, then looping. Each Epoch raises pressure three ways: the same species bites harder and
moves faster, the mix shifts toward positioning-demanding species, and the arena holds more Dots. **HP is
deliberately never scaled** — annihilation is binary.

**Everything qualitative is finished by Epoch III, and that is worth knowing before tuning anything at
the far end.** `pace` pins at 1.0 there (`clamp((act-1)/2,0,1)`) and every roster gate is `act>=2` or
`act>=3`. After III the game introduces nothing new — Dot damage, Dot speed, Anomaly HP, storm surge size
and purge score keep climbing, and that is all. Three things also quietly stop: the calm clock floors at
Epoch 10, build at 12, storm at 17; and the arena cap is `min(330, 40 + elapsed + act*10)`, where
`elapsed` alone reaches 330 at ~4:50, so past five minutes the `act` term contributes nothing at all.

**The Meteor Shower is the one Epoch with a mechanic of its own.** At Epoch IV — and VIII, XII, every
fourth — `isShower(act)` puts the comet formation on formation cadence, `rand(9,16)`, against its
ordinary `rand(200,300)`. Do the arithmetic before touching it: an Epoch's non-boss window is about 38s,
so on the base clock a comet lands inside any given shower roughly **one time in seven** — the Epoch
would have been named for something that mostly did not happen. ⚠️ **The clock is re-armed at the Epoch
boundary in `onBossCleared`, not only where it fires**, because `cometT` survives the boundary: arriving
with 180s left shows no shower at all, and leaving with 12s left drops a stray comet into the next Epoch
where nothing explains it. Measured over a walk from Epoch 1 to 8, purging on sight: **17 comet bodies at
IV and 11 at VIII, zero in all six non-shower Epochs**, including V immediately after.

**The palette cannot carry hue, so it carries lightness.** Solving for four tints ≥ΔE 32 from every
colour the game has already claimed has *no solution above chroma 22* — polarity plus the cue vocabulary
own the wheel. So the Epochs are told apart by L\* instead: **Eclipse 46 is the darkest sky in the game
and Meteor Shower 74 the brightest**, Nebula 60 and Aurora 64 between. Adding a fifth mood means
re-solving, not picking a fifth hex; there is no room left to guess into.

**Phases** run inside an Epoch, in order: **Calm → Build → Storm → Boss**, then release into the next
Epoch. A **Storm** is a colour-themed surge whose colour swaps halfway through, so you re-decide your
polarity mid-wave. **Intensity** is the internal 0–1 dial that scales spawn rate; the **Director** owns
phases, spawns and formation scheduling.

**The spawn mix** ramps by *time* through the intro and then by **Epoch**: Drifters thin out and the
positioning-demanding species climb. *Stronger* means the swarm asks harder questions of your flip, never
just more meat. During a boss fight the colour leans mildly toward the opposite of the Anomaly's so there
is ammunition, but stays varied — the reliable kill is the flip, not the lean.

The mix is a **bag of weights, not a table of rates** (`wchoice`), and the distinction is load-bearing:
changing one weight redistributes the difference across every other species, so a weight halved is a
species reduced by slightly *less* than half. Weights are summed as floats, so fractional weights are
exact rather than rounded. The Bomber alone carries a rarity multiplier, `BOMB_RARITY`, applied to **both**
bands so it scales by the same factor at every Epoch — halving only the intro band would let the species
creep back at high Act, where the weight climbs.

Formations and storm surges spawn outside `doSpawns`, so the *measured* mix is wider than either table on
its own. *(A third source used to sit here: Minis, spawned only by Splitters dying and appearing in no
table at all, once about an eighth of all arrivals. Both species were deleted in `6324914`, so every Dot
that is not part of a shape now comes from a table.)*

### Pressure is spawn-limited, not player-limited

**The single most useful fact about this game's difficulty, and it is counter-intuitive.** Throughput —
how many Dots leave the field per minute — is set by the spawn system and is very nearly a constant. What
actually varies is the **standing population**: how many are on screen at once. Matched 180s runs, damage
off, star stationary, n=8:

| | Dots leaving /min | avg standing |
|---|---|---|
| baseline, flipping | 292 | 32.6 |
| Overdrive burning, flipping | 271 | 27.4 |
| baseline, never flipping | 268 | 29.4 |

**Throughput holds a narrow band while standing population moves several times as far.** 268–292 here,
a ratio of 1.09; an independent harness sweeping flip cadence across four rates from every-20-frames to
every-300 measured 209–230, ratio **1.10**. Different absolute scales, same tightness — which is the
result that matters, since the two harnesses disagree on level and agree on shape.

The reason is structural: matter that reaches you already dies, so an effect that makes you deadlier *at
the core* cannot reduce how many are standing — the queue is upstream of you. Only something acting at
**range** can. That is why the ring shell is the lever that works and why a wider gathering Field is not
one.

**Every departure is a kill.** Splitting departures by whether the object was flagged `dead` gives the
same number to the decimal in every condition — nothing leaves this field without dying, which is the
same result as the 300s tracking run in law 8 (1,374 entered, 2 ever left). So "kills per minute" and
"Dots leaving per minute" are the same measurement, and a harness that reports one can be compared with
a harness that reports the other.

**A retracted correction, kept because retracting it is the lesson.** An earlier version of this section
claimed the band did *not* hold — that adding flip cadence broke it, 209 to 299. That was an n=6
measurement; at n=8 the same harness gives 271 where it gave 299, and the spread collapses back to 1.09.
**The band was retired on a number that does not reproduce, and "throughput is spawn-limited" is
load-bearing in the reasoning for deleting Collapse** — so it nearly took a real conclusion with it. Read
the replication trap below before quoting anything from this section, including this table.

**What this means for anything new.** A powerup or mechanic sold as "clears the field" has to be measured
on *standing population*, not on kill rate — kill rate reads flat no matter how strong the effect is, so
reporting it will make a real effect look like nothing. This is not hypothetical: an attempt to measure
Overdrive concluded it was a no-op while reading throughput-shaped numbers, and that conclusion was
written into the docs before it was withdrawn.

Three more traps the table records:

- **A wider gathering field is not reach.** Field ×2.2 alone is indistinguishable from baseline, because
  a bigger field pulls more matter onto you at the same rate it catches more.
- **Flip cadence dominates everything else, so it must be held fixed.** Never flipping measures ~23–26
  standing against ~32 while flipping — a larger swing than most effects you would be testing. Two
  measurements taken at different cadences are not comparable, however carefully each one controlled
  its own variables.
- **An effect near the detection floor needs its replications reported, not its best run.** This is the
  expensive one, and it caught three separate sessions in a single day in three different directions:
  one concluded an effect was a no-op, one quoted it at −17.8%, and the true answer is "small, and we
  cannot pin it." Seven measurements of the same cell under matched conditions ran +0.3%, −1.2%, −4.7%,
  −6.6%, −7.0%, −17.8%, −20.7%, with Welch *t* between 0.40 and 2.82. **`n=4` is not enough here, run
  length moves the answer, and one decimal place is a claim this method cannot support.** If you can
  only report one number, report the range and the *n*.

*Caveat that bounds the claim:* the star is stationary, so `moveMult`-style effects are worth nothing
here and are understated. The constancy of throughput is not — it holds in every condition tested,
including the ones that move standing population the most.

### Meters
- **Capacitor** — fills from kills, Motes, streak milestones and Epoch clears, and pays for Overdrive.
  Chimes at `OD_MIN`, the point it becomes spendable, rather than at full. Kills *during* a burn pay
  nothing — you cannot refill while spending.

  **`P.chargeGain` is the global income rate**, not an inert 1. Every income site multiplies by it, so
  it is the one place the whole economy is priced, and adding a source without it silently makes that
  source worth double everything else — which is exactly what had happened to the purge reward, the one
  site that skipped it. Halving this halves income everywhere at once; it is one of the two levers that
  repriced Overdrive 4× (see *Overdrive*).

  **The HUD is the only thing that shows you it is spendable** — there is no world text for
  availability any more (law 9). **The bar is the availability channel**: `#chgbar` shines on exactly
  the `P.charge>=OD_MIN` test, so the bar and the chime cannot disagree. **The button is not** — it
  shows on *armed or burning*, so it does not vanish from under your finger part-way through a hold.
  The two deliberately disagree in the tail of a ride below the floor, and the disagreement is the
  point: the bar means *you can ignite*, the button means *the thing you are holding is still here*.
- **Streak** — a no-hit combo, resets only on real damage (shield blocks do not break it). Named tiers,
  each paying a Capacitor chunk. Breaking a streak past the first tier **bursts** it into Capacitor
  instead of vanishing.
- **Mote** — annihilation loot carrying the popped Dot's colour. Same-polarity Motes hoover to you;
  opposite ones lie inert until a reversal vacuums them. Collecting one pays score where it lands.
- **Score is addition, and there is no multiplier.** A kill (`KILL_SCORE` 20) and a Mote (`MOTE_SCORE`
  5) each pay a flat amount wherever they happen. A kill is the unit, a Mote is a quarter of one, and a
  kill sheds 1–2 of them — so hoovering your own debris is worth about a third again on top of the kill
  that made it. Where you stand is already priced by the things that decide the fight.

  **Five write sites, and the list is the whole scoring model:** `+MOTE_SCORE` on a pickup, `+KILL_SCORE`
  on a kill, `+200×act` on an Epoch purge, `+250×act` on a Gilded Bounty, and `score=0` on reset. Every
  term is an integer, so nothing rounds. ⚠️ **The two `×act` terms are the only thing in scoring that
  scales with anything** — clearing Epoch V pays five times Epoch I. Say that out loud in any copy that
  claims "no multiplier": true of your *skill*, not of the depth you reach.

  **The multiplier was removed because it measured as a coin flip, not a curve.** `mult` was
  `min(15, 1+motesBank*0.1)`, banked by Motes and halved on every hit. Over 12 runs that took hits it
  landed at a median of **×1.9**; over 6 of 6 runs that took none it **capped at ×15 inside 46s**.
  Nothing in between — and **1.30× total effect on final score** for a 44px HUD stat and two popups.
  The halving also punished backwards: a clean run banks 761 Motes against the 140 needed to cap, so
  the first two hits cost a deep bank literally nothing while a shallow one lost half. Anything
  reintroduced here has to beat that bar: it must separate *outcomes*, not just decorate them.
- ~~**Graze**~~ — **removed.** A dangerous Dot entering `P.r+e.r+16` and leaving past `+28` paid 10
  points, a white burst and a rising blip. ⚠️ **It was never a dodge: no input was required.** It fired
  on the Dot's trajectory, and opposite polarity is *attracted* to you, so your own field bent Dots onto
  the arcs that paid. The comment above it had said so since it shipped — *"grazes are luck as often as
  skill"* — which is why it never paid Capacitor, and the tell was there the whole time: **a channel the
  game would not trust with meter income was still allowed to print score.** If a reward is too lucky to
  pay the meter, ask what it is doing paying anything. See *Open* for the shield plan that wants the
  detection back, and the restore point is marked in `stepPlayerContact`.
- **Gilded Bounty** — periodically one Dot arrives gold-ringed; pop it inside the window for a jackpot.
  Only ever a Drifter or a Dart, never a big Dot. Its dashed gold ring is drawn at exactly `e.r + P.r`,
  so it is simultaneously the bounty cue *and* the true contact edge (law 3). Affordable only because it
  is rare and unique — forty of these would be a HUD rather than a cue.
- **Achievement** — an in-run feat listed in Records. **Flavour only; they unlock nothing.** There is
  no meta economy. Nothing counts the rows, so adding or retiring one is a single line.

### Progression
**There is none, and that is the design.** No meta-progression, no pickups, no upgrades — the Capacitor
is the only thing that accumulates and it empties every time you use it. What improves across a run is
your position and your hoard, both of which you can lose in a second.

*The powerup roster was deleted rather than fixed.* Three temporary drops, of which measurement said only
**Aegis** was load-bearing (−32.8% survival when suppressed, Welch t=4.06 at n=30, against t=1.12 and
t=1.56 for the other two). Removing it cost **−23.5% survival** (34.9 → 26.7s, t=2.18, n=30) — and
**halved the variance** (sd 18.8 → 8.5), because a free shield was most of the long tail. Runs are
shorter and far more alike. See *Open* for what is meant to fill that hole.

### Modes
| | |
|---|---|
| **Survival** | the real run. The only mode that can set your best score |
| **Boss Rush** | one Anomaly always present over a **live ambient field**, cycling kinds on kill; number keys jump to a kind. Epoch pinned, intro mix skipped. Gilded Bounty suppressed |
| **Pattern Lab** | a live ambient field with **no Anomaly and no Epoch phases**; number keys fire the six shapes on demand, and auto-formations are suppressed so nothing arrives unless you asked. It exists because Boss Rush structurally cannot serve it — formations are gated on not-boss, which is most of what Boss Rush is |

**Game states:** `menu` · `play` · `ready` (GET READY) · `paused` · `dead`.

### The run summary
The panel you read on **pause** and the one you read on **death** are the same panel, built by one
function against a different id prefix — a stat that appears in one and not the other is a bug, not a
decision. It carries score, cause, time and peak combo, then two rows of chips: **one per Overdrive
ride, one per Anomaly fight**.

**Both rows are logs, not totals**, and that is the point of them. Four sips and a redline is a
different run from two full burns, and the two sum to the same number — a total reports them as
identical. The row shows *shape*: how the meter was spent, in order.

**The ride row.** One chip per completed Overdrive, in run order, each carrying its own length. A tap
too brief to be a ride is not logged. On pause the ride still under way is prepended as its own
chip showing the seconds left in it, because a paused run can still be burning. On death nothing needs
prepending: dying ends the ride *through the normal exit* before the receipt is written, which is
precisely why the ride you lost during appears in the log at all.

**`endOverdrive()` is the one place a ride ends.** Four things stop a burn — it drains out, you let go
and bank the remainder, the window loses focus mid-hold, or you die mid-ride — and the last is the one
that bit. `die()` used to clear the flag directly, so the ride a player was actually in when they lost
silently never reached the log. Any future stop path must come through the same function, and the
**Redline** grant lives there for the same reason rather than being copied to each exit. It is a no-op
when nothing is burning **by design**, because most release paths fire whether or not a ride was under
way — that is what makes it safe to hang every one of them on the window.

**A ride's length is accumulated, never derived** from the charge it started with minus the charge it
ended with. Streak milestones and the purge reward both pay *through* a burn, so charge does not fall
monotonically while one runs, and the subtraction would under-report every ride that earned something.

**The Anomaly row bills the whole encounter, not the Anomaly.** One chip per fight, numbered in Roman
because the Epoch label and the cause line already number the run that way, carrying **all** damage you
took while that Anomaly was alive — a Drifter that catches you while you are busy with the boss is
billed to the boss. *Damage the Anomaly dealt* is the wrong reading and would be the less useful
number: the field does not stop for a boss fight, and what a fight actually costs you is mostly the
part you cannot answer by watching one enemy.

**The rows cap; the counters do not.** Past `CHIP_SHOW` chips a row stops being readable and becomes
wallpaper, so the remainder collapses into one `+N` — and `N` reads the **counter**, never the length
of the log, because the log stops growing well before a marathon run does. Reading the array would let
a long run quietly under-report how much it was hiding.

**The cause line names species, never internals.** It reads *Lost to* a Dot's display name plus the
Epoch in Roman, with the phase held behind `DEV` two lines away for the same reason. The Anomaly
damages you through the ordinary Dot-contact path, so it needs a row in `DOTNAME` like everything else;
without one the receipt printed the raw internal type back at the player.

---

## Feel

- **Trauma** — screen shake. **Flash** — full-screen colour. **Hitstop** — a brief freeze-frame on big
  hits; the frame hanging is this engine's whole vocabulary for weight. **None of the three is on the
  damage path** — see *Taking damage says one thing* below. They are not one bundle, and the split is
  the grading:

  | | trauma | flash | hitstop |
  |---|---|---|---|
  | **Purge** (`killBoss`) | ✓ | ✓ | ✓ |
  | **Baited charge** (`stepAnnihilation`) | ✓ | ✓ | ✓ |
  | **Bomber blast** (`bomberBlast`) | ✓ | ✓ | ✓ |
  | **Shield block** (`coreHit`, body contact) | ✓ | ✓ | — |
  | **Anomaly arrival** (`spawnBoss`) | ✓ | ✓ | — |
  | **Streak milestone** | ✓ | — | — |

  **Exactly four things in the game stop the frame**, and all four are events *you* caused or walked
  into knowingly. A shield block and an Anomaly arriving get shake and colour but never the freeze — a
  hitstop is the loudest cue the engine has, and spending it on something that happens *to* you is how
  it leaked onto the damage path the first time. When adding a cue, read down this table rather than
  copying whichever line is nearest.
- **Moment Engine** — global slow-motion dips.
- **Floating text** — small rising labels near the core.
- **The sky** — three depths drawn *outside* the shake transform, so distance reads as distance rather
  than a backdrop wobbling. Stars in three parallax layers, gas clouds on their own slower parallax, the
  arena at your feet. Parallax also gives you something fixed to judge your own motion against, and does
  it better than a lattice would, because different rates encode distance as well as movement.
- **The Spheres** — the celestial harp arpeggio, now a single cue: an Overdrive igniting. Achievements ring a
  different sound.
- **Comfort mode** (`reduceMotion`) — two tiers, and the difference matters to someone relying on it.
  **Removed outright:** screen shake (the shake transform is skipped entirely, not scaled), hitstop,
  and the title's expanding shockwave. **Damped:** flash, ring spin, parallax travel. It protects
  against sudden motion, not against slow continuous motion — which is why the title orbits, the one
  slow continuous thing on the menu, are untouched and its flash is kept.
- **Core Fault** — the crash screen. A bad frame is dropped and the loop survives; consecutive faults
  halt it with a reload prompt rather than a silent freeze.

### Sound design rule
**Every reward voice goes up, every damage voice goes down.** A baited charge is both, in that order —
a heavy low slam that then rises. Cues that must be tellable apart with your eyes elsewhere are built as
each other's opposites, not as variations.

**Valence picks the direction; register picks whether it is heard at all.** The rule above is about
meaning and it is not sufficient, which was proved the expensive way: a rebuilt Bomber voice satisfied
it exactly — it rose, no sawtooth, correct valence — and the player still could not find it in a fight.
*"I can't identify bomb sound in complex battle."*

The reason is arithmetic, not taste. In a late fight `kill()` fires **5.6 times a second** and `mote()`
**6.2**, and both are **square waves** — `kill()` flat blips from 380Hz up, `mote()` sliding above it —
so roughly four voices crowd one timbre and one octave-and-a-bit inside any 300ms window. A new cue
placed in that band is not competing with the mix, it **is** the mix. The old Bomber sound worked for a
reason nobody had written down: at its lowest it was the only thing in the sub-bass, and that, not its
direction, is what made it findable.

So a cue that must survive a crowd needs somewhere of its own to stand — a different waveform, a
different octave, or both. The current blast leads on a **triangle** rising 150→700Hz over a **sine**
sub at 75Hz, which clears the square band on timbre and sits under it on pitch. Check a new voice
against what is *already sounding* at that moment, not only against the rule.

**`bomb()` does not own one band, it owns three — and only the middle one identifies it.** 75→150Hz sub
weight, a **triangle 150→700Hz that leads**, and a 1700→2500Hz tick that its own comment calls *"flavour,
NOT the identifying part"*. **The band that must stay clear is 150–700Hz.** Anything reasoning about
"the sub-bass `bomb()` owns" as a single region is reasoning about a voice the cue does not depend on.

Measured against that, the Moment Engine's layers (`a96d813`) sit as follows:

| voice | band |
|---|---|
| `bomb()` **triangle — the identifying part** | **150 → 700 Hz** |
| `bomb()` sub weight | 75 → 150 Hz |
| storm noise body | lowpass 150 Hz |
| heartbeat lub / dub | 52 → 38 Hz / 44 → 30 Hz |
| storm sub | 46 → 32 Hz |

**Neither tonal layer is in `bomb()`'s register at all** — they top out at 52Hz against its 75Hz floor,
6.3 semitones clear, adjacent rather than overlapping. **Exactly one thing collides: the storm's noise
body against `bomb()`'s sub weight**, and that is the case timbre answers — noise against a sine. Nothing
added goes near 150–700Hz.

**A third axis, for that one real collision: a transient and a pulse can share a band. Two transients
cannot.** The storm is *noise*, so it clears every oscillator voice on timbre wherever its energy sits;
the heartbeat is *periodic and in pairs*, and rhythm is a channel nothing else in the bank uses because
every other voice here is a one-shot. Register is the usual answer; it is not the only one.

⚠️ **This section previously read "both layers sit in the sub-bass `bomb()` owns … and they are fine."**
That was false about the code it described *and* dangerous as a rule: it licensed putting a periodic
voice anywhere `bomb()` lives, **including 150–700Hz**, where a heartbeat variant at 200Hz would satisfy
the sentence and destroy the cue this whole section exists to protect. A reason stated more broadly than
the thing it was derived from — the same shape as `706673e`, in a rule rather than a comment.

**Position is a fourth, and only kills have it.** `kill()` is panned by the dying Dot's `x`; nothing else
is. ⚠️ **`mote()` is deliberately excluded** — motes are collected at `d<P.r+8`, at the core, so every
pickup happens in the same place and panning them would encode the Star's position as if it were the
event's. A cue that reports a position it does not have is the same fault as a cue that reports damage
that did not happen. Pan is capped at `PAN_MAX` 0.7: a hard-panned mono voice vanishes from one ear,
which reads as a broken channel rather than as a location.

**A cue reports an event; a layer reports a state.** The heartbeat fires on a clock rather than on
damage, which is what keeps it from being heard as a hit — `hurt()` remains the only voice that speaks
when the core is actually struck. ⚠️ **Gate a state layer on the state, not on the number**: `P.hp`
keeps its last value through the death screen and the pause panel, so a heartbeat testing HP alone
leaves a corpse with a pulse, playing under the receipt for as long as the panel is open.

**`HP_LOW` is shared by the HP bar and the heartbeat**, and that is the point rather than a tidy-up: a
bar that turns red while the pulse is silent would be two channels disagreeing about whether you are in
trouble. Two consumers turn a literal into a contract.

⚠️ **AN ALWAYS-ON VOICE MUST HONOUR THE MUTE CONTRACT, and it breaks silently and only under test.**
Every rig in this repo silences the game through `store.mute`, because a headless loop fires the whole
bank at once. A periodic layer scheduling onto its own node would keep playing straight through that. The
two shapes that work are `sfx`'s guard (`if(!AC||gainNow()<=0) return`) and the ambient bed's (multiply
the envelope by `store.vol`); both new layers take the first, and every voice lands on `master`, so they
inherit `applyVolume()` and `MASTER_GAIN` for free. **The panner therefore sits between the voice and
`master`, never after it.** Verified rather than argued: muted, with the whole bank firing and the
heartbeat at 3% HP, the bus reads **peak 0, rms 0**.

⚠️ **`store.mute` and `master.gain` are two different mechanisms and a test can exercise one without the
other.** `gainNow()` is what the guards read; `master.gain` is a node value only `applyVolume()` writes.
Setting `store.mute` directly leaves the bus untouched — which is why a rig should mute the way the game
does, through the button. A first attempt at the measurement above read **zero on its own control**
because of this, and three passes that meant nothing looked exactly like three passes.

⚠️ **Measure the mute *after* the analyser's own window.** At `fftSize` 2048 and 48kHz that is 42.7ms of
rolling buffer, so the frames straight after the click still contain pre-mute samples: the first run of
this test reported a 0.095 peak "leak" that was entirely the buffer.

**Headroom, worst case, measured at `master` (pre-compressor).** Storm above its gate, heartbeat at 3% HP,
a full Overdrive ride held, a bomber chain at 260ms, plus `kill` 5.6/s, `mote` 6.2/s, flips, hurt,
bosshit and milestones: **peak 0.3507, rms 0.0473, zero clipped samples.** Density moves rms (0.0275 →
0.0473 against a lighter barrage) and barely moves peak, which is the limiter's case behaving as designed.

**The standing rule is to mute before any test loop. SFX work is the exception, and this is it** — a pass
that verifies a sound cannot begin by silencing it. Anyone reading the mute rule while doing audio work
is inside the exception, not breaking the rule.

---

## The title screen

The wordmark has no colour in it. The only colour on the menu is four charges on two orbits, and between
them they state the whole game before you press anything:

- **Outer ring** — one red, one cyan, pinned exactly half a lap apart and turning the same way. Opposite
  charge, so they should annihilate. The geometry never lets them. A standoff that cannot resolve.
- **Inner ring** — one red, one cyan, turning *against* each other. Here contact is not optional. They
  hang apart, fall together, and annihilate in a flash, impact alternating right, left, right.

That is the game's one rule running on a loop, with no copy. **The wordmark must stay colourless:** hue
belongs to polarity, and a gradient on the words puts colour where it means nothing while leaving red
missing from the game's own title screen.

Nothing is drawn to canvas — it is four dot divs, 28 trail divs, two ring divs and an FX wrapper, moved
by transform. All tunables live in one `TITLE` object; `titleOrbit(t)` is the whole motion model.

**Four things that will bite if you edit it:**

1. **Every absolute child is anchored by CSS**, and the JS supplies only an *offset*. Do not reintroduce a
   measured origin. An earlier version cached the wrap width and centred on it while the orbit radius read
   a live `window.innerWidth`; on a phone the two disagreed and threw both rings 168px off-centre.
2. **`.overlay` sets `overflow-x:hidden` explicitly.** Setting only `overflow-y` computes the other axis to
   `auto`, and the rings are wider than the wordmark — a horizontal scrollbar waiting to appear.
3. **`.tfx` carries the impact position, its children carry the animation.** Put both on one element and
   the keyframe's `transform` wipes out the translate that placed it at the impact point.
4. **Depth is continuous in `sin(a)`, never a boolean.** It was `sin(a)>0` once, which snapped scale and
   opacity in a single frame each time a charge crossed a horizontal extreme — a visible flicker twice a lap.

`FLAT` is the tunable to leave alone: at its old value the outer ring hung off the top of the screen and
its lower arc cut into the body copy, reading as a strikethrough. The exponent in the inner pair's gap is
what makes the doomed pair *hang* apart and then fall in, instead of sliding together evenly. That is the
attraction read; it is not a lerp.

**There is no copy under the title, and the rules that governed it did not all die with it.** It was five
one-line beats, then one, then none — `.tag` was deleted outright once the tutorial took over the
teaching. Two of its three rules were about that paragraph. **Two are about the game, and they bind every
surface that describes it** — tutorial steps, Bestiary, both languages:

- **`steer into`, never `pull`.** The star exerts no pull on the **opposite** charge, ever. Copy saying
  the matter that kills you comes to you teaches the most expensive misconception in the game.
  ⚠️ **Read this against the Field section above, not alone.** It said *"no pull on another charge"*,
  which invites the reading that same-colour matter is not drawn in either — and it **is**: like-charge
  leans in under core gravity (`LIKE_GRAV`), opposite-charge gets none, ever. A rule compressed to a
  slogan can end up forbidding the shipped copy it was written to protect. The Codex line that made this
  concrete — *"Your own colour is drawn to you"* — was deleted with the Codex; the rule outlives it and
  now binds the Bestiary and the tutorial alone.
- **Never write a line that forbids steering into same-colour matter.** The deleted beat carried the word
  `opposite` for exactly this reason: without it, that line forbade the thing the next line required.
  Same-colour matter is harmless and steering into it is the *only* way to build rings. The tutorial's
  step 2 is where this now has to hold.

The third rule — *every beat must hold one line at `.tag`'s measure* — went with `.tag`, along with its
three CSS rules, rather than being kept for "something else that wants body text." **A rule with no user
is a rule nobody can tell is wrong.**

⚠️ **Deleting a block between the lockup and the primary button is not a layout no-op, and nothing warns
you.** `.tag` sat there with 14px above and 24px below; removing it left `Enter the field` at 0px from the
logo's box and **28px inside the outer title ring**. That ring is 860px wide, hangs well below the letters
it circles, and is **absolutely positioned — so it contributes no layout height, and no overlap is
detectable from the flow.** `.titlewrap` carries the clearance explicitly now. **Measure against `.tring`'s
bottom edge, never the logo's box.**

A fault inside `titleOrbit` is caught at the call site and latches it off, leaving a still wordmark — a
cosmetic bug must not be able to reach the frame guard and halt a game that is otherwise fine.

---

## The tutorial

Six steps — steer, gather, annihilate, flip, Overdrive, then every species at once — and it is the game's
primary teaching surface now that the menu paragraph is gone. **Every step's `done` test reads state the
game already keeps** (travel, ringed bodies, kills, flips, seconds of Overdrive), which is what makes it
impossible to satisfy a step by waiting and impossible to fail one.

**`tutSafe()` is the entire damage rule and both damage paths call it.** Steps 1–5 take none, the finale
does: teaching the flip while a Dart kills you teaches nothing, and a finale that cannot hurt you does not
communicate that any of this is dangerous. ⚠️ **Never express this as a pinned `P.iframe`** — the hurt
flash keys off that value, so it would make the star blink for the whole tutorial. Both endings route to
one card and **dying does not reach the death screen**, which counts a score, prints a receipt and offers
Reforge, none of which mean anything here.

The finale spawns its own roster because it must: the tutorial parks the wave clock at `phaseT=1e9` (the
Lab's trick), so nothing arrives unless a step asks. It cycles all eight **by name in roster order** rather
than at random — a random draw over 25s leaves one or two species out about a third of the time.

⚠️ **Step dwell time is derived from the sentence, and a constant cannot do this job.** A flat 2.5s floor
held every teaching step at *exactly* 2.5s — the floor, not the task, setting the pace — and gave a 7-word
line the same time as a 14-word one. `readS()` is **0.32 s/word in English, 0.16 s/char in Korean**, the
Korean rate swept against the English total across all eleven lines and landing at +1.9%. **This means
editing tutorial copy cannot silently outrun the pacing**, and it is why a step must never end the instant
its test passes: a player already dragging satisfies step 1 in under a second, and the instruction gets
replaced before it has been read. Completion holds the step and swaps the instruction for what it *taught*.
⚠️ **`ok` lines must stay short, because the beat is timed off them** — one as long as its own instruction
turns an acknowledgement into a second thing to read and doubles the step.

⚠️ **`tutPrev` must be nulled on advance.** The beat runs for over a second with the star still moving, so
otherwise the first travel sample of the new step spans the whole beat and credits a step that has not
started.

⚠️ **The auto-start must never fire under test, and this failure is silent.** `.oracle.js` and
`.harness/record.html` drive `startRun()` themselves; a tutorial launching at boot would drop a scripted
pilot into a mode with the wave clock parked and damage off, and every tape and every fingerprint would
measure that instead — no error, just the wrong game. **`window.__H` is the gate, and it works because of
*when* it exists**: `preload.js` is injected ahead of the inline script. `window.__oracle` does **not**
work and never did — `.oracle.js` is pasted *after* load, so nothing it defines is visible at boot. A gate
that cannot fire is worse than no gate, because it looks like cover.

**The copy is the author's.** Only the bracketed device verbs vary, and they must: steps 1, 4 and 5 were
written as *"Move the mouse"*, *"Click"* and *"Hold shift"*, all three describing a desktop — the exact
fault the deleted menu paragraph carried for months. See **Language** below for why `tutDev()` returns a
*case* rather than a phrase to slot in. **The end card does not grade you**: it carried a sentence per
ending, which made marking your work the last thing the tutorial did.

### One question per surface

Each screen owns a question, and a second screen answering the same one is the defect — it was four
identical ghost pills before the `.doors`/`.refs` grouping, and it was the achievement list sitting in
the Codex while Records was headed *"What you have done"*. **The Codex has since been deleted outright**,
which settles its row below by removing the surface rather than answering for it.

| Surface | The question it owns |
|---|---|
| **Tutorial** | how do I do this? — shown by playing, never by prose |
| **Bestiary** | what is that thing? |
| **Records** | what have I done? — the run table, the lifetime tally **and the achievements** |
| **Settings** | how does it reach my eyes and ears? |

⚠️ **RETRACTED: "a fact about absence can never be demonstrated."** This section carried that rule, both
sessions endorsed it, and the author broke it in one line. **Absence is demonstrable by CONTRAST**, and
the tutorial already supplies the contrast: step 5 has you hold Overdrive and watch the Capacitor drain,
then release — that *is* "it drains while held and can be spent part-way." Steps 2 and 3 put same-colour
and opposite-colour on screen back to back, so you watch one come to you and the other chase you — that
*is* "you have no hold over the opposite colour." Two of the four paragraphs the rule was invented to
protect were being taught by the tutorial the whole time.

⚠️ **And one of the four was false.** *"It will not touch an Anomaly. Nothing you press will."* — the
volley is set in `flip()`, and `flip()` is called from tap and from keydown. **Pressing the flip button is
one of the three erosion channels.** The defensible claim is the one the Anomaly section already makes,
*"there is no button anywhere that does it **for you**"*; the Overdrive section's version asserted
something the code contradicts. All four paragraphs are now gone.

**What survives is only this: a section here is a mixture of taught and untaught, so check the paragraph
and not the heading.** That is a judgement, it does not reduce to a test, and the attempt to make it
reduce to one is what produced a rule that protected a false sentence.

⚠️ **The failure worth keeping is the method, not the rule.** Both sessions verified the *staging* of
these edits, the *key parity*, the *overflow*, and the `dir` comment — and neither checked the truth of
the four sentences being argued for. **Scrutiny went to what was doubted and not to what was being
defended**, and a defended claim is exactly where nobody looks twice.

---

## Language

English and Korean, switchable. **Every user-facing string in the game lives in `L`**, and nothing
outside it may build one by concatenation — that is a hard rule, not a style preference, and the reason
is in the Traps below.

`store.lang` is `'en' | 'ko'`, key `orbitalcrash_lang`. Absent, the browser decides **once**:
`navigator.language` matching `^ko(-|$)`. A stored choice is never second-guessed, because a Korean
speaker who deliberately chose English on a ko-KR machine cannot tell a re-detect from a broken switch.
The guard is a regex and not `startsWith('ko')` — `kok` is Konkani.

`T(key, vars)` looks up `L[store.lang][key]`, falls back to `L.en`, then to the key itself, and
substitutes `{named}` slots. Templates are handed **every** variable a language might want — the epoch
line gets `{r}` roman *and* `{n}` arabic — and each language's template uses what it needs.

`applyLang()` walks `data-t` (textContent), `data-th` (innerHTML — the lines carrying `<kbd>`),
`data-tt` (title) and `data-ta` (aria-label), sets `documentElement.lang`, and repaints everything the
JS builds. It must repaint **live**, not at the next screen: Settings opens from the pause panel, so
there is a run behind it with an Epoch label and an Anomaly tip on screen, and `updateHUD` only runs
from `frameBody` while state is `play`/`ready`.

Two things are deliberate rather than tidy:

- **Prose blocks are one key each.** The Records empty state is a single string, not one key per
  sentence. Shredding a paragraph into numbered keys makes it unwritable in English and untranslatable in
  Korean, because neither can be read in order any more. The 649-word Codex body was what forced the
  rule; the rule outlived it.
- **떠돌이 and 표류 split a name the English shares.** Korean gives the creature and the shape two
  different words. Do not tidy them back into one.
  ⚠️ **THE SITE THIS NAMED HAS MOVED ONCE ALREADY.** It read *"`Drift` the Epoch … 'EPOCH I · DRIFT'
  runs while Drifters are in the field"* until the Epochs became celestial, at which point that exact
  pairing became impossible and the sentence was describing a screen the game no longer draws. **The
  collision did not go away with it:** `lab.drift` is still 표류/`Drift`, and the Pattern Lab legend
  prints it while 떠돌이 are on the field. Same rule, one slot over — which is the whole lesson. A note
  written around its example dies when the example does; write the rule and cite the site.
  ⚠️ **The rule is the split, not the method, and the method has already changed once.** This read
  *"transliterates the creature and translates the Epoch"* against 드리프터 until `466efcd` renamed the
  roster off its -체 endings; 떠돌이 is a native word, so that sentence described a technique the file no
  longer uses. A rule stated as its implementation goes stale the first time the implementation moves.

`bestiary.html` shares no code and carries its own table, reading `?lang=` from its own URL. The parent
appends it; an iframe cannot reliably reach the opener's `localStorage` under storage partitioning.

**Typography is scoped to `html[lang="ko"]` and English is untouched.** Two things in the stylesheet are
built for Latin. Tracking is the harmful one — `letter-spacing` up to `.28em` is the small-caps label
look, which works because Latin capitals are narrow; a Hangul syllable is already a square block, so the
same value reads as 축 전 기 rather than as styling. `text-transform:uppercase` is the harmless one and
is left alone, being a no-op on Hangul. `word-break:keep-all` is the highest-value line in the block:
Korean's default breaks between any two syllables, so wrapped prose splits words down the middle.

**No webfont, ever.** "No build step, no runtime dependencies, no network" is what makes `file://`, the
service worker and the Capacitor shell all work. Korean ships on the system stack.

---

## Traps

Things that have cost real time, in this codebase specifically.

⚠️ **Running `.oracle.js` leaves the game muted for every later page load in that profile.** The harness
clicks the mute button, `toggleMute()` calls `save()`, and `orbitalcrash_mute` persists — so the next
load builds `master` at `gainNow()`, which is 0. Nothing resets it and nothing reports it. Fingerprint a
build, then try to measure audio, and you get **silence with no error**: the bus reads 0, the controls
read 0, and it looks exactly like a graph that was never wired up. Clear the key or click the button
before any audio pass.

⚠️ **A claim can be broader than the command that produced it, and the output cannot tell you.** A Codex
sweep ran `grep -n "Codex" docs/MECHANICS.md README.md` — two named files — and the commit body reported
it as sweeping *"the glossary's"* reference, a category. `docs/GLOSSARY.md` was never in the search path
and still described the Codex as live. Nothing in the grep's output could have revealed that, because
the grep did exactly what it was asked. The same shape produced a coverage sweep that tested *"did this
commit touch `index.html`"* and reported it as *"did the game change"*.
**The failure lives in the gap between the command and the sentence, so the check is to re-read the
sentence against the command** — not to search harder.

⚠️ **Checking where a claim came from is not checking whether it is true, and it feels identical.**
Two sessions spent four exchanges defending four sentences in the Codex. Both sessions verified: that
each sentence occurred exactly once in the tree, that the commit which deleted its backup really said
what it was quoted as saying, that the key tables agreed, that the fingerprint matched. Every one of
those is a question about **provenance** — where the claim lives, who wrote it, what else rests on it.
Not one of them asked whether the sentence was **correct**. It was not: *"It will not touch an Anomaly.
Nothing you press will"* is contradicted by `flip()`, which sets `vdmg=1` on every ringed Dot when a
boss is live, from a keypress.

The tell is that scrutiny had gone to what was **doubted** and not to what was being **defended** —
and a defended claim is exactly where nobody looks twice, because the other party is agreeing. Before
reporting a verification, name which kind it was. "I confirmed the sentence appears once" and "I
confirmed the sentence is true" are different sentences, and only one of them was ever said.

⚠️ **A `ChannelSplitter` reports silence on channel 1 for every mono source, and it is not a bug.**
`ChannelSplitterNode` is spec-locked to `channelInterpretation: "discrete"`, so it does **not** up-mix —
a mono voice tapped through one leaves the right channel empty, while the same voice sent straight to
`destination` up-mixes and is heard in both ears. The first pan rig read `R=0` for every un-panned cue
and looked exactly like a stereo routing fault; acting on it would have "fixed" a channel that was never
broken. **The tap manufactured the reading it reported.** Same family as the two below: the tool ran
correctly and the number was fiction.

⚠️ **A dead dev server still serves pages, and `navigate` still reports success.** When the server on
8777 died, the browser rendered the page from cache: `preview_start` and `navigate` both returned OK, so
a verification run reported **every removed string as still present with the word count unchanged** —
indistinguishable from an edit that never applied. Nothing in-page can catch this, because the page is
genuine, just old. **A cache-buster query does not help when the origin is gone.** `lsof -iTCP:8777
-sTCP:LISTEN` returning empty, or `curl` returning a zero-length body, is what settles it. Treat
navigation success as evidence of a *response*, never of a *server*.

⚠️ **`git add index.html` takes every hunk in the file, including the other session's.** Two sessions
share this checkout and `index.html` is one 7,000-line file, so an in-progress edit belonging to someone
else gets swept into your commit whenever they happen to be mid-pass. It has happened three times. Once
it shipped a half-done CSS rename: `.acv` defined in the stylesheet while the builder still emitted
`class="cxa"`, so the achievement rows rendered with no rule behind them for ~50 minutes.

**Know your changed-line count before you stage, and check it against `git diff --numstat`.** This is a
comparison, not a review, which is the whole point — "inspect every hunk" is what nobody does under
time pressure, and a filtered copy costs real effort even when the file is quiet.

⚠️ **Paste the number, never recall it.** Both sessions have now published a numstat in a commit body
that the terminal never printed — `34 0` against a real `32 0`, `23 0` against `22 0`, `22 insertions,
6 deletions` against `13 2` — **twice each, and twice inside commits whose own subject was about not
asserting what you have not run.** The mechanism is mundane and worth naming: a sentence that wants a
figure will accept a remembered one, and nothing in the sentence looks wrong afterwards. So run the
check, copy its output into the body, and treat any number you typed from memory as unverified — which,
in a section built entirely out of remembered numbers being wrong, it is.
The strongest form is a **parity check**: a pass of one-for-one string replacements *cannot* produce
unequal insertions and deletions, so any asymmetry is somebody else's work. The commit that caused the
rename breakage read `19 15` where the author's twelve one-line swaps could only be `12 12`, and that
number had already been printed by the pre-commit `--stat`.

⚠️ It only catches this in **one direction.** Equal counts do not prove a clean diff — a foreign hunk
that happens to be balanced hides inside yours. It catches the case that has actually bitten us, and
that is all it claims.

⚠️ **`git commit <path>` commits the WORKTREE version of that path, not the staged one — so in a shared
checkout it sweeps, it does not isolate.** This was proposed in good faith as the safe one-command way to
land your own staged work while a peer had uncommitted edits in the same file, and it is the opposite.
Both sessions then described it wrongly from memory, in opposite directions, until it was actually run:

```
staged:   +PEER_STAGED          unstaged: +MY_UNSTAGED
git commit -m msg f.txt
committed:  base PEER_STAGED MY_UNSTAGED     ← BOTH. Nothing dropped, everything taken.
```

So it does not "ship only what is staged" (the claim that made it sound safe) and it does not "drop the
staged half" (the correction). It commits what is *on disk* for that path, which in a contended file is
by definition both people's work. ⚠️ **The path form's danger is exactly that it reads as narrowing** —
naming one file feels like restraint, and it silently widens from the index to the worktree.
**Ordinary `git add` then `git commit` is the safer pair**, because `add` snapshots at add-time and
`commit` ships the index, so a peer's later write is not eligible. That is what actually saved
`8429887`. For real isolation the filtered copy is still the only answer.
  *Nobody had run it.* Two sessions that had spent the night on measure-don't-assert reasoned about a git
flag from memory and both got it wrong — which is the same failure as every other entry here, applied to
a tool rather than to the game.

**When you must commit out of a tree someone else is mid-edit in**, build the staged content instead of
staging the file: back the tree up, write HEAD-plus-your-own-change to disk, `git add` that, restore the
backup, and `cmp` against it. It worked the first time it was used under pressure and saved ~130 lines
of an unfinished Codex removal. Two limits, both real:

- ⚠️ **The strip script must fail closed.** Exit non-zero unless it finds *exactly* the occurrences it
  expects. A replacement that silently matches nothing stages HEAD verbatim — a commit that looks
  completely normal and contains none of your work.
- ⚠️ **It is not a lock.** The tree is briefly the filtered copy, so a concurrent write in that window is
  lost to the restore. `cmp` after restoring is the only thing that tells you nothing was; the recipe
  narrows the race and cannot close it.

⚠️ **A check can make the provenance-for-truth substitution too, and one written the day after that trap
was recorded did.** A PATCHNOTE coverage sweep asked *"did this commit touch `index.html`"* and reported
four commits as missing entries. All four were comment-only: the file was touched, the game was not. The
convention is about substance, and the sweep tested provenance — the exact swap two paragraphs up, by
someone who had just written it down. **Knowing a failure by name is no defence against it.**

The detector has to compare **code**, so strip comments from both blobs rather than filtering diff lines:

```bash
codeonly(){ git show "$1:index.html" | sed -E 's#[[:space:]]*//.*$##' | sed -E 's/[[:space:]]+$//' | grep -v '^$'; }
diff -q <(codeonly "$h~1") <(codeonly "$h") >/dev/null && echo COMMENT-ONLY || echo SUBSTANTIVE
```

⚠️ **The obvious version of this is wrong and was proposed first**: filtering the diff for lines that are
not whole-line comments still reports a code line that changed *only by losing its trailing comment* —
which is exactly what `ae754fd` is, and `ae754fd` was one of the four the check was meant to excuse.
Dropping the emptied lines matters too, or every stripped comment leaves a blank behind and the files
differ by line count.

⚠️ **And agreeing with you on seven known commits is not evidence it works.** The dangerous direction is
a false COMMENT-ONLY, because that is the one that silently drops an entry — and every commit whose
answer you already know tests the safe direction. **Feed it something known dirty.** Two synthetic edits
settled it: a constant (`RING_GRIND_DMG` 1 → 2) and a player-facing string (`'rc.achv'` → `'Feats'`),
both correctly reported SUBSTANTIVE. That is this file's own rule about sweeps turned on the sweep — *if
it tells you a thing is clean, prove it can tell you when it is not* — and it is the only evidence that
separates a working detector from one that happens to share your intuition.

The `//`-in-a-string hazard is nil **in this file**: all four `://` occurrences (line 30, 6937, 6938,
7375) sit inside comments, none in code. The technique is not general, and that count is a property of
this file rather than of the method.

⚠️ **A user-facing string built by `+` is an English-only string, and it fails silently.** English is SVO
with no case marking, so `'Lost to '+name+' · Epoch '+n` reads fine; Korean puts the epoch first, gives
the killer 에게/에, and infixes the numeral (제3기). A frame with a hole in it can only ever be one
language's frame. The same fault hid in the tutorial, where `tutVerb()` slotted "Click"/"Tap" into a
shared sentence — in Korean the verb inflects into the clause that follows it (클릭해서/탭해서) and there
is no seam to put a noun in. `tutDev()` returns the *case* now, and the three device sentences are
written per language rather than assembled. **The colour word is the clearest instance:** English
appends it ("Brute (cyan)"), Korean puts it in front (청록색 덩치), from identical data.

⚠️ **`readS()` measures a different unit per language, and word-counting Korean would silently undo the
fix it exists for.** It sets every tutorial step's dwell time. A Korean 어절 carries roughly an English
clause, so the same instruction word-counts about a third shorter — which is exactly the "steps pass too
fast" complaint that produced the function. Korean is measured in syllables. **Derive the constant, do
not guess it:** sweep it against the English total across every tutorial line and match within ~15%.

⚠️ **A damage source is a key pair, not a name, and this is a save-format rule.** `die()` writes
`lastDmg.src` straight into `store.runs`. While it carried a rendered name, every record was frozen in
the language it was played in — switch and the Records table stays half-English for ever, with nothing
to migrate from. `{t,c}` for a Dot, `{m}` for a missile, rendered by `srcName()` at display time. A bare
string is a row from before this changed and renders as-is; do not "fix" that branch away.

⚠️ **`ctx.font` carries its own font stack and cannot inherit.** Three literals said
`-apple-system,system-ui,sans-serif`, which resolves no Hangul on Windows or Android — canvas text would
have picked a different fallback from every other string on screen. `CANVAS_FONT` is the one constant.

⚠️ **`const T = store.totals` shadows the translator.** It was in `openRecords` and in `die()`. Block
scope saves the second one by a hair, because the death receipt calls `T()` fourteen lines below it —
a name that is only safe because of where its braces happen to be.

⚠️ **The English in the markup is a duplicate of `L.en` and they must not drift.** The duplication is
deliberate: it keeps the HTML readable as a page and it is what shows if the script dies before
`applyLang()`. One console line proves they agree — with lang pinned to `en`, every `[data-t]` node's
`textContent` must equal `L.en[key]`.

⚠️ **The Bestiary frame is cached on purpose and will serve the first language it saw.** Reloading it
restarts nineteen canvas animations, so `openBestiary` keeps it — but it used to test
`if(!f.getAttribute('src'))`, which meant the language never changed after the first open. It compares
the src now. Its `bare` layout flag had the twin fault: it tested `spec.tag` after every tag moved into
the table, which is `undefined` on every card and stacks the Anomaly like a Pattern. Wrong layout, no
error.

⚠️ **The HUD's corner buttons are dead under any overlay, and they look fine.** `#hud` is z-index 5 and
`.overlay` is 10, so ♪ / ✺ / ❚❚ *render* through the menu while a click lands on the overlay instead.
That corner reads as the game's "set it from anywhere" cluster and is not one — anything the menu needs
goes **inside** `#menu`. Hit-test with `elementFromPoint` against the button; a screenshot cannot show it.

⚠️ **Three ways to measure text and get a number that means nothing.** `scrollWidth` **clamps to
`clientWidth` on a centred button**, so it reports zero overflow however far the text runs past the
edge — `Range.getClientRects()` is the tool that sees the actual laid-out run. A hidden element measures
0 and zeros compare equal, so **assert visibility before every comparison**. And the Browser pane's
viewport can be **0×0**, which makes `94vw` resolve to nothing and every paragraph "overflow" its
collapsed container: one pass here reported 67.5px of overflow that did not exist. Assert
`innerWidth !== 0` before believing anything.

⚠️ **The first-visit tutorial must never auto-start under a harness, and the failure would be silent.**
`.oracle.js` and `.harness/record.html` drive `startRun()` themselves; a tutorial launching at boot drops
a scripted pilot into a mode with the wave clock parked at `phaseT=1e9` and damage off, so every
fingerprint and every tape measures *that* instead. Nothing throws — it simply measures the wrong game.
`window.__H` is the gate that works, and it works because of **when** it exists: `preload.js` is injected
ahead of the inline script, so the harness has announced itself before the boot line runs. A gate on
anything `.oracle.js` defines **cannot** work — it is pasted after load — which is why the oracle sets
`orbitalcrash_tut` itself instead. `?tut=0` is the manual escape.

**`store.mute` is API, not an internal flag.** Every rig in this repo silences the game with
`store:{mute:true}` or by writing `orbitalcrash_mute`. When the level slider arrived, folding mute into
`vol === 0` was the tempting simplification and would have broken all of them without an error anywhere.
`gainNow()` is where the two combine, and it is the only place that computes output level.

**A record and a best are one condition with two consumers.** Boss Rush pays `200*act` per purge from an
endless supply and the Lab spawns on demand, so both are barred from `store.best` *and* `store.runs` by
the same test. Add a fourth mode and they are wrong together or right together — never half.

**A hidden element measures 0, and 0 compares equal.** Checking whether the four `.refs` links wrapped
returned a confident "1 row, 4 per row" — every rect was zero, because the menu was behind the death
overlay at the time. There is no error attached to this: it is a plain false PASS. Assert the container
is visible before believing any geometry read off it.

**A rig state the game cannot reach produces numbers that look exactly like findings.** Two of these
landed on the same day from opposite directions. The value now in `CHARGE_DMG` was rejected for one-shotting an 11 HP
Pulsar — a fight requiring `act=1`, which the variant gate has forbidden since the first commit; at the
lowest Pulsar the game can spawn it never one-shot anything. And four grind rigs read a clean zero,
which looked like *grinding does nothing* and was really the rig: rings capture **like** charge while
chipping needs a colour **differing** from the boss, so usable ammunition requires polarity opposite the
boss — and pointer coordinates are client space while the boss was pinned in world space, putting the
pilot 481px from a target believed to be at 110px.

The shared defect is that **neither rig was ever shown capable of producing the other answer.** A zero
you cannot contrast with a non-zero is not a measurement; a constraint from a state the game cannot
produce is not a constraint. Both then get filed as settled, and the plausible one is the more dangerous
— a suspicious zero at least invites a second look.

**A third instance, and the cheapest to have caught: the instrument was the arena.** Missile reach was
reported as **599px at both Epoch I and Epoch III**, and that agreement was written up as confirmation
that the old reach identity held. It confirmed nothing. 599 was the **screen edge** — the two candidate
reaches were 1361px compensated and 1021px uncompensated, and *both* exceed what the arena can show, so
the probe returns 599 either way. The tell is available without running anything: **write down what the
number would be under the hypothesis you are trying to reject, and if it is the same number, the probe is
measuring your instrument.** This one had a second layer, because the finding was then reused — the
identity it "confirmed" was quoted three sections away as a reason no re-measurement would ever be needed.

**And the sibling failure, from the same week: a metric that lumps a mechanic in with its own failure
mode describes neither.** The Pulsar was reported as fizzling 15–18% of its shots on screen, flagged to
the author as possibly needing investigation. Counted by kind, **16 of its 20 expiries were mines
detonating exactly as designed** — the mine's `life` is a fuse — and genuine fizzle was 2 of 84 rings. The
aggregate was a real count of a category that does not mean anything. Before quoting a rate, check that
every member of the numerator is the thing the rate is named after.

**A harness that can force a state is a harness that can invent one**, and that is exactly how the 11 HP
figure was born: a verification run called `spawnBoss` for a Pulsar at Epoch I, printed a pool the
roster cannot produce, and the number was copied into a sentence about what a player meets. The seam
answers every question you ask it, including the ones with no answer. **A formula is defined at every
Epoch; the roster is not** — so price a variant against the first Epoch its gate lets it appear in.

**A silent parse failure returns a plausible number, not an error** — and this one happened to a script
written *for this section*, an hour after it was drafted. A one-liner walking the pool's history matched
`let hp=13+act*5` fine and returned **5** for `let hp=Math.round((13+act*5)*1.5)`, because the regex had
no branch for the parenthesised form and the capture fell through to a default. Five is a perfectly
believable pool.

**It is categorically worse than the other three here, and the difference is worth keeping.** A forced
state, an unfed rig and an appended sentence all produce a wrong number from a process that *ran
correctly on the wrong input* — there is a real measurement underneath, of something. A fallthrough
produces a number from a process that **silently did not run at all.** Nothing was measured, and the
output is indistinguishable from a measurement.

So *refuse to report when the precondition fails* needs its precondition named at this layer: **for an
extractor, the precondition is that the pattern matched.** A default must be an error, never a value.
Ending a capture with `|| 0` converts a detectable failure into an undetectable one, and it is such a
natural thing to write that it will not look like a decision.

**How it was caught is the other half.** Not by checking the value — by checking the *shape*. Four
neighbouring rows were right and the curve between them looked wrong. A single extracted value has no
shape to be wrong, so **extract a series rather than a point wherever there is a choice**, and read the
series before trusting any row of it.

**Rank the pins: an identity beats two independent restatements beats one figure.** An identity makes a
conversion unnecessary and retires the re-measurement forever; restatements only catch a conversion that
has already gone wrong. And when a model and a provenance disagree, **provenance wins** — it is the only
one of these that keeps working after the model underneath it turns out to be false.

⚠️ **The example this rule was written on has since been deliberately deleted, and that is the more
useful half.** The identity was `reach = (sp × ps) × (life / ps) = sp × life`, `ps` cancelling exactly —
airtight algebra, quoted here and in `fireMissile` as proof that no change to `pace.spd` could ever
require reach to be re-measured. `085a7f1` removed the division on purpose, so the identity is simply
gone, and nothing about it being an identity slowed that down for a second. **An identity pins a
relationship against drift; it does not pin the relationship as the one you want.** Worse, this one was
actively concealing a defect: holding reach constant meant the seeker's table `life` could be too small
for a slowed curve and never show it, right up until the compensation came off and the Sentinel started
fizzling 44.4% of its shots inside the arena. **A pin that cannot move is also a pin that cannot report.**

So the ranking stands for *what it was about* — trusting a derivation over a remembered figure — and
loses its claim to permanence. Nothing above provenance survives a change of model, because a model is
exactly what a design is free to change.

**Read the modality the author actually used.** *"it doesnt have to expire on screen"* is a permission
about the current state. It went into `index.html` as **"⚠️ A MISSILE MUST NEVER EXPIRE WHERE YOU CAN SEE
IT"**, in capitals, at the head of the table that constrains every projectile anyone adds later —
inventing a constraint nobody agreed to. Author: *"it is not a 'MUST', but, yeah, whatsoever. not
currently."* This is easy to do because the hard version reads as the more useful one: a rule feels like
better documentation than a preference. **The tell is mechanical — check whether the code under the rule
already violates it.** Two paragraphs below that "MUST NEVER", the same block explained that mines
deliberately expire on screen because that is how they detonate, a mechanic documented minutes earlier by
the same hand. **A rule stated hard enough that the code beneath it is an exception is not a rule.** When
you write an invariant, go looking for the nearest counter-example first; finding one in the same file
means you have written a preference in a rule's clothing. Fixed in `79e5783`.

**An edited comment is a new comment, and has to be read as one.** The grind block held a threshold
model and a no-threshold model three sentences apart for weeks, because the second was *appended* to a
block whose existing sentences already assumed the first, and nobody re-read the whole thing as a single
claim. It is the stale-figure failure one level up — the parts were each defensible and the block was
incoherent — and no checker in this repo looks at whether adjacent sentences agree. After appending to a
comment, read it from the top as though someone else wrote it.

**The defence is a precondition asserted inside the harness, which refuses to report when it fails**:
usable ring Dots `> 0`, actual distance within 12px of intended. That is what finally produced a
non-zero, and it is what resolved the volley probe that had returned 0 twice — single-Dot ring, six
trials of six, every drop identical. For anything Anomaly-shaped, name the Epoch and check it against
the variant gate before the number becomes a rule.

**`node --check` does not prove this file boots.** It cannot see a `ReferenceError`. Three separate
load-time failures have passed it — a debug seam exporting deleted functions, a `flip()` referencing a
removed flag, and a const used above its declaration (temporal dead zone). **Load the page.**

**The temporal dead zone is a live hazard here**, because boot-time code runs before most declarations.
`initStars` once used `TAU`, declared below the boot `resize()` call, and threw at load.

**A HUD element that carries no class inherits no positioning.** `#combo` had `right`/`top` set and no
`position`, so it is `static` and both had *always* been silently ignored — the element had never once
been where the CSS said. It went unnoticed for as long as a neighbour happened to sit under it. Nothing
errors, nothing logs; the rule is that a positioned offset without a `position` is dead CSS, and the
sibling `.stat` class is where the other meters get theirs.

**The browser can measure a build that is not on disk.** Assert a new-code marker — a value only the new
build can produce — before trusting any number from a live probe.

**A correct measurement of a broken thing reads as a specification unless you say which it is.** The
sharpest example this file has: *"the angular rate rises only 1.17× because the radius nearly doubled"*
was an accurate measurement, written as a design note, of a ring whose spin was being eaten by a clamp.
Anyone reading it would have concluded the ring was *meant* to feel that way and left the fault alone —
the sentence actively defended the bug. **Label every measurement write-up as a diagnosis or a
specification**, because they are written in identical language and only the author knows which one it
was. If you cannot tell which you meant, it is a diagnosis.

**A constant sitting exactly on a clamp has no authority, and changing it reads as a no-op rather than as
a mistake.** Under Overdrive a ringed Drifter sat on its speed ceiling *exactly* — 12.03 px/frame against
a cap of 12.03 — so raising the spin 1.4× moved the measured result from 1.59 revolutions to 1.61. The
number looked wrong, the tuning looked ineffective, and the actual fault was a ceiling last tuned for a
different case. **Print the clamp next to the value.** A quantity that never moves when you change its
own constant is not a weak lever; it is a lever connected to nothing, and the two are indistinguishable
from the output alone.

**The harness runs with `document.hidden === true`**, so `requestAnimationFrame` never fires and anything
driven only from the frame loop reads as absent. `titleOrbit` and `render()` both need driving by hand
through the debug seam.

**`innerWidth`/`innerHeight` are 0** in the harness context. Define them and dispatch a resize.

**Mute before any test loop** — a headless loop fires the whole sound bank at once.

**The pilot dying inside a warm-up silently voids the measurement.** `onKill` returns early on
`state==='dead'`, so anything downstream of a kill simply never happens and the result reads as a clean
zero. Pin HP when the thing under test is downstream of a kill.

**`P` is clamped to the arena.** Pinning the star far outside to isolate it puts it in a corner, where a
wall spanning every row still walks into it.

**`doSpawns` runs inside `tick()`**, so culling ambient Dots once per frame does not isolate anything —
a Dot still spawns and collides mid-frame, and the end-of-frame dead sweep then removes it, so checking
after the tick reads "0 ambient present" and looks like exoneration. Suppress at source instead.

**Order the control case first** when the thing you are measuring ticks in `frameBody` — a synchronous
probe script never runs `frameBody`, so state left over from the test case survives into the control.

**A seeded distance is not the tested distance.** The star chases the pointer and is yanked up to 18.5% of
the way toward a stale pointer position before contact resolves. Bracket on the separation that actually
existed at end of frame.

**One trial of a stochastic fight is an anecdote.** Ring size in a live fight swings by an order of
magnitude between runs. Three trials is still an anecdote; eight is a signal.

**A residual is a claim about a cause**, and needs the same standard of proof as the headline number.
Clearing one contamination took four attempts, each of which looked like a clean isolation at the time.

**Scope the input to what players actually do.** A retention test at a third of real pointer speed
reported "no problem" about a problem that only appears on direction reversal.

**Adding a `rand()` call at run start shifts the whole RNG stream**, so every seeded run re-rolls and old
fingerprints stop being comparable. That is a fresh baseline, not a regression.

**The grep that audits these docs against the code fails in both directions.** Every doc↔code check in
this repo is grep-shaped, and both failure modes have shipped a wrong conclusion.
*False pass:* matching a doc's identifiers against the raw file lets a **deleted** name vouch for
itself out of its own removal comment — strip `//`, `/* */` and `<!-- -->` before matching, or the
checker reports green on names that no longer exist.
*False absence:* a phrase search over **player-facing copy** under-reports, because markup splits the
phrase. `The button appears the moment` returns nothing on a file that contains it — the copy reads
`The <b class="gold">button</b> appears the moment you can`. Search the distinctive tail of a sentence,
or strip tags first. A clean grep over prose proves much less than the same grep over identifiers.

*Reading the output.* A backtick promises the reader that grep will find it, so **naming a symbol that
no longer exists is legitimate and naming something that never was one is not.** A comment recording
that `ruptureBlast` was deleted is doing its job — the name is the only handle the history has. But
"settleR" and "v0" both *read* as variables and neither ever was one: the first was an equilibrium the
physics arrives at, the second is the value a function returns, and a reader who greps for either
learns nothing and starts doubting the rest. **Both are in plain quotes in this very sentence on
purpose** — a name that never was a symbol stays out of backticks even when it is the thing being
discussed, because the sweep cannot tell the two uses apart and a rule its own statement violates will
not survive. Three separate drafts across two sessions made exactly that mistake while writing exactly
this down. Triage the unresolved list by that question rather than by
its length. What the sweep returns today is ten deleted symbols the file keeps on purpose, two DOM
properties and a commit hash — every one deliberate, which is the point: the distinction turns a count
that always looks alarming into a list that clears in one pass. Run it mechanically (strip comments,
collect backticked tokens that appear *only* in comment text, test each against the stripped code)
rather than by eye, because the tokens worth catching are the ones that look most like names.

**Scope the sweep to the live spec.** Run over `PATCHNOTE.md` it reports ten orphans — "POWMAP",
"fireNova", "bankMote" and the rest — and every one is correct and must stay: a dated entry recording
that something was removed *has* to name it, and those names are gone from the source in every form,
comments included. A checker pointed at history will always look like it found a pile of defects, and
acting on that reading deletes the record. This file and `GLOSSARY.md` describe what is true now; that
one describes what happened.

*Which is also why those three sit in plain quotes just now.* A backtick in **this** file promises the
reader that grepping `index.html` will find the thing. A backtick in `PATCHNOTE.md` promises only that
the thing was once called that. So the same name is correctly backticked there and correctly bare here,
where it is being quoted rather than claimed — otherwise this very paragraph would add three permanent
orphans to the residue it is telling you how to read.

⚠️ **A defective sweep under-reports, so it looks exactly like a clean one.** Two runs over the same
tree returned 13 and 12, and the gap was not a judgement call about what counts as deliberate — one
instrument was broken. It stripped `//` lines only, so every `/* */` block counted as **code**, and a
token named solely inside one was scored as used. `mult` lives in exactly that blind spot: two
mentions, both `#mult` in the stylesheet header, both cleared as real usage.

**The direction is the whole lesson.** 12 read as a *tidier* file than 13, and nobody re-checks the
result that says things are fine. Had the same bug swallowed a genuine orphan instead of a benign one,
the output would have looked identical — better, even — and the sweep would have certified the exact
condition it exists to catch. So: **test a sweep on something you know is dirty before believing it
when it says clean.** A written instruction is only a control for someone who reads it, and this sweep
was built ad hoc by a session that had not found this entry — the ordinary way a documented method goes
unused. So check whether the repo already documents a check before writing one; the paragraph above
would have supplied all three comment forms for free. The known-dirty input is the control that depends
on none of that.

⚠️ *That last point first read "a sweep written **after reading it** still shipped with one" — a claim
about another session's reading history, asserted as fact by someone with no way to check it, inside
the entry that says verify rather than accept.* It was false; the grep that session had run over this
file could not have matched this section. **A sound conclusion can be handed an argument it never
earned, and that is harder to catch than a stale one** — the wrong premise arrives feeling like the
natural moral of the story, and nobody audits a premise about somebody else's context. Note which half
survived: the advice stands on the bug alone and never needed the premise at all. When a story yields a
lesson, check whether the lesson actually rests on the story or merely arrived with it.

*Keep the two classes straight, because the audit's value is the split.* `mult` was a real symbol —
`min(15, 1+motesBank*0.1)`, deleted with the score multiplier — so it belongs with `cwave` and
`stepCollapseWave`. "settleR" and "v0" were never symbols at any point. If the sweep flagged deleted
names too, the residue would be noise and nobody would run it twice.

**A smoothing coefficient applied per *event* silently encodes the sample rate it was tuned at.** Change
the transport and the control changes feel with no code touched, no constant edited and nothing to see in
review — the line is identical before and after. Tilt smoothing was a fixed fraction applied once per
`deviceorientation` event, tuned against the web feed at 60Hz. The CoreMotion bridge then delivered at
30Hz, and the same coefficient took **233ms to reach 63% where it had taken 117ms** — the controls got
twice as slow because the *feed* halved. `bf48f87` fixed it.

**The boundary is whose clock the tick belongs to, and that is narrower than "per-tick is bad."** Most of
this game is per-tick and none of it is at risk: `TILT.speed` is units per *frame*, the keyboard nudge is
a speed per frame, the position chase takes a fraction of the gap per frame. All of them tick on
`const dt=1/60` — the fixed step the engine owns, which has never moved and which everything is tuned
against. **A per-tick constant is safe when the tick is the fixed step you control, and a hazard the
moment the tick arrives from outside it.** The smoothing was the one that ticked on the *sensor's*
delivery rate, which the game neither owns nor is told about, and swapping the transport moved it.

Express anything on a foreign clock as a time constant and integrate against the real gap —
`k = 1 - exp(-gap/tau)`. Derived rather than taken on trust: the same 200ms of held tilt lands on 0.9426
at 20, 30, 40, 60 **and** 120Hz, spread **0.000000**, where the old form gave 0.5954 against 0.8363 across
a single doubling.

**Stated that way it says where else to look, so look — the class is closed here, not merely fixed.**
Across the whole file exactly three accumulations sit inside event handlers: the two tilt-smoothing lines,
now time-based, and one local sum over a list, which carries nothing between events. Every other input
handler **assigns** rather than accumulates — `setPointer` stores a position, the tap test reads the clock
directly, key handlers set flags. `onTilt` was the only accumulator on a foreign clock in the game.

This is the cousin of the unit-drift trap below. There a figure stayed correct while its **denominator**
moved; here one stays correct while its **clock** moves — and in both the number under review never
changed, so every check that looks at the number passes.

**Every row of a comparison must be on one basis, and a row that is not looks exactly like a row that
is.** This produced two wrong conclusions in one section of this file inside an hour, from two people, in
opposite directions — and neither was a wrong number. Both numbers were correct measurements of something.

- A culled-by-`life` rate of **13.3%** was quoted as proof that reach arithmetic under-predicts. It had
  **mines counted in it**, and a mine's `life` is a fuse the model exempts by construction. Right number,
  wrong population.
- A Sentinel reach of **1030** was quoted in a table headed *Epoch III*. It is the **Epoch I** figure —
  0.754 of 1366, which is the pace multiplier. Right number, wrong epoch.
- The table written to correct *that* quoted the Pulsar's mine-inclusive **17.9%** in its measured column
  while scrupulously stripping mines from its reach column. Right number, wrong population again — and
  the Pulsar is the only variant carrying a fuse, so again the only row of its kind.

- A fifth, and the sharpest: **"the Harrier was sixth-fastest" was challenged as fifth, by me, using
  `seek × CRUISE_K` on all eight species.** Seven of them share the 0.86 bleed, so that product is their
  cruise. The **armed Charger does not** — it `continue`s into its own loop at accel 0.17 and bleed 0.9,
  giving `K = 9` and a cruise of exactly **1.530**, which is the figure I was about to "correct" to 0.860.
  With it restored the Charger is second, the Harrier is sixth, and the original was right all along. Same
  for the turn ratio: `1.5653 × cruise` holds for the seven and the Charger sits at 2.4341.

**Note what that one cost and where it was caught.** The challenge was already written into two documents
and a heading before a disagreeing cell — a Charger reading 1.530 where my method said 0.860 — forced the
question. **The disagreement was the finding, exactly as this entry prescribes**, and following it was the
only thing between a correct figure and a confident wrong one. It never shipped, which is the entry
working rather than luck.

⚠️ **The exposed moment is the correction, not the checking — and this is the more useful half of the
whole entry.** Every one of the five above was written *inside a fix*, after the diagnosis felt settled:
each was somebody's correction of somebody's number, and four of the five were corrections of a
correction. The sixth belongs here as the twin of the fifth rather than as another basis error, because
its shape is different and its timing is identical — a **sound measurement generalised past what it
measured**. Turn *time* really is friction-bound and shared, all seven reversing in the same 5 frames
whatever their `seek`; "turning" was then written for "turn time", and turn *radius* scales with `seek`
like everything else in a linear system. Right measurement, wrong scope. It shipped, in a comment written
specifically to flag a stale claim, replacing a line that turned out to be nearer right than its
replacement.

**So the prior that blinds you is not "their table has an error." It is "I have just found the error."**
That state supplies confidence, momentum, and the feeling that the replacement inherits the rigour of the
thing it replaces — which it does not. **A correction is a new claim and gets the same standard as the one
it retires**, including a re-derivation you would have demanded of anyone else. If you have just been
right about something, you are in the worst position to check what you write next.

### The operative form: a rank is not inherited from the measurement

Every number in the exchange above was **correct**. Both failures were *ordinal* claims — "sixth-fastest",
"tightest bar the Planet", "second-widest behind the Dart" — computed over a table that was never
re-sorted. **A rank is a claim about every other row**, so it carries a dependency the measurement it came
from does not, and a right number will happily produce a wrong rank.

> **A rank, a superlative or an ordinal is never inherited from the measurement it was computed over.**
> It is a separate claim over a table: name the basis, list every state, re-sort, read the rank off —
> **and the row you are ranking must appear in the list you printed.** If a reader cannot find it there,
> the ladder is not a check. It is a decoration.

**That last clause exists because the rule failed to protect its own output.** The ladder first published
to stop rank errors *did not contain the value being ranked* — nine rows, and the sentence beneath ranked
a tenth against them. Right ordinal, wrong denominator, and a reader counting the list could not locate
the row the claim was about, which was the one thing the ladder was added to make possible. Everything
upstream of that clause is a judgement about completeness, and completeness is precisely what each of
these failures got wrong; **the clause is the only part a reader who was not there can mechanically
verify.**

This is where the basis rule and the timing rule turn out to be one thing seen from two sides — **a rank
is exactly where a basis mismatch stops being a formula and becomes a number.** The Charger proves it by
holding *both ends of the same ladder*: spent it is 2nd-tightest on the shared bleed, armed it is
2nd-widest on its own, and each regime produced a plausible wrong answer in the opposite direction from
correct data. So the ladder lives in the code as a list rather than in anyone's head:

> `Planet 1.25 · Charger-spent 1.35 · Brute 1.44 · Harrier@0.16 1.54 · Bomber 1.63 · Neutral 1.92 ·
> Drifter 2.12 · Harrier@0.34 3.27 · Charger-armed 3.72 · Dart 4.04`

⚠️ *"Second-widest behind the Dart" was checked by a second person and passed*, because that check
re-derived the numbers and re-sorted a table with the armed Charger **missing** — the same omission the
fifth instance was about, made while verifying the correction to it. Re-deriving is not re-sorting, and
a ladder is only a check if it is complete.

⚠️ *And the sentence "the doc list matches the code comment exactly" was written after comparing **one
line**.* The two lists differed by a row at the time. The ladder itself was sound, having been derived
independently — but the **verification claim** was false, and a verification claim is a claim. It is the
cheapest of all of these to avoid and the easiest to write, because at the moment you make it you are
describing work you intended to do.

**The third was found by running the trap against the table the trap was written for**, which is the part
worth keeping. "Recompute a neighbouring row from source" caught the second. "Is this row the same *kind*
of row as the ones beside it" caught the third, in a table its own author had just cleaned — of the other
column. A cleaning pass fixes the column you are looking at and certifies the one you are not.

**The tell is that both were the only row of their kind.** One rate among rates, one reach among reaches;
nothing in either looked odd, because the units matched and only the *basis* differed. So the check is not
"is this figure right" but **"is this figure the same kind of thing as the ones beside it"** — recompute
one neighbouring row yourself from source and see whether your method reproduces it. If it does not, the
disagreement is the finding. Both of these were caught exactly that way and by no other means.

**`spawnRing` collapses inward by default, so anything you add called a "shockwave" will implode.**
`drawParticles` sizes a ring as `p.R*a` with `a` running 1 → 0 over its life, which starts at full
radius and closes to a point. That is right for a **telegraph** — a Pulsar winding up, an Overdrive
ignition — where the statement is at full radius and the convergence says *this is where it lands*. It
is exactly backwards for a **blast**, which the Bomber detonation was doing unnoticed until someone
looked. Pass `out` for the outward curve. Nothing about the call site announces which one you got, and
both look plausible in motion at 0.5s, so the failure survives review — the Bomber's white inner ring is
still deliberately inward as a counterpoint, which is also why "they all implode" was never obvious.

**A species that enters the spawn table late reads as absent, not as rare.** Neutrals are gated behind
`t≥125` and the immortal-pilot harness dies around 57s, so a species-mix census confidently returned
**0%** — a clean number, no error, describing a table the run never reached. The fix was an immortal
pilot out to t=400. Note which harnesses this is safe on: the spawn table keys off `elapsed` and `act`,
so forcing a long run is legitimate for a **mix census** and illegitimate for anything priced on a
streak, where an immortal pilot is measuring a state the game cannot produce.

**A comment that quotes a derived number needs deriving, not re-reading.** Three comments survived the
Anomaly buff still pricing a bait at half a bar, still calling an Epoch I Pulsar 11 HP, and still
warning that the pool had *dropped below* a line it was now at double — and one of them contradicted
another comment in the same file about the same number. Eyes do not catch this; the numbers look
plausible because they once were. **Parse the constants out of the served document, recompute the
table, and diff it against what the comments claim.** It is cheap enough to be the default any time a
comment states a figure it does not itself define.

*The comments that survived tell you the format that works.* Every one of them named the old value **as
old** — "it bought 6.0s", "a bait *was* worth", "the global income rate, not an inert 1", "PRESS, not
toggle". A comment carrying its own before-and-after cannot silently become wrong; it can only become
history, which is what a comment is for.

**A number can go stale without changing, if its unit moves under it — and that is worse than a stale
number.** A wrong figure announces itself the moment anyone re-measures. A renamed denominator lets
both figures stay individually correct while **quietly deleting the relationship between them**, which
is the only thing anyone reads a tuning comment for. The ring-speed measurements were recorded "per
half gauge"; the drain later doubled, so the same phrase named a different duration and two results
taken over *identical* wall-clock became incommensurable. The size of that fix — **1.75×** — sat
unreadable in the file for a day, not because either number was wrong but because nothing said they
could be compared.

*The defence, which generalises well past that block:* **pick the unit that survives the constants
around it, then pin the value with two independent restatements.** Ring physics belongs in rev/s, not
in fractions of a meter whose seconds are a tunable — and a rate written as `rev/s`, `s per turn` and
`rad/s` together is one quantity said three ways. A re-measurement disagreeing with all three is the
measurement's problem; disagreeing with one is a conversion error you can actually find. `index.html`
carries the current triple at the ring-capture block, and this entry deliberately no longer copies it.

⚠️ *Because the triple this entry used to quote went stale — inside the entry warning about stale
figures.* `fbe4d18` pulled the ring orbit in and the spin rose, so all three numbers moved at once. **A
unit that survives repricing is not a value that never changes**, and the two are easy to conflate:
choosing `rev/s` protected the figure from a *drain* change, exactly as advertised, and did nothing
about a *geometry* change, which was never the claim. The defence is the unit. Only deleting the value
defends the value. **Gauge
fractions are the right unit for the meter and the wrong one for the ring**, and choosing by what the
sentence is *about* rather than by what is convenient is most of this trap.

**An incentive has a *strength* and a *weight*, and they travel together right up until they don't.**
Strength is what a player feels at the moment of deciding; weight is strength × how many occasions a run
gives them. Almost always they move the same way, which is exactly why they are easy to run together —
and they come apart when the **number of occasions** moves independently of the payoff. The Overdrive
repricing did that: it cut burn-seconds per run fourfold while leaving ring physics untouched, so the
weight of the hoard-and-don't-flip incentive fell and its strength did not move at all. A claim that
"the tension narrowed" was true of the weight and false of the strength. **Ask which one you measured
and which one your decision needs** — *what does a player do next* is a strength question, *how much is
a run distorted* is a weight question, and a design change usually turns on the first.

**A rejection is as perishable as a measurement, and nothing in this process re-checks it.** The current
`CHARGE_DMG` was once rejected in its own comment block, on the grounds that it would one-shot an Epoch
I Pulsar. The pool later doubled, and that same value became the one that *preserves* what the rejection
was protecting — two baits, exactly what the old number took against the old Pulsar. **The rejection was
never wrong; the thing it was measured against moved.** Measurements here get re-run as a matter of
course. Rejected candidates get filed with their reason and never looked at again, which makes them the
stalest thing in the file. When a premise moves, re-derive what it ruled out.

**And the same defect one level up: a *rule* that states a derived number.** `CHARGE_DMG` was recorded
as "pinned at 4 × `VOLLEY_DMG`, and that ratio is the constant". It was not the constant — the bait's
**share of a bar** was, and the ratio was how you reached that share at the pool of the day. Nothing was
wrong until the pool moved, and then the block contradicted itself, because one rule in it was the goal
and the other was an artefact of the goal, and they were written in the same voice. **When you pin a
number to another number, write down what the pin is *for*** — the pin outlives its reason otherwise,
and the reason is the thing you actually need when something moves.

**The scripted pilot cannot see most of the game.** A 40s run stops before formations, Chargers and
Bombers exist; the median pilot dies before the first Bomber can spawn. It has also **never picked up an
Overdrive** — igniting is a keypress the scripted pilot does not make, so the whole second verb, its
drain, and everything gated on `odOn` are unmeasured by the bot regardless of how green the suite looks.
Drive `overdrive()` by hand through the seam if you are testing anything downstream of it.

---

## Open

Questions the game has not answered. These are live; everything else in this file is settled.

**🟡 The grind exploit, restated without the cliff that was never there.** This item spent months
reasoned as a threshold — a line at 18 HP, a *trigger condition*, a margin above it that widened and
narrowed as the pool moved. **There is no threshold, and the margin arithmetic was measuring nothing.**

**The provenance settles it without needing any model to be right.** The pool expression at `e21eda6`,
the first commit in the repo, is `hp=13+act*5` — so Epoch I *was* 18. The number in the warning is not a
boundary anyone derived. It is the pool that happened to be in force when the bot ran, a sample with an
era attached, and it has been read as a threshold ever since because it arrived attached to a result.
The pool has held five different Epoch I values across this repo's whole history: 18 was the first, and
none of the four after it has been 18.

The throughput model agrees, and is worth keeping as corroboration rather than as the proof: grind
throughput is **feed-limited**, not speed-limited — usable ring Dots run inverse to damage dealt, so the
ceiling is gathering rate and arena density, and time-to-solo-kill is roughly **linear in the pool**. A
linear cost has no cliff anywhere in it. If provenance and model ever disagree, **provenance wins** — it
does not depend on the model being true.

So **a pool trim buys minutes, not immunity, and a pool buff is not a clearance.** HP is a scalar on
every channel at once: raising it slows the exploit and the intended loop by the same factor and moves
no ratio. That was argued here before the pool moved for unrelated reasons, and the measurement has now
made it load-bearing rather than hypothetical.

**The open question was never the pool.** It is whether a pilot who never volleys can close the fight
inside a window they survive — and nobody has run that at any pool above 18, at any of the three values
the pool has held since. Still *argued*, not *tested*.

⚠️ *Two framings retired with the cliff, because both were it wearing other words:* the **trigger /
defect** split, and any sentence comparing the current pool to 18. If a future entry reaches for either,
it has reintroduced the threshold model. Price the Pulsar against **Epoch II**, the first Epoch its
variant gate lets it appear in — see *Traps*.

*What is superseded:* an immortal bot orbiting close, never firing a volley and never spending the
meter, solo-killed the Epoch I Anomaly in **5 of 9 runs at the old pool**. Do not quote that number
against the current one. Both caveats on it still stand and still decide whether to act — the bot is
immortal, and a real player holding that orbit pays a real HP cost, so the strategy *exists* and is not
free.

*What the buff could not tell us.* The pilot purged 1 of 5 at the old pool and 0 of 5 at the new, which
is a **floor effect in the pilot, not evidence about the change** — a bot that could barely close the
fight before cannot report on a fight that got harder. The one figure that survived is cost per fight
off `anomLog`: **78 → 94 HP median, +21%**. Recorded because it is the honest result, and recorded here
rather than in the settled sections because one median from a bot that cannot finish the fight is a
lead, not a finding.

**The direction is to make the orbit expensive, not to halve `RING_GRIND_DMG`.** Halving it taxes every
player who earned the fallback in order to stop a bot that does not feel the cost — and the grind is the
only Anomaly answer needing neither a flip nor a meter, so it is what a stripped player has left.
**Raising boss HP does not fix it either:** HP is a scalar on every channel at once, so it slows the
exploit and the intended loop by the same factor and moves no ratio. **The pool has since been raised
anyway**, for difficulty rather than for this, and nothing above changes as a result — which is the
prediction working, not a coincidence. Any further move still has to carry the `CHARGE_DMG` =
4 × `VOLLEY_DMG` pin with it, or the bait silently stops being worth the risk that earns it.

**Aim at *not flipping*, not at closeness.** Closing is measured as intended and rewarded — orbiting at
270px gives 8 kills / 7 deaths against 11 / 4 at 150px — so a generic point-blank buff punishes the
loop the game wants. What the exploit does that the loop does not is hold a large ring indefinitely
without ever flipping.

**This is the same defect as the Overdrive tension**, which is the reason to treat it as one problem.
Rings held measure ~6.9–9.1 while never flipping against ~2.3–3.0 while flipping, and both the grind
exploit and Overdrive's payoff scale with that hoard. **The game rewards hoard-and-don't-flip in two
independent systems.** Whatever makes an indefinitely-held ring expensive fixes both; a damage number
on either one fixes neither.

*This question has a shipped readout, and it has already earned its keep.* `anomLog` records what each
whole encounter cost in HP and the debug seam exposes it alongside `odLog`, which is where the 78 → 94
figure above came from — the only number that survived a change the pilot could not otherwise price. It
is a player-facing display first: treat it as evidence, not as a harness, and hold it to the same
replication bar as everything else here.

**Overdrive pays roughly twice as well if you hoard, and the flip dumps the hoard.** It multiplies rings
held — ~2.3–3.0 while flipping against ~6.9–9.1 while not — so the second verb rewards not using the
first. Standing crowd falls about **−10% while flipping** (two harnesses: −9.9% at *t*=−4.36 and −12.4%
at *t*=−3.98, both n=8) against roughly **−18% while hoarding**.

**This is the same pressure as the grind exploit above** and the two are one problem: whatever makes an
indefinitely-held ring expensive addresses both, and a damage number on either addresses neither.

**But it is a trade, not a trap, and only since the ring-speed fix.** Before that the flipping case
measured **+0.3%** — Overdrive was worth nothing at all unless you hoarded, which is a fault. At half
the effect either way it is a legitimate risk/reward axis. Nothing here argues Overdrive is bad; it
argues that its best use and the game's core use pull against each other, which is worth watching rather
than correcting.

⚠️ *Every figure in this item predates the 4× repricing.* The crowd effects were measured over rides
twice this length, so the magnitudes are stale; re-run before anyone acts on this item.

*What the repricing did and did not change, because a first pass at this got it wrong.* The hoard in
question is **rings**, not charge, and the ring physics did not move — so the incentive to hold rings
**at the moment you are deciding whether to flip is exactly what it was**. What fell is the *per-run
weight* of that incentive: a quarter as many burn-seconds means a quarter as much of a run spent where
hoarding pays. Those are different quantities, and the decision this item drives is the per-moment one.

Nor did the meter decision soften. Spending at the floor against saving to full is still the same
**4:1** in ride length; what quadrupled is the play-time cost of reaching either end. **That is fewer
occasions to wait for, not a smaller payoff for waiting.**

*An earlier version of this note read "the tension may have narrowed on its own" — a direction asserted
without a measurement, in the paragraph whose whole point is that the figures need re-running. It is
recorded here rather than quietly removed, because the trap it walked into is two sections up.*

**Nothing defends you any more, and the hole is measured.** The powerup roster was deleted rather than
fixed, which was right — only Aegis was load-bearing (−32.8% survival when suppressed, Welch t=4.06 at
n=30, against t=1.12 and t=1.56 for the other two). But removing it cost **−23.5% survival** and, more
tellingly, **halved the run-to-run variance** (sd 18.8 → 8.5): a free shield was most of the long tail,
so the best runs are gone rather than the average one being worse.

**The intended replacement is a close call earning a shield** — a near miss paying defence, so the reward
for cutting it fine is what lets you keep cutting it fine. It has to fill that measured hole. ⚠️ **The
graze system it was going to be built on has since been removed**, so this now needs its own detection —
about ten lines, and the restore point is marked in `stepPlayerContact`. **That is a smaller loss than it
looks and arguably a clarification:** SCOPE's design note already said not to pay a *single* graze
(*"grazes are luck as often as skill"* — the game's own words), so the plan always needed the **ladder**
with a threshold on it, 단발은 운 지속은 실력, and never the crumb that was deleted. What it does cost is
`grazeN` and its 1.5s decay, which have to come back with the detection. The old shield-block shape is
described in a comment where it was deleted, as the thing to bring back. Not started.

**~~The Splitter has no answer the player can aim.~~ Closed by deletion in `6324914`.** The species
is gone, and the Mini with it. The item was that the one Dot whose death made the field *worse* had
no on-demand answer — a species-identity question rather than a spawn-weight one — and removing the
species is a legitimate answer to an identity question, if a blunt one.

*Worth keeping, because it outlives the Splitter:* the failure was that a Dot's counter existed but
could not be **aimed**. A Bomber blast killed a Splitter cleanly, so on paper there was an answer;
the player could not reach it on purpose, so in the hand there was not. **An answer the player
cannot choose to use is not an answer**, and that test applies to every species added later — the
Planet is the current one to hold it against.

**~~The Moment Engine's audio half was never built.~~ Built in `a96d813`** — all three: panned kill pops,
a low-HP heartbeat, and a storm bed. See *Sound design rule* for how two of them get away with living in
an occupied register. ⚠️ **One thing is shipped but not independently verified**: the storm layer's
*gate* is a clamp to zero and an early return, which is readable, but its *level* was never isolated —
the ambient bed's gain also scales with intensity and `ambPluck` fires on a random timer, so an A/B
across the gate is dominated by that noise. If the bed ever reads as too loud or too quiet in `storm`,
nothing has measured it yet.

**~~`P.iframe` has two values, and one of them is a literal.~~ Closed — there is no literal.** Both damage
sites (`3536`, `4538`) set `IFRAME`; the third writer sets `FLIP_IFRAME`, which is a **named constant**
declared one line under `IFRAME`. The magic number this item was written about belonged to the shield
block, and that path went with the powerup roster. *Closed by verification, not by work* — nobody fixed
it; the code that carried it was deleted for other reasons and the item outlived it.

**~~The `body` → `Dot` rename has not reached the code.~~ Substantially done, and the counts here were
off by an order of magnitude.** This read *"140 `body`/`bodies` against 17 `Dot`s"* in `index.html` and
*"`body` 23 times and `Dot` never"* in `bestiary.html`. Measured at HEAD: **14 against 186**, and **2
against 16**. ⚠️ **The half this item called the hard part is the half that is finished** — the Bestiary's
player-visible copy says `Dot` throughout and `body` **zero** times; both survivors there are code
comments.

What is left is 16 comments, and most should stay: *"priced in connecting bodies"*, *"parked bodies keep
their last sensible axis"*, *"six bodies"* use *body* as the physics word for a moving mass, not as a
synonym for Dot. Retire the item rather than finish it — the rule is `Dot` in anything a player reads,
which already holds.

**A chase reward for the Sentinel that is not contact damage.** The obvious version measures backwards
(see *No per-kind bonus*), so the idea needs a different vehicle, not a different number.

**Bomber spawn weight vs. its role — ANSWERED, watch the feel.** The weight had been priced when a Bomber
was a Dot you could walk through; contact went back to Drifter parity while the death blast kept clearing a
large hole in your hoard, so it was paying for the wrong property. `BOMB_RARITY` now scales it in both
bands. Measured over 4 matched 240s runs, counting every arrival by identity, Bombers fell **293 → 153**
(−47.8%); share of all arrivals went 8.61% → 4.95% in the intro band and 7.15% → 3.76% past it. What is
*not* settled is whether the blast is now rare enough to read as an event rather than a tax — that is a
feel judgement and the bot cannot make it, because the median scripted pilot dies before the first Bomber
can spawn.

**🟡 Missile reach is fixed and the arena is not, so "nothing expires on screen" is a claim about one
display size.** `resize()` puts the play field in design units at `W = vw / S`, `S = min(1, min(vw,vh)/800)`
— which floors the *short* axis at 800 and leaves the long one free, so the arena is the viewport on
anything desktop-sized. Reach is a table product and does not move with it: **1656–2208** design units at
full pace, **1242–1656** at Epoch I's. Both clear a 1440-wide arena. Neither clears a 2560-wide one.

Every fizzle measurement in this file — including the **zero non-mine mid-arena expiries** that `9fd8dcb`
was verified on — was taken at a single harness viewport, so none of them can speak to this. **It is
arithmetic, not an observed fault:** the Anomaly fires from its own body rather than from an edge, and
whether a shot ever has 2200 units of arena in front of it depends on where it is standing. The cheap
check is a run at 2560×1440 counting non-mine expiries by kind, which nobody has done. If it does bite,
the lever is the table (law 15 — size for the worst case it will fly in), not a return to the per-shot
correction, which is what was hiding the seeker's deficit in the first place.

*Re-derived independently, and the figures above hold: `W = vw` exactly once the short axis reaches 800,
and reach is 1944 · 1901 · 1656 · 2208 at full pace, three quarters of that at Epoch I. Three
refinements, one of which softens the item and one of which sharpens it.*

**Which distance you test against is doing more work than the arena width.** "Clears a 2560-wide arena"
is the *full* width — a boss standing on one edge firing at the other. A centred boss needs only **half**
that, and by the half-width measure the picture is much later: nothing falls short at 1920 or below at
either pace, only the Epoch I ring falls short at 2560, and the case where it bites across the board is
**3440 — ultrawide, not 2560**. The truth sits between the two tests and moves with the boss, which the
item already says; it is worth saying *which* of the two the numbers are.

⚠️ **The arithmetic under-predicts expiry — and neither 13.3% nor any choice of width is what shows it.**
Both of those need retiring, and the second is the real result.

**13.3% is not admissible.** It is a pre-`9fd8dcb` culled-by-`life` rate with **mines counted in it**, and
`9fd8dcb` took exactly that class of number apart: of the Pulsar's 20 expiries, **16 were mines detonating
as designed.** A mine's `life` is a fuse and its 184 units are not a reach — law 15 exempts it by
construction, so the model never claimed to predict it. Quoting it here reintroduced the trap recorded
four sections down, one commit after that trap was written.

⚠️ **The under-prediction is real, and the clean proof is the Emitter — which falsifies the width tests
outright rather than nudging them.** At Epoch III, pre-raise, its kit was volley 1361 and spear 1546, no
mines anywhere in it, and it fizzled **11.8%**. Volley reach 1361 already exceeds the *full* 1280 width,
never mind the 640 half-width. So real paths run past the widest straight-line test available, and picking
a bigger width does not repair the model.

⚠️ **The Sentinel was read as falsifying the ranking too, and it does not — the 1030 was on a different
basis from the rest of the table.** The Sentinel fires nothing but seekers, and pre-raise the seeker is
`sp 3.3 · life 6.9`, so its reach is **1366** on the same arithmetic that gives the other rows theirs.
1030 is 0.754 of that, which is the **Epoch I pace multiplier** — an Epoch I figure quoted in a table
headed Epoch III. Nor was it ever "the shortest reach in the game": the ring is 1159 and the mine 184.

⚠️ **And the table that corrected it carried the same defect a third time, in the other column.** The
Pulsar's 17.9% is the mine-inclusive rate — the very figure being stripped from the argument two
paragraphs above, quoted unstripped in the measured column while the reach column was carefully cleaned.
**The Pulsar is the only variant with a fuse-bearing kind in its kit**, so it is the only row whose
measured value is a different kind of thing from its neighbours. Same tell, third firing.

Stripped, reconstructing the Pulsar's shot mix from its cadences: the nova throws 12 ring lances every
~4.5s against a mine volley every ~3.1s, putting mines at **~27%** of what it fires. Of 20 expiries, 16
were mines, so ~4 non-mine expiries against ~82 non-mine shots — **~4.9%**. For 17.9% to have survived
stripping, mines would have to be **80%** of everything the Pulsar fires; the ring alone throws twelve at
a time.

| Epoch III, pre-raise | kit | shortest non-mine reach | measured, one basis |
|---|---|---|---|
| **Pulsar** | ring, mine | 1159 — shortest | **~4.9%** *(reconstructed)* |
| **Emitter** | volley, spear | 1361 — *above* full width | **11.8%** |
| **Sentinel** | seeker | 1366 — longest | **0%** |

**So it is not monotone either, and the honest state is that neither ordering is established.** The
shortest reach lands in the middle. Three points, one of them reconstructed from a remembered 16-of-20,
is not an ordering in any direction — and that is weaker than both the inversion originally claimed and
the monotonicity claimed against it. **Reach has not been shown to predict expiry across variants.** The
two claims cancelled and what is left is the absence of a result, which is the thing to write down.

**Where it genuinely runs out is the Emitter–Sentinel pair: 5 units apart in reach and 11.8% against 0%.**
Reach cannot separate those two, and something else must. Behaviour is the obvious candidate and the
mechanism is sound — the Sentinel closes and circles, so its seekers fly short paths whatever the arena
is, while the Emitter hovers and sweeps across open ground. But that is now an explanation for a tie
being broken, **not** a demonstration that the ordering is wrong. Every crossover figure above stays a
rough scale rather than a floor or a ceiling, for the Emitter's reason alone: 1361 exceeds the full width
and still fizzled.

**What survives, and it is worth keeping:** the harness viewport is the narrowest desktop arena there is
— 1280×800 sits exactly on the `S=1` boundary and every standard desktop is wider — so more arena is
available in reality than in any figure in this file, and the direction of the error is fixed even though
its size is not. It is also where the "1280-wide arena" in `fireMissile`'s comment came from: a harness
default promoted to a game constant by being written down beside real ones.

**So the check is per variant, not per width.** Run each of the three at a real desktop viewport and count
non-mine expiries **by kind**, recording boss position and distance-to-player at fire time. Arena size
picks the axis; the variant decides whether anything is ever on it. If it does bite, the lever is the
table (law 15), not a return to the per-shot correction.

**The comet shower multiplied comet mass by 3–5× and left the timer alone.** `9fd8dcb` turned one crossing
body into 3–5 on a shared heading, and nothing about `cometT` moved — so the *event* is exactly as rare as
before while the Brutes it delivers per event went up by the full factor. That is the intended shape (a
shower is meant to be an occasion), but it has not been played, and the arithmetic says it is the largest
single change to ambient Brute supply in the file. **The timer is the lever if it reads as too much** —
not the count, which is what makes it weather rather than a curio. Watch also that the timer only advances
outside a boss, so a rarity pass here lands at twice its intended strength (see *The Comet*).

**Boss balance is bot-derived.** Every TTK number in the ledger comes from a scripted pilot holding a fixed
orbit and never dodging — which is the worst possible way to fight the kind that hovers and shoots
point-blank, so the Emitter reading hardest is probably an artifact. Needs one human playtest.

**No heal beats the lockout.** Integrity regenerates only after a quiet window and nothing else heals.
Disengaging is the entire healing verb; watch that a bad Epoch is still recoverable.

**Touch controls.** Parked pending the launch-environment decision. Every touch-down currently calls
`flip()`, so steering re-grips reverse your polarity; Android long-press additionally synthesizes
`contextmenu` → an unintended Overdrive ignition. The fix is either a real touch scheme or an honest desktop-only
gate.

**HUD hierarchy.** The meters read as equals; only Capacitor and Streak deserve to be loud.
