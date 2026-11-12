'use strict';
// PRESENTATION: shared retro-arcade toolkit for the hidden games — a 5×7 pixel font, pixel sprites,
// particle explosions with screen shake, attract (title) screens, wave banners and a CRT scanline effect.
const Retro=(()=>{
 // ---------- 5×7 pixel font (each glyph = 7 rows of 5 bits) ----------
 const G={A:[14,17,17,31,17,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],D:[30,17,17,17,17,17,30],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],I:[14,4,4,4,4,4,14],J:[7,2,2,2,2,18,12],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],N:[17,17,25,21,19,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17],Y:[17,17,17,10,4,4,4],Z:[31,1,2,4,8,16,31],
  0:[14,17,19,21,25,17,14],1:[4,12,4,4,4,4,14],2:[14,17,1,2,4,8,31],3:[31,2,4,2,1,17,14],4:[2,6,10,18,31,2,2],5:[31,16,30,1,1,17,14],6:[6,8,16,30,17,17,14],7:[31,1,2,4,8,8,8],8:[14,17,17,14,17,17,14],9:[14,17,17,15,1,2,12],
  ' ':[0,0,0,0,0,0,0],'.':[0,0,0,0,0,12,12],',':[0,0,0,0,12,4,8],'!':[4,4,4,4,4,0,4],'?':[14,17,1,2,4,0,4],':':[0,12,12,0,12,12,0],'-':[0,0,0,31,0,0,0],'+':[0,4,4,31,4,4,0],'×':[0,0,17,10,4,10,17],'=':[0,0,31,0,31,0,0],'/':[1,1,2,4,8,16,16],'%':[24,25,2,4,8,19,3],'(':[2,4,8,8,8,4,2],')':[8,4,2,2,2,4,8],"'":[4,4,8,0,0,0,0],'’':[4,4,8,0,0,0,0],'<':[2,4,8,16,8,4,2],'>':[8,4,2,1,2,4,8],'*':[0,4,21,14,21,4,0],'#':[10,31,10,10,31,10,0],'@':[14,17,23,21,23,16,14]};
 const CYCLE=['#ff2d55','#ff8a1c','#ffe45e','#3cff6a','#3fe0ff','#b45bd6'];
 const cyc=(t,i=0)=>CYCLE[(Math.floor(t*8)+i)%CYCLE.length];
 const clean=s=>[...String(s).toUpperCase().replace(/[—–]/g,'-').replace(/[·•]/g,'-').replace(/[“”]/g,"'")].filter(ch=>G[ch]).join('').replace(/\s+/g,' ').trim();
 const textW=(s,sc)=>clean(s).length*6*sc-sc;
 // Draw pixel text. color may be a colour or 'cycle' (rainbow, like an old arcade score).
 function text(ctx,s,x,y,sc=2,color='#fff',align='left',t=0){s=clean(s);let X=align==='center'?x-textW(s,sc)/2:align==='right'?x-textW(s,sc):x;
  for(let k=0;k<s.length;k++){const g=G[s[k]]||G['?'];ctx.fillStyle=color==='cycle'?cyc(t,k):color;for(let r=0;r<7;r++){const row=g[r];if(!row)continue;for(let c=0;c<5;c++)if(row&(16>>c))ctx.fillRect(Math.round(X+c*sc),Math.round(y+r*sc),sc,sc);}X+=6*sc;}}
 // Pixel sprite from strings; pal maps characters to colours ('.' is transparent). flip mirrors it.
 function spr(ctx,rows,x,y,sc,pal,flip=false){const w=rows[0].length;for(let r=0;r<rows.length;r++)for(let c=0;c<w;c++){const ch=rows[r][c];if(ch==='.'||ch===' ')continue;ctx.fillStyle=pal[ch]||pal['*']||'#fff';ctx.fillRect(Math.round(x+(flip?w-1-c:c)*sc),Math.round(y+r*sc),Math.ceil(sc),Math.ceil(sc));}}
 const sprW=(rows,sc)=>rows[0].length*sc,sprH=(rows,sc)=>rows.length*sc;
 // ---------- particles + screen shake ----------
 function fx(){let P=[],sh=0,flash=0;return{
  burst(x,y,cols,n=26,sp=200,life=.9,size=3){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=sp*(.25+Math.random()*.9);P.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:life*(.5+Math.random()*.6),life,c:Array.isArray(cols)?cols[i%cols.length]:cols,s:size});}},
  lines(x,y,col,n=8){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=40+Math.random()*90;P.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:1.4,life:1.4,c:col,line:6+Math.random()*10,a,va:(Math.random()-.5)*6});}},
  shake(a){sh=Math.max(sh,a);},flash(t=.15){flash=Math.max(flash,t);},
  update(dt){for(const p of P){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.6,dt);p.vy*=Math.pow(.6,dt);p.t-=dt;if(p.va)p.a+=p.va*dt;}P=P.filter(p=>p.t>0);sh=Math.max(0,sh-dt*30);flash=Math.max(0,flash-dt);},
  offset(){return sh?[(Math.random()-.5)*sh,(Math.random()-.5)*sh]:[0,0];},
  render(ctx,ox=0,wrap=0){for(const p of P){let x=p.x-ox;if(wrap){x=((x%wrap)+wrap)%wrap;}ctx.globalAlpha=Math.max(0,Math.min(1,p.t/p.life*1.6));ctx.fillStyle=p.c;
   if(p.line){ctx.strokeStyle=p.c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,p.y);ctx.lineTo(x+Math.cos(p.a)*p.line,p.y+Math.sin(p.a)*p.line);ctx.stroke();}else ctx.fillRect(x-p.s/2,p.y-p.s/2,p.s,p.s);}ctx.globalAlpha=1;},
  renderFlash(ctx,W,H){if(flash>0){ctx.fillStyle=`rgba(255,255,255,${Math.min(.85,flash*5)})`;ctx.fillRect(0,0,W,H);}},
  count:()=>P.length,clear(){P=[];}};}
 // ---------- attract (title) screen ----------
 // o = {title, color, sub, legend:[{draw(ctx,x,y,t), name, pts, color}], hint, hi, bg}
 function title(ctx,W,H,o,t){ctx.fillStyle=o.bg||'#000';ctx.fillRect(0,0,W,H);
  if(o.stars)for(let i=0;i<70;i++){const x=(i*97.3)%W,y=(i*53.7+t*(6+i%5))%H;ctx.fillStyle=(i+Math.floor(t*3))%9===0?'#fff':'rgba(255,255,255,.45)';ctx.fillRect(x,y,i%7===0?2:1,i%7===0?2:1);}
  // Lay out from the bottom up: footer, then the score table, then the title takes whatever room is left.
  const L=o.legend||[],cols=W>=600?Math.min(3,L.length):Math.min(2,L.length),rows=L.length?Math.ceil(L.length/cols):0,rowH=H>=500?80:74,footer=o.hint?66:46;
  const legH=rows?rows*rowH+26:0,legY=H-footer-legH,words=o.title.split(' '),maxLen=Math.max(...words.map(w=>w.length));
  const subH=o.sub?22:0,room=legY-H*.04-subH-8;let sc=Math.max(2,Math.min(7,Math.floor(W*.86/(maxLen*6)),Math.floor(room/(words.length*9))));
  let y=Math.max(8,H*.04+(room-words.length*9*sc)/2);
  words.forEach((w,i)=>{text(ctx,w,W/2+sc*.6,y+sc*.6,sc,'rgba(0,0,0,.6)','center');text(ctx,w,W/2,y,sc,o.color==='cycle'?'cycle':o.color,'center',t+i);y+=sc*9;});
  if(o.sub)text(ctx,o.sub,W/2,y,textW(o.sub,2)<=W*.94?2:1,'#3fe0ff','center');
  if(rows){let ly=legY;text(ctx,o.tableTitle||'SCORE TABLE',W/2,ly,2,'#fff','center');ly+=26;const cw=W/cols;
   L.forEach((e,i)=>{const cx=cw*(i%cols)+cw/2,cy=ly+Math.floor(i/cols)*rowH;e.draw(ctx,cx,cy+12,t);text(ctx,e.name,cx,cy+28,2,e.color||'#b45bd6','center');text(ctx,e.pts,cx,cy+46,2,e.color||'#b45bd6','center');});}
  const by=H-(o.hint?58:36);if(o.hi)text(ctx,`HI-SCORE ${o.hi}`,W/2,by,2,'#ffe45e','center');
  if(Math.floor(t*2.2)%2===0)text(ctx,o.press||'PRESS FIRE TO START',W/2,H-34+(o.hint?0:12),2,'#3cff6a','center');
  if(o.hint)text(ctx,o.hint,W/2,H-14,1,'#9aa3c7','center');}
 // Wrap a game so it opens on its attract screen; FIRE (or a tap) starts it. While G.intro is true the session clock doesn't run.
 function intro(G,opts){G.intro=true;let t=0,held=true;const up=G.update,draw=G.render;
  G.update=(dt,inp,inp2)=>{if(!G.intro)return up(dt,inp,inp2);t+=dt;const f=inp.f||inp.u||!!(inp2&&(inp2.f||inp2.u));if(f&&!held){G.intro=false;if(opts.onStart)opts.onStart();}held=f;};
  G.render=ctx=>{if(!G.intro)return draw(ctx);title(ctx,G.W,G.H,{...opts,hi:opts.hi&&opts.hi()},t);};G.tap=()=>{if(G.intro){G.intro=false;if(opts.onStart)opts.onStart();return true;}return false;};return G;}
 // Big centred banner in pixel letters.
 function banner(ctx,W,H,b){if(!b)return;const sc=W>=600?4:3;ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(0,H/2-62,W,124);text(ctx,b.text,W/2,H/2-36,sc,b.color||'#ffe45e','center',b.t||0);if(b.sub)text(ctx,b.sub,W/2,H/2+14,2,'#fff','center');}
 // ---------- CRT scanlines ----------
 let crtCache=null;
 function crt(ctx,W,H){if(!crtCache||crtCache.width!==W||crtCache.height!==H){crtCache=document.createElement('canvas');crtCache.width=W;crtCache.height=H;const c=crtCache.getContext('2d');c.fillStyle='rgba(0,0,0,.16)';for(let y=0;y<H;y+=3)c.fillRect(0,y,W,1);
   const g=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');c.fillStyle=g;c.fillRect(0,0,W,H);}
  ctx.drawImage(crtCache,0,0);}
 return{text,textW,spr,sprW,sprH,fx,title,intro,banner,crt,cyc,CYCLE};
})();
