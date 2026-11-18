# Question banks — a guide

Since `starlane-v29`, grown-ups can give each pilot on a device their own questions. This guide is for Stuart
(who gives out the password) and for the grown-ups who use it.

## For Stuart

- **The starter password** is the secret `STARLANE_ADMIN_CODE` on your Default cloud environment. Only a scrambled
  check value is in the public repo (`js/admin-lock.js`); the password itself never is.
- **Giving it out:** send it to the grown-up yourself (it is not shown anywhere in the game).
- **Changing it:** update `STARLANE_ADMIN_CODE` on Default, start a new session, and say "update the admin password".
  The session runs `python3 tools/set_admin_code.py`, runs the tests and publishes. Families who have set their own
  password are not affected; anyone still using the old starter password asks you for the new one.
- **If the password is not set** (`js/admin-lock.js` says `__ADMIN__`), `test_static` fails on purpose, so a release
  can't go out with the page locked to everyone.

## For grown-ups

1. On the Starlane launch page, choose **📚 Question banks (grown-ups)** and enter the admin password from the
   Starlane team.
2. **Set your own password** (recommended). After that, only your password opens the page on this device — the
   starter password stops working here. Forgot it? "Forgot your password?" takes the starter password, removes your
   own password and puts every pilot back on the built-in questions (your banks are kept, switched off).
3. **Add a bank**:
   - **📖 The bank kit** builds a prompt for you: fill in the topic, ages and how many, copy it into Gemini, ChatGPT,
     Claude or another AI, and paste its answer with **📋 Paste text**.
   - **Ages** are the same as the pilots' training levels: Ages 7–8, 9–10, 11–12, 13–14 and Adult. Exam-practice
     pilots use the 11–12 questions (Tiffin, 11+, ISEB) or the 13–14 questions (13+ Common Entrance).
   - Or **📁 Upload a file**, or open a **🔗 link** someone sent you (it adds the bank on that device).
   - Or **✨ Make a bank with Gemini** using your own Gemini API key (kept on this device only; use a key with a
     spending limit). **❓ How do I get a Gemini API key?** under the Generate button links to Google AI Studio
     (aistudio.google.com/apikey), the pricing page and the models page. Every password and key box has a **👁** to
     show what you typed. With **✔ Second opinion** on, Gemini answers every question again without seeing the answers,
     and any question where the two disagree is dropped.
4. Every question is **checked before it is used**: one right answer among different options, an explanation,
   lengths that fit on screen, kind and suitable wording, number puzzles re-solved hundreds of times. Bad questions
   are dropped one by one, and you see why.
5. **👀 Review** shows every question with its answer; remove any with ✕. Reviewing is optional; new banks show
   "🆕 not yet reviewed" until you do.
6. **Pilots on this device:** choose a bank for each pilot, and a mode:
   - **Built-in** — the game's own questions;
   - **Mixed** — about half from the bank, half built-in;
   - **Only this bank** — the bank's questions whenever it has one that fits.

   If the bank has nothing for the pilot's level or the kind of question, the built-in questions are used — a child
   is never stuck. Add pilots on the launch page (**➕ New pilot**); each has their own name, level and saved game.
   The launch page (under the training level) and Pause (GAME tab, bottom left) show **📚 Questions: …** — built-in,
   or the bank's name and mode, or that the bank has none for this pilot's age.
7. **In ApolloMaths**, Starlane always uses the questions for the child's ApolloMaths plan; banks are not used there.

## Where bank questions appear

| Use ("moments") | Question types |
|---|---|
| Quick puzzles (fuel, trade, repair, navigation…) | one answer, number, template |
| Academy and Navigator's Cup | one answer, several answers, number, template |
| Race maths gates | number, template (whole numbers, short questions) |
| Adventure puzzles (a "slot", e.g. `radio/1`) | whatever the slot needs: one, several, number or order |

Adventure slots are listed in the kit (**⬇ Adventure puzzle slots**). Eight slots are tied to the story that follows
(for example, after `lights/2` Nova says the lights were rewired in parallel), so a bank's right answer there must
mention the given word.

## The contract (for people writing banks by hand)

```json
{"starlane_bank": 1, "name": "Times tables", "author": "Mrs Patel", "about": "Practice up to 12 × 12",
 "questions": [
  {"type": "one", "level": "9-10", "moments": ["quick", "academy"], "q": "What is 6 × 7?", "options": ["36", "42", "48"], "answer": 1, "explain": "6 × 7 = 42."},
  {"type": "several", "level": "11-12", "moments": ["academy"], "q": "Select the TWO even numbers.", "options": ["2", "3", "4", "5"], "answer": [0, 2], "explain": "2 and 4 divide by 2."},
  {"type": "number", "level": "7-8", "moments": ["quick", "gates"], "q": "What is 3 + 4?", "answer": 7, "explain": "3 + 4 = 7."},
  {"type": "template", "level": ["9-10", "11-12"], "moments": ["quick", "gates"], "q": "What is {a} × {b}?", "vars": {"a": [2, 12], "b": [2, 12]}, "answer": "a*b", "explain": "{a} × {b} = {answer}."},
  {"type": "order", "level": "13-14", "moments": ["adventure"], "slot": "starmap/1", "q": "Order the planets from the Sun.", "items": ["Mercury", "Venus", "Earth", "Mars"], "explain": "Mercury is closest."}]}
```

Levels (since v30, the pilots' own ages): `7-8`, `9-10`, `11-12`, `13-14`, `adult`, or a list. Exam-practice pilots
take `11-12` (Tiffin, 11+, ISEB) or `13-14` (13+ CE). Banks written before v30 still work: `young` = 7-8 and 9-10,
`mid` = 11-12, `older` = 13-14 (stored banks are converted when loaded). The full rules are at the top of `js/qbank.js`.
