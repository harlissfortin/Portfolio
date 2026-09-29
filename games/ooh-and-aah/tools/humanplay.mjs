#!/usr/bin/env node
/*
 * tools/humanplay.mjs: a human-proxy playtester for Ooh × Aah.
 *
 * It plays the built single-file game (index.html) ONLY through the real UI:
 *   - pointer taps and drags, per the CONTRACT interaction model ("tap a card, then a tube, to
 *     buy into that tube (or upgrade its twin). Drag works too."), tool buttons ([data-act]),
 *     and the #fire button;
 *   - no window.__game.act, no keyboard shortcuts for game actions.
 * window.__game.state() and GAME.on('sim') are read ONLY as telemetry (to log Applause/target,
 * fusions and multipliers); the policy itself reads nothing but the DOM.
 *
 * The policy is a readable heuristic that looks at what a player sees:
 *   1. Shop: lift each affordable card (tap; the card gets class "sel") and read the local chips on
 *      every tube it can drop on (class "can"): +Ooh, +Aah, ×, ✦, Crowd, +$ (never a total), the
 *      tube's "sees N", and the card badges ("✦ Fuses", "Twin ★2 $5"). Score = Ooh/10 + 1.5·Aah
 *      + 15·(× − 1) + 0.4·Crowd + $ + ✦ 6 + twin 4 + "✦ Fuses" badge 3 + 0.5·sees. Buy the best
 *      placement (tap card → tap tube, or a drag ~30% of the time) while it scores ≥ 1.5 (keep $5
 *      for interest when the crowd is already Eager, unless it is a fusion or a twin). An occupied
 *      tube that lights up for a non-twin card is the one-gesture swap-in (chip "→▭": the old shell
 *      goes to the Crate; "✕+$n": the Crate is full, so it is sold): the proxy remembers what each
 *      racked shell read when it placed it (starters count 2) and swaps only when the new chips beat
 *      that by 1.5, Undoing the swap if the mood pill drops. × chips are read with their "(+n)"
 *      Aah equivalent when shown. After a new
 *      shell lands, lift it and move it next to a ✦ partner or to a spot that reads clearly better
 *      (Undo if the mood drops). Then add a tube if the rack is full, buy the rig card if coins
 *      are spare, and reroll once if nothing appealed.
 *   2. Arrange: press Match on a Headliner that permutes the fuse (Match is lit only then; Undo it
 *      if the mood drops); while the mood pill is below Eager, try up to 4 tube swaps, keeping a
 *      swap only if the mood improves (otherwise Undo).
 *   3. Sponsor: toggle Accept on; keep it only if the mood pill then reads Eager.
 *   4. Light the fuse. RESULT (the result card pinned in the sky) is a build state (spec §2.4).
 * Anything the UI refuses that should have worked (a legal drop that does not buy, an enabled
 * "Light the fuse" that does not light) is recorded as a finding with a screenshot.
 *
 * Pacing follows the spec §12.2 time model: show 1 takes 10 s; each later show takes 12 s of
 * reading + 6 s per purchase + 3 s of arranging + 0.4 s per burst + 4 s of slam and result.
 * Real waits = modelled seconds × scale (1 by default; --fast = 0.05; --scale N). Reports are
 * always in modelled minutes (wall time is shown too).
 *
 * Measures (spec §6 reveal schedule, §12.2, §12.4 human gates):
 *   first-run length (gate 3–5 min, curated first-run seed), time to the first 1-of-3 choice
 *   (gate < 0:30), time to the first fusion and the first multiplier, decisions per minute by
 *   third of the run, Applause/target per show, how the run ended. Filmstrip: one screenshot per
 *   show (after the result) plus the start and the end screen, in tools/shots/humanplay/.
 *   Any console error or page error fails the run (Google Fonts failures are ignored).
 *
 * Usage:
 *   node tools/humanplay.mjs [--runs 1] [--seed abc] [--viewport 360x740] [--fast | --scale 0.05]
 *        [--fresh] [--file index.html | --url http://host/index.html] [--out tools/shots/humanplay]
 *        [--policy-seed 1] [--drag-share 0.3] [--max-shows 40] [--headed] [--raw] [--strict] [--json]
 *   --runs N     play N runs; run 1 in a fresh profile is the first-ever run (seed 'first-show').
 *                Later runs press "Run it back" (or load --seed-i when --seed is given).
 *   --fresh      start every run in a fresh browser profile (so every run is a first-ever run).
 *   --raw        serve index.html exactly as built (default: prepend <!doctype html>, as the
 *                artifact host wraps the page in a document skeleton).
 * Exit code: 0 ok · 1 console/page errors or a harness failure (no game, stuck) · 2 gate failure
 * with --strict.
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
const FESTIVALS = ['Spring Lanterns', 'May Fair', 'Midsummer', 'Regatta', 'Harvest Moon', 'Bonfire Night', 'Winter Lights', "New Year's Eve"];
const SLOTS = ['Twilight', 'Evening', 'Headliner'];
const MOOD_RANK = { restless: 0, hopeful: 1, eager: 2 };
const rank = m => (m in MOOD_RANK ? MOOD_RANK[m] : -1);
const sleep = ms => new Promise(r => setTimeout(r, Math.max(0, ms)));

// ---------------------------------------------------------------- args
function parseArgs(argv) {
  const o = { runs: 1, seed: null, viewport: '360x740', scale: 1, fast: false, fresh: false, file: null, url: null,
    out: path.join(HERE, 'shots', 'humanplay'), policySeed: 1, dragShare: 0.3, maxShows: 40, headed: false, raw: false, strict: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], eq = a.indexOf('='), key = (eq > 0 ? a.slice(0, eq) : a).replace(/^--/, '');
    const val = () => (eq > 0 ? a.slice(eq + 1) : argv[++i]);
    switch (key) {
      case 'runs': o.runs = Math.max(1, parseInt(val(), 10) || 1); break;
      case 'seed': o.seed = String(val()); break;
      case 'viewport': o.viewport = String(val()); break;
      case 'fast': o.fast = true; if (o.scale === 1) o.scale = 0.05; break;
      case 'scale': o.scale = Math.max(0, parseFloat(val())); break;
      case 'fresh': o.fresh = true; break;
      case 'file': o.file = path.resolve(String(val())); break;
      case 'url': o.url = String(val()); break;
      case 'out': o.out = path.resolve(String(val())); break;
      case 'policy-seed': o.policySeed = parseInt(val(), 10) || 1; break;
      case 'drag-share': o.dragShare = Math.min(1, Math.max(0, parseFloat(val()))); break;
      case 'max-shows': o.maxShows = parseInt(val(), 10) || 40; break;
      case 'headed': o.headed = true; break;
      case 'raw': o.raw = true; break;
      case 'strict': o.strict = true; break;
      case 'json': o.json = true; break;
      case 'help': case 'h': console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]); process.exit(0);
      default: console.error(`humanplay: unknown flag ${a}`); process.exit(1);
    }
  }
  const m = /^(\d+)x(\d+)$/.exec(o.viewport);
  if (!m) { console.error(`humanplay: --viewport must look like 360x740`); process.exit(1); }
  o.vw = +m[1]; o.vh = +m[2];
  if (o.fast && o.scale === 1) o.scale = 0.05;
  return o;
}

// ---------------------------------------------------------------- small utilities
function mulberry32(a) { a >>>= 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/** Parse a §8.5-formatted number ("$12", "8,100", "12K", "1.2M", "1.23e12"). */
function parseFmt(s) {
  if (s == null) return null;
  const m = String(s).replace(/,/g, '').match(/(-?\d+(?:\.\d+)?(?:e\d+)?)\s*([KMB])?(?![a-z])/i);
  if (!m) return null;
  let v = parseFloat(m[1]); const u = (m[2] || '').toUpperCase();
  if (u === 'K') v *= 1e3; else if (u === 'M') v *= 1e6; else if (u === 'B') v *= 1e9;
  return v;
}
const mmss = s => (s == null ? '—' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`);
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
const fmtNum = n => (n == null ? '—' : n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : String(Math.round(n)));

/**
 * Local chips → numbers. The chips are local facts only (§3.3, §8.4), never a total:
 * "+60" (Ooh), "+9" (Aah), "×1.8", "✦" / "✦ ?" (a fusion), crowd "+4", "+$2", "+0" (nothing).
 */
function parseChips(list) {
  const c = { ooh: 0, aah: 0, x: 1, xAah: 0, fusion: false, crowd: 0, coin: 0, none: false, swap: null, refund: 0, n: 0 };
  for (const { k, t } of list || []) {
    const v = parseFmt(String(t).replace(/−/g, '-').replace(/^[^\d-]*/, '')) || 0;
    c.n++;
    if (k === 'ooh') c.ooh += v; else if (k === 'aah') c.aah += v; else if (k === 'crowd') c.crowd += v; else if (k === 'coin') c.coin += v;
    else if (k === 'x') { const m = /×\s*(\d+(?:\.\d+)?)/.exec(t); if (m && +m[1] > 1) c.x *= +m[1]; }
    else if (k === 'xaah') c.xAah += v;
    else if (k === 'fusion') c.fusion = true;
    else if (k === 'none') c.none = true;
    else if (k === 'swap') { c.n--; if (/\+\$/.test(t)) { c.swap = 'replace'; c.refund = v; } else c.swap = 'swap'; }
    else if (k === 'ord') c.n--;
  }
  return c;
}
/**
 * How a player who reads the chips weighs a placement (no totals are ever shown):
 * Aah multiplies Ooh and × multiplies Aah, so they weigh more than raw Ooh; a ✦ fusion or a twin
 * upgrade is the exciting find; a shell that "sees more" (more bursts up in the sky) is better placed.
 */
function scorePlacement(d, { twin, fuses, sees }) {
  // a × chip with its "(+n)" Aah equivalent reads like +Aah; without it, ×1.4 counts as 6
  let v = d.ooh / 10 + d.aah * 1.5 + (d.x > 1 ? (d.xAah > 0 ? d.xAah * 1.5 : (d.x - 1) * 15) : 0) + d.crowd * 0.4 + d.coin;
  if (d.fusion) v += 6;
  if (twin) v += 4;
  v += Math.min(sees || 0, 6) * 0.5;
  if (fuses) v += 3;   // the "✦ Fuses" badge: it fuses with a shell I own (reposition() then seats it by its partner)
  if (!d.n) v += 1;    // no readable chips (Chips: partners only): the badges decide
  return v;
}
function cardInfo(c) {
  const s = `${c.text} · ${c.aria}`;
  const twinM = s.match(/Twin[^$]*\$\s*(\d+)/i);
  const newM = (c.aria.match(/\bnew\s*\$\s*(\d+)/i) || (twinM ? s.replace(twinM[0], '') : s).match(/\$\s*(\d+)/));
  const name = ((c.aria.match(/^\s*Card\s*\d+\s*:\s*([^,.]+)/i) || [])[1] || '').trim();
  return { i: c.i, name, price: newM ? +newM[1] : null, twinPrice: twinM ? +twinM[1] : null, twin: /\btwin\b/i.test(s),
    fuses: /✦|\bfuses?\b/i.test(s), sold: c.sold, disabled: c.disabled, pressed: c.pressed, poor: c.poor };
}
function tubeInfo(t) {
  const aria = t.aria || '';
  const m = aria.match(/^\s*Tube\s*\d+\s*:\s*([^,]*)/i);
  const rig = (aria.match(/\brig\s+([A-Za-z]+)/i) || [])[1] || null;
  return {
    j: t.j, empty: !!t.empty, name: t.empty ? null : (m ? m[1].trim() : ''), star: +(aria.match(/star\s*(\d)/i) || [])[1] || 1,
    rig: rig && !/^(none|no)$/i.test(rig) ? rig : null, fav: /favourite|favorite/i.test(aria), can: !!t.can,
    // a legal drop on an occupied non-twin tube is a swap-in (old shell → Crate) or, with the Crate full, a replace (sold)
    swap: /drop here to swap in/i.test(aria) ? 'swap' : /drop here to replace/i.test(aria) ? 'replace' : null,
    refund: +((aria.match(/drop here to replace[^,]*?for\s+(\d+)\s+coins/i) || [])[1] || 0),
    sees: +((t.sees || '').match(/\d+/) || [0])[0], chips: parseChips(t.chips),
    text: `${t.ord} ${t.sees} ${(t.chips || []).map(c => c.t).join(' ')}`.replace(/\s+/g, ' ').trim(),
  };
}

// ---------------------------------------------------------------- page-side readers (serialised into the page)
function pageRead() {
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const vis = el => {
    if (!el || !el.isConnected || el.closest('[hidden]')) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false;
    }
    return true;
  };
  const text = el => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  const R = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, top: r.top }; };
  const cls = el => (typeof el.className === 'string' ? el.className : '');
  const disabled = el => !!(el.disabled || el.getAttribute('aria-disabled') === 'true' || /\bis-disabled\b/.test(cls(el)));
  const pressed = el => el.getAttribute('aria-pressed') === 'true' || el.getAttribute('aria-selected') === 'true' ||
    el.getAttribute('aria-checked') === 'true' || el.dataset.selected === 'true' || el.dataset.held === 'true' ||
    /\b(is-)?(sel|selected|held|picked|lifted|accepted)\b/.test(cls(el));
  const out = { ui: (q('#app') || {}).dataset ? q('#app').dataset.ui : null };
  try { out.gameUi = typeof GAME !== 'undefined' && GAME ? GAME.ui : null; } catch (e) { out.gameUi = null; }
  out.hud = {};
  for (const k of ['coins', 'crowd', 'target', 'show']) { const el = q('#hud-' + k); out.hud[k] = el ? (text(el) || el.getAttribute('aria-label') || '') : null; }
  const fire = q('#fire');
  out.fire = fire ? { text: text(fire), aria: fire.getAttribute('aria-label') || '', disabled: disabled(fire), vis: vis(fire) } : null;
  const fb = q('#firebar') || (fire && fire.parentElement);
  let moodSrc = fb ? text(fb) : '';
  if (fb) for (const el of qa('*', fb)) if (vis(el)) moodSrc += ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '');
  const pill = q('#firebar .mood') || (fire && q('.mood', fire));
  const mm = pill && !pill.hidden && vis(pill) ? (pill.dataset.mood || text(pill)).match(/\b(restless|hopeful|eager)\b/i) : moodSrc.match(/\b(restless|hopeful|eager)\b/i);
  out.mood = mm ? mm[1].toLowerCase() : null;
  out.held = qa('#rack .sel, #tools .sel, #shop .sel, #workshop .sel').filter(vis).map(el => el.dataset.card != null ? `button[data-card="${el.dataset.card}"]`
    : el.dataset.tube != null ? `button[data-tube="${el.dataset.tube}"]` : el.dataset.crate != null ? `button[data-crate="${el.dataset.crate}"]`
    : el.dataset.act ? `[data-act="${el.dataset.act}"]` : null).filter(Boolean);
  out.cards = qa('button[data-card]').filter(vis).map(el => ({ i: +el.dataset.card, text: text(el), aria: el.getAttribute('aria-label') || '',
    disabled: disabled(el), pressed: pressed(el), poor: /\bpoor\b/.test(cls(el)), sold: /\bsold\b/i.test(`${text(el)} ${el.getAttribute('aria-label') || ''} ${cls(el)}`) || el.dataset.sold === 'true' }));
  // Tubes: the local chips live inside each tube button (.t-chips > .chip.c-ooh/.c-aah/.c-x/.chip-fusion/.c-crowd/.c-coin);
  // "sees N" (.t-sees) and the fire-order label (.t-num: "1", "2", "LAST") sit on top. A legal drop is marked
  // with the class "can" and ", drop here" in the aria-label.
  const chipKind = c => { const k = cls(c);
    return /\bc-ooh\b/.test(k) ? 'ooh' : /\bc-aah\b|chip-aah/.test(k) ? 'aah' : /\bc-x\b|chip-x/.test(k) ? 'x' : /chip-fusion/.test(k) ? 'fusion'
      : /\bc-crowd\b/.test(k) ? 'crowd' : /\bc-coin\b/.test(k) ? 'coin' : /\bc-none\b/.test(k) ? 'none'
      : /\bc-xaah\b/.test(k) ? 'xaah' : /\bc-swap\b/.test(k) ? 'swap' : /\bc-ord\b/.test(k) ? 'ord' : 'other'; };
  out.tubes = qa('button[data-tube]').filter(vis).map(el => {
    const aria = el.getAttribute('aria-label') || '';
    const seesEl = q('.t-sees', el), numEl = q('.t-num', el);
    return { j: +el.dataset.tube, aria, inner: text(el), disabled: disabled(el), pressed: pressed(el),
      can: /\bcan\b/.test(cls(el)) || /drop here/i.test(aria), empty: /\bempty\b/.test(cls(el)) || /:\s*empty\b/i.test(aria),
      sees: seesEl ? text(seesEl) : '', ord: numEl ? text(numEl) : '',
      chips: qa('.chip', el).filter(vis).map(c => ({ k: chipKind(c), t: text(c) })) };
  });
  out.crate = qa('button[data-crate]').filter(vis).map(el => ({ i: +el.dataset.crate, aria: el.getAttribute('aria-label') || '', inner: text(el) }));
  out.acts = {};
  for (const a of ['reroll', 'buyTube', 'buyRig', 'undo', 'match', 'restore', 'rehearse', 'sponsor', 'pause']) {
    const el = qa(`[data-act="${a}"]`).find(vis);
    out.acts[a] = el ? { text: text(el), aria: el.getAttribute('aria-label') || '', disabled: disabled(el), pressed: pressed(el) } : null;
  }
  const sp = q('#sponsor'); out.sponsorText = sp && vis(sp) ? text(sp) : '';
  out.overlays = {};
  for (const id of ['end', 'pause-menu', 'settings', 'logbook', 'help', 'inspect', 'tap-continue']) { const el = q('#' + id); out.overlays[id] = !!(el && !el.hidden && vis(el)); }
  const end = q('#end'); out.endText = end && !end.hidden ? text(end).slice(0, 800) : '';
  out.endHeader = end && !end.hidden ? text(q('h1,h2,h3,header', end) || end).slice(0, 160) : '';
  const rib = q('#run-it-back'); out.runItBack = !!(rib && vis(rib));
  try { out.hash = window.__game && typeof __game.hash === 'function' ? String(__game.hash()) : null; } catch (e) { out.hash = null; }
  return out;
}
function pageTelemetry() {
  try {
    const s = window.__game && typeof __game.state === 'function' ? __game.state() : null;
    if (!s) return null;
    const h = (s.runStats && s.runStats.history) || [];
    return { show: s.show, phase: s.phase, coins: s.coins, crowd: s.crowd, seed: s.seed, kit: s.kit, firstRun: !!s.firstRun, renown: s.renown,
      rain: s.rain, endless: !!s.endless, tubes: (s.tubes || []).length,
      history: h.map(e => ({ show: e.show, rules: e.rules, target: e.target, applause: e.applause, pass: e.pass, sponsored: e.sponsored,
        encore: e.encore, relit: e.relit, bursts: e.bursts, fusions: e.fusions, moodAtLight: e.moodAtLight })) };
  } catch (e) { return { error: String(e && e.message || e) }; }
}
function pageInstallObservers() {
  if (window.__hp) return window.__hp.mode;
  const hp = window.__hp = { sim: [], illegal: 0, mode: 'none' };
  const rec = (a, ev) => {
    ev = Array.isArray(ev) ? ev : [];
    hp.sim.push({ a, fusions: ev.filter(e => e && e.type === 'fusion').map(e => e.name || e.id || '?'),
      mults: ev.filter(e => e && e.type === 'multAah').map(e => e.factor), bursts: ev.filter(e => e && e.type === 'burst').length,
      applause: (ev.find(e => e && e.type === 'applause') || {}).score });
  };
  try {
    if (typeof GAME !== 'undefined' && GAME && typeof GAME.on === 'function') {
      GAME.on('sim', p => { try { rec(p && p.action && p.action.type, p && p.events); } catch (e) { /* telemetry only */ } });
      GAME.on('illegal', () => { hp.illegal++; });
      hp.mode = 'GAME.on';
    } else if (window.__game && typeof __game.events === 'function') {
      hp.mode = 'events';
      hp.drain = () => { try { const ev = __game.events() || []; if (ev.length) rec(ev.some(e => e && e.type === 'applause') ? 'light' : '?', ev); } catch (e) { /* ignore */ } };
    }
  } catch (e) { /* ignore */ }
  return hp.mode;
}
function pageDrainSim() { const hp = window.__hp; if (!hp) return { sim: [], illegal: 0 }; if (hp.drain) hp.drain(); const sim = hp.sim.splice(0); const ill = hp.illegal; hp.illegal = 0; return { sim, illegal: ill }; }

// ---------------------------------------------------------------- static server (serves the one file)
function serve(file, raw) {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/' || u.pathname === '/index.html') {
      let html = fs.readFileSync(file, 'utf8');
      if (!raw && !/^\s*<!doctype/i.test(html)) html = '<!doctype html>\n' + html;
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(html);
    } else if (u.pathname === '/favicon.ico') { res.writeHead(204); res.end(); }
    else { res.writeHead(404); res.end(); }
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r({ server, url: `http://127.0.0.1:${server.address().port}/index.html` })));
}

// ---------------------------------------------------------------- the proxy player
class HumanProxy {
  constructor(page, o, errors) {
    this.page = page; this.o = o; this.errors = errors;
    this.rng = mulberry32((o.policySeed * 2654435761) >>> 0);
    this.lifted = null; // the card index we last lifted (tapped) while evaluating
    this.stats = { taps: 0, drags: 0 };
    this.findings = new Set(); // UI problems the proxy ran into (reported, never worked around silently)
    this.shotKeys = new Set();
    this.curShow = null;
    this.valueAt = new Map(); // tube → what the shell there read (chip score) when the proxy placed it; starters count 2
    this.rejected = new Set(); // "card name→tube" swaps undone this show (the mood dropped)
  }
  /** What the shell on tube j is worth to this player: remembered from its placement, else a starter's 2. */
  worth(j) { return this.valueAt.has(j) ? this.valueAt.get(j) : 2; }
  /** Record a UI problem with its context (show, coins, the info card's text) and a screenshot the first time. */
  async note(msg) {
    const s = await this.read().catch(() => null);
    const info = await this.page.evaluate(() => { const el = document.querySelector('#sky-overlay .info'); return el && !el.hidden ? (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160) : ''; }).catch(() => '');
    const key = msg.replace(/\d+/g, '#');
    const shot = !this.shotKeys.has(key);
    if (shot) this.shotKeys.add(key);
    const file = `run${this.o.runNo || 1}-finding${this.shotKeys.size}.png`;
    this.findings.add(`show ${this.curShow ?? '?'}: ${msg}${s ? ` [data-ui ${s.ui}, coins ${s.hud.coins}]` : ''}${info ? ` [info card: "${info}"]` : ''}${shot ? ` [${file}]` : ''}`);
    if (shot) await this.page.screenshot({ path: path.join(this.o.out, file) }).catch(() => {});
  }
  // ---- pacing (spec §12.2 time model)
  startClock() { this.model = 0; this.wall0 = Date.now(); this.decisions = []; }
  async think(sec) { this.model += sec; await sleep(this.wall0 + this.model * 1000 * this.o.scale - Date.now()); }
  decide(kind, extra) { this.decisions.push({ t: this.model, kind, ...(extra || {}) }); }
  settle() { return sleep(this.o.scale < 0.5 ? 70 : 140); }
  // ---- DOM access
  read() { return this.page.evaluate(pageRead); }
  telemetry() { return this.page.evaluate(pageTelemetry); }
  async point(sel) {
    return this.page.evaluate(s => {
      const el = Array.from(document.querySelectorAll(s)).find(e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && !e.closest('[hidden]'); });
      if (!el) return null;
      const r0 = el.getBoundingClientRect();
      if (r0.top < 0 || r0.bottom > innerHeight || r0.left < 0 || r0.right > innerWidth) el.scrollIntoView({ block: 'center', inline: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
    }, sel);
  }
  async tap(sel) {
    const since = Date.now() - (this.lastDragAt || 0);
    if (since < 450) await sleep(450 - since); // the UI swallows clicks for 400 ms after a drag (a real finger is slower anyway)
    const p = await this.point(sel);
    if (!p) return false;
    const jx = (this.rng() - 0.5) * p.w * 0.3, jy = (this.rng() - 0.5) * p.h * 0.3;
    await this.page.mouse.click(p.x + jx, p.y + jy, { delay: 30 + Math.floor(this.rng() * 60) });
    this.stats.taps++;
    return true;
  }
  async drag(selA, selB) {
    const a = await this.point(selA); if (!a) return false;
    const b = await this.point(selB); if (!b) return false;
    const m = this.page.mouse;
    await m.move(a.x, a.y); await m.down();
    await m.move(a.x + 6, a.y - 6, { steps: 2 });
    await m.move(b.x, b.y, { steps: 10 + Math.floor(this.rng() * 8) });
    await sleep(40); await m.up();
    this.lastDragAt = Date.now();
    this.stats.drags++;
    return true;
  }
  async fingerprint() {
    const s = await this.read();
    return s.hash || JSON.stringify([s.hud.coins, s.tubes.map(t => t.aria + t.inner), s.cards.map(c => c.text + c.disabled), s.crate.map(c => c.aria), s.acts.sponsor && s.acts.sponsor.pressed]);
  }
  async changedFrom(fp0, ms = 700) {
    const t0 = Date.now();
    do { if ((await this.fingerprint()) !== fp0) return true; await sleep(50); } while (Date.now() - t0 < ms);
    return false;
  }
  async waitUi(pred, ms, label) {
    const t0 = Date.now();
    for (;;) {
      const s = await this.read();
      if (s.overlays['tap-continue']) { await this.tap('#tap-continue'); await this.settle(); continue; }
      if (pred(s)) return s;
      if (Date.now() - t0 > ms) throw new Error(`stuck: waited ${ms} ms for ${label}; data-ui=${s.ui}`);
      await sleep(60);
    }
  }
  /** Put down whatever is held: tapping the held card, shell or rig again releases it. */
  async deselect() {
    this.lifted = null;
    for (let k = 0; k < 3; k++) {
      const s = await this.read();
      if (!s.held.length) return true;
      await this.tap(s.held[0]); await this.settle();
    }
    const s = await this.read();
    if (s.held.length) { await this.note(`could not put down a held item (${s.held.join(', ')}) by tapping it again`); return false; }
    return true;
  }
  /** Tap a card and confirm it is lifted (class "sel"). */
  async lift(i) {
    for (let k = 0; k < 2; k++) {
      const s0 = await this.read();
      if (s0.cards.some(c => c.i === i && c.pressed)) { this.lifted = i; return s0; }
      await this.tap(`button[data-card="${i}"]`); await this.settle();
    }
    const s = await this.read();
    this.lifted = s.cards.some(c => c.i === i && c.pressed) ? i : null;
    return this.lifted === i ? s : null;
  }

  // ---- one build phase, then light
  async playShow(rec, isFirstShow) {
    this.rejected = new Set();
    let s = await this.read();
    const offered = s.cards.map(cardInfo).filter(c => !c.sold && !c.disabled);
    rec.cardsOffered = offered.length;
    rec.moodAtOpen = s.mood;
    await this.think(isFirstShow ? 5 : 12); // read the rack, the shop and the posted Headliner

    // 1. shop
    let rerolled = false;
    for (let step = 0; step < 8; step++) {
      s = await this.read();
      const coins = parseFmt(s.hud.coins) ?? 0;
      const options = await this.evaluateShop(s, coins);
      rec.chipsRead = rec.chipsRead || options.some(o => o.chipsSeen);
      const best = options[0];
      const keepInterest = s.mood === 'eager' && coins >= 5 && best && coins - best.cost < 5 && !best.twin && !best.chips.fusion;
      if (best && best.score >= 1.5 && !keepInterest) {
        await this.think(6);
        const mood0 = s.mood;
        const how = await this.commitPlacement(best);
        if (how) {
          // a swap that makes the crowd less keen is undone in one step (Undo) and not tried again this show
          if (best.swap && mood0 && rank((await this.read()).mood) < rank(mood0)) {
            await this.tap('[data-act="undo"]'); await this.settle();
            this.rejected.add(`${best.card.name}→${best.tube}`); rec.swapsUndone = (rec.swapsUndone || 0) + 1;
            continue;
          }
          rec.purchases++; rec.buys.push({ card: best.card.name, tube: best.tube + 1, twin: best.twin, swap: best.swap || undefined, score: +best.score.toFixed(1), chips: best.chipText, via: how });
          if (best.swap) rec[best.swap === 'swap' ? 'swapIns' : 'replaces'] = (rec[best.swap === 'swap' ? 'swapIns' : 'replaces'] || 0) + 1;
          if (rec.firstChoiceMade == null) rec.firstChoiceMade = this.model;
          this.valueAt.set(best.tube, best.twin ? this.worth(best.tube) * 2 : best.gain);
          this.decide(best.twin ? 'upgrade' : best.swap ? 'swap' : 'buy');
          if (!best.twin) await this.reposition(rec, best);
          continue;
        }
        rec.failedCommits++;
      }
      await this.deselect();
      s = await this.read();
      const tubes = s.tubes.map(tubeInfo);
      const rigAct = s.acts.buyRig, tubeAct = s.acts.buyTube, rerollAct = s.acts.reroll;
      // 1b. a full rack with a good card on offer: add a tube
      if (tubes.length && tubes.every(t => !t.empty) && tubes.length < 6 && tubeAct && !tubeAct.disabled) {
        const price = parseFmt((tubeAct.text.match(/\$\s*[\d,]+/) || [])[0]);
        if (price != null && price + 3 <= coins && offered.length) {
          await this.think(6);
          const fp = await this.fingerprint();
          if (await this.tap('[data-act="buyTube"]') && await this.changedFrom(fp)) { rec.purchases++; rec.tubesBought++; this.decide('buyTube'); continue; }
        }
      }
      // 1c. spare coins: the rig card, on the tube that suits it
      if (rigAct && !rigAct.disabled) {
        const price = parseFmt((`${rigAct.text} ${rigAct.aria}`.match(/\$\s*[\d,]+/) || [])[0]);
        const target = pickRigTube(`${rigAct.text} ${rigAct.aria}`, tubes);
        if (price != null && target != null && coins - price >= (s.mood === 'eager' ? 5 : 2)) {
          await this.think(6);
          const fp = await this.fingerprint();
          let ok = false;
          if (this.rng() < this.o.dragShare) { await this.drag('[data-act="buyRig"]', `button[data-tube="${target}"]`); ok = await this.changedFrom(fp); }
          if (!ok) { await this.tap('[data-act="buyRig"]'); await this.settle(); await this.tap(`button[data-tube="${target}"]`); ok = await this.changedFrom(fp); }
          if (ok) { rec.purchases++; rec.rigs.push({ rig: rigAct.text.replace(/\s*\$.*$/, ''), tube: target + 1 }); this.decide('buyRig'); continue; }
          rec.failedCommits++;
          await this.deselect(); // drop a rig pick that did not land
        }
      }
      // 1d. nothing appealed: one reroll per shop while coins are comfortable
      if (!rerolled && rec.purchases === 0 && rerollAct && !rerollAct.disabled && offered.length) {
        const price = parseFmt((rerollAct.text.match(/\$\s*[\d,]+/) || [])[0]) ?? 1;
        if (coins >= price + 5) {
          await this.think(6);
          const fp = await this.fingerprint();
          rerolled = true;
          if (await this.tap('[data-act="reroll"]') && await this.changedFrom(fp)) { rec.purchases++; rec.rerolls++; this.decide('reroll'); continue; }
        }
      }
      break;
    }
    await this.deselect();

    // 2. arrange (the model's flat 3 s)
    await this.think(isFirstShow ? 0 : 3);
    s = await this.read();
    let mood = s.mood;
    if (s.acts.match && !s.acts.match.disabled) {
      const fp = await this.fingerprint();
      await this.tap('[data-act="match"]');
      if (await this.changedFrom(fp)) {
        await this.settle();
        const after = (await this.read()).mood;
        if (rank(after) < rank(mood)) { await this.tap('[data-act="undo"]'); await this.settle(); rec.matchUndone = true; }
        else { rec.matched = true; mood = after; this.decide('match'); }
      }
    }
    if (mood && mood !== 'eager') mood = await this.fiddle(rec, mood);

    // 3. Sponsor: accept only if the pill reads Eager with Accept on (§4.9)
    s = await this.read();
    if (s.acts.sponsor && !s.acts.sponsor.disabled && s.acts.sponsor.pressed && s.mood !== 'eager') {
      rec.sponsorOffered = true; rec.sponsorMood = s.mood; // accepted earlier, and the crowd is no longer Eager: decline
      const fp2 = await this.fingerprint(); await this.tap('[data-act="sponsor"]'); await this.changedFrom(fp2); await this.settle();
    } else if (s.acts.sponsor && !s.acts.sponsor.disabled && !s.acts.sponsor.pressed) {
      rec.sponsorOffered = true;
      const fp = await this.fingerprint();
      await this.tap('[data-act="sponsor"]');
      if (await this.changedFrom(fp)) {
        await this.settle();
        const withSponsor = (await this.read()).mood;
        rec.sponsorMood = withSponsor;
        if (withSponsor === 'eager') { rec.sponsorAccepted = true; this.decide('sponsor'); }
        else { const fp2 = await this.fingerprint(); await this.tap('[data-act="sponsor"]'); await this.changedFrom(fp2); await this.settle(); }
      }
    }

    // 4. light the fuse
    s = await this.read();
    rec.moodAtLight = s.mood;
    rec.coinsAtLight = parseFmt(s.hud.coins);
    const fp = await this.fingerprint();
    await this.tap('#fire');
    this.decide('light');
    return { fp, ui: s.ui };
  }
  /**
   * A build action that changes nothing: move a shell to another tube, then Undo. Used only after
   * "Light the fuse" did nothing, to get the game out of RESULT (reported as a finding).
   */
  async nudge() {
    const s = await this.read();
    const occ = s.tubes.filter(t => !t.empty).map(t => t.j), other = s.tubes.map(t => t.j);
    if (!occ.length || other.length < 2) return false;
    const a = occ[0], b = other.find(j => j !== a);
    const fp = await this.fingerprint();
    await this.tap(`button[data-tube="${a}"]`); await this.settle(); await this.tap(`button[data-tube="${b}"]`);
    if (!(await this.changedFrom(fp))) { await this.deselect(); return false; }
    await this.settle();
    await this.tap('[data-act="undo"]');
    return this.changedFrom(await this.fingerprint(), 300).then(() => true);
  }

  /** Lift each affordable card and read the chips on every tube it can drop on (class "can"). */
  async evaluateShop(snap, coins) {
    const cards = snap.cards.map(cardInfo).filter(c => !c.sold && !c.disabled);
    const options = [];
    for (const c of cards) {
      const newOk = c.price != null && c.price <= coins;
      const twinOk = c.twinPrice != null && c.twinPrice <= coins;
      const after = await this.lift(c.i);
      if (!after) { await this.note(`tapping shop card ${c.i + 1} (${c.name}) did not lift it`); continue; }
      const held = after.tubes.map(tubeInfo);
      if (!held.some(t => t.can)) continue; // nowhere to put it (money, or no free tube)
      for (const t of held) {
        if (!t.can) continue;
        // an occupied legal tube is its twin (upgrade), or a swap-in / replace (the aria-label and the chip say which)
        const swap = t.empty ? null : t.swap || t.chips.swap;
        const twin = !t.empty && !swap;
        const refund = swap === 'replace' ? (t.refund || t.chips.refund || 0) : 0;
        if (twin ? !twinOk : !(c.price != null && c.price <= coins + refund)) continue;
        if (swap && this.rejected.has(`${c.name}→${t.j}`)) continue;
        const gain = scorePlacement(t.chips, { twin, fuses: c.fuses, sees: t.sees });
        // a swap gives up what the old shell was doing there (remembered, not shown): it must beat it
        const score = (swap ? gain - this.worth(t.j) : gain) + this.rng() * 0.05;
        options.push({ card: c, tube: t.j, twin, swap, refund, gain, cost: twin ? c.twinPrice : c.price - refund, chips: t.chips, chipsSeen: t.chips.n > 0,
          chipText: t.text.slice(0, 80), score });
      }
    }
    return options.sort((a, b) => b.score - a.score);
  }

  async commitPlacement(opt) {
    const card = `button[data-card="${opt.card.i}"]`, tube = `button[data-tube="${opt.tube}"]`;
    const fp0 = await this.fingerprint();
    if (this.rng() < this.o.dragShare) {
      await this.deselect();
      await this.drag(card, tube);
      if (await this.changedFrom(fp0)) return 'drag';
      await this.note(`dragging card ${opt.card.i + 1} onto tube ${opt.tube + 1} (a legal drop) did not buy`);
    }
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!(await this.lift(opt.card.i))) break;
      this.lifted = null;
      await this.tap(tube);
      if (await this.changedFrom(fp0)) return 'tap';
    }
    await this.note(`tap card ${opt.card.i + 1} (${opt.card.name}) then tube ${opt.tube + 1} (a legal drop) did not buy`);
    await this.deselect();
    return null;
  }

  /**
   * "Does it see more somewhere else?" Lift the shell just bought and read its chips on the other
   * tubes; move it next to a fusion partner (a ✦ chip), or where it reads clearly better (≥ 1.2× + 0.5),
   * and Undo the move if the mood pill drops.
   */
  async reposition(rec, bought) {
    const here = scorePlacement(bought.chips, { sees: 0 });
    const s0 = await this.read();
    const mood0 = s0.mood;
    await this.tap(`button[data-tube="${bought.tube}"]`); await this.settle();
    const s = await this.read();
    if (!s.held.includes(`button[data-tube="${bought.tube}"]`)) { await this.deselect(); return; }
    let best = null;
    for (const t of s.tubes.map(tubeInfo)) {
      if (!t.can || t.j === bought.tube) continue;
      const v = scorePlacement(t.chips, { sees: 0 }), fuse = t.chips.fusion && !bought.chips.fusion;
      if (!best || (fuse && !best.fuse) || (fuse === best.fuse && v > best.v)) best = { j: t.j, v, fuse, text: t.text };
    }
    // a ✦ chip elsewhere wins outright (prefer fusions); otherwise it must read clearly better
    if (!best || !(best.fuse || best.v >= here * 1.2 + 0.5)) { await this.deselect(); return; }
    const fp = await this.fingerprint();
    await this.tap(`button[data-tube="${best.j}"]`);
    if (!(await this.changedFrom(fp))) { await this.note(`holding the shell on tube ${bought.tube + 1} and tapping tube ${best.j + 1} (a legal target) did not move it`); await this.deselect(); return; }
    await this.settle();
    const after = (await this.read()).mood;
    if (mood0 && after && rank(after) < rank(mood0)) { await this.tap('[data-act="undo"]'); await this.settle(); rec.movesUndone = (rec.movesUndone || 0) + 1; return; }
    rec.repositions = (rec.repositions || 0) + 1;
    { const a = this.worth(bought.tube), b = this.worth(best.j); this.valueAt.set(best.j, a); this.valueAt.set(bought.tube, b); }
    rec.buys[rec.buys.length - 1].tube = `${bought.tube + 1}→T${best.j + 1}`;
    this.decide('move');
  }

  /** While the pill is below Eager, try up to 4 swaps; keep a swap only if the mood improves. */
  async fiddle(rec, mood) {
    let s = await this.read();
    const occupied = s.tubes.map(tubeInfo).filter(t => !t.empty).map(t => t.j);
    if (occupied.length < 2) return mood;
    const all = s.tubes.map(t => t.j);
    const pairs = [];
    for (const j of all.slice(1)) pairs.push([all[0], j]);            // the opener matters (Headwind, Comet, Mine)
    for (let i = 1; i + 1 < all.length; i++) pairs.push([all[i], all[i + 1]]);
    const cand = pairs.filter(([a, b]) => occupied.includes(a) || occupied.includes(b));
    for (let i = cand.length - 1; i > 0; i--) { const k = Math.floor(this.rng() * (i + 1)); if (k < i && i > 2) [cand[i], cand[k]] = [cand[k], cand[i]]; }
    for (const [a, b] of cand.slice(0, 4)) {
      const from = occupied.includes(a) ? a : b, to = from === a ? b : a;
      const fp = await this.fingerprint();
      if (this.rng() < 0.5) await this.drag(`button[data-tube="${from}"]`, `button[data-tube="${to}"]`);
      else { await this.tap(`button[data-tube="${from}"]`); await this.settle(); await this.tap(`button[data-tube="${to}"]`); }
      if (!(await this.changedFrom(fp))) { await this.deselect(); rec.failedMoves++; continue; }
      await this.settle();
      const after = (await this.read()).mood;
      rec.swapsTried++;
      if (rank(after) > rank(mood)) {
        mood = after; rec.swapsKept++; this.decide('move');
        const a = this.worth(from), b = this.worth(to); this.valueAt.set(to, a); this.valueAt.set(from, b);
        if (mood === 'eager') break;
      }
      else { await this.tap('[data-act="undo"]'); await this.settle(); }
      s = await this.read();
    }
    return mood;
  }
}

function pickRigTube(rigText, tubes) {
  const free = tubes.filter(t => !t.empty && !t.rig);
  if (!free.length) return null;
  const fav = free.find(t => t.fav);
  if (/spotlight|mortar|brass/i.test(rigText) && fav) return fav.j;
  if (/tall/i.test(rigText)) return free[0].j;
  return (fav || free[0]).j;
}

// ---------------------------------------------------------------- one run
async function playRun(ctx, runNo, url, o, errors) {
  const { page } = ctx;
  const proxy = new HumanProxy(page, { ...o, policySeed: o.policySeed + runNo - 1, runNo }, errors);
  const run = { run: runNo, url, viewport: o.viewport, shows: [], ended: null, telemetry: 'none' };
  const errBefore = errors.length;
  if (ctx.needsLoad) {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    ctx.needsLoad = false;
  }
  const hasGame = await page.evaluate(() => typeof window.__game === 'object' || typeof GAME !== 'undefined').catch(() => false);
  let s = await proxy.waitUi(x => x.ui === 'BUILD' || x.ui === 'RESULT' || x.ui === 'END', 15000, 'the first build');
  if (s.ui === 'END') {
    if (!s.runItBack) throw new Error('page opened on END with no #run-it-back');
    await proxy.tap('#run-it-back');
    s = await proxy.waitUi(x => x.ui === 'BUILD' || x.ui === 'RESULT', 15000, 'BUILD after Run it back');
  }
  run.telemetry = hasGame ? await page.evaluate(pageInstallObservers) : 'none';
  proxy.startClock();
  let tel = await proxy.telemetry();
  run.seed = tel && tel.seed; run.firstRun = tel ? tel.firstRun : null; run.kit = tel && tel.kit; run.renown = tel && tel.renown;
  await page.screenshot({ path: path.join(o.out, `run${runNo}-start.png`) });
  const t0 = Date.now();
  for (let n = 0; n < o.maxShows; n++) {
    tel = await proxy.telemetry();
    const sIdx = tel && Number.isInteger(tel.show) ? tel.show : n;
    const f = Math.floor(sIdx / 3) + 1;
    proxy.curShow = sIdx + 1;
    const rec = { show: sIdx + 1, festival: f, slot: SLOTS[sIdx % 3], modelStart: proxy.model, purchases: 0, rerolls: 0, tubesBought: 0,
      buys: [], rigs: [], swapsTried: 0, swapsKept: 0, failedCommits: 0, failedMoves: 0 };
    s = await proxy.read();
    const openCards = s.cards.map(cardInfo).filter(c => !c.sold && !c.disabled).length;
    if (openCards >= 2 && run.firstChoiceShown == null) { run.firstChoiceShown = proxy.model; run.firstChoiceShow = sIdx + 1; }
    const histLen = tel && tel.history ? tel.history.length : null;
    const isFirstShow = sIdx === 0 && !(tel && tel.phase !== 'build');
    const { fp, ui: uiAtFire } = await proxy.playShow(rec, isFirstShow);
    if (rec.firstChoiceMade != null && run.firstChoiceMade == null) run.firstChoiceMade = rec.firstChoiceMade;
    // resolution: wait for the chain; --fast taps the sky (×4) and then Skip
    const tFire = Date.now();
    let left = false;
    for (let tries = 0; tries < 3 && !left; tries++) {
      const t1 = Date.now();
      while (Date.now() - t1 < 2500) {
        const x = await proxy.read();
        if (x.ui === 'RESOLVING' || x.ui === 'END' || (await proxy.fingerprint()) !== fp) { left = true; break; }
        await sleep(40);
      }
      if (left) break;
      rec.fireRetries = (rec.fireRetries || 0) + 1;
      const x = await proxy.read();
      if (x.ui === 'RESULT' && tries === 0) {
        // spec §2.4: RESULT needs no tap and building (or lighting) may start at once
        await proxy.note(`"Light the fuse" (#fire, enabled) did nothing while data-ui=RESULT (no build action since the last result); lit only after a move + Undo`);
        rec.fireDeadInResult = true;
        await proxy.nudge();
      }
      await proxy.tap('#fire');
    }
    if (!left) throw new Error(`show ${sIdx + 1}: tapping #fire did not start a resolution`);
    // a player watches the chain; a player in a hurry taps the sky (×4), then Skip (--fast only)
    const tRes = Date.now();
    for (let ff = false, skip = false; ;) {
      const x = await proxy.read();
      if (x.overlays['tap-continue']) { await proxy.tap('#tap-continue'); await proxy.settle(); continue; }
      if (x.ui === 'BUILD' || x.ui === 'RESULT' || x.ui === 'END') break;
      if (o.scale < 0.5 && x.ui === 'RESOLVING') {
        if (!ff && Date.now() - tRes > 150) { ff = true; rec.fastForward = true; await proxy.tap('#sky'); }
        else if (!skip && Date.now() - tRes > 3000) { skip = true; rec.skipped = true; await proxy.tap('#fire'); }
      }
      if (Date.now() - tRes > 60000) throw new Error(`stuck: show ${sIdx + 1} still ${x.ui} 60 s after lighting`);
      await sleep(50);
    }
    rec.resolveWallMs = Date.now() - tFire;
    tel = await proxy.telemetry();
    const { sim, illegal } = await page.evaluate(pageDrainSim);
    rec.illegal = illegal;
    const lit = sim.filter(e => e.a === 'light');
    rec.fusions = lit.flatMap(e => e.fusions);
    rec.mults = lit.flatMap(e => e.mults).filter(x => x > 1);
    const entry = tel && tel.history && (histLen == null || tel.history.length > histLen) ? tel.history[tel.history.length - 1] : null;
    if (entry) {
      Object.assign(rec, { rules: entry.rules || [], target: entry.target, applause: entry.applause, ratio: entry.target ? entry.applause / entry.target : null,
        pass: entry.pass, encore: entry.encore, sponsored: entry.sponsored, bursts: entry.bursts, relit: entry.relit, simMood: entry.moodAtLight });
      if (!rec.fusions.length && entry.fusions && entry.fusions.length) rec.fusions = entry.fusions.map(x => (typeof x === 'string' ? x : x && (x.name || x.id)) || '?');
    } else {
      const l = lit[lit.length - 1];
      rec.bursts = l ? l.bursts : null; rec.applause = l ? l.applause : null;
    }
    // model: 0.4 s per burst + 4 s of slam and result (show 1 is a flat 10 s)
    const bursts = rec.bursts ?? 4;
    await proxy.think(isFirstShow ? Math.max(0, 10 - (proxy.model - rec.modelStart)) : 0.4 * bursts + 4);
    rec.modelEnd = proxy.model;
    if (rec.fusions.length && run.firstFusion == null) run.firstFusion = { show: rec.show, at: rec.modelEnd, name: rec.fusions[0] };
    if (rec.mults.length && run.firstMult == null) run.firstMult = { show: rec.show, at: rec.modelEnd, factor: +Math.max(...rec.mults).toFixed(2) };
    run.shows.push(rec);
    await page.screenshot({ path: path.join(o.out, `run${runNo}-show${String(rec.show).padStart(2, '0')}${n > 0 && run.shows.filter(r => r.show === rec.show).length > 1 ? '-relight' : ''}.png`) });
    s = await proxy.read();
    if (!o.quiet) printShowLine(rec);
    if (s.ui === 'END' || (tel && (tel.phase === 'lost' || tel.phase === 'won'))) {
      if (s.ui !== 'END') s = await proxy.waitUi(x => x.ui === 'END', 10000, 'END after the run ended');
      await sleep(400);
      s = await proxy.read();
      run.ended = { outcome: tel ? tel.phase : 'ended', show: rec.show, festival: FESTIVALS[rec.festival - 1] || `F${rec.festival}`, slot: rec.slot,
        header: s.endHeader, endText: s.endText, runItBack: s.runItBack };
      await page.screenshot({ path: path.join(o.out, `run${runNo}-end.png`) });
      break;
    }
    if (Date.now() - t0 > (o.scale < 0.5 ? 15 : 60) * 60000) throw new Error('run exceeded its wall-clock budget');
  }
  if (!run.ended) run.ended = { outcome: 'cap', show: run.shows.length, header: `stopped after --max-shows ${o.maxShows}` };
  run.modelSeconds = proxy.model;
  run.wallSeconds = (Date.now() - proxy.wall0) / 1000;
  run.decisions = proxy.decisions.length;
  const T = proxy.model || 1;
  run.decisionsByThird = [0, 1, 2].map(k => {
    const lo = (T * k) / 3, hi = (T * (k + 1)) / 3;
    const ds = proxy.decisions.filter(d => d.t >= lo && (k === 2 ? d.t <= hi : d.t < hi));
    const kinds = {}; for (const d of ds) kinds[d.kind] = (kinds[d.kind] || 0) + 1;
    return { n: ds.length, kinds };
  });
  run.decisionsPerMinByThird = run.decisionsByThird.map(x => +(x.n / (T / 3 / 60)).toFixed(2));
  run.decisionLog = proxy.decisions.map(d => ({ t: +d.t.toFixed(1), kind: d.kind }));
  run.stats = proxy.stats;
  run.chipsRead = run.shows.some(r => r.chipsRead);
  run.errors = errors.slice(errBefore);
  run.findings = [...proxy.findings];
  return { run, proxy };
}

function printShowLine(r) {
  const rules = (r.rules && r.rules.length ? r.rules.join('+') : '-').slice(0, 13);
  const bits = [];
  if (r.buys.length) bits.push(r.buys.map(b => `${b.twin ? '★' : ''}${b.card}${b.swap === 'swap' ? '⇄' : b.swap === 'replace' ? '⇄$' : '→'}T${b.tube}${b.via === 'drag' ? '(drag)' : ''}`).join(' '));
  if (r.rigs.length) bits.push(r.rigs.map(x => `${x.rig}→T${x.tube}`).join(' '));
  if (r.tubesBought) bits.push(`+${r.tubesBought} tube`);
  if (r.rerolls) bits.push('reroll');
  if (r.matched) bits.push('Match');
  if (r.swapsKept) bits.push(`${r.swapsKept} swap`);
  if (r.sponsorOffered) bits.push(r.sponsorAccepted ? 'Sponsor✓' : `Sponsor✗(${r.sponsorMood || '?'})`);
  if (r.fusions && r.fusions.length) bits.push('✦ ' + r.fusions.join(','));
  if (r.mults && r.mults.length) bits.push('×' + Math.max(...r.mults).toFixed(2));
  console.log(`  ${lpad(r.show, 2)} ${pad(rules, 13)} ${lpad(fmtNum(r.target), 7)} ${lpad(fmtNum(r.applause), 8)} ${lpad(r.ratio == null ? '—' : r.ratio.toFixed(2), 5)}${r.pass === false ? ' MISS' : r.encore ? ' enc ' : '     '} ${pad(r.moodAtLight || '-', 8)} ${lpad(mmss(r.modelEnd), 5)}  ${bits.join(' · ')}`);
}

// ---------------------------------------------------------------- main
async function main() {
  const o = parseArgs(process.argv.slice(2));
  let url = o.url, server = null;
  const file = o.file || path.join(ROOT, 'index.html');
  if (!url) {
    if (!fs.existsSync(file)) { console.error(`humanplay: ${file} not found (build it first: node tools/build.mjs)`); process.exit(1); }
    ({ server, url } = await serve(file, o.raw));
  }
  fs.mkdirSync(o.out, { recursive: true });
  for (const f of fs.readdirSync(o.out)) if (/^run\d+-.*\.png$/.test(f) || f === 'report.json') fs.rmSync(path.join(o.out, f));
  const browser = await chromium.launch({ headless: !o.headed });
  const errors = [];
  const report = { tool: 'humanplay', when: new Date().toISOString(), file: o.url ? null : path.relative(ROOT, file), viewport: o.viewport, scale: o.scale, runs: [] };
  let ctx = null, exit = 0;
  const newCtx = async () => {
    if (ctx) await ctx.context.close();
    const context = await browser.newContext({ viewport: { width: o.vw, height: o.vh }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const aborted = new Set();
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => { aborted.add(r.request().url()); return r.abort(); });
    page.on('pageerror', e => errors.push({ kind: 'pageerror', text: String((e && e.stack) || e).slice(0, 800) }));
    page.on('console', m => {
      if (m.type() !== 'error') return;
      const loc = (m.location() && m.location().url) || '';
      if (/fonts\.(googleapis|gstatic)\.com/.test(loc + m.text()) || aborted.has(loc)) return; // ignored by design
      errors.push({ kind: 'console', text: m.text().slice(0, 800), at: loc });
    });
    page.on('request', r => { const u = r.url(); if (!/^(data|blob):/.test(u) && !u.startsWith(new URL(url).origin) && !/fonts\.(googleapis|gstatic)\.com/.test(u)) errors.push({ kind: 'network', text: `unexpected request ${u}` }); });
    ctx = { context, page, needsLoad: true };
  };
  console.log(`humanplay: ${o.url || path.relative(process.cwd(), file)} · ${o.viewport} · scale ${o.scale}${o.scale < 1 ? ' (fast; minutes are modelled)' : ''} · ${o.runs} run(s)`);
  try {
    for (let r = 1; r <= o.runs; r++) {
      if (r === 1 || o.fresh) await newCtx();
      let runUrl = url;
      if (o.seed) { runUrl = `${url}?seed=${encodeURIComponent(r === 1 ? o.seed : `${o.seed}-${r}`)}`; ctx.needsLoad = true; }
      else if (r > 1 && !o.fresh) {
        // later runs: the real "Run it back" button on the end screen
        const proxy = new HumanProxy(ctx.page, o, errors);
        const s = await proxy.read();
        if (s.ui === 'END' && s.runItBack) { await proxy.tap('#run-it-back'); await proxy.waitUi(x => x.ui === 'BUILD' || x.ui === 'RESULT', 15000, 'BUILD after Run it back'); }
        else ctx.needsLoad = true;
      }
      console.log(`\nrun ${r}`);
      console.log(`  sh rules          target applause ratio      mood     model  what the proxy did`);
      let res;
      try { res = await playRun(ctx, r, runUrl, o, errors); }
      catch (e) {
        console.log(`  HARNESS FAILURE: ${e.message}`);
        await ctx.page.screenshot({ path: path.join(o.out, `run${r}-failure.png`) }).catch(() => {});
        report.runs.push({ run: r, failure: e.message, errors: errors.slice() });
        exit = 1; continue;
      }
      const { run } = res;
      run.gates = gatesFor(run);
      report.runs.push(run);
      printRunSummary(run);
      if (run.errors.length || run.gates.some(g => g.status === 'FAIL' && g.hard)) exit = Math.max(exit, 1);
      else if (o.strict && run.gates.some(g => g.status === 'FAIL')) exit = Math.max(exit, 2);
    }
  } finally {
    await browser.close();
    if (server) server.close();
  }
  report.errors = errors;
  report.exit = exit;
  fs.writeFileSync(path.join(o.out, 'report.json'), JSON.stringify(report, null, 2));
  if (o.json) console.log(JSON.stringify(report));
  console.log(`\nfilmstrip + report.json: ${path.relative(process.cwd(), o.out) || o.out}`);
  console.log(exit === 0 ? 'humanplay: OK' : exit === 2 ? 'humanplay: gate failure (--strict)' : 'humanplay: FAILED');
  process.exit(exit);
}

function gatesFor(run) {
  const g = [];
  const mins = run.modelSeconds / 60;
  if (run.firstRun && run.ended && run.ended.outcome === 'cap') g.push({ id: 'first-run length', want: '3–5 min', got: `${mins.toFixed(1)} min (stopped by --max-shows)`, status: 'INFO' });
  else if (run.firstRun) g.push({ id: 'first-run length', want: '3–5 min', got: `${mins.toFixed(1)} min`, status: mins >= 3 && mins <= 5 ? 'PASS' : 'FAIL' });
  else g.push({ id: 'run length', want: 'informational (not a first-ever run)', got: `${mins.toFixed(1)} min`, status: 'INFO' });
  g.push({ id: 'first 1-of-3 choice shown', want: '< 0:30', got: mmss(run.firstChoiceShown), status: run.firstChoiceShown != null && run.firstChoiceShown < 30 ? 'PASS' : 'FAIL' });
  g.push({ id: 'first choice made', want: 'informational', got: mmss(run.firstChoiceMade), status: 'INFO' });
  g.push({ id: 'first fusion', want: 'spec §6: ~1:45–2:30', got: run.firstFusion ? `${mmss(run.firstFusion.at)} (show ${run.firstFusion.show}, ${run.firstFusion.name})` : 'none', status: 'INFO' });
  g.push({ id: 'first multiplier', want: 'informational', got: run.firstMult ? `${mmss(run.firstMult.at)} (show ${run.firstMult.show}, ×${run.firstMult.factor})` : 'none', status: 'INFO' });
  g.push({ id: 'console/page errors', want: '0', got: String(run.errors.length), status: run.errors.length ? 'FAIL' : 'PASS', hard: true });
  g.push({ id: 'local chips readable', want: 'chips parsed from the DOM', got: run.chipsRead ? 'yes' : 'no (fell back to badges)', status: run.chipsRead ? 'PASS' : 'WARN' });
  return g;
}

function printRunSummary(run) {
  const e = run.ended || {};
  const ratios = run.shows.filter(r => r.ratio != null).map(r => r.ratio);
  console.log(`  seed ${run.seed ?? '?'} · first-ever run ${run.firstRun == null ? '?' : run.firstRun ? 'yes' : 'no'} · kit ${run.kit ?? '?'} · telemetry ${run.telemetry}`);
  console.log(`  ended: ${e.outcome === 'won' ? 'WON' : e.outcome === 'lost' ? 'lost' : e.outcome} at show ${e.show} (${e.festival || '?'} ${e.slot || ''})${e.header ? ` · end screen: "${e.header}"` : ''}`);
  console.log(`  length ${mmss(run.modelSeconds)} modelled (${(run.modelSeconds / 60).toFixed(1)} min) · wall ${mmss(run.wallSeconds)} · ${run.decisions} decisions · per minute by third: ${run.decisionsPerMinByThird.join(' / ')} (${run.decisionsByThird.map(x => Object.entries(x.kinds).map(([k, v]) => `${v} ${k}`).join(', ')).join(' | ')})`);
  if (ratios.length) {
    const sorted = ratios.slice().sort((a, b) => a - b);
    console.log(`  Applause/target: median ${sorted[Math.floor(sorted.length / 2)].toFixed(2)} · min ${sorted[0].toFixed(2)} · max ${sorted[sorted.length - 1].toFixed(2)} · misses ${run.shows.filter(r => r.pass === false).length}`);
  }
  console.log(`  input: ${run.stats.taps} taps, ${run.stats.drags} drags · swap-ins ${run.shows.reduce((a, r) => a + (r.swapIns || 0), 0)}, replaces ${run.shows.reduce((a, r) => a + (r.replaces || 0), 0)}, swaps undone ${run.shows.reduce((a, r) => a + (r.swapsUndone || 0), 0)}`);
  for (const g of run.gates) console.log(`  [${g.status}] ${pad(g.id, 26)} ${pad(g.got, 34)} want ${g.want}`);
  for (const er of run.errors.slice(0, 10)) console.log(`  ! ${er.kind}: ${er.text.split('\n')[0]}`);
  for (const f of run.findings || []) console.log(`  finding: ${f}`);
}

main().catch(e => { console.error('humanplay: crashed:', e && e.stack || e); process.exit(1); });
