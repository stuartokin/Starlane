# Starlane roadmap and future requirements

*Stuart Okin — personal project, written in a personal capacity.*
*Requirements as stated by Stuart on 13 November 2026, written up as specifications. R1–R5 not yet built.*
*Status 17 November 2026 (`starlane-v19`): see **Done** below for what was built since, and the open questions for Stuart there.*

Read `KNOWLEDGE.md` and `LESSONS.md` first. Build in the order in §5 — later items depend on earlier ones.

---

## R1. Adult science questions, with sources and background learning

**Stuart's intent:** the next development expands the adult questions beyond maths to **a wider range of
science**, each with **links to its source** and to **background learning**, to really test grown-ups.

**Requirements**
- Subjects (at least): physics, chemistry, biology, astronomy & space, Earth science & climate, the human body,
  technology & computing, and the history of science. Room to add more.
- Each question: question text; four options (one right); a short explanation; **`source`** (a reliable page
  that supports the answer); **`learn`** (one to three links for background reading); subject; difficulty
  (1–3); date added; `by: 'ai'|'human'`.
- Shown in the existing maths-question panel; after answering, the explanation shows "📖 Source" and
  "🎓 Learn more" links that open in a new tab (and pause the game while away).
- Reliable sources only: NASA, ESA, UK Space Agency, Royal Society, Royal Society of Chemistry, Institute of
  Physics, Met Office, NHS, Natural History Museum, BBC Bitesize/Science, Britannica, Khan Academy, major
  universities, peer-reviewed papers. No forums, no content farms.
- Accuracy is paramount (LESSONS 21–22): every question checked by an independent solve **and** against its
  source (see R3).
- Children's levels are unaffected unless Stuart later asks for science there too.

**Suggested format** — new file `js/questions-science.js` (human-curated) plus `js/questions-science-ai.js`
(written only by the workflow), both appending to one registry:

```js
window.SCIENCE_BANK = window.SCIENCE_BANK || [];
SCIENCE_BANK.push({ id:'phy-0001', subject:'physics', level:2,
  q:'Light from the Sun takes about how long to reach Earth?',
  options:['8 minutes','8 seconds','8 hours','8 days'], answer:0,
  explain:'The Sun is about 150 million km away; light travels about 300,000 km per second.',
  source:'https://science.nasa.gov/sun/facts/', learn:['https://www.esa.int/…'], by:'ai', added:'2026-12-01' });
```

The game's question socket gains a science source: for the Adult level, `StarlaneQuestions.get(kind)` returns a
science or maths question according to the pilot's choices (R2). `makeMathQ` already accepts host questions
with `opts/ans/how`; extend the question object with optional `source` and `learn` and draw the links.

## R2. Choosing question types from Pause (adults)

**Stuart's intent:** an adult can go into **Pause** and **select the types of questions** they may be asked.

**Requirements**
- Pause menu → new page **"🧠 Questions"** (visible on the Adult level; later perhaps for all levels).
- Tick boxes for: Maths (mental arithmetic, percentages & money, algebra, powers, probability, problem
  solving) and each science subject from R1; plus a difficulty slider (1–3) and a "mix" option.
- At least one type must stay ticked. Choices are saved with the pilot (`stats.pilot.qtypes`) and apply
  immediately.
- When hosted by ApolloMaths the page is hidden (the child's exam decides).
- Add tests: choosing only "astronomy" yields only astronomy questions; the setting survives a reload.

## R3. Workflow: research science questions and merge them automatically

**Stuart's intent:** a workflow **automatically researches** new adult science questions and **merges them
into the build** without his involvement, clearly AI-maintained (as ApolloMaths' exam watch does).

**Specification** — `.github/workflows/science-watch.yml` running `tools/science-watch/watch.mjs`:
- **Schedule:** weekly (Mondays 06:00 UTC) plus a manual "Run workflow" button. Aim for about 15 new questions
  per run, spread across subjects, favouring subjects with the fewest questions.
- **Research:** Claude with web search drafts questions from reliable sources (R1 list), including recent
  discoveries (e.g. new space missions), each with `source` and `learn` links.
- **Gates — a question is kept only if all pass:**
  1. Schema valid (four distinct options, one answer, explanation, subject, level, https links).
  2. **Independent solve:** a second model call, given only the question and options, picks the same answer.
  3. **Source check:** the source URL loads (HTTP 200) and its text supports the answer (a model reads the
     fetched text and confirms, quoting the supporting sentence in the report).
  4. Not a duplicate (no near-identical question already in the bank).
  5. Age-appropriate and inoffensive (the game is public and children use it).
- **Build gate:** append to `js/questions-science-ai.js`, bump `CACHE` in `sw.js`, run
  `python tests/run_all.py static,site` in the workflow (install Playwright + Chromium). Fail → leave the PR open.
- **Merge:** open a PR labelled **🤖 AI-maintained**, then auto-merge (squash) if all gates passed, and request a
  Pages build. Report saved to `tools/science-watch/reports/YYYY-MM-DD.md` with each question, its source
  quote and the checks it passed.
- **In the game:** AI-added questions show "🤖 Added by AI research on <date> — source linked" in the
  explanation, so it is clearly AI-maintained.
- **Secrets & settings:** `ANTHROPIC_API_KEY` as a Starlane repo secret; Actions read/write permission and
  "Allow GitHub Actions to create and approve pull requests". Spend visible in the Claude Console.
- **Kill switch:** a repo variable `SCIENCE_WATCH_PAUSED=true` makes the workflow exit without changes.

## R4. Workflow: new space adventures every month, with cut-scenes

**Stuart's intent:** about **monthly**, a workflow **develops new space adventures (including cut-scenes)**,
**tests them with the rig**, and **automatically merges** them.

**Prerequisites (build these first, by hand):**
1. **Data-driven adventure files.** Let `starlane-adventures.js` also load extra adventures from
   `js/adventures/*.js` files that push onto `StarAdv.LIST` (listed in `index.html` and `sw.js` — or one
   `js/adventures-ai.js` file the workflow appends to, which is simpler and needs no new script tags).
2. **A `cutscene` scene type** that is pure data, so the AI never writes drawing code:
   `{type:'cutscene', duration:6, camera:'orbit'|'flyby'|'cockpit'|'chase', bodies:[{g:'mars',R:2800,d:9000}],
   ships:[{kind:'trader',path:'arc'}], fx:['fog','sunfx','storm','galaxy'], captions:[[0,'…'],[3,'…']]}`,
   rendered with the existing `SCENES`, `MAPI.bodies`, show cameras (`sView`, `sideCam`) and `fx` kinds.
   Must work in Modern, Original and Retro, skip on any key, and be covered by `test_adventures`.
3. **A fixed menu of building blocks** the AI may use: scene types (story, choose, order, code, flight,
   cutscene), existing `art` names, `setup` names, flight tasks (reach, chase, waypoints), triggers
   (calm, hyper, kill). Document them in this file as they grow.

**Specification** — `.github/workflows/adventure-forge.yml` running `tools/adventure-forge/forge.mjs`:
- **Schedule:** 1st of each month, 06:00 UTC, plus manual runs. Produce **two** adventures per run (quality over
  quantity), on subjects not yet covered (list existing titles/subjects to the model).
- **Writing rules:** original stories; science/maths accurate with an explanation for every question; three
  age levels (`q(young, mid, older)`); 5–9 scenes including at least one `cutscene` and one `flight`; rewards in
  line with existing adventures (300–400 Cr); kind and encouraging tone; a `source` link for any fact.
- **Gates:** schema (the `test_static` checks), every question's answer confirmed by an independent solve,
  facts checked against sources, then the rig: `python tests/run_all.py static,adventures,gameplay`
  (new ids played through at phone and laptop size). Optionally screenshots of every scene
  (`SHOTS=1`) reviewed by a vision model for unreadable text or empty pictures.
- **Merge:** PR labelled **🤖 AI-maintained** with the report and screenshots attached as artifacts;
  auto-merge if every gate passed; bump `CACHE`; request a Pages build. Fail → PR left open with the reason.
- **In the game:** AI-written adventures show a small "🤖" in the test-mode adventure list and on their
  intro card ("A new adventure written by AI — <month>").
- **Kill switch:** `ADVENTURE_FORGE_PAUSED=true`. Cap of 24 AI adventures until Stuart reviews the approach.

## Done

- **15 Nov 2026 — cheat page** (`cheats.html`, `starlane-v6`). Decisions (Stuart, 15 Nov):
  - It is locked with the test-mode code.
  - It can play a practice copy **and** apply settings to the real commander, so a parent can set a child's game.
  - Emergency escape: 4× speed for 5 s, attackers lose you, 60 s wait (all adjustable).
  - Publish straight to `main`.
- **15 Nov 2026 — battle display and fixes** (`starlane-v8`). Decisions (Stuart, 15 Nov):
  - The battle display starts on Automatic, with a one-off tip saying where to change it.
  - Its radar is at the bottom centre; it shows speed, shields, energy, laser heat, missiles, target and escape
    by default.
  - The escape button appears only under attack.
  - "No random attacks" was left as it is (Stuart's mistake, not a bug).
- **15 Nov 2026 — battle display on the whole screen** (`starlane-v9`), as Stuart asked. Modern style only; Retro/Original keep 4:3.
- **15 Nov 2026 — mouse on the whole screen** (`starlane-v10`). Decisions (Stuart): everywhere in flight, not only in the battle display; Capture mouse offered, off by default; cockpit controls keep priority.
- **15 Nov 2026 — aiming over the whole screen; version shown** (`starlane-v11`), from Stuart's screen recording.
- **15 Nov 2026 — cockpit switch panels: status lamps, tidy labels, TIPS obeyed** (`starlane-v13`).
- **15 Nov 2026 — sticky notes moved** to the canopy frame beside the mirror (`starlane-v14`), as Stuart asked.
- **16 Nov 2026 — difficulty levels and transitions** (`starlane-v15`). Decisions (Stuart, 16 Nov):
  - Easy, Normal and Hard as planned; Hard pays 25% more on missions.
  - Easy switches the emergency escape on.
  - Children new to Starlane in ApolloMaths start on Easy.
  - Stuart asked for thorough tests of moving between screens, cut-scenes and displays. That found:
    - Escape didn't work;
    - Career from Pause closed to the game, not to Pause;
    - GAME OVER dropped you on the launch page;
    - adventure offers could replace an open screen;
    - after dock → launch → death you could restart at an older station;
    - Pause → WATCH had no ◀ BACK.

    All are fixed.
- **16 Nov 2026 — cockpit review** (`starlane-v16`), from Stuart's Fold screenshot. Decisions (Stuart, 16 Nov):
  - ApolloMaths does not need a difficulty setting for parents.
  - The rig should test the ApolloMaths bridge from cloud sessions too (read-only clone, `APOLLO_ROOT`).
- **16 Nov 2026 — touch layouts** (`starlane-v17`). Decisions (Stuart, 16 Nov):
  - Offer Simple (auto speed), Twin sticks and Classic, with Simple as the default and a tip for tablets.
  - Auto speed docks you on Easy only.
  - Keep Classic.
  - Phones fly with the battle display always on.
- **Auto speed and Twin sticks:** Stuart says they feel OK (17 Nov). Tuning values are in `AUTO_LV` and
  `autoSpeed`.
- **17 Nov 2026 — fly to target, VIEW, phone console** (`starlane-v18`). Decisions (Stuart, 17 Nov):
  - Simpler phone console with JUMP, DOCK, HYPER, MAP, MISN and MORE.
  - Fly to target: tap once for information, TURN TO / FLY THERE on the card, tap again to fly. It can be
    switched off.
  - VIEW cycles Modern displays only.
  - Check flights and displays thoroughly against missions and adventures (done: `flyto` suite, the adventures
    suite and the transitions walk).
- **17 Nov 2026 — Modern cut-scenes looked Retro on the first launch** (`starlane-v19`), reported by Stuart on
  the Fold. Fixed: the 3D engine loads at start and cut-scenes wait for it. FLY THERE now catches moving ships.
- **17 Nov 2026 — hyperspace cockpit and harder Trend questions** (`starlane-v20`), from Stuart's report.
- **17 Nov 2026 — stronger lock** (`starlane-v21`). Built in one session, finished in a new one that could read
  `STARLANE_CODE`: `tools/set_code.py` set the check value, the full rig passed with the real code, published.
  Stuart now unlocks test mode and the cheat page with his **new** code; the old one no longer works. To change
  the code: update `STARLANE_CODE` on Default, start a new session, say "update the code".
- **18 Nov 2026 — test mode and cheat page review** (`starlane-v22`), from Stuart's Fold screenshot. Decisions
  (Stuart, 18 Nov): fix all six proposals — readable Cancel and tap-outside, PLACES stays on the test screen, ▶ on
  buttons that start play, Apply returns to the cheat page, the cheat tab acts on the game tab that opened it,
  and a test that presses every button.
  - Noted, not changed: Pause → ⚙ BACK TO THE CHEAT PAGE (in a practice copy started from the cheat page) still
    ends test mode and goes to the cheat page in the same tab. The site also runs at `horizonqltd.com/Starlane/`,
    which keeps its own saves and cheat settings, separate from `stuartokin.github.io`.
- **18 Nov 2026 — training review.** Stuart (18 Nov): go ahead in the proposed order: (3) guided flight for Simple,
  (2) device-aware wording and touch display, (6) a `tours` suite — **done in `starlane-v23`**; (1) hands-on "your turn" steps — **done in
  `starlane-v24` (🙋 HAVE A GO)**; next (4) new tours for the gaps and (5) Beginner / Pilot / Expert paths. Open question for
  Stuart: should finishing a tour pay a small credit reward, as guided flight does?
  Original review: All 17 tours were played to the
  end on a laptop and at Fold size (touch): all finish, no errors; facts and prices are current. Findings:
  - Tours are watch-only: Nova does every step, the player never has a go.
  - On touch screens they still show the keyboard and say "Hold R", "press J"; touch players need the buttons
    they actually have (⚡ JUMP, 🌌 HYPER, the joystick, auto speed in 🕹 Simple).
  - Guided flight (the new-pilot tutorial) on touch says "slide the speed slider" and "drag on the left": wrong
    for the default 🕹 Simple layout since v17.
  - A step that times out moves on as if it worked ("Got it!" when the pirate survived).
  - Tours replay keys literally (`tap:['j']`), so a player who rebinds keys sees steps that do nothing.
  - Not covered at all: touch layouts and auto speed; FLY THERE and radar taps; 🎛 VIEW and the battle display;
    the phone console; maths puzzles and the Academy; adventures and the Adventure Log; races and the
    Navigator's Cup; story missions; galactic jump and hazards (black holes, mines, fields); ship exterior and
    paint; Career record and medals; difficulty.
  - No test runs the tours (they were checked by hand on 18 Nov with a throwaway script).
  Proposal: hands-on "your turn" steps reusing each step's `until` check; device-aware wording and a touch-button
  display in place of the keyboard; fix guided flight for Simple; new tours for the gaps, grouped into
  Beginner / Pilot / Expert paths with ticks for finished tours; a `tours` test suite.
- **Cut-scene ideas for Stuart (not built):**
  - an escape-capsule scene (it reuses "DOCKING…" today);
  - a galactic-jump scene (none today);
  - a short arrival flourish as you drop out of hyperspace;
  - a 3D-cockpit version of the quick launch/dock animation (cut-scenes off).
- **Market data:** goods' prices rise and fall almost together, so trend graphs look similar. Varying each
  good's pattern would make the TREND puzzles more interesting (ask Stuart).
- **Not yet checked on Stuart's devices:** how FLY THERE handles in real systems (it steers round rocks, the
  station, moons and the planet); the phone console on a real phone; the cut-scene fix over his connection.
- **Open questions for Stuart:**
  - (Answered 16 Nov: no difficulty setting in ApolloMaths.) Should ApolloMaths let a parent set a child's difficulty? (ApolloMaths would add `difficulty` to
    `StarlaneHost.profile()`; Starlane already reads it.)
  - Should a commander with cheat-page rules applied show a small "⚙ custom rules" badge in the game? (Not added.)
- **Not yet checked on Stuart's own devices** (tested in the rig and in screenshots only): the captured-mouse cursor
  following the mouse (the headless browser can't move a locked pointer), the cockpit lamps and the sticky notes
  at his screen size, and the battle display on the real Fold.
- **Known limits:** the whole-screen battle display and wide 3D cockpit need Modern style and full screen;
  Retro/Original keep the 4:3 picture, and phones start in Retro.
- **Backup tags:** pushing tags (`backup/…`) was refused from the cloud session (HTTP 403); `main` pushes work.
  To undo, reset to an earlier commit (e.g. `eb4ab83` is the version before the cheat page).

## R5. Smaller open items

- **ApolloMaths housekeeping:** delete `js/starlane.js`, `js/starlane-modern.js`, `js/starlane-adventures.js`,
  `js/starlane-audio.js`, `js/vendor/three-bundle.js`, `js/vendor/three-LICENSE.txt` and
  `QA-report-questions-hints-lessons.md` from the ApolloMaths repo (nothing uses them since 2.79).
- **Run the rig in CI** on every push to `main` (`.github/workflows/tests.yml`), so Stuart's uploads are checked.
- Check Nova's voice on Stuart's devices (device speech varies); trailer length (~46 s) is accepted.
- The cockpit sticky notes now sit beside the mirror (Stuart, 15 Nov 2026).
- Consider science questions for children's levels too, once R1–R3 are proven.

## 5. Suggested build order

1. R5 CI workflow for the rig (cheap, protects everything after).
2. R1 science bank format + a hand-checked starter set (~40 questions) + source/learn links in the panel.
3. R2 Pause → Questions page.
4. R3 science-watch workflow (copy ApolloMaths' `exam-watch` structure: report, PR, gates, auto-merge).
5. R4 prerequisites (data-driven adventures, `cutscene` type), then the adventure-forge workflow.

Each step: plan to Stuart first, then build, extend the rig, run it, deliver changed files only.
