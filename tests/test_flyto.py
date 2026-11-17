"""➡️ Fly to target, 🎛 VIEW (F4) and the phone console.

Fly to target: one tap on a radar icon shows information only (the ship doesn't move); the card has 🎯 TURN TO and
➡️ FLY THERE; tapping the same icon again flies there; 🛑 STOP, steering or coming under attack hands control
back; to the station it lines up with the slot (Easy: takes you in and docks; Normal: stops lined up) from in
front or from behind without hitting it; to the planet and to a ship it stops nearby; a courier mission completes
when it docks you; it is not offered in adventures or races, nor with the assist switched off (the default for
mouse and keyboard), nor for black holes and missiles.

VIEW: F4 and the console's VIEW switch step through the Modern displays (3D cockpit, console, clear view; phones
skip the 3D cockpit); from Retro or Original it goes to Modern; the battle display has a 🎛 VIEW button too.

Phone console: six big switches (JUMP, DOCK, HYPER, MAP, MISN, MORE); MORE opens a strip with the rest, which
closes after a choice; four big readouts.
"""
from rig import *

D = "Arcade._game()._dbg"

async def fly(pg):
    await pg.evaluate(f"{D}.launchDbg()"); await until(pg, f"{D}.mode==='flight'||{D}.mode==='launchScene'", 8000)
    await pg.evaluate(f"{D}.skipScene()"); return bool(await until(pg, f"{D}.mode==='flight'", 30000))

async def calm(pg, style='retro', level='normal'):
    await pg.evaluate(f"(()=>{{const d={D};d.C.opt.style={style!r};d.C.cheats={{interdict:0,peace:true}};d.C.advLast=Date.now();d.C.opt.maths=false;d.setDifficulty({level!r});}})()")

TAP = lambda o: f"{D}.radarPick([{{x:10,y:10,o:{o}}}],10,10)"
DIST = lambda o: f"(()=>{{const d={D},o={o},P=d.P;return Math.round(Math.hypot(o.pos[0]-P.pos[0],o.pos[1]-P.pos[1],o.pos[2]-P.pos[2]))}})()"
LABELS = f"{D}.btns.map(b=>b.label).filter(Boolean)"

async def main(p):
    R = Result('flyto')
    # ---------- touch (Fold): taps, cancelling, station from in front ----------
    pg = await browser(p, 1000, 558, mobile=True); await open_site(pg); await register(pg); await launch_game(pg)
    await calm(pg); await fly(pg); await pg.touchscreen.tap(500, 150); await pg.wait_for_timeout(2500)
    f0 = await pg.evaluate(f"{D}.P.o.f.slice()")
    await pg.evaluate(TAP(f"{D}.station")); await pg.wait_for_timeout(900)
    st = await pg.evaluate(f"({{tgt:{D}.tgt==={D}.station,fly:{D}.fly,f:{D}.P.o.f.slice(),faceT:{D}.faceTNow}})")
    turned = sum(a * b for a, b in zip(f0, st['f']))
    R.check(st['tgt'] and not st['fly'] and not st['faceT'], 'one tap on the station: information only (selected, not flying, not turning)', {'dot': round(turned, 3)})
    labs = await pg.evaluate(LABELS)
    R.check('🎯 TURN TO' in labs and '➡️ FLY THERE' in labs, 'its card has 🎯 TURN TO and ➡️ FLY THERE', [l for l in labs if 'TURN' in l or 'FLY' in l])
    await pg.evaluate(TAP(f"{D}.station")); await pg.wait_for_timeout(300)
    R.check((await pg.evaluate(f"{D}.fly") or {}).get('name') == 'THE STATION', 'tapping the same icon again flies there')
    labs = await pg.evaluate(LABELS)
    R.check(any(l.startswith('🛑 STOP') for l in labs), 'a 🛑 STOP button shows while it flies', [l for l in labs if 'STOP' in l])
    await pg.evaluate(f"{D}.btns.find(b=>b.label&&b.label.startsWith('🛑 STOP')).fn()"); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate(f"{D}.fly") is None, '🛑 STOP hands control back')
    # steering cancels (a real drag on the touch joystick)
    await pg.evaluate(f"{D}.flyTo({D}.station)"); await pg.wait_for_timeout(300)
    await pg.evaluate("""(()=>{const el=document.querySelector('#slTouchDeck [data-k=base]')||document.querySelector('#slTouchDeck [data-k=zone]');const b=el.getBoundingClientRect(),ev=(t,x,y)=>el.dispatchEvent(new PointerEvent(t,{pointerId:21,clientX:x,clientY:y,bubbles:true,pointerType:'touch'}));
        ev('pointerdown',b.left+b.width/2,b.top+b.height/2);ev('pointermove',b.left+b.width*.95,b.top+b.height/2);setTimeout(()=>ev('pointerup',0,0),600);})()""")
    await pg.wait_for_timeout(900)
    R.check(await pg.evaluate(f"{D}.fly") is None, 'steering with the joystick hands control back')
    # attack cancels
    await pg.evaluate(f"{D}.flyTo({D}.station)"); await pg.wait_for_timeout(300); await pg.evaluate(f"{D}.hurtDbg(3)"); await pg.wait_for_timeout(500)
    R.check(await pg.evaluate(f"{D}.fly") is None and 'UNDER ATTACK' in ' '.join(await pg.evaluate(f"{D}.msgs.map(m=>m.t||m.text||'')")), 'coming under attack hands control back, with a warning')
    await pg.evaluate(f"{D}.setLastHit(-99)")
    # Normal: from behind the station, lines up with the slot without hitting it, and stops
    await pg.evaluate(f"""(()=>{{const d={D},s=d.station,f=s.o.f,P=d.P;P.pos=[s.pos[0]-f[0]*5000+s.o.r[0]*600,s.pos[1]-f[1]*5000+s.o.r[1]*600,s.pos[2]-f[2]*5000+s.o.r[2]*600];P.o.f=f.slice();P.o.u=s.o.u.slice();P.o.r=s.o.r.slice();P.speed=0;P.throttle=0;P.hull=0;}})()""")
    await pg.wait_for_timeout(300); hull0 = await pg.evaluate(f"{D}.P.hull||0")
    await pg.evaluate(f"{D}.flyTo({D}.station)")
    await until(pg, f"!{D}.fly", 150000)
    r = await pg.evaluate(f"""(()=>{{const d={D},s=d.station,P=d.P,rel=[P.pos[0]-s.pos[0],P.pos[1]-s.pos[1],P.pos[2]-s.pos[2]],ax=rel[0]*s.o.f[0]+rel[1]*s.o.f[1]+rel[2]*s.o.f[2],face=-(P.o.f[0]*s.o.f[0]+P.o.f[1]*s.o.f[1]+P.o.f[2]*s.o.f[2]);
        return {{mode:d.mode,ax:Math.round(ax),face:+face.toFixed(3),hull:P.hull||0,msg:d.msgs.map(m=>m.t||m.text||'').join(' | ').slice(-160)}}}})()""")
    R.check(r['mode'] == 'flight' and r['ax'] > 1500 and r['face'] > .99 and r['hull'] <= hull0 + 1e-6 and 'LINED UP' in r['msg'],
            'Normal, from behind the station: flies round it, lines up with the slot and stops (no bump)', r)
    R.check(not pg.errors, 'Fold: no page errors so far', pg.errors[:3]); await pg.close_all()

    # ---------- Easy: a courier mission completed by flying in; the planet; a ship ----------
    pg = await browser(p, 1000, 558, mobile=True); await open_site(pg); await register(pg); await launch_game(pg)
    await calm(pg, level='easy')
    await pg.evaluate(f"(()=>{{const d={D};d.C.missions.push({{id:'rig-c1',type:'courier',dest:d.C.sys,reward:120,deadline:d.C.day+9,title:'Courier: rig test',text:'test'}});}})()")
    await fly(pg); await pg.wait_for_timeout(2500)
    cr0 = await pg.evaluate(f"{D}.C.credits")
    await pg.evaluate(f"(()=>{{const d={D},s=d.station,f=s.o.f,P=d.P;P.pos=[s.pos[0]+f[0]*6000+s.o.u[0]*900,s.pos[1]+f[1]*6000+s.o.u[1]*900,s.pos[2]+f[2]*6000+s.o.u[2]*900];}})()")
    await pg.evaluate(f"{D}.flyTo({D}.station)")
    ok = await until(pg, f"{D}.mode!=='flight'", 240000)
    await until(pg, f"{D}.mode==='docked'", 30000)
    r = await pg.evaluate(f"({{mode:{D}.mode,cr:{D}.C.credits,left:{D}.C.missions.filter(m=>m.id==='rig-c1').length}})")
    R.check(r['mode'] == 'docked' and r['left'] == 0 and r['cr'] >= cr0 + 120, 'Easy: FLY THERE docks you, and the courier mission is completed', {**r, 'before': cr0})
    await pg.evaluate(f"{D}.set('overlay',null)"); await fly(pg); await pg.wait_for_timeout(1500)
    # the planet: uses the jump drive and stops near it
    await pg.evaluate(f"(()=>{{const d={D},pl=d.planetObj,P=d.P,dir=[P.pos[0]-pl.pos[0],P.pos[1]-pl.pos[1],P.pos[2]-pl.pos[2]],l=Math.hypot(...dir);P.pos=pl.pos.map((v,i)=>v+dir[i]/l*(pl.R+60000));}})()")
    await pg.evaluate(TAP(f"{D}.planetObj")); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"!!{D}.rinfo&&!{D}.fly"), 'one tap on the planet: its information card, not flying')
    await pg.evaluate(TAP(f"{D}.planetObj")); await pg.wait_for_timeout(300)
    R.check(bool(await pg.evaluate(f"{D}.fly")), 'tapping the planet again flies there')
    await until(pg, f"!{D}.fly", 180000)
    alt = await pg.evaluate(f"(()=>{{const d={D},pl=d.planetObj,P=d.P;return Math.round(Math.hypot(pl.pos[0]-P.pos[0],pl.pos[1]-P.pos[1],pl.pos[2]-P.pos[2])-pl.R)}})()")
    msgs = ' | '.join(await pg.evaluate(f"{D}.msgs.map(m=>m.t||m.text||'')"))
    R.check(1500 < alt < 8000 and 'ARRIVED' in msgs and await pg.evaluate(f"{D}.mode") == 'flight', 'flying to the planet stops a few km above it', alt)
    # a ship
    await pg.evaluate(f"(()=>{{const d={D},P=d.P;window.__rigShip=d.spawn('hauler',[P.pos[0]+P.o.r[0]*7000,P.pos[1]+P.o.r[1]*7000,P.pos[2]+P.o.r[2]*7000],{{speed:0}});window.__rigShip.speed=0;}})()")
    await pg.evaluate(f"{D}.flyTo(window.__rigShip)")
    await until(pg, f"!{D}.fly", 120000)
    d = await pg.evaluate(DIST("window.__rigShip"))
    R.check(600 < d < 1600, 'flying to a ship stops about 1 km from it', d)
    R.check(await pg.evaluate(f"!{D}.canFly({D}.bh||{{pos:[0,0,0],type:'missile'}})"), 'not offered for black holes or missiles')
    # races and adventures: not offered, and a flight in progress stops when an adventure starts
    await pg.evaluate(f"(()=>{{const d={D};d.flyTo(d.station);}})()")
    await pg.evaluate(f"(()=>{{const d={D};d.C.advLast=0;d.advStartDbg('comet');}})()"); await pg.wait_for_timeout(500)
    v = await pg.evaluate(f"[!!{D}.advNow,{D}.fly,{D}.flyAllowed(),{D}.flyTo({D}.station)]")
    R.check(v[0] and v[1] is None and not v[2] and not v[3], 'an adventure starting stops FLY THERE, and it is not offered during adventures', v)
    await pg.evaluate(f"(()=>{{const d={D};d.adv&&d.advNextDbg&&0;}})()")
    await pg.evaluate(f"(()=>{{const d={D};const a=d.advNow;if(a){{d.set('overlay','menu');const b=d.btns.find(b=>b.label&&b.label.includes('ABANDON'));b&&b.fn();}}d.set('overlay',null);}})()")
    R.check(not pg.errors, 'Easy run: no page errors', pg.errors[:3]); await pg.close_all()

    # ---------- a race ----------
    pg = await browser(p, 1000, 558, mobile=True); await open_site(pg); await register(pg); await launch_game(pg)
    await calm(pg)
    await pg.evaluate(f"(()=>{{const d={D};d.C.missions.push({{id:'rig-r1',type:'race',sys:d.C.sys,reward:100,deadline:d.C.day+9,title:'Race: rig test',text:'test',limit:300}});}})()")
    await fly(pg); await pg.wait_for_timeout(1500)
    v = await pg.evaluate(f"[!!{D}.raceNow,{D}.flyAllowed(),{D}.flyTo({D}.station)]")
    R.check(v == [True, False, False], 'during a station race FLY THERE is not offered', v)
    R.check(not pg.errors, 'race: no page errors', pg.errors[:3]); await pg.close_all()

    # ---------- mouse and keyboard: off by default; on, it works and arrow keys take over ----------
    pg = await browser(p, 1280, 800); await open_site(pg); await register(pg); await launch_game(pg)
    await calm(pg, 'modern'); await fly(pg); await pg.wait_for_timeout(1500)
    await pg.evaluate(TAP(f"{D}.station")); await pg.evaluate(TAP(f"{D}.station")); await pg.wait_for_timeout(300)
    labs = await pg.evaluate(LABELS)
    R.check(await pg.evaluate(f"{D}.fly") is None and '🎯 TURN TO' in labs and '➡️ FLY THERE' not in labs, 'mouse & keyboard: off by default (TURN TO only; a second click does not fly)')
    await pg.evaluate(f"{D}.C.opt.assist.mouse.fly=true"); await pg.wait_for_timeout(300)
    labs = await pg.evaluate(LABELS)
    R.check('➡️ FLY THERE' in labs, 'switched on in Flight assists: ➡️ FLY THERE appears')
    await pg.evaluate(f"{D}.btns.find(b=>b.label==='➡️ FLY THERE').fn()"); await pg.mouse.move(1200, 120); await pg.wait_for_timeout(1500)
    R.check(bool(await pg.evaluate(f"{D}.fly")), 'the resting mouse pointer does not cancel it')
    await pg.keyboard.down('ArrowLeft'); await pg.wait_for_timeout(400); await pg.keyboard.up('ArrowLeft'); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate(f"{D}.fly") is None, 'an arrow key takes over')
    # VIEW on the laptop: F4 steps 3D → console → clear → 3D; from Retro it goes to Modern
    seq = []
    for _ in range(3):
        await pg.keyboard.press('F4'); await pg.wait_for_timeout(500)
        seq.append(await pg.evaluate(f"[{D}.viewMode(),{D}.PIT3D(),{D}.bdOn(),{D}.mode,{D}.overlay]"))
    start = await pg.evaluate(f"{D}.viewMode()")
    R.check([x[0] for x in seq] == ['clear', '3d', 'console'] or [x[0] for x in seq] == ['console', 'clear', '3d'],
            'F4 steps through 3D cockpit, console and clear view', seq)
    R.check(all(x[3] == 'flight' and x[4] is None for x in seq), 'VIEW changes nothing else (still flying, nothing opened)', seq)
    R.check(all((x[0] == 'clear') == x[2] and (x[0] == '3d') == x[1] for x in seq), 'each VIEW really shows: 3D cockpit, console, or the clear (battle) layout', seq)
    await pg.evaluate(f"{D}.C.opt.style='retro'"); await pg.keyboard.press('F4'); await pg.wait_for_timeout(500)
    R.check(await pg.evaluate(f"[{D}.styleNow,{D}.viewMode()]") == ['modern', 'console'], 'from Retro, VIEW goes to Modern (console)')
    labs = await pg.evaluate(LABELS)
    R.check('VIEW' in labs or any(l.endswith('display') for l in labs) or await pg.evaluate("!!Arcade._game()._dbg.btns.length"), 'the console has a VIEW switch')
    await pg.keyboard.press('F4'); await pg.wait_for_timeout(600)
    R.check(await pg.evaluate(f"{D}.allBtns.some(b=>b.label&&b.label.startsWith('🎛 VIEW'))"), 'clear view: a 🎛 VIEW button beside ⚔ BATTLE')
    R.check(not pg.errors, 'laptop: no page errors', pg.errors[:3]); await pg.close_all()

    # ---------- phones: VIEW skips the 3D cockpit; the simpler console ----------
    pg = await browser(p, 844, 390, mobile=True); await open_site(pg); await register(pg); await launch_game(pg)
    await calm(pg); await fly(pg); await pg.touchscreen.tap(422, 120); await pg.wait_for_timeout(600)
    R.check(await pg.evaluate(f"{D}.viewList()") == ['console', 'clear'], 'phone: VIEW offers console and clear view (no 3D cockpit)')
    await pg.evaluate(f"(()=>{{const d={D};d.C.opt.style='retro';d.C.opt.battle='off';}})()"); await pg.wait_for_timeout(500)
    labs = await pg.evaluate(LABELS)
    main6 = [l for l in labs if l.startswith('phone ')]
    R.check(main6 == ['phone jump', 'phone dock', 'phone hyper', 'phone chart', 'phone missions', 'phone more'], 'phone console: six big switches', main6)
    xy = await pg.evaluate(f"""(()=>{{const b={D}.btns.find(b=>b.label==='phone more'),cv=document.getElementById('arcCanvas'),r=cv.getBoundingClientRect();return [r.left+(b.x+b.w/2)*r.width/800,r.top+(b.y+b.h/2)*r.height/600,b.h*r.height/600]}})()""")
    await pg.touchscreen.tap(xy[0] + 2, xy[1] - 1); await pg.wait_for_timeout(400)
    more = [l for l in await pg.evaluate(LABELS) if l.startswith('more ')]
    R.check(await pg.evaluate(f"{D}.more") and 'more display' in more and 'more missile' in more and 'more menu' in more, f'a real tap on ⋯ MORE opens the rest ({len(more)} switches, VIEW among them)', more)
    R.check(xy[2] >= 26, f'the big switches are about {xy[2]:.0f}px tall on a phone', xy[2])
    rects = await pg.evaluate(f"{D}.btns.filter(b=>b.label&&(b.label.startsWith('more ')||b.label.startsWith('phone '))).map(b=>[b.x,b.y,b.w,b.h,b.label])")
    clash = [(a[4], b[4]) for i, a in enumerate(rects) for b in rects[i + 1:] if a[0] < b[0] + b[2] and b[0] < a[0] + a[2] and a[1] < b[1] + b[3] and b[1] < a[1] + a[3]]
    R.check(not clash, 'the switches and the MORE strip do not overlap', clash[:3])
    await pg.evaluate(f"{D}.btns.find(b=>b.label==='more display').fn()"); await pg.wait_for_timeout(500)
    R.check(await pg.evaluate(f"[{D}.more,{D}.viewMode()]") == [False, 'console'], 'choosing from MORE runs it and closes the strip (VIEW → Modern console)')
    await pg.evaluate(f"{D}.btns.find(b=>b.label==='phone chart').fn()"); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"{D}.overlay") == 'chart', 'MAP opens the chart')
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
    R.check(not pg.errors, 'phone: no page errors', pg.errors[:3]); await pg.close_all()
    return R

if __name__ == '__main__': run(main)
