# Starlane Trader — changelog

The release number is the offline cache name `CACHE` in `sw.js` (bump it on every release).

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
