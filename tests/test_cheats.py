"""The cheat page (cheats.html): locked by the test code, builds its form, saves as you go, fits a phone,
and the game really uses the settings — in a practice copy (real commander untouched) and when applied
to the real commander (kept with the save until removed). Also the emergency escape and the safe zones."""
from rig import *

D = "Arcade._game()._dbg"
UNLOCK = unlock_js()   # needs STARLANE_CODE: the unlock marker can only be made from the real code

async def open_page(pg, unlock=True):
    await pg.goto(f'{serve()}/Starlane/cheats.html')
    if unlock: await pg.evaluate(UNLOCK); await pg.reload(); await until(pg, "!document.getElementById('chMain').hidden", 8000)
    await pg.wait_for_timeout(400)

async def to_flight(pg):
    await pg.evaluate(f"{D}.launchDbg&&{D}.launchDbg()")
    return bool(await until(pg, f"{D}.mode==='flight'", 20000))

async def main(p):
    R = Result('cheats')
    pg = await browser(p, 1280, 800); pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await open_site(pg); await register(pg, 'Rig Tester')
    # 1. locked until the code is given
    await open_page(pg, unlock=False)
    R.check(await pg.evaluate("document.getElementById('chMain').hidden&&!document.getElementById('chLock').hidden"), 'page is locked until the test code is entered')
    await pg.fill('#chCode', '0000'); await pg.click('#chLockForm button'); await until(pg, "/Not quite/.test(document.getElementById('chLockMsg').textContent)", 8000)
    R.check('Not quite' in await pg.inner_text('#chLockMsg') and await pg.evaluate("document.getElementById('chMain').hidden"), 'a wrong code keeps it locked')
    code = os.environ.get('STARLANE_CODE')
    if code:
        await pg.fill('#chCode', code); await pg.click('#chLockForm button'); await until(pg, "!document.getElementById('chMain').hidden", 8000)
        R.check(not await pg.evaluate("document.getElementById('chMain').hidden"), 'the real code unlocks it')
        k = await pg.evaluate("sessionStorage.getItem('starlane-cheats-ok')")
        R.check(bool(k) and len(k) == 64 and k not in open(STARLANE / 'js' / 'lock.js').read(), 'the unlocked marker is made from the code, not copied from the repo')
        await pg.evaluate("sessionStorage.setItem('starlane-cheats-ok','0'.repeat(64))"); await pg.reload(); await pg.wait_for_timeout(1500)
        R.check(await pg.evaluate("document.getElementById('chMain').hidden"), 'a made-up marker does not unlock it')
    else:
        R.skip('the real code unlocks it', 'set STARLANE_CODE')
        R.skip('cheat page settings, Play and Apply', 'set STARLANE_CODE: the cheat page can only be unlocked with the real code')
        await pg.close_all(); return R
    # 2. the form and saving
    await open_page(pg)
    n = await pg.evaluate("[document.querySelectorAll('[data-k]').length, STARLANE_CHEAT_DEFS.rules.flatMap(g=>g.items).length]")
    R.check(n[0] == n[1] and n[0] >= 30, 'every rule has a control', n)
    R.check(await pg.evaluate("[...document.querySelectorAll('.ch-group')].every(d=>!d.open)"), 'every section starts collapsed')
    R.check(await pg.evaluate("!!document.getElementById('chBack')&&!!document.getElementById('chBackTop')"), 'there is a way back to Starlane')
    await pg.evaluate("(()=>{const r=document.getElementById('r_maxShips');r.value=3;r.dispatchEvent(new Event('input'));})()")
    saved = await pg.evaluate("JSON.parse(localStorage.getItem('starlane-cheats-v1'))")
    R.check(saved and saved['rules']['maxShips'] == 3, 'moving a slider saves on this device', saved and saved['rules'].get('maxShips'))
    await pg.click("#chPresets button:has-text('Swarm')"); await pg.wait_for_timeout(200)
    saved = await pg.evaluate("JSON.parse(localStorage.getItem('starlane-cheats-v1'))")
    R.check(saved['rules']['escape'] is True, 'Swarm also switches the emergency escape on')
    R.check(saved['rules']['maxShips'] == 16 and saved['rules']['pack'] == 5, 'a preset sets and saves its rules', {k: saved['rules'][k] for k in ('maxShips', 'pack', 'misAtk')})
    R.check('changed from normal' in await pg.inner_text('#chCount'), 'the page counts the changes', await pg.inner_text('#chCount'))
    # share link round trip
    link = await pg.evaluate("location.origin+location.pathname+'#s='+btoa(unescape(encodeURIComponent(JSON.stringify({name:'Link test',rules:{vorn:7},form:{}})))).replace(/=+$/,'')")
    await pg.goto(link); await pg.reload(); await pg.wait_for_timeout(500)
    saved = await pg.evaluate("JSON.parse(localStorage.getItem('starlane-cheats-v1'))")
    R.check(saved['rules']['vorn'] == 7 and saved['name'] == 'Link test', 'a 🔗 link loads its settings', saved['name'])
    # 3. practice copy: settings on, real commander untouched
    await pg.evaluate("""localStorage.setItem('starlane-cheats-v1',JSON.stringify({v:1,name:'Rig',rules:Object.assign(STARLANE_CHEAT_DEFS.defaults(),{maxShips:0,safeKm:0,weapKm:0,escape:true,escWait:30,infMissiles:true}),form:{credits:'77777',missiles:'4'}}))""")
    await pg.reload(); await pg.wait_for_timeout(400); await pg.click('#chPlay')
    R.check(bool(await until(pg, "(()=>{try{return Arcade._game().inTest()&&Arcade._game()._dbg.CH('maxShips')===0}catch(e){return false}})()", 20000)), '▶ Play opens a practice copy with the settings on')
    R.check(await pg.evaluate(f"{D}.C.credits") == 77777, 'commander changes are made in the practice copy')
    R.check(await pg.evaluate(f"!{D}.C.cheats&&JSON.parse({D}.test.real.C).credits!==77777"), 'the real commander is untouched')
    R.check(await pg.evaluate("location.search") == '', 'the ?cheats= hand-off is removed from the address')
    R.check(await to_flight(pg), 'practice copy flies')
    await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"{D}.SAFE") == 0, 'safe-zone distance follows the setting', await pg.evaluate(f"{D}.SAFE"))
    R.check(await pg.evaluate(f"{D}.weaponsSafe()") is False, 'weapons-safe distance follows the setting (0 km: never held)')
    cnt = await pg.evaluate(f"(()=>{{const d={D};for(let i=0;i<60;i++)d.spawnTick(100);return d.ships.filter(x=>!x.dead&&['pirate','trader','police','alien'].includes(x.T.role)).length;}})()")
    R.check(cnt == 0, 'most ships at once = 0: nothing arrives', cnt)
    await pg.evaluate(f"(()=>{{const t={D}.test;t.ch.maxShips=20;t.ch.pirateRate=400;t.ch.pack=4;t.ch.police=false;}})()")
    cnt = await pg.evaluate(f"(()=>{{const d={D};for(let i=0;i<80&&d.ships.filter(x=>!x.dead&&x.T.role==='pirate'&&x.target==='player').length<4;i++)d.spawnTick(100);return [d.ships.filter(x=>!x.dead&&x.T.role==='pirate'&&x.target==='player').length,d.ships.filter(x=>!x.dead&&x.T.role==='police').length];}})()")
    R.check(cnt[0] >= 4 and cnt[1] == 0, 'more, bigger pirate attacks and no police', cnt)
    await pg.evaluate(f"(()=>{{const t={D}.test;t.ch.peace=true;{D}.ships.length=0;}})()")
    cnt = await pg.evaluate(f"(()=>{{const d={D};for(let i=0;i<40;i++)d.spawnTick(100);return d.ships.filter(x=>!x.dead&&x.target==='player').length;}})()")
    R.check(cnt == 0, 'no random attacks: no attackers arrive', cnt)
    # emergency escape
    r = await pg.evaluate(f"(()=>{{const d={D};d.ships.forEach(s=>{{if(s.target==='player')s.lostT=0;}});return d.escapeNow();}})()")
    await pg.wait_for_timeout(1200)
    sp = await pg.evaluate(f"[{D}.P.speed,{D}.P.max,{D}.escT>0,{D}.escCD>20]")
    R.check(r is True and sp[2] and sp[0] > sp[1] * 2, 'emergency escape: a big burst of speed', sp)
    R.check(await pg.evaluate(f"{D}.ships.filter(s=>!s.dead&&s.target==='player').every(s=>s.lostT>0)"), 'emergency escape: attackers lose you')
    R.check(await pg.evaluate(f"{D}.escapeNow()") is False, 'emergency escape waits before it can be used again')
    # the test-mode ✨ CHEATS tab can switch the escape on without the cheat page
    await pg.evaluate(f"{D}.test.ch=null"); await pg.evaluate("Arcade._game().testMode()"); await pg.wait_for_timeout(200)
    await pg.evaluate(f"{D}.btns.find(b=>b.label==='✨ CHEATS').fn()"); await pg.wait_for_timeout(200)
    await pg.evaluate(f"{D}.btns.find(b=>b.label&&b.label.startsWith('🚀 Emergency escape')).fn()"); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate(f"{D}.CH('escape')") is True, 'test mode ✨ CHEATS: the escape switch turns it on')
    await pg.evaluate(f"{D}.set('overlay',null)"); await pg.wait_for_timeout(300)
    # nobody about: clear the sky and keep new arrivals away while the 10 s "recently hit" window runs out
    await pg.evaluate(f"(()=>{{const d={D};d.test.ch.peace=true;d.ships.forEach(s=>{{s.dead=true;}});}})()"); await pg.wait_for_timeout(11000)
    R.check(await pg.evaluate(f"!{D}.underAttack()&&!{D}.allBtns.find(b=>b.label&&b.label.startsWith('🚀'))"), 'the 🚀 ESCAPE button is hidden when nobody is attacking')
    await pg.evaluate(f"{D}.hurtDbg(1)"); await pg.wait_for_timeout(400)
    R.check(await pg.evaluate(f"!!{D}.allBtns.find(b=>b.label&&b.label.startsWith('🚀'))"), 'the 🚀 ESCAPE button shows when you are attacked')
    # leave test mode: normal rules again
    await pg.evaluate(f"{D}.testExit()"); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"[{D}.CH('maxShips'),{D}.CH('escape'),{D}.C.credits!==77777]") == [6, False, True], 'leaving test mode puts the normal game back')
    # 4. apply to the real commander, kept with the save
    await open_page(pg)
    await pg.evaluate("""localStorage.setItem('starlane-cheats-v1',JSON.stringify({v:1,name:'Rig',rules:Object.assign(STARLANE_CHEAT_DEFS.defaults(),{freeShop:true,rewardScale:300,enemyDmg:50}),form:{credits:'123456',ship:'falcon',front:'military',setEquip:true,equip:['ecm','dock']}}))""")
    await pg.reload(); await pg.wait_for_timeout(400); await pg.click('#chApply')
    R.check(bool(await until(pg, "(()=>{try{return !!Arcade._game()._dbg.C.cheats}catch(e){return false}})()", 20000)), '✅ Apply puts the rules on the real commander')
    c = await pg.evaluate(f"(()=>{{const C={D}.C;return [C.credits,C.ship,C.front,!!C.equip.ecm&&!!C.equip.dock,Arcade._game().inTest()];}})()")
    R.check(c == [123456, 'falcon', 'military', True, False], 'commander changes made to the real commander', c)
    await pg.evaluate(f"{D}.persistNow?{D}.persistNow():{D}.persist()"); await pg.wait_for_timeout(300)
    saved = await pg.evaluate("(()=>{const s=JSON.parse(localStorage.getItem('starlane-standalone-v1')).arcade.saves.starlane;return s&&s.cheats||null;})()")
    R.check(bool(saved) and saved.get('freeShop') is True and 'maxShips' not in saved, 'only the changed rules are saved with the commander', saved)
    await open_site(pg, fresh=False); await launch_game(pg)
    R.check(await pg.evaluate(f"[{D}.CH('freeShop'),{D}.CH('rewardScale'),{D}.CH('maxShips')]") == [True, 300, 6], 'the rules are still on after a reload')
    # removing them, from test mode (as a parent would)
    await test_mode(pg); await pg.evaluate(f"{D}.cheatClearReal();{D}.testExit()"); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"!{D}.C.cheats&&{D}.CH('freeShop')===false"), '🧹 Remove custom rules puts the normal rules back')
    # 5. without the page being unlocked in this tab, ?cheats=apply does nothing
    await pg.evaluate("sessionStorage.clear()"); await pg.goto(f'{serve()}/Starlane/?cheats=apply'); await pg.wait_for_timeout(1500)
    R.check(await pg.evaluate("!(Arcade.status&&Arcade.status().view==='game')"), 'the hand-off needs the unlocked page (no code, no cheats)')
    R.check(not pg.errors, 'no page errors (laptop)', pg.errors[:3]); await pg.close_all()
    # 6. phones: the page fits (folded Fold and a small phone)
    for w, h, name in ((344, 882, 'Fold folded'), (390, 844, 'phone')):
        pg = await browser(p, w, h, True); await open_page(pg)
        ww = await pg.evaluate("[document.documentElement.scrollWidth,document.documentElement.clientWidth]")
        R.check(ww[0] <= ww[1], f'{name}: no sideways scrolling', ww)
        if os.environ.get('SHOTS'): OUT.mkdir(exist_ok=True); await pg.screenshot(path=str(OUT / f'cheats-{w}.png'), full_page=True)
        R.check(not pg.errors, f'no page errors ({name})', pg.errors[:3]); await pg.close_all()
    return R

if __name__ == '__main__': run(main)
