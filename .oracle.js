// ORBITAL CRASH — behaviour-preservation oracle.
// Paste-able into the Browser pane after a page load. Gives a bit-exact fingerprint trace of the sim
// so a refactor can be PROVEN behaviour-preserving instead of eyeballed.
//
// Why each piece exists:
//  - mute first (standing rule; headless loops fire the whole sound bank at once)
//  - innerWidth/Height are 0 in this harness context, so define them and dispatch resize
//  - the rAF chain must be frozen or wall-clock steps interleave with manual ticks and nothing repeats
//  - Math.random is replaced by a seeded xorshift so spawns/patterns/drops are fixed
//  - store.achv is restored per run because achievements unlock perks, which would leak between runs
//  - never tick past death (post-death ticks previously inflated boss-damage readings)
(() => {
  const g = window.__orbital;
  const cv = document.getElementById('game');
  const btn = document.getElementById('muteBtn');
  if (!g.store.mute && btn) btn.click();

  // The first-visit tutorial auto-starts at boot, and this file is pasted AFTER boot — so index.html
  // cannot gate it on anything we define. Set the flag here so a fresh profile does not run one
  // underneath the suite. Harmless when already set, which is the usual case.
  try { localStorage.setItem('orbitalcrash_tut', '1'); } catch (_) {}

  Object.defineProperty(window, 'innerWidth',  { value: 1280, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 800,  configurable: true });
  window.dispatchEvent(new Event('resize'));

  if (!window.__rafFrozen) { window.requestAnimationFrame = () => 0; window.__rafFrozen = true; }
  window.__achvBase = Array.from(g.store.achv);

  window.__seedRandom = function (seed) {
    let s = seed >>> 0;
    Math.random = function () {
      s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  };

  window.__fp = function () {
    let h = 2166136261 >>> 0;
    const push = (n) => {
      const v = (typeof n === 'number' && isFinite(n)) ? Math.round(n * 1000) : (n ? 1 : 0);
      h ^= (v & 0xff);         h = Math.imul(h, 16777619) >>> 0;
      h ^= ((v >> 8) & 0xff);  h = Math.imul(h, 16777619) >>> 0;
      h ^= ((v >> 16) & 0xff); h = Math.imul(h, 16777619) >>> 0;
    };
    const P = g.P;
    // `P.shield` is gone with the Aegis orb and `P.fieldR` is now driven by Overdrive rather than a
    // powerup timer, so `odOn` replaces the shield slot: same layer width, live meaning.
    if (P) [P.x, P.y, P.hp, P.charge, P.polarity, P.fieldR, P.r, g.odOn ? 1 : 0, P.flipCd].forEach(push);
    for (const e of g.enemies) [e.x, e.y, e.vx, e.vy, e.color, e.hp || 0, e.ring ? 1 : 0, e.type ? e.type.length : 0].forEach(push);
    const b = g.boss;
    if (b) [b.x, b.y, b.hp, b.telegraph || 0, b.hunt || 0].forEach(push);
    for (const l of g.lances) [l.x, l.y, l.vx, l.vy].forEach(push);
    for (const o of (g.orbs || [])) [o.x, o.y].forEach(push);   // orbs are gone; the seam stubs [] — guard anyway
    push(g.diag().score);
    return h.toString(16);
  };

  window.__pilot = function (seed, frames, opts) {
    opts = opts || {};
    const g = window.__orbital;
    g.store.achv = new Set(window.__achvBase);
    window.__seedRandom(seed);
    g.start();
    if (opts.boss) g.spawnBoss(opts.boss);
    const fps = [];
    for (let i = 0; i < frames; i++) {
      const t = i / 60;
      const px = 640 + 380 * Math.sin(t * 0.9 + seed % 7);
      const py = 400 + 240 * Math.sin(t * 1.37 + 1.1);
      cv.dispatchEvent(new PointerEvent('pointermove', { clientX: px, clientY: py, bubbles: true }));
      if (i % 47 === 0) g.flip();
      // Overdrive is HELD now, not toggled, so the pilot has to hold it: press at 311, release 90 frames
      // later. Calling overdrive() alone would ignite and never let go, burning every meter to zero and
      // making the fingerprint a measurement of the drain rather than of the sim.
      if (i % 311 === 0 && i) g.overdrive();
      if (i % 311 === 90) g.endOverdrive();
      g.tick(1);
      if ((i + 1) % 120 === 0) fps.push(window.__fp());
      if (g.P && g.P.hp <= 0) { fps.push('DEAD@' + (i + 1)); break; }
    }
    const d = g.diag();
    return { fps, end: { t: d.t, score: d.score, hp: d.hp, enemies: d.enemies, boss: d.boss ? d.boss.hp : null, state: d.state } };
  };

  window.__suite = function () {
    const out = {};
    for (const seed of [101, 202, 303]) out['survival-' + seed] = window.__pilot(seed, 2400);
    for (const v of ['emitter', 'sentinel', 'pulsar']) out['boss-' + v] = window.__pilot(4242, 1500, { boss: v });
    return out;
  };
  return 'harness ready';
})()
