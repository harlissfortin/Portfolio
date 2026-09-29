#!/usr/bin/env node
/*
 * tools/audit/a11y.mjs: Ooh × Aah accessibility and layout audit (Chromium via Playwright)
 * =====================================================================================
 *
 * WHAT IT DOES
 *   Loads the single-file game (index.html) inside the artifact-like host wrapper
 *     <!doctype html><html lang="en"><head><meta charset="utf-8">
 *     <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
 *     </head><body> …index.html… </body></html>
 *   served from a throwaway localhost server, and audits it in Chromium at
 *   360×740, 360×640, 375×548 and 1440×900 (spec §11.2). Every finding names
 *   the offending element with a CSS selector.
 *
 *   (a) contrast   Text contrast ≥ 4.5:1, or ≥ 3:1 for large text (≥ 24 px, or bold ≥ 18.66 px).
 *                  The fg is the computed colour (× opacity). The bg is found by walking the
 *                  paint stack under the text (elementsFromPoint, then ancestors),
 *                  compositing background colours and gradient stops (worst stop wins).
 *                  Text over a <canvas>, image, SVG or painted pseudo-element is flagged
 *                  NEEDS-VISUAL, then estimated by pixel sampling a screenshot taken with
 *                  all text made transparent (p10 of the sampled ratios). Disabled controls
 *                  are exempt (WCAG 1.4.3), and text behind an open overlay is skipped.
 *   (b) names      Every button / [role=button] / input / select / link / ARIA widget has a
 *                  non-empty, non-glyph accessible name (Chromium's AX tree via CDP).
 *                  Tubes must follow the §13 pattern "Tube 3: Palm, Red circle, star 1,
 *                  Hang 2, rig Brass, fires 3rd of 6, sees 2" (cross-checked against
 *                  __game.state() and __game.config), and shop cards must carry the
 *                  full shell name (§8.1).
 *   (c) targets    Every interactive target is ≥ 44×44 CSS px, either its box or a probed
 *                  44×44 hit area around its centre (padding / pseudo-element extensions
 *                  count). Adjacent tubes are ≥ 8 px apart. Obscured target centres warn.
 *   (d) text-size  Rendered text ≥ 16 px (font-size × CSS transform scale). The larger
 *                  display text (Applause, banners, show names) passes by construction.
 *                  Glyph-only, aria-hidden decorations (pips) under 16 px are WARN, not FAIL.
 *   (e) focus      Tab walk from the top of the document. At every stop the element is shot
 *                  focused and unfocused and the pixels are diffed (focus-ring band plus
 *                  interior, with a twinkle-noise baseline), plus a computed-style diff
 *                  (outline / box-shadow / border / background). The Tab order must follow
 *                  §13: HUD → Sponsor → tubes → Crate → tools → cards → workshop → Light.
 *   (f) keyboard   Every enabled control in BUILD is a Tab stop, or reachable with the
 *                  arrow keys from its group's stop (roving tabindex). For the pause,
 *                  settings, logbook, help, inspect and end overlays: a keyboard opener
 *                  (P / Esc, pause→Settings, L, ?, I, run end); focus moves inside; Tab and
 *                  Shift+Tab stay trapped; every control inside is reachable; Esc closes it
 *                  and focus returns to the opener. The end screen focuses #run-it-back,
 *                  and Enter on it starts a new run.
 *   (g) live       #live-polite / #live-assertive exist, have the right aria-live values
 *                  and are exposed in the AX tree. A scripted show must announce the build
 *                  open ("Show N of 24 … Target N"), a purchase ("Bought …, into tube N.
 *                  N coins left") and the result ("Applause N: Ooh N times Aah N. Passed|
 *                  Missed"). The run end (and a spent rain check) is announced assertively.
 *   (h) motion     With prefers-reduced-motion: reduce emulated: GAME.reducedMotion is true,
 *                  FX runs in reduced mode (FX.stats() / data-motion), and no CSS animation
 *                  or transition runs longer than 1 ms (sampled at rest, during a show and
 *                  after a purchase). JS (WAAPI) animations of anything but opacity also
 *                  fail. The Settings "Reduced motion: On" path is checked too.
 *   (i) contrast+  The Settings High contrast control (found by name, toggled with the
 *                  keyboard) sets <html data-contrast="high">, and clearing it removes the
 *                  attribute. It also re-runs (a) in high-contrast mode and saves a screenshot.
 *   (j) greyscale  Screenshots the BUILD rack and shop under filter:grayscale(1). Each pair of
 *                  tokens that differ in colour must differ in pixels (shape plate), and
 *                  tokens of the same colour but different shells must have different
 *                  monograms. Screenshots are saved for visual review.
 *   (k) overflow   No horizontal page scroll or content wider than the viewport. #fire fully
 *                  on screen, unclipped and uncovered (BUILD and RESOLVING). No control is
 *                  off-screen outside a scroll container. No text is clipped (ellipsis
 *                  truncation is WARN unless the full text is in the control's name).
 *   (l) hover      A stylesheet scan for :hover rules that reveal content (display /
 *                  visibility / opacity / content / size on a descendant, a sibling or a
 *                  pseudo-element) with no :focus / :focus-visible / :focus-within twin,
 *                  plus title="" tooltips whose text is not in the accessible name.
 *                  JS pointerover / mouseenter listeners are listed as notes.
 *
 *   Full interactive flow (e, f, g, i, the end screen): 360×740 and 1440×900 (see --full).
 *   Layout checks (a, b, c, d, k) run at every viewport, in BUILD show 1 and BUILD show 2
 *   (with the shop). (h) runs in its own reduced-motion context. (j) and (l) run once at
 *   the primary viewport.
 *
 * USAGE
 *   node tools/audit/a11y.mjs                       # audits ../../index.html
 *   node tools/audit/a11y.mjs --file path/to/index.html
 *   options:
 *     --file <path>        page to audit (default: games/ooh-and-aah/index.html)
 *     --out <dir>          screenshots + JSON (default: games/ooh-and-aah/tools/shots/a11y)
 *     --json <path>        JSON report path (default: <out>/a11y-report.json)
 *     --viewports <list>   default 360x740,360x640,375x548,1440x900
 *     --full <list>        viewports that get the full interactive flow (default 360x740,1440x900)
 *     --checks <letters>   subset, e.g. --checks abk (default: all a–l)
 *     --query <qs>         URL flags for the page (default "fresh=1"; e.g. "fresh=1&seed=abc")
 *     --fonts              let Google Fonts load (default: aborted, so the run is offline and
 *                          deterministic; text renders in the fallback font stack)
 *     --budget <s>         total time budget in seconds (default 480). Past it, remaining
 *                          steps are skipped (SKIP, noted); a watchdog at budget + 90 s writes
 *                          the partial JSON and exits 2, so the tool never hangs.
 *     --timeout <ms>       per-wait timeout (default 15000)
 *     --keep-shots         do not delete old PNGs in --out before the run
 *     --verbose            log progress (with elapsed seconds) to stderr
 *     --details            also print every finding per check (default: grouped by owning module)
 *
 * OUTPUT
 *   stdout: a PASS/FAIL table (checks × viewports), then the findings deduplicated and grouped
 *   by owning module (src/CONTRACT.md: play, panels, end, menus, core, fx, lead = base.css /
 *   body.html, harness = this tool), each with check letter, selector, expected vs actual and
 *   where it was seen. JSON: runs[].issues[].module and byModule.
 *   <out>/a11y-report.json: the machine-readable report (every run, issue, note and screenshot).
 *   <out>/*.png: screenshots (per viewport BUILD states, RESOLVING, overlays, high contrast,
 *   greyscale rack, reduced motion).
 *   Statuses: PASS · FAIL · WARN (likely problem, needs a human) · REVIEW (needs visual
 *   inspection) · SKIP (the state was not reachable, e.g. no Sponsor offered) · ERROR (the
 *   harness could not run the check; counts as a failure).
 *   Exit code: 0 = no FAIL/ERROR, 1 = at least one FAIL/ERROR, 2 = could not start
 *   (file missing, browser failed to launch).
 *
 * DEPENDENCIES
 *   Node ≥ 18 and the globally installed Playwright + Chromium, loaded with
 *   createRequire('/opt/node22/lib/node_modules/'). It never runs `playwright install`.
 *   It edits nothing in src/ and needs no network (Google Fonts failures are ignored).
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

let chromium;
{
  const tries = ['/opt/node22/lib/node_modules/', import.meta.url];
  for (const base of tries) {
    try { chromium = createRequire(base)('playwright').chromium; if (chromium) break; } catch (e) { /* try next */ }
  }
}

/* ============================================================================
   CLI
============================================================================ */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME_DIR = path.resolve(HERE, '..', '..');
const ARGV = process.argv.slice(2);
const flag = n => ARGV.includes('--' + n);
const opt = (n, d) => { const i = ARGV.indexOf('--' + n); return i >= 0 && ARGV[i + 1] != null ? ARGV[i + 1] : d; };
if (flag('help') || flag('h')) {
  const src = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  console.log(src.slice(src.indexOf('/*'), src.indexOf('*/') + 2));
  process.exit(0);
}
const OPTS = {
  file: path.resolve(opt('file', path.join(GAME_DIR, 'index.html'))),
  out: path.resolve(opt('out', path.join(GAME_DIR, 'tools', 'shots', 'a11y'))),
  json: null,
  viewports: opt('viewports', '360x740,360x640,375x548,1440x900').split(',').map(s => s.trim()).filter(Boolean),
  full: opt('full', '360x740,1440x900').split(',').map(s => s.trim()).filter(Boolean),
  checks: new Set((opt('checks', 'abcdefghijkl')).toLowerCase().replace(/[^a-l]/g, '').split('')),
  query: opt('query', 'fresh=1'),
  fonts: flag('fonts') && !flag('no-fonts'),
  budget: Math.max(60, +opt('budget', 480) || 480),
  timeout: +opt('timeout', 15000) || 15000,
  keepShots: flag('keep-shots'),
  verbose: flag('verbose'),
};
OPTS.json = path.resolve(opt('json', path.join(OPTS.out, 'a11y-report.json')));
const want = c => OPTS.checks.has(c);
const PRIMARY = OPTS.viewports.includes('360x740') ? '360x740' : OPTS.viewports[0];

const CHECKS = {
  a: 'Text contrast ≥4.5:1 (≥3:1 large)',
  b: 'Accessible names + §13 tube labels',
  c: 'Targets ≥44×44, tube gaps ≥8px',
  d: 'UI text ≥16px',
  e: 'Visible focus + §13 Tab order',
  f: 'Keyboard reach, overlay trap/restore',
  g: 'aria-live announcements (§13)',
  h: 'prefers-reduced-motion',
  i: 'High contrast → data-contrast=high',
  j: 'Greyscale token distinctness',
  k: 'No h-scroll, #fire unclipped, no text overflow',
  l: 'No hover-only information',
};
const SEV = { SKIP: 0, PASS: 1, REVIEW: 2, WARN: 3, FAIL: 4, ERROR: 5 };
const worst = list => list.reduce((a, b) => (SEV[b] > SEV[a] ? b : a), 'SKIP');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const T0 = Date.now();
const log = (...a) => { if (OPTS.verbose) console.error(`[a11y ${((Date.now() - T0) / 1000).toFixed(0)}s]`, ...a); };
/** Seconds left in the --budget; every long loop checks it so the run stays bounded. */
const timeLeft = () => OPTS.budget - (Date.now() - T0) / 1000;
const overBudget = (reserve = 0) => timeLeft() < reserve;

/* ============================================================================
   REPORT MODEL
   run   = one check in one context (viewport + UI state), with issues.
   issue = {level: FAIL|WARN|REVIEW|INFO, sel, msg, …data}.
============================================================================ */
const REPORT = {
  tool: 'tools/audit/a11y.mjs', version: 1, generatedAt: new Date().toISOString(),
  target: OPTS.file, query: OPTS.query, browser: null, options: { ...OPTS, checks: [...OPTS.checks].join('') },
  summary: null, table: [], runs: [], screenshots: [], console: [], notes: [],
};
function record(check, vp, context, { issues = [], notes = [], stats = null, skip = null, error = null } = {}) {
  let status;
  if (error) status = 'ERROR';
  else if (skip) status = 'SKIP';
  else status = worst(['PASS', ...issues.map(i => (i.level === 'INFO' ? 'PASS' : i.level))]);
  for (const i of issues) if (!i.module) i.module = moduleOf(check, i, context);
  const run = { check, viewport: vp, context, status, issues, notes: skip ? [skip, ...notes] : notes, stats, error: error ? String(error.stack || error) : undefined };
  REPORT.runs.push(run);
  log(`${check} ${vp} ${context}: ${status}${issues.length ? ' (' + issues.length + ')' : ''}${error ? ' ' + error : ''}`);
  return run;
}
async function guard(check, vp, context, fn) {
  if (!want(check)) return null;
  try { return await fn(); } catch (e) { record(check, vp, context, { error: e }); return null; }
}
const fx = (n, d = 1) => (typeof n === 'number' && isFinite(n) ? +n.toFixed(d) : n);

/* ============================================================================
   OWNING MODULE (src/CONTRACT.md "Ownership" + "UI modules" scopes)
   Every issue gets issue.module so findings can be routed to the file owner.
============================================================================ */
const MODULE_FILES = {
  play: 'ui-play.js, play.css', panels: 'ui-panels.js, panels.css', end: 'ui-end.js, end.css',
  menus: 'ui-menus.js, menus.css', core: 'core.js', fx: 'fx.js', lead: 'base.css, body.html', harness: 'tools/audit/a11y.mjs',
};
const SCOPE_RE = [
  ['end', /#(end|run-it-back)\b|\bend overlay/],
  ['menus', /#(pause-menu|settings|logbook|help|toasts|tap-continue)\b|\b(pause|settings|logbook|help) overlay/],
  ['panels', /#(board|showlog)\b/],
  ['play', /#(hud|hud-[\w-]+|sponsor|sky-overlay|rack|tools|shop|workshop|fire|inspect)\b|\[data-(tube|card|crate|act)[=\]]|\binspect overlay|^(HUD|Sponsor|tubes|Crate|tools|cards|workshop|Light)$/],
  ['fx', /canvas#sky|^FX\b/],
];
function moduleOf(check, issue, context = '') {
  const sel = String(issue.sel || ''), msg = String(issue.msg || '');
  if (issue.level === 'ERROR' || sel === '(harness)' || sel === 'matchMedia') return 'harness';
  if (check === 'g') return /aria-live=|hidden from assistive|ignored in the accessibility|missing$/.test(msg) ? 'lead' : 'core';
  if (check === 'h' && /^GAME\./.test(sel)) return 'core';
  if (check === 'i' && sel === 'html') return 'core';
  // overlay mechanics (open focus, trap, Esc, restore) live in core's overlay stack (GAME.open/close/trapTab)
  if (check === 'f' && /focus did not move into|focus escaped|focus not restored|did not return focus|did not restore focus|Esc did not close/.test(msg)) return 'core';
  if (check === 'f' && /no keyboard path opened the (pause|logbook|help|settings)/.test(msg)) return 'menus';
  if (/^html\b|^body\b|^document\b|^#app\b/.test(sel)) return 'lead';
  for (const [m, re] of SCOPE_RE) if (re.test(sel)) return m;
  for (const [m, re] of SCOPE_RE) if (re.test(context)) return m;
  if (/^GAME\./.test(sel)) return 'core';
  return 'lead';
}

/* ============================================================================
   IN-PAGE HELPERS (serialised into the game page; must be self-contained)
============================================================================ */
function pageHelpers() {
  if (window.__A11Y && window.__A11Y.v === 7) return 'present';
  const H = { v: 7 };
  const ids = new WeakMap(), refs = new Map(); let seq = 1;
  H.reg = el => { if (!el) return 0; let i = ids.get(el); if (!i) { i = seq++; ids.set(el, i); refs.set(i, new WeakRef(el)); } return i; };
  H.get = i => { const r = refs.get(i); return r ? r.deref() || null : null; };

  /* ---------- selectors ---------- */
  const uniq = s => { try { return document.querySelectorAll(s).length === 1; } catch (e) { return false; } };
  const ATTRS = ['data-tube', 'data-crate', 'data-card', 'data-act', 'data-tab', 'data-setting', 'data-key', 'data-id', 'data-name', 'name', 'aria-label'];
  H.sel = el => {
    if (!el || el.nodeType !== 1) return el === document ? 'document' : String((el && el.nodeName) || el);
    if (el === document.documentElement) return 'html';
    if (el === document.body) return 'body';
    const one = n => {
      const tag = n.tagName.toLowerCase();
      if (n.id && /^[A-Za-z][\w-]*$/.test(n.id)) { const s = '#' + n.id; if (uniq(s)) return { s, u: true }; }
      for (const a of ATTRS) {
        if (!n.hasAttribute(a)) continue;
        const v = n.getAttribute(a);
        if (a === 'aria-label' && v.length > 48) continue;
        const s = `${tag}[${a}="${v.replace(/["\\]/g, '\\$&')}"]`;
        return { s, u: uniq(s) };
      }
      let s = tag;
      const cls = [...(n.classList || [])].filter(c => /^[A-Za-z_-][\w-]*$/.test(c) && !/^(is-|has-)/.test(c)).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      const p = n.parentElement;
      if (p) { const same = [...p.children].filter(c => c.tagName === n.tagName); if (same.length > 1) s += `:nth-of-type(${same.indexOf(n) + 1})`; }
      return { s, u: false };
    };
    const parts = []; let n = el;
    while (n && n.nodeType === 1 && n !== document.documentElement && n !== document.body) {
      const o = one(n); parts.unshift(o.s);
      if (o.u) break;
      n = n.parentElement;
      if (parts.length >= 5) break;
    }
    return parts.join(' > ');
  };
  const rectOf = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  H.rectOf = id => { const el = H.get(id); return el ? rectOf(el) : null; };

  /* ---------- colour maths ---------- */
  const cc = document.createElement('canvas'); cc.width = cc.height = 1;
  const cx = cc.getContext('2d', { willReadFrequently: true });
  const ccache = new Map();
  H.color = str => {
    str = String(str == null ? '' : str).trim();
    if (ccache.has(str)) return ccache.get(str);
    let c = null, m;
    if ((m = str.match(/^rgba?\(\s*([-\d.]+)[,\s]+([-\d.]+)[,\s]+([-\d.]+)(?:\s*[,/]\s*([-\d.]+)(%?))?\s*\)$/i))) {
      c = { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : (m[5] ? +m[4] / 100 : +m[4]) };
    } else if (!str || str === 'transparent' || str === 'none' || str === 'currentcolor') {
      c = { r: 0, g: 0, b: 0, a: 0 };
    } else if ((m = str.match(/^color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+)(%?))?\s*\)$/i))) {
      c = { r: 255 * m[1], g: 255 * m[2], b: 255 * m[3], a: m[4] === undefined ? 1 : (m[5] ? m[4] / 100 : +m[4]) };
    } else {
      cx.clearRect(0, 0, 1, 1); cx.fillStyle = 'rgba(0,0,0,0)'; cx.fillStyle = str; cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data; c = { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
    }
    for (const k of ['r', 'g', 'b']) c[k] = Math.max(0, Math.min(255, c[k] || 0));
    c.a = Math.max(0, Math.min(1, isNaN(c.a) ? 1 : c.a));
    ccache.set(str, c); return c;
  };
  H.hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('') + (c.a < 0.999 ? Math.round(c.a * 255).toString(16).padStart(2, '0') : '');
  const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  H.lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  H.ratio = (a, b) => { const x = H.lum(a), y = H.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  H.over = (t, b) => {
    const a = t.a + b.a * (1 - t.a);
    if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
    return { r: (t.r * t.a + b.r * b.a * (1 - t.a)) / a, g: (t.g * t.a + b.g * b.a * (1 - t.a)) / a, b: (t.b * t.a + b.b * b.a * (1 - t.a)) / a, a };
  };
  H.gradColors = bi => { const out = []; const re = /(rgba?\([^)]*\)|color\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|\btransparent\b|#[0-9a-fA-F]{3,8}\b)/g; let m; while ((m = re.exec(bi))) out.push(H.color(m[1])); return out; };

  /* ---------- visibility and clipping ---------- */
  H.opacityOf = el => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const v = parseFloat(getComputedStyle(n).opacity); if (!isNaN(v)) o *= v; } return o; };
  H.shown = el => {
    if (!el || !el.isConnected || el.nodeType !== 1) return false;
    if (typeof el.checkVisibility === 'function') { if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false; }
    else { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; }
    if (el.closest('[hidden]')) return false;
    const rs = el.getClientRects(); if (!rs.length) return false;
    let any = false; for (const r of rs) if (r.width > 0 && r.height > 0) { any = true; break; }
    if (!any) return false;
    return H.opacityOf(el) >= 0.02;
  };
  H.isVH = el => {
    for (let n = el; n && n.nodeType === 1 && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (/inset\(\s*50%/.test(cs.clipPath || '')) return true;
      if (cs.position === 'absolute' && /rect\(\s*0(px)?[,\s]+0(px)?[,\s]+0(px)?[,\s]+0(px)?\s*\)/.test(cs.clip || '')) return true;
      if (cs.overflow !== 'visible') { const r = n.getBoundingClientRect(); if (r.width <= 1.5 && r.height <= 1.5) return true; }
    }
    return false;
  };
  H.overlayOf = el => { const o = el && el.closest && el.closest('.overlay, .sheet, [role="dialog"], [aria-modal="true"]'); return o ? (o.id ? '#' + o.id : H.sel(o)) : null; };
  // hard = what can never be seen (overflow hidden/clip ancestors + the non-scrolling viewport);
  // soft = what is visible right now (also scroll containers' scrollports).
  H.clipOf = (el, includeSelf = false) => {
    const hard = { x0: 0, y0: 0, x1: innerWidth, y1: innerHeight }, soft = { ...hard };
    const scrollers = []; let hardBy = null;
    let fixed = !includeSelf && getComputedStyle(el).position === 'fixed';
    for (let n = includeSelf ? el : el.parentElement; n && n !== document.documentElement && !fixed; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.position === 'fixed') fixed = true;
      const ox = cs.overflowX, oy = cs.overflowY;
      if (ox === 'visible' && oy === 'visible') continue;
      const r = n.getBoundingClientRect();
      const scroll = /auto|scroll/.test(ox) || /auto|scroll/.test(oy);
      const cX = ox !== 'visible' || oy !== 'clip', cY = oy !== 'visible' || ox !== 'clip';
      const bx0 = r.left + n.clientLeft, by0 = r.top + n.clientTop, bx1 = bx0 + (n.clientWidth || r.width), by1 = by0 + (n.clientHeight || r.height);
      const apply = (b, isHard) => {
        if (cX) { if (bx0 > b.x0) { b.x0 = bx0; if (isHard) hardBy = n; } if (bx1 < b.x1) { b.x1 = bx1; if (isHard) hardBy = n; } }
        if (cY) { if (by0 > b.y0) { b.y0 = by0; if (isHard) hardBy = n; } if (by1 < b.y1) { b.y1 = by1; if (isHard) hardBy = n; } }
      };
      apply(soft, false);
      if (scroll) scrollers.push(H.sel(n)); else if (n !== document.body) apply(hard, true);
    }
    return { hard, soft, scrollers, hardBy: hardBy ? H.sel(hardBy) : 'viewport' };
  };
  const inter = (r, b) => { const x0 = Math.max(r.x, b.x0), y0 = Math.max(r.y, b.y0), x1 = Math.min(r.x + r.w, b.x1), y1 = Math.min(r.y + r.h, b.y1); return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null; };
  // effective scale of rendered text: the composed CSS transforms / scale / zoom of el and its ancestors.
  H.scaleOf = el => {
    let s = 1;
    try {
      if (el instanceof SVGGraphicsElement && el.getScreenCTM) { const m = el.getScreenCTM(); return m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1 : 1; }
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.transform && cs.transform !== 'none') { const m = new DOMMatrixReadOnly(cs.transform); const d = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)); if (d > 0) s *= d; }
        if (cs.scale && cs.scale !== 'none') { const p = cs.scale.split(/\s+/).map(parseFloat).filter(x => !isNaN(x)); if (p.length) s *= Math.sqrt(Math.abs(p[0] * (p.length > 1 ? p[1] : p[0]))); }
        const z = parseFloat(cs.zoom); if (z && z !== 1) s *= z;
      }
    } catch (e) { /* ignore */ }
    return s;
  };
  // text-shadow / -webkit-text-stroke halo: best contrast of fg against a tight, opaque-ish halo colour.
  H.halo = (cs, fg) => {
    let best = null;
    const ts = cs.textShadow;
    if (ts && ts !== 'none') {
      for (const part of ts.split(/,(?![^(]*\))/)) {
        const cm = part.match(/(rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-fA-F]{3,8})/);
        const nums = part.replace(cm ? cm[0] : '', '').trim().split(/\s+/).map(parseFloat).filter(x => !isNaN(x));
        if (!cm) continue;
        const c = H.color(cm[1]); const [ox = 0, oy = 0, blur = 0] = nums;
        if (c.a < 0.5 || blur > 4 || Math.abs(ox) > 3 || Math.abs(oy) > 3) continue;
        const r = H.ratio(fg, H.over(c, { r: 0, g: 0, b: 0, a: 1 }));
        if (!best || r > best.ratio) best = { ratio: r, color: H.hex(c), kind: 'text-shadow' };
      }
    }
    const sw = parseFloat(cs.webkitTextStrokeWidth);
    if (sw >= 0.5) { const c = H.color(cs.webkitTextStrokeColor); if (c.a >= 0.5) { const r = H.ratio(fg, c); if (!best || r > best.ratio) best = { ratio: r, color: H.hex(c), kind: 'text-stroke' }; } }
    return best;
  };

  /* ---------- background resolution ---------- */
  H.layersOf = n => {
    const cs = getComputedStyle(n), op = H.opacityOf(n), out = { layers: [] };
    const bi = cs.backgroundImage;
    if (bi && bi !== 'none') {
      if (/url\(|image-set\(|element\(|cross-fade\(|paint\(/.test(bi)) out.image = true;
      else { const cols = H.gradColors(bi).map(c => ({ ...c, a: c.a * op })); if (cols.length) out.layers.push({ grad: cols }); }
    }
    const bc = H.color(cs.backgroundColor);
    if (bc.a > 0) out.layers.push({ c: { ...bc, a: bc.a * op } });
    for (const p of ['::before', '::after']) {
      const ps = getComputedStyle(n, p);
      if (!ps || ps.content === 'none' || ps.content === 'normal' || ps.display === 'none') continue;
      if (H.color(ps.backgroundColor).a > 0.05 || (ps.backgroundImage && ps.backgroundImage !== 'none')) { out.pseudo = p; break; }
    }
    return out;
  };
  H.paints = o => {
    const t = o.tagName.toUpperCase();
    if (['CANVAS', 'IMG', 'VIDEO', 'IFRAME', 'OBJECT', 'EMBED'].includes(t)) return true;
    if (o instanceof SVGElement) return t !== 'SVG' && t !== 'G';
    const L = H.layersOf(o);
    return !!L.image || L.layers.some(l => (l.c ? l.c.a > 0.05 : l.grad.some(g => g.a > 0.05)));
  };
  H.opaque = layers => { let tr = 1; for (const l of layers) { const a = l.c ? l.c.a : Math.min(...l.grad.map(g => g.a)); tr *= (1 - a); } return tr < 0.004; };
  H.cands = layers => {
    let c = [{ r: 255, g: 255, b: 255, a: 1 }];
    for (let k = layers.length - 1; k >= 0; k--) {
      const L = layers[k];
      if (L.c) c = c.map(b => H.over(L.c, b));
      else { const nx = []; for (const b of c) for (const g of L.grad) nx.push(H.over(g, b)); const seen = new Set(); c = nx.filter(x => { const k2 = H.hex(x); if (seen.has(k2)) return false; seen.add(k2); return true; }).slice(0, 24); }
    }
    return c;
  };
  const walkLayers = (el, nodes, startIdx) => {
    const layers = [], via = [];
    for (let k = startIdx; k < nodes.length; k++) {
      const n = nodes[k];
      if (n !== el && el.contains(n)) continue;
      if (n !== el) {
        const t = n.tagName.toUpperCase();
        if (['CANVAS', 'IMG', 'VIDEO', 'IFRAME', 'OBJECT', 'EMBED'].includes(t)) return { kind: t.toLowerCase(), layers, via, at: H.sel(n) };
        if (n instanceof SVGElement && !n.contains(el) && t !== 'SVG' && t !== 'G') return { kind: 'svg', layers, via, at: H.sel(n) };
      }
      const L = H.layersOf(n);
      if (L.image) return { kind: 'image', layers, via, at: H.sel(n) };
      if (L.pseudo) return { kind: 'pseudo', layers, via, at: H.sel(n) + L.pseudo };
      if (L.layers.length) { layers.push(...L.layers); via.push(H.sel(n)); }
      if (H.opaque(layers)) break;
    }
    return { kind: 'css', layers, via };
  };
  H.bgAt = (el, x, y) => {
    const stack = document.elementsFromPoint(x, y);
    const i = stack.indexOf(el);
    if (i < 0) return { kind: 'notfound' };
    for (let k = 0; k < i; k++) { const o = stack[k]; if (el.contains(o) || o.contains(el)) continue; if (H.paints(o)) return { kind: 'covered', by: H.sel(o) }; }
    return walkLayers(el, stack, i);
  };
  H.bgAncestors = el => { const chain = []; for (let n = el; n && n.nodeType === 1; n = n.parentElement) chain.push(n); return walkLayers(el, chain, 0); };

  /* ---------- text items: (a) contrast, (d) size, (k) clipping ---------- */
  H.collectText = scope => {
    const root = scope ? document.querySelector(scope) : document.body;
    if (!root) return { items: [], error: 'scope not found: ' + scope };
    const map = new Map();
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let t; (t = tw.nextNode());) {
      if (!/\S/.test(t.nodeValue)) continue;
      const el = t.parentElement;
      if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE|OPTION|OPTGROUP)$/i.test(el.tagName)) continue;
      if (el.closest('#__a11y_sentinel, #debug, #sim-out')) continue;
      if (!map.has(el)) map.set(el, []);
      map.get(el).push(t);
    }
    const items = [];
    for (const [el, texts] of map) {
      if (!H.shown(el) || H.isVH(el)) continue;
      if (!scope) { const ov = el.closest('.overlay, .sheet, [role="dialog"]'); if (ov && ov !== root && H.shown(ov)) continue; }
      const rects = [];
      for (const t of texts) { const rg = document.createRange(); rg.selectNodeContents(t); for (const r of rg.getClientRects()) if (r.width >= 1 && r.height >= 1) rects.push({ x: r.left, y: r.top, w: r.width, h: r.height }); }
      if (!rects.length) continue;
      const clip = H.clipOf(el, true);
      const fsz = parseFloat(getComputedStyle(el).fontSize) || 16;
      // approximate the ink box: the text content area includes ascent/descent padding
      const ink = rects.map(r => ({ x: r.x + 0.5, y: r.y + Math.min(0.14 * fsz, r.h * 0.2), w: Math.max(1, r.w - 1), h: Math.max(1, r.h - 2 * Math.min(0.14 * fsz, r.h * 0.2)) }));
      const area = ink.reduce((s, r) => s + r.w * r.h, 0);
      const hardVis = ink.map(r => inter(r, clip.hard)).filter(Boolean);
      const softVis = rects.map(r => inter(r, clip.soft)).filter(Boolean);
      const hardFrac = hardVis.reduce((s, r) => s + r.w * r.h, 0) / area;
      if (!hardVis.length) continue; // never visible (slid out / clipped away)
      const cs = getComputedStyle(el);
      const isSvg = el instanceof SVGElement;
      let fg = H.color(isSvg ? cs.fill : cs.color);
      let textClip = false;
      if (!isSvg) {
        const tf = cs.webkitTextFillColor;
        if (tf && tf !== cs.color) { const t = H.color(tf); if (t.a === 0 && /text/.test(cs.webkitBackgroundClip || cs.backgroundClip || '')) textClip = true; else if (t.a > 0) fg = t; }
      }
      const op = H.opacityOf(el);
      const fgA = { ...fg, a: fg.a * op };
      const size = parseFloat(cs.fontSize) || 16, weight = parseInt(cs.fontWeight, 10) || 400;
      const scale = H.scaleOf(el), eff = size * scale;
      const large = eff >= 24 || (weight >= 700 && eff >= 18.66);
      const text = texts.map(t => t.nodeValue).join(' ').replace(/\s+/g, ' ').trim();
      const it = {
        id: H.reg(el), sel: H.sel(el), text: text.slice(0, 80), fg: fgA, fgHex: H.hex(fgA), size, eff, weight, large, required: large ? 3 : 4.5,
        disabled: !!el.closest('button:disabled, [aria-disabled="true"], fieldset:disabled, input:disabled, select:disabled, textarea:disabled'),
        ariaHidden: !!el.closest('[aria-hidden="true"]'), glyphOnly: !/[\p{L}\p{N}]/u.test(text), overlay: H.overlayOf(el),
        rects: softVis.slice(0, 12), hardFrac, halo: H.halo(cs, fgA), clipBy: hardFrac < 0.98 ? clip.hardBy : null, scrollers: clip.scrollers,
        textOverflow: cs.textOverflow, lineClamp: cs.webkitLineClamp, whiteSpace: cs.whiteSpace,
      };
      if (hardFrac < 0.98) {
        // is the clipping element (or el) set to ellipsis / line-clamp?
        let ell = cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none');
        for (let n = el.parentElement; n && !ell && n !== document.body; n = n.parentElement) {
          const pcs = getComputedStyle(n);
          if (pcs.overflow !== 'visible' && (pcs.textOverflow === 'ellipsis' || (pcs.webkitLineClamp && pcs.webkitLineClamp !== 'none'))) ell = true;
          if (H.sel(n) === clip.hardBy) break;
        }
        it.ellipsis = !!ell;
        const host = el.closest('button, [role="button"], a, [aria-label], [title], [role="tab"], label');
        const lab = host ? ((host.getAttribute('aria-label') || '') + ' ' + (host.getAttribute('title') || '')).toLowerCase() : '';
        it.fullInName = !!(lab.trim() && lab.includes(text.toLowerCase().slice(0, 40)));
      }
      // spill: text wider than its own box with overflow visible
      if (cs.overflowX === 'visible' && cs.display !== 'inline' && !isSvg) {
        const b = el.getBoundingClientRect();
        const out = rects.some(r => r.x < b.left - 2 || r.x + r.w > b.right + 2);
        if (out) it.spill = true;
      }
      // background
      if (textClip) it.bg = { kind: 'text-clip', at: it.sel };
      else {
        const pts = [];
        for (const r of softVis.slice(0, 4)) {
          const y = r.y + r.h / 2;
          if (r.w > 24) pts.push([r.x + r.w * 0.25, y], [r.x + r.w * 0.75, y]); else pts.push([r.x + r.w / 2, y]);
        }
        const inView = ([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight;
        const res = pts.filter(inView).map(([x, y]) => H.bgAt(el, x, y)).filter(r => r.kind !== 'notfound');
        let chosen = res.filter(r => r.kind !== 'covered');
        let method = 'stack';
        if (!res.length) { chosen = [H.bgAncestors(el)]; method = 'ancestors'; }
        if (res.length && !chosen.length) { it.covered = res[0].by; }
        else {
          const nonCss = chosen.find(r => r.kind !== 'css');
          if (nonCss) it.bg = { kind: nonCss.kind, at: nonCss.at, method };
          else {
            let best = null;
            for (const r of chosen) for (const b of H.cands(r.layers)) {
              const ratio = H.ratio(H.over(fgA, b), b);
              if (!best || ratio < best.ratio) best = { ratio, bg: H.hex(b), via: r.via.slice(0, 3) };
            }
            it.bg = { kind: 'css', method, ratio: best ? best.ratio : null, bgHex: best ? best.bg : null, via: best ? best.via : [] };
          }
        }
      }
      items.push(it);
    }
    return { items };
  };

  /* ---------- controls: (b) names, (c) targets, (f) reachability ---------- */
  H.INTERACTIVE = 'button, [role="button"], a[href], input:not([type="hidden"]), select, textarea, summary, [role="switch"], [role="checkbox"], [role="radio"], [role="tab"], [role="slider"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [role="link"], [role="spinbutton"], [role="combobox"], [tabindex]:not([tabindex="-1"])';
  H.groupOf = el => {
    if (!el || !el.closest) return 'other';
    if (el.matches('[data-crate]')) return 'Crate';
    if (el.closest('#hud')) return 'HUD';
    if (el.closest('#sponsor') || el.matches('[data-act="sponsor"]')) return 'Sponsor';
    if (el.matches('[data-tube]') || el.closest('#rack')) return 'tubes';
    if (el.closest('#tools')) return 'tools';
    if (el.matches('[data-card]') || el.closest('#shop')) return 'cards';
    if (el.closest('#workshop')) return 'workshop';
    if (el.matches('#fire') || el.closest('#firebar')) return 'Light';
    const c = el.closest('[id]');
    return 'other' + (c ? ':#' + c.id : '');
  };
  H.controls = scope => {
    const root = scope ? document.querySelector(scope) : document.body;
    if (!root) return [];
    const out = [];
    for (const el of root.querySelectorAll(H.INTERACTIVE)) {
      if (el.id === '__a11y_sentinel' || el.closest('#debug, #sim-out')) continue;
      const labels = el.labels ? [...el.labels].filter(l => H.shown(l)) : [];
      const shown = H.shown(el);
      if (!shown) {
        if (!(el.tagName === 'INPUT' && labels.length)) continue;
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      }
      if (el.closest('[hidden]')) continue;
      if (!scope) { const ov = el.closest('.overlay, .sheet, [role="dialog"]'); if (ov && H.shown(ov)) continue; }
      if (el.matches('.overlay, .sheet, [role="dialog"]')) continue; // dialog roots with tabindex are not controls
      out.push({
        id: H.reg(el), sel: H.sel(el), tag: el.tagName.toLowerCase(), type: el.getAttribute('type') || null, role: el.getAttribute('role'),
        disabled: !!(el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('fieldset:disabled')), nativeDisabled: !!el.disabled,
        hiddenInput: !shown, labelRects: labels.map(rectOf), rect: rectOf(el), group: H.groupOf(el), overlay: H.overlayOf(el),
        tabIndex: el.tabIndex, name: el.getAttribute('name'), ariaLabel: el.getAttribute('aria-label'), title: el.getAttribute('title'),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
        data: { tube: el.dataset ? el.dataset.tube : undefined, card: el.dataset ? el.dataset.card : undefined, crate: el.dataset ? el.dataset.crate : undefined, act: el.dataset ? el.dataset.act : undefined },
        inTablist: !!el.closest('[role="tablist"], [role="radiogroup"], [role="menu"], [role="listbox"], [role="toolbar"], [role="grid"]'),
        groupSel: (() => { const g = el.closest('[role="tablist"], [role="radiogroup"], [role="menu"], [role="listbox"], [role="toolbar"], [role="grid"], #rack, #tools, #shop, #workshop'); return g ? H.sel(g) : null; })(),
      });
    }
    return out;
  };
  // JS fallback when CDP is unavailable: a reduced accname.
  H.accName = el => {
    const txt = n => { if (n.nodeType === 3) return n.nodeValue; if (n.nodeType !== 1) return ''; if (n.getAttribute('aria-hidden') === 'true') return ''; if (n.getAttribute('aria-label')) return n.getAttribute('aria-label'); if (n.tagName === 'IMG') return n.getAttribute('alt') || ''; return [...n.childNodes].map(txt).join(' '); };
    const lb = el.getAttribute('aria-labelledby');
    if (lb) return lb.split(/\s+/).map(i => document.getElementById(i)).filter(Boolean).map(txt).join(' ').replace(/\s+/g, ' ').trim();
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').trim();
    if (el.labels && el.labels.length) return [...el.labels].map(txt).join(' ').replace(/\s+/g, ' ').trim();
    if (el.tagName === 'INPUT' && /^(button|submit|reset)$/.test(el.type)) return el.value;
    const t = txt(el).replace(/\s+/g, ' ').trim();
    return t || (el.getAttribute('title') || '').trim();
  };
  H.targets = scope => {
    const res = [];
    for (const c of H.controls(scope)) {
      const el = H.get(c.id);
      const union = rs => { const x0 = Math.min(...rs.map(r => r.x)), y0 = Math.min(...rs.map(r => r.y)), x1 = Math.max(...rs.map(r => r.x + r.w)), y1 = Math.max(...rs.map(r => r.y + r.h)); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; };
      let r = c.rect;
      if (c.hiddenInput && c.labelRects.length) r = union(c.labelRects);
      else if (c.labelRects.length && /^(checkbox|radio)$/.test(c.type || '')) r = union([c.rect, ...c.labelRects]);
      const labs = el.labels ? [...el.labels] : [];
      const hitOk = h => !!h && (h === el || el.contains(h) || labs.some(l => l === h || l.contains(h)));
      const ok = r.w >= 43.5 && r.h >= 43.5;
      let extended = false, probe = null;
      const cxp = r.x + r.w / 2, cyp = r.y + r.h / 2;
      if (!ok) {
        let hits = 0, total = 0;
        for (const dx of [-21, 0, 21]) for (const dy of [-21, 0, 21]) {
          const x = cxp + dx, y = cyp + dy;
          if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
          total++; if (hitOk(document.elementFromPoint(x, y))) hits++;
        }
        extended = total >= 6 && hits === total; probe = { hits, total };
      }
      let covered = null;
      if (cxp >= 0 && cyp >= 0 && cxp < innerWidth && cyp < innerHeight) { const h = document.elementFromPoint(cxp, cyp); if (!hitOk(h)) covered = h ? H.sel(h) : '(nothing)'; }
      res.push({ sel: c.sel, group: c.group, w: r.w, h: r.h, ok, extended, probe, covered, disabled: c.disabled });
    }
    const tubes = [...document.querySelectorAll('button[data-tube], [role="button"][data-tube]')].filter(H.shown)
      .map(el => ({ sel: H.sel(el), r: el.getBoundingClientRect() })).sort((a, b) => a.r.left - b.r.left);
    const gaps = [];
    for (let k = 1; k < tubes.length; k++) {
      const a = tubes[k - 1], b = tubes[k];
      if (Math.abs(a.r.top - b.r.top) > Math.min(a.r.height, b.r.height) / 2) continue;
      gaps.push({ a: a.sel, b: b.sel, gap: b.r.left - a.r.right });
    }
    return { targets: res, gaps, tubeCount: tubes.length };
  };

  /* ---------- (k) layout ---------- */
  H.overflow = (scope, o = {}) => {
    const out = { hscroll: null, beyond: [], offscreen: [], fire: null };
    const se = document.scrollingElement || document.documentElement;
    const x0 = window.scrollX; window.scrollTo(100000, window.scrollY); const sx = window.scrollX; window.scrollTo(x0, window.scrollY);
    out.hscroll = { docScrollWidth: se.scrollWidth, docClientWidth: se.clientWidth, bodyScrollWidth: document.body.scrollWidth, bodyClientWidth: document.body.clientWidth, innerWidth, scrolledTo: sx };
    const root = scope ? document.querySelector(scope) : document.body;
    if (root) {
      const reported = [];
      for (const el of root.querySelectorAll('*')) {
        if (el.id === '__a11y_sentinel' || reported.some(p => p.contains(el))) continue;
        if (!H.shown(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right <= innerWidth + 1 && r.left >= -1) continue;
        const c = H.clipOf(el);
        if (c.hard.x1 <= innerWidth + 1 && c.hard.x0 >= -1 && c.hardBy !== 'viewport') continue; // clipped by an ancestor inside the viewport
        if (c.scrollers.length) continue;
        reported.push(el);
        out.beyond.push({ sel: H.sel(el), left: r.left, right: r.right, width: r.width });
        if (out.beyond.length > 30) break;
      }
      for (const c of H.controls(scope)) {
        const el = H.get(c.id); if (!el || c.hiddenInput) continue;
        const cl = H.clipOf(el);
        const r = c.rect, area = r.w * r.h;
        const vis = inter(r, cl.hard);
        const frac = vis ? (vis.w * vis.h) / area : 0;
        if (frac < 0.99 && !cl.scrollers.length) out.offscreen.push({ sel: c.sel, rect: r, visibleFrac: frac, clipBy: cl.hardBy });
      }
    }
    if (o.fire) {
      const f = document.getElementById('fire');
      if (!f) out.fire = { exists: false };
      else {
        const r = f.getBoundingClientRect(), cl = H.clipOf(f);
        const pts = [[r.left + 4, r.top + 4], [r.right - 4, r.top + 4], [r.left + 4, r.bottom - 4], [r.right - 4, r.bottom - 4], [r.left + r.width / 2, r.top + r.height / 2]];
        const coveredBy = [];
        for (const [x, y] of pts) {
          if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) { coveredBy.push('(off-screen)'); continue; }
          const h = document.elementFromPoint(x, y);
          if (!h || !(h === f || f.contains(h))) coveredBy.push(h ? H.sel(h) : '(nothing)');
        }
        out.fire = {
          exists: true, shown: H.shown(f), rect: { x: r.left, y: r.top, w: r.width, h: r.height }, text: (f.textContent || '').trim(),
          inView: r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5,
          inClip: r.left >= cl.soft.x0 - 0.5 && r.right <= cl.soft.x1 + 0.5 && r.top >= cl.soft.y0 - 0.5 && r.bottom <= cl.soft.y1 + 0.5,
          clipBy: cl.hardBy, coveredBy: [...new Set(coveredBy)],
        };
      }
    }
    return out;
  };

  /* ---------- (e) focus ---------- */
  H.focusInfo = scope => {
    const a = document.activeElement;
    const inside = scope ? !!(document.querySelector(scope) && a && document.querySelector(scope).contains(a)) : null;
    if (!a || a === document.body || a === document.documentElement) return { isBody: true, inside };
    if (a.id === '__a11y_sentinel') return { isSentinel: true, id: H.reg(a), inside };
    const r = a.getBoundingClientRect();
    return {
      id: H.reg(a), sel: H.sel(a), tag: a.tagName.toLowerCase(), group: H.groupOf(a), rect: { x: r.left, y: r.top, w: r.width, h: r.height },
      fv: a.matches(':focus-visible'), name: H.accName(a).slice(0, 80), overlay: H.overlayOf(a), inside,
      activedescendant: a.getAttribute('aria-activedescendant'), role: a.getAttribute('role'), type: a.getAttribute('type'),
    };
  };
  H.focusStyle = el => {
    const cs = getComputedStyle(el), a = getComputedStyle(el, '::after'), b = getComputedStyle(el, '::before');
    return {
      outlineStyle: cs.outlineStyle, outlineWidth: parseFloat(cs.outlineWidth) || 0, outlineColor: cs.outlineColor, outlineAlpha: H.color(cs.outlineColor).a,
      boxShadow: cs.boxShadow, border: [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor, cs.borderTopWidth].join(' '),
      bg: cs.backgroundColor + ' ' + cs.backgroundImage, color: cs.color, deco: cs.textDecorationLine, transform: cs.transform, filter: cs.filter,
      pseudo: [a.content, a.outlineStyle, a.boxShadow, a.borderTopColor, a.backgroundColor, a.opacity, b.content, b.outlineStyle, b.boxShadow, b.borderTopColor, b.backgroundColor, b.opacity].join('|'),
    };
  };
  H.prepFocus = id => {
    const el = H.get(id);
    if (!el || !H.shown(el)) return null;
    try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* ignore */ }
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    return { rect: rectOf(el), style: H.focusStyle(el), stillFocused: document.activeElement === el };
  };
  H.doFocus = id => {
    const el = H.get(id); if (!el) return null;
    try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    return { focused: document.activeElement === el, fv: el.matches(':focus-visible'), style: H.focusStyle(el), rect: rectOf(el) };
  };
  H.blurActive = () => { const a = document.activeElement; if (a && a !== document.body) a.blur(); return document.activeElement === document.body || !document.activeElement; };
  H.focusId = id => { const el = H.get(id); if (!el) return false; el.focus(); return document.activeElement === el; };
  H.focusSel = s => { const el = document.querySelector(s); if (!el) return false; el.focus(); return document.activeElement === el; };
  H.sentinel = on => {
    let s = document.getElementById('__a11y_sentinel');
    if (on) {
      if (!s) { s = document.createElement('button'); s.id = '__a11y_sentinel'; s.type = 'button'; s.textContent = 'audit start'; s.setAttribute('aria-hidden', 'true'); s.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1'; document.body.insertBefore(s, document.body.firstChild); }
      s.focus(); return document.activeElement === s;
    }
    if (s) s.remove(); return true;
  };

  /* ---------- game info ---------- */
  H.gameInfo = () => {
    let st = null, cfg = null, data = null, game = null;
    try { st = window.__game && typeof __game.state === 'function' ? __game.state() : null; } catch (e) { /* ignore */ }
    try { cfg = window.__game && __game.config ? __game.config : null; } catch (e) { /* ignore */ }
    try { data = typeof OOH !== 'undefined' && OOH && OOH.DATA ? OOH.DATA : null; } catch (e) { /* ignore */ }
    try { game = typeof GAME !== 'undefined' ? GAME : (window.__game && __game.game) || null; } catch (e) { game = (window.__game && __game.game) || null; }
    const tbl = k => (cfg && cfg[k]) || (data && data[k]) || null;
    const nameOf = (t, id) => {
      if (!t || id == null) return null;
      let r = null;
      if (Array.isArray(t)) r = t.find(x => x && (x.id === id || x.key === id)); else r = t[id];
      if (!r) return null;
      if (typeof r === 'string') return r;
      return r.name || r.title || r.label || null;
    };
    let shellName = id => nameOf(tbl('SHELLS'), id), rigName = id => nameOf(tbl('RIGS'), id);
    try { if (game && game.label && typeof game.label.shell === 'function') { const f = game.label.shell; shellName = id => { try { return f(id) || nameOf(tbl('SHELLS'), id); } catch (e) { return nameOf(tbl('SHELLS'), id); } }; } } catch (e) { /* ignore */ }
    const out = { hasHooks: !!window.__game, coins: st ? st.coins : null, show: st ? st.show : null, phase: st ? st.phase : null, tubes: [], cards: [], crate: [] };
    if (st) {
      (st.tubes || []).forEach((t, i) => {
        const sh = t && t.shell;
        out.tubes.push({ i, shell: sh ? { id: sh.id, col: sh.col, star: sh.star, name: shellName(sh.id) } : null, rig: t && t.rig ? { id: t.rig, name: rigName(t.rig) } : null });
      });
      (st.crate || []).forEach((sh, i) => out.crate.push({ i, shell: sh ? { id: sh.id, col: sh.col, star: sh.star, name: shellName(sh.id) } : null }));
      ((st.shop && st.shop.cards) || []).forEach((c, i) => out.cards.push(c ? { i, id: c.id, col: c.col, cost: c.cost, sold: !!c.sold, name: shellName(c.id) } : { i, sold: true }));
    }
    return out;
  };
  H.ui = () => {
    const app = document.getElementById('app');
    let top = null, show = null, phase = null, coins = null, uiApi = null;
    try { const g = typeof GAME !== 'undefined' ? GAME : (window.__game && __game.game); if (g && typeof g.top === 'function') top = g.top(); if (g) uiApi = g.ui; } catch (e) { /* ignore */ }
    try { if (window.__game && typeof __game.state === 'function') { const s = __game.state(); if (s) { show = s.show; phase = s.phase; coins = s.coins; } } } catch (e) { /* ignore */ }
    return { ui: app ? app.getAttribute('data-ui') : null, uiApi, top, show, phase, coins, hooks: !!window.__game };
  };
  H.game = (method, ...args) => {
    let g = null;
    try { g = typeof GAME !== 'undefined' ? GAME : null; } catch (e) { /* ignore */ }
    if (!g && window.__game) g = __game.game || null;
    if (!g || typeof g[method] !== 'function') return { ok: false, err: 'GAME.' + method + ' unavailable' };
    try { const r = g[method](...args); return { ok: true, r: r && typeof r === 'object' ? true : r }; } catch (e) { return { ok: false, err: String(e) }; }
  };

  /* ---------- (h) motion ---------- */
  H.animations = () => document.getAnimations().map(a => {
    let t = {}; try { t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : {}; } catch (e) { /* ignore */ }
    const target = a.effect && a.effect.target;
    let props = [];
    try { props = [...new Set((a.effect.getKeyframes() || []).flatMap(k => Object.keys(k).filter(p => !['offset', 'computedOffset', 'easing', 'composite'].includes(p))))]; } catch (e) { /* ignore */ }
    return {
      kind: a.constructor && a.constructor.name, name: a.animationName || a.transitionProperty || a.id || '',
      target: target ? H.sel(target) + ((a.effect && a.effect.pseudoElement) || '') : '(none)',
      duration: typeof t.duration === 'number' ? t.duration : null, iterations: t.iterations, playState: a.playState, props,
    };
  });
  H.motionState = () => {
    const r = { mq: matchMedia('(prefers-reduced-motion: reduce)').matches, dataMotion: document.documentElement.getAttribute('data-motion') };
    try { const g = typeof GAME !== 'undefined' ? GAME : (window.__game && __game.game); if (g) { r.gameReduced = g.reducedMotion; r.setting = g.settings ? g.settings.reducedMotion : undefined; } } catch (e) { /* ignore */ }
    try {
      if (typeof FX !== 'undefined' && FX && typeof FX.stats === 'function') {
        const s = FX.stats(); r.fxStats = {};
        const find = (o, d) => { if (!o || typeof o !== 'object' || d > 2) return; for (const [k, v] of Object.entries(o)) { if (/reduc/i.test(k) && typeof v !== 'object') { r.fxReduced = v; r.fxKey = k; } if (v && typeof v === 'object') find(v, d + 1); } };
        find(s, 0);
        for (const [k, v] of Object.entries(s || {})) if (typeof v !== 'object') r.fxStats[k] = v;
      } else r.fxStats = null;
    } catch (e) { r.fxErr = String(e); }
    return r;
  };

  /* ---------- (j) tokens ---------- */
  H.tokens = () => {
    const info = H.gameInfo();
    const pick = btn => {
      const tok = [...btn.querySelectorAll('[class*="token"]')].filter(H.shown);
      const pool = tok.length ? tok : [...btn.querySelectorAll('canvas, svg, [class*="plate"], [class*="shape"], [class*="picto"]')].filter(H.shown);
      let best = null, ba = 0;
      for (const c of pool) { const r = c.getBoundingClientRect(); const a = r.width * r.height; if (r.width >= 18 && r.height >= 18 && a > ba) { best = c; ba = a; } }
      return best || btn;
    };
    const mono = el => {
      const texts = [];
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let t; (t = tw.nextNode());) { const v = t.nodeValue.trim(); if (/^[A-Z][A-Za-z0-9]{0,2}$/.test(v) && t.parentElement && H.shown(t.parentElement)) texts.push(v); }
      return texts.find(v => v.length === 2) || texts[0] || null;
    };
    const shapeHint = el => {
      const s = [el, ...el.querySelectorAll('*')].map(n => ((n.getAttribute && (n.getAttribute('data-shape') || n.getAttribute('data-col'))) || '') + ' ' + (typeof n.className === 'string' ? n.className : '')).join(' ');
      const m = s.match(/\b(circle|triangle|square|diamond|cross|star)\b/i); return m ? m[1].toLowerCase() : null;
    };
    const out = [];
    for (const btn of document.querySelectorAll('button[data-tube], [data-tube][role="button"]')) {
      if (!H.shown(btn)) continue;
      const i = +btn.dataset.tube; const t = info.tubes[i];
      if (!t || !t.shell) continue;
      const tk = pick(btn); const r = tk.getBoundingClientRect();
      out.push({ kind: 'tube', i, sel: H.sel(btn), tokenSel: H.sel(tk), rect: { x: r.left, y: r.top, w: r.width, h: r.height }, id: t.shell.id, col: t.shell.col, star: t.shell.star, name: t.shell.name, monogram: mono(tk) || mono(btn), shape: shapeHint(btn) });
    }
    for (const btn of document.querySelectorAll('button[data-card], [data-card][role="button"]')) {
      if (!H.shown(btn)) continue;
      const i = +btn.dataset.card; const c = info.cards[i];
      if (!c || c.sold || !c.id) continue;
      const tk = pick(btn); const r = tk.getBoundingClientRect();
      out.push({ kind: 'card', i, sel: H.sel(btn), tokenSel: H.sel(tk), rect: { x: r.left, y: r.top, w: r.width, h: r.height }, id: c.id, col: c.col, name: c.name, monogram: mono(tk) || mono(btn), shape: shapeHint(btn) });
    }
    return out;
  };

  /* ---------- (l) hover ---------- */
  H.hoverScan = () => {
    const out = { rules: [], cosmetic: 0, total: 0, titles: [], unreadable: [] };
    const REVEAL = /^(display|visibility|opacity|content|max-height|height|max-width|width|clip|clip-path|inset|top|left|right|bottom|overflow|overflow-x|overflow-y|-webkit-line-clamp|pointer-events)$/;
    const all = [];
    const walk = (rules, media) => {
      for (const r of rules) {
        if (r instanceof CSSStyleRule) { all.push({ r, media }); if (r.cssRules && r.cssRules.length) walk(r.cssRules, media); }
        else if (r.cssRules) walk(r.cssRules, (r.conditionText || (r.media && r.media.mediaText) || media || ''));
      }
    };
    for (const sh of document.styleSheets) { try { walk(sh.cssRules, ''); } catch (e) { out.unreadable.push(sh.href || '(inline)'); } }
    const selectors = new Set();
    for (const { r } of all) for (const s of (r.selectorText || '').split(',')) selectors.add(s.trim().replace(/\s+/g, ' '));
    for (const { r, media } of all) {
      if (!/:hover/.test(r.selectorText || '')) continue;
      const props = [...r.style];
      const reveal = props.filter(p => REVEAL.test(p));
      for (const s0 of (r.selectorText || '').split(',')) {
        const s = s0.trim().replace(/\s+/g, ' ');
        if (!s.includes(':hover')) continue;
        out.total++;
        const after = s.slice(s.lastIndexOf(':hover') + 6);
        const targetsOther = /[\s>+~]/.test(after.replace(/^\([^)]*\)/, '').trimEnd()) || /::?(before|after)/.test(after);
        const hard = reveal.filter(p => /^(display|visibility|content|-webkit-line-clamp)$/.test(p));
        const isReveal = hard.length > 0 || (reveal.length > 0 && targetsOther);
        if (!isReveal) { out.cosmetic++; continue; }
        const twins = [':focus', ':focus-visible', ':focus-within', ':active'].map(f => s.replace(/:hover/g, f));
        const hasTwin = twins.some(t => selectors.has(t)) || (r.selectorText || '').split(',').some(x => /:focus/.test(x));
        out.rules.push({ selector: s, props: reveal.map(p => p + ':' + r.style.getPropertyValue(p)).join('; '), media: media || null, hasFocusTwin: hasTwin, targetsOther });
      }
    }
    for (const el of document.querySelectorAll('#app [title]')) {
      if (!H.shown(el)) continue;
      const t = (el.getAttribute('title') || '').trim(); if (!t) continue;
      const name = (H.accName(el) + ' ' + (el.textContent || '')).toLowerCase();
      if (!name.includes(t.toLowerCase())) out.titles.push({ sel: H.sel(el), title: t.slice(0, 80) });
    }
    return out;
  };

  /* ---------- live regions ---------- */
  H.liveRegions = () => ['live-polite', 'live-assertive'].map(id => {
    const el = document.getElementById(id);
    if (!el) return { id, exists: false };
    const cs = getComputedStyle(el);
    return { id, exists: true, ariaLive: el.getAttribute('aria-live'), role: el.getAttribute('role'), display: cs.display, visibility: cs.visibility, ariaHidden: !!el.closest('[aria-hidden="true"]'), hidden: !!el.closest('[hidden]'), inert: !!el.closest('[inert]') };
  });

  window.__A11Y = H;
  return 'installed';
}

/* Recorder for aria-live changes: installed before any page script runs. */
function liveRecorder() {
  window.__A11Y_LIVE = [];
  const seen = new WeakSet();
  let mo = null;
  const attach = () => {
    let n = 0;
    for (const id of ['live-polite', 'live-assertive']) {
      const el = document.getElementById(id);
      if (!el) continue;
      n++;
      if (seen.has(el)) continue;
      seen.add(el);
      const rec = () => {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        const last = window.__A11Y_LIVE.filter(x => x.region === id).pop();
        if (t && (!last || last.text !== t)) {
          const app = document.getElementById('app');
          window.__A11Y_LIVE.push({ region: id, text: t, t: Math.round(performance.now()), ui: app ? app.getAttribute('data-ui') : null });
        }
      };
      new MutationObserver(rec).observe(el, { childList: true, characterData: true, subtree: true });
      rec();
    }
    if (n === 2 && mo) { mo.disconnect(); mo = null; }
  };
  mo = new MutationObserver(attach);
  mo.observe(document, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', attach);
}

/* ============================================================================
   IMAGE HELPERS (run in a blank helper page: decode PNGs, diff, sample)
============================================================================ */
function imgHelpers() {
  const IMG = {};
  IMG.decode = async b64 => {
    const blob = await (await fetch('data:image/png;base64,' + b64)).blob();
    return createImageBitmap(blob);
  };
  IMG.data = bmp => { const c = new OffscreenCanvas(bmp.width, bmp.height); const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(bmp, 0, 0); return x.getImageData(0, 0, bmp.width, bmp.height); };
  const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  // focus: count changed pixels in the ring band vs interior; u2 gives the noise floor.
  IMG.focusDiff = async ({ u1, f, u2, inner }) => {
    const [A, B, C] = await Promise.all([u1, f, u2].map(async s => IMG.data(await IMG.decode(s))));
    if (A.width !== B.width || A.height !== B.height) return { error: 'size mismatch' };
    const w = A.width, h = A.height;
    const res = { signal: { band: 0, inner: 0 }, noise: { band: 0, inner: 0 }, bandArea: 0, innerArea: 0 };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const isInner = x >= inner.x && x < inner.x + inner.w && y >= inner.y && y < inner.y + inner.h;
      if (isInner) res.innerArea++; else res.bandArea++;
      const d1 = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]);
      const d2 = C.width === w && C.height === h ? Math.abs(A.data[i] - C.data[i]) + Math.abs(A.data[i + 1] - C.data[i + 1]) + Math.abs(A.data[i + 2] - C.data[i + 2]) : 0;
      if (d1 > 60) res.signal[isInner ? 'inner' : 'band']++;
      if (d2 > 60) res.noise[isInner ? 'inner' : 'band']++;
    }
    return res;
  };
  // contrast of fg (with alpha) over each sampled screenshot pixel inside the rects.
  IMG.sampleContrast = async ({ b64, items }) => {
    const D = IMG.data(await IMG.decode(b64));
    return items.map(it => {
      const ratios = [];
      for (const r of it.rects) {
        const step = Math.max(1, Math.floor(Math.min(r.w, r.h) / 7));
        for (let y = Math.max(0, Math.floor(r.y)); y < Math.min(D.height, r.y + r.h); y += step) {
          for (let x = Math.max(0, Math.floor(r.x)); x < Math.min(D.width, r.x + r.w); x += step) {
            const i = (y * D.width + x) * 4, br = D.data[i], bg = D.data[i + 1], bb = D.data[i + 2];
            const a = it.fg.a, fr = it.fg.r * a + br * (1 - a), fg = it.fg.g * a + bg * (1 - a), fb = it.fg.b * a + bb * (1 - a);
            const l1 = lum(fr, fg, fb), l2 = lum(br, bg, bb);
            ratios.push((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
            if (ratios.length > 1500) break;
          }
        }
      }
      if (!ratios.length) return null;
      ratios.sort((a, b) => a - b);
      const q = p => ratios[Math.min(ratios.length - 1, Math.floor(p * ratios.length))];
      return { n: ratios.length, min: ratios[0], p10: q(0.1), p50: q(0.5) };
    });
  };
  // greyscale tokens: resample each to 24×30 luminance and compare pairwise (mean abs diff 0–255).
  IMG.tokenDiff = async ({ b64, tokens }) => {
    const bmp = await IMG.decode(b64);
    const W = 24, Hh = 30;
    const vecs = tokens.map(t => {
      const c = new OffscreenCanvas(W, Hh); const x = c.getContext('2d', { willReadFrequently: true });
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.drawImage(bmp, t.rect.x, t.rect.y, Math.max(1, t.rect.w), Math.max(1, t.rect.h), 0, 0, W, Hh);
      const d = x.getImageData(0, 0, W, Hh).data; const v = new Float32Array(W * Hh);
      for (let i = 0; i < v.length; i++) v[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
      return v;
    });
    const m = [];
    for (let a = 0; a < vecs.length; a++) { m.push([]); for (let b = 0; b < vecs.length; b++) { let s = 0; for (let i = 0; i < vecs[a].length; i++) s += Math.abs(vecs[a][i] - vecs[b][i]); m[a].push(s / vecs[a].length); } }
    return m;
  };
  window.__IMG = IMG;
  return true;
}

/* ============================================================================
   BROWSER PLUMBING
============================================================================ */
let BROWSER = null, IMGPAGE = null, SERVER = null, BASE_URL = null;
const SHOTS = [];
async function shot(page, name, o = {}) {
  const file = path.join(OPTS.out, name + '.png');
  try {
    if (o.el) { const h = await page.$(o.el); if (!h) return null; await h.screenshot({ path: file, timeout: 8000 }); }
    else await page.screenshot({ path: file, timeout: 8000, ...(o.clip ? { clip: o.clip } : {}) });
    SHOTS.push(path.relative(GAME_DIR, file));
    return file;
  } catch (e) { log('shot failed', name, e.message); return null; }
}
async function shotB64(page, clip) {
  try { const b = await page.screenshot({ type: 'png', timeout: 8000, ...(clip ? { clip } : {}) }); return b.toString('base64'); } catch (e) { log('shotB64', e.message); return null; }
}
async function helpers(page) { try { await page.evaluate(pageHelpers); } catch (e) { log('helpers', e.message); } }
async function H(page, fnBody, arg) {
  await helpers(page);
  return page.evaluate(fnBody, arg);
}
async function raf(page, n = 2) {
  try { await page.evaluate(k => new Promise(r => { let i = 0; const f = () => (++i >= k ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); setTimeout(r, 200); }), n); } catch (e) { /* ignore */ }
}
async function uiState(page) {
  try { await helpers(page); return await page.evaluate(() => window.__A11Y.ui()); } catch (e) { return { ui: null, err: String(e.message || e) }; }
}
async function waitFor(page, pred, timeout = OPTS.timeout, step = 120) {
  const t0 = Date.now(); let s = null;
  while (Date.now() - t0 < timeout) { s = await uiState(page); if (pred(s)) return s; await sleep(step); }
  return null;
}
async function isOpen(page, sel) {
  return page.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && !e.closest('[hidden]') && (typeof e.checkVisibility !== 'function' || e.checkVisibility({ checkVisibilityCSS: true })); }, sel).catch(() => false);
}
async function waitOpen(page, sel, want = true, timeout = 2500) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { if ((await isOpen(page, sel)) === want) return true; await sleep(80); }
  return false;
}
async function dismissTapContinue(page) {
  const s = await uiState(page);
  if (s.top === 'tapContinue' || (await isOpen(page, '#tap-continue'))) {
    REPORT.notes.push('tap-to-continue overlay appeared (window blur); dismissed with Enter');
    await page.keyboard.press('Enter').catch(() => {});
    await sleep(150);
    if (await isOpen(page, '#tap-continue')) await page.click('#tap-continue', { timeout: 1500 }).catch(() => {});
  }
}

async function newGamePage(vpName, extra = {}) {
  const [w, h] = vpName.split('x').map(Number);
  const ctx = await BROWSER.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 800, colorScheme: 'dark', reducedMotion: 'no-preference', ...extra });
  const page = await ctx.newPage();
  const consoleLog = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') { const t = m.text(); if (!/fonts\.(googleapis|gstatic)|ERR_FAILED|net::ERR|Failed to load resource/i.test(t)) consoleLog.push({ vp: vpName, type: m.type(), text: t.slice(0, 300) }); } });
  page.on('pageerror', e => consoleLog.push({ vp: vpName, type: 'pageerror', text: String(e.stack || e).slice(0, 500) }));
  await page.route(/https?:\/\/fonts\.(googleapis|gstatic)\.com\//, async route => {
    if (!OPTS.fonts) return route.abort().catch(() => {});
    try { const resp = await route.fetch({ timeout: 4000 }); await route.fulfill({ response: resp }); } catch (e) { await route.abort().catch(() => {}); }
  });
  await page.route(u => !u.href.startsWith(BASE_URL) && !/fonts\.(googleapis|gstatic)\.com/.test(u.href) && /^https?:/.test(u.href), r => r.abort().catch(() => {}));
  await page.addInitScript(liveRecorder);
  const url = BASE_URL + '/index.html' + (OPTS.query ? '?' + OPTS.query.replace(/^\?/, '') : '');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  REPORT.url = url;
  const booted = await waitFor(page, s => s.ui === 'BUILD' || s.ui === 'RESULT', OPTS.timeout);
  await sleep(700); // fonts, ResizeObserver layout, first frames
  await helpers(page);
  await dismissTapContinue(page);
  return { ctx, page, vp: vpName, w, h, booted: !!booted, consoleLog };
}

/* ============================================================================
   CDP: accessible names, JS hover listeners
============================================================================ */
async function axInfo(page, ids) {
  const out = {};
  if (!ids.length) return out;
  await page.evaluate(list => list.forEach(i => { const e = window.__A11Y.get(i); if (e) e.setAttribute('data-a11y-probe', String(i)); }), ids);
  let cdp = null;
  try {
    cdp = await page.context().newCDPSession(page);
    await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '[data-a11y-probe]' });
    for (const nodeId of nodeIds) {
      const { attributes } = await cdp.send('DOM.getAttributes', { nodeId });
      const id = attributes[attributes.indexOf('data-a11y-probe') + 1];
      const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
      const n = (nodes || []).find(x => !x.ignored) || (nodes || [])[0];
      out[id] = n ? { role: n.role && n.role.value, name: (n.name && n.name.value) || '', ignored: !!n.ignored } : null;
    }
  } catch (e) {
    log('CDP ax failed, JS fallback', e.message);
    const names = await page.evaluate(list => list.map(i => { const e = window.__A11Y.get(i); return [i, e ? window.__A11Y.accName(e) : '']; }), ids);
    for (const [i, n] of names) out[i] = { role: null, name: n, ignored: false, fallback: true };
  } finally {
    await page.evaluate(() => document.querySelectorAll('[data-a11y-probe]').forEach(e => e.removeAttribute('data-a11y-probe'))).catch(() => {});
    if (cdp) await cdp.detach().catch(() => {});
  }
  return out;
}
async function hoverListeners(page) {
  let cdp = null; const out = [];
  try {
    cdp = await page.context().newCDPSession(page);
    await cdp.send('DOM.enable'); await cdp.send('DOM.getDocument', { depth: 0 });
    const { result } = await cdp.send('Runtime.evaluate', { expression: 'document', objectGroup: 'a11y' });
    const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId, depth: -1, pierce: true });
    for (const l of listeners.filter(x => /^(mouseenter|mouseover|pointerenter|pointerover)$/.test(x.type))) {
      let sel = '(document)';
      if (l.backendNodeId) {
        try {
          const { object } = await cdp.send('DOM.resolveNode', { backendNodeId: l.backendNodeId, objectGroup: 'a11y' });
          const r = await cdp.send('Runtime.callFunctionOn', { objectId: object.objectId, functionDeclaration: 'function(){ return window.__A11Y ? window.__A11Y.sel(this) : (this.id ? "#" + this.id : this.nodeName); }', returnByValue: true });
          sel = r.result.value;
        } catch (e) { /* ignore */ }
      }
      out.push({ type: l.type, sel, handler: ((l.handler && l.handler.description) || '').replace(/\s+/g, ' ').slice(0, 120) });
    }
    await cdp.send('Runtime.releaseObjectGroup', { objectGroup: 'a11y' }).catch(() => {});
  } catch (e) { out.push({ error: String(e.message || e) }); }
  finally { if (cdp) await cdp.detach().catch(() => {}); }
  return out;
}

/* ============================================================================
   (a)(b)(c)(d)(k): LAYOUT AUDIT OF ONE STATE
============================================================================ */
const COLS = {
  R: { name: 'Red', shapes: ['circle'] }, A: { name: 'Gold', shapes: ['triangle'] }, G: { name: 'Green', shapes: ['square', 'rounded square'] },
  B: { name: 'Blue', shapes: ['diamond'] }, W: { name: 'White', shapes: ['cross'] }, X: { name: 'Rainbow', shapes: ['star', 'rainbow star'] },
};
const TUBE_RE = /^Tube \d+: [^,]+, (Red|Gold|Green|Blue|White|Rainbow) [a-z ]+, star [1-3], Hang \d+(, rig [^,]+)?, fires \d+(st|nd|rd|th)([–-]\d+(st|nd|rd|th))? of \d+, sees \d+(, crowd favourite)?(, half strength)?(, washed out)?$/;
function tubeLabelProblems(label, i, tube) {
  const p = [];
  const L = label || '';
  if (!new RegExp(`^Tube ${i + 1}\\b`).test(L)) p.push(`should start "Tube ${i + 1}:"`);
  if (!tube) return p;
  if (!tube.shell) { if (!/empty/i.test(L)) p.push('empty tube: label should say "empty"'); return p; }
  const s = tube.shell, low = L.toLowerCase();
  if (s.name && !low.includes(String(s.name).toLowerCase())) p.push(`missing shell name "${s.name}"`);
  const C = COLS[s.col];
  if (C && !new RegExp(`\\b${C.name}\\b[^,]*\\b(${C.shapes.join('|')})\\b`, 'i').test(L)) p.push(`missing "${C.name} ${C.shapes[0]}"`);
  if (!new RegExp(`\\bstar ${s.star != null ? s.star : '\\d'}\\b`, 'i').test(L)) p.push(`missing "star ${s.star}"`);
  if (!/\bHang \d+/i.test(L)) p.push('missing "Hang N"');
  if (tube.rig && (!/\brig\b/i.test(L) || (tube.rig.name && !low.includes(String(tube.rig.name).toLowerCase())))) p.push(`missing "rig ${tube.rig.name || tube.rig.id}"`);
  if (!/\bfires \d+(st|nd|rd|th)\b/i.test(L)) p.push('missing "fires Nth"');
  if (!/\bof \d+\b/.test(L)) p.push('missing "of N"');
  if (!/\bsees \d+\b/i.test(L)) p.push('missing "sees N"');
  return p;
}

async function contrastAudit(G, label, scope, doing = { a: want('a'), d: want('d') }) {
  const { page, vp } = G;
  const style = await page.addStyleTag({ content: '*,*::before,*::after{pointer-events:auto!important}' }).catch(() => null);
  let res;
  try { res = await H(page, s => window.__A11Y.collectText(s), scope); }
  finally { if (style) await style.evaluate(n => n.remove()).catch(() => {}); }
  if (res.error) throw new Error(res.error);
  const items = res.items;
  // (a)
  if (doing.a) {
    const issues = [], notes = [];
    const nv = items.filter(i => !i.covered && i.bg && i.bg.kind !== 'css');
    let est = [];
    if (nv.length) {
      const st = await page.addStyleTag({ content: '*,*::before,*::after{-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important;-webkit-text-stroke:0!important} svg text,svg tspan{fill:transparent!important;stroke:transparent!important}' }).catch(() => null);
      await raf(page, 2);
      const b64 = await shotB64(page);
      if (st) await st.evaluate(n => n.remove()).catch(() => {});
      if (b64) est = await IMGPAGE.evaluate(a => window.__IMG.sampleContrast(a), { b64, items: nv.map(i => ({ rects: i.rects, fg: i.fg })) }).catch(e => { notes.push('pixel sampling failed: ' + e.message); return []; });
    }
    let checked = 0, exempt = 0, covered = 0, visualOk = 0;
    for (const it of items) {
      if (it.covered) { covered++; continue; }
      if (!it.bg) continue;
      if (it.disabled) { exempt++; continue; }
      checked++;
      if (it.bg.kind === 'css') {
        if (it.bg.ratio != null && it.bg.ratio < it.required - 0.005) {
          const halo = it.halo && it.halo.ratio >= it.required;
          issues.push({ level: halo ? 'REVIEW' : 'FAIL', sel: it.sel, msg: `contrast ${fx(it.bg.ratio, 2)}:1 < ${it.required}:1` + (halo ? ` against the background; passes only via its ${it.halo.kind} halo ${it.halo.color} (${fx(it.halo.ratio, 2)}:1): check visually` : ''), text: it.text, fg: it.fgHex, bg: it.bg.bgHex, via: it.bg.via, size: fx(it.eff), weight: it.weight });
        }
      } else {
        const e = est[nv.indexOf(it)];
        const okEst = e && e.p10 >= it.required;
        if (okEst) visualOk++;
        issues.push({ level: okEst ? 'INFO' : 'REVIEW', sel: it.sel, msg: `needs visual: text over ${it.bg.kind} (${it.bg.at})` + (e ? ` · pixel-sampled ratio p10 ${fx(e.p10, 2)}:1, min ${fx(e.min, 2)}:1, median ${fx(e.p50, 2)}:1 (need ${it.required})` : ' · no pixel estimate'), text: it.text, fg: it.fgHex, estimate: e || null });
      }
    }
    if (exempt) notes.push(`${exempt} disabled-control text item(s) exempt`);
    if (covered) notes.push(`${covered} text item(s) behind an overlay/scrim skipped`);
    if (nv.length) notes.push(`${nv.length} text item(s) over canvas/image need visual review; ${visualOk} pass by pixel sampling (p10)`);
    record('a', vp, label, { issues, notes, stats: { textItems: items.length, checked } });
  }
  // (d)
  if (doing.d) {
    const issues = [];
    for (const it of items) {
      if (it.eff >= 15.95) continue;
      const deco = it.glyphOnly && it.ariaHidden;
      issues.push({ level: deco ? 'WARN' : 'FAIL', sel: it.sel, msg: `text ${fx(it.eff)}px < 16px` + (it.eff !== it.size ? ` (font-size ${fx(it.size)}px × scale ${fx(it.eff / it.size, 2)})` : '') + (deco ? ' (aria-hidden glyph)' : ''), text: it.text });
    }
    record('d', vp, label, { issues, stats: { textItems: items.length, minPx: items.length ? fx(Math.min(...items.map(i => i.eff))) : null } });
  }
  return items;
}

async function namesAudit(G, label, scope) {
  const { page, vp } = G;
  const controls = await H(page, s => window.__A11Y.controls(s), scope);
  const ax = await axInfo(page, controls.map(c => c.id));
  const info = await page.evaluate(() => window.__A11Y.gameInfo());
  const issues = [], notes = [];
  let tubesChecked = 0;
  for (const c of controls) {
    const a = ax[c.id] || { name: '' };
    const name = (a.name || '').replace(/\s+/g, ' ').trim();
    if (!name) issues.push({ level: 'FAIL', sel: c.sel, msg: `no accessible name (${c.tag}${c.role ? ' role=' + c.role : ''})`, text: c.text });
    else if (!/[\p{L}\p{N}]/u.test(name)) issues.push({ level: 'FAIL', sel: c.sel, msg: `accessible name is only a glyph: "${name}"` });
    if (a.fallback && !notes.length) notes.push('CDP unavailable; used the JS accname fallback');
    if (c.data.tube != null) {
      tubesChecked++;
      const i = +c.data.tube;
      const probs = tubeLabelProblems(name, i, info.tubes[i]);
      if (probs.length) issues.push({ level: 'FAIL', sel: c.sel, msg: '§13 tube label: ' + probs.join('; '), name });
      else if (info.tubes[i] && info.tubes[i].shell && !TUBE_RE.test(name)) issues.push({ level: 'WARN', sel: c.sel, msg: 'tube label has every §13 part but not the exact §13 order/format', name });
    }
    if (c.data.card != null) {
      const card = info.cards[+c.data.card];
      if (card && card.name && !card.sold && !name.toLowerCase().includes(String(card.name).toLowerCase())) issues.push({ level: 'FAIL', sel: c.sel, msg: `shop card name lacks the full shell name "${card.name}" (§8.1)`, name });
    }
  }
  if (!info.hasHooks) notes.push('window.__game missing: tube labels checked for format only');
  record('b', vp, label, { issues, notes, stats: { controls: controls.length, tubes: tubesChecked } });
}

async function targetsAudit(G, label, scope) {
  const { page, vp } = G;
  const r = await H(page, s => window.__A11Y.targets(s), scope);
  const issues = [];
  for (const t of r.targets) {
    if (!t.ok && !t.extended) issues.push({ level: 'FAIL', sel: t.sel, msg: `target ${fx(t.w)}×${fx(t.h)}px < 44×44` + (t.probe ? ` (44px probe ${t.probe.hits}/${t.probe.total} hits)` : '') + (t.disabled ? ' [disabled]' : '') });
    if (t.covered && !t.disabled) issues.push({ level: 'WARN', sel: t.sel, msg: `target centre is covered by ${t.covered}` });
  }
  for (const g of r.gaps) if (g.gap < 7.5) issues.push({ level: 'FAIL', sel: `${g.a} ↔ ${g.b}`, msg: `tube gap ${fx(g.gap)}px < 8px` });
  record('c', vp, label, { issues, stats: { targets: r.targets.length, tubes: r.tubeCount, minTubeGap: r.gaps.length ? fx(Math.min(...r.gaps.map(g => g.gap))) : null } });
}

async function overflowAudit(G, label, scope, items, { fire = !scope, text = true } = {}) {
  const { page, vp } = G;
  const r = await H(page, ([s, f]) => window.__A11Y.overflow(s, { fire: f }), [scope, fire]);
  const issues = [];
  const hs = r.hscroll;
  if (hs.docScrollWidth > hs.docClientWidth + 1 || hs.scrolledTo > 0) issues.push({ level: 'FAIL', sel: 'html', msg: `horizontal page scroll: scrollWidth ${hs.docScrollWidth} > ${hs.docClientWidth} (scrollX→${hs.scrolledTo})` });
  if (hs.bodyScrollWidth > hs.bodyClientWidth + 1) issues.push({ level: 'FAIL', sel: 'body', msg: `content wider than the viewport: body scrollWidth ${hs.bodyScrollWidth} > ${hs.bodyClientWidth}` });
  for (const b of r.beyond) issues.push({ level: 'FAIL', sel: b.sel, msg: `extends beyond the viewport horizontally (${fx(b.left)}…${fx(b.left + b.width)} of ${G.w}px)` });
  for (const o of r.offscreen) issues.push({ level: 'FAIL', sel: o.sel, msg: `control ${Math.round(o.visibleFrac * 100)}% visible (clipped by ${o.clipBy}; not in a scroll container)` });
  if (r.fire) {
    const f = r.fire;
    if (!f.exists) issues.push({ level: 'FAIL', sel: '#fire', msg: '#fire missing' });
    else {
      if (!f.shown) issues.push({ level: 'FAIL', sel: '#fire', msg: '#fire not visible' });
      if (!f.inView) issues.push({ level: 'FAIL', sel: '#fire', msg: `#fire outside the viewport (${fx(f.rect.x)},${fx(f.rect.y)} ${fx(f.rect.w)}×${fx(f.rect.h)})` });
      if (!f.inClip) issues.push({ level: 'FAIL', sel: '#fire', msg: `#fire clipped by ${f.clipBy}` });
      if (f.coveredBy.length) issues.push({ level: 'FAIL', sel: '#fire', msg: `#fire covered at probe points by ${f.coveredBy.join(', ')}` });
    }
  }
  if (text && items) {
    for (const it of items) {
      if (it.hardFrac < 0.98) {
        if (it.ellipsis) issues.push({ level: it.fullInName ? 'INFO' : 'WARN', sel: it.sel, msg: `text truncated with ellipsis (${Math.round(it.hardFrac * 100)}% shown)` + (it.fullInName ? '; full text is in the accessible name' : '; full text not in the control name'), text: it.text });
        else issues.push({ level: 'FAIL', sel: it.sel, msg: `text clipped by ${it.clipBy} (${Math.round(it.hardFrac * 100)}% visible)`, text: it.text });
      } else if (it.spill) issues.push({ level: 'WARN', sel: it.sel, msg: 'text spills outside its box (overflow visible)', text: it.text });
    }
  }
  record('k', vp, label, { issues, stats: { fire: r.fire ? { text: r.fire.text, rect: r.fire.rect } : null } });
}

async function layoutAudit(G, label, { scope = null, checks = 'abcdk', fire } = {}) {
  let items = null;
  await G.page.mouse.move(1, 1).catch(() => {}); // no stray :hover from earlier clicks
  const has = c => checks.includes(c) && want(c);
  if (has('a') || has('d') || has('k')) {
    const key = has('a') ? 'a' : has('d') ? 'd' : 'k';
    items = await guard(key, G.vp, label, () => contrastAudit(G, label, scope, { a: has('a'), d: has('d') }));
  }
  if (has('b')) await guard('b', G.vp, label, () => namesAudit(G, label, scope));
  if (has('c')) await guard('c', G.vp, label, () => targetsAudit(G, label, scope));
  if (has('k')) await guard('k', G.vp, label, () => overflowAudit(G, label, scope, items, { fire: fire != null ? fire : !scope }));
  return items;
}

/* ============================================================================
   (e)(f): FOCUS AND KEYBOARD
============================================================================ */
const RANK = { HUD: 0, Sponsor: 1, tubes: 2, Crate: 3, tools: 4, cards: 5, workshop: 6, Light: 7 };
async function tabWalk(page, { scope = null, max = 120, shift = false } = {}) {
  const stops = [], escapes = [];
  let bodies = 0, cycled = false, first = null;
  for (let i = 0; i < max; i++) {
    await page.keyboard.press(shift ? 'Shift+Tab' : 'Tab');
    const fi = await page.evaluate(s => window.__A11Y.focusInfo(s), scope);
    if (fi.isSentinel) { cycled = true; break; }
    if (fi.isBody) { if (scope) { escapes.push('body'); break; } if (++bodies > 1) break; continue; }
    if (scope && !fi.inside) { escapes.push(fi.sel); break; }
    if (first == null) first = fi.id;
    else if (fi.id === first) { cycled = true; break; }
    if (stops.some(s => s.id === fi.id)) { cycled = true; break; }
    stops.push(fi);
  }
  return { stops, escapes, cycled };
}
function styleIndicator(u, f) {
  const out = [];
  if (f.outlineStyle !== 'none' && f.outlineWidth >= 1 && f.outlineAlpha > 0.1 && (u.outlineStyle === 'none' || u.outlineWidth < 1 || u.outlineColor !== f.outlineColor || u.outlineWidth !== f.outlineWidth)) out.push(`outline ${f.outlineWidth}px ${f.outlineStyle} ${f.outlineColor}`);
  if (f.boxShadow !== u.boxShadow && f.boxShadow !== 'none') out.push('box-shadow');
  if (f.border !== u.border) out.push('border');
  if (f.bg !== u.bg) out.push('background');
  if (f.color !== u.color) out.push('color');
  if (f.deco !== u.deco) out.push('text-decoration');
  if (f.transform !== u.transform) out.push('transform');
  if (f.filter !== u.filter) out.push('filter');
  if (f.pseudo !== u.pseudo) out.push('pseudo-element');
  return out;
}
async function focusVisibleAudit(G, stops, label) {
  const { page, vp } = G;
  const issues = [], perStop = [];
  for (const s of stops) {
    if (overBudget(30)) { perStop.push({ sel: s.sel, verdict: 'not checked (time budget)' }); continue; }
    const prep = await page.evaluate(id => window.__A11Y.prepFocus(id), s.id).catch(() => null);
    if (!prep) { perStop.push({ sel: s.sel, verdict: 'gone' }); continue; }
    const r = prep.rect, pad = 10;
    const clip = { x: Math.max(0, Math.floor(r.x - pad)), y: Math.max(0, Math.floor(r.y - pad)) };
    clip.width = Math.min(G.w, Math.ceil(r.x + r.w + pad)) - clip.x; clip.height = Math.min(G.h, Math.ceil(r.y + r.h + pad)) - clip.y;
    if (clip.width < 4 || clip.height < 4) { perStop.push({ sel: s.sel, verdict: 'offscreen' }); issues.push({ level: 'WARN', sel: s.sel, msg: 'Tab stop is off-screen when focused' }); continue; }
    await raf(page, 2);
    const u1 = await shotB64(page, clip);
    const f = await page.evaluate(id => window.__A11Y.doFocus(id), s.id);
    await raf(page, 2); await sleep(120);
    const fshot = await shotB64(page, clip);
    await page.evaluate(() => window.__A11Y.blurActive());
    await raf(page, 2); await sleep(120);
    const u2 = await shotB64(page, clip);
    const inner = { x: Math.round(r.x - clip.x + 3), y: Math.round(r.y - clip.y + 3), w: Math.max(0, Math.round(r.w - 6)), h: Math.max(0, Math.round(r.h - 6)) };
    let d = null;
    if (u1 && fshot && u2 && !prep.stillFocused) d = await IMGPAGE.evaluate(a => window.__IMG.focusDiff(a), { u1, f: fshot, u2, inner }).catch(() => null);
    const ind = f ? styleIndicator(prep.style, f.style) : [];
    let verdict;
    const px = d && !d.error ? d : null;
    const pixelOK = px && (px.signal.band >= Math.max(24, 3 * px.noise.band + 8) || px.signal.inner >= Math.max(0.12 * px.innerArea, 3 * px.noise.inner + 20));
    if (!f || !f.focused) { verdict = 'WARN'; issues.push({ level: 'WARN', sel: s.sel, msg: 'element refused programmatic focus (could not verify ring)' }); }
    else if (pixelOK) verdict = 'PASS';
    else if (!px && ind.length) verdict = 'PASS';
    else if (ind.length) { verdict = 'WARN'; issues.push({ level: 'WARN', sel: s.sel, msg: `focus style changes (${ind.join(', ')}) but no visible pixel change (clipped or covered?)`, pixels: px ? px.signal : null }); }
    else { verdict = 'FAIL'; issues.push({ level: 'FAIL', sel: s.sel, msg: 'no visible focus indicator (no outline/box-shadow/border/background change; no pixel change)', pixels: px ? px.signal : null }); }
    if (f && f.focused && !f.fv && verdict !== 'FAIL') issues.push({ level: 'INFO', sel: s.sel, msg: 'did not match :focus-visible on programmatic focus' });
    perStop.push({ sel: s.sel, group: s.group, verdict, style: ind, pixels: px ? { band: px.signal.band, inner: px.signal.inner, noiseBand: px.noise.band } : null });
  }
  return { issues, perStop };
}
function orderProblems(stops) {
  const problems = [];
  let maxRank = -1, maxG = null;
  for (const s of stops) {
    const r = RANK[s.group];
    if (r === undefined) continue;
    if (r < maxRank) problems.push({ level: 'FAIL', sel: s.sel, msg: `Tab order: ${s.group} comes after ${maxG} (§13: HUD → Sponsor → tubes → Crate → tools → cards → workshop → Light)` });
    if (r > maxRank) { maxRank = r; maxG = s.group; }
  }
  const runs = [];
  for (const s of stops) { const g = s.group; if (!runs.length || runs[runs.length - 1].g !== g) runs.push({ g, n: 1 }); else runs[runs.length - 1].n++; }
  const seen = new Set();
  for (const r of runs) { if (RANK[r.g] === undefined) continue; if (seen.has(r.g)) problems.push({ level: 'WARN', sel: r.g, msg: `Tab order: group ${r.g} is split into several runs` }); seen.add(r.g); }
  return { problems, sequence: runs.map(r => r.g + (r.n > 1 ? '×' + r.n : '')).join(' → ') };
}
async function arrowReach(page, fromId, keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'], n = 8) {
  const reached = new Set();
  for (const k of keys) {
    const ok = await page.evaluate(id => window.__A11Y.focusId(id), fromId).catch(() => false);
    if (!ok) continue;
    for (let i = 0; i < n; i++) {
      await page.keyboard.press(k);
      const fi = await page.evaluate(() => window.__A11Y.focusInfo(null));
      if (fi.id) reached.add(fi.id);
      if (fi.activedescendant) { const ad = await page.evaluate(x => { const e = document.getElementById(x); return e ? window.__A11Y.reg(e) : 0; }, fi.activedescendant); if (ad) reached.add(ad); }
    }
  }
  return reached;
}

/** BUILD: Tab walk (order + focus ring) and reachability of every control. */
async function keyboardBuild(G, label) {
  const { page, vp } = G;
  await helpers(page);
  await page.evaluate(() => window.__A11Y.sentinel(true));
  const walk = await tabWalk(page, { max: 150 });
  await page.evaluate(() => window.__A11Y.sentinel(false));
  const stops = walk.stops;
  // (e) order + focus visible
  await guard('e', vp, label, async () => {
    const { problems, sequence } = orderProblems(stops);
    const present = new Set(stops.map(s => s.group));
    const controls = await page.evaluate(() => window.__A11Y.controls(null));
    const issues = [...problems];
    const notes = [`Tab sequence: ${sequence || '(none)'}`];
    for (const g of Object.keys(RANK)) {
      const has = controls.some(c => c.group === g && !c.nativeDisabled);
      if (has && !present.has(g)) issues.push({ level: 'FAIL', sel: g, msg: `group ${g} has enabled controls but no Tab stop` });
      if (!has) notes.push(`${g}: not present in this state (order not verified)`);
    }
    const fv = await focusVisibleAudit(G, stops, label);
    issues.push(...fv.issues);
    record('e', vp, label, { issues, notes, stats: { stops: stops.length, perStop: fv.perStop } });
  });
  // (f) reachability
  await guard('f', vp, label, async () => {
    const controls = (await page.evaluate(() => window.__A11Y.controls(null))).filter(c => !c.nativeDisabled);
    const stopIds = new Set(stops.map(s => s.id));
    const missing = controls.filter(c => !stopIds.has(c.id));
    const issues = [], notes = [];
    if (missing.length) {
      // roving tabindex: try arrow keys from a stop in the same group
      const byGroup = {};
      for (const c of missing) (byGroup[c.groupSel || c.group] = byGroup[c.groupSel || c.group] || []).push(c);
      const reached = new Set();
      for (const [g, list] of Object.entries(byGroup)) {
        const anchor = stops.find(s => controls.find(c => c.id === s.id && (c.groupSel || c.group) === g)) || stops.find(s => s.group === list[0].group);
        if (!anchor) continue;
        for (const id of await arrowReach(page, anchor.id)) reached.add(id);
      }
      for (const c of missing) {
        if (reached.has(c.id)) notes.push(`${c.sel}: reachable with arrow keys (roving focus)`);
        else if (c.type === 'radio' && c.name && controls.some(o => o.type === 'radio' && o.name === c.name && stopIds.has(o.id))) notes.push(`${c.sel}: radio in a group with a Tab stop`);
        else issues.push({ level: 'FAIL', sel: c.sel, msg: `not keyboard reachable (no Tab stop, not reached by arrow keys; tabindex=${c.tabIndex})`, group: c.group });
      }
    }
    if (walk.escapes.length) notes.push('focus left the document at: ' + walk.escapes.join(', '));
    if (!walk.cycled) notes.push('Tab walk did not cycle back to the start (max stops reached?)');
    record('f', vp, label, { issues, notes, stats: { controls: controls.length, tabStops: stops.length } });
  });
  // leave focus on #fire for the overlay openers
  await page.evaluate(() => window.__A11Y.focusSel('#fire')).catch(() => {});
  return stops;
}

const OVERLAY_SEL = { pause: '#pause-menu', settings: '#settings', logbook: '#logbook', help: '#help', inspect: '#inspect', end: '#end' };
async function pressAndWait(page, key, sel) { await page.keyboard.press(key).catch(() => {}); return waitOpen(page, sel, true, 1500); }
async function findInOverlay(page, scope, re) {
  const ctrls = await H(page, s => window.__A11Y.controls(s), scope);
  const ax = await axInfo(page, ctrls.map(c => c.id));
  return ctrls.find(c => re.test(((ax[c.id] && ax[c.id].name) || c.ariaLabel || c.text || '').trim())) || null;
}
/** Open one overlay through the keyboard (with fallbacks), audit it, close it, check focus restore. */
async function auditOverlay(G, name, openers, { close = true, expectFocus = null, expectFocusName = null, restoreTo = '#fire', extraLabel = '' } = {}) {
  const { page, vp } = G;
  const sel = OVERLAY_SEL[name];
  const label = `${name} overlay${extraLabel}`;
  const fIssues = [], fNotes = [];
  await dismissTapContinue(page);
  if (!(await page.$(sel))) { if (want('f')) record('f', vp, label, { skip: `${sel} not in the DOM` }); return null; }
  let how = null;
  for (const o of openers) {
    if (await isOpen(page, sel)) { how = how || 'already open'; break; }
    try { const r = await o.run(); if (r !== false && (await waitOpen(page, sel, true, 1500))) { how = o.name; break; } } catch (e) { fNotes.push(`opener ${o.name} threw: ${e.message}`); }
  }
  if (!how) {
    const r = await page.evaluate(n => window.__A11Y.game('open', n), name);
    if (r.ok && (await waitOpen(page, sel, true, 1500))) { how = 'GAME.open (programmatic fallback)'; fIssues.push({ level: 'FAIL', sel, msg: `no keyboard path opened the ${name} overlay (tried ${openers.map(o => o.name).join(', ') || 'none'}); opened with GAME.open` }); }
  }
  if (!how) { if (want('f')) record('f', vp, label, { issues: [{ level: 'FAIL', sel, msg: `could not open the ${name} overlay (tried ${openers.map(o => o.name).join(', ')}, GAME.open)` }], notes: fNotes }); return null; }
  fNotes.push('opened via ' + how);
  await sleep(350);
  await shot(page, `${vp}-${name}`);
  const fi0 = await page.evaluate(s => window.__A11Y.focusInfo(s), sel);
  if (!fi0.inside) fIssues.push({ level: 'FAIL', sel, msg: `focus did not move into the overlay on open (activeElement: ${fi0.sel || 'body'})` });
  if (expectFocus) {
    const ok = await page.evaluate(s => { const e = document.querySelector(s); return !!e && document.activeElement === e; }, expectFocus);
    if (!ok) fIssues.push({ level: 'FAIL', sel: expectFocus, msg: `focus should land on ${expectFocus} when the ${name} overlay opens (it is on ${fi0.sel || 'body'})` });
  }
  if (expectFocusName && fi0.inside && !expectFocusName.test(fi0.name || '')) fIssues.push({ level: 'WARN', sel: fi0.sel, msg: `the ${name} overlay should open with ${expectFocusName} focused (spec §8.3); focus is on "${fi0.name}"` });
  // trap: forward and backward
  const fwd = await tabWalk(page, { scope: sel, max: 80 });
  const back = await tabWalk(page, { scope: sel, max: Math.max(6, fwd.stops.length + 3), shift: true });
  for (const e of [...fwd.escapes, ...back.escapes]) fIssues.push({ level: 'FAIL', sel, msg: `focus escaped the open overlay to ${e} (focus trap)` });
  if (!fwd.cycled && !fwd.escapes.length) fNotes.push('forward Tab walk did not cycle within 80 stops');
  const stopIds = new Set([...fwd.stops, ...back.stops].map(s => s.id));
  if (fi0.id) stopIds.add(fi0.id);
  // reachability inside
  const ctrls = (await page.evaluate(s => window.__A11Y.controls(s), sel)).filter(c => !c.nativeDisabled);
  const missing = ctrls.filter(c => !stopIds.has(c.id));
  if (missing.length) {
    const reached = new Set();
    const groups = [...new Set(missing.map(c => c.groupSel).filter(Boolean))];
    for (const g of groups) {
      const anchor = ctrls.find(c => c.groupSel === g && stopIds.has(c.id));
      if (anchor) for (const id of await arrowReach(page, anchor.id, ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'], 12)) reached.add(id);
    }
    for (const c of missing) {
      if (reached.has(c.id)) fNotes.push(`${c.sel}: reachable with arrow keys`);
      else if (c.type === 'radio' && c.name && ctrls.some(o => o.type === 'radio' && o.name === c.name && stopIds.has(o.id))) fNotes.push(`${c.sel}: radio in a group with a Tab stop`);
      else fIssues.push({ level: 'FAIL', sel: c.sel, msg: `control inside the ${name} overlay is not keyboard reachable` });
    }
  }
  // (e) visible focus inside the overlay
  await guard('e', vp, label, async () => {
    const all = [...new Map([...fwd.stops, ...back.stops].map(s => [s.id, s])).values()];
    const fv = await focusVisibleAudit(G, all, label);
    record('e', vp, label, { issues: fv.issues, stats: { stops: all.length, perStop: fv.perStop } });
  });
  // (a)(b)(c)(d)(k) inside the overlay
  await layoutAudit(G, label, { scope: sel, checks: 'abcdk', fire: false });
  let result = { how, stops: fwd.stops, ctrls };
  // close + restore
  if (close) {
    const first = fwd.stops[0] || fi0;
    if (first && first.id) await page.evaluate(id => window.__A11Y.focusId(id), first.id).catch(() => {});
    await page.keyboard.press('Escape');
    const closed = await waitOpen(page, sel, false, 1500);
    if (!closed) fIssues.push({ level: 'FAIL', sel, msg: 'Esc did not close the overlay' });
    else if (restoreTo) {
      await sleep(120);
      const ok = await page.evaluate(s => { const e = document.querySelector(s); return !!e && document.activeElement === e; }, restoreTo);
      const now = await page.evaluate(() => window.__A11Y.focusInfo(null));
      if (!ok) fIssues.push({ level: 'FAIL', sel, msg: `focus not restored to the opener ${restoreTo} on close (now on ${now.sel || 'body'})` });
    }
    result.closed = closed;
  }
  if (want('f')) record('f', vp, label, { issues: fIssues, notes: fNotes, stats: { controls: ctrls.length, tabStops: fwd.stops.length } });
  return result;
}

/* ============================================================================
   GAME FLOW HELPERS
============================================================================ */
const buildLike = s => s && (s.ui === 'BUILD' || s.ui === 'RESULT');
async function playShow(G, { onResolving } = {}) {
  const { page } = G;
  await dismissTapContinue(page);
  const s0 = await uiState(page);
  if (s0.ui === 'END') return { ended: true };
  await page.evaluate(() => window.__A11Y.blurActive()).catch(() => {});
  let lit = false;
  try { await page.click('#fire', { timeout: 3000 }); lit = true; } catch (e) { /* fall back to the key */ }
  let s = await waitFor(page, x => x.ui === 'RESOLVING' || x.ui === 'END' || (x.show != null && x.show !== s0.show), 2500, 60);
  if (!s) { await page.keyboard.press('f').catch(() => {}); s = await waitFor(page, x => x.ui === 'RESOLVING' || x.ui === 'END' || (x.show != null && x.show !== s0.show), 2500, 60); }
  if (!s) { const r = await page.evaluate(() => window.__A11Y.game('light')); s = await waitFor(page, x => x.ui === 'RESOLVING' || x.ui === 'END' || (x.show != null && x.show !== s0.show), 2500, 60); if (!s) return { ok: false, why: 'could not light the fuse (' + (r.err || 'no state change') + ')' }; }
  if (s.ui === 'RESOLVING') {
    if (onResolving) await onResolving();
    await page.click('#fire', { timeout: 2000 }).catch(() => {}); // Skip ▸▸
  }
  const done = await waitFor(page, x => x.ui === 'END' || (buildLike(x) && (x.show !== s0.show || x.phase !== s0.phase)), OPTS.timeout);
  if (!done) {
    await page.evaluate(() => window.__A11Y.game('skip')).catch(() => {});
    const d2 = await waitFor(page, x => x.ui === 'END' || (buildLike(x) && x.show !== s0.show), 5000);
    if (!d2) return { ok: false, why: 'show did not finish (ui ' + (await uiState(page)).ui + ')' };
    return { ok: true, state: d2, lit };
  }
  await sleep(250);
  return { ok: true, state: done, lit };
}
async function purchase(G) {
  const { page } = G;
  const info = await page.evaluate(() => window.__A11Y.gameInfo());
  const card = info.cards.find(c => c.id && !c.sold && (c.cost == null || info.coins == null || c.cost <= info.coins));
  if (!card) return { ok: false, why: 'no affordable card in the shop' };
  const et = info.tubes.find(t => !t.shell), ec = info.crate.find(c => !c.shell);
  const target = et ? { sel: `[data-tube="${et.i}"]`, to: { zone: 'tube', i: et.i } } : ec ? { sel: `[data-crate="${ec.i}"]`, to: { zone: 'crate', i: ec.i } } : null;
  if (!target) return { ok: false, why: 'no empty tube or crate slot' };
  const before = info.coins;
  const bought = async () => { const s = await uiState(page); return s.coins != null && before != null && s.coins < before; };
  let via = null;
  try { await page.click(`[data-card="${card.i}"]`, { timeout: 2500 }); await sleep(200); await page.click(target.sel, { timeout: 2500 }); await sleep(400); if (await bought()) via = 'pointer (card, then tube)'; } catch (e) { /* next */ }
  if (!via) {
    try {
      await page.keyboard.press('Escape').catch(() => {}); if (await isOpen(page, '#pause-menu')) { await page.keyboard.press('Escape'); await sleep(150); }
      await page.evaluate(s => window.__A11Y.focusSel(s), `[data-card="${card.i}"]`); await page.keyboard.press('Enter'); await sleep(150);
      await page.evaluate(s => window.__A11Y.focusSel(s), target.sel); await page.keyboard.press('Enter'); await sleep(400);
      if (await bought()) via = 'keyboard (Enter on card, Enter on tube)';
    } catch (e) { /* next */ }
  }
  if (!via) {
    await page.evaluate(a => { try { return window.__game.act(a); } catch (e) { return null; } }, { type: 'buy', card: card.i, to: target.to });
    await sleep(300);
    if (await bought()) via = '__game.act (UI paths failed)';
  }
  return { ok: !!via, via, card, target: target.sel };
}

/* ============================================================================
   (g) LIVE REGIONS
============================================================================ */
async function liveLog(page) { return page.evaluate(() => (window.__A11Y_LIVE || []).slice()).catch(() => []); }
function evalLive(vp, log, marks, regions, extra = {}) {
  const issues = [], notes = [];
  for (const r of regions) {
    if (!r.exists) { issues.push({ level: 'FAIL', sel: '#' + r.id, msg: `#${r.id} missing` }); continue; }
    const wantLive = r.id === 'live-polite' ? 'polite' : 'assertive';
    if (r.ariaLive !== wantLive) issues.push({ level: 'FAIL', sel: '#' + r.id, msg: `aria-live="${r.ariaLive}" (want "${wantLive}")` });
    if (r.display === 'none' || r.visibility === 'hidden' || r.hidden || r.ariaHidden || r.inert) issues.push({ level: 'FAIL', sel: '#' + r.id, msg: 'live region hidden from assistive tech (display/visibility/hidden/aria-hidden/inert)' });
    if (r.ax && r.ax.ignored) issues.push({ level: 'FAIL', sel: '#' + r.id, msg: 'live region is ignored in the accessibility tree' });
  }
  const polite = (from, to) => log.slice(from, to).filter(x => x.region === 'live-polite');
  const expect = (key, from, to, res, levelIfMissing = 'FAIL') => {
    const hit = polite(from, to).find(x => res.every(re => re.test(x.text)));
    if (hit) notes.push(`${key}: "${hit.text.slice(0, 160)}"`);
    else issues.push({ level: levelIfMissing, sel: '#live-polite', msg: `no ${key} announcement matching ${res.map(String).join(' + ')}`, got: polite(from, to).map(x => x.text.slice(0, 160)).slice(-4) });
    return hit;
  };
  const m = marks;
  const lit = m.beforeLight != null ? m.beforeLight : log.length;
  expect('build-open (show 1)', 0, lit, [/Show \d+ of \d+/i, /Target [\d,.]+[KMB]?/i]);
  expect('result', lit, m.beforeBuy != null ? m.beforeBuy : log.length, [/Applause [\d,.]+[KMBe\d]*/i, /Ooh [\d,.KMB]+ times Aah [\d,.KMBe]+/i, /(Passed|Missed|short)/i]);
  expect('build-open (show 2)', lit, m.beforeBuy != null ? m.beforeBuy : log.length, [/Show 2 of \d+/i, /Target/i], 'WARN');
  if (m.beforeBuy != null && m.bought) expect('purchase', m.beforeBuy, m.afterBuy != null ? m.afterBuy : log.length, [/Bought .+,? into (tube \d+|(the )?crate)/i, /\d+ coins? left/i]);
  else if (m.beforeBuy != null) notes.push('purchase not made (' + (m.buyWhy || '?') + '): purchase announcement not verified');
  const moodLater = log.filter(x => x.region === 'live-polite' && /Show ([3-9]|1\d|2[0-4]) of/i.test(x.text));
  if (moodLater.length && !moodLater.some(x => /Crowd mood: (Restless|Hopeful|Eager)/i.test(x.text))) issues.push({ level: 'WARN', sel: '#live-polite', msg: 'build-open announcements from show 3 on never include "Crowd mood: …"' });
  const ass = log.filter(x => x.region === 'live-assertive');
  if (extra.rainCheck && !ass.some(x => /Rain check used/i.test(x.text))) issues.push({ level: 'FAIL', sel: '#live-assertive', msg: 'rain check spent but no assertive "Rain check used. Last chance."' });
  if (extra.ended) {
    const end = ass.filter(x => x.t >= (extra.endT || 0) - 5000).find(x => /(crowd went home|run is over|abandoned|Happy New Year|Afterparty is over|run end|game over)/i.test(x.text));
    if (end) notes.push(`run end (assertive): "${end.text.slice(0, 160)}"`);
    else issues.push({ level: 'FAIL', sel: '#live-assertive', msg: 'no assertive run-end announcement', got: ass.map(x => x.text.slice(0, 120)).slice(-3) });
  }
  if (ass.length) notes.push('assertive log: ' + ass.map(x => `"${x.text.slice(0, 80)}"`).join(' | '));
  notes.push(`${log.length} live-region updates recorded`);
  return { issues, notes };
}

/* ============================================================================
   (j) GREYSCALE
============================================================================ */
async function greyscaleAudit(G, label) {
  const { page, vp } = G;
  const tokens = await H(page, () => window.__A11Y.tokens());
  const issues = [], notes = [];
  if (tokens.length < 2) { record('j', vp, label, { skip: `only ${tokens.length} token(s) on screen` }); return; }
  const st = await page.addStyleTag({ content: 'html{filter:grayscale(1)!important}' });
  await raf(page, 3); await sleep(150);
  await shot(page, `${vp}-greyscale`);
  await shot(page, `${vp}-greyscale-rack`, { el: '#rack' });
  if (await page.$('#shop')) await shot(page, `${vp}-greyscale-shop`, { el: '#shop' });
  const b64 = await shotB64(page);
  await st.evaluate(n => n.remove()).catch(() => {});
  const m = await IMGPAGE.evaluate(a => window.__IMG.tokenDiff(a), { b64, tokens });
  const T = 6;
  let pairs = 0;
  for (let a = 0; a < tokens.length; a++) for (let b = a + 1; b < tokens.length; b++) {
    const A = tokens[a], B = tokens[b];
    if (A.id === B.id && A.col === B.col) continue; // twins
    pairs++;
    const d = m[a][b];
    const tag = t => `${t.kind} ${t.i} ${t.name || t.id} (${COLS[t.col] ? COLS[t.col].name : t.col})`;
    if (A.col !== B.col && d < T) issues.push({ level: 'FAIL', sel: `${A.sel} ↔ ${B.sel}`, msg: `different colours look identical in greyscale: ${tag(A)} vs ${tag(B)} (mean diff ${fx(d)}/255)` });
    if (A.id !== B.id) {
      if (A.monogram && B.monogram && A.monogram === B.monogram) issues.push({ level: 'FAIL', sel: `${A.sel} ↔ ${B.sel}`, msg: `different shells share the monogram "${A.monogram}": ${tag(A)} vs ${tag(B)}` });
      else if ((!A.monogram || !B.monogram) && A.col === B.col && d < T) issues.push({ level: 'FAIL', sel: `${A.sel} ↔ ${B.sel}`, msg: `same-colour shells indistinguishable in greyscale and no DOM monogram: ${tag(A)} vs ${tag(B)} (diff ${fx(d)})` });
    }
    if (A.shape && B.shape && A.col !== B.col && A.shape === B.shape) issues.push({ level: 'FAIL', sel: `${A.sel} ↔ ${B.sel}`, msg: `different colours share the shape "${A.shape}"` });
  }
  const noMono = tokens.filter(t => !t.monogram);
  if (noMono.length) issues.push({ level: 'REVIEW', sel: noMono.map(t => t.sel).join(', '), msg: 'no 2-letter monogram in the DOM (canvas-drawn?): check the greyscale screenshot' });
  for (const t of tokens) if (t.shape && COLS[t.col] && !COLS[t.col].shapes.includes(t.shape)) issues.push({ level: 'FAIL', sel: t.sel, msg: `colour ${COLS[t.col].name} should use the ${COLS[t.col].shapes[0]} shape (§4.1), found "${t.shape}"` });
  notes.push('tokens: ' + tokens.map(t => `${t.kind}${t.i}=${t.id}/${t.col}${t.monogram ? '/' + t.monogram : ''}${t.shape ? '/' + t.shape : ''}`).join(', '));
  notes.push(`for visual review: tools/shots/a11y/${vp}-greyscale-rack.png, ${vp}-greyscale-shop.png`);
  record('j', vp, label, { issues, notes, stats: { tokens: tokens.length, pairs, minDiff: pairs ? fx(Math.min(...tokens.flatMap((t, a) => tokens.map((u, b) => (b > a && !(t.id === u.id && t.col === u.col) ? m[a][b] : Infinity))))) : null } });
}

/* ============================================================================
   (l) HOVER
============================================================================ */
async function hoverAudit(G, label) {
  const { page, vp } = G;
  const r = await H(page, () => window.__A11Y.hoverScan());
  const issues = [], notes = [];
  for (const x of r.rules) {
    issues.push({ level: x.hasFocusTwin ? 'WARN' : 'FAIL', sel: x.selector, msg: `:hover reveals content (${x.props})` + (x.hasFocusTwin ? '; has a :focus twin, but touch has no hover' : '; no :focus/:focus-visible/:focus-within twin') + (x.media ? ` [@${x.media}]` : '') });
  }
  for (const t of r.titles) issues.push({ level: 'WARN', sel: t.sel, msg: `title tooltip "${t.title}" is hover-only (not in the accessible name or visible text)` });
  if (r.unreadable.length) notes.push('stylesheets not scannable (cross-origin): ' + r.unreadable.join(', '));
  notes.push(`${r.total} :hover selector(s) scanned, ${r.cosmetic} cosmetic only`);
  const js = await hoverListeners(page);
  if (js.length) notes.push('JS hover listeners (review what they show): ' + js.map(l => l.error ? l.error : `${l.type} on ${l.sel}`).join('; '));
  record('l', vp, label, { issues, notes, stats: { hoverRules: r.total, cosmetic: r.cosmetic, jsListeners: js } });
}

/* ============================================================================
   (h) REDUCED MOTION
============================================================================ */
function motionIssues(anims, where) {
  const issues = [];
  const seen = new Set();
  for (const a of anims) {
    if (a.playState !== 'running' && a.playState !== 'pending') continue;
    const long = (a.duration != null && a.duration > 1.01) || a.iterations === Infinity;
    if (!long) continue;
    const key = a.target + '|' + a.name + '|' + a.kind;
    if (seen.has(key)) continue; seen.add(key);
    const css = a.kind === 'CSSAnimation' || a.kind === 'CSSTransition';
    const fadeOnly = a.props.length && a.props.every(p => p === 'opacity');
    if (css) issues.push({ level: 'FAIL', sel: a.target, msg: `${a.kind} "${a.name}" runs ${a.duration}ms${a.iterations === Infinity ? ' ×∞' : ''} under reduced motion (${where})` });
    else issues.push({ level: fadeOnly ? 'INFO' : 'FAIL', sel: a.target, msg: `JS animation (${a.props.join(', ') || '?'}) ${a.duration}ms${a.iterations === Infinity ? ' ×∞' : ''} under reduced motion (${where})` + (fadeOnly ? ': opacity fade (allowed, §9)' : '') });
  }
  return issues;
}
async function sampleAnims(page, ms, every = 100) {
  const all = []; const t0 = Date.now();
  while (Date.now() - t0 < ms) { try { all.push(...(await page.evaluate(() => window.__A11Y.animations()))); } catch (e) { /* ignore */ } await sleep(every); }
  return all;
}
async function reducedMotionAudit() {
  const vp = PRIMARY;
  // 1) OS-level prefers-reduced-motion: reduce
  let G = null;
  try {
    G = await newGamePage(vp, { reducedMotion: 'reduce' });
    const { page } = G;
    const label = 'OS reduce (auto)';
    if (!G.booted) record('h', vp, label, { issues: [{ level: 'FAIL', sel: '#app', msg: 'game did not reach BUILD' }] });
    await guard('h', vp, label, async () => {
      const issues = [], notes = [];
      const ms = await page.evaluate(() => window.__A11Y.motionState());
      if (!ms.mq) issues.push({ level: 'FAIL', sel: 'matchMedia', msg: 'emulation failed: prefers-reduced-motion did not match' });
      if (ms.gameReduced === undefined) issues.push({ level: 'WARN', sel: 'GAME.reducedMotion', msg: 'GAME.reducedMotion not accessible' });
      else if (ms.gameReduced !== true) issues.push({ level: 'FAIL', sel: 'GAME.reducedMotion', msg: `GAME.reducedMotion is ${ms.gameReduced} under OS reduce with setting "${ms.setting}"` });
      if (ms.fxReduced === undefined) notes.push('FX.stats() exposes no reduced-motion flag' + (ms.fxStats ? ` (keys: ${Object.keys(ms.fxStats).join(', ')})` : ' (FX.stats missing)') + '; relying on GAME.reducedMotion (core passes it to FX.setOptions)');
      else if (ms.fxReduced !== true) issues.push({ level: 'FAIL', sel: 'FX', msg: `FX.stats().${ms.fxKey} is ${ms.fxReduced}` });
      else notes.push(`FX.stats().${ms.fxKey} = true`);
      notes.push(`data-motion="${ms.dataMotion}"`);
      issues.push(...motionIssues(await sampleAnims(page, 600), 'at rest'));
      await shot(page, `${vp}-reduced-motion`);
      const show = await playShow(G, { onResolving: async () => { issues.push(...motionIssues(await sampleAnims(page, 1800, 90), 'during a show')); await shot(page, `${vp}-reduced-motion-resolving`); } });
      if (!show.ok) notes.push('show did not complete: ' + show.why);
      issues.push(...motionIssues(await sampleAnims(page, 700), 'after the show'));
      const p = await purchase(G);
      if (p.ok) issues.push(...motionIssues(await sampleAnims(page, 700, 70), 'after a purchase'));
      else notes.push('no purchase: ' + p.why);
      record('h', vp, label, { issues, notes, stats: ms });
    });
  } catch (e) { record('h', vp, 'OS reduce (auto)', { error: e }); }
  finally { if (G) { REPORT.console.push(...G.consoleLog); await G.ctx.close().catch(() => {}); } }
  // 2) the in-game setting: Reduced motion = On, OS = no-preference
  G = null;
  try {
    G = await newGamePage(vp, { reducedMotion: 'no-preference' });
    const { page } = G;
    const label = 'Settings: Reduced motion On';
    await guard('h', vp, label, async () => {
      const issues = [], notes = [];
      const before = await page.evaluate(() => window.__A11Y.motionState());
      if (before.gameReduced === true) issues.push({ level: 'WARN', sel: 'GAME.reducedMotion', msg: 'reduced motion already on with no OS preference' });
      const r = await page.evaluate(() => window.__A11Y.game('setSetting', 'reducedMotion', 'on'));
      if (!r.ok) { record('h', vp, label, { skip: 'GAME.setSetting unavailable: ' + r.err }); return; }
      await sleep(200);
      const ms = await page.evaluate(() => window.__A11Y.motionState());
      if (ms.gameReduced !== true) issues.push({ level: 'FAIL', sel: 'GAME.reducedMotion', msg: `setting "on" did not enable reduced motion (GAME.reducedMotion=${ms.gameReduced})` });
      if (ms.fxReduced !== undefined && ms.fxReduced !== true) issues.push({ level: 'FAIL', sel: 'FX', msg: `FX.stats().${ms.fxKey} is ${ms.fxReduced} after the setting` });
      notes.push(`data-motion="${ms.dataMotion}"`);
      const show = await playShow(G, { onResolving: async () => { issues.push(...motionIssues(await sampleAnims(page, 1500, 90), 'during a show (setting on)')); } });
      if (!show.ok) notes.push('show did not complete: ' + show.why);
      record('h', vp, label, { issues, notes, stats: ms });
    });
  } catch (e) { record('h', vp, 'Settings: Reduced motion On', { error: e }); }
  finally { if (G) { REPORT.console.push(...G.consoleLog); await G.ctx.close().catch(() => {}); } }
}

/* ============================================================================
   PER-VIEWPORT FLOW
============================================================================ */
async function auditViewport(vp, full) {
  let G;
  try { G = await newGamePage(vp); }
  catch (e) { for (const c of 'abcdk') record(c, vp, 'load', { error: e }); return; }
  const { page } = G;
  try {
    const s = await uiState(page);
    if (!G.booted) {
      REPORT.notes.push(`${vp}: game did not reach BUILD (data-ui=${s.ui}); auditing whatever is on screen`);
      for (const c of 'abcdefghijkl') if (want(c) && 'abcdk'.includes(c)) record(c, vp, 'boot', { issues: [{ level: 'FAIL', sel: '#app', msg: `game did not reach BUILD within ${OPTS.timeout}ms (data-ui=${s.ui})` }] });
    }
    await shot(page, `${vp}-build-s1`);
    await layoutAudit(G, 'BUILD show 1');

    // ---- the scripted show (g): build open → light → result → build open → purchase
    const marks = { beforeLight: (await liveLog(page)).length };
    let resolvingChecked = false;
    const res = await playShow(G, {
      onResolving: async () => {
        marks.resolving = true;
        await sleep(250);
        await shot(page, `${vp}-resolving`);
        await guard('k', vp, 'RESOLVING', () => overflowAudit(G, 'RESOLVING', null, null, { fire: true, text: false }));
        await guard('b', vp, 'RESOLVING (#fire)', async () => {
          const c = await H(page, () => { const f = document.getElementById('fire'); return f ? [{ id: window.__A11Y.reg(f), sel: '#fire', text: f.textContent.trim() }] : []; });
          const ax = c.length ? await axInfo(page, [c[0].id]) : {};
          const n = c.length && ax[c[0].id] ? ax[c[0].id].name : '';
          record('b', vp, 'RESOLVING (#fire)', { issues: !c.length ? [{ level: 'FAIL', sel: '#fire', msg: '#fire missing while resolving' }] : !n || !/[\p{L}\p{N}]/u.test(n) ? [{ level: 'FAIL', sel: '#fire', msg: `#fire has no usable name while resolving ("${n}")` }] : [], notes: [`#fire name while resolving: "${n}"`] });
        });
        resolvingChecked = true;
      },
    });
    if (!res.ok) REPORT.notes.push(`${vp}: scripted show did not complete: ${res.why}`);
    if (!resolvingChecked) REPORT.notes.push(`${vp}: RESOLVING state not observed (instant results?): RESOLVING checks skipped`);
    await shot(page, `${vp}-build-s2`);
    await layoutAudit(G, 'BUILD show 2 (shop, result card)');
    marks.beforeBuy = (await liveLog(page)).length;
    const buy = await purchase(G);
    marks.bought = buy.ok; marks.buyWhy = buy.why;
    if (buy.ok && buy.via && !/pointer/.test(buy.via)) REPORT.notes.push(`${vp}: purchase made via ${buy.via}`);
    await sleep(300);
    marks.afterBuy = (await liveLog(page)).length;
    if (vp === PRIMARY) {
      await guard('j', vp, 'BUILD show 2', () => greyscaleAudit(G, 'BUILD show 2'));
      await guard('l', vp, 'BUILD show 2', () => hoverAudit(G, 'BUILD show 2'));
    }
    if (!full) {
      await guard('g', vp, 'scripted show', async () => {
        const log = await liveLog(page);
        const regions = await page.evaluate(() => window.__A11Y.liveRegions());
        const r = evalLive(vp, log, marks, regions);
        record('g', vp, 'scripted show', r);
      });
      return;
    }

    // ---- keyboard in BUILD (e, f)
    if (want('e') || want('f')) await keyboardBuild(G, 'BUILD show 2');

    // ---- overlays (f): pause, settings (+ i), logbook, help, inspect
    const fromFire = async key => { await page.evaluate(() => window.__A11Y.focusSel('#fire')); await page.keyboard.press(key); };
    if ((want('f') || want('e') || want('i') || want('a')) && overBudget(60)) REPORT.notes.push(`${vp}: overlay checks skipped (time budget)`);
    else if (want('f') || want('e') || want('i') || want('a')) {
      await auditOverlay(G, 'pause', [
        { name: 'key P', run: () => fromFire('p') },
        { name: 'key Esc', run: () => fromFire('Escape') },
        { name: 'Enter on [data-act=pause]', run: async () => { if (!(await page.evaluate(() => window.__A11Y.focusSel('[data-act="pause"]')))) return false; await page.keyboard.press('Enter'); } },
      ], { expectFocusName: /resume/i });
      // settings via pause → Settings
      let settingsBtn = null;
      const settingsOpeners = [
        { name: 'pause → Settings (Enter)', run: async () => {
          await fromFire('p'); if (!(await waitOpen(page, '#pause-menu', true, 1200))) { await fromFire('Escape'); if (!(await waitOpen(page, '#pause-menu', true, 1200))) return false; }
          settingsBtn = await findInOverlay(page, '#pause-menu', /settings/i);
          if (!settingsBtn) return false;
          await page.evaluate(id => window.__A11Y.focusId(id), settingsBtn.id); await page.keyboard.press('Enter');
        } },
      ];
      const sres = await auditOverlay(G, 'settings', settingsOpeners, { close: false });
      if (sres) {
        // (i) high contrast through the settings control
        await guard('i', vp, 'Settings: High contrast', async () => {
          const issues = [], notes = [];
          const ctrl = await findInOverlay(page, '#settings', /high.?contrast/i);
          let via = null;
          if (ctrl) {
            await page.evaluate(id => window.__A11Y.focusId(id), ctrl.id);
            if (ctrl.tag === 'select') await page.evaluate(id => { const e = window.__A11Y.get(id); const o = [...e.options].find(x => /on|high|yes/i.test(x.textContent)); if (o) { e.value = o.value; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); } }, ctrl.id);
            else await page.keyboard.press('Space');
            await sleep(250);
            if ((await page.evaluate(() => document.documentElement.getAttribute('data-contrast'))) !== 'high' && ctrl.tag !== 'select') { await page.keyboard.press('Enter'); await sleep(250); }
            via = `settings control ${ctrl.sel} (keyboard)`;
          } else issues.push({ level: 'FAIL', sel: '#settings', msg: 'no control named "High contrast" in Settings' });
          let attr = await page.evaluate(() => document.documentElement.getAttribute('data-contrast'));
          if (attr !== 'high') {
            if (ctrl) issues.push({ level: 'FAIL', sel: ctrl.sel, msg: `toggling the High contrast control did not set <html data-contrast="high"> (got ${attr})` });
            const r = await page.evaluate(() => window.__A11Y.game('setSetting', 'highContrast', true));
            await sleep(200);
            attr = await page.evaluate(() => document.documentElement.getAttribute('data-contrast'));
            if (attr !== 'high') issues.push({ level: 'FAIL', sel: 'html', msg: `GAME.setSetting('highContrast', true) did not set data-contrast="high" (${r.err || attr})` });
            else via = 'GAME.setSetting fallback';
          }
          notes.push('enabled via ' + via);
          record('i', vp, 'Settings: High contrast', { issues, notes });
        });
        // close settings (Esc) → focus back in pause, close pause → #fire
        const fIssues = [];
        await page.keyboard.press('Escape');
        if (!(await waitOpen(page, '#settings', false, 1500))) fIssues.push({ level: 'FAIL', sel: '#settings', msg: 'Esc did not close Settings' });
        else if (settingsBtn && (await isOpen(page, '#pause-menu'))) {
          const ok = await page.evaluate(id => document.activeElement === window.__A11Y.get(id), settingsBtn.id);
          const fi = await page.evaluate(() => window.__A11Y.focusInfo(null));
          if (!ok) fIssues.push({ level: 'FAIL', sel: '#settings', msg: `closing Settings did not return focus to the pause menu's Settings button (now on ${fi.sel || 'body'})` });
          await page.keyboard.press('Escape');
          if (!(await waitOpen(page, '#pause-menu', false, 1500))) fIssues.push({ level: 'FAIL', sel: '#pause-menu', msg: 'Esc did not close the pause menu after Settings' });
          else {
            await sleep(120);
            const ok2 = await page.evaluate(() => document.activeElement === document.getElementById('fire'));
            const fi2 = await page.evaluate(() => window.__A11Y.focusInfo(null));
            if (!ok2) fIssues.push({ level: 'FAIL', sel: '#pause-menu', msg: `closing pause (after Settings) did not restore focus to #fire (now on ${fi2.sel || 'body'})` });
          }
        }
        if (want('f')) record('f', vp, 'settings overlay: close + restore chain', { issues: fIssues });
        // (a) in high contrast
        if ((await page.evaluate(() => document.documentElement.getAttribute('data-contrast'))) === 'high') {
          while (await page.evaluate(() => { const g = typeof GAME !== 'undefined' ? GAME : null; return g && g.top ? g.top() : null; }).catch(() => null)) { await page.keyboard.press('Escape'); await sleep(150); if (await isOpen(page, '#end')) break; }
          await sleep(200);
          await shot(page, `${vp}-high-contrast`);
          await layoutAudit(G, 'BUILD (high contrast)', { checks: 'a' });
          await guard('i', vp, 'high contrast off', async () => {
            const r = await page.evaluate(() => window.__A11Y.game('setSetting', 'highContrast', false));
            await sleep(200);
            const attr = await page.evaluate(() => document.documentElement.getAttribute('data-contrast'));
            record('i', vp, 'high contrast off', { issues: attr === 'high' ? [{ level: 'FAIL', sel: 'html', msg: 'turning High contrast off left data-contrast="high"' }] : [], notes: [r.ok ? 'GAME.setSetting(highContrast,false)' : 'setSetting unavailable: ' + r.err] });
          });
        }
      } else if (want('i')) {
        const r = await page.evaluate(() => window.__A11Y.game('setSetting', 'highContrast', true));
        await sleep(200);
        const attr = await page.evaluate(() => document.documentElement.getAttribute('data-contrast'));
        record('i', vp, 'GAME.setSetting', { issues: [{ level: 'FAIL', sel: '#settings', msg: 'Settings overlay not reachable; High contrast checked programmatically only' }, ...(attr === 'high' ? [] : [{ level: 'FAIL', sel: 'html', msg: `data-contrast="${attr}" after setSetting (${r.err || ''})` }])] });
        await page.evaluate(() => window.__A11Y.game('setSetting', 'highContrast', false));
      }
      // make sure nothing is open
      for (let k = 0; k < 4; k++) { const t = (await uiState(page)).top; if (!t) break; await page.keyboard.press('Escape'); await sleep(150); }

      await auditOverlay(G, 'logbook', [
        { name: 'key L', run: () => fromFire('l') },
        { name: 'pause → Logbook', run: async () => { await fromFire('p'); if (!(await waitOpen(page, '#pause-menu', true, 1200))) return false; const b = await findInOverlay(page, '#pause-menu', /logbook/i); if (!b) return false; await page.evaluate(id => window.__A11Y.focusId(id), b.id); await page.keyboard.press('Enter'); } },
      ]);
      for (let k = 0; k < 4; k++) { const t = (await uiState(page)).top; if (!t) break; await page.keyboard.press('Escape'); await sleep(150); }
      await auditOverlay(G, 'help', [
        { name: 'key ?', run: () => fromFire('?') },
        { name: 'pause → Help', run: async () => { await fromFire('p'); if (!(await waitOpen(page, '#pause-menu', true, 1200))) return false; const b = await findInOverlay(page, '#pause-menu', /help|how to play/i); if (!b) return false; await page.evaluate(id => window.__A11Y.focusId(id), b.id); await page.keyboard.press('Enter'); } },
      ]);
      for (let k = 0; k < 4; k++) { const t = (await uiState(page)).top; if (!t) break; await page.keyboard.press('Escape'); await sleep(150); }
      // inspect: from a filled tube with the I key
      const tube = await page.evaluate(() => { const i = window.__A11Y.gameInfo(); const t = i.tubes.find(x => x.shell); return t ? `[data-tube="${t.i}"]` : null; });
      if (tube) {
        await auditOverlay(G, 'inspect', [{ name: 'key I on a tube', run: async () => { await page.evaluate(s => window.__A11Y.focusSel(s), tube); await page.keyboard.press('i'); } }], { restoreTo: tube });
      }
      for (let k = 0; k < 4; k++) { const t = (await uiState(page)).top; if (!t) break; await page.keyboard.press('Escape'); await sleep(150); }
    }

    // ---- play on to the run end (F2 workshop state on the way, g assertive, end overlay)
    let ended = false, sawF2 = false, rainCheck = false, endT = 0, shows = 0;
    for (; shows < 12; shows++) {
      if (overBudget(45)) { REPORT.notes.push(`${vp}: stopped playing after ${shows + 1} show(s) (time budget); ending the run by Abandon`); break; }
      const st = await uiState(page);
      if (st.ui === 'END' || (await isOpen(page, '#end'))) { ended = true; break; }
      const ws = await page.evaluate(() => { const w = document.getElementById('workshop'); return !!w && window.__A11Y.shown(w) && window.__A11Y.controls('#workshop').length > 0; });
      if (ws && !sawF2) {
        sawF2 = true;
        await shot(page, `${vp}-build-f2`);
        await layoutAudit(G, 'BUILD F2 (workshop)', { checks: 'abcdk' });
        if (want('e')) {
          await page.evaluate(() => window.__A11Y.sentinel(true));
          const walk = await tabWalk(page, { max: 150 });
          await page.evaluate(() => window.__A11Y.sentinel(false));
          const { problems, sequence } = orderProblems(walk.stops);
          const fv = await focusVisibleAudit(G, walk.stops.filter(s => s.group === 'workshop' || s.group === 'Sponsor'), 'BUILD F2 (workshop)');
          record('e', vp, 'BUILD F2 (workshop)', { issues: [...problems, ...fv.issues], notes: [`Tab sequence: ${sequence}`], stats: { stops: walk.stops.length, perStop: fv.perStop } });
        }
      }
      const log0 = (await liveLog(page)).length;
      const r = await playShow(G);
      if (!r.ok) { REPORT.notes.push(`${vp}: show ${shows + 2} did not complete: ${r.why}`); break; }
      if ((await liveLog(page)).slice(log0).some(x => x.region === 'live-assertive' && /rain check/i.test(x.text))) rainCheck = true;
      const hist = await page.evaluate(() => { try { const s = window.__game.state(); const h = s.runStats && s.runStats.history; return h && h.length ? h[h.length - 1] : null; } catch (e) { return null; } });
      if (hist && hist.pass === false && !rainCheck) rainCheck = 'miss';
      if (r.ended || r.state.ui === 'END') { ended = true; endT = (await page.evaluate(() => performance.now())); break; }
    }
    if (!ended) {
      // abandon through the pause menu (2-tap), keyboard only
      await page.evaluate(() => window.__A11Y.focusSel('#fire'));
      await page.keyboard.press('p');
      if (await waitOpen(page, '#pause-menu', true, 1500)) {
        const b = await findInOverlay(page, '#pause-menu', /abandon/i);
        if (b) { await page.evaluate(id => window.__A11Y.focusId(id), b.id); await page.keyboard.press('Enter'); await sleep(200); await page.evaluate(id => window.__A11Y.focusId(id), b.id); await page.keyboard.press('Enter'); }
      }
      if (await waitFor(page, x => x.ui === 'END', 3000)) { ended = true; REPORT.notes.push(`${vp}: run ended by Abandon (pause menu, keyboard)`); }
      else { await page.evaluate(() => window.__A11Y.game('abandon')); if (await waitFor(page, x => x.ui === 'END', 3000)) { ended = true; REPORT.notes.push(`${vp}: run ended by GAME.abandon()`); } }
      endT = await page.evaluate(() => performance.now());
    }
    if (!sawF2 && want('e')) record('e', vp, 'BUILD F2 (workshop)', { skip: 'the workshop row never appeared before the run ended' });
    await guard('g', vp, 'scripted show + run end', async () => {
      await sleep(400);
      const log = await liveLog(page);
      const regions = await page.evaluate(() => window.__A11Y.liveRegions());
      const r = evalLive(vp, log, marks, regions, { ended, endT, rainCheck: rainCheck === true || rainCheck === 'miss' ? rainCheck : false });
      if (rainCheck === 'miss' && !log.some(x => x.region === 'live-assertive' && /rain check/i.test(x.text))) {
        // a miss happened; only a spent rain check must be announced (a miss with no rain check ends the run)
        r.issues = r.issues.filter(i => !/Rain check used/.test(i.msg));
        r.notes.push('a show was missed; no "Rain check used" announcement seen (only required when the rain check is spent)');
      }
      record('g', vp, 'scripted show + run end', r);
    });
    if (ended) {
      await waitOpen(page, '#end', true, 4000);
      const endRes = await auditOverlay(G, 'end', [{ name: 'run end (automatic)', run: async () => true }], { close: false, expectFocus: '#run-it-back' });
      if (endRes && want('f')) {
        await page.evaluate(() => window.__A11Y.focusSel('#run-it-back'));
        await page.keyboard.press('Enter');
        const nb = await waitFor(page, x => buildLike(x) && !(x.top === 'end'), 3000);
        const fi = await page.evaluate(() => window.__A11Y.focusInfo(null));
        record('f', vp, 'end: Run it back (Enter)', { issues: nb ? [] : [{ level: 'FAIL', sel: '#run-it-back', msg: 'Enter on Run it back did not start a new run within 3 s' }], notes: [`focus after the new run: ${fi.sel || 'body'}`] });
      }
    } else if (want('f')) record('f', vp, 'end overlay', { skip: 'the run never ended' });
  } catch (e) {
    REPORT.notes.push(`${vp}: flow aborted: ${e.message}`);
    record('f', vp, 'flow', { error: e });
  } finally {
    REPORT.console.push(...G.consoleLog);
    await G.ctx.close().catch(() => {});
  }
}

/* ============================================================================
   OUTPUT
============================================================================ */
function buildTable() {
  const cols = [...OPTS.viewports];
  const rows = [];
  for (const [c, title] of Object.entries(CHECKS)) {
    if (!want(c)) continue;
    const cells = {}, counts = {};
    for (const vp of cols) {
      const runs = REPORT.runs.filter(r => r.check === c && r.viewport === vp);
      cells[vp] = runs.length ? worst(runs.map(r => r.status)) : '-';
      counts[vp] = runs.reduce((n, r) => n + r.issues.filter(i => i.level === cells[vp]).length, 0);
    }
    const all = REPORT.runs.filter(r => r.check === c);
    const result = all.length ? worst(all.map(r => r.status)) : 'SKIP';
    rows.push({ check: c, title, cells, counts, result });
  }
  return rows;
}
/** Deduplicated FAIL/WARN/REVIEW/ERROR findings grouped by owning module (for routing fixes). */
function moduleSummary() {
  const out = {};
  for (const run of REPORT.runs) {
    const list = run.error ? [{ level: 'ERROR', sel: '(harness)', msg: run.error.split('\n')[0], module: 'harness' }] : run.issues;
    for (const i of list) {
      if (i.level === 'INFO' || i.level === 'PASS') continue;
      const m = i.module || moduleOf(run.check, i, run.context);
      const g = out[m] = out[m] || { files: MODULE_FILES[m] || m, counts: {}, findings: [] };
      const key = `${run.check}|${i.level}|${i.sel}|${String(i.msg).replace(/[\d.]+(px|:1|ms|\/255)?/g, '#')}`;
      let f = g.findings.find(x => x.key === key);
      if (!f) { f = { key, check: run.check, level: i.level, sel: i.sel, msg: i.msg, where: [] }; g.findings.push(f); g.counts[i.level] = (g.counts[i.level] || 0) + 1; }
      const w = `${run.viewport} ${run.context}`;
      if (!f.where.includes(w)) f.where.push(w);
    }
  }
  for (const g of Object.values(out)) { g.findings.sort((a, b) => SEV[b.level] - SEV[a.level] || a.check.localeCompare(b.check)); for (const f of g.findings) delete f.key; }
  return out;
}
function printModules(mods) {
  const order = ['ERROR', 'FAIL', 'WARN', 'REVIEW'];
  const lines = ['Findings by owning module (deduplicated; REVIEW items are counted only, see JSON):'];
  const names = Object.keys(mods).sort((a, b) => (mods[b].counts.FAIL || 0) - (mods[a].counts.FAIL || 0));
  for (const m of names) {
    const g = mods[m];
    lines.push(`  [${m}] ${g.files}: ${order.filter(l => g.counts[l]).map(l => `${g.counts[l]} ${l}`).join(', ')}`);
    for (const f of g.findings.filter(x => x.level !== 'REVIEW').slice(0, 25)) {
      const where = f.where.length > 3 ? `${f.where.slice(0, 3).join('; ')} (+${f.where.length - 3})` : f.where.join('; ');
      lines.push(`    ${f.level.padEnd(5)} (${f.check}) ${f.sel}: ${f.msg.slice(0, 220)}  @ ${where}`);
    }
    const more = g.findings.filter(x => x.level !== 'REVIEW').length - 25;
    if (more > 0) lines.push(`    … ${more} more in the JSON report (byModule.${m})`);
  }
  return lines;
}
function printReport(rows) {
  const vps = OPTS.viewports;
  const pad = (s, n) => String(s).padEnd(n);
  const cell = (st, n) => (st === '-' ? '-' : st + (n && st !== 'PASS' && st !== 'SKIP' && st !== 'ERROR' ? ' ' + n : ''));
  const W = 46;
  const lines = [];
  lines.push('');
  lines.push(`Ooh × Aah: accessibility and layout audit (${path.relative(process.cwd(), OPTS.file) || OPTS.file})`);
  lines.push(`Chromium ${REPORT.browser} · ${((Date.now() - T0) / 1000).toFixed(1)} s · query "${OPTS.query}" · full flow at ${OPTS.full.filter(v => vps.includes(v)).join(', ')}`);
  lines.push('');
  lines.push(pad('Check', W) + vps.map(v => pad(v, 11)).join('') + 'RESULT');
  lines.push('-'.repeat(W + vps.length * 11 + 6));
  for (const r of rows) lines.push(pad(`(${r.check}) ${r.title}`, W) + vps.map(v => pad(cell(r.cells[v], r.counts[v]), 11)).join('') + r.result);
  lines.push('-'.repeat(W + vps.length * 11 + 6));
  const overall = worst(rows.map(r => r.result).map(s => (s === 'ERROR' ? 'FAIL' : s)));
  lines.push(`OVERALL: ${SEV[overall] >= SEV.FAIL ? 'FAIL' : 'PASS'}${overall === 'WARN' || overall === 'REVIEW' ? ' (with ' + overall + ' items)' : ''}`);
  lines.push('Cells: status + number of findings at that level. REVIEW = needs visual inspection (canvas/image background). SKIP = state not reachable.');
  lines.push('');
  REPORT.byModule = moduleSummary();
  lines.push(...printModules(REPORT.byModule), '');
  // per-check details (--details)
  for (const r of (flag('details') ? rows : [])) {
    const runs = REPORT.runs.filter(x => x.check === r.check);
    const agg = new Map();
    for (const run of runs) {
      if (run.error) { const k = 'ERROR|' + run.error.split('\n')[0]; const e = agg.get(k) || { level: 'ERROR', sel: '(harness)', msg: run.error.split('\n')[0], where: [] }; e.where.push(`${run.viewport} ${run.context}`); agg.set(k, e); continue; }
      for (const i of run.issues) {
        if (i.level === 'INFO') continue;
        const k = `${i.level}|${i.sel}|${i.msg.replace(/[\d.]+(px|:1|ms)/g, '#')}`;
        const e = agg.get(k) || { level: i.level, sel: i.sel, msg: i.msg, where: [] };
        e.where.push(`${run.viewport} ${run.context}`);
        agg.set(k, e);
      }
    }
    const skips = runs.filter(x => x.status === 'SKIP').map(x => `${x.viewport} ${x.context}: ${x.notes[0]}`);
    if (!agg.size && !skips.length) continue;
    lines.push(`(${r.check}) ${r.title}: ${r.result}`);
    const list = [...agg.values()].sort((a, b) => SEV[b.level] - SEV[a.level]);
    for (const e of list.slice(0, 30)) {
      const where = [...new Set(e.where)];
      lines.push(`  ${pad(e.level, 6)} ${e.sel}`);
      lines.push(`         ${e.msg}`);
      lines.push(`         @ ${where.slice(0, 4).join('; ')}${where.length > 4 ? ` (+${where.length - 4} more)` : ''}`);
    }
    if (list.length > 30) lines.push(`  … ${list.length - 30} more in the JSON report`);
    for (const s of skips.slice(0, 5)) lines.push(`  SKIP   ${s}`);
    lines.push('');
  }
  if (REPORT.notes.length) { lines.push('Notes:'); for (const n of [...new Set(REPORT.notes)]) lines.push('  - ' + n); lines.push(''); }
  const errs = REPORT.console.filter(c => c.type === 'pageerror' || c.type === 'error');
  if (errs.length) { lines.push(`Page console errors (${errs.length}, first 5):`); for (const c of errs.slice(0, 5)) lines.push(`  [${c.vp}] ${c.text.split('\n')[0].slice(0, 200)}`); lines.push(''); }
  lines.push(`JSON report: ${path.relative(process.cwd(), OPTS.json)} · screenshots: ${path.relative(process.cwd(), OPTS.out)}/ (${SHOTS.length})`);
  console.log(lines.join('\n'));
  return overall;
}

/* ============================================================================
   MAIN
============================================================================ */
async function main() {
  fs.mkdirSync(OPTS.out, { recursive: true });
  const fail = (msg, code = 2) => {
    console.error('a11y audit: ' + msg);
    REPORT.summary = { status: 'ERROR', error: msg };
    try { fs.writeFileSync(OPTS.json, JSON.stringify(REPORT, null, 2)); } catch (e) { /* ignore */ }
    process.exit(code);
  };
  if (!fs.existsSync(OPTS.file)) fail(`page not found: ${OPTS.file} (build it first: node tools/build.mjs)`);
  if (!chromium) fail('Playwright not found (expected under /opt/node22/lib/node_modules/playwright)');
  if (!OPTS.keepShots) for (const f of fs.readdirSync(OPTS.out)) if (/\.png$/.test(f)) fs.rmSync(path.join(OPTS.out, f), { force: true });
  const html = fs.readFileSync(OPTS.file, 'utf8');
  const stat = fs.statSync(OPTS.file);
  REPORT.targetInfo = { bytes: stat.size, mtime: stat.mtime.toISOString() };
  const wrapped = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + html + '</body></html>';
  SERVER = http.createServer((req, res) => {
    const u = (req.url || '/').split('?')[0];
    if (u === '/' || u === '/index.html') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(wrapped); }
    else { res.writeHead(404); res.end(); }
  });
  await new Promise(r => SERVER.listen(0, '127.0.0.1', r));
  BASE_URL = `http://127.0.0.1:${SERVER.address().port}`;
  try { BROWSER = await chromium.launch({ args: ['--disable-gpu', '--font-render-hinting=none'] }); }
  catch (e) { SERVER.close(); fail('Chromium failed to launch: ' + e.message); }
  REPORT.browser = BROWSER.version();
  const watchdog = setTimeout(() => {
    console.error(`a11y audit: watchdog fired (budget ${OPTS.budget}s + 90s); writing the partial report`);
    REPORT.notes.push(`WATCHDOG: the run exceeded ${OPTS.budget + 90}s and was cut short; later checks are missing`);
    try { const rows = buildTable(); REPORT.table = rows; REPORT.screenshots = SHOTS; printReport(rows); } catch (e) { /* ignore */ }
    REPORT.summary = { status: 'ERROR', error: 'watchdog timeout', seconds: +((Date.now() - T0) / 1000).toFixed(1) };
    try { fs.writeFileSync(OPTS.json, JSON.stringify(REPORT, null, 2)); } catch (e) { /* ignore */ }
    process.exit(2);
  }, (OPTS.budget + 90) * 1000);
  watchdog.unref();
  const ictx = await BROWSER.newContext();
  IMGPAGE = await ictx.newPage();
  await IMGPAGE.setContent('<!doctype html><title>img</title>');
  await IMGPAGE.evaluate(imgHelpers);

  try {
    // primary viewport first, then reduced motion (so a tight budget still covers h), then the rest
    const order = [PRIMARY, 'h', ...OPTS.viewports.filter(v => v !== PRIMARY)];
    for (const step of order) {
      if (step === 'h' && !want('h')) continue;
      if (overBudget(step === 'h' ? 25 : 35)) {
        const why = `skipped: --budget ${OPTS.budget}s exhausted`;
        REPORT.notes.push(`${step === 'h' ? 'reduced motion' : step}: ${why}`);
        if (step === 'h') record('h', PRIMARY, 'reduced motion', { skip: why });
        else for (const c of 'abcdk') if (want(c)) record(c, step, 'viewport', { skip: why });
        continue;
      }
      log(step === 'h' ? 'reduced motion' : 'viewport ' + step);
      if (step === 'h') await reducedMotionAudit();
      else await auditViewport(step, OPTS.full.includes(step));
    }
  } finally {
    await BROWSER.close().catch(() => {});
    SERVER.close();
  }
  const rows = buildTable();
  REPORT.table = rows;
  REPORT.screenshots = SHOTS;
  const overall = printReport(rows);
  const failed = SEV[overall] >= SEV.FAIL;
  REPORT.summary = { status: failed ? 'FAIL' : 'PASS', worst: overall, seconds: +((Date.now() - T0) / 1000).toFixed(1), byCheck: Object.fromEntries(rows.map(r => [r.check, r.result])) };
  fs.writeFileSync(OPTS.json, JSON.stringify(REPORT, null, 2));
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error('a11y audit crashed:', e.stack || e); try { REPORT.summary = { status: 'ERROR', error: String(e.stack || e) }; fs.writeFileSync(OPTS.json, JSON.stringify(REPORT, null, 2)); } catch (x) { /* ignore */ } process.exit(2); });
