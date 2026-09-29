'use strict';
// Plays one run of one bot through the SIM API and returns a compact run record that every
// analysis reads. Two drivers:
//   'spec' — the §12.1 bots in spec-bots.cjs (public API only; reproduces the v1.1 reference).
//   'sim'  — the SIM's own OOH.bots, adapted by sim-driver.cjs (whatever protocol it exposes).
// Either way the runner owns the loop: build → (Sponsor) → snapshot → step({type:'light'}),
// so it sees the rack as lit, the Crowd and coins at lighting, and the SIM's verdict.
const { performance } = require('perf_hooks');
const U = require('./util.cjs');
const { makeSpecBots } = require('./spec-bots.cjs');
const { makeSimDriver } = require('./sim-driver.cjs');

const PURCHASES = new Set(['buy', 'upgrade', 'buyRig', 'buyTube']);

function makeRunner(api, { driver = 'spec', simSponsor = 'auto' } = {}) {
  const SB = makeSpecBots(api);
  const SD = driver === 'sim' ? makeSimDriver(api, { simSponsor, SB }) : null;

  function slotShells(state) {
    const out = new Map();
    state.tubes.forEach((t, i) => { if (t.shell) out.set(t.shell.uid, { i, star: t.shell.star }); });
    (state.crate || []).forEach((c, i) => { if (c) out.set(c.uid, { i: 'c' + i, star: c.star }); });
    return out;
  }
  function monoFrom(res, events) {
    if (typeof res.monoShow === 'boolean') return res.monoShow;
    const cnt = { R: 0, A: 0, G: 0, B: 0 };
    let seen = false;
    const src = Array.isArray(res.trace) && res.trace.length ? res.trace : events || [];
    for (const e of src) if (e && e.type === 'burst' && !e.dud) { seen = true; if (cnt[e.col] !== undefined) cnt[e.col]++; }
    if (!seen) return null;
    const c = Object.values(cnt); const tot = c.reduce((a, b) => a + b, 0);
    return tot >= 5 && c.filter(x => x > 0).length === 1;
  }
  const fusName = x => (typeof x === 'string' ? x : x && (x.name || x.id || x.key)) || String(x);

  function playRun(job) {
    const { seed, bot, opts = {}, probes = {} } = job;
    const t0 = performance.now();
    const rnd = U.botRng(seed, opts.rndSeed);
    const createOpts = {
      kit: opts.kit || 'apprentice', renown: opts.renown || 0, fairWeather: !!opts.fairWeather,
      firstRun: !!opts.firstRun, daily: false, noSponsor: !!opts.noSponsor, // noSponsor: src/sim.js + v1.1 extension; ignored elsewhere (the bots then decline)
      unlocked: opts.unlocked ? opts.unlocked.slice() : api.unlocks.slice(),
    };
    const state = api.createState(String(seed), createOpts);
    const R = {
      cfg: job.cfg, seed, bot, won: false, phase: null, lastS: -1, abort: null,
      heads: (state.headliners || []).slice(0, 7), shows: [], regret: [], after: null, shap: [], probes: {},
      st: { rerolls: 0, pity: 0, illegal: 0, illegalWhy: {}, sells: 0, sellBad: 0, nan: 0, huge: 0, legalEmpty: 0,
        tubesMax: state.tubes.length, rigsMax: 0, maxCrowd: state.crowd || 0, star3: false, steps: 0, stepMs: 0,
        lightMs: 0, lightMsMax: 0, lights: 0, mismatch: 0, passMismatch: 0, moodMismatch: 0, moodSeen: 0, relights: 0 },
      ms: 0, hash: null,
    };
    const st = R.st;
    const countPity = () => { if (state.shop && Array.isArray(state.shop.cards)) st.pity += state.shop.cards.filter(c => c && c.tag === 'pity').length; };

    function act(a) {
      let sellCheck = null;
      if (a.type === 'sell' && a.from) {
        const sh = a.from.zone === 'crate' ? (state.crate || [])[a.from.i] : state.tubes[a.from.i] && state.tubes[a.from.i].shell;
        if (sh) sellCheck = { paid: sh.paid, coins: state.coins };
      }
      const t = performance.now();
      let ev;
      try { ev = api.step(state, a); } catch (e) { st.illegal++; const k = a.type + ':threw ' + String(e && e.message).slice(0, 60); st.illegalWhy[k] = (st.illegalWhy[k] || 0) + 1; return null; }
      const dt = performance.now() - t;
      st.steps++; st.stepMs += dt;
      if (a.type === 'light') { st.lights++; st.lightMs += dt; if (dt > st.lightMsMax) st.lightMsMax = dt; }
      const ill = Array.isArray(ev) ? ev.find(e => e && e.type === 'illegal') : null;
      if (ill) { st.illegal++; const k = a.type + ':' + (ill.reason || '?'); st.illegalWhy[k] = (st.illegalWhy[k] || 0) + 1; return null; }
      if (a.type === 'reroll') { st.rerolls++; countPity(); }
      if (sellCheck) { st.sells++; const got = state.coins - sellCheck.coins; if (got !== Math.max(1, Math.floor(0.75 * sellCheck.paid)) || got > sellCheck.paid) st.sellBad++; }
      return ev || [];
    }

    let last = null, relight = false, prevLit = null;
    const lightOne = (s, before, record) => {
      const tubes = state.tubes.map(t => ({ shell: t.shell ? { ...t.shell } : null, rig: t.rig ?? null }));
      const rules = api.rulesFor(state, s);
      const t = api.target(state, s), bt = api.baseTarget(state, s);
      const crowd = state.crowd, coins = state.coins, rain = state.rain;
      const sp = !!(state.sponsor && state.sponsor.accepted);
      const fav = rules.includes('rival') ? api.favourite(tubes, crowd) : null;
      const res = api.resolveShow(tubes, { rules, crowd, fav });
      // purchases and arranging this build (diff against the build start)
      const now = slotShells(state); let buys = 0, arr = 0;
      for (const [uid, x] of now) { const b = before.shells.get(uid); if (!b) buys++; else { if (x.star > b.star) buys += x.star - b.star; if (x.i !== b.i) arr = 1; } }
      tubes.forEach((tb, i) => { if (i < before.rigs.length && tb.rig && tb.rig !== before.rigs[i]) buys++; });
      buys += Math.max(0, tubes.length - before.rigs.length);
      const hLen = api.history(state).length;
      const ev = act({ type: 'light' });
      if (!ev) { R.abort = 'light was illegal at s=' + s; return null; }
      const h = api.history(state); const hRec = h.length > hLen ? h[h.length - 1] : null;
      const evA = ev.find(e => e && e.type === 'applause');
      let a = hRec && Number.isFinite(hRec.applause) ? hRec.applause : evA && Number.isFinite(evA.score) ? evA.score : res.applause;
      if (a !== res.applause) st.mismatch++;
      let pass = hRec && typeof hRec.pass === 'boolean' ? hRec.pass : evA && typeof evA.pass === 'boolean' ? evA.pass : a >= t;
      if (pass !== a >= t) st.passMismatch++;
      const relit = !pass && state.phase === 'build' && state.show === s;
      const rainUsed = !pass && !relit && state.phase === 'build';
      if (relit) st.relights++;
      for (const v of [a, res.ooh, res.aah]) if (!Number.isFinite(v)) st.nan++;
      if (a >= 1e300) st.huge++;
      st.tubesMax = Math.max(st.tubesMax, state.tubes.length);
      st.rigsMax = Math.max(st.rigsMax, tubes.filter(x => x.rig).length);
      st.maxCrowd = Math.max(st.maxCrowd, crowd || 0, state.crowd || 0);
      if (tubes.some(x => x.shell && x.shell.star >= 3)) st.star3 = true;
      const mood = hRec ? (hRec.moodAtLight ?? hRec.mood ?? null) : null;
      if (mood) {
        st.moodSeen++;
        const r = a / t; const want = r < 0.85 ? 'restless' : r < 1.25 ? 'hopeful' : 'eager';
        if (String(mood).toLowerCase() !== want) st.moodMismatch++;
      }
      const rec = {
        s, r: rules.length ? rules.join('+') : null, t, bt, a, pass, sp, enc: a >= 2 * t, relit, rain: rainUsed,
        b: res.bursts, up: res.maxUp, cu: res.colsUp, cf: res.colsFired, mono: monoFrom(res, ev),
        fus: (res.fusions || []).map(fusName), ooh: res.ooh, aah: res.aah, cheer: res.cheer ?? 0,
        cr: crowd, cr2: state.crowd, $: coins, $p: coins + (res.coins || 0), rainLeft: rain,
        rack: U.rackStr(tubes), rigs: U.rigStr(tubes), buys, arr, mood: mood ? String(mood).toLowerCase() : null,
      };
      // ---- probes (only when an analysis asked for them) ----
      if (record && probes.hc && s % 3 === 2 && s < 23 && rules.length && !R.probes['hc' + s]) {
        const bN = SB.exhaustive(tubes, [], crowd);
        if (bN.score > 0) {
          const bR = SB.exhaustive(tubes, rules, crowd).score;
          const tn = SB.withShells(tubes, bN.sh);
          const kept = SB.scoreRack(tn, rules, crowd, 0);
          const match = SB.scoreRack(SB.refit(tn, rules), rules, crowd, 0);
          rec.hc = { best: bR / bN.score, kept: kept / bN.score, match: match / bN.score };
        }
        R.probes['hc' + s] = 1;
      }
      if (record && probes.cd && s === 23 && prevLit && !R.probes.cd) {
        rec.cd = {
          keep: SB.scoreRack(prevLit, rules, crowd, 0),
          best: SB.exhaustive(tubes, rules, crowd).score,
          hill1: SB.hill(prevLit, rules, crowd, 0, 1).score,
          T: t,
        };
        R.probes.cd = 1;
      }
      if (record && probes.shap && api.shapley) {
        const tt = performance.now(); let sim = null, err = null;
        try {
          const res = api.shapley(tubes, rules, crowd, fav);
          // keep non-enumerable extras (src/sim.js: values, applause) — postMessage drops them
          sim = res && typeof res === 'object' ? { top: { ...res }, values: res.values ? { ...res.values } : null, applause: Number.isFinite(res.applause) ? res.applause : null } : res;
        } catch (e) { err = String(e && e.message); }
        const simMs = performance.now() - tt;
        const own = SB.shapleyExact(tubes, rules, crowd, fav);
        R.shap.push({ s, a, sim, err, simMs, own: { phi: own.phi, occ: own.occ, full: own.full }, ids: tubes.map(x => (x.shell ? x.shell.id : null)) });
      }
      if (record) R.shows.push(rec); else if (R.after) R.after.shows.push({ s, a, t, pass });
      last = { applause: a, target: t };
      prevLit = tubes;
      return rec;
    }

    function buildAndLight(record) {
      const s = state.show;
      if (!relight) countPity();
      let legal = null;
      try { legal = api.legalActions(state); } catch (e) { legal = null; }
      if (!legal || !legal.length) st.legalEmpty++;
      const before = { shells: slotShells(state), rigs: state.tubes.map(t => t.rig ?? null) };
      const ctx = { state, rnd, act, opts, last, relight, regret: bot === 'oracle' && driver === 'spec' && probes.regret && record ? R.regret : null };
      if (record && probes.regret && driver === 'sim' && bot === 'oracle' && !relight && state.shop) R.regret.push(...SB.regretProbe(state));
      if (SD) SD.build(bot, ctx); else SB.build(bot, ctx);
      if (state.phase !== 'build' || state.show !== s) { R.abort = 'bot lit or ended the show itself at s=' + s; return null; }
      const simPick = SD ? SD.sponsor(bot, ctx) : null;
      if (simPick === null ? SB.sponsorPick(bot, ctx) : simPick) act({ type: 'sponsor', accept: true });
      const rec = lightOne(s, before, record);
      if (!rec) return null;
      relight = rec.relit;
      return rec;
    }

    let guard = 0;
    while (state.phase === 'build' && state.show <= 23 && guard++ < 60) {
      const rec = buildAndLight(true);
      if (!rec) break;
      R.lastS = rec.s;
    }
    R.won = state.phase === 'won';
    R.phase = state.phase;
    const rs = state.runStats || {};
    if (Number.isFinite(rs.rerolls)) st.rerolls = rs.rerolls;   // counts rerolls made inside SIM bots too
    if (Number.isFinite(rs.pity)) st.pity = rs.pity;
    if (api.hashState) { try { R.hash = api.hashState(state); } catch (e) { R.hash = null; } }
    // Afterparty probe: enter endless after a win and play on until it ends (or 20 shows).
    if (R.won && probes.endless) {
      R.after = { entered: false, shows: [], phase: null };
      const ev = act({ type: 'endless' });
      if (ev && state.phase === 'build') {
        R.after.entered = true; relight = false;
        let g = 0;
        while (state.phase === 'build' && g++ < 20) { if (!buildAndLight(false)) break; }
        R.after.phase = state.phase; R.after.lastS = state.show;
      }
    }
    R.ms = performance.now() - t0;
    return R;
  }

  // The SIM's own playRun (src/sim.js exports it) — used only to cross-check the harness loop.
  function nativeRun(job) {
    if (!api.playRun) throw new Error('the SIM exports no playRun');
    const t0 = performance.now();
    const o = { ...(job.opts || {}) };
    const out = api.playRun(job.seed, job.bot, o);
    const S = out && out.state ? out.state : out;
    const h = api.history(S);
    return { cfg: job.cfg, seed: job.seed, bot: job.bot, native: true, won: S.phase === 'won', phase: S.phase, lastS: h.length ? h[h.length - 1].show : -1,
      shows: h.map(x => ({ s: x.show, a: x.applause, t: x.target, pass: x.pass, relit: !!x.relit })), st: { rerolls: 0, pity: 0, illegal: 0, illegalWhy: {}, sells: 0, sellBad: 0 }, ms: performance.now() - t0 };
  }

  return { playRun, nativeRun, SB, SD };
}

module.exports = { makeRunner, PURCHASES };
