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

(Or set `STARLANE_ROOT` / `APOLLO_ROOT`.) In a cloud session, clone ApolloMaths read-only
(`git clone --depth 1 https://github.com/stuartokin/apollomaths <path>`) and set `APOLLO_ROOT=<path>`. The rig serves them at `http://localhost:8765/Starlane/` and
`/ApolloMaths/` (change the port with `RIG_PORT`).

## Run

```bash
python tests/run_all.py                 # everything (about 35 minutes)
python tests/run_all.py static,site     # just some suites
python tests/test_adventures.py icemoon,contact   # chosen adventures only
SHOTS=1 python tests/test_adventures.py # also save a screenshot of every adventure scene to tests/out/
python tests/run_all.py                 # sessions on Stuart's Default environment have STARLANE_CODE already
```

The test-mode code is **never** stored in this public repo; it comes from the `STARLANE_CODE` environment
variable (on Stuart's Default cloud environment).
- The cheat page can only be unlocked with the real code (`unlock_js()` in `rig.py` derives the marker from it).
- Without `STARLANE_CODE` the code-box and cheat-page checks are skipped, and `static` fails if `js/lock.js`
  still holds the placeholder.
- Everything else uses the game's own `testMode()` directly. `run_all.py` writes `tests/out/report.md`.

## Suites

| Suite | What it checks |
|---|---|
| `static` | Every JS file parses; all 50 adventures are well formed (answers in range, per-age questions, explanations, flight goals); the question pack at every age band and the adult set give valid questions; no API keys or the test code in the repo; no “Apollo” shown to players (Moon-landing history excepted) |
| `site` | Launch page, pilot registration, the game starting, saving only under `starlane-standalone-v1`, the code box, Stop, trailer and tour (no flash of the game, a key stops them), and the maths source for age, adult and exam-practice levels |
| `gameplay` | Starts docked, launch cut-scene to flight, weapons-safe near the station, a hyperspace jump, the Modern 3D style, the phone layout |
| `cheats` | The cheat page: locked by the code, every rule has a control, saving, presets, 🔗 links; ▶ Play opens a practice copy with the settings (real commander untouched); spawn limits, no-attacks, police off, safe-zone and weapons-safe distances, emergency escape; ✅ Apply puts the rules on the real commander and they survive a reload; removing them; the hand-off is refused without the unlocked page; no sideways scroll on a folded Fold or a phone |
| `display` | Battle display: Automatic under attack, the first-time tip, default instruments, F3 and the ⚔ BATTLE button, Always on/Off and choosing instruments in Pause; Reset all keys; key and display changes kept after test mode; Pause in test mode goes back to the test screen or the cheat page; the touch-screen 📱 full-cockpit switch; the mouse outside the picture (aims, fires, wheel; a side-panel switch still works and doesn't fire; Capture mouse locks and is released by Pause); aiming measured over the whole screen; firing on the whole-screen battle display but not on its instruments, with the lasers from the screen's bottom corners; the battle display on an open Fold and a phone (no sideways scroll, no errors) |
| `cockpit` | Settings follow the device (a laptop commander on a Fold gets touch settings, and its laptop ones back on the laptop); the touch joystick turns (classic rolls); no roll lock or turning back to the station after launch; touch controls clear of the picture, the corner buttons and each other on the Fold (1000×558 Edge, 1100×880), a phone and a folded Fold sideways; bigger corner buttons on 4K; touch layouts: phone defaults (Simple, battle display on, no Twin), Fold default Simple, auto speed (FAST/SLOW, docks on Easy only), choosing Twin sticks, both sticks' mapping, and every layout with and without the battle display clear of the picture, the corner buttons, the battle buttons and each other at three touch sizes |
| `flyto` | Fly to target: one tap is information only; the card's TURN TO / FLY THERE; the second tap flies; STOP, a joystick drag and an attack all hand back control; Normal from behind the station flies round, lines up and stops without a bump; Easy docks and completes a courier mission; the planet (with the jump drive) and a ship stop at the right distance; not in adventures or races, not for black holes or missiles; off by default for mouse, the resting pointer doesn't cancel it, arrow keys do. VIEW: F4 sequence, each display really shows, nothing else changes, Retro → Modern, 🎛 VIEW in the clear view; phones skip the 3D cockpit. Phone console: six big switches, a real tap on MORE, no overlaps, choosing closes the strip |
| `tours` | Every training tour played to the end on a laptop and a Fold-sized touch screen (6 at a time, speech skipped): no step may time out; on touch Nova never mentions keys or the mouse, a 👆 finger taps the console and the touch panel replaces the keyboard; guided flight's touch wording for each layout |
| `testmenu` | Test mode's own screen: all ~120 buttons pressed, each either stays on the test screen or is marked ▶ and starts play; PLACES (real taps at Fold size) moves the practice copy and stays |
| `trend` | 📈 TREND graph questions at ages 9–10, 13–14 and adult: every answer re-solved from the graph, explained, an option, no repeated options; younger levels get the basics, 13–14 a mix, adults only the harder kinds (all seven appear); exam practice still asks about the graph |
| `difficulty` | Easy / Normal / Hard: Normal is exactly the normal game, each level's rules, damage taken Easy < Normal < Hard, the launch page choice reaches the game and Pause changes come back, the DIFFICULTY page (CHOOSE, ◀ BACK), cheat rules win, test mode leaves the real level alone, a new commander keeps it, older players keep their level, phones fit |
| `transitions` | Where you land after every screen change, on 10 screen sizes (phone both ways, Fold folded/open/sideways, iPad, laptop, 1908×950, QHD, 4K) in Modern, and Original and Retro on four of them: docked tabs; Escape and ◀ BACK on every Pause page; Career from Pause and from the station; launch and docking cut-scenes; chart, DATA, cargo, mission log; camera and view kept over Pause; switching style mid-flight; battle display; trailer and tour return to the same Pause page; test mode; a maths puzzle; an adventure abandoned; hyperspace; Stop and relaunch; turning a phone or Fold; GAME OVER → CARRY ON / LEAVE. Every step: no errors, no sideways scroll, the picture on screen, the game still open. Real taps/clicks on RESUME, Career ✕ CLOSE and CARRY ON. `python tests/test_transitions.py quick` = laptop and phone only |
| `adventures` | Every adventure started in test mode and stepped through scene by scene at phone (844×390) and laptop (1280×720) size, with no errors |
| `bridge` | ApolloMaths: a new child added, Starlane opened from the arcade inside ApolloMaths, the child's name and exam reach the game, no “Apollo” in questions, answers recorded and the commander saved in ApolloMaths, cheat-page settings applied to and removed from the child's real commander, Stop returns |

## Test hooks in the game

`Arcade._game()._dbg` exposes read-mostly hooks used here, among them `mode`, `overlay`, `C` (commander),
`set(k,v)`, `launchDbg()`, `startHyperDbg()`, `advStartDbg(id)`, `advNow`, `advNextDbg()`, `openMathDbg(kind)`,
`pickMathDbg(option)`, `mathQNow`, `makeMathQDbg(kind)`, `persistNow()`, `weaponsSafe()`, `startShow(kind)`,
`show`, for the battle display `bdOn()`, `bdToggle()`, `underAttack()`, `bdT`, `bdForce`, `BD_ITEMS`, `hurtDbg(d)`, `backToCheats()`, and for the cheat page `CH(k)`, `CHD`, `SAFE`, `escapeNow()`, `escT`, `escCD`, `cheatPlay(s)`, `cheatApplyReal(s)`, `cheatClearReal()`, `cheatCmd(c,s)`, `spawnTick(dt)`, `missionSpawns()`. `Arcade._game().testMode()` / `inTest()` open and query test mode. Keep these working — the automated
workflows depend on them.

## Adding a test

Write `tests/test_<name>.py` with `async def main(p)` returning a `Result` (see `rig.py`), add `<name>` to
`SUITES` in `run_all.py`, and document it in the table above.
