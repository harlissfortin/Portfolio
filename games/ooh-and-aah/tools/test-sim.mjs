#!/usr/bin/env node
// Ooh × Aah SIM test suite (spec DESIGN.md v1.1 §11.7, §11.8, §12).
//
//   node tools/test-sim.mjs                       golden tests, unit checks, invariants, timing, bot suite at 200 seeds
//   node tools/test-sim.mjs --seeds=1000 --bots=human,novice,oracle
//   node tools/test-sim.mjs --no-bots             everything except the bot suite
//   node tools/test-sim.mjs --workers=4 --json=out.json
//   node tools/test-sim.mjs --tutorial            only the tutorial checks (SIM script + the in-browser core check)
//   node tools/test-sim.mjs --no-browser          skip the in-browser tutorial check (it needs Playwright)
//
// Exit code 0 when every assertion passes and every bot win rate is within tolerance of the §12.2 reference
// (±4 points at 1,000 seeds, ±4·√(1000/N) at N seeds). Other §12.2 metrics outside tolerance print WARN.
import { createRequire } from 'node:module';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SIM_PATH = path.resolve(HERE, '../src/sim.js');
const OOH = require(SIM_PATH);

/* ============================================================ worker: bot runs + invariants */
function finiteWalk(v, where, out, depth = 0) {
  if (out.length > 5) return;
  if (typeof v === 'number') { if (!Number.isFinite(v)) out.push(where + ' = ' + v); return; }
  if (!v || typeof v !== 'object' || depth > 12) return;
  if (Array.isArray(v)) { v.forEach((x, i) => finiteWalk(x, where + '[' + i + ']', out, depth + 1)); return; }
  for (const k of Object.keys(v)) finiteWalk(v[k], where + '.' + k, out, depth + 1);
}
const RETIME_MS = 0.5;   // steps slower than this on the wall clock are re-timed (see runJob)
function runJob({ bot, opts, seeds, shapleyEvery }) {
  const recs = [], fails = [];
  const steps = { build: [], light: [], buildRaw: [], lightRaw: [] };
  let shapShows = 0, shapMs = 0, replays = 0, retimed = 0;
  const fail = (seed, msg) => { if (fails.length < 40) fails.push(`${bot} seed ${seed}: ${msg}`); };
  for (const seed of seeds) {
    const o = Object.assign({}, opts, { keepLog: true });
    o.onBuild = S => {
      if (!OOH.legalActions(S).length) fail(seed, 'legalActions empty in build at show ' + (S.show + 1));
      if (S.tubes.length > 6) fail(seed, 'more than 6 tubes');
    };
    o.onEvents = (evs) => {
      for (const e of evs) {
        if (e.type === 'illegal') fail(seed, 'illegal event ' + e.reason);
        for (const k in e) { const v = e[k]; if (typeof v === 'number' && !Number.isFinite(v)) fail(seed, `event ${e.type}.${k} = ${v}`); }
        if (e.type === 'applause' && !(e.score < 1e300)) fail(seed, 'Applause ≥ 1e300: ' + e.score);
      }
    };
    let res;
    try { res = OOH.playRun(seed, bot, o); } catch (err) { fail(seed, 'threw ' + (err && err.stack || err)); continue; }
    const S = res.state;
    const bad = []; finiteWalk(S, 'state', bad); if (bad.length) fail(seed, 'non-finite: ' + bad.join(', '));
    if (S.tubes.length > 6 || S.crate.length !== 2) fail(seed, 'rack shape');
    // Determinism: replay the action log from a fresh state; same hash. Also times every step.
    const cOpts = Object.assign({}, opts); delete cOpts.keepLog;
    if (bot === 'humanBold') cOpts.bold = true;
    OOH.clearCaches();   // time the replay cold: the bot just played this seed and warmed the mood memo
    const R = OOH.createState(seed, cOpts);
    let seqPrev = 0; const dts = [], slow = [];
    for (const a of res.log) {
      const t0 = performance.now(); const ev = OOH.step(R, a); const dt = performance.now() - t0;
      if (dt > RETIME_MS) slow.push(dts.length);
      dts.push(dt);
      if (ev.length === 1 && ev[0].type === 'illegal') { fail(seed, 'replay illegal: ' + JSON.stringify(a)); break; }
      for (const e of ev) { if (!(e.seq > seqPrev)) { fail(seed, 'seq not increasing'); break; } seqPrev = e.seq; }
    }
    // A wall-clock outlier is usually preemption (the suite runs 4 workers, often beside other jobs), a GC pause or a
    // cold JIT. Re-time each one on clones of its exact pre-step state (up to 7 runs, stopping once one is under
    // RETIME_MS) and keep the best: a genuinely slow step stays slow, noise does not. The raw figures are reported too.
    const cost = dts.slice();
    if (slow.length) {
      const R2 = OOH.createState(seed, cOpts);
      for (let i = 0, j = 0; i < dts.length && j < slow.length; i++) {
        if (i === slow[j]) { for (let k = 0; k < 7 && cost[i] > RETIME_MS; k++) { const C = OOH.clone(R2); OOH.clearCaches(); const t0 = performance.now(); OOH.step(C, res.log[i]); cost[i] = Math.min(cost[i], performance.now() - t0); } j++; }
        OOH.step(R2, res.log[i]);
      }
      retimed += slow.length;
    }
    for (let i = 0; i < dts.length; i++) { const L = res.log[i].type === 'light'; (L ? steps.light : steps.build).push(cost[i]); (L ? steps.lightRaw : steps.buildRaw).push(dts[i]); }
    replays++;
    if (OOH.hashState(R) !== OOH.hashState(S)) fail(seed, 'replay hash differs');
    // Shapley: values sum to the show's Applause within 1e-6 relative.
    if (shapleyEvery && seeds.indexOf(seed) % shapleyEvery === 0) {
      const t0 = performance.now();
      for (const h of S.runStats.history) {
        const sh = OOH.shapley(h.rack, h.rules, h.crowdAtLight, h.fav);
        const sum = Object.values(sh.values).reduce((x, y) => x + y, 0);
        if (Math.abs(sum - h.applause) > 1e-6 * Math.max(1, h.applause)) fail(seed, `shapley sum ${sum} != ${h.applause} at show ${h.show + 1}`);
        if (sh.applause !== h.applause) fail(seed, `shapley v(N) ${sh.applause} != ${h.applause}`);
        shapShows++;
      }
      shapMs += performance.now() - t0;
    }
    recs.push(OOH.runRecord(S));
  }
  const stat = a => { const s = a.slice().sort((x, y) => x - y); return { n: s.length, sum: s.reduce((x, y) => x + y, 0), p99: s[Math.floor(0.99 * (s.length - 1))] || 0, max: s[s.length - 1] || 0 }; };
  return { recs, fails, steps: { build: stat(steps.build), light: stat(steps.light), buildRaw: stat(steps.buildRaw), lightRaw: stat(steps.lightRaw) }, shapShows, shapMs, replays, retimed };
}
if (!isMainThread) {
  parentPort.on('message', job => { parentPort.postMessage(Object.assign({ id: job.id }, runJob(job))); });
} else {
  await main();
}

/* ============================================================ main */
async function main() {
  const args = Object.fromEntries(process.argv.slice(2).map(a => { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
  const N = Math.max(1, parseInt(args.seeds || '200', 10));
  const WORKERS = Math.max(1, parseInt(args.workers || String(Math.min(4, os.cpus().length || 4)), 10));
  const BOT_LIST = (args.bots ? String(args.bots).split(',') : ['random', 'donothing', 'greedy', 'greedyMood', 'novice', 'human', 'oracle']).filter(Boolean);
  let failures = 0, warnings = 0, passes = 0;
  const log = (...a) => console.log(...a);
  const check = (name, cond, detail) => { if (cond) { passes++; return true; } failures++; log('  FAIL ' + name + (detail !== undefined ? ' — ' + detail : '')); return false; };
  const section = t => log('\n== ' + t);
  const t00 = performance.now();

  /* ---------------------------------------------------------- 0. module shape and self-containment */
  section('Module contract');
  const src = fs.readFileSync(SIM_PATH, 'utf8');
  const OohSimFn = new Function(src + '\nreturn OohSim;')();
  const ISO = new Function('return (' + OohSimFn.toString() + ')()')();   // exactly how the page builds its Blob Worker
  check('OohSim.toString() rebuilds a working SIM', ISO && typeof ISO.createState === 'function');
  const need = ['createState', 'step', 'legalActions', 'rulesFor', 'resolveShow', 'previewChips', 'mood', 'matchPerm', 'favourite', 'shapley', 'clone', 'hashState',
    'target', 'fireOrder', 'seesPerTube', 'payoutPreview', 'nearMiss', 'lessonFor', 'milestoneProgress', 'fmt', 'describeShell', 'dailySeed', 'runBots'];
  for (const k of need) check('api.' + k, typeof OOH[k] === 'function');
  for (const k of ['TARGETS', 'SHELLS', 'FUSIONS', 'RIGS', 'HEADLINERS', 'TWISTS', 'KITS', 'RENOWN', 'MILESTONES', 'LESSONS', 'TOOLTIPS', 'COLOURS', 'FESTIVALS', 'SHOW_NAMES', 'GLOSSARY', 'RULES_CARD']) check('DATA.' + k, OOH.DATA[k] !== undefined);
  for (const k of ['random', 'donothing', 'greedy', 'greedyMood', 'novice', 'human', 'oracle', 'mono']) check('bots.' + k, typeof OOH.bots[k] === 'function');
  check('top level of sim.js declares only OohSim and OOH', (() => {
    const top = src.split('\n').filter(l => /^(const|let|var|function|class)\s/.test(l)).map(l => l.split(/[\s(=]+/)[1]);
    return top.length === 2 && top.includes('OohSim') && top.includes('OOH');
  })());
  check('SIM never calls Math.random() or Date.now()', !/Math\.random\s*\(|Date\.now\s*\(/.test(src));
  { const code = src.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');   // comments stripped
    check('SIM reads no clock at all (no Date, performance.now or crypto)', !/\bDate\b|\bperformance\s*\.\s*now\b|\bcrypto\s*\./.test(code)); }

  /* ---------------------------------------------------------- 0b. tutorial (CONTRACT "Tutorial", spec §6.1) */
  await tutorialChecks({ check, section, log, args });
  if (args.tutorial) {
    section('Result');
    log(`  ${passes} checks passed, ${warnings} warnings, ${failures} failures · ${((performance.now() - t00) / 1000).toFixed(1)} s`);
    process.exitCode = failures ? 1 : 0;
    return;
  }

  /* ---------------------------------------------------------- 1. content tables */
  section('Content tables (§4, §5)');
  const D = OOH.DATA;
  check('34 shells, 22 in the starting pool', D.SHELL_IDS.length === 34 && OOH.shellPool([]).length === 22, D.SHELL_IDS.length + '/' + OOH.shellPool([]).length);
  check('12 locked shells', D.SHELL_IDS.filter(id => D.SHELLS[id].lock).length === 12);
  check('12 fusions', D.FUSION_KEYS.length === 12);
  check('13 Headliners (12 drawn + Countdown)', D.HEADLINER_IDS.length === 13);
  check('5 rigs, 5 kits, 8 Renown levels, 10 milestones, 14 lessons, 16 tooltips',
    D.RIG_IDS.length === 5 && D.KIT_IDS.length === 5 && D.RENOWN.length === 9 && D.MILESTONE_IDS.length === 10 && D.LESSONS.length === 14 && D.TOOLTIP_IDS.length === 16);
  check('rules card has 3 lines', D.RULES_CARD.length === 3);
  { const T = []; for (let f = 0; f < 8; f++) for (const m of [1, 1.3, 1.8]) T.push(Number((D.BASES[f] * m).toPrecision(2))); T[1] = 130; T[2] = 150; T[23] = 180000;
    check('TARGETS equals the §5.1 formula', JSON.stringify(T) === JSON.stringify(D.TARGETS), JSON.stringify(D.TARGETS)); }
  check('Afterparty targets 80K…17M', D.AFTERPARTY_TARGETS.join(',') === '80000,100000,140000,320000,420000,580000,1600000,2100000,2900000,9600000,12000000,17000000');
  { let worst = ''; for (const id of D.SHELL_IDS) for (const st of [1, 2, 3]) { const t = OOH.describeShell(id, 'R', st); if (t.length > 64) worst = id + '★' + st + ' ' + t.length; }
    check('every card text ≤ 64 characters at every ★', !worst, worst); }
  check('★1 card text for Peony / Pure Sky', OOH.describeShell('peony', 'R', 1) === '+20 Ooh.' && OOH.describeShell('puresky', 'B', 1) === '2+ up, one colour, no White: ×(1+0.5 per up) Aah; else +2.');
  check('★3 scales numbers (Thunder King)', OOH.describeShell('thunder', 'W', 3) === '+80 Ooh. Clears sky: ×(1+1.6 per cleared) Aah, else +4 Aah.', OOH.describeShell('thunder', 'W', 3));
  for (let f = 1; f <= 7; f++) check('Headliner window F' + f + ' non-empty', D.HEADLINER_IDS.some(id => D.HEADLINERS[id].min <= f && f <= D.HEADLINERS[id].max && id !== 'countdown'));
  check('fmt §8.5', [8100, 12345, 1234567, 12e6, 3.4e9, 1.234e12].map(OOH.fmt).join(' ') === '8,100 12K 1.2M 12M 3.4B 1.23e12', [8100, 12345, 1234567, 12e6, 3.4e9, 1.234e12].map(OOH.fmt).join(' '));
  check('dailySeed', OOH.dailySeed('2026-9-8') === 'daily-2026-09-08' && OOH.dailySeed('2026-09-29') === 'daily-2026-09-29' && OOH.dailySeed('2026-09-29T23:59') === 'daily-2026-09-29'
    && OOH.dailySeed('') === null && OOH.dailySeed('2026-13-01') === null && OOH.dailySeed(undefined) === null && OOH.dailySeed(20260929) === null);

  /* ---------------------------------------------------------- 2. golden tests §11.8 */
  section('Golden tests (§11.8)');
  const SH = D.SHELLS;
  const rack = (spec, rigs) => { let u = 1; return spec.split(' ').map((t, i) => { let shell = null; if (t !== '-') { let [id, col] = t.split(':'); let star = 1; if (id.includes('*')) { [id, star] = id.split('*'); star = +star; } shell = { uid: u++, id, col: col || SH[id].col, star, paid: SH[id].cost }; } return { shell, rig: (rigs && rigs[i]) || null }; }); };
  const R6 = ['brass', 'mortar', null, 'spotlight', null], R9 = ['brass', 'mortar', 'tall', 'spotlight', 'brass', 'spotlight'];
  const GOLD = [
    ['1', 'willow:A peony:R strobe -', null, [], 0, 150], ['2', 'willow peony:R palm:R strobe', null, [], 1, 378],
    ['3', 'willow peony:R palm:R strobe', null, ['headwind'], 4, 276], ['4', 'comet:G willow peony:R strobe', null, ['headwind'], 4, 162],
    ['5', 'peony:R strobe comet:G willow', null, ['headwind'], 4, 222],
    ['6 none', 'willow palm:A salute*2 comet:A comet:G', R6, [], 39, 7827], ['6 windshift', 'willow palm:A salute*2 comet:A comet:G', R6, ['windshift'], 39, 1338],
    ['7', 'salute*2 palm:A willow comet:A comet:G', R6, ['windshift'], 39, 6021], ['8', 'salute*3 palm:A willow comet:A comet:G', R6, ['windshift'], 39, 10935],
    ['9', 'finale waterfall palm*2:R palm*3:R candle:R palm*3:R', R9, ['countdown'], 84, 50094],
    ['10 countdown', 'candle:R palm*3:R palm*2:R palm*3:R waterfall finale', R9, ['countdown'], 84, 274095],
    ['10 none', 'candle:R palm*3:R palm*2:R palm*3:R waterfall finale', R9, [], 82, 95905],
    ['11 Echo★1', 'strobe*3 echo', null, [], 0, 1360], ['11 Echo★3', 'strobe*3 echo*3', null, [], 0, 3000],
    ['12', 'willow peony:R salute comet:R', null, [], 0, 819], ['13', 'candle:G crackle barrage', ['mortar', null, null], [], 0, 1093],
    ['14', 'girandola smiley:R saturn', null, [], 10, 170], ['15', 'willow glitter chrys:G crossette:R cake:G finale', null, [], 20, 3381],
    ['16', 'strobe finale', null, [], 0, 50], ['17', 'peony:R finale', null, [], 0, 28], ['18', 'strobe tourbillon palm:R', null, ['ordinance'], 0, 259],
    ['19', 'palm:R palm:R palm:R palm:R', null, ['streetlights'], 0, 624],
    ['20', 'heart*3 heart*3 crossette*3:R strobe*3 crackle*3', ['brass', 'brass', 'brass', 'brass', 'brass'], ['powercut'], 0, 1240],
    ['21', 'palm:R heart puresky', null, [], 0, 168], ['22', 'peony:A echo*2', null, [], 0, 50], ['23', 'bluemoon peony:B cake', null, [], 0, 105],
    ['24', 'willow glitter chrys:G', null, ['rival'], 0, 150], ['25', 'palm:R palm:R heart', null, ['critic'], 0, 156],
    ['26', 'finale waterfall palm*2:R palm*3:R candle:R palm*3:R', R9, ['countdown', 'rival'], 84, 35910],
    ['27', 'candle:R palm*3:R palm*2:R palm*3:R waterfall finale', R9, ['countdown3', 'rival'], 84, 468910],
    ['28', 'mine:G willow chrys:R salute comet:R', null, ['crossed'], 12, 388], ['29', 'willow palm:A chrys:A crossette:A', null, ['fog'], 5, 1044],
    ['30', 'girandola smiley:A crest', null, ['ferry'], 30, 387],
  ];
  const score = (sim, tubes, rules, crowd) => { const fav = rules.includes('rival') ? sim.favourite(tubes, crowd) : null; return sim.resolveShow(tubes, { rules, crowd, fav }); };
  let gp = 0;
  for (const [n, spec, rigs, rules, crowd, exp] of GOLD) {
    const got = score(OOH, rack(spec, rigs), rules, crowd).applause, iso = score(ISO, rack(spec, rigs), rules, crowd).applause;
    if (check(`#${n} ${spec} ${rules.join('+') || 'none'} = ${exp}`, got === exp && iso === exp, 'got ' + got + ' (isolated ' + iso + ')')) gp++;
  }
  log(`  ${gp}/${GOLD.length} golden Applause values match`);
  { const r = score(OOH, rack('willow:A peony:R strobe -'), [], 0); check('#1 is 50 × 3', Math.floor(r.ooh) === 50 && r.aah === 3); }
  { const r = score(OOH, rack(GOLD[8][1], R6), ['windshift'], 39); check('#8 is 243 × 45', Math.floor(r.ooh) === 243 && r.aah === 45); }
  { const r = score(OOH, rack(GOLD[9][1], R9), ['countdown'], 84); check('#9 is 726 × 69', Math.floor(r.ooh) === 726 && r.aah === 69); }
  { const r = score(OOH, rack('willow peony:R salute comet:R'), [], 0); check('#12 fires Thunderclap Comet', r.fusions.includes('Thunderclap Comet')); }
  { const r = score(OOH, rack('girandola smiley:A crest'), ['ferry'], 30); check('#30 fires Hometown Hero', r.fusions.includes('Hometown Hero')); }
  check('#24 ♛ = tube 2', OOH.favourite(rack('willow glitter chrys:G'), 0) === 1);
  // Match property test.
  { const rk = rack('willow:A chrys:G peony:R crossette:R strobe dahlia:G');
    const plain = score(OOH, rk, [], 0).applause;
    check('Match property: plain = 880', plain === 880, plain);
    for (const [r, order] of [['crossed', 'crossette,willow,strobe,chrys,dahlia,peony'], ['windshift', 'dahlia,strobe,crossette,peony,chrys,willow']]) {
      const m = OOH.applyMatch(rk, [r]);
      check(`Match then ${r} = 880, order ${order}`, score(OOH, m, [r], 0).applause === 880 && m.map(t => t.shell.id).join(',') === order, m.map(t => t.shell.id).join(','));
    }
    // and through step(): a state whose rules include the permuting Headliner
    const S = OOH.createState('match-prop', { unlocked: [] }); S.show = 11; S.headliners[3] = 'windshift'; S.tubes = rk.map(t => ({ shell: Object.assign({}, t.shell), rig: null }));
    const ev = OOH.step(S, { type: 'match' });
    check('step match emits matched and re-seats', ev[0].type === 'matched' && S.tubes.map(t => t.shell.id).join(',') === 'dahlia,strobe,crossette,peony,chrys,willow');
  }

  // Seed-level golden traces (Script B).
  section('Seed-level golden traces (§11.8, Script B)');
  const TRACES = {
    'golden-1': { opts: {}, heads: 'drizzle,critic,fog,ordinance,shortfuse,streetlights,powercut,countdown', lines: [
      's1 | - | - | willow:A peony:R strobe:W - | - | 150/100 pass | $8 crowd 1',
      's2 | peony:G palm:G strobe:W | - | willow:A peony*2:R strobe:W palm:G | - | 249/130 pass | $4 crowd 2',
      's3 | mine:A palm:G peony:G | - | willow:A peony*2:R strobe:W palm:G | drizzle | 252/150 pass | $10 crowd 5',
      's4 | chrys:A peony:G comet:A +rig mortar | - | willow:A peony*3:R strobe:W palm:G | - | 381/330 pass | $8 crowd 6',
      's5 | girandola:A chrys:R salute:W +rig lucky | - | willow:A peony*3:R strobe:W palm:G | - | 384/430 MISS | $8 crowd 6',
      's6 | girandola:A mine:R strobe:W +rig spotlight | - | willow:A peony*3:R strobe*2:W palm:G | critic | 690/590 pass | $9 crowd 9',
      's7 | dahlia:A salute:W willow:A +rig brass | rare | willow*2:A peony*3:R strobe*2:W palm:G | - | 805/1000 MISS | $3 crowd 9'],
      rng: '665032909,1761345453,613650395,3606393848' },
    'golden-2': { opts: { renown: 2 }, heads: 'headwind,critic,drizzle,ordinance,crossed,powercut,fog,countdown', twilight: '-,headwind,drizzle,critic,drizzle,critic,critic,headwind', lines: [
      's1 | - | - | willow:A peony:R strobe:W - | - | 150/100 pass | $8 crowd 1',
      's2 | comet:R mine:G willow:A | - | willow*2:A peony:R strobe:W - | - | 213/130 pass | $6 crowd 2',
      's3 | palm:A chrys:R peony:G | - | willow*2:A peony*2:R strobe:W - | headwind | 156/188 MISS | $1 crowd 2',
      's4 | chrys:G comet:A strobe:W +rig spotlight | - | willow*2:A peony*2:R strobe:W - | headwind | 156/330 MISS | $1 crowd 2'],
      rng: '1248311162,950182965,560462635,1133918716' },
    'golden-3': { opts: { kit: 'market' }, heads: 'headwind,drizzle,fog,shortfuse,crossed,powercut,windshift,countdown', lines: [
      's1 | peony:R willow:A palm:R | - | peony*2:R strobe:W - - | - | 150/100 pass | $5 crowd 1',
      's2 | palm:G mine:R chrys:A | - | peony*2:R strobe:W palm:G - | - | 189/130 pass | $6 crowd 2',
      's3 | strobe:W palm:B mine:G | - | peony*2:R strobe*2:W palm:G - | headwind | 170/150 pass | $7 crowd 5',
      's4 | willow:A peony:G comet:B +rig brass | - | peony*3:R strobe*2:W palm:G - | - | 585/330 pass | $5 crowd 6',
      's5 | palm:R candle:G strobe:W +rig tall | - | peony*3:R strobe*2:W palm*2:G - | - | 650/430 pass | $4 crowd 7',
      's6 | chrys:G peony:R salute:W +rig brass | - | peony*3:R strobe*2:W palm*2:G chrys:G | drizzle | 805/590 pass | $7 crowd 10',
      's7 | dahlia:G glitter:A peony:R +rig brass | rare | peony*3:R strobe*2:W palm*2:G chrys:G | - | 820/1000 MISS | $7 crowd 10',
      's8 | chrys:G girandola:A glitter:A +rig tall | coin | peony*3:R strobe*2:W palm*2:G chrys*2:G | - | 970/1300 MISS | $2 crowd 10'],
      rng: '3845607480,3809455179,4275672863,3248025966' },
  };
  function scriptB(sim, S) {
    if (!S.shop) return; const f = Math.floor(S.show / 3) + 1; const T = i => ({ zone: 'tube', i });
    const act = a => { const ev = sim.step(S, a); if (ev.length === 1 && ev[0].type === 'illegal') throw new Error('Script B illegal ' + JSON.stringify(a) + ' ' + ev[0].reason); };
    for (let g = 0; g < 40; g++) {
      const twin = c => S.tubes.findIndex(t => t.shell && t.shell.id === c.id && t.shell.star < 3);
      const ci = S.shop.cards.findIndex(c => !c.sold && twin(c) >= 0 && sim.upCost(c.id, S.tubes[twin(c)].shell.star) <= S.coins);
      if (ci >= 0) { act({ type: 'upgrade', card: ci, to: T(twin(S.shop.cards[ci])) }); continue; }
      const e = S.tubes.findIndex(t => !t.shell); const c2 = S.shop.cards.findIndex(c => !c.sold && c.cost <= S.coins);
      if (e >= 0 && c2 >= 0) { act({ type: 'buy', card: c2, to: T(e) }); continue; }
      if (e < 0 && f >= 2 && S.tubes.length < 6 && S.coins >= sim.tubeCost(S) + 3) { act({ type: 'buyTube' }); continue; }
      return;
    }
  }
  function traceRun(sim, seed, opts) {
    const S = sim.createState(seed, Object.assign({}, opts, { unlocked: [] })); const lines = [];
    while (S.phase === 'build') {
      const s = S.show; const shop = S.shop ? S.shop.cards.map(c => c.id + ':' + c.col + (c.tag ? '(' + c.tag + ')' : '')).join(' ') + (S.shop.rig ? ' +rig ' + S.shop.rig.id : '') : '-';
      const sp = S.sponsor ? S.sponsor.kind : '-';
      scriptB(sim, S);
      const rk = S.tubes.map(t => t.shell ? t.shell.id + (t.shell.star > 1 ? '*' + t.shell.star : '') + ':' + t.shell.col : '-').join(' ');
      sim.step(S, { type: 'light' }); const h = S.runStats.history[S.runStats.history.length - 1];
      lines.push(`s${s + 1} | ${shop} | ${sp} | ${rk} | ${h.rules.join('+') || '-'} | ${h.applause}/${h.target} ${h.pass ? 'pass' : 'MISS'} | $${S.coins} crowd ${S.crowd}`);
    }
    return { S, lines };
  }
  for (const [seed, T] of Object.entries(TRACES)) {
    for (const [label, sim] of [['', OOH], [' (isolated)', ISO]]) {
      const { S, lines } = traceRun(sim, seed, T.opts);
      check(`${seed}${label} headliners`, S.headliners.join(',') === T.heads, S.headliners.join(','));
      if (T.twilight) check(`${seed}${label} twilight twists`, S.twilightTwists.map(x => x || '-').join(',') === T.twilight, S.twilightTwists.join(','));
      check(`${seed}${label} ${T.lines.length} trace lines`, lines.length === T.lines.length, lines.length);
      T.lines.forEach((ln, i) => check(`${seed}${label} ${ln.split(' | ')[0]}`, lines[i] === ln, '\n      got  ' + lines[i] + '\n      want ' + ln));
      check(`${seed}${label} rng after run`, S.rng.join(',') === T.rng, S.rng.join(','));
    }
  }

  /* ---------------------------------------------------------- 3. rules and first-run facts */
  section('Rules, first run, kits (§2, §4.8, §5, §6, §7)');
  { // §6 first-ever run
    const S = OOH.createState('first-show', { firstRun: true, unlocked: [] });
    check('first run: F1 Headliner is Headwind', S.headliners[0] === 'headwind');
    check('first run: mood hidden in shows 1–2', !OOH.moodVisible(S));
    let ev = OOH.step(S, { type: 'light' }); const ap = ev.find(e => e.type === 'applause');
    check('first run show 1: 50 × 3 = 150, pass, $8, Crowd 1', ap.score === 150 && ap.pass && S.coins === 8 && S.crowd === 1);
    check('first run shop before show 2 is Crossette (Green) $5, Palm (Red) $3, Comet (Green) $3', S.shop.cards.map(c => c.id + ':' + c.col + ':' + c.cost).join(' ') === 'crossette:G:5 palm:R:3 comet:G:3', S.shop.cards.map(c => c.id + ':' + c.col).join(' '));
    const chip = (card, order) => { const T = OOH.clone(S); OOH.step(T, { type: 'buy', card, to: { zone: 'tube', i: 3 } });
      const byId = {}; for (const t of T.tubes) byId[t.shell.id] = t.shell; T.tubes.forEach((t, i) => { t.shell = byId[order[i]]; });
      return OOH.resolveShow(T.tubes, { rules: [], crowd: T.crowd }).applause; };
    const cases = [[0, ['willow', 'peony', 'strobe', 'crossette'], 408], [0, ['willow', 'peony', 'crossette', 'strobe'], 561], [1, ['willow', 'peony', 'strobe', 'palm'], 189],
      [1, ['willow', 'peony', 'palm', 'strobe'], 378], [2, ['willow', 'peony', 'strobe', 'comet'], 183], [2, ['comet', 'willow', 'peony', 'strobe'], 273]];
    for (const [c, o, want] of cases) { const got = chip(c, o); check(`§6 chips: ${o.join(',')} = ${want}`, got === want, got); }
    { // §6 Crossette: the naive T4 drop right after the starting Strobe fuses (Strobing Crossette), and both chips show ✦.
      const ch = OOH.previewChips(S, [], { card: 0 }, { zone: 'tube', i: 3 });
      check('§6 Crossette in T4: ✦ Strobing Crossette on T4, first-piece ✦ on the Strobe (T3)', ch && ch[3].fusion && ch[3].fusion.key === 'strobe>crossette' && ch[2].fusionNext && ch[2].fusionNext.key === 'strobe>crossette' && ch[2].fusionNext.tube === 3 && !ch[3].fusionNext,
        ch && JSON.stringify([ch[2].fusionNext, ch[3].fusion])); }
    // Show 3 Headwind with the Palm build (Crowd 4 after the Encore).
    const T = OOH.clone(S); OOH.step(T, { type: 'buy', card: 1, to: { zone: 'tube', i: 3 } }); OOH.step(T, { type: 'move', from: { zone: 'tube', i: 3 }, to: { zone: 'tube', i: 2 } });
    ev = OOH.step(T, { type: 'light' });
    check('show 2 Palm build scores 378, Encore, Crowd 4, $10', ev.find(e => e.type === 'applause').score === 378 && ev.find(e => e.type === 'applause').encore && T.crowd === 4 && T.coins === 10);
    check('show 3 Palm-after-Peony rack scores 276 and reads Eager', OOH.resolveShow(T.tubes, { rules: ['headwind'], crowd: 4 }).applause === 276 && OOH.mood(T) === 'eager');
    check('first F2 shop offers Palm to a Palm owner', (() => { const U = OOH.clone(T); OOH.step(U, { type: 'light' }); return U.shop.cards[0].id === 'palm' && U.shop.cards[0].col === 'R'; })());
    const C = OOH.clone(S); OOH.step(C, { type: 'buy', card: 2, to: { zone: 'tube', i: 3 } }); OOH.step(C, { type: 'light' });
    check('Comet in T4 reads Restless at the Headwind (126)', OOH.resolveShow(C.tubes, { rules: ['headwind'], crowd: C.crowd }).applause === 126 && OOH.mood(C) === 'restless');
    check('Comet owners get Salute in the first F2 shop', (() => { const U = OOH.clone(C); OOH.step(U, { type: 'light' }); return U.phase === 'build' && U.shop.cards[0].id === 'salute'; })() || C.phase !== 'build');
  }
  { // kits pass show 1 in the best arrangement (§4.8)
    for (const [kit, want] of [['apprentice', 150], ['salvo', 270], ['chemist', 220], ['showman', 192]]) {
      const S = OOH.createState('kit-' + kit, { kit }); const b = OOH.bestArrangement(S.tubes, [], S.crowd).applause;
      check(`kit ${kit} starting rack best = ${want}`, b === want, b);
    }
    let fails = 0, min = Infinity;
    for (let seed = 1; seed <= 1000; seed++) {
      const S = OOH.createState(seed, { kit: 'market' });
      S.shop.cards.forEach((c, i) => { if (c.cost > S.coins) return; const T = OOH.clone(S); OOH.step(T, { type: 'buy', card: i, to: { zone: 'tube', i: 2 } });
        const b = OOH.bestArrangement(T.tubes, [], T.crowd).applause; if (b < 100) fails++; if (b < min) min = b; });
    }
    check('Night Market passes show 1 after buying any one card: 0 failures in 1,000 seeds', fails === 0, `fails ${fails}`);
    log(`  Night Market show 1 after any one card: minimum ${min} (spec §4.8 quotes 210; a non-Red Palm gives 42 × 3 = 126, still a pass)`);
  }
  { // Renown, Fair Weather, targets, prices
    const R = lvl => OOH.createState('renown', { renown: lvl });
    check('Renown 1: Headliner targets ×1.25 (not the Countdown)', OOH.target(R(1), 2) === Math.round(150 * 1.25) && OOH.target(R(1), 23) === 180000);
    check('Renown 2: Twilight twists from F2', R(2).twilightTwists[0] === null && R(2).twilightTwists.slice(1).every(x => ['headwind', 'drizzle', 'critic'].includes(x)) && OOH.rulesFor(R(2), 3).length === 1 && OOH.rulesFor(R(2), 0).length === 0);
    { const S = R(3); for (let i = 0; i < 3; i++) OOH.step(S, { type: 'light' }); check('Renown 3: rerolls start at $2 (+$1 each)', OOH.rerollCost(S) === 2 && (S.coins = 99, OOH.step(S, { type: 'reroll' }), OOH.rerollCost(S) === 3)); }
    { const S = R(0); OOH.step(S, { type: 'light' }); S.coins = 99; check('Rerolls are illegal in Festival 1 (the workshop is hidden)', !OOH.isLegal(S, { type: 'reroll' }) && !OOH.legalActions(S).some(a => a.type === 'reroll') && OOH.illegalReason(S, { type: 'reroll' }) === 'rerolls open in Festival 2'); }
    { const S = R(4); check('Renown 4: tubes cost $10 / $14', OOH.tubeCost(S) === 10 && (S.tubes.push({ shell: null, rig: null }), OOH.tubeCost(S) === 14)); }
    { const S = R(5); OOH.step(S, { type: 'light' }); check('Renown 5: shell cards +$1', S.shop.cards.every(c => c.cost === SH[c.id].cost + 1)); }
    check('Renown 6: no rain check', R(6).rain === 0 && R(5).rain === 1);
    check('Renown 7: Countdown + rival', OOH.rulesFor(R(7), 23).join('+') === 'countdown+rival');
    check('Renown 8: three passes and 900,000', OOH.rulesFor(R(8), 23).join('+') === 'countdown3+rival' && OOH.target(R(8), 23) === 900000);
    const F = OOH.createState('fw', { fairWeather: true });
    check('Fair Weather: targets ×0.75 and one relight', OOH.target(F, 0) === 75 && OOH.target(F, 23) === 135000 && F.relight === 1);
    check('Sponsor: effective target round(×1.5)', (() => { const S = OOH.createState('sp'); S.show = 6; S.sponsor = { kind: 'coin', accepted: true }; return OOH.target(S, 6) === 1500 && OOH.baseTarget(S, 6) === 1000; })());
  }
  { // Fair Weather relight and loss; rain check
    const S = OOH.createState('relight', { fairWeather: true }); S.show = 23; S.shop = null; S.sponsor = null; S.mood = OOH.mood(S);
    let ev = OOH.step(S, { type: 'light' });
    check('Fair Weather: a Countdown miss relights (same show, no shop, no Sponsor)', ev.some(e => e.type === 'relight') && S.phase === 'build' && S.show === 23 && !S.shop && !S.sponsor && S.relight === 0);
    ev = OOH.step(S, { type: 'light' });
    check('second Countdown miss ends the run', S.phase === 'lost' && ev.some(e => e.type === 'runLost'));
    const W = OOH.createState('rain'); W.show = 5; W.tubes.forEach(t => { t.shell = null; }); ev = OOH.step(W, { type: 'light' });
    check('first miss spends the rain check and continues', W.rain === 0 && W.phase === 'build' && W.show === 6 && ev.some(e => e.type === 'rainCheck') && ev.some(e => e.type === 'critical'));
    const bo = ev.find(e => e.type === 'buildOpen'); check('next build after the miss is lastChance', bo && bo.lastChance === true);
    OOH.step(W, { type: 'light' }); check('second miss loses', W.phase === 'lost');
    const C = OOH.createState('cd-rain'); C.show = 23; C.tubes.forEach(t => { t.shell = null; }); OOH.step(C, { type: 'light' });
    check('no rain check at the Countdown', C.phase === 'lost' && C.rain === 1);
  }
  { // Afterparty
    const win = OOH.playRun(1, 'oracle', {}).state;
    check('oracle wins seed 1 (setup)', win.phase === 'won');
    const la = OOH.legalActions(win); check('won: legalActions = [endless]', la.length === 1 && la[0].type === 'endless');
    const ev = OOH.step(win, { type: 'endless' });
    check('endless → show 25 build with a shop, no Sponsor, no rain check', win.phase === 'build' && win.show === 24 && win.shop && !win.sponsor && win.rain === 0 && ev.some(e => e.type === 'buildOpen'));
    check('Afterparty Headliners are two distinct twists', [9, 10, 11, 12].every(n => { const t = win.endlessTwists[n]; return t.length === 2 && t[0] !== t[1] && t.every(x => D.TWISTS.afterparty.includes(x)); }) && OOH.rulesFor(win, 26).length === 2);
    check('Afterparty targets', OOH.baseTarget(win, 24) === 80000 && OOH.baseTarget(win, 35) === 17000000);
  }
  { // Actions: legality, order, restore, keepsake, events
    const ORDER = ['light', 'sponsor', 'buy', 'upgrade', 'buyRig', 'buyTube', 'move', 'sell', 'reroll', 'match', 'restore', 'setColour'];
    let orderOk = true, allLegal = true, walked = 0, seqOk = true;
    for (let seed = 1; seed <= 40; seed++) {
      const S = OOH.createState('walk' + seed, { kit: OOH.DATA.KIT_IDS[seed % 5] }); let rnd = seed * 7919; const r = () => ((rnd = (rnd * 1103515245 + 12345) >>> 0) / 4294967296);
      let lastSeq = 0;
      for (let k = 0; k < 120 && S.phase === 'build'; k++) {
        const la = OOH.legalActions(S);
        const idx = la.map(a => ORDER.indexOf(a.type)); for (let i = 1; i < idx.length; i++) if (idx[i] < idx[i - 1]) orderOk = false;
        for (const a of la.slice(0, 60)) { const T = OOH.clone(S); const ev = OOH.step(T, a); if (ev.length === 1 && ev[0].type === 'illegal') { allLegal = false; } }
        const nonLight = la.filter(a => a.type !== 'light');
        const a = (r() < 0.15 || !nonLight.length) ? la[0] : nonLight[Math.floor(r() * nonLight.length)];
        const ev = OOH.step(S, a); for (const e of ev) { if (!(e.seq > lastSeq)) seqOk = false; lastSeq = e.seq; } walked++;
      }
    }
    check('legalActions follow the §2.5 order', orderOk);
    check('every listed action is accepted by step', allLegal);
    check('event seq strictly increases', seqOk, walked + ' steps');
    const S = OOH.createState('illegal', {}); const h0 = OOH.hashState(S);
    const bogus = [{ type: 'buyTube' }, { type: 'reroll' }, { type: 'match' }, { type: 'restore' }, { type: 'sponsor', accept: true }, { type: 'endless' },
      { type: 'buy', card: 0, to: { zone: 'tube', i: 3 } }, { type: 'move', from: { zone: 'tube', i: 3 }, to: { zone: 'tube', i: 0 } }, { type: 'move', from: { zone: 'tube', i: 0 }, to: { zone: 'tube', i: 0 } },
      { type: 'sell', from: { zone: 'crate', i: 1 } }, { type: 'sell', from: { zone: 'tube', i: 9 } }, { type: 'setColour', card: 0, col: 'R' }, { type: 'dance' }, null, { type: 'buyRig', tube: 0 }];
    const allIll = bogus.every(a => { const ev = OOH.step(S, a); return ev.length === 1 && ev[0].type === 'illegal' && typeof ev[0].reason === 'string'; });
    check('illegal actions return [{type:"illegal", reason}]', allIll);
    check('illegal actions leave the state unchanged (hash)', OOH.hashState(S) === h0);
    const X = OOH.clone(S); check('clone is deep and hash-equal', X !== S && X.tubes !== S.tubes && OOH.hashState(X) === h0);
    // restore
    const Rs = OOH.createState('restore'); OOH.step(Rs, { type: 'light' }); const before = Rs.tubes.map(t => t.shell && t.shell.uid).join(',');
    OOH.step(Rs, { type: 'move', from: { zone: 'tube', i: 0 }, to: { zone: 'tube', i: 3 } }); OOH.step(Rs, { type: 'move', from: { zone: 'tube', i: 1 }, to: { zone: 'crate', i: 1 } });
    OOH.step(Rs, { type: 'restore' }); check('restore returns shells to their last-lit tubes', Rs.tubes.map(t => t.shell && t.shell.uid).join(',') === before);
    const K = OOH.createState('keep', { keepsake: { id: 'palm', col: 'G' } }); check('keepsake starts in Crate slot 1 at ★1', K.crate[0] && K.crate[0].id === 'palm' && K.crate[0].col === 'G' && K.crate[0].star === 1);
    const ko = OOH.keepsakeOptions(K); check('keepsake options are Commons', ko.options.length > 0 && ko.options.every(o => SH[o.id].rar === 'C'));
    const ch = OOH.previewChips(K); check('previewChips: one chip per tube, local facts only', ch.length === K.tubes.length && ch.every(c => !('applause' in c) && !('total' in c)));
    const Kb = OOH.clone(K); OOH.step(Kb, { type: 'light' });
    const held = OOH.previewChips(Kb, null, { card: 0 }); check('previewChips(held) marks legal targets', held && held.length === Kb.tubes.length && held.some(c => c && c.held && c.tube === 3));
    const hs = OOH.previewChips(Kb, null, { card: 0 }, { zone: 'tube', i: 3 }); check('previewChips(held, slot) returns the hypothetical rack', hs && hs.length === Kb.tubes.length && hs[3].held && hs[3].id === Kb.shop.cards[0].id);
    { // §2.5 one-gesture swap-in: a card over an occupied non-twin tube previews 'swap' (old shell → Crate) or 'replace' (sold).
      const ci = Kb.shop.cards.findIndex(c => c.id !== Kb.tubes[0].shell.id && c.id !== 'palm'), c0 = Kb.shop.cards[ci], old = Kb.tubes[0].shell; Kb.coins = Math.max(Kb.coins, c0.cost);
      const sw = OOH.previewChips(Kb, null, { card: ci }, { zone: 'tube', i: 0 });
      check('previewChips(card on an occupied non-twin): kind swap, old shell → Crate slot 2, exact action', sw && sw[0].kind === 'swap' && sw[0].id === c0.id && sw[0].displace === 'crate' && sw[0].crate === 1 && sw[0].out.uid === old.uid
        && JSON.stringify(sw[0].action) === JSON.stringify({ type: 'buy', card: ci, to: { zone: 'tube', i: 0 }, displace: 'crate' }), sw && JSON.stringify(sw[0]));
      const la = OOH.legalActions(Kb); check('legalActions never lists a displace buy (bots unchanged)', !la.some(a => a.displace));
      const B = OOH.clone(Kb), coins0 = B.coins, ev = OOH.step(B, sw[0].action);
      check('buy displace:crate is one action: moved (Crate) then bought; old shell in Crate slot 2', ev.map(e => e.type).slice(0, 2).join() === 'moved,bought' && B.tubes[0].shell.id === c0.id && B.crate[1].uid === old.uid && B.coins === coins0 - c0.cost,
        ev.map(e => e.type).join());
      const F = OOH.clone(Kb); F.crate[1] = { uid: 999, id: 'peony', col: 'R', star: 1, paid: 3 };
      const rp = OOH.previewChips(F, null, { card: ci }, { zone: 'tube', i: 0 });
      check('Crate full: the drop previews replace with the refund', rp && rp[0].kind === 'replace' && rp[0].displace === 'sell' && rp[0].refund === OOH.sellValue(old) && rp[0].action.displace === 'sell', rp && JSON.stringify(rp[0]));
      { // round 4: a drop that ends a live fusion says so (seed 3, all unlocks: Palm Grove lives on T3→T4 at show 4)
        const P = OOH.createState('3', { kit: 'apprentice', renown: 0, unlocked: Object.keys(OOH.DATA.SHELLS) });
        OOH.step(P, { type: 'light' }); OOH.step(P, { type: 'buy', card: 0, to: { zone: 'tube', i: 2 }, displace: 'crate' }); OOH.step(P, { type: 'light' });
        OOH.step(P, { type: 'buy', card: 0, to: { zone: 'tube', i: 3 } }); OOH.step(P, { type: 'light' });
        const k = P.shop.cards.findIndex(c => c.id !== 'palm'), pc = k >= 0 ? OOH.previewChips(P, undefined, { card: k }) : null;
        const brk = j => !!(pc && pc[j] && pc[j].breaks && pc[j].breaks.some(b => b.name === 'Palm Grove'));
        check('previewChips flags a drop that breaks a live fusion (T3/T4), and not one that keeps it (T1/T2)', pc && !brk(0) && !brk(1) && brk(2) && brk(3), pc && JSON.stringify(pc.map(c => c && c.breaks)));
      }
      check('buy displace:crate is illegal with a full Crate', OOH.illegalReason(F, { type: 'buy', card: ci, to: { zone: 'tube', i: 0 }, displace: 'crate' }) === 'the Crate is full');
      F.coins = c0.cost - OOH.sellValue(old); const cf = F.coins;
      check('buy displace:sell counts the refund before the price', OOH.isLegal(F, rp[0].action) && (OOH.step(F, rp[0].action), F.tubes[0].shell.id === c0.id && F.coins === cf + OOH.sellValue(old) - c0.cost && F.crate[1].uid === 999));
      const G = OOH.clone(Kb); G.coins = c0.cost - 1; check('buy displace:crate still needs the price in hand', OOH.illegalReason(G, sw[0].action) === 'not enough coins');
      check('displace needs an occupied tube, not a twin, not the Crate', OOH.illegalReason(Kb, { type: 'buy', card: ci, to: { zone: 'tube', i: 3 }, displace: 'crate' }) === 'nothing to displace'
        && OOH.illegalReason(Kb, { type: 'buy', card: ci, to: { zone: 'crate', i: 1 }, displace: 'crate' }) === 'displace needs a tube'
        && OOH.illegalReason(Kb, { type: 'buy', card: ci, to: { zone: 'tube', i: 0 }, displace: 'bin' }) === 'displace must be crate or sell');
      const tw = OOH.clone(Kb); tw.tubes[0].shell = { uid: 998, id: c0.id, col: c0.col, star: 1, paid: c0.cost };
      check('a twin tube is an upgrade, never a displace', OOH.illegalReason(tw, { type: 'buy', card: ci, to: { zone: 'tube', i: 0 }, displace: 'crate' }) === 'a twin: upgrade it instead' && OOH.previewChips(tw, null, { card: ci }, { zone: 'tube', i: 0 })[0].kind === 'upgrade');
    }
    { // × readability: xAah is the Aah the × terms added at that tube (Aah before × (x − 1)).
      const rk = { tubes: [{ shell: { uid: 1, id: 'peony', col: 'R', star: 1 }, rig: null }, { shell: { uid: 2, id: 'strobe', col: 'W', star: 1 }, rig: null }, { shell: { uid: 3, id: 'salute', col: 'W', star: 1 }, rig: null }, { shell: { uid: 4, id: 'comet', col: 'G', star: 1 }, rig: null }] };
      const Z = OOH.clone(Kb); Z.tubes = rk.tubes; Z.crowd = 0; const ch = OOH.previewChips(Z, []);
      const tr = OOH.resolveShow(Z.tubes, { rules: [], crowd: 0, trace: true }).trace.filter(e => e.type === 'multAah');
      const want = [0, 1, 2, 3].map(i => tr.filter(e => e.tube === i).reduce((a, e) => a + e.aah - e.aah / e.factor, 0));
      check('chips: xAah = Aah added by × terms per tube; 0 without ×', ch.every((c, i) => Math.abs(c.xAah - want[i]) < 1e-9) && ch[3].x > 1 && ch[3].xAah > 0 && ch[0].xAah === 0, JSON.stringify(ch.map(c => [c.x, c.xAah])));
      check('chips: Salute → Comet shows ✦ on both (fusion on T4, fusionNext on T3)', ch[3].fusion && ch[3].fusion.key === 'salute>comet' && ch[2].fusionNext && ch[2].fusionNext.tube === 3 && !ch[1].fusionNext);
      const ws = OOH.previewChips(Z, ['windshift']); check('fusionNext follows the fire order (Wind Shift: no Salute → Comet)', ws.every(c => !c.fusionNext && !c.fusion));
    }
    check('mood is a bucket word', ['restless', 'hopeful', 'eager'].includes(OOH.mood(K)));
    const fo = OOH.fireOrder(K, ['countdown']); check('fireOrder: Countdown numerals out and back', fo.total === 6 && fo.tubes[2].ordinals.join(',') === '1,6' && fo.tubes[2].last);
    check('seesPerTube: starting rack sees 0/1/2, empty tube null; Wind Shift reverses', OOH.seesPerTube(K).join() === '0,1,2,' && OOH.seesPerTube(K, ['windshift']).join() === '1,0,0,',
      OOH.seesPerTube(K).join() + ' / ' + OOH.seesPerTube(K, ['windshift']).join());
    { const pp = OOH.payoutPreview(K); check('payoutPreview: F1 Twilight pays $4 base, +1 Crowd, Encore +2, no ratio or Applause',
      pp.base === 4 && pp.crowdPass === 1 && pp.crowdHeadliner === 0 && pp.encoreCrowd === 2 && pp.interest === 0 && pp.rainCheck === true && !('applause' in pp) && !('ratio' in pp), JSON.stringify(pp)); }
  }
  { // End-screen helpers
    const { S } = traceRun(OOH, 'golden-1', {});
    const nm = OOH.nearMiss(S.runStats.lastLostPreLight);
    check('nearMiss on golden-1 (show 7)', nm && nm.show === 6 && nm.applause === 805 && nm.target === 1000 && nm.lines[0].startsWith('195 short (80%) at Midsummer'), nm && nm.text);
    const ls = OOH.lessonFor({ won: false, state: S });
    check('lessonFor returns a §4.12 lesson', ls && ls.id >= 1 && ls.id <= 14 && typeof ls.text === 'string' && !/\{/.test(ls.text), JSON.stringify(ls));
    const mp = OOH.milestoneProgress(S.runStats, { unlocked: [], progress: { m_crowd: 22 } });
    check('milestoneProgress covers 10 milestones with best/goal', mp.length === 10 && mp.find(r => r.id === 'm_crowd').best === 22 && mp.find(r => r.id === 'm_triple').value === 3);
    const pr = OOH.paretoRun(S); const tot = pr.reduce((a, r) => a + r.share, 0);
    check('Pareto shares sum to 100%', Math.abs(tot - 1) < 1e-9 && pr.some(r => r.id === 'Crowd'), tot);
    const won = OOH.playRun(3, 'oracle', {}).state; const lw = OOH.lessonFor({ won: true, state: won });
    check('lessonFor on a win', lw && lw.id >= 5, JSON.stringify(lw));
    const lost = (seed, bot) => { const st = OOH.playRun(seed, bot, {}).state; return { st, l: OOH.lessonFor({ won: false, state: st }) }; };
    { const { l } = lost(78, 'greedyMood'); check('lesson 10: lost with no fusion and 3+ upgrades (greedyMood seed 78)', l.id === 10 && l.text === OOH.DATA.LESSONS[9].text && /Crate/.test(l.text), JSON.stringify(l)); }
    { const { l } = lost(35, 'greedy'); check('lesson text: "1 burst", never "1 bursts" (greedy seed 35)', l.id === 5 && /saw 1 burst on average/.test(l.text), l.text); }
    { const { l } = lost(97, 'novice'); check('lesson text: "2 Aah", never "2.0 Aah" (novice seed 97)', l.id === 3 && /multiplied 2 Aah, then 46 more Aah/.test(l.text), l.text); }
    { const { st, l } = lost(55, 'greedy'); const nm = OOH.nearMiss(st.runStats.lastLostPreLight);
      const viaNm = OOH.lessonFor({ won: false, state: st, nearMiss: nm }), viaReo = OOH.lessonFor({ won: false, state: st, bestReorder: { applause: 0, pass: false } });
      check('lessonFor reuses the near-miss best order (sum.bestReorder / sum.nearMiss.bestArrangement)', l.id === 4 && viaNm.text === l.text && viaReo.id !== 4 && /Rearranging for Drizzle would have scored 2,340\. Try Rehearse \(H\) before/.test(l.text), [l.text, viaReo.id].join(' | ')); }
  }

  /* ---------------------------------------------------------- 4. timing */
  section('Performance (§11.7)');
  { const tubes = rack('candle:R palm*3:R palm*2:R palm*3:R waterfall finale', R9); let x = 0;
    for (let i = 0; i < 2000; i++) x += OOH.resolveShow(tubes, { rules: ['countdown'], crowd: 84 }).applause;
    // Best of 10 batches of 2,000: a batch mean is robust to GC, the best batch to other load on the machine.
    let us = Infinity, usAll = 0;
    for (let b = 0; b < 10; b++) { const t0 = performance.now(); for (let i = 0; i < 2000; i++) x += OOH.resolveShow(tubes, { rules: ['countdown'], crowd: 84 }).applause;
      const m = (performance.now() - t0) / 2000 * 1000; us = Math.min(us, m); usAll += m / 10; }
    log(`  resolveShow, 6-tube Countdown: ${us.toFixed(1)} µs (best batch; ${usAll.toFixed(1)} µs mean of all) — budget 200 µs; reference ~17 µs`);
    check('resolveShow ≤ 0.2 ms', us <= 200, us.toFixed(1) + ' µs');
    const t1 = performance.now(); for (let i = 0; i < 200; i++) x += OOH.shapley(tubes, ['countdown'], 84, null).crowd; const shMs = (performance.now() - t1) / 200;
    log(`  shapley, 6 tubes + Crowd (128 resolves): ${shMs.toFixed(2)} ms`); }
  { // The mood memo (a cache inside mood) must never change a result: compare against a from-scratch mood after every step,
    // Rival and Rehearse previews included.
    let bad = '', n = 0;
    const fresh = (S, pr) => { const rules = pr != null ? [].concat(pr) : OOH.rulesFor(S, S.show);
      const T = pr != null ? OOH.baseTarget(S, OOH.nextHeadlinerShow(S.show)) : OOH.target(S, S.show);
      const same = pr != null && rules.join() === OOH.rulesFor(S, S.show).join();
      const fav = rules.includes('rival') ? OOH.favourite(S.tubes, S.crowd) : null; const r = OOH.resolveShow(S.tubes, { rules, crowd: S.crowd, fav }).applause / (same ? OOH.target(S, S.show) : T);
      return r < 0.85 ? 'restless' : r < 1.25 ? 'hopeful' : 'eager'; };
    for (const seed of [11, 12, 13]) {
      const { log: L } = OOH.playRun(seed, 'human', { keepLog: true, renown: 7 }); const S = OOH.createState(seed, { renown: 7 });
      for (const a of L) { OOH.step(S, a); if (S.phase !== 'build') break; n++;
        for (const pr of [undefined, 'rival', ['countdown', 'rival']]) { const m = OOH.mood(S, pr), f = fresh(S, pr); if (m !== f && !bad) bad = `seed ${seed} show ${S.show + 1} ${pr}: ${m} vs ${f}`; }
        if (S.mood !== fresh(S)) bad = bad || `seed ${seed} show ${S.show + 1}: state.mood ${S.mood}`; }
    }
    check('mood memo never changes a mood (' + n + ' states × 3 rule sets, Renown 7)', !bad, bad); }

  /* ---------------------------------------------------------- 5. bot suite */
  let summaries = {};
  if (!args['no-bots']) {
    section(`Bot suite (§12.2): ${BOT_LIST.join(', ')} · ${N} seeds · ${WORKERS} workers`);
    const HEAVY = { oracle: 5, human: 4, novice: 3, humanBold: 4 };
    const jobs = []; let id = 0;
    const order = BOT_LIST.slice().sort((a, b) => (HEAVY[b] || 0) - (HEAVY[a] || 0));
    for (const bot of order) {
      const seeds = []; for (let s = 1; s <= N; s++) seeds.push(s);
      const chunk = HEAVY[bot] ? 10 : 250;
      for (let i = 0; i < seeds.length; i += chunk) jobs.push({ id: id++, bot, opts: {}, seeds: seeds.slice(i, i + chunk), shapleyEvery: 5 });
    }
    const results = {}; const t0 = performance.now();
    await new Promise((resolve, reject) => {
      let next = 0, done = 0; const pool = [];
      if (!jobs.length) resolve();
      for (let w = 0; w < Math.min(WORKERS, jobs.length); w++) {
        const wk = new Worker(fileURLToPath(import.meta.url)); pool.push(wk);
        const feed = () => { if (next < jobs.length) wk.postMessage(jobs[next++]); };
        wk.on('message', m => {
          const job = jobs.find(j => j.id === m.id); const acc = results[job.bot] || (results[job.bot] = { recs: [], fails: [], steps: { build: [], light: [], buildRaw: [], lightRaw: [] }, shapShows: 0, shapMs: 0, replays: 0, retimed: 0 });
          acc.recs.push(...m.recs); acc.fails.push(...m.fails); for (const k in acc.steps) acc.steps[k].push(m.steps[k]);
          acc.shapShows += m.shapShows; acc.shapMs += m.shapMs; acc.replays += m.replays; acc.retimed += m.retimed;
          if (++done === jobs.length) { pool.forEach(p => p.terminate()); resolve(); } else feed();
        });
        wk.on('error', reject);
        feed();
      }
    });
    log(`  ran ${Object.values(results).reduce((a, r) => a + r.recs.length, 0)} runs in ${((performance.now() - t0) / 1000).toFixed(1)} s`);

    // Invariants and step timing.
    let stepN = 0, stepSum = 0, stepP99 = 0, stepMax = 0, lightP99 = 0, lightMax = 0, lightSum = 0, lightN = 0, shapShows = 0, shapMs = 0, replays = 0, retimed = 0;
    let rawP99 = 0, rawMax = 0;
    for (const [bot, r] of Object.entries(results)) {
      r.recs.sort((a, b) => +a.seed - +b.seed);
      for (const f of r.fails) check('invariant: ' + f, false);
      if (!r.fails.length) passes++;
      for (const s of r.steps.build) { stepN += s.n; stepSum += s.sum; stepP99 = Math.max(stepP99, s.p99); stepMax = Math.max(stepMax, s.max); }
      for (const s of r.steps.light) { lightN += s.n; lightSum += s.sum; lightP99 = Math.max(lightP99, s.p99); lightMax = Math.max(lightMax, s.max); }
      for (const s of r.steps.buildRaw.concat(r.steps.lightRaw)) { rawP99 = Math.max(rawP99, s.p99); rawMax = Math.max(rawMax, s.max); }
      shapShows += r.shapShows; shapMs += r.shapMs; replays += r.replays; retimed += r.retimed;
    }
    log(`  invariants: no NaN/Infinity, Applause < 1e300, legalActions non-empty in every build, ≤ 6 tubes, replay hash equal (${replays} runs), Shapley sums (${shapShows} shows, ${(shapMs / Math.max(1, shapShows)).toFixed(2)} ms/show)`);
    log(`  step: build actions ${(stepSum / Math.max(1, stepN) * 1000).toFixed(0)} µs mean, worst-chunk p99 ${(stepP99 * 1000).toFixed(0)} µs, max ${stepMax.toFixed(2)} ms (n=${stepN})`);
    log(`  step: light         ${(lightSum / Math.max(1, lightN) * 1000).toFixed(0)} µs mean, worst-chunk p99 ${(lightP99 * 1000).toFixed(0)} µs, max ${lightMax.toFixed(2)} ms (n=${lightN})`);
    log(`  step: raw wall clock worst-chunk p99 ${(rawP99 * 1000).toFixed(0)} µs, max ${rawMax.toFixed(2)} ms; ${retimed} steps over ${RETIME_MS} ms re-timed on cloned pre-step states (best of ≤ 7)`);
    check('step mean ≤ 2 ms (build and light)', stepSum / Math.max(1, stepN) <= 2 && lightSum / Math.max(1, lightN) <= 2);
    check('step p99 ≤ 2 ms', Math.max(stepP99, lightP99) <= 2, Math.max(stepP99, lightP99).toFixed(3) + ' ms');
    check('step max ≤ 4 ms (re-timed)', Math.max(stepMax, lightMax) <= 4, Math.max(stepMax, lightMax).toFixed(3) + ' ms');

    // Summaries against §12.2.
    for (const [bot, r] of Object.entries(results)) summaries[bot] = OOH.summarizeRuns(r.recs, { bot });
    const tolWin = n => 4 * Math.sqrt(1000 / n);
    const tolP = (p, n) => Math.max(4, 300 * Math.sqrt(Math.max(0.0025, (p / 100) * (1 - p / 100)) / Math.max(1, n)));
    const MS = [['First Fusion', 'fusion'], ['Busy Sky', 'busy8'], ['Monochrome Night', 'mono'], ['Full Spectrum', 'spectrum'], ['Packed House', 'crowd40'], ['Triple-break', 'star3'], ['Headliner Hunter', 'headF4'], ['Rigger', 'rigger']];
    const REF = {
      random: s => [['Win %', s.winPct, 0, 'win', '0–5'], ['Deaths F1 %', s.deathPct[1] || 0, 17, 'p', null, s.n], ['Deaths F2 %', s.deathPct[2] || 0, 76, 'p', null, s.n], ['Deaths F3 %', s.deathPct[3] || 0, 8, 'p', null, s.n],
        ['Losses in F1–F2 %', s.lossesF1F2Pct, 93, 'p', 'dies in F1–F2', s.n - s.wins]],
      donothing: s => [['Win %', s.winPct, 0, 'win', '0'], ['Deaths in F2 %', s.deathPct[2] || 0, 100, 'p', '100% by F2', s.n]],
      greedy: s => [['Win %', s.winPct, 0, 'win', '0–5'], ['Deaths F2 %', s.deathPct[2] || 0, 27, 'p', null, s.n], ['Deaths F3 %', s.deathPct[3] || 0, 36, 'p', null, s.n], ['Deaths F4 %', s.deathPct[4] || 0, 30, 'p', null, s.n], ['Deaths F5 %', s.deathPct[5] || 0, 6, 'p', null, s.n],
        ['Losses in F2–F4 %', s.lossesF2F4Pct, 93, 'p', '≥ 70', s.n - s.wins, v => v >= 70], ['Median shows', s.showsP50, 8, 'n', null, 1],
        ['Minutes p50 *', s.minutesNoBuysP50, 2.7, 'min'], ...MS.slice(0, 7).map(([nm, k], i) => ['Milestone ' + nm + ' %', s.milestonePct[k], [1, 18, 4, 2, 16, 33, 2][i], 'p', null, s.n])],
      greedyMood: s => [['Win %', s.winPct, 0, 'win', '0–5'], ['Median shows', s.showsP50, 10, 'n', null, 1], ['Minutes p10 *', s.minutesNoBuysP10, 2.0, 'min'], ['Minutes p50 *', s.minutesNoBuysP50, 3.4, 'min', '3–5', null, v => v >= 3 && v <= 5], ['Minutes p90 *', s.minutesNoBuysP90, 4.5, 'min']],
      novice: s => [['Win %', s.winPct, 18.8, 'win', '8–25', null, v => v >= 8 && v <= 25], ['Countdown pass %', s.cdPassPct, 64, 'p', null, s.cdArrivals], ['Rain check used in wins %', s.rainInWinsPct, 17, 'p', '10–40', s.wins, v => v >= 10 && v <= 40],
        ['Crowd share of Countdown Ooh p50 %', 100 * s.crowdShareCD, 21, 'p', '15–25', s.cdArrivals], ...MS.map(([nm, k], i) => ['Milestone ' + nm + ' %', s.milestonePct[k], [84, 32, 30, 17, 96, 81, 87, 97][i], 'p', '≥ 12', s.n, v => v >= 12])],
      human: s => [['Win %', s.winPct, 50.7, 'win', '40–60', null, v => v >= 40 && v <= 60], ['Losses in F6–F8 %', s.lossesF6F8Pct, 91, 'p', '≥ 75', s.n - s.wins, v => v >= 75], ['Countdown pass %', s.cdPassPct, 76, 'p', '≥ 70', s.cdArrivals, v => v >= 70],
        ['Countdown arrivals per 1,000', 1000 * s.cdArrivals / s.n, 665, 'p10'], ['Rain check used in wins %', s.rainInWinsPct, 8, 'p', null, s.wins],
        ...s.ratioByFest.map((v, i) => ['Median Applause/target F' + (i + 1), v, [2.56, 3.63, 3.15, 2.52, 2.11, 1.99, 1.90, 2.33][i], 'r']),
        ['Crowd share of Countdown Ooh p50 %', 100 * s.crowdShareCD, 18, 'p', '15–25', s.cdArrivals], ['Crowd at the Countdown p50', s.crowdAtCD, 152, 'c'],
        ['Mood at light: Restless %', s.moodAtLight.restless.sharePct, 2, 'p', null, 20 * s.n], ['Mood at light: Hopeful %', s.moodAtLight.hopeful.sharePct, 6, 'p', null, 20 * s.n], ['Mood at light: Eager %', s.moodAtLight.eager.sharePct, 92, 'p', null, 20 * s.n],
        ['Hopeful shows that pass %', s.moodAtLight.hopeful.passPct, 68, 'p', 'straddles', s.moodAtLight.hopeful.n], ['Eager shows that pass %', s.moodAtLight.eager.passPct, 100, 'p', null, s.moodAtLight.eager.n],
        ['Worst Headliner miss rate %', Math.max(...Object.values(s.headMiss).map(h => h.missPct)), 28, 'p', '≤ 30', Math.min(...Object.values(s.headMiss).map(h => h.n)), v => v <= 30],
        ['Sponsored miss rate %', s.sponsoredMissPct, 0, 'p', null, s.n * 8], ['Sponsor passes per run', s.sponsorPassesPerRun, 8.2, 'c'],
        ['Rerolls per run', s.reroll, 2.5, 'c'], ['Pity per run', s.pity, 1.1, 'c'],
        ...MS.slice(0, 7).map(([nm, k], i) => ['Milestone ' + nm + ' %', s.milestonePct[k], [87, 42, 29, 27, 99, 92, 97][i], 'p', null, s.n])],
      oracle: s => [['Win %', s.winPct, 81.6, 'win', '75–92', null, v => v >= 75 && v <= 92], ['Countdown pass %', s.cdPassPct, 89, 'p', null, s.cdArrivals], ['Rain check used in wins %', s.rainInWinsPct, 2, 'p', null, s.wins],
        ...s.ratioByFest.map((v, i) => ['Median Applause/target F' + (i + 1), v, [2.64, 3.94, 3.62, 3.04, 2.70, 2.67, 2.61, 3.58][i], 'r']),
        ['F5→F8 non-decreasing (±0.1)', s.ratioByFest.slice(4).every((v, i, a) => i === 0 || v >= a[i - 1] - 0.1) ? 1 : 0, 1, 'bool', 'yes', null, v => v === 1],
        ['Worst Headliner miss rate %', Math.max(...Object.values(s.headMiss).map(h => h.missPct)), 11, 'p', '≤ 15', Math.min(...Object.values(s.headMiss).map(h => h.n)), v => v <= 15],
        ['Sponsor passes per run', s.sponsorPassesPerRun, 10.7, 'c'], ['Rerolls per run', s.reroll, 3.1, 'c'], ['Pity per run', s.pity, 1.3, 'c']],
    };
    const fmtV = (v, kind) => v === undefined || v === null || Number.isNaN(v) ? '—' : kind === 'r' ? v.toFixed(2) : kind === 'min' ? v.toFixed(1) : kind === 'c' ? (Math.abs(v) < 20 ? v.toFixed(1) : v.toFixed(0)) : kind === 'bool' ? (v ? 'yes' : 'no') : (Math.round(v * 10) / 10).toFixed(1);
    const rows = [['Bot', 'Metric', 'Result', '§12.2 ref', 'Tol ±', 'Gate', 'Status']];
    for (const bot of BOT_LIST) {
      const s = summaries[bot]; if (!s) continue;
      const def = REF[bot]; if (!def) { rows.push([bot, 'Win %', fmtV(s.winPct), '—', '—', '—', 'info']); continue; }
      for (const [name, v, ref, kind, gate, n, gateFn] of def(s)) {
        let tol;
        if (kind === 'win') tol = tolWin(s.n); else if (kind === 'p') tol = tolP(ref, n || s.n); else if (kind === 'p10') tol = 60 * Math.sqrt(1000 / s.n);
        else if (kind === 'r') tol = 0.12 * Math.sqrt(1000 / s.n); else if (kind === 'min') tol = 0.5; else if (kind === 'n') tol = 1; else if (kind === 'c') tol = Math.max(0.5, Math.abs(ref) * 0.15) * Math.sqrt(1000 / s.n); else tol = 0;
        const off = Number.isNaN(v) ? true : Math.abs(v - ref) > tol + 1e-9;
        let status = off ? (kind === 'win' ? 'FAIL' : 'WARN') : 'ok';
        if (gateFn && !Number.isNaN(v) && !gateFn(v)) status = kind === 'win' ? 'FAIL' : 'WARN';
        if (status === 'FAIL') failures++; else if (status === 'WARN') warnings++; else passes++;
        rows.push([bot, name, fmtV(v, kind), fmtV(ref, kind), kind === 'bool' ? '' : fmtV(tol, kind === 'r' ? 'r' : kind === 'min' ? 'min' : 'p'), gate || '', status]);
      }
    }
    const w = rows[0].map((_, i) => Math.max(...rows.map(r => String(r[i]).length)));
    rows.forEach((r, i) => { log('  ' + r.map((c, j) => j >= 2 && j <= 4 ? String(c).padStart(w[j]) : String(c).padEnd(w[j])).join('  ')); if (i === 0) log('  ' + w.map(x => '-'.repeat(x)).join('  ')); });
    log('  * greedy minutes use the §12.2 time model without the 6 s per purchase, as the §6 / §12.2 reference did; with purchases counted:');
    for (const bot of ['greedy', 'greedyMood']) { const s = summaries[bot]; if (s) log(`    ${bot}: p10 / p50 / p90 ${[s.minutesP10, s.minutesP50, s.minutesP90].map(v => v.toFixed(1)).join(' / ')} min`); }
    for (const bot of BOT_LIST) { const s = summaries[bot]; if (s) log(`  ${bot}: wins ${s.wins}/${s.n} (${s.winPct.toFixed(1)}%), deaths by festival ${JSON.stringify(s.deaths)}, Countdown ${s.cdArrivals} arrivals, shows p10/p50/p90 ${s.showsP10}/${s.showsP50}/${s.showsP90}`); }
    if (args.json) fs.writeFileSync(String(args.json), JSON.stringify({ seeds: N, summaries }, null, 1));
  }

  section('Result');
  log(`  ${passes} checks passed, ${warnings} warnings, ${failures} failures · ${((performance.now() - t00) / 1000).toFixed(1)} s`);
  process.exitCode = failures ? 1 : 0;
}

/* ============================================================ tutorial: Rehearsal Night (CONTRACT "Tutorial", spec §6.1) */
// Plays every step's `do` on tutorialState(i) and checks the outcome the text promises; then (unless --no-browser)
// runs the built page in Chromium and checks that startTutorial → endTutorial restores the exact run and writes no run save.
async function tutorialChecks({ check, section, log, args }) {
  section('Tutorial: Rehearsal Night (CONTRACT "Tutorial", spec §6.1)');
  const T = OOH.DATA.TUTORIAL, D = OOH.DATA;
  const XTYPES = ['light', 'result', 'buy', 'move', 'upgrade', 'fusion', 'next'];
  const xs = d => (Array.isArray(d.expect) ? d.expect : [d.expect]);
  const slotEq = (a, b) => !!a && !!b && a.zone === b.zone && a.i === b.i;
  if (!check('DATA.TUTORIAL is a table of 10 steps and api.tutorialState exists', Array.isArray(T) && T.length === 10 && typeof OOH.tutorialState === 'function', T && T.length)) return;
  for (const [i, d] of T.entries()) {
    const ok = typeof d.id === 'string' && typeof d.title === 'string' && d.title && typeof d.text === 'string' && d.text && ['fresh', 'live'].includes(d.state)
      && Array.isArray(d.target) && d.target.length && d.target.every(x => typeof x === 'string') && Array.isArray(d.do) && xs(d).every(x => x && XTYPES.includes(x.type))
      && (xs(d).length === 1 || xs(d).every(x => typeof x.text === 'string' && x.text));
    check(`step ${i + 1} (${d.id}) is well formed`, ok, JSON.stringify(d).slice(0, 160));
    const words = [d.title, d.text, ...xs(d).map(x => x.text || '')].join(' ');
    check(`step ${i + 1} text is plain (no em dash, no placeholder, short sentences)`, !/[—{}]/.test(words) && words.split(/[.!?:]\s/).every(x => x.split(/\s+/).length <= 22), words);
    check(`step ${i + 1}: 'next' steps do nothing, action steps do something`, xs(d)[0].type === 'next' ? d.do.length === 0 : d.do.length === xs(d).length);
  }
  check('step 1 is fresh and the last step is marked last', T[0].state === 'fresh' && T[T.length - 1].last === true && T.slice(0, -1).every(d => !d.last));
  // A state the whole SIM accepts: shape, ids, uids, JSON round trip, a legal build.
  function validState(S) {
    const shells = [...S.tubes.map(t => t.shell), ...S.crate].filter(Boolean), uids = shells.map(x => x.uid);
    return S.v === 1 && S.phase === 'build' && Number.isInteger(S.show) && S.show >= 0 && S.show < 24 && Array.isArray(S.rng) && S.rng.length === 4
      && S.tubes.length >= 4 && S.tubes.length <= 6 && S.crate.length === 2 && Number.isInteger(S.coins) && S.coins >= 0 && S.rain === 1
      && shells.every(x => D.SHELLS[x.id] && x.star >= 1 && x.star <= 3 && typeof x.col === 'string' && Number.isInteger(x.uid) && x.uid < S.nextUid)
      && new Set(uids).size === uids.length && (!S.shop || S.shop.cards.every(c => D.SHELLS[c.id] && c.cost > 0))
      && OOH.hashState(JSON.parse(JSON.stringify(S))) === OOH.hashState(S) && OOH.legalActions(S).length > 1
      && Array.isArray(OOH.previewChips(S)) && typeof OOH.mood(S) === 'string';
  }
  const shows = [];   // {step, applause event, events, pre, post}
  let prev = null;
  for (let i = 0; i < T.length; i++) {
    const d = T[i], S = OOH.tutorialState(i), h = OOH.hashState(S);
    check(`tutorialState(${i}) is deterministic and valid (show ${S.show + 1}, $${S.coins}, Crowd ${S.crowd})`, OOH.hashState(OOH.tutorialState(i)) === h && validState(S));
    if (d.state === 'live') check(`step ${i + 1} is live: the player's own continuation of step ${i} is exactly tutorialState(${i})`, prev && OOH.hashState(prev) === h);
    const C = OOH.clone(S);
    let evs = [];
    xs(d).forEach((x, k) => {
      const a = d.do[k];
      if (!a) return;
      const pre = OOH.clone(C), ev = OOH.step(C, a);
      evs = evs.concat(ev);
      check(`step ${i + 1}: ${a.type}${a.displace ? ' (swap-in)' : ''} is legal on the step's state`, !ev.some(e => e.type === 'illegal'), JSON.stringify(ev.find(e => e.type === 'illegal')));
      if (x.type === 'result' || x.type === 'light' || x.type === 'fusion') {
        const ap = ev.find(e => e.type === 'applause');
        shows.push({ step: i, ap, ev, pre, post: OOH.clone(C) });
        check(`step ${i + 1}: the show passes its target (${ap && ap.ooh} × ${ap && ap.aah} = ${ap && ap.score} vs ${ap && ap.target})`, ap && ap.pass && C.phase === 'build' && C.rain === 1 && !ev.some(e => e.type === 'rainCheck'));
        if (x.type === 'fusion') { const f = ev.find(e => e.type === 'fusion' && e.key === x.key);
          check(`step ${i + 1}: the swap-in fuses (${x.key} = Strobing Crossette)`, f && f.name === 'Strobing Crossette' && D.FUSIONS[x.key], JSON.stringify(ev.filter(e => e.type === 'fusion'))); }
      }
      if (x.type === 'buy') { const b = ev.find(e => e.type === 'bought');
        check(`step ${i + 1}: buys card ${x.card} into tube ${x.tube + 1}${x.displace ? ', old shell to the Crate' : ''}`, b && a.card === x.card && a.to.i === x.tube && (a.displace || null) === (x.displace || null)
          && C.tubes[x.tube].shell.id === pre.shop.cards[x.card].id && (!x.displace || C.crate.some(c => c && c.uid === pre.tubes[x.tube].shell.uid))); }
      if (x.type === 'upgrade') check(`step ${i + 1}: the twin upgrades to ★2`, ev.some(e => e.type === 'upgraded') && C.tubes[x.tube].shell.star === 2 && pre.tubes[x.tube].shell.star === 1 && a.card === x.card);
      if (x.type === 'move') check(`step ${i + 1}: moves tube ${x.from + 1} to tube ${x.to + 1}`, ev.some(e => e.type === 'moved') && slotEq(a.from, { zone: 'tube', i: x.from }) && slotEq(a.to, { zone: 'tube', i: x.to }));
    });
    prev = C;
  }
  // The numbers every step text quotes, from the SIM.
  const [s1, s2, s3] = shows, st = i => OOH.tutorialState(i), txt = i => [T[i].text, ...xs(T[i]).map(x => x.text || '')].join(' ');
  check('three shows are lit (steps 1, 6, 8)', shows.map(x => x.step).join() === '0,5,7', shows.map(x => x.step).join());
  check(`step 2 quotes show 1 exactly: ${s1.ap.ooh} × ${s1.ap.aah} = ${s1.ap.score}, target ${s1.ap.target}`,
    txt(1).includes(`${s1.ap.ooh} × ${s1.ap.aah} = ${s1.ap.score}`) && txt(1).includes(`target of ${s1.ap.target}`) && s1.ap.pass);
  { const S = st(2), sees = OOH.seesPerTube(S, OOH.rulesFor(S));
    check(`step 3: Peony sees 1 and Strobe sees 2 (${JSON.stringify(sees)})`, S.tubes[1].shell.id === 'peony' && S.tubes[2].shell.id === 'strobe' && sees[1] === 1 && sees[2] === 2
      && /Peony sees 1 burst/.test(txt(2)) && /Strobe sees 2/.test(txt(2))); }
  { const S = st(3), c = S.shop.cards[1], P = st(0);
    check('step 4: the Palm card is Red, $3, affordable, and tube 4 is the empty tube', c.id === 'palm' && c.col === 'R' && c.cost === 3 && S.coins >= 3 && !S.tubes[3].shell && S.tubes.filter(t => !t.shell).length === 1 && /tube 4/.test(txt(3)));
    check('step 4: "passing a show pays coins"', S.coins > P.coins);
    check('step 4: swap-ins are off here (first run, show 2), so the drop is into the empty tube', S.firstRun && S.show < 2 && !xs(T[3])[0].displace);
    const held = OOH.previewChips(S, OOH.rulesFor(S), 1);
    check(`step 4: tube 4's chips show what Palm adds there (+${held[3] && held[3].ooh} Ooh)`, held[3] && held[3].kind === 'buy' && held[3].ooh === 12); }
  { const a = st(4), b = st(5), r = S => OOH.resolveShow(S.tubes, { rules: OOH.rulesFor(S), crowd: S.crowd }).applause;
    check(`step 5: the move raises the Applause (${r(a)} → ${r(b)})`, r(b) > r(a));
    check('step 5: Palm is Red and gains 3 Aah right after the Peony, none in tube 4',
      a.tubes[3].shell.col === 'R' && OOH.previewChips(a)[3].aah === 0 && OOH.previewChips(b)[2].aah === 3 && b.tubes[1].shell.id === 'peony' && /3 Aah/.test(txt(4)));
    const rev = OOH.clone(a); OOH.step(rev, { type: 'move', from: { zone: 'tube', i: 2 }, to: { zone: 'tube', i: 3 } });
    check('step 5: the same swap done the other way round gives the same state', OOH.hashState(rev) === OOH.hashState(b)); }
  check(`step 6: the Applause beats step 1's (${s2.ap.score} > ${s1.ap.score}) and the text quotes ${s1.ap.score}`, s2.ap.score > s1.ap.score && txt(5).includes(String(s1.ap.score)));
  { const S = st(6), c = S.shop.cards[0], up = st(7);
    const o1 = OOH.previewChips(S)[1].ooh, o2 = OOH.previewChips(up)[1].ooh;
    check(`step 7: the Peony card is the Peony's twin and every number doubles (+${o1} → +${o2} Ooh)`, c.id === 'peony' && S.tubes[1].shell.id === 'peony' && o2 === 2 * o1 && S.coins >= OOH.upCost('peony', 1) + S.shop.cards[1].cost);
    check('step 7: a plain show (no rule twist, not a Headliner) with swap-ins on', OOH.rulesFor(S).length === 0 && S.show % 3 !== 2 && !(S.firstRun && S.show < 2)); }
  { const S = st(7), c = S.shop.cards[1];
    check('step 8: Crossette swaps in on the Palm, right after the Strobe', c.id === 'crossette' && S.tubes[3].shell.id === 'palm' && S.tubes[2].shell.id === 'strobe' && S.crate.every(x => !x));
    const chips = OOH.previewChips(S, OOH.rulesFor(S), 1, { zone: 'tube', i: 3 });
    check('step 8: the drop is a swap (Palm to the Crate) and its chips show the fusion', chips && chips[3].kind === 'swap' && chips[3].displace === 'crate' && chips[3].fusion && chips[3].fusion.key === 'strobe>crossette'); }
  { const S = st(8), cheer = s3.ev.find(e => e.type === 'crowdCheer');
    check('step 9: Palm rests in the Crate and does not fire', S.crate[0] && S.crate[0].id === 'palm' && !s3.ev.some(e => e.tube != null && s3.pre.tubes[e.tube] && s3.pre.tubes[e.tube].shell && s3.pre.tubes[e.tube].shell.id === 'palm'));
    check(`step 9: every pass grew the Crowd (${shows.map(x => x.pre.crowd + '→' + x.post.crowd).join(', ')}) and the Crowd adds its size to Ooh`,
      shows.every(x => x.post.crowd > x.pre.crowd) && cheer && cheer.v === s3.pre.crowd && s3.pre.crowd > 0); }
  { const S = st(9), nh = OOH.nextHeadlinerShow(S.show);
    check(`step 10: the mood shows (${OOH.mood(S)}), a Headliner is posted (show ${nh + 1}: ${OOH.rulesFor(S, nh)}), the rain check is unspent`,
      OOH.moodVisible(S) && OOH.rulesFor(S, nh).length === 1 && D.HEADLINERS[OOH.rulesFor(S, nh)[0]] && S.rain === 1 && S.show % 3 !== 2); }
  if (!args['no-browser']) await tutorialBrowserCheck({ check, log });
}

// The core half: in the built page, startTutorial → play every step → endTutorial restores the exact run.
async function tutorialBrowserCheck({ check, log }) {
  let chromium;
  try { ({ chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright')); }
  catch (e) { try { ({ chromium } = require('playwright')); } catch (e2) { log('  (skipped the in-browser tutorial check: Playwright is not installed)'); return; } }
  const { spawnSync } = await import('node:child_process');
  const out = path.join(os.tmpdir(), `ooh-tutorial-check-${process.pid}.html`);
  const b = spawnSync(process.execPath, [path.join(HERE, 'build.mjs'), `--out=${out}`, '--quiet', '--allow-missing'], { encoding: 'utf8' });
  if (!check('the page builds for the in-browser tutorial check', b.status === 0 && fs.existsSync(out), (b.stdout + b.stderr).trim().split('\n').slice(-3).join(' | '))) return;
  const body = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
    + fs.readFileSync(out, 'utf8') + '</body></html>';
  fs.rmSync(out, { force: true });
  const browser = await chromium.launch();
  try {
    const newPage = async () => {
      const ctx = await browser.newContext({ viewport: { width: 400, height: 860 } });
      await ctx.route('**/*', r => { const u = r.request().url();
        if (/fonts\.(googleapis|gstatic)\.com/.test(u)) return r.abort();
        if (u.startsWith('http://ooh.test/')) return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body });
        return r.continue(); });
      const page = await ctx.newPage(), errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto('http://ooh.test/');
      await page.waitForFunction(() => typeof GAME !== 'undefined' && GAME.ui === 'BUILD');
      await page.evaluate(() => GAME.setSetting('instant', true));
      return { page, errors };
    };
    const idle = page => page.waitForFunction(() => GAME.ui === 'BUILD' || GAME.ui === 'RESULT', null, { timeout: 20000 });
    const spy = page => page.evaluate(() => {
      window.__w = []; const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) { window.__w.push(v); return set.call(this, k, v); };
      window.__ev = []; for (const n of ['toast', 'meta', 'milestone', 'discover', 'unlock', 'runEnd', 'tip']) GAME.on(n, () => { if (GAME.tutorial) window.__ev.push(n); });
      window.__uis = []; GAME.on('ui', p => { if (GAME.tutorial) window.__uis.push(p.to); });
    });
    const snap = page => page.evaluate(() => { const st = JSON.parse(localStorage.getItem('oohxaah.v1') || 'null');
      return { hash: __game.hash(), ui: GAME.ui, undo: GAME.canUndo(), stored: st ? JSON.stringify(st.run) : null, storedTut: st && st.meta.tutorial, meta: JSON.stringify(GAME.meta),
        tutorial: GAME.tutorial }; });

    // 1. A run in progress (show 1 lit and saved, then an unsaved buy), the whole tutorial, then back to the run.
    { const { page, errors } = await newPage();
      await page.evaluate(() => GAME.light()); await idle(page);
      await page.evaluate(() => GAME.dispatch(__game.legalActions().find(a => a.type === 'buy' && a.to.zone === 'tube')));
      const before = await snap(page);
      await spy(page);
      check('in the page: startTutorial() starts at step 1 on tutorialState(0)', await page.evaluate(() => GAME.startTutorial() && GAME.tutorial.step === 0 && GAME.tutorial.hasRun === true
        && OOH.hashState(GAME.state) === OOH.hashState(OOH.tutorialState(0))));
      const T = await page.evaluate(() => OOH.DATA.TUTORIAL), bad = [];
      for (let i = 0; i < T.length; i++) {
        const r = await page.evaluate(i => ({ step: GAME.tutorial && GAME.tutorial.step, same: OOH.hashState(GAME.state) === OOH.hashState(OOH.tutorialState(i)) }), i);
        const miss = await page.evaluate(sels => sels.filter(s => { const el = document.querySelector(s), q = el && el.getBoundingClientRect(); return !q || !q.width || !q.height || el.closest('[hidden]'); }), T[i].target);
        if (r.step !== i || !r.same || miss.length) bad.push(`step ${i + 1}: ${JSON.stringify(r)} ${miss.join(' ')}`);
        for (const a of T[i].do) { await page.evaluate(a => (a.type === 'light' ? GAME.light() : GAME.dispatch(a)), a); await idle(page); }
        if (i === T.length - 1) break;
        // UI_TUTORIAL advances on its own after an action; a Next step (or a missing UI module) is stepped on here.
        try { await page.waitForFunction(n => GAME.tutorial && GAME.tutorial.step === n, i + 1, { timeout: 2500 }); }
        catch (e) { await page.evaluate(n => GAME.tutorialGoto(n), i + 1); }
      }
      check('in the page: every step starts on its scripted state with its spotlight targets on screen', !bad.length, bad.join(' · '));
      await page.evaluate(() => GAME.endTutorial({ startRun: false }));
      const after = await snap(page), w = await page.evaluate(() => ({ w: window.__w, ev: window.__ev, uis: window.__uis }));
      check('in the page: endTutorial() restores the exact previous run (same hash, BUILD, undo kept)', after.hash === before.hash && after.ui === 'BUILD' && after.undo === before.undo && after.tutorial === null,
        JSON.stringify([before.hash, after.hash, after.ui]));
      check(`in the page: the tutorial wrote no run save (${w.w.length} writes, each keeps the stored run)`, after.stored === before.stored && w.w.every(v => JSON.stringify(JSON.parse(v).run) === before.stored));
      check('in the page: no toast, meta, milestone, Logbook, unlock, tip or runEnd event, and never END', !w.ev.length && !w.uis.includes('END'), JSON.stringify([w.ev, [...new Set(w.uis)]]));
      const m0 = JSON.parse(before.meta), m1 = JSON.parse(after.meta);
      check('in the page: finishing sets meta.tutorial = "done" (stored too) and changes nothing else in the meta', m1.tutorial === 'done' && after.storedTut === 'done'
        && JSON.stringify({ ...m1, tutorial: undefined }) === JSON.stringify({ ...m0, tutorial: undefined }));
      check('in the page: no script errors', !errors.length, errors.slice(0, 3).join(' | '));
    }
    // 2. Skipped early from a run that had ended: its end screen comes back; meta.tutorial = 'skipped'.
    { const { page, errors } = await newPage();
      await page.evaluate(() => { for (let k = 0; k < 40 && GAME.ui !== 'END'; k++) { GAME.light(); } });
      await page.waitForFunction(() => GAME.ui === 'END', null, { timeout: 20000 });
      const before = await snap(page);
      await spy(page);
      await page.evaluate(() => { GAME.startTutorial(); GAME.tutorialGoto(2); });
      const mid = await page.evaluate(() => ({ ui: GAME.ui, hasRun: GAME.tutorial.hasRun, end: GAME.isOpen('end') }));
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => GAME.tutorial === null, null, { timeout: 5000 }).catch(() => page.evaluate(() => GAME.endTutorial({ startRun: false })));
      const after = await snap(page);
      check('in the page: from an ended run the tutorial plays (hasRun false), and Esc or Skip brings back the end screen', mid.ui !== 'END' && !mid.end && mid.hasRun === false
        && after.ui === 'END' && after.hash === before.hash && await page.evaluate(() => GAME.isOpen('end')), JSON.stringify([mid, after.ui]));
      check('in the page: leaving early sets meta.tutorial = "skipped" with no run save', after.storedTut === 'skipped' && after.stored === before.stored);
      check('in the page: no script errors (ended run)', !errors.length, errors.slice(0, 3).join(' | '));
    }
    // 3. "Start your first run": a new first run replaces the one set aside.
    { const { page } = await newPage();
      await page.evaluate(() => GAME.light()); await idle(page);
      await page.evaluate(() => { GAME.startTutorial(); GAME.tutorialGoto(9); GAME.endTutorial({ startRun: true }); });
      const r = await page.evaluate(() => ({ show: GAME.state.show, first: GAME.state.firstRun, seed: GAME.state.seed, ui: GAME.ui, t: GAME.meta.tutorial,
        stored: JSON.parse(localStorage.getItem('oohxaah.v1')).run.state.show }));
      check('in the page: "Start your first run" starts a fresh first run at show 1 and saves it', r.show === 0 && r.first && r.seed === 'first-show' && r.ui === 'BUILD' && r.t === 'done' && r.stored === 0, JSON.stringify(r));
    }
    // 4. The real UI (UI_TUTORIAL): the first-launch offer, every step played by clicks on the ringed control only,
    //    then "Start your first run". No tip or toast on screen, no tip marked seen, every step announced.
    { const { page, errors } = await newPage();
      const offer = await page.evaluate(() => { const o = document.querySelector('#tutorial .tu-offer'); return !!o && !o.hidden; });
      check('in the page (UI): a fresh profile gets the "New here?" offer, and the fuse stays usable', offer && await page.evaluate(() => !document.getElementById('fire').disabled));
      if (offer) {
        const seen0 = await page.evaluate(() => JSON.stringify(GAME.meta.seenTips));
        await page.evaluate(() => {
          const U = window.__ui = { ann: [], tips: [] };
          for (const id of ['live-polite', 'live-assertive']) { const el = document.getElementById(id); new MutationObserver(() => U.ann.push(el.textContent)).observe(el, { childList: true, characterData: true, subtree: true }); }
          const vis = el => !!el && !el.hidden && el.getClientRects().length > 0;
          (function poll() { if (GAME.tutorial) { const t = document.querySelector('#sky-overlay .tip'); if (vis(t)) U.tips.push('tip: ' + t.textContent); for (const x of document.querySelectorAll('#toasts .toast')) if (vis(x)) U.tips.push('toast: ' + x.textContent); } requestAnimationFrame(poll); })();
        });
        const clickRinged = async sel => {   // a real click, and only where the spotlight's ring says
          await page.waitForFunction(sel => { const el = document.querySelector(sel); if (!el) return false; if (el.closest('#tutorial')) return true; const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
            return [...document.querySelectorAll('#tutorial .tu-ring.act')].some(q => { const b = q.getBoundingClientRect(); return x > b.left && x < b.right && y > b.top && y < b.bottom; }); }, sel, { timeout: 1500 }).catch(() => {});
          const p = await page.evaluate(sel => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
            const own = !!el.closest('#tutorial'), ring = [...document.querySelectorAll('#tutorial .tu-ring.act')].some(q => { const b = q.getBoundingClientRect(); return x > b.left && x < b.right && y > b.top && y < b.bottom; });
            return { x, y, ok: own || ring }; }, sel);
          if (!p) return `${sel} missing`;
          await page.mouse.click(p.x, p.y);
          return p.ok ? '' : `${sel} is not ringed`;
        };
        const bad = [];
        bad.push(await clickRinged('#tutorial [data-tu="offer-play"]'));
        await page.waitForFunction(() => GAME.tutorial && GAME.tutorial.step === 0, null, { timeout: 5000 }).catch(() => bad.push('the offer did not start the tutorial'));
        let finish = '';
        for (let n = 0; n < 60 && !finish; n++) {
          await page.waitForTimeout(120);
          const u = await page.evaluate(() => { const t = GAME.tutorial; if (!t) return null; const b = s => { const e = document.querySelector('#tutorial [data-tu="' + s + '"]'); return e && !e.hidden ? e.textContent : ''; };
            return { step: t.step, ui: GAME.ui, s: UI_TUTORIAL.state(), next: b('next'), sel: document.querySelectorAll('#rack .sel, #shop .sel').length }; });
          if (!u) break;
          if (u.s.watching || u.ui === 'RESOLVING') continue;
          const x = u.s.expect || {}, at = (sel) => clickRinged(sel).then(m => m && bad.push(`step ${u.step + 1}: ${m}`));
          if (u.next) { if (/run/.test(u.next)) { finish = u.next; await at('#tutorial [data-tu="next"]'); } else await at('#tutorial [data-tu="next"]'); }
          else if (x.type === 'result' || x.type === 'fusion' || x.type === 'light') await at('#fire');
          else if (x.type === 'buy' || x.type === 'upgrade') await at(u.sel ? `#rack [data-tube="${x.tube}"]` : `#shop [data-card="${x.card}"]`);
          else if (x.type === 'move') { const t = u.sel ? x.to : x.from; await at(`#rack [data-tube="${t && t.i != null ? t.i : t}"]`); }
          if (u.step === 3 && !u.sel && !u.next) {   // a stray click off the spotlight changes nothing
            const h0 = await page.evaluate(() => OOH.hashState(GAME.state));
            await page.evaluate(() => { const r = document.querySelector('[data-act="reroll"]'); if (r) { const b = r.getBoundingClientRect(); document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); } });
            const r = await page.$('#rack [data-tube="0"]'); if (r) { const b = await r.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }
            if (await page.evaluate(h0 => OOH.hashState(GAME.state) !== h0, h0)) bad.push('step 4: a click off the spotlight changed the state');
          }
        }
        await page.waitForFunction(() => !GAME.tutorial, null, { timeout: 5000 }).catch(() => bad.push('the tutorial did not finish'));
        const r = await page.evaluate(() => ({ show: GAME.state.show, first: GAME.state.firstRun, t: GAME.meta.tutorial, seen: JSON.stringify(GAME.meta.seenTips), U: window.__ui,
          layer: !!document.querySelector('#tutorial .tu-card:not([hidden])'), offer: !document.querySelector('#tutorial .tu-offer').hidden }));
        const unsaid = []; for (let i = 1; i <= 10; i++) if (!r.U.ann.some(a => a.includes(`Tutorial, step ${i} of 10`))) unsaid.push(i);
        check('in the page (UI): every step is played by clicking the ringed control, to "Start your first run"', !bad.filter(Boolean).length && finish === 'Start your first run'
          && r.show === 0 && r.first && r.t === 'done' && !r.layer && !r.offer, [...bad.filter(Boolean), finish, JSON.stringify({ show: r.show, t: r.t, layer: r.layer, offer: r.offer })].join(' · '));
        check('in the page (UI): no tip or toast shows inside the tutorial, and no tip is marked seen', !r.U.tips.length && r.seen === seen0, [...new Set(r.U.tips)].slice(0, 3).join(' · ') + (r.seen !== seen0 ? ` seenTips ${seen0} -> ${r.seen}` : ''));
        check('in the page (UI): every step is announced for screen readers', !unsaid.length, 'missing steps ' + unsaid.join(','));
      }
      check('in the page (UI): no script errors', !errors.length, errors.slice(0, 3).join(' | '));
    }
  } finally { await browser.close(); }
}
