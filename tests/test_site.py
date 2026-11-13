"""The standalone site: launch page, pilot registration, game start, saving, the test-mode code box,
Stop, the trailer and tour videos, and where the maths comes from at each pilot level."""
from rig import *

async def main(p):
    R = Result('site')
    pg = await browser(p, 1280, 800); await open_site(pg)
    await register(pg, 'Rig Tester', '11-12')
    R.check(await launch_game(pg), 'LAUNCH starts the game')
    R.check(await pg.evaluate("playerName()") == 'Rig Tester', 'pilot name reaches the game')
    R.check(await pg.evaluate("window.STARLANE_LEVEL()") == 2, 'pilot level 11–12 → question band 2')
    keys = await pg.evaluate("Object.keys(localStorage)")
    R.check(keys == ['starlane-standalone-v1'], 'saves only under starlane-standalone-v1', keys)
    q = await pg.evaluate("Arcade._game()._dbg.makeMathQDbg('trade')")
    R.check(bool(q and q.get('q') and q.get('ans') in q.get('opts', [])), 'a maths question is built with its answer among the options', (q or {}).get('q', '')[:70])
    # the code box: a wrong code is refused; the right one (only if supplied) opens test mode
    await pg.evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'G',ctrlKey:true,shiftKey:true,bubbles:true}))"); await pg.wait_for_timeout(400)
    box = await pg.query_selector('#slCode input, #slCode')
    R.check(box is not None, 'Ctrl+Shift+G opens the code box')
    inp = await pg.query_selector('#slCode input')
    if inp:
        await inp.fill('00000000'); await inp.press('Enter'); await pg.wait_for_timeout(400)
        R.check(not await pg.evaluate("Arcade._game().inTest()"), 'a wrong code is refused')
        code = os.environ.get('STARLANE_CODE')
        if code:
            await pg.evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'G',ctrlKey:true,shiftKey:true,bubbles:true}))"); await pg.wait_for_timeout(400)
            inp = await pg.query_selector('#slCode input'); await inp.fill(code); await inp.press('Enter'); await pg.wait_for_timeout(600)
            R.check(await pg.evaluate("Arcade._game().inTest()"), 'the right code opens test mode')
        else: R.skip('the right code opens test mode', 'set STARLANE_CODE to test it')
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
    await pg.evaluate("(document.querySelector('[data-arc=quit]')||{click(){}}).click()"); await pg.wait_for_timeout(1500)
    R.check(not await pg.evaluate("document.getElementById('arcade').open"), 'Stop returns to the launch page')
    R.check('Rig Tester' in await pg.evaluate("document.getElementById('pilotHello').textContent"), 'launch page welcomes the pilot back')
    # videos: no flash of the game before they begin, any key stops them
    for btn, kind in [('#trailerBtn', 'trailer'), ('#overviewBtn', 'tour')]:
        await pg.click(btn); flash = False; playing = False
        for _ in range(160):
            await pg.wait_for_timeout(25)
            st = await pg.evaluate("(()=>{const d=document.getElementById('arcade');let s=false;try{s=!!Arcade._game()._dbg.show}catch(e){}return [d.open&&!d.classList.contains('sl-booting'),s]})()")
            if st[0] and not st[1]: flash = True
            if st[1] and st[0]: playing = True; break
        R.check(playing and not flash, f'{kind} plays with no flash of the game first')
        await pg.wait_for_timeout(1500); await pg.keyboard.press('a'); await pg.wait_for_timeout(1500)
        R.check(not await pg.evaluate("document.getElementById('arcade').open"), f'a key stops the {kind} and returns to the launch page')
    # pilot levels: pack bands, adult set, exam practice (uses ApolloMaths' engine when present)
    await pg.evaluate("(()=>{window.stats.pilot={name:'Rig Tester',band:'adult'};StarlaneSite.questionSource();})()")
    R.check(await pg.evaluate("window.bank===window.ADULT_BANK"), 'Adult level uses the adult question set')
    if HAS_APOLLO:
        await pg.evaluate("(()=>{window.stats.pilot={name:'Rig Tester',band:'x-iseb'};StarlaneSite.questionSource();})()")
        got = await until(pg, "(()=>{const q=StarlaneQuestions.get&&StarlaneQuestions.get('trade');return q&&q.exam})()", 10000)
        R.check(got == 'iseb', 'Exam practice (ISEB) takes questions from the ApolloMaths engine', got)
    else: R.skip('exam practice via the ApolloMaths engine', 'ApolloMaths repo not found next to Starlane')
    await pg.evaluate("(()=>{window.stats.pilot={name:'Rig Tester',band:'9-10'};StarlaneSite.questionSource();})()")
    R.check(await pg.evaluate("window.bank!==window.ADULT_BANK&&!StarlaneQuestions.get"), 'age levels go back to the built-in pack')
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
