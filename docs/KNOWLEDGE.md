# Starlane Trader — knowledge base

*Stuart Okin — personal project, written in a personal capacity.*
*Last full update: 13 November 2026 (ApolloMaths 2.80, `starlane-v5`); added to on 15 November 2026 (`starlane-v14`: cheat page, battle display, whole-screen mouse, cockpit lamps — §3.11–3.14).*

This document is written so that a future person or AI model, starting cold, can understand the whole game,
how it connects to ApolloMaths, and why it is the way it is. Lessons learned are in `LESSONS.md`; future
requirements in `ROADMAP.md`; the test rig in `tests/README.md`.

---

## 1. What Starlane is, and who it is for

A space trading game in the spirit of *Elite* (1984): you start with 100 credits and a small ship docked at a
station, buy and sell cargo between star systems, fight pirates, take missions and explore a procedurally
generated galaxy (160 systems, seed 20261108; every system reachable within 7 light years). The classic
mechanics are recreated from published research (Mark Moxon's annotated source at bbcelite.com); names, ships,
systems and text are original. It was built for Stuart's son Apollo (aged 11 in 2026) and is designed to teach while it entertains:

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

Both sites are **static GitHub Pages sites with no build step**. Changes are committed and pushed to `main` by
Claude (Stuart no longer uploads files); Pages publishes in a minute or two. Both are on the origin `stuartokin.github.io`, so pages from one can script pages
of the other when framed (this is how ApolloMaths hosts Starlane — §6).

### Files in this repo

| File | Role |
|---|---|
| `js/version.js` | The version shown in Pause, on the launch page and the cheat page; bump with `CACHE` in `sw.js` |
| `cheats.html`, `js/cheats-page.js`, `js/cheats-def.js`, `css/cheats.css` | **The cheat page** (§3.11): grown-ups change enemies, attacks, safe zones, emergency escape, money, ship and equipment |
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

**Getting about (since `starlane-v15`).** Only one screen (`overlay`) is open at a time, so "going back" is
handled explicitly:
- **Escape** (`escKey()`) steps back one place: a Pause sub-page goes to its parent (`MENU_UP`: DIFFICULTY,
  WATCH, TOURS, ADVENTURES, SAVES, RESTART → GAME; BATTLE DISPLAY → DISPLAY; FLIGHT ASSISTS → CONTROLS); a
  Pause tab closes Pause; DATA goes back to the chart; chart, cargo, mission log and arrival report close;
  with nothing open it pauses (like P). During a cut-scene it still skips the scene. Before v15 the game shell's
  `preventDefault` swallowed Escape, so "P or Esc pauses" was not true.
- **Screens opened from another** use `openOv(name,{o,t})` and `closeOv()` and close back to where they came
  from: Career from Pause returns to Pause. Opened by its key (Z) or from the station page, Career closes to
  the game.
- **Dying** shows GAME OVER and waits: **▶ CARRY ON** (`carryOn()`, Enter or Space) docks you at the last
  station without leaving the game; **⏏ LEAVE THE GAME** ends the session (launch page, or back to ApolloMaths).
  Before v15 it always dropped you on the launch page after 2.8 s.
- **Adventure offers** never replace a screen you have open (`advMaybe` waits until nothing is open).
- The restart point after GAME OVER (`stats.starlaneDockSnap`) is written by `persist()` while docked;
  docking now calls `persist()` as soon as `mode` becomes `docked`.
- Movies, tours and test mode snapshot the game (`snapReal`) and return you to the same mode, docked tab and
  Pause page.

### 3.2 Visual styles
Three styles chosen on the title screen: **Modern** (real 3D via Three.js), **Original** (1984 green
wireframe) and **Retro** (solid shapes, classic feel). `C.opt.style` holds the choice. The **bulkhead surround** (`bulkheadURL()`, `surround(on)`) is a generated image framing the
game picture on wide screens. Adventures draw in a compact panel over the live view (`renderAdv`) and their
effects (fog, storms, globes, sun, galaxy) across the full wide view (`advWide()`).

### 3.3 Economy, galaxy and politics
160 systems with government, economy and tech level; markets with prices that move; news ticker
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

### 3.4a Difficulty (since `starlane-v15`)
`C.opt.difficulty` is `easy`, `normal` (default) or `hard`. `DIFF` in `starlane.js` holds what each level sets
from the cheat rules. `CH(k)` looks in this order: cheat rules (`test.ch` or `C.cheats`), then the level, then
`CHD`. Normal sets nothing, so it is exactly the normal game.

| Rule | Easy | Hard |
|---|---|---|
| pirateRate | 50 | 140 |
| pack | 1 (lone pirates) | normal + 40% chance of one more |
| maxShips | 4 | 8 |
| enemyHP | 70 | 130 |
| shieldRegen | 140 | 80 |
| interdict | 50 | 150 |
| escape | on | — |
| rewardScale | — | 125 |

Older multipliers still apply on top: damage taken in `hurt()` (×0.6 / ×1 / ×1.35), and enemy laser and ramming
hit chances. Where it is chosen:
- On the launch page (**Difficulty (fights)**, `pilot.diff`), which is applied at launch.
- In Pause → GAME → the level button → **DIFFICULTY** page (`renderDiff`, `setDifficulty`). A change there goes
  back to the launch page through `StarlaneSite.difficulty(d)`, except in test mode.
- A cheat-page *Apply* that sets a difficulty also updates the launch page.

**New commander** keeps the level. In **ApolloMaths**, a child with no saved commander starts on Easy (or on
`profile().difficulty` if ApolloMaths ever sends one). Maths questions are never affected. Since v15,
`cheatPlay` stores only the changed rules in `test.ch`, so the level still applies underneath.

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

**Since `starlane-v16`:**
- **Per-device settings.** `devApply()` (called from `fixOpt`) works out the device kind every load (`devKind()`:
  phone, tablet or desktop, from `pointer:coarse` and screen size). The settings in `DEV_OPTS` (style, controls,
  mfd, cock3d) are kept per kind in `C.opt.devs`, so switching device swaps them. First time on a kind:
  - phone: Retro, classic, simple cockpit;
  - tablet: classic, simple cockpit;
  - desktop: the defaults.
- **Touch steering.** The `turn` assist (touch only, on by default) makes the joystick and drag-steer move yaw
  instead of roll, in both `controls()` and `controlsModern()`.
- **Docking assist** acts only when you are in the corridor, not `departing()`, and facing the station within
  0.7 rad.
- **Touch full screen layout** (`tdUpdate`, `.arc-tw` CSS):
  - the corner buttons are icons in a row (`.arc-lbl` hidden);
  - the speed track starts below `.arc-ctl`;
  - `TD.layout` records the rectangles;
  - `surround()` is off while `TD.on`.

**Touch layouts (since `starlane-v17`).** `C.opt.touchMode` is `simple` (default), `twin` or `classic`, and is
kept per device kind. `tmNow()` gives what is actually in use: Twin needs `TD.on` and a non-phone device, and
falls back to Simple otherwise. Chosen in Pause → Controls → 📱 TOUCH CONTROLS (`menuTab='touch'`,
`renderTouchModes`; `MENU_UP.touch='controls'`). Layout in `tdUpdate`:
- **Simple**, top down: FAST / CRUISE / SLOW (`p.sw`), BOOST and MISSILE, then FIRE.
- **Twin**, bottom up: right stick (`p.base2`, giving `TD.x2`/`TD.y2`), FIRE, then BOOST and MISSILE side by side.
- **Classic**: FIRE plus the speed track.

In Twin, `controls()` and `controlsModern()` map the left stick to yaw and to throttle rate (`thr=-TD.y`), and
the right stick to pitch and roll.

**Auto speed** (`autoSpeed`, called from the end of `assistTick`, when `autoOn()`):
- It eases `P.throttle` towards the level in `AUTO_LV` (`autoLv`): SLOW 90, CRUISE 0.6×max, FAST max.
- The speed is capped near the station (160), under attack (0.45×max) and near rocks (0.35×max).
- In the docking corridor facing the station: on Easy it brings you in (90, then 55 inside 1.5 km); on other
  levels it lets go and shows "FINAL APPROACH".
- Keys and the in-picture throttle strip set `autoT` and override it for 4 s.

**Defaults for phones:** `battle:'on'` (also by the `optVer` 5 migration) and Simple. Tablets get Simple, with
the Twin-sticks tip once (`C.opt.twinTip`).

### 3.9 Test mode
A grown-up's sandbox copy of the commander (`test={real:snapReal(),…}`): god mode, free fuel and cargo, jump
anywhere, stage any adventure, scenarios. The real commander is restored on exit. On the standalone site it
needs a code; in ApolloMaths it needs the family passphrase.

### 3.11 The cheat page (`cheats.html`, since `starlane-v6`)
A grown-ups' page at `/Starlane/cheats.html` (no link from the launch page), locked with the **same test code**
as test mode (only the FNV-1a check value is in the repo). Once unlocked, the tab remembers it in
`sessionStorage['starlane-cheats-ok']`.

- **What it changes.** `js/cheats-def.js` lists everything:
  - **rules** are lasting changes the game reads through `CH(k)`: enemies (most ships at once, pirate rate,
    pirates per attack, time between arrivals, toughness, damage, missiles, police), mission attackers, hyperspace
    interdiction and raiders, the safe zone (random attacks stop), the weapons-safe distance and the attacker
    distance that unlocks weapons, the **emergency escape**, invincible, damage taken, recharge, laser damage,
    no overheating, unlimited missiles/ECM/shock pulse/starburst, infinite fuel, jump anywhere, free shopping and
    mission rewards.
  - **commander changes** (`cmd`) are made once: credits, legal status, rank, difficulty, maths, movies, fuel,
    repair, adventures reset, ship, lasers, missiles, starburst charges, cargo size, personal items and an exact
    equipment list.
- **Normal values.** `CHD` in `starlane.js` holds the normal game. The `def` values in `cheats-def.js` must
  match it (`test_static` checks this).
- **Saving.** The page saves as you go to `localStorage['starlane-cheats-v1']` =
  `{v, name, rules, cmd, form, saved}`. Here `form` is the page's raw state and `cmd` is in the game's shape.
  Presets: Normal, Peaceful cruise, Easy fights, Swarm, Rich trader, Tank. 🔗 Copy link puts the settings in
  `#s=…` (base64url JSON). Nothing is sent anywhere.
- **Hand-off to the game.** ▶ Play opens `./?cheats=play` and ✅ Apply opens `./?cheats=apply`. `site.js`
  honours these only if this tab unlocked the page; otherwise they are ignored. The query is then removed from
  the address. `StarlaneSite.cheats()` reads the saved settings. Never in hosted mode.
- **In the game:**
  - `cheatPlay(s)` opens test mode with `test.ch` = the rules and applies `cmd` to the practice copy.
  - `cheatApplyReal(s)` applies `cmd` to the **real** commander and stores the changed rules as `C.cheats`, so
    they travel with the save. In test mode it edits `test.real.C`, so exit keeps it.
  - `cheatClearReal()` removes `C.cheats`.
  - `CH(k)` = `test.ch` → `C.cheats` → `CHD`.
- **Test mode's ✨ CHEATS tab** has: Open the cheat page, Use them in this practice copy, Apply them to the REAL
  commander, and Remove custom rules. This tab is how a parent applies settings to a child's commander inside
  ApolloMaths: unlock the page on the child's device first, because the settings are per device.
- **Emergency escape:** key **9** or Backspace, or the 🚀 ESCAPE button at the top centre in flight.
  `escapeNow()` gives `escPower`× full speed for `escSecs` seconds. Attackers get `lostT` (they stop targeting
  you), incoming missiles are destroyed, and it can't be used again for `escWait` seconds.
- **Mission attackers.** `misAtk` > 0 sets the size of every mission attack. If it is fewer than a mission needs,
  `misN()` lowers `m.need` so the mission can still be finished. Story 2's ambush stores `m.need`.
- **`SAFE`** is now a `let` and is reset each flight frame from `CH('safeKm')`.

### 3.12 Battle display (since `starlane-v8`)
In a fight the cockpit steps aside: the world renders full height (as the 3D cockpit does, `MAPI.full`) with
`drawBattleHUD()` instead of the console:
- a small radar at the bottom centre (top-down, with height ticks; red = attacking you, yellow = missile,
  cyan square = station);
- a left box (speed, shields, energy, hull);
- a right box (laser heat, missiles, lock, fuel, target name/distance/health), and the 🚀 escape button.

How it is controlled:
- **Setting** `C.opt.battle` = `auto` (default) | `on` | `off`, chosen in Pause → Display → ⚔ Battle display
  (`menuTab='battle'`, `renderBattleMenu`).
- **What it shows** is `C.opt.bShow` (defaults in `BD_ITEMS`).
- **`bdOn()`**: flight, front cockpit view, no seat, show or tour, and then `bdForce` (F3 / the ⚔ BATTLE
  button) or the setting. `auto` follows `bdT`, which is set to 10 s whenever `underAttack()` and counts down
  after.
- `PIT3D()` returns false while `bdOn()`, so every "3D cockpit" path steps aside.
- `bdForce` clears when a fight ends. The first time it comes on, Nova explains (`C.opt.bTip`).
- **The whole screen.** In Modern style and full screen, `wideState()` turns on whenever the battle display
  is on and the screen is wider or taller than the picture. `drawBattleWide()` then draws the HUD on the wide
  canvas behind the picture:
  - it uses game units scaled by `wd.s` over the whole screen; on touch screens the instruments stay within
    the picture's width;
  - its buttons can't use `btns`, which holds canvas clicks, so they go in `G._bdHits` (screen pixels), served
    by a capture `pointerdown` listener on the host.

  Retro and Original draw only the 4:3 picture.
- **The mouse on the whole screen** (`wholeScreenMouse(host)`, installed at start and by `wideState()`):
  pointer, wheel and right-drag events outside the canvas go to `G.onPointer` / `G.onWheel`, with game
  coordinates past the picture's edges (`toGameXY`).
  - "Open space", where the mouse steers and fires, is `y < openY()`: above the console (`VH`), or in the battle
    display above the instruments (`G._bdTop`).
  - Aiming: `aimSpan()` is the steering area around the crosshair. It is the picture, or the whole screen when
    the wide view is on, and full turn comes near its edges. `aimRing()` draws the ring and line; on a wide
    screen `aimWide()` draws them on the wide canvas so they show anywhere.
  - The canvas `mouseleave` doesn't drop a held fire button while the wide view is on.
  - **Capture mouse** (`C.opt.mouseLock`, off by default): `requestPointerLock` on the host, and a DOM cursor
    `#slCursor` moved by `movementX/Y`. `lockButton()` hands clicks to the battle buttons, the side-panel
    switches, the shell buttons or the game, in that order. `lockTick()`, called from the render loop, releases
    the pointer for menus, docking, shows and tours.
- **Lasers in the battle display** start from the bottom corners of the whole screen (`beamWide()` on the wide
  canvas; `G._beamFrom`), or from (150,H) and (650,H) in the 4:3 picture. `drawBoot()` is skipped there.
- **`underAttack()`**: an attacker within 12 km, a missile coming at you, or hit in the last 10 s. The
  escape button uses it too; key 9 works any time escape is on.

### 3.14 Cockpit switch panels (since `starlane-v13`)
The wide 3D cockpit's side panels (`deckState`, `drawWing`, `drawSwitch`) show 15 switches (`DECK_L`,
`DECK_R`).
- Each switch has a status from `swState(id)`: `r` (off / not available), `y` (ready) or `g` (on / active),
  drawn as a glowing lamp in the cell's corner (`SWC` colours), with the cell's border tinted to match.
- The name comes from `swLabel()` (with counts) under a control drawn at 60% size. One font size is fitted to
  the longest name, "MISSIONS 9".
- `deckTip()` (hover labels) shows only when `C.opt.tips` is on.

### 3.13 Small things added in `starlane-v8`
- Test mode keeps `OPT_KEEP` options (keys, controls, battle, bShow, bTip, cock3d, mfd) when you exit; they
  are preferences, not part of the practice game.
- Pause → GAME in test mode shows ↩ Back to test mode, and ⚙ Back to the cheat page when `test.fromPage`
  (set when the cheat page started it). `backToCheats()` opens a new tab when hosted.
- Display tab:
  - `cockpit` is labelled "Cockpit frame";
  - `cock3d` is labelled "Full 3D cockpit";
  - touch screens get a 📱 button for `cock3d` (tablets start with the simple cockpit; `C.opt.device`).
- `wingWrap()` wraps text on the side screens of the wide 3D cockpit.

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
| 15 Nov | The cheat page and emergency escape; settings can be applied to a real commander (`starlane-v6`) |
| 15 Nov | Battle display, Controls page, Pause in test mode, touch full cockpit, cheat page tidy (`starlane-v8`) |
| 16 Nov | Difficulty levels (Easy / Normal / Hard); Escape works and steps back; Career returns to Pause; CARRY ON after GAME OVER; the transitions test on every screen size (`starlane-v15`). Cockpit review: settings per device, touch joystick turns, no assist after launch, tidy touch layout (`starlane-v16`) |
| 15 Nov | Battle display on the whole screen, mouse on the whole screen and Capture mouse, version shown, lasers from the screen corners, cockpit status lamps, sticky notes moved (`starlane-v9`–`v14`) |

## 8. Things that are true but easy to forget

- ApolloMaths 2.80 on GitHub **still contains the old built-in Starlane files** (`js/starlane*.js`,
  `js/vendor/three-*`) until Stuart deletes them; nothing loads them.
- The bridge only works over http(s) on the same origin; locally run the rig, which serves both repos.
- The game expects ApolloMaths-shaped globals; `site.js` provides stubs. If you add a host dependency to the
  game, add a stub to `site.js` too.
- `arcade.js` here and in ApolloMaths are different files now (ApolloMaths' would try to open Starlane remotely
  from inside Starlane — an infinite loop).
- The three sticky notes (`starlane-modern.js`, lived-in cockpit, placed with `onS(x,y)` in game units) sit on
  the canopy frame beside the mirror since `starlane-v14`, at Stuart's request (they used to cover console text); the trailer is ~46 s (accepted).
