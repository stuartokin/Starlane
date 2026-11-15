"""Flight display and menus: the battle display (automatic under attack, F3, always on/off, choosing what it
shows, first-time tip), the Controls page (every fixed key listed, Reset all keys, key changes survive test
mode), Pause in test mode (back to the test screen / cheat page), the touch-screen full cockpit switch, and
no sideways scrolling or page errors on a phone and an open Fold with the battle display on."""
from rig import *

D = "Arcade._game()._dbg"

async def flying(pg):
    await pg.evaluate(f"{D}.launchDbg&&{D}.launchDbg()")
    return bool(await until(pg, f"{D}.mode==='flight'", 20000))

async def attack(pg):
    """Pirates after you: the safe zone off for this practice copy, then a few arrival ticks."""
    await pg.evaluate(f"(()=>{{const d={D};d.test.ch=Object.assign({{}},d.CHD,{{safeKm:0,pack:3,pirateRate:400}});d.set('overlay',null);}})()")
    await pg.wait_for_timeout(400)
    await pg.evaluate(f"(()=>{{const d={D};for(let i=0;i<6;i++)d.spawnTick(100);}})()")
    await pg.wait_for_timeout(600)

async def main(p):
    R = Result('display')
    pg = await browser(p, 1280, 800); await open_site(pg); await register(pg); await launch_game(pg)
    R.check(await flying(pg), 'flies')
    R.check(await pg.evaluate(f"{D}.C.opt.battle===undefined&&!{D}.bdOn()"), 'battle display: off while nobody is attacking (Automatic by default)')
    await test_mode(pg); await attack(pg)
    R.check(await pg.evaluate(f"{D}.underAttack()&&{D}.bdOn()"), 'battle display: comes on by itself under attack')
    R.check(await pg.evaluate(f"{D}.C.opt.bTip===true"), 'battle display: the first time, Nova says it can be changed in settings')
    shown = await pg.evaluate(f"{D}.BD_ITEMS.filter(x=>x[2]).map(x=>x[0])")
    R.check(shown == ['radar', 'speed', 'shields', 'energy', 'heat', 'missiles', 'target', 'escape'], 'battle display: shows the agreed instruments by default', shown)
    await pg.keyboard.press('F3'); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"!{D}.bdOn()&&{D}.bdForce==='off'"), 'F3 switches it off during a fight')
    await pg.keyboard.press('F3'); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"{D}.bdOn()"), 'F3 switches it back on')
    await pg.evaluate(f"(()=>{{const d={D};d.C.opt.battle='off';d.bdToggle();d.bdToggle();}})()")
    await pg.evaluate(f"{D}.set('overlay','menu');{D}.set('menuTab','battle')"); await pg.wait_for_timeout(300)
    await pg.evaluate(f"{D}.btns.find(b=>b.label==='OFF').fn()"); await pg.evaluate(f"{D}.btns.find(b=>b.label&&b.label.includes('Fuel')).fn()")
    R.check(await pg.evaluate(f"{D}.C.opt.battle==='off'&&{D}.C.opt.bShow.fuel===true"), 'Pause → Display → Battle display: choose when and what it shows')
    await pg.evaluate(f"{D}.set('overlay',null)"); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"!{D}.bdOn()"), 'set to OFF: it stays off even under attack')
    await pg.evaluate(f"{D}.btns.find(b=>b.label&&b.label.startsWith('⚔ BATTLE')).fn()"); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate(f"{D}.bdOn()"), 'the ⚔ BATTLE button switches it on by hand')
    # Controls page
    await pg.evaluate(f"{D}.set('overlay','menu');{D}.set('menuTab','controls')"); await pg.wait_for_timeout(300)
    await pg.evaluate(f"{D}.C.opt.keys.missile=['z']")
    await pg.evaluate(f"{D}.btns.find(b=>b.label==='RESET ALL KEYS').fn()")
    R.check(await pg.evaluate(f"{D}.C.opt.keys.missile") == ['m'], 'Reset all keys puts the keys back')
    await pg.evaluate(f"{D}.C.opt.keys.ecm=['y']")
    # Pause in test mode: back to the test screen
    await pg.evaluate(f"{D}.set('menuTab','main')"); await pg.wait_for_timeout(300)
    b = await pg.evaluate(f"{D}.btns.map(b=>b.label).filter(Boolean)")
    R.check('↩ BACK TO TEST MODE' in b and '⚙ BACK TO THE CHEAT PAGE' not in b, 'Pause in test mode: ↩ Back to test mode (no cheat-page button when started in the game)')
    await pg.evaluate(f"{D}.btns.find(b=>b.label==='↩ BACK TO TEST MODE').fn()")
    R.check(await pg.evaluate(f"{D}.overlay") == 'test', '↩ Back to test mode opens the test screen')
    await pg.evaluate(f"{D}.testExit()"); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"[{D}.C.opt.keys.ecm,{D}.C.opt.battle,{D}.C.opt.bShow&&{D}.C.opt.bShow.fuel]") == [['y'], 'off', True], 'key and display changes made in test mode are kept')
    R.check(not pg.errors, 'no page errors (laptop)', pg.errors[:3]); await pg.close_all()
    # started from the cheat page: Pause offers the way back there
    pg = await browser(p, 1280, 800); await open_site(pg); await register(pg)
    await pg.goto(f'{serve()}/Starlane/cheats.html'); await pg.evaluate("sessionStorage.setItem('starlane-cheats-ok','6f8f905c')"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.click('#chPlay')
    await until(pg, "(()=>{try{return Arcade._game().inTest()}catch(e){return false}})()", 20000); await pg.wait_for_timeout(600)
    await pg.evaluate(f"{D}.set('overlay','menu');{D}.set('menuTab','main')"); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"!!{D}.btns.find(b=>b.label==='⚙ BACK TO THE CHEAT PAGE')"), 'Pause in a practice copy from the cheat page: ⚙ Back to the cheat page')
    await pg.evaluate(f"{D}.btns.find(b=>b.label==='⚙ BACK TO THE CHEAT PAGE').fn()")
    R.check(bool(await until(pg, "location.pathname.endsWith('cheats.html')&&!!document.getElementById('chForm')", 8000)), '… and it goes back there')
    R.check(not pg.errors, 'no page errors (cheat page round trip)', pg.errors[:3]); await pg.close_all()
    # touch screens: full cockpit switch, and the battle display fits
    for w, h, name in ((1100, 880, 'open Fold'), (844, 390, 'phone')):
        pg = await browser(p, w, h, True); await open_site(pg); await register(pg); await launch_game(pg)
        if name == 'open Fold':
            await pg.evaluate(f"{D}.set('overlay','menu');{D}.set('menuTab','display')"); await pg.wait_for_timeout(300)
            lab = await pg.evaluate(f"({D}.btns.find(b=>b.label&&b.label.startsWith('📱'))||{{}}).label")
            await pg.evaluate(f"{D}.btns.find(b=>b.label&&b.label.startsWith('📱')).fn()")
            R.check(lab == '📱 THIS TOUCH SCREEN: SIMPLE COCKPIT' and await pg.evaluate(f"{D}.C.opt.cock3d===true"), 'tablet/Fold: Display → 📱 switches to the full 3D cockpit', lab)
            await pg.evaluate(f"{D}.set('overlay',null)")
        await flying(pg); await test_mode(pg); await attack(pg)
        R.check(await pg.evaluate(f"{D}.bdOn()"), f'{name}: battle display on under attack')
        R.check(await pg.evaluate(f"!!{D}.btns.find(b=>b.label&&b.label.startsWith('⚔ BATTLE'))"), f'{name}: ⚔ BATTLE button to switch it by touch')
        ww = await pg.evaluate("[document.documentElement.scrollWidth,document.documentElement.clientWidth]")
        R.check(ww[0] <= ww[1], f'{name}: no sideways scrolling', ww)
        if os.environ.get('SHOTS'): OUT.mkdir(exist_ok=True); await pg.screenshot(path=str(OUT / f'battle-{w}.png'))
        R.check(not pg.errors, f'no page errors ({name})', pg.errors[:3]); await pg.close_all()
    return R

if __name__ == '__main__': run(main)
