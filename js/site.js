/* Starlane Trader — standalone host.
   Provides the small pieces the shared game normally gets from ApolloMaths:
   saving (its own storage name), the arcade helpers, the pilot profile, the
   question socket and the test-mode cheat code. The game files are identical
   in both repos. */
(function(){
const KEY='starlane-standalone-v1';
const fresh=()=>({arcade:{bank:{secs:0,day:''},crt:false,game:'starlane',high:{},lastEnd:0,mute:false,plays:[],saves:{},settings:{carry:0,earnPer:0},tables:{},theme:'player',twoP:{on:false,p:0},used:{}},avatar:{},pilot:null});
let st;try{st=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){st=null;}
if(!st||!st.arcade)st=fresh();
const A=st.arcade;for(const[k,v]of Object.entries(fresh().arcade))if(A[k]===undefined)A[k]=v;
window.stats=st;
window.save=function(){try{localStorage.setItem(KEY,JSON.stringify(window.stats));}catch(e){}};
window.get=id=>document.getElementById(id);
window.esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.toast=function(m){let t=document.getElementById('slToast');if(!t){t=document.createElement('div');t.id='slToast';document.body.appendChild(t);}t.textContent=m;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),2600);};
window.arcadeStatus=()=>({canPlay:true,sessionSecs:1e9,bank:0,left:1e9});
window.endSession=()=>{};
window.playerName=()=>(window.stats.pilot&&window.stats.pilot.name)||'Commander';
window.player={get name(){return window.playerName();}};
window.APP_CONFIG={arcade:true};
window.dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
// the arcade lists other family players for two-player mode; the standalone site has just one pilot
try{if(typeof Storage!=='undefined'&&!Storage.profiles)Storage.profiles=()=>[];}catch(e){}

/* ---------- training level and the question socket ---------- */
const BANDS=[['7-8','Ages 7–8','young'],['9-10','Ages 9–10','young'],['11-12','Ages 11–12','mid'],['13-14','Ages 13–14','older']];
const bandIndex=()=>{const b=window.stats.pilot&&window.stats.pilot.band;const i=BANDS.findIndex(x=>x[0]===b);return i<0?2:i;};
window.STARLANE_LEVEL=bandIndex;
// The host decides where maths questions come from. Here: the built-in pack for the chosen age band,
// mixed with the game's own themed questions. ApolloMaths can later answer the same socket from its exam banks.
window.StarlaneQuestions={themedShare:.5,get:null};

/* ---------- the launch screen ---------- */
function launchUI(){const p=window.stats.pilot;get('pilotName').value=p?p.name:'';const sel=get('pilotBand');sel.innerHTML=BANDS.map(b=>`<option value="${b[0]}">${b[1]}</option>`).join('');sel.value=p?p.band:'11-12';
 get('pilotHello').textContent=p?`Welcome back, Commander ${p.name}.`:'New pilot — register below, then launch.';}
function savePilot(){const n=(get('pilotName').value||'').trim().slice(0,18)||'Commander';window.stats.pilot={name:n,band:get('pilotBand').value};window.save();launchUI();}
let watching=0;
function backToLaunch(){clearInterval(watching);const d=get('arcade');try{if(d.open)Arcade.close();}catch(e){}d.classList.remove('sl-booting');launchUI();}
function play(opts={}){savePilot();if(typeof Arcade==='undefined')return;window.stats.arcade.game='starlane';const dlgEl=get('arcade');dlgEl.classList.add('sl-booting');Arcade.open({admin:true});
 let started=false,showOn=false,tries=0;
 const go=()=>{const b=document.querySelector('[data-arc="start"]');if(!b){if(++tries<80)setTimeout(go,50);return;}b.click();
  const f=document.querySelector('[data-arc=full]');if(f&&!dlgEl.classList.contains('arc-full'))f.click();};go();
 clearInterval(watching);watching=setInterval(()=>{const s=Arcade.status&&Arcade.status(),g=Arcade._game&&Arcade._game(),d=g&&g._dbg;
  if(!started){if(s&&s.view==='game'&&d){started=true;dlgEl.classList.remove('sl-booting');try{d.C.opt.advAge=BANDS[bandIndex()][2];}catch(e){}
     if(opts.show){try{if(g.intro&&typeof g.tap==='function')g.tap();}catch(e){}setTimeout(()=>{try{d.startShow(opts.show);showOn=true;}catch(e){}},500);}}
   else if(!dlgEl.open)backToLaunch();return;}
  if(!dlgEl.open||(s&&s.view!=='game')){backToLaunch();return;}
  if(opts.show&&showOn&&d&&!d.show)backToLaunch();},300);}

/* ---------- test mode: Ctrl+Shift+G or triple-tap the score, then the code ---------- */
const CHECK='6f8f905c';
const fnv=s=>{let h=0x811c9dc5;for(const ch of new TextEncoder().encode('starlane|'+s)){h^=ch;h=Math.imul(h,0x01000193)>>>0;}return h.toString(16).padStart(8,'0');};
function gameNow(){const g=typeof Arcade!=='undefined'&&Arcade._game&&Arcade._game();return g&&typeof g.testMode==='function'&&get('arcCanvas')&&get('arcCanvas').offsetParent?g:null;}
function askCode(){const g=gameNow();if(!g)return;if(g.inTest&&g.inTest()){g.testMode();return;}
 let box=get('slCode');if(!box){box=document.createElement('div');box.id='slCode';box.innerHTML=`<div class="sl-code-card"><h3>🧪 Test mode</h3><p>Enter the test code</p><input id="slCodeIn" type="password" inputmode="numeric" autocomplete="off" maxlength="16"><div class="sl-code-btns"><button id="slCodeOk" type="button">Open</button><button id="slCodeNo" type="button" class="ghost">Cancel</button></div><p id="slCodeMsg" class="msg"></p></div>`;
  get('arcade').appendChild(box);get('slCodeNo').onclick=()=>box.classList.remove('on');
  const ok=()=>{if(fnv(get('slCodeIn').value.trim())===CHECK){box.classList.remove('on');const g2=gameNow();if(g2)g2.testMode();}else{get('slCodeMsg').textContent='Not quite — try again.';get('slCodeIn').select();}};
  get('slCodeOk').onclick=ok;get('slCodeIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')ok();if(e.key==='Escape')box.classList.remove('on');});}
 get('slCodeIn').value='';get('slCodeMsg').textContent='';box.classList.add('on');setTimeout(()=>get('slCodeIn').focus(),30);}
document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&(e.key==='G'||e.key==='g')){e.preventDefault();askCode();}},true);
let taps=[];document.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('#arcHud'))return;const now=Date.now();taps=taps.filter(t=>now-t<900);taps.push(now);if(taps.length>=3){taps=[];askCode();}},true);

/* ---------- start-up ---------- */
window.addEventListener('DOMContentLoaded',()=>{launchUI();get('playBtn').onclick=()=>play();get('trailerBtn').onclick=()=>play({show:'trailer'});get('overviewBtn').onclick=()=>play({show:'overview'});get('pilotSave').onclick=()=>{savePilot();toast('Pilot details saved');};
 if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});});
})();
