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

    # 4. big screens: the corner buttons grow
    for name, w, h in (('laptop', 1280, 800), ('4K', 3840, 2160)):
        pg = await browser(p, w, h); await open_site(pg); await register(pg); await launch_game(pg)
        fs = await pg.evaluate("parseFloat(getComputedStyle(document.querySelector('#arcade .arc-ctl button')).fontSize)")
        R.check(fs >= (20 if name == '4K' else 12), f'{name}: Pause / Full screen / Stop text is {fs:.0f}px', fs)
        await pg.close_all()
    return R

if __name__ == '__main__': run(main)
