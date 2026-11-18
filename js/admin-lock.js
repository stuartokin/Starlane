/* Starlane Trader — the lock on the grown-ups' question-bank page (banks.html), since v29.
   Two kinds of password:
   - the STARTER password, which Stuart gives out. Only a check value is stored here: CHECK = SHA-256(K) with
     K = PBKDF2-SHA-256(password, SALT, ITER). Set it with  STARLANE_ADMIN_CODE=… python3 tools/set_admin_code.py
   - a family's OWN password, which they may set on a device. It is kept only on that device (localStorage), as a
     random salt and the same kind of check value. Once set, only it opens the page on that device.
   "Forgot your password?" takes the starter password, removes the device's own password and switches every pilot
   on the device back to the built-in questions (their banks are kept but switched off).
   The tab remembers being unlocked with the derived key, which only the right password produces. */
window.StarlaneAdmin = (() => {
 const SALT = 'starlane-admin-v1', ITER = 200000, CHECK = 'cecc0704e03afda6a63b142a7b78762b1fd96eddd7ff1d8ee347734f5b7b5f43', DEV = 'starlane-admin-device', TAB = 'starlane-admin-ok';
 const enc = new TextEncoder(), hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
 async function derive(code, salt){ const base = await crypto.subtle.importKey('raw', enc.encode(String(code).trim()), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name: 'PBKDF2', salt: enc.encode(salt), iterations: ITER, hash: 'SHA-256'}, base, 256)); }
 const sha = async k => hex(await crypto.subtle.digest('SHA-256', enc.encode(k)));
 const device = () => { try { const d = JSON.parse(localStorage.getItem(DEV) || 'null'); return d && d.salt && d.check ? d : null; } catch(e) { return null; } };
 const starterSet = () => /^[0-9a-f]{64}$/.test(CHECK);
 async function starterKey(code){ if (!starterSet() || !String(code || '').trim()) return null; const k = await derive(code, SALT); return (await sha(k)) === CHECK ? k : null; }
 // which password opens the page now: 'own' (the device has its own) or 'starter'
 const mode = () => device() ? 'own' : 'starter';
 // the key for a typed password, or null. With an own password set, the starter no longer opens the page.
 async function tryCode(code){ try { const d = device(); if (!String(code || '').trim()) return null;
  if (d) { const k = await derive(code, d.salt); return (await sha(k)) === d.check ? k : null; }
  return await starterKey(code); } catch(e) { return null; } }
 async function okKey(k){ try { if (!/^[0-9a-f]{64}$/.test(k || '')) return false; const d = device(), h = await sha(k); return d ? h === d.check : h === CHECK; } catch(e) { return false; } }
 const remember = k => { try { sessionStorage.setItem(TAB, k); } catch(e) {} };
 const unlockedNow = async () => { let k = null; try { k = sessionStorage.getItem(TAB); } catch(e) {} return okKey(k); };
 const lock = () => { try { sessionStorage.removeItem(TAB); } catch(e) {} };
 // set this device's own password (needs at least 6 characters); returns the new key
 async function setOwn(code){ code = String(code || '').trim(); if (code.length < 6) throw new Error('Use at least 6 characters.');
  const salt = hex(crypto.getRandomValues(new Uint8Array(16))), k = await derive(code, salt);
  localStorage.setItem(DEV, JSON.stringify({salt, check: await sha(k), set: new Date().toISOString()})); remember(k); return k; }
 // forgot: the starter password removes the own password and puts every pilot back on built-in questions
 async function forgot(starter){ const k = await starterKey(starter); if (!k) return false;
  try { localStorage.removeItem(DEV); } catch(e) {}
  try { if (window.StarlaneBanks) StarlaneBanks.resetAllToBuiltIn(); } catch(e) {}
  remember(k); return true; }
 return {tryCode, okKey, remember, unlockedNow, lock, setOwn, forgot, mode, starterSet, SALT, ITER};
})();
