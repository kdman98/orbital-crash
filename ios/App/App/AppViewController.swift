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

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        runDebugProbe()
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
