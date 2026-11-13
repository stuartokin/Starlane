"""Static checks: every JS file parses, the adventure scripts are well formed, the question packs
produce valid questions at every level, and the public repo holds no secrets or stray "Apollo" mentions."""
import subprocess, re, shutil
from rig import *

async def main(p):
    R = Result('static')
    # 1. syntax of every script
    if shutil.which('node'):
        bad = []
        for f in sorted((STARLANE / 'js').glob('*.js')):
            r = subprocess.run(['node', '-e', f"new Function(require('fs').readFileSync({json.dumps(str(f))},'utf8'))"], capture_output=True, text=True)
            if r.returncode: bad.append(f.name)
        R.check(not bad, 'every js file parses', bad or f"{len(list((STARLANE/'js').glob('*.js')))} files")
    else: R.skip('js syntax', 'node not installed')
    # 2. no cheat code or obvious secrets in the repository
    code = os.environ.get('STARLANE_CODE')
    hits = []
    for f in STARLANE.rglob('*'):
        if f.is_file() and '.git' not in f.parts and f.suffix in ('.js', '.html', '.md', '.json', '.py', '.yml', '.css', '.webmanifest'):
            t = f.read_text(encoding='utf-8', errors='ignore')
            if code and code in t: hits.append(f'{f.name}: test-mode code')
            if re.search(r'sk-ant-[A-Za-z0-9_-]{10,}', t): hits.append(f'{f.name}: API key')
    R.check(not hits, 'no test-mode code or API keys in the repo', hits or ('code checked' if code else 'set STARLANE_CODE to also check the code'))
    # 3. "Apollo" only as history (Apollo 11 / Apollo astronaut) in what players see
    apollo = []
    for f in list((STARLANE / 'js').glob('*.js')) + [STARLANE / 'index.html']:
        t = re.sub(r'/\*[\s\S]*?\*/', '', f.read_text(encoding='utf-8', errors='ignore'))
        t = re.sub(r'(^|[^:"\'`])//[^\n]*', r'\1', t)          # comments are not shown to players
        for m in re.finditer(r'.{0,30}Apollo.{0,30}', t):
            if not re.search(r'Apollo (11|astronaut)|/ApolloMaths/', m.group(0)): apollo.append(f'{f.name}: {m.group(0).strip()}')
    R.check(not apollo, 'no "Apollo" shown to players (except Moon-landing history)', apollo[:3])
    # 4. adventures and question packs, checked inside the page
    pg = await browser(p); await open_site(pg)
    adv = await pg.evaluate("""(()=>{const bad=[],types={};const ages=['young','mid','older'];
      for(const a of StarAdv.LIST){const where=a.id;if(!a.id||!a.title||!a.icon||!a.subject)bad.push(where+': missing id/title/icon/subject');
       if(!['space','ship'].includes(a.kind))bad.push(where+': kind '+a.kind);if(!a.reward||!(a.reward.cr>0))bad.push(where+': reward');
       if(!Array.isArray(a.scenes)||a.scenes.length<2)bad.push(where+': scenes');
       (a.scenes||[]).forEach((s,i)=>{types[s.type]=(types[s.type]||0)+1;const w=where+'#'+i;
        if(s.type==='story'&&!s.say)bad.push(w+': story without say');
        if(s.type==='choose'){const opts=Array.isArray(s.options)?s.options:null;if(!opts&&typeof s.options!=='object')bad.push(w+': options');
          const qs=typeof s.q==='object'?ages.map(k=>s.q[k]):[s.q];if(qs.some(x=>!x))bad.push(w+': question text per age');
          const ans=s.answer&&typeof s.answer==='object'&&!Array.isArray(s.answer)?ages.map(k=>s.answer[k]):[s.answer];
          const n=opts?opts.length:4;ans.forEach(an=>{const arr=Array.isArray(an)?an:[an];if(arr.some(x=>!(Number.isInteger(x)&&x>=0&&x<n)))bad.push(w+': answer out of range');});
          if(!s.explain)bad.push(w+': no explanation');}
        if(s.type==='order'&&!(Array.isArray(s.items)&&s.items.length>=3))bad.push(w+': order items');
        if(s.type==='code'&&s.answer===undefined)bad.push(w+': code answer');
        if(s.type==='flight'&&!(s.goal&&s.time>0&&(s.task||s.setup)))bad.push(w+': flight goal/time and a task or setup');});}
      return {n:StarAdv.LIST.length,bad,types,ids:new Set(StarAdv.LIST.map(a=>a.id)).size};})()""")
    R.check(adv['n'] >= 50 and adv['ids'] == adv['n'], 'adventures load with unique ids', f"{adv['n']} adventures, scene types {adv['types']}")
    R.check(not adv['bad'], 'every adventure scene is well formed', adv['bad'][:5])
    packs = await pg.evaluate("""(()=>{const out={},bad=[];const ok=q=>q&&typeof q.q==='string'&&Number.isFinite(+q.a)&&Array.isArray(q.h)&&(String(q.a).split('.')[1]||'').length<=2;
      for(let L=0;L<4;L++){window.STARLANE_LEVEL=()=>L;let n=0;for(const [tp,list] of Object.entries(bank))for(const g of list)for(let i=0;i<30;i++){let q;try{q=g();}catch(e){bad.push('pack '+tp+' threw');break;}if(q===null)break;if(!ok(q)){bad.push('pack L'+L+' '+tp+': '+(q&&q.q||'').slice(0,50));break;}n++;}out['band'+L]=n;}
      let a=0;for(const [tp,list] of Object.entries(ADULT_BANK))for(const g of list)for(let i=0;i<100;i++){const q=g();if(!ok(q)){bad.push('adult '+tp+': '+(q&&q.q||'').slice(0,50));break;}a++;}out.adult=a;
      out.adultTypes=Object.values(ADULT_BANK).reduce((n,l)=>n+l.length,0);return {out,bad:bad.slice(0,6)};})()""")
    R.check(not packs['bad'], 'question packs valid at every level and in the adult set', packs['bad'] or packs['out'])
    R.check(not pg.errors, 'no page errors', pg.errors[:3]); await pg.close_all(); return R

if __name__ == '__main__': run(main)
