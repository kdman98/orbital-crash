# ORBITAL CRASH — Feature Ledger

The living record of what's shipped, what's being built, what's parked, and what needs
balance attention. Vocabulary per [GLOSSARY.md](GLOSSARY.md).

---

## ✅ Shipped

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

**Documents.** 34 drift fixes. The largest were structural: **286 lines of this file — 40% — were a byte-identical copy of POLARIS's ledger**, and the Backlog, Balance watch-list and Decisions log the file presented as its own were *POLARIS's*, six of nine backlog items naming systems this fork deleted. Those now sit under Pre-fork history with their headings demoted; the two sections above are this game's, written fresh. Also: the 2026-07-17 comfort pass was recorded twice with identical numbers (the shorter copy went); three stale `index.html:NNNN` citations now name stable identifiers instead of line numbers into a file that changes daily; entries superseded later the same day carry a `⤴` marker rather than being edited, so the measurements and the reasoning stay verbatim; and the folder-rename date was **2026-07-22 in README and 2026-07-27 in its own entry** — 07-27 is right.

**Also:** `git init` — this was 228KB of measurement-derived tuning with no version control at all.

`3585 → 3384` lines, and the file no longer contains anything that cannot run.

### The reversal stops narrating itself (2026-07-29)
Player brief: *"dont have to show volley x6 things in text."*

`VOLLEY ×n` and `FLUNG ×n` popped over the core on every hungry flip. They were a **third text channel** that GLOSSARY §8 had never sanctioned — that section lists exactly two, the pickup pill and the achievement toast — and they failed its rule for the same reason a centre banner does: they printed a tally *of the thing you had just watched happen*, on the exact frame your eyes should have been on the matter you threw. The reversal already announces itself with a ring at the burst's true radius, the bodies visibly launching, a screen kick and a sound. Both counters survive as variables because they gate that feedback; they are simply never rendered. A dead `fired` counter — incremented, never read, and never printed even before this — went with them.

### Gathering stops punishing movement · the Charger becomes an arrowhead and a weapon (2026-07-29)
Player brief: *"grinding in-game is quite difficult, evading all missiles, need to move slow to keep dots in ring, etc."* · *"charger should look little different to expect not pulling into ring, maybe dealing significant damage to anormaly when charging might be good choice"*

**Two halves — and the first pass got one of them wrong.** I initially reported that "you have to move slow to keep dots in the ring" was false, on a test that strafed smoothly at up to 13 px/frame and kept 100%. The player pushed back — *"no it doesnt, it just might followed core. move faster than you tested"* — and was right. The follow is `(pointer − P) × 0.185` with **no cap** outside the brief post-resume window, so 13 px/frame is roughly a third of what a real input reaches. Re-measured: **sustained** speed genuinely does not shed a ring (13 / 25 / 45 / 80 px/frame all keep **93–100%**, because bodies settle into a steady lag inside the Field) — but a **corner-to-corner flick peaks at 135 px/frame** and leaves the ring hundreds of px behind on the wrong side, keeping **only 36%**. Direction reversal is the shredder, and dodging is nothing but direction reversal. A test of smooth motion at a third of top speed could not see the thing being reported.

**Ring hysteresis** fixes it: once gathered, a body keeps membership for **0.8s** after a move outruns it and the spring reels it back the whole time; past **2.4× the Field** it is genuinely lost rather than lagging. Flick every 0.75s → **93%** (from 36%), every 0.42s and 0.25s → **100%**, sustained 45/80 → 100%. The boundary is real, not stickiness: a 300px displacement keeps 10/10, a 600px one drops to 4.

**The other half was the gather rate.** A Drifter's ceiling is `3.4×1.9` ≈ **6.5 px/frame** while a steering World reaches **13+**, so a player weaving to survive simply outruns their own ammunition — measured average ring **3.2 while dodging against 4.3 standing still**. Gathering and surviving were pulling against each other, which is exactly wrong for a mechanic whose whole premise is holding close range under fire.

Fixed by removing the friction rather than paying more for enduring it: core gravity **0.16 → 0.30** with reach **1.5× → 1.8×** the Field, and like-charge that is closing under that pull now gets **ring-grade speed headroom (2.9 instead of 1.9)** so it can actually follow a moving World. Result over 8 trials each: **3.3 dodging vs 2.6 still** — movement no longer costs you the gather. The approach still settles cleanly (272→227→154→111→**114px**, no overshoot, no re-exits), the hostile side is untouched (opposite colour still enters the Field at **1.47s**, unchanged), TTK holds at **15.0 / 13.5 / 14.3**, and grind-only remains **0 solo kills in 5** per kind (medians 3.5 / 5 / 7).

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

**Core gravity.** Holding a pole exerted no claim at all on the matter it was meant to gather — the magnetic loop skips like-charge (ring-captured instead) and ring capture is gated on `d < fieldR`, so the two colours approached at rates **identical to the frame**: from 300 / 260 / 220px, same *and* opposite both entered the Field at **1.47 / 0.97 / 0.48s**. Like-charge now gets a gentle inward term outside the Field, full at the rim and fading to zero at 1.5× it: **1.23 / 0.73 / 0.35s**, 16–27% faster. Kept small next to a Drifter's own 0.22 seek — your colour should lean toward you, not be vacuumed. The hostile side is **unchanged** (1.47 / 0.97 / 0.48 — the World never sucks in another charge) and the ring equilibrium inside is untouched (119.5px at 6.4 px/frame, as before).

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

### Ring spin restored (2026-07-29)

> ⤴ **Superseded the same day** by "Ring spin dialled back" above — the value landed at **1.2**, not 1.6. Kept for the bleed-vs-spin diagnosis and the ring-clamp headroom (2.9), both still live.
Player ask: *"dots orbiting around core should be faster. we nerfed it before, right?"* — **Yes, though it was never labelled one.**

**The evidence.** Rings measured **3.6 px/frame, 3.23s per revolution**. That number was not a speed decision: it fell out of the entry at ROADMAP *"Rings now firmly HOLD like-charge (spring pins matter to `fieldR·0.6` + strong tangential spin + **extra velocity bleed**)"*. The bleed is `0.80` where ordinary matter gets `0.86`, and ring steady state is `spin/(1-bleed)` — so cutting the headroom from 0.14 to 0.20 cut the whirl by ~30%. Corroboration that it is the same number: the Eddy rework entry records spin *"3.6→6.8"*, and 3.6 is exactly what measured today.

**Raised the spin, not the bleed** (0.9→1.6, Eddy 1.7→2.8). The bleed is the grip that stops rings drifting off their radius; the spin is pure tangential. Ringed bodies also got their own speed-clamp headroom (`2.9` vs `1.9`×DOTSPD) — at 1.9 a Drifter caps at 7.9 px/frame, which the new spin would saturate, flattening every body to the same whirl and squashing Eddy's "wide AND fast" to a ~1.2× edge.

**Measured:** base ring **3.6 → 6.11 px/frame, 3.23s → 2.05s per revolution**. Eddy: 218px radius at **10.75**. Nothing clamps at base spin (5.5-6.3 across Drifter/Dart/Brute); under Eddy only the **Brute** hits its own ceiling — 6.92 against 7.08, while a Drifter reaches 10.75. So mass reads in the ring, but only when the ring out-paces the slowest bodies in it.

**⚠ It is a large balance swing, and it points the opposite way to the last three changes.** A faster ring sweeps more space per second, so it annihilates more incoming matter — and since missiles are now absorbed by any body, it intercepts more of those too. Same bot, same fights: orbiting at **270px went 4-5K/10-11D → 8K/7D and 9K/6D**; at **150px, 6-8K/7-9D → 7K/8D and 9K/6D**. Ranged play, which the longer fling had just made the worst option, is now roughly as good as closing. Flagged, not tuned — the ask was for feel, and whether the defensive knock-on is welcome is the player's call.


### The fling reaches further (2026-07-29)

> ⤴ **Superseded** by "The Fling starts firing" above, which found the reach was never the problem — the whole verb was unreachable code. Kept for the throw-physics measurements.
Player ask: *"let's fling further."*

`7.2 → 12.0 px/frame` over **1.4s** (was 6.4→10.6 over 0.9s), and the proximity scale's rim floor went **0.45 → 0.65** — at 0.45 the bodies furthest from you, exactly the ones a wider push is for, were thrown the least. Measured in ordinary play: **~447px net throw, peaking ~550px** (was ~210px), everything alive, everything back on your core by ~9s. About 4 bodies per hungry flip.

**Two measurement errors caught on the way, both mine.** The first pass reported 455-626px, but that test cleared `e.ring` by hand before flipping — a state that does not occur in play, since the Field (190px) rings everything inside the fling radius (170px). The second pass corrected for that and reported **143px**, which was also wrong: the filter `e.flung>0` catches **scattered rings** too (3-8px/frame, ~30px of travel), and averaging those in dragged the figure down. The fling sets `flung=1.4` and ring scatter sets `0.25`, so `e.flung>1.0` separates them — and a sanity check that no thrown body started beyond the 170px cap confirms the third number. Worth keeping as a habit: a distance figure means nothing without a check that the sample only contains what you think it does.

**It made ranged play distinctly worse, which was not the intent but is probably right.** Since missiles became **absorbed by any body**, matter near you is cover — and a longer fling throws your cover away along with the threat. Same bot, three independent blocks of 15 fights: orbiting at **270px fell to 4K/11D, 4K/11D, 5K/10D** (from 7K/8D), while closing to **150px held at 8K/7D, 6K/9D, 8K/7D**. The gap between hanging back and closing is now the widest it has been. Flagged rather than tuned: the interaction is emergent from two changes the player asked for separately, and whether it reads as depth or as punishment is a feel question.


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

**FIVE MISSILE KINDS**, per the "variety appropriate to evade" call — each with a different answer, so a fight asks more than one question: **volley** (a spread that leads your motion → cross it), **seeker** (turns onto you 0.85s then commits → run, don't juke: turn radius `v/ω` = 60px so it out-turns you, but 3.3px/frame cannot out-run a World doing 6.2), **ring** (expanding wall of 13 with one seam → be in the seam), **mine** (lobbed onto the ground around *you*, arms, draws its exact blast → leave), **spear** (telegraphs a line and tracks you along it, then fires → leave the line).

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
- **Cryo is now the heal.** Player report: *"cryo is still somewhat useless."* Correct — freezing the field just made things passive, and the shatter chain was offence the player already had. The freeze is now the *setup*, not the payoff: while the field is frozen the **core mends**, and crucially the mend **ignores the out-of-combat regen lockout** (`hurtT>3.8`). That is the whole point — it is the only healing in the game that works while the arena is still full and still shooting at you. Measured: under constant fire, normal regen recovers **0 hp**; Cryo recovers **+44** over its 5.5s. Carving the frozen crowd **accelerates** it (+1.5/body, capped +20 → **+64** total when you actively carve), so the shatter chain now feeds the heal instead of being a separate toy. At full HP the cold **banks as Capacitor charge** (+0.26 of a Collapse) rather than evaporating, so the pickup is never dead weight. New: `mendCore()`, `CRYO_MEND`/`CRYO_SHATTER_MEND`/`CRYO_SHATTER_CAP`, `cryoBank`, batched `+N MEND` floaters, and a breathing cold halo + inward frost motes at the core so the heal is something you *see* happening to your world.
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
- **Seeder buffed** (bot read ~0–8%, only ~4 HP at Act 1): 2→3 swarmers per wave (4 at Epoch III+), faster (seedT 2.6–3.8→2.2–3.2s), and the mix now includes **Orbiters** that curve in (a fleeing world can't just outrun them).
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
- **Added — powerup drops (the only progression).** Any annihilation has a small chance to shed a glowing **orb** (a safety drop floats in when the field is empty; a purged Anomaly drops a cache). Rates are tunable constants near the top: `ORB_DROP_CHANCE` (0.008/kill), `ORB_CAP` (2 on field), `ORB_SAFETY_MIN/MAX` (22–34s, empty-field only), Anomaly cache = 1 orb. **Tuned down 2026-07-21** ("spawns too frequently"): from ~1 orb / 5–7s to ~1 / 15s under sustained aggressive play (measured), sparser in calm. **Steer your world into an orb** to collect — the effect is **instant and temporary**; grabbing the same one refreshes its timer. Roster (`const POW`): **◉ Singularity** (5s black hole that devours nearby matter), **🛡 Aegis** (6s shield), **❄ Cryo** (5.5s — incoming matter crawls), **☀ Corona** (6s — field burns opposite matter), **⚡ Overdrive** (6s — faster world + wide/whirling rings), **✺ Nova** (instant screen-clear shockwave, rarer weight).
- **Key architecture**: with no permanent upgrades, base stats are constants, so `stepFX(dt)` just **toggles the existing tuned physics flags** each frame from the effect timers — `P.corona`, `P.eddy` (Overdrive borrows Eddy's wide/fast rings), `P.enemySlow` (Cryo 0.34), `P.moveMult` (1.4), `P.fieldR` (BASE_FIELDR 190 → ×1.28), `P.ringMul`, `P.shield` (Aegis = 3), and `P.ehorizon`+`ehT` (the black hole **reuses the old Event-Horizon devour code**, pinned open at full grip). Every effect rides code the game already balanced; it just expires. New: `stepFX`, `dropOrb`, `stepOrbs`, `collectOrb`, `fireNova`, `blackholeCollapse`, `drawOrbs`.
- **HUD**: XP bar → a left-column stack of **active-powerup chips** (icon + name + draining timer bar). Menu Arsenal → a one-line powerup blurb. Death screen dropped shards/next-unlock; pause "build" → "active powerups". Codex "Offers/Keystones" section → a **Powerups** section.
- **Verified**: `node --check` clean; dangling-symbol grep clean; in-engine bot confirmed all 6 powerups toggle **and restore** on expiry, black hole grips 12 planted bodies (frame 2) → devours all + banks 27 motes, orbs drop from kills + collect on contact, flip taps reverse polarity, 25s active run scored 4523 with zero errors. POLARIS (roguelite) is untouched in its own folder.
- **Renamed** the game to **ORBITAL CRASH** (title/logo/codex/bestiary + doc headers); own localStorage namespace `orbitalcrash_*` (independent best score). Debug seam is now `window.__orbital` (with `__polaris`/`__flux` aliases for the harness).
- **Post-review fixes** (from a 23-agent adversarial pass — 4 confirmed, the rest correctly ruled intended-design false-positives):
  - **[medium] Singularity had a protection gap**: **Chargers** (early-out before the devour block) and **Anomaly Flares** (separate array) still hit the core full mid-black-hole and broke the streak. Rather than blanket i-frames (which would make it strictly better than Aegis), the well now **grips chargers within 230px** (they fall through to the devour) and **swallows Flares within 170px** — matching "devours nearby matter" while staying distinct from Aegis's pure shield. Verified: 6 chargers + a core-bound Flare → 0 HP lost, streak kept (control with no black hole: −14 HP).
  - **[low]** removed orphaned `.bchip.spec` CSS, the dead `state==='levelup'` render disjunct, and stale `menu|levelup|shop` comments.
  - Hardened `stepOrbs` collection (splice before `collectOrb`, since a Nova pickup can `killBoss`→`dropOrb` and mutate `orbs` mid-loop).

## 🧊 Backlog (agreed direction, not yet started)

This heading used to sit on POLARIS's backlog, six of whose nine entries named systems this fork deleted
at the fork — Offers, keystones, cards, shards, the endgame ladder. Those are preserved below under
Pre-fork history; they were never this game's plan.

- **Touch controls** — parked pending the launch-environment decision (see the 2026-07-27 hardening entry).
- **Moment Engine stretch** — stereo-panned kill pops, low-HP heartbeat + lowpass, storm drum layer. The
  Moment Engine itself is live here (`timeScale`, GLOSSARY §10); this is the audio half of it.
- **HUD hierarchy pass** — the meters read as equals; only Capacitor + Streak deserve to be loud
  (deferred from the player review).
- **A chase reward for the Sentinel that is not contact damage** — the obvious version measured backwards
  (see "Ring grind priced down"), so the idea needs a different vehicle, not a different number.
- **The powerup roster is still mundane** — four temporary drops, all of them straightforward. Noted
  repeatedly, never designed.

## ⚖️ Balance watch-list

Live flags for *this* game. The list that used to be here tracked Deflect, Reflect, Offers, rarity pity
and keystone power — most of those systems no longer exist.

- **The four-powerup bag** — the roster went six → four (Cryo and Corona removed 2026-07-29) and Aegis is
  now exception-free. Watch whether four reads as too few over a long run.
- **No heal beats the lockout** — since Cryo went, Integrity regenerates only after 3.8s untouched and
  nothing else heals. Disengaging is the entire healing verb; watch that a bad Epoch is still recoverable.
- **Boss balance is bot-derived** — every TTK number in this ledger comes from a scripted pilot, not a
  human. The Sentinel measures hardest. Confirm against a real player before trusting that ordering.
- **Ring grind at 1, against HP ×1.5** — these two were repriced in the same pass and only mean anything
  together. If hoarding turns out to make the Volley optional in real play, read both before moving either.
- **The Emitter kills the test bot 11 times in 12** — and did 12/12 before the balance pass, so it is not
  new. The bot holds a fixed 150px orbit and never dodges, which is the worst possible way to fight the
  kind that hovers and shoots point-blank, so this is probably an artifact. Needs one human playtest to
  say whether the Emitter is genuinely the hardest kind or just the least bot-legible.
- **Bomber spawn weight vs. its damage** — `['bomber',9]` and `['bomber',7+a]` were both priced for a body
  you could walk through. Each one now touches for 26 (36.4 by Epoch VI). Damage and weight were
  deliberately not changed in the same pass so the playtest stays readable: measure Epoch IV–VI, then
  flatten to `['bomber',7]` if it reads as attrition rather than positioning.
- **Score inflation** — Point-Blank ×3 stacks with the mote mult (cap ×15) and the Collapse tally (N²×4).
  Best-score comparisons against old saves are apples-to-oranges.

## 🏛 Pre-fork history (POLARIS)

Everything below this line is the **POLARIS** ledger, inherited wholesale when this game was forked out
of it on 2026-07-21. It is kept because it records why things are the way they are — but it describes a
roguelite with Offers, keystones, cards and shards, none of which exist here. Its backlog, watch-list and
decisions log are POLARIS's; the two sections directly above are this game's.

The same log lives in [`../polaris/ROADMAP.md`](../polaris/ROADMAP.md), which is still maintained.

#### POLARIS — Event Horizon spam-invuln fix + Eddy collision fix (2026-07-21)
- **EH spam invulnerability closed.** Holding EH grants iframe; you could re-press endlessly and stay shielded forever. Added a recharge: after the well collapses (release or auto), `ehCd = EH_CD` (2.0s) must elapse before it can reopen — holding during recharge just does a normal flip, no black hole, no iframe. Verified: a spammer now has a ~2.0s **vulnerable** window every ~3.2s cycle (iframe drops to 0). A dim violet recharge arc on the world shows the cooldown filling.
- **Eddy no longer collides with Event Horizon** (and its premise was broken by the no-pull change — nothing "beelines in" anymore). Repurposed: Eddy now shapes YOUR RINGS instead of opposite matter — like-charge orbits **wide** (`fieldR·0.85` vs `0.6`) and **fast** (spin `1.7` vs `0.9`), a broad sweeping perimeter shield that annihilates threats farther out. It touches no opposite matter, so nothing fights EH's devour. Verified: ring radius 164→238, spin 3.6→6.8, opposite-matter tangential ≈0. Card + Eddy field-spin visual updated. Stacks with Heavy World's `ringMul`.
- Audited the other keystone/mechanic pairs (Corona/EH, Ferrofluid/rings, Shepherd Moons/baseline rings, ring-fire/EH) — no remaining hard conflicts.

#### POLARIS — Ferrofluid buff (was near-useless) (2026-07-21)
Root cause of "ferrofluid is weak": the mine killed matter of the charge opposite to the **Mote** (`e.color===m.color` skip), but the Motes that actually linger as mines are the opposite-charge ones (your own colour hoovers away), so the standing minefield was targeting **your own ring**, not threats — and the trigger was a 7px pinprick with no inward pull to sweep matter onto it. Fixes:
- **Targeting**: mines now catch matter of the charge OPPOSITE your **world** (`e.color===P.polarity` skip) — i.e. actual threats, never your like-charge ring.
- **Chain reactions**: a mine kill drops fresh loot → fresh mines. Verified: 16 threats packed into a Mote field are wiped in ~10 ticks as it cascades (Motes 14→22 during the chain).
- **Trigger radius** `e.r+7 → e.r+16` (a real net), with a matching wider trigger-ring visual + a violet detonation ring.
- **Persistence**: under Ferrofluid, dropped Motes live 7–13s (was 4–8) and the field caps at 60 (was 40) → a real standing minefield accumulates.
- Card + Codex text updated to teach "Motes are mines that chain-detonate." Balance: not degenerate — Motes are also your XP/mult, so arming the field trades income for defense, and chains need dense threats.

#### POLARIS — ring-fire is now a CHARGED (Hungry) flip only (2026-07-21)
Quick-flip spam was cheaply sustaining. Now the ring only fires once hold-charge passes `RING_FIRE_HC` (0.5 — ~0.75s held): a **quick tap just reverses poles** (reposition / parry / colour-swap, no discharge), and a **charged "Hungry" reversal fires the ring**, power ramping `8 → 32` from the load threshold to full charge. The hold-charge gauge on the world now turns **hot white when loaded** (with a tick marking the fire threshold while charging) so the "ready to fire" state is legible. Codex Hold-charge section rewritten. Verified: quick flip (hc 0.07) fires 0; charged flip (hc 1) fires all at speed 32; charge-aware bot now out-survives quick-flip spam (avg ~104s vs ~78s).

#### POLARIS — removed Resonance perk (2026-07-21)
Cut the **Resonance** stat (`greed`, +% score, cap ×3). `scoreMult` stays at its default 1 everywhere (all scoring intact — you just can't buff it via a card anymore). Pool: 25 → 24 perks (10 stats). Note: the "Point-Blank Resonance" scoring mechanic (×2/×3 by Field depth) is unrelated and stays.

#### POLARIS — flip fires the rings; Event Horizon → mini-Singularity (2026-07-21)
Follow-up after the no-pull pass left the reverse verb feeling purposeless:
- **Reverse poles now FIRES your rings.** On flip, every ring-captured body is flung radially outward as an annihilation projectile (opposite colours annihilate on contact regardless of your polarity) — scaled by hold-charge, briefly clamp-exempt via `e.flung` so it reads as a shot. This is the point of the flip now that nothing is vacuumed in: **gather a ring by drifting matter in, then flip to fire it** ("turn your own rings against the sky", literally). Bot avg death ~44s→~57s with sharply higher scores (one run L10/Epoch II/76k) — flip is now a real offensive verb, not a situational parry.
- **Event Horizon reworked into a held mini-Singularity.** HOLD reverse → a small black hole opens at the world that DRAGS in and DEVOURS nearby matter (banks a Mote each, any charge incl. Neutrals), shields you (iframe) and vacuums loot while open. Smaller than the Collapse Singularity (devour radius 22–32px vs 46; reach 80–230px vs whole-arena) and shorter (auto-collapses at `EH_MAX`≈1.2s — can't be held forever; re-press to reopen). RELEASE reverses your poles; the collapse recoil flings any un-devoured leftovers. New devour loop in the force loop, timer/shield/spark block, `eventHorizonRelease` → collapse/implosion, `drawEHorizon` → darkening core + accretion rings + tight dashed horizon, and the AUG card text. Verified: devours + banks, auto-collapses + flips at ~1.2s even with matter present.

#### POLARIS mechanics pass — no-pull, keystone fork, 3-specials, ring hold (2026-07-21)
Playtest-driven changes on top of the re-theme fork:
- **Deleted the inward pull on opposite-charge matter.** The world no longer vacuums another charge in — opposite matter drifts toward you only under its own gentle `seek` (chase), and annihilates against your rings/core. Force loop now `continue`s the `dir>0` (attract) branch. Shifts the loop from "gather-and-flip" to "**steer your world into** opposite matter." Game still functions (no-input smoke run still scores; bot avg death ~44s). Ripples fixed: **Heavy World** (was "+% pull on opposite matter", now dead) repurposed → **ring grip & spin** via new `P.ringMul` (default 1, cap 2.2, used in the ring spring/spin); dead `hcStep` removed; Hungry Hold's "reels opposite matter in" copy dropped (hold-charge still amplifies the reversal shockwave); tagline/Codex Charge Law/Hungry Hold/bestiary legend rewritten to "drifts toward you… never sucks it in… steer into it."
- **Rings now firmly HOLD** like-charge (spring pins matter to `fieldR*0.6` + strong tangential spin + extra velocity bleed) — holds even when matter is fast. 14 test bodies lock into a uniform ring.
- **Faster field** via `DOTSPD` (1.22): speeds up rings, neutrals & wandering matter — NOT the opposite-charge approach ("don't suck in another colour"). Made the game harder (bot ~55s→~44s, FLUX-band).
- **Keystone Fork**: levels 5/10/15 now show **three** keystones to pick from (dedicated "CHOOSE A KEYSTONE" screen; Reroll swaps the three, Banish hidden). Consequence: 3 keystones taken per run (up from optional).
- **Specials**: every Anomaly purge now offers **3** specials (dropped the shard/achievement gate on the Anomaly reward — `isUnlocked` returns true for kind `special`; Arsenal shows them "◆ Anomaly reward").

#### POLARIS re-theme fork (2026-07-21)
Forked flux/ → polaris/; re-skinned the magnetic core into a magnetic WORLD (planet) in space; the verb Flip → Reverse poles; added baseline orbital rings (like-charge matter in-field is swept into a circling ring — a gentle Congregation-always-on via a tangential force in the enemy force loop; playtested, survivability ~unchanged, avg death ~55s vs ~44s in flux, mildly healthier early game); re-themed all player-facing strings, perk names, the Codex, and enhanced the planet render (atmosphere, lit hemisphere, tilted ring halo). Mechanics otherwise identical to FLUX.

#### Playtest-review pass (2026-07-21)
Drove an autonomous bot through the real input surface (dispatched pointer/space/clicks) for 13 games + a 5-lens review with adversarial verification (33 findings raised, 29 refuted as bot-skill artifacts, 4 stood). Fixes:
- **Field falloff floor** — this is the real answer to "Deep Gravity is only UI / matter sits inside the field untouched". The attract force was pure `t*t`, so the outer ~half of the ring was near-inert and a wider Field only *looked* wider. Added a floor: `tf = 0.16 + 0.84*t*t` in the force loop. A body at 250px (maxed 342 Field) now pulls **43px/15 ticks (was 8.9)**; the field grabs the instant a body crosses its edge, keeps the strong near-World grip, and visibly sorts charges (opposite-charge in / like-charge out). Neutrals + boss still ignore it (floor is inside the magnetism guard). Bot survivability unchanged (avg 43.6s vs 44.8s) — faster ammo delivery nets against faster annihilation.
- **World-text declutter** (the "one change first") — deleted the mult-milestone floater (`motesBank%10`, duplicated the live `#mult` HUD) and swapped the DEFLECT text for a white clash-**ring** (charge bar + sfx already report the parry). Added a 5-step occupancy nudge in `pushText` so the remaining World-anchored labels stack legibly instead of overprinting into a smear. Verified visually (POINT BLANK / CHAIN / MULT now step vertically).
- **Anomaly HUD collision** — the integrity bar sat on top of the EPOCH/LV/TIME centre text on every boss. Moved `#bossbar` `top:70→104` (clears `#center`'s real ~69px bottom), `.bl top:-16→-15`. Added a `boss.y ≥ 138` clamp after the force loop (guarded on `bossTime>1.6` so the `y:-60` entrance dive still plays) — keeps the Anomaly's body off the HUD strip. Verified: World pinned to top wall, boss held at y=138.
- **Docs/comments truth-up** — stale "reset on hit" comments (motesBank halves, not resets) fixed at both sites + the mult-model line in this ledger; added "Banked Motes are also your only XP" to the Codex Score panel (Motes-only XP was undocumented player-facing).

Left as **bot-skill artifacts, not bugs** (verified): "died holding full Capacitor / 1-2 collapses per run" (bot's ≥8-in-range collapse gate, unmeetable after a Ferrofluid board-wipe); "boss took 4 dmg in 12s" (bot landed zero Flare Reflects — a reflect-aware policy killed the Epoch I Anomaly in **7.7s / 6 reflects**; the boss is a reflect puzzle, working as designed); the parry-window sweep (all n=1, within-condition spread swallows it). The quiet opening is genuinely ambiguous — likely the bot reversing at 90px vs the ~52px Deflect window paying nothing — parked pending a human tester.

#### Bugfix pass (2026-07-17)
- **Removed the "like-charge — harmless" teaching UI** (ring + floating text) per request — the harmless like-charge pass-through mechanic stays, just no cue.
- **Deep Gravity** — reported as "only UI is wider"; verified the radius genuinely applies (fieldR 190→342). Diagnosed as a *perception* thing at the time (gentle edge attraction) and left as-is. **Superseded by the 2026-07-21 field-falloff floor** — the gentle edge was in fact the whole problem; now fixed properly.
- **Event Horizon input rework** — it "didn't work" because the trigger was tied to `holdT` (time-since-reversal), and **holding the key made auto-repeat re-fire the reversal every 0.28s, resetting the well**. Rebuilt to the player's spec: a dedicated `ehT` timer driven by the reverse button being **HELD** (mouse or keyboard, key-repeat ignored); **release reverses + flings**. Hold-to-open / release-to-scatter now works on both inputs. Verified: hold captures without reversing, release reverses + clears; no-EH tap unchanged.

#### Foundation (pre-ledger)
- World polarity loop: Reverse / Shockwave / Hold-charge / Collapse / Annihilation
- No-hit Streak → Capacitor economy; XP level-ups
- Stat augments (rarity rolled per card ×1 / ×1.7 / ×2.6) in the Offer; Special augments from Anomaly purges
- Anomaly boss: reversal-immune, hexagon Flare volleys, bait-to-erode
- Epochs (Drift/Ember/Bloom/Tide) × Phases (Calm/Build/Storm/Boss); Arsenal meta-shop; achievements; Bestiary page + in-game overlay

#### Bug-fix pass (2026-07-15)
- **Ghost colors** — COL.gold/violet/lime were undefined at 8 fanfare call sites; added
- **Empty Purge** — pool-less Anomaly reward now pays full Capacitor + 40◆ ("SPECIAL CACHE")
- **Collapse-proof Bombers** — your ult no longer triggers Bomber payloads (`!unstable` guard)
- **Fast Reforge** — death button restarts instantly; "Arsenal & Menu" ghost button added
- **Arsenal kind-tag collision** — `.stat` HUD rule was yanking Stat tags out of card flow (`kt-` prefix fix)

#### Big pass (2026-07-15) — "make score change how you move"

| # | Feature | One-liner | Verified |
|---|---|---|---|
| 1 | Moment Engine | global `timeScale` slow-mo powering all ceremony beats | code-reviewed (rAF-driven) |
| 2 | Point-Blank Resonance | kills inside the Field score ×2 / deep ×3 | ✓ exact ×3 measured |
| 3 | Near-Miss Economy | exit-award Graze (+0.6%) + Deflect parry (+3%/body) | ✓ both fire |
| 4 | Streak lifecycle | named tiers (AWAKENING → TRANSCENDENT) + streak-burst severance | ✓ 32-streak → +4.8% burst |
| 5 | Hungry Hold | full hold pulls opposite-charge matter ~1.6× harder | ✓ 6.2px vs 3.9px |
| 6 | Gilded Bounty | gold body, 6s timer, 250×epoch jackpot | ✓ +270 score, +6.7% charge |
| 7 | Colour Law | Flares annihilate bodies · dashing Charger plows · Bomber AoE 3hp + boss chip | ✓ all three |
| 8 | Storm Shift | storm swaps colour mid-wave, surge + banner | code-reviewed |
| 9 | Death Receipt + Flare sirens | "Core lost to: Anomaly Flare · Epoch I calm" + edge chevrons | ✓ receipt verified |
| 10 | Anomaly destabilize | 45s "DESTABILIZING" label + 0.6× volley cadence, "ANOMALY FLED" at 60s | code-reviewed |
| 11 | Like-charge teaching ripple | first 3 harmless touches say so | code-reviewed |
| 12 | Motes + Reverse-Vacuum | mult = 1+0.1×banked (cap ×15, **halved on hit**); Motes are also the sole XP; opposite motes need a reversal | ✓ drop/hoover/vacuum/mult |
| 13 | Collapse Ceremony | full chime → 0.45s inhale slow-mo → detonation → "N ANNIHILATED" N²×4 tally | ✓ tally + inhale |
| 14 | Reroll / Banish / pity | 1 reroll/Epoch (unused→Capacitor), 2 banishes/run, 6-Common pity | ✓ full UI flow |
| 15 | Next-Unlock Beacon | death screen progress bar to cheapest locked augment + Arsenal afford-pulse | ✓ label + bar |

Rebalance applied with the pass: kill charge 0.008→0.006, streak trickle cap 0.045→0.035
(compensating for the three new Capacitor income streams).

#### Player-review pass (2026-07-16) — "decisions and variety, not more income"

Balance surgery (from the in-character player review):
- **Graze pays no Capacitor** — score crumb + sfx only. Grazes are luck as often as skill;
  charge income should be things you *chose* (kills, Deflects, Reflects, Motes, streak).
  Directly protects the ≥45s time-to-first-Collapse target.
- **The Mote bank HALVES on a hit** (was: zeroed). One clip no longer deletes HP + Streak +
  Mult simultaneously — Streak keeps the perfection identity, the bank keeps greed.
- **Overcharge is additive** (was: compounding ×1.26 per stack — the degenerate build:
  10 Epic stacks used to mean ×10 charge gain; now +26%/stack on the base).
- **Thorn cut CANCELLED** — review mislabeled it from the code id; `thorn` is *Unstable
  Field* (Field corrosion DoT), on-fantasy and the only passive answer to Neutrals. Kept.

Features:
- **Keystone Cards** ✓ — gold rule-changers, one guaranteed in the Offer at levels **5/10/15**:
  **EDDY** (Field spins, matter spirals in) · **UNDERTOW** (Shockwave pulls inward) ·
  **EVENT HORIZON** (opposite-charge matter corrodes inside the Field, 1.1/s) · **FERROFLUID**
  (unbanked Motes are mines). One take each; rerolls may swap which; picking any card resolves the fork.
- **Anomaly SPIRAL variant** ✓ — first boss of a run is always the teaching HEX; later ones
  roll 50/50. SPIRAL = 9-flare stream, one every 0.22s from a sweeping angle, each re-aimed
  at your current position. Verified: gaps 0.23s ±0.01, hex control fires 6 same-instant.
- **Discovery layer** ✓ —
  - **Flare Reflect**: last-instant reversal ricochets a Flare back at the Anomaly for −6
    (double erode), +4% Capacitor, gold livery, can't hurt you. Codex carries only a *rumour*.
  - **Neutrals block Flares**: the unkillable ball is now portable cover — and the second
    passive answer to placing Neutrals somewhere useful.
  - **Chain reactions**: machinery (Flare / Charger plow / payload / mine) pops a Bomber whose
    blast takes 2+ bodies → "⚙ RUBE GOLDBERG" + bonus.
  - **3 secret achievements** (Return to Sender, Rube Goldberg, Skeet Shooter) — render as
    "???" in the Codex until earned, pay ◆80 on the spot.

Verified: all 4 keystones behaviourally (tangential velocity, inward pull, corrode-opposite-only,
mine consumes + victim drops loot); keystone offer lifecycle (owed → gold card → taken → flag →
pool exclusion); reflect/reflHit/reflSafe/neutral-cover/goldberg/skeet all pass; Codex ???-reveal
cycle; 9000-tick endurance with ALL keystones stacked to Epoch IV, level 18, 236k — zero exceptions,
console clean.

#### Cosmic pass 1 (2026-07-17) — Singularity, Shepherd Moons, Undertow brace, the Spheres

- **⊙ Singularity** ✓ (Special, Arsenal 300◆, one-take) — the Collapse inverts: a ~2.5s black hole
  drags both charges + Motes + **Flares** in, devours at the event horizon (each kill banks a Mote
  and feeds it +0.2s, cap +3s), leaves you untouchable while it feeds, evaporates into the
  **"N DEVOURED"** tally on a harp. Resolves the Collapse-evolution slot (Last Judgment shelved).
- **❂ Shepherd Moons** ✓ (5th Keystone) — shipped **nerfed per playtest concern**: max **4** moons
  (was 8 in the pitch), martyr-intercept limited to **one per 1.5s**, launch is unguided (it can
  miss). Bombers/Neutrals never convert; moons don't trip Ferrofluid mines; reversing releases
  the moons as opposite-charge ammo.
- **Undertow verdict + brace** ✓ — assessed as a real greed engine but a trap pick as shipped
  (you sacrifice the panic button AND the pile you summon can clip you instantly). Kept, with a
  **0.5s brace window** after an undertow reversal: inviting the crash is now a play, not a mistake.
- **♆ The Spheres** ✓ — `sfx.harp(n)`: plucked stacked-fifths arpeggio (quintal harmony). Voices
  Keystone takes, Singularity evaporation, secret-feat discovery; reserved for Syzygy when it lands.

### 🌌 Cosmic Awe menu (ideation 2026-07-17, partially built — see Cosmic pass 1)

"Perks that make you feel like a planet / god / something in outer space." 5-lens panel, 50 raw → law-checked & tiered.

**Showpieces** (the "I AM a planet" centerpieces):
- **Gravitas** (keystone, high) — Field becomes inverse-square gravity; bodies captured into decaying elliptical orbits; the World rendered as a planet (terminator, atmosphere, aurora) with a parallax starfield that makes YOU the fixed point of the universe. *3-lens convergence.*
- **Stellar Mass** (keystone, med) — kills+streak grow you through mass tiers (PLANETESIMAL→JOVIAN): render scale, field, camera zoom-out, growth-spurt ceremony; a hit = GO NOVA, drop a tier. *4-lens convergence.*
- **Singularity** (Collapse evolution, med) — the ult inverts: a 2.5s black hole drags both charges + Motes + Flares in, force-pairing annihilations; kills extend it.
- **Shepherd Moons** (keystone, high) — like-charge matter is captured into orbit as moons that intercept threats; reversing releases them as a ring of freed moons. *Root of the "shepherd" family (Martyrdom, Last Judgment, Heralds).*

**Quick wins** (low/med cost, ship-this-week):
- **Gravitational Lensing** (keystone, LOW) — Flares curve in your Field via the existing force function; lensed flares turn hostile to matter/Anomaly. *STRONGEST SIGNAL: 4 lenses independently.*
- **Deep Well** (keystone, LOW) — per-entity time dilation gradient: everything wades slower near your surface, Flares included — close-in parries become cinematic. *4-lens convergence.*
- **Syzygy** (special, LOW) — two opposite-charge bodies aligned through you (<4°) triggers slow-mo + a white alignment line + forced annihilation. Positioning-as-power distilled.
- **Magnetar** (keystone, LOW) — the inner half of your reversal shockwave INVERTS matter polarity: one reversal turns a chasing pack into civil war.
- **Perihelion Sling** (core, LOW) — near-miss bodies slingshot out at 2.5× as brief comets that annihilate what they hit.
- **Totality** (special, MED) — full Capacitor triggers an eclipse: arena dark except your corona; Collapse during Totality gets +50% radius.

**Later** (kept, gated): Roche Limit (tidal shred → orbiting debris ring), Binary Star vs Firstborn Moon (competing Twin Poles evolutions — pick one track), Accretion Disk (banked motes as a visible Keplerian disk = your mult made physical+losable), Ring System (Eddy evolution: capture ring, fling on reversal), Supernova (death-save: die → collapse → reform at 25%), Tidal Lock (3 reflects = the boss becomes your moon), Commandments/Sabbath/Consecrated Ground (god-verbs), Last Judgment (Collapse spares the faithful — collides with Singularity for the slot), Apotheosis (×15 mult + 20 streak = 12s star-state; fold into Stellar Mass capstone), Constellary, Magnetosphere, Solar Flare, Meteor Shower, Aurora Crown, Dark Matter Halo, Heralds, Martyrdom.

**Recommended build order:** 1) Gravitational Lensing (one force call per flare, transforms the boss duel) → 2) Deep Well (upgrades every second of play) → 3) Syzygy (cheap geometry + full ceremony, teaches the One Law).
Slot collisions to decide before building: Singularity vs Last Judgment (Collapse), Binary Star vs Firstborn Moon (Twin Poles).

### 🧊 Backlog (agreed direction, not yet started)

- **Prime Bodies + Polaris Caches** — affixed elites (ANCHORED / SIPHON / GEMINI) dropping crackable caches
- **More Anomaly variants** — SPIRAL shipped; PINCER (two synced arcs) and WALL (a flare curtain) are natural nexts
- **Alternate Worlds** — BASTION / ION / STROBE / GLASS archetypes; big shard sink
- **Moment Engine stretch** — stereo-panned kill pops, low-HP heartbeat + lowpass, storm drum layer
- **Daily Polaris** — seeded daily run + share string; weekly Anomaly mutation
- **Endgame Ladder** — Depth 1-10, Contracts, consumable Charge Bay, achievement expansion (~24) with shard bounties
- **Resonance Evolutions** — maxed Special + paired Stats = gold evolved card (SUPERNOVA, TEMPEST, TRIAD)
- **Kinetic Mastery** — wake physics (drag matter by moving) + SLAM/CAROM billiard scoring
- **HUD hierarchy pass** — five meters read as equals; only Capacitor + Streak deserve to be loud (deferred from the player review)

### ⚖️ Balance watch-list

- **Capacitor economy** — Deflect (+3%/body), Reflect (+4%/flare), motes (+0.5%), kills, streak
  trickle, milestones feed charge. Graze charge is CUT (2026-07-16) — **watch time-to-Collapse;
  target ≥45s of active play**. Levers: deflect %, reflect %, mote %.
- **Keystone power** — UNDERTOW piles matter into point-blank range (×3 synergy) and FERROFLUID's
  mines chain-feed the Mote bank; with the bank now only halving on hits, ×15 mult is stickier.
  If ×15 is routine by Epoch III, soften ferro mine loot or cap mine drops.
- **Score inflation** — Point-Blank ×3 stacks with mote mult (cap ×15) and Collapse tally (N²×4).
  Best-score comparisons with old saves are apples-to-oranges after this pass.
- **Rarity pity** may raise average Offer power; if runs feel too easy by Epoch III, drop pity threshold trigger to Rare-only (not Rare+).
- **Bomber spawn weight vs. its new damage** — `['bomber',9]` and `['bomber',7+a]` were both priced for a body you could walk through. Now each one touches for 26 (36.4 by Epoch VI), and the design note beside them forbids "just more meat". Damage and weight were deliberately not changed in the same pass so the playtest stays readable: measure Epoch IV–VI, then flatten to `['bomber',7]` if it reads as attrition rather than positioning.
- **Anomaly destabilize** hands losing players more Flare ammo — confirm it doesn't make boss trivially fast for skilled players.

#### Playtest fixes (2026-07-15)
- **Crash ≠ Point-Blank** — Bodies consumed by crashing into the World (incl. shield-tanked hits) paid the ×3
  proximity bonus; contact kills now force ×1 via the existing `e._contact` flag. Courage bonus only pays
  for *annihilations* you positioned.
- **Motes read as loot now** — were colored diamonds with round glow (looked like Minis); redrawn as
  twinkling 4-point sparkle stars with a white glint. Shape = the differentiator, colour keeps its meaning.
- **Flares wear Neutral livery** — red/cyan flares falsely whispered "like-charge = safe" but they hurt
  regardless of polarity; now drawn in the Neutral palette (+ white ring, same language as Neutral bodies).
  Their mechanical colour still shows in annihilation bursts, and sirens are neutral too.
- **Unstable Field corrodes Chargers & Neutrals** — the Charger's custom-movement branch skipped the
  decay check entirely (and Neutrals sat outside the magnetism branch that held it). Decay is now hoisted
  above both exemptions: ignoring the Field's *forces* no longer grants immunity to its *corrosion*.
  Boss stays immune. Side effect worth knowing: Unstable Field is now the only passive answer to Neutrals.

#### Information layer (2026-07-15)
- **Codex** (menu → "❖ Codex — how it works") — every rule written down: Colour Law, Point-Blank,
  Motes/Mult, Capacitor income, Streak tiers + severance, Hold-charge/Deflect mastery, the Anomaly loop,
  Offer rarity/reroll/banish/pity, and the full achievements list with live earned-status.
- **Build display on pause** — every augment taken this run as chips with stack counts (`P._stacks`),
  hover for the effect; Specials get a violet border.

#### Stability pass (2026-07-15)
- State-transition fuzz: pause-during-inhale holds and resumes; death with pending level-ups cancels
  cleanly; quit-to-menu mid-run leaves no residue on restart. Endurance: god-mode bot ran two full boss
  cycles to Epoch III (80 game-seconds, level 12, 108k score) with zero exceptions.

#### Audit fixes (2026-07-15) — 3-lens adversarial audit, 13 findings triaged, all real ones fixed
- **`unstable` froze negative after the first Collapse** (HIGH, longstanding) — every `!unstable` gate
  read "still collapsing" forever: no kill-charge, no Splitter minis, no Bomber payloads, no mote charge,
  no Charger plow. Clamped to exactly 0 on expiry. Verified all five systems restored.
- **Already-dying bodies dealt contact damage** (HIGH) — cwave/flare/decay-queued bodies could still hit the
  World in the same frame; with the inhale pulling bodies inward, your own ult could hurt you. Contact and
  grid loops now skip `queued`.
- **streakTier survived same-frame kill-after-hit** — now reset inside breakStreak.
- **Space started an invisible run behind the Bestiary/Codex** — gated; startRun also force-closes both.
- **Palette lurched to Epoch I during GET READY/pause** — 'ready'/'paused' now count as in-run; the world
  also renders under the pause overlay.
- **The polarity +/− glyph was invisible since day one** — dark stroke under additive compositing can't
  brighten anything; the glyph now escapes to source-over.
- **Mult lagged mote banking** — recomputed at pickup (HUD/graze/deflect no longer read stale values).
- **Quit-from-pause left audio suspended** — next run was silent; audioInit now self-heals + quit resumes.
- **Streak-burst 20% cap applied before Overcharge** — cap is now the hard ceiling.
- **collapse() re-entry mid-wave** — guarded; READY chime + button also hidden while a wave is live.
- **Banish confirmation repainted away** — note now lands after the redraw.
- **Held keys stuck after Cmd+Tab** — keys cleared on window blur and run start.
- Post-fix regression battery: 7/7 pass; endurance to Epoch IV (3 purges, repeated collapses, level 21,
  418k score) with zero exceptions and charge economy flowing.

#### Perk rebalance pass (2026-07-17) — 4-lens audit → caps + repositions, not blanket damping

Player report: can't die at L15+, the dmg-field perk deletes the swarm before contact, most perks OP stacked.
Audit found the immortality is structural — the 0.55s post-hit iframe caps burst, so death only comes from
**sustained net-negative HP**, and Accretion healed on *every* pop (volume scales with swarm density → heal faster
than any incoming). Fixes, styled after the Dense-Core/Overcharge model (additive + visible cap), each perk
repositioned into a legible **bucket** rather than just number-damped:

- **Survivability budget** (the can't-die fix): **Accretion** → point-blank-gated (prox===3 only) **healing budget, cap 7 HP/s** (base 0.3→0.5); **Aegis** shields now **stop recharging under fire** (shieldT resets on every real hit — refill only in a lull, like regen); **Reinforce** maxHp **hard-capped 260**; **Frozen World** slow **floored at 40% speed** (was floorless → froze the swarm). Modeled TTD when parked in an opposite swarm at L15: ~11s (base) to ~30s (full 260-HP defensive build) — finite & swarm-outpaceable, vs today's infinity.
- **Unstable Field → Tidal Shear** (complaint #2): REWORKED not removed (it's the only passive Neutral answer + underlies Event Horizon). Now corrodes **only Brutes & Neutrals** (multi-HP, force-ignoring bodies) inside the Field, **capped 2.5 dmg/s**; the 1-HP swarm is immune and stays yours to annihilate. Event Horizon keystone keeps the broad rule.
- **Stat caps** (compounding → capped): reach +80% (342px), swift +60% (1.6×), overch +120% (2.2), greed score ×3 **and dropped the hidden xpMult** (it secretly fed the too-fast leveling).
- **Repulse → Heavy World** (legibility): repositioned from buffing the near-useless like-charge *push* to amplifying the opposite-charge **attract** (pro-fantasy: threats + ammo arrive faster), additive cap 2.2×.
- **Specials de-degenerated:** structural **generational blast decay** in processKills (0.7^gen, bail <18px) makes Volatile/Nova/Arc cascades finite; **Volatile** = chain REACH (diminishing→96px), **Nova** = blast FORCE (dmg cap 5) — were byte-identical; **Arc** chance diminishing→~42% + can't re-roll on arc/blast victims; **Conduit** capped (amp 1.7, holdMax floor 0.9, max 3 picks — the floor also fixes the Conduit+Discharge 0.5s-cadence screen-clear).
- Buckets: **Offense** (volatile/nova/arc/discharge) · **Field-shape** (reach/pulse/overpull/corrosion/twin/keystones) · **Survival** (cap/bighit/frost/vamp/aegis/rupture) · **Economy** (greed/singul) · **Tempo** (swift/ript/overch/conduit/after/afterimg).

#### Comfort / motion-sickness pass (2026-07-17)
Player reported the game felt "kinda dizzy." Diagnosed the involuntary-motion sources and calmed them:
- **Per-reversal full-screen flash killed** — reversing is constant, so a screen wash every reversal was the #1 offender. Cut `0.28+hc*0.25` → `0.05+hc*0.13`; reversal feedback now lives in the ring + World-colour change.
- **Screen shake retuned** — was `rand(-s,s)` per-frame *jitter* (nausea); now a smooth two-frequency `sin` wobble (reads as impact, not vibration), magnitude 16→10, decay 1.6→2.4/s. Removed the per-reversal shake entirely.
- **Collapse strobe softened** — the ~3Hz full-screen cyan pulse during a Collapse is now a slow, gentle tint (`sin(elapsed*8)`, lower alpha).
- **Reduced Motion toggle** (new ✺ button, bottom-right, persisted): near-zeroes shake, flashes, hitstop and the collapse tint for sensitive players — the accessibility standard.

#### Riptide cut + Event Horizon rework (2026-07-17)
- **Removed Riptide** — a brief post-pop speed burst that, in the endgame's constant pops, was just always-on (redundant with Swift). Cut clean (AUG + `rip`/`ripT` state + usages).
- **Undertow → Event Horizon** (rework + rename): holding a polarity now opens a **black hole** that drags nearby matter into a crushing orbit ~46px off your surface — opposites packed there **annihilate point-blank (×3)** and captives can't touch you while held; **reversing, or holding to full charge, flings the leftovers outward**. Gives hold-charge the dramatic, legible payoff it lacked. The old Undertow (shockwave-pulls-inward + brace) is gone.
- **Old Event Horizon → Corona** (rename only): the opposite-charge-matter-corrode keystone keeps its mechanic, renamed to free the "Event Horizon" name for the black hole. Flag `P.horizon`→`P.corona`.
- **Balance watch:** Event Horizon is intentionally strong (per request) — captive non-contact while holding + point-blank grind. Counterbalances: can't reverse while holding, ~1.5s auto-release, Flares/uncaptured threats still hit, bombers excluded from capture, leftovers return. Watch for degenerate safe-farming; levers are orbit radius, auto-release time, and whether to drop captive immunity.

#### Progression + hold-charge pass (2026-07-17)
- **Mote-only XP**: kills no longer grant XP — **collecting Motes is the sole XP source** (value 0.5→1.0). One clean channel (annihilate → loot dust → grow), thematic, and paced by Reverse-vacuum skill (uncollected = no XP). Verified pacing: keystones land L5 (Epoch I–II), L10 (Epoch III), L15 (Epoch V) — earned, no flood.
- **Removed Conduit & Discharge** (the hold-charge amplifier perks). Hungry Hold stands alone as **ambient depth** — holding still ramps the pull ~1.6× and fires a ~1.5× reversal Shockwave at full charge (base `conduitAmp` 0.5 retained). No perks fuss over it; Afterimage stays (it's reversal-spacing, not hold-charge). Specials pool 11→9.
- **OPEN — Undertow**: player finds it unclear/unfun. Diagnosis: the pull is subtle AND the reversal's expanding ring animation visually says "push" while the effect pulls inward — contradictory feedback. Proposed fix (pending choice): an inward "implosion" visual + stronger yank so it reads as *gather the swarm into your point-blank kill zone*. Not yet built.

### 🗒 Decisions log

- 2026-07-17 — **Dense Core** de-degenerated: was multiplicative-compounding to a 70% damage-reduction floor (near-immunity in ~3 picks). Now **additive, hard cap 50% DR**, base 0.25→0.16. Same bug class as the Overcharge fix. **Watch-list sibling: Frozen World (frost)** — `enemySlow *= (1-m)` compounds toward 0 with NO floor (stacking freezes the swarm); not yet touched.
- 2026-07-17 — **Epoch pressure creep**: same-species matter gains +8% contact damage & +4% speed per Epoch; post-125s the mix scales with Epoch (Drifters thin, Chargers/Bombers/Splitters/Neutrals climb); arena cap +10/Epoch (ceiling 300→330), spawn count +epoch/2. HP intentionally NOT scaled — annihilation is binary, so fatter bodies would only tax secondary tools. Elites/Primes remain the real answer for durable threats.
- 2026-07-17 — **XP curve steepened** from linear `10+7·L` to `10+8·L+0.5·L²`: early levels ~unchanged, ~1.7× XP to L15. Level-ups were flooding (the mote-XP double-dip is the secondary accelerant, left in for now). Keystone levels 5/10/15 still reachable.
- 2026-07-17 — Base Collapse demoted from eraser to **blast (2 dmg, one hit per wave)**: trash dies, Brutes survive burned. Makes Singularity a true upgrade (its horizon kills regardless of toughness) and elites/Primes will inherit wave-resistance for free.
- 2026-07-16 — Graze charge cut for good (twice-burned): flavor + score crumb only. Charge income = chosen actions.
- 2026-07-16 — One hit must not delete three systems: Streak resets, Mote bank halves. Motes = greed, Streak = perfection.
- 2026-07-16 — Overcharge additive, not compounding. Pre-empts the degenerate stack before a leaderboard exists.
- 2026-07-16 — Keystones live in the Offer (not purges): level-ups needed *decisions*, purges already pay Specials.
- 2026-07-16 — Reflect stays undocumented outside a Codex rumour — discovery is the reward. Secrets pay ◆80 so finding them is progression.
- 2026-07-16 — 'thorn' id ≠ Thorns: it's Unstable Field, kept (review correction).
- 2026-07-15 — Graze returns in exit-award form after being removed (contact double-dip was the complaint); Collapse cost economy is the guard-rail.
- 2026-07-15 — "Matter" (a "body") chosen as the umbrella enemy term; "pop" = destroy.
- 2026-07-15 — Offer = Stats only (rarity-scaled); Specials = Anomaly rewards. Rejected: appearance-odds on cards.
- 2026-07-15 — Anomaly redesign: reversal-immune + Flare-bait loop (replaced reversal-chip which invited reversal spam).
