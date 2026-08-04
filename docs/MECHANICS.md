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

**The rule stops at the docs, and the game has two surfaces it cannot reach.** `bestiary.html` and the
in-game Codex are *copy*, so they hardcode: the Charger card prints the baited-charge damage as a
literal, and the Codex prints all four streak thresholds as literals against `MILES`. Change
`CHARGE_DMG` or `MILES` and grep both files — nothing will fail, the game will simply lie to the
player.

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
form. Three silhouettes overhang — Brute hexagon, Charger arrowhead, Splitter lobes — but those draw
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

*Ceiling:* nine species is the edge of what a shape vocabulary carries at 40+ Dots. A tenth should
reuse a silhouette and differ by behaviour.

### 6. The three pattern rules
A shape that breaks any one of these is decorative, not a pattern.

1. **Spacing under 52px** — contact is 26px centre-to-centre, so anything wider has a walkable midpoint.
2. **Alternate every Dot** — any run of two same-colour Dots is a free door costing one keypress.
3. **Never end on a timer alone** — a shape that just crosses and dissolves is beaten by standing still.

*Catch it:* measure every inter-Dot gap and the longest same-colour run; check the shape has a
terminating *event* (the Wall's return, the Noose's bite, the Sorter's mutual annihilation).

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

Applies to: the Comet crossing the sky, the Pulse leaving the viewport, the Sorter's two walls
annihilating each other, and the Bomber's blast.

**The general "delete anything off-screen" rule was measured and rejected.** Over 300s tracking every
Dot: 1,374 entered, **2 ever left**, and both came back. Ambient matter cannot leave — it seeks you.
The rule that operates is *retire a Dot that has finished a committed trajectory; never retire one
that is still hunting you.* "Is it off-screen?" is a proxy that coincides for two shapes and misleads
everywhere else — and a blanket version would quietly promote the Fling from "push away" to "delete",
which law 2 does not allow.

### 9. The silent world
**No centre banner, ever.** Storms, Epochs, the Anomaly's arrival, Collapse and streak tiers are
announced by matter, colour, ring, shake and sound. Text across the middle pulls the eyes off the
field at exactly the wrong moment.

**Exactly two *persistent* text channels**, both outside the play area: the **pickup pill** (a powerup's
effect is the one thing you genuinely cannot read off the screen) and the **achievement toast**.

**Everything else is floating text, and floating text must be drawn where its event happened.** That is
the whole rule, and it is a rule about *position*, not about content — `-8` rises off the Anomaly you
just bit, `BOUNTY +` off the Dot that paid, `STREAK 25 · ⚡+8%` off the core, because the streak is
yours. A label placed anywhere other than its own event is a banner with extra steps: it moves your
eyes off the field to read about something that happened somewhere else.

`VOLLEY ×n` and `FLUNG ×n` were removed under exactly this test, and it is worth being precise about
why, because "no tallies" is the wrong lesson. They printed **at the core** a count of matter that had
just launched **outward, away from the core** — on the exact frame your eyes should have been following
the bodies you threw. Had they been drawn on the bodies, they would have been legal and useless.

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

### 15. Missile `life` is a distance budget, not a clock
Any future per-missile speed multiplier must scale `L.life` with it. Learned the hard way: a slow
effect once scaled `L.vx/L.vy` while ticking `life` at full speed, draining it 2.5× too fast and
fizzling missiles mid-flight. The mechanic that caused it is gone; the trap is not.

Today this is safe by construction — `step()` opens with a literal `dt=1/60` and `timeScale` is
applied to the *accumulator*, so slow motion runs **fewer steps, never shorter ones**.

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

---

## The two verbs

The verb set is exactly two: **reverse**, and **reverse while loaded**. A third input gated behind the
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

### Collapse
Spend a full **Capacitor**. A short inhale under heavy slow-motion, then an arena-sweeping blast wave,
one hit per wave — trash dies, Brutes crawl out burned and flung. Against the Anomaly it is a **flat
percentage, whatever the field looks like**: the wave never touches the boss and neither do the
chain-blasts its kills set off. Density must not be able to kill a boss.

A Collapse of 8+ kills pays a **tally** bonus that grows with the *square* of the count — the shape is
the point, since a Collapse is meant to reward the wave you set up rather than the one you fell into.
Kills during a Collapse pay **no** Capacitor — the next one must be earned.

**The per-kill Capacitor award is capped** (`CHG_KILL_CAP`), as is the streak trickle — see law 16.
Uncapped, this meter was two systems wearing one bar.

---

## Matter

**Matter** (a **Dot**) is any regular, non-boss enemy. Each carries a charge, so opposite-charge
Dots are your threat *and* your ammunition.

**Nine species**, each with its own silhouette (law 5):

| | |
|---|---|
| **Drifter** | baseline Dot, steady approach — the deliberate unmarked null |
| **Dart** | small, very fast, light hit; backward wake |
| **Brute** | big, slow, 3 hp, the hardest contact hit in the sky; hexagon. The only Dot that walks out of a Collapse or a Bomber blast, and nothing erases it outright — it must be annihilated by colour like anything else |
| **Splitter** | twin lobes; bursts into exactly 2 Minis when destroyed — unless killed by a Collapse or a Bomber blast, neither of which runs `onKill`, so neither leaves fragments |
| **Mini** | tiny fast fragment; no white core, a solid pellet |
| **Orbiter** | curves *around* the star instead of beelining; annulus with a clockwise pip |
| **Bomber** | an ordinary Dot in every stat that **detonates when it dies** |
| **Charger** | the only Dot your magnetism does not own; arrowhead, solid armed and hollow spent |
| **Neutral** | wears both poles on a turning seam; the one Dot the colour law does not reach |

### The Bomber's detonation
Colour-blind, sized just past the ring orbit radius, at Collapse-parity damage — so trash dies and a
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

### The Sorter
Two **solid** walls converging, one red and one cyan, doors at different heights. Neither door helps
you with the other wall and no polarity is safe from both: match the one arriving first, then flip for
the second. The flip stops being a convenience and becomes the solution.

It deliberately breaks the *letter* of rule 6.2 while keeping its spirit — one solid red wall is a free
door if you are red; two, in opposite colours, cannot both be.

The walls **annihilate each other** where they meet, which is what ends the shape rather than a timer —
and that mutual annihilation **pays nothing** (law 8). It is gated on **both** Dots being in formation
flight, so nothing you own is caught (your ring Dots carry no `hold`), and on `!unstable`, so a
Collapse — which is yours — is never silenced.

### The Comet
Not a formation but an **event**, on its own much longer timer rather than in the shape rotation — and
that timer only advances **outside a boss**, which is roughly half a run, so a naive "make it rarer"
pass lands at twice the intended rate.

One Dot crossing the whole sky on a fixed line, several times faster than anything else, trailing a
tail emitted in world space so it drifts behind the nucleus instead of being welded to it. It carries a
charge like everything else, so it is either a large delivery of ammunition you intercept by
positioning or a fast threat that crosses — which keeps it inside the core verb instead of being
decoration. Its nucleus is a **Brute**, so intercepting it is a real hit.

Aimed to pass **near** you rather than at you, so it touches you about one pass in five: an opportunity,
not a hit. Its flight distance is solved **ray-vs-box** against the padded viewport, so it ends past the
*far* edge — a fixed distance cannot serve both a level crossing and a corner-to-corner one. Reaching
the edge **retires** it (law 8). Miss it and you lost the opportunity rather than gained an enemy.

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

Its hits are priced by **how much warning you get**: a missile is the cheapest (the thing you eat most
often), a mine blast is double (it announces itself twice — it arms, and it draws its own blast radius,
so standing in one is a decision), and its **body** is the most expensive and the least excusable.

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

**The ring grinds.** A Dot whirling in your rings that sweeps through an Anomaly cuts it. You did not
aim it, but you spent a hold gathering that ring and you have to carry it into contact range — that is
what makes it yours rather than an accident. Contact **consumes** the Dot, which bounds a grind to the
hoard you actually built.

**No per-kind bonus, and the obvious one is backwards.** A bonus for the kind you have to *chase* looks
right and measures wrong: closing on the **Sentinel** is the **cheapest** of the three, because its orbit
carries it away rather than parking on you and firing, while the Emitter and Pulsar sit still and shoot
you point-blank. **Hard to catch and dangerous to stand next to are different axes**, and the grind is
priced on the second. `GRIND_MULT` is an empty table on purpose — the signpost that stops this being
rebuilt.

**The Fling never erodes.** Not "rarely" — never, by rule. A Dot you pushed *away from yourself* is not
a shot you took at something. The Fling is defence, and only defence.

**Ways in:** two from matter you gathered (**Volley**, the main line, and **Ring grind**, for carrying a
loaded ring into it), plus the **baited charge** (matter you did not gather but did aim), plus
**Collapse** (a flat percentage, no matter at all). The grind is the only one needing neither a flip nor
a Capacitor, which makes it the fallback when you have been stripped of everything else.

**Purge** — destroying the boss; the word means only this. Pays score scaled by Epoch, an Integrity heal,
a Capacitor chunk, and exactly one orb.

### What still deletes matter near an Anomaly
Worth naming, because none of it is the Anomaly's fire and all of it gets blamed on the Anomaly's fire.
**Ambient opposite-colour traffic** is overwhelmingly the answer — ordinary matter meeting matter. The
**Sentinel's swarmers** are the only boss-emitted eraser, and they are *matter* rather than shots, so the
colour law owns them like anything else. Your own **Collapse** takes the rest.

The Anomaly's **body** is the one exception, and it is not fire: it consumes matter that actually chips
it, or a flung Dot parked inside its skin would chip every frame. Matter that pays zero — ordinary
drift-in — **bounces off**. It is a solid object, not a vacuum; consuming it would quietly delete the
ammunition you were about to use.

---

## The run

**Epochs** are the major stages, each with its own name and palette — Drift → Ember → Bloom → Tide, then
looping in Roman numerals. Each Epoch raises pressure three ways: the same species bites harder and moves
faster, the mix shifts toward positioning-demanding species, and the arena holds more Dots. **HP is
deliberately never scaled** — annihilation is binary.

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

Two things make the *measured* mix wider than either table: formations and storm surges spawn outside
`doSpawns`, and Minis come only from Splitters dying — they appear in no table at all and still make up
roughly an eighth of everything that arrives.

### Pressure is spawn-limited, not player-limited

**The single most useful fact about this game's difficulty, and it is counter-intuitive.** Throughput —
how many Dots leave the field per minute — is set by the spawn system and is very nearly a constant. What
actually varies is the **standing population**: how many are on screen at once. Seven conditions, four
matched 180s runs each, damage off, star stationary:

| | Dots leaving /min | avg standing | avg rings held |
|---|---|---|---|
| baseline, flipping | 290 | 31.9 | 2.8 |
| baseline, never flipping | 270–294 | 25.6–26.1 | 8.1 |
| Overdrive, flipping | 287 | 26.0 | 2.4 |
| Overdrive, never flipping | 261 | **19.6** | 4.8 |
| Field ×2.2 alone | 266 | 24.5 | — |
| A Collapse every 8s | 282 | **15.2** | — |

**Throughput stays inside 261–294 — a ±6% band — while standing population spans 15.2 to 31.9, better
than a factor of two.** The reason is structural: you already annihilate essentially everything that
reaches you, so making you *better* at killing cannot reduce how many are standing — the queue is
upstream of you. Only something acting at **range** moves the standing count, which is why Collapse has
the most control over it and the tightest variance of any condition (14.5–15.9).

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
- **Capacitor** — fills toward a Collapse, from kills, Motes, streak milestones and Epoch clears. Chimes
  when full. Kills *during* a Collapse pay nothing.
- **Streak** — a no-hit combo, resets only on real damage (shield blocks do not break it). Named tiers,
  each paying a Capacitor chunk. Breaking a streak past the first tier **bursts** it into Capacitor
  instead of vanishing.
- **Mote** — annihilation loot carrying the popped Dot's colour. Same-polarity Motes hoover to you;
  opposite ones lie inert until a reversal vacuums them. Collecting one pays score where it lands.
- **Score is addition, and there is no multiplier.** A kill, a Mote and a graze each pay a flat amount
  (`KILL_SCORE`, `MOTE_SCORE`, `GRAZE_SCORE`) wherever they happen. A kill is the unit, a Mote is a
  quarter of one, and a kill sheds 1–2 of them — so hoovering your own debris is worth about a third
  again on top of the kill that made it. Where you stand is already priced by the things that decide
  the fight.

  **The multiplier was removed because it measured as a coin flip, not a curve.** `mult` was
  `min(15, 1+motesBank*0.1)`, banked by Motes and halved on every hit. Over 12 runs that took hits it
  landed at a median of **×1.9**; over 6 of 6 runs that took none it **capped at ×15 inside 46s**.
  Nothing in between — and **1.30× total effect on final score** for a 44px HUD stat and two popups.
  The halving also punished backwards: a clean run banks 761 Motes against the 140 needed to cap, so
  the first two hits cost a deep bank literally nothing while a shallow one lost half. Anything
  reintroduced here has to beat that bar: it must separate *outcomes*, not just decorate them.
- **Graze** — a dangerous Dot that skims you and leaves. Score crumb and a sound, and **no Capacitor**:
  charge income should be chosen, not lucked into.
- **Gilded Bounty** — periodically one Dot arrives gold-ringed; pop it inside the window for a jackpot.
  Only ever a Drifter or a Dart, never a big Dot. Its dashed gold ring is drawn at exactly `e.r + P.r`,
  so it is simultaneously the bounty cue *and* the true contact edge (law 3). Affordable only because it
  is rare and unique — forty of these would be a HUD rather than a cue.
- **Achievement** — an in-run feat recorded in the Codex. **Flavour only; they unlock nothing.** There is
  no meta economy. Nothing counts the rows, so adding or retiring one is a single line.

### Powerups — the only progression
Any annihilation can shed an **orb**; steer into it to collect. Every effect is **instant and temporary**,
and grabbing the same type again refreshes its timer. A purged Anomaly always drops one, and a safety orb
floats in if the field has been bare a while. A drop is never a duplicate of something already active or
already waiting.

Timed effects just toggle already-tuned physics flags each frame, so every effect rides code the game has
already balanced — it simply expires.

- **🛡 Aegis** — a shield for a few hits. The only shield source, and exception-free: nothing pierces it.
- **⚡ Overdrive** — faster star, wider and faster whirling rings.

  **It quietly pays you for not flipping, which is a tension with the core verb.** The mechanism is the
  finding here; the effect sizes downstream of it are noisy and partly disputed, so read them in that
  order.

  Its real lever is the ring shell — `P.eddy` moves the ring orbit from `0.6` to `0.85` of the Field, and
  a wider, faster shell sweeps more matter. That is *reach*, the only thing the invariant above says
  moves standing population. **But a shell only pays in proportion to what is in it, and the flip dumps
  your rings.** Rings held measure **~2.3–3.0 while flipping against ~6.9–9.1 while not** — a 3× swing,
  larger and far cleaner than any crowd figure in this area, and every harness that has measured it
  agrees. That is the whole shape: Overdrive's value is proportional to a hoard the game's central input
  destroys.

  **It also consumes the hoard rather than growing it.** In the no-flip arm Overdrive *reduced* rings
  held while reducing crowd — 9.1 → 6.4, independently 6.9 → 4.5. The wider shell converts held rings
  into kills instead of accumulating them, which is a better argument for Overdrive-as-ring-shell than
  the crowd number ever was.

  On crowd itself: the effect is **clear when you never flip** and **small and hard to measure when you
  do** — see the replication trap above before quoting any figure for the second case. It does not reach
  Collapse under any measurement.

  Not a bug and not a problem at six seconds. It is the shape to watch if the effect is ever made longer,
  stronger, or permanent: a second verb that pays you for not using the first verb is an identity
  problem, not a tuning one.
- **✺ Nova** — an instant free Collapse wave at no charge cost. The rarer roll.

*Watch item:* a three-wide bag means the most common pickup is also the dullest one.

### Modes
| | |
|---|---|
| **Survival** | the real run. The only mode that can set your best score |
| **Boss Rush** | one Anomaly always present over a **live ambient field**, cycling kinds on kill; number keys jump to a kind. Epoch pinned, intro mix skipped. Gilded Bounty suppressed |
| **Pattern Lab** | a live ambient field with **no Anomaly and no Epoch phases**; number keys fire the five shapes on demand, and auto-formations are suppressed so nothing arrives unless you asked. It exists because Boss Rush structurally cannot serve it — formations are gated on not-boss, which is most of what Boss Rush is |

**Game states:** `menu` · `play` · `ready` (GET READY) · `paused` · `dead`.

---

## Feel

- **Trauma** — screen shake. **Flash** — full-screen colour. **Hitstop** — a brief freeze-frame on big
  hits; the frame hanging is this engine's whole vocabulary for weight. **None of the three is on the
  damage path** — see *Taking damage says one thing* below. They are not one bundle, and the split is
  the grading:

  | | trauma | flash | hitstop |
  |---|---|---|---|
  | **Purge** (`killBoss`) | ✓ | ✓ | ✓ |
  | **Collapse** (`detonateCollapse`) | ✓ | ✓ | ✓ |
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
- **Moment Engine** — global slow-motion dips. The Collapse breath is the big one.
- **Floating text** — small rising labels near the core.
- **The sky** — three depths drawn *outside* the shake transform, so distance reads as distance rather
  than a backdrop wobbling. Stars in three parallax layers, gas clouds on their own slower parallax, the
  arena at your feet. Parallax also gives you something fixed to judge your own motion against, and does
  it better than a lattice would, because different rates encode distance as well as movement.
- **The Spheres** — the celestial harp arpeggio, now a single cue: orb pickup. Achievements ring a
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

**The copy is five one-line beats and nothing else.** The menu must not teach what the Codex teaches —
scoring, Motes, rings as armour and powerup orbs are all stated in full one button down. What belongs here
is only what a player cannot infer.

- **The word `opposite` in the last beat is load-bearing.** Without it that line forbids the thing the
  second line requires: same-colour matter is harmless and steering into it is the *only* way to build
  rings.
- **`steer into`, never `pull`.** The star exerts no pull on another charge, ever. Copy saying matter comes
  to you teaches the most expensive misconception in the game.
- **Every beat must hold one line at `.tag`'s measure.** Go over and the beat spills a single word onto a
  line of its own, which looks like a mistake.

A fault inside `titleOrbit` is caught at the call site and latches it off, leaving a still wordmark — a
cosmetic bug must not be able to reach the frame guard and halt a game that is otherwise fine.

---

## Traps

Things that have cost real time, in this codebase specifically.

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

**The scripted pilot cannot see most of the game.** A 40s run stops before formations, Chargers and
Bombers exist; the median pilot dies before the first Bomber can spawn. It has also **never picked up an
orb** and **never detonated a Collapse** — the oracle drives `step()` directly, so the real-time inhale
countdown never runs and every later call is refused. Anything touching those systems is unmeasured by
the bot regardless of how green the suite looks.

---

## Open

Questions the game has not answered. These are live; everything else in this file is settled.

**🔴 `RING_GRIND_DMG` is stranded above its pool.** It was raised on the argument that boss HP had gained a
×1.5 multiplier. That multiplier is gone and Epoch I is now *below* the HP at which the grind previously
had to be halved. An immortal bot orbiting close, never firing a volley and never Collapsing, solo-killed
the Epoch I Anomaly in 5 of 9 runs. **Both caveats matter, because they decide whether to act:** the bot is
immortal, and a real player holding that orbit pays a real HP cost — so the strategy *exists*, it is not
free. The one-line fix, if it should not exist, is to halve `RING_GRIND_DMG`.

**Collapse has the least distinct identity of any earned action.** It is one of two "everything near me
dies" effects, it costs the most to reach, and its inhale is a dead pause. The pilot's verdict after three
recorded runs was that it does not feel like a reward. **There is no measurement to argue with that**, for
the reason in *Traps*: the scripted pilot has never detonated one, so every Collapse number rests on human
play alone.

**The powerup roster is still mundane, and only one third of it is load-bearing.** Suppressing **Aegis**
costs **−32.8% survival** (Welch t=4.06, n=30). Overdrive (t=1.12) and Nova (t=1.56) are both
indistinguishable from noise — so the most common drop is not merely the dullest, it is close to
measurably nothing. *Caveat: the scripted pilot is open-loop and cannot exploit a movement buff, so
Overdrive is understated; Aegis is passive and measures correctly for any pilot.*

**The stated direction is to replace Aegis rather than rework it: a close call generating a shield** —
grazes earning defence instead of a score crumb, so the reward for cutting it fine is the thing that
lets you keep cutting it fine. Explicitly not now. Worth writing down because it decides what happens to
Aegis when the time comes — removal, not iteration — and because Graze currently pays deliberately
little (score and a sound, no Capacitor, so charge income stays chosen rather than lucked into); that
pricing is what would change.

**The Moment Engine's audio half was never built.** The time side is live (`timeScale`, `slowmo`); the
sound side — stereo-panned kill pops, a low-HP heartbeat with a lowpass, a storm drum layer — is agreed
direction that has never been started. It is the one thing that would make the slow-motion dips land as
weight rather than as lag.

**`P.iframe` has two values, and one of them is a literal.** Damage sets `IFRAME`; a shield block sets a
hardcoded shorter window, at both of the two call sites. That is deliberate as a *feel* choice — a block
is not a hit — but it is written as a magic number in two places, so it is one careless edit away from
the drift the constant exists to prevent. Either name it or fold it into `IFRAME`.

**The `body` → `Dot` rename has not reached the code.** `index.html` carries 140 `body`/`bodies`
comments meaning an enemy against 17 `Dot`s, and `bestiary.html` — the player-facing page — says `body`
23 times and `Dot` never. The identifiers already agree with the docs (`DOTNAME`, `DOTSPD`). Mechanical,
but the Bestiary half is player-visible copy under a 30-word-per-card budget, so it is a rewrite rather
than a substitution.

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

**Boss balance is bot-derived.** Every TTK number in the ledger comes from a scripted pilot holding a fixed
orbit and never dodging — which is the worst possible way to fight the kind that hovers and shoots
point-blank, so the Emitter reading hardest is probably an artifact. Needs one human playtest.

**No heal beats the lockout.** Integrity regenerates only after a quiet window and nothing else heals.
Disengaging is the entire healing verb; watch that a bad Epoch is still recoverable.

**Touch controls.** Parked pending the launch-environment decision. Every touch-down currently calls
`flip()`, so steering re-grips reverse your polarity; Android long-press additionally synthesizes
`contextmenu` → an unintended Collapse. The fix is either a real touch scheme or an honest desktop-only
gate.

**HUD hierarchy.** The meters read as equals; only Capacitor and Streak deserve to be loud.
