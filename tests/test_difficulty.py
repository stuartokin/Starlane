"""Difficulty levels (Easy / Normal / Hard): Normal is exactly the normal game; each level changes the enemy
rules; cheat-page settings still win; the launch page choice reaches the game and a change made in Pause comes
back to the launch page; a new commander keeps the level; the Pause → DIFFICULTY page works on a phone."""
from rig import *

D = "Arcade._game()._dbg"
KEYS = ['pirateRate', 'pack', 'maxShips', 'enemyHP', 'shieldRegen', 'interdict', 'escape', 'rewardScale']

async def rules(pg):
    return await pg.evaluate(f"(()=>{{const d={D};return Object.fromEntries({KEYS!r}.map(k=>[k,d.CH(k)]))}})()")

async def main(p):
    R = Result('difficulty')
    pg = await browser(p, 1280, 800); await open_site(pg)
    R.check(await pg.evaluate("get('pilotDiff').value") == 'normal', 'launch page: a new pilot starts on Normal')
    await pg.fill('#pilotName', 'Rig Tester'); await pg.select_option('#pilotBand', '11-12'); await pg.select_option('#pilotDiff', 'easy')
    await pg.click('#pilotSave'); await pg.wait_for_timeout(200)
    await launch_game(pg)
    await until(pg, f"{D}.C.opt.difficulty==='easy'", 4000)
    R.check(await pg.evaluate(f"{D}.C.opt.difficulty") == 'easy', 'Easy chosen on the launch page reaches the game')
    easy = await rules(pg)
    R.check(easy['pirateRate'] < 100 and easy['maxShips'] < 6 and easy['enemyHP'] < 100 and easy['shieldRegen'] > 100 and easy['escape'] is True and easy['pack'] == 1,
            'Easy: fewer, weaker pirates, faster shields, emergency escape on', easy)
    norm = await pg.evaluate(f"(()=>{{const d={D};d.setDifficulty('normal');return Object.keys(d.CHD).every(k=>d.CH(k)===d.CHD[k])}})()")
    R.check(norm, 'Normal: every rule is exactly the normal game')
    hard = await pg.evaluate(f"(()=>{{const d={D};d.setDifficulty('hard');return 1}})()") and await rules(pg)
    R.check(hard['pirateRate'] > 100 and hard['maxShips'] > 6 and hard['enemyHP'] > 100 and hard['shieldRegen'] < 100 and hard['rewardScale'] == 125 and hard['escape'] is False,
            'Hard: more, tougher pirates, slower shields, missions pay 25% more', hard)
    # damage taken follows the level
    dmg = await pg.evaluate(f"""(async()=>{{const d={D};d.launchDbg();for(let i=0;i<100&&d.mode!=='flight';i++)await new Promise(r=>setTimeout(r,200));
      const out={{}};for(const k of ['easy','normal','hard']){{d.setDifficulty(k);d.P.shF=100;d.P.shA=100;d.P.energy=100;d.P.hull=0;d.hurtDbg(30);out[k]=100-d.P.shF;}}d.setDifficulty('hard');return out;}})()""")
    R.check(dmg['easy'] < dmg['normal'] < dmg['hard'], 'damage taken: Easy < Normal < Hard', dmg)
    # the change made in the game comes back to the launch page
    R.check(await pg.evaluate("window.stats.pilot.diff") == 'hard', 'a change in Pause is remembered for the launch page')
    # Pause → DIFFICULTY page: the button opens it, CHOOSE works, BACK returns to the GAME tab
    await pg.evaluate(f"{D}.set('overlay','menu');{D}.set('menuTab','main')"); await pg.wait_for_timeout(200)
    lab = await pg.evaluate(f"{D}.btns.map(b=>b.label).find(l=>l&&l.includes('HARD'))")
    R.check(bool(lab), 'Pause → GAME shows the level on its button', lab)
    await pg.evaluate(f"{D}.btns.find(b=>b.label&&b.label.includes('HARD')).fn()"); await pg.wait_for_timeout(250)
    R.check(await pg.evaluate(f"{D}.menuTabNow") == 'diff', 'the button opens the DIFFICULTY page')
    labs = await pg.evaluate(f"{D}.btns.map(b=>b.label).filter(Boolean)")
    R.check(labs.count('CHOOSE') == 2 and '✓ CHOSEN' in labs, 'three cards: the current one marked chosen', labs)
    await pg.evaluate(f"{D}.btns.filter(b=>b.label==='CHOOSE')[0].fn()"); await pg.wait_for_timeout(250)
    R.check(await pg.evaluate(f"{D}.C.opt.difficulty") == 'easy', 'CHOOSE switches the level straight away')
    await pg.evaluate(f"{D}.btns.find(b=>b.label==='◀ BACK').fn()"); await pg.wait_for_timeout(200)
    R.check(await pg.evaluate(f"[{D}.overlay,{D}.menuTabNow]") == ['menu', 'main'], '◀ BACK returns to the GAME tab of Pause')
    # cheat-page rules beat the level; unchanged rules still follow it
    v = await pg.evaluate(f"(()=>{{const d={D};d.C.cheats={{maxShips:9}};const r=[d.CH('maxShips'),d.CH('enemyHP')];delete d.C.cheats;return r}})()")
    R.check(v == [9, 70], 'cheat-page rules win; the others still follow the level', v)
    # test mode: changing the level in the practice copy doesn't touch the real game or the launch page
    await test_mode(pg)
    await pg.evaluate(f"{D}.setDifficulty('hard')")
    R.check(await pg.evaluate("window.stats.pilot.diff") == 'easy', 'test mode: changing the level there leaves the launch page alone')
    await pg.evaluate(f"{D}.testExit()"); await pg.wait_for_timeout(300)
    R.check(await pg.evaluate(f"{D}.C.opt.difficulty") == 'easy', 'test mode: the real commander keeps its level')
    # new commander keeps the level
    await pg.evaluate(f"(()=>{{const d={D};d.set('overlay','menu');d.set('menuTab','restart');}})()"); await pg.wait_for_timeout(250)
    await pg.evaluate(f"{D}.btns.find(b=>b.label&&b.label.includes('NEW COMMANDER')).fn()"); await pg.wait_for_timeout(600)
    R.check(await pg.evaluate(f"[{D}.C.credits,{D}.C.opt.difficulty]") == [100, 'easy'], 'a new commander keeps the chosen level')
    # back to the launch page: it shows the level
    await pg.evaluate("Arcade.close()"); await pg.wait_for_timeout(800)
    R.check(await pg.evaluate("get('pilotDiff').value") == 'easy', 'the launch page shows the level after playing')
    # older players: no level in the pilot record, the commander's own level is used and kept
    await pg.evaluate(f"(()=>{{delete window.stats.pilot.diff;const sv=window.stats.arcade.saves.starlane;const c=typeof sv==='string'?JSON.parse(sv):sv;c.opt.difficulty='hard';window.stats.arcade.saves.starlane=typeof sv==='string'?JSON.stringify(c):c;window.save();}})()")
    await pg.reload(); await pg.wait_for_timeout(700)
    R.check(await pg.evaluate("get('pilotDiff').value") == 'hard', 'a player from before keeps the level their commander had')
    R.check(not pg.errors, 'no page errors (laptop)', pg.errors[:3]); await pg.close_all()
    # phone: the launch page fits and the DIFFICULTY page draws
    for w, h, name in ((390, 844, 'phone upright'), (344, 882, 'Fold folded')):
        pg = await browser(p, w, h, mobile=True); await open_site(pg)
        sw = await pg.evaluate("[document.documentElement.scrollWidth,document.documentElement.clientWidth]")
        R.check(sw[0] <= sw[1], f'{name}: launch page with the difficulty choice has no sideways scroll', sw)
        await register(pg); await launch_game(pg)
        await pg.evaluate(f"{D}.set('overlay','menu');{D}.set('menuTab','diff')"); await pg.wait_for_timeout(400)
        R.check(await pg.evaluate(f"{D}.btns.filter(b=>b.label==='CHOOSE'||b.label==='✓ CHOSEN').length") == 3 and not pg.errors, f'{name}: DIFFICULTY page draws with no errors', pg.errors[:2])
        await pg.close_all()
    return R

if __name__ == '__main__': run(main)
