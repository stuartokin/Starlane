'use strict';
// STARLANE MODERN — a real-time 3D renderer for the Modern style, built on three.js (bundled in js/vendor, loaded only
// when Modern is chosen, so the rest of the app stays light). It draws the space view into its own WebGL canvas, which
// Starlane then paints under its cockpit and HUD. Lit metal ships and stations, textured planets with clouds and
// atmospheres, a bloom glow, particle explosions, smoke and engine trails, and a deep starfield.
// Starlane's world uses the opposite handedness to three.js, so positions are mirrored on one axis (M below).
const StarModern=(()=>{
 let state='idle',T=null,R=null,scene=null,cam=null,cam2=null,comp=null,bloom=null,gl=null,quality={pr:1,bloom:true,views:true,auto:true},slow=0,fast=0,lastSys=null,root=null;
 const objs=new Map(),geoCache=new WeakMap(),texCache={};let boomLights=[],sunLights=[],bodies=[],nebula=null,cityMats=[],starField=null,fire=null,smoke=null,dustPts=null,bhGroup=null,stationGrp=null;
 const M=v=>[v[0],v[1],-v[2]];
 function load(){if(state!=='idle')return;state='loading';const s=document.createElement('script');s.src='js/vendor/three-bundle.js';s.onload=()=>{try{init();state='ready';}catch(e){console.error(e);state='failed';}};s.onerror=()=>{state='failed';};document.head.appendChild(s);}
 const ready=()=>state==='ready';
 // ---------------- textures drawn on canvases ----------------
 function cv(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.anisotropy=4;t.encoding=T.sRGBEncoding;return t;}
 const rnd=s=>{let x=s>>>0||1;return()=>{x^=x<<13;x>>>=0;x^=x>>17;x^=x<<5;x>>>=0;return x/4294967296;};};
 function panelTex(){return texCache.panel||(texCache.panel=(()=>{const t=cv(256,256,(c,w,h)=>{c.fillStyle='#b8bcc8';c.fillRect(0,0,w,h);const r=rnd(7);for(let i=0;i<400;i++){c.fillStyle=`rgba(0,0,0,${r()*.06})`;c.fillRect(r()*w,r()*h,r()*40,r()*40);}
   c.strokeStyle='rgba(40,44,60,.55)';c.lineWidth=2;for(let i=0;i<=4;i++){c.beginPath();c.moveTo(0,i*64);c.lineTo(w,i*64);c.stroke();c.beginPath();c.moveTo(i*64+(i%2)*32,0);c.lineTo(i*64+(i%2)*32,h);c.stroke();}
   c.fillStyle='rgba(30,30,40,.6)';for(let y=8;y<h;y+=64)for(let x=8;x<w;x+=32){c.beginPath();c.arc(x,y,1.6,0,7);c.fill();}});t.wrapS=t.wrapT=T.RepeatWrapping;return t;})());}
 function windowTex(){return texCache.win||(texCache.win=(()=>{const t=cv(256,256,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);const r=rnd(11);for(let y=12;y<h;y+=22)for(let x=10;x<w;x+=18)if(r()<.45){c.fillStyle=r()<.8?'#ffe7a0':'#9fe8ff';c.fillRect(x,y,8,5);}});t.wrapS=t.wrapT=T.RepeatWrapping;return t;})());}
 function glowTex(){return texCache.glow||(texCache.glow=cv(128,128,(c,w)=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,w);}));}
 const terrainCache={};
 function terrain(seed){if(terrainCache[seed])return terrainCache[seed];const GW=64,GH=32,r=rnd(seed),grid=[];for(let i=0;i<GW*GH;i++)grid.push(r());
  const vn=(x,y)=>{const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),g=(i,j)=>grid[((j%GH+GH)%GH)*GW+((i%GW+GW)%GW)];const a=g(x0,y0),b=g(x0+1,y0),c=g(x0,y0+1),d=g(x0+1,y0+1);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;};
  const W=512,H=256,h=new Float32Array(W*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){let v=0,amp=.5,f=4/W;for(let o=0;o<5;o++){v+=vn(x*f*GW/4,y*f*GW/4)*amp;amp*=.5;f*=2;}h[y*W+x]=v;}
  return terrainCache[seed]={W,H,h};}
 function terrainCanvas(seed,kind){const T0=terrain(seed),{W,H,h}=T0,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),img=g.createImageData(W,H),sea=.5;
  for(let y=0;y<H;y++){const lat=Math.abs(y/H-.5)*2;for(let x=0;x<W;x++){const v=h[y*W+x],i=(y*W+x)*4;let col;
   if(kind==='rough')col=v<sea?[90,90,90]:[255,255,255];else if(kind==='city')col=(v>sea+.02&&v<.66&&lat<.75&&((x*7919+y*104729)%97)<3)?[255,214,140]:[0,0,0];
   else if(lat>.86||(lat>.72&&v>sea))col=[235,242,255];else if(v<sea-.08)col=[18,52,120];else if(v<sea)col=[30,92,168];else if(v<sea+.02)col=[214,198,140];else if(v<.6)col=lat<.3?[178,160,96]:[60,128,62];else if(v<.68)col=[106,96,62];else col=[150,146,140];
   img.data[i]=col[0];img.data[i+1]=col[1];img.data[i+2]=col[2];img.data[i+3]=255;}}g.putImageData(img,0,0);return c;}
 function bodyMap(tex,seed,clouds){if(!clouds&&tex.terrain){const big=cv(1024,512,(c)=>{c.imageSmoothingEnabled=true;c.drawImage(terrainCanvas(seed,'col'),0,0,1024,512);});return big;}const W=1024,H=512,r=rnd(seed);return cv(W,H,(c)=>{if(clouds){c.clearRect(0,0,W,H);}else{c.fillStyle=tex.base;c.fillRect(0,0,W,H);
   for(let i=0;i<2500;i++){c.fillStyle=`rgba(${r()<.5?0:255},${r()<.5?0:255},${r()<.5?0:255},${r()*.05})`;c.fillRect(r()*W,r()*H,2+r()*14,1+r()*6);}
   if(tex.bands)for(const b of tex.bands){const y=(.5-b.lat/Math.PI)*H,hh=b.w*H*1.3;c.fillStyle=b.col;c.globalAlpha=.75;c.fillRect(0,y-hh/2,W,hh);for(let k=0;k<30;k++){c.globalAlpha=.25;c.fillRect(r()*W,y-hh/2+r()*hh,40+r()*120,2+r()*4);}c.globalAlpha=1;}}
  const list=clouds?tex.cl:tex.f;for(const f of list||[]){for(const dx of[-W,0,W]){const x=(((f.lon%(2*Math.PI))+2*Math.PI)%(2*Math.PI))/(2*Math.PI)*W+dx,y=(.5-f.lat/Math.PI)*H,ry=f.size/Math.PI*H,rx=Math.min(W/2,ry/Math.max(.25,Math.cos(f.lat)));
    c.globalAlpha=f.alpha;c.fillStyle=f.col;for(let k=0;k<7;k++){c.beginPath();c.ellipse(x+(r()-.5)*rx,y+(r()-.5)*ry,rx*(.4+r()*.5),ry*(.4+r()*.5),0,0,7);c.fill();}
    if(f.rim){c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=2;c.beginPath();c.ellipse(x,y,rx*.8,ry*.8,0,0,7);c.stroke();}}}c.globalAlpha=1;});}
 // ---------------- geometry from Starlane's convex models ----------------
 function geoOf(m){let g=geoCache.get(m);if(g)return g;const pos=[],uv=[],S=60;
  for(const f of m.faces){const P=f.v.map(i=>m.pts[i]);const p0=P[0];let t1=[P[1][0]-p0[0],P[1][1]-p0[1],P[1][2]-p0[2]];const l=Math.hypot(...t1)||1;t1=t1.map(x=>x/l);const n=f.n,t2=[n[1]*t1[2]-n[2]*t1[1],n[2]*t1[0]-n[0]*t1[2],n[0]*t1[1]-n[1]*t1[0]];
   const U=p=>{const d=[p[0]-p0[0],p[1]-p0[1],p[2]-p0[2]];return[(d[0]*t1[0]+d[1]*t1[1]+d[2]*t1[2])/S,(d[0]*t2[0]+d[1]*t2[1]+d[2]*t2[2])/S];};
   for(let k=1;k+1<P.length;k++){let a=P[0],b=P[k],cc=P[k+1];const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[cc[0]-a[0],cc[1]-a[1],cc[2]-a[2]],cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
    if(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]<0){const t=b;b=cc;cc=t;}for(const p of[a,b,cc]){pos.push(...p);uv.push(...U(p));}}}
  g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();geoCache.set(m,g);return g;}
 function setBasis(o3,pos,o){const r=M(o.r),u=M(o.u),f=M(o.f),p=M(pos);o3.matrix.set(r[0],u[0],f[0],p[0],r[1],u[1],f[1],p[1],r[2],u[2],f[2],p[2],0,0,0,1);o3.matrixAutoUpdate=false;o3.matrixWorldNeedsUpdate=true;}
 function metal(col,o={}){return new T.MeshStandardMaterial({color:new T.Color(col),map:panelTex(),metalness:o.metal??.55,roughness:o.rough??.42,flatShading:true,emissive:o.emissive?new T.Color(o.emissive):new T.Color(0),emissiveMap:o.emissiveMap||null,emissiveIntensity:o.ei??1});}
 // ---------------- setup ----------------
 function init(){T=window.THREE;gl=document.createElement('canvas');R=new T.WebGLRenderer({canvas:gl,antialias:true,alpha:false,powerPreference:'high-performance'});R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=.82;
  scene=new T.Scene();scene.background=new T.Color(0x000004);cam=new T.PerspectiveCamera(50,800/400,5,6e6);cam.matrixAutoUpdate=false;cam2=new T.PerspectiveCamera(70,1,5,6e6);cam2.matrixAutoUpdate=false;root=new T.Group();scene.add(root);
  scene.add(new T.AmbientLight(0x404a66,.1));scene.add(new T.HemisphereLight(0x8899cc,0x110808,.05));
  // starfield
  const sp=[],sc=[],r=rnd(99);for(let i=0;i<5000;i++){const u=r()*2-1,a=r()*Math.PI*2,s=Math.sqrt(1-u*u);sp.push(s*Math.cos(a)*4e5,u*4e5,s*Math.sin(a)*4e5);const w=.6+r()*.4,tint=r();sc.push(w*(tint<.2?.8:1),w*(tint>.85?.85:1),w*(tint<.2?1:tint>.85?.7:.95));}
  const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sp,3));sg.setAttribute('color',new T.Float32BufferAttribute(sc,3));
  starField=new T.Points(sg,new T.PointsMaterial({size:1.6,sizeAttenuation:false,vertexColors:true,depthWrite:false}));scene.add(starField);
  // particles: fire (additive) and smoke
  const mk=(n,add,size,tex)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(n*3),3));g.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(n*3),3));g.setDrawRange(0,0);
   const p=new T.Points(g,new T.PointsMaterial({size,map:tex,vertexColors:true,transparent:true,depthWrite:false,blending:add?T.AdditiveBlending:T.NormalBlending,sizeAttenuation:true}));p.frustumCulled=false;scene.add(p);return{p,n,list:[]};};
  fire=mk(2500,true,110,glowTex());smoke=mk(800,false,160,glowTex());
  const dg=new T.BufferGeometry();dg.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(400*3),3));dustPts=new T.Points(dg,new T.PointsMaterial({size:2,sizeAttenuation:false,color:0xcfd8ff}));dustPts.frustumCulled=false;scene.add(dustPts);
  for(let i=0;i<3;i++){const L=new T.PointLight(0xffa040,0,5000,1.6);L.userData.t=9;scene.add(L);boomLights.push(L);}
  comp=new T.EffectComposer(R);comp.addPass(new T.RenderPass(scene,cam));bloom=new T.UnrealBloomPass(new T.Vector2(800,400),.85,.45,.72);comp.addPass(bloom);}
 // ---------------- system bodies: suns, planet, moons, black hole ----------------
 function clearBodies(){for(const b of bodies){root.remove(b);b.traverse&&b.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){if(x.material.map)x.material.map.dispose();x.material.dispose();}});}bodies=[];for(const l of sunLights)scene.remove(l);sunLights=[];bhGroup=null;}
 function atmoMat(col){const m=/rgba?\(([^)]+)\)/.exec(col||'');const v=m?m[1].split(',').map(Number):[140,200,255];return new T.ShaderMaterial({uniforms:{c:{value:new T.Color(v[0]/255,v[1]/255,v[2]/255)}},
   vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
   fragmentShader:'uniform vec3 c;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.0-abs(dot(vN,vV)),4.0);gl_FragColor=vec4(c*1.2,f*0.85);}',transparent:true,blending:T.AdditiveBlending,side:T.FrontSide,depthWrite:false});}
 function nebulaTex(seed){const r=rnd(seed),W=1024,H=512;return cv(W,H,(c)=>{c.fillStyle='#000';c.fillRect(0,0,W,H);const hues=[r()*360,r()*360];
   for(let i=0;i<26;i++){const x=r()*W,y=H*(.25+r()*.5),rad=60+r()*240,h=hues[i%2]+(r()-.5)*40,g=c.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,`hsla(${h},70%,45%,${.10+r()*.12})`);g.addColorStop(1,'hsla(0,0%,0%,0)');c.fillStyle=g;for(const dx of[-W,0,W]){c.beginPath();c.arc(x+dx,y,rad,0,7);c.fill();}}
   for(let i=0;i<1400;i++){c.fillStyle=`rgba(255,255,255,${r()*.5})`;c.fillRect(r()*W,r()*H,1,1);}});}
 function cityTex(tex,seed){const W=1024,H=512,r=rnd(seed);return cv(W,H,c=>{c.fillStyle='#000';c.fillRect(0,0,W,H);for(const f of tex.f||[]){if(f.col==='#eef4ff')continue;const x0=(((f.lon%(2*Math.PI))+2*Math.PI)%(2*Math.PI))/(2*Math.PI)*W,y0=(.5-f.lat/Math.PI)*H,ry=f.size/Math.PI*H*.8,rx=ry/Math.max(.3,Math.cos(f.lat));
   for(let k=0;k<70;k++){const a=r()*7,d=Math.sqrt(r());c.fillStyle=r()<.8?'rgba(255,214,140,.9)':'rgba(255,250,220,1)';c.fillRect(x0+Math.cos(a)*rx*d,y0+Math.sin(a)*ry*d,1+r()*2,1+r()*1.5);}}});}
 function roughTex(tex){const W=512,H=256;const t=cv(W,H,c=>{c.fillStyle='#4a4a4a';c.fillRect(0,0,W,H);c.fillStyle='#ffffff';for(const f of tex.f||[]){const x=(((f.lon%(2*Math.PI))+2*Math.PI)%(2*Math.PI))/(2*Math.PI)*W,y=(.5-f.lat/Math.PI)*H,ry=f.size/Math.PI*H,rx=Math.min(W/2,ry/Math.max(.25,Math.cos(f.lat)));c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();}});t.encoding=T.LinearEncoding;return t;}
 function buildBodies(A){clearBodies();const sys=A.here();if(nebula){scene.remove(nebula);nebula.material.map.dispose();nebula.material.dispose();}nebula=new T.Mesh(new T.SphereGeometry(3.6e5,48,32),new T.MeshBasicMaterial({map:nebulaTex(sys.seed^0x77),side:T.BackSide,depthWrite:false}));nebula.renderOrder=-2;scene.add(nebula);cityMats=[];
  for(const sn of A.suns){const g=new T.Group();const m=new T.Mesh(new T.SphereGeometry(sn.R,48,32),new T.MeshBasicMaterial({color:new T.Color(sn.col).multiplyScalar(2.2)}));g.add(m);
   const gs=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:new T.Color(sn.col),blending:T.AdditiveBlending,depthWrite:false,transparent:true}));gs.scale.set(sn.R*9,sn.R*9,1);g.add(gs);g.userData={src:sn};root.add(g);bodies.push(g);
   const L=new T.DirectionalLight(new T.Color(sn.col).lerp(new T.Color(1,1,1),.6),sunLights.length?0.6:1.35);scene.add(L);scene.add(L.target);L.userData={src:sn};sunLights.push(L);}
  const pl=A.planet;if(pl){const g=new T.Group();g.userData={src:pl,spinBody:true};const tex=pl.tex||{base:'#3f86c9',f:[],cl:[]};
   const rocky=pl.kind==='rocky';const tseed=sys.seed^0x5151;const mapT=rocky?bodyMap({terrain:true},tseed,false):bodyMap(tex,sys.seed,false);const big=(kind)=>{const t=cv(1024,512,c=>{c.drawImage(terrainCanvas(tseed,kind),0,0,1024,512);});if(kind==='rough')t.encoding=T.LinearEncoding;return t;};
   const pm=new T.MeshStandardMaterial({map:mapT,roughness:rocky?1:.9,roughnessMap:rocky?big('rough'):null,metalness:0,emissive:rocky?new T.Color(1,1,1):new T.Color(0),emissiveMap:rocky?big('city'):null,emissiveIntensity:1.6});
   if(rocky){pm.onBeforeCompile=sh=>{sh.uniforms.sunDirV={value:new T.Vector3(0,0,1)};pm.userData.sh=sh;sh.fragmentShader='uniform vec3 sunDirV;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance*=smoothstep(0.12,-0.25,dot(normalize(vNormal),normalize(sunDirV)));');};cityMats.push(pm);}
   g.add(new T.Mesh(new T.SphereGeometry(pl.R,128,96),pm));
   if(tex.cl&&tex.cl.length){const cm=new T.Mesh(new T.SphereGeometry(pl.R*1.012,96,64),new T.MeshStandardMaterial({map:bodyMap(tex,sys.seed+1,true),transparent:true,depthWrite:false,roughness:1}));cm.userData.clouds=true;g.add(cm);}
   if(tex.atmo)g.add(new T.Mesh(new T.SphereGeometry(pl.R*1.06,96,64),atmoMat(tex.atmo)));
   if(pl.rings){const rg=new T.RingGeometry(pl.rings.a,pl.rings.b,160,1);const uv=rg.attributes.uv,pp=rg.attributes.position;for(let i=0;i<uv.count;i++){const rr=Math.hypot(pp.getX(i),pp.getY(i));uv.setXY(i,(rr-pl.rings.a)/(pl.rings.b-pl.rings.a),.5);}rg.rotateX(-Math.PI/2);
    const rt=cv(512,4,(c,w)=>{const r=rnd(sys.seed+5);for(let x=0;x<w;x++){const a=.25+r()*.55;c.fillStyle=`rgba(${200+r()*40|0},${170+r()*40|0},${120+r()*40|0},${a*(x<20||x>w-20?.3:1)})`;c.fillRect(x,0,1,4);}});
    g.add(new T.Mesh(rg,new T.MeshStandardMaterial({map:rt,transparent:true,side:T.DoubleSide,depthWrite:false,roughness:1})));}
   root.add(g);bodies.push(g);}
  for(const mn of A.moons){const g=new T.Group();g.userData={src:mn};g.add(new T.Mesh(new T.SphereGeometry(mn.R,64,48),new T.MeshStandardMaterial({map:bodyMap(mn.tex||{base:'#9a9ea8',f:[]},sys.seed+mn.R|0,false),roughness:1})));root.add(g);bodies.push(g);}
  if(A.bh){const b=A.bh,g=new T.Group();g.userData={src:b,bh:true};g.add(new T.Mesh(new T.SphereGeometry(b.R,64,48),new T.MeshBasicMaterial({color:0x000000})));
   const dt=cv(512,512,(c,w)=>{const g2=c.createRadialGradient(256,256,90,256,256,256);g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(.36,'rgba(255,240,210,.95)');g2.addColorStop(.5,'rgba(255,160,60,.8)');g2.addColorStop(.8,'rgba(180,60,30,.35)');g2.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g2;c.fillRect(0,0,w,w);
    const r=rnd(3);c.globalCompositeOperation='destination-out';for(let i=0;i<220;i++){const a=r()*7,rr=120+r()*130;c.strokeStyle=`rgba(0,0,0,${r()*.5})`;c.lineWidth=1+r()*3;c.beginPath();c.arc(256,256,rr,a,a+.3+r()*.8);c.stroke();}});
   const disk=new T.Mesh(new T.PlaneGeometry(b.R*7,b.R*7),new T.MeshBasicMaterial({map:dt,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));disk.rotation.x=-Math.PI/2+.35;disk.userData.disk=true;g.add(disk);
   const ring=new T.Mesh(new T.TorusGeometry(b.R*1.08,b.R*.025,8,96),new T.MeshBasicMaterial({color:0xfff0d8}));g.add(ring);
   const gs=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xb45bd6,blending:T.AdditiveBlending,transparent:true,depthWrite:false,opacity:.5}));gs.scale.set(b.R*10,b.R*10,1);g.add(gs);root.add(g);bodies.push(g);bhGroup=g;}}
 // ---------------- ships, station and other objects ----------------
 // ---------------- faction ships: each has its own hand-built look ----------------
 const FDECO={
  halo(g){const pearl=new T.MeshStandardMaterial({color:0xe8eef8,metalness:.5,roughness:.3}),glowM=c=>new T.MeshBasicMaterial({color:c});
   const hull=new T.Mesh(new T.SphereGeometry(1,24,14),pearl);hull.scale.set(11,10,90);g.add(hull);
   const ring=new T.Mesh(new T.TorusGeometry(62,7,12,48),pearl);g.add(ring);const rim=new T.Mesh(new T.TorusGeometry(62,1.4,6,48),glowM(0x7fe9ff));rim.position.z=7.4;g.add(rim);
   for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4,sp=new T.Mesh(new T.CylinderGeometry(1.2,1.2,62,6),pearl);sp.position.set(Math.cos(a)*31,Math.sin(a)*31,0);sp.rotation.z=a+Math.PI/2;g.add(sp);}
   const core=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0x7fe9ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.8}));core.scale.set(90,90,1);g.add(core);
   for(let k=0;k<4;k++){const a=k*Math.PI/2,sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(60,10);sh.lineTo(8,34);sh.closePath();const sail=new T.Mesh(new T.ShapeGeometry(sh),new T.MeshBasicMaterial({color:0x7fe9ff,transparent:true,opacity:.35,side:T.DoubleSide,depthWrite:false}));sail.rotation.set(0,Math.PI/2,0);sail.rotation.z=a;sail.position.z=-70;const hold=new T.Group();hold.rotation.z=a;hold.add(sail);sail.rotation.z=0;g.add(hold);}
   const eng=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0x7fe9ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));eng.position.set(0,0,-94);eng.scale.set(50,50,1);eng.userData.engine=true;g.add(eng);},
  scrapjaw(g){const rust=new T.MeshStandardMaterial({color:0xb5622e,metalness:.5,roughness:.8,flatShading:true}),steel=new T.MeshStandardMaterial({color:0x6b6f78,metalness:.8,roughness:.5,flatShading:true}),red=new T.MeshBasicMaterial({color:0xff3d2e});
   const add=(geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const me=new T.Mesh(geo,m);me.position.set(x,y,z);me.rotation.set(rx,ry,rz);g.add(me);return me;};
   add(new T.BoxGeometry(62,36,84),rust,0,0,-4);add(new T.BoxGeometry(40,18,50),steel,10,20,-10,0,.2,.1);add(new T.BoxGeometry(34,14,40),rust,-18,-20,8,0,-.15,0);
   for(const sx of[-1,1]){add(new T.BoxGeometry(8,10,54),steel,sx*20,-2,62,0,sx*.28,0);add(new T.ConeGeometry(5,16,4),steel,sx*28,-2,92,Math.PI/2,0,0);}
   for(const[x,z]of[[-18,-20],[4,-4],[20,16]])add(new T.ConeGeometry(4,22,4),steel,x,32,z);
   add(new T.CylinderGeometry(13,15,22,10),steel,-14,4,-54,Math.PI/2,0,0);add(new T.CylinderGeometry(7,8,16,8),steel,18,-8,-52,Math.PI/2,0,0);add(new T.CylinderGeometry(6,7,14,8),steel,16,14,-50,Math.PI/2,0,0);
   for(const[x,y,z]of[[-31.5,6,10],[31.5,-4,-6],[0,18.5,30]])add(new T.SphereGeometry(2.4,8,6),red,x,y,z);
   for(const[x,y,s]of[[-14,4,60],[18,-8,34],[16,14,30]]){const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xff5030,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(x,y,-66);e.scale.set(s,s,1);e.userData.engine=true;g.add(e);}},
  ark(g){const hullM=new T.MeshStandardMaterial({color:0xc8ced8,metalness:.6,roughness:.4}),glass=new T.MeshStandardMaterial({color:0xbfe9ff,transparent:true,opacity:.35,roughness:.1,metalness:.1,side:T.DoubleSide,depthWrite:false}),green=new T.MeshStandardMaterial({color:0x3cb44a,roughness:.9});
   const add=(geo,m,x,y,z,rx=0)=>{const me=new T.Mesh(geo,m);me.position.set(x,y,z);me.rotation.x=rx;g.add(me);return me;};
   add(new T.BoxGeometry(14,10,300),hullM,0,-6,0);for(const sx of[-1,1])add(new T.CylinderGeometry(2,2,300,6),hullM,sx*16,-14,0,Math.PI/2);
   for(let k=0;k<4;k++){const z=-90+k*62;add(new T.CylinderGeometry(27,27,4,24),hullM,0,0,z);add(new T.SphereGeometry(26,24,12,0,Math.PI*2,0,Math.PI/2),glass,0,2,z);const hill=add(new T.SphereGeometry(20,14,8,0,Math.PI*2,0,Math.PI/2),green,0,2,z);hill.scale.y=.45;for(let t=0;t<5;t++){const a=t*1.3+k;add(new T.ConeGeometry(3,10,6),green,Math.cos(a)*11,10,z+Math.sin(a)*11);}}
   add(new T.BoxGeometry(46,40,50),hullM,0,-4,-170);add(new T.ConeGeometry(14,36,10),hullM,0,-4,168,Math.PI/2);
   const lightM=new T.MeshBasicMaterial({color:0xffe8a0});for(let k=0;k<12;k++)add(new T.BoxGeometry(1,2,3),lightM,7.6,-4,-130+k*24);
   const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xa8e070,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(0,-4,-200);e.scale.set(110,110,1);e.userData.engine=true;g.add(e);},
  quicksilver(g){const chrome=new T.MeshStandardMaterial({color:0xf2f4fa,metalness:1,roughness:.08}),vio=new T.MeshBasicMaterial({color:0xc77dff});
   const hull=new T.Mesh(new T.SphereGeometry(1,28,16),chrome);hull.scale.set(9,7,80);g.add(hull);
   for(const sx of[-1,1]){const sh=new T.Shape();sh.moveTo(0,0);sh.quadraticCurveTo(sx*34,-6,sx*52,-44);sh.quadraticCurveTo(sx*22,-26,0,-30);sh.closePath();const fin=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:1.6,bevelEnabled:false}),chrome);fin.rotation.x=-Math.PI/2;fin.position.set(0,0,-6);g.add(fin);}
   const line=new T.Mesh(new T.BoxGeometry(1,1,90),vio);line.position.set(0,7.2,10);g.add(line);
   const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xc77dff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(0,0,-84);e.scale.set(60,60,1);e.userData.engine=true;g.add(e);
   const tr=new T.Mesh(new T.ConeGeometry(4,160,8,1,true),new T.MeshBasicMaterial({color:0xc77dff,transparent:true,opacity:.35,blending:T.AdditiveBlending,depthWrite:false}));tr.rotation.x=Math.PI/2;tr.position.z=-160;g.add(tr);},
  thornbloom(g){const mats=[0xb45bd6,0x3fb0c8,0xe080c0].map(c=>new T.MeshStandardMaterial({color:c,metalness:.3,roughness:.15,emissive:new T.Color(c),emissiveIntensity:.45,flatShading:true,transparent:true,opacity:.92}));
   const dirs=[[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[.7,.7,0],[-.7,.6,.3],[.6,-.6,.4],[-.5,-.7,-.4],[.4,.5,.8],[-.4,.4,-.8],[.8,-.2,-.6],[-.8,-.1,.6]];
   dirs.forEach((d,i)=>{const L=40+((i*37)%5)*18,sh=new T.Mesh(new T.ConeGeometry(7+((i*13)%4)*2,L,5),mats[i%3]),v=new T.Vector3(d[0],d[1],d[2]).normalize();sh.position.copy(v.clone().multiplyScalar(L/2));sh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v);g.add(sh);});
   g.add(new T.Mesh(new T.IcosahedronGeometry(18,0),mats[0]));const core=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xff9cf0,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));core.scale.set(120,120,1);core.userData.pulse=true;g.add(core);},
  seed(g){const leaf=new T.Mesh(new T.SphereGeometry(1,12,8),new T.MeshStandardMaterial({color:0xa8e070,metalness:.4,roughness:.4}));leaf.scale.set(8,3,20);g.add(leaf);const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xe8ffd0,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(0,0,-22);e.scale.set(18,18,1);e.userData.engine=true;g.add(e);}};
 function shipObj(sh,A){const g=new T.Group(),col=sh===A.station?'#d8dce8':(sh.look&&sh.look.paint&&sh.look.paint.main)||(sh.T&&sh.T.color)||'#cccccc',role=sh.T&&sh.T.role;
  if(sh===A.station){g.add(new T.Mesh(geoOf(sh.m),metal('#c9cdd8',{emissive:'#ffffff',emissiveMap:windowTex(),ei:1.6})));
   const slot=new T.Mesh(new T.PlaneGeometry(220,72),new T.MeshBasicMaterial({color:0x02040a}));slot.position.set(0,0,332);g.add(slot);
   const frame=new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(224,76)),new T.LineBasicMaterial({color:0x3fe0ff}));frame.position.set(0,0,333);g.add(frame);
   const glow=new T.Mesh(new T.PlaneGeometry(220,72),new T.MeshBasicMaterial({color:0x3fe0ff,transparent:true,opacity:.18,blending:T.AdditiveBlending,depthWrite:false}));glow.position.set(0,0,333.5);g.add(glow);
   for(const[x,c]of[[-135,0xff2d55],[135,0x3cff6a]]){const l=new T.Mesh(new T.SphereGeometry(9,12,8),new T.MeshBasicMaterial({color:c}));l.position.set(x,0,335);l.userData.blink=x;g.add(l);}
   for(const p of sh.parts||[])g.add(new T.Mesh(geoOf(p.m),metal(p.col==='#3f6fd6'?'#2a4fb0':p.col,{emissive:'#ffffff',emissiveMap:windowTex(),ei:1.2,metal:p.col==='#3f6fd6'?.9:.55})));}
  else if(sh.type&&FDECO[sh.type]){FDECO[sh.type](g);}
  else if(role==='rock'){g.add(new T.Mesh(geoOf(sh.m),new T.MeshStandardMaterial({color:new T.Color('#8a7a68'),roughness:1,metalness:.05,flatShading:true,map:panelTex()})));}
  else if(role==='mine'){g.add(new T.Mesh(geoOf(sh.m),metal('#ff2d55',{metal:.8,rough:.3})));const l=new T.Mesh(new T.SphereGeometry(6,8,6),new T.MeshBasicMaterial({color:0xff2d55}));l.userData.blink=1;g.add(l);}
  else{g.add(new T.Mesh(geoOf(sh.m),metal(col)));for(const p of sh.parts||[])g.add(new T.Mesh(geoOf(p.m),metal(p.col,{metal:.7})));
   if(!['cargo','missile','beacon','derelict'].includes(role))detail(g,sh.m,col);
   if(sh.ant){const a=sh.ant;const lg=new T.BufferGeometry().setFromPoints([new T.Vector3(...a[0]),new T.Vector3(...a[1])]);g.add(new T.Line(lg,new T.LineBasicMaterial({color:col})));}
   if(!['cargo'].includes(role)){const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:sh.type==='missile'?0xff8a1c:0x3fe0ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(0,0,(sh.rearZ||-30)-6);e.scale.set(60,60,1);e.userData.engine=true;g.add(e);}}
  if(sh.look)shipLook(g,sh.m,sh.look);
  root.add(g);return g;}
 // engine nozzles with glowing cores, a glass canopy and navigation lights, sized from the model itself
 let navLights=[];
 function detail(g,m,col){const P0=m.pts,xs=P0.map(p=>p[0]),ys=P0.map(p=>p[1]),zs=P0.map(p=>p[2]),xmax=Math.max(...xs),ymax=Math.max(...ys),zmin=Math.min(...zs),zmax=Math.max(...zs),rad=m.rad;
  const noz=new T.MeshStandardMaterial({color:0x2a2e38,metalness:.9,roughness:.35}),core=new T.MeshBasicMaterial({color:0x6fd8ff});
  for(const sx of xmax>rad*.45?[-1,1]:[0]){const n=new T.Mesh(new T.CylinderGeometry(rad*.11,rad*.14,rad*.22,14,1,true),noz);n.rotation.x=Math.PI/2;n.position.set(sx*xmax*.28,0,zmin+rad*.04);g.add(n);
   const cdisk=new T.Mesh(new T.CircleGeometry(rad*.1,14),core);cdisk.position.set(sx*xmax*.28,0,zmin-rad*.05);cdisk.rotation.y=Math.PI;g.add(cdisk);}
  const can=new T.Mesh(new T.SphereGeometry(rad*.11,18,10,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:0x0c2236,metalness:.35,roughness:.3,transparent:true,opacity:.85,emissive:new T.Color(0x06182a)}));can.scale.set(1,.5,1.35);can.position.set(0,ymax*.5,zmax*.2);g.add(can);
  for(const[sx,c]of[[-1,0xff2d55],[1,0x3cff6a]]){const L=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:c,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));L.scale.set(rad*.16,rad*.16,1);L.position.set(sx*xmax*.98,0,0);g.add(L);}
  const st=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xffffff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));st.scale.set(rad*.22,rad*.22,1);st.position.set(0,ymax*1.02,zmin*.6);st.userData.strobe=Math.random()*2;g.add(st);
  const bub=new T.Mesh(new T.SphereGeometry(rad*1.25,24,16),new T.MeshBasicMaterial({color:0x5fd6ff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));bub.visible=false;bub.userData.bubble=true;g.add(bub);}
 // ---------------- your ship's look: fitted equipment you can see, paint, stripes, decals, name ----------------
 const lookTex={};
 function lookCanvas(key,w,h,draw){if(lookTex[key])return lookTex[key];const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return(lookTex[key]=t);}
 function shipLook(g,m,L){if(!L)return;const hullMeshes=g.children.filter(o=>o.isMesh).slice(0,1),P0=m.pts,xs=P0.map(p=>p[0]),ys=P0.map(p=>p[1]),zs=P0.map(p=>p[2]),xmax=Math.max(...xs),ymax=Math.max(...ys),ymin=Math.min(...ys),zmax=Math.max(...zs),zmin=Math.min(...zs),rad=m.rad,len=zmax-zmin;
  const paint=L.paint||{},trimC=paint.trim||'#2a2e38',gun=new T.MeshStandardMaterial({color:0x3a3f4a,metalness:.9,roughness:.3}),trim=new T.MeshStandardMaterial({color:trimC,metalness:.7,roughness:.35}),gl=c=>new T.MeshBasicMaterial({color:c});
  const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const me=new T.Mesh(geo,mat);me.position.set(x,y,z);me.rotation.set(rx,ry,rz);g.add(me);return me;},cyl=(r1,r2,h,seg=12)=>new T.CylinderGeometry(r1,r2,h,seg);
  const barrel=(x,y,z0,l,r,mat)=>add(cyl(r,r,l),mat,x,y,z0+l/2,Math.PI/2,0,0),ny=ymin*.3,nz=zmax*.8;
  // the front laser
  const f=L.front||'pulse';if(f==='pulse')barrel(0,ny,nz,rad*.32,rad*.03,gun);
  else if(f==='beam'){barrel(0,ny,nz,rad*.46,rad*.035,gun);for(let k=0;k<3;k++)add(new T.TorusGeometry(rad*.05,rad*.012,6,14),gl(0x3fe0ff),0,ny,nz+rad*(.12+k*.11));}
  else if(f==='twin'){for(const sx of[-1,1])barrel(sx*rad*.1,ny,nz,rad*.42,rad*.03,gun);add(new T.BoxGeometry(rad*.32,rad*.06,rad*.12),trim,0,ny,nz);}
  else if(f==='military'){add(new T.BoxGeometry(rad*.36,rad*.1,rad*.24),trim,0,ny,nz);for(const sx of[-1,1])barrel(sx*rad*.1,ny,nz+rad*.1,rad*.6,rad*.035,gun);for(const sx of[-1,1])add(new T.SphereGeometry(rad*.022,8,6),gl(0x3fe0ff),sx*rad*.1,ny,nz+rad*.71);}
  else if(f==='plasma'){barrel(0,ny,nz,rad*.4,rad*.075,gun);const core=add(new T.SphereGeometry(rad*.08,14,10),gl(0xc77dff),0,ny,nz+rad*.42);core.userData.pulse=true;for(let k=0;k<2;k++)add(new T.TorusGeometry(rad*.085,rad*.015,6,16),gl(0xc77dff),0,ny,nz+rad*(.12+k*.14));}
  else if(f==='mining'){add(new T.ConeGeometry(rad*.08,rad*.3,12),new T.MeshStandardMaterial({color:0xff8a1c,metalness:.6,roughness:.4}),0,ny,nz+rad*.15,Math.PI/2,0,0);}
  if(L.rear){add(new T.BoxGeometry(rad*.14,rad*.08,rad*.14),trim,0,ymax*.95,zmin*.55);barrel(0,ymax*.95,zmin*.55-rad*.28,rad*.28,rad*.025,gun);}
  // missiles on pylons under the wings
  for(let i=0;i<Math.min(4,L.missiles||0);i++){const sx=i%2?1:-1,x=sx*xmax*(.42+Math.floor(i/2)*.2),y=ymin*.55-rad*.06,z=zmin*.05;add(new T.BoxGeometry(rad*.02,rad*.06,rad*.18),trim,x,y+rad*.04,z);add(cyl(rad*.03,rad*.03,rad*.34,10),new T.MeshStandardMaterial({color:0xf2f2f2,metalness:.3,roughness:.5}),x,y,z,Math.PI/2,0,0);add(new T.ConeGeometry(rad*.03,rad*.08,10),gl(0xff2d55),x,y,z+rad*.21,Math.PI/2,0,0);}
  const eq=L.eq||{};
  if(eq.scoop)for(const sx of[-1,1]){const s2=add(cyl(rad*.06,rad*.075,rad*.2,14),new T.MeshStandardMaterial({color:0x1c2028,metalness:.8,roughness:.4,side:T.DoubleSide}),sx*xmax*.24,ymin*.7,zmax*.45,Math.PI/2,0,0);add(new T.TorusGeometry(rad*.065,rad*.012,6,16),gl(0xffb020),sx*xmax*.24,ymin*.7,zmax*.45+rad*.1);}
  if(L.bigCargo){add(new T.BoxGeometry(xmax*.55,rad*.14,len*.38),trim,0,ymin-rad*.06,zmin*.15);add(new T.BoxGeometry(xmax*.56,rad*.02,len*.02),gl(0xffe45e),0,ymin-rad*.06,zmin*.15+len*.12);}
  if(eq.ecm){add(cyl(rad*.008,rad*.012,rad*.32,6),gun,0,ymax+rad*.16,zmin*.35);const b=add(new T.SphereGeometry(rad*.025,8,6),gl(0xff2d55),0,ymax+rad*.33,zmin*.35);b.userData.blink=true;}
  if(eq.dock){add(new T.SphereGeometry(rad*.07,14,8,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:0x3fa9ff,metalness:.2,roughness:.1,transparent:true,opacity:.75,emissive:new T.Color(0x0a3a66)}),0,ymax*.95,zmax*.25);}
  if(eq.afterburner)for(const sx of xmax>rad*.45?[-1,1]:[0])add(new T.TorusGeometry(rad*.15,rad*.025,8,20),gl(0xff8a1c),sx*xmax*.28,0,zmin-rad*.02);
  if(eq.tractor){add(cyl(rad*.09,rad*.06,rad*.03,16),gun,0,ymin*.92,zmax*.2);add(new T.TorusGeometry(rad*.08,rad*.012,6,18),gl(0x3cff6a),0,ymin*.92-rad*.02,zmax*.2,Math.PI/2,0,0);}
  if(eq.shieldboost)for(const sx of[-1,1])add(new T.SphereGeometry(rad*.04,10,8),gl(0x5fd6ff),sx*xmax*.97,0,zmin*.25);
  if(eq.energy)add(new T.BoxGeometry(rad*.03,rad*.012,len*.45),gl(0x3cff6a),0,ymax*1.005,0);
  if(eq.firectl){add(cyl(rad*.035,rad*.035,rad*.16,10),trim,xmax*.5,ymin*.25,zmax*.35,Math.PI/2,0,0);add(new T.SphereGeometry(rad*.025,8,6),gl(0xff2d55),xmax*.5,ymin*.25,zmax*.35+rad*.09);}
  if(eq.repairbot)for(const sx of[-1,1]){add(new T.BoxGeometry(rad*.08,rad*.05,rad*.08),trim,sx*xmax*.3,ymax*.85,zmin*.6);add(new T.SphereGeometry(rad*.012,6,4),gl(0xffe45e),sx*xmax*.3,ymax*.85+rad*.03,zmin*.6);}
  if(L.starburst>0)for(let k=0;k<6;k++){const a=k/6*Math.PI*2;add(new T.SphereGeometry(rad*.025,8,6),gl(0xffe45e),Math.cos(a)*xmax*.55,Math.sin(a)*Math.max(ymax,-ymin)*.8,zmin*.05);}
  // paint: stripes, a decal and the ship's name and number
  const strC=paint.stripeCol||trimC;
  if(paint.stripe==='racing')for(const sx of[-1,1])add(new T.BoxGeometry(rad*.05,rad*.008,len*.85),new T.MeshStandardMaterial({color:strC,roughness:.4}),sx*rad*.09,ymax*1.008,(zmax+zmin)/2);
  else if(paint.stripe==='centre')add(new T.BoxGeometry(rad*.12,rad*.008,len*.85),new T.MeshStandardMaterial({color:strC,roughness:.4}),0,ymax*1.008,(zmax+zmin)/2);
  else if(paint.stripe==='wings')for(const sx of[-1,1])add(new T.BoxGeometry(xmax*.5,rad*.008,rad*.07),new T.MeshStandardMaterial({color:strC,roughness:.4}),sx*xmax*.5,ymax*.4,zmin*.3);
  if(paint.decal&&paint.decal!=='none'){const tx=lookCanvas('decal-'+paint.decal+strC,128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle=strC;c.strokeStyle='#ffffff';c.lineWidth=4;c.beginPath();
    if(paint.decal==='star'){for(let i=0;i<10;i++){const r=i%2?24:56,a=i/10*Math.PI*2-Math.PI/2;c.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r);}}else if(paint.decal==='bolt'){[[70,6],[30,70],[60,70],[46,122],[100,50],[68,50],[86,6]].forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));}
    else if(paint.decal==='flames'){for(let i=0;i<5;i++){c.moveTo(10,30+i*18);c.quadraticCurveTo(70,16+i*18,120,28+i*18);c.quadraticCurveTo(70,40+i*18,10,44+i*18);}}else if(paint.decal==='planet'){c.arc(64,64,36,0,7);c.fill();c.stroke();c.beginPath();c.ellipse(64,64,58,14,-.3,0,7);}
    c.closePath();c.fill();c.stroke();});add(new T.PlaneGeometry(rad*.32,rad*.32),new T.MeshBasicMaterial({map:tx,transparent:true,side:T.DoubleSide,depthWrite:false}),0,ymax*1.012,zmin*.45,-Math.PI/2,0,0);}
  if(paint.name||paint.num){const label=`${paint.name||''}${paint.num?' '+String(paint.num).padStart(2,'0'):''}`.trim().toUpperCase(),tx=lookCanvas('name-'+label+strC,256,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.font='bold 34px sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=6;c.strokeStyle='rgba(0,0,0,.6)';c.strokeText(label,w/2,h/2);c.fillStyle='#ffffff';c.fillText(label,w/2,h/2);});
   // lay the name flat on the real hull surface on each side
   g.updateMatrixWorld(true);const rc=new T.Raycaster(),inv=new T.Matrix4().copy(g.matrixWorld).invert(),nm=new T.Matrix3().getNormalMatrix(inv);
   for(const sx of[-1,1]){let best=null;for(const yy of[0,ymax*.2,ymin*.2,ymax*.4])for(const zz of[zmin*.1,zmax*.1,zmin*.3]){const o=g.localToWorld(new T.Vector3(sx*xmax*3+sx*rad,yy,zz)),d=g.localToWorld(new T.Vector3(0,yy,zz)).sub(o).normalize();rc.set(o,d);const hit=rc.intersectObjects(hullMeshes,false)[0];if(!hit||!hit.face)continue;
      const pL=g.worldToLocal(hit.point.clone()),nW=hit.face.normal.clone().transformDirection(hit.object.matrixWorld),nL=nW.applyMatrix3(nm).normalize();if(nL.x*sx<0)nL.negate();const score=Math.abs(nL.x)-Math.abs(zz)/(len*4);if(!best||score>best.score)best={p:pL,n:nL,score};}
    if(!best||Math.abs(best.n.x)<.25){add(new T.PlaneGeometry(len*.42,len*.105),new T.MeshBasicMaterial({map:tx,transparent:true,side:T.DoubleSide,depthWrite:false}),sx*xmax*.72,ymax*.18,zmin*.15,0,sx*Math.PI/2,0);continue;}
    const n=best.n,up=new T.Vector3(0,1,0).sub(n.clone().multiplyScalar(n.y)).normalize(),xa=new T.Vector3().crossVectors(up,n).normalize(),wq=Math.min(len*.42,rad*1.1),
     me=new T.Mesh(new T.PlaneGeometry(wq,wq*.25),new T.MeshBasicMaterial({map:tx,transparent:true,side:T.FrontSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
    me.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(xa,up,n));me.position.copy(best.p.clone().add(n.clone().multiplyScalar(rad*.012)));g.add(me);}}}
 function lookTick(g,clock){g.traverse(o=>{const u=o.userData;if(u.blink)o.visible=(clock%1.2)<.6;if(u.pulse){const k=1+Math.sin(clock*6)*.15;o.scale.set(k,k,k);}});}
 // a turntable preview of your ship for the shipyard
 let pvScene=null,pvCam=null,pvShip=null,pvKey='';
 function preview(ctx,A){if(!ready()||!R)return false;const w=Math.round(A.w*A.k),h=Math.round(A.h*A.k);
  if(!pvScene){pvScene=new T.Scene();pvScene.background=new T.Color(0x0a0f1e);pvScene.add(new T.AmbientLight(0x8090b0,.7));const d=new T.DirectionalLight(0xffffff,1.4);d.position.set(1,1.2,.8);pvScene.add(d);const d2=new T.DirectionalLight(0x6fa8ff,.6);d2.position.set(-1,-.4,-.6);pvScene.add(d2);pvCam=new T.PerspectiveCamera(35,1,1,20000);}
  const key=JSON.stringify(A.look)+A.m.rad;if(!pvShip||pvKey!==key){if(pvShip)pvScene.remove(pvShip);pvShip=new T.Group();const col=(A.look&&A.look.paint&&A.look.paint.main)||'#ffd84a';pvShip.add(new T.Mesh(geoOf(A.m),metal(col,{metal:.6})));detail(pvShip,A.m,col);shipLook(pvShip,A.m,A.look);pvScene.add(pvShip);pvKey=key;}
  pvShip.rotation.set(.25,A.t*.6,0);lookTick(pvShip,A.t);const r=A.m.rad;pvCam.aspect=w/h;pvCam.position.set(0,r*.9,r*3.4);pvCam.lookAt(0,0,0);pvCam.updateProjectionMatrix();
  if(gl.width!==w||gl.height!==h){R.setPixelRatio(1);R.setSize(w,h,false);}R.setScissorTest(false);R.setViewport(0,0,w,h);R.render(pvScene,pvCam);ctx.drawImage(gl,A.x,A.y,A.w,A.h);return true;}
 // ---------------- adventure bodies: a real-looking Earth and Moon ----------------
 const advMeshes=new Map();let earthT=null,cloudT=null,moonT=null;
 function vnoise(){const P=new Uint8Array(512);for(let i=0;i<256;i++)P[i]=i;let sd=1234567;for(let i=255;i>0;i--){sd=(sd*16807)%2147483647;const j=sd%(i+1);[P[i],P[j]]=[P[j],P[i]];}for(let i=0;i<256;i++)P[i+256]=P[i];
  const g=i=>P[i]/255,f=t=>t*t*(3-2*t),lerp=(a,b,t)=>a+(b-a)*t;
  const n3=(x,y,z)=>{const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255,xf=x-Math.floor(x),yf=y-Math.floor(y),zf=z-Math.floor(z),u=f(xf),v=f(yf),w=f(zf),h=(a,b,c)=>g(P[P[P[a]+b]+c]);
   return lerp(lerp(lerp(h(X,Y,Z),h(X+1,Y,Z),u),lerp(h(X,Y+1,Z),h(X+1,Y+1,Z),u),v),lerp(lerp(h(X,Y,Z+1),h(X+1,Y,Z+1),u),lerp(h(X,Y+1,Z+1),h(X+1,Y+1,Z+1),u),v),w);};
  return(x,y,z,oct)=>{let s=0,a=.5,fr=1;for(let o=0;o<oct;o++){s+=a*n3(x*fr,y*fr,z*fr);a*=.5;fr*=2;}return s;};}
 function sphereTex(w,h,pix){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),id=x.createImageData(w,h);for(let j=0;j<h;j++){const lat=(.5-j/h)*Math.PI;for(let i=0;i<w;i++){const lon=i/w*Math.PI*2,vx=Math.cos(lat)*Math.cos(lon),vy=Math.sin(lat),vz=Math.cos(lat)*Math.sin(lon),k=(j*w+i)*4,o=pix(vx,vy,vz,lat);id.data[k]=o[0];id.data[k+1]=o[1];id.data[k+2]=o[2];id.data[k+3]=o[3]??255;}}x.putImageData(id,0,0);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;}
 function makeEarthTex(){const N=vnoise();earthT=sphereTex(512,256,(x,y,z,lat)=>{const n=N(x*2.2+5,y*2.2+5,z*2.2+5,5),ice=Math.abs(lat)>1.22-N(x*6,y*6,z*6,2)*.25;if(ice)return[236,242,250];
   if(n<.5){const d=Math.max(0,Math.min(1,(.5-n)*5));return[Math.round(14+30*(1-d)),Math.round(52+70*(1-d)),Math.round(120+60*(1-d))];}const hgt=(n-.5)*4,dry=Math.abs(Math.abs(lat)-.4)<.18&&N(x*4+9,y*4,z*4,3)>.5;
   if(dry)return[Math.round(190+30*hgt),Math.round(160+20*hgt),Math.round(100+10*hgt)];return hgt>.55?[120,110,95]:[Math.round(40+50*hgt),Math.round(110+40*hgt),Math.round(45+20*hgt)];});
  const N2=vnoise();cloudT=sphereTex(512,256,(x,y,z)=>{const n=N2(x*3.5+11,y*3.5,z*3.5,5),a=Math.max(0,Math.min(1,(n-.52)*4.5));return[255,255,255,Math.round(a*235)];});
  const N3=vnoise();moonT=sphereTex(512,256,(x,y,z)=>{let v=150+70*(N3(x*3,y*3,z*3,5)-.5);const m=N3(x*1.4+3,y*1.4,z*1.4,3);if(m>.6)v-=45;for(let k=0;k<5;k++){const cr=N3(x*(8+k*4),y*(8+k*4),z*(8+k*4),1);if(cr>.82)v-=40*(cr-.82)/.18;else if(cr>.76)v+=18;}v=Math.max(30,Math.min(235,v));return[v,v,Math.round(v*.98)];});}
 function advBodies(A,dt){const want=new Set();for(const b of A.bodies||[]){want.add(b.kind);let g=advMeshes.get(b.kind);if(!g){if(!earthT)makeEarthTex();g=new T.Group();
   if(b.kind==='earth'){g.add(new T.Mesh(new T.SphereGeometry(1,64,48),new T.MeshStandardMaterial({map:earthT,roughness:.85,metalness:0})));const cl=new T.Mesh(new T.SphereGeometry(1.012,64,48),new T.MeshStandardMaterial({map:cloudT,transparent:true,depthWrite:false,roughness:1}));cl.userData.clouds=true;g.add(cl);
    const at=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0x5fa8ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.55}));at.scale.set(2.7,2.7,1);g.add(at);}
   else g.add(new T.Mesh(new T.SphereGeometry(1,48,32),new T.MeshStandardMaterial({map:moonT,roughness:1,metalness:0})));root.add(g);advMeshes.set(b.kind,g);}
  g.position.set(...M(b.pos));g.scale.setScalar(b.R);g.rotation.y+=dt*(b.kind==='earth'?.02:.005);g.children.forEach(ch=>{if(ch.userData.clouds)ch.rotation.y+=dt*.006;});g.visible=true;}
  for(const[k,g]of advMeshes)if(!want.has(k))g.visible=false;}
 function playerObj(A){const g=new T.Group();const m=A.playerModel(),L=A.look||null,pc=(L&&L.paint&&L.paint.main)||'#ffd84a';g.add(new T.Mesh(geoOf(m),metal(pc,{metal:.6})));detail(g,m,pc);shipLook(g,m,L);g.userData.lk=JSON.stringify(L);const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0x3fe0ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(0,0,-98);e.scale.set(90,90,1);e.userData.engine=true;g.add(e);g.userData.model=m;root.add(g);return g;}
 // ---------------- particles ----------------
 const seenBoom=new WeakSet();
 function burst(pos,n,spd,life,col,sys=fire){n=Math.max(2,Math.round(n*pmul));for(let i=0;i<n;i++){if(sys.list.length>=sys.n)sys.list.shift();const u=Math.random()*2-1,a=Math.random()*7,s=Math.sqrt(1-u*u),v=spd*(.3+Math.random()*.7);sys.list.push({p:[...pos],v:[s*Math.cos(a)*v,u*v,s*Math.sin(a)*v],t:0,life:life*(.6+Math.random()*.6),c:col});}}
 function stepParticles(sys,dt,fade){const P=sys.p.geometry.attributes.position,C=sys.p.geometry.attributes.color;let k=0;sys.list=sys.list.filter(q=>(q.t+=dt)<q.life);
  for(const q of sys.list){q.p[0]+=q.v[0]*dt;q.p[1]+=q.v[1]*dt;q.p[2]+=q.v[2]*dt;q.v=q.v.map(x=>x*Math.pow(.35,dt));const m=M(q.p),f=fade?Math.max(0,1-q.t/q.life):1;P.setXYZ(k,m[0],m[1],m[2]);C.setXYZ(k,q.c[0]*f,q.c[1]*f,q.c[2]*f);k++;}
  P.needsUpdate=true;C.needsUpdate=true;sys.p.geometry.setDrawRange(0,k);}
 // ---------------- per-frame ----------------
 let lastT=performance.now(),trailT=0;
 function render(ctx,A){if(!ready())return false;if(A.full===undefined&&pit)pit.visible=false;
  if(A.fog){if(!scene.fog)scene.fog=new T.FogExp2(0x4a2f86,.00030);scene.background.set(0x3a2670);if(nebula)nebula.visible=false;if(bloom)bloom.enabled=false;}else if(scene.fog){scene.fog=null;scene.background.set(0x000004);if(nebula)nebula.visible=true;if(bloom)bloom.enabled=true;}const t0=performance.now(),dt=Math.min(.1,(t0-lastT)/1000);lastT=t0;
  const W=A.W,VH=A.VH,CXa=A.CX??W/2,CYa=A.CY??VH/2,Hv=A.full&&A.H?A.H:VH,k=Math.max(1,Math.min(ctx.canvas.width/W,1920/W)),pr=quality.pr*k,wd=A.wide||null;let w,h,ppx,ppy,foc;
  if(wd){const dpr=Math.min(window.devicePixelRatio||1,2)*quality.pr,sc=Math.min(dpr,2400/wd.w);w=Math.round(wd.w*sc);h=Math.round(wd.h*sc);ppx=(wd.ox+CXa*wd.s)*sc;ppy=(wd.oy+CYa*wd.s)*sc;foc=A.FOC*wd.s*sc;}
  else{w=Math.round(W*pr);h=Math.round(Hv*pr);ppx=CXa*pr;ppy=CYa*pr;foc=A.FOC*pr;}
  if(gl.width!==w||gl.height!==h){R.setPixelRatio(1);R.setSize(w,h,false);comp.setSize(w,h);bloom.resolution.set(w,h);}R.setScissorTest(false);R.setViewport(0,0,w,h);
  toGame=wd?((x,y)=>[(((x+1)/2*wd.w)-wd.ox)/wd.s,(((1-y)/2*wd.h)-wd.oy)/wd.s]):((x,y)=>[(x+1)/2*W,(1-y)/2*Hv]);
  const sys=A.here();if(lastSys!==A.planet){lastSys=A.planet;for(const[o,g]of objs){root.remove(g);}objs.clear();buildBodies(A);}
  // camera (mirrored into three's handedness)
  const C=A.CAM,r=M(C.r),u=M(C.u),f=M(C.f).map(x=>-x),p=M(C.pos);cam.matrix.set(r[0],u[0],f[0],p[0],r[1],u[1],f[1],p[1],r[2],u[2],f[2],p[2],0,0,0,1);cam.matrixWorld.copy(cam.matrix);cam.matrixWorldInverse.copy(cam.matrix).invert();
  {const n=cam.near;cam.projectionMatrix.makePerspective(-ppx/foc*n,(w-ppx)/foc*n,ppy/foc*n,-(h-ppy)/foc*n,n,cam.far);cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();}
  starField.position.set(...p);if(nebula)nebula.position.set(...p);
  if(cityMats.length&&A.suns[0]){const sd=new T.Vector3(...M(A.suns[0].pos)).sub(new T.Vector3(...M(A.planet?A.planet.pos:[0,0,0]))).normalize().transformDirection(cam.matrixWorldInverse);for(const m of cityMats)if(m.userData.sh)m.userData.sh.uniforms.sunDirV.value.copy(sd);}
  // bodies follow their game positions and spin
  for(const b of bodies){const s=b.userData.src;if(!s)continue;if(s.o)setBasis(b,s.pos,s.o);else{b.position.set(...M(s.pos));b.matrixAutoUpdate=true;}if(b.userData.bh)b.children.forEach(x=>{if(x.userData.disk)x.rotation.z+=dt*.5;});
   b.children.forEach(x=>{if(x.userData.clouds)x.rotation.y+=dt*.01;});}
  sunLights.forEach(L=>{const s=L.userData.src;L.position.set(...M(s.pos));L.target.position.set(...p);});
  // ships and station
  advBodies(A,dt);const live=new Set(),list=[...A.ships.filter(s=>!s.dead),...(A.station?[A.station]:[])];
  for(const sh of list){live.add(sh);let g=objs.get(sh);if(!g){g=shipObj(sh,A);objs.set(sh,g);}setBasis(g,sh.pos,sh.o);
   g.children.forEach(x=>{if(x.userData.strobe!==undefined)x.visible=((A.clock+x.userData.strobe)%1.4)<.08;if(x.userData.bubble){const k=sh.hitFx!==undefined?1-(A.clock-sh.hitFx)/.35:0;x.visible=k>0;if(k>0)x.material.opacity=.35*k;}if(x.userData.blink!==undefined)x.visible=Math.floor(A.clock*2+(x.userData.blink>0?1:0))%2===0;if(x.userData.engine){const s2=40+Math.min(1,(sh.speed||0)/300)*60;x.scale.set(s2,s2,1);x.visible=!(sh.dmg>.7&&Math.random()<.35);}});
   if(sh.dmg>.35&&Math.random()<dt*6)burst(sh.pos,3,120,.4,[1,.8,.3]);}
  // the player's own ship (outside camera)
  if(A.camMode==='ext'){let g=objs.get('me');if(!g||g.userData.model!==A.playerModel()||g.userData.lk!==JSON.stringify(A.look||null)){if(g)root.remove(g);g=playerObj(A);objs.set('me',g);}live.add('me');setBasis(g,A.P.pos,A.P.o);g.children.forEach(x=>{if(x.userData.engine){const s2=50+A.P.throttle*90;x.scale.set(s2,s2,1);}});}
  for(const[o,g]of objs)if(!live.has(o)){root.remove(g);objs.delete(o);}
  // explosions, sparks and engine trails
  for(const b of A.booms){if(seenBoom.has(b))continue;seenBoom.add(b);if(b.spark)burst(b.pos,8,260,.35,[1,.9,.5]);else{const L=boomLights.slice().sort((a,b)=>a.intensity-b.intensity)[0];if(L){L.position.set(...M(b.pos));L.intensity=9;L.userData.t=0;}burst(b.pos,160,560,1.3,[1.6,.9,.3]);burst(b.pos,70,260,1.6,[1.8,1.6,1.1]);burst(b.pos,30,90,2.6,[.45,.45,.5],smoke);}}
  trailT+=dt;if(trailT>.04){trailT=0;for(const sh of A.ships)if(!sh.dead&&sh.T&&!['rock','cargo','mine','beacon'].includes(sh.T.role)&&(sh.speed||0)>40){const e=A.toWorld(sh.o,[0,0,(sh.rearZ||-30)-10]);fire.list.push({p:[sh.pos[0]+e[0],sh.pos[1]+e[1],sh.pos[2]+e[2]],v:[0,0,0],t:0,life:.5,c:sh.type==='missile'?[1,.5,.1]:[.25,.7,1]});}
   if(A.camMode==='ext'&&A.P.throttle>.05){const e=A.toWorld(A.P.o,[0,0,-104]);fire.list.push({p:[A.P.pos[0]+e[0],A.P.pos[1]+e[1],A.P.pos[2]+e[2]],v:[0,0,0],t:0,life:.6,c:[.3,.75,1]});}}
  for(const L of boomLights){if(L.intensity>0){L.userData.t+=dt;L.intensity=Math.max(0,9*(1-L.userData.t/.9));}}
  stepParticles(fire,dt,true);
  // damage smoke comes from Starlane's own smoke list
  {const P2=smoke.p.geometry.attributes.position,C2=smoke.p.geometry.attributes.color;stepParticles(smoke,dt,true);let k2=smoke.p.geometry.drawRange.count;for(const sm of A.smokes){if(k2>=smoke.n)break;const m=M(sm.pos),f2=.55*(1-sm.t/1.6);P2.setXYZ(k2,m[0],m[1],m[2]);C2.setXYZ(k2,f2,f2,f2*1.05);k2++;}smoke.p.geometry.setDrawRange(0,k2);P2.needsUpdate=true;C2.needsUpdate=true;}
  // space dust
  {const D=dustPts.geometry.attributes.position;let n=0;for(const d of A.dust){if(n>=400)break;const m=M(d);D.setXYZ(n++,m[0],m[1],m[2]);}dustPts.geometry.setDrawRange(0,n);D.needsUpdate=true;}
  bloom.enabled=quality.bloom&&!(A&&A.fog);comp.render();if(wd){if(wd.cv.width!==w||wd.cv.height!==h){wd.cv.width=w;wd.cv.height=h;}wd.ctx.drawImage(gl,0,0);ctx.clearRect(0,0,W,Hv);}else ctx.drawImage(gl,0,0,W,Hv);flare(ctx,A,CXa,CYa);
  // keep it smooth: drop the glow, then the resolution, if frames get slow (and raise them again when there is room)
  const ms=performance.now()-t0;if(quality.auto===false){slow=fast=0;}else if(ms>22){slow++;fast=0;}else if(ms<9){fast++;slow=0;}
  if(slow>40){slow=0;if(quality.views)quality.views=false;else if(quality.bloom)quality.bloom=false;else quality.pr=Math.max(.6,quality.pr-.15);}if(fast>240){fast=0;if(quality.pr<1)quality.pr=Math.min(1,quality.pr+.15);else if(!quality.bloom)quality.bloom=true;else if(!quality.views)quality.views=true;}
  return true;}
 // lens flare from the brightest sun (hidden when a planet is in the way)
 let toGame=(x,y)=>[0,0];
 function flare(ctx,A,CXg,CYg){const sn=A.suns[0];if(!sn)return;const v=new T.Vector3(...M(sn.pos)).project(cam);if(v.z>1||Math.abs(v.x)>1.2||Math.abs(v.y)>1.2)return;
  if(A.planet){const C0=A.CAM.pos,d=[sn.pos[0]-C0[0],sn.pos[1]-C0[1],sn.pos[2]-C0[2]],L=Math.hypot(...d),u=d.map(x=>x/L),pc=[A.planet.pos[0]-C0[0],A.planet.pos[1]-C0[1],A.planet.pos[2]-C0[2]],t=pc[0]*u[0]+pc[1]*u[1]+pc[2]*u[2];if(t>0&&t<L){const q=[pc[0]-u[0]*t,pc[1]-u[1]*t,pc[2]-u[2]*t];if(Math.hypot(...q)<A.planet.R)return;}}
  const[sx,sy]=toGame(v.x,v.y),cx=CXg,cy=CYg,dx=cx-sx,dy=cy-sy,str=Math.max(0,1-Math.hypot(v.x,v.y)*.7);if(str<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const[k,r0,col]of[[.4,24,'255,200,120'],[.7,12,'120,200,255'],[1.1,36,'180,120,255'],[1.5,9,'255,255,200'],[1.9,60,'90,160,255']]){const x=sx+dx*k,y=sy+dy*k,g=ctx.createRadialGradient(x,y,0,x,y,r0);g.addColorStop(0,`rgba(${col},${.22*str})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r0,0,7);ctx.fill();}
  const g=ctx.createLinearGradient(sx-140,sy,sx+140,sy);g.addColorStop(0,'rgba(255,240,210,0)');g.addColorStop(.5,`rgba(255,240,210,${.25*str})`);g.addColorStop(1,'rgba(255,240,210,0)');ctx.fillStyle=g;ctx.fillRect(sx-140,sy-1.5,280,3);ctx.restore();}
 // ---------------- 3D cockpit (Modern): an enclosed cabin carried with the ship ----------------
 // Built in ship-local units (x right, y up, z forward). The console's top edge sits where the old 2D dashboard began,
 // so the forward view keeps its familiar framing; everything else is real geometry that looks right from any angle.
 let scrMeshes=[],lastHitSeen=-1,pit=null,pitLights=[],pitKey='',dashTex=null,sway=[0,0,0],lastSpeed=0,pitLamp=null,pitGlow=[];
 function beam(a,b,w){const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d)||1,u=d.map(x=>x/L);let p=Math.abs(u[1])<.9?[0,1,0]:[1,0,0];const c1=[u[1]*p[2]-u[2]*p[1],u[2]*p[0]-u[0]*p[2],u[0]*p[1]-u[1]*p[0]],l1=Math.hypot(...c1),n1=c1.map(x=>x/l1*w),n2=[u[1]*n1[2]-u[2]*n1[1],u[2]*n1[0]-u[0]*n1[2],u[0]*n1[1]-u[1]*n1[0]];
  const pts=[];for(const e of[a,b])for(const s1 of[-1,1])for(const s2 of[-1,1])pts.push([e[0]+n1[0]*s1+n2[0]*s2,e[1]+n1[1]*s1+n2[1]*s2,e[2]+n1[2]*s1+n2[2]*s2]);return geoOf(SL.hull(pts));}
 function quadGeo(p,uv){const g=new T.BufferGeometry(),P=[p[0],p[1],p[2],p[0],p[2],p[3]],U=[uv[0],uv[1],uv[2],uv[0],uv[2],uv[3]];g.setAttribute('position',new T.Float32BufferAttribute(P.flat(),3));g.setAttribute('uv',new T.Float32BufferAttribute(U.flat(),2));g.computeVertexNormals();return g;}
 function wallTex(){return texCache.wall||(texCache.wall=(()=>{const t=cv(256,256,(c,w,h)=>{c.fillStyle='#1c2233';c.fillRect(0,0,w,h);const r=rnd(77);for(let i=0;i<60;i++){c.fillStyle=`rgba(255,255,255,${r()*.035})`;c.fillRect(r()*w,r()*h,r()*80,r()*80);}c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=2;for(const[x,y,ww,hh]of[[8,8,112,70],[128,8,120,70],[8,86,240,74],[8,168,76,80],[92,168,156,80]]){c.strokeRect(x,y,ww,hh);}
   c.fillStyle='rgba(120,140,190,.25)';for(let i=0;i<14;i++)c.fillRect(14+((i*53)%228),20+((i*37)%220),3,3);});t.wrapS=t.wrapT=T.RepeatWrapping;return t;})());}
 // ---------------- console wings (widescreen): a screen and a bank of real switches on each side ----------------
 let deckObjs=null,wingTex=[];
 function buildDeck(A,g,deck,onC){deckObjs={};wingTex=[];const base=new T.MeshStandardMaterial({color:0x1a2030,metalness:.7,roughness:.4,side:T.DoubleSide}),chrome=new T.MeshStandardMaterial({color:0xc8d0e0,metalness:.95,roughness:.18,side:T.DoubleSide});
  deck.wings.forEach((wg,i)=>{const[x0,x1]=wg.x,tex=new T.CanvasTexture(wg.cv);tex.encoding=T.sRGBEncoding;tex.anisotropy=4;wingTex.push(tex);const P=[onC(x0,596),onC(x1,596),onC(x1,412),onC(x0,412)];
   {const wm=new T.Mesh(quadGeo(P,[[0,0],[1,0],[1,1],[0,1]]),new T.MeshBasicMaterial({map:tex,toneMapped:false,side:T.DoubleSide}));g.add(wm);scrMeshes.push(wm);}
   const P2=[onC(x0-5,600,52.6),onC(x1+5,600,52.6),onC(x1+5,407,52.6),onC(x0-5,407,52.6)];g.add(new T.Mesh(quadGeo(P2,[[0,0],[1,0],[1,1],[0,1]]),new T.MeshStandardMaterial({color:0x0a0e18,metalness:.6,roughness:.3,side:T.DoubleSide})));});
  for(const s of (deck.drawn?[]:deck.sws)){const cx=s.x+15,cy=s.y+24,P=onC(cx,cy),Px=onC(cx+8,cy),Py=onC(cx,cy-8);let tx=Px.map((v,k)=>v-P[k]),ty=Py.map((v,k)=>v-P[k]);const nl=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l);};tx=nl(tx);ty=nl(ty);
   let n=nl([tx[1]*ty[2]-tx[2]*ty[1],tx[2]*ty[0]-tx[0]*ty[2],tx[0]*ty[1]-tx[1]*ty[0]]);if(n[0]*-P[0]+n[1]*-P[1]+n[2]*-P[2]<0){n=n.map(x=>-x);tx=tx.map(x=>-x);}
   const piv=new T.Group();piv.matrixAutoUpdate=false;piv.matrix.makeBasis(new T.Vector3(...tx),new T.Vector3(...ty),new T.Vector3(...n));piv.matrix.setPosition(...P.map(c=>c*.993));g.add(piv);
   const sc=Math.hypot(...P)/80*.62;const plate=new T.Mesh(new T.BoxGeometry(5.4*sc,4.2*sc,.8*sc),base);plate.position.z=.4*sc;piv.add(plate);let o={kind:s.kind,sc};
   if(s.kind==='knob'){const kn=new T.Group();kn.position.z=.8*sc;piv.add(kn);const cyl=new T.Mesh(new T.CylinderGeometry(1.9*sc,2.1*sc,1.6*sc,20),base);cyl.rotation.x=Math.PI/2;cyl.position.z=.8*sc;kn.add(cyl);
    const ptr=new T.Mesh(new T.BoxGeometry(.45*sc,1.7*sc,.3*sc),new T.MeshBasicMaterial({color:0xffffff}));ptr.position.set(0,.85*sc,1.7*sc);kn.add(ptr);o.knob=kn;o.cap=ptr;}
   else{const pv=new T.Group();pv.position.z=.8*sc;piv.add(pv);const lev=new T.Mesh(new T.CylinderGeometry(.3*sc,.42*sc,3.4*sc,10),chrome);lev.rotation.x=Math.PI/2;lev.position.z=1.7*sc;pv.add(lev);
    const cap=new T.Mesh(new T.SphereGeometry(.85*sc,12,10),new T.MeshBasicMaterial({color:s.kind==='guard'?0xff2d55:0x2a3044}));cap.position.z=3.5*sc;pv.add(cap);o.lever=pv;o.cap=cap;
    if(s.kind==='guard'){const cover=new T.Mesh(new T.BoxGeometry(3.2*sc,3.2*sc,.4*sc),new T.MeshStandardMaterial({color:0xff2d55,transparent:true,opacity:.35,side:T.DoubleSide}));cover.position.set(0,-1.2*sc,3.4*sc);cover.rotation.x=-.9;pv.parent.add(cover);o.cover=cover;}}
   deckObjs[s.id]=o;}}
 function updDeck(deck,clock){if(!deckObjs)return;wingTex.forEach(t=>t.needsUpdate=true);for(const s of deck.sws){const o=deckObjs[s.id];if(!o)continue;const lit=s.col?new T.Color(s.col):null;
   if(o.knob){o.knob.rotation.z=-(s.pos||0)*Math.PI/2+Math.PI*.75;o.cap.material.color.set(s.hover?0xffe45e:lit||0xffffff);continue;}
   const up=s.kind==='toggle'?!!s.on:(clock-(s.flash||-9))<.28;const want=up?-.55:.5;o.lever.rotation.x+=(want-o.lever.rotation.x)*.45;
   if(s.kind!=='guard')o.cap.material.color.set(s.hover?0xffe45e:lit||0x2a3044);else o.cap.material.color.set(s.hover?0xffe45e:0xff2d55);if(o.cover)o.cover.rotation.x=s.hover?-2.2:-.9;}}
 // ---------------- a lived-in cabin: instrument housings, a proper stick, clutter and personal items ----------------
 const cabTex={};
 function cabCanvas(key,w,h,draw){if(cabTex[key])return cabTex[key];const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return(cabTex[key]=t);}
 const mat=(col,o={})=>new T.MeshStandardMaterial({color:col,metalness:o.metal??.15,roughness:o.rough??.75,side:T.DoubleSide,emissive:o.em?new T.Color(o.em):new T.Color(0),emissiveIntensity:o.ei??1,map:o.map||null,transparent:!!o.op,opacity:o.op||1});
 const mesh=(g,geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const me=new T.Mesh(geo,m);me.position.set(x,y,z);me.rotation.set(rx,ry,rz);g.add(me);return me;};
 function cabinExtras(g,A,onS,Zs){const cab=A.cab||{clutter:true,items:[]},has=id=>cab.items.includes(id),dark=mat(0x1b2030,{metal:.6,rough:.4}),trim=mat(0x5d6888,{metal:.85,rough:.25});
  // depth for the instrument screens: frames that stand off the console and glare hoods above them
  for(const[x0,x1,y0,y1]of[[22,252,414,592],[262,538,410,596],[548,778,414,592]]){const c=[onS(x0-8,y0-7,Zs+1.5),onS(x1+8,y0-7,Zs+1.5),onS(x1+8,y1+7,Zs+1.5),onS(x0-8,y1+7,Zs+1.5)];for(let k=0;k<4;k++){g.add(new T.Mesh(beam(c[k],c[(k+1)%4],1.1),trim));}
   const back=[onS(x0-8,y0-7,Zs+5),onS(x1+8,y0-7,Zs+5)];g.add(new T.Mesh(geoOf(SL.hull([c[0],c[1],back[0],back[1],[c[0][0],c[0][1]+1.2,c[0][2]-3],[c[1][0],c[1][1]+1.2,c[1][2]-3]])),dark));
   for(const p of[[x0-4,y0-3],[x1+4,y0-3],[x1+4,y1+3],[x0-4,y1+3]]){const q=onS(p[0],p[1],Zs-.6);mesh(g,new T.SphereGeometry(.45,6,4),trim,q[0],q[1],q[2]);}}
  // a floor under your feet, with a tread plate
  {const fl=cabCanvas('floor',128,128,(c,w,h)=>{c.fillStyle='#1d2130';c.fillRect(0,0,w,h);c.fillStyle='#2b3044';for(let y=0;y<h;y+=16)for(let x=(y/16)%2?8:0;x<w;x+=16){c.fillRect(x+3,y+6,9,3);}});fl.wrapS=fl.wrapT=T.RepeatWrapping;fl.repeat.set(6,4);mesh(g,new T.PlaneGeometry(360,200),mat(0xffffff,{map:fl,rough:.85,metal:.4}),0,-150,0,-Math.PI/2,0,0);}
  // a proper flight stick: rubber boot, shaft, grip with buttons and a trigger
  mesh(g,new T.CylinderGeometry(10,13,6,18),dark,18,-104,30);mesh(g,new T.ConeGeometry(8,10,16,1,true),mat(0x101218,{rough:.95}),18,-96,30);mesh(g,new T.CylinderGeometry(1.4,1.8,24,10),trim,18,-80,32,.12,0,0);
  {mesh(g,new T.CylinderGeometry(3,2.4,11,12),mat(0x23262e,{rough:.85}),18,-64,34,.25,0,0);mesh(g,new T.SphereGeometry(1.1,8,6),new T.MeshBasicMaterial({color:0xff2d55}),18,-58,35.5);mesh(g,new T.SphereGeometry(.9,8,6),new T.MeshBasicMaterial({color:0x3fe0ff}),20.5,-59,34);mesh(g,new T.BoxGeometry(1.2,3,1.4),mat(0x888c96,{metal:.8}),18,-63,37.6,.3,0,0);}
  if(cab.clutter){
   // coffee mug (with a handle) on the left console, a tablet and a wrench on the right, cables, tape, a snack wrapper, sticky notes
   mesh(g,new T.CylinderGeometry(3.2,2.8,7,16),mat(0xe8e2d4),-150,-52.5,40);mesh(g,new T.TorusGeometry(2,.6,6,12,Math.PI),mat(0xe8e2d4),-153.6,-52.5,40,0,0,Math.PI/2);mesh(g,new T.CircleGeometry(2.9,14),mat(0x3a2412),-150,-49,40,-Math.PI/2,0,0);
   {const tab=cabCanvas('tablet',128,96,(c,w,h)=>{c.fillStyle='#0b1a2c';c.fillRect(0,0,w,h);c.fillStyle='#3fe0ff';c.font='bold 12px sans-serif';c.fillText('CARGO LIST',8,18);c.fillStyle='#9fd8ff';c.font='10px sans-serif';['Food x9','Gems x3','Tea?? (buy!)','Fuel: low'].forEach((t,i)=>c.fillText(t,8,36+i*14));});mesh(g,new T.BoxGeometry(16,.9,11),mat(0x15171d,{metal:.4,rough:.3}),140,-55.4,22,0,.35,0);mesh(g,new T.PlaneGeometry(14,9.5),new T.MeshBasicMaterial({map:tab,side:T.DoubleSide}),140,-54.9,22,-Math.PI/2,0,-.35);}
   mesh(g,new T.BoxGeometry(2,1.4,18),mat(0x9aa1ad,{metal:.9,rough:.3}),160,-55.8,60,0,.6,0);mesh(g,new T.TorusGeometry(2.2,.7,6,10),mat(0x9aa1ad,{metal:.9,rough:.3}),165,-55.8,69,Math.PI/2,0,0);
   mesh(g,new T.TorusGeometry(3.4,1.6,8,16),mat(0x8d949e,{rough:.6}),128,-55.4,-8,Math.PI/2,0,0);
   {const w=mesh(g,new T.IcosahedronGeometry(3,0),mat(0xffb020,{rough:.4,metal:.3}),-128,-54,4);w.scale.set(1.4,.5,1);}
   const curve=new T.CatmullRomCurve3([new T.Vector3(-168,-60,88),new T.Vector3(-150,-75,70),new T.Vector3(-110,-92,74),new T.Vector3(-70,-108,80),new T.Vector3(-40,-118,70)]);mesh(g,new T.TubeGeometry(curve,30,.8,6,false),mat(0x222428),0,0,0);
   const curve2=new T.CatmullRomCurve3([new T.Vector3(168,-58,80),new T.Vector3(150,-80,85),new T.Vector3(120,-105,78)]);mesh(g,new T.TubeGeometry(curve2,20,.7,6,false),mat(0xb33a2a),0,0,0);
   for(const[sx,sy,col,rot]of[[240,420,0xffe45e,.12],[30,580,0xff7eb6,-.18],[770,424,0x7cff9a,.2]]){const q=onS(sx,sy,Zs-.8);mesh(g,new T.PlaneGeometry(4.2,4.2),new T.MeshBasicMaterial({color:col,side:T.DoubleSide,toneMapped:false}),q[0],q[1],q[2],0,0,rot);}}
  // personal items bought at the shipyard
  if(has('p_dice')){const dt=cabCanvas('dice',64,64,(c,w,h)=>{c.fillStyle='#f4f1ea';c.fillRect(0,0,w,h);c.fillStyle='#d6234a';for(const[x,y]of[[16,16],[48,48],[32,32],[16,48],[48,16]])c.beginPath(),c.arc(x,y,6,0,7),c.fill();});
   for(const[dx,dy]of[[-3,0],[3,-4]]){mesh(g,new T.CylinderGeometry(.15,.15,22,4),mat(0xdddddd),-62+dx,49-dy,104);const d=mesh(g,new T.BoxGeometry(5,5,5),mat(0xffffff,{map:dt,rough:.95}),-62+dx,36-dy,104,.3,.5,.2);d.userData.swing=dx;}}
  if(has('p_bobble')){mesh(g,new T.CylinderGeometry(2.2,2.6,2,12),dark,-62,-45,92);mesh(g,new T.CylinderGeometry(1.4,1.8,6,10),mat(0x3cff6a),-62,-41,92);const head=mesh(g,new T.SphereGeometry(3.6,14,10),mat(0x5dff8a,{rough:.5}),-62,-35,92);head.userData.bob=true;
   for(const sx of[-1,1])mesh(g,new T.SphereGeometry(1,8,6),mat(0x111111),-62+sx*1.4,-34.5,95.2);for(const sx of[-1,1])mesh(g,new T.CylinderGeometry(.2,.2,3,4),mat(0x5dff8a),-62+sx*1.8,-31,92,0,0,sx*.5);}
  if(has('p_plant')){mesh(g,new T.CylinderGeometry(3.2,2.4,5,12),mat(0xb5582c,{rough:.9}),70,-44.5,92);for(let k=0;k<7;k++){const a=k/7*Math.PI*2;mesh(g,new T.ConeGeometry(1.1,9,5),mat(0x2f9e44,{rough:.8}),70+Math.cos(a)*1.4,-38,92+Math.sin(a)*1.4,Math.sin(a)*.5,0,-Math.cos(a)*.5);}}
  if(has('p_photo')){const ph=cabCanvas('photo',96,72,(c,w,h)=>{const g2=c.createLinearGradient(0,0,0,h);g2.addColorStop(0,'#7ec8ff');g2.addColorStop(1,'#cfe9ff');c.fillStyle=g2;c.fillRect(0,0,w,h);c.fillStyle='#3a9a44';c.fillRect(0,h*.7,w,h*.3);c.fillStyle='#ffd23a';c.beginPath();c.arc(w*.8,h*.25,8,0,7);c.fill();
    for(const[x,s,col]of[[30,1,'#c0392b'],[50,.8,'#2e86de'],[66,.65,'#8e44ad']]){c.fillStyle=col;c.fillRect(x-5*s,h*.7-22*s,10*s,22*s);c.fillStyle='#f2c69b';c.beginPath();c.arc(x,h*.7-27*s,6*s,0,7);c.fill();}});
   mesh(g,new T.BoxGeometry(11,8.5,1),mat(0x6b4a2b,{rough:.7}),-25,-41.5,93,-.25,0,0);mesh(g,new T.PlaneGeometry(9,6.5),new T.MeshBasicMaterial({map:ph,side:T.DoubleSide}),-25,-41.4,92.4,-.25,Math.PI,0);}
  if(has('p_scarf'))for(let k=0;k<8;k++){const st=k%2?0xffffff:0xd01c2c;mesh(g,new T.BoxGeometry(7,1.6,6.2),mat(st,{rough:.95}),-171+Math.sin(k*.9)*1.5,-46.5-Math.max(0,k-5)*3,64-k*6.2,0,0,k>5?.5:0);}
  if(has('p_trophy')){const gold=mat(0xffc93c,{metal:1,rough:.2});mesh(g,new T.CylinderGeometry(2.6,2.6,1.6,12),dark,150,-55.2,0);mesh(g,new T.CylinderGeometry(.8,.8,4,8),gold,150,-52.5,0);mesh(g,new T.CylinderGeometry(3,1.2,5,14,1,true),gold,150,-48,0);for(const sx of[-1,1])mesh(g,new T.TorusGeometry(1.4,.35,6,10,Math.PI),gold,150+sx*3,-48,0,0,0,sx>0?-Math.PI/2:Math.PI/2);}
  if(has('p_rocket')){const wht=mat(0xf3f3f3,{rough:.5});mesh(g,new T.CylinderGeometry(1.6,1.6,10,12),wht,128,-51,52);mesh(g,new T.ConeGeometry(1.6,4,12),mat(0xd01c2c),128,-44,52);for(let k=0;k<3;k++){const a=k/3*Math.PI*2;mesh(g,new T.BoxGeometry(.3,3,2.4),mat(0xd01c2c),128+Math.cos(a)*1.8,-55,52+Math.sin(a)*1.8,0,-a,0);}}
  if(has('p_cat')){const fur=mat(0xf0a050,{rough:1});mesh(g,new T.SphereGeometry(4,12,10),fur,-140,-52,0).scale.set(1.2,.85,1);mesh(g,new T.SphereGeometry(2.8,12,10),fur,-140,-46.5,3.5);for(const sx of[-1,1])mesh(g,new T.ConeGeometry(1,2,4),fur,-140+sx*1.6,-43.6,3.5);for(const sx of[-1,1])mesh(g,new T.SphereGeometry(.4,6,4),mat(0x111111),-140+sx*1,-46.2,6);}
  if(has('p_comic')){const cv2=cabCanvas('comic',96,128,(c,w,h)=>{c.fillStyle='#ffe45e';c.fillRect(0,0,w,h);c.fillStyle='#d01c2c';c.fillRect(0,0,w,26);c.fillStyle='#fff';c.font='bold 15px sans-serif';c.fillText('SPACE KID',6,19);c.fillStyle='#2e86de';c.beginPath();c.arc(w/2,h*.6,28,0,7);c.fill();c.fillStyle='#fff';c.font='bold 22px sans-serif';c.fillText('ZAP!',24,h*.64);});
   mesh(g,new T.BoxGeometry(10,.6,13),mat(0xffffff),-128,-55.7,60,0,-.4,0);mesh(g,new T.PlaneGeometry(9.6,12.6),new T.MeshBasicMaterial({map:cv2,side:T.DoubleSide}),-128,-55.3,60,-Math.PI/2,0,.4);}
  if(has('p_lights')){const cols=[0xff2d55,0xffe45e,0x3cff6a,0x3fe0ff,0xc77dff];for(let k=0;k<=24;k++){const t=k/24,x=-150+300*t,y=56+Math.pow(Math.abs(t-.5)*2,2)*30,z=117-Math.abs(t-.5)*40;const b=mesh(g,new T.SphereGeometry(.9,6,4),new T.MeshBasicMaterial({color:cols[k%5]}),x,y-1.5,z);b.userData.twinkle=k;}}}
 function cabinTick(clock){if(!pit)return;pit.traverse(o=>{const u=o.userData;if(u.bob){o.rotation.z=Math.sin(clock*3.2)*.18;o.rotation.x=Math.sin(clock*2.1)*.1;}if(u.swing!==undefined){o.rotation.z=.2+Math.sin(clock*1.7+u.swing)*.15;}if(u.twinkle!==undefined)o.visible=((clock*1.3+u.twinkle*.37)%1)>.15;});}
 function buildPit(A,deck){const CX=A.CX,CY=A.CY,F=A.FOC,g=new T.Group(),dark=new T.MeshStandardMaterial({color:0x232a3d,metalness:.55,roughness:.5,side:T.DoubleSide,flatShading:true}),
   frame=new T.MeshStandardMaterial({color:0x3b4562,metalness:.8,roughness:.32,side:T.DoubleSide,flatShading:true}),trim=new T.MeshStandardMaterial({color:0x66749c,metalness:.9,roughness:.22,side:T.DoubleSide,flatShading:true}),
   wall=new T.MeshStandardMaterial({color:0xffffff,map:wallTex(),metalness:.45,roughness:.6,side:T.DoubleSide}),add=(geo,m)=>{const me=new T.Mesh(geo,m);g.add(me);return me;},
   box=(w,h,d,x,y,z,m)=>{const me=new T.Mesh(new T.BoxGeometry(w,h,d),m);me.position.set(x,y,z);g.add(me);return me;},glow=(c)=>new T.MeshBasicMaterial({color:c});
  // the console: its sloping top passes exactly through the line where the old dashboard began (screen y = VH)
  const k=.24,y0=-50,z0=95,onC=(sx,sy)=>{const dx=(sx-CX)/F,dy=-(sy-CY)/F,z=(y0-k*z0)/(dy-k);return[dx*z,dy*z,z];},Zs=52,onS=(sx,sy,z=Zs)=>{const dx=(sx-CX)/F,dy=-(sy-CY)/F;return[dx*z,dy*z,z];};scrMeshes=[];
  add(geoOf(SL.hull([[-270,-50,95],[270,-50,95],[-270,-63.2,40],[270,-63.2,40],[-270,-150,95],[270,-150,95],[-270,-150,40],[270,-150,40]])),dark);
  add(beam([-262,-46.5,97],[262,-46.5,97],3.2),trim);const brow=add(beam([-252,-50.6,93.5],[252,-50.6,93.5],.55),glow(0x3fe0ff));pitLights.push(brow);
  // three live screens set into the console: ship systems, radar, flight
  dashTex=new T.CanvasTexture(document.createElement('canvas'));dashTex.encoding=T.sRGBEncoding;
  const screen=(x0,y0s,x1,y1s,u0,v0,u1,v1)=>{const P=[onS(x0,y1s),onS(x1,y1s),onS(x1,y0s),onS(x0,y0s)];const m=new T.Mesh(quadGeo(P,[[u0,v0],[u1,v0],[u1,v1],[u0,v1]]),new T.MeshBasicMaterial({map:dashTex,toneMapped:false,side:T.DoubleSide}));g.add(m);scrMeshes.push(m);
   const P2=[onS(x0-6,y1s+5,Zs+.6),onS(x1+6,y1s+5,Zs+.6),onS(x1+6,y0s-5,Zs+.6),onS(x0-6,y0s-5,Zs+.6)];g.add(new T.Mesh(quadGeo(P2,[[0,0],[1,0],[1,1],[0,1]]),new T.MeshStandardMaterial({color:0x10151f,metalness:.7,roughness:.3,side:T.DoubleSide})));};
  screen(22,414,252,592,0,0,250/800,1);screen(262,410,538,596,250/800,0,550/800,.82);screen(548,414,778,592,550/800,0,1,1);
  // canopy: pillars, a bow across the top of the view, sills, rails and a spine; glass with the sun's glare
  for(const sx of[-1,1]){const base=[sx*178,-50,95],mid=[sx*128,92,58],top=[sx*70,124,-6];add(beam(base,mid,4.2),frame);add(beam(mid,top,3.6),frame);add(beam([sx*178,-50,95],[sx*178,-50,-92],3.4),frame);
   const sill=add(beam([sx*174,-47,92],[sx*174,-47,-88],.55),glow(0x3fe0ff));pitLights.push(sill);add(beam(top,[sx*62,128,-92],3.2),frame);add(beam(mid,[sx*170,40,-60],2.6),frame);
   // side walls with panel detail, a side console and indicator lights
   const wl=new T.Mesh(new T.PlaneGeometry(190,104),wall);wl.position.set(sx*180,-100,2);wl.rotation.y=Math.PI/2;g.add(wl);
   add(geoOf(SL.hull([[sx*176,-52,80],[sx*120,-56,80],[sx*176,-52,-30],[sx*120,-56,-30],[sx*176,-110,80],[sx*120,-110,80],[sx*176,-110,-30],[sx*120,-110,-30]])),dark);
   for(let i=0;i<5;i++){const b=box(5,1.4,5,sx*(132+i*8),-56.5,40-i*13,glow([0x3cff6a,0xffb020,0x3fe0ff,0xff2d55,0x3fe0ff][i]));pitGlow.push(b);}
   box(14,48,12,sx*34,-6,-40,dark);box(16,4,14,sx*34,20,-40,trim);}
  {const pts=[];for(let i=0;i<=16;i++){const t=i/16,x=-150+300*t,y=58+Math.pow(Math.abs(t-.5)*2,2)*30;pts.push([x,y,118-Math.abs(t-.5)*40]);}for(let i=0;i<16;i++)add(beam(pts[i],pts[i+1],2.4),frame);}
  add(beam([0,124,40],[0,129,-92],3),frame);
  const glass=new T.Mesh(new T.SphereGeometry(300,48,24,0,Math.PI*2,0,Math.PI*.56),new T.MeshStandardMaterial({color:0x9cc4ff,transparent:true,opacity:.045,roughness:.06,metalness:.1,depthWrite:false,side:T.DoubleSide}));glass.position.set(0,-48,0);g.add(glass);
  // rear bulkhead, a flight stick and a throttle
  {const bw=new T.Mesh(new T.PlaneGeometry(356,262),wall);bw.position.set(0,-20,-94);g.add(bw);}
  add(beam([-146,-56,20],[-146,-40,30],1.8),trim);{const k3=new T.Mesh(new T.SphereGeometry(4.5,12,10),glow(0xff8a1c));k3.position.set(-146,-39,31);g.add(k3);pitGlow.push(k3);}
  pitLamp=new T.PointLight(0x3fe0ff,.85,520,1.4);pitLamp.position.set(0,70,10);g.add(pitLamp);
  cabinExtras(g,A,onS,Zs);deckObjs=null;wingTex=[];if(deck&&deck.wings.length)buildDeck(A,g,deck,onS);
  root.add(g);return g;}
 function cockpit(A,on,red,clock,dash,deck){if(!ready())return;if(pit&&pit.parent&&pit.parent!==root)root.add(pit);if(!on){if(pit)pit.visible=false;return;}const key=A.W+'x'+A.VH+'x'+A.CY+'|'+(deck?deck.key:'')+'|'+JSON.stringify(A.cab||{});if(!pit||pitKey!==key){if(pit)root.remove(pit);pitLights=[];pitGlow=[];pit=buildPit(A,deck);pitKey=key;}pit.visible=true;cabinTick(clock);{const me=objs.get('me');if(me)lookTick(me,clock);}if(deck)updDeck(deck,clock);
  if(dash&&dashTex){if(dashTex.image!==dash)dashTex.image=dash;dashTex.needsUpdate=true;}
  // head sway: the cabin shifts a little against acceleration and turns, then settles
  const P=A.P,acc=(P.speed-lastSpeed);lastSpeed=P.speed;const want=[-(P.yaw||0)*2.6+(P.roll||0)*.8,(P.pitch||0)*2.2-Math.max(-2,Math.min(2,acc*.05)),-Math.max(-3,Math.min(3,acc*.12))];for(let i=0;i<3;i++)sway[i]+=(want[i]-sway[i])*.08;
  const o=P.o,pos=[P.pos[0]+o.r[0]*sway[0]+o.u[0]*sway[1]+o.f[0]*sway[2],P.pos[1]+o.r[1]*sway[0]+o.u[1]*sway[1]+o.f[1]*sway[2],P.pos[2]+o.r[2]*sway[0]+o.u[2]*sway[1]+o.f[2]*sway[2]];setBasis(pit,pos,o);
  const pulse=Math.sin(clock*9)>0,col=red?(pulse?0xff2d55:0x5a0a1a):0x3fe0ff;for(const s2 of pitLights)s2.material.color.setHex(col);if(pitLamp){pitLamp.color.setHex(red?0xff2d55:0x3fe0ff);pitLamp.intensity=red?(pulse?1.6:.5):.85;}
  pitGlow.forEach((b,i)=>{b.visible=((clock*(.6+i*.13)+i*.37)%1)>.18;});
  const dmg=P.hull||0,flick=dmg>.3&&Math.random()<dmg*.12,glitch=(clock-(A.lastHitT||-9))<.35;for(const m of scrMeshes)m.material.color.setScalar(glitch?(Math.random()<.5?.25:1.4):flick?.35+Math.random()*.3:1);
  if(pitLamp&&(flick||glitch))pitLamp.intensity*=.3+Math.random()*.5;
  if(A.lastHitT!==undefined&&A.lastHitT!==lastHitSeen&&(clock-A.lastHitT)<.2){lastHitSeen=A.lastHitT;const n=2+Math.round(dmg*4);for(let i=0;i<n;i++){const L=[(Math.random()-.5)*300,-44+Math.random()*6,60+Math.random()*30],w=[P.pos[0]+o.r[0]*L[0]+o.u[0]*L[1]+o.f[0]*L[2],P.pos[1]+o.r[1]*L[0]+o.u[1]*L[1]+o.f[1]*L[2],P.pos[2]+o.r[2]*L[0]+o.u[2]*L[1]+o.f[2]*L[2]];burst(w,10,40,.45,[1.6,1.1,.4]);}}
  if(dmg>.5&&Math.random()<(dmg-.5)*.08){const L=[(Math.random()-.5)*280,-46,70+Math.random()*20],w=[P.pos[0]+o.r[0]*L[0]+o.u[0]*L[1]+o.f[0]*L[2],P.pos[1]+o.r[1]*L[0]+o.u[1]*L[1]+o.f[1]*L[2],P.pos[2]+o.r[2]*L[0]+o.u[2]*L[1]+o.f[2]*L[2]];burst(w,4,25,.35,[1.4,.9,.3]);}}
 // ---------------- 3D hangar for the docking and launch movies ----------------
 let hs=null,hcam=null,hobjs=new Map();
 function hangarTex(){return texCache.floor||(texCache.floor=(()=>{const t=cv(512,512,(c,w,h)=>{c.fillStyle='#3a3f4c';c.fillRect(0,0,w,h);const r=rnd(5);for(let i=0;i<300;i++){c.fillStyle=`rgba(0,0,0,${r()*.12})`;c.fillRect(r()*w,r()*h,r()*60,r()*60);}c.strokeStyle='rgba(10,12,20,.8)';c.lineWidth=3;for(let i=0;i<=4;i++){c.beginPath();c.moveTo(i*128,0);c.lineTo(i*128,h);c.stroke();c.beginPath();c.moveTo(0,i*128);c.lineTo(w,i*128);c.stroke();}});t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(4,10);return t;})());}
 function buildHangar(HG,PADS){hs=new T.Scene();hs.background=new T.Color(0x05070d);hcam=new T.PerspectiveCamera(50,2,5,2e5);hcam.matrixAutoUpdate=false;const X=HG.x,F=HG.yF,Cc=HG.yC,Z=HG.z1,M3=(x,y,z)=>new T.Vector3(...M([x,y,z]));
  const box=(w,h,d,col,o={})=>new T.Mesh(new T.BoxGeometry(w,h,d),o.basic?new T.MeshBasicMaterial({color:col}):new T.MeshStandardMaterial({color:col,metalness:o.metal??.5,roughness:o.rough??.6,map:o.map||null}));
  const put=(m,x,y,z)=>{m.position.copy(M3(x,y,z));hs.add(m);return m;};
  put(box(2*X,4,Z+600,0xffffff,{map:hangarTex(),metal:.6,rough:.55}),0,F-2,Z/2);put(box(2*X,4,Z+600,0x1a1f30),0,Cc+2,Z/2);
  put(box(4,Cc-F,Z+600,0x232a40,{metal:.4}),-X,(F+Cc)/2,Z/2);put(box(4,Cc-F,Z+600,0x232a40,{metal:.4}),X,(F+Cc)/2,Z/2);put(box(2*X,Cc-F,4,0x1d2338),0,(F+Cc)/2,Z+300);
  for(const[y0,h0]of[[F,(Cc-F)/2-80],[(F+Cc)/2+80,(Cc-F)/2-80]])put(box(2*X,h0,4,0x1d2338),0,y0+h0/2,-2);for(const sx of[-1,1])put(box(X-260,160,4,0x1d2338),sx*(260+(X-260)/2),(F+Cc)/2,-2);
  const stars=new T.Mesh(new T.PlaneGeometry(520,160),new T.MeshBasicMaterial({map:cv(256,80,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);for(let i=0;i<120;i++){c.fillStyle=`rgba(255,255,255,${Math.random()})`;c.fillRect(Math.random()*w,Math.random()*h,1,1);}})}));stars.position.copy(M3(0,(F+Cc)/2,-40));hs.add(stars);
  for(let z=200;z<Z;z+=400)for(const sx of[-1,1])put(box(30,Cc-F,30,0x2e3656,{metal:.7}),sx*(X-16),(F+Cc)/2,z);
  for(let z=300;z<Z;z+=680){const l=put(box(240,4,120,0xfff3c4,{basic:true}),0,Cc-4,z+60);const pl=new T.PointLight(0xffe6b0,1.1,2200,1.4);pl.position.copy(M3(0,Cc-60,z+60));hs.add(pl);}
  hs.add(new T.AmbientLight(0x6070a0,.35));hs.add(new T.HemisphereLight(0xbfc8ff,0x202020,.35));
  for(const[x,z]of PADS){put(box(300,3,300,0x2a3150,{metal:.6}),x,F+1.5,z);const ring=new T.Mesh(new T.RingGeometry(120,136,48),new T.MeshBasicMaterial({color:0xff8a1c,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.copy(M3(x,F+4,z));hs.add(ring);
   for(const[dx,dz]of[[-140,-140],[140,-140],[140,140],[-140,140]]){const L=put(new T.Mesh(new T.SphereGeometry(7,10,8),new T.MeshBasicMaterial({color:0xffb020})),x+dx,F+8,z+dz);L.userData.blink=x+z+dx;}}
  for(let i=0;i<14;i++){const st=put(box(50,2,8,0xffd23a,{basic:true}),-X+60+i*((2*X-120)/13),F+1,60);st.rotation.y=.6;}}
 function hangar(ctx,A,H){if(!ready())return false;if(!hs)buildHangar(A.HG,A.PADS);const W=A.W;const live=new Set();
  for(const o of A.objs){live.add(o.key);let g=hobjs.get(o.key);if(g&&o.look&&g.userData.lk!==JSON.stringify(o.look)){hs.remove(g);hobjs.delete(o.key);g=null;}if(!g){g=new T.Group();g.add(new T.Mesh(geoOf(o.m),metal(o.col,{metal:.6})));if(/^(me|p\d+|other)$/.test(o.key))detail(g,o.m,o.col);if(o.look){shipLook(g,o.m,o.look);g.userData.lk=JSON.stringify(o.look);}if(o.engine){const e=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0x3fe0ff,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));e.position.set(0,0,-98);e.scale.set(80,80,1);e.userData.engine=true;g.add(e);}if(o.blink){const l=new T.Mesh(new T.SphereGeometry(6,8,6),new T.MeshBasicMaterial({color:0xff2d55}));l.position.set(0,14,0);l.userData.b=true;g.add(l);}hs.add(g);hobjs.set(o.key,g);}
   setBasis(g,o.pos,o.o);g.children.forEach(x=>{if(x.userData.engine)x.visible=o.engine>0;if(x.userData.b)x.material.color.setHex(Math.floor(A.t*3)%2?0xff2d55:0x3cff6a);});}
  for(const[k,g]of hobjs)if(!live.has(k)){hs.remove(g);hobjs.delete(k);}
  hs.traverse(x=>{if(x.userData&&x.userData.blink!==undefined)x.visible=Math.sin(A.t*4+x.userData.blink)>0;});
  const C2=A.CAM,r=M(C2.r),u=M(C2.u),f=M(C2.f).map(q=>-q),p=M(C2.pos);hcam.matrix.set(r[0],u[0],f[0],p[0],r[1],u[1],f[1],p[1],r[2],u[2],f[2],p[2],0,0,0,1);hcam.matrixWorld.copy(hcam.matrix);hcam.matrixWorldInverse.copy(hcam.matrix).invert();
  const wd=A.wide||null,CXa=A.CX??W/2,CYa=A.CY??H/2;let w,h,ppx,ppy,foc;
  if(wd){const dpr=Math.min(window.devicePixelRatio||1,2)*quality.pr,sc=Math.min(dpr,2400/wd.w);w=Math.round(wd.w*sc);h=Math.round(wd.h*sc);ppx=(wd.ox+CXa*wd.s)*sc;ppy=(wd.oy+CYa*wd.s)*sc;foc=A.FOC*wd.s*sc;}
  else{const k=Math.max(1,Math.min(ctx.canvas.width/W,1920/W));w=Math.round(W*quality.pr*k);h=Math.round(H*quality.pr*k);const sc=w/W;ppx=CXa*sc;ppy=CYa*sc;foc=A.FOC*sc;}
  if(gl.width!==w||gl.height!==h){R.setPixelRatio(1);R.setSize(w,h,false);comp.setSize(w,h);bloom.resolution.set(w,h);}R.setScissorTest(false);R.setViewport(0,0,w,h);
  {const n=hcam.near;hcam.projectionMatrix.makePerspective(-ppx/foc*n,(w-ppx)/foc*n,ppy/foc*n,-(h-ppy)/foc*n,n,hcam.far);hcam.projectionMatrixInverse.copy(hcam.projectionMatrix).invert();}
  if(A.pit){const key=A.W+'x'+A.VH+'x'+A.CY+'|'+(A.deck?A.deck.key:'')+'|'+JSON.stringify(A.cab||{});if(!pit||pitKey!==key){if(pit&&pit.parent)pit.parent.remove(pit);pitLights=[];pitGlow=[];pit=buildPit(A,A.deck||null);pitKey=key;}if(A.deck)updDeck(A.deck,A.t);if(pit.parent!==hs)hs.add(pit);pit.visible=true;setBasis(pit,A.pitPos,A.pitO);
   if(A.dash&&dashTex){if(dashTex.image!==A.dash)dashTex.image=A.dash;dashTex.needsUpdate=true;}for(const m of scrMeshes)m.material.color.setScalar(1);if(pitLamp){pitLamp.color.setHex(0x3fe0ff);pitLamp.intensity=.7;}for(const s2 of pitLights)s2.material.color.setHex(0x3fe0ff);}
  else if(pit&&pit.parent===hs){root.add(pit);pit.visible=false;}
  R.render(hs,hcam);if(wd){if(wd.cv.width!==w||wd.cv.height!==h){wd.cv.width=w;wd.cv.height=h;}wd.ctx.drawImage(gl,0,0);ctx.clearRect(0,0,W,H);}else ctx.drawImage(gl,0,0,W,H);return true;}
 // extra cameras for the cockpit's side windows and mirror: rendered straight after the main view into small regions of
 // the same WebGL canvas, then copied through each window's shape. {o:{r,u,f}, pos, fov, rect:[x,y,w,h], clip(ctx), mirror}
 function views(ctx,A,list,scale){if(!ready()||!quality.views)return false;const W=A.W,VH=A.VH,pw=(scale||Math.max(1,Math.min(3,ctx.canvas.width/W)))*quality.pr,ph=pw,pv=pit&&pit.visible;if(pit)pit.visible=false;R.setScissorTest(true);
  for(const v of list){const[x,y,w,h]=v.rect,gx=0,gy=0,gw=Math.min(gl.width,Math.round(w*pw)),gh=Math.min(gl.height,Math.round(h*ph));if(gw<2||gh<2)continue;
   const r=M(v.o.r),u=M(v.o.u),f=M(v.o.f).map(q=>-q),p=M(v.pos);cam2.matrix.set(r[0],u[0],f[0],p[0],r[1],u[1],f[1],p[1],r[2],u[2],f[2],p[2],0,0,0,1);cam2.matrixWorld.copy(cam2.matrix);cam2.matrixWorldInverse.copy(cam2.matrix).invert();
   cam2.fov=v.fov;cam2.aspect=w/h;cam2.updateProjectionMatrix();starField.position.set(...p);R.setViewport(gx,gy,gw,gh);R.setScissor(gx,gy,gw,gh);R.render(vHangar&&hs?hs:scene,cam2);
   ctx.save();v.clip(ctx);ctx.clip();if(v.mirror){ctx.translate(x+w,0);ctx.scale(-1,1);ctx.drawImage(gl,gx,gl.height-gy-gh,gw,gh,0,y,w,h);}else ctx.drawImage(gl,gx,gl.height-gy-gh,gw,gh,x,y,w,h);ctx.restore();}
  R.setScissorTest(false);R.setViewport(0,0,gl.width,gl.height);if(pit)pit.visible=pv;return true;}
 let vHangar=false;function viewHangar(b){vHangar=!!b;}
 let pmul=1;
 const PRESET={low:{pr:.6,bloom:false,views:false},medium:{pr:.8,bloom:true,views:false},high:{pr:1,bloom:true,views:true},ultra:{pr:1.35,bloom:true,views:true}};
 function setQuality(q){if(q==='auto'){quality.auto=true;return;}quality.auto=false;Object.assign(quality,PRESET[q]||PRESET.high);}
 function pregen(seed){try{terrain((seed^0x5151)>>>0);terrain(seed^0x5151);}catch(e){}}
 function profile(dev){if(dev==='phone'){Object.assign(quality,{pr:.6,bloom:false,views:false});pmul=.4;}else if(dev==='tablet'){Object.assign(quality,{pr:.8,views:false});pmul=.7;}else pmul=1;}
 return{preview,viewHangar,setQuality,pregen,cockpit,hangar,profile,load,ready,render,views,get state(){return state;},get quality(){return quality;}};
})();
