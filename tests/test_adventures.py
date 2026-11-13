"""Every adventure, played scene by scene in test mode, at phone size (844×390) and laptop size (1280×720).
Each scene is drawn for a moment and checked for page errors; optional screenshots go to tests/out/adventures/.
Usage: python test_adventures.py [id,id,...]   (default: all)   ·   SHOTS=1 to save screenshots."""
from rig import *

SIZES = [('phone', 844, 390, True), ('laptop', 1280, 720, False)]
async def main(p):
    R = Result('adventures'); only = [x for x in (sys.argv[1].split(',') if len(sys.argv) > 1 else []) if x]
    shots = os.environ.get('SHOTS') == '1'
    for tag, w, h, mob in SIZES:
        pg = await browser(p, w, h, mob); await open_site(pg); await register(pg, 'Rig Tester', '11-12')
        if not await launch_game(pg): R.check(False, f'[{tag}] game starts'); await pg.close_all(); continue
        R.check(await test_mode(pg), f'[{tag}] test mode opens')
        await pg.evaluate("(()=>{const d=Arcade._game()._dbg;d.set&&d.set('overlay',null);})()")
        ids = only or await pg.evaluate("StarAdv.LIST.map(a=>a.id)")
        bad = []; scenes = 0
        for aid in ids:
            n0 = len(pg.errors)
            await pg.evaluate(f"Arcade._game()._dbg.advStartDbg({json.dumps(aid)})"); await pg.wait_for_timeout(250)
            now = await pg.evaluate("Arcade._game()._dbg.advNow")
            if not now: bad.append(f'{aid}: did not start'); continue
            for k in range(now['n'] + 2):
                cur = await pg.evaluate("Arcade._game()._dbg.advNow")
                if not cur or cur['id'] != aid: break
                await pg.wait_for_timeout(120); scenes += 1
                if shots:
                    (OUT / 'adventures').mkdir(parents=True, exist_ok=True)
                    await pg.screenshot(path=str(OUT / 'adventures' / f'{tag}-{aid}-{cur["si"]}.png'))
                await pg.evaluate("Arcade._game()._dbg.advNextDbg()")
            await pg.wait_for_timeout(150)
            await pg.evaluate("(()=>{const d=Arcade._game()._dbg;if(d.advNow){}d.set&&d.set('overlay',null);})()")
            if len(pg.errors) > n0: bad.append(f'{aid}: {pg.errors[n0][:120]}')
        R.check(not bad, f'[{tag}] {len(ids)} adventures play through ({scenes} scenes)', bad[:4])
        await pg.close_all()
    return R

if __name__ == '__main__': run(main)
