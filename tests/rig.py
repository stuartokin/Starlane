"""Starlane test rig — shared helpers.

Serves the Starlane repo (and, if present, the ApolloMaths repo next to it) on a local web server
so both sites run exactly as they do on stuartokin.github.io (http://localhost:PORT/Starlane/,
http://localhost:PORT/ApolloMaths/), then drives them in headless Chromium with Playwright.

Locations: STARLANE_ROOT (default: the folder above tests/) and APOLLO_ROOT
(default: a folder called ApolloMaths next to the Starlane folder). No other paths are assumed.
The test-mode code is NEVER stored here: tests that need it read STARLANE_CODE and skip without it.
"""
import os, sys, threading, http.server, socketserver, tempfile, functools, asyncio, json, pathlib

HERE = pathlib.Path(__file__).resolve().parent
STARLANE = pathlib.Path(os.environ.get('STARLANE_ROOT', HERE.parent)).resolve()
APOLLO = pathlib.Path(os.environ.get('APOLLO_ROOT', STARLANE.parent / 'ApolloMaths')).resolve()
HAS_APOLLO = (APOLLO / 'index.html').exists()
OUT = HERE / 'out'                      # screenshots land here (ignored by git)
PORT = int(os.environ.get('RIG_PORT', '8765'))
BASE = f'http://localhost:{PORT}'

_server = None
def serve():
    """Start (once) a web server whose root holds /Starlane and /ApolloMaths as siblings."""
    global _server
    if _server: return BASE
    root = pathlib.Path(tempfile.mkdtemp(prefix='starlane-rig-'))
    (root / 'Starlane').symlink_to(STARLANE)
    if HAS_APOLLO: (root / 'ApolloMaths').symlink_to(APOLLO)
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    _server = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=str(root)))
    threading.Thread(target=_server.serve_forever, daemon=True).start()
    return BASE

class Result:
    """Collects pass/fail lines for one test file."""
    def __init__(self, name): self.name, self.fails, self.lines = name, [], []
    def check(self, ok, label, detail=''):
        self.lines.append(('PASS' if ok else 'FAIL', label, detail))
        if not ok: self.fails.append(label)
        print(f"  {'✅' if ok else '❌'} {label}{(' — ' + str(detail)) if detail else ''}", flush=True)
        return ok
    def skip(self, label, why): self.lines.append(('SKIP', label, why)); print(f'  ⏭️  {label} — {why}', flush=True)

async def browser(p, w=1280, h=800, mobile=False):
    """A fresh browser page that records page errors in page.errors."""
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
    pg = await ctx.new_page(); pg.errors = []
    pg.on('pageerror', lambda e: pg.errors.append(str(e)[:300]))
    pg.close_all = b.close
    return pg

async def open_site(pg, fresh=True):
    await pg.goto(f'{serve()}/Starlane/index.html')
    if fresh: await pg.evaluate('localStorage.clear()'); await pg.reload()
    await pg.wait_for_timeout(700)

async def register(pg, name='Rig Tester', band='11-12'):
    await pg.fill('#pilotName', name); await pg.select_option('#pilotBand', band)
    await pg.click('#pilotSave'); await pg.wait_for_timeout(200)

async def until(pg, js, timeout=15000, step=200):
    """Wait until a JavaScript expression is truthy; returns its value (or None on timeout)."""
    for _ in range(max(1, timeout // step)):
        try:
            v = await pg.evaluate(js)
            if v: return v
        except Exception: pass
        await pg.wait_for_timeout(step)
    return None

GAME = "(()=>{try{return Arcade._game()}catch(e){return null}})()"
async def launch_game(pg):
    """Press LAUNCH on the launch page and wait until the game is running past its title screen."""
    await pg.click('#playBtn')
    ok = await until(pg, "(()=>{try{return Arcade.status().view==='game'&&!!Arcade._game()._dbg}catch(e){return false}})()")
    await pg.evaluate("(()=>{const g=Arcade._game();if(g&&g.intro&&g.tap)g.tap();})()")
    await pg.wait_for_timeout(300)
    # a new commander gets Nova's welcome first; tests skip it
    await pg.evaluate("(()=>{const d=Arcade._game()._dbg;d.C.introSeen=true;if(d.overlay==='intro')d.set('overlay',null);})()")
    await pg.wait_for_timeout(400)
    return bool(ok)

async def test_mode(pg):
    """Open the game's test mode directly (the code box is tested separately, only with STARLANE_CODE)."""
    await until(pg, "['flight','docked'].includes(Arcade._game()._dbg.mode)", 20000)
    await pg.evaluate("Arcade._game().testMode()"); await pg.wait_for_timeout(300)
    return await pg.evaluate("!!Arcade._game().inTest()")

def run(main):
    from playwright.async_api import async_playwright
    async def go():
        async with async_playwright() as p: return await main(p)
    r = asyncio.run(go())
    sys.exit(1 if r and r.fails else 0)
