#!/usr/bin/env node
/*
 * ============================================================================
 *  Ooh × Aah: spec audit  (tools/audit/spec-audit.mjs)
 * ============================================================================
 *
 *  Checks the running game against DESIGN.md (the authoritative spec) and
 *  src/CONTRACT.md. Companion to tools/audit/spec-checklist.md: every checklist
 *  item marked "AUTO `<id>`" is one of the check ids printed by this tool.
 *
 *  WHAT IT DOES
 *   1. spec.*    Parses the Markdown tables of DESIGN.md (shells §4.3, patterns
 *                §4.4, fusions §4.5, rigs §4.6, Headliners §4.7, kits §4.8,
 *                Sponsors §4.9, Renown §4.10, milestones §4.11, lessons §4.12,
 *                tooltips §4.13, targets §5.1, prices §5.3, rarity weights §5.6,
 *                colours §4.1, tokens §8.5, festival names + glossary + rules
 *                card §1, event names §9, golden tests + seed traces §11.8) and
 *                self-checks the spec (row counts, ≤64-char card text, 2-sig-fig
 *                targets, …). A FAIL here means the parser or the spec broke.
 *   2. data.*   Compares OOH.DATA field by field with those tables and prints
 *                every mismatch together with the raw spec row.
 *   3. golden.* Runs the 30 §11.8 resolver goldens + the Match property test
 *                through OOH.resolveShow (node) and, in the browser pass,
 *                through window.__game.resolve.
 *   4. trace.*  Replays the three §11.8 seed-level traces with "Script B" and
 *                compares shops, Sponsors, racks, rules, Applause/target,
 *                coins/crowd, Headliner/Twilight draws and the final RNG state.
 *   5. sim.*    Behavioural SIM checks through the §11.4 API: rulesFor, target
 *                modifiers, matchPerm, favourite, mood (§6 examples), fmt,
 *                dailySeed, createState fields, RNG seeding (§11.3 code), the
 *                Headliner draw, kits, keepsake, first-run overrides, prices,
 *                legality, events (§9 names/fields, seq), determinism, a random
 *                legal-action fuzz for invariants (§11.7), shop properties, bots.
 *   6. static.* Page contract on the built index.html text (§11.1, §11.2,
 *                §11.5, §14): size, first tags, no wrapper tags, fonts import,
 *                external URLs, alert/confirm/prompt, 100vh, CSS base rules…
 *   7. page.* / hooks.* / flags.* / ui.* / layout.* / a11y.* / persist.* /
 *      end.*   Playwright + Chromium against the built page: globals and the
 *                window.__game hooks (§11.6), every URL flag, first-run show-1
 *                build, HUD/DOM ids (CONTRACT.md), overlays + keys (§13),
 *                layouts at 360×740 / 360×640 / 375×548 / 360×500 / 1440×900
 *                (§8.1), tap targets ≥ 44 px, text ≥ 16 px, tokens (§8.5),
 *                persistence (§7.5), no-storage boot, lifecycle, audio only
 *                after a gesture, the end screen (§8.2) and Run it back.
 *                The page is served over a local http server; Google Fonts are
 *                aborted and any other external request is recorded (a FAIL).
 *   8. meta.checklist  (full runs) every "AUTO `id`" in spec-checklist.md is a
 *                check this run produced, so the checklist cannot drift.
 *
 *  USAGE (from anywhere; paths default to this game folder)
 *    node tools/audit/spec-audit.mjs                 # everything available
 *    node tools/audit/spec-audit.mjs --no-browser    # node-only checks
 *    node tools/audit/spec-audit.mjs --only data,golden,trace
 *    node tools/audit/spec-audit.mjs --html path/to/index.html --sim path/to/sim.js
 *    node tools/audit/spec-audit.mjs --json out.json --verbose
 *    node tools/audit/spec-audit.mjs --bots 200      # also run the §12.2 bot gates (slow)
 *
 *  OPTIONS
 *    --design <file>   spec (default ../../DESIGN.md)
 *    --sim <file>      sim module (default ../../src/sim.js). If it is missing
 *                      or fails to load, OohSim is taken from the built page.
 *    --html <file>     built page (default ../../index.html)
 *    --json <file>     JSON report (default tools/audit/out/spec-audit.json)
 *    --shots <dir>     layout screenshots (default tools/audit/out/shots; "none" to skip)
 *    --only <groups>   comma list of groups: spec,data,golden,trace,sim,static,
 *                      page,hooks,flags,ui,layout,a11y,persist,end,bots
 *    --no-browser      skip every Playwright group
 *    --bots <n>        run the §12.2 bot gates over seeds 1..n (default 0 = off)
 *    --verbose         print details for PASS items too
 *    --timeout <ms>    per-wait timeout in the browser (default 8000)
 *    --watchdog <s>    hard cap for the whole run (default 900)
 *
 *  OUTPUT
 *    A readable report on stdout: one line per check
 *      PASS|FAIL|WARN|SKIP  <id>  §ref  [owner]  title — summary
 *    followed by indented details (mismatches with the raw spec row), then a
 *    summary per status and per owning module. The JSON report holds
 *    {meta, summary, byOwner, checks:[{id, group, owner, spec, title, status,
 *    summary, details[], data}]}.
 *    Exit code: 0 = no FAIL, 1 = at least one FAIL, 2 = the tool itself broke.
 *
 *  STATUS MEANING
 *    PASS  spec requirement verified.   FAIL  requirement violated (or the API
 *    the spec/contract names is missing).   WARN  soft deviation (non-verbatim
 *    descriptive text, px sizes off by > 2 px, optional data not exposed, a
 *    representation the tool could not interpret).   SKIP  could not run
 *    (module/page missing, precondition not reached) — never counts as pass.
 *
 *  ENVIRONMENT
 *    Node ≥ 18. Playwright is loaded from /opt/node22/lib/node_modules (or the
 *    local node_modules). Never runs `playwright install`. Google Fonts
 *    requests are recorded (allowed) and aborted, so no network is needed.
 *    The tool never edits src/ or the build; it only reads.
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import http from 'node:http';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME_DIR = path.resolve(HERE, '..', '..');

// ------------------------------------------------------------------ CLI
const ARGV = process.argv.slice(2);
function opt(name, def) {
  const i = ARGV.findIndex((a) => a === '--' + name || a.startsWith('--' + name + '='));
  if (i < 0) return def;
  const a = ARGV[i];
  if (a.includes('=')) return a.slice(a.indexOf('=') + 1);
  const n = ARGV[i + 1];
  return n === undefined || n.startsWith('--') ? true : n;
}
if (ARGV.includes('--help') || ARGV.includes('-h')) {
  const src = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  console.log(src.slice(src.indexOf('/*') + 2, src.indexOf('*/')).replace(/^ \* ?/gm, ''));
  process.exit(0);
}
const OPT = {
  design: path.resolve(opt('design', path.join(GAME_DIR, 'DESIGN.md'))),
  sim: path.resolve(opt('sim', path.join(GAME_DIR, 'src', 'sim.js'))),
  html: path.resolve(opt('html', path.join(GAME_DIR, 'index.html'))),
  json: path.resolve(opt('json', path.join(HERE, 'out', 'spec-audit.json'))),
  shots: opt('shots', path.join(HERE, 'out', 'shots')),
  only: opt('only', null),
  noBrowser: ARGV.includes('--no-browser'),
  bots: Number(opt('bots', 0)) || 0,
  verbose: ARGV.includes('--verbose'),
  timeout: Number(opt('timeout', 8000)) || 8000,
  watchdog: Number(opt('watchdog', 900)) || 900,
};
const GROUPS_ALL = ['spec', 'data', 'golden', 'trace', 'sim', 'static', 'page', 'hooks', 'flags', 'ui', 'layout', 'a11y', 'persist', 'end', 'bots'];
const ONLY = OPT.only && OPT.only !== true ? new Set(String(OPT.only).split(',').map((s) => s.trim())) : null;
const wants = (g) => (ONLY ? ONLY.has(g) : g !== 'bots' || OPT.bots > 0);

// ------------------------------------------------------------------ report
const CHECKS = [];
const OWNERS = ['sim', 'audio', 'fx', 'core', 'play', 'panels', 'end', 'menus', 'lead', 'tooling', 'spec'];
function add(c) {
  const rec = {
    id: c.id, group: c.id.split('.')[0], owner: c.owner || 'sim', spec: c.spec || '',
    title: c.title || c.id, status: c.status, summary: c.summary || '',
    details: (c.details || []).map(String), data: c.data === undefined ? undefined : c.data,
  };
  CHECKS.push(rec);
  printCheck(rec);
  return rec;
}
const pass = (c, summary, details, data) => add({ ...c, status: 'PASS', summary, details, data });
const fail = (c, summary, details, data) => add({ ...c, status: 'FAIL', summary, details, data });
const warn = (c, summary, details, data) => add({ ...c, status: 'WARN', summary, details, data });
const skip = (c, summary, details, data) => add({ ...c, status: 'SKIP', summary, details, data });
/** Run fn(c) and turn exceptions into FAIL (or SKIP when err.skip is set). Synchronous when fn is. */
function check(c, fn) {
  const onErr = (e) => (e && e.skip ? skip(c, e.message) : fail(c, 'check threw: ' + (e && e.message ? e.message : String(e)), e && e.stack ? [e.stack.split('\n').slice(0, 4).join(' | ')] : []));
  const done = (r) => (r && r.status ? add({ ...c, ...r }) : r);
  let r;
  try { r = fn(c); } catch (e) { return onErr(e); }
  if (r && typeof r.then === 'function') return r.then(done, onErr);
  return done(r);
}
/** check() only when the id's group was asked for (--only). */
const gated = (c, fn) => (wants(c.id.split('.')[0]) ? check(c, fn) : undefined);
/** Build a PASS/FAIL/WARN result from a list of problems. */
function verdict(fails, warns, okSummary, extra = {}) {
  fails = fails.filter(Boolean); warns = (warns || []).filter(Boolean);
  if (fails.length) return { status: 'FAIL', summary: `${fails.length} problem(s)` + (warns.length ? `, ${warns.length} warning(s)` : ''), details: [...fails, ...warns.map((w) => 'warn: ' + w)], ...extra };
  if (warns.length) return { status: 'WARN', summary: `${warns.length} warning(s)`, details: warns, ...extra };
  return { status: 'PASS', summary: okSummary, details: extra.details || [], ...extra };
}
class Skip extends Error { constructor(m) { super(m); this.skip = true; } }
const need = (cond, msg) => { if (!cond) throw new Skip(msg); };

const TTY = process.stdout.isTTY && !process.env.NO_COLOR;
const COL = { PASS: '\x1b[32m', FAIL: '\x1b[31m', WARN: '\x1b[33m', SKIP: '\x1b[90m', H: '\x1b[1m', R: '\x1b[0m' };
const paint = (k, s) => (TTY ? COL[k] + s + COL.R : s);
let lastGroup = null;
const GROUP_TITLES = {
  spec: 'DESIGN.md parse and spec self-consistency', data: 'OOH.DATA vs DESIGN.md content tables',
  golden: '§11.8 resolver golden tests', trace: '§11.8 seed-level golden traces (Script B)',
  sim: 'SIM behaviour through the §11.4 API', static: 'Page contract on the built file (§11.1, §11.2, §11.5, §14)',
  page: 'Built page: globals, boot, requests (Playwright)', hooks: 'window.__game test hooks (§11.6)',
  flags: 'URL flags (§11.6)', ui: 'UI behaviour: first run, HUD, overlays, keys', layout: 'Layout (§8.1) at the §11.2 sizes',
  a11y: 'Accessibility (§13)', persist: 'Persistence and lifecycle (§7.5, §11.5)', end: 'End screen (§8.2)', bots: 'Bot gates (§12.2)',
};
function printCheck(r) {
  if (r.group !== lastGroup) {
    lastGroup = r.group;
    console.log('\n' + paint('H', `[${r.group}] ${GROUP_TITLES[r.group] || ''}`));
  }
  const line = `  ${paint(r.status, r.status.padEnd(4))} ${r.id.padEnd(34)} ${(r.spec || '').padEnd(8)} [${r.owner}] ${r.title}` + (r.summary ? ` — ${r.summary}` : '');
  console.log(line);
  if (r.status !== 'PASS' || OPT.verbose) {
    const max = r.status === 'PASS' ? 12 : 60;
    r.details.slice(0, max).forEach((d) => console.log('       ' + d));
    if (r.details.length > max) console.log(`       … ${r.details.length - max} more (see JSON report)`);
  }
}

// ------------------------------------------------------------------ small utils
const clone = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);
const num = (s) => { const m = String(s).replace(/\*\*/g, '').match(/-?\d[\d,]*(?:\.\d+)?/g); return m ? Number(m[m.length - 1].replace(/,/g, '')) : NaN; };
const firstNum = (s) => { const m = String(s).match(/-?\d[\d,]*(?:\.\d+)?/); return m ? Number(m[0].replace(/,/g, '')) : NaN; };
const strip = (s) => String(s ?? '').replace(/\*\*/g, '').replace(/`/g, '').trim();
const unq = (s) => { const t = strip(s); const m = /^["“](.*?)["”](?=\s|$)/s.exec(t); return m ? m[1] : t; };
function normText(s) {
  return String(s ?? '').normalize('NFC').replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"')
    .replace(/[    ]/g, ' ').replace(/\s+/g, ' ').trim();
}
const short = (v, n = 90) => { const s = typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v); return s === undefined ? 'undefined' : s.length > n ? s.slice(0, n - 1) + '…' : s; };
function deepEq(a, b, tol = 1e-9) {
  if (typeof a === 'number' && typeof b === 'number') return a === b || Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
  if (Array.isArray(a) && isObj(b)) return deepEq(a, Object.values(b), tol);
  if (isObj(a) && Array.isArray(b)) return deepEq(Object.values(a), b, tol);
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deepEq(x, b[i], tol));
  if (isObj(a) && isObj(b)) { const ka = Object.keys(a).sort(), kb = Object.keys(b).sort(); return deepEq(ka, kb) && ka.every((k) => deepEq(a[k], b[k], tol)); }
  if (typeof a === 'string' && typeof b === 'number' && a.trim() !== '' && !isNaN(+a)) return +a === b;
  if (typeof b === 'string' && typeof a === 'number' && b.trim() !== '' && !isNaN(+b)) return +b === a;
  return a === b;
}
const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');

// §11.3 reference RNG (exact code from the spec) — used to verify seeding and the Headliner draw.
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i); h1 = h2 ^ Math.imul(h1 ^ k, 597399067); h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213); h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067); h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233); h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179); h1 ^= (h2 ^ h3 ^ h4); h2 ^= h1; h3 ^= h1; h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}
function rngNext(st) {
  let [a, b, c, d] = st.rng; a |= 0; b |= 0; c |= 0; d |= 0; const t = (a + b | 0) + d | 0; d = d + 1 | 0; a = b ^ b >>> 9; b = c + (c << 3) | 0;
  c = (c << 21 | c >>> 11); c = c + t | 0; st.rng = [a >>> 0, b >>> 0, c >>> 0, d >>> 0]; return (t >>> 0) / 4294967296;
}
function refRng(seed) { const st = { rng: cyrb128(String(seed)) }; for (let i = 0; i < 15; i++) rngNext(st); return st; }

// ============================================================================
//  1. DESIGN.md parser
// ============================================================================
function splitRow(l) {
  let s = l.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = []; let cur = '';
  for (let k = 0; k < s.length; k++) {
    const c = s[k];
    if (c === '\\' && s[k + 1] === '|') { cur += '|'; k++; continue; }
    if (c === '|') { cells.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  cells.push(cur.trim());
  return cells;
}
function parseDoc(text) {
  const lines = text.split(/\r?\n/);
  const heads = []; let fence = false;
  lines.forEach((l, i) => {
    if (/^```/.test(l)) fence = !fence;
    if (fence) return;
    const m = /^(#{1,6})\s+(.*)$/.exec(l);
    if (m) heads.push({ level: m[1].length, title: m[2].trim(), line: i });
  });
  heads.forEach((h, k) => {
    let end = lines.length;
    for (let j = k + 1; j < heads.length; j++) if (heads[j].level <= h.level) { end = heads[j].line; break; }
    h.end = end;
    const nm = /^(\d+(?:\.\d+)*)\.?\s/.exec(h.title);
    h.num = nm ? nm[1] : null;
  });
  return { lines, heads };
}
function sec(doc, key) {
  const h = doc.heads.find((x) => (typeof key === 'string' ? x.num === key || x.title.startsWith(key) : key.test(x.title)));
  if (!h) throw new Error(`DESIGN.md section "${key}" not found`);
  return { head: h, lines: doc.lines.slice(h.line + 1, h.end), offset: h.line + 1 };
}
function tables(s) {
  const out = []; const L = s.lines; let fence = false;
  for (let i = 0; i < L.length; i++) {
    if (/^```/.test(L[i])) { fence = !fence; continue; }
    if (fence) continue;
    if (/^\s*\|/.test(L[i]) && i + 1 < L.length && /^\s*\|?\s*:?-{3,}/.test(L[i + 1])) {
      const header = splitRow(L[i]).map(strip); const rows = []; let j = i + 2;
      while (j < L.length && /^\s*\|/.test(L[j])) {
        const cells = splitRow(L[j]); const o = { _raw: L[j].trim(), _line: s.offset + j + 1, _cells: cells };
        header.forEach((h, k) => { o[h] = cells[k] ?? ''; });
        rows.push(o); j++;
      }
      out.push({ header, rows, line: s.offset + i + 1 }); i = j - 1;
    }
  }
  return out;
}
function parseParams(src) {
  const s = strip(src); const out = {}; let depth = 0, cur = ''; const parts = [];
  for (const ch of s) { if (ch === '[') depth++; if (ch === ']') depth--; if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch; }
  if (cur.trim()) parts.push(cur);
  for (let p of parts) {
    p = p.trim(); if (!p) continue;
    const i = p.indexOf(':');
    if (i < 0) { out[p] = true; continue; }
    const k = p.slice(0, i).trim(); const v = p.slice(i + 1).trim();
    if (v.startsWith('[')) out[k] = v.slice(1, -1).split(',').map((x) => x.trim()).map((x) => (x !== '' && !isNaN(+x) ? +x : x));
    else out[k] = !isNaN(+v) ? +v : v;
  }
  return out;
}
const COLOUR_WORD = { red: 'R', gold: 'A', green: 'G', blue: 'B', white: 'W', rainbow: 'X' };

function parseSpec(text) {
  const doc = parseDoc(text);
  const S = { doc, errors: [] };
  const T = (key, idx = 0) => { const t = tables(sec(doc, key))[idx]; if (!t) throw new Error(`no table #${idx} in §${key}`); return t; };

  // §4.3 shells
  S.shells = T('4.3').rows.map((r) => {
    const nm = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(strip(r['Name (mono)']));
    const params = parseParams(r.Params);
    const shots = params.shots ?? 1; const wildColour = !!params.wildColour;
    delete params.shots; delete params.wildColour;
    return {
      id: strip(r.id), name: nm ? nm[1] : strip(r['Name (mono)']), mono: nm ? nm[2] : null, col: strip(r.Col),
      rarity: strip(r.R), cost: num(r.$), hang: firstNum(r.H), text: strip(r['Card text (★1)']), params, shots, wildColour,
      tags: strip(r.Tags).split(',').map((x) => x.trim()).filter(Boolean), fest: num(r.F), unlockName: strip(r.Unlock),
      _raw: r._raw, _line: r._line,
    };
  });
  const byName = new Map(); const ids = new Set(S.shells.map((s) => s.id));
  for (const s of S.shells) { byName.set(s.name.toLowerCase(), s.id); byName.set(s.id, s.id); }
  S.shellId = (name) => {
    const n = strip(name).toLowerCase().trim();
    if (ids.has(n)) return n;
    if (byName.has(n)) return byName.get(n);
    const squash = n.replace(/[^a-z]/g, ''); if (ids.has(squash)) return squash;
    const pref = S.shells.filter((s) => s.name.toLowerCase().startsWith(n)); if (pref.length === 1) return pref[0].id;
    return null;
  };
  S.shell = (id) => S.shells.find((s) => s.id === id);

  // §4.11 milestones (needed to resolve unlock names)
  S.milestones = T('4.11').rows.map((r) => ({ id: strip(r.id), name: strip(r.Name), condition: strip(r['Condition (within one run)']), unlocksRaw: strip(r.Unlocks), _raw: r._raw, _line: r._line }));
  const msByName = new Map(S.milestones.map((m) => [m.name.toLowerCase(), m.id]));
  S.milestoneId = (name) => { const n = strip(name).toLowerCase(); if (!n || n === 'start' || n.startsWith('start')) return null; return msByName.get(n) ?? `?${name}`; };
  for (const s of S.shells) s.lock = S.milestoneId(s.unlockName);

  // §4.4 burst patterns → expected shell.pattern
  S.patterns = T('4.4').rows.map((r) => ({ id: strip(r.Pattern), usedBy: strip(r['Used by']), n: strip(r.n), speed: strip(r.Speed), gravity: strip(r.Gravity), drag: strip(r.Drag), life: strip(r.Life), trail: strip(r.Trail), twinkle: strip(r.Twinkle), special: strip(r.Special), _raw: r._raw, _line: r._line }));
  S.patternOf = {};
  for (const p of S.patterns) {
    const names = p.usedBy.replace(/\([^)]*\)/g, '').split(/[,;]/).map((x) => x.trim()).filter(Boolean);
    for (const n of names) { const id = S.shellId(n); if (id) S.patternOf[id] = p.id; else S.errors.push(`§4.4 pattern ${p.id}: unknown shell "${n}"`); }
  }

  // §4.2 vocabulary
  const voc = sec(doc, '4.2'); const vt = tables(voc);
  S.vocabRepeatable = vt[0].rows.map((r) => strip(r.Key).split(':')[0]);
  S.vocabOther = vt[1].rows.map((r) => strip(r.Key).split(':')[0]);
  S.vocab = new Set([...S.vocabRepeatable, ...S.vocabOther]);
  S.rowFlags = ['shots', 'wildColour'];

  // §4.5 fusions
  S.fusions = T('4.5').rows.map((r) => {
    const [a, b] = strip(r['A → B']).split('→').map((x) => x.trim());
    const first = strip(r['First possible with']);
    const fm = /\(F(\d+)\)/.exec(first);
    return { n: num(r['#']), aName: a, bName: b, a: S.shellId(a), b: S.shellId(b), name: strip(r.Name), params: parseParams(r['Bonus params']), firstRaw: first, fest: fm ? +fm[1] : null, lock: /^start/i.test(first) ? null : S.milestoneId(first), _raw: r._raw, _line: r._line };
  });
  for (const f of S.fusions) { f.key = `${f.a}>${f.b}`; if (!f.a || !f.b) S.errors.push(`§4.5 fusion ${f.name}: unresolved shell name`); }

  // §4.6 rigs
  S.rigs = T('4.6').rows.map((r) => ({ id: strip(r.id), name: strip(r.Name), cost: num(r.$), glyph: strip(r.Glyph), effect: strip(r.Effect), lock: S.milestoneId(strip(r.Unlock)), _raw: r._raw, _line: r._line }));

  // §4.7 Headliners
  S.headliners = T('4.7').rows.map((r) => {
    const w = strip(r.Window); const m = /F(\d+)(?:\s*[–-]\s*F?(\d+))?/.exec(w);
    return { id: strip(r.id), name: strip(r.Name), window: w, min: m ? +m[1] : NaN, max: m ? +(m[2] ?? m[1]) : NaN, rule: strip(r.Rule), counters: strip(r.Counters), telegraph: strip(r['Rack telegraph']), _raw: r._raw, _line: r._line };
  });

  // §4.8 kits
  S.kits = T('4.8').rows.map((r) => {
    const rack = [null, null, null, null]; const bad = [];
    for (let part of strip(r['Rack (4 tubes)']).split(',')) {
      part = part.trim(); const m = /^T(\d)(?:\s*[–-]\s*T(\d))?\s+(.*)$/.exec(part);
      if (!m) { bad.push(part); continue; }
      const lo = +m[1], hi = +(m[2] ?? m[1]); const body = m[3].trim();
      if (/^empty$/i.test(body)) continue;
      const cm = /^(.*?)\s*(?:\((\w+)\))?$/.exec(body); const id = S.shellId(cm[1]);
      if (!id) bad.push(part);
      const col = cm[2] ? COLOUR_WORD[cm[2].toLowerCase()] : (S.shell(id)?.col ?? null);
      for (let t = lo; t <= hi; t++) rack[t - 1] = { id, col };
    }
    if (bad.length) S.errors.push(`§4.8 kit ${strip(r.id)}: unparsed rack part(s) ${bad.join('; ')}`);
    return { id: strip(r.id), name: strip(r.Name), rack, coins: num(r.$), crowd: num(r.Crowd), constraint: strip(r['Constraint / bonus']), lock: S.milestoneId(strip(r.Unlock)), _raw: r._raw, _line: r._line };
  });
  const kitByName = new Map(S.kits.map((k) => [k.name.toLowerCase(), k.id]));
  for (const m of S.milestones) {
    m.unlockShells = []; m.unlockKits = []; m.unlockOther = [];
    for (const part of m.unlocksRaw.split(',').map((x) => x.trim()).filter(Boolean)) {
      const kitm = /^(.*)\s+kit$/i.exec(part);
      if (kitm && kitByName.has(kitm[1].toLowerCase())) m.unlockKits.push(kitByName.get(kitm[1].toLowerCase()));
      else if (S.shellId(part)) m.unlockShells.push(S.shellId(part));
      else m.unlockOther.push(part);
    }
    const g = /(\d+)\+?\s*bursts|reaches (\d+)|(\d+)\+ coloured|(\d+) rigs|(\d+) of the 12|^(\d+) colours up|★(\d)/.exec(m.condition);
    // Conditions without a number ("Fire any fusion", "Pass Festival 4's Headliner", "Win a run") have goal 1.
    m.goal = g ? +(g[1] || g[2] || g[3] || g[4] || g[5] || g[6] || g[7]) : 1;
    m.conditionText = m.condition.replace(/\s*\([^)]*(%|never|novice)[^)]*\)\s*$/, '').trim();
  }

  // §4.9 Sponsors
  S.sponsors = T('4.9').rows.map((r) => ({ kind: strip(r.Kind), flavour: strip(r.Flavour), reward: strip(r.Reward), amount: /\+\$?(\d+)/.test(strip(r.Reward)) ? +/\+\$?(\d+)/.exec(strip(r.Reward))[1] : null, _raw: r._raw, _line: r._line }));
  // §4.10 Renown
  S.renown = T('4.10').rows.map((r) => ({ level: num(r.Level), modifier: strip(r.Modifier), _raw: r._raw, _line: r._line }));
  // §4.12 lessons
  S.lessons = T('4.12').rows.map((r) => ({ n: num(r['#']), predicate: strip(r.Predicate), text: unq(r.Text), _raw: r._raw, _line: r._line }));
  // §4.13 tooltips
  S.tooltips = T('4.13').rows.map((r) => ({ id: strip(r.Id), trigger: strip(r.Trigger), text: unq(r.Text), _raw: r._raw, _line: r._line }));

  // §4.1 colours. The Rainbow's bracket names its shell (Tourbillon), not a chemical; the fusion
  // accent row has no id and its shape cell reads "Braid / ✦".
  S.colours = T('4.1').rows.map((r) => {
    const nm = /^(\w+)(?:\s*\(([^)]+)\))?/.exec(strip(r.Colour)); const shape = strip(r['Token shape']);
    const hex = (s) => { const m = /#[0-9A-Fa-f]{6}/.exec(s); return m ? m[0].toUpperCase() : null; };
    const id = strip(r.Id);
    if (/^fusion/i.test(strip(r.Colour))) {
      const parts = shape.split('/').map((x) => x.trim());
      return { id: 'fusion', name: strip(r.Colour), chem: null, glyph: parts[1] || null, shape: (parts[0] || '').toLowerCase(), role: strip(r.Role), hex: hex(r.Default), hc: hex(r['High-contrast']), _raw: r._raw, _line: r._line };
    }
    return { id, name: nm ? nm[1] : strip(r.Colour), chem: id === 'X' ? null : nm ? nm[2] : null, shellName: id === 'X' && nm ? nm[2] : null, glyph: [...shape][0], shape: shape.replace(/^\S+\s*/, ''), role: strip(r.Role), hex: hex(r.Default), hc: hex(r['High-contrast']), _raw: r._raw, _line: r._line };
  });

  // §5.1 targets, festival names, bases
  const s51 = sec(doc, '5.1'); const tt = tables(s51)[0];
  S.targetRows = tt.rows;
  S.targets = []; S.festivals = [];
  for (const r of tt.rows) {
    const fm = /^(\d+)\s+(.*)$/.exec(strip(r.Festival)); S.festivals.push(fm ? fm[2] : strip(r.Festival));
    S.targets.push(num(r.Twilight), num(r.Evening), num(r.Headliner));
  }
  const bl = s51.lines.find((l) => /Festival bases:/.test(l));
  S.bases = bl ? bl.split(':')[1].replace(/\.\s*$/, '').split(', ').map((x) => num(x)) : [];
  const ml = s51.lines.find((l) => /Show multipliers/.test(l));
  S.showMult = ml ? (ml.match(/×\s*(\d+(?:\.\d+)?)/g) || []).map((x) => num(x)) : [];

  // §1 festival list, rules card, glossary
  const s1 = sec(doc, '1');
  const fl = s1.lines.find((l) => /\*\*Festivals:\*\*/.test(l));
  S.festivalsS1 = fl ? fl.replace(/.*\*\*Festivals:\*\*/, '').replace(/\.\s*$/, '').split(/,\s*(?=\d)/).map((x) => x.trim().replace(/^\d+\s+/, '')) : [];
  const rc = s1.lines.findIndex((l) => /\*\*Rules card\.\*\*/.test(l));
  S.rulesCard = [];
  for (let i = rc + 1; i < s1.lines.length && S.rulesCard.length < 3; i++) { const m = /^\s+\d\.\s+(.*)$/.exec(s1.lines[i]); if (m) S.rulesCard.push(m[1].trim()); else if (s1.lines[i].trim() && !/^\s/.test(s1.lines[i])) break; }
  S.glossary = tables(sec(doc, 'Glossary'))[0].rows.map((r) => ({ term: strip(r.Term), meaning: strip(r.Meaning), _raw: r._raw, _line: r._line }));
  const fic = sec(doc, 'Fiction').lines.join('\n');
  const sn = /three shows each \(([^)]+)\)/.exec(fic); S.showNames = sn ? sn[1].split(',').map((x) => x.trim()) : [];

  // §5.3 prices
  const pr = Object.fromEntries(T('5.3').rows.map((r) => [strip(r.Item), strip(r.Rule)]));
  S.pricesRaw = pr; S.prices = {};
  const tw = pr['Twin upgrade'] || ''; S.prices.upgradeExamples = [...tw.matchAll(/(\w+) \$(\d+) \/ \$(\d+)/g)].map((m) => ({ name: m[1], id: S.shellId(m[1]), up2: +m[2], up3: +m[3] }));
  const tb = pr.Tubes || ''; const t5 = /5th costs \$(\d+)/.exec(tb), t6 = /6th \$(\d+)/.exec(tb), r4 = /Renown 4: \+\$(\d+)/.exec(tb), mx = /Maximum (\d+)/.exec(tb), st = /Start with (\d+)/.exec(tb);
  Object.assign(S.prices, { tube5: t5 && +t5[1], tube6: t6 && +t6[1], tubeRenown4: r4 && +r4[1], maxTubes: mx && +mx[1], startTubes: st && +st[1] });
  const rr = pr.Reroll || ''; const rb = /^\$(\d+), then \+\$(\d+)/.exec(rr), r3 = /Renown 3: starts at \$(\d+)/.exec(rr);
  Object.assign(S.prices, { rerollBase: rb && +rb[1], rerollStep: rb && +rb[2], rerollRenown3: r3 && +r3[1] });
  const sl = /floor\((\d*\.?\d+) ×/.exec(pr.Sell || ''); S.prices.sellRate = sl ? +sl[1] : null;
  const cr = /(\d+) slots/.exec(pr.Crate || ''); S.prices.crateSlots = cr ? +cr[1] : null;
  const sc = /Renown 5: \+\$(\d+)/.exec(pr['Shell card'] || ''); S.prices.cardRenown5 = sc ? +sc[1] : null;

  // §5.6 rarity weights
  const rw = T('5.6').rows[0]; S.rarityWeights = {};
  for (const h of T('5.6').header.slice(1)) { const f = parseInt(h, 10); S.rarityWeights[f] = strip(rw[h]).split('/').map(Number); }

  // §8.5 tokens
  S.tokens = [];
  for (const r of T('8.5').rows) {
    const names = [...strip(r.Token).matchAll(/--[\w-]+/g)].map((m) => m[0]);
    const vals = [...String(r.Value).matchAll(/#[0-9A-Fa-f]{6}/g)].map((m) => m[0].toUpperCase());
    const hcs = /same/.test(r['High contrast']) ? vals : [...String(r['High contrast']).matchAll(/#[0-9A-Fa-f]{6}/g)].map((m) => m[0].toUpperCase());
    names.forEach((n, i) => { if (vals[i] && !/chip/.test(r.Token) || n === '--ooh' || n === '--aah') S.tokens.push({ name: n, value: vals[i] ?? null, hc: hcs[i] ?? hcs[0] ?? null, _raw: r._raw, _line: r._line }); });
  }
  S.tokens = S.tokens.filter((t) => t.value && t.name !== '--x');

  // §9 event names
  S.events = new Set();
  for (const r of T('9').rows) {
    const cell = String(r['SIM event']);
    for (const m of cell.matchAll(/`([^`]+)`/g)) for (const part of m[1].split('/')) { const nm = /^\s*(\w+)/.exec(part); if (nm) S.events.add(nm[1]); }
  }
  S.eventFields = {};
  for (const r of T('9').rows) { const m = /`(\w+)\s*\{([^}]*)\}`/.exec(r['SIM event']); if (m && !m[2].includes('...')) S.eventFields[m[1]] = m[2].split(',').map((x) => x.trim()).filter(Boolean); }

  // §11.8 golden tests
  const g = sec(doc, '11.8');
  const notation = g.lines.find((l) => /R6 = /.test(l)) || '';
  S.rigSets = {};
  for (const m of notation.matchAll(/(R\d+) = `([^`]+)`/g)) S.rigSets[m[1]] = m[2].split(',').map((x) => x.trim()).map((x) => (x === '–' || x === '-' ? null : x));
  S.goldens = parseGoldens(tables(g)[0].rows, S);
  const mp = g.lines.join('\n');
  const mrack = /fusion-less rack (.+):\s*$/m.exec(mp);
  S.matchTest = mrack ? {
    rack: mrack[1].split(',').map((x) => parseTubeToken(x.trim(), S)),
    plain: num((/Plain score = \*\*([\d,]+)\*\*/.exec(mp) || [])[1]),
    crossed: { score: num((/then crossed = \*\*([\d,]+)\*\*/.exec(mp) || [])[1]), order: ((/then crossed[^;]*; the order becomes ([^.]+)\./.exec(mp) || [])[1] || '').split(',').map((x) => S.shellId(x.trim())) },
    windshift: { score: num((/then windshift = \*\*([\d,]+)\*\*/.exec(mp) || [])[1]), order: ((/then windshift[^;]*; the order becomes ([^.]+)\./.exec(mp) || [])[1] || '').split(',').map((x) => S.shellId(x.trim())) },
  } : null;
  S.traces = parseTraces(g.lines);

  // §12.1 bots / §12.2 gates (names only; numbers are informational)
  S.gates = tables(sec(doc, '12.2'))[0].rows.map((r) => ({ metric: strip(r.Metric), gate: strip(r.Gate), ref: strip(r['v1.1 reference']) }));

  // §5.10 Afterparty: targets for shows 25–36 and the two-twist pool; §4.10 Renown 2 Twilight pool.
  const ap = sec(doc, '5.10').lines.join('\n');
  const kmb = (t) => { const m = /^([\d.]+)([KMB]?)$/.exec(t.trim()); return m ? Math.round(+m[1] * ({ '': 1, K: 1e3, M: 1e6, B: 1e9 })[m[2]]) : NaN; };
  S.afterpartyTargets = [];
  for (const m of ap.matchAll(/F(9|1[0-2]) ([\d.]+[KMB]?) \/ ([\d.]+[KMB]?) \/ ([\d.]+[KMB]?)/g)) S.afterpartyTargets.push(kmb(m[2]), kmb(m[3]), kmb(m[4]));
  const pm = /from \{([a-z, ]+)\}/.exec(ap); S.endlessPool = pm ? pm[1].split(',').map((x) => x.trim()) : [];
  const r2 = (S.renown.find((r) => r.level === 2) || {}).modifier || '';
  S.twilightPool = S.headliners.map((h) => ({ id: h.id, at: r2.indexOf(h.name.replace(/^The /, '')) })).filter((x) => x.at >= 0).sort((a, b) => a.at - b.at).map((x) => x.id);
  return S;
}

function parseTubeToken(tok, S) {
  tok = tok.trim();
  if (tok === '–' || tok === '-' || tok === '') return null;
  const m = /^(.+?)(?:\*(\d))?(?::([RAGBWX]))?$/.exec(tok);
  if (!m) return { bad: tok };
  const id = S.shellId(m[1]);
  if (!id) return { bad: tok };
  const row = S.shell(id);
  let col = m[3] || row.col;
  // A wild shell listed without a colour (only Cake in #23, which fires last) — colour is irrelevant; use Red.
  if (col === '*') col = 'R';
  return { id, col, star: m[2] ? +m[2] : 1 };
}
function parseGoldens(rows, S) {
  const byN = {};
  const out = [];
  for (const r of rows) {
    const n = num(r['#']);
    const tubesCell = strip(r.Tubes); const rigsCell = strip(r.Rigs); const rulesCell = strip(r.Rules); const crowdCell = strip(r.Crowd);
    const applCell = String(r.Applause);
    const bold = (/\*\*([^*]+)\*\*/.exec(applCell) || [null, applCell])[1];
    const appl = bold.split('/').map((x) => num(x));
    const oa = /\((\d[\d,]*)\s*×\s*(\d[\d,.]*)/.exec(applCell.replace(/\*\*[^*]+\*\*/, ''));
    const tubeVariants = (/^Same rack as #(\d+)/.exec(tubesCell) ? [byN[+/#(\d+)/.exec(tubesCell)[1]].tubeVariants[0]] : tubesCell.split(' / ').map((v) => v.split(',').map((x) => parseTubeToken(x, S))));
    const ruleVariants = rulesCell.split(' / ').map((rv) => {
      let fav = null; const fm = /♛ = tube (\d)/.exec(rv); if (fm) fav = +fm[1] - 1;
      const base = rv.replace(/\([^)]*\)/g, '').trim();
      const rules = base === 'none' ? [] : base.split('+').map((x) => x.trim()).filter(Boolean);
      return { rules, fav };
    });
    const crowdVariants = crowdCell.split('/').map((x) => num(x));
    const variants = Math.max(tubeVariants.length, ruleVariants.length, crowdVariants.length, appl.length);
    const rigsFor = (len) => {
      if (rigsCell === '–' || rigsCell === '-') return Array(len).fill(null);
      if (S.rigSets[rigsCell]) return S.rigSets[rigsCell].slice(0, len).concat(Array(Math.max(0, len - S.rigSets[rigsCell].length)).fill(null));
      const xm = /^(\w+)\s*×\s*(\d+)$/.exec(rigsCell); if (xm) return Array.from({ length: len }, (_, i) => (i < +xm[2] ? xm[1] : null));
      return rigsCell.split(',').map((x) => x.trim()).map((x) => (x === '–' || x === '-' ? null : x));
    };
    const g = { n, raw: r._raw, line: r._line, tubeVariants, cases: [] };
    for (let v = 0; v < variants; v++) {
      const shells = tubeVariants[Math.min(v, tubeVariants.length - 1)];
      const rv = ruleVariants[Math.min(v, ruleVariants.length - 1)];
      const rigs = rigsFor(shells.length);
      g.cases.push({
        label: `#${n}${variants > 1 ? String.fromCharCode(97 + v) : ''}`,
        shells, rigs, rules: rv.rules, fav: rv.fav, crowd: crowdVariants[Math.min(v, crowdVariants.length - 1)],
        applause: appl[Math.min(v, appl.length - 1)], ooh: v === 0 && oa ? num(oa[1]) : null, aah: v === 0 && oa ? num(oa[2]) : null,
        bad: shells.filter((s) => s && s.bad).map((s) => s.bad),
      });
    }
    byN[n] = g; out.push(g);
  }
  return out;
}
function parseTraces(lines) {
  const code = []; let fence = false;
  for (const l of lines) { if (/^```/.test(l)) { fence = !fence; continue; } if (fence) code.push(l); }
  const traces = []; let cur = null;
  for (const l of code) {
    const h = /^(golden-\d+)\s+\{([^}]*)\}\s+headliners=(\S+)/.exec(l.trim());
    if (h) {
      const opts = {}; for (const m of h[2].matchAll(/(\w+)\s*:\s*([\w.-]+)/g)) opts[m[1]] = isNaN(+m[2]) ? m[2] : +m[2];
      cur = { seed: h[1], opts, headliners: h[3].split(','), twilight: null, shows: [], rng: null }; traces.push(cur); continue;
    }
    if (!cur) continue;
    const tw = /^\s*twilight=(\S+)/.exec(l); if (tw) { cur.twilight = tw[1].split(',').map((x) => (x === '-' ? null : x)); continue; }
    const rg = /^rng after run:\s*([\d,]+)/.exec(l.trim()); if (rg) { cur.rng = rg[1].split(',').map(Number); continue; }
    const s = /^s(\d+)\s*\|/.exec(l.trim());
    if (s) {
      const p = l.split('|').map((x) => x.trim());
      const shopRig = /\+rig (\w+)/.exec(p[1]);
      const res = /^([\d,]+)\/([\d,]+)\s+(pass|MISS)/.exec(p[5]);
      const after = /\$(\d+) crowd (\d+)/.exec(p[6]);
      cur.shows.push({
        show: +s[1], raw: l.trim(), shop: p[1] === '-' ? [] : p[1].replace(/\+rig \w+/, '').trim().split(/\s+/).filter(Boolean), rig: shopRig ? shopRig[1] : null,
        sponsor: p[2] === '-' ? null : p[2], rack: p[3].split(/\s+/), rules: p[4] === '-' ? [] : p[4].split('+'),
        applause: res ? num(res[1]) : NaN, target: res ? num(res[2]) : NaN, pass: res ? res[3] === 'pass' : null,
        coins: after ? +after[1] : NaN, crowd: after ? +after[2] : NaN,
      });
    }
  }
  return traces;
}

// ============================================================================
//  2. spec self-checks
// ============================================================================
function specChecks(S, designText) {
  const C = (id, spec, title) => ({ id, spec, title, owner: 'spec' });
  const counts = [
    ['spec.parse.shells', '§4.3', 'shells table', S.shells.length, 34],
    ['spec.parse.patterns', '§4.4', 'burst-pattern table', S.patterns.length, 25],
    ['spec.parse.fusions', '§4.5', 'fusions table', S.fusions.length, 12],
    ['spec.parse.rigs', '§4.6', 'rigs table', S.rigs.length, 5],
    ['spec.parse.headliners', '§4.7', 'Headliners table (12 + Countdown)', S.headliners.length, 13],
    ['spec.parse.kits', '§4.8', 'kits table', S.kits.length, 5],
    ['spec.parse.sponsors', '§4.9', 'Sponsors table', S.sponsors.length, 3],
    ['spec.parse.renown', '§4.10', 'Renown table', S.renown.length, 8],
    ['spec.parse.milestones', '§4.11', 'milestones table', S.milestones.length, 10],
    ['spec.parse.lessons', '§4.12', 'lessons table', S.lessons.length, 14],
    ['spec.parse.tooltips', '§4.13', 'tooltips table', S.tooltips.length, 16],
    ['spec.parse.colours', '§4.1', 'colour table (6 + fusion accent)', S.colours.length, 7],
    ['spec.parse.targets', '§5.1', 'targets table', S.targets.length, 24],
    ['spec.parse.glossary', '§1', 'glossary', S.glossary.length, 19],
    ['spec.parse.rulescard', '§1', 'rules card lines', S.rulesCard.length, 3],
    ['spec.parse.festivals', '§1', 'festival names', S.festivalsS1.length, 8],
    ['spec.parse.goldens', '§11.8', 'golden resolver tests', S.goldens.length, 30],
    ['spec.parse.traces', '§11.8', 'seed-level traces', S.traces.length, 3],
  ];
  for (const [id, spec, title, got, want] of counts) (got === want ? pass : fail)(C(id, spec, title), `${got} rows parsed (expected ${want})`);
  const errs = [...S.errors];
  for (const g of S.goldens) for (const c of g.cases) { if (c.bad.length) errs.push(`golden ${c.label}: unparsed tube(s) ${c.bad.join(', ')}`); if (!Number.isFinite(c.applause)) errs.push(`golden ${c.label}: no Applause`); }
  for (const t of S.traces) { if (!t.rng) errs.push(`${t.seed}: no rng line`); if (!t.shows.length) errs.push(`${t.seed}: no show lines`); }
  if (!S.matchTest || S.matchTest.crossed.order.length !== 6 || S.matchTest.windshift.order.length !== 6) errs.push('Match property test not parsed');
  for (const m of S.milestones) for (const o of m.unlockOther) if (!/Renown|Afterparty|Daily Show|Information only|silhouette/i.test(o)) errs.push(`milestone ${m.id}: unresolved unlock "${o}"`);
  for (const x of [...S.shells, ...S.kits, ...S.fusions]) if (typeof x.lock === 'string' && x.lock.startsWith('?')) errs.push(`${x.id || x.key}: unknown milestone "${x.lock.slice(1)}"`);
  for (const [k, v] of Object.entries(S.prices)) if (v === null || v === undefined || (Array.isArray(v) && !v.length)) errs.push(`§5.3 price "${k}" not parsed`);
  (errs.length ? fail : pass)(C('spec.parse.integrity', '§4, §11.8', 'every name/unlock/golden cell resolves'), errs.length ? `${errs.length} unresolved item(s)` : 'all names resolve', errs);

  // Self-consistency of the spec itself.
  const pool = S.shells.filter((s) => s.lock === null).length;
  (pool === 22 ? pass : fail)(C('spec.self.startpool', '§4.3', '22 shells in the starting pool'), `${pool} rows with Unlock = start`);
  const long = S.shells.filter((s) => s.text.length > 64).map((s) => `${s.id}: ${s.text.length} chars`);
  (long.length ? fail : pass)(C('spec.self.cardtext64', '§4.2', 'every ★1 card text ≤ 64 characters'), long.length ? `${long.length} too long` : 'all ≤ 64', long);
  const badVocab = [];
  for (const s of S.shells) for (const k of Object.keys(s.params)) if (!S.vocab.has(k)) badVocab.push(`${s.id}.${k}`);
  for (const f of S.fusions) for (const k of Object.keys(f.params)) if (!S.vocab.has(k)) badVocab.push(`${f.key}.${k}`);
  (badVocab.length ? fail : pass)(C('spec.self.vocab', '§4.2', 'shell/fusion params use only §4.2 keys'), badVocab.length ? badVocab.join(', ') : `${S.vocab.size} keys`, badVocab);
  const sig2 = (x) => { const p = Math.pow(10, Math.floor(Math.log10(x)) - 1); return Math.round(x / p) * p; };
  const tErr = [];
  S.bases.forEach((b, f) => [1, 1.3, 1.8].forEach((m, k) => {
    const s = f * 3 + k; let want = sig2(b * m);
    if (s === 1) want = 130; if (s === 2) want = 150; if (s === 23) want = 180000;
    if (S.targets[s] !== want) tErr.push(`show ${s + 1}: table ${S.targets[s]} vs base ${b} × ${m} → ${want}`);
  }));
  (tErr.length ? warn : pass)(C('spec.self.targets2sf', '§5.1', 'target table = bases × multipliers rounded to 2 s.f.'), tErr.length ? `${tErr.length} differ` : '24 targets consistent', tErr);
  const fe = S.festivals.map((n, i) => (n !== S.festivalsS1[i] ? `${i + 1}: §5.1 "${n}" vs §1 "${S.festivalsS1[i]}"` : null)).filter(Boolean);
  (fe.length ? fail : pass)(C('spec.self.festivals', '§1, §5.1', 'festival names agree between §1 and §5.1'), fe.length ? 'differ' : S.festivalsS1.join(', '), fe);
  const up = S.prices.upgradeExamples.map((e) => { const c = S.shell(e.id)?.cost; const u2 = Math.ceil(1.5 * c), u3 = 2 * c; return u2 === e.up2 && u3 === e.up3 ? null : `${e.name}: row $${c} → $${u2}/$${u3}, text says $${e.up2}/$${e.up3}`; }).filter(Boolean);
  (up.length ? fail : pass)(C('spec.self.upgradeprices', '§5.3', 'twin-upgrade examples match ceil(1.5c) / 2c'), up.length ? 'differ' : 'Peony, Crossette, Finale consistent', up);
  const noPat = S.shells.filter((s) => !S.patternOf[s.id]).map((s) => s.id);
  (noPat.length ? warn : pass)(C('spec.self.patterns', '§4.4', 'every shell has a burst pattern in §4.4'), noPat.length ? `no pattern: ${noPat.join(', ')}` : '34/34');
  const hw = S.headliners.filter((h) => h.id !== 'countdown'); const holes = [];
  for (let f = 1; f <= 7; f++) if (!hw.some((h) => h.min <= f && f <= h.max)) holes.push(`F${f}`);
  (holes.length ? fail : pass)(C('spec.self.headlinerwindows', '§4.7', 'every festival F1–F7 has an eligible Headliner'), holes.length ? holes.join(', ') : '12 rows cover F1–F7');
  pass(C('spec.meta', '', 'DESIGN.md fingerprint'), `sha1 ${sha(designText)}, ${designText.length} bytes, ${S.doc.heads.length} headings`);
}

// ============================================================================
//  3. Loading the SIM in node
// ============================================================================
/** Loads sim.js in a fresh vm context with Math.random / Date.now trapped (counted), so the tool can
 *  prove the SIM never calls them. Returns {OOH, OohSim, ctx, traps, source, error}. */
function loadSim(file) {
  const out = { OOH: null, OohSim: null, ctx: null, traps: { random: 0, now: 0, armed: false }, source: '', error: null, from: file };
  try {
    out.source = fs.readFileSync(file, 'utf8');
    const sandbox = { module: { exports: {} }, console: { log() {}, warn() {}, error() {}, info() {} }, structuredClone, setTimeout, clearTimeout, performance, TextEncoder };
    const ctx = vm.createContext(sandbox);
    vm.runInContext(out.source + '\n;globalThis.__OohSim = typeof OohSim === "function" ? OohSim : null;', ctx, { filename: path.basename(file), timeout: 20000 });
    out.ctx = ctx; out.OOH = sandbox.module.exports && sandbox.module.exports.DATA ? sandbox.module.exports : vm.runInContext('typeof OOH !== "undefined" ? OOH : null', ctx);
    out.OohSim = sandbox.__OohSim;
    const traps = out.traps;
    ctx.__trap = (k) => { if (traps.armed) traps[k]++; };
    vm.runInContext('(() => { const r = Math.random, n = Date.now; Math.random = function () { __trap("random"); return r(); }; Date.now = function () { __trap("now"); return n(); }; })();', ctx);
    if (!out.OOH) throw new Error('sim.js did not export OOH (module.exports or a global const)');
  } catch (e) { out.error = e; }
  // A main-realm copy for timing only: code in a vm context runs measurably slower (cross-realm builtins).
  try { const req = createRequire(import.meta.url); delete req.cache[req.resolve(file)]; const m = req(file); if (m && typeof m.resolveShow === 'function') out.OOHmain = m; } catch { /* timing falls back to the vm copy */ }
  return out;
}
const armTraps = (L, on) => { if (L && L.traps) L.traps.armed = on; };

// ============================================================================
//  4. OOH.DATA vs the spec tables
// ============================================================================
/** Renders a §4.3 card-text template ({20}, {x0.6}, {%}, ${1}) at ★1 the way the card shows it. */
function renderTemplate(text, row) {
  if (typeof text !== 'string') return text;
  const rate = row && row.params ? (row.params.echo || row.params.refire || [])[0] : undefined;
  return text.replace(/\{x(\d*\.?\d+)\}/g, (_, v) => String(+(1 + +v).toFixed(4)))
    .replace(/\{%\}/g, rate !== undefined ? Math.round(rate * 100) + '%' : '{%}')
    .replace(/\{(\d*\.?\d+)\}/g, (_, v) => String(+v));
}
function fieldCmp(fails, warns, who, field, want, got, raw, mode = 'eq') {
  let ok;
  if (mode === 'text') ok = normText(want) === normText(got);
  else if (mode === 'textloose') ok = normText(got).toLowerCase().replace(/[^a-z0-9]/g, '') === normText(want).toLowerCase().replace(/[^a-z0-9]/g, '');
  else ok = deepEq(want, got);
  if (ok) return true;
  const msg = `${who}.${field}: spec ${short(want, 140)} ≠ DATA ${short(got, 140)}` + (raw ? `   ⟵ DESIGN.md:${raw}` : '');
  (mode === 'soft' || mode === 'textloose' ? warns : fails).push(msg);
  return false;
}
const rawRef = (r) => (r ? `${r._line} ${String(r._raw).slice(0, 110)}` : '');
const asList = (x) => (Array.isArray(x) ? x : isObj(x) ? Object.values(x) : []);
const byId = (x, idKey = 'id') => (Array.isArray(x) ? Object.fromEntries(x.map((r, i) => [r && r[idKey] != null ? r[idKey] : i, r])) : x || {});

function dataChecks(S, L) {
  const O = L.OOH; const D = O.DATA || {}; const C = (id, spec, title, owner = 'sim') => ({ id, spec, title, owner });

  check(C('data.api', '§11.4, CONTRACT', 'OOH exposes every §11.4 function, the CONTRACT helpers and DATA tables'), () => {
    const f = [];
    for (const k of ['createState', 'step', 'legalActions', 'rulesFor', 'resolveShow', 'previewChips', 'mood', 'matchPerm', 'favourite', 'shapley', 'clone', 'hashState']) if (typeof O[k] !== 'function') f.push(`§11.4 ${k}() missing`);
    const w = [];
    for (const k of ['target', 'fireOrder', 'seesPerTube', 'payoutPreview', 'nearMiss', 'lessonFor', 'milestoneProgress', 'fmt', 'describeShell', 'dailySeed', 'runBots']) if (typeof O[k] !== 'function') f.push(`CONTRACT helper ${k}() missing`);
    for (const k of ['TARGETS', 'SHELLS', 'FUSIONS', 'RIGS', 'HEADLINERS', 'TWISTS', 'KITS', 'RENOWN', 'MILESTONES', 'LESSONS', 'TOOLTIPS', 'COLOURS', 'FESTIVALS', 'GLOSSARY', 'RULES_CARD']) if (D[k] === undefined) f.push(`DATA.${k} missing`);
    if (!D.SHOW_NAMES) w.push('DATA.SHOW_NAMES (show names) not exposed');
    for (const b of ['random', 'donothing', 'greedy', 'greedyMood', 'novice', 'human', 'oracle', 'mono']) if (!O.bots || !O.bots[b]) f.push(`bots.${b} missing`);
    if (typeof L.OohSim !== 'function') f.push('global function OohSim (factory) missing');
    else if (/\bOOH\b|\bGAME\b|\bFX\b|\bwindow\b|\bdocument\b/.test(L.OohSim.toString().replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '""')))
      w.push('OohSim source mentions OOH/GAME/FX/window/document: may not be self-contained for the Blob Worker');
    return verdict(f, w, 'all present');
  });

  // §4.3 shells
  check(C('data.shells', '§4.3', '34 shell rows: name, mono, colour, rarity, cost, Hang, F, unlock, params, shots, tags, card text'), () => {
    const f = [], w = []; const SH = byId(D.SHELLS);
    const simIds = Array.isArray(D.SHELL_IDS) ? D.SHELL_IDS : Object.keys(SH);
    if (!deepEq(simIds, S.shells.map((s) => s.id))) w.push(`row order: spec ${S.shells.map((s) => s.id).join(',')} vs DATA ${simIds.join(',')}`);
    for (const extra of simIds.filter((id) => !S.shell(id))) f.push(`${extra}: in DATA but not in §4.3`);
    for (const s of S.shells) {
      const d = SH[s.id]; const ref = rawRef(s);
      if (!d) { f.push(`${s.id}: missing from DATA.SHELLS   ⟵ DESIGN.md:${ref}`); continue; }
      fieldCmp(f, w, s.id, 'name', s.name, d.name, ref);
      fieldCmp(f, w, s.id, 'mono', s.mono, d.mono, ref);
      fieldCmp(f, w, s.id, 'col', s.col, d.col, ref);
      fieldCmp(f, w, s.id, 'rarity', s.rarity, d.rar ?? d.rarity, ref);
      fieldCmp(f, w, s.id, 'cost', s.cost, d.cost, ref);
      fieldCmp(f, w, s.id, 'hang', s.hang, d.hang, ref);
      fieldCmp(f, w, s.id, 'fest', s.fest, d.fest, ref);
      fieldCmp(f, w, s.id, 'unlock', s.lock, d.lock ?? null, ref);
      fieldCmp(f, w, s.id, 'params', s.params, d.params ?? d.p, ref);
      fieldCmp(f, w, s.id, 'shots', s.shots, d.shots ?? 1, ref);
      fieldCmp(f, w, s.id, 'wildColour', s.wildColour, !!d.wildColour, ref);
      fieldCmp(f, w, s.id, 'tags', s.tags, Array.isArray(d.tags) ? d.tags : String(d.tags || '').split(/,\s*/), ref, 'soft');
      fieldCmp(f, w, s.id, 'card text (★1)', s.text, renderTemplate(d.text, d), ref, 'text');
      if (S.patternOf[s.id]) fieldCmp(f, w, s.id, 'pattern (§4.4 Used by)', S.patternOf[s.id], d.pattern, ref);
    }
    return verdict(f, w, `34 rows × 14 fields match`);
  });

  check(C('data.patterns', '§4.4', 'burst-pattern parameters (n, speed, gravity, drag, life, trail, twinkle, special)', 'sim'), () => {
    const f = [], w = []; const P = D.PATTERNS;
    if (!P) return { status: 'WARN', summary: 'DATA.PATTERNS not exposed (FX may hold them; checked in fx.js text instead)' };
    for (const p of S.patterns) {
      const d = P[p.id]; const ref = rawRef(p);
      if (!d) { f.push(`${p.id}: missing   ⟵ DESIGN.md:${ref}`); continue; }
      const nCell = p.n; let exp = {};
      if (nCell === '—') exp = { n: 0 };
      else if (/→/.test(nCell)) { const [a, b] = nCell.split('→').map(Number); exp = { n: a, nAfter: b }; }
      else if (/×/.test(nCell)) { const [a, b] = nCell.split('×').map(Number); exp = { count: a, n: b }; }
      else if (/\+/.test(nCell)) { const [a, b] = nCell.split('+').map(Number); exp = { n: a, nRing: b }; }
      else exp = { n: firstNum(nCell) };
      for (const k of ['speed', 'gravity', 'drag', 'life', 'trail', 'twinkle']) if (p[k] !== '—') exp[k] = Number(p[k]);
      for (const [k, v] of Object.entries(exp)) fieldCmp(f, w, p.id, k, v, d[k], ref);
      if (p.special && p.special !== '—') fieldCmp(f, w, p.id, 'special', p.special, d.special, ref, 'textloose');
    }
    const extra = Object.keys(P).filter((k) => !S.patterns.some((p) => p.id === k));
    if (extra.length) w.push(`patterns not in §4.4: ${extra.join(', ')}`);
    return verdict(f, w, `${S.patterns.length} patterns match`);
  });

  check(C('data.fusions', '§4.5', '12 directional fusions: A → B, name, bonus params, unlock, first festival'), () => {
    const f = [], w = []; const FU = D.FUSIONS || {};
    const keys = Array.isArray(D.FUSION_KEYS) ? D.FUSION_KEYS : Object.keys(FU);
    if (!deepEq(keys, S.fusions.map((x) => x.key))) w.push(`order: spec ${S.fusions.map((x) => x.key).join(',')} vs DATA ${keys.join(',')}`);
    for (const x of S.fusions) {
      const d = FU[x.key] || asList(FU).find((y) => y && y.a === x.a && y.b === x.b); const ref = rawRef(x);
      if (!d) { f.push(`${x.key}: missing   ⟵ DESIGN.md:${ref}`); continue; }
      fieldCmp(f, w, x.key, 'name', x.name, d.name, ref);
      fieldCmp(f, w, x.key, 'params', x.params, d.params ?? d.p, ref);
      fieldCmp(f, w, x.key, 'unlock', x.lock, d.lock ?? null, ref);
      if (x.fest != null) fieldCmp(f, w, x.key, 'first festival', x.fest, d.fest, ref);
      if (d.n != null) fieldCmp(f, w, x.key, '#', x.n, d.n, ref);
    }
    return verdict(f, w, '12 fusions match');
  });

  check(C('data.rigs', '§4.6', '5 rigs: name, cost, glyph, effect text, unlock'), () => {
    const f = [], w = []; const R = byId(D.RIGS);
    if (D.RIG_IDS && !deepEq(D.RIG_IDS, S.rigs.map((r) => r.id))) f.push(`table order (used by the rig roll, §5.6): spec ${S.rigs.map((r) => r.id)} vs DATA ${D.RIG_IDS}`);
    for (const r of S.rigs) {
      const d = R[r.id]; const ref = rawRef(r);
      if (!d) { f.push(`${r.id}: missing`); continue; }
      fieldCmp(f, w, r.id, 'name', r.name, d.name, ref);
      fieldCmp(f, w, r.id, 'cost', r.cost, d.cost, ref);
      fieldCmp(f, w, r.id, 'effect', r.effect, d.text ?? d.effect, ref, 'text');
      fieldCmp(f, w, r.id, 'glyph', r.glyph, d.glyphText ?? d.glyph, ref, 'textloose');
      fieldCmp(f, w, r.id, 'unlock', r.lock, d.lock ?? null, ref);
    }
    return verdict(f, w, '5 rigs match');
  });

  check(C('data.headliners', '§4.7', '12 Headliners + Countdown: name, window, rule, counters, telegraph (table order = draw order)'), () => {
    const f = [], w = []; const H = byId(D.HEADLINERS);
    const ids = D.HEADLINER_IDS || Object.keys(H);
    if (!deepEq(ids, S.headliners.map((h) => h.id))) f.push(`table order drives the draw (§11.3): spec ${S.headliners.map((h) => h.id)} vs DATA ${ids}`);
    for (const h of S.headliners) {
      const d = H[h.id]; const ref = rawRef(h);
      if (!d) { f.push(`${h.id}: missing`); continue; }
      fieldCmp(f, w, h.id, 'name', h.name, d.name, ref);
      fieldCmp(f, w, h.id, 'window min', h.min, d.min, ref);
      fieldCmp(f, w, h.id, 'window max', h.max, d.max, ref);
      fieldCmp(f, w, h.id, 'rule', h.rule, d.text ?? d.rule, ref, 'text');
      fieldCmp(f, w, h.id, 'counters', h.counters, d.counters, ref, 'textloose');
      fieldCmp(f, w, h.id, 'telegraph', h.telegraph, d.telegraph, ref, 'textloose');
    }
    return verdict(f, w, '13 rows match');
  });

  check(C('data.twists', '§4.10, §5.10', 'twist pools: Renown 2 Twilight pool and the Afterparty pool (order drives rng)'), () => {
    const f = [], w = []; const T = D.TWISTS || {};
    fieldCmp(f, w, 'TWISTS', 'twilight (Renown 2)', S.twilightPool, T.twilight, '§4.10 level 2');
    fieldCmp(f, w, 'TWISTS', 'afterparty', S.endlessPool, T.afterparty ?? T.endless, '§5.10');
    return verdict(f, w, `${S.twilightPool.join(',')} | ${S.endlessPool.length} Afterparty twists`);
  });

  check(C('data.kits', '§4.8', '5 kits: name, starting rack + colours, coins, Crowd, constraint text, unlock, rule flags'), () => {
    const f = [], w = []; const K = byId(D.KITS);
    for (const k of S.kits) {
      const d = K[k.id]; const ref = rawRef(k);
      if (!d) { f.push(`${k.id}: missing`); continue; }
      fieldCmp(f, w, k.id, 'name', k.name, d.name, ref);
      const rack = (d.rack || []).map((t) => (!t ? null : Array.isArray(t) ? { id: t[0], col: t[1] } : { id: t.id, col: t.col }));
      while (rack.length < 4) rack.push(null);
      fieldCmp(f, w, k.id, 'rack', k.rack, rack, ref);
      fieldCmp(f, w, k.id, 'coins', k.coins, d.coins, ref);
      fieldCmp(f, w, k.id, 'crowd', k.crowd, d.crowd ?? 0, ref);
      fieldCmp(f, w, k.id, 'unlock', k.lock, d.lock ?? null, ref);
      fieldCmp(f, w, k.id, 'constraint', k.constraint.replace(/\s*\(setColour\)/, ''), d.text ?? d.constraint, ref, 'textloose');
    }
    const flag = (id, key, want) => { const d = K[id]; if (d && !deepEq(d[key], want)) f.push(`${id}.${key}: spec implies ${want} (${S.kits.find((k) => k.id === id)?.constraint}) but DATA has ${short(d[key])}`); };
    flag('salvo', 'cards', 2); flag('chemist', 'noRigs', true); flag('market', 'interestCap', 2); flag('market', 'openShop', true); flag('showman', 'noSponsor', true);
    return verdict(f, w, '5 kits match');
  });

  check(C('data.sponsors', '§4.9', 'Sponsor kinds, flavour names, rewards'), () => {
    const f = [], w = []; const SP = D.SPONSORS;
    if (!SP) return { status: 'WARN', summary: 'DATA.SPONSORS not exposed (optional in CONTRACT)' };
    const kinds = D.SPONSOR_KINDS || Object.keys(SP);
    fieldCmp(f, w, 'SPONSOR_KINDS', 'order (rng index)', S.sponsors.map((s) => s.kind), kinds, '§5.6 step 6');
    for (const s of S.sponsors) {
      const d = SP[s.kind]; const ref = rawRef(s);
      if (!d) { f.push(`${s.kind}: missing`); continue; }
      fieldCmp(f, w, s.kind, 'flavour', s.flavour, d.flavour, ref);
      fieldCmp(f, w, s.kind, 'reward', s.reward, d.reward, ref, 'text');
    }
    return verdict(f, w, '3 Sponsors match');
  });

  check(C('data.renown', '§4.10', 'Renown ladder 1–8 text'), () => {
    const f = [], w = []; const R = asList(D.RENOWN);
    for (const r of S.renown) {
      const d = R.find((x) => x && (x.level === r.level)) || R[r.level]; const ref = rawRef(r);
      if (!d) { f.push(`level ${r.level}: missing`); continue; }
      const got = d.text ?? d.modifier ?? d;
      if (normText(got) === normText(r.modifier)) continue;
      if (normText(r.modifier).startsWith(normText(got))) w.push(`level ${r.level}: DATA text is a truncation of the spec: ${short(got, 120)}   ⟵ DESIGN.md:${ref}`);
      else f.push(`level ${r.level}.text: spec ${short(r.modifier, 140)} ≠ DATA ${short(got, 140)}   ⟵ DESIGN.md:${ref}`);
    }
    fieldCmp(f, w, 'COUNTDOWN_R8', 'target', 900000, D.COUNTDOWN_R8 ?? 900000, '§4.10 level 8');
    return verdict(f, w, '8 levels match');
  });

  check(C('data.milestones', '§4.11', '10 milestones: name, condition, goal, unlocks'), () => {
    const f = [], w = []; const M = byId(D.MILESTONES);
    const ids = D.MILESTONE_IDS || Object.keys(M);
    if (!deepEq(ids, S.milestones.map((m) => m.id))) w.push(`order: ${ids}`);
    for (const m of S.milestones) {
      const d = M[m.id]; const ref = rawRef(m);
      if (!d) { f.push(`${m.id}: missing`); continue; }
      fieldCmp(f, w, m.id, 'name', m.name, d.name, ref);
      fieldCmp(f, w, m.id, 'condition', m.conditionText, d.text ?? d.condition, ref, 'text');
      fieldCmp(f, w, m.id, 'goal', m.goal, d.goal, ref);
      const u = d.unlocks || {};
      fieldCmp(f, w, m.id, 'unlocks.shells', m.unlockShells, u.shells || [], ref);
      fieldCmp(f, w, m.id, 'unlocks.kits', m.unlockKits, u.kits || [], ref);
    }
    // Every locked row points at a milestone that unlocks it (and vice versa).
    for (const s of S.shells) if (s.lock) { const m = S.milestones.find((x) => x.id === s.lock); if (!m || !m.unlockShells.includes(s.id)) f.push(`spec: ${s.id} locked by ${s.lock} but §4.11 does not list it`); }
    return verdict(f, w, '10 milestones match');
  });

  check(C('data.lessons', '§4.12', '14 lessons (order = priority): predicate and text'), () => {
    const f = [], w = []; const Ls = asList(D.LESSONS);
    if (Ls.length !== S.lessons.length) f.push(`count: spec ${S.lessons.length} vs DATA ${Ls.length}`);
    S.lessons.forEach((l, i) => {
      const d = Ls[i]; const ref = rawRef(l);
      if (!d) return f.push(`#${l.n}: missing`);
      // {…} fields are filled by lessonFor(); a different placeholder name is a representation detail (WARN).
      const ph = (t) => normText(t).replace(/\{[^}]*\}/g, '{}');
      if (normText(l.text) !== normText(d.text)) { if (ph(l.text) === ph(d.text)) w.push(`#${l.n}.text: same text, different {placeholders}: spec ${short(l.text, 120)} vs DATA ${short(d.text, 120)}   ⟵ DESIGN.md:${ref}`); else fieldCmp(f, w, `#${l.n}`, 'text', l.text, d.text, ref, 'text'); }
      fieldCmp(f, w, `#${l.n}`, 'predicate', l.predicate, d.when ?? d.predicate, ref, 'textloose');
    });
    return verdict(f, w, '14 lessons match');
  });

  check(C('data.tooltips', '§4.13', '16 one-line tooltips: id, trigger, text'), () => {
    const f = [], w = []; const T = byId(D.TOOLTIPS);
    for (const t of S.tooltips) {
      const d = T[t.id]; const ref = rawRef(t);
      if (!d) { f.push(`${t.id}: missing`); continue; }
      fieldCmp(f, w, t.id, 'text', t.text, d.text, ref, 'text');
      fieldCmp(f, w, t.id, 'trigger', t.trigger, d.trigger, ref, 'textloose');
    }
    return verdict(f, w, '16 tooltips match');
  });

  check(C('data.colours', '§4.1', 'colour table: name, chemical, glyph, shape, role, default + high-contrast hex'), () => {
    const f = [], w = []; const CO = D.COLOURS || {};
    for (const c of S.colours) {
      const d = CO[c.id]; const ref = rawRef(c);
      if (!d) { f.push(`${c.id}: missing`); continue; }
      if (c.id !== 'fusion') fieldCmp(f, w, c.id, 'name', c.name, d.name, ref);
      if (c.chem) fieldCmp(f, w, c.id, 'chem', c.chem, d.chem, ref);
      fieldCmp(f, w, c.id, 'glyph', c.glyph, d.glyph, ref);
      fieldCmp(f, w, c.id, 'shape', c.shape, d.shape, ref, 'textloose');
      fieldCmp(f, w, c.id, 'role', c.role, d.role, ref, 'text');
      if (c.hex) fieldCmp(f, w, c.id, 'hex', c.hex, String(d.hex || '').toUpperCase(), ref);
      if (c.hc) fieldCmp(f, w, c.id, 'high-contrast hex', c.hc, String(d.hc || '').toUpperCase(), ref);
    }
    const x = CO.X; const want = ['R', 'A', 'G', 'B'].map((k) => S.colours.find((c) => c.id === k)?.hex);
    if (x && x.wedges && !deepEq(x.wedges.map((h) => h.toUpperCase()), want)) f.push(`X.wedges ${x.wedges} ≠ the 4 colour hexes ${want}`);
    return verdict(f, w, '7 colour rows match');
  });

  check(C('data.targets', '§5.1, §5.10', 'TARGETS (24), bases, multipliers, Afterparty targets, Countdown R8'), () => {
    const f = [], w = [];
    fieldCmp(f, w, 'TARGETS', '[0..23]', S.targets, D.TARGETS, `§5.1 table (line ${S.targetRows[0]?._line})`);
    if (D.BASES) fieldCmp(f, w, 'BASES', 'festival bases', S.bases, D.BASES, '§5.1');
    if (D.SHOW_MULTS) fieldCmp(f, w, 'SHOW_MULTS', 'show multipliers', S.showMult, D.SHOW_MULTS, '§5.1');
    if (D.AFTERPARTY_TARGETS) fieldCmp(f, w, 'AFTERPARTY_TARGETS', 'shows 25–36', S.afterpartyTargets, D.AFTERPARTY_TARGETS, '§5.10');
    else w.push('DATA.AFTERPARTY_TARGETS not exposed');
    if (Array.isArray(D.TARGETS)) D.TARGETS.forEach((t, i) => { if (!Number.isInteger(t)) f.push(`TARGETS[${i}] = ${t} is not an integer`); });
    return verdict(f, w, '24 + 12 targets match');
  });

  check(C('data.names', '§1, §5.1, Fiction', 'festival names (8) and show names (3)'), () => {
    const f = [], w = [];
    fieldCmp(f, w, 'FESTIVALS', '[0..7]', S.festivalsS1, (D.FESTIVALS || []).slice(0, 8), '§1 Festivals');
    if (D.FESTIVALS && D.FESTIVALS.length > 8) { const ap = D.FESTIVALS.slice(8, 12); if (!ap.every((n) => /Afterparty/.test(n))) w.push(`FESTIVALS[8..11] = ${ap}`); }
    fieldCmp(f, w, 'SHOW_NAMES', '', S.showNames, D.SHOW_NAMES, 'Fiction');
    return verdict(f, w, S.festivalsS1.join(', '));
  });

  check(C('data.glossary', '§1 Glossary', '19 glossary terms and meanings (help card, Logbook)'), () => {
    const f = [], w = []; const G = asList(D.GLOSSARY).map((g) => (Array.isArray(g) ? { term: g[0], meaning: g[1] } : { term: g.term, meaning: g.meaning ?? g.text }));
    if (G.length !== S.glossary.length) f.push(`count: spec ${S.glossary.length} vs DATA ${G.length}`);
    S.glossary.forEach((g, i) => {
      const d = G.find((x) => normText(x.term) === normText(g.term)) || G[i]; const ref = rawRef(g);
      if (!d) return f.push(`${g.term}: missing`);
      fieldCmp(f, w, g.term, 'term', g.term, d.term, ref, 'text');
      // "(§7.4)"-style cross-references cannot be followed on the help card; dropping or expanding them is a WARN.
      const bare = normText(g.meaning.replace(/\s*\(§[\d.]+\)/g, ''));
      if (normText(g.meaning) !== normText(d.meaning)) { if (bare !== normText(g.meaning) && normText(d.meaning) === bare) { /* cross-reference dropped: fine */ } else if (bare !== normText(g.meaning) && normText(d.meaning).startsWith(bare.replace(/\.$/, ''))) w.push(`${g.term}.meaning: spec ${short(g.meaning)} (a cross-reference) expanded in DATA to ${short(d.meaning, 120)}   ⟵ DESIGN.md:${ref}`); else fieldCmp(f, w, g.term, 'meaning', g.meaning, d.meaning, ref, 'text'); }
    });
    return verdict(f, w, '19 terms match');
  });

  check(C('data.rulescard', '§1 Rules card', '3-line rules card text'), () => {
    const f = [], w = [];
    S.rulesCard.forEach((l, i) => fieldCmp(f, w, 'RULES_CARD', `[${i}]`, strip(l), asList(D.RULES_CARD)[i], '§1', 'text'));
    return verdict(f, w, '3 lines match');
  });

  check(C('data.rarity', '§5.6', 'rarity weights by festival (C/U/R)'), () => {
    const f = [], w = [];
    if (!D.RARITY) return { status: 'WARN', summary: 'DATA.RARITY not exposed' };
    for (let fe = 1; fe <= 8; fe++) fieldCmp(f, w, 'RARITY', `F${fe}`, S.rarityWeights[fe], D.RARITY[fe - 1] ?? D.RARITY[fe], '§5.6');
    return verdict(f, w, '8 rows match');
  });
}

// ============================================================================
//  5. §11.8 goldens
// ============================================================================
const mkTubes = (shells, rigs) => shells.map((s, i) => ({ shell: s ? { uid: i + 1, id: s.id, col: s.col, star: s.star || 1, paid: 0 } : null, rig: (rigs && rigs[i]) || null }));
function runGolden(resolve, favourite, c) {
  const tubes = mkTubes(c.shells, c.rigs);
  let fav = c.fav;
  if (fav == null && c.rules.includes('rival')) fav = favourite ? favourite(tubes, c.crowd) : null;
  return resolve(tubes, { rules: c.rules, crowd: c.crowd, fav });
}
function goldenChecks(S, L) {
  const O = L.OOH;
  check({ id: 'golden.resolver', spec: '§11.8', title: '30 resolver goldens (every variant) through OOH.resolveShow', owner: 'sim' }, () => {
    need(typeof O.resolveShow === 'function', 'resolveShow missing');
    const f = [], w = []; let n = 0;
    for (const g of S.goldens) for (const c of g.cases) {
      n++;
      let r; try { r = runGolden(O.resolveShow, O.favourite, c); } catch (e) { f.push(`${c.label}: threw ${e.message}   ⟵ DESIGN.md:${g.line}`); continue; }
      const got = r && r.applause;
      if (got !== c.applause) f.push(`${c.label}: expected Applause ${c.applause.toLocaleString('en')}, got ${got} (ooh ${r && r.ooh}, aah ${r && r.aah}); rules ${c.rules.join('+') || 'none'}, crowd ${c.crowd}${c.fav != null ? ', fav ' + c.fav : ''}   ⟵ DESIGN.md:${g.line} ${g.raw.slice(0, 120)}`);
      else if (c.ooh != null && (r.ooh !== c.ooh || r.aah !== c.aah)) f.push(`${c.label}: Applause ok but Ooh × Aah = ${r.ooh} × ${r.aah}, spec ${c.ooh} × ${c.aah}`);
    }
    return verdict(f, w, `${n} cases match`);
  });
  check({ id: 'golden.match', spec: '§11.8, §3.3', title: 'Match property test and matchPerm definition', owner: 'sim' }, () => {
    need(S.matchTest && typeof O.matchPerm === 'function', 'matchPerm missing or test not parsed');
    const f = [], w = []; const M = S.matchTest; const rack = mkTubes(M.rack, null);
    const plain = O.resolveShow(rack, { rules: [], crowd: 0 }).applause;
    if (plain !== M.plain) f.push(`plain score ${plain} ≠ ${M.plain}`);
    const want = { crossed: [1, 3, 5, 0, 2, 4], windshift: [5, 4, 3, 2, 1, 0] };
    for (const rule of ['crossed', 'windshift']) {
      const perm = O.matchPerm(6, [rule]);
      if (!deepEq(Array.from(perm), want[rule])) f.push(`matchPerm(6, ['${rule}']) = ${JSON.stringify(perm)}, §3.3 gives ${JSON.stringify(want[rule])}`);
      const out = rack.map((t) => ({ shell: null, rig: t.rig })); want[rule].forEach((to, j) => { out[to].shell = rack[j].shell; });
      const order = out.map((t) => t.shell.id);
      if (!deepEq(order, M[rule].order)) f.push(`spec self-check: ${rule} order ${order} ≠ spec text ${M[rule].order}`);
      const sc = O.resolveShow(out, { rules: [rule], crowd: 0 }).applause;
      if (sc !== M[rule].score) f.push(`match then ${rule} = ${sc}, spec ${M[rule].score}`);
    }
    const id = O.matchPerm(5, []); if (!deepEq(Array.from(id), [0, 1, 2, 3, 4])) f.push(`matchPerm(5, []) = ${JSON.stringify(id)} (expected identity)`);
    return verdict(f, w, `plain ${plain}; crossed and windshift re-seat to plain order`);
  });
}

// ============================================================================
//  6. §11.8 seed-level traces with Script B (independent implementation from the spec text)
// ============================================================================
function scriptB(O, S, spec) {
  if (!S.shop) return [];
  const f = Math.floor(S.show / 3) + 1; const T = (i) => ({ zone: 'tube', i }); const log = [];
  const cost = (id) => spec.shell(id).cost;
  const upCost = (id, star) => (star === 1 ? Math.ceil(1.5 * cost(id)) : 2 * cost(id));
  const tubeCost = () => (S.tubes.length === 4 ? spec.prices.tube5 : spec.prices.tube6) + (S.renown >= 4 ? spec.prices.tubeRenown4 : 0);
  const act = (a) => { const ev = O.step(S, a); log.push(a); if (ev.length === 1 && ev[0].type === 'illegal') throw new Error(`Script B action ${JSON.stringify(a)} was illegal: ${ev[0].reason}`); };
  for (let g = 0; g < 60; g++) {
    const twin = (c) => S.tubes.findIndex((t) => t.shell && t.shell.id === c.id && t.shell.star < 3);
    const ci = S.shop.cards.findIndex((c) => !c.sold && twin(c) >= 0 && upCost(c.id, S.tubes[twin(c)].shell.star) <= S.coins);
    if (ci >= 0) { act({ type: 'upgrade', card: ci, to: T(twin(S.shop.cards[ci])) }); continue; }
    const e = S.tubes.findIndex((t) => !t.shell); const c2 = S.shop.cards.findIndex((c) => !c.sold && c.cost <= S.coins);
    if (e >= 0 && c2 >= 0) { act({ type: 'buy', card: c2, to: T(e) }); continue; }
    if (e < 0 && f >= 2 && S.tubes.length < spec.prices.maxTubes && S.coins >= tubeCost() + 3) { act({ type: 'buyTube' }); continue; }
    break;
  }
  return log;
}
const rackStr = (S) => S.tubes.map((t) => (t.shell ? t.shell.id + (t.shell.star > 1 ? '*' + t.shell.star : '') + ':' + t.shell.col : '-')).join(' ');
function traceRun(O, spec, tr) {
  const S = O.createState(tr.seed, Object.assign({}, tr.opts, { unlocked: [] }));
  const heads = (S.headliners || []).slice(); const tw = S.twilightTwists ? S.twilightTwists.slice() : null;
  const lines = [];
  for (let guard = 0; S.phase === 'build' && guard < 40; guard++) {
    const s = S.show;
    const shop = S.shop ? S.shop.cards.map((c) => c.id + ':' + c.col).join(' ') + (S.shop.rig ? ' +rig ' + S.shop.rig.id : '') : '-';
    const sp = S.sponsor ? S.sponsor.kind : '-';
    scriptB(O, S, spec);
    const rk = rackStr(S);
    O.step(S, { type: 'light' });
    const h = S.runStats && S.runStats.history ? S.runStats.history[S.runStats.history.length - 1] : null;
    const res = h ? `${Number(h.applause).toLocaleString('en').replace(/,/g, '')}/${h.target} ${h.pass ? 'pass' : 'MISS'}` : '?';
    lines.push(`s${s + 1} | ${shop || '-'} | ${sp} | ${rk} | ${h && h.rules && h.rules.length ? h.rules.join('+') : '-'} | ${res} | $${S.coins} crowd ${S.crowd}`);
  }
  return { S, heads, tw, lines };
}
function traceChecks(spec, L) {
  const O = L.OOH;
  for (const tr of spec.traces) {
    check({ id: `trace.${tr.seed}`, spec: '§11.8', title: `${tr.seed} ${JSON.stringify(tr.opts)}: Headliners, twists, every show line, final rng`, owner: 'sim' }, () => {
      const f = [], w = [];
      const { S, heads, tw, lines } = traceRun(O, spec, tr);
      if (heads.join(',') !== tr.headliners.join(',')) f.push(`headliners: got ${heads.join(',')}, spec ${tr.headliners.join(',')}`);
      if (tr.twilight) { const g = (tw || []).map((x) => x || '-').join(','); if (g !== tr.twilight.map((x) => x || '-').join(',')) f.push(`twilight twists: got ${g}, spec ${tr.twilight.map((x) => x || '-').join(',')}`); }
      if (lines.length !== tr.shows.length) f.push(`run length: ${lines.length} shows lit, spec ${tr.shows.length} (phase ${S.phase})`);
      tr.shows.forEach((want, i) => {
        const got = lines[i]; if (got === want.raw.replace(/\s+/g, ' ')) return;
        if (!got) return f.push(`s${want.show}: not reached`);
        const gp = got.split(' | '), wp = want.raw.split('|').map((x) => x.trim());
        const names = ['show', 'shop', 'sponsor', 'rack as lit', 'rules', 'Applause/target', 'coins/crowd after payout'];
        const diffs = names.map((n, k) => (gp[k] !== wp[k] ? `${n}: got "${gp[k]}" want "${wp[k]}"` : null)).filter(Boolean);
        f.push(`s${want.show}: ${diffs.join('; ')}`);
      });
      if (tr.rng && !deepEq(Array.from(S.rng || []), tr.rng)) f.push(`rng after run: got ${Array.from(S.rng || []).join(',')}, spec ${tr.rng.join(',')}`);
      return verdict(f, w, `${lines.length} lines + rng match`);
    });
  }
}

// ============================================================================
//  7. SIM behaviour through the API
// ============================================================================
const walkNums = (o, fn, p = '') => { if (typeof o === 'number') return fn(o, p); if (o && typeof o === 'object') for (const k of Object.keys(o)) walkNums(o[k], fn, p + '.' + k); };
function lcg(seed) { let x = (seed * 2654435761) >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
function playTo(O, S, show, maxSteps = 60) { for (let i = 0; i < maxSteps && S.phase === 'build' && S.show < show; i++) O.step(S, { type: 'light' }); return S; }

function simChecks(spec, L) {
  const O = L.OOH; const D = O.DATA || {}; const C = (id, sp, title, owner = 'sim') => ({ id, spec: sp, title, owner });
  const fresh = (seed, opts) => O.createState(seed, Object.assign({ unlocked: [] }, opts || {}));

  gated(C('sim.createState', '§11.4', 'createState: every State field of the §11.4 table with the right type'), () => {
    const S = fresh('audit-state', {}); const f = [], w = [];
    const want = { v: (x) => x === 1, seed: (x) => x === 'audit-state', rng: (x) => Array.isArray(x) && x.length === 4 && x.every((n) => Number.isInteger(n) && n >= 0 && n < 2 ** 32), kit: (x) => x === 'apprentice', renown: (x) => x === 0, fairWeather: (x) => x === false, firstRun: (x) => typeof x === 'boolean', daily: (x) => typeof x === 'boolean', unlocked: Array.isArray,
      show: (x) => x === 0, phase: (x) => x === 'build', endless: (x) => x === false || x === 0 || x === null, coins: (x) => x === 4, crowd: (x) => x === 0, rain: (x) => x === 1 || x === 0, relight: (x) => x === 0 || x === 1,
      tubes: (x) => Array.isArray(x) && x.length === 4, crate: (x) => Array.isArray(x) && x.length === 2 && x.every((c) => c === null), nextUid: Number.isInteger, shop: (x) => x === null || isObj(x), sponsor: (x) => x === null,
      headliners: (x) => Array.isArray(x) && x.length === 8 && x[7] === 'countdown', twilightTwists: (x) => Array.isArray(x) && x.length === 8 && x[0] == null, endlessTwists: (x) => isObj(x) || x === null,
      dry: Number.isInteger, rareNext: (x) => x === false, lastOrder: (x) => x === null || Array.isArray(x), runStats: isObj };
    for (const [k, ok] of Object.entries(want)) if (!(k in S)) f.push(`field ${k} missing`); else if (!ok(S[k])) f.push(`field ${k} = ${short(S[k])} (unexpected type/value for a fresh Apprentice run)`);
    const t = S.tubes[0]; if (!t || !t.shell || !['uid', 'id', 'col', 'star', 'paid'].every((k) => k in t.shell) || !('rig' in t)) f.push(`tube shape: ${short(t)} (want {shell:{uid,id,col,star,paid}, rig})`);
    const rs = S.runStats || {}; for (const k of ['history', 'timesFired']) if (!(k in rs)) f.push(`runStats.${k} missing`);
    for (const k of ['buildStart', 'lastLostPreLight']) if (!(k in rs)) w.push(`runStats.${k} missing (§11.4)`);
    try { JSON.parse(JSON.stringify(S)); } catch (e) { f.push('state is not plain JSON'); }
    return verdict(f, w, `${Object.keys(want).length} fields ok`);
  });

  gated(C('sim.rng', '§11.3', 'RNG seeding and createState call order (7 Headliner calls; +7 at Renown 2)'), () => {
    const f = [];
    for (const [opts, calls] of [[{}, 7], [{ renown: 2 }, 14], [{ renown: 1 }, 7]]) {
      const S = fresh('rng-audit', opts); const ref = refRng('rng-audit'); for (let i = 0; i < calls; i++) rngNext(ref);
      if (!deepEq(Array.from(S.rng), ref.rng)) f.push(`${JSON.stringify(opts)}: state.rng ${Array.from(S.rng)} ≠ reference after ${calls} calls ${ref.rng}`);
    }
    // Headliner draw from the reference RNG: f = 1..7, eligible = rows whose window holds f, not already drawn, table order.
    const S = fresh('draw-audit', {}); const ref = refRng('draw-audit'); const drawn = [];
    for (let fe = 1; fe <= 7; fe++) { const el = spec.headliners.filter((h) => h.id !== 'countdown' && h.min <= fe && fe <= h.max && !drawn.includes(h.id)); drawn.push(el[Math.floor(rngNext(ref) * el.length)].id); }
    drawn.push('countdown');
    if (!deepEq(S.headliners, drawn)) f.push(`headliners ${S.headliners} ≠ reference draw ${drawn} (eligible = window ∋ f, not yet drawn, table order)`);
    return verdict(f, [], 'seeding + draw order reproduce the §11.3 reference');
  });

  gated(C('sim.determinism', '§11.3, §11.7', 'no Math.random / Date.now in the SIM; same seed + actions → same hash; clone/hashState'), () => {
    const f = [], w = []; const rnd = lcg(7);
    const play = () => { const S = fresh('det-audit', {}); const log = []; for (let i = 0; i < 400 && S.phase === 'build'; i++) { const la = O.legalActions(S); const a = la[Math.floor(rnd() * la.length)]; log.push(a); O.step(S, a); } return { S, log }; };
    armTraps(L, true); const a = play(); armTraps(L, false);
    if (L.traps.random) f.push(`Math.random called ${L.traps.random}× during createState/step/legalActions`);
    if (L.traps.now) f.push(`Date.now called ${L.traps.now}× during createState/step/legalActions`);
    const S2 = fresh('det-audit', {}); for (const x of a.log) O.step(S2, x);
    const h1 = O.hashState(a.S), h2 = O.hashState(S2);
    if (h1 !== h2) f.push(`replaying the same ${a.log.length} actions gives a different hash (${h1} vs ${h2})`);
    if (!/^[0-9a-f]+$/i.test(String(h1))) f.push(`hashState returns ${short(h1)}, not hex`);
    const cl = O.clone(a.S); if (!deepEq(cl, a.S) || cl === a.S || cl.tubes === a.S.tubes) f.push('clone is not a deep, equal copy');
    const rev = (o) => (Array.isArray(o) ? o.map(rev) : isObj(o) ? Object.fromEntries(Object.keys(o).reverse().map((k) => [k, rev(o[k])])) : o); const reordered = rev(JSON.parse(JSON.stringify(a.S))); if (O.hashState(reordered) !== h1) w.push('hashState depends on key order (spec: canonical JSON, keys sorted)');
    return verdict(f, w, `${a.log.length} random actions replayed; hash ${h1}`);
  });

  gated(C('sim.illegal', '§11.4, §2.5', 'illegal actions return [{type:"illegal", reason}] and leave the state unchanged'), () => {
    const f = []; const S = fresh('illegal-audit', {}); const h = O.hashState(S);
    const bad = [{ type: 'buy', card: 9, to: { zone: 'tube', i: 3 } }, { type: 'buyTube' }, { type: 'sell', from: { zone: 'crate', i: 0 } }, { type: 'match' }, { type: 'restore' }, { type: 'endless' }, { type: 'nonsense' }, { type: 'move', from: { zone: 'tube', i: 0 }, to: { zone: 'tube', i: 0 } }, { type: 'sponsor', accept: true }, { type: 'setColour', card: 0, col: 'R' }];
    for (const a of bad) {
      const ev = O.step(S, a);
      if (!(Array.isArray(ev) && ev.length === 1 && ev[0].type === 'illegal' && ev[0].reason)) f.push(`${JSON.stringify(a)} → ${short(ev)}`);
      if (O.hashState(S) !== h) { f.push(`${JSON.stringify(a)} changed the state`); break; }
    }
    return verdict(f, [], `${bad.length} illegal actions rejected`);
  });

  gated(C('sim.legalActions', '§2.5', 'legalActions order (light, sponsor, buy, upgrade, buyRig, buyTube, move, sell, reroll, match, restore, setColour) and legality'), () => {
    const f = []; const order = ['light', 'sponsor', 'buy', 'upgrade', 'buyRig', 'buyTube', 'move', 'sell', 'reroll', 'match', 'restore', 'setColour'];
    const rnd = lcg(3); let checked = 0;
    for (const seed of ['la-1', 'la-2', 'la-3']) {
      const S = fresh(seed, { kit: seed === 'la-3' ? 'chemist' : 'apprentice' });
      for (let i = 0; i < 300 && S.phase === 'build'; i++) {
        const la = O.legalActions(S); checked++;
        if (!la.length) { f.push(`${seed} show ${S.show + 1}: legalActions empty in build`); break; }
        if (la[0].type !== 'light') f.push(`${seed}: first action is ${la[0].type}, not light`);
        const idx = la.map((a) => order.indexOf(a.type));
        if (idx.some((v) => v < 0)) f.push(`${seed}: unknown action type(s) ${la.filter((a) => !order.includes(a.type)).map((a) => a.type)}`);
        for (let k = 1; k < idx.length; k++) if (idx[k] < idx[k - 1]) { f.push(`${seed} show ${S.show + 1}: ${la[k - 1].type} listed before ${la[k].type}`); break; }
        const a = la[Math.floor(rnd() * la.length)]; const ev = O.step(S, a);
        if (ev.length === 1 && ev[0].type === 'illegal') f.push(`${seed}: legalActions offered ${JSON.stringify(a)} but step rejected it (${ev[0].reason})`);
        if (f.length > 12) break;
      }
    }
    return verdict([...new Set(f)], [], `${checked} states checked`);
  });

  gated(C('sim.rulesFor', '§2, §4.7, §4.10', 'rulesFor: Headliner on k=2 shows, Countdown at show 24 (countdown3 at Renown 8), Renown 2 Twilight twists'), () => {
    const f = [];
    for (const [opts, lbl] of [[{}, 'R0'], [{ renown: 2 }, 'R2'], [{ renown: 8 }, 'R8']]) {
      const S = fresh('rules-audit', opts);
      for (let s = 0; s < 24; s++) {
        const fe = Math.floor(s / 3) + 1, k = s % 3; const got = Array.from(O.rulesFor(S, s) || []);
        let want = [];
        if (k === 2) want = [s === 23 ? (opts.renown >= 8 ? 'countdown3' : 'countdown') : S.headliners[fe - 1]];
        if (s === 23 && opts.renown >= 7 && opts.renown < 8) want = ['countdown', 'rival'];
        if (s === 23 && opts.renown >= 8) want = ['countdown3', 'rival'];
        if (k === 0 && opts.renown >= 2 && fe >= 2) want = [S.twilightTwists[fe - 1]];
        if (!deepEq(got.slice().sort(), want.slice().sort())) f.push(`${lbl} show ${s + 1}: rulesFor = ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
      }
    }
    return verdict(f, [], '72 show/renown combinations');
  });

  gated(C('sim.target', '§5.1', 'target(): Renown 1 Headliners ×1.25, Renown 8 Countdown 900,000, Fair Weather ×0.75, Sponsor ×1.5 (rounded, in order)'), () => {
    need(typeof O.target === 'function', 'OOH.target missing');
    const f = [];
    const cases = [[{}, (b, s) => b], [{ renown: 1 }, (b, s) => (s % 3 === 2 && s !== 23 ? Math.round(b * 1.25) : b)], [{ renown: 8 }, (b, s) => (s === 23 ? 900000 : s % 3 === 2 ? Math.round(b * 1.25) : b)], [{ fairWeather: true }, (b) => Math.round(b * 0.75)], [{ renown: 1, fairWeather: true }, (b, s) => Math.round((s % 3 === 2 && s !== 23 ? Math.round(b * 1.25) : b) * 0.75)]];
    for (const [opts, fn] of cases) { const S = fresh('target-audit', opts); for (let s = 0; s < 24; s++) { const want = fn(spec.targets[s], s); const got = O.target(S, s); if (got !== want) f.push(`${JSON.stringify(opts)} show ${s + 1}: target ${got}, expected ${want}`); } }
    // Sponsor: find a sponsored show via random play.
    const S = fresh('sponsor-audit', {}); for (let i = 0; i < 40 && S.phase === 'build' && !S.sponsor; i++) { S.coins = 0; O.step(S, { type: 'light' }); }
    if (S.sponsor) { const base = O.target(S, S.show); O.step(S, { type: 'sponsor', accept: true }); const t = O.target(S, S.show); if (t !== Math.round(base * 1.5)) f.push(`accepted Sponsor at show ${S.show + 1}: target ${t}, expected round(${base} × 1.5) = ${Math.round(base * 1.5)}`); }
    return verdict(f, [], '5 option sets × 24 shows + Sponsor');
  });

  gated(C('sim.fmt', '§8.5', 'fmt(): 8,100 · 12K · 1.2M · 3.4B · 1.23e12'), () => {
    need(typeof O.fmt === 'function', 'OOH.fmt missing');
    const f = []; const cases = [[0, '0'], [150, '150'], [8100, '8,100'], [9999, '9,999'], [12000, '12K'], [12735, '13K'], [1.2e6, '1.2M'], [3.4e9, '3.4B'], [1.23e12, '1.23e12']];
    const alt = { 12735: ['12.7K', '12K'] };
    for (const [n, want] of cases) { const got = O.fmt(n); if (got !== want && !(alt[n] || []).includes(got)) f.push(`fmt(${n}) = ${short(got)}, expected ${short(want)}`); }
    return verdict(f, [], 'spec examples match');
  });

  gated(C('sim.dailySeed', '§7.4', 'dailySeed(date) = "daily-YYYY-MM-DD"'), () => {
    need(typeof O.dailySeed === 'function', 'OOH.dailySeed missing');
    const got = O.dailySeed('2026-09-29');
    return got === 'daily-2026-09-29' ? { status: 'PASS', summary: got } : { status: 'FAIL', summary: `dailySeed("2026-09-29") = ${short(got)}` };
  });

  gated(C('sim.kits', '§4.8', 'kits at createState: rack, coins, Crowd; each starting rack passes show 1 in its best arrangement (150/270/220/192)'), () => {
    const f = []; const best = { apprentice: 150, salvo: 270, chemist: 220, showman: 192 };
    const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
    for (const k of spec.kits) {
      const S = fresh('kit-audit', { kit: k.id });
      if (S.kit !== k.id) { f.push(`createState({kit:'${k.id}'}) gave kit ${S.kit}`); continue; }
      const rack = S.tubes.map((t) => (t.shell ? { id: t.shell.id, col: t.shell.col } : null));
      if (!deepEq(rack, k.rack)) f.push(`${k.id}: rack ${JSON.stringify(rack)} ≠ spec ${JSON.stringify(k.rack)}`);
      if (S.tubes.some((t) => t.shell && (t.shell.star !== 1))) f.push(`${k.id}: starting shells not ★1`);
      if (S.coins !== k.coins) f.push(`${k.id}: coins ${S.coins}, spec ${k.coins}`);
      if (S.crowd !== k.crowd) f.push(`${k.id}: crowd ${S.crowd}, spec ${k.crowd}`);
      if (best[k.id]) {
        const sh = S.tubes.map((t) => t.shell); let top = 0;
        for (const p of perms(sh)) top = Math.max(top, O.resolveShow(p.map((s) => ({ shell: s, rig: null })), { rules: [], crowd: S.crowd }).applause);
        if (top !== best[k.id]) f.push(`${k.id}: best show-1 arrangement scores ${top}, spec ${best[k.id]}`);
      }
      if (k.id === 'market' && !(S.shop && S.shop.cards && S.shop.cards.length)) f.push('market: no shop before show 1');
      if (k.id !== 'market' && S.shop && S.shop.cards && S.shop.cards.length) f.push(`${k.id}: a shop exists before show 1`);
    }
    // Salvo: 2 shell cards; Chemist: no rig card; Showman: no Sponsor.
    const S = fresh('kit-salvo', { kit: 'salvo' }); playTo(O, S, 1); if (S.shop && S.shop.cards.filter((c) => c.tag !== 'collector').length !== 2) f.push(`salvo: shop has ${S.shop.cards.length} cards (spec: 2)`);
    for (let seed = 1; seed <= 3; seed++) {
      const C2 = fresh('kit-chem-' + seed, { kit: 'chemist' }); for (let i = 0; i < 12 && C2.phase === 'build'; i++) { C2.coins = 0; O.step(C2, { type: 'light' }); if (C2.shop && C2.shop.rig) { f.push(`chemist: rig card offered at show ${C2.show + 1}`); break; } }
      const W = fresh('kit-show-' + seed, { kit: 'showman' }); for (let i = 0; i < 12 && W.phase === 'build'; i++) { O.step(W, { type: 'light' }); if (W.sponsor) { f.push(`showman: Sponsor offered at show ${W.show + 1}`); break; } }
    }
    return verdict(f, [], '5 kits');
  });

  gated(C('sim.keepsake', '§7.3', 'keepsake starts the next run in Crate slot 1 at ★1 with its colour'), () => {
    const S = fresh('keep-audit', { keepsake: { id: 'palm', col: 'R' } }); const c = S.crate && S.crate[0];
    return c && c.id === 'palm' && c.col === 'R' && c.star === 1 ? { status: 'PASS', summary: 'crate[0] = palm:R ★1' } : { status: 'FAIL', summary: `crate[0] = ${short(c)}` };
  });

  gated(C('sim.firstRun', '§4.7, §5.6, §6', 'first-ever run: Headwind at F1; show-2 shop = Crossette (Green) $5, Palm (Red) $3, Comet (Green) $3; F2 override'), () => {
    const f = []; const S = O.createState('first-show', { firstRun: true, unlocked: [] });
    if (S.headliners[0] !== 'headwind') f.push(`headliners[0] = ${S.headliners[0]} (spec: always Headwind in the first-ever run)`);
    O.step(S, { type: 'light' });
    const cards = S.shop ? S.shop.cards.map((c) => `${c.id}:${c.col}:$${c.cost}`) : [];
    if (!deepEq(cards, ['crossette:G:$5', 'palm:R:$3', 'comet:G:$3'])) f.push(`shop before show 2: ${cards.join(' ')} (spec crossette:G:$5 palm:R:$3 comet:G:$3)`);
    // Show 2 → buy Comet; the first F2 shop (before show 4) then offers Salute as card 1.
    const ci = S.shop ? S.shop.cards.findIndex((c) => c.id === 'comet') : -1;
    if (ci >= 0) { O.step(S, { type: 'buy', card: ci, to: { zone: 'tube', i: 3 } }); playTo(O, S, 3); if (S.phase === 'build' && S.show === 3) { const c1 = S.shop && S.shop.cards[0]; if (!c1 || c1.id !== 'salute') f.push(`first F2 shop, owning a Comet: card 1 = ${c1 && c1.id} (spec Salute)`); } }
    const P = O.createState('first-show', { firstRun: true, unlocked: [] }); O.step(P, { type: 'light' }); playTo(O, P, 3);
    if (P.phase === 'build' && P.show === 3) { const ids = P.shop.cards.map((c) => c.id); if (ids[0] !== 'salute' || ids[1] !== 'comet' || P.shop.cards[1].col !== 'G') f.push(`first F2 shop owning neither Comet nor Palm: ${P.shop.cards.map((c) => c.id + ':' + c.col)} (spec card 1 Salute, card 2 Comet Green)`); }
    return verdict(f, [], 'curated shops match');
  });

  gated(C('sim.mood', '§3.3, §6', 'mood buckets (0.85 / 1.25) and the §6 show-3 Headwind examples (276 Eager, 162 Hopeful, 126 Restless, 132 Hopeful)'), () => {
    need(typeof O.mood === 'function', 'mood missing');
    const f = []; const S = O.createState('first-show', { firstRun: true, unlocked: [] }); S.show = 2;
    const rk = (list) => { S.tubes = list.map((x, i) => ({ shell: x ? { uid: 100 + i, id: x[0], col: x[1], star: 1, paid: 3 } : null, rig: null })); };
    // Crowd at show 3: 4 after the show-2 Encore (Palm build 378, Comet opener 273); 2 when the naive T4
    // rack scored 183 / 189 at show 2 (a pass without an Encore). The swaps give 216 / 264 (§6).
    const specWarn = [];
    const cases = [
      [[['willow', 'A'], ['peony', 'R'], ['palm', 'R'], ['strobe', 'W']], 'eager', 276, 4],
      [[['comet', 'G'], ['willow', 'A'], ['peony', 'R'], ['strobe', 'W']], 'hopeful', 162, 4],
      [[['willow', 'A'], ['peony', 'R'], ['strobe', 'W'], ['comet', 'G']], 'restless', 126, 2],
      [[['willow', 'A'], ['peony', 'R'], ['strobe', 'W'], ['palm', 'R']], 'hopeful', 132, 2],   // §6: ratio 0.88, Hopeful
    ];
    for (const [r, want, score, crowd] of cases) {
      S.crowd = crowd; rk(r); const rules = O.rulesFor(S, 2); const a = O.resolveShow(S.tubes, { rules, crowd: S.crowd }).applause; const m = O.mood(S);
      if (a !== score) f.push(`${r.map((x) => x[0]).join(',')} under ${rules}: ${a}, §6 says ${score}`);
      const T0 = O.target(S, 2); const bucket = a / T0 < 0.85 ? 'restless' : a / T0 < 1.25 ? 'hopeful' : 'eager';
      if (m !== bucket) f.push(`${r.map((x) => x[0]).join(',')}: mood ${m}, §3.3 bucket for ${a}/${T0} = ${(a / T0).toFixed(3)} is ${bucket}`);
      if (bucket !== want) specWarn.push(`§6 calls the ${r.map((x) => x[0]).join(',')} rack (${score} vs target ${T0}, ratio ${(score / T0).toFixed(3)}) ${want}, but §3.3's thresholds (0.85 / 1.25) make it ${bucket}`);
    }
    if (specWarn.length) warn({ id: 'spec.self.mood6', spec: '§6 vs §3.3', title: '§6 mood examples agree with the §3.3 bucket thresholds', owner: 'spec' }, `${specWarn.length} example(s) contradict §3.3`, specWarn);
    return verdict(f, [], '4 examples: scores match §6, moods follow §3.3');
  });

  gated(C('sim.favourite', '§3.3', 'favourite(): largest drop, ties leftmost, empty rack → null'), () => {
    const f = [];
    for (const g of spec.goldens.slice(0, 12)) { const c = g.cases[0]; const tubes = mkTubes(c.shells, c.rigs); const base = O.resolveShow(tubes, { rules: [], crowd: c.crowd }).applause; let best = -Infinity, bi = null; tubes.forEach((t, i) => { if (!t.shell) return; const tt = tubes.map((x, j) => (j === i ? { shell: null, rig: x.rig } : x)); const d = base - O.resolveShow(tt, { rules: [], crowd: c.crowd }).applause; if (d > best) { best = d; bi = i; } }); const got = O.favourite(tubes, c.crowd); if (got !== bi) f.push(`${c.label}: favourite = ${got}, brute force ${bi}`); }
    if (O.favourite(mkTubes([null, null, null, null], null), 0) !== null) f.push('empty rack does not give null');
    return verdict(f, [], '12 racks');
  });

  gated(C('sim.prices', '§5.3, §4.10', 'prices through step(): tubes $6/$10 (+$4 at Renown 4), reroll $1 +$1 (Renown 3 from $2), sell floor(0.75·paid), upgrade ceil(1.5c)/2c, Renown 5 cards +$1'), () => {
    const f = [];
    const setup = (renown) => { const S = fresh('price-audit', { renown }); for (let i = 0; i < 12 && S.phase === 'build' && S.show < 3; i++) O.step(S, { type: 'light' }); return S; };
    for (const renown of [0, 3, 4, 5]) {
      const S = setup(renown); if (S.phase !== 'build' || S.show < 3 || !S.shop) { f.push(`Renown ${renown}: could not reach an F2 build (phase ${S.phase}, show ${S.show + 1})`); continue; }
      S.coins = 500;
      const evT = (evs, t, what) => { if (!evs.some((e) => e.type === t)) f.push(`${what} emitted ${evs.map((e) => e.type).join(',') || 'nothing'} (§9: ${t})`); };
      let c0 = S.coins; evT(O.step(S, { type: 'buyTube' }), 'tubeAdded', 'buyTube'); const t5 = c0 - S.coins; c0 = S.coins; O.step(S, { type: 'buyTube' }); const t6 = c0 - S.coins;
      const e = renown >= 4 ? spec.prices.tubeRenown4 : 0; if (t5 !== spec.prices.tube5 + e || t6 !== spec.prices.tube6 + e) f.push(`Renown ${renown}: tubes cost $${t5}/$${t6}, spec $${spec.prices.tube5 + e}/$${spec.prices.tube6 + e}`);
      if (S.tubes.length !== 6) f.push(`Renown ${renown}: ${S.tubes.length} tubes after two buyTube`);
      const ev = O.step(S, { type: 'buyTube' }); if (!(ev.length === 1 && ev[0].type === 'illegal')) f.push('a 7th tube was allowed');
      for (const c of S.shop.cards) { const want = spec.shell(c.id).cost + (renown >= 5 ? spec.prices.cardRenown5 : 0); if (c.cost !== want) f.push(`Renown ${renown}: card ${c.id} costs $${c.cost}, spec $${want}`); }
      const card = S.shop.cards.findIndex((c) => !c.sold); const empty = S.tubes.findIndex((t) => !t.shell);
      if (card >= 0 && empty >= 0) {
        const cd = S.shop.cards[card]; c0 = S.coins; evT(O.step(S, { type: 'buy', card, to: { zone: 'tube', i: empty } }), 'bought', 'buy'); if (c0 - S.coins !== cd.cost) f.push(`buy cost ${c0 - S.coins} ≠ card cost ${cd.cost}`);
        const sh = S.tubes[empty].shell; if (!sh || sh.paid !== cd.cost || sh.star !== 1) f.push(`bought shell ${short(sh)} (want ★1, paid ${cd.cost})`);
        const r0 = S.coins; evT(O.step(S, { type: 'reroll' }), 'rerolled', 'reroll'); const r1 = r0 - S.coins; const q0 = S.coins; O.step(S, { type: 'reroll' }); const r2 = q0 - S.coins;
        const rb = renown >= 3 ? spec.prices.rerollRenown3 : spec.prices.rerollBase; if (r1 !== rb || r2 !== rb + spec.prices.rerollStep) f.push(`Renown ${renown}: rerolls cost $${r1}, $${r2}; spec $${rb}, $${rb + spec.prices.rerollStep}`);
        // Upgrade: find a twin after rerolls, else skip.
        const up = S.shop.cards.findIndex((c) => !c.sold && S.tubes.some((t) => t.shell && t.shell.id === c.id && t.shell.star < 3));
        if (up >= 0) { const id = S.shop.cards[up].id; const ti = S.tubes.findIndex((t) => t.shell && t.shell.id === id && t.shell.star < 3); const st = S.tubes[ti].shell.star; const p0 = S.coins; const paid0 = S.tubes[ti].shell.paid; evT(O.step(S, { type: 'upgrade', card: up, to: { zone: 'tube', i: ti } }), 'upgraded', 'upgrade'); const want = st === 1 ? Math.ceil(1.5 * spec.shell(id).cost) : 2 * spec.shell(id).cost; if (p0 - S.coins !== want) f.push(`upgrade ${id} ★${st}→★${st + 1} cost $${p0 - S.coins}, spec $${want} (row cost, even at Renown 5)`); if (S.tubes[ti].shell.paid !== paid0 + want) f.push(`upgrade: paid not increased by upCost`); }
        const sell = S.tubes.findIndex((t) => t.shell); const paid = S.tubes[sell].shell.paid; const s0 = S.coins; evT(O.step(S, { type: 'sell', from: { zone: 'tube', i: sell } }), 'sold', 'sell'); if (S.coins - s0 !== Math.max(1, Math.floor(spec.prices.sellRate * paid))) f.push(`sell of a shell with paid ${paid} returned $${S.coins - s0}, spec $${Math.max(1, Math.floor(0.75 * paid))}`);
      }
    }
    return verdict([...new Set(f)], [], 'Renown 0/3/4/5 price rules');
  });

  gated(C('sim.shop', '§5.3, §5.6, §5.7', 'shop generation over 40 seeds: card count, distinct ids, unlocked + fest ≤ f, rarity by festival, rig from F2, Sponsor only F3+ Twilight/Evening, rerolls reset'), () => {
    const f = []; let shops = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const S = fresh('shop-' + seed, {}); const rnd = lcg(seed); const done = new Set();
      for (let i = 0; i < 400 && S.phase === 'build'; i++) {
        if (S.shop && S.shop.rerolls === 0 && !done.has(S.show)) {
          done.add(S.show);
          shops++; const fe = Math.floor(S.show / 3) + 1; const k = S.show % 3; const cards = S.shop.cards; const base = cards.filter((c) => c.tag !== 'collector');
          if (base.length !== 3) f.push(`shop-${seed} show ${S.show + 1}: ${base.length} shell cards`);
          if (new Set(cards.map((c) => c.id)).size !== cards.length) f.push(`shop-${seed} show ${S.show + 1}: duplicate ids ${cards.map((c) => c.id)}`);
          for (const c of cards) { const row = spec.shell(c.id); if (!row) { f.push(`unknown card ${c.id}`); continue; } if (row.lock) f.push(`shop-${seed}: locked shell ${c.id} offered with unlocked=[]`); if (row.fest > fe) f.push(`shop-${seed} F${fe}: ${c.id} (F${row.fest}) offered too early`); if (spec.rarityWeights[Math.min(8, fe)][{ C: 0, U: 1, R: 2 }[row.rarity]] === 0 && c.tag !== 'collector' && c.tag !== 'pity') f.push(`shop-${seed} F${fe}: rarity ${row.rarity} (${c.id}) has weight 0`); if (row.col !== '*' && c.col !== row.col) f.push(`${c.id} colour ${c.col} ≠ row ${row.col}`); if (row.col === '*' && !['R', 'A', 'G', 'B'].includes(c.col)) f.push(`wild ${c.id} rolled ${c.col}`); }
          if (fe < 2 && S.shop.rig) f.push(`shop-${seed} F1: rig card offered`);
          if (fe >= 2 && !S.shop.rig) f.push(`shop-${seed} show ${S.show + 1}: no rig card in F${fe}`);
          if (S.sponsor && (fe < 3 || k === 2)) f.push(`shop-${seed} show ${S.show + 1}: Sponsor offered (F${fe}, k=${k})`);
          if (f.length > 25) break;
        }
        const la = O.legalActions(S); const a = la[Math.floor(rnd() * la.length)];
        O.step(S, a);
      }
    }
    return verdict([...new Set(f)].slice(0, 40), [], `${shops} shops checked`);
  });

  gated(C('sim.events', '§9, §11.4', 'events: names from the §9 table, fields present, seq strictly increasing'), () => {
    const f = [], w = []; const seen = new Set(); const allowed = new Set([...spec.events, 'illegal']); let lastSeq = -1; let n = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const S = fresh('ev-' + seed, { kit: seed % 2 ? 'apprentice' : 'market' }); const rnd = lcg(seed + 100);
      for (let i = 0; i < 500 && S.phase === 'build'; i++) {
        const la = O.legalActions(S); const a = rnd() < 0.3 ? { type: 'light' } : la[Math.floor(rnd() * la.length)];
        const ev = O.step(S, a);
        for (const e of ev) {
          n++; seen.add(e.type);
          // §9 names no event for restore / setColour / sponsor / endless: a new name there is a spec gap, not a rename.
          if (!allowed.has(e.type)) (['restore', 'setColour', 'sponsor', 'endless'].includes(a.type) ? w : f).push(`event "${e.type}" (from ${a.type}) is not a §9 name` + (['restore', 'setColour', 'sponsor', 'endless'].includes(a.type) ? ' — §9 lists no event for this action' : ''));
          if (typeof e.seq !== 'number') f.push(`${e.type}: no seq`); else { if (e.seq <= lastSeq && e.type !== 'illegal') f.push(`seq not increasing: ${lastSeq} → ${e.seq} (${e.type})`); lastSeq = e.seq; }
          const flds = spec.eventFields[e.type]; if (flds) for (const k of flds) if (!(k in e)) w.push(`${e.type} lacks field "${k}"`);
        }
      }
      lastSeq = -1;
    }
    const never = [...spec.events].filter((x) => !seen.has(x) && !['relight', 'runWon', 'milestone', 'critical', 'rainCheck', 'matched', 'fusion', 'repeat', 'extend', 'clear'].includes(x));
    return verdict([...new Set(f)].slice(0, 30), [...new Set(w)].slice(0, 30), `${n} events, ${seen.size} types` + (never.length ? ` (not reached by the random runs: ${never.join(', ')})` : ''));
  });

  gated(C('sim.invariants', '§11.7', 'fuzz: no NaN/Infinity, Applause < 1e300, ≤ 6 tubes, integer coins ≥ 0, shapley sums to Applause, timing'), () => {
    const f = [], w = []; let lights = 0, shap = 0, shapRaw = 0, shapShare = 0; let resolveMs = 0, resolves = 0, stepMs = 0, steps = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const S = fresh('fuzz-' + seed, { kit: ['apprentice', 'salvo', 'chemist', 'market', 'showman'][seed % 5], renown: seed % 9, unlocked: seed % 3 ? [] : spec.milestones.map((m) => m.id) });
      const rnd = lcg(seed + 999);
      for (let i = 0; i < 600 && S.phase === 'build'; i++) {
        const la = O.legalActions(S); if (!la.length) { f.push(`fuzz-${seed}: no legal actions in build`); break; }
        const a = la[Math.floor(rnd() * la.length)];
        if (a.type === 'light') {
          lights++;
          const rules = O.rulesFor(S, S.show); const fav = rules.includes('rival') ? O.favourite(S.tubes, S.crowd) : null;
          if (typeof O.shapley === 'function' && lights % 3 === 0) {
            const A = O.resolveShow(S.tubes, { rules, crowd: S.crowd, fav }).applause; const sh = O.shapley(S.tubes, rules, S.crowd, fav); shap++;
            const vals = []; walkNums(sh, (v) => vals.push(v)); const sum = vals.reduce((x, y) => x + y, 0);
            if (Math.abs(sum - A) <= 1e-6 * Math.max(1, A)) shapRaw++; else if (Math.abs(sum - 1) <= 1e-6) shapShare++; else f.push(`fuzz-${seed} show ${S.show + 1}: shapley sums to ${sum}, Applause ${A} (neither the Applause nor 1)`);
            if (vals.some((v) => v < -1e-9)) f.push(`fuzz-${seed} show ${S.show + 1}: negative Shapley value ${Math.min(...vals)}`);
          }
        }
        const t0 = performance.now(); O.step(S, a); stepMs += performance.now() - t0; steps++;
        walkNums(S, (v, p) => { if (!Number.isFinite(v)) f.push(`fuzz-${seed}: ${p} = ${v}`); });
        if (S.tubes.length > 6) f.push(`fuzz-${seed}: ${S.tubes.length} tubes`);
        if (!Number.isInteger(S.coins) || S.coins < 0) f.push(`fuzz-${seed}: coins ${S.coins}`);
        if (f.length > 20) break;
      }
      const h = S.runStats && S.runStats.history || []; for (const r of h) if (!(r.applause < 1e300)) f.push(`fuzz-${seed}: Applause ${r.applause}`);
    }
    // §11.7 resolve budget: 6-tube Countdown ≤ 0.2 ms.
    const g = spec.goldens.find((x) => x.n === 9); const OT = L.OOHmain || O; if (g) { const c = g.cases[0]; const tubes = mkTubes(c.shells, c.rigs); for (let i = 0; i < 1000; i++) OT.resolveShow(tubes, { rules: ['countdown'], crowd: 84 }); const t0 = performance.now(); for (let i = 0; i < 2000; i++) OT.resolveShow(tubes, { rules: ['countdown'], crowd: 84 }); resolveMs = (performance.now() - t0) / 2000; resolves = 2000; }
    if (resolveMs > 0.2) w.push(`resolveShow (6-tube Countdown, golden #9) averages ${resolveMs.toFixed(3)} ms in node (budget 0.2 ms; the spec's reference ≈ 0.017 ms)`);
    if (shapShare) w.push(`shapley() returns shares summing to 1 in ${shapShare}/${shap} shows (§11.4 "share"); §11.7 asks that results sum to the show's Applause within 1e-6 — the spec is ambiguous, the API cannot satisfy both`);
    if (stepMs / steps > 2) w.push(`step averages ${(stepMs / steps).toFixed(2)} ms (budget 2 ms)`);
    return verdict([...new Set(f)], w, `${steps} steps, ${lights} lights, ${shap} shapley sums; resolve ${resolveMs.toFixed(3)} ms, step ${(stepMs / steps).toFixed(3)} ms`);
  });

  gated(C('sim.helpers', 'CONTRACT, §3.3, §4.12', 'describeShell = §4.3 card text at ★1; previewChips never returns a total; lessonFor/milestoneProgress/fireOrder/seesPerTube callable'), () => {
    const f = [], w = [];
    if (typeof O.describeShell === 'function') for (const s of spec.shells) { const col = s.col === '*' ? 'R' : s.col; let got; try { got = O.describeShell(s.id, col, 1); } catch (e) { got = 'threw ' + e.message; } if (normText(got) !== normText(s.text)) f.push(`describeShell('${s.id}', '${col}', 1) = ${short(got, 100)}; §4.3 ${short(s.text, 100)}`); }
    if (typeof O.describeShell === 'function') { const p2 = O.describeShell('peony', 'R', 2); if (!/\+40 Ooh/.test(p2)) f.push(`describeShell('peony','R',2) = ${short(p2)} (★2 should double: +40 Ooh)`); }
    const S = fresh('helper-audit', {});
    if (typeof O.previewChips === 'function') { const ch = O.previewChips(S, O.rulesFor(S, 0)); const txt = JSON.stringify(ch); if (!Array.isArray(ch)) f.push(`previewChips returned ${short(ch)}`); if (/"(applause|total|score)"\s*:/i.test(txt)) f.push(`previewChips exposes a total (${txt.match(/"(applause|total|score)"/i)[0]}) — §3.3 "It never returns the total"`); }
    for (const k of ['fireOrder', 'seesPerTube', 'payoutPreview']) if (typeof O[k] === 'function') { try { O[k](S, O.rulesFor(S, 0)); } catch (e) { f.push(`${k}(state, rules) threw ${e.message}`); } }
    if (typeof O.fireOrder === 'function') { const fo = O.fireOrder(S, ['windshift']); const seq = Array.isArray(fo) ? fo : fo && fo.seq; const occ = S.tubes.map((t, i) => (t.shell ? i : -1)).filter((i) => i >= 0).reverse(); if (!Array.isArray(seq)) w.push(`fireOrder(state, rules) returned ${short(fo)} (no seq array)`); else if (!deepEq(seq, occ)) f.push(`fireOrder(state, ['windshift']).seq = ${JSON.stringify(seq)}, expected ${JSON.stringify(occ)} (occupied tubes, right to left)`); }
    if (typeof O.lessonFor === 'function') { const S2 = fresh('lesson-audit', {}); for (let i = 0; i < 40 && S2.phase === 'build'; i++) { if (S2.show > 0) S2.tubes.forEach((t) => (t.shell = null)); O.step(S2, { type: 'light' }); } let l; try { l = O.lessonFor(S2); } catch (e) { l = 'threw ' + e.message; } const txt = typeof l === 'string' ? l : l && (l.text || l.line); const known = spec.lessons.some((x) => normText(txt || '').startsWith(normText(x.text.split('{')[0]).slice(0, 25))); if (!known) w.push(`lessonFor(lost state) = ${short(l, 120)} (not recognisably a §4.12 text)`); }
    return verdict(f, w, '34 card texts + helpers');
  });

  gated(C('sim.losing', '§5.4, §4.10, §7.4', 'first miss spends the rain check; second miss loses; Renown 6 has no rain check; a Countdown miss loses (Fair Weather relights once)'), () => {
    const f = [];
    const empty = (S) => { S.tubes.forEach((t) => { t.shell = null; }); S.crate = [null, null]; };
    const A = fresh('lose-audit', {}); empty(A); O.step(A, { type: 'light' });
    if (A.phase !== 'build' || A.rain !== 0) f.push(`after the first miss: phase ${A.phase}, rain ${A.rain} (expected build, rain 0)`);
    empty(A); O.step(A, { type: 'light' }); if (A.phase !== 'lost') f.push(`after the second miss: phase ${A.phase} (expected lost)`);
    const B6 = fresh('lose-audit', { renown: 6 }); empty(B6); O.step(B6, { type: 'light' }); if (B6.phase !== 'lost') f.push(`Renown 6, first miss: phase ${B6.phase} (expected lost: no rain check)`);
    const C = fresh('lose-audit', {}); C.show = 23; empty(C); const ev = O.step(C, { type: 'light' }); if (C.phase !== 'lost') f.push(`Countdown miss with the rain check unused: phase ${C.phase} (expected lost)`);
    if (!ev.some((e) => e.type === 'runLost')) f.push('no runLost event on the losing light');
    const F = fresh('lose-audit', { fairWeather: true }); F.show = 23; empty(F); O.step(F, { type: 'light' });
    if (F.phase !== 'build' || F.show !== 23 || F.relight !== 0) f.push(`Fair Weather Countdown miss: phase ${F.phase}, show ${F.show + 1}, relight ${F.relight} (expected a relit Countdown build, relight spent)`);
    else { empty(F); O.step(F, { type: 'light' }); if (F.phase !== 'lost') f.push(`Fair Weather second Countdown miss: phase ${F.phase}`); }
    return verdict(f, [], 'rain check, Renown 6, Countdown, Fair Weather relight');
  });

  gated(C('sim.afterparty', '§5.10', 'win at the Countdown → endless: two distinct twists per Headliner from the pool, Afterparty targets, no Sponsor, shop every show'), () => {
    const f = [], w = []; const g = spec.goldens.find((x) => x.n === 10); need(g, 'golden #10 not parsed');
    const S = fresh('party-audit', {}); S.show = 23; S.crowd = 84;
    S.tubes = mkTubes(g.cases[0].shells, g.cases[0].rigs).map((t, i) => ({ shell: t.shell && { ...t.shell, uid: 900 + i, paid: 1 }, rig: t.rig }));
    const ev = O.step(S, { type: 'light' });
    if (S.phase !== 'won') return { status: 'FAIL', summary: `a 274,095 Countdown (target 180,000) left phase ${S.phase}` };
    if (!ev.some((e) => e.type === 'runWon')) f.push('no runWon event');
    const e2 = O.step(S, { type: 'endless' });
    if (e2.length === 1 && e2[0].type === 'illegal') return { status: 'FAIL', summary: `endless after a win is illegal: ${e2[0].reason}` };
    if (S.phase !== 'build' || S.show !== 24) f.push(`after endless: phase ${S.phase}, show ${S.show + 1} (expected build at show 25)`);
    const et = S.endlessTwists || {};
    for (let n = 9; n <= 12; n++) { const p = et[n]; if (!Array.isArray(p) || p.length !== 2 || p[0] === p[1] || !p.every((x) => spec.endlessPool.includes(x))) f.push(`endlessTwists[${n}] = ${short(p)} (two distinct twists from ${spec.endlessPool.join(',')})`); }
    for (let s = 24; s < 36; s++) { const t = O.target(S, s); if (t !== spec.afterpartyTargets[s - 24]) f.push(`target(show ${s + 1}) = ${t}, §5.10 ${spec.afterpartyTargets[s - 24]}`); }
    const hr = O.rulesFor(S, 26); if (et[9] && !deepEq(Array.from(hr).sort(), et[9].slice().sort())) f.push(`rulesFor(show 27) = ${short(hr)}, expected the F9 twists ${et[9]}`);
    for (let i = 0; i < 8 && S.phase === 'build'; i++) { if (S.sponsor) { f.push(`Sponsor offered in the Afterparty at show ${S.show + 1}`); break; } if (!S.shop) { f.push(`no shop at Afterparty show ${S.show + 1}`); break; } O.step(S, { type: 'light' }); }
    if (S.phase === 'build') w.push('the Afterparty run survived 8 more shows with the golden #10 rack');
    return verdict(f, w, `twists ${JSON.stringify(et)}`);
  });

  if (OPT.bots > 0) gated(C('bots.gates', '§12.2', `runBots over seeds 1..${OPT.bots}: summary shape (gates are informational)`), () => {
    need(typeof O.runBots === 'function', 'runBots missing');
    const out = []; for (const bot of ['greedy', 'novice', 'human']) { const t0 = Date.now(); const s = O.runBots({ bot, n: OPT.bots, seeds: Array.from({ length: OPT.bots }, (_, i) => i + 1) }); out.push(`${bot}: ${short(s, 200)} (${Date.now() - t0} ms)`); }
    return { status: 'PASS', summary: 'ran', details: [...out, ...spec.gates.map((g) => `§12.2 ${g.metric}: gate ${g.gate} (ref ${g.ref})`)] };
  });
}

// ============================================================================
//  8. Static page contract on the built file
// ============================================================================
const SRC_OWNER = { 'sim.js': 'sim', 'audio.js': 'audio', 'fx.js': 'fx', 'core.js': 'core', 'ui-play.js': 'play', 'play.css': 'play', 'ui-panels.js': 'panels', 'panels.css': 'panels', 'ui-end.js': 'end', 'end.css': 'end', 'ui-menus.js': 'menus', 'menus.css': 'menus', 'base.css': 'lead', 'body.html': 'lead', 'head.html': 'tooling' };
function loadSources() { const dir = path.join(GAME_DIR, 'src'); const out = {}; for (const f of Object.keys(SRC_OWNER)) { try { out[f] = fs.readFileSync(path.join(dir, f), 'utf8'); } catch { /* missing module */ } } return out; }
/** Which src file (and line) holds a snippet: for owner attribution in the report. */
function locate(SRC, snippet) {
  for (const [f, t] of Object.entries(SRC)) { const i = t.indexOf(snippet); if (i >= 0) return { file: f, owner: SRC_OWNER[f], line: t.slice(0, i).split('\n').length }; }
  return { file: 'index.html', owner: 'tooling', line: 0 };
}
/** Blanks comments (keeping offsets and newlines) with a small scanner that understands strings,
 *  template literals and regex literals, so a "/*" inside a regex or string cannot swallow code. */
function stripComments(js) {
  const out = js.split(''); let i = 0; const n = js.length; let lastSig = '';
  const blank = (a, b) => { for (let k = a; k < b; k++) if (out[k] !== '\n') out[k] = ' '; };
  while (i < n) {
    const c = js[i], d = js[i + 1];
    if (c === '/' && d === '/') { const e = js.indexOf('\n', i); const end = e < 0 ? n : e; blank(i, end); i = end; continue; }
    if (c === '/' && d === '*') { const e = js.indexOf('*/', i + 2); const end = e < 0 ? n : e + 2; blank(i, end); i = end; continue; }
    if (c === '"' || c === "'" || c === '`') { let k = i + 1; while (k < n && js[k] !== c) { if (js[k] === '\\') k++; else if (c !== '`' && js[k] === '\n') break; k++; } i = k + 1; lastSig = c; continue; }
    if (c === '/' && (lastSig === '' || '(,=:[!&|?{};+-*%<>~^'.includes(lastSig) || /\b(return|typeof|case|in|of)$/.test(js.slice(Math.max(0, i - 8), i).trimEnd()))) {
      let k = i + 1, cls = false; while (k < n && js[k] !== '\n') { if (js[k] === '\\') { k += 2; continue; } if (js[k] === '[') cls = true; else if (js[k] === ']') cls = false; else if (js[k] === '/' && !cls) break; k++; }
      i = k + 1; lastSig = '/'; continue;
    }
    if (!/\s/.test(c)) lastSig = c;
    i++;
  }
  return out.join('');
}
function cssRules(css) {
  const out = []; const re = /([^{}]+)\{([^{}]*)\}/g; let m;
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  while ((m = re.exec(clean))) out.push({ sel: m[1].split(';').pop().trim().replace(/\s+/g, ' '), body: m[2].replace(/\s+/g, ' ').trim(), at: m.index, ctx: clean.slice(Math.max(0, m.index - 200), m.index) });
  return out;
}
const decl = (body, prop) => { const m = new RegExp('(?:^|;)\\s*' + prop.replace(/[-]/g, '\\-') + '\\s*:\\s*([^;]+)').exec(body); return m ? m[1].trim().replace(/\s*!important/, '') : null; };

function staticChecks(spec, html, SRC) {
  const C = (id, sp, title, owner = 'tooling') => ({ id, spec: sp, title, owner });
  const styleM = /<style>([\s\S]*?)<\/style>/.exec(html); const css = styleM ? styleM[1] : '';
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]; const js = scripts.map((m) => m[1]).join('\n'); const jsNC = stripComments(js);
  const rules = cssRules(css);

  check(C('static.size', '§11.1 (CONTRACT override)', 'built file ≤ 1,200 KB (warn > 800 KB); spec target 150/190 KB lifted by CONTRACT'), () => {
    const kb = Buffer.byteLength(html) / 1024;
    return { status: kb > 1200 ? 'FAIL' : kb > 800 ? 'WARN' : 'PASS', summary: `${kb.toFixed(1)} KB` + (kb > 190 ? ' (above the §11.1 190 KB ceiling, allowed by CONTRACT)' : '') };
  });
  check(C('static.head', '§11.2', 'file starts with the two metas, then <title>Ooh × Aah</title>, then <style>'), () => {
    const f = []; const t = html.replace(/^﻿/, '');
    const re = /^<meta charset="utf-8">\s*<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\s*<title>Ooh × Aah<\/title>\s*<style>/;
    if (!re.test(t)) f.push(`first 200 chars: ${JSON.stringify(t.slice(0, 200))}`);
    return verdict(f, [], 'exact prefix');
  });
  check(C('static.wrappers', '§11.2', 'no <!doctype>, <html>, <head> or <body> tags'), () => {
    const f = []; for (const m of html.matchAll(/<\s*(!doctype|html|head|body)(?=[\s>])/gi)) { const ctx = html.slice(m.index, m.index + 40); const loc = locate(SRC, ctx.slice(0, 20)); f.push(`${m[0]} at offset ${m.index} (${loc.file}:${loc.line}) ${JSON.stringify(ctx)}`); }
    return verdict(f, [], 'none');
  });
  check(C('static.fonts', '§11.2, §8.5', 'Google Fonts @import (Fraunces + Atkinson Hyperlegible) exactly as specified; fallbacks; tabular-nums', 'lead'), () => {
    const f = [], w = []; const url = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,700&family=Atkinson+Hyperlegible:wght@400;700&display=swap";
    if (!css.includes(`@import url('${url}')`) && !css.includes(`@import url("${url}")`)) {
      const got = (/@import\s+url\(\s*['"]?([^'")]+)/.exec(css) || [])[1] || '';
      const fam = (u) => Object.fromEntries([...u.matchAll(/family=([^&]+)/g)].map((m) => { const [n, a] = m[1].split(':'); return [n, a || '']; }));
      const W = fam(url), G = fam(got); const diffs = Object.keys({ ...W, ...G }).filter((k) => W[k] !== G[k]).map((k) => `${k}: spec "${W[k] ?? '(absent)'}" vs build "${G[k] ?? '(absent)'}"`);
      f.push(got ? `@import URL differs from §11.2 — ${diffs.join('; ') || 'other parameters: ' + got}` : '@import of Google Fonts not found');
    }
    if (css.indexOf('@import') > 0 && css.slice(0, css.indexOf('@import')).replace(/\/\*[\s\S]*?\*\//g, '').trim()) w.push('@import is not the first rule of the <style> (browsers ignore a late @import)');
    if (!/Georgia,\s*'Times New Roman',\s*serif/.test(css)) f.push("serif fallback Georgia, 'Times New Roman', serif missing");
    if (!/system-ui,\s*-apple-system,\s*'Segoe UI',\s*Roboto,\s*sans-serif/.test(css)) f.push("sans fallback system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif missing");
    if (!/font-variant-numeric\s*:\s*tabular-nums/.test(css)) w.push('font-variant-numeric: tabular-nums not used');
    return verdict(f, w, 'import + fallbacks present');
  });
  check(C('static.external', '§11.2', 'no external URLs other than Google Fonts'), () => {
    const f = [], w = [];
    for (const m of html.matchAll(/https?:\/\/[^\s'"`)<>]+/g)) {
      const u = m[0]; if (/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u)) continue;
      if (/^http:\/\/www\.w3\.org\//.test(u)) continue; // XML namespaces, not requests
      const loc = locate(SRC, u); (loc.file === 'index.html' ? f : f).push(`${u} (${loc.file}:${loc.line})`);
    }
    return verdict([...new Set(f)], w, 'fonts only');
  });
  check(C('static.dialogs', '§11.2', 'no alert(), confirm() or prompt() calls'), () => {
    const f = []; for (const m of jsNC.matchAll(/(^|[^.\w$'"])(?:window\.)?(alert|confirm|prompt)\s*\(/g)) { const snip = jsNC.slice(m.index, m.index + 50).trim(); const loc = locate(SRC, snip.slice(0, 30)); f.push(`${m[2]}( at ${loc.file}:${loc.line}: ${JSON.stringify(snip)}`); }
    return verdict(f, [], 'none');
  });
  check(C('static.css-base', '§11.2', 'CSS base rules, height:100% (never 100vh), #app safe-area padding', 'lead'), () => {
    const f = [], w = [];
    const has = (sel, props) => { const r = rules.filter((x) => x.sel.replace(/\s/g, '') === sel.replace(/\s/g, '')); for (const [p, v] of props) if (!r.some((x) => (decl(x.body, p) || '').replace(/\s/g, '') === v.replace(/\s/g, ''))) f.push(`${sel}{${p}:${v}} missing (rules for ${sel}: ${r.map((x) => x.body).join(' | ') || 'none'})`); };
    has('html', [['box-sizing', 'border-box'], ['height', '100%']]);
    has('*,*::before,*::after', [['box-sizing', 'inherit']]);
    has('html,body', [['height', '100%'], ['margin', '0'], ['background', 'var(--bg)'], ['overflow', 'hidden']]);
    for (const m of css.matchAll(/100vh/g)) { const snip = css.slice(Math.max(0, m.index - 60), m.index + 10); const loc = locate(SRC, snip.slice(-40)); f.push(`100vh used (${loc.file}:${loc.line}): ${JSON.stringify(snip)}`); }
    for (const m of jsNC.matchAll(/['"`][^'"`]*100vh[^'"`]*['"`]/g)) { const loc = locate(SRC, m[0].slice(1, 30)); f.push(`100vh in script (${loc.file}:${loc.line}): ${m[0].slice(0, 60)}`); }
    const app = rules.filter((x) => /(^|,)\s*#app\s*(,|$)/.test(x.sel)).map((x) => decl(x.body, 'padding')).filter(Boolean);
    const fb = '(?:\\s*,\\s*0(?:px)?)?'; const envRe = new RegExp(['top', 'right', 'bottom', 'left'].map((k) => `env\\(safe-area-inset-${k}${fb}\\)`).join('\\s+'));
    if (app.some((p) => envRe.test(p)) && !app.some((p) => /env\(safe-area-inset-top\)\s/.test(p))) w.push(`#app padding uses env() with a 0px fallback (${app[0]}): equivalent to §11.2`);
    if (!app.some((p) => envRe.test(p))) f.push(`#app padding: ${app.join(' | ') || 'none'} (want env(safe-area-inset-top) env(…-right) env(…-bottom) env(…-left))`);
    return verdict(f, w, 'base rules present');
  });
  check(C('static.tokens', '§8.5, §4.1', 'tokens on :root, repeated for the dark-scheme selectors, high contrast under :root[data-contrast="high"]', 'lead'), () => {
    const f = [], w = [];
    const rootRules = rules.filter((r) => /^:root$/.test(r.sel) && !/@media[^{]*$/.test(r.ctx));
    const darkQ = rules.filter((r) => /:root:not\(\[data-theme=["']?light["']?\]\)/.test(r.sel) && /prefers-color-scheme:\s*dark/.test(r.ctx));
    const darkA = rules.filter((r) => /:root\[data-theme=["']?dark["']?\]/.test(r.sel));
    const hc = rules.filter((r) => /:root\[data-contrast=["']?high["']?\]/.test(r.sel));
    const val = (rs, t) => { for (const r of rs) { const v = decl(r.body, t); if (v) return v.toUpperCase(); } return null; };
    if (!darkQ.length) f.push('no @media (prefers-color-scheme: dark){:root:not([data-theme="light"]){…}} rule');
    if (!darkA.length) f.push('no :root[data-theme="dark"] rule');
    if (!hc.length) f.push('no :root[data-contrast="high"] rule');
    for (const t of spec.tokens) {
      const v = val(rootRules, t.name); if (!v) { f.push(`${t.name} not defined on :root`); continue; }
      if (!v.includes(t.value)) f.push(`${t.name}: :root ${v}, §8.5 ${t.value}`);
      for (const [lbl, rs] of [['dark-scheme @media', darkQ], ['[data-theme="dark"]', darkA]]) { const dv = val(rs, t.name); if (rs.length && dv && dv !== v) f.push(`${t.name}: ${lbl} ${dv} ≠ :root ${v}`); if (rs.length && !dv && rs.some((r) => /--/.test(r.body))) w.push(`${t.name} not repeated under ${lbl}`); }
      const hv = val(hc, t.name); if (t.hc && t.hc !== t.value && (!hv || !hv.includes(t.hc))) f.push(`${t.name}: high contrast ${hv || 'not set'}, §8.5 ${t.hc}`);
    }
    const allRoot = rootRules.map((r) => r.body).join(';').toUpperCase(); const allHc = hc.map((r) => r.body).join(';').toUpperCase();
    for (const c of spec.colours) { if (c.hex && !allRoot.includes(c.hex)) f.push(`§4.1 ${c.id} colour ${c.hex} not a :root token`); if (c.hc && hc.length && !allHc.includes(c.hc)) f.push(`§4.1 ${c.id} high-contrast ${c.hc} not under :root[data-contrast="high"]`); }
    return verdict(f, w, `${spec.tokens.length} tokens + ${spec.colours.length} colours`);
  });
  check(C('static.input', '§11.5', 'input CSS/JS: touch-action:none, overscroll-behavior:none, user-select:none, -webkit-touch-callout:none, transparent tap highlight, contextmenu, pointer capture/cancel, isPrimary', 'play'), () => {
    const f = [], w = [];
    const needCss = [['touch-action', /touch-action\s*:\s*none/], ['overscroll-behavior', /overscroll-behavior\s*:\s*none/], ['user-select', /(?:-webkit-)?user-select\s*:\s*none/], ['-webkit-touch-callout', /-webkit-touch-callout\s*:\s*none/], ['tap highlight', /-webkit-tap-highlight-color\s*:\s*(transparent|rgba\(0,\s*0,\s*0,\s*0\))/]];
    for (const [n, re] of needCss) if (!re.test(css)) f.push(`CSS ${n} missing`);
    const needJs = [['setPointerCapture', /setPointerCapture/], ['pointercancel', /pointercancel/], ['isPrimary', /isPrimary/], ['contextmenu prevented', /contextmenu/], ['long-press 450 ms', /\b450\b/], ['10 px tap slop', /\b10\b/]];
    for (const [n, re] of needJs) if (!re.test(jsNC)) (n.includes('450') || n.includes('10 px') ? w : f).push(`JS ${n} not found`);
    return verdict(f, w, 'present');
  });
  check(C('static.fx', '§11.5', 'Canvas 2D {alpha:false}, DPR ≤ 2 via setTransform, ResizeObserver + DPR matchMedia, no shadowBlur, 400-particle pool', 'fx'), () => {
    const f = [], w = []; const fx = stripComments(SRC['fx.js'] || jsNC);
    if (!/getContext\(\s*['"]2d['"]\s*,\s*\{[^}]*alpha\s*:\s*false/.test(jsNC)) f.push("getContext('2d', {alpha:false}) not found");
    if (/shadowBlur/.test(jsNC)) { const loc = locate(SRC, 'shadowBlur'); f.push(`shadowBlur used (${loc.file}:${loc.line})`); }
    if (!/Math\.min\(\s*(?:window\.)?devicePixelRatio[^)]*,\s*2\s*\)|Math\.min\(\s*2\s*,\s*(?:window\.)?devicePixelRatio/.test(jsNC)) w.push('min(devicePixelRatio, 2) not found');
    if (!/setTransform/.test(fx)) f.push('setTransform not used in fx.js');
    if (!/ResizeObserver/.test(jsNC)) f.push('ResizeObserver not used');
    if (!/matchMedia\([^)]*resolution/.test(jsNC)) w.push('no DPR matchMedia((resolution: …dppx)) listener');
    if (!/\b400\b/.test(fx)) w.push('particle pool size 400 not found in fx.js');
    return verdict(f, w, 'present');
  });
  check(C('static.loop', '§11.5', 'rAF loop: DT = 1/60, delta clamp 0.25 s, ≤ 8 steps per frame; lifecycle on visibilitychange + blur', 'core'), () => {
    const f = [], w = []; const core = stripComments(SRC['core.js'] || jsNC);
    if (!/requestAnimationFrame/.test(core)) f.push('requestAnimationFrame not used in core.js');
    if (!/1\s*\/\s*60/.test(core)) w.push('DT = 1/60 not found');
    if (!/0\.25/.test(core)) w.push('0.25 s delta clamp not found');
    if (!/\b8\b/.test(core)) w.push('8-step cap not found');
    if (!/visibilitychange/.test(core)) f.push('visibilitychange not handled');
    if (!/['"]blur['"]/.test(core)) f.push('window blur not handled');
    return verdict(f, w, 'present');
  });
  check(C('static.storage', '§11.2, §7.5', "every localStorage access inside try/catch; key 'oohxaah.v1'", 'core'), () => {
    const f = [], w = [];
    if (!/['"]oohxaah\.v1['"]/.test(js)) f.push("storage key 'oohxaah.v1' not found");
    for (const m of jsNC.matchAll(/localStorage/g)) {
      const before = jsNC.slice(Math.max(0, m.index - 12), m.index); if (/typeof\s+$/.test(before)) continue;
      let depth = 0, ok = false;
      for (let i = m.index; i > 0; i--) { const ch = jsNC[i]; if (ch === '}') depth++; else if (ch === '{') { if (depth === 0) { if (/try\s*$/.test(jsNC.slice(Math.max(0, i - 8), i))) { ok = true; break; } } else depth--; } }
      if (!ok) { const snip = jsNC.slice(m.index - 30, m.index + 40).replace(/\s+/g, ' '); const loc = locate(SRC, jsNC.slice(m.index, m.index + 30).trim()); f.push(`${loc.file}:${loc.line}: ${snip}`); }
    }
    return verdict(f, w, 'all accesses guarded');
  });
  check(C('static.modules', 'CONTRACT', 'assembly: CSS order, one <script>, module globals in order, ends with GAME.boot()', 'tooling'), () => {
    const f = [], w = [];
    if (scripts.length !== 1) f.push(`${scripts.length} <script> tags (CONTRACT: exactly one)`);
    if (!/GAME\.boot\(\);?\s*$/.test(scripts.length ? scripts[scripts.length - 1][1] : '')) f.push('the script does not end with GAME.boot();');
    const order = [['function OohSim', 'sim'], ['const OOH', 'sim'], ['const AUDIO', 'audio'], ['const FX', 'fx'], ['const GAME', 'core'], ['const UI_PLAY', 'play'], ['const UI_PANELS', 'panels'], ['const UI_END', 'end'], ['const UI_MENUS', 'menus']];
    let last = -1; for (const [g, o] of order) { const re = new RegExp('^' + g.replace(' ', '\\s+') + '\\b', 'gm'); const all = [...js.matchAll(re)]; if (!all.length) f.push(`${g} not defined at top level (${o})`); else { if (all.length > 1) f.push(`${g} defined ${all.length}×`); if (all[0].index < last) f.push(`${g} out of CONTRACT order`); last = all[0].index; } }
    const cssOrder = ['base.css', 'play.css', 'panels.css', 'end.css', 'menus.css'].map((n) => { const t = (SRC[n] || '').trim().slice(0, 80); return t ? css.indexOf(t) : -2; });
    if (cssOrder.some((v, i) => v === -1)) w.push(`a CSS module's first line is not found verbatim in the build (${cssOrder})`);
    else if (cssOrder.some((v, i) => i && v >= 0 && cssOrder[i - 1] >= 0 && v < cssOrder[i - 1])) f.push('CSS files out of CONTRACT order');
    // Top-level identifiers beyond the one global per module.
    const tops = [...js.matchAll(/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
    const allowed = new Set(['OohSim', 'OOH', 'AUDIO', 'FX', 'GAME', 'UI_PLAY', 'UI_PANELS', 'UI_END', 'UI_MENUS']);
    const extra = tops.filter((t) => !allowed.has(t)); if (extra.length) f.push(`extra top-level identifiers: ${extra.join(', ')}`);
    return verdict(f, w, '9 globals in order');
  });
  check(C('static.dom', 'CONTRACT, §11.1', 'body.html skeleton holds every contracted container id', 'lead'), () => {
    const f = []; const body = SRC['body.html'] || html;
    for (const id of ['app', 'sky', 'hud', 'sponsor', 'sky-overlay', 'rack', 'tools', 'shop', 'workshop', 'fire', 'board', 'showlog', 'end', 'pause-menu', 'settings', 'logbook', 'help', 'inspect', 'toasts', 'tap-continue', 'live-polite', 'live-assertive']) if (!new RegExp(`id=["']${id}["']`).test(body)) f.push(`#${id} missing`);
    if (!/<canvas[^>]*id=["']sky["']/.test(body)) f.push('canvas#sky missing');
    if (!/id=["']live-polite["'][^>]*aria-live=["']polite["']|aria-live=["']polite["'][^>]*id=["']live-polite["']/.test(body)) f.push('#live-polite lacks aria-live="polite"');
    if (!/id=["']live-assertive["'][^>]*aria-live=["']assertive["']|aria-live=["']assertive["'][^>]*id=["']live-assertive["']/.test(body)) f.push('#live-assertive lacks aria-live="assertive"');
    return verdict(f, [], 'all ids present');
  });
  check(C('static.sim-purity', '§11.3', 'sim.js source: Math.random / Date.now / new Date occurrences (runtime trap in sim.determinism is authoritative)', 'sim'), () => {
    const w = []; const src = stripComments(SRC['sim.js'] || '');
    for (const m of src.matchAll(/Math\.random|Date\.now|new Date\b/g)) { const line = src.slice(0, m.index).split('\n').length; w.push(`sim.js:${line}: ${src.split('\n')[line - 1].trim().slice(0, 100)}`); }
    return verdict([], w, 'none');
  });
}

// ============================================================================
//  9. Browser (Playwright + Chromium)
// ============================================================================
function loadPlaywright() {
  for (const base of ['/opt/node22/lib/node_modules/', path.join(GAME_DIR, 'node_modules') + '/', process.cwd() + '/']) {
    try { return createRequire(base)('playwright'); } catch { /* next */ }
  }
  return null;
}
function serve(file) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const u = new URL(req.url, 'http://x');
      if (u.pathname === '/' || u.pathname === '/index.html') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(fs.readFileSync(file)); return; }
      res.writeHead(404); res.end('not found');
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, base: `http://127.0.0.1:${srv.address().port}/` }));
  });
}
const INSTRUMENT = `(() => {
  const A = window.__audit = { raf: 0, audioCtx: 0, audioBeforeGesture: 0, resume: 0, dialogs: [], gesture: false };
  const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => { A.raf++; return raf(cb); };
  for (const k of ['alert', 'confirm', 'prompt']) window[k] = function (m) { A.dialogs.push(k + ': ' + m); return k === 'confirm' ? false : null; };
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) { const W = function (...a) { A.audioCtx++; if (!A.gesture) A.audioBeforeGesture++; const c = new AC(...a); const r = c.resume.bind(c); c.resume = function () { A.resume++; return r(); }; return c; }; W.prototype = AC.prototype; window.AudioContext = W; if ('webkitAudioContext' in window) window.webkitAudioContext = W; }
  addEventListener('pointerdown', () => { A.gesture = true; }, true); addEventListener('keydown', () => { A.gesture = true; }, true);
})();`;
const PAGE_HELPERS = `(() => {
  const vis = (el) => { if (!el) return false; if (el.closest('[hidden]')) return false; const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false; return true; };
  const desc = (el) => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; if (el.classList.length) s += '.' + [...el.classList].slice(0, 2).join('.'); for (const a of ['data-tube', 'data-card', 'data-crate', 'data-act']) if (el.hasAttribute(a)) s += '[' + a + '="' + el.getAttribute(a) + '"]'; const l = el.getAttribute('aria-label') || el.textContent.trim(); return s + (l ? ' "' + l.slice(0, 30) + '"' : ''); };
  window.__auditH = { vis, desc };
})();`;

async function browserChecks(spec, L) {
  const pw = loadPlaywright();
  const bcheck = (c, fn) => (wants(c.id.split('.')[0]) ? check(c, fn) : undefined);
  const B = (id, sp, title, owner) => ({ id, spec: sp, title, owner });
  if (!pw) { skip(B('page.playwright', '', 'Playwright available', 'tooling'), 'playwright not found under /opt/node22/lib/node_modules or node_modules'); return; }
  if (!fs.existsSync(OPT.html)) { skip(B('page.build', '', 'built index.html exists', 'tooling'), `${OPT.html} missing — run node tools/build.mjs`); return; }
  const { srv, base } = await serve(OPT.html);
  let browser;
  const T = OPT.timeout;
  const contexts = [];
  try {
    browser = await pw.chromium.launch({ headless: true, args: ['--autoplay-policy=user-gesture-required'] });
    /** A context with the instrumentation, fonts aborted and requests recorded. */
    async function newCtx(o = {}) {
      const ctx = await browser.newContext({ viewport: { width: o.w || 360, height: o.h || 740 }, deviceScaleFactor: 1, hasTouch: !!o.touch });
      const rec = { external: [], fonts: [], errors: [], console: [] };
      await ctx.route(/^https?:\/\//, (route) => { const u = route.request().url(); if (/^https?:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u)) { rec.fonts.push(u); return route.abort(); } if (u.startsWith(base)) return route.continue(); rec.external.push(u); return route.abort(); });
      await ctx.addInitScript(INSTRUMENT); await ctx.addInitScript(PAGE_HELPERS);
      if (o.init) await ctx.addInitScript(o.init);
      ctx.__rec = rec; contexts.push(ctx); return ctx;
    }
    async function open(ctx, query = '', waitUi = 'BUILD') {
      const page = await ctx.newPage(); const rec = ctx.__rec;
      page.on('pageerror', (e) => rec.errors.push(String(e && e.message || e).slice(0, 300)));
      page.on('console', (m) => { if (m.type() !== 'error') return; const at = (m.location() && m.location().url) || ''; if (/fonts\.(googleapis|gstatic)\.com/.test(at) || (/ERR_FAILED|net::/.test(m.text()) && !at.startsWith(base))) return; rec.console.push(m.text().slice(0, 300) + (at ? ' @ ' + at.slice(0, 80) : '')); });
      page.setDefaultTimeout(T);
      const t0 = Date.now();
      await page.goto(base + 'index.html' + query, { waitUntil: 'load', timeout: T * 2 });
      let ok = true;
      if (waitUi) ok = await page.waitForFunction((ui) => window.__game && document.querySelector('#app') && document.querySelector('#app').getAttribute('data-ui') === ui, waitUi, { timeout: T }).then(() => true, () => false);
      page.__bootMs = Date.now() - t0; page.__ok = ok;
      return page;
    }
    // Every page.evaluate is raced against a timer: a hung page cannot stall the audit.
    const ev = (page, fn, arg) => { let tm; return Promise.race([page.evaluate(fn, arg), new Promise((res) => { tm = setTimeout(() => res({ __err: `page.evaluate timed out after ${T * 3} ms` }), T * 3); })]).catch((e) => ({ __err: String(e.message || e).slice(0, 300) })).finally(() => clearTimeout(tm)); };
    const G = (page, expr) => ev(page, (x) => { try { return new Function('return (' + x + ')')(); } catch (e) { return { __err: e.message }; } }, expr);
    const waitUi = (page, ui, t = T) => page.waitForFunction((u) => document.querySelector('#app')?.getAttribute('data-ui') === u, ui, { timeout: t }).then(() => true, () => false);

    // ---------------------------------------------------------------- page + hooks (test mode, fresh)
    const ctxA = await newCtx(); const pA = await open(ctxA, '?test=1');
    await bcheck(B('page.boot', '§6, §11.2', 'first load opens straight into the show 1 build (#app[data-ui=BUILD], window.__game) with no page errors', 'core'), async () => {
      const f = [], w = [];
      if (!pA.__ok) f.push(`data-ui never became BUILD within ${T} ms (data-ui = ${await ev(pA, () => document.querySelector('#app')?.getAttribute('data-ui'))})`);
      for (const e of ctxA.__rec.errors) f.push('pageerror: ' + e);
      for (const e of ctxA.__rec.console) w.push('console.error: ' + e);
      return verdict(f, w, `BUILD in ${pA.__bootMs} ms`);
    });
    const boot = await ev(pA, () => {
      const g = typeof GAME !== 'undefined' ? GAME : null; const st = g && g.state;
      return { seed: st && st.seed, kit: st && st.kit, show: st && st.show, heads: st && st.headliners, firstRun: st && st.firstRun, ui: g && g.ui, flags: g && g.flags };
    });
    await bcheck(B('page.globals', 'CONTRACT', 'one global per module with the contracted API (OohSim, OOH, AUDIO, FX, GAME, UI_*)', 'lead'), async () => {
      const r = await ev(pA, () => {
        const miss = []; const need = {
          OOH: ['createState', 'step', 'legalActions', 'resolveShow', 'DATA'], AUDIO: ['unlock', 'onEvent', 'ui', 'setSettings', 'setPhase', 'setCrowd', 'suspend', 'resume'],
          FX: ['init', 'resize', 'setOptions', 'setScene', 'play', 'update', 'render', 'pictogram', 'finale', 'dim', 'critical', 'stats'],
          GAME: ['boot', 'dispatch', 'undo', 'canUndo', 'light', 'fastForward', 'skip', 'newRun', 'abandon', 'enterAfterparty', 'setSetting', 'setMeta', 'saveNow', 'exportSave', 'importSave', 'resetProgress', 'open', 'close', 'top', 'announce', 'toast', 'on', 'emit', 'onKey', 'haptic', 'state', 'meta', 'settings', 'ui', 'flags', 'preview', 'reducedMotion'],
          UI_PLAY: ['init'], UI_PANELS: ['init'], UI_END: ['init'], UI_MENUS: ['init'] };
        const get = (n) => { try { return new Function('return typeof ' + n + ' !== "undefined" ? ' + n + ' : undefined')(); } catch { return undefined; } };
        if (typeof get('OohSim') !== 'function') miss.push('OohSim (function)');
        for (const [g, keys] of Object.entries(need)) { const o = get(g); if (!o) { miss.push(g + ' (global missing)'); continue; } for (const k of keys) if (!(k in o)) miss.push(g + '.' + k); }
        const S = get('GAME') && get('GAME').settings; if (S) for (const k of ['sound', 'soundVol', 'music', 'musicVol', 'reducedMotion', 'highContrast', 'speed', 'instant', 'haptics', 'chips', 'fairWeather', 'mood']) if (!(k in S)) miss.push('GAME.settings.' + k);
        return miss;
      });
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      const f = r.filter((x) => !/^GAME\.(fastForward|skip|enterAfterparty|abandon)$/.test(x)); const w = r.filter((x) => /^GAME\.(fastForward|skip|enterAfterparty|abandon)$/.test(x));
      return verdict(f, w, 'all globals and methods present');
    });
    await bcheck(B('page.requests', '§11.2', 'no network requests other than Google Fonts', 'lead'), async () => verdict(ctxA.__rec.external.map((u) => 'external request: ' + u), [], `fonts requested: ${ctxA.__rec.fonts.length ? 'yes' : 'no'}`));
    await bcheck(B('page.rest', '§6, §11.2', 'at rest: show 1 build fully drawn (target 100, 3-shell rack, Light the fuse, Headwind poster, sky painted)', 'play'), async () => {
      const f = [], w = [];
      if (boot.seed !== 'first-show') f.push(`first-ever run seed ${short(boot.seed)} (spec §6: 'first-show')`);
      if (boot.kit !== 'apprentice') f.push(`first-ever run kit ${boot.kit}`);
      if (!boot.heads || boot.heads[0] !== 'headwind') f.push(`F1 Headliner ${boot.heads && boot.heads[0]} (spec: Headwind in the first-ever run)`);
      if (boot.firstRun !== true) w.push(`state.firstRun = ${boot.firstRun}`);
      const r = await ev(pA, () => {
        const H = window.__auditH; const q = (s) => document.querySelector(s); const txt = (s) => (q(s) ? q(s).textContent.replace(/\s+/g, ' ').trim() : null);
        const tubes = [...document.querySelectorAll('button[data-tube]')].filter(H.vis);
        const cv = q('canvas#sky'); let colours = 0;
        try { const c2 = document.createElement('canvas'); c2.width = 64; c2.height = 64; const x = c2.getContext('2d'); x.drawImage(cv, 0, 0, 64, 64); const d = x.getImageData(0, 0, 64, 64).data; const set = new Set(); for (let i = 0; i < d.length; i += 16) set.add((d[i] >> 3) + ',' + (d[i + 1] >> 3) + ',' + (d[i + 2] >> 3)); colours = set.size; } catch (e) { colours = -1; }
        return { target: txt('#hud-target'), show: txt('#hud-show'), coins: txt('#hud-coins'), crowd: txt('#hud-crowd'), fire: txt('#fire'), fireVis: H.vis(q('#fire')), tubes: tubes.length, tubeLabels: tubes.map((t) => t.getAttribute('aria-label')), cv: cv ? [cv.clientWidth, cv.clientHeight, cv.width, cv.height] : null, colours, body: document.body.innerText.replace(/\s+/g, ' ').slice(0, 4000), cards: [...document.querySelectorAll('button[data-card]')].filter(H.vis).length };
      });
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      if (!/\b100\b/.test(r.target || '')) f.push(`#hud-target = ${short(r.target)} (spec "Target 100")`);
      if (!/Target/i.test(r.target || '') && !/Target 100/.test(r.body)) w.push('the word "Target" is not shown with the target');
      if (!/\$\s?4\b/.test(r.coins || '')) f.push(`#hud-coins = ${short(r.coins)} (Apprentice starts with $4)`);
      if (!/\b0\b/.test(r.crowd || '')) w.push(`#hud-crowd = ${short(r.crowd)}`);
      if (!r.fireVis || !/Light the fuse/i.test(r.fire || '')) f.push(`#fire = ${short(r.fire)}, visible ${r.fireVis} (spec "Light the fuse")`);
      if (r.tubes !== 4) f.push(`${r.tubes} visible button[data-tube] (Apprentice: 4 tubes, T4 empty)`);
      if (!/Headwind/.test(r.body)) f.push('no "Headwind" poster chip visible at show 1 (spec §6: posted since load)');
      if (!r.cv || r.cv[0] < 50 || r.cv[1] < 50) f.push(`canvas#sky size ${r.cv}`);
      else if (r.cv[2] !== Math.round(r.cv[0] * 1) && r.cv[2] !== Math.round(r.cv[0] * Math.min(2, 1))) w.push(`canvas backing ${r.cv[2]}×${r.cv[3]} for CSS ${r.cv[0]}×${r.cv[1]} at DPR 1`);
      if (r.colours >= 0 && r.colours < 3) f.push(`sky canvas looks blank (${r.colours} distinct colours)`);
      if (r.cards) w.push(`${r.cards} shop cards at show 1 (Apprentice has no shop before show 1)`);
      return verdict(f, w, `target "${r.target}", ${r.tubes} tubes, sky ${r.colours} colours`);
    });
    await bcheck(B('page.dom', 'CONTRACT', 'contracted DOM hooks in the live page (data-tube, data-crate, data-act, HUD ids, overlays)', 'play'), async () => {
      const r = await ev(pA, () => {
        const q = (s) => document.querySelector(s); const out = { miss: [], later: [] };
        for (const s of ['#app[data-ui]', 'canvas#sky', '#fire', '#hud-coins', '#hud-crowd', '#hud-target', '#hud-show', '#end', '#pause-menu', '#settings', '#logbook', '#help', '#inspect', '#live-polite', '#live-assertive', 'button[data-crate="0"]', 'button[data-crate="1"]', 'button[data-tube="0"]', '[data-act="undo"]', '[data-act="match"]', '[data-act="restore"]', '[data-act="rehearse"]', '[data-act="pause"]']) if (!q(s)) out.miss.push(s);
        for (const s of ['[data-act="reroll"]', '[data-act="buyTube"]', '[data-act="buyRig"]', '[data-act="sponsor"]', '#run-it-back']) if (!q(s)) out.later.push(s);
        const tubeBtn = [...document.querySelectorAll('[data-tube]')].filter((e) => e.tagName !== 'BUTTON').map((e) => e.tagName); if (tubeBtn.length) out.miss.push('data-tube on non-button: ' + tubeBtn.join(','));
        return out;
      });
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      return verdict(r.miss, [], 'all present' + (r.later.length ? ` (${r.later.join(', ')} appear later: see page.dom-f2 / end.screen)` : ''));
    });

    // hooks
    const HK = (id, title, fn) => bcheck(B('hooks.' + id, '§11.6', title, 'core'), fn);
    await HK('present', 'window.__game exposes every §11.6 hook with the right type', async () => {
      const r = await ev(pA, () => { const g = window.__game || {}; const want = { reset: 'function', act: 'function', step: 'function', state: 'function', legalActions: 'function', events: 'function', hash: 'function', setPaused: 'function', config: 'object', resolve: 'function', preview: 'function', mood: 'function', shapley: 'function', skipAnimations: 'function', runBots: 'function', meta: 'function', setMeta: 'function' }; return Object.entries(want).filter(([k, t]) => typeof g[k] !== t).map(([k, t]) => `${k}: ${typeof g[k]} (want ${t})`); });
      return verdict(r.__err ? [r.__err] : r, [], '17 hooks');
    });
    await HK('config', '__game.config = {version, TARGETS, SHELLS, FUSIONS, RIGS, HEADLINERS, KITS, RENOWN, MILESTONES} matching the spec', async () => {
      const r = await ev(pA, () => { const c = window.__game.config; return c ? { keys: Object.keys(c), TARGETS: c.TARGETS, nS: Object.keys(c.SHELLS || {}).length, nF: Object.keys(c.FUSIONS || {}).length, nR: Object.keys(c.RIGS || {}).length, nH: Object.keys(c.HEADLINERS || {}).length, nK: Object.keys(c.KITS || {}).length, nRe: (c.RENOWN || []).length, nM: Object.keys(c.MILESTONES || {}).length, v: c.version } : null; });
      if (!r || r.__err) return { status: 'FAIL', summary: r ? r.__err : 'config missing' };
      const f = []; for (const k of ['version', 'TARGETS', 'SHELLS', 'FUSIONS', 'RIGS', 'HEADLINERS', 'KITS', 'RENOWN', 'MILESTONES']) if (!r.keys.includes(k)) f.push(`config.${k} missing`);
      if (!deepEq(r.TARGETS, spec.targets)) f.push(`config.TARGETS ≠ §5.1`);
      const counts = [['SHELLS', r.nS, 34], ['FUSIONS', r.nF, 12], ['RIGS', r.nR, 5], ['HEADLINERS', r.nH, 13], ['KITS', r.nK, 5], ['MILESTONES', r.nM, 10]];
      for (const [k, got, want] of counts) if (got !== want) f.push(`config.${k}: ${got} entries (want ${want})`);
      if (r.nRe < 8) f.push(`config.RENOWN: ${r.nRe} entries`);
      return verdict(f, [], `version ${r.v}`);
    });
    await HK('reset-state', 'reset(seed) starts a fresh run; state() returns an independent clone; legalActions() lists light first', async () => {
      const r = await ev(pA, () => { const g = window.__game; g.reset('audit-hooks'); const s1 = g.state(); s1.coins = 999; s1.tubes.length = 0; const s2 = g.state(); const la = g.legalActions(); return { seed: s2.seed, show: s2.show, coins: s2.coins, tubes: s2.tubes.length, la0: la[0] && la[0].type, n: la.length, ui: document.querySelector('#app').getAttribute('data-ui') }; });
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      const f = []; if (r.seed !== 'audit-hooks') f.push(`state().seed = ${r.seed}`); if (r.show !== 0) f.push(`show ${r.show}`); if (r.coins === 999 || r.tubes === 0) f.push('state() is not a clone (mutation leaked)'); if (r.la0 !== 'light') f.push(`legalActions()[0] = ${r.la0}`); if (r.ui !== 'BUILD') f.push(`data-ui ${r.ui} after reset`);
      return verdict(f, [], `${r.n} legal actions`);
    });
    await HK('act-events', 'act(action) returns the §9 events; illegal → [{type:"illegal"}]; events() drains the queue; step(n) advances in test mode', async () => {
      const r = await ev(pA, () => { const g = window.__game; g.reset('audit-act'); g.events(); const bad = g.act({ type: 'buyTube' }); const e = g.act({ type: 'light' }); const q1 = g.events(); const q2 = g.events(); const st = g.step(3); return { bad, types: (e || []).map((x) => x.type), q1: (q1 || []).length, q2: (q2 || []).length, show: g.state().show, st, ui: document.querySelector('#app').getAttribute('data-ui') }; });
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      const f = [], w = [];
      if (!Array.isArray(r.bad) || !r.bad.length || r.bad[0].type !== 'illegal') f.push(`act({type:'buyTube'}) in F1 → ${short(r.bad)}`);
      for (const t of ['fuseLit', 'launch', 'burst', 'applause', 'payout']) if (!r.types.includes(t)) f.push(`act light: no ${t} event (got ${r.types.slice(0, 12).join(',')}…)`);
      if (r.show !== 1) f.push(`show after act light = ${r.show}`);
      if (r.q1 === 0) w.push('events() returned nothing after act (queue not filled by act?)'); if (r.q2 !== 0) f.push(`events() did not drain (${r.q2} on second call)`);
      if (typeof r.st !== 'number') f.push(`step(3) in test mode returned ${short(r.st)}`);
      if (r.ui === 'RESOLVING') f.push('still RESOLVING after act light in test mode');
      return verdict(f, w, `${r.types.length} events; ui ${r.ui}`);
    });
    await HK('determinism', 'hash(): same seed + same actions → same hash; reset(seed) reproduces', async () => {
      const r = await ev(pA, () => { const g = window.__game; const run = () => { g.reset('audit-det'); const hs = [g.hash()]; for (let i = 0; i < 6; i++) { const la = g.legalActions(); const a = la[(i * 7) % la.length]; g.act(a); hs.push(g.hash()); } return hs; }; return [run(), run()]; });
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      const f = []; if (!deepEq(r[0], r[1])) f.push(`hash sequences differ: ${r[0].join(',')} vs ${r[1].join(',')}`); if (!/^[0-9a-f]+$/i.test(String(r[0][0]))) f.push(`hash() = ${short(r[0][0])} (not hex)`);
      return verdict(f, [], `final hash ${r[0][6]}`);
    });
    await HK('resolve', 'resolve(tubes, ctx) reproduces §11.8 goldens in the page', async () => {
      const cases = spec.goldens.filter((g) => [1, 6, 9, 20, 24, 27].includes(g.n)).flatMap((g) => g.cases).map((c) => ({ label: c.label, tubes: mkTubes(c.shells, c.rigs), rules: c.rules, crowd: c.crowd, fav: c.fav, want: c.applause }));
      const r = await ev(pA, (cs) => cs.map((c) => { const g = window.__game; let fav = c.fav; if (fav == null && c.rules.includes('rival')) fav = OOH.favourite(c.tubes, c.crowd); const x = g.resolve(c.tubes, { rules: c.rules, crowd: c.crowd, fav }); return { label: c.label, got: x && x.applause, want: c.want }; }), cases);
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      return verdict(r.filter((x) => x.got !== x.want).map((x) => `${x.label}: ${x.got} ≠ ${x.want}`), [], `${r.length} cases`);
    });
    await HK('preview-mood-shapley', 'preview() chips, mood() bucket, shapley(i) sums to that show\'s Applause, skipAnimations, setPaused', async () => {
      const r = await ev(pA, () => { const g = window.__game; g.reset('audit-shap'); const pv = g.preview(); const m = g.mood(); g.act({ type: 'light' }); const st = g.state(); const h = st.runStats.history[0]; const sh = g.shapley(0); const sk = g.skipAnimations(true); const ps = g.setPaused(true); const ps2 = g.setPaused(false); return { pv: Array.isArray(pv) ? pv.length : typeof pv, pvTxt: JSON.stringify(pv).slice(0, 2000), m, A: h && h.applause, sh, sk }; });
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      const f = [], w = [];
      if (typeof r.pv !== 'number') f.push(`preview() = ${r.pv}`); if (/"(applause|total|score)"\s*:/i.test(r.pvTxt)) f.push('preview() exposes a total');
      if (!['restless', 'hopeful', 'eager'].includes(r.m)) f.push(`mood() = ${short(r.m)}`);
      const vals = []; walkNums(r.sh, (v) => vals.push(v)); const sum = vals.reduce((a, b) => a + b, 0);
      if (!r.sh) f.push('shapley(0) returned nothing'); else if (Math.abs(sum - 1) <= 1e-6) w.push(`shapley(0) returns shares summing to 1 (Applause ${r.A}); §11.7 says results sum to the Applause — see sim.invariants`); else if (Math.abs(sum - r.A) > 1e-6 * Math.max(1, r.A)) f.push(`shapley(0) sums to ${sum}, Applause ${r.A}`);
      if (r.sk !== true) w.push(`skipAnimations(true) returned ${short(r.sk)}`);
      return verdict(f, w, `mood ${r.m}, shapley Σ ${sum}`);
    });
    await HK('meta', 'meta() returns the §7.5 meta; setMeta(obj) merges', async () => {
      const r = await ev(pA, () => { const g = window.__game; const m0 = g.meta(); g.setMeta({ seenTips: [...(m0.seenTips || []), 't_audit'] }); const m1 = g.meta(); g.setMeta({ seenTips: m0.seenTips || [] }); return { keys: Object.keys(m0), tips: m1.seenTips }; });
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      const f = []; for (const k of ['runs', 'wins', 'unlocked', 'progress', 'renown', 'kit', 'seenTips', 'codex', 'records', 'posters']) if (!r.keys.includes(k)) f.push(`meta().${k} missing`);
      if (!(r.tips || []).includes('t_audit')) f.push('setMeta({seenTips}) did not apply');
      return verdict(f, [], r.keys.join(','));
    });
    await HK('runBots', 'runBots({bot, n}) resolves with a summary (Worker)', async () => {
      const r = await ev(pA, (t) => Promise.race([Promise.resolve(window.__game.runBots({ bot: 'greedy', n: 3 })).then((s) => ({ s })), new Promise((res) => setTimeout(() => res({ timeout: true }), t))]), T * 2);
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      if (r.timeout) return { status: 'FAIL', summary: `no result within ${T * 2} ms` };
      return isObj(r.s) ? { status: 'PASS', summary: short(r.s, 120) } : { status: 'FAIL', summary: `returned ${short(r.s)}` };
    });

    // ---------------------------------------------------------------- UI: first run flow in the same test page
    const U = (id, sp, title, owner, fn) => bcheck(B('ui.' + id, sp, title, owner), fn);
    const pU = await open(await newCtx(), '?test=1');
    await U('tube-labels', '§13', 'tube aria-labels: "Tube 1: Willow, Gold triangle, star 1, Hang 3, …, fires 1st of 3, sees 0"', 'play', async () => {
      const r = await ev(pU, () => [...document.querySelectorAll('button[data-tube]')].filter(window.__auditH.vis).map((b) => b.getAttribute('aria-label') || ''));
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      const f = [], w = []; const t1 = r[0] || '';
      if (!/^Tube 1: Willow, Gold triangle, star 1, Hang 3/.test(t1)) f.push(`tube 1 label ${short(t1, 140)}`);
      if (!/fires 1st of 3/.test(t1)) w.push(`tube 1 label lacks "fires 1st of 3": ${short(t1, 140)}`);
      if (!/sees 0/.test(t1)) w.push(`tube 1 label lacks "sees 0"`);
      if (!/^Tube 2: Peony, Red circle, star 1, Hang 1/.test(r[1] || '')) f.push(`tube 2 label ${short(r[1], 140)}`);
      if (!/^Tube 4: /.test(r[3] || '')) f.push(`tube 4 label ${short(r[3], 140)}`);
      return verdict(f, w, short(t1, 100));
    });
    await U('tools', '§8.1, §2.5, §13', 'show 1 build: Match disabled (no permuting rule), Restore disabled (no last order), Undo disabled; tools have aria-labels; #live-polite build line', 'play', async () => {
      const r = await ev(pU, () => { const q = (s) => document.querySelector(s); const dis = (e) => !!e && (e.disabled || e.getAttribute('aria-disabled') === 'true'); return { match: dis(q('[data-act="match"]')), restore: dis(q('[data-act="restore"]')), undo: dis(q('[data-act="undo"]')), labels: ['undo', 'match', 'restore', 'rehearse', 'pause'].map((a) => [a, q(`[data-act="${a}"]`)?.getAttribute('aria-label') || q(`[data-act="${a}"]`)?.textContent.trim() || '']), live: q('#live-polite')?.textContent || '' }; });
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      const f = [], w = [];
      if (!r.match) f.push('Match enabled at show 1 (spec: disabled unless tonight\'s rule permutes the fuse)');
      if (!r.restore) w.push('Restore enabled at show 1 (no lastOrder exists yet, the action is illegal)');
      if (!r.undo) w.push('Undo enabled with an empty undo stack');
      for (const [a, l] of r.labels) if (!l) f.push(`[data-act="${a}"] has no aria-label`);
      if (!/^Show 1 of 24, Spring Lanterns Twilight\. Target 100\./.test(r.live.trim())) w.push(`#live-polite at the show 1 build: ${short(r.live.trim(), 140)} (§13: "Show 1 of 24, Spring Lanterns Twilight. Target 100. …")`);
      return verdict(f, w, 'tool states ok');
    });
    await U('fire', '§6, §8.1', 'Light the fuse → resolution → next build: $8, Crowd 1, show-2 shop = Chrysanthemum, Palm, Comet at $3', 'play', async () => {
      const f = [], w = [];
      await pU.click('#fire', { timeout: T }).catch((e) => f.push('click #fire: ' + e.message.split('\n')[0]));
      await pU.waitForFunction(() => window.__game.state().show === 1 && ['BUILD', 'RESULT'].includes(document.querySelector('#app').getAttribute('data-ui')), null, { timeout: T }).catch(() => f.push('did not reach the show 2 build'));
      const r = await ev(pU, () => ({ ui: document.querySelector('#app').getAttribute('data-ui'), coins: document.querySelector('#hud-coins')?.textContent.trim(), crowd: document.querySelector('#hud-crowd')?.textContent.trim(), target: document.querySelector('#hud-target')?.textContent.trim(), cards: [...document.querySelectorAll('button[data-card]')].map((b) => (b.getAttribute('aria-label') || '') + ' | ' + b.textContent.replace(/\s+/g, ' ').trim()), live: document.querySelector('#live-polite')?.textContent }));
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      if (!/\$\s?8\b/.test(r.coins || '')) f.push(`#hud-coins = ${short(r.coins)} (spec $8)`);
      if (!/\b1\b/.test(r.crowd || '')) f.push(`#hud-crowd = ${short(r.crowd)} (spec 1)`);
      if (!/130/.test(r.target || '')) f.push(`#hud-target = ${short(r.target)} (spec 130)`);
      const want = [/Chrysanthemum/, /Palm/, /Comet/]; want.forEach((re, i) => { if (!re.test(r.cards[i] || '')) f.push(`card ${i}: ${short(r.cards[i], 120)} (spec ${re.source})`); if (r.cards[i] && !/\$\s?3/.test(r.cards[i])) w.push(`card ${i} shows no $3 price: ${short(r.cards[i], 120)}`); });
      if (/Chrysanthemum/.test(r.cards[0] || '') && !/Green/.test(r.cards[0])) w.push('card 0 aria-label does not name its colour (Green)');
      return verdict(f, w, `ui ${r.ui}, ${r.coins}, cards ${r.cards.length}`);
    });
    await U('buy-undo', 'CONTRACT, §2.5, §8.3', 'tap card then tap tube buys into that tube; Undo reverts', 'play', async () => {
      const f = [];
      const before = await ev(pU, () => window.__game.state());
      await pU.click('button[data-card="1"]', { timeout: T }).catch((e) => f.push('click card 1: ' + e.message.split('\n')[0]));
      await pU.click('button[data-tube="3"]', { timeout: T }).catch((e) => f.push('click tube 3: ' + e.message.split('\n')[0]));
      const mid = await ev(pU, () => window.__game.state());
      const t3 = mid.tubes && mid.tubes[3] && mid.tubes[3].shell;
      if (!t3 || t3.id !== 'palm') f.push(`tube 4 after tap card 2 → tap tube 4: ${short(t3)} (expected Palm)`);
      if (before.coins - mid.coins !== 3) f.push(`coins ${before.coins} → ${mid.coins} (expected −3)`);
      await pU.click('[data-act="undo"]', { timeout: T }).catch((e) => f.push('click undo: ' + e.message.split('\n')[0]));
      const after = await ev(pU, () => window.__game.state());
      if (after.tubes && after.tubes[3] && after.tubes[3].shell) f.push('Undo did not remove the bought Palm');
      if (after.coins !== before.coins) f.push(`Undo left coins at ${after.coins} (before ${before.coins})`);
      return verdict(f, [], 'buy + undo ok');
    });
    await U('keys', '§13', 'keys: P pause, Esc closes, L Logbook, ? Help, F lights the fuse, 1 selects card 1', 'menus', async () => {
      const f = [];
      const vis = (sel) => ev(pU, (s) => window.__auditH.vis(document.querySelector(s)), sel);
      const top = () => ev(pU, () => (typeof GAME !== 'undefined' && GAME.top ? GAME.top() : null));
      await pU.keyboard.press('p'); if (!(await vis('#pause-menu'))) f.push('P: #pause-menu not visible'); if ((await top()) !== 'pause') f.push(`P: top() = ${await top()}`);
      await pU.keyboard.press('Escape'); if (await vis('#pause-menu')) f.push('Esc did not close pause');
      await pU.keyboard.press('Escape'); const esc = await top(); if (esc !== 'pause') f.push(`Esc with no overlay: top() = ${esc} (spec: opens pause)`); await pU.keyboard.press('Escape');
      await pU.keyboard.press('l'); if (!(await vis('#logbook'))) f.push('L: #logbook not visible'); await pU.keyboard.press('Escape');
      await pU.keyboard.press('Shift+Slash'); if (!(await vis('#help'))) f.push('?: #help not visible'); await pU.keyboard.press('Escape');
      await pU.keyboard.press('1'); const sel = await ev(pU, () => { const c = document.querySelector('button[data-card="0"]'); return c ? (c.getAttribute('aria-pressed') || c.getAttribute('aria-selected') || c.className) : null; }); if (!/true|sel|pick|active|held/i.test(String(sel))) f.push(`1: card 1 shows no selected state (${short(sel)})`); await pU.keyboard.press('Escape'); if ((await top()) === 'pause') await pU.keyboard.press('Escape');
      const s0 = (await ev(pU, () => window.__game.state().show)); await pU.keyboard.press('f');
      const moved = await pU.waitForFunction((s) => window.__game.state().show === s + 1, s0, { timeout: T }).then(() => true, () => false); if (!moved) f.push('F did not light the fuse');
      await waitUi(pU, 'BUILD');
      return verdict(f, [], 'P, Esc, L, ?, 1, F');
    });
    await U('help', '§8.3, §1', 'Help holds the 3-line rules card, the glossary (19 terms) and the key map', 'menus', async () => {
      await ev(pU, () => GAME.open('help')); const t = await ev(pU, () => document.querySelector('#help')?.innerText || ''); await ev(pU, () => GAME.close());
      const f = [], w = []; const T2 = normText(t);
      spec.rulesCard.forEach((l, i) => { if (!T2.includes(normText(strip(l)).slice(0, 60))) f.push(`rules card line ${i + 1} missing: ${short(strip(l), 80)}`); });
      for (const g of spec.glossary) { const bare = normText(g.meaning.replace(/\s*\(§[\d.]+\)/g, '')).replace(/\.$/, ''); if (!T2.includes(normText(g.term).replace(/^♛ /, ''))) f.push(`glossary term missing: ${g.term}`); else if (!T2.includes(bare.slice(0, 40))) w.push(`glossary meaning for ${g.term} not verbatim: spec ${short(g.meaning, 80)}`); }
      for (const k of ['Match', 'Rehearse', 'Undo', 'Reroll']) if (!T2.includes(k)) w.push(`key map lacks ${k}`);
      return verdict(f, w, 'rules card + glossary present');
    });
    await U('settings', '§8.3, §7.5', 'Settings lists every §8.3 control; Export/Import use an in-page text field; Reset is a 2-tap', 'menus', async () => {
      await ev(pU, () => GAME.open('settings')); const r = await ev(pU, () => ({ t: document.querySelector('#settings')?.innerText || '', inputs: document.querySelectorAll('#settings textarea, #settings input[type=text]').length })); await ev(pU, () => GAME.close());
      const f = [], w = []; const want = [['Sound', /Sound/i], ['Music', /Music/i], ['Reduced motion', /Reduced motion/i], ['High contrast', /High contrast/i], ['Show speed 50/75/100', /50\s*%?[\s\S]*75\s*%?[\s\S]*100\s*%?/], ['Instant results', /Instant/i], ['Chips', /Chips/i], ['Crowd mood', /mood/i], ['Fair Weather', /Fair Weather/i], ['Export', /Export/i], ['Import', /Import/i], ['Reset progress', /Reset/i]];
      for (const [n, re] of want) if (!re.test(r.t)) f.push(`${n} missing`);
      if (!/Haptics/i.test(r.t)) w.push('Haptics not shown (only if navigator.vibrate exists — headless Chromium has it)');
      if (!r.inputs) w.push('no in-page text field for Export/Import visible without interaction');
      return verdict(f, w, 'all controls present');
    });
    await U('no-dialogs', '§11.2', 'no alert/confirm/prompt called during the UI run', 'core', async () => { const d = await ev(pU, () => window.__audit.dialogs); return verdict(d.__err ? [d.__err] : d, [], 'none'); });

    // ---------------------------------------------------------------- a11y basics (deeper audit: tools/audit/a11y.mjs)
    await bcheck(B('a11y.basics', '§13', 'live regions announce build/result; buttons have names; focus ring visible; high contrast sets data-contrast and tokens', 'play'), async () => {
      const f = [], w = [];
      const r = await ev(pU, () => { const H = window.__auditH; const pol = document.querySelector('#live-polite'); const as = document.querySelector('#live-assertive'); const noname = [...document.querySelectorAll('#app button')].filter(H.vis).filter((b) => !(b.getAttribute('aria-label') || b.textContent.trim() || b.getAttribute('title') || b.getAttribute('aria-labelledby'))).map(H.desc);
        GAME.setSetting('highContrast', true); const hc = document.documentElement.getAttribute('data-contrast'); const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); GAME.setSetting('highContrast', false);
        return { pol: pol && pol.getAttribute('aria-live'), as: as && as.getAttribute('aria-live'), polTxt: pol && pol.textContent, noname, hc, bg }; });
      if (r.__err) return { status: 'FAIL', summary: r.__err };
      if (r.pol !== 'polite') f.push(`#live-polite aria-live=${r.pol}`); if (r.as !== 'assertive') f.push(`#live-assertive aria-live=${r.as}`);
      if (!/Show \d+ of 24|Applause|Target/i.test(r.polTxt || '')) w.push(`#live-polite text after build/result: ${short(r.polTxt, 120)}`);
      for (const n of r.noname) f.push(`button without an accessible name: ${n}`);
      if (r.hc !== 'high') f.push(`highContrast on → data-contrast=${r.hc}`); if (!/^#0{6}$|^#000$|black/i.test(r.bg)) f.push(`high contrast --bg = ${r.bg} (spec #000000)`);
      await pU.keyboard.press('Tab'); await pU.keyboard.press('Tab');
      const fo = await ev(pU, () => { const a = document.activeElement; if (!a || a === document.body) return null; const cs = getComputedStyle(a); return { el: window.__auditH.desc(a), ow: cs.outlineWidth, os: cs.outlineStyle, oc: cs.outlineColor, oo: cs.outlineOffset, bs: cs.boxShadow }; });
      if (!fo) w.push('Tab does not move focus into the page');
      else if ((fo.os === 'none' || fo.ow === '0px') && (!fo.bs || fo.bs === 'none')) f.push(`focused ${fo.el} has no visible focus ring`);
      else if (fo.os !== 'none' && (fo.ow !== '3px' || fo.oo !== '2px')) w.push(`focus ring on ${fo.el}: ${fo.ow} ${fo.os} offset ${fo.oo} (spec 3 px, 2 px offset, --focus)`);
      return verdict(f, w, 'live regions, names, focus, contrast');
    });

    // ---------------------------------------------------------------- URL flags
    const FL = (id, title, fn, owner = 'core') => bcheck(B('flags.' + id, '§11.6', title, owner), fn);
    await FL('test', '?test=1: no rAF loop (instant, deterministic)', async () => {
      const p1 = await open(await newCtx(), '?test=1&fresh=1'); const a = await ev(p1, () => window.__audit.raf); await p1.waitForTimeout(600); const b = await ev(p1, () => window.__audit.raf);
      const p2 = await open(await newCtx(), '?fresh=1'); const c = await ev(p2, () => window.__audit.raf); await p2.waitForTimeout(600); const d = await ev(p2, () => window.__audit.raf);
      const f = []; if (b - a > 3) f.push(`${b - a} rAF calls in 600 ms with ?test=1`); if (d - c < 5) f.push(`only ${d - c} rAF calls in 600 ms without ?test=1 (loop not running?)`);
      const fl = await ev(p1, () => GAME.flags && GAME.flags.test); if (fl !== true) f.push(`GAME.flags.test = ${fl}`);
      await p1.close(); await p2.close();
      return verdict(f, [], `test: ${b - a} rAF / 600 ms; normal: ${d - c}`);
    });
    await FL('seed', '?seed=abc fixes the run seed', async () => { const p = await open(await newCtx(), '?seed=abc&test=1'); const s = await ev(p, () => window.__game.state().seed); await p.close(); return s === 'abc' ? { status: 'PASS', summary: 'seed abc' } : { status: 'FAIL', summary: `state().seed = ${short(s)}` }; });
    await FL('kit', '?kit= sets the starting kit', async () => {
      const f = [], w = []; const p = await open(await newCtx(), '?kit=salvo&unlock=all&test=1'); const k = await ev(p, () => window.__game.state().kit); if (k !== 'salvo') f.push(`?kit=salvo&unlock=all → kit ${k}`); await p.close();
      const p2 = await open(await newCtx(), '?kit=market&test=1'); const k2 = await ev(p2, () => window.__game.state().kit); if (k2 !== 'market') w.push(`?kit=market without unlock → kit ${k2} (locked kits may be refused)`); await p2.close();
      return verdict(f, w, `salvo → ${k}`);
    });
    await FL('renown', '?renown= sets the Renown level', async () => { const p = await open(await newCtx(), '?renown=3&test=1'); const s = await ev(p, () => window.__game.state().renown); await p.close(); return s === 3 ? { status: 'PASS', summary: 'renown 3' } : { status: 'FAIL', summary: `state().renown = ${short(s)}` }; });
    await FL('unlock', '?unlock=all unlocks every milestone reward (all 34 shells in the pool)', async () => {
      const p = await open(await newCtx(), '?unlock=all&test=1'); const r = await ev(p, () => ({ u: window.__game.state().unlocked, m: window.__game.meta().unlocked })); await p.close();
      const need = spec.milestones.filter((m) => m.unlockShells.length || m.unlockKits.length).map((m) => m.id); const miss = need.filter((id) => !(r.u || []).includes(id));
      return verdict(miss.length ? [`state().unlocked lacks ${miss.join(', ')} (got ${short(r.u)})`] : [], [], `${(r.u || []).length} unlocked`);
    });
    await FL('debug', '?debug=1 overlay: frame ms, SIM ms, particle + entity counts, hash', async () => {
      const p = await open(await newCtx(), '?debug=1&fresh=1'); await p.waitForTimeout(800);
      const r = await ev(p, () => { const d = document.querySelector('#debug'); const h = window.__game.hash(); const t = d ? d.innerText : ''; return { vis: window.__auditH.vis(d), t, h }; }); await p.close();
      const f = [], w = []; if (!r.vis) f.push('#debug overlay not visible'); if (!/ms/.test(r.t)) f.push(`overlay text lacks ms timings: ${short(r.t, 120)}`); if (!r.t.includes(String(r.h).slice(0, 6))) w.push('overlay does not show the current hash'); if (!/partic/i.test(r.t)) w.push('overlay lacks a particle count');
      return verdict(f, w, short(r.t, 100));
    });
    await FL('sim', '?sim=N&bot=greedy runs bots headless and prints a JSON summary to the console and a <pre>', async () => {
      const ctx = await newCtx(); const msgs = []; const p = await ctx.newPage(); p.on('console', (m) => msgs.push(m.text()));
      await p.goto(base + 'index.html?sim=4&bot=greedy&fresh=1', { timeout: T * 2 }).catch(() => {});
      const done = await p.waitForFunction(() => { const pre = document.querySelector('#sim-out') || document.querySelector('pre'); return pre && /\{/.test(pre.textContent); }, null, { timeout: Math.max(20000, T * 3) }).then(() => true, () => false);
      const pre = await ev(p, () => (document.querySelector('#sim-out') || document.querySelector('pre'))?.textContent || ''); await p.close();
      const f = []; if (!done) f.push('no <pre> with JSON within the timeout');
      let ok = false; for (const m of msgs) { try { const j = JSON.parse(m); if (isObj(j)) ok = true; } catch { /* not JSON */ } } if (!ok) f.push('no JSON summary printed to the console');
      try { JSON.parse(pre); } catch { if (done) f.push('<pre> content is not JSON'); }
      return verdict(f, [], short(pre, 100));
    });

    // ---------------------------------------------------------------- persistence + lifecycle + audio
    const P = (id, sp, title, fn, owner = 'core') => bcheck(B('persist.' + id, sp, title, owner), fn);
    const ctxP = await newCtx(); const pP = await open(ctxP, '?test=1');
    await P('save', '§7.5', "after a light: localStorage['oohxaah.v1'] = {v:1, settings, meta, run:{state, uiSeed}} with the §7.5 fields", async () => {
      await pP.click('#fire', { timeout: T }).catch(() => {}); await pP.waitForFunction(() => window.__game.state().show === 1, null, { timeout: T }).catch(() => {}); await waitUi(pP, 'BUILD');
      const raw = await ev(pP, () => { try { return localStorage.getItem('oohxaah.v1'); } catch (e) { return 'ERR ' + e.message; } });
      const f = [], w = []; let j; try { j = JSON.parse(raw); } catch { return { status: 'FAIL', summary: `stored value not JSON: ${short(raw)}` }; }
      if (j.v !== 1) f.push(`v = ${j.v}`);
      const sk = ['sound', 'music', 'musicVol', 'reducedMotion', 'highContrast', 'speed', 'instant', 'haptics', 'chips', 'mood', 'fairWeather']; for (const k of sk) if (!(k in (j.settings || {}))) f.push(`settings.${k} missing`);
      if (!('sfxVol' in (j.settings || {})) && !('soundVol' in (j.settings || {}))) f.push('settings.sfxVol missing'); else if (!('sfxVol' in j.settings)) w.push('settings uses soundVol; §7.5 schema names it sfxVol (CONTRACT uses soundVol)');
      const mk = ['runs', 'wins', 'unlocked', 'progress', 'renown', 'kit', 'keepsake', 'seenTips', 'codex', 'records', 'posters']; for (const k of mk) if (!(k in (j.meta || {}))) f.push(`meta.${k} missing`);
      if (j.meta && j.meta.renown && !('max' in j.meta.renown && 'selected' in j.meta.renown)) f.push('meta.renown lacks {max, selected}');
      if (j.meta && j.meta.codex) for (const k of ['shells', 'fusions', 'headliners', 'rigs']) if (!(k in j.meta.codex)) f.push(`meta.codex.${k} missing`);
      if (j.meta && j.meta.records) for (const k of ['bestShow', 'bestRun', 'fastestWinMs', 'bestAfterparty', 'winsByKit']) if (!(k in j.meta.records)) f.push(`meta.records.${k} missing`);
      if (!j.run || !j.run.state) f.push('run.state not saved after light'); else { if (j.run.state.show !== 1) f.push(`saved run.state.show = ${j.run.state.show}`); if (!Array.isArray(j.run.state.rng)) f.push('saved state lacks rng'); if (!('uiSeed' in j.run)) w.push('run.uiSeed missing'); }
      return verdict(f, w, `${raw.length} bytes`);
    });
    await P('restore', '§7.5', 'reload restores the saved run directly into its build (one tap from load)', async () => {
      const h0 = await ev(pP, () => ({ h: window.__game.hash(), s: window.__game.state().seed, show: window.__game.state().show }));
      const p2 = await open(ctxP, '?test=1'); const h1 = await ev(p2, () => ({ h: window.__game.hash(), s: window.__game.state().seed, show: window.__game.state().show, ui: document.querySelector('#app').getAttribute('data-ui') })); await p2.close();
      const f = []; if (h1.s !== h0.s || h1.show !== h0.show) f.push(`after reload: seed ${h1.s} show ${h1.show} (saved ${h0.s} show ${h0.show})`); if (h1.h !== h0.h) f.push(`hash after reload ${h1.h} ≠ ${h0.h}`); if (h1.ui !== 'BUILD') f.push(`data-ui ${h1.ui}`);
      return verdict(f, [], `restored ${h1.s} show ${h1.show + 1}`);
    });
    await P('fresh', '§11.6', '?fresh=1 ignores the stored run and meta', async () => {
      const p2 = await open(ctxP, '?fresh=1&test=1'); const r = await ev(p2, () => ({ s: window.__game.state().seed, show: window.__game.state().show, runs: window.__game.meta().runs })); await p2.close();
      return r.show === 0 ? { status: 'PASS', summary: `seed ${r.s}, show 1` } : { status: 'FAIL', summary: `?fresh=1 opened show ${r.show + 1} of seed ${r.s} (the stored run)` };
    });
    await P('lifecycle', '§11.5', 'visibilitychange → hidden pauses, saves, suspends audio; resume only through "Tap to continue" (normal mode; ?test=1 skips it)', async () => {
      const f = []; const pL = await open(await newCtx(), ''); // a new context has empty storage; ?fresh=1 would disable saving await pL.mouse.click(180, 120); await pL.waitForTimeout(200);
      await ev(pL, () => { localStorage.removeItem('oohxaah.v1'); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
      await pL.waitForTimeout(150);
      const r = await ev(pL, () => { let saved = null; try { saved = localStorage.getItem('oohxaah.v1'); } catch { /* */ } Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); return { saved: !!saved, tc: window.__auditH.vis(document.querySelector('#tap-continue')), top: GAME.top && GAME.top() }; });
      if (!r.saved) f.push('nothing saved on visibilitychange → hidden'); if (!r.tc) f.push(`#tap-continue not visible after hide→show (top ${r.top})`);
      await pL.mouse.click(180, 300); await pL.waitForTimeout(150); const after = await ev(pL, () => window.__auditH.vis(document.querySelector('#tap-continue'))); if (after) f.push('#tap-continue still visible after a tap');
      await pL.close();
      return verdict(f, [], 'pause + save + tap to continue');
    });
    await P('corrupt', '§7.5', 'corrupt or wrong-version storage boots to BUILD with defaults and no errors', async () => {
      const f = [];
      for (const bad of ['{not json', JSON.stringify({ v: 2, settings: 5, meta: 'x', run: { state: 7 } }), JSON.stringify({ v: 1, settings: { speed: 'fast', sound: 'yes' }, meta: { runs: -1, unlocked: 'all', renown: null }, run: { state: { v: 1, seed: 3 } } })]) {
        const ctx = await newCtx({ init: `try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('oohxaah.v1', ${JSON.stringify(bad)}); sessionStorage.setItem('seeded', '1'); } } catch (e) {}` });
        const p = await open(ctx, '?test=1'); if (!p.__ok) f.push(`${short(bad, 60)}: did not reach BUILD`); for (const e of ctx.__rec.errors) f.push(`${short(bad, 40)}: pageerror ${e}`); await p.close();
      }
      return verdict(f, [], '3 bad saves handled');
    });
    await P('no-storage', '§7.5, §11.2', 'boots and plays with no storage at all (localStorage throws)', async () => {
      const ctx = await newCtx({ init: `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('SecurityError: storage disabled'); } });` });
      const p = await open(ctx, '?test=1'); const f = []; if (!p.__ok) f.push('did not reach BUILD'); for (const e of ctx.__rec.errors) f.push('pageerror ' + e);
      if (p.__ok) { await p.click('#fire', { timeout: T }).catch((e) => f.push('fire: ' + e.message.split('\n')[0])); const ok = await p.waitForFunction(() => window.__game.state().show === 1, null, { timeout: T }).then(() => true, () => false); if (!ok) f.push('could not light show 1 without storage'); }
      await p.close(); return verdict(f, [], 'runs without storage');
    });
    await P('audio-gesture', '§11.2, §10', 'audio starts only after a user gesture (no AudioContext before the first pointerdown/keydown)', async () => {
      const ctx = await newCtx(); const p = await open(ctx, '?fresh=1'); await p.waitForTimeout(500);
      const a = await ev(p, () => ({ ...window.__audit, dialogs: undefined })); await p.mouse.click(180, 200); await p.waitForTimeout(300);
      const b = await ev(p, () => ({ ...window.__audit, dialogs: undefined })); await p.close();
      const f = [], w = []; if (a.audioBeforeGesture) f.push(`${a.audioBeforeGesture} AudioContext(s) created before any gesture`);
      if (!b.audioCtx && !b.resume) f.push('no AudioContext created or resumed after the first pointerdown');
      return verdict(f, w, `before: ${a.audioCtx} ctx; after tap: ${b.audioCtx} ctx, ${b.resume} resume`);
    }, 'audio');

    // ---------------------------------------------------------------- end screen
    await bcheck(B('end.screen', '§8.2, §4.12, §13', 'losing a run opens #end: header "The crowd went home: <festival>, show N", lesson, focus on Run it back; R restarts in < 1 s', 'end'), async () => {
      const f = [], w = []; const ctx = await newCtx(); const p = await open(ctx, '?test=1&fresh=1');
      // Two real shows (the Apprentice rack passes 100 and 130), then two empty-rack misses: the charts have data.
      await ev(p, () => { const g = window.__game; g.reset('audit-end'); g.act({ type: 'light' }); g.act({ type: 'light' }); const st = g.state(); for (let i = st.tubes.length - 1; i >= 0; i--) if (st.tubes[i].shell) g.act({ type: 'sell', from: { zone: 'tube', i } }); });
      for (let i = 0; i < 3; i++) { const ph = await ev(p, () => window.__game.state().phase); if (ph !== 'build') break; await ev(p, () => window.__game.act({ type: 'light' })); await p.waitForTimeout(100); }
      const opened = await p.waitForFunction(() => window.__auditH.vis(document.querySelector('#end')), null, { timeout: T }).then(() => true, () => false);
      if (!opened) { const st = await ev(p, () => ({ ph: window.__game.state().phase, ui: document.querySelector('#app').getAttribute('data-ui') })); await p.close(); return { status: 'FAIL', summary: `#end not visible after a lost run (phase ${st.ph}, ui ${st.ui})` }; }
      await p.waitForTimeout(300);
      const r = await ev(p, () => ({ t: document.querySelector('#end').innerText + ' ' + [...document.querySelectorAll('#end [aria-label], #end svg text, #end title')].map((e) => e.getAttribute('aria-label') || e.textContent).join(' '), focus: document.activeElement && document.activeElement.id, rib: window.__auditH.vis(document.querySelector('#run-it-back')), ui: document.querySelector('#app').getAttribute('data-ui'), seed: window.__game.state().seed, live: document.querySelector('#live-assertive')?.textContent }));
      const T2 = normText(r.t);
      if (!/The crowd went home: [A-Za-z' ]+, show \d+/.test(T2)) f.push(`header: ${short(T2.slice(0, 120))} (spec "The crowd went home: Harvest Moon, show 14")`);
      if (!/audit-end/.test(T2)) w.push('seed not shown on the end screen');
      if (!/Apprentice/i.test(T2)) w.push('kit not shown on the end screen');
      if (!/Renown/i.test(T2)) w.push('Renown not shown on the end screen');
      const lessonHit = spec.lessons.some((l) => T2.includes(normText(l.text.split('{')[0]).trim().slice(0, 30)));
      if (!lessonHit) f.push('no §4.12 lesson text found on the end screen');
      if (!/Best show/i.test(T2)) w.push('"Best show" block not found');
      if (!/Run it back/.test(T2)) f.push('no "Run it back" button text');
      for (const [lbl, re] of [['Replay seed', /Replay seed/i], ['Kit', /\bKit\b/], ['Renown', /Renown/], ['Logbook', /Logbook/], ['keepsake "None"', /\bNone\b/], ['Pareto "Crowd" bar', /Crowd/]]) if (!re.test(T2)) w.push(`end screen lacks ${lbl}`);
      if (!/short \(\d+%\) at /.test(T2)) w.push('no near-miss line ("N short (P%) at <festival>", §8.2 item 5)');
      if (!r.rib) f.push('#run-it-back not visible'); if (r.focus !== 'run-it-back') f.push(`focus on #${r.focus} (spec: Run it back)`);
      if (r.ui !== 'END') w.push(`data-ui = ${r.ui} (expected END)`);
      if (!/./.test(r.live || '')) w.push('#live-assertive empty at run end');
      const t0 = Date.now(); await p.keyboard.press('r');
      const back = await p.waitForFunction((s) => document.querySelector('#app').getAttribute('data-ui') === 'BUILD' && window.__game.state().show === 0, r.seed, { timeout: T }).then(() => true, () => false);
      const ms = Date.now() - t0; const s2 = await ev(p, () => window.__game.state().seed);
      if (!back) f.push('R did not start a new run'); else { if (ms > 1000) w.push(`Run it back took ${ms} ms (spec < 1 s)`); if (s2 === r.seed) f.push('Run it back reused the same seed (spec: new random seed)'); }
      if (await ev(p, () => window.__auditH.vis(document.querySelector('#end')))) f.push('#end still visible after Run it back');
      await p.close();
      return verdict(f, w, `restart ${ms} ms`);
    });

    // ---------------------------------------------------------------- layout at the §11.2 sizes (+ scroll mode)
    const sizes = [[360, 740, 'regular'], [360, 640, 'compact'], [375, 548, 'compact'], [360, 500, 'scroll'], [1440, 900, 'desktop']];
    if (OPT.shots !== 'none' && OPT.shots !== true) fs.mkdirSync(OPT.shots, { recursive: true });
    for (const [w0, h0, mode] of sizes) {
      await bcheck(B(`layout.${w0}x${h0}`, '§8.1, §13', `${w0}×${h0}: ${mode} mode, no overflow, Fire visible, play column ≤ 480, targets ≥ 44 px, text ≥ 16 px`, 'play'), async () => {
        const f = [], w = []; const ctx = await newCtx({ w: w0, h: h0 }); const p = await open(ctx, '?test=1&fresh=1');
        await p.waitForTimeout(200);
        const r = await ev(p, () => {
          const H = window.__auditH; const app = document.querySelector('#app'); const fire = document.querySelector('#fire'); const fr = fire && fire.getBoundingClientRect();
          const small = [...document.querySelectorAll('#app button, #app [role="button"], #app input, #app select, #app summary')].filter(H.vis).map((b) => { const r = b.getBoundingClientRect(); return { b, d: H.desc(b), w: Math.round(r.width), h: Math.round(r.height), cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; }).filter((x) => x.w < 43.5 || x.h < 43.5)
            // A pseudo-element can extend the hit area beyond the box (§8.1 "44 px hit area"): probe the 44 × 44 square around the centre.
            .filter((x) => { const pts = [[-21.5, -21.5], [21.5, -21.5], [-21.5, 21.5], [21.5, 21.5], [0, -21.5], [0, 21.5], [-21.5, 0], [21.5, 0]]; const miss = new Set(); for (const [dx, dy] of pts) { const e = document.elementFromPoint(x.cx + dx, x.cy + dy); if (!(e && (e === x.b || x.b.contains(e)))) miss.add(e ? H.desc(e).slice(0, 40) : 'nothing'); } x.miss = [...miss]; return miss.size > 0; }).map(({ b, ...x }) => x);
          const tiny = new Map(); const tw = document.createTreeWalker(app, NodeFilter.SHOW_TEXT); let n;
          while ((n = tw.nextNode())) { if (!n.textContent.trim()) continue; const el = n.parentElement; if (!H.vis(el)) continue; const r = el.getBoundingClientRect(); if (r.width <= 2 || r.height <= 2) continue; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 15.5) tiny.set(H.desc(el), fs); }
          const play = document.querySelector('#play'); const pr = play && play.getBoundingClientRect();
          return { layout: app.getAttribute('data-layout'), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bodySw: document.body.scrollWidth, fire: fr && { top: fr.top, bottom: fr.bottom, h: fr.height, w: fr.width }, vh: innerHeight, play: pr && { w: pr.width, l: pr.left, r: innerWidth - pr.right }, small: small.slice(0, 40), nSmall: small.length, tiny: [...tiny].slice(0, 30), nTiny: tiny.size, board: H.vis(document.querySelector('#board')), showlog: H.vis(document.querySelector('#showlog')), sky: document.querySelector('#sky').getBoundingClientRect().height };
        });
        if (r.__err) { await p.close(); return { status: 'FAIL', summary: r.__err }; }
        if (OPT.shots !== 'none' && OPT.shots !== true) await p.screenshot({ path: path.join(OPT.shots, `layout-${w0}x${h0}.png`) }).catch(() => {});
        await p.close();
        if (r.layout !== mode) f.push(`#app[data-layout] = ${r.layout} (spec ${mode} at column height ${h0})`);
        if (r.sw > r.cw + 1) f.push(`horizontal overflow: scrollWidth ${r.sw} > ${r.cw}`);
        if (!r.fire) f.push('#fire missing'); else { if (r.fire.bottom > r.vh + 0.5 || r.fire.top < 0) f.push(`Light the fuse clipped: top ${Math.round(r.fire.top)}, bottom ${Math.round(r.fire.bottom)}, viewport ${r.vh}`); if (r.fire.h < 44) f.push(`#fire height ${r.fire.h}`); }
        if (r.play && mode !== 'desktop' && r.play.w > 480.5) f.push(`play column ${Math.round(r.play.w)} px wide (max 480)`);
        if (r.play && mode === 'desktop' && Math.abs(r.play.w - 480) > 1) w.push(`desktop play column ${Math.round(r.play.w)} px (spec 480)`);
        if (mode === 'desktop') { if (!r.board) f.push('#board (festival board) not visible at 1440×900'); if (!r.showlog) f.push('#showlog not visible at 1440×900'); }
        if (mode !== 'desktop' && r.sky < (mode === 'regular' ? 139.5 : 95.5)) f.push(`sky ${Math.round(r.sky)} px tall (min ${mode === 'regular' ? 140 : 96})`);
        for (const s of r.small) f.push(`tap target ${s.w}×${s.h} < 44: ${s.d}; its 44 × 44 square hits ${s.miss.join(' / ')} instead`);
        if (r.nSmall > r.small.length) f.push(`… ${r.nSmall - r.small.length} more small targets`);
        for (const [d, fsz] of r.tiny) f.push(`text ${fsz}px < 16: ${d}`);
        if (r.nTiny > r.tiny.length) f.push(`… ${r.nTiny - r.tiny.length} more small texts`);
        return verdict(f, w, `layout ${r.layout}, sky ${Math.round(r.sky)} px, fire bottom ${r.fire && Math.round(r.fire.bottom)}`);
      });
    }
    // DOM hooks that only exist after F1 (reroll, buyTube, buyRig) — checked on an F2 build.
    await bcheck(B('page.dom-f2', 'CONTRACT, §8.1', 'F2 build: workshop row with [data-act=reroll|buyTube|buyRig] visible; hidden in F1', 'play'), async () => {
      const ctx = await newCtx(); const p = await open(ctx, '?test=1&fresh=1&seed=audit-f2');
      const f1 = await ev(p, () => ({ ws: window.__auditH.vis(document.querySelector('#workshop')) }));
      await ev(p, () => { const g = window.__game; for (let i = 0; i < 3 && g.state().show < 3 && g.state().phase === 'build'; i++) g.act({ type: 'light' }); });
      await waitUi(p, 'BUILD');
      const r = await ev(p, () => { const H = window.__auditH; const st = window.__game.state(); return { show: st.show, phase: st.phase, acts: ['reroll', 'buyTube', 'buyRig'].map((a) => [a, H.vis(document.querySelector(`[data-act="${a}"]`))]) }; });
      await p.close();
      const f = [], w = []; if (f1.ws) w.push('#workshop visible in F1 (spec: hidden in F1)');
      if (r.show !== 3 || r.phase !== 'build') return { status: 'SKIP', summary: `could not reach the F2 build (show ${r.show + 1}, ${r.phase})` };
      for (const [a, v] of r.acts) if (!v) f.push(`[data-act="${a}"] not visible in the F2 build`);
      return verdict(f, w, 'workshop row present');
    });
  } catch (e) {
    fail({ id: 'page.harness', spec: '', title: 'browser harness', owner: 'tooling' }, 'harness error: ' + (e && e.message ? e.message.split('\n')[0] : String(e)));
  } finally {
    for (const c of contexts) await c.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    srv.close();
  }
}

// ============================================================================
//  10. main
// ============================================================================
async function main() {
  const t0 = Date.now();
  // Hard cap for the whole run (every individual wait is bounded too).
  setTimeout(() => { console.error(`spec-audit: watchdog fired after ${OPT.watchdog} s`); process.exit(2); }, OPT.watchdog * 1000).unref();
  let designText; try { designText = fs.readFileSync(OPT.design, 'utf8'); } catch (e) { console.error(`cannot read ${OPT.design}: ${e.message}`); process.exit(2); }
  let spec; try { spec = parseSpec(designText); } catch (e) { console.error('DESIGN.md parse failed: ' + e.stack); process.exit(2); }
  console.log(paint('H', 'Ooh × Aah spec audit') + `  design ${path.relative(process.cwd(), OPT.design)} · sim ${path.relative(process.cwd(), OPT.sim)} · html ${path.relative(process.cwd(), OPT.html)}`);
  if (wants('spec')) specChecks(spec, designText);

  let L = loadSim(OPT.sim);
  if (L.error && fs.existsSync(OPT.html)) {
    // Fall back to the sim inside the built page.
    const html = fs.readFileSync(OPT.html, 'utf8'); const m = /<script>([\s\S]*?)<\/script>/.exec(html);
    const code = m ? m[1].slice(0, m[1].search(/^const AUDIO\b/m) > 0 ? m[1].search(/^const AUDIO\b/m) : undefined) : '';
    const tmp = path.join(HERE, 'out', 'sim-from-build.js'); fs.mkdirSync(path.dirname(tmp), { recursive: true }); fs.writeFileSync(tmp, code + '\nif (typeof module === "object") module.exports = OOH;');
    const L2 = loadSim(tmp); if (!L2.error) { console.log(`(sim.js failed to load: ${L.error.message}; using the SIM from the built page)`); L = L2; }
  }
  const simGroups = ['data', 'golden', 'trace', 'sim', 'bots'].filter(wants);
  if (L.error) for (const g of simGroups) skip({ id: g + '.load', spec: '§11.4', title: 'load sim.js in node', owner: 'sim' }, 'sim failed to load: ' + L.error.message);
  else {
    if (wants('data')) dataChecks(spec, L);
    if (wants('golden')) goldenChecks(spec, L);
    if (wants('trace')) traceChecks(spec, L);
    if (wants('sim') || wants('bots')) simChecks(spec, L);
  }
  const html = fs.existsSync(OPT.html) ? fs.readFileSync(OPT.html, 'utf8') : null;
  if (wants('static')) { if (html) staticChecks(spec, html, loadSources()); else skip({ id: 'static.build', spec: '§11.1', title: 'built index.html', owner: 'tooling' }, `${OPT.html} missing`); }
  const browserGroups = ['page', 'hooks', 'flags', 'ui', 'layout', 'a11y', 'persist', 'end'];
  if (!OPT.noBrowser && browserGroups.some(wants)) await browserChecks(spec, L);

  // Every "AUTO `id`" named in spec-checklist.md must be a check this run printed (full runs only).
  if (!ONLY && !OPT.noBrowser) check({ id: 'meta.checklist', spec: '', title: 'spec-checklist.md AUTO ids all exist in this tool', owner: 'tooling' }, () => {
    const md = fs.readFileSync(path.join(HERE, 'spec-checklist.md'), 'utf8'); const ids = new Set();
    for (const m of md.matchAll(/AUTO ((?:`[^`]+`(?:,\s*)?)+)/g)) for (const x of m[1].matchAll(/`([^`]+)`/g)) ids.add(x[1].split(' ')[0]);
    const have = CHECKS.map((c) => c.id); const missing = [...ids].filter((id) => (id.endsWith('.*') ? !have.some((h) => h.startsWith(id.slice(0, -1))) : !have.includes(id)) && !(id === 'bots.gates' && !OPT.bots));
    return verdict(missing.map((id) => `checklist names ${id}, which this run did not produce`), [], `${ids.size} ids referenced`);
  });

  // ---------------------------------------------------------------- summary
  const summary = { PASS: 0, FAIL: 0, WARN: 0, SKIP: 0 }; const byOwner = {};
  for (const c of CHECKS) { summary[c.status]++; const o = (byOwner[c.owner] ||= { PASS: 0, FAIL: 0, WARN: 0, SKIP: 0, failing: [] }); o[c.status]++; if (c.status === 'FAIL' || c.status === 'WARN') o.failing.push(`${c.status} ${c.id}`); }
  console.log('\n' + paint('H', 'Summary') + `  ${paint('PASS', summary.PASS + ' pass')} · ${paint('FAIL', summary.FAIL + ' fail')} · ${paint('WARN', summary.WARN + ' warn')} · ${paint('SKIP', summary.SKIP + ' skip')}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  for (const o of OWNERS) { const b = byOwner[o]; if (!b) continue; console.log(`  ${o.padEnd(8)} ${String(b.PASS).padStart(3)} pass ${String(b.FAIL).padStart(3)} fail ${String(b.WARN).padStart(3)} warn ${String(b.SKIP).padStart(3)} skip` + (b.failing.length ? '   ' + b.failing.join(', ') : '')); }
  try {
    fs.mkdirSync(path.dirname(OPT.json), { recursive: true });
    fs.writeFileSync(OPT.json, JSON.stringify({ meta: { when: new Date().toISOString(), design: OPT.design, designSha: sha(designText), sim: L.from, html: OPT.html, htmlBytes: html ? Buffer.byteLength(html) : null, argv: ARGV }, summary, byOwner, checks: CHECKS }, null, 1));
    console.log(`  JSON report: ${path.relative(process.cwd(), OPT.json)}`);
  } catch (e) { console.log('  (could not write the JSON report: ' + e.message + ')'); }
  process.exitCode = summary.FAIL ? 1 : 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch((e) => { console.error('spec-audit crashed: ' + (e && e.stack || e)); process.exit(2); });

export { parseSpec, parseTubeToken, cyrb128, rngNext, refRng, loadSim, renderTemplate };
