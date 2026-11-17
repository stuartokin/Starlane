"""📈 TREND questions (the market's price-graph puzzle): every level gets questions about the graph shown; adults get the
hardest set (percentage change, median, daily rate, a prediction, the biggest move, best profit, rise back to the peak);
every answer is solved a second time here, independently, from the graph's numbers; each has a worked explanation;
the exam-practice question engine doesn't replace the graph question."""
import re
from rig import *

D = "Arcade._game()._dbg"

def solve(q):
    """Work the answer out again from the graph (the second solve)."""
    ps = [d['p'] for d in q['graph']]; n = len(ps); t = q['q']
    first, last, hi, lo = ps[0], ps[-1], max(ps), min(ps)
    if 'By how much did the price change from day' in t: return last - first
    if 'mean (average) price' in t:
        k = int(re.search(r'last (\d+) days', t).group(1)); L = ps[-k:]; return sum(L) / len(L)
    if 'range of the prices' in t: return hi - lo
    if 'By what percentage did the price' in t: return (last - first) / first * 100
    if 'median price' in t:
        so = sorted(ps); return so[(n - 1) // 2] if n % 2 else (so[n // 2 - 1] + so[n // 2]) / 2
    if 'change per day' in t: return (last - first) / (n - 1)
    if "in 3 days' time" in t: return last + 3 * (last - first) / (n - 1)
    if 'biggest change in the price' in t: return max(abs(ps[i + 1] - ps[i]) for i in range(n - 1))
    if 'most profit you could have made' in t:
        tons = int(re.search(r'bought (\d+) tonnes', t).group(1))
        return tons * max(ps[b] - ps[a] for a in range(n) for b in range(a + 1, n))
    if 'have to rise to get back to its highest' in t: return (hi - last) / last * 100
    return None

async def gen(pg, n=160):
    return await pg.evaluate(f"""(()=>{{const d={D},out=[];for(let i=0;i<{n};i++){{const g=[0,1,2,3,4,5,6,7,8,9][i%10];d.C.day=8+Math.floor(i/10)%9;d.trendDbg(g);const q=d.makeMathQDbg('trend');
        out.push({{q:q.q,a:q.ans,opts:q.opts,graph:q.graph,how:q.how||'',tp:q.tp,u:q.u}});}}return out;}})()""")

KEYS = ['By how much did the price change from day', 'mean (average) price', 'range of the prices', 'By what percentage did the price', 'median price',
        'change per day', "in 3 days' time", 'biggest change in the price', 'most profit you could have made', 'have to rise to get back to its highest']
def kinds(qs):
    return sorted({next((k for k in KEYS if k in q['q']), '?') for q in qs})

async def main(p):
    R = Result('trend')
    for band, label, tier in (('9-10', 'ages 9–10', 0), ('13-14', 'ages 13–14', 1), ('adult', 'adult', 2)):
        pg = await browser(p, 1280, 800); await open_site(pg); await register(pg, 'Rig Tester', band); await launch_game(pg)
        await pg.evaluate(f"{D}.C.day=12")
        qs = await gen(pg)
        bad = []
        for q in qs:
            want = solve(q)
            if want is None: bad.append(('unknown', q['q'][:60])); continue
            dp = 1
            if abs(float(q['a']) - round(want, dp)) > 0.051: bad.append(('wrong', q['q'][:60], q['a'], round(want, 2)))
            if str(q['a']) not in [str(o) for o in q['opts']] and f"{float(q['a']):.1f}" not in [str(o) for o in q['opts']]: bad.append(('answer not an option', q['q'][:50], q['a'], q['opts']))
            if len(set(map(str, q['opts']))) != len(q['opts']): bad.append(('repeated options', q['opts']))
            if len(q['how']) < 20: bad.append(('no explanation', q['q'][:50]))
        R.check(not bad, f'{label}: {len(qs)} trend questions, every answer re-solved from the graph and explained', bad[:3])
        k = kinds(qs)
        if tier == 0: R.check(len(k) == 3, f'{label}: the three basic graph questions', k)
        elif tier == 1: R.check(len(k) >= 6, f'{label}: a mix of basic and harder graph questions ({len(k)} kinds)', k)
        else:
            easy = [q for q in qs if any(s in q['q'] for s in ('By how much did the price change', 'range of the prices', 'mean (average) price'))]
            R.check(len(k) >= 7 and '?' not in k and not easy, f'adult: only the harder graph questions ({len(k)} kinds; none of the basic three)', k)
        R.check(not pg.errors, f'{label}: no page errors', pg.errors[:2]); await pg.close_all()
    # exam practice: the question engine answers other puzzles, but TREND still asks about the graph
    pg = await browser(p, 1280, 800); await open_site(pg); await register(pg, 'Rig Tester', 'x-grammar11'); await launch_game(pg)
    await pg.evaluate(f"(()=>{{const d={D};window.StarlaneQuestions.get=()=>({{q:'Engine question',opts:['1','2','3','4'],ans:'1'}});}})()")
    q = (await gen(pg, 5))[0]
    R.check(q['q'] != 'Engine question' and q['graph'], 'exam practice: TREND still asks about the graph shown', q['q'][:60])
    await pg.close_all()
    return R

if __name__ == '__main__': run(main)
