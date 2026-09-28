'use strict';
// Spec §12.1 bots, ported from the design-time v1.1 reference bots.js onto the public SIM API
// (step / legalActions / rulesFor / resolveShow / favourite / matchPerm / target). They never
// touch SIM internals: every purchase, sale, move, reroll, Match and Sponsor goes through
// step(state, action), so an illegal action is caught and counted by the runner.
//
// The port keeps the reference's evaluation order and RNG call order, so on the reference
// adapter it reproduces the v1.1 per-seed results (see tools/balance --selftest).
//
// ctx passed to every bot: {state, rnd, act(action) → events|null, opts, last, relight, regret}
const { fest } = require('./util.cjs');

const ARCH = {
  canopy: ['willow', 'glitter', 'chrys', 'crossette', 'cake', 'kamuro', 'finale', 'waterfall'],
  mono: ['heart', 'strontium', 'palm', 'fern', 'brocade', 'puresky', 'kamuro', 'nishiki', 'bluemoon'],
  rainbow: ['palm', 'dahlia', 'tourbillon', 'prism', 'chrys', 'comet', 'heart', 'fern'],
  salvo: ['candle', 'crackle', 'crossette', 'echo', 'mine', 'horsetail', 'cake', 'barrage'],
  thunder: ['salute', 'thunder', 'comet', 'crackle', 'willow', 'chrys', 'waterfall', 'echo'],
  crowd: ['girandola', 'smiley', 'crest', 'saturn', 'kamuro', 'willow', 'glitter'],
};
const COLS = ['R', 'A', 'G', 'B'];

function makeSpecBots(api) {
  const cl = tubes => tubes.map(t => ({ shell: t.shell ? { ...t.shell } : null, rig: t.rig ?? null }));
  const withShells = (tubes, sh) => tubes.map((t, i) => ({ shell: sh[i], rig: t.rig ?? null }));

  function scoreRack(tubes, rules, crowd, H) {
    const fav = rules.includes('rival') ? api.favourite(tubes, crowd) : null;
    const r = api.resolveShow(tubes, { rules, crowd, fav });
    return H ? Math.floor((r.ooh + r.crowdGain * H) * r.aah) : r.applause;
  }
  function perms(a) {
    if (a.length <= 1) return [a];
    const out = [], seen = new Set();
    for (let i = 0; i < a.length; i++) {
      const k = a[i] ? a[i].uid + '' : '-';
      if (seen.has(k)) continue; seen.add(k);
      for (const p of perms(a.slice(0, i).concat(a.slice(i + 1)))) out.push([a[i]].concat(p));
    }
    return out;
  }
  function hill(tubes, rules, crowd, H, iters = 6) {
    let cur = tubes.map(t => t.shell), best = scoreRack(tubes, rules, crowd, H), bestSh = cur.slice();
    let imp = true, it = 0;
    while (imp && it < iters) {
      imp = false; it++;
      for (let i = 0; i < cur.length; i++) for (let j = i + 1; j < cur.length; j++) {
        if (!cur[i] && !cur[j]) continue;
        const c = cur.slice(); [c[i], c[j]] = [c[j], c[i]];
        const v = scoreRack(withShells(tubes, c), rules, crowd, H);
        if (v > best) { best = v; bestSh = c; cur = c; imp = true; }
      }
    }
    return { sh: bestSh, score: best };
  }
  function exhaustive(tubes, rules, crowd) {
    let best = -1, bs = null;
    for (const p of perms(tubes.map(t => t.shell))) { const v = scoreRack(withShells(tubes, p), rules, crowd, 0); if (v > best) { best = v; bs = p; } }
    return { sh: bs, score: best };
  }
  function refit(tubes, rules) {
    const n = tubes.length, order = api.matchPerm(n, rules);
    const out = tubes.map(t => ({ shell: null, rig: t.rig ?? null }));
    for (let j = 0; j < n; j++) out[order[j]].shell = tubes[j].shell;
    return out;
  }

  const upCost = (id, star) => { const c = api.shell(id).cost; return star === 1 ? Math.ceil(1.5 * c) : 2 * c; };
  const sellValue = sh => Math.max(1, Math.floor(0.75 * sh.paid));
  const tubeCost = st => { const e = st.renown >= 4 ? 4 : 0; return st.tubes.length === 4 ? 6 + e : st.tubes.length === 5 ? 10 + e : Infinity; };
  const newUid = st => (Number.isFinite(st.nextUid) ? st.nextUid : 1e9);
  const shopOpen = ctx => !!ctx.state.shop && !ctx.relight;
  function gauss(rnd) { const u = Math.max(1e-9, rnd()), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function headRules(st) { const r = api.rulesFor(st, st.show); if (r.length) return r; const h = st.headliners && st.headliners[fest(st.show) - 1]; return h ? [h] : []; }
  function next3(st) { const s = st.show, cap = s >= 24 ? 35 : 23; return Math.max(api.baseTarget(st, s), api.baseTarget(st, Math.min(cap, s + 1)), api.baseTarget(st, Math.min(cap, s + 2))); }

  // Arrange the tubes into the target shell order (by uid) with `move` actions (move swaps).
  function arrange(ctx, sh) {
    const want = sh.map(x => (x ? x.uid : null));
    for (let guard = 0; guard < 64; guard++) {
      const cur = ctx.state.tubes.map(t => (t.shell ? t.shell.uid : null));
      if (cur.length !== want.length) return false;
      const i = cur.findIndex((u, k) => u !== want[k]);
      if (i < 0) return true;
      let ok;
      if (want[i] !== null) { const j = cur.indexOf(want[i]); if (j < 0) return false; ok = ctx.act({ type: 'move', from: { zone: 'tube', i: j }, to: { zone: 'tube', i } }); }
      else { const k = want.indexOf(cur[i]); if (k < 0) return false; ok = ctx.act({ type: 'move', from: { zone: 'tube', i }, to: { zone: 'tube', i: k } }); }
      if (!ok) return false;
    }
    return false;
  }

  function candidates(st, card, ci, isRig) {
    const out = []; const f = fest(st.show); const tubes = st.tubes;
    if (isRig) {
      const hasM = tubes.some(t => t.rig === 'mortar');
      if (card.id === 'mortar' && hasM) return out;
      tubes.forEach((t, i) => { if (t.rig === card.id) return; const r = cl(tubes); r[i].rig = card.id; out.push({ tubes: r, cost: card.cost, kind: 'rig', acts: [{ type: 'buyRig', tube: i }] }); });
      return out;
    }
    const tw = tubes.findIndex(t => t.shell && t.shell.id === card.id && t.shell.star < 3);
    if (tw >= 0) {
      const r = cl(tubes); const uc = upCost(card.id, r[tw].shell.star); r[tw].shell.star++; r[tw].shell.paid += uc;
      out.push({ tubes: r, cost: uc, kind: 'up', acts: [{ type: 'upgrade', card: ci, to: { zone: 'tube', i: tw } }] });
    }
    const chooser = st.kit === 'chemist' && api.shell(card.id).col === '*';
    const colsTry = chooser ? COLS : [card.col];
    for (const cc of colsTry) for (let i = 0; i < tubes.length; i++) {
      const r = cl(tubes); const had = !!r[i].shell; const sold = had ? sellValue(r[i].shell) : 0;
      r[i].shell = { uid: newUid(st), id: card.id, col: cc, star: 1, paid: card.cost };
      const acts = [];
      if (had) acts.push({ type: 'sell', from: { zone: 'tube', i } });
      if (chooser && cc !== card.col) acts.push({ type: 'setColour', card: ci, col: cc });
      acts.push({ type: 'buy', card: ci, to: { zone: 'tube', i } });
      out.push({ tubes: r, cost: card.cost - sold, kind: had ? 'replace' : 'place', acts });
    }
    if (f >= 2 && tubes.length < 6 && tubes.every(t => t.shell)) {
      const tc = tubeCost(st); const r = cl(tubes);
      r.push({ shell: { uid: newUid(st), id: card.id, col: card.col, star: 1, paid: card.cost }, rig: null });
      out.push({ tubes: r, cost: card.cost + tc, kind: 'tube', acts: [{ type: 'buyTube' }, { type: 'buy', card: ci, to: { zone: 'tube', i: tubes.length } }] });
    }
    return out;
  }
  function commit(ctx, c) { for (const a of c.acts) if (!ctx.act(a)) return false; return true; }

  // Shared purchase planner. o.noise: N(0, noise) — 'eval' mode draws per candidate evaluation
  // (novice), 'card' mode once per offer per shop generation (human).
  function planner(ctx, o) {
    o = o || {};
    const st = ctx.state, s = st.show, tgt = api.baseTarget(st, s);
    const H = Math.min(4, Math.max(0, 22 - s));
    const head = headRules(st);
    const isCD = head.includes('countdown') || head.includes('countdown3');
    const noise = o.noise || 0, rnd = ctx.rnd;
    const Uraw = tubes => {
      const g = hill(tubes, [], st.crowd, H).score;
      const b = head.length ? hill(tubes, head, st.crowd, H).score : g;
      const bw = isCD ? b / 10 : b;
      return { g, b, u: Math.log(1 + 0.5 * Math.min(g, bw) + 0.5 * g) };
    };
    let rer = 0; const cardNoise = new Map();
    const nz = key => {
      if (!noise) return 0;
      if (o.noiseMode === 'card') { if (!cardNoise.has(key)) cardNoise.set(key, noise * gauss(rnd)); return cardNoise.get(key); }
      return noise * gauss(rnd);
    };
    const margin = o.buyMargin || 0;
    const buyLoop = (marg, maxSteps) => {
      for (let step = 0; step < maxSteps; step++) {
        if (!st.shop) break;
        const cur = Uraw(st.tubes);
        const comfy = cur.b >= tgt * 1.3 && cur.g >= next3(st) * 1.2;
        let best = null, bv = 0;
        const offers = st.shop.cards.map((c, i) => [c, false, 'c' + st.shop.rerolls + ':' + i, i]).filter(x => !x[0].sold);
        if (st.shop.rig && !st.shop.rig.sold) offers.push([st.shop.rig, true, 'rig' + st.shop.rerolls, -1]);
        const vals = [];
        for (const [card, isRig, key, ci] of offers) {
          if (o.allow && !isRig && !o.allow.includes(card.id)) continue;
          let bestHere = -9, bestC = null;
          for (const c of candidates(st, card, ci, isRig)) {
            if (c.cost > st.coins) continue;
            const v = Uraw(c.tubes);
            const lost = Math.floor(st.coins / 5) - Math.floor((st.coins - c.cost) / 5) > 0 ? 1 : 0;
            let val = v.u - cur.u - (comfy ? 0.04 * lost : 0) - 0.004 * c.cost;
            if (o.noiseMode !== 'card') val += nz();
            if (val > bestHere) { bestHere = val; bestC = c; }
          }
          if (bestC && o.noiseMode === 'card') bestHere += nz(key);
          vals.push(bestHere);
          if (bestC && bestHere > bv && bestHere > marg) { bv = bestHere; best = { card, c: bestC, isRig }; }
        }
        if (step === 0 && o.regret && marg === margin) { const vv = [...vals, 0].sort((a, b) => b - a); o.regret.push({ s, gap: vv[0] - vv[1] }); }
        if (!best) {
          const rc = (st.renown >= 3 ? 2 : 1) + st.shop.rerolls;
          if (rer < (o.maxRerolls ?? 2) && st.coins >= rc + 5 && !comfy) { if (!ctx.act({ type: 'reroll' })) break; rer++; step--; continue; }
          break;
        }
        if (!commit(ctx, best.c)) break;
      }
    };
    buyLoop(margin, 6);
    return { buyLoop };
  }

  function arrangeOracle(ctx) { const st = ctx.state; const rules = api.rulesFor(st, st.show); arrange(ctx, exhaustive(st.tubes, rules, st.crowd).sh); }
  // Human arrangement: Match if it helps under Wind Shift / Crossed Wires; one hill pass; more
  // passes (and a second, margin-0 purchase loop) while the mood reads below Eager.
  function arrangeHuman(ctx, o, buyLoop) {
    const st = ctx.state; const rules = api.rulesFor(st, st.show); const tgt = api.baseTarget(st, st.show);
    const cur = () => scoreRack(st.tubes, rules, st.crowd, 0);
    if (rules.includes('windshift') || rules.includes('crossed')) { const rf = refit(st.tubes, rules); if (scoreRack(rf, rules, st.crowd, 0) > cur()) ctx.act({ type: 'match' }); }
    arrange(ctx, hill(st.tubes, rules, st.crowd, 0, 1).sh);
    if (o.mood !== false && cur() < 1.25 * tgt) {
      arrange(ctx, hill(st.tubes, rules, st.crowd, 0, 3).sh);
      if (cur() < 1.25 * tgt && buyLoop && st.coins >= 3) { buyLoop(0, 3); arrange(ctx, hill(st.tubes, rules, st.crowd, 0, 3).sh); }
    }
  }

  const fvCache = new Map();
  function faceValue(sh) {
    const k = sh.id + ':' + sh.col;
    if (fvCache.has(k)) return fvCache.get(k);
    const row = api.shell(sh.id);
    const v = api.resolveShow([{ shell: { uid: 1, id: sh.id, col: sh.col, star: 1, paid: row.cost }, rig: null }], { rules: [], crowd: 0 }).applause + row.aah * 20 + row.cost;
    fvCache.set(k, v); return v;
  }
  function shuffle(ctx) {
    const sh = ctx.state.tubes.map(t => t.shell);
    for (let i = sh.length - 1; i > 0; i--) { const j = Math.floor(ctx.rnd() * (i + 1)); [sh[i], sh[j]] = [sh[j], sh[i]]; }
    arrange(ctx, sh);
  }

  const BOTS = {
    donothing() {},
    random(ctx) {
      const st = ctx.state, rnd = ctx.rnd;
      if (!shopOpen(ctx)) { shuffle(ctx); return; }
      for (let t = 0; t < 3; t++) {
        if (rnd() < 0.3) break;
        const aff = st.shop.cards.map((c, i) => [c, false, i]).filter(x => !x[0].sold && x[0].cost <= st.coins);
        if (st.shop.rig && !st.shop.rig.sold && st.shop.rig.cost <= st.coins) aff.push([st.shop.rig, true, -1]);
        if (!aff.length) break;
        const [card, isRig, ci] = aff[Math.floor(rnd() * aff.length)];
        const cs = candidates(st, card, ci, isRig).filter(c => c.cost <= st.coins);
        if (!cs.length) break;
        if (!commit(ctx, cs[Math.floor(rnd() * cs.length)])) break;
      }
      shuffle(ctx);
    },
    greedy(ctx) {
      const st = ctx.state; if (!shopOpen(ctx)) return; const f = fest(st.show);
      for (let t = 0; t < 5; t++) {
        const full = st.tubes.every(x => x.shell);
        if (f >= 2 && full && st.tubes.length < 6 && tubeCost(st) <= st.coins) { if (!ctx.act({ type: 'buyTube' })) break; continue; }
        const aff = st.shop.cards.map((c, i) => [c, i]).filter(([c]) => !c.sold && c.cost <= st.coins);
        if (!aff.length) break;
        aff.sort((a, b) => faceValue(b[0]) - faceValue(a[0]));
        const [card, ci] = aff[0];
        const tw = st.tubes.findIndex(x => x.shell && x.shell.id === card.id && x.shell.star < 3);
        if (tw >= 0) { const uc = upCost(card.id, st.tubes[tw].shell.star); if (uc <= st.coins) { if (!ctx.act({ type: 'upgrade', card: ci, to: { zone: 'tube', i: tw } })) break; continue; } break; }
        const e = st.tubes.findIndex(x => !x.shell);
        if (e >= 0) { if (!ctx.act({ type: 'buy', card: ci, to: { zone: 'tube', i: e } })) break; continue; }
        let wi = 0; st.tubes.forEach((x, i) => { if (faceValue(x.shell) < faceValue(st.tubes[wi].shell)) wi = i; });
        if (faceValue(card) > 1.2 * faceValue(st.tubes[wi].shell)) {
          if (!ctx.act({ type: 'sell', from: { zone: 'tube', i: wi } })) break;
          if (!ctx.act({ type: 'buy', card: ci, to: { zone: 'tube', i: wi } })) break;
        } else break;
      }
    },
    greedyMood(ctx) {
      BOTS.greedy(ctx);
      const st = ctx.state; const rules = api.rulesFor(st, st.show); const tgt = api.baseTarget(st, st.show);
      if (scoreRack(st.tubes, rules, st.crowd, 0) < 0.85 * tgt) arrange(ctx, hill(st.tubes, rules, st.crowd, 0, 1).sh);
    },
    oracle(ctx) { const o = { ...(ctx.opts || {}), regret: ctx.regret || null }; if (shopOpen(ctx)) planner(ctx, o); arrangeOracle(ctx); },
    human(ctx) {
      const o = { noise: 0.10, noiseMode: 'card', buyMargin: 0.03, maxRerolls: 1, ...(ctx.opts || {}) };
      let bl = null; if (shopOpen(ctx)) bl = planner(ctx, o).buyLoop;
      arrangeHuman(ctx, o, bl);
    },
    novice(ctx) {
      const o = { noise: 0.10, noiseMode: 'eval', buyMargin: 0.03, ...(ctx.opts || {}) };
      if (shopOpen(ctx)) planner(ctx, o);
      const st = ctx.state; const rules = api.rulesFor(st, st.show);
      arrange(ctx, hill(st.tubes, rules, st.crowd, 0, 1).sh);
    },
    mono(ctx) {
      const o = { ...(ctx.opts || {}) };
      if (ctx.state.show >= 6) o.allow = ARCH[o.arch].concat(['peony', 'strobe']);
      const sub = { ...ctx, opts: o, regret: null };
      if (o.base === 'human') BOTS.human(sub); else BOTS.oracle(sub);
    },
  };

  // Fair Weather relight build (no shop): like the reference, the oracle re-solves, others
  // re-arrange as the human does.
  function relightBuild(bot, ctx) { if (bot === 'oracle') arrangeOracle(ctx); else if (bot !== 'donothing' && bot !== 'greedy') arrangeHuman(ctx, { ...(ctx.opts || {}) }, null); }

  function build(bot, ctx) {
    if (ctx.relight) return relightBuild(bot, ctx);
    const fn = BOTS[bot]; if (!fn) throw new Error('unknown bot ' + bot);
    fn(ctx);
  }

  function sponsorPick(bot, ctx) {
    const st = ctx.state, o = ctx.opts || {};
    if (!st.sponsor || ctx.relight) return false;
    if (o.noSponsor) return false;
    const rules = api.rulesFor(st, st.show); const base = api.baseTarget(st, st.show);
    const withS = st.sponsor.accepted ? api.target(st, st.show) : api.target({ ...st, sponsor: { ...st.sponsor, accepted: true } }, st.show);
    const sc = scoreRack(st.tubes, rules, st.crowd, 0);
    const b = bot === 'mono' ? (o.base === 'human' ? 'human' : 'oracle') : bot;
    if (bot === 'random') return ctx.rnd() < 0.3;
    if (b === 'oracle') return sc >= 1.5 * base * (st.rain ? 1.25 : 1.45);
    if (b === 'human') {
      if (o.sponsorRule === 'lesson') { const last = ctx.last; return !!last && last.applause >= 2 * last.target && st.rain > 0; }
      if (sc >= 1.25 * withS) return true;
      if (o.bold && st.rain > 0 && sc >= 0.85 * withS) return true;
      return false;
    }
    if (bot === 'novice') { const last = ctx.last; if (!last) return false; return last.applause >= 2 * last.target && st.rain > 0; }
    return false;
  }

  // Oracle decision gap at the start of a build, evaluated on a clone (used when the SIM's own
  // bots play and so do not report their planner values).
  function regretProbe(st) {
    const out = [];
    const tmp = { state: api.clone(st), rnd: () => 0.5, act: () => null, relight: false };
    try { planner(tmp, { regret: out, maxRerolls: 0 }); } catch (e) { return []; }
    return out.slice(0, 1);
  }

  // Exact Shapley values over occupied tubes + the Crowd (§8.6); returns {phi:[...], occ:[...], full}.
  function shapleyExact(tubes, rules, crowd, fav) {
    const occ = tubes.map((t, i) => (t.shell ? i : -1)).filter(i => i >= 0);
    const n = occ.length + 1; const v = new Float64Array(1 << n);
    for (let m = 1; m < 1 << n; m++) {
      const tt = tubes.map((t, i) => { const k = occ.indexOf(i); return k < 0 || !((m >> k) & 1) ? { shell: null, rig: t.rig ?? null } : t; });
      v[m] = api.resolveShow(tt, { rules, crowd: (m >> (n - 1)) & 1 ? crowd : 0, fav }).applause;
    }
    const F = [1]; for (let k = 1; k <= n; k++) F[k] = F[k - 1] * k;
    const phi = new Array(n).fill(0);
    for (let k = 0; k < n; k++) for (let m = 0; m < 1 << n; m++) {
      if ((m >> k) & 1) continue;
      let sz = 0; for (let j = 0; j < n; j++) if ((m >> j) & 1) sz++;
      phi[k] += ((F[sz] * F[n - sz - 1]) / F[n]) * (v[m | (1 << k)] - v[m]);
    }
    return { phi, occ, full: v[(1 << n) - 1] };
  }

  return { BOTS, build, sponsorPick, scoreRack, hill, exhaustive, perms, withShells, refit, faceValue, regretProbe, shapleyExact, upCost, sellValue, tubeCost, arrange, ARCH };
}

module.exports = { makeSpecBots, ARCH };
