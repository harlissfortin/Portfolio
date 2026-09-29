#!/usr/bin/env node
// Ooh × Aah: performance probe (review tooling; owner: review/perf).
//
// Loads the built single-file game inside an artifact-like host wrapper
//   <!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" …></head><body>INDEX.HTML</body></html>
// served from a throwaway 127.0.0.1 server, drives it through window.__game and the DOM contract
// (src/CONTRACT.md), and measures it against the budgets in DESIGN.md §11.1 and §11.7.
//
//   node tools/perf.mjs [options]
//
//   --html=FILE         game file to test (default: index.html; if it is missing, a temporary copy is
//                       built from src/ with `tools/build.mjs --allow-missing` into OUT/_build/)
//   --build             always build a temporary copy from src/ first (never touches index.html)
//   --out=DIR           report directory (default: tools/shots/perf)
//   --profiles=LIST     mobile,desktop (default both). mobile = 360×740, DPR 2, touch, CPU throttled;
//                       desktop = 1440×900, DPR 1, unthrottled
//   --throttle=N        CPU slowdown for the mobile profile (default 4, a mid-range phone proxy)
//   --leak=WHERE        desktop|mobile|both|off: where to run the 10-show heap check (default desktop)
//   --shows=N           consecutive shows in the heap check (default 10)
//   --quick             fewer boots, shorter idle, 3-show heap check, fewer SIM iterations
//   --fonts             let Google Fonts load (default: blocked, so runs are offline and repeatable)
//   --no-isolation      do not send COOP/COEP (default sends them for 5 µs timers)
//   --headed            show the browser
//   --json              also print the JSON report to stdout
//   --max-minutes=N     hard wall-clock deadline for the whole run (default 20, --quick 8)
//   --no-profile        skip the attribution pass (cd14 under the CPU + sampling heap profilers)
//   -h, --help
//
// What it measures, per profile:
//   boot      time from navigation start to #app[data-ui="BUILD"] (3 cold loads, clean storage), FCP
//   idle      3 s of the show-1 build at rest (ambient twinkles only)
//   show7     a normal 7-burst show (mid-run, 6 tubes, one Mortar), lit with #fire, full animations
//   cd14      a 14-burst Midnight Countdown with a strong 6-tube rack
//   cdwin     the golden #10 Countdown rack (18 bursts, passes 180,000): chain + win finale
//   For each lit show: rAF frame intervals (p50/p95/p99/max, dropped frames), time inside rAF
//   callbacks per frame, FX.render()/FX.update() time per call and per frame (wrapped in place),
//   long tasks (PerformanceObserver), FX.stats() maxima, JS allocation per frame, RESOLVING/RESULT
//   durations, burst count and Applause.
//   sim       OOH.resolveShow on the 6-tube Countdown, OOH.step per action type (light includes shop
//             generation), __game.act round trips (dispatch + UI re-render), __game.mood()/preview()
//   leak      JS heap (after forced GC), DOM nodes and listeners after each of N consecutive
//             animated shows; linear slope per show
//   file      bytes, KB, gzip KB of the tested file
//
// How the racks are set up: __game.reset(seed) gives a valid base state; the tool edits it (show,
// tubes, rigs, shop, Sponsor, Crowd, coins) and loads it with the first method that verifies:
//   1. a load hook on window.__game if one exists (load/loadState/setState/inject/restore);
//   2. the §7.5 save: the state goes into localStorage "oohxaah.v1".run and the page reloads;
//   3. in-place replacement of GAME.state's fields plus GAME.emit('change').
// If none verifies, it plays Script B (§11.8) with __game.act until the rack fires ≥ 7 bursts.
// The report states which method each scenario used.
//
// Budgets (verdict FAIL): FX render ≤ 6 ms (p95, mobile), OOH.step ≤ 2 ms (p95 per action type, mobile),
// resolveShow 6-tube Countdown ≤ 0.2 ms (p95, mobile), particles ≤ 400, file ≤ the hard ceiling
// (read from CONTRACT.md "Size", which overrides §11.1: warn > 800 KB, fail > 1,200 KB at the time of writing).
// Guides (verdict WARN; not in the spec): file ≤ the warning line, dropped frames, long tasks, heap slope,
// boot time, action round trip ≤ 1 frame, console errors, non-font network requests.
// Timings under CPU throttling are wall-clock and so already scaled by the throttle. Wall-clock timings
// are also inflated by other processes on the host: the report records the load average and, per show,
// main-thread CPU time (CDP ThreadTime) next to busy time (TaskDuration); busy ≫ CPU×throttle means the
// renderer was waiting for a core, and timing verdicts are then marked "(host overloaded)".
//
// Bounded: every wait has a timeout, page calls are raced against a timer, and --max-minutes (default
// 20; 8 with --quick) is a hard deadline after which the partial report is written (exit 2).
//
// Output: OUT/perf-report.md (readable), OUT/perf.report.json (everything, incl. raw frame intervals).
// Exit codes: 0 = all budgets pass, 1 = a budget FAILs, 2 = could not run.
//
// Playwright comes from the global install; never run `playwright install`.

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'module';

const require = createRequire('/opt/node22/lib/node_modules/');

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const GAME_DIR = path.resolve(HERE, '..');
export const STORAGE_KEY = 'oohxaah.v1';

// ------------------------------------------------------------------ scenarios (racks)
// Tube entries: [shellId, colour, star, rig]. Colours: R A G B W (spec §4.1).
export const R9 = ['brass', 'mortar', 'tall', 'spotlight', 'brass', 'spotlight'];
export const RACKS = {
  // A normal mid-run show: F4 Twilight (no rule at Renown 0), 6 tubes, one Mortar → 7 bursts.
  show7: {
    label: 'Normal show (F4 Twilight, 6 tubes, 7 bursts)', seed: 'perf-show7', show: 9, crowd: 30, coins: 14,
    tubes: [['willow', 'A', 2, 'tall'], ['glitter', 'A', 1, null], ['chrys', 'G', 2, 'spotlight'],
      ['crossette', 'R', 1, 'mortar'], ['palm', 'R', 2, 'brass'], ['finale', 'B', 1, null]],
    shop: { cards: [['crossette', 'R'], ['waterfall', 'W'], ['kamuro', 'A']], rig: 'brass' },
  },
  // The Countdown exam: 7 bursts per pass × 2 passes = 14 bursts; strong Palm engine + Niagara Finale.
  cd14: {
    label: 'Midnight Countdown (6 tubes, 14 bursts)', seed: 'perf-cd14', show: 23, crowd: 84, coins: 20,
    tubes: [['palm', 'R', 3, 'brass'], ['palm', 'R', 3, 'mortar'], ['palm', 'R', 2, 'tall'],
      ['palm', 'R', 3, 'spotlight'], ['waterfall', 'W', 1, 'brass'], ['finale', 'B', 1, 'spotlight']],
    shop: { cards: [['palm', 'R'], ['finale', 'B'], ['comet', 'G']], rig: 'brass' },
  },
  // Golden test #10 (§11.8): 274,095 at the Countdown with Crowd 84, so it wins → top-tier finale.
  cdwin: {
    label: 'Countdown win (golden #10, 18 bursts + finale)', seed: 'perf-cdwin', show: 23, crowd: 84, coins: 20,
    tubes: [['candle', 'R', 1, R9[0]], ['palm', 'R', 3, R9[1]], ['palm', 'R', 2, R9[2]],
      ['palm', 'R', 3, R9[3]], ['waterfall', 'W', 1, R9[4]], ['finale', 'B', 1, R9[5]]],
    shop: { cards: [['palm', 'R'], ['finale', 'B'], ['comet', 'G']], rig: 'brass' },
  },
  // Same engine, mid-run: 95,905 with no rule, far above every target up to show 21 (heap check).
  leak: {
    label: 'Strong mid-run rack (heap check)', seed: 'perf-leak', show: 9, crowd: 60, coins: 20,
    tubes: [['candle', 'R', 1, R9[0]], ['palm', 'R', 3, R9[1]], ['palm', 'R', 2, R9[2]],
      ['palm', 'R', 3, R9[3]], ['waterfall', 'W', 1, R9[4]], ['finale', 'B', 1, R9[5]]],
    shop: { cards: [['palm', 'R'], ['glitter', 'A'], ['comet', 'G']], rig: 'lucky' },
  },
};

// ------------------------------------------------------------------ small utils
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export function rel(p) { const r = path.relative(process.cwd(), p); return r && !r.startsWith('..') ? r : p; }
export function pct(sorted, p) {
  if (!sorted.length) return null;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[i];
}
export function summarize(arr) {
  const a = (arr || []).filter((x) => Number.isFinite(x)).slice().sort((x, y) => x - y);
  if (!a.length) return null;
  const sum = a.reduce((s, x) => s + x, 0);
  return { n: a.length, mean: sum / a.length, p50: pct(a, 50), p95: pct(a, 95), p99: pct(a, 99), max: a[a.length - 1], min: a[0] };
}
export const r2 = (x) => (x == null || !Number.isFinite(x) ? x : Math.round(x * 100) / 100);
export const r3 = (x) => (x == null || !Number.isFinite(x) ? x : Math.round(x * 1000) / 1000);
function fmtMs(x, d = 2) { return x == null || !Number.isFinite(x) ? 'n/a' : `${x.toFixed(d)} ms`; }
function roundObj(o, f = r2) { if (!o) return o; const out = {}; for (const [k, v] of Object.entries(o)) out[k] = typeof v === 'number' ? f(v) : v; return out; }
export function withTimeout(p, ms, what = 'page call') {
  let t; const timer = new Promise((_, rej) => { t = setTimeout(() => rej(new Error(`${what} timed out after ${ms} ms`)), ms); });
  return Promise.race([Promise.resolve(p), timer]).finally(() => clearTimeout(t));
}
export async function waitFor(fn, timeoutMs, everyMs = 100) {
  const end = Date.now() + timeoutMs;
  for (;;) {
    let v = null;
    // A page call cannot outlive the deadline (a busy or hung page would otherwise stall the tool).
    const left = Math.max(250, Math.min(10000, end - Date.now()));
    try { v = await withTimeout(fn(), left); } catch { v = null; }
    if (v) return v;
    if (Date.now() >= end) return null;
    await sleep(everyMs);
  }
}

export function loadPlaywright() {
  try { return require('playwright'); } catch (e) {
    throw new Error(`cannot load playwright from /opt/node22/lib/node_modules (${e.message})`);
  }
}

// ------------------------------------------------------------------ the game file
// Returns {file, html, note}. Never writes index.html: temporary builds go to outDir/_build/.
export function resolveHtml({ html, build, outDir }) {
  const src = path.join(GAME_DIR, 'src');
  const buildTool = path.join(GAME_DIR, 'tools', 'build.mjs');
  const doBuild = () => {
    if (!fs.existsSync(buildTool)) throw new Error('tools/build.mjs not found; cannot build a temporary copy');
    const out = path.join(outDir, '_build', 'index.html');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const r = spawnSync(process.execPath, [buildTool, `--src=${src}`, `--out=${out}`, '--allow-missing', '--force', '--quiet'], { encoding: 'utf8' });
    if (!fs.existsSync(out)) throw new Error(`build failed (exit ${r.status}): ${(r.stdout + r.stderr).trim().slice(0, 800)}`);
    return { file: out, note: `temporary build from src/ with --allow-missing (build exit ${r.status}${r.status ? ': checks FAILed, see tools/build.mjs' : ''})` };
  };
  let file; let note = '';
  if (html) { file = path.resolve(html); if (!fs.existsSync(file)) throw new Error(`--html file not found: ${file}`); }
  else if (build) ({ file, note } = doBuild());
  else if (fs.existsSync(path.join(GAME_DIR, 'index.html'))) file = path.join(GAME_DIR, 'index.html');
  else ({ file, note } = doBuild());
  const text = fs.readFileSync(file, 'utf8');
  return { file, html: text, note };
}

// Size limits: CONTRACT.md "Size" overrides spec §11.1 (150 KB target / 190 KB ceiling). Read the
// current numbers from CONTRACT.md, else from tools/build.mjs, else fall back to the spec.
export function sizeLimits() {
  try {
    const c = fs.readFileSync(path.join(GAME_DIR, 'src', 'CONTRACT.md'), 'utf8');
    const m = /warns above (\d+)\s*KB and fails only above (\d+)\s*KB/i.exec(c);
    if (m) return { warnKb: +m[1], failKb: +m[2], source: 'CONTRACT.md "Size" (lead override of §11.1)' };
  } catch { /* ignore */ }
  try {
    const b = fs.readFileSync(path.join(GAME_DIR, 'tools', 'build.mjs'), 'utf8');
    const w = /WARN_KB\s*=\s*(\d+)/.exec(b); const f = /FAIL_KB\s*=\s*(\d+)/.exec(b);
    if (w && f) return { warnKb: +w[1], failKb: +f[1], source: 'tools/build.mjs WARN_KB/FAIL_KB' };
  } catch { /* ignore */ }
  return { warnKb: 150, failKb: 190, source: 'spec §11.1' };
}

export function fileStats(file, text) {
  const buf = Buffer.from(text, 'utf8');
  return {
    file: rel(file), bytes: buf.length, kb: r2(buf.length / 1024), gzipKb: r2(zlib.gzipSync(buf, { level: 9 }).length / 1024),
    sha1: crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12), mtime: fs.statSync(file).mtime.toISOString(),
  };
}

// ------------------------------------------------------------------ host server (artifact-like wrapper)
export function wrapHtml(text) {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>'
    + text + '</body></html>';
}
export async function startServer(text, { isolation = true } = {}) {
  const page = wrapHtml(text);
  const server = http.createServer((req, res) => {
    const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' };
    if (isolation) { headers['Cross-Origin-Opener-Policy'] = 'same-origin'; headers['Cross-Origin-Embedder-Policy'] = 'credentialless'; }
    if (req.url.startsWith('/blank')) { res.writeHead(200, headers); res.end('<!doctype html><title>blank</title>'); return; }
    if (req.url === '/' || req.url.startsWith('/index.html')) { res.writeHead(200, headers); res.end(page); return; }
    res.writeHead(404, headers); res.end('not found');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, url: `${base}/index.html`, blank: `${base}/blank.html`, close: () => new Promise((r) => server.close(r)) };
}

// ------------------------------------------------------------------ in-page library (init script)
// Runs before the game's script in every document. It only observes and wraps; it never changes
// game behaviour unless a driver function is called.
function pageLib() {
  if (window.__oohTools) return;
  const now = () => performance.now();
  const T = (window.__oohTools = { uiLog: [], longTasks: [], rec: false });
  try {
    // Records are batched: an instant show sets RESOLVING then RESULT in one task, so each record's
    // value is the next record's oldValue (the attribute's current value only for the last one).
    new MutationObserver((ms) => {
      const recs = ms.filter((m) => m.target && m.target.id === 'app' && m.attributeName === 'data-ui');
      for (let i = 0; i < recs.length; i++) {
        const v = i + 1 < recs.length ? recs[i + 1].oldValue : recs[i].target.getAttribute('data-ui');
        if (v !== recs[i].oldValue) T.uiLog.push({ ui: v, t: now() });
      }
    }).observe(document, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-ui'] });
  } catch (e) { /* ignore */ }
  try {
    new PerformanceObserver((list) => { for (const e of list.getEntries()) T.longTasks.push({ start: e.startTime, dur: e.duration }); })
      .observe({ type: 'longtask', buffered: true });
  } catch (e) { /* ignore */ }

  // ---- frame recorder (rAF wrapper + an independent probe)
  const origRAF = window.requestAnimationFrame.bind(window);
  let frameMap = new Map(); let curTs = null;
  const frameRec = (ts) => { let f = frameMap.get(ts); if (!f) { f = { cb: 0, fxR: 0, fxU: 0, nR: 0, nU: 0 }; frameMap.set(ts, f); } return f; };
  window.requestAnimationFrame = function (cb) {
    return origRAF(function (ts) {
      if (!T.rec) return cb(ts);
      curTs = ts; const t = now();
      try { return cb(ts); } finally { frameRec(ts).cb += now() - t; curTs = null; }
    });
  };
  let R = null; let lastTs = null;
  const probe = (ts) => {
    if (T.rec && R) {
      if (lastTs !== null) R.deltas.push(ts - lastTs);
      lastTs = ts;
      try {
        if (typeof FX !== 'undefined' && FX && typeof FX.stats === 'function') {
          const s = FX.stats();
          if (s && typeof s === 'object') {
            for (const [k, v] of Object.entries(s)) if (typeof v === 'number' && Number.isFinite(v)) {
              R.fxStatsMax[k] = Math.max(R.fxStatsMax[k] ?? -Infinity, v);
              (R.fxStatsSeries[k] || (R.fxStatsSeries[k] = [])).push(v);
            }
          }
        }
      } catch (e) { R.fxStatsError = String(e && e.message || e); }
      if (performance.memory) R.heap.push(performance.memory.usedJSHeapSize);
    } else lastTs = null;
    origRAF(probe);
  };
  origRAF(probe);

  T.wrapFx = () => {
    const out = {};
    if (typeof FX === 'undefined' || !FX) return { ok: false, why: 'FX is not defined' };
    for (const name of ['render', 'update']) {
      const orig = FX[name];
      if (typeof orig !== 'function') { out[name] = 'missing'; continue; }
      if (orig.__perfWrapped) { out[name] = 'wrapped'; continue; }
      const w = function () {
        if (!T.rec || !R) return orig.apply(this, arguments);
        const t = now();
        try { return orig.apply(this, arguments); } finally {
          const d = now() - t; R.fx[name].push(d);
          if (curTs !== null) { const f = frameRec(curTs); if (name === 'render') { f.fxR += d; f.nR++; } else { f.fxU += d; f.nU++; } }
        }
      };
      w.__perfWrapped = true;
      try { FX[name] = w; out[name] = FX[name] === w ? 'wrapped' : 'readonly'; } catch (e) { out[name] = 'readonly'; }
    }
    return { ok: true, ...out };
  };
  T.start = () => {
    frameMap = new Map(); lastTs = null;
    R = { t0: now(), deltas: [], fx: { render: [], update: [] }, fxStatsMax: {}, fxStatsSeries: {}, heap: [], uiMark: T.uiLog.length, uiAtStart: T.ui() };
    T.rec = true;
  };
  T.stop = () => {
    T.rec = false; if (!R) return null;
    const t1 = now();
    const frames = [...frameMap.values()];
    const series = {};
    for (const [k, v] of Object.entries(R.fxStatsSeries)) { const step = Math.max(1, Math.ceil(v.length / 120)); series[k] = v.filter((_, i) => i % step === 0); }
    const heapDeltas = []; for (let i = 1; i < R.heap.length; i++) heapDeltas.push(R.heap[i] - R.heap[i - 1]);
    const out = {
      t0: R.t0, durationMs: t1 - R.t0, deltas: R.deltas,
      rafCb: frames.map((f) => f.cb), fxRenderPerFrame: frames.filter((f) => f.nR).map((f) => f.fxR), fxUpdatePerFrame: frames.filter((f) => f.nU).map((f) => f.fxU),
      fxRender: R.fx.render, fxUpdate: R.fx.update, fxStatsMax: R.fxStatsMax, fxStatsSeries: series, fxStatsError: R.fxStatsError || null,
      longTasks: T.longTasks.filter((l) => l.start >= R.t0 && l.start <= t1),
      allocBytes: heapDeltas.filter((d) => d > 0).reduce((s, d) => s + d, 0), heapSamples: R.heap.length,
      ui: [{ ui: R.uiAtStart, t: R.t0 }].concat(T.uiLog.slice(R.uiMark)),
    };
    R = null; return out;
  };

  // ---- driver helpers
  T.ui = () => { const a = document.getElementById('app'); return a ? a.getAttribute('data-ui') : null; };
  T.probeApi = () => {
    const g = window.__game;
    const typeOf = (name) => { try { return eval('typeof ' + name); } catch (e) { return 'undefined'; } }; // global consts
    const G = typeOf('GAME') !== 'undefined' ? eval('GAME') : null;
    const F = typeOf('FX') !== 'undefined' ? eval('FX') : null;
    return {
      ui: T.ui(), game: !!g, hooks: g ? Object.keys(g).sort() : [], GAME: !!G, OOH: typeOf('OOH') !== 'undefined', FX: !!F,
      fxStats: !!(F && typeof F.stats === 'function'), version: g && g.config && g.config.version || null,
      settings: G && G.settings ? JSON.parse(JSON.stringify(G.settings)) : null,
    };
  };
  T.visible = (sel) => { const el = document.querySelector(sel); if (!el || el.hidden) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  T.cleanStorage = () => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) { /* ignore */ } };

  const RIGCOST = { tall: 4, brass: 5, spotlight: 5, lucky: 4, mortar: 10 };
  const FALLBACK = { peony: 3, chrys: 3, comet: 3, strobe: 3, palm: 3, willow: 4, mine: 3, salute: 4, candle: 4, heart: 3, girandola: 3, fern: 3,
    crossette: 5, echo: 4, waterfall: 5, kamuro: 5, dahlia: 5, smiley: 5, glitter: 5, thunder: 7, finale: 8, puresky: 8, barrage: 8, cake: 9 };
  T.buildState = async (spec) => {
    const g = window.__game;
    if (!g || typeof g.reset !== 'function' || typeof g.state !== 'function') throw new Error('window.__game.reset/state missing');
    await g.reset(spec.seed || 'review', Object.assign({ kit: 'apprentice', renown: 0, firstRun: false }, spec.opts || {}));
    const st = await g.state();
    if (!st || typeof st !== 'object') throw new Error('__game.state() returned nothing');
    const cfg = g.config || {};
    let shells = cfg.SHELLS;
    try { if (!shells && typeof OOH !== 'undefined' && OOH.DATA) shells = OOH.DATA.SHELLS; } catch (e) { /* ignore */ }
    const row = (id) => (!shells ? null : Array.isArray(shells) ? shells.find((r) => r && r.id === id) : shells[id]);
    const cost = (id) => { const r = row(id); const c = r && (r.cost ?? r.price); return Number.isFinite(c) ? c : (FALLBACK[id] || 4); };
    const paidFor = (id, star) => { const c = cost(id); let p = c; if (star >= 2) p += Math.ceil(1.5 * c); if (star >= 3) p += 2 * c; return p; };
    let uid = Math.max(100, (st.nextUid | 0) + 1);
    const mk = (t) => (t && t[0] ? { uid: uid++, id: t[0], col: t[1], star: t[2] || 1, paid: paidFor(t[0], t[2] || 1) } : null);
    st.show = spec.show; st.phase = 'build'; st.endless = false; st.firstRun = false;
    if (spec.coins != null) st.coins = spec.coins;
    if (spec.crowd != null) st.crowd = spec.crowd;
    if (spec.rain != null) st.rain = spec.rain;
    st.tubes = spec.tubes.map((t) => ({ shell: mk(t), rig: (t && t[3]) || null }));
    st.crate = [mk(spec.crate && spec.crate[0]), mk(spec.crate && spec.crate[1])];
    if (spec.shop) {
      st.shop = { cards: spec.shop.cards.map(([id, col, tag]) => ({ kind: 'shell', id, col, cost: cost(id), tag: tag || null, sold: false })),
        rig: spec.shop.rig ? { id: spec.shop.rig, cost: RIGCOST[spec.shop.rig] || 5, sold: false } : null, rerolls: 0 };
    }
    st.sponsor = spec.sponsor ? { kind: spec.sponsor, accepted: false } : null;
    if (Array.isArray(st.headliners)) {
      if (spec.headliner) st.headliners[Math.floor(spec.show / 3)] = spec.headliner;
      if (st.headliners.length >= 8 && !st.headliners[7]) st.headliners[7] = 'countdown';
    }
    st.nextUid = uid;
    const rs = st.runStats || (st.runStats = {});
    const T8 = Array.isArray(cfg.TARGETS) ? cfg.TARGETS : null;
    if (spec.history !== false && T8) {
      rs.history = [];
      for (let s = 0; s < spec.show; s++) {
        const target = typeof T8[s] === 'number' ? T8[s] : 100;
        const applause = Math.round(target * (1.3 + ((s * 37) % 10) / 10));
        const ooh = Math.max(1, Math.round(Math.sqrt(applause) * 3));
        rs.history.push({ show: s, rules: [], target, applause, ooh, aah: Math.round((applause / ooh) * 10) / 10, pass: true, sponsored: false,
          encore: applause >= 2 * target, relit: false, bursts: 5, maxUp: 2, colsUp: 2, colsFired: {}, fusions: [], moodAtLight: 'eager' });
      }
    }
    if (rs.buildStart && typeof rs.buildStart === 'object') {
      const snap = JSON.parse(JSON.stringify(st)); delete snap.runStats;
      const keys = Object.keys(rs.buildStart);
      rs.buildStart = keys.length ? Object.fromEntries(keys.map((k) => [k, k in snap ? snap[k] : rs.buildStart[k]])) : snap;
    }
    return st;
  };
  T.verify = async (want) => {
    const g = window.__game; if (!g) return false;
    const s = await g.state();
    if (!s || s.show !== want.show || !Array.isArray(s.tubes) || s.tubes.length !== want.tubes.length) return false;
    for (let i = 0; i < want.tubes.length; i++) {
      const a = s.tubes[i] && s.tubes[i].shell; const b = want.tubes[i].shell;
      if (!!a !== !!b) return false;
      if (a && (a.id !== b.id || a.star !== b.star)) return false;
    }
    return true;
  };
  T.tryHooks = async (st) => {
    const g = window.__game;
    for (const name of ['load', 'loadState', 'setState', 'inject', 'injectState', 'restore']) {
      if (g && typeof g[name] === 'function') {
        try { await g[name](JSON.parse(JSON.stringify(st))); if (await T.verify(st)) return '__game.' + name; } catch (e) { /* next */ }
      }
    }
    return null;
  };
  T.saveBlob = () => {
    let G = null; try { G = eval('typeof GAME') !== 'undefined' ? eval('GAME') : null; } catch (e) { /* ignore */ }
    try { if (G && typeof G.saveNow === 'function') G.saveNow(); } catch (e) { /* ignore */ }
    let blob = null; try { blob = JSON.parse(localStorage.getItem('oohxaah.v1')); } catch (e) { /* ignore */ }
    if (!blob || typeof blob !== 'object') blob = { v: 1 };
    if (!blob.settings && G && G.settings) blob.settings = JSON.parse(JSON.stringify(G.settings));
    if ((!blob.meta || typeof blob.meta !== 'object') && G && G.meta) blob.meta = JSON.parse(JSON.stringify(G.meta));
    return blob;
  };
  T.writeBlob = (blob, st, settingsPatch) => {
    blob = blob && typeof blob === 'object' ? blob : { v: 1 };
    blob.v = 1;
    if (!blob.meta || typeof blob.meta !== 'object') blob.meta = {};
    blob.meta.runs = Math.max(1, blob.meta.runs | 0);
    if (settingsPatch) blob.settings = Object.assign({}, blob.settings || {}, settingsPatch);
    if (st) { blob.run = Object.assign({}, blob.run && typeof blob.run === 'object' ? blob.run : {}, { state: st }); if (blob.run.uiSeed == null) blob.run.uiSeed = 1; }
    localStorage.setItem('oohxaah.v1', JSON.stringify(blob));
    return true;
  };
  T.mutateLive = async (st) => {
    let G = null; try { G = eval('typeof GAME') !== 'undefined' ? eval('GAME') : null; } catch (e) { /* ignore */ }
    if (!G || !G.state || typeof G.state !== 'object') return false;
    const live = G.state;
    for (const k of Object.keys(live)) delete live[k];
    Object.assign(live, JSON.parse(JSON.stringify(st)));
    try { if (typeof G.emit === 'function') G.emit('change', { state: live }); } catch (e) { /* ignore */ }
    return T.verify(st);
  };
  // Script B (§11.8) one build: upgrade a twin, else buy into the leftmost empty tube, else add a tube.
  T.scriptBBuild = async () => {
    const g = window.__game; let n = 0;
    for (let guard = 0; guard < 12; guard++) {
      const acts = (await g.legalActions()) || [];
      const pick = acts.find((a) => a.type === 'upgrade' && a.to && a.to.zone === 'tube')
        || acts.filter((a) => a.type === 'buy' && a.to && a.to.zone === 'tube').sort((a, b) => a.card - b.card || a.to.i - b.to.i)[0]
        || acts.find((a) => a.type === 'buyTube');
      if (!pick) break;
      const ev = await g.act(pick); n++;
      if (Array.isArray(ev) && ev[0] && ev[0].type === 'illegal') break;
    }
    return n;
  };
}
export const PAGE_LIB = `(${pageLib.toString()})();`;

// ------------------------------------------------------------------ driver (node side)
export async function newContext(browser, prof, { fonts = false, reducedMotion = 'no-preference', log } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: prof.width, height: prof.height }, deviceScaleFactor: prof.dpr || 1,
    isMobile: !!prof.mobile, hasTouch: !!prof.mobile, reducedMotion, serviceWorkers: 'block',
  });
  const external = [];
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1') || u.startsWith('data:') || u.startsWith('blob:') || u.startsWith('file:')) return route.continue();
    const isFont = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u);
    if (!isFont) external.push(u);
    if (isFont && fonts) return route.continue();
    return route.abort();
  });
  await ctx.addInitScript({ content: PAGE_LIB });
  ctx.setDefaultTimeout(30000); ctx.setDefaultNavigationTimeout(30000);
  ctx.__external = external;
  if (log) ctx.on('page', (p) => attachLogs(p, log));
  return ctx;
}
export function attachLogs(page, log) {
  page.on('pageerror', (e) => log.push({ kind: 'pageerror', text: String(e && e.message || e).slice(0, 400) }));
  page.on('console', (m) => {
    if (m.type() !== 'error' && m.type() !== 'warning') return;
    const text = m.text();
    if (/fonts\.(googleapis|gstatic)|net::ERR_FAILED|ERR_BLOCKED_BY_CLIENT|Failed to load resource/i.test(text)) return;
    log.push({ kind: m.type(), text: text.slice(0, 400) });
  });
}

export async function gotoGame(page, srv, { clean = false, timeoutMs = 20000, extraQuery = '' } = {}) {
  if (clean) {
    await page.goto(srv.blank, { waitUntil: 'load' });
    await page.evaluate(() => window.__oohTools.cleanStorage());
  }
  await page.goto(srv.url + extraQuery, { waitUntil: 'load', timeout: timeoutMs }).catch(() => {});
  return waitBoot(page, timeoutMs);
}
export async function waitBoot(page, timeoutMs = 20000) {
  const t0 = Date.now();
  const ok = await waitFor(() => page.evaluate(() => { const u = window.__oohTools && window.__oohTools.ui(); return u && u !== 'BOOT' ? u : null; }), timeoutMs, 50);
  await dismissTapContinue(page);
  const api = await page.evaluate(() => window.__oohTools.probeApi()).catch(() => null);
  return { ok: !!ok, ui: ok || (api && api.ui) || null, waitedMs: Date.now() - t0, api };
}
export async function dismissTapContinue(page) {
  try {
    if (await page.evaluate(() => window.__oohTools.visible('#tap-continue'))) {
      await page.locator('#tap-continue').click({ force: true, timeout: 2000 }).catch(() => {});
      await sleep(150);
    }
  } catch { /* ignore */ }
}
export async function ui(page) { return page.evaluate(() => window.__oohTools.ui()).catch(() => null); }

// Puts a scenario rack in place. Returns {how, st, notes[]}; how = null when every method failed.
export async function injectScenario(page, srv, spec, { settingsPatch = null, timeoutMs = 20000 } = {}) {
  const notes = [];
  const st = await page.evaluate((s) => window.__oohTools.buildState(s), spec);
  let how = await page.evaluate((s) => window.__oohTools.tryHooks(s), st);
  if (!how) {
    const blob = await page.evaluate(() => window.__oohTools.saveBlob());
    await page.goto(srv.blank, { waitUntil: 'load' });
    await page.evaluate(([b, s, p]) => window.__oohTools.writeBlob(b, s, p), [blob, st, settingsPatch]);
    const boot = await gotoGame(page, srv, { timeoutMs });
    if (!boot.ok) notes.push(`reload after storage patch did not boot (ui=${boot.ui})`);
    if (await page.evaluate((s) => window.__oohTools.verify(s), st).catch(() => false)) how = 'storage (§7.5 save + reload)';
  }
  if (!how) {
    if (await page.evaluate((s) => window.__oohTools.mutateLive(s), st).catch(() => false)) how = 'GAME.state in-place + change event';
  }
  if (how) await dismissTapContinue(page);
  return { how, st, notes };
}

// Plays Script B with __game.act (instant lights) until the rack fires at least minBursts, then
// stops in a build. Fallback when no injection method works.
export async function scriptBTo(page, { seed = 'perf-scriptb', minBursts = 7, maxShows = 12 } = {}) {
  return page.evaluate(async ({ seed, minBursts, maxShows }) => {
    const g = window.__game; const T = window.__oohTools;
    await g.reset(seed, { kit: 'salvo' });
    if (typeof g.skipAnimations === 'function') g.skipAnimations(true);
    let bursts = 0;
    for (let i = 0; i < maxShows; i++) {
      await T.scriptBBuild();
      const st = await g.state();
      const res = typeof g.resolve === 'function' ? await g.resolve(st.tubes, { rules: [], crowd: st.crowd, fav: null }) : null;
      bursts = res && res.bursts || 0;
      if (bursts >= minBursts || i === maxShows - 1) break;
      await g.act({ type: 'light' });
      const s2 = await g.state();
      if (s2.phase !== 'build') { await g.reset(seed + i, { kit: 'salvo' }); }
    }
    if (typeof g.skipAnimations === 'function') g.skipAnimations(false);
    return { bursts, show: (await g.state()).show };
  }, { seed, minBursts, maxShows });
}

// Full animations on: skipAnimations(false), instant off, speed 1, reduced motion off (or as given:
// the gallery's reduced-motion rows pass 'on').
export async function ensureAnimated(page, { reducedMotion = 'off' } = {}) {
  return page.evaluate((rmWant) => {
    const out = [];
    const g = window.__game;
    try { if (g && typeof g.skipAnimations === 'function') { g.skipAnimations(false); out.push('skipAnimations(false)'); } } catch (e) { /* ignore */ }
    try { if (g && typeof g.setPaused === 'function') g.setPaused(false); } catch (e) { /* ignore */ }
    let G = null; try { G = eval('typeof GAME') !== 'undefined' ? eval('GAME') : null; } catch (e) { /* ignore */ }
    if (G && typeof G.setSetting === 'function' && G.settings) {
      for (const [k, v] of [['instant', false], ['speed', 1], ['reducedMotion', rmWant]]) {
        try { if (G.settings[k] !== v) { G.setSetting(k, v); out.push(`${k}=${v}`); } } catch (e) { /* ignore */ }
      }
    }
    return out;
  }, reducedMotion);
}

// Lights the fuse and waits for the show to finish. Light is legal from BUILD and from RESULT (the
// real core keeps data-ui=RESULT, with the result card pinned, until the next build action).
// "Finished" = the first RESULT, BUILD or END after RESOLVING. Returns {method, ok, endUi,
// phases:{RESOLVING: ms, …}, log, tFinish (page ms)}.
export const BUILDISH = ['BUILD', 'RESULT'];
export async function lightShow(page, { timeoutMs = 30000, allowAct = true, fireWaitMs = 2500 } = {}) {
  const mark = await page.evaluate(() => window.__oohTools.uiLog.length);
  const started = () => page.evaluate((m) => window.__oohTools.uiLog.slice(m).some((e) => e.ui === 'RESOLVING' || e.ui === 'END'), mark);
  let method = null;
  const u0 = await ui(page);
  if (!BUILDISH.includes(u0)) return { ok: false, method: null, error: `not in BUILD/RESULT (data-ui=${u0})` };
  try { await page.locator('#fire').click({ force: true, timeout: 4000 }); method = 'click #fire'; } catch { /* next */ }
  let saw = method ? await waitFor(started, fireWaitMs, 50) : null;
  const fireIgnored = method && !saw ? u0 : null; // #fire was clicked in this data-ui and nothing happened
  if (!saw) {
    const r = await page.evaluate(() => { try { if (typeof GAME !== 'undefined' && typeof GAME.light === 'function') { GAME.light(); return 'GAME.light()'; } } catch (e) { /* ignore */ } return null; });
    if (r) { method = r + (fireIgnored ? ` (#fire click ignored in ${fireIgnored})` : ''); saw = await waitFor(started, 2500, 50); }
  }
  if (!saw && allowAct) {
    const r = await page.evaluate(async () => { const g = window.__game; if (g && typeof g.act === 'function') { await g.act({ type: 'light' }); return '__game.act(light)'; } return null; });
    if (r) { method = r + ' (no presentation)'; saw = await waitFor(started, 1500, 50); if (!saw) return { ok: true, method, endUi: await ui(page), phases: {}, log: [] }; }
  }
  if (!saw) return { ok: false, method, error: 'the show did not start (no RESOLVING after #fire, GAME.light, __game.act)' };
  const fin = await waitFor(() => page.evaluate((m) => {
    const L = window.__oohTools.uiLog.slice(m);
    const i = L.findIndex((e) => e.ui === 'RESOLVING' || e.ui === 'END');
    if (i < 0) return null;
    if (L[i].ui === 'END') return L;
    const j = L.findIndex((e, k) => k > i && (e.ui === 'RESULT' || e.ui === 'BUILD' || e.ui === 'END'));
    return j < 0 ? null : L;
  }, mark), timeoutMs, 60);
  const L = fin || await page.evaluate((m) => window.__oohTools.uiLog.slice(m), mark);
  const phases = {};
  for (let i = 0; i < L.length - 1; i++) phases[L[i].ui] = (phases[L[i].ui] || 0) + (L[i + 1].t - L[i].t);
  const last = L[L.length - 1];
  return { ok: !!fin, method, fireIgnored, endUi: last ? last.ui : null, phases: roundObj(phases, (x) => Math.round(x)), log: L.map((e) => e.ui), tFinish: last ? last.t : null, error: fin ? null : `show did not finish within ${timeoutMs} ms` };
}

// Waits until the run ends up somewhere stable after a light: END, BUILD, or RESULT (which the real
// core holds). Used after lightShow when the next step needs END specifically.
export async function waitSettled(page, want = ['END'], timeoutMs = 8000) {
  return waitFor(async () => { const u = await ui(page); return want.includes(u) ? u : null; }, timeoutMs, 60);
}

// ------------------------------------------------------------------ measurements
async function cdpMetrics(cdp) {
  const out = {};
  try { const { metrics } = await cdp.send('Performance.getMetrics'); for (const m of metrics) out[m.name] = m.value; } catch { /* ignore */ }
  try { const h = await cdp.send('Runtime.getHeapUsage'); out.heapUsed = h.usedSize; out.heapTotal = h.totalSize; } catch { /* ignore */ }
  return out;
}
// Main-thread CPU (ThreadTime) vs busy wall time (TaskDuration) between two CDP metric snapshots.
function cpuStats(m0, m1, frames) {
  if (!m0 || !m1 || m0.ThreadTime == null || m1.ThreadTime == null) return null;
  const d = (k) => (m1[k] != null && m0[k] != null ? (m1[k] - m0[k]) * 1000 : null);
  const wall = d('Timestamp'); const thread = d('ThreadTime'); const task = d('TaskDuration');
  const n = Math.max(1, frames || 0);
  return { wallMs: Math.round(wall), threadMs: Math.round(thread), taskMs: Math.round(task), scriptMs: Math.round(d('ScriptDuration')),
    layoutMs: Math.round((d('LayoutDuration') || 0) + (d('RecalcStyleDuration') || 0)), cpuPerFrameMs: r2(thread / n), busyPerFrameMs: r2(task / n),
    cpuPct: wall ? r2((100 * thread) / wall) : null, busyPct: wall ? r2((100 * task) / wall) : null, waitRatio: thread ? r2(task / thread) : null };
}
// Module boundaries in the built file ("// ==== sim.js ====" markers written by tools/build.mjs).
export function moduleMap(html) {
  const out = []; html.split('\n').forEach((l, i) => { const m = /^\/\/ ==== ([\w.-]+) ====/.exec(l); if (m) out.push({ line: i, mod: m[1] }); });
  return (line) => { let mod = null; for (const b of out) { if (b.line <= line) mod = b.mod; else break; } return mod || 'page'; };
}
// Folds a CDP CPU profile and a sampling heap profile into self time / allocation per function and module.
function summarizeProfiles(cpu, heap, modOf) {
  const isGame = (cf) => cf && cf.url && /index\.html|127\.0\.0\.1/.test(cf.url);
  // Built-ins (drawImage, measureText, Math.random…) have no url: charge them to the nearest game
  // caller. (program) = browser work outside JS (raster, style, layout, compositing).
  const key = (cf, callers) => {
    if (isGame(cf)) return { fn: `${cf.functionName || '(anonymous)'}:${cf.lineNumber + 1}`, mod: modOf(cf.lineNumber) };
    const c = (callers || []).find(isGame);
    if (c) return { fn: `${cf.functionName || '(native)'} ← ${c.functionName || '(anonymous)'}:${c.lineNumber + 1}`, mod: modOf(c.lineNumber) };
    return { fn: cf.functionName || '(native)', mod: /^\((program|garbage collector|root)\)$/.test(cf.functionName) ? '(browser)' : '(other)' };
  };
  const out = { cpu: null, alloc: null };
  if (cpu && cpu.nodes && cpu.samples && cpu.samples.length) {
    const per = (cpu.endTime - cpu.startTime) / 1000 / cpu.samples.length; // ms per sample
    const fns = new Map(); const mods = new Map(); let total = 0;
    const byId = new Map(cpu.nodes.map((n) => [n.id, n])); const parent = new Map();
    for (const n of cpu.nodes) for (const c of n.children || []) parent.set(c, n.id);
    const callers = (n) => { const out = []; for (let id = parent.get(n.id), g = 0; id != null && g < 40; id = parent.get(id), g++) out.push(byId.get(id).callFrame); return out; };
    for (const n of cpu.nodes) {
      if (!n.hitCount || n.callFrame.functionName === '(idle)') continue;
      const k = key(n.callFrame, isGame(n.callFrame) ? null : callers(n)); const ms = n.hitCount * per; total += ms;
      fns.set(k.fn + '|' + k.mod, (fns.get(k.fn + '|' + k.mod) || 0) + ms); mods.set(k.mod, (mods.get(k.mod) || 0) + ms);
    }
    out.cpu = { busyMs: Math.round(total), wallMs: Math.round((cpu.endTime - cpu.startTime) / 1000),
      byModule: [...mods].sort((a, b) => b[1] - a[1]).map(([m, ms]) => ({ module: m, ms: Math.round(ms), pct: r2((100 * ms) / total) })),
      top: [...fns].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, ms]) => { const [fn, mod] = k.split('|'); return { fn, module: mod, ms: Math.round(ms), pct: r2((100 * ms) / total) }; }) };
  }
  if (heap && heap.head) {
    const fns = new Map(); const mods = new Map(); let total = 0;
    const walk = (n, up = []) => { if (n.selfSize) { const k = key(n.callFrame, up); total += n.selfSize; fns.set(k.fn + '|' + k.mod, (fns.get(k.fn + '|' + k.mod) || 0) + n.selfSize); mods.set(k.mod, (mods.get(k.mod) || 0) + n.selfSize); } for (const c of n.children || []) walk(c, [n.callFrame, ...up].slice(0, 40)); };
    walk(heap.head);
    out.alloc = { note: 'sampling heap profiler incl. objects already collected: bytes allocated during the show (sampled), by allocating function', totalKb: Math.round(total / 1024),
      byModule: [...mods].sort((a, b) => b[1] - a[1]).map(([m, b]) => ({ module: m, kb: Math.round(b / 1024) })),
      top: [...fns].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, b]) => { const [fn, mod] = k.split('|'); return { fn, module: mod, kb: Math.round(b / 1024) }; }) };
  }
  return out;
}
export function hostLoad() { const l = os.loadavg(); return { cores: os.cpus().length, load1: r2(l[0]), load5: r2(l[1]) }; }
async function gc(cdp) { try { await cdp.send('HeapProfiler.collectGarbage'); await cdp.send('HeapProfiler.collectGarbage'); } catch { /* ignore */ } }

function frameStats(rec, refresh) {
  if (!rec) return null;
  const d = summarize(rec.deltas);
  const period = refresh || 1000 / 60;
  let dropped = 0; let over = 0;
  for (const x of rec.deltas) { const k = Math.round(x / period) - 1; if (k > 0) dropped += k; if (x > 2 * period) over++; }
  const frames = rec.deltas.length;
  const fxR = summarize(rec.fxRender); const fxRF = summarize(rec.fxRenderPerFrame); const fxU = summarize(rec.fxUpdate); const fxUF = summarize(rec.fxUpdatePerFrame);
  const cb = summarize(rec.rafCb);
  const lt = (rec.longTasks || []).map((l) => {
    let phase = null; let next = null;
    for (const e of rec.ui || []) { if (e.t <= l.start) phase = e.ui; else if (!next) next = e; }
    // A task that starts in BUILD/RESULT and ends as RESOLVING begins is the Light-the-fuse handler.
    if (next && next.ui === 'RESOLVING' && (phase === 'BUILD' || phase === 'RESULT') && next.t <= l.start + l.dur + 1) phase = `${phase}→RESOLVING: the light handler`;
    else if (next && next.ui === 'END' && next.t <= l.start + l.dur + 1) phase = `${phase}→END: opening the end screen`;
    return { ...l, phase: phase || '(before first ui change)', at: Math.round(l.start - rec.t0) };
  });
  return {
    durationMs: Math.round(rec.durationMs), frames, refreshMs: r2(period),
    frameMs: roundObj(d), fps: d ? r2(1000 / d.mean) : null, droppedFrames: dropped, droppedPct: frames ? r2((100 * dropped) / (frames + dropped)) : null, framesOver2x: over,
    rafCallbackMs: roundObj(cb), fxRenderMs: roundObj(fxR), fxRenderPerFrameMs: roundObj(fxRF), fxUpdateMs: roundObj(fxU), fxUpdatePerFrameMs: roundObj(fxUF),
    longTasks: { count: lt.length, maxMs: lt.length ? Math.round(Math.max(...lt.map((l) => l.dur))) : 0, totalMs: Math.round(lt.reduce((s, l) => s + l.dur, 0)),
      top: lt.slice().sort((a, b) => b.dur - a.dur).slice(0, 5).map((l) => ({ ms: Math.round(l.dur), atMs: l.at, phase: l.phase })) },
    fxStatsMax: rec.fxStatsMax, fxStatsSeries: rec.fxStatsSeries, fxStatsError: rec.fxStatsError,
    allocKbPerFrame: rec.heapSamples > 1 ? r2(rec.allocBytes / 1024 / (rec.heapSamples - 1)) : null,
    uiSequence: (rec.ui || []).map((e) => e.ui),
    rawFrameMs: rec.deltas.map((x) => Math.round(x * 10) / 10),
  };
}

async function measureBoot(page, srv, runs) {
  const loads = [];
  for (let i = 0; i < runs; i++) {
    const b = await gotoGame(page, srv, { clean: true, timeoutMs: 30000 });
    const t = await page.evaluate(() => {
      const T = window.__oohTools; const nav = performance.getEntriesByType('navigation')[0] || {};
      const fcp = performance.getEntriesByType('paint').find((p) => p.name === 'first-contentful-paint');
      const firstBuild = T.uiLog.find((e) => e.ui === 'BUILD');
      return { toBuildMs: firstBuild ? firstBuild.t : null, firstUi: T.uiLog[0] ? T.uiLog[0].ui : null, domContentLoadedMs: nav.domContentLoadedEventEnd || null, loadMs: nav.loadEventEnd || null, fcpMs: fcp ? fcp.startTime : null };
    });
    loads.push({ ...roundObj(t, (x) => Math.round(x)), ok: b.ok, ui: b.ui });
  }
  const med = summarize(loads.map((l) => l.toBuildMs).filter((x) => x != null));
  return { loads, toBuildMedianMs: med ? Math.round(med.p50) : null, fcpMedianMs: (summarize(loads.map((l) => l.fcpMs).filter((x) => x != null)) || {}).p50 ?? null };
}

async function simTimings(page, { iters }) {
  return page.evaluate(async ({ iters }) => {
    const g = window.__game; const out = { notes: [] };
    let O = null; try { O = eval('typeof OOH') !== 'undefined' ? eval('OOH') : null; } catch (e) { /* ignore */ }
    out.crossOriginIsolated = !!self.crossOriginIsolated;
    let minStep = Infinity; let a = performance.now();
    for (let i = 0; i < 200000 && minStep > 0.001; i++) { const b = performance.now(); if (b > a) { minStep = Math.min(minStep, b - a); a = b; } }
    out.timerResolutionMs = minStep;
    const stats = (arr, total, n) => { const s = Array.from(arr).sort((x, y) => x - y); const p = (q) => s[Math.min(s.length - 1, Math.max(0, Math.ceil(q * s.length) - 1))]; return { n, mean: total / n, p50: p(0.5), p95: p(0.95), max: s[s.length - 1] }; };
    // Synchronous calls are timed without an await (a microtask per call would inflate them).
    const bench = async (fn, n, warm = 10) => {
      for (let i = 0; i < warm; i++) { const r = fn(i); if (r && typeof r.then === 'function') await r; }
      const samples = new Float64Array(n); const t0 = performance.now();
      for (let i = 0; i < n; i++) { const t = performance.now(); const r = fn(i); if (r && typeof r.then === 'function') await r; samples[i] = performance.now() - t; }
      return stats(samples, performance.now() - t0, n);
    };
    const st = await g.state();
    const rulesFor = (s) => { try { if (O && typeof O.rulesFor === 'function') return O.rulesFor(st, s); } catch (e) { /* ignore */ } return s === 23 ? ['countdown'] : []; };
    const tonight = rulesFor(st.show);
    out.state = { show: st.show, tubes: st.tubes.length, rules: tonight };
    // resolveShow: tonight's rules and the Countdown on the same rack
    const resolveFn = O && typeof O.resolveShow === 'function' ? (t, c) => O.resolveShow(t, c) : (typeof g.resolve === 'function' ? (t, c) => g.resolve(t, c) : null);
    out.resolveVia = O && typeof O.resolveShow === 'function' ? 'OOH.resolveShow' : resolveFn ? '__game.resolve' : null;
    if (resolveFn) {
      const tubes = JSON.parse(JSON.stringify(st.tubes));
      try {
        const cd = resolveFn(tubes, { rules: ['countdown'], crowd: st.crowd, fav: null, trace: false });
        out.countdownBursts = cd && cd.bursts; out.countdownApplause = cd && cd.applause;
        out.resolveCountdown = await bench(() => resolveFn(tubes, { rules: ['countdown'], crowd: st.crowd, fav: null }), iters.resolve, 50);
        out.resolveTonight = await bench(() => resolveFn(tubes, { rules: tonight, crowd: st.crowd, fav: null }), iters.resolve, 50);
        const withTrace = await bench(() => resolveFn(tubes, { rules: ['countdown'], crowd: st.crowd, fav: null, trace: true }), Math.max(20, iters.resolve >> 2), 10);
        out.resolveCountdownTrace = withTrace;
      } catch (e) { out.notes.push('resolve failed: ' + (e && e.message || e)); }
    } else out.notes.push('no OOH.resolveShow or __game.resolve');
    // OOH.step per action type, on clones of the live state (clone time excluded)
    if (O && typeof O.step === 'function' && typeof O.clone === 'function' && typeof O.legalActions === 'function') {
      const acts = O.legalActions(st) || [];
      const pickers = {
        light: (a) => a.type === 'light', move: (a) => a.type === 'move', buy: (a) => a.type === 'buy', upgrade: (a) => a.type === 'upgrade',
        sell: (a) => a.type === 'sell', reroll: (a) => a.type === 'reroll', sponsor: (a) => a.type === 'sponsor', buyTube: (a) => a.type === 'buyTube',
        buyRig: (a) => a.type === 'buyRig', match: (a) => a.type === 'match', restore: (a) => a.type === 'restore',
      };
      out.step = {};
      for (const [name, f] of Object.entries(pickers)) {
        const act = acts.find(f); if (!act) continue;
        const n = name === 'light' ? iters.light : iters.step;
        const clones = []; for (let i = 0; i < n + 5; i++) clones.push(O.clone(st));
        try { out.step[name] = await bench((i) => O.step(clones[i % clones.length], act), n, 5); } catch (e) { out.notes.push(`step ${name} threw: ${e && e.message || e}`); }
      }
      try { out.legalActions = await bench(() => O.legalActions(st), iters.step, 5); } catch (e) { /* ignore */ }
    } else out.notes.push('OOH.step/clone/legalActions not reachable as a global; step timings skipped');
    // __game.act round trip: dispatch + UI re-render (a move there and back)
    if (typeof g.act === 'function' && st.tubes.length >= 2 && st.tubes[0].shell) {
      const mv = { type: 'move', from: { zone: 'tube', i: 0 }, to: { zone: 'tube', i: 1 } };
      const mvBack = { type: 'move', from: { zone: 'tube', i: 1 }, to: { zone: 'tube', i: 0 } };
      try { out.actRoundTrip = await bench((i) => g.act(i % 2 ? mvBack : mv), iters.act % 2 ? iters.act + 1 : iters.act, 2); } catch (e) { out.notes.push('act failed: ' + (e && e.message || e)); }
    }
    if (typeof g.mood === 'function') { try { out.mood = await bench(() => g.mood(), iters.act, 2); } catch (e) { /* ignore */ } }
    if (typeof g.preview === 'function') { try { out.preview = await bench(() => g.preview(), iters.act, 2); } catch (e) { /* ignore */ } }
    return out;
  }, { iters });
}

async function measureShow(page, srv, key, cfg, notes, beforeLight = null) {
  const spec = RACKS[key];
  const res = { scenario: key, label: spec.label };
  let inj;
  try { inj = await injectScenario(page, srv, spec, { settingsPatch: { instant: false, speed: 1, reducedMotion: 'off' } }); } catch (e) { inj = { how: null, notes: [`injection threw: ${e.message}`] }; }
  res.setup = inj.how; res.setupNotes = inj.notes;
  if (!inj.how) {
    try {
      const sb = await scriptBTo(page, { minBursts: key === 'show7' ? 7 : 9 });
      res.setup = `fallback: Script B via __game.act (rack fires ${sb.bursts} bursts at show ${sb.show + 1})`;
    } catch (e) { res.error = `could not set up the rack: ${e.message}`; return res; }
  }
  res.animation = await ensureAnimated(page);
  res.fxWrap = await page.evaluate(() => window.__oohTools.wrapFx());
  // the rack as lit
  res.rack = await page.evaluate(async () => {
    const s = await window.__game.state();
    let res = null;
    try { if (typeof window.__game.resolve === 'function') { let O = null; try { O = eval('OOH'); } catch (e) { /* ignore */ } const rules = O && O.rulesFor ? O.rulesFor(s, s.show) : (s.show === 23 ? ['countdown'] : []); res = await window.__game.resolve(s.tubes, { rules, crowd: s.crowd, fav: null }); res = { rules, bursts: res.bursts, applause: res.applause, ooh: res.ooh, aah: res.aah }; } } catch (e) { res = { error: String(e.message || e) }; }
    return { show: s.show + 1, tubes: s.tubes.map((t) => (t.shell ? `${t.shell.id}${t.shell.star > 1 ? '*' + t.shell.star : ''}:${t.shell.col}` : '-') + (t.rig ? `[${t.rig}]` : '')).join(' '), crowd: s.crowd, predicted: res };
  }).catch((e) => ({ error: e.message }));
  if (beforeLight) { try { await beforeLight(); } catch (e) { notes.push(`${key}: ${e.message}`); } }
  await sleep(300);
  const m0 = cfg.cdp ? await withTimeout(cdpMetrics(cfg.cdp), 5000).catch(() => null) : null;
  const prof = cfg.cdp && cfg.profileJs ? await withTimeout((async () => {
    await cfg.cdp.send('Profiler.enable'); await cfg.cdp.send('Profiler.setSamplingInterval', { interval: 500 }); await cfg.cdp.send('Profiler.start');
    await cfg.cdp.send('HeapProfiler.enable'); await cfg.cdp.send('HeapProfiler.startSampling', { samplingInterval: 8192, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true });
    return true;
  })(), 5000).catch(() => false) : false;
  await page.evaluate(() => window.__oohTools.start());
  const lit = await lightShow(page, { timeoutMs: cfg.showTimeoutMs, allowAct: true });
  // Keep recording through the slam / finale tail: the core holds RESULT (or opens END ~1.6 s after the
  // slam on a win), so record until END appears or 1.8 s pass, whichever is first.
  if (lit.ok && lit.endUi !== 'END') await waitSettled(page, ['END', 'BUILD'], 1800);
  await sleep(200);
  const rec = await page.evaluate(() => window.__oohTools.stop());
  const m1 = cfg.cdp ? await withTimeout(cdpMetrics(cfg.cdp), 5000).catch(() => null) : null;
  if (prof) {
    const [c, h] = await withTimeout(Promise.all([cfg.cdp.send('Profiler.stop').then((r) => r.profile, () => null), cfg.cdp.send('HeapProfiler.stopSampling').then((r) => r.profile, () => null)]), 20000).catch(() => [null, null]);
    res.jsProfile = summarizeProfiles(c, h, cfg.modOf || (() => 'page'));
  }
  res.light = lit;
  res.frames = frameStats(rec, cfg.refreshMs);
  res.cpu = cpuStats(m0, m1, res.frames && res.frames.frames);
  res.host = hostLoad();
  if (!lit.ok) notes.push(`${key}: ${lit.error}`);
  const after = await page.evaluate(async () => { const s = await window.__game.state(); const h = s.runStats && s.runStats.history; const last = h && h[h.length - 1]; return { phase: s.phase, show: s.show + 1, last: last ? { show: last.show, applause: last.applause, target: last.target, pass: last.pass, bursts: last.bursts } : null }; }).catch(() => null);
  res.outcome = after;
  return res;
}

async function measureLeak(page, srv, cdp, shows, cfg) {
  const out = { shows, points: [], restarts: 0, method: null, notes: [] };
  let inj;
  try { inj = await injectScenario(page, srv, RACKS.leak, { settingsPatch: { instant: false, speed: 1, reducedMotion: 'off' } }); } catch (e) { inj = { how: null }; }
  out.setup = inj.how || 'fresh run (injection failed)';
  await ensureAnimated(page);
  const warm = await lightShow(page, { timeoutMs: cfg.showTimeoutMs });
  if (!warm.ok) { out.error = `warm-up show failed: ${warm.error}`; return out; }
  const point = async (i) => { await gc(cdp); const m = await cdpMetrics(cdp); out.points.push({ afterShows: i, heapKb: Math.round((m.heapUsed ?? m.JSHeapUsedSize) / 1024), nodes: m.Nodes, listeners: m.JSEventListeners, documents: m.Documents }); };
  await point(0);
  for (let i = 1; i <= shows; i++) {
    if ((await ui(page)) === 'END') {
      out.restarts++;
      const clicked = await page.locator('#run-it-back').click({ force: true, timeout: 3000 }).then(() => true, () => false);
      if (!clicked) await page.evaluate(() => { try { GAME.newRun({}); } catch (e) { /* ignore */ } });
      await waitFor(async () => (await ui(page)) === 'BUILD', 8000);
      await ensureAnimated(page);
    }
    // Once #fire is known to be ignored in RESULT, do not wait the full 2.5 s for it every show.
    const r = await lightShow(page, { timeoutMs: cfg.showTimeoutMs, fireWaitMs: out.fireIgnored ? 600 : 2500 });
    if (!r.ok) { out.notes.push(`show ${i}: ${r.error}`); break; }
    out.method = r.method;
    if (r.fireIgnored) out.fireIgnored = (out.fireIgnored || 0) + 1;
    await point(i);
  }
  const P = out.points;
  if (P.length >= 2) {
    const xs = P.map((p) => p.afterShows); const ys = P.map((p) => p.heapKb);
    const mx = xs.reduce((s, x) => s + x, 0) / xs.length; const my = ys.reduce((s, y) => s + y, 0) / ys.length;
    const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0); const den = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    out.heapSlopeKbPerShow = den ? r2(num / den) : 0;
    out.heapDeltaKb = ys[ys.length - 1] - ys[0];
    out.nodesDelta = (P[P.length - 1].nodes ?? 0) - (P[0].nodes ?? 0);
    out.listenersDelta = (P[P.length - 1].listeners ?? 0) - (P[0].listeners ?? 0);
    out.showsCompleted = P[P.length - 1].afterShows;
  }
  return out;
}

// Records the build at rest; the median interval also calibrates the refresh period used to count
// dropped frames (headless Chromium normally runs rAF at 60 Hz).
async function measureIdle(page, ms, cdp = null) {
  await page.evaluate(() => window.__oohTools.wrapFx());
  const m0 = cdp ? await withTimeout(cdpMetrics(cdp), 5000).catch(() => null) : null;
  await page.evaluate(() => window.__oohTools.start());
  await sleep(ms);
  const rec = await page.evaluate(() => window.__oohTools.stop());
  const m1 = cdp ? await withTimeout(cdpMetrics(cdp), 5000).catch(() => null) : null;
  const med = summarize(rec && rec.deltas);
  const refreshMs = med && med.p50 > 5 && med.p50 < 40 ? med.p50 : 1000 / 60;
  const stats = frameStats(rec, refreshMs);
  if (stats) stats.cpu = cpuStats(m0, m1, stats.frames);
  return { stats, refreshMs };
}

// ------------------------------------------------------------------ budgets
// Modules that tools/build.mjs --allow-missing replaced with a no-op stub (it logs a console warning).
function stubbedModules(report) {
  const out = new Set();
  for (const e of report.console) { const m = /\[ooh build\] (\S+) is missing/.exec(e.text); if (m) out.add(m[1]); }
  return [...out];
}

function evaluate(report) {
  const checks = [];
  const stubs = report.stubbedModules || [];
  const fxStub = stubs.includes('fx.js'); const simStub = stubs.includes('sim.js');
  const add0 = (id, label, budget, measured, verdict, detail = '') => checks.push({ id, label, budget, measured, verdict, detail });
  // A budget measured on a stubbed module is meaningless: report it as SKIP.
  const add = (id, label, budget, measured, verdict, detail = '') => {
    const stubbed = (fxStub && /^(render|particles)$/.test(id)) || (simStub && /^(step|resolve)$/.test(id));
    if (stubbed && verdict !== 'SKIP') return add0(id, label, budget, measured, 'SKIP', `${id === 'render' || id === 'particles' ? 'fx.js' : 'sim.js'} is a build stub in this file; ${detail}`);
    return add0(id, label, budget, measured, verdict, detail);
  };
  const f = report.file;
  const lim = report.sizeLimits || sizeLimits();
  add('size.ceiling', 'File size (hard ceiling)', `≤ ${lim.failKb} KB`, `${f.kb} KB (gzip ${f.gzipKb} KB)`, f.kb <= lim.failKb ? 'PASS' : 'FAIL', lim.source);
  add('size.target', 'File size (warning line)', `≤ ${lim.warnKb} KB`, `${f.kb} KB`, f.kb <= lim.warnKb ? 'PASS' : 'WARN', `${lim.source}; spec §11.1 alone says 150 / 190 KB`);
  const mob = report.profiles.mobile; const desk = report.profiles.desktop;
  const primary = mob || desk; const pname = mob ? 'mobile' : 'desktop';
  const chains = (p) => (p ? ['show7', 'cd14', 'cdwin'].map((k) => p.scenarios && p.scenarios[k]).filter((s) => s && s.frames) : []);
  // render ≤ 6 ms
  if (primary) {
    let worst = null;
    for (const s of chains(primary)) {
      const fr = s.frames; let v; let src;
      if (fr.fxRenderPerFrameMs) { v = fr.fxRenderPerFrameMs.p95; src = 'FX.render per frame, p95'; } else if (fr.rafCallbackMs) { v = fr.rafCallbackMs.p95; src = 'whole rAF callback per frame, p95 (FX.render not wrappable: upper bound)'; }
      if (v != null && (!worst || v > worst.v)) worst = { v, src, s: s.scenario, p50: fr.fxRenderPerFrameMs ? fr.fxRenderPerFrameMs.p50 : null, cpu: s.cpu && s.cpu.cpuPerFrameMs, max: fr.fxRenderPerFrameMs ? fr.fxRenderPerFrameMs.max : fr.rafCallbackMs && fr.rafCallbackMs.max };
    }
    if (worst) add('render', `FX render (${pname}${pname === 'mobile' ? `, CPU ×${report.config.throttle}` : ''}, §11.7)`, '≤ 6 ms', `${fmtMs(worst.v)} p95, ${fmtMs(worst.p50)} p50 (max ${fmtMs(worst.max)}) in ${worst.s}`, worst.v <= 6 ? 'PASS' : 'FAIL', worst.src + (worst.max > 6 ? '; some frames exceed 6 ms' : '') + (worst.cpu != null ? `; main-thread CPU ${fmtMs(worst.cpu)} per rendered frame (all work, CDP ThreadTime)` : ''));
    else add('render', 'FX render (§11.7)', '≤ 6 ms', 'n/a', 'SKIP', 'no lit show recorded');
  }
  // step ≤ 2 ms
  const sim = primary && primary.sim;
  if (sim && sim.step && Object.keys(sim.step).length) {
    const [name, v] = Object.entries(sim.step).sort((a, b) => b[1].p95 - a[1].p95)[0];
    add('step', `OOH.step (${pname}, worst action, §11.7)`, '≤ 2 ms', `${fmtMs(v.p95, 3)} p95 (${name}; mean ${fmtMs(v.mean, 3)}, max ${fmtMs(v.max, 3)})`, v.p95 <= 2 ? 'PASS' : 'FAIL', `actions timed: ${Object.keys(sim.step).join(', ')}`);
  } else add('step', 'OOH.step (§11.7)', '≤ 2 ms', 'n/a', 'SKIP', (sim && sim.notes || []).join('; ') || 'no SIM timings');
  if (sim && sim.resolveCountdown) {
    const v = sim.resolveCountdown;
    add('resolve', `resolveShow, 6-tube Countdown (${pname}, §11.7)`, '≤ 0.2 ms p95', `${fmtMs(v.p95, 3)} p95 (mean ${fmtMs(v.mean, 4)}, max ${fmtMs(v.max, 3)}; ${sim.countdownBursts} bursts)`, v.p95 <= 0.2 ? 'PASS' : 'FAIL', `via ${sim.resolveVia}; the spec's node reference averages 17 µs`);
  } else add('resolve', 'resolveShow, 6-tube Countdown (§11.7)', '≤ 0.2 ms', 'n/a', 'SKIP');
  // particles ≤ 400
  let pmax = null; let pkey = null; let pscen = null;
  for (const p of [mob, desk]) for (const s of chains(p)) {
    const m = s.frames.fxStatsMax || {};
    const k = Object.keys(m).find((x) => /particle/i.test(x)) || Object.keys(m).find((x) => /^(live|p|count)$/i.test(x));
    if (k && (pmax === null || m[k] > pmax)) { pmax = m[k]; pkey = k; pscen = s.scenario; }
  }
  if (pmax !== null) add('particles', 'Live particles (FX.stats, §11.7)', '≤ 400', `${pmax} max (${pkey}, ${pscen})`, pmax <= 400 ? 'PASS' : 'FAIL');
  else add('particles', 'Live particles (FX.stats, §11.7)', '≤ 400', 'n/a', 'SKIP', 'FX.stats() missing or has no particle count');
  // guides
  for (const [pn, p] of [['mobile', mob], ['desktop', desk]]) {
    if (!p) continue;
    for (const s of chains(p)) {
      const fr = s.frames;
      const dropLimit = pn === 'desktop' ? 5 : 10;
      add(`frames.${pn}.${s.scenario}`, `Dropped frames during ${s.scenario} (${pn}; guide)`, `≤ ${dropLimit}%`, `${fr.droppedPct}% (${fr.droppedFrames} over ${fr.frames} frames; p95 interval ${fmtMs(fr.frameMs && fr.frameMs.p95, 1)})`, fr.droppedPct <= dropLimit ? 'PASS' : 'WARN');
      const ltLimit = pn === 'desktop' ? 50 : 100;
      add(`longtask.${pn}.${s.scenario}`, `Longest task during ${s.scenario} (${pn}; guide)`, `< ${ltLimit} ms`, `${fr.longTasks.maxMs} ms (${fr.longTasks.count} long tasks)`, fr.longTasks.maxMs < ltLimit ? 'PASS' : 'WARN',
        (fr.longTasks.top || []).slice(0, 3).map((l) => `${l.ms} ms at +${l.atMs} ms in ${l.phase}`).join('; '));
    }
    {
      const shows = chains(p).filter((s) => s.frames.allocKbPerFrame != null);
      if (shows.length) {
        const w = shows.reduce((a, b) => (b.frames.allocKbPerFrame > a.frames.allocKbPerFrame ? b : a));
        const base = p.idle && p.idle.allocKbPerFrame != null ? p.idle.allocKbPerFrame : 0;
        const over = w.frames.allocKbPerFrame - base;
        add(`alloc.${pn}`, `JS allocation per frame during a show (${pn}; §11.7 "no allocations in the particle loop", whole-page proxy)`, '≤ 32 KB/frame above idle', `${w.frames.allocKbPerFrame} KB/frame in ${w.scenario} (idle ${base} KB/frame)`, over <= 32 ? 'PASS' : 'WARN',
          'sum of positive usedJSHeapSize steps between frames; includes UI work, so a proxy for the particle loop');
      }
    }
    if (p.sim && p.sim.actRoundTrip) {
      const v = p.sim.actRoundTrip;
      add(`act.${pn}`, `__game.act round trip: dispatch + re-render (${pn}; guide)`, '≤ 16.7 ms p95', `${fmtMs(v.p95)} p95 (mean ${fmtMs(v.mean)})`, v.p95 <= 16.7 ? 'PASS' : 'WARN', '§2.1: feedback in the same frame');
    }
    if (p.boot && p.boot.toBuildMedianMs != null) {
      const lim = pn === 'mobile' ? 1500 : 500;
      add(`boot.${pn}`, `Boot to BUILD (${pn}; guide)`, `≤ ${lim} ms`, `${p.boot.toBuildMedianMs} ms median`, p.boot.toBuildMedianMs <= lim ? 'PASS' : 'WARN');
    } else if (p.boot) add(`boot.${pn}`, `Boot to BUILD (${pn})`, 'reaches BUILD', 'never reached BUILD', 'FAIL');
    if (p.leak && p.leak.heapSlopeKbPerShow != null) {
      const L = p.leak;
      const bad = L.heapSlopeKbPerShow > 50 && L.heapDeltaKb > 512;
      add(`leak.${pn}`, `Heap after ${L.showsCompleted} shows, post-GC (${pn}; guide)`, '≤ 50 KB/show', `${L.heapSlopeKbPerShow} KB/show (Δ ${L.heapDeltaKb} KB; nodes Δ ${L.nodesDelta}; listeners Δ ${L.listenersDelta})`, bad || L.nodesDelta > 50 * L.showsCompleted || L.listenersDelta > 5 * L.showsCompleted ? 'WARN' : 'PASS');
    }
  }
  let ign = 0; let ignUi = null;
  for (const p of [mob, desk]) if (p) { if (p.leak && p.leak.fireIgnored) { ign += p.leak.fireIgnored; ignUi = 'RESULT'; } for (const s of Object.values(p.scenarios || {})) if (s.light && s.light.fireIgnored) { ign++; ignUi = s.light.fireIgnored; } }
  add0('fire', 'Light the fuse (#fire click) starts the show (functional)', 'always', ign ? `ignored ${ign}× (data-ui=${ignUi}); the tool fell back to GAME.light()` : 'yes', ign ? 'WARN' : 'PASS',
    ign ? 'core.light() accepts RESULT and #fire is enabled there, but the click does nothing until a build action (UI_PLAY light() only fires from BUILD)' : '');
  const errs = report.console.filter((e) => e.kind === 'pageerror' || e.kind === 'error');
  add('console', 'Page errors and console errors (guide)', 'none', `${errs.length}`, errs.length ? 'WARN' : 'PASS', errs.slice(0, 3).map((e) => e.text).join(' | '));
  add('network', 'Requests other than Google Fonts (§11.2; guide)', 'none', `${report.externalRequests.length}`, report.externalRequests.length ? 'WARN' : 'PASS', report.externalRequests.slice(0, 3).join(' '));
  // Wall-clock timing checks taken while the host was overloaded (other processes competing for the
  // cores) are kept but annotated, with the main thread's own CPU time where it was measured.
  for (const c of checks) {
    const m = /^(render|step|resolve)$/.exec(c.id) ? pname : (/^(?:frames|longtask|act|boot)\.(\w+)/.exec(c.id) || [])[1];
    const p = m && report.profiles[m]; if (!p) continue;
    const loads = [p.host, report.host && report.host.start, report.host && report.host.end, ...Object.values(p.scenarios || {}).map((x) => x.host)].filter(Boolean);
    const worst = loads.reduce((w, x) => (x.load1 / x.cores > w.load1 / w.cores ? x : w), loads[0] || { load1: 0, cores: 1 });
    const waits = Object.values(p.scenarios || {}).map((x) => x.cpu && x.cpu.waitRatio).filter((x) => x != null);
    const wait = waits.length ? Math.max(...waits) : null;
    if (worst.load1 / worst.cores > 1 || (wait != null && wait > 1.5 * (p.throttle || 1)))
      c.detail = `${c.detail ? c.detail + '; ' : ''}host overloaded (load ${worst.load1} on ${worst.cores} cores${wait != null ? `, busy/CPU up to ${wait}×` : ''}): wall-clock timings inflated`;
  }
  return checks;
}

// ------------------------------------------------------------------ report
function mdReport(rep) {
  const L = [];
  const verdict = rep.verdict;
  L.push('# Ooh × Aah: performance report', '');
  L.push(`**Verdict: ${verdict}** · ${rep.generatedAt} · \`${rep.file.file}\` ${rep.file.kb} KB (gzip ${rep.file.gzipKb} KB, sha1 ${rep.file.sha1})${rep.buildNote ? ` · ${rep.buildNote}` : ''}`, '');
  L.push(`Game version: ${rep.api && rep.api.version || 'n/a'} · hooks: ${rep.api ? rep.api.hooks.join(', ') || 'none' : 'n/a'} · FX.stats: ${rep.api && rep.api.fxStats ? 'yes' : 'no'} · Chromium ${rep.browserVersion} (headless, software raster: render times are CPU-bound upper bounds)`, '');
  const hs = rep.host || {};
  if (hs.cores) L.push(`Host: ${hs.cores} cores; 1-min load average ${hs.start ? hs.start.load1 : '?'} at start, ${hs.end ? hs.end.load1 : '?'} at end${hs.end && hs.end.load1 > hs.cores ? ' (overloaded: wall-clock timings are inflated; compare the CPU/frame column)' : ''}.${rep.incomplete ? ` **Incomplete run:** ${rep.incomplete}.` : ''}`, '');
  L.push('## Budgets', '', '| | Check | Budget | Measured | Notes |', '|---|---|---|---|---|');
  for (const c of rep.checks) L.push(`| ${c.verdict === 'PASS' ? 'PASS' : c.verdict === 'FAIL' ? '**FAIL**' : c.verdict} | ${c.label} | ${c.budget} | ${c.measured} | ${(c.detail || '').replace(/\|/g, '/')} |`);
  L.push('');
  for (const [pn, p] of Object.entries(rep.profiles)) {
    if (!p) continue;
    L.push(`## ${pn}: ${p.viewport}${p.throttle > 1 ? `, CPU ×${p.throttle}` : ''}${p.wallSeconds != null ? ` (${p.wallSeconds} s)` : ''}`, '');
    if (p.error) L.push(`Error: ${p.error}`, '');
    if (p.boot) {
      L.push(`**Boot** (clean storage, ${p.boot.loads.length} loads): to BUILD median **${p.boot.toBuildMedianMs ?? 'n/a'} ms**, FCP ${p.boot.fcpMedianMs != null ? Math.round(p.boot.fcpMedianMs) + ' ms' : 'n/a'}; loads: ${p.boot.loads.map((l) => `${l.toBuildMs ?? '—'} ms${l.ok ? '' : ' (no BUILD)'}`).join(', ')}.`, '');
    }
    const rows = [];
    if (p.idle) rows.push(['idle (build at rest)', null, p.idle]);
    for (const k of ['show7', 'cd14', 'cdwin']) { const s = p.scenarios && p.scenarios[k]; if (s) rows.push([k, s, s.frames]); }
    if (rows.length) {
      L.push('| Scenario | Frames | Interval p50 / p95 / p99 / max | Dropped | rAF cb p95 | FX.render p95 / max (per frame) | FX.update / frame p95 | Main-thread CPU / busy per frame | Long tasks (max) | FX.stats max | Alloc/frame |', '|---|---|---|---|---|---|---|---|---|---|---|');
      for (const [name, sc, fr] of rows) {
        if (!fr) { L.push(`| ${name} | n/a | | | | | | | | | |`); continue; }
        const cpu = (sc && sc.cpu) || fr.cpu;
        const m = fr.frameMs || {};
        const st = Object.entries(fr.fxStatsMax || {}).map(([k, v]) => `${k} ${Math.round(v)}`).join(', ') || '—';
        L.push(`| ${name} | ${fr.frames} | ${[m.p50, m.p95, m.p99, m.max].map((x) => (x == null ? '—' : x.toFixed(1))).join(' / ')} ms | ${fr.droppedFrames} (${fr.droppedPct}%) | ${fmtMs(fr.rafCallbackMs && fr.rafCallbackMs.p95)} | ${fr.fxRenderPerFrameMs ? `${fmtMs(fr.fxRenderPerFrameMs.p95)} / ${fmtMs(fr.fxRenderPerFrameMs.max)}` : 'n/a'} | ${fr.fxUpdatePerFrameMs ? fmtMs(fr.fxUpdatePerFrameMs.p95) : 'n/a'} | ${cpu ? `${fmtMs(cpu.cpuPerFrameMs)} / ${fmtMs(cpu.busyPerFrameMs)}` : 'n/a'} | ${fr.longTasks.count} (${fr.longTasks.maxMs} ms) | ${st} | ${fr.allocKbPerFrame != null ? fr.allocKbPerFrame + ' KB' : 'n/a'} |`);
      }
      L.push('');
      for (const k of ['show7', 'cd14', 'cdwin']) {
        const s = p.scenarios && p.scenarios[k]; if (!s) continue;
        const pr = s.rack && s.rack.predicted;
        L.push(`- **${k}** (${s.label}): setup ${s.setup || 'FAILED'}; lit by ${s.light ? s.light.method : 'n/a'}; ui ${s.light && s.light.log ? s.light.log.join('→') : 'n/a'}; phases ${s.light && s.light.phases ? Object.entries(s.light.phases).map(([a, b]) => `${a} ${b} ms`).join(', ') : 'n/a'}.`
          + (s.rack && s.rack.tubes ? ` Rack at show ${s.rack.show}: \`${s.rack.tubes}\`, Crowd ${s.rack.crowd}` : '')
          + (pr && pr.bursts != null ? `; predicted ${pr.bursts} bursts, Applause ${pr.applause} under [${(pr.rules || []).join(',')}]` : '')
          + (s.outcome && s.outcome.last ? `; outcome: ${s.outcome.last.applause}/${s.outcome.last.target} ${s.outcome.last.pass ? 'pass' : 'MISS'}, phase ${s.outcome.phase}` : '')
          + (s.frames && s.frames.longTasks && s.frames.longTasks.top && s.frames.longTasks.top.length ? `; long tasks: ${s.frames.longTasks.top.map((l) => `${l.ms} ms at +${l.atMs} ms (${l.phase})`).join(', ')}` : '')
          + (s.error ? `; ERROR ${s.error}` : '') + (s.light && s.light.error ? `; ${s.light.error}` : '')
          + (s.fxWrap && (s.fxWrap.render !== 'wrapped') ? `; FX.render not wrapped (${s.fxWrap.render || s.fxWrap.why})` : ''));
      }
      L.push('');
    }
    if (p.sim) {
      const s = p.sim;
      L.push(`**SIM timings** (timer resolution ${s.timerResolutionMs != null ? (s.timerResolutionMs * 1000).toFixed(0) + ' µs' : 'n/a'}, crossOriginIsolated ${s.crossOriginIsolated}; state: show ${s.state ? s.state.show + 1 : '?'}, ${s.state ? s.state.tubes : '?'} tubes):`, '');
      L.push('| Call | n | mean | p50 | p95 | max |', '|---|---|---|---|---|---|');
      const row = (name, v) => v && L.push(`| ${name} | ${v.n} | ${fmtMs(v.mean, 4)} | ${fmtMs(v.p50, 3)} | ${fmtMs(v.p95, 3)} | ${fmtMs(v.max, 3)} |`);
      row(`resolveShow, 6-tube Countdown (${s.countdownBursts} bursts)`, s.resolveCountdown);
      row('resolveShow, same, with trace', s.resolveCountdownTrace);
      row('resolveShow, tonight\'s rules', s.resolveTonight);
      for (const [k, v] of Object.entries(s.step || {})) row(`OOH.step ${k}`, v);
      row('OOH.legalActions', s.legalActions);
      row('__game.act move (dispatch + re-render)', s.actRoundTrip);
      row('__game.mood()', s.mood);
      row('__game.preview()', s.preview);
      if (s.notes && s.notes.length) L.push('', `Notes: ${s.notes.join('; ')}`);
      L.push('');
    }
    if (p.jsProfile && (p.jsProfile.cpu || p.jsProfile.alloc)) {
      const j = p.jsProfile;
      L.push(`**Where the time and memory go** (attribution pass: ${j.scenario} again under the CPU profiler and the sampling heap profiler; not used for the budgets):`, '');
      if (j.cpu) {
        L.push(`CPU busy ${j.cpu.busyMs} ms over ${j.cpu.wallMs} ms. By module: ${j.cpu.byModule.map((m) => `${m.module} ${m.pct}%`).join(', ')}.`, '');
        L.push('| Function (line in index.html) | Module | Self ms | % |', '|---|---|---|---|', ...j.cpu.top.map((t) => `| \`${t.fn}\` | ${t.module} | ${t.ms} | ${t.pct}% |`), '');
      }
      if (j.alloc) L.push(`Allocation during the show (sampled, incl. collected objects, ${j.alloc.totalKb} KB): by module ${j.alloc.byModule.slice(0, 6).map((m) => `${m.module} ${m.kb} KB`).join(', ')}; top: ${j.alloc.top.map((t) => `\`${t.fn}\` (${t.module}) ${t.kb} KB`).join(', ')}.`, '');
    } else if (p.jsProfile && p.jsProfile.error) L.push(`Attribution pass failed: ${p.jsProfile.error}`, '');
    if (p.leak) {
      const k = p.leak;
      L.push(`**Heap check** (${k.setup}; lit by ${k.method || 'n/a'}; ${k.restarts} run restarts): ${k.error ? 'ERROR ' + k.error : `slope ${k.heapSlopeKbPerShow} KB/show, Δheap ${k.heapDeltaKb} KB, Δnodes ${k.nodesDelta}, Δlisteners ${k.listenersDelta} over ${k.showsCompleted} shows`}.`, '');
      if (k.points.length) L.push('| After shows | Heap (KB, post-GC) | DOM nodes | Listeners |', '|---|---|---|---|', ...k.points.map((q) => `| ${q.afterShows} | ${q.heapKb} | ${q.nodes ?? '—'} | ${q.listeners ?? '—'} |`), '');
      if (k.notes && k.notes.length) L.push(`Notes: ${k.notes.join('; ')}`, '');
    }
  }
  if (rep.console.length) { L.push('## Console', ''); for (const e of rep.console.slice(0, 30)) L.push(`- ${e.kind}: ${e.text.replace(/\n/g, ' ')}`); L.push(''); }
  if (rep.notes.length) { L.push('## Notes', ''); for (const n of rep.notes) L.push(`- ${n}`); L.push(''); }
  L.push('Frame intervals come from an independent rAF probe; "dropped" counts missed vsync slots at the measured refresh period. FX times come from wrapping FX.render/FX.update in place. JSON: `perf.report.json` (raw intervals included).');
  return L.join('\n');
}

// ------------------------------------------------------------------ main
// Usage text = the header comment up to "What it measures".
const USAGE = (() => { const lines = []; for (const l of fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1)) { if (!l.startsWith('//') || l.includes('What it measures')) break; lines.push(l.slice(3)); } return lines.join('\n'); })();

function parseArgs(argv) {
  const o = { html: null, build: false, out: path.join(GAME_DIR, 'tools', 'shots', 'perf'), profiles: ['mobile', 'desktop'], throttle: 4, leak: 'desktop', shows: 10, quick: false, fonts: false, isolation: true, headed: false, json: false, profileJs: true };
  for (const a of argv) {
    const m = /^--([a-z-]+)(?:=(.*))?$/.exec(a);
    if (a === '-h' || a === '--help') { console.log(USAGE); process.exit(0); }
    if (!m) { console.error(`unknown argument ${a}\n\n${USAGE}`); process.exit(2); }
    const [, k, v] = m;
    switch (k) {
      case 'html': o.html = v; break;
      case 'build': o.build = true; break;
      case 'out': o.out = path.resolve(v); break;
      case 'profiles': o.profiles = v.split(',').map((s) => s.trim()).filter(Boolean); break;
      case 'throttle': o.throttle = Math.max(1, Number(v) || 4); break;
      case 'leak': o.leak = v; break;
      case 'shows': o.shows = Math.max(1, parseInt(v, 10) || 10); break;
      case 'quick': o.quick = true; break;
      case 'fonts': o.fonts = true; break;
      case 'no-isolation': o.isolation = false; break;
      case 'headed': o.headed = true; break;
      case 'json': o.json = true; break;
      case 'no-profile': o.profileJs = false; break;
      case 'max-minutes': o.maxMinutes = Math.max(1, Number(v) || 20); break;
      default: console.error(`unknown option --${k}\n\n${USAGE}`); process.exit(2);
    }
  }
  if (o.quick && o.shows === 10) o.shows = 3;
  if (!o.maxMinutes) o.maxMinutes = o.quick ? 8 : 20;
  return o;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  fs.mkdirSync(opts.out, { recursive: true });
  let src;
  try { src = resolveHtml({ html: opts.html, build: opts.build, outDir: opts.out }); } catch (e) { console.error(`perf: ${e.message}`); process.exit(2); }
  const { chromium } = loadPlaywright();
  const srv = await startServer(src.html, { isolation: opts.isolation });
  const browser = await chromium.launch({
    headless: !opts.headed,
    args: ['--enable-precise-memory-info', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'],
  });
  const consoleLog = [];
  const report = {
    tool: 'tools/perf.mjs', generatedAt: new Date().toISOString(), file: fileStats(src.file, src.html), buildNote: src.note || null,
    browserVersion: browser.version(), config: { throttle: opts.throttle, quick: opts.quick, leak: opts.leak, shows: opts.shows, fonts: opts.fonts, isolation: opts.isolation, maxMinutes: opts.maxMinutes },
    host: { ...hostLoad(), start: hostLoad() },
    api: null, profiles: {}, console: consoleLog, externalRequests: [], notes: [], sizeLimits: sizeLimits(),
  };
  const PROFILES = {
    mobile: { id: 'mobile', width: 360, height: 740, dpr: 2, mobile: true, throttle: opts.throttle },
    desktop: { id: 'desktop', width: 1440, height: 900, dpr: 1, mobile: false, throttle: 1 },
  };
  const iters = opts.quick ? { resolve: 1000, step: 30, light: 15, act: 10 } : { resolve: 3000, step: 100, light: 40, act: 30 };
  const log = (s) => process.stdout.write(s + '\n');
  const run = { report, opts, browser, srv, log, watchdog: null };
  const finish = (reason) => finishRun(run, reason);
  run.watchdog = setTimeout(() => { log(`perf: deadline of ${opts.maxMinutes} min reached; writing the partial report`); finish(`hard deadline of ${opts.maxMinutes} min reached`); }, opts.maxMinutes * 60000);
  log(`perf: ${rel(src.file)} (${report.file.kb} KB) → ${rel(opts.out)}${src.note ? ` [${src.note}]` : ''}`);
  for (const pn of opts.profiles) {
    const prof = PROFILES[pn];
    if (!prof) { report.notes.push(`unknown profile ${pn}`); continue; }
    const P = (report.profiles[pn] = { viewport: `${prof.width}×${prof.height} @${prof.dpr}x${prof.mobile ? ' touch' : ''}`, throttle: prof.throttle, scenarios: {} });
    const t0 = Date.now();
    let ctx;
    try {
      ctx = await newContext(browser, prof, { fonts: opts.fonts, log: consoleLog });
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      if (prof.throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: prof.throttle });
      await cdp.send('Performance.enable').catch(() => {});
      P.host = hostLoad();
      const cfg = { showTimeoutMs: 15000 * prof.throttle, refreshMs: null, cdp };
      log(`  [${pn}] boot…`);
      P.boot = await measureBoot(page, srv, opts.quick ? 1 : 3);
      const api = await page.evaluate(() => window.__oohTools.probeApi()).catch(() => null);
      report.api = report.api || api;
      if (!api || !api.game) report.notes.push(`${pn}: window.__game is missing; scenario and SIM measurements skipped`);
      log(`  [${pn}] idle…`);
      const idle = await measureIdle(page, opts.quick ? 1200 : 3000, cdp);
      P.idle = idle.stats; cfg.refreshMs = idle.refreshMs; P.refreshMs = r2(idle.refreshMs);
      if (api && api.game) {
        for (const key of ['show7', 'cd14', 'cdwin']) {
          log(`  [${pn}] ${key}…`);
          // SIM timings run on the injected, not-yet-lit state: step/act on the mid-run build (light
          // then includes shop generation), resolveShow on the 6-tube Countdown rack (the budgeted case).
          const before = key === 'show7'
            ? async () => { P.sim = await simTimings(page, { iters }).catch((e) => ({ notes: [`SIM timings failed: ${e.message}`] })); }
            : key === 'cd14'
              ? async () => {
                const cd = await simTimings(page, { iters: { ...iters, step: 3, light: 3, act: 2 } }).catch(() => null);
                if (cd) { P.sim = P.sim || { notes: [] }; Object.assign(P.sim, { resolveCountdown: cd.resolveCountdown, resolveCountdownTrace: cd.resolveCountdownTrace, countdownBursts: cd.countdownBursts, countdownApplause: cd.countdownApplause, resolveRack: 'cd14' }); }
              }
              : null;
          try {
            P.scenarios[key] = await measureShow(page, srv, key, cfg, report.notes, before);
          } catch (e) { P.scenarios[key] = { scenario: key, label: RACKS[key].label, error: e.message }; report.notes.push(`${pn}/${key}: ${e.message}`); }
        }
        // Attribution pass (not used for the budgets: the profilers add overhead): cd14 again under
        // the CPU profiler and the sampling heap profiler, folded by function and by source module.
        if (opts.profileJs) {
          log(`  [${pn}] cd14 under the JS profilers…`);
          try {
            const pr = await measureShow(page, srv, 'cd14', { ...cfg, profileJs: true, modOf: moduleMap(src.html) }, report.notes);
            P.jsProfile = { scenario: 'cd14', ...(pr.jsProfile || { error: 'no profile' }), fxRenderPerFrameP50: pr.frames && pr.frames.fxRenderPerFrameMs && pr.frames.fxRenderPerFrameMs.p50 };
          } catch (e) { P.jsProfile = { error: e.message }; }
        }
        if (opts.leak === 'both' || opts.leak === pn) {
          log(`  [${pn}] heap check (${opts.shows} shows)…`);
          try { P.leak = await measureLeak(page, srv, cdp, opts.shows, cfg); } catch (e) { P.leak = { error: e.message, points: [] }; }
        }
      }
    } catch (e) {
      P.error = e.message; report.notes.push(`${pn}: ${e.message}`);
    } finally {
      if (ctx) { report.externalRequests.push(...ctx.__external); await withTimeout(ctx.close(), 10000).catch(() => {}); }
      P.wallSeconds = Math.round((Date.now() - t0) / 1000);
    }
  }
  finish(null);
}

// Writes the report from whatever has been measured. reason = null (normal end) or why the run stopped.
let FINISHED = false;
async function finishRun(ctx, reason) {
  if (FINISHED) return; FINISHED = true;
  const { report, opts, browser, srv, log } = ctx;
  clearTimeout(ctx.watchdog);
  if (reason) { report.incomplete = reason; report.notes.push(`INCOMPLETE: ${reason}; the report covers what was measured before that`); }
  report.host.end = hostLoad();
  report.externalRequests = [...new Set(report.externalRequests)];
  report.stubbedModules = stubbedModules(report);
  if (report.stubbedModules.length) report.notes.push(`build stubs in this file (tools/build.mjs --allow-missing): ${report.stubbedModules.join(', ')}`);
  await withTimeout(browser.close(), 10000).catch(() => {});
  await withTimeout(srv.close(), 3000).catch(() => {});
  report.checks = evaluate(report);
  report.verdict = reason ? 'INCOMPLETE' : report.checks.some((c) => c.verdict === 'FAIL') ? 'FAIL' : report.checks.some((c) => c.verdict === 'WARN') ? 'PASS with warnings' : 'PASS';
  const jsonPath = path.join(opts.out, 'perf.report.json');
  const mdPath = path.join(opts.out, 'perf-report.md');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 1));
  fs.writeFileSync(mdPath, mdReport(report));
  log('');
  for (const c of report.checks) log(`  ${c.verdict.padEnd(4)}  ${c.label}: ${c.measured} (budget ${c.budget})`);
  log(`\nperf: ${report.verdict}${reason ? ` (${reason})` : ''} → ${rel(mdPath)}, ${rel(jsonPath)}`);
  if (opts.json) process.stdout.write(JSON.stringify(report) + '\n');
  process.exit(reason ? 2 : report.verdict === 'FAIL' ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((e) => { console.error(`perf: fatal: ${e.stack || e.message}`); process.exit(2); });
}
