"""Training tours (🙋 HAVE A GO and watch mode): every tour plays to the end with no step timing out, on a laptop (keyboard) and on a Fold-sized
touch screen. On touch screens Nova must talk about taps and buttons, never keys or the mouse, and the keyboard
picture is replaced by the touch panel. Guided flight's touch wording matches the layout in use.
(Speech is skipped with _dbg.tourQuick so the run is quick; the flying is real time.)"""
from rig import *

D = "Arcade._game()._dbg"
DEV = {'laptop': (1280, 800, False), 'fold': (1000, 700, True)}
import re
KEYWORDS = re.compile(r"(?i:\bpress\b|\barrow|\bmouse\b|\bclick|\bnumber keys)|\bhold [A-Z]\b|\bEnter\b|\bShift\b|\bEscape\b|\bTab switches")

async def one(p, tid, dev, sem, res):
    async with sem:
        w, h, m = DEV[dev]; pg = await browser(p, w, h, mobile=m)
        try:
            await open_site(pg); await register(pg); await launch_game(pg)
            await until(pg, f"{D}.mode==='docked'", 20000)
            if m: await pg.touchscreen.tap(w // 2, h // 2); await pg.wait_for_timeout(200)
            else: await pg.evaluate(f"(()=>{{const d={D};d.C.opt.style='retro';}})()")
            if m:   # 🙋 HAVE A GO on: every turn offered to the player is handed back with 👀 SHOW ME
                await pg.evaluate(f"(()=>{{const d={D};d.C.opt.tourTry=true;window.__turns=0;setInterval(()=>{{if(d.youNow){{window.__turns++;d.showMe();}}}},250);}})()")
            else: await pg.evaluate(f"{D}.C.opt.tourTry=false")   # watch mode: Nova does everything
            await pg.evaluate(f"{D}.tourQuick(true);{D}.tourStart('{tid}')")
            await until(pg, f"(()=>{{const t={D}.tour;return t&&t.done}})()", 300000, 500)
            r = await pg.evaluate(f"(()=>{{const t={D}.tour;return t?{{done:t.done,log:t.log,said:t.said,n:t.def.steps.length,turns:window.__turns||0}}:null}})()")
            res[(tid, dev)] = (r, pg.errors[:2])
        except Exception as e: res[(tid, dev)] = (None, [str(e)[:200]])
        await pg.close_all()

async def step_is(pg, i, timeout=30000):
    return bool(await until(pg, f"(()=>{{const t={D}.tour;return t&&t.i>={i}}})()", timeout, 200))

async def player(p, R):
    """🙋 HAVE A GO with real input: the step waits for the player, then moves on when they do it."""
    # laptop, keyboard and mouse
    pg = await browser(p, 1280, 800); await open_site(pg); await register(pg); await launch_game(pg)
    await until(pg, f"{D}.mode==='docked'", 20000)
    await pg.evaluate(f"(()=>{{const d={D};d.C.opt.style='retro';d.C.opt.tourTry=true;d.tourQuick(true);d.tourStart('trade');}})()")
    await pg.wait_for_timeout(2500)
    R.check(await pg.evaluate(f"{D}.youNow&&{D}.tour.i===0"), 'have a go: the first market step waits for the player')
    labs = await pg.evaluate(f"{D}.btns.map(b=>b.label||'')")
    R.check('👀 SHOW ME' in labs, 'have a go: the tour panel offers 👀 SHOW ME')
    await pg.keyboard.press('ArrowDown')
    R.check(await step_is(pg, 1), 'have a go: pressing ↓ in the market completes "choose a product"')
    await pg.wait_for_timeout(1200); await pg.keyboard.press('ArrowRight')
    R.check(await step_is(pg, 2), 'have a go: pressing → buys a tonne and completes the step', await pg.evaluate(f"{D}.tour.log"))
    R.check(await step_is(pg, 3), 'have a go: a step with nothing to do just moves on')
    await pg.wait_for_timeout(13500)
    R.check(await pg.evaluate(f"{D}.youNow&&{D}.tour.i===3&&/SHOW ME/.test({D}.tour.text||'')"), 'have a go: after a while Nova offers 👀 SHOW ME', await pg.evaluate(f"[{D}.tour.i,{D}.tour.text]"))
    await pg.evaluate(f"{D}.btns.find(b=>b.label==='👀 SHOW ME').fn()"); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"!{D}.youNow&&{D}.tour.i===3"), '👀 SHOW ME hands the step to Nova')
    R.check(await step_is(pg, 4, 30000), '… and Nova finishes it (sells one back)')
    await pg.evaluate(f"{D}.tourEnd()"); await pg.wait_for_timeout(500)
    # flying: launch, speed up, steer, then the jump drive and time
    await pg.evaluate(f"(()=>{{const d={D};d.tourStart('jump');}})()"); await pg.wait_for_timeout(1500)
    await pg.keyboard.press('l')
    R.check(await step_is(pg, 1, 40000), 'have a go: pressing L launches and completes the launch step')
    await until(pg, f"{D}.mode==='flight'", 30000)
    # aim at the planet (the test points the ship; steering is checked in the fly tour below)
    await pg.evaluate(f"(()=>{{const d={D},P=d.P,pl=d.planet;const f=[pl.pos[0]-P.pos[0],pl.pos[1]-P.pos[1],pl.pos[2]-P.pos[2]],l=Math.hypot(...f);P.o.f=f.map(x=>x/l);const u=Math.abs(P.o.f[1])<.9?[0,1,0]:[1,0,0];const r=[u[1]*P.o.f[2]-u[2]*P.o.f[1],u[2]*P.o.f[0]-u[0]*P.o.f[2],u[0]*P.o.f[1]-u[1]*P.o.f[0]],rl=Math.hypot(...r);P.o.r=r.map(x=>x/rl);P.o.u=[P.o.f[1]*P.o.r[2]-P.o.f[2]*P.o.r[1],P.o.f[2]*P.o.r[0]-P.o.f[0]*P.o.r[2],P.o.f[0]*P.o.r[1]-P.o.f[1]*P.o.r[0]];}})()")
    R.check(await step_is(pg, 2), 'have a go: pointing at the planet completes the aim step')
    await pg.wait_for_timeout(1200); await pg.keyboard.press('j')
    R.check(await step_is(pg, 3), 'have a go: pressing J starts the jump drive and completes the step')
    await pg.evaluate(f"{D}.tourEnd()"); await pg.wait_for_timeout(500)
    await pg.evaluate(f"(()=>{{const d={D};d.tourStart('fly');}})()"); await pg.wait_for_timeout(1500)
    await pg.keyboard.press('l'); await until(pg, f"{D}.mode==='flight'&&{D}.tour.i>=1", 40000)
    await pg.wait_for_timeout(800); await pg.keyboard.down('w'); await pg.wait_for_timeout(1500); await pg.keyboard.up('w')
    R.check(await step_is(pg, 2), 'have a go: holding W speeds up and completes the step')
    await pg.wait_for_timeout(800); await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(2500); await pg.keyboard.up('ArrowRight')
    R.check(await step_is(pg, 3), 'have a go: turning the ship completes the steering step')
    # a finished tour is ticked on the player's own commander, and the tours page shows it
    await pg.evaluate(f"{D}.tour&&{D}.tourEnd()"); await pg.wait_for_timeout(500)
    c0 = await pg.evaluate(f"{D}.C.credits")
    await pg.evaluate(f"(()=>{{const d={D};d.C.opt.tourTry=false;d.tourStart('mission');}})()")
    await until(pg, f"{D}.tour&&{D}.tour.done", 60000, 300); await pg.evaluate(f"{D}.tourEnd()"); await pg.wait_for_timeout(500)
    R.check(await pg.evaluate(f"!!({D}.C.toursDone||{{}}).mission"), 'a finished tour is ticked on your own commander')
    c1 = await pg.evaluate(f"{D}.C.credits")
    R.check(round(c1 - c0) == 100, 'the first time you finish a tour, 100 Cr goes into your own game', [c0, c1])
    await pg.evaluate(f"(()=>{{const d={D};d.tourStart('mission');}})()")
    await until(pg, f"{D}.tour&&{D}.tour.done", 60000, 300); await pg.evaluate(f"{D}.tourEnd()"); await pg.wait_for_timeout(500)
    R.check(round(await pg.evaluate(f"{D}.C.credits") - c1) == 0, 'finishing it again pays nothing')
    await pg.evaluate(f"{D}.freshCDbg()")
    R.check(await pg.evaluate(f"!!({D}.C.toursDone||{{}}).mission&&{D}.C.credits<200"), 'a new commander keeps the record of finished tours (no second prize)')
    await pg.evaluate(f"{D}.set('overlay','menu');{D}.set('menuTab','tours')"); await pg.wait_for_timeout(400)
    labs = await pg.evaluate(f"{D}.btns.map(b=>b.label||'')")
    R.check(any(l.startswith('✓ ') and 'Taking a mission' in l for l in labs) and any(l.startswith('▶ ') for l in labs), 'the tours page ticks it and suggests the next tour', [l for l in labs if l[:2] in ('✓ ', '▶ ')])
    R.check(await pg.evaluate("JSON.stringify(localStorage).includes('toursDone')"), 'the tick is saved on the device')
    R.check(not pg.errors, 'have a go, laptop: no page errors', pg.errors[:3]); await pg.close_all()
    # Fold, touch: tap BUY 1 in the market, tap JUMP on the console
    pg = await browser(p, 1000, 700, True); await open_site(pg); await register(pg); await launch_game(pg)
    await until(pg, f"{D}.mode==='docked'", 20000); await pg.touchscreen.tap(500, 350)
    await pg.evaluate(f"(()=>{{const d={D};d.C.opt.tourTry=true;d.tourQuick(true);d.tourStart('trade');}})()"); await pg.wait_for_timeout(1500)
    await pg.evaluate(f"{D}.showMe()"); await step_is(pg, 1)
    await pg.wait_for_timeout(800)
    b = await pg.evaluate(f"{D}.btns.find(b=>b.label==='BUY 1')")
    xy = await pg.evaluate(f"(()=>{{const cv=document.getElementById('arcCanvas'),r=cv.getBoundingClientRect();return [r.left+{b['x']+b['w']/2}*r.width/800,r.top+{b['y']+b['h']/2}*r.height/600];}})()")
    await pg.touchscreen.tap(*xy)
    R.check(await step_is(pg, 2), 'have a go, touch: tapping BUY 1 completes the step', await pg.evaluate(f"{D}.tour.log"))
    R.check(not pg.errors, 'have a go, touch: no page errors', pg.errors[:3]); await pg.close_all()

async def main(p):
    R = Result('tours')
    pg = await browser(p); await open_site(pg); await register(pg); await launch_game(pg)
    ids = await pg.evaluate(f"{D}.TOURS?{D}.TOURS.map(t=>t.id):[]"); await pg.close_all()
    R.check(len(ids) >= 24, 'the tours list loads (24 tours in three paths)', len(ids))
    res, sem = {}, asyncio.Semaphore(int(os.environ.get('TOURS_PAR', '6')))
    await asyncio.gather(*[one(p, t, d, sem, res) for d in DEV for t in ids])
    for dev in DEV:
        bad = {t: (r and [x for x in r['log'] if x != 'ok'], e) for (t, d), (r, e) in res.items() if d == dev and (not r or not r['done'] or any(x != 'ok' for x in r['log']) or e)}
        R.check(not bad, f'{dev}: every tour plays to the end, no step timed out, no errors ({len(ids)} tours)', bad)
    turns = sum(r['turns'] for (t, d), (r, e) in res.items() if d == 'fold' and r)
    R.check(turns >= 40, f'fold, 🙋 HAVE A GO: turns are offered to the player and 👀 SHOW ME finishes each one ({turns} turns)', turns)
    words = {t: [s for s in r['said'] if KEYWORDS.search(s)] for (t, d), (r, e) in res.items() if d == 'fold' and r}
    words = {t: v for t, v in words.items() if v}
    R.check(not words, 'touch screen: Nova never talks about keys or the mouse', words)
    # the touch panel and a finger on the JUMP button
    pg = await browser(p, 1000, 700, True); await open_site(pg); await register(pg); await launch_game(pg)
    await until(pg, f"{D}.mode==='docked'", 20000); await pg.touchscreen.tap(500, 350)
    await pg.evaluate(f"{D}.C.opt.tourTry=false;{D}.tourQuick(true);{D}.tourStart('jump')")
    await until(pg, f"{D}.tour&&{D}.tour.i===2&&!!{D}.tour.tapAt", 60000, 200)
    ta = await pg.evaluate(f"{D}.tour.tapAt")
    R.check(bool(ta) and ta['y'] > 400, 'touch screen: a finger taps the JUMP button on the console', ta)
    labs = await pg.evaluate(f"{D}.btns.map(b=>b.label||'').join('|')")
    R.check('👆 CONTROLS' in labs and '⌨ KEYS' not in labs, 'touch screen: the touch panel replaces the keyboard picture')
    await pg.evaluate(f"{D}.tourEnd()"); await pg.wait_for_timeout(300)
    await player(p, R)
    # guided flight (the new-pilot tutorial) on touch: wording for the layout in use
    tx = await pg.evaluate(f"{D}.tutTexts()")
    R.check(tx[0].startswith('Tap LAUNCH') and 'Slide SPEED up' in tx[1] and 'dragged on the left of the picture' in tx[2], 'guided flight, touch (controls in the picture): tap LAUNCH, slide SPEED, drag to steer', tx[:3])
    for tm, want in (('simple', ('tap FAST', 'joystick')), ('twin', ('left stick up', 'sticks')), ('classic', ('Slide SPEED up', 'joystick'))):
        tx = await pg.evaluate(f"(()=>{{const d={D};d.setTdSeen(true);d.C.opt.touchMode='{tm}';return d.tutTexts();}})()")
        R.check(want[0] in tx[1] and want[1] in tx[2] and 'slider' not in tx[1].replace('SPEED up', ''), f'guided flight, touch, {tm} side controls: says {want[0]!r} and {want[1]!r}', tx[1:3])
    await pg.close_all()
    return R

if __name__ == '__main__': run(main)
