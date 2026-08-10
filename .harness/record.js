// ORBITAL CRASH — input recorder. Runs inside the game window, after preload.js.
//
// Records raw INPUT EVENTS, never outcomes. A tape says "pointerdown happened in the gap before frame
// 412", not "a flip happened" — so on replay the game's own guards re-run: flipCd, and the zone lookup
// that turns one pointerdown into a stick grab, an Overdrive ignition or a flip depending only on WHERE
// it landed. A tape of outcomes would replay a flip that already happened and could therefore never
// fail, which makes it worthless as a proof of anything.
//   ⚠️ THIS IS ALSO WHY TAPES SURVIVED THE CONTROL REWRITE AND THEIR OUTCOMES DID NOT. The scheme this
// described was an intent split (TAP_SLOP / TAP_TIME / tapMoved) reading one pointerUP as a flip; it is
// now a partition reading pointerDOWN. Every recorded event still replays, but a tape cut under the old
// scheme does not necessarily produce the same run — which is correct behaviour for a tape of inputs,
// and would have been a silent lie from a tape of outcomes.
//
// One simplification falls out of preload owning the clock: the game's performance.now() returns H.now,
// the CURRENT frame's timestamp, so a handler firing between frames reads the previous frame's time no
// matter when in the gap it actually fired. Sub-frame timing is therefore invisible to the simulation.
// All a tape needs is which gap an event landed in and the order of events within it.
(() => {
  const H = window.__H;
  if (!H) throw new Error('record.js requires preload.js');

  const K = { pointermove:0, pointerdown:1, pointerup:2, pointercancel:3, contextmenu:4,
              keydown:5, keyup:6, blur:7, visibilitychange:8, click:9, resize:10 };
  const REC = window.__REC = { rows: [], pend: [], prevQ: 0, recording: false, K };

  const g = window.__orbital;
  const canvas = document.getElementById('game');

  const pev = e => [ e.pointerType === 'touch' ? 1 : e.pointerType === 'pen' ? 2 : 0,
                     e.pointerId | 0, e.clientX, e.clientY, e.button | 0 ];

  const add = (kind, payload) => { if (REC.recording) REC.pend.push([kind].concat(payload || [])); };
  const on  = (type, fn) => window.addEventListener(type, fn, true);   // capture phase: nothing can hide

  on('pointermove',   e => add(K.pointermove,   pev(e)));
  on('pointerdown',   e => add(K.pointerdown,   pev(e)));
  on('pointerup',     e => add(K.pointerup,     pev(e)));
  on('pointercancel', e => add(K.pointercancel, pev(e)));
  on('contextmenu',   e => add(K.contextmenu,   []));
  on('keydown',       e => add(K.keydown,       [e.key, e.repeat ? 1 : 0]));
  on('keyup',         e => add(K.keyup,         [e.key]));
  on('click',         e => add(K.click,         [(e.target && e.target.id) || '']));
  on('resize',        e => add(K.resize,        [innerWidth, innerHeight, devicePixelRatio]));
  window.addEventListener('blur', () => add(K.blur, []), true);
  document.addEventListener('visibilitychange', () => add(K.visibilitychange, [document.hidden ? 1 : 0]), true);

  // One row per frame: quanta since the previous frame, plus the events that fired in the gap before it.
  // Also track the peak live body count, because that is the one number that predicts step() cost. Read
  // enemies.length off the seam directly rather than calling diag(), which allocates an object and walks
  // the whole array to build its colour census — 60x/second inside the thing we are trying not to perturb.
  H.onFrame = nowQ => {
    if (!REC.recording) return;
    REC.rows.push([nowQ - REC.prevQ, REC.pend]);
    REC.prevQ = nowQ;
    REC.pend = [];
    const n = g.enemies.length;
    if (n > REC.peakBodies) REC.peakBodies = n;
  };

  // Frame-time summary, computed from the dt column the tape already carries.
  //
  // WHY THIS IS IN THE TAPE. Frame health was once reconstructed by comparing `elapsed` against
  // frames/60 — and that inference is WRONG, because `elapsed` advances 1/60 per *step* while slowmo and
  // hitstop make steps-per-frame vary. It read a run that was fine as a 10% frame-rate regression. The dt
  // column is ground truth and was in the tape the whole time; nothing should ever infer it again.
  //
  // The distribution is bimodal in practice (one cluster at the vsync interval, one at whatever the
  // machine drops to under contention), so the MEDIAN is the honest headline and the mean is not: a run
  // that holds 58.8fps for two thirds of its length still reports a mean near 47.
  const frameStats = rows => {
    const ms = rows.map(r => r[0] / H.Q).slice(30);      // drop boot warm-up: first frames run 40-90ms
    if (!ms.length) return null;
    const s = [...ms].sort((a, b) => a - b);
    const at = p => s[Math.min(s.length - 1, Math.floor(s.length * p))];
    const sum = ms.reduce((a, b) => a + b, 0);
    return { n: ms.length, wallS: +(sum / 1000).toFixed(1),
             medianMs: +at(0.5).toFixed(2), meanMs: +(sum / ms.length).toFixed(2),
             p90Ms: +at(0.9).toFixed(2), p99Ms: +at(0.99).toFixed(2), maxMs: +s[s.length - 1].toFixed(1),
             medianFps: +(1000 / at(0.5)).toFixed(1), meanFps: +(ms.length * 1000 / sum).toFixed(1),
             overBudgetPct: +(ms.filter(x => x > 17.5).length / ms.length * 100).toFixed(1) };
  };

  REC.start = (opts) => {
    opts = opts || {};
    const seed = opts.seed == null ? ((Math.random() * 2147483647) | 0) >>> 0 : opts.seed;
    H.seed(seed);
    REC.rows = []; REC.pend = []; REC.prevQ = H.nowQ; REC.peakBodies = 0;
    REC.header = {
      v: 3,
      build: H.build || 'unknown',
      seed, clockQ: H.Q,
      mode: opts.mode || null,
      view: { iw: innerWidth, ih: innerHeight, dpr: devicePixelRatio },
      store: { best: g.store.best, mute: g.store.mute, reduceMotion: g.store.reduceMotion,
               achv: Array.from(g.store.achv || []) },
      audio: { stubbed: !!opts.audioStubbed, sampleRate: opts.sampleRate || null },
      startedAtFrame: H.frame,
      // A tape recorded from the menu contains the click that starts the run, so replay must NOT call
      // start() itself — it just needs a game sitting at the menu, i.e. a freshly booted window.
      startState: g.diag().state
    };
    REC.recording = true;
    return REC.header;
  };

  REC.stop = () => {
    REC.recording = false;
    const d = g.diag();
    return REC.tape = {
      ...REC.header,
      frames: REC.rows,
      end: { frames: REC.rows.length, state: d.state, score: d.score, t: d.t,
             hp: d.hp, act: d.act, draws: H.draws, peakBodies: REC.peakBodies,
             lastDmg: g.lastDmg ? { src: g.lastDmg.src, act: g.lastDmg.act, phase: g.lastDmg.phase } : null },
      perf: frameStats(REC.rows),
      fpEnd: H.fp()
    };
  };

  // Replay a tape into this window. Events are dispatched while H.now still holds the PREVIOUS frame's
  // value — exactly what a live handler saw — and only then is the frame advanced.
  REC.replay = (tape, opts) => {
    opts = opts || {};
    const sample = opts.sample || 1;
    H.stubAudio();
    H.pinView(tape.view.iw, tape.view.ih, tape.view.dpr);
    Object.assign(g.store, { mute: tape.store.mute, reduceMotion: tape.store.reduceMotion });
    g.store.achv = new Set(tape.store.achv);
    H.seed(tape.seed);
    H.setQ(0); H.frame = 0;
    const saveHook = H.onFrame; H.onFrame = null;
    const menuTape = tape.startState === 'menu';
    if (menuTape && g.diag().state !== 'menu')
      throw new Error('this tape starts at the menu — replay it in a freshly booted window');
    if (!menuTape && opts.freshRun !== false) g.start(tape.mode || undefined);

    const fps = [];
    for (let i = 0; i < tape.frames.length; i++) {
      const [dtq, evs] = tape.frames[i];
      // Events fire while the clock still holds the PREVIOUS frame's value — exactly what a live handler
      // saw, since the game's performance.now() returns H.now.
      for (const ev of evs) REC.dispatch(ev);
      const cb = H.pending;
      if (!cb) break;
      H.pending = null;
      H.setQ(H.nowQ + dtq);
      H.frame++;
      cb(H.now);
      if (i % sample === 0) fps.push(H.fp());
    }
    H.onFrame = saveHook;
    return { fps, diag: g.diag(), draws: H.draws };
  };

  const PT = ['mouse', 'touch', 'pen'];
  REC.dispatch = ev => {
    const k = ev[0];
    if (k <= K.pointercancel) {
      const type = ['pointermove','pointerdown','pointerup','pointercancel'][k];
      canvas.dispatchEvent(new PointerEvent(type, {
        pointerType: PT[ev[1]], pointerId: ev[2], clientX: ev[3], clientY: ev[4], button: ev[5],
        bubbles: true, cancelable: true, isPrimary: true }));
    } else if (k === K.contextmenu) {
      canvas.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    } else if (k === K.keydown) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ev[1], repeat: !!ev[2], bubbles: true, cancelable: true }));
    } else if (k === K.keyup) {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: ev[1], bubbles: true, cancelable: true }));
    } else if (k === K.click) {
      const el = ev[1] && document.getElementById(ev[1]);
      if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    } else if (k === K.blur) {
      window.dispatchEvent(new Event('blur'));
    } else if (k === K.visibilitychange) {
      document.dispatchEvent(new Event('visibilitychange'));
    } else if (k === K.resize) {
      H.pinView(ev[1], ev[2], ev[3]);
    }
  };
})();
