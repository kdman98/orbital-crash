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
    }

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
