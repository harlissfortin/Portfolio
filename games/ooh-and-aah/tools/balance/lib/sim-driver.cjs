'use strict';
// Adapts the SIM's own bots (OOH.bots) to the runner's build-phase protocol:
//   build(botName, ctx) plays ONE build phase on ctx.state through the SIM and returns without
//   lighting; the runner then snapshots the rack and lights.
// Supported shapes of OOH.bots[name] (detected per call):
//   - mutator:   fn(state, ctx) → undefined         (plays the build via step, does not light)
//   - planner:   fn(state, ctx) → Action[]          (the harness applies them, stopping at 'light')
//   - policy:    fn(state, ctx) → Action            (called repeatedly until it returns 'light')
//   - object:    {build|turn|play|act}(state, ctx)  (same three result shapes)
// The SIM bot is called as fn(state, o) with o = {...opts, rnd, opts, relight, last}; this matches
// src/sim.js, whose bots are fn(S, o, ctx) mutators reading o.rnd (and tolerate a missing ctx).
// mono: OOH.bots.mono(arch[, base]) → bot of any shape above.
// Sponsors: if the SIM exports sponsorPick(style, S, o) and the bot carries fn.sponsorStyle, the
//   SIM's own rule decides (simSponsor 'auto'/'bot'); otherwise the runner applies §12.1.
// Fair Weather relight builds (no shop): fn.relightStyle 'oracle' → exhaustive re-solve, else the
//   human re-arrangement — both from the harness's §12.1 port (same algorithm as src/sim.js playRun).

function makeSimDriver(api, { simSponsor = 'auto', SB = null } = {}) {
  const B = api.bots;
  if (!B || typeof B !== 'object') throw new Error('the SIM exposes no OOH.bots object');
  const names = { greedyMood: ['greedyMood', 'greedymood', 'greedy-mood', 'greedy_mood'], donothing: ['donothing', 'doNothing', 'do-nothing'] };
  const monoCache = new Map();

  function botFn(name, opts) {
    if (name === 'mono') {
      const key = opts.arch + '/' + (opts.base || 'human');
      if (monoCache.has(key)) return monoCache.get(key);
      let fn = null;
      if (typeof B.mono === 'function') {
        try { fn = B.mono(opts.arch, opts.base || 'human'); } catch (e) { fn = null; }
        if (!(typeof fn === 'function' || (fn && typeof fn === 'object'))) fn = null;
      }
      monoCache.set(key, fn); return fn;
    }
    for (const n of names[name] || [name]) if (B[n]) return B[n];
    return null;
  }
  function call(fn, state, ctx) {
    const c = { rnd: ctx.rnd, opts: ctx.opts || {}, relight: !!ctx.relight, last: ctx.last, ...(ctx.opts || {}) };
    if (typeof fn === 'function') return fn(state, c);
    const m = fn.build || fn.turn || fn.play || fn.act;
    if (typeof m !== 'function') throw new Error('OOH.bots entry has no callable build/turn/play/act');
    return m.call(fn, state, c);
  }
  function build(name, ctx) {
    const fn = botFn(name, ctx.opts || {});
    if (!fn) throw new Error('OOH.bots has no bot "' + name + '"' + (name === 'mono' ? ' (mono(arch) did not return a bot)' : ''));
    if (ctx.relight) {
      if (!SB || name === 'donothing' || name === 'greedy') return;
      const style = fn.relightStyle || (name === 'oracle' ? 'oracle' : 'human');
      if (style === 'oracle') SB.arrangeOracle(ctx); else SB.arrangeHuman(ctx, { ...(ctx.opts || {}) }, null);
      return;
    }
    const r = call(fn, ctx.state, ctx);
    if (Array.isArray(r)) { for (const a of r) { if (!a || a.type === 'light') break; ctx.act(a); } return; }
    if (r && typeof r === 'object' && typeof r.type === 'string') {
      let a = r, g = 0;
      while (a && a.type !== 'light' && g++ < 300) { if (!ctx.act(a)) break; a = call(fn, ctx.state, ctx); }
    }
  }
  // Returns true/false when the SIM's own Sponsor rule decided, or null to let the runner apply §12.1.
  function sponsor(name, ctx) {
    if (simSponsor === 'harness' || !api.sponsorPick) return null;
    const fn = botFn(name, ctx.opts || {});
    if (!fn || !('sponsorStyle' in fn)) return null;
    if (!ctx.state.sponsor || ctx.relight) return false;
    return !!api.sponsorPick(fn.sponsorStyle, ctx.state, { ...(ctx.opts || {}), rnd: ctx.rnd });
  }
  return { build, sponsor, available: n => !!botFn(n, { arch: 'canopy' }) };
}

module.exports = { makeSimDriver };
