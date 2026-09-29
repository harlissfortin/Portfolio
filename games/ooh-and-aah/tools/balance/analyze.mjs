#!/usr/bin/env node
// Ooh × Aah — balance analyses against the game's SIM (spec §12).
// =====================================================================================
// Plays the §12.1 bots through the real SIM (src/sim.js, CommonJS `module.exports = OOH`) on
// worker threads and prints every §12.2 metric next to its gate and the v1.1 reference value,
// flagging the ones outside the gate. Writes a readable report and a JSON report.
//
// USAGE (from games/ooh-and-aah/)
//   node tools/balance/analyze.mjs                       # everything, 200 seeds, 4 workers
//   node tools/balance/analyze.mjs --seeds=1000          # the spec's 1,000-seed pass
//   node tools/balance/analyze.mjs --only=winrates,headliners --bots=human,oracle
//   node tools/balance/analyze.mjs --list                # list the analyses
//
// OPTIONS
//   --seeds=N          seeds 1..N for the base bot runs (default 200)
//   --sweep-seeds=N    seeds for the sweeps: kits, Renown, archetypes, pools, Fair Weather,
//                      no-Sponsor, bold (default = --seeds). Paired metrics use common seeds.
//                      Unless --seeds or --sweep-seeds is given, `headliners` and `sponsor` read seeds
//                      1..1000 of the runs they need (the other analyses still read 1..N).
//   --bots=a,b         restrict to these bot families (random, donothing, greedy, greedyMood,
//                      novice, human, oracle; sweeps follow their base bot)
//   --only=a,b         run only these analyses (see --list);  --skip=a,b  drop some
//   --sim=PATH         SIM module (default src/sim.js next to this tool)
//   --ref=DIR          use the design-time v1.1 reference sim (sim.js + bots.js) via an adapter
//                      (the default when src/sim.js does not exist yet and DIR is known)
//   --driver=auto|sim|spec
//                      sim : the SIM's own OOH.bots (protocols: see lib/sim-driver.cjs)
//                      spec: the harness's port of §12.1 (lib/spec-bots.cjs; public API only)
//                      auto: sim if OOH.bots has every core bot and a smoke run is clean, else spec
//   --sim-sponsor=auto|bot|harness   with --driver=sim: who decides Sponsors. auto (default):
//                      the SIM's own sponsorPick(fn.sponsorStyle, …) when exported, else the
//                      harness's §12.1 rule; harness: always the harness's rule
//   --workers=N        worker threads (default 4)
//   --out=DIR          report directory (default tools/reports/balance, git-ignored) → balance-report.txt/.json
//   --save-records=F   also write every run record as JSON lines, appended as each run finishes
//                      (a killed pass keeps what it played);  --load-records=F  re-analyse saved
//                      records without playing (the SIM is still loaded for bench/ceiling)
//   --drift-sample=K   with --load-records and a SIM other than the one that played them: replay K
//                      spread records and report how many still play identically (default 40; 0 = off)
//   --resume=F         like --save-records=F, but first load F and play only the runs it lacks
//                      (refused if F was played by a different SIM hash or driver)
//   --shapley-runs=K   human runs whose every show is checked against shapley() (default 30)
//   --xcheck-seeds=K   seeds for the driver cross-check (default 50): with --driver=sim the core
//                      bots are replayed by the spec port, and by the SIM's own playRun when exported
//   --strict           exit 1 if any gate is FAIL (default: exit 0 unless the harness broke)
//   --quiet            no progress on stderr
//
// STATUS  OK = inside the gate · FAIL = outside · WARN = outside, but the 95% sampling interval
//         at this seed count still reaches the gate (re-run with more seeds) · INFO = no gate ·
//         N/A = not run or not measurable with this SIM.
// Exit codes: 0 done · 1 gate failures with --strict · 2 harness/SIM load error.
//
// FILES  lib/sim-loader.cjs (normalise any SIM) · lib/ref-adapter.cjs (v1.1 reference → OOH API)
//        lib/spec-bots.cjs (§12.1 bots) · lib/sim-driver.cjs (OOH.bots protocols)
//        lib/runner.cjs (plays a run, records every lit show) · lib/analyses.cjs (gates)
//        lib/worker.mjs (worker thread) · lib/util.cjs
// =====================================================================================
import { Worker } from 'worker_threads';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..', '..');
const DEFAULT_REF = '/tmp/claude-0/-home-user-Portfolio/1d328520-6880-52b7-a4fb-0584f48f92fd/scratchpad/v11';
const { loadSim } = require('./lib/sim-loader.cjs');
const { makeRunner } = require('./lib/runner.cjs');
const AN = require('./lib/analyses.cjs');
const U = require('./lib/util.cjs');

// ------------------------------------------------------------------ args
const args = {};
for (const a of process.argv.slice(2)) { const m = a.match(/^--([^=]+)(?:=(.*))?$/); if (m) args[m[1]] = m[2] === undefined ? true : m[2]; }
const list = v => (typeof v === 'string' && v.length ? v.split(',').map(s => s.trim()).filter(Boolean) : null);
const intArg = (k, d) => (args[k] !== undefined && args[k] !== true ? Math.max(1, parseInt(args[k], 10) || d) : d);
if (args.help || args.h) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 50).filter(l => l.startsWith('//')).map(l => l.slice(3)).join('\n')); process.exit(0); }
if (args.list) { for (const a of AN.A) console.log(a.id.padEnd(12), a.title); process.exit(0); }

const SEEDS = intArg('seeds', 200);
const SWEEP = intArg('sweep-seeds', SEEDS);
const WORKERS = intArg('workers', Math.min(4, os.cpus().length || 4));
const OUT = path.resolve(typeof args.out === 'string' ? args.out : path.join(GAME, 'tools', 'reports', 'balance'));
const QUIET = !!args.quiet;
const log = (...m) => { if (!QUIET) process.stderr.write('[balance] ' + m.join(' ') + '\n'); };
const onlyA = list(args.only), skipA = list(args.skip), botsF = list(args.bots);
if (onlyA) { const bad = onlyA.filter(x => !AN.A.some(a => a.id === x)); if (bad.length) { console.error('unknown analysis: ' + bad.join(', ') + ' (see --list)'); process.exit(2); } }

// ------------------------------------------------------------------ SIM
let simOpts;
if (typeof args.ref === 'string') simOpts = { ref: args.ref };
else {
  const simPath = path.resolve(typeof args.sim === 'string' ? args.sim : path.join(GAME, 'src', 'sim.js'));
  if (fs.existsSync(simPath)) simOpts = { sim: simPath, orig: simPath };
  else if (!args.sim && fs.existsSync(path.join(DEFAULT_REF, 'sim.js'))) { simOpts = { ref: DEFAULT_REF }; log(`WARNING: ${simPath} does not exist yet; using the v1.1 reference sim at ${DEFAULT_REF}`); }
  else { console.error(`SIM not found: ${simPath} (pass --sim=PATH or --ref=DIR)`); process.exit(2); }
}
// The game's modules may be edited while a long pass runs: snapshot the SIM once so the main
// thread and every worker (including respawned ones) play the same code, whose hash is reported.
if (simOpts.sim && !args['no-snapshot']) {
  try {
    const src = fs.readFileSync(simOpts.sim);
    const h = crypto.createHash('sha1').update(src).digest('hex').slice(0, 10);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ooh-balance-'));
    const snap = path.join(dir, `sim-${h}.cjs`);
    fs.writeFileSync(snap, src);
    simOpts = { sim: snap, orig: simOpts.orig };
    process.on('exit', () => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* ignore */ } });
  } catch (e) { log('could not snapshot the SIM (' + e.message + '); workers will load it in place'); }
}
let api;
try { api = loadSim(simOpts); } catch (e) { console.error('Could not load the SIM: ' + ((e && e.stack) || e)); writeFatal(String(e && e.message)); process.exit(2); }
const simFile = api.kind === 'ref' ? path.join(api.where, 'sim.js') : simOpts.orig || api.where;
const simHash = (() => { try { return crypto.createHash('sha1').update(fs.readFileSync(api.kind === 'ref' ? simFile : api.where)).digest('hex').slice(0, 10); } catch (e) { return '?'; } })();

function writeFatal(msg) {
  try { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'balance-report.json'), JSON.stringify({ meta: { date: new Date().toISOString(), fatal: msg }, gates: [], analyses: {} }, null, 1)); } catch (e) { /* ignore */ }
}

// ------------------------------------------------------------------ driver choice
const SIM_SPONSOR = ['bot', 'harness'].includes(args['sim-sponsor']) ? args['sim-sponsor'] : 'auto';
let driver = typeof args.driver === 'string' ? args.driver : 'auto';
let driverNote = '';
let altAvailable = false;
function simDriverUsable() {
  if (!api.bots) return 'the SIM exposes no OOH.bots';
  const { makeSimDriver } = require('./lib/sim-driver.cjs');
  let d; try { d = makeSimDriver(api, { simSponsor: SIM_SPONSOR }); } catch (e) { return String(e.message); }
  const missing = AN.CORE.filter(b => !d.available(b)); if (missing.length) return 'OOH.bots lacks ' + missing.join(', ');
  try {
    const r = makeRunner(api, { driver: 'sim', simSponsor: SIM_SPONSOR });
    for (const b of ['greedy', 'human']) {
      const rec = r.playRun({ seed: 1, bot: b, opts: {}, probes: {} });
      if (rec.abort) return `smoke run (${b}) aborted: ${rec.abort}`;
      if (rec.st.illegal) return `smoke run (${b}) issued ${rec.st.illegal} illegal actions: ${Object.keys(rec.st.illegalWhy).join(', ')}`;
      if (!rec.shows.length) return `smoke run (${b}) lit no shows`;
    }
  } catch (e) { return 'smoke run threw: ' + String(e && e.message); }
  return null;
}
{
  const why = driver === 'spec' ? null : simDriverUsable();
  if (driver === 'auto') { driver = why ? 'spec' : 'sim'; driverNote = why ? `spec (OOH.bots not used: ${why})` : 'sim (OOH.bots)'; }
  else if (driver === 'sim') { if (why) { console.error('--driver=sim unusable: ' + why); process.exit(2); } driverNote = 'sim (OOH.bots)'; }
  else { driver = 'spec'; driverNote = 'spec (harness port of §12.1)'; }
  altAvailable = driver === 'sim' ? true : !why;
}

// ------------------------------------------------------------------ plan
let recordsSimHash = null, driftNote = null; // --load-records: the SIM that played the loaded records (from the file header)
const planOpts = {
  only: onlyA, skip: skipA, bots: botsF, seeds: SEEDS, sweepSeeds: SWEEP, explicitSeeds: args.seeds !== undefined || args['sweep-seeds'] !== undefined,
  shapleyRuns: intArg('shapley-runs', 30), endlessRuns: intArg('endless-runs', 25), replayRuns: 5,
  xcheckRuns: intArg('xcheck-seeds', 50), xcheck: altAvailable && driver === 'sim', native: !!api.playRun && !args['no-native'],
};
const { analyses, jobs } = AN.plan(planOpts);
let allJobsMemo = null; // every job of an unrestricted plan (for re-timing a loaded record of any config)
const allJobs = () => allJobsMemo || (allJobsMemo = AN.plan({ ...planOpts, only: null, skip: null, bots: null }).jobs);

// ------------------------------------------------------------------ run
const t0 = Date.now();
const jobKey = j => `${j.cfg}|${j.seed}|${j.opts && j.opts.rndSeed !== undefined ? j.opts.rndSeed : ''}`;
const records = [], errors = [];
async function runAll() {
  if (typeof args['load-records'] === 'string') {
    const lines = fs.readFileSync(args['load-records'], 'utf8').split('\n').filter(Boolean);
    let bad = 0;
    for (const l of lines) { let x; try { x = JSON.parse(l); } catch (e) { bad++; continue; } if (x.header) { recordsSimHash = recordsSimHash || x.simHash; if (x.simHash !== simHash) log(`note: records were played by SIM sha1 ${x.simHash}; the loaded SIM is ${simHash}`); continue; } if (x.error) errors.push(x); else records.push(x); }
    log(`loaded ${records.length} records from ${args['load-records']}${bad ? ` (${bad} unreadable lines skipped)` : ''}`);
    return;
  }
  // ---- incremental record file (--save-records / --resume)
  const resumeF = typeof args.resume === 'string' ? path.resolve(args.resume) : null;
  const saveF = resumeF || (typeof args['save-records'] === 'string' ? path.resolve(args['save-records']) : null);
  let saveFd = null;
  if (saveF) {
    const header = { header: 1, simHash, driver, simSponsor: SIM_SPONSOR, date: new Date().toISOString() };
    if (resumeF && fs.existsSync(resumeF)) {
      const want = new Set(jobs.map(jobKey)), have = new Set();
      let bad = 0, hdr = null, kept = 0;
      for (const l of fs.readFileSync(resumeF, 'utf8').split('\n')) {
        if (!l) continue; let x; try { x = JSON.parse(l); } catch (e) { bad++; continue; }
        if (x.header) { hdr = hdr || x; continue; }
        if (x.error || !x.key || !want.has(x.key) || have.has(x.key)) continue; // errored runs are retried
        have.add(x.key); records.push(x); kept++;
      }
      if (hdr && (hdr.simHash !== simHash || hdr.driver !== driver) && !args['resume-any']) {
        console.error(`--resume: ${resumeF} was played by SIM sha1 ${hdr.simHash} (driver ${hdr.driver}); this SIM is ${simHash} (driver ${driver}). Start a new file, or pass --resume-any to mix them.`);
        process.exit(2);
      }
      const before = jobs.length; for (let i = jobs.length - 1; i >= 0; i--) if (have.has(jobKey(jobs[i]))) jobs.splice(i, 1);
      log(`resume: ${kept} runs loaded from ${resumeF}${bad ? ` (${bad} unreadable lines skipped)` : ''}; ${jobs.length} of ${before} left to play`);
      // rewrite the file compactly (header + the kept records) so errors and stray lines do not pile up
      fs.writeFileSync(resumeF, [JSON.stringify(hdr || header)].concat(records.map(r => JSON.stringify(r))).join('\n') + '\n');
    } else fs.writeFileSync(saveF, JSON.stringify(header) + '\n');
    saveFd = fs.openSync(saveF, 'a');
  }
  const persist = o => { if (saveFd !== null) { try { fs.writeSync(saveFd, JSON.stringify(o) + '\n'); } catch (e) { log('could not append to the record file: ' + e.message); saveFd = null; } } };
  if (!jobs.length) return;
  jobs.sort((a, b) => b.weight - a.weight);
  log(`SIM ${path.relative(process.cwd(), simFile) || simFile} (${api.kind}, sha1 ${simHash}) · driver ${driverNote} · ${jobs.length} runs on ${WORKERS} workers`);
  let next = 0, done = 0, doneW = 0, lastLog = Date.now(), fatal = null;
  const totalW = jobs.reduce((a, j) => a + (j.weight || 1), 0), wOf = new Map(jobs.map(j => [j.cfg + '#' + j.seed, j.weight || 1]));
  const CHUNK = 2;
  await new Promise(resolve => {
    let alive = 0;
    const spawn = () => {
      const w = new Worker(path.join(HERE, 'lib', 'worker.mjs'), { workerData: { sim: simOpts, driver, simSponsor: SIM_SPONSOR } });
      alive++;
      let inflight = null, timer = null;
      const feed = () => {
        if (fatal || next >= jobs.length) { w.terminate(); return; }
        inflight = jobs.slice(next, next + CHUNK); next += inflight.length;
        clearTimeout(timer);
        timer = setTimeout(() => { for (const j of inflight) { errors.push({ cfg: j.cfg, seed: j.seed, error: 'timeout (180 s)' }); doneW += j.weight || 1; } done += inflight.length; inflight = null; w.terminate(); }, 180000);
        w.postMessage({ type: 'jobs', id: next, jobs: inflight });
      };
      w.on('message', m => {
        if (m.type === 'ready') feed();
        else if (m.type === 'fatal') { fatal = m.error; w.terminate(); }
        else if (m.type === 'done') {
          clearTimeout(timer);
          for (const o of m.out) { if (o.ok) { records.push(o.rec); persist(o.rec); } else { errors.push(o); persist(o); } }
          done += m.out.length; inflight = null;
          for (const o of m.out) { const c = o.ok ? o.rec.cfg + '#' + o.rec.seed : o.cfg + '#' + o.seed; doneW += wOf.get(c) || 1; }
          if (Date.now() - lastLog > (QUIET ? 3e5 : 15000)) { lastLog = Date.now(); const el = (Date.now() - t0) / 1000; log(`${done}/${jobs.length} runs · ${el.toFixed(0)} s · ETA ${((el / Math.max(1e-9, doneW)) * (totalW - doneW)).toFixed(0)} s (by CPU weight)`); }
          feed();
        }
      });
      w.on('error', e => { clearTimeout(timer); if (inflight) { for (const j of inflight) { errors.push({ cfg: j.cfg, seed: j.seed, error: 'worker crashed: ' + String(e && e.message) }); doneW += j.weight || 1; } done += inflight.length; inflight = null; } });
      w.on('exit', () => { clearTimeout(timer); alive--; if (!fatal && next < jobs.length) spawn(); else if (alive === 0) resolve(); });
    };
    for (let i = 0; i < Math.min(WORKERS, jobs.length); i++) spawn();
  });
  if (fatal) { console.error('Worker could not load the SIM:\n' + fatal); writeFatal(fatal); process.exit(2); }
  log(`played ${records.length} runs (${errors.length} errors) in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (saveFd !== null) { try { fs.closeSync(saveFd); } catch (e) { /* ignore */ } log('records in ' + saveF); }
}

// ------------------------------------------------------------------ analyse + report
function analyse() {
  const R = {};
  for (const r of records) (R[r.cfg] = R[r.cfg] || []).push(r);
  for (const k of Object.keys(R)) R[k].sort((a, b) => (typeof a.seed === 'number' && typeof b.seed === 'number' ? a.seed - b.seed : 0) || (a.rndSeed || 0) - (b.rndSeed || 0));
  const ctx = { R, errors, driver, hasShapley: !!api.shapley };
  // Re-time one run in the main thread (after the workers are gone) so the step-time gate can tell a
  // slow SIM step from a worker that was descheduled on a loaded machine.
  ctx.retime = (cfg, seed) => {
    const j = allJobs().find(x => x.cfg === cfg && x.seed === seed); if (!j) return null;
    const d = j.driver === 'other' ? (driver === 'sim' ? 'spec' : 'sim') : j.driver === 'native' ? driver : driver;
    return makeRunner(api, { driver: d, simSponsor: SIM_SPONSOR }).playRun({ ...j, probes: {} });
  };
  ctx.retimeNote = recordsSimHash && recordsSimHash !== simHash ? `re-timed on SIM sha1 ${simHash}, records played by ${recordsSimHash}` : '';
  // --load-records against a SIM other than the one that played them: replay a spread sample and say
  // whether the loaded SIM still plays those runs identically (same hashState), i.e. whether the
  // loaded report still describes this SIM.
  const nDrift = args['drift-sample'] !== undefined ? Math.max(0, parseInt(args['drift-sample'], 10) || 0) : 40;
  if (typeof args['load-records'] === 'string' && recordsSimHash !== simHash && nDrift) {
    const pool = records.filter(r => r.hash && !/^(xcheck|native|replay|first)\./.test(r.cfg));
    const step = Math.max(1, Math.floor(pool.length / nDrift)); let same = 0, n = 0; const diffs = [];
    for (let i = 0; i < pool.length && n < nDrift; i += step) {
      const r = pool[i]; let x = null; try { x = ctx.retime(r.cfg, r.seed); } catch (e) { diffs.push(`${r.cfg}#${r.seed} threw ${e.message}`); }
      if (!x) continue; n++; if (x.hash === r.hash) same++; else diffs.push(`${r.cfg}#${r.seed} (${r.won ? 'won' : 'lost at ' + (r.lastS + 1)} → ${x.won ? 'won' : 'lost at ' + (x.lastS + 1)})`);
    }
    driftNote = `${same}/${n} sampled records replay identically on SIM sha1 ${simHash}` + (diffs.length ? ` — differ: ${diffs.slice(0, 5).join(', ')}` : '');
    log('drift check: ' + driftNote);
  }
  const SB = makeRunner(api, { driver: 'spec' }).SB;
  if (analyses.some(a => a.id === 'loops')) { try { ctx.ceiling = AN.ceiling(api, SB); } catch (e) { ctx.ceilingError = String(e.message); } }
  if (analyses.some(a => a.id === 'invariants')) {
    try {
      const mk = (spec, rigs) => { let u = 1; return spec.split(' ').map((t, i) => { let [id, col] = t.split(':'); let star = 1; if (id.includes('*')) { const p = id.split('*'); id = p[0]; star = +p[1]; } return { shell: { uid: u++, id, col: col || api.shell(id).col, star, paid: 0 }, rig: rigs[i] || null }; }); };
      const tubes = mk('candle:R palm*3:R palm*2:R palm*3:R waterfall:W finale:B', ['brass', 'mortar', 'tall', 'spotlight', 'brass', 'spotlight']);
      const ctxR = { rules: ['countdown'], crowd: 84, fav: null };
      let applause = api.resolveShow(tubes, ctxR).applause; const n = 3000; const t = process.hrtime.bigint();
      for (let i = 0; i < n; i++) applause = api.resolveShow(tubes, ctxR).applause;
      ctx.bench = { us: Number(process.hrtime.bigint() - t) / 1000 / n, applause };
    } catch (e) { ctx.benchError = String(e.message); }
  }
  const out = [];
  const CFG = AN.configs();
  for (const a of analyses) {
    let res;
    // Each analysis reads seeds 1..its own limit of every plain seed-range config (runs are shared across analyses).
    const view = {};
    for (const [k, rs] of Object.entries(R)) { const c = CFG[k]; const lim = c && !c.seeds ? AN.seedLimit(a, c, planOpts) : Infinity; view[k] = rs.filter(r => typeof r.seed !== 'number' || r.seed <= lim); }
    try { res = a.run({ ...ctx, R: view }); } catch (e) { res = { rows: [{ metric: 'analysis crashed', bot: '—', value: String(e && e.message), gate: '—', ref: '—', status: 'FAIL' }], details: [String(e && e.stack).split('\n').slice(0, 3).join(' | ')] }; }
    out.push({ id: a.id, title: a.title, rows: res.rows || [], details: res.details || [] });
  }
  return out;
}

function render(results, meta) {
  const L = [];
  const counts = { OK: 0, FAIL: 0, WARN: 0, INFO: 0, 'N/A': 0 };
  for (const s of results) for (const r of s.rows) counts[r.status] = (counts[r.status] || 0) + 1;
  L.push('OOH × AAH — BALANCE REPORT (spec §12)');
  L.push(`date ${meta.date} · SIM ${meta.sim} (${meta.simKind}, sha1 ${meta.simHash}) · driver ${meta.driver}` + (meta.records ? ` · records ${meta.records}` : ''));
  if (meta.drift) L.push(`drift check: ${meta.drift}`);
  L.push(`seeds 1..${meta.seeds} (sweeps 1..${meta.sweepSeeds}${meta.wide ? '; ' + meta.wide : ''}) · ${meta.runs} runs · ${meta.errors} errors · ` + (meta.records ? `analysed in ${meta.seconds} s (no runs played)` : `${meta.seconds} s on ${meta.workers} workers`));
  L.push(`gates: ${counts.OK} OK · ${counts.FAIL} FAIL · ${counts.WARN} WARN · ${counts.INFO} INFO · ${counts['N/A']} N/A`);
  L.push('OK inside the gate · FAIL outside · WARN outside but within 95% sampling error at this seed count · INFO no gate · N/A not run');
  L.push('Reference = spec v1.1 values (1,000 seeds unless noted).');
  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  results.forEach((s, i) => {
    L.push('');
    L.push(`== ${i + 1}. ${s.title} [${s.id}] ` + '='.repeat(Math.max(3, 96 - s.title.length - s.id.length)));
    const w = { m: 10, b: 4, v: 8, g: 6 };
    for (const r of s.rows) { w.m = Math.max(w.m, Math.min(48, r.metric.length)); w.b = Math.max(w.b, Math.min(12, String(r.bot).length)); w.v = Math.max(w.v, Math.min(64, String(r.value).length)); w.g = Math.max(w.g, Math.min(34, String(r.gate).length)); }
    L.push(`  ${'STATUS'.padEnd(6)}  ${'METRIC'.padEnd(w.m)}  ${'BOT'.padEnd(w.b)}  ${'VALUE'.padEnd(w.v)}  ${'GATE'.padEnd(w.g)}  V1.1 REF`);
    for (const r of s.rows) {
      const flag = r.status === 'FAIL' ? 'FAIL' : r.status === 'WARN' ? 'WARN' : r.status;
      L.push(`  ${flag.padEnd(6)}  ${cut(r.metric, w.m).padEnd(w.m)}  ${cut(String(r.bot), w.b).padEnd(w.b)}  ${cut(String(r.value), 64).padEnd(w.v)}  ${cut(String(r.gate), 34).padEnd(w.g)}  ${r.ref}`);
    }
    for (const d of s.details) L.push('    · ' + d);
  });
  const flagged = results.flatMap(s => s.rows.filter(r => r.status === 'FAIL' || r.status === 'WARN').map(r => ({ ...r, id: s.id })));
  L.push('');
  L.push('== SUMMARY: gates outside their range ' + '='.repeat(60));
  if (!flagged.length) L.push('  none');
  for (const r of flagged) L.push(`  ${r.status.padEnd(4)}  [${r.id}] ${r.metric} (${r.bot}): ${r.value} — gate ${r.gate}; v1.1 ${r.ref}`);
  if (errors.length) { L.push(''); L.push(`== ERRORS (${errors.length}) ` + '='.repeat(80)); for (const e of errors.slice(0, 15)) L.push(`  ${e.cfg}#${e.seed}: ${e.error}${e.stack ? '  @ ' + e.stack.split(' | ').slice(1, 3).join(' | ') : ''}`); }
  return { text: L.join('\n'), counts, flagged };
}

await runAll();
const results = analyse();
const wideA = analyses.filter(a => a.defaultSeeds && !planOpts.explicitSeeds); // analyses reading more seeds than --seeds
const meta = {
  date: new Date().toISOString().replace('T', ' ').slice(0, 16), sim: path.relative(GAME, simFile).startsWith('..') ? simFile : path.relative(GAME, simFile),
  simKind: api.kind, simHash, driver: driverNote || driver,
  drift: driftNote,
  records: typeof args['load-records'] === 'string' ? `loaded from ${path.basename(args['load-records'])} (played by SIM sha1 ${recordsSimHash || 'unknown: file has no header'})` : null, seeds: SEEDS, sweepSeeds: SWEEP, workers: WORKERS,
    wide: wideA.length ? `${wideA.map(a => a.id).join(', ')} 1..${Math.max(...wideA.map(a => Math.max(SEEDS, a.defaultSeeds)))}` : '',
  runs: records.length, errors: errors.length, seconds: ((Date.now() - t0) / 1000).toFixed(0), analyses: analyses.map(a => a.id), node: process.version,
};
const { text, counts, flagged } = render(results, meta);
console.log(text);
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'balance-report.txt'), text + '\n');
const json = {
  meta, summary: counts,
  flagged: flagged.map(r => ({ analysis: r.id, metric: r.metric, bot: r.bot, value: r.value, gate: r.gate, ref: r.ref, status: r.status })),
  gates: results.flatMap(s => s.rows.map(r => ({ analysis: s.id, ...r }))),
  analyses: Object.fromEntries(results.map(s => [s.id, { title: s.title, rows: s.rows, details: s.details }])),
  errors: errors.slice(0, 200),
};
fs.writeFileSync(path.join(OUT, 'balance-report.json'), JSON.stringify(json, null, 1));
log(`report: ${path.join(OUT, 'balance-report.txt')} · ${path.join(OUT, 'balance-report.json')}`);
const harnessBroken = records.length === 0 && jobs.length > 0;
process.exit(harnessBroken ? 2 : args.strict && counts.FAIL ? 1 : 0);
