// Starlane Trader — adventure puzzles by level (since starlane-v27).
// StarAdvLevels[adventureId][sceneIndex] = {young, mid, older, adult}: each level is its own puzzle on the same
// topic, getting harder. A level is an object {q, options, answer, explain} (choose), {q, answer, explain} (code:
// answer is a string), {q, items, explain} (order: items in the right order), or a function returning one, so the
// numbers change every time it is played. Batches: 1 = adventures 1–10 (v27); 2–5 = adventures 11–50 (v28). A level left out falls back to the original scene in
// starlane-adventures.js (young/mid/older wording, shared options); adult falls back to older.
// Levels: young 7–9, mid 10–12, older 13–14, adult = a clever adult, no specialist knowledge (any rule needed is
// given in the question). Every answer here was solved twice: by its author and by an independent checker who did not see the answers
// (orderings that could fairly go two ways were rewritten); generated puzzles are re-solved in tests/test_advlevels.py.
'use strict';
window.StarAdvLevels = (() => {
 const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = a => a[R(0, a.length - 1)];
 const bin = (n, w) => n.toString(2).padStart(w, '0').split('').join(' ');
 const placeSum = (n, w) => { const parts = []; for (let i = w - 1; i >= 0; i--) if (n >> i & 1) parts.push(2 ** i); return parts.join(' + ') + ' = ' + n; };
 const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];
 const L = {};

 // ---- 1. The Ticking Canister (chemistry, physics) ----
 L.canister = {
  2: {
   mid: {q: 'The trigger is full of acid at pH 2. To neutralise it, what pH should the liquid we pour in have?', options: ['pH 1', 'pH 4', 'pH 7', 'pH 9'], answer: 3,
    explain: 'Acids are below pH 7 and alkalis are above it. Adding an alkali (like baking-soda solution, about pH 9) pulls the pH up towards 7, which is neutral. pH 7 water would only dilute the acid.'},
   older: {q: 'Universal indicator in the trigger shows red (pH 2). We add baking soda a little at a time. Which colour change shows it is neutral?', options: ['Red → green', 'Red → yellow', 'Green → red', 'Red → purple'], answer: 0,
    explain: 'Universal indicator is red for strong acids, green at pH 7 (neutral) and blue or purple for alkalis. Red → yellow is still acidic, and purple would mean we added too much alkali.'},
   adult: {q: 'The acid is at pH 2. Each step down the pH scale means ten times more hydrogen ions. How many times more hydrogen ions does pH 2 have than pH 5?', options: ['3', '30', '300', '1,000'], answer: 3,
    explain: 'Three steps on the pH scale is 10 × 10 × 10 = 1,000 times. The pH scale is logarithmic, which is why a small change in pH is a big change in acidity.'}},
  3: {
   mid: {q: 'Baking soda fizzes when it meets the acid. Which gas makes the bubbles?', options: ['Oxygen', 'Carbon dioxide', 'Hydrogen', 'Helium'], answer: 1,
    explain: 'Baking soda is sodium hydrogencarbonate. With an acid it makes a salt, water and carbon dioxide gas, which makes the fizz.'},
   older: {q: 'Complete the word equation: hydrochloric acid + sodium hydroxide → sodium chloride + ?', options: ['Water', 'Hydrogen', 'Oxygen', 'Chlorine'], answer: 0,
    explain: 'Acid + alkali → salt + water. Here the salt is sodium chloride (table salt).'},
   adult: {q: 'In neutralisation, one H⁺ from the acid joins one OH⁻ from the alkali to make one water molecule. The acid holds 0.02 moles of H⁺. How many moles of OH⁻ neutralise it exactly?', options: ['0.01 mol', '0.02 mol', '0.04 mol', '0.2 mol'], answer: 1,
    explain: 'They react one-to-one (H⁺ + OH⁻ → H₂O), so 0.02 mol of H⁺ needs exactly 0.02 mol of OH⁻.'}},
  5: {
   mid: {q: 'The timer is on one loop of wire with a switch. Which switch position stops the current?', options: ['Open — it makes a gap', 'Closed — it joins the loop', 'Either, it makes no difference', 'Half-way'], answer: 0,
    explain: 'An open switch makes a gap in the loop, so current cannot flow. A closed switch completes the loop.'},
   older: {q: 'We cut the wire, making a gap in the series circuit. What current flows through the timer now?', options: ['0 A — no current', 'The same as before', 'Twice as much', 'Half as much'], answer: 0,
    explain: 'A series circuit has only one path. A gap anywhere breaks it, so the current everywhere drops to zero.'},
   adult: {q: 'Before cutting, we measure: the timer draws 0.5 A from its 9 V battery. Using V = I × R, what is the timer’s resistance?', options: ['4.5 Ω', '9 Ω', '18 Ω', '0.5 Ω'], answer: 2,
    explain: 'R = V ÷ I = 9 ÷ 0.5 = 18 ohms.'}}};

 // ---- 2. Radio Silence (electricity) ----
 L.radio = {
  1: {
   mid: {q: 'Which of these would NOT work to join the broken wire?', options: ['Copper wire', 'Aluminium foil', 'A steel paper clip', 'A plastic straw'], answer: 3,
    explain: 'Copper, aluminium and steel are metals, and metals conduct electricity. Plastic is an insulator, so current cannot pass through it.'},
   older: {q: 'Why are the radio’s copper wires coated in plastic?', options: ['Plastic is an insulator, so the current stays in the wire and can’t shock you', 'Plastic conducts better than copper', 'Only to make the wires lighter', 'Only to stop them rusting'], answer: 0,
    explain: 'Copper carries the current; the plastic coat is an insulator that keeps the current in the wire and keeps fingers safe.'},
   adult: {q: 'A 2 m length of the copper wire has a resistance of 0.04 Ω. Resistance is proportional to length. What is the resistance of 6 m of the same wire?', options: ['0.012 Ω', '0.08 Ω', '0.12 Ω', '0.24 Ω'], answer: 2,
    explain: '6 m is three times as long as 2 m, so the resistance is three times bigger: 3 × 0.04 = 0.12 ohms.'}},
  2: {
   young: {q: 'Put the repair steps in a SAFE order.', items: ['Switch the power off', 'Join the wire', 'Close the panel', 'Switch the power on'],
    explain: 'Power off first, so nobody gets a shock. Only switch it back on when the panel is closed.'},
   older: {q: 'Order the repair steps safely.', items: ['Switch the power off', 'Open the radio panel', 'Test the wires are dead with the tester', 'Join the wire with copper', 'Wrap the join in insulating tape', 'Close the panel', 'Switch the power on'],
    explain: 'Switch off, open up, then TEST that the wires really are dead before touching them. Insulate the join so no bare metal shows, and only switch on when everything is closed up.'},
   adult: {q: 'Order the repair steps safely and properly.', items: ['Switch the power off', 'Open the radio panel', 'Test the wires are dead with the tester', 'Join the wire with copper', 'Wrap the join in insulating tape', 'Close the panel', 'Switch the power on', 'Test the radio'],
    explain: 'Isolate, open up, prove it is dead, repair, insulate, close up, re-energise — and finally test that the repair works.'}},
  3: {
   mid: {q: 'The circuit is a complete loop again. What pushes the current round it?', options: ['The battery', 'The bulb', 'The plastic coat', 'The panel'], answer: 0,
    explain: 'The battery is the power source: it pushes the current round the loop. The bulb uses the energy.'},
   older: {q: 'The repaired circuit has a 6 V battery and a total resistance of 12 Ω. What current flows? (I = V ÷ R)', options: ['0.5 A', '2 A', '6 A', '72 A'], answer: 0,
    explain: 'I = V ÷ R = 6 ÷ 12 = 0.5 amps.'},
   adult: {q: 'The radio uses 3 W of power from its 6 V supply. What current does it draw? (power = voltage × current)', options: ['0.5 A', '2 A', '18 A', '0.2 A'], answer: 0,
    explain: 'Current = power ÷ voltage = 3 ÷ 6 = 0.5 amps.'}}};

 // ---- 3. The Stowaway (biology) ----
 L.stowaway = {
  1: {
   mid: {q: 'Its eyes are on the sides of its head, like a rabbit’s. What does that suggest?', options: ['It is hunted — it needs to see danger all round', 'It is a hunter', 'It cannot see', 'It lives underground'], answer: 0,
    explain: 'Prey animals often have eyes on the sides of the head for a wide view. Hunters usually have forward-facing eyes to judge distance.'},
   older: {q: 'It has flat, grinding teeth and eyes on the sides of its head. Which word best describes it?', options: ['Herbivore', 'Carnivore', 'Decomposer', 'Producer'], answer: 0,
    explain: 'Flat teeth grind plants and side-facing eyes watch for predators: a herbivore. Producers are plants; decomposers break down dead things.'},
   adult: {q: 'It eats 2% of its body mass in plants every day, and its mass is 15 kg. How much food does it need for a week?', options: ['0.3 kg', '2.1 kg', '3 kg', '21 kg'], answer: 1,
    explain: '2% of 15 kg is 0.3 kg a day, and 0.3 × 7 = 2.1 kg a week.'}},
  2: {
   young: {q: 'Make a food chain, starting with where the energy comes from.', items: ['The Sun', 'Space grass', 'Our little alien'],
    explain: 'The Sun gives energy to plants, and plant-eaters get their energy by eating plants.'},
   older: {q: 'Arrange the food chain from the source of energy.', items: ['The Sun', 'Space grass', 'Our little alien', 'A space snake', 'A big space owl'],
    explain: 'Energy flows from the Sun to the producer (grass), then to each consumer in turn: the alien, the snake that eats it, and the owl at the top.'},
   adult: {q: 'Arrange the food chain from the source of energy. (Only about a tenth of the energy passes on at each step.)', items: ['The Sun', 'Space grass', 'Our little alien', 'A space snake', 'A big space owl'],
    explain: 'Sun → producer → primary, secondary and tertiary consumers. With only about 10% passing on each time, the owl gets roughly 1/1,000 of the grass’s energy — which is why top predators are rare.'}},
  3: {
   mid: {q: 'Pick the THREE signs that something is alive.', options: ['It grows', 'It needs food', 'It breathes', 'It is shiny', 'It is heavy'], answer: [0, 1, 2],
    explain: 'Living things grow, need food (nutrition) and breathe (respire). Shiny and heavy things can be lifeless rocks!'},
   older: {q: 'Select the THREE life processes from this list.', options: ['Respiration', 'Excretion', 'Reproduction', 'Evaporation', 'Magnetism'], answer: [0, 1, 2],
    explain: 'The seven life processes (MRS GREN) are movement, respiration, sensitivity, growth, reproduction, excretion and nutrition. Evaporation and magnetism happen to non-living things too.'},
   adult: {q: 'Our stowaway breathes 15 times a minute. Select the THREE true statements.', options: ['That is 900 breaths an hour', 'That is 21,600 breaths a day', 'It takes a breath every 4 seconds', 'That is 1,500 breaths an hour', 'It takes a breath every 15 seconds'], answer: [0, 1, 2],
    explain: '15 × 60 = 900 an hour; 900 × 24 = 21,600 a day; and 60 ÷ 15 = 4 seconds between breaths.'}}};

 // ---- 4. The Black-Hole Time-Warp (space, physics) ----
 L.timewarp = {
  2: {
   mid: {q: 'Which planet is third from the Sun?', options: ['Mars', 'Earth', 'Jupiter', 'Venus'], answer: 1,
    explain: 'Mercury, Venus, Earth — Earth is third. Mars is fourth and Jupiter fifth.'},
   older: {q: 'Sunlight takes about 8 minutes to reach this blue planet, the third from its star. Which planet is it?', options: ['Mars', 'Earth', 'Jupiter', 'Venus'], answer: 1,
    explain: 'Earth is the third planet; sunlight takes about 8 minutes 20 seconds to get here. Light takes about 6 minutes to Venus and over 12 to Mars.'},
   adult: {q: 'It must be Earth: light from its star takes 8.3 minutes to arrive, and light travels about 300,000 km every second. Roughly how far is Earth from the Sun?', options: ['15 million km', '150 million km', '1.5 billion km', '15 billion km'], answer: 1,
    explain: '8.3 minutes is about 500 seconds, and 500 × 300,000 km = 150,000,000 km — 150 million kilometres.'}},
  6: {
   mid: {q: 'To get home we will fall towards the Sun to speed up. Which force pulls us towards it?', options: ['Gravity', 'Magnetism', 'Friction', 'Wind'], answer: 0,
    explain: 'Gravity pulls everything with mass together. Falling towards the Sun, gravity speeds us up — a gravity slingshot.'},
   adult: {q: 'In a slingshot, a probe falls past a planet and speeds up from 10 km/s to 16 km/s. By what percentage did its speed increase?', options: ['16%', '37.5%', '60%', '160%'], answer: 2,
    explain: 'It gained 6 km/s on 10 km/s: 6 ÷ 10 = 0.6, which is 60%. (37.5% is 6 ÷ 16, the wrong way round.)'}}};

 // ---- 5. First Contact (maths, computing) — numbers change every time ----
 L.contact = {
  1: {
   young: () => { const s = pick([2, 3, 5, 10]), a = R(1, 6), seq = [0, 1, 2, 3].map(k => a + k * s);
    return {q: `The alien lights flash ${seq.join(', ')}… Each time they add the same number. What comes next?`, answer: String(a + 4 * s), explain: `Each number is ${s} more than the one before, so after ${seq[3]} comes ${seq[3]} + ${s} = ${a + 4 * s}.`}; },
   mid: () => { const n = R(5, 8), seq = PRIMES.slice(0, n);
    return {q: `Count the flashes: ${seq.join(', ')}… these are prime numbers. Which prime comes next?`, answer: String(PRIMES[n]), explain: `Prime numbers can only be divided by 1 and themselves. After ${seq[n - 1]} the next prime is ${PRIMES[n]}.`}; },
   older: () => { const i = R(7, 11);
    return {q: `The flashes are the prime numbers. They have reached ${PRIMES[i]}. What is the next prime?`, answer: String(PRIMES[i + 1]), explain: `Check each number after ${PRIMES[i]}: the first one with no factors except 1 and itself is ${PRIMES[i + 1]}.`}; },
   adult: () => { const n = R(9, 14);
    return {q: `The aliens flash the prime numbers in order, starting 2, 3, 5, 7… What is the ${n}th prime?`, answer: String(PRIMES[n - 1]), explain: `In order: ${PRIMES.slice(0, n).join(', ')}. The ${n}th is ${PRIMES[n - 1]}.`}; }},
  2: {
   young: () => { const n = R(1, 3);
    return {q: `Now two lamps: ${n >> 1 ? 'ON' : 'off'}, ${n & 1 ? 'ON' : 'off'} — that is ${bin(n, 2)} in binary (twos, ones). What number is that?`, answer: String(n), explain: `In binary the places are twos and ones: ${n ? placeSum(n, 2) : '0'}.`}; },
   mid: () => { const n = R(3, 7);
    return {q: `Three lamps show ${bin(n, 3)} in binary (fours, twos, ones). What number is that?`, answer: String(n), explain: `${placeSum(n, 3)}. Computers store every number this way.`}; },
   older: () => { const n = R(17, 31);
    return {q: `Five lamps show ${bin(n, 5)} in binary (16s, 8s, 4s, 2s, 1s). What number is that?`, answer: String(n), explain: `${placeSum(n, 5)}.`}; },
   adult: () => { const n = R(129, 255);
    return {q: `Eight lamps show ${bin(n, 8)} in binary. Each place is worth double the one to its right (…, 4, 2, 1). What number is that?`, answer: String(n), explain: `${placeSum(n, 8)}.`}; }},
  3: {
   mid: {q: 'They flashed 2, 3, 5, 7, 11, 13. Which reply shows we understood?', options: ['Flash 17', 'Flash 14', 'Flash 15', 'Flash 12'], answer: 0,
    explain: '17 is the next prime after 13. 14, 15 and 12 can all be divided by other numbers.'},
   older: {q: 'Which reply proves we understand primes? Flash a number that is prime:', options: ['37', '39', '49', '51'], answer: 0,
    explain: '37 is prime. 39 = 3 × 13, 49 = 7 × 7 and 51 = 3 × 17.'},
   adult: {q: 'We reply with one more prime to be sure. Which of these is the only prime?', options: ['91', '87', '97', '93'], answer: 2,
    explain: '97 is prime. 91 = 7 × 13, 87 = 3 × 29 and 93 = 3 × 31 — tricky ones, because they look prime.'}}};

 // ---- 6. Planet-Killer (physics, space) ----
 L.planetkiller = {
  1: {
   older: {q: 'Our push changes the asteroid’s speed by just 1 cm per second. How far off course has it drifted after one day (86,400 seconds)?', options: ['8.64 m', '86.4 m', '864 m', '8,640 m'], answer: 2,
    explain: '1 cm/s × 86,400 s = 86,400 cm = 864 m — almost a kilometre a day from a tiny nudge. That is why pushing early works.'},
   adult: {q: 'A nudge of 1 cm/s, made 10 years before impact. Ignoring orbits, roughly how far off course will it be? (1 year ≈ 31.5 million seconds)', options: ['315 km', '3,150 km', '31,500 km', '31.5 km'], answer: 1,
    explain: '0.01 m/s × 315,000,000 s = 3,150,000 m = 3,150 km — about half of Earth’s radius, enough to miss.'}},
  2: {
   older: {q: 'Gravity gets weaker with distance (an inverse square law). If our ship doubles its distance from the asteroid, its pull becomes…', options: ['Half as strong', 'A quarter as strong', 'Twice as strong', 'The same'], answer: 1,
    explain: 'Inverse square: double the distance and the pull is 1 ÷ 2² = 1/4 as strong.'},
   adult: {q: 'Gravity follows an inverse square law. If we fly 3 times closer to the asteroid, how many times stronger is the pull?', options: ['3', '6', '9', '27'], answer: 2,
    explain: 'The pull goes as 1 ÷ distance², so a third of the distance gives 3² = 9 times the pull.'}}};

 // ---- 7. Gravity Gone (physics, maths) ----
 L.gravity = {
  1: {
   older: {q: 'An astronaut has a mass of 70 kg on Earth. What is her mass on the Moon?', options: ['70 kg', '11.7 kg', '420 kg', '0 kg'], answer: 0,
    explain: 'Mass is the amount of matter, so it is 70 kg anywhere. Her WEIGHT on the Moon is about a sixth of her Earth weight.'},
   adult: {q: 'Weight = mass × g, and on Earth g ≈ 9.8 newtons per kilogram. What does a 70 kg astronaut weigh on Earth?', options: ['70 N', '686 N', '7.1 N', '6,860 N'], answer: 1,
    explain: '70 × 9.8 = 686 newtons. Weight is a force, measured in newtons; mass is measured in kilograms.'}},
  2: {
   older: {q: 'On Earth a feather falls slowly, but on the Moon it falls as fast as a hammer. Why?', options: ['There is no air on the Moon to slow it', 'The Moon’s gravity is stronger', 'Feathers are magnetic', 'The Moon is colder'], answer: 0,
    explain: 'On Earth, air resistance slows the light, fluffy feather. The Moon has no air, so only gravity acts and both fall together.'},
   adult: {q: 'On the Moon things fall with an acceleration of 1.6 m/s². Dropped from rest, how fast is the hammer moving after 2.5 seconds? (speed = acceleration × time)', options: ['0.64 m/s', '4 m/s', '6.4 m/s', '1.6 m/s'], answer: 1,
    explain: '1.6 × 2.5 = 4 metres per second.'}},
  3: {
   young: () => { const k = R(1, 5), w = 6 * k;
    return {q: `The Moon’s gravity is one sixth of Earth’s. A box weighs ${w} on Earth scales. What will it weigh on the Moon?`, answer: String(k), explain: `${w} ÷ 6 = ${k}. On the Moon everything weighs a sixth of its Earth weight.`}; },
   mid: () => { const k = R(5, 15), w = 6 * k;
    return {q: `Moon gravity is one sixth of Earth’s. Something weighing ${w} on Earth weighs how much on the Moon?`, answer: String(k), explain: `${w} ÷ 6 = ${k}.`}; },
   older: () => { const k = R(12, 25), w = 6 * k;
    return {q: `g on the Moon is g on Earth ÷ 6. What does a ${w} N weight become on the Moon, in newtons?`, answer: String(k), explain: `${w} ÷ 6 = ${k} N.`}; },
   adult: () => { const m = pick([25, 30, 40, 45, 50, 60, 75]);
    return {q: `On the Moon g = 1.6 newtons per kilogram. What does a ${m} kg box weigh there, in newtons? (weight = mass × g)`, answer: String(m * 16 / 10), explain: `${m} × 1.6 = ${m * 16 / 10} newtons.`}; }}};

 // ---- 8. Greenhouse Crisis (biology) ----
 L.greenhouse = {
  1: {
   mid: {q: 'Which THREE changes would help our greenhouse plants make more food?', options: ['More light', 'Enough water', 'More carbon dioxide', 'Louder music', 'Turning the lights off'], answer: [0, 1, 2],
    explain: 'Photosynthesis needs light, water and carbon dioxide; more of each (up to a point) means more food. Music does not help, and darkness stops it.'},
   older: {q: 'Select the THREE things that go INTO photosynthesis.', options: ['Light energy', 'Water', 'Carbon dioxide', 'Oxygen', 'Glucose'], answer: [0, 1, 2],
    explain: 'Carbon dioxide + water, using light energy → glucose + oxygen. Oxygen and glucose are what comes OUT.'},
   adult: {q: 'Select the TWO things photosynthesis PRODUCES.', options: ['Glucose (a sugar)', 'Oxygen', 'Carbon dioxide', 'Water', 'Nitrogen'], answer: [0, 1],
    explain: 'Carbon dioxide + water → glucose + oxygen. The plant keeps the glucose for energy and growth, and releases the oxygen.'}},
  2: {
   mid: {q: 'Why are leaves green?', options: ['They contain chlorophyll', 'They are painted', 'They soak up green light', 'They are wet'], answer: 0,
    explain: 'Chlorophyll traps red and blue light for photosynthesis and reflects green light, so leaves look green.'},
   older: {q: 'Which organ of the plant contains most of the chloroplasts?', options: ['The roots', 'The leaves', 'The flowers', 'The stem'], answer: 1,
    explain: 'Chloroplasts (full of chlorophyll) are packed into leaf cells, where the light is. Roots are underground and take in water.'},
   adult: {q: 'A leaf stores about 1% of the light energy that falls on it as sugar. If 500 J of light falls on it, how much is stored?', options: ['0.5 J', '5 J', '50 J', '495 J'], answer: 1,
    explain: '1% of 500 J = 500 ÷ 100 = 5 joules. Photosynthesis is surprisingly inefficient!'}},
  3: {
   mid: {q: 'We breathe out carbon dioxide. What do plants do with it?', options: ['Use it to make their food', 'Turn it into water', 'Store it in their roots for ever', 'Nothing'], answer: 0,
    explain: 'Plants take in carbon dioxide and use it, with water and light, to make sugar — and they give out oxygen for us.'},
   adult: {q: 'Photosynthesis uses 6 carbon dioxide molecules to make 1 sugar molecule, and releases 6 oxygen molecules. How many oxygen molecules are released while making 3 sugar molecules?', options: ['6', '12', '18', '36'], answer: 2,
    explain: '6 oxygen molecules per sugar, so 3 × 6 = 18.'}}};

 // ---- 9. Lights Out (electricity) ----
 L.lights = {
  1: {
   older: {q: 'Three identical bulbs are in series on a 12 V supply. What is the voltage across each bulb?', options: ['4 V', '12 V', '36 V', '3 V'], answer: 0,
    explain: 'In series the supply voltage is shared: 12 V ÷ 3 identical bulbs = 4 V each.'},
   adult: {q: 'Three 4 Ω bulbs in series on a 12 V supply. Resistances in series add up. What current flows? (I = V ÷ R)', options: ['1 A', '3 A', '4 A', '48 A'], answer: 0,
    explain: 'Total resistance 4 + 4 + 4 = 12 Ω, so I = 12 ÷ 12 = 1 amp.'}},
  2: {
   older: {q: 'In a parallel circuit with a 12 V battery, what voltage does each bulb get?', options: ['12 V', '4 V', '6 V', '0 V'], answer: 0,
    explain: 'In parallel every branch connects straight across the battery, so each bulb gets the full 12 V — and stays lit if another breaks.'},
   adult: {q: 'Three identical 6 Ω bulbs in parallel. For identical parallel branches, divide one resistance by how many there are. What is the combined resistance?', options: ['18 Ω', '6 Ω', '2 Ω', '0.5 Ω'], answer: 2,
    explain: '6 ÷ 3 = 2 ohms. More parallel paths make it easier for current to flow, so the total resistance goes down.'}},
  3: {
   young: () => { const a = R(2, 5), b = R(2, 5);
    return {q: `We have ${a} corridors with ${b} bulbs each. How many new bulbs do we need?`, answer: String(a * b), explain: `${a} × ${b} = ${a * b} bulbs.`}; },
   mid: () => { const a = R(3, 9), b = R(4, 12);
    return {q: `${a} corridors × ${b} bulbs each = how many bulbs?`, answer: String(a * b), explain: `${a} × ${b} = ${a * b}.`}; },
   older: () => { const a = R(4, 9), b = R(3, 8), c = pick([4, 5, 6, 8, 12]);
    return {q: `Each of ${a} corridors needs ${b} bulbs, and each bulb costs ${c} Cr. What is the total cost in credits?`, answer: String(a * b * c), explain: `${a} × ${b} = ${a * b} bulbs, and ${a * b} × ${c} = ${a * b * c} Cr.`}; },
   adult: () => { const n = R(12, 30), p = pick([5, 10, 12]), h = R(2, 10);
    return {q: `${n} new bulbs, each using ${p} W, stay on for ${h} hours. How many watt-hours of energy do they use? (energy = power × time)`, answer: String(n * p * h), explain: `${n} × ${p} W = ${n * p} W in total, and ${n * p} × ${h} h = ${n * p * h} Wh.`}; }}};

 // ---- 10. The Locked Armoury (computing, maths) — numbers change every time ----
 L.armoury = {
  1: {
   young: () => { const n = R(3, 7);
    return {q: `The code is ${bin(n, 3)}. The places mean fours, twos and ones. What number is it?`, answer: String(n), explain: `${placeSum(n, 3)}.`}; },
   mid: () => { const n = R(9, 15);
    return {q: `Convert the binary code ${bin(n, 4).replace(/ /g, '')} into a normal number. (Places: 8, 4, 2, 1)`, answer: String(n), explain: `${placeSum(n, 4)}.`}; },
   older: () => { const n = R(33, 63);
    return {q: `Convert ${bin(n, 6).replace(/ /g, '')} (base 2) to decimal.`, answer: String(n), explain: `Places 32, 16, 8, 4, 2, 1: ${placeSum(n, 6)}.`}; },
   adult: () => { let n; do n = R(26, 250); while (!/[A-F]/.test(n.toString(16).toUpperCase())); const h = n.toString(16).toUpperCase(), dv = d => parseInt(d, 16), say = d => /[A-F]/.test(d) ? `${d} is ${dv(d)}` : '';
    return {q: `The lock uses hexadecimal: A = 10, B = 11 … F = 15, and the left digit is worth 16 times the right. What is ${h} in decimal?`, answer: String(n), explain: `${[say(h[0]), say(h[1])].filter(Boolean).join(' and ')}, so ${dv(h[0])} × 16 + ${dv(h[1])} = ${n}.`}; }},
  2: {
   young: {q: 'Put the robot’s instructions in the right order.', items: ['Read the code', 'Check the code is right', 'Open the door'],
    explain: 'You have to read the code and check it BEFORE the door opens.'},
   older: {q: 'Sequence the lock’s algorithm correctly.', items: ['Wake up the lock', 'Read the code', 'Compare it with the stored code', 'Unlock the bolt', 'Open the door', 'Lock it again after use'],
    explain: 'Input (read), process (compare), then output (unlock, open) — and finally make it secure again.'},
   adult: {q: 'Put the lock’s full algorithm in order, from waking up to safely locked again.', items: ['Wake up the lock', 'Read the code', 'Compare it with the stored code', 'Unlock the bolt', 'Open the door', 'Close the door', 'Lock the bolt again'],
    explain: 'Input (read), process (compare), output (unlock, open) — and the door must be closed before the bolt can lock it again, returning to a secure state.'}},
  3: {
   young: {q: 'The robot starts facing forwards. “REPEAT 2 times: turn right a quarter turn.” Which way is it facing now?', options: ['Backwards', 'Forwards', 'Left', 'Right'], answer: 0,
    explain: 'Two quarter turns make a half turn, so it faces backwards.'},
   older: {q: 'A loop runs “turn 90° right” three times. The robot started facing north. Which way does it face now?', options: ['North', 'East', 'South', 'West'], answer: 3,
    explain: '3 × 90° = 270° clockwise: north → east → south → west.'},
   adult: {q: 'A loop runs “turn 135° right” seven times, starting facing north. Which way does the robot face at the end?', options: ['North-east', 'South', 'South-west', 'West'], answer: 2,
    explain: '7 × 135° = 945°. Take away full turns: 945 − 720 = 225° clockwise from north, which is south-west.'}}};

 // ---- 11. Frozen Pipes (states of matter) ----
 L.frozen = {
  1: {
   mid: {q: 'Put these in order of temperature, coldest first.', items: ['Ice at −10 °C', 'Melting ice at 0 °C', 'Warm water at 50 °C', 'Boiling water at 100 °C'],
    explain: 'Negative temperatures are below freezing; ice melts at 0 °C and water boils at 100 °C.'},
   older: {q: 'Ice is heated steadily until it is all steam. Put what happens in order.', items: ['The ice warms up', 'The ice melts at 0 °C', 'The water warms up', 'The water boils at 100 °C', 'The steam warms up'],
    explain: 'The temperature rises, then stays at 0 °C while the ice melts, rises again, then stays at 100 °C while the water boils, and only then does the steam get hotter.'},
   adult: {q: 'Order these temperatures from coldest to hottest. (°F = °C × 1.8 + 32)', items: ['−40 °F', '−20 °C', '0 °F', '0 °C', '40 °F'],
    explain: 'In °C they are: −40 °F = −40 °C, −20 °C, 0 °F ≈ −17.8 °C, 0 °C, and 40 °F ≈ 4.4 °C. (−40 is the one temperature that is the same on both scales.)'}},
  2: {
   mid: {q: 'At what temperature, in °C, does water boil at sea level?', answer: '100',
    explain: 'Water boils at 100 °C and freezes at 0 °C — that is how the Celsius scale was set up.'},
   older: () => { const r = R(2, 5), k = R(3, 8), t = r * k;
    return {q: `The ice in the pipe is at −${t} °C. The heater warms it by ${r} °C every minute. How many minutes until it reaches 0 °C and starts to melt?`, answer: String(k), explain: `It has to rise ${t} degrees, at ${r} degrees a minute: ${t} ÷ ${r} = ${k} minutes.`}; },
   adult: () => { const c = pick([-10, -5, 5, 10, 15, 20, 25, 30, 35, 40]), f = Math.round(c * 1.8 + 32);
    return {q: `The pipe sensor reads ${String(c).replace('-', '−')} °C, but the old heater dial is in °F. What is that in °F? (°F = °C × 1.8 + 32)`, answer: String(f), explain: `${String(c).replace('-', '−')} × 1.8 = ${String(Math.round(c * 1.8)).replace('-', '−')}, and adding 32 gives ${f} °F.`}; }},
  3: {
   mid: {q: 'Why do frozen water pipes sometimes burst?', options: ['Water expands when it freezes', 'Ice is hot', 'Pipes grow in the cold', 'Ice is sticky'], answer: 0,
    explain: 'Unusually, water takes up about 9% more space as ice. Trapped in a pipe, the expanding ice can split it.'},
   older: {q: 'While ice melts, it takes in energy but stays at 0 °C until it has all melted. What is that energy called?', options: ['Latent heat', 'Kinetic heat', 'Static energy', 'Nuclear energy'], answer: 0,
    explain: 'Latent (“hidden”) heat breaks the bonds holding the ice together instead of raising the temperature.'},
   adult: {q: 'Melting ice takes 334 joules for every gram. How much energy melts the 50 g plug of ice in the pipe?', options: ['6.7 kJ', '16.7 kJ', '33.4 kJ', '167 kJ'], answer: 1,
    explain: '334 × 50 = 16,700 J, which is 16.7 kilojoules.'}}};

 // ---- 12. The Comet Chase (space) ----
 L.comet = {
  1: {
   mid: {q: 'Why does a comet grow a glowing tail when it gets near the Sun?', options: ['Its ice turns to gas and dust streams off', 'It catches fire', 'It is pulled by Earth', 'It switches its lights on'], answer: 0,
    explain: 'Far from the Sun a comet is a frozen lump. Near the Sun its ice turns to gas, carrying dust with it, and sunlight makes the tail glow.'},
   older: {q: 'A comet’s ice turns straight into gas without melting first. What is that change called?', options: ['Sublimation', 'Condensation', 'Melting', 'Freezing'], answer: 0,
    explain: 'Sublimation is solid → gas with no liquid in between. Dry ice does it on Earth too.'},
   adult: {q: 'A comet comes back every 6 years. It was last here in 2023. How many times will it return before the year 2050?', options: ['3', '4', '5', '6'], answer: 1,
    explain: 'It returns in 2029, 2035, 2041 and 2047 — four times. The next, 2053, is after 2050.'}},
  2: {
   mid: {q: 'What pushes a comet’s tail away from the Sun?', options: ['Sunlight and the solar wind', 'The comet’s engine', 'Earth’s gravity', 'Nothing — it trails behind'], answer: 0,
    explain: 'The pressure of sunlight and the stream of particles from the Sun (the solar wind) blow the tail outwards.'},
   older: {q: 'Our comet is now heading AWAY from the Sun. Which way does its tail point?', options: ['Ahead of it — still away from the Sun', 'Behind it, the way it came', 'Towards the Sun', 'Downwards'], answer: 0,
    explain: 'The tail always points away from the Sun, whichever way the comet moves, so on the way out the tail goes first.'},
   adult: {q: 'Sunlight takes 8 minutes to reach Earth, which is 1 AU from the Sun. The comet is 3 AU from the Sun. How long does sunlight take to reach it?', options: ['8 minutes', '16 minutes', '24 minutes', '72 minutes'], answer: 2,
    explain: 'Three times the distance takes three times as long: 3 × 8 = 24 minutes.'}}};

 // ---- 13. Lost in the Nebula (light, space) ----
 L.nebula = {
  1: {
   mid: {q: 'Light from the nebula takes 3 years to reach us. How far away is it?', options: ['3 light years', '3 years old', '3 kilometres', '300 light years'], answer: 0,
    explain: 'A light year is the distance light goes in a year, so light taking 3 years means 3 light years away.'},
   older: {q: 'Light travels about 300,000 km every second. Roughly how far does it go in one minute?', options: ['18 million km', '5,000 km', '300,000 km', '1.8 billion km'], answer: 0,
    explain: '300,000 × 60 = 18,000,000 km — 18 million kilometres in a minute.'},
   adult: {q: 'A light year is about 9.5 million million km. The nebula is 1,300 light years away. Roughly how far is that?', options: ['About 12 million million km', 'About 1,200 million million km', 'About 12,000 million million km', 'About 120,000 million million km'], answer: 2,
    explain: '1,300 × 9.5 = 12,350, so about 12,000 million million km (1.2 × 10¹⁶ km).'}},
  2: {
   mid: {q: 'A nebula is a giant cloud. What is it made of?', options: ['Gas and dust', 'Water vapour from oceans', 'Smoke from fires', 'Cotton wool'], answer: 0,
    explain: 'Nebulae are vast clouds of gas (mostly hydrogen) and dust. New stars are born in them.'},
   adult: {q: 'Glowing hydrogen gives off red light with a wavelength of 656 nanometres (a nanometre is a billionth of a metre). About how many of those waves fit in 1 millimetre?', options: ['About 15', 'About 150', 'About 1,500', 'About 15,000'], answer: 2,
    explain: '1 mm is 1,000,000 nm, and 1,000,000 ÷ 656 ≈ 1,524 — about 1,500 waves.'}}};

 // ---- 14. The Sleeping Ship (codes, survival) — the coded word changes every time ----
 const caesar = (w, n) => w.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 + n) % 26 + 65));
 const codeQ = (words, n) => { const w = pick(words), others = words.filter(x => x !== w).sort(() => Math.random() - .5).slice(0, 3), options = [w, ...others].sort(() => Math.random() - .5), enc = caesar(w, n);
  return {q: `The message is ${enc}. Each letter has been moved ${n} place${n > 1 ? 's' : ''} on in the alphabet (Z wraps round to A). What does it say?`, options, answer: options.indexOf(w),
   explain: `Move each letter back ${n}: ${enc[0]} → ${w[0]}, ${enc[1]} → ${w[1]}… It spells ${w}. This is a Caesar cipher, one of the oldest codes.`}; };
 L.sleeper = {
  1: {
   young: () => codeQ(['HELP', 'SAFE', 'WAKE', 'FOOD', 'HOME', 'STOP'], 1),
   mid: () => codeQ(['WATER', 'SLEEP', 'RADIO', 'LIGHT', 'SPACE', 'DREAM'], 2),
   older: () => codeQ(['RESCUE', 'OXYGEN', 'ESCAPE', 'FRIEND', 'SIGNAL', 'ROCKET'], 3),
   adult: () => codeQ(['MAYDAY', 'AWAKEN', 'CAPTAIN', 'ENGINES', 'SHUTTLE', 'BEACONS'], 13)},
  3: {
   mid: {q: 'Before we open the sleep pods, which THREE things should we check?', options: ['There is enough oxygen in the air', 'The temperature is safe', 'Food and water are ready', 'The music is loud', 'The paint is dry'], answer: [0, 1, 2],
    explain: 'Air, warmth, food and water keep people alive. Music and paint can wait!'},
   older: {q: 'Respiration releases energy in our cells. Select the TWO things it uses up.', options: ['Oxygen', 'Glucose (sugar)', 'Carbon dioxide', 'Nitrogen', 'Salt'], answer: [0, 1],
    explain: 'Glucose + oxygen → carbon dioxide + water, releasing energy. Carbon dioxide is made, not used.'},
   adult: {q: 'Each sleeper needs about 2.5 litres of water a day, and there are 6 of them. Select the THREE true statements.', options: ['They need 15 litres a day', 'They need 105 litres a week', 'They need 450 litres for 30 days', 'They need 50 litres a day', 'They need 1,000 litres a week'], answer: [0, 1, 2],
    explain: '6 × 2.5 = 15 litres a day; × 7 = 105 a week; × 30 = 450 litres for 30 days.'}}};

 // ---- 15. Solar Storm (space) ----
 L.storm = {
  1: {
   mid: {q: 'The Sun is a star. Why does it look so much bigger and brighter than the other stars?', options: ['It is much closer to us', 'It is the biggest star there is', 'The other stars are tiny', 'It is really a planet'], answer: 0,
    explain: 'The Sun is an ordinary star; it looks huge because it is so close. Many stars are bigger, but they are very far away.'},
   older: {q: 'Which process makes the Sun shine?', options: ['Nuclear fusion of hydrogen into helium', 'Burning coal', 'Reflecting light from the planets', 'Electricity'], answer: 0,
    explain: 'In the Sun’s core, hydrogen nuclei fuse to make helium, releasing huge amounts of energy.'},
   adult: {q: 'The Sun turns about 4 million tonnes of matter into energy every second. Roughly how much in one hour?', options: ['240 million tonnes', '1.4 billion tonnes', '14.4 billion tonnes', '144 billion tonnes'], answer: 2,
    explain: '4 million × 3,600 seconds = 14,400 million tonnes = 14.4 billion tonnes an hour — and the Sun has enough to last billions of years.'}},
  2: {
   mid: {q: 'Why does hiding behind the planet protect us?', options: ['The planet blocks the Sun’s particles, just as it blocks sunlight', 'The planet is warm', 'The planet pulls the storm into it', 'It doesn’t — nowhere is safe'], answer: 0,
    explain: 'The storm’s particles travel out from the Sun in straight lines. A planet in the way blocks them, leaving a safe “shadow”.'},
   older: {q: 'Earth’s magnetic field steers solar storm particles towards the poles. What do people see there?', options: ['Aurorae (the northern and southern lights)', 'Rainbows', 'Eclipses', 'Shooting stars'], answer: 0,
    explain: 'The particles hit gases high in the air near the poles and make them glow: the aurora.'},
   adult: {q: 'The storm’s particles travel at about 500 km per second, and the Sun is 150 million km from the planet. Roughly how long until they arrive?', options: ['About 8 minutes', 'About 3.5 hours', 'About 3.5 days', 'About 3.5 weeks'], answer: 2,
    explain: '150,000,000 ÷ 500 = 300,000 seconds, which is about 83 hours — roughly 3.5 days. Light does the trip in about 8 minutes.'}}};

 // ---- 16. Oxygen Leak (air, breathing) ----
 L.oxygen = {
  1: {
   mid: {q: 'Which gas do we breathe OUT more of than we breathe in?', options: ['Carbon dioxide', 'Oxygen', 'Helium', 'Hydrogen'], answer: 0,
    explain: 'Our bodies use oxygen and make carbon dioxide, so the air we breathe out has more carbon dioxide and less oxygen.'},
   older: {q: 'Glucose + oxygen → carbon dioxide + water, releasing energy. What is this process called?', options: ['Respiration', 'Photosynthesis', 'Evaporation', 'Condensation'], answer: 0,
    explain: 'Respiration happens in every cell, releasing energy from food. Photosynthesis is the opposite process, in plants.'},
   adult: {q: 'At rest, a person breathes about 6 litres of air a minute, and air is about 21% oxygen. How many litres of oxygen go into their lungs each minute?', options: ['0.6 litres', '1.26 litres', '2.1 litres', '4.7 litres'], answer: 1,
    explain: '21% of 6 = 0.21 × 6 = 1.26 litres. (The body only uses about a quarter of that — the rest is breathed out again.)'}},
  2: {
   mid: {q: 'Why do bubbles in soapy water show us where the leak is?', options: ['Air escaping from the pipe blows the soapy water into bubbles', 'Soap is attracted to holes', 'Bubbles are made by the pipe', 'The light shines through the hole'], answer: 0,
    explain: 'Escaping air pushes into the soapy film and blows bubbles exactly where the hole is.'},
   older: {q: 'The cabin pressure dropped from 100 kPa to 94 kPa in 3 hours. If it keeps falling at the same rate, what will it be after 5 hours?', options: ['90 kPa', '92 kPa', '94 kPa', '85 kPa'], answer: 0,
    explain: 'It falls 6 kPa in 3 hours, which is 2 kPa an hour. After 5 hours: 100 − 5 × 2 = 90 kPa.'},
   adult: {q: 'The cabin loses 1.5% of the air that is left every hour. After 2 hours, roughly what percentage is left?', options: ['97.0%', '97.5%', '98.5%', '96.0%'], answer: 0,
    explain: 'Each hour multiplies what is left by 0.985: 0.985 × 0.985 = 0.970, so about 97.0% is left (a little more than the 97% you would get by simply taking away 3%).'}},
  3: {
   older: {q: 'Air is about 78% nitrogen and 21% oxygen. What percentage is everything else?', options: ['1%', '11%', '21%', '0%'], answer: 0,
    explain: '100 − 78 − 21 = 1%. That last 1% is mostly argon, with a little carbon dioxide.'},
   adult: {q: 'Our cabin holds 50,000 litres of air, and about 21% of air is oxygen. How many litres of oxygen is that?', options: ['1,050', '10,500', '21,000', '39,000'], answer: 1,
    explain: '21% of 50,000 = 0.21 × 50,000 = 10,500 litres.'}}};

 // ---- 17. Mystery Illness (health) ----
 L.medbay = {
  1: {
   mid: {q: 'Antibiotics are medicines that kill one kind of microbe but not the other. Which kind do they kill?', options: ['Bacteria', 'Viruses', 'Both', 'Neither'], answer: 0,
    explain: 'Antibiotics kill bacteria. They do not work on viruses, such as the ones that cause colds — which is why doctors don’t give antibiotics for a cold.'},
   older: {q: 'These bacteria split in two every 20 minutes. Starting with one, how many will there be after 2 hours?', options: ['12', '32', '64', '120'], answer: 2,
    explain: '2 hours is 6 lots of 20 minutes, so it doubles 6 times: 2⁶ = 64.'},
   adult: {q: 'The bacteria double every 20 minutes. Starting from one, how long until there are more than 1,000?', options: ['1 hour', '2 hours', '3 hours 20 minutes', '10 hours'], answer: 2,
    explain: '2¹⁰ = 1,024 is the first power of 2 over 1,000, so it takes 10 doublings: 10 × 20 = 200 minutes = 3 hours 20 minutes.'}},
  2: {
   young: {q: 'Put the hand-washing steps in order.', items: ['Wet your hands', 'Add soap', 'Rinse', 'Dry them'],
    explain: 'Soap gets the germs off, rinsing washes them away, and drying finishes the job.'},
   older: {q: 'Put the steps for preparing food safely in order.', items: ['Wash your hands', 'Prepare the food', 'Cook it thoroughly', 'Serve it hot', 'Put leftovers in the fridge quickly'],
    explain: 'Clean hands first, cook food right through to kill microbes, and chill leftovers fast so microbes can’t multiply.'},
   adult: {q: 'We test what is making the crew ill. Put the steps of a fair scientific investigation in order.', items: ['Notice that the crew are ill', 'Ask a question: what is causing it?', 'Make a prediction', 'Test it with an experiment', 'Look at the results', 'Draw a conclusion'],
    explain: 'Observe, question, predict (a hypothesis), test, analyse, conclude — the scientific method.'}},
  3: {
   mid: {q: 'Why is it better to sneeze into your elbow than into your hand?', options: ['Your hands touch things and spread germs', 'Elbows are always clean', 'It is quieter', 'It only looks polite'], answer: 0,
    explain: 'Germs on your hands get onto door handles, food and other people. Your elbow doesn’t touch much.'},
   older: {q: 'A sneeze can travel 8 metres in 2 seconds. What is its average speed?', options: ['4 m/s', '10 m/s', '16 m/s', '6 m/s'], answer: 0,
    explain: 'Speed = distance ÷ time = 8 ÷ 2 = 4 metres per second.'},
   adult: {q: 'One crew member is ill. Each ill person passes the bug on to 3 others, who each pass it on to 3 more, and so on. How many people catch it in the third round of passing it on?', options: ['9', '27', '81', '3'], answer: 1,
    explain: 'First passing-on: 3 people catch it; second: 3 × 3 = 9; third: 9 × 3 = 27. That is why catching sneezes matters!'}}};

 // ---- 18. Magnetic Mayhem (magnets) ----
 L.magnets = {
  1: {
   mid: {q: 'Pick the TWO things a magnet will pick up.', options: ['An iron horseshoe', 'A steel paper clip', 'A gold ring', 'A copper wire', 'A glass marble'], answer: [0, 1],
    explain: 'Iron, and steel (which is mostly iron), are magnetic. Gold, copper and glass are not.'},
   older: {q: 'Select the THREE magnetic metals.', options: ['Iron', 'Nickel', 'Cobalt', 'Copper', 'Aluminium'], answer: [0, 1, 2],
    explain: 'Iron, nickel and cobalt are the three common magnetic metals. Copper and aluminium are not attracted to magnets.'},
   adult: {q: 'Select the TWO true statements about magnets.', options: ['Cut a bar magnet in half and you get two smaller magnets, each with a north and a south pole', 'A magnet’s pull gets weaker as you move away from it', 'Magnets attract all metals', 'Heating a magnet always makes it stronger', 'A magnet can have a north pole without a south pole'], answer: [0, 1],
    explain: 'Magnets always come with both poles, however small you cut them, and their pull fades with distance. Many metals (aluminium, gold) are not attracted, and heating weakens a magnet.'}},
  2: {
   older: {q: 'Two magnets push each other apart. What can you say about the poles facing each other?', options: ['They are the same (north–north or south–south)', 'They are opposite', 'One of them is not a magnet', 'They must both be south'], answer: 0,
    explain: 'Like poles repel and opposite poles attract. Pushing apart means the facing poles are alike — but they could both be north or both south.'},
   adult: {q: 'Between our two magnets, doubling the gap made the force 8 times weaker. Following the same pattern, how many times weaker will tripling the gap make it?', options: ['3', '9', '27', '81'], answer: 2,
    explain: '8 = 2³, so the force goes as 1 ÷ distance³. Tripling the gap gives 3³ = 27 times weaker.'}},
  3: {
   older: {q: 'A compass needle’s north end points towards Earth’s magnetic pole in the Arctic. Since opposite poles attract, what kind of magnetic pole is that really?', options: ['A magnetic south pole', 'A magnetic north pole', 'Not magnetic at all', 'It changes every day'], answer: 0,
    explain: 'The needle’s north pole is attracted to it, so it must be a magnetic SOUTH pole — even though we call it the North Magnetic Pole!'},
   adult: {q: 'Using the compass, you walk 300 m north and then 400 m east. How far are you, in a straight line, from where you started?', options: ['500 m', '700 m', '100 m', '350 m'], answer: 0,
    explain: 'Pythagoras: √(300² + 400²) = √(90,000 + 160,000) = √250,000 = 500 m.'}}};

 // ---- 19. The Shadow Puzzle (light) ----
 L.shadows = {
  1: {
   mid: {q: 'Why does an object make a shadow?', options: ['It blocks light, which travels in straight lines', 'It gives off darkness', 'Light bends round it', 'Shadows are made of dark gas'], answer: 0,
    explain: 'Light can’t go through an opaque object or bend round it, so a dark area — a shadow — forms behind it.'},
   older: {q: 'A 2 m pole casts a 3 m shadow. At the same moment, a mast casts a 12 m shadow. How tall is the mast?', options: ['6 m', '8 m', '18 m', '24 m'], answer: 1,
    explain: 'The mast’s shadow is 4 times as long (12 ÷ 3), so the mast is 4 times as tall: 4 × 2 = 8 m.'},
   adult: {q: 'A torch is 1 m from a 10 cm toy, and the wall is 3 m from the torch. How tall is the toy’s shadow on the wall?', options: ['20 cm', '30 cm', '40 cm', '3 cm'], answer: 1,
    explain: 'Similar triangles: the wall is 3 times as far from the torch as the toy, so the shadow is 3 × 10 = 30 cm tall.'}},
  2: {
   mid: {q: 'Which material is TRANSLUCENT — it lets some light through, but you can’t see clearly through it?', options: ['Frosted glass', 'Clear glass', 'A brick', 'A mirror'], answer: 0,
    explain: 'Translucent materials scatter the light that passes through. Clear glass is transparent; bricks and mirrors are opaque.'},
   older: {q: 'Light changes direction as it passes from air into glass. What is this called?', options: ['Refraction', 'Reflection', 'Absorption', 'Evaporation'], answer: 0,
    explain: 'Refraction: light slows down in glass, which bends its path. Reflection is light bouncing off.'},
   adult: {q: 'Light travels at about 300,000 km/s in space but only about 200,000 km/s in glass. How many times faster is it in space?', options: ['1.5', '2', '3', '100,000'], answer: 0,
    explain: '300,000 ÷ 200,000 = 1.5. (That ratio is glass’s refractive index.)'}},
  3: {
   mid: {q: 'The beam hits the mirror at 30° to the line straight out from the mirror. At what angle does it bounce off?', options: ['30°', '60°', '90°', '0°'], answer: 0,
    explain: 'Light leaves a mirror at the same angle it arrives: the angle of reflection equals the angle of incidence.'},
   older: {q: 'We need to turn the beam through a right angle with one flat mirror. At what angle should the beam hit the mirror’s surface?', options: ['30°', '45°', '60°', '90°'], answer: 1,
    explain: 'Hitting at 45° to the surface, it leaves at 45° on the other side: 45 + 45 = 90° turned.'},
   adult: {q: 'Two flat mirrors meet at a right angle, like the inside corner of a box. A beam hits one, then the other. Where does it go?', options: ['Straight back the way it came (parallel)', 'Off at a right angle', 'Straight on, as if no mirrors', 'It is trapped for ever'], answer: 0,
    explain: 'Each mirror reverses one direction, so after both the beam heads back parallel to how it came in. Astronauts left reflectors like this on the Moon for lasers from Earth.'}}};

 // ---- 20. The Echo Chamber (sound) ----
 L.echo = {
  1: {
   mid: {q: 'Through which of these does sound travel FASTEST?', options: ['Steel', 'Water', 'Air', 'Empty space'], answer: 0,
    explain: 'Sound travels fastest through solids like steel, slower through water, slower still through air — and not at all through empty space.'},
   older: {q: 'Out on a spacewalk, two astronauts can hear each other if they touch helmets. Why?', options: ['Sound travels through the solid helmets', 'Space carries sound after all', 'The glass is a radio', 'They are lip-reading'], answer: 0,
    explain: 'There is no air between them, but the vibrations can pass through the solid helmets that are touching.'},
   adult: {q: 'Sound travels at about 5,000 m/s in steel. A knock travels 100 m along the ship’s hull. How long does it take?', options: ['0.2 s', '0.02 s', '2 s', '0.002 s'], answer: 1,
    explain: 'Time = distance ÷ speed = 100 ÷ 5,000 = 0.02 seconds (20 milliseconds).'}},
  2: {
   mid: {q: 'A guitar string is tightened so it vibrates faster. What happens to the note?', options: ['It gets higher', 'It gets lower', 'It gets quieter', 'Nothing'], answer: 0,
    explain: 'Faster vibrations make a higher-pitched note. Slower vibrations sound lower.'},
   older: {q: 'The number of vibrations each second is called the frequency. What unit is it measured in?', options: ['Hertz (Hz)', 'Decibels (dB)', 'Metres', 'Newtons'], answer: 0,
    explain: 'Frequency is measured in hertz: 1 Hz is one vibration a second. Decibels measure loudness.'},
   adult: {q: 'A note vibrates 440 times a second. How many vibrations is that in 2.5 minutes?', options: ['1,100', '6,600', '66,000', '110,000'], answer: 2,
    explain: '2.5 minutes is 150 seconds, and 440 × 150 = 66,000 vibrations.'}},
  3: {
   mid: {q: 'You see lightning, then count 6 seconds before the thunder. Sound goes about 1 km every 3 seconds. How far away was it?', options: ['1 km', '2 km', '3 km', '6 km'], answer: 1,
    explain: '6 seconds ÷ 3 seconds per km = 2 km.'},
   older: {q: 'Sound travels at about 340 m/s. The thunder arrives 5 seconds after the flash. How far away was the lightning?', options: ['68 m', '340 m', '1,700 m', '3,400 m'], answer: 2,
    explain: 'Distance = speed × time = 340 × 5 = 1,700 m. The light arrives almost instantly.'},
   adult: {q: 'Thunder arrives 9 seconds after the lightning. Sound travels at 340 m/s, and the light takes almost no time. How far away was the strike, to the nearest 100 m?', options: ['2,700 m', '3,100 m', '3,400 m', '3,800 m'], answer: 1,
    explain: '340 × 9 = 3,060 m, which is 3,100 m to the nearest 100 m.'}}};

 // ---- 21. The Recycling Robot (materials) ----
 L.recycle = {
  1: {
   mid: {q: 'Which THREE should go in the compost bin, not the recycling?', options: ['Banana peel', 'Apple core', 'Tea leaves', 'Glass bottle', 'Aluminium can'], answer: [0, 1, 2],
    explain: 'Food waste rots down into compost for plants. Glass and cans go in the recycling to be melted and made into new things.'},
   older: {q: 'Select the THREE things that recycling helps to save.', options: ['Raw materials', 'Energy', 'Landfill space', 'Gravity', 'Daylight'], answer: [0, 1, 2],
    explain: 'Recycling means fewer new materials are mined, less energy is used making things from scratch, and less rubbish is buried.'},
   adult: {q: 'Recycling an aluminium can saves about 95% of the energy needed to make one from new ore. If a new can takes 200 units of energy, select the TWO true statements.', options: ['A recycled can takes about 10 units', 'Recycling saves about 190 units per can', 'A recycled can takes about 95 units', 'Recycling saves about 5 units per can', 'Both take the same energy'], answer: [0, 1],
    explain: '95% of 200 is 190 units saved, so the recycled can needs only 200 − 190 = 10 units.'}},
  2: {
   mid: {q: 'Which material is best for a saucepan handle?', options: ['Plastic or wood — they don’t let heat through easily', 'Copper — it lets heat through easily', 'Glass — it is see-through', 'Paper — it is light'], answer: 0,
    explain: 'Plastic and wood are thermal insulators, so the handle stays cool enough to hold. Copper is a good conductor — great for the pan, bad for the handle.'},
   older: {q: 'Which properties make copper good for electrical wires?', options: ['It conducts electricity well and bends without breaking', 'It is magnetic', 'It is transparent', 'It is an insulator'], answer: 0,
    explain: 'Copper is an excellent electrical conductor and ductile (it can be drawn into wires and bent).'},
   adult: {q: 'Aluminium has a density of 2.7 grams per cubic centimetre. What is the mass of a 10 cm³ block? (mass = density × volume)', options: ['0.27 g', '2.7 g', '27 g', '270 g'], answer: 2,
    explain: '2.7 × 10 = 27 grams.'}},
  3: {
   mid: {q: 'A family recycles 2 kg of cans every week. How much is that in a year (52 weeks)?', options: ['54 kg', '104 kg', '520 kg', '26 kg'], answer: 1,
    explain: '2 × 52 = 104 kg in a year.'},
   older: {q: 'A plastic bottle can take about 450 years to break down. If one was dropped in 1990, roughly when will it be gone?', options: ['2040', '2440', '2490', '4500'], answer: 1,
    explain: '1990 + 450 = 2440 — which is why recycling plastic matters.'},
   adult: {q: 'A town of 40,000 people throws away 400 kg of waste per person each year, and recycles 45% of it. How many tonnes are recycled each year? (1 tonne = 1,000 kg)', options: ['720 tonnes', '7,200 tonnes', '16,000 tonnes', '72,000 tonnes'], answer: 1,
    explain: '40,000 × 400 = 16,000,000 kg = 16,000 tonnes, and 45% of 16,000 = 7,200 tonnes.'}}};

 // ---- 22. Bone Doctor (the body) ----
 L.bones = {
  1: {
   mid: {q: 'Which bones protect your heart and lungs?', options: ['The ribs', 'The skull', 'The kneecaps', 'The finger bones'], answer: 0,
    explain: 'The ribs make a cage round the heart and lungs. The skull protects the brain.'},
   older: {q: 'Roughly how many bones are in an adult human skeleton?', options: ['106', '206', '306', '2,006'], answer: 1,
    explain: 'An adult has 206 bones. More than half of them are in the hands and feet!'},
   adult: {q: 'A newborn baby has about 300 bones, and an adult has 206, because some bones join together as we grow. Roughly what percentage of the baby’s bones “disappear” by joining?', options: ['About 21%', 'About 31%', 'About 47%', 'About 69%'], answer: 1,
    explain: '300 − 206 = 94 fewer bones, and 94 ÷ 300 ≈ 0.31, so about 31%.'}},
  2: {
   mid: {q: 'Muscles work in pairs. When your biceps contracts to bend your arm, what does your triceps do?', options: ['It relaxes', 'It contracts too', 'It disappears', 'It turns into bone'], answer: 0,
    explain: 'Muscles can only pull. The biceps pulls to bend the arm while the triceps relaxes; to straighten it, they swap.'},
   older: {q: 'What joins muscles to bones?', options: ['Tendons', 'Ligaments', 'Cartilage', 'Nerves'], answer: 0,
    explain: 'Tendons join muscle to bone. Ligaments join bone to bone at joints, and cartilage cushions the ends of bones.'},
   adult: {q: 'Your forearm is a lever. The biceps pulls 4 cm from the elbow, and your hand holds a 20 N weight 32 cm from the elbow. For balance, force × distance must be equal on both sides. How hard must the biceps pull?', options: ['2.5 N', '80 N', '160 N', '640 N'], answer: 2,
    explain: '20 × 32 = 640, and 640 ÷ 4 = 160 N. The muscle pulls 8 times harder than the weight, because it is so close to the elbow.'}},
  3: {
   older: {q: 'Which vitamin helps the body absorb calcium, and is made in our skin in sunlight?', options: ['Vitamin D', 'Vitamin C', 'Vitamin A', 'Vitamin K'], answer: 0,
    explain: 'Vitamin D helps us take calcium from food. Our skin makes it in sunlight, and it is also in oily fish and eggs.'},
   adult: {q: 'A child needs about 700 mg of calcium a day, and a glass of milk has about 240 mg. Roughly how many glasses would give a whole day’s calcium?', options: ['About 2', 'About 3', 'About 5', 'About 7'], answer: 1,
    explain: '700 ÷ 240 ≈ 2.9, so about 3 glasses (or a mix of milk, cheese, yoghurt and other foods).'}}};

 // ---- 23. Water Recycler (separating mixtures) ----
 L.filter = {
  1: {
   mid: {q: 'Why can a filter catch sand but not salt?', options: ['Sand doesn’t dissolve; salt dissolves into tiny particles that pass through', 'Salt is heavier than sand', 'Sand is magnetic', 'The filter only likes sand'], answer: 0,
    explain: 'Undissolved sand grains are too big for the filter’s holes. Dissolved salt is spread through the water as tiny particles that pass straight through.'},
   older: {q: 'Sand does not dissolve in water. Which word describes it?', options: ['Insoluble', 'Soluble', 'Transparent', 'Volatile'], answer: 0,
    explain: 'Insoluble means it will not dissolve. Salt is soluble.'},
   adult: {q: 'Each time the water goes through the filter, 98% of the dirt is removed. After two passes, what percentage of the original dirt is left?', options: ['4%', '0.4%', '0.04%', '2%'], answer: 2,
    explain: '2% is left after one pass, and 2% of that after two: 0.02 × 0.02 = 0.0004 = 0.04%.'}},
  2: {
   mid: {q: 'Sea water has about 35 g of salt in every litre. How much salt is in 4 litres?', options: ['70 g', '140 g', '35 g', '39 g'], answer: 1,
    explain: '35 × 4 = 140 grams.'},
   older: {q: 'Salt water is boiled, and the steam is cooled back into water. What is this method called?', options: ['Distillation', 'Filtration', 'Chromatography', 'Magnetism'], answer: 0,
    explain: 'Distillation: the water evaporates and is condensed again, leaving the salt behind. It gives pure water.'},
   adult: {q: 'Sea water is about 3.5% salt by mass. How much sea water must be evaporated to leave 70 g of salt?', options: ['200 g', '2 kg', '20 kg', '245 g'], answer: 1,
    explain: '70 g is 3.5% of the total, so the total is 70 ÷ 0.035 = 2,000 g = 2 kg.'}},
  3: {
   young: {q: 'Put the steps to make clean drinking water in order.', items: ['Filter out the sand', 'Boil the water', 'Let it cool', 'Drink!'],
    explain: 'Filtering removes the sand, boiling kills germs, and it needs to cool before we drink it.'},
   older: {q: 'Sequence the full purification process.', items: ['Let the mud settle', 'Pour off the water', 'Filter out the fine grit', 'Heat the water to steam', 'Cool the steam back to water', 'Drink!'],
    explain: 'Settling and pouring off removes big bits, filtering removes fine grit, and distilling (evaporate, then condense) removes the salt.'},
   adult: {q: 'Sequence the purification process, including a purity check.', items: ['Let the mud settle', 'Pour off the water', 'Filter out the fine grit', 'Heat the water to steam', 'Cool the steam back to water', 'Check it boils at exactly 100 °C (at sea-level pressure)', 'Drink!'],
    explain: 'Pure water boils at exactly 100 °C (at normal pressure); dissolved impurities raise the boiling point, so it is a good purity test.'}}};

 // ---- 24. Runaway Robot (programming) — loop numbers change every time ----
 L.robot = {
  1: {
   mid: {q: 'IF the bin is full THEN empty it, ELSE carry on. The bin is half full. What does the robot do?', options: ['Carries on', 'Empties the bin', 'Stops for ever', 'Fills the bin'], answer: 0,
    explain: 'The condition “the bin is full” is false, so the ELSE part runs: it carries on.'},
   older: {q: 'x starts at 10. The robot runs: IF x > 5 THEN x = x − 3 ELSE x = x + 3. What is x now?', options: ['7', '13', '10', '3'], answer: 0,
    explain: '10 > 5 is true, so x = 10 − 3 = 7.'},
   adult: {q: 'x = 4. WHILE x < 50: x = x × 2. What is x when the loop ends?', options: ['32', '50', '64', '128'], answer: 2,
    explain: '4 → 8 → 16 → 32 → 64. At 64 the condition x < 50 is false, so the loop stops.'}},
  2: {
   young: () => { const a = R(2, 5), b = R(2, 3);
    return {q: `“REPEAT ${a} times: wipe ${b} tables.” How many tables does it wipe?`, answer: String(a * b), explain: `${a} lots of ${b}: ${a} × ${b} = ${a * b}.`}; },
   mid: () => { const a = R(3, 9), b = R(3, 8);
    return {q: `A loop runs ${a} times, wiping ${b} tables each time. How many tables in total?`, answer: String(a * b), explain: `${a} × ${b} = ${a * b}. A loop repeats its instructions.`}; },
   older: () => { const a = R(3, 6), b = R(3, 6), c = R(2, 9);
    return {q: `REPEAT ${a} times: { REPEAT ${b} times: wipe a table }. Then wipe ${c} more tables. How many tables altogether?`, answer: String(a * b + c), explain: `The inner loop runs ${b} times for each of the ${a} outer runs: ${a} × ${b} = ${a * b}, plus ${c} = ${a * b + c}.`}; },
   adult: () => { const n = R(5, 10);
    return {q: `total = 1. REPEAT ${n} times: total = total × 2. What is total at the end?`, answer: String(2 ** n), explain: `Doubling ${n} times from 1 gives 2 to the power ${n} = ${2 ** n}.`}; }},
  3: {
   mid: {q: 'The robot was told to turn left but turned right. What is the best first step to debug it?', options: ['Read the code to find the instruction that says “right”', 'Throw the robot away', 'Add more code at random', 'Turn the screen off'], answer: 0,
    explain: 'Debugging starts by finding exactly where the program does something different from what you meant.'},
   older: {q: 'A program should add up the numbers 1 to 5 but gives 10. What is the bug most likely to be?', options: ['The loop stops one number too early', 'It multiplies instead of adding', 'The numbers are too big', 'Nothing is wrong'], answer: 0,
    explain: '1 + 2 + 3 + 4 + 5 = 15, but 1 + 2 + 3 + 4 = 10, so the loop is missing the last number — an “off-by-one” error.'},
   adult: {q: 'This should print 1 to 10: n = 1; WHILE n < 10: print n; n = n + 1. What does it actually print?', options: ['1 to 10', '1 to 9', '0 to 9', '2 to 10'], answer: 1,
    explain: 'When n reaches 10, “n < 10” is false, so 10 is never printed. It should say n ≤ 10 — a classic off-by-one bug.'}}};

 // ---- 25. The Strong Password (online safety) ----
 L.password = {
  1: {
   young: {q: 'Which password is the strongest?', options: ['purple-Tiger-toast-42!', 'password', '12345', 'starlane'], answer: 0,
    explain: 'Long passwords mixing words, capitals, numbers and symbols are much harder to guess than short or common ones.'},
   mid: {q: 'Why is “password123” a weak password?', options: ['It is a common word that is easy to guess', 'It is too long', 'It has numbers in it', 'It is spelled wrongly'], answer: 0,
    explain: 'Hackers try the most common passwords first, and “password123” is one of them. Three random words are far stronger.'},
   older: {q: 'What is the safest way to keep lots of different passwords?', options: ['A password manager', 'Use the same password everywhere', 'A sticky note on the screen', 'Tell a friend to remember them'], answer: 0,
    explain: 'A password manager stores a different strong password for each site, locked by one master password.'},
   adult: {q: 'A 4-digit PIN has 10,000 possible combinations. How many does a password of 4 lower-case letters have? (26 choices for each)', options: ['104', '10,400', '456,976', '1,000,000'], answer: 2,
    explain: '26 × 26 × 26 × 26 = 456,976. Every extra character multiplies the possibilities, which is why length matters most.'}},
  2: {
   older: {q: 'A website you use has been hacked. What should you do?', options: ['Change that password, and anywhere else you used it', 'Nothing', 'Post about it', 'Keep using the same password'], answer: 0,
    explain: 'Hackers try stolen passwords on other sites, so change it everywhere you reused it.'},
   adult: {q: 'What does turning on two-factor authentication do?', options: ['A second check, such as a code sent to your phone, is needed as well as your password', 'It makes your password twice as long', 'It lets two people share the account', 'The site checks your password twice'], answer: 0,
    explain: 'Even if someone steals your password, they also need the second factor (your phone or a security key).'}},
  3: {
   older: {q: 'Which clue suggests an email is a phishing trick?', options: ['It rushes you and asks you to log in through its link', 'It is from a friend about plans you made', 'It has no links in it', 'It is short'], answer: 0,
    explain: 'Phishing messages create panic (“act now!”) and send you to a fake login page to steal your password.'},
   adult: {q: 'An email claims to be from “starlane-bank.com”, but its link goes to starlane-bank.co.secure-login.ru/sign-in. Which website does the link really go to?', options: ['secure-login.ru', 'starlane-bank.com', 'starlane-bank.co', 'sign-in'], answer: 0,
    explain: 'Read a web address from the right-hand end of the name: the real site is secure-login.ru. Everything before it is just a disguise.'}}};

 // ---- 26. Fuel Mixture (ratio) — numbers change every time ----
 L.fuelmix = {
  1: {
   young: () => { const k = R(2, 4), n = R(2, 5);
    return {q: `For every 1 cup of blue fuel we add ${k} cups of green. We use ${n} cups of blue. How many cups of green?`, answer: String(n * k), explain: `${k} green for every blue: ${n} × ${k} = ${n * k} cups.`}; },
   mid: () => { const [a, b] = pick([[2, 3], [3, 4], [2, 5], [3, 5]]), m = R(2, 6);
    return {q: `Blue : green = ${a} : ${b}. We have ${a * m} litres of blue. How many litres of green?`, answer: String(b * m), explain: `${a * m} is ${a} × ${m}, so multiply the green part by ${m} too: ${b} × ${m} = ${b * m} litres.`}; },
   older: () => { const [a, b] = pick([[2, 3], [3, 4], [1, 4], [3, 7]]), m = R(3, 9), t = (a + b) * m;
    return {q: `We need ${t} litres of fuel mixed blue : green = ${a} : ${b}. How many litres of green?`, answer: String(b * m), explain: `There are ${a} + ${b} = ${a + b} parts, so one part is ${t} ÷ ${a + b} = ${m} litres. Green is ${b} parts: ${b} × ${m} = ${b * m} litres.`}; },
   adult: () => { const k = R(2, 6);
    return {q: `The tank contains ${4 * k} litres of fuel mixed blue : green = 1 : 3 (and it has plenty of room). How many litres of blue must we add to make it 1 : 1?`, answer: String(2 * k), explain: `It has ${k} L of blue and ${3 * k} L of green. For 1 : 1 we need ${3 * k} L of blue, so add ${3 * k} − ${k} = ${2 * k} litres.`}; }},
  2: {
   young: () => { const a = R(2, 6), b = R(2, 6);
    return {q: `We pour in ${a} cups of blue and ${b} cups of green. How many cups altogether?`, answer: String(a + b), explain: `${a} + ${b} = ${a + b} cups.`}; },
   mid: () => { const a = R(12, 48), b = R(15, 49);
    return {q: `The mixer holds ${a} litres of blue and ${b} litres of green. How many litres is the whole mixture?`, answer: String(a + b), explain: `${a} + ${b} = ${a + b} litres.`}; },
   older: () => { const [n, d] = pick([[3, 4], [2, 3], [2, 5], [5, 8]]), t = d * R(8, 20);
    return {q: `The fuel tank holds ${t} litres and is ${n}/${d} full. How many litres of fuel are in it?`, answer: String(t * n / d), explain: `${t} ÷ ${d} = ${t / d}, and × ${n} = ${t * n / d} litres.`}; },
   adult: () => { const t = pick([120, 160, 200, 240]), p = pick([40, 60, 75, 85]), r = pick([7, 9, 11, 13]), f = t * p / 100;
    return {q: `A full tank holds ${t} litres and it is ${p}% full. Each jump burns ${r} litres. How many complete jumps can we make?`, answer: String(Math.floor(f / r)), explain: `${p}% of ${t} = ${f} litres. ${f} ÷ ${r} = ${(f / r).toFixed(2)}, so ${Math.floor(f / r)} complete jumps.`}; }},
  3: {
   young: {q: 'We mix 1 cup of blue with 3 cups of green. What fraction of the mix is green?', options: ['3/4', '1/4', '1/3', '3/1'], answer: 0,
    explain: 'There are 4 cups in all, and 3 of them are green: 3/4.'},
   older: {q: 'Blue : green = 2 : 3. What percentage of the mixture is green?', options: ['60%', '40%', '66%', '150%'], answer: 0,
    explain: 'Green is 3 parts out of 5: 3/5 = 60%.'},
   adult: {q: 'Fuel A is 20% blue and fuel B is 50% blue. We mix 3 litres of A with 2 litres of B. What percentage of the new mixture is blue?', options: ['32%', '35%', '30%', '70%'], answer: 0,
    explain: 'Blue: 20% of 3 = 0.6 L and 50% of 2 = 1 L, so 1.6 L out of 5 L = 32%. (Just averaging 20% and 50% gives 35%, which is wrong because there is more of A.)'}}};

 // ---- 27. The Fossil in the Cargo (rocks, life) ----
 L.fossil = {
  1: {
   young: {q: 'Put the steps of how a fossil forms in order.', items: ['An animal dies', 'It is buried in mud', 'Millions of years later we dig it up'],
    explain: 'Fossils form when living things are buried, and the mud slowly turns to rock over millions of years.'},
   older: {q: 'Sequence how a fossil forms and is found.', items: ['A sea creature dies', 'It is buried by layers of mud', 'More layers press down on top', 'The layers slowly turn to rock', 'The rock is lifted and worn away', 'We find the fossil'],
    explain: 'Burial, more layers, pressure turning sediment to rock, then uplift and erosion bring the fossil back to the surface.'},
   adult: {q: 'Put these in order, oldest first.', items: ['Earth forms', 'The first life appears in the sea', 'The dinosaurs live', 'The first humans', 'The pyramids are built'],
    explain: 'Earth formed about 4.5 billion years ago, life began over 3.5 billion years ago, dinosaurs lived from about 230 to 66 million years ago, our species appeared about 300,000 years ago, and the pyramids are about 4,500 years old.'}},
  2: {
   mid: {q: 'In a cliff made of rock layers, which layer is usually the oldest?', options: ['The bottom layer', 'The top layer', 'The middle layer', 'They are all the same age'], answer: 0,
    explain: 'Layers settle one on top of another, so the lowest one was laid down first.'},
   older: {q: 'Why are fossils almost never found in igneous rock?', options: ['It forms from molten rock, which destroys any remains', 'It is too soft', 'It is always under the sea', 'It is too young'], answer: 0,
    explain: 'Igneous rock cools from molten magma or lava — far too hot for remains to survive. Fossils are found in sedimentary rock.'},
   adult: {q: 'Mud layers here build up at about 1 mm a year. A fossil is found 3 m below the surface. Roughly how old is it?', options: ['300 years', '3,000 years', '30,000 years', '3 million years'], answer: 1,
    explain: '3 m = 3,000 mm, at 1 mm a year that is about 3,000 years.'}},
  3: {
   mid: {q: 'A fossil fish is found at the top of a mountain. What does that tell us?', options: ['The rock was once under water', 'Fish can climb', 'Someone dropped it there', 'Fish lived on mountains'], answer: 0,
    explain: 'The rock formed under water, and over millions of years it was pushed up to make the mountain.'},
   adult: {q: 'Carbon-14 in old bones halves every 5,730 years. A bone has a quarter of its original carbon-14 left. How old is it?', options: ['2,865 years', '5,730 years', '11,460 years', '22,920 years'], answer: 2,
    explain: 'A quarter is half of a half: two halvings, 2 × 5,730 = 11,460 years.'}}};

 // ---- 28. Rust Attack (chemical change) ----
 L.rust = {
  1: {
   mid: {q: 'Which TWO places would make an iron nail rust?', options: ['In a glass of tap water', 'Outside in the rain', 'In a sealed jar of very dry air', 'Under a layer of oil', 'Wrapped up in a dry drawer'], answer: [0, 1],
    explain: 'Rusting needs both water and oxygen. Tap water and rain have both; dry air has no water, and oil keeps both away.'},
   older: {q: 'Select the TWO substances iron reacts with when it rusts.', options: ['Water', 'Oxygen', 'Nitrogen', 'Carbon dioxide'], answer: [0, 1],
    explain: 'Iron + water + oxygen → hydrated iron oxide (rust).'},
   adult: {q: 'Select the TWO true statements about rust.', options: ['A rusty nail weighs more than it did before it rusted', 'Salt water makes iron rust faster', 'Rusting needs sunlight', 'Rust makes iron stronger', 'Iron rusts fastest in dry air'], answer: [0, 1],
    explain: 'Rust contains oxygen taken from the air, so the nail gains mass. Salt speeds up the reaction — which is why ships and cars near the sea rust quickly.'}},
  2: {
   mid: {q: 'Which way of stopping rust uses another metal?', options: ['Galvanising — coating the iron in zinc', 'Painting it', 'Oiling it', 'Keeping it dry'], answer: 0,
    explain: 'Galvanised iron has a coat of zinc. Paint, oil and keeping it dry work too, but don’t use a metal.'},
   older: {q: 'Zinc protects iron even when the coating is scratched, because zinc is more reactive and corrodes first. What is this called?', options: ['Sacrificial protection', 'Gold plating', 'Insulation', 'Evaporation'], answer: 0,
    explain: 'The zinc is “sacrificed”: it reacts instead of the iron.'},
   adult: {q: 'Anti-rust paint costs 8 Cr per square metre. This wall is 15 m by 12 m. How much does it cost to paint?', options: ['1,440 Cr', '216 Cr', '960 Cr', '2,160 Cr'], answer: 0,
    explain: 'Area = 15 × 12 = 180 m², and 180 × 8 = 1,440 Cr.'}},
  3: {
   mid: {q: 'Rusting is a chemical change. Which of these is also a chemical change?', options: ['Burning wood', 'Melting ice', 'Dissolving sugar', 'Cutting paper'], answer: 0,
    explain: 'Burning makes new substances (ash, smoke, gases) and can’t be undone. Melting, dissolving and cutting are physical changes.'},
   older: {q: 'Complete the word equation: iron + oxygen → ?', options: ['Iron oxide', 'Iron water', 'Oxygen iron', 'Iron chloride'], answer: 0,
    explain: 'Iron joins with oxygen to make iron oxide — with water too, that is rust.'},
   adult: {q: 'Iron makes up 70% of the mass of rust (iron oxide). How much rust can 140 g of iron make?', options: ['98 g', '140 g', '200 g', '210 g'], answer: 2,
    explain: '140 g is 70% of the rust, so the rust is 140 ÷ 0.7 = 200 g.'}}};

 // ---- 29. The Clock Stopped (time) — numbers change every time ----
 L.clock = {
  1: {
   mid: () => { const h = R(2, 9);
    return {q: `How many minutes are there in ${h} hours?`, answer: String(60 * h), explain: `60 minutes in an hour: ${h} × 60 = ${60 * h}.`}; },
   older: () => { const m = R(2, 15);
    return {q: `How many seconds are there in ${m} minutes?`, answer: String(60 * m), explain: `60 seconds in a minute: ${m} × 60 = ${60 * m}.`}; },
   adult: () => pick([
    {q: 'How many seconds are there in one day?', answer: '86400', explain: '60 × 60 = 3,600 seconds an hour, and × 24 = 86,400.'},
    {q: 'How many minutes are there in one week?', answer: '10080', explain: '60 × 24 = 1,440 minutes a day, and × 7 = 10,080.'},
    {q: 'How many hours are there in a year of 365 days?', answer: '8760', explain: '24 × 365 = 8,760 hours.'}])},
  2: {
   young: () => { const h = R(1, 6), k = R(1, 5);
    return {q: `It is ${h} o’clock. The delivery comes ${k} hours later. What time is it then (just the hour)?`, answer: String(h + k), explain: `Count on ${k}: ${h} + ${k} = ${h + k} o’clock.`}; },
   mid: () => { const s = R(13, 18), k = R(2, 5);
    return {q: `It is ${s}:00. The delivery is in ${k} hours. What hour will it be (24-hour clock)?`, answer: String(s + k), explain: `${s} + ${k} = ${s + k}, so ${s + k}:00.`}; },
   older: () => { let s, k; do { s = R(19, 23); k = R(3, 8); } while ((s + k) % 24 === 0); const a = (s + k) % 24;   // never midnight: 0 and 24 would both be fair
    return {q: `Departure ${s}:00. The journey takes ${k} hours. What is the arrival hour (24-hour clock)?`, answer: String(a), explain: `${s} + ${k} = ${s + k}. After 23:00 the clock goes back to 00:00, so take away 24: ${s + k} − 24 = ${a}, which is ${String(a).padStart(2, '0')}:00.`}; },
   adult: () => { let s, f, z; do { s = R(8, 22); f = R(2, 12); z = R(1, 8); } while ((s + f + z) % 24 === 0); const a = (s + f + z) % 24;
    return {q: `We leave at ${s}:00 local time. The flight takes ${f} hours, and the destination’s clocks are ${z} hours ahead. What is the local arrival hour there (24-hour clock)?`, answer: String(a), explain: `${s} + ${f} hours of flying + ${z} hours of time difference = ${s + f + z}${s + f + z >= 24 ? `, and taking away 24 gives ${a}` : ''}: ${String(a).padStart(2, '0')}:00.`}; }},
  3: {
   mid: {q: 'A pendulum swings 30 times in one minute. How long does each swing take?', options: ['2 seconds', '0.5 seconds', '30 seconds', '1 second'], answer: 0,
    explain: '60 seconds ÷ 30 swings = 2 seconds each.'},
   older: {q: 'Does a heavier weight on the end make a pendulum swing more slowly?', options: ['No — for small swings only the length matters', 'Yes, it swings faster', 'Yes, it swings slower', 'It stops it swinging'], answer: 0,
    explain: 'Galileo found that a pendulum’s swing time depends on its length, not the mass of the weight.'},
   adult: {q: 'A pendulum’s swing time is proportional to the square root of its length. To make it take twice as long to swing, the string must be…', options: ['Twice as long', 'Four times as long', 'Half as long', 'Eight times as long'], answer: 1,
    explain: 'To double √length, the length must go up by 2² = 4.'}}};

 // ---- 30. The Scrambled Star Map (the solar system) ----
 L.starmap = {
  1: {
   young: {q: 'Put these planets in order, nearest the Sun first.', items: ['Mercury', 'Venus', 'Earth'],
    explain: 'Mercury is closest to the Sun, then Venus, then our Earth.'},
   older: {q: 'Order these planets by distance from the Sun, nearest first.', items: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn'],
    explain: 'Mercury, Venus, Earth and Mars are the rocky planets; then come the giants Jupiter and Saturn.'},
   adult: {q: 'Put all eight planets in order from the Sun outwards.', items: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    explain: 'A rhyme helps: “My Very Easy Method Just Speeds Up Naming” — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.'}},
  2: {
   mid: {q: 'How long does the Moon take to go through all its phases, from new Moon to new Moon?', options: ['About a month (29½ days)', 'One day', 'One week', 'One year'], answer: 0,
    explain: 'The cycle of phases takes about 29½ days — that is where the word “month” comes from.'},
   older: {q: 'At full Moon, where is the Moon compared with the Earth and the Sun?', options: ['On the far side of Earth from the Sun', 'Between Earth and the Sun', 'Next to the Sun in the sky', 'Behind Mars'], answer: 0,
    explain: 'With Earth between them, we see the whole sunlit face. At new Moon it is between us and the Sun, and its lit side faces away.'},
   adult: {q: 'The Moon is about 384,000 km away, and light travels about 300,000 km every second. How long does moonlight take to reach us?', options: ['About 1.3 seconds', 'About 8 minutes', 'About 13 seconds', 'About 0.13 seconds'], answer: 0,
    explain: '384,000 ÷ 300,000 = 1.28 seconds.'}},
  3: {
   mid: {q: 'How many days are there in a leap year?', options: ['366', '365', '364', '360'], answer: 0,
    explain: 'A leap year has an extra day, 29 February, so 366 days.'},
   older: {q: 'Why do we have a leap year every 4 years?', options: ['Earth takes about 365¼ days to orbit the Sun, so the quarter days add up', 'The Moon slows down', 'To make February longer for fun', 'Earth speeds up every 4 years'], answer: 0,
    explain: 'Four quarter days make one whole day, which is added to February every fourth year.'},
   adult: {q: 'Earth travels about 940 million km round the Sun each year, and a year is about 8,760 hours. Roughly how fast is that?', options: ['About 10,700 km/h', 'About 107,000 km/h', 'About 1 million km/h', 'About 30,000 km/h'], answer: 1,
    explain: '940,000,000 ÷ 8,760 ≈ 107,000 km per hour — about 30 km every second!'}}};

 // ---- 31. The Heartbeat Monitor (the body, rates) — pulse numbers change every time ----
 L.heart = {
  1: {
   young: () => { const b = R(15, 25);
    return {q: `You count ${b} beats in 15 seconds. How many in one minute? (Hint: a minute is 4 lots of 15 seconds)`, answer: String(4 * b), explain: `${b} × 4 = ${4 * b} beats per minute.`}; },
   mid: () => { const b = R(10, 17);
    return {q: `You count ${b} beats in 10 seconds. What is the pulse per minute?`, answer: String(6 * b), explain: `A minute is 6 lots of 10 seconds: ${b} × 6 = ${6 * b} beats per minute.`}; },
   older: () => { const [s, b] = pick([[20, R(20, 32)], [30, R(30, 45)]]);
    return {q: `A pulse of ${b} beats every ${s} seconds. Convert it to beats per minute.`, answer: String(b * 60 / s), explain: `${60 / s} lots of ${s} seconds make a minute: ${b} × ${60 / s} = ${b * 60 / s} beats per minute.`}; },
   adult: () => { const r = R(60, 80);
    return {q: `A resting heart beats ${r} times a minute. How many times does it beat in a whole day?`, answer: String(r * 1440), explain: `There are 60 × 24 = 1,440 minutes in a day, and ${r} × 1,440 = ${r * 1440}.`}; }},
  2: {
   mid: {q: 'Which blood vessels carry blood AWAY from the heart?', options: ['Arteries', 'Veins', 'Nerves', 'Tendons'], answer: 0,
    explain: 'Arteries carry blood away from the heart; veins bring it back. Tiny capillaries link them.'},
   older: {q: 'How many chambers does the human heart have?', options: ['4', '2', '3', '6'], answer: 0,
    explain: 'Two atria on top and two ventricles below. The right side pumps blood to the lungs; the left side pumps it round the body.'},
   adult: {q: 'The heart pumps about 70 ml of blood with each beat, at 70 beats a minute. Roughly how much blood is that each minute?', options: ['About 0.5 litres', 'About 4.9 litres', 'About 49 litres', 'About 140 litres'], answer: 1,
    explain: '70 × 70 = 4,900 ml = about 4.9 litres a minute — roughly all of your blood, every minute.'}},
  3: {
   mid: {q: 'When you run, which gas do your working muscles need more of?', options: ['Oxygen', 'Nitrogen', 'Helium', 'Carbon dioxide'], answer: 0,
    explain: 'Muscles use oxygen to release energy from food, so the heart and lungs work harder to supply it.'},
   older: {q: 'Why do you also breathe faster when you exercise?', options: ['To take in more oxygen and get rid of more carbon dioxide', 'To cool your teeth', 'To slow your heart down', 'To make more noise'], answer: 0,
    explain: 'Respiring muscles use more oxygen and make more carbon dioxide; faster breathing swaps more of both.'},
   adult: {q: 'A rough rule says your maximum heart rate is 220 minus your age. What is it for a 40-year-old?', options: ['160', '180', '200', '260'], answer: 1,
    explain: '220 − 40 = 180 beats per minute. (It is only a rough guide — people vary.)'}}};

 // ---- 32. Keep It Warm (heat) ----
 L.warm = {
  1: {
   mid: {q: 'Why does a woolly jumper keep you warm?', options: ['It traps air, which is a good insulator', 'Wool makes its own heat', 'It is heavy', 'Wool is magnetic'], answer: 0,
    explain: 'The fibres trap lots of still air, and still air is a poor conductor of heat, so your body heat escapes slowly.'},
   older: {q: 'Why does a vacuum flask keep drinks hot?', options: ['The vacuum stops heat travelling by conduction and convection', 'The vacuum makes heat', 'The flask is magnetic', 'It reflects the cold away'], answer: 0,
    explain: 'Conduction and convection need particles, and a vacuum has none. Shiny walls also cut heat lost by radiation.'},
   adult: {q: 'This wall loses 40 watts of heat for every degree of difference between inside and outside. Inside is 21 °C and outside is −4 °C. How much heat does it lose?', options: ['680 W', '1,000 W', '840 W', '160 W'], answer: 1,
    explain: 'The difference is 21 − (−4) = 25 degrees, and 25 × 40 = 1,000 watts.'}},
  2: {
   mid: {q: 'Which spoon would get hot fastest in hot soup?', options: ['A metal spoon', 'A wooden spoon', 'A plastic spoon'], answer: 0,
    explain: 'Metal is a good conductor of heat. Wood and plastic are insulators.'},
   older: {q: 'Which way of moving heat carries it through a solid, like the spoon?', options: ['Conduction', 'Convection', 'Radiation', 'Evaporation'], answer: 0,
    explain: 'In conduction, vibrating particles pass energy along to their neighbours. Convection needs a liquid or gas that can flow.'},
   adult: {q: 'Heat from the Sun reaches us across empty space. Which way of moving heat must that be?', options: ['Radiation', 'Conduction', 'Convection', 'Evaporation'], answer: 0,
    explain: 'Conduction and convection need particles; space is almost empty. Radiation (infrared and light) needs nothing to travel through.'}},
  3: {
   mid: {q: 'A hot drink is left on the table. What happens?', options: ['It cools until it is the same temperature as the room', 'It gets hotter', 'It stays hot for ever', 'It freezes'], answer: 0,
    explain: 'Heat flows from the hot drink to the cooler room until they are the same temperature.'},
   older: {q: 'Ice is dropped into a warm drink. Which way does the energy flow?', options: ['From the drink into the ice', 'From the ice into the drink', 'No energy moves', 'Both get hotter'], answer: 0,
    explain: 'Energy always flows from hotter to colder: the drink warms (and melts) the ice and cools down itself.'},
   adult: {q: 'Equal amounts of water at 80 °C and 20 °C are mixed, with no heat lost. What is the final temperature?', options: ['50 °C', '60 °C', '100 °C', '40 °C'], answer: 0,
    explain: 'The hot water cools by as much as the cold water warms, so they meet in the middle: (80 + 20) ÷ 2 = 50 °C.'}}};

 // ---- 33. The Pulsar Lighthouse (rates, stars) — numbers change every time ----
 L.pulsar = {
  1: {
   young: () => { const f = R(2, 5), t = R(2, 10);
    return {q: `The pulsar flashes ${f} times every second. How many flashes in ${t} seconds?`, answer: String(f * t), explain: `${f} × ${t} = ${f * t} flashes.`}; },
   mid: () => { const f = R(2, 9);
    return {q: `The pulsar flashes ${f} times per second. How many flashes in one minute?`, answer: String(f * 60), explain: `A minute is 60 seconds: ${f} × 60 = ${f * 60}.`}; },
   older: () => { const f = R(2, 9);
    return {q: `A pulsar spins ${f} times per second. How many times does it spin in one hour?`, answer: String(f * 3600), explain: `An hour is 60 × 60 = 3,600 seconds: ${f} × 3,600 = ${f * 3600}.`}; },
   adult: () => { const p = pick([2, 4, 5, 8, 10, 20, 25, 40, 50]);
    return {q: `This pulsar’s flashes are ${p} milliseconds apart (a millisecond is a thousandth of a second). How many flashes are there every second?`, answer: String(1000 / p), explain: `1,000 milliseconds ÷ ${p} = ${1000 / p} flashes a second.`}; }},
  2: {
   mid: {q: 'A pulsar is a spinning…?', options: ['Neutron star', 'Planet', 'Comet', 'Moon'], answer: 0,
    explain: 'A pulsar is a neutron star — the tiny, super-dense core left when a giant star explodes — spinning very fast.'},
   older: {q: 'Why does a pulsar seem to flash on and off?', options: ['Its beams sweep past us as it spins, like a lighthouse', 'It switches itself on and off', 'Clouds keep covering it', 'It is blinking'], answer: 0,
    explain: 'Beams of radiation come out of its magnetic poles. As it spins, they sweep across Earth, giving a pulse each turn.'},
   adult: {q: 'Estimates vary, but suppose a teaspoon (5 cm³) of neutron-star material weighs about 2 billion tonnes. Roughly how much does 1 cm³ weigh?', options: ['40 million tonnes', '400 million tonnes', '10 billion tonnes', '2 billion tonnes'], answer: 1,
    explain: '2,000 million tonnes ÷ 5 = 400 million tonnes in each cubic centimetre — the mass of a mountain in a sugar-cube space.'}}};

 // ---- 34. Through the Wormhole (space, subtraction) — numbers change every time ----
 L.wormhole = {
  1: {
   older: {q: 'Has anyone ever found a real wormhole?', options: ['No — they may be possible in theory, but none has been found', 'Yes, near Earth', 'Yes, in every galaxy', 'Yes — they are the same as black holes'], answer: 0,
    explain: 'Einstein’s equations allow wormholes, but no one has ever found one. They are an idea scientists still argue about.'},
   adult: {q: 'In the paper model, the two dots are 20 cm apart. Folded, the route through the fold is just 0.5 cm. What percentage of the distance is saved?', options: ['2.5%', '50%', '97.5%', '99.5%'], answer: 2,
    explain: '20 − 0.5 = 19.5 cm saved, and 19.5 ÷ 20 = 0.975 = 97.5%.'}},
  2: {
   young: () => { const l = 10 * R(2, 10), w = R(1, 9);
    return {q: `The long way is ${l} light years. The wormhole is ${w} light year${w > 1 ? 's' : ''}. How many light years do we save?`, answer: String(l - w), explain: `Take away: ${l} − ${w} = ${l - w}.`}; },
   mid: () => { const l = R(150, 500), w = R(2, 20);
    return {q: `The normal route is ${l} light years; the wormhole route is ${w}. How many light years do we save?`, answer: String(l - w), explain: `${l} − ${w} = ${l - w} light years saved.`}; },
   older: () => { const l = pick([200, 400, 500, 800, 1000]), p = pick([90, 95, 96, 98]), w = l * (100 - p) / 100;
    return {q: `The long route is ${l} light years; the wormhole route is ${w}. What percentage of the distance do we save?`, answer: String(p), explain: `We save ${l} − ${w} = ${l - w}, and ${l - w} ÷ ${l} = ${p / 100} = ${p}%.`}; },
   adult: () => { const s = pick([2, 5, 10]), w = s * R(1, 4), l = w + s * R(20, 60);
    return {q: `Our ship covers ${s} light years a day. The normal route is ${l} light years; through the wormhole it is ${w}. How many days does the wormhole save?`, answer: String((l - w) / s), explain: `We save ${l} − ${w} = ${l - w} light years, which at ${s} a day is ${(l - w) / s} days.`}; }}};

 // ---- 35. Rescue at Moon Base (the Moon) ----
 L.moonbase = {
  1: {
   mid: {q: 'What does a spacesuit carry that the astronaut cannot get from the Moon?', options: ['Oxygen to breathe', 'Moon rock', 'Moon dust', 'Gravity'], answer: 0,
    explain: 'The Moon has no air, so the suit supplies oxygen — and keeps the astronaut at a safe pressure and temperature.'},
   older: {q: 'The Moon’s surface can reach 120 °C in sunlight and −130 °C in shadow. What is the difference?', options: ['10 °C', '250 °C', '120 °C', '−10 °C'], answer: 1,
    explain: 'From −130 up to 0 is 130 degrees, and 0 up to 120 is 120 more: 130 + 120 = 250 degrees.'},
   adult: {q: 'Each astronaut uses about 0.84 kg of oxygen a day. How much does a crew of 4 need for a 10-day mission?', options: ['8.4 kg', '33.6 kg', '3.36 kg', '336 kg'], answer: 1,
    explain: '0.84 × 4 = 3.36 kg a day, and × 10 days = 33.6 kg.'}},
  2: {
   mid: {q: 'Moon gravity is about one sixth of Earth’s. If you can jump 50 cm high on Earth, roughly how high could you jump on the Moon?', options: ['About 3 m', 'About 1 m', 'About 50 cm', 'About 8 cm'], answer: 0,
    explain: 'With a sixth of the gravity, the same jump goes about 6 times as high: 6 × 50 cm = 300 cm = 3 m.'},
   older: {q: 'Why does the Moon have weaker gravity than Earth?', options: ['It has much less mass', 'It is further from the Sun', 'It has no air', 'It spins more slowly'], answer: 0,
    explain: 'Gravity depends on mass. The Moon has only about 1/80 of Earth’s mass, so its surface gravity is about a sixth of ours.'},
   adult: {q: 'With the same take-off speed, the time in the air is proportional to 1 ÷ gravity. A jump lasts 0.5 s on Earth. How long does it last on the Moon, where gravity is one sixth as strong?', options: ['0.5 s', '1.2 s', '3 s', '18 s'], answer: 2,
    explain: 'One sixth the gravity means six times the time: 0.5 × 6 = 3 seconds.'}}};

 // ---- 36. The Ringed Giant (Saturn) ----
 L.rings = {
  1: {
   mid: {q: 'Is Saturn the only planet with rings?', options: ['No — Jupiter, Uranus and Neptune have fainter rings', 'Yes, only Saturn', 'Only Saturn and Earth', 'Only Saturn and Mars'], answer: 0,
    explain: 'All four giant planets have rings. Saturn’s are by far the brightest because they are made of reflective ice.'},
   adult: {q: 'Saturn’s main rings are about 280,000 km across but in many places only about 10 m thick. Shrunk to 28 cm across, roughly how thick would they be?', options: ['About 1 mm', 'About 0.01 mm', 'About 0.00001 mm', 'About 1 cm'], answer: 2,
    explain: '280,000 km is 280,000,000 m, so shrinking to 0.28 m divides everything by 1,000,000,000. 10 m ÷ 1,000,000,000 = 0.00000001 m = 0.00001 mm — far thinner than paper.'}},
  2: {
   mid: {q: 'Saturn is less dense than water. If there were a bath big enough, what would Saturn do?', options: ['Float', 'Sink', 'Dissolve', 'Explode'], answer: 0,
    explain: 'Saturn’s average density is about 0.7 g/cm³, less than water’s 1 g/cm³, so it would float.'},
   older: {q: 'Saturn is mostly made of which gas?', options: ['Hydrogen', 'Oxygen', 'Carbon dioxide', 'Nitrogen'], answer: 0,
    explain: 'Saturn, like Jupiter, is mostly hydrogen, with helium — the same ingredients as the Sun.'},
   adult: {q: 'A day on Saturn lasts about 10.5 hours. How many Saturn days fit into 7 Earth days?', options: ['12', '16', '24', '7'], answer: 1,
    explain: '7 Earth days = 168 hours, and 168 ÷ 10.5 = 16 Saturn days.'}}};

 // ---- 37. Mission to the Red Planet (Mars) ----
 L.mars = {
  1: {
   mid: {q: 'Rust is iron oxide. Which two elements is it made from?', options: ['Iron and oxygen', 'Iron and carbon', 'Copper and oxygen', 'Iron and sulfur'], answer: 0,
    explain: 'Iron oxide is iron joined with oxygen — the same rust you see on old bikes.'},
   older: {q: 'Mars’ thin air is mostly which gas?', options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Helium'], answer: 0,
    explain: 'About 95% of Mars’ atmosphere is carbon dioxide, and it is less than 1% as thick as Earth’s.'},
   adult: {q: 'Mars is about 1.5 times as far from the Sun as Earth. Sunlight spreads out by the inverse square law. Roughly how bright is sunlight on Mars compared with on Earth?', options: ['About 67%', 'About 44%', 'About 150%', 'About 25%'], answer: 1,
    explain: '1 ÷ 1.5² = 1 ÷ 2.25 ≈ 0.44, so about 44% — less than half as bright.'}},
  2: {
   mid: {q: 'Why do scientists look for old water when searching for signs of life?', options: ['All living things we know need water', 'Water is shiny and easy to spot', 'Rovers need to drink it', 'Water makes rock red'], answer: 0,
    explain: 'Every living thing on Earth needs liquid water, so places that once had water are the best places to look.'},
   older: {q: 'Mars has white polar ice caps. What are they mostly made of?', options: ['Water ice and frozen carbon dioxide (dry ice)', 'Salt', 'Sand', 'Iron'], answer: 0,
    explain: 'The caps are water ice, topped in winter by a layer of frozen carbon dioxide.'},
   adult: {q: 'Radio travels at 300,000 km per second. Mars is 225 million km away today. How long does a message take to reach the rover?', options: ['About 75 seconds', 'About 12.5 minutes', 'About 2 hours', 'About 1 day'], answer: 1,
    explain: '225,000,000 ÷ 300,000 = 750 seconds = 12.5 minutes — which is why rovers must drive themselves.'}},
  3: {
   mid: {q: 'How many planets are closer to the Sun than Mars?', answer: '3',
    explain: 'Mercury, Venus and Earth are closer, so Mars is the 4th planet.'},
   older: {q: 'A year on Mars lasts about 687 Earth days. How many days longer is that than an Earth year of 365 days?', answer: '322',
    explain: '687 − 365 = 322 days longer.'},
   adult: {q: 'A day on Mars (a “sol”) is 24 hours 37 minutes. Over 30 sols, how many minutes more is that than 30 Earth days?', answer: '1110',
    explain: 'Each sol is 37 minutes longer: 37 × 30 = 1,110 minutes (18½ hours).'}}};

 // ---- 38. Satellite Repair (orbits) ----
 L.satfix = {
  1: {
   mid: {q: 'If a satellite suddenly stopped moving sideways, what would happen?', options: ['It would fall towards the planet', 'It would float still', 'It would fly off into space', 'Nothing'], answer: 0,
    explain: 'Only its fast sideways speed stops it falling straight down. Without it, gravity pulls it in.'},
   older: {q: 'Compared with satellites in low orbits, satellites higher up move…', options: ['More slowly', 'Faster', 'At the same speed', 'Backwards'], answer: 0,
    explain: 'Gravity is weaker further out, so a slower speed is enough to stay in orbit. The Moon, very far out, takes a month to go round.'},
   adult: {q: 'A satellite orbits at 7.7 km per second, and one orbit takes 90 minutes. Roughly how far does it travel in one orbit?', options: ['About 4,200 km', 'About 41,600 km', 'About 416,000 km', 'About 700 km'], answer: 1,
    explain: '90 minutes = 5,400 seconds, and 7.7 × 5,400 = 41,580 km — about once round Earth (40,000 km) plus a bit, because it is above the ground.'}},
  3: {
   mid: {q: 'What do weather satellites help us do?', options: ['Forecast the weather', 'Make it rain', 'Stop storms', 'Heat the planet'], answer: 0,
    explain: 'They photograph clouds and measure temperatures from space, so forecasters can see weather coming.'},
   older: {q: 'Satnav works by timing radio signals from satellites. Why must its clocks be extremely accurate?', options: ['Radio travels 300 km in a thousandth of a second, so tiny timing errors put you far off', 'Satellites are slow', 'To tell the time for fun', 'The clocks power the satellite'], answer: 0,
    explain: 'Signals travel at the speed of light, so a timing error of even a millionth of a second means hundreds of metres of error.'},
   adult: {q: 'A satnav clock is wrong by one millionth of a second. Radio travels at 300,000 km per second. Roughly how far off could your position be?', options: ['3 m', '30 m', '300 m', '3 km'], answer: 2,
    explain: '300,000 km/s × 0.000001 s = 0.3 km = 300 m.'}}};

 // ---- 39. The Eclipse (Sun, Moon, Earth) ----
 L.eclipse = {
  1: {
   mid: {q: 'In a LUNAR eclipse, what stops sunlight reaching the Moon?', options: ['The Earth', 'The Sun', 'A cloud', 'Mars'], answer: 0,
    explain: 'In a lunar eclipse the Earth is between the Sun and the Moon, and the Moon passes through Earth’s shadow.'},
   older: {q: 'The Sun is about 400 times wider than the Moon, but also about 400 times further away. What does this explain?', options: ['Why the Moon can just cover the Sun in a total eclipse', 'Why the Moon shines', 'Why there is an eclipse every day', 'Why the Sun is hot'], answer: 0,
    explain: 'Because of that lucky match, they look the same size in our sky, so the Moon can exactly cover the Sun.'},
   adult: {q: 'A total solar eclipse happens somewhere on Earth about every 18 months. Roughly how many happen in 30 years?', options: ['10', '20', '30', '60'], answer: 1,
    explain: '30 years = 360 months, and 360 ÷ 18 = 20.'}},
  2: {
   mid: {q: 'For a LUNAR eclipse, put them in a line starting with the Sun.', items: ['Sun', 'Earth', 'Moon'],
    explain: 'Sun, Earth, Moon: Earth’s shadow falls on the Moon. (For a solar eclipse it is Sun, Moon, Earth.)'},
   older: {q: 'Put these in order of size, smallest first.', items: ['The Moon', 'Earth', 'Jupiter', 'The Sun'],
    explain: 'The Moon is about a quarter of Earth’s width, Jupiter is 11 times wider than Earth, and the Sun is about 10 times wider than Jupiter.'},
   adult: {q: 'Put these in order of distance from Earth, nearest first.', items: ['The Moon', 'The Sun', 'Proxima Centauri (the nearest other star)', 'The Andromeda Galaxy'],
    explain: 'The Moon is about 1.3 light-seconds away, the Sun about 8 light-minutes, Proxima about 4.2 light years and Andromeda about 2.5 million light years.'}},
  3: {
   mid: {q: 'Why must you never look straight at the Sun?', options: ['It can permanently damage your eyes', 'It is rude', 'It only makes you sneeze', 'It is boring'], answer: 0,
    explain: 'The Sun is so bright it can burn the back of your eye, and it doesn’t hurt while it happens.'},
   older: {q: 'Which of these is a safe way to watch an eclipse?', options: ['A pinhole projector onto a card', 'Ordinary sunglasses', 'Binoculars', 'Squinting'], answer: 0,
    explain: 'A pinhole projects an image of the Sun onto card, so you never look at the Sun itself. Sunglasses are nowhere near dark enough.'},
   adult: {q: 'Eclipse glasses let through only about 1/100,000 of sunlight. Bright sunlight is about 100,000 lux. How bright does it look through the glasses?', options: ['1 lux', '10 lux', '100 lux', '1,000 lux'], answer: 0,
    explain: '100,000 ÷ 100,000 = 1 lux — about as bright as a candle a metre away.'}}};

 // ---- 40. Aurora Lights (the Sun and Earth’s magnetism) ----
 L.aurora = {
  1: {
   mid: {q: 'What is the most common colour of the northern lights?', options: ['Green', 'Orange', 'Black', 'Brown'], answer: 0,
    explain: 'Green is the most common colour, from oxygen high in the air. Red and purple appear too.'},
   older: {q: 'The green glow of an aurora comes from which gas in the air being hit by particles?', options: ['Oxygen', 'Helium', 'Carbon dioxide', 'Water vapour'], answer: 0,
    explain: 'Oxygen atoms about 100–250 km up give off green light when the Sun’s particles strike them. Nitrogen adds blue and purple.'},
   adult: {q: 'An aurora glows about 220 km up, and a jet airliner flies at about 11 km. How many times higher is the aurora?', options: ['2', '20', '200', '2,000'], answer: 1,
    explain: '220 ÷ 11 = 20 times higher.'}},
  2: {
   mid: {q: 'Earth’s magnetic field is shaped like that of a giant…?', options: ['Bar magnet', 'Heater', 'Mirror', 'Fan'], answer: 0,
    explain: 'Earth’s field is like a huge bar magnet inside the planet, with its poles near the geographic poles.'},
   older: {q: 'What protects us from most of the Sun’s fast particles?', options: ['Earth’s magnetic field', 'The Moon', 'The clouds', 'The oceans'], answer: 0,
    explain: 'The magnetic field deflects most of the particles, steering a few down near the poles, where they make aurorae.'},
   adult: {q: 'A fast stream of particles from a solar storm travels the 150 million km to Earth in about 2 days. Roughly what is its average speed?', options: ['About 87 km/s', 'About 870 km/s', 'About 8,700 km/s', 'About 3 km/s'], answer: 1,
    explain: '2 days = 172,800 seconds, and 150,000,000 ÷ 172,800 ≈ 870 km per second.'}},
  3: {
   older: {q: 'What are the SOUTHERN lights called?', options: ['Aurora australis', 'Aurora borealis', 'The Milky Way', 'The Southern Cross'], answer: 0,
    explain: 'Aurora borealis is in the north and aurora australis in the south. (The Southern Cross is a star pattern.)'},
   adult: {q: '“Australis” is Latin for “southern”. Which country’s name comes from the same word?', options: ['Australia', 'Austria', 'Argentina', 'Antarctica'], answer: 0,
    explain: 'Australia was the “southern land”. Austria sounds similar but comes from a word meaning “eastern realm”, and Antarctica means “opposite the Arctic”.'}}};

 // ---- 41. The Lost Probe (binary, space history) — numbers change every time ----
 L.probe = {
  1: {
   young: () => { const n = R(4, 7);
    return {q: `The probe counts in binary: ${bin(n, 3)} (fours, twos, ones). What number is that?`, answer: String(n), explain: `${placeSum(n, 3)}.`}; },
   mid: () => { const n = R(8, 15);
    return {q: `Convert the binary code ${bin(n, 4).replace(/ /g, '')} into a normal number. (Places: eights, fours, twos, ones)`, answer: String(n), explain: `${placeSum(n, 4)}.`}; },
   older: () => { const n = R(17, 31);
    return {q: `Convert ${bin(n, 5).replace(/ /g, '')} (base 2) to decimal.`, answer: String(n), explain: `Places 16, 8, 4, 2, 1: ${placeSum(n, 5)}.`}; },
   adult: () => { const n = R(20, 60), b = n.toString(2);
    return {q: `The probe needs the number ${n} in binary. Write it in binary (type just the 1s and 0s).`, answer: b, explain: `Take away the biggest powers of 2 that fit: ${placeSum(n, b.length).replace(/ = \d+$/, '')} = ${n}, so ${n} is ${b} in binary.`}; }},
  2: {
   mid: {q: 'The probe’s radio signals now take about 22 hours to reach Earth. What does that tell us?', options: ['It is incredibly far away', 'Its radio is broken', 'Radio is slow in the dark', 'It is very close'], answer: 0,
    explain: 'Radio travels at the speed of light, so a 22-hour delay means it is about 22 light-hours away — billions of kilometres.'},
   older: {q: 'The probe was launched in 1977. How old will it be in 2027?', options: ['40 years', '47 years', '50 years', '57 years'], answer: 2,
    explain: '2027 − 1977 = 50 years — and it is still sending signals home.'},
   adult: {q: 'The probe travels about 17 km every second. Roughly how far does it go in a year (about 31.5 million seconds)?', options: ['About 54 million km', 'About 536 million km', 'About 5.4 billion km', 'About 17 million km'], answer: 1,
    explain: '17 × 31,500,000 ≈ 535,500,000 km — about 536 million km a year.'}}};

 // ---- 42. The Goldilocks Planet (habitable zones) ----
 L.goldilocks = {
  1: {
   mid: {q: 'Which planet in our solar system is in the Sun’s habitable zone?', options: ['Earth', 'Mercury', 'Jupiter', 'Neptune'], answer: 0,
    explain: 'Earth is at just the right distance for liquid water. Mercury is far too hot; Jupiter and Neptune are far too cold.'},
   older: {q: 'A star is hotter and brighter than our Sun. Where is its habitable zone?', options: ['Further out from the star', 'Closer in to the star', 'In the same place as the Sun’s', 'It does not have one'], answer: 0,
    explain: 'A brighter star heats things more, so the “just right” distance moves further out.'},
   adult: {q: 'Light from a star spreads out by the inverse square law. A planet twice as far from the star as another gets what fraction of the light?', options: ['1/2', '1/4', '1/8', '2'], answer: 1,
    explain: 'Twice the distance spreads the light over 2² = 4 times the area, so it gets a quarter.'}},
  2: {
   mid: {q: 'At normal air pressure, between which temperatures is water a liquid?', options: ['0 °C and 100 °C', '−50 °C and 0 °C', '100 °C and 200 °C', 'At any temperature'], answer: 0,
    explain: 'Water freezes at 0 °C and boils at 100 °C, so it is liquid in between.'},
   older: {q: 'Why might a planet in the habitable zone still have no liquid water?', options: ['It may have no atmosphere to stop its water escaping', 'The zone is always wrong', 'Water cannot exist in space', 'Its star gives no light'], answer: 0,
    explain: 'Without enough air pressure, water boils away into space. Our Moon is in the habitable zone but is dry.'},
   adult: {q: 'This planet’s year is 225 Earth days long. Roughly how many of its years pass in 9 Earth years (ignore leap days)?', options: ['About 9.1', 'About 14.6', 'About 22.5', 'About 36.5'], answer: 1,
    explain: '9 × 365 = 3,285 days, and 3,285 ÷ 225 = 14.6 of its years.'}},
  3: {
   mid: {q: 'How do astronomers often discover exoplanets?', options: ['The star dims slightly when the planet passes in front of it', 'They see them with binoculars', 'Exoplanets glow brightly', 'Spacecraft visit them'], answer: 0,
    explain: 'Most exoplanets are found by the tiny dip in a star’s brightness as the planet crosses in front of it.'},
   older: {q: 'When a planet passes in front of its star and dims it slightly, what is that called?', options: ['A transit', 'A lunar eclipse', 'A supernova', 'A comet'], answer: 0,
    explain: 'A transit. We can see Mercury and Venus transit our Sun from Earth, too.'},
   adult: {q: 'In a transit, a planet blocks 1% of its star’s light. The light blocked is the planet’s disc compared with the star’s disc (area goes as width²). If the star is 100 units wide, about how wide is the planet?', options: ['1 unit', '10 units', '50 units', '0.1 units'], answer: 1,
    explain: 'Area ratio 1/100 means width ratio √(1/100) = 1/10, so 100 ÷ 10 = 10 units.'}}};

 // ---- 43. Meteor Shower (meteors) ----
 L.meteors = {
  1: {
   mid: {q: 'Why does a meteor get so hot?', options: ['It rushes into the air so fast that the air in front of it is squashed and gets very hot', 'It is already burning in space', 'The Moon heats it', 'It is electric'], answer: 0,
    explain: 'At tens of kilometres a second, the air in front is compressed and heats to thousands of degrees, so the meteor glows and burns up.'},
   older: {q: 'A meteor shower happens when Earth passes through…', options: ['The dusty trail left by a comet', 'A cloud of stars', 'The Moon’s shadow', 'A black hole'], answer: 0,
    explain: 'Comets (and a few asteroids) leave dust along their orbits. Each year Earth crosses some of these trails, giving showers like the Perseids in August.'},
   adult: {q: 'A meteor enters the air at 60 km per second. If it didn’t slow down, how long would it take to cross 100 km of atmosphere?', options: ['About 0.6 s', 'About 1.7 s', 'About 6 s', 'About 17 s'], answer: 1,
    explain: '100 ÷ 60 ≈ 1.7 seconds — which is why meteors are such quick flashes.'}},
  3: {
   older: {q: 'Meteoroid, meteor, meteorite: what is the difference?', options: ['The rock in space / the streak of light / the piece that lands', 'They are all the same thing', 'Only their size', 'Only their colour'], answer: 0,
    explain: 'A meteoroid is the rock in space, a meteor is the glowing streak, and a meteorite is any piece that reaches the ground.'},
   adult: {q: 'Suppose about 50 tonnes of space dust fall on Earth every day. Roughly how much is that in a year?', options: ['About 1,800 tonnes', 'About 18,000 tonnes', 'About 180,000 tonnes', 'About 365 tonnes'], answer: 1,
    explain: '50 × 365 = 18,250 tonnes — about 18,000 tonnes a year.'}}};

 // ---- 44. Space Junk Clean-up (orbits, energy) ----
 L.junk = {
  1: {
   mid: {q: 'Space junk can travel at about 8 km every second. How far does it go in one minute?', options: ['48 km', '480 km', '8 km', '4,800 km'], answer: 1,
    explain: '8 × 60 = 480 km in a minute.'},
   older: {q: 'Why can even a tiny fleck of paint damage a spacecraft window?', options: ['At such a high speed it carries a lot of energy', 'Paint is acid', 'It is magnetic', 'It is very heavy'], answer: 0,
    explain: 'Kinetic energy grows with the square of speed, so even tiny things at orbital speed hit very hard.'},
   adult: {q: 'Kinetic energy = ½ × mass × speed². How many times more energy does a piece of junk at 8 km/s have than the same piece at 2 km/s?', options: ['4', '8', '16', '64'], answer: 2,
    explain: '4 times the speed gives 4² = 16 times the energy.'}},
  3: {
   mid: {q: 'At the end of its life, an old satellite can be steered down into the air. What happens to it?', options: ['It burns up as it falls', 'It floats away', 'It bounces off', 'It becomes a star'], answer: 0,
    explain: 'Like a meteor, it heats up and mostly burns up in the atmosphere.'},
   older: {q: 'What is the best plan to stop more junk being made?', options: ['Bring old satellites down, or move them out of the way, when they finish', 'Launch more without a plan', 'Blow up old satellites', 'Paint them bright colours'], answer: 0,
    explain: 'Planning each satellite’s end stops it becoming junk. Blowing things up makes thousands more pieces!'},
   adult: {q: 'Suppose there are 36,000 tracked pieces of junk. If we remove 1,500 a year and no more are added, how many years would it take to clear them all?', options: ['12', '24', '36', '240'], answer: 1,
    explain: '36,000 ÷ 1,500 = 24 years.'}}};

 // ---- 45. The Star Shell (solar power) — panel numbers change every time ----
 L.starshell = {
  1: {
   mid: {q: 'When do solar panels make the most electricity?', options: ['On a sunny day around midday', 'At night', 'On a cloudy evening', 'In the dark'], answer: 0,
    explain: 'They need light: the brighter and more direct the sunlight, the more they make.'},
   older: {q: 'A solar panel turns 20% of the light energy into electricity. If 1,000 W of light falls on it, how much electrical power does it make?', options: ['20 W', '200 W', '800 W', '1,000 W'], answer: 1,
    explain: '20% of 1,000 = 200 watts. The other 800 W mostly warms the panel.'},
   adult: {q: 'A 400 W panel works at full power for an average of 4 hours a day. How many kilowatt-hours does it make in a 30-day month?', options: ['4.8 kWh', '48 kWh', '480 kWh', '1.6 kWh'], answer: 1,
    explain: '400 W × 4 h = 1,600 Wh a day; × 30 = 48,000 Wh = 48 kWh.'}},
  2: {
   young: () => { const a = R(2, 5), b = R(2, 5);
    return {q: `A row has ${a} panels and there are ${b} rows. How many panels?`, answer: String(a * b), explain: `${b} rows of ${a}: ${b} × ${a} = ${a * b}.`}; },
   mid: () => { const a = R(5, 9), b = R(6, 12);
    return {q: `We need ${a} rows of ${b} panels. How many panels?`, answer: String(a * b), explain: `${a} × ${b} = ${a * b}.`}; },
   older: () => { const a = R(8, 15), b = R(6, 12), k = R(2, 9);
    return {q: `A grid of ${a} × ${b} panels has ${k} broken ones. How many panels still work?`, answer: String(a * b - k), explain: `${a} × ${b} = ${a * b}, and ${a * b} − ${k} = ${a * b - k}.`}; },
   adult: () => { const r = 2 * R(2, 6), c = R(5, 12);
    return {q: `Each panel is 1.5 m by 1 m. What is the total area, in square metres, of a grid ${r} panels by ${c} panels?`, answer: String(1.5 * r * c), explain: `${r} × ${c} = ${r * c} panels, each 1.5 m², so ${r * c} × 1.5 = ${1.5 * r * c} m².`}; }},
  3: {
   mid: {q: 'Which of these is a renewable energy source?', options: ['Wind', 'Coal', 'Oil', 'Natural gas'], answer: 0,
    explain: 'Wind keeps on blowing, so it won’t run out. Coal, oil and gas will.'},
   older: {q: 'Why are coal, oil and gas called fossil fuels?', options: ['They formed from living things that died millions of years ago', 'They are only found next to fossils', 'They are very old machines', 'They are made of rock'], answer: 0,
    explain: 'Coal comes from ancient plants and oil and gas from tiny sea creatures, buried and squeezed for millions of years.'},
   adult: {q: 'A wind turbine makes 2 megawatts when the wind blows, and on average works at full power 35% of the time. Roughly how many megawatt-hours does it make in a day?', options: ['About 8.4 MWh', 'About 16.8 MWh', 'About 48 MWh', 'About 0.7 MWh'], answer: 1,
    explain: '2 MW × 24 h = 48 MWh at full power, and 35% of 48 = 16.8 MWh.'}}};

 // ---- 46. Twin Suns (stars, days) — numbers change every time ----
 L.twinsuns = {
  1: {
   mid: {q: 'Is our Sun part of a binary star?', options: ['No — the Sun is on its own', 'Yes, with Jupiter', 'Yes, with the Moon', 'Yes, with Mars'], answer: 0,
    explain: 'The Sun is a single star. Jupiter is a planet, not a star — though about half of all stars do have partners.'},
   older: {q: 'Two stars orbit each other. What holds them together?', options: ['Gravity', 'Magnetism', 'Air pressure', 'A rope of gas'], answer: 0,
    explain: 'Gravity pulls them towards each other, and their orbital motion stops them colliding.'},
   adult: {q: 'Two stars orbit their shared balance point, where mass × distance is the same on both sides. One star has 3 times the mass of the other, and they are 400 million km apart. How far is the heavier star from the balance point?', options: ['100 million km', '133 million km', '300 million km', '200 million km'], answer: 0,
    explain: 'The heavier star is 3 times closer: split 400 into 1 + 3 parts, so 100 million km for the heavy star and 300 million km for the light one.'}},
  2: {
   mid: {q: 'In the UK, which way does your shadow point at midday?', options: ['North', 'South', 'East', 'West'], answer: 0,
    explain: 'At midday the Sun is due south, so your shadow points away from it — north.'},
   older: {q: 'Why is it warmer in summer?', options: ['The Sun is higher, so its light is more concentrated, and the days are longer', 'Earth is much closer to the Sun', 'The Sun is bigger in summer', 'There are more clouds'], answer: 0,
    explain: 'Earth’s tilt makes the Sun climb higher in summer. In fact Earth is closest to the Sun in January!'},
   adult: {q: 'Sun A gives this planet 600 units of light. Sun B is equally bright but twice as far away. Light falls off with distance squared. How much light does sun B give?', options: ['300', '150', '1,200', '75'], answer: 1,
    explain: 'Twice as far means 1/2² = 1/4 as much: 600 ÷ 4 = 150.'}},
  3: {
   young: () => { const d = R(20, 30);
    return {q: `A day here is ${d} hours long. How many hours are in 2 days?`, answer: String(2 * d), explain: `${d} + ${d} = ${2 * d} hours.`}; },
   mid: () => { const d = R(20, 36);
    return {q: `A day lasts ${d} hours. How many hours are in a 7-day week?`, answer: String(7 * d), explain: `${d} × 7 = ${7 * d} hours.`}; },
   older: () => { const d = R(20, 36), n = R(8, 15);
    return {q: `A ${d}-hour day: how many hours are in ${n} days?`, answer: String(d * n), explain: `${d} × ${n} = ${d * n} hours.`}; },
   adult: () => { const d = pick([12, 15, 20, 30, 40, 60]);
    return {q: `A day on this planet lasts ${d} hours. How many of its days fit into 365 Earth days?`, answer: String(8760 / d), explain: `365 × 24 = 8,760 hours, and 8,760 ÷ ${d} = ${8760 / d} of its days.`}; }}};

 // ---- 47. Diving into the Gas Giant (pressure, gases) ----
 L.gasdive = {
  1: {
   older: {q: 'Divers on Earth feel about 1 extra atmosphere of pressure for every 10 m of water. What is the total pressure at 30 m deep, counting the 1 atmosphere of air on top?', options: ['3 atmospheres', '4 atmospheres', '30 atmospheres', '31 atmospheres'], answer: 1,
    explain: '30 m of water adds 3 atmospheres, plus 1 from the air: 4 atmospheres.'},
   adult: {q: 'In this gas giant, the pressure doubles every 25 km we dive. Starting at 1 bar, what is it 100 km down?', options: ['4 bar', '8 bar', '16 bar', '100 bar'], answer: 2,
    explain: '100 km is 4 lots of 25 km, so it doubles 4 times: 2 × 2 × 2 × 2 = 16 bar.'}},
  2: {
   mid: {q: 'Which is the lightest gas of all?', options: ['Hydrogen', 'Helium', 'Oxygen', 'Carbon dioxide'], answer: 0,
    explain: 'Hydrogen is the lightest element. Helium is second — that is why it makes balloons float.'},
   adult: {q: 'Jupiter’s atmosphere is about 90% hydrogen atoms and 10% helium atoms. In a sample of 5,000 atoms, about how many are helium?', options: ['50', '500', '4,500', '1,000'], answer: 1,
    explain: '10% of 5,000 = 500 helium atoms (and 4,500 hydrogen).'}},
  3: {
   older: {q: 'The Great Red Spot is a storm. Roughly how long have astronomers been watching it?', options: ['Hundreds of years', 'A few days', 'About ten years', 'A million years'], answer: 0,
    explain: 'It has been watched since at least the 1800s, and possibly since the 1600s — a storm far older than anyone alive.'},
   adult: {q: 'The Great Red Spot is about 16,000 km wide, and Earth is about 12,700 km wide. Roughly how many times wider is the storm than Earth?', options: ['About 0.8', 'About 1.3', 'About 3', 'About 13'], answer: 1,
    explain: '16,000 ÷ 12,700 ≈ 1.26, so about 1.3 times — you could fit Earth inside it.'}}};

 // ---- 48. The Ice Moon Ocean (ice moons, deep-sea life) ----
 L.icemoon = {
  1: {
   mid: {q: 'Which real moon of Jupiter has an ocean under its icy crust?', options: ['Europa', 'Our Moon', 'Phobos', 'Deimos'], answer: 0,
    explain: 'Europa is thought to have a salty ocean under its ice — one of the best places to search for life beyond Earth.'},
   older: {q: 'The giant planet’s gravity squeezes and stretches the moon, heating its insides. What is this called?', options: ['Tidal heating', 'Solar heating', 'Nuclear fusion', 'Friction with air'], answer: 0,
    explain: 'Tidal heating: like bending a paper clip back and forth until it warms up.'},
   adult: {q: 'The ice shell is about 20 km thick, and our drill goes down 400 m a day. How many days until it reaches the ocean?', options: ['5', '50', '500', '20'], answer: 1,
    explain: '20 km = 20,000 m, and 20,000 ÷ 400 = 50 days.'}},
  2: {
   mid: {q: 'With no sunlight at the deep-sea vents, which living things can make food there?', options: ['Microbes that use chemicals', 'Green plants', 'Sunflowers', 'Nothing can live there'], answer: 0,
    explain: 'Microbes use the chemicals from the vents to make food, and other animals eat them.'},
   older: {q: 'Making food from chemicals instead of light is called…', options: ['Chemosynthesis', 'Photosynthesis', 'Respiration', 'Digestion'], answer: 0,
    explain: 'Chemosynthesis uses chemical energy; photosynthesis uses light energy.'},
   adult: {q: 'Water near deep-sea vents can be 400 °C without boiling. Why?', options: ['The huge pressure deep down raises its boiling point', 'It is not really water', 'Thermometers do not work there', 'Salt stops it boiling at any temperature'], answer: 0,
    explain: 'The higher the pressure, the higher the boiling point. Thousands of metres down, water stays liquid far above 100 °C.'}}};

 // ---- 49. The Edge of the Galaxy (galaxies, big numbers) ----
 L.galaxyedge = {
  1: {
   mid: {q: 'Where is our Sun in the Milky Way?', options: ['In one of the spiral arms, about halfway out', 'At the very centre', 'At the edge of the universe', 'Outside the galaxy'], answer: 0,
    explain: 'The Sun is in a spiral arm roughly halfway from the centre to the edge.'},
   older: {q: 'What is at the very centre of the Milky Way?', options: ['A supermassive black hole', 'The Sun', 'A giant planet', 'Nothing at all'], answer: 0,
    explain: 'A black hole about 4 million times the Sun’s mass, called Sagittarius A*, sits at the centre.'},
   adult: {q: 'The Milky Way is about 100,000 light years across. How long does light take to cross it?', options: ['About 100,000 years', 'About 100,000 days', 'About 1,000 years', 'About 1 million years'], answer: 0,
    explain: 'A light year is the distance light goes in a year, so 100,000 light years takes 100,000 years.'}},
  2: {
   mid: {q: 'Which is bigger: a million or a billion?', options: ['A billion — it is a thousand million', 'A million', 'They are the same', 'Neither'], answer: 0,
    explain: 'A million is 1,000,000 and a billion is 1,000,000,000 — a thousand times bigger.'},
   older: {q: 'If you counted one star every second without stopping, roughly how long would 100 billion stars take?', options: ['About 3 years', 'About 30 years', 'About 3,000 years', 'About 3 million years'], answer: 2,
    explain: 'A year is about 31.5 million seconds, and 100,000,000,000 ÷ 31,500,000 ≈ 3,170 years.'},
   adult: {q: 'Suppose the Milky Way has 200 billion stars, and there are 2 trillion galaxies with about as many each. Roughly how many stars is that?', options: ['4 × 10¹⁵', '4 × 10²³', '4 × 10³¹', '2 × 10¹²'], answer: 1,
    explain: '2 × 10¹¹ stars × 2 × 10¹² galaxies = 4 × 10²³ — more stars than grains of sand on all Earth’s beaches.'}},
  3: {
   mid: {q: 'One million is 1 followed by how many zeros?', answer: '6',
    explain: '1,000,000: six zeros. A billion has nine and a trillion twelve.'},
   older: {q: 'A googol is 10 to the power 100. How many zeros does it have when written out?', answer: '100',
    explain: '10 to the power 100 is 1 followed by 100 zeros. (The search company’s name comes from it!)'},
   adult: {q: 'Multiply one billion by one million. How many zeros does the answer have?', answer: '15',
    explain: 'A billion is 10⁹ and a million is 10⁶; multiplying adds the powers: 10¹⁵, so 15 zeros.'}}};

 // ---- 50. The Time Capsule (space history — Moon landing history may name Apollo) ----
 L.capsule1969 = {
  1: {
   mid: {q: 'Who was the second person to walk on the Moon, just minutes after the first?', options: ['Buzz Aldrin', 'Michael Collins', 'Yuri Gagarin', 'Tim Peake'], answer: 0,
    explain: 'Buzz Aldrin followed Neil Armstrong onto the Moon on 20 July 1969.'},
   older: {q: 'Michael Collins flew on Apollo 11 but never walked on the Moon. Why?', options: ['He stayed in orbit, flying the command module', 'He was ill', 'He missed the launch', 'He went to Mars instead'], answer: 0,
    explain: 'Collins kept the command module Columbia circling the Moon, ready to take Armstrong and Aldrin home.'},
   adult: {q: 'Twelve people walked on the Moon, on six landings between 1969 and 1972. On average, how many walked on the Moon per landing?', options: ['1', '2', '3', '6'], answer: 1,
    explain: '12 ÷ 6 = 2. Each landing had two moonwalkers, while a third crew member stayed in orbit.'}},
  2: {
   mid: {q: 'The first person went into space in 1961. People first walked on the Moon in 1969. How many years later was that?', answer: '8',
    explain: '1969 − 1961 = 8 years — an amazingly fast race.'},
   older: {q: 'The first powered aeroplane flew in 1903. The first Moon landing was in 1969. How many years apart were they?', answer: '66',
    explain: '1969 − 1903 = 66 years, from the first wobbly flight to walking on the Moon.'},
   adult: {q: 'Apollo 11 launched on 16 July 1969 and landed on the Moon on 20 July. How many days after launch was the landing?', answer: '4',
    explain: '20 − 16 = 4 days to travel about 384,000 km.'}},
  3: {
   older: {q: 'Who was the first woman in space, in 1963?', options: ['Valentina Tereshkova', 'Sally Ride', 'Helen Sharman', 'Marie Curie'], answer: 0,
    explain: 'Valentina Tereshkova orbited Earth 48 times in 1963. Helen Sharman was the first Briton in space, in 1991.'},
   adult: {q: 'Gagarin’s spacecraft circled Earth at about 27,400 km per hour. At that speed, roughly how long would one 40,000 km lap take?', options: ['About 15 minutes', 'About 88 minutes', 'About 4 hours', 'About 1 day'], answer: 1,
    explain: '40,000 ÷ 27,400 ≈ 1.46 hours ≈ 88 minutes. (Gagarin’s real flight took 108 minutes from launch to landing: up at orbit height a lap is longer than 40,000 km, and he also had to climb and come down.)'}}};

 return L;
})();
