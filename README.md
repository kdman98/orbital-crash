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
```

`www/` is build output, not a second copy to edit. `manifest.webmanifest` and `sw.js` make the page
installable and offline-capable.
