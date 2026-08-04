# ORBITAL CRASH — Glossary

A shared vocabulary, so we can talk about the game precisely. **Bold** is the canonical term to use in
conversation; `code` is the identifier in `index.html`.

**One line per term.** How a thing *works* belongs in [MECHANICS.md](MECHANICS.md); why it changed
belongs in [PATCHNOTE.md](PATCHNOTE.md) or the commit body. If an entry here needs a paragraph, the
paragraph goes in MECHANICS and this line points at it.

### Naming conventions

- **Lowercase `world` never means you.** It is the coordinate space (*world space*, *design units*) and
  the game's setting (*the silent world*). Your avatar is the **Star**.
- **Sentinel** is an Anomaly; **Orbiter** is a Dot. Deliberately different words — they behave alike.
- **Matter** is the mass noun, **Dot** the countable unit — *matter drifts in*, *a Dot hits you*.
- **body** in game vocabulary means a hull and only a hull: *the Anomaly's body*, *two hulls meeting*.
  It never means an enemy, because *its body* (the boss) and *a body* (an enemy) collided in the same
  sentence too often. (The ordinary English senses — a *commit body*, *body copy* — are not the game's
  vocabulary and are left alone.)
- **This rename has not reached the code.** `index.html` says `body`/`bodies` **140** times meaning an
  enemy and `Dot` 17 times; `bestiary.html` is `body` **23** times and `Dot` never. The identifiers
  already agree with the docs (`DOTNAME`, `DOTSPD`) — the comments and the player-facing Bestiary copy
  do not. Tracked in [MECHANICS.md](MECHANICS.md#open).

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
- **Immunity** — the window after a hit during which you cannot be hurt again. One value for every
  source of **damage**; a shield block sets its own, shorter window. The star's blink is driven off it
  directly. (`IFRAME`, `P.iframe`)
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
- **Collapse** — spend a full Capacitor: an inhale, then an arena-sweeping blast wave.
  (`collapse()`, `detonateCollapse()`, `cwave`)
- **Tally** — the bonus a Collapse of enough kills pays. (`collapseKills`)
- **Annihilation** — the core kill event: two opposite-charge things touch, both destroyed.
  (`queueKill`, `processKills`)
- **Pop** — to destroy a Dot.
- **Graze** — a dangerous Dot skimming the Star and leaving without touching. Score crumb only, no
  Capacitor. (`e.grz`, `grazeN`)
- **Vacuum** — what a reversal does to opposite-colour Motes lying inert on the field.
- **Purge** — destroying an Anomaly. The word means only this. (`killBoss`)

## Matter

- **Matter** / **Dot** — any regular, non-boss enemy. Each carries a charge.
- **Drifter** — baseline Dot, steady approach; the deliberate unmarked silhouette. (`drift`)
- **Dart** — small, very fast, light hit; backward wake. (`fast`)
- **Brute** — big, slow, tanky, the hardest contact hit in the sky; hexagon. The most durable Dot in the
  game. (`heavy`)
- **Splitter** — twin lobes; bursts into exactly 2 Minis when destroyed. (`split`)
- **Mini** — tiny fast fragment from a Splitter; solid pellet, no white core. (`mini`)
- **Orbiter** — curves *around* the Star instead of beelining; annulus with a pip. (`orbiter`)
- **Bomber** — an ordinary Dot in every stat that **detonates when it dies**. (`bomber`, `bomberBlast`)
- **Charger** — the only Dot your magnetism does not own; arrowhead, solid armed and hollow spent.
  (`charger`, `CHG_WIND`, `CHG_COOL`)
- **Spent** — a Charger's post-dash cooldown, during which it is ordinary matter and can ride your ring.
  (`e.spent`, `e.cool`)
- **Neutral** — wears both poles on a turning seam; the one Dot the colour law does not reach.
  (`neutral`)
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
- **The silent world** — no centre banner; exactly two text channels, both outside the play area.

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
- **The Sorter** — two solid walls converging in opposite colours, doors at different heights.
  (`formSorter`)
- **The Comet** — a rare event: one fast Dot crossing the whole sky and leaving.
  (`formComet`, `COMET_SPD`, `cometT`)

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
- **Volley** *(missile)* — a spread that leads your motion. Cross it.
- **Seeker** — turns onto you, then commits. Out-turns you, cannot out-run you.
- **Ring** *(missile)* — an expanding wall with one seam.
- **Mine** — lobbed at the ground around you; arms, draws its exact blast, detonates. (`mineBlast()`)
- **Spear** — telegraphs a line, tracks you along it, then fires. (`SPEAR_N`, `fireSpear()`)
- **Integrity bar** — the boss health bar, which also carries the per-kind tip and the Hunt warning.
  (`updateHUD`)

## The run

- **Run** — one playthrough, start to death.
- **Epoch** — a major stage with its own name and palette: Drift → Ember → Bloom → Tide, then looping in
  Roman numerals. (`act`, `ACTS`)
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

## Meters and pickups

- **Capacitor** — the meter that fills toward a Collapse. (`P.charge`, `chgbar`)
- **Streak** — a no-hit combo; resets only on real damage. Named tiers each pay a Capacitor chunk.
  (`combo`, `streakTier`, `breakStreak`)
- **Score** — **addition, with no multiplier anywhere.** A kill, a Mote and a graze each pay a flat
  amount, wherever they happen. (`onKill`, `KILL_SCORE`, `MOTE_SCORE`, `GRAZE_SCORE`)
- **Orb** — the floating powerup pickup. (`orbs`, `dropOrb`, `ORB_DROP_CHANCE`)
- **🛡 Aegis** — a shield for a few hits. The only shield source. (`FX.aegis`, `P.shield`)
- **⚡ Overdrive** — faster star, wide whirling rings. (`FX.overdrive`, `P.eddy`)
- **✺ Nova** — an instant free Collapse wave at no charge cost. The rarer roll. (`fireNova()`)
- **Achievement** — an in-run feat recorded in the Codex. Flavour only; unlocks nothing.
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
- **The Spheres** — the celestial harp arpeggio; a single cue, the orb pickup. (`sfx.harp`)
- **Pickup pill** — the left-hand text channel, naming a powerup's effect. (`pickupToast()`)
- **Achievement toast** — the top-centre gold text channel. (`showAchvToast()`)
- **Comfort mode** — removes screen shake and hitstop outright; damps flash, ring spin and parallax
  travel. (`store.reduceMotion`)
- **Core Fault** — the crash screen; a bad frame is dropped and the loop survives. (`crashHalt()`)

## Tooling

- **Oracle** — the behaviour-preservation harness: seeded PRNG, frozen rAF, a scripted pilot, and a
  bit-exact fingerprint trace. (`.oracle.js`)
- **Debug seam** — the exported handle the harness drives the game through. (`window.__orbital`)
- **Tape** — a recorded play session, replayable frame by frame. (`tapes/`, `.harness/record.html`)
- **Codex** — the in-game rules screen. **Bestiary** — the in-game species and pattern cards
  (`bestiary.html`), also a standalone page.

---

## Retired names

Kept only so an old commit message reads correctly. None of these is the current word for the thing —
which is not the same as none of them appearing anywhere: `P.eddy` is still the live code name, and
`body` meaning an enemy is still all over `index.html` and `bestiary.html` (see *Naming conventions*).

**Eddy** → Overdrive's ring behaviour (`P.eddy` survives as the code name only) · **body** (meaning an enemy) → Dot ·
**cache** → the single orb an Anomaly drops on purge · **Flare** → missile · **World** → Star ·
**Purge** (of matter) → Fling; *purge* now means destroying an Anomaly and nothing else ·
**Anomaly Arena** → Boss Rush · **Lunger**, **Seeder**, **Spiral** → folded into Emitter and Sentinel ·
**Corona**, **Cryo**, **Singularity** → removed powerups · **Deflect**, **Reflect** → removed verbs ·
**Gate**, **Vice**, **Comb** → folded into the Wall and the Noose.
