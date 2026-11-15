/* Starlane Trader — what the cheat page (cheats.html) can change.
   rules: lasting rules the game reads through CH(k) in js/starlane.js. Their "def" values are the
          normal game and must match CHD there (tests/test_static.py checks this).
   cmd:   one-off changes to the commander (credits, ship, equipment…), applied once.
   Settings are saved on this device under localStorage 'starlane-cheats-v1' as
   {name, rules:{k:v}, cmd:{k:v}, saved}. The game reads them through StarlaneSite.cheats(). */
window.STARLANE_CHEAT_DEFS = (function(){
const R = (k, label, type, def, more) => Object.assign({k, label, type, def}, more || {});
const rules = [
 {group:'👾 Enemies', items:[
  R('peace', 'No random attacks at all (no pirate ambushes or alien raids out of hyperspace; missions still send their enemies)', 'bool', false),
  R('maxShips', 'Most ships around you at once', 'range', 6, {min:0, max:20, step:1}),
  R('pirateRate', 'How often pirates attack', 'range', 100, {min:0, max:400, step:10, unit:'%'}),
  R('pack', 'Pirates in each attack', 'range', 0, {min:0, max:12, step:1, zero:'Normal (1–3)'}),
  R('spawnGap', 'Average time between new ships arriving', 'range', 12, {min:3, max:60, step:1, unit:' s'}),
  R('enemyHP', 'Enemy toughness', 'range', 100, {min:10, max:400, step:10, unit:'%'}),
  R('enemyDmg', 'Enemy laser and missile damage', 'range', 100, {min:0, max:300, step:10, unit:'%'}),
  R('enemyMissiles', 'Enemies carry missiles', 'bool', true),
  R('police', 'Police patrols (and police chasing you)', 'bool', true)]},
 {group:'📋 Missions and hyperspace', items:[
  R('misAtk', 'Attackers in each mission attack (bounty gangs, ambushes, patrols, the Vorn mothership’s escort)', 'range', 0, {min:0, max:12, step:1, zero:'Normal'}),
  R('interdict', 'Chance of being pulled out of hyperspace by alien raiders', 'range', 100, {min:0, max:1000, step:50, unit:'%'}),
  R('vorn', 'Raiders when you are pulled out of hyperspace', 'range', 3, {min:1, max:12, step:1})]},
 {group:'🛡 Safe zone near the station', items:[
  R('safeKm', 'Distance from the station where random attacks stop', 'range', 16, {min:0, max:60, step:1, unit:' km'}),
  R('weapKm', 'Distance from the station where your weapons are held safe', 'range', 10, {min:0, max:60, step:1, unit:' km'}),
  R('armKm', 'An attacker this close unlocks your weapons', 'range', 12, {min:1, max:40, step:1, unit:' km'})]},
 {group:'🚀 Emergency escape', items:[
  R('escape', 'Emergency escape button (key 9, or tap 🚀 ESCAPE at the top of the screen)', 'bool', false),
  R('escPower', 'Escape speed', 'range', 4, {min:2, max:10, step:.5, unit:'× full speed'}),
  R('escSecs', 'Escape lasts', 'range', 5, {min:2, max:15, step:1, unit:' s'}),
  R('escWait', 'Wait before it can be used again', 'range', 60, {min:0, max:300, step:5, unit:' s'})]},
 {group:'🛸 Your ship', items:[
  R('god', 'Invincible', 'bool', false),
  R('dmgTaken', 'Damage you take', 'range', 100, {min:0, max:300, step:10, unit:'%'}),
  R('shieldRegen', 'Shield and energy recharge', 'range', 100, {min:25, max:500, step:25, unit:'%'}),
  R('laserDmg', 'Your laser damage', 'range', 100, {min:25, max:500, step:25, unit:'%'}),
  R('noHeat', 'Lasers never overheat', 'bool', false),
  R('infMissiles', 'Unlimited missiles', 'bool', false),
  R('infECM', 'Unlimited E.C.M. (works without one fitted, no energy used)', 'bool', false),
  R('infBomb', 'Unlimited shock pulses', 'bool', false),
  R('infStarburst', 'Unlimited starburst charges', 'bool', false),
  R('infFuel', 'Infinite fuel', 'bool', false),
  R('anyJump', 'Jump to any system, however far (no fuel used)', 'bool', false)]},
 {group:'💰 Money', items:[
  R('freeShop', 'Free shopping (and anything sold at any station)', 'bool', false),
  R('rewardScale', 'Mission rewards', 'range', 100, {min:0, max:1000, step:25, unit:'%'})]}
];
const SHIPS = [['', 'Keep current ship'], ['kestrel', 'Kestrel'], ['courier', 'Swift courier'], ['falcon', 'Falcon fighter'], ['mule', 'Mule freighter'], ['warden', 'Warden gunship']];
const LASERS = [['', 'Keep current laser'], ['pulse', 'Pulse'], ['beam', 'Beam'], ['twin', 'Twin beam'], ['military', 'Military'], ['plasma', 'Plasma cannon'], ['mining', 'Mining']];
const EQUIP = [['ecm', 'E.C.M. jammer'], ['scoop', 'Fuel scoops'], ['pod', 'Escape capsule'], ['bomb', 'Shock pulse'], ['energy', 'Extra energy unit'], ['dock', 'Docking computer'], ['hidden', 'Hidden cargo compartment'], ['galdrive', 'Galactic hyperdrive'], ['shieldboost', 'Shield booster'], ['firectl', 'Fire-control computer'], ['repairbot', 'Repair drones'], ['tractor', 'Tractor beam'], ['afterburner', 'Afterburner']];
const KEEP = ['', 'Keep as it is'];
const cmd = [
 {group:'💳 Commander', items:[
  {k:'credits', label:'Credits (leave blank to keep)', type:'number', min:0, max:100000000, placeholder:'e.g. 50000'},
  {k:'legal', label:'Legal status', type:'select', options:[KEEP, ['0', 'Clean'], ['20', 'Offender'], ['60', 'Fugitive']]},
  {k:'killPts', label:'Combat rank', type:'select', options:[KEEP, ['0', 'Rookie'], ['24', 'Pilot'], ['160', 'Veteran'], ['900', 'Deadly'], ['5000', 'Legend']]},
  {k:'difficulty', label:'Difficulty', type:'select', options:[KEEP, ['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']]},
  {k:'maths', label:'Maths puzzles', type:'select', options:[KEEP, ['true', 'On'], ['false', 'Off']]},
  {k:'cuts', label:'Movies (launch and docking scenes)', type:'select', options:[KEEP, ['true', 'On'], ['false', 'Off']]},
  {k:'fillFuel', label:'Fill the fuel tank', type:'bool'},
  {k:'repair', label:'Repair the hull', type:'bool'},
  {k:'advReset', label:'Make every adventure playable again', type:'bool'}]},
 {group:'🔧 Ship and equipment', items:[
  {k:'ship', label:'Ship', type:'select', options:SHIPS},
  {k:'front', label:'Front laser', type:'select', options:LASERS},
  {k:'rear', label:'Rear laser', type:'select', options:[KEEP, ['true', 'Fitted'], ['false', 'None']]},
  {k:'missiles', label:'Missiles', type:'select', options:[KEEP, ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4 (full)']]},
  {k:'starburst', label:'Starburst charges', type:'select', options:[KEEP, ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3 (full)']]},
  {k:'bigCargo', label:'Large cargo bay (35t)', type:'bool'},
  {k:'cap', label:'Cargo hold size in tonnes (leave blank to keep)', type:'number', min:1, max:500, placeholder:'e.g. 100'},
  {k:'personal', label:'All personal cockpit items (dice, plant, cat…)', type:'bool'},
  {k:'setEquip', label:'Change the equipment to exactly the ticked list below', type:'bool'},
  {k:'equip', label:'Equipment', type:'multi', options:EQUIP}]}
];
const defaults = () => { const r = {}; for (const g of rules) for (const i of g.items) r[i.k] = i.def; return r; };
// presets only list what differs from normal
const presets = [
 ['normal', '↺ Normal game', {}, {}],
 ['peace', '🕊 Peaceful cruise', {peace:true, interdict:0, safeKm:40, police:true}, {}],
 ['easy', '🧸 Easy fights', {enemyDmg:50, enemyHP:60, shieldRegen:200, escape:true, infMissiles:true}, {}],
 ['swarm', '🐝 Swarm', {maxShips:16, pirateRate:300, pack:5, spawnGap:6, misAtk:6, vorn:6, safeKm:5, interdict:400, escape:true}, {}],
 ['rich', '💰 Rich trader', {freeShop:true, rewardScale:300}, {credits:'100000'}],
 ['tank', '🛡 Tank', {god:true, noHeat:true, infMissiles:true, infECM:true, infBomb:true, infStarburst:true, infFuel:true, escape:true}, {}]
];
return {rules, cmd, defaults, presets, KEY:'starlane-cheats-v1', VERSION:1};
})();
