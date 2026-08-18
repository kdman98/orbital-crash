// ORBITAL CRASH — service worker.
//
// The whole game is three files and no dependencies, so "offline support" here means precaching the
// lot at install and never thinking about it again. There is no API, no user data, nothing dynamic.
//
// This file only runs on the WEB build. Inside the Capacitor shell the assets are already bundled into
// the app, so a service worker there would add nothing and could serve a stale build after an update —
// index.html guards the registration behind `!window.Capacitor`.
//
// Bump CACHE when the shell changes. Anything not in this version's cache is deleted on activate, so
// the bump is the whole release mechanism.
//
// ⚠️ "CHANGES" MEANS THE BYTES, NOT THE LIST — and reading it the other way has already cost the key
// art twice. `5670cb0` and `ac23e56` each REPLACED art/keyart-wide.webp (62048 -> 70788 -> 42984 bytes)
// with the SHELL list character-for-character identical and CACHE left at v3. Everything past the
// document branch below is served CACHE-FIRST, and `activate` only deletes caches whose key differs
// from CACHE — so a client that installed before either commit serves its copy of the superseded art
// forever, with no error and no way to notice. Not a cosmetic drift either: `ac23e56` re-exported at
// native size, so the stale copy is precisely the upscaled one that commit exists to stop shipping.
// Found in-browser, where the menu was still rendering the FIRST export until `caches` was cleared by
// hand — every screenshot taken before that was of superseded artwork.
//   No player is exposed today: Pages serves `master`, which has no art at all. The silence is what
// carries forward, to every icon, the manifest and any asset added later. Touch a byte of anything in
// SHELL and bump this, whether or not the list itself moved.
// ⚠️ v5, AND THE BUMP IS THE WHOLE POINT OF THIS EDIT. `./audio/music.mp3` joins SHELL below. Adding a
// path without moving this constant is exactly the failure recorded above — everything past the document
// branch is served cache-first, so a client that installed under v4 would never fetch the new entry.
//   ⚠️ AND IT NEEDS BUMPING AGAIN WHEN THE TRACK ACTUALLY LANDS. The file does not exist yet; `install`
// maps each URL through `c.add(u).catch(()=>{})`, so the 404 is swallowed per-URL and the rest of the
// shell still caches — which means a client can install v5 with the music entry MISSING and, being
// cache-first, never look again. Whoever drops the track in bumps this to v6.
const CACHE = 'orbital-crash-v5';

const SHELL = [
  './',
  './index.html',
  './bestiary.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-1024.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  // The title screen's key art. Precached with the shell rather than fetched lazily: it is the FIRST
  // thing drawn on a cold start, so an offline first launch without it opens on a black menu.
  './art/keyart-wide.webp',
  './audio/music.mp3',
  './art/keyart-tall.webp',
];

self.addEventListener('install', e => {
  // Precache individually rather than via addAll: addAll is all-or-nothing, so one 404 on an icon
  // would leave the game with no offline copy at all.
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // never touch third-party requests

  // NAVIGATIONS AND THE GAME ITSELF: network first. A balance change should reach the player the next
  // time they open the game online, not whenever the cache happens to turn over. Falling back to cache
  // is what makes it work on a plane.
  const isDoc = req.mode === 'navigate' || url.pathname.endsWith('.html');
  if (isDoc) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  // EVERYTHING ELSE (icons, manifest): cache first. These change only when the shell version does,
  // and the activate handler already deletes the old version wholesale.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }))
  );
});
