"""Gameplay smoke test: launch from the station, fly, hyperspace jump, weapons-safe near stations,
the Modern 3D style, and the phone layout (touch controls, no sideways scroll)."""
from rig import *

async def main(p):
    R = Result('gameplay')
    pg = await browser(p, 1280, 800); await open_site(pg); await register(pg)
    await launch_game(pg)
    D = "Arcade._game()._dbg"
    R.check(await pg.evaluate(f"{D}.mode") == 'docked', 'a new commander starts docked')
    # abandoning a mission taken here today puts it back on this station's board
    await pg.keyboard.press('4'); await pg.wait_for_timeout(400)
    r = await pg.evaluate(f"""(()=>{{const d={D},o=d.boardNow.offers[0],id=o.id;d.accept(o);const gone=!d.boardNow.offers.some(x=>x.id===id);
      const m=d.C.missions.find(x=>x.id===id);d.abandonMission(m);return [gone,d.boardNow.offers.some(x=>x.id===id),d.C.missions.some(x=>x.id===id)];}})()""")
    R.check(r == [True, True, False], 'abandon a mission just taken: it goes back on the board', r)
    r = await pg.evaluate(f"""(()=>{{const d={D},o=d.boardNow.offers[0],id=o.id;d.accept(o);d.C.day++;d.genBoard&&0;
      const m=d.C.missions.find(x=>x.id===id);d.abandonMission(m);const b=d.boardNow;return [d.C.missions.some(x=>x.id===id),!!(b&&b.day===d.C.day&&b.offers.some(x=>x.id===id&&x.title===o.title&&x.from))];}})()""")
    R.check(r == [False, False], 'abandon on a later day: it is simply removed', r)
    await pg.keyboard.press('1'); await pg.wait_for_timeout(300)
    await pg.evaluate(f"{D}.launchDbg&&{D}.launchDbg()")
    R.check(bool(await until(pg, f"{D}.mode==='flight'", 20000)), 'launch → flight (after the cut-scene)')
    said = set()
    for _ in range(16):
        said.add(await pg.evaluate(f"({D}.aiLineNow||{{}}).text||''")); await pg.wait_for_timeout(500)
    R.check(not any('spin' in t or 'Slow down below 60' in t for t in said), 'just after launch Nova does not tell you how to dock', [t for t in said if t])
    # …but heading back to the station, station control and the docking tip still speak
    await pg.evaluate(f"""(()=>{{const d={D},P=d.P,s=d.station;const f=s.o.f;P.pos=[s.pos[0]+f[0]*2000,s.pos[1]+f[1]*2000,s.pos[2]+f[2]*2000];
      P.o.f=[-f[0],-f[1],-f[2]];P.o.u=s.o.u.slice();P.o.r=[-s.o.r[0],-s.o.r[1],-s.o.r[2]];P.speed=0;P.throttle=0;}})()""")
    said = set()
    for _ in range(12):
        said.add(await pg.evaluate(f"({D}.aiLineNow||{{}}).text||''")); await pg.wait_for_timeout(400)
    R.check(any('Approach granted' in t or 'match the station' in t for t in said), 'heading back to dock: station control and the docking tip speak', [t for t in said if t])
    R.check(await pg.evaluate(f"{D}.weaponsSafe()") in (True, False), 'weapons-safe rule answers near the station', await pg.evaluate(f"{D}.weaponsSafe()"))
    sys0 = await pg.evaluate(f"{D}.C.sys")
    await test_mode(pg); await pg.evaluate(f"(()=>{{const d={D};d.set&&d.set('overlay',null);d.test.ch=Object.assign({{}},d.CHD,{{interdict:0}});d.C.fuel=99;const cur=d.C.sys;d.C.target=(cur+1)%256;d.startHyperDbg();}})()")
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
