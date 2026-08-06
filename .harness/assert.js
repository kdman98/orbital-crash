// ORBITAL CRASH — Phase 0: assumption asserter.
//
// Every structural invariant the record/replay/persona harness leans on, checked in the environment that
// will actually run it. The point is to falsify the design in a minute, before a line of it is written.
// Paste into the Browser pane after a page load; results land on window.__A0 (async, because the rAF
// checks need real frames to pass through).
//
// Nothing here starts a run or writes a score. It clicks the Overdrive button once, which is inert outside play.
(() => {
  const R = [];
  const ok = (n, pass, detail) => R.push({ n, pass: !!pass, d: String(detail) });
  const g = window.__orbital;
  const mb = document.getElementById('muteBtn');
  if (g && g.store && !g.store.mute && mb) mb.click();   // standing rule: mute before any test loop

  // ---------- source-derived invariants (the inline script IS the whole game) ----------
  const scripts = [...document.scripts];
  const inline = scripts.filter(s => !s.src);
  const src = inline.length ? inline[0].textContent : '';
  const count = re => (src.match(re) || []).length;

  ok('inline script found', src.length > 100000, src.length + ' chars in ' + inline.length + ' inline / ' + scripts.length + ' total');

  const fnv = s => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h ^= c & 0xff;        h = Math.imul(h, 16777619) >>> 0;
      h ^= (c >> 8) & 0xff; h = Math.imul(h, 16777619) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  };
  const build = fnv(src);
  ok('build hash computable', /^[0-9a-f]{8}$/.test(build), build);

  // the capture-shim premise: frame() must re-register through the GLOBAL binding
  ok('frame() re-registers via global rAF',
     /function frame\([\s\S]{0,500}?requestAnimationFrame\(frame\)/.test(src), 'capture shim viable');
  ok('rAF call sites', count(/requestAnimationFrame\s*\(/g) === 2, count(/requestAnimationFrame\s*\(/g) + ' (expect 2: re-register + kickoff)');
  ok('no cancelAnimationFrame', count(/cancelAnimationFrame/g) === 0, count(/cancelAnimationFrame/g) + ' site(s)');

  // the audio-entropy hazard and the two escape hatches
  const cbSites = count(/\.createBuffer\s*\(/g);
  ok('createBuffer has exactly 1 call site', cbSites === 1, cbSites + ' site(s) — prototype-wrap trick depends on this');
  ok('noise() draws from the SHARED Math.random',
     /function noise\([\s\S]{0,400}?Math\.random\(\)/.test(src), 'the defect; stub or private-PRNG it');
  ok('AudioContext ctor failure is caught',
     /catch\s*\([^)]*\)\s*\{\s*AC\s*=\s*null/.test(src), 'stub-throw keeps AC null — kills all audio entropy');
  ok('mute does NOT gate noise()',
     /function toggleMute\(\)\{(?![\s\S]{0,200}?AC=null)[\s\S]{0,200}?master\.gain\.value/.test(src),
     'confirms muting is not enough');

  // input + entropy seams
  ok('setPointer divides by S', /function setPointer\(x,y\)\{[^}]*x\/S/.test(src), 'record CSS px, not design units');
  ok('no stopImmediatePropagation', count(/stopImmediatePropagation/g) === 0, count(/stopImmediatePropagation/g) + ' site(s)');
  ok('stopPropagation is bubble-phase only', count(/stopPropagation/g) <= 2, count(/stopPropagation/g) + ' site(s)');
  ok('rand/irand/wchoice look up Math.random dynamically',
     /const rand=\(a,b\)=>a\+Math\.random\(\)/.test(src), 'outside-in seeding works with zero edits');
  ok('startRun re-seeds spawnBias/formT/cometT',
     /spawnBias=/.test(src) && /formT=/.test(src) && /cometT=/.test(src), 'seeding before Start is sufficient');
  // The Collapse inhale used to be the file's ONE real-time exception, and this asserted it. Overdrive's
  // drain lives inside step(), so the exception is gone and the second verb is finally reachable by a
  // tick-driven pilot. Assert the new invariant instead: the drain must be in step(), not in frameBody.
  ok('the Overdrive drain lives inside step()',
     /function stepOverdrive\(dt\)[\s\S]{0,400}?P\.charge=Math\.max\(0, ?P\.charge-OD_DRAIN\*dt\)/.test(src),
     'so tick(n) can drive it — unlike the Collapse inhale it replaced');
  ok('lastDmg exists for the death classifier', /lastDmg=\{/.test(src), 'reuse it rather than re-deriving');

  // ---------- live environment ----------
  ok('viewport is non-degenerate', innerWidth > 0 && innerHeight > 0,
     innerWidth + 'x' + innerHeight + ' dpr=' + devicePixelRatio);
  ok('document is visible', !document.hidden, 'hidden=' + document.hidden + ' (true ⇒ rAF never fires)');
  ok('AudioContext constructor present', !!(window.AudioContext || window.webkitAudioContext), '');

  const want = ['start','tick','diag','render','flip','overdrive','spawnBoss','spawnEnemy','odOn',
                'P','enemies','boss','lances','orbs','store','motes','FX','lastDmg',
                'formWall','formNoose','formPulse','formCross','formComet','formNeutralDrift'];
  const missing = g ? want.filter(k => !(k in g)) : want;
  ok('seam exposes what the harness needs', g && missing.length === 0, missing.length ? 'MISSING: ' + missing : Object.keys(g).length + ' keys, all present');
  ok('game is at the menu (safe to probe)', g && g.diag().state === 'menu', g ? g.diag().state : '?');

  // capture-phase listener must observe a HUD button that is a SIBLING of the canvas
  let seen = null;
  const h = e => { if (e.target && e.target.id) seen = e.target.id; };
  window.addEventListener('click', h, true);
  // #collapseBtn is the Overdrive button now — same id, same DOM position, so it is still the probe.
  // It is only a PROBE for event plumbing; if the id ever changes, point this at any HUD button that is
  // a sibling of the canvas rather than deleting the check.
  const cbtn = document.getElementById('collapseBtn');
  if (cbtn) cbtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  window.removeEventListener('click', h, true);
  ok('capture-phase window sees the HUD button', seen === 'collapseBtn', cbtn ? ('saw: ' + seen) : '#collapseBtn not in DOM');

  // ---------- async: does the clock actually behave here? ----------
  const raf = window.requestAnimationFrame.bind(window);
  window.__A0 = { status: 'running', build, rows: R };

  (async () => {
    const t = await new Promise(res => {
      let done = false;
      raf(x => { done = true; res(x); });
      setTimeout(() => { if (!done) res(null); }, 800);
    });
    ok('a natural rAF fires in this environment', t !== null,
       t === null ? 'TIMEOUT 800ms — batch runner needs the iframe wrapper' : 't=' + t.toFixed(1));

    if (t !== null) {
      let captured = null;
      const orig = window.requestAnimationFrame;
      window.requestAnimationFrame = fn => { captured = fn; return 1; };
      await new Promise(res => raf(() => res()));   // let the game's queued frame() run and re-register
      window.requestAnimationFrame = orig;
      ok('rAF capture yields the game callback', typeof captured === 'function',
         captured ? ('captured fn "' + (captured.name || 'anonymous') + '"') : 'NOTHING captured — loop not running?');
      if (captured) raf(captured);                  // hand the loop back so the page keeps living
    } else {
      ok('rAF capture yields the game callback', false, 'skipped — no natural frame');
    }

    const fails = R.filter(r => !r.pass);
    window.__A0 = { status: 'done', build, green: fails.length === 0, failed: fails.map(r => r.n + ' :: ' + r.d), rows: R };
  })();

  return 'assert0 running — read window.__A0';
})()
