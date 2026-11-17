/* Starlane Trader — the lock on test mode and the cheat page.
   The code itself is never stored here. Only a check value is: CHECK = SHA-256(K), where
   K = PBKDF2-SHA-256(code, SALT, ITER iterations). Deriving K is deliberately slow, so guessing codes from CHECK
   takes far too long for any reasonable code, and the "unlocked" marker kept for the tab is K itself — which only
   someone who typed the right code can produce (it can't be copied from this file).
   Set or change the code with:  STARLANE_CODE=… python3 tools/set_code.py   (it never prints the code). */
window.StarlaneLock = (() => {
 const SALT = 'starlane-trader-lock-v2', ITER = 200000, CHECK = '__CHECK__', KEY = 'starlane-cheats-ok';
 const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
 async function derive(code){ const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(String(code)), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name: 'PBKDF2', salt: enc.encode(SALT), iterations: ITER, hash: 'SHA-256'}, base, 256)); }
 // true if k is the key that the right code produces
 async function okKey(k){ try { if (typeof k !== 'string' || !/^[0-9a-f]{64}$/.test(k)) return false;
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(k))) === CHECK; } catch(e) { return false; } }
 // the key for a typed code, or null if it is wrong
 async function tryCode(code){ try { const k = await derive(String(code).trim()); return (await okKey(k)) ? k : null; } catch(e) { return null; } }
 return {tryCode, okKey, KEY, SALT, ITER};
})();
