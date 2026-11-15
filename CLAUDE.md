# CLAUDE.md — read this first

This repo is **Starlane Trader**, a space trading and exploration game in the spirit of *Elite* (1984), with
maths, science and logic woven in. It runs as its own public site and is also opened from inside the
**ApolloMaths** learning app. Owner: Stuart Okin (GitHub `stuartokin`).

Before changing anything, read in this order:

1. **`docs/KNOWLEDGE.md`** — what the game is, how every part works, how ApolloMaths connects to it.
2. **`docs/LESSONS.md`** — what went wrong before and how to avoid it (please read; it saves hours).
3. **`docs/ROADMAP.md`** — what Stuart wants next, written as specifications, and the automated workflows.
4. **`tests/README.md`** — the test rig. Run it before and after every change.

## The essentials

- Live site: https://stuartokin.github.io/Starlane/ · repo `stuartokin/Starlane` (public, GitHub Pages, `main`).
- Host app: https://stuartokin.github.io/ApolloMaths/ · repo `stuartokin/ApolloMaths` (public). Both sites share
  the origin `stuartokin.github.io`, which is what lets them call each other directly (see KNOWLEDGE §6).
- Plain static site: no build step, no framework, no server. Everything is hand-written JS loaded by
  `index.html`. Three.js is vendored in `js/vendor/three-bundle.js` for the Modern 3D style.
- **The game itself is `js/starlane*.js`.** `js/site.js` is this site's host. `js/arcade.js` is the game shell
  and has **deliberately diverged** from ApolloMaths' `arcade.js` — never copy one over the other.

## Rules for working here

- **Never commit secrets.** The repo is public. The test-mode code is held by Stuart; only a check value
  (FNV-1a hash) is in `site.js`. Tests read it from `STARLANE_CODE`. API keys live only in GitHub secrets.
- **Bump `CACHE` in `sw.js`** (`starlane-vN`) on every release, or players' devices keep the old files.
- **Keep the debug hooks** on `Arcade._game()._dbg` working — tests and the automated workflows use them.
- **Run the rig**: `python tests/run_all.py` (about 6 minutes). Everything must pass before shipping.
- **No “Apollo” shown to players.** Questions from ApolloMaths are personalised to each child; standalone
  pilots see their own name. Only Moon-landing history (Apollo 11) may mention Apollo. `test_static` checks it.
- Children use this. Keep content age-appropriate, accurate, and kind; explain every answer.

## How Stuart likes work delivered

- Plan first for anything major; he responds well to a short list of thoughts before code.
- Push straight to `main` yourself (see the working standard below), after bumping `CACHE` in `sw.js`.
  No zips; delete removed files in the same commit.
- Say briefly what changed and give a short numbered list of things to try. Direct, concise, no padding.

<!-- STANDARD:BEGIN v1 — the same block is in every one of Stuart's repos. Master copy:
     stuartokin/stuartokin.github.io docs/STANDARDS.md. Change it there, then everywhere. -->
## Working standard (all of Stuart's repos)

**Stuart** owns this. British English; short, plain replies. He does not read or edit code:
you make every change, test it, push it, and tell him what to check. Plan first for big
things; when he says "go ahead", build without further proofs.

**Personal capacity.** Never name his employer or job title anywhere: pages, docs, commit
messages, articles. Byline: *Stuart Okin*. Where a disclaimer is needed: *"Written in a
personal capacity and do not represent the position of any organisation I am engaged with."*
Citing an organisation as a source is fine.

**Delivering changes.** Commit and push straight to `main` yourself. Don't send zips or ask
him to upload; older instructions in this repo that say so are superseded. Before anything
major (deleting or restructuring, rewriting a core file, changing workflows or agents,
migrating data) push a backup tag first:
`git tag backup/YYYY-MM-DD-<what> origin/main && git push origin backup/YYYY-MM-DD-<what>`.
To undo, reset `main` to that tag; say in your reply that a backup exists. Never commit
secrets: keys live only in GitHub secrets.

**Tests.** Run the repo's tests before every push; all must pass. Fix a bug, add a check so
it stays fixed. If the repo has no tests yet, add at least a smoke test the next time you
change it.

**Automation.** Any workflow that runs on its own (schedule, issues, comments, other
workflows) must start with the kill-switch `switch` job, reading `automation.json` here and
the master in stuartokin.github.io (see its docs/KNOWLEDGE-BASE.md §15). Don't add an AI
agent without saying what it costs, what it can change and how to switch it off.

**"Wrap up".** When Stuart says "wrap up", and before you finish any session that changed
something:
1. Run the tests; fix or report any failure.
2. Update the docs: how the app works (knowledge base or handover), `LESSONS` (what went
   wrong or surprised you), `ROADMAP` (done, next, open questions for Stuart, decisions with
   dates) and `CHANGELOG` (bump the version if the app changed). Create them if missing.
3. If a lesson would help the other repos, add it to `docs/SHARED-LESSONS.md` in
   stuartokin.github.io.
4. Commit and push to `main` (backup tag first if major). Check the deploy or workflow run.
5. Reply with what changed, the version, what was and wasn't tested, a short numbered list of
   things for Stuart to try, and anything waiting on him.

A new session must be able to carry on from the repo alone. If it couldn't, the wrap-up
isn't done.
<!-- STANDARD:END -->
