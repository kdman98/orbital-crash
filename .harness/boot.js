// ORBITAL CRASH — harness boot.
//
// preload.js has to run BEFORE the game's inline script, and a plain page load gives no such seam: by the
// time anything of ours executes, the game has already handed its kickoff callback to the browser's rAF
// queue — which, in a hidden tab, never drains. Phase 0 measured exactly that (document.hidden=true, no
// natural frame in 800ms).
//
// So: load index.html into an iframe to establish the document URL (relative paths, same origin), then
// re-write that same document with preload.js injected into <head>. The game parses a second time, its
// kickoff lands in our captured rAF instead of the browser's, and we own every frame from the first one.
// Costs one extra parse (~250ms). Requires no edit to index.html.
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
  f.src = base + 'index.html' + bust;
  document.body.appendChild(f);
  await new Promise(res => { f.onload = res; });

  const injected = src.replace(/<head>/i, '<head>\n<script>\n' + pre + '\n<' + '/script>');
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
