/* Starlane cheat page: builds the form from js/cheats-def.js, saves on this device as you go,
   and hands over to the game with ./?cheats=play (practice copy) or ./?cheats=apply (real commander).
   Locked with the same test code as the game's test mode (only its FNV-1a check value is here). */
(function(){
const D = window.STARLANE_CHEAT_DEFS, $ = id => document.getElementById(id);
const CHECK = '6f8f905c', OK_KEY = 'starlane-cheats-ok';
const fnv = s => { let h = 0x811c9dc5; for (const ch of new TextEncoder().encode('starlane|' + s)) { h ^= ch; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const RULES = D.rules.flatMap(g => g.items), CMDS = D.cmd.flatMap(g => g.items);
const blankCmd = () => { const c = {}; for (const i of CMDS) c[i.k] = i.type === 'bool' ? false : i.type === 'multi' ? [] : ''; return c; };
let st = {name:'', rules:D.defaults(), form:blankCmd()};

function toast(m){ const t = $('chToast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); }

// the commander changes in the shape the game expects (see cheatCmd in js/starlane.js)
function toGame(f){ const o = {};
 for (const k of ['credits','legal','killPts','missiles','starburst','cap']) if (f[k] !== '' && f[k] != null && isFinite(+f[k])) o[k] = +f[k];
 for (const k of ['ship','front','difficulty']) if (f[k]) o[k] = f[k];
 for (const k of ['maths','cuts','rear']) if (f[k] === 'true' || f[k] === 'false') o[k] = f[k] === 'true';
 for (const k of ['fillFuel','repair','advReset','bigCargo','personal']) if (f[k]) o[k] = true;
 if (f.setEquip) o.equip = (f.equip || []).slice();
 return o; }
const diffRules = r => Object.fromEntries(Object.entries(r).filter(([k, v]) => { const d = RULES.find(i => i.k === k); return d && v !== d.def; }));
const cmdChanges = f => Object.keys(toGame(f)).length;

function save(){ try { localStorage.setItem(D.KEY, JSON.stringify({v:D.VERSION, name:st.name, rules:st.rules, cmd:toGame(st.form), form:st.form, saved:new Date().toISOString()})); } catch(e) { toast('Could not save on this device'); } count(); }
function load(){ try { const s = JSON.parse(localStorage.getItem(D.KEY) || 'null'); if (s && s.rules) { st.name = s.name || ''; st.rules = Object.assign(D.defaults(), s.rules); st.form = Object.assign(blankCmd(), s.form || {}); } } catch(e) {} }
function count(){ const r = Object.keys(diffRules(st.rules)).length, c = cmdChanges(st.form);
 $('chCount').innerHTML = r || c ? `<b>${r}</b> rule${r === 1 ? '' : 's'} changed from normal · <b>${c}</b> commander change${c === 1 ? '' : 's'} · saved on this device` : 'Everything is as in the normal game.';
 document.querySelectorAll('.ch-group').forEach(g => { const n = [...g.querySelectorAll('.ch-row.on')].length; g.querySelector('.ch-n').textContent = n ? `${n} changed` : ''; }); }

const show = (i, v) => i.type === 'bool' ? (v ? 'On' : 'Off') : (i.zero && +v === 0 ? i.zero : `${v}${i.unit || ''}`);
function rowRule(i){ const v = st.rules[i.k], id = 'r_' + i.k, on = v !== i.def;
 if (i.type === 'bool') return `<div class="ch-row${on ? ' on' : ''}" data-k="${i.k}"><label class="ch-l" for="${id}">${esc(i.label)}</label><input type="checkbox" id="${id}" ${v ? 'checked' : ''}><span class="ch-hint">Normal: ${show(i, i.def)}</span></div>`;
 return `<div class="ch-row range${on ? ' on' : ''}" data-k="${i.k}"><label class="ch-l" for="${id}">${esc(i.label)}</label><span class="ch-val" id="${id}_v">${esc(show(i, v))}</span><input type="range" id="${id}" min="${i.min}" max="${i.max}" step="${i.step}" value="${v}"><span class="ch-hint">Normal: ${esc(show(i, i.def))}</span></div>`; }
function rowCmd(i){ const v = st.form[i.k], id = 'c_' + i.k, set = i.type === 'bool' ? !!v : i.type === 'multi' ? false : v !== '';
 if (i.type === 'bool') return `<div class="ch-row${set ? ' on' : ''}" data-c="${i.k}"><label class="ch-l" for="${id}">${esc(i.label)}</label><input type="checkbox" id="${id}" ${v ? 'checked' : ''}></div>`;
 if (i.type === 'select') return `<div class="ch-row${set ? ' on' : ''}" data-c="${i.k}"><label class="ch-l" for="${id}">${esc(i.label)}</label><select id="${id}">${i.options.map(([val, l]) => `<option value="${esc(val)}" ${String(v) === val ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
 if (i.type === 'number') return `<div class="ch-row${set ? ' on' : ''}" data-c="${i.k}"><label class="ch-l" for="${id}">${esc(i.label)}</label><input type="number" id="${id}" min="${i.min}" max="${i.max}" placeholder="${esc(i.placeholder || '')}" value="${esc(v)}" inputmode="numeric"></div>`;
 return `<div class="ch-row" data-c="${i.k}"><span class="ch-l">${esc(i.label)}</span><div class="ch-multi${st.form.setEquip ? '' : ' off'}" id="${id}">${i.options.map(([val, l]) => `<label><input type="checkbox" value="${val}" ${(v || []).includes(val) ? 'checked' : ''}> ${esc(l)}</label>`).join('')}</div></div>`; }

function build(){ const f = $('chForm');
 f.innerHTML = D.rules.map((g, n) => `<details class="ch-card ch-group" ${n < 4 ? 'open' : ''}><summary>${esc(g.group)}<span class="ch-n"></span></summary><div class="ch-rows">${g.items.map(rowRule).join('')}</div></details>`).join('')
  + D.cmd.map(g => `<details class="ch-card ch-group" open><summary>${esc(g.group)} <span class="ch-n"></span></summary><div class="ch-rows">${g.items.map(rowCmd).join('')}</div></details>`).join('');
 $('chName').value = st.name;
 f.querySelectorAll('[data-k]').forEach(row => { const i = RULES.find(x => x.k === row.dataset.k), inp = row.querySelector('input');
  inp.addEventListener('input', () => { st.rules[i.k] = i.type === 'bool' ? inp.checked : +inp.value; row.classList.toggle('on', st.rules[i.k] !== i.def); const vv = $('r_' + i.k + '_v'); if (vv) vv.textContent = show(i, st.rules[i.k]); save(); }); });
 f.querySelectorAll('[data-c]').forEach(row => { const i = CMDS.find(x => x.k === row.dataset.c);
  if (i.type === 'multi') { row.querySelectorAll('input').forEach(b => b.addEventListener('change', () => { st.form.equip = [...row.querySelectorAll('input:checked')].map(x => x.value); save(); })); return; }
  const inp = row.querySelector('input,select');
  inp.addEventListener(i.type === 'number' ? 'input' : 'change', () => { st.form[i.k] = i.type === 'bool' ? inp.checked : inp.value; row.classList.toggle('on', i.type === 'bool' ? inp.checked : inp.value !== '');
   if (i.k === 'setEquip') $('c_equip').classList.toggle('off', !inp.checked); save(); }); });
 count(); }

function preset([id, label, rules, cmd]){ st.rules = Object.assign(D.defaults(), rules); st.form = Object.assign(blankCmd(), cmd); if (id !== 'normal') st.name = label.replace(/^\S+\s/, ''); else st.name = ''; build(); save(); toast(`${label} — saved on this device`); }

// share: the settings travel in the link (#s=…), nothing is sent anywhere
const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
function linkFromHash(){ const m = location.hash.match(/[#&]s=([\w-]+)/); if (!m) return false;
 try { const s = JSON.parse(unb64(m[1])); st.name = s.name || ''; st.rules = Object.assign(D.defaults(), s.rules || {}); st.form = Object.assign(blankCmd(), s.form || {}); history.replaceState(null, '', location.pathname); return true; } catch(e) { return false; } }
async function copyLink(){ const url = location.origin + location.pathname + '#s=' + b64(JSON.stringify({name:st.name, rules:diffRules(st.rules), form:st.form}));
 try { await navigator.clipboard.writeText(url); toast('Link copied — open it on another device to load these settings'); } catch(e) { window.prompt('Copy this link:', url); } }

function unlocked(){ $('chLock').hidden = true; $('chMain').hidden = false; $('chBar').hidden = false;
 load(); const fromLink = linkFromHash(); build(); if (fromLink) { save(); toast('Settings loaded from the link and saved on this device'); }
 $('chPresets').innerHTML = D.presets.map((p, n) => `<button type="button" data-p="${n}">${esc(p[1])}</button>`).join('');
 $('chPresets').querySelectorAll('button').forEach(b => b.onclick = () => preset(D.presets[+b.dataset.p]));
 $('chName').addEventListener('input', () => { st.name = $('chName').value.trim().slice(0, 40); save(); });
 $('chPlay').onclick = () => { save(); location.href = './?cheats=play'; };
 $('chApply').onclick = () => { save(); if (confirm('Apply these settings to the real commander saved on this device?\n\nCommander changes (credits, ship, equipment…) are made now. The rules stay on until you remove them (test mode → ✨ CHEATS → 🧹 Remove custom rules).')) location.href = './?cheats=apply'; };
 $('chLink').onclick = copyLink;
 $('chReset').onclick = () => { if (confirm('Put every setting back to the normal game?')) preset(D.presets[0]); }; }

window.addEventListener('DOMContentLoaded', () => {
 let ok = false; try { ok = sessionStorage.getItem(OK_KEY) === CHECK; } catch(e) {}
 if (ok) { unlocked(); return; }
 $('chLockForm').addEventListener('submit', e => { e.preventDefault();
  if (fnv($('chCode').value.trim()) === CHECK) { try { sessionStorage.setItem(OK_KEY, CHECK); } catch(e) {} unlocked(); }
  else { $('chLockMsg').textContent = 'Not quite — try again.'; $('chCode').select(); } });
 $('chCode').focus(); });
window.StarlaneCheatPage = {get state(){ return st; }, save, toGame, unlocked};
})();
