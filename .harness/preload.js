// ORBITAL CRASH — harness preload. MUST run BEFORE the game's inline script.
//
// Phase 0 measured the constraint this file exists to solve: in the Browser pane `document.hidden` is
// true, so the browser never fires requestAnimationFrame. `.oracle.js` works around that by freezing rAF
// and calling step() directly — but step() sits BELOW the accumulator, so it cannot reproduce the dt
// clamp, hitstop frames that run zero steps, timeScale slow-mo, the 5-step catch-up burst, or the
// real-time inhaleT countdown that fires detonateCollapse(). (Which means the Collapse blast has never
// once been exercised by the existing oracle.)
//
// So instead of freezing rAF we CAPTURE it. The game's kickoff hands us `frame` at parse time, and we
// invoke it ourselves with a synthetic clock. Nothing in the game changes; it simply never learns that
// the frames are ours. Loaded by boot.js, which rewrites index.html into an iframe to get in first.
(() => {
  const H = (window.__H = {
    pending: null,      // the game's next rAF callback, waiting for us to call it
    now: 0,             // synthetic clock, ms — performance.now() returns this
    frame: 0,           // integer frame counter (the game has none)
    draws: 0,           // Math.random() calls since seed() — the most diagnostic number we have
    realNow: performance.now.bind(performance),
    realRaf: window.requestAnimationFrame.bind(window),
  });

  // ---- 1. own the frame source ------------------------------------------------------------------
  window.requestAnimationFrame = cb => { H.pending = cb; return 1; };
  window.cancelAnimationFrame = () => {};

  // ---- 2. own the clock -------------------------------------------------------------------------
  // Every game-side performance.now() — loop timing, the READY breather, and the touch tap/drag
  // decision — must read the same grid, or replay diverges on gesture classification alone.
  performance.now = () => H.now;

  // ---- 3. own entropy ---------------------------------------------------------------------------
  // rand/irand/wchoice look Math.random up dynamically, so replacing the global reaches every site.
  H.seed = s => {
    let x = s >>> 0;
    H.draws = 0;
    Math.random = () => {
      H.draws++;
      x ^= x << 13; x >>>= 0;
      x ^= x >>> 17;
      x ^= x << 5;  x >>>= 0;
      return x / 4294967296;
    };
  };

  // ---- 4. audio policy --------------------------------------------------------------------------
  // noise() fills its buffer from the SHARED Math.random stream — AC.sampleRate*dur draws, ~24,000 for
  // one Collapse — and store.mute only zeroes master.gain, so muting does not stop them. Making the
  // constructor throw lands in the game's own `catch(e){ AC=null }`, after which every audio entropy
  // site dies at its `if(!AC) return` guard. Zero edits, and nothing is left to leak.
  H.stubAudio = () => {
    const dead = function () { throw new Error('AudioContext stubbed by harness'); };
    window.AudioContext = dead;
    window.webkitAudioContext = dead;
  };

  // ---- 5. no service worker ---------------------------------------------------------------------
  // sw.js precaches index.html. A tape carries a build hash; being silently handed a cached build would
  // turn a stale-asset problem into a mystery divergence at some arbitrary frame.
  try {
    Object.defineProperty(navigator, 'serviceWorker', { get: () => undefined, configurable: true });
  } catch (e) { /* already non-configurable: boot.js reports it */ }

  // ---- 6. pin the viewport ----------------------------------------------------------------------
  // The world is in design units and S = min(1, min(w,h)/800) converts. Pinning makes S deterministic
  // and, at >=800 on the short axis, exactly 1 — so CSS px and design units coincide.
  H.pinView = (w, h, dpr) => {
    Object.defineProperty(window, 'innerWidth', { value: w, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: h, configurable: true });
    Object.defineProperty(window, 'devicePixelRatio', { value: dpr || 1, configurable: true });
    window.dispatchEvent(new Event('resize'));
  };

  // ---- 7. the driver ----------------------------------------------------------------------------
  // One call = one rAF callback = one frameBody(). dtMs is what the game will see as (now-lastT).
  // The clock is an INTEGER count of quanta; H.now is always derived as nowQ/Q. That is what makes a tape
  // replay bit-exact: record and replay reconstruct the timestamp by the identical computation from the
  // identical integer, so the floats agree to the last bit without the grid values needing to be exactly
  // representable in binary.
  //
  // Q=48 rather than the more obvious 8, because a 60Hz frame must land on the grid: 1000/60 ms x 48 =
  // exactly 800 quanta, where x8 would be 133.33. Storing 133 instead cost 0.042ms per frame, which is
  // enough to drop `acc` under the 1/60 threshold and run ZERO steps on a frame that live ran one —
  // measured as a divergence at frame 0 before this was fixed. 1/48 ms (~21us) is far below TAP_TIME.
  H.Q = 48;
  H.FRAME_Q = 800;                 // one 60Hz frame, exactly
  H.nowQ = 0;
  H.setQ = q => { H.nowQ = q; H.now = q / H.Q; };

  H.tick = dtQ => {
    const cb = H.pending;
    if (!cb) throw new Error('no pending rAF callback — the game loop is not registered');
    H.pending = null;
    H.setQ(H.nowQ + (dtQ == null ? H.FRAME_Q : dtQ));
    H.frame++;
    if (H.onFrame) H.onFrame(H.nowQ);
    cb(H.now);
    if (!H.pending) throw new Error('frame ' + H.frame + ' did not re-register — the loop has died');
  };
  H.run = (frames, dtQ) => { for (let i = 0; i < frames; i++) H.tick(dtQ); };

  // ---- 7b. live pump: same drain, real-clock cadence -------------------------------------------
  // A human plays at human speed, so frames come from the browser — but the game must still only ever see
  // grid-aligned timestamps, or the tape cannot replay exactly. Quantizing HERE, at record time, means the
  // live run is already on the grid; replay feeding the integers back is then exact by construction.
  H.pumpLive = () => {
    if (H.pumping) return;
    H.pumping = true;
    H.t0Q = null;
    const loop = raw => {
      if (!H.pumping) return;
      const q = Math.round(raw * H.Q);
      if (H.t0Q === null) H.t0Q = q;      // rebase to zero: replay starts at 0 and must match
      H.setQ(q - H.t0Q);
      H.frame++;
      const cb = H.pending;
      H.pending = null;
      if (H.onFrame) H.onFrame(H.nowQ);
      if (cb) cb(H.now);
      H.realRaf(loop);
    };
    H.realRaf(loop);
  };
  H.pumpStop = () => { H.pumping = false; };

  // ---- 8. layered fingerprint -------------------------------------------------------------------
  // .oracle.js hashes everything into one 32-bit value, which tells you THAT frame N diverged and
  // nothing about what. One hash per subsystem names the field instead; `R` (draw count) separates
  // "the input replay is wrong" from "the entropy stream desynced".
  const fnv = () => {
    let h = 2166136261 >>> 0;
    return {
      push(n) {
        const v = (typeof n === 'number' && isFinite(n)) ? Math.round(n * 1000) : (n ? 1 : 0);
        h ^= (v & 0xff);         h = Math.imul(h, 16777619) >>> 0;
        h ^= ((v >> 8) & 0xff);  h = Math.imul(h, 16777619) >>> 0;
        h ^= ((v >> 16) & 0xff); h = Math.imul(h, 16777619) >>> 0;
      },
      get hex() { return (h >>> 0).toString(16).padStart(8, '0'); }
    };
  };
  H.fp = () => {
    const g = window.__orbital, out = {};
    const lay = (k, fn) => { const f = fnv(); fn(v => f.push(v)); out[k] = f.hex; };
    const P = g.P;
    lay('P', p => { if (P) [P.x, P.y, P.hp, P.charge, P.polarity, P.fieldR, P.r, g.odOn ? 1 : 0, P.flipCd, P.holdT, P.iframe].forEach(p); });
    lay('E', p => { for (const e of g.enemies) [e.x, e.y, e.vx, e.vy, e.color, e.hp || 0, e.ring ? 1 : 0, e.hold || 0].forEach(p); });
    lay('B', p => { const b = g.boss; if (b) [b.x, b.y, b.hp, b.telegraph || 0, b.hunt || 0].forEach(p); });
    lay('L', p => { for (const l of g.lances) [l.x, l.y, l.vx, l.vy].forEach(p); });
    lay('O', p => { for (const o of (g.orbs || [])) [o.x, o.y].forEach(p); });   // orbs deleted; seam stubs []
    lay('M', p => { for (const m of (g.motes || [])) [m.x, m.y].forEach(p); });
    const d = g.diag();
    lay('S', p => { [d.score, d.combo, d.act, d.intensity].forEach(p); });
    out.R = H.draws;
    return out;
  };
  H.fpFlat = () => { const f = H.fp(); return f.P + f.E + f.B + f.L + f.O + f.M + f.S + ':' + f.R; };

  // ---- 9. a fresh, comparable run ---------------------------------------------------------------
  H.startRun = (opts) => {
    opts = opts || {};
    const g = window.__orbital;
    H.stubAudio();
    H.pinView(opts.w || 1280, opts.h || 800, opts.dpr || 1);
    if (opts.store) Object.assign(g.store, opts.store);
    H.seed(opts.seed == null ? 1 : opts.seed);
    H.frame = 0;
    // Rewind the clock. The game resets acc and lastT itself (startRun), so the only thing that survives a
    // run boundary is the MAGNITUDE of our synthetic now — and float resolution depends on it. Measured:
    // two runs at the same seed, one starting near t=0 and one near t=10s, drifted by a whole step over
    // 600 frames (elapsed 9.80 vs 9.82) because `acc += (now-lastT)/1000` rounds differently up there.
    // Determinism does not need exact arithmetic, only identical arithmetic, so every run starts at zero.
    H.setQ(0);
    g.start(opts.mode || undefined);
    if (opts.boss) g.spawnBoss(opts.boss);
    return g.diag();
  };
})();
