// Starlane Trader — adventure puzzles by level (since starlane-v27).
// StarAdvLevels[adventureId][sceneIndex] = {young, mid, older, adult}: each level is its own puzzle on the same
// topic, getting harder. A level is an object {q, options, answer, explain} (choose), {q, answer, explain} (code:
// answer is a string), {q, items, explain} (order: items in the right order), or a function returning one, so the
// numbers change every time it is played. A level left out falls back to the original scene in
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

 return L;
})();
