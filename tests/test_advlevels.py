"""Adventure puzzles by level (js/starlane-adv-levels.js): every puzzle that has levels is checked for shape (it
matches its scene, one right answer among different options, an explanation, every level a different question), the
generated number puzzles are re-solved here in Python 200 times each, and in the game each level really gets its
own puzzle (young, mid, older and adult)."""
import re
from rig import *

D = "Arcade._game()._dbg"
PRIMES = [p for p in range(2, 200) if all(p % d for d in range(2, int(p ** .5) + 1))]

def solve(q):
    """Independent answer for a generated number puzzle, from its wording (None if the wording is not recognised)."""
    m = re.search(r'flash ([\d, ]+)… Each time they add the same number', q)
    if m:
        s = [int(x) for x in m[1].split(',')]; return s[-1] + (s[1] - s[0])
    m = re.search(r'Count the flashes: ([\d, ]+)… these are prime numbers', q)
    if m:
        s = [int(x) for x in m[1].split(',')]; return PRIMES[PRIMES.index(s[-1]) + 1]
    m = re.search(r'They have reached (\d+)\. What is the next prime', q)
    if m: return PRIMES[PRIMES.index(int(m[1])) + 1]
    m = re.search(r'What is the (\d+)th prime', q)
    if m: return PRIMES[int(m[1]) - 1]
    m = re.search(r'(?:show|that is|code is) ([01](?: [01])+)', q) or re.search(r'binary code ([01]+)', q) or re.search(r'Convert ([01]+) \(base 2\)', q)
    if m: return int(m[1].replace(' ', ''), 2)
    m = re.search(r'What is ([0-9A-F]{2}) in decimal', q)
    if m: return int(m[1], 16)
    m = re.search(r'weighs (\d+) on Earth scales|weighing (\d+) on Earth|a (\d+) N weight', q)
    if m: w = int(next(g for g in m.groups() if g)); return w / 6
    m = re.search(r'What does a (\d+) kg box weigh there', q)
    if m: return int(m[1]) * 1.6
    m = re.search(r'Each of (\d+) corridors needs (\d+) bulbs, and each bulb costs (\d+) Cr', q)
    if m: return int(m[1]) * int(m[2]) * int(m[3])
    m = re.search(r'(\d+) corridors (?:with|×) (\d+) bulbs', q)
    if m: return int(m[1]) * int(m[2])
    m = re.search(r'(\d+) new bulbs, each using (\d+) W, stay on for (\d+) hours', q)
    if m: return int(m[1]) * int(m[2]) * int(m[3])
    return None

async def main(p):
    R = Result('advlevels')
    pg = await browser(p, 1280, 800); await open_site(pg); await register(pg); await launch_game(pg)
    await until(pg, f"{D}.mode==='docked'", 20000)
    # every level of every puzzle, as the game will use it (generated ones made 200 times)
    data = await pg.evaluate("""(()=>{const L=window.StarAdvLevels,out=[];for(const id in L){const def=StarAdv.find(id);for(const k in L[id]){const sc=def&&def.scenes[+k];
      for(const t of ['young','mid','older','adult']){const f=L[id][k][t];if(!f)continue;const runs=typeof f==='function'?200:1;
       for(let i=0;i<runs;i++)out.push({id,k:+k,t,gen:typeof f==='function',type:sc&&sc.type,many:!!(sc&&sc.many),v:typeof f==='function'?f():f});}}}return out;})()""")
    R.check(len(data) > 0, 'the levels file loads', len(data))
    shape, sums, unknown = [], [], set()
    for d in data:
        v, ref = d['v'], f"{d['id']}/{d['k']}/{d['t']}"
        if not v.get('q') or not v.get('explain'): shape.append((ref, 'question or explanation missing')); continue
        if d['type'] == 'choose':
            o, a = v.get('options') or [], v.get('answer')
            if len(o) < 3 or len(set(o)) != len(o): shape.append((ref, 'needs 3+ different options'))
            if d['many'] != isinstance(a, list): shape.append((ref, 'one answer vs several does not match the scene'))
            idx = a if isinstance(a, list) else [a]
            if not all(isinstance(i, int) and 0 <= i < len(o) for i in idx): shape.append((ref, 'answer not among the options'))
        elif d['type'] == 'order':
            it = v.get('items') or []
            if len(it) < 3 or len(set(it)) != len(it): shape.append((ref, 'order needs 3+ different items'))
        elif d['type'] == 'code':
            a = v.get('answer')
            if not isinstance(a, str) or not re.fullmatch(r'-?\d+(\.\d+)?', a): shape.append((ref, f'code answer must be a number string: {a!r}'))
            if d['gen']:
                want = solve(v['q'])
                if want is None: unknown.add(ref)
                elif abs(float(a) - want) > 1e-9: sums.append((ref, v['q'], a, want))
        else: shape.append((ref, f'scene type {d["type"]!r} cannot have levels'))
    R.check(not shape, 'every puzzle level has the right shape: one right answer among different options, an explanation', shape[:5])
    gen = sum(1 for d in data if d['gen'])
    R.check(not sums and not unknown, f'generated number puzzles: {gen} made and re-solved independently', (sums[:3], sorted(unknown)[:5]))
    # each puzzle's levels ask different questions (fixed ones; generated ones always differ by design)
    by = {}
    for d in data:
        if not d['gen']: by.setdefault((d['id'], d['k']), {})[d['t']] = d['v']['q']
    same = [k for k, qs in by.items() if len(set(qs.values())) != len(qs)]
    R.check(not same, 'every level of a puzzle is a different question', same[:5])
    # in the game: each level gets its own puzzle, and adult falls back to older where there is no adult version
    await test_mode(pg)   # space adventures start in flight; test mode takes us there
    lvls = await pg.evaluate("Object.keys(window.StarAdvLevels)")
    seen = {}
    for lv in ('young', 'mid', 'older', 'adult'):
        await pg.evaluate(f"(()=>{{const d={D};d.C.opt.advAge='{lv}';}})()")
        qs = []
        for aid in lvls:
            await pg.evaluate(f"{D}.advStartDbg('{aid}')"); await pg.wait_for_timeout(150)
            qs.append(await pg.evaluate(f"(()=>{{const a={D}.adv;if(!a)return null;const k=+Object.keys(window.StarAdvLevels['{aid}'])[0],sc=a.def.scenes[k];return sc&&sc.q?sc.q['{lv}']||null:null;}})()"))
            await pg.evaluate(f"(()=>{{const d={D};if(d.adv){{d.set('overlay','menu');const b=d.btns.find(b=>b.label&&b.label.includes('ABANDON'));b&&b.fn();}}d.set('overlay',null);}})()")
        seen[lv] = qs
    R.check(all(all(seen[lv]) for lv in seen), 'in the game, every level has a question for every adventure with levels', {lv: sum(1 for q in seen[lv] if not q) for lv in seen})
    diff = sum(1 for i in range(len(lvls)) if len({seen[lv][i] for lv in seen}) == 4)
    R.check(diff >= len(lvls) - 1, f'young, mid, older and adult players get four different first puzzles ({diff}/{len(lvls)} adventures)', diff)
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all()
    return R

if __name__ == '__main__': run(main)
