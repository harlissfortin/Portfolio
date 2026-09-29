/* ============================================================================
 * fx.js: Ooh × Aah sky, bursts, particles and juice. Owner: fx. One global: FX.
 * Spec: DESIGN.md §4.1 colour/shape language · §4.4 burst patterns · §8.5 visual identity ·
 *       §9 juice map · §11.5/§11.7 canvas and performance. Module contract: src/CONTRACT.md.
 *
 * API
 *  init(canvas, opts?)   opts {reducedMotion, highContrast, speed, instant, test, seed, anchors, drawApplause}
 *                        Canvas 2D {alpha:false}; backing store = CSS size × min(DPR, 2) via setTransform;
 *                        ResizeObserver + DPR matchMedia. Draws nothing on its own: the core calls update/render.
 *  resize()              re-measure (also automatic)
 *  setOptions({reducedMotion, highContrast, speed, instant, drawApplause})
 *  setSeed(seed)         the procedural skyline, crowd and lanterns are seeded from it (fxRng = seed + 'fx')
 *  setScene({festival, show, crowd, rules, tubes:[{x, soot, shellCol, rig}], haze, cheer, mood, target, seed, anchors})
 *        festival 1..8 (9+ Afterparty) · show 1-based · crowd = the SIM Crowd (figures = min(160, 6 + ⌊14·log2(1 + crowd/4)⌋))
 *        tubes[i].x = tube centre in canvas CSS px · soot = timesFired · shellCol tints the tube-mouth ember · rig 'tall' adds Hang
 *        haze 0..1 (festival smoke; add up over a festival, 0 at the next) · cheer 0..1 arm pose (build) · mood 'restless'|
 *        'hopeful'|'eager' (arm pose + cheer-meter band) · target = effective target (cheer-meter tick)
 *        anchors {ooh:{x,y}, aah:{x,y}, coins:{x,y}} = where the DOM readout sits, in canvas CSS px (sparks fly there)
 *  play(events, {speed, instant, onPresent(ev), onSlam(ev), onDone()}) → {fastForward(), skip(), done: Promise}
 *        Paces the §9 chain: burst k waits max(110, 420·0.86^k) ms ÷ speed (300 ms ÷ speed in reduced motion).
 *        onPresent(ev) fires as each event is shown (FX draws it the same frame). The `applause` event is presented AT THE
 *        SLAM (after the 400 ms roll-up), then onSlam(ev); onDone() ≥ 600 ms later. instant (or opts.test) = synchronous.
 *        fastForward() = ×4 for the rest of the chain · skip() = present everything up to the slam now, then slam.
 *        Events drawn: fuseLit launch burst gainOoh gainAah multAah fusion clear extend repeat crowdGain coinGain skyAge
 *        crowdCheer applause payout rainCheck critical relight milestone runLost runWon (+ buildOpen moodChanged via event()).
 *        Any other event is passed to onPresent with no visual.
 *  event(ev)             present one out-of-chain event now (buildOpen, moodChanged, crowdGain, critical, relight, runLost …)
 *  update(dtSec), render()   called by the core's fixed-timestep rAF loop
 *  pictogram(shellId, col, star, sizePx, opts?) → HTMLCanvasElement (CSS sizePx, backing × DPR). The burst pattern frozen at
 *        45% of its life. opts {token (plate + pictogram + monogram + star pips; height = 1.25 × size), plate, mono, pips,
 *        hang (n Hang pips under the token), washed, highContrast, dpr}
 *  finale() · dim(on = true) · critical(on | {on, pulse}) · clearSky({all}?) (all: also popups, banners, Applause) · stats()
 *  attachBackdrop(canvas)
 *  Helpers: fmt(n) (§8.5), tier(v), xTier(f), sootLevel(timesFired) → 0..5 (for the DOM tube rims)
 * ==========================================================================*/
const FX = (() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - (1 - t) * (1 - t) * (1 - t);
  const easeBack = t => { t -= 1; return 1 + 2.9 * t * t * t + 1.9 * t * t; };
  const nowMs = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
  const hasDoc = typeof document !== 'undefined';

  /* ---------- number format (§8.5) and tiers (§9) ---------- */
  function fmt(n) {
    n = Number(n) || 0;
    const neg = n < 0; n = Math.abs(n);
    let s;
    if (n < 1e4) s = String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    else if (n >= 1e12) s = n.toExponential(2).replace('+', '');
    else {
      const d = n >= 1e9 ? 1e9 : n >= 1e6 ? 1e6 : 1e3, v = n / d;
      s = (v < 10 ? Math.floor(v * 10) / 10 : Math.floor(v)) + (d === 1e9 ? 'B' : d === 1e6 ? 'M' : 'K');
    }
    return (neg ? '−' : '') + s;
  }
  const fmtA = v => (v < 100 && Math.abs(v - Math.round(v)) > 1e-6 ? (Math.round(v * 10) / 10).toFixed(1) : fmt(Math.round(v)));
  const fmtX = f => String(Math.round(f * 100) / 100);
  const tier = v => clamp(Math.floor(Math.log10(Math.max(1, v))), 0, 6);
  const xTier = f => clamp(Math.round(3 * Math.log2(Math.max(1, f))), 0, 6);
  const sootLevel = n => clamp(Math.floor(Math.log2(1 + Math.max(0, n || 0))), 0, 5);

  /* ---------- seeded randomness (fxRng; never the SIM's) ---------- */
  function hash(str) { let h = 2166136261; str = String(str); for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mkRng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  let rng = mkRng(1);

  /* ---------- palette (§4.1, §8.5) ---------- */
  const PAL = {R: '#D55E00', A: '#E69F00', G: '#009E73', B: '#56B4E9', W: '#F0F0F0', F: '#CC79A7'};
  const PAL_HC = {R: '#FF7A33', A: '#FFC23D', G: '#22D3A6', B: '#8AD7FF', W: '#FFFFFF', F: '#F29BD4'};
  const TOK = {top: '#0B1026', hor: '#1B1440', ink: '#05070F', brass: '#C9A227', paper: '#F4EFE6', dim: '#B9B2C7', line: '#2A2F4A', aah: '#F2C14E', x: '#56B4E9', danger: '#E0533D', ok: '#7BD389', warm: '#FFD58A'};
  const TOK_HC = {top: '#000000', hor: '#0A0A0A', ink: '#000000', brass: '#FFD166', paper: '#FFFFFF', dim: '#E6E6E6', line: '#FFFFFF', aah: '#FFD166', x: '#8AD7FF', danger: '#FF6B5E', ok: '#8CFF9E', warm: '#FFE2A0'};
  const CI = {R: 0, A: 1, G: 2, B: 3, W: 4, X: 4, F: 5, K: 6, L: 7, S: 8};
  const tok = () => (opt.highContrast ? TOK_HC : TOK);
  const hx = h => { h = String(h).replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); const n = parseInt(h, 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const toHex = (r, g, b) => '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
  const mix = (a, b, t) => { const p = hx(a), q = hx(b); return toHex(lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t)); };
  const rgba = (h, a) => { const c = hx(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
  const desat = h => { const c = hx(h), l = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11; return mix(toHex(l, l, l), '#D8CBA0', 0.35); };
  function colours() { const p = opt.highContrast ? PAL_HC : PAL; return [p.R, p.A, p.G, p.B, p.W, p.F, '#8E8BA6', '#FFD58A', desat(p.A)]; }

  /* ---------- §4.4 pattern table: n, speed, gravity, drag/frame@60Hz, life, trail, twinkle ---------- */
  const PAT = {
    sphere: [48, 170, 40, .975, 1.4, .25, 0], trails: [56, 180, 40, .975, 1.6, .7, 0], streak: [12, 120, 30, .98, 1.2, .9, 0],
    strobe: [24, 120, 20, .97, 1.2, 0, 1], fronds: [42, 150, 70, .985, 1.8, .8, 0], droop: [60, 120, 90, .99, 2.8, .95, .2],
    fan: [36, 260, 120, .98, 1.2, .5, 0], ring: [32, 220, 0, .95, .6, 0, 0], triple: [16, 150, 40, .97, 1.0, .3, 0],
    heart: [40, 150, 25, .97, 1.5, .3, 0], spiral: [16, 90, 10, .99, 1.8, .6, .3], split: [8, 160, 40, .975, 1.6, .4, 0],
    ghost: [48, 170, 40, .975, 1.4, .25, 0], curtain: [60, 40, 110, .99, 2.2, .9, .2], smiley: [44, 140, 20, .97, 1.6, .2, 0],
    glitter: [56, 160, 50, .98, 2.2, .8, .8], crackle: [24, 150, 40, .97, 1.0, .2, 0], cascade: [50, 200, 150, .985, 2.0, .8, 0],
    crest: [44, 140, 20, .97, 1.6, .2, 0], cluster: [36, 180, 40, .975, 1.8, .5, .3], salvo: [10, 140, 40, .97, .9, .3, 0],
    prism: [48, 170, 40, .975, 1.5, .3, 0], moon: [30, 60, 0, .99, 1.8, 0, .3], rain: [14, 120, 40, .97, 1.0, .3, 0],
    planet: [36, 130, 10, .98, 1.8, .2, 0]
  };
  /* shell id → [pattern, variant, monogram, row colour, Hang] (§4.3) */
  const SH = {
    peony: ['sphere', 0, 'Pe', '*', 1], chrys: ['trails', 0, 'Ch', '*', 1], comet: ['streak', 0, 'Co', '*', 0], strobe: ['strobe', 0, 'St', 'W', 0],
    palm: ['fronds', 0, 'Pa', '*', 2], willow: ['droop', 0, 'Wi', 'A', 3], mine: ['fan', 0, 'Mi', '*', 1], salute: ['ring', 0, 'Sa', 'W', 0],
    candle: ['triple', 0, 'RC', '*', 1], heart: ['heart', 0, 'He', 'R', 1], girandola: ['spiral', 0, 'Gi', 'A', 1], fern: ['fronds', 1, 'Fe', 'G', 2],
    crossette: ['split', 0, 'Cr', '*', 1], echo: ['ghost', 0, 'Ec', 'W', 1], waterfall: ['curtain', 0, 'Wa', 'W', 2], kamuro: ['droop', 1, 'Ka', 'A', 3],
    dahlia: ['sphere', 1, 'Da', '*', 1], smiley: ['smiley', 0, 'Sm', '*', 2], glitter: ['glitter', 0, 'Gl', 'A', 2], strontium: ['heart', 1, 'Sr', 'R', 2],
    crackle: ['crackle', 0, 'Ck', 'W', 2], horsetail: ['cascade', 0, 'Ho', 'G', 2], brocade: ['glitter', 1, 'Br', 'A', 2], tourbillon: ['spiral', 1, 'To', 'X', 1],
    crest: ['crest', 0, 'TC', 'A', 1], thunder: ['ring', 1, 'TK', 'W', 0], finale: ['cluster', 0, 'GF', 'B', 3], puresky: ['ring', 2, 'PS', 'B', 1],
    barrage: ['salvo', 0, 'Ba', 'B', 1], prism: ['prism', 0, 'Pr', 'B', 1], bluemoon: ['moon', 0, 'BM', 'B', 2], nishiki: ['droop', 2, 'NK', 'A', 3],
    cake: ['rain', 0, 'Ca', '*', 1], saturn: ['planet', 0, 'Sn', 'B', 2]
  };
  const shellOf = id => SH[id] || SH.peony;

  /* ---------- options, scene, layout ---------- */
  const opt = {reducedMotion: false, highContrast: false, speed: 1, instant: false, test: false, drawApplause: true, drawMeter: true};
  const scene = {festival: 1, show: 1, crowd: 0, rules: [], tubes: [], haze: 0, cheer: null, mood: null, target: 0, anchors: null};
  let seedStr = 'first-show';
  let cv = null, ctx = null, W = 0, H = 0, dpr = 1, B = 36, cB = 20, rTop = 0, rBot = 0, S = 0.5, ready = false, ro = null;
  let T = 0, frameNo = 0;
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };

  /* ---------- particle pool: structure of arrays, no allocation in the loop (§11.7) ---------- */
  const EMBER = 1, SPLIT = 2, STROBE = 4, CRACK = 8, SPIN = 16, FG = 32, HOME = 64, EMB = 128, FADE = 256, POP = 512, RAINBOW = 1024, GLOW = 2048, CONF = 4096;
  function mkPool(n) {
    const f = () => new Float32Array(n);
    const P = {n, x: f(), y: f(), vx: f(), vy: f(), g: f(), dr: f(), life: f(), age: f(), tr: f(), tw: f(), sz: f(), al: f(), cx: f(), cy: f(), ph: f(), fs: f(), hx: f(), hy: f(),
      ci: new Uint8Array(n), fl: new Uint16Array(n), pr: new Uint8Array(n), on: new Uint8Array(n), bid: new Int32Array(n), free: new Int16Array(n), top: 0, count: 0, peak: 0};
    resetPool(P);
    return P;
  }
  function resetPool(P) { P.on.fill(0); P.top = 0; for (let i = P.n - 1; i >= 0; i--) P.free[P.top++] = i; P.count = 0; }
  const M = mkPool(400);
  let curBid = -1;
  function kill(P, i) { if (!P.on[i]) return; P.on[i] = 0; P.free[P.top++] = i; P.count--; }
  function steal(P) {
    let best = -1, bs = 9;
    for (let i = 0; i < P.n; i++) {
      if (!P.on[i]) continue;
      const pr = P.pr[i];
      let s;
      if (pr === 0) s = 0; else if (pr === 1) s = 2.5; else if (P.bid[i] === curBid) continue; else s = 1;
      if (pr !== 1) s += 1 - clamp(P.age[i] / (P.life[i] || 1), 0, 0.99);
      if (s < bs) { bs = s; best = i; }
    }
    if (best >= 0) kill(P, best);
    return best;
  }
  // pr: 0 = L3 decoration, 1 = ember (sky state), 2 = burst
  function spawn(P, x, y, vx, vy, g, dr, life, tr, tw, sz, al, ci, fl, pr, bid, delay) {
    let i;
    if (P.top > 0) i = P.free[--P.top];
    else { if (pr < 2) return -1; i = steal(P); if (i < 0) return -1; P.top--; }
    P.x[i] = x; P.y[i] = y; P.vx[i] = vx; P.vy[i] = vy; P.g[i] = g; P.dr[i] = dr; P.life[i] = life; P.age[i] = -delay;
    P.tr[i] = tr; P.tw[i] = tw; P.sz[i] = sz; P.al[i] = al; P.ci[i] = ci; P.fl[i] = fl; P.pr[i] = pr; P.bid[i] = bid;
    P.cx[i] = x; P.cy[i] = y; P.ph[i] = rng() * TAU; P.fs[i] = 0; P.hx[i] = NaN; P.hy[i] = NaN;
    P.on[i] = 1; P.count++; if (P.count > P.peak) P.peak = P.count;
    return i;
  }
  // The emitter context (reused; one pattern emission at a time).
  const EC = {P: M, cx: 0, cy: 0, gy: 0, S: 1, m: 1, ci: 0, fl: 0, al: 1, d: 0, pr: 2, bid: -1, row: PAT.sphere, R: rng, side: 1};
  function star(x, y, vx, vy, fl, delay, szm, ci) {
    const r = EC.row, s = EC.S;
    return spawn(EC.P, x, y, vx, vy, r[2] * s, r[3], r[4] * (0.85 + EC.R() * 0.3), r[5], r[6], 1.5 * szm * (0.55 + 0.45 * Math.sqrt(s)), EC.al,
      ci == null ? EC.ci : ci, fl | EC.fl, EC.pr, EC.bid, EC.d + delay);
  }
  function ball(cx, cy, n, sp, fl, delay, szm, emberN) {
    const R = EC.R, rot = R() * TAU;
    for (let i = 0; i < n; i++) {
      const th = rot + i * 2.39996, z = 1 - 2 * (i + 0.5) / n, rr = Math.sqrt(1 - z * z) * (0.93 + R() * 0.12);
      star(cx, cy, Math.cos(th) * sp * rr, Math.sin(th) * sp * rr, fl | (i < emberN ? EMBER : 0), delay, szm);
    }
  }
  const SHIELD = [[-.8, -.8], [0, -.9], [.8, -.8], [.82, -.2], [.72, .3], [.42, .72], [0, 1], [-.42, .72], [-.72, .3], [-.82, -.2]];
  function outline(pts, n, sp, szm) { // n stars evenly along a closed polyline
    const L = [], m = pts.length; let tot = 0;
    for (let i = 0; i < m; i++) { const a = pts[i], b = pts[(i + 1) % m], d = Math.hypot(b[0] - a[0], b[1] - a[1]); L.push(d); tot += d; }
    for (let k = 0; k < n; k++) {
      let u = (k / n) * tot, i = 0;
      while (u > L[i] && i < m - 1) { u -= L[i]; i++; }
      const a = pts[i], b = pts[(i + 1) % m], t = u / (L[i] || 1), px = lerp(a[0], b[0], t), py = lerp(a[1], b[1], t);
      star(EC.cx, EC.cy, px * sp, py * sp, k % 4 === 0 ? EMBER : 0, 0, szm);
    }
  }
  /* The parametric generator (§4.4). Returns the burst's visual centre offset for mortar/fan patterns. */
  function emitPattern(pat, v) {
    const row = PAT[pat] || PAT.sphere, R = EC.R, s = EC.S, cx = EC.cx, cy = EC.cy;
    EC.row = row;
    const n = Math.max(5, Math.round(row[0] * EC.m)), sp = row[1] * s;
    switch (pat) {
      case 'sphere': {
        const rot = R() * TAU;
        for (let i = 0; i < n; i++) {
          const th = rot + i * 2.39996, z = 1 - 2 * (i + 0.5) / n, rr = Math.sqrt(1 - z * z) * (0.93 + R() * 0.12);
          const ci = v === 1 && i % 3 === 1 ? (EC.ci + 1 + (i % 4)) % 4 : EC.ci;       // Dahlia: multi-hue stars
          star(cx, cy, Math.cos(th) * sp * rr, Math.sin(th) * sp * rr, i < 10 ? EMBER : 0, 0, 1, ci);
        }
        break;
      }
      case 'trails': case 'glitter': case 'crackle': case 'strobe': case 'triple':
        if (pat === 'glitter' && v === 1) EC.row = [n, 140, 60, .982, 2.4, .85, .9];
        ball(cx, cy, pat === 'glitter' && v === 1 ? Math.round(n * 1.15) : n, pat === 'glitter' && v === 1 ? 140 * s : sp,
          pat === 'strobe' ? STROBE : pat === 'crackle' ? CRACK : 0, 0, pat === 'triple' ? 1.15 : 1, 10);
        break;
      case 'droop': {
        if (v) EC.row = [n, 115, 95, .99, 2.8, .95, v === 2 ? .75 : .5];
        ball(cx, cy, v === 1 ? Math.round(n * 1.3) : n, v ? 115 * s : sp, 0, 0, v ? 0.9 : 1, 10);
        break;
      }
      case 'fronds': {
        const per = Math.max(3, Math.round(6 * EC.m)), rot = R() * TAU;
        for (let a = 0; a < 7; a++) {
          const th = rot + a * TAU / 7, c = Math.cos(th), si = Math.sin(th);
          for (let j = 0; j < per; j++) {
            const k = sp * (0.5 + 0.5 * j / (per - 1));
            let vx = c * k, vy = si * k;
            if (v === 1) { const side = (j % 2 ? 1 : -1) * sp * 0.13; vx -= si * side; vy += c * side; }
            star(cx, cy, vx, vy, j === per - 1 || (a < 3 && j === per - 2) ? EMBER : 0, 0, v === 1 ? 0.95 : 1.35);
          }
        }
        break;
      }
      case 'streak': { // a rising star with a long tail, then a 12-star pop
        EC.row = [1, 1, 30, .98, .34, .95, 0];
        star(cx, cy + 34 * s, 0, -sp * 1.5, 0, 0, 1.9);
        EC.row = row;
        ball(cx, cy - 8 * s, n, sp, 0, 0.3, 1.1, 10);
        break;
      }
      case 'fan': { // upward fan ±40° from the ground
        EC.fl |= FG;
        for (let i = 0; i < n; i++) {
          const th = -Math.PI / 2 + (i / (n - 1) - 0.5) * 1.4 + (R() - 0.5) * 0.08, k = sp * (0.62 + R() * 0.38);
          star(cx + (R() - 0.5) * 6 * s, EC.gy, Math.cos(th) * k, Math.sin(th) * k, i % 4 === 0 ? EMBER : 0, R() * 0.06, 1.05);
        }
        EC.fl &= ~FG;
        break;
      }
      case 'ring': {
        const rot = R() * TAU;
        for (let i = 0; i < n; i++) { const th = rot + i * TAU / n; star(cx, cy, Math.cos(th) * sp, Math.sin(th) * sp, i % 3 === 0 ? EMBER : 0, 0, 1.2); }
        if (v === 1) for (let i = 0; i < n; i++) { const th = rot + (i + 0.5) * TAU / n; star(cx, cy, Math.cos(th) * sp * 0.6, Math.sin(th) * sp * 0.6, 0, 0.05, 1.1); }
        if (v === 2) { EC.row = PAT.sphere; ball(cx, cy, Math.round(n * 0.8), 75 * s, 0, 0.04, 0.95, 4); }
        break;
      }
      case 'heart': {
        const pts = [];
        if (v === 1) for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 0.42 : 1; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
        else for (let k = 0; k < 24; k++) { const t = k / 24 * TAU, sn = Math.sin(t); pts.push([16 * sn * sn * sn / 17, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17 + 0.1]); }
        outline(pts, n, sp, 1.1);
        break;
      }
      case 'spiral': {
        const rot = R() * TAU;
        for (let i = 0; i < n; i++) {
          const th = rot + i * TAU / n, j = star(cx, cy, Math.cos(th) * sp, Math.sin(th) * sp, SPIN | (v === 1 ? RAINBOW : 0) | (i % 2 ? 0 : EMBER), 0, 1.3);
          if (j >= 0) { EC.P.cx[j] = cx; EC.P.cy[j] = cy; if (v === 1) EC.P.ph[j] = i; }
        }
        break;
      }
      case 'split': {
        const rot = R() * TAU;
        for (let i = 0; i < n; i++) { const th = rot + i * TAU / n; star(cx, cy, Math.cos(th) * sp, Math.sin(th) * sp, SPLIT | EMBER, 0, 1.35); }
        break;
      }
      case 'curtain': { // 30 emitters along a horizontal line
        const w = 105 * s;
        for (let i = 0; i < n; i++) {
          const e = (i % 30) / 29;
          star(cx - w + 2 * w * e, cy - 18 * s + (R() - 0.5) * 4 * s, (R() - 0.5) * sp * 0.7, sp * (0.1 + R() * 0.6), i % 6 === 0 ? EMBER : 0, e * 0.12 + R() * 0.12, 0.95);
        }
        break;
      }
      case 'smiley': {
        const pts = [];
        for (let k = 0; k < 26; k++) { const a = k / 26 * TAU; pts.push([Math.cos(a), Math.sin(a)]); }
        for (let k = 0; k < 26; k++) star(cx, cy, pts[k][0] * sp, pts[k][1] * sp, k % 3 === 0 ? EMBER : 0, 0, 1.05);
        for (let e = -1; e <= 1; e += 2) for (let k = 0; k < 3; k++) star(cx, cy, (e * 0.36 + (k - 1) * 0.05) * sp, (-0.3 + (k === 1 ? -0.05 : 0.02)) * sp, 0, 0, 1.2);
        for (let k = 0; k < Math.max(6, n - 32); k++) { const a = Math.PI * (0.18 + 0.64 * k / Math.max(5, n - 33)); star(cx, cy, Math.cos(a) * 0.55 * sp, (Math.sin(a) * 0.55 + 0.02) * sp, 0, 0, 1); }
        break;
      }
      case 'crest': outline(SHIELD, n, sp, 1.1); break;
      case 'cascade': { // a fountain arcing to one side
        const side = EC.side;
        for (let i = 0; i < n; i++) {
          const th = -Math.PI / 2 + side * (0.42 + (R() - 0.5) * 0.36), k = sp * (0.45 + R() * 0.55);
          star(cx, cy + 10 * s, Math.cos(th) * k, Math.sin(th) * k, i % 5 === 0 ? EMBER : 0, i / n * 0.3, 1);
        }
        break;
      }
      case 'cluster': {
        const off = [[-0.5, 0.1], [0, -0.38], [0.5, 0.1]];
        for (let c = 0; c < 3; c++) ball(cx + off[c][0] * 95 * s, cy + off[c][1] * 95 * s, n, sp * 0.62, 0, c * 0.12, 1, 4);
        break;
      }
      case 'salvo': {
        for (let j = 0; j < 10; j++) ball(cx + (R() - 0.5) * 22 * s, cy + (0.9 - j * 0.2) * 70 * s, Math.max(4, n), sp * 0.45, 0, j * 0.05, 1, j % 3 === 0 ? 1 : 0);
        break;
      }
      case 'prism': {
        const rot = R() * TAU;
        for (let i = 0; i < n; i++) {
          const th = rot + i * 2.39996, z = 1 - 2 * (i + 0.5) / n, rr = Math.sqrt(1 - z * z), q = ((((th - rot) % TAU) + TAU) % TAU) / (TAU / 4) | 0;
          star(cx, cy, Math.cos(th) * sp * rr, Math.sin(th) * sp * rr, i < 10 ? EMBER : 0, 0, 1, q);
        }
        break;
      }
      case 'moon': {
        const j = spawn(EC.P, cx, cy, 0, 0, 0, 1, 1.8, 0, 0, 34 * s, 0.55 * EC.al, EC.ci, GLOW | EC.fl, EC.pr, EC.bid, EC.d);
        if (j >= 0) EC.P.sz[j] = 30 * s;
        const rot = R() * TAU;
        for (let i = 0; i < n; i++) { const th = rot + i * TAU / n; star(cx + Math.cos(th) * 20 * s, cy + Math.sin(th) * 20 * s, Math.cos(th) * sp, Math.sin(th) * sp, i % 3 === 0 ? EMBER : 0, 0, 1.15); }
        break;
      }
      case 'rain': for (let j = 0; j < 5; j++) ball(cx - 90 * s + j * 45 * s, cy + (R() - 0.5) * 16 * s, n, sp * 0.55, 0, j * 0.1, 1, 2); break;
      case 'planet': {
        ball(cx, cy, n, sp * 0.7, 0, 0, 1, 7);
        const tilt = -0.35, c = Math.cos(tilt), si = Math.sin(tilt), m = Math.round(24 * EC.m);
        for (let i = 0; i < m; i++) { const a = i * TAU / m, px = Math.cos(a) * 1.25, py = Math.sin(a) * 0.3; star(cx, cy, (px * c - py * si) * sp, (px * si + py * c) * sp, i % 8 === 0 ? EMBER : 0, 0, 1); }
        break;
      }
      default: ball(cx, cy, n, sp, 0, 0, 1, 10);
    }
  }
  function split(P, i) {
    const vx = P.vx[i], vy = P.vy[i], k = Math.sqrt(vx * vx + vy * vy) * 1.25 + 8, base = Math.atan2(vy, vx);
    for (let j = 0; j < 4; j++) {
      const th = base + Math.PI / 4 + j * Math.PI / 2;
      spawn(P, P.x[i], P.y[i], Math.cos(th) * k, Math.sin(th) * k, P.g[i], P.dr[i], Math.max(0.2, P.life[i] - P.age[i]), P.tr[i], P.tw[i], P.sz[i] * 0.8, P.al[i], P.ci[i],
        (j === 0 ? P.fl[i] & EMBER : 0) | (P.fl[i] & FG), P.pr[i], P.bid[i], 0);
    }
    kill(P, i);
  }

  /* ---------- sky state: bursts that hang (§3.1 ageing, §4.4 embers) ---------- */
  const NB = 48, BUR = [];
  for (let i = 0; i < NB; i++) BUR.push({id: -1, n: -1, pid: 0, on: false, linger: false, x: 0, y: 0, R: 0, col: 'W', ci: 4, hang: 0, shown: 0, id0: '', pat: 'sphere', v: 0, uid: null, tube: 0, born: 0, exp: -1, spark: 0, rain: false});
  let nextBid = 1;
  const burById = id => { const b = BUR[id % NB]; return b && b.id === id ? b : null; };
  const lingering = () => { const out = []; for (const b of BUR) if (b.on && b.linger) out.push(b); out.sort((a, b) => a.born - b.born || a.id - b.id); return out; };
  function newBurst() { const id = nextBid++, b = BUR[id % NB]; b.id = id; b.on = true; b.linger = false; b.exp = -1; b.spark = 0; return b; }
  function expire(b, fly) {
    if (!b || !b.on) return;
    b.linger = false; b.exp = T;
    const P = M, A = anchor('aah');
    for (let i = 0; i < P.n; i++) {
      if (!P.on[i] || P.bid[i] !== b.id) continue;
      if (fly && !opt.reducedMotion && (P.fl[i] & EMB)) {
        P.fl[i] = HOME; P.pr[i] = 0; P.life[i] = 1.6; P.age[i] = -(rng() * 0.12); P.cx[i] = A.x; P.cy[i] = A.y; P.ph[i] = 1; P.tr[i] = 0.6;
        P.vx[i] = (rng() - 0.5) * 160; P.vy[i] = -60 - rng() * 120; P.sz[i] *= 1.2; P.al[i] = 1;
      } else if (P.fl[i] & EMB) { P.fl[i] |= FADE; P.fs[i] = P.age[i]; }
    }
  }
  function spawnEmbers(b, still) {
    const k = opt.reducedMotion || still ? 0 : 1;
    for (let j = 0; j < 10; j++) {
      const a = rng() * TAU, r = b.R * (0.12 + rng() * 0.38);
      const i = spawn(M, b.x + Math.cos(a) * r, b.y + Math.sin(a) * r * 0.8, (rng() - 0.5) * 7 * k, (rng() - 0.5) * 6 * k - 1.5 * k, 0, 1, 1e9, 0, 0, 1.25, 0.8, b.rain ? j & 3 : b.ci, EMB | (b.rain ? RAINBOW : 0), 1, b.id, 0);
      if (i >= 0) M.age[i] = 0;
    }
  }
  function emberize(P, i) {
    const b = burById(P.bid[i]);
    if (!b || !b.linger) return false;
    P.fl[i] = EMB | (P.fl[i] & RAINBOW); P.pr[i] = 1; P.age[i] = 0; P.life[i] = 1e9; P.tr[i] = 0; P.al[i] = 0.8; P.sz[i] = Math.max(1.1, P.sz[i] * 0.9);
    P.x[i] = lerp(P.x[i], b.x, 0.45); P.y[i] = lerp(P.y[i], b.y, 0.45);
    const k = opt.reducedMotion ? 0 : 1;
    P.vx[i] = (rng() - 0.5) * 7 * k; P.vy[i] = ((rng() - 0.5) * 6 - 1.5) * k;
    return true;
  }
  function clearSky(fadeSec) {
    if (fadeSec && typeof fadeSec === 'object') { // clearSky({all: true}): also drop every overlay (popups, banners, rings, Applause)
      const all = !!fadeSec.all; fadeSec = fadeSec.fade != null ? +fadeSec.fade : 0.6;
      if (all) {
        for (const L of [POPS, BAN, RINGS, THR, BRAIDS, WAVES, SPARK, GLOWS]) for (const q of L) q.on = false;
        AP.on = false; flashA = 0; trauma = 0; hitStop = 0; LATER.length = 0;
        for (let i = 0; i < M.n; i++) if (M.on[i] && !(M.fl[i] & EMB)) kill(M, i);
      }
    }
    for (const b of BUR) if (b.on) { b.linger = false; if (b.exp < 0) b.exp = T; }
    for (let i = 0; i < M.n; i++) if (M.on[i] && (M.fl[i] & EMB) && !(M.fl[i] & FADE)) { M.fl[i] |= FADE; M.fs[i] = M.age[i] + (fadeSec ? fadeSec - 0.3 : 0); }
  }

  /* ---------- sprites (pre-rendered; no shadowBlur) ---------- */
  let HEAD = [], DOT = [], BIG = [], HAZE = null, HALO = null;
  function glowSprite(col, n, hard) {
    const c = mkCanvas(n, n), g = c.getContext('2d'), r = n / 2;
    if (hard) { g.fillStyle = mix(col, '#FFFFFF', 0.2); g.beginPath(); g.arc(r, r, r * 0.42, 0, TAU); g.fill(); return c; }
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, mix(col, '#FFFFFF', 0.82)); gr.addColorStop(0.13, mix(col, '#FFFFFF', 0.42)); gr.addColorStop(0.3, rgba(mix(col, '#FFFFFF', 0.1), 0.62));
    gr.addColorStop(0.58, rgba(col, 0.17)); gr.addColorStop(1, rgba(col, 0));
    g.fillStyle = gr; g.fillRect(0, 0, n, n);
    return c;
  }
  function softSprite(col, n, a0, a1) {
    const c = mkCanvas(n, n), g = c.getContext('2d'), r = n / 2, gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, rgba(col, a0)); gr.addColorStop(0.45, rgba(col, a1)); gr.addColorStop(1, rgba(col, 0));
    g.fillStyle = gr; g.fillRect(0, 0, n, n);
    return c;
  }
  let COLS = colours();
  function buildSprites() {
    const cols = COLS = colours(), hc = opt.highContrast;
    HEAD = cols.map(c => glowSprite(c, 32, hc));
    DOT = cols.map(c => softSprite(c, 8, 1, 0.6));
    BIG = cols.map(c => softSprite(c, 96, 0.9, 0.3));
    HAZE = softSprite('#77739A', 128, 0.55, 0.28);
    HALO = softSprite('#03040B', 128, 0.8, 0.5);
  }

  /* ---------- the town: gradient sky, seeded skyline (spire + 3-arch bridge), river, embankment (§8.5) ---------- */
  let BG = null, TOWN = null, RIVER = null, LIGHTS = [], stars = [], twk = null, METERG = null;
  function buildBg() {
    const t = tok(), c = mkCanvas(W * dpr, H * dpr), g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gr = g.createLinearGradient(0, 0, 0, rTop);
    gr.addColorStop(0, t.top); gr.addColorStop(1, t.hor);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (!opt.highContrast) { // sodium glow of the town on the horizon
      const w = g.createLinearGradient(0, rTop - B * 2.4, 0, rTop);
      w.addColorStop(0, 'rgba(255,150,90,0)'); w.addColorStop(1, scene.festival === 6 ? 'rgba(255,120,60,0.2)' : 'rgba(255,160,110,0.11)');
      g.fillStyle = w; g.fillRect(0, rTop - B * 2.4, W, B * 2.4);
    }
    const R = mkRng(hash(seedStr + '|stars'));
    stars = [];
    const n = Math.round(W * rTop / 1500);
    for (let i = 0; i < n; i++) {
      const y = Math.pow(R(), 1.6) * rTop * 0.92, x = R() * W, a = (1 - y / rTop) * (0.35 + R() * 0.55), r = 0.4 + R() * R() * 1.1;
      g.globalAlpha = a; g.fillStyle = R() < 0.15 ? '#FFE9C4' : '#DCE3FF'; g.fillRect(x, y, r, r);
      if (i < 18) stars.push(x, y, r + 0.4, R() * TAU);
    }
    g.globalAlpha = 1;
    const f = scene.festival;
    if (f === 5) { // Harvest Moon
      const mx = W * 0.8, my = rTop * 0.3, mr = Math.max(14, W * 0.075);
      g.drawImage(softSprite('#FFB35C', 64, 0.35, 0.12), mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
      g.fillStyle = opt.highContrast ? '#FFE2A0' : '#F5C77E'; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
      g.fillStyle = 'rgba(160,100,40,0.25)'; g.beginPath(); g.arc(mx - mr * 0.3, my - mr * 0.2, mr * 0.22, 0, TAU); g.arc(mx + mr * 0.35, my + mr * 0.25, mr * 0.16, 0, TAU); g.fill();
    } else { // a thin crescent
      const mx = W * 0.13, my = rTop * 0.15, mr = 6 + B * 0.06;
      g.fillStyle = '#E9E4D2'; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
      g.fillStyle = t.top; g.beginPath(); g.arc(mx + mr * 0.45, my - mr * 0.2, mr * 0.92, 0, TAU); g.fill();
    }
    BG = c;
  }
  function buildTown() {
    const t = tok(), s = B / 36, h = Math.ceil(B * 2.1), R = mkRng(hash(seedStr + '|town')), f = scene.festival;
    const c = mkCanvas(W * dpr, h * dpr), g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const base = h, lights = [], wins = [];
    // far layer: a low hill line and distant roofs, a shade lighter for depth
    g.fillStyle = opt.highContrast ? '#000' : mix(t.hor, t.ink, 0.55);
    g.beginPath(); g.moveTo(0, base);
    for (let x = 0; x <= W + 8; x += 8) g.lineTo(x, base - 12 * s - 6 * s * Math.sin(x * 0.013 + R() * 0.2) - (R() < 0.3 ? 4 * s : 0));
    g.lineTo(W, base); g.fill();
    // near layer: rooftops, chimneys, gables, a few trees
    const churchX = W * (0.6 + R() * 0.18), bx0 = W * (0.05 + R() * 0.08), bw = Math.min(W * 0.36, 190 * s);
    const ink = opt.highContrast ? '#000' : t.ink;
    g.fillStyle = ink;
    let x = -R() * 8 * s;
    while (x < W) {
      const w = (9 + R() * 18) * s, bh = (8 + R() * 14) * s, top = base - bh;
      if (R() < 0.12) { g.beginPath(); g.arc(x + w / 2, base - 9 * s, w * 0.45, 0, TAU); g.rect(x + w / 2 - 1, base - 9 * s, 2, 9 * s); g.fill(); x += w; continue; }
      g.fillRect(x, top, w, bh);
      const roof = R();
      if (roof < 0.5) { g.beginPath(); g.moveTo(x - 1, top); g.lineTo(x + w / 2, top - w * (0.35 + R() * 0.2)); g.lineTo(x + w + 1, top); g.fill(); }
      else if (roof < 0.62) { g.fillRect(x + w * 0.2, top - 3 * s, w * 0.6, 3 * s); }
      if (R() < 0.35) g.fillRect(x + w * (0.15 + R() * 0.6), top - (4 + R() * 3) * s, 2 * s, 5 * s);
      if (f === 7) wins.push([x - 1, top - 1, w + 2, 1.6 * s, 1]);  // Winter Lights: snow on the roofs
      for (let wy = top + 3 * s; wy < base - 3 * s; wy += 4.5 * s) for (let wx = x + 2 * s; wx < x + w - 3 * s; wx += 4 * s) if (R() < 0.13) { wins.push([wx, wy, 1.6 * s, 2 * s, 0]); lights.push(wx + s, wy); }
      x += w + (R() < 0.2 ? R() * 5 * s : 0);
    }
    // the church: nave, tower, spire, cross (and a clock at New Year's Eve)
    const nw = 20 * s, tw = 7 * s, th = 26 * s, sp = 22 * s, tx = churchX - nw / 2;
    g.fillRect(tx, base - 12 * s, nw, 12 * s);
    g.beginPath(); g.moveTo(tx - 1, base - 12 * s); g.lineTo(tx + nw / 2, base - 18 * s); g.lineTo(tx + nw + 1, base - 12 * s); g.fill();
    g.fillRect(tx - tw * 0.6, base - th, tw, th);
    g.beginPath(); g.moveTo(tx - tw * 0.6 - 0.5, base - th); g.lineTo(tx - tw * 0.1, base - th - sp); g.lineTo(tx + tw * 0.4 + 0.5, base - th); g.fill();
    g.fillRect(tx - tw * 0.1 - 0.6, base - th - sp - 5 * s, 1.2, 5 * s); g.fillRect(tx - tw * 0.1 - 2 * s, base - th - sp - 3.8 * s, 4 * s, 1.1);
    wins.push([tx + nw * 0.35, base - 9 * s, 2.4 * s, 4.5 * s, 0], [tx + nw * 0.65, base - 9 * s, 2.4 * s, 4.5 * s, 0]);
    lights.push(tx + nw * 0.4, base - 8 * s, tx + nw * 0.7, base - 8 * s);
    const clock = f >= 8;
    // the bridge with 3 arches (in front, standing in the river)
    const deck = base - 11 * s, span = bw / 3.3, pier = (bw - span * 3) / 4;
    g.fillStyle = ink;
    g.fillRect(bx0, deck - 2.5 * s, bw, 5 * s);
    for (let k = 0; k < 4; k++) g.fillRect(bx0 + k * (span + pier), deck, pier, base - deck);
    for (let k = 0; k < 3; k++) { // spandrels over each arch
      const ax = bx0 + pier + k * (span + pier);
      g.beginPath(); g.moveTo(ax, deck); g.lineTo(ax, base - 2 * s); g.ellipse(ax + span / 2, base, span / 2, base - deck - 2.5 * s, 0, Math.PI, 0, false); g.lineTo(ax + span, deck); g.fill();
    }
    for (let k = 0; k <= 6; k++) { const lx = bx0 + 4 * s + k * (bw - 8 * s) / 6; g.fillRect(lx - 0.5, deck - 7 * s, 1, 5 * s); lights.push(lx, deck - 7.5 * s); wins.push([lx - 1.1 * s, deck - 8.6 * s, 2.2 * s, 2.2 * s, 2]); }
    // windows and lamps (warm), snow caps
    for (const w of wins) {
      if (w[4] === 1) { g.fillStyle = 'rgba(230,236,255,0.75)'; g.fillRect(w[0], w[1], w[2], w[3]); continue; }
      g.fillStyle = w[4] === 2 ? '#FFE3A1' : rgba('#F6C56B', 0.45 + R() * 0.45);
      g.fillRect(w[0], w[1], w[2], w[3]);
    }
    if (clock) { const cx = tx - tw * 0.1, cy = base - th + 5 * s; g.fillStyle = '#F4EFE6'; g.beginPath(); g.arc(cx, cy, 2.6 * s, 0, TAU); g.fill(); g.strokeStyle = ink; g.lineWidth = 0.8; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy - 2.2 * s); g.moveTo(cx, cy); g.lineTo(cx - 0.6 * s, cy - 1.5 * s); g.stroke(); }
    if (opt.highContrast) { // 1 px white rim on the silhouettes
      const r = mkCanvas(W * dpr, h * dpr), q = r.getContext('2d');
      q.drawImage(c, 0, -dpr); q.globalCompositeOperation = 'source-in'; q.fillStyle = '#FFF'; q.fillRect(0, 0, r.width, r.height);
      q.globalCompositeOperation = 'source-over';
      const out = mkCanvas(W * dpr, h * dpr), o = out.getContext('2d');
      o.drawImage(r, 0, 0); o.drawImage(c, 0, 0);
      TOWN = {cv: out, h};
    } else TOWN = {cv: c, h};
    LIGHTS = lights;
    buildRiver();
  }
  function buildRiver() {
    const t = tok(), rh = Math.max(4, rBot - rTop), c = mkCanvas(W * dpr, rh * dpr), g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gr = g.createLinearGradient(0, 0, 0, rh);
    gr.addColorStop(0, opt.highContrast ? '#050505' : mix(t.hor, '#2A2466', 0.25)); gr.addColorStop(1, opt.highContrast ? '#000' : mix(t.hor, t.ink, 0.55));
    g.fillStyle = gr; g.fillRect(0, 0, W, rh);
    if (TOWN) { // the mirrored town (true scale, only its foot shows)
      g.save(); g.globalAlpha = 0.8; g.translate(0, 0); g.scale(1, -1); g.drawImage(TOWN.cv, 0, -TOWN.h, W, TOWN.h); g.restore();
    }
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < LIGHTS.length; i += 2) { // vertical glints under every light
      const lx = LIGHTS[i];
      g.fillStyle = rgba('#F6C56B', 0.26);
      g.fillRect(lx - 0.6, 1 + (TOWN ? TOWN.h - LIGHTS[i + 1] : 0) * 0.35, 1.3, rh * 0.5);
    }
    g.globalCompositeOperation = 'source-over';
    if (scene.festival === 4) { // Regatta: boats with lamps
      const R = mkRng(hash(seedStr + '|boats'));
      for (let k = 0; k < 3; k++) {
        const bx = W * (0.2 + k * 0.28 + R() * 0.08), by = rh * (0.55 + R() * 0.2), s = B / 36;
        g.fillStyle = t.ink; g.beginPath(); g.moveTo(bx - 9 * s, by); g.lineTo(bx + 9 * s, by); g.lineTo(bx + 6 * s, by + 3 * s); g.lineTo(bx - 6 * s, by + 3 * s); g.fill();
        g.fillRect(bx - 0.5, by - 9 * s, 1, 9 * s); g.fillStyle = '#FFD58A'; g.fillRect(bx - 1, by - 10 * s, 2, 2);
      }
    }
    RIVER = c;
  }

  /* ---------- the crowd on the embankment (§8.5: figures = min(160, 6 + ⌊14·log2(1 + crowd/4)⌋)) ---------- */
  const MAXF = 160;
  const fX = new Float32Array(MAXF), fCur = new Float32Array(MAXF), fH = new Float32Array(MAXF), fW = new Float32Array(MAXF), fPh = new Float32Array(MAXF),
    fVar = new Float32Array(MAXF), fA = new Float32Array(MAXF), fRow = new Uint8Array(MAXF), fHat = new Uint8Array(MAXF), fSt = new Uint8Array(MAXF);
  let figN = 0, pose = 0.1, poseT = 0.1, excite = 0, deflate = 0;
  const figures = c => Math.min(160, 6 + Math.floor(14 * Math.log2(1 + Math.max(0, c) / 4)));
  function layoutCrowd() {
    const R = mkRng(hash(seedStr + '|crowd')), s = B / 36;
    for (let i = 0; i < MAXF; i++) {
      const row = i < 14 ? (i % 2 ? 1 : 2) : [0, 2, 1][i % 3];
      fRow[i] = row; fX[i] = ((0.07 + i * 0.6180339) % 1) * (W + 8) - 4 + (R() - 0.5) * 5;
      fH[i] = (row === 2 ? 13 : row === 1 ? 11 : 9) * s * (0.88 + R() * 0.24); fW[i] = fH[i] * (0.4 + R() * 0.1);
      fHat[i] = R() < 0.14 ? 1 : R() < 0.1 ? 2 : 0; fPh[i] = R() * TAU; fVar[i] = R() - 0.5;
      if (fSt[i]) fCur[i] = fX[i];
    }
  }
  function setCrowd(c, walk) {
    const n = figures(c);
    for (let i = 0; i < MAXF; i++) {
      if (i < n && !fSt[i]) {
        if (walk && !opt.reducedMotion) { fSt[i] = 1; fCur[i] = fX[i] < W / 2 ? -12 - rng() * 30 : W + 12 + rng() * 30; fA[i] = 1; }
        else { fSt[i] = 2; fCur[i] = fX[i]; fA[i] = walk ? 0 : 1; }
      } else if (i >= n) fSt[i] = 0;
    }
    figN = n;
  }
  function stepCrowd(dt) {
    const s = B / 36;
    for (let i = 0; i < figN; i++) {
      if (fSt[i] === 1) {
        const d = fX[i] - fCur[i], v = Math.max(38 * s, Math.abs(d) * 0.9) * dt;
        if (Math.abs(d) <= v) { fCur[i] = fX[i]; fSt[i] = 2; } else fCur[i] += Math.sign(d) * v;
      }
      if (fA[i] < 1) fA[i] = Math.min(1, fA[i] + dt / 0.4);
    }
    if (opt.reducedMotion) pose = poseT < 0.33 ? 0 : poseT < 0.7 ? 0.5 : 1;   // arms step instead of animating
    else pose += (poseT - pose) * Math.min(1, dt * 9);
    excite = Math.max(0, excite - dt * 0.35);
  }
  const ROWC = ['#0C0F24', '#080A1A', '#05070F'], ARMS = new Float32Array(MAXF * 4);
  function drawCrowd(c) {
    const s = B / 36, hc = opt.highContrast, b0 = H - cB * 0.62, b1 = H - cB * 0.3, b2 = H + 1.5;
    // embankment wall behind the crowd
    c.globalAlpha = 1; c.fillStyle = hc ? '#000' : '#080A18'; c.fillRect(0, rBot, W, H - rBot);
    c.fillStyle = hc ? '#FFF' : '#262A4A'; c.fillRect(0, rBot, W, hc ? 1 : 1.2);
    drawLanterns(c);
    const ex = opt.reducedMotion ? 0 : excite;
    for (let row = 0; row < 3; row++) {
      c.beginPath();
      let na = 0;
      for (let i = 0; i < figN; i++) {
        if (fRow[i] !== row || !fSt[i]) continue;
        const bx = fCur[i], h = fH[i], w = fW[i], walking = fSt[i] === 1;
        let by = (row === 0 ? b0 : row === 1 ? b1 : b2) + deflate * 1.5 * s;
        if (walking) by -= Math.abs(Math.sin(T * 9 + fPh[i])) * 1.2 * s;
        else if (ex > 0.02) by -= Math.max(0, Math.sin(T * 8.5 + fPh[i])) * 1.8 * s * ex;
        const sh = by - h * 0.64, hr = w * 0.44, hy = sh - hr * 1.12 + deflate * 0.8 * s;
        c.moveTo(bx - w / 2, by); c.lineTo(bx - w / 2, sh + w * 0.3); c.quadraticCurveTo(bx - w / 2, sh, bx, sh); c.quadraticCurveTo(bx + w / 2, sh, bx + w / 2, sh + w * 0.3); c.lineTo(bx + w / 2, by); c.closePath();
        c.moveTo(bx + hr, hy); c.arc(bx, hy, hr, 0, TAU);
        if (fHat[i] === 1) { c.moveTo(bx + hr * 0.45, hy - hr * 1.05); c.arc(bx, hy - hr * 1.05, hr * 0.45, 0, TAU); }
        else if (fHat[i] === 2) c.rect(bx - hr * 0.8, hy - hr * 2.1, hr * 1.6, hr * 1.4);
        ARMS[na++] = i; ARMS[na++] = bx; ARMS[na++] = sh + w * 0.18; ARMS[na++] = h;
      }
      c.fillStyle = hc ? '#000' : ROWC[row]; c.fill();
      if (hc) { c.strokeStyle = '#FFF'; c.lineWidth = 1; c.stroke(); }
      // arms: one stroked path per row (pose = mood during the build, the cheer meter during resolution)
      c.beginPath();
      for (let k = 0; k < na; k += 4) {
        const i = ARMS[k], bx = ARMS[k + 1], sy = ARMS[k + 2], L = ARMS[k + 3] * 0.44, w = fW[i];
        const p = clamp(pose + fVar[i] * 0.3 - deflate * 0.5, 0, 1) , wig = ex > 0.02 ? Math.sin(T * 10 + fPh[i]) * 0.3 * ex : 0;
        const aL = lerp(1.83, 4.19, p) + wig, aR = lerp(1.31, -1.05, p) - wig;
        c.moveTo(bx - w * 0.4, sy); c.lineTo(bx - w * 0.4 + Math.cos(aL) * L, sy + Math.sin(aL) * L);
        c.moveTo(bx + w * 0.4, sy); c.lineTo(bx + w * 0.4 + Math.cos(aR) * L, sy + Math.sin(aR) * L);
      }
      c.strokeStyle = hc ? '#FFF' : ROWC[row]; c.lineWidth = Math.max(1, (row === 2 ? 1.7 : 1.4) * s); c.lineCap = 'round'; c.stroke();
      if (hc) { c.strokeStyle = '#000'; c.lineWidth = Math.max(1, (row === 2 ? 1.7 : 1.4) * s) - 1; c.stroke(); }
    }
    c.globalAlpha = 1;
  }
  /* festoon lanterns strung over the embankment (they go out on runLost) */
  const LB = new Float32Array(192);
  let lbN = 0, lampsOff = 0, lampsOffT = 0;
  function layoutLanterns() {
    const s = B / 36, posts = [0.015, 0.34, 0.67, 0.985], y0 = rTop + (rBot - rTop) * 0.22, sag = Math.max(5, (rBot - rTop) * 0.55);
    lbN = 0;
    for (let k = 0; k < 3; k++) {
      const x0 = W * posts[k], x1 = W * posts[k + 1], n = Math.max(4, Math.floor((x1 - x0) / (12 * s)));
      for (let j = 1; j < n; j++) { const u = j / n; if (lbN < 96) { LB[lbN * 2] = lerp(x0, x1, u); LB[lbN * 2 + 1] = y0 + sag * 4 * u * (1 - u); lbN++; } }
    }
  }
  function drawLanterns(c) {
    const s = B / 36, posts = [0.015, 0.34, 0.67, 0.985], y0 = rTop + (rBot - rTop) * 0.22, sag = Math.max(5, (rBot - rTop) * 0.55), f = scene.festival;
    c.strokeStyle = opt.highContrast ? '#FFF' : '#0F1328'; c.lineWidth = 1; c.beginPath();
    for (let k = 0; k < 4; k++) { const x = W * posts[k]; c.moveTo(x, y0 - 3 * s); c.lineTo(x, H); }
    for (let k = 0; k < 3; k++) { const x0 = W * posts[k], x1 = W * posts[k + 1]; c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, y0 + sag * 2, x1, y0); }
    c.stroke();
    if (f === 2) { // May Fair bunting
      c.beginPath();
      for (let i = 0; i < lbN; i += 2) { const x = LB[i * 2], y = LB[i * 2 + 1]; c.moveTo(x - 3 * s, y); c.lineTo(x + 3 * s, y); c.lineTo(x, y + 5 * s); }
      c.fillStyle = 'rgba(200,170,220,0.28)'; c.fill();
    }
    const spr = BIG[7] || null, dotS = HEAD[7];
    if (!dotS) return;
    c.globalCompositeOperation = opt.highContrast ? 'source-over' : 'lighter';
    for (let i = 0; i < lbN; i++) {
      if (i < lampsOff) continue;
      const x = LB[i * 2], y = LB[i * 2 + 1], big = f === 1 && i % 3 === 0;
      const fl = 0.8 + 0.2 * Math.sin(T * 7 + i * 1.7) * Math.sin(T * 2.3 + i);
      if (spr && !opt.highContrast) { c.globalAlpha = 0.16 * fl; const r = (big ? 9 : 6) * s; c.drawImage(spr, x - r, y - r, 2 * r, 2 * r); }
      c.globalAlpha = 0.85 * fl; const r = (big ? 3.4 : 2.2) * s;
      c.drawImage(dotS, x - r, y - r + (big ? 2 * s : 0), 2 * r, 2 * r * (big ? 1.3 : 1));
    }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  }

  /* ---------- trails: a persistence layer at ≤ half the backing resolution (soft by nature; its fade + composite
     is the largest raster cost in render, so it stays small) ---------- */
  let TR = null, trc = null, trS = 1, trIdle = 0, trDirty = false;
  function buildTrail() { trS = Math.min(0.8, dpr * 0.5); TR = mkCanvas(W * trS, H * trS); trc = TR.getContext('2d'); trDirty = false; }
  // Trail dots are batched: one rect path per (colour × 4 alpha levels), ≤ 36 fills a tick instead of one bitmap draw
  // per particle (the per-op raster cost dominated render). Counting sort into preallocated arrays: no allocation.
  const TBK = new Uint8Array(400), TORD = new Int16Array(400), TCNT = new Int16Array(38), TR_A = [0.12, 0.26, 0.47, 0.75];
  function depositTrails() {
    if (!trc) return;
    const P = M, n = P.n;
    let any = false;
    if (!trDirty) { let live = false; for (let i = 0; i < n; i++) if (P.on[i] && P.tr[i] > 0 && P.age[i] >= 0 && !(P.fl[i] & EMB)) { live = true; break; } if (!live) return; }
    trc.globalCompositeOperation = 'destination-out'; trc.globalAlpha = 1; trc.fillStyle = 'rgba(0,0,0,0.13)'; trc.fillRect(0, 0, TR.width, TR.height);
    trc.globalCompositeOperation = 'source-over';
    TCNT.fill(0);
    for (let i = 0; i < n; i++) {
      TBK[i] = 255;
      if (!P.on[i] || P.tr[i] <= 0 || P.age[i] < 0 || (P.fl[i] & (EMB | GLOW))) continue;
      const lf = P.age[i] / P.life[i], a = P.tr[i] * P.al[i] * (lf < 0.6 ? 0.85 : 0.85 * (1 - (lf - 0.6) / 0.4));
      if (a < 0.02) continue;
      const k = (P.fl[i] & RAINBOW) ? (Math.floor(P.age[i] * 5 + P.ph[i]) & 3) : P.ci[i], bk = k * 4 + (a > 0.6 ? 3 : a > 0.35 ? 2 : a > 0.18 ? 1 : 0);
      TBK[i] = bk; TCNT[bk + 1]++;
    }
    for (let k = 1; k < 38; k++) TCNT[k] += TCNT[k - 1];
    for (let i = 0; i < n; i++) if (TBK[i] !== 255) TORD[TCNT[TBK[i]]++] = i;   // TCNT[bk] now = end of bucket bk
    let j = 0;
    for (let bk = 0; bk < 36; bk++) {
      const end = TCNT[bk];
      if (j >= end) continue;
      any = true;
      trc.globalAlpha = TR_A[bk & 3]; trc.fillStyle = COLS[bk >> 2]; trc.beginPath();
      for (; j < end; j++) { const i = TORD[j], r = Math.max(0.6, P.sz[i] * 0.7) * trS; trc.rect(P.x[i] * trS - r, P.y[i] * trS - r, 2 * r, 2 * r); }
      trc.fill();
    }
    trc.globalAlpha = 1;
    if (any) { trIdle = 0; trDirty = true; } else if (trDirty && (trIdle += 1) > 90) { trc.clearRect(0, 0, TR.width, TR.height); trDirty = false; }
  }

  /* ---------- overlay entities: popups, rings, threads, braids, banners ---------- */
  const POPN = 16, POPS = [];
  for (let i = 0; i < POPN; i++) POPS.push({on: false, cv: null, g: null, w: 0, h: 0, x: 0, y: 0, t0: 0, life: 1, kind: '', key: '', n: 1, text: '', tag: '', slam: false, tier: 0, cdpr: 0, die: -1});
  const RINGS = [];
  for (let i = 0; i < 14; i++) RINGS.push({on: false, x: 0, y: 0, r0: 0, r1: 0, t0: 0, dur: 0, col: '#FFF', lw: 2, a: 1, disc: false, line: false});
  const THR = [];
  for (let i = 0; i < 8; i++) THR.push({on: false, x: 0, y: 0, t0: 0, n: 0, pts: new Float32Array(32), col: '#FFF'});
  const BRAIDS = [];
  for (let i = 0; i < 4; i++) BRAIDS.push({on: false, x0: 0, y0: 0, x1: 0, y1: 0, t0: 0});
  const BAN = [];
  for (let i = 0; i < 4; i++) BAN.push({on: false, cv: null, w: 0, h: 0, y: 0, t0: 0, dur: 0.9, cdpr: 0});
  const GLOWS = [];
  for (let i = 0; i < 10; i++) GLOWS.push({on: false, x: 0, y: 0, ci: 0, a: 0, r: 0});
  const WAVES = [];
  for (let i = 0; i < 3; i++) WAVES.push({on: false, x: 0, y: 0, t0: 0});
  const SPARK = [];  // pip sparkles (extend)
  for (let i = 0; i < 16; i++) SPARK.push({on: false, x: 0, y: 0, t0: 0});
  const APULSE = [0, 0, 0];
  const FONT_UI = '"Atkinson Hyperlegible", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  const FONT_D = 'Fraunces, Georgia, "Times New Roman", serif';
  function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function popupArt(p) {
    const t = tok(), hc = opt.highContrast, CW = 340, CH = 64;
    if (!p.cv || p.cdpr !== dpr) { p.cv = mkCanvas(CW * dpr, CH * dpr); p.g = p.cv.getContext('2d'); p.cdpr = dpr; }
    const g = p.g, x = p.kind === 'x';
    let fs = Math.min(40, 16 + 4 * p.tier);
    const main = p.text + (p.n > 1 ? ' ×' + p.n : ''), font = (x ? 'italic 700 ' : '700 ') + '%px ' + (x ? FONT_D : FONT_UI);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, CW, CH);
    g.font = font.replace('%', fs); let tw = g.measureText(main).width;
    const tagF = '700 ' + Math.max(12, Math.round(fs * 0.6)) + 'px ' + FONT_UI;
    g.font = tagF; const gw = p.tag ? g.measureText(p.tag).width + 6 : 0;
    const maxW = CW - 8;
    if (tw + gw + fs * 1.1 > maxW) { fs = Math.max(12, Math.floor(fs * (maxW - gw) / (tw + fs * 1.1))); g.font = font.replace('%', fs); tw = g.measureText(main).width; }
    const ph = Math.round(fs * 1.38), pw = Math.ceil(tw + gw + fs * 0.9);
    p.w = pw + 4; p.h = ph + 4;
    const colTxt = x ? t.aah : p.kind === 'aah' || p.kind === 'coin' ? t.aah : p.kind === 'tag' ? t.dim : p.kind === 'fusion' ? PAL.F : '#FFFFFF';
    g.beginPath(); rr(g, 2, 2, pw, ph, ph / 2);
    g.fillStyle = hc ? '#000' : 'rgba(5,7,15,0.74)'; g.fill();
    if (p.kind === 'ooh' && !hc) { g.fillStyle = 'rgba(255,255,255,0.12)'; g.fill(); }
    g.lineWidth = x || hc ? 2 : 1.2;
    g.strokeStyle = x ? t.x : hc ? '#FFF' : p.kind === 'aah' || p.kind === 'coin' ? rgba(t.aah, 0.55) : p.kind === 'crowd' ? rgba(t.warm, 0.5) : 'rgba(255,255,255,0.3)';
    g.stroke();
    g.textBaseline = 'middle'; g.textAlign = 'left'; g.font = font.replace('%', fs); g.fillStyle = colTxt;
    g.fillText(main, 2 + fs * 0.45, 2 + ph / 2 + (x ? 0 : fs * 0.04));
    if (p.tag) { g.font = tagF; g.fillStyle = t.dim; g.fillText(p.tag, 2 + fs * 0.45 + tw + 6, 2 + ph / 2 + fs * 0.06); }
  }
  function popup(kind, text, x, y, tr, tag, slam) {
    // merge identical consecutive popups (150 ms, 40 px): "+15 Ooh ×3"
    for (const p of POPS) {
      if (p.on && p.die < 0 && p.kind === kind && p.text === text && p.tag === (tag || '') && T - p.t0 < 0.15 && Math.abs(p.x - x) < 40 && Math.abs(p.y - y) < 40) {
        p.y += popDy(p); p.n++; p.t0 = T; popupArt(p);   // restart its life where it stands (no jump back down) p.x = clamp(p.x, p.w / 2 + 2, W - p.w / 2 - 20); clearUnder(p); return p;
      }
    }
    let p = null, act = 0, old = null;
    for (const q of POPS) { if (q.on) { act++; if (!old || q.t0 < old.t0) old = q; } else if (!p) p = q; }
    if (act >= 12 || !p) { if (old) old.on = false; p = p || old; }   // at most 12 on screen
    p.on = true; p.kind = kind; p.text = text; p.tag = tag || ''; p.n = 1; p.tier = tr; p.t0 = T; p.life = 1.05 + 0.08 * tr; p.slam = !!slam; p.die = -1;
    popupArt(p);
    p.x = clamp(x, p.w / 2 + 2, W - p.w / 2 - 20); p.y = clamp(y, p.h / 2 + 2, rTop - p.h / 2);
    placeFree(p);
    return p;
  }
  // A popup's on-screen box now (its rise included).
  const popDy = q => (opt.reducedMotion ? 0 : -18 * easeOut(Math.min(1, Math.max(0, (T - q.t0) / q.life) * 1.4)));
  // Legibility: a new popup never lands on a live popup or banner, nor on the live readout strip at the top of the sky.
  // Candidates are searched nearest-first from its natural place: just above what it hits (both rise at the same rate
  // and the newer never falls behind) or just below (measured from where the other one will end its rise).
  const PC = [];
  function popHit(p, y, pad) {
    for (const q of POPS) {
      if (!q.on || q === p || q.die >= 0) continue;
      const qy = q.y + popDy(q);
      if (Math.abs(p.x - q.x) < (p.w + q.w) / 2 + pad && Math.abs(y - qy) < (p.h + q.h) / 2 + pad) return q;
    }
    for (const b of BAN) if (b.on && Math.abs(p.x - (W / 2 - 6)) < (p.w + b.w) / 2 + pad && Math.abs(y - b.y) < (p.h + b.h) / 2 + pad) return b;
    return null;
  }
  function placeFree(p) {
    const pad = 3, ro = anchor('ooh'), top = Math.max(p.h / 2 + 2, ro.y + 18 + p.h / 2), bot = rTop - p.h / 2 - 2;
    if (bot <= top) return;
    const y0 = clamp(p.y, top, bot);
    PC.length = 0; PC.push(y0);
    for (let it = 0; it < 24 && PC.length; it++) {
      let bi = 0;
      for (let k = 1; k < PC.length; k++) if (Math.abs(PC[k] - y0) < Math.abs(PC[bi] - y0)) bi = k;
      const y = PC[bi]; PC[bi] = PC[PC.length - 1]; PC.length--;
      if (y < top - 0.5 || y > bot + 0.5) continue;
      const q = popHit(p, y, pad);
      if (!q) { p.y = y; return; }
      const d = (q.h + p.h) / 2 + pad, rising = POPS.includes(q);
      PC.push((rising ? q.y + popDy(q) : q.y) - d, q.y + d);
    }
    // No free spot: the newest news wins. Whatever it would cover fades out (220 ms) and it takes its natural place.
    p.y = y0;
    clearUnder(p);
  }
  function clearUnder(p) {
    for (let k = 0, q; k < POPN && (q = popHit(p, p.y, 1)); k++) { if (POPS.includes(q)) q.die = T; else break; }
  }
  // Clear popups out of a box (the Applause) with a quick fade, so L1 keeps the highest contrast.
  function clearPopups(x0, y0, x1, y1) {
    for (const q of POPS) {
      if (!q.on || q.die >= 0) continue;
      const qy = q.y + popDy(q);
      if (q.x + q.w / 2 > x0 && q.x - q.w / 2 < x1 && qy + q.h / 2 > y0 && qy - q.h / 2 < y1) q.die = T;
    }
  }
  function drawPopups(c) {
    const rm = opt.reducedMotion;
    for (let pass = 0; pass < 2; pass++) for (const p of POPS) {
      if (!p.on || (pass === 0) === p.slam) continue;
      const u = (T - p.t0) / p.life;
      if (u >= 1) { p.on = false; continue; }
      if (u < 0) continue;
      let a = u < 0.08 ? u / 0.08 : u > 0.72 ? 1 - (u - 0.72) / 0.28 : 1, sc = 1, dy = 0;
      if (p.die >= 0) { const k = 1 - (T - p.die) / 0.22; if (k <= 0) { p.on = false; continue; } a *= k; }
      if (!rm) {
        const e = (T - p.t0);
        sc = p.slam ? (e < 0.16 ? lerp(2.1, 1, easeBack(e / 0.16)) : 1) : (e < 0.14 ? lerp(0.6, 1, easeBack(e / 0.14)) : 1);
        dy = -18 * easeOut(Math.min(1, u * 1.4));
        if (p.slam) a = Math.min(1, a * 1.5);
      }
      const w = p.w * sc, h = p.h * sc;
      c.globalAlpha = clamp(a, 0, 1);
      c.drawImage(p.cv, 0, 0, p.w * dpr, p.h * dpr, p.x - w / 2, p.y + dy - h / 2, w, h);
    }
    c.globalAlpha = 1;
  }
  function ring(x, y, r0, r1, dur, col, lw, a, kind) {
    let r = RINGS.find(q => !q.on) || RINGS[0];
    r.on = true; r.x = x; r.y = y; r.r0 = r0; r.r1 = r1; r.t0 = T; r.dur = dur; r.col = col; r.lw = lw; r.a = a; r.disc = kind === 'disc'; r.line = kind === 'line';
  }
  function drawRings(c) {
    for (const r of RINGS) {
      if (!r.on) continue;
      const u = (T - r.t0) / r.dur;
      if (u >= 1) { r.on = false; continue; }
      const e = easeOut(u), rad = lerp(r.r0, r.r1, e);
      c.globalAlpha = r.a * (1 - u);
      if (r.disc) { c.fillStyle = r.col; c.beginPath(); c.arc(r.x, r.y, rad, 0, TAU); c.fill(); }
      else if (r.line) { c.fillStyle = r.col; c.fillRect(r.x - rad, r.y - r.lw / 2, rad * 2, r.lw); }
      else { c.strokeStyle = r.col; c.lineWidth = r.lw * (1 - u * 0.7); c.beginPath(); c.arc(r.x, r.y, rad, 0, TAU); c.stroke(); }
    }
    c.globalAlpha = 1;
  }

  /* ---------- flashes (never more than 3 per second; none in reduced motion) ---------- */
  const flashT = [-9, -9, -9];
  let flashI = 0, flashA = 0;
  function canFlash() { return !opt.reducedMotion && T - flashT[flashI] >= 1; }
  function markFlash() { flashT[flashI] = T; flashI = (flashI + 1) % 3; }
  function flash(a) { if (!canFlash()) return false; markFlash(); flashA = Math.max(flashA, a); return true; }

  /* ---------- shake (trauma², world layer only), hit-stop (playback only), zoom punch ---------- */
  let trauma = 0, hitStop = 0, zoomT0 = -9, zoomDur = 0, zoomX = 0, zoomY = 0;
  const addTrauma = tr => { if (!opt.reducedMotion) trauma = Math.min(1, trauma + 0.15 + 0.08 * tr); };
  function addHitStop(ms, x, y) {
    hitStop = Math.max(hitStop, ms / 1000);
    if (!opt.reducedMotion) { zoomT0 = T; zoomDur = Math.max(0.12, ms / 1000 + 0.08); zoomX = x; zoomY = y; }
  }

  /* ---------- live readout mirror: cheer meter, anchors ---------- */
  const live = {ooh: 0, aah: 1, target: 0};
  const meter = {v: 0, goal: 0, pulse: 0, crossed: false, band: -1};
  // Where the DOM readout sits. setScene({anchors}) wins; otherwise FX measures the page once per show: an element
  // with data-fx-anchor="ooh|aah|coins", else UI_PLAY's live readout (.readout .ro-o/.ro-a) and #hud-coins.
  let anchorDom = null, meterDom = null;
  const ANCHOR_SEL = {ooh: ['[data-fx-anchor="ooh"]', '.readout .ro-o b', '.readout .ro-o'], aah: ['[data-fx-anchor="aah"]', '.readout .ro-a b', '.readout .ro-a'], coins: ['[data-fx-anchor="coins"]', '#hud-coins']};
  function domAnchors() {
    if (anchorDom !== null) return anchorDom;
    anchorDom = {};
    if (!hasDoc || !cv || !cv.getBoundingClientRect) return anchorDom;
    try {
      const cr = cv.getBoundingClientRect(), root = cv.parentElement || document;
      for (const k in ANCHOR_SEL) for (const q of ANCHOR_SEL[k]) {
        const el = root.querySelector(q) || document.querySelector(q);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.width || r.height) { anchorDom[k] = {x: r.left + r.width / 2 - cr.left, y: r.top + r.height / 2 - cr.top}; break; }
      }
    } catch (e) { /* ignore */ }
    return anchorDom;
  }
  function anchor(k) {
    const a = (scene.anchors && scene.anchors[k]) || domAnchors()[k];
    if (a) return Array.isArray(a) ? {x: a[0], y: a[1]} : a;
    return k === 'ooh' ? {x: W / 2 - 52, y: 20} : k === 'aah' ? {x: W / 2 + 56, y: 20} : k === 'coins' ? {x: W * 0.74, y: -24} : {x: W / 2, y: 20};
  }
  function setLiveGoal() {
    const tg = live.target || scene.target;
    if (!tg) return;
    const f = clamp(live.ooh * live.aah / (2 * tg), 0, 1);
    meter.goal = f;
    poseT = clamp(0.1 + 0.9 * Math.min(1, f * 2), 0, 1);
    if (!meter.crossed && f >= 0.5) { meter.crossed = true; meter.pulse = 1; excite = Math.max(excite, 0.6); }
  }
  const MOODP = {restless: 0.06, hopeful: 0.5, eager: 0.95};
  function drawMeter(c) {
    const t = tok(), x = W - 13, w = 8, top = Math.max(44, H * 0.14), bot = rTop - 12, h = bot - top;
    if (h < 28 || !opt.drawMeter) return;
    // UI_PLAY draws the cheer meter in the DOM (#sky-overlay .cheer): never draw a second one on top of it.
    if (meterDom === null) meterDom = !!(hasDoc && cv && cv.parentElement && cv.parentElement.querySelector('.cheer, [data-fx-meter]'));
    if (meterDom) return;
    c.globalAlpha = 1; c.beginPath(); rr(c, x - w / 2 - 1.5, top - 1.5, w + 3, h + 3, 5.5);
    c.fillStyle = opt.highContrast ? '#000' : 'rgba(5,7,15,0.6)'; c.fill();
    c.strokeStyle = opt.highContrast ? '#FFF' : t.line; c.lineWidth = opt.highContrast ? 2 : 1; c.stroke();
    if (!P0 && scene.mood && MOODP[scene.mood] != null) { // the mood band (build): Restless < 0.85, Hopeful < 1.25, Eager ≥ 1.25 (target at 50%)
      const b = scene.mood === 'restless' ? [0, 0.425] : scene.mood === 'hopeful' ? [0.425, 0.625] : [0.625, 1];
      c.fillStyle = rgba(t.paper, opt.highContrast ? 0.5 : 0.22); c.fillRect(x - w / 2, bot - h * b[1], w, h * (b[1] - b[0]));
    }
    const f = meter.v;
    if (f > 0.002) {
      if (!METERG || METERG.top !== top || METERG.bot !== bot) { const gr = c.createLinearGradient(0, bot, 0, top); gr.addColorStop(0, '#B8871E'); gr.addColorStop(0.5, t.aah); gr.addColorStop(1, '#FFF1C2'); METERG = {g: gr, top, bot}; }
      c.beginPath(); rr(c, x - w / 2, bot - h * f, w, h * f, 4); c.fillStyle = opt.highContrast ? t.aah : METERG.g; c.fill();
    }
    const ty = bot - h * 0.5, pl = meter.pulse;
    c.fillStyle = f >= 0.5 ? t.ok : t.paper;
    c.fillRect(x - w / 2 - 4 - pl * 3, ty - 1 - pl, w + 8 + pl * 6, 2 + pl * 2);
    c.beginPath(); c.moveTo(x - w / 2 - 5, ty - 4); c.lineTo(x - w / 2 - 1, ty); c.lineTo(x - w / 2 - 5, ty + 4); c.fill();
    c.fillStyle = f >= 0.999 ? t.aah : rgba(t.paper, 0.6); c.beginPath(); c.arc(x, top - 6, 2, 0, TAU); c.fill();
  }

  /* ---------- the Applause roll-up and slam ---------- */
  const AP = {on: false, t0: 0, slamT: 0, score: 0, target: 0, pass: false, encore: false, fade: -1, slammed: false, ooh: 0, aah: 0};
  function drawApplause(c) {
    if (!AP.on || !opt.drawApplause) return;
    const t = tok(), e = T - AP.t0;
    if (e < 0) return;
    let a = Math.min(1, e / 0.15);
    if (AP.fade >= 0) { a *= 1 - (T - AP.fade) / 0.3; if (a <= 0) { AP.on = false; return; } }
    const tr = tier(AP.score), fs = Math.min(W * 0.155, 36 + 7 * tr), cx = W / 2 - 6, cy = clamp(rTop * 0.4, 70, rTop - fs);
    let v, sc = 1;
    if (!AP.slammed) { const k = Math.max(0, e - 0.2); v = AP.score * (1 - Math.exp(-k * 11.5)); sc = 0.82; }
    else { v = AP.score; const d = T - AP.slamT; sc = opt.reducedMotion ? 1 : d < 0.2 ? lerp(1.45, 1, easeBack(d / 0.2)) : 1; }
    const str = fmt(v);
    c.globalAlpha = a * 0.62; c.drawImage(HALO, cx - fs * 2.6, cy - fs * 1.35, fs * 5.2, fs * 2.7);
    c.globalAlpha = a; c.save(); c.translate(cx, cy); c.scale(sc, sc);
    c.font = 'italic 700 ' + Math.round(fs) + 'px ' + FONT_D; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = Math.max(3, fs * 0.12); c.strokeStyle = opt.highContrast ? '#000' : t.ink; c.strokeText(str, 0, 0);
    c.fillStyle = t.paper; c.fillText(str, 0, 0);
    if (opt.highContrast) { c.lineWidth = 2; c.strokeStyle = '#FFF'; }
    c.restore();
    if (AP.slammed) {
      const d = T - AP.slamT, b = Math.min(1, d / 0.14);
      const tg = AP.target || 1, ratio = AP.score / tg;
      const sub = AP.pass ? 'Pass ×' + (ratio < 100 ? (Math.floor(ratio * 10) / 10).toFixed(1) : fmt(Math.floor(ratio))) : fmt(Math.ceil(tg - AP.score)) + ' short';
      c.font = '700 ' + 18 + 'px ' + FONT_UI; const w = c.measureText(sub).width + 22;
      c.globalAlpha = a * b; c.beginPath(); rr(c, cx - w / 2, cy + fs * 0.62, w, 30, 15);
      c.fillStyle = opt.highContrast ? '#000' : 'rgba(5,7,15,0.8)'; c.fill();
      c.lineWidth = 2; c.strokeStyle = AP.pass ? t.ok : t.danger; c.stroke();
      c.fillStyle = AP.pass ? t.ok : t.danger; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sub, cx, cy + fs * 0.62 + 15.5);
    }
    c.globalAlpha = 1; c.textAlign = 'left';
  }
  function banner(text, kind, dur, y) {
    const t = tok(), b = BAN.find(q => !q.on) || BAN[0], fs = kind === 'encore' ? 30 : 22, CW = Math.min(W, 420), CH = 58;
    if (!b.cv || b.cdpr !== dpr) { b.cv = mkCanvas(CW * dpr, CH * dpr); b.g = b.cv.getContext('2d'); b.cdpr = dpr; b.cw = CW; }
    const g = b.g; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, b.cv.width, b.cv.height);
    g.font = 'italic 700 ' + fs + 'px ' + FONT_D; let tw = g.measureText(text).width;
    const maxW = b.cv.width / dpr - 40, f2 = tw > maxW ? Math.floor(fs * maxW / tw) : fs;
    g.font = 'italic 700 ' + f2 + 'px ' + FONT_D; tw = g.measureText(text).width;
    const col = kind === 'fusion' ? (opt.highContrast ? PAL_HC.F : PAL.F) : kind === 'encore' ? t.aah : t.paper, w = tw + 44, h = f2 * 1.55 + 6, x0 = 2, y0 = 2;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w, y0); g.lineTo(x0 + w - 10, y0 + h / 2); g.lineTo(x0 + w, y0 + h); g.lineTo(x0, y0 + h); g.lineTo(x0 + 10, y0 + h / 2); g.closePath();
    g.fillStyle = opt.highContrast ? '#000' : 'rgba(5,7,15,0.84)'; g.fill(); g.lineWidth = 2; g.strokeStyle = col; g.stroke();
    g.fillStyle = kind === 'fusion' ? t.paper : col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x0 + w / 2, y0 + h / 2 + 1);
    if (kind === 'fusion') { g.fillStyle = col; g.font = '700 ' + Math.round(f2 * 0.8) + 'px ' + FONT_UI; g.fillText('✦', x0 + 17, y0 + h / 2 + 1); g.fillText('✦', x0 + w - 17, y0 + h / 2 + 1); }
    b.on = true; b.w = w + 4; b.h = h + 4; b.t0 = T; b.dur = dur; b.y = y; b.kind = kind;
    return b;
  }
  function drawBanners(c) {
    for (const b of BAN) {
      if (!b.on) continue;
      const u = (T - b.t0) / b.dur;
      if (u >= 1) { b.on = false; continue; }
      const a = u < 0.12 ? u / 0.12 : u > 0.8 ? 1 - (u - 0.8) / 0.2 : 1, sc = opt.reducedMotion ? 1 : u < 0.12 ? lerp(0.85, 1, easeBack(u / 0.12)) : 1;
      c.globalAlpha = a;
      const w = b.w * sc, h = b.h * sc;
      c.drawImage(b.cv, 0, 0, b.w * dpr, b.h * dpr, W / 2 - 6 - w / 2, b.y - h / 2, w, h);
    }
    c.globalAlpha = 1;
  }

  /* ---------- state flags ---------- */
  let dimA = 0, dimOn = false, dimT0 = 0, crit = {on: false, pulse: false}, haze = 0, showHaze = 0, finaleT = -9;
  let P0 = null; // the current playback

  /* ============================================================
     THE CHAIN: scheduling and presentation (§9 pacing)
  ============================================================ */
  const SUBS = {gainOoh: 1, gainAah: 1, multAah: 1, fusion: 1, clear: 1, extend: 1, repeat: 1, crowdGain: 1, coinGain: 1, skyAge: 1};
  const iv = (k, sp) => (opt.reducedMotion ? 300 : Math.max(110, 420 * Math.pow(0.86, k))) / sp;
  function schedule(p) {
    const evs = p.evs, n = evs.length, sp = p.sp;
    let cur = 0, k = 0, lastB = -1, pend = -1, sub = 0, lastBurstIdx = -1;
    for (let i = 0; i < n; i++) {
      const e = evs[i] || {}, ty = e.type;
      if (ty === 'burst') {
        let tt = 0;
        for (let j = i + 1; j < n && evs[j] && evs[j].type !== 'burst' && evs[j].type !== 'launch'; j++) {
          const q = evs[j];
          if (q.type === 'gainOoh' || q.type === 'gainAah') tt = Math.max(tt, tier(q.v));
          else if (q.type === 'multAah') tt = Math.max(tt, xTier(q.factor));
          else if (q.type === 'clear') tt = Math.max(tt, clamp((q.n | 0) >> 1, 0, 6));
        }
        p.tier[i] = tt;
      }
    }
    for (let i = 0; i < n; i++) {
      const e = evs[i] || {}, ty = e.type;
      if (ty === 'fuseLit') { p.at[i] = cur; cur += 280 / sp; continue; }
      if (ty === 'launch' || ty === 'burst') {
        const gap = iv(k, sp);
        if (pend < 0) pend = lastB < 0 ? cur + (ty === 'launch' && !opt.reducedMotion ? Math.min(260, gap * 0.8) : 0) : Math.max(cur, lastB + gap);
        if (ty === 'launch') { p.at[i] = Math.max(cur, lastB, pend - Math.min(260 / sp, gap * 0.8)); cur = p.at[i]; }
        else { p.at[i] = pend; lastB = cur = pend; pend = -1; k++; sub = 0; lastBurstIdx = i; }
        continue;
      }
      if (SUBS[ty] && lastB >= 0 && pend < 0 && !p.ended) { sub++; p.at[i] = lastB + sub * Math.min(60 / sp, iv(k, sp) * 0.16); cur = Math.max(cur, p.at[i]); continue; }
      if (SUBS[ty] && pend >= 0) { p.at[i] = pend; continue; }      // a fusion emitted before its burst
      if (ty === 'crowdCheer') { p.ended = true; p.at[i] = Math.max(cur, (lastB < 0 ? cur : lastB + iv(k, sp))); cur = p.at[i] + 450 / sp; continue; }
      if (ty === 'applause') {
        p.ended = true; p.at[i] = cur + 120 / sp; p.apIdx = i;
        p.slamAt = p.at[i] + (opt.reducedMotion ? 200 : 560) / sp; cur = p.slamAt; continue;
      }
      if (ty === 'runLost' || ty === 'runWon') { p.at[i] = cur + 150 / sp; cur = p.at[i]; continue; }
      p.at[i] = cur + (p.ended ? 90 / sp : 0); if (p.ended) cur = p.at[i];
    }
    p.lastBurstIdx = lastBurstIdx;
    p.doneAt = Math.max(cur + 150 / sp, p.slamAt >= 0 ? p.slamAt + 620 / sp : 0);
  }
  let playId = 0;
  function play(events, o) {
    o = o || {};
    if (P0) finish(P0, true);
    const evs = Array.isArray(events) ? events.slice() : [];
    const sp = clamp(o.speed || opt.speed || 1, 0.25, 4), n = evs.length;
    const p = {id: ++playId, evs, n, sp, o, i: 0, t: 0, rate: 1, at: new Float64Array(n), tier: new Uint8Array(n), slamAt: -1, apIdx: -1, doneAt: 0, ended: false,
      slammed: false, finished: false, cur: null, prev: null, aged: true, stack: 0, echo: false, k: 0, shots: {}, pendFusion: null, next: null, resolve: null, apEv: null};
    p.done = new Promise(r => { p.resolve = r; });
    beginShow();
    schedule(p);
    const handle = {
      done: p.done,
      fastForward() { if (!p.finished) p.rate = 4; },
      skip() { if (!p.finished) skipToSlam(p); }
    };
    if (o.instant || opt.instant || opt.test || !ready) { presentAll(p); return handle; }
    P0 = p;
    return handle;
  }
  function beginShow() {
    for (const b of BUR) if (b.on && b.linger) expire(b, false);
    live.ooh = 0; live.aah = 1; live.target = scene.target || 0;
    meter.goal = 0; meter.crossed = false; meter.pulse = 0;
    AP.on = false; showHaze = 0; deflate = 0; hitStop = 0; anchorDom = null; meterDom = null;
    rng = mkRng(hash(seedStr + '|fx|' + scene.show));
  }
  function present(p, i, silent) {
    const e = p.evs[i];
    if (!e) return;
    const h = HANDLERS[e.type];
    if (h) { try { h(e, p, silent, i); } catch (err) { if (typeof console !== 'undefined') console.error('[fx]', e.type, err); } }
    if (e.type === 'applause') return;            // presented at the slam
    callOut(p, 'onPresent', e);
  }
  function callOut(p, k, e) { const f = p.o && p.o[k]; if (typeof f === 'function') { try { f(e); } catch (err) { if (typeof console !== 'undefined') console.error('[fx] ' + k, err); } } }
  function slam(p, silent) {
    if (p.slammed) return;
    p.slammed = true;
    const e = p.apEv;
    if (e) {
      AP.slammed = true; AP.slamT = T;
      if (!silent && opt.drawApplause) {
        const fs = Math.min(W * 0.155, 36 + 7 * tier(AP.score)), cy = clamp(rTop * 0.4, 70, rTop - fs);
        if (!opt.reducedMotion) { ring(W / 2 - 6, cy, fs * 0.5, fs * 2.4, 0.5, AP.pass ? tok().aah : tok().danger, 3, 0.9); }
        if (AP.encore) banner('Encore!', 'encore', Math.max(0.7, (p.doneAt - p.slamAt) / 1000 / p.rate + 0.3), Math.min(rTop - 18, cy + fs * 0.62 + 56));
      }
      AP.fade = -1;
      const tg = AP.target || scene.target || 1, ratio = AP.score / tg;
      if (AP.pass) { poseT = Math.min(1, ratio); excite = Math.max(excite, AP.encore ? 1 : 0.7); deflate = 0; }
      else { poseT = 0; excite = 0; deflate = 1; }
      meter.goal = clamp(ratio / 2, 0, 1);
      callOut(p, 'onPresent', e);
      callOut(p, 'onSlam', e);
    }
  }
  function presentAll(p) {
    for (; p.i < p.n; p.i++) present(p, p.i, true);
    endBeat(p);
    slam(p, true);
    meter.v = meter.goal;
    finish(p, false);
  }
  function skipToSlam(p) {
    hitStop = 0;
    while (p.i < p.n && p.i !== p.apIdx) { present(p, p.i, true); p.i++; }
    if (p.apIdx >= 0 && p.i === p.apIdx) {
      endBeat(p);
      present(p, p.i, false); p.i++;
      AP.t0 = T - 0.6;
      p.t = p.slamAt; slam(p, false);
    } else { presentAll(p); return; }
    meter.v = meter.goal;
  }
  function finish(p, abort) {
    if (p.finished) return;
    if (abort) { for (; p.i < p.n; p.i++) present(p, p.i, true); endBeat(p); slam(p, true); }
    p.finished = true;
    if (P0 === p) P0 = null;
    if (AP.on && AP.fade < 0) AP.fade = abort ? T : T + 0.05;
    callOut(p, 'onDone');
    p.resolve();
  }
  function tickPlay(dt) {
    const p = P0;
    if (!p) return;
    if (hitStop > 0) { hitStop -= dt; if (hitStop > 0) return; dt = -hitStop; hitStop = 0; }
    p.t += dt * 1000 * p.rate;
    while (p.i < p.n && p.at[p.i] <= p.t) {
      present(p, p.i, false); p.i++;
      if (hitStop > 0) break;
    }
    if (p.slamAt >= 0 && !p.slammed && p.t >= p.slamAt && p.i > p.apIdx) slam(p, false);
    if (p.i >= p.n && p.t >= p.doneAt) finish(p, false);
  }

  /* ---------- event handlers ---------- */
  function tubeX(t) {
    const tb = scene.tubes;
    if (tb && tb[t] && typeof tb[t].x === 'number') return tb[t].x;
    const n = Math.max(4, tb ? tb.length : 0, (t | 0) + 1);
    return W * ((t | 0) + 0.5) / n;
  }
  const ALT = [0.44, 0.27, 0.52, 0.34, 0.6, 0.3, 0.48, 0.38];
  function placeBurst(p, tube, id, n) {
    const sh = shellOf(id), shot = (p.shots[tube] = (p.shots[tube] || 0) + 1);
    let x = tubeX(tube) + (rng() - 0.5) * 10 * S, y;
    const U = rTop;
    if (sh[0] === 'triple') y = U * (0.66 - 0.1 * ((shot - 1) % 3));
    else if (sh[0] === 'fan') y = H - 120 * S;
    else if (sh[0] === 'curtain') y = U * 0.3;
    else y = U * (0.2 + 0.6 * ALT[((n | 0) * 3 + tube * 5 + (shot > 1 ? 3 : 0)) % 8]);
    x = clamp(x, 10, W - 24);
    return {x, y: Math.max(y, 34 + 40 * S)};
  }
  function endBeat(p) {
    if (!p.cur || p.aged) return;
    ageSky(p);
  }
  function ageSky(p) {
    p.aged = true;
    for (const b of BUR) {
      if (!b.on || !b.linger || b === p.cur) continue;
      b.hang -= 1;
      if (b.hang <= 0) expire(b, false);
    }
  }
  function shellId(e) { const s = e.shell; return typeof s === 'string' ? s : s && s.id ? s.id : e.shellId || e.id || 'peony'; }
  function colOf(e, id) {
    let c = e.col || (e.shell && e.shell.col);
    if (!c || c === '*') { const r = shellOf(id)[3]; c = r === '*' ? 'W' : r; }
    return c;
  }
  const byN = (p, n) => { if (n == null) return null; for (const b of BUR) if (b.on && b.pid === p.id && b.n === n) return b; return null; };
  const HANDLERS = {
    fuseLit(e, p) {
      if (e && typeof e.target === 'number') live.target = e.target;
      if (e && Array.isArray(e.rules)) scene.rules = e.rules.slice();
      setLiveGoal();
    },
    launch(e, p, silent) {
      endBeat(p);
      const tube = e.tube | 0;
      let j = p.i + 1, nb = null;
      for (; j < p.n; j++) { const q = p.evs[j]; if (q && q.type === 'burst') { nb = q; break; } if (q && q.type === 'launch') break; }
      const id = nb ? shellId(nb) : 'peony';
      const pos = placeBurst(p, tube, id, typeof e.n === 'number' ? e.n : p.k);
      p.next = {pos, tube};
      p.beatHasBurst = false;
      if (silent || opt.reducedMotion || shellOf(id)[0] === 'fan') return;
      const dur = Math.max(0.08, (nb ? p.at[j] - p.at[p.i] : 200) / 1000 / p.rate);
      const streak = shellOf(id)[0] === 'streak', cid = streak ? (CI[colOf(nb || {}, id)] != null ? CI[colOf(nb || {}, id)] : 4) : 7;
      const k = spawn(M, pos.x + (rng() - 0.5) * 4, H + 4, 0, -(H + 4 - pos.y) / dur, 0, 1, dur, 0.9, 0, streak ? 2.2 : 1.3, 0.95, cid, FG, 0, -1, 0);
      if (k >= 0) M.vx[k] = (pos.x - M.x[k]) / dur;
    },
    burst(e, p, silent, idx) {
      endBeat(p);
      const tube = e.tube | 0, id = shellId(e), sh = shellOf(id), washed = !!e.washed;
      const col = colOf(e, id), rain = col === 'X';
      const n = typeof e.n === 'number' ? e.n : p.k;
      const pos = p.next && p.next.tube === tube ? p.next.pos : placeBurst(p, tube, id, n);
      p.next = null;
      const vis = lingering();
      const b = newBurst();
      b.n = n; b.pid = p.id; b.x = pos.x; b.y = pos.y; b.id0 = id; b.pat = sh[0]; b.v = sh[1]; b.tube = tube; b.uid = e.uid != null ? e.uid : null;
      b.born = T + p.k * 1e-4; b.rain = rain && !washed; b.col = col;
      b.ci = washed ? CI.S : rain ? 4 : CI[col] != null ? CI[col] : 4;
      b.R = (sh[0] === 'fan' ? 70 : sh[0] === 'spiral' ? 45 : sh[0] === 'salvo' ? 55 : 95) * S;
      const tb = scene.tubes[tube], hg = typeof e.hang === 'number' ? e.hang : sh[4] + (tb && tb.rig === 'tall' ? 1 : 0) - (scene.rules.includes('drizzle') ? 1 : 0);
      b.hang = hg; b.shown = hg; b.linger = hg > 0;
      if (!b.linger) b.exp = T;
      curBid = b.id;
      p.prev = p.cur; p.cur = b; p.aged = false; p.stack = 0; p.echo = false; p.k++; p.beatHasBurst = true;
      showHaze = Math.min(0.5, showHaze + 0.018);
      if (silent) { if (b.linger) spawnEmbers(b, true); }
      else {
        let read;
        if (Array.isArray(e.up)) { read = []; for (const k of e.up) { const q = byN(p, k); if (q && q !== b) read.push(q); } }
        else { const sees = typeof e.sees === 'number' ? e.sees : vis.length; read = vis.slice(Math.max(0, vis.length - sees)); }
        burstVisual(b, e, p.tier[idx] || 0, p);
        if (read.length) threads(b, read);
        if (e.dud) popup('tag', 'dud', b.x, b.y - 18 * S, 0);
        if (e.half) popup('tag', '½ strength', b.x + 20 * S, b.y - 30 * S, 0);
        if (washed) popup('tag', 'washed out', b.x, b.y + 24 * S, 0);
      }
      if (p.pendFusion) { const f = p.pendFusion; p.pendFusion = null; HANDLERS.fusion(f, p, silent); }
    },
    gainOoh(e, p, silent) {
      live.ooh += +e.v || 0; if (typeof e.ooh === 'number') live.ooh = e.ooh; setLiveGoal();
      if (!silent) gainPop(p, 'ooh', '+' + fmt(+e.v || 0) + ' Ooh', tier(e.v), e.tube, e.critic ? 'critic' : e.fusion ? '✦' : '');
    },
    gainAah(e, p, silent) {
      live.aah += +e.v || 0; if (typeof e.aah === 'number') live.aah = e.aah; setLiveGoal();
      if (!silent) gainPop(p, 'aah', '+' + fmtA(+e.v || 0) + ' Aah', tier(e.v), e.tube, e.capped ? 'cap 30' : e.rig === 'brass' ? 'brass' : e.fusion ? '✦' : '');
    },
    multAah(e, p, silent) {
      const f = +e.factor || 1;
      live.aah *= f; if (typeof e.aah === 'number') live.aah = e.aah; setLiveGoal();
      if (silent) return;
      const tr = xTier(f), b = p.cur, x = b ? b.x : W / 2, y = b ? b.y - Math.min(b.R * 0.45, 44) : rTop * 0.4;
      popup('x', '×' + fmtX(f), x, y - p.stack * 22, Math.max(2, tr), p.echo ? 'echo' : '', true);
      p.stack++;
      if (!opt.reducedMotion) { ring(x, y, 8, 60 + 16 * tr, 0.42, tok().x, 3.5, 0.95); ring(x, y, 4, 34 + 10 * tr, 0.3, tok().aah, 2, 0.8); }
      addTrauma(tr);
      addHitStop(Math.min(120, 40 + 20 * tr), x, y);
      excite = Math.max(excite, 0.35 + 0.1 * tr);
      APULSE[1] = 1;
    },
    fusion(e, p, silent) {
      if (!p.beatHasBurst && p.next) { p.pendFusion = e; return; }   // a fusion emitted before its burst
      if (silent) return;
      const a = p.prev, b = p.cur;
      if (a && b) { const br = BRAIDS.find(q => !q.on) || BRAIDS[0]; br.on = true; br.x0 = a.x; br.y0 = a.y; br.x1 = b.x; br.y1 = b.y; br.t0 = T; }
      const nm = e.name || (e.key ? String(e.key).replace('>', ' → ') : 'Fusion');
      banner(nm + (e.first ? ' · new!' : ''), 'fusion', 0.9, clamp(rTop * 0.2, 34, 90));
      addHitStop(100, b ? b.x : W / 2, b ? b.y : rTop * 0.4);
    },
    clear(e, p, silent) {
      const cleared = [];
      for (const b of BUR) if (b.on && b.linger && b !== p.cur) cleared.push(b);
      for (const b of cleared) expire(b, !silent);
      if (silent) return;
      const b = p.cur, x = b ? b.x : W / 2, y = b ? b.y : rTop * 0.4;
      if (!opt.reducedMotion) { const w = WAVES.find(q => !q.on) || WAVES[0]; w.on = true; w.x = x; w.y = y; w.t0 = T; }
      addTrauma(clamp((e.n | 0) >> 1, 0, 6));
    },
    extend(e, p, silent) {
      const by = e.by != null ? +e.by : 1;
      let list = null;
      if (Array.isArray(e.ids)) { list = []; for (const k of e.ids) { const q = byN(p, k); if (q) list.push(q); } }
      else { list = []; for (const b of BUR) if (b.on && b.linger && b !== p.cur) list.push(b); }
      for (const b of list) {
        if (!b.linger) continue;
        b.hang += by;
        if (!silent) { b.spark = T; const sp = SPARK.find(q => !q.on) || SPARK[0]; sp.on = true; sp.x = b.x + (Math.ceil(b.hang) - 1) * 4.5; sp.y = b.y + pipOff(b); sp.t0 = T; }
      }
    },
    repeat(e, p, silent) {
      p.echo = true;
      if (silent || opt.reducedMotion) return;
      let v = byN(p, typeof e.from === 'number' ? e.from : null);
      if (!v && e.from != null) for (const b of BUR) if (b.on && b.pid === p.id && b !== p.cur && (b.uid === e.from || b.id0 === (e.shell || e.from))) v = b;
      if (!v) v = p.prev;
      if (v) ghost(v, 0.08);
    },
    crowdGain(e, p, silent) {
      const v = +e.v || 0;
      scene.crowd = typeof e.crowd === 'number' ? e.crowd : scene.crowd + v;
      setCrowd(scene.crowd, !silent);
      if (!silent && v && p) popup('crowd', 'Crowd +' + fmt(v), p.cur ? clamp(p.cur.x, 50, W - 60) : W / 2, rBot - 16, 0);
      excite = Math.max(excite, 0.3);
    },
    coinGain(e, p, silent) {
      if (silent) return;
      const b = p.cur, x = b ? b.x : W / 2, y = b ? b.y : rTop * 0.4, A = anchor('coins');
      popup('coin', '+$' + fmt(+e.v || 0), x + 34 * S, y - 12 - p.stack * 18, 0, e.rig === 'lucky' ? 'lucky' : '');
      if (!opt.reducedMotion) for (let k = 0; k < 6; k++) {
        const i = spawn(M, x, y, (rng() - 0.5) * 140, -40 - rng() * 90, 0, 1, 1.4, 0.5, 0.3, 1.5, 1, 7, HOME, 0, -1, k * 0.03);
        if (i >= 0) { M.cx[i] = A.x; M.cy[i] = A.y; M.ph[i] = 2; }
      }
    },
    skyAge(e, p) {
      if (!p.aged) ageSky(p);
      if (!Array.isArray(e.expired)) return;
      for (const it of e.expired) {
        const k = it && typeof it === 'object' ? (it.n != null ? it.n : it.uid) : it;
        const b = byN(p, k);
        if (b && b.linger && b !== p.cur) expire(b, false);
      }
    },
    crowdCheer(e, p, silent) {
      endBeat(p);
      const v = +e.v || 0;
      live.ooh += v; if (typeof e.ooh === 'number') live.ooh = e.ooh; if (typeof e.aah === 'number') live.aah = e.aah; setLiveGoal();
      if (silent || !v) return;
      popup('crowd', 'Crowd +' + fmt(v) + ' Ooh', W / 2, rBot - 26, tier(v), e.half ? '½ ferry' : '');
      excite = Math.max(excite, 0.5);
      if (opt.reducedMotion) { APULSE[0] = 1; return; }
      const A = anchor('ooh'), n = Math.min(40, 8 + figN / 3) | 0;
      for (let k = 0; k < n && M.count < 330; k++) {
        const fi = figN ? (rng() * figN) | 0 : 0, x = figN ? fCur[fi] : W * rng();
        const i = spawn(M, x, H - 14, (rng() - 0.5) * 60, -120 - rng() * 100, 0, 1, 1.6, 0.7, 0.2, 1.3, 0.9, 7, HOME, 0, -1, k * 0.012);
        if (i >= 0) { M.cx[i] = A.x; M.cy[i] = A.y; M.ph[i] = 0; }
      }
    },
    applause(e, p, silent) {
      endBeat(p);
      p.apEv = e;
      AP.ooh = typeof e.ooh === 'number' ? e.ooh : live.ooh; AP.aah = typeof e.aah === 'number' ? e.aah : live.aah;
      AP.score = typeof e.score === 'number' ? e.score : Math.floor(AP.ooh * AP.aah);
      AP.target = +e.target || live.target || scene.target || 0;
      AP.pass = e.pass != null ? !!e.pass : AP.score >= AP.target;
      AP.encore = !!e.encore;
      live.target = AP.target; live.ooh = AP.ooh; live.aah = AP.aah;
      AP.on = !silent; AP.t0 = T; AP.slammed = false; AP.fade = -1; AP.hold = 0;
      if (!silent && opt.drawApplause) { // the roll-up gets a clear stage
        const fs = Math.min(W * 0.155, 36 + 7 * tier(AP.score)), cx = W / 2 - 6, cy = clamp(rTop * 0.4, 70, rTop - fs);
        clearPopups(cx - fs * 2.6, cy - fs * 0.9, cx + fs * 2.6, cy + fs * 0.62 + (AP.encore ? 100 : 40));
      }
      if (!silent && !opt.reducedMotion) { // the × spark between the OOH and AAH chips as they slide together
        const a = anchor('ooh'), b = anchor('aah'), x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
        for (let k = 0; k < 14; k++) { const th = k * TAU / 14; spawn(M, x, y, Math.cos(th) * 90, Math.sin(th) * 90, 20, 0.93, 0.5, 0.3, 0.3, 1.4, 1, 7, 0, 0, -1, 0); }
        APULSE[0] = APULSE[1] = 1;
      }
    },
    payout(e, p, silent) { if (e && typeof e.crowd === 'number' && e.crowd > scene.crowd) { scene.crowd = e.crowd; setCrowd(e.crowd, !silent); } },
    rainCheck() { critical(true); },
    critical(e) { critical(e && e.on === false ? false : e && e.lastChance ? {on: true, pulse: true} : true); },
    relight(e, p, silent) { clearSky(0.6); if (!silent) banner('The crowd stays for one more!', 'relight', 1.8, clamp(rTop * 0.25, 40, 110)); },
    milestone() {},
    runLost() { dim(true); },
    runWon() { finale(); },
    buildOpen(e, p) { // inside a chain it only records the next build; out of chain it resets the sky
      if (e && typeof e.target === 'number') scene.target = e.target;
      if (e && e.mood) moodNext = e.mood;
      if (p && p.id) return;
      if (AP.on && AP.fade < 0) AP.fade = T;
      clearSky(1.2); meter.goal = 0; deflate = 0; applyMood();
    },
    moodChanged(e, p) {
      const m = e && (e.bucket || e.mood);
      if (!m || e.preview) return;
      moodNext = m;
      if (!(p && p.id)) applyMood();
    }
  };
  let moodNext = null;
  function applyMood() { if (moodNext) { scene.mood = moodNext; if (MOODP[moodNext] != null) poseT = MOODP[moodNext]; moodNext = null; } }
  function gainPop(p, kind, text, tr, tube, tag) {
    let b = p.cur;
    if (tube != null && b && b.tube !== tube) { for (const q of BUR) if (q.on && q.tube === tube && q.born > (b ? b.born - 5 : 0)) b = q; }
    const x = b ? b.x : W / 2, y = (b ? b.y - Math.min(b.R * 0.35, 36) : rTop * 0.4) - p.stack * (20 + 4 * tr);
    p.stack++;
    popup(kind, text, x, y, tr, p.echo ? (tag ? 'echo ' + tag : 'echo') : tag);
  }
  function pipOff(b) { return Math.max(10, Math.min(b.R * 0.32, 26)); }
  function threads(b, read) {
    const th = THR.find(q => !q.on) || THR[0];
    th.on = true; th.x = b.x; th.y = b.y; th.t0 = T; th.col = COLS[b.ci]; th.n = Math.min(16, read.length);
    for (let k = 0; k < th.n; k++) { th.pts[k * 2] = read[read.length - th.n + k].x; th.pts[k * 2 + 1] = read[read.length - th.n + k].y; }
  }
  function burstVisual(b, e, tr, p) {
    const rm = opt.reducedMotion;
    // sky glow (L3)
    const gl = GLOWS.find(q => !q.on) || GLOWS.reduce((a, q) => (q.a < a.a ? q : a), GLOWS[0]);
    gl.on = true; gl.x = b.x; gl.y = b.y; gl.ci = b.ci; gl.a = 1; gl.r = b.R * 2.4;
    if (rm) { // radial-gradient glow that fades over 400 ms (§9 reduced motion)
      spawn(M, b.x, b.y, 0, 0, 0, 1, 0.4, 0, 0, b.R * 0.75, 0.95, b.ci, GLOW, 2, b.id, 0);
      if (b.linger) spawnEmbers(b, true);
      return;
    }
    EC.P = M; EC.cx = b.x; EC.cy = b.y; EC.gy = H + 2; EC.S = S; EC.m = 0.6 + 0.2 * tr; EC.ci = b.ci; EC.fl = b.rain ? RAINBOW : 0; EC.al = 1; EC.d = 0; EC.pr = 2; EC.bid = b.id; EC.R = rng;
    EC.side = b.x < W / 2 ? 1 : -1;
    if (e.dud) { // a grey puff; it still hangs
      EC.ci = CI.K; EC.row = [14, 55, 10, .96, 1.1, 0, 0]; ball(b.x, b.y, 14, 55 * S, 0, 0, 1.6, 0);
      EC.ci = b.ci; EC.row = [6, 40, 10, .96, .9, .2, .3]; ball(b.x, b.y, 6, 40 * S, 0, 0, 1, 6);
      if (b.linger) { let c = 0; for (let i = 0; i < M.n; i++) if (M.on[i] && M.bid[i] === b.id && (M.fl[i] & EMBER)) c++; if (c < 4) spawnEmbers(b, false); }
      return;
    }
    if (b.pat === 'ghost') { // Echo: the previous pattern at 50% alpha, 80 ms later
      const src = p.prev || p.cur;
      EC.al = 0.5; EC.d = 0.08;
      if (src && src !== b) { EC.ci = src.ci; EC.fl = src.rain ? RAINBOW : 0; emitPattern(src.pat === 'ghost' ? 'sphere' : src.pat, src.v); }
      else emitPattern('sphere', 0);
      EC.al = 0.9; EC.d = 0; EC.ci = CI.W; EC.fl = 0; EC.row = PAT.ring;
      const rot = rng() * TAU;
      for (let i = 0; i < 16; i++) { const th = rot + i * TAU / 16; star(b.x, b.y, Math.cos(th) * 150 * S, Math.sin(th) * 150 * S, i < 10 ? EMBER : 0, 0, 0.9); }
      return;
    }
    emitPattern(b.pat, b.v);
    if (b.pat === 'ring' && !rm) { // white flash disc, 120 ms, flash-limited; Thunder King adds a sky-wide shock line
      if (canFlash()) { markFlash(); ring(b.x, b.y, b.R * 0.25, b.R * 0.55, 0.12, '#FFFFFF', 0, 0.75, 'disc'); }
      if (b.v === 1) ring(W / 2, b.y, 0, W * 0.6, 0.45, '#FFFFFF', 1.6, 0.8, 'line');
    }
  }
  function ghost(v, delay) {
    EC.P = M; EC.cx = v.x; EC.cy = v.y; EC.gy = H + 2; EC.S = S; EC.m = 0.45; EC.ci = v.ci; EC.fl = v.rain ? RAINBOW : 0; EC.al = 0.5; EC.d = delay; EC.pr = 0; EC.bid = -1; EC.R = rng;
    emitPattern(v.pat === 'ghost' ? 'sphere' : v.pat, v.v);
    EC.al = 1; EC.d = 0; EC.pr = 2;
  }

  /* ============================================================
     PUBLIC: finale, dim, critical, event
  ============================================================ */
  function finale() {
    if (!ready || T - finaleT < 2.5) return;
    finaleT = T;
    excite = 1; poseT = 1;
    addHitStop(150, W / 2, rTop * 0.4);
    if (!opt.reducedMotion) flash(0.42);
    const tb = scene.tubes && scene.tubes.length ? scene.tubes.length : 6, pats = ['sphere', 'trails', 'droop', 'glitter', 'cluster', 'ring', 'fronds', 'prism'], cols = ['R', 'A', 'G', 'B', 'W'];
    let q = 0;
    for (let w = 0; w < 3; w++) for (let t = 0; t < tb; t++, q++) {
      const at = T + w * 0.32 + t * 0.06, x = tubeX(t), y = rTop * (0.22 + 0.34 * rng()), pat = pats[(q * 3 + w) % pats.length], ci = CI[cols[(t + w) % 5]];
      LATER.push({at, fn: () => {
        if (opt.reducedMotion) { spawn(M, x, y, 0, 0, 0, 1, 0.4, 0, 0, 60 * S, 0.9, ci, GLOW, 2, -1, 0); return; }
        EC.P = M; EC.cx = x; EC.cy = y; EC.gy = H + 2; EC.S = S * 0.9; EC.m = 0.55; EC.ci = ci; EC.fl = 0; EC.al = 1; EC.d = 0; EC.pr = 0; EC.bid = -1; EC.R = rng;
        emitPattern(pat, 0); EC.pr = 2;
        const gl = GLOWS.find(g => !g.on) || GLOWS[0]; gl.on = true; gl.x = x; gl.y = y; gl.ci = ci; gl.a = 1; gl.r = 200 * S;
      }});
    }
    if (!opt.reducedMotion) LATER.push({at: T + 0.5, fn: () => { // confetti embers
      for (let k = 0; k < 70 && M.count < 380; k++) spawn(M, rng() * W, -10 - rng() * rTop * 0.4, (rng() - 0.5) * 20, 20 + rng() * 30, 22, 0.99, 3 + rng() * 2, 0, 0.6, 1.2, 0.4, (k % 5 === 4) ? 7 : k % 4, CONF, 0, -1, rng() * 1.2);
    }});
  }
  const LATER = [];
  function dim(on) {
    on = on !== false;
    if (on === dimOn) return;
    dimOn = on; dimT0 = T;
    if (on) { poseT = 0; excite = 0; deflate = 1; }
    else { dimA = 0; lampsOff = 0; }
  }
  function critical(v) {
    if (v && typeof v === 'object') crit = {on: v.on !== false, pulse: !!v.pulse};
    else crit = {on: !!v, pulse: false};
  }
  function event(ev) {
    if (!ev || !ev.type) return;
    const p = P0 || {id: 0, evs: [ev], n: 1, i: 0, cur: null, prev: null, aged: true, stack: 0, echo: false, k: 0, shots: {}, o: {}, next: null, tier: new Uint8Array(1), at: new Float64Array(1)};
    const h = HANDLERS[ev.type];
    if (h) { try { h(ev, p, !ready, 0); } catch (err) { if (typeof console !== 'undefined') console.error('[fx]', err); } }
  }

  /* ============================================================
     UPDATE and RENDER
  ============================================================ */
  function stepPool(P, dt, R, sky) {
    const x = P.x, y = P.y, vx = P.vx, vy = P.vy, g = P.g, dr = P.dr, life = P.life, age = P.age, fl = P.fl, on = P.on;
    const f60 = dt * 60, cs = Math.cos(6 * dt), sn = Math.sin(6 * dt), home = Math.min(1, dt * 4.5);
    for (let i = 0; i < P.n; i++) {
      if (!on[i]) continue;
      const a = age[i] + dt;
      age[i] = a;
      if (a < 0) continue;
      const f = fl[i];
      if (f & EMB) {
        x[i] += vx[i] * dt; y[i] += vy[i] * dt;
        if ((f & FADE) && a - P.fs[i] > 0.3) kill(P, i);
        continue;
      }
      if (a >= life[i]) { if (!((f & EMBER) && sky && emberize(P, i))) kill(P, i); continue; }
      const d = f60 === 1 ? dr[i] : Math.pow(dr[i], f60);
      if (f & HOME) {
        const dx = P.cx[i] - x[i], dy = P.cy[i] - y[i], dist = Math.sqrt(dx * dx + dy * dy) + 1e-3;
        if (dist < 9) { APULSE[P.ph[i] | 0] = 1; kill(P, i); continue; }
        const spd = 260 + 520 * Math.min(1, a / 0.5);
        vx[i] += (dx / dist * spd - vx[i]) * home; vy[i] += (dy / dist * spd - vy[i]) * home;
      } else { vx[i] *= d; vy[i] = vy[i] * d + g[i] * dt; }
      if (f & CONF) vx[i] += Math.sin(a * 5 + P.ph[i]) * 40 * dt;
      x[i] += vx[i] * dt; y[i] += vy[i] * dt;
      if (f & SPIN) { const dx = x[i] - P.cx[i], dy = y[i] - P.cy[i]; x[i] = P.cx[i] + dx * cs - dy * sn; y[i] = P.cy[i] + dx * sn + dy * cs; }
      if ((f & SPLIT) && a >= 0.45 * life[i]) { fl[i] = f & ~SPLIT; split(P, i); continue; }
      if ((f & CRACK) && a > 0.4 * life[i] && a < 0.9 * life[i] && R() < 0.06 * f60 && P.count < P.n - 40) {
        const j = spawn(P, x[i] + (R() - 0.5) * 3, y[i] + (R() - 0.5) * 3, 0, 0, 0, 1, 0.09, 0, 0, P.sz[i] * 1.5, 1, 4, POP, 0, P.bid[i], 0);
        if (j >= 0 && sky === false) P.age[j] = 0;
      }
    }
  }
  function update(dt) {
    if (!(dt > 0)) return;
    dt = Math.min(dt, 0.1);
    T += dt;
    tickPlay(dt);
    for (let i = LATER.length - 1; i >= 0; i--) if (LATER[i].at <= T) { const f = LATER[i].fn; LATER.splice(i, 1); f(); }
    if (!ready) return;
    stepPool(M, dt, rng, true);
    depositTrails();
    stepCrowd(dt);
    trauma = Math.max(0, trauma - 1.5 * dt);
    flashA = Math.max(0, flashA - dt / 0.15 * 0.45);
    meter.v += (meter.goal - meter.v) * Math.min(1, dt * (opt.reducedMotion ? 60 : 9));
    meter.pulse = Math.max(0, meter.pulse - dt * 2.5);
    for (let k = 0; k < 3; k++) APULSE[k] = Math.max(0, APULSE[k] - dt * 3);
    for (const g of GLOWS) if (g.on) { g.a -= dt * 1.6; if (g.a <= 0) g.on = false; }
    for (const b of BUR) {
      if (!b.on) continue;
      b.shown += (Math.max(0, b.hang) - b.shown) * Math.min(1, dt * 10);
      if (!b.linger && b.exp >= 0 && T - b.exp > 3) b.on = false;
    }
    if (dimOn) { dimA = Math.min(0.62, (T - dimT0) / 0.9 * 0.62); lampsOff = Math.floor(clamp((T - dimT0) / 0.9, 0, 1) * lbN); }
    if (!P0 && moodNext && (!AP.slammed || T - AP.slamT > 2.2)) applyMood();
    haze = clamp((scene.haze || 0) + showHaze, 0, 1);
    if (!P0 && AP.slammed && !dimOn && T - AP.slamT > 2.6) { // the sky resets between shows
      let any = false; for (const b of BUR) if (b.on && b.linger) { any = true; break; }
      if (any) clearSky(1.2);
    }
  }
  let rMs = 0, rAvg = 0, rMax = 0, rN = 0;
  function render() {
    if (!ready || !W || !H) return;
    const t0 = nowMs();
    frameNo++;
    const c = ctx, t = tok(), rm = opt.reducedMotion, hc = opt.highContrast;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    // world layer (shake + hit-stop zoom)
    const sh = rm ? 0 : trauma * trauma;
    let zs = 1;
    if (!rm && T - zoomT0 < zoomDur) zs = 1 + 0.018 * Math.sin(Math.PI * (T - zoomT0) / zoomDur);
    c.save();
    if (sh > 0.0005 || zs !== 1) {
      c.fillStyle = t.top; c.fillRect(0, 0, W, H);
      const mo = 0.02 * Math.min(W, H), ox = mo * sh * (Math.sin(T * 37.1) * 0.6 + Math.sin(T * 61.3 + 1.7) * 0.4), oy = mo * sh * (Math.sin(T * 43.7 + 0.5) * 0.6 + Math.sin(T * 71.9 + 2.9) * 0.4);
      const rot = 0.0349 * sh * Math.sin(T * 29.3 + 4.1), ov = 1 + (2 * mo * sh + 2) / Math.min(W, H);
      const px = sh > 0.0005 ? W / 2 : zoomX, py = sh > 0.0005 ? H / 2 : zoomY;
      c.translate(px + ox, py + oy); c.rotate(rot); c.scale(ov * zs, ov * zs); c.translate(-px, -py);
    }
    c.drawImage(BG, 0, 0, W, H);
    // twinkles (the only motion at rest, with the lanterns and the river)
    for (let i = 0; i < stars.length; i += 4) { c.globalAlpha = 0.35 + 0.45 * Math.sin(T * (1.3 + (i % 7) * 0.2) + stars[i + 3]) ** 2; c.fillStyle = '#EAF0FF'; c.fillRect(stars[i], stars[i + 1], stars[i + 2], stars[i + 2]); }
    c.globalAlpha = 1;
    if (!hc) { // sky glow behind the town (L3 ≤ 40%)
      c.globalCompositeOperation = 'lighter';
      for (const g of GLOWS) if (g.on) { c.globalAlpha = 0.3 * g.a * g.a; c.drawImage(BIG[g.ci], g.x - g.r, g.y - g.r, 2 * g.r, 2 * g.r); }
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    }
    if (TOWN) c.drawImage(TOWN.cv, 0, rTop - TOWN.h, W, TOWN.h);
    if (!hc) drawHaze(c);
    // the river: wobbling reflection strips, then burst reflections at 25%
    if (RIVER) {
      const rh = rBot - rTop, st = 2;
      for (let y = 0; y < rh; y += st) { const o = rm ? 0 : 2 * Math.sin(T * 1.9 + y * 0.9); c.drawImage(RIVER, 0, y * dpr, RIVER.width, st * dpr, o, rTop + y, W, st); }
      c.save(); c.beginPath(); c.rect(0, rTop, W, rh); c.clip();
      c.globalCompositeOperation = 'lighter';
      if (!hc) for (const g of GLOWS) if (g.on) { const ry = rTop + (rTop - g.y) * (rh / rTop); c.globalAlpha = 0.25 * g.a * g.a; c.drawImage(BIG[g.ci], g.x - g.r * 0.6, ry - g.r * 0.18, g.r * 1.2, g.r * 0.36); }
      drawPool(c, 0, 0.25, true);
      drawPool(c, 1, 0.25, true);
      c.restore();
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    }
    // bursts: persistence trails, then heads
    if (TR && trDirty) { c.globalCompositeOperation = 'lighter'; c.drawImage(TR, 0, 0, W, H); }
    c.globalCompositeOperation = hc ? 'source-over' : 'lighter';
    drawPool(c, 0, 1, false);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    drawWorldFx(c);
    drawSoot(c);
    drawCrowd(c);
    c.globalCompositeOperation = hc ? 'source-over' : 'lighter';
    drawPool(c, 1, 1, false);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.restore();
    // overlay layer (no shake)
    if (dimA > 0) { c.globalAlpha = dimA; c.fillStyle = '#02030A'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    drawCrit(c);
    drawAnchors(c);
    drawMeter(c);
    drawBanners(c);
    drawApplause(c);
    drawPopups(c);
    if (flashA > 0) { c.globalAlpha = Math.min(0.5, flashA); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    if (BD && frameNo % 2 === 0) renderBackdrop();
    rMs = nowMs() - t0; rN++; rAvg = rN < 2 ? rMs : rAvg * 0.95 + rMs * 0.05; if (rMs > rMax) rMax = rMs;
  }
  function drawPool(c, pass, amul, refl) {
    const P = M, x = P.x, y = P.y, age = P.age, life = P.life, fl = P.fl, on = P.on, ci = P.ci, sz = P.sz, al = P.al, tw = P.tw, ph = P.ph;
    const hc = opt.highContrast, rh = rBot - rTop, kref = rh / Math.max(1, rTop);
    for (let i = 0; i < P.n; i++) {
      if (!on[i]) continue;
      const a = age[i];
      if (a < 0) continue;
      const f = fl[i];
      if (((f & FG) ? 1 : 0) !== pass) continue;
      let A = al[i], s = sz[i];
      if (f & EMB) {
        A *= 0.5 + 0.5 * Math.sin(T * 2.6 + ph[i]) * Math.sin(T * 1.1 + ph[i] * 2);
        if (f & FADE) A *= clamp(1 - (a - P.fs[i]) / 0.3, 0, 1);
      } else {
        const lf = a / life[i];
        if (f & GLOW) { A *= 1 - lf; }
        else {
          A *= lf < 0.62 ? 1 : 1 - (lf - 0.62) / 0.38;
          if (tw[i] > 0) A *= 1 - tw[i] * 0.55 * (0.5 + 0.5 * Math.sin(a * 41 + ph[i] * 7));
          if (f & STROBE) A *= ((a * 16 + ph[i]) & 1) ? 0.06 : 1;
          if (f & POP) s *= 1.8 - lf; else s *= 1 - 0.3 * lf;
          if (f & HOME) A = Math.min(1, A * 1.2);
        }
      }
      A *= amul;
      if (A < 0.015) continue;
      const k = (f & RAINBOW) ? (Math.floor(a * 5 + ph[i]) & 3) : ci[i];
      const spr = (f & GLOW) ? BIG[k] : HEAD[k];
      let px = x[i], py = y[i];
      const r = (f & GLOW) ? s : s * (hc ? 1.4 : 2.3);
      c.globalAlpha = A > 1 ? 1 : A;
      if (refl) {
        if (py >= rTop) continue;
        py = rTop + (rTop - py) * kref; px += 2 * Math.sin(T * 2.3 + py * 0.7);
        c.drawImage(spr, px - r, py - r * 0.4, 2 * r, 0.8 * r);
      } else c.drawImage(spr, px - r, py - r, 2 * r, 2 * r);
    }
  }
  function drawHaze(c) {
    const f = scene.festival, rules = scene.rules || [], fog = rules.includes('fog');
    const a = Math.min(0.34, 0.05 + haze * 0.3 + (f === 6 ? 0.06 : 0));
    const drift = rules.includes('headwind') ? 16 : 4;
    for (let k = 0; k < 6; k++) {
      const w = W * 0.55, x = ((k * 0.37 * W + T * drift * (0.6 + k * 0.15)) % (W + w)) - w / 2, y = rTop * (0.5 + 0.08 * Math.sin(k * 2.1)) + k * 4;
      c.globalAlpha = a * (0.6 + 0.4 * Math.sin(k + T * 0.2)); c.drawImage(HAZE, x - w / 2, y - w * 0.22, w, w * 0.44);
    }
    if (fog) { c.globalAlpha = 0.3; c.drawImage(HAZE, -W * 0.2, rTop * 0.42, W * 1.4, rTop * 0.4); }
    if (f === 6) { const fl = 0.75 + 0.25 * Math.sin(T * 9) * Math.sin(T * 3.7); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.3 * fl; c.drawImage(BIG[7], W * 0.06, rTop - B * 1.3, B * 2.2, B * 1.6); c.globalCompositeOperation = 'source-over'; }
    if (rules.includes('drizzle') && !opt.reducedMotion) { c.globalAlpha = 0.18; c.strokeStyle = '#9AA6D6'; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 26; k++) { const x = (k * 53.3 + T * 30) % W, y = (k * 97.7 + T * 260) % rTop; c.moveTo(x, y); c.lineTo(x - 2, y + 9); } c.stroke(); }
    if (f === 7 && !opt.reducedMotion) { c.globalAlpha = 0.5; c.fillStyle = '#EEF2FF'; for (let k = 0; k < 36; k++) { const x = (k * 71.3 + Math.sin(T * 0.8 + k) * 10 + T * 6) % W, y = (k * 37.9 + T * (14 + (k % 5) * 3)) % rBot; c.fillRect(x, y, 1.4, 1.4); } }
    if (f === 3 && !opt.reducedMotion) { c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 10; k++) { const x = W * (0.1 + 0.08 * k) + Math.sin(T * 0.7 + k * 3) * 20, y = rTop - 6 + Math.sin(T * 0.9 + k) * 8; c.globalAlpha = 0.35 * (0.5 + 0.5 * Math.sin(T * 3 + k * 1.3)); c.drawImage(HEAD[2], x - 3, y - 3, 6, 6); } c.globalCompositeOperation = 'source-over'; }
    if (f === 1 && !opt.reducedMotion) { c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 4; k++) { const y = rTop - ((T * 7 + k * 60) % (rTop * 0.9)), x = W * (0.2 + 0.2 * k) + Math.sin(T * 0.5 + k) * 12; c.globalAlpha = 0.32 * clamp((rTop - y) / 40, 0, 1) * clamp(y / 60, 0, 1); c.drawImage(BIG[7], x - 5, y - 6, 10, 12); c.globalAlpha *= 2; c.drawImage(HEAD[7], x - 2.5, y - 3, 5, 6); } c.globalCompositeOperation = 'source-over'; }
    if (rules.includes('streetlights')) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.22; for (let k = 1; k < 6; k += 2) { const x = tubeX(k); c.drawImage(BIG[7], x - 40, rBot - 30, 80, 60); } c.globalCompositeOperation = 'source-over'; }
    c.globalAlpha = 1;
  }
  function drawSoot(c) {
    const tb = scene.tubes;
    if (!tb || !tb.length || opt.highContrast) return;
    for (let k = 0; k < tb.length; k++) {
      const sv = tb[k] ? +tb[k].soot || 0 : 0, L = sv > 5 ? sootLevel(sv) : clamp(Math.round(sv), 0, 5);
      if (!L) continue;
      const x = tubeX(k);
      for (let j = 0; j < 3; j++) { const y = H - 6 - j * 13 - ((T * 6 + j * 13) % 13), w = 18 + j * 8; c.globalAlpha = L * 0.045 * (1 - j * 0.25); c.drawImage(HAZE, x - w / 2 + Math.sin(T * 0.7 + j + k) * 3, y - w / 2, w, w); }
    }
    c.globalAlpha = 1;
  }
  function drawWorldFx(c) {
    const t = tok(), hc = opt.highContrast, cols = COLS;
    // clear wave: a white band sweeping the sky
    for (const w of WAVES) {
      if (!w.on) continue;
      const u = (T - w.t0) / 0.5;
      if (u >= 1) { w.on = false; continue; }
      const r = easeOut(u) * Math.hypot(W, H);
      c.globalAlpha = 0.34 * (1 - u); c.strokeStyle = '#FFFFFF'; c.lineWidth = 16 * (1 - u * 0.5); c.beginPath(); c.arc(w.x, w.y, r, 0, TAU); c.stroke();
    }
    // reader threads (1.5 px, burst colour at 60%, pulsing 250 ms)
    for (const th of THR) {
      if (!th.on) continue;
      const e = T - th.t0;
      if (e > 0.62) { th.on = false; continue; }
      const a = e < 0.25 ? 0.6 * (0.72 + 0.28 * Math.sin(e / 0.25 * TAU * 2)) : 0.6 * (1 - (e - 0.25) / 0.37);
      c.globalAlpha = clamp(a, 0, 0.6); c.strokeStyle = th.col; c.lineWidth = hc ? 2 : 1.5; c.beginPath();
      for (let k = 0; k < th.n; k++) {
        const x1 = th.pts[k * 2], y1 = th.pts[k * 2 + 1], mx = (th.x + x1) / 2, my = Math.min(th.y, y1) - 18 - Math.abs(th.x - x1) * 0.12;
        c.moveTo(th.x, th.y); c.quadraticCurveTo(mx, my, x1, y1);
      }
      c.stroke();
      c.fillStyle = th.col;
      for (let k = 0; k < th.n; k++) { c.beginPath(); c.arc(th.pts[k * 2], th.pts[k * 2 + 1], 3 + 2 * Math.max(0, 1 - e / 0.25), 0, TAU); c.fill(); }
    }
    // fusion braids (bezier spiral, fusion pink)
    for (const br of BRAIDS) {
      if (!br.on) continue;
      const e = T - br.t0;
      if (e > 0.9) { br.on = false; continue; }
      const grow = opt.reducedMotion ? 1 : Math.min(1, e / 0.3), a = e > 0.6 ? 1 - (e - 0.6) / 0.3 : 1, dx = br.x1 - br.x0, dy = br.y1 - br.y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      c.globalAlpha = a * 0.95; c.strokeStyle = hc ? PAL_HC.F : PAL.F; c.lineWidth = hc ? 2.5 : 2.2; c.lineCap = 'round';
      for (let sgn = 0; sgn < 2; sgn++) {
        c.beginPath();
        for (let k = 0; k <= 28; k++) {
          const u = k / 28 * grow, bow = Math.sin(u * Math.PI) * L * 0.18, wav = Math.sin(u * Math.PI * 4 + sgn * Math.PI) * 7 * Math.sin(u * Math.PI);
          const px = br.x0 + dx * u + nx * (bow + wav), py = br.y0 + dy * u + ny * (bow + wav) - Math.sin(u * Math.PI) * 20;
          if (k === 0) c.moveTo(px, py); else c.lineTo(px, py);
        }
        c.stroke();
      }
    }
    // Hang pips beside each lingering burst: the colour's own shape (greyscale-safe)
    for (const b of BUR) {
      if (!b.on || (!b.linger && (b.exp < 0 || T - b.exp > 0.3))) continue;
      const n = Math.ceil(b.shown - 0.05);
      if (n <= 0) continue;
      const fade = b.linger ? 1 : 1 - (T - b.exp) / 0.3, r = 3.4, gap = 9, y = b.y + pipOff(b);
      const x0 = b.x - (n - 1) * gap / 2;
      for (let k = 0; k < Math.min(n, 8); k++) {
        const frac = clamp(b.shown - k, 0, 1), rr2 = r * (0.4 + 0.6 * frac);
        c.globalAlpha = 0.95 * fade;
        c.beginPath(); shapePath(c, b.rain ? 'X' : b.col === 'X' ? 'X' : (b.ci === CI.S ? 'W' : b.col), x0 + k * gap, y, rr2 + 1.4);
        c.fillStyle = hc ? '#FFF' : t.ink; c.fill();
        c.beginPath(); shapePath(c, b.rain ? 'X' : (b.ci === CI.S ? 'W' : b.col), x0 + k * gap, y, rr2);
        c.fillStyle = cols[b.ci]; c.fill();
      }
    }
    for (const sp of SPARK) {
      if (!sp.on) continue;
      const u = (T - sp.t0) / 0.5;
      if (u >= 1) { sp.on = false; continue; }
      const r = 3 + 9 * easeOut(u);
      c.globalAlpha = 1 - u; c.strokeStyle = t.aah; c.lineWidth = 1.5; c.beginPath();
      c.moveTo(sp.x - r, sp.y); c.lineTo(sp.x + r, sp.y); c.moveTo(sp.x, sp.y - r); c.lineTo(sp.x, sp.y + r); c.stroke();
    }
    drawRings(c);
    c.globalAlpha = 1; c.lineCap = 'butt';
  }
  function drawAnchors(c) {
    if (opt.highContrast) return;
    c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 2; k++) {
      if (APULSE[k] <= 0.01) continue;
      const A = anchor(k === 0 ? 'ooh' : 'aah'), r = 26 + 14 * APULSE[k];
      c.globalAlpha = 0.5 * APULSE[k]; c.drawImage(BIG[k === 0 ? 4 : 1], A.x - r, A.y - r * 0.7, 2 * r, 1.4 * r);
    }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  }
  function drawCrit(c) {
    if (!crit.on) return;
    const t = tok();
    const a = crit.pulse && !opt.reducedMotion ? 0.12 + 0.2 * (0.5 - 0.5 * Math.cos(TAU * T / 1.2)) : 0.2;   // a slow 1.2 s pulse, never a flash
    const g = 22;
    c.globalAlpha = a;
    if (!CRITG || CRITG.w !== W || CRITG.h !== H) {
      const mk = (x0, y0, x1, y1) => { const gr = c.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, rgba(t.danger, 1)); gr.addColorStop(1, rgba(t.danger, 0)); return gr; };
      CRITG = {w: W, h: H, l: mk(0, 0, g, 0), r: mk(W, 0, W - g, 0), b: mk(0, H, 0, H - g), t: mk(0, 0, 0, g)};
    }
    c.fillStyle = CRITG.l; c.fillRect(0, 0, g, H); c.fillStyle = CRITG.r; c.fillRect(W - g, 0, g, H);
    c.fillStyle = CRITG.b; c.fillRect(0, H - g, W, g); c.fillStyle = CRITG.t; c.fillRect(0, 0, W, g);
    c.globalAlpha = 0.85; c.fillStyle = t.danger; c.fillRect(0, H - 2, W, 2);
    c.globalAlpha = 1;
  }
  let CRITG = null;
  function shapePath(c, col, x, y, r) {
    switch (col) {
      case 'A': c.moveTo(x, y - r * 1.1); c.lineTo(x + r * 1.05, y + r * 0.8); c.lineTo(x - r * 1.05, y + r * 0.8); c.closePath(); break;
      case 'G': rr(c, x - r * 0.88, y - r * 0.88, r * 1.76, r * 1.76, r * 0.35); break;
      case 'B': c.moveTo(x, y - r * 1.15); c.lineTo(x + r * 0.95, y); c.lineTo(x, y + r * 1.15); c.lineTo(x - r * 0.95, y); c.closePath(); break;
      case 'W': { const a = r * 0.38, b = r * 1.05; c.moveTo(x - a, y - b); c.lineTo(x + a, y - b); c.lineTo(x + a, y - a); c.lineTo(x + b, y - a); c.lineTo(x + b, y + a); c.lineTo(x + a, y + a); c.lineTo(x + a, y + b); c.lineTo(x - a, y + b); c.lineTo(x - a, y + a); c.lineTo(x - b, y + a); c.lineTo(x - b, y - a); c.lineTo(x - a, y - a); c.closePath(); break; }
      case 'X': for (let i = 0; i < 16; i++) { const an = i / 16 * TAU - Math.PI / 2, q = i % 2 ? 0.5 * r : 1.1 * r; if (i) c.lineTo(x + Math.cos(an) * q, y + Math.sin(an) * q); else c.moveTo(x + Math.cos(an) * q, y + Math.sin(an) * q); } c.closePath(); break;
      default: c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU);
    }
  }

  /* ---------- the desktop backdrop (mirrors bursts at L3 alpha; CSS may dim it further) ---------- */
  let BD = null;
  function attachBackdrop(canvas) {
    if (!canvas || !hasDoc) return;
    if (BD && BD.cv === canvas) return;
    BD = {cv: canvas, c: canvas.getContext('2d', {alpha: false}), w: 0, h: 0, ox: 0, oy: 0, bg: null, n: 0};
    if (ro) ro.observe(canvas);
    layoutBackdrop();
  }
  function layoutBackdrop() {
    if (!BD) return;
    const w = BD.cv.clientWidth, h = BD.cv.clientHeight;
    if (!w || !h) return;
    BD.cv.width = w; BD.cv.height = h; BD.w = w; BD.h = h;
    measureBackdrop();
    const t = tok(), g = mkCanvas(w, h), q = g.getContext('2d'), gr = q.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, t.top); gr.addColorStop(1, t.hor); q.fillStyle = gr; q.fillRect(0, 0, w, h);
    const R = mkRng(hash(seedStr + '|bdstars'));
    for (let i = 0; i < w * h / 2600; i++) { q.globalAlpha = 0.2 + R() * 0.5; q.fillStyle = '#DCE3FF'; const s = 0.6 + R() * R() * 1.4; q.fillRect(R() * w, Math.pow(R(), 1.5) * h * 0.85, s, s); }
    q.globalAlpha = 1;
    if (TOWN) { // the town continues beyond the play column
      const s = 1.6, th = TOWN.h * s, tw = W * s;
      for (let x = BD.ox - tw * 2; x < w + tw; x += tw) { q.globalAlpha = 0.9; q.drawImage(TOWN.cv, x, h - th, tw, th); }
      q.globalAlpha = 1; q.fillStyle = mix(t.hor, t.ink, 0.6); q.fillRect(0, h - 2, w, 2);
    }
    BD.bg = g; BD.bare = false;
  }
  function measureBackdrop() {
    if (!BD || !cv) return;
    try { const a = cv.getBoundingClientRect(), b = BD.cv.getBoundingClientRect(); BD.ox = a.left - b.left; BD.oy = a.top - b.top; } catch (e) { /* ignore */ }
  }
  function renderBackdrop() {
    if (!BD.bg || !BD.w) return;
    if (++BD.n % 60 === 0) measureBackdrop();
    const c = BD.c, ox = BD.ox, oy = BD.oy, P = M;
    // Idle sky (the build): the backdrop is static, so skip the full-bleed repaint once it shows the bare scene.
    let any = false;
    for (const g of GLOWS) if (g.on) { any = true; break; }
    if (!any) for (let i = 0; i < P.n; i++) if (P.on[i] && P.age[i] >= 0 && !(P.fl[i] & (EMB | GLOW | HOME))) { any = true; break; }
    if (!any && BD.bare) return;
    BD.bare = !any;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.drawImage(BD.bg, 0, 0);
    c.globalCompositeOperation = 'lighter';
    for (const g of GLOWS) if (g.on) { c.globalAlpha = 0.35 * g.a; c.drawImage(BIG[g.ci], ox + g.x - g.r * 1.6, oy + g.y - g.r * 1.6, g.r * 3.2, g.r * 3.2); }
    for (let i = 0; i < P.n; i++) {
      if (!P.on[i] || P.age[i] < 0 || (P.fl[i] & (EMB | GLOW | HOME))) continue;
      const lf = P.age[i] / P.life[i], A = 0.9 * P.al[i] * (lf < 0.6 ? 1 : 1 - (lf - 0.6) / 0.4);
      if (A < 0.03) continue;
      const k = (P.fl[i] & RAINBOW) ? (Math.floor(P.age[i] * 5 + P.ph[i]) & 3) : P.ci[i], r = P.sz[i] * 2.4;
      c.globalAlpha = A; c.drawImage(HEAD[k], ox + P.x[i] - r, oy + P.y[i] - r, 2 * r, 2 * r);
    }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  }

  /* ============================================================
     PICTOGRAMS (§4.1, §4.4): the pattern frozen at 45% of its life
  ============================================================ */
  let Q = null;
  const glyphCache = new Map();
  function glyph(id, col, size, pdpr, hc) {
    const key = id + '|' + col + '|' + size + '|' + pdpr + '|' + (hc ? 1 : 0);
    let out = glyphCache.get(key);
    if (out) return out;
    if (!Q) Q = mkPool(320);
    resetPool(Q);
    const sh = shellOf(id), pat = sh[0], R = mkRng(hash('picto|' + id));
    const pal = hc ? PAL_HC : PAL, cols = [pal.R, pal.A, pal.G, pal.B, pal.W, pal.F, '#8E8BA6', '#FFD58A', desat(pal.A)];
    const rain = col === 'X' || sh[3] === 'X';
    const ci = rain ? 4 : CI[col] != null ? CI[col] : 4;
    const savedR = rng;
    rng = R;
    EC.P = Q; EC.cx = 0; EC.cy = 0; EC.gy = 60; EC.S = 1; EC.m = 1; EC.ci = ci; EC.fl = rain ? RAINBOW : 0; EC.al = 1; EC.d = 0; EC.pr = 2; EC.bid = -1; EC.R = R; EC.side = 1;
    if (pat === 'ghost') { EC.al = 0.55; emitPattern('sphere', 0); EC.al = 1; EC.row = PAT.ring; for (let i = 0; i < 16; i++) { const th = i * TAU / 16; star(0, 0, Math.cos(th) * 160, Math.sin(th) * 160, 0, 0, 1); } }
    else emitPattern(pat, sh[1]);
    const life = (PAT[pat] || PAT.sphere)[4], tStop = 0.45 * life, trl = (PAT[pat] || PAT.sphere)[5], dT = Math.min(0.24, 0.05 + 0.2 * trl);
    let t = 0;
    const dt = 1 / 60;
    while (t < tStop - dT - 1e-6) { stepPool(Q, dt, R, false); t += dt; }
    for (let i = 0; i < Q.n; i++) if (Q.on[i] && Q.age[i] >= 0) { Q.hx[i] = Q.x[i]; Q.hy[i] = Q.y[i]; } else { Q.hx[i] = NaN; }
    while (t < tStop - 1e-6) { stepPool(Q, dt, R, false); t += dt; }
    rng = savedR;
    // fit
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i < Q.n; i++) {
      if (!Q.on[i] || Q.age[i] < 0) continue;
      const pr = (Q.fl[i] & GLOW) ? Q.sz[i] : 0;
      x0 = Math.min(x0, Q.x[i] - pr); x1 = Math.max(x1, Q.x[i] + pr); y0 = Math.min(y0, Q.y[i] - pr); y1 = Math.max(y1, Q.y[i] + pr);
      if (Q.hx[i] === Q.hx[i]) { x0 = Math.min(x0, Q.hx[i]); x1 = Math.max(x1, Q.hx[i]); y0 = Math.min(y0, Q.hy[i]); y1 = Math.max(y1, Q.hy[i]); }
    }
    const c = mkCanvas(size * pdpr, size * pdpr), g = c.getContext('2d');
    if (x1 > x0) {
      const k = size * 0.86 / Math.max(x1 - x0, y1 - y0, 1), ox = size / 2 - (x0 + x1) / 2 * k, oy = size / 2 - (y0 + y1) / 2 * k;
      g.setTransform(pdpr, 0, 0, pdpr, 0, 0);
      const lw = clamp(size / 19, 0.9, 2.6);
      g.lineCap = 'round';
      for (let i = 0; i < Q.n; i++) {
        if (!Q.on[i] || Q.age[i] < 0) continue;
        const f = Q.fl[i], cc = cols[(f & RAINBOW) ? (i & 3) : Q.ci[i]], X = Q.x[i] * k + ox, Y = Q.y[i] * k + oy;
        if (f & GLOW) { g.globalAlpha = 0.35; g.fillStyle = cc; g.beginPath(); g.arc(X, Y, Q.sz[i] * k * 0.6, 0, TAU); g.fill(); continue; }
        if (f & POP) continue;
        g.globalAlpha = Q.al[i] * 0.95;
        if (Q.hx[i] === Q.hx[i]) { g.strokeStyle = cc; g.lineWidth = lw * (Q.sz[i] > 1.8 ? 1.25 : 1); g.beginPath(); g.moveTo(Q.hx[i] * k + ox, Q.hy[i] * k + oy); g.lineTo(X, Y); g.stroke(); }
        g.fillStyle = mix(cc, '#FFFFFF', 0.45); g.beginPath(); g.arc(X, Y, lw * 0.72, 0, TAU); g.fill();
      }
    }
    glyphCache.set(key, c);
    if (glyphCache.size > 400) glyphCache.delete(glyphCache.keys().next().value);
    return c;
  }
  function pictogram(shellId, col, star, sizePx, o) {
    if (!hasDoc) return null;
    o = o || {};
    const id = SH[shellId] ? shellId : 'peony', sh = shellOf(id);
    let c0 = col && col !== '*' ? col : sh[3] === '*' ? 'W' : sh[3];
    const size = Math.max(8, Math.round(sizePx || 26)), pd = o.dpr || Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    const hc = o.highContrast != null ? !!o.highContrast : opt.highContrast, token = !!o.token;
    const w = size, h = token ? Math.round(size * 1.25) : size;
    const out = mkCanvas(w * pd, h * pd);
    out.style.width = w + 'px'; out.style.height = h + 'px';
    out.setAttribute('aria-hidden', 'true');
    const g = out.getContext('2d');
    g.setTransform(pd, 0, 0, pd, 0, 0);
    const pal = hc ? PAL_HC : PAL, t = hc ? TOK_HC : TOK;
    let colHex = c0 === 'X' ? pal.W : pal[c0] || pal.W;
    if (o.washed) colHex = desat(colHex);
    const plate = token || o.plate, s = w / 48;
    if (plate) {
      const cx = w / 2, cy = w / 2, r = w * 0.43;
      if (c0 === 'X' && !o.washed) {
        g.save(); g.beginPath(); shapePath(g, 'X', cx, cy, r * 0.92); g.clip();
        const q = [pal.R, pal.A, pal.G, pal.B];
        for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r * 1.3, -Math.PI / 2 + k * Math.PI / 2, k * Math.PI / 2); g.closePath(); g.globalAlpha = 0.34; g.fillStyle = q[k]; g.fill(); }
        g.restore();
      } else { g.beginPath(); shapePath(g, c0, cx, cy, r * 0.92); g.globalAlpha = 0.24; g.fillStyle = colHex; g.fill(); }
      g.globalAlpha = 1; g.beginPath(); shapePath(g, c0, cx, cy, r * 0.92);
      g.lineWidth = hc ? 2 : 1.6 * Math.max(0.7, s); g.strokeStyle = hc ? '#FFFFFF' : colHex; g.stroke();
    }
    const gs = plate ? Math.round(w * 0.56) : size, gl = glyph(id, o.washed ? 'S' : c0 === 'X' ? 'X' : c0, gs, pd, hc);
    const gx = plate ? (w - gs) / 2 : 0, gy = plate ? (w - gs) / 2 : 0;
    g.globalAlpha = 1; g.drawImage(gl, gx, gy, gs, gs);
    if (token || o.mono) {
      const fs = Math.max(10, Math.round(16 * s));
      g.font = '700 ' + fs + 'px ' + FONT_UI; g.textAlign = 'right'; g.textBaseline = 'alphabetic';
      g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = hc ? '#000' : 'rgba(5,7,15,0.9)'; g.strokeText(sh[2], w - 1, w - 1);
      g.fillStyle = t.paper; g.fillText(sh[2], w - 1, w - 1);
    }
    if (token || o.pips) {
      const n = clamp(star | 0 || 1, 1, 3), r = Math.max(1.6, 2.3 * s);
      for (let k = 0; k < n; k++) { const x = w - 3 * s - r - k * (r * 2 + 2 * s), y = 3 * s + r; g.beginPath(); g.arc(x, y, r + 1, 0, TAU); g.fillStyle = hc ? '#000' : 'rgba(5,7,15,0.85)'; g.fill(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = t.aah; g.fill(); }
    }
    if (o.hang != null && token) {
      const n = clamp(o.hang | 0, 0, 6), r = Math.max(1.8, 2.6 * s), gap = r * 2 + 3 * s, y = w + (h - w) / 2;
      for (let k = 0; k < n; k++) { g.beginPath(); g.arc(w / 2 - (n - 1) * gap / 2 + k * gap, y, r, 0, TAU); g.fillStyle = t.paper; g.fill(); }
    }
    if (o.washed) { // the streetlamp glyph
      const x = 5 * s, y = 4 * s;
      g.strokeStyle = t.paper; g.lineWidth = 1.4 * Math.max(0.8, s); g.beginPath(); g.moveTo(x, y + 12 * s); g.lineTo(x, y + 2 * s); g.lineTo(x + 4 * s, y + 2 * s); g.stroke();
      g.fillStyle = '#F5B342'; g.beginPath(); g.arc(x + 4.5 * s, y + 3.5 * s, 2 * s, 0, TAU); g.fill();
    }
    return out;
  }

  /* ============================================================
     INIT, LAYOUT, OPTIONS, SCENE
  ============================================================ */
  function layout() {
    if (!cv) return false;
    const w = cv.clientWidth || (cv.getBoundingClientRect ? cv.getBoundingClientRect().width : 0), h = cv.clientHeight || (cv.getBoundingClientRect ? cv.getBoundingClientRect().height : 0);
    const d = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    if (!w || !h) return false;
    const wChanged = Math.round(w) !== W || d !== dpr || !TOWN;
    W = Math.round(w); H = Math.round(h); dpr = d;
    if (cv.width !== Math.round(W * dpr)) cv.width = Math.round(W * dpr);
    if (cv.height !== Math.round(H * dpr)) cv.height = Math.round(H * dpr);
    B = clamp(Math.round(W * 0.1), 32, 60);
    B = Math.min(B, Math.max(24, Math.round(H * 0.28)));
    cB = Math.round(B * 0.55); rTop = H - B; rBot = H - cB;
    S = clamp(Math.min(0.26 * rTop, 0.2 * W) / 113, 0.3, 1.1);
    if (!HEAD.length) buildSprites();
    buildBg();
    if (wChanged) { buildTown(); layoutCrowd(); } else buildRiver();
    layoutLanterns();
    if (!TR || wChanged || TR.height !== Math.ceil(H * trS)) buildTrail();
    METERG = null; CRITG = null;
    ready = true;
    return true;
  }
  let mq = null;
  function watchDpr() {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    try {
      if (mq) mq.removeEventListener ? mq.removeEventListener('change', onDpr) : mq.removeListener(onDpr);
      mq = window.matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)');
      if (mq.addEventListener) mq.addEventListener('change', onDpr); else if (mq.addListener) mq.addListener(onDpr);
    } catch (e) { /* ignore */ }
  }
  function onDpr() { resize(); watchDpr(); }
  function resize() {
    const w0 = cv ? cv.width : 0, h0 = cv ? cv.height : 0;
    if (!layout()) return;
    if (BD) layoutBackdrop();
    meterDom = null; anchorDom = null;
    // Setting canvas.width clears it; the ResizeObserver runs after this frame's render, and with no rAF loop
    // (?test=1, paused) nothing would repaint: draw now so the sky never shows black.
    if (cv.width !== w0 || cv.height !== h0) render();
  }
  function init(canvas, o) {
    if (!canvas || !hasDoc) return;
    o = o || {};
    cv = canvas;
    ctx = canvas.getContext('2d', {alpha: false});
    try {
      if (!canvas.style.width && typeof getComputedStyle === 'function') {
        const cs = getComputedStyle(canvas);
        if (cs.width === canvas.width + 'px' && cs.height === canvas.height + 'px') { canvas.style.width = '100%'; canvas.style.height = '100%'; }
      }
    } catch (e) { /* ignore */ }
    setOptions(o);
    if (o.seed != null) seedStr = String(o.seed);
    if (o.anchors) scene.anchors = o.anchors;
    rng = mkRng(hash(seedStr + 'fx'));
    buildSprites();
    layout();
    setCrowd(scene.crowd, false);
    if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(() => resize()); ro.observe(canvas); if (BD) ro.observe(BD.cv); }
    watchDpr();
  }
  function setOptions(o) {
    if (!o) return;
    const hc0 = opt.highContrast;
    for (const k of ['reducedMotion', 'highContrast', 'instant', 'test', 'drawApplause', 'drawMeter']) if (o[k] != null) opt[k] = !!o[k];
    if (o.speed != null) opt.speed = clamp(+o.speed || 1, 0.25, 4);
    if (opt.highContrast !== hc0 && ready) { buildSprites(); buildBg(); buildTown(); METERG = null; CRITG = null; if (BD) layoutBackdrop(); for (const k of glyphCache.keys()) if (k.endsWith('|1')) glyphCache.delete(k); }
  }
  function setSeed(sd) {
    if (sd == null || String(sd) === seedStr) return;
    seedStr = String(sd);
    rng = mkRng(hash(seedStr + 'fx'));
    if (ready) { buildBg(); buildTown(); layoutCrowd(); if (BD) layoutBackdrop(); }
  }
  function setScene(s) {
    if (!s) return;
    let rebuild = false;
    if (s.seed != null && String(s.seed) !== seedStr) { seedStr = String(s.seed); rebuild = true; layoutCrowd(); }
    if (s.festival != null && s.festival !== scene.festival) { scene.festival = s.festival | 0; rebuild = true; }
    if (s.show != null) scene.show = s.show;
    if (Array.isArray(s.rules)) scene.rules = s.rules.slice();
    if (Array.isArray(s.tubes)) scene.tubes = s.tubes.map(t => ({x: t && +t.x, soot: t ? t.soot | 0 : 0, shellCol: t && t.shellCol, rig: t && t.rig}));
    if (s.haze != null) scene.haze = clamp(+s.haze || 0, 0, 1);
    if (s.target != null) scene.target = +s.target || 0;
    if (s.anchors) scene.anchors = s.anchors;
    if (s.mood !== undefined) { scene.mood = s.mood; if (!P0 && MOODP[s.mood] != null) poseT = MOODP[s.mood]; }
    if (s.cheer != null) { if (typeof s.cheer === 'number') { if (!P0) poseT = clamp(s.cheer, 0, 1); } else if (MOODP[s.cheer] != null) { scene.mood = s.cheer; if (!P0) poseT = MOODP[s.cheer]; } }
    if (s.crowd != null) { const c = Math.max(0, +s.crowd || 0); const grow = c > scene.crowd; scene.crowd = c; setCrowd(c, grow && ready && T > 0.5); }
    if (rebuild && ready) { buildBg(); buildTown(); if (BD) layoutBackdrop(); }
    if (dimOn && s.show != null && !P0) dim(false);
  }
  function stats() {
    let lb = 0, pops = 0;
    for (const b of BUR) if (b.on && b.linger) lb++;
    for (const p of POPS) if (p.on) pops++;
    return {particles: M.count, pool: M.n, peak: M.peak, bursts: lb, popups: pops, entities: lb + pops, figures: figN,
      renderMs: +rMs.toFixed(3), renderAvgMs: +rAvg.toFixed(3), renderMaxMs: +rMax.toFixed(3), playing: !!P0, trauma: +trauma.toFixed(3), w: W, h: H, dpr,
      resetMax() { rMax = 0; M.peak = M.count; }};
  }

  return {init, resize, setOptions, setSeed, setScene, play, event, update, render, pictogram, finale, dim, critical, clearSky: o => clearSky(o && typeof o === 'object' ? o : 0.6), stats, attachBackdrop,
    fmt, tier, xTier, sootLevel};
})();
