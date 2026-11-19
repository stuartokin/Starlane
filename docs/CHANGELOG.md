# Starlane Trader — changelog

The release number is the offline cache name `CACHE` in `sw.js` (bump it on every release).

## Docs — 19 November 2026 (no game change, still starlane-v30)
- Roadmap: Stuart's decisions on question banks (built-in content is his; people may send him questions to
  incorporate; adults load their own — already built in v29–30; ApolloMaths keeps its own questions), and two new
  requirements: **R6** a workflow for more systems, missions, adventures and question packs, and **R7** story arcs
  with different endings. Stale ApolloMaths housekeeping item removed (done there).

## starlane-v30 — 18 November 2026
Question banks, Stuart's follow-ups (18 Nov).
- **👁 Show password:** every password and key box on the question-bank page (admin password, your own password,
  the Gemini key) has an eye to show or hide what you typed.
- **Ages match the pilots:** banks, the Gemini generator and the bank kit use the same ages as the pilots' training
  levels — Ages 7–8, 9–10, 11–12, 13–14 and Adult (exam practice shown under its age: 11+/ISEB/Tiffin → 11–12,
  13+ CE → 13–14). The AI is told the exact age and UK school year. A 9–10 pilot now gets 9–10 questions, not 7–8
  ones. Banks made before v30 still work.
- **Where to get a Gemini key:** “❓ How do I get a Gemini API key?” links to Google AI Studio, the pricing and the
  models pages, and to the free chats (Gemini, ChatGPT, Claude) for the bank kit, which needs no key.
- **Which questions are in use:** the launch page (under the training level) and Pause (GAME tab, bottom left) show
  “📚 Questions: built-in” or the bank's name and mode, or that the bank has none for this pilot's age.
- Tests: `banks` suite now 42 checks (ages, old names, exam ages, 👁, key help, launch page and Pause lines).

## starlane-v29 — 18 November 2026
**Question banks** (Stuart’s design, 18 Nov). Guide: `docs/QUESTION-BANKS.md`.
- **📚 Question banks (grown-ups)** on the launch page opens a separate page, locked by an **admin password**:
  a starter password Stuart gives out (only a scrambled check is in the repo), which a family can replace with their
  own on each device. “Forgot your password?” takes the starter password and puts every pilot back on built-in
  questions.
- **Pilots on this device:** the launch page can hold several pilots (➕ New pilot), each with their own name,
  level and saved game. The first pilot keeps the existing save.
- **Banks:** paste, upload or open a 🔗 link; or **✨ make one with Gemini** using your own key (kept on the device;
  a **second opinion** drops any question where Gemini disagrees with itself). The **bank kit** builds a prompt for
  any AI, with an example bank and the list of adventure puzzle slots.
- **Every question is checked** (one right answer among different options, an explanation, lengths that fit,
  suitable words, “Apollo” only in Moon history, templates re-solved 200 times); bad ones are dropped one by one
  with a reason. **👀 Review** (optional) lets a grown-up remove questions.
- **Per pilot:** a bank and a mode — Built-in, Mixed (about half) or Only this bank — with the built-in questions
  always filling any gap. Bank questions reach the quick puzzles, the Academy and Navigator’s Cup (including new
  **“pick several”** questions with ✔ CHECK), race maths gates and adventure puzzle slots (8 story-bound slots must
  keep the answer the story needs). Questions from a bank show “📚 Custom question set”.
- **Inside ApolloMaths, banks are never used** — the child’s plan decides the questions, as before.
- Tests: new `banks` suite (29 checks: validator, lock and passwords, pilots, import/review/link/delete, every mode
  and the fallback, “pick several”, gates, adventure slots, ApolloMaths, Gemini through a stand-in server).

## starlane-v28 — 18 November 2026
Adventures by level, batches 2–5: **all 50 adventures done.**
- Every one of the 135 adventure puzzles now has its own question at each level: younger (7–9), middle
  (10–12), older (13–14) and adult — 398 levels in all, on the same topics, getting harder. Number puzzles
  (sequences, primes, binary and hexadecimal, Caesar codes, ratios, fuel, loops, time zones, pulses, panels…)
  change every time.
- Every answer was solved twice: by its author and by an independent checker who saw only the questions. All
  417 checked answers agreed; the checker’s notes led to clearer wording in 9 puzzles (an ordering that could go
  two ways, “midnight” answers that could be 0 or 24, a few facts given as stated assumptions).
- The password puzzle no longer offers “apollo” as an answer (it is now “starlane”).
- Long answers now wrap onto two lines in adventure buttons, and long ordering puzzles (up to 8 steps) lay out
  without overlapping the “Your order” list.
- Tests: `advlevels` now covers all 50 adventures — 13,800 generated puzzles re-solved in Python each run, and
  four different first puzzles for the four levels in every adventure.

## starlane-v27 — 18 November 2026
Adventures by level, batch 1 of 5.
- **Adventure puzzles now depend on the level chosen at the start.** In the first 10 adventures (The Ticking
  Canister to The Locked Armoury, 28 puzzles) each level gets its own question on the same topic: younger
  (7–9), middle (10–12), older (13–14) and a new **adult** level (a clever adult, no specialist knowledge —
  any rule needed is given in the question). For example, the acid puzzle asks a 7-year-old which item is an
  alkali, and an adult how many times more hydrogen ions pH 2 has than pH 5.
- **Numbers change on replay** in the number puzzles (sequences, primes, binary, hexadecimal, Moon weights,
  bulbs and energy).
- The "Adult — tough" pilot level now gives adult adventure puzzles (it used to give the 13+ ones). The Adventure
  Log's Puzzle level has an **Adult** button. Adventures 11–50 still use their original puzzles (adult gets the
  13+ version) until their batches are done.
- Accuracy: every answer was solved twice — by its author and by an independent checker who did not see the
  answers; two orderings that could fairly go two ways were rewritten.
- Tests: new `advlevels` suite — shape of every level, 4,000 generated puzzles re-solved in Python, every level a
  different question, and in the game each level gets its own puzzle.

## starlane-v26 — 18 November 2026
From Stuart's list (18 Nov).
- **Five new kinds of station race**, on the MISSIONS board alongside the gate race:
  - 🪨 **Asteroid slalom**: weave between rocks; each rock hit adds 3 s.
  - 🎯 **Target run**: each target shot on the way takes 2 s off.
  - 🔢 **Maths gates**: at each of 6 checkpoints, fly through the gate showing the right answer (questions at the
    pilot's level, from 7 + 5 to 15% of 240); a wrong gate adds 5 s.
  - 🤖 **Rival race**: a rival pilot flies the course; get round first.
  - 💣 **Minefield dash**: each mine hit adds 3 s; the E.C.M. now clears race mines nearby.

  Best times for each kind are in the Career record (🏁 RACES), and winning all six earns a new medal. There is a
  new 🏁 **Races** tour in the Pilot path.
- **Tours pay 100 Cr the first time** you finish each one, into your own game (not again, and not for a new
  commander, who keeps the record of finished tours).
- **Abandoning a mission** you have just taken puts it back on the station's board (same station, same day).
- **No more docking advice just after launch:** "match the station's spin", "slow down to dock" and station
  control's "Approach granted" now wait until you are heading back towards the station. On touch screens the tip
  says "tap MATCH SPIN".
- Tests: new `races` suite (all six kinds flown, penalties, bonuses, rival, E.C.M., best times, medal, board,
  1,200 maths-gate questions re-solved); gameplay checks for abandon and the launch tips; tours checks for the
  prize. The transitions test no longer trips the game's slow-3D fallback.

## starlane-v25 — 18 November 2026
Training, part 3: **new tours and three paths.**
- **7 new tours** (24 in all): 🕹️ Your controls (touch layouts or keys, flight assists), 🧮 Maths puzzles (answer
  one, read the explanation, the Academy and the Navigator’s Cup), ➡️ Fly there (radar card, FLY THERE, STOP),
  🎛️ Cockpit displays (VIEW, the battle display), 🗺️ Adventures (the Adventure Log), 🎨 Your ship and your record
  (paint, Career record and medals, difficulty), ⚠️ Hazards and other galaxies (a real black hole, minefields,
  rock fields, the galactic hyperdrive).
- **Pause → TOURS shows three paths:** 🟢 Beginner (8), 🟡 Pilot (9), 🔴 Expert (7), with ✓ on tours you have
  finished (kept with your commander) and ▶ on the one to do next. "▶ NEXT TOUR" follows the same order.
- Fixed: the station screen's ⏸ MENU button had no name, so the tours could never press it (the "Saving and
  settings" tour said "click MENU" and quietly carried on).
- Tests: the `tours` suite plays all 24 tours on both devices and now fails if a step's button is never found
  (`NOCLICK`); a finished tour is ticked, shown on the page and saved.

## starlane-v24 — 18 November 2026
Training, part 2: **🙋 HAVE A GO.**
- In the tours, Nova now explains a step and then it is **your turn**: the step waits until you do it (press the
  key, tap or click the button, speed up, steer, aim, fire, buy…) and says "✔ WELL DONE".
- What to press glows: the button on screen (on touch screens and in the station), and the key blinks in the
  keyboard picture.
- Stuck? **👀 SHOW ME** lets Nova do that step for you. After about 12 seconds Nova offers it.
- Nova still flies the fiddly bits (the docking corridor, star skimming), and steps with nothing to do just carry on.
- **🙋 HAVE A GO: ON/OFF** on Pause → TOURS. Off, the tours play as before (Nova does everything).
- On your turn the game's own controls work (the side touch controls appear in full screen).
- Tests: the `tours` suite runs the laptop in watch mode and the Fold in HAVE A GO (pressing 👀 SHOW ME at every
  turn: 71 turns), and a player test does real steps: ↓ and → in the market, L, aiming, J, holding W, steering,
  waiting for the hint, 👀 SHOW ME, and tapping BUY 1 on the Fold.

## starlane-v23 — 18 November 2026
Training, part 1 (from the 18 Nov training review): tours and guided flight speak touch.
- **Guided flight on touch screens** now matches the controls you have: 🕹 Simple ("tap FAST", "the joystick on
  the left side"), 🎮 Twin sticks ("push the left stick up") or ✈️ Classic and the in-picture controls ("slide
  SPEED up", "drag on the left of the picture"). It used to describe the old speed slider for everyone. The intro
  and help pages use the same wording.
- **Tours on touch screens** talk about taps and buttons (LAUNCH, BUY 1, JUMP, MAP, HYPER, ECM, MATCH SPIN…),
  never keys or the mouse. A 👆 finger shows which button Nova taps, and a joystick / SPEED / FIRE panel replaces
  the keyboard picture (👆 CONTROLS: ON/OFF). Steps that only make sense with a keyboard or mouse are skipped.
- **Steadier tours:** "aimed" allows about 4° (mouse steering settled 2–3° off), aim steps end if the target is
  already gone, and the ship slows while lining up a pirate, so "Lasers and targets" no longer stalls.
- Tests: new `tours` suite — every tour played to the end on a laptop and a Fold-sized touch screen, no step may
  time out, Nova never mentions keys on touch, the finger and panel show, guided flight wording per layout.

## starlane-v22 — 18 November 2026
From Stuart's review of test mode and the cheat page ("buttons that drop you out to the game").
- **Test-mode code box:** the Cancel button was white on white (the arcade's `.ghost` style); it is now readable.
  A tap outside the box closes it.
- **Test screen, 🌍 PLACES:** choosing a galaxy, a nearby system or a special place no longer throws you back into
  the game. The practice copy moves there and the test screen stays open with "Now docked at …".
- **Buttons that start play are marked ▶** (all scenarios, the adventures, Adventure Log, Academy), with a note
  under them. Every other button keeps you on the test screen.
- **Cheat page:**
  - ✅ Apply now comes back to the cheat page with "✅ Applied", instead of leaving you in the game.
  - Opened from the game (test mode → ⚙ Open the cheat page), ▶ Play and ✅ Apply act on that game tab: Play
    closes the cheat tab and starts the practice copy there; Apply changes the real commander there and keeps the
    cheat page open. No more second copy of the game.
- Tests: new `testmenu` suite (presses all 122 test-screen buttons, real taps on PLACES at Fold size); cheat-tab
  checks in `cheats`; code-box checks in `site`.

## starlane-v21 — 17 November 2026
- **Stronger lock on test mode and the cheat page.**
  - The code is checked by `js/lock.js` with a slow, salted check (PBKDF2-SHA-256, 200,000 rounds, then
    SHA-256) instead of a quick 8-character hash, so guessing it would take far too long for a reasonable code.
  - The tab's "unlocked" marker is now a key only the right code produces; before, it was the check value
    itself, which anyone reading the repo could copy.
  - Stuart's new code is read from `STARLANE_CODE` (his Default environment) by `tools/set_code.py`, which never
    prints it.
  - A browser's developer tools can still get round it; it is a lock for children, not a bank vault.

## starlane-v20 — 17 November 2026
- **Hyperspace shows your own cockpit.** It always drew the plain console. Now:
  - 3D cockpit: the real 3D cockpit, with the tunnel shining through a darkened windscreen across the whole screen;
  - clear view: the tunnel fills the screen;
  - console cockpit, Retro and Original: as before.

  The quick launch and docking animations (when cut-scenes are off) and the escape capsule follow the same rule.
- **Harder 📈 TREND questions.** Every level gets questions about the graph shown:
  - ages 7–12: the three basics (change, mean, range);
  - ages 13–14: the basics plus percentage change, median, average daily change and the biggest day-to-day move;
  - adults: percentage change, median, average daily change, a prediction from that rate, the biggest move, the
    best buy-then-sell profit, and the percentage rise back to the peak.

  Every answer is worked from the graph and explained. Exam practice no longer replaces the graph question with
  an unrelated one.
- Tests: new `trend` suite, which re-solves 480 Trend questions from the graph. A cockpit check covers hyperspace
  in each display on a laptop and the Fold.

## starlane-v19 — 17 November 2026
- **Modern cut-scenes no longer look Retro on the first launch.** The 3D engine (about 0.6 MB) started loading
  only when you first flew. On a phone or Fold over the internet, the first launch cut-scene began before it was
  ready, so it was drawn flat. Now the engine loads as soon as the game opens in Modern style, and a launch or
  docking cut-scene waits (up to 6 s, showing "PREPARING 3D…") until it is ready. A device that can't do 3D still
  gets the flat version.
- FLY THERE to a moving ship now catches up and stops about 1 km away. Before, it matched the ship's speed and
  followed it forever without arriving.
- New check in the `cockpit` suite: the first launch on a slow connection (the 3D file delayed 4 s, offline cache
  off) has no flat frames.

## starlane-v18 — 17 November 2026
- **➡️ Fly to target.**
  - One tap on a radar icon shows what it is (the ship no longer turns by itself). The card has 🎯 TURN TO and
    ➡️ FLY THERE, or you can tap the same icon again.
  - The ship turns, flies, uses the jump drive for long trips, slows down and stops: about 1 km from a ship and
    a few km above a planet or moon.
  - At the station it flies round to the slot, levels with it and matches its spin. On Easy it takes you in and
    docks; on Normal and Hard it stops lined up for you to fly in.
  - 🛑 STOP, steering, or coming under attack hands control back.
  - Not offered in adventures or station races, or for black holes and missiles.
  - It is a flight assist: on for touch screens, off for mouse and keyboard (switch it in Flight assists).
- **🎛 VIEW (F4)** steps through the Modern displays: 3D cockpit, console cockpit, clear view (the battle display
  layout). Phones skip the 3D cockpit, and from Retro or Original VIEW switches to Modern. It is on the console,
  in the 3D cockpit's switch panel, and as a 🎛 VIEW button in the clear view.
- **Simpler console on phones:** six big switches (⚡ JUMP, 🛬 DOCK, 🌌 HYPER, 🗺 MAP, 📋 MISN, ⋯ MORE). MORE opens
  a strip with the rest and closes after a choice. Four big readouts: shields, energy, fuel and speed.
- FLY THERE steers round rocks, the station, moons and the planet, and hands back control if it bumps anything.
  The first version flew into the station on the way to the planet. Rock bumps no longer count as "under attack".
- Any button under Nova's subtitle box now takes the tap (🛑 STOP was hidden there). STOP sits low in the view.
- Two chance-dependent cheat-page tests were made reliable.
- Tests: new `flyto` suite. The adventures suite checks FLY THERE is never offered in any scene and cycles VIEW in
  every flight scene. The transitions walk now includes F4 and FLY THERE with Pause and STOP on every screen size.

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
