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
    m = re.search(r'REPEAT (\d+) times: \{ REPEAT (\d+) times: wipe a table \}\. Then wipe (\d+) more tables', q)
    if m: return int(m[1]) * int(m[2]) + int(m[3])
    m = re.search(r'REPEAT (\d+) times: wipe (\d+) tables', q) or re.search(r'A loop runs (\d+) times, wiping (\d+) tables each time', q)
    if m: return int(m[1]) * int(m[2])
    m = re.search(r'total = 1\. REPEAT (\d+) times: total = total × 2', q)
    if m: return 2 ** int(m[1])
    m = re.search(r'For every 1 cup of blue fuel we add (\d+) cups of green\. We use (\d+) cups of blue', q)
    if m: return int(m[1]) * int(m[2])
    m = re.search(r'Blue : green = (\d+) : (\d+)\. We have (\d+) litres of blue', q)
    if m: return int(m[3]) / int(m[1]) * int(m[2])
    m = re.search(r'We need (\d+) litres of fuel mixed blue : green = (\d+) : (\d+)\. How many litres of green', q)
    if m: return int(m[1]) / (int(m[2]) + int(m[3])) * int(m[3])
    m = re.search(r'The tank contains (\d+) litres of fuel mixed blue : green = 1 : 3 \(and it has plenty of room\)\. How many litres of blue must we add to make it 1 : 1', q)
    if m: t = int(m[1]); return t * 3 / 4 - t / 4
    m = re.search(r'We pour in (\d+) cups of blue and (\d+) cups of green', q) or re.search(r'holds (\d+) litres of blue and (\d+) litres of green', q)
    if m: return int(m[1]) + int(m[2])
    m = re.search(r'The fuel tank holds (\d+) litres and is (\d+)/(\d+) full', q)
    if m: return int(m[1]) * int(m[2]) / int(m[3])
    m = re.search(r'A full tank holds (\d+) litres and it is (\d+)% full\. Each jump burns (\d+) litres', q)
    if m: return int(int(m[1]) * int(m[2]) / 100 // int(m[3]))
    m = re.search(r'How many minutes are there in (\d+) hours', q)
    if m: return 60 * int(m[1])
    m = re.search(r'How many seconds are there in (\d+) minutes', q)
    if m: return 60 * int(m[1])
    if 'How many seconds are there in one day' in q: return 24 * 3600
    if 'How many minutes are there in one week' in q: return 7 * 24 * 60
    if 'How many hours are there in a year of 365 days' in q: return 365 * 24
    m = re.search(r'It is (\d+) o’clock\. The delivery comes (\d+) hours later', q)
    if m: return int(m[1]) + int(m[2])
    m = re.search(r'It is (\d+):00\. The delivery is in (\d+) hours', q) or re.search(r'Departure (\d+):00\. The journey takes (\d+) hours', q)
    if m: return (int(m[1]) + int(m[2])) % 24
    m = re.search(r'We leave at (\d+):00 local time\. The flight takes (\d+) hours, and the destination’s clocks are (\d+) hours ahead', q)
    if m: return (int(m[1]) + int(m[2]) + int(m[3])) % 24
    m = re.search(r'needs the number (\d+) in binary\. Write it in binary', q)
    if m: return int(bin(int(m[1]))[2:])
    m = re.search(r'The probe counts in binary: ([01](?: [01])+)', q)
    if m: return int(m[1].replace(' ', ''), 2)
    m = re.search(r'A row has (\d+) panels and there are (\d+) rows', q) or re.search(r'We need (\d+) rows of (\d+) panels', q)
    if m: return int(m[1]) * int(m[2])
    m = re.search(r'A grid of (\d+) × (\d+) panels has (\d+) broken ones', q)
    if m: return int(m[1]) * int(m[2]) - int(m[3])
    m = re.search(r'Each panel is 1\.5 m by 1 m\. What is the total area, in square metres, of a grid (\d+) panels by (\d+) panels', q)
    if m: return 1.5 * int(m[1]) * int(m[2])
    m = re.search(r'A day here is (\d+) hours long\. How many hours are in 2 days', q)
    if m: return 2 * int(m[1])
    m = re.search(r'A day lasts (\d+) hours\. How many hours are in a 7-day week', q)
    if m: return 7 * int(m[1])
    m = re.search(r'A (\d+)-hour day: how many hours are in (\d+) days', q)
    if m: return int(m[1]) * int(m[2])
    m = re.search(r'A day on this planet lasts (\d+) hours\. How many of its days fit into 365 Earth days', q)
    if m: return 365 * 24 / int(m[1])
    m = re.search(r'You count (\d+) beats in 15 seconds', q)
    if m: return 4 * int(m[1])
    m = re.search(r'You count (\d+) beats in 10 seconds', q)
    if m: return 6 * int(m[1])
    m = re.search(r'A pulse of (\d+) beats every (\d+) seconds', q)
    if m: return int(m[1]) * 60 / int(m[2])
    m = re.search(r'beats (\d+) times a minute\. How many times does it beat in a whole day', q)
    if m: return int(m[1]) * 60 * 24
    m = re.search(r'flashes (\d+) times every second\. How many flashes in (\d+) seconds', q)
    if m: return int(m[1]) * int(m[2])
    m = re.search(r'flashes (\d+) times per second\. How many flashes in one minute', q)
    if m: return int(m[1]) * 60
    m = re.search(r'spins (\d+) times per second\. How many times does it spin in one hour', q)
    if m: return int(m[1]) * 3600
    m = re.search(r'flashes are (\d+) milliseconds apart', q)
    if m: return 1000 / int(m[1])
    m = re.search(r'The long way is (\d+) light years\. The wormhole is (\d+) light year', q) or re.search(r'The normal route is (\d+) light years; the wormhole route is (\d+)\. How many light years', q)
    if m: return int(m[1]) - int(m[2])
    m = re.search(r'The long route is (\d+) light years; the wormhole route is ([\d.]+)\. What percentage', q)
    if m: return (int(m[1]) - float(m[2])) / int(m[1]) * 100
    m = re.search(r'covers (\d+) light years a day\. The normal route is (\d+) light years; through the wormhole it is (\d+)', q)
    if m: return (int(m[2]) - int(m[3])) / int(m[1])
    m = re.search(r'The ice in the pipe is at −(\d+) °C\. The heater warms it by (\d+) °C every minute', q)
    if m: return int(m[1]) / int(m[2])
    m = re.search(r'sensor reads (−?\d+) °C.*What is that in °F', q)
    if m: return int(m[1].replace('−', '-')) * 1.8 + 32
    return None

def decode(q):
    """Caesar puzzles: undo the stated shift."""
    m = re.search(r'The message is ([A-Z]+)\. Each letter has been moved (\d+) place', q)
    if not m: return None
    n = int(m[2]); return ''.join(chr((ord(c) - 65 - n) % 26 + 65) for c in m[1])

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
            elif d['gen']:
                w = decode(v['q'])
                if w is None: unknown.add(ref)
                elif o[a] != w: sums.append((ref, v['q'], o[a], w))
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
