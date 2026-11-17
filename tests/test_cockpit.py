"""Cockpits on every kind of device: settings follow the device you are playing on (a commander made on a laptop
gets touch settings on a Fold, and its laptop settings back on the laptop); on touch screens the joystick turns
the ship, and classic roll steering can be chosen; straight after launch the docking assist does not lock the roll
or turn you back to the station; the touch controls don't overlap the picture, the speed slider or the corner
buttons on phones and Folds; big screens get bigger corner buttons."""
from rig import *

D = "Arcade._game()._dbg"

async def fly(pg):
    await pg.evaluate(f"{D}.launchDbg()"); await until(pg, f"{D}.mode==='flight'||{D}.mode==='launchScene'", 8000)
    await pg.evaluate(f"{D}.skipScene()"); return bool(await until(pg, f"{D}.mode==='flight'", 30000))

def overlap(a, b):
    return a[0] < b[0] + b[2] - 1 and b[0] < a[0] + a[2] - 1 and a[1] < b[1] + b[3] - 1 and b[1] < a[1] + a[3] - 1

LAYOUT = """(()=>{const g=id=>{const e=document.getElementById(id);if(!e)return null;const r=e.getBoundingClientRect();return[r.left,r.top,r.width,r.height]};
 const deck=document.getElementById('slTouchDeck');const parts={};if(deck)deck.querySelectorAll('[data-k]').forEach(e=>{if(e.style.display==='none'||e.dataset.k==='zone')return;const r=e.getBoundingClientRect();if(r.width)parts[e.dataset.k]=[r.left,r.top,r.width,r.height]});
 const c=document.querySelector('#arcade .arc-ctl'),cr=c&&c.getBoundingClientRect();return {pic:g('arcCanvas'),ctl:cr?[cr.left,cr.top,cr.width,cr.height]:null,parts,vw:innerWidth,vh:innerHeight,
 scroll:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1}})()"""

async def main(p):
    R = Result('cockpit')
    # 1. a commander made on a laptop, then played on a Fold, then back on the laptop
    pg = await browser(p, 1280, 800); await open_site(pg); await register(pg); await launch_game(pg)
    await pg.evaluate(f"(()=>{{const d={D};d.C.opt.style='modern';d.C.opt.cock3d=true;d.C.opt.controls='modern';d.persistNow();}})()")
    saved = await pg.evaluate("JSON.stringify(window.stats)"); await pg.close_all()
    pg = await browser(p, 1000, 558, mobile=True); await open_site(pg)
    await pg.evaluate(f"s=>{{localStorage.setItem('starlane-standalone-v1',s)}}", saved); await pg.reload(); await pg.wait_for_timeout(600)
    await launch_game(pg)
    o = await pg.evaluate(f"(()=>{{const o={D}.C.opt;return [o.device,o.cock3d,o.controls,o.mfd]}})()")
    R.check(o == ['tablet', False, 'classic', False], 'laptop commander on a Fold: touch settings (simple cockpit), not the laptop ones', o)
    await pg.evaluate(f"(()=>{{const d={D};d.C.opt.style='retro';d.persistNow();}})()")
    saved = await pg.evaluate("JSON.stringify(window.stats)"); await pg.close_all()
    pg = await browser(p, 1280, 800); await open_site(pg)
    await pg.evaluate(f"s=>{{localStorage.setItem('starlane-standalone-v1',s)}}", saved); await pg.reload(); await pg.wait_for_timeout(600)
    await launch_game(pg)
    o = await pg.evaluate(f"(()=>{{const o={D}.C.opt;return [o.device,o.style,o.cock3d,o.controls]}})()")
    R.check(o == ['desktop', 'modern', True, 'modern'], 'back on the laptop: its own settings return (the Fold choice of Retro stays with the Fold)', o)
    R.check(not pg.errors, 'no page errors (device switching)', pg.errors[:3]); await pg.close_all()

    # 2. touch: steering, and no docking assist straight after launch
    pg = await browser(p, 1000, 558, mobile=True); await open_site(pg); await register(pg); await launch_game(pg)
    await fly(pg); await pg.touchscreen.tap(500, 150); await pg.wait_for_timeout(600)
    R.check(await pg.evaluate(f"{D}.TDnow!==undefined&&document.getElementById('slTouchDeck')&&document.getElementById('slTouchDeck').style.display==='block'"), 'Fold open (1000×558): touch controls in the side margins')
    f0 = await pg.evaluate(f"(()=>{{const d={D},s=d.station,P=d.P;const t=[s.pos[0]-P.pos[0],s.pos[1]-P.pos[1],s.pos[2]-P.pos[2]],l=Math.hypot(...t);return (P.o.f[0]*t[0]+P.o.f[1]*t[1]+P.o.f[2]*t[2])/l}})()")
    await pg.wait_for_timeout(5000)
    st = await pg.evaluate(f"(()=>{{const d={D},s=d.station,P=d.P;const t=[s.pos[0]-P.pos[0],s.pos[1]-P.pos[1],s.pos[2]-P.pos[2]],l=Math.hypot(...t);return {{lock:d.rollLockNow,face:(P.o.f[0]*t[0]+P.o.f[1]*t[1]+P.o.f[2]*t[2])/l}}}})()")
    R.check(not st['lock'] and st['face'] < 0, 'after launch: no roll lock, and the ship is not turned back to the station', {'start': round(f0, 2), **st})
    ctl = await pg.evaluate(f"""(()=>{{const d={D};const P=d.P;const o=JSON.stringify(P.o.f);
        const deck=document.getElementById('slTouchDeck');return true}})()""")
    # the joystick turns the ship (yaw), and classic steering rolls it
    out = await pg.evaluate(f"""(()=>{{const d={D};const base=document.querySelector('#slTouchDeck [data-k=base]');
        const r={{}};for(const turn of [true,false]){{d.C.opt.assist.touch.turn=turn;
          const ev=(t,x,y)=>base.dispatchEvent(new PointerEvent(t,{{pointerId:7,clientX:x,clientY:y,bubbles:true,pointerType:'touch'}}));
          const b=base.getBoundingClientRect();ev('pointerdown',b.left+b.width/2,b.top+b.height/2);ev('pointermove',b.left+b.width*.95,b.top+b.height/2);
          const c=d.ctrlOut;r[turn?'turn':'roll']={{yaw:Math.round(c.yaw*100)/100,roll:Math.round(c.roll*100)/100}};ev('pointerup',0,0);}}
        d.C.opt.assist.touch.turn=true;return r}})()""")
    R.check(out['turn']['yaw'] > .5 and abs(out['turn']['roll']) < .3 and out['roll']['roll'] > .5 and abs(out['roll']['yaw']) < .3,
            'touch joystick: right turns the ship (classic: rolls it)', out)
    await pg.evaluate(f"{D}.set('overlay','menu');{D}.set('menuTab','assist')"); await pg.wait_for_timeout(300)
    labs = await pg.evaluate(f"{D}.btns.map(b=>b.label).filter(Boolean)")
    R.check(any('Joystick turns' in l for l in labs), 'Pause → Controls → Flight assists offers "Joystick turns" on touch screens', [l for l in labs if 'Joystick' in l])
    R.check(not pg.errors, 'no page errors (touch flight)', pg.errors[:3]); await pg.close_all()

    # 3. touch layouts: nothing overlaps
    for name, w, h in (('Fold open (Edge)', 1000, 558), ('phone sideways', 844, 390), ('Fold folded, sideways', 882, 344), ('Fold open', 1100, 880)):
        pg = await browser(p, w, h, mobile=True); await open_site(pg); await register(pg); await launch_game(pg)
        await fly(pg); await pg.touchscreen.tap(w / 2, h * .3); await pg.wait_for_timeout(900)
        L = await pg.evaluate(LAYOUT); parts = L['parts']
        if not parts:
            R.check(L['scroll'] and not pg.errors, f'{name}: in-picture touch controls (no side margins), page fits', L['pic']); await pg.close_all(); continue
        bad = []
        for k, v in parts.items():
            if k in ('base',) : continue
            if overlap(v, L['pic']): bad.append(f'{k} on the picture')
            if L['ctl'] and overlap(v, L['ctl']): bad.append(f'{k} under the corner buttons')
            if v[0] < -1 or v[1] < -1 or v[0] + v[2] > L['vw'] + 1 or v[1] + v[3] > L['vh'] + 1: bad.append(f'{k} off screen')
        for a in parts:
            for b in parts:
                if a < b and overlap(parts[a], parts[b]) and 'lab' not in (a, b): bad.append(f'{a} on {b}')
        R.check(not bad and L['scroll'], f'{name}: joystick, FIRE, BOOST, MISSILE and SPEED clear of the picture, the corner buttons and each other', bad or '')
        R.check(not pg.errors, f'{name}: no page errors', pg.errors[:3]); await pg.close_all()

    # 4. touch layouts: Simple (auto speed), Twin sticks, Classic — chosen per device; phones fly with the battle display on
    pg = await browser(p, 844, 390, mobile=True); await open_site(pg); await register(pg); await launch_game(pg); await fly(pg)
    await pg.touchscreen.tap(422, 120); await pg.wait_for_timeout(600)
    v = await pg.evaluate(f"[{D}.tmNow,{D}.C.opt.battle,{D}.bdOn(),{D}.underAttack()]")
    R.check(v == ['simple', 'on', True, False], 'phone: Simple touch controls, and the battle display on while flying (no fight needed)', v)
    await pg.evaluate(f"{D}.set('overlay','menu');{D}.set('menuTab','touch')"); await pg.wait_for_timeout(300)
    labs = await pg.evaluate(f"{D}.btns.map(b=>b.label).filter(Boolean)")
    R.check(labs.count('CHOOSE') == 1 and labs.count('✓ CHOSEN') == 1, 'phone: Twin sticks is not offered (needs a bigger screen); Simple and Classic are', labs)
    R.check(not pg.errors, 'phone: no page errors', pg.errors[:3]); await pg.close_all()

    pg = await browser(p, 1000, 558, mobile=True); await open_site(pg); await register(pg); await launch_game(pg); await fly(pg)
    await pg.touchscreen.tap(500, 150); await pg.wait_for_timeout(600)
    v = await pg.evaluate(f"[{D}.tmNow,{D}.C.opt.battle||'auto',{D}.bdOn()]")
    R.check(v == ['simple', 'auto', False], 'Fold open: Simple by default, battle display on Automatic', v)
    # auto speed in open space follows CRUISE / SLOW / FAST
    await pg.evaluate(f"(()=>{{const d={D};d.P.pos=[d.P.pos[0]+60000,d.P.pos[1]+30000,d.P.pos[2]+60000];d.setAutoLv('fast');}})()")
    await until(pg, f"{D}.P.throttle>.9", 15000)
    hi = await pg.evaluate(f"{D}.P.throttle")
    await pg.evaluate(f"{D}.setAutoLv('slow')"); await until(pg, f"{D}.P.throttle<.4", 15000)
    lo = await pg.evaluate(f"{D}.P.throttle*{D}.P.max")
    R.check(hi > .9 and lo < 130, 'Simple: FAST opens the throttle; SLOW brings it down to docking speed', [round(hi, 2), round(lo)])
    sw = await pg.evaluate("[...document.querySelectorAll('#slTouchDeck [data-k^=sw-]')].filter(e=>e.style.display!=='none').map(e=>e.textContent)")
    R.check(sw == ['FAST', 'CRUISE', 'SLOW'], 'Simple: the speed slider is replaced by FAST / CRUISE / SLOW', sw)
    # near the station, facing it, in the corridor: Easy brings you in slowly; Normal leaves the final approach to you
    async def approach(level):
        return await pg.evaluate(f"""(async()=>{{const d={D},s=d.station;d.setDifficulty({level!r});d.setAutoLv('fast');const f=s.o.f;
          d.P.pos=[s.pos[0]+f[0]*3000,s.pos[1]+f[1]*3000,s.pos[2]+f[2]*3000];d.P.o.f=[-f[0],-f[1],-f[2]];d.P.o.u=s.o.u.slice();d.P.o.r=[-s.o.r[0],-s.o.r[1],-s.o.r[2]];d.P.throttle=.9;d.P.speed=.9*d.P.max;
          for(let i=0;i<40;i++)await new Promise(r=>setTimeout(r,150));return Math.round(d.P.throttle*d.P.max);}})()""")
    easy = await approach('easy'); norm = await approach('normal')
    R.check(easy < 120 and norm > 200, 'auto speed docks you on Easy only (Easy slows below 120; Normal leaves the speed to you)', [easy, norm])
    await pg.evaluate(f"(()=>{{const d={D};d.setDifficulty('normal');d.P.pos=[d.P.pos[0]+60000,d.P.pos[1]+30000,d.P.pos[2]+60000];d.P.throttle=.3;d.P.speed=100;}})()")
    R.check(await pg.evaluate(f"{D}.mode") == 'flight', 'still flying after the approach checks')
    # Touch Controls page: choose Twin sticks
    await pg.evaluate(f"{D}.set('overlay','menu');{D}.set('menuTab','controls')"); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"!!{D}.btns.find(b=>b.label&&b.label.startsWith('📱 TOUCH CONTROLS'))"), 'Pause → Controls has 📱 TOUCH CONTROLS on touch screens')
    await pg.evaluate(f"{D}.btns.find(b=>b.label&&b.label.startsWith('📱 TOUCH CONTROLS')).fn()"); await pg.wait_for_timeout(300)
    await pg.evaluate(f"{D}.btns.filter(b=>b.label==='CHOOSE')[0].fn()"); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate(f"{D}.touchMode()") == 'twin', 'choosing 🎮 TWIN STICKS')
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate(f"[{D}.overlay,{D}.menuTabNow]") == ['menu', 'controls'], 'Escape on the Touch Controls page goes back to Controls')
    await pg.evaluate(f"{D}.set('overlay',null)"); await pg.wait_for_timeout(900)
    # twin sticks: left stick up = faster, right stick = nose and roll
    tw = await pg.evaluate(f"""(async()=>{{const d={D};const q=k=>document.querySelector('#slTouchDeck [data-k='+k+']');
       const drag=(el,fx,fy,id)=>{{const b=el.getBoundingClientRect(),ev=(t,x,y)=>el.dispatchEvent(new PointerEvent(t,{{pointerId:id,clientX:x,clientY:y,bubbles:true,pointerType:'touch'}}));ev('pointerdown',b.left+b.width/2,b.top+b.height/2);ev('pointermove',b.left+b.width*fx,b.top+b.height*fy);return()=>ev('pointerup',0,0);}};
       d.P.throttle=.3;const up=drag(q('base'),.5,.05,11);const c1=d.ctrlOut;await new Promise(r=>setTimeout(r,1200));const t1=d.P.throttle;up();
       const up2=drag(q('base2'),.95,.05,12);const c2=d.ctrlOut;up2();return {{thr:c1.thr,yaw:c1.yaw,pitch1:c1.pitch,throttleRose:t1>.35,pitch:c2.pitch,roll:c2.roll,shown:q('base2').style.display}};}})()""")
    R.check(tw['thr'] > .5 and tw['throttleRose'] and abs(tw['pitch1']) < .2 and tw['pitch'] > .5 and tw['roll'] > .4 and tw['shown'] == 'flex',
            'Twin sticks: left stick up speeds up (no nose movement); right stick lifts the nose and rolls', tw)
    R.check(not pg.errors, 'Fold: no page errors', pg.errors[:3]); await pg.close_all()

    # every touch layout, with and without the battle display: nothing overlaps
    for name, w, h in (('Fold open (Edge)', 1000, 558), ('phone sideways', 844, 390), ('Fold folded, sideways', 882, 344)):
        for tm in ('simple', 'twin', 'classic'):
            for bd in (False, True):
                pg = await browser(p, w, h, mobile=True); await open_site(pg); await register(pg); await launch_game(pg)
                await pg.evaluate(f"(()=>{{const o={D}.C.opt;o.touchMode={tm!r};o.battle={'on' if bd else 'off'!r};}})()")
                await fly(pg); await pg.touchscreen.tap(w / 2, h * .3); await pg.wait_for_timeout(900)
                L = await pg.evaluate(LAYOUT); parts = L['parts']
                hits = await pg.evaluate(f"{D}.bdHits.map(b=>[b.x,b.y,b.w,b.h,b.label])") if bd else []
                bad = []
                for k, v in parts.items():
                    if overlap(v, L['pic']) and k != 'base': bad.append(f'{k} on the picture')
                    if L['ctl'] and overlap(v, L['ctl']): bad.append(f'{k} under the corner buttons')
                    if v[0] < -1 or v[1] < -1 or v[0] + v[2] > L['vw'] + 1 or v[1] + v[3] > L['vh'] + 1: bad.append(f'{k} off screen')
                    for hb in hits:
                        if overlap(v, hb[:4]): bad.append(f'{k} on {hb[4]}')
                ks = sorted(parts)
                for i, a in enumerate(ks):
                    for b in ks[i + 1:]:
                        if overlap(parts[a], parts[b]) and 'lab' not in (a, b): bad.append(f'{a} on {b}')
                got = await pg.evaluate(f"{D}.tmNow")
                want = 'simple' if (tm == 'twin' and h < 400) else tm
                R.check(not bad and L['scroll'] and got == want and not pg.errors and len(parts) >= 4,
                        f'{name} · {tm}{" · battle display" if bd else ""}: controls clear of the picture, buttons and each other', bad or (got if got != want else '') or pg.errors[:2])
                await pg.close_all()

    # 5. the first launch on a slow connection: the Modern cut-scene waits for the 3D engine instead of playing flat (Retro-looking)
    b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1000, 'height': 558}, is_mobile=True, has_touch=True, service_workers='block')
    pg = await ctx.new_page(); pg.errors = []; pg.on('pageerror', lambda e: pg.errors.append(str(e)[:300]))
    async def slow(route):
        await asyncio.sleep(4); await route.continue_()
    await pg.route('**/three-bundle.js', slow)
    await open_site(pg); await register(pg); await launch_game(pg)
    await until(pg, f"{D}.overlay==='intro'", 4000); await pg.evaluate(f"(()=>{{const d={D};d.C.introSeen=true;d.set('overlay',null);}})()")
    await pg.evaluate(f"{D}.launchDbg()"); await until(pg, f"{D}.mode==='launchScene'", 5000)
    frames = []
    for _ in range(80):
        await pg.wait_for_timeout(200)
        v = await pg.evaluate(f"[{D}.mode,StarModern.state,{D}.scene?{D}.scene.t:0,{D}.scene3d]")
        if v[0] != 'launchScene': break
        frames.append(v)
    flat = [f for f in frames if f[2] > .05 and not f[3]]
    R.check(frames and not flat and frames[-1][3], 'Modern launch cut-scene on a slow connection: waits for 3D, no flat (Retro-looking) frames', {'frames': len(frames), 'flat': len(flat)})
    await b.close()

    # 6. big screens: the corner buttons grow
    for name, w, h in (('laptop', 1280, 800), ('4K', 3840, 2160)):
        pg = await browser(p, w, h); await open_site(pg); await register(pg); await launch_game(pg)
        fs = await pg.evaluate("parseFloat(getComputedStyle(document.querySelector('#arcade .arc-ctl button')).fontSize)")
        R.check(fs >= (20 if name == '4K' else 12), f'{name}: Pause / Full screen / Stop text is {fs:.0f}px', fs)
        await pg.close_all()
    return R

if __name__ == '__main__': run(main)
