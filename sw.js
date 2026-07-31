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
const CACHE = 'orbital-crash-v2';

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
