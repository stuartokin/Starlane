# Starlane Trader — changelog

The release number is the offline cache name `CACHE` in `sw.js` (bump it on every release).

## starlane-v17 — 16 November 2026
- **Three touch layouts**, chosen in Pause → Controls → 📱 TOUCH CONTROLS and kept per device:
  - **🕹 Simple** (the default): one joystick steers and **the ship picks its speed**. It cruises in open space
    and slows near the station, in fights and among rocks. FAST / CRUISE / SLOW replace the speed slider. On
    **Easy** it also brings you in to dock; on Normal and Hard the final approach is yours (tap SLOW).
  - **🎮 Twin sticks** (tablets and the open Fold): the left stick does speed and turning; the right stick does
    nose up and down, and roll. FIRE, BOOST and MISSILE sit above it. Not offered on phones (too small).
  - **✈️ Classic:** joystick plus speed slider, as before.
- Tablets and the open Fold get a one-off Nova tip about Twin sticks after their first 25 seconds of flight.
- **Phones fly with the battle display always on**: a bigger view, readable instruments and the radar. The
  console is one tap away (⚔ BATTLE).
- In Simple, the battle display's speed shows the auto level (CRUISE, SLOW, FAST), or YOU while you are steering
  the speed yourself (keys or the in-picture strip take over for 4 s).

## starlane-v16 — 16 November 2026
Cockpit review on every device, from Stuart's Fold screenshot ("mixed styles", hard to fly).
- **Settings follow the device you are playing on.** Display and control settings (style, controls, cockpit
  screens, full 3D cockpit) used to be fixed by the device the commander was created on. A laptop commander
  played on the Fold got the laptop's full 3D cockpit with touch controls on top. Now phone, tablet/Fold and
  laptop each keep their own settings, with touch defaults the first time.
- **Touch joystick turns the ship.** Left and right now turn, like the mouse. Before, they rolled the ship
  (Elite style), so turning took a roll and a pull. Classic roll steering: Pause → Controls → Flight assists →
  Joystick turns (off).
- **No more fighting the ship after launch.** On touch screens the docking assist switched on as soon as you
  left the station. It locked your roll to the station's spin and slowly turned you back to the station. It now
  works only when you are approaching and facing the station.
- **Stray diagonal lines removed:** docking-corridor frames too close to the camera are no longer drawn.
- The corridor hint ("LINE UP WITH THE CORRIDOR") shows only when you are facing the station.
- **Touch full screen:** Pause, Full screen and Stop shrink to icons in the corner, so they no longer cover the
  speed slider. The slider starts below them. The bulkhead portholes are hidden behind the touch controls (they
  looked like a second joystick).
- Upright phones get a "turn your screen sideways" tip.
- Big screens (2000+ px wide) get bigger corner buttons and score strip.
- New `cockpit` test suite. The rig now also runs the ApolloMaths bridge from this session.

## starlane-v15 — 16 November 2026
- **Difficulty levels: Easy, Normal and Hard.** Each one now changes the whole fight, not just the damage you take:
  - **Easy:** fewer and weaker pirates who come alone, faster shields, less hyperspace ambush, and the emergency
    escape switched on.
  - **Normal:** exactly as before.
  - **Hard:** more and tougher pirates in bigger groups, slower shields, more ambushes, and missions pay 25% more.

  Choose on the launch page (*Difficulty (fights)*) or in Pause → GAME → the level button, which opens a new
  DIFFICULTY page. The two stay in step. A new commander keeps the level, cheat-page settings still win, and
  children new to Starlane in ApolloMaths start on Easy. Maths questions are not affected.
- **Escape works** as the help always said: it pauses, steps back one page in Pause, and closes the chart,
  DATA, cargo, mission log and Career. Before, the game shell swallowed it.
- **Back to where you came from:** Career opened from Pause closes back to Pause, and DATA goes back to the
  chart.
- **GAME OVER no longer throws you out to the launch page.** ▶ CARRY ON docks you at your last station inside
  the game; ⏏ LEAVE THE GAME leaves as before.
- Adventure offers no longer pop up over a screen you have open.
- **Restart point fixed:** the "last docked" restart point now updates the moment you dock. Before, if you
  docked, launched and died, you could wake up at an older station.
- Pause → WATCH has a ◀ BACK button, and Nova's intro opened from WATCH closes back to WATCH.
- New test suites: `transitions` (every screen change, on 10 screen sizes and in all three styles) and
  `difficulty`.

## starlane-v14 — 15 November 2026
- The three sticky notes (lived-in cockpit) moved from the console screens (one covered "MISSILES" on SHIP
  SYSTEMS) to the canopy frame beside the rear-view mirror, and toned down so they look like paper, not lamps.

## starlane-v13 — 15 November 2026
- **Cockpit switch panels redesigned** (wide 3D cockpit): every switch has a glowing status lamp — **red** off
  or not available, **yellow** ready, **green** on or active — instead of the OFF / PRESS / TURN / GUARDED words.
  Small control on top, the name (with its number: MSL 3, TIME ×2, HOLD 0/20, HYP 4 s) across the cell below,
  one size for all, never running into the next switch. Cells are rounded and tinted by their state.
- Hover labels on the switches now obey the TIPS switch.

## starlane-v12 — 15 November 2026
- Battle display: your lasers now come from the bottom corners of the screen (they started from where the
  cockpit console used to be, half-way up). The start-up "systems check" no longer darkens the lower screen
  or covers the radar in the battle display.

## starlane-v11 — 15 November 2026
- **Mouse aiming really uses the whole screen**: steering is measured from the crosshair to the edges of the
  whole visible screen (before, full turn was reached inside the old 4:3 picture, so the rest of a wide
  screen did nothing), and the aiming ring and line are drawn on the whole screen, not cut off at the
  picture's edge.
- **Version shown** in Pause (GAME tab, bottom right), on the launch page and on the cheat page
  (`js/version.js`; kept equal to `CACHE` in `sw.js` by `test_static`).

## starlane-v10 — 15 November 2026
- **The mouse works on the whole screen** in flight, not just over the 4:3 game picture: it aims (steers),
  left click fires, right-drag looks around, the wheel changes speed. Cockpit buttons, side-panel switches,
  the battle buttons and Pause / Exit full screen / Stop keep first claim on clicks; the pointer doesn't steer
  or fire over the console or the battle instruments. Touch steering can start outside the picture too.
- **Capture mouse** (Pause → Controls, off by default): a click in flight locks the pointer to the game, with
  its own cursor; Esc, Pause, docking or menus give it back.

## starlane-v9 — 15 November 2026
- **Battle display uses the whole screen** in Modern style and full screen, whatever its shape (wide laptops,
  the taller Fold, phones): the 3D view fills the screen and the instruments sit at the screen's bottom corners
  (on touch screens, within the picture's width so they stay clear of the steering and FIRE controls). The red
  alert edge goes round the whole screen. Retro and Original styles keep the 4:3 picture.

## starlane-v8 — 15 November 2026
- **Battle display**: under attack the cockpit steps aside and the whole screen shows space, with a small radar
  (bottom centre) and slim instruments. Automatic by default (a one-off Nova tip says where to change it);
  Always on / Off in Pause → Display → ⚔ Battle display, where you also tick what it shows. F3 or the ⚔ BATTLE
  button switches it at any time.
- Emergency escape button now appears only under attack; key 9 works whenever escape is on.
- Cockpit side screens: text no longer overruns (cargo hold, mission, big credit numbers).
- Pause → Controls lists every fixed key (Shift, 9, F3, 1–4, P/Esc, Tab, wheel, right-drag, Ctrl+Shift+G).
  Reset all keys confirms, and key/display changes made in test mode are kept.
- Pause in test mode: ↩ Back to test mode, and ⚙ Back to the cheat page when started from there.
- Touch screens: Display → 📱 switches between the full 3D cockpit and the simple one; the roll-lock line no
  longer sits under the hold screen. The two cockpit settings are now called "Cockpit frame" and "Full 3D cockpit".
- Cheat page: ← Back to Starlane (top and bottom); sections start collapsed.
- Tests: new `display` suite.

## starlane-v7 — 15 November 2026
- The Swarm preset now switches the emergency escape on (it didn't, so there was no 🚀 button).
- Test mode → ✨ CHEATS has a 🚀 Emergency escape on/off switch.

## starlane-v6 — 15 November 2026
- **Cheat page** at `/Starlane/cheats.html`, locked with the test-mode code. It changes:
  - enemies at once, attack rate, pirates per attack, time between arrivals, enemy toughness, damage, missiles
    and police;
  - attackers per mission attack, hyperspace raids and raider numbers;
  - safe-zone, weapons-safe and weapons-arm distances;
  - invincible, damage taken, recharge, laser damage, no overheating, unlimited missiles, ECM, shock pulse and
    starburst, infinite fuel, jump anywhere, free shopping and mission rewards;
  - credits, rank, legal status, ship, lasers, equipment and more.
- Presets, settings saved as you go, and 🔗 links to carry settings to another device.
- **▶ Play a practice copy** (real commander untouched), or **✅ Apply to my commander** (rules kept with the
  save until removed).
- **Emergency escape** (key 9, or the 🚀 ESCAPE button): a burst of speed, attackers lose you, missiles lose
  lock, then a wait before it can be used again.
- Test mode → ✨ CHEATS: open the page, use its settings in the practice copy, apply them to the real commander
  (works inside ApolloMaths), or remove them.
- Tests: new `cheats` suite; `static` checks the page's normal values match the game's.

## starlane-v5 — 13 November 2026
- Knowledge base, portable test rig, read-only adventure test hooks.
