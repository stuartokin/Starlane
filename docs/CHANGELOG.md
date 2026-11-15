# Starlane Trader — changelog

The release number is the offline cache name `CACHE` in `sw.js` (bump it on every release).

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
