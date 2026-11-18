"""Test mode's own screen: every button either keeps you on the test screen, or is marked ▶ (it starts play and
closes the screen). PLACES moves the practice copy and stays. Checked on a touch screen at Fold size, with real
taps on the PLACES buttons (they used to throw you back into the game)."""
from rig import *

D = "Arcade._game()._dbg"
TABS = ['scen', 'adv', 'mis', 'cmd', 'eq', 'pl', 'ch']
SKIP = ('▶ PLAY THE TEST GAME', '↩ EXIT TEST MODE', '⚙ Open the cheat page', '◀', '▶')
TABNAMES = ('🎬 SCENARIOS', '🗺 ADVENTURES', '📋 MISSIONS', '👤 COMMANDER', '🔧 EQUIPMENT', '🌍 PLACES', '✨ CHEATS')

async def reset(pg, tab):
    await pg.evaluate(f"(()=>{{const d={D};if(d.show)d.stopShow();if(d.test)d.testExit();}})()")
    await until(pg, f"['docked','flight'].includes({D}.mode)", 15000)
    await pg.evaluate(f"(()=>{{Arcade._game().testMode();{D}.setTestTab('{tab}');}})()"); await pg.wait_for_timeout(120)

async def tap(pg, b):
    xy = await pg.evaluate(f"(()=>{{const cv=document.getElementById('arcCanvas'),r=cv.getBoundingClientRect();return [r.left+{b['x']+b['w']/2}*r.width/800,r.top+{b['y']+b['h']/2}*r.height/600];}})()")
    await pg.touchscreen.tap(*xy); await pg.wait_for_timeout(250)

async def main(p):
    R = Result('testmenu')
    pg = await browser(p, 1000, 700, mobile=True)
    await open_site(pg); await register(pg); await launch_game(pg)
    R.check(await test_mode(pg), 'test mode opens')
    bad, n = [], 0
    for tab in TABS:
        await reset(pg, tab)
        btns = await pg.evaluate(f"{D}.btns.map(b=>({{label:b.label,go:!!b.go}}))")
        for b in btns:
            lab = b['label']
            if lab in SKIP or lab in TABNAMES: continue
            await reset(pg, tab)
            if not await pg.evaluate(f"!!{D}.btns.find(b=>b.label==={json.dumps(lab)})"): bad.append(f'{tab}: {lab} (missing)'); continue
            await pg.evaluate(f"{D}.btns.find(b=>b.label==={json.dumps(lab)}).fn()"); await pg.wait_for_timeout(150)
            left = await pg.evaluate(f"{D}.overlay!=='test'"); n += 1
            if left != b['go']: bad.append(f"{tab}: {lab} ({'leaves' if left else 'stays'}, but {'marked' if b['go'] else 'not marked'} ▶)")
    R.check(not bad and n > 100, f'every test-screen button stays, or is marked ▶ and starts play ({n} buttons)', bad[:8])
    # PLACES with real taps: the practice copy moves and the test screen stays
    for lab in ('3', '🔁 Random system'):
        await reset(pg, 'pl')
        b = await pg.evaluate(f"{D}.btns.find(b=>b.label==={json.dumps(lab)})"); before = await pg.evaluate(f"[{D}.C.gx||0,{D}.C.sys]")
        await tap(pg, b)
        st = await pg.evaluate(f"[{D}.overlay,{D}.mode,{D}.C.gx||0,{D}.C.sys,!!{D}.test]")
        R.check(st[0] == 'test' and st[1] == 'docked' and st[4] and [st[2], st[3]] != before, f'PLACES "{lab}" (tapped): moves the practice copy and stays on the test screen', st)
    # ▶ PLAY THE TEST GAME then shows the new place
    b = await pg.evaluate(f"{D}.btns.find(b=>b.label==='▶ PLAY THE TEST GAME')"); await tap(pg, b)
    R.check(await pg.evaluate(f"{D}.overlay===null&&{D}.mode==='docked'&&!!{D}.test"), '▶ PLAY THE TEST GAME closes the test screen')
    await pg.evaluate(f"{D}.testExit()")
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all()
    return R

if __name__ == '__main__': run(main)
