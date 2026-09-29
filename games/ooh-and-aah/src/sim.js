// Ooh × Aah: SIM module (spec DESIGN.md v1.1). Sections: 1 RNG · 2 DATA · 3 SIM · 4 HELPERS · 5 BOTS.
//
// `OohSim` is fully self-contained: it references no outer names, so the page can build a Blob Worker
// from `OohSim.toString()` (spec §11.5 in-page bots). State is plain JSON, advanced only by `step`.
// The SIM never reads Math.random or any clock (no Date at all); its only randomness is `state.rng` (sfc32, spec §11.3).
// Bots use their own xorshift32 (spec §12.1). Ported from the design-time v11 reference sim + bots.
function OohSim() {
  'use strict';
  const VERSION = '1.1.0';

  /* ================================================================== 1 · RNG (spec §11.3, exact) */
  function cyrb128(str){let h1=1779033703,h2=3144134277,h3=1013904242,h4=2773480762;
   for(let i=0,k;i<str.length;i++){k=str.charCodeAt(i);h1=h2^Math.imul(h1^k,597399067);h2=h3^Math.imul(h2^k,2869860233);
    h3=h4^Math.imul(h3^k,951274213);h4=h1^Math.imul(h4^k,2716044179);}
   h1=Math.imul(h3^(h1>>>18),597399067);h2=Math.imul(h4^(h2>>>22),2869860233);h3=Math.imul(h1^(h3>>>17),951274213);
   h4=Math.imul(h2^(h4>>>19),2716044179);h1^=(h2^h3^h4);h2^=h1;h3^=h1;h4^=h1;return [h1>>>0,h2>>>0,h3>>>0,h4>>>0];}
  function rngNext(st){let [a,b,c,d]=st.rng;a|=0;b|=0;c|=0;d|=0;let t=(a+b|0)+d|0;d=d+1|0;a=b^b>>>9;b=c+(c<<3)|0;
   c=(c<<21|c>>>11);c=c+t|0;st.rng=[a>>>0,b>>>0,c>>>0,d>>>0];return (t>>>0)/4294967296;}   // sfc32
  // Seeding: st.rng = cyrb128(String(seed)); then call rngNext 15 times and discard the results.
  function seedRng(seed) { const st = { rng: cyrb128(String(seed)) }; for (let i = 0; i < 15; i++) rngNext(st); return st.rng; }
  // A private sfc32 stream (cosmetics: fxRng = seed + 'fx'; keepsake offers). Never stored in SIM state.
  function sfcStream(seedStr) { const st = { rng: seedRng(seedStr) }; return () => rngNext(st); }
  function fxRng(seed) { return sfcStream(String(seed) + 'fx'); }
  // Bot randomness (spec §12.1): xorshift32 seeded with (seedNumber × 2654435761) >>> 0.
  function botSeed(seed) { return ((typeof seed === 'number' ? seed : cyrb128(String(seed))[0]) * 2654435761) >>> 0; }
  function xorshift32(seed) { let s = seed >>> 0; if (!s) s = 7; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

  /* ================================================================== 2 · DATA (spec §1, §4, §5) */
  const sig2 = v => Number(v.toPrecision(2));
  const BASES = [100, 330, 1000, 2600, 5500, 9600, 16000, 26500];
  // §5.1: the table is the data. Asserted against the formula in tools/test-sim.mjs.
  const TARGETS = [100, 130, 150, 330, 430, 590, 1000, 1300, 1800, 2600, 3400, 4700,
    5500, 7200, 9900, 9600, 12000, 17000, 16000, 21000, 29000, 27000, 34000, 180000];
  // §5.10 Afterparty: base9 = 80,000, base_n = base_{n−1} × (n − 6); multipliers ×1 / ×1.3 / ×1.8 to 2 s.f.
  const AFTERPARTY_TARGETS = (() => { const out = []; let b = 80000;
    for (let n = 9; n <= 12; n++) { if (n > 9) b = b * (n - 6); for (const m of [1, 1.3, 1.8]) out.push(sig2(b * m)); } return out; })();
  const COUNTDOWN_R8 = 900000;
  const SHOW_MULTS = [1, 1.3, 1.8];

  const FESTIVALS = ['Spring Lanterns', 'May Fair', 'Midsummer', 'Regatta', 'Harvest Moon', 'Bonfire Night', 'Winter Lights', "New Year's Eve",
    'Afterparty I', 'Afterparty II', 'Afterparty III', 'Afterparty IV'];
  const SHOW_NAMES = ['Twilight', 'Evening', 'Headliner'];

  const COL_IDS = ['R', 'A', 'G', 'B'];
  const COLOURS = {
    R: { id: 'R', name: 'Red', chem: 'strontium', shape: 'circle', glyph: '●', role: 'Aah', hex: '#D55E00', hc: '#FF7A33' },
    A: { id: 'A', name: 'Gold', chem: 'sodium', shape: 'triangle', glyph: '▲', role: 'Hang, coins, Crowd', hex: '#E69F00', hc: '#FFC23D' },
    G: { id: 'G', name: 'Green', chem: 'barium', shape: 'rounded square', glyph: '■', role: 'Ooh', hex: '#009E73', hc: '#22D3A6' },
    B: { id: 'B', name: 'Blue', chem: 'copper', shape: 'diamond', glyph: '◆', role: '× (rare)', hex: '#56B4E9', hc: '#8AD7FF' },
    W: { id: 'W', name: 'White', chem: 'magnesium', shape: 'cross', glyph: '✚', role: 'Utility; counts as no colour', hex: '#F0F0F0', hc: '#FFFFFF' },
    X: { id: 'X', name: 'Rainbow', chem: null, shape: '8-point star with 4 colour wedges', glyph: '✺', role: 'Counts as every colour while up',
      hex: null, hc: null, wedges: ['#D55E00', '#E69F00', '#009E73', '#56B4E9'], wedgesHc: ['#FF7A33', '#FFC23D', '#22D3A6', '#8AD7FF'] },
    fusion: { id: 'fusion', name: 'Fusion accent', chem: null, shape: 'braid', glyph: '✦', role: 'Fusion banners and badges', hex: '#CC79A7', hc: '#F29BD4' },
  };

  // §4.3. Card text is the ★1 template: {n} scales with the star multiplier, {x0.6} renders 1 + 0.6·m,
  // {%} is the copy rate for the shell's own star. Thresholds, Hang and divisors are written literally.
  //  id           name                mono  col  R   $  H  F  unlock          params                                           tags                    pattern     text
  const SHELL_ROWS = [
    ['peony', 'Peony', 'Pe', '*', 'C', 3, 1, 1, null, { ooh: 20 }, 'basic', 'sphere', '+{20} Ooh.'],
    ['chrys', 'Chrysanthemum', 'Ch', '*', 'C', 3, 1, 1, null, { ooh: 10, oohPerUp: 20 }, 'Canopy', 'trails', '+{10} Ooh; +{20} Ooh per burst up.'],
    ['comet', 'Comet', 'Co', '*', 'C', 3, 0, 1, null, { oohIfEmpty: [40, 10] }, 'Thunder', 'streak', '+{40} Ooh if the sky is empty, else +{10}.'],
    ['strobe', 'Strobe', 'St', 'W', 'C', 3, 0, 1, null, { ooh: 10, aah: 2 }, 'basic', 'strobe', '+{10} Ooh, +{2} Aah.'],
    ['palm', 'Palm', 'Pa', '*', 'C', 3, 2, 1, null, { ooh: 12, aahIfOwnColUp: 3 }, 'Mono, Rainbow', 'fronds', '+{12} Ooh; +{3} Aah if a burst of its colour is up.'],
    ['willow', 'Willow', 'Wi', 'A', 'C', 4, 3, 1, null, { ooh: 20 }, 'Canopy', 'droop', '+{20} Ooh.'],
    ['mine', 'Mine', 'Mi', '*', 'C', 3, 1, 1, null, { oohIfFirst: [40, 15] }, 'Position, Salvo', 'fan', '+{40} Ooh if first to fire, else +{15}.'],
    ['salute', 'Salute', 'Sa', 'W', 'C', 4, 0, 2, null, { ooh: 10, clearAah: 3 }, 'Thunder', 'ring', '+{10} Ooh. Clears the sky: +{3} Aah per burst cleared.'],
    ['candle', 'Roman Candle', 'RC', '*', 'C', 4, 1, 2, null, { ooh: 15 }, 'Salvo', 'triple', '3 bursts, each +{15} Ooh.', { shots: 3 }],
    ['heart', 'Heart', 'He', 'R', 'C', 3, 1, 2, null, { aah: 3, aahIfColUp: ['R', 3] }, 'Mono', 'heart', '+{3} Aah; +{3} more if a Red is up.'],
    ['girandola', 'Girandola', 'Gi', 'A', 'C', 3, 1, 2, null, { ooh: 10, aah: 1, crowd: 3 }, 'Crowd', 'spiral', '+{10} Ooh, +{1} Aah. Crowd +{3}.'],
    ['fern', 'Fern', 'Fe', 'G', 'C', 3, 2, 2, 'm_mono', { ooh: 10, aahPerColUp: ['G', 3, 0] }, 'Mono', 'fronds', '+{10} Ooh; +{3} Aah per Green up.'],
    ['crossette', 'Crossette', 'Cr', '*', 'U', 5, 1, 3, null, { aahPerUp: 4 }, 'Canopy, Salvo', 'split', '+{4} Aah per burst up.'],
    ['echo', 'Echo Shell', 'Ec', 'W', 'U', 4, 1, 3, null, { echo: [1, 1.5, 2] }, 'Salvo', 'ghost', 'Repeats the + numbers of the burst before it ({%}).'],
    ['waterfall', 'Waterfall', 'Wa', 'W', 'U', 5, 2, 3, null, { oohIfLast: [60, 15] }, 'Position, Canopy', 'curtain', '+{60} Ooh if last to fire, else +{15}.'],
    ['kamuro', 'Kamuro', 'Ka', 'A', 'U', 5, 3, 3, null, { ooh: 20, coinIfColUp: ['A', 2, 1] }, 'Canopy, Gold', 'droop', '+{20} Ooh; +${1} if 2+ Gold are up.'],
    ['dahlia', 'Dahlia', 'Da', '*', 'U', 5, 1, 3, null, { oohPerDistinct: 10, aahPerDistinct: 3 }, 'Rainbow', 'sphere', '+{10} Ooh and +{3} Aah per distinct colour up.'],
    ['smiley', 'Smiley', 'Sm', '*', 'U', 5, 2, 3, null, { ooh: 15, aah: 1, crowd: 4 }, 'Crowd', 'smiley', '+{15} Ooh, +{1} Aah. Crowd +{4}.'],
    ['glitter', 'Glitter', 'Gl', 'A', 'U', 5, 2, 3, null, { ooh: 10, aah: 2, extend: 1 }, 'Canopy', 'glitter', '+{10} Ooh, +{2} Aah; every burst up hangs {1} longer.'],
    ['strontium', 'Strontium Star', 'Sr', 'R', 'U', 5, 2, 3, 'm_fusion', { ooh: 10, aahPerColUp: ['R', 3, 1] }, 'Mono', 'heart', '+{10} Ooh; +{3} Aah per Red up (min +{1}).'],
    ['crackle', 'Crackle', 'Ck', 'W', 'U', 5, 2, 3, 'm_fusion', { aah: 2, aahPerFired: 1 }, 'Salvo, Thunder', 'crackle', '+{2} Aah, +{1} Aah per burst fired before it.'],
    ['horsetail', 'Horsetail', 'Ho', 'G', 'U', 5, 2, 3, 'm_busy', { oohPerFired: 10 }, 'Salvo', 'cascade', '+{10} Ooh per burst fired before it.'],
    ['brocade', 'Brocade', 'Br', 'A', 'U', 5, 2, 3, 'm_mono', { ooh: 10, aahPerColUp: ['A', 2, 0] }, 'Mono (Gold)', 'glitter', '+{10} Ooh; +{2} Aah per Gold up.'],
    ['tourbillon', 'Tourbillon', 'To', 'X', 'U', 5, 1, 3, 'm_spectrum', { ooh: 20, aah: 2 }, 'Rainbow, Mono', 'spiral', '+{20} Ooh, +{2} Aah. While up, counts as every colour.', { wildColour: true }],
    ['crest', 'Town Crest', 'TC', 'A', 'U', 6, 1, 3, 'm_crowd', { aahPerCrowd: 12 }, 'Crowd', 'crest', '+{1} Aah per 12 Crowd (min +{1}).'],
    ['thunder', 'Thunder King', 'TK', 'W', 'R', 7, 0, 4, null, { ooh: 20, clearX: 0.4, floorAah: 1 }, 'Thunder', 'ring', '+{20} Ooh. Clears sky: ×(1+{0.4} per cleared) Aah, else +{1} Aah.'],
    ['finale', 'Grand Finale', 'GF', 'B', 'R', 8, 3, 4, null, { xLastPerUp: 0.4, floorAah: 2 }, 'Canopy', 'cluster', 'Last with 1+ up: ×(1+{0.4} per burst up) Aah. Else +{2} Aah.'],
    ['puresky', 'Pure Sky', 'PS', 'B', 'R', 8, 1, 4, null, { xMonoPerUp: 0.5, floorAah: 2 }, 'Mono', 'ring', '2+ up, one colour, no White: ×(1+{0.5} per up) Aah; else +{2}.'],
    ['barrage', 'Barrage', 'Ba', 'B', 'R', 8, 1, 4, null, { xPerFired: 0.05, floorAah: 1 }, 'Salvo', 'salvo', '×(1+{0.05} per burst fired before it) Aah; if first, +{1} Aah.'],
    ['prism', 'Prism', 'Pr', 'B', 'R', 8, 1, 4, 'm_spectrum', { xPerDistinct: 0.4, floorAah: 1 }, 'Rainbow', 'prism', '×(1+{0.4} per distinct colour up) Aah; if none, +{1} Aah.'],
    ['bluemoon', 'Blue Moon', 'BM', 'B', 'R', 8, 2, 4, 'm_headliner', { xIfColUp: ['B', 0.6], floorAah: 2 }, 'Mono (Blue)', 'moon', '×{x0.6} Aah if another Blue is up. Else +{2} Aah.'],
    ['nishiki', 'Nishiki Kamuro', 'NK', 'A', 'R', 8, 3, 4, 'm_triple', { xPerColFired: ['A', 0.1], floorAah: 1 }, 'Gold, Canopy', 'droop', '×(1+{0.1} per Gold fired before it) Aah; if none, +{1} Aah.'],
    ['cake', 'Cake', 'Ca', '*', 'R', 9, 1, 4, 'm_busy', { refire: [0.75, 1, 1.5] }, 'Salvo, Canopy', 'rain', 'Repeats the + numbers of every non-Blue burst up ({%}).'],
    ['saturn', 'Saturn', 'Sn', 'B', 'R', 8, 2, 4, 'm_crowd', { xPerCrowdGained: 0.05, floorAah: 1 }, 'Crowd', 'planet', '×(1+{0.05} per Crowd gained this show) Aah; if none, +{1} Aah.'],
  ];
  const X_KEYS = ['x', 'xPerUp', 'clearX', 'xPerDistinct', 'xMonoPerUp', 'xLastPerUp', 'xIfColUp', 'xPerColFired', 'xPerFired', 'xPerCrowdGained'];
  const SKY_KEYS = ['oohPerUp', 'oohPerDistinct', 'aahIfOwnColUp', 'aahIfColUp', 'aahPerColUp', 'aahPerUp', 'aahPerDistinct',
    'xPerUp', 'xPerDistinct', 'xMonoPerUp', 'xLastPerUp', 'xIfColUp', 'refire', 'coinIfColUp'];
  const SHELLS = {}; const SHELL_IDS = [];
  for (const r of SHELL_ROWS) {
    const [id, name, mono, col, rar, cost, hang, fest, lock, p, tags, pattern, text, extra] = r;
    const row = { id, name, mono, col, rar, cost, hang, fest, lock, p, params: p, shots: (extra && extra.shots) || 1,
      wildColour: !!(extra && extra.wildColour), tags: tags.split(', '), pattern, text };
    row.isX = X_KEYS.some(k => p[k] !== undefined);
    row.readsSky = SKY_KEYS.some(k => p[k] !== undefined);
    row.clears = !!(p.clearAah || p.clearX);
    SHELLS[id] = row; SHELL_IDS.push(id);
  }
  const SH = SHELLS;
  const ARCHETYPES = {
    canopy: ['willow', 'glitter', 'chrys', 'crossette', 'cake', 'kamuro', 'finale', 'waterfall'],
    mono: ['heart', 'strontium', 'palm', 'fern', 'brocade', 'puresky', 'kamuro', 'nishiki', 'bluemoon'],
    rainbow: ['palm', 'dahlia', 'tourbillon', 'prism', 'chrys', 'comet', 'heart', 'fern'],
    salvo: ['candle', 'crackle', 'crossette', 'echo', 'mine', 'horsetail', 'cake', 'barrage'],
    thunder: ['salute', 'thunder', 'comet', 'crackle', 'willow', 'chrys', 'waterfall', 'echo'],
    crowd: ['girandola', 'smiley', 'crest', 'saturn', 'kamuro', 'willow', 'glitter'],
  };

  // §4.4 burst patterns (units: px/s, px/s², drag per 60 Hz frame, seconds).
  const PATTERNS = {
    sphere: { n: 48, speed: 170, gravity: 40, drag: .975, life: 1.4, trail: .25, twinkle: 0 },
    trails: { n: 56, speed: 180, gravity: 40, drag: .975, life: 1.6, trail: .7, twinkle: 0 },
    streak: { n: 12, speed: 120, gravity: 30, drag: .98, life: 1.2, trail: .9, twinkle: 0, special: 'A single rising star with a long tail, then a 12-star pop' },
    strobe: { n: 24, speed: 120, gravity: 20, drag: .97, life: 1.2, trail: 0, twinkle: 1, special: 'Stars blink at 8 Hz' },
    fronds: { n: 42, speed: 150, gravity: 70, drag: .985, life: 1.8, trail: .8, twinkle: 0, special: '7 thick arms × 6 stars' },
    droop: { n: 60, speed: 120, gravity: 90, drag: .99, life: 2.8, trail: .95, twinkle: .2 },
    fan: { n: 36, speed: 260, gravity: 120, drag: .98, life: 1.2, trail: .5, twinkle: 0, special: 'Upward fan ±40° from the ground' },
    ring: { n: 32, speed: 220, gravity: 0, drag: .95, life: .6, trail: 0, twinkle: 0, special: 'White flash disc, 120 ms, subject to the flash limits' },
    triple: { n: 16, speed: 150, gravity: 40, drag: .97, life: 1.0, trail: .3, twinkle: 0, special: 'Each shot rises from the tube and pops' },
    heart: { n: 40, speed: 150, gravity: 25, drag: .97, life: 1.5, trail: .3, twinkle: 0, special: 'Parametric outline' },
    spiral: { n: 16, speed: 90, gravity: 10, drag: .99, life: 1.8, trail: .6, twinkle: .3, special: 'Rotates at 6 rad/s' },
    split: { n: 8, nAfter: 32, speed: 160, gravity: 40, drag: .975, life: 1.6, trail: .4, twinkle: 0, special: 'Each star splits into 4 at 45% of its life' },
    ghost: { n: 0, special: 'Replays the previous pattern at 50% alpha, 80 ms later' },
    curtain: { n: 60, speed: 40, gravity: 110, drag: .99, life: 2.2, trail: .9, twinkle: .2, special: '30 emitters along a horizontal line' },
    smiley: { n: 44, speed: 140, gravity: 20, drag: .97, life: 1.6, trail: .2, twinkle: 0, special: 'Circle, 2 eyes and an arc' },
    glitter: { n: 56, speed: 160, gravity: 50, drag: .98, life: 2.2, trail: .8, twinkle: .8 },
    crackle: { n: 24, speed: 150, gravity: 40, drag: .97, life: 1.0, trail: .2, twinkle: 0, special: '40 micro-pops between 40% and 90% of its life' },
    cascade: { n: 50, speed: 200, gravity: 150, drag: .985, life: 2.0, trail: .8, twinkle: 0, special: 'A fountain arcing to one side' },
    crest: { n: 44, speed: 140, gravity: 20, drag: .97, life: 1.6, trail: .2, twinkle: 0, special: 'Shield outline' },
    cluster: { n: 36, count: 3, speed: 180, gravity: 40, drag: .975, life: 1.8, trail: .5, twinkle: .3, special: '3 spheres 120 ms apart' },
    salvo: { n: 10, count: 10, speed: 140, gravity: 40, drag: .97, life: .9, trail: .3, twinkle: 0, special: '10 pops over 500 ms up its column' },
    prism: { n: 48, speed: 170, gravity: 40, drag: .975, life: 1.5, trail: .3, twinkle: 0, special: '4 hue quadrants' },
    moon: { n: 30, speed: 60, gravity: 0, drag: .99, life: 1.8, trail: 0, twinkle: .3, special: 'Glowing disc and halo ring' },
    rain: { n: 14, count: 5, speed: 120, gravity: 40, drag: .97, life: 1.0, trail: .3, twinkle: 0, special: '5 pops sweeping left to right' },
    planet: { n: 36, nRing: 24, speed: 130, gravity: 10, drag: .98, life: 1.8, trail: .2, twinkle: 0, special: 'Sphere plus a tilted ring' },
  };

  // §4.5 fusions (A fires immediately before B; applies to B's first burst, before B's own effect).
  const FUSION_ROWS = [
    ['palm>palm', 'Palm Grove', { aah: 3 }, null, 1, '+{3} Aah.'],
    ['salute>comet', 'Thunderclap Comet', { x: 0.3 }, null, 2, '×{x0.3} Aah.'],
    ['strobe>crossette', 'Strobing Crossette', { aahPerUp: 1 }, null, 3, '+{1} Aah per burst up.'],
    ['candle>crossette', 'Crossfire', { aah: 6 }, null, 3, '+{6} Aah.'],
    ['comet>thunder', 'Falling Star', { xPerUp: 0.25 }, null, 4, '×(1+{0.25} per burst up) Aah.'],
    ['waterfall>finale', 'Niagara Finale', { ooh: 60, xLastPerUp: 0.2 }, null, 4, '+{60} Ooh; last with 1+ up: ×(1+{0.2} per burst up) Aah.'],
    ['kamuro>puresky', 'Midas Sky', { x: 0.5 }, null, 4, '×{x0.5} Aah.'],
    ['heart>strontium', 'Sweetheart Star', { aahPerColUp: ['R', 2, 0] }, 'm_fusion', 3, '+{2} Aah per Red up.'],
    ['crackle>thunder', "Dragon's Roar", { aah: 2, aahPerFired: 1 }, 'm_fusion', 4, '+{2} Aah, +{1} Aah per burst fired before it.'],
    ['glitter>brocade', 'Golden Veil', { coin: 2, aahPerColUp: ['A', 1, 0] }, 'm_mono', 3, '+${2}; +{1} Aah per Gold up.'],
    ['dahlia>prism', 'Aurora', { xPerDistinct: 0.2 }, 'm_spectrum', 4, '×(1+{0.2} per distinct colour up) Aah.'],
    ['smiley>crest', 'Hometown Hero', { aahPerCrowd: 12 }, 'm_crowd', 3, '+{1} Aah per 12 Crowd (min +{1}).'],
  ];
  const FUSIONS = {}; const FUSION_KEYS = [];
  FUSION_ROWS.forEach((r, i) => { const [key, name, p, lock, fest, text] = r; const [a, b] = key.split('>');
    FUSIONS[key] = { key, n: i + 1, a, b, name, p, params: p, lock, fest, text }; FUSION_KEYS.push(key); });
  const FU = FUSIONS;
  const TECHNIQUES = [
    'Long hang first: Willow, Glitter or a Tall Tube before Chrysanthemum, Crossette or Grand Finale.',
    'Clear, then Comet: Salute or Thunder King right before Comet.',
    'Many bursts first: Roman Candle or Mortar before Crackle, Horsetail or Barrage.',
    'Spotlight on a Chrysanthemum ★3.',
    'Mortar on a × shell.',
    'Grow the Crowd early: fire Girandola and Smiley in the first festivals and sell them later. The Crowd stays.',
    'Countdown: your last tube opens and closes the show.',
  ];

  // §4.6 rigs (one per tube; never move with shells; cannot be sold).
  const RIGS = {
    tall: { id: 'tall', name: 'Tall Tube', cost: 4, glyph: '↑', glyphText: 'Taller tube outline ↑', text: "This tube's bursts hang 1 longer.", lock: null },
    brass: { id: 'brass', name: 'Brass Tube', cost: 5, glyph: '◯', glyphText: 'Brass band ring', text: '+2 Aah after each burst from this tube.', lock: null },
    spotlight: { id: 'spotlight', name: 'Spotlight', cost: 5, glyph: '▽', glyphText: 'Beam cone', text: 'Ooh from this tube (shell and fusion) ×2.', lock: null },
    lucky: { id: 'lucky', name: 'Lucky Tube', cost: 4, glyph: '∩', glyphText: 'Horseshoe ∩', text: '+$1 when this tube fires (once per show).', lock: null },
    mortar: { id: 'mortar', name: 'Mortar', cost: 10, glyph: '◎', glyphText: 'Double ring ◎', text: 'This tube fires its shell twice. At most 1 Mortar per rack.', lock: null },
  };
  const RIG_IDS = ['tall', 'brass', 'spotlight', 'lucky', 'mortar'];

  // §4.7 Headliners (drawn in table order at createState; F8 is always the Countdown).
  const HEADLINER_ROWS = [
    ['headwind', 'Headwind', 1, 1, 'The first burst is a dud: it scores nothing but still hangs.', 'a strong first shell', 'a gust icon on the first tube to fire, hatched to show the dud'],
    ['drizzle', 'Drizzle', 1, 3, 'All Hang −1.', 'long-hanging shells', 'one Hang pip crossed out on every shell'],
    ['critic', 'The Critic', 2, 5, 'A burst the same colour as the burst before it earns no Ooh (White and Rainbow exempt).', 'one-colour skies', 'a monocle between back-to-back tubes of the same colour'],
    ['shortfuse', 'Short Fuse', 3, 6, 'Only tubes 1–5 fire.', 'a 6th tube', 'tube 6 hatched out'],
    ['fog', 'Fog', 3, 7, 'Shells see only the 2 newest bursts.', 'long-hanging shells and Rainbow shells', 'a fog band, and no tube sees more than 2'],
    ['ordinance', 'Noise Ordinance', 3, 7, 'Shells printed White fire at half strength.', 'racks built on White shells', 'a ½ badge on White shells'],
    ['windshift', 'Wind Shift', 4, 7, 'The fuse runs right to left; rigs stay put.', 'rigs and fusions', 'the fuse arrow and tube numbers reversed, and Match lit'],
    ['ferry', 'Late Ferry', 4, 7, 'Half the Crowd misses the show: the Crowd adds only half.', 'a big Crowd', 'a ½ on the Crowd counter'],
    ['crossed', 'Crossed Wires', 5, 7, 'Tubes 2, 4, 6 fire first, then 1, 3, 5.', 'fire order and fusions', 'tube numbers in the new firing order, and Match lit'],
    ['streetlights', 'Sodium Streetlights', 5, 7, 'The embankment lamps wash out tubes 2, 4 and 6: their bursts count as White.', 'one-colour and Rainbow skies', 'tubes 2, 4 and 6 greyed, with a lamp icon'],
    ['powercut', 'Power Cut', 6, 7, '+Aah is capped at 30 per show (× still works).', 'big +Aah stacks', 'a cap mark at 30 on the Aah meter'],
    ['rival', 'Rival Crew', 6, 7, 'Your ♛ Crowd Favourite (as of lighting) fires at half strength.', 'a rack that leans on one shell', 'a ½ on the ♛ tube'],
    ['countdown', 'Midnight Countdown', 8, 8, 'The fuse fires your tubes last to first, then first to last. The sky carries over, and there is no rain check.', 'no single build. Every shell fires twice', 'an out-and-back fuse path, with two rows of tube numbers'],
  ];
  const HEADLINERS = {}; const HEADLINER_IDS = [];
  for (const [id, name, min, max, text, counters, telegraph] of HEADLINER_ROWS) { HEADLINERS[id] = { id, name, min, max, text, counters, telegraph }; HEADLINER_IDS.push(id); }
  const DRAW_ROWS = HEADLINER_ROWS.filter(r => r[0] !== 'countdown').map(r => ({ id: r[0], min: r[2], max: r[3] }));
  // Every rule id the resolver understands, for labels (Headliners plus the Renown 8 three-pass Countdown).
  const RULE_INFO = Object.assign({}, HEADLINERS, {
    countdown3: { id: 'countdown3', name: 'Midnight Countdown', min: 8, max: 8, text: 'Renown 8: the fuse fires your tubes first to last, last to first, then first to last again. The target is 900,000.', counters: 'no single build', telegraph: 'three rows of tube numbers' },
  });
  const TWISTS = {
    twilight: ['headwind', 'drizzle', 'critic'],                                                          // Renown 2 (§4.10)
    afterparty: ['drizzle', 'critic', 'fog', 'ordinance', 'ferry', 'streetlights', 'powercut', 'rival'],  // §5.10
  };

  // §4.8 kits.
  const KITS = {
    apprentice: { id: 'apprentice', name: 'Apprentice', rack: [['willow', 'A'], ['peony', 'R'], ['strobe', 'W'], null], coins: 4, crowd: 0, text: 'Default', lock: null },
    salvo: { id: 'salvo', name: 'Salvo Crew', rack: [['candle', 'R'], ['crackle', 'W'], null, null], coins: 0, crowd: 0, cards: 2, text: 'Shops show only 2 shell cards', lock: 'm_busy' },
    chemist: { id: 'chemist', name: 'Chemist', rack: [['palm', 'R'], ['heart', 'R'], ['dahlia', 'G'], null], coins: 0, crowd: 0, noRigs: true, chooseCol: true, text: 'You choose the colour of every wild shell card; rigs are never offered', lock: 'm_spectrum' },
    market: { id: 'market', name: 'Night Market', rack: [['peony', 'R'], ['strobe', 'W'], null, null], coins: 6, crowd: 0, openShop: true, interestCap: 2, text: 'A shop opens before show 1; interest is capped at +$2', lock: 'm_rigger' },
    showman: { id: 'showman', name: 'Showman', rack: [['girandola', 'A'], ['peony', 'R'], ['strobe', 'W'], null], coins: 4, crowd: 5, noSponsor: true, text: 'Sponsors never appear', lock: 'm_crowd' },
  };
  const KIT_IDS = ['apprentice', 'salvo', 'chemist', 'market', 'showman'];

  // §4.9 Sponsors (Festival 3+, Twilight and Evening shows).
  const SPONSOR_KINDS = ['coin', 'crowd', 'rare'];
  const SPONSORS = {
    coin: { kind: 'coin', flavour: 'Riverside Brewery', reward: '+$2' },
    crowd: { kind: 'crowd', flavour: 'The Gazette', reward: 'Crowd +4' },
    rare: { kind: 'rare', flavour: 'The Collector', reward: 'The next shop adds a 4th card: a Rare (an Uncommon in Festival 3). Rerolls keep it.' },
  };

  // §4.10 Renown (index = level; 0 = none).
  const RENOWN = [
    { level: 0, text: 'No modifiers.' },
    { level: 1, text: 'Headliner targets +25% (not the Countdown).' },
    { level: 2, text: 'Every Twilight from Festival 2 on gets a mild twist: Headwind, Drizzle or The Critic.' },
    { level: 3, text: 'Rerolls start at $2 (+$1 each).' },
    { level: 4, text: 'Tubes cost +$4 ($10 / $14).' },
    { level: 5, text: "Shell cards cost +$1. Upgrade prices don't change." },
    { level: 6, text: 'No rain check.' },
    { level: 7, text: 'The Countdown also halves your ♛ Crowd Favourite, as Rival Crew does.' },
    { level: 8, text: 'The Countdown fires your tubes first to last, last to first, then first to last again. Its target is 900,000.' },
  ];

  // §4.11 milestones. `goal` is the progress-bar goal for the run value described in `metric`.
  // `metric` is the Logbook's "Progress:" line; `progress` is the in-run toast ("Busy Sky: 4 of 8 bursts in one show").
  const MILESTONE_ROWS = [
    ['m_fusion', 'First Fusion', 'Fire any fusion', 1, 'fusions fired', { shells: ['strontium', 'crackle'] }, '{v} of {g} fusions fired'],
    ['m_busy', 'Busy Sky', '8+ bursts in one show', 8, 'bursts in one show, not counting the Countdown', { shells: ['horsetail', 'cake'], kits: ['salvo'] }, '{v} of {g} bursts in one show'],
    ['m_mono', 'Monochrome Night', 'A show with 5+ coloured bursts, all one colour, White ignored', 5, 'coloured bursts in a one-colour show', { shells: ['fern', 'brocade'] }, '{v} of {g} bursts in one colour'],
    ['m_spectrum', 'Full Spectrum', '3 colours up at once, or bursts of all 4 colours fired in one show', 3, 'colours up at once, and all 4 fired in one show counts as 3', { shells: ['prism', 'tourbillon'], kits: ['chemist'] }, '{v} of {g} colours up at once'],
    ['m_crowd', 'Packed House', 'Crowd reaches 40', 40, 'Crowd', { shells: ['crest', 'saturn'], kits: ['showman'] }, 'Crowd {v} of {g}'],
    ['m_triple', 'Triple-break', 'Own a ★3 shell', 3, 'highest ★ owned', { shells: ['nishiki'] }, 'your best shell is ★{v} of ★{g}'],
    ['m_headliner', 'Headliner Hunter', "Pass Festival 4's Headliner", 1, "Festival 4's Headliner passed", { shells: ['bluemoon'] }, "Festival 4's Headliner passed: {v} of {g}"],
    ['m_rigger', 'Rigger', '3 rigs installed at once', 3, 'rigs installed at once', { kits: ['market'] }, '{v} of {g} rigs installed at once'],
    ['m_win', 'Happy New Year', 'Win a run', 1, 'wins', { other: ['Renown 1', 'Afterparty', 'Daily Show'] }, '{v} of {g} wins'],
    ['m_logbook', 'Logbook Half', 'Discover 6 of the 12 fusions', 6, 'fusions discovered', { other: ['Every unfound fusion shows its first shell'] }, '{v} of {g} fusions found'],
  ];
  const MILESTONES = {}; const MILESTONE_IDS = [];
  for (const [id, name, text, goal, metric, unlocks, progress] of MILESTONE_ROWS) {
    MILESTONES[id] = { id, name, text, goal, metric, progress, unlocks: { shells: unlocks.shells || [], kits: unlocks.kits || [], other: unlocks.other || [] } };
    MILESTONE_IDS.push(id);
  }
  const POOL_MILESTONES = ['m_fusion', 'm_busy', 'm_mono', 'm_spectrum', 'm_crowd', 'm_triple', 'm_headliner', 'm_rigger'];

  // §4.12 lessons (first match wins). {…} fields are filled by lessonFor().
  const LESSONS = [
    { n: 1, when: 'Lost at the Countdown, and the best reorder of the final rack would have passed', text: 'The Countdown fires your last tube first and last. Rearranging would have scored {n}.' },
    { n: 2, when: 'Lost on a show lit while the crowd was Restless', text: 'The crowd was Restless when you lit {show}. Keep building until it reads Hopeful or Eager.' },
    { n: 3, when: 'The losing show had a × shell with more +Aah after it than before it', text: 'Your {shell} multiplied {a} Aah, then {b} more Aah arrived after it. Fire +Aah shells first.' },
    { n: 4, when: 'Lost on a Headliner, and the best reorder passes', text: 'Rearranging for {Headliner} would have scored {n}. Try Rehearse (H){ and Match (M)} before Headliners.' },
    { n: 5, when: 'A sky reader averaged fewer than 1.5 bursts seen over the last 3 shows', text: 'Your {shell} saw {x} bursts on average. Put it after your long-hanging shells.' },
    { n: 6, when: 'A clearer averaged ≤ 1 burst cleared', text: 'Your {shell} cleared {x} bursts on average. Fire it after the sky fills up.' },
    { n: 7, when: 'Lost on a sponsored show', text: 'Sponsors raise the target ×1.5. Take one when the crowd stays Eager with Accept on.' },
    { n: 8, when: 'An empty tube fired in 2+ shows while you held ≥ $3', text: 'An empty tube fired nothing in {n} shows. Even a Peony adds 20 Ooh.' },
    { n: 9, when: 'Never held ≥ $5 at a payout after show 4', text: 'Holding $5 or more pays +$1 per $5 every show (up to +$5).' },
    { n: 10, when: 'Lost with no fusion all run and 3+ upgrades', text: 'Upgrades double. ✦ fusions and × shells multiply. Drop a card on a full tube next to its partner. The old shell moves to the Crate.' },
    { n: 11, when: 'Never upgraded', text: 'Drop a card on its twin: all its numbers double.' },
    { n: 12, when: 'Crowd < 25 at the end of F4', text: 'Girandola and Smiley pay into every future show through the Crowd.' },
    { n: 13, when: 'Won', text: 'Next: Renown {n+1}: {modifier}.' },
    { n: 14, when: 'Default', text: 'Put long-hanging shells first and the shells that count the sky after them.' },
  ];

  // §4.13 one-line tooltips (shown once each; triggers are evaluated by the UI).
  const TOOLTIP_ROWS = [
    ['t_fuse', 'Show 1 build', 'Light the fuse. Tubes fire left to right.'],
    ['t_sky', 'First shell lifted', 'Bursts hang in the sky. The sees number counts the bursts still up when a tube fires.'],
    ['t_aah', 'First Aah > 1 at the slam', 'Aah multiplies Ooh.'],
    ['t_head', 'Show 3 build', 'Headwind: your first burst is a dud but still hangs. Open with a long-hanging shell.'],
    ['t_mood', 'Show 3 build (first-ever run), after t_head', "The crowd's mood reads your rack against tonight's target. It never shows the score."],
    ['t_crowd', 'First Crowd gain', 'Every show you pass grows your Crowd. It adds its size to Ooh.'],
    ['t_interest', 'First payout at ≥ $5', '+$1 for every $5 you hold (max +$5).'],
    ['t_twin', 'First twin card', 'Drop it on its twin: all its numbers double.'],
    ['t_fusion', 'First fusion badge', '✦ This card fuses with a shell you own. Drop it where the rack shows ✦.'],
    ['t_crate', 'First shell placed in the Crate', "Crate shells don't fire. Swap them in any time."],
    ['t_rig', 'First rig card', 'Rigs stay with the tube, not the shell.'],
    ['t_tube', 'First tube button', 'More tubes, more bursts. 6 at most.'],
    ['t_sponsor', 'First Sponsor', "A sponsor raises tonight's target ×1.5 and pays if you make it. Check the crowd with Accept on."],
    ['t_match', 'First Wind Shift or Crossed Wires build', "Match re-seats your shells so tonight's fuse fires them in their usual order."],
    ['t_rain', 'First miss', 'Rain check used. One more miss ends the run.'],
    ['t_count', 'F8 build', 'Midnight Countdown: the fuse fires your tubes last to first, then first to last. Your last tube opens and closes the show.'],
  ];
  const TOOLTIPS = {}; const TOOLTIP_IDS = [];
  for (const [id, trigger, text] of TOOLTIP_ROWS) { TOOLTIPS[id] = { id, trigger, text }; TOOLTIP_IDS.push(id); }

  // §1 rules card and glossary.
  const RULES_CARD = [
    'The fuse fires your tubes left to right. Each burst stays up for the next few bursts (its Hang), and later shells score by what is still up.',
    'Shells add Ooh, add Aah or multiply Aah. Aah starts at 1, and your Crowd adds its size to Ooh. Applause is Ooh × Aah. Reach the target to pass. You may miss one show per run (your rain check).',
    'Between shows, spend coins on shells, tubes and rigs. Drop a card on its twin to upgrade it. Some shells fuse when they fire right after a partner.',
  ];
  const GLOSSARY = [
    ['Ooh', 'The base of your score. Shells add Ooh, and your Crowd adds its size.'],
    ['Aah', 'Multiplies Ooh. It starts at 1 each show, and shells add to it or multiply it.'],
    ['Applause', 'Your score for a show: Ooh × Aah. Reach the target to pass.'],
    ['Burst', 'One firing of a shell. Most shells make 1 burst, a Roman Candle makes 3, and a Mortar rig doubles a tube\'s bursts.'],
    ['Up / the sky', 'The bursts still hanging when a shell fires. The burst being fired is not up yet.'],
    ['Hang', 'How many later bursts a burst stays up for.'],
    ['Sees N', 'The number of bursts up when this tube fires for the first time.'],
    ['Fire order', "The order in which bursts fire: normally tube 1 to the last tube, unless tonight's rule changes it."],
    ['Tube', 'A slot in the rack. You start with 4; the maximum is 6.'],
    ['Rig', 'A tube upgrade. It stays on the tube, not on the shell.'],
    ['Crate', "2 spare slots. Shells in the Crate don't fire."],
    ['★ / break', 'Upgrade tier: ★1, ★2 (double-break), ★3 (triple-break).'],
    ['Twin', 'A card for a shell you own. Drop it on that shell to upgrade it: all its numbers double, up to ★3.'],
    ['Fusion', "Fire a shell right before its partner, and the partner's first burst fuses. The Logbook lists all 12."],
    ['Crowd', 'A counter that persists through the run and adds its size to Ooh at the end of every show.'],
    ['Crowd mood', "Restless, Hopeful or Eager: the crowd's read of your rack against tonight's target. It never shows a number."],
    ['Interest', 'After each show you pass, +$1 for every $5 you hold (up to +$5).'],
    ['Rain check', 'Forgives one miss per run, but not at the Countdown.'],
    ['Encore', 'Applause of at least 2× the target. Crowd +2 × the festival number.'],
    ['Sponsor', "Optional. Raises this show's target ×1.5 for a reward."],
    ['Headliner', 'The 3rd show of each festival, with a rule twist. It is announced a festival ahead.'],
    ['Match', "Re-seats your shells so that tonight's fuse fires them in their usual order."],
    ['Rehearse', "Previews the next Headliner: the chips and the crowd mood read your rack under its rule."],
    ['Restore', 'Puts your shells back in the tubes they held at the last show.'],
    ['♛ Crowd Favourite', 'The shell whose removal would cost the most Applause right now.'],
    ['Keepsake', 'After a run, keep one Common shell. It starts your next run in the Crate.'],
    ['Renown', 'Harder levels you unlock by winning. Each level adds one rule to all the ones before it.'],
    ['Fair Weather', 'An easier mode: every target ×0.75, and you can relight the Countdown once. These runs are marked.'],
    ['Afterparty', 'The optional endless mode after a win.'],
  ];

  // §5.6 rarity weights by festival (Common / Uncommon / Rare), index f−1, F8+ uses the last row.
  const RARITY = [[100, 0, 0], [100, 0, 0], [70, 30, 0], [55, 33, 12], [50, 35, 15], [45, 37, 18], [42, 38, 20], [40, 38, 22]];
  const MOODS = ['restless', 'hopeful', 'eager'];
  const MOOD_NAMES = { restless: 'Restless', hopeful: 'Hopeful', eager: 'Eager' };

  const DATA = {
    version: VERSION, TARGETS, AFTERPARTY_TARGETS, BASES, SHOW_MULTS, COUNTDOWN_R8, FESTIVALS, SHOW_NAMES,
    SHELLS, SHELL_IDS, ARCHETYPES, PATTERNS, FUSIONS, FUSION_KEYS, TECHNIQUES, RIGS, RIG_IDS,
    HEADLINERS, HEADLINER_IDS, RULE_INFO, TWISTS, KITS, KIT_IDS, SPONSORS, SPONSOR_KINDS, RENOWN,
    MILESTONES, MILESTONE_IDS, LESSONS, TOOLTIPS, TOOLTIP_IDS, COLOURS, COL_IDS, RULES_CARD, GLOSSARY, RARITY, MOODS, MOOD_NAMES,
  };

  /* ================================================================== 3 · SIM: resolver (spec §3) */
  const fest = s => Math.floor(s / 3) + 1;
  const starMult = s => s === 3 ? 4 : s === 2 ? 2 : 1;
  const isUp = (b, c) => b.wild || b.col === c;
  function ruleFlags(rules) {
    const R = {};
    if (!rules) return R;
    if (typeof rules === 'string') { R[rules] = true; return R; }
    for (const r of rules) if (r) R[r] = true;
    return R;
  }
  const ruleList = rules => !rules ? [] : typeof rules === 'string' ? [rules] : Array.from(rules).filter(Boolean);
  function distinct(vis) { let set = 0, w = 0; for (const b of vis) { if (b.wild) w++; else if (b.col === 'R') set |= 1; else if (b.col === 'A') set |= 2; else if (b.col === 'G') set |= 4; else if (b.col === 'B') set |= 8; }
    const n = (set & 1) + ((set >> 1) & 1) + ((set >> 2) & 1) + ((set >> 3) & 1); return Math.min(4, n + w); }
  function countCol(vis, c) { let n = 0; for (const b of vis) if (isUp(b, c)) n++; return n; }
  function monoSky(v) { if (v.length < 2) return false; const nw = v.find(b => !b.wild); if (!nw) return true; const c = nw.col; if (c === 'W') return false; return v.every(b => b.wild || b.col === c); }

  // The repeatable +terms of §4.2. Returns Ooh; Aah is left in PA (avoids an allocation per call).
  let PA = 0;
  function plus(p, m, cx, col) {
    const v = cx.vis, up = v.length; let o = 0, a = 0;
    if (p.ooh) o += p.ooh * m;
    if (p.oohPerUp) o += p.oohPerUp * m * up;
    if (p.oohIfEmpty) o += (up === 0 ? p.oohIfEmpty[0] : p.oohIfEmpty[1]) * m;
    if (p.oohIfFirst) o += (cx.fired === 0 ? p.oohIfFirst[0] : p.oohIfFirst[1]) * m;
    if (p.oohIfLast) o += (cx.isLast ? p.oohIfLast[0] : p.oohIfLast[1]) * m;
    if (p.oohPerFired) o += p.oohPerFired * m * cx.fired;
    if (p.oohPerDistinct) o += p.oohPerDistinct * m * distinct(v);
    if (p.aah) a += p.aah * m;
    if (p.aahIfOwnColUp && col !== 'W' && col !== 'X' && v.some(b => isUp(b, col))) a += p.aahIfOwnColUp * m;
    if (p.aahIfColUp && countCol(v, p.aahIfColUp[0]) > 0) a += p.aahIfColUp[1] * m;
    if (p.aahPerColUp) { const n = countCol(v, p.aahPerColUp[0]); a += n > 0 ? p.aahPerColUp[1] * m * n : p.aahPerColUp[2] * m; }
    if (p.aahPerUp) a += p.aahPerUp * m * up;
    if (p.aahPerDistinct) a += p.aahPerDistinct * m * distinct(v);
    if (p.aahPerFired) a += p.aahPerFired * m * cx.fired;
    if (p.aahPerCrowd) a += Math.max(1, Math.floor(cx.st.crowd / p.aahPerCrowd)) * m;
    PA = a; return o;
  }
  // Power Cut: +Aah never takes addAah past 30. Returns the Aah actually added.
  function addAah(st, a) { if (st.R.powercut) a = Math.max(0, Math.min(a, 30 - st.addAah)); st.addAah += a; st.aah += a; return a; }
  const r2 = v => Math.round(v * 1000) / 1000;

  // Steps 4a–4e of §3.1 for one parameter block (a shell row, or a fusion with m = 1).
  function applyBlock(p, m, cx, col, wild, half, starForRate, isFusion) {
    const st = cx.st, v = cx.vis, T = st.trace, P = st.cur, tube = cx.tube;
    let o = plus(p, m, cx, col), a = PA;
    let cleared = 0;
    if (p.clearAah || p.clearX) {
      cleared = v.length; cx.clears = true;
      if (T) T.push({ type: 'clear', n: cleared, ids: v.map(b => b.n), tube });
      if (P) P.cleared += cleared;
    }
    if (p.clearAah) a += p.clearAah * m * cleared;
    if (p.echo && cx.prevBurst) {
      const pb = cx.prevBurst;
      if (pb.id !== 'echo' && pb.id !== 'cake') {
        const r = p.echo[starForRate - 1] * (half ? 0.5 : 1);
        const eo = plus(SH[pb.id].p, starMult(pb.star), cx, pb.col), ea = PA;
        o += eo * r; a += ea * r; st.repeats++;
        if (T) T.push({ type: 'repeat', from: pb.n, shell: pb.id, rate: r, tube });
      }
    }
    if (p.refire) {
      const r = p.refire[starForRate - 1] * (half ? 0.5 : 1);
      for (const b of v) {
        if (SH[b.id].col === 'B' || b.id === 'echo' || b.id === 'cake') continue;
        const ro = plus(SH[b.id].p, starMult(b.star), cx, b.col), ra = PA;
        o += ro * r; a += ra * r; st.repeats++;
        if (T) T.push({ type: 'repeat', from: b.n, shell: b.id, rate: r, tube });
      }
    }
    let critic = false;
    if (st.R.critic && cx.prevBurst && cx.prevBurst.col === col && col !== 'W' && col !== 'X' && !wild && !cx.prevBurst.wild) { critic = o !== 0; o = 0; }
    if (cx.spot) o *= 2;
    st.ooh += o;
    const aIn = a, aGot = addAah(st, a);
    if (T) {
      if (o !== 0 || critic) T.push({ type: 'gainOoh', v: o, tube, critic: critic || undefined, fusion: isFusion || undefined, ooh: st.ooh, aah: st.aah });
      if (aGot !== 0 || aIn > 0) T.push({ type: 'gainAah', v: aGot, tube, capped: aGot < aIn || undefined, fusion: isFusion || undefined, ooh: st.ooh, aah: st.aah });
    }
    if (P) { P.ooh += o; P.aah += aGot; }
    let coins = 0;
    if (p.coin) coins += p.coin * m;
    if (p.coinIfColUp && countCol(v, p.coinIfColUp[0]) >= p.coinIfColUp[1]) coins += p.coinIfColUp[2] * m;
    if (coins) { st.coins += coins; if (T) T.push({ type: 'coinGain', v: coins, tube }); if (P) P.coins += coins; }
    if (p.crowd) { const g = p.crowd * m; st.crowd += g; st.crowdGain += g; if (T) T.push({ type: 'crowdGain', v: g, tube, crowd: st.crowd }); if (P) P.crowd += g; }
    // × terms (4d): multiply the factors whose condition holds; floorAah if the row has × terms and none held.
    let x = 1, hasX = false, held = false;
    if (p.x) { hasX = true; held = true; x *= 1 + p.x * m; }
    if (p.xPerUp) { hasX = true; if (v.length > 0) { held = true; x *= 1 + p.xPerUp * m * v.length; } }
    if (p.clearX) { hasX = true; if (cleared > 0) { held = true; x *= 1 + p.clearX * m * cleared; } }
    if (p.xPerDistinct) { hasX = true; const d = distinct(v); if (d > 0) { held = true; x *= 1 + p.xPerDistinct * m * d; } }
    if (p.xMonoPerUp) { hasX = true; if (monoSky(v)) { held = true; x *= 1 + p.xMonoPerUp * m * v.length; } }
    if (p.xLastPerUp) { hasX = true; if (cx.isLast && v.length > 0) { held = true; x *= 1 + p.xLastPerUp * m * v.length; } }
    if (p.xIfColUp) { hasX = true; if (countCol(v, p.xIfColUp[0]) > 0) { held = true; x *= 1 + p.xIfColUp[1] * m; } }
    if (p.xPerColFired) { hasX = true; const n = cx.colFired[p.xPerColFired[0]] || 0; if (n > 0) { held = true; x *= 1 + p.xPerColFired[1] * m * n; } }
    if (p.xPerFired) { hasX = true; if (cx.fired > 0) { held = true; x *= 1 + p.xPerFired * m * cx.fired; } }
    if (p.xPerCrowdGained) { hasX = true; if (st.crowdGain > 0) { held = true; x *= 1 + p.xPerCrowdGained * m * st.crowdGain; } }
    if (hasX && !held && p.floorAah) {
      const want = p.floorAah * m, got = addAah(st, want);
      if (T) T.push({ type: 'gainAah', v: got, tube, floor: true, capped: got < want || undefined, ooh: st.ooh, aah: st.aah });
      if (P) P.aah += got;
    }
    if (x > 1) {
      const aah0 = st.aah; st.aah *= x; st.xs++;
      if (T) T.push({ type: 'multAah', factor: x, tube, fusion: isFusion || undefined, ooh: st.ooh, aah: st.aah });
      if (P) { P.x *= x; P.xAah += st.aah - aah0; if (!isFusion) P.xAt = P.xAt === null ? st.addAah : P.xAt; }
    }
    if (p.extend) {
      const by = Math.ceil(p.extend * m);
      for (const b of cx.sky) b.hang += by;
      if (T) T.push({ type: 'extend', n: cx.sky.length, by, tube, ids: cx.sky.map(b => b.n) });
    }
  }

  // §3.1 fire sequence (tube indices, before dropping empty tubes).
  function seqOf(n, R) {
    let s = []; for (let i = 0; i < n; i++) s.push(i);
    if (R.windshift) s.reverse();
    if (R.crossed) s = s.filter(i => i % 2 === 1).concat(s.filter(i => i % 2 === 0));
    if (R.shortfuse) s = s.filter(i => i < 5);
    if (R.countdown) s = s.slice().reverse().concat(s);
    if (R.countdown3) s = s.concat(s.slice().reverse(), s);
    return s;
  }
  const shotsOf = t => (SH[t.shell.id].shots || 1) * (t.rig === 'mortar' ? 2 : 1);

  const NO_TRACE = Object.freeze([]);
  function newTubeStat(i) { return { tube: i, fires: false, sees: null, ooh: 0, aah: 0, x: 1, xAt: null, xAah: 0, coins: 0, crowd: 0, cleared: 0, fusion: null, partner: null, ordinals: [], passes: [], dud: false, half: false, washed: false, last: false }; }

  // resolveShow(tubes, {rules, crowd, fav, trace, perTube}) — pure. `trace` returns the §9 resolution events
  // (without seq); `perTube` returns per-tube local facts (used by previewChips, history and lessons).
  function resolveShow(tubes, ctx) {
    ctx = ctx || {};
    const R = ruleFlags(ctx.rules !== undefined ? ctx.rules : ctx.rule);
    const T = ctx.trace ? [] : null;
    const PT = (ctx.trace || ctx.perTube) ? tubes.map((t, i) => newTubeStat(i)) : null;
    const crowd0 = +ctx.crowd || 0;
    const st = { ooh: 0, aah: 1, addAah: 0, coins: 0, crowd: crowd0, crowdGain: 0, R, xs: 0, repeats: 0, fusions: [], fusionKeys: [], trace: T, cur: null,
      bursts: 0, maxUp: 0, colsUp: 0, colsFired: 0, monoShow: false, monoCount: 0 };
    const base = seqOf(tubes.length, R);
    const seq = base.filter(i => tubes[i] && tubes[i].shell);
    const passLen = R.countdown3 ? base.length / 3 : R.countdown ? base.length / 2 : base.length;
    let total = 0; for (const i of seq) total += shotsOf(tubes[i]);
    let sky = []; let fired = 0; let prevTubeShell = null, prevTube = -1, prevBurst = null; const colFired = {}; const lucky = {};
    let pos = -1;
    for (let q = 0; q < base.length; q++) {
      const i = base[q]; const t = tubes[i]; if (!t || !t.shell) continue;
      const s = t.shell, row = SH[s.id], shots = shotsOf(t);
      const pass = passLen ? Math.floor(q / passLen) : 0;
      pos++;
      const P = PT ? PT[i] : null; st.cur = P;
      for (let k = 0; k < shots; k++) {
        const washed = !!R.colourblind || (!!R.streetlights && i % 2 === 1);
        const col = washed ? 'W' : s.col;
        const wild = !!row.wildColour && !washed;
        const vis = R.fog ? sky.slice(-2) : sky;
        const isLast = fired === total - 1;
        const half = (!!R.ordinance && row.col === 'W') || (!!R.rival && i === ctx.fav);
        const m = starMult(s.star) * (half ? 0.5 : 1);
        const cx = { st, sky, vis, fired, isLast, colFired, prevBurst, spot: t.rig === 'spotlight', clears: false, tube: i };
        const dud = !!R.headwind && fired === 0;
        const h = row.hang + (t.rig === 'tall' ? 1 : 0) - (R.drizzle ? 1 : 0);
        if (P) { P.fires = true; if (P.sees === null) P.sees = vis.length; P.ordinals.push(fired + 1); P.passes.push(pass); if (dud) P.dud = true; if (half) P.half = true; if (washed) P.washed = true; if (isLast) P.last = true; }
        if (T) {
          T.push({ type: 'launch', tube: i, shot: k, n: fired, pass });
          T.push({ type: 'burst', tube: i, shell: s.id, uid: s.uid, col, star: s.star, sees: vis.length, up: vis.map(b => b.n), dud, half, washed, wild,
            n: fired, of: total, last: isLast, pass, hang: Math.max(0, h) });
        }
        if (!dud) {
          if (k === 0 && prevTubeShell) {
            const key = prevTubeShell.id + '>' + s.id; const fu = FU[key];
            if (fu) {
              st.fusions.push(fu.name); st.fusionKeys.push(key);
              if (T) T.push({ type: 'fusion', key, name: fu.name, tube: i, from: prevTubeShell.id });
              if (P && !P.fusion) P.fusion = key;
              if (PT && prevTube >= 0 && !PT[prevTube].partner) PT[prevTube].partner = { key, tube: i };
              applyBlock(fu.p, 1, cx, col, wild, false, 1, true);
            }
          }
          applyBlock(row.p, m, cx, col, wild, half, s.star, false);
          if (t.rig === 'brass') { const g = addAah(st, 2); if (T) T.push({ type: 'gainAah', v: g, tube: i, rig: 'brass', capped: g < 2 || undefined, ooh: st.ooh, aah: st.aah }); if (P) P.aah += g; }
          if (t.rig === 'lucky' && !lucky[i]) { lucky[i] = true; st.coins += 1; if (T) T.push({ type: 'coinGain', v: 1, tube: i, rig: 'lucky' }); if (P) P.coins += 1; }
        }
        if (cx.clears) sky = [];
        let expired = null;
        for (const b of sky) b.hang -= 1;
        if (sky.some(b => b.hang <= 0)) { if (T) expired = sky.filter(b => b.hang <= 0).map(b => b.n); sky = sky.filter(b => b.hang > 0); }
        if (T && expired) T.push({ type: 'skyAge', expired, tube: i });
        if (h > 0) sky.push({ n: fired, id: s.id, col, wild, star: s.star, hang: h, tube: i });
        if (sky.length > st.maxUp) st.maxUp = sky.length;
        { let set = 0, w = 0; for (const b of sky) { if (b.wild) w++; else if (b.col !== 'W') set |= b.col === 'R' ? 1 : b.col === 'A' ? 2 : b.col === 'G' ? 4 : 8; }
          const cu = Math.min(4, ((set & 1) + ((set >> 1) & 1) + ((set >> 2) & 1) + ((set >> 3) & 1)) + w); if (cu > st.colsUp) st.colsUp = cu; }
        fired++; colFired[col] = (colFired[col] || 0) + 1; prevBurst = { id: s.id, col, wild, star: s.star, n: fired - 1 };
      }
      prevTubeShell = s; prevTube = i;
    }
    st.bursts = fired;
    st.colsFired = COL_IDS.filter(c => colFired[c]).length;
    { const coloured = COL_IDS.map(c => colFired[c] || 0); const tot = coloured.reduce((x, y) => x + y, 0); const kinds = coloured.filter(x => x > 0).length;
      st.monoShow = tot >= 5 && kinds === 1; st.monoCount = kinds === 1 ? tot : 0; }
    st.cheer = Math.floor(st.crowd * (R.ferry ? 0.5 : 1));
    st.ooh += st.cheer;
    st.applause = Math.floor(st.ooh * st.aah);
    return { ooh: st.ooh, aah: st.aah, applause: st.applause, coins: st.coins, crowd: st.crowd, crowdGain: st.crowdGain, cheer: st.cheer,
      bursts: st.bursts, maxUp: st.maxUp, colsUp: st.colsUp, colsFired: st.colsFired, monoShow: st.monoShow, monoCount: st.monoCount,
      fusions: st.fusions, fusionKeys: st.fusionKeys, xs: st.xs, repeats: st.repeats, addAah: st.addAah,
      seq, trace: T || NO_TRACE, perTube: PT };
  }

  // ♛: resolves under no rule, then once per occupied tube with that tube emptied. Ties go left; empty rack → null.
  function favourite(tubes, crowd) {
    const base = resolveShow(tubes, { rules: null, crowd }).applause; let best = -Infinity, bi = null;
    for (let i = 0; i < tubes.length; i++) {
      if (!tubes[i] || !tubes[i].shell) continue;
      const rk = tubes.map((u, j) => j === i ? { shell: null, rig: u.rig } : u);
      const d = base - resolveShow(rk, { rules: null, crowd }).applause;
      if (d > best) { best = d; bi = i; }
    }
    return bi;
  }
  // Full scoring with the ♛ computed when the rules include Rival.
  function scoreFull(tubes, rules, crowd, opt) {
    rules = ruleList(rules);
    const fav = rules.includes('rival') ? favourite(tubes, crowd) : null;
    const r = resolveShow(tubes, { rules, crowd, fav, trace: opt && opt.trace, perTube: opt && opt.perTube });
    r.fav = fav; return r;
  }
  // §3.3 Match: the contents of tube j move to tube order[j].
  function matchPerm(n, rules) {
    const R = ruleFlags(rules); let order = []; for (let i = 0; i < n; i++) order.push(i);
    if (R.windshift) order.reverse();
    if (R.crossed) order = order.filter(i => i % 2 === 1).concat(order.filter(i => i % 2 === 0));
    return order;
  }
  function applyMatch(tubes, rules) { const n = tubes.length, order = matchPerm(n, rules); const sh = tubes.map(t => t.shell);
    const out = tubes.map(t => ({ shell: null, rig: t.rig })); for (let j = 0; j < n; j++) out[order[j]].shell = sh[j]; return out; }

  /* ================================================================== 3 · SIM: targets, rules, economy (spec §2.2, §5) */
  function rawTarget(s) { return s < 24 ? TARGETS[s] : AFTERPARTY_TARGETS[Math.min(s - 24, AFTERPARTY_TARGETS.length - 1)]; }
  // Base target: Renown 1 (Headliners ×1.25, not the Countdown), Renown 8, Fair Weather. No Sponsor.
  function baseTarget(S, s) {
    if (s == null) s = S.show;
    let t = rawTarget(s);
    if (S.renown >= 8 && s === 23) t = COUNTDOWN_R8;
    if (S.renown >= 1 && s % 3 === 2 && s !== 23) t = Math.round(t * 1.25);
    if (S.fairWeather) t = Math.round(t * 0.75);
    return t;
  }
  // Effective target: base plus an accepted Sponsor (×1.5, rounded) on the current show.
  function target(S, s) {
    if (s == null) s = S.show;
    let t = baseTarget(S, s);
    if (s === S.show && S.sponsor && S.sponsor.accepted) t = Math.round(t * 1.5);
    return t;
  }
  function rulesFor(S, s) {
    if (s == null) s = S.show;
    const f = fest(s), k = s % 3; const out = [];
    if (s === 23) { out.push(S.renown >= 8 ? 'countdown3' : 'countdown'); if (S.renown >= 7) out.push('rival'); return out; }
    if (k === 2) {
      if (f <= 8) { const h = S.headliners[f - 1]; if (h) out.push(h); }
      else { const tw = S.endlessTwists && S.endlessTwists[f]; if (tw) for (const x of tw) out.push(x); }
      return out;
    }
    if (k === 0 && S.renown >= 2 && f >= 2) { const tw = S.twilightTwists && S.twilightTwists[f - 1]; if (tw) out.push(tw); }
    return out;
  }
  const kitOf = S => KITS[S.kit] || KITS.apprentice;
  function tubeCost(S) { const e = S.renown >= 4 ? 4 : 0; return S.tubes.length === 4 ? 6 + e : S.tubes.length === 5 ? 10 + e : Infinity; }
  function upCost(id, star) { const c = SH[id].cost; return star === 1 ? Math.ceil(1.5 * c) : 2 * c; }
  function sellValue(sh) { return Math.max(1, Math.floor(0.75 * sh.paid)); }
  function rerollCost(S) { return (S.renown >= 3 ? 2 : 1) + (S.shop ? S.shop.rerolls : 0); }
  function interestCap(S) { return kitOf(S).interestCap || 5; }
  function ownedShells(S) { const out = []; for (const t of S.tubes) if (t.shell) out.push(t.shell); for (const c of S.crate) if (c) out.push(c); return out; }
  function shellPool(unlocked) { unlocked = unlocked || []; return SHELL_IDS.filter(id => !SH[id].lock || unlocked.includes(SH[id].lock)); }
  const pool = S => shellPool(S.unlocked);

  /* ================================================================== 3 · SIM: shop (spec §5.5–§5.7, §6) */
  function rollCol(S) {
    const owned = ownedShells(S).map(x => x.col).filter(c => c !== 'W' && c !== 'X');
    if (owned.length && rngNext(S) < 0.4) return owned[Math.floor(rngNext(S) * owned.length)];
    const r = rngNext(S); return r < 0.3 ? 'R' : r < 0.6 ? 'A' : r < 0.9 ? 'G' : 'B';
  }
  function makeCard(S, id, tag) { const d = SH[id]; const col = d.col === '*' ? rollCol(S) : d.col;
    return { kind: 'shell', id, col, cost: d.cost + (S.renown >= 5 ? 1 : 0), tag: tag || null, sold: false }; }
  // `own` (ownedShells(S)) may be passed in by callers that test many ids against the same rack.
  function synergyId(S, id, own) { own = own || ownedShells(S); for (const x of own) if (x.id === id && x.star < 3) return true;
    for (const x of own) if (FU[x.id + '>' + id] || FU[id + '>' + x.id]) return true; return false; }
  function genCards(S, f) {
    const N = kitOf(S).cards || 3, w = RARITY[Math.min(8, f) - 1], cards = [], used = {}, P = pool(S), own = ownedShells(S);
    for (let c = 0; c < N; c++) {
      let id = null;
      for (let tr = 0; tr < 20 && !id; tr++) {
        const r = rngNext(S) * 100; const rar = r < w[0] ? 'C' : r < w[0] + w[1] ? 'U' : 'R';
        const ids = P.filter(x => SH[x].rar === rar && SH[x].fest <= f && !used[x]);
        if (ids.length) id = ids[Math.floor(rngNext(S) * ids.length)];
      }
      if (id) { used[id] = true; cards.push(makeCard(S, id)); }
    }
    // §5.7 pity: after 2 dry generations, the last card becomes a synergy card (C or U).
    if (!cards.some(c => synergyId(S, c.id, own))) {
      S.dry++;
      if (S.dry > 2) {
        const ids = P.filter(x => SH[x].fest <= f && SH[x].rar !== 'R' && !used[x] && synergyId(S, x, own));
        if (ids.length) { const id = ids[Math.floor(rngNext(S) * ids.length)]; cards[cards.length - 1] = makeCard(S, id, 'pity'); S.dry = 0; S.runStats.pity++; }
      }
    } else S.dry = 0;
    return cards;
  }
  function genRig(S, f) { if (f < 2 || kitOf(S).noRigs) return null; const hasM = S.tubes.some(t => t.rig === 'mortar');
    const ids = RIG_IDS.filter(r => !(r === 'mortar' && hasM)); const id = ids[Math.floor(rngNext(S) * ids.length)]; return { id, cost: RIGS[id].cost, sold: false }; }
  // §5.6 step 7 / §6: first-ever-run card overrides (after every RNG call; contents only).
  function firstRunOverride(S) {
    const s = S.show;
    if (!S.firstRun || !S.shop) return;
    const card = (id, col) => ({ kind: 'shell', id, col, cost: SH[id].cost, tag: null, sold: false });
    if (s === 1) S.shop.cards = [card('crossette', 'G'), card('palm', 'R'), card('comet', 'G')];
    if (s === 3) {
      const own = ownedShells(S);
      if (own.some(x => x.id === 'comet')) S.shop.cards[0] = card('salute', 'W');
      else if (own.some(x => x.id === 'palm')) S.shop.cards[0] = card('palm', own.find(x => x.id === 'palm').col);
      else { S.shop.cards[0] = card('salute', 'W'); if (S.shop.cards.length > 1) S.shop.cards[1] = card('comet', 'G'); }
      const seen = {}; S.shop.cards = S.shop.cards.filter(c => { if (seen[c.id]) return false; seen[c.id] = true; return true; });
    }
  }
  // Deep copy with exactly the JSON round-trip semantics for plain data (undefined/function keys dropped, in arrays → null;
  // non-finite numbers → null), at a fraction of the cost of JSON.parse(JSON.stringify(v)) (§11.7 step budget).
  function jcopy(v) {
    if (v === null || typeof v !== 'object') return typeof v === 'number' && !Number.isFinite(v) ? null : v;
    if (Array.isArray(v)) { const n = v.length, out = new Array(n); for (let i = 0; i < n; i++) { const x = v[i]; out[i] = x === undefined || typeof x === 'function' ? null : jcopy(x); } return out; }
    const out = {}; for (const k in v) { const x = v[k]; if (x !== undefined && typeof x !== 'function') out[k] = jcopy(x); } return out;
  }
  function liteSnapshot(S) {
    const o = {}; for (const k in S) { const x = S[k]; if (k !== 'runStats' && x !== undefined && typeof x !== 'function') o[k] = jcopy(x); }
    return o;
  }
  // §2.3 opening a build phase: shell cards → pity → Collector → rig → Sponsor → first-run overrides.
  function openBuild(S) {
    const s = S.show, f = fest(s), k = s % 3, kd = kitOf(S);
    S.shop = null; S.sponsor = null;
    if (s > 0 || kd.openShop) {
      const cards = genCards(S, f);
      if (S.rareNext) {
        const rar = f >= 4 ? 'R' : 'U';
        const ids = pool(S).filter(x => SH[x].rar === rar && SH[x].fest <= Math.max(f, 3) && !cards.some(c => c.id === x));
        if (ids.length) cards.push(makeCard(S, ids[Math.floor(rngNext(S) * ids.length)], 'collector'));
        S.rareNext = false;
      }
      S.shop = { cards, rig: genRig(S, f), rerolls: 0 };
    }
    if (f >= 3 && k < 2 && s < 23 && !kd.noSponsor && !S.noSponsor && !S.endless) S.sponsor = { kind: SPONSOR_KINDS[Math.floor(rngNext(S) * 3)], accepted: false };
    firstRunOverride(S);
    S.runStats.buildStart = liteSnapshot(S);
    S.mood = mood(S);
  }

  /* ================================================================== 3 · SIM: state (spec §11.4) */
  function newRunStats(kd) {
    return { history: [], timesFired: {}, fusions: {}, maxBursts: 0, maxBurstsAll: 0, maxMono: 0, maxColsUp: 0, maxColsFired: 0,
      maxCrowd: kd ? kd.crowd || 0 : 0, maxStar: 1, maxRigs: 0, headF4: false, won: false, upgrades: 0, rerolls: 0, pity: 0, purchases: {},
      sponsors: 0, sponsorFails: 0, rainUsed: 0, relights: 0, bestShow: null, afterparty: { cleared: 0, best: 0 }, msPrev: {},
      buildStart: null, lastLostPreLight: null };
  }
  function createState(seed, opts) {
    opts = opts || {};
    const daily = !!opts.daily;
    const kit = daily ? 'apprentice' : (KITS[opts.kit] ? opts.kit : 'apprentice');
    const kd = KITS[kit];
    const renown = daily ? 0 : Math.max(0, Math.min(8, (opts.renown | 0)));
    const fair = !!(opts.fairWeather !== undefined ? opts.fairWeather : opts.fair);
    const unlocked = Array.isArray(opts.unlocked) ? opts.unlocked.filter(x => typeof x === 'string') : POOL_MILESTONES.slice();
    const S = {
      v: 1, version: VERSION, seed: String(seed), rng: seedRng(seed), kit, renown, fairWeather: fair, firstRun: !!opts.firstRun, daily,
      unlocked: unlocked.slice(), discovered: Array.isArray(opts.discovered) ? opts.discovered.filter(k => FU[k]) : [], noSponsor: !!opts.noSponsor,
      show: 0, phase: 'build', endless: false, afterpartyDone: false,
      coins: kd.coins, crowd: kd.crowd || 0, rain: renown >= 6 ? 0 : 1, relight: fair ? 1 : 0,
      tubes: [], crate: [null, null], nextUid: 1, shop: null, sponsor: null,
      headliners: [], twilightTwists: [], endlessTwists: {}, dry: 0, rareNext: false, lastOrder: null,
      mood: null, seq: 1, runStats: newRunStats(kd),
    };
    for (const e of kd.rack) S.tubes.push({ shell: e ? { uid: S.nextUid++, id: e[0], col: e[1], star: 1, paid: SH[e[0]].cost } : null, rig: null });
    // createState RNG order (§11.3): Headliners F1..F7, twilight twists F2..F8 (Renown ≥ 2), keepsake (none), openBuild.
    for (let f = 1; f <= 7; f++) {
      const el = DRAW_ROWS.filter(h => h.min <= f && f <= h.max && !S.headliners.includes(h.id));
      S.headliners.push(el[Math.floor(rngNext(S) * el.length)].id);
    }
    S.headliners.push('countdown');
    if (S.firstRun) S.headliners[0] = 'headwind';
    for (let f = 1; f <= 8; f++) S.twilightTwists.push(renown >= 2 && f >= 2 ? TWISTS.twilight[Math.floor(rngNext(S) * 3)] : null);
    const ks = opts.keepsake;
    if (ks && SH[ks.id]) {
      const col = SH[ks.id].col === '*' ? (COL_IDS.includes(ks.col) ? ks.col : 'R') : SH[ks.id].col;
      S.crate[0] = { uid: S.nextUid++, id: ks.id, col, star: 1, paid: SH[ks.id].cost };
    }
    openBuild(S);
    return S;
  }

  /* ================================================================== 3 · SIM: actions (spec §2.5) */
  function slotOk(S, sl) {
    if (!sl || typeof sl !== 'object' || !Number.isInteger(sl.i) || sl.i < 0) return false;
    if (sl.zone === 'tube') return sl.i < S.tubes.length;
    if (sl.zone === 'crate') return sl.i < 2;
    return false;
  }
  const getSlot = (S, sl) => sl.zone === 'tube' ? S.tubes[sl.i].shell : S.crate[sl.i];
  function setSlot(S, sl, v) { if (sl.zone === 'tube') S.tubes[sl.i].shell = v; else S.crate[sl.i] = v; }
  const sameSlot = (a, b) => a.zone === b.zone && a.i === b.i;
  function allSlots(S) { const out = []; for (let i = 0; i < S.tubes.length; i++) out.push({ zone: 'tube', i }); out.push({ zone: 'crate', i: 0 }, { zone: 'crate', i: 1 }); return out; }
  function cardAt(S, i) { return S.shop && Number.isInteger(i) && i >= 0 && i < S.shop.cards.length ? S.shop.cards[i] : null; }
  function tubeShellCount(S) { let n = 0; for (const t of S.tubes) if (t.shell) n++; return n; }

  // Returns null when legal, else a short human-readable reason. Pure.
  function illegalReason(S, a) {
    if (!a || typeof a !== 'object' || typeof a.type !== 'string') return 'not an action';
    if (a.type === 'endless') { if (S.phase !== 'won') return 'the run is not won'; if (S.endless) return 'already in the Afterparty'; return null; }
    if (S.phase !== 'build') return 'not in a build phase';
    const kd = kitOf(S);
    switch (a.type) {
      case 'light': return null;
      case 'buy': {
        const c = cardAt(S, a.card); if (!c) return 'no such card'; if (c.sold) return 'card already bought';
        if (a.displace == null) { if (c.cost > S.coins) return 'not enough coins'; if (!slotOk(S, a.to)) return 'bad slot'; if (getSlot(S, a.to)) return 'slot is occupied'; return null; }
        // One-gesture swap-in (§2.5): the tube's shell goes to the first empty Crate slot, or is sold (refund counts first).
        if (a.displace !== 'crate' && a.displace !== 'sell') return 'displace must be crate or sell';
        if (!slotOk(S, a.to) || a.to.zone !== 'tube') return 'displace needs a tube';
        const old = getSlot(S, a.to); if (!old) return 'nothing to displace'; if (old.id === c.id) return 'a twin: upgrade it instead';
        if (a.displace === 'crate') { if (S.crate.indexOf(null) < 0) return 'the Crate is full'; if (c.cost > S.coins) return 'not enough coins'; return null; }
        if (c.cost > S.coins + sellValue(old)) return 'not enough coins'; return null;
      }
      case 'upgrade': {
        const c = cardAt(S, a.card); if (!c) return 'no such card'; if (c.sold) return 'card already bought'; if (!slotOk(S, a.to)) return 'bad slot';
        const sh = getSlot(S, a.to); if (!sh) return 'slot is empty'; if (sh.id !== c.id) return 'not its twin'; if (sh.star >= 3) return 'already ★3';
        if (upCost(sh.id, sh.star) > S.coins) return 'not enough coins'; return null;
      }
      case 'setColour': {
        if (!kd.chooseCol) return 'only the Chemist chooses colours';
        const c = cardAt(S, a.card); if (!c) return 'no such card'; if (c.sold) return 'card already bought';
        if (SH[c.id].col !== '*') return 'not a wild shell'; if (!COL_IDS.includes(a.col)) return 'bad colour'; if (c.col === a.col) return 'already that colour'; return null;
      }
      case 'buyRig': {
        const r = S.shop && S.shop.rig; if (!r) return 'no rig on offer'; if (r.sold) return 'rig already bought'; if (r.cost > S.coins) return 'not enough coins';
        if (!Number.isInteger(a.tube) || a.tube < 0 || a.tube >= S.tubes.length) return 'bad tube';
        if (S.tubes[a.tube].rig === r.id) return 'tube already has this rig';
        if (r.id === 'mortar' && S.tubes.some(t => t.rig === 'mortar')) return 'only one Mortar per rack'; return null;
      }
      case 'buyTube': {
        if (fest(S.show) < 2) return 'tubes are sold from Festival 2'; if (S.tubes.length >= 6) return 'six tubes is the maximum';
        if (tubeCost(S) > S.coins) return 'not enough coins'; return null;
      }
      case 'move': {
        if (!slotOk(S, a.from) || !slotOk(S, a.to)) return 'bad slot'; if (!getSlot(S, a.from)) return 'nothing to move';
        if (sameSlot(a.from, a.to)) return 'same slot'; return null;
      }
      case 'sell': { if (!slotOk(S, a.from)) return 'bad slot'; if (!getSlot(S, a.from)) return 'nothing to sell'; return null; }
      case 'reroll': { if (!S.shop) return 'no shop'; if (fest(S.show) < 2) return 'rerolls open in Festival 2'; if (rerollCost(S) > S.coins) return 'not enough coins'; return null; }
      case 'sponsor': {
        if (!S.sponsor) return 'no Sponsor tonight'; if (typeof a.accept !== 'boolean') return 'accept must be true or false';
        if (a.accept === S.sponsor.accepted) return 'no change'; return null;
      }
      case 'match': {
        const rules = rulesFor(S, S.show); if (!rules.includes('windshift') && !rules.includes('crossed')) return "tonight's fuse fires in its usual order";
        if (tubeShellCount(S) < 2) return 'needs two shells in tubes'; return null;
      }
      case 'restore': return S.lastOrder ? null : 'no earlier order to restore';
      default: return 'unknown action';
    }
  }
  function isLegal(S, a) { return !illegalReason(S, a); }

  // §2.5 order: light, sponsor, buy (card, slot), upgrade, buyRig (tube), buyTube, move (from, to), sell, reroll, match, restore, setColour.
  function legalActions(S) {
    const out = [];
    if (S.phase === 'won') { if (!S.endless) out.push({ type: 'endless' }); return out; }
    if (S.phase !== 'build') return out;
    const add = a => { if (!illegalReason(S, a)) out.push(a); };
    out.push({ type: 'light' });
    if (S.sponsor) out.push({ type: 'sponsor', accept: !S.sponsor.accepted });
    const slots = allSlots(S), cards = S.shop ? S.shop.cards : [];
    for (let i = 0; i < cards.length; i++) for (const sl of slots) add({ type: 'buy', card: i, to: { zone: sl.zone, i: sl.i } });
    for (let i = 0; i < cards.length; i++) for (const sl of slots) add({ type: 'upgrade', card: i, to: { zone: sl.zone, i: sl.i } });
    if (S.shop && S.shop.rig) for (let j = 0; j < S.tubes.length; j++) add({ type: 'buyRig', tube: j });
    add({ type: 'buyTube' });
    for (const a of slots) for (const b of slots) if (!sameSlot(a, b)) add({ type: 'move', from: { zone: a.zone, i: a.i }, to: { zone: b.zone, i: b.i } });
    for (const a of slots) add({ type: 'sell', from: { zone: a.zone, i: a.i } });
    add({ type: 'reroll' }); add({ type: 'match' }); add({ type: 'restore' });
    for (let i = 0; i < cards.length; i++) for (const c of COL_IDS) add({ type: 'setColour', card: i, col: c });
    return out;
  }

  function purchased(S) { const rs = S.runStats; rs.purchases[S.show] = (rs.purchases[S.show] || 0) + 1; }
  function trackOwned(S) { const rs = S.runStats; for (const sh of ownedShells(S)) if (sh.star > rs.maxStar) rs.maxStar = sh.star;
    let rigs = 0; for (const t of S.tubes) if (t.rig) rigs++; if (rigs > rs.maxRigs) rs.maxRigs = rigs; }

  // Applies a legal build action. `emit(type, fields)` may be null (hypothetical application).
  function applyBuildAction(S, a, emit) {
    const ev = emit || (() => null);
    switch (a.type) {
      case 'buy': {
        if (a.displace) {
          const old = getSlot(S, a.to);
          if (a.displace === 'crate') { const k = S.crate.indexOf(null); S.crate[k] = old; setSlot(S, a.to, null);
            ev('moved', { from: a.to, to: { zone: 'crate', i: k }, uid: old.uid, id: old.id, swapped: false, other: null, displaced: true }); }
          else { const v = sellValue(old); S.coins += v; setSlot(S, a.to, null); ev('sold', { from: a.to, uid: old.uid, id: old.id, value: v, coins: S.coins, displaced: true }); }
        }
        const c = S.shop.cards[a.card]; S.coins -= c.cost; c.sold = true;
        const sh = { uid: S.nextUid++, id: c.id, col: c.col, star: 1, paid: c.cost }; setSlot(S, a.to, sh); purchased(S);
        ev('bought', { card: a.card, to: a.to, id: sh.id, col: sh.col, star: 1, cost: c.cost, uid: sh.uid, tag: c.tag, coins: S.coins, displace: a.displace || undefined }); break;
      }
      case 'upgrade': {
        const c = S.shop.cards[a.card], sh = getSlot(S, a.to); const uc = upCost(sh.id, sh.star);
        S.coins -= uc; sh.star++; sh.paid += uc; c.sold = true; purchased(S); S.runStats.upgrades++;
        ev('upgraded', { card: a.card, to: a.to, id: sh.id, col: sh.col, star: sh.star, cost: uc, uid: sh.uid, coins: S.coins }); break;
      }
      case 'setColour': { const c = S.shop.cards[a.card]; c.col = a.col; ev('colourSet', { card: a.card, id: c.id, col: a.col }); break; }
      case 'buyRig': {
        const r = S.shop.rig; S.coins -= r.cost; r.sold = true; const old = S.tubes[a.tube].rig; S.tubes[a.tube].rig = r.id; purchased(S);
        ev('rigInstalled', { tube: a.tube, id: r.id, cost: r.cost, replaced: old, coins: S.coins }); break;
      }
      case 'buyTube': { const c = tubeCost(S); S.coins -= c; S.tubes.push({ shell: null, rig: null }); ev('tubeAdded', { tube: S.tubes.length - 1, cost: c, coins: S.coins }); break; }
      case 'move': {
        const A = getSlot(S, a.from), B = getSlot(S, a.to); setSlot(S, a.to, A); setSlot(S, a.from, B || null);
        ev('moved', { from: a.from, to: a.to, uid: A.uid, id: A.id, swapped: !!B, other: B ? B.uid : null }); break;
      }
      case 'sell': {
        const sh = getSlot(S, a.from), v = sellValue(sh); S.coins += v; setSlot(S, a.from, null);
        ev('sold', { from: a.from, uid: sh.uid, id: sh.id, value: v, coins: S.coins }); break;
      }
      case 'reroll': {
        const cost = rerollCost(S), f = fest(S.show); S.coins -= cost; S.shop.rerolls++; S.runStats.rerolls++;
        const keep = S.shop.cards.filter(c => c.tag === 'collector' && !c.sold);
        S.shop.cards = genCards(S, f).concat(keep); S.shop.rig = genRig(S, f);
        ev('rerolled', { cost, coins: S.coins, cards: S.shop.cards.map(c => c.id), rig: S.shop.rig ? S.shop.rig.id : null }); break;
      }
      case 'sponsor': { S.sponsor.accepted = a.accept; ev('sponsorChanged', { accepted: a.accept, kind: S.sponsor.kind, target: target(S, S.show) }); break; }
      case 'match': {
        const perm = matchPerm(S.tubes.length, rulesFor(S, S.show)); const sh = S.tubes.map(t => t.shell);
        for (let j = 0; j < perm.length; j++) S.tubes[perm[j]].shell = sh[j];
        ev('matched', { perm }); break;
      }
      case 'restore': {
        const own = ownedShells(S); const byUid = {}; for (const x of own) byUid[x.uid] = x; const placed = {};
        for (const t of S.tubes) t.shell = null; S.crate = [null, null];
        S.lastOrder.forEach((uid, j) => { if (uid != null && byUid[uid] && j < S.tubes.length) { S.tubes[j].shell = byUid[uid]; placed[uid] = true; } });
        for (const x of own) {
          if (placed[x.uid]) continue;
          const e = S.tubes.findIndex(t => !t.shell);
          if (e >= 0) S.tubes[e].shell = x; else { const c = S.crate.indexOf(null); S.crate[c] = x; }
        }
        ev('restored', { order: S.tubes.map(t => t.shell ? t.shell.uid : null) }); break;
      }
      default: throw new Error('not a build action: ' + a.type);
    }
    trackOwned(S);
  }

  // step(state, action) → events. Mutates state in place; illegal actions change nothing.
  function step(S, a) {
    const why = illegalReason(S, a);
    if (why) return [{ type: 'illegal', reason: why, action: a, seq: S.seq }];
    const E = [];
    const emit = (type, f) => { const e = { type, seq: S.seq++ }; if (f) for (const k in f) if (f[k] !== undefined) e[k] = f[k]; E.push(e); return e; };
    if (a.type === 'light') doLight(S, emit);
    else if (a.type === 'endless') doEndless(S, emit);
    else {
      applyBuildAction(S, a, emit);
      milestoneEvents(S, emit);
      const m = mood(S);
      if (m !== S.mood) { S.mood = m; emit('moodChanged', { bucket: m, preview: false }); }
    }
    return E;
  }

  function buildOpenEvent(S, extra) {
    const s = S.show, k = s % 3, rs = S.runStats; const last = rs.history[rs.history.length - 1];
    const critical = rs.rainUsed > 0;
    const justMissed = !!(last && !last.pass && last.show === s - 1);
    return Object.assign({
      show: s, showNo: s + 1, festival: fest(s), slot: k, name: showName(s), target: target(S, s), baseTarget: baseTarget(S, s),
      rules: rulesFor(S, s), sponsor: S.sponsor ? { kind: S.sponsor.kind, accepted: S.sponsor.accepted, target: Math.round(baseTarget(S, s) * 1.5), reward: SPONSORS[S.sponsor.kind].reward, flavour: SPONSORS[S.sponsor.kind].flavour } : null,
      mood: S.mood, moodVisible: moodVisible(S), shop: !!S.shop, endless: S.endless, critical, lastChance: critical && (justMissed || k === 2 || s === 23),
      nextHeadliner: rulesFor(S, nextHeadlinerShow(s)),
    }, extra || {});
  }
  // The buildOpen event for the current build without advancing state (for boot / restore). seq 0.
  function describeBuild(S) { return Object.assign({ type: 'buildOpen', seq: 0 }, buildOpenEvent(S)); }

  function milestoneValues(rs) {
    return {
      m_fusion: Object.keys(rs.fusions).length, m_busy: rs.maxBursts, m_mono: rs.maxMono,
      m_spectrum: Math.min(3, Math.max(rs.maxColsUp, rs.maxColsFired >= 4 ? 3 : rs.maxColsFired - 1, 0)),
      m_crowd: rs.maxCrowd, m_triple: rs.maxStar, m_headliner: rs.headF4 ? 1 : 0, m_rigger: rs.maxRigs, m_win: rs.won ? 1 : 0,
    };
  }
  function milestoneEvents(S, emit) {
    const rs = S.runStats, vals = milestoneValues(rs), prev = rs.msPrev || {};
    for (const id in vals) {
      if (vals[id] > (prev[id] || 0)) { const goal = MILESTONES[id].goal; emit('milestone', { id, value: vals[id], goal, done: vals[id] >= goal }); }
    }
    rs.msPrev = vals;
  }

  const bucketOf = r => r < 0.85 ? 'restless' : r < 1.25 ? 'hopeful' : 'eager';
  function nextHeadlinerShow(s) { return s + (2 - s % 3); }

  // §3.1 / §5.2 / §5.4: light the fuse, pay out, advance.
  function doLight(S, emit) {
    const s = S.show, f = fest(s), k = s % 3, rs = S.runStats, kd = kitOf(S);
    const rules = rulesFor(S, s), tgt = target(S, s), base = baseTarget(S, s);
    const pre = liteSnapshot(S);
    const fav = rules.includes('rival') ? favourite(S.tubes, S.crowd) : null;
    const crowdAtLight = S.crowd, coinsAtLight = S.coins;
    const r = resolveShow(S.tubes, { rules, crowd: S.crowd, fav, trace: true });
    const moodAtLight = bucketOf(r.applause / tgt);
    emit('fuseLit', { show: s, rules, target: tgt, fav, order: r.seq, total: r.bursts });
    const known = {}; for (const key of S.discovered) known[key] = true; for (const key in rs.fusions) known[key] = true;
    for (const e of r.trace) {
      if (e.type === 'fusion') { e.first = !known[e.key]; known[e.key] = true; }
      const out = emit(e.type, null); for (const key in e) if (key !== 'type' && e[key] !== undefined) out[key] = e[key];
    }
    emit('crowdCheer', { v: r.cheer, crowd: r.crowd, half: rules.includes('ferry') || undefined, ooh: r.ooh, aah: r.aah });
    const pass = r.applause >= tgt, encore = r.applause >= 2 * tgt, sponsored = !!(S.sponsor && S.sponsor.accepted);
    emit('applause', { ooh: r.ooh, aah: r.aah, score: r.applause, target: tgt, pass, encore, ratio: r.applause / tgt, short: pass ? 0 : tgt - r.applause, show: s });
    // Always paid, even on a miss: shell and rig coins, shell Crowd.
    S.coins += r.coins; S.crowd = r.crowd;
    const coinsAtPayout = S.coins;
    const pay = { pass, shellCoins: r.coins, shellCrowd: r.crowdGain, interest: 0, base: 0, sponsor: null, crowdPass: 0, crowdHeadliner: 0, crowdEncore: 0 };
    if (pass) {
      pay.interest = Math.min(interestCap(S), Math.floor(S.coins / 5));
      pay.base = k === 2 ? 6 : 4;
      S.coins += pay.interest + pay.base;
      if (sponsored) {
        rs.sponsors++;
        const kind = S.sponsor.kind; pay.sponsor = { kind, coins: 0, crowd: 0, collector: false };
        if (kind === 'coin') { S.coins += 2; pay.sponsor.coins = 2; } else if (kind === 'crowd') { S.crowd += 4; pay.sponsor.crowd = 4; } else { S.rareNext = true; pay.sponsor.collector = true; }
      }
      pay.crowdPass = 1; pay.crowdHeadliner = k === 2 ? 2 : 0; pay.crowdEncore = encore ? 2 * f : 0;
      S.crowd += pay.crowdPass + pay.crowdHeadliner + pay.crowdEncore;
      if (s === 11) rs.headF4 = true;
    } else if (sponsored) rs.sponsorFails++;
    pay.coins = S.coins; pay.crowd = S.crowd;
    emit('payout', pay);
    // Run stats.
    const pt = r.perTube;
    pt.forEach((p, i) => { if (p.ordinals.length) rs.timesFired[i] = (rs.timesFired[i] || 0) + p.ordinals.length; });
    for (const key of r.fusionKeys) rs.fusions[key] = (rs.fusions[key] || 0) + 1;
    const isCD = rules.includes('countdown') || rules.includes('countdown3');
    if (!isCD && r.bursts > rs.maxBursts) rs.maxBursts = r.bursts;
    if (r.bursts > rs.maxBurstsAll) rs.maxBurstsAll = r.bursts;
    if (r.monoCount > rs.maxMono) rs.maxMono = r.monoCount;
    if (r.colsUp > rs.maxColsUp) rs.maxColsUp = r.colsUp;
    if (r.colsFired > rs.maxColsFired) rs.maxColsFired = r.colsFired;
    if (S.crowd > rs.maxCrowd) rs.maxCrowd = S.crowd;
    trackOwned(S);
    if (!rs.bestShow || r.applause > rs.bestShow.applause) rs.bestShow = { applause: r.applause, show: s, seed: S.seed };
    S.lastOrder = S.tubes.map(t => t.shell ? t.shell.uid : null);
    const rec = {
      show: s, rules, target: tgt, baseTarget: base, applause: r.applause, ooh: r.ooh, aah: r.aah, cheer: r.cheer, pass, sponsored,
      sponsorKind: S.sponsor ? S.sponsor.kind : null, encore, relit: false, afterRelight: !!(rs.history.length && rs.history[rs.history.length - 1].relit && rs.history[rs.history.length - 1].show === s),
      rain: false, bursts: r.bursts, maxUp: r.maxUp, colsUp: r.colsUp, colsFired: r.colsFired, monoCount: r.monoCount, fusions: r.fusionKeys.slice(),
      moodAtLight, crowdAtLight, crowdAfter: S.crowd, coinsAtLight, coinsAtPayout, coinsAfter: S.coins, fav, purchases: rs.purchases[s] || 0,
      emptyTubes: S.tubes.filter(t => !t.shell).length, endless: S.endless,
      rack: S.tubes.map(t => ({ shell: t.shell ? { uid: t.shell.uid, id: t.shell.id, col: t.shell.col, star: t.shell.star, paid: t.shell.paid } : null, rig: t.rig })),
      sees: pt.map(p => p.fires ? p.sees : null), cleared: pt.map(p => p.fires ? p.cleared : null),
    };
    rs.history.push(rec);
    if (S.endless && pass) { rs.afterparty.cleared++; }
    if (S.endless && r.applause > rs.afterparty.best) rs.afterparty.best = r.applause;
    // Transitions (§2.3, §5.4).
    let next = 'build';
    if (!pass) {
      rs.lastLostPreLight = pre;
      if (!S.endless && s < 23 && S.rain > 0) {
        S.rain--; rs.rainUsed++; rec.rain = true;
        emit('rainCheck', { left: S.rain }); emit('critical', { on: true });
      } else if (!S.endless && s === 23 && S.relight > 0) {
        S.relight--; rs.relights++; rec.relit = true; next = 'relight';
        emit('relight', { left: S.relight });
      } else { S.phase = 'lost'; next = 'lost'; }
    } else if (s === 23 && !S.endless) { S.phase = 'won'; rs.won = true; next = 'won'; }
    else if (S.endless && s >= 35) { S.phase = 'won'; S.afterpartyDone = true; next = 'won'; }
    milestoneEvents(S, emit);
    if (next === 'lost') emit('runLost', { show: s, applause: r.applause, target: tgt, short: tgt - r.applause, endless: S.endless || undefined });
    else if (next === 'won') emit('runWon', { show: s, applause: r.applause, final: S.afterpartyDone || undefined, endless: S.endless || undefined });
    else if (next === 'relight') {
      // Fair Weather: back to the Countdown build with the same rack and coins; no new shop, no Sponsor.
      S.shop = null; S.sponsor = null; rs.buildStart = liteSnapshot(S); S.mood = mood(S);
      emit('buildOpen', buildOpenEvent(S, { relight: true }));
    } else {
      S.show++; openBuild(S);
      emit('buildOpen', buildOpenEvent(S));
    }
  }

  // §5.10 Afterparty: two distinct twists per Headliner for festivals 9..12, then show 25.
  function doEndless(S, emit) {
    S.endless = true; S.rain = 0; S.relight = 0;
    const P = TWISTS.afterparty;
    for (let n = 9; n <= 12; n++) { const a = P[Math.floor(rngNext(S) * P.length)]; const rest = P.filter(x => x !== a); const b = rest[Math.floor(rngNext(S) * rest.length)]; S.endlessTwists[n] = [a, b]; }
    S.phase = 'build'; S.show = 24;
    emit('afterparty', { twists: S.endlessTwists });
    openBuild(S);
    emit('buildOpen', buildOpenEvent(S));
  }

  /* ================================================================== 4 · HELPERS (spec §3.3, §8) */
  // §3.3 Crowd mood: never returns the ratio. previewRules (Rehearse) reads against that Headliner's base target.
  function mood(S, previewRules, previewShow) {
    const s = S.show, tonight = rulesFor(S, s);
    let rules = tonight, T = target(S, s);
    if (previewRules != null) {
      rules = ruleList(previewRules);
      const same = rules.length === tonight.length && rules.every((x, i) => x === tonight[i]);
      if (!same || (previewShow != null && previewShow !== s)) T = baseTarget(S, previewShow != null ? previewShow : nextHeadlinerShow(s));
    }
    return bucketOf(applauseUnder(S.tubes, rules, S.crowd) / T);
  }
  // The Applause of a rack under a rule list and Crowd, with the ♛ applied under Rival: the costly part of mood(), which
  // step() re-reads after every build action (§11.7: step ≤ 2 ms including the mood). A small memo keyed by everything
  // resolveShow reads (per tube: shell id, colour, ★ and rig; the rules; the Crowd) skips the resolves (up to n + 2 under
  // Rival) when an action leaves the rack as it was (a Crate buy or sell, a reroll, a Sponsor toggle). Results are unchanged.
  const APPLAUSE_MEMO = new Map();
  function applauseUnder(tubes, rules, crowd) {
    let key = rules.join('+') + '|' + crowd + '|';
    for (const t of tubes) key += (t.shell ? t.shell.id + ':' + t.shell.col + ':' + t.shell.star : '-') + '/' + (t.rig || '') + ',';
    let A = APPLAUSE_MEMO.get(key);
    if (A === undefined) {
      const fav = rules.includes('rival') ? favourite(tubes, crowd) : null;
      A = resolveShow(tubes, { rules, crowd, fav }).applause;
      if (APPLAUSE_MEMO.size >= 512) APPLAUSE_MEMO.clear();
      APPLAUSE_MEMO.set(key, A);
    }
    return A;
  }
  function moodVisible(S) { return !(S.firstRun && S.show < 2); }

  // Hypothetical rack for previewChips. held: {card:i} | {from:slot} | {rig:true} | {shell:{id,col,star}} | card index.
  function placeHeld(S, held, j) {
    if (typeof held === 'number') held = { card: held };
    const tubes = S.tubes.map(t => ({ shell: t.shell, rig: t.rig }));
    if (j == null || j < 0 || j >= tubes.length) return null;
    if (held.rig) { const r = S.shop && S.shop.rig; if (!r || tubes[j].rig === r.id || (r.id === 'mortar' && tubes.some(t => t.rig === 'mortar'))) return null; tubes[j].rig = r.id; return { tubes, kind: 'rig' }; }
    let sh = null, from = null;
    if (held.card != null) { const c = cardAt(S, held.card); if (!c) return null; sh = { uid: -1, id: c.id, col: held.col || c.col, star: 1, paid: c.cost }; }
    else if (held.shell) sh = { uid: -1, id: held.shell.id, col: held.shell.col || SH[held.shell.id].col, star: held.shell.star || 1, paid: 0 };
    else if (held.from) { if (!slotOk(S, held.from)) return null; sh = getSlot(S, held.from); from = held.from; if (!sh) return null; }
    if (!sh || !SH[sh.id]) return null;
    const cur = tubes[j].shell;
    if (from) {
      if (from.zone === 'tube' && from.i === j) return null;
      if (from.zone === 'tube') tubes[from.i].shell = cur;
      tubes[j].shell = sh; return { tubes, kind: cur ? 'swap' : 'move', action: { type: 'move', from, to: { zone: 'tube', i: j } } };
    }
    const T = { zone: 'tube', i: j }, card = held.card != null ? held.card : null;
    const act = x => card == null ? undefined : Object.assign({ type: 'buy', card, to: T }, x);
    if (cur && card != null && cur.id === sh.id && cur.star < 3) { tubes[j].shell = Object.assign({}, cur, { star: cur.star + 1 }); return { tubes, kind: 'upgrade', cost: upCost(cur.id, cur.star), action: { type: 'upgrade', card, to: T } }; }
    if (cur) {
      // §2.5 one-gesture swap-in: a card over an occupied non-twin tube. The old shell goes to the Crate ('swap'), or,
      // with the Crate full, is sold for its refund ('replace'). `action` is the exact step() action for the drop.
      if (card == null || cur.id === sh.id) return null;
      const out = { uid: cur.uid, id: cur.id, col: cur.col, star: cur.star }, k = S.crate.indexOf(null);
      tubes[j].shell = sh;
      if (k >= 0) return { tubes, kind: 'swap', displace: 'crate', out, crate: k, cost: sh.paid, action: act({ displace: 'crate' }) };
      return { tubes, kind: 'replace', displace: 'sell', out, refund: sellValue(cur), cost: sh.paid, action: act({ displace: 'sell' }) };
    }
    tubes[j].shell = sh; return { tubes, kind: 'buy', cost: card != null ? sh.paid : undefined, action: act() };
  }
  function chipsFor(S, tubes, rules, opts) {
    rules = ruleList(rules);
    const fav = rules.includes('rival') ? favourite(tubes, S.crowd) : null;
    const r = resolveShow(tubes, { rules, crowd: S.crowd, fav, perTube: true });
    const known = {}; for (const k of (opts && opts.discovered) || S.discovered || []) known[k] = true; for (const k in (S.runStats && S.runStats.fusions) || {}) known[k] = true;
    return r.perTube.map((p, i) => {
      const t = tubes[i];
      return {
        tube: i, empty: !t.shell, id: t.shell ? t.shell.id : null, col: t.shell ? t.shell.col : null, star: t.shell ? t.shell.star : null, rig: t.rig,
        fires: p.fires, sees: p.sees, ooh: p.ooh, aah: p.aah, x: p.x, crowd: p.crowd, coins: p.coins, cleared: p.cleared,
        fusion: p.fusion ? { key: p.fusion, name: known[p.fusion] ? FU[p.fusion].name : '?' } : null,
        fusionNext: p.partner ? { key: p.partner.key, name: known[p.partner.key] ? FU[p.partner.key].name : '?', tube: p.partner.tube } : null, xAah: p.xAah,
        ordinals: p.ordinals, first: p.ordinals.length ? p.ordinals[0] : null, of: r.bursts, last: p.last,
        dud: p.dud, half: p.half, washed: p.washed, fav: fav === i,
      };
    });
  }
  function heldInfo(c, h) { c.held = true; c.kind = h.kind; for (const k of ['displace', 'out', 'crate', 'refund', 'cost', 'action']) if (h[k] !== undefined) c[k] = h[k]; }
  // §3.3 local facts per tube only; never the total.
  function previewChips(S, rules, held, slot, opts) {
    if (rules == null) rules = rulesFor(S, S.show);
    if (held == null) return chipsFor(S, S.tubes, rules, opts);
    const idx = s => s == null ? null : typeof s === 'number' ? s : s.zone === 'tube' ? s.i : null;
    if (slot !== undefined) {
      const j = idx(slot); const h = placeHeld(S, held, j); if (!h) return null;
      const chips = chipsFor(S, h.tubes, rules, opts); heldInfo(chips[j], h); return chips;
    }
    return S.tubes.map((t, j) => { const h = placeHeld(S, held, j); if (!h) return null; const c = chipsFor(S, h.tubes, rules, opts)[j]; heldInfo(c, h); return c; });
  }
  function seesPerTube(S, rules) {
    if (rules == null) rules = rulesFor(S, S.show);
    const r = resolveShow(S.tubes, { rules: ruleList(rules), crowd: S.crowd, perTube: true });
    return r.perTube.map(p => p.fires ? p.sees : null);
  }
  // Fire-order numerals: per tube the 1-based burst ordinals (a range for multi-shot tubes), pass index and LAST.
  function fireOrder(S, rules) {
    if (rules == null) rules = rulesFor(S, S.show);
    const R = ruleFlags(rules); const base = seqOf(S.tubes.length, R);
    const passes = R.countdown3 ? 3 : R.countdown ? 2 : 1, passLen = base.length / passes;
    const tubes = S.tubes.map((t, i) => ({ tube: i, fires: false, ordinals: [], passes: [], first: null, last: false }));
    const seq = []; let n = 0;
    base.forEach((i, q) => { const t = S.tubes[i]; if (!t.shell) return; seq.push(i); const sh = shotsOf(t);
      for (let k = 0; k < sh; k++) { n++; tubes[i].fires = true; tubes[i].ordinals.push(n); tubes[i].passes.push(Math.floor(q / passLen)); } });
    for (const t of tubes) { if (t.ordinals.length) { t.first = t.ordinals[0]; t.last = t.ordinals.includes(n); } }
    return { seq, total: n, passes, tubes, countdown: passes > 1 };
  }
  // What a pass tonight would pay (no Applause, no ratio). Encore Crowd is the potential bonus.
  function payoutPreview(S) {
    const s = S.show, k = s % 3, f = fest(s), rules = rulesFor(S, s);
    const r = resolveShow(S.tubes, { rules, crowd: S.crowd, fav: rules.includes('rival') ? favourite(S.tubes, S.crowd) : null });
    const coins = S.coins + r.coins; const sp = S.sponsor && S.sponsor.accepted ? S.sponsor.kind : null;
    return { shellCoins: r.coins, shellCrowd: r.crowdGain, interest: Math.min(interestCap(S), Math.floor(coins / 5)), interestCap: interestCap(S),
      base: k === 2 ? 6 : 4, sponsor: sp ? { kind: sp, coins: sp === 'coin' ? 2 : 0, crowd: sp === 'crowd' ? 4 : 0, collector: sp === 'rare' } : null,
      crowdPass: 1, crowdHeadliner: k === 2 ? 2 : 0, encoreCrowd: 2 * f, rainCheck: S.rain > 0 && s < 23 && !S.endless };
  }

  // §8.6 Shapley values over the occupied tubes plus the Crowd. v(∅) = 0. Top-level keys are shares (tube index → share,
  // crowd → share; negatives clamped, renormalised). Non-enumerable: values (raw φ, sums to Applause), applause, players.
  const FACT = [1, 1, 2, 6, 24, 120, 720, 5040, 40320];
  function shapley(tubes, rules, crowd, fav) {
    rules = ruleList(rules);
    const occ = []; tubes.forEach((t, i) => { if (t && t.shell) occ.push(i); });
    const n = occ.length + 1, N = 1 << n, v = new Float64Array(N);
    for (let m = 1; m < N; m++) {
      const tt = tubes.map(t => ({ shell: null, rig: t.rig }));
      for (let q = 0; q < occ.length; q++) if (m >> q & 1) tt[occ[q]].shell = tubes[occ[q]].shell;
      v[m] = resolveShow(tt, { rules, crowd: (m >> (n - 1)) & 1 ? crowd : 0, fav }).applause;
    }
    const pc = x => { let c = 0; while (x) { c += x & 1; x >>= 1; } return c; };
    const phi = new Array(n).fill(0);
    for (let q = 0; q < n; q++) for (let m = 0; m < N; m++) { if (m >> q & 1) continue; const sz = pc(m); phi[q] += FACT[sz] * FACT[n - sz - 1] / FACT[n] * (v[m | 1 << q] - v[m]); }
    const out = {}, values = {}; let pos = 0;
    phi.forEach(x => { pos += Math.max(0, x); });
    occ.forEach((ti, q) => { values[ti] = phi[q]; out[ti] = pos > 0 ? Math.max(0, phi[q]) / pos : 0; });
    values.crowd = phi[n - 1]; out.crowd = pos > 0 ? Math.max(0, phi[n - 1]) / pos : 0;
    Object.defineProperty(out, 'values', { value: values, enumerable: false });
    Object.defineProperty(out, 'applause', { value: v[N - 1], enumerable: false });
    Object.defineProperty(out, 'players', { value: occ.concat(['crowd']), enumerable: false });
    return out;
  }
  // §8.6 step 4: mean of the per-show shares grouped by shell id plus "Crowd", sorted, with a cumulative share.
  function paretoRun(src) {
    const hist = Array.isArray(src) ? src : (src && src.runStats ? src.runStats.history : src && src.history) || [];
    const agg = {}; let shows = 0;
    for (const h of hist) {
      if (!h.rack) continue;
      const sh = shapley(h.rack, h.rules, h.crowdAtLight, h.fav); const per = {};
      for (const key of Object.keys(sh)) { const id = key === 'crowd' ? 'Crowd' : h.rack[+key].shell.id; per[id] = (per[id] || 0) + sh[key]; }
      for (const id in per) agg[id] = (agg[id] || 0) + per[id];
      shows++;
    }
    const rows = Object.keys(agg).map(id => ({ id, name: id === 'Crowd' ? 'Crowd' : SH[id].name, share: shows ? agg[id] / shows : 0 })).sort((a, b) => b.share - a.share);
    let c = 0; for (const r of rows) { c += r.share; r.cum = c; }
    return rows;
  }

  // Distinct permutations of the tube shells (by uid), as in the reference oracle.
  function perms(a) {
    if (a.length <= 1) return [a];
    const out = [], seen = {};
    for (let i = 0; i < a.length; i++) {
      const k = a[i] ? a[i].uid + '' : '-'; if (seen[k]) continue; seen[k] = true;
      for (const p of perms(a.slice(0, i).concat(a.slice(i + 1)))) out.push([a[i]].concat(p));
    }
    return out;
  }
  const withShells = (tubes, sh) => tubes.map((t, i) => ({ shell: sh[i], rig: t.rig }));
  function bestArrangement(tubes, rules, crowd) {
    let best = -1, bs = null;
    for (const p of perms(tubes.map(t => t.shell))) { const v = scoreFull(withShells(tubes, p), rules, crowd).applause; if (v > best) { best = v; bs = p; } }
    return { applause: best, shells: bs };
  }

  // §8.6 near-miss. nearMiss(finalPreLight, rules?, target?) — also accepts the §3.3 form (buildStart, finalPreLight, rules, target).
  function* nearMissGen(pre, rules, tgt) {
    const s = pre.show; rules = rules ? ruleList(rules) : rulesFor(pre, s); tgt = tgt || target(pre, s);
    const score = (tubes, crowd) => scoreFull(tubes, rules, crowd).applause;
    const applause = score(pre.tubes, pre.crowd);
    const noRule = rules.length ? scoreFull(pre.tubes, [], pre.crowd).applause : applause;
    const ruleName = rules.map(r => RULE_INFO[r] ? RULE_INFO[r].name : r).join(' + ');
    const uidOf = x => x ? x.uid : 0;
    const orig = pre.tubes.map(t => uidOf(t.shell));
    let bestArr = null, passArr = null; let count = 0;
    for (const p of perms(pre.tubes.map(t => t.shell))) {
      const v = score(withShells(pre.tubes, p), pre.crowd);
      const changes = p.reduce((c, x, i) => c + (uidOf(x) !== orig[i] ? 1 : 0), 0);
      const cand = { kind: 'arrange', applause: v, pass: v >= tgt, changes, shells: p };
      if (!bestArr || v > bestArr.applause) bestArr = cand;
      if (cand.pass && changes > 0 && (!passArr || changes < passArr.changes || (changes === passArr.changes && v > passArr.applause))) passArr = cand;
      if (++count % 60 === 0) yield count;
    }
    let bestAct = null, passAct = null;
    const kinds = { buy: 1, upgrade: 1, buyRig: 1, buyTube: 1, move: 1, sell: 1, match: 1, sponsor: 1 };
    const base = liteSnapshot(pre);
    for (const a of legalActions(pre)) {
      if (!kinds[a.type]) continue;
      if (a.type === 'sponsor' && a.accept) continue;
      const S2 = jcopy(base); S2.runStats = newRunStats();
      applyBuildAction(S2, a, null);
      const t2 = target(S2, s); const v = score(S2.tubes, S2.crowd);
      const cand = { kind: 'action', action: a, applause: v, target: t2, pass: v >= t2, changes: 1 };
      if (!bestAct || v > bestAct.applause) bestAct = cand;
      if (cand.pass && (!passAct || v > passAct.applause)) passAct = cand;
      if (++count % 60 === 0) yield count;
    }
    const best = passArr || passAct || [bestArr, bestAct].filter(Boolean).sort((a, b) => b.applause - a.applause)[0] || null;
    const name = sh => sh ? (SH[sh.id].name + (SH[sh.id].col === '*' ? ' (' + COLOURS[sh.col].name + ')' : '')) : 'nothing';
    let desc = '';
    if (best && best.kind === 'arrange') {
      const moved = []; best.shells.forEach((x, i) => { if (uidOf(x) !== orig[i]) moved.push(i); });
      if (moved.length === 2 && best.shells[moved[0]] && best.shells[moved[1]] && uidOf(best.shells[moved[0]]) === orig[moved[1]]) desc = 'Swapping ' + name(pre.tubes[moved[0]].shell) + ' and ' + name(pre.tubes[moved[1]].shell);
      else if (moved.length === 0) desc = 'Keeping this order';
      else desc = 'Rearranging to ' + best.shells.map(x => x ? SH[x.id].name : '–').join(', ');
    } else if (best && best.kind === 'action') {
      const a = best.action, card = a.card != null ? pre.shop.cards[a.card] : null;
      const where = sl => sl.zone === 'tube' ? 'tube ' + (sl.i + 1) : 'the Crate';
      if (a.type === 'buy') desc = 'Buying ' + name(card) + ' into ' + where(a.to);
      else if (a.type === 'upgrade') desc = 'Upgrading ' + name(getSlot(pre, a.to)) + ' to ★' + (getSlot(pre, a.to).star + 1);
      else if (a.type === 'buyRig') desc = 'Adding a ' + RIGS[pre.shop.rig.id].name + ' to tube ' + (a.tube + 1);
      else if (a.type === 'buyTube') desc = 'Adding a tube';
      else if (a.type === 'move') { const B = getSlot(pre, a.to); desc = B ? 'Swapping ' + name(getSlot(pre, a.from)) + ' and ' + name(B) : 'Moving ' + name(getSlot(pre, a.from)) + ' to ' + where(a.to); }
      else if (a.type === 'sell') desc = 'Selling ' + name(getSlot(pre, a.from));
      else if (a.type === 'match') desc = 'Pressing Match';
      else if (a.type === 'sponsor') desc = 'Declining the Sponsor';
    }
    const short = Math.max(0, tgt - applause), pct = Math.floor(100 * applause / tgt);
    const lines = [fmt(short) + ' short (' + pct + '%) at ' + FESTIVALS[fest(s) - 1] + (rules.length ? ' · ' + ruleName : '') + '.'];
    if (rules.length && noRule > applause) lines.push(ruleName + ' cost you ' + fmt(noRule - applause) + '.');
    if (best && desc) lines.push(desc + ' would have scored ' + fmt(best.applause) + '.');
    return { show: s, applause, target: tgt, short, pct, rules, ruleName, ruleCost: noRule - applause,
      bestArrangement: bestArr ? { applause: bestArr.applause, pass: bestArr.pass, order: bestArr.shells.map(uidOf) } : null,
      best: best ? { kind: best.kind, applause: best.applause, pass: best.pass, action: best.action || null, order: best.shells ? best.shells.map(uidOf) : null, desc } : null,
      lines, text: lines.join(' ') };
  }
  function nmArgs(args) { return (args.length >= 3 && args[1] && args[1].tubes) ? [args[1], args[2], args[3]] : [args[0], args[1], args[2]]; }
  function nearMiss() { const [pre, rules, tgt] = nmArgs(arguments); if (!pre || !pre.tubes) return null; const g = nearMissGen(pre, rules, tgt); let r; while (!(r = g.next()).done); return r.value; }
  // Chunked version for the end screen (yields to the event loop every ~60 resolves).
  function nearMissAsync(pre, rules, tgt) {
    return new Promise(resolve => {
      if (!pre || !pre.tubes) { resolve(null); return; }
      const g = nearMissGen(pre, rules, tgt);
      const tick = () => { let r; for (let i = 0; i < 4; i++) { r = g.next(); if (r.done) { resolve(r.value); return; } } setTimeout(tick, 0); };
      tick();
    });
  }

  // §4.12 lesson. runSummary: {won, state, history?, finalPreLight?} (GAME.lastRun) or a final State.
  function lessonFor(sum) {
    sum = sum || {};
    const S = sum.state || (sum.runStats ? sum : null);
    const rs = S ? S.runStats : null;
    const hist = sum.history || (rs ? rs.history : []) || [];
    const won = sum.won !== undefined ? !!sum.won : !!(S && S.phase === 'won');
    const pre = sum.finalPreLight || (rs ? rs.lastLostPreLight : null);
    // Fields fill {name}; an optional clause {…} is a field named by its own text ('' drops it). One burst, not "1 bursts".
    const L = (n, f) => { let t = LESSONS[n - 1].text; if (f) for (const k in f) t = t.split('{' + k + '}').join(f[k]); t = t.replace(/\b1 bursts\b/g, '1 burst'); return { id: n, n, text: t }; };
    const num = x => x < 100 ? String(Math.floor(x * 10) / 10) : fmt(x);   // 2 Aah, 2.4 Aah (never "2.0")
    // The end screen's near-miss already searched every order of the losing rack: reuse it (sum.bestReorder or
    // sum.nearMiss.bestArrangement, {applause}) rather than resolve up to 720 orders again.
    const nmShow = sum.nearMiss && sum.nearMiss.show;
    const reo = [sum.bestReorder, sum.nearMiss && sum.nearMiss.bestArrangement].find(x => x && Number.isFinite(x.applause)) || null;
    const last = hist[hist.length - 1];
    const lastRack = h => pre && pre.show === h.show ? pre.tubes : h.rack;
    const lastCrowd = h => pre && pre.show === h.show ? pre.crowd : h.crowdAtLight;
    if (!won && last && !last.pass) {
      const rules = last.rules || [], s = last.show;
      const isCD = rules.includes('countdown') || rules.includes('countdown3');
      const bestApplause = () => reo && (nmShow == null || nmShow === s) ? reo.applause : bestArrangement(lastRack(last), rules, lastCrowd(last)).applause;
      if (isCD && lastRack(last)) { const b = bestApplause(); if (b >= last.target) return L(1, { n: fmt(b) }); }
      if (last.moodAtLight === 'restless') return L(2, { show: 'show ' + (s + 1) + ' (' + showName(s) + ')' });
      if (lastRack(last)) {
        const r = scoreFull(lastRack(last), rules, lastCrowd(last), { trace: true });
        let added = 0, burst = null; const xs = [];
        for (const e of r.trace) {
          if (e.type === 'burst') burst = e;
          if (e.type === 'gainAah') { added += e.v; for (const c of xs) c.after += e.v; }
          if (e.type === 'multAah' && !e.fusion && burst && SH[burst.shell].isX) xs.push({ shell: burst.shell, before: added, aah: e.aah / e.factor, after: 0 });
        }
        const bad = xs.find(c => c.after > c.before);
        if (bad) return L(3, { shell: SH[bad.shell].name, a: num(bad.aah), b: num(bad.after) });
      }
      if (s % 3 === 2 && s !== 23 && rules.length && lastRack(last)) {
        const b = bestApplause();
        if (b >= last.target) { const nm = rules.map(x => RULE_INFO[x] ? RULE_INFO[x].name : x).join(' + '); return L(4, { Headliner: nm, n: fmt(b), ' and Match (M)': rules.some(x => x === 'windshift' || x === 'crossed') ? ' and Match (M)' : '' }); }
      }
    }
    const recent = hist.filter(h => h.rack && h.sees).slice(-3);
    const perShell = (field, pick) => {
      const acc = {};
      for (const h of recent) h.rack.forEach((t, i) => { if (!t.shell || h[field][i] == null || !pick(SH[t.shell.id])) return; const a = acc[t.shell.uid] || (acc[t.shell.uid] = { id: t.shell.id, sum: 0, n: 0 }); a.sum += h[field][i]; a.n++; });
      return Object.values(acc).map(a => ({ id: a.id, avg: a.sum / a.n }));
    };
    const readers = perShell('sees', row => row.readsSky && !row.clears).filter(a => a.avg < 1.5).sort((a, b) => a.avg - b.avg);
    if (readers.length) return L(5, { shell: SH[readers[0].id].name, x: String(Math.round(readers[0].avg * 10) / 10) });
    const clearers = perShell('cleared', row => row.clears).filter(a => a.avg <= 1).sort((a, b) => a.avg - b.avg);
    if (clearers.length) return L(6, { shell: SH[clearers[0].id].name, x: String(Math.round(clearers[0].avg * 10) / 10) });
    if (!won && last && !last.pass && last.sponsored) return L(7);
    const emptyShows = hist.filter(h => h.emptyTubes > 0 && h.coinsAtLight >= 3).length;
    if (emptyShows >= 2) return L(8, { n: String(emptyShows) });
    const late = hist.filter(h => h.show >= 4 && h.pass);
    if (late.length && !late.some(h => h.coinsAtPayout >= 5)) return L(9);
    if (!won && rs && rs.upgrades >= 3 && !Object.keys(rs.fusions || {}).length) return L(10);
    if (rs && rs.upgrades === 0) return L(11);
    const f4 = hist.find(h => h.show === 11);
    if (f4 && f4.crowdAfter < 25) return L(12);
    if (won) {
      const lvl = (S ? S.renown : (sum.renown | 0)) + 1;
      if (lvl <= 8) return L(13, { 'n+1': String(lvl), modifier: RENOWN[lvl].text.replace(/\.$/, '') });
    }
    return L(14);
  }

  // milestoneProgress(runStats, meta) → one row per milestone: run value, best ever, goal, done, newly done.
  function milestoneProgress(rs, meta) {
    rs = rs || newRunStats(); meta = meta || {};
    const vals = milestoneValues(rs);
    const found = {}; const codex = meta.codex && meta.codex.fusions || {};
    for (const k in codex) if (codex[k] && codex[k].found) found[k] = true;
    for (const k in rs.fusions || {}) found[k] = true;
    vals.m_logbook = Object.keys(found).length;
    const unlocked = meta.unlocked || []; const prog = meta.progress || {};
    return MILESTONE_IDS.map(id => {
      const M = MILESTONES[id], value = vals[id] || 0, best = Math.max(value, +prog[id] || 0);
      const was = unlocked.includes(id);
      return { id, name: M.name, text: M.text, metric: M.metric, value, best, goal: M.goal, ratio: Math.min(1, best / M.goal), done: was || best >= M.goal, newlyDone: !was && value >= M.goal, unlocks: M.unlocks };
    });
  }
  function nearestMilestones(rows, k) { return rows.filter(r => !r.done).sort((a, b) => b.ratio - a.ratio).slice(0, k || 2); }

  // §8.5 number format.
  function fmt(n) {
    if (typeof n !== 'number' || Number.isNaN(n)) return '–';
    if (!Number.isFinite(n)) return n > 0 ? '∞' : '−∞';
    const neg = n < 0; n = Math.abs(n); let out;
    const unit = (v, u) => { const q = v < 10 ? Math.floor(v * 10) / 10 : Math.floor(v); return (q % 1 ? q.toFixed(1) : String(q)) + u; };
    if (n < 10000) { const s = String(Math.floor(n)); out = s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    else if (n < 1e6) out = Math.floor(n / 1000) + 'K';
    else if (n < 1e9) out = unit(n / 1e6, 'M');
    else if (n < 1e12) out = unit(n / 1e9, 'B');
    else out = n.toExponential(2).replace('e+', 'e');
    return (neg ? '−' : '') + out;
  }
  // Aah: 1 decimal below 100, none above (§3.1).
  function fmtAah(x) { if (typeof x !== 'number' || !Number.isFinite(x)) return fmt(x); return x < 100 ? String(Math.floor(x * 10) / 10) : fmt(x); } // 3, 3.5, 19.5 (one format everywhere)

  const num = v => String(+(+v).toFixed(4));
  function fillText(tpl, m, star, p) {
    return tpl.replace(/\{([^}]*)\}/g, (_, k) => {
      if (k === '%') { const arr = p.echo || p.refire; return Math.round(arr[star - 1] * 100) + '%'; }
      if (k[0] === 'x') return num(1 + parseFloat(k.slice(1)) * m);
      return num(parseFloat(k) * m);
    });
  }
  // One-line card text with the numbers for the given ★ (≤ 64 characters). `col` is accepted for symmetry.
  function describeShell(id, col, star) { const row = SH[id]; if (!row) return ''; star = Math.max(1, Math.min(3, star | 0 || 1)); return fillText(row.text, starMult(star), star, row.p); }
  function describeFusion(key) { const fu = FU[key]; return fu ? fillText(fu.text, 1, 1, fu.p) : ''; }
  function describeRule(id) { const r = RULE_INFO[id]; return r ? r.text : ''; }
  function colourName(col) { return COLOURS[col] ? COLOURS[col].name : ''; }
  function shellLabel(id, col) { const row = SH[id]; if (!row) return id; return row.col === '*' && col ? row.name + ' (' + colourName(col) + ')' : row.name; }
  function showName(s) { if (s === 23) return 'Midnight Countdown'; const f = fest(s); return (FESTIVALS[f - 1] || ('Festival ' + f)) + ' ' + SHOW_NAMES[s % 3]; }
  // Full rule text for the Inspect sheet, generated from params.
  function inspectShell(id, col, star) {
    const row = SH[id]; if (!row) return null; star = Math.max(1, Math.min(3, star | 0 || 1));
    const m = starMult(star), p = row.p, n = v => num(v * m), k = v => num(v * m), cn = c => COLOURS[c].name; const L = [];
    if (row.shots > 1) L.push('Fires ' + row.shots + ' bursts.');
    if (p.ooh) L.push('+' + n(p.ooh) + ' Ooh.');
    if (p.oohPerUp) L.push('+' + n(p.oohPerUp) + ' Ooh per burst up.');
    if (p.oohIfEmpty) L.push('+' + n(p.oohIfEmpty[0]) + ' Ooh if no bursts are up, else +' + n(p.oohIfEmpty[1]) + '.');
    if (p.oohIfFirst) L.push('+' + n(p.oohIfFirst[0]) + ' Ooh if first to fire, else +' + n(p.oohIfFirst[1]) + '.');
    if (p.oohIfLast) L.push('+' + n(p.oohIfLast[0]) + ' Ooh if last to fire, else +' + n(p.oohIfLast[1]) + '.');
    if (p.oohPerFired) L.push('+' + n(p.oohPerFired) + ' Ooh per burst fired before it.');
    if (p.oohPerDistinct) L.push('+' + n(p.oohPerDistinct) + ' Ooh per distinct colour up (White never counts).');
    if (p.aah) L.push('+' + n(p.aah) + ' Aah.');
    if (p.aahIfOwnColUp) L.push('+' + n(p.aahIfOwnColUp) + ' Aah if a burst of its colour is up (never for White).');
    if (p.aahIfColUp) L.push('+' + n(p.aahIfColUp[1]) + ' Aah if a ' + cn(p.aahIfColUp[0]) + ' burst is up.');
    if (p.aahPerColUp) L.push('+' + n(p.aahPerColUp[1]) + ' Aah per ' + cn(p.aahPerColUp[0]) + ' burst up' + (p.aahPerColUp[2] ? '; +' + n(p.aahPerColUp[2]) + ' if there are none.' : '.'));
    if (p.aahPerUp) L.push('+' + n(p.aahPerUp) + ' Aah per burst up.');
    if (p.aahPerDistinct) L.push('+' + n(p.aahPerDistinct) + ' Aah per distinct colour up.');
    if (p.aahPerFired) L.push('+' + n(p.aahPerFired) + ' Aah per burst fired before it.');
    if (p.aahPerCrowd) L.push('+' + n(1) + ' Aah per ' + p.aahPerCrowd + ' Crowd (at least +' + n(1) + ').');
    if (p.clearAah) L.push('Clears the whole sky: +' + n(p.clearAah) + ' Aah per burst cleared.');
    if (p.clearX) L.push('Clears the whole sky: ×(1 + ' + k(p.clearX) + ' per burst cleared) Aah.');
    if (p.x) L.push('×' + num(1 + p.x * m) + ' Aah.');
    if (p.xPerUp) L.push('×(1 + ' + k(p.xPerUp) + ' per burst up) Aah, if at least 1 burst is up.');
    if (p.xPerDistinct) L.push('×(1 + ' + k(p.xPerDistinct) + ' per distinct colour up) Aah.');
    if (p.xMonoPerUp) L.push('×(1 + ' + k(p.xMonoPerUp) + ' per burst up) Aah if 2+ bursts are up and all share one colour (White breaks it).');
    if (p.xLastPerUp) L.push('×(1 + ' + k(p.xLastPerUp) + ' per burst up) Aah if it fires last with at least 1 burst up.');
    if (p.xIfColUp) L.push('×' + num(1 + p.xIfColUp[1] * m) + ' Aah if another ' + cn(p.xIfColUp[0]) + ' burst is up.');
    if (p.xPerColFired) L.push('×(1 + ' + k(p.xPerColFired[1]) + ' per ' + cn(p.xPerColFired[0]) + ' burst fired before it) Aah.');
    if (p.xPerFired) L.push('×(1 + ' + k(p.xPerFired) + ' per burst fired before it) Aah.');
    if (p.xPerCrowdGained) L.push('×(1 + ' + k(p.xPerCrowdGained) + ' per Crowd gained so far this show) Aah.');
    if (p.floorAah) L.push('If none of its × conditions hold: +' + n(p.floorAah) + ' Aah instead.');
    if (p.extend) L.push('Every burst up hangs ' + Math.ceil(p.extend * m) + ' longer.');
    if (p.echo) L.push('Repeats the + numbers of the burst before it at ' + Math.round(p.echo[star - 1] * 100) + '% (not an Echo or a Cake).');
    if (p.refire) L.push('Repeats the + numbers of every burst up at ' + Math.round(p.refire[star - 1] * 100) + '%, except Blue rows, Echoes and Cakes.');
    if (p.coin) L.push('+$' + n(p.coin) + '.');
    if (p.coinIfColUp) L.push('+$' + n(p.coinIfColUp[2]) + ' if ' + p.coinIfColUp[1] + '+ ' + cn(p.coinIfColUp[0]) + ' bursts are up.');
    if (p.crowd) L.push('Crowd +' + n(p.crowd) + '.');
    if (row.wildColour) L.push('While up, counts as every colour.');
    L.push('Hang ' + row.hang + (row.hang === 0 ? ' (never stays up).' : '.'));
    const fus = FUSION_KEYS.filter(key => FU[key].a === id || FU[key].b === id).map(key => ({ key, name: FU[key].name, role: FU[key].a === id ? 'first' : 'second', partner: FU[key].a === id ? FU[key].b : FU[key].a }));
    return { id, name: row.name, label: shellLabel(id, col), mono: row.mono, col: row.col === '*' ? col || '*' : row.col, rarity: row.rar, cost: row.cost, hang: row.hang, shots: row.shots,
      fest: row.fest, lock: row.lock, tags: row.tags, pattern: row.pattern, star, text: describeShell(id, col, star), lines: L, fusions: fus, upCost: star < 3 ? upCost(id, star) : null };
  }

  // §7.4 Daily Show seed: 'daily-YYYY-MM-DD'. Pure: the caller supplies the local date as 'YYYY-MM-DD' (or 'YYYY-M-D';
  // anything after the day, such as a time, is ignored). The SIM never reads the clock, so there is no "today" default:
  // an unparseable argument returns null and the caller falls back (core.js and ui-end.js both do).
  function dailySeed(ymd) {
    const m = typeof ymd === 'string' ? /^\s*(\d{4})-(\d{1,2})-(\d{1,2})(?!\d)/.exec(ymd) : null;
    if (!m || +m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31) return null;
    const pad = x => String(+x).padStart(2, '0');
    return 'daily-' + m[1] + '-' + pad(m[2]) + '-' + pad(m[3]);
  }
  // §7.3 keepsake: the Commons in the final tubes and Crate; if none, 3 random unlocked Commons (private stream).
  function keepsakeOptions(S, unlocked) {
    const out = [], seen = {};
    for (const sh of ownedShells(S)) if (SH[sh.id].rar === 'C' && !seen[sh.id + ':' + sh.col]) { seen[sh.id + ':' + sh.col] = true; out.push({ id: sh.id, col: sh.col }); }
    if (out.length) return { fromRack: true, options: out };
    const r = sfcStream(S.seed + 'keepsake'); const commons = shellPool(unlocked || S.unlocked).filter(id => SH[id].rar === 'C'); const picks = [];
    while (picks.length < 3 && commons.length) { const id = commons.splice(Math.floor(r() * commons.length), 1)[0]; picks.push({ id, col: SH[id].col === '*' ? COL_IDS[Math.floor(r() * 4)] : SH[id].col }); }
    return { fromRack: false, options: picks };
  }
  function kitUnlocked(kit, unlocked) { const k = KITS[kit]; return !!k && (!k.lock || (unlocked || []).includes(k.lock)); }

  function clone(S) { return typeof structuredClone === 'function' ? structuredClone(S) : JSON.parse(JSON.stringify(S)); }
  function canon(v) {
    if (v === null || typeof v !== 'object') return v === undefined ? 'null' : JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
    const keys = Object.keys(v).filter(k => v[k] !== undefined).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  }
  function hashState(S) { return cyrb128(canon(S)).map(x => x.toString(16).padStart(8, '0')).join(''); }

  /* ================================================================== 5 · BOTS (spec §12.1; a port of the v11 reference bots) */
  const cl = tubes => tubes.map(t => ({ shell: t.shell ? Object.assign({}, t.shell) : null, rig: t.rig }));
  function scoreRack(tubes, rules, crowd, H) { const r = scoreFull(tubes, rules, crowd); return H ? Math.floor((r.ooh + r.crowdGain * H) * r.aah) : r.applause; }
  function hill(tubes, rules, crowd, H, iters) {
    if (iters === undefined) iters = 6;
    let cur = tubes.map(t => t.shell), best = scoreRack(tubes, rules, crowd, H), bestSh = cur.slice();
    let imp = true, it = 0;
    while (imp && it < iters) {
      imp = false; it++;
      for (let i = 0; i < cur.length; i++) for (let j = i + 1; j < cur.length; j++) {
        if (!cur[i] && !cur[j]) continue;
        const c = cur.slice(); const tmp = c[i]; c[i] = c[j]; c[j] = tmp;
        const v = scoreRack(withShells(tubes, c), rules, crowd, H);
        if (v > best) { best = v; bestSh = c; cur = c; imp = true; }
      }
    }
    return { sh: bestSh, score: best };
  }
  function exhaustive(tubes, rules, crowd) { let best = -1, bs = null; for (const p of perms(tubes.map(t => t.shell))) { const v = scoreRack(withShells(tubes, p), rules, crowd, 0); if (v > best) { best = v; bs = p; } } return { sh: bs, score: best }; }

  function act(S, a, ctx) {
    const ev = step(S, a);
    if (ev.length === 1 && ev[0].type === 'illegal') throw new Error('bot made an illegal action ' + JSON.stringify(a) + ': ' + ev[0].reason);
    if (ctx && ctx.log) ctx.log.push(a);
    if (ctx && ctx.onEvents) ctx.onEvents(ev, a);
    return ev;
  }
  // Re-seat tube shells to `want` (array of shell objects by uid) through legal move actions.
  function arrangeTo(S, want, ctx) {
    const n = S.tubes.length;
    for (let i = 0; i < n; i++) {
      const cur = S.tubes[i].shell, w = want[i]; const cu = cur ? cur.uid : 0, wu = w ? w.uid : 0;
      if (cu === wu) continue;
      if (w) { let j = -1; for (let q = 0; q < n; q++) if (q !== i && S.tubes[q].shell && S.tubes[q].shell.uid === wu) { j = q; break; }
        if (j < 0) throw new Error('arrangeTo: shell ' + wu + ' not in tubes');
        act(S, { type: 'move', from: { zone: 'tube', i: j }, to: { zone: 'tube', i } }, ctx); }
      else { let j = -1; for (let q = i + 1; q < n; q++) if (!S.tubes[q].shell) { j = q; break; }
        act(S, { type: 'move', from: { zone: 'tube', i }, to: { zone: 'tube', i: j } }, ctx); }
    }
  }
  function candidates(S, card, isRig, ci) {
    const out = []; const f = fest(S.show);
    if (isRig) {
      const hasM = S.tubes.some(t => t.rig === 'mortar'); if (card.id === 'mortar' && hasM) return out;
      S.tubes.forEach((t, i) => { if (t.rig === card.id) return; const r = cl(S.tubes); r[i].rig = card.id; out.push({ tubes: r, cost: card.cost, kind: 'rig', tube: i }); });
      return out;
    }
    const tw = S.tubes.findIndex(t => t.shell && t.shell.id === card.id && t.shell.star < 3);
    if (tw >= 0) { const r = cl(S.tubes); const uc = upCost(card.id, r[tw].shell.star); r[tw].shell.star++; r[tw].shell.paid += uc; out.push({ tubes: r, cost: uc, kind: 'up', tube: tw, card: ci }); }
    const chooser = kitOf(S).chooseCol && SH[card.id].col === '*';
    const colsTry = chooser ? COL_IDS : [card.col];
    for (const cc of colsTry) for (let i = 0; i < S.tubes.length; i++) {
      const r = cl(S.tubes); const had = !!r[i].shell; const sold = had ? sellValue(r[i].shell) : 0;
      r[i].shell = { uid: S.nextUid, id: card.id, col: cc, star: 1, paid: card.cost };
      out.push({ tubes: r, cost: card.cost - sold, kind: had ? 'replace' : 'place', tube: i, card: ci, col: cc });
    }
    if (f >= 2 && S.tubes.length < 6 && S.tubes.every(t => t.shell)) {
      const tc = tubeCost(S); const r = cl(S.tubes); r.push({ shell: { uid: S.nextUid, id: card.id, col: card.col, star: 1, paid: card.cost }, rig: null });
      out.push({ tubes: r, cost: card.cost + tc, kind: 'tube', card: ci, col: card.col });
    }
    return out;
  }
  function commitCand(S, c, ctx) {
    const T = i => ({ zone: 'tube', i });
    const colour = () => { const card = S.shop.cards[c.card]; if (c.col && card.col !== c.col) act(S, { type: 'setColour', card: c.card, col: c.col }, ctx); };
    switch (c.kind) {
      case 'rig': act(S, { type: 'buyRig', tube: c.tube }, ctx); break;
      case 'up': act(S, { type: 'upgrade', card: c.card, to: T(c.tube) }, ctx); break;
      case 'place': colour(); act(S, { type: 'buy', card: c.card, to: T(c.tube) }, ctx); break;
      case 'replace': act(S, { type: 'sell', from: T(c.tube) }, ctx); colour(); act(S, { type: 'buy', card: c.card, to: T(c.tube) }, ctx); break;
      case 'tube': act(S, { type: 'buyTube' }, ctx); act(S, { type: 'buy', card: c.card, to: T(S.tubes.length - 1) }, ctx); break;
    }
  }
  function next3(S) { const s = S.show; return Math.max(baseTarget(S, s), baseTarget(S, Math.min(23, s + 1)), baseTarget(S, Math.min(23, s + 2))); }
  function gauss(rnd) { const u = Math.max(1e-9, rnd()), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function headRules(S) { const s = S.show; const r = rulesFor(S, s); if (r.length) return r; const h = S.headliners[fest(s) - 1]; return h ? [h] : []; }
  // Shared purchase planner (§12.1). o.noiseMode: 'eval' (per candidate evaluation) | 'card' (one draw per offer per shop generation).
  function planner(S, o, ctx) {
    const s = S.show, tgt = baseTarget(S, s);
    const H = Math.min(4, Math.max(0, 23 - s - 1));
    const head = headRules(S); const isCD = head.includes('countdown') || head.includes('countdown3');
    const noise = o.noise || 0, rnd = o.rnd;
    // o.matchAware (human, oracle): under Wind Shift or Crossed Wires the Headliner value also tries the Match re-seat,
    // since those bots press Match on the night (pairwise hill swaps never find that permutation).
    const mAware = !!o.matchAware && (head.includes('windshift') || head.includes('crossed'));
    const Uraw = tubes => { const g = hill(tubes, [], S.crowd, H).score; let b = head.length ? hill(tubes, head, S.crowd, H).score : g;
      if (mAware) b = Math.max(b, hill(applyMatch(tubes, head), head, S.crowd, H).score); const bw = isCD ? b / 10 : b; return { g, b, u: Math.log(1 + 0.5 * Math.min(g, bw) + 0.5 * g) }; };
    let rer = 0; const cardNoise = {};
    const nz = key => { if (!noise) return 0; if (o.noiseMode === 'card') { if (!(key in cardNoise)) cardNoise[key] = noise * gauss(rnd); return cardNoise[key]; } return noise * gauss(rnd); };
    const margin = o.buyMargin || 0;
    const buyLoop = (marg, maxSteps) => {
      for (let stp = 0; stp < maxSteps; stp++) {
        if (!S.shop) break;
        const cur = Uraw(S.tubes); const comfy = cur.b >= tgt * 1.3 && cur.g >= next3(S) * 1.2;
        let best = null, bv = 0;
        const offers = [];
        S.shop.cards.forEach((c, i) => { if (!c.sold) offers.push([c, false, 'c' + S.shop.rerolls + ':' + i, i]); });
        if (S.shop.rig && !S.shop.rig.sold) offers.push([S.shop.rig, true, 'rig' + S.shop.rerolls, -1]);
        for (const [card, isRig, key, ci] of offers) {
          if (o.allow && !isRig && !o.allow.includes(card.id)) continue;
          let bestHere = -9, bestC = null;
          for (const c of candidates(S, card, isRig, ci)) {
            if (c.cost > S.coins) continue;
            const v = Uraw(c.tubes); const lost = (Math.floor(S.coins / 5) - Math.floor((S.coins - c.cost) / 5)) > 0 ? 1 : 0;
            let val = (v.u - cur.u) - (comfy ? 0.04 * lost : 0) - 0.004 * c.cost;
            if (o.noiseMode !== 'card') val += nz();
            if (val > bestHere) { bestHere = val; bestC = c; }
          }
          if (bestC && o.noiseMode === 'card') bestHere += nz(key);
          if (bestC && bestHere > bv && bestHere > marg) { bv = bestHere; best = { card, c: bestC, isRig }; }
        }
        if (!best) {
          const rc = rerollCost(S);
          if (rer < (o.maxRerolls !== undefined ? o.maxRerolls : 2) && S.coins >= rc + 5 && !comfy && fest(S.show) >= 2) { act(S, { type: 'reroll' }, ctx); rer++; stp--; continue; }
          break;
        }
        commitCand(S, best.c, ctx);
      }
    };
    buyLoop(margin, 6);
    return { buyLoop };
  }
  function doMatch(S, rf, ctx) { if (isLegal(S, { type: 'match' })) act(S, { type: 'match' }, ctx); else arrangeTo(S, rf.map(t => t.shell), ctx); }
  function arrangeOracle(S, ctx) { const rules = rulesFor(S, S.show); arrangeTo(S, exhaustive(S.tubes, rules, S.crowd).sh, ctx); }
  // Human arrangement: Match if tonight's rule permutes the fuse and it helps; one hill pass; more effort below Eager.
  function arrangeHuman(S, o, buyLoop, ctx) {
    const rules = rulesFor(S, S.show); const tgt = baseTarget(S, S.show);
    const cur = () => scoreRack(S.tubes, rules, S.crowd, 0);
    if (rules.includes('windshift') || rules.includes('crossed')) { const rf = applyMatch(S.tubes, rules); if (scoreRack(rf, rules, S.crowd, 0) > cur()) doMatch(S, rf, ctx); }
    arrangeTo(S, hill(S.tubes, rules, S.crowd, 0, 1).sh, ctx);
    if (o.mood !== false && cur() < 1.25 * tgt) {
      arrangeTo(S, hill(S.tubes, rules, S.crowd, 0, 3).sh, ctx);
      if (cur() < 1.25 * tgt && buyLoop && S.coins >= 3) { buyLoop(0, 3); arrangeTo(S, hill(S.tubes, rules, S.crowd, 0, 3).sh, ctx); }
    }
  }
  function faceValue(sh) { return resolveShow([{ shell: { id: sh.id, col: sh.col, star: 1, uid: 0 }, rig: null }], { rules: null, crowd: 0 }).applause + (SH[sh.id].p.aah || 0) * 20 + SH[sh.id].cost; }
  function shuffleRack(S, rnd, ctx) { const sh = S.tubes.map(t => t.shell); for (let i = sh.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = sh[i]; sh[i] = sh[j]; sh[j] = t; } arrangeTo(S, sh, ctx); }

  // A bot plays one build phase (buys and arranges) through step(); the runner then applies the Sponsor rule and lights.
  function mkBot(name, fn, sponsor, relight) { fn.botName = name; fn.sponsorStyle = sponsor; fn.relightStyle = relight || 'human'; return fn; }
  const bots = {};
  bots.donothing = mkBot('donothing', function () {}, null);
  bots.random = mkBot('random', function (S, o, ctx) {
    const rnd = o.rnd; if (!S.shop) { shuffleRack(S, rnd, ctx); return; }
    for (let t = 0; t < 3; t++) {
      if (rnd() < 0.3) break;
      const aff = []; S.shop.cards.forEach((c, i) => { if (!c.sold && c.cost <= S.coins) aff.push([c, false, i]); });
      if (S.shop.rig && !S.shop.rig.sold && S.shop.rig.cost <= S.coins) aff.push([S.shop.rig, true, -1]);
      if (!aff.length) break;
      const [card, isRig, ci] = aff[Math.floor(rnd() * aff.length)];
      const cs = candidates(S, card, isRig, ci).filter(c => c.cost <= S.coins); if (!cs.length) break;
      commitCand(S, cs[Math.floor(rnd() * cs.length)], ctx);
    }
    shuffleRack(S, rnd, ctx);
  }, 'random');
  bots.greedy = mkBot('greedy', function (S, o, ctx) {
    if (!S.shop) return; const f = fest(S.show);
    for (let t = 0; t < 5; t++) {
      const full = S.tubes.every(x => x.shell);
      if (f >= 2 && full && S.tubes.length < 6 && tubeCost(S) <= S.coins) { act(S, { type: 'buyTube' }, ctx); continue; }
      const aff = []; S.shop.cards.forEach((c, i) => { if (!c.sold && c.cost <= S.coins) aff.push([c, i]); });
      if (!aff.length) break;
      aff.sort((a, b) => faceValue(b[0]) - faceValue(a[0])); const [card, ci] = aff[0];
      const tw = S.tubes.findIndex(x => x.shell && x.shell.id === card.id && x.shell.star < 3);
      if (tw >= 0) { const uc = upCost(card.id, S.tubes[tw].shell.star); if (uc <= S.coins) { act(S, { type: 'upgrade', card: ci, to: { zone: 'tube', i: tw } }, ctx); continue; } else break; }
      const e = S.tubes.findIndex(x => !x.shell); if (e >= 0) { act(S, { type: 'buy', card: ci, to: { zone: 'tube', i: e } }, ctx); continue; }
      let wi = 0; S.tubes.forEach((x, i) => { if (faceValue(x.shell) < faceValue(S.tubes[wi].shell)) wi = i; });
      if (faceValue(card) > 1.2 * faceValue(S.tubes[wi].shell)) { act(S, { type: 'sell', from: { zone: 'tube', i: wi } }, ctx); act(S, { type: 'buy', card: ci, to: { zone: 'tube', i: wi } }, ctx); }
      else break;
    }
  }, null);
  bots.greedyMood = mkBot('greedyMood', function (S, o, ctx) {
    bots.greedy(S, o, ctx);
    const rules = rulesFor(S, S.show); const tgt = baseTarget(S, S.show);
    if (scoreRack(S.tubes, rules, S.crowd, 0) < 0.85 * tgt) arrangeTo(S, hill(S.tubes, rules, S.crowd, 0, 1).sh, ctx);
  }, null);
  bots.greedymood = bots.greedyMood;
  bots.oracle = mkBot('oracle', function (S, o, ctx) { if (S.shop) planner(S, Object.assign({ matchAware: true }, o), ctx); arrangeOracle(S, ctx); }, 'oracle', 'oracle');
  bots.human = mkBot('human', function (S, o, ctx) {
    const oo = Object.assign({ noise: 0.10, noiseMode: 'card', buyMargin: 0.03, maxRerolls: 1, matchAware: true }, o);
    let bl = null; if (S.shop) bl = planner(S, oo, ctx).buyLoop; arrangeHuman(S, oo, bl, ctx);
  }, 'human');
  bots.novice = mkBot('novice', function (S, o, ctx) {
    const oo = Object.assign({ noise: 0.10, noiseMode: 'eval', buyMargin: 0.03 }, o);
    if (S.shop) planner(S, oo, ctx); const rules = rulesFor(S, S.show); arrangeTo(S, hill(S.tubes, rules, S.crowd, 0, 1).sh, ctx);
  }, 'novice');
  // Monomaniac: the human (or oracle) bot, but from show 7 it may buy only its archetype list plus Peony, Strobe and rigs.
  bots.mono = function (arch, base) {
    base = base || 'human'; if (!ARCHETYPES[arch]) throw new Error('unknown archetype ' + arch);
    return mkBot('mono:' + arch + ':' + base, function (S, o, ctx) {
      const oo = Object.assign({}, o); if (S.show >= 6) oo.allow = ARCHETYPES[arch].concat(['peony', 'strobe']);
      if (base === 'human') bots.human(S, oo, ctx); else bots.oracle(S, oo, ctx);
    }, base === 'human' ? 'human' : 'oracle', 'human');
  };
  function resolveBot(bot, o) {
    if (typeof bot === 'function') return bot;
    if (bot === 'mono') return bots.mono(o.arch || 'canopy', o.base || 'human');
    if (typeof bot === 'string' && bot.indexOf('mono:') === 0) { const [, arch, base] = bot.split(':'); return bots.mono(arch, base); }
    if (bot === 'humanBold') { o.bold = true; return bots.human; }
    const fn = bots[bot]; if (!fn || typeof fn !== 'function' || bot === 'mono') throw new Error('unknown bot ' + bot); return fn;
  }
  function sponsorPick(style, S, o) {
    if (!S.sponsor || S.sponsor.accepted) return false;
    if (o.noSponsor) return false;
    const rules = rulesFor(S, S.show); const base = baseTarget(S, S.show); const withS = Math.round(base * 1.5);
    const sc = scoreRack(S.tubes, rules, S.crowd, 0);
    if (style === 'random') return o.rnd() < 0.3;
    if (style === 'oracle') return sc >= 1.5 * base * (S.rain ? 1.25 : 1.45);
    if (style === 'human') {
      if (o.sponsorRule === 'lesson') { const h = S.runStats.history, last = h[h.length - 1]; return !!last && last.applause >= 2 * last.target && S.rain > 0; }
      if (sc >= 1.25 * withS) return true; if (o.bold && S.rain > 0 && sc >= 0.85 * withS) return true; return false;
    }
    if (style === 'novice') { const h = S.runStats.history, last = h[h.length - 1]; if (!last) return false; return last.applause >= 2 * last.target && S.rain > 0; }
    return false;
  }
  function botRnd(seed, o) { return xorshift32(o && o.rndSeed !== undefined ? ((o.rndSeed + 1) * 2654435761) >>> 0 : botSeed(seed)); }
  // One bot build phase on S (buys, arrangement, Sponsor); does not light. Returns the actions taken.
  function botTurn(S, bot, opts) {
    const o = Object.assign({}, opts); const fn = resolveBot(bot, o); if (!o.rnd) o.rnd = botRnd(S.seed + ':' + S.show, o);
    const ctx = { log: [] }; fn(S, o, ctx);
    if (sponsorPick(fn.sponsorStyle, S, o)) act(S, { type: 'sponsor', accept: true }, ctx);
    return ctx.log;
  }
  // playRun(seed, bot, opts) → {state, log}. opts: createState options plus bot options (bold, noSponsor, arch, base, rndSeed, keepLog, onStep).
  function playRun(seed, bot, opts) {
    const o = Object.assign({}, opts); const fn = resolveBot(bot, o);
    o.rnd = botRnd(seed, o);
    const S = createState(seed, o);
    const ctx = { log: o.keepLog ? [] : null, onEvents: o.onEvents || null };
    let guard = 0;
    while (S.phase === 'build') {
      if (++guard > 200) throw new Error('bot run did not terminate');
      if (o.onBuild) o.onBuild(S);
      fn(S, o, ctx);
      if (sponsorPick(fn.sponsorStyle, S, o)) act(S, { type: 'sponsor', accept: true }, ctx);
      if (o.beforeLight) o.beforeLight(S);
      const ev = act(S, { type: 'light' }, ctx);
      if (S.phase === 'build' && ev.some(e => e.type === 'relight')) {
        // Fair Weather relight: rearrange again (no shop), then light.
        if (fn.relightStyle === 'oracle') arrangeOracle(S, ctx); else arrangeHuman(S, Object.assign({}, o), null, ctx);
        act(S, { type: 'light' }, ctx);
      }
    }
    return { state: S, log: ctx.log };
  }
  // Compact per-run record for summaries (and for worker transfer).
  function runRecord(S, extra) {
    const rs = S.runStats;
    return Object.assign({
      seed: S.seed, won: S.phase === 'won', show: S.show, heads: S.headliners.slice(),
      hist: rs.history.map(h => ({ s: h.show, rule: h.rules.join('+') || null, t: h.target, bt: h.baseTarget, a: h.applause, pass: h.pass, sp: h.sponsored, enc: h.encore,
        b: h.bursts, crowd: h.crowdAfter, cheer: h.cheer, ooh: h.ooh, rain: h.rain, relight: h.relit, mood: h.moodAtLight, buys: h.purchases,
        rack4: h.rack.slice(0, 4).map(t => t.shell ? t.shell.id + (t.shell.star > 1 ? '*' + t.shell.star : '') + ':' + t.shell.col : '-').join(' ') })),
      stats: { maxBurstsPre: rs.maxBursts, maxCrowd: rs.maxCrowd, maxColsUp: rs.maxColsUp, maxColsFired: rs.maxColsFired, fusions: Object.keys(rs.fusions).length,
        headF4: rs.headF4, maxStar: rs.maxStar, maxMono: rs.maxMono, maxRigs: rs.maxRigs, sponsors: rs.sponsors, sponsorFails: rs.sponsorFails, rerolls: rs.rerolls, pity: rs.pity },
    }, extra || {});
  }
  const quant = (a, p) => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(p * (s.length - 1))]; };
  // §12.2 time model: show 1 = 10 s; later shows 12 s + 6 s per purchase + 3 s if the order changed; + 0.4 s per burst + 4 s.
  // opts.noBuys drops the 6 s per purchase: the model behind the §6 / §12.2 greedy and greedy-mood minutes.
  function runMinutes(rec, opts) { const pb = opts && opts.noBuys ? 0 : 6; let t = 0, prev = null;
    for (const h of rec.hist) { const moved = prev !== null && h.rack4 !== prev ? 1 : 0; t += h.s === 0 ? 10 : 12 + pb * (h.buys || 0) + 3 * moved; t += 0.4 * h.b + 4; prev = h.rack4; } return t / 60; }
  function summarizeRuns(R, info) {
    info = info || {}; const N = R.length; const pct = (a, b) => b ? 100 * a / b : NaN;
    const wins = R.filter(r => r.won).length;
    const deaths = {}; R.filter(r => !r.won).forEach(r => { const fe = fest(r.show); deaths[fe] = (deaths[fe] || 0) + 1; });
    const losses = N - wins;
    const inRange = (a, b) => { let c = 0; for (const k in deaths) if (+k >= a && +k <= b) c += deaths[k]; return c; };
    const shows = R.map(r => r.hist.filter(h => !h.relight).length);
    const rat = []; for (let s = 0; s < 24; s++) rat.push([]);
    for (const r of R) for (const h of r.hist) if (!h.relight && h.s < 24) rat[h.s].push(h.a / (h.bt || h.t));
    const ratioByFest = []; for (let fe = 0; fe < 8; fe++) ratioByFest.push(quant([].concat(rat[3 * fe], rat[3 * fe + 1], fe < 7 ? rat[3 * fe + 2] : []), 0.5));
    const arr = R.filter(r => r.hist.some(h => h.s === 23));
    const cdPass = arr.filter(r => r.won).length;
    const head = {}; for (const r of R) for (const h of r.hist) if (h.s % 3 === 2 && h.s !== 23 && h.rule) { const k = h.rule; head[k] = head[k] || { miss: 0, n: 0 }; head[k].n++; if (!h.pass) head[k].miss++; }
    const spP = R.reduce((a, r) => a + r.stats.sponsors, 0), spF = R.reduce((a, r) => a + r.stats.sponsorFails, 0);
    const rainW = R.filter(r => r.won && r.hist.some(h => h.rain)).length;
    const moods = { restless: { n: 0, pass: 0 }, hopeful: { n: 0, pass: 0 }, eager: { n: 0, pass: 0 } }; let moodN = 0;
    for (const r of R) for (const h of r.hist) if (h.mood && moods[h.mood]) { moods[h.mood].n++; moodN++; if (h.pass) moods[h.mood].pass++; }
    const cdShare = arr.map(r => r.hist.find(h => h.s === 23)).map(h => h.cheer / h.ooh);
    const crowdCD = arr.map(r => { const h = r.hist.find(x => x.s === 22); return h ? h.crowd : NaN; }).filter(x => !Number.isNaN(x));
    const ms = { busy8: 0, crowd40: 0, spectrum: 0, fusion: 0, headF4: 0, star3: 0, mono: 0, rigger: 0 };
    R.forEach(r => { const st = r.stats; if (st.maxBurstsPre >= 8) ms.busy8++; if (st.maxCrowd >= 40) ms.crowd40++; if (st.maxColsUp >= 3 || st.maxColsFired >= 4) ms.spectrum++; if (st.fusions) ms.fusion++;
      if (st.headF4) ms.headF4++; if (st.maxStar >= 3) ms.star3++; if (st.maxMono >= 5) ms.mono++; if (st.maxRigs >= 3) ms.rigger++; });
    const mins = R.map(r => runMinutes(r)), minsNB = R.map(r => runMinutes(r, { noBuys: true }));
    const bursts = {}; for (const r of R) for (const h of r.hist) { const k = h.s === 0 ? 's1' : h.s === 23 ? 'CD' : 'F' + fest(h.s); (bursts[k] = bursts[k] || []).push(h.b); }
    const medB = {}; for (const k in bursts) medB[k] = quant(bursts[k], 0.5);
    const firstMissGap = R.filter(r => !r.won).map(r => { const i = r.hist.findIndex(h => !h.pass); return r.hist.length - 1 - i; });
    return {
      bot: info.bot || null, opts: info.opts || {}, n: N, wins, winPct: pct(wins, N),
      deaths, deathPct: Object.fromEntries(Object.keys(deaths).map(k => [k, pct(deaths[k], N)])),
      lossesF2F4Pct: pct(inRange(2, 4), losses), lossesF6F8Pct: pct(inRange(6, 8), losses), lossesF1F2Pct: pct(inRange(1, 2), losses),
      showsP10: quant(shows, 0.1), showsP50: quant(shows, 0.5), showsP90: quant(shows, 0.9),
      ratioByFest, cdArrivals: arr.length, cdPassPct: pct(cdPass, arr.length), rainInWinsPct: pct(rainW, wins),
      headMiss: Object.fromEntries(Object.entries(head).map(([k, v]) => [k, { missPct: pct(v.miss, v.n), n: v.n }])),
      sponsorPassesPerRun: N ? spP / N : NaN, sponsoredMissesPerRun: N ? spF / N : NaN, sponsoredMissPct: pct(spF, spP + spF),
      moodAtLight: Object.fromEntries(Object.entries(moods).map(([k, v]) => [k, { sharePct: pct(v.n, moodN), passPct: pct(v.pass, v.n), n: v.n }])),
      crowdShareCD: quant(cdShare, 0.5), crowdAtCD: quant(crowdCD, 0.5),
      milestonePct: Object.fromEntries(Object.entries(ms).map(([k, v]) => [k, pct(v, N)])),
      reroll: N ? R.reduce((a, r) => a + r.stats.rerolls, 0) / N : NaN, pity: N ? R.reduce((a, r) => a + r.stats.pity, 0) / N : NaN,
      minutesP10: quant(mins, 0.1), minutesP50: quant(mins, 0.5), minutesP90: quant(mins, 0.9),
      minutesNoBuysP10: quant(minsNB, 0.1), minutesNoBuysP50: quant(minsNB, 0.5), minutesNoBuysP90: quant(minsNB, 0.9), medianBursts: medB,
      missToEndP50: quant(firstMissGap, 0.5), missToEndP90: quant(firstMissGap, 0.9),
    };
  }
  // runBots({bot, n, seeds, opts, onProgress}) → §12 summary. Seeds default to 1..n (n default 200).
  function runBots(cfg) {
    cfg = cfg || {}; const bot = cfg.bot || 'human'; const opts = Object.assign({}, cfg.opts);
    let seeds = cfg.seeds; if (!seeds) { seeds = []; for (let i = 1; i <= (cfg.n || 200); i++) seeds.push(i); }
    const recs = [];
    seeds.forEach((sd, i) => { const r = playRun(sd, bot, opts); recs.push(runRecord(r.state)); if (cfg.onProgress) cfg.onProgress(i + 1, seeds.length); });
    const sum = summarizeRuns(recs, { bot: typeof bot === 'string' ? bot : bot.botName, opts });
    if (cfg.records) sum.records = recs;
    return sum;
  }

  const api = {
    version: VERSION, DATA,
    // §11.4
    createState, step, legalActions, rulesFor, resolveShow, previewChips, mood, matchPerm, favourite, shapley, clone, hashState,
    // pure helpers (contract)
    target, baseTarget, fireOrder, seesPerTube, payoutPreview, nearMiss, nearMissAsync, lessonFor, milestoneProgress, nearestMilestones,
    fmt, fmtAah, describeShell, describeFusion, describeRule, inspectShell, shellLabel, colourName, showName, dailySeed,
    // extra helpers
    isLegal, illegalReason, placeHeld, describeBuild, moodVisible, keepsakeOptions, kitUnlocked, shellPool, scoreFull, applyMatch, bestArrangement, paretoRun,
    tubeCost, upCost, sellValue, rerollCost, interestCap, festivalOf: fest, nextHeadlinerShow, fxRng,
    clearCaches() { APPLAUSE_MEMO.clear(); },   // benchmarks: time step() without the mood memo (results never depend on it)
    rng: { cyrb128, rngNext, seedRng, xorshift32 },
    // bots (§12)
    bots, runBots, playRun, botTurn, runRecord, summarizeRuns, runMinutes, sponsorPick,
    botTools: { hill, exhaustive, perms, scoreRack, candidates, arrangeTo, planner },
  };
  return api;
}
const OOH = OohSim();
if (typeof module === 'object' && module.exports) module.exports = OOH;
