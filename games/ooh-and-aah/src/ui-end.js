/* ============================================================
   Ooh × Aah — UI_END: the end screen (spec §8.2, §8.6, §7.3, §4.12)
   Owns #end and end.css. Opens with GAME.open('end') on GAME 'runEnd'
   and handles the 'end' key scope (GAME.onKey).

   Public API
     init(game)                 wire events + keys (GAME.boot calls it)
     render(lastRun)            build the card from a GAME.lastRun snapshot
     show(lastRun?)             render + open + focus Run it back
     isOpen()                   #end is visible
     result()                   {nearMiss, lesson, pareto} once computed
     posterOf(lastRun)          the poster JSON saved to meta.posters
     paintPoster(canvas, poster, {width, height})   re-render a saved poster

   Consumes (all guarded): GAME.{on, open, close, top, onKey, lastRun, meta,
   settings, flags, setMeta, newRun, enterAfterparty, announce};
   OOH.{DATA, target, resolveShow, legalActions, step, clone, favourite,
   shapley, nearMiss, lessonFor, milestoneProgress, fmt, dailySeed};
   FX.pictogram; AUDIO.ui.
============================================================ */
const UI_END = (() => {
  'use strict';

  /* ---------- module state ---------- */
  let G = null;            // GAME
  let root = null;         // #end
  let v = null;            // normalised view of the run on screen
  let job = 0;             // async job token: bumping it cancels pending slices
  let out = {nearMiss: null, lesson: null, pareto: null};
  let sel = {kit: 'apprentice', renown: 0, keep: null};
  let picker = null;       // 'kit' | 'renown' | null
  let savedKey = '';
  let busy = false;
  let lastW = 0;

  const TAU = Math.PI * 2;
  const now = () => (typeof performance === 'object' ? performance.now() : Date.now());

  /* ---------- small utilities ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const has = (o, f) => !!o && typeof o[f] === 'function';
  const sim = () => (typeof OOH === 'object' && OOH) || null;
  const D = () => (sim() && sim().DATA) || {};
  function call(o, f, ...a) {
    if (!has(o, f)) return undefined;
    try { return o[f](...a); } catch (e) { warn(f, e); return undefined; }
  }
  function warn(where, e) { if (G && G.flags && G.flags.debug) console.warn('[UI_END]', where, e); }
  const cap = s => String(s || '').replace(/^./, c => c.toUpperCase());
  const andList = a => a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  const pct = x => Math.round(x * 100) + '%';
  function hash(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function prng(seed) {
    let a = seed >>> 0 || 1;
    return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function fmt(n) {
    const f = sim() && sim().fmt;
    if (typeof f === 'function') { try { return f(n); } catch (e) { /* fall through */ } }
    n = Math.floor(+n || 0);
    const a = Math.abs(n), t = x => (x < 10 ? Math.round(x * 10) / 10 : Math.round(x));
    if (a < 1e4) return n.toLocaleString('en-US');
    if (a < 1e6) return t(n / 1e3) + 'K';
    if (a < 1e9) return t(n / 1e6) + 'M';
    if (a < 1e12) return t(n / 1e9) + 'B';
    return n.toExponential(2).replace('e+', 'e');
  }
  const axisNum = d => d >= 1e9 ? d / 1e9 + 'B' : d >= 1e6 ? d / 1e6 + 'M' : d >= 1e3 ? d / 1e3 + 'K' : String(d);

  /* ---------- data-table access (arrays or id-keyed objects) ---------- */
  function rows(t) {
    if (!t) return [];
    if (Array.isArray(t)) return t.map((r, i) => (r && typeof r === 'object') ? r : {id: i, name: r});
    return Object.keys(t).map(k => (t[k] && typeof t[k] === 'object') ? Object.assign({id: k}, t[k]) : {id: k, name: t[k]});
  }
  function row(t, id) {
    if (!t) return null;
    if (!Array.isArray(t) && t[id] != null) return typeof t[id] === 'object' ? Object.assign({id}, t[id]) : {id, name: t[id]};
    return rows(t).find(r => r.id === id) || null;
  }
  const COLN = {R: 'Red', A: 'Gold', G: 'Green', B: 'Blue', W: 'White', X: 'Rainbow'};
  const FEST = ['Spring Lanterns', 'May Fair', 'Midsummer', 'Regatta', 'Harvest Moon', 'Bonfire Night', 'Winter Lights', "New Year's Eve"];
  const SLOT = ['Twilight', 'Evening', 'Headliner'];
  const shellRow = id => row(D().SHELLS, id) || {id, name: cap(id), mono: cap(id).slice(0, 2)};
  const rarity = r => r.rarity || r.rar || r.r || '';
  const mono = id => { const r = shellRow(id); return r.mono || String(r.name || id).slice(0, 2); };
  function colName(c) { const r = row(D().COLOURS, c); return (r && r.name) || COLN[c] || ''; }
  function shellName(sh) {
    if (!sh) return '';
    const r = shellRow(sh.id);
    return r.name + (r.col === '*' && COLN[sh.col] ? ' (' + colName(sh.col) + ')' : '');
  }
  function festName(f) {
    const t = D().FESTIVALS;
    let x = t && (Array.isArray(t) ? t[f - 1] : t[f]);
    if (x && typeof x === 'object') x = x.name;
    return x || FEST[f - 1] || 'the Afterparty';
  }
  function ruleName(id) {
    const r = row(D().HEADLINERS, id) || row(D().TWISTS, id);
    if (r && r.name) return r.name;
    return {countdown: 'Midnight Countdown', countdown3: 'Midnight Countdown', rival: 'Rival Crew'}[id] || cap(id);
  }
  const rigName = id => { const r = row(D().RIGS, id); return (r && r.name) || cap(id); };
  const kitRow = id => row(D().KITS, id) || {id, name: cap(id)};
  function renownText(l) {
    const t = D().RENOWN;
    if (!t || l < 1) return 'No modifiers';
    let r = Array.isArray(t) ? (t.length > 8 ? t[l] : t[l - 1]) : t[l];
    if (r && typeof r === 'object') r = r.text || r.desc || r.mod || r.name;
    return r ? String(r) : '';
  }
  const shellsOf = st => [...((st && st.tubes) || []).map(t => t && t.shell), ...((st && st.crate) || [])].filter(Boolean);
  const unlockedAll = () => !!(G && G.flags && G.flags.unlock === 'all');
  function isUnlocked(lock) {
    if (!lock || lock === 'start' || unlockedAll()) return true;
    const u = (G && G.meta && G.meta.unlocked) || [];
    return u.includes(lock);
  }

  /* ---------- colour tokens (read live, so high contrast applies) ---------- */
  function toks() {
    const cs = getComputedStyle(document.documentElement), t = n => cs.getPropertyValue(n).trim();
    return {top: t('--sky-top') || '#0B1026', hor: t('--sky-horizon') || '#1B1440', bg: t('--bg') || '#070A18', ink: t('--ink') || '#05070F',
      paper: t('--paper') || '#F4EFE6', dim: t('--paper-dim') || '#B9B2C7', line: t('--line') || '#2A2F4A', brass: t('--brass') || '#C9A227',
      aah: t('--aah') || '#F2C14E', R: t('--c-R') || '#D55E00', A: t('--c-A') || '#E69F00', G: t('--c-G') || '#009E73',
      B: t('--c-B') || '#56B4E9', W: t('--c-W') || '#F0F0F0', F: t('--c-fusion') || '#CC79A7',
      hc: document.documentElement.getAttribute('data-contrast') === 'high'};
  }
  const hue = (col, T) => T[col] || T.W;

  /* ============================================================
     Run view: one normalised snapshot of GAME.lastRun
  ============================================================ */
  const tubesOf = e => e && (e.tubes || e.rack || e.litTubes || (e.lit && e.lit.tubes)) || null;
  function makeView(lr) {
    lr = lr || {};
    const st = lr.state || {}, rs = st.runStats || {};
    const hist = lr.history || rs.history || [];
    const base = hist.length && hist[0].show === 1 ? 1 : 0;   // history may be 0- or 1-based
    const shows = hist.map((e, i) => {
      const s = Number.isFinite(e.show) ? e.show - base : i;
      const applause = Math.max(0, +e.applause || 0), target = +e.target || 0;
      return {s, n: s + 1, f: Math.floor(s / 3) + 1, k: s % 3, applause, target,
        pass: typeof e.pass === 'boolean' ? e.pass : applause >= target,
        sponsored: !!e.sponsored, encore: !!e.encore, relit: !!e.relit,
        rules: e.rules || [], mood: e.moodAtLight || e.mood || '', e};
    });
    const s0 = st.show || 0;
    const last = shows[shows.length - 1] || {s: s0, n: s0 + 1, f: Math.floor(s0 / 3) + 1, k: s0 % 3, applause: 0, target: 0, pass: false, rules: [], e: {}};
    const best = shows.reduce((b, x) => (!b || x.applause > b.applause ? x : b), null);
    return {lr, st, shows, last, best, won: !!lr.won, endless: !!st.endless,
      seed: lr.seed != null ? lr.seed : (st.seed != null ? st.seed : ''),
      kit: lr.kit || st.kit || 'apprentice', renown: +(lr.renown != null ? lr.renown : st.renown) || 0,
      fair: !!(st.fairWeather != null ? st.fairWeather : (G && G.settings || {}).fairWeather),
      daily: !!st.daily, fp: lr.finalPreLight || rs.lastLostPreLight || null};
  }

  function baseTarget(s) {
    const S = sim();
    if (has(S, 'target')) {
      try { const t = S.target(Object.assign({}, v.st, {sponsor: null}), s); if (t > 0) return t; } catch (e) { /* fall back */ }
    }
    const e = v.shows.find(x => x.s === s);
    if (e) return e.sponsored ? Math.round(e.target / 1.5) : e.target;
    let t = (D().TARGETS || [])[s];
    if (!t) return 0;
    if (v.renown >= 1 && s % 3 === 2 && s !== 23) t = Math.round(t * 1.25);
    if (v.renown >= 8 && s === 23) t = 1e6;
    if (v.fair) t = Math.round(t * 0.75);
    return t;
  }

  /* ============================================================
     Burst art: the §4.4 generator frozen at 45% of life
  ============================================================ */
  // pattern: [n, speed, gravity, drag, life, trail, layout]
  const PAT = {sphere: [48, 170, 40, .975, 1.4, .25, 's'], trails: [56, 180, 40, .975, 1.6, .7, 's'], streak: [14, 120, 30, .98, 1.2, .9, 'k'],
    strobe: [26, 120, 20, .97, 1.2, 0, 'b'], fronds: [42, 150, 70, .985, 1.8, .8, 'f'], droop: [60, 120, 90, .99, 2.8, .95, 's'],
    fan: [36, 260, 120, .98, 1.2, .5, 'n'], ring: [32, 220, 0, .95, .6, 0, 'r'], triple: [48, 150, 40, .97, 1, .3, 't'],
    heart: [40, 150, 25, .97, 1.5, .3, 'h'], star5: [40, 150, 25, .97, 1.5, .3, '5'], spiral: [32, 90, 10, .99, 1.8, .6, 'p'],
    split: [40, 160, 40, .975, 1.6, .4, 's'], ghost: [40, 170, 40, .975, 1.4, .25, 's'], curtain: [60, 40, 110, .99, 2.2, .9, 'c'],
    smiley: [44, 140, 20, .97, 1.6, .2, 'm'], glitter: [56, 160, 50, .98, 2.2, .8, 's'], crackle: [36, 150, 40, .97, 1, .2, 's'],
    cascade: [50, 200, 150, .985, 2, .8, 'a'], crest: [44, 140, 20, .97, 1.6, .2, 'd'], cluster: [72, 180, 40, .975, 1.8, .5, 'u'],
    salvo: [60, 140, 40, .97, .9, .3, 'v'], prism: [48, 170, 40, .975, 1.5, .3, 'q'], moon: [30, 60, 0, .99, 1.8, 0, 'o'],
    rain: [60, 120, 40, .97, 1, .3, 'w'], planet: [48, 130, 10, .98, 1.8, .2, 'z']};
  const PAT_OF = {};
  ('peony sphere dahlia sphere chrys trails comet streak strobe strobe palm fronds fern fronds willow droop kamuro droop ' +
   'nishiki droop mine fan salute ring thunder ring puresky ring candle triple heart heart strontium star5 girandola spiral ' +
   'tourbillon spiral crossette split echo ghost waterfall curtain smiley smiley glitter glitter brocade glitter crackle crackle ' +
   'horsetail cascade crest crest finale cluster barrage salvo prism prism bluemoon moon cake rain saturn planet')
    .split(' ').forEach((w, i, a) => { if (i % 2 === 0) PAT_OF[w] = a[i + 1]; });
  const patternOf = id => { const p = shellRow(id).pattern; return PAT[p] ? p : (PAT_OF[id] || 'sphere'); };

  function along(poly, n) {   // n points spread along a closed polygon
    const seg = poly.map((p, i) => { const q = poly[(i + 1) % poly.length]; return [p, q, Math.hypot(q[0] - p[0], q[1] - p[1])]; });
    const L = seg.reduce((a, s) => a + s[2], 0), pts = [];
    for (let i = 0; i < n; i++) {
      let d = i / n * L, j = 0;
      while (j < seg.length - 1 && d > seg[j][2]) { d -= seg[j][2]; j++; }
      const [p, q, l] = seg[j], f = l ? d / l : 0;
      pts.push([p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f]);
    }
    return pts;
  }
  // particle launch list: [originX, originY (in burst radii), dirX, dirY, speed multiplier]
  function particles(kind, n, rnd) {
    const P = [], add = (ox, oy, dx, dy, m) => P.push([ox, oy, dx, dy, m]);
    const sph = (ox, oy, m, c) => { for (let i = 0; i < c; i++) { const th = rnd() * TAU, z = 2 * rnd() - 1, s = Math.sqrt(1 - z * z); add(ox, oy, s * Math.cos(th), s * Math.sin(th), m * (.92 + rnd() * .16)); } };
    const ring = (c, rx, ry, rot) => { for (let i = 0; i < c; i++) { const a = i / c * TAU, x = rx * Math.cos(a), y = ry * Math.sin(a); add(0, 0, x * Math.cos(rot) - y * Math.sin(rot), x * Math.sin(rot) + y * Math.cos(rot), 1); } };
    const shape = pts => pts.forEach(([x, y]) => add(0, 0, x, y, 1));
    switch (kind) {
      case 'r': case 'o': ring(n, 1, 1, 0); break;
      case 'h': for (let i = 0; i < n; i++) { const t = i / n * TAU; add(0, 0, 16 * Math.sin(t) ** 3 / 17, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17, 1); } break;
      case '5': shape(along([...Array(10)].map((_, i) => { const a = i / 10 * TAU - Math.PI / 2, r = i % 2 ? .45 : 1; return [r * Math.cos(a), r * Math.sin(a)]; }), n)); break;
      case 'd': shape(along([[-.75, -.8], [.75, -.8], [.75, .1], [0, .92], [-.75, .1]], n)); break;
      case 'm': ring(n - 12, 1, 1, 0); for (let i = 0; i < 8; i++) { const a = (.15 + .7 * i / 7) * Math.PI; add(0, 0, .55 * Math.cos(a), .55 * Math.sin(a), 1); }
        [[-.35, -.28], [.35, -.28], [-.35, -.4], [.35, -.4]].forEach(([x, y]) => add(0, 0, x, y, 1)); break;
      case 'f': for (let a = 0; a < 7; a++) { const an = a / 7 * TAU - Math.PI / 2; for (let j = 0; j < 6; j++) add(0, 0, Math.cos(an), Math.sin(an), .42 + j * .12); } break;
      case 'p': for (let i = 0; i < n; i++) { const f = (Math.floor(i / 4) + 1) / Math.ceil(n / 4), an = (i % 4) * TAU / 4 + f * 2.4; add(0, 0, Math.cos(an), Math.sin(an), f); } break;
      case 'n': for (let i = 0; i < n; i++) { const an = -Math.PI / 2 + (rnd() * 2 - 1) * .7; add(0, .6, Math.cos(an), Math.sin(an), .7 + rnd() * .3); } break;
      case 'k': sph(0, 0, .5, n); break;
      case 't': for (let j = 0; j < 3; j++) sph(0, -.55 + j * .55, .42, n / 3 | 0); break;
      case 'u': sph(-.42, .15, .55, n / 3 | 0); sph(.4, -.2, .55, n / 3 | 0); sph(0, .38, .5, n / 3 | 0); break;
      case 'v': for (let i = 0; i < 10; i++) sph((i % 2 ? .12 : -.12), .8 - i * .17, .22, n / 10 | 0); break;
      case 'w': for (let i = 0; i < 5; i++) sph(-.72 + i * .36, (i % 2) * .22 - .12, .32, n / 5 | 0); break;
      case 'c': for (let i = 0; i < n; i++) add(-1 + 2 * (i % 30) / 29, -.5, (rnd() - .5) * .25, .35 + rnd() * .5, .7); break;
      case 'a': for (let i = 0; i < n; i++) { const an = -Math.PI / 2 + .3 + rnd() * .55; add(-.5, .55, Math.cos(an), Math.sin(an), .7 + rnd() * .4); } break;
      case 'z': sph(0, 0, .55, n * .55 | 0); ring(n * .45 | 0, 1.05, .3, -.35); break;
      default: sph(0, 0, 1, n);
    }
    return P;
  }
  /* Paint one burst centred at (cx, cy) with radius R. opts: {flat: colour, alpha} */
  function drawBurst(g, cx, cy, R, id, col, star, rnd, T, opts) {
    opts = opts || {};
    const pat = patternOf(id), [n, sp, grav, drag, life, trail, kind] = PAT[pat];
    const t = life * .45, k60 = 60 * (1 - drag);
    const dist = tt => sp * (1 - Math.pow(drag, 60 * tt)) / k60, drop = tt => .3 * grav * tt * tt;
    const sc = R / (dist(t) + drop(t) * .5 || 1), tt0 = t * (1 - trail * .8);
    const alpha = opts.alpha == null ? 1 : opts.alpha;
    const multi = kind === 'q' || col === 'X' || id === 'dahlia';
    const quad = (dx, dy) => T[['R', 'A', 'G', 'B'][Math.floor((Math.atan2(dy, dx) + Math.PI) / (Math.PI / 2)) % 4]];
    const base = opts.flat || hue(col, T), dot = Math.max(1, R / 26);
    g.save();
    g.globalCompositeOperation = opts.flat ? 'source-over' : 'lighter';
    g.lineCap = 'round';
    if (!opts.flat && 'sbfhm5qzu'.includes(kind)) {           // hot core glow
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R * .5);
      gr.addColorStop(0, kind === 'r' ? T.paper : base); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = .22 * alpha; g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * .5, 0, TAU); g.fill();
    }
    if (kind === 'o' || kind === 'r') {                           // moon disc / salute flash
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R * (kind === 'o' ? .5 : .7));
      gr.addColorStop(0, kind === 'o' ? base : T.paper); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = (kind === 'o' ? .75 : .3) * alpha; g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * .7, 0, TAU); g.fill();
    }
    if (kind === 'k') {                                             // comet: the rising tail
      g.globalAlpha = .6 * alpha; g.strokeStyle = base; g.lineWidth = dot * 1.4;
      g.beginPath(); g.moveTo(cx - R * .08, cy + R * 1.2); g.quadraticCurveTo(cx + R * .06, cy + R * .6, cx, cy); g.stroke();
    }
    const P = particles(kind, n, rnd);
    for (let i = 0; i < P.length; i++) {
      const [ox, oy, dx, dy, m] = P[i];
      const c = opts.flat ? base : (multi ? (id === 'dahlia' && i % 2 ? base : quad(dx, dy)) : base);
      const x1 = cx + ox * R + dx * m * dist(t) * sc, y1 = cy + oy * R + dy * m * dist(t) * sc + drop(t) * sc;
      if (trail > 0 && kind !== 'b') {
        const x0 = cx + ox * R + dx * m * dist(tt0) * sc, y0 = cy + oy * R + dy * m * dist(tt0) * sc + drop(tt0) * sc;
        g.globalAlpha = .42 * alpha; g.strokeStyle = c; g.lineWidth = dot * .9;
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      }
      g.globalAlpha = .95 * alpha; g.fillStyle = c;
      if (kind === 'b' || (pat === 'glitter' && i % 5 === 0)) {  // twinkles as small crosses
        g.fillRect(x1 - dot * 2, y1 - dot * .4, dot * 4, dot * .8); g.fillRect(x1 - dot * .4, y1 - dot * 2, dot * .8, dot * 4);
      } else { g.beginPath(); g.arc(x1, y1, dot, 0, TAU); g.fill(); }
    }
    g.restore();
    if (star > 1 && !opts.flat) {                                   // double / triple break
      drawBurst(g, cx, cy, R * .5, 'salute', 'W', 1, rnd, T, {alpha: .7 * alpha, flat: null});
      if (star > 2) drawBurst(g, cx, cy, R * .27, 'peony', col, 1, rnd, T, {alpha: .9 * alpha});
    }
  }

  /* Colour-shape plate path (§4.1): ● ▲ ■ ◆ ✚ ✺, as an SVG path string */
  function shapeD(col, x, y, r) {
    const P = pts => 'M' + pts.map(p => (x + p[0] * r).toFixed(1) + ',' + (y + p[1] * r).toFixed(1)).join('L') + 'Z';
    switch (col) {
      case 'A': return P([[0, -1], [.98, .8], [-.98, .8]]);
      case 'G': { const s = .8 * r, q = .28 * r; return `M${x - s + q},${y - s}H${x + s - q}Q${x + s},${y - s} ${x + s},${y - s + q}V${y + s - q}Q${x + s},${y + s} ${x + s - q},${y + s}H${x - s + q}Q${x - s},${y + s} ${x - s},${y + s - q}V${y - s + q}Q${x - s},${y - s} ${x - s + q},${y - s}Z`; }
      case 'B': return P([[0, -1], [.85, 0], [0, 1], [-.85, 0]]);
      case 'W': { const a = .34; return P([[-a, -1], [a, -1], [a, -a], [1, -a], [1, a], [a, a], [a, 1], [-a, 1], [-a, a], [-1, a], [-1, -a], [-a, -a]]); }
      case 'X': return P([...Array(16)].map((_, i) => { const an = i / 16 * TAU - Math.PI / 2, rr = i % 2 ? .5 : 1; return [rr * Math.cos(an), rr * Math.sin(an)]; }));
      default: return `M${x - .9 * r},${y}a${.9 * r},${.9 * r} 0 1,0 ${1.8 * r},0a${.9 * r},${.9 * r} 0 1,0 ${-1.8 * r},0Z`;
    }
  }
  function fxPicto(id, col, star, size) {
    const F = typeof FX === 'object' && FX;
    if (!has(F, 'pictogram')) return null;
    try { const c = F.pictogram(id, col, star || 1, size, {}); return c && c.width ? c : null; } catch (e) { warn('pictogram', e); return null; }
  }
  /* A 48 × 56 shell token: colour-shape plate + burst pictogram (monogram is DOM text) */
  function tokenCanvas(id, col, star, sil) {
    const w = 48, h = 56, dpr = Math.min(window.devicePixelRatio || 1, 2), T = toks();
    const c = document.createElement('canvas');
    c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
    c.setAttribute('aria-hidden', 'true');
    const g = c.getContext('2d');
    g.scale(dpr, dpr);
    const colr = sil ? T.dim : hue(col, T), p = new Path2D(shapeD(sil ? 'R' : col, w / 2, h / 2 - 2, 21));
    g.globalAlpha = sil ? .1 : .2; g.fillStyle = colr; g.fill(p);
    g.globalAlpha = sil ? .55 : .9; g.lineWidth = 2; g.strokeStyle = colr;
    if (sil) g.setLineDash([4, 4]);
    g.stroke(p); g.setLineDash([]); g.globalAlpha = 1;
    const pic = !sil && fxPicto(id, col, star, 30);
    if (pic) g.drawImage(pic, w / 2 - 15, h / 2 - 17, 30, 30);
    else drawBurst(g, w / 2, h / 2 - 2, 13, id, col, sil ? 1 : star, prng(hash(id + col)), T, sil ? {flat: T.dim, alpha: .6} : null);
    return c;
  }

  /* ============================================================
     Poster (§8.2 item 2): the final rack painted as a festival poster
  ============================================================ */
  function posterOf(lr) {
    const w = lr && lr.state ? makeView(lr) : v;
    if (!w) return null;
    return {v: 1, key: w.seed + '|' + w.last.n + '|' + (w.won ? 'w' : 'l') + '|' + w.shows.length,
      seed: w.seed, kit: w.kit, renown: w.renown, won: w.won, endless: w.endless, fair: w.fair,
      show: w.last.n, festival: w.won && !w.endless ? 8 : w.last.f, best: w.best ? w.best.applause : 0,
      date: new Date().toISOString().slice(0, 10),
      tubes: (w.st.tubes || []).map(t => (t && t.shell ? {id: t.shell.id, col: t.shell.col, star: t.shell.star || 1, rig: t.rig || null} : null))};
  }
  function paintPoster(cv, p, o) {
    if (!cv || !p) return;
    o = o || {};
    const T = toks(), W = Math.max(200, Math.round(o.width || cv.clientWidth || 328)), H = o.height || 180;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rnd = prng(hash(p.seed + '|poster')), hz = H - 24;
    // sky + stars
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, T.top); sky.addColorStop(1, T.hor);
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = T.paper;
    for (let i = 0; i < W / 7; i++) { g.globalAlpha = .12 + rnd() * .45; const s = rnd() < .12 ? 2 : 1; g.fillRect(rnd() * W, rnd() * hz * .9, s, s); }
    g.globalAlpha = 1;
    // bursts in their tube columns
    const tubes = p.tubes || [], n = Math.max(tubes.length, 1);
    const rackW = Math.min(W - 24, n * 104), x0 = (W - rackW) / 2, colW = rackW / n;
    const spots = [];
    tubes.forEach((t, i) => {
      if (!t || !t.id) return;
      const R = Math.min(colW * .5, 46) * (.84 + .08 * (t.star || 1));
      spots.push({t, x: x0 + colW * (i + .5), y: 70 + (i % 2) * 18 + (rnd() - .5) * 10, R});
    });
    for (const s of spots) {                                        // mortar trails
      g.globalAlpha = .28; g.strokeStyle = hue(s.t.col, T); g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(s.x, hz);
      for (let y = hz; y > s.y + s.R * .35; y -= 6) g.lineTo(s.x + Math.sin(y * .15 + s.x) * 1.5, y);
      g.stroke();
    }
    g.globalAlpha = 1;
    for (const s of spots) drawBurst(g, s.x, s.y, s.R, s.t.id, s.t.col, s.t.star || 1, rnd, T);
    if (p.won) {                                                    // New Year confetti embers
      for (let i = 0; i < 40; i++) { g.globalAlpha = .35 + rnd() * .4; g.fillStyle = [T.aah, T.paper, T.F, T.B][i % 4]; g.fillRect(rnd() * W, rnd() * hz * .85, 2, 3); }
      g.globalAlpha = 1;
    }
    // river with wobbling reflections
    g.fillStyle = T.bg; g.fillRect(0, hz, W, H - hz);
    for (const s of spots) {
      g.fillStyle = hue(s.t.col, T);
      for (let k = 0; k < 4; k++) { g.globalAlpha = .25 - k * .05; const y = hz + 5 + k * 4, w = s.R * (.8 - k * .15); g.fillRect(s.x - w / 2 + Math.sin(k * 2 + s.x) * 2, y, w, 1.5); }
    }
    g.globalAlpha = 1;
    // skyline: rooftops, a church spire, a bridge with 3 arches
    g.fillStyle = T.ink; g.beginPath(); g.moveTo(0, hz);
    const bx0 = W * (.08 + rnd() * .12), bx1 = bx0 + Math.min(150, W * .3), spX = W * (.6 + rnd() * .25);
    for (let x = 0; x < W;) {
      const bw = 10 + rnd() * 22, inBridge = x + bw > bx0 && x < bx1, h = inBridge ? 0 : 5 + rnd() * 15;
      g.lineTo(x, hz - h); g.lineTo(x + bw, hz - h); x += bw;
    }
    g.lineTo(W, hz); g.closePath(); g.fill();
    g.fillRect(spX - 6, hz - 20, 12, 20);
    g.beginPath(); g.moveTo(spX - 7, hz - 20); g.lineTo(spX, hz - 46); g.lineTo(spX + 7, hz - 20); g.closePath(); g.fill();
    g.fillRect(bx0, hz - 12, bx1 - bx0, 5);
    const aw = (bx1 - bx0) / 3;
    g.lineWidth = 3; g.strokeStyle = T.ink;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(bx0 + aw * (i + .5), hz, aw * .5, Math.PI, 0); g.stroke(); }
    if (T.hc) { g.strokeStyle = T.paper; g.lineWidth = 1; g.beginPath(); g.moveTo(0, hz + .5); g.lineTo(W, hz + .5); g.stroke(); }
    // title block (drawn last, over a soft plate)
    const title = festName(p.festival || p.fest || 1);
    const sub = p.won && !p.endless ? 'Happy New Year!' : (p.won ? 'The Afterparty went till dawn' : 'Show ' + p.show) + (p.seed ? ' · seed ' + p.seed : '');
    g.font = '600 26px Fraunces, Georgia, "Times New Roman", serif';
    const tw = Math.max(g.measureText(title).width, 150);
    const plate = g.createLinearGradient(0, 0, tw + 60, 0);
    plate.addColorStop(0, T.hc ? 'rgba(0,0,0,.85)' : 'rgba(7,10,24,.62)'); plate.addColorStop(1, 'rgba(7,10,24,0)');
    g.fillStyle = plate; g.fillRect(0, 0, tw + 60, 64);
    g.fillStyle = T.paper; g.textBaseline = 'alphabetic';
    g.fillText(title, 14, 34);
    g.font = '700 16px "Atkinson Hyperlegible", system-ui, sans-serif';
    g.fillStyle = p.won ? T.aah : T.dim; g.fillText(sub, 14, 56);
    g.font = 'italic 700 16px Fraunces, Georgia, serif';
    g.textAlign = 'right'; g.fillStyle = T.brass;
    g.fillText('Ooh × Aah', W - 12, 26); g.textAlign = 'left';
    g.globalAlpha = .7; g.strokeStyle = T.brass; g.lineWidth = 1; g.strokeRect(4.5, 4.5, W - 9, H - 9); g.globalAlpha = 1;
  }

  /* ============================================================
     Async work in ≤ 8 ms slices, finishing within 1 s (§8.6)
  ============================================================ */
  const defer = (() => {
    if (typeof MessageChannel !== 'function') return f => setTimeout(f, 0);
    const ch = new MessageChannel(), q = [];
    ch.port1.onmessage = () => { const f = q.shift(); if (f) f(); };
    return f => { q.push(f); ch.port2.postMessage(0); };
  })();
  function sliced(gen, done) {
    const id = job;
    const tick = () => {
      if (id !== job) return;
      const t0 = now();
      let r;
      try { do { r = gen.next(); } while (!r.done && now() - t0 < 7); } catch (e) { warn('slice', e); r = {done: true, value: null}; }
      if (id !== job) return;
      if (r.done) done(r.value); else defer(tick);
    };
    defer(tick);
  }

  const resolveA = (tubes, rules, crowd, fav) => { const r = sim().resolveShow(tubes, {rules, crowd, fav}); return Math.floor((r && r.applause) || 0); };
  const withShells = (tubes, sh) => tubes.map((t, j) => Object.assign({}, t, {shell: sh[j] || null}));
  const shellKey = s => (s ? s.id + ':' + s.col + ':' + (s.star || 1) : '-');

  /* Near-miss (§8.6): best rearrangement, then each single build action. */
  function* nearMissGen(ctx, deadline) {
    const S = sim(), fp = ctx.fp, rules = ctx.rules, crowd = +fp.crowd || 0;
    const rival = rules.includes('rival');
    const favOf = tb => (rival && has(S, 'favourite') ? S.favourite(tb, crowd) : null);
    const tubes = fp.tubes || [], orig = tubes.map(t => (t && t.shell) || null);
    const actual = ctx.applause != null ? ctx.applause : resolveA(tubes, rules, crowd, favOf(tubes));
    let cost = 0;
    if (rules.length) { cost = Math.max(0, resolveA(tubes, [], crowd, null) - resolveA(tubes, rules, crowd, favOf(tubes))); yield; }
    let pass = null, close = null, bestArr = {applause: actual, pass: actual >= ctx.target};
    const better = (a, b) => !b || a.size < b.size || (a.size === b.size && (a.kind === 'arrange') > (b.kind === 'arrange')) ||
      (a.size === b.size && a.kind === b.kind && a.applause > b.applause);
    const consider = c => {
      c.pass = c.applause >= c.target;
      if (c.pass && better(c, pass)) pass = c;
      if (!close || c.applause - c.target > close.applause - close.target) close = c;
    };
    // A. every distinct arrangement of the tube shells (≤ 720); rigs stay put
    const n = orig.length, idx = [...Array(n).keys()], seen = new Set();
    const perm = function* (k) {
      if (k === n) { yield idx; return; }
      for (let i = k; i < n; i++) { [idx[k], idx[i]] = [idx[i], idx[k]]; yield* perm(k + 1); [idx[k], idx[i]] = [idx[i], idx[k]]; }
    };
    for (const p of perm(0)) {
      if (now() > deadline) break;
      const sh = p.map(i => orig[i]), key = sh.map(shellKey).join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      const moved = sh.reduce((a, s, j) => a + (shellKey(s) !== shellKey(orig[j]) ? 1 : 0), 0);
      if (!moved) continue;
      const tb = withShells(tubes, sh), a = resolveA(tb, rules, crowd, favOf(tb));
      if (a > bestArr.applause) bestArr = {applause: a, pass: a >= ctx.target};
      consider({kind: 'arrange', shells: sh, applause: a, target: ctx.target, size: Math.max(1, moved - 1)});
      yield;
    }
    // B. each single legal build action from finalPreLight, applied without re-arranging
    if (has(S, 'legalActions') && has(S, 'step') && has(S, 'clone')) {
      let acts = [];
      try { acts = S.legalActions(fp) || []; } catch (e) { warn('legalActions', e); }
      for (const a of acts) {
        if (now() > deadline) break;
        const t = a.type;
        if (t === 'light' || t === 'reroll' || t === 'restore' || t === 'setColour' || t === 'endless' || t === 'buyTube') continue;
        if (t === 'sponsor' && a.accept) continue;
        if ((t === 'buy' || t === 'upgrade') && a.to && a.to.zone === 'crate') continue;
        if (t === 'sell' && a.from && a.from.zone === 'crate') continue;
        if (t === 'move' && a.from && a.to && a.from.zone === 'tube' && a.to.zone === 'tube') continue;   // covered by A
        if (t === 'move' && a.from && a.to && a.from.zone === 'crate' && a.to.zone === 'crate') continue;
        const s2 = S.clone(fp);
        let ev = null;
        try { ev = S.step(s2, a); } catch (e) { continue; }
        if (Array.isArray(ev) && ev[0] && ev[0].type === 'illegal') continue;
        const tb = s2.tubes || [], score = resolveA(tb, rules, crowd + 0, favOf(tb));
        consider({kind: 'action', act: a, applause: score, target: t === 'sponsor' ? ctx.baseTarget : ctx.target, size: 1});
        yield;
      }
    }
    return {kind: 'local', actual, target: ctx.target, rules, cost, pick: pass || close, bestReorder: bestArr,
      bestReorderApplause: bestArr.applause, reorderPasses: bestArr.pass};
  }

  function describeCandidate(c) {
    const fp = v.fp || {}, tubes = fp.tubes || [], crate = fp.crate || [], cards = (fp.shop && fp.shop.cards) || [];
    const at = sl => sl ? (sl.zone === 'crate' ? crate[sl.i] : (tubes[sl.i] || {}).shell) : null;
    if (c.kind === 'arrange') {
      const orig = tubes.map(t => (t && t.shell) || null), diff = [];
      orig.forEach((s, j) => { if (shellKey(s) !== shellKey(c.shells[j])) diff.push(j); });
      if (diff.length === 2) {
        const [i, j] = diff, a = orig[i], b = orig[j];
        if (a && b) return `Swapping ${shellName(a)} and ${shellName(b)}`;
        const s = a || b, to = a ? j : i;
        return `Moving ${shellName(s)} to tube ${to + 1}`;
      }
      return 'Rearranging them as ' + andList(c.shells.filter(Boolean).map(shellName));
    }
    const a = c.act || {}, card = cards[a.card];
    switch (a.type) {
      case 'buy': return `Buying ${shellName(card)} into tube ${a.to.i + 1}`;
      case 'upgrade': { const s = at(a.to); return `Upgrading ${shellName(s)} to ★${(s && s.star || 1) + 1}`; }
      case 'buyRig': return `Adding the ${rigName((fp.shop && fp.shop.rig && fp.shop.rig.id) || a.rig || 'rig')} to tube ${a.tube + 1}`;
      case 'move': return a.from.zone === 'crate' ? `Moving ${shellName(at(a.from))} from the Crate into tube ${a.to.i + 1}` : `Benching ${shellName(at(a.from))} in the Crate`;
      case 'sell': return `Selling ${shellName(at(a.from))}`;
      case 'match': return 'Pressing Match';
      case 'sponsor': return 'Turning down the Sponsor';
      default: return 'One more change';
    }
  }
  /* Normalise a near-miss result (ours, or the SIM's own shape) into display lines. */
  function nearMissLines(r) {
    const last = v.last, target = (r && r.target) || last.target, got = r && r.actual != null ? r.actual : last.applause;
    const short = Math.max(0, target - got), p = target ? Math.floor(got / target * 100) : 0;
    const rules = (r && r.rules) || last.rules || [];
    const where = festName(last.f) + ' · ' + (rules.length ? rules.map(ruleName).join(' + ') : SLOT[last.k] || 'show ' + last.n);
    const lines = [`${fmt(short)} short (${p}%) at ${where}.`];
    if (r && typeof r.text === 'string') return lines.concat(r.text);
    const cost = r && (r.cost != null ? r.cost : r.ruleCost);
    if (rules.length && cost > 0) lines.push(`${rules.map(ruleName).join(' + ')} cost you ${fmt(cost)}.`);
    const c = r && (r.pick || r.best || r.candidate);
    if (c) {
      const what = c.desc || c.text || describeCandidate(c);
      if (c.act && c.act.type === 'sponsor') lines.push(c.pass ? `${what} would have kept the target at ${fmt(c.target)}: you'd have passed.` : `${what} would have left you ${fmt(c.target - c.applause)} short.`);
      else if (c.pass || c.applause >= target) lines.push(`${what} would have scored ${fmt(c.applause)}.`);
      else if (c.applause > got) lines.push(`Your closest fix: ${what.charAt(0).toLowerCase() + what.slice(1)} would have scored ${fmt(c.applause)}, still ${fmt(c.target - c.applause)} short.`);
    }
    return lines;
  }

  /* Pareto attribution (§8.6): mean per-show Shapley shares, grouped by shell id + Crowd. */
  function localShapley(tubes, rules, crowd, fav) {
    const occ = [];
    tubes.forEach((t, i) => { if (t && t.shell) occ.push(i); });
    const m = occ.length + 1, full = 1 << m, val = new Float64Array(full), fact = [1];
    for (let i = 1; i <= m; i++) fact[i] = fact[i - 1] * i;
    for (let mask = 1; mask < full; mask++) {
      const tb = tubes.map((t, i) => { const j = occ.indexOf(i); return j >= 0 && !(mask >> j & 1) ? Object.assign({}, t, {shell: null}) : t; });
      val[mask] = resolveA(tb, rules, (mask >> (m - 1) & 1) ? crowd : 0, fav);
    }
    const phi = new Array(m).fill(0);
    for (let mask = 0; mask < full; mask++) {
      let sz = 0; for (let b = mask; b; b &= b - 1) sz++;
      for (let i = 0; i < m; i++) if (!(mask >> i & 1)) phi[i] += fact[sz] * fact[m - sz - 1] / fact[m] * (val[mask | 1 << i] - val[mask]);
    }
    const res = {crowd: phi[m - 1]};
    occ.forEach((ti, j) => { res[ti] = phi[j]; });
    return res;
  }
  function sharesFor(x) {        // → Map(groupKey → share), shares sum to 1
    const S = sim();
    let r = has(S, 'shapley') ? call(S, 'shapley', x.tubes, x.rules, x.crowd, x.fav) : (has(S, 'resolveShow') ? localShapley(x.tubes, x.rules, x.crowd, x.fav) : null);
    if (!r) return null;
    if (r.shares) r = r.shares;
    const list = [], num = y => Math.max(0, +(y && typeof y === 'object' ? (y.share != null ? y.share : y.value) : y) || 0);
    if (Array.isArray(r)) r.forEach((y, i) => list.push([i < x.tubes.length ? i : 'crowd', num(y)]));
    else {
      if (Array.isArray(r.tubes)) r.tubes.forEach((y, i) => list.push([i, num(y)]));
      else Object.keys(r).forEach(k => { if (/^\d+$/.test(k)) list.push([+k, num(r[k])]); });
      if (r.crowd != null) list.push(['crowd', num(r.crowd)]);
    }
    const sum = list.reduce((a, e) => a + e[1], 0);
    if (!(sum > 0)) return null;
    const m = new Map();
    for (const [t, y] of list) {
      const sh = t === 'crowd' ? null : x.tubes[t] && x.tubes[t].shell;
      if (t !== 'crowd' && !sh) continue;
      const key = sh ? sh.id : 'crowd';
      m.set(key, (m.get(key) || 0) + y / sum);
      if (sh && !x.cols[key]) x.cols[key] = sh.col;
    }
    return m;
  }
  function* paretoGen(deadline) {
    let list = v.shows.filter(x => tubesOf(x.e)).map(x => {
      const e = x.e, lit = e.lit || {};
      const crowd = [e.crowdAtLight, e.crowdLit, lit.crowd, e.crowd].find(c => c != null);
      return {tubes: tubesOf(e), rules: x.rules, crowd: +crowd || 0, fav: e.fav != null ? e.fav : (lit.fav != null ? lit.fav : null), cols: {}};
    });
    if (!list.length && v.fp && v.fp.tubes) list = [{tubes: v.fp.tubes, rules: v.last.rules, crowd: +v.fp.crowd || 0, fav: null, cols: {}}];
    const acc = new Map(), cols = {};
    let count = 0;
    for (const x of list) {
      if (now() > deadline) break;
      const m = sharesFor(x);
      yield;
      if (!m) continue;
      count++;
      m.forEach((y, k) => acc.set(k, (acc.get(k) || 0) + y));
      Object.assign(cols, x.cols, cols);
    }
    if (!count) return null;
    return [...acc].map(([key, y]) => ({key, share: y / count, col: cols[key] || shellRow(key).col,
      name: key === 'crowd' ? 'the Crowd' : shellRow(key).name, mono: key === 'crowd' ? '' : mono(key)}))
      .filter(it => it.share > 0.0005).sort((a, b) => b.share - a.share);
  }

  /* ---------- lesson (§4.12) ---------- */
  function lessonOf(nm) {
    const sum = Object.assign({}, v.lr, {nearMiss: nm, bestReorder: nm && nm.bestReorder, lastShow: v.last.e});
    let r = call(sim(), 'lessonFor', sum);
    if (r && typeof r === 'object') r = r.text || r.line || '';
    if (typeof r === 'string' && r) return r;
    const L = v.last, reo = nm && nm.bestReorder;
    if (v.won) return `Next: Renown ${v.renown + 1}: ${renownText(v.renown + 1)}.`;
    if (L.rules.some(x => /^countdown/.test(x)) && reo && reo.pass) return `The Countdown fires your last tube first and last. Rearranging would have scored ${fmt(reo.applause)}.`;
    if (/restless/i.test(L.mood)) return `The crowd was Restless when you lit show ${L.n}. Keep building until it reads Hopeful or Eager.`;
    if (L.k === 2 && reo && reo.pass) return `Rearranging for ${ruleName(L.rules[0])} would have scored ${fmt(reo.applause)}. Try Rehearse (H) before Headliners.`;
    if (L.sponsored) return 'Sponsors raise the target ×1.5. Take one when the crowd stays Eager with Accept on.';
    return "Bursts hang for their Hang; readers count what's still up. Build a canopy before you cash it in.";
  }

  /* ---------- milestones, silhouettes, keepsakes, kits ---------- */
  const GOALS = {m_fusion: 1, m_busy: 8, m_mono: 5, m_spectrum: 3, m_crowd: 40, m_triple: 3, m_headliner: 1, m_rigger: 3, m_win: 1, m_logbook: 6};
  function milestones() {
    const meta = G.meta || {}, prog = meta.progress || {}, unl = meta.unlocked || [];
    let list = rows(call(sim(), 'milestoneProgress', v.st.runStats || {}, meta));
    if (!list.length) list = rows(D().MILESTONES).map(m => ({id: m.id, value: prog[m.id] || 0}));
    if (!list.length) list = Object.keys(GOALS).map(id => ({id, value: prog[id] || 0}));
    const delta = {};
    (v.lr.milestoneDeltas || []).forEach(d => { if (d && d.id) delta[d.id] = d; });
    return list.map(x => {
      const m = row(D().MILESTONES, x.id) || {};
      const goal = +x.goal || +m.goal || GOALS[x.id] || 1;
      const value = Math.min(goal, Math.max(+(x.value != null ? x.value : (x.best != null ? x.best : x.progress)) || 0, +prog[x.id] || 0));
      const done = x.done != null ? !!x.done : (unl.includes(x.id) || value >= goal);
      return {id: x.id, name: x.name || m.name || cap(String(x.id).replace(/^m_/, '')), goal, value, done, unit: m.unit || '', m, d: delta[x.id]};
    }).filter(x => !x.done).sort((a, b) => b.value / b.goal - a.value / a.goal);
  }
  function unlocksOf(ms) {
    const u = ms.m.unlocks;
    if (typeof u === 'string') return u;
    const names = Array.isArray(u) ? u.map(id => (row(D().SHELLS, id) || row(D().KITS, id) || {name: cap(id)}).name)
      : rows(D().SHELLS).filter(r => r.lock === ms.id).map(r => r.name).concat(rows(D().KITS).filter(k => (k.unlock || k.lock) === ms.id).map(k => 'the ' + k.name + ' kit'));
    if (ms.id === 'm_win') return 'Renown 1, the Afterparty and the Daily Show';
    return names.length ? andList(names) : '';
  }
  function silhouette(ms) {
    const meta = G.meta || {}, codex = meta.codex || {}, found = codex.fusions || {}, cs = codex.shells || {};
    const owned = new Set(shellsOf(v.st).map(s => s.id));
    const ok = id => isUnlocked(shellRow(id).lock);
    const fus = rows(D().FUSIONS).map(f => {
      const key = f.key || (typeof f.id === 'string' && f.id.includes('>') ? f.id : (f.a || f.from) + '>' + (f.b || f.to));
      const [a, b] = key.split('>');
      return {key, a: f.a || f.from || a, b: f.b || f.to || b, lock: f.lock};
    }).filter(f => f.a && f.b && !(found[f.key] && found[f.key].found) && ok(f.a) && ok(f.b) && isUnlocked(f.lock) &&
      (owned.has(f.a) || (found[f.key] && found[f.key].leftSeen) || (cs[f.a] && cs[f.a].owned)));
    const f = fus.find(x => owned.has(x.a)) || fus[0];
    if (f) return {id: f.a, col: shellRow(f.a).col, label: shellRow(f.a).name + ' → ?', hint: `A fusion is waiting: fire the right shell straight after a ${shellRow(f.a).name}.`};
    for (const m of ms) {
      const sh = rows(D().SHELLS).find(r => r.lock === m.id);
      if (sh) return {id: sh.id, sil: true, label: '?', hint: `${m.name} (${m.value}/${m.goal}) unlocks a new shell.`};
    }
    return null;
  }
  function keepOptions() {
    const opts = [], seen = new Set();
    for (const s of shellsOf(v.st)) {
      if (rarity(shellRow(s.id)) !== 'C') continue;
      const k = s.id + ':' + s.col;
      if (!seen.has(k)) { seen.add(k); opts.push({id: s.id, col: s.col}); }
    }
    if (!opts.length) {
      const pool = rows(D().SHELLS).filter(r => rarity(r) === 'C' && isUnlocked(r.lock)), rnd = prng(hash(v.seed + '|keep'));
      while (opts.length < 3 && pool.length) {
        const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
        opts.push({id: r.id, col: r.col === '*' ? 'RAGB'[Math.floor(rnd() * 4)] : r.col});
      }
    }
    return opts;
  }
  function kits() {
    const meta = G.meta || {}, list = rows(D().KITS);
    if (!list.length) return [{id: 'apprentice', name: 'Apprentice'}];
    return list.filter(k => k.id === sel.kit || isUnlocked(k.unlock || k.lock) || (Array.isArray(meta.kits) && meta.kits.includes(k.id)));
  }
  function renownMax() {
    if (unlockedAll()) return 8;
    const r = (G.meta || {}).renown;
    return Math.max(typeof r === 'number' ? r : +((r && r.max) || 0), sel.renown);
  }

  /* ============================================================
     Charts (inline SVG sized to the container; token colours via CSS)
  ============================================================ */
  const crown = (x, y, cls) => `<path class="${cls}" d="M${x - 8},${y + 5}L${x - 8},${y - 3}L${x - 4},${y + 1}L${x},${y - 6}L${x + 4},${y + 1}L${x + 8},${y - 3}L${x + 8},${y + 5}Z"/>`;
  const cross = (x, y, s) => `<path class="ec-miss" d="M${x - s},${y - s}L${x + s},${y + s}M${x + s},${y - s}L${x - s},${y + s}"/>`;

  function applauseSVG(W) {
    const H = 216, L = 48, Rp = 12, Tp = 18, Bp = 30, pw = W - L - Rp, ph = H - Tp - Bp;
    const N = v.endless || v.last.n > 24 ? Math.min(36, Math.ceil(v.last.n / 3) * 3) : 24;
    const tg = [];
    for (let s = 0; s < N; s++) tg[s] = baseTarget(s);
    const vals = v.shows.map(x => x.applause).concat(tg).filter(x => x > 0);
    if (!vals.length) vals.push(100);
    const lo = Math.pow(10, Math.floor(Math.log10(Math.min(...vals))));
    let hi = Math.pow(10, Math.ceil(Math.log10(Math.max(...vals) * 1.02)));
    if (hi / lo < 100) hi = lo * 100;
    const lg = Math.log10, X = n => L + (n - .5) / N * pw;
    const Y = a => Tp + ph - (lg(Math.max(a, lo)) - lg(lo)) / (lg(hi) - lg(lo)) * ph;
    let s = '';
    const bw = 3 * pw / N;                                         // festival bands + labels
    for (let f = 1; f <= N / 3; f++) {
      const x0 = L + (f - 1) * bw;
      if (f % 2 === 0) s += `<rect class="ec-band" x="${x0}" y="${Tp}" width="${bw}" height="${ph}"/>`;
      if (bw >= 20 || f % 2) s += `<text class="ec-lbl" x="${x0 + bw / 2}" y="${H - 8}" text-anchor="middle">${f}</text>`;
    }
    const dec = Math.round(lg(hi / lo)), stepD = dec > 5 ? 2 : 1;       // decade gridlines
    for (let d = 0; d <= dec; d += stepD) {
      const val = lo * Math.pow(10, d), y = Y(val);
      s += `<line class="ec-grid" x1="${L}" x2="${W - Rp}" y1="${y}" y2="${y}"/><text class="ec-lbl" x="${L - 6}" y="${y + 5}" text-anchor="end">${axisNum(val)}</text>`;
    }
    let tp = '';                                                     // target: dashed step line
    for (let i = 0; i < N; i++) {
      if (!tg[i]) continue;
      const y = Y(tg[i]).toFixed(1), xa = (L + i / N * pw).toFixed(1), xb = (L + (i + 1) / N * pw).toFixed(1);
      tp += (tp && tg[i - 1] ? `L${xa},${y}` : `M${xa},${y}`) + `L${xb},${y}`;
    }
    s += `<path class="ec-target" d="${tp}"/>`;
    const dup = {}, pts = v.shows.map(x => { const k = dup[x.s] = (dup[x.s] || 0) + 1; return {x, px: X(x.n) + (k - 1) * Math.min(6, pw / N * .4), py: Y(x.applause)}; });
    if (pts.length > 1) s += `<path class="ec-line" d="M${pts.map(p => p.px.toFixed(1) + ',' + p.py.toFixed(1)).join('L')}"/>`;
    for (const p of pts) {                                           // markers
      const {x, px, py} = p, head = x.k === 2;
      const tip = `Show ${x.n}, ${festName(x.f)} ${SLOT[x.k]}: ${fmt(x.applause)} vs ${fmt(x.target)}${x.pass ? '' : ', missed'}${x.sponsored ? ', sponsored' : ''}${x.encore ? ', encore' : ''}`;
      s += `<g><title>${esc(tip)}</title>`;
      if (x.sponsored) s += `<circle class="ec-ring" cx="${px}" cy="${py}" r="10"/>`;
      if (!x.pass) s += `<circle class="ec-halo" cx="${px}" cy="${py}" r="7"/>${cross(px, py, 5)}` + (head ? crown(px, py - 14, 'ec-crown miss') : '');
      else if (head) s += crown(px, py, 'ec-crown');
      else s += `<circle class="ec-dot" cx="${px}" cy="${py}" r="4.5"/>`;
      s += `<circle class="ec-hit" cx="${px}" cy="${py}" r="12"/></g>`;
    }
    if (v.best && v.best.applause > 0) {                             // direct label: the best show
      const p = pts.find(q => q.x === v.best), anchor = p.px > W - 70 ? 'end' : p.px < L + 30 ? 'start' : 'middle';
      const y = p.py - 16 < Tp + 4 ? p.py + 28 : p.py - 16;
      s += `<text class="ec-val" x="${p.px}" y="${y}" text-anchor="${anchor}">${fmt(v.best.applause)}</text>`;
    }
    return `<svg class="end-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="end-h-chart end-chart-sum">${s}</svg>`;
  }

  function paretoSVG(items, W) {
    const H = 206, L = 50, Rp = 12, Tp = 14, Bp = 40, pw = W - L - Rp, ph = H - Tp - Bp;
    const maxBars = W < 420 ? 6 : 9;
    let bars = items;
    if (items.length > maxBars) {
      const rest = items.slice(maxBars - 1).reduce((a, b) => a + b.share, 0);
      bars = items.slice(0, maxBars - 1).concat([{key: 'other', name: 'everything else', mono: '…', share: rest}]);
    }
    const slot = pw / bars.length, bw = Math.min(24, slot * .6), Y = q => Tp + ph - q * ph;
    let s = '', cum = 0, vital = -1;
    [0, .5, 1].forEach(q => { s += `<line class="ec-grid" x1="${L}" x2="${W - Rp}" y1="${Y(q)}" y2="${Y(q)}"/><text class="ec-lbl" x="${L - 6}" y="${Y(q) + 5}" text-anchor="end">${q * 100}%</text>`; });
    const cums = bars.map(b => (cum += b.share));
    vital = cums.findIndex(c => c >= .799);
    s += `<line class="ep-80" x1="${L}" x2="${W - Rp}" y1="${Y(.8)}" y2="${Y(.8)}"/><text class="ec-lbl" x="${W - Rp}" y="${Y(.8) + 20}" text-anchor="end">80%</text>`;
    bars.forEach((b, i) => {
      const cx = L + slot * (i + .5), h = Math.max(2, b.share * ph), x = cx - bw / 2, y = Y(0) - h, r = Math.min(4, h / 2, bw / 2);
      const cls = b.key === 'other' || i > vital ? 'ep-bar dim' : 'ep-bar';
      s += `<g><title>${esc(cap(b.name))}: ${pct(b.share)} of your applause</title>` +
        `<path class="${cls}" d="M${x},${Y(0)}V${y + r}Q${x},${y} ${x + r},${y}H${x + bw - r}Q${x + bw},${y} ${x + bw},${y + r}V${Y(0)}Z"/>` +
        `<rect class="ec-hit" x="${cx - slot / 2}" y="${Tp}" width="${slot}" height="${ph}"/></g>`;
      const ly = Y(0) + 14;                                            // x label: colour shape + monogram
      if (b.key === 'crowd') s += `<g class="ep-crowd"><circle cx="${cx - 6}" cy="${ly - 3}" r="3"/><circle cx="${cx + 6}" cy="${ly - 3}" r="3"/><circle cx="${cx}" cy="${ly - 5}" r="3.4"/><path d="M${cx - 11},${ly + 6}q5,-8 11,-8q6,0 11,8z"/></g>`;
      else if (b.key !== 'other') s += `<path class="ep-shape" style="fill:var(--c-${esc(b.col || 'W')})" d="${shapeD(b.col, cx, ly, 6)}"/>`;
      s += `<text class="ec-val" x="${cx}" y="${H - 6}" text-anchor="middle">${esc(b.key === 'crowd' ? 'Crowd'.slice(0, slot >= 56 ? 5 : 2) : b.mono)}</text>`;
    });
    let path = '';
    bars.forEach((b, i) => { path += (i ? 'L' : 'M') + (L + slot * (i + .5)).toFixed(1) + ',' + Y(cums[i]).toFixed(1); });
    s += `<path class="ep-cum" d="${path}"/>`;
    bars.forEach((b, i) => { s += `<circle class="ep-dot" cx="${L + slot * (i + .5)}" cy="${Y(cums[i])}" r="4"/>`; });
    if (bars[0] && bars[0].share * ph > 30) s += `<text class="ep-in" x="${L + slot / 2}" y="${Y(bars[0].share) + 20}" text-anchor="middle">${pct(bars[0].share)}</text>`;
    return {svg: `<svg class="end-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="end-h-pareto end-pareto-cap">${s}</svg>`, bars, vital};
  }
  function paretoCaption(items) {
    let c = 0;
    const few = [];
    for (const it of items) { few.push(it); c += it.share; if (c >= .8) break; }
    const names = few.map(it => it.name);
    if (few.length === 1) return `${cap(names[0])} alone made ${pct(few[0].share)} of your applause.`;
    if (few.length <= 4) return `${cap(andList(names))} made ${pct(c)} of your applause.`;
    return `Your applause was spread wide: it took ${few.length} kinds of firework to make 80% of it.`;
  }

  /* ============================================================
     Rendering
  ============================================================ */
  function headline() {
    if (v.won) return {eyebrow: '', main: v.endless ? 'The Afterparty went till dawn!' : 'Happy New Year!'};
    const where = `${festName(v.last.f)}, show ${v.last.n}`;
    return {eyebrow: v.endless ? 'The Afterparty wound down:' : 'The crowd went home:', main: where};
  }
  function tokenHTML(sh, extra) {
    return `<span class="end-tok" data-tok="${esc(sh.id)}|${esc(sh.col || '')}|${sh.star || 1}${sh.sil ? '|s' : ''}">` +
      `<b class="end-mono" aria-hidden="true">${esc(sh.sil ? '?' : mono(sh.id))}</b></span>${extra || ''}`;
  }
  function hydrateTokens(el) {
    el.querySelectorAll('.end-tok[data-tok]').forEach(t => {
      const [id, col, star, s] = t.getAttribute('data-tok').split('|');
      t.querySelectorAll('canvas').forEach(c => c.remove());
      t.prepend(tokenCanvas(id, col, +star || 1, s === 's'));
    });
  }

  function render(lr) {
    root = root || document.getElementById('end');
    if (!root) return;
    job++;
    busy = false; picker = null;
    out = {nearMiss: null, lesson: null, pareto: null};
    v = makeView(lr || (G && G.lastRun));
    const meta = (G && G.meta) || {};
    sel.kit = v.kit || meta.kit || 'apprentice';
    sel.renown = v.renown;
    sel.keep = null;
    const hd = headline(), kit = kitRow(v.kit), B = v.best;
    const rec = meta.records && meta.records.bestShow;
    const isRecord = B && rec && rec.score === B.applause && String(rec.seed) === String(v.seed);
    const ms = milestones(), near = ms.slice(0, 2), sil = silhouette(ms);
    const news = (v.lr.newUnlocks || []).map(u => (typeof u === 'string' ? {kind: row(D().SHELLS, u) ? 'shell' : 'other', id: u} : u)).filter(u => u && u.id != null);
    const keeps = keepOptions();
    const canParty = v.won && !v.endless && has(G, 'enterAfterparty');
    const lost = !v.won;

    root.setAttribute('aria-labelledby', 'end-title');
    root.setAttribute('data-won', v.won ? '1' : '0');
    root.innerHTML = `
<div class="end-card">
  <header class="end-head">
    ${v.won ? '<p class="end-spark" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span></p>' : ''}
    <h2 id="end-title" class="end-title">${hd.eyebrow ? `<span class="end-eyebrow">${esc(hd.eyebrow)}</span> ` : ''}<span class="end-where">${esc(hd.main)}</span></h2>
    ${v.won ? `<p class="end-sub">${v.endless ? 'The whole Afterparty, every show cleared.' : 'You fired the whole festival year, right through the Midnight Countdown.'}</p>` : ''}
    <ul class="end-tags" aria-label="Run details">
      <li class="chip">Seed ${esc(v.seed)}</li><li class="chip">${esc(kit.name)}</li><li class="chip">Renown ${v.renown}</li>
      ${v.fair ? '<li class="chip chip-aah">☂ Fair Weather</li>' : ''}${v.daily ? '<li class="chip">Daily Show</li>' : ''}
    </ul>
  </header>
  <figure class="end-poster"><canvas id="end-poster" role="img" aria-label="Poster of your final rack: ${esc(andList(shellsOf({tubes: v.st.tubes}).map(shellName)) || 'an empty rack')}"></canvas></figure>
  <div class="end-grid">
    <div class="end-col">
      <section class="end-sec" aria-labelledby="end-h-chart">
        <h3 id="end-h-chart">Applause per show</h3>
        <ul class="end-legend" aria-hidden="true">
          <li><svg width="22" height="12"><path class="ec-line" d="M1,6H21"/><circle class="ec-dot" cx="11" cy="6" r="4"/></svg>Applause</li>
          <li><svg width="22" height="12"><path class="ec-target" d="M1,6H21"/></svg>Target</li>
          ${v.shows.some(x => !x.pass) ? `<li><svg width="14" height="14">${cross(7, 7, 5)}</svg>Missed</li>` : ''}
          ${v.shows.some(x => x.k === 2) ? `<li><svg width="18" height="14">${crown(9, 8, 'ec-crown')}</svg>Headliner</li>` : ''}
          ${v.shows.some(x => x.sponsored) ? '<li><svg width="18" height="18"><circle class="ec-ring" cx="9" cy="9" r="7"/></svg>Sponsored</li>' : ''}
        </ul>
        <div class="end-plot" id="end-chart"></div>
        <p class="vh" id="end-chart-sum">Festivals along the bottom, Applause on a log scale. ${v.shows.filter(x => x.pass).length} of ${v.shows.length} shows passed.</p>
        <table class="vh"><caption>Applause and target by show</caption><tr><th>Show</th><th>Applause</th><th>Target</th><th>Result</th></tr>
          ${v.shows.map(x => `<tr><td>${x.n}</td><td>${fmt(x.applause)}</td><td>${fmt(x.target)}</td><td>${x.pass ? 'pass' : 'miss'}${x.sponsored ? ', sponsored' : ''}</td></tr>`).join('')}</table>
      </section>
      <section class="end-sec end-best" aria-labelledby="end-h-best">
        <h3 id="end-h-best">Best show</h3>
        ${B ? `<p class="end-stat"><span class="end-big">${fmt(B.applause)}</span><span class="end-stat-txt">show ${B.n} · ${esc(festName(B.f))} ${SLOT[B.k]}${B.target ? ` · ${(B.applause / B.target).toFixed(1)}× the target` : ''}</span>
          ${isRecord ? '<span class="chip chip-aah">New record</span>' : ''}${B.encore ? '<span class="chip">Encore!</span>' : ''}</p>` : '<p>No shows lit.</p>'}
      </section>
      ${lost ? '<section class="end-sec end-note end-near" aria-labelledby="end-h-near"><h3 id="end-h-near">How close</h3><div id="end-near" aria-live="polite"><p class="end-wait">Working out how close you came…</p></div></section>' : ''}
      <section class="end-sec end-note end-lesson" aria-labelledby="end-h-lesson"><h3 id="end-h-lesson">Lesson</h3><p id="end-lesson" aria-live="polite">${lost ? '<span class="end-wait">Thinking it over…</span>' : esc(lessonOf(null))}</p></section>
    </div>
    <div class="end-col">
      <section class="end-sec" aria-labelledby="end-h-unl">
        <h3 id="end-h-unl">Next unlocks</h3>
        ${news.length ? `<ul class="end-news">${news.slice(0, 4).map(u => { const nm = u.kind === 'shell' ? shellRow(u.id).name : u.kind === 'kit' ? kitRow(u.id).name + ' kit' : u.kind === 'renown' ? 'Renown ' + u.id : (row(D().MILESTONES, u.id) || row(D().FUSIONS, u.id) || {name: cap(u.id)}).name;
          return `<li class="end-new">${u.kind === 'shell' ? tokenHTML({id: u.id, col: shellRow(u.id).col === '*' ? 'R' : shellRow(u.id).col}) : '<span class="end-new-ico" aria-hidden="true">✦</span>'}<span><b>Just unlocked</b> ${esc(nm)}</span></li>`; }).join('')}</ul>` : ''}
        ${near.map(m => `<div class="end-ms"><div class="end-ms-top"><b>${esc(m.name)}</b><span class="num">${m.value}/${m.goal}${m.d && m.d.delta ? ` <span class="chip chip-aah">+${m.d.delta}</span>` : ''}</span></div>
          <div class="end-bar" role="progressbar" aria-label="${esc(m.name)}" aria-valuemin="0" aria-valuemax="${m.goal}" aria-valuenow="${m.value}"><i style="width:${Math.round(m.value / m.goal * 100)}%"></i></div>
          ${unlocksOf(m) ? `<p class="end-dim">Unlocks ${esc(unlocksOf(m))}</p>` : ''}</div>`).join('') || '<p class="end-dim">Everything is unlocked. Try a higher Renown.</p>'}
        ${sil ? `<div class="end-sil">${tokenHTML({id: sil.id, col: sil.col, sil: !!sil.sil})}<div><b>${esc(sil.label)}</b><p class="end-dim">${esc(sil.hint)}</p></div></div>` : ''}
      </section>
      <section class="end-sec" aria-labelledby="end-h-pareto">
        <h3 id="end-h-pareto">What made your applause</h3>
        <div id="end-pareto"><p class="end-wait">Adding up the cheers…</p></div>
      </section>
      <section class="end-sec" aria-labelledby="end-h-keep">
        <h3 id="end-h-keep">Keepsake</h3>
        <p class="end-dim" id="end-keep-d">Take one Common shell into your next run. It starts in the Crate.</p>
        <div class="end-keep" role="radiogroup" aria-labelledby="end-h-keep" aria-describedby="end-keep-d">
          ${keeps.map((k, i) => `<button type="button" role="radio" class="end-kopt" aria-checked="false" data-keep="${i}" tabindex="-1" aria-label="${esc(shellName(k))}">${tokenHTML(k)}<span class="end-kname">${esc(shellRow(k.id).name)}</span></button>`).join('')}
          <button type="button" role="radio" class="end-kopt end-knone" aria-checked="true" data-keep="none" tabindex="0"><span class="end-tok end-tok-none" aria-hidden="true">—</span><span class="end-kname">None</span></button>
        </div>
      </section>
      <section class="end-sec" aria-label="More options">
        <div class="end-more" id="end-more"></div>
        <div class="end-pick" id="end-pick" hidden></div>
      </section>
    </div>
  </div>
  <div class="end-actions">
    <button type="button" id="run-it-back" class="btn btn-primary" data-end="again" data-autofocus autofocus>Run it back<kbd class="end-kbd" aria-hidden="true">R</kbd></button>
    ${canParty ? '<button type="button" class="btn end-party" data-end="party">Afterparty</button>' : ''}
  </div>
</div>`;
    renderMore();
    hydrateTokens(root);
    lastW = 0;
    paintCharts(true);
    savePoster();
    startJobs();
  }

  function renderMore() {
    const el = root && root.querySelector('#end-more');
    if (!el) return;
    const ks = kits(), rmax = renownMax(), meta = G.meta || {};
    const daily = ((meta.unlocked || []).includes('m_win') || unlockedAll());
    el.innerHTML = `
      <button type="button" class="btn" data-end="replay">Replay seed</button>
      <button type="button" class="btn" data-end="kit" aria-expanded="${picker === 'kit'}" aria-controls="end-pick"${ks.length < 2 ? ' aria-disabled="true"' : ''}>Kit: ${esc(kitRow(sel.kit).name)} <span aria-hidden="true">▾</span></button>
      <button type="button" class="btn" data-end="renown" aria-expanded="${picker === 'renown'}" aria-controls="end-pick"${rmax < 1 ? ' aria-disabled="true"' : ''}>Renown ${sel.renown} <span aria-hidden="true">▾</span></button>
      <button type="button" class="btn" data-end="logbook">Logbook</button>
      ${daily ? '<button type="button" class="btn" data-end="daily">Daily Show</button>' : ''}`;
    const pk = root.querySelector('#end-pick');
    if (!picker) { pk.hidden = true; pk.innerHTML = ''; return; }
    pk.hidden = false;
    if (picker === 'kit') {
      pk.setAttribute('aria-label', 'Choose a kit');
      pk.innerHTML = ks.map(k => `<button type="button" class="end-opt" data-kit="${esc(k.id)}" aria-pressed="${k.id === sel.kit}"><b>${esc(k.name)}</b>${k.text || k.desc || k.rule ? `<span>${esc(k.text || k.desc || k.rule)}</span>` : ''}</button>`).join('');
    } else {
      pk.setAttribute('aria-label', 'Choose a Renown level');
      let h = '';
      for (let l = 0; l <= rmax; l++) h += `<button type="button" class="end-opt" data-renown="${l}" aria-pressed="${l === sel.renown}"><b>Renown ${l}</b><span>${esc(l ? renownText(l) : 'No modifiers')}</span></button>`;
      if (v.fair) h += '<p class="end-dim">Fair Weather is on: wins do not raise your Renown.</p>';
      pk.innerHTML = h;
    }
  }

  function paintCharts(force) {
    if (!root || !v) return;
    const plot = root.querySelector('#end-chart'), cv = root.querySelector('#end-poster');
    const W = Math.floor((plot && plot.clientWidth) || 0);
    if (!W || (!force && W === lastW)) return;
    lastW = W;
    plot.innerHTML = applauseSVG(W);
    if (cv) paintPoster(cv, posterOf(), {width: cv.clientWidth});
    if (out.pareto) paintPareto();
    if (document.fonts && document.fonts.load && !paintCharts.fontWait) {    // repaint once Fraunces arrives
      paintCharts.fontWait = true;
      document.fonts.load('600 26px Fraunces').then(() => { if (cv && cv.isConnected) paintPoster(cv, posterOf(), {width: cv.clientWidth}); }, () => {});
    }
  }
  function paintPareto() {
    const el = root && root.querySelector('#end-pareto');
    if (!el) return;
    const items = out.pareto;
    if (!items || !items.length) { el.innerHTML = '<p class="end-dim">No shows to add up yet.</p>'; return; }
    const W = Math.floor(el.clientWidth || 300), p = paretoSVG(items, W);
    el.innerHTML = `<div class="end-plot">${p.svg}</div><p class="end-cap" id="end-pareto-cap">${esc(paretoCaption(items))}</p>
      <ul class="end-key">${p.bars.map((b, i) => `<li${i > p.vital || b.key === 'other' ? ' class="dim"' : ''}>${b.key === 'crowd' ? '<b>Crowd</b>' : b.key === 'other' ? '<b>…</b>' : `<b>${esc(b.mono)}</b>`} ${esc(b.key === 'crowd' ? 'the Crowd' : b.key === 'other' ? 'everything else' : b.name)} <span class="num">${pct(b.share)}</span></li>`).join('')}</ul>`;
  }

  /* ---------- async jobs: near-miss → lesson, then Pareto (all within 1 s) ---------- */
  function startJobs() {
    const deadline = now() + 900, S = sim();
    const finishNear = r => {
      out.nearMiss = r;
      const el = root.querySelector('#end-near');
      if (el) el.innerHTML = nearMissLines(r).map(t => `<p>${esc(t)}</p>`).join('');
      out.lesson = lessonOf(r);
      const ls = root.querySelector('#end-lesson');
      if (ls) ls.textContent = out.lesson;
    };
    const pareto = () => sliced(paretoGen(deadline), items => { out.pareto = items || []; paintPareto(); });
    if (v.won) { out.lesson = lessonOf(null); pareto(); return; }
    const fp = v.fp, L = v.last;
    const rules = L.rules.length ? L.rules : (fp && has(S, 'rulesFor') ? call(S, 'rulesFor', fp, fp.show) || [] : []);
    const ctx = {fp, rules, target: L.target, baseTarget: baseTarget(L.s), applause: L.applause};
    let gen = null;
    if (fp && has(S, 'nearMiss') && S.nearMiss.constructor && S.nearMiss.constructor.name === 'GeneratorFunction') gen = S.nearMiss(fp, rules, ctx);
    else if (fp && has(S, 'resolveShow') && fp.tubes) gen = nearMissGen(ctx, deadline);
    else if (fp && has(S, 'nearMiss')) gen = (function* () { yield; return call(S, 'nearMiss', fp, rules); })();
    if (!gen) { finishNear(null); pareto(); return; }
    sliced(gen, r => { finishNear(r); pareto(); });
  }

  /* ---------- persistence through GAME ---------- */
  function savePoster() {
    const p = posterOf();
    if (!p || p.key === savedKey) return;
    savedKey = p.key;
    const list = Array.isArray((G.meta || {}).posters) ? G.meta.posters.slice() : [];
    if (list.some(x => x && x.key === p.key)) return;
    list.push(p);
    call(G, 'setMeta', {posters: list.slice(-5)});
  }
  function setKeep(i) {
    const opts = keepOptions();
    sel.keep = i === 'none' ? null : opts[+i] || null;
    root.querySelectorAll('.end-kopt').forEach(b => {
      const on = b.getAttribute('data-keep') === String(i);
      b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1;
    });
    call(G, 'setMeta', {keepsake: sel.keep});
    const A = typeof AUDIO === 'object' && AUDIO;
    call(A, 'ui', 'pluck', {col: sel.keep ? sel.keep.col : 'W'});
  }

  /* ---------- actions ---------- */
  const newSeed = () => Math.random().toString(36).slice(2, 7);
  function leave() {
    job++;
    try { if (has(G, 'top') && G.top() === 'end') G.close('end'); } catch (e) { warn('close', e); }
  }
  function start(o) {
    if (busy) return;
    busy = true;
    leave();
    call(G, 'newRun', Object.assign({kit: sel.kit, renown: sel.renown, keepsake: sel.keep}, o));
  }
  const runItBack = () => start({seed: newSeed()});
  function onClick(e) {
    const b = e.target.closest('button');
    if (!b || !root.contains(b)) return;
    const act = b.getAttribute('data-end');
    if (b.hasAttribute('data-keep')) return setKeep(b.getAttribute('data-keep'));
    if (b.hasAttribute('data-kit')) { sel.kit = b.getAttribute('data-kit'); call(G, 'setMeta', {kit: sel.kit}); return closePicker('kit'); }
    if (b.hasAttribute('data-renown')) {
      sel.renown = +b.getAttribute('data-renown');
      call(G, 'setMeta', {renown: Object.assign({}, typeof (G.meta || {}).renown === 'object' ? G.meta.renown : {max: renownMax()}, {selected: sel.renown})});
      return closePicker('renown');
    }
    switch (act) {
      case 'again': return runItBack();
      case 'replay': return start({seed: v.seed, replay: true});
      case 'party': if (!busy) { busy = true; leave(); call(G, 'enterAfterparty'); } return;
      case 'logbook': return call(G, 'open', 'logbook');
      case 'daily': {
        const d = new Date(), ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        return start({seed: call(sim(), 'dailySeed', ds) || 'daily-' + ds, kit: 'apprentice', renown: 0, daily: true});
      }
      case 'kit': case 'renown':
        if (b.getAttribute('aria-disabled') === 'true') return;
        picker = picker === act ? null : act;
        renderMore();
        focusSel(picker ? '#end-pick [aria-pressed="true"]' : `[data-end="${act}"]`);
        call(typeof AUDIO === 'object' && AUDIO, 'ui', 'tick');
    }
  }
  function closePicker(which) {
    picker = null;
    renderMore();
    focusSel(`[data-end="${which}"]`);
    call(typeof AUDIO === 'object' && AUDIO, 'ui', 'tick');
  }
  function focusSel(q) { const el = root && root.querySelector(q); if (el) el.focus({preventScroll: false}); }

  /* ---------- 'end'-scope keys ---------- */
  function onKey(e) {
    if (!isOpen()) return false;
    const k = e.key, ae = document.activeElement;
    const done = () => { if (e && typeof e.preventDefault === 'function') e.preventDefault(); return true; };
    if (k === 'Escape') {
      if (picker) { closePicker(picker); return done(); }
      return done();                       // nothing to fall back to behind the end screen
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (k === 'r' || k === 'R') { runItBack(); return done(); }
    if (k === 'Enter') {
      const onControl = ae && root.contains(ae) && ae.matches('button,a,input,select,textarea') && ae.id !== 'run-it-back';
      if (onControl) return false;         // let the focused control activate itself
      runItBack();
      return done();
    }
    const arrow = {ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1}[k];
    if (arrow && ae && root.contains(ae)) {
      const group = ae.closest('.end-keep, .end-pick');
      if (!group) return false;
      const items = [...group.querySelectorAll('button')], i = items.indexOf(ae);
      const next = items[(i + arrow + items.length) % items.length];
      if (!next) return false;
      next.focus();
      if (group.classList.contains('end-keep')) setKeep(next.getAttribute('data-keep'));
      return done();
    }
    return false;
  }

  /* ---------- open / lifecycle ---------- */
  function isOpen() { return !!root && !root.hidden; }
  function show(lr) {
    render(lr);
    try { if (!isOpen() || !has(G, 'top') || G.top() !== 'end') call(G, 'open', 'end'); } catch (e) { warn('open', e); }
    if (root.hidden) root.hidden = false;           // no overlay stack available: show it ourselves
    const focusRIB = () => { const b = root.querySelector('#run-it-back'); if (b) b.focus({preventScroll: true}); root.scrollTop = 0; };
    focusRIB();
    requestAnimationFrame(() => { focusRIB(); paintCharts(false); });
    const hd = headline();
    call(G, 'announce', `${hd.eyebrow ? hd.eyebrow + ' ' : ''}${hd.main}. ${v.best ? 'Best show ' + fmt(v.best.applause) + '.' : ''}`, {assertive: false});
  }

  function init(game) {
    G = game || (typeof GAME === 'object' && GAME) || null;
    root = document.getElementById('end');
    if (!G || !root) return;
    root.addEventListener('click', onClick);
    call(G, 'onKey', 'end', onKey);
    call(G, 'on', 'runEnd', p => show((p && p.lastRun) || G.lastRun));
    call(G, 'on', 'runStart', () => { job++; if (isOpen() && has(G, 'top') && G.top() === 'end') call(G, 'close', 'end'); });
    call(G, 'on', 'settings', p => { if (p && (p.key === 'highContrast' || p.key === 'reducedMotion') && isOpen()) { hydrateTokens(root); paintCharts(true); paintPareto(); } });
    call(G, 'on', 'overlay', p => { if (p && p.name === 'end' && !p.open) job++; });
    const onResize = () => { if (isOpen()) requestAnimationFrame(() => { paintCharts(false); }); };
    call(G, 'on', 'resize', onResize);
    if (typeof ResizeObserver === 'function') new ResizeObserver(onResize).observe(root);
    else window.addEventListener('resize', onResize);
  }

  return {init, render, show, isOpen, posterOf, paintPoster, result: () => out};
})();
