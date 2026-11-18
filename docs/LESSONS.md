# Lessons learned

Hard-won lessons from building Starlane and its ApolloMaths connection (Oct–Nov 2026). Each one cost real
time once. Read before making changes.

## Working with Stuart

1. **Plan before big changes.** Stuart wants a short list of thoughts or a plan first for anything major, then
   says "go". For small fixes, just do them.
2. **He tests on real devices**: a Galaxy Fold, an iPad/tablet, a laptop and a very large monitor (about 3,000
   CSS pixels wide). Screen recordings are how he reports bugs — extract frames (`ffmpeg -vf fps=2`) and look
   at them carefully; the bug is usually visible in one or two frames.
3. **Deliver only changed files**, zipped with folder structure; say which files to delete; `.github/` files he
   adds by hand. Build the zip by diffing against a fresh clone of the live repo, never from memory.
4. **Bump the offline cache** every release (`CACHE` in `sw.js`), or his devices keep running old code and the
   "bug is still there" report is really a stale cache.
5. **He notices when you over-claim.** Say plainly what was and wasn't tested, and what is still open.

## Testing

6. **Test the way the real site runs.** Serve both repos side by side over http (the rig does this). Opening
   `index.html` as a file hides bridge problems (the bridge needs a web origin) and some loading-order bugs.
7. **Wait for state, not time.** Use `until(js)` rather than fixed sleeps. New commanders get Nova's welcome
   overlay, which pauses the launch cut-scene — a test that "never reaches flight" was this.
8. **Watch for the first split second.** A real bug was choosing a topic in the first moment after load, before
   the layout code had run. Another was a half-second flash of the status screen before a video. The rig now
   samples every 25 ms during start-up of the videos.
9. **Phones and very large screens break differently.** Check for sideways scrolling (`scrollWidth >
   clientWidth`) on phones, and that pop-ups still fit when large screens are scaled up (scale the page content,
   never `html`, or dialogs run off-screen).
10. **Count things, then look at them.** A count of avatar draws proved code ran, but screenshots showed the
    image never appeared (an SVG image has no pixel size until drawn onto a canvas). Do both.
11. **Keep test hooks.** `Arcade._game()._dbg` getters and `*Dbg` functions make tests and automation possible.
    Add a hook rather than poking private state, and never remove one without updating the rig.
12. **The sandbox can be wiped between sessions.** Keep the rig and docs in the repo, not only on a scratch disk.

## Code and architecture

13. **One game, many hosts — talk through sockets.** `StarlaneQuestions` (questions in, answers reported out)
    and `StarlaneHost` (profile, saves, test-mode check, exit) let the same game run standalone or inside
    ApolloMaths. Add capabilities as new optional members with a version number; never make the game import
    host code.
14. **Same origin is a superpower and a trap.** Frames on `stuartokin.github.io` can call each other directly
    (no `postMessage` needed), but it means the two apps share localStorage — use distinct keys
    (`starlane-standalone-v1` vs ApolloMaths' own).
15. **Don't sync files that have diverged.** `arcade.js` differs between the repos by design. Copying
    ApolloMaths' version here would make Starlane try to open itself remotely.
16. **Two functions with the same name in different files silently replace each other** in plain-script sites.
    `readiness()` in two ApolloMaths files caused "undefined%" for weeks. Grep for a name before adding it.
17. **Keyboard events don't reach everything.** The title screen ignored synthetic key presses — it listens
    to the game's fire input or its `tap()`. Use the game's own functions.
18. **Personalise late.** Questions written about "Apollo" leaked into other children's games until the name
    swap was applied at the last step before sending to Starlane. Anything shown to a player passes through
    the personaliser.
19. **Exclusive moments need exclusivity everywhere**: adventures had to stop spawns, mute other chatter, hide
    touch FIRE behind puzzles, and block surprise events. Videos had to set aside the tutorial and stop
    adventures appearing mid-trailer.
20. **Run videos in a sandbox and restore exactly.** Snapshot the real game (`snapReal`) before a trailer and
    restore it after; players must never lose progress to a demo.
21a. **Keep cheats as data with one accessor.** Every tunable number reads `CH(k)` with the normal value in
    `CHD`. The page's list (`cheats-def.js`) is checked against `CHD`, so the two can't drift. Lasting rules live
    with the commander (`C.cheats`), and one-off changes are applied once. That way a parent can set a child's
    game without touching the child's device storage directly.
21b. **The cheat page re-saves its own state when you press Play or Apply.** Tests that seed
    `starlane-cheats-v1` must reload the page before clicking. Also, navigating to the same page with only a new
    `#hash` doesn't reload it.
21c. **Random events make flaky tests.** The hyperspace check failed now and then because of the 3% chance of
    being pulled out of hyperspace by alien raiders. Tests now switch that chance off (`test.ch.interdict=0`)
    rather than retry.
21d. **Game settings changed in test mode used to vanish.** Test mode plays a copy of the commander, and the
    copy held the key settings, so "Reset all keys" seemed not to work. Preferences now carry over on exit
    (`OPT_KEEP`); add new display or control options to that list.
21e. **Clicks in tests: the canvas is 800×600 game units.** Scale clicks by the canvas size ÷ 800, or call the
    button's `fn` from `_dbg.btns`. Arrival ticks (`spawnTick`) also need one frame after changing `safeKm`,
    because `SAFE` updates in the flight loop.
21f. **Two kinds of button.** Buttons on the game canvas live in `btns`; buttons drawn on the wide canvas
    behind it (the whole-screen battle display) live in `G._bdHits` in screen pixels. Tests should look in
    `_dbg.allBtns`, which holds both.
21g. **"It works in the test" isn't "it feels right".** The mouse was tracked across the whole screen (the
    tests passed), but steering hit full turn inside the old 4:3 picture, and the aiming ring was clipped to
    it. To Stuart it looked as if the mouse ignored most of the screen. Check what the player sees and feels
    (his screen recording showed it at once), and scale controls to the area actually shown.
21h. **Show the version.** Stuart can now read it in Pause, on the launch page or on the cheat page. Ask for
    it first when he reports a problem.
21i. **Moving the console moves what hangs off it.** Things were placed relative to the console top (`VH`):
    the laser start points and the start-up "systems check" shade. When the battle display took the console
    away, they were left floating mid-screen. Search for `VH` when changing the layout.

21j. **A key the shell swallows never reaches the browser.** `arcade.js` calls `preventDefault()` on every key
    the game handles, which stopped the dialog's Escape `cancel` event. The game's "P or Esc pauses" had never
    worked, and Escape closed nothing. Handle the keys you promise in the game itself (`escKey()`), and test them
    with real key presses.
21k. **One screen at a time means "back" has to be remembered.** With a single `overlay`, closing anything went
    to the game, so Career opened from Pause closed to the game. Use `openOv`/`closeOv` for screens opened from
    another, and give every Pause sub-page a parent in `MENU_UP`.
21l. **Test where you land, not just that it opens.** The `transitions` suite checks the whole state (mode,
    docked tab, overlay, Pause page, camera, view, style, system) after every step, on every screen size. A test
    that only checks "the chart opened" would never have caught the surprises fixed in v15.
21m. **Modern style is slow in the headless browser** (software WebGL: a few frames a second), so game time
    passes slowly. Wait on game state (`deathT`, `mode`) with `until`, never on wall-clock time.

21n. **Settings chosen per device must be re-checked per device.** `C.opt.device` was set once, when the
    commander was created, so a laptop commander on the Fold kept the laptop's full 3D cockpit, mouse controls
    and touch controls all at once. Device-dependent settings now live per device kind (`devApply`).
21o. **An assist that helps in one place can fight you in another.** The docking assist's corridor test had no
    "approaching" check, so straight after launch it spun the ship and steered it back to the station. Give
    every assist an "is the player actually trying to do this?" test.
21p. **Fixed-position elements have no `offsetParent`.** Use `getClientRects().length` to ask whether something
    is shown.

21q. **A test that moves the ship can end the flight.** The auto-docking check pointed the ship at the station at
    full speed, so on Normal the ship reached it and the next check ran outside flight. After such a step, put
    the ship back in open space and check `mode==='flight'` before going on.
21r. **Cloud sessions can test the ApolloMaths bridge.** ApolloMaths is public: clone it read-only and set
    `APOLLO_ROOT`. Don't skip the bridge suite just because the folder isn't next to Starlane.

21s. **An autopilot meets the real map.** The first FLY THERE to the planet flew straight into the station,
    which orbits on the way, and in an asteroid field it pushed against a rock until the ship was destroyed. Any
    "fly there for me" needs obstacle avoidance and must stop on a bump. Test it in real systems, from several
    sides.
21t. **"Under attack" included bumps.** `underAttack()` counts any hit in the last 10 s, so bumping a rock looked
    like an attack. Pass `collision=true` to `hurt()` for bumps, and decide per feature whether a bump matters.
21u. **Chasing a spinning target needs feed-forward.** Rolling towards the slot's angle with a simple
    proportional term always lagged ~5° behind the station's spin, so the "level within 4°" lock never came. Add
    the spin rate to the command.

21v. **Buttons can hide under the subtitle box.** The 🛑 STOP button sat where Nova's subtitles appear, and the
    tap went to dragging the subtitles. Now any button under the subtitle box wins the tap, and STOP sits low in
    the view. The transitions suite taps STOP for real on every screen size, which is what caught it.
21w. **Local tests hide download time.** The rig serves files from disk, so the 3D engine was always ready by the
    first launch, and the flat (Retro-looking) cut-scene that Stuart saw on his Fold never showed. To test
    first-load behaviour, delay the file with `page.route` and block the service worker (`service_workers='block'`):
    otherwise the offline cache answers and the delay never applies.
21x. **A lock whose "unlocked" marker equals the stored check value isn't a lock.** The cheat page remembered
    "unlocked" by storing the very hash that sat in the public repo, so anyone could copy it. Store something
    only the right code produces (the derived key), check it against the stored hash, and use a slow, salted hash
    (PBKDF2) so short codes can't be guessed in seconds.
21y. **Environment variables load when a session starts.** Stuart added `STARLANE_CODE` mid-session, and the
    running session couldn't see it. Changes to the cloud environment need a new session (or a reconnect).
21w2. **Check what each button does, not just that it draws.** Test mode's PLACES buttons reused `tDock()`,
    which closes every overlay, so each one threw Stuart out of the test screen. A sweep that presses every button
    and records where it leaves you (`testmenu`) found all of them in one run. Mark buttons that leave a screen.
21w3. **Shared CSS classes leak into overlays.** The code box's Cancel used `.ghost`, which the arcade styles as white,
    so it rendered white on white. Scope overlay buttons with an ID selector, and test computed colours.
21w5. **Teach with the controls the player has.** The tours and guided flight were written for a keyboard and the
    old touch slider; after v17 changed touch controls, nothing caught the stale wording. When controls change,
    grep the tutorials, help and intro text, and the `tours` suite now checks touch wording.
21w6. **A tutorial step that can't finish stalls silently.** The lasers tour aimed with the mouse to 2–3°, but
    "aimed" needed under 2.9°, so the ship rammed the pirate and the step waited for an aim that could never come.
    Give steps a way out (target gone ⇒ done) and test every tour to the end.
21w7. **Re-run a lone failure before chasing it, but chase it if it repeats.** On 18 Nov, single checks in display,
    cockpit and transitions failed once in a full run and passed alone (timing under load). The cheats escape-button
    check failed every time: the ship, flung by the emergency escape, crashed during an 11 s wait, which reopened
    the test screen. The fix was in the test (stop the ship, invincible), found by printing overlay and mode.
21w8. **A step that can't fail can't tell you it's broken.** The station's ⏸ MENU was pushed to `btns` with no
    label, so the tours' `click:'MENU$'` never matched. Steps without an `until` just moved on, so "Saving and
    settings" passed every test for months. Now a click step that never clicks logs `NOCLICK`.
21w9. **Never put `//` comments in the middle of a long one-line function.** The game code is written as long
    lines; a `// note` added mid-line silently commented out the rest (`manualTurn is not defined`). Put notes at
    the very end of a line, or on their own line.
21w10. **A flaky check can be the game working as designed.** "Switch to Modern in flight" failed now and then on the
    phone: under test load Modern 3D ran slowly for 8 s, so the game's own fallback switched back to Retro
    ("MODERN 3D WAS TOO SLOW HERE"). The test now sets `G._autoRetro` first.
21w11. **An independent solve catches what the author can't see.** In adventure batch 1 the checker agreed on 79
    of 81 answers; the two it disagreed on were orderings that could fairly go either way (test the wires before
    or after opening the panel). The fix is to reword the puzzle, not to argue about the key.
21w4. **`const` globals aren't on `window`.** `Arcade` is `const Arcade=…`, so another tab can't reach it through
    `opener.Arcade`. Expose what other windows need explicitly (`window.StarlaneGame`).
21z. **A fresh cloud session has no Python Playwright.** `pip install -r tests/requirements.txt` pulls the newest
    Playwright, which wants a newer Chromium than the one pre-installed in `/opt/pw-browsers`. Install the
    version that matches it (the Node one: `node -e "console.log(require('playwright/package.json').version)"`,
    e.g. `pip install playwright==1.63.0`) instead of `playwright install`. Clone ApolloMaths next to the repo
    and set `APOLLO_ROOT` for the bridge suite.
## Content

21. **Children's content must be right.** Every question has a worked explanation; generated questions are
    checked twice (a second independent solve). Wrong answers in a learning game are worse than none.
22. **Write original questions; link to sources.** Never copy exam papers or published questions — link to them
    and write in their style. Same rule for science facts: cite a reliable source.
23. **Difficulty is not just topic.** Random numbers made some questions trivial by accident (ratios like 5:5).
    Generators should reject trivial cases (`qOK` in ApolloMaths) and offer levels.
24. **Never put secrets in a public repo.** The test-mode code is stored only as a hash; API keys only as
    GitHub secrets.

## Automation (from ApolloMaths' exam watch)

25. **Workflows need explicit permission** to open PRs (Settings → Actions → "Allow GitHub Actions to create and
    approve pull requests", read and write permissions). The first run failed silently at that step.
26. **Auto-merge only behind a gate**: the agent's output must pass checks (load, sandbox runs, second solve,
    the test rig) before merging; otherwise leave the PR open for a person.
27. **Sandbox generated code** (`node:vm`, no `require`, time limit) before trusting it.
28. **Scheduled workflows pause after 60 days of repo inactivity**; merges count as activity.
