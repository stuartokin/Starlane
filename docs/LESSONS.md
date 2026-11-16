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
