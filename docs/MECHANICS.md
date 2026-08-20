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

⚠️ **Deleting the numbers did not delete the duplication — the Bestiary also duplicates the ART, and
that went stale the same way.** `bestiary.html` carries `anomBody()`, a hand-copy of `bossBody()` marked
"mirroring index.html". When the Anomaly bodies became a star, a vortex and a nebula, the Bestiary went
on drawing a faceted hexagon, a hollow pincer ring and a rays crown — teaching a body the player will
never meet. Nothing failed and nothing warned. **A wrong picture in the reference is worse than no
picture, because the player believes it**, and unlike a wrong number a wrong drawing cannot be grepped
for at all — it is not even a literal.

**It cannot be de-duplicated, and the reason should stop anyone "fixing" it badly.** The game is one
self-contained HTML file with an inline script, which is load-bearing for the offline shell and the CSP;
the Bestiary is opened **standalone** as well as in the iframe (see its `og:` tags), so it cannot reach
`parent.__orbital` either. A shared `anomaly-art.js` would hand `index.html` an external dependency it
deliberately does not have. So the copy stays and is made **loud** — a warning block at `anomBody`
naming `bossBody`, and this paragraph. **When you touch one, walk the other in the same pass.** The only
enforcement is the habit.

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

### 4. Hitbox is hull — for the Anomaly, and in one direction for Dots
`e.r` is the collider. A render-only **shrink** is the thing this law exists to forbid: it puts the kill
edge outside a hull that looks safe, which is law 3 in its worst form, and nothing may ever do it.

⚠️ **The law used to read "never split them" and Dots split them, on request, since 2026-08-19.** With
**Larger Dots** on, a Dot's hull is `e.r + DOT_BLOOM`, three design units wide of its collider: *"can it
be only size gets bigger, and hitbox is old one? … i cant see well, but i dont want difficulty going up."*
The Anomaly is **not** included and `b.r` remains hull and collider both.

**It is a setting, and the default reads the device.** `S` scales the render, so the same Dart is 8 CSS px
of radius on a desktop and 3.9 on a phone — at the second number the bloom is legibility, at the first it
is just a bigger Dot: *"law 4 doesnt apply to Mobile, like when screen is too small. but it is now too big
for PC/Web."* `store.bigDots` defaults **on** for a coarse pointer or a short axis under `REF_SHORT` and
**off** otherwise; a stored choice is never second-guessed, the same contract `lang` keeps. So on a
desktop this law is unsplit unless a player asks for the split.

**The direction is the whole defence, and the law already conceded it.** Three silhouettes overhang
already — Brute hexagon, Charger arrowhead, Planet ring — and this section has always called that *the
forgiving direction*: the worst a wide hull produces is a frame where two discs visibly kiss and nothing
happens, which reads as the near miss it is. The bloom does not introduce the exception; it makes it
uniform, moves it from three silhouettes onto one constant, and states the price.

**What may not carry it:** anything drawn *outside* a hull, because that is law 3's territory — a reach
mark off a bloomed radius would lie in this law's own forbidden direction, three px at a time. Both live
sites (the Charger's reticle, the dashed envelope ring) stay on `e.r` and are labelled at the point of
use. **And the star does not bloom**, deliberately: one true edge has to survive for the player to
calibrate against, and two bloomed hulls would compound to 6px of pre-contact overlap.

*Catch it:* bracket the separation at which contact actually fires; it must land on `e.r + P.r` for
all nine species plus the boss — **`e.r`, not the drawn hull**, which is now 3 wider on every Dot.
⚠️ *Since the bloom, "it looked like it touched" is no longer evidence either way* — a screenshot
cannot bracket this any more, only the numbers can.

⚠️ **And the rig has to prove the star did not move, not merely be written as though it did not.**
This section has always said to bracket on the separation that existed at *end of frame*, because the
star chases the pointer and is yanked before contact resolves. That warning is not enough on its own:
running the bracket from a hardcoded `(400,400)` passed 8/8 on one branch and failed 8/8 on the other,
and **both runs were measuring the chase**. `startRun` parks the pointer on the arena centre, so the
pass was the case where the seed happened to equal that centre and the chase was zero-length; the
failing branch merely had a different viewport, a centre 60px away, and a star that flew there every
frame. Seed the probe at `W/2, H/2` **and assert the star's displacement is 0** — a whole category
passing or failing at once is a statement about the instrument, never about the eight species.

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
**No centre banner — with exactly one argued exception.** Storms, the Anomaly's arrival, an Overdrive
igniting and streak tiers are announced by matter, colour, ring, shake and sound. Text across the middle
pulls the eyes off the field at exactly the wrong moment.

⚠️ **The Epoch boundary is the exception, and the reason is that it is the one beat that cannot announce
itself by doing.** Every other event on that list *does* something you can see: a storm arrives as
bodies, Overdrive as your own ring snapping outward. An Epoch change eases the background two gradient
stops and re-letters an 11px, 85%-opacity name in the top slot — so the single structural milestone in a
run was also its quietest thing, landing in the same second as the biggest kill in the game. The **Epoch
cue** (`showEpochCue`, `#epochcue`) states it at 26–52px in the Epoch's own tint, and the law it is
answering to is not "stay small", it is **do not take the field**: no background, no panel, no dim, no
backdrop-filter, `pointer-events:none`, and the sim runs straight through it — every Dot behind it stays
visible and every input still lands. **Large and transparent, not small and opaque.** It sits in the band
under the Epoch slot, the strip the tutorial bar was given because no thumb covers it in either
orientation, and the Anomaly's own bar is guaranteed clear by then because the thing that owned it is
what just died. Neither of its two lines is authored copy: the kicker is `fx.purged` and the name is
`hud.epoch`, the exact string the top slot renders, so it cannot drift out of step with the HUD or need
its own Korean. Comfort mode keeps the words and drops the movement — it is information, not an effect.

**One *persistent* text channel**, outside the play area: the **achievement toast**. It was two — the
pickup pill named a powerup's effect, the one thing you genuinely could not read off the screen. With
the powerups gone the pill had nothing left to say and went with them, which is the correct outcome: a
channel exists to carry something unreadable, not to be preserved.

**Everything else is floating text, and floating text must be drawn where its event happened.** `-8`
rises off the Anomaly you just bit, `+750` off the Dot that paid, and `-8` off your own star when
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

**The bounty carries no label any more**, so gold now prints two bare `+N` readouts: the jackpot at the
dead Dot and `healSignal`'s Integrity grant at the star. They can co-occur — gilding is not gated on
`wavePhase`, so a jackpot can cash on the frame an Anomaly dies. That is inside the rule rather than an
exception to it. The rule assigns one role per colour, not one *sentence*; gold's role is reward, both of
these are rewards, and the fault this section exists to prevent is income read as **injury** — a pair
still separated by sign and by colour. Confusing one reward for another costs the player nothing. The
word was also the fourth cue in that frame to say "bounty", after a 90px gold ring, `sfx.streakMile(2)`
and a trauma kick.

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

**Integrity** does not come back. **Purging an Anomaly is the only heal in survival — one heal an
Epoch, +30 against a pool of 100.** There is no passive regeneration, no lockout to wait out, and no
other source; what you spend at Epoch II is still missing at Epoch VI. Integrity is a **run-long**
resource, and that is the axis score does not have: score is ~131 pts/s and near rate-invariant, so it
reports how long you lasted, while remaining Integrity reports how cleanly you got there.

⚠️ **The practice rooms keep the old regeneration, deliberately.** Boss Rush, Pattern Lab and the
tutorial still recover 2.6/s after 3.8s untouched. Boss Rush exists to teach an Anomaly's pattern and a
fight costs a median 94 HP, so on survival rules it would grant about one and a half attempts a session
and teach nothing. The menu already promises those rooms are not comparable ("Practice only · neither
can set your best"); this is one more way that is true. **Survival is the only mode whose economy is
the feature.**

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

**Three zones, and which one you landed in is the whole decision.** The canvas is partitioned by
geometry — `zoneOf(x,y)` in CSS pixels against the cached viewport halves:

|  |  |
|---|---|
| **left side** | MOVE — an absolute map of the arena |
| **top-right corner** | OVERDRIVE — hold to burn |
| **bottom-right corner** | FLIP — press to reverse poles |

⚠️ **This table said "left half", "quarter", "quarter" and "a virtual stick", and all four were stale.**
The stick was retired two rewrites ago — the zone is an absolute map now (below). And the fractions are
the *default*, not the partition: `touchSens` works by moving the seam, so the move zone runs 50 → 83.3%
of the width across the slider's five stops and the two act zones shrink to 16.7%-wide strips to match.
Measured at 767px: **50.0 / 55.6 / 62.5 / 71.4 / 83.3%**. Naming them by fraction was wrong for exactly
the players who went looking for the setting, so the in-game legend now says *Left side* too.

Move is the largest zone because it is the only *continuous* verb; the other two are instants, and an
instant wants a target rather than a field. **Overdrive sits above flip because the two must be usable at once** —
Overdrive is held for seconds and you keep flipping through the ride, so they cannot share a thumb.
Verified: three fingers down simultaneously, the star steering while burning, a flip landing mid-burn,
and the burn surviving it. On device, the tutorial certifies all three by gating each step on performing
the verb — 1/6 → 2/6 drag, 4/6 → 5/6 flip, 5/6 → 6/6 Overdrive hold. *(That check originally read "the
star moving at 19.6 units/frame while burning" — `14 × moveMult`, a figure belonging to the rate model
and to a coupling the displacement model deliberately dropped. See below.)*

⚠️ **That ergonomic argument is a LANDSCAPE argument, and the lock is native-only.** In the shell it is
settled and top-right really is where the grip rests an index finger. **On the web it is settled by
nothing** — the manifest's `orientation` is advisory and applies only to an installed PWA, so a phone
*browser*, which is how the README tells people to play, can be portrait. The partition still works
there (halves and quarters of whatever viewport exists) and flip stays under the right thumb, which is
the verb asked for most; what is lost is the shoulder button, with Overdrive becoming a deliberate
reach. **Argued, not measured — nobody has held a portrait phone browser and tried it.**

⚠️ **The zone is read on contact and never again.** A steering finger that wanders into the right half
keeps steering; an Overdrive finger that slides down does not become a flip. Re-testing per move would
mean the control changes under you while you are using it.

**Selected by the event, not by the device.** `isTouch(e)` decides per event, so a mouse is never
affected and a finger always gets zones — phone, tablet, touchscreen laptop alike. This is the third
selector this file has had and the first that cannot be wrong about the hardware, **because it makes no
claim about the hardware**: the two it replaced were both guesses (`pointer: coarse`, then a stored
preference), and both stranded real players. See the tilt tombstone below.

**Flip fires on PRESS.** Under the retired intent-split scheme it could not: until you lifted, there was
no way to know a press was not the start of a drag, so flip carried up to `TAP_TIME` (300ms) of latency
the player could neither see nor shorten. Flip is a *timing* verb. This is the change with the most feel
in it, and it is why `TAP_SLOP`, `TAP_TIME` and `tapMoved` are gone.

**`TOUCH_LIFT` is gone too, and it was a correction for a problem the old scheme created.** Absolute
steering meant the finger had to reach every part of the arena, so it covered the arena, so the star had
to be drawn 55px above the fingertip to stay readable. A stick does not park your thumb on the star.

**The move zone is an ABSOLUTE MAP of the arena.** One thumb position means one arena position, the
same one, for the whole run. `stickSet` letterboxes the arena into the zone and writes the result into
`pointer` — so the star is chased by the **same line in `stepPlayer` the mouse uses**, at 0.185 of the
gap per frame, and touch inherits the mouse's responsiveness by construction rather than by tuning.

⚠️ **This is the THIRD model, and the first two failed the same test for the same reason.** Both were
reported as "not natural":

| model | what a thumb position meant | why it failed |
|---|---|---|
| rate stick | "keep going this way" | never says *where*; capped at 14/frame against the mouse's 74–148 |
| displacement | "move the star this far from wherever it was" | the thumb↔star relationship **drifted** with every re-grip — it had no fixed value at all |
| **absolute** *(now)* | **"the star is here"** | — |

A trackpad gets away with drift because the pad is not the screen and there is a cursor to watch. On
glass, with the thing you are steering visible beside your thumb, it does not.

⚠️ **YOUR THUMB IS NOT ON THE STAR, AND CANNOT BE.** Half a screen is mapped onto a whole arena, so a
thumb at zone x=200 puts the star at arena x≈796, drawn at screen x≈400 — the thumb *points at* the star
rather than carrying it. That is the price of steering from a half-width zone and every absolute scheme
that fits in one pays it. The pre-v2 control had the star **on** the thumb only because it steered from
the whole screen, which is also why it needed `TOUCH_LIFT` to stop the thumb hiding it.

⚠️ **Letterboxed, never stretched.** The zone is 437×402 CSS px against an arena of 1739×800 design
units — aspect 1.09 against 2.17. Stretching to fill would scale x twice as hard as y, so a 45° thumb
sweep would send the star off at **~63°** and every diagonal would lie. Fitting instead costs vertical
range: the arena's full height lands in the middle **201px** of the zone (`stick().band`), and outside
that the star pins to the arena edge — which the existing arena clamp already does, so the band needs no
code. `STICK.bandY` moves the strip if a thumb rests lower than centre; it is a live object because no
bot can settle it.

**The cost, stated plainly: 3.98 units per CSS px, twice the pre-v2 scheme's 1.99.** Half the width for
the same arena is exactly 2× the sensitivity, and that is arithmetic rather than a tuning choice — the
only ways out are giving up the partition or giving up isotropy.

**`store.touchSens` is the first of those two, sold to the player as a slider.** Settings → *Touch
steering*, 60–100%, default 100. ⚠️ **It moves the ZONE'S WIDTH, and it could not have moved anything
else**: an absolute map's scale is pinned by "the zone shows the whole arena" (`k = zoneWidth / W`), so
arena-units-per-pixel is not a free parameter. A slider that pretended otherwise would either stop the
thumb reaching the arena edges or start bending the diagonals. Widening the steering zone is the same
act as narrowing the Overdrive and flip corners, and the copy says so rather than hiding it.

⚠️ **That copy is the ONLY signal the player gets, and a comment used to claim otherwise.** The
`sensRange` handler justified `input` over `change` by saying a player could watch the seam widen under
their thumb — but `ZONE.x` is read by `stickSet`, `zoneOf` and the probe and is **drawn by nothing**, at
any sensitivity. `input` is still correct (the value is live the moment you let go), but its stated
reason was fiction. This is also why `set.sensD` keeps a second sentence when every sibling row on the
panel makes do with one: it is carrying information that has no visual form.

| setting | zone width | sensitivity |
|---|---|---|
| 100% *(default)* | 437px — half | 3.98 u/px |
| 80% | 546px | 3.18 u/px |
| 60% | 728px | 2.39 u/px |

Capped at 85% of the width so the action corners cannot be squeezed below ~131px, which is about where
a thumb stops finding a target it cannot see. The cap does a second job that is easy to miss: it keeps
the steering zone narrower than the screen at every stop, which is the condition under which the thumb
POINTS at the star rather than carrying it — i.e. it is also what keeps `TOUCH_LIFT` retired. ⚠️ **Even at 60% it does not reach the pre-v2 1.99** — that
number needed the whole screen, and the whole screen is what the partition spends.

⚠️ **The sensitivity lives on `ZONE`, not on `store`, and that is an ORDER constraint rather than a
style choice.** `resize()` runs at load and `store` is declared ~80 lines below it, so reading
`store.touchSens` from `resize()` is a temporal-dead-zone `ReferenceError` at boot — the class of fault
`node --check` does not catch and this file has been bitten by before. `store` copies its value into
`ZONE.sens` once it exists; `applyTouchSens` writes both.

*Verified at 874×402:* thumb (100,200) → star (398, 396); sweep to (380,260) → star (1512, 635); return
to the **same** thumb spot → star (398.6, 396.2), back within **0.6 units** — no drift. Thumb x=3 pins
the star at 15 and x=434 reaches 1724 of a 1739-wide arena, so the whole field is reachable. Flip,
Overdrive, steering-while-burning, the mouse path and the Draw clamp all unaffected.


**No smoothing and no dead zone, and that is not an omission.** Tilt smoothed because an accelerometer reading is noisy. A
touch offset is two integers the compositor already resolved. Filtering would buy nothing and cost lag.

#### The two models disagree under an external force, and only a clamp reconciles them

**The mouse is a POSITION control and the stick is a RATE control, and nothing had ever pushed the Star
before, so it had never mattered.** The moment anything moves the Star that the player did not ask for,
the two come apart completely:

| retreating from a force | free | under `DRAW_CAP` |
|---|---|---|
| mouse, wide pointer gap | **92.3 units/frame, unbounded** | 1.860 |
| stick, full deflection | 14.00, hard-capped | 1.860 |
| gap between devices | **3.1–6.6×** | **1.00×** |

Displace the Star and the mouse's gap grows, so its restoring force grows **without bound while the hand
does nothing**. The stick's offset is measured from the touch origin, not from the Star, so displacement
produces no extra force at all and a thumb at full deflection has nothing left to give. **A pull sized to
be escapable on a phone is invisible on a desktop; one sized for the desktop is a cutscene on a phone.**

**Clamping the frame's total displacement is what makes "the player's top speed" a well-defined quantity
at all** — on mouse there is no such number otherwise — and that is the only reason `DRAW_AWAY` can be
expressed as a ratio rather than tuned per device. ⚠️ **The clamp is therefore a PREREQUISITE for any
future force on the Star, not an alternative to one.** With it in place an inward velocity added *after*
it is device-neutral for free; without it, a force is unbalanceable.

⚠️ **One site covers all three input models, and the site is not arbitrary.** `P.lastX/lastY` are written
only at the foot of `stepPlayer`, and the only four writes to `P.x/P.y` in the file are the stick, the
pointer chase, the keyboard nudge and the arena clamp — all above it. So `(P.x-P.lastX, P.y-P.lastY)`
there is the frame's total input displacement across every device at once. **Anything added later that
moves the Star must land above that line or it silently bypasses every such effect.**

#### The cap has to open, not lift — and for two and a half years it lifted

⚠️ **The clamp slowed the STAR and never touched the TARGET, so the gap between them banked.** Two of the
three models chase a target rather than expressing a speed: the mouse's is the cursor, and on `v2-ios`
the ABS mode literally accumulates thumb travel into the same `pointer`. Under a Draw the target keeps
running while the body crawls at `DRAW_CAP`, and on the frame the cap expired the chase spent the whole
arrears at once — 18.5% of a gap that was now arena-sized, in one frame. Author, reporting it: *"stacked
movement that was restricted by Singularity are done at once, when the Singularity's pull is ended,
making too much movement instantly."*

Measured before the fix, 1440×900, Anomaly pinned, cursor flicked to the far corner on the first drawing
frame and then held still:

| | while drawing | release frame | to close 90% of the gap |
|---|---|---|---|
| far corner, 1110px banked | 1.87 px/f | **205.05 px/f** | 13 frames |
| straight away, 346px banked | 1.86 px/f | 63.73 px/f | 13 frames |
| `v2-ios` ABS, 521px banked | 1.86 px/f | 96.3 px/f | — |

**`DRAW_REL` makes the ceiling open instead.** The release frame keeps exactly `DRAW_CAP` and the ceiling
then rises linearly, so there is no step at the release *and* no cliff at the end of one: the clamp stops
the first frame the chase asks for less than the ceiling, which is by construction a frame on which it
was doing nothing. **A fixed-duration ramp cannot promise that** — one was built first, and at 6.2→14
over 0.5s it spent 303px, so an 1110px gap still had ~800 left when the window closed and the teleport
merely happened half a second later. Anything that ends on a *clock* has that failure mode.

The rate is set by the ordinary chase rather than by the worst case: a 100px gap — a normal cursor lead —
asks 18.5 px/f, which the ceiling reaches in about a fifth of a second. The 1110px case now peaks at 42
px/f and takes 0.70s.

⚠️ **The ramp clock is the one piece of Draw state that is not on the boss, and that is deliberate.**
Every other piece dies with the Anomaly, which is exactly what a release must *not* do: killing a
Singularity mid-Draw is the commonest release there is, and the one the player is most likely to have
been fighting the pull through. It therefore carries the obligation that rule was protecting — a single
reset site, in `startRun`, beside `settleT`.

⚠️ **The ramp bounds the payout; it does not cancel it.** On `v2-ios`'s ABS mode the arrears is real
banked travel and the Star still ends where the thumb asked, 0.88s later instead of instantly. Cancelling
it would mean leashing `pointer` to the Star while the Draw is up — the same move `stickAbs`'s arena
clamp already makes at the edges — and that is the lever to reach for if the payout itself is unwanted
rather than merely too fast. STICK mode banks nothing and never did: it is a rate, so it has no arrears.

⚠️ **Clamp first, then tax; the other order is dead code that measures identical.** Every model's raw
displacement is already far above any sane cap, so taxing before clamping removes a share of a number the
clamp then discards. It would bite only where the raw move was *under* the cap — taxing a gentle nudge
and leaving a full-speed retreat alone. Measured before the fix: taxed and untaxed directions both 6.200,
indistinguishable.

*Pinning the cursor to the Star was considered and is the right diagnosis of the cause* — kill the gap and
both become rate controls. It is not taken, for two reasons that are not about elegance: Pointer Lock
hijacks **Esc**, which is the pause key and belongs to the browser once locked, and it removes the
corner-to-corner flick that ring hysteresis uses to shed a ring. Pinning only the internal `pointer`
during an effect has a worse release than the thing it fixes — the physical cursor is elsewhere, so the
next real move snaps — and the floating-origin repair `STICK` uses is **unavailable to a mouse, because
JS cannot move the OS cursor** and so can never re-centre.

⚠️ **The utility cluster moved because the partition left it nowhere neutral.** `#muteBtn`, `#motionBtn`
and `#pauseBtn` were stacked up the right edge at `bottom` 16/58/100 — which is **inside the flip zone**,
the quarter a thumb taps most, so each was a hole that paused or muted instead of flipping. Mute and
Reduced motion are duplicates of Settings rows and are hidden on coarse pointers; Pause is not a
duplicate and moves to the top-right corner, into the less-pressed zone and onto its extreme corner.
**This is the one part of the scheme argued from ergonomics rather than measured** — it wants a real
thumb on a real phone.

### Tilt, removed

**Tilt is gone — all of it.** `stepTilt`, `onTilt`, `tiltMap`, `tiltCurve`, `tiltCalibrate`, the `TILT`
constants, `tiltVec`/`tiltRaw`, `window.__nativeTilt`, `#tiltDiag` and `updateTiltDiag`; and on the
native side the CoreMotion bridge, which took `MotionBridgeViewController` with it — that file is now
`AppViewController` and carries only the DEBUG JS probe. About 180 lines of JS and 60 of Swift.

**It went in two steps, and the second one is the interesting one.** It stopped *steering* when the
three-zone touch control landed, and was deliberately **kept intact and unwired** on the argument that
the bridge was ~40 lines of verified Swift and `TILT.tau` had taken two passes and a measurement to
settle — worth preserving rather than re-deriving. That was right at the time and was overtaken by the
next change: **the control tilt would return to no longer exists.** The move zone is a *displacement*
now and tilt is a *rate*, so putting it back is not re-enabling a feature — it is designing a second
steering model and deciding what happens when it and a finger both ask for the star. **The decision is
the work; the code was never the work**, which is what made keeping the code stop being worth it.

⚠️ **The measured finding outlives the deleted code, and it is the reason not to start from
`requestPermission`.** On a real iPhone in this WebView, `DeviceOrientationEvent.requestPermission()`
exists and its promise **rejects**, and attaching the listener anyway delivers **nothing** — even though
Capacitor implements the documented host hook (`webView(_:requestDeviceOrientationAndMotionPermissionFor:)`)
and answers `.grant`. Nor is it the scheme: `iosScheme` cannot be https, and `localhost` already confers
secure-context privileges. **The web sensor path is a dead end on this stack.** That is why the bridge
was native, and anyone reviving tilt should start from `git log -- ios/App/App/*ViewController.swift`
rather than from the web API.

⚠️ **`orbitalcrash_tilt` in localStorage is inert and there is now nothing that could read it.**

**Two things tilt taught that are still load-bearing, and both now live in the STICK block.** The *rate*
argument — an angle means "keep going this way", not "be there" — survives as the explanation of why
that model was wrong for a finger. And the *sample-rate scar*: tilt's smoothing was a per-event fraction,
so a bridge change from 30Hz to 60Hz silently halved the control speed and was reported as "tilt reaction
is a little slow". That is why the stick banks its displacement and applies it on the fixed tick instead
of writing `P` from a pointer handler.


**LANDSCAPE is enforced natively, both ways round.** ⚠️ **This section said "portrait" until 2026-08-10,
five days after the code stopped agreeing with it** — `c6b59b5` moved the plist and the manifest to
`LandscapeLeft`/`LandscapeRight` and refuted the argument that had justified the lock, and this paragraph
kept making that argument anyway. It is recorded rather than quietly corrected because the failure is the
one this file warns about elsewhere: **the fact was changed and the reasoning resting on it was not
grepped.** The three-zone touch control is built on the landscape geometry, so a reader trusting this
paragraph would have called the layout wrong.

*The retired argument, and why it was false.* The lock was justified as fairness — that landscape hands
the player a wider field at an unchanged spawn rate. It does not. `S = min(1, min(vw,vh)/REF_SHORT)` keys
on the **short** side, so rotating trades width for height one for one:

| iPhone 17 Pro | viewport | S | world | area | spawnR |
|---|---|---|---|---|---|
| portrait | 402×874 | 0.502 | 800 × 1739 | 1.391M | 1044 |
| landscape | 874×402 | 0.502 | 1739 × 800 | 1.391M | 1044 |

(Both rows are **pre-safe-area-inset** and are left that way because the argument they serve is about
rotation, which the inset does not change — it comes off both orientations. The shipping landscape
world is **1570.7 × 800** once the housing is subtracted.)

Area-neutral and spawn-radius-neutral. **Landscape is in fact the truer shape**: aspect 2.17 against the
1.78 of the desktop window every constant here was tuned in, where portrait's 0.46 was 3.9× off.

**The scale is why one tuning pass covers the lineup.** Across iPhone 17 Pro / 17 Pro Max / 17e / Air,
every device gets a world exactly `REF_SHORT` **tall** — that is the definition of `S`, not a measurement
— by **1731 to 1739 across, an 8-unit spread of 0.46%**. Tune for one and you have tuned for all of them.

⚠️ **The `REF_SHORT`-tall half survives the safe-area inset; the 1731–1739 half does not, and has not
been re-measured.** `S` is now fitted to the **safe rect's** short axis, so `H = sh/S = REF_SHORT`
exactly, as before — measured 800.00 both with and without insets. But the width is `sw/S`, and `sw`
now subtracts a per-device inset: iPhone 17 Pro landscape goes **1739.3 → 1570.7**, and a device whose
housing is narrower keeps more. The spread across the lineup is therefore whatever the spread of their
horizontal insets is, which is a **larger** number than 0.46% and nobody has measured it. Treat the
8-unit figure as pre-inset until someone re-runs it.
Against desktop the *area* barely moves either (1.39M vs 2.07M square units).

**402px of height is the constraint every overlay has to answer, and three of them failed it.** The
menu was fixed when the lock went in; the death screen and the pause panel were not, and both were
found overflowing at the shipping viewport — death at **515px against 402**, pause at **523**. What was
past the fold: **Reforge** on the death screen, and **Quit** and **Settings** on the pause panel.

- **Both scroll, so nothing was strictly unreachable — and that is not a defence.** The rule the menu
  branch already states is that a primary action behind an undiscoverable scroll has failed at its job.
- ⚠️ **The death screen got worse the better you played.** The overflow *is* the two run logs, so more
  Overdrive rides and more Anomaly fights push Reforge further down — and a good run is exactly when you
  most want to go again. It cannot be reproduced by dying early, which is why walking the tutorial on
  the device never showed it: a tutorial death routes to `tutFinish` and has no logs at all.
- **On pause, Resume survived and the other two did not**, which is the trap in miniature — the control
  you reach for by reflex worked, so the panel looked fine.

The fix is the method the wordmark established: **find the one block taking a quarter of the screen and
shrink that**, rather than shaving every margin evenly. It was the score (116px) on the death card and
the `❚❚` glyph (84px) on pause. Both now clear a **21px** bottom safe-area inset — a real landscape home
indicator — with every control reachable, in Korean, with a new best, and with a full receipt.

⚠️ **Five inline styles had to move into CSS first**, because an inline style outranks a media query and
the short-viewport branch could not reach them. Verified layout-neutral: at 1280×800 with the branch
inactive, every moved property computes to the value it had inline.

The web manifest's `orientation` is advisory and applies only to an installed PWA; `Info.plist` is the
enforcement, and the two must agree. Both landscape variants are allowed so the notch can sit on either
hand — which is also why the touch partition is left/right rather than handed.

⚠️ `Info.plist` restates `REF_SHORT`'s **value** inside a comment explaining the orientation rule, rather
than its name. It is the numbers rule broken across a language and a directory boundary: nothing that
greps the JS will ever surface it, so changing `REF_SHORT` leaves a confident, wrong sentence behind in
a file nobody re-reads. Left in place rather than fixed here, because it is the app target's file and
this is a note, not a licence to edit it — but it is the first cross-language instance we have.
  ⚠️ **And the same hazard just fired in the other direction, in this very file** — the plist comment
stayed correct through `c6b59b5` while the MECHANICS paragraph above it went stale for five days. The
cross-language boundary is not what makes a restated fact dangerous; **being a restatement is.**

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
`P.ringMul` raises capacity, `P.moveMult` speeds the star. Measured on a Drifter at `bee3201`: the shell
settles at **145.0px** against a base **114.2**, and it turns at **1.367 rev/s against a base 0.401**. A
**full** meter is a **3.02s** ride (measured, not divided) and buys **4.12 revolutions**.

*Regime, because these are equilibria and not readings:* star pinned, one body, damage off, mean over 300
frames after a 900-frame warm-up. The settle is an **attractor** — identical to 0.1px across entry radii
60→340px, six start angles, warm-ups of 300→3600 frames, and whether the star is stationary or circling.
Star motion adds **wobble without moving the mean** (spread 0 → 31px at base as the star swings; the mean
holds at 145.0). So the shell is one number, and the radius at any given instant is not.

⚠️ **How much Overdrive widens your ring depends entirely on what is in it.** The resting ring is
**spin-limited** — every species sits at 4.8 px/frame, well under its own ceiling — while the burning ring
is **ceiling-limited**, each species riding its own `maxsp*RING_CAP*DOTSPD`. That is the whole mechanism,
and it is why the species spread exists **only** while burning:

| | resting shell | burning | Δ | ceiling while burning |
|---|---|---|---|---|
| Mini | 108.0 | 163.7 | **+55.7** | 26.00 px/f |
| Drifter | 114.2 | 145.0 | **+30.8** | 20.74 px/f |
| Brute | 116.4 | 141.1 | **+24.7** | 19.52 px/f |

**The Brute row is a repair, and the shape of the repair is the useful part.** At `bee3201` the retune left
the Brute with no widening at all — it was the slowest species, so pulling the target in took back
everything the ceiling was giving it. The fix in `ecfbdf2` raised `heavy.maxsp` 2.0 → 3.2 rather than
touching the orbit, **because the ring is not where the fault was**: the same edit is inert at rest and
inert in free flight, and only bites in the one regime that reads a speed ceiling. ⚠️ **It did not make
the Brute faster** — `maxsp` is a ceiling and pace is `seek × 6.1429`, so cruise is **0.921 before and
after**, exactly as the *Cruise* entry in the glossary insists. The measurement says the same thing from
the other side: the resting Brute shell is **116.4 before and after**, unmoved by a 60% raise of a number
that reads like a speed. **The ordering survives** — Mini 26.00, Drifter 20.74, Brute 19.52 — so the Brute
is still the slowest ring, it is simply no longer slow enough to lose the whole effect.

⚠️ **Two rigs still disagree about this table's levels, and the way they disagree is the finding.** They
agree to the decimal on everything that is not a burning settle — resting 114.2, the 20.74 ceiling — and
scatter ±2–3% with no consistent sign on burning settles. Two candidate causes were tested and **both
refuted**: not a global scale term (the signs differ), not star motion (the mean is invariant).
**But they agree on the change**: the Brute repair measures **+27.6px** here against **+27.1px** there,
inside 2%. So a *delta* from two rigs that disagree on level is trustworthy and a *level* is not — which
is why the pre-repair Brute residual is quoted nowhere. It was −2.9px on this rig and +1.3px on the other,
and **an effect smaller than the disagreement about it is not a finding.** Quote the direction, the
mechanism, and the change; do not quote the third digit of a level.

⚠️ **`P.fieldR` is no longer one of the levers.** The Field is `BASE_FIELDR` in every state; Overdrive
used to widen it too and stopped in `fbe4d18`, because a shell bulging past the rim read as unexpected
reach rather than as a faster sweep. **Nothing about the ring was retuned** — `orbR` is a fraction *of*
`fieldR`, so it fell on its own, the shell came in **from 214px to 183px**, and **the spin rose 17% for
free**. That is the v/r trade below running in the direction that pays: ring speed is pinned at a ceiling,
so pulling the orbit in returns the difference as rotation. *(Both figures are history. The coefficient
has since gone `0.72 → 0.45` deliberately and the shell is 145.0 today — this episode is kept because it
is the argument for why `fieldR` is pinned, and that argument is still load-bearing.)*

⚠️ *Three older restatements of the revolutions figure, all superseded.* It read **3.25** until the
coefficient change, **2.78** before the Field change, and before that "half a meter" when the drain was
half what it is. **Any figure quoted per *half* gauge is a figure per *full* gauge today; any 2.78
predates `fbe4d18`; any 3.25 predates `bee3201`.** Note what moved it each time: the drain, then the
geometry, then the geometry again — **the number has never once been changed by editing the number.**

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

⚠️ **Every Dot's HULL gains +3 with the Larger Dots setting on, added 2026-08-19; no collider moved.** Author: *"dart is too small. overall
Dots are quite small, i think."* … *"can it be only size gets bigger, and hitbox is old one? … reason why
it is needed is for IOS/mobile. i cant see well, but i dont want difficulty going up."* The world is in
design units and `S` scales the render, so a phone halves every hull — the Dart was 3.9 CSS px of radius,
which is the same sentence this file already carried about the deleted Mini without noticing it now
described a shipping species. The add is flat rather than proportional because the complaint is about
absolute size: it is +27% on the Dart and +13% on the Planet, and a proportional bump does the reverse.
Order and every absolute gap between species are unchanged, as is every number in `ETYPE`.

**A first pass moved the collider with it and was reverted.** That version cost +8–13% on the contact
envelope, and the author did not want the difficulty. See law 4 for the split that replaced it and for
why it became a switch rather than a constant, and `DOT_BLOOM` for why the amount is in world units
rather than screen-locked.

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

**It is telegraphed for `CROSS_TEL` = 1.2s, and until `bee3201` it was not.** The author reported it
arriving with no signal and was right. The defence in the code was the solved bearing — the arms are
rotated half a sector off your own bearing, so you always start mid-quadrant, about 1.7s from the nearest
arm. ⚠️ **That is a head start, not a signal**, and the difference is the whole entry below in *Traps*:
it only pays if you already know the shape rotates, know which arm is nearest, and happened to be looking
at mid-screen when the bodies appeared in a single frame.

**`warnSpawn` could not be used per body, so `warnForm` lets one mark own a whole formation.** Dozens of
point marks each drawing an incoming ring at 3r = 78px against 44px arm spacing (`FORM_STEP`) overlap into
a violet wall, and the *shape* — the only part worth reading — is the one thing you could no longer see.
Warning a subset is worse still: a warn owns its spawn, and half-warning a formation is exactly the
sign-without-a-body the danger-sign law forbids. **So the mark draws the shape and the mark spawns the
shape** — still one object holding both halves, still no second list that can disagree, which is the
invariant `warnSpawn` was built around, applied at the granularity the pattern actually has.

Verified at HEAD: nothing spawns on the call (one `form` warn, zero bodies), bodies land at **frame 72 =
1.200s exactly**, on **four** distinct bearings at 45/135/225/315°, **0.0000px** off-axis, with the hub
**65px** off the star = `CROSS_R0 + P.r + 20` to the pixel.

⚠️ **The body count is not a constant — it is a function of the viewport**, because the arms fill to the
far corner. Reproduced independently on two rigs, to the body:

| viewport | 800×800 | 1280×800 | 1440×900 | 1920×1080 | 390×844 *(phone)* |
|---|---|---|---|---|---|
| bodies | 64 | 84 | 92 | 116 | **100** |

**A phone gets more of the Cross than a 1440×900 desktop.** `S` is set by the *short* side, so a tall
narrow viewport is a tall design arena, and the vertical arms have further to fill. Anything that scales
per body — spawn cost, annihilation load, the argument below about marks — is heaviest on the smallest
screen.

⚠️ **And "sixty-four" was a measurement of the harness, not of the game.** `resize()` early-returns on a
zero viewport (`index.html:848`, deliberately — a 0 there would put `NaN` into `W` and poison the run),
so `W`/`H` keep their seeded `REF_SHORT` and the design arena stays a perfectly plausible-looking
**800×800 square**. That is the number a hidden pane hands you, and it is the low end of the real range.
**A wrong arena does not look wrong**; it looks square.

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

⚠️ **It is telegraphed, and it is the arrival that most needed to be.** The Drift's note says every other
spawner *"is fair by geometry (off-screen, past the corner, from an edge) and so never needed a warning."*
The Comet is off-screen too — and that is exactly what made it unfair, because at `COMET_SPD` **7.6**,
four times a Drifter's cruise, being off-screen buys about **0.2s** where an ordinary arrival gives a
second. **Distance is only fair when it converts into time.** `COMET_TEL` is 1.1s.

**One sign, not a path — and it took three shapes to get there.** The first version drew the flight
*lane*: a band at the true contact envelope with a dashed centre line, per body. It was accurate and it
was far too loud — two violet bands across most of the arena, painting over the field you are trying to
read, with the band doing the announcing for something that is not here yet. ⚠️ **A warning about a thing
that has not arrived must not cost more attention than the thing.** What a player needs is one glance —
*comets, from the right* — so the lane is gone and what remains is a **single warning badge at the border
crossing**: a rounded triangle with a bang, plus an arrow outboard of it pointing the way they travel,
trailing speed streaks.

**Only the arrow rotates.** A warning triangle is a *read*, not a vector: turned with the heading it stops
resembling the sign it trades on, and the bang inside it stops being an exclamation mark at all — upside
down on a right-to-left crossing, on its side going straight up. The arrow points **along** the heading
rather than back at the origin, because "where is it now" is off-screen and unreachable while "where will
it be" is the half you can act on.

**One sign per shower, at the mean of its members' border crossings.** Five badges within a few pixels of
each other is not five times the information — it is a smear on the edge you are trying to read, and it
collides with the HUD buttons on the right rail.

⚠️ **THE SIGN IS A TIMED OBJECT, RAISED WHEN THE PATTERN FIRES — NOT DERIVED FROM THE COMETS.** Four
versions of it flickered and every one failed the same way: the mark was **recomputed each frame from a
set that changes each frame** — which comets are alive, which are still off-screen, which group is
"first", which shower owns a side. Each fix removed one source of churn and the next frame-derived
quantity took over. There is no stable answer down that road, because the inputs are not stable.
Author: *"can we show caution sign when initiating pattern, not comet-based?"* — which is the correct
object, and a smaller one.

A **caution** is raised once, at `formComet`, with a position, a heading and a clock — the same shape as
`warnSpawn` and `warnForm`, and the third member of that family. Nothing recomputes it, so nothing can
disagree with it frame to frame. It is also the honest object: what is announced is the **pattern**,
which happens once, not the bodies, which come and go.

**One per side, by refresh rather than grouping.** A second shower entering the same border re-arms the
mark already there instead of adding one — capping the screen at four with no per-frame bookkeeping, and
true besides: two crossings from the right are one fact to the player.

⚠️ **The lifetime is solved, not guessed**, and it carries the rule the blind-gap fix exists for:
`COMET_TEL + tFirst + CAUTION_FADE`, where `tFirst` is how long the earliest-arriving member takes to
reach the border. Measured over six runs: the first body becomes visible at frame 66–93 and the caution
expires at 94–123 — the sign **outlives** visibility by ~30 frames every time.

*Measured after the rewrite,* 480 frames with ten patterns fired through one run: **max 3 signs, zero
reversals**, clears completely at the end, and **zero position changes** across a caution's 108-frame
life.

⚠️ **The lead is aimed where you were, and that is the mechanic rather than a defect.** Geometry resolves
at telegraph time, so a shower arrives aimed at the position you held ~1.1s earlier — the same *"passes
NEAR the Star rather than at it"* the aim jitter already builds in, now with a reason the player can act
on. Move once the sign is up and you have dodged; stand still and you have not.

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

**Four kinds, one verb each** — volleys · chase · ground denial · movement denial:

| | |
|---|---|
| **Emitter** | hovers and alternates a six-way **burst** (one arm leads you, the other five close your escape angles) with a sweeping **stream** of leading fans. From Epoch II it also **dashes** |
| **Sentinel** | circles the arena on a **rate that wanders**, alternating a seeker **pincer** with a rotating **screen** of five nodes on its own body. One beat, one pattern — never both |
| **Bastion** | telegraphs a collapsing charge-ring, then erupts a **radial wall with one seam** — be in the seam. Between rings it lobs **mines** onto the ground around *you*. Carries less HP: the kind that moves you rather than out-damaging you |
| **Singularity** | ambles at you forever and **throws nothing**. Breathes matter off itself with the **Wind**, then **Draws**: your top speed is capped and retreating is taxed while it closes. The field kills you, not the body. Epoch III+ |

⚠️ **The roster ceiling was PASSED, not raised, and its test is still the test.** `index.html` argued for
years that three was the ceiling — *"a fourth that fires aimed shots from a hover is the Emitter with a
gimmick bolted on, not a fight."* That is still true, and it is exactly why the Singularity **fires
nothing at all**: it adds no `lances`, so it cannot be the Emitter with a gimmick because it is not on
the same axis. The first three all ask **where are you standing** and are answered by moving; this one
asks **whether you can still get there** and is answered by the meter. **The bar is not a count** — it is
whether the new verb reduces to an existing one. A fifth has to clear the same one.

The first Anomaly of a run is always the **Emitter**, whose opening hex burst teaches the loop. Drawn
`source-over` inside the additive pass (law 12).

#### The Sentinel's two patterns, and the one beat that separates them

For most of this game's life the Sentinel had **one** firing routine and had never had more: `firePincer`
on a free-running timer, no branch, no alternation, no Epoch escalation beyond one extra Dart. It was
also the only Anomaly whose fire **never aimed** — `hexRot += 0.7` is a blind 40° precession with no term
in it for where the player is standing, while every other kind reaches for `leadAngle` or targets `P`.
The seeker's own homing hid that for months, because the missile corrects for a launch bearing that means
nothing. What it cost was the **read**: compare `fireHexVolley`'s *"one arm is for you, the other five
close your exits"*, a launch you can learn from. The pincer's told you nothing.

**The swarmer trail is gone**, and the half of its defence that sounded strongest is the half that failed
checking. It was *"half threat, half ammo — chasing it through its own trail should feed you."* But
`doSpawns` has **no boss suppression**: it runs the whole fight, already leans 65% toward the Anomaly's
opposite colour for exactly this reason, and holds the arena at `cap` bodies regardless. The trail was a
top-up on a supply that was never interrupted. As a *pattern* it asked nothing the ambient swarm was not
already asking — which is why it is out, not its cost.

**The orbit screen** replaces it. Five nodes open from the boss body out to `SCR_R` = 340px over 0.45s,
ride the boss for 3.2s, then sling off on the **tangent**. The Sentinel is the one Anomaly you have to
*close on* — a Ring only erodes it if you put the Ring between you and it — and it had nothing that
charged you for the approach. Now it does.

⚠️ **The spin-up is a real telegraph: a node cannot hit you while it is opening.** Measured over 300s the
expanding ring sweeps across the Star and deals **zero** damage doing so. The handoff is exact —
`maxRadiusWhileStillOpening` and `minRadiusOnceLive` both measure **340**, so there is no gap where it is
harmless at full size and no overlap where it is lethal while growing.

⚠️ **A hosted node is exempt from the off-screen cull, and at this radius that is load-bearing.** The
Sentinel's own arena orbit reaches `H*0.42 ± 196`, so a node 340px out swings to y = −204 and y = 876
against an 800-unit field. The generic `L.seen && !inb` rule means *"it crossed the arena and left"* —
true of every other missile, false of a node pinned to a circle on a moving boss. Measured: the old
predicate fires on **1281 node-frames per 180s**, so the screen would have visibly shed a third of itself
every revolution. Released nodes cull normally. At the original 150px radius this never came up, which is
why it had to be found by arithmetic rather than by watching it.

**It is a sweep, not a gate, and the door arithmetic says so.** `2*SCR_R*sin(π/SCR_N) − 2*r`:

| | door | reading |
|---|---|---|
| R=150, N=5, r=9 | 158px | a **gate** you time |
| R=300, N=5, r=9 | 335px | a sweep |
| **R=340, N=5, r=14** | **372px** | a sweep, wider, heavier nodes |

At 372px against a 30px Star you drive through without planning. What it buys instead is a 680px rotating
hazard covering the ground you *retreat* into. **If it should be a gate again the lever is `SCR_N`, never
`SCR_R`** — 11 nodes restores a ~164px door at this radius.

⚠️ **`SCR_W` tracks `SCR_R` and must be re-solved whenever the ring is resized.** Tangential speed is
`SCR_W*SCR_R` — the thing the player actually dodges — so widening at a fixed angular rate speeds the
sweep up *silently, in the units that matter*. 1.6 at R=340 would be 544px/s against a Star doing 372;
the screen would outrun the player, which this constant may never do. It sits at 0.62 for 211px/s.

**One beat, one pattern.** `fireT` is the kind's only firing clock and `pinLeft` says how many pincers are
owed before a screen. A screen **consumes its own duration** out of the next gap, so the beat after one is
measured from when the nodes *release*, not when they opened — it is not possible to schedule two patterns
into the same window, and no guard has to catch it later.

⚠️ **Suppression was not enough, and the metric that said it was, was measuring the wrong thing.** The
first version kept two independent timers and had the screen suppress seeker fire. That measured
*perfectly* — zero seekers born during any screen, every run — and was still wrong, because it only
stopped the pattern that had not started yet. **A seeker fired 0.2s before a screen opens is in the air
for its whole 9.6s life.** Author: *"Two patterns are done together currently."* The question was never
what the timers **allow**, it was what they **schedule**.

`pinLeft` is rolled `irand(1,3)` at spawn and after every screen, so the count is not learnable and the
opening is not fixed. The pincer still goes **first** whatever the roll — it is the kind's signature and
teaches what a seeker does before the screen complicates the read.

⚠️ **The hunt defers a screen; it never skips one.** `pinLeft` is already 0 when a screen is blocked, and
the pincer branch cannot take it negative, so the screen is the very next thing that happens once the hunt
ends. This has a measurable side effect worth knowing before you retune anything: **a deferral fires a
pincer without spending `pinLeft`**, so deferrals land as *extra* pincers. That is why the
pincers-per-screen histogram skews to 2–3 rather than sitting flat on `irand(1,3)`, why the opening
measured **1–4** across 25 spawns, and why an arithmetic estimate of seeker volume came in **12% low**.
**`SEN_PIN` must be measured, not solved.**

**Seeker tracking, and the threshold it crossed twice:**

| `seekFor` | turn authority | what changed |
|---|---|---|
| 0.85 | 160.7° | could not come about; the pincer's rear arm was an afterthought |
| 1.15 | 217.4° | past 180° — it can reverse from any bearing, so both arms went live |
| **1.45** | **274.2°** | enough left over to follow your dodge |

The 180° crossing changed the pattern's *identity*; 274° changes the **answer**. At 217° a late cut across
a seeker still beat it; at 274° there is authority to spare to follow that cut, so the honest counter is
distance again — which is the sentence `MSL.seeker` has always rested on (*"the answer is to run, not to
juke"*). **That holds only while seeker `sp` 3.3 stays under the Star's 6.2. That is the number that must
never move.** `life` did not need to change: the arc grows to 287px at full pace and 215px at Epoch I,
against budgets of 1901px and 1426px — recomputed, then confirmed with **zero** seekers reaching life-end.

**Measured — 300s, boss pinned, seeded, rAF frozen:**

| | two timers | strict alternation | **shipped** |
|---|---|---|---|
| seekers/min | 23.3 | 14.8 | **24.0** |
| screen period | 12.0s | 9.4s | **10.9s** |
| full cycle | — | 9.08s | **11.11s** |
| screen duty | 30.6% | 37.9% | **33%** |
| min gap between patterns | ~0 | 2.38s | **2.0s** |
| pincers during a live screen | — | 0 | **0** |

⚠️ **These are Epoch II figures and the rig is why.** `spawnBoss` from the seam lands in **Boss Rush**,
which pins `act=2`, so `pcad` is 0.9 rather than 0.8. Setting `__orbital.act` does not move it either —
`pace` freezes at spawn from the internal `act`. Epoch III runs the same patterns ~11% tighter on both
timers, so the duty barely moves, but **do not quote these as Epoch III numbers.**

**The bodies are cosmic, not geometric.** Emitter = a **star** (limb-darkened photosphere, granulation,
six prominences on `hexRot`). Sentinel = a **vortex** (three spiral arms, because this is the kind that
orbits you and a spiral is orbital motion made visible; two bright tips on its pincer axis). Bastion = a
**nebula** with its crown of rays kept on top, still lengthening as the nova winds up. A fourth body — a
**singularity**, the one place in this game that can hold a black fill — is written and **unreachable**:
`spawnBoss` throws on any variant not in `HUNT_SPD`, so it cannot be entered from play *or* the seam.
Giving it a spawn path is a gameplay change, not an art one.

⚠️ **The hexagon was never the telegraph its comment claimed.** The old note said the Emitter's shell
"is literally the volley it is about to throw", but `fireHexVolley` assigns `b.hexRot = leadAngle(...)`
**on the same line that fires** — it records the shot, it does not predict it. There was nothing to read
in advance, and that claim survived long enough to be repeated to the author twice. What a body actually
owes the volley is narrower: symmetry locked to `hexRot` at the moment of firing, so the missiles look
like they came out of the thing. `spawnRing` + `bossFlash` already carry the announcement.

⚠️ **Every core is built FROM the polarity colour, never decorated with it.** White appears only where it
means heat; each ramp runs white → pale `c` → `c` → darkened `c`. Verified on both poles before shipping:
**72–94%** of each core's lit pixels are dominated by the pole's own channel. A treatment that only reads
on one pole is not a treatment, it is a red drawing — which is exactly how the first attempt at a fourth
core (an aurora veil in `mix(pole, tint)`) failed.

⚠️ **Tune these at `b.r`, not at a study's radius.** The design study drew them at R=52 on a desktop
canvas; the real Anomaly is **R=37**, and the shipping WebView runs S≈0.5, so on the phone it is an
**eighteen-pixel disc**. The nebula is the lowest-contrast of the four and collapsed into "crown plus a
bright dot" at true size — it needed its base lightened, its lobes pushed and its centre knot *shrunk*
(0.36R → 0.26R, because a big white centre erases the cloud it sits in). A still at study scale cannot
tell you this.

**Its size is its hitbox** (law 4). Everything follows the one number: the star's contact envelope, the
volley and grind connect radius, the hunt's contact floor, the bounce-out push, the missile launch
offset and every shock ring.

#### The Singularity — the field is the weapon

**It throws nothing.** No missile kind, no `lances`, no new dodge vocabulary. What it does is take away
your ability to answer the ordinary field positionally, and the field does the rest. That is why it can
be cheap and still be a different fight: the death census already shows ambient Dots killing as often as
the Anomaly itself, and this kind simply removes your answer to them for a while.

**Three parts.**

- **The amble** — walks at you forever at `SING_FOLLOW` 0.9 against your 14. Not a threat on its own and
  not meant to be. It buys one thing: you are never far from it when a Draw lands, so **the Draw never
  has to teleport anything.**
- **The Wind** — one radial impulse every `WIND_EVERY0`–`WIND_EVERY1`, out to `WIND_R`, with seek
  suppressed for `WIND_HOLD`. See below for what it does and does not touch.
- **The Draw** — `DRAW_TEL` of telegraph, then `DRAW_T` of speed cap while it closes at
  `HUNT_SPD.singularity`. **Its Draw is its Hunt** — it drives `b.hunt` itself and is excluded from the
  generic hunt scheduler, because it has no station to leave.

**Contact is a rate, not a hit, and that is what makes it legal.** This kind is the only one that **does
not recoil** on touching you. The objection is to a hit you cannot answer, not to contact: at 0.9 against
your 14, walking off it is always available and always free, *outside a Draw*. Inside one it is `BOSS_DMG`
a window by design, and the answer is the Overdrive that beats the cap.

⚠️ **This used to be half of a priced pair and is now unpriced, which is a live imbalance rather than a
tidy-up.** Contact was 30 for the three older kinds and 20 here, and the split was the price of the
recoil: they land one hit and break off, so 30 was one readable hit you could have walked away from,
while an unconsumed 30 on a body that never lets go is ~37 unanswerable dps — the object that branch's
own comment forbids. On **2026-08-19 the shared number came down to 20** at the author's request, so both
arms became `BOSS_DMG` and the ternary collapsed. The recoil difference did not go anywhere. At a flat 20
the Singularity now has the **harshest** contact in the roster in dps terms — 20 per `IFRAME` window,
continuously, ≈25 dps — against three kinds that take 20 once and let go.

⚠️ **Do not fold this kind back into the recoil branch.** That half of the old instruction is now the
whole of it, and it matters more than it did: the number that used to compensate for the difference is
gone, so the recoil branch is the only thing still separating them. If the flat 20 ever needs answering,
the lever is the recoil, not the damage.

⚠️ **The amble is a steady state, not an arrival, and conflating them cost a 111px teleport.**
`stepEnemyForces` ends with `boss.y = Math.max(boss.y, 138)` once `bossTime > 1.6`, keeping the body out
of the strip its integrity bar lives in. Its comment says it runs *"once its entrance dive is done"* —
which is an **assumption about every kind rather than something it tests**. The Emitter and Bastion sit
at y≈141 by then, so the clamp is a no-op for them; a body still climbing gets snapped. Hence
`SING_ENTRY` / `SING_ENTRY_Y`, and hence the entry drives **`y` at a fixed rate rather than easing toward
the Star**: an ease has no guaranteed vertical component, so with the Star high and off to one side the
approach is nearly horizontal and can still be above the floor at 1.6s. Verified position-independent —
3.4px max frame delta at three Star positions including that worst case, floor cleared at frame 58
against a guard arming at 96.
  ⚠️ **The margin on the existing kinds is four frames.** The Emitter clears 138 at frame 92. Nothing is
wrong today and nothing warns; anything that slows the shared entrance dive reintroduces this teleport on
the kinds that have always been fine.

#### What the Wind touches, and what it does not

**Not the Star. At all.** The loop walks `enemies`, and the Star is not in that list — measured 0.0000px
of displacement at 80/200/400/550. It has no damage, no push and no speed term. It reaches you through
two indirect channels instead, and both were measured rather than intended:

| | |
|---|---|
| **your rings** | **carved, not wiped** — 16 → 3 / 7 / 6 as the front sweeps, back to 10–12 within ~1.1–1.7s. An interrupt, not a strip |
| **loose matter** | anything between it and you is carried toward you, and monotonically in distance: **371 / 306 / 235 / 92 / 79 px** at 90 / 160 / 230 / 300 / 370px from the body, against a control of 0 at every one |

⚠️ *The delivery figures are net position change over the window, not the impulse* — they include whatever
the body does after the hold expires, which is the quantity the *Measure the impulse* warning above says
not to trust as a reading of the push. They are quoted because **where matter ends up** is the thing the
player experiences; for the force itself, read the impulse table.

⚠️ **The ring is carved rather than wiped because the front is thin.** The instantaneous disc took the
whole ring at once (14 → 0); a `WIND_SPD` band takes ~50 frames to cross a ~114px orbit while the ring
spins, so Dots are cut out of it and some are already reeling back before the front has finished passing.
More of them are genuinely lost at the current strength than at the first tuning — recovery landed at
10–12 of 16 against 13–14 — which is the stronger push doing what was asked of it.

The ring ejection is a consequence of the mechanism rather than a rule: `e.flung` means *not a ring
member* by construction. `RING_GRACE` reels them back, which is what bounds it. ⚠️ **The reach test is
per-Dot, not per-player** — your rings orbit ~114px out, so the wave can clip half your ring while
missing you entirely (measured 7 of 14 at a Star standing outside `WIND_R`).

⚠️ **The Wind did almost nothing on its first build, and this file had already said why.** It added
velocity and left seek running, on an argument written into its own comment. The Fling's entry states it
outright: *"seek at zero — dead straight, or its own seek would cancel the impulse and drag it back onto
the core."* It cancelled — 14.5px at r=60, against a 26px contact diameter. The fix was to take the
existing `e.flung` path (the same idiom the boss bounce-out already uses at 0.2s), widen the reach and
soften the falloff exponent to 0.5, since a linear falloff hands a body at 0.9R only a tenth of the push.

#### The Wind is a front that travels, and that is what made it readable

**It was an instantaneous disc and nobody could read it.** Every body inside the reach moved on one frame
while a particle ring crossed the same distance in half a second beside it: cause and effect landed
together, both were over before the eye resolved either, and they came from **two different objects that
merely happened to agree**. Author: *"oh what happened?" "um it was pushed a bit i think?"*

**The front is a real quantity now** (`b.windR`, from a fixed origin), it advances at `WIND_SPD`, and the
ring is **drawn from that same number**. The wave you watch arrive is the wave that moves the body it
arrives at — the cue cannot lead, lag or disagree with the mechanic, which is the one-object rule
`warnSpawn` is built on. There is no `spawnRing` on this path any more; a second ring on its own clock is
exactly the disagreement this removes.

| | |
|---|---|
| **origin** | frozen at launch, never the live body. It ambles ~108px during the crossing, and a wave dragged behind a moving centre stops being a place something happened |
| **once per body** | the push test is the shell the front crossed *this frame*, `(prev, windR]`. The front only grows, so that band sweeps each radius exactly once — **no per-body flag, no wave id, nothing to reset** |
| **arrival** | measured on the predicted frame at every radius: 31 / 53 / 75 / 96 / 116 for d = 140 / 240 / 340 / 440 / 530 |
| **impulse** | within 1.5% of `(1−d/WIND_R)^WIND_FALL × WIND_V` at every one of those radii |

⚠️ **Measure the impulse, not the travel.** Total displacement stopped being a usable read once the push
got strong — probes reach each other and reach the Star's field, and a run across ascending radii came
back **519 / 151 / 374 / 364 / 46 px**, non-monotonic and useless. The impulse at the moment it lands is
deterministic and immune to everything downstream.

⚠️ **`WIND_EVERY` is the period, and it was not.** The countdown used to be gated on no-wave-in-flight, so
the crossing's own ~2s was charged to the cooldown and the constant named neither quantity — measured
7.45s at Epoch I against a constant reading 4.5–6.75. It runs unconditionally now. **There is still a
floor**: one front at a time, so the period can never fall below the crossing time however low the
constant goes, and below that it stops being a period at all and becomes back-to-back waves.

⚠️ **Recovery is dominated by the return trip, not by the hold.** Ring outage — front crossing to ring
restored — measured **2.20s / 3.07s / >5s** at 460 / 300 / 140px against a 1.2s window. The window was a
third of it; the rest is a body walking back the distance it was thrown. So felt recovery scales with
**travel**, and travel is `WIND_V × f(WIND_HOLD)` — *both* constants feed it, and only one of them is
also the force. Halving the hold cut the outage to **1.12 / 1.68 / 1.12s with the impulse bit-identical**.
**Do not raise `WIND_V` to win back the lost travel**: it puts the whole wait straight back. Impulse owns
strength; the hold owns time.

⚠️ **A cue drawn in the wrong direction is a lie about the mechanic, and this one shipped.** `spawnRing`'s
default closes from R to a point; only its `out` flag travels outward. So the Wind drew a ring
**collapsing onto the boss** on the exact frame it threw every Dot away from it. It was wrong twice over,
because a converging ring is **already a word in this game**: the danger sign converges onto a footprint
and the mine's arming ring closes to nothing, and both mean *something is arriving here*. The Wind was
borrowing the vocabulary of its own opposite. `drawParticles` names the right primitive in its own
comment — `out` is *"the universal read for a detonation."* The two cues are now each other's opposites,
converging for the Draw and expanding for the Wind, which is the same pairing `inhale`/`release` make in
the sound bank. **Check a new ring's direction against what the mechanic does, not against what looks
dramatic.**

⚠️ **And a cue drawn in a polarity colour claims a polarity, which this one does not have.** The front was
drawn in the boss's own hue, and it was read exactly as written — reported as pushing *"only same
color."* **It never had a colour test and never has.** Two things went wrong at once and either alone
would do it: a cyan front over cyan Dots is a low-contrast blend, so you cannot *see* the ones it moves;
and hue means polarity everywhere in this game, so a coloured wave says the colour is what it acts on.
`bomberBlast` — the game's other colour-blind area effect — had already solved this in lime and white.
The front is white now, for a functional reason rather than a stylistic one: **it has to contrast against
both colours equally, because watching a red Dot and a cyan Dot leave together is the entire cue.**
Verified colour-blind, paired probes at r=300 with the Star held outside `LIKE_GRAV`'s reach: pushed on
the same frame, travel 86.58 against 86.32.

#### The Draw's telegraph names the danger; it does not draw the mechanic

The wind-up is **the only window in which the answer is still available**, so it is the beat that most
needed a mark — before it existed the whole `DRAW_TEL` was a sound and one frame of `bossFlash`, which is
an announcement rather than a warning.

⚠️ **The first version depicted the mechanic and was unreadable.** A ring converging onto the hull with
streaks falling inward: geometrically honest, thematically exact, and useless — author, *"just give
danger sign on wind-up, not geometric lines. this is unable to understand."* The mistake is seductive,
which is why it is recorded: a mark that *depicts* feels better designed than one that merely *names*,
and depiction is the wrong job here. A telegraph is read in peripheral vision, in under a second, while
the player is tracking matter. At that budget **a symbol you already know beats a picture you must
interpret**, however accurate the picture is.

It raises the **danger badge** the Comet already established, and `dangerBadge` is now the single copy of
that shape — it was inline in `cometSign`, where only the arrow was ever comet-specific. Two hand-drawn
copies of a symbol is how `bestiary.html` went stale against `bossBody`, and a warning sign that differs
between the two things that raise it is worse than either, because the player learns a shape and then
meets a near-miss of it. No arrow: the Comet's answers *which way are they crossing*, and the Draw has no
direction to give.

⚠️ **There is no radius anywhere in it, and law 3 forces that rather than permitting it.** The Draw's
reach is the whole arena — the cap applies wherever you stand — so any ring drawn for it states a lethal
lie at every distance it is not drawn at.

⚠️ **A telegraph drawn under the thing it warns about is worse than none.** Placed with the other wind-up
logic, which runs before `bossBody`, the hull painted over it and swallowed the bang's lower half. It is
raised after the hull via a frame-local flag, so the order is explicit rather than incidental to where
the `if` happens to sit.

**The integrity bar was telling you to dodge it, and could not have been more wrong.** The Draw runs
*through* `b.hunt` — that is how `bossMove` closes at `HUNT_SPD` — so it matched the generic hunt branch
and the bar read *IT IS GOING TO RAM YOU!* through every Draw. It does not ram, and stepping aside is not
available. The variant is tested **before** `hunt` now; order is the whole fix. The wind-up gets its own
line rather than sharing the cap's, because a line that appears only once the cap is on is a report.
Both name a movement answer, which is that line's standing rule.

#### The entrance is not the amble, and conflating them cost twice

The amble is a **steady state**. It was doing arrival duty as well, and both faults it produced were
found by a player rather than by the rig.

1. **The teleport.** `stepEnemyForces` clamps `boss.y` to ≥138 once `bossTime > 1.6`, on the assumption —
   its own comment says *"once its entrance dive is done"* — that every kind has arrived by then. A body
   still climbing gets snapped: **111.6px in one frame, at exactly 1.600s.** Hence `SING_ENTRY`.
2. **The charge.** `SING_ENTRY` was clamping the *horizontal* tracking too, so the entrance closed
   diagonally at `hypot(3.4,3.4)` = **4.81 px/frame, 5.34× the amble, flat for 63 frames and then an
   instant drop.** Author: *"singularity is too fast when spawned."* Sideways is clamped to the walk now
   and the dive decays into it, giving **3.52 peak, settling smoothly**.

⚠️ **The ease span is pinned by that deadline.** A full ease across the whole descent computes to 98.6
frames and would miss frame 96, putting the teleport back. The shipped span crosses 138 at frame 62.
**Widen it and re-measure the crossing frame — do not just lower the rate.**

⚠️ **The dive drives `y` at a fixed rate rather than easing toward the Star**, because an ease has no
guaranteed vertical component: with the Star high and off to one side the approach is nearly horizontal
and can still be short of the floor at 1.6s. Verified position-independent at three Star positions.

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

⚠️ **THE HUNT TELEGRAPH IS PER-KIND, BECAUSE FOR ONE KIND OF THREE IT WAS A LIE.** The dashed line drawn
from the Anomaly to the Star is *true* of the Emitter and the Bastion — they hunt with `b.x += dx/d*s`,
literally that line, one step per frame — and it deliberately shares its grammar with the dash telegraph.
**The Sentinel never flew it.** Its branch spirals, moving tangentially the whole way, so the line
described a path it takes only at the instant it arrives. Same defect class as a hull drawn inside its
own collider, and it was the loudest, most confident mark on screen.

It now draws the **circle it is actually coming around** — radius `huntR`, centred on the Star, squashed
to 0.8 to match the ellipse `bossMove` walks, collapsing to contact. Strictly *more* information than the
line: the radius is the countdown. Verified live at `huntR` 164 against a true separation of 161.3.

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

**Mines come two ways, and the second is the Bastion's Epoch III escalation.** The **scatter** lays 2–3 at
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
constant — `resize()` gives `W = sw / S` with `S = min(1, min(sw,sh)/800)`, where `sw`/`sh` are the
viewport **minus the safe-area insets**. On a display with no insets that is the viewport itself, which
is every desktop and what the figures below were measured on; on a notched phone the arena is narrower
than the glass by the insets (see *The playfield is not the screen*). At full pace the four
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
patterns that stop *arriving* rather than arrive later — the Bastion's ring falling short of you, the
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
along. At rest they very nearly agree — 114.2 against a nominal 114 — but while burning the shell settles
**70% beyond** the target, 145.0 against a nominal 85.5. Quoting `orbR` understates every consequence of
the orbit by that much. The correction is in `index.html` at the ring-capture block, with the measurement.

⚠️ **The overshoot is not a constant fraction, and it moves the OPPOSITE way to the target.** It was 34%
when the coefficient was 0.72 and is 70% at 0.45: pulling the target *in* makes the overshoot *bigger*,
because the body's speed is pinned at its ceiling, so a tighter circle needs more centripetal force and
therefore a larger standing spring error to hold it. **Anyone who scales the old overshoot by the new
coefficient gets the wrong shell**, which is why this doc quotes two measured pairs rather than a ratio.

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

*And the overlap has since doubled, so the re-derivation held twice.* Against a Drifter the band is
`2 × (boss.r 37 + dot.r 11)` = **96px** wide, and the two shells sit **30.8px** apart at `bee3201` where
they sat 68.9 apart at the old coefficient and 99.9 before `fbe4d18`. So the bands went **disjoint → 28%
overlapped → 68% overlapped** across two changes that were about something else entirely. The conclusion
is unchanged and its margin is not: burning and base now cover nearly the same ground, which makes
*"burn to grind harder"* wrong for a nearer reason than it used to be.

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
carries it away rather than parking on you and firing, while the Emitter and Bastion sit still and shoot
you point-blank. **Hard to catch and dangerous to stand next to are different axes**, and the grind is
priced on the second. `GRIND_MULT` is an empty table on purpose — the signpost that stops this being
rebuilt.

**The baited charge is priced as a share of a bar, not as a ratio to the volley.** `CHARGE_DMG` sat at
4 × `VOLLEY_DMG` for a long time and the *ratio* was written down as the constant — but the ratio was
only ever how you reached the share at the pool of the day. When the pool was raised, the two readings
came apart: *hold the ratio* said leave the number alone, *reprice with the pool* said raise it, and
only the second was ever the point. **The share is the invariant. The ratio was a way of computing it.**

⚠️ **The ratio spent a while sitting back at 4× by coincidence, which was the worst possible outcome for
a rule that had just been retired.** Two independent decisions — raising the bait for the pool, then
raising the volley for the same reason — happened to land back on the old number. Nothing was restored
and no pin came back. **A coincidence that reproduces a discarded rule is more dangerous than the rule
was**, because the rule at least had an argument attached and the coincidence arrives looking like
confirmation. It is now 3.33×, and the hazard is spent — but the *pattern* is what this paragraph is
for, and it will recur the next time two unrelated decisions land on a round number. **Do not tidy
3.33× into anything.**

The bait is deliberately kept **short of** where it stood, because the pool went up for difficulty and
the answer to a harder fight should not undo the difficulty. It is the one erosion channel costing
**no ammunition and no Capacitor**, which makes it — with the grind — what a stripped player has left,
and the same reason `RING_GRIND_DMG` is protected from being halved.

⚠️ **The most recent trim was priced on the channel's ROLE, and it is the first move here that the pool
had nothing to do with.** The baited charge appears in no player copy, in no tutorial, and in no hint;
it is found by accident or not at all. A route almost nobody knows about must not also be the shortest
way through the fight for the few who do — so 12 went to 10 as a flat 20%, with the pool untouched.
**Read that trim in baits, not in share.** In share it is the lowest the channel has ever been. In
baits — the only unit a player can experience, since nobody spends 0.4 of a charge — it is the original
design from Epoch II onward *exactly*, and one dearer at Epoch I. Twenty percent buys one extra bait at
Epoch III and one at Epoch V; three of the five Epochs do not move at all. **A percentage and a bait
count can point in opposite directions, and the bait count is the one a player feels.**

*The ceiling that was once rejected is now the fix* — and the rejection turns out to have been invalid
from the start, which is a sharper lesson than the one recorded here before.

The value **12** was argued down for one-shotting an **Epoch I Bastion**. That fight does not exist and
never has: `pickAnomalyVariant` gates the Bastion behind `act>=2` in the repo's first commit and every
one since, `bossN===0` is unconditionally the Emitter, and Boss Rush pins `act=2`. The 11 HP figure the
rejection used needs `act=1`, which is reachable only by calling `spawnBoss` directly from a harness.

At the lowest Bastion the game can actually spawn, the value being rejected **never one-shot anything** —
it left that Bastion alive on 3 HP. So the constraint was not a constraint, the ceiling was not a
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
33.4s Bastion. Grind alone takes the Sentinel and the Bastion but **not** the Emitter, which is the kind
that hovers and shoots you point-blank; holding an orbit against it is the thing that does not work.

⚠️ **"All three" is now literally three of four — the Singularity has never been run against this, and
it is the kind most likely to break it.** No-softlock is the safety property of this whole section, and
the new kind changes both terms of it: it is the only one that walks *into* your ring shell continuously,
which should make the grind far stronger against it, and the only one that caps your speed, which cuts
how much matter you can gather between Draws. Those pull opposite ways and neither has been measured.
**Do not read the three numbers above as covering the roster.**

⚠️ *Those four results predate the pool buff and none has been re-run against it.* The pool doubled at
Epoch I, so the three times are floors rather than estimates, and **whether grind-alone still closes the
Sentinel and the Bastion is now an open question, not a recorded fact.** No-softlock is the safety
property of this whole section; treat it as unverified at current numbers until someone re-runs it.

**Purge** — destroying the boss; the word means only this. Pays score scaled by Epoch, an Integrity heal,
a Capacitor chunk, and **it sweeps the field clear**.

#### The sweep, and why it pays nothing
Author: *"let's clear the board (without score) after anomaly kill."* A white ring travels outward from
wherever the Anomaly died and every Dot it reaches dies — **no score, no Motes, no combo, no streak, no
Bomber detonation**. `stepPurgeWave` sets `dead=true` directly rather than calling `queueKill`, which is
the same construction `planetBlast` already uses and for the same reason.

⚠️ **Paying zero is not tidiness, it is the whole anti-farm argument.** A fight leaves **26–75 bodies**
standing (16 fights, Epoch I–V, repo pilot with both sides' HP pinned) — at `KILL_SCORE` 20 plus the
Motes each sheds, a comfortable multiple of the `200×act` the purge itself pays. Were the sweep to pay,
stalling a fight while the field fills would become the highest-value play in the game. Pricing the
hoard at zero means the only thing the sweep can ever buy you is safety. Verified on a controlled field
(single colour, Neutrals and Motes removed, so the sweep is the only kill path): score moved by **exactly
`200×act` and combo by exactly 0** while 33–72 bodies were erased, 7 seeds of 7.

⚠️ **THE RING IS THE KILL BOUNDARY, NOT A DRAWING NEAR ONE.** An outward ring is drawn at `R*(1−life/max)`
and the sweep kills inside `SPD*t` — the same ramp over the same `R` — so the hoop passing through a Dot
*is* what killed it. `t` is read **before** it advances, so the kill edge can trail the hoop by a frame
but can never lead it: measured across 7 purges the edge sat exactly **36.7px behind** the hoop, one
frame of travel at 2200px/s, and never once ahead. This is law 3 pointed the other way — at a mark that
promises a reach rather than a danger.

⚠️ **`PURGE_WAVE_SPD` IS A SPEED AND THE FIRST VERSION WAS A DURATION**, which is the mistake to not
repeat. A fixed 0.5s meant the sweep's px/s was whatever `R` happened to be that purge, so an Anomaly
dying in a corner swept the screen visibly faster than one dying centre-field. 2200px/s puts a typical
`R` (948–1277 on a 1280×800 arena) at **0.43–0.58 sim-seconds**.

⚠️ **THAT NUMBER WAS SIZED AGAINST A SLOW-MOTION THAT NO LONGER EXISTS**, and it is now the one figure
here with no argument under it. `slowmo(0.35, 0.7)` stretched ~0.45 sim-seconds to about 1.0s of *real*
time, and 2200 was picked so the sweep finished as normal speed returned. The author removed the dip
(see the Moment Engine table), so sim seconds are real seconds: measured, a 0.60 sim-second sweep is
**0.60s of wall clock now against ~1.15s before** — by the Moment Engine's own constants, 0.7s held at
0.35 plus a 0.295s recovery at 2.2/s banks 0.44 sim-seconds in the first ~1.0s, and the remainder runs at
full speed. So **the same sweep crosses the screen about 1.9× faster than the speed it was tuned at.** It
is left at 2200 because that is what was measured and shipped, not because the reasoning survives — if it
now reads as a blink rather than a shockwave, **lowering `PURGE_WAVE_SPD` is the fix, and ~1100 restores
the old apparent speed exactly.**

⚠️ **On a tall phone arena the sweep runs longer still**, measured **0.54–0.82s** against desktop's
0.43–0.58s: this is a *world* speed, and a 375×812 phone is 800×1732 in world units — a diagonal half
again as long. The tail of a phone sweep therefore runs at normal speed. That is the same choice `S`
forces on every other speed in the file; normalising to CSS pixels would make the sweep travel **four
times faster relative to the matter it is clearing** on a phone than on desktop. The radius is a kill
boundary, so it stays in the units the kill is in. ⚠️ **Do not "fix" the duration spread by dividing by
`S`** — the spread is the arena. Verified on the phone arena: 4 seeds of 4 clear **100%** of a 35–94 body
field, edge still trailing the hoop by exactly 36.7px.

⚠️ **THE REACH IS WHERE A BODY WILL BE, NOT WHERE IT IS, and two guesses died before that.** `max(W,H)`
misses the far corner outright (1280 against a 1509 diagonal). Furthest-body-plus-a-margin *also* missed:
`spawnStormSurge` places bodies on a `max(W,H)*0.6` circle around the **arena centre**, i.e. ~370px
outside the rect, and a surge from the storm before the fight is still walking in. Even sweeping to the
true furthest body left 2 of 32 standing at Epoch I — a Drifter at 1090 receding at 3.4px/frame gained
115px while the hoop was crossing and finished at 1205 against an `R` of 1142. **A margin cannot fix
that by being bigger**, because the escape scales with the crossing time which scales with `R`. Solve
for the meeting instead: the edge reaches a body receding at `vr` at `d*SPD/(SPD−vr)`. With that, 7 seeds
of 7 clear **100%** of the field standing at the purge.

#### What the sweep is actually worth
**The calm was never calm, and that is the finding this change rests on.** Population over the seconds
after a purge, five fights, sweep against the identical run with the sweep neutralised:

| t after purge | 0.5s | 1s | 2s | 3s | 5s | 8s | 12s |
|---|---|---|---|---|---|---|---|
| **sweep** | 0–2 | 0–4 | 2–6 | 4–9 | 6–13 | 10–19 | 19–38 |
| **none** | 32–69 | 33–72 | 29–69 | 31–67 | 31–66 | 29–67 | 30–91 |

The lower row is **flat**. `enterCalm` drops `intensityTarget` to 0.12 and the phase is named for a
breath, but it only ever stopped *adding* — the storm's field stood there through the whole calm and into
the next build. The breath now lasts about **8 seconds under 20 bodies**.

Priced in Integrity, over the 12s after a purge, 16 paired fights: damage taken falls **37.1 → 7.8**,
a paired difference of **−23.4 ±4.8 SE, t = −4.87**, negative in 14 of 16. ⚠️ **Against an A/A control,
because this rig is not fully deterministic** — the same case run twice repeats exactly 11 times in 16
and drifts on the other 5. A/A gives **−2.9 ±3.0, t = −0.99**, so the effect is ~8× the noise floor and
the noise carries no sign. Do not quote the A/B without the A/A; a naive read of a single arm would have
put the figure anywhere in the −23 to −29 band.

⚠️ **This is a second Integrity grant in all but name.** `PURGE_HEAL` gives 30 and the sweep prevents
~23 more, so a purge is now worth about **53 Integrity out of 100** — read that before tuning
`PURGE_HEAL` again. Both standing notes about it now describe only the smaller half of what a purge is
worth: `PURGE_HEAL`'s own comment calls itself *"the tuning knob of record for run length"*, and the
heal-economy section below rests the whole "is a bad Epoch recoverable" question on the +30.

#### The calm was halved, and the sweep is why
The tension this raised — an emptier stretch is exactly the complaint `enterBuild` was cut 7.4s for — was
answered by pulling the calm clock rather than by weakening the sweep. `max(6, 10 − act*0.4)` →
**`max(3, 5 − act*0.2)`**: the same curve with both terms and the floor halved, so it still flattens at
Epoch X exactly where it used to.

⚠️ **What the calm was FOR is not what its clock controls, and that is the whole argument.** It never
emptied anything — it only stopped *adding*, which is why the field sat flat at 30–70 bodies through the
entire phase (table above). The sweep delivers the emptiness now, so the clock is only deciding how fast
the field **refills**, and 6–9.6s of that is waiting rather than breathing.

⚠️ **Two floors decide the 3, and neither is taste.** Move them before cutting further: the Epoch cue is a
**2.6s** CSS animation fired one tick into the phase, so anything shorter leaves the Epoch's *name* on
screen while the build spawns into it; and `intensity` lerps at `dt*1.4`, **τ = 0.71s**, 95% closed at
**2.1s** — a calm shorter than that never reaches `intensityTarget` and the phase becomes a label rather
than a state. 3.0 clears the larger by 0.4s, and it was checked rather than assumed: intensity at the
moment calm ends measures **0.12 through Epoch VII and 0.13 at the floor**, against a target of 0.12.

**The breath survives; only the wait is gone.** Population after a purge, five fights, before and after:

| t after purge | 0.5s | 1s | 2s | 3s | 5s | 8s | 12s | 16s |
|---|---|---|---|---|---|---|---|---|
| **calm 6–9.6s** | 0–2 | 0–4 | 2–6 | 4–9 | 6–13 | 10–19 | 19–38 | — |
| **calm 3–4.6s** | 0–2 | 2–4 | 2–6 | 5–8 | 7–13 | 14–30 | 23–78 | 45–77 |

The first ~5 seconds are unchanged — that window belongs to the sweep, not to the clock — and the curves
separate only at 8s, where build's spawn rate has taken over. Time under 20 bodies falls from ~12s to
~7–8s. **Storm and build are deliberately untouched**, for the reason `enterBuild`'s own note gives:
trimming the parts where something happens answers a different complaint.

Non-boss window per Epoch, measured (calm / build / storm):

| Epoch | I | II | III | IV | V | VI | VII | VIII | IX | X | XI |
|---|---|---|---|---|---|---|---|---|---|---|---|
| calm | 5.0\* | 4.6 | 4.4 | 4.2 | 4.0 | 3.8 | 3.6 | 3.4 | 3.2 | 3.0 | 3.0 |
| build | 11.0 | 10.4 | 9.8 | 9.2 | 8.6 | 8.0 | 8.0 | 8.0 | 8.0 | 8.0 | 8.0 |
| storm | 14.7 | 14.4 | 14.1 | 13.8 | 13.5 | 13.2 | 12.9 | 12.6 | 12.3 | 12.0 | 11.7 |
| **total** | **30.7** | **29.4** | **28.3** | **27.2** | **26.1** | **25.0** | **24.5** | **24.0** | **23.5** | **23.0** | **22.7** |

\* Epoch I's calm is the 5s opener and is **not** a post-purge calm, so it is untouched — which is why
Epoch I's total is the only one that did not move.

⚠️ **Still unplayed by a human.** Whether the new pacing reads right is the same open question as before,
just at a different number; the bot dies at ~44s and never reaches a purge at all.

### What still deletes matter near an Anomaly
Worth naming, because none of it is the Anomaly's fire and all of it gets blamed on the Anomaly's fire.
**Ambient opposite-colour traffic** is overwhelmingly the answer — ordinary matter meeting matter, and it
is now the *whole* answer.

⚠️ **NO ANOMALY EMITS MATTER ANY MORE.** This paragraph used to name the **Sentinel's swarmers** as the
one boss-emitted eraser — matter rather than shots, so the colour law owned them. That trail is gone,
replaced by the orbit screen, whose nodes are **missiles**: they pass through every Dot, kill none, and
are stopped by none (law 11). So every deletion of matter *while the Anomaly is alive* is ambient traffic
or the Anomaly's own body, with nothing in between. If a future kind sheds matter again, this is the
paragraph that has to be reopened — and the boss-contact gate in `stepAnnihilation` is the code that
depends on it.

⚠️ **"While alive" is doing real work in that sentence now, and it did not used to be there.** The purge
sweep deletes the entire field the instant the Anomaly dies (see **Purge** above), so a reader counting
where matter goes across a fight has a fourth answer and it is by far the largest. The scoping still
holds — the sweep is not the Anomaly's fire, it is the Anomaly's death — but the unqualified claim it
replaces was false the moment the sweep landed.

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
Epoch 10, build at **6** — ⚠️ *not 12; that figure was the pre-`enterBuild`-cut `max(12, 19−act*0.6)` and
outlived it, `max(8, 11.6−act*0.6)` clamps from Epoch VI* — storm at 17; and the arena cap is `min(330, 40 + elapsed + act*10)`, where
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

**The lever survived having its shell pulled in.** When the eddy coefficient went `0.72 → 0.45` at `bee3201`
the suppression was re-measured in this table's own regime — *flipping every 47 frames, damage off, star
stationary, 120s runs, paired on seed, n=16*:

| | avg standing | Δ vs baseline | 95% CI | *t* |
|---|---|---|---|---|
| baseline, flipping | 35.47 | — | — | — |
| Overdrive, old coefficient | 32.05 | −3.42 | [−5.04, −1.80] | −4.15 |
| Overdrive, new coefficient | 31.79 | **−3.67** | [−5.21, −2.14] | **−4.69** |
| baseline, never flipping | 26.31 | — | — | — |

**Fully retained** — nominally 107%, comfortably inside noise, so call it unchanged. Pulling the shell in
cost nothing because the spin rose to meet it and the ring sweeps more area per second. ⚠️ **Do not
rewrite this paragraph around rotation.** The mechanism is still *acting at range*, at a shorter range;
revolutions are what compensated, not what explains it.

⚠️ **That result's first version was measured in the wrong regime, and this section's own step-function
table is what exposed it.** The harness never called `flip()` once, so a *never-flipping* arm was being
compared against *flipping* rows — which halved the effect being measured, −1.64/−1.56 instead of
−3.42/−3.67. ⚠️ **The excuse arrived before the check did:** *"different rig, so I certify the delta and
not the absolutes"* reads as rigour and was a 2.4× disagreement being rationalised rather than chased.
**A number that misses a documented one by more than a factor of two is a finding, not a caveat.**

⚠️ **The flipping / never-flipping gap in this table is not a number. It is a STEP FUNCTION in flip
cadence, and which side you are on decides everything.** Swept paired at n=10, warm-up discarded, then
spot-confirmed on a second rig:

| cadence | standing | vs never |
|---|---|---|
| never | 26.31 | — |
| every 25f | 27.44 | +1.13 |
| every 35f | 26.78 | +0.47 |
| every 40f | 26.24 | −0.07 |
| **every 47f** | **37.21** | **+10.90** |
| every 60f | 36.48 | +10.17 |
| every 100f | 33.40 | +7.09 |
| every 300f | 29.80 | +3.49 |

**Flat on both sides, an 11-point jump across seven frames between every-40 and every-47.** Variance says
the same thing: sd **0.77–1.15** below the step, **1.98–3.33** above. A second rig at n=1 per cadence
reproduces the discontinuity in the same place — every-40f `20.78` against every-47f `27.87`, **+7.09**,
with every-40f landing on `never` (20.62) exactly as it does above.

**The mechanism is in `flip()`'s own comment:** *"Hold a pole to LOAD your rings, then reverse… Quick taps
just reverse."* Below the step you are tapping and nothing loads. Above it the hungry flip fires and
throws matter outward **alive** (`e.flung`), so bodies that would have died at your core stay on screen.
**That is why slower flipping RAISES standing population** — the counter-intuitive direction this table
already showed, now with a cause rather than a magnitude.

⚠️ **So the table's `29.4` is not anomalous and must not be "corrected".** Its cadence is unrecorded, and
at every-300f the sweep gives `+3.49` against this table's `+3.2` — it is consistent with a slow cadence
and nothing about it needs explaining. ⚠️ **An earlier version of this note called 29.4 an outlier and
put the gap at 9.** Both were wrong in the same way: **one point on a step function read as a level.**
The honest statement is that the gap ranges **0 to +10.9 depending purely on cadence.**

⚠️ **`.oracle.js`'s `__pilot` flips at every 47 frames — seven frames past the step, in the high-variance
regime, effectively sitting on the boundary.** Every standing-population figure the oracle has ever
produced was taken at the least stable cadence available, and a one-frame change to that constant moves
the number by 11. **Never measure population dynamics at the pilot's default cadence.** Pick something
well inside a regime — 25f or 200f — and state which in the result.

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
  ⚠️ **A Neutral sheds one of each colour**, and that follows from what a Neutral is rather than being a
  bonus: it wears both poles and is the one Dot the colour law does not reach, so *"the colour of the Dot
  that died"* has no single answer for it. One red and one cyan is the same rule every other species
  follows, not an exception to it. It used to shed **nothing** — the other way of answering an
  unanswerable question, which made the only Dot you kill with a reversal the only Dot that paid no loot
  for it. It is also the one drop that **cannot be the wrong colour**: ordinary Motes carry the dead
  Dot's charge, so through hold-a-pole play most sit inert, while a Neutral always leaves one you can
  hoover on the polarity you are already holding.

### ~~The Wish~~ — built, measured, and taken out for tempo
**Motes banked; at a threshold the bank opened a picker by itself** — Allies, Integrity, an arena
Shockwave, a Gilded Storm — with an experience-bar gauge across the top. It worked and it was verified.
⚠️ **What it cost was TEMPO, and no threshold fixes that.** An auto-opening modal in a game whose whole
texture is continuous stops the run several times a minute; the interruption *is* the pause, not how
often it comes, so tuning the cost only changes how often you are stopped.

⚠️ **It is deleted rather than switched off, and that is this file's rule rather than a preference.**
`0b408c4` removed 245 lines of arsenal that had been "written, tuned, switched off" and stated the
principle: **git keeps them instead.** A dormant mechanic behind a false constant is exactly what that
commit exists to prevent — nothing runs it, nothing checks it, and the next reader cannot tell whether it
still works. **The working copy is `fdcafc1`**, whole and verified; `git show fdcafc1` restores it.

*Kept from that commit, because both are independent of the Wish:* the Neutral shedding one Mote of each
colour, and the Comet telegraph.

*Worth keeping if it is ever rebuilt.* The design cleared the bar `71c961e` set for this slot — "separate
outcomes, not decorate them" — where the old `mult` did not. What it never solved is **when** a choice
may interrupt a continuous game, and that is the question any second attempt has to answer first, before
any of the four effects or the pricing matter.
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
- **Achievement** — an in-run feat listed in Records. **Eleven rows, one hidden.** Each carries a name, a
  **trigger** (`.ds`, what to do) and a **flavour** line (`.fl`, the joke). Records shows the flavour
  **only once the row is earned**: unearned, a row's one job is to be legible as a goal, and a punchline
  where the instruction goes competes with it.

  ⚠️ **"Flavour only; they unlock nothing" and "nothing counts the rows" were both true and are both
  now false.** A row gates a skin, so it is a currency and every property that used to be harmless has
  teeth:

  ⚠️ *An entry dated 2026-08-10 says "the count gates the skin ladder". It does not.* Skins key on a
  **specific achievement id** (`{id:'turret', req:'turret'}`), not on `store.achv.size`. The count
  threshold was the plan and was never built, because an unused branch in a gate is a gate nobody has
  tested. Either shape makes a row a currency, so nothing below changes — but do not go looking for a
  ladder that is not there.
  - **Grants are survival-only.** `grantAchv` carries the same `!testMode && !labMode && !tutMode`
    condition as the best score and the records list — one condition, three consumers, wrong together
    or right together. Before it existed, four of the five original rows were farmable in Boss Rush
    from an endless supply of Anomalies.

  ⚠️ **The five original rows were deleted** — `firstBoss`, `combo60`, `act3`, `redline`, `lancegild`.
  They were written when a row paid nothing and it showed: most asked for a *number* rather than a
  decision, and each is now either trivial beside what replaced it or said twice — `combo60` sat under
  `wombo`'s 250 on the same line of code, `act3` measured depth that the Epoch-start ladder now owns and
  prices properly, `firstBoss` fired on the first purge every player makes. `odFrom` (charge at
  ignition) went with `redline`, its only consumer. **Old saves keep the dead ids and that is harmless**
  — Records renders from `ACHV`, so an id with no row is invisible, and nothing counts the set. No
  migration, deliberately. Measured: cold-start fingerprints are **identical** across the deletion on
  three seeds, including one that had been earning `combo60` mid-run.
  - **Anything phrased as "reach" needs the cold-start guard**, or a deep start hands it over at t=0.
    `act3` and `speedrunner` carry it; `makeawish` gets the same effect for free by keying on the
    *advance* rather than on the Epoch you are in.
  - **Adding or retiring a row is no longer a single line** — it moves the ladder's denominator.
  - Per-run counters live in one `FEAT` object with one reset, because a stale counter grants a row on
    the *next* run. ⚠️ It is not called `AC`: that name is the AudioContext, and both are top-level in
    the same script, so the collision would be a SyntaxError taking the whole file down.

### Progression
**No progression of POWER, and that is the design.** No pickups, no upgrades, no stat that carries — the
Capacitor is the only thing that accumulates inside a run and it empties every time you use it. What
improves across a run is your position and your hoard, both of which you can lose in a second.
`freshRun()` returns the same star on your first run and your thousandth.

⚠️ **This section used to open "There is none, and that is the design", and that sentence is now false as
written.** Something *does* cross the boundary: **the Epoch start**. Score thresholds unlock beginning at
Epoch II–V, and the selection persists. The rule that survived the change is the one that was actually
load-bearing, so state it as the rule rather than as an absence:

> **Unlocks may grant ACCESS. They may never grant POWER.**

A deep start moves where the Director begins counting and changes nothing about the star — same 100 pool,
same field, same two verbs. It is priced as a trade rather than a reward: you give up the early Epochs'
easy score, and you buy `200×act` purges and `250×act` Bounties from the first minute, at a difficulty
that kills faster. Whether that trade pays is a bet on your own skill, which is the only kind of
progression this game is willing to sell. **Anything proposed here later gets held against that one line**
— and the POLARIS fork stripped an XP/level/keystone/shop economy precisely because it failed it.

**Thresholds: 8,000 · 18,000 · 28,000 · 38,000**, anchored on the one human reference tape (Epoch V at
39,105) and **not** on the bot, which reaches the same depth at 475s with ~69,000 — 1.75× the time for
1.76× the score, and would have set every gate about twice too high. Retune after a playtest.

**`startActMax` is a high-water mark, not a derivation from `best`.** Erase Records zeroes `best`, and an
unlock the player earned must survive that button, exactly as achievements do.

**A deep start begins with the full late roster.** The ambient table is keyed on `elapsed`, not `act`, so
without this a cold Epoch-V start would serve the `t<20` teaching band at Epoch-V damage. `introT()`
warps only the intro *gates* — never `elapsed` — so Time Survived stays the honest number and the sim
keeps one clock. Reach-style achievements (`act3` today) carry a cold-start guard, because "reach Epoch
III" has to mean you travelled there.

### Skins
The second thing that crosses a run boundary, and the second that grants **access, never power**.

**The star is per-element. Everything else is themed. The two never overlap.** `star` has **Core** and
**Redoubt** (gated on Turret); the field is dressed by a **theme**, of which **Pixel Graphic** is the
first, declared and locked. A theme cannot reach the star, and there are no per-element categories left
for the field.

⚠️ **The line is where it is because of a measurement, and the first version of that measurement was
wrong.** Changed pixels at 874×402, across five sim states carrying 2 to 19 Drifters, control 0 in each:

| | per body | total |
|---|---|---|
| Drifter, Bead vs Plain | **88–115 px** | 225 / 336 / 669 / 1062 / 2185 over 2 / 3 / 6 / 12 / 19 bodies |
| Star, Redoubt vs Core | **312–341 px** | one body |

The star is **~3× the per-body change** (2.8–3.9 across the five), at 15 design units against the
Drifter's 11, centred, and the one body your eyes are locked to for a whole run — while a Dot is one of
dozens in peripheral vision and a Dot face may change only its **interior**. So a per-species wardrobe is
~17 face tables' work for the least visible bodies on screen, and the achievement roster (11 earnable
rows) could not pay for it. Themes get the field for one change; the star keeps the tier worth looking at.

⚠️ **This block previously quoted 102 px and ~33 px — both roughly 3× too small, from a single unrepeated
reading.** The *ratio* survived re-measurement and the decision rests on the ratio, so the conclusion did
not move; but the figures were wrong in a code comment, here, and in a commit message for a full pass.
**One reading with a passing control is still one reading.** Repeat across states before a number becomes
an argument.

**What the split buys back** is the one honest cost of the winner-takes-all tier it replaced: nobody has
to give up a look they earned in order to wear a theme. The star is *yours* in a way the field is not.

⚠️ **`OVERALL_FACE` must never carry a `star` key.** `skinPick` refuses to consult it for the star at
all, so an entry would be dead rather than obeyed — which is worse than forbidden, because it would read
as live. Verified: planting `OVERALL_FACE.pixel.star` and rendering leaves the player's pick in place.

**A category key is the thing's own name in the engine** — `star`, then the `e.type` string for every
species — which is what lets a Dot row label itself from `dot.<type>`, the table the Bestiary, the cause
line and the hit tally already read. The one place this project has been genuinely bitten by duplicated
copy is species names; the wardrobe does not become a second copy of them.

⚠️ **`DOT_FACE` starts at one species, not seventeen.** `drawEnemies` is the most heavily argued draw
code in the file, and a sweeping extraction would put every one of those arguments at risk to serve a
wardrobe. `drift` has a face table; everything else still draws inline. The contract is `STAR_FACE`'s one
level down, plus a clause the star does not need: **a Dot's silhouette is its species**, read in
peripheral vision on a screen holding hundreds of bodies, so a Dot face may not change the disc at all.
Interior only. A Drifter that stopped being a plain disc would not be a costume, it would be a new
species nobody can name.

A Dot face **draws its own core dot**, which is why `drift` joined `noCore`. Leaving the shared 0.34r
mark to be stamped on afterwards would put a fixed white dot in the middle of every future Drifter skin
whatever that skin had drawn there — a face owns the interior or it does not.

⚠️ **Nothing in the enemy pass may use a `destination-*` operator.** Bead's first version punched its
ring out with `destination-out`, which does not do what it looks like: this is the shared world canvas
with the sky already on it, so the cut goes through the sky too and leaves a transparent bite in the
field. Additive blending needs no erasing — the ring's hole is the body's own colour, never drawn over.
Negative space here means **not drawing**, which is exactly how the Planet's plate gaps work.

**A theme answers alone for the field, including where it has nothing to say** — its own face if it
supplies one, otherwise the species default. Never a per-element pick: there are none left for the field,
and reinstating one would put a hand-chosen Bead inside a pixel field for exactly the categories a theme
had not covered *yet*, so the mixture would **appear and disappear as art landed** — the worst schedule a
bug can keep.

*(A winner-takes-all tier stood here, with `elementPick` beside `skinPick` so the wardrobe could show a
suppressed pick while the field drew something else, and a `.off` card state to render it. All of it is
gone with the split: the tiers are disjoint, so what is drawn and what is stored can no longer disagree,
and two names for one answer is how they drift apart. The suppression note went too — it was shipped copy
describing something a player could watch not happening.)*

**A lock that cannot open, by construction.** `{id:'devlock', dev:true}` is an achievement with no path:
`grantAchv` refuses the id outright rather than relying on nothing calling it. "No caller today" is a fact
about one commit; a skin gated on it opens the day someone adds one. It keeps `devlock` out of Records
too — `hid` means *undiscovered*, and a row a player can never tick is not a secret, it is a bug report
with a tick box. What it buys is a skin that can ship **visible and unwearable**, which is the honest
state for art that does not exist yet. Pixel Graphic is gated on it.

⚠️ **The empty slot is a different call from the dimmed lock.** Locked skins show their art dimmed —
withholding art you *have* is a design choice this panel declines. Drawing the default star under a label
reading "Pixel Graphic" would be showing art you do **not** have, which is a picture of something that
does not exist. `skinSwatch` falls back to Core so the *field* never fails to draw; the wardrobe uses
`skinSwatchEmpty` instead, because **nothing is the only honest picture of nothing**.
They have **their own menu panel**, second in the link row so that Records and the thing Records unlocks
sit next to each other. *(They lived in a Settings row first, on "one question per surface" — Settings
answers "how does this reach my eyes and ears" and a two-item wardrobe in its own room looks like a
system pretending to be one. Moved out on the author's call.)*

⚠️ **The row could not carry the trigger, and on the shipping device it carried nothing.** A locked pill
put its requirement in `title=`, which needs a hover — so on iOS the lock read "Locked" and stopped
there, permanently. That is not a reduced version of the feature, it is the feature absent, and the
panel exists partly because a panel has room to print the sentence. **A tooltip is not a fallback on a
touchscreen; it is a deletion.** Audit `title=` anywhere it is the only copy of something.

Two calls the panel makes that the row could not:

- **Locked art is shown, dimmed, never withheld.** A cosmetic has no secret to keep and a locked slot's
  entire job is to be wanted; a grey box is an absence, and an absence recruits nobody.
- **Each slot draws itself through `STAR_FACE`.** Third caller of that seam after the field and the run
  card, which is exactly what its *parameters, not globals* note was written for. A wardrobe holding its
  own copy of the art is a wardrobe that eventually shows you a skin the field does not draw. The swatch
  is always **cyan** — the pole the colourblind palette leaves alone — so it reads identically in both
  palettes and never becomes a second, quieter statement about what colour means.

Two properties hold the category honest, and both are structural rather than promises:

1. **Draw-time only.** Nothing a skin touches is read by `step()`, so a skin cannot move a fingerprint.
   That makes the whole category testable in one assertion, and it is the assertion that ships:
   **measured, both faces produce the identical fingerprint `a17adc13`** over 1,200 seeded frames while
   `skinPick` genuinely returned different faces.
2. **The hull is not the skin's to move.** `starHull()` fills and rims to exactly `P.r`, because contact
   is `e.r + P.r` and a star drawn smaller than its collider dies before its own visible edge touches
   anything. A face owns the **interior** only, and is handed the polarity colour rather than choosing
   one.

⚠️ **Neither is a law of nature, and the code says so.** A future skin that wants its own silhouette
makes that argument *at `starHull`*, in the open, rather than by quietly drawing something else — the
door is not bolted, it has a sign on it. The one thing that is not negotiable is **hue**: colour means
polarity everywhere in this game, so a cosmetic never picks one.

**State readouts are common to every face** — the hold-charge ring, the immunity blink and the halo are
drawn outside the face function, so a skin cannot make a meter harder to read.

A selection you no longer own falls back to the default rather than failing to draw; the alternative
failure mode is an invisible star.

**What now *degrades* across a run is Integrity, and it is the only thing in the game that cannot be
rebuilt.** Removing passive regeneration turned health from a per-encounter resource into a run-long
one. That is deliberate and it is the game's second axis: score is spawn-limited and therefore very
nearly a clock (268–292 Dots/min in every condition ever measured; a flat 20 a kill), so two runs of the
same length score about the same however they were played. Remaining Integrity does not — it separates
them. The direction of the arrow is the point: a run only ever gets more fragile.

**It is also what makes a run end.** Heal income is flat at 30 an Epoch; contact damage is
`dmg × (1+(act-1)×0.08)` and never floors. Against the Brute's 18 base, **from Epoch X one contact
costs 31.0 — more than an entire Epoch's income** — and **at Epoch LVIII one contact is 100.1 and
one-shots a full pool.** Flat income against unbounded expense on a 100 pool is terminal by
construction, which is why closing the endless Epoch needed no new difficulty scalar. ⚠️ Those two
figures are arithmetic off `aDmg`, confirmed by reading `e.dmg` off freshly-spawned bodies at eight
Epochs; **where a run actually ends is not measured and this project's bot cannot measure it** — it does
not dodge, has never picked up an Overdrive, and dies before half the roster exists.

*The powerup roster was deleted rather than fixed.* Three temporary drops, of which measurement said only
**Aegis** was load-bearing (−32.8% survival when suppressed, Welch t=4.06 at n=30, against t=1.12 and
t=1.56 for the other two). Removing it cost **−23.5% survival** (34.9 → 26.7s, t=2.18, n=30) — and
**halved the variance** (sd 18.8 → 8.5), because a free shield was most of the long tail. Runs are
shorter and far more alike. See *Open* for what is meant to fill that hole. ⚠️ **Both figures now
understate the hole**: they were measured against a build that still refunded damage passively, and
removing regeneration takes survival down again from that already-lowered floor by an amount nobody has
measured. Do not quote −23.5% as though it were the current gap.

### Modes
| | |
|---|---|
| **Survival** | the real run. The only mode that can set your best score, and **the only one with no passive heal** — see *Integrity* |
| **Boss Rush** | one Anomaly always present over a **live ambient field**, cycling kinds on kill; number keys jump to a kind. Epoch pinned, intro mix skipped. Gilded Bounty suppressed. Keeps passive regeneration |
| **Pattern Lab** | a live ambient field with **no Anomaly and no Epoch phases**; number keys fire the six shapes on demand, and auto-formations are suppressed so nothing arrives unless you asked. It exists because Boss Rush structurally cannot serve it — formations are gated on not-boss, which is most of what Boss Rush is |

**Game states:** `menu` · `play` · `ready` (GET READY) · `paused` · `dead`.

### The run summary
Both panels carry score, cause, time and peak combo. Below that they now differ, and ⚠️ **the difference
is deliberate — this paragraph used to say the opposite.** It read *"the panel you read on pause and the
one you read on death are the same panel, built by one function against a different id prefix — a stat
that appears in one and not the other is a bug, not a decision."* That invariant was retired on purpose,
not eroded, and it is written down here rather than deleted because a rule this file once stated as
absolute will otherwise be re-derived by whoever notices the panels disagree.

| | |
|---|---|
| **Pause** | the Overdrive ride row and the Anomaly fight row — `showRunLogs('p', …)` |
| **Death** | the hit tally — `showHitLog()` |

**What changed the answer is that the two panels are asked different questions.** Mid-run, *how much
Capacitor have I spent* is a decision you can still act on; on the receipt it is trivia. *What has been
hitting me* is the reverse: during a run you are watching it happen, and after one it is the only thing
on the screen that the four numbers above cannot tell you. Same data, different surface, and the
surfaces are allowed to disagree — the old rule collapsed those into one question.

⚠️ **Nothing was deleted to make room.** `odLog`, `odCount`, `odTotal` and `anomLog` are still built
every run, still shown on pause, and `anomLog` still grants **Untouched**. The rows left the *receipt*;
the data did not leave the game, and a tidy-up that removes them because "the death screen no longer
uses them" breaks an achievement.

**Every row here is a log, not a total**, and that is the point of all three. Four sips and a redline is
a different run from two full burns, and the two sum to the same number — a total reports them as
identical. The row shows *shape*.

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

**The hit tally is a TALLY, not a trace** — one chip per *kind* that landed on you, counted,
most-frequent first, ties in first-hit order. `떠돌이 ×6` and `변이체 추적탄 ×7`, not a sequence of
damage numbers. The cause line already names the last hit; what this adds is the shape of the whole
bleed, and it is newly worth showing because Integrity does not come back — every hit in the row is
still on the bill at the end.

**Colour is dropped from the tally, and that is accuracy rather than brevity.** A Dot of *your* colour
passes through the core harmlessly, so every Dot that ever lands is the opposite colour by construction.
Splitting `Drifter (red)` from `Drifter (cyan)` would print your own polarity history back at you as two
species. Neutrals and the Anomaly ignore polarity anyway. This is why the tally renders through
`srcKind()` and not `srcName()` — the cause line is a *sentence* and wants the colour; a tally is a
column of nouns where the same parenthesis repeats down every row.

**It slides; it does not cap.** The tally is bounded at **15 rows by construction** — nine species plus
six missile kinds — so it can never reach the wallpaper problem `CHIP_SHOW` exists for, and a `+N` here
would hide *names*, which the total cannot reconstruct, where in a ride row it hides durations the total
already accounts for. One line, horizontally scrollable. Measured at 375px with five Korean rows:
scrollWidth 429 against clientWidth 331, one line, most-frequent chip flush at the left edge.
⚠️ **The share card is the exception and truncates at 4**, because a canvas has no scroll to offer.

**The cause line names species, never internals.** It names the Dot that killed you by display name plus
the Epoch it happened in — *Lost to Charger (red) · Epoch III*, and in Korean *빨간색 쐐기에 당함 · 3단계*.
⚠️ **The Roman numeral is English's alone.** `dead.cause` is a per-language sentence rather than one
frame with slots, so English fills `{r}` and Korean fills `{n}`; a doc that states one rendering states
half of them. The phase is **recorded but never rendered** — it is on `lastDmg` and reachable at
`__orbital.lastDmg.phase` for a harness, and reaches no player-facing surface at all. *(It sat behind a
`DEV` flag until `fbe2bd8` removed that seam; the rule is unchanged, only the mechanism.)* The Anomaly
damages you through the ordinary Dot-contact path, so it needs a `dot.*` row in `L` like everything else;
without one the receipt printed the raw internal type back at the player.

---

## Feel

- **Trauma** — screen shake. **Flash** — full-screen colour. **Hitstop** — a brief freeze-frame on big
  hits; the frame hanging is this engine's whole vocabulary for weight. **None of the three is on the
  damage path** — see *Taking damage says one thing* below. They are not one bundle, and the split is
  the grading:

  | | trauma | flash | hitstop | slow-mo |
  |---|---|---|---|---|
  | **Purge** (`killBoss`) | ✓ | ✓ | — | — |
  | **Baited charge** (`stepAnnihilation`) | ✓ | ✓ | ✓ 0.09 | — |
  | **Planet blast** (`planetBlast`) | ✓ | ✓ | ✓ 0.10 | — |
  | **Bomber blast** (`bomberBlast`) | ✓ | ✓ | ✓ 0.06 | — |

  ⚠️ **THE PURGE NOW BENDS TIME IN NEITHER DIRECTION, and the two removals have to be read together.**
  Its `hitstop=0.28` — a 17-frame stop, the largest in the file — was dropped in `6724ab2` under the
  argument that *the weight was not lost, because `slowmo(0.35, 0.7)` was still doing the same job with
  frames that keep arriving.* The author has since removed the slow-motion too, so **that argument no
  longer holds up anything: it was the justification for dropping the hitstop, and its subject is gone.**
  What carries the game's biggest event now is `trauma=1` (the largest shake in the file — no other site
  reaches 1), the full-white `flash=0.8`, `sfx.purge()`, 52 debris particles and the sweep's own
  arena-crossing ring, all in real time. If the purge starts reading light, make one of those bigger
  rather than reinstating a dip the author has now removed twice over.
  | **Shield block** (`coreHit`, body contact) | ✓ | ✓ | — | — |
  | **Anomaly arrival** (`spawnBoss`) | ✓ | ✓ | — | — |
  | **Streak milestone** | ✓ | — | — | — |

  **Exactly three things in the game stop the frame**, and all three are events *you* caused or walked
  into knowingly. A shield block and an Anomaly arriving get shake and colour but never the freeze — a
  hitstop is the loudest cue the engine has, and spending it on something that happens *to* you is how
  it leaked onto the damage path the first time. When adding a cue, read down this table rather than
  copying whichever line is nearest.

  ⚠️ **The purge was the fourth, and it was the largest: `hitstop=0.28`, seventeen dead frames.** It is
  gone, on the same brief that cleared the damage path — *no frame freeze*. What it was reaching for is
  not lost, and the distinction is the point of the new column: the Moment Engine's **dip** was already
  firing on the same line, and a dip delivers weight with frames that keep arriving where a stop
  delivers it by withholding them. Measured over the seventeen frames the freeze used to eat: **0.08s of
  sim still advances**, against **0** before. Frames a player watches resolve; a stop is indistinguishable
  from a dropped one, which is exactly the complaint the brief was written about. A purge is now the only
  entry that dips and the only one that does not freeze — read the whole row before copying either half.
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

### The sky cache

The background is painted into an offscreen canvas and blitted, not repainted per frame. It is the
cheapest change in the game's history by ratio: measured under software rasterisation at 2560×1600, **the
background was 68.7ms of a 69.3ms frame**, against **0.60ms for every enemy, mote, particle and lance on
the field together**. A full-screen radial gradient alone costs 9.35ms against 0.63ms for a flat fill of
the same area. Blitting is 0.03ms.

`paintSky` is **eight full-screen fills**, not the "gradient plus five clouds" this section said for
months: a radial base, five nebula clouds, a linear depth haze, and the vignette. At the device's
1748×804 backing store that is ~11M pixel writes per repaint, and it is why the repaint is fill-bound.

**`SKY.scale` — the cache is painted at half linear resolution and stretched back on the blit**, so it
costs a quarter of the pixels. ⚠️ **This is legal only because of what is NOT in the cache.** All eight
fills are smooth gradients with no high-frequency detail, so bilinear upscaling has nothing to destroy;
the one layer that would have shown it, the starfield, is drawn per frame *over* the cache because it
parallaxes and flows. **The first thing to move a crisp mark into `paintSky` turns this into a blur
rather than an optimisation.** Smoothing must stay on — nearest-neighbour would step the gradients.

⚠️ **Three rebuild triggers, and you must know all three before touching `easePalette`, `resize()` or the
counter.** The cache is stale-by-design, so anything that changes what the sky *should* look like without
hitting one of these draws the previous picture:

1. **`palMoving`** — set in `easePalette` from the largest channel gap the ease still has to close,
   thresholded at **half a channel**, below which the cache cannot round to a different byte and a
   repaint would draw the identical image. **The palette is the only input that can move fast**, and only
   for the ~2s after an Epoch flip, when the sky repaints *every frame* and pays the full old price.
   ⚠️ **This trigger is what allows `SKY.every` to be wide at all** — without it the counter would have to
   be pinned to the worst thing that ever happens, and an Epoch transition would visibly step.
   ⚠️ Its `= true` initialiser is **never read** and guarantees nothing: `render()` calls `easePalette()`
   and *then* `blitSky()`, and `easePalette` assigns `palMoving` unconditionally, so this frame's value
   has always replaced it before `blitSky` looks. See trigger 2 for what actually covers frame one.
2. **`performance.now()-skyPaintT >= SKY.every*(1000/60)`** — a live object (`const SKY={every:8,
   scale:0.5}`), not a bare const, and exported on the seam, so the A/B this cadence exists to settle is
   `__orbital.SKY.every=1` rather than a rebuild per data point. The shipped value is 8 and nothing in
   the game writes to it.
   ⚠️ **THE CADENCE IS WALL-CLOCK, AND IT USED TO BE A FRAME COUNT.** `SKY.every` is still *expressed* in
   60Hz frames because that is the unit it was tuned in, but the gate converts it to milliseconds.
   Counting rendered frames silently doubles the repaint *rate* — and so the fill cost — the moment the
   display runs at 120Hz, which is the exact load this cache exists to absorb. That became live when
   `CADisableMinimumFrameDurationOnPhone` was added; see *ProMotion* below.
   ⚠️ **It is `performance.now()`, NOT `elapsed`, and the distinction is the whole reason the old note
   said "FRAMES, not `elapsed`".** `elapsed` only advances inside `step()`, so an `elapsed`-based clock
   would freeze the sky on the menu, the pause and the death screen — exactly the states where `palCur`
   is still easing somewhere new. A wall clock has neither problem.
   ⚠️ **`skyPaintT` is declared at `-1e9`, and that — not anything about `palMoving` — is what makes
   frame one blit a FILLED cache**: any real timestamp clears the threshold, so the very first `blitSky`
   paints before it draws. Raise that initial value and the first frame of every run blits a blank canvas.
3. **A canvas size change**, unconditionally (`skyPaintT=-1e9`). The cache is sized off
   `canvas.width/height` (times `SKY.scale`) rather than a recomputed `W*S*DPR`, so it cannot drift out
   of step with whatever `resize()` decided.

Everything the counter *does* cover is slower than the eye: clouds 0.25 design units/frame, parallax
~0.14, breath 0.006 of a 0.9–1.05 factor, intensity 0.0007 of an alpha of ~0.04. **The picture that cost
68.7ms drifts half a device pixel per frame**, which is the whole justification.

Stars composite above the clouds rather than between them. Exact in principle — both layers use
`lighter`, which is addition, and `min(1,min(1,a+b)+c) == min(1,a+b+c)` for non-negative terms — and
near-exact in fact: of 7,500 sampled channels **three differ, each by exactly 1/255**, bounded at one
8-bit round and unable to grow.

**There is now a measured frame-rate improvement, taken on a composited rig.** 2026-08-11, iPhone 17 Pro
simulator, 874×402 CSS @ DPR 2 → 1748×804 backing, `S=0.502`, via `__orbital.probe()` writing to
`localStorage` and read back after the run (see *The frame probe*):

| arm | scene | cached frame | repaint frame | overall |
|---|---|---|---|---|
| `every=8` (ship) | menu, 0 entities | 16.8ms · 59.5fps | 27.6ms · 36fps | 56.0 fps |
| `every=8` (ship) | play, 27 entities | 16.4ms · 61.0fps | 23.1ms · 43fps | 58.7 fps |
| `every=1` (no cache) | menu, 0 entities | — | 23.8ms · 42fps | **42.5 fps** |

**The cache is worth ~13fps** (56.0 against 42.5, same scene). It also confirms the software-raster claim
that the play layer is nearly free: 27 entities on field and cached frames still held **61fps with
p95=17ms and 0.2% of frames over 20ms**. A classification check that the instrument was honest — the
ship arm's blit:cadence ratio came out **3149:450 = 7.00:1**, exactly the specified 1-in-8.

⚠️ **This does NOT close the open question, and the reason is the rig, not the number.** The simulator
composites — which was the defect that invalidated every earlier attempt — but it draws on the *host
Mac's* GPU, and the cache was bet on fill-rate-bound phone hardware. See *Open*.

⚠️ **Every earlier GPU figure remains withdrawn.** The dev pane's instrument inverts the work it aims at,
since an uncomposited pane lets the browser discard frames it never shows — each frame's opaque
background `fillRect` overwrites the last, so the sky never rasterises — while the cache canvas **is**
read every frame by `drawImage` and cannot be discarded. Under that method the optimisation measures
*slower*. **Do not quote those numbers; quote the table above and its rig.**

**What `SKY.scale` then bought, measured the same way.** The repaint premium over a cached frame fell
from **+6.7 to +10.8ms** down to **+0.8 to +1.9ms**, and a real Act transition — 149 frames caught in the
wild, against the 150 the ease was computed to take — ran at **17.0ms · 58.7fps with zero frames over
20ms**, where the same transition cost 42fps before. ⚠️ **The two pre-fix readings of the same quantity
differ by 60% (+6.7 vs +10.8ms); that spread is the honest error bar on any single run here.**

---

### The frame probe

`__orbital.probe()`, armed with `localStorage.orbitalcrash_probe='1'` and a reload. **Off by default; one
boolean test per frame when off, and it writes nothing.** It is the instrument this file spent months
saying did not exist.

⚠️ **THE ARMING IS IN `localStorage`, SO THE XCODE SCHEME CANNOT TURN IT OFF — AND THE SCHEME EDITOR IS
WHERE PEOPLE WILL LOOK.** `App.xcscheme` ships `--probe-off` with `isEnabled="NO"`, which reads to anyone
opening it as "the probe is off". It is not an off switch; it is **default hygiene** — it stops the
scheme from arming anything on every Run, and it parks the flag's name where it can be found. The flag
disarms only by *executing*, because `--probe-off` clears `orbitalcrash_probe` and a launch argument that
is unticked never runs. So the flag survives unticking it, removing it, reinstalling the app and
rebooting the phone: the key lives in the WebView's data container, not in the build.
  The sequence is **tick → Run → untick → Run**, and it is four steps rather than two because
`probeInit()` latches `PROBE.on` at boot — the launch that disarms is not the launch that comes up clean,
the next one is. `--probe` reports `recordingNow` before re-arming, so it can answer "is it still on?" at
the cost of turning it back on; follow it with `--probe-off` and one more launch.
  ⚠️ **A Release build cannot reach any of this** — the whole hook is `#if DEBUG`, while `PROBE.on` lives
in `index.html` and is not gated at all. So a profile armed under Debug keeps paying `probeSave()` every
240 frames under Release, with nothing on screen saying so and no flag available to stop it. Disarm
before switching configurations, or delete the app to drop the container.

**It records frame INTERVALS, never JS wall time**, and that is the whole design. Canvas draw calls are
queued, so timing the JS around them prices the enqueue and not the draw — the exact mistake that made
every dev-pane figure worthless and inverted the cache's result. A frame whose work overruns vsync
stretches the *next* rAF interval, and that stretch is both real and what a player feels.

Three accumulators, because the question is *which* sky path costs: `blit` (cache hit), `cadence`
(routine repaint), `pal` (repaint forced by `palMoving`, i.e. an Act transition). An interval is charged
to the frame that *started* it. Percentiles come off 2ms histograms rather than a kept sample list, and
the saved record carries the raw arrays because **every record is cumulative from boot** — a run that sat
in the menu first has both mixed in, and the menu has no Act transitions at all, which would flatter the
very comparison the probe exists to make. Histograms subtract; percentiles do not.

**On a device, run it with `--probe`.** A launch argument on the App scheme (Product → Scheme → Edit
Scheme → Run → Arguments) that reports the PREVIOUS session's record into the Xcode console as
`ORBITAL_PROBE_RESULT:` and arms the next one. Two launches by design: Run, play with nothing attached,
Run again to read it. ⚠️ **Read `recordingNow` first** — the first `--probe` launch finds the flag unset,
and `probeInit()` latches `PROBE.on` at boot, so that session records nothing however long you play it.
⚠️ **The expression must never call `probeSave()`**: at launch the accumulators are empty and the flush
would overwrite the record it exists to read, reporting success the whole way. It reads before it arms
for the same reason — `orbitalcrash_probe_out` is overwritten every 240 frames, 2s at 120Hz.

⚠️ **Attaching Safari's Web Inspector to take this reading is the same defect in a nicer UI.** It flushes
to `localStorage` and a later launch reads it, because reading it live is the load. This
is the fix this file prescribed after two rigs disagreed 4× on the same change. It works: on a packaged
WebView the record is readable straight off disk at
`…/Containers/Data/Application/<id>/Library/WebKit/<bundle>/WebsiteData/Default/*/*/LocalStorage/localstorage.sqlite3`,
as `hex(value)` decoded from **UTF-16LE** — `cast(value as text)` truncates at the first NUL and returns
`{`. ⚠️ **`console.log` from a WKWebView does NOT appear under `log show --predicate 'process == "App"'`**;
it belongs to the WebContent process. Half an hour was lost to an empty log that meant nothing.

⚠️ **`rev` is the new-code marker.** There is no build stamp in `index.html` and the device runs a
gitignored copy, so a measurement can silently price a build behind HEAD. Assert `probe().rev` before
believing any figure under it.

⚠️ **What the probe CANNOT see: anything under 16.7ms.** Vsync clamps a healthy frame to the refresh
interval, so a cached frame reading 17.2ms might have done 3ms of work or 14ms. Every "we have headroom"
claim from this instrument is really "we are not dropping frames," and the two are not the same sentence.

### ProMotion, and the frame-counted trap it exposes

`CADisableMinimumFrameDurationOnPhone` is `true` in `Info.plist`. Without it iOS clamps *all* animation —
including a WKWebView's `requestAnimationFrame` — to 60Hz, so the game would render at 60 on a 120Hz
panel no matter how much headroom it had.

**What made it safe is that the simulation is fixed-step**: `acc += dt*timeScale; while(acc>=1/60) step()`
on real elapsed time, so a faster render rate draws the same game more often rather than running it
faster. Every enemy, lance and particle motion lives inside `step()` and is therefore untouched.

⚠️ **Two things counted RENDERED FRAMES instead of seconds, and both were correct at 60 and wrong at
120** — the worst shape a bug can have, because the rig everyone develops on hides it:

- the sky cache cadence (`++skyAge>=SKY.every`) → now wall-clock, doubling the repaint rate at 120Hz
- the death shatter drift (`p.vx*=0.92` per frame in `frameBody`, the one particle path outside `step()`
  because the sim has stopped by then) → now `Math.pow(0.92, dt*60)`

**Anything added later that ticks per frame rather than per `dt` will be twice as fast on a 120Hz phone
and perfectly correct on every rig you test it on.**

⚠️ **NONE OF THIS IS VERIFIED.** The simulator takes its refresh rate from the host Mac's display, and
that Mac is a 60Hz MacBook Air — so every "60fps" in this file's tables is the *laptop's* ceiling, not the
game's. Whether a frame fits in the 8.3ms a 120Hz budget allows is unknown and unknowable here. **This
needs a real ProMotion device.** See *Open*.

### The starfield

258 → **232** stars across three parallax layers (135/70/27), thinned 10% uniformly. ⚠️ **The cut is
uniform because the RATIO between layers is the depth** — taking it out of the dense far layer would
flatten the field rather than quieten it. ⚠️ **`initStars` walks one seeded stream at six draws per star,
so changing any `n` reshuffles every layer after it.** The seed keeps the sky stable across *reloads*,
not across *edits*; a count change gives a new arrangement, not the old sky minus 26 dots.

**The thin was a look decision and bought nothing measurable, which is the point worth recording.**
Measured off the stars' own radii: 232 defined, **~101 survive the cull in a frame** (the field is padded
to W+260 × H+260, so over half sit outside the viewport), for **404 device px of ink — 0.03% of ONE
full-screen fill**, where the sky does eight. **The count was never what anything cost.**

What *did* cost was per-star bookkeeping, and it was independent of both count and brightness: the old
inner loop built a fresh `rgba(...)` string per star per frame — a `toFixed(3)`, a template literal, and
a CSS colour parse the engine cannot cache because the string is novel every time — then issued its own
`beginPath`/`fill`. **Now: colour tables indexed by alpha quantised to 1/64, and one fill per occupied
bucket.** Measured on one frame, 101 fills and 96 string allocations became **46 and zero**.

⚠️ **`moveTo` before every `arc` is load-bearing.** `arc()` draws a line from the current point to where
the arc starts, so a second arc in the same path chains to the first by a stray segment across the sky.

⚠️ **One bounded behaviour change**: subpaths inside a single `fill()` are filled once under the nonzero
rule, so two stars that overlap *and* share a bucket now blend additively once rather than twice. With
404px of stars over 1.4M px, that is a handful of pixels a session.

⚠️ **The speedup is NOT measured and this section claims none** — 101 fills to 46 is a draw-call fact,
not a frame-time result, and vsync hides anything under 16.7ms (see *The frame probe*). The change is
justified by that count and by an A/B proving the output identical: same stars, same positions, zero hue
mismatches, worst alpha error **0.00759 against the 0.00781 quantiser bound**, zero chained arcs.

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

**Nothing launches at boot. The menu always opens, and the tutorial button glows instead** (`f122816`).
Author: *"don't show tutorial as soon as game start, just highlight tutorial."* A mode that opens itself
answers a question the player has not asked — the first thing a new arrival met was a lesson about the
game rather than the game, on a screen they never chose. `.btn.tut` carries a `fresh` class while the
profile has never started a run; `refreshTutBeacon()` re-evaluates at boot and in `toMenu()`, the single
funnel for all three returns, so the pulse stops the moment you have taken the lesson rather than
persisting until reload. ⚠️ Under `prefers-reduced-motion` it is a **static tint, not a dropped signal** —
the animation goes and a background wash replaces it.

⚠️ **`tutSeen()` changed predicate with that commit, and the key did not.** `markTutSeen()` used to fire on
the boot run, so `orbitalcrash_tut` meant *"this profile has loaded the page."* It is now set by the first
run the player **chooses** to start (any mode — quitting the tutorial into a survival run still counts, or
abandoning it would re-arm the beacon forever). So it means *"this profile has played something,"* and a
visitor who opens the page and closes it still gets the nudge next time. **Same key, same name, different
question** — the kind of change a grep cannot show you.

⚠️ **The boot-time harness hazard is now gone at the source, and that is worth stating rather than just
deleting.** The old auto-start could drop a scripted pilot into a mode with the wave clock parked and
damage off, and every tape and fingerprint would have measured that instead — no error, just the wrong
game. `tutSuppressed` survives and still answers *"is this a harness"* for the beacon, but **it is no
longer load-bearing for correctness**: there is no boot run to suppress, and deleting it would cost a
cosmetic pulse on a button no harness clicks.

**Keep the timing lesson it taught, because it outlives its own hazard.** `window.__H` worked because of
*when* it existed — `.harness/preload.js` is injected ahead of the inline script. `window.__oracle` never
worked and could not: `.oracle.js` is pasted *after* load, so nothing it defines exists at boot. **A gate
that cannot fire is worse than no gate, because it looks like cover.** That applies to any future
boot-time check, and the fact that this particular one is now unnecessary does not retire the rule.

**The HUD's two stats are hidden for the whole tutorial** (`#hud.tut #score, #hud.tut #best`), and the
mode had already decided it: `store.best` and the record row are both written under
`if(!testMode && !labMode && !tutMode)`, so a tutorial's score is discarded the moment it ends. The HUD
was the last part of the game still displaying numbers the mode had opted out of keeping. The lesson does
not lose its readout — steps 2, 3, 5 and 6 each carry a progress counter in the bar's note line, which is
the number the player is actually working against.
  ⚠️ **THE CONCLUSION ABOVE IS RIGHT AND THE GUARD IT NAMES IS NOT THE ONE DOING THE WORK.** The
best-record write reads `if(score>store.best && !testMode && !labMode)` — **no `tutMode` in it**, on
both branches. What actually protects the record is an early return six lines higher in `die()`:
`if(tutMode){ endOverdrive(); killQ.length=0; tutFinish(); return; }`. A tutorial never reaches the
write at all, so nothing is discarded there — it is never attempted.
  Worth correcting because the wrong version points maintenance at the wrong line: someone greps the
condition, does not find it, and either calls the doc stale or 'repairs' a guard that was never the
mechanism. And if that early return is ever moved or removed, the protection this paragraph describes
stops existing while the condition it names still reads exactly as before. (`grantAchv` genuinely does
carry the three-way condition — see the Grants note — which is what made the wrong one plausible.)

⚠️ **It is also a collision, and the collision is the general trap: anything left-anchored in the HUD
converges with `#tutBar` as its digits grow.** The bar is centred, so its left edge is *pinned* at
`(vw − 540)/2` by the max-width cap — 63.5px at 667, 152px at 844 — while a stat's right edge is a
function of the number in it. Measured at 667×375, ko, step 5:

| | clear at 0 | first overlap |
|---|---|---|
| `#score` | 17.3px | **10** → −10.8px |
| `#best` | 25.0px | 48,320 → −8.7px |

`#score` is the worse of the two by an order of magnitude: `score += MOTE_SCORE` carries no `tutMode`
guard and step 3 asks for five motes, so **every tutorial passes 25 before halfway**, and it wears the
`clamp(28px,6.5vw,50px)` face against best's 14px. `#tutBar` is z-index 6 against the HUD's 5, so digits
are covered rather than blended.

⚠️ **The bug is landscape-only, which is exactly why it survived.** In portrait `@media (max-width:560px)`
moves the bar to `top:112px`, clear of both stats; at 667 and 844 that query never fires and `top` stays
58. iOS is landscape-locked both ways round (Info.plist), **so the orientation that hides the bug is the
one the app cannot enter** — and a portrait sweep, however careful, reports a clean layout.

Hiding was chosen over the three alternatives because it is the only one with no layout cost. Narrowing
the 540 cap buys back the wrapping the type scale just spent; moving `top` below the score's box (75.4 at
667, but **82 at 844**, where the face hits its 50px clamp ceiling) puts the bar on the star; shrinking
the score's face mid-lesson makes it change size between modes.

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

⚠️ **`env(safe-area-inset-*)` IS 0 AT `capacitorDidLoad`, AND A PROBE THAT FIRES THERE WILL TELL YOU A
WORKING FIX DID NOTHING.** `--evalJS` runs off `capacitorDidLoad`, which is before WebKit has resolved
the safe area into the document. Two snapshots from the same launch, iPhone 17 Pro, landscape:

| | `env` T/R/B/L | `#hud` | `#bestiary` |
|---|---|---|---|
| at `capacitorDidLoad` | `0,0,0,0` | `0,0,0,0` | `0,0,0,0` |
| +1200ms | `0,62,20,62` | `0,62,20,62` | `0,62,20,62` |

This cost a full rebuild-and-remeasure cycle: the safe-area fix for `#bestiary` was already correct and
in the loaded document, and the probe read `0px` because it fired too early. The near-miss is that the
reading is not noise — it is **stable, plausible, and exactly what a failed fix looks like**. Anything
measuring layout through `--evalJS` must sample on a timer (2000ms is used by the Bestiary probe), and
should carry a second sample so the two can be compared rather than trusted.
  Note this is NOT the stale-build trap: the document was fresh, verified by reading the inline `style`
attribute and the parsed `#bestiary` rule out of the loaded DOM. Both checks passed while the number was
still wrong. **Freshness and readiness are different properties and each needs its own assertion.**

### The playfield is not the screen

The canvas is full-bleed by design and the HUD is inset by `env()` — but for a long time **only** the
HUD was, and the comment above `#hud` said so as a deliberate choice: *"the playfield should reach the
physical edges of the screen; it is only the readouts and the touch targets that must not."* That was
wrong for one specific reason nobody had put a number on.

**The Star is smaller than the sensor housing.** `P.r` is 15 design units; at the shipping `S ≈ 0.5`
that is **~7.5 CSS px across**, against a landscape safe-area inset of **62 px** on each side. So
`clamp(P.x, P.r, W-P.r)` parked the ship at screen `x = 7.5` — not clipped, **47 px behind the housing,
completely invisible**. The player could not see the thing they were steering, on the one edge they get
pushed to most.

**The fix is one lever, not a sweep.** `W`/`H` are the viewport *in design units*, and the whole reason
that abstraction exists is that redefining it redefines everything downstream for free. So `resize()`
now fits `S` to the **safe rect** (`sw = vw - PADL - PADR`, `sh = vh - PADT - PADB`) and adds the inset
to the context transform as a translate. Every spawn margin, formation radius, boss lunge clamp and the
player clamp itself moved inside the safe area with **no gameplay edit at all**.

**What must NOT move is the sky**, or the fix trades the camera for a letterbox. `paintSky`, the
nebula, the starfield and the two full-screen washes are the only layers that draw against
`VX0/VY0/VW/VH` — the *physical* viewport, in the same design units, with `VX0/VY0` negative by exactly
the top-left inset. Verified by sampling the rendered canvas across the band: `[9,15,27]` at `x=2`,
`[10,17,30]` at `x=130` just inside the play rect, `[17,32,50]` at centre — a smooth gradient falloff
with **no discontinuity at the boundary**, which is what a letterbox would have shown as a hard step.

Measured, iPhone 17 Pro landscape (874×402, insets `0/62/20/62`), star driven hard into each edge:

| | before | after | safe line |
|---|---|---|---|
| `S` | 0.5025 | 0.4775 | |
| world | 1739.3 × 800 | **1570.7** × 800 | |
| star centre, left | 7.5 | 69.2 | edge lands on **62.0** |
| star centre, right | 866.5 | 804.8 | edge lands on **812.0** |
| star centre, bottom | 394.5 | 374.8 | edge lands on **382.0** |

All three land the star's *edge* exactly on the safe-area line, which is the clamp doing precisely what
it says. The cost is **the arena is 9.7% narrower** on this device — and it comes off **both** sides
even though the housing is only on one, because **iOS reports the horizontal insets symmetrically in
landscape and will not tell you which side the island is on**. Recovering that 62 px needs the native
layer to report the orientation; nothing in CSS can.

⚠️ **THE TRAP THIS CREATES IS THAT `W/H` AND `VX0/VW` ARE IDENTICAL ON EVERY DESKTOP.** With no insets
`VX0 = VY0 = 0`, `VW = W`, `VH = H`, and the translate is 0 — so a new draw call that picks the wrong
pair is *arithmetically invisible* until it reaches a notched phone. The test when adding anything to
the background layers is whether it is something you **look at** (viewport) or something you **play
against** (play rect); there is no third answer. That same identity is also the safety argument for the
change: desktop is not "probably unaffected", it is the previous build by construction, so the oracle's
fingerprints still mean what they meant. Confirmed live — `__orbital.geo` returns byte-identical values
before insets are applied and after they are removed again.

⚠️ **`__orbital.geo` EXISTS BECAUSE THE FILE IS INSIDE AN IIFE AND NONE OF THIS WAS READABLE.** `W`,
`H`, `S`, `VX0` are `let` bindings in a `(()=>{ ... })()` wrapper, so a test in the page could reach
`window.__orbital` and nothing else. Before the getter was added, the only geometry a test could see was
the transform on the canvas, and `S` and `PADL` had to be divided back out of it. It is a getter, not a
snapshot, because every field in it moves on resize.

⚠️ **`env()` HAS NO JS READER, SO THE INSETS COME OFF A PROBE ELEMENT'S COMPUTED PADDING** (`#safeProbe`
— zero-size, hidden, `padding:env(...)` on all four sides). Read fresh on every `resize()`, never
cached: they change with rotation, and per the entry above they are **0 until WebKit resolves them**,
which in the Capacitor shell is after this script first runs. A stale 0 is not an error — it is exactly
the un-inset build — but nothing would correct it on a launch that never rotates, so `resize()` is
re-run at `requestAnimationFrame`, at `load`, and at 1000 ms. It is idempotent; a redundant call costs a
transform assignment.

⚠️ **`-webkit-touch-callout` WAS MISSING AND `user-select` WAS NOT — MEASURED ON THE DEVICE, WHICH
REVERSED HALF OF WHAT WAS ASSUMED.** The double-tap/long-press magnifier was reported still live after
`bestiary.html` was hardened. Two fixes went in on reasoning alone, then both were measured in the
shipping WKWebView via the `--evalJS` seam, in the **pre-fix** build:

    label (.depthlab)      user-select=none   callout=default
    pill  (#depthPills>button)  user-select=none   callout=default
    body                   user-select=none   callout=default

- **The callout gap was real.** `-webkit-touch-callout` computed `default`, never `none`. Confirmed by
  a same-simulator A/B on two bundles differing only in that declaration: the pre-fix build raises
  iOS's action sheet on the `mailto:` link (*Email / Message / Add to Contacts / Copy Email*), the
  fixed build raises nothing at identical coordinates. That fix is proven.
- ⚠️ **The `user-select` half was fixed on a FALSE PREMISE.** The `*{-webkit-user-select:none}` rule
  was added on the argument that "WebKit's UA stylesheet gives buttons their own value, and a UA
  declaration beats an inherited one" — with 33 `<button>`s and JS-injected pills cited as the risk.
  **Inheritance from `html,body` was already reaching every one of them**, including buttons created
  at runtime. The rule changes nothing. It is harmless and kept as defence, but the reason written
  beside it was wrong, and the wrongness was invisible until something outside a desktop browser was
  asked.

**What that measurement rules out is worth more than either fix.** If `user-select` computed `none`
on every element before the change, then text selection was never possible, so the magnifier **cannot
be a text-selection loupe** — the mechanism most of the investigation assumed. Chrome agreed (0
selectable characters across all 13 overlays) and was right for a reason that could not be trusted
until WebKit said the same thing.

⚠️ **AND THE SIMULATOR CANNOT SETTLE THE REMAINING QUESTION.** The magnifier does not reproduce there
under injected touches — not on plain text, not on the `.depthlab`, not under long-press-then-drag,
**and not in the pre-fix build either**. A negative from a rig that never produced the positive is not
evidence. `simctl`'s synthetic touches do not appear to drive WebKit's text-interaction gesture
recognisers the way a finger does, so only a real device can answer it. The one thing the simulator
did answer, it answered cleanly, because there a positive control existed: the callout A/B.

⚠️ **PADDING DOES NOT INSET AN ABSOLUTELY POSITIONED CHILD, AND THE NAME "PADDING BOX" IS WHY EVERYONE
GETS THIS BACKWARDS.** An `position:absolute` child resolves against its ancestor's *padding box*, whose
edges lie **outside** the padding — so padding moves in-flow children only. Adding
`padding:env(safe-area-inset-*)` to `#bestiary` moved the `<iframe>` (a flex item, in flow) from 0 to 62px
and left `#bestiaryClose` at 16px, still under the Dynamic Island. It needed its own
`right:max(16px,env(safe-area-inset-right,0px))`. Measured, both before and after, because the wrong
version of this rule had already been written into a comment as if it were established.
  ⚠️ **That rule is no longer in this branch, and the entry is unchanged — which is the distinction worth
keeping.** It was generalised to `#bestiaryClose,#recordsClose,#skinsClose,#settingsClose` at
`max(22px,env(...))`, the panel's own margin, after the other three turned out to carry no safe-area
clearance at all. On this branch `449f641` did it; `b33d7d3` did the same on `v2` and reached here later
through the merge. So the selector and the 16px quoted above are **history rather than the current
rule** — grep `index.html` before repeating either. The mechanism did not move, and an entry whose
evidence is a measurement outlives the line it measured.
  ⚠️ **AND THE INTERESTING PART IS NOT THAT TWO BRANCHES AGREED — IT IS THAT THE DOC WENT STALE IN BOTH
BEFORE EITHER WAS RE-READ.** `449f641` and `b33d7d3` carry the CSS rule and the eight lines of prose
above it byte for byte (`md5` of the comment block: `0096d9b8…` in both) thirty-three seconds apart, and
`449f641` does not descend from `b33d7d3` — the reflog records it as a plain `commit`, not a pick or an
apply, so the text arrived by someone writing the working tree, not by git moving it. **A first draft of
this entry said two sessions had converged on the fix independently. They had not, and that version was
the flattering one** — it made the trap sound so load-bearing that two people hit it separately, which is
a nicer story than the truth and was reconstructed from nothing but timestamps.
  What actually generalises has nothing to do with sessions agreeing: **a line a doc quotes can be
replaced in more than one working tree before anyone re-reads the doc.** Checking that the quote is
current in the tree you happen to be standing in is not checking it at all.
  ⚠️ **AND `git log` CANNOT NAME THE SESSION, BECAUSE EVERY SESSION COMMITS AS THE SAME AUTHOR.** All of
`b33d7d3`, `449f641` and `af20d79` read `author=SF93`. The author and committer fields carry no
provenance here and neither does the subject line. Three instruments do carry some, and each answers a
different question:
  1. `git reflog show <branch> --date=iso` — records the *operation*, so `commit:` distinguishes a
     working-tree write from `cherry-pick:`/`am:`/`apply:`, i.e. text somebody typed from text git moved.
  2. `git merge-base --is-ancestor A B` plus a hash of the region — identical bytes with no ancestry
     link means the tree was written, not merged.
  3. `mcp__ccd_session_mgmt__search_session_transcripts` — searches *other* sessions' transcripts and
     will name a candidate outright.
  ⚠️ **THE THIRD ONE HAS A FAILURE MODE THAT READS EXACTLY LIKE EXONERATION, AND IT IS NOT "UNRELIABLE" —
IT IS MECHANICAL.** It indexes message content and tool OUTPUT. It does not index tool INPUT. So code
written through a tool call — a heredoc, an `Edit`, a `Write` — is invisible to it unless the same text
happens to be echoed back in that command's output. Verified both directions: searching `Schwerwiegend`,
which only ever exists as git's stderr, returns five sessions, so tool output is indexed; while searching
`-webkit-touch-callout`, a string demonstrably authored into `bestiary.html` by `af20d79`, does **not**
return the session that wrote it — it was written inside a heredoc and the command's own grep filter did
not echo that line. Its two hits are both sessions that were *sent a message* quoting it, neither of
which authored anything.
  So: **a hit can land on a reader rather than a writer, and a miss is the expected result for anyone who
edits through tools — which is everyone.** Its silence is worth nothing; its hits are leads. Used here it
narrowed `449f641` to a named candidate co-located in both worktrees nineteen seconds later, and that is
all it did — the field is narrowed, not closed, and no session is named in this file as the author.
  ⚠️ **AND THERE IS A SECOND COVERAGE BOUNDARY SITTING BEHIND THE FIRST: `git log -S` SEARCHES DIFF
CONTENT AND `git grep` SEARCHES FILE CONTENT, SO NEITHER SEARCHES COMMIT MESSAGES.** `--grep` does. That
is an ordinary git fact and harmless in most repositories; here it is not, because **this repo puts ten
to a hundred and fifty lines of reasoning in every commit message** — PATCHNOTE's opening says so
explicitly — which means a large fraction of the project's prose exists *only* in messages and is
invisible to both of the searches people reach for first.
  The failure it produces is specific and I walked straight into it. A transcript snippet showed a clause
that `git log --all -S` reported at **0 commits**, so it read as unpublished composition, so it read as
authorship. Every step of that is wrong: the clause is line 13 of `b33d7d3`'s *message*, `--grep` finds
it in one call, and the peer's transcript holds it because they ran `git show b33d7d3 --format=…%B | head
-60` while auditing whose commit had landed under them. **That is tool output — the half of the index
that IS covered — so the hit was a reader, exactly as the paragraph above says a hit can be.** I wrote
that rule and broke it one paragraph later, and the resulting claim named a session, in a commit, on a
public remote. Retracted in the commit that follows `0721787`; nobody has established who wrote `b33d7d3`
any more than who wrote `449f641`.
  **So the draft-versus-committed test does not work in this repo at all.** Text absent from every diff
is not thereby unpublished, and a transcript snippet that looks like drafting is *more* likely to be
someone reading a commit body than anyone composing. If you must ask whether a string was ever
committed, the answer needs `git log --all --grep` **and** `-S` **and** `git grep`, and a miss from any
one of them is not a miss.

⚠️ **A LAYOUT SWEEP MEASURES ONE VALUE OF EVERY VARIABLE IT DOES NOT SET, AND A HUD IS MADE OF VARIABLES.**
A landscape pass checked `#tutBar` against `#score`, `#best`, `#combo`, `#center` and `#pauseBtn` as
rectangle intersection — twelve cases, both languages, every step — and reported **zero collisions**. It
was true. It was also taken at `score = 0` and `best = 0`, which are the only two values of those stats
that cannot collide, because both are left-anchored and grow rightward into a bar whose left edge is
pinned by a max-width cap. The real first overlap is at **score 10**. Nothing in the sweep could have
said so: it enumerated *elements* exhaustively and *states* not at all, and exhaustiveness along the axis
you did enumerate reads exactly like coverage.
  **The check that works is a positive control** — run the same measurement with the fix disabled and
confirm it reports the failure. A verification that cannot produce a red has not been shown to detect
anything. Applied here: `.tut` removed → `hitsScore=true, hitsBest=true`; `.tut` present → both false.
  The general form, since this is the third instance in this file: **ask what the instrument would do if
the bug were present.** The sky-cache rig, the `curl`-versus-DOM marker and this one are all the same
fault — a clean result nobody could distinguish from a broken comparison.

⚠️ **A LAYOUT SWEEP MEASURES ONE VALUE OF EVERY VARIABLE IT DOES NOT SET, AND A HUD IS MADE OF VARIABLES.**
A landscape pass checked `#tutBar` against `#score`, `#best`, `#combo`, `#center` and `#pauseBtn` as
rectangle intersection — twelve cases, both languages, every step — and reported **zero collisions**. It
was true. It was also taken at `score = 0` and `best = 0`, which are the only two values of those stats
that cannot collide, because both are left-anchored and grow rightward into a bar whose left edge is
pinned by a max-width cap. The real first overlap is at **score 10**. Nothing in the sweep could have
said so: it enumerated *elements* exhaustively and *states* not at all, and exhaustiveness along the axis
you did enumerate reads exactly like coverage.
  **The check that works is a positive control** — run the same measurement with the fix disabled and
confirm it reports the failure. A verification that cannot produce a red has not been shown to detect
anything. Applied here: `.tut` removed → `hitsScore=true, hitsBest=true`; `.tut` present → both false.
  The general form, since this is the third instance in this file: **ask what the instrument would do if
the bug were present.** The sky-cache rig, the `curl`-versus-DOM marker and this one are all the same
fault — a clean result nobody could distinguish from a broken comparison.
  ⚠️ **AND THE FOURTH INSTANCE WAS COMMITTED BY THE SESSION THAT PORTED THIS ENTRY, FOUR COMMITS LATER.**
Sweeping the same bar against `#score` I enumerated six steps by five scores, felt thorough, and pinned a
third variable I never noticed I was setting: the number's **rendering**. The rig wrote the digits as
`String(v)`; the HUD writes `score.toLocaleString()`, so the four-digit column measured `1000` where the
game shows `1,000`. That separator is worth ~10px and it flips two cells from clear to overlapping —
steps 2 and 6 went +1.6 and +5.5 to **-8.8 and -4.9** — which falsified the headline ("only step 5
collides") while leaving the conclusion the fix rested on untouched. **Six-by-five is what made it feel
like coverage**, which is this entry's own thesis arriving one layer lower: not an un-enumerated axis
this time, but a variable that does not look like one because the *product* sets it, not the test.
  **The general form: ask what the product does to your value between the variable you set and the
pixels you measure.** `toLocaleString`, `text-transform`, `font-variant-numeric:tabular-nums`, `Intl`
anything, a template that pads or truncates. A sweep sets the variable and trusts the render.
  ⚠️ **What caught it was a margin, not care — and the margin is the reusable part.** One cell read
**+1.6px clear**, on a step nothing depended on, in a table I had already committed. Nothing flagged it;
it was simply too tight to be a coincidence next to neighbours in the tens. **A margin that small is a
measurement asking to be re-run** — probe the boundary rather than trusting the sample, because a sweep
reports the columns you chose and says nothing about where the sign changes. First-overlap-by-step took
one more call than the table did and is the form that cannot hide a flip between columns.

⚠️ **THE GAME'S OWN SERVICE WORKER SERVES A STALE BUILD TO EVERY RELOAD, AND A CACHE-BUSTING QUERY DOES
NOT HELP** — the worker answers the request before the network sees it. Three reloads of a genuinely
edited file measured the *old* strings; `sw.js` had registered, was controlling the page, and was serving
`orbital-crash-v2` from cache. **Every figure in this file taken after a reload is exposed to this.**
  What caught it was a **new-code marker**: the rig refuses to run unless an identifier the change
introduces is present. That is now standing procedure alongside muting, and it is cheap — one lookup. Note
what saved it here was luck about the *kind* of change: the stale values were strings and appeared in the
output. **A physics change returns clean, plausible numbers about the wrong build and says nothing.**
Unregister the worker and clear `caches` in any rig that reloads.
  ⚠️ **AND THE MARKER HAS TO BE READ FROM THE LOADED DOM, NOT FROM DISK OR FROM `curl`.** A later pass
checked the served file with `curl | grep` — correct, fresh, reassuring — while the browser held a
document three edits old, because `navigate` to *the URL already loaded* is a no-op and the worker had
the rest. Server-side truth and browser-side truth disagreed for three rounds and the rig believed the
half that agreed with it. The assertion that works is
`document.documentElement.innerHTML.includes('<marker>')`, plus a distinct query string to force a real
navigation.

⚠️ **A HIDDEN BROWSER PANE FREEZES CSS ANIMATIONS, AND A FROZEN FADE-IN RETURNS A FULL TABLE OF
PLAUSIBLE FAILURES.** The menu fades in from `opacity:0`; with the pane hidden the animation never
advances, so every element in it composites at zero alpha and a contrast sweep reports **exactly 1.00
for all 14 rows** — ink equal to backdrop, top to bottom. That is not a crash and it does not look like
one; it looks like a screen with a catastrophic legibility problem, and the temptation is to start
fixing colours. Same family as the rAF stall behind canvas pixel sampling, and the fix is the same
shape: **drive the state, do not wait for it** — `document.getAnimations().forEach(a => a.finish())`
before reading. Taking a screenshot also un-hides the pane, but only until the next call, so it fixes
the reading you are looking at and not the next one.
⚠️ **A COMPOSITED-BACKDROP CONTRAST SWEEP IS ONLY AS GOOD AS ITS PAINT ORDER, AND GETTING THAT WRONG
RETURNS CONFIDENT FOUR-FIGURE NUMBERS.** The sweep built for `#menu` walked art → `#menu` radial →
`#menuScrim` → element background and reported the four entry links at **18.2–19.7:1**, "already at the
ceiling". They were grey on screen, and the author said so twice. `#menuScrim` is
`position:absolute; z-index:0`, and **a positioned element — even at z-index 0 — paints in a later layer
than a non-positioned block**, so for `.refs`, `.titlewrap`, `.btn` and `.doors` the scrim is in FRONT.
They were being read through up to 94% black. The sweep measured an assumption about stacking, not the
screen.
  Three things fall out of it, and the second is the general one:
  - **Before compositing anything as a backdrop, check `position` on every layer between the glyph and
    the background.** `static` content sits BELOW any positioned sibling regardless of z-index. In this
    file that is exactly why `.contact` and `.langsel` (both `position:absolute`, both later in the DOM)
    were the only menu text whose numbers were ever honest — and their apparent brightness *exceeding*
    that of lighter-coloured text was the contradiction that should have ended the enquiry immediately.
  - **A rendering question is settled by the render.** Paint a few elements `#ff0000`/`#00ff00` inline
    and screenshot; a pure primary coming back muted is proof of a wash that no colour arithmetic can
    explain away. And note `getComputedStyle` reported the ORIGINAL colour for elements carrying an
    inline red — stale computed style in a hidden pane (see the animation trap above) — so the DOM was
    lying at the same time. The screenshot was the only witness left.
  - **The sweep can only composite `backgroundColor`.** Text on a **gradient** fill (the primary button,
    the ON language pill) is measured against the art behind the pill and comes back ≈1.0 — which is
    indistinguishable from the frozen-animation case above. Flag those rows `n/a` explicitly rather than
    letting them sit in the results as findings.
  ⚠️ Screenshots have their own floor: at `dpr:2` the pane returns a ~0.51 downscale of the framebuffer
for a normal viewport, which greys thin text on its own and hides the very effect being hunted. Drop the
viewport until the returned image is 1:1 device pixels (≈400px wide here) before judging any small text.

⚠️ **QUIET IS A RANK, NOT A LUMINANCE — and `--dim` is doing TWO JOBS.** It was drawn for text that sits
beside the thing it labels, where a lit neighbour carries the contrast. That is true over the
**playfield** (`.stat .k`, `#combo`, `#time`, `#best .v`), where it is also right that the HUD recedes.
It is false inside a **panel**, where there is no live game and no lit neighbour and the same value is
just grey on black: the Settings descriptions and switch labels measured **4.59:1** at 11.5px, clearing
the 4.5 floor by four hundredths. `--dim2` (`#8494ba`, ~6.7:1 on a panel) is the rung for that job.
  **Split it by scope, never lift it globally.** `#records,#skins,#settings,#bestiary{--dim:var(--dim2)}`
— a custom property on an ancestor wins for its descendants regardless of source order, so this needs no
`!important` and cannot reach the HUD. `#pause` and `#dead` stay out: both sit over a live run. Two
places cannot be reached this way and must be written out — `.depthlab`/`.dp`, which live on `#menu`,
and **bestiary.html, which is a reading room inside an iframe** where no parent rule applies and the
value has to be duplicated as a literal.

⚠️ **AN `opacity` MULTIPLIER ON A DIM TOKEN IS NOT A QUIETER RANK, IT IS AN UNREADABLE ONE — and every
instance in this file measured WORSE than the raw token it started from.** Four were found:
`.skinreq` `--dim`×.72 → **2.86:1**, `.skincat` ×.75 → **3.01**, `.depthlab` ×.75 → **3.01**, `.acvfl`
×.85 → **3.58**, against a raw `--dim` of 4.59 and a floor of 4.5. `.skinreq` composited to
`rgb(96,108,138)`, literally darker than the token, on the line that tells you how to unlock what you
are looking at. **The tell is the pattern, not the number: `color:var(--dim)` and `opacity:<1` in the
same rule is always worth measuring.** Keep the multiplier only where some *other* property already
carries the rank — `.acvfl` keeps .85 because italic and size separate it anyway — and never where it
is the sole distinction, because then it is buying a rank with legibility.

⚠️ **When raising a text, check the ORDER it lands in, not just its ratio.** The menu is composed so
exactly two things look pressable. The two corners were lifted to 6.1–6.6:1 and deliberately left under
ORBITAL at 7.92 and under every control. A fix that clears the floor and outranks a button has traded
one defect for a quieter one.

⚠️ **A `display:none` control hides its own defects.** `.depthlab` sits at 3.01:1 and appears in no
screenshot, because `#depthSel` is hidden until a second Epoch is unlocked — so the first time it is
seen is the moment it is earned. The same blindness put the Epoch picker in the wrong grid cell earlier
(`f3d8984`). **Audit hidden UI by unhiding it, not by reading the layout you can see.**

⚠️ **`e.seek=0` DOES NOT MAKE A DOT INERT — it silences one colour and not the other, and so manufactures
a colour asymmetry in any test looking for one.** Seek is the opposite-colour approach; `LIKE_GRAV` is a
separate force on *same*-colour matter and keeps running. Three runs of a colour test showed same-colour
probes moving 30+ frames before the wave reached them, once inward and once outward, and the cause was
the Star's own pull — plus the Star not being where it was put, because `stepPlayer` clamps it into the
arena and a "park it at 2400,2400" had landed it beside the boss. **Put the Star outside `LIKE_GRAV_R`
and assert where it actually ended up**, or a colour test measures the Star.

⚠️ **PROBES ON ONE RAY SHOVE EACH OTHER.** A push measurement across ascending radii had the r=240 probe
never move at all: a pushed inner probe had shouldered it outward ahead of the front. Same-charge shove is
positional (law 13) and does not care that you are running an experiment. Separate probes angularly, or
run one at a time.

⚠️ **A HARNESS THAT CALLS `spawnBoss` DIRECTLY IS NOT IN A BOSS FIGHT, and it will agree with itself
while it tells you nothing.** `bossTime` advances inside `director()` — the boss-phase branch and the
Boss Rush branch — so a rig that spawns a boss by hand never accumulates it and never arms anything gated
on it. That includes the HUD floor clamp, which fires at `bossTime > 1.6`. A kind whose entrance was too
slow for that clamp traced a **perfectly smooth walk** across every measurement taken this way, eight
runs of it, and teleported 111px on the first frame a human watched it. The rig was measuring a state the
game does not run in — the same family as *a constraint derived from a state the game cannot reach*, and
worse in one respect: that one produces a suspicious number, this one produces a **clean** one.
**Anything gated on `bossTime`, `wavePhase` or the Director's own state is invisible to a direct spawn.**
Drive it through `beginTestRun`, or advance the gate yourself and say that you did.

⚠️ **The fingerprint rig invents regressions if you reuse a dirty page.** Re-running the eight-config
comparison inside a page instance that had already spawned bosses, forced renders and pinned HP reported
**all 8 MOVED**. On a fresh load with `store.achv` restored per run, all 8 were bit-identical. `.oracle.js`
restores `achv` per run for exactly this reason and the note there says why; the lesson generalises past
achievements to any run-scoped state. **A red suite from a page you have been poking is not evidence.**

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

⚠️ **`git add <path>` takes every hunk in that file, including the other session's.** Sessions share this
checkout and the game is one file, so an in-progress edit belonging to someone else gets swept into your
commit whenever they happen to be mid-pass. **Five times now.** Once it shipped a half-done CSS rename:
`.acv` defined in the stylesheet while the builder still emitted `class="cxa"`, so the achievement rows
rendered with no rule behind them for ~50 minutes.

⚠️ **It is not an `index.html` problem, and writing it as one is what let the last two through.** The
most recent pair — `7445900` and `d8389b9` — swept a docs session's `MECHANICS.md`, `GLOSSARY.md` and
`PATCHNOTE.md` edits along with the game. Nothing broke, which is precisely why it is worth its own
line: **the failure this entry names is loud and the same command's quiet form is a docs commit that
silently carries somebody's half-written paragraph.** The rule is per *contended file*, and every file
in this repo is contended.

**Know your changed-line count before you stage, and check it against `git diff --numstat`.** A
comparison, not a review — "inspect every hunk" is what nobody does under time pressure.

⚠️ **ASSERT THE DIFF IS NON-EMPTY BEFORE READING IT AS CLEAN, because a wrong path fails as silence.**
`git diff -- orbital-crash/index.html` from inside `orbital-crash/` matches no file — the repo root *is*
that directory. Measured on a file with real changes: the wrong path gives `''` and `--quiet` exits
**0**; the right path gives `3 1 docs/MECHANICS.md` and exits **1**. **Empty output and exit 0 are what
"your tree is clean" looks like**, so the guard reports success *by failing to run* — worse than skipping
it, which at least leaves you uncertain. A `git status` line with no matching diff line is the tell.

⚠️ **Paste the number, never recall it.** Both sessions have published a numstat no terminal ever
printed — `34 0` against a real `32 0`, `23 0` against `22 0`, `22 insertions, 6 deletions` against
`13 2` — **twice each, and twice inside commits whose own subject was about not asserting what you have
not run.** A sentence that wants a figure will accept a remembered one, and nothing looks wrong
afterwards. The strongest form is a **parity check**: one-for-one string replacements *cannot* produce
unequal insertions and deletions, so any asymmetry is somebody else's work — the commit that caused the
rename breakage read `19 15` where twelve one-line swaps could only be `12 12`, and the pre-commit
`--stat` had already printed it. ⚠️ **One direction only:** equal counts prove nothing, because a
balanced foreign hunk hides inside yours.

⚠️ **`git commit <path>` commits the WORKTREE version of that path, not the staged one — so in a shared
checkout it sweeps, it does not isolate.** This was proposed in good faith as the safe one-command way to
land your own staged work while a peer had uncommitted edits in the same file, and it is the opposite.
Both sessions then described it wrongly from memory, in opposite directions, until it was actually run:

```
staged:   +PEER_STAGED          unstaged: +MY_UNSTAGED
git commit -m msg f.txt
committed:  base PEER_STAGED MY_UNSTAGED     ← BOTH. Nothing dropped, everything taken.
```

It commits what is *on disk* for that path, which in a contended file is by definition both people's
work. ⚠️ **The path form's danger is that it reads as narrowing** — naming one file feels like restraint,
and it silently widens from the index to the worktree. **Ordinary `git add` then `git commit` is the
safer pair**, because `add` snapshots at add-time and `commit` ships the index, so a peer's later write
is not eligible; that is what saved `8429887`.

**For real isolation, build the staged content instead of staging the file**: back the tree up, write
HEAD-plus-your-own-change to disk, `git add` that, restore the backup, `cmp` against it. It saved ~130
lines of an unfinished Codex removal the first time it was used under pressure. Two limits:

- ⚠️ **The strip script must fail closed.** Exit non-zero unless it finds *exactly* the occurrences it
  expects. A replacement that silently matches nothing stages HEAD verbatim — a normal-looking commit
  containing none of your work.
- ⚠️ **It is not a lock.** The tree is briefly the filtered copy, so a concurrent write in that window is
  lost to the restore. `cmp` after restoring is the only thing that tells you nothing was.

⚠️ **`git checkout -- <file>` sweeps the other way, and that direction has no recovery at all.**
Everything above is a commit taking someone's work **in** — a bad commit, which can be amended. This
takes it **out**: no reflog entry, no stash, no dangling object, nothing `git fsck` will surface, because
content that was never staged never entered the object database. It happened on 2026-08-08, run casually
as a cleanup while two sessions had uncommitted changes in `index.html`, and it took a graze removal and
a sky-cache optimisation with it. The graze was reconstructible only because its author still had every
edit in context and rewrote it from scratch within minutes; the sky cache came back only because that
session happened to be holding an unrelated `mine.patch` from a diff-filtering step minutes earlier.
**Ten minutes sooner and it was gone. That is luck, not process, and it must not be written down as a
procedure.**

⚠️ **Do not run a tree-mutating git command in this checkout at all** — `checkout --`, `restore`,
`reset --hard`, `clean`. The first draft of this entry said "run `git status` first," which is not good
enough: the operator *did* have the information and read it as success. (`git stash` is a different
case — it stores what it removes.)

⚠️ **The tell is a `git status` showing FEWER modified files than you expect, and it is the only trap in
this file caught by an absence.** Discarding your own work is a decision; discarding it out of a file two
other processes are writing is the same keystroke, and git reports success either way — the operator's
status went from `M index.html` to clean and read as the command having tidied up. **Every other trap
here is caught by something appearing that should not be there. Absence is what nobody scans for.**

**So: in a shared tree, committing is the only durable claim on your own work.** What saved one side was
committing within three minutes of noticing; what lost the other was not having. Announcing a file, as
this repo does, coordinates *edits* and does nothing about *reverts* — **the revert does not read the
announcement.** Land small commits early rather than holding a clean one.

⚠️ **When a check returns a suspiciously clean result — in either direction — verify the comparison
before you verify the finding.** A check has two halves: what it compares and what it concludes, and
only the second one gets read. Three specimens from one day, all sound in method and wrong in target:

- A pixel A/B reported **all 4,096,000 channels identical**. `navigate` was silently no-oping, so both
  captures read the same page.
- A GPU timing loop reported a **2.2× speedup**. It was one ~80ms readback stall divided by batch size;
  sweeping the batch collapsed "cost per frame" from 81.7ms at *M*=1 to 1.36ms at *M*=90.
- A PATCHNOTE coverage sweep reported **all four** entries missing, minutes after they were written.
  `git rev-list` emits 40-character SHAs and the entries cite 7 — a comparison between two different
  alphabets, which can only ever return "no match."
- A test written to prove the sky cache repaints after a size change blanked the canvas with
  `c.width=c.width`, which assigns the *same* value — so the `skyCv.width!==canvas.width` branch never
  fired, the cache was never reallocated, and what the author watched "prove" the mechanism was an
  already-good cache being blitted. **It passed. It proved nothing.** ⚠️ **A test that operates on the
  wrong buffer confirms whatever you hoped, and reports it green.**

⚠️ **The direction of the error decides whether anyone looks.** The third was caught in seconds because
it demanded *more* work; the first two were believed because they said the work was done and done well.
**A check that reports "you are finished" is the one that needs auditing, and it is the one that never
gets it.** Noise is what makes us look twice, so the failures that survive review are exactly the ones
that produce cleaner results than the truth — a broken comparison does not return a wrong answer, it
returns a *perfect* one, because agreeing with itself is the only thing it can do.

⚠️ **THE SIGN OF THE ERROR DECIDES WHETHER IT SURVIVES, and two same-day specimens from two rigs make
the point better than the rule does.** Both were broken checks; only one nearly shipped.

| | the check | what it returned | outcome |
|---|---|---|---|
| toward reassurance | `git cat-file -e <old-sha>` after a history rewrite | **zero dead citations, all six files clean** | passed review, and was meaningless |
| toward alarm | `grep -cE "P.eddy?0.45:0.6"` | **0 matches for a string that is present** | investigated within a minute |

The second is a plain mistake — `?` is a quantifier in ERE, so the pattern never sought the literal, and
`grep -F` is the fix. It was caught immediately **because a zero where you expect a hit is frightening.**
The first was caught only by noticing the result was *too clean given that 32 commits had just been
invalidated*. **Neither reviewer was more careful than the other; the errors simply pointed in different
directions.** So the usable technique is to ask what a *correct* run should have found before reading
what this one did: **if you have just broken N things and the sweep reports zero, the sweep is the
suspect, not the news.**

⚠️ **And a check can be right until the ground moves under it.** `git cat-file -e` asks *does this object
exist*, which is the correct question in ordinary operation and becomes the wrong one the instant you
rewrite history — `refs/original` deliberately keeps the old graph alive, so every stale hash still
resolves and the check *cannot* fail. The question after a rewrite is *is this reachable from the branch*
(`git merge-base --is-ancestor`), which immediately found six orphaned citations the first form had
cleared. **The check did not rot. Its premise did** — the same shape as the note that went false with
nobody editing it, elsewhere in this section.

⚠️ **Scope a history-wide text replacement to named files, never the whole tree.** A three-letter string
being replaced across every file also rewrites base64 `integrity` hashes in `package-lock.json`, which
contain such substrings by coincidence. That corruption has no error, no test that notices, and lands in
every rewritten commit at once. Confirm the untouched files by checksum afterwards rather than assuming
the filter was narrow.

⚠️ **A comment asserting what a line GUARANTEES is a claim to test, not a fact to copy. The code says
what it does; the comment says what someone thought it did.** This file is dense with comments precisely
because the reasoning matters — which is exactly what makes a wrong one durable, since it will be
inherited by every reader who has no reason to doubt it.

*Worked example, and the failure mode is specific enough to be actionable.* `let palMoving=true;` carried
the comment *"true until the first ease proves otherwise."* That reads as a guarantee about frame one,
and it is false: `render()` calls `easePalette()` and *then* `blitSky()`, `easePalette` assigns
`palMoving` unconditionally, and `blitSky` is its only reader — **so the initialiser has never once been
read.** What actually makes frame one blit a filled cache is the paint stamp being declared out of range,
three lines away. The claim reached two files before anyone tested it. *(That stamp was `skyAge=1e9` when
this was written and is `skyPaintT=-1e9` since the cadence went wall-clock for ProMotion — the trap is
unchanged, only the symbol moved.)*

⚠️ **The precise gap: values were being verified and behavioural claims were not.** `SKY_EVERY=8` (since
folded into `SKY.every`), `m>0.5` and the paint stamp were all re-read off the source, deliberately, because a *number* from the same
author had been wrong earlier the same day. `palMoving=true`'s *behaviour* was taken from prose — and a
comment sitting on the declaration line is the most authoritative-looking place a wrong claim can live.
**Numbers get audited because they look checkable; sentences about what a line ensures do not, and they
are the ones that go wrong.** To test one, find every reader (`grep -n <symbol>`), check the call order
of the writer against the reader, and *exercise* it — this one was settled by forcing a real size change
and sampling pixels before and after, not by reasoning at the code.

⚠️ **The oracle cannot certify any change that adds or removes an RNG-consuming call, and it will not
say so — it will just hand you a different number.** The fingerprint is a bit-exact trace of a seeded
xorshift run. Anything that changes *how many* `rand()` draws happen before a given frame desynchronises
every spawn, pattern and drop after it, so the trace diverges completely and carries no information
about whether behaviour was preserved. **Effect calls are the trap, because they do not look like sim
code.** `spawnBurst(x, y, col, 3, spd)` draws four `rand()` per particle — twelve for that call — and it
reads as decoration.

*Worked example, `9f5d7fd`.* Removing the graze moved the suite from len 1654 / FNV `9f659ef7` to len
1651 / `e9cc1d16`. **The move was predicted, and the reason given was wrong** — *"graze feeds `score`, so
the fingerprint should move."* ⚠️ **The prediction coming true is what nearly let it through**, because a
confirmed prediction reads as an understood mechanism. What broke it was reading the numbers underneath:
two of six pilot runs scored **higher** without graze (emitter 500→785, survival-202 3080→3650), and
removing a points source cannot do that. The score story was incidental; the `spawnBurst` draws were the
mechanism.

**So when the fingerprint moves, first ask whether your diff changed the entropy budget** — and if it
did, the oracle is silent rather than negative, and you owe the change a different proof. For `9f5d7fd`
that was: enumerate every write site of the affected quantity statically (scoring came to five, all
integers), reproduce the *baseline* off a gitignored copy of HEAD before trusting the rig, assert the new
build's markers in source **and** seam before measuring, and drive the touched function for 5,400 frames
watching for throws.

**The contrast case is the same day's `262d334`, and it is what makes the rule usable rather than
paralysing.** A render-layer change certified cleanly at len 1651 / `e9cc1d16` on both sides — because it
provably spent no entropy: added lines matching `Math.random|rand(|rnd(` came to **0**, and lines added
or removed matching `spawnBurst|spawnRing|pushText|sfx.|queueKill` came to **0**. ⚠️ **Run that grep as
part of claiming an oracle pass**, in both directions on the diff. A green fingerprint on a diff nobody
checked for entropy is worth exactly as much as a red one.

⚠️ **SYNTAX-CHECK THE ARTEFACT YOU SHIP, NOT THE SOURCE YOU EDITED.** 2026-08-11, arming the frame probe
for a device run: `index.html` stays clean and the gitignored `ios/App/App/public/index.html` is patched
instead, so the measurement build differs from source by design. The patch replaced a line with one
ending `// MEASUREMENT BUILD` — and **the `//` swallowed the rest of that line, `}catch(e){…}` included**,
leaving an unclosed `try`. The source was checked with `node --check` and passed. **The patched copy was
never checked**, so the app ran a **dead inline script for a full 45-second measurement window** and the
run was scored as data.

⚠️ **The failure is quiet because the static markup still renders.** The menu drew, laid out, and read in
English — because the HTML carries English defaults and needs no JS — so a screenshot looked like a
working game. The tells were the blank canvas and a language that ignored the stored preference. **A
packaged web app with a dead script does not look dead; it looks like the game with nothing happening in
it.**

The staging step now ends with: assert the arm marker present in the patched copy, assert the source
*unmutated*, and parse the patched copy's `<script>` block with `vm.Script`. All four are positive
confirmations of the artefact rather than of the intent. This is the same family as the three-copy build
trap — **the thing you measured is not the thing you edited unless you checked the thing you measured.**

⚠️ **A check can make the provenance-for-truth substitution too, and one written the day after that trap
was recorded did.** A PATCHNOTE coverage sweep asked *"did this commit touch `index.html`"* and reported
four commits as missing entries. All four were comment-only: the file was touched, the game was not. The
convention is about substance, and the sweep tested provenance — the exact swap two paragraphs up, by
someone who had just written it down. **Knowing a failure by name is no defence against it.**

⚠️ **The purest form of it: when two claims in a file disagree, "which one is newer" is a provenance
question and it feels like adjudication.** A comment about the sky cache said *"22 sample points, max
channel delta 1/255"* in one draft and *"all 4,096,000 pixels identical"* in the next. The disagreement
was spotted and flagged correctly — a 1/255 delta is not identity, so both cannot describe the same
measurement — **and then resolved by assuming the newer line had superseded a stale one.** It had not.
The 1/255 figure had been typed into a comment *before* anything was measured, and the byte-exact figure
that replaced it came off a rig where `navigate` was silently no-oping, so both captures read the **same
page**: two readings of one build, reported as agreement. ⚠️ **A comparison that never compared anything
returns *perfect* agreement — the most persuasive result a broken rig can produce**, and it arrives
looking like the strong version of the claim you were already inclined to believe. Neither number had
ever been measured, and the question that would have found that — *"was either of these run?"* — is one
sentence away from the question that was asked.

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

⚠️ **This clearance went stale and the detector is now wrong in both directions — measured, 2026-08-11.**
It read *"all four `://` occurrences sit inside comments, none in code"*, with four line numbers, in a
file that has since grown to 9,719 lines at `759ae0f`. Re-run: **8 occurrences, two of them code** — the
`og:url` and `og:image` meta tags, which carry `https://` inside a markup attribute. Both verdicts below
came from editing one line of `HEAD:index.html` and running the recipe. *(No line numbers: that is what
went stale the first time.)*

| edit | verdict | |
|---|---|---|
| the `og:image` URL | **COMMENT-ONLY** | ⚠️ false negative — the strip truncates that line to `content="https:` in both blobs, so a real change vanishes |
| one line inside `<!-- -->` | **SUBSTANTIVE** | false positive — the recipe strips `//` only, and this file carries **29 HTML comment blocks, 169 lines** |

The second direction is the safe one and the first is the one the whole entry exists to prevent. Fix
both by stripping `<!-- -->` and attribute values before the `//` pass — **or accept that the recipe
under-reports and never let it excuse a commit on its own.**

**Note which half of the original was load-bearing.** The clearance was correct when written and nothing
was edited to falsify it: it had bound itself to a property of the *file* rather than of the *method* —
which its own last clause said, before publishing the count anyway. **A caveat naming the thing that
will go stale does not stop it going stale.** ⚠️ *And the first attempt to test this returned the
reassuring answer:* a one-line `sed` hit two lines, one of them inside `<!-- -->`, so the diff survived
the strip for a reason unrelated to the hypothesis and the detector read **SUBSTANTIVE**. Same shape as
everything above — the rig answered a question nobody asked, in the direction that ends the enquiry.

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

⚠️ **`const T = store.totals` shadows the translator, and the fix was to stop relying on block scope.**
It was in `openRecords` and in `die()`; the second survived only because the death receipt's `T()` calls
happened to sit in a different brace. Both read `Tt` now and the reason is on the line, because "safe
where the braces happen to be" is not a property anyone can maintain.

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
edge — `Range.getClientRects()` is the tool that sees the actual laid-out run. **A hidden element measures
0 and zeros compare equal**, so assert visibility before every comparison: checking whether the four
`.refs` links wrapped returned a confident *"1 row, 4 per row"* with every rect at zero, because the menu
was behind the death overlay at the time — no error, a plain false PASS. And the Browser pane's
viewport can be **0×0**, which makes `94vw` resolve to nothing and every paragraph "overflow" its
collapsed container: one pass here reported 67.5px of overflow that did not exist. Assert
`innerWidth !== 0` before believing anything.

⚠️ **A boot-time gate must be reachable at boot, and one that is not looks exactly like cover.** The
first-visit tutorial used to auto-start, which would drop a scripted pilot into a mode with the wave clock
parked at `phaseT=1e9` and damage off — every fingerprint and every tape measuring *that* instead, with
nothing thrown. `window.__H` was the gate that worked, and it worked because of **when** it exists:
`.harness/preload.js` is injected ahead of the inline script, so the harness has announced itself before
the boot line runs. A gate on anything `.oracle.js` defines **cannot** work — it is pasted after load. *(`f122816`
removed the auto-start entirely, so this specific hazard is gone at the source and `tutSuppressed` is now
cosmetic. **The rule is kept because it is about boot-time gates in general**, and the next one will be
written by someone who did not watch this one nearly go wrong.)*

**`store.mute` is API, not an internal flag.** Every rig in this repo silences the game with
`store:{mute:true}` or by writing `orbitalcrash_mute`. When the level slider arrived, folding mute into
`vol === 0` was the tempting simplification and would have broken all of them without an error anywhere.
`gainNow()` is where the two combine, and it is the only place that computes output level.

**A record and a best are one condition with two consumers.** Boss Rush pays `200*act` per purge from an
endless supply and the Lab spawns on demand, so both are barred from `store.best` *and* `store.runs` by
the same test. Add a fourth mode and they are wrong together or right together — never half.

**A rig state the game cannot reach produces numbers that look exactly like findings.** Two of these
landed on the same day from opposite directions. A `CHARGE_DMG` of 12 was rejected for one-shotting an 11 HP
Bastion — a fight requiring `act=1`, which the variant gate has forbidden since the first commit; at the
lowest Bastion the game can spawn it never one-shot anything. And four grind rigs read a clean zero,
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
mode describes neither.** The Bastion was reported as fizzling 15–18% of its shots on screen, flagged to
the author as possibly needing investigation. Counted by kind, **16 of its 20 expiries were mines
detonating exactly as designed** — the mine's `life` is a fuse — and genuine fizzle was 2 of 84 rings. The
aggregate was a real count of a category that does not mean anything. Before quoting a rate, check that
every member of the numerator is the thing the rate is named after.

**A harness that can force a state is a harness that can invent one**, and that is exactly how the 11 HP
figure was born: a verification run called `spawnBoss` for a Bastion at Epoch I, printed a pool the
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
`position`, so it was `static` and both had *always* been silently ignored — the element had never once
been where the CSS said, and it went unnoticed for as long as a neighbour happened to sit under it.
Nothing errors, nothing logs. **A positioned offset without a `position` is dead CSS**; the sibling
`.stat` class is where the other meters get theirs, and `#combo` now carries its own `position:absolute`
with a note saying it is load-bearing.

**The browser can measure a build that is not on disk.** Assert a new-code marker — a value only the new
build can produce — before trusting any number from a live probe.

**A correct measurement of a broken thing reads as a specification unless you say which it is.** The
sharpest example this file has: *"the angular rate rises only 1.17× because the radius nearly doubled"*
was an accurate measurement, written as a design note, of a ring whose spin was being eaten by a clamp.
Anyone reading it would have concluded the ring was *meant* to feel that way and left the fault alone —
the sentence actively defended the bug. **Label every measurement write-up as a diagnosis or a
specification**, because they are written in identical language and only the author knows which one it
was. If you cannot tell which you meant, it is a diagnosis.

**A note can be invalidated by the world moving under it, with nobody editing anything — and a grep for
the changed fact finds nothing, because the changed fact is not in the repository.** `.gitignore` carried
a comment justifying `docs/SCOPE.md`: *"Removed from tracking rather than from history: the rest of the
log stays intact."* That was **correct** — while the repo was private, history was a fine place to leave
the free/paid plan. Making the repo public inverted it into an exposure, and the sentence never changed a
character, so nothing looked stale. Verified from a clone of the public URL: 7 commits reachable, 317
lines recoverable, `$2.99 / $3 / $4.99` extractable. *(Accepted by the author — the plan was superseded
twice over, and purging would rewrite every SHA from 2026-08-04, breaking 2 of the 3 evidence hashes
printed in the submission plus most of this repo's 110 hash citations.)*

**This is the harder sibling of the entry below.** The usual failure is editing a fact and not re-deriving
what rested on it, and the defence is to grep the reasoning when you change the number. Here there was no
number and no edit: the premise was **the audience**, which lives outside the tree entirely. The check is
therefore a calendar item, not a diff — and it has three parts, because the first one alone has a blind
spot that took a second session to find.

1. **Note-side.** Re-read every note justified by *audience* rather than content — `.gitignore` comments,
   "internal only" headers, anything gated on **who can see this** instead of what it says.
2. ⚠️ **Content-side, and this is the half that matters more.** Step 1 is keyed to the *note*, so **it
   finds the conscientious decisions and misses the careless ones** — `.gitignore:23` was findable
   precisely because someone had documented it. Paths nobody wrote a sentence about are invisible to it by
   construction. Enumerate them from the content instead:

   ```bash
   git log --all --diff-filter=D --name-only --pretty=format: | sort -u   # deleted, still reachable
   ```

   On this repo that returns **four** paths, and only one of them (`docs/SCOPE.md`) had a note. `FACTS.md`
   (204 lines) and `TITLE.md` (114) appear nowhere in `.gitignore` — no justification to grep for. Both
   scanned clean, **which is the content being harmless, not the method working.** Run the same check per
   `.gitignore` entry: **ignored is not absent**, and that gap is the entire failure.
3. **The trigger is wider than "going public."** It is *any change to who can read it* — adding a
   collaborator, a fork, a Pages deploy serving a directory, an artifact upload. "Is the repo public" is a
   proxy for the real premise, which is the audience.

⚠️ **Sampling a deleted file's content needs `--diff-filter=AM`, and getting it wrong returns a clean
bill of health.** `git log --format=%H -- <path> | head -1` on a deleted path resolves to the **deletion
commit**, where the file does not exist, so `git show` yields nothing and the scan reports **0 bytes, 0
lines, 0 indicators — a flawless all-clear produced by reading a commit with the content already gone.**
Measured here: `head -1` gives 0 bytes for `FACTS.md`, `--diff-filter=AM` gives 10,267. **The tell was
three different files reporting *identically* zero**, which is the shape from *"a check that reports you
are finished"* below — a security sweep whose failure mode is silent approval.

**A correct argument can stand in for a cue, and it will pass every review because it is true.** Two
mechanics were defended this way and both defences held up under scrutiny while reaching the player not at
all. The Cross's arrival was answered with *"you start mid-quadrant"* — true, solved geometry, about 1.7s
of head start. The Anomaly's post-dash withdrawal was answered with *"it is only the station drift, not a
lunge"* — also true, also checkable. **Neither is a signal.** A head start is only worth something to
someone who already knows the shape rotates and which arm is nearest; a reassurance about intent is only
worth something to someone who has read the code that forms the intent.

**The tell is that the defence can only be verified by reading the source.** A cue is something the screen
does. An argument is something the file contains. They feel identical when you are the one holding the
file, which is exactly why the author kept reporting these as unsignalled and the answer kept being a
correct explanation of why they were fine. ⚠️ **When a play report says "it came from nowhere", a proof
that it did not is not a fix** — the report is about the screen, so the answer has to be too. This is a
distinct failure from the rest of this section: not a stale number, not a broken comparison, but sound
reasoning occupying the slot where a cue belongs.

**Write a safety guard as a RATIO of the thing it guards, never as an absolute — an absolute stops
scaling silently the first time someone retunes around it.** The mine box has a density guard that keeps
the box beat clear of the fuse; it is expressed as `×2.2` on the gap, so when a per-kind tempo multiplier
was later added the guard moved with it and peak concurrent mines did not budge. **Had it been written as
"box gap = 7.0s" it would have held the old spacing against a faster tempo, the peak would have risen,
and nothing anywhere would have failed** — the constant would still read 7.0 and look deliberate. A
guard that cannot notice the thing it guards against changing is decoration.

**A coefficient is not the quantity it scales, and here the two do not even ORDER the same way.** `orbR`
is a fraction of `fieldR` and reads exactly like a radius, so every summary of this mechanic has at some
point quoted the coefficient and meant the shell. At `bee3201` that finally became visibly wrong rather
than merely imprecise: the burning coefficient is **0.45 against a resting 0.6** — *lower* — while the
burning shell is **145.0 against 114.2** — *30.8px wider*. Read the coefficients and Overdrive tightens
your ring. It does the opposite.

**The reason the two orders come apart is that the overshoot is not a constant fraction**: 2% at rest, 70%
while burning, and it grows as the target shrinks, because the body's speed is pinned at a ceiling and a
tighter circle needs a bigger standing spring error to hold it. **So the coefficient is not even a
monotone proxy.** Anything downstream — the drawn dashes, the grind band, the contact geometry — keys off
the settle, and the settle has no symbol on purpose: it is an equilibrium the sim arrives at, not a value
anything stores, so it can only be measured. ⚠️ **The tell that you are about to make this mistake is that
you are computing rather than measuring.** A scaled coefficient always produces a plausible number, and
this one would have been wrong by 60px in the direction that reads as reassuring.

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

**`innerWidth`/`innerHeight` are 0** in the harness context. Define them and dispatch a resize. ⚠️ **This
one does not announce itself, because the fallback is plausible.** `resize()` early-returns on a zero
viewport, so the canvas stays at the HTML default 300×150 *and the design arena stays at its seeded
`REF_SHORT`* — a tidy **800×800 square**. Nothing errors, nothing renders visibly wrong, and every
arena-relative quantity is measured in a box the game never runs in. It cost a published body count: the
Cross's "sixty-four" is the 800×800 figure, against 84–116 on real desktops and 100 on a phone.

⚠️ **`__orbital.P` captured BEFORE `start()` is a dead object, and it accepts writes.** `startRun()`
replaces the binding; the getter then hands out a different object. A handle taken beforehand keeps
working in the only sense that matters to a rig — you can set `charge = 1` and read `1` straight back —
while the live star reads `0`. **Re-read `O.P` after every `start()`, never across one.**

**Its failure mode is the whole reason it is here.** A rig that pinned the star and ignited Overdrive
through the stale handle produced: `ok: true`, every precondition green, spread 0, six start angles
agreeing to the decimal, and shells **identical to the base arm** — a flawless measurement that Overdrive
does nothing. Nothing in it looked wrong, because nothing *was* wrong except which object was being
written to. **The check that caught it was recording `P.eddy` per sampled frame as an output**, so the
run could assert it had been in the regime it claimed. ⚠️ **Assert the treatment, not just the result.**
A rig that never verifies the independent variable was applied cannot distinguish "no effect" from "no
treatment", and those two answers are the same string.

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

⚠️ **A LONG "BOSS" RUN IS NOT ONE KIND. The wave director keeps running, and `enterBoss()` calls
`spawnBoss()` again on its own schedule**, so a run that started on a Sentinel is a blend of two or three
kinds by the end — the object under `boss` is replaced and `updateBoss` simply drives whatever is there
now. Any per-kind rate measured over a long run is therefore an average across kinds, and the number
comes out **flattering**, because the arm you are testing gets credit for a kind you never spawned.
**Cut the sample the frame `boss` stops being the object you started with**, and record `variant` per
frame rather than trusting the spawn call: the spawn call says what you asked for, and only a per-frame
record says what was actually running. Same shape as the seam handle captured before `start()` — *the
setup call is not the treatment.*

⚠️ **And a counter that keeps ticking past the identity break measures the contamination instead of
excluding it.** The tell there is that the break lands on the *same frame every run*, which is a fixed
schedule announcing itself; genuinely random deaths would scatter.

⚠️ **A table keyed by the variant string with a `||` default is a silent-failure seam.**
`HUNT_SPD[b.variant] || HUNT_SPD.emitter` returns the *Emitter's* hunt speed for any kind whose key is
missing, and `VAR_PAT[variant] || 1` returns "no multiplier at all". Rename a kind, miss one of these
tables, and there is **no error and no warning** — the kind quietly reverts to a default while the
constant sits visibly in the file looking applied. **Renaming a variant means grepping every lookup
keyed by the variant string**, not just the type checks. `Pulsar → Bastion` (`e8c7fa2`) crossed both.

**`spawnBoss` used not to validate the variant, and what an unknown one became is the surprising part.**
`updateBoss` is `if sentinel` → `else if bastion` → **`else` EMITTER**, so an unrecognised string did not
produce an inert object: it produced a *complete, correct Emitter*. Measured on the shipped build, 900
frames, star pinned — `emitter`, `pulsar` and `zzz` all gave maxHp **25** and peak lances **8**,
identical; `bastion` 19 and 14, `sentinel` 25 and 3. **A typo spawned a real boss of the wrong kind**,
which is far harder to notice than a broken one.

**Closed at the source, and this is the rare entry that gets to say so:** `spawnBoss` now opens with
`if(!(variant in HUNT_SPD)) throw new Error(...)`. The measurement above is why the guard is a *throw*
and not a fallback, and it is quoted at the guard. **The entry stays because the rest of the family is
still open** — `HUNT_SPD[b.variant]||HUNT_SPD.emitter` and `VAR_PAT[variant]||1` are both still
`||`-defaulted, so the only thing the throw closes is the *entry point*. Anything reaching those tables
by another road still degrades silently.

*It is load-bearing today rather than merely defensive.* A fourth kind, `singularity`, sits in
`bossBody` with a full body and no `HUNT_SPD` row, so the throw is what makes "parked art" a statement
the code enforces instead of a comment somebody has to believe.

⚠️ **And which way that fails depends entirely on how the instrument is being used — this is the
refinement the rest of this section needs.** Had the rename missed `.oracle.js`, so that the harness
asked for a kind the game no longer knew:

- **As an A/B**, arm A asks `pulsar` and gets a Pulsar, arm B asks `pulsar` and gets an Emitter. The
  arms differ, the oracle reports a diff, and it reads as *your change broke behaviour* — **a false
  positive, which is the direction that gets investigated within minutes.**
- **As a banked baseline**, you record a flawless, reproducible Emitter under the key `boss-pulsar` and
  every later build agrees with it forever. **Silent, and permanently mislabelled.**

Same defect, opposite sign, decided by whether you are comparing two arms or minting a reference. So
"broken checks fail flatteringly" is too strong as stated elsewhere here: **a comparison tends to fail
loud and a baseline tends to fail silent**, and the thing to ask before trusting a rig is which of the
two you are actually running.

⚠️ **That silent half then happened for real, on the first use after it was written down.** A run over
Pages returned six clean suites — and one key read **`boss-pulsar`**, months after the rename, with a
hash *byte-identical to `boss-emitter`*. `sw.js` had served a **pre-rename `.oracle.js` out of the
service-worker cache** while the file on disk said `bastion`, so the suite measured an Emitter under a
dead name and reported it as an ordinary result. **The numbers were perfect; the only tell was a key
name somebody had to actually read.**

**So assert the harness that is LOADED, not the file on disk.** A `curl` of the served path and an
`md5` against disk both agree while the page runs something else entirely — the service worker sits
between them:

```js
if (!/bastion/.test(window.__suite.toString())) throw new Error('stale oracle');
```

Abort rather than measure. `caches.delete()` plus `getRegistrations().unregister()` clears it, and a
`?cb=` on the script URL dodges it.

⚠️ **And the oracle is loaded with a `<script>` tag now, never `fetch` + `eval`.** Since the CSP landed,
`script-src` has no `'unsafe-eval'` and the old recipe raises `EvalError` — measured. **Do not add
`'unsafe-eval'` to keep a dev harness working**; the tag was always the better load and needs no
exception, because `script-src 'self'` already permits a same-origin file:

```js
const s = document.createElement('script'); s.src = '.oracle.js?cb=' + Date.now(); document.head.appendChild(s);
```

*(Pasting into a DevTools console still works — console evaluation is not subject to page CSP. It is
programmatic loading that changed.)*

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

⚠️ **A PASSING CONTROL LICENSES THE INSTRUMENT, NOT THE READING — one measurement with a good control is
still one measurement.** This is the entry above continued past where its advice runs out. That one says
to validate a sweep against something known-dirty before believing it says clean, and here that was
*done*: the per-body pixel deltas behind the skin tiers were taken with a same-face-twice control, which
returned **0** exactly as it should. The rig was sound. The numbers were still wrong by ~3× — quoted as
star **102 px** and Drifter **~33 px**, re-measured across five field states (2–19 Drifters, control 0 in
each) at **312–341** and **88–115 px per body**. *(Measured by the v2 gameplay session; recorded here as
theirs, because the rule stands on the shape and not on the figures.)*

**The two questions are different and only one of them was asked.** A control answers *can this rig
detect the thing at all* — validity. Repetition answers *is this value the value* — variance. A control
cannot see variance by construction: it is the case where the true answer is zero, so it is silent about
every case where the answer is not. Passing one feels like finishing, which is the family this whole
section is about, and it is a **cleaner** kind of false confidence than a broken instrument because
nothing about the rig is available to doubt.

⚠️ **What let it live for a full pass is that the CONCLUSION never moved.** The ratio (~3×) survived
re-measurement, so the design it was cited for was right the whole time and never showed strain — the
argument kept working while its evidence was wrong, and the numbers propagated into an `index.html`
comment, *## Skins*, and a commit message before anyone re-ran them. **A figure is not checked by the
decision it supports continuing to look correct.** The check is cheap and it is the same one the entry
above ends on, one level up: before a number becomes an argument, take it again in a *different state* —
not a second time in the same one, which is what the control already was.

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
- The table written to correct *that* quoted the Bastion's mine-inclusive **17.9%** in its measured column
  while scrupulously stripping mines from its reach column. Right number, wrong population again — and
  the Bastion is the only variant carrying a fuse, so again the only row of its kind.

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
radius and closes to a point. That is right for a **telegraph** — a Bastion winding up, an Overdrive
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
Anomaly buff still pricing a bait at half a bar, still calling an Epoch I Bastion 11 HP, and still
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

**A rejection is as perishable as a measurement, and nothing in this process re-checks it.** A
`CHARGE_DMG` of 12 was once rejected in its own comment block, on the grounds that it would one-shot an
Epoch I Bastion. The pool later doubled, and that same value became the one that *preserves* what the
rejection was protecting — two baits, exactly what the old number took against the old Bastion. **The rejection was
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

**🔴 The Singularity has never been played by a human, and three of its claims need one.** Everything
about it is measured on a scripted rig, and the rig is structurally blind to all three:

- **Does the Draw read as a grab, or as input lag?** It is a *speed cap*, so what it subtracts is exactly
  what a dropped frame or a stuck pointer subtracts. The telegraph and the `inhale` are what separate the
  two, and whether they do is a feel judgement no bot makes. ⚠️ If it reads as lag, the fix is **not** a
  bigger cap — it is a real inward force on top of the clamp, which the clamp already makes portable.
- **Is the top-right Overdrive zone reachable in time on a PORTRAIT phone browser?** The Draw's answer is
  Overdrive, so this is the first mechanic that makes the portrait question a **correctness** issue rather
  than an ergonomic one. *Touch* already records that the top-right argument is a landscape argument and
  that the web is "settled by nothing"; native is landscape-locked and fine.
- ~~**Does the Draw have a persistent cue at all?**~~ **Closed.** The wind-up raises the danger badge, and
  the cap itself carries the hunt lane, the hunt wake and a red movement line on the integrity bar for its
  whole duration — because it runs through `b.hunt` and inherits all three. What is *not* closed is
  whether the answer arrives in time on a portrait phone browser, which is the item below.

**🟡 Does the Singularity break no-softlock, in either direction?** It is the only kind that walks *into*
your ring shell continuously, which should make the grind far stronger against it, and the only one that
caps your gathering speed, which should make it weaker. Those pull opposite ways, neither is measured,
and the three TTK figures under *Erosion* cover the other kinds only. See the ⚠️ there.

**🟢 ANSWERED FOR A COMPOSITED RIG, 2026-08-11 — still open for phone hardware.** The sky cache is worth
**~13fps**: 56.0 against 42.5 in the same menu scene on the iPhone 17 Pro simulator, via the
`localStorage` method this item prescribed below. The full table and the `SKY.scale` follow-up live in
*Feel → The sky cache*. ⚠️ **What remains open is exactly what the last paragraph of this item already
said would remain open: the simulator runs on the host Mac's GPU, and the bet was on fill-rate-bound
phone silicon.** A real device closes it; nothing else does. The prose below is kept because the trap it
documents is still live, and because it predicted its own limit correctly.

**🟡 Does the sky cache actually raise the frame rate on a PHONE? Still nobody knows.** The
software-rasterisation win is real and large (background 68.7ms of a 69.3ms frame → a 0.03ms
blit), but that is a *cost* measurement, not a frame-rate one, and every GPU figure produced for the
change was withdrawn. ⚠️ **The instrument inverts the work it aims at** — an uncomposited pane lets the
browser discard frames it never shows, because each frame's opaque background `fillRect` overwrites the
last and the sky never rasterises, while the cache canvas *is* read every frame by `drawImage` and cannot
be discarded. Under that method the optimisation measures **slower** (0.41 vs 0.33 ms/frame), which is
the instrument and not the change. Batch-sweeping exposes the artefact: "cost per frame" falls from
81.7ms at *M*=1 to 1.36ms at *M*=90, i.e. one ~80ms readback stall divided by *M*.

**The only thing that settles it is a frame counter on the Capacitor iOS build**, where frames are
actually composited and cannot be discarded. Until then the honest claim is *"a measured win in software
rasterisation, unverified on GPU"* — and ⚠️ **any copy or commit body asserting a frame-rate improvement
is asserting something nobody has measured.** See *Feel → The sky cache*.

**The instrument now exists, and so does the number — see the 🟢 above.** `__orbital.probe()` supersedes
`fps()` for this question (three accumulators, histograms, `localStorage` flush; see *Feel → The frame
probe*). `SKY.every` is still the live knob (1 = no cache). ⚠️ **The three attempts below remain
inadmissible and are kept as the record of how**, because the admissible run only differs from them by
using the fix this item proposed:

| rig | E8 (cache) | E1 (no cache) | "gain" |
|---|---|---|---|
| two separate launches | 38.16 | 27.83 | +37% |
| paired, one process | 23.50 | 9.40 | **+150%** |
| three interleaved pairs | — | — | never completed |

⚠️ **A 4× disagreement between the first two is the finding; neither number is a result.** The cause was
the *reading*, not the change: a simulator screenshot is expensive and lands on the machine being
measured, and one of them fell inside a measurement window. **That is the same defect that invalidated
every previous attempt at this figure, in a new place** — the instrument became part of the experiment
again. Polling `log show` in a loop is the same mistake wearing different clothes: it is host CPU and the
simulator shares it. The fix in place for next time is `localStorage` — the run writes its result and a
separate, later launch reads it, so nothing touches the machine while it measures.

⚠️ **And a clean simulator number would still not close this item.** The simulator composites, which is
the defect the open question names — but it runs on the host Mac's GPU, and the cache was bet on
*fill-rate-bound* hardware. A Mac result can show the cache helps when frames genuinely composite; it
cannot speak for an iPhone. **Closing this needs a real device.** *(2026-08-11: this paragraph was
written before the admissible run and it called the outcome exactly. The run happened, the cache is worth
~13fps where frames composite, and the item is still open for the reason stated here.)*

**🟡 Can the game hold 120fps? Unknown, and this Mac cannot ever say.**
`CADisableMinimumFrameDurationOnPhone` is now set, and the two frame-counted behaviours that would have
been wrong at 120Hz are fixed (see *Feel → ProMotion*). But the host is a **60Hz MacBook Air**, and the
simulator inherits the host's refresh — so **every 60fps ceiling in this file is the laptop's display,
not the game's**, before and after every change. Worse, vsync clamps a healthy frame to 16.7ms, so the
true work time of a cached frame is hidden: it could be 3ms or 14ms, and only the second of those fails
at 120. **Needs a real ProMotion device, and the probe already writes somewhere a phone can be read.**

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
it has reintroduced the threshold model. Price the Bastion against **Epoch II**, the first Epoch its
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
prediction working, not a coincidence.

⚠️ *That paragraph used to end "any further move still has to carry the `CHARGE_DMG` = 4 × `VOLLEY_DMG`
pin with it".* **There is no such pin, and there was none when that sentence was written** — it was
retired under *The Anomaly*, and this section went on quoting it as a live constraint from three
screens away. That is the section's own lesson turned on itself: a retired rule survives wherever it
was *repeated*, and the copy nobody is looking at is the copy that stays wrong. The bait is priced as a
**share of a bar** against the pool, never against the volley. Grep the identifier, not the section,
whenever a rule is retired.

⚠️ **Removing passive regeneration is a move in exactly that direction, and it was not made for this
item.** The orbit's price was already known — a median **94 HP a fight** off `anomLog` — and it was
being refunded in full between encounters: the 271s reference tape sits at exactly **100.0 HP** at
Epoch V. So the cost was real per-fight and zero per-run, which is precisely how an expensive orbit
stays affordable forever. It is now spent against a flat 30 an Epoch and never returns. **That is the
"make the orbit expensive" lever, arrived at sideways.**

**Three reasons not to close this item on that basis.** *One:* the 94 is bot-derived and this file
already flags it as "a lead, not a finding" — and the bot that produced it is **immortal**, so it did
not feel the old cost either and cannot report the new one. *Two:* the change is not aimed; it prices
the exploit and the intended loop by the same mechanism, which is the exact failure this item rejects
in `RING_GRIND_DMG` and in a boss-HP raise. It escapes that objection only if the grind orbit takes
disproportionately *more* contact than the intended loop does — plausible, since holding a large ring
close is what the exploit is, but **unmeasured**. *Three:* the open question was never the price, it was
whether a pilot who never volleys can close the fight inside a window they survive; a window that no
longer refills makes that question harder to answer, not answered. **Still argued, not tested** — and
the measurement that would settle it needs a human, for the reason given in *no heal beats the lockout*.

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
looks and arguably a clarification:** the restore-point comment already says not to pay a *single* graze
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

**Bomber spawn weight vs. its role — ANSWERED TWICE, still watch the feel.** The weight had been priced
when a Bomber was a Dot you could walk through; contact went back to Drifter parity while the death blast
kept clearing a large hole in your hoard, so it was paying for the wrong property. `BOMB_RARITY` scales it
in both bands. The first pass took it 1.0 → 0.5 and halved the species; a second, **0.5 → 0.42**, thinned
it slightly again.

Pooled over 9 × 300s runs per arm, counting every arrival by identity — share of all arrivals **5.68% →
4.83% overall (−15.0%)**, by band 4.46% → 3.78% (t 80–125) and 6.04% → 5.18% (t ≥ 125). 0.42 was chosen
because it holds ~15% at every band and Epoch, where a round 0.4 is −19% and reads as a nerf rather than
a thinning.

⚠️ **The figures this entry used to carry were stale, and by a lot.** It quoted 8.61% → 4.95% and 7.15% →
3.76% for the first pass. Re-measured at 0.5 those bands are 4.46% and 6.04% — the late one nearly
**double** what was written, because the Planet and the Harrier joined that table and the Splitter left it
since. Correct when taken, describing a roster that no longer exists. Any share quoted here is a reading
with a date on it, not a constant.

⚠️ **Do not read a spawn-mix delta off four seeds.** Matched seeds do not give matched runs: `wchoice`
draws once whatever the weights are, so the RNG stays in step, but the outcome diverges from the first
Bomber decision onward. A 4-seed read of this same change said −8%; at n=233 vs 216 Bombers it could not
separate that from −15%.

What is still *not* settled is whether the blast is now rare enough to read as an event rather than a tax
— a feel judgement the bot cannot make, because the median scripted pilot dies before the first Bomber
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
`9fd8dcb` took exactly that class of number apart: of the Bastion's 20 expiries, **16 were mines detonating
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
Bastion's 17.9% is the mine-inclusive rate — the very figure being stripped from the argument two
paragraphs above, quoted unstripped in the measured column while the reach column was carefully cleaned.
**The Bastion is the only variant with a fuse-bearing kind in its kit**, so it is the only row whose
measured value is a different kind of thing from its neighbours. Same tell, third firing.

Stripped, reconstructing the Bastion's shot mix from its cadences: the nova throws 12 ring lances every
~4.5s against a mine volley every ~3.1s, putting mines at **~27%** of what it fires. Of 20 expiries, 16
were mines, so ~4 non-mine expiries against ~82 non-mine shots — **~4.9%**. For 17.9% to have survived
stripping, mines would have to be **80%** of everything the Bastion fires; the ring alone throws twelve at
a time.

| Epoch III, pre-raise | kit | shortest non-mine reach | measured, one basis |
|---|---|---|---|
| **Bastion** | ring, mine | 1159 — shortest | **~4.9%** *(reconstructed)* |
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

**~~No heal beats the lockout.~~ Closed — there is no lockout, because there is no passive heal.**
Survival's only heal is the purge (+30, one an Epoch). The item asked whether anything could mend you
with the arena still full; the answer is that nothing mends you at all now, so the question dissolved
rather than being answered.

⚠️ **THE ARENA IS NO LONGER STILL FULL, AND EVERY NUMBER BELOW PREDATES THAT.** The purge sweep clears
the field (see **Purge**), which is worth roughly another **23 Integrity** of damage never taken in the
12s that follow — so the grant this section prices at 30 is really about 53, and the "arena still full"
the item was written against is exactly the condition the sweep removes. The census underneath was run
before the sweep existed and its headline is untouched by it: **16 of 16 died inside Epoch I with
`phase === 'boss'`**, i.e. every one of them died *before reaching a purge at all*. That is why the bot
cannot re-run this arm — it never gets to the change. ⚠️ **The human playtest asked for below is now
strictly more necessary, not less**, and it has a second question attached: whether a bad Epoch is
recoverable is now partly a question about the sweep, and nothing in this file can answer it.

**The half of it that survived is now the sharpest question in this file: is a bad Epoch still
recoverable?** It was a footnote when damage refunded itself; it is the whole balance of the game when
it does not. From Epoch X a single Brute contact (31.0) costs more than an Epoch's entire income, so
past that point mistakes are paid off only by *reaching the next Anomaly*, never by surviving the one
you are in. **Nobody has played this.** The bot cannot answer it — it does not dodge, so it prices
every hit as unavoidable and will always report the economy as harsher than a human finds it. ⚠️ This
needs **one human playtest before the +30 is tuned**, and the tuning knob is the purge heal, not the
damage scalar: the scalar is what makes runs end, and that is a feature.

*The bot arm has been run, and the death census that goes with it — which nothing in this project had
ever done, despite `lastDmg` shipping the instrument.* Sixteen seeded survival runs, pilot flipping
every 35 frames (below the 40→47 step, so this is not measured at the cadence the docs forbid):

> **16 of 16 died inside Epoch I, and 16 of 16 died with `phase === 'boss'`. Median 37.7s.**
> Killing blow: **7 the Anomaly's body · 8 ambient Dots · 1 missile.**

**The pre-boss stretch is survived every single time.** Epoch I's non-boss window is 30.7s and not one
run ended inside it, so the ambient economy is not what is killing runs — **the first Anomaly is, and it
is a cliff rather than a ramp.** That the killer splits almost evenly between the Anomaly and the
ordinary Dots piling on while you are busy is the `anomLog` design note coming true: the window is the
whole fight, and the field does not stop while you deal with it.

⚠️ **Read the two halves differently.** *When* is robust — a bot that clears 30.7s of ambient field
sixteen times out of sixteen and then dies in the fight is telling you where the difficulty is. *What*
is not: the pilot flies a fixed Lissajous and never dodges, so it walks into the body repeatedly, and
the 7 is inflated by exactly the behaviour a human would not repeat. Note also the whole heal economy
sits behind a purge this pilot never performs, so it is not measuring the economy past Epoch I at all.

*The first damage pass — a flat −2 — measured against this, paired on the same eight seeds:* median
**34.0 → 36.85s, +8.5%, and no seed got worse** (deltas 0 to +6.4). **It did not move the wall at all —
still 0 of 8 into Epoch II.** The reason is in the census: half the killing blows come from the
Anomaly's body (30) and its missiles (10), and **neither of those is a Dot**, so neither moved. A cut to
ambient damage buys time inside the fight; it cannot buy the fight.

*The second pass re-derived every value as −20% of the ORIGINAL rather than −2 flat, which moved four
species: Brute 20→18, Planet 18→16, Neutral 13→12, Charger 14→13. It produced a **byte-identical
census** — same 37.7s median, same 31.1–53.2 range, same 7/4/4/1 killer split.* That is not a failed
change, and the check that proves it is worth more than the change:

> **Only 2 of 16 runs ever had a Brute or a Charger on the field at all, and not one ever saw a Neutral
> or a Planet.** Brute and Charger enter the ambient table at `t≥45`; Neutral and Planet at `t≥125`. The
> pilot's median death is 37.7s. **It dies inside the first two bands, so it cannot price a change to
> species it never meets.**

⚠️ **This is the sharpest statement of the bot's limit in the file, and it generalises.** The flat −2
appeared to work only because it happened to touch Drifter and Dart — which *are* the early table. Any
future tuning of the mid or late roster is unmeasurable here by construction, and a green suite will
report "no change" whether the change is inert or enormous. **Numbers below `t=45` are the only ones
this pilot can speak to.**

*Two measurements were attempted and are not reportable; recording them so nobody spends the afternoon
twice.* **Cost-per-fight off `anomLog` cannot be measured with an immortal pilot** — it read 984 HP for
one Epoch-I fight, because a pilot that cannot die grinds until the boss does, so fight *length* becomes
a free variable and the number measures the grind rather than the fight. The 78→94 median in the grind
item has the same defect and should be read the same way. And the **score-at-Epoch curve from an
immortal pilot is inflated and must not set thresholds**: it reaches Epoch V at 475s with ~69,000, where
the one human reference tape reaches Epoch V at 271s with 39,105 — **1.75× the time and 1.76× the
score for the same depth.** Where a threshold needs a score-at-depth, the tape is the anchor and the
bot is not. The item offered two ways out — "either
a real touch scheme or an honest desktop-only gate" — and shipping on iOS settled which. See *Touch*:
three zones, move on the left side, Overdrive and flip on the right corners.

*What the item described is gone rather than fixed.* "Every touch-down currently calls `flip()`" and the
Android long-press → `contextmenu` → unintended-Overdrive path both belonged to the intent-split scheme,
which no longer exists; `flip()` is now reachable from one quarter of the screen and nothing else, and
`contextmenu` is suppressed and never ignites.

⚠️ **One part of the replacement is argued rather than measured, and it is the part a bot cannot settle:**
whether the quarters land under the thumb and index finger of a real hand, and whether Pause in the
top-right corner is far enough from where a held Overdrive press actually falls. Everything mechanical
about the scheme is verified — partition, dead zone, ramp, origin-follow, un-notched diagonals, all three
verbs concurrent — but "it fits the hand" is not, and the median scripted pilot has no hands.

**HUD hierarchy.** The meters read as equals; only Capacitor and Streak deserve to be loud.
