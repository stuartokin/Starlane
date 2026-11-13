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
