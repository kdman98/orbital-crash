import UIKit
import Capacitor

/// The app's root view controller. It exists for one reason now: to carry the DEBUG-only JS probe.
///
/// ⚠️ IT WAS `MotionBridgeViewController`, AND THE MOTION IS GONE. It fed device tilt from CoreMotion
/// because WebKit would not — measured on a real iPhone, `DeviceOrientationEvent.requestPermission()`
/// exists in this WebView and its promise REJECTS, and attaching the listener anyway delivers nothing,
/// even though Capacitor implements the documented host hook and answers `.grant`. That finding is why
/// the bridge was native, and it OUTLIVES the bridge: it is the reason nobody should simply add
/// `requestPermission` back if tilt is ever wanted again. `git log` has all ~40 lines.
///
/// Tilt stopped steering when the three-zone touch control landed, was kept unwired for a while on the
/// argument that verified Swift is worth preserving, and is now removed outright — the move zone is a
/// DISPLACEMENT and tilt is a rate, so returning it would mean designing a second steering model and
/// arbitrating between it and a finger, not re-enabling a switch.
class AppViewController: CAPBridgeViewController {

    #if DEBUG
    private var displayLink: CADisplayLink?
    private var linkTicks = 0
    private var linkStart: CFTimeInterval = 0
    #endif

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        hardenWebViewGestures()
        runDebugProbe()
    }

    /// Turns off the WebView's own zoom and text-interaction gestures, and LOGS WHAT THEY WERE FIRST.
    ///
    /// WHY THIS IS NATIVE AND NOT CSS. A magnifier was reported that appears "no matter the page or
    /// screen" and survived two CSS passes plus a rebuild. Content-level causes were ruled out by
    /// measurement rather than by argument: probed through `--evalJS` in the shipping WebView,
    /// `-webkit-user-select` already computed `none` on every element including runtime-injected
    /// `<button>`s, so text selection was never possible and the loupe cannot be a selection loupe.
    /// What is left is the WebView itself, which is the right shape for a symptom that does not care
    /// which screen is up: `viewport user-scalable=no` is a REQUEST to the page's viewport, whereas
    /// `scrollView.maximumZoomScale` is the thing that actually gates pinch and double-tap zoom, and
    /// nothing here had ever set it.
    ///
    /// ⚠️ THE `BEFORE` LOG IS THE POINT, NOT THE ASSIGNMENTS. If this fixes it, the before-line says
    /// what was wrong; if it does not, the before-line says the WebView was already at 1.0 and clears
    /// the whole class, which is worth as much. Setting the values without recording them would leave
    /// a fix that cannot be distinguished from a no-op — the failure this file has been bitten by
    /// repeatedly. Read with:
    ///   `xcrun simctl spawn <udid> log show --last 2m --predicate 'eventMessage CONTAINS "ORBITAL_GESTURE"'`
    private func hardenWebViewGestures() {
        guard let wv = self.webView else {
            #if DEBUG
            NSLog("ORBITAL_GESTURE: webView was nil at capacitorDidLoad — nothing hardened")
            #endif
            return
        }
        let sv = wv.scrollView
        #if DEBUG
        let pinchWas = sv.pinchGestureRecognizer?.isEnabled ?? false
        NSLog("ORBITAL_GESTURE_BEFORE: minZoom=%.3f maxZoom=%.3f zoom=%.3f bouncesZoom=%@ pinch=%@ gestures=%d",
              sv.minimumZoomScale, sv.maximumZoomScale, sv.zoomScale,
              sv.bouncesZoom ? "YES" : "NO", pinchWas ? "ENABLED" : "disabled",
              sv.gestureRecognizers?.count ?? -1)
        #endif

        sv.minimumZoomScale = 1.0
        sv.maximumZoomScale = 1.0
        sv.zoomScale = 1.0
        sv.bouncesZoom = false
        sv.pinchGestureRecognizer?.isEnabled = false
        // ⚠️ `isMultipleTouchEnabled = false` STOOD HERE AND WOULD HAVE BROKEN OVERDRIVE. It was written
        // with the justification that "the game reads at most one steering finger plus the two corner
        // zones, and every one of those is a separate single touch" — which is false and the same file
        // says so: `stickId` and `odTouchId` are distinct pointer ids held AT THE SAME TIME, because
        // holding Overdrive while steering is the whole point of putting them in different zones.
        // Pinch is already off above and zoom is capped at 1.0, so nothing needed this line anyway; it
        // was a speculative extra next to a measured fix, which is how a regression rides along with a
        // repair.

        // iOS 14.5+ only, and it is the switch that governs the selection loupe and the callout at the
        // native layer rather than per-element. Set here rather than on the configuration before the
        // WebView is built, because Capacitor owns construction; if this turns out not to take effect
        // after the fact, it has to move into the bridge's configuration hook.
        if #available(iOS 14.5, *) {
            // ⚠️ LOG THE PRIOR VALUE, NOT JUST THE NEW ONE. The first version of this printed only the
            // result, which cannot distinguish "this was the bug and is now fixed" from "this was
            // already false and the change is a no-op" — the exact ambiguity the zoom lines above were
            // written to avoid, reintroduced two lines later.
            #if DEBUG
            let was = wv.configuration.preferences.isTextInteractionEnabled
            #endif
            // ⚠️ THE ASSIGNMENT IS OUTSIDE THE GUARD AND MUST STAY THERE. This line is the fix; the
            // NSLogs around it are diagnostics. Guarding both together would ship a Release build with
            // the magnifier back and a Debug build that looks correct — the worst possible split.
            wv.configuration.preferences.isTextInteractionEnabled = false
            #if DEBUG
            let now = wv.configuration.preferences.isTextInteractionEnabled
            NSLog("ORBITAL_GESTURE_TEXT: isTextInteractionEnabled was=%@ now=%@ %@",
                  was ? "TRUE" : "false", now ? "TRUE" : "false",
                  now ? "(DID NOT TAKE — must move into the WebView configuration before construction)"
                      : (was ? "(CHANGED — this was a live gesture and is now off)" : "(no-op)"))
            #endif
        }
        #if DEBUG
        NSLog("ORBITAL_GESTURE_AFTER: maxZoom=%.3f pinch=%@ multiTouch=%@ (multi-touch left ON — Overdrive needs it)",
              sv.maximumZoomScale,
              (sv.pinchGestureRecognizer?.isEnabled ?? false) ? "ENABLED" : "disabled",
              sv.isMultipleTouchEnabled ? "YES" : "NO")
        #endif
    }

    /// Runs a JS expression passed as a launch argument and NSLogs the result.
    ///
    /// WHY THIS EXISTS. Measuring anything inside this WebView needs two channels and the shell had
    /// neither. There is no console: Capacitor prints JS console output with `print()`, which goes to
    /// stdout and is therefore invisible to `log show` — the only reader available when the app is
    /// launched by `simctl` rather than by Xcode. And there is no way in: the WebView loads a fixed
    /// `capacitor://localhost/` with no query string, so the page cannot be told anything either.
    ///   The consequence was that every question needing a NUMBER off the device — the sky cache's frame
    /// rate, which MECHANICS says only a real composited build can settle — had to be answered by
    /// rebuilding the whole app around a hardcoded constant, once per data point.
    ///
    /// ⚠️ `#if DEBUG` IS LOAD-BEARING, NOT TIDINESS. This evaluates arbitrary JavaScript from process
    /// arguments. Launch arguments can only be set by whoever starts the process — a developer with
    /// `simctl` or Xcode — so it is not reachable on a device someone else is holding, but a Release
    /// build has no business carrying an eval hook at all and the compiler is a better guarantee than
    /// a code review. If this ever needs to run against a Release build, pass the flag through a
    /// scheme-level setting rather than deleting this guard.
    ///
    /// Usage: `xcrun simctl launch <udid> com.orbitalcrash.game --evalJS "expression"`, then read it
    /// back with `log show --predicate 'process == "App"' | grep ORBITAL_PROBE`.
    private func runDebugProbe() {
        #if DEBUG
        let args = ProcessInfo.processInfo.arguments
        // `--probe` is sugar for the one expression anyone actually wants, because the alternative is
        // retyping ~20 lines of JavaScript into Xcode's argument field, where it is stored as ONE
        // scheme string with no syntax checking and no error if you fumble a quote — it simply reports
        // ORBITAL_PROBE_ERR and looks like the probe is broken. A named flag cannot be mistyped silently.
        // ⚠️ `--probe-off` IS NOT THE ABSENCE OF `--probe`, AND THAT IS THE WHOLE REASON IT EXISTS. The
        // flag lives in localStorage, so it survives removing the launch argument, reinstalling, and
        // rebooting — a player who armed it once keeps paying `probeSave()` every 240 frames forever,
        // and nothing on screen says so. Checked BEFORE `--probe` so that passing both disarms.
        // Native-side counterpart to `--refresh`. Answers a question NO amount of JavaScript can, because
        // every JS timer in this process is downstream of whatever WebKit decides to do.
        if args.contains("--displaylink") { measureDisplayLink(); return }
        if args.contains("--refresh") { awaitSeam(then: Self.refreshJS, attempt: 0); return }
        if args.contains("--probe-off") { awaitSeam(then: Self.probeOffJS, attempt: 0); return }
        if args.contains("--probe") { awaitSeam(then: Self.probeJS, attempt: 0); return }
        guard let i = args.firstIndex(of: "--evalJS"), i + 1 < args.count else { return }
        awaitSeam(then: args[i + 1], attempt: 0)
        #endif
    }

    #if DEBUG
    /// The canonical frame-probe expression: report the PREVIOUS session's record, then arm the next.
    ///
    /// THE TWO-LAUNCH SHAPE IS NOT AN INCONVENIENCE, IT IS THE MEASUREMENT. MECHANICS is explicit that
    /// reading the accumulators live is the load — that is the defect which made two rigs disagree 4x on
    /// the same change, and attaching a Web Inspector during a run is the same mistake wearing a nicer
    /// UI. So this never reads a running session: it reads what the last one flushed to localStorage and
    /// leaves the current one alone to record with nothing attached.
    ///
    /// ⚠️ IT READS BEFORE IT ARMS, AND IT MUST NEVER CALL `probeSave()`. `orbitalcrash_probe_out` is
    /// overwritten every `PROBE.flush` = 240 frames — 2s at 120Hz, 4s at 60 — so the previous session's
    /// record survives only in the window between page load and the first flush of this one. Capturing it
    /// into `__probeResult` here moves it into memory, where a later flush cannot reach it. Calling
    /// `probeSave()` from this expression would flush the accumulators as they are AT LAUNCH, which are
    /// empty, over the exact record it exists to read — a self-erasing probe that reports success.
    ///
    /// `recordingNow` is the field to read first. The very first `--probe` launch finds the flag unset,
    /// so THAT session is not recording however long you play it — `probeInit()` latches `PROBE.on` at
    /// boot and nothing re-reads it. The flag it sets takes effect on the next launch. Saying so in the
    /// payload costs one line and removes the only way to spend ten minutes measuring nothing.
    private static let probeJS = """
    (function(){
      var armed=false;
      try{ armed = localStorage.getItem('orbitalcrash_probe')==='1'; }catch(e){}
      var last=null;
      try{ last = window.__orbital.probeLast(); }catch(e){}
      try{ localStorage.setItem('orbitalcrash_probe','1'); }catch(e){}
      window.__probeResult = {
        recordingNow: armed,
        next: armed ? 'RECORDING. Play, then Run again to read this session.'
                    : 'ARMED for next launch. This session is NOT recording - Run again, then play.',
        last: last
      };
      return armed ? 'recording' : 'armed';
    })()
    """

    /// ⚠️ THE ONLY INSTRUMENT HERE THAT IS NOT DOWNSTREAM OF WEBKIT, WHICH IS THE WHOLE POINT.
    /// `--refresh` and the frame probe both sample `requestAnimationFrame`, so if WebKit clamps rAF they
    /// report the clamp and CANNOT distinguish it from the panel itself running at 60. Both readings come
    /// back 17ms either way. CADisplayLink is driven by CoreAnimation directly, so it sees the display.
    ///
    /// Three numbers, and the comparison between them is the answer:
    ///   · `maximumFramesPerSecond` — what iOS says this screen can do RIGHT NOW. 120 on a ProMotion
    ///     phone; it drops to 60 under Low Power Mode or Accessibility's Limit Frame Rate, so this also
    ///     re-checks both device settings without anyone having to trust a Settings screen.
    ///   · the measured CADisplayLink rate — what native actually GETS, having asked for 120.
    ///   · rAF, from `--refresh` — what the web layer gets.
    /// maximumFramesPerSecond=120 and a link at ~120 while rAF sits at 60 is WebKit clamping rAF, and no
    /// web-side change can reach it. All three at 60 means the display is at 60 and the web layer is
    /// innocent. A link stuck at 60 while the screen claims 120 is ours — a missing plist key or an
    /// unset frame-rate range.
    ///
    /// `preferredFrameRateRange` is set explicitly because a CADisplayLink does NOT default to the
    /// panel's maximum: without a range iOS is free to serve 60 and be entirely correct, which would
    /// fake exactly the result this exists to rule out.
    private func measureDisplayLink() {
        #if DEBUG
        let l = CADisplayLink(target: self, selector: #selector(onDisplayLink(_:)))
        // ⚠️ Guarded because the deployment target predates iOS 15. Without the range a CADisplayLink is
        // free to serve 60 and be correct, which would fake the exact result this exists to rule out.
        if #available(iOS 15.0, *) {
            l.preferredFrameRateRange = CAFrameRateRange(minimum: 60, maximum: 120, preferred: 120)
        }
        linkTicks = 0
        linkStart = 0
        l.add(to: .main, forMode: .common)
        displayLink = l
        #endif
    }

    @objc private func onDisplayLink(_ l: CADisplayLink) {
        #if DEBUG
        if linkStart == 0 { linkStart = l.timestamp; return }
        linkTicks += 1
        let elapsed = l.timestamp - linkStart
        guard elapsed >= 3.0 else { return }
        let screen = view.window?.windowScene?.screen ?? UIScreen.main
        var range = "unavailable (<iOS 15)"
        if #available(iOS 15.0, *) {
            // ⚠️ Formatted, not interpolated. `\(…)` on these produced `pref=Optional(120.0)` in the
            // shipped output — the compiler warned at this line and I left it. A measurement that prints
            // `Optional(…)` beside a number invites doubt about the number, which is the opposite of
            // what an instrument is for.
            // ⚠️ `preferred` is `Float?`, and the nil case is a RESULT rather than a formatting nuisance:
            // nil means the link expressed no preference, which is the "free to serve 60 and be correct"
            // state this whole measurement exists to rule out. So it prints `none`, never a silent blank.
            let r = l.preferredFrameRateRange
            let pref = r.preferred.map { String(format: "%.0f", $0) } ?? "none"
            range = "min=\(String(format: "%.0f", r.minimum)) pref=\(pref) max=\(String(format: "%.0f", r.maximum))"
        }
        let hz = Double(linkTicks) / elapsed
        // One preformatted argument: NSLog's variadic form is unavailable to Swift.
        let msg = String(format: "ORBITAL_DISPLAYLINK: measured %.1f Hz over %.2fs (%d ticks) | screen maximumFramesPerSecond=%d | link range %@",
                         hz, elapsed, linkTicks, screen.maximumFramesPerSecond, range)
        NSLog("%@", msg)
        l.invalidate()
        displayLink = nil
        #endif
    }

    /// Answers the one question the frame probe structurally CANNOT: is the panel running at 120Hz?
    ///
    /// ⚠️ VSYNC MAKES "SLOW GAME" AND "60Hz DISPLAY" THE SAME MEASUREMENT. A frame interval of 16.7ms
    /// means either the display refreshes every 16.7ms, or it refreshes every 8.3ms and the work missed
    /// one. The probe reports intervals, so it reads both as 17 and cannot say which — and MECHANICS
    /// already warns that every "we have headroom" claim from it is really "we are not dropping frames".
    ///   The discriminator is LOAD, not timing. Run this on the MENU, where the frame is nearly empty:
    /// if a page with almost nothing to draw still reports 16.7, no amount of optimisation will help
    /// because the ceiling is not ours. If it reports 8.3 there and 16.7 in play, the panel is at 120
    /// and the game is what misses — which is a fixable problem and a completely different project from
    /// replacing the renderer.
    ///
    /// `spread` is the honest caveat: iOS varies ProMotion refresh with content, so a genuinely idle
    /// page can be clocked DOWN to 60 or lower on purpose. A tight cluster at 16.7 is a cap; a smear
    /// across 8-25ms is adaptive throttling and says nothing either way. Report it rather than hide it.
    private static let refreshJS = """
    (function(){
      var iv=[], prev=0, n=0, NEED=180;
      function tick(now){
        if(prev) iv.push(now-prev);
        prev=now;
        if(++n<NEED){ requestAnimationFrame(tick); return; }
        iv.sort(function(a,b){return a-b;});
        var q=function(p){ return +iv[Math.floor((iv.length-1)*p)].toFixed(2); };
        var med=q(0.5);
        window.__probeResult={
          samples: iv.length,
          state: (function(){ try{ return window.__orbital.tut.mode ? 'tutorial' : 'see st'; }catch(e){ return '?'; } })(),
          min:q(0), p50:med, p95:q(0.95), max:q(1),
          spread:+(q(0.95)-q(0)).toFixed(2),
          impliedHz: Math.round(1000/med),
          verdict: med<11 ? '120Hz REACHED - any 17ms in play is OUR frame cost, not a cap'
                 : (q(0)<11 ? 'MIXED - panel can do 120 but is not holding it (adaptive or load)'
                            : 'CAPPED AT 60 - even the fastest frame never beat 11ms')
        };
      }
      requestAnimationFrame(tick);
      return 'sampling '+NEED+' rAF intervals';
    })()
    """

    /// Disarms the probe and reports the final record on the way out, because the last session's data
    /// is worth as much as any other and disarming is otherwise the one action that silently discards it.
    private static let probeOffJS = """
    (function(){
      var last=null;
      try{ last = window.__orbital.probeLast(); }catch(e){}
      try{ localStorage.removeItem('orbitalcrash_probe'); }catch(e){}
      window.__probeResult = { disarmed:true,
        next:'Probe OFF from the next launch. This session still records - probeInit() latched it at boot.',
        last: last };
      return 'disarmed';
    })()
    """

    /// ⚠️ POLLS FOR THE SEAM RATHER THAN SLEEPING A GUESSED INTERVAL, because the guess was wrong the
    /// first time it ran and it failed in the most misleading way available: a flat 1.0s delay after
    /// `capacitorDidLoad` reported `TypeError: undefined is not an object (evaluating
    /// 'window.__orbital.fps')`, which reads exactly like the seam having been renamed or the build
    /// being stale. It was neither — this page is ~600KB of inline script and simply had not finished
    /// executing yet. A fixed delay turns "not ready" and "not there" into the same message, and the
    /// whole point of a probe is to tell those apart.
    ///   So readiness is tested rather than waited for, and the expression only runs once the seam is a
    /// real object. A JS error after that is the caller's, and is reported rather than retried.
    /// Waits for `window.__probeResult` and logs it, so an ASYNCHRONOUS answer never has to be read off
    /// a screenshot.
    ///
    /// ⚠️ THIS EXISTS BECAUSE READING THE ANSWER CHANGED IT. `evaluateJavaScript` returns whatever the
    /// expression evaluates to immediately, so a measurement that takes ten seconds has no way to hand
    /// its result back — the first version painted the number into the DOM and I read it with a
    /// screenshot. A simulator screenshot is expensive and it lands ON the device being measured: two
    /// runs of the same frame-rate A/B disagreed by a factor of four (+37% against +150%) and the arms
    /// that disagreed most were the ones a screenshot had landed inside. **The instrument was part of
    /// the experiment**, which is the same defect, in a new place, that made every previous attempt at
    /// this measurement worthless — see THE SKY CACHE in index.html.
    ///   Polling is 2s, not 500ms, for the same reason: it is a single property read rather than a
    /// composite-and-encode, but it is not free, and a probe that samples five times per window is
    /// cheap enough to ignore while one that samples twenty is a thing to argue about.
    private func pollResult(attempt: Int) {
        guard attempt < 90 else { return }          // 90 x 2s = 3 minutes
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            guard let self = self else { return }
            self.webView?.evaluateJavaScript(
                "window.__probeResult ? JSON.stringify(window.__probeResult) : null"
            ) { value, _ in
                if let s = value as? String {
                    NSLog("ORBITAL_PROBE_RESULT: %@", s)
                } else {
                    self.pollResult(attempt: attempt + 1)
                }
            }
        }
    }

    private func awaitSeam(then js: String, attempt: Int) {
        guard attempt < 60 else {          // 60 x 0.25s = 15s, far past any cold start
            NSLog("ORBITAL_PROBE_ERR: seam never appeared (window.__orbital undefined after 15s)")
            return
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { [weak self] in
            guard let self = self else { return }
            self.webView?.evaluateJavaScript("typeof window.__orbital") { value, _ in
                guard (value as? String) == "object" else {
                    self.awaitSeam(then: js, attempt: attempt + 1); return
                }
                self.webView?.evaluateJavaScript(js) { value, error in
                    if let error = error {
                        NSLog("ORBITAL_PROBE_ERR: %@", String(describing: error))
                    } else {
                        NSLog("ORBITAL_PROBE: %@", String(describing: value ?? "nil"))
                        self.pollResult(attempt: 0)
                    }
                }
            }
        }
    }
    #endif

}
