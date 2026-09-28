'use strict';
// Test scaffolding: makes the design-time v1.1 reference simulator (a folder with sim.js + bots.js)
// look like the game's OOH API (spec §11.4 / src/CONTRACT.md) closely enough for the balance
// harness. Used with `analyze.mjs --ref=<dir>` (or automatically when src/sim.js is missing).
//
// It implements createState / step / legalActions / rulesFor / target / resolveShow / favourite /
// matchPerm / clone / shapley and DATA on top of the reference's direct-mutation helpers.
// It also exposes the reference bots as `bots` in "build-phase mutator" form
// (bot(state, {rnd, opts}) — plays one build, never lights) plus `sponsorPick`, so the
// harness's --driver=sim path can be exercised before the real src/sim.js exists.
const path = require('path');

module.exports = function makeRefAdapter(dir) {
  const S = require(path.join(dir, 'sim.js'));
  let B = null;
  try { B = require(path.join(dir, 'bots.js')); } catch (e) { B = null; }
  const SH = S.SH;
  const ALL = ['m_fusion', 'm_busy', 'm_mono', 'm_spectrum', 'm_crowd', 'm_triple', 'm_headliner', 'm_rigger'];
  const COLS = ['R', 'A', 'G', 'B'];

  const okSlot = (st, sl) => sl && Number.isInteger(sl.i) && (sl.zone === 'crate' ? sl.i >= 0 && sl.i < 2 : sl.i >= 0 && sl.i < st.tubes.length);
  const getSlot = (st, sl) => (sl.zone === 'crate' ? st.crate[sl.i] : st.tubes[sl.i].shell);
  const setSlot = (st, sl, v) => { if (sl.zone === 'crate') st.crate[sl.i] = v; else st.tubes[sl.i].shell = v; };

  function createState(seed, opts = {}) {
    const st = S.createState(String(seed), {
      kit: opts.kit, renown: opts.renown || 0, firstRun: !!opts.firstRun, fair: !!opts.fairWeather,
      unlocked: opts.unlocked ? opts.unlocked.slice() : ALL.slice(), keepsake: opts.keepsake,
    });
    st.twilightTwists = st.twilight;
    st.runStats = { history: st.history };
    return st;
  }

  function matchPerm(n, rules) {
    let order = [...Array(n).keys()];
    if (rules.includes('windshift')) order.reverse();
    if (rules.includes('crossed')) order = order.filter(i => i % 2 === 1).concat(order.filter(i => i % 2 === 0));
    return order;
  }

  function step(st, a) {
    const bad = reason => [{ type: 'illegal', reason }];
    if (!a || typeof a !== 'object') return bad('no action');
    if (st.phase !== 'build') return bad('phase ' + st.phase);
    const f = Math.floor(st.show / 3) + 1;
    const card = a.card !== undefined && st.shop ? st.shop.cards[a.card] : null;
    switch (a.type) {
      case 'light': {
        const rec = S.light(st);
        const ev = [{ type: 'applause', ooh: rec.ooh, aah: rec.aah, score: rec.applause, target: rec.target, pass: rec.pass, encore: rec.encore }];
        if (rec.rain) ev.push({ type: 'rainCheck' });
        if (rec.relight) ev.push({ type: 'relight' });
        if (st.phase === 'lost') ev.push({ type: 'runLost' });
        if (st.phase === 'won') ev.push({ type: 'runWon' });
        return ev;
      }
      case 'buy': {
        if (!card || card.sold) return bad('card');
        if (card.cost > st.coins) return bad('coins');
        if (!okSlot(st, a.to) || getSlot(st, a.to)) return bad('slot');
        st.coins -= card.cost; card.sold = true;
        setSlot(st, a.to, { uid: st.nextUid++, id: card.id, col: card.col, star: 1, paid: card.cost });
        st.stats.buys++;
        return [{ type: 'bought' }];
      }
      case 'upgrade': {
        if (!card || card.sold || !okSlot(st, a.to)) return bad('card');
        const sh = getSlot(st, a.to);
        if (!sh || sh.id !== card.id || sh.star >= 3) return bad('twin');
        const uc = S.upCost(card.id, sh.star);
        if (uc > st.coins) return bad('coins');
        st.coins -= uc; sh.star++; sh.paid += uc; card.sold = true;
        return [{ type: 'upgraded' }];
      }
      case 'setColour': {
        if (!st.kitDef.chooseCol || !card || card.sold || SH[card.id].col !== '*' || !COLS.includes(a.col)) return bad('setColour');
        card.col = a.col; return [{ type: 'colourSet' }];
      }
      case 'buyRig': {
        const r = st.shop && st.shop.rig; const t = st.tubes[a.tube];
        if (!r || r.sold || !t) return bad('rig');
        if (r.cost > st.coins) return bad('coins');
        if (t.rig === r.id || (r.id === 'mortar' && st.tubes.some(x => x.rig === 'mortar'))) return bad('rig');
        st.coins -= r.cost; t.rig = r.id; r.sold = true;
        return [{ type: 'rigInstalled' }];
      }
      case 'buyTube': {
        if (f < 2 || st.tubes.length >= 6) return bad('tube');
        const tc = S.tubeCost(st); if (tc > st.coins) return bad('coins');
        st.coins -= tc; st.tubes.push({ shell: null, rig: null });
        return [{ type: 'tubeAdded' }];
      }
      case 'move': {
        if (!okSlot(st, a.from) || !okSlot(st, a.to)) return bad('slot');
        if (a.from.zone === a.to.zone && a.from.i === a.to.i) return bad('same');
        const x = getSlot(st, a.from); if (!x) return bad('empty');
        const y = getSlot(st, a.to); setSlot(st, a.to, x); setSlot(st, a.from, y || null);
        return [{ type: 'moved' }];
      }
      case 'sell': {
        if (!okSlot(st, a.from)) return bad('slot');
        const x = getSlot(st, a.from); if (!x) return bad('empty');
        st.coins += S.sellValue(x); setSlot(st, a.from, null);
        return [{ type: 'sold' }];
      }
      case 'reroll': {
        if (!st.shop || !S.reroll(st)) return bad('reroll');
        return [{ type: 'rerolled' }];
      }
      case 'sponsor': {
        if (!st.sponsor || st.sponsor.accepted === !!a.accept) return bad('sponsor');
        st.sponsor.accepted = !!a.accept; return [{ type: 'sponsor' }];
      }
      case 'match': {
        const rules = S.rulesFor(st, st.show);
        if (!(rules.includes('windshift') || rules.includes('crossed'))) return bad('match');
        if (st.tubes.filter(t => t.shell).length < 2) return bad('match');
        st.tubes = S.refit(st.tubes, rules); return [{ type: 'matched' }];
      }
      default: return bad('unsupported ' + a.type);
    }
  }

  function legalActions(st) {
    if (st.phase !== 'build') return [];
    const out = [{ type: 'light' }];
    const f = Math.floor(st.show / 3) + 1;
    if (st.sponsor) out.push({ type: 'sponsor', accept: !st.sponsor.accepted });
    const slots = st.tubes.map((_, i) => ({ zone: 'tube', i })).concat([{ zone: 'crate', i: 0 }, { zone: 'crate', i: 1 }]);
    const cards = st.shop ? st.shop.cards : [];
    cards.forEach((c, ci) => { if (!c.sold && c.cost <= st.coins) for (const sl of slots) if (!getSlot(st, sl)) out.push({ type: 'buy', card: ci, to: sl }); });
    cards.forEach((c, ci) => { if (c.sold) return; for (const sl of slots) { const sh = getSlot(st, sl); if (sh && sh.id === c.id && sh.star < 3 && S.upCost(c.id, sh.star) <= st.coins) out.push({ type: 'upgrade', card: ci, to: sl }); } });
    const r = st.shop && st.shop.rig;
    if (r && !r.sold && r.cost <= st.coins) st.tubes.forEach((t, j) => { if (t.rig !== r.id && !(r.id === 'mortar' && st.tubes.some(x => x.rig === 'mortar'))) out.push({ type: 'buyRig', tube: j }); });
    if (f >= 2 && st.tubes.length < 6 && S.tubeCost(st) <= st.coins) out.push({ type: 'buyTube' });
    for (const a of slots) for (const b of slots) if (getSlot(st, a) && !(a.zone === b.zone && a.i === b.i)) out.push({ type: 'move', from: a, to: b });
    for (const a of slots) if (getSlot(st, a)) out.push({ type: 'sell', from: a });
    if (st.shop && st.coins >= (st.renown >= 3 ? 2 : 1) + st.shop.rerolls) out.push({ type: 'reroll' });
    const rules = S.rulesFor(st, st.show);
    if ((rules.includes('windshift') || rules.includes('crossed')) && st.tubes.filter(t => t.shell).length >= 2) out.push({ type: 'match' });
    if (st.kitDef.chooseCol) cards.forEach((c, ci) => { if (!c.sold && SH[c.id].col === '*') for (const col of COLS) out.push({ type: 'setColour', card: ci, col }); });
    return out;
  }

  function resolveShow(tubes, ctx = {}) {
    const r = S.resolveShow(tubes, { rule: ctx.rules || [], crowd: ctx.crowd || 0, fav: ctx.fav });
    return { ooh: r.ooh, aah: r.aah, applause: r.applause, coins: r.coins, crowdGain: r.crowdGain, cheer: r.cheer, bursts: r.bursts, maxUp: r.maxUp, colsUp: r.colsUp, colsFired: r.colsFired, fusions: r.fusions, monoShow: r.monoShow };
  }

  // Exact Shapley over occupied tubes + the Crowd (spec §8.6), returned as raw values keyed by
  // tube index plus `crowd` (they sum to the Applause).
  function shapley(tubes, rules, crowd, fav) {
    const occ = tubes.map((t, i) => (t.shell ? i : -1)).filter(i => i >= 0);
    const n = occ.length + 1; const v = new Float64Array(1 << n);
    for (let m = 1; m < 1 << n; m++) {
      const tt = tubes.map((t, i) => { const k = occ.indexOf(i); return k < 0 || !((m >> k) & 1) ? { shell: null, rig: t.rig } : t; });
      v[m] = resolveShow(tt, { rules, crowd: (m >> (n - 1)) & 1 ? crowd : 0, fav }).applause;
    }
    const fact = k => (k <= 1 ? 1 : k * fact(k - 1));
    const phi = new Array(n).fill(0);
    for (let k = 0; k < n; k++) for (let m = 0; m < 1 << n; m++) {
      if ((m >> k) & 1) continue;
      let sz = 0; for (let j = 0; j < n; j++) if ((m >> j) & 1) sz++;
      phi[k] += (fact(sz) * fact(n - sz - 1) / fact(n)) * (v[m | (1 << k)] - v[m]);
    }
    const out = {}; occ.forEach((ti, k) => { out[ti] = phi[k]; }); out.crowd = phi[n - 1];
    return out;
  }

  const target = (st, s) => (s === st.show ? S.targetFor(st, s) : S.baseTarget(st, s));

  // Reference bots in build-phase-mutator form (see header).
  let bots = null;
  if (B) {
    bots = {};
    for (const name of Object.keys(B.BOTS)) {
      const key = name === 'greedymood' ? 'greedyMood' : name;
      bots[key] = (st, ctx = {}) => B.BOTS[name](st, { ...(ctx.opts || {}), rnd: ctx.rnd });
    }
    bots.mono = arch => (st, ctx = {}) => B.BOTS.mono(st, { base: 'human', ...(ctx.opts || {}), arch, rnd: ctx.rnd });
  }

  return {
    __ref: true, __dir: dir,
    createState, step, legalActions, resolveShow, matchPerm, shapley, target,
    rulesFor: (st, s) => S.rulesFor(st, s),
    favourite: (tubes, crowd) => S.favourite(tubes, crowd),
    clone: st => structuredClone(st),
    DATA: { SHELLS: SH, FUSIONS: S.FU, RIGS: S.RIGS, HEADLINERS: S.HEAD.map(h => ({ id: h[0], min: h[1], max: h[2] })), KITS: S.KITS, TARGETS: S.TARGETS },
    bots,
  };
};
