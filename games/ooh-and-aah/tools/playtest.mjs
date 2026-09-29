#!/usr/bin/env node
// Ooh × Aah: browser playtest harness (Playwright + Chromium).
//
//   node tools/playtest.mjs [--flow=smoke|ui|keys|bots|full] [--viewports=360x740,…] [--seed=S]
//                           [--shows=N] [--out=DIR] [--json=FILE] [--file=index.html] [--jobs=N]
//                           [--fonts=abort|stub|live] [--bots-timeout=MS] [--task-timeout=MS] [--verbose]
//
// Loads index.html inside an artifact-like host skeleton (and, in the smoke flow, raw) and checks
// the page contract, layout, tap targets, focus, the play loop and the test hooks (spec §11.2,
// §11.6, §13; CONTRACT.md "DOM ids"). Writes screenshots and a JSON report; exits 1 on any FAIL.
// See tools/README.md for what each check asserts.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'module';

const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME_DIR = path.resolve(HERE, '..');

// ---------------------------------------------------------------- args
const FLOWS = ['smoke', 'ui', 'keys', 'bots'];
const USAGE = `Usage: node tools/playtest.mjs [options]

  --flow=LIST         smoke | ui | keys | bots | full (default full = all four); comma-separated
  --viewports=LIST    WxH list (default 360x740,360x640,375x548,1440x900)
  --seed=S            run seed passed as ?seed= (default "playtest")
  --shows=N           shows to play in the ui and keys flows (default 6)
  --out=DIR           screenshot directory (default tools/shots)
  --json=FILE         JSON report path (default <out>/report.json)
  --file=FILE         page under test (default index.html next to tools/)
  --jobs=N            run up to N (flow × viewport) tasks in parallel (default 1; timings get noisier)
  --fonts=MODE        abort: abort every Google Fonts request (default; font loads never stall);
                      stub: answer them with empty CSS / 404; live: let them through
                      (a font failure is never an error)
  --bots-timeout=MS   how long to wait for the ?sim=50 summary (default 120000)
  --task-timeout=MS   hard budget per (flow × viewport) task; overrides the per-flow defaults
                      (smoke 90 s, ui 180 s, keys 180 s, bots 120 s, ?sim=50 bots-timeout + 30 s).
                      A task over budget FAILs with its last step and data-ui, and its page is closed
  --verbose           print every check, not only warnings and failures
  -h, --help          show this help`;

function parseArgs(argv) {
  const o = {
    flows: FLOWS.slice(), viewports: '360x740,360x640,375x548,1440x900', seed: 'playtest', shows: 6,
    out: path.join(HERE, 'shots'), json: null, file: path.join(GAME_DIR, 'index.html'), jobs: 1,
    fonts: 'abort', botsTimeout: 120000, taskTimeout: 0, verbose: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { console.log(USAGE); process.exit(0); }
    const m = /^--([a-z-]+)(?:=(.*))?$/.exec(a);
    if (!m) bad(`unexpected argument: ${a}`);
    const [, k, inline] = m;
    const v = () => {
      if (inline !== undefined) return inline;
      if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) bad(`--${k} needs a value`);
      return argv[++i];
    };
    switch (k) {
      case 'flow': {
        const list = v().split(',').map((s) => s.trim()).filter(Boolean);
        o.flows = list.includes('full') ? FLOWS.slice() : list;
        for (const f of o.flows) if (!FLOWS.includes(f)) bad(`unknown flow "${f}"`);
        break;
      }
      case 'viewports': o.viewports = v(); break;
      case 'seed': o.seed = v(); break;
      case 'shows': o.shows = Math.max(1, parseInt(v(), 10) || 6); break;
      case 'out': o.out = path.resolve(v()); break;
      case 'json': o.json = path.resolve(v()); break;
      case 'file': o.file = path.resolve(v()); break;
      case 'jobs': o.jobs = Math.max(1, parseInt(v(), 10) || 1); break;
      case 'fonts': o.fonts = v(); if (!['abort', 'stub', 'live'].includes(o.fonts)) bad('--fonts must be abort, stub or live'); break;
      case 'bots-timeout': o.botsTimeout = Math.max(1000, parseInt(v(), 10) || 120000); break;
      case 'task-timeout': o.taskTimeout = Math.max(5000, parseInt(v(), 10) || 0); break;
      case 'verbose': o.verbose = true; break;
      default: bad(`unknown option --${k}`);
    }
  }
  o.vps = o.viewports.split(',').map((s) => {
    const mm = /^\s*(\d+)\s*x\s*(\d+)\s*$/i.exec(s);
    if (!mm) bad(`bad viewport "${s}" (use WxH)`);
    return { w: +mm[1], h: +mm[2], name: `${+mm[1]}x${+mm[2]}` };
  });
  o.json = o.json || path.join(o.out, 'report.json');
  return o;
}
function rel(p) { const r = path.relative(process.cwd(), p); return r && !r.startsWith('..') ? r : p; }
function bad(msg) { console.error(`playtest: ${msg}\n\n${USAGE}`); process.exit(2); }

const OPTS = parseArgs(process.argv.slice(2));

// ---------------------------------------------------------------- host skeleton
const HOST_HEAD = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui;background:#fafaf7}img{max-width:100%}[hidden]{display:none!important}</style></head><body>';
const HOST_TAIL = '</body></html>';

// ---------------------------------------------------------------- in-page instrumentation
// Runs before any page script. Everything the harness reads lives on window.__pt.
function pageInit() {
  const pt = (window.__pt = { longtasks: [], uiLog: [], pointerDowns: [], frames: null });
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) pt.longtasks.push({ t: e.startTime, d: e.duration }); })
      .observe({ type: 'longtask', buffered: true });
  } catch (e) { /* no longtask API */ }
  try {
    // Records arrive batched after the script yields, so rebuild each value from the next record's
    // oldValue: a synchronous RESOLVING → RESULT → BUILD still logs all three states.
    new MutationObserver((recs) => {
      const t = performance.now();
      const app = recs.filter((r) => r.target.id === 'app');
      app.forEach((r, k) => pt.uiLog.push({ t, ui: k + 1 < app.length ? app[k + 1].oldValue : r.target.getAttribute('data-ui') }));
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-ui'], attributeOldValue: true });
  } catch (e) { /* ignore */ }
  addEventListener('pointerdown', () => pt.pointerDowns.push(performance.now()), true);

  pt.ui = () => { const a = document.getElementById('app'); return a ? a.getAttribute('data-ui') : null; };
  pt.visible = (el) => {
    if (!el || !el.isConnected) return false;
    if (el.checkVisibility) return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
  };
  pt.desc = (el) => {
    if (!el || el.nodeType !== 1) return String(el);
    const one = (e) => {
      let s = e.tagName.toLowerCase();
      if (e.id) return `${s}#${e.id}`;
      for (const a of ['data-tube', 'data-card', 'data-crate', 'data-act', 'role', 'name', 'type']) {
        if (e.hasAttribute(a) && !(a === 'type' && e.tagName === 'BUTTON')) { s += `[${a}="${e.getAttribute(a)}"]`; break; }
      }
      if (e.classList.length) s += '.' + [...e.classList].slice(0, 2).join('.');
      return s;
    };
    let s = one(el);
    if (!el.id) {
      let p = el.parentElement, hops = 0;
      while (p && !p.id && hops < 6) { p = p.parentElement; hops++; }
      if (p && p.id) s = `#${p.id} ${s}`;
    }
    const label = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 32);
    return label ? `${s} "${label}"` : s;
  };
  // Frame deltas (rAF) plus long tasks between start() and stop().
  pt.startFrames = () => {
    const f = (pt.frames = { d: [], on: true, lt0: pt.longtasks.length, t0: performance.now() });
    let last = null;
    const tick = (t) => { if (!f.on) return; if (last !== null) f.d.push(t - last); last = t; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  pt.stopFrames = () => {
    const f = pt.frames; if (!f) return null;
    f.on = false;
    const t1 = performance.now();
    return { deltas: f.d.slice(), longtasks: pt.longtasks.filter((x) => x.t >= f.t0 - 1 && x.t <= t1), ms: t1 - f.t0 };
  };
  const clippedOrFixed = (el) => {
    for (let e = el; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.position === 'fixed') return true;
      if (e !== el && cs.overflowX !== 'visible') return true;
    }
    return false;
  };
  // Layout audit. scope: CSS selector limiting tap-target / overflow scans (default: whole page).
  pt.audit = (o) => {
    o = o || {};
    const vw = innerWidth, vh = innerHeight;
    const se = document.scrollingElement || document.documentElement;
    const out = { vw, vh, scrollW: se.scrollWidth, clientW: se.clientWidth };
    const x0 = scrollX, y0 = scrollY;
    scrollTo(99999, y0); out.scrollX = scrollX; scrollTo(x0, y0);
    out.hscroll = se.scrollWidth > se.clientWidth + 1 || out.scrollX > 0;
    out.offenders = [];
    if (out.hscroll) {
      for (const el of document.querySelectorAll('body *')) {
        if (!pt.visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1 || (r.right <= vw + 1 && r.left >= -1) || clippedOrFixed(el)) continue;
        out.offenders.push(`${pt.desc(el)} [x ${Math.round(r.left)}..${Math.round(r.right)}]`);
        if (out.offenders.length >= 8) break;
      }
    }
    // Containers that pan sideways (overflow-x auto/scroll with wider content).
    out.hScrollers = [];
    const fireEl = document.getElementById('fire');
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (!(cs.overflowX === 'auto' || cs.overflowX === 'scroll') || el.scrollWidth <= el.clientWidth + 1 || !pt.visible(el)) continue;
      out.hScrollers.push({ sel: pt.desc(el).replace(/ ".*$/, ''), main: el.id === 'app' || (!!fireEl && el.contains(fireEl)), scrollW: el.scrollWidth, clientW: el.clientWidth });
      if (out.hScrollers.length >= 8) break;
    }
    const f = fireEl;
    if (f) {
      const r = f.getBoundingClientRect();
      out.fire = {
        visible: pt.visible(f), top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right),
        w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
        inside: r.top >= -0.5 && r.left >= -0.5 && r.bottom <= vh + 0.5 && r.right <= vw + 0.5, covered: null,
      };
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (cx >= 0 && cy >= 0 && cx < vw && cy < vh) {
        const hit = document.elementFromPoint(cx, cy);
        if (hit && hit !== f && !f.contains(hit)) out.fire.covered = pt.desc(hit);
      }
    }
    const scope = (o.scope && document.querySelector(o.scope)) || document.body;
    out.targets = 0; out.small = [];
    const cand = new Set(scope.querySelectorAll('button, [data-tube], [data-card], [data-crate], [role="button"], a[href], summary'));
    for (const el of cand) {
      if (!pt.visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 && r.height < 1) continue;
      out.targets++;
      if (r.width >= 43.5 && r.height >= 43.5) continue;
      // The hit area may be larger than the box (padding pseudo-element): probe 21.5 px out from the centre.
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const pts = [[cx - 21.5, cy], [cx + 21.5, cy], [cx, cy - 21.5], [cx, cy + 21.5]];
      const hitOk = pts.every(([x, y]) => {
        if (x < 0 || y < 0 || x >= vw || y >= vh) return false;
        const h = document.elementFromPoint(x, y); return !!h && (h === el || el.contains(h));
      });
      if (!hitOk) out.small.push({ sel: pt.desc(el), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 });
    }
    out.overflow = []; out.smallText = [];
    for (const el of scope.querySelectorAll('*')) {
      if (el.closest('svg, canvas, #sim-out, #debug, script, style')) continue;
      if (!pt.visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 2 || r.height <= 2) continue; // visually-hidden (.vh) text
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim());
      const cw = el.clientWidth;
      if (cw && el.scrollWidth > cw + 1) {
        const cs = getComputedStyle(el);
        if (!(cs.overflowX === 'auto' || cs.overflowX === 'scroll')) {
          const kind = cs.textOverflow === 'ellipsis' && cs.overflowX !== 'visible' ? 'ellipsis' : hasText ? 'text' : 'box';
          if (out.overflow.length < 25) out.overflow.push({ sel: pt.desc(el), kind, scrollW: el.scrollWidth, clientW: cw });
        }
      }
      if (hasText) {
        const px = parseFloat(getComputedStyle(el).fontSize);
        if (px < 15.5 && out.smallText.length < 25) out.smallText.push({ sel: pt.desc(el), px });
      }
    }
    // Text the reader cannot see: a text run that sticks out of its nearest clipping ancestor
    // (overflow ≠ visible, no ellipsis, not a sideways scroller) or off the side of the screen.
    out.clipped = [];
    const seenEl = new Set();
    const tw = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n && out.clipped.length < 25; n = tw.nextNode()) {
      const el = n.parentElement;
      if (!n.nodeValue.trim() || !el || seenEl.has(el) || el.closest('svg, canvas, #sim-out, #debug, script, style, [aria-hidden="true"]')) continue;
      if (!pt.visible(el)) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      const tr = range.getBoundingClientRect();
      if (tr.width < 1 || tr.height < 1) continue;
      let clip = null, skip = false;
      for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (cs.textOverflow === 'ellipsis' || cs.overflowX === 'auto' || cs.overflowX === 'scroll') { skip = true; break; }
        if (cs.position === 'fixed' && !clip) break;
        if (cs.overflowX !== 'visible') { clip = a; break; }
      }
      if (skip) continue;
      const vwNow = document.documentElement.clientWidth;
      let why = null;
      if (clip) {
        const cr = clip.getBoundingClientRect();
        if (cr.width <= 2 || cr.height <= 2) continue; // visually-hidden (.vh) text
        if (tr.right > cr.right + 1.5 || tr.left < cr.left - 1.5) why = `cut by ${pt.desc(clip).split(' "')[0]} (${Math.round(Math.max(tr.right - cr.right, cr.left - tr.left))} px)`;
      }
      if (!why && (tr.right > vwNow + 1.5 || tr.left < -1.5)) why = `off-screen (x ${Math.round(tr.left)}..${Math.round(tr.right)} of ${vwNow})`;
      if (why) { seenEl.add(el); out.clipped.push({ sel: pt.desc(el), why }); }
    }
    return out;
  };
  // Focus visibility: compare the focused element's style with an unfocused shallow clone.
  // A normalised "what you can see" signature: outline only counts when drawn, borders only when
  // they have width, and a pseudo-element only when it exists.
  const snap = (e, pseudo) => {
    const cs = getComputedStyle(e, pseudo);
    if (pseudo && (cs.content === 'none' || cs.content === 'normal')) return 'no-pseudo';
    const clear = (c) => c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c);
    const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 && !clear(cs.outlineColor)
      ? `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} ${cs.outlineOffset}` : 'none';
    const border = ['Top', 'Right', 'Bottom', 'Left'].map((k) => (cs[`border${k}Style`] !== 'none' && parseFloat(cs[`border${k}Width`]) > 0 ? `${cs[`border${k}Width`]} ${cs[`border${k}Color`]}` : '0')).join(',');
    return [outline, cs.boxShadow, border, cs.backgroundColor, cs.color, cs.textDecorationLine, cs.opacity, cs.transform, cs.filter]
      .join('|') + (pseudo ? `|${cs.content}|${cs.width}|${cs.height}` : '');
  };
  pt.focusInfo = () => {
    const el = document.activeElement;
    if (!el || el === document.body || el === document.documentElement) return { none: true };
    const r = el.getBoundingClientRect();
    const info = {
      sel: pt.desc(el), id: el.id || null, fv: el.matches(':focus-visible'), shown: pt.visible(el),
      inView: r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth,
      indicator: false,
    };
    try {
      const a = [snap(el), snap(el, '::before'), snap(el, '::after')];
      const c = el.cloneNode(false);
      c.setAttribute('aria-hidden', 'true'); c.removeAttribute('autofocus'); c.tabIndex = -1;
      el.parentNode.insertBefore(c, el.nextSibling);
      const b = [snap(c), snap(c, '::before'), snap(c, '::after')];
      c.remove();
      info.indicator = a.some((x, i) => x !== b[i]);
    } catch (e) {
      const cs = getComputedStyle(el);
      info.indicator = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
    }
    info.visible = info.shown && info.inView && info.indicator;
    return info;
  };
}

// ---------------------------------------------------------------- report plumbing
class Run {
  constructor(flow, vp, variant) {
    Object.assign(this, { flow, viewport: vp.name, variant, checks: [], shots: [], perf: null, notes: {}, ms: 0 });
    this.label = `${flow} ${vp.name}${variant === 'raw' ? ' raw' : ''}`;
    this.step = 'start';    // what the flow is doing now (named in a timeout FAIL)
    this.session = null;    // the open page session, closed by the task guard on timeout
    this.frozen = false;    // set when the task guard gave up: late checks are dropped
  }
  add(status, name, detail) {
    if (this.frozen) return status === 'PASS';
    this.checks.push({ status, name, detail: detail === undefined ? '' : detail });
    return status === 'PASS';
  }
  pass(n, d) { return this.add('PASS', n, d); }
  fail(n, d) { return this.add('FAIL', n, d); }
  warn(n, d) { return this.add('WARN', n, d); }
  info(n, d) { return this.add('INFO', n, d); }
  check(ok, n, d, level = 'FAIL') { return this.add(ok ? 'PASS' : level, n, d); }
  get status() { return this.checks.some((c) => c.status === 'FAIL') ? 'FAIL' : 'PASS'; }
}

// Every await on the page is bounded: Playwright actions by the context default, page.evaluate by
// this wrapper (a hung main thread would otherwise block evaluate forever).
const EVAL_MS = 15000;
function withTimeout(p, ms, msg) {
  let t;
  return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(new Error(msg)), ms); })]).finally(() => clearTimeout(t));
}

// One-line error text that keeps what Playwright knows: the locator and who intercepted the click.
function errMsg(e) {
  const lines = String((e && e.message) || e).replace(/\x1b\[[0-9;]*m/g, '').split('\n').map((x) => x.trim()).filter(Boolean);
  const keep = [lines[0]];
  const loc = lines.find((x) => /waiting for locator|locator\(/.test(x) && x !== lines[0]);
  const why = [...lines].reverse().find((x) => /intercepts pointer events|not visible|not stable|not enabled|outside of the viewport/.test(x));
  if (loc) keep.push(loc.replace(/^-\s*/, ''));
  if (why) keep.push(why.replace(/^-\s*/, ''));
  return keep.join(' · ').slice(0, 400);
}

const isFontUrl = (u) => /^https?:\/\/fonts\.(googleapis|gstatic)\.com\//i.test(u || '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (arr, p) => { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]; };
const round1 = (x) => Math.round(x * 10) / 10;
const short = (x, n = 160) => { const s = typeof x === 'string' ? x : JSON.stringify(x); return s && s.length > n ? s.slice(0, n) + '…' : s; };

// Deterministic PRNG for the harness's own choices (never the game's RNG).
function rng(seedStr) {
  let h = 2166136261;
  for (const ch of String(seedStr)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  let x = h >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}

// ---------------------------------------------------------------- page session
let hostFile = null;
function prepareHost() {
  const html = fs.readFileSync(OPTS.file, 'utf8');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ooh-playtest-'));
  hostFile = path.join(dir, 'host.html');
  fs.writeFileSync(hostFile, HOST_HEAD + html + HOST_TAIL);
  return dir;
}

async function openSession(browser, run, vp, variant, query) {
  const mobile = vp.w < 800;
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, reducedMotion: 'no-preference',
  });
  context.setDefaultTimeout(5000);
  context.setDefaultNavigationTimeout(10000);
  const s = { context, page: null, errors: [], warnings: 0, consoleTexts: [], external: [], fontIssues: 0, t0: 0 };
  run.session = s;
  await context.route('**/*', (route) => {
    const u = route.request().url();
    if (/^(file|data|blob|about):/i.test(u)) return route.continue();
    if (isFontUrl(u)) {
      if (OPTS.fonts === 'abort') return route.abort('failed').catch(() => {});
      if (OPTS.fonts === 'live') return route.continue().catch(() => {});
      if (/fonts\.googleapis\.com/i.test(u)) return route.fulfill({ status: 200, contentType: 'text/css', body: '/* Google Fonts stubbed by playtest (--fonts=stub) */' });
      return route.fulfill({ status: 404, body: '' });
    }
    s.external.push(u);
    return route.abort('blockedbyclient');
  });
  await context.addInitScript(pageInit);
  const page = await context.newPage();
  s.page = page;
  const rawEval = page.evaluate.bind(page);
  page.evaluate = (fn, arg, ms = EVAL_MS) => withTimeout(rawEval(fn, arg), ms,
    `page.evaluate got no answer in ${ms} ms during "${run.step}" (main thread hung or busy; last data-ui ${page.__lastUi})`);
  page.on('crash', () => s.errors.push(`page crashed during "${run.step}"`));
  page.on('pageerror', (e) => s.errors.push(`pageerror: ${e.message}${e.stack ? ' @ ' + String(e.stack).split('\n').slice(1, 2).join('').trim() : ''}`));
  page.on('console', (m) => {
    const type = m.type();
    const text = m.text();
    if (s.consoleTexts.length < 400) s.consoleTexts.push(text);
    if (type === 'error') {
      const loc = (m.location() && m.location().url) || '';
      if (isFontUrl(loc) || /fonts\.(googleapis|gstatic)\.com/i.test(text)) { s.fontIssues++; return; }
      if (/net::ERR_BLOCKED_BY_CLIENT/.test(text)) return; // reported as an external request instead
      s.errors.push(`console.error: ${text}`);
    } else if (type === 'warning') s.warnings++;
  });
  page.on('requestfailed', (r) => { if (isFontUrl(r.url())) s.fontIssues++; });
  const file = variant === 'raw' ? OPTS.file : hostFile;
  s.url = pathToFileURL(file).href + (query ? `?${query}` : '');
  s.t0 = Date.now();
  await page.goto(s.url, { waitUntil: 'commit', timeout: 10000 });
  return s;
}

async function closeSession(s, run) {
  if (s.errors.length) run.fail('no page errors or console errors', s.errors.slice(0, 8).join(' || ') + (s.errors.length > 8 ? ` (+${s.errors.length - 8} more)` : ''));
  else run.pass('no page errors or console errors');
  if (s.external.length) run.fail('no external requests (only Google Fonts)', [...new Set(s.external)].slice(0, 5).join(', '));
  if (s.fontIssues) run.info('font requests failed (ignored)', `${s.fontIssues}`);
  if (s.warnings) run.info('console warnings', `${s.warnings}`);
  await withTimeout(s.context.close(), 8000, 'context.close').catch(() => {});
}

// RESULT is a build state (spec §2.4: no tap; the result card stays up until the first build
// action, and #fire is live), so a show is over at RESULT, BUILD or END.
const READY = ['BUILD', 'RESULT'];
const isReady = (u) => READY.includes(u);
const ui = async (page) => { const u = await page.evaluate(() => window.__pt && window.__pt.ui(), undefined, 5000); page.__lastUi = u; return u; };
async function waitUi(page, states, timeout) {
  const want = Array.isArray(states) ? states : [states];
  try {
    await page.waitForFunction((w) => w.includes(window.__pt && window.__pt.ui()), want, { timeout, polling: 25 });
    return await ui(page);
  } catch (e) {
    if (/Target (page, context or browser )?closed|has been closed/i.test(String(e && e.message))) throw e;
    return null;
  }
}
// Wait until data-ui has left BUILD/RESULT since uiLog index log0; returns the current data-ui
// (so an instant resolution that already went RESOLVING → RESULT → BUILD is not missed).
async function waitLeft(page, log0, timeout) {
  try {
    await page.waitForFunction((i) => {
      const pt = window.__pt; const u = pt.ui();
      return u === 'RESOLVING' || u === 'END' || pt.uiLog.slice(i).some((x) => x.ui === 'RESOLVING' || x.ui === 'RESULT' || x.ui === 'END');
    }, log0, { timeout, polling: 20 });
    return await ui(page);
  } catch (e) {
    if (/Target (page, context or browser )?closed|has been closed/i.test(String(e && e.message))) throw e;
    return null;
  }
}
async function state(page) { return page.evaluate(() => (window.__game && window.__game.state ? window.__game.state() : null)); }

async function shot(s, run, label) {
  const name = `${run.flow}-${run.viewport}-${run.variant}-${label}.png`.replace(/[^\w.-]+/g, '_');
  const p = path.join(OPTS.out, name);
  try { await s.page.screenshot({ path: p, timeout: 8000 }); run.shots.push(rel(p)); } catch (e) { run.warn(`screenshot ${label}`, String(e.message).split('\n')[0]); }
}

// Dismiss the "Tap to continue" overlay (shown after blur / tab hidden) if it is up.
async function dismissTapContinue(s, run, how = 'click') {
  const up = await s.page.evaluate(() => { const el = document.getElementById('tap-continue'); return !!(el && window.__pt.visible(el)); });
  if (!up) return false;
  run.notes.tapContinue = (run.notes.tapContinue || 0) + 1;
  if (how === 'key') await s.page.keyboard.press('Enter');
  else {
    const btn = s.page.locator('#tap-continue button').first();
    if (await btn.count()) await btn.click({ timeout: 2000 }).catch(() => {});
    else await s.page.locator('#tap-continue').click({ timeout: 2000 }).catch(() => {});
  }
  await sleep(150);
  return true;
}

// Boot: data-ui must reach BUILD within 3 s of navigation; __game must exist.
async function boot(s, run, { needHooks = true } = {}) {
  const left = Math.max(100, 3000 - (Date.now() - s.t0));
  const got = await waitUi(s.page, ['BUILD'], left);
  const tIn = await s.page.evaluate(() => { const e = window.__pt && window.__pt.uiLog.find((x) => x.ui === 'BUILD'); return e ? Math.round(e.t) : null; });
  const current = got || (await ui(s.page));
  if (!run.check(got === 'BUILD', '#app[data-ui] reaches BUILD within 3 s', got ? `${tIn ?? Date.now() - s.t0} ms after navigation` : `data-ui is ${JSON.stringify(current)} after 3 s`)) {
    await shot(s, run, 'boot-timeout');
    return false;
  }
  const hooks = await s.page.evaluate(() => {
    const g = window.__game; if (!g) return null;
    const want = ['reset', 'act', 'step', 'state', 'legalActions', 'events', 'hash', 'setPaused', 'config', 'resolve', 'preview', 'mood', 'shapley', 'skipAnimations', 'runBots', 'meta', 'setMeta'];
    return { missing: want.filter((k) => !(k in g)) };
  });
  if (!hooks) { run.fail('window.__game present'); return !needHooks; }
  run.pass('window.__game present');
  if (hooks.missing.length) {
    const core = hooks.missing.filter((k) => ['act', 'state', 'legalActions'].includes(k));
    run.add(core.length ? 'FAIL' : 'WARN', '__game exposes every §11.6 hook', `missing: ${hooks.missing.join(', ')}`);
    if (core.length && needHooks) return false;
  } else run.pass('__game exposes every §11.6 hook');
  return true;
}

// Layout checks. fireStrict: #fire placement is a FAIL (BUILD) or only a WARN (other states).
async function layout(s, run, label, { fireStrict = false, scope = null } = {}) {
  const a = await s.page.evaluate((o) => window.__pt.audit(o), { scope });
  const tag = (n) => `${n} @${label}`;
  if (a.vw !== s.page.viewportSize().width) run.fail(tag('layout viewport keeps the device width'), `innerWidth ${a.vw} ≠ ${s.page.viewportSize().width}: content wider than the screen`);
  const mainPan = a.hScrollers.filter((x) => x.main);
  const otherPan = a.hScrollers.filter((x) => !x.main);
  const hs = [];
  if (a.hscroll) hs.push(`page scrollWidth ${a.scrollW} > ${a.clientW}; ${a.offenders.join('; ') || 'offender not found'}`);
  for (const x of mainPan) hs.push(`the play column ${x.sel} pans sideways (${x.scrollW} > ${x.clientW})`);
  run.check(!hs.length, tag('no horizontal page scroll'), hs.join('; '));
  if (otherPan.length) run.warn(tag('no sideways-scrolling containers'), otherPan.map((x) => `${x.sel} (${x.scrollW} > ${x.clientW})`).join('; '));
  if (!scope) {
    if (!a.fire) run.add(fireStrict ? 'FAIL' : 'WARN', tag('#fire present'), 'no #fire element');
    else {
      const f = a.fire;
      const problems = [];
      if (!f.visible) problems.push('not visible');
      if (!f.inside) problems.push(`not fully inside the ${a.vw}×${a.vh} viewport (x ${f.left}..${f.right}, y ${f.top}..${f.bottom})`);
      if (f.h < 44) problems.push(`${f.h} px tall (< 44)`);
      if (f.covered) problems.push(`covered by ${f.covered}`);
      run.add(problems.length ? (fireStrict ? 'FAIL' : 'WARN') : 'PASS', tag('#fire fully inside the viewport, ≥ 44 px tall, uncovered'), problems.join('; ') || `${f.w}×${f.h} at y ${f.top}..${f.bottom}`);
    }
  }
  run.check(!a.small.length, tag('tap targets ≥ 44×44 CSS px'),
    a.small.length ? `${a.small.length} of ${a.targets}: ` + a.small.slice(0, 10).map((x) => `${x.sel} ${x.w}×${x.h}`).join('; ') + (a.small.length > 10 ? ' …' : '') : `${a.targets} targets`);
  // Text overflow: text cut off or off-screen is a WARN; a text box whose own text is wider than it
  // (spilling visibly) is a WARN; boxes that overflow only through decoration/children are INFO.
  const over = a.overflow.filter((x) => x.kind === 'text');
  const boxes = a.overflow.filter((x) => x.kind === 'box');
  const ell = a.overflow.filter((x) => x.kind === 'ellipsis');
  const txt = [...a.clipped.map((x) => `${x.sel}: ${x.why}`), ...over.map((x) => `${x.sel} spills (${x.scrollW} > ${x.clientW})`)];
  run.check(!txt.length, tag('no text overflow (no clipped, spilled or off-screen text)'), txt.slice(0, 8).join('; ') + (txt.length > 8 ? ` (+${txt.length - 8} more)` : ''), 'WARN');
  if (boxes.length) run.info(tag('boxes wider than their content box (decoration)'), boxes.slice(0, 5).map((x) => `${x.sel.split(' "')[0]} ${x.scrollW}>${x.clientW}`).join('; '));
  if (ell.length) run.info(tag('text truncated with ellipsis'), ell.slice(0, 6).map((x) => x.sel).join('; '));
  run.check(!a.smallText.length, tag('text ≥ 16 px (spec §8.1)'), a.smallText.slice(0, 8).map((x) => `${x.sel} ${x.px}px`).join('; '), 'WARN');
  return a;
}

function perfSummary(run, fr, label) {
  if (!fr) return;
  const d = fr.deltas;
  const lt = fr.longtasks || [];
  const p = { frames: d.length, p50: round1(pct(d, 50)), p95: round1(pct(d, 95)), max: round1(d.length ? Math.max(...d) : 0), longTasks: lt.length, longestTask: round1(lt.length ? Math.max(...lt.map((x) => x.d)) : 0), ms: Math.round(fr.ms) };
  run.perf = Object.assign(run.perf || {}, { [label]: p });
  // Frame timing means little on a saturated machine: note the load, and only WARN when it is sane.
  const load = os.loadavg()[0] / Math.max(1, os.cpus().length);
  p.load = round1(load);
  const txt = `${p.frames} frames over ${p.ms} ms: p50 ${p.p50} ms, p95 ${p.p95} ms, max ${p.max} ms; long tasks ${p.longTasks} (longest ${p.longestTask} ms); load ${p.load}/CPU`;
  if (p.frames < 3 || load > 1.5) run.info(`frame timing (${label})${load > 1.5 ? ' [machine busy: not judged]' : ''}`, txt);
  else run.check(p.p95 <= 34 && p.longestTask <= 100, `frame timing (${label}): p95 ≤ 34 ms, no long task > 100 ms`, txt, 'WARN');
}

// Click #fire (a real pointer click) and follow the show through RESOLVING → RESULT (or END).
// `end` is RESULT, BUILD or END when the show finished, null when it did not (see `stuck`).
async function playShow(s, run, { label = null, shots = false, measure = false, during = null, timeout = 30000 } = {}) {
  const page = s.page;
  const before = await state(page);
  const hist0 = before && before.runStats && before.runStats.history ? before.runStats.history.length : null;
  const log0 = await page.evaluate(() => window.__pt.uiLog.length);
  if (measure) await page.evaluate(() => window.__pt.startFrames());
  run.step = `click #fire (show ${before ? before.show + 1 : '?'})`;
  try {
    await page.locator('#fire').click({ timeout: 5000 });
  } catch (e) {
    // Say why the button could not be clicked: disabled, covered, off-screen, or an overlay up.
    const f = await page.evaluate(() => {
      const el = document.getElementById('fire'), a = window.__pt.audit({ scope: '#fire' });
      const ov = [...document.querySelectorAll('[role="dialog"], [aria-modal="true"], #tap-continue')].filter((x) => window.__pt.visible(x)).map((x) => window.__pt.desc(x).split(' "')[0]);
      return { fire: a.fire, disabled: !!(el && el.disabled), ui: window.__pt.ui(), ov };
    }).catch(() => null);
    const d = f ? `; #fire ${f.disabled ? 'disabled' : 'enabled'}, ${f.fire ? `covered by ${f.fire.covered || 'nothing'}, ${f.fire.inside ? 'inside' : 'outside'} the viewport` : 'missing'}; data-ui ${f.ui}; overlays up: ${f.ov.join(', ') || 'none'}` : '';
    throw new Error(`#fire could not be clicked (${errMsg(e)})${d}`);
  }
  const r = await waitLeft(page, log0, 2000);
  if (!r) {
    if (measure) await page.evaluate(() => window.__pt.stopFrames());
    const u = await ui(page);
    return { before, after: before, end: null, stuck: `${u} (clicking #fire did not start the show within 2 s)`, log: [], sawResolving: false, sawResult: false, advanced: false };
  }
  run.step = `show ${before ? before.show + 1 : '?'} resolving`;
  let sawResolving = r === 'RESOLVING';
  if (sawResolving && shots) {
    // Mid-resolution: wait up to 600 ms into the chain, then shoot if still resolving.
    const t = Date.now();
    while (Date.now() - t < 600 && (await ui(page)) === 'RESOLVING') await sleep(50);
    if ((await ui(page)) === 'RESOLVING') await shot(s, run, 'RESOLVING');
    else run.warn('mid-RESOLVING screenshot', 'the resolution ended within 600 ms');
  }
  if (sawResolving && during) await during();
  const end = await waitUi(page, ['RESULT', 'BUILD', 'END'], timeout);
  if (measure) perfSummary(run, await page.evaluate(() => window.__pt.stopFrames()), label || 'resolution');
  if (end === 'RESULT' && shots) await shot(s, run, 'RESULT');
  const log = await page.evaluate((i) => window.__pt.uiLog.slice(i).map((x) => x.ui), log0);
  sawResolving = sawResolving || log.includes('RESOLVING');
  const after = await state(page);
  const hist1 = after && after.runStats && after.runStats.history ? after.runStats.history.length : null;
  const stuck = end ? null : `${await ui(page)} ${Math.round(timeout / 1000)} s after lighting (ui log: ${log.join(' → ') || 'none'})`;
  return { before, after, end, stuck, log, sawResolving, sawResult: log.includes('RESULT') || end === 'RESULT', advanced: hist0 !== null && hist1 === hist0 + 1 };
}

// ---------------------------------------------------------------- flow: smoke
async function flowSmoke(browser, vp, variant, run = new Run('smoke', vp, variant)) {
  run.step = 'open';
  const s = await openSession(browser, run, vp, variant, `seed=${encodeURIComponent(OPTS.seed)}`);
  try {
    run.step = 'boot';
    if (!(await boot(s, run, { needHooks: false }))) return run;
    run.step = 'BUILD layout';
    await dismissTapContinue(s, run);
    await sleep(250);
    await layout(s, run, 'BUILD', { fireStrict: true });
    await shot(s, run, 'BUILD');
    // Put a few shells in the rack (through the hook) so the resolution has bursts to pace.
    const bought = await s.page.evaluate(() => {
      const g = window.__game; if (!g || !g.legalActions || !g.act) return 0;
      let n = 0;
      for (let k = 0; k < 3; k++) {
        const st = g.state();
        const la = g.legalActions().filter((a) => a.type === 'buy' && a.to && a.to.zone === 'tube');
        if (!la.length) break;
        la.sort((a, b) => st.shop.cards[b.card].cost - st.shop.cards[a.card].cost);
        const ev = g.act(la[0]);
        if (!ev || (ev[0] && ev[0].type === 'illegal')) break;
        n++;
      }
      return n;
    });
    run.info('shells bought via __game.act before lighting', `${bought}`);
    await sleep(100);
    const show = await playShow(s, run, { shots: true, measure: true, label: 'first show' });
    run.check(show.sawResolving, 'Light the fuse enters RESOLVING', `ui log: ${show.log.join(' → ')}`);
    run.check(show.sawResult || show.end === 'END', 'the show reaches RESULT', `ui log: ${show.log.join(' → ')}`, 'WARN');
    if (!run.check(!!show.end, 'the show ends in RESULT, BUILD or END', show.end ? `ended in ${show.end}` : `stuck in ${show.stuck}`)) {
      await shot(s, run, 'stuck');
      return run;
    }
    run.check(show.advanced, 'the show is recorded (runStats.history grows by 1)', show.advanced ? '' : `history ${show.before && show.before.runStats ? show.before.runStats.history.length : '?'} → ${show.after && show.after.runStats ? show.after.runStats.history.length : '?'}`);
    if (isReady(show.end)) {
      run.step = 'RESULT layout';
      await sleep(800); // the shop slides up ≥ 600 ms after the slam (spec §2.4)
      await layout(s, run, `${show.end} after a show`, { fireStrict: true });
      await shot(s, run, `${show.end}-settled`);
      if (show.end === 'RESULT') {
        // The result card stays until the first build action (spec §2.4): one act → BUILD.
        const acted = await s.page.evaluate(() => {
          const g = window.__game; const a = g.legalActions().find((x) => x.type !== 'light' && x.type !== 'match');
          if (!a) return null; g.act(a); return a.type;
        });
        if (acted) {
          const b = await waitUi(s.page, ['BUILD'], 1000);
          run.check(b === 'BUILD', 'the first build action dismisses RESULT → BUILD', `after ${acted}: data-ui ${b || (await ui(s.page))}`);
        }
      }
    }
    // Race to the end: animations off, keep lighting with an empty-handed policy.
    run.step = 'race to END';
    await s.page.evaluate(() => window.__game && window.__game.skipAnimations && window.__game.skipAnimations(true));
    let shows = 1, stuck = false;
    for (let i = 0; i < 40 && (await ui(s.page)) !== 'END'; i++) {
      await dismissTapContinue(s, run);
      const u = await ui(s.page);
      if (!isReady(u)) { await waitUi(s.page, ['BUILD', 'RESULT', 'END'], 10000); continue; }
      const r = await playShow(s, run, { timeout: 15000 });
      if (!r.end) { run.fail('reach END by lighting every show', `show ${shows + 1} stuck in ${r.stuck}`); stuck = true; break; }
      shows++;
    }
    run.step = 'END';
    const u = await ui(s.page);
    if (!stuck && run.check(u === 'END', 'reach END by lighting every show', `after ${shows} shows (data-ui ${u})`)) {
      await sleep(500);
      const endInfo = await s.page.evaluate(() => {
        const e = document.getElementById('end');
        return { visible: !!e && window.__pt.visible(e), text: e ? e.textContent.trim().length : 0, focus: document.activeElement && document.activeElement.id };
      });
      run.check(endInfo.visible && endInfo.text > 0, '#end is visible with content', `visible ${endInfo.visible}, ${endInfo.text} chars`);
      run.check(endInfo.focus === 'run-it-back', 'focus on #run-it-back at END', `focused: ${endInfo.focus || 'body'}`, 'WARN');
      await layout(s, run, 'END', { scope: '#end' });
      await shot(s, run, 'END');
    }
  } catch (e) {
    run.fail('smoke flow ran to completion', `during "${run.step}": ${errMsg(e)}`);
    await shot(s, run, 'error');
  } finally {
    await closeSession(s, run);
  }
  return run;
}

// ---------------------------------------------------------------- flow: ui (pointer only)
async function flowUi(browser, vp, run = new Run('ui', vp, 'host')) {
  run.step = 'open';
  const R = rng(`${OPTS.seed}|ui|${vp.name}`);
  const s = await openSession(browser, run, vp, 'host', `seed=${encodeURIComponent(OPTS.seed)}`);
  const page = s.page;
  const stats = { shows: 0, buys: 0, buyFails: 0, rerolls: 0, undos: 0, matches: 0, sponsors: 0, skips: 0, fastForwards: 0, ends: 0 };
  const failOnce = new Set();
  const failFirst = (key, name, detail) => { if (failOnce.has(key)) return; failOnce.add(key); run.fail(name, detail); };
  // Click the visible match (layouts keep a hidden twin of some controls, e.g. a desktop copy).
  const clickSel = async (sel) => { await page.locator(`${sel}:visible`).first().click({ timeout: 3000 }); await sleep(60); };
  const waitState = async (pred, arg, ms = 1500) => {
    try { await page.waitForFunction(pred, arg, { timeout: ms, polling: 30 }); return true; } catch { return false; }
  };
  try {
    run.step = 'boot';
    if (!(await boot(s, run))) return run;
    for (let show = 0; show < OPTS.shows; show++) {
      run.step = `show ${show + 1} build (pointer)`;
      await dismissTapContinue(s, run);
      if (!isReady(await waitUi(page, ['BUILD', 'RESULT', 'END'], 5000))) break;
      // 1. Buy by tapping a card, then a tube (up to 3 per show).
      for (let k = 0; k < 3; k++) {
        const { st, la } = await page.evaluate(() => ({ st: window.__game.state(), la: window.__game.legalActions() }));
        const c = la.filter((a) => (a.type === 'buy' || a.type === 'upgrade') && a.to && a.to.zone === 'tube');
        if (!c.length) break;
        c.sort((a, b) => (a.type === 'upgrade' ? -1 : 0) - (b.type === 'upgrade' ? -1 : 0) || st.shop.cards[b.card].cost - st.shop.cards[a.card].cost || a.to.i - b.to.i);
        const act = c[Math.floor(R() * Math.min(2, c.length))];
        const card = st.shop.cards[act.card];
        const prev = st.tubes[act.to.i].shell;
        try {
          await clickSel(`[data-card="${act.card}"]`);
          await clickSel(`[data-tube="${act.to.i}"]`);
        } catch (e) {
          stats.buyFails++;
          failFirst('buyclick', 'tap card → tap tube is clickable', `${act.type} card ${act.card} → tube ${act.to.i}: ${String(e.message).split('\n')[0]}`);
          break;
        }
        const ok = await waitState(({ coins, i, id, star }) => {
          const t = window.__game.state(); const sh = t.tubes[i] && t.tubes[i].shell;
          return t.coins < coins && sh && sh.id === id && sh.star === star;
        }, { coins: st.coins, i: act.to.i, id: card.id, star: act.type === 'upgrade' ? prev.star + 1 : 1 });
        if (ok) stats.buys++;
        else { stats.buyFails++; failFirst('buy', 'tap card → tap tube buys into that tube (coins and tube change)', `${act.type} of ${card.id} ($${card.cost}) into tube ${act.to.i} did not show up in __game.state()`); break; }
        // Sometimes undo the purchase and check the state rolls back.
        if ((stats.undos === 0 || R() < 0.25) && (await page.locator('[data-act="undo"]:not([disabled]):visible').count())) {
          await clickSel('[data-act="undo"]');
          const back = await waitState(({ coins, i, uid }) => {
            const t = window.__game.state(); const sh = t.tubes[i].shell;
            return t.coins === coins && (uid === null ? !sh : !!sh && sh.uid === uid);
          }, { coins: st.coins, i: act.to.i, uid: prev ? prev.uid : null });
          if (back) stats.undos++; else failFirst('undo', 'Undo restores coins and the tube', `after ${act.type} into tube ${act.to.i}`);
        }
      }
      // 2. Reroll (always the first time it is possible, then sometimes).
      if (stats.rerolls === 0 || R() < 0.3) {
        const st = await state(page);
        const can = (await page.evaluate(() => window.__game.legalActions().some((a) => a.type === 'reroll'))) && (await page.locator('[data-act="reroll"]:not([disabled]):visible').count());
        if (can) {
          await clickSel('[data-act="reroll"]');
          const ok = await waitState(({ coins, rr }) => { const t = window.__game.state(); return t.coins < coins || (t.shop && t.shop.rerolls > rr); }, { coins: st.coins, rr: st.shop ? st.shop.rerolls : 0 });
          if (ok) stats.rerolls++; else failFirst('reroll', 'Reroll spends coins and rerolls the shop', '');
        }
      }
      // 3. Match when tonight's rule permutes the fuse.
      if (await page.evaluate(() => window.__game.legalActions().some((a) => a.type === 'match'))) {
        if ((await page.locator('[data-act="match"]:not([disabled]):visible').count()) && R() < 0.7) {
          const st = await state(page);
          await clickSel('[data-act="match"]');
          const order = (t) => t.tubes.map((x) => (x.shell ? x.shell.uid : 0)).join(',');
          const ok = await waitState((o) => window.__game.state().tubes.map((x) => (x.shell ? x.shell.uid : 0)).join(',') !== o, order(st));
          if (ok) stats.matches++; else run.warn('Match re-seats the tubes', `show ${st.show + 1}: tube order unchanged (may be a fixed point)`);
        } else if (!(await page.locator('[data-act="match"]:not([disabled]):visible').count())) {
          failFirst('matchbtn', 'Match button is enabled when match is legal', '');
        }
      }
      // 4. Sometimes toggle the Sponsor on and off again.
      if ((stats.sponsors === 0 || R() < 0.3) && (await page.locator('[data-act="sponsor"]:visible').count())) {
        const acc0 = await page.evaluate(() => { const sp = window.__game.state().sponsor; return sp ? !!sp.accepted : null; });
        if (acc0 !== null) {
          await clickSel('[data-act="sponsor"]');
          const ok = await waitState((a) => { const sp = window.__game.state().sponsor; return !!sp && !!sp.accepted !== a; }, acc0);
          if (ok) { stats.sponsors++; await clickSel('[data-act="sponsor"]'); await waitState((a) => !!window.__game.state().sponsor.accepted === a, acc0); }
          else failFirst('sponsor', 'the Sponsor toggle flips sponsor.accepted', '');
        }
      }
      // 5. Light the fuse; sometimes tap the sky (fast-forward ×4) or press Skip.
      const mode = R();
      const r = await playShow(s, run, {
        during: async () => {
          await sleep(150);
          if ((await ui(page)) !== 'RESOLVING') return;
          if (mode < 0.33) { await page.locator('#sky').click({ timeout: 2000, force: true }).catch(() => {}); stats.fastForwards++; }
          else if (mode < 0.55) { await page.locator('#fire').click({ timeout: 2000 }).catch(() => {}); stats.skips++; }
        },
      });
      if (!r.end) { run.fail('each show ends in RESULT, BUILD or END', `show ${show + 1} stuck in ${r.stuck}`); await shot(s, run, 'stuck'); break; }
      if (!r.sawResolving) failFirst('resolving', 'clicking #fire enters RESOLVING', `ui log: ${r.log.join(' → ')}`);
      const b = r.before, a = r.after;
      const changed = a && b && (a.show !== b.show || a.phase !== b.phase || a.coins !== b.coins);
      if (!r.advanced || !changed) failFirst('advance', 'lighting records the show and pays out (__game.state)', `history +${a && b ? a.runStats.history.length - b.runStats.history.length : '?'}, show ${b && b.show}→${a && a.show}, coins ${b && b.coins}→${a && a.coins}, phase ${a && a.phase}`);
      stats.shows++;
      if (show === 0 && r.end === 'RESULT') { await sleep(800); await layout(s, run, 'RESULT (pointer)', { fireStrict: true }); await shot(s, run, 'RESULT'); }
      if (r.end === 'END') {
        // The run is over before --shows: check END, then restart with a real click and play on.
        run.step = 'END → Run it back (pointer)';
        await sleep(500);
        stats.ends++;
        if (stats.ends === 1) { await layout(s, run, 'END (pointer)', { scope: '#end' }); await shot(s, run, 'END'); }
        if (show + 1 >= OPTS.shows) break;
        try { await page.locator('#run-it-back').click({ timeout: 3000 }); } catch (e) { run.fail('Run it back is clickable at END', String(e.message).split('\n')[0]); break; }
        if (!run.check((await waitUi(page, ['BUILD'], 3000)) === 'BUILD', 'Run it back (pointer) returns to BUILD', '')) break;
        await sleep(300);
        continue;
      }
      const f = await page.evaluate(() => window.__pt.audit().fire);
      if (f && (!f.inside || f.h < 44)) failFirst('fire', '#fire stays inside the viewport in BUILD', `after show ${show + 1}: y ${f.top}..${f.bottom}, h ${f.h}`);
    }
    run.check(stats.shows > 0, `played shows through pointer clicks`, `${stats.shows} shows · ${stats.buys} buys · ${stats.undos} undos · ${stats.rerolls} rerolls · ${stats.matches} matches · ${stats.sponsors} sponsor toggles · ${stats.fastForwards} sky taps · ${stats.skips} skips · ${stats.ends} run ends`);
    if (!failOnce.has('undo')) run.check(stats.undos > 0, 'Undo (pointer) restores coins and the tube', `${stats.undos} undos verified`, 'WARN');
    if (!failOnce.has('reroll')) run.check(stats.rerolls > 0, 'Reroll (pointer) spends coins and rerolls the shop', `${stats.rerolls} rerolls verified`, 'WARN');
    if (!failOnce.has('matchbtn')) run.info('Match (pointer)', stats.matches ? `${stats.matches} matches verified` : 'match was never legal in these shows');
    if (!failOnce.has('buy') && !failOnce.has('buyclick')) run.check(stats.buys > 0, 'tap card → tap tube buys into that tube (coins and tube change)', `${stats.buys} buys verified`, 'WARN');
    if (!failOnce.has('advance')) run.check(stats.shows > 0, 'lighting records the show and pays out (__game.state)', `${stats.shows} shows verified`);
    run.notes.stats = stats;
    run.step = 'final layout';
    const u = await ui(page);
    if (isReady(u)) { await sleep(700); await layout(s, run, `${u} after ${stats.shows} shows`, { fireStrict: true }); await shot(s, run, `${u}-late`); }
    if (u === 'END') {
      await sleep(400);
      run.check(await page.evaluate(() => window.__pt.visible(document.getElementById('end'))), '#end renders when the run ends', '');
      await shot(s, run, 'END');
    }
  } catch (e) {
    run.fail('ui flow ran to completion', `during "${run.step}": ${errMsg(e)}`);
    await shot(s, run, 'error');
  } finally {
    await closeSession(s, run);
  }
  return run;
}

// ---------------------------------------------------------------- flow: keys (keyboard only)
async function flowKeys(browser, vp, run = new Run('keys', vp, 'host')) {
  run.step = 'open';
  const R = rng(`${OPTS.seed}|keys|${vp.name}`);
  const s = await openSession(browser, run, vp, 'host', `seed=${encodeURIComponent(OPTS.seed)}`);
  const page = s.page;
  const bad = new Map(); // selector -> reason (focus not visible)
  let presses = 0, lostFocus = 0, lostAfter = new Set(), tabBlurs = 0;
  const focusInfo = () => page.evaluate(() => window.__pt.focusInfo());
  const press = async (key) => {
    await page.keyboard.press(key); presses++;
    await sleep(35);
    let fi = await focusInfo();
    if (key === 'Tab' || key === 'Shift+Tab') {
      // Tabbing off the last stop hands focus to the browser: the window blurs and the game pauses
      // behind "Tap to continue" (spec §14 Lifecycle). Resume with Enter, as a keyboard user would.
      const tc = await page.evaluate(() => { const e = document.getElementById('tap-continue'); return !!(e && window.__pt.visible(e)); });
      if (tc) {
        tabBlurs++;
        await page.bringToFront().catch(() => {});
        await page.keyboard.press('Enter');
        await sleep(150);
        fi = await focusInfo();
        return Object.assign(fi, { blurred: true });
      }
    }
    const u = await ui(page);
    // Tabbing off the last stop parks focus on the document before it wraps: that is the browser, not the game.
    if (fi.none) { if (isReady(u) && key !== 'Tab' && key !== 'Shift+Tab') { lostFocus++; lostAfter.add(key); } return fi; }
    if (!fi.visible && !bad.has(fi.sel)) {
      // Rows slide and fade in after a show: judge the focus once any transition has settled.
      await sleep(450);
      const again = await focusInfo();
      if (again.sel === fi.sel && !again.visible) bad.set(fi.sel, `${!again.shown ? 'element hidden' : !again.inView ? 'off-screen' : 'no focus indicator'} (after ${key}, data-ui ${u})`);
    }
    return fi;
  };
  const matches = (sel) => page.evaluate((q) => { const a = document.activeElement; return !!(a && a.matches && a.matches(q)); }, sel);
  const focusByKeys = async (sel) => {
    if (await matches(sel)) return true;
    const dir = await page.evaluate((q) => {
      const a = document.activeElement, t = document.querySelector(q);
      if (!a || !t || a === document.body) return null;
      const row = (e) => e.closest('#rack, #tools, #shop, #workshop');
      const ra = row(a), rt = row(t);
      const group = (r) => (r && (r.id === 'rack' || r.id === 'tools') ? 'rack' : r && r.id);
      if (!ra || !rt || group(ra) !== group(rt)) return null;
      return a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING ? 'ArrowRight' : 'ArrowLeft';
    }, sel);
    if (dir) for (let i = 0; i < 8; i++) { await press(dir); if (await matches(sel)) return true; }
    for (const k of ['Tab', 'Shift+Tab']) for (let i = 0; i < 45; i++) { await press(k); if (await matches(sel)) return true; }
    return false;
  };
  const visibleOverlay = (id) => page.evaluate((i) => { const e = document.getElementById(i); return !!(e && window.__pt.visible(e)); }, id);
  const focusInside = (id) => page.evaluate((i) => { const e = document.getElementById(i); return !!(e && e.contains(document.activeElement)); }, id);
  try {
    run.step = 'boot';
    if (!(await boot(s, run))) return run;
    await dismissTapContinue(s, run, 'key');
    await sleep(200);
    // No shop before show 1 (spec §2.3): light show 1 with F so the walk sees the cards.
    if (!(await state(page)).shop) {
      run.step = 'show 1 (F) before the tab walk';
      await press('f');
      const e = await waitUi(page, ['RESULT', 'BUILD', 'END'], 30000);
      run.info('lit show 1 with F before the tab walk (no shop before show 1)', `data-ui ${e}`);
      await sleep(900);
    }
    run.step = 'tab walk';

    // 1. Tab walk: every stop shows a focus indicator; #fire, tubes and cards are reachable.
    const seen = [];
    let first = null;
    for (let i = 0; i < 80; i++) {
      const fi = await press('Tab');
      if (fi.none || fi.blurred) continue;
      if (first === null) first = fi.sel; else if (fi.sel === first) break;
      seen.push(fi.sel);
    }
    const has = (re) => seen.some((x) => re.test(x));
    run.check(has(/#fire\b/), 'Tab reaches #fire', `${seen.length} tab stops`);
    run.check(has(/\[data-tube=/), 'Tab reaches the rack tubes', '');
    run.check(has(/\[data-card=/), 'Tab reaches the shop cards', '');
    {
      const idx = (re) => seen.findIndex((x) => re.test(x));
      const order = [['HUD', /#hud|data-act="pause"/], ['tubes', /\[data-tube=/], ['crate', /\[data-crate=/], ['cards', /\[data-card=/], ['fire', /#fire\b/]]
        .map(([n, re]) => [n, idx(re)]).filter(([, i]) => i >= 0);
      const sorted = order.every(([, i], k) => k === 0 || i > order[k - 1][1]);
      run.check(sorted, 'Tab order follows §13 (HUD → tubes → Crate → cards → Light)', order.map(([n, i]) => `${n}@${i}`).join(' '), 'WARN');
    }
    run.notes.tabStops = seen;
    await dismissTapContinue(s, run, 'key');

    // 2. Overlays by key: P, L, ? open; focus moves inside and is trapped; Esc closes and restores focus.
    const overlayCheck = async (key, id, name) => {
      if (!isReady(await ui(page))) return;
      run.step = `overlay ${name}`;
      const before = await focusInfo();
      await press(key);
      await sleep(150);
      if (!run.check(await visibleOverlay(id), `${name} opens #${id}`, '')) return;
      await shot(s, run, `overlay-${id}`);
      run.check(await focusInside(id), `${name}: focus moves into #${id}`, (await focusInfo()).sel || 'body');
      let escaped = null;
      for (let i = 0; i < 6; i++) { await press('Tab'); if (!(await focusInside(id))) { escaped = (await focusInfo()).sel || 'body'; break; } }
      run.check(!escaped, `${name}: Tab stays inside #${id} (focus trap)`, escaped ? `escaped to ${escaped}` : '');
      await press('Escape');
      await sleep(150);
      run.check(!(await visibleOverlay(id)), `Esc closes #${id}`, '');
      const after = await focusInfo();
      if (!before.none) run.check(after.sel === before.sel, `closing #${id} restores focus`, `before ${before.sel}, after ${after.sel || 'body'}`, 'WARN');
    };
    await focusByKeys('#fire');
    await overlayCheck('p', 'pause-menu', 'P');
    await overlayCheck('l', 'logbook', 'L');
    await overlayCheck('?', 'help', '?');
    await overlayCheck('Escape', 'pause-menu', 'Esc (no overlay)');

    // 3. Keyboard-only play.
    const stats = { shows: 0, buys: 0, buyFails: 0, rerolls: 0, undos: 0, spaces: 0 };
    const failOnce = new Set();
    const failFirst = (key, name, detail) => { if (failOnce.has(key)) return; failOnce.add(key); run.fail(name, detail); };
    const waitState = async (pred, arg, ms = 1500) => { try { await page.waitForFunction(pred, arg, { timeout: ms, polling: 30 }); return true; } catch { return false; } };
    for (let show = 0; show < OPTS.shows; show++) {
      run.step = `show ${show + 1} build (keys)`;
      await dismissTapContinue(s, run, 'key');
      if (!isReady(await waitUi(page, ['BUILD', 'RESULT', 'END'], 5000))) break;
      for (let k = 0; k < 2; k++) {
        const { st, la } = await page.evaluate(() => ({ st: window.__game.state(), la: window.__game.legalActions() }));
        const c = la.filter((a) => (a.type === 'buy' || a.type === 'upgrade') && a.to && a.to.zone === 'tube');
        if (!c.length) break;
        const act = c[Math.floor(R() * Math.min(3, c.length))];
        const card = st.shop.cards[act.card];
        const prev = st.tubes[act.to.i].shell;
        const want = { coins: st.coins, i: act.to.i, id: card.id, star: act.type === 'upgrade' ? prev.star + 1 : 1 };
        const bought = () => waitState((w) => { const t = window.__game.state(); const sh = t.tubes[w.i] && t.tubes[w.i].shell; return t.coins < w.coins && sh && sh.id === w.id && sh.star === w.star; }, want, 800);
        let ok = false, how = '';
        // A: focus the card, Enter; focus the tube, Enter.
        if ((await focusByKeys(`[data-card="${act.card}"]`)) && (await press('Enter')) && (await focusByKeys(`[data-tube="${act.to.i}"]`))) {
          await press('Enter'); ok = await bought(); how = 'focus card + Enter, focus tube + Enter';
        }
        // B: digit selects the card, then Enter on the tube.
        if (!ok) {
          if (await page.evaluate(() => window.__game.state().coins) === st.coins) {
            await press('Escape'); if (await visibleOverlay('pause-menu')) await press('Escape');
            await press(String(act.card + 1));
            if (await focusByKeys(`[data-tube="${act.to.i}"]`)) { await press('Enter'); ok = await bought(); how = `${act.card + 1} + focus tube + Enter`; }
          }
        }
        if (ok) { stats.buys++; run.notes.keyBuy = how; } else { stats.buyFails++; failFirst('buy', 'keyboard buy (card → tube with Enter, or 1–4 then Enter)', `${act.type} ${card.id} → tube ${act.to.i} did not register`); break; }
        if (R() < 0.3) {
          await press('u');
          if (await waitState((c0) => window.__game.state().coins === c0, st.coins, 800)) stats.undos++;
          else failFirst('undo', 'U undoes the last build action', '');
        }
      }
      // X only where the UI offers Reroll: the Workshop row is hidden in Festival 1 (spec §8), although
      // the SIM already allows a reroll there (§2.5), so X is a no-op in F1 by design.
      const rr0 = await page.evaluate(() => {
        const legal = window.__game.legalActions().some((a) => a.type === 'reroll');
        const btn = [...document.querySelectorAll('[data-act="reroll"]')].some((b) => window.__pt.visible(b));
        return { legal, btn };
      });
      if (rr0.legal && !rr0.btn && !run.notes.rerollHidden) { run.notes.rerollHidden = true; run.info('reroll is legal but no Reroll control is shown (Workshop hidden in F1), so X is not tried', ''); }
      if ((stats.rerolls === 0 || R() < 0.3) && rr0.legal && rr0.btn) {
        const rr = await page.evaluate(() => { const t = window.__game.state(); return { c: t.coins, r: t.shop ? t.shop.rerolls : 0 }; });
        await press('x');
        if (await waitState((o) => { const t = window.__game.state(); return t.coins < o.c || (t.shop && t.shop.rerolls > o.r); }, rr, 800)) stats.rerolls++;
        else {
          const why = await page.evaluate(() => {
            const w = document.getElementById('workshop'), a = document.activeElement;
            const btn = document.querySelector('[data-act="reroll"]');
            return `reroll legal; #workshop ${!w ? 'missing' : w.hidden ? 'hidden' : window.__pt.visible(w) ? 'visible' : 'not visible'}; reroll button ${!btn ? 'missing' : window.__pt.visible(btn) ? 'visible' : 'not visible'}; focus ${window.__pt.desc(a)}; data-ui ${window.__pt.ui()}; play mode ${(document.getElementById('play') || {}).dataset?.mode}`;
          });
          failFirst('reroll', 'X rerolls the shop', why);
        }
      }
      const b = await state(page);
      const log0 = await page.evaluate(() => window.__pt.uiLog.length);
      run.step = `show ${show + 1} lighting (keys)`;
      await press('f');
      const r = await waitLeft(page, log0, 2000);
      if (!r) { failFirst('light', 'F lights the fuse', `data-ui stayed ${await ui(page)}`); break; }
      if (r === 'RESOLVING' && R() < 0.5) { await sleep(120); if ((await ui(page)) === 'RESOLVING') { await page.keyboard.press(' '); stats.spaces++; } }
      const end = await waitUi(page, ['RESULT', 'BUILD', 'END'], 30000);
      if (!end) { run.fail('each show ends in RESULT, BUILD or END', `show ${show + 1} stuck in ${await ui(page)} 30 s after F`); await shot(s, run, 'stuck'); break; }
      const a = await state(page);
      const log = await page.evaluate((i) => window.__pt.uiLog.slice(i).map((x) => x.ui), log0);
      if (a.runStats.history.length !== b.runStats.history.length + 1) failFirst('advance', 'F lights the fuse and the show is recorded', `ui log ${log.join(' → ')}`);
      stats.shows++;
      await sleep(80);
      const fi = await focusInfo();
      if (fi.none && isReady(end)) run.notes.focusAfterShow = 'body';
      if (end === 'END') break;
    }
    run.check(stats.shows > 0, 'played shows with the keyboard only', `${stats.shows} shows · ${stats.buys} buys · ${stats.undos} undos · ${stats.rerolls} rerolls · ${stats.spaces} fast-forwards; ${presses} key presses`);
    if (!failOnce.has('light') && !failOnce.has('advance')) run.check(stats.shows > 0, 'F lights the fuse and the show is recorded', '');
    if (!failOnce.has('buy')) run.check(stats.buys > 0, 'keyboard buy (card → tube with Enter, or 1–4 then Enter)', run.notes.keyBuy || '', 'WARN');
    run.notes.stats = stats;
    run.check(bad.size === 0, 'focus is always visible (indicator, on-screen, not hidden)', bad.size ? `${bad.size} elements: ` + [...bad].slice(0, 6).map(([k, v]) => `${k}: ${v}`).join('; ') + (bad.size > 6 ? ' …' : '') : '');
    run.check(lostFocus === 0, 'focus never drops to <body> during BUILD', lostFocus ? `${lostFocus} times, after: ${[...lostAfter].join(', ')}` : '', 'WARN');
    if (tabBlurs) run.info('Tab off the last stop blurs the window → Tap to continue (dismissed with Enter)', `${tabBlurs} times`);
    run.step = 'final';
    await shot(s, run, 'focus');
  } catch (e) {
    run.fail('keys flow ran to completion', `during "${run.step}": ${errMsg(e)}`);
    await shot(s, run, 'error');
  } finally {
    await closeSession(s, run);
  }
  return run;
}

// ---------------------------------------------------------------- flow: bots
function findJson(text) {
  if (!text) return null;
  const i = text.indexOf('{'), j = text.lastIndexOf('}');
  if (i < 0 || j <= i) return null;
  try { const v = JSON.parse(text.slice(i, j + 1)); return v && typeof v === 'object' && !Array.isArray(v) ? v : null; } catch { return null; }
}

async function flowBotsSim(browser, vp, run = new Run('bots', vp, 'sim')) {
  run.step = 'open';
  run.label = `bots ${vp.name} ?sim=50`;
  const s = await openSession(browser, run, vp, 'host', `test=1&sim=50&bot=human&seed=${encodeURIComponent(OPTS.seed)}`);
  const page = s.page;
  try {
    run.step = 'boot';
    await waitUi(page, ['BUILD', 'END'], 3000);
    run.step = 'wait for the ?sim=50 summary';
    const t0 = Date.now();
    let found = null;
    while (!found && Date.now() - t0 < OPTS.botsTimeout) {
      for (const t of s.consoleTexts) { const j = findJson(t); if (j) { found = { src: 'console', j }; break; } }
      if (found) break;
      const pres = await page.evaluate(() => [...document.querySelectorAll('pre')].map((p) => ({ id: p.id, t: p.textContent })));
      for (const p of pres) { const j = findJson(p.t); if (j) { found = { src: `pre${p.id ? '#' + p.id : ''}`, j }; break; } }
      if (!found) await sleep(250);
    }
    const secs = round1((Date.now() - t0) / 1000);
    if (run.check(!!found, '?test=1&sim=50&bot=human prints a JSON summary', found ? `from ${found.src} after ${secs} s: ${short(found.j, 220)}` : `nothing after ${secs} s`)) {
      const j = found.j;
      const nKey = ['n', 'runs', 'count', 'N'].find((k) => typeof j[k] === 'number');
      if (nKey) run.check(j[nKey] === 50, 'the summary covers 50 runs', `${nKey} = ${j[nKey]}`, 'WARN');
      const inBoth = s.consoleTexts.some((t) => findJson(t)) && (await page.evaluate(() => [...document.querySelectorAll('pre')].some((p) => { try { return !!JSON.parse(p.textContent.slice(p.textContent.indexOf('{'))); } catch { return false; } })));
      run.check(inBoth, 'the summary is in the console and in a <pre>', '', 'WARN');
      run.notes.summary = j;
    }
    const lt = await page.evaluate(() => { const b = window.__pt.uiLog.find((x) => x.ui === 'BUILD'); const t = b ? b.t : 0; return window.__pt.longtasks.filter((x) => x.t > t); });
    const longest = lt.length ? Math.max(...lt.map((x) => x.d)) : 0;
    run.check(longest <= 100, 'bots run off the main thread (no long task > 100 ms after boot)', `${lt.length} long tasks, longest ${round1(longest)} ms`, 'WARN');
  } catch (e) {
    run.fail('bots sim ran to completion', `during "${run.step}": ${errMsg(e)}`);
  } finally {
    await closeSession(s, run);
  }
  return run;
}

async function flowBotsRun(browser, vp, run = new Run('bots', vp, 'act')) {
  run.step = 'open';
  run.label = `bots ${vp.name} __game.act`;
  const s = await openSession(browser, run, vp, 'host', `test=1&seed=${encodeURIComponent(OPTS.seed)}`);
  const page = s.page;
  try {
    run.step = 'boot';
    if (!(await boot(s, run))) return run;
    run.step = 'drive a run to END through __game.act';
    const hash0 = await page.evaluate(() => window.__game.hash && window.__game.hash());
    const seed0 = (await state(page)).seed;
    // Simple policy: upgrade twins, else buy the dearest affordable card into the first empty tube;
    // add a tube when the rack is full; then light. Every action goes through __game.act.
    const res = await page.evaluate(async () => {
      const g = window.__game, pt = window.__pt;
      const log = [], problems = [];
      const settle = async () => {
        for (let i = 0; i < 40 && !['BUILD', 'RESULT', 'END'].includes(pt.ui()); i++) {
          if (g.step) g.step(60);
          await new Promise((r) => setTimeout(r, 10));
        }
      };
      const bad = (o) => { const st = [o]; while (st.length) { const v = st.pop(); if (typeof v === 'number' && !Number.isFinite(v)) return true; if (v && typeof v === 'object') for (const k in v) st.push(v[k]); } return false; };
      let lights = 0;
      for (; lights < 80; lights++) {
        const s0 = g.state();
        if (s0.phase !== 'build') break;
        const la0 = g.legalActions();
        if (!la0.length) problems.push(`legalActions empty in build at show ${s0.show + 1}`);
        if (bad(s0)) problems.push(`NaN/Infinity in state at show ${s0.show + 1}`);
        if (g.hash && g.hash() !== g.hash()) problems.push('hash() is not stable');
        for (let k = 0; k < 5; k++) {
          const st = g.state(), la = g.legalActions();
          const up = la.find((a) => a.type === 'upgrade' && a.to.zone === 'tube');
          const buys = la.filter((a) => a.type === 'buy' && a.to.zone === 'tube').sort((a, b) => st.shop.cards[b.card].cost - st.shop.cards[a.card].cost || a.to.i - b.to.i);
          const tube = la.find((a) => a.type === 'buyTube');
          const pick = up || buys[0] || (st.tubes.every((t) => t.shell) ? tube : null);
          if (!pick) break;
          const ev = g.act(pick);
          if (Array.isArray(ev) && ev[0] && ev[0].type === 'illegal') { problems.push(`legal action rejected: ${JSON.stringify(pick)} (${ev[0].reason})`); break; }
          log.push(pick);
        }
        g.act({ type: 'light' });
        log.push({ type: 'light' });
        await settle();
      }
      await settle();
      const st = g.state();
      return { lights, log, problems, phase: st.phase, show: st.show, ui: pt.ui(), hash: g.hash ? g.hash() : null };
    }, undefined, 60000);
    run.info('run driven through __game.act', `${res.lights} shows, ${res.log.length} actions, phase ${res.phase} at show ${res.show + 1}`);
    run.check(!res.problems.length, 'SIM invariants during the run (legalActions non-empty, no NaN, stable hash)', res.problems.slice(0, 5).join('; '));
    if (!run.check(res.phase === 'lost' || res.phase === 'won', 'the run ends (phase lost or won)', `phase ${res.phase} after ${res.lights} shows`)) return run;
    let u = res.ui;
    if (u !== 'END') u = await waitUi(page, ['END'], 3000);
    if (!run.check(u === 'END', 'data-ui reaches END after the last show', `data-ui ${u || (await ui(page))}`)) { await shot(s, run, 'no-END'); return run; }
    let focused = null;
    try { await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'run-it-back', null, { timeout: 1500, polling: 30 }); focused = 'run-it-back'; } catch { focused = await page.evaluate(() => (document.activeElement && document.activeElement.id) || window.__pt.desc(document.activeElement)); }
    const endInfo = await page.evaluate(() => {
      const e = document.getElementById('end');
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { visible: window.__pt.visible(e), chars: e.textContent.trim().length, w: Math.round(r.width), btn: !!document.getElementById('run-it-back') };
    });
    run.check(!!endInfo && endInfo.visible && endInfo.chars > 20, '#end renders (visible, with content)', endInfo ? `${endInfo.chars} chars, ${endInfo.w} px wide` : 'no #end');
    run.check(focused === 'run-it-back', 'focus lands on #run-it-back', `focused: ${focused}`);
    await layout(s, run, 'END', { scope: '#end' });
    await shot(s, run, 'END');
    // Run it back: a real click must restart in under 1 s.
    run.step = 'Run it back';
    if (endInfo && endInfo.btn) {
      const mark = await page.evaluate(() => window.__pt.uiLog.length);
      await page.locator('#run-it-back').click({ timeout: 3000 });
      const back = await waitUi(page, ['BUILD'], 3000);
      const t = await page.evaluate((i) => {
        const pd = window.__pt.pointerDowns[window.__pt.pointerDowns.length - 1];
        const b = window.__pt.uiLog.slice(i).find((x) => x.ui === 'BUILD');
        return b && pd ? b.t - pd : null;
      }, mark);
      const st = await state(page);
      const fresh = st && st.show === 0 && st.phase === 'build' && (!st.runStats || !st.runStats.history || st.runStats.history.length === 0);
      run.check(back === 'BUILD' && fresh && t !== null && t < 1000, 'Run it back restarts a fresh run in < 1 s', `${t === null ? '?' : Math.round(t)} ms to BUILD; show ${st && st.show + 1}, phase ${st && st.phase}`);
      run.check(!(await page.evaluate(() => window.__pt.visible(document.getElementById('end')))), '#end closes after Run it back', '');
      run.check(st && st.seed !== seed0, 'Run it back uses a new seed (spec §8.2)', `seed ${seed0} → ${st && st.seed}`, 'WARN');
      await shot(s, run, 'restart');
    } else run.fail('Run it back restarts a fresh run in < 1 s', 'no #run-it-back');
    // Determinism: reset(seed) + the same action log reproduces the final hash (spec §11.7).
    run.step = 'determinism replay';
    if (res.hash) {
      const rep = await page.evaluate(async ({ seed, log, hash0 }) => {
        const g = window.__game;
        g.reset(seed);
        if (g.hash() !== hash0) return { skipped: `reset(${JSON.stringify(seed)}) does not reproduce the boot state` };
        for (const a of log) {
          g.act(a);
          if (a.type === 'light') for (let i = 0; i < 40 && !['BUILD', 'RESULT', 'END'].includes(window.__pt.ui()); i++) { g.step && g.step(60); await new Promise((r) => setTimeout(r, 5)); }
        }
        return { hash: g.hash() };
      }, { seed: seed0, log: res.log, hash0 }, 60000);
      if (rep.skipped) run.warn('same seed + same actions → same hash', rep.skipped);
      else run.check(rep.hash === res.hash, 'same seed + same actions → same hash', `${res.hash} vs ${rep.hash}`);
    }
  } catch (e) {
    run.fail('bots flow ran to completion', `during "${run.step}": ${errMsg(e)}`);
    await shot(s, run, 'error');
  } finally {
    await closeSession(s, run);
  }
  return run;
}

// ---------------------------------------------------------------- main
function printRun(run) {
  const n = { PASS: 0, FAIL: 0, WARN: 0, INFO: 0 };
  for (const c of run.checks) n[c.status]++;
  console.log(`${run.status === 'PASS' ? 'PASS' : 'FAIL'}  ${run.label.padEnd(28)} ${String(n.PASS).padStart(3)} pass  ${String(n.FAIL).padStart(2)} fail  ${String(n.WARN).padStart(2)} warn  ${(run.ms / 1000).toFixed(1).padStart(5)} s`);
  for (const c of run.checks) {
    if (c.status === 'FAIL' || c.status === 'WARN' || OPTS.verbose) console.log(`      ${c.status.padEnd(4)}  ${c.name}${c.detail ? ': ' + c.detail : ''}`);
  }
  if (run.perf) for (const [k, p] of Object.entries(run.perf)) console.log(`      perf  ${k}: p50 ${p.p50} ms · p95 ${p.p95} ms · max ${p.max} ms · ${p.frames} frames · long tasks ${p.longTasks} (max ${p.longestTask} ms) · load ${p.load}/CPU`);
}

async function main() {
  if (!fs.existsSync(OPTS.file)) {
    console.error(`playtest: ${OPTS.file} not found; run node tools/build.mjs first`);
    process.exit(2);
  }
  if (!fs.existsSync(OPTS.out)) {
    // A directory we create holds only generated output: keep it out of git.
    fs.mkdirSync(OPTS.out, { recursive: true });
    fs.writeFileSync(path.join(OPTS.out, '.gitignore'), '*\n');
  }
  for (const f of fs.readdirSync(OPTS.out)) if (/^(smoke|ui|keys|bots)-.*\.png$/.test(f)) fs.rmSync(path.join(OPTS.out, f));
  const tmpDir = prepareHost();
  const started = Date.now();
  const load0 = os.loadavg().map(round1);
  console.log(`Ooh × Aah playtest: ${rel(OPTS.file)} · flows ${OPTS.flows.join(',')} · viewports ${OPTS.vps.map((v) => v.name).join(',')} · seed ${OPTS.seed} · ${OPTS.shows} shows · jobs ${OPTS.jobs} · fonts ${OPTS.fonts}\n`);

  let browser = await withTimeout(chromium.launch(), 30000, 'chromium.launch() took over 30 s');
  // After a hung page (or a dead browser) start the next task on a fresh browser.
  const relaunch = async (why) => {
    console.log(`      note  relaunching Chromium after ${why}`);
    const old = browser;
    await withTimeout(old.close(), 5000, 'browser.close').catch(() => {});
    browser = await withTimeout(chromium.launch(), 30000, 'chromium.launch() took over 30 s');
  };
  // Each task owns its Run (so the guard can report and clean up) and a hard time budget.
  const budget = (ms) => OPTS.taskTimeout || ms;
  const tasks = [];
  const add = (run, ms, fn) => tasks.push({ run, ms: budget(ms), fn: () => fn(run) });
  if (OPTS.flows.includes('smoke')) for (const vp of OPTS.vps) for (const v of ['host', 'raw']) add(new Run('smoke', vp, v), 90000, (r) => flowSmoke(browser, vp, v, r));
  if (OPTS.flows.includes('ui')) for (const vp of OPTS.vps) add(new Run('ui', vp, 'host'), 180000, (r) => flowUi(browser, vp, r));
  if (OPTS.flows.includes('keys')) for (const vp of OPTS.vps) add(new Run('keys', vp, 'host'), 180000, (r) => flowKeys(browser, vp, r));
  if (OPTS.flows.includes('bots')) {
    const named = (r, label) => Object.assign(r, { label });
    add(named(new Run('bots', OPTS.vps[0], 'sim'), `bots ${OPTS.vps[0].name} ?sim=50`), Math.max(OPTS.taskTimeout, OPTS.botsTimeout + 30000), (r) => flowBotsSim(browser, OPTS.vps[0], r));
    for (const vp of OPTS.vps) add(named(new Run('bots', vp, 'act'), `bots ${vp.name} __game.act`), 120000, (r) => flowBotsRun(browser, vp, r));
  }

  const results = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      const { run, ms, fn } = tasks[i];
      const t0 = Date.now();
      let timer;
      const guard = new Promise((res) => { timer = setTimeout(() => res('timeout'), ms); });
      const out = await Promise.race([fn().then(() => 'done', (e) => e || new Error('unknown error')), guard]);
      clearTimeout(timer);
      if (out === 'timeout') {
        // Fail fast and loud: name the step and the last data-ui, then close the page so the
        // flow's pending awaits reject instead of running on in the background.
        const page = run.session && run.session.page;
        let u = page ? await page.evaluate(() => window.__pt && window.__pt.ui(), undefined, 1000).catch(() => null) : null;
        const hung = !!page && u === null;
        if (hung) u = `${page.__lastUi || '?'} (page unresponsive)`;
        else if (page) await shot(run.session, run, 'timeout');
        run.fail(`${run.flow} task finished within its ${Math.round(ms / 1000)} s budget`, `timed out during "${run.step}" (data-ui ${u})`);
        run.frozen = true;
        if (run.session) await withTimeout(run.session.context.close(), 5000, 'context.close').catch(() => {});
        if (hung && OPTS.jobs === 1) await relaunch('a wedged renderer');
      } else if (out !== 'done') {
        run.fail(`${run.flow} task finished`, `crashed during "${run.step}": ${errMsg(out)}`);
        if (run.session) await withTimeout(run.session.context.close(), 5000, 'context.close').catch(() => {});
      }
      if (!browser.isConnected()) await relaunch('a lost browser connection');
      run.frozen = true;
      run.ms = Date.now() - t0;
      results[i] = run;
      printRun(run);
    }
  };
  // Last line of defence: the whole suite has a deadline (the sum of the task budgets / jobs + 60 s).
  const deadline = Math.ceil(tasks.reduce((a, t) => a + t.ms, 0) / Math.min(OPTS.jobs, tasks.length || 1)) + 60000;
  let dl;
  const allDone = await Promise.race([
    Promise.all(Array.from({ length: Math.min(OPTS.jobs, tasks.length) }, worker)).then(() => true),
    new Promise((res) => { dl = setTimeout(() => res(false), deadline); }),
  ]);
  clearTimeout(dl);
  if (!allDone) console.log(`\nplaytest: the suite passed its ${Math.round(deadline / 1000)} s deadline; unfinished tasks are reported as FAIL`);
  tasks.forEach((t, i) => {
    if (results[i]) return;
    t.run.fail(`${t.run.flow} task finished`, allDone ? 'never started' : `cut off by the suite deadline during "${t.run.step}"`);
    t.run.frozen = true;
    results[i] = t.run;
    printRun(t.run);
  });

  const runs = results.filter(Boolean);
  const failed = runs.filter((r) => r.status === 'FAIL');
  const count = (st) => runs.reduce((a, r) => a + r.checks.filter((c) => c.status === st).length, 0);
  const report = {
    tool: 'ooh-and-aah/tools/playtest.mjs', date: new Date().toISOString(), file: OPTS.file, seed: OPTS.seed, shows: OPTS.shows,
    flows: OPTS.flows, viewports: OPTS.vps.map((v) => v.name), fonts: OPTS.fonts, durationMs: Date.now() - started,
    machine: { cpus: os.cpus().length, loadStart: load0, loadEnd: os.loadavg().map(round1) },
    verdict: failed.length ? 'FAIL' : 'PASS', totals: { runs: runs.length, failedRuns: failed.length, pass: count('PASS'), fail: count('FAIL'), warn: count('WARN') },
    runs: runs.map((r) => ({ flow: r.flow, viewport: r.viewport, variant: r.variant, label: r.label, status: r.status, ms: r.ms, checks: r.checks, perf: r.perf, shots: r.shots, notes: r.notes })),
  };
  fs.mkdirSync(path.dirname(OPTS.json), { recursive: true });
  fs.writeFileSync(OPTS.json, JSON.stringify(report, null, 2));
  // Write the report first, then close: a wedged renderer must not cost us the results.
  await withTimeout(browser.close(), 10000, 'browser.close').catch(() => console.log('playtest: browser.close() did not finish in 10 s; exiting anyway'));
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`\nPLAYTEST ${report.verdict}: ${runs.length - failed.length}/${runs.length} runs passed · ${report.totals.fail} failed checks · ${report.totals.warn} warnings · ${(report.durationMs / 1000).toFixed(1)} s`);
  if (failed.length) console.log(`  failed: ${failed.map((r) => r.label).join(', ')}`);
  console.log(`  report ${rel(OPTS.json)} · screenshots ${rel(OPTS.out)}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
