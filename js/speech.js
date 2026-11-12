'use strict';
// PRESENTATION: text-to-speech using the browser's built-in voices (same approach as the ResearchGap app:
// English voices only, prefer British, choose female/male by voice name, speak sentence by sentence, safety timer).
// Four roles, each with its own voice where the device has several, plus its own speed and pitch.
const Speech=(()=>{
 const ok=typeof window!=='undefined'&&'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined';
 const FEM=/female|libby|sonia|maisie|hazel|susan|serena|kate|martha|stephanie|fiona|moira|tessa|karen|samantha|victoria|zira|aria|jenny|emma|amy|olivia|natasha|ava|allison|catherine|joanna|kendra|kimberly|salli|ivy|nicole|amelie|anna|alice|ellen|lisa|mia|sara|zoe|libby/i;
 const MAL=/\bmale\b|daniel|george|arthur|oliver|thomas|james|ryan|guy|david|mark|alex|fred|rishi|gordon|aaron|liam|\btom\b|matthew|brian|christopher|eric|roger|andrew|william|harry|jacob|reed|eddy|grandpa|ralph/i;
 const ROLES={tour:{label:'🗺️ Tour guide',rate:1.0,pitch:1.05,slot:0,sample:'Hi! I’m your tour guide. I’ll show you around the app.'},
  announce:{label:'📣 Announcer',rate:1.1,pitch:1.2,slot:1,sample:'GOAL! What a strike! Plus twenty points!'},
  question:{label:'❓ Question reader',rate:.95,pitch:1.0,slot:2,sample:'Find the missing number: three quarters equals what over twelve?'},
  teach:{label:'🧑‍🏫 Teacher',rate:.9,pitch:.95,slot:3,sample:'Whatever you do to the bottom, do to the top. Let’s work it out step by step.'}};
 let voices=[],all=[],token=0,current=null,timer=0,queue=[],listeners=[];
 const set=()=>(typeof stats!=='undefined'&&stats.speech)||{announce:true,icons:true,tour:true,gender:'female',rate:1};
 function load(){if(!ok)return;all=speechSynthesis.getVoices().slice();voices=all.filter(v=>/^en[-_]/i.test(v.lang));listeners.forEach(f=>{try{f()}catch(e){}});}
 if(ok){load();speechSynthesis.onvoiceschanged=load;}
 // Voices of the chosen gender (British first). Falls back to any English voice if the device has none of that gender.
 function pool(g){const want=g==='male'?v=>MAL.test(v.name)&&!FEM.test(v.name):v=>FEM.test(v.name);let p=voices.filter(want);if(!p.length)p=voices.filter(v=>!(g==='male'?FEM:MAL).test(v.name));if(!p.length)p=voices.slice();
  return p.sort((a,b)=>(/en[-_]GB/i.test(b.lang)-/en[-_]GB/i.test(a.lang))||(b.localService-a.localService));}
 // Natural (neural) voices sound far better: Microsoft "Online (Natural)"/"Neural", Apple "Premium"/"Enhanced".
 const NATURAL=/natural|neural|premium|enhanced/i,isNatural=v=>NATURAL.test(v.name),isGB=v=>/^en[-_]GB/i.test(v.lang);
 const isGender=(v,g)=>g==='male'?MAL.test(v.name)&&!FEM.test(v.name):FEM.test(v.name);
 // Natural voices in order of preference: chosen gender (British first), then the other gender (British first).
 function naturalList(g){const nat=voices.filter(isNatural),other=g==='male'?'female':'male',seen=new Set(),out=[];
  for(const grp of [nat.filter(v=>isGB(v)&&isGender(v,g)),nat.filter(v=>isGB(v)&&!isGender(v,g)&&!isGender(v,other)),nat.filter(v=>isGB(v)&&isGender(v,other)),nat.filter(v=>!isGB(v)&&isGender(v,g)),nat.filter(v=>!isGB(v)&&!isGender(v,other)),nat.filter(v=>!isGB(v))])
   for(const v of grp)if(!seen.has(v.name)){seen.add(v.name);out.push(v);}return out;}
 // Automatic choice for a role: natural voices first — a different one for each role where possible (mixing genders if needed,
 // reusing voices if there are fewer than four). Only devices with no natural voices fall back to the ordinary ones.
 const autoVoice=role=>{const n=naturalList(set().gender);if(n.length)return n[ROLES[role].slot%n.length];const p=pool(set().gender);return p.length?p[ROLES[role].slot%p.length]:null;};
 // A voice picked by name for a role (saved per player); if it isn't on this device, the automatic choice is used.
 const chosen=role=>{const n=(set().voice||{})[role];return n?all.find(v=>v.name===n)||null:null;};
 const voiceFor=role=>chosen(role)||autoVoice(role);
 // Make maths and app text sound right.
 const SMALL={2:'half',3:'third',4:'quarter',5:'fifth',6:'sixth',7:'seventh',8:'eighth',9:'ninth',10:'tenth',12:'twelfth'};
 const WORDS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
 const KEEP=/^(HCF|LCM|UFO|PIN|CSV|PDF|AI|UK|GB|OK|KS2)$/;
 function speakable(t){return String(t)
  .replace(/(\d+)\.(\d+)/g,(m,a,b)=>`${a} point ${b.split('').join(' ')}`)
  .replace(/<[^>]*>/g,' ').replace(/&amp;/g,'and').replace(/&[a-z]+;/g,' ')
  .replace(/(\d+)\s?\/\s?(\d+)/g,(m,a,b)=>{const n=+a,d=+b;if(d in SMALL&&n<=12&&n>0&&a.length<3)return `${WORDS[n]} ${SMALL[d]}${n>1?(d===2?'s':'s'):''}`.replace('halfs','halves');return `${a} over ${b}`;})
  .replace(/\?\s?\/\s?(\d+)/g,'what over $1').replace(/(\d+)\s?\/\s?\?/g,'$1 over what')
  .replace(/½/g,' and a half').replace(/¼/g,' and a quarter').replace(/¾/g,' and three quarters')
  .replace(/(\d)\s?cm²/g,'$1 square centimetres').replace(/(\d)\s?m²/g,'$1 square metres').replace(/(\d)\s?cm³/g,'$1 cubic centimetres').replace(/(\d)\s?m³/g,'$1 cubic metres')
  .replace(/cm³/g,'cubic centimetres').replace(/cm²/g,'square centimetres').replace(/\bm³/g,'cubic metres').replace(/\bm²/g,'square metres').replace(/(\d)\s?km\/h/g,'$1 kilometres per hour').replace(/(\d)\s?mm\b/g,'$1 millimetres').replace(/(\d)\s?cm\b/g,'$1 centimetres').replace(/(\d)\s?km\b/g,'$1 kilometres').replace(/(\d)\s?kg\b/g,'$1 kilograms').replace(/(\d)\s?ml\b/g,'$1 millilitres').replace(/(\d)\s?m\b/g,'$1 metres').replace(/(\d)\s?g\b/g,'$1 grams')
  .replace(/(^|[^\d.])1 ((?:square |cubic )?(?:millimetre|centimetre|metre|kilometre|kilogram|gram|millilitre|point|degree))s\b/g,'$11 $2').replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/(\d)\s?-\s?(\d)/g,'$1 minus $2').replace(/=/g,' equals ').replace(/°C/g,' degrees Celsius').replace(/°/g,' degrees')
  .replace(/\+\s?(\d)/g,'plus $1').replace(/⚡/g,' points').replace(/(^|[^\d.])1\s+points\b/g,'$11 point').replace(/(\d),(\d{3})/g,'$1$2')
  .replace(/\b[A-Z]{2,}\b/g,w=>KEEP.test(w)?w:w.toLowerCase())
  .replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu,' ').replace(/[•·|→←▶◀]/g,', ').replace(/\s+/g,' ').replace(/\s+([.,!?;:])/g,'$1').replace(/([.!?])[.,]+/g,'$1').trim();}
 const sentences=t=>(t.match(/[^.!?…]+[.!?…]*/g)||[t]).map(s=>s.trim()).filter(Boolean).flatMap(s=>s.length<=220?[s]:s.match(/.{1,200}(\s|$)/g));
 function stop(){token++;clearTimeout(timer);queue=[];current=null;if(ok)speechSynthesis.cancel();}
 // Speak text in a role. onEnd runs once when finished (or by the safety timer if the browser never reports the end).
 function say(text,role='tour',onEnd){const t=speakable(text),tok=++token,r=ROLES[role],s=set();clearTimeout(timer);current={role,tok};
  const words=t.split(' ').length,est=Math.round(words/2.5/(r.rate*s.rate)*1000)+600;let done=false;
  const fin=()=>{if(done||tok!==token)return;done=true;clearTimeout(timer);current=null;if(onEnd)onEnd();};
  if(!ok||!t){timer=setTimeout(fin,ok?300:est);return;}
  speechSynthesis.cancel();const parts=sentences(t);let k=0;const v=voiceFor(role);
  const next=()=>{if(tok!==token)return;if(k>=parts.length){fin();return;}const u=new SpeechSynthesisUtterance(parts[k++]);if(v){u.voice=v;u.lang=v.lang;}else u.lang='en-GB';
   u.rate=Math.min(2,r.rate*s.rate);u.pitch=r.pitch;u.onend=next;u.onerror=next;speechSynthesis.speak(u);};
  next();timer=setTimeout(fin,est+6000);}
 // Announcements: muted by the overall button; never interrupt something being read on request.
 function announce(text){if(!set().announce||!text)return;if(current&&current.role!=='announce')return;
  if(current){if(queue.length<2)queue.push(text);return;}say(text,'announce',()=>{const n=queue.shift();if(n)announce(n);});}
 const speaking=role=>!!current&&(!role||current.role===role);
 return{ok,ROLES,say,stop,announce,speaking,voiceFor,autoVoice,chosen,isNatural,naturalCount:()=>voices.filter(isNatural).length,speakable,voices:()=>voices,allVoices:()=>all,pool,onVoices:f=>listeners.push(f)};
})();
