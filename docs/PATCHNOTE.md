# ORBITAL CRASH — Patch notes

What changed, newest first. **The reasoning lives in the commit body** — every entry from `git init`
(2026-07-31) onward has its writeup attached to the diff that made the change, 10 to 156 lines of it
depending on how much argument the change needed. `git show <hash>` is the long version of any line here.

Entries before 2026-07-31 predate version control, so they are the only record of those passes.

Rules that constrain future work — laws, traps, rejected approaches — are **not** here. They live in
[MECHANICS.md](MECHANICS.md), because a dated entry is the wrong place for something you need to read
*before* you edit.

---

## 2026-08-06

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
