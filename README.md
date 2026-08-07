# ORBITAL CRASH

Pure arcade survival — steer your star, annihilate opposite charge, survive the Anomalies. No
meta-progression; instant temporary powerup drops only.

**One rule holds the whole game up:** opposite-charge things that touch both die, and same-colour matter
passes through you harmlessly. Everything else — the rings you gather, the flip that turns them hostile,
the boss you can only hurt with matter you aimed or carried — falls out of that.

The game is a single HTML file. **No build step, no runtime dependencies, no network.** Opening
`index.html` is enough.

## Run

From the `ddd-games` root:

```bash
python3 -m http.server 8755
```

- **Play** — http://localhost:8755/orbital-crash/index.html
- **Bestiary** — http://localhost:8755/orbital-crash/bestiary.html

Any static file server works, and `file://` works too.

## Docs

| | |
|---|---|
| [docs/GLOSSARY.md](docs/GLOSSARY.md) | what a word means — one line per term |
| [docs/MECHANICS.md](docs/MECHANICS.md) | how it works, and **what must not break**. Start with `## The laws` |
| [docs/PATCHNOTE.md](docs/PATCHNOTE.md) | what changed and when. The reasoning is in the commit body — `git show <hash>` |
| [docs/SCOPE.md](docs/SCOPE.md) | 무료판 / 유료판 스코프 — what ships free and what is sold |

Numbers live in `index.html` and nowhere else. MECHANICS names constants rather than restating their
values, so there is only ever one place to change a tuning.

**Strings live in `L`, and nowhere else.** The game is English and Korean; `T('key')` is the only way to
reach a user-facing string, and **nothing may build one with `+`** — see `docs/MECHANICS.md ## Language`
for why that is a rule rather than a preference. To test a language without changing your browser:

```js
__orbital.store.lang='ko'; __orbital.applyLang()
```

⚠️ Setting `store.lang` alone changes what the next lookup returns and repaints nothing, which looks
exactly like a working switch until you check the screen. There is **no webfont** and there must not be:
"no build step, no dependencies, no network" is what makes `file://`, the service worker and the iOS
shell all work.

`legacy/` holds the documents these replaced — the old GLOSSARY and the ROADMAP ledger.
They are superseded, not maintained: **nothing in `legacy/` is guaranteed to still be true.** Read
them only to recover a detail a commit body does not carry.

## Tooling

Most of the balance figures in this repo come from these, not from play.

- **`.oracle.js`** — behaviour-preservation harness. Paste into the console after a page load: seeded PRNG,
  frozen rAF, a scripted pilot, and a bit-exact fingerprint trace, so a refactor can be *proven*
  behaviour-preserving. Drives the game through `window.__orbital`.
- **`.harness/record.html`** — play recorder and frame-exact replay. Tapes carry per-frame `dt`, so frame
  health is measured rather than inferred.
- **`tapes/`** — recorded sessions.

Two standing rules when measuring: **mute first** (a headless loop fires the whole sound bank at once), and
**load the page** — `node --check` cannot see a `ReferenceError`, and three separate load-time failures have
passed it. See `docs/MECHANICS.md ## Traps` before writing a test.

## Packaging

The game needs none of this to run; it exists for the iOS and PWA shells.

```bash
npm run build    # copies the game into www/
npm run ios      # build + cap sync + open Xcode
npm run ios:fast # same, minus pod install — use when only the game changed
```

`www/` is build output, not a second copy to edit. `manifest.webmanifest` and `sw.js` make the page
installable and offline-capable.

### Iterating on a real phone without rebuilding

A native rebuild-and-reinstall per edit is the slow way round, and none of it is npm's fault — `build`
is 271ms and `cap copy` 503ms, against minutes for xcodebuild plus the install. Two loops avoid it:

**Layout and gameplay — live reload.** The phone loads the page off this Mac, so an edit needs only a
refresh. Two terminals, phone and Mac on the same Wi-Fi:

```bash
npm run serve:lan   # terminal 1 — serves the SOURCE tree, so no build step at all
npm run ios:live    # terminal 2 — installs a shell that points at this Mac
```

Tilt works under live reload, and the older warning here that it does not was left over from before the
CoreMotion bridge. Nothing about tilt goes through the page's origin any more: `MotionBridgeViewController`
is native, and `bridge.eval` reaches `window.__nativeTilt` whatever the app is pointed at. The insecure
context only ever blocked `DeviceOrientationEvent.requestPermission`, and there is no such call left.

⚠️ Never ship a build made this way. `--live-reload` points the app at a laptop that will not be on the
player's network, and the result is a blank screen. It writes no config, so a plain `npm run ios` undoes
it — but the app already installed on the phone keeps pointing at the Mac until you reinstall.

**Tilt — build once, then tune live.** With the phone plugged in and Settings → Safari → Advanced →
Web Inspector on, Mac Safari → Develop → *[iPhone]* → the app's webview gives a console against the
running game. `TILT` is one mutable object precisely so this works:

```js
__orbital.tilt()            // raw sensor, smoothed vector, current max units/frame
__orbital.TILT.speed = 17   // live, next frame
__orbital.tiltCalibrate()   // re-zero to however you are holding it
```

`raw` moving while `vec` stays 0 means the dead zone is too wide. `vec` moving the wrong way means a sign
error in `tiltMap` for that screen angle. `tilt().device` false on a real phone means the native bridge
never called — that is a Swift-side problem, not a JS one, and nothing in the game can turn tilt on
without it.

**Tilt has no Settings switch, and testing it off-device needs the bridge.** It is selected by delivery
alone: `window.__nativeTilt(beta, gamma)` is the only thing that sets `tiltDevice`, so calling it once in
any browser console puts that build in exactly the state the iOS shell runs in. Feed it a neutral pair
twice to calibrate, then lean:

```js
__nativeTilt(4,4); __nativeTilt(4,4)   // this angle is now "level"
__nativeTilt(4,34)                     // 30 degrees right; __orbital.tilt().vec.x should climb toward 1
```

⚠️ The smoothing is a **time** constant, so a tight loop of these moves nothing — `k = 1-exp(-gap/tau)`
and `gap` is ~0. Space the calls in real time, or freeze `performance.now` and advance it by hand.

**First run is slow once, not always.** Xcode copies a full symbol set for each new iOS version under
`~/Library/Developer/Xcode/iOS DeviceSupport/` — "Preparing iPhone for development", several minutes,
and it looks identical to a hung build. It does not repeat for that version. If a build genuinely
hangs, `ps` it: 0% CPU with a log that has stopped growing is blocked, not slow.
