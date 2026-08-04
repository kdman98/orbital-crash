// ORBITAL CRASH — harness self-test. Proves the record/replay machinery before anything is measured with it.
//
// Load into any page on the same origin and call: await __selftest()
// Everything runs headless in a rewritten iframe, so it works in a hidden tab where rAF never fires.
window.__selftest = async function (opts) {
  opts = opts || {};
  if (!window.__boot) {
    const t = await fetch('/orbital-crash/.harness/boot.js?st=' + (performance.now() | 0), { cache: 'reload' }).then(r => r.text());
    (0, eval)(t);
  }
  await window.__purgeHarnessCache();
  const w = await window.__boot({ nonce: 'selftest' });
  await window.__load(w, 'record.js');

  const H = w.__H, g = w.__orbital, REC = w.__REC, cv = w.document.getElementById('game');
  const R = [];
  const chk = (name, pass, detail) => R.push({ name, pass: !!pass, detail });

  // --- 1. determinism: same seed in, same fingerprints out, even across an interleaved foreign run ----
  const bare = (seed, n) => {
    H.startRun({ seed, store: { mute: true, reduceMotion: false } });
    const fps = [];
    for (let i = 0; i < n; i++) { H.tick(); fps.push(H.fpFlat()); }
    return fps;
  };
  const a = bare(4242, 600);
  bare(9999, 120);                                   // unrelated run in between
  const b = bare(4242, 600);
  const c = bare(9999, 600);
  chk('same seed reproduces exactly', a.join() === b.join(),
      a.join() === b.join() ? '600/600 frames identical' : 'diverges at frame ' + a.findIndex((v, i) => v !== b[i]));
  chk('different seed actually differs', a[0] !== c[0], 'frame 0 differs');

  // --- 2. the second verb is reachable BOTH ways -----------------------------------------------------
  // This section used to prove the opposite: that the Collapse blast could ONLY be reached by driving
  // real frames, because its 0.45s inhale counted down in frameBody rather than in step(). That was the
  // oracle's one blind spot. Overdrive drains inside step(), so the blind spot is gone — and the check
  // that matters now is that BOTH drivers agree.
  const odVia = (useFrames) => {
    H.startRun({ seed: 777, store: { mute: true, reduceMotion: false } });
    H.run(60);
    g.P.charge = 1;
    w.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Shift', bubbles: true, cancelable: true }));
    const lit = g.odOn;
    if (useFrames) H.run(40); else g.tick(40);
    return { lit, odOn: g.odOn, charge: +g.P.charge.toFixed(3) };
  };
  const viaTick = odVia(false), viaFrames = odVia(true);
  chk('Shift lights Overdrive', viaTick.lit === true && viaFrames.lit === true,
      'tick:' + viaTick.lit + ' frames:' + viaFrames.lit);
  chk('tick(n) drains it (no real-time blind spot any more)', viaTick.charge < 1,
      'charge ' + viaTick.charge + ' after 40 raw steps');
  chk('frame-driving drains it identically', Math.abs(viaFrames.charge - viaTick.charge) < 0.02,
      'frames ' + viaFrames.charge + ' vs tick ' + viaTick.charge);

  // --- 3. record -> replay is bit-exact, over a jittered frame cadence -------------------------------
  const N = opts.frames || 1800;
  H.stubAudio(); H.pinView(1280, 800, 1); H.setQ(0); H.frame = 0;
  REC.start({ seed: 31337, audioStubbed: true });
  g.start();
  const liveFps = [];
  for (let i = 0; i < N; i++) {
    const t = i / 60, px = 640 + 300 * Math.sin(t * 1.3), py = 400 + 200 * Math.sin(t * 0.77 + 2);
    cv.dispatchEvent(new w.PointerEvent('pointermove', { pointerType: 'mouse', pointerId: 1, clientX: px, clientY: py, bubbles: true }));
    if (i % 53 === 0) cv.dispatchEvent(new w.PointerEvent('pointerdown', { pointerType: 'mouse', pointerId: 1, clientX: px, clientY: py, button: 0, bubbles: true }));
    if (i % 53 === 7) cv.dispatchEvent(new w.PointerEvent('pointerup',   { pointerType: 'mouse', pointerId: 1, clientX: px, clientY: py, button: 0, bubbles: true }));
    if (i % 211 === 0 && i) w.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Shift', bubbles: true, cancelable: true }));
    H.tick(800 + (i % 97 === 0 ? 900 : i % 13 === 0 ? 40 : 0));   // stutter, like a real browser
    liveFps.push(H.fp());
  }
  const liveEnd = g.diag(), liveDraws = H.draws;
  const tape = REC.stop();
  const rp = REC.replay(tape, { sample: 1 });

  let d = -1, fields = null;
  for (let i = 0; i < liveFps.length; i++) {
    if (JSON.stringify(liveFps[i]) !== JSON.stringify(rp.fps[i])) {
      d = i; fields = Object.keys(liveFps[i]).filter(k => liveFps[i][k] !== rp.fps[i][k]);
      break;
    }
  }
  chk('record → replay is bit-exact', d === -1,
      d === -1 ? N + '/' + N + ' frames, all 8 layers'
               : 'DIVERGE frame ' + d + ' fields ' + fields + ' ΔR=' + (rp.fps[d].R - liveFps[d].R));
  chk('replay reaches the same end state', liveEnd.score === rp.diag.score && liveDraws === rp.draws,
      'score ' + liveEnd.score + '/' + rp.diag.score + ' draws ' + liveDraws + '/' + rp.draws);

  const fails = R.filter(r => !r.pass);
  return {
    green: fails.length === 0,
    build: H.build,
    failed: fails.map(r => r.name + ' :: ' + r.detail),
    rows: R,
    tape: { frames: tape.frames.length, events: tape.frames.reduce((n, r) => n + r[1].length, 0),
            bytes: JSON.stringify(tape).length, bytesPerMin: Math.round(JSON.stringify(tape).length / (N / 3600)) }
  };
};
