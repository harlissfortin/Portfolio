'use strict';
// Adapts the SIM's own bots (OOH.bots) to the runner's build-phase protocol:
//   build(botName, ctx) plays ONE build phase on ctx.state through the SIM and returns without
//   lighting; the runner then snapshots the rack and lights.
// Supported shapes of OOH.bots[name] (detected per call):
//   - mutator:   fn(state, ctx) → undefined         (plays the build via step, does not light)
//   - planner:   fn(state, ctx) → Action[]          (the harness applies them, stopping at 'light')
//   - policy:    fn(state, ctx) → Action            (called repeatedly until it returns 'light')
//   - object:    {build|turn|play|act}(state, ctx)  (same three result shapes)
// ctx given to the SIM bot: {rnd, opts, relight, last} plus opts spread at top level.
// mono: OOH.bots.mono(arch[, base]) → bot of any shape above.

function makeSimDriver(api) {
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
    const r = call(fn, ctx.state, ctx);
    if (Array.isArray(r)) { for (const a of r) { if (!a || a.type === 'light') break; ctx.act(a); } return; }
    if (r && typeof r === 'object' && typeof r.type === 'string') {
      let a = r, g = 0;
      while (a && a.type !== 'light' && g++ < 300) { if (!ctx.act(a)) break; a = call(fn, ctx.state, ctx); }
    }
  }
  const handlesSponsor = !!api.__botsHandleSponsor;
  return { build, handlesSponsor, available: n => !!botFn(n, { arch: 'canopy' }) };
}

module.exports = { makeSimDriver };
