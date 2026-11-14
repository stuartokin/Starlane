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
- **Work through pull requests** (since 14 Nov 2026 the Claude GitHub App has write access to his repos):
  attach the repo to the session with push access, work on a branch named `claude/<short-description>`,
  never push to `main`, and open a pull request with a plain-English summary, what was tested (rig results),
  and a short numbered list of things to try. Stuart reviews and merges on GitHub; Pages then republishes.
- Deletions, `.github/` workflow files and dotfiles go in the pull request like any other change.
- Only if a session cannot get push access: fall back to a zip of changed files with folder structure, and list
  files to delete.
- Direct, concise, no padding; say what was and wasn't tested.
