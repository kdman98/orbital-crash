// ORBITAL CRASH — harness boot.
//
// preload.js has to run BEFORE the game's inline script, and a plain page load gives no such seam: by the
// time anything of ours executes, the game has already handed its kickoff callback to the browser's rAF
// queue — which, in a hidden tab, never drains. Phase 0 measured exactly that (document.hidden=true, no
// natural frame in 800ms).
//
// So: write index.html into a BLANK iframe document with preload.js injected into <head>. Its kickoff
// lands in our captured rAF instead of the browser's, and we own every frame from the first one.
// Requires no edit to index.html.
//
// It used to point f.src at index.html FIRST, to establish the document URL, and rewrite that document.
// That booted the game TWICE in one Window (document.open() reuses it), and the two loops then fought
// over preload's single-slot H.pending. It survived here only by accident: instance #1 registered with
// the browser's real rAF before preload existed, and a hidden tab never fires it, so #1 stayed dormant
// and #2 won. Make the tab VISIBLE — i.e. let a human actually play — and #1 wakes, re-registers into
// the captured slot, and takes over, drawing to the DISCARDED document's canvas. Measured in record.html:
// an empty field, a frozen HUD, 600 pumped frames producing 0 steps and 0 RNG draws. A green selftest
// never covered it, because the selftest runs hidden.
// <base> replaces what f.src used to provide: about:blank has no URL of its own, so without it the
// game's relative URLs would resolve against this page instead of its own directory.
//
// Run this in any page on the same origin, then drive f.contentWindow.__H.
// sw.js is cache-FIRST for everything that is not .html, and it caches whatever it fetches. So the first
// fetch of a harness file freezes that URL at that version forever, and `cache:'reload'` does not help —
// it bypasses the HTTP cache but the request still goes through the service worker. Measured the hard way:
// an edited record.js kept loading its previous version, producing a dt 48x too large.
// Every harness fetch therefore carries a unique query, which misses the cache by construction.
let __n = 0;
const fresh = url => fetch(url + (url.includes('?') ? '&' : '?') + 'h=' + (++__n) + '_' + (performance.now() | 0),
                           { cache: 'reload' }).then(r => {
  if (!r.ok) throw new Error('fetch ' + url + ' -> ' + r.status);
  return r.text();
});
window.__fresh = fresh;

// Load a harness module into an already-booted game window.
window.__load = async (w, name, base) => {
  const txt = await fresh((base || '/orbital-crash/') + '.harness/' + name);
  w.eval(txt);
  return txt.length;
};

// Drop harness files out of the service worker cache so nothing stale survives this session.
window.__purgeHarnessCache = async () => {
  if (!window.caches) return 0;
  let n = 0;
  for (const key of await caches.keys()) {
    const c = await caches.open(key);
    for (const req of await c.keys()) {
      if (req.url.includes('/.harness/')) { await c.delete(req); n++; }
    }
  }
  return n;
};

window.__boot = async function (opts) {
  opts = opts || {};
  const base = opts.base || '/orbital-crash/';
  const bust = '?h=' + (opts.nonce || 'boot') + '_' + (++__n);

  const [src, pre] = await Promise.all([
    fetch(base + 'index.html' + bust, { cache: 'reload' }).then(r => r.text()),
    fetch(base + '.harness/preload.js' + bust, { cache: 'reload' }).then(r => r.text()),
  ]);

  // Build identity, from the same bytes the iframe will parse. Every tape carries this; replay refuses on
  // mismatch. With a service worker caching index.html and the file changing daily, this is not optional.
  const fnv = s => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h ^= c & 0xff;        h = Math.imul(h, 16777619) >>> 0;
      h ^= (c >> 8) & 0xff; h = Math.imul(h, 16777619) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  };
  const inlineSrc = (src.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';

  const old = document.getElementById('__harness_frame');
  if (old) old.remove();
  const f = document.createElement('iframe');
  f.id = '__harness_frame';
  f.style.cssText = 'position:fixed;left:-10000px;top:0;width:1280px;height:800px;border:0';
  // No src and no onload wait. A fresh iframe already holds an about:blank document that is available
  // synchronously on append; setting src='about:blank' instead fires `load` DURING appendChild, before a
  // handler can be attached, and the await then never resolves — measured as a hung selftest.
  document.body.appendChild(f);

  const injected = src.replace(/<head>/i,
    '<head>\n<base href="' + base + '">\n<script>\n' + pre + '\n<' + '/script>');
  if (injected === src) throw new Error('boot: no <head> found to inject into');

  const d = f.contentDocument;
  d.open();
  d.write(injected);
  d.close();

  // The rewritten document parses asynchronously; wait for the game to hand us its kickoff callback.
  const w = await new Promise((res, rej) => {
    let tries = 0;
    const check = () => {
      const cw = f.contentWindow;
      if (cw && cw.__H && cw.__orbital && cw.__H.pending) return res(cw);
      if (++tries > 200) return rej(new Error('boot: game never registered a frame callback (' + tries + ' polls)'));
      setTimeout(check, 20);
    };
    check();
  });

  w.__H.build = fnv(inlineSrc);
  w.__H.swStubbed = (typeof w.navigator.serviceWorker === 'undefined');
  return w;
};
