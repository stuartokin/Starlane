# Starlane Trader — knowledge base

*Stuart Okin, Director of Cyber Regulation and Emerging Technologies, Ofgem — personal project.*
*Last full update: 13 November 2026 (ApolloMaths 2.80, Starlane cache `starlane-v5`).*

This document is written so that a future person or AI model, starting cold, can understand the whole game,
how it connects to ApolloMaths, and why it is the way it is. Lessons learned are in `LESSONS.md`; future
requirements in `ROADMAP.md`; the test rig in `tests/README.md`.

---

## 1. What Starlane is, and who it is for

A space trading game in the spirit of *Elite* (1984): you start with 100 credits and a small ship docked at a
station, buy and sell cargo between star systems, fight pirates, take missions and explore a galaxy of 256
systems. It was built for Stuart's son Apollo (aged 11 in 2026) and is designed to teach while it entertains:

- **Maths is woven in.** Trading, fuel, hyperspace and repairs pose short maths questions (multiple choice,
  with a worked explanation). A wrong answer costs a little; a right one earns a bonus.
- **Adventures** (50 of them) are short science, maths and logic stories told by Nova, the ship's computer,
  with questions pitched at three age levels and real flying tasks.
- **It must stay fun for children and safe**: no real-money anything, no chat, no accounts, nothing collected.

It now has three audiences:

1. **Children playing from ApolloMaths** (the maths-practice app), where questions follow the child's exam.
2. **Anyone on the public site**, who registers a pilot name and a level (age band, exam practice or adult).
3. **Adults wanting a real test** — the "Adult — tough" level (no-calculator mental maths and problem solving).

## 2. Where everything lives

| Thing | Where |
|---|---|
| Public game site | https://stuartokin.github.io/Starlane/ — repo `stuartokin/Starlane`, GitHub Pages from `main` |
| Host learning app | https://stuartokin.github.io/ApolloMaths/ — repo `stuartokin/ApolloMaths` |
| Hub site linking Stuart's repos | https://stuartokin.github.io/ ("Observatories") |
| Test rig | `tests/` in this repo (see `tests/README.md`) |
| Automated workflows | `.github/workflows/` (ApolloMaths has `exam-watch.yml`; Starlane's are planned — ROADMAP) |

Both sites are **static GitHub Pages sites with no build step**. Stuart edits by uploading changed files
through GitHub's web upload. Both are on the origin `stuartokin.github.io`, so pages from one can script pages
of the other when framed (this is how ApolloMaths hosts Starlane — §6).

### Files in this repo

| File | Role |
|---|---|
| `index.html` | Launch page: title, LAUNCH, Watch trailer, 2-minute tour, pilot registration (name + level), hidden `<dialog id="arcade">` |
| `js/site.js` | **This site's host.** Its own save store, pilot levels, question-source switching, the test-mode code box, launch/stop flow, video start-up, and the "hosted by ApolloMaths" mode |
| `js/starlane.js` (~514 KB) | **The game.** Flight, trading, galaxy, combat, docking, missions, Nova, adventures runtime, test mode, maps, cockpit, cut-scenes, videos |
| `js/starlane-modern.js` | The Modern 3D style (Three.js): ships, stations, planets, fog, bodies, faction looks (`FDECO`) |
| `js/starlane-adventures.js` | `StarAdv` — the 50 adventure scripts, their pictures (`art`) and 3D scene settings (`SCENES`) |
| `js/starlane-audio.js` | Sound effects and music |
| `js/arcade.js`, `js/retro.js`, `js/games.js` | The game shell (canvas, input, pause, full screen, touch) and retro drawing helpers. **Diverged from ApolloMaths' copies on purpose** |
| `js/speech.js`, `js/voices.js` | Nova's spoken lines (device speech synthesis) |
| `js/questions-pack.js` | Built-in maths pack: 23 topics, 50 generators, 4 age bands |
| `js/questions-adult.js` | `ADULT_BANK`: 21 tough no-calculator question types |
| `js/vendor/three-bundle.js` | Three.js (licence alongside) |
| `css/app.css`, `css/site.css` | Game styles (shared heritage with ApolloMaths) and launch-page styles |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline cache (`CACHE='starlane-vN'` — bump every release) and installable app |
| `tests/` | The test rig |
| `docs/` | These documents |

## 3. The game, system by system

### 3.1 Modes and the loop
`mode` is one of `docked`, `launchScene`/`launch`, `flight`, `hyper`, `dockScene`/`dockAnim`, `dead`.
Docked screens: **STATUS, MARKET, SHIPYARD, MISSIONS, DATA, CHART, LAUNCH**. Launching plays a cut-scene
(hangar, then out through the station slot, flown at slot height `(HG.yF+HG.yC)/2`). Flight is real-time
3D-ish space with a sun, planet, moons and station. Docking can be manual or assisted.

### 3.2 Visual styles
Three styles chosen on the title screen: **Modern** (real 3D via Three.js), **Original** (1984 green
wireframe) and **Retro** (solid shapes, classic feel). `C.opt.style` holds the choice. The **bulkhead surround** (`bulkheadURL()`, `surround(on)`) is a generated image framing the
game picture on wide screens. Adventures draw in a compact panel over the live view (`renderAdv`) and their
effects (fog, storms, globes, sun, galaxy) across the full wide view (`advWide()`).

### 3.3 Economy, galaxy and politics
256 systems per galaxy with government, economy and tech level; markets with prices that move; news ticker
(gluts, strikes, border wars, technology fairs); systems can change government after the player helps
("Dictatorship replaced by a Corporate Guild after help from Commander …"). Fuel is bought per light year;
the tank holds 7 LY. Shipyard tabs: Equipment (Essentials, Weapons, Defence, Systems, Personal), Ships,
Exterior (colours and hull name decal, raycast onto the hull). Charts: Galaxy, Local and a rotating 3D map.

### 3.4 Combat and safety rules
Pirates, police, traders and five **faction ships** (halo, scrapjaw, ark, seed, quicksilver, thornbloom looks;
`factionVisit()`). Lasers, missiles with lock-on, ECM, energy bomb, escape pod. **Weapons safe near stations**
(`weaponsSafe()`, setting `C.opt.weapSafe`, default on): lasers are held near a station unless you were hit in
the last 45 s or an attacker is within 12 km. **Full hold**: canisters are nudged, not destroyed, with
"📦 CARGO HOLD FULL" and a Nova line. The tractor beam shares the FIRE input and holds lasers while towing.

### 3.5 Missions and story
Bulletin board missions (couriers, supply runs, bounties, freedom missions, mining, station races), the
Academy, the Nav Cup, wingmen for hire, and a story arc ("The Vorn Signal"). First Contact is a set-piece
with signal lights (`drawSignal()`).

### 3.6 Adventures (`StarAdv`)
50 adventures, each `{id, kind:'space'|'ship', icon, title, subject, trigger:'calm'|'hyper'|'kill', reward:{cr,
item?, equip?}, fail, scenes:[…]}`. Scene types:

| Type | Meaning |
|---|---|
| `story` | Nova tells the story (`say`, optional `art`, optional `setup` to stage the world) |
| `choose` | Pick an answer. `q` may be `q(young, mid, older)`; `options`; `answer` (index, array for `many:true`, or per-age object); `explain` |
| `order` | Put `items` in the right order |
| `code` | Type a number (`answer`) |
| `flight` | A task in space: `task` (`reach`, `chase`, `waypoints`) or a `setup` (e.g. meteor tow, slingshot), `goal` text, `time` limit |

Ages come from `C.opt.advAge` (`young`/`mid`/`older`) — set by the pilot level or by ApolloMaths.
Adventures are **exclusive**: while one runs, other ships don't spawn and non-adventure chatter is muted.
`advStart`, `advNext`, `advFinish`, `advAbandon` are the runtime; `C.adv[id]` records plays and completion.
Test hooks: `advStartDbg(id)`, `advNow`, `advNextDbg()`; test mode can stage any adventure where it would
naturally happen (`tStageAdv(id)` — a real jump for `hyper` ones, open space for the rest).

### 3.7 Nova, guided flight and tours
Nova is the ship's computer and narrator (spoken via device voices). New commanders get a welcome overlay and
an optional **guided flight** tutorial. Pause → **WATCH** offers a ~46-second **trailer** and a **2-minute
overview**, both played in a sandbox (`startShow(kind)`, `snapReal/restoreReal`) so the player's real game is
restored exactly afterwards; any key or tap stops them; a 3-second countdown switch is optional.

### 3.8 Controls, assists and touch
Keyboard, mouse, gamepad and touch. Separate **flight assist** sets for touch and mouse (auto-level, aim
assist, turn-to-target, docking assist, pop-up DOCK/JUMP/ECM/TURN buttons) on Pause → Controls. Landscape full
screen on phones uses side touch controls (`TD`) and a floating joystick. Triple-tap the score strip on touch,
or Ctrl+Shift+G, opens test mode (subject to the host's check).

### 3.9 Test mode
A grown-up's sandbox copy of the commander (`test={real:snapReal(),…}`): god mode, free fuel and cargo, jump
anywhere, stage any adventure, scenarios. The real commander is restored on exit. On the standalone site it
needs a code; in ApolloMaths it needs the family passphrase.

### 3.10 Saving
The game calls the host's `save()`/`get()`; the commander lives at `stats.arcade.saves.starlane`.
Standalone: localStorage key **`starlane-standalone-v1`** only. Hosted: saved into the child's ApolloMaths
progress through `StarlaneHost.saveSave()`.

## 4. Where the maths comes from — the question socket

The game asks for maths through one socket, so any host can decide what is asked:

```js
window.StarlaneQuestions = {
  themedShare: 0.5,               // share of the game's own space-themed questions vs the host's
  get: (kind, ctx) => question|null,   // kind: 'fuel' | 'trade' | 'hyper' | 'repair' | 'dock' | 'bounty' | ...
  report: rec => {}                // optional: told about every answer {q, ans, picked, ok, kind, exam, topic}
};
// question = { q, opts:[4 strings], ans:'string in opts', how:'worked explanation', u:'unit', exam?, topic? }
```

`makeMathQ(kind)` asks `StarlaneQuestions.get` first; if it returns null it uses the game's themed
questions or the `bank` (`makeBankQ()` turns a bank question `{q, a, h|s}` into four options).

| Pilot level (standalone) | Source |
|---|---|
| Ages 7–8, 9–10, 11–12, 13–14 | Built-in pack `questions-pack.js` (`window.STARLANE_LEVEL()` = 0–3) |
| Exam practice: Tiffin S1/S2, 11+ grammar, ISEB, 13+ CE | ApolloMaths' real engine via a hidden frame on `../ApolloMaths/engine.html` (`Engine.ask(kind, exam, name)`), falling back to the pack offline |
| Adult — tough | `ADULT_BANK` (mental arithmetic, percentages, VAT, compound interest, algebra, powers, standard form, probability, time zones, volumes) |

## 5. The standalone site host (`js/site.js`)

- Own store (`starlane-standalone-v1`) and a stub of the ApolloMaths globals the game expects
  (`save`, `get`, `esc`, `toast`, `arcadeStatus`, `endSession`, `playerName`, `Storage.profiles`, `dayKey`, …).
- `BANDS` = the pilot levels above; `bandIndex()`, `STARLANE_LEVEL`, `questionSource()`.
- `play(opts)` opens the arcade with the `sl-booting` class (black screen) so neither the arcade menu nor the
  game's title screen flashes; dismisses the title with `g.tap()`; for videos starts `startShow` before
  uncovering. A watcher returns to the launch page when the game or video ends (`backToLaunch`).
- Test-mode code: Ctrl+Shift+G / triple-tap opens `#slCode`; the code is checked against an FNV-1a hash of
  `'starlane|' + code`. **The code itself is not in the repo** (Stuart has it).
- `window.StarlaneSite = {ready, hosted, forceExit, questionSource, probe}`.

## 6. Access from ApolloMaths (the bridge)

ApolloMaths is Stuart's maths-practice app (exam profiles for Tiffin Stage 1/2, 11+ grammar, the ISEB
Common Pre-Test for Eton and Harrow, and 13+ Common Entrance; themes; a secret arcade unlocked by a code).
Since ApolloMaths 2.79 it **no longer contains its own copy of Starlane**; the arcade opens this site.

How it works (ApolloMaths `js/arcade.js`, `openRemoteStarlane()`):

1. The arcade puts a full-screen `<iframe src="../Starlane/?host=apollo">` over itself and sets
   **`window.StarlaneHost`** (version 1):

   | Member | Purpose |
   |---|---|
   | `profile()` | `{name, band}` — the child's name and age band |
   | `loadSave()` / `saveSave(v)` | the commander, kept in the child's ApolloMaths progress |
   | `high()` | the child's Starlane high score |
   | `bank()` | ApolloMaths' question bank |
   | `question(kind, ctx)` | an exam-specific question for this child (`examQuestion`), personalised with the child's name and theme |
   | `report(rec)` | every answer, recorded in `stats.slMaths` for the parent dashboard |
   | `requestTest(cb)` | the family passphrase check (`Family.guard`) before test mode |
   | `exit({score})` | close Starlane, record the score, return to the arcade |

2. `site.js` sees `?host=apollo` and a parent `StarlaneHost` (same origin, so it can call it directly), hides
   the launch page and goes straight into the game using the host for name, saves, questions and test mode.
3. Arcade play time keeps counting; when earned time runs out ApolloMaths calls `StarlaneSite.forceExit()`.
4. If the site cannot be reached in ~9 s, ApolloMaths shows "Starlane can't be reached" with Try again.
   Opening ApolloMaths from a local file (not http/https) shows a message instead — remote mode needs a web address.
5. **Probe**: the parent dashboard's "🔍 Check Starlane questions" loads `?host=apollo&probe=1` hidden, with a
   probe host, and calls `StarlaneSite.probe(10)` to list ten questions and their sources — no playing needed.
6. **`engine.html`** in ApolloMaths is the question engine on its own (no screens, no progress) so the
   standalone site can offer exam practice.

ApolloMaths also has an **exam-watch agent** (`tools/exam-watch/watch.mjs`, workflow `exam-watch.yml`): monthly,
weekly June–November and mid-Feb/mid-Mar, it checks official exam pages, proposes key dates and drafts
sandbox-tested question generators, opens a PR labelled 🤖 AI-maintained and **auto-merges it** if the files
load. The Starlane content workflows planned in ROADMAP copy this pattern.

## 7. History in brief

| Period | What happened |
|---|---|
| Oct–early Nov 2026 | Starlane built inside ApolloMaths (v2.x): trading, flight, styles, Nova, adventures, test mode |
| 2.52–2.60 | Touch controls, full-screen phone layout, flight assists, map overhaul, faction ships, adventures staged in the 3D world, nebula fog, bulkhead surround, exclusive adventures, tractor beam on FIRE, weapons safe, full hold |
| 2.61–2.65 | Showcase trailer and 2-minute overview in Pause → WATCH; fight, First Contact, Earth/Moon arrival, attract screen with Nova voice-over |
| 2.66 | The question socket (`StarlaneQuestions`) |
| 12 Nov | Standalone Starlane repo and site created (launch page, pilot levels, built-in pack, code box) |
| 2.67–2.70 | ApolloMaths opens Starlane remotely (`StarlaneHost`); exam-following questions; answer reports; probe check |
| 2.71–2.80 | ApolloMaths generalised (exam plans, adaptive difficulty, new layout, themes, themed shop and arcade); built-in Starlane removed (2.79); adult and exam-practice levels on the Starlane site; profile protection |
| 13 Nov | This knowledge base, the portable test rig, read-only adventure test hooks (`starlane-v5`) |

## 8. Things that are true but easy to forget

- ApolloMaths 2.80 on GitHub **still contains the old built-in Starlane files** (`js/starlane*.js`,
  `js/vendor/three-*`) until Stuart deletes them; nothing loads them.
- The bridge only works over http(s) on the same origin; locally run the rig, which serves both repos.
- The game expects ApolloMaths-shaped globals; `site.js` provides stubs. If you add a host dependency to the
  game, add a stub to `site.js` too.
- `arcade.js` here and in ApolloMaths are different files now (ApolloMaths' would try to open Starlane remotely
  from inside Starlane — an infinite loop).
- A sticky note drawn on the cockpit console was noticed and deliberately left; the trailer is ~46 s (accepted).
