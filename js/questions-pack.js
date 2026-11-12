/* Starlane Trader — built-in question pack (standalone site).
   Four age bands: 0 = ages 7–8, 1 = 9–10, 2 = 11–12, 3 = 13–14 (window.STARLANE_LEVEL()).
   Same format as ApolloMaths' bank: bank[topic] = [generator, ...]; each generator returns
   {q, a, h} — a question, a numeric answer (up to 2 decimal places) and worked-explanation lines.
   A generator returns null when it is not suitable for the current band. */
var bank=(function(){
const L=()=>{try{return Math.max(0,Math.min(3,window.STARLANE_LEVEL?window.STARLANE_LEVEL():2));}catch(e){return 2;}};
const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const by=(...v)=>v[L()];                       // value for the current band
const at=(min,max=3)=>L()>=min&&L()<=max;       // band filter
const round=(x,d=2)=>Math.round(x*Math.pow(10,d))/Math.pow(10,d);
const gcd=(a,b)=>b?gcd(b,a%b):a;
const T={
 addition:[
  ()=>{const a=r(by(10,100,250,500),by(60,500,999,4999)),b=r(by(5,50,120,300),by(40,400,899,3999));return{q:`Mission control logs ${a} km on the first leg and ${b} km on the second. How many km in total?`,a:a+b,h:[`${a} + ${b} = ${a+b}`]};},
  ()=>{const a=r(by(4,12,25,40),by(15,40,90,150)),b=r(by(3,9,15,30),by(12,30,60,120)),c=r(by(2,5,10,20),by(10,20,50,90));return{q:`Three cargo pods hold ${a} t, ${b} t and ${c} t. What is the total mass?`,a:a+b+c,h:[`${a} + ${b} + ${c} = ${a+b+c} t`]};}],
 subtraction:[
  ()=>{const a=r(by(20,200,600,1500),by(99,900,2000,9000)),b=r(by(5,40,150,400),Math.min(a-1,by(60,700,1800,8000)));return{q:`You have ${a} credits and spend ${b}. How many credits are left?`,a:a-b,h:[`${a} − ${b} = ${a-b}`]};}],
 multiplication:[
  ()=>{const a=r(2,by(5,12,12,15)),b=r(2,by(10,12,25,99));return{q:`Each crate holds ${a} tonnes. How many tonnes are in ${b} crates?`,a:a*b,h:[`${a} × ${b} = ${a*b}`]};}],
 division:[
  ()=>{const b=r(2,by(5,12,12,15)),a=b*r(2,by(10,12,20,40));return{q:`${a} fuel cells are shared equally between ${b} ships. How many does each ship get?`,a:a/b,h:[`${a} ÷ ${b} = ${a/b}`]};},
  ()=>at(2)?(()=>{const b=r(3,9),a=b*r(11,99)+r(1,b-1);return{q:`${a} passengers board shuttles that carry ${b} each. How many shuttles are needed?`,a:Math.ceil(a/b),h:[`${a} ÷ ${b} = ${Math.floor(a/b)} remainder ${a%b}`,`The remaining passengers still need a shuttle, so ${Math.ceil(a/b)}`]};})():null],
 placeValue:[
  ()=>{const n=r(by(100,1000,10000,100000),by(999,9999,99999,999999)),s=String(n),i=r(0,s.length-1),pv=Math.pow(10,s.length-1-i);return{q:`In the number ${n.toLocaleString('en-GB')}, what is the value of the digit ${s[i]} in position ${i+1} from the left?`,a:(+s[i])*pv,h:[`That digit is in the ${pv.toLocaleString('en-GB')}s place, so its value is ${s[i]} × ${pv} = ${(+s[i])*pv}`]};}],
 rounding:[
  ()=>{const n=r(by(11,101,1001,10001),by(99,999,9999,99999)),to=by(10,pick([10,100]),pick([100,1000]),pick([1000,10000]));return{q:`Round ${n.toLocaleString('en-GB')} to the nearest ${to.toLocaleString('en-GB')}.`,a:Math.round(n/to)*to,h:[`Look at the digit after the ${to}s place to decide whether to round up or down`]};}],
 fractions:[
  ()=>{const d=pick(by([2,4],[2,3,4,5,10],[3,4,5,6,8],[6,8,9,12])),n=r(1,d-1),m=d*r(by(2,2,3,5),by(5,10,15,25));return{q:`What is ${n}/${d} of ${m} credits?`,a:m/d*n,h:[`${m} ÷ ${d} = ${m/d}`,`${m/d} × ${n} = ${m/d*n}`]};},
  ()=>at(1)?(()=>{const d=pick([3,4,5,6,8,10]),n=r(1,d-1),k=r(2,by(3,4,6,9)),D=d*k;return{q:`Complete the equivalent fraction: ${n}/${d} = ?/${D}`,a:n*k,h:[`${d} × ${k} = ${D}, so multiply the top by ${k} too: ${n} × ${k} = ${n*k}`]};})():null,
  ()=>at(2)?(()=>{const d=pick([4,5,8,10,20,25,50]),n=r(1,d-1);return{q:`Write ${n}/${d} as a decimal.`,a:round(n/d),h:[`${n} ÷ ${d} = ${round(n/d)}`]};})():null,
  ()=>at(2)?(()=>{const d1=pick([2,3,4,5,6]),d2=pick([2,3,4,6,8]),n1=r(1,d1-1),n2=r(1,d2-1),D=d1*d2/gcd(d1,d2),N=n1*D/d1+n2*D/d2;return{q:`${n1}/${d1} + ${n2}/${d2} = ?/${D}. What is the missing top number?`,a:N,h:[`Change both to ${D}ths: ${n1*D/d1}/${D} + ${n2*D/d2}/${D} = ${N}/${D}`]};})():null],
 decimals:[
  ()=>at(1)?(()=>{const a=round(r(by(10,10,100,100),by(99,99,999,9999))/10,1),b=round(r(by(10,10,50,100),by(90,90,500,5000))/10,1);return{q:`A probe travels ${a} km then ${b} km. How far altogether?`,a:round(a+b,1),h:[`Line up the decimal points: ${a} + ${b} = ${round(a+b,1)}`]};})():null,
  ()=>at(2)?(()=>{const a=round(r(12,99)/10,1),b=r(3,9);return{q:`Each scan takes ${a} seconds. How long do ${b} scans take?`,a:round(a*b,1),h:[`${a} × ${b} = ${round(a*b,1)} seconds`]};})():null],
 percentages:[
  ()=>at(1)?(()=>{const p=pick(by([50],[10,50,25],[10,20,25,75,5],[15,35,12.5,60,45])),n=pick([40,60,80,120,200,240,360,480,800]);return{q:`A trader offers ${p}% off a ${n}-credit part. How many credits is the discount?`,a:round(n*p/100),h:[`${p}% of ${n} = ${n} × ${p} ÷ 100 = ${round(n*p/100)}`]};})():null,
  ()=>at(2)?(()=>{const n=pick([50,80,120,200,250,400]),p=pick([5,10,20,25,30]);return{q:`Fuel costs ${n} credits, then rises by ${p}%. What is the new price?`,a:round(n*(1+p/100)),h:[`${p}% of ${n} = ${round(n*p/100)}`,`${n} + ${round(n*p/100)} = ${round(n*(1+p/100))}`]};})():null,
  ()=>at(3)?(()=>{const was=pick([40,50,80,120,200,250]),p=pick([10,20,25,40,60]),now=was*(1+p/100);return{q:`A price rose from ${was} to ${round(now)} credits. What was the percentage increase?`,a:p,h:[`Increase = ${round(now-was)}`,`${round(now-was)} ÷ ${was} × 100 = ${p}%`]};})():null],
 ratio:[
  ()=>at(2)?(()=>{const a=r(1,5),b=r(1,5),k=r(2,by(4,6,10,20)),tot=(a+b)*k;return{q:`Profit of ${tot} credits is shared between two pilots in the ratio ${a}:${b}. How much does the first pilot get?`,a:a*k,h:[`${a} + ${b} = ${a+b} parts, each part = ${tot} ÷ ${a+b} = ${k}`,`First pilot: ${a} × ${k} = ${a*k}`]};})():null,
  ()=>at(2)?(()=>{const per=r(2,9),u=r(3,8),n=r(4,12);return{q:`${u} fuel cells cost ${per*u} credits. How much do ${n} cost?`,a:per*n,h:[`One cell costs ${per*u} ÷ ${u} = ${per}`,`${n} × ${per} = ${per*n}`]};})():null],
 money:[
  ()=>{const p=r(by(1,2,3,5),by(9,15,25,60)),n=r(2,by(5,9,12,20)),pay=Math.ceil(p*n/10)*10+by(0,10,20,50);return{q:`You buy ${n} spare parts at ${p} credits each and pay with ${pay} credits. How much change?`,a:pay-p*n,h:[`Cost: ${n} × ${p} = ${p*n}`,`Change: ${pay} − ${p*n} = ${pay-p*n}`]};}],
 time:[
  ()=>{const h=r(by(1,1,1,2),by(3,6,9,12)),m=pick(by([0,30],[0,15,30,45],[5,20,35,50],[7,23,41,58])),add=pick(by([30,60],[45,90],[75,105,135],[95,145,215])),tot=h*60+m+add;return{q:`A jump starts at ${h}:${String(m).padStart(2,'0')} and lasts ${add} minutes. How many minutes past the hour does it finish?`,a:tot%60,h:[`${h}:${String(m).padStart(2,'0')} + ${add} minutes = ${Math.floor(tot/60)}:${String(tot%60).padStart(2,'0')}`]};},
  ()=>at(1)?(()=>{const hrs=r(2,by(3,5,8,12)),mins=hrs*60;return{q:`How many minutes are there in ${hrs} hours?`,a:mins,h:[`${hrs} × 60 = ${mins}`]};})():null],
 measures:[
  ()=>{const c=pick(by([['m','cm',100]],[['m','cm',100],['kg','g',1000]],[['km','m',1000],['kg','g',1000],['l','ml',1000]],[['km','m',1000],['t','kg',1000],['l','ml',1000],['m','mm',1000]])),v=by(r(2,9),r(2,15),round(r(12,95)/10,1),round(r(105,995)/100,2));return{q:`Convert ${v} ${c[0]} into ${c[1]}.`,a:round(v*c[2]),h:[`1 ${c[0]} = ${c[2]} ${c[1]}`,`${v} × ${c[2]} = ${round(v*c[2])}`]};}],
 area:[
  ()=>{const w=r(2,by(6,12,20,30)),l=r(2,by(8,12,25,40));return{q:`A landing pad is ${w} m by ${l} m. What is its area in m²?`,a:w*l,h:[`Area = length × width = ${l} × ${w} = ${w*l} m²`]};},
  ()=>{const w=r(2,by(6,12,20,30)),l=r(2,by(8,12,25,40));return{q:`What is the perimeter of a ${w} m by ${l} m cargo bay floor?`,a:2*(w+l),h:[`Perimeter = 2 × (${w} + ${l}) = ${2*(w+l)} m`]};},
  ()=>at(2)?(()=>{const b=r(4,20),h=r(2,15)*2;return{q:`A triangular solar sail has a base of ${b} m and a height of ${h} m. What is its area in m²?`,a:b*h/2,h:[`Area = ½ × base × height = ½ × ${b} × ${h} = ${b*h/2} m²`]};})():null],
 volume:[
  ()=>at(1)?(()=>{const a=r(2,by(3,5,10,15)),b=r(2,by(3,6,10,15)),c=r(2,by(3,5,8,12));return{q:`A cargo container is ${a} m long, ${b} m wide and ${c} m high. What is its volume in m³?`,a:a*b*c,h:[`Volume = ${a} × ${b} × ${c} = ${a*b*c} m³`]};})():null,
  ()=>at(2)?(()=>{const s=r(2,by(3,4,6,10));return{q:`A cube-shaped fuel tank has sides of ${s} m. What is its volume in m³?`,a:s*s*s,h:[`${s} × ${s} × ${s} = ${s*s*s} m³`]};})():null,
  ()=>at(2)?(()=>{const a=r(2,6),b=r(2,6),c=r(2,6),V=a*b*c*1000;return{q:`A tank is ${a} m × ${b} m × ${c} m. How many litres does it hold? (1 m³ = 1000 litres)`,a:V,h:[`Volume = ${a*b*c} m³`,`${a*b*c} × 1000 = ${V} litres`]};})():null],
 angles:[
  ()=>{const a=r(by(20,20,15,11),by(80,80,150,170));return{q:`Two angles on a straight line add to 180°. One is ${a}°. What is the other?`,a:180-a,h:[`180 − ${a} = ${180-a}°`]};},
  ()=>at(1)?(()=>{const a=r(30,90),b=r(20,150-a);return{q:`A triangle has angles of ${a}° and ${b}°. What is the third angle?`,a:180-a-b,h:[`Angles in a triangle add to 180°`,`180 − ${a} − ${b} = ${180-a-b}°`]};})():null,
  ()=>at(3)?(()=>{const n=pick([5,6,8,9,10,12]);return{q:`What is each interior angle of a regular ${n}-sided polygon?`,a:round(180*(n-2)/n,1),h:[`Sum of interior angles = (${n} − 2) × 180 = ${180*(n-2)}°`,`${180*(n-2)} ÷ ${n} = ${round(180*(n-2)/n,1)}°`]};})():null],
 sequences:[
  ()=>{const s=r(1,by(10,20,50,100)),d=r(by(2,3,4,-9),by(5,9,15,25))||3,n=5,seq=[...Array(4)].map((_,i)=>s+d*i);return{q:`The beacons are numbered ${seq.join(', ')}, … What is the next number?`,a:s+d*4,h:[`The pattern goes up by ${d} each time`,`${seq[3]} + ${d} = ${s+d*4}`]};},
  ()=>at(2)?(()=>{const d=r(2,9),c=r(-5,12),n=r(10,30);return{q:`The nth term of a sequence is ${d}n ${c<0?'−':'+'} ${Math.abs(c)}. What is the ${n}th term?`,a:d*n+c,h:[`${d} × ${n} ${c<0?'−':'+'} ${Math.abs(c)} = ${d*n+c}`]};})():null],
 algebra:[
  ()=>at(1)?(()=>{const x=r(2,by(10,12,20,40)),a=r(2,by(5,9,15,30));return{q:`A number plus ${a} equals ${x+a}. What is the number?`,a:x,h:[`${x+a} − ${a} = ${x}`]};})():null,
  ()=>at(2)?(()=>{const x=r(2,15),a=r(2,9),b=r(1,20);return{q:`Solve for x: ${a}x + ${b} = ${a*x+b}`,a:x,h:[`${a}x = ${a*x+b} − ${b} = ${a*x}`,`x = ${a*x} ÷ ${a} = ${x}`]};})():null,
  ()=>at(3)?(()=>{const x=r(2,12),a=r(2,7),b=r(1,a-1),c=r(1,20),d=(a-b)*x+c;return{q:`Solve for x: ${a}x + ${c} = ${b}x + ${d}`,a:x,h:[`${a-b}x = ${d} − ${c} = ${d-c}`,`x = ${d-c} ÷ ${a-b} = ${x}`]};})():null],
 negatives:[
  ()=>at(1)?(()=>{const t=r(-12,by(-1,-1,5,10)),ch=r(3,by(10,10,20,30));return{q:`The hull temperature is ${t}°C. It rises by ${ch}°C. What is it now?`,a:t+ch,h:[`${t} + ${ch} = ${t+ch}°C`]};})():null,
  ()=>at(2)?(()=>{const a=r(-15,-2),b=r(-9,9)||4;return{q:`What is ${a} × ${b}?`,a:a*b,h:[`${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a*b)}`,`${(a<0)!==(b<0)?'Different signs give a negative answer':'Same signs give a positive answer'}`]};})():null],
 factors:[
  ()=>at(1)?(()=>{const a=pick(by([2,3,5],[2,3,4,5,6],[4,6,8,9,12],[12,15,18,24])),b=pick(by([2,4,5],[3,4,6,8],[6,8,10,15],[16,20,30,36]));const l=a*b/gcd(a,b);return{q:`Beacon A flashes every ${a} seconds and beacon B every ${b} seconds. They flash together now. After how many seconds will they next flash together?`,a:l,h:[`Find the lowest common multiple of ${a} and ${b}`,`LCM = ${l}`]};})():null,
  ()=>at(2)?(()=>{const a=r(2,9)*pick([2,3,4,6]),b=r(2,9)*pick([2,3,4,6]),g=gcd(a,b);return{q:`What is the highest common factor of ${a} and ${b}?`,a:g,h:[`The biggest number that divides both ${a} and ${b} is ${g}`]};})():null,
  ()=>at(2)?(()=>{const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53];const i=r(1,primes.length-3);return{q:`Signals come in prime numbers: ${primes.slice(i-1,i+2).join(', ')}, … What is the next prime?`,a:primes[i+2],h:[`A prime has exactly two factors: 1 and itself`,`The next prime after ${primes[i+1]} is ${primes[i+2]}`]};})():null],
 powers:[
  ()=>at(2)?(()=>{const n=r(2,by(5,9,12,15));return{q:`What is ${n} squared?`,a:n*n,h:[`${n} × ${n} = ${n*n}`]};})():null,
  ()=>at(2)?(()=>{const n=r(2,by(5,9,12,20));return{q:`What is the square root of ${n*n}?`,a:n,h:[`${n} × ${n} = ${n*n}, so √${n*n} = ${n}`]};})():null,
  ()=>at(3)?(()=>{const b=pick([2,3,5,10]),e=b===2?r(3,8):r(2,4);return{q:`What is ${b} to the power ${e}?`,a:Math.pow(b,e),h:[`${Array(e).fill(b).join(' × ')} = ${Math.pow(b,e)}`]};})():null],
 averages:[
  ()=>at(1)?(()=>{const n=by(3,3,4,5),k=r(2,by(8,12,20,40)),v=[...Array(n)].map(()=>r(1,by(10,20,40,90)));const s=v.reduce((a,b)=>a+b,0),fix=(k*n)-s;v[0]=Math.max(1,v[0]+fix);const S=v.reduce((a,b)=>a+b,0);return{q:`A pilot scores ${v.join(', ')} on ${n} training runs. What is the mean score?`,a:round(S/n),h:[`Total = ${S}`,`${S} ÷ ${n} = ${round(S/n)}`]};})():null,
  ()=>at(2)?(()=>{const v=[...Array(5)].map(()=>r(1,by(10,20,50,99))).sort((a,b)=>a-b);return{q:`Cargo loads (t): ${[...v].sort(()=>Math.random()-.5).join(', ')}. What is the range?`,a:v[4]-v[0],h:[`Range = largest − smallest = ${v[4]} − ${v[0]} = ${v[4]-v[0]}`]};})():null,
  ()=>at(2)?(()=>{const v=[...Array(5)].map(()=>r(1,by(10,20,50,99)));const s=[...v].sort((a,b)=>a-b);return{q:`Docking times (s): ${v.join(', ')}. What is the median?`,a:s[2],h:[`In order: ${s.join(', ')}`,`The middle value is ${s[2]}`]};})():null],
 speed:[
  ()=>at(2)?(()=>{const sp=r(2,9)*by(10,10,10,50),t=r(2,6);return{q:`A shuttle flies at ${sp} km per hour for ${t} hours. How far does it travel?`,a:sp*t,h:[`Distance = speed × time = ${sp} × ${t} = ${sp*t} km`]};})():null,
  ()=>at(3)?(()=>{const t=r(2,8),sp=r(3,15)*10,d=sp*t;return{q:`A probe covers ${d} km in ${t} hours. What is its average speed in km per hour?`,a:sp,h:[`Speed = distance ÷ time = ${d} ÷ ${t} = ${sp} km/h`]};})():null]
};
return T;})();
