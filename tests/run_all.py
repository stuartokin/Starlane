"""Run the whole Starlane test rig and print a summary. Exit code 0 only if everything passed.
   python tests/run_all.py            all suites
   python tests/run_all.py site,bridge   only some
Writes tests/out/report.md (used by the automated workflows as their evidence)."""
import sys, time, asyncio, importlib, datetime
from rig import *
from playwright.async_api import async_playwright
SUITES = ['static', 'site', 'gameplay', 'adventures', 'bridge']

async def go(names):
    results = []
    async with async_playwright() as p:
        for n in names:
            print(f'\n▶ {n}', flush=True); t = time.time()
            mod = importlib.import_module(f'test_{n}')
            argv, sys.argv = sys.argv, [sys.argv[0]]          # suites read their own args; none here
            try: r = await mod.main(p)
            except Exception as e:
                r = Result(n); r.check(False, f'{n} crashed', repr(e)[:200])
            sys.argv = argv
            results.append((n, r, time.time() - t))
    return results

if __name__ == '__main__':
    names = sys.argv[1].split(',') if len(sys.argv) > 1 else SUITES
    res = asyncio.run(go(names))
    OUT.mkdir(exist_ok=True)
    lines = [f'# Starlane test report — {datetime.datetime.now():%Y-%m-%d %H:%M}', '',
             f'ApolloMaths found: {"yes" if HAS_APOLLO else "no (bridge and exam checks skipped)"}', '']
    total_fail = 0
    print('\n══════ summary ══════')
    for n, r, secs in res:
        p_ = sum(1 for l in r.lines if l[0] == 'PASS'); f_ = len(r.fails); s_ = sum(1 for l in r.lines if l[0] == 'SKIP'); total_fail += f_
        print(f"{'✅' if not f_ else '❌'} {n:11} {p_} passed, {f_} failed, {s_} skipped  ({secs:.0f}s)")
        lines.append(f"## {n} — {p_} passed, {f_} failed, {s_} skipped"); lines += [f'- {a} {b}' + (f' — {c}' if c else '') for a, b, c in r.lines]; lines.append('')
    (OUT / 'report.md').write_text('\n'.join(lines), encoding='utf-8')
    print('\nALL PASSED' if not total_fail else f'\n{total_fail} FAILED', '· report: tests/out/report.md')
    sys.exit(1 if total_fail else 0)
