'use strict';
// Loads a SIM and normalises it into the small API the balance harness uses.
//
//   loadSim({sim, ref})  sim: path to a CommonJS module exporting OOH (default src/sim.js)
//                        ref: folder of the design-time v1.1 reference (sim.js + bots.js)
//
// The harness only relies on the spec §11.4 surface: createState, step, legalActions, rulesFor,
// resolveShow, favourite, matchPerm, clone, target, plus DATA.SHELLS for row costs. Everything
// else (shapley, hashState, bots, runBots, mood) is optional and feature-detected.
const fs = require('fs');
const path = require('path');

const ALL_UNLOCKS = ['m_fusion', 'm_busy', 'm_mono', 'm_spectrum', 'm_crowd', 'm_triple', 'm_headliner', 'm_rigger'];

function loadRaw({ sim, ref }) {
  if (ref) {
    const make = require('./ref-adapter.cjs');
    return { raw: make(path.resolve(ref)), kind: 'ref', where: path.resolve(ref) };
  }
  const p = path.resolve(sim);
  if (!fs.existsSync(p)) throw new Error('SIM not found: ' + p);
  const mod = require(p);
  let raw = mod && (mod.OOH || mod.default || mod);
  if (typeof raw === 'function' && !raw.createState) raw = raw(); // module exported the OohSim factory
  if (!raw || typeof raw.createState !== 'function') throw new Error(p + ' does not export OOH (no createState)');
  return { raw, kind: 'real', where: p };
}

function num(v) { return typeof v === 'number' ? v : v !== undefined && v !== null && !Number.isNaN(+v) ? +v : undefined; }

function loadSim(opts) {
  const { raw, kind, where } = loadRaw(opts);
  const missing = ['createState', 'step', 'legalActions', 'rulesFor', 'resolveShow'].filter(k => typeof raw[k] !== 'function');
  if (missing.length) throw new Error('SIM at ' + where + ' lacks ' + missing.join(', '));
  const D = raw.DATA || {};

  // ---- shell rows (DATA.SHELLS may be keyed by id or an array of rows) ----
  const rowCache = new Map();
  function shell(id) {
    if (rowCache.has(id)) return rowCache.get(id);
    let r = null; const S = D.SHELLS;
    if (Array.isArray(S)) r = S.find(x => x && (x.id === id || x[0] === id)) || null;
    else if (S && typeof S === 'object') r = S[id] || null;
    const p = (r && (r.p || r.params || r.effect || r.fx)) || {};
    const norm = r ? {
      id,
      col: r.col ?? r.colour ?? r.color ?? '*',
      rar: r.rar ?? r.rarity ?? '?',
      cost: num(r.cost ?? r.$ ?? r.price) ?? 3,
      aah: num(p.aah ?? r.aah) || 0,
      fest: num(r.fest ?? r.f ?? r.festival) ?? 1,
      lock: r.lock ?? r.unlock ?? null,
    } : { id, col: '*', rar: '?', cost: 3, aah: 0, fest: 1, lock: null };
    rowCache.set(id, norm);
    return norm;
  }
  function shellIds() {
    const S = D.SHELLS;
    if (Array.isArray(S)) return S.map(x => x && (x.id || x[0])).filter(Boolean);
    return S ? Object.keys(S) : [];
  }
  // The full pool = every shell-unlocking milestone (spec §4.11), the default of the v1.1 bots.
  const unlocks = ALL_UNLOCKS.slice();

  const matchPerm = typeof raw.matchPerm === 'function' ? (n, rules) => raw.matchPerm(n, rules) : (n, rules) => {
    let order = [...Array(n).keys()];
    if (rules.includes('windshift')) order.reverse();
    if (rules.includes('crossed')) order = order.filter(i => i % 2 === 1).concat(order.filter(i => i % 2 === 0));
    return order;
  };
  const clone = typeof raw.clone === 'function' ? s => raw.clone(s) : s => structuredClone(s);
  const favourite = typeof raw.favourite === 'function' ? (t, c) => raw.favourite(t, c) : (tubes, crowd) => {
    const base = raw.resolveShow(tubes, { rules: [], crowd }).applause; let best = -Infinity, bi = null;
    tubes.forEach((t, i) => { if (!t.shell) return; const r2 = tubes.map((u, j) => (j === i ? { shell: null, rig: u.rig } : u)); const d = base - raw.resolveShow(r2, { rules: [], crowd }).applause; if (d > best) { best = d; bi = i; } });
    return bi;
  };
  // target(state, s): the effective target (Sponsor on the current show, Renown, Fair Weather).
  const target = typeof raw.target === 'function' ? (st, s) => raw.target(st, s) : (st, s) => {
    const T = D.TARGETS || []; let t = T[s];
    if (st.renown >= 8 && s === 23) t = 1000000;
    if (st.renown >= 1 && s % 3 === 2 && s < 23) t = Math.round(t * 1.25);
    if (st.fairWeather || st.fair) t = Math.round(t * 0.75);
    if (s === st.show && st.sponsor && st.sponsor.accepted) t = Math.round(t * 1.5);
    return t;
  };
  const baseTarget = typeof raw.baseTarget === 'function' ? (st, s) => raw.baseTarget(st, s)
    : (st, s) => (st.sponsor && st.sponsor.accepted ? target({ ...st, sponsor: { ...st.sponsor, accepted: false } }, s) : target(st, s));
  const history = st => (st.runStats && Array.isArray(st.runStats.history) ? st.runStats.history : Array.isArray(st.history) ? st.history : []);

  return {
    kind, where, raw, DATA: D,
    version: (D && D.version) || raw.version || null,
    createState: (seed, o) => raw.createState(seed, o),
    step: (st, a) => raw.step(st, a) || [],
    legalActions: st => raw.legalActions(st) || [],
    rulesFor: (st, s) => raw.rulesFor(st, s) || [],
    resolveShow: (tubes, ctx) => raw.resolveShow(tubes, ctx),
    favourite, matchPerm, clone, target, baseTarget, history, shell, shellIds, unlocks,
    shapley: typeof raw.shapley === 'function' ? (...a) => raw.shapley(...a) : null,
    hashState: typeof raw.hashState === 'function' ? st => raw.hashState(st) : null,
    mood: typeof raw.mood === 'function' ? (...a) => raw.mood(...a) : null,
    bots: raw.bots || null,
    runBots: typeof raw.runBots === 'function' ? raw.runBots : null,
    playRun: typeof raw.playRun === 'function' ? raw.playRun : null,
    sponsorPick: typeof raw.sponsorPick === 'function' ? raw.sponsorPick : null,
  };
}

module.exports = { loadSim, ALL_UNLOCKS };
