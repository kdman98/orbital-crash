# ORBITAL CRASH

Pure arcade survival — steer your star, annihilate opposite charge, survive the Anomalies. Your
Integrity never regenerates: purging an Anomaly is the only heal, so a run is one long spend.

## ▶ [Play in your browser](https://kdman98.github.io/orbital-crash/)

No install, no sign-up, no plugin, nothing to download. English and Korean — the game picks by your
browser and you can switch it on the menu.

| | Mouse and keyboard | Touchscreen |
|---|---|---|
| **Steer** | `Mouse` — the star chases your pointer | **left half** — drag; the star travels exactly as far as your finger does |
| **Flip** | `Space` or `Click` — reverse your poles | **bottom right** — press |
| **Overdrive** | hold `Shift` or `Right-click` | **top right** — hold |
| **Pause · Mute** | `P` / `Esc` · `M` | the `❚❚` button, top right corner |

On a touchscreen the screen is a map: one half steers, two quarters act. Which zone your finger lands
in is decided when it touches down and never re-read, so a steering thumb that wanders never turns into
a flip. Nothing is dragged onto the screen and nothing has to be aimed at — there is no on-screen stick
to find, because the whole left half is the stick.

**Goal** — survive, and score. **Core Integrity** is your health: matter of the *opposite* charge
damages it on contact, and the run ends when it reaches zero. Matter of *your* colour passes through
you harmlessly — which is why the flip is the whole game. It turns a wall into a doorway, and a
doorway into a wall.

## Credits and license

**Nothing here comes from anywhere else.** No webfonts, no CDN, no `<script src>`, no external URL of
any kind — the web build makes zero network requests and has zero runtime dependencies. Every sound is
synthesised in WebAudio at runtime, every graphic is drawn on the canvas, and the icons are built from
one master by `npm run icons:ios`. The only third-party code in the repository is **Capacitor** (MIT),
which builds the iOS shell and is not part of the web build at all.

Licensed under the **[PolyForm Noncommercial License 1.0.0](LICENSE)** — read it, run it, study it,
modify it, for any noncommercial purpose. Commercial use is reserved.
