"""Transitions: you always land where you expect.

Walks the game through every kind of screen change and checks where you end up afterwards:
docked tabs, Pause and each of its pages (Escape and ◀ BACK step back one page at a time), Career from Pause
(closes back to Pause), the launch and docking cut-scenes, the chart and its DATA page, cargo and mission log,
outside camera and views kept across Pause, switching display style mid-flight (Modern / Original / Retro),
the battle display, the trailer and a tour (you return to the same Pause page), test mode, a maths puzzle, an
adventure abandoned from Pause, a hyperspace jump, stopping and relaunching, turning a phone or Fold, and
dying (CARRY ON docks you at the last station without leaving the game; LEAVE goes to the launch page).

Every step also checks: no page errors, no sideways scrolling, the game picture fills the screen sensibly,
and the game is still open. Real taps (touch screens, with a small wobble) or clicks hit the Pause RESUME
button, Career's ✕ CLOSE and the CARRY ON button on every screen size.

  python tests/test_transitions.py              every screen size, all three styles where it matters
  python tests/test_transitions.py quick        laptop and phone only
"""
import sys, asyncio
from rig import *

D = "Arcade._game()._dbg"
STYLES = ['modern', 'original', 'retro']
# (name, width, height, touch)
DEVICES = [
    ('phone sideways', 844, 390, True), ('phone upright', 390, 844, True),
    ('Fold folded', 344, 882, True), ('Fold open', 1100, 880, True), ('Fold sideways', 880, 1100, True),
    ('iPad', 1024, 768, True), ('laptop', 1280, 800, False), ("Stuart's window", 1908, 950, False),
    ('QHD', 2560, 1440, False), ('4K', 3840, 2160, False),
]
# every screen size in Modern (the default); the other styles on a spread of sizes
FULL_STYLES = {'phone sideways', 'Fold folded', 'laptop', '4K'}
QUICK = {'phone sideways', 'laptop'}

STATE = f"(()=>{{const d={D};return {{mode:d.mode,tab:d.tabNow,ov:d.overlay,menu:d.overlay==='menu'?d.menuTabNow:null,cam:d.camModeNow,view:d.viewNow,style:d.styleNow,sys:d.C.sys,show:!!d.show,tour:!!d.tour,test:!!d.test}}}})()"
SANE = """(()=>{const de=document.documentElement,cv=document.getElementById('arcCanvas'),r=cv&&cv.getBoundingClientRect(),
 vw=innerWidth,vh=innerHeight,dlg=document.getElementById('arcade');
 return {scroll:de.scrollWidth<=de.clientWidth+1,open:!!(dlg&&dlg.open),view:(()=>{try{return Arcade.status().view}catch(e){return null}})(),
  pic:!!r&&r.width>=Math.min(300,vw*.6)&&r.left>=-2&&r.right<=vw+2&&r.top>=-2&&r.bottom<=vh+2,
  rect:r?[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]:null,vw,vh};})()"""


class Walk:
    """One device + style: helpers that record each check under a short prefix."""
    def __init__(self, R, pg, name, touch):
        self.R, self.pg, self.name, self.touch, self.bad = R, pg, name, touch, 0

    async def st(self): return await self.pg.evaluate(STATE)
    async def ev(self, js): return await self.pg.evaluate(js)
    async def wait(self, ms=250): await self.pg.wait_for_timeout(ms)
    async def key(self, k, ms=250): await self.pg.keyboard.press(k); await self.wait(ms)
    async def until(self, js, t=20000): return await until(self.pg, js, t)

    def check(self, ok, label, detail=''):
        if not ok: self.bad += 1
        return self.R.check(ok, f'{self.name}: {label}', detail)

    async def expect(self, label, **want):
        """Compare the game's state with what we expect, and that the page is still sound."""
        s = await self.st(); z = await self.ev(SANE)
        diff = {k: (s.get(k), v) for k, v in want.items() if s.get(k) != v}
        ok = not diff and z['scroll'] and z['open'] and z['view'] == 'game' and z['pic'] and not self.pg.errors
        detail = diff or ('' if ok else {'sane': z, 'errors': self.pg.errors[:2]})
        self.check(ok, label, detail)
        return ok

    async def fn(self, label):
        """Press a game button by calling it (fast path, used for most steps)."""
        ok = await self.ev(f"(()=>{{const b={D}.allBtns.find(b=>b.label&&b.label.includes({label!r}));if(b){{b.fn();return true}}return false}})()")
        await self.wait(); return ok

    async def tap(self, label):
        """Press a game-canvas button with a real tap or click at its place on screen (wobble on touch)."""
        xy = await self.ev(f"""(()=>{{const b={D}.btns.find(b=>b.label&&b.label.includes({label!r}));const cv=document.getElementById('arcCanvas');
            if(!b||!cv)return null;const r=cv.getBoundingClientRect(),sx=r.width/800,sy=r.height/600;
            return [r.left+(b.x+b.w/2)*sx,r.top+(b.y+b.h/2)*sy];}})()""")
        if not xy: return False
        if self.touch:
            await self.pg.touchscreen.tap(xy[0] + 2, xy[1] - 1)
        else:
            await self.pg.mouse.click(xy[0], xy[1])
        await self.wait(350); return True

    async def pause(self): await self.ev(f"{D}.set('overlay','menu');{D}.set('menuTab','main')"); await self.wait()


async def walk(p, R, dev, style, full=True):
    name, w, h, touch = dev
    pg = await browser(p, w, h, mobile=touch)
    W = Walk(R, pg, f'{name} · {style}', touch)
    try:
        await open_site(pg); await register(pg); await launch_game(pg)
        # calm, repeatable conditions: no random hyperspace ambush, no adventure offers, no maths gates
        await W.ev(f"(()=>{{const d={D};d.C.opt.style={style!r};d.C.cheats={{interdict:0}};d.C.advLast=Date.now();d.C.opt.maths=false;}})()")
        await W.wait(900)
        await W.expect('starts docked on the status page', mode='docked', tab='status', ov=None, style=style)

        # --- docked: tabs, Pause and its pages ---
        await W.key('3'); await W.expect('key 3 opens the shipyard', mode='docked', tab='shipyard', ov=None)
        await W.key('Escape'); await W.expect('Escape pauses (as the help says)', ov='menu', menu='main', tab='shipyard')
        await W.key('Escape'); await W.expect('Escape again resumes on the same tab', ov=None, tab='shipyard')
        await W.pause()
        if await W.tap('RESUME'): await W.expect('a real tap on ▶ RESUME resumes', ov=None, tab='shipyard')
        else: W.check(False, 'RESUME button found')
        if full:
            for top in ['display', 'sound', 'controls', 'help']:
                await W.pause(); await W.ev(f"{D}.set('menuTab',{top!r})"); await W.wait(150)
                await W.key('Escape'); await W.expect(f'Pause → {top.upper()} tab, Escape resumes the game', ov=None, tab='shipyard')
        for sub, parent in [('diff', 'main'), ('watch', 'main'), ('tours', 'main'), ('adv', 'main'), ('saves', 'main'),
                            ('restart', 'main'), ('battle', 'display'), ('assist', 'controls')]:
            await W.pause(); await W.ev(f"{D}.set('menuTab',{sub!r})"); await W.wait(150)
            await W.key('Escape'); await W.expect(f'Pause → {sub}: Escape steps back to {parent}', ov='menu', menu=parent)
            if full:
                await W.ev(f"{D}.set('menuTab',{sub!r})"); await W.wait(150)
                back = '✕ CANCEL' if sub == 'restart' else '◀ BACK'
                W.check(await W.fn(back), f'Pause → {sub} has a {back} button')
                await W.expect(f'Pause → {sub}: {back} goes to {parent}', ov='menu', menu=parent)
        await W.key('Escape'); await W.wait(100)
        # Career from Pause closes back to Pause; Career from the station closes back to the station
        await W.pause(); await W.fn('CAREER'); await W.expect('Pause → 🏆 CAREER opens the record', ov='career')
        if await W.tap('CLOSE'): await W.expect('Career ✕ CLOSE (real tap) returns to Pause', ov='menu', menu='main')
        else: W.check(False, 'Career CLOSE button found')
        await W.fn('CAREER'); await W.key('Escape'); await W.expect('Career opened from Pause: Escape returns to Pause', ov='menu', menu='main')
        await W.key('Escape')
        await W.key('1'); await W.fn('CAREER RECORD'); await W.key('z')
        await W.expect('Career from the station page closes back to the station page', ov=None, tab='status', mode='docked')

        # --- launch cut-scene to flight ---
        await W.ev(f"{D}.launchDbg()")
        await W.until(f"{D}.mode==='flight'||{D}.mode==='launchScene'", 8000)
        if await W.ev(f"{D}.mode") == 'launchScene':
            await W.key('Escape', 150)
            sc = await W.ev(f"{D}.mode")
            W.check(sc in ('launchScene', 'flight'), 'Escape during the launch cut-scene skips it (or carries on)', sc)
        await W.until(f"{D}.mode==='flight'", 30000); await W.wait(400)
        await W.expect('launch cut-scene ends in flight, cockpit, looking forward', mode='flight', ov=None, cam='cockpit', view='front')

        # --- flight overlays ---
        await W.key('g'); await W.expect('G opens the galaxy chart', ov='chart')
        await W.fn('DATA'); await W.expect('chart → DATA', ov='data')
        await W.key('Escape'); await W.expect('Escape on DATA goes back to the chart', ov='chart')
        await W.fn('DATA'); await W.fn('◀ CHART'); await W.expect('◀ CHART goes back to the chart', ov='chart')
        await W.fn('✕ CLOSE'); await W.expect('chart ✕ CLOSE returns to flight', ov=None, mode='flight')
        await W.key('i'); await W.expect('I opens the cargo hold', ov='cargo')
        await W.key('i'); await W.expect('I again closes it', ov=None)
        await W.key('k'); await W.expect('K opens the mission log', ov='missions')
        await W.key('Escape'); await W.expect('Escape closes the mission log (not Pause)', ov=None, mode='flight')
        await W.key('z'); await W.key('Escape'); await W.expect('Career in flight: Escape returns to flight', ov=None, mode='flight')

        # --- camera and views survive Pause ---
        await W.key('o'); await W.key('p'); await W.key('p')
        await W.expect('outside camera kept after Pause and resume', ov=None, cam='ext')
        await W.key('o'); await W.key('2'); await W.key('Escape'); await W.key('Escape')
        await W.expect('rear view kept after Pause and resume', ov=None, cam='cockpit', view='rear')
        await W.key('1')

        # --- switching display style mid-flight and back ---
        if full:
            for s2 in [x for x in STYLES if x != style] + [style]:
                await W.pause(); await W.ev(f"{D}.set('menuTab','display');{D}.C.opt.style={s2!r}"); await W.wait(500)
                await W.key('Escape', 700); await W.expect(f'switch to {s2} in flight: still flying, nothing else changed', mode='flight', ov=None, style=s2, cam='cockpit')
        # battle display on and off
        await W.key('F3', 300); await W.key('F3', 300); await W.expect('battle display on/off (F3) leaves you flying', mode='flight', ov=None)

        # --- movies and tours return you to the same Pause page ---
        sys0 = await W.ev(f"{D}.C.sys")
        await W.pause(); await W.fn('WATCH'); await W.ev(f"{D}.startShow('trailer')"); await W.wait(1200)
        W.check(await W.ev(f"!!{D}.show"), 'Pause → WATCH → trailer plays')
        await W.key('x', 1200)
        await W.expect('stopping the trailer returns to Pause → WATCH, in flight, same system', ov='menu', menu='watch', mode='flight', sys=sys0, show=False)
        if full:
            await W.ev(f"{D}.set('menuTab','tours')"); await W.wait(150)
            await W.ev(f"{D}.tourStart('trade')"); await W.wait(1500)
            W.check(await W.ev(f"!!{D}.tour"), 'Pause → TOURS → a tour runs')
            await W.ev(f"{D}.tourEnd()"); await W.wait(600)
            await W.expect('ending the tour returns to Pause → TOURS, in flight, same system', ov='menu', menu='tours', mode='flight', sys=sys0, tour=False)
        await W.key('Escape'); await W.ev(f"{D}.set('overlay',null)"); await W.wait(150)
        # Nova's intro from Pause → WATCH closes back to WATCH
        if full:
            await W.pause(); await W.fn('WATCH'); await W.fn('NOVA’S INTRO'); await W.expect('Pause → WATCH → Nova’s intro opens', ov='intro')
            await W.key('Escape'); await W.expect('closing Nova’s intro returns to Pause → WATCH', ov='menu', menu='watch')
            await W.ev(f"{D}.set('overlay',null)"); await W.wait(150)

        # --- test mode in and out ---
        await test_mode(pg); await W.ev(f"{D}.set('overlay',null)"); await W.wait(300)
        await W.ev(f"{D}.testExit()"); await W.wait(500)
        await W.expect('test mode in and out: back in flight in the same system', mode='flight', ov=None, sys=sys0, test=False)

        # --- a maths puzzle ---
        await W.ev(f"{D}.openMathDbg('fuel')"); await W.wait(200)
        if await W.ev(f"{D}.overlay") == 'maths':
            await W.ev(f"{D}.pickMathDbg({D}.mathQNow.ans)"); await W.wait(200); await W.key('Enter', 300)
            await W.expect('a maths puzzle answered: back to flight', ov=None, mode='flight')

        # --- an adventure abandoned from Pause ---
        if full:
            aid = 'comet'
            await W.ev(f"{D}.advStartDbg({aid!r})"); await W.wait(500)
            if await W.ev(f"!!{D}.advNow"):
                await W.pause(); await W.fn('ABANDON ADVENTURE'); await W.wait(300)
                await W.expect('adventure abandoned from Pause: back to flight', ov=None, mode='flight')
                W.check(await W.ev(f"!{D}.advNow"), 'the adventure is really over')

        # --- hyperspace ---
        await W.ev(f"(()=>{{const d={D};d.C.fuel=7;const cur=d.C.sys;const G=d.GALn,s=G[cur];let best=null,bd=1e9;G.forEach((o,i)=>{{if(i===cur)return;const dd=Math.hypot(o.x-s.x,o.y-s.y);if(dd<bd){{bd=dd;best=i;}}}});d.C.target=best;d.startHyperDbg();}})()")
        # the countdown runs in game time, which is slow for Modern on big screens in the test browser
        await W.until(f"{D}.C.sys!=={sys0}&&{D}.mode==='flight'", 90000); await W.wait(400)
        sys1 = await W.ev(f"{D}.C.sys")
        await W.expect('hyperspace jump arrives in flight, in a new system', mode='flight', ov=None)
        W.check(sys1 != sys0, 'the jump really changed system', [sys0, sys1])

        # --- stop and relaunch while flying ---
        await W.ev("Arcade.close()"); await W.wait(900)
        z = await W.ev("({launch:!!document.querySelector('#playBtn')&&document.querySelector('#playBtn').offsetParent!==null,open:get('arcade').open})")
        W.check(z['launch'] and not z['open'], 'Stop: back on the launch page', z)
        await launch_game(pg); await W.wait(600)
        await W.expect('relaunch: carries on flying in the same system', mode='flight', sys=sys1, ov=None)

        # --- turning a phone or Fold mid-flight ---
        if touch:
            await pg.set_viewport_size({'width': h, 'height': w}); await W.wait(900)
            await W.expect('turned round mid-flight: still flying, page fits', mode='flight', ov=None, sys=sys1)
            await W.pause(); await W.expect('turned round: Pause still opens', ov='menu')
            await W.key('Escape')
            await pg.set_viewport_size({'width': w, 'height': h}); await W.wait(900)
            await W.expect('turned back: still flying, page fits', mode='flight', ov=None)

        # --- docking cut-scene ---
        await W.ev(f"{D}.dockedDbg()"); await W.wait(300)
        if await W.ev(f"{D}.mode") == 'dockScene':
            await W.ev(f"{D}.skipScene()")
        await W.until(f"{D}.mode==='docked'", 20000); await W.wait(300)
        await W.expect('docking ends on the station status page', mode='docked', tab='status')
        if await W.ev(f"{D}.overlay") == 'arrival':
            await W.key('Escape'); await W.expect('Escape closes the arrival report', ov=None, mode='docked')
        await W.ev(f"{D}.set('overlay',null)")

        # --- dying: carry on docked, inside the game ---
        await W.ev(f"{D}.launchDbg()"); await W.until(f"{D}.mode==='launchScene'||{D}.mode==='flight'", 8000)
        await W.ev(f"{D}.skipScene()"); await W.until(f"{D}.mode==='flight'", 30000); await W.wait(300)
        await W.ev(f"{D}.hurtDbg(99999)")
        await W.until(f"{D}.mode==='dead'&&{D}.deathTNow>1.7&&{D}.btns.some(b=>b.label&&b.label.includes('CARRY ON'))", 40000)
        W.check(await W.ev("Arcade.status().view") == 'game', 'GAME OVER stays in the game and waits for you')
        if await W.tap('CARRY ON'):
            await W.until(f"{D}.mode==='docked'", 5000)
            await W.expect('▶ CARRY ON (real tap): docked at the last station, still in the game', mode='docked', tab='status', sys=sys1)
        else: W.check(False, 'CARRY ON button found')
        if full:
            await W.ev(f"{D}.launchDbg()"); await W.until(f"{D}.mode==='launchScene'||{D}.mode==='flight'", 8000)
            await W.ev(f"{D}.skipScene()"); await W.until(f"{D}.mode==='flight'", 30000); await W.wait(300)
            await W.ev(f"{D}.hurtDbg(99999)")
            await W.until(f"{D}.mode==='dead'&&{D}.deathTNow>1.7", 40000); await W.wait(200)
            await W.fn('LEAVE THE GAME'); await W.wait(1200)
            z = await W.ev("({open:get('arcade').open})")
            W.check(not z['open'], '⏏ LEAVE THE GAME goes to the launch page', z)
            await launch_game(pg); await W.wait(600)
            await W.expect('relaunch after leaving: docked at the last station', mode='docked', sys=sys1)
        W.check(not pg.errors, 'no page errors', pg.errors[:3])
    except Exception as e:
        W.check(False, 'walk crashed', repr(e)[:300])
    finally:
        await pg.close_all()


async def main(p):
    R = Result('transitions')
    quick = 'quick' in sys.argv[1:]
    jobs = []
    for dev in DEVICES:
        if quick and dev[0] not in QUICK: continue
        styles = STYLES if dev[0] in FULL_STYLES else ['modern']
        for s in styles:
            jobs.append((dev, s, s == 'modern' or dev[0] in ('laptop',)))
    sem = asyncio.Semaphore(3)
    async def one(j):
        async with sem: await walk(p, R, j[0], j[1], j[2])
    await asyncio.gather(*(one(j) for j in jobs))
    return R

if __name__ == '__main__': run(main)
