import UIKit
import Capacitor
import CoreMotion

/// Feeds device tilt to the game from CoreMotion, because WebKit will not.
///
/// WHY THIS EXISTS. The game steers by `deviceorientation`, which works in Safari and does not work
/// here. Measured on a real iPhone, in this WebView: `DeviceOrientationEvent.requestPermission()`
/// exists and its promise REJECTS, and after attaching the listener regardless — on the theory that
/// the native grant and the JS permission API are separate doors — **no events arrive at all**.
///
/// It is not for want of the documented hook. Since iOS 15 WKWebView only delivers motion when the
/// host app implements `webView(_:requestDeviceOrientationAndMotionPermissionFor:...)`, and Capacitor
/// already implements it and already answers `.grant`
/// (node_modules/@capacitor/ios/.../WebViewDelegationHandler.swift). It is granted and still silent.
/// Nor is it the scheme: `iosScheme` cannot be set to https (WKWebView reserves it) and the `localhost`
/// hostname already confers secure-context privileges.
///
/// So the web sensor path is a dead end on this stack, and CoreMotion is not — it is a native API with
/// no WebKit gate in front of it. This is a ~40-line bridge, NOT a native rewrite: it replaces only the
/// SOURCE of two numbers. Every piece of tilt behaviour the game has — the calibration, the dead zone,
/// the orientation remap, the low-pass, the speed curve — stays in JS, already verified there.
class MotionBridgeViewController: CAPBridgeViewController {

    private let motion = CMMotionManager()

    /// 60Hz, matching the game's step. This was 30Hz on the reasoning that the JS side low-passes the
    /// reading anyway so sampling faster bought nothing — which was wrong twice over. The smoothing was
    /// a per-EVENT fraction back then, so halving the rate doubled the lag (~221ms to 63%, felt and
    /// reported as sluggish). That is fixed properly on the JS side, where smoothing is now a time
    /// constant and rate-independent. What remains is staleness: at 30Hz a reading is up to 33ms old
    /// before the game reads it, against a 16ms step. 60 costs one more string eval per frame and
    /// removes half of that.
    private let hz = 60.0

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        startMotion()
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
        guard let i = args.firstIndex(of: "--evalJS"), i + 1 < args.count else { return }
        awaitSeam(then: args[i + 1], attempt: 0)
        #endif
    }

    #if DEBUG
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

    private func startMotion() {
        guard motion.isDeviceMotionAvailable else { return }   // Simulator: no sensor, stay quiet
        motion.deviceMotionUpdateInterval = 1.0 / hz
        motion.startDeviceMotionUpdates(to: .main) { [weak self] data, _ in
            guard let self = self, let d = data else { return }
            // Attitude is reported in the DEVICE's own frame and does not rotate with the screen —
            // the same convention beta/gamma use, so the game's existing tiltMap() still applies and
            // the landscape sign handling does not need rewriting.
            //   pitch -> beta, roll -> gamma, radians -> degrees. Any constant offset between
            // CoreMotion's zero and the web API's is irrelevant: the game calibrates on the angle you
            // are holding at the start of a run and only ever reads differences from it.
            let beta = d.attitude.pitch * 180.0 / Double.pi
            let gamma = d.attitude.roll * 180.0 / Double.pi
            // A non-finite attitude has to be dropped BEFORE it is formatted, because %.3f renders
            // .nan and .infinity as the bare words `nan` and `inf` — which are not JS numbers but
            // undeclared identifiers, so the eval throws a ReferenceError sixty times a second
            // instead of passing a bad number the JS side could clamp. Nothing to sanitise here in
            // the injection sense: both values are Doubles straight from CoreMotion and cannot carry
            // syntax. Dropping the sample is correct — the game keeps steering on the last good one.
            guard beta.isFinite, gamma.isFinite else { return }
            // Guarded on the JS side existing, so updates arriving before the page has parsed — or on
            // a build without the receiver — are a no-op rather than a console error per frame.
            self.bridge?.eval(js: String(
                format: "window.__nativeTilt&&window.__nativeTilt(%.3f,%.3f)", beta, gamma))
        }
    }

    /// Sensors are a battery cost with nothing to show for it while the app is backgrounded, and the
    /// game is paused there anyway.
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        motion.stopDeviceMotionUpdates()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        if !motion.isDeviceMotionActive { startMotion() }
    }
}
