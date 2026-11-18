"""Question banks (since v29): the contract and validator, the admin lock (starter password from STARLANE_ADMIN_CODE,
then a family's own password; forgot-password), pilots on a device, the grown-ups' page (paste, review, link, delete),
the game using a pilot's bank by mode with the built-in fallback, banks by the pilots' own ages (since v30: 7-8, 9-10,
11-12, 13-14, adult; older names still work), the 👁 on password boxes, the Gemini key help, which questions are in use
on the launch page and in Pause, "pick several" questions, race maths gates and
adventure slots from a bank, ApolloMaths never using banks, and making a bank with Gemini (a stand-in for Google's
server answers, including a second opinion that disagrees once)."""
from rig import *

D = "Arcade._game()._dbg"
CODE = os.environ.get('STARLANE_ADMIN_CODE', '')
BANK = {'starlane_bank': 1, 'name': 'Rig bank', 'author': 'Rig', 'questions': [
    {'type': 'one', 'level': ['young', 'mid'], 'moments': ['quick', 'academy'], 'q': 'RIG: What is 6 × 7?', 'options': ['36', '42', '48'], 'answer': 1, 'explain': '6 × 7 = 42.'},
    {'type': 'several', 'level': 'mid', 'moments': ['academy'], 'q': 'RIG: Select the TWO even numbers.', 'options': ['2', '3', '4', '5'], 'answer': [0, 2], 'explain': '2 and 4 divide by 2.'},
    {'type': 'template', 'level': 'mid', 'moments': ['quick', 'gates'], 'q': 'RIG {a} × {b}?', 'vars': {'a': [2, 9], 'b': [2, 9]}, 'answer': 'a*b', 'explain': '{a} × {b} = {answer}.'},
    {'type': 'one', 'level': 'Ages 9–10', 'moments': ['quick'], 'q': 'AGE910: What is 9 + 10?', 'options': ['18', '19', '20'], 'answer': 1, 'explain': '9 + 10 = 19.'},
    {'type': 'one', 'level': '7-8', 'moments': ['quick'], 'q': 'AGE78: What is 7 + 8?', 'options': ['14', '15', '16'], 'answer': 1, 'explain': '7 + 8 = 15.'},
    {'type': 'one', 'level': 'mid', 'moments': ['adventure'], 'slot': 'radio/1', 'q': 'RIG SLOT: Which of these conducts electricity?', 'options': ['Glass', 'Silver', 'Rubber'], 'answer': 1, 'explain': 'Silver is a metal, and metals conduct.'}]}

async def unlock_page(pg, code):
    await pg.fill('#bkCode', code); await pg.click('#bkLockForm button[type=submit]')
    return bool(await until(pg, "!document.getElementById('bkMain').hidden||/Not quite|starter/.test(document.getElementById('bkLockMsg').textContent)", 15000, 200)) and await pg.evaluate("!document.getElementById('bkMain').hidden")

async def main(p):
    R = Result('banks')
    pg = await browser(p, 1100, 900); say = {'prompt': CODE}   # what to type into the next prompt() box
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept(say['prompt']) if d.type == 'prompt' else d.accept()))
    await open_site(pg); await register(pg, 'Ann', '11-12')
    await pg.goto(f'{serve()}/Starlane/banks.html'); await pg.wait_for_timeout(500)
    # 1. the validator
    r = await pg.evaluate("""(()=>{const V=b=>StarlaneBanks.validate(b,StarlaneBanks.slots());const q=x=>({starlane_bank:1,name:'t',questions:[x]});const why=x=>{const r=V(q(x));return r.accepted?'ok':r.dropped[0].why};
      const ok={type:'one',level:'mid',q:'What is 2 + 2?',options:['3','4','5'],answer:1,explain:'2 + 2 = 4.'};
      return {ok:why(ok),two:why({...ok,options:['4','4','5']}),badans:why({...ok,answer:7}),noexp:why({...ok,explain:''}),long:why({...ok,q:'x'.repeat(300)}),
       apollo:why({...ok,q:'Which Apollo is best?'}),apolloMoon:why({...ok,q:'Apollo 11 landed on the Moon in which year?'}),html:why({...ok,q:'<script>alert(1)</script> 2+2?'}),
       sevCount:why({type:'several',level:'mid',moments:['academy'],q:'Select the THREE even numbers.',options:['2','3','4'],answer:[0,2],explain:'Even numbers.'}),
       sevQuick:why({type:'several',level:'mid',moments:['quick'],q:'Select the TWO even numbers.',options:['2','3','4'],answer:[0,2],explain:'Even numbers.'}),
       div0:why({type:'template',level:'mid',q:'What is {a} ÷ {b}?',vars:{a:[1,9],b:[0,2]},answer:'a/b',explain:'{a} ÷ {b}'}),
       code:why({type:'template',level:'mid',q:'What is {a}?',vars:{a:[1,9]},answer:'alert(a)',explain:'x is fine'}),
       gatesLong:why({type:'number',level:'mid',moments:['gates'],q:'A very long question for a race gate, far too long to fit on the race display at all?',answer:4,explain:'Four.'}),
       slotMust:why({type:'one',level:'mid',moments:['adventure'],slot:'lights/2',q:'How should the lights be wired?',options:['In series','With string','With glue'],answer:0,explain:'Not really.'}),
       slotOk:why({type:'one',level:'mid',moments:['adventure'],slot:'lights/2',q:'How should the lights be wired?',options:['In parallel','In series','With glue'],answer:0,explain:'Parallel gives each its own loop.'}),
       notBank:(()=>{try{V({questions:[]});return 'ok'}catch(e){return e.message}})(), notJson:(()=>{try{V('hello');return 'ok'}catch(e){return e.message}})()};})()""")
    want = {'ok': 'ok', 'apolloMoon': 'ok', 'slotOk': 'ok'}
    bad = {k: v for k, v in r.items() if (k in want) != (v == 'ok')}
    R.check(not bad, 'the validator accepts good questions and drops each kind of bad one with a reason', bad or r)
    # 2. the admin lock
    R.check(await pg.evaluate("StarlaneAdmin.starterSet()"), 'the starter password is set (js/admin-lock.js has a check value)', 'run tools/set_admin_code.py')
    if not CODE:
        R.skip('admin password: starter, own password, forgot', 'set STARLANE_ADMIN_CODE'); await pg.close_all(); return R
    await pg.fill('#bkCode', 'peek'); await pg.click('#bkCode + .eye')
    R.check(await pg.evaluate("document.getElementById('bkCode').type") == 'text', 'the admin password box has a 👁 to show what was typed')
    await pg.click('#bkCode + .eye'); await pg.fill('#bkCode', '')
    R.check(not await unlock_page(pg, 'not-the-password'), 'a wrong admin password is refused')
    R.check(await unlock_page(pg, CODE), 'the starter password opens the question-bank page')
    await pg.evaluate("sessionStorage.setItem('starlane-admin-ok','0'.repeat(64))"); await pg.reload(); await pg.wait_for_timeout(1200)
    R.check(await pg.evaluate("document.getElementById('bkMain').hidden"), 'a made-up "unlocked" marker does not open it')
    await unlock_page(pg, CODE)
    # 2b. ages match the pilots' training levels; older bank names still work
    r = await pg.evaluate("""(()=>{const V=l=>{const r=StarlaneBanks.validate({starlane_bank:1,name:'t',questions:[{type:'one',level:l,q:'What is 2 + 2?',options:['3','4','5'],answer:1,explain:'2 + 2 = 4.'}]});return r.accepted?r.bank.questions[0].level:r.dropped[0].why};
      const opts=id=>[...document.querySelectorAll('#'+id+' option')].map(o=>[o.value,o.textContent]);
      return {young:V('young'),mid:V('mid'),older:V('older'),dash:V('Ages 9–10'),list:V(['7-8','13-14']),bad:V('teenagers'),g:opts('gLevel'),k:opts('kLevel'),
       iseb:StarlaneBanks.ageOfBand('x-iseb'),ce:StarlaneBanks.ageOfBand('x-ce13')};})()""")
    R.check(r['young'] == ['7-8', '9-10'] and r['mid'] == ['11-12'] and r['older'] == ['13-14'] and r['dash'] == ['9-10'] and r['list'] == ['7-8', '13-14'] and 'level' in r['bad'],
            'bank ages are the pilots’ ages (7-8, 9-10, 11-12, 13-14, adult); older names (young, mid, older) still work', r)
    R.check([v for v, _ in r['g']] == ['7-8', '9-10', '11-12', '13-14', 'adult'] and r['g'] == r['k'] and r['g'][0][1] == 'Ages 7–8' and 'ISEB' in r['g'][2][1] and 'Common Entrance' in r['g'][3][1],
            'Gemini and the bank kit offer the same ages as the pilots’ training levels (exams shown under their age)', r['g'])
    R.check(r['iseb'] == '11-12' and r['ce'] == '13-14', 'exam-practice pilots take bank questions for their age (11+/ISEB → 11–12, 13+ CE → 13–14)', r)
    kit = await pg.evaluate("StarlaneBanksPage.buildPrompt({topic:'Tables',level:'9-10',count:10,moments:['quick']})")
    R.check('Ages 9–10' in kit and 'aged 9–10' in kit and '"level": "9-10"' in kit, 'the prompt tells the AI the exact age', kit[:200])
    eyes = await pg.evaluate("['bkPw1','bkPw2','gKey'].map(id=>{const i=document.getElementById(id),b=i.parentElement.querySelector('.eye');return !!b&&i.type==='password'})")
    await pg.click('#gKey'); await pg.fill('#gKey', 'abc'); await pg.click('#gKey + .eye')
    shown = await pg.evaluate("[document.getElementById('gKey').type,document.getElementById('gKey').value]")
    await pg.click('#gKey + .eye'); hidden = await pg.evaluate("document.getElementById('gKey').type"); await pg.fill('#gKey', '')
    R.check(all(eyes) and shown == ['text', 'abc'] and hidden == 'password', 'every password and key box has a 👁 that shows and hides what was typed', [eyes, shown, hidden])
    hl = await pg.evaluate("[...document.querySelectorAll('#gHelp a')].map(a=>a.href)")
    R.check(any('aistudio.google.com/apikey' in h for h in hl), 'the Gemini section links to where you get an API key', hl)
    # 3. import by paste, review, link, assign to a pilot
    await pg.click('#bkPaste'); await pg.fill('#pasteText', json.dumps(BANK)); await pg.click('#pasteGo'); await pg.wait_for_timeout(300)
    rep = await pg.inner_text('#bkReport')
    R.check('6 questions accepted' in rep, 'pasting a bank imports it and reports what was accepted', rep[:120])
    bid = await pg.evaluate("StarlaneBanks.list()[0].id")
    await pg.click('[data-a=review]'); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate("document.querySelectorAll('#rvList .q').length") == 6, 'review lists every question with its answer')
    await pg.click('#rvOk'); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate(f"StarlaneBanks.getBank('{bid}').reviewed"), 'review: mark as reviewed')
    link = await pg.evaluate(f"(async()=>location.origin+location.pathname+'#bank='+await StarlaneBanksPage.pack({{starlane_bank:1,name:'Linked',questions:StarlaneBanks.getBank('{bid}').questions}}))()")
    await pg.goto(link); await pg.reload(); await until(pg, "StarlaneBanks.list().some(b=>b.name==='Linked')", 8000)
    R.check(await pg.evaluate("StarlaneBanks.list().some(b=>b.name==='Linked')"), 'a 🔗 link adds the bank on another device')
    lid = await pg.evaluate("StarlaneBanks.list().find(b=>b.name==='Linked').id")
    await pg.evaluate(f"StarlaneBanks.setPilot('p1','{lid}','only')"); await pg.evaluate("StarlaneBanksPage.drawAll()")
    await pg.evaluate(f"(()=>{{window.confirm=()=>true;document.querySelector('[data-id=\"{lid}\"] [data-a=delete]').click();}})()"); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate("StarlaneBanks.pilotSetting('p1').mode") == 'builtin', 'deleting a bank puts its pilots back on built-in questions')
    await pg.select_option('[data-pid=p1] [data-bank]', bid); await pg.click('[data-pid=p1] [data-mode=only]'); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate("StarlaneBanks.pilotSetting('p1')") == {'bank': bid, 'mode': 'only'}, 'a pilot can be given a bank and a mode')
    # 4. the game uses it: only, several, gates, adventure slot, fallback, mixed
    await pg.goto(f'{serve()}/Starlane/index.html'); await pg.wait_for_timeout(600)
    line = await pg.inner_text('#pilotBank')
    R.check('Rig bank' in line and 'only this bank' in line, 'the launch page says which question bank the pilot is using', line)
    await pg.add_init_script("(()=>{const f=CanvasRenderingContext2D.prototype.fillText;window.__txt=new Set();CanvasRenderingContext2D.prototype.fillText=function(t,...a){try{window.__txt.add(String(t));}catch(e){}return f.call(this,t,...a);};})()")
    await pg.reload(); await pg.wait_for_timeout(600)
    await launch_game(pg); await until(pg, f"{D}.mode==='docked'", 20000)
    await pg.evaluate(f"window.__txt.clear();{D}.set('overlay','menu');{D}.set('menuTab','main')"); await pg.wait_for_timeout(400)
    R.check(await pg.evaluate("[...window.__txt].some(t=>t.includes('📚 Questions:')&&t.includes('Rig bank'))"), 'Pause (GAME tab) says which question bank is in use')
    await pg.evaluate(f"{D}.set('overlay',null)")
    qs = await pg.evaluate(f"[...Array(12)].map(()=>{D}.makeMathQDbg('fuel')).map(q=>q.q)")
    R.check(all(q.startswith('RIG') for q in qs), 'only this bank: quick puzzles come from the bank', qs[:3])
    qs = await pg.evaluate(f"[...Array(30)].map(()=>{D}.makeMathQDbg('academy')).map(q=>[q.q,!!q.multi])")
    R.check(any(m for _, m in qs), 'Academy questions can be "pick several"')
    await pg.evaluate(f"(()=>{{const d={D};d.openMathDbg('academy');for(let i=0;i<40&&!d.mathQNow.multi;i++){{d.set('overlay',null);d.openMathDbg('academy');}}}})()"); await pg.wait_for_timeout(300)
    labs = await pg.evaluate(f"{D}.btns.map(b=>b.label||'')")
    R.check(any(l.startswith('✔ CHECK') for l in labs), 'a "pick several" question shows ✔ CHECK')
    await pg.evaluate(f"(()=>{{const d={D};for(const b of d.btns.filter(b=>/^\\d\\)  [24]$/.test(b.label)))b.fn();d.btns.find(b=>b.label.startsWith('✔ CHECK')).fn();}})()"); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate(f"{D}.mathQNow.picked==={D}.mathQNow.ans"), 'picking both right answers and ✔ CHECK is marked right')
    await pg.evaluate(f"{D}.set('overlay',null)")
    gq = await pg.evaluate(f"[...Array(10)].map(()=>{D}.raceQ())")
    R.check(all(g['q'].startswith('RIG') and g['src'] == 'Rig bank' and g['opts'][g['ans']] == g['a'] for g in gq), 'race maths gates use the bank (whole-number answers only)', gq[0])
    await test_mode(pg); await pg.evaluate(f"(()=>{{const d={D};d.C.opt.advAge='mid';d.advStartDbg('radio');}})()"); await pg.wait_for_timeout(300)
    sq = await pg.evaluate(f"{D}.adv.def.scenes[1].q.mid")
    R.check(sq.startswith('RIG SLOT'), 'an adventure slot uses the bank question meant for it', sq[:60])
    await pg.evaluate(f"(()=>{{const d={D};if(d.adv){{d.set('overlay','menu');const b=d.btns.find(b=>b.label&&b.label.includes('ABANDON'));b&&b.fn();}}d.set('overlay',null);d.testExit();}})()")
    await pg.evaluate("window.stats.pilot.band='adult'")
    lv = await pg.evaluate("StarlaneBanks.pick('quick','adult')")
    R.check(lv is None, 'nothing at the pilot’s level: the bank gives way to the built-in questions')
    R.check('has none for Adult' in await pg.evaluate("StarlaneBanks.describe().text"), '… and says so where it shows the questions in use')
    await pg.evaluate("window.stats.pilot.band='9-10'")
    got = await pg.evaluate("[...Array(80)].map(()=>(StarlaneBanks.pick('quick','young')||{}).q||'')")
    R.check(any(q.startswith('AGE910') for q in got) and not any(q.startswith('AGE78') for q in got), 'a pilot aged 9–10 gets the bank’s 9–10 questions, not its 7–8 ones', sorted(set(got))[:5])
    await pg.evaluate("window.stats.pilot.band='x-iseb'")
    got = await pg.evaluate("[...Array(80)].map(()=>(StarlaneBanks.pick('quick','mid')||{}).q||'')")
    R.check(got and all(q.startswith('RIG') for q in got), 'an ISEB exam-practice pilot gets the bank’s 11–12 questions', sorted(set(got))[:5])
    await pg.evaluate("window.stats.pilot.band='11-12'")
    await pg.evaluate(f"StarlaneBanks.setPilot('p1','{bid}','mixed')")
    src = await pg.evaluate("[...Array(200)].map(()=>!!StarlaneBanks.pick('quick','mid'))")
    R.check(40 < sum(src) < 160, 'mixed: about half the questions come from the bank', sum(src))
    await pg.evaluate("window.StarlaneSite.hosted=true")
    R.check(await pg.evaluate("StarlaneBanks.active()") is None, 'inside ApolloMaths the banks are never used')
    await pg.evaluate("window.StarlaneSite.hosted=false")
    # 5. pilots on this device keep their own settings
    await pg.goto(f'{serve()}/Starlane/index.html'); await pg.wait_for_timeout(600)
    say['prompt'] = 'Ben'
    await pg.click('#pilotNew'); await pg.wait_for_timeout(1200)
    r = await pg.evaluate("[document.getElementById('pilotName').value,StarlanePilots.cur,StarlaneBanks.active()]")
    R.check(r[0] == 'Ben' and r[1] != 'p1' and r[2] is None, 'a new pilot has their own name and starts on built-in questions', r[:2])
    line = await pg.inner_text('#pilotBank')
    R.check(line == '📚 Questions: built-in', 'the launch page says a pilot without a bank uses the built-in questions', line)
    # 6. own password, then forgot
    await pg.goto(f'{serve()}/Starlane/banks.html'); await pg.wait_for_timeout(500)
    if not await pg.evaluate("!document.getElementById('bkMain').hidden"): await unlock_page(pg, CODE)
    await pg.fill('#bkPw1', 'family-pass-1'); await pg.fill('#bkPw2', 'family-pass-1'); await pg.click('#bkPwSet'); await until(pg, "/Saved/.test(document.getElementById('bkPwMsg').textContent)", 10000)
    await pg.evaluate("sessionStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(600)
    R.check(not await unlock_page(pg, CODE), 'after a family sets its own password, the starter no longer opens the page on that device')
    R.check(await unlock_page(pg, 'family-pass-1'), '… and their own password does')
    await pg.evaluate(f"StarlaneBanks.setPilot('p1','{bid}','only')")
    await pg.evaluate("sessionStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(600)
    say['prompt'] = CODE
    await pg.click('#bkForgot'); await until(pg, "!document.getElementById('bkMain').hidden", 10000)
    r = await pg.evaluate("[StarlaneAdmin.mode(),StarlaneBanks.pilotSetting('p1').mode,StarlaneBanks.list().length>0]")
    R.check(r == ['starter', 'builtin', True], 'forgot password (with the starter): own password removed, every pilot back on built-in, banks kept', r)
    # 7. Gemini, answered by a stand-in for Google's server; the second opinion disagrees with one answer
    calls = []
    async def fake(route):
        req = route.request; body = json.loads(req.post_data or '{}'); calls.append({'key': req.headers.get('x-goog-api-key'), 'url': req.url, 'text': body['contents'][0]['parts'][0]['text'][:80]})
        if len(calls) == 1:
            out = {'starlane_bank': 1, 'name': 'Gemini fractions', 'questions': [
                {'type': 'one', 'level': 'mid', 'moments': ['quick'], 'q': 'What is half of 10?', 'options': ['4', '5', '6'], 'answer': 1, 'explain': '10 ÷ 2 = 5.'},
                {'type': 'one', 'level': 'mid', 'moments': ['quick'], 'q': 'What is a quarter of 20?', 'options': ['5', '4', '10'], 'answer': 0, 'explain': '20 ÷ 4 = 5.'},
                {'type': 'number', 'level': 'mid', 'moments': ['quick'], 'q': 'What is 3 quarters of 8?', 'answer': 5, 'explain': 'Deliberately wrong for the test.'}]}
        else:
            out = {'answers': [{'n': 0, 'answer': 1}, {'n': 1, 'answer': 0}, {'n': 2, 'answer': 6}]}
        await route.fulfill(status=200, content_type='application/json', body=json.dumps({'candidates': [{'content': {'parts': [{'text': json.dumps(out)}]}}]}))
    await pg.route('https://generativelanguage.googleapis.com/**', fake)
    await pg.fill('#gTopic', 'Fractions'); await pg.fill('#gKey', 'TEST-KEY-123'); await pg.click('#gGo')
    await until(pg, "/added|✕/.test(document.getElementById('gMsg').textContent)", 15000)
    msg = await pg.inner_text('#gMsg'); b = await pg.evaluate("StarlaneBanks.list().find(b=>b.name==='Gemini fractions')")
    R.check(bool(b) and len(b['questions']) == 2 and b['second'] == {'agreed': 2, 'dropped': 1} and b['source'] == 'gemini', 'Gemini: the bank is made, checked, and the second opinion drops the answer it disagrees with', msg)
    R.check(len(calls) == 2 and all(c['key'] == 'TEST-KEY-123' and 'key=' not in c['url'] for c in calls), 'Gemini: the key goes only to Google, in a header (not in the address)', calls)
    R.check('Solve each question yourself' in calls[1]['text'], 'Gemini: the second request asks for the answers without showing them')
    kit = await pg.evaluate("StarlaneBanksPage.buildPrompt({topic:'Volcanoes',level:'13-14',count:10,moments:['quick','academy']})")
    R.check('Volcanoes' in kit and '"starlane_bank": 1' in kit and 'several' in kit and 'Apollo' in kit, 'the bank kit prompt includes the topic, the contract and the rules')
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all()
    return R

if __name__ == '__main__': run(main)
