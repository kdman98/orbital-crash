# v2-ios — the port session's brief

You are in a **git worktree**, not the master checkout. Your directory is
`orbital-crash-ios/`, your branch is `v2-ios`, and the feature session is working
`v2` in `orbital-crash/` at the same time. Neither of you can switch the other's
branch, which is the whole point of the split — see *Why a worktree* below.

Branched from `v2` @ `631bfbf`, which is `master` plus nothing. v2's new feature is a
three-zone touch control; it is not in your tree yet.

## What is already true, so you do not spend a run re-deriving it

**The baseline builds green.** Verified at `631bfbf` with the web payload synced:

```bash
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 17' build
```

`** BUILD SUCCEEDED **`, one warning, `App.app` produced. **This is the first time the
CoreMotion NaN guard from `e82194d` has ever been compiled** — PATCHNOTE records it as
"Swift, edited but **not built** this session". It compiles. That item is closed.

**⚠️ `pod install` crashes on this machine, and it is the locale, not the project.**
CocoaPods 1.17.0 on Ruby 4.0.6 calls `String#unicode_normalize` on `Dir.pwd` inside
`Pod::Config#installation_root`. The shell here has `LC_CTYPE="C"` and `LANG=""`, so
`Dir.pwd` comes back ASCII-8BIT and it dies with
`Encoding::CompatibilityError: Unicode Normalization not appropriate for ASCII-8BIT`.
The backtrace names ruby internals and reads like a broken install; it is not.

```bash
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install
```

Verified both ways — fails without, succeeds with. `npm run sync` shells out to `pod
install`, so **the same fix belongs in package.json** rather than in whoever's memory.
That edit is yours; `package.json` is in your half of the split.

**⚠️ xcodebuild must not be sandboxed.** A sandboxed iOS build deadlocks at 0% CPU
rather than failing — it looks like a slow build forever. Sample the pid to tell blocked
from slow.

**The payload was 5 days stale before this run.** `www/` and `ios/App/App/public/` held a
373KB `index.html` against the real 598KB one. Both are gitignored build output, so a
fresh worktree has neither — and `npm run build` is what closes it. If you are ever
measuring the app, assert a marker from the new code *before* you trust the number: the
WebView will happily run a build that is not the one on disk.

## Your half

Anything under `ios/`, the build pipeline, `package.json`, and simulator verification.

- **Bake the locale fix into `npm run sync`** so this never bites again.
- **Tighten CSP `connect-src` to `'none'`.** `7b2f75a` left it at `'self'` for exactly one
  reason, in its own words: the same file loads in the Capacitor WebView and *"iOS was not
  built this session, so tightening it blind would break there silently"*. You now have a
  build. Verify nothing in the WebView needs it, then it is one word on both pages.
- **Frame-count the sky cache.** MECHANICS "Open" says the frame-rate claim is unverified
  because the dev browser discards uncomposited frames, and that *"the only thing that
  settles it is a frame counter on the Capacitor iOS build"*, where frames really composite.
  Measure cache on vs off and settle or refute it. ⚠️ Any copy asserting a frame-rate win
  today is asserting something nobody has measured.
- Splash, icons, safe-area and the landscape lock against real device metrics. The app is
  **landscape-only** (`UISupportedInterfaceOrientations` is LandscapeLeft/Right on both
  phone and iPad).

## Not your half

`index.html`'s **input block (~7313–7580)** and the **TILT block**. The feature session is
rewriting both: the intent-based touch scheme (tap=flip / drag=steer / 2nd finger=Overdrive)
becomes three zones — move on half the screen, Overdrive on a quarter, flip on a quarter —
and tilt is being retired as the iOS steering path, so `touchSteers=!tiltDevice` goes away.
`MotionBridgeViewController.swift` stays in the project but ends up unwired; **do not delete
it** and do not tune `TILT`.

You may still edit `index.html` — the CSP is in `<head>` and a frame counter belongs in the
render loop, and neither hunk is anywhere near line 7313. Git merges non-overlapping hunks
without complaint. Just stay out of those two blocks.

## Why a worktree rather than both of us on v2

Git refuses the same branch in two worktrees, and two sessions in one directory share one
HEAD — so "same branch, concurrent" is not a thing that exists. Sharing the master checkout
is the pattern that produced the claim-`index.html`-before-a-big-pass rule; this removes the
need for it. `git worktree list` from either directory shows both.

Merge back into `v2` when your half is verified.
