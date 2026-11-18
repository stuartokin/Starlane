/* Starlane Trader — question banks (since v29). Used by the game (index.html) and the grown-ups' page (banks.html).
   A bank is JSON (contract version 1):
     {"starlane_bank": 1, "name": "...", "author": "...", "about": "...", "questions": [ ... ]}
   Each question:
     type     "one" | "several" | "number" | "order" | "template"
     level    the ages it suits, the same as the pilots' training levels: "7-8" | "9-10" | "11-12" | "13-14" | "adult",
              or a list of them (since v30). Exam-practice pilots use "11-12" (Tiffin, 11+, ISEB) or "13-14" (13+ CE).
              The older names still work: "young" = 7-8 and 9-10, "mid" = 11-12, "older" = 13-14.
     moments  where it may be used: "quick" (fuel, trade, repair… puzzles), "academy" (Academy and Navigator’s Cup),
              "gates" (maths gates in races), "adventure" (an adventure puzzle slot — then "slot": "canister/2")
     q        the question (5–240 characters); explain: why the answer is right (5–400 characters)
     one / several: options (3–6 different texts, each up to 90 characters) and answer (an index, or a list of indexes
              for several: at least 2 right and 1 wrong, and the question must say how many to pick)
     number:  answer (a number) and optional margin (accept answer ± margin) and unit
     order:   items (3–8, in the right order)
     template: q and explain with {a}, {b}… and {answer}; vars {"a": [min, max], "b": [list…]}; answer is a formula
              using the vars, numbers, + − × ÷ ^ and brackets (no code). Optional "decimals" (0–2).
   Which moments take which types: quick → one, number, template; academy → one, several, number, template;
   gates → number, template (whole-number answers); adventure → one, several, number, order (must fit the slot).
   The validator drops bad questions one by one and reports why; the rest of the bank still imports.
   Storage (this device only): localStorage "starlane-banks-v1" = {banks: {id: bank}, pilots: {pilotId: {bank, mode}}},
   mode "builtin" | "mixed" | "only". If a bank has nothing suitable, the built-in questions are used.
   Inside ApolloMaths the banks are never used: Starlane asks ApolloMaths for the questions for the child’s plan. */
window.StarlaneBanks = (() => {
 const STORE = 'starlane-banks-v1', LEVELS = ['7-8', '9-10', '11-12', '13-14', 'adult'],
  OLD = {young: ['7-8', '9-10'], mid: ['11-12'], older: ['13-14']},
  AGE_LABEL = {'7-8': 'Ages 7–8', '9-10': 'Ages 9–10', '11-12': 'Ages 11–12', '13-14': 'Ages 13–14', adult: 'Adult'};
 // a level as written in a bank (or an older name) → the list of ages it means
 const ages = l => { const k = String(l == null ? '' : l).toLowerCase().replace(/ages?\s*/, '').replace(/[–—]/g, '-').replace(/\s+/g, '');
  return OLD[k] ? OLD[k] : LEVELS.includes(k) ? [k] : []; };
 const agesOf = list => [...new Set([].concat(list || []).flatMap(ages))].sort((a, b) => LEVELS.indexOf(a) - LEVELS.indexOf(b));
 // a pilot's training level (band) → the age its bank questions come from
 const ageOfBand = b => b === 'x-ce13' ? '13-14' : /^x-/.test(b || '') ? '11-12' : LEVELS.includes(b) ? b : '11-12';
 TYPES = ['one', 'several', 'number', 'order', 'template'];
 const MOMENTS = {quick: ['one', 'number', 'template'], academy: ['one', 'several', 'number', 'template'], gates: ['number', 'template'], adventure: ['one', 'several', 'number', 'order']};
 const LIM = {q: 240, explain: 400, option: 90, item: 60, name: 60, questions: 2000};
 const WORDS = {two: 2, three: 3, four: 4, five: 5, six: 6};
 // a short list kept deliberately mild: words that should never appear in a children’s question
 const UNSAFE = /\b(fuck|shit|bitch|cunt|wank|nigg|fag|rape|porn|nude|naked|sexy|kill yourself|suicide|cocaine|heroin)\w*/i;
 const clean = s => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b-\u001f\u007f​-‏‪-‮]/g, '').replace(/\s+/g, ' ').trim();

 // ---- safe formulas for templates: numbers, variable names, + - * / ^ ( ), × ÷ − allowed; nothing else ----
 function formula(src, vars){ const s = String(src).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'), toks = s.match(/\d+(\.\d+)?|[a-z]\w*|[-+*/^()]|\S/gi) || []; let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  function prim(){ const t = next(); if (t === undefined) throw Error('formula ends too soon');
   if (t === '(') { const v = sum(); if (next() !== ')') throw Error('missing )'); return v; }
   if (t === '-') return -prim(); if (/^\d/.test(t)) return +t;
   if (/^[a-z]\w*$/i.test(t)) { if (!(t in vars)) throw Error(`unknown name ${t}`); return vars[t]; }
   throw Error(`not allowed in a formula: ${t}`); }
  function pow(){ let v = prim(); while (peek() === '^') { next(); v = Math.pow(v, pow()); } return v; }
  function prod(){ let v = pow(); while (peek() === '*' || peek() === '/') { const o = next(), r = pow(); v = o === '*' ? v * r : v / r; } return v; }
  function sum(){ let v = prod(); while (peek() === '+' || peek() === '-') { const o = next(), r = prod(); v = o === '+' ? v + r : v - r; } return v; }
  const v = sum(); if (i !== toks.length) throw Error(`unexpected ${toks[i]}`); return v; }
 const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
 const fmtN = (v, dp) => { const r = dp ? (+v).toFixed(dp) : String(Math.round(v)); return r.replace(/^-/, '−'); };
 // [min, max] of whole numbers is a range; anything else (3+ numbers, or decimals) is a list to pick from
 function rollVars(vars){ const o = {}; for (const [k, spec] of Object.entries(vars)) o[k] = spec.length === 2 && spec.every(Number.isInteger) && spec[0] <= spec[1] ? R(spec[0], spec[1]) : spec[R(0, spec.length - 1)]; return o; }
 // a template made concrete: {q, answer, explain} with numbers filled in
 function makeTemplate(t){ const v = rollVars(t.vars), a = formula(t.answer, v), dp = t.decimals || 0, fill = s => s.replace(/\{(\w+)\}/g, (m, k) => k === 'answer' ? fmtN(a, dp) : k in v ? fmtN(v[k], 0) : m);
  return {q: fill(t.q), answer: +(+a).toFixed(dp), explain: fill(t.explain), unit: t.unit || ''}; }

 // ---- the validator ----
 function checkQuestion(x, slots){
  const why = m => { throw Error(m); };
  if (!x || typeof x !== 'object') why('not a question object');
  const type = x.type; if (!TYPES.includes(type)) why(`unknown type "${type}"`);
  const levels = agesOf(x.level); if (!levels.length) why('needs a level (the ages): 7-8, 9-10, 11-12, 13-14 or adult');
  let moments = [].concat(x.moments || (type === 'order' ? ['adventure'] : ['quick', 'academy'])).filter(m => MOMENTS[m] && MOMENTS[m].includes(type === 'template' ? 'template' : type));
  if (!moments.length) why(`a ${type} question cannot be used in ${[].concat(x.moments || []).join(', ') || 'those places'}`);
  const q = clean(x.q), explain = clean(x.explain);
  if (q.length < 5 || q.length > LIM.q) why(`the question must be 5–${LIM.q} characters`);
  if (explain.length < 5 || explain.length > LIM.explain) why(`the explanation must be 5–${LIM.explain} characters`);
  const all = [q, explain, ...(x.options || []), ...(x.items || [])].join(' ');
  if (UNSAFE.test(all)) why('contains words that are not suitable for children');
  if (/\bapollo\b/i.test(all) && !/\b(moon|lunar|1969|1972|armstrong|aldrin|collins|nasa)\b/i.test(all)) why('“Apollo” may only appear in Moon-landing history');
  if (/<\s*\/?\s*(script|iframe|img|a|style)\b/i.test(all)) why('contains web code');
  const out = {type, level: levels, moments, q, explain, topic: clean(x.topic).slice(0, 40)};
  if (type === 'one' || type === 'several') {
   const o = (x.options || []).map(clean); if (o.length < 3 || o.length > 6) why('needs 3 to 6 options');
   if (o.some(t => !t || t.length > LIM.option)) why(`each option must be 1–${LIM.option} characters`);
   if (new Set(o.map(t => t.toLowerCase())).size !== o.length) why('two options are the same');
   const a = type === 'one' ? [x.answer] : [].concat(x.answer); if (!a.every(i => Number.isInteger(i) && i >= 0 && i < o.length) || new Set(a).size !== a.length) why('the answer must point to the options');
   if (type === 'one' && Array.isArray(x.answer)) why('a "one" question has exactly one right answer');
   if (type === 'several') { if (a.length < 2) why('a "several" question needs at least 2 right answers'); if (a.length >= o.length) why('a "several" question needs at least one wrong option');
    const said = q.toLowerCase().match(/\b(two|three|four|five|six|\d)\b/); const n = said ? (WORDS[said[1]] || +said[1]) : null;
    if (n !== null && n !== a.length) why(`the question says ${n} but there are ${a.length} right answers`);
    if (n === null) out.q = q + ` (Pick ${a.length}.)`; }
   out.options = o; out.answer = type === 'one' ? a[0] : a.slice().sort((p, r) => p - r); }
  if (type === 'number') { const a = +x.answer; if (!Number.isFinite(a) || String(x.answer).trim() === '' || Math.abs(a) > 1e9) why('the answer must be a number');
   const m = x.margin === undefined ? 0 : +x.margin; if (!Number.isFinite(m) || m < 0 || m > Math.abs(a) * .5 + 1) why('the margin must be a small positive number');
   const dp = (String(a).split('.')[1] || '').length; if (dp > 3) why('use at most 3 decimal places');
   out.answer = a; out.margin = m; out.unit = clean(x.unit).slice(0, 12); }
  if (type === 'order') { const it = (x.items || []).map(clean); if (it.length < 3 || it.length > 8) why('an order question needs 3 to 8 items');
   if (it.some(t => !t || t.length > LIM.item)) why(`each item must be 1–${LIM.item} characters`); if (new Set(it.map(t => t.toLowerCase())).size !== it.length) why('two items are the same'); out.items = it; }
  if (type === 'template') { const vars = x.vars; if (!vars || typeof vars !== 'object' || !Object.keys(vars).length) why('a template needs vars');
   for (const [k, spec] of Object.entries(vars)) { if (!/^[a-z]\w{0,11}$/i.test(k)) why(`bad variable name ${k}`);
    if (!Array.isArray(spec) || !spec.length || spec.length > 50 || !spec.every(v => Number.isFinite(v) && Math.abs(v) <= 1e6)) why(`vars.${k} must be [min, max] or a short list of numbers`); }
   const dp = x.decimals === undefined ? 0 : +x.decimals; if (![0, 1, 2].includes(dp)) why('decimals must be 0, 1 or 2');
   out.vars = vars; out.answer = String(x.answer || ''); out.decimals = dp; out.unit = clean(x.unit).slice(0, 12);
   for (let n = 0; n < 200; n++) { let t; try { t = makeTemplate(out); } catch(e) { why(`the formula does not work: ${e.message}`); }
    if (!Number.isFinite(t.answer)) why('the formula can give an impossible answer (for example dividing by zero)');
    if (Math.abs(t.answer) > 1e9) why('the formula gives numbers that are too big');
    if (moments.includes('gates') && !Number.isInteger(t.answer)) { out.moments = moments = moments.filter(m => m !== 'gates'); if (!moments.length) why('maths gates need whole-number answers'); }
    if (t.q.length > LIM.q) why('the question is too long once the numbers are filled in'); if (/\{\w+\}/.test(t.q)) why('the question uses a name that is not in vars'); } }
  if (out.moments.includes('gates') && (out.q.length > 70 || (type === 'template' && makeTemplate(out).q.length > 70))) { out.moments = out.moments.filter(m => m !== 'gates'); if (!out.moments.length) why('maths-gate questions must be short (70 characters) to fit the race display'); }
  if (moments.includes('gates') && type === 'number' && !Number.isInteger(out.answer)) { out.moments = moments.filter(m => m !== 'gates'); if (!out.moments.length) why('maths gates need whole-number answers'); }
  if (out.moments.includes('adventure')) { const slot = clean(x.slot), s = slots && slots[slot];
   if (!s) { out.moments = out.moments.filter(m => m !== 'adventure'); if (!out.moments.length) why(`unknown adventure slot "${slot}"`); }
   else { if (s.type !== (type === 'several' ? 'choose-many' : type === 'one' ? 'choose' : type === 'number' ? 'code' : type)) why(`slot ${slot} needs a ${s.type} question`);
    if (s.must && !(out.options || []).some((o, i) => [].concat(out.answer).includes(i) && o.toLowerCase().includes(s.must.toLowerCase()))) why(`in slot ${slot} the story carries on from the answer, so the right answer must mention “${s.must}”`);
    if (type === 'number' && !Number.isInteger(out.answer)) why('adventure number answers must be whole numbers');
    out.slot = slot; } }
  return out; }
 // check a whole bank: returns {bank, accepted, dropped:[{n, q, why}]}; throws only if it isn't a bank at all
 function validate(raw, slots){ let b = raw; if (typeof b === 'string') { const t = b.trim().replace(/^```(json)?/i, '').replace(/```$/, ''); try { b = JSON.parse(t); } catch(e) { throw Error('This is not valid JSON. Copy the whole answer, from { to }.'); } }
  if (!b || typeof b !== 'object' || Array.isArray(b)) throw Error('This is not a question bank.');
  if (b.starlane_bank !== 1) throw Error('This is not a Starlane question bank (it needs "starlane_bank": 1).');
  const name = clean(b.name).slice(0, LIM.name) || 'Unnamed bank', qs = Array.isArray(b.questions) ? b.questions.slice(0, LIM.questions) : [];
  if (!qs.length) throw Error('The bank has no questions.');
  const seen = new Set(), out = [], dropped = [];
  qs.forEach((x, n) => { try { const c = checkQuestion(x, slots), key = c.type + ':' + c.q.toLowerCase(); if (seen.has(key)) throw Error('the same question appears twice'); seen.add(key); out.push(c); }
   catch(e) { dropped.push({n: n + 1, q: clean(x && x.q).slice(0, 80), why: e.message}); } });
  return {bank: {starlane_bank: 1, name, author: clean(b.author).slice(0, 60), about: clean(b.about).slice(0, 300), questions: out}, accepted: out.length, dropped}; }

 // ---- storage on this device ----
 const load = () => { try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s && s.banks && s.pilots) {
  for (const b of Object.values(s.banks)) for (const q of b.questions || []) q.level = agesOf(q.level); return s; } } catch(e) {} return {banks: {}, pilots: {}}; };
 const store = s => { localStorage.setItem(STORE, JSON.stringify(s)); };
 function addBank(bank, meta = {}){ const s = load(), id = 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  s.banks[id] = {...bank, id, added: new Date().toISOString(), source: meta.source || 'import', reviewed: !!meta.reviewed, second: meta.second || null}; store(s); return id; }
 const list = () => Object.values(load().banks).sort((a, b) => (a.added < b.added ? 1 : -1));
 const getBank = id => load().banks[id] || null;
 function updateBank(id, fn){ const s = load(); if (!s.banks[id]) return; fn(s.banks[id]); store(s); }
 function removeBank(id){ const s = load(); delete s.banks[id]; for (const p of Object.values(s.pilots)) if (p.bank === id) { p.bank = null; p.mode = 'builtin'; } store(s); }
 const pilotSetting = pid => load().pilots[pid] || {bank: null, mode: 'builtin'};
 function setPilot(pid, bank, mode){ const s = load(); s.pilots[pid] = {bank: bank || null, mode: bank && ['mixed', 'only'].includes(mode) ? mode : 'builtin'}; store(s); }
 function resetAllToBuiltIn(){ const s = load(); for (const p of Object.values(s.pilots)) p.mode = 'builtin'; store(s); }

 // ---- for the game: the current pilot’s bank, if any (never inside ApolloMaths) ----
 function active(){ try { if (window.StarlaneSite && StarlaneSite.hosted) return null; const pid = window.StarlanePilots ? StarlanePilots.cur : 'p1', set = pilotSetting(pid);
  if (!set.bank || set.mode === 'builtin') return null; const b = getBank(set.bank); return b && b.questions.length ? {bank: b, mode: set.mode} : null; } catch(e) { return null; } }
 const recent = [];
 // the age to take questions for: the pilot's training level on this site (exact), else what the caller passed
 function currentAge(level){ try { if (window.STARLANE_BAND) return [ageOfBand(STARLANE_BAND())]; } catch(e) {} const a = ages(level); return a.length ? a : ['11-12']; }
 // what the game shows players (launch page, Pause): which questions this pilot gets
 function describe(){ try { if (window.StarlaneSite && StarlaneSite.hosted) return {kind: 'plan', text: '📚 Questions: your learning plan'};
  const pid = window.StarlanePilots ? StarlanePilots.cur : 'p1', set = pilotSetting(pid), b = set.bank && set.mode !== 'builtin' ? getBank(set.bank) : null;
  if (!b) return {kind: 'builtin', text: '📚 Questions: built-in'};
  const age = currentAge()[0], n = b.questions.filter(q => q.level.includes(age)).length, how = set.mode === 'only' ? 'only this bank' : 'mixed with built-in';
  return {kind: n ? set.mode : 'none', name: b.name, count: n, text: n ? `📚 Questions: “${b.name}” (${how})` : `📚 Questions: built-in (“${b.name}” has none for ${AGE_LABEL[age]})`}; }
  catch(e) { return {kind: 'builtin', text: '📚 Questions: built-in'}; } }
 // pick a question for a moment and level: returns a concrete question (templates filled in) or null
 // level: the pilot's age ("7-8"…"adult"); the game passes its own band or tier and it is turned into an age here
 function pick(moment, level, opts = {}){ const a = active(); if (!a) return null; if (a.mode === 'mixed' && Math.random() < .5 && !opts.always) return null;
  const want = currentAge(level);
  const types = opts.types || MOMENTS[moment] || [], pool = a.bank.questions.filter(x => x.moments.includes(moment) && want.some(w => x.level.includes(w)) && (types.includes(x.type) || (x.type === 'template' && types.includes('template'))) && (!opts.slot || x.slot === opts.slot));
  if (!pool.length) return null; const fresh = pool.filter(x => !recent.includes(x.q)), list = fresh.length ? fresh : pool, x = list[R(0, list.length - 1)];
  recent.push(x.q); if (recent.length > 30) recent.shift();
  if (x.type === 'template') { const t = makeTemplate(x); return {...x, type: 'number', q: t.q, answer: t.answer, explain: t.explain, decimals: x.decimals || 0, bankName: a.bank.name}; }
  return {...x, bankName: a.bank.name}; }
 // a bank question in the shape the game’s maths screen uses: {q, opts, ans, how, u, src} (several: multi, ansSet)
 function forMaths(x){ if (!x) return null;
  if (x.type === 'one') { const opts = x.options.slice().sort(() => Math.random() - .5); return {q: x.q, opts, ans: x.options[x.answer], how: x.explain, u: '', src: x.bankName, topic: x.topic}; }
  if (x.type === 'several') { const opts = x.options.slice().sort(() => Math.random() - .5), set = x.answer.map(i => x.options[i]); return {q: x.q, opts, ans: set.slice().sort().join(' + '), ansSet: set, multi: true, how: x.explain, u: '', src: x.bankName, topic: x.topic}; }
  if (x.type === 'number') { const a = +x.answer, dp = x.decimals !== undefined ? x.decimals : (String(a).split('.')[1] || '').length, fm = v => (dp ? (+v).toFixed(dp) : String(Math.round(v))).replace(/^-/, '−');
   const set = new Set([fm(a)]), st = dp ? [.1, .2, .5, 1, 2] : [1, 2, 3, 5, 10, Math.max(1, Math.round(Math.abs(a) * .1))]; let k = 0;
   while (set.size < 4 && k < 80) { const v = a + (Math.random() < .5 ? -1 : 1) * st[k % st.length] * (1 + Math.floor(k / st.length)); if (v >= 0 || a < 0) set.add(fm(v)); k++; }
   return {q: x.q, opts: [...set].sort(() => Math.random() - .5), ans: fm(a), how: x.explain, u: x.unit || '', src: x.bankName, topic: x.topic}; }
  return null; }

 // the adventure puzzle slots: type, adventure and subject, from the adventures themselves. A few are tied to the
 // story that follows (checked by hand, 18 Nov 2026): a bank's right answer there must contain the given word.
 const STORY = {'lights/2': 'parallel', 'frozen/3': 'heat', 'storm/2': 'shadow', 'medbay/3': 'tissue', 'shadows/3': 'reflect', 'rust/2': 'paint', 'junk/3': 'recycl', 'timewarp/6': 'gravity'};
 function slots(){ if (typeof StarAdv === 'undefined') return {}; const out = {};
  for (const a of StarAdv.LIST) a.scenes.forEach((s, k) => { if (!['choose', 'code', 'order'].includes(s.type)) return; const id = `${a.id}/${k}`;
   out[id] = {adventure: a.title, subject: a.subject || '', type: s.type === 'choose' ? (s.many ? 'choose-many' : 'choose') : s.type, about: typeof s.q === 'object' ? s.q.mid : s.q, ...(STORY[id] ? {must: STORY[id]} : {})}; });
  return out; }

 return {validate, checkQuestion, makeTemplate, formula, addBank, list, getBank, updateBank, removeBank, pilotSetting, setPilot, resetAllToBuiltIn,
  active, pick, forMaths, slots, describe, ages, agesOf, ageOfBand, AGE_LABEL, LEVELS, TYPES, MOMENTS, LIM, STORE};
})();
