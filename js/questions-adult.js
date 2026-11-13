/* Starlane Trader — adult question set ("Adult — tough" pilot level).
   Mental arithmetic, percentages, money, algebra, powers, probability and problem solving — no calculator.
   Same format as the built-in pack: ADULT_BANK[topic] = [generator]; each returns {q, a, h}. */
window.ADULT_BANK=(function(){
const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[r(0,a.length-1)],m2=v=>Math.round(v*100)/100;
return{
 mental:[
  ()=>{const a=r(23,89),b=r(23,89);return{q:`Work out ${a} × ${b} in your head.`,a:a*b,h:[`${a} × ${b} = ${a} × ${b-b%10} + ${a} × ${b%10}`,`= ${a*(b-b%10)} + ${a*(b%10)} = ${a*b}`]};},
  ()=>{const a=r(12,49)*25,b=r(3,16)*4;return{q:`Work out ${a} × ${b}.`,a:a*b,h:[`Pair the 25s with the 4s: ${a/25} × 25 × ${b/4} × 4 = ${a/25} × ${b/4} × 100`,`= ${a*b}`]};},
  ()=>{const d=pick([7,8,9,12,13,15,17]),q=r(23,98),n=d*q;return{q:`Work out ${n} ÷ ${d}.`,a:q,h:[`${d} × ${Math.floor(q/10)*10} = ${d*Math.floor(q/10)*10}`,`${n} − ${d*Math.floor(q/10)*10} = ${n-d*Math.floor(q/10)*10} = ${d} × ${q%10}`,`So the answer is ${q}`]};},
  ()=>{const n=pick([1296,1764,2025,2304,2601,3136,3249,3721,4096,4489,5184,6561,7056,7921]);return{q:`What is the square root of ${n}?`,a:Math.sqrt(n),h:[`Bracket it between squares of tens, then check the last digit.`,`${Math.sqrt(n)} × ${Math.sqrt(n)} = ${n}`]};}],
 percent:[
  ()=>{const p=r(4,40)*10,u=pick([10,15,20,25]),d=pick([10,20,25]);const v=m2(p*(1+u/100)*(1-d/100));return{q:`A price of £${p} rises by ${u}%, then falls by ${d}%. What is the final price in pounds?`,a:v,h:[`× ${1+u/100} then × ${1-d/100}`,`${p} × ${1+u/100} = ${m2(p*(1+u/100))}`,`× ${1-d/100} = ${v}`]};},
  ()=>{const net=r(12,90)*5;return{q:`A bill is £${m2(net*1.2)} including 20% VAT. What was it before VAT, in pounds?`,a:net,h:[`Including VAT is 120% of the price.`,`${m2(net*1.2)} ÷ 1.2 = ${net}`]};},
  ()=>{const p=r(2,9)*1000,i=pick([2,3,4,5]),y=3,v=m2(p*Math.pow(1+i/100,y));return{q:`£${p} earns ${i}% compound interest a year for ${y} years. What is it worth then, to the nearest penny?`,a:v,h:[`Multiply by ${1+i/100} three times.`,`${p} × ${1+i/100}³ = ${v}`]};},
  ()=>{const t=r(4,24)*100,a=pick([35,45,60,75]),b=pick([20,40,60,80]);return{q:`What is ${b}% of ${a}% of ${t}?`,a:m2(t*a/100*b/100),h:[`${a}% of ${t} = ${m2(t*a/100)}`,`${b}% of that = ${m2(t*a/100*b/100)}`]};}],
 algebra:[
  ()=>{const x=r(-9,14)||5,a=r(2,9),b=r(-12,12),c=r(2,6);const rhs=a*(x+b)-c*x;return{q:`Solve for x: ${a}(x ${b<0?'−':'+'} ${Math.abs(b)}) − ${c}x = ${rhs}`,a:x,h:[`Expand: ${a}x ${a*b<0?'−':'+'} ${Math.abs(a*b)} − ${c}x = ${rhs}`,`${a-c}x = ${rhs-a*b}`,`x = ${x}`]};},
  ()=>{const x=r(2,15),y=r(1,12),a=r(2,5),b=r(2,5);return{q:`If ${a}x + y = ${a*x+y} and x + ${b}y = ${x+b*y}, what is x?`,a:x,h:[`Make y the subject of the first: y = ${a*x+y} − ${a}x`,`Substitute and solve: x = ${x} (and y = ${y})`]};},
  ()=>{const a=pick([1,2,3]),b=r(-4,6),c=r(-5,9),n=r(8,20);const t=k=>a*k*k+b*k+c;return{q:`A sequence has nth term ${a===1?'':a}n² ${b<0?'−':'+'} ${Math.abs(b)}n ${c<0?'−':'+'} ${Math.abs(c)}. What is term ${n}?`,a:t(n),h:[`Put n = ${n}: ${a} × ${n*n} ${b<0?'−':'+'} ${Math.abs(b*n)} ${c<0?'−':'+'} ${Math.abs(c)}`,`= ${t(n)}`]};}],
 powers:[
  ()=>{const b=pick([2,3,5]),e=b===2?r(8,12):b===3?r(5,7):r(3,5);return{q:`What is ${b} to the power ${e}?`,a:Math.pow(b,e),h:[`Keep multiplying by ${b}.`,`${b}^${e} = ${Math.pow(b,e)}`]};},
  ()=>{const a=pick([1.2,2.4,3.6,4.8,6.4,7.2]),b=pick([2,3,4,6,8]),e1=r(4,7),e2=r(-3,-1);const v=a*Math.pow(10,e1)/(b*Math.pow(10,e2));return{q:`Work out (${a} × 10^${e1}) ÷ (${b} × 10^${e2}). Give the answer as an ordinary number.`,a:Math.round(v),h:[`${a} ÷ ${b} = ${m2(a/b)}`,`10^${e1} ÷ 10^${e2} = 10^${e1-e2}`,`= ${Math.round(v)}`]};}],
 problems:[
  ()=>{const s=pick([48,60,72,84,96]),m=r(20,95);return{q:`A train travels at ${s} km/h for ${m} minutes. How many kilometres does it go?`,a:m2(s*m/60),h:[`${m} minutes = ${m}/60 of an hour`,`${s} × ${m} ÷ 60 = ${m2(s*m/60)} km`]};},
  ()=>{const dep=r(6,22),dur=r(7,13),dz=pick([-8,-5,1,4,7,9]);const arr=((dep+dur+dz)%24+24)%24;return{q:`A flight leaves London at ${String(dep).padStart(2,'0')}:00 and takes ${dur} hours. The destination is ${dz>0?dz+' hours ahead of':-dz+' hours behind'} London. What hour (0–23) is it there on arrival?`,a:arr,h:[`London time on arrival: ${(dep+dur)%24}:00`,`${dz>0?'Add':'Subtract'} ${Math.abs(dz)} hours → ${arr}:00`]};},
  ()=>{const parts=[r(2,7),r(2,7),r(2,7)],k=r(15,60),tot=k*parts.reduce((x,y)=>x+y,0);return{q:`£${tot} is shared in the ratio ${parts.join(':')}. How much is the largest share, in pounds?`,a:k*Math.max(...parts),h:[`Total parts: ${parts.reduce((x,y)=>x+y,0)}`,`One part = £${k}`,`Largest share = ${Math.max(...parts)} × ${k} = ${k*Math.max(...parts)}`]};},
  ()=>{const n=r(5,9),mean=r(40,80),add=r(10,120);return{q:`The mean of ${n} numbers is ${mean}. One more number, ${add}, is added. What is the new mean? (2 decimal places)`,a:m2((n*mean+add)/(n+1)),h:[`Total so far = ${n} × ${mean} = ${n*mean}`,`New total ${n*mean+add} ÷ ${n+1} = ${m2((n*mean+add)/(n+1))}`]};},
  ()=>{const k=r(4,11);return{q:`Two fair dice are rolled. In how many of the 36 outcomes is the total at least ${k}?`,a:[...Array(36)].filter((_,i)=>Math.floor(i/6)+i%6+2>=k).length,h:[`List the totals from ${k} to 12 and count the pairs for each.`]};},
  ()=>{const rd=r(3,12),h=r(4,15);return{q:`A cylinder has radius ${rd} cm and height ${h} cm. Using π = 3.14, what is its volume in cm³?`,a:m2(3.14*rd*rd*h),h:[`V = π r² h`,`3.14 × ${rd*rd} × ${h} = ${m2(3.14*rd*rd*h)}`]};},
  ()=>{const t=pick([840,960,1200,1440,1680]);return{q:`What is 3/4 of 2/5 of ${t}?`,a:t*2/5*3/4,h:[`2/5 of ${t} = ${t*2/5}`,`3/4 of that = ${t*2/5*3/4}`]};},
  ()=>{const rate=pick([1.15,1.18,1.25,1.17]),amt=r(12,95)*10;return{q:`£1 buys €${rate}. How many euros do you get for £${amt}? (2 decimal places)`,a:m2(amt*rate),h:[`${amt} × ${rate} = ${m2(amt*rate)}`]};}]};
})();
