# Starlane test rig

Automated browser tests for Starlane Trader — the standalone site and, when the ApolloMaths repo sits next to
this one, Starlane opened from inside ApolloMaths. They run in headless Chromium through Playwright.

## Set up (once)

```bash
pip install -r tests/requirements.txt
python -m playwright install chromium
```

Put the two repos side by side so the rig can serve them as GitHub Pages does:

```
somewhere/
  Starlane/       ← this repo
  ApolloMaths/    ← optional; needed for the bridge and exam-practice checks
```

(Or set `STARLANE_ROOT` / `APOLLO_ROOT`.) The rig serves them at `http://localhost:8765/Starlane/` and
`/ApolloMaths/` (change the port with `RIG_PORT`).

## Run

```bash
python tests/run_all.py                 # everything (about 6 minutes)
python tests/run_all.py static,site     # just some suites
python tests/test_adventures.py icemoon,contact   # chosen adventures only
SHOTS=1 python tests/test_adventures.py # also save a screenshot of every adventure scene to tests/out/
STARLANE_CODE=xxxxxxxx python tests/run_all.py    # also test the test-mode code box with the real code
```

The test-mode code is **never** stored in this public repo. Without `STARLANE_CODE`, that one check is skipped;
everything else uses the game's own `testMode()` directly. `run_all.py` writes `tests/out/report.md`.

## Suites

| Suite | What it checks |
|---|---|
| `static` | Every JS file parses; all 50 adventures are well formed (answers in range, per-age questions, explanations, flight goals); the question pack at every age band and the adult set give valid questions; no API keys or the test code in the repo; no “Apollo” shown to players (Moon-landing history excepted) |
| `site` | Launch page, pilot registration, the game starting, saving only under `starlane-standalone-v1`, the code box, Stop, trailer and tour (no flash of the game, a key stops them), and the maths source for age, adult and exam-practice levels |
| `gameplay` | Starts docked, launch cut-scene to flight, weapons-safe near the station, a hyperspace jump, the Modern 3D style, the phone layout |
| `adventures` | Every adventure started in test mode and stepped through scene by scene at phone (844×390) and laptop (1280×720) size, with no errors |
| `bridge` | ApolloMaths: a new child added, Starlane opened from the arcade inside ApolloMaths, the child's name and exam reach the game, no “Apollo” in questions, answers recorded and the commander saved in ApolloMaths, Stop returns |

## Test hooks in the game

`Arcade._game()._dbg` exposes read-mostly hooks used here, among them `mode`, `overlay`, `C` (commander),
`set(k,v)`, `launchDbg()`, `startHyperDbg()`, `advStartDbg(id)`, `advNow`, `advNextDbg()`, `openMathDbg(kind)`,
`pickMathDbg(option)`, `mathQNow`, `makeMathQDbg(kind)`, `persistNow()`, `weaponsSafe()`, `startShow(kind)`,
`show`. `Arcade._game().testMode()` / `inTest()` open and query test mode. Keep these working — the automated
workflows depend on them.

## Adding a test

Write `tests/test_<name>.py` with `async def main(p)` returning a `Result` (see `rig.py`), add `<name>` to
`SUITES` in `run_all.py`, and document it in the table above.
