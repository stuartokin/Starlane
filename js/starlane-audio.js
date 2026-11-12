'use strict';
// STARLANE SOUND — everything is synthesised live with the Web Audio API (no sound files to download).
// Engine hum that follows your speed, a sound palette per style (original / retro / modern), weapons and explosions
// placed left or right, a hangar soundscape, and music that is calm when cruising and builds to a battle theme at red alert.
// Muted whenever the arcade's sound button is off.
const StarAudio=(()=>{
 let cab=null,ac=null,master=null,sfx=null,mus=null,amb=null,verb=null,noiseBuf=null,style='retro',muteNow=false;
 const muted=()=>typeof stats!=='undefined'&&stats&&stats.arcade&&!!stats.arcade.mute;
 function A(){if(!ac){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ac=new C();master=ac.createGain();master.gain.value=muted()?0:.9;master.connect(ac.destination);
   // a simple echo for space and hangar ambience
   verb=ac.createDelay(1);verb.delayTime.value=.23;const fb=ac.createGain();fb.gain.value=.32;const vf=ac.createBiquadFilter();vf.type='lowpass';vf.frequency.value=2200;verb.connect(vf);vf.connect(fb);fb.connect(verb);const vo=ac.createGain();vo.gain.value=.5;vf.connect(vo);vo.connect(master);
   cab=ac.createBiquadFilter();cab.type='lowpass';cab.frequency.value=20000;cab.connect(master);sfx=ac.createGain();sfx.gain.value=.8;sfx.connect(cab);mus=ac.createGain();mus.gain.value=.0;mus.connect(master);amb=ac.createGain();amb.gain.value=.0;amb.connect(master);
   const n=ac.sampleRate*2;noiseBuf=ac.createBuffer(1,n,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;}
  if(ac.state==='suspended')ac.resume().catch(()=>{});return ac;}
 const now=()=>ac.currentTime;
 function panNode(p){if(Array.isArray(p)&&ac.createPanner){const n=ac.createPanner();n.panningModel='HRTF';n.distanceModel='inverse';n.refDistance=700;n.rolloffFactor=.9;const x=p[0],y=p[1],z=-p[2];if(n.positionX){n.positionX.value=x;n.positionY.value=y;n.positionZ.value=z;}else n.setPosition(x,y,z);return n;}
  const s=ac.createStereoPanner?ac.createStereoPanner():null;if(s)s.pan.value=Math.max(-1,Math.min(1,Array.isArray(p)?p[0]/1500:(p||0)));return s;}
 function out(node,p,dest,wet){const s=panNode(p);if(s){node.connect(s);s.connect(dest||sfx);if(wet)s.connect(verb);}else{node.connect(dest||sfx);if(wet)node.connect(verb);}}
 function env(g,t0,a,peak,d){g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t0+a);g.gain.exponentialRampToValueAtTime(.0001,t0+a+d);}
 function osc(type,f0,f1,dur,vol,p,o={}){if(!A()||muteNow)return;const t=now(),o1=ac.createOscillator(),g=ac.createGain();o1.type=type;o1.frequency.setValueAtTime(f0,t);if(f1)o1.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);env(g,t,o.a||.005,vol,dur);o1.connect(g);out(g,p,o.dest,o.wet);o1.start(t);o1.stop(t+dur+.05);}
 function noise(dur,vol,p,type='lowpass',f0=3000,f1=200,o={}){if(!A()||muteNow)return;const t=now(),src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();src.buffer=noiseBuf;src.loop=true;f.type=type;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);f.Q.value=o.q||.8;env(g,t,o.a||.004,vol,dur);src.connect(f);f.connect(g);out(g,p,o.dest,o.wet);src.start(t,Math.random());src.stop(t+dur+.05);}
 // ---------------- effects ----------------
 function laser(p=0){if(style==='original'){osc('square',1400,500,.09,.05,p);return;}if(style==='retro'){osc('sawtooth',1200,260,.11,.05,p);noise(.05,.02,p,'highpass',4000,3000);return;}
  osc('sawtooth',1900,180,.16,.045,p,{wet:true});osc('sine',950,120,.18,.06,p);noise(.07,.03,p,'bandpass',6000,1500,{q:2});}
 function enemyLaser(p=0,dist=1){const v=Math.max(.15,1-dist);if(style==='original'){osc('square',700,300,.08,.03*v,p);return;}osc('sawtooth',800,180,.13,.035*v,p,{wet:style==='modern'});}
 function boom(p=0,dist=0,size=1){const v=Math.max(.08,1-dist)*Math.min(1.6,size);if(style==='original'){noise(.5,.12*v,p,'lowpass',1500,100);return;}
  noise(1.1*size,.16*v,p,'lowpass',4200,90,{wet:true});osc('sine',110,28,.6*size,.25*v,p);if(style==='modern'){noise(.35,.08*v,p,'highpass',3000,800);setTimeout(()=>noise(.8,.05*v,p,'lowpass',900,80,{wet:true}),120);}}
 function flyby(l,rel=300){if(!A()||muteNow)return;const v=Math.min(1,rel/500);noise(.9,.07*v,l,'bandpass',2400,500,{q:1.2,a:.25,wet:true});osc('sawtooth',260+rel*.4,90,.9,.02*v,l,{a:.2});}
 function cabin(inside){if(!A())return;cab.frequency.setTargetAtTime(inside?5200:20000,now(),.2);}
 function creak(){if(!A()||muteNow)return;noise(.6,.035,0,'bandpass',220,140,{q:9,a:.08});osc('sawtooth',70,55,.5,.012,0,{a:.1});}
 function hullAlarm(){osc('square',880,0,.12,.03,0);setTimeout(()=>osc('square',880,0,.12,.03,0),180);setTimeout(()=>osc('square',660,0,.2,.03,0),360);}
 function patter(){if(!A()||muteNow)return;for(let i=0;i<7;i++)setTimeout(()=>noise(.03,.05,Math.random()*1.6-.8,'highpass',5000,3000),i*40+Math.random()*60);}
 function hit(){if(style==='original'){noise(.15,.1,0,'lowpass',2000,300);return;}noise(.25,.14,0,'bandpass',1800,500,{q:3});osc('square',220,90,.2,.05,0);if(style==='modern')osc('sine',60,35,.3,.18,0);}
 function shieldHit(){osc('sine',520,260,.25,.06,0,{wet:true});}
 function pickup(){osc('triangle',660,1320,.18,.06,0);setTimeout(()=>osc('triangle',990,1980,.16,.05,0),90);}
 function clamps(){[0,180,380].forEach((d,i)=>setTimeout(()=>{noise(.18,.16,(i-1)*.4,'bandpass',900,400,{q:4,wet:true});osc('square',140,70,.12,.06,(i-1)*.4);},d));setTimeout(()=>noise(1.1,.06,0,'highpass',5000,2500,{wet:true}),520);}
 function gear(){osc('sawtooth',260,620,.9,.025,0,{a:.15});setTimeout(()=>{noise(.2,.14,0,'bandpass',700,300,{q:3,wet:true});osc('square',110,60,.15,.06,0);},950);}
 function alarm(){osc('square',660,0,.22,.045,0);setTimeout(()=>osc('square',520,0,.26,.045,0),260);}
 function click(){osc('square',1800,1200,.03,.02,0);}
 function jump(){if(!A()||muteNow)return;noise(2.6,.08,0,'bandpass',300,6000,{q:1.5,a:1.2,wet:true});osc('sawtooth',60,900,2.8,.03,0,{a:1.4});}
 // ---------------- engine hum ----------------
 let eng=null;
 const CLS={kestrel:[1,.5],courier:[1.35,.35],falcon:[1.2,.45],mule:[.68,.85],warden:[.85,.7]};let engCls='kestrel';
 function engine(on,speed01=0,thr=0,boost=false,cls='kestrel'){if(cls!==engCls&&eng){engCls=cls;engine(false);}engCls=cls;if(!A())return;if(!on){if(eng){const t=now();eng.g.gain.setTargetAtTime(0,t,.15);const e=eng;setTimeout(()=>{try{e.o1.stop();e.o2.stop();e.n.stop();}catch(x){}},600);eng=null;}return;}
  if(!eng){const o1=ac.createOscillator(),o2=ac.createOscillator(),n=ac.createBufferSource(),f=ac.createBiquadFilter(),nf=ac.createBiquadFilter(),g=ac.createGain(),ng=ac.createGain();
   o1.type=style==='original'?'square':'sawtooth';o2.type='sawtooth';o2.detune.value=13;n.buffer=noiseBuf;n.loop=true;f.type='lowpass';f.Q.value=2;nf.type='bandpass';nf.Q.value=.7;g.gain.value=0;ng.gain.value=.5;
   o1.connect(f);o2.connect(f);n.connect(nf);nf.connect(ng);ng.connect(f);f.connect(g);g.connect(sfx);o1.start();o2.start();n.start();eng={o1,o2,n,f,nf,g};}
  const cm=CLS[engCls]||CLS.kestrel,t=now(),s=Math.max(0,Math.min(1,speed01)),base=(boost?140:38+s*70)*cm[0];eng.nf.Q.value=.7+cm[1];eng.o1.frequency.setTargetAtTime(base,t,.2);eng.o2.frequency.setTargetAtTime(base*1.01,t,.2);eng.f.frequency.setTargetAtTime(boost?3500:180+s*1400+thr*400,t,.2);eng.nf.frequency.setTargetAtTime(400+s*2500,t,.3);
  eng.g.gain.setTargetAtTime(muteNow?0:(style==='original'?.012:.02)+thr*.035+(boost?.03:0),t,.25);}
 // ---------------- hangar ambience ----------------
 let hang=null,clankT=null;
 function hangar(on){if(!A())return;if(!on){if(hang){amb.gain.setTargetAtTime(0,now(),.4);const h=hang;setTimeout(()=>{try{h.forEach(x=>x.stop());}catch(e){}},1500);hang=null;clearTimeout(clankT);}return;}
  if(hang)return;const o1=ac.createOscillator(),o2=ac.createOscillator(),n=ac.createBufferSource(),f=ac.createBiquadFilter();o1.type='sine';o1.frequency.value=55;o2.type='sine';o2.frequency.value=82.4;n.buffer=noiseBuf;n.loop=true;f.type='lowpass';f.frequency.value=380;
  const g1=ac.createGain();g1.gain.value=.25;o1.connect(g1);o2.connect(g1);n.connect(f);f.connect(g1);g1.connect(amb);o1.start();o2.start();n.start();hang=[o1,o2,n];amb.gain.setTargetAtTime(muteNow?0:.18,now(),1);
  const clank=()=>{if(!hang)return;if(!muteNow){const p=Math.random()*1.6-.8;if(Math.random()<.6){noise(.15,.05,p,'bandpass',600+Math.random()*1400,300,{q:5,wet:true,dest:amb});osc('square',90+Math.random()*80,60,.12,.02,p,{dest:amb});}else osc('sine',900+Math.random()*600,880,.5,.012,p,{dest:amb,wet:true});}clankT=setTimeout(clank,1500+Math.random()*4000);};clankT=setTimeout(clank,1200);}
 // ---------------- music ----------------
 let mState='off',timer=null,nextT=0,step=0,cg=null,tg=null,bg=null;
 const NOTE=n=>440*Math.pow(2,(n-69)/12);
 const MOODS={normal:[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],farm:[[48,52,55],[55,59,62],[57,60,64],[53,57,60]],danger:[[57,60,64],[50,53,57],[52,56,59],[57,60,64]]};let CHORDS=MOODS.normal,moodNow='normal';   // farm: C G Am F · danger: Am Dm E Am
 function mood(m){if(m!==moodNow&&MOODS[m]){moodNow=m;CHORDS=MOODS[m];}}
 function voice(dest,type,f,t,dur,vol,a=.01,cut=0){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dur);
  if(cut){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=cut;o.connect(fl);fl.connect(g);}else o.connect(g);g.connect(dest);o.start(t);o.stop(t+a+dur+.05);}
 function drum(dest,kind,t,vol){if(kind==='kick'){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(40,t+.18);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+.25);o.connect(g);g.connect(dest);o.start(t);o.stop(t+.3);return;}
  const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf;f.type=kind==='hat'?'highpass':'bandpass';f.frequency.value=kind==='hat'?7000:1800;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+(kind==='hat'?.05:.18));s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random());s.stop(t+.25);}
 // one clock (16th notes at 120 bpm) drives all three layers; the state only changes how loud each layer is
 function schedule(){if(!ac)return;const sixteenth=.125;while(nextT<now()+.3){const t=nextT,s=step%32,bar=Math.floor(step/32)%4,ch=CHORDS[bar],root=ch[0]-12,orig=style==='original';
   if(s===0)ch.forEach(n=>voice(cg,orig?'square':'triangle',NOTE(n-12),t,3.6,orig?.016:.032,1.2,style==='modern'?900:1400));
   if(!orig&&s%8===4&&Math.random()<.6){const pent=[69,72,74,76,79,81];voice(cg,'sine',NOTE(pent[Math.floor(Math.random()*pent.length)]),t,1.4,.028,.01);}
   if(s%4===0)voice(tg,orig?'square':'sawtooth',NOTE(root-12),t,.2,.045,.005,style==='modern'?500:800);if(s%8===6)voice(tg,'sine',NOTE(root+7),t,.3,.02,.01);
   if(s%8===0)drum(bg,'kick',t,.32);if(s%16===8)drum(bg,'snare',t,.15);if(!orig&&s%2===0)drum(bg,'hat',t,.03);if(s%2===0){const arp=[0,3,7,12,7,3][Math.floor(s/2)%6];voice(bg,'square',NOTE(root+24+arp),t,.08,.014,.003,2600);}
   nextT+=sixteenth;step++;}}
 function music(state){if(!A())return;if(state===mState)return;const t=now();
  if(!cg){cg=ac.createGain();cg.gain.value=0;cg.connect(mus);tg=ac.createGain();tg.gain.value=0;tg.connect(mus);bg=ac.createGain();bg.gain.value=0;bg.connect(mus);}
  if(mState==='off'&&state!=='off'){nextT=t+.1;step=0;}
  mState=state;const lv={off:[0,0,0],calm:[.9,0,0],tension:[.75,.85,0],battle:[.5,1,1]}[state]||[0,0,0],tc=state==='battle'?.2:1.2;
  mus.gain.setTargetAtTime(state==='off'||muteNow?0:.5,t,.6);cg.gain.setTargetAtTime(lv[0],t,tc);tg.gain.setTargetAtTime(lv[1],t,tc);bg.gain.setTargetAtTime(lv[2],t,tc);
  if(!timer)timer=setInterval(schedule,90);if(state==='off'){setTimeout(()=>{if(mState==='off'&&timer){clearInterval(timer);timer=null;}},3000);}}
 // ---------------- control ----------------
 function tick(){if(!ac)return;const m=muted();if(m!==muteNow){muteNow=m;master.gain.setTargetAtTime(m?0:.9,now(),.05);}}
 function setStyle(s){if(s===style)return;style=s;if(eng){engine(false);}}
 function stopAll(){engine(false);hangar(false);music('off');}
 function suspend(on){if(!ac)return;if(on)ac.suspend().catch(()=>{});else ac.resume().catch(()=>{});}
 return{mood,creak,hullAlarm,patter,flyby,cabin,laser,enemyLaser,boom,hit,shieldHit,pickup,clamps,gear,alarm,click,jump,engine,hangar,music,tick,setStyle,stopAll,suspend,get style(){return style;},get state(){return mState;}};
})();
