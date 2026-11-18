"""Station races: all six kinds (🏁 gates, 🪨 slalom, 🎯 targets, 🔢 maths gates, 🤖 rival, 💣 minefield).
Each is set up and flown (the test moves the ship through the gates), and the clock, penalties, bonuses, the rival,
the E.C.M. against mines, best times, the medal and the mission board are checked. Maths-gate questions are re-solved
independently for every level."""
import re
from rig import *

D = "Arcade._game()._dbg"

def solve(q):
    q = q.replace('−', '-')
    m = re.fullmatch(r'(-?\d+) ([+\-×÷]) (\d+)', q)
    if m:
        a, op, b = int(m[1]), m[2], int(m[3])
        return {'+': a + b, '-': a - b, '×': a * b, '÷': a / b}[op]
    m = re.fullmatch(r'(\d+)²', q)
    if m: return int(m[1]) ** 2
    m = re.fullmatch(r'([\d.]+)% of (\d+)', q)
    if m: return float(m[1]) * int(m[2]) / 100
    m = re.fullmatch(r'2 to the power (\d+)', q)
    if m: return 2 ** int(m[1])
    return None

async def fly_to(pg, pos, wait=350):
    await pg.evaluate(f"(()=>{{const P={D}.P;P.pos={json.dumps(pos)};P.speed=0;P.throttle=0;}})()"); await pg.wait_for_timeout(wait)

async def start(pg, kind, par=300):
    await pg.evaluate(f"""(()=>{{const d={D};d.C.missions=[{{id:'t-{kind}',type:'race',kind:'{kind}',sys:d.C.sys,par:{par},reward:100,deadline:d.C.day+1,title:'test',text:''}}];d.setupRace();}})()""")
    return await pg.evaluate(f"(()=>{{const r={D}.raceNow;return r?{{kind:r.kind,n:r.gates.length,objs:r.objs.length,tgts:r.objs.filter(o=>o.raceTgt).length,mines:r.objs.filter(o=>o.raceMine).length,rival:!!r.rival}}:null}})()")

async def main(p):
    R = Result('races')
    # the maths-gate questions, solved again here, at every level
    pg = await browser(p, 1280, 800); await open_site(pg); await register(pg); await launch_game(pg)
    await until(pg, f"{D}.mode==='docked'", 20000)
    bad = []
    for lv, setup in (('young', "window.bank=null;d.C.opt.advAge='young'"), ('mid', "d.C.opt.advAge='mid'"), ('older', "d.C.opt.advAge='older'"), ('adult', "window.bank=window.ADULT_BANK")):
        qs = await pg.evaluate(f"(()=>{{const d={D},keep=window.bank;{setup};const out=[];for(let i=0;i<300;i++)out.push(d.raceQ());window.bank=keep;return out;}})()")
        for q in qs:
            a = solve(q['q'])
            if a is None or abs(a - q['a']) > 1e-9 or q['opts'].count(q['a']) != 1 or len(set(q['opts'])) != 3 or q['opts'][q['ans']] != q['a'] or (lv in ('young', 'mid') and min(q['opts']) < 0):
                bad.append((lv, q))
    R.check(not bad, 'maths gates: 1,200 questions re-solved at every level; one right answer, three different gates', bad[:3])
    # the board offers every kind
    kinds = await pg.evaluate(f"(()=>{{const d={D},seen={{}},day=d.C.day;for(let k=0;k<200;k++){{d.C.day=day+k;for(const o of d.genBoard())if(o.type==='race')seen[o.kind]=o.title;}}d.C.day=day;return seen;}})()")
    R.check(sorted(kinds) == sorted(await pg.evaluate(f"{D}.RACE_ORDER")), 'the mission board offers all six kinds of race', kinds)
    await pg.evaluate(f"{D}.launchDbg()"); await until(pg, f"{D}.mode==='flight'", 30000)
    await pg.evaluate(f"(()=>{{const d={D};d.C.equip.ecm=1;}})()")
    want = {'ring': dict(objs=0), 'slalom': dict(objs=21), 'targets': dict(tgts=7), 'maths': dict(n=6), 'rival': dict(rival=True), 'mines': dict(mines=14)}
    for kind in await pg.evaluate(f"{D}.RACE_ORDER"):
        info = await start(pg, kind)
        R.check(bool(info) and info['kind'] == kind and all(info.get(k) == v for k, v in want[kind].items()), f'{kind}: the course is set up', info)
        gates = await pg.evaluate(f"{D}.raceNow.gates.map(g=>g.opts?{{opts:g.opts.map(o=>o.pos),ans:g.q.ans}}:{{pos:g.pos}})")
        exp_pen, exp_bonus = 0, 0
        for i, g in enumerate(gates):
            if 'opts' in g:
                pick = g['ans'] if i != 1 else (g['ans'] + 1) % 3   # checkpoint 2: the wrong gate
                if i == 1: exp_pen += 5
                await fly_to(pg, g['opts'][pick])
            else: await fly_to(pg, g['pos'])
            if i == 0:
                R.check(await pg.evaluate(f"{D}.raceNow&&{D}.raceNow.t0!==null"), f'{kind}: the clock starts at gate 1')
                if kind == 'slalom':   # fly into a rock
                    rock = await pg.evaluate(f"{D}.raceNow.objs.find(o=>!o.dead).pos")
                    await fly_to(pg, rock, 600); exp_pen += 3
                    R.check(await pg.evaluate(f"{D}.raceNow.pen") == 3, 'slalom: hitting a rock adds 3 s', await pg.evaluate(f"{D}.raceNow.pen"))
                if kind == 'targets':
                    await pg.evaluate(f"(()=>{{const d={D};d.raceNow.objs.filter(o=>o.raceTgt).slice(0,2).forEach(o=>d.kill(o,true));}})()"); exp_bonus += 4
                    R.check(await pg.evaluate(f"{D}.raceNow.bonus") == 4, 'targets: two targets shot take 4 s off', await pg.evaluate(f"{D}.raceNow.bonus"))
                if kind == 'mines':
                    mines = await pg.evaluate(f"{D}.raceNow.objs.filter(o=>o.raceMine&&!o.dead).map(o=>o.pos)")
                    near = [mines[1][0] + 900, mines[1][1], mines[1][2]]
                    await fly_to(pg, near, 200); await pg.evaluate(f"{D}.ecm()"); await pg.wait_for_timeout(400)
                    r = await pg.evaluate(f"[{D}.raceNow.objs.filter(o=>o.raceMine&&o.dead).length,{D}.raceNow.pen]")
                    R.check(r[0] >= 1 and r[1] == 0, 'minefield: the E.C.M. clears nearby mines with no penalty', r)
                    await fly_to(pg, mines[5], 700); exp_pen += 3
                    R.check(await pg.evaluate(f"{D}.raceNow.pen") == 3, 'minefield: flying into a mine adds 3 s', await pg.evaluate(f"{D}.raceNow.pen"))
        r = await pg.evaluate(f"(()=>{{const d={D},m=d.C.missions[0];return [m.done,m.time,(d.C.raceBest||{{}})['{kind}']]}})()")
        R.check(r[0] is True and r[1] is not None and r[2] == r[1] and r[1] >= max(0, exp_pen - exp_bonus), f'{kind}: finishing wins the race and records the best time (penalties +{exp_pen} s, bonus −{exp_bonus} s)', r)
    R.check(await pg.evaluate(f"!!({D}.C.medals||{{}}).allraces"), 'winning all six kinds earns the medal')
    # the rival wins if you are too slow, and the race starts again
    await start(pg, 'rival', par=6)
    g0 = await pg.evaluate(f"{D}.raceNow.gates[0].pos"); await fly_to(pg, g0)
    await fly_to(pg, [g0[0], g0[1] + 5000, g0[2]])   # then wait well away from the gates
    await pg.wait_for_timeout(13000)   # the rival takes at least 10 s
    r = await pg.evaluate(f"[{D}.raceNow&&{D}.raceNow.next,{D}.raceNow&&{D}.raceNow.t0,{D}.C.missions[0].done]")
    R.check(r[0] == 0 and r[1] is None and not r[2], 'rival: too slow, the rival gets there first and the race starts again', r)
    # career record shows the races
    await pg.evaluate(f"{D}.set('overlay','career')"); await pg.wait_for_timeout(400)
    R.check(not pg.errors, 'no page errors (laptop)', pg.errors[:3]); await pg.close_all()
    # Fold: maths gates draw on a touch screen
    pg = await browser(p, 1000, 700, True); await open_site(pg); await register(pg); await launch_game(pg)
    await until(pg, f"{D}.mode==='docked'", 20000); await pg.touchscreen.tap(500, 350)
    await pg.evaluate(f"{D}.launchDbg()"); await until(pg, f"{D}.mode==='flight'", 30000)
    await start(pg, 'maths'); await pg.wait_for_timeout(800)
    if os.environ.get('SHOTS'): OUT.mkdir(exist_ok=True); await pg.screenshot(path=str(OUT / 'race-maths-fold.png'))
    R.check(not pg.errors, 'maths gates on the Fold: no page errors', pg.errors[:3]); await pg.close_all()
    return R

if __name__ == '__main__': run(main)
