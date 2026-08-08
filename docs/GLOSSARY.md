# ORBITAL CRASH — Glossary

A shared vocabulary, so we can talk about the game precisely. **Bold** is the canonical term to use in
conversation; `code` is the identifier in `index.html`.

**One line per term.** How a thing *works* belongs in [MECHANICS.md](MECHANICS.md); why it changed
belongs in [PATCHNOTE.md](PATCHNOTE.md) or the commit body. If an entry here needs a paragraph, the
paragraph goes in MECHANICS and this line points at it.

### Naming conventions

- **Lowercase `world` never means you.** It is the coordinate space (*world space*, *design units*) and
  the game's setting (*the silent world*). Your avatar is the **Star**.
- **Matter** is the mass noun, **Dot** the countable unit — *matter drifts in*, *a Dot hits you*.
- **Never write "charge" unqualified.** Two unrelated quantities answer to it: **hold-charge**
  (`P.holdT/P.holdMax`, time since your last flip, which arms the hungry flip) and the **Capacitor**
  (`P.charge`, which pays for Overdrive). Nothing reads both — the flip path never touches `P.charge`
  at all. Say *hold-charge* or *Capacitor*. This is not pedantry: the loose word has already produced a
  confident, wrong, and entirely plausible claim in a ledger entry about which measurements were
  comparable.
- **body** in game vocabulary means a hull and only a hull: *the Anomaly's body*, *two hulls meeting*.
  It never means an enemy, because *its body* (the boss) and *a body* (an enemy) collided in the same
  sentence too often. (The ordinary English senses — a *commit body*, *body copy* — are not the game's
  vocabulary and are left alone.)
  The code agrees: identifiers were always `Dot`-shaped (`DOTNAME`, `DOTSPD`), and the comments and
  Bestiary copy were brought into line — what `body` survives in either file is a hull, a CSS selector,
  or the `PRICED IN CONNECTING BODIES` unit of account.

---

## The star

- **Star** — the wandering star you steer with the pointer. Your avatar. (`P`)
- **Polarity** — the Star's current charge, **Red** or **Cyan**. (`P.polarity`)
- **Field** — the circular magnetic field around the Star. Catches like-charge into Rings; exerts **no
  pull at all** on opposite charge, ever. (`P.fieldR`, `P.fieldK`)
- **Core gravity** — the Star's gentle pull on its **own colour**, and only outside the Field.
  (`LIKE_GRAV`, `LIKE_GRAV_R`)
- **Rings** — like-charge matter held in orbit around the Star: armour, ammunition, and a weapon on
  contact, all at once. (`e.ring`, `P.ringMul`)
- **Ring spin** — the rate the ring orbits the Star. (`DOTSPD`)
- **Ring hysteresis** — a Dot stays yours for a grace window after a move outruns it, and the spring
  reels it back the whole time. (`RING_GRACE`, `RING_GRACE_R`, `e.ringGrace`)
- **Integrity** — your health. Regenerates only after a quiet window; nothing else heals.
  (`P.hp`, `P.maxHp`, `P.hurtT`)
- **Immunity** — the window after a hit during which you cannot be hurt again. **One value for every
  source**, now that nothing blocks. The star's blink is driven off it directly. (`IFRAME`, `P.iframe`)
- **Contact envelope** — the separation at which two hulls touch: `e.r + P.r`. The one radius that
  matters. See *the danger edge*.

## Verbs

- **Reverse (poles)** — swap Polarity; click or space. Also called a **pole reversal** or a **flip**.
  (`flip()`)
- **Shockwave** — the outward push every reversal emits. Repels matter and **pops a Neutral outright**.
  Does not touch an Anomaly. (`P.pulseCd`, `P.conduitAmp`)
- **Hold-charge** — charge that accrues on time since your last flip, not on holding a button.
  (`P.holdT`, `P.holdMax`)
- **Loaded** — the state of your Rings past the hold-charge threshold. (`RING_FIRE_HC`)
- **Hungry flip** — a reversal made while loaded. Flings, and volleys at an Anomaly. The game's real
  weapon. (in `flip()`)
- **Fling** — the hungry flip's outward throw: opposite-charge matter inside the burst is thrown
  **alive**. Nothing dies. (`PURGE_R0`, `FLING_V0`, `FLING_HOLD`)
- **Volley** — the hungry flip against an Anomaly: gathered Dots fire straight away from the core along
  the radius they sat on. No homing. (`VOLLEY_SPD`, `VOLLEY_DMG`, `e.vdmg`)
- **Ring grind** — damage from a Dot whirling in your Rings sweeping through an Anomaly. Consumes the
  Dot. (`RING_GRIND_DMG`)
- **Baited charge** — a Charger's committed dash driven through an Anomaly because you stood so its
  locked lane crossed it. (`CHARGE_DMG`)
- **Overdrive** — the second verb: spend the Capacitor to burn a wider, faster ring shell. **Held, not
  toggled** — it drains while you hold it and the remainder banks when you let go.
  (`overdrive()`, `endOverdrive()`, `odOn`, `OD_DRAIN`, `OD_MIN`)
- **Burn** — the interval an Overdrive is running. **Ignite** starts one, **release** ends one early.
  Every ignite path has a matching release, and the releases sit on the window rather than the canvas.
- **Ride** — one Overdrive from ignition to end, and the unit the run summary logs. A *burn* is the
  state you are in; a ride is the finished thing that gets counted. Every ride ends in one place.
  (`odT`, `odLog`, `endOverdrive`)
- **Redline** — igniting a full Capacitor and riding it to empty. Granted inside `endOverdrive()`, the
  single exit, so banking early and dying mid-ride are judged by the same line. (`redline`)
- **Annihilation** — the core kill event: two opposite-charge things touch, both destroyed.
  (`queueKill`, `processKills`)
- **Pop** — to destroy a Dot.
- **Sky cache** — the background painted once into an offscreen canvas and blitted, rather than
  repainted every frame. Rebuilt on three triggers only: the palette easing after an Epoch flip, a frame
  counter, and a canvas size change. (`blitSky`, `paintSky`, `SKY_EVERY`, `palMoving`)
- **Vacuum** — what a reversal does to opposite-colour Motes lying inert on the field.
- **Purge** — destroying an Anomaly. The word means only this. (`killBoss`)

## Matter

- **Matter** / **Dot** — any regular, non-boss enemy. Each carries a charge.
- **Drifter** — baseline Dot, steady approach; the deliberate unmarked silhouette. (`drift`)
- **Dart** — small, very fast, light hit; backward wake. (`fast`)
- **Brute** — big, slow, tanky, the hardest contact hit in the sky; hexagon. The most durable Dot in the
  game. (`heavy`)
- **Bomber** — an ordinary Dot in every stat that **detonates when it dies**. (`bomber`, `bomberBlast`)
- **Planet** — the biggest, slowest Dot, and the only one you **charge**: held in your ring it burns down
  a fuse, dropped it loses more than the hold gained, completed it erases every Dot of the opposite
  colour arena-wide. (`planet`, `planetBlast`, `PLANET_FUSE`, `PLANET_COOL`)
- **Charger** — the only Dot your magnetism does not own; arrowhead, solid armed and hollow spent.
  (`charger`, `CHG_WIND`, `CHG_COOL`)
- **Spent** — a Charger's post-dash cooldown, during which it is ordinary matter and can ride your ring.
  (`e.spent`, `e.cool`)
- **Neutral** — wears both poles on a turning seam; the one Dot the colour law does not reach.
  (`neutral`)
- **Harrier** — the only Dot that **orbits** you rather than arriving at you, and the second-fastest thing
  in the sky after a Dart. Captured like anything else, but inside your rings it keeps its momentum and
  loses the whirl, so it flies an ellipse and spirals in. Twin lobes strung along its heading, plus a wake.
  (`harrier`, `ballistic`, `ARC_*`)
- **Ballistic** — the flag that switches a Dot from *held* to *orbiting*: no ring spring, no ring spin,
  almost no bleed, a longer retention leash, and a tangential kick on the frame it is caught. Only the
  Harrier carries it, and every term defaults to off. (`e.ballistic`)
- **The catch** — the tangential velocity injected once, on the frame a ballistic body is captured. A
  discrete event rather than a force, because a force would accumulate under the near-zero bleed. It is
  what gives the body angular momentum: `seek` points at the Star, so an uninjected arrival falls straight
  down the middle instead of entering an orbit. (`ARC_INJ`)
- **Cruise** — the speed a Dot actually travels at, `seek * 6.1429`. Not `maxsp`, which is only a ceiling
  and which no ordinary Dot ever reaches in free flight: the two are independent, and reading the table's
  `maxsp` as pace is what left the Harrier shipping sixth-fastest of eight while its row read second.
  (`cruiseSpeed`, `CRUISE_K`)
- **Reversal excursion** — how far a cruising Dot carries on the wrong way once you get behind it, and the
  honest measure of "slow turn". **It is exactly `1.5653 × cruise` for the seven species that share the
  0.86 bleed** — identical to floating-point precision — because friction sets the *shape* of the turn and
  `seek` sets only its scale. 1.25px (Planet) to 4.04px (Dart), over 5 frames. Note which way it runs: a
  faster Dot overshoots proportionally **more**, so raising `seek` buys approach speed and pays in turn
  radius. ⚠️ The **armed Charger is not on this basis** — it runs its own loop at accel 0.17 and bleed 0.9,
  so its ratio is 2.4341 over 7 frames. ⚠️ Do not collapse this into "a free-flight number cannot buy a
  slow turn" — that was the wrong half of the distinction, and it is mine. Turn **time** is friction-bound
  and shared: all seven reverse in the same 5 frames whatever their `seek`. Turn **radius** is `seek` in
  direct proportion. Only in the ring does the third thing happen — `ARC_FR` lets momentum outlast
  steering altogether, which is a different mechanism, not more of this one. (`ARC_FR`)
- **Swarmer** — a Dot the Sentinel sheds while orbiting. Matter, not a shot, so the colour law owns it.
  (`seedT`)
- **Same-charge shove** — like-charge overlaps resolved **positionally**, split by mass. Positions only,
  never velocity. (`SAME_PUSH`)
- **Gilded Bounty** — a periodic gold-ringed Dot worth a jackpot if popped inside its window. Only ever
  a Drifter or a Dart. (`e.gild`, `gildTimer`)
- **Mote** — annihilation loot carrying the popped Dot's colour. Worth points where it lands. (`motes`)

## Laws and rules

Named rules, defined in full in [MECHANICS.md](MECHANICS.md#the-laws).

- **The colour law** — opposite-charge things that touch both die; same-colour matter passes through
  your core harmlessly. The central rule.
- **The two-channel rule** — only a Volley, a Ring grind, or a baited Charger erodes an Anomaly.
- **The danger edge** — a ring drawn outside a hull sits at exactly `e.r + P.r`, or does not exist.
- **The silhouette law** — every species owns an outline; colour is never one of them. (`drawEnemies`)
- **The two-wave release** — formations let go by polarity, one colour after the other. (`NOOSE_WAVE`)
- **Retirement** — a Dot finishing a committed trajectory dies via `dead` alone, never `queueKill`, so
  it pays nothing.
- **The silent world** — no centre banner; one text channel, outside the play area.

## Patterns

- **Pattern** — a hand-placed wave with obvious intent, flying in from off-screen.
  (`spawnFormation()`, `formT`, `FORMS`)
- **Linear flight** — a held Dot flying an assigned vector, ignoring seek and the polarity field.
  (`e.hold`, `e.fvx/fvy`)
- **Polar flight** — a held Dot stepping an angle and a radius about a centre.
  (`holdOrbit()`, `e.orb`)
- **The Wall** — a solid line marching across the arena with one gap that shuts, then turning and coming
  back. (`formWall`)
- **The Noose** — a ring shutting on where you stand, seam rotating, locking as a cage while strands
  carry on. (`formNoose`, `NOOSE_MIN_R`, `NOOSE_BITE`)
- **Seam** — the Noose's one wide gap, or the one opening in a Pulsar's ring missile. The way out.
- **Bite** — the Noose strands that leave the cage and land on your core. (`NOOSE_BITE_R`)
- **Cage** — the Noose at its locked radius, holding shut. (`NOOSE_CAGE`)
- **The Pulse** — nested single-colour arcs washing outward over you; answered by matching, not dodging.
  (`formPulse`, `PULSE_ARCS`, `PULSE_GAP`)
- **Arc** — one colour-uniform front of the Pulse. (`PULSE_ARC`)
- **The Cross** — four arms from a hub, quartering the arena. The hub is the arena's centre, and slides
  off the Star rather than bending around it. (`formCross`, `CROSS_R0`)
- **The Comet** — a rare event: a shower of 3–5 fast Dots crossing the whole sky on one heading and
  leaving. (`formComet`, `COMET_SPD`, `cometT`)
- **The Drift** — a rare event, not a formation: six Neutrals arriving on a telegraphed hexagon, with no
  choreography after arrival. The only spawner that places bodies *on* the field, which is why it is also
  the only one that needs a warning. (`formNeutralDrift`, `NDRIFT_N`, `NDRIFT_R`, `NDRIFT_TEL`, `ndriftT`)
- **Danger sign** *(a warn)* — the violet mark that appears where a body is about to arrive, drawn at the
  incoming body's **contact envelope** rather than its hull. Its ring closes onto that footprint and stops,
  which is what separates it from a mine's arming ring (that one closes to nothing). The only thing in the
  game drawn on bare ground away from a body. (`warns`, `warnSpawn()`, `WARN_T`, `drawWarns()`)
- **Telegraphed spawn** — a warn *owns* the body it advertises: type, colour and position live in the mark,
  so the sign and the spawn cannot disagree. The file's only scheduled spawn. (`stepWarns()`)

## The Anomaly

- **Anomaly** — the boss. Immune to your pole reversal, position-controlled, and it never leaves.
  (`boss`)
- **Anomaly kind** — which one you drew. Three, one verb each. (`boss.variant`, `ANOM`)
- **Emitter** *(volleys)* — hovers, alternating a hexagon burst with a sweeping stream; dashes from
  Epoch II. (`b.emitMode`, `fireHexVolley`)
- **Sentinel** *(chase)* — circles the arena firing pincers and shedding swarmers, leaving a trail.
  (`orbA`, `seedT`)
- **Pulsar** *(ground denial)* — erupts radial rings with one seam, and lobs mines around you.
  (`novaCharge`, `fireMines`)
- **The Hunt** — an Anomaly leaving station and *walking* onto your core, landing one hit and breaking
  off. (`b.hunt`, `HUNT_SPD`, `HUNT_BREAK`)
- **The Dash** — the Emitter's one committed move: it locks its lane at wind-up and drives past the
  locked point. (`LUNGE_TEL`, `aimLunge()`)
- **Missile** — anything the Anomaly throws. Launches from its own body; hurts you regardless of your
  polarity. (`lances`, `MSL`)
- **Reach** — how far a missile travels: `sp × 60 × life`, with nothing correcting it, so `pace.spd`
  shortens it. Not a variable — a product of two table values. (`MSL`, law 15)
- **Fizzle** — a missile reaching `life <= 0` inside the arena instead of leaving it. Only mines are
  meant to; for them `life` is a fuse, not a reach budget.
- **Mine travel** — the mine's own reach, and **not** `sp × 60 × life`, because a mine decelerates while
  arming and then coasts: `35.6 × sp`, of which 25.45 is the arming phase and 10.15 the coast. A solved
  constant, not a knob. (`MINE_TRAVEL`, `MINE_SPMAX`, `layMine()`, law 15)
- **Volley** *(missile)* — a spread that leads your motion. Cross it.
- **Seeker** — turns onto you, then commits. Out-turns you, cannot out-run you.
- **Ring** *(missile)* — an expanding wall with one seam.
- **Mine** — lobbed at the ground around you; arms, draws its exact blast, detonates. (`mineBlast()`)
- **The Box** — the Pulsar's Epoch III mine pattern: eight stations on a square around you, one omitted
  as the door, every dimension derived from the blast rather than chosen. (`fireMineSquare`,
  `MINE_SQ_HALF`)
- **Spear** — telegraphs a line, tracks you along it, then fires. (`SPEAR_N`, `fireSpear()`)
- **Integrity bar** — the boss health bar, which also carries the per-kind tip and the Hunt warning.
  (`updateHUD`)

## The run

- **Run** — one playthrough, start to death.
- **Epoch** — a major stage with its own name and palette: Nebula → Aurora → Eclipse → Meteor Shower,
  then looping. Roman numerals in English, Arabic in Korean, and **neither wraps** — `roman()` is exact
  to 3999, where the 12-entry array it replaced printed `EPOCH I` at Epoch 13. (`act`, `ACTS`, `roman`)
- **Meteor Shower** — Epoch IV and every fourth after it. The comet formation, normally on a ~10-minute
  clock, runs on formation cadence for the length of it, so the Epoch is named for something that
  actually happens. (`isShower`, `cometT`)
- **Phase** — the beat inside an Epoch: Calm → Build → Storm → Boss. (`wavePhase`)
- **Storm** — a colour-themed surge. (`enterStorm`)
- **Storm Shift** — the colour swap halfway through a Storm. (`stormShiftT`)
- **Intensity** — the internal 0–1 pacing dial that scales spawn rate. (`intensity`)
- **Director** — the system that advances Phases, drives spawns and schedules Patterns. (`director()`)
- **Spawn mix** — the weighted species table, ramping by time through the intro and by Epoch after it.
  (`doSpawns`)
- **GET READY** — the short countdown after un-pausing, before control resumes. (`state==='ready'`)
- **Boss Rush** — practice mode: one Anomaly always present over a live ambient field.
  (`testMode`, `TEST_ORDER`)
- **Pattern Lab** — practice mode: a live field with no Anomaly, shapes fired on demand.
  (`labMode`, `LAB_SHAPES`)
- **Game states** — `menu` · `play` · `ready` · `paused` · `dead`.
- **Run summary** — the panel read on pause and on death: score, cause, time, peak combo, then a chip
  row per ride and per Anomaly fight. Both panels are built by one function against different ids.
  (`showRunLogs`, `fillChips`, `CHIP_SHOW`)
- **Ride log** — one entry per completed Overdrive, in run order. A log rather than a total, because
  four sips and a redline is a different run from two full burns and they sum the same.
  (`odLog`, `odCount`, `odTotal`)
- **Anomaly log** — one entry per Anomaly fight, holding **every** point of damage taken while that
  Anomaly was alive — not only damage the Anomaly itself dealt. (`anomLog`)
- **Cause line** — the death receipt's *Lost to* line: the species that killed you, by display name,
  and the Epoch it happened in. (`lastDmg`, `DOTNAME`, `deadCause`)

## Meters

- **Capacitor** — the meter that pays for Overdrive. Spendable from `OD_MIN`, not only when full, and
  it drains while you hold the burn. Both combo-driven income terms cap at combo
  ~90; see MECHANICS.md. (`P.charge`, `chgbar`, `CHG_KILL_CAP`)
- **Charge gain** — the **global Capacitor income rate**, `P.chargeGain`. Every income site multiplies
  by it, so it prices the whole economy in one place; a new source that skips it is worth double
  everything else. Not an inert 1.
- **Streak** — a no-hit combo; resets only on real damage. Named tiers each pay a Capacitor chunk.
  (`combo`, `streakTier`, `breakStreak`)
- **Score** — **addition, with no multiplier anywhere.** A kill (20) and a Mote (5) each pay a flat
  amount wherever they happen; an Epoch purge pays `200×act` and a Bounty `250×act`, the only two
  terms that scale with anything. Five write sites, every one an integer.
  (`onKill`, `KILL_SCORE`, `MOTE_SCORE`)
- **Ring shell** — the radius your Rings orbit at. Overdrive nearly doubles it. (`P.eddy`, `P.ringMul`)
- **Achievement** — an in-run feat listed in **Records**. Flavour only; unlocks nothing.
  (`ACHV`, `store.achv`)

## Feel

- **Trauma** — screen-shake amount. (`trauma`)
- **Flash** — full-screen colour flash. (`flash`)
- **Hitstop** — a brief freeze-frame on big hits. (`hitstop`)
- **Contact ghost** — one frozen frame of the Dot that just hit you, drawn where it actually touched.
  (`contactGhost`, `ghostT`, `GHOST_HOLD`)
- **Floating text** — small rising labels near the core. (`pushText`)
- **Hurt number** — the damage readout, and the *only* visual a hit produces besides the star's blink.
  Its size scales with the amount. (`hurtText`, `HURT_SZ0`, `HURT_SZK`)
- **Moment Engine** — global slow-motion dips. (`timeScale`, `slowmo()`)
- **The sky** — three parallax depths drawn outside the shake transform. (`STAR_LAYERS`, `drawStars`)
- **The Spheres** — the celestial harp arpeggio; a single cue, the Overdrive ignition. (`sfx.harp`)
- **Achievement toast** — the top-centre gold text channel, and now the only one. (`showAchvToast()`)
- **Comfort mode** — removes screen shake and hitstop outright; damps flash, ring spin and parallax
  travel. (`store.reduceMotion`)
- **Core Fault** — the crash screen; a bad frame is dropped and the loop survives. (`crashHalt()`)

## Tooling

- **Oracle** — the behaviour-preservation harness: seeded PRNG, frozen rAF, a scripted pilot, and a
  bit-exact fingerprint trace. (`.oracle.js`)
- **Debug seam** — the exported handle the harness drives the game through. (`window.__orbital`)
- **Tape** — a recorded play session, replayable frame by frame. (`tapes/`, `.harness/record.html`)
- **Bestiary** — the in-game species and pattern cards (`bestiary.html`), also a standalone page.
- **Records** — the screen holding your best score, the lifetime tally, the last `RUNS_KEPT` runs and
  the achievements. Headed *"What you have done"*, which is the question it owns. (`openRecords`)

---

## Retired names

Kept only so an old commit message reads correctly. None of these is the current word for the thing —
which is not the same as none of them appearing anywhere: `P.eddy` is still the live code name for
Overdrive's ring behaviour, and a few of these survive in comments explaining their own removal.

**Removed with the powerup system:** **Collapse** → Overdrive is what the Capacitor buys now ·
**Tally** → the Collapse kill bonus, gone with it · **Orb** and **powerup** → there are no pickups ·
**🛡 Aegis**, **✺ Nova** → removed with the roster; nothing blocks a hit any more · **Pickup pill** →
there is one text channel now, the achievement toast · **cache** → was the orb an Anomaly dropped on
purge; a purge now pays score, an Integrity heal and a Capacitor chunk.

**Removed with the Codex** (`c7da498`): **Codex** → there is no rules screen; the tutorial teaches by
playing, the Bestiary holds the species, and Records holds the achievements it used to list. The four
facts it was argued to be the last home of are gone too — two the tutorial demonstrates, one contradicted
`flip()`, and one Records had already made untrue.

**Older:** **Eddy** → Overdrive's ring behaviour · **body** (meaning an enemy) → Dot ·
**Flare** → missile · **World** → Star · **Purge** (of matter) → Fling; *purge* now means destroying an
Anomaly and nothing else · **Anomaly Arena** → Boss Rush · **Lunger**, **Seeder**, **Spiral** → folded
into Emitter and Sentinel · **Corona**, **Cryo**, **Singularity** → removed powerups ·
**Deflect**, **Reflect** → removed verbs · **Gate**, **Vice**, **Comb** → folded into the Wall and the
Noose.
