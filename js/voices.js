'use strict';
// PRESENTATION: the 🔊 mute button, the 🎙️ Voices window and every 🔊 read-aloud button.
const Voices=(()=>{
 const dlg=()=>get('voices'),S=()=>stats.speech;
 function apply(){const m=get('muteBtn');m.textContent=S().announce?'🔊 Sound on':'🔇 Sound off';m.setAttribute('aria-pressed',String(!S().announce));
  document.body.classList.toggle('no-say',!S().icons||!Speech.ok);if(!Speech.ok){m.classList.add('hidden');get('voiceBtn').classList.add('hidden');}}
 function render(){const s=S(),opt=(name,val,cur,label)=>`<label class="chk"><input type="radio" name="${name}" value="${val}"${cur===val?' checked':''}> ${label}</label>`;
  get('vcBody').innerHTML=`${Speech.ok?'':'<p class="feedback warn">This browser can’t read aloud. Try Chrome, Edge or Safari.</p>'}
  <fieldset><legend>Switches</legend>
   <label class="chk"><input type="checkbox" data-v="announce"${s.announce?' checked':''}> 📣 <b>Announcements</b> — read out celebrations, tips and answer feedback (same as the 🔊 button at the top)</label>
   <label class="chk"><input type="checkbox" data-v="icons"${s.icons?' checked':''}> 🔊 <b>Read-aloud buttons</b> on questions, explainers, methods, lessons and examples</label>
   <label class="chk"><input type="checkbox" data-v="tour"${s.tour?' checked':''}> 🗺️ <b>Tour narration</b> — the guided tour reads each step and moves on by itself</label></fieldset>
  <fieldset><legend>Voice</legend><div class="vc-row">${opt('vGender','female',s.gender,'👩 Prefer female voices')}${opt('vGender','male',s.gender,'👨 Prefer male voices')}</div>
   <div class="vc-row">${opt('vRate','0.8',String(s.rate),'🐢 Slower')}${opt('vRate','1',String(s.rate),'Normal')}${opt('vRate','1.2',String(s.rate),'🐇 Faster')}</div></fieldset>
  <fieldset><legend>Voice for each job</legend><div class="vc-try">${Object.entries(Speech.ROLES).map(([k,r])=>roleRow(k,r)).join('')}</div>
   <div class="actions"><button class="ghost" data-autoall type="button">Set all to Automatic</button></div>
   <p class="mini"><b>Automatic</b> uses the most natural-sounding voices (✨) first — the female/male choice above where it can, mixing in the other where it needs to, and sharing a voice if there are fewer than four. ${Speech.naturalCount()?`This device has <b>${Speech.naturalCount()} natural voice${Speech.naturalCount()>1?'s':''}</b>.`:'<b>No natural voices were found on this device</b> — on Windows open the app in <b>Edge</b> (its “Online (Natural)” voices need the internet); on iPad or Mac download an “Enhanced” or “Premium” English voice in Settings → Accessibility → Spoken Content.'} You can also pick any voice for each job yourself. Voices come from the device, so a voice chosen on one device may not exist on another — then Automatic is used there.${Speech.allVoices().length?` This device has ${Speech.allVoices().length} voice${Speech.allVoices().length>1?'s':''} (${Speech.voices().length} English).`:''}</p></fieldset>`;}
 // One row: role name, a list of every voice on this device (English UK first), and a try button.
 function roleRow(k,r){const s=S(),cur=(s.voice||{})[k]||'',all=Speech.allVoices(),auto=Speech.autoVoice(k),missing=cur&&!all.some(v=>v.name===cur);
  const byNat=l=>l.slice().sort((a,b)=>Speech.isNatural(b)-Speech.isNatural(a));
  const grp=(label,list)=>list.length?`<optgroup label="${label}">${byNat(list).map(v=>`<option value="${esc(v.name)}"${v.name===cur?' selected':''}>${Speech.isNatural(v)?'✨ ':''}${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</optgroup>`:'';
  const gb=all.filter(v=>/^en[-_]GB/i.test(v.lang)),en=all.filter(v=>/^en[-_]/i.test(v.lang)&&!/^en[-_]GB/i.test(v.lang)),other=all.filter(v=>!/^en[-_]/i.test(v.lang));
  return `<div class="vc-role"><label for="vSel-${k}"><b>${r.label}</b></label><div class="vc-pick"><select id="vSel-${k}" data-role="${k}"><option value=""${cur&&!missing?'':' selected'}>Automatic${auto?` — ${Speech.isNatural(auto)?'✨ ':''}${esc(auto.name)}`:''}</option>${grp('English (UK)',gb)}${grp('English (other)',en)}${grp('Other languages',other)}</select><button class="secondary" data-try="${k}" type="button" aria-label="Try the ${r.label} voice">▶</button></div>${missing?`<small class="vc-miss">“${esc(cur)}” isn’t on this device — using Automatic here.</small>`:''}</div>`;}
 function open(){render();const d=dlg();if(d.showModal){if(!d.open)d.showModal();}else d.setAttribute('open','');}
 // ---------- 🔊 read-aloud buttons ----------
 // Text of an element without its buttons (so “Read aloud” / “Next” labels aren’t read out).
 const plain=el=>{if(!el)return'';const c=el.cloneNode(true);c.querySelectorAll('button,.say-btn').forEach(b=>b.remove());c.querySelectorAll('b,strong,span,em,i,kbd,small').forEach(n=>n.insertAdjacentText('afterend',' '));c.querySelectorAll('br,p,div,li,h3,h4,dt,dd').forEach(n=>n.insertAdjacentText('afterend','. '));
  return c.textContent.replace(/\s+/g,' ').replace(/([.!?:])\s*(\.\s*)+/g,'$1 ').replace(/\s+([.,!?])/g,'$1').trim();};
 function textFor(kind){
  if(kind==='question')return current?current.q:'';
  if(kind==='explain')return plain(get('explain'));
  if(kind==='solution')return plain(get('solution'));
  if(kind==='lesson'){const d=get('learn'),c=d.querySelector('.ln-content'),q=d.querySelector('.ln-check');return [plain(d.querySelector('.ln-title')),plain(c),q&&!q.classList.contains('hidden')?plain(q).replace(/\n+/g,'. '):''].join('. ');}
  if(kind==='example'){const d=get('learn');return [plain(d.querySelector('.ex-q')),...[...d.querySelectorAll('.ex-steps li')].map(plain),plain(d.querySelector('.ex-ans'))].filter(Boolean).join('. ');}
  return '';}
 const ROLE={question:'question',explain:'teach',solution:'teach',lesson:'teach',example:'teach'};
 let activeBtn=null;
 function reset(){if(activeBtn){activeBtn.classList.remove('speaking');activeBtn.textContent=activeBtn.dataset.label||'🔊';}activeBtn=null;}
 function readAloud(b){const kind=b.dataset.say;if(activeBtn===b&&Speech.speaking()){Speech.stop();reset();return;}Speech.stop();reset();
  const t=textFor(kind);if(!t)return;activeBtn=b;b.dataset.label=b.dataset.label||b.textContent;b.classList.add('speaking');b.textContent=b.textContent.includes('Read')?'⏹ Stop':'⏹';
  Speech.say(t,ROLE[kind]||'teach',()=>{if(activeBtn===b)reset();});}
 function init(){apply();get('muteBtn').addEventListener('click',()=>{S().announce=!S().announce;if(!S().announce)Speech.stop();save();apply();});
  get('voiceBtn').addEventListener('click',open);
  dlg().addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.close!==undefined){Speech.stop();dlg().close();}if(b.dataset.try)Speech.say(Speech.ROLES[b.dataset.try].sample,b.dataset.try);if(b.dataset.autoall!==undefined){Object.keys(S().voice).forEach(k=>S().voice[k]='');save();render();toast('🎙️ All voices set to Automatic.');}});
  Speech.onVoices(()=>{if(dlg().open)render();});
  dlg().addEventListener('change',e=>{const t=e.target,s=S();if(t.dataset.role){s.voice[t.dataset.role]=t.value;save();render();Speech.say(Speech.ROLES[t.dataset.role].sample,t.dataset.role);return;}if(t.dataset.v){s[t.dataset.v]=t.checked;}else if(t.name==='vGender'){s.gender=t.value;}else if(t.name==='vRate'){s.rate=+t.value;}save();apply();render();
   if(t.name==='vGender')Speech.say(t.value==='male'?'Hello! This is a male voice.':'Hello! This is a female voice.','tour');});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-say]');if(b){e.preventDefault();readAloud(b);}});
  dlg().addEventListener('close',()=>Speech.stop());}
 return{init,apply,open,reset};
})();
