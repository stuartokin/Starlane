"""Training tours: every tour plays to the end with no step timing out, on a laptop (keyboard) and on a Fold-sized
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
            await pg.evaluate(f"{D}.tourQuick(true);{D}.tourStart('{tid}')")
            await until(pg, f"(()=>{{const t={D}.tour;return t&&t.done}})()", 300000, 500)
            r = await pg.evaluate(f"(()=>{{const t={D}.tour;return t?{{done:t.done,log:t.log,said:t.said,n:t.def.steps.length}}:null}})()")
            res[(tid, dev)] = (r, pg.errors[:2])
        except Exception as e: res[(tid, dev)] = (None, [str(e)[:200]])
        await pg.close_all()

async def main(p):
    R = Result('tours')
    pg = await browser(p); await open_site(pg); await register(pg); await launch_game(pg)
    ids = await pg.evaluate(f"{D}.TOURS?{D}.TOURS.map(t=>t.id):[]"); await pg.close_all()
    R.check(len(ids) >= 17, 'the tours list loads', len(ids))
    res, sem = {}, asyncio.Semaphore(int(os.environ.get('TOURS_PAR', '6')))
    await asyncio.gather(*[one(p, t, d, sem, res) for d in DEV for t in ids])
    for dev in DEV:
        bad = {t: (r and [x for x in r['log'] if x != 'ok'], e) for (t, d), (r, e) in res.items() if d == dev and (not r or not r['done'] or any(x != 'ok' for x in r['log']) or e)}
        R.check(not bad, f'{dev}: every tour plays to the end, no step timed out, no errors ({len(ids)} tours)', bad)
    words = {t: [s for s in r['said'] if KEYWORDS.search(s)] for (t, d), (r, e) in res.items() if d == 'fold' and r}
    words = {t: v for t, v in words.items() if v}
    R.check(not words, 'touch screen: Nova never talks about keys or the mouse', words)
    # the touch panel and a finger on the JUMP button
    pg = await browser(p, 1000, 700, True); await open_site(pg); await register(pg); await launch_game(pg)
    await until(pg, f"{D}.mode==='docked'", 20000); await pg.touchscreen.tap(500, 350)
    await pg.evaluate(f"{D}.tourQuick(true);{D}.tourStart('jump')")
    await until(pg, f"{D}.tour&&{D}.tour.i===2&&!!{D}.tour.tapAt", 60000, 200)
    ta = await pg.evaluate(f"{D}.tour.tapAt")
    R.check(bool(ta) and ta['y'] > 400, 'touch screen: a finger taps the JUMP button on the console', ta)
    labs = await pg.evaluate(f"{D}.btns.map(b=>b.label||'').join('|')")
    R.check('👆 CONTROLS' in labs and '⌨ KEYS' not in labs, 'touch screen: the touch panel replaces the keyboard picture')
    await pg.evaluate(f"{D}.tourEnd()"); await pg.wait_for_timeout(300)
    # guided flight (the new-pilot tutorial) on touch: wording for the layout in use
    tx = await pg.evaluate(f"{D}.tutTexts()")
    R.check(tx[0].startswith('Tap LAUNCH') and 'Slide SPEED up' in tx[1] and 'dragged on the left of the picture' in tx[2], 'guided flight, touch (controls in the picture): tap LAUNCH, slide SPEED, drag to steer', tx[:3])
    for tm, want in (('simple', ('tap FAST', 'joystick')), ('twin', ('left stick up', 'sticks')), ('classic', ('Slide SPEED up', 'joystick'))):
        tx = await pg.evaluate(f"(()=>{{const d={D};d.setTdSeen(true);d.C.opt.touchMode='{tm}';return d.tutTexts();}})()")
        R.check(want[0] in tx[1] and want[1] in tx[2] and 'slider' not in tx[1].replace('SPEED up', ''), f'guided flight, touch, {tm} side controls: says {want[0]!r} and {want[1]!r}', tx[1:3])
    await pg.close_all()
    return R

if __name__ == '__main__': run(main)
