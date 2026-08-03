# ORBITAL CRASH — extracted facts

**Generated 2026-08-03 from the running game**, not from the docs. Every number below was read out of
`index.html` or dumped live through the `__orbital` seam. This exists so [GLOSSARY.md](GLOSSARY.md),
[ROADMAP.md](ROADMAP.md) and [bestiary.html](bestiary.html) can be checked against reality rather than
against each other.

**This file is disposable.** It is a snapshot for one reconciliation pass, not a fourth doc to maintain.
Delete it when the cleanup is done — a generated file that goes stale is worse than no file.

---

## 1. The star

| | value |
|---|---|
| `P.r` | **15** — set once at boot, never reassigned, so every contact envelope is a compile-time constant |
| `P.maxHp` | 100 |
| `BASE_FIELDR` | 190 |
| ring orbit radius | **114** (`P.fieldR*0.6`; Overdrive: `*0.85` = 161) |
| regen | 2.6/s, after **3.8 s** without a hit |
| flip cooldown | see `P.flipCd`; a flip only *flings* above `RING_FIRE_HC` = **0.5** hold-charge |

## 2. Enemies — the real table

`contact envelope = e.r + P.r`. This is the number that decides whether you are hit; **no drawn ring
matches it** except the Charger's reticle.

| species | key | r | hp | mass | maxsp | seek | dmg | **envelope** |
|---|---|---|---|---|---|---|---|---|
| Drifter | `drift` | 11 | 1 | 1.0 | 3.4 | 0.22 | 10 | **26** |
| Dart | `fast` | 8 | 1 | 0.7 | 6.4 | 0.42 | 8 | **23** |
| Brute | `heavy` | 20 | **3** | 2.7 | 2.0 | 0.15 | **22** | **35** |
| Splitter | `split` | 14 | 1 | 1.1 | 3.2 | 0.24 | 12 | **29** |
| Mini | `mini` | 7 | 1 | 0.6 | 5.2 | 0.38 | 6 | **22** |
| Orbiter | `orbiter` | 10 | 1 | 0.9 | 4.7 | 0.30 | 11 | **25** |
| Bomber | `bomber` | 17 | 1 | 1.5 | 2.5 | 0.17 | 10 | **32** |
| Charger | `charger` | 13 | 1 | 1.0 | 3.0 | 0.14 | 16 | **28** |
| Neutral | `neutral` | 15 | **2** | 99 | 1.9 | 0.20 | 15 | **30** |

- **Hardest contact hit: Brute, 22.** The Bomber is *not* the hardest — it is Drifter-parity at 10.
- **Only Brute (3) and Neutral (2) have hp > 1.**
- Neutral `mass: 99` is what makes it immovable by the Field.
- `NEUTRAL_POP = 2` — one Shockwave kills a Neutral outright.

## 3. Damage channels — what can hurt an Anomaly

Exactly four. The two-channel rule (§7 of the glossary) exists to keep this list closed.

| channel | value | notes |
|---|---|---|
| Volley | `VOLLEY_DMG` **3** | per body that connects; fired by a hungry flip |
| Ring grind | `RING_GRIND_DMG` **1** | × `GRIND_MULT[variant]`, which is currently **empty** (all 1) |
| Baited charge | `CHARGE_DMG` **12** | requires `cst==='dash'` |
| Collapse | **15 % flat** | of `maxHp`, and nothing else |

Everything else — drift-in, fling, Bomber blast, Brute barge, close reversal — pays **0** by rule.

## 4. The Anomaly

`hp = round((13 + act*5) * 1.5)`, and Pulsar `* 0.75`.

| Epoch | hp | Pulsar |
|---|---|---|
| I | **27** | 20 |
| II | **35** | 26 |
| III | **42** | 32 |
| IV | 50 | 38 |
| V | 57 | 43 |

Body: `r 44`, `dmg 30`, `mass 999`, `maxsp 1.2`, `seek 0`.
Variants: `emitter`, `sentinel`, `pulsar` (`TEST_ORDER`, and Boss Rush cycles them in that order).
Hunt: `HUNT_SPD` emitter 1.15 / sentinel 1.3 / pulsar 1.05; `HUNT_ORB 0.85`, `HUNT_TANG 1.1`,
`HUNT_STEP 2.0`, `HUNT_BREAK 1.1`.
Dash telegraph: `LUNGE_TEL` **1.3 s**, `LUNGE_OVER` 150.

**There is no clock in the fight.** Destabilize and the 60 s flee were removed 2026-08-03. The only exit
is purging it.

## 5. Formations

`FORM_SPD 2.4` px/frame · `FORM_STEP 44` (< 52 = 2× contact radius, so no walkable midpoint).
`FORMS` = Wall, Noose, Pulse, Sorter — the **Comet is not in the rotation**, it has its own timer.
Auto-fire: after `elapsed > 42 s`, every `rand(30,46) s`, and never during a boss.
Comet: every `rand(200,300) s`, same gating.

| shape | bodies (measured, 5 spawns) | leaves behind after 30 s |
|---|---|---|
| Wall | 20 / 18 / 20 / 20 / 20 | **6** — deliberate; it goes out *and back* |
| Noose | 20 (`NOOSE_SLOTS` 22) | 2 |
| **Pulse** | **68** (2 arcs × 34) | **0** — retires off-screen |
| Sorter | 40 (2 walls × 20) | 2 |
| Comet | 1 | **0** — retires off-screen |

Pulse: `PULSE_ARC 2.62` rad (~150°), `PULSE_ARCS` **2**, `PULSE_GAP` **150** px → **1.22 s** between
arcs (measured). Gap is exactly linear in ΔR.
Noose: `NOOSE_SPIN 0.38`, `NOOSE_CAGE 1.6`, `NOOSE_BITE 5`, `NOOSE_BITE_R 24`, `NOOSE_BITE_DWELL 1.4`,
`NOOSE_WAVE 0.8` (the two-wave release, shared with the Wall).
Comet: `COMET_SPD 7.6` — far faster than anything else; nucleus is a Brute.

## 6. Charger

`CHG_WIND 0.9 s` wind-up · `CHG_SPD 9.5` · `CHG_REACH 250` px · `CHG_DECAY 0.99` · `CHG_DASH 1.2 s`
failsafe · `CHG_COOL 5 s` spent-then-rearm.
Lane locks **at wind-up entry**, triggered inside `CHG_REACH*0.95` = **237.5** px.

## 7. Bomber blast (restored 2026-08-03)

`BOMB_R` **120** · `BOMB_DMG` **2** · colour-blind · on death.
Does **not** touch the star, does **not** touch the Anomaly, pays **nothing**, does **not** chain.
Sized just past the 114 ring radius so it can clear a hoard.

## 8. Powerups

Roster is **three**. Singularity was removed 2026-08-03 (roster entry and all machinery).

| | id | dur | kind | measured roll rate |
|---|---|---|---|---|
| 🛡 Aegis | `aegis` | 6.0 s | timed | **45.1 %** |
| ⚡ Overdrive | `overdrive` | 6.0 s | timed | **43.9 %** |
| ✺ Nova | `nova` | — | instant | **11.0 %** |

`ORB_DROP_CHANCE` 0.008/kill · `ORB_CAP` 2 on field · safety drop every `rand(22,34) s` when the field
is empty · a purged Anomaly always drops one.
`FX` keys are now only `{aegis, overdrive}`.

## 9. Score / multiplier

- kill: `round(10 * mult * P.scoreMult)`
- Mote banked: `round(mult * P.scoreMult)`
- graze: `round(5 * mult * P.scoreMult)` — pays **no** Capacitor
- `mult = min(15, 1 + motesBank * 0.1)`
- Collapse tally at ≥8 kills: `N² × 4`
- purge: `round(200 * act * scoreMult)`

## 10. Spawn mix

`cap = min(330, 40 + elapsed + act*10)` — **never binding in practice**; observed fields peak near 97.
`interval = max(0.16, lerp(1.7, 0.30, intensity) - act*0.012)`; `count = 1 + floor(intensity*2.4) + floor(act/2)`.

| t | mix |
|---|---|
| < 20 s | drift 100 |
| < 45 s | drift 64, fast 36 |
| < 80 s | drift 42, fast 26, heavy 16, orbiter 10, charger 6 |
| < 125 s | drift 32, fast 22, heavy 15, orbiter 12, charger 10, bomber 9 |
| ≥ 125 s | drift `max(8,30-3a)`, fast 20, heavy `12+a`, orbiter 12, charger `8+a`, bomber `7+a`, split `4+a`, neutral `3+floor(a/2)` |

## 11. Achievements — 6, one hidden

`firstBoss` · `combo60` · `act3` · `bomberPoint` · `supercollapse` · `lancegild` *(hidden)*

---

# Fact-check findings

Things where the code and the docs disagree, or where a claim no longer means what it says.

### 1. "Danger Close" is now trivial — **still open**
`bomberPoint`: *"Take a Bomber's impact and live."* The Bomber hits for **10**, Drifter parity, against
100 max HP. Any player survives any Bomber hit unless already nearly dead. The achievement was written
when the Bomber hit for 26 and its payload did 30 through shields. **The Brute (22) is now the hardest
contact hit** and is the natural target for this achievement. Flagged repeatedly; not yet acted on.

### 2. The Strain section is orphaned — **for the doc pass**
GLOSSARY still carries *"The Strain — dormant with the Singularity"* with a live-voice paragraph and a
three-row table. It says `ehStrain` is "unreachable while ◉ is off the roster" — but `ehStrain`,
`EH_CLOSE`, `ehT` and `P.ehorizon` were **deleted**, not disabled. This belongs in §11 (the index of
removed things) as one line, not as a section describing behaviour that has no code.

### 3. bestiary draw-code comment contradicts the restored blast — **fixed 2026-08-03**
The Bomber card's comment said the standoff ring *"promises a radius the Bomber no longer has."* It has
one again (120 px). Corrected in the same commit as this file.

### 4. Claims that were checked and are **correct**
- Contact-envelope table in GLOSSARY §3 (Mini 13.3 vs 22, Dart 15.2 vs 23, Drifter 20.9 vs 26,
  Bomber 32.3 vs 32, Brute 38.0 vs 35) — all five verified against `1.9r` and `e.r+15`.
- "Six achievements, one secret" — 6 entries, exactly 1 `hid:true`.
- Orb rates: 0.8 %/kill, cap 2, 22–34 s safety window.
- `NEUTRAL_POP = 2`; Brute is the only body that walks out of a Collapse.
- Boss HP formula and the Pulsar ×0.75.
- Pulse "up to 34 bodies per arc" — 68 total across 2 arcs.
