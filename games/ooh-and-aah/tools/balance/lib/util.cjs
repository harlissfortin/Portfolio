'use strict';
// Shared helpers for tools/balance (statistics, formatting, bot RNG, rack strings).

// Quantile with the same convention as the v1.1 design-time scripts: sorted[floor(p·(n−1))].
function q(arr, p) {
  if (!arr || !arr.length) return NaN;
  const s = arr.slice().sort((x, y) => x - y);
  return s[Math.floor(p * (s.length - 1))];
}
const mean = a => (a && a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const sum = a => a.reduce((x, y) => x + y, 0);
const pct = (k, n) => (n ? (100 * k) / n : NaN);

// Wilson 95% interval for a proportion k/n, in percent.
function wilson(k, n, z = 1.96) {
  if (!n) return [NaN, NaN];
  const p = k / n, d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [100 * Math.max(0, c - h), 100 * Math.min(1, c + h)];
}
// Standard error (percentage points) of a difference of two independent proportions.
function seDiff(k1, n1, k2, n2) {
  if (!n1 || !n2) return NaN;
  // Agresti–Caffo: one pseudo-success and one pseudo-failure per arm, so 0% / 100% arms (small n)
  // still carry sampling error instead of reading as exact.
  const p1 = (k1 + 1) / (n1 + 2), p2 = (k2 + 1) / (n2 + 2);
  return 100 * Math.sqrt((p1 * (1 - p1)) / (n1 + 2) + (p2 * (1 - p2)) / (n2 + 2));
}

// Number formatting close to the spec's (§8.5): 1,272 · 12K · 1.07M.
function fmtN(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return '-';
  if (!Number.isFinite(v)) return String(v);
  const a = Math.abs(v);
  if (a >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (a >= 1e4) return Math.round(v / 1e3) + 'K';
  return Math.round(v).toLocaleString('en-US');
}
const f1 = v => (Number.isFinite(v) ? v.toFixed(1) : '-');
const f2 = v => (Number.isFinite(v) ? v.toFixed(2) : '-');
const f3 = v => (Number.isFinite(v) ? v.toFixed(3) : '-');
const p0 = v => (Number.isFinite(v) ? Math.round(v) + '%' : '-');
const p1 = v => (Number.isFinite(v) ? v.toFixed(1) + '%' : '-');
const sgn = (v, d = 0) => (Number.isFinite(v) ? (v >= 0 ? '+' : '') + v.toFixed(d) : '-');

// cyrb128 (spec §11.3) — used only to seed bot RNGs from string seeds.
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4; h2 ^= h1; h3 ^= h1; h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

// Bot RNG (§12.1): xorshift32 seeded with (seedNumber × 2654435761) >>> 0; a string seed uses
// cyrb128(seed)[0]. `rndSeed` (first-run noise draws) overrides the seed number with rndSeed + 1,
// exactly like the v1.1 reference playRun.
function botRng(seed, rndSeed) {
  const base = rndSeed !== undefined ? rndSeed + 1 : typeof seed === 'number' ? seed : cyrb128(String(seed))[0];
  let rs = (base * 2654435761) >>> 0;
  if (!rs) rs = 7;
  return () => {
    rs ^= rs << 13; rs >>>= 0; rs ^= rs >>> 17; rs ^= rs << 5; rs >>>= 0;
    return rs / 4294967296;
  };
}

const fest = s => Math.floor(s / 3) + 1;

// Rack strings use the design-time notation: "palm*2:R willow:A -".
function rackStr(tubes) {
  return tubes.map(t => (t && t.shell ? t.shell.id + (t.shell.star > 1 ? '*' + t.shell.star : '') + ':' + t.shell.col : '-')).join(' ');
}
function rigStr(tubes) { return tubes.map(t => (t && t.rig) || '-').join(' '); }
function parseRack(rack, rigs) {
  const r = rigs ? rigs.split(' ') : [];
  let u = 1;
  return rack.split(' ').map((tok, i) => {
    const rig = r[i] && r[i] !== '-' ? r[i] : null;
    if (tok === '-') return { shell: null, rig };
    let [id, col] = tok.split(':'); let star = 1;
    if (id.includes('*')) { const p = id.split('*'); id = p[0]; star = +p[1]; }
    return { shell: { uid: u++, id, col, star, paid: 3 }, rig };
  });
}
const shellIds = rack => [...new Set(rack.split(' ').filter(x => x !== '-').map(x => x.split(':')[0].split('*')[0]))];

module.exports = { q, mean, sum, pct, wilson, seDiff, fmtN, f1, f2, f3, p0, p1, sgn, cyrb128, botRng, fest, rackStr, rigStr, parseRack, shellIds };
