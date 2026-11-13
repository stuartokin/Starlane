# Starlane Trader

**Fly, trade, explore… and learn.**

Command your own starship across a galaxy of worlds: trade between planets, take on missions, battle pirates, meet strange civilisations and solve the maths, science and logic puzzles hidden among the stars, with your ship’s computer Nova by your side.

Play it at **https://stuartokin.github.io/Starlane/** — on laptops, tablets and phones (keyboard, mouse, gamepad or touch).

## Highlights
- Three looks: Modern 3D, Original wireframe and Retro.
- Trading, missions, combat, upgrades, a paint shop and a 3D star map.
- 50 adventures (in the ship and out in space) built around maths, science and logic.
- Five factions to meet, from peaceful explorers to crystalline aliens.
- Flight assists for touch screens, training tours with Nova, and two built-in videos (trailer and a 2-minute tour).
- Maths questions matched to the pilot’s age (7–8, 9–10, 11–12, 13–14).

## How it fits with the host maths app
The game files (`js/starlane*.js`) are the same as the version inside the maths app it can be opened from. This site supplies its own small host (`js/site.js`): saving (its own storage name, separate from the host maths app), the pilot profile, the built-in question pack (`js/questions-pack.js`) and test mode.

Maths questions come through a single socket, `window.StarlaneQuestions`. Here it uses the built-in pack; a host maths app can answer it from its exam-specific question banks.

## Test mode
Press **Ctrl+Shift+G** during play (or triple-tap the score at the top on a touch screen) and enter the test code. Test mode is a practice copy: leaving it returns you to exactly where you were.

## Files
- `index.html` — launch screen and pilot registration
- `js/site.js` — standalone host (saving, profile, question socket, test-mode code)
- `js/questions-pack.js` — built-in question pack by age band
- `js/starlane.js`, `js/starlane-modern.js`, `js/starlane-adventures.js`, `js/starlane-audio.js` — the game (shared with the host maths app)
- `js/arcade.js`, `js/retro.js`, `js/games.js`, `js/speech.js`, `js/voices.js` — the game host and audio/voice (shared with the host maths app)
- `js/vendor/three-bundle.js` — 3D library (see `three-LICENSE.txt`)
- `sw.js`, `manifest.webmanifest`, `icons/` — offline support and install
