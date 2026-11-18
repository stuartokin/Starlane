/* Starlane Trader — the grown-ups' question-bank page (banks.html), since v29.
   Locked by the admin password (js/admin-lock.js). Sets which bank and mode each pilot on this device uses,
   imports banks (paste, file, link), reviews them, makes them with the grown-up's own Gemini key, and holds the
   bank kit (prompt, example, adventure slots). Everything is stored on this device only. */
(function(){
const $ = id => document.getElementById(id), B = window.StarlaneBanks, A = window.StarlaneAdmin;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
function toast(m){ const t = $('chToast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2800); }
const LV = B.AGE_LABEL;
// how the AI should pitch each age (UK school years)
const PITCH = {'7-8': 'children aged 7–8 (UK Year 3)', '9-10': 'children aged 9–10 (UK Years 4–5)', '11-12': 'children aged 11–12 (UK Years 6–7, up to 11+ and selective-school entrance standard)',
 '13-14': 'children aged 13–14 (UK Years 8–9, up to 13+ Common Entrance standard)', adult: 'a clever adult with no specialist knowledge'};
const TY = {one: 'one answer', several: 'several answers', number: 'number', order: 'order', template: 'number (made fresh each time)'};
const MO = {quick: 'quick puzzles', academy: 'Academy and Cup', gates: 'race maths gates', adventure: 'adventure puzzles'};
const SLOTS = (() => { try { return B.slots(); } catch(e) { return {}; } })();

// ---- pilots on this device (the game's launch page keeps the list; the first pilot uses the original storage) ----
const KEY = 'starlane-standalone-v1', PKEY = 'starlane-pilots-v1';
const BAND = {'7-8': 'Ages 7–8', '9-10': 'Ages 9–10', '11-12': 'Ages 11–12', '13-14': 'Ages 13–14', adult: 'Adult',
 'x-tiffin1': 'Exam practice: Tiffin 1 (ages 11–12 questions)', 'x-tiffin2': 'Exam practice: Tiffin 2 (ages 11–12 questions)', 'x-grammar11': 'Exam practice: 11+ (ages 11–12 questions)',
 'x-iseb': 'Exam practice: ISEB (ages 11–12 questions)', 'x-ce13': 'Exam practice: 13+ CE (ages 13–14 questions)'};
const pkey = id => id === 'p1' ? KEY : KEY + ':' + id;
function pilots(){ let P = null; try { P = JSON.parse(localStorage.getItem(PKEY) || 'null'); } catch(e) {}
 const list = P && Array.isArray(P.list) && P.list.length ? P.list : [{id: 'p1', name: ''}];
 return list.map(p => { let pr = null; try { pr = (JSON.parse(localStorage.getItem(pkey(p.id)) || 'null') || {}).pilot; } catch(e) {}
  const band = BAND[pr && pr.band] ? pr.band : '11-12'; return {id: p.id, name: (pr && pr.name) || p.name || 'Pilot', band: BAND[band], level: B.ageOfBand(band)}; }); }

// ---- lock ----
function lockUI(){ const own = A.mode() === 'own';
 $('bkLockHelp').textContent = own ? 'Enter the password you set for this device.' : 'This is not the game’s test code. To get an admin password, ask the Starlane team.';
 $('bkForgotP').hidden = !own; }
async function unlock(code){ $('bkLockMsg').textContent = 'Checking…'; const k = await A.tryCode(code);
 if (!k) { $('bkLockMsg').textContent = A.mode() === 'own' ? 'Not quite. (After you set your own password, the starter password no longer opens this page.)' : 'Not quite — try again.'; $('bkCode').select(); return; }
 A.remember(k); $('bkLockMsg').textContent = ''; opened(); }
function opened(){ $('bkLock').hidden = true; $('bkMain').hidden = false; drawAll(); linkImport(); }
async function forgot(e){ e.preventDefault(); const code = prompt('Forgot your password?\n\nEnter the STARTER password from the Starlane team. This removes the password set on this device and switches every pilot back to the built-in questions (your banks are kept, switched off).');
 if (!code) return; $('bkLockMsg').textContent = 'Checking…';
 if (await A.forgot(code)) { toast('Your own password was removed. Every pilot is back on the built-in questions.'); lockUI(); opened(); }
 else $('bkLockMsg').textContent = 'That is not the starter password.'; }

// ---- your password ----
function drawPw(){ const own = A.mode() === 'own';
 $('bkPwText').textContent = own ? 'Your own password is set on this device. Only it opens this page here. You can change it below.' :
  'You are using the starter password from the Starlane team. Set your own so that only you can open this page on this device (the starter password will then stop working here).';
 $('bkPwSet').textContent = own ? 'Change my password' : 'Set my own password'; }
async function setPw(){ const a = $('bkPw1').value, b = $('bkPw2').value, m = $('bkPwMsg');
 if (a !== b) { m.textContent = 'The two passwords are different.'; m.className = 'msg bad'; return; }
 try { await A.setOwn(a); m.textContent = '✔ Saved. From now on, only this password opens this page on this device.'; m.className = 'msg good'; $('bkPw1').value = $('bkPw2').value = ''; drawPw(); }
 catch(e) { m.textContent = e.message; m.className = 'msg bad'; } }

// ---- pilots ----
function drawPilots(){ const banks = B.list(), box = $('bkPilots');
 box.innerHTML = pilots().map(p => { const s = B.pilotSetting(p.id);
  return `<div class="pilot" data-pid="${esc(p.id)}"><div><b>${esc(p.name)}</b><div class="meta">${esc(p.band)}</div></div>
   <select data-bank aria-label="Bank for ${esc(p.name)}"><option value="">— no bank (built-in questions) —</option>${banks.map(b => `<option value="${esc(b.id)}" ${s.bank === b.id ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select>
   <div class="seg" role="group" aria-label="Mode">${[['builtin', 'Built-in'], ['mixed', 'Mixed'], ['only', 'Only this bank']].map(([k, l]) => `<button type="button" data-mode="${k}" class="${(s.bank ? s.mode : 'builtin') === k ? 'on' : ''}">${l}</button>`).join('')}</div>
   <div class="meta">${s.bank && s.mode !== 'builtin' ? (lvCount(B.getBank(s.bank), p.level) ? `${lvCount(B.getBank(s.bank), p.level)} questions for ${LV[p.level]}` : `⚠ no questions for ${LV[p.level]} — built-in will be used`) : ''}</div></div>`; }).join('');
 box.querySelectorAll('.pilot').forEach(row => { const pid = row.dataset.pid, sel = row.querySelector('[data-bank]');
  sel.onchange = () => { const cur = B.pilotSetting(pid); B.setPilot(pid, sel.value, sel.value ? (cur.mode === 'builtin' ? 'mixed' : cur.mode) : 'builtin'); drawPilots(); toast('Saved'); };
  row.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { if (!sel.value && b.dataset.mode !== 'builtin') { toast('Choose a bank first'); return; } B.setPilot(pid, sel.value, b.dataset.mode); drawPilots(); toast('Saved'); }); }); }
const lvCount = (b, lv) => b ? b.questions.filter(q => q.level.includes(lv)).length : 0;

// ---- banks ----
const summary = b => { const lv = [...new Set(b.questions.flatMap(q => q.level))], ty = [...new Set(b.questions.map(q => q.type))], mo = [...new Set(b.questions.flatMap(q => q.moments))];
 return `${b.questions.length} question${b.questions.length === 1 ? '' : 's'} · ${lv.map(l => LV[l]).join(', ')} · ${ty.map(t => TY[t]).join(', ')} · for ${mo.map(m => MO[m]).join(', ')} · ${b.source === 'gemini' ? 'made with Gemini' : 'imported'} ${new Date(b.added).toLocaleDateString('en-GB')}${b.second ? ` · second opinion: ${b.second.agreed} agreed, ${b.second.dropped} dropped` : ''}${b.author ? ` · by ${esc(b.author)}` : ''}`; };
function drawList(){ const L = B.list(), box = $('bkList');
 if (!L.length) { box.innerHTML = '<p class="note">No banks yet. Add one below, or make one with Gemini.</p>'; return; }
 box.innerHTML = L.map(b => `<div class="bank" data-id="${esc(b.id)}"><div class="grow"><b>${esc(b.name)}</b>${b.reviewed ? '<span class="tag ok">reviewed</span>' : '<span class="tag new">🆕 not yet reviewed</span>'}<div class="meta">${summary(b)}</div></div>
  <div class="acts"><button data-a="review" type="button">👀 Review</button><button data-a="rename" type="button">✏️ Rename</button><button data-a="export" type="button">⬇ Export</button><button data-a="link" type="button">🔗 Copy link</button><button data-a="delete" type="button">🗑 Delete</button></div></div>`).join('');
 box.querySelectorAll('.bank').forEach(row => row.querySelectorAll('[data-a]').forEach(btn => btn.onclick = () => act(btn.dataset.a, row.dataset.id))); }
async function act(a, id){ const b = B.getBank(id); if (!b) return;
 if (a === 'review') review(id);
 if (a === 'rename') { const n = (prompt('New name for this bank?', b.name) || '').trim(); if (n) { B.updateBank(id, x => { x.name = n.slice(0, 60); }); drawAll(); } }
 if (a === 'delete' && confirm(`Delete “${b.name}”? Pilots using it go back to the built-in questions.`)) { B.removeBank(id); drawAll(); toast('Deleted'); }
 if (a === 'export') { const blob = new Blob([JSON.stringify(plain(b), null, 1)], {type: 'application/json'}), u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = b.name.replace(/[^\w-]+/g, '_') + '.json'; l.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); }
 if (a === 'link') { const url = location.origin + location.pathname + '#bank=' + await pack(plain(b)); try { await navigator.clipboard.writeText(url); toast('Link copied — open it on another device (as a grown-up) to add this bank'); } catch(e) { prompt('Copy this link:', url); } } }
const plain = b => ({starlane_bank: 1, name: b.name, author: b.author || '', about: b.about || '', questions: b.questions});

// ---- review ----
function review(id){ const b = B.getBank(id); $('rvTitle').textContent = '👀 ' + b.name;
 const ans = q => q.type === 'one' ? q.options.map((o, i) => i === q.answer ? `<span class="ans">✔ ${esc(o)}</span>` : esc(o)).join(' · ') :
  q.type === 'several' ? q.options.map((o, i) => q.answer.includes(i) ? `<span class="ans">✔ ${esc(o)}</span>` : esc(o)).join(' · ') :
  q.type === 'number' ? `<span class="ans">✔ ${esc(q.answer)}${q.margin ? ' ± ' + esc(q.margin) : ''} ${esc(q.unit || '')}</span>` :
  q.type === 'order' ? q.items.map((t, i) => `${i + 1}. ${esc(t)}`).join(' → ') : `<span class="ans">formula ${esc(q.answer)}</span> · e.g. ${esc((() => { try { const t = B.makeTemplate(q); return t.q + ' → ' + t.answer; } catch(e) { return ''; } })())}`;
 $('rvList').innerHTML = b.questions.map((q, i) => `<div class="q"><button class="x" data-i="${i}" type="button" title="Remove">✕</button><div class="lv">${q.level.map(l => LV[l]).join(', ')} · ${TY[q.type]} · ${q.moments.map(m => MO[m]).join(', ')}${q.slot ? ' · slot ' + esc(q.slot) : ''}</div>${esc(q.q)}<div>${ans(q)}</div><div class="meta">${esc(q.explain)}</div></div>`).join('');
 $('rvList').querySelectorAll('[data-i]').forEach(x => x.onclick = () => { B.updateBank(id, bb => { bb.questions.splice(+x.dataset.i, 1); }); review(id); drawAll(); });
 $('rvOk').onclick = () => { B.updateBank(id, bb => { bb.reviewed = true; }); $('dlgReview').close(); drawAll(); toast('Marked as reviewed'); };
 if (!$('dlgReview').open) $('dlgReview').showModal(); }

// ---- import ----
function importText(text, meta = {}){ const out = $('bkReport'); let r;
 try { r = B.validate(text, SLOTS); } catch(e) { out.innerHTML = `<div class="report"><span class="r">✕ ${esc(e.message)}</span></div>`; return null; }
 if (!r.accepted) { out.innerHTML = `<div class="report"><span class="r">✕ No questions passed the checks.</span>${drops(r.dropped)}</div>`; return null; }
 const id = B.addBank(r.bank, meta); drawAll();
 out.innerHTML = `<div class="report"><span class="g">✔ “${esc(r.bank.name)}” added: ${r.accepted} question${r.accepted === 1 ? '' : 's'} accepted</span>${r.dropped.length ? ` · <span class="r">✕ ${r.dropped.length} dropped</span>${drops(r.dropped)}` : ''}<div class="note">Choose it for a pilot above. You can review it first with 👀 Review.</div></div>`;
 return id; }
const drops = d => d.length ? `<ul>${d.slice(0, 12).map(x => `<li>Question ${x.n}${x.q ? ` (“${esc(x.q)}”)` : ''}: ${esc(x.why)}</li>`).join('')}${d.length > 12 ? `<li>…and ${d.length - 12} more</li>` : ''}</ul>` : '';
// links carry the bank in the address (#bank=…), compressed when the browser can
async function pack(obj){ const bytes = new TextEncoder().encode(JSON.stringify(obj)); let out = 'j', data = bytes;
 if (window.CompressionStream) { try { data = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()); out = 'z'; } catch(e) { data = bytes; out = 'j'; } }
 let s = ''; data.forEach(b => s += String.fromCharCode(b)); return out + btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function unpack(t){ const kind = t[0], bin = atob(t.slice(1).replace(/-/g, '+').replace(/_/g, '/')), bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
 const raw = kind === 'z' ? new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()) : bytes;
 return new TextDecoder().decode(raw); }
async function linkImport(){ const m = location.hash.match(/[#&]bank=([\w-]+)/); if (!m) return; history.replaceState(null, '', location.pathname);
 try { const text = await unpack(m[1]); if (confirm('Add the question bank from this link to this device?')) importText(text, {source: 'link'}); } catch(e) { toast('That link does not contain a bank'); } }

// ---- the bank kit ----
const momentsOf = box => [...$(box).querySelectorAll('input:checked')].map(i => i.value);
function buildPrompt(o){ o = {...o, level: B.ages(o.level)[0] || '11-12'}; const types = o.moments.includes('academy') ? '"one", "several", "number" or "template"' : o.moments.includes('quick') ? '"one", "number" or "template"' : '"number" or "template"';
 return `You are writing questions for Starlane Trader, a space trading game for children and families. Write ${o.count} questions about: ${o.topic}.
Ages: ${LV[o.level]} — write every question for ${PITCH[o.level]}. Use: ${o.moments.join(', ')}.

Reply with ONLY this JSON (no other text):
{"starlane_bank": 1, "name": "<a short name for the set>", "author": "<your name or blank>", "about": "<one sentence>",
 "questions": [ ... ${o.count} questions ... ]}

Each question is one of these (type ${types}):
{"type": "one", "level": "${o.level}", "moments": ${JSON.stringify(o.moments.filter(m => m !== 'gates'))}, "topic": "<topic>", "q": "<question>", "options": ["<3 to 6 options>"], "answer": <index of the right option, from 0>, "explain": "<why it is right, in one or two kind sentences>"}
{"type": "several", "level": "${o.level}", "moments": ["academy"], "q": "Select the TWO …", "options": [...], "answer": [<indexes of ALL the right options>], "explain": "..."}
{"type": "number", "level": "${o.level}", "moments": ${JSON.stringify(o.moments)}, "q": "<question>", "answer": <number>, "unit": "<optional unit>", "explain": "..."}
{"type": "template", "level": "${o.level}", "moments": ${JSON.stringify(o.moments)}, "q": "What is {a} × {b}?", "vars": {"a": [2, 12], "b": [2, 12]}, "answer": "a*b", "explain": "{a} × {b} = {answer}"}
${o.moments.includes('adventure') ? `{"type": "one", "level": "${o.level}", "moments": ["adventure"], "slot": "<a slot id from the slot list>", ...} — adventure questions must match the slot's type, subject and any required answer.\n` : ''}
Rules (questions that break them are dropped):
- Every fact and every answer must be correct. Work each answer out twice. Explain every answer kindly.
- Questions: 5–240 characters${o.moments.includes('gates') ? ' (race maths gates: at most 70 characters, whole-number answers)' : ''}. Options: 3–6, all different, at most 90 characters each. Explanations: 5–400 characters.
- "several" questions must say how many to pick ("Select the TWO …") and have at least 2 right and 1 wrong option.
- "template": numbers in {braces} come from "vars" ([min, max] whole numbers, or a list of numbers); "answer" is a formula using only the var names, numbers, + - * / ^ and brackets. Never divide by something that can be 0.
- Pitched for ${PITCH[o.level]}: kind, age-appropriate, British English, no brand names, no scary or unkind content.
- Only mention "Apollo" when the question is about the Moon landings.`; }
function kitDraw(){ $('kPrompt').textContent = buildPrompt({topic: $('kTopic').value || 'your topic', level: $('kLevel').value, count: +$('kCount').value, moments: momentsOf('kMoments')}); }
const EXAMPLE = {starlane_bank: 1, name: 'Example: times tables', author: 'Starlane', about: 'A small example bank showing each kind of question.', questions: [
 {type: 'one', level: '7-8', moments: ['quick', 'academy'], topic: 'times tables', q: 'What is 6 × 7?', options: ['36', '42', '48', '49'], answer: 1, explain: '6 × 7 = 42. Six lots of seven: 7, 14, 21, 28, 35, 42.'},
 {type: 'several', level: '9-10', moments: ['academy'], topic: 'multiples', q: 'Select the THREE multiples of 6.', options: ['18', '24', '27', '36', '40'], answer: [0, 1, 3], explain: '18 = 6 × 3, 24 = 6 × 4 and 36 = 6 × 6. 27 and 40 do not divide by 6.'},
 {type: 'number', level: '9-10', moments: ['quick', 'gates'], topic: 'times tables', q: 'What is 12 × 9?', answer: 108, explain: '12 × 9 = 108 (12 × 10 = 120, take away 12).'},
 {type: 'template', level: ['7-8', '9-10'], moments: ['quick', 'gates'], topic: 'times tables', q: 'What is {a} × {b}?', vars: {a: [2, 10], b: [2, 5]}, answer: 'a*b', explain: '{a} × {b} = {answer}.'}]};
function download(name, obj){ const blob = new Blob([JSON.stringify(obj, null, 1)], {type: 'application/json'}), u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = name; l.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); }

// ---- Gemini (the grown-up's own key, kept on this device) ----
const GKEY = 'starlane-gemini-key';
async function gemini(prompt, key, model){
 const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {method: 'POST', headers: {'Content-Type': 'application/json', 'x-goog-api-key': key},
  body: JSON.stringify({contents: [{role: 'user', parts: [{text: prompt}]}], generationConfig: {responseMimeType: 'application/json', temperature: .6}})});
 if (!r.ok) { let m = ''; try { m = (await r.json()).error.message; } catch(e) {} throw Error(r.status === 400 || r.status === 403 ? `Gemini refused the request${m ? ': ' + m : ''}. Check the key and the model name.` : `Gemini did not answer (${r.status}).`); }
 const j = await r.json(), t = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts.map(p => p.text || '').join('');
 if (!t) throw Error('Gemini sent an empty answer.'); return t; }
// the second opinion: Gemini answers the questions without seeing the answers; any disagreement is dropped
async function secondOpinion(bank, key, model){
 const items = bank.questions.map((q, n) => { const c = q.type === 'template' ? (() => { const t = B.makeTemplate(q); return {type: 'number', q: t.q, answer: t.answer}; })() : q;
  return {n, type: c.type, q: c.q, options: c.options, items: c.items ? c.items.slice().sort() : undefined, _a: c.type === 'template' ? null : c.answer, _t: c}; });
 const ask = `Solve each question yourself, carefully. Reply with ONLY JSON: {"answers": [{"n": <n>, "answer": <for "one": the index of the right option; for "several": a list of ALL right indexes; for "number": the number; for "order": the items in the right order>}]}.\n` +
  JSON.stringify(items.map(i => ({n: i.n, type: i.type, q: i.q, options: i.options, items: i.items})));
 const got = JSON.parse(await gemini(ask, key, model)), map = new Map((got.answers || []).map(a => [a.n, a.answer])), keep = [], dropped = [];
 items.forEach(i => { const want = i._t.answer, a = map.get(i.n), q = bank.questions[i.n]; let ok = false;
  if (i.type === 'one') ok = +a === want;
  else if (i.type === 'several') ok = Array.isArray(a) && a.length === want.length && want.every(x => a.map(Number).includes(x));
  else if (i.type === 'number') ok = Number.isFinite(+a) && Math.abs(+a - want) <= Math.max(q.margin || 0, 1e-9 + Math.abs(want) * 1e-9);
  else if (i.type === 'order') ok = Array.isArray(a) && a.join('|') === q.items.join('|');
  (ok ? keep : dropped).push(q); });
 return {bank: {...bank, questions: keep}, agreed: keep.length, dropped: dropped.length}; }
async function generate(){ const msg = $('gMsg'), key = $('gKey').value.trim(), model = $('gModel').value.trim() || 'gemini-2.5-flash', topic = $('gTopic').value.trim(), moments = momentsOf('gMoments');
 if (!key) { msg.textContent = 'Paste your Gemini API key first.'; msg.className = 'msg bad'; return; } if (!topic) { msg.textContent = 'Type a topic first.'; msg.className = 'msg bad'; return; } if (!moments.length) { msg.textContent = 'Choose at least one use.'; msg.className = 'msg bad'; return; }
 try { localStorage.setItem(GKEY, JSON.stringify({key, model})); } catch(e) {}
 $('gGo').disabled = true; msg.className = 'msg'; msg.textContent = '✨ Asking Gemini to write the questions…';
 try { const text = await gemini(buildPrompt({topic, level: $('gLevel').value, count: +$('gCount').value, moments}), key, model);
  let r = B.validate(text, SLOTS); if (!r.accepted) throw Error('None of Gemini’s questions passed the checks. Try again, or change the topic.');
  let second = null;
  if ($('gSecond').checked) { msg.textContent = `🔎 ${r.accepted} questions passed the checks. Asking Gemini for a second opinion…`; const s = await secondOpinion(r.bank, key, model); second = {agreed: s.agreed, dropped: s.dropped}; r = {...r, bank: s.bank, accepted: s.agreed};
   if (!s.agreed) throw Error('The second opinion disagreed with every answer, so nothing was kept. Try again.'); }
  const id = B.addBank(r.bank, {source: 'gemini', second}); drawAll();
  msg.className = 'msg good'; msg.textContent = `✔ “${r.bank.name}” added: ${r.bank.questions.length} questions${r.dropped.length ? `, ${r.dropped.length} dropped by the checks` : ''}${second ? `, ${second.dropped} dropped by the second opinion` : ''}. Review it, then choose it for a pilot.`;
  return id; }
 catch(e) { msg.className = 'msg bad'; msg.textContent = '✕ ' + e.message; }
 finally { $('gGo').disabled = false; } }

function drawAll(){ drawPw(); drawPilots(); drawList(); }
// 👁 show / hide on every password and key box
function eyes(){ document.querySelectorAll('input[type=password]').forEach(inp => { if (inp.parentElement.classList.contains('pw')) return;
  const w = document.createElement('span'), b = document.createElement('button'); w.className = 'pw'; if (inp.style.maxWidth) { w.style.maxWidth = inp.style.maxWidth; inp.style.maxWidth = ''; } inp.parentNode.insertBefore(w, inp); w.appendChild(inp);
  b.type = 'button'; b.className = 'eye'; b.textContent = '👁'; b.title = b.ariaLabel = 'Show what you typed'; b.setAttribute('aria-pressed', 'false');
  b.onclick = () => { const show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; b.textContent = show ? '🙈' : '👁'; b.title = b.ariaLabel = show ? 'Hide it again' : 'Show what you typed'; b.setAttribute('aria-pressed', String(show)); inp.focus(); };
  w.appendChild(b); }); }
window.addEventListener('DOMContentLoaded', async () => {
 try { const v = window.STARLANE_VERSION; if (v) $('bkVer').textContent = `Version ${v.v}`; } catch(e) {}
 eyes(); document.querySelectorAll('dialog [data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());
 lockUI(); $('bkLockForm').addEventListener('submit', e => { e.preventDefault(); unlock($('bkCode').value); }); $('bkForgot').onclick = forgot;
 $('bkPwSet').onclick = setPw;
 $('bkPaste').onclick = () => { $('pasteText').value = ''; $('dlgPaste').showModal(); };
 $('pasteGo').onclick = () => { if (importText($('pasteText').value)) $('dlgPaste').close(); else $('dlgPaste').close(); };
 $('bkFileBtn').onclick = () => $('bkFile').click();
 $('bkFile').onchange = async () => { const f = $('bkFile').files[0]; if (!f) return; if (f.size > 2e6) { toast('That file is too big for a question bank'); return; } importText(await f.text()); $('bkFile').value = ''; };
 $('bkKitBtn').onclick = () => { kitDraw(); $('dlgKit').showModal(); };
 ['kTopic', 'kLevel', 'kCount'].forEach(id => $(id).addEventListener('input', kitDraw)); $('kMoments').addEventListener('change', kitDraw);
 $('kCopy').onclick = async () => { try { await navigator.clipboard.writeText($('kPrompt').textContent); $('kMsg').textContent = '✔ Copied. Paste it into your AI, then paste its answer here with 📋 Paste text.'; $('kMsg').className = 'msg good'; } catch(e) { $('kMsg').textContent = 'Select the prompt above and copy it.'; } };
 $('kExample').onclick = () => download('starlane-example-bank.json', EXAMPLE);
 $('kSlots').onclick = () => download('starlane-adventure-slots.json', SLOTS);
 try { const g = JSON.parse(localStorage.getItem(GKEY) || 'null'); if (g) { $('gKey').value = g.key || ''; $('gModel').value = g.model || 'gemini-2.5-flash'; } } catch(e) {}
 $('gGo').onclick = generate; $('gForget').onclick = () => { try { localStorage.removeItem(GKEY); } catch(e) {} $('gKey').value = ''; toast('Your key was removed from this device'); };
 $('bkCode').focus();
 if (await A.unlockedNow()) opened(); });
window.StarlaneBanksPage = {importText, buildPrompt, secondOpinion, generate, pack, unpack, drawAll, EXAMPLE};
})();
