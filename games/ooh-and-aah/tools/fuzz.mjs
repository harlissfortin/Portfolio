#!/usr/bin/env node
/*
 * tools/fuzz.mjs: a seeded UI chaos monkey for Ooh × Aah.
 *
 * For --minutes (default 3, split across the viewports; default 360x740 and 1440x900) it fires
 * bursts of random input at the built index.html:
 *   taps (mouse and touch) on every visible control and at random points; drags between cards,
 *   tubes, the Crate and the rig card, including releases off-target and touch drags that end in
 *   a real pointercancel; long-presses (≥ 450 ms, the Inspect shortcut); rapid double and triple
 *   taps on #fire; random keys from the spec §13 key map; window blur/focus; visibilitychange to
 *   hidden and back; viewport resizes (the spec's 4 test sizes and random ones); overlay
 *   open/close (P, L, ?, Esc, the pause button, and GAME.open/close); idle waits; and an
 *   "autopilot" macro that plays one show competently through the UI so the monkey reaches later
 *   shows, Headliners, Sponsors and the end screen. Every ~45 s it reloads the page with a new
 *   seeded query (seed, sometimes kit/renown/unlock=all/fresh=1), which also exercises
 *   "reload restores the saved run".
 *
 * After every burst it asserts:
 *   - no page errors and no console errors (Google Fonts failures ignored);
 *   - window.__game.state() invariants: coins an integer ≥ 0, crowd finite ≥ 0, 1..6 tubes,
 *     Crate ≤ 2 slots, phase ∈ {build, won, lost}, stars 1..3, shell uids unique, ≤ 1 Mortar;
 *   - #app[data-ui] is a valid UI state and equals GAME.ui;
 *   - no NaN / Infinity / undefined / [object Object] in any visible text or aria-label;
 *   - one double/triple tap on #fire never lights two shows;
 *   - the game is never stuck: BUILD or END is reachable within 10 s (waiting, tapping "Tap to
 *     continue", pressing Esc on overlays, Skip). Every 5th burst the probe must also clear every
 *     overlay (proving they all close).
 *
 * Seeded and reproducible: the same --seed gives the same action stream. On failure it prints the
 * action log since the last page load, and saves it (with a screenshot) to
 * tools/shots/fuzz/fail-<viewport>-s<seed>.json, which --replay re-runs.
 *
 * Usage:
 *   node tools/fuzz.mjs [--minutes 3] [--seed 1] [--viewports 360x740,1440x900]
 *        [--file index.html | --url http://…] [--segment 45] [--probe-every 5] [--out tools/shots/fuzz]
 *        [--replay tools/shots/fuzz/fail-….json] [--headed] [--raw] [--verbose]
 * Exit code: 0 clean · 1 a failure was found (or the page could not load).
 */
import { createRequire } from 'module';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const sleep = ms => new Promise(r => setTimeout(r, Math.max(0, ms)));
const UI_STATES = ['BOOT', 'BUILD', 'RESOLVING', 'RESULT', 'END'];
// spec §13 key map (plus Shift+Tab); no reload/devtools keys
const KEYS = ['Tab', 'Shift+Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's', 'Enter', 'Space', 'Escape',
  '1', '2', '3', '4', 'g', 't', 'x', 'Backspace', 'Delete', 'c', 'm', 'b', 'u', 'z', 'h', 'i', 'f', 'p', 'l', '?', 'r', 'R'];
const SIZES = [[360, 740], [360, 640], [375, 548], [1440, 900], [320, 480], [414, 896], [768, 1024], [1024, 700], [1920, 1080], [700, 460]];
const OVERLAY_API = ['pause', 'settings', 'logbook', 'help'];

// ---------------------------------------------------------------- args
function parseArgs(argv) {
  const o = { minutes: 3, seed: 1, viewports: '360x740,1440x900', file: null, url: null, segment: 45, probeEvery: 5,
    out: path.join(HERE, 'shots', 'fuzz'), replay: null, headed: false, raw: false, verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], eq = a.indexOf('='), key = (eq > 0 ? a.slice(0, eq) : a).replace(/^--/, '');
    const val = () => (eq > 0 ? a.slice(eq + 1) : argv[++i]);
    switch (key) {
      case 'minutes': o.minutes = Math.max(0.05, parseFloat(val())); break;
      case 'seed': o.seed = parseInt(val(), 10) || 1; break;
      case 'viewports': case 'viewport': o.viewports = String(val()); break;
      case 'file': o.file = path.resolve(String(val())); break;
      case 'url': o.url = String(val()); break;
      case 'segment': o.segment = Math.max(5, parseFloat(val())); break;
      case 'probe-every': o.probeEvery = Math.max(1, parseInt(val(), 10) || 5); break;
      case 'out': o.out = path.resolve(String(val())); break;
      case 'replay': o.replay = path.resolve(String(val())); break;
      case 'headed': o.headed = true; break;
      case 'raw': o.raw = true; break;
      case 'verbose': case 'v': o.verbose = true; break;
      case 'help': case 'h': console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]); process.exit(0);
      default: console.error(`fuzz: unknown flag ${a}`); process.exit(1);
    }
  }
  o.vps = o.viewports.split(',').map(s => { const m = /^(\d+)x(\d+)$/.exec(s.trim()); if (!m) { console.error(`fuzz: bad viewport ${s}`); process.exit(1); } return [+m[1], +m[2]]; });
  return o;
}

function mulberry32(a) { a >>>= 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function strSeed(s) { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

function serve(file, raw) {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/' || u.pathname === '/index.html') {
      let html = fs.readFileSync(file, 'utf8');
      if (!raw && !/^\s*<!doctype/i.test(html)) html = '<!doctype html>\n' + html;
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(html);
    } else { res.writeHead(u.pathname === '/favicon.ico' ? 204 : 404); res.end(); }
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r({ server, url: `http://127.0.0.1:${server.address().port}/index.html` })));
}

// ---------------------------------------------------------------- page-side helpers (serialised into the page)
/** Every visible, on-screen control with a stable CSS selector. */
function pageTargets() {
  const cssPath = el => {
    if (el.id) return '#' + CSS.escape(el.id);
    for (const a of ['data-card', 'data-tube', 'data-crate', 'data-act']) {
      if (el.hasAttribute(a)) { const s = `${el.tagName.toLowerCase()}[${a}="${el.getAttribute(a)}"]`; if (document.querySelectorAll(s).length === 1) return s; }
    }
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && e !== document.body; e = e.parentElement) {
      if (e.id) { parts.unshift('#' + CSS.escape(e.id)); break; }
      const p = e.parentElement; if (!p) break;
      parts.unshift(`${e.tagName.toLowerCase()}:nth-child(${Array.prototype.indexOf.call(p.children, e) + 1})`);
    }
    return parts.join(' > ');
  };
  const els = document.querySelectorAll('#app button, #app [role="button"], #app [role="tab"], #app [role="switch"], #app [role="slider"], #app input, #app select, #app [data-card], #app [data-tube], #app [data-crate], #app [data-act], #sky, #tap-continue, #end, #inspect, #app [tabindex]');
  const out = []; const seen = new Set();
  for (const el of els) {
    if (seen.has(el) || el.closest('[hidden]')) continue; seen.add(el);
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) continue;
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const hit = document.elementFromPoint(x, y);
    const kind = el.id === 'fire' ? 'fire' : el.hasAttribute('data-card') ? 'card' : el.hasAttribute('data-tube') ? 'tube' : el.hasAttribute('data-crate') ? 'crate'
      : el.getAttribute('data-act') === 'buyRig' ? 'rig' : el.hasAttribute('data-act') ? 'act' : el.id === 'sky' ? 'sky' : 'other';
    out.push({ sel: cssPath(el), x, y, w: r.width, h: r.height, kind, hit: !!(hit && (hit === el || el.contains(hit))) });
  }
  return out;
}
function pageLite() {
  const app = document.querySelector('#app');
  const vis = id => { const el = document.getElementById(id); if (!el || el.hidden) return false; const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1 && (!el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true })); };
  const overlays = ['pause-menu', 'settings', 'logbook', 'help', 'inspect', 'tap-continue', 'end'].filter(vis);
  let top = null, gameUi = null, show = null, phase = null, hist = null, seed = null;
  try { if (typeof GAME !== 'undefined' && GAME) { gameUi = GAME.ui; top = typeof GAME.top === 'function' ? GAME.top() : null; } } catch (e) { /* ignore */ }
  try { const s = window.__game && __game.state(); if (s) { show = s.show; phase = s.phase; seed = s.seed; hist = ((s.runStats && s.runStats.history) || []).length; } } catch (e) { /* ignore */ }
  return { ui: app ? app.dataset.ui : null, gameUi, top, overlays, show, phase, hist, seed };
}
/** The invariants; returns a list of violations (empty = fine). */
function pageInvariants() {
  const bad = [];
  const app = document.querySelector('#app');
  if (!app) return ['#app is missing'];
  const ui = app.dataset.ui;
  if (!['BOOT', 'BUILD', 'RESOLVING', 'RESULT', 'END'].includes(ui)) bad.push(`#app[data-ui] is ${JSON.stringify(ui)}`);
  try { if (typeof GAME !== 'undefined' && GAME && GAME.ui !== ui) bad.push(`#app[data-ui]=${ui} but GAME.ui=${GAME.ui}`); } catch (e) { /* no GAME */ }
  let st = null;
  try { st = window.__game && typeof __game.state === 'function' ? __game.state() : null; } catch (e) { bad.push(`__game.state() threw: ${e && e.message}`); }
  if (st) {
    const fin = v => typeof v === 'number' && Number.isFinite(v);
    if (!fin(st.coins) || st.coins < 0 || !Number.isInteger(st.coins)) bad.push(`coins = ${st.coins}`);
    if (!fin(st.crowd) || st.crowd < 0) bad.push(`crowd = ${st.crowd}`);
    if (!Array.isArray(st.tubes) || st.tubes.length < 1 || st.tubes.length > 6) bad.push(`tubes.length = ${st.tubes && st.tubes.length}`);
    if (!Array.isArray(st.crate) || st.crate.length > 2) bad.push(`crate.length = ${st.crate && st.crate.length}`);
    if (!['build', 'won', 'lost'].includes(st.phase)) bad.push(`phase = ${JSON.stringify(st.phase)}`);
    if (!Number.isInteger(st.show) || st.show < 0 || st.show > 35) bad.push(`show = ${st.show}`);
    const shells = [...(st.tubes || []).map(t => t && t.shell), ...(st.crate || [])].filter(Boolean);
    const uids = new Set();
    for (const sh of shells) {
      if (![1, 2, 3].includes(sh.star)) bad.push(`shell ${sh.id} star = ${sh.star}`);
      if (uids.has(sh.uid)) bad.push(`duplicate shell uid ${sh.uid} (${sh.id})`); uids.add(sh.uid);
    }
    if ((st.tubes || []).filter(t => t && t.rig === 'mortar').length > 1) bad.push('more than one Mortar');
  }
  // no NaN & co. in anything a player can see or hear from a screen reader
  const re = /\bNaN\b|\bInfinity\b|\bundefined\b|\[object Object\]/;
  const shown = el => !el.closest('[hidden]') && (!el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true }));
  const walker = document.createTreeWalker(app, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const p = n.parentElement;
    if (!p || /^(SCRIPT|STYLE)$/.test(p.tagName) || p.closest('#debug,#sim-out')) continue;
    if (re.test(n.textContent) && shown(p)) { bad.push(`visible text "${n.textContent.trim().slice(0, 60)}" in ${p.tagName.toLowerCase()}${p.id ? '#' + p.id : ''}`); break; }
  }
  for (const el of app.querySelectorAll('[aria-label]')) {
    if (re.test(el.getAttribute('aria-label')) && shown(el)) { bad.push(`aria-label "${el.getAttribute('aria-label').slice(0, 60)}"`); break; }
  }
  for (const id of ['live-polite', 'live-assertive']) { const el = document.getElementById(id); if (el && re.test(el.textContent)) bad.push(`#${id} announced "${el.textContent.slice(0, 60)}"`); }
  return bad;
}
function pageOverlayCloseButton(id) {
  const root = document.getElementById(id); if (!root) return null;
  const b = Array.from(root.querySelectorAll('button')).find(x => /\b(close|resume|done|back|continue|ok)\b/i.test(`${x.textContent} ${x.getAttribute('aria-label') || ''}`));
  if (!b) return null; const r = b.getBoundingClientRect();
  return r.width > 1 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
}
function pageShopRead() {
  const txt = el => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  const coinsEl = document.getElementById('hud-coins');
  const coins = coinsEl ? parseInt((txt(coinsEl).match(/\d[\d,]*/) || ['0'])[0].replace(/,/g, ''), 10) : 0;
  const cards = Array.from(document.querySelectorAll('button[data-card]')).filter(el => !el.disabled && !el.closest('[hidden]')).map(el => {
    const s = `${txt(el)} ${el.getAttribute('aria-label') || ''}`; const p = s.replace(/Twin[^$]*\$\s*\d+/i, '').match(/\$\s*(\d+)/);
    return { i: +el.dataset.card, price: p ? +p[1] : 99, sold: /\bsold\b/i.test(s) };
  });
  const empty = Array.from(document.querySelectorAll('button[data-tube]')).filter(el => /\bempty\b/i.test(el.getAttribute('aria-label') || '')).map(el => +el.dataset.tube);
  const match = document.querySelector('[data-act="match"]');
  return { coins, cards, empty, match: !!(match && !match.disabled && match.getAttribute('aria-disabled') !== 'true') };
}

// ---------------------------------------------------------------- the monkey
class Monkey {
  constructor(page, cdp, rng, o, errors, vp) {
    Object.assign(this, { page, cdp, rng, o, errors, vp });
    this.log = []; this.cover = { ui: {}, overlays: {}, maxShow: 0, runs: new Set(), lights: 0, ops: 0, bursts: 0, kinds: {} };
    this.lastHist = null;
  }
  pick(a) { return a[Math.floor(this.rng() * a.length)]; }
  weighted(pairs) { const tot = pairs.reduce((s, p) => s + p[1], 0); let r = this.rng() * tot; for (const [v, w] of pairs) { if ((r -= w) < 0) return v; } return pairs[pairs.length - 1][0]; }
  async resolvePoint(t) {
    if (t.sel) {
      const p = await this.page.evaluate(s => { try { const el = document.querySelector(s); if (!el || el.closest('[hidden]')) return null; const r = el.getBoundingClientRect(); if (r.width < 1) return null; return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; } catch (e) { return null; } }, t.sel);
      if (p) return { x: p.x + (t.dx || 0), y: p.y + (t.dy || 0) };
    }
    return { x: t.x, y: t.y };
  }
  // ---- primitive input
  async touch(type, x, y) { await this.cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y, id: 1 }] }); }
  async tapAt(x, y, touch) {
    if (touch) { await this.touch('touchStart', x, y); await sleep(30); await this.touch('touchEnd', x, y); }
    else await this.page.mouse.click(x, y, { delay: 20 });
  }
  async exec(op) {
    const m = this.page.mouse;
    switch (op.k) {
      case 'tap': case 'tapxy': { const p = await this.resolvePoint(op); await this.tapAt(p.x, p.y, op.touch); break; }
      case 'drag': {
        const a = await this.resolvePoint(op.from), b = op.to.sel ? await this.resolvePoint(op.to) : op.to;
        if (op.touch) {
          await this.touch('touchStart', a.x, a.y);
          for (let i = 1; i <= op.steps; i++) { await this.touch('touchMove', a.x + (b.x - a.x) * i / op.steps, a.y + (b.y - a.y) * i / op.steps); await sleep(8); }
          await this.touch(op.end === 'cancel' ? 'touchCancel' : 'touchEnd', b.x, b.y);
        } else {
          await m.move(a.x, a.y); await m.down(); await m.move(b.x, b.y, { steps: op.steps }); await m.up();
        }
        break;
      }
      case 'long': {
        const p = await this.resolvePoint(op);
        if (op.touch) { await this.touch('touchStart', p.x, p.y); await sleep(op.ms); await this.touch('touchEnd', p.x, p.y); }
        else { await m.move(p.x, p.y); await m.down(); await sleep(op.ms); await m.up(); }
        break;
      }
      case 'multi': {
        const before = await this.page.evaluate(pageLite);
        const p = await this.resolvePoint({ sel: '#fire', x: op.x, y: op.y });
        for (let i = 0; i < op.n; i++) { await this.tapAt(p.x, p.y, op.touch); await sleep(op.dt); }
        await sleep(250);
        const after = await this.page.evaluate(pageLite);
        if (before.hist != null && after.hist != null && after.seed === before.seed && after.hist - before.hist > 1) {
          return `${op.n} rapid taps on #fire lit ${after.hist - before.hist} shows (history ${before.hist} → ${after.hist})`;
        }
        break;
      }
      case 'key': await this.page.keyboard.press(op.key); break;
      case 'blur':
        await this.page.evaluate(() => window.dispatchEvent(new Event('blur')));
        await sleep(op.ms);
        await this.page.evaluate(() => window.dispatchEvent(new Event('focus')));
        break;
      case 'vis':
        await this.page.evaluate(() => window.__fzSetVis && window.__fzSetVis('hidden'));
        await sleep(op.ms);
        await this.page.evaluate(() => window.__fzSetVis && window.__fzSetVis('visible'));
        break;
      case 'resize':
        await this.page.setViewportSize({ width: op.w, height: op.h });
        if (op.back) { await sleep(op.ms); await this.page.setViewportSize({ width: this.vp[0], height: this.vp[1] }); }
        break;
      case 'api':
        await this.page.evaluate(([how, name]) => { try { if (typeof GAME === 'undefined') return; if (how === 'open') GAME.open(name); else GAME.close(); } catch (e) { console.warn('fuzz api', e && e.message); } }, [op.how, op.name]);
        break;
      case 'wait': await sleep(op.ms); break;
      case 'auto': return this.autopilot(op);
      default: throw new Error(`unknown op ${op.k}`);
    }
    return null;
  }
  /** Macro: play one show through the UI (buy what is affordable into empty tubes, Match, fire, Skip). */
  async autopilot(op) {
    const lite = await this.page.evaluate(pageLite);
    if (lite.ui !== 'BUILD' || lite.overlays.some(x => x !== 'end')) return null;
    const shop = await this.page.evaluate(pageShopRead);
    let coins = shop.coins; const empty = shop.empty.slice();
    for (const c of shop.cards) {
      if (c.sold || c.price > coins || !empty.length) continue;
      const tube = empty.shift();
      const a = await this.resolvePoint({ sel: `button[data-card="${c.i}"]` }), b = await this.resolvePoint({ sel: `button[data-tube="${tube}"]` });
      if (a.x == null || b.x == null) continue;
      await this.page.mouse.click(a.x, a.y); await sleep(60); await this.page.mouse.click(b.x, b.y); await sleep(60);
      coins -= c.price;
    }
    if (shop.match && op.match) { const p = await this.resolvePoint({ sel: '[data-act="match"]' }); if (p.x != null) await this.page.mouse.click(p.x, p.y); await sleep(60); }
    const f = await this.resolvePoint({ sel: '#fire' });
    if (f.x == null) return null;
    await this.page.mouse.click(f.x, f.y);
    const t0 = Date.now(); let skipped = false;
    while (Date.now() - t0 < 9000) {
      const s = await this.page.evaluate(pageLite);
      if (s.overlays.includes('tap-continue')) break;
      if ((s.ui === 'BUILD' || s.ui === 'END') && Date.now() - t0 > 200) break;
      if (!skipped && s.ui === 'RESOLVING' && Date.now() - t0 > 800) { skipped = true; const p = await this.resolvePoint({ sel: '#fire' }); if (p.x != null) await this.page.mouse.click(p.x, p.y); }
      await sleep(80);
    }
    return null;
  }
  // ---- generation: one random op from the current screen
  async gen() {
    const targets = await this.page.evaluate(pageTargets);
    const game = targets.filter(t => ['card', 'tube', 'crate', 'rig', 'act', 'fire'].includes(t.kind));
    const touch = this.rng() < 0.35;
    const vw = this.page.viewportSize().width, vh = this.page.viewportSize().height;
    const kind = this.weighted([['tap', 30], ['tapxy', 6], ['drag', 12], ['dragOff', 5], ['dragCancel', 5], ['long', 5], ['multi', 6], ['key', 16],
      ['blur', 2], ['vis', 2], ['resize', 3], ['overlay', 4], ['wait', 3], ['auto', 4]]);
    const T = t => ({ sel: t.sel, x: Math.round(t.x), y: Math.round(t.y), dx: Math.round((this.rng() - 0.5) * t.w * 0.6), dy: Math.round((this.rng() - 0.5) * t.h * 0.6) });
    const anyT = () => {
      if (!targets.length) return { x: Math.round(this.rng() * vw), y: Math.round(this.rng() * vh) };
      const pool = this.rng() < 0.6 && game.length ? game : targets;
      return T(this.pick(pool));
    };
    const gap = this.rng() < 0.1 ? 300 + Math.floor(this.rng() * 900) : Math.floor(this.rng() * 120);
    switch (kind) {
      case 'tap': return { k: 'tap', ...anyT(), touch, gap };
      case 'tapxy': return { k: 'tapxy', x: Math.round(this.rng() * vw), y: Math.round(this.rng() * vh), touch, gap };
      case 'drag': case 'dragOff': case 'dragCancel': {
        const src = game.filter(t => ['card', 'tube', 'crate', 'rig'].includes(t.kind));
        const from = src.length ? T(this.pick(src)) : anyT();
        const dst = targets.filter(t => ['tube', 'crate', 'card'].includes(t.kind));
        const to = kind === 'drag' && dst.length ? T(this.pick(dst)) : { x: Math.round(this.rng() * vw), y: Math.round(this.rng() * vh) };
        return { k: 'drag', from, to, touch: kind === 'dragCancel' ? true : touch, end: kind === 'dragCancel' ? 'cancel' : 'up', steps: 3 + Math.floor(this.rng() * 10), kind, gap };
      }
      case 'long': return { k: 'long', ...anyT(), ms: 450 + Math.floor(this.rng() * 500), touch, gap };
      case 'multi': { const f = targets.find(t => t.kind === 'fire'); return { k: 'multi', x: f ? Math.round(f.x) : vw / 2, y: f ? Math.round(f.y) : vh - 30, n: this.rng() < 0.7 ? 2 : 3, dt: 15 + Math.floor(this.rng() * 70), touch, gap }; }
      case 'key': return { k: 'key', key: this.pick(KEYS), gap };
      case 'blur': return { k: 'blur', ms: 50 + Math.floor(this.rng() * 600), gap };
      case 'vis': return { k: 'vis', ms: 50 + Math.floor(this.rng() * 800), gap };
      case 'resize': { const s = this.rng() < 0.7 ? this.pick(SIZES) : [280 + Math.floor(this.rng() * 1700), 420 + Math.floor(this.rng() * 700)]; return { k: 'resize', w: s[0], h: s[1], back: this.rng() < 0.6, ms: 100 + Math.floor(this.rng() * 600), gap }; }
      case 'overlay': {
        const r = this.rng();
        if (r < 0.45) return { k: 'key', key: this.pick(['p', 'P', 'l', 'L', '?', 'Escape', 'Escape']), gap };
        if (r < 0.6) { const p = targets.find(t => t.sel === '[data-act="pause"]' || /data-act="pause"/.test(t.sel)); if (p) return { k: 'tap', ...T(p), touch, gap }; }
        return this.rng() < 0.6 ? { k: 'api', how: 'open', name: this.pick(OVERLAY_API), gap } : { k: 'api', how: 'close', gap };
      }
      case 'wait': return { k: 'wait', ms: 200 + Math.floor(this.rng() * 1800), gap: 0 };
      case 'auto': return { k: 'auto', match: this.rng() < 0.8, gap };
    }
    return { k: 'wait', ms: 100, gap: 0 };
  }
  // ---- checks
  takeErrors() { return this.errors.splice(0); }
  async check() {
    const errs = this.takeErrors();
    if (errs.length) return errs.map(e => `${e.kind}: ${e.text.split('\n').slice(0, 3).join(' | ')}`);
    let bad;
    try { bad = await this.page.evaluate(pageInvariants); } catch (e) { return [`invariant check failed: ${e.message}`]; }
    const lite = await this.page.evaluate(pageLite);
    this.cover.ui[lite.ui] = (this.cover.ui[lite.ui] || 0) + 1;
    for (const ov of lite.overlays) this.cover.overlays[ov] = (this.cover.overlays[ov] || 0) + 1;
    if (lite.show != null) this.cover.maxShow = Math.max(this.cover.maxShow, lite.show + 1);
    if (lite.seed != null) this.cover.runs.add(lite.seed);
    if (lite.hist != null) { if (this.lastHist && this.lastHist.seed === lite.seed && lite.hist > this.lastHist.hist) this.cover.lights += lite.hist - this.lastHist.hist; this.lastHist = { seed: lite.seed, hist: lite.hist }; }
    return bad;
  }
  /** BUILD or END must be reachable within 10 s. `full` also requires every overlay to close. */
  async probe(full) {
    const t0 = Date.now(); let lastAct = 0, s = null, skipped = false, closeTries = 0;
    while (Date.now() - t0 < 10000) {
      s = await this.page.evaluate(pageLite);
      const blocking = s.overlays.filter(x => x !== 'end');
      if (s.ui === 'END' && (!full || blocking.length === 0)) return null;
      if (s.ui === 'BUILD' && (!full || blocking.length === 0)) return null;
      if (Date.now() - lastAct > 300) {
        if (s.overlays.includes('tap-continue')) {
          const p = await this.resolvePoint({ sel: '#tap-continue' }); if (p.x != null) await this.page.mouse.click(p.x, p.y); lastAct = Date.now();
        } else if (blocking.length && (full || s.ui !== 'BUILD')) {
          if (closeTries++ % 2 === 0) await this.page.keyboard.press('Escape');
          else { const b = await this.page.evaluate(pageOverlayCloseButton, blocking[blocking.length - 1]); if (b) await this.page.mouse.click(b.x, b.y); else await this.page.keyboard.press('Escape'); }
          lastAct = Date.now();
        } else if (s.ui === 'RESOLVING' && !skipped && Date.now() - t0 > 2000) {
          skipped = true; const p = await this.resolvePoint({ sel: '#fire' }); if (p.x != null) await this.page.mouse.click(p.x, p.y); lastAct = Date.now();
        }
      }
      await sleep(80);
    }
    return `stuck: BUILD/END not reachable within 10 s (data-ui=${s && s.ui}, GAME.ui=${s && s.gameUi}, overlays=[${s ? s.overlays.join(',') : ''}], top=${s && s.top}${full ? ', full probe' : ''})`;
  }
}

function describe(op) {
  const at = t => (t.sel ? `${t.sel}${t.dx || t.dy ? `${t.dx >= 0 ? '+' : ''}${t.dx},${t.dy >= 0 ? '+' : ''}${t.dy}` : ''}` : `(${t.x},${t.y})`);
  switch (op.k) {
    case 'goto': return `goto ${op.query || '(no query)'} @${op.w}x${op.h}`;
    case 'tap': return `${op.touch ? 'touch-' : ''}tap ${at(op)}`;
    case 'tapxy': return `${op.touch ? 'touch-' : ''}tap (${op.x},${op.y})`;
    case 'drag': return `${op.touch ? 'touch-' : ''}drag ${at(op.from)} → ${at(op.to)}${op.end === 'cancel' ? ' then pointercancel' : ''}${op.kind === 'dragOff' ? ' (off-target)' : ''}`;
    case 'long': return `${op.touch ? 'touch-' : ''}long-press ${at(op)} ${op.ms} ms`;
    case 'multi': return `${op.n}× ${op.touch ? 'touch-' : ''}tap #fire ${op.dt} ms apart`;
    case 'key': return `key ${op.key}`;
    case 'blur': return `window blur ${op.ms} ms`;
    case 'vis': return `visibility hidden ${op.ms} ms`;
    case 'resize': return `resize ${op.w}x${op.h}${op.back ? ` for ${op.ms} ms` : ''}`;
    case 'api': return op.how === 'open' ? `GAME.open('${op.name}')` : 'GAME.close()';
    case 'wait': return `wait ${op.ms} ms`;
    case 'auto': return `autopilot one show${op.match ? ' (+Match)' : ''}`;
    case 'check': return `-- check${op.full ? ' + full probe' : ''} --`;
    default: return JSON.stringify(op);
  }
}

// ---------------------------------------------------------------- session plumbing
async function openContext(browser, vp, errors, baseUrl) {
  const context = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: 1, hasTouch: vp[0] < 900 });
  await context.addInitScript(() => {
    let v = 'visible';
    Object.defineProperty(Document.prototype, 'visibilityState', { configurable: true, get() { return v; } });
    Object.defineProperty(Document.prototype, 'hidden', { configurable: true, get() { return v === 'hidden'; } });
    window.__fzSetVis = s => { v = s; document.dispatchEvent(new Event('visibilitychange')); };
  });
  const page = await context.newPage();
  const aborted = new Set();
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => { aborted.add(r.request().url()); return r.abort(); });
  page.on('pageerror', e => errors.push({ kind: 'pageerror', text: String((e && e.stack) || e) }));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const loc = (m.location() && m.location().url) || '';
    if (/fonts\.(googleapis|gstatic)\.com/.test(loc + m.text()) || aborted.has(loc)) return;
    errors.push({ kind: 'console.error', text: m.text() });
  });
  page.on('crash', () => errors.push({ kind: 'crash', text: 'the page crashed' }));
  page.on('dialog', d => { errors.push({ kind: 'dialog', text: `${d.type()} dialog: ${d.message()} (spec §11.2 forbids alert/confirm/prompt)` }); d.dismiss().catch(() => {}); });
  page.on('request', r => { const u = r.url(); if (!/^(data|blob):/.test(u) && !u.startsWith(new URL(baseUrl).origin) && !/fonts\.(googleapis|gstatic)\.com/.test(u)) errors.push({ kind: 'network', text: `unexpected request ${u}` }); });
  const cdp = await context.newCDPSession(page);
  return { context, page, cdp };
}
async function gotoAndWait(page, url) {
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  const t0 = Date.now();
  for (;;) {
    const s = await page.evaluate(pageLite);
    if (s.ui === 'BUILD' || s.ui === 'END') return null;
    if (s.overlays.includes('tap-continue')) { const p = await page.evaluate(() => { const r = document.getElementById('tap-continue').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await page.mouse.click(p.x, p.y); }
    if (Date.now() - t0 > 10000) return `boot: data-ui stayed ${JSON.stringify(s.ui)} for 10 s after load`;
    await sleep(100);
  }
}
function segmentQuery(rng, seed, n) {
  const q = new URLSearchParams();
  q.set('seed', `fz${seed}-${n}`);
  if (rng() < 0.3) { q.set('unlock', 'all'); if (rng() < 0.7) q.set('kit', ['apprentice', 'salvo', 'chemist', 'market', 'showman'][Math.floor(rng() * 5)]); }
  if (rng() < 0.2) q.set('renown', String(Math.floor(rng() * 9)));
  if (rng() < 0.3) q.set('fresh', '1');
  if (n === 0 && rng() < 0.5) q.delete('seed'); // sometimes let the game pick (first-ever run on a fresh profile)
  return q.toString();
}

function saveFailure(o, vp, seed, log, reason, extra) {
  fs.mkdirSync(o.out, { recursive: true });
  const base = path.join(o.out, `fail-${vp[0]}x${vp[1]}-s${seed}`);
  fs.writeFileSync(base + '.json', JSON.stringify({ tool: 'fuzz', version: 1, seed, viewport: vp, reason, ...extra, ops: log }, null, 1));
  return base;
}
function printFailure(reason, log, base) {
  console.log(`\n  FAILURE: ${Array.isArray(reason) ? reason.join('\n           ') : reason}`);
  console.log(`  action log since the last page load (${log.length} ops; the last 80 shown):`);
  const start = Math.max(0, log.length - 80);
  if (start > 0) console.log(`    #0 ${describe(log[0])}\n    …`);
  for (let i = start; i < log.length; i++) console.log(`    #${i} ${describe(log[i])}`);
  console.log(`  saved: ${path.relative(process.cwd(), base)}.json (+ .png)`);
  console.log(`  reproduce: node ${path.relative(process.cwd(), fileURLToPath(import.meta.url))} --replay ${path.relative(process.cwd(), base)}.json`);
}

// ---------------------------------------------------------------- fuzz one viewport
async function fuzzViewport(browser, baseUrl, vp, o, budgetMs) {
  const errors = [];
  const rng = mulberry32(strSeed(`${o.seed}:${vp[0]}x${vp[1]}`));
  const { context, page, cdp } = await openContext(browser, vp, errors, baseUrl);
  const monkey = new Monkey(page, cdp, rng, o, errors, vp);
  const deadline = Date.now() + budgetMs;
  let segment = 0, failure = null, log = [];
  try {
    while (Date.now() < deadline && !failure) {
      const query = segmentQuery(rng, o.seed, segment);
      await page.setViewportSize({ width: vp[0], height: vp[1] });
      log = [{ k: 'goto', query, w: vp[0], h: vp[1] }];
      if (o.verbose) console.log(`  segment ${segment}: ?${query}`);
      const bootErr = await gotoAndWait(page, `${baseUrl}${query ? '?' + query : ''}`);
      const early = monkey.takeErrors();
      if (bootErr || early.length) { failure = [bootErr, ...early.map(e => `${e.kind}: ${e.text.split('\n')[0]}`)].filter(Boolean); break; }
      const segEnd = Math.min(deadline, Date.now() + o.segment * 1000);
      let burst = 0;
      while (Date.now() < segEnd && !failure) {
        const n = 3 + Math.floor(rng() * 8);
        for (let i = 0; i < n && !failure; i++) {
          const op = await monkey.gen();
          log.push(op);
          monkey.cover.kinds[op.kind || op.k] = (monkey.cover.kinds[op.kind || op.k] || 0) + 1;
          if (op.gap) await sleep(op.gap);
          try { const r = await monkey.exec(op); if (r) failure = [r]; }
          catch (e) { failure = [`harness could not perform "${describe(op)}": ${e.message.split('\n')[0]}`]; }
          monkey.cover.ops++;
        }
        if (failure) break;
        burst++; monkey.cover.bursts++;
        const full = burst % o.probeEvery === 0;
        log.push({ k: 'check', full });
        const bad = await monkey.check();
        if (bad.length) { failure = bad; break; }
        const stuck = await monkey.probe(full);
        if (stuck) { failure = [stuck]; break; }
        const bad2 = await monkey.check(); // the probe's own taps must not break anything either
        if (bad2.length) { failure = bad2; break; }
      }
      segment++;
    }
    if (failure) {
      const base = saveFailure(o, vp, o.seed, log, failure, { url: baseUrl.replace(/^https?:\/\/127\.0\.0\.1:\d+/, '') });
      await page.screenshot({ path: base + '.png' }).catch(() => {});
      printFailure(failure, log, base);
    }
  } finally {
    await context.close();
  }
  return { vp, failure, cover: monkey.cover, segments: segment };
}

// ---------------------------------------------------------------- replay a saved log
async function replay(browser, baseUrl, o) {
  const saved = JSON.parse(fs.readFileSync(o.replay, 'utf8'));
  const vp = saved.viewport || [360, 740];
  const errors = [];
  const { context, page, cdp } = await openContext(browser, vp, errors, baseUrl);
  const monkey = new Monkey(page, cdp, mulberry32(1), o, errors, vp);
  console.log(`fuzz: replaying ${saved.ops.length} ops from ${path.relative(process.cwd(), o.replay)} @${vp[0]}x${vp[1]}`);
  console.log(`  recorded failure: ${[].concat(saved.reason).join(' / ')}`);
  let failure = null, i = 0;
  try {
    for (; i < saved.ops.length && !failure; i++) {
      const op = saved.ops[i];
      if (o.verbose) console.log(`    #${i} ${describe(op)}`);
      if (op.k === 'goto') { await page.setViewportSize({ width: op.w, height: op.h }); const e = await gotoAndWait(page, `${baseUrl}${op.query ? '?' + op.query : ''}`); if (e) failure = [e]; continue; }
      if (op.k === 'check') {
        const bad = await monkey.check(); if (bad.length) { failure = bad; break; }
        const stuck = await monkey.probe(op.full); if (stuck) { failure = [stuck]; break; }
        continue;
      }
      if (op.gap) await sleep(op.gap);
      try { const r = await monkey.exec(op); if (r) failure = [r]; } catch (e) { failure = [`harness: ${e.message.split('\n')[0]}`]; }
    }
    if (!failure) { const bad = await monkey.check(); if (bad.length) failure = bad; else { const st = await monkey.probe(true); if (st) failure = [st]; } }
  } finally { await context.close(); }
  if (failure) console.log(`  REPRODUCED at op #${Math.min(i, saved.ops.length - 1)}: ${failure.join(' / ')}`);
  else console.log('  did not reproduce (timing-dependent, or fixed)');
  return failure ? 1 : 0;
}

// ---------------------------------------------------------------- main
async function main() {
  const o = parseArgs(process.argv.slice(2));
  let baseUrl = o.url, server = null;
  const file = o.file || path.join(ROOT, 'index.html');
  if (!baseUrl) {
    if (!fs.existsSync(file)) { console.error(`fuzz: ${file} not found (build it first: node tools/build.mjs)`); process.exit(1); }
    ({ server, url: baseUrl } = await serve(file, o.raw));
  }
  baseUrl = baseUrl.split('?')[0];
  const browser = await chromium.launch({ headless: !o.headed });
  let exit = 0;
  try {
    if (o.replay) { exit = await replay(browser, baseUrl, o); return; }
    const per = (o.minutes * 60000) / o.vps.length;
    console.log(`fuzz: ${o.url || path.relative(process.cwd(), file)} · seed ${o.seed} · ${o.minutes} min over ${o.vps.map(v => v.join('x')).join(', ')}`);
    const results = [];
    for (const vp of o.vps) {
      console.log(`\n${vp[0]}x${vp[1]} (${(per / 60000).toFixed(2)} min)`);
      const r = await fuzzViewport(browser, baseUrl, vp, o, per);
      results.push(r);
      const c = r.cover;
      console.log(`  ${c.ops} ops in ${c.bursts} bursts · ${r.segments} page loads · ${c.runs.size} runs · ${c.lights} shows lit · furthest show ${c.maxShow}`);
      console.log(`  ui seen: ${Object.entries(c.ui).map(([k, v]) => `${k} ${v}`).join(', ')} · overlays seen: ${Object.keys(c.overlays).join(', ') || 'none'}`);
      if (o.verbose) console.log(`  op mix: ${Object.entries(c.kinds).map(([k, v]) => `${k} ${v}`).join(', ')}`);
      console.log(r.failure ? '  RESULT: FAIL' : '  RESULT: clean');
      if (r.failure) exit = 1;
    }
    console.log(exit ? '\nfuzz: FAILED' : '\nfuzz: OK (no errors, invariants held, never stuck)');
  } finally {
    await browser.close();
    if (server) server.close();
    process.exitCode = exit;
  }
}

main().catch(e => { console.error('fuzz: crashed:', (e && e.stack) || e); process.exit(1); });
