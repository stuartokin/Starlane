"""Starlane opened from ApolloMaths (needs the ApolloMaths repo next to this one).
Checks: the arcade opens Starlane's site inside ApolloMaths, the child's name and exam reach the game,
questions come from the child's exam with the child's own name (never "Apollo" for another child),
answers are reported back, saves go into the child's ApolloMaths progress, and Stop returns to the arcade."""
from rig import *

async def main(p):
    R = Result('bridge')
    if not HAS_APOLLO: R.skip('Starlane from ApolloMaths', 'ApolloMaths repo not found next to Starlane'); return R
    pg = await browser(p, 1400, 900)
    await pg.goto(f'{serve()}/ApolloMaths/index.html'); await pg.wait_for_timeout(1500)
    # make a fresh child called Zara through the real "add player" form, on the ISEB exam
    await pg.evaluate("localStorage.clear();sessionStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(1800)
    if await pg.query_selector('#newName'):
        await pg.fill('#newName', 'Zara')
        if await pg.query_selector('#newExam'): await pg.select_option('#newExam', 'iseb')
        await pg.evaluate("document.getElementById('addPlayerForm').requestSubmit()"); await pg.wait_for_timeout(3500)
    await pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}})")
    name = await pg.evaluate("typeof playerName==='function'?playerName():''")
    R.check(name == 'Zara', 'a new child (Zara) is playing', name)
    await pg.evaluate("Arcade.open({admin:true})"); await pg.wait_for_timeout(500)
    await pg.evaluate("(document.querySelector('[data-game=\"starlane\"]')||{click(){}}).click()"); await pg.wait_for_timeout(200)
    await pg.evaluate("document.querySelector('[data-arc=\"start\"]').click()")
    fr = None
    for _ in range(80):
        await pg.wait_for_timeout(250)
        for f in pg.frames:
            if '/Starlane/' in f.url:
                try:
                    if await f.evaluate("!!(window.StarlaneSite&&StarlaneSite.ready&&typeof Arcade!=='undefined'&&Arcade.status().view==='game')"): fr = f
                except Exception: pass
        if fr: break
    if not R.check(fr is not None, 'the arcade opens the Starlane site inside ApolloMaths'): await pg.close_all(); return R
    R.check(await fr.evaluate("StarlaneSite.hosted"), 'Starlane knows it is hosted')
    R.check(await fr.evaluate("playerName()") == 'Zara', "the game uses the child's name")
    qs = await fr.evaluate("(()=>{const out=[];for(let i=0;i<40;i++){const q=StarlaneQuestions.get&&StarlaneQuestions.get(['trade','fuel','hyper'][i%3]);if(q)out.push(q);}return out})()")
    R.check(len(qs) > 5 and all(q.get('exam') == 'iseb' for q in qs), "questions follow the child's exam (ISEB)", f"{len(qs)} questions")
    R.check(not any('Apollo' in (q.get('q', '') + q.get('how', '')) for q in qs), 'no question mentions "Apollo"')
    await fr.evaluate("(()=>{const g=Arcade._game();if(g.intro&&g.tap)g.tap();})()"); await pg.wait_for_timeout(500)
    n0 = await pg.evaluate("(stats.slMaths||[]).length")
    await fr.evaluate("(()=>{const d=Arcade._game()._dbg;d.openMathDbg('trade');const q=d.mathQNow;if(q)d.pickMathDbg(q.ans);d.set&&d.set('overlay',null);})()"); await pg.wait_for_timeout(400)
    R.check(await pg.evaluate("(stats.slMaths||[]).length") == n0 + 1, 'an answer in Starlane is recorded in ApolloMaths')
    await fr.evaluate("(()=>{const d=Arcade._game()._dbg;d.C.credits+=77;d.persistNow();})()"); await pg.wait_for_timeout(500)
    saved = await pg.evaluate("(()=>{const s=stats.arcade.saves.starlane;if(!s)return null;const o=typeof s==='string'?JSON.parse(s):s;return o.credits})()")
    R.check(saved is not None and saved >= 77, "the commander is saved into the child's ApolloMaths progress", saved)
    await fr.evaluate("(document.querySelector('[data-arc=quit]')||{click(){}}).click()"); await pg.wait_for_timeout(2000)
    R.check(await pg.evaluate("!document.getElementById('slRemote')"), 'Stop closes Starlane and returns to the ApolloMaths arcade')
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
