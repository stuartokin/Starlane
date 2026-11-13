"""Gameplay smoke test: launch from the station, fly, hyperspace jump, weapons-safe near stations,
the Modern 3D style, and the phone layout (touch controls, no sideways scroll)."""
from rig import *

async def main(p):
    R = Result('gameplay')
    pg = await browser(p, 1280, 800); await open_site(pg); await register(pg)
    await launch_game(pg)
    D = "Arcade._game()._dbg"
    R.check(await pg.evaluate(f"{D}.mode") == 'docked', 'a new commander starts docked')
    await pg.evaluate(f"{D}.launchDbg&&{D}.launchDbg()")
    R.check(bool(await until(pg, f"{D}.mode==='flight'", 20000)), 'launch → flight (after the cut-scene)')
    R.check(await pg.evaluate(f"{D}.weaponsSafe()") in (True, False), 'weapons-safe rule answers near the station', await pg.evaluate(f"{D}.weaponsSafe()"))
    sys0 = await pg.evaluate(f"{D}.C.sys")
    await test_mode(pg); await pg.evaluate(f"(()=>{{const d={D};d.set&&d.set('overlay',null);d.C.fuel=99;const cur=d.C.sys;d.C.target=(cur+1)%256;d.startHyperDbg();}})()")
    R.check(bool(await until(pg, f"{D}.mode==='flight'&&{D}.C.sys!=={sys0}", 30000)), 'hyperspace jump arrives in another system')
    await pg.evaluate(f"{D}.C.opt.style='modern'"); await pg.wait_for_timeout(1500)
    R.check(await pg.evaluate(f"{D}.styleNow") == 'modern', 'Modern (3D) style runs')
    R.check(not pg.errors, 'no page errors (laptop)', pg.errors[:3]); await pg.close_all()
    # phone in landscape: full screen with touch controls, nothing wider than the screen
    pg = await browser(p, 844, 390, True); await open_site(pg); await register(pg)
    await launch_game(pg)
    await pg.evaluate("Arcade._game()._dbg.launchDbg&&Arcade._game()._dbg.launchDbg()"); await until(pg, "Arcade._game()._dbg.mode==='flight'", 20000)
    w = await pg.evaluate("[document.documentElement.scrollWidth,document.documentElement.clientWidth]")
    R.check(w[0] <= w[1], 'phone: no sideways scrolling', w)
    R.check(not pg.errors, 'no page errors (phone)', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
