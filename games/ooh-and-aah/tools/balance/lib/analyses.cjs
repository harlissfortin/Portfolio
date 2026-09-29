'use strict';
// The balance analyses: run configurations, the probes they need, and one function per analysis
// that turns run records into report rows ({metric, bot, value, gate, ref, status}) + detail lines.
//
// Status: OK (inside the gate) · FAIL (outside) · WARN (outside, but the 95% sampling interval
// at this seed count still reaches the gate) · INFO (no gate) · N/A (not run / not measurable).
// Reference values are the spec's v1.1 numbers (§12.2, 1,000 seeds unless noted).
const U = require('./util.cjs');
const { ARCH } = require('./spec-bots.cjs');
const { q, pct, wilson, seDiff, fest, fmtN, f1, f2, f3, p0, p1, sgn } = U;

const CORE = ['random', 'donothing', 'greedy', 'greedyMood', 'novice', 'human', 'oracle'];
const KITS = ['salvo', 'chemist', 'market', 'showman'];
const ARCHS = Object.keys(ARCH);
const HEADLINERS = ['rival', 'crossed', 'powercut', 'windshift', 'streetlights', 'ordinance', 'ferry', 'fog', 'shortfuse', 'critic', 'headwind', 'drizzle'];

// ---------------------------------------------------------------- run configurations
function configs() {
  const C = {};
  const add = (id, bot, opts, family, seeds, sweep) => { C[id] = { id, bot, opts: opts || {}, family: family || bot, seeds: seeds || null, sweep: !!sweep }; };
  for (const b of CORE) add(b, b);
  add('human.bold', 'human', { bold: true }, 'human', null, true);
  add('human.noSponsor', 'human', { noSponsor: true }, 'human', null, true);
  add('oracle.noSponsor', 'oracle', { noSponsor: true }, 'oracle', null, true);
  add('novice.fair', 'novice', { fairWeather: true }, 'novice', null, true);
  add('human.fair', 'human', { fairWeather: true }, 'human', null, true);
  add('oracle.start', 'oracle', { unlocked: [] }, 'oracle', null, true);
  add('human.start', 'human', { unlocked: [] }, 'human', null, true);
  for (const k of KITS) { add('oracle.kit.' + k, 'oracle', { kit: k }, 'oracle', null, true); add('human.kit.' + k, 'human', { kit: k }, 'human', null, true); }
  for (let r = 1; r <= 8; r++) { add('oracle.r' + r, 'oracle', { renown: r }, 'oracle', null, true); add('human.r' + r, 'human', { renown: r }, 'human', null, true); }
  for (const a of ARCHS) { add('monoH.' + a, 'mono', { arch: a, base: 'human' }, 'human', null, true); add('monoO.' + a, 'mono', { arch: a, base: 'oracle' }, 'oracle', null, true); }
  add('first.greedy', 'greedy', { firstRun: true, unlocked: [] }, 'greedy', ['first-show']);
  add('first.greedyMood', 'greedyMood', { firstRun: true, unlocked: [] }, 'greedyMood', ['first-show']);
  add('first.novice', 'novice', { firstRun: true, unlocked: [] }, 'novice', 'noise40');
  add('first.human', 'human', { firstRun: true, unlocked: [] }, 'human', 'noise40');
  add('replay.human', 'human', {}, 'human', 'replay');
  add('replay.oracle', 'oracle', {}, 'oracle', 'replay');
  for (const b of ['greedy', 'novice', 'human', 'oracle']) {
    add('xcheck.' + b, b, {}, b, 'xcheck'); C['xcheck.' + b].driver = 'other';
    add('native.' + b, b, {}, b, 'xcheck'); C['native.' + b].driver = 'native';
  }
  return C;
}

// ---------------------------------------------------------------- helpers
const row = (metric, bot, value, gate, ref, status, extra) => ({ metric, bot, value, gate, ref, status, ...(extra || {}) });
function propStatus(k, n, lo, hi) {
  if (!n) return 'N/A';
  const p = (100 * k) / n;
  if (p >= lo - 1e-9 && p <= hi + 1e-9) return 'OK';
  const [a, b] = wilson(k, n);
  return b >= lo && a <= hi ? 'WARN' : 'FAIL';
}
function diffStatus(d, se, lo, hi) {
  if (!Number.isFinite(d)) return 'N/A';
  if (d >= lo - 1e-9 && d <= hi + 1e-9) return 'OK';
  if (!Number.isFinite(se)) return 'FAIL';
  return d + 1.96 * se >= lo && d - 1.96 * se <= hi ? 'WARN' : 'FAIL';
}
const valStatus = (v, lo, hi) => (!Number.isFinite(v) ? 'N/A' : v >= lo && v <= hi ? 'OK' : 'FAIL');
// Quantile gate with sampling error: OK inside; WARN when the distribution-free 95% interval of the
// p-quantile (order statistics n·p ± 1.96·√(n·p·(1−p))) still reaches the gate; FAIL otherwise.
function quantStatus(arr, p, lo, hi) {
  const a = arr.filter(Number.isFinite).sort((x, y) => x - y); const n = a.length;
  const v = q(a, p); const st = valStatus(v, lo, hi); if (st !== 'FAIL' || !n) return st;
  const h = 1.96 * Math.sqrt(n * p * (1 - p)); const vl = a[Math.max(0, Math.floor(n * p - h))], vh = a[Math.min(n - 1, Math.ceil(n * p + h))];
  return vh >= lo && vl <= hi ? 'WARN' : 'FAIL';
}
const wins = Rs => Rs.filter(r => r.won).length;
const winPct = Rs => (Rs && Rs.length ? (100 * wins(Rs)) / Rs.length : NaN);
const winStr = Rs => (Rs && Rs.length ? `${p1(winPct(Rs))} (${wins(Rs)}/${Rs.length})` : 'not run');
const lit = r => r.shows.filter(x => !x.relit);
const showAt = (r, s) => r.shows.find(x => x.s === s);
const lastAt = (r, s) => { const a = r.shows.filter(x => x.s === s); return a[a.length - 1]; };
function deathDist(Rs) { const d = {}; for (const r of Rs) if (!r.won && r.lastS >= 0) { const f = fest(r.lastS); d[f] = (d[f] || 0) + 1; } return d; }
function fmtDist(d, n) { const tot = n || Object.values(d).reduce((a, b) => a + b, 0); return Object.keys(d).sort((a, b) => a - b).map(f => `F${f} ${p0((100 * d[f]) / tot)}`).join(', ') || '-'; }
// Pair two configs on the seeds they share (sweeps may use fewer seeds than the base runs).
function common(A, B) { if (!A || !B) return [null, null]; const sa = new Set(A.map(r => r.seed)), sb = new Set(B.map(r => r.seed)); return [A.filter(r => sb.has(r.seed)), B.filter(r => sa.has(r.seed))]; }
function minutes(r) { let t = 0; for (const x of r.shows) t += (x.s === 0 ? 10 : 12 + 6 * x.buys + 3 * x.arr) + 0.4 * x.b + 4; return t / 60; }
// Minutes as the v1.1 design scripts computed them: purchases only counted for planner bots
// (the greedy bots bypassed the buy log), "arranging" = the first four tubes' rack text changed.
function minutesRefCompat(r) {
  let t = 0, prev = null; const countBuys = !['greedy', 'greedyMood', 'donothing'].includes(r.bot);
  for (const x of r.shows) { const o = x.rack.split(' ').slice(0, 4).join(); const moved = prev !== null && o !== prev ? 1 : 0; t += (x.s === 0 ? 10 : 12 + (countBuys ? 6 * x.buys : 0) + 3 * moved) + 0.4 * x.b + 4; prev = o; }
  return t / 60;
}
const na = (metric, bot, gate, ref, why) => row(metric, bot, why || 'not run', gate, ref, 'N/A');

// ---------------------------------------------------------------- analyses
const A = [];
const def = (id, title, spec) => A.push({ id, title, ...spec });

// Relative CPU cost of one run (measured on src/sim.js: oracle ≈ 0.35 s, oracle with the headcost /
// regret / Countdown probes ≈ 1.1 s, human ≈ 0.25 s, mono ≈ 0.2 s, novice ≈ 0.13 s, the greedy bots ≈ 5 ms).
// Used to schedule the heaviest runs first and for the progress ETA.
function jobWeight(c, pr) {
  const base = c.bot === 'oracle' ? 3 : c.bot === 'human' ? 2 : c.bot === 'mono' ? 1.8 : c.bot === 'novice' ? 1 : 0.05;
  return base * (pr && (pr.hc || pr.regret || pr.cd) ? 3.2 : pr && pr.shap ? 1.2 : 1);
}
def('winrates', 'Win rates and deaths per bot', {
  needs: CORE,
  run(ctx) {
    const rows = [], details = [];
    const G = {
      random: { lo: 0, hi: 5, ref: '0% (400 seeds)', dref: 'F1 17%, F2 76%, F3 8%' },
      donothing: { lo: 0, hi: 5, ref: '0%', dref: '100% die in F2 (200 seeds)' },
      greedy: { lo: 0, hi: 5, ref: '0%', dref: 'F2 27%, F3 36%, F4 30%, F5 6%' },
      greedyMood: { ref: '0%', dref: 'F2 12%, F3 34%, F4 41%, F5 13%' },
      novice: { lo: 8, hi: 25, ref: '18.8%' },
      human: { lo: 40, hi: 60, ref: '50.7%' },
      oracle: { lo: 75, hi: 92, ref: '81.6%' },
    };
    for (const b of CORE) {
      const g = G[b], Rs = ctx.R[b];
      const gate = g.lo !== undefined ? `${g.lo}–${g.hi}%` : '—';
      if (!Rs) { rows.push(na('win %', b, gate, g.ref)); continue; }
      const k = wins(Rs), n = Rs.length;
      rows.push(row('win %', b, winStr(Rs), gate, g.ref, g.lo !== undefined ? propStatus(k, n, g.lo, g.hi) : 'INFO', { num: winPct(Rs) }));
      const d = deathDist(Rs), dead = n - k;
      const share = fs => { let c = 0; for (const f of fs) c += d[f] || 0; return c; };
      if (b === 'random') rows.push(row('deaths in F1–F2', b, `${p0(pct(share([1, 2]), dead))} (${fmtDist(d)})`, '≥ 75% ("dies in F1–F2")', '93% (' + g.dref + ')', propStatus(share([1, 2]), dead, 75, 100)));
      else if (b === 'donothing') rows.push(row('deaths by F2', b, `${p0(pct(share([1, 2]), dead))} (${fmtDist(d)})`, '100%', g.dref, share([1, 2]) === dead ? 'OK' : 'FAIL'));
      else if (b === 'greedy') rows.push(row('deaths in F2–F4', b, `${p0(pct(share([2, 3, 4]), dead))} (${fmtDist(d)})`, '≥ 70%', '93% (' + g.dref + ')', propStatus(share([2, 3, 4]), dead, 70, 100)));
      else details.push(`${b.padEnd(10)} deaths ${fmtDist(d)}${g.dref ? '   (v1.1: ' + g.dref + ')' : ''}`);
      const played = Rs.map(r => lit(r).length);
      const mins = Rs.map(minutes);
      details.push(`${b.padEnd(10)} shows played p10/p50/p90 ${q(played, 0.1)}/${q(played, 0.5)}/${q(played, 0.9)} · minutes p50 ${f1(q(mins, 0.5))} · ${f1(U.mean(Rs.map(r => r.ms)))} ms/run`);
      if (b === 'greedy' || b === 'greedyMood') {
        rows.push(row('median shows · minutes', b, `${q(played, 0.5)} shows · ${f1(q(mins, 0.5))} min (p10 ${f1(q(mins, 0.1))}, p90 ${f1(q(mins, 0.9))})`, b === 'greedyMood' ? '3–5 min (see firstrun)' : '—', b === 'greedy' ? 'median 8 shows, 2.7 min' : 'median 10 shows, 3.4 min', 'INFO'));
      }
    }
    return { rows, details };
  },
});

def('losses', 'Human losses by festival', {
  needs: ['human'], optional: ['novice', 'oracle'],
  run(ctx) {
    const rows = [], details = [];
    for (const b of ['human', 'novice', 'oracle']) {
      const Rs = ctx.R[b]; if (!Rs) { if (b === 'human') rows.push(na('losses in F6–F8', b, '≥ 75%', '91%')); continue; }
      const lost = Rs.filter(r => !r.won); const d = deathDist(Rs);
      const late = (d[6] || 0) + (d[7] || 0) + (d[8] || 0);
      if (b === 'human') rows.push(row('losses in F6–F8', b, `${p0(pct(late, lost.length))} of ${lost.length} (${fmtDist(d)})`, '≥ 75%', '91% (F5 8%, F6 21%, F7 23%, F8 48%)', propStatus(late, lost.length, 75, 100)));
      const kill = {};
      for (const r of lost) { const h = r.shows[r.shows.length - 1]; if (!h) continue; const k = h.r || (h.sp ? 'sponsored' : 'plain'); kill[k] = (kill[k] || 0) + 1; }
      const gap = lost.map(r => { const i = r.shows.findIndex(x => !x.pass); return i < 0 ? 0 : r.shows.length - 1 - i; });
      details.push(`${b.padEnd(7)} losses ${lost.length}: ${fmtDist(d)} | run-ending miss by rule: ${Object.entries(kill).sort((a, c) => c[1] - a[1]).map(([k, v]) => k + ' ' + v).join(', ')}`);
      details.push(`${b.padEnd(7)} a losing run ends p50 ${q(gap, 0.5)} / p90 ${q(gap, 0.9)} shows after its first miss${b === 'human' ? '  (v1.1 §5.4: 2 / 3)' : ''}`);
    }
    return { rows, details };
  },
});

def('countdown', 'Countdown arrivals and natural order', {
  needs: ['human'], optional: ['oracle', 'novice'], probes: { oracle: ['cd'] },
  run(ctx) {
    const rows = [], details = [];
    const G = { human: { gate: '≥ 70%', lo: 70, ref: '76% (665 arrivals)' }, oracle: { gate: '—', ref: '89%' }, novice: { gate: '—', ref: '64%' } };
    for (const b of ['human', 'oracle', 'novice']) {
      const Rs = ctx.R[b]; const g = G[b];
      if (!Rs) { rows.push(na('Countdown arrivals that pass', b, g.gate, g.ref)); continue; }
      const arr = Rs.filter(r => showAt(r, 23)); const pass = arr.filter(r => showAt(r, 23).pass).length;
      rows.push(row('Countdown arrivals that pass', b, `${p0(pct(pass, arr.length))} (${pass}/${arr.length} arrivals)`, g.gate, g.ref, g.lo ? propStatus(pass, arr.length, g.lo, 100) : 'INFO'));
      const rat = arr.map(r => { const h = showAt(r, 23); return h.a / h.t; });
      details.push(`${b.padEnd(7)} Countdown Applause/target p10 ${f2(q(rat, 0.1))} · p50 ${f2(q(rat, 0.5))} · p90 ${f2(q(rat, 0.9))}`);
    }
    const O = ctx.R.oracle;
    if (O) {
      const cds = O.map(r => showAt(r, 23)).filter(h => h && h.cd).map(h => h.cd);
      if (cds.length) {
        const pr = key => pct(cds.filter(c => c[key] >= c.T).length, cds.length);
        const ratio = cds.map(c => (c.best > 0 ? c.keep / c.best : NaN)).filter(Number.isFinite);
        rows.push(row('natural order: show-23 rack kept vs best order', 'oracle', `${p0(pr('keep'))} vs ${p0(pr('best'))} pass`, 'informational', '78% vs 89%', 'INFO'));
        details.push(`oracle  Countdown (${cds.length} arrivals): best order passes ${p0(pr('best'))} | show-23 rack unchanged ${p0(pr('keep'))} | one swap sweep from it ${p0(pr('hill1'))} | unchanged/best p10 ${f2(q(ratio, 0.1))} p50 ${f2(q(ratio, 0.5))}   (v1.1: 89% | 78% | 81% | 0.29 / 0.68)`);
      } else rows.push(na('natural order: show-23 rack kept vs best order', 'oracle', 'informational', '78% vs 89%', 'no probe data'));
    }
    return { rows, details };
  },
});

def('sponsor', 'Sponsors: no-Sponsor penalty and the bold gamble', {
  needs: ['human', 'human.noSponsor', 'oracle', 'oracle.noSponsor', 'human.bold'],
  run(ctx) {
    const rows = [], details = [];
    for (const [b, ref] of [['human', '−8 (50.5 → 42.5), 400 seeds'], ['oracle', '−9 (81.5 → 72.5), 400 seeds']]) {
      const [X, Y] = common(ctx.R[b], ctx.R[b + '.noSponsor']);
      if (!X || !X.length) { rows.push(na('no-Sponsor penalty (points)', b, '5–18', ref)); continue; }
      const d = winPct(X) - winPct(Y);
      rows.push(row('no-Sponsor penalty (points)', b, `${sgn(-d, 1)} (${f1(winPct(X))} → ${f1(winPct(Y))}, n=${X.length})`, '5–18', ref, diffStatus(d, seDiff(wins(X), X.length, wins(Y), Y.length), 5, 18)));
    }
    const [H, Bd] = common(ctx.R.human, ctx.R['human.bold']);
    if (H && H.length) {
      const spStats = Rs => { let p = 0, f = 0; for (const r of Rs) for (const x of r.shows) if (x.sp) { if (x.pass) p++; else f++; } return { p, f }; };
      const b = spStats(Bd), h = spStats(H);
      rows.push(row('bold: sponsored-miss rate', 'human-bold', `${p1(pct(b.f, b.p + b.f))} (${f2(b.f / Bd.length)} per run)`, '3–10%', '3.7% (0.35 per run)', propStatus(b.f, b.p + b.f, 3, 10)));
      const d = winPct(Bd) - winPct(H);
      rows.push(row('bold win − cautious win (points)', 'human-bold', `${sgn(d, 1)} (${f1(winPct(Bd))} vs ${f1(winPct(H))})`, '±5', '49.4 vs 50.7', diffStatus(d, seDiff(wins(Bd), Bd.length, wins(H), H.length), -5, 5)));
      rows.push(row('Sponsor passes per run (bold vs cautious)', 'human', `${f1(b.p / Bd.length)} vs ${f1(h.p / H.length)}`, '—', '9.3 vs 8.2', 'INFO'));
      rows.push(row('cautious human sponsored misses per run', 'human', f2(h.f / H.length), '—', '0.00', 'INFO'));
    } else rows.push(na('bold: sponsored-miss rate', 'human-bold', '3–10%', '3.7%'));
    return { rows, details };
  },
});

function festMedians(Rs) {
  const out = [];
  for (let fe = 1; fe <= 8; fe++) { const a = []; for (const r of Rs) for (const x of r.shows) if (!x.relit && x.s !== 23 && fest(x.s) === fe) a.push(x.a / x.bt); out.push(q(a, 0.5)); }
  return out;
}
def('ratio', 'Median Applause/target by festival', {
  needs: ['oracle', 'human'],
  run(ctx) {
    const rows = [], details = [];
    const O = ctx.R.oracle, H = ctx.R.human;
    if (O) {
      const m = festMedians(O);
      const gateOk = mm => { for (let fe = 5; fe < 8; fe++) if (!(mm[fe] >= mm[fe - 1] - 0.1)) return false; return true; };
      const ok = gateOk(m);
      let st = m.slice(4).every(Number.isFinite) ? (ok ? 'OK' : 'FAIL') : 'N/A', boot = '';
      if (st === 'FAIL') {
        // bootstrap over runs (fixed-seed resampling): WARN if ≥ 5% of resamples pass the gate
        let x = 0x9e3779b9; const rnd = () => ((x = (Math.imul(x ^ (x >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0) / 4294967296);
        const B = 200; let pass = 0;
        for (let b = 0; b < B; b++) { const S = O.map(() => O[Math.floor(rnd() * O.length)]); if (gateOk(festMedians(S))) pass++; }
        boot = ` · bootstrap ${p0(pct(pass, B))} pass`; if (pass / B >= 0.05) st = 'WARN';
      }
      rows.push(row('F5→F8 median Applause/target', 'oracle', m.slice(4).map(f2).join(', ') + boot, 'non-decreasing (±0.1)', '2.70, 2.67, 2.61, 3.58', st));
      details.push(`oracle F1–F8: ${m.map(f2).join(' ')}   (v1.1: 2.64 3.94 3.62 3.04 2.70 2.67 2.61 3.58)`);
    } else rows.push(na('F5→F8 median Applause/target', 'oracle', 'non-decreasing (±0.1)', '2.70, 2.67, 2.61, 3.58'));
    if (H) {
      const m = festMedians(H);
      rows.push(row('F1–F8 median Applause/target', 'human', m.map(f2).join(' '), 'informational', '2.56 3.63 3.15 2.52 2.11 1.99 1.90 2.33', 'INFO'));
      const hp = [14, 17, 20].map(s => q(H.map(r => lit(r).find(x => x.s === s)).filter(Boolean).map(x => x.a / x.bt), 0.1));
      rows.push(row('Headliner p10 Applause/target F5/F6/F7', 'human', hp.map(f2).join(' / '), 'informational', '≈ 0.8–0.9', 'INFO'));
    }
    for (const [b, Rs] of [['oracle', O], ['human', H]]) {
      if (!Rs) continue;
      let l50 = '', l10 = '';
      for (let s = 0; s < 24; s++) { const a = Rs.map(r => lit(r).find(x => x.s === s)).filter(Boolean).map(x => x.a / x.bt); l50 += (s % 3 === 0 ? '| ' : '') + f1(q(a, 0.5)) + ' '; l10 += (s % 3 === 0 ? '| ' : '') + f1(q(a, 0.1)) + ' '; }
      details.push(`${b.padEnd(6)} p50 by show ${l50}`); details.push(`${b.padEnd(6)} p10 by show ${l10}`);
    }
    return { rows, details };
  },
});

const HREF = {
  human: { rival: 28, crossed: 22, powercut: 17, windshift: 14, streetlights: 14, ordinance: 11, ferry: 7, fog: 3, shortfuse: 3, critic: 1, headwind: 0, drizzle: 0 },
  oracle: { rival: 11, powercut: 8, streetlights: 5, crossed: 5, ordinance: 4, windshift: 3, ferry: 2, fog: 1, shortfuse: 1, critic: 0, headwind: 0, drizzle: 0 },
  novice: { rival: 49, crossed: 47, windshift: 33, powercut: 31, streetlights: 30, ordinance: 17, ferry: 16, fog: 9, shortfuse: 7, critic: 2, drizzle: 0, headwind: 0 },
};
const LUCKREF = { rival: -2, powercut: -2, crossed: -5, streetlights: 3, windshift: -7, ordinance: 1, ferry: 8, fog: 2, shortfuse: 1, critic: 3, drizzle: 2, headwind: -1 };
function missRates(Rs) { const m = {}; for (const r of Rs) for (const x of r.shows) if (x.s % 3 === 2 && x.s < 23 && x.r && !x.relit) { (m[x.r] = m[x.r] || [0, 0])[1]++; if (!x.pass) m[x.r][0]++; } return m; }
def('headliners', 'Headliner miss rates and draw luck', {
  needs: ['human', 'oracle'], optional: ['novice'],
  run(ctx) {
    const rows = [], details = [];
    for (const [b, cap] of [['human', 30], ['oracle', 15]]) {
      const Rs = ctx.R[b]; if (!Rs) { rows.push(na('Headliner miss rate when played', b, '≤ ' + cap + '% each', '')); continue; }
      const m = missRates(Rs);
      for (const [k, [miss, n]] of Object.entries(m).sort((a, c) => c[1][0] / c[1][1] - a[1][0] / a[1][1])) {
        rows.push(row('miss rate when played: ' + k, b, `${p0(pct(miss, n))} (${miss}/${n})`, '≤ ' + cap + '%', HREF[b][k] !== undefined ? HREF[b][k] + '%' : '-', n < 10 ? 'INFO' : propStatus(miss, n, 0, cap)));
      }
    }
    const N = ctx.R.novice;
    if (N) { const m = missRates(N); details.push('novice miss rate when played: ' + Object.entries(m).sort((a, c) => c[1][0] / c[1][1] - a[1][0] / a[1][1]).map(([k, [x, n]]) => `${k} ${p0(pct(x, n))}(${n})`).join(' ') + '   (v1.1: rival 49, crossed 47, windshift 33, powercut 31 …)'); }
    const H = ctx.R.human;
    if (H) {
      const ids = [...new Set(H.flatMap(r => r.heads))].filter(Boolean);
      for (const k of ids.sort()) {
        const w = H.filter(r => r.heads.includes(k)), wo = H.filter(r => !r.heads.includes(k));
        const d = winPct(w) - winPct(wo);
        const st = w.length < 10 || wo.length < 10 ? 'INFO' : diffStatus(d, seDiff(wins(w), w.length, wins(wo), wo.length), -10, 10);
        rows.push(row('draw luck P(win|drawn) − P(win|not): ' + k, 'human', `${sgn(d, 0)} (${p0(winPct(w))}/${p0(winPct(wo))}, n${w.length})`, '±10', LUCKREF[k] !== undefined ? sgn(LUCKREF[k]) : '-', st));
      }
      const hard = ['rival', 'powercut', 'crossed', 'streetlights', 'windshift']; const hs = {};
      for (const r of H) { const n = hard.filter(k => r.heads.includes(k)).length; (hs[n] = hs[n] || [0, 0])[1]++; if (r.won) hs[n][0]++; }
      details.push('human win rate by # of hard late Headliners drawn: ' + Object.entries(hs).map(([n, [w, t]]) => `${n}: ${p0(pct(w, t))} (n${t})`).join(', ') + '   (v1.1: 1: 63%, 2: 50%, 3: 48%, 4: 32%)');
    }
    return { rows, details };
  },
});

const HCREF = { headwind: [0.70, 0.57, 0.69, 0.57, 0.69], rival: [0.73, 0.59, 0.72, 0.59, 0.72], ordinance: [0.79, 0.56, 0.78, 0.56, 0.78], powercut: [0.79, 0.51, 0.77, 0.46, 0.77], crossed: [0.87, 0.61, 0.29, 0.15, 0.68], windshift: [0.88, 0.63, 0.25, 0.10, 0.75], ferry: [0.91, 0.83, 0.91, 0.83, 0.91], streetlights: [0.93, 0.53, 0.90, 0.38, 0.90], critic: [0.93, 0.76, 0.93, 0.71, 0.93], drizzle: [1.00, 0.59, 1.00, 0.50, 1.00], shortfuse: [1.00, 0.83, 1.00, 0.81, 1.00], fog: [1.00, 0.76, 1.00, 0.75, 1.00] };
def('headcost', 'Headliner cost (oracle; best-arranged score ÷ best with no rule)', {
  needs: ['oracle'], probes: { oracle: ['hc'] },
  run(ctx) {
    const rows = [], details = [];
    const O = ctx.R.oracle; if (!O) return { rows: [na('Headliner cost p10', 'oracle', '≥ 0.4', '')], details };
    const cost = {};
    for (const r of O) for (const x of r.shows) if (x.hc) (cost[x.r] = cost[x.r] || []).push(x.hc);
    const ent = Object.entries(cost).sort((a, b) => q(a[1].map(x => x.best), 0.5) - q(b[1].map(x => x.best), 0.5));
    if (!ent.length) rows.push(na('Headliner cost p10', 'oracle', '≥ 0.4', 'lowest p10 0.51 (Power Cut)', 'no probe data'));
    for (const [k, v] of ent) {
      const b = v.map(x => x.best), kp = v.map(x => x.kept), m = v.map(x => x.match); const rf = HCREF[k];
      let st = quantStatus(b, 0.1, 0.4, Infinity);
      rows.push(row('cost: ' + k, 'oracle', `p50 ${f2(q(b, 0.5))} · p10 ${f2(q(b, 0.1))} (n=${v.length})`, 'p10 ≥ 0.4', rf ? `p50 ${f2(rf[0])} · p10 ${f2(rf[1])}` : '-', st));
      details.push(`${k.padEnd(12)} n=${String(v.length).padStart(4)} best p50 ${f2(q(b, 0.5))} p10 ${f2(q(b, 0.1))} | plain order kept p50 ${f2(q(kp, 0.5))} p10 ${f2(q(kp, 0.1))} | kept + Match p50 ${f2(q(m, 0.5))}${rf ? `   (v1.1 kept ${f2(rf[2])}/${f2(rf[3])}, Match ${f2(rf[4])})` : ''}`);
    }
    return { rows, details };
  },
});

def('rain', 'Rain check used in wins', {
  needs: ['novice'], optional: ['human', 'oracle'],
  run(ctx) {
    const rows = [];
    for (const [b, gate, lo, hi, ref] of [['novice', '10–40%', 10, 40, '17%'], ['human', '—', null, null, '8%'], ['oracle', '—', null, null, '2%']]) {
      const Rs = ctx.R[b]; if (!Rs) { rows.push(na('rain check used in wins', b, gate, ref)); continue; }
      const W = Rs.filter(r => r.won); const k = W.filter(r => r.shows.some(x => x.rain)).length;
      rows.push(row('rain check used in wins', b, `${p0(pct(k, W.length))} (${k}/${W.length} wins)`, gate, ref, lo !== null ? propStatus(k, W.length, lo, hi) : 'INFO'));
    }
    return { rows, details: [] };
  },
});

def('crowdshare', 'Crowd share of Ooh at the Countdown', {
  needs: ['human'], optional: ['oracle', 'novice'],
  run(ctx) {
    const rows = [], details = [];
    for (const [b, ref, cref] of [['human', '18%', 152], ['oracle', '20%', 191], ['novice', '21%', 168]]) {
      const Rs = ctx.R[b]; if (!Rs) { rows.push(na('Crowd share of Countdown Ooh p50', b, '15–25%', ref)); continue; }
      const cd = Rs.map(r => showAt(r, 23)).filter(Boolean);
      const sh = cd.map(h => (h.ooh > 0 ? (100 * h.cheer) / h.ooh : NaN)).filter(Number.isFinite);
      rows.push(row('Crowd share of Countdown Ooh p50', b, `${p1(q(sh, 0.5))} (n=${sh.length})`, '15–25%', ref, quantStatus(sh, 0.5, 15, 25)));
      const s12 = Rs.map(r => lit(r).find(x => x.s === 11)).filter(Boolean).map(h => (h.ooh > 0 ? (100 * h.cheer) / h.ooh : NaN)).filter(Number.isFinite);
      details.push(`${b.padEnd(6)} Crowd at the Countdown p50 ${q(cd.map(h => h.cr), 0.5) ?? '-'} (v1.1 ${cref}) · share p90 ${p1(q(sh, 0.9))} · show-12 share p50 ${p1(q(s12, 0.5))} (v1.1 human 16.9%)`);
    }
    return { rows, details };
  },
});

const PWREF = { human: { base: '56%', hi: 'Nishiki +22 (n=51)', lo: 'Peony −21 (n=72)' }, oracle: { base: '82%', hi: 'Saturn +18 (n=18)', lo: 'Strobe −22 (n=173)' } };
def('pickwin', 'Pick/win outliers at the show-18 snapshot', {
  needs: ['human', 'oracle'],
  run(ctx) {
    const rows = [], details = [];
    for (const b of ['human', 'oracle']) {
      const Rs = ctx.R[b]; const rf = PWREF[b];
      if (!Rs) { rows.push(na('pick/win |Δ| (n ≥ 15)', b, '≤ 25 points', rf.hi + ' … ' + rf.lo)); continue; }
      const alive = Rs.filter(r => lit(r).length > 17);
      const base = alive.length ? wins(alive) / alive.length : NaN;
      const it = {};
      for (const r of alive) for (const id of U.shellIds(lit(r)[17].rack)) { (it[id] = it[id] || [0, 0])[0]++; if (r.won) it[id][1]++; }
      const list = Object.entries(it).filter(([, v]) => v[0] >= 15).map(([k, v]) => ({ k, n: v[0], w: v[1], d: (v[1] / v[0] - base) * 100 })).sort((a, c) => c.d - a.d);
      rows.push(row('P(win | alive at show 18)', b, `${p0(100 * base)} (n=${alive.length})`, '—', rf.base, 'INFO'));
      const st = x => { if (Math.abs(x.d) <= 25) return 'OK'; const p = x.w / x.n; const se = 100 * Math.sqrt((p * (1 - p)) / x.n); return Math.abs(x.d) - 1.96 * se <= 25 ? 'WARN' : 'FAIL'; };
      if (list.length) {
        const hi = list[0], lo = list[list.length - 1];
        rows.push(row('largest pick/win Δ', b, `${hi.k} ${sgn(hi.d)} (n=${hi.n})`, '≤ +25', rf.hi, st(hi)));
        rows.push(row('smallest pick/win Δ', b, `${lo.k} ${sgn(lo.d)} (n=${lo.n})`, '≥ −25', rf.lo, st(lo)));
        for (const x of list.slice(1, -1)) if (Math.abs(x.d) > 25) rows.push(row('pick/win outlier', b, `${x.k} ${sgn(x.d)} (n=${x.n})`, '±25', '-', st(x)));
      }
      details.push(`${b.padEnd(6)} show-18 pick/win (n ≥ 15): ` + list.map(x => `${x.k} ${sgn(x.d)}(${x.n})`).join(', '));
      const pres = {}; for (const r of Rs) { const h = r.shows[r.shows.length - 1]; if (h) for (const id of U.shellIds(h.rack)) pres[id] = (pres[id] || 0) + 1; }
      details.push(`${b.padEnd(6)} final-rack presence top: ` + Object.entries(pres).sort((a, c) => c[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${p0(pct(v, Rs.length))}`).join(', '));
    }
    return { rows, details };
  },
});

def('regret', 'Decision regret (oracle)', {
  needs: ['oracle'], probes: { oracle: ['regret'] },
  run(ctx) {
    const rows = []; const O = ctx.R.oracle;
    if (!O) return { rows: [na('decision regret', 'oracle', '', '')], details: [] };
    const all = O.flatMap(r => r.regret || []);
    if (!all.length) return { rows: [na('decision regret', 'oracle', '', '', 'no regret data')], details: [] };
    for (const [lbl, arr, ref] of [['early (shows 1–12)', all.filter(x => x.s < 12).map(x => x.gap), ['0.097', '13%', '18%']], ['late (shows 17–24)', all.filter(x => x.s >= 16).map(x => x.gap), ['0.049', '6%', '31%']]]) {
      const clear = arr.filter(x => x > 0.3).length, near = arr.filter(x => x < 0.02).length;
      rows.push(row(lbl + ' median gap', 'oracle', `${f3(q(arr, 0.5))} (n=${arr.length})`, '—', ref[0], 'INFO'));
      rows.push(row(lbl + ' clear-cut (> 0.3)', 'oracle', p0(pct(clear, arr.length)), '5–20%', ref[1], propStatus(clear, arr.length, 5, 20)));
      rows.push(row(lbl + ' near-ties (< 0.02)', 'oracle', p0(pct(near, arr.length)), '≤ 35%', ref[2], propStatus(near, arr.length, 0, 35)));
    }
    return { rows, details: [] };
  },
});

function thresholdAccuracy(Rs) {
  const out = [];
  for (let s = 0; s < 24; s++) {
    const a = Rs.map(r => { const h = lit(r).find(x => x.s === s); return h ? { x: Math.log(Math.max(1e-9, h.a) / h.bt), y: r.won } : null; }).filter(Boolean);
    if (a.length < 20) { out.push(null); continue; }
    a.sort((p, c) => p.x - c.x);
    const W = a.filter(p => p.y).length; let best = Math.max(W, a.length - W), leW = 0;
    for (let i = 0; i < a.length; i++) { if (a[i].y) leW++; if (i + 1 < a.length && a[i + 1].x === a[i].x) continue; best = Math.max(best, i + 1 - leW + (W - leW)); }
    out.push((100 * best) / a.length);
  }
  return out;
}
def('dpoint', 'Decision point (single-threshold accuracy)', {
  needs: ['oracle'], optional: ['human', 'novice'],
  run(ctx) {
    const rows = [], details = [];
    for (const [b, ref] of [['oracle', 'show 19 (base rate 82%)'], ['human', '86% at show 23; ≥ 90% only at the Countdown'], ['novice', '≤ 85% before the Countdown']]) {
      const Rs = ctx.R[b]; if (!Rs) { if (b === 'oracle') rows.push(na('first show at ≥ 90%', b, 'show ≥ 18', ref)); continue; }
      const acc = thresholdAccuracy(Rs); const first = acc.findIndex(x => x !== null && x >= 90);
      const val = first < 0 ? 'never' : `show ${first + 1} (${p0(acc[first])})`;
      const pre = acc.slice(0, 23).filter(x => x !== null);
      if (!acc.some(x => x !== null)) { rows.push(row('first show at ≥ 90% accuracy', b, `too few runs (${Rs.length}; needs ≥ 20 alive per show)`, b === 'oracle' ? 'show ≥ 18' : '—', ref, 'N/A')); continue; }
      const bestPre = pre.length ? Math.max(...pre) : NaN, atPre = pre.length ? acc.indexOf(bestPre) + 1 : 0;
      rows.push(row('first show at ≥ 90% accuracy', b, val + (pre.length ? ` · best before the Countdown ${p0(bestPre)} (show ${atPre})` : ''), b === 'oracle' ? 'show ≥ 18' : '—', ref, b === 'oracle' ? (first < 0 || first + 1 >= 18 ? 'OK' : 'FAIL') : 'INFO'));
      details.push(`${b.padEnd(6)} accuracy by show: ` + acc.map((x, s) => (x === null ? '' : `${s + 1}:${Math.round(x)}`)).filter(Boolean).join(' '));
    }
    return { rows, details };
  },
});

def('pool', 'Starting pool vs full pool', {
  needs: ['oracle', 'oracle.start', 'human', 'human.start'],
  run(ctx) {
    const rows = [];
    for (const [b, ref] of [['oracle', '85.0 vs 81.6'], ['human', '56.5 vs 50.7 (200 seeds)']]) {
      const [F, S0] = common(ctx.R[b], ctx.R[b + '.start']);
      if (!F || !F.length) { rows.push(na('starting − full pool (points)', b, '±10', ref)); continue; }
      const d = winPct(S0) - winPct(F);
      rows.push(row('starting − full pool (points)', b, `${sgn(d, 1)} (${f1(winPct(S0))} vs ${f1(winPct(F))}, n=${F.length})`, '±10', ref, diffStatus(d, seDiff(wins(S0), S0.length, wins(F), F.length), -10, 10)));
    }
    return { rows, details: [] };
  },
});

const KITREF = { salvo: [82.0, 59.0], chemist: [78.0, 47.0], market: [78.5, 47.0], showman: [84.5, 56.5] };
def('kits', 'Starting kits', {
  needs: ['oracle', 'human', ...KITS.flatMap(k => ['oracle.kit.' + k, 'human.kit.' + k])],
  run(ctx) {
    const rows = [], details = ['v1.1 reference (measured before the Saturn trim, §12.3): Apprentice 81.6 / 50.7 · Salvo Crew 82.0 / 59.0 · Chemist 78.0 / 47.0 · Night Market 78.5 / 47.0 · Showman 84.5 / 56.5'];
    for (const k of KITS) {
      const [OA, OK] = common(ctx.R.oracle, ctx.R['oracle.kit.' + k]);
      if (OK && OK.length) rows.push(row(`kit ${k} win %`, 'oracle', `${winStr(OK)} (Apprentice ${f1(winPct(OA))})`, '70–92%', f1(KITREF[k][0]) + '%', propStatus(wins(OK), OK.length, 70, 92)));
      else rows.push(na(`kit ${k} win %`, 'oracle', '70–92%', f1(KITREF[k][0]) + '%'));
      const [HA, HK] = common(ctx.R.human, ctx.R['human.kit.' + k]);
      if (HK && HK.length) { const d = winPct(HK) - winPct(HA); rows.push(row(`kit ${k} − Apprentice (points)`, 'human', `${sgn(d, 1)} (${f1(winPct(HK))} vs ${f1(winPct(HA))})`, '±10', sgn(KITREF[k][1] - 50.7, 1), diffStatus(d, seDiff(wins(HK), HK.length, wins(HA), HA.length), -10, 10))); }
      else rows.push(na(`kit ${k} − Apprentice (points)`, 'human', '±10', sgn(KITREF[k][1] - 50.7, 1)));
    }
    return { rows, details };
  },
});

const RENREF = { oracle: [81.6, 66.5, 52.5, 52.5, 37.5, 25.5, 17.0, 14.0, 12.0], human: [50.7, 35.5, 23.0, 18.5, 23.5, 9.0, 6.5, 5.5, 5.0] };
def('renown', 'Renown ladder (cumulative)', {
  needs: ['oracle', 'human', ...[1, 2, 3, 4, 5, 6, 7, 8].flatMap(r => ['oracle.r' + r, 'human.r' + r])],
  run(ctx) {
    const rows = [], details = [];
    for (const b of ['oracle', 'human']) {
      const lv = [ctx.R[b], ...[1, 2, 3, 4, 5, 6, 7, 8].map(r => ctx.R[b + '.r' + r])];
      if (lv.slice(1).every(x => !x)) { rows.push(na('Renown ladder', b, 'non-increasing ±5', '')); continue; }
      const seeds = lv.filter(Boolean).map(Rs => new Set(Rs.map(r => r.seed)));
      const inter = s => seeds.every(x => x.has(s));
      const sub = lv.map(Rs => (Rs ? Rs.filter(r => inter(r.seed)) : null));
      const W = sub.map(Rs => (Rs ? winPct(Rs) : NaN));
      const n = sub[1] ? sub[1].length : 0;
      for (let r = 1; r <= 8; r++) {
        const prev = W[r - 1], cur = W[r];
        let st = !Number.isFinite(cur) ? 'N/A' : !Number.isFinite(prev) ? 'OK' : diffStatus(cur - prev, seDiff(wins(sub[r]), sub[r].length, wins(sub[r - 1]), sub[r - 1].length), -Infinity, 5);
        let gate = `≤ R${r - 1} + 5`;
        if (r === 8) { const lo = b === 'oracle' ? 10 : 3; gate += ` and ≥ ${lo}%`; if (Number.isFinite(cur)) { const s8 = propStatus(wins(sub[8]), sub[8].length, lo, 100); if (s8 === 'FAIL' || (s8 === 'WARN' && st === 'OK')) st = s8; } }
        rows.push(row(`Renown ${r} win %`, b, Number.isFinite(cur) ? `${f1(cur)} (R${r - 1} ${f1(prev)})` : 'not run', gate, f1(RENREF[b][r]), st));
      }
      details.push(`${b.padEnd(6)} R0–R8 (n=${n} common seeds): ${W.map(f1).join(' · ')}   (v1.1: ${RENREF[b].map(f1).join(' · ')})`);
    }
    return { rows, details };
  },
});

def('fair', 'Fair Weather', {
  needs: ['novice', 'novice.fair'], optional: ['human.fair', 'human'],
  run(ctx) {
    const rows = [];
    const [N0, NF] = common(ctx.R.novice, ctx.R['novice.fair']);
    if (NF && NF.length) { const a = winPct(N0), b = winPct(NF); rows.push(row('Fair Weather win-rate ratio', 'novice', `×${f2(b / a)} (${f1(a)} → ${f1(b)}, n=${NF.length})`, '≥ ×2', '16.8% → 49.5% (400 seeds)', Number.isFinite(b / a) ? (b >= 2 * a ? 'OK' : 'FAIL') : b > 0 ? 'OK' : 'N/A')); }
    else rows.push(na('Fair Weather win-rate ratio', 'novice', '≥ ×2', '16.8% → 49.5%'));
    const HF = ctx.R['human.fair'];
    if (HF) { const relit = HF.filter(r => r.st.relights > 0).length; rows.push(row('Fair Weather win %', 'human', `${winStr(HF)} · relights used in ${relit} runs`, '—', '87.3%', 'INFO')); }
    return { rows, details: [] };
  },
});

const ARCHREF = { human: { canopy: 19.5, mono: 10.0, rainbow: 19.5, salvo: 19.5, thunder: 20.5, crowd: 9.0 }, oracle: { canopy: 22.0, mono: 26.0, rainbow: 36.5, salvo: 22.0, thunder: 36.5, crowd: 18.0 } };
def('archetype', 'Archetype spread (monomaniac bots)', {
  needs: ARCHS.flatMap(a => ['monoH.' + a, 'monoO.' + a]),
  run(ctx) {
    const rows = [], details = ['v1.1 reference measured before the Saturn trim (§12.3).'];
    for (const [pre, b] of [['monoH.', 'human'], ['monoO.', 'oracle']]) {
      const w = {}; for (const a of ARCHS) if (ctx.R[pre + a]) w[a] = ctx.R[pre + a];
      const keys = Object.keys(w); if (!keys.length) { rows.push(na('archetype spread', b + '-based', '±10 of mean', '')); continue; }
      const m = U.mean(keys.map(a => winPct(w[a])));
      for (const a of keys) { const v = winPct(w[a]); rows.push(row(`${a} win % (Δ vs mean ${f1(m)})`, b + '-based', `${winStr(w[a])} ${sgn(v - m, 1)}`, '±10 of mean', `${f1(ARCHREF[b][a])}`, Math.abs(v - m) <= 10 ? 'OK' : propStatus(wins(w[a]), w[a].length, m - 10, m + 10))); }
    }
    return { rows, details };
  },
});

const MS = [
  ['First Fusion', r => r.shows.some(x => x.fus && x.fus.length), 84, '1 / 84 / 87'],
  ['Busy Sky (8+ bursts, before the Countdown)', r => r.shows.some(x => x.s < 23 && x.b >= 8), 32, '18 / 32 / 42'],
  ['Monochrome Night', r => r.shows.some(x => x.mono === true), 30, '4 / 30 / 29'],
  ['Full Spectrum', r => r.shows.some(x => x.cu >= 3 || x.cf >= 4), 17, '2 / 17 / 27'],
  ['Packed House (Crowd 40)', r => r.st.maxCrowd >= 40, 96, '16 / 96 / 99'],
  ['Triple-break (own a ★3)', r => r.st.star3, 81, '33 / 81 / 93'],
  ['Headliner Hunter (pass F4 Headliner)', r => { const h = showAt(r, 11); return !!(h && h.pass); }, 87, '2 / 87 / 97'],
  ['Rigger (3 rigs at once)', r => r.st.rigsMax >= 3, 97, '– / 97 / –'],
];
def('milestones', 'Milestone reachability (novice, per run)', {
  needs: ['novice'], optional: ['greedy', 'human'],
  run(ctx) {
    const rows = [], details = [];
    const N = ctx.R.novice;
    for (const [name, fn, ref] of MS) {
      if (!N) { rows.push(na(name, 'novice', '≥ 12%', ref + '%')); continue; }
      const k = N.filter(fn).length;
      const unknown = name === 'Monochrome Night' && N.every(r => r.shows.every(x => x.mono === null));
      rows.push(row(name, 'novice', unknown ? 'SIM reports no per-burst colours' : `${p0(pct(k, N.length))}`, '≥ 12%', ref + '%', unknown ? 'N/A' : propStatus(k, N.length, 12, 100)));
    }
    for (const b of ['greedy', 'novice', 'human']) { const Rs = ctx.R[b]; if (!Rs) continue; details.push(`${b.padEnd(6)} ` + MS.map(([n, fn]) => `${n.split(' (')[0]} ${p0(pct(Rs.filter(fn).length, Rs.length))}`).join(' · ')); }
    details.push('v1.1 §4.11 (greedy / novice / human): ' + MS.map(([n, , , g]) => `${n.split(' (')[0]} ${g}`).join(' · '));
    return { rows, details };
  },
});

def('mood', 'Crowd mood buckets at lighting (human)', {
  needs: ['human'],
  run(ctx) {
    const rows = []; const H = ctx.R.human; if (!H) return { rows: [na('mood buckets', 'human', '', '')], details: [] };
    const B = { restless: [0, 0], hopeful: [0, 0], eager: [0, 0] }; let n = 0;
    for (const r of H) for (const x of r.shows) { const ratio = x.a / x.t; const k = ratio < 0.85 ? 'restless' : ratio < 1.25 ? 'hopeful' : 'eager'; B[k][0]++; if (x.pass) B[k][1]++; n++; }
    const REF = { restless: '2% of shows, 0% pass', hopeful: '6% of shows, 68% pass', eager: '92% of shows, 100% pass' };
    for (const k of ['restless', 'hopeful', 'eager']) {
      const [c, p] = B[k];
      if (k === 'hopeful') rows.push(row('Hopeful: share of shows · pass %', 'human', `${p0(pct(c, n))} · ${p0(pct(p, c))} pass (n=${c})`, 'pass % straddles (5–95%)', REF[k], c ? propStatus(p, c, 5, 95) : 'N/A'));
      else rows.push(row(`${k[0].toUpperCase() + k.slice(1)}: share of shows · pass %`, 'human', `${p0(pct(c, n))} · ${p0(pct(p, c))} pass`, '—', REF[k], 'INFO'));
    }
    return { rows, details: ['Buckets from Applause ÷ effective target at lighting (the SIM mood reads the same resolve); see invariants for a check against the SIM\'s own moodAtLight.'] };
  },
});

const APREF = { human: ['1,272 / 1,990 / 3,024', '6,009 / 9,823 / 17K', '14K / 25K / 47K', '127K / 320K / 1.07M'], oracle: ['1,537 / 2,235 / 3,367', '7,788 / 12K / 20K', '20K / 34K / 60K', '173K / 572K / 2.66M'] };
const APREF50 = { human: [1990, 9823, 25000, 320000], oracle: [2235, 12000, 34000, 572000] };
def('applause', 'Applause percentiles at shows 6/12/18/24', {
  needs: ['human', 'oracle'],
  run(ctx) {
    const rows = [], details = [];
    for (const b of ['human', 'oracle']) {
      const Rs = ctx.R[b]; if (!Rs) continue;
      [5, 11, 17, 23].forEach((s, i) => {
        const a = Rs.map(r => lastAt(r, s)).filter(Boolean).map(x => x.a);
        rows.push(row(`show ${s + 1} p10 / p50 / p90`, b, `${fmtN(q(a, 0.1))} / ${fmtN(q(a, 0.5))} / ${fmtN(q(a, 0.9))} (p50 ${sgn(100 * (q(a, 0.5) / APREF50[b][i] - 1))}% vs ref)`, '—', APREF[b][i], 'INFO'));
      });
    }
    const H = ctx.R.human;
    if (H) { const bu = {}; for (const r of H) for (const x of r.shows) { const k = x.s === 0 ? 's1' : x.s === 23 ? 'CD' : 'F' + fest(x.s); (bu[k] = bu[k] || []).push(x.b); } details.push('human median bursts: ' + ['s1', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'CD'].filter(k => bu[k]).map(k => `${k} ${q(bu[k], 0.5)}`).join(', ') + '   (v1.1: 3 (show 1), 4 (F1), 5 (F2–F3), 6 (F4–F6), 7 (F7–F8), 14 (Countdown))'); }
    return { rows, details };
  },
});

// Afterparty targets (§5.10) and hand-built all-★3 racks (design-time ceiling.js).
function afterpartyTargets() { const sig2 = v => Number(v.toPrecision(2)); const base = [80000]; for (let n = 10; n <= 12; n++) base.push(base[base.length - 1] * (n - 6)); const E = []; for (const b of base) for (const m of [1, 1.3, 1.8]) E.push(sig2(b * m)); return E; }
const CEIL_RACKS = {
  'Prism-Mortar rainbow': ['willow:A palm:R chrys:G palm:B tourbillon prism', ['tall', 'brass', 'tall', 'tall', 'spotlight', 'mortar']],
  'Pure-Sky Red mono': ['palm:R heart palm:R strontium crossette:R puresky', ['tall', 'brass', 'tall', 'brass', 'spotlight', 'mortar']],
  'Thunder canopy': ['willow glitter chrys:G crossette:R comet:G thunder', ['tall', 'brass', 'spotlight', 'brass', 'spotlight', 'mortar']],
  'Crowd/Saturn': ['girandola smiley:A girandola smiley:R crest saturn', ['mortar', 'brass', 'brass', 'tall', 'brass', 'brass']],
  'Cake canopy': ['willow glitter chrys:G chrys:G crossette:G cake:G', ['tall', 'brass', 'spotlight', 'spotlight', 'brass', 'mortar']],
  'Salvo Barrage': ['candle:G candle:R crackle echo horsetail barrage', ['mortar', 'brass', 'brass', 'brass', 'spotlight', 'brass']],
};
function ceiling(api, SB) {
  const E = afterpartyTargets(); const pairs = [['drizzle', 'critic'], ['fog', 'ordinance'], ['ferry', 'streetlights'], ['powercut', 'rival']];
  const out = [];
  for (const [name, [spec, rigs]] of Object.entries(CEIL_RACKS)) {
    let u = 1;
    const t = spec.split(' ').map((tok, i) => { let [id, col] = tok.split(':'); let star = 3; if (id.includes('*')) { const p = id.split('*'); id = p[0]; star = +p[1]; } const row = api.shell(id); return { shell: { uid: u++, id, col: col || row.col, star, paid: 0 }, rig: rigs[i] || null }; });
    const crowd = 250; const n = SB.exhaustive(t, [], crowd).score; const hd = pairs.map(p => SB.exhaustive(t, p, crowd).score);
    let cleared = 0; for (let i = 0; i < 12; i++) { const sc = i % 3 === 2 ? hd[Math.floor(i / 3)] : n; if (sc >= E[i]) cleared++; else break; }
    out.push({ name, normal: n, heads: hd, cleared });
  }
  return out;
}

def('loops', 'Degenerate loops and the Afterparty', {
  needs: ['human'], optional: ['oracle'], probes: { oracle: ['endless'] }, main: true,
  run(ctx) {
    const rows = [], details = [];
    const H = ctx.R.human;
    if (H) {
      rows.push(row('rerolls per run', 'human', f1(U.mean(H.map(r => r.st.rerolls))), '—', '2.5', 'INFO'));
      rows.push(row('pity cards per run', 'human', f1(U.mean(H.map(r => r.st.pity))), '—', '1.1', 'INFO'));
      const coins = H.flatMap(r => r.shows.filter(x => x.pass).map(x => x.$p));
      rows.push(row('coins held at payout p50 / p90', 'human', `$${q(coins, 0.5)} / $${q(coins, 0.9)}`, 'p90 < $25 (no stalling for interest)', '$3 / $9', valStatus(q(coins, 0.9), -Infinity, 24.999)));
      const bf = {}, nf = {}; for (const r of H) for (const x of r.shows) { const fe = fest(x.s); bf[fe] = (bf[fe] || 0) + x.buys; nf[fe] = (nf[fe] || 0) + 1; }
      details.push('human purchases per build by festival: ' + Object.keys(nf).map(fe => `F${fe} ${f2(bf[fe] / nf[fe])}`).join(' ') + '   (v1.1 buys/shop: 1.20 1.43 1.36 1.26 1.21 1.22 1.23 1.46)');
    }
    const all = Object.values(ctx.R).flat();
    const sells = all.reduce((a, r) => a + r.st.sells, 0), bad = all.reduce((a, r) => a + r.st.sellBad, 0);
    rows.push(row('sells returning max(1, floor(0.75 × paid))', 'all', `${sells - bad}/${sells}`, 'all (selling loses 25%)', 'always', sells ? (bad ? 'FAIL' : 'OK') : 'N/A'));
    if (ctx.ceiling) {
      const mx = Math.max(...ctx.ceiling.map(c => c.cleared));
      rows.push(row('hand-built all-★3 racks: Afterparty shows cleared', '—', ctx.ceiling.map(c => c.cleared).join(', ') + ' of 12', 'every rack < 12 (it ends by itself)', '2–7 of 12', mx < 12 ? 'OK' : 'FAIL'));
      for (const c of ctx.ceiling) details.push(`ceiling ${c.name.padEnd(22)} normal ${fmtN(c.normal).padStart(7)} | twin-twist Headliners ${c.heads.map(fmtN).join(' ')} | Afterparty cleared ${c.cleared}/12`);
      details.push('Afterparty targets F9–F12: ' + afterpartyTargets().map(fmtN).join(' '));
    }
    const O = ctx.R.oracle;
    if (O) {
      const ap = O.filter(r => r.after);
      if (ap.length) {
        const entered = ap.filter(r => r.after.entered);
        if (!entered.length) rows.push(row('oracle Afterparty runs', 'oracle', `endless not entered (${ap.length} wins tried)`, 'ends by itself', '—', 'N/A'));
        else {
          const cleared = entered.map(r => r.after.shows.filter(x => x.pass).length);
          const endless = entered.filter(r => r.after.phase === 'build').length;
          rows.push(row('oracle Afterparty shows cleared', 'oracle', `p50 ${q(cleared, 0.5)} · max ${Math.max(...cleared)} (n=${entered.length})`, 'max < 12; every run ends', '2–7 (hand-built)', Math.max(...cleared) < 12 && !endless ? 'OK' : 'FAIL'));
        }
      }
    }
    return { rows, details };
  },
});

def('firstrun', 'First run (greedy-mood proxy) and the curated seed', {
  needs: ['greedyMood'], optional: ['greedy', 'first.greedy', 'first.greedyMood', 'first.novice', 'first.human'],
  run(ctx) {
    const rows = [], details = ['Minutes use the §12.2 time model with purchases counted for every bot; the v1.1 scripts did not count the greedy bots\' purchases (ref-compatible values in brackets).'];
    const G = ctx.R.greedyMood;
    if (G) {
      const m = G.map(minutes), mc = G.map(minutesRefCompat), sh = G.map(r => lit(r).length);
      rows.push(row('first run minutes p50 (p10, p90)', 'greedyMood', `${f1(q(m, 0.5))} (${f1(q(m, 0.1))}, ${f1(q(m, 0.9))}) · ${q(sh, 0.5)} shows [ref-compat ${f1(q(mc, 0.5))}]`, '3–5 min', '3.4 (2.0, 4.5) · 10 shows', valStatus(q(m, 0.5), 3, 5)));
    } else rows.push(na('first run minutes p50', 'greedyMood', '3–5 min', '3.4'));
    const Gr = ctx.R.greedy;
    if (Gr) { const m = Gr.map(minutes), mc = Gr.map(minutesRefCompat); rows.push(row('median shows · minutes', 'greedy', `${q(Gr.map(r => lit(r).length), 0.5)} shows · ${f1(q(m, 0.5))} min [ref-compat ${f1(q(mc, 0.5))}]`, '—', '8 shows, 2.7 min', 'INFO')); }
    for (const [cfg, ref] of [['first.greedyMood', 'show 9, 3.0 min'], ['first.greedy', 'loses at show 4, 1.2 min']]) {
      const Rs = ctx.R[cfg]; if (!Rs || !Rs.length) continue; const r = Rs[0];
      rows.push(row('curated seed "first-show"', cfg.split('.')[1], `${r.won ? 'WON' : 'ends at show ' + (r.lastS + 1)} · ${f1(minutes(r))} min [ref-compat ${f1(minutesRefCompat(r))}]`, '—', ref, 'INFO'));
      details.push(`${cfg.split('.')[1].padEnd(10)} trace: ` + r.shows.slice(0, 12).map(x => `${x.s + 1}:${x.a}/${x.t}${x.pass ? (x.enc ? 'E' : '') : 'X'}`).join(' '));
    }
    for (const [cfg, ref] of [['first.novice', 'WIN 21/40, 11.5 min'], ['first.human', 'WIN 36/40, 10.9 min']]) {
      const Rs = ctx.R[cfg]; if (!Rs || !Rs.length) continue;
      const res = {}; for (const r of Rs) { const k = r.won ? 'WIN' : 'F' + fest(r.lastS); res[k] = (res[k] || 0) + 1; }
      rows.push(row(`curated seed, ${Rs.length} noise draws`, cfg.split('.')[1], `${Object.entries(res).map(([k, v]) => k + ' ' + v).join(', ')} · ${f1(q(Rs.map(minutes), 0.5))} min`, '—', ref, 'INFO'));
    }
    return { rows, details };
  },
});

function parseShapley(res) {
  if (!res || typeof res !== 'object') return null;
  const top = res.top || res; const values = res.values || null;
  const grab = o => { const tubes = {}; let crowd = 0, any = false;
    if (Array.isArray(o)) o.forEach((v, i) => { if (Number.isFinite(v)) { tubes[i] = v; any = true; } });
    else if (o && Array.isArray(o.tubes)) { o.tubes.forEach((v, i) => { const x = typeof v === 'object' && v ? v.value ?? v.share ?? v.v : v; if (Number.isFinite(x)) { tubes[i] = x; any = true; } }); crowd = +(o.crowd ?? 0) || 0; }
    else if (o) for (const [k, v] of Object.entries(o)) { if (/^\d+$/.test(k) && Number.isFinite(+v)) { tubes[+k] = +v; any = true; } else if (k.toLowerCase() === 'crowd' && Number.isFinite(+v)) { crowd = +v; any = true; } }
    return any ? { tubes, crowd, sum: Object.values(tubes).reduce((a, b) => a + b, 0) + crowd } : null; };
  return { top: grab(top), values: values ? grab(values) : null, applause: res.applause ?? null };
}
def('shapley', 'Shapley attribution (end-screen Pareto chart)', {
  needs: ['human'], probes: { human: ['shap'] },
  run(ctx) {
    const rows = [], details = [];
    const H = ctx.R.human; const shows = H ? H.flatMap(r => r.shap || []) : [];
    if (!shows.length) return { rows: [na('shapley values sum to the Applause', 'human', 'within 1e-6', 'exact', ctx.hasShapley ? 'no probe data' : 'SIM has no shapley()')], details };
    let kind = null, sumOk = 0, sumN = 0, agree = 0, neg = 0, errs = 0, parsed = 0, shareOk = 0; const ms = [], top = [];
    const close = (a, b, scale) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(scale));
    for (const x of shows) {
      if (x.err) { errs++; continue; }
      const P = parseShapley(x.sim); if (!P || !P.top) continue; parsed++;
      const own = x.own; const full = own.full;
      const ov = {}; own.occ.forEach((ti, k) => { ov[ti] = own.phi[k]; }); ov.crowd = own.phi[own.phi.length - 1];
      const pos = own.phi.reduce((a, v) => a + Math.max(0, v), 0) || 1;
      const osh = {}; for (const k of Object.keys(ov)) osh[k] = Math.max(0, ov[k]) / pos;
      // which form did the SIM return at top level: raw values (sum = Applause) or shares (sum = 1)?
      const topIsVal = close(P.top.sum, x.a, x.a), topIsShare = !topIsVal && close(P.top.sum, 1, 1);
      if (!kind) kind = topIsVal ? 'values' : topIsShare ? 'shares' + (P.values ? ' (+ .values)' : '') : 'unknown';
      const V = topIsVal ? P.top : P.values;
      if (V) { sumN++; if (close(V.sum, x.a, x.a)) sumOk++; }
      if (topIsShare) shareOk++;
      let ok = true;
      if (V) { for (const ti of own.occ) if (!close(V.tubes[ti] || 0, ov[ti], full)) ok = false; if (!close(V.crowd, ov.crowd, full)) ok = false; }
      if (topIsShare) { for (const ti of own.occ) if (!close(P.top.tubes[ti] || 0, osh[ti], 1)) ok = false; if (!close(P.top.crowd, osh.crowd, 1)) ok = false; }
      if (!V && !topIsShare) ok = false;
      if (ok) agree++;
      if (own.phi.some(v => v < -1e-9)) neg++;
      ms.push(x.simMs); top.push(Math.max(...Object.values(osh)));
    }
    const runs = H.filter(r => r.shap && r.shap.length).length;
    rows.push(row('shapley values sum to the Applause', 'human', sumN ? `${sumOk}/${sumN} shows (result: ${kind})` : `no raw values exposed (result: ${kind})`, 'all, within 1e-6', 'exact (§8.6)', sumN ? (sumOk === sumN ? 'OK' : 'FAIL') : 'N/A'));
    if (kind && kind.startsWith('shares')) rows.push(row('shares sum to 100%', 'human', `${shareOk}/${parsed} shows`, 'all', '100%', shareOk === parsed ? 'OK' : 'FAIL'));
    rows.push(row('agrees with the harness\'s exact Shapley', 'human', `${agree}/${parsed} shows`, 'all, within 1e-6', '—', parsed ? (agree === parsed ? 'OK' : 'FAIL') : 'N/A'));
    rows.push(row('shows with a negative contributor', 'human', `${p1(pct(neg, parsed))}`, '—', '< 0.5% (§8.6)', 'INFO'));
    rows.push(row('shapley() cost per run', 'human', `${f1((U.sum(ms) / Math.max(1, runs)))} ms (${runs} runs, ${shows.length} shows)`, '—', '≈ 30 ms per run (node)', 'INFO'));
    if (errs) rows.push(row('shapley() threw', 'human', `${errs} shows`, '0', '0', 'FAIL'));
    details.push(`top contributor share p50 ${f2(q(top, 0.5))}`);
    return { rows, details };
  },
});

def('invariants', 'SIM invariants and consistency (§11.7)', {
  needs: [], optional: ['replay.human', 'replay.oracle', 'human', 'oracle'], main: true,
  run(ctx) {
    const rows = [], details = [];
    const all = Object.values(ctx.R).flat();
    const tot = k => all.reduce((a, r) => a + (r.st[k] || 0), 0);
    const lights = tot('lights');
    rows.push(row('illegal actions issued by bots', ctx.driver, String(tot('illegal')), '0', '0', tot('illegal') ? 'FAIL' : 'OK'));
    const why = {}; for (const r of all) for (const [k, v] of Object.entries(r.st.illegalWhy || {})) why[k] = (why[k] || 0) + v;
    if (Object.keys(why).length) details.push('illegal actions by type:reason: ' + Object.entries(why).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ×${v}`).join(', '));
    rows.push(row('NaN / Infinity in Applause, Ooh or Aah', 'all', String(tot('nan')), '0', '0', tot('nan') ? 'FAIL' : 'OK'));
    rows.push(row('Applause ≥ 1e300', 'all', String(tot('huge')), '0', '0', tot('huge') ? 'FAIL' : 'OK'));
    rows.push(row('legalActions empty in build', 'all', String(tot('legalEmpty')), '0', '0', tot('legalEmpty') ? 'FAIL' : 'OK'));
    const fin = k => all.map(r => r.st[k]).filter(Number.isFinite); // native playRun records carry no per-step stats
    const tmA = fin('tubesMax'), tm = tmA.length ? Math.max(...tmA) : NaN;
    rows.push(row('max tubes', 'all', tmA.length ? String(tm) : 'not recorded', '≤ 6', '6', !tmA.length ? 'N/A' : tm <= 6 ? 'OK' : 'FAIL'));
    rows.push(row('SIM Applause ≠ resolveShow(rack as lit)', 'all', `${tot('mismatch')}/${lights} shows`, '0', '0', tot('mismatch') ? 'FAIL' : 'OK'));
    rows.push(row('pass verdict ≠ (Applause ≥ target)', 'all', `${tot('passMismatch')}/${lights} shows`, '0', '0', tot('passMismatch') ? 'FAIL' : 'OK'));
    const ms = tot('moodSeen');
    rows.push(row('moodAtLight ≠ bucket(Applause ÷ target)', 'all', ms ? `${tot('moodMismatch')}/${ms} shows` : 'SIM history has no moodAtLight', '0', '0', ms ? (tot('moodMismatch') ? 'FAIL' : 'OK') : 'N/A'));
    const ab = all.filter(r => r.abort);
    rows.push(row('runs aborted by the harness', 'all', String(ab.length), '0', '0', ab.length ? 'FAIL' : 'OK'));
    if (ab.length) details.push('aborted: ' + ab.slice(0, 6).map(r => `${r.cfg}#${r.seed}: ${r.abort}`).join(' | '));
    if (ctx.errors && ctx.errors.length) { rows.push(row('runs that threw', 'all', String(ctx.errors.length), '0', '0', 'FAIL')); details.push('errors: ' + ctx.errors.slice(0, 6).map(e => `${e.cfg}#${e.seed}: ${e.error}`).join(' | ')); }
    for (const b of ['human', 'oracle']) {
      const A2 = ctx.R['replay.' + b], A1 = ctx.R[b]; if (!A2 || !A1) continue;
      const key = r => r.hash || JSON.stringify(r.shows.map(x => [x.a, x.rack]));
      let same = 0, n = 0; for (const r of A2) { const o = A1.find(x => x.seed === r.seed); if (!o) continue; n++; if (key(o) === key(r)) same++; }
      rows.push(row('determinism: same seed + bot → same ' + (A2[0] && A2[0].hash ? 'hashState' : 'trace'), b, `${same}/${n} replays identical`, 'all', 'all', n ? (same === n ? 'OK' : 'FAIL') : 'N/A'));
    }
    const lm = tot('lightMs') / Math.max(1, lights); const lmA = fin('lightMsMax'), lmax = lmA.length ? Math.max(...lmA) : NaN;
    rows.push(row('step(light) wall time mean · max (as played)', 'all', `${f3(lm)} ms · ${f2(lmax)} ms`, '—', '≤ 2 ms', 'INFO'));
    const tS = tot('tSteps'), tL = tot('tLight') / Math.max(1, lights), tO = tot('tOver2');
    const tMaxR = all.filter(r => Number.isFinite(r.st.tMax)).sort((a, c) => c.st.tMax - a.st.tMax)[0];
    rows.push(row('step(light) time, fastest of 3, mean', 'all', tS ? `${f3(tL)} ms (${lights} lights)` : 'not recorded', '≤ 2 ms', '≤ 2 ms', tS ? (tL <= 2 ? 'OK' : 'FAIL') : 'N/A'));
    let stepSt = !tS ? 'N/A' : tO === 0 ? 'OK' : tO / tS <= 0.001 ? 'WARN' : 'FAIL', retimed = '';
    if (tO && ctx.retime) {
      // replay the (up to 3) runs with the slowest steps in the main thread; a real slow step reproduces
      const worst = all.filter(r => r.st.tMax > 2).sort((a, c) => c.st.tMax - a.st.tMax).slice(0, 3); const again = [];
      for (const r of worst) { try { const x = ctx.retime(r.cfg, r.seed); if (x) again.push({ r, x }); } catch (e) { details.push(`re-time of ${r.cfg}#${r.seed} threw: ${e.message}`); } }
      if (again.length) {
        const slow = again.filter(o => o.x.st.tMax > 2);
        retimed = ` · re-timed ${again.length} worst runs in the main thread: max ${again.map(o => f2(o.x.st.tMax)).join(', ')} ms`;
        stepSt = slow.length ? 'FAIL' : 'OK';
        details.push(`slow steps re-timed: ${again.map(o => `${o.r.cfg}#${o.r.seed} ${o.r.st.tMaxType} ${f2(o.r.st.tMax)} ms in the worker → ${f2(o.x.st.tMax)} ms (${o.x.st.tMaxType}) replayed`).join(' | ')}${slow.length ? ' — the slow step reproduces: a real SIM cost' : ' — worker outliers were machine noise'}${ctx.retimeNote ? ' (' + ctx.retimeNote + ')' : ''}`);
      }
    }
    rows.push(row('any step, fastest of 3: max · share > 2 ms', 'all', tS ? `${f2(tMaxR.st.tMax)} ms (${tMaxR.st.tMaxType}, ${tMaxR.cfg}#${tMaxR.seed}) · ${tO}/${tS}${retimed}` : 'not recorded', '≤ 2 ms (§11.7)', '≤ 2 ms', stepSt));
    details.push('step timings: "as played" is one wall-clock timing per step inside a worker (noisy on a loaded machine); "fastest of 3" also steps two clones of the same state and keeps the fastest.');
    if (ctx.bench) rows.push(row('resolveShow, 6-tube Countdown (golden #10)', '—', `${f1(ctx.bench.us)} µs · Applause ${fmtN(ctx.bench.applause)}`, '≤ 200 µs', '≈ 17 µs; 274,095', ctx.bench.us <= 200 ? 'OK' : 'FAIL'));
    return { rows, details };
  },
});

def('crosscheck', 'Driver cross-check (SIM bots vs the spec §12.1 port)', {
  needs: ['xcheck.greedy', 'xcheck.novice', 'xcheck.human', 'xcheck.oracle', 'greedy', 'novice', 'human', 'oracle'],
  optional: ['native.greedy', 'native.novice', 'native.human', 'native.oracle'],
  run(ctx) {
    const rows = [], details = ['Same seeds played by both drivers; the §12.1 bots are deterministic given the seed, so a faithful OOH.bots port should give identical traces.'];
    for (const b of ['greedy', 'novice', 'human', 'oracle']) {
      const X = ctx.R['xcheck.' + b]; if (!X || !ctx.R[b]) { rows.push(na('win % main vs other driver', b, 'identical', '—')); continue; }
      const [M, Xc] = common(ctx.R[b], X);
      const key = r => r.shows.map(x => x.a).join(',');
      let same = 0; for (const r of M) { const o = Xc.find(x => x.seed === r.seed); if (o && key(o) === key(r)) same++; }
      const d = winPct(M) - winPct(Xc);
      const st = same === M.length ? 'OK' : diffStatus(d, seDiff(wins(M), M.length, wins(Xc), Xc.length), -5, 5);
      rows.push(row('win % main vs other driver', b, `${f1(winPct(M))} vs ${f1(winPct(Xc))} (${ctx.driver} vs ${Xc[0] ? Xc[0].driver : '?'}) · identical traces ${same}/${M.length}`, 'identical (or ±5)', '—', st));
      const Nt = ctx.R['native.' + b];
      if (Nt) {
        const [M2, N2] = common(ctx.R[b], Nt); let same2 = 0;
        for (const r of M2) { const o = N2.find(x => x.seed === r.seed); if (o && key(o) === key(r)) same2++; }
        rows.push(row('harness loop vs the SIM\'s own playRun', b, `identical traces ${same2}/${M2.length} · win ${f1(winPct(M2))} vs ${f1(winPct(N2))}`, 'identical', '—', same2 === M2.length ? 'OK' : 'FAIL'));
      }
      const firstDiff = M.find(r => { const o = Xc.find(x => x.seed === r.seed); return o && key(o) !== key(r); });
      if (firstDiff) { const o = Xc.find(x => x.seed === firstDiff.seed); const i = firstDiff.shows.findIndex((x, k) => !o.shows[k] || o.shows[k].a !== x.a); details.push(`${b}: seed ${firstDiff.seed} first differs at show ${i + 1}: ${ctx.driver} ${firstDiff.shows[i] ? firstDiff.shows[i].rack + ' → ' + firstDiff.shows[i].a : '-'} | other ${o.shows[i] ? o.shows[i].rack + ' → ' + o.shows[i].a : '-'}`); }
    }
    return { rows, details };
  },
});

// ---------------------------------------------------------------- planning
function plan({ only, skip, bots, seeds, sweepSeeds, shapleyRuns, endlessRuns, replayRuns, xcheckRuns = 50, xcheck = false, native = false }) {
  const C = configs();
  const sel = A.filter(a => (!only || only.includes(a.id)) && !(skip && skip.includes(a.id)) && (a.id !== 'crosscheck' || xcheck));
  const fam = c => !bots || bots.includes(c.family) || bots.includes(c.bot);
  const want = new Map(); // cfgId → probes
  for (const a of sel) {
    for (const id of [...(a.needs || []), ...(a.optional || [])]) {
      const c = C[id]; if (!c || !fam(c)) continue;
      if (c.driver === 'native' && !native) continue;
      if (!want.has(id)) want.set(id, new Set());
      for (const p of (a.probes && a.probes[id]) || []) want.get(id).add(p);
    }
    for (const [id, ps] of Object.entries(a.probes || {})) if (want.has(id)) for (const p of ps) want.get(id).add(p);
  }
  const jobs = [];
  for (const [id, probes] of want) {
    const c = C[id];
    let list;
    if (c.seeds === 'noise40') list = [...Array(40).keys()].map(v => ({ seed: 'first-show', rndSeed: v }));
    else if (c.seeds === 'xcheck') list = [...Array(Math.min(xcheckRuns, seeds)).keys()].map(i => ({ seed: i + 1 }));
    else if (c.seeds === 'replay') list = [...Array(Math.min(replayRuns, seeds)).keys()].map(i => ({ seed: i + 1 }));
    else if (Array.isArray(c.seeds)) list = c.seeds.map(s => ({ seed: s }));
    else list = [...Array(c.sweep ? sweepSeeds : seeds).keys()].map(i => ({ seed: i + 1 }));
    for (const { seed, rndSeed } of list) {
      const pr = {};
      for (const p of probes) {
        if (p === 'shap') { if (typeof seed === 'number' && seed <= shapleyRuns) pr.shap = true; }
        else if (p === 'endless') { if (typeof seed === 'number' && seed <= endlessRuns) pr.endless = true; }
        else pr[p] = true;
      }
      const opts = { ...c.opts }; if (rndSeed !== undefined) opts.rndSeed = rndSeed;
      jobs.push({ cfg: id, bot: c.bot, seed, opts, probes: pr, driver: c.driver || null, weight: jobWeight(c, pr) });
    }
  }
  return { analyses: sel, jobs, configs: C };
}

module.exports = { A, plan, configs, ceiling, CORE, KITS, ARCHS, HEADLINERS, afterpartyTargets };
