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
/** Run fn(c) and turn exceptions into FAIL (or SKIP when err.skip is set). */
async function check(c, fn) {
  try {
    const r = await fn(c);
    if (r && r.status) return add({ ...c, ...r });
    return r;
  } catch (e) {
    if (e && e.skip) return skip(c, e.message);
    return fail(c, 'check threw: ' + (e && e.message ? e.message : String(e)), e && e.stack ? [e.stack.split('\n').slice(0, 4).join(' | ')] : []);
  }
}
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
    return { n: num(r['#']), aName: a, bName: b, a: S.shellId(a), b: S.shellId(b), name: strip(r.Name), params: parseParams(r['Bonus params']), firstRaw: first, lock: /^start/i.test(first) ? null : S.milestoneId(first), _raw: r._raw, _line: r._line };
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
    const g = /(\d+)\+?\s*bursts|reaches (\d+)|(\d+)\+ coloured|(\d+) rigs|(\d+) of the 12/.exec(m.condition);
    m.goal = g ? +(g[1] || g[2] || g[3] || g[4] || g[5]) : null;
  }

  // §4.9 Sponsors
  S.sponsors = T('4.9').rows.map((r) => ({ kind: strip(r.Kind), flavour: strip(r.Flavour), reward: strip(r.Reward), amount: /\+\$?(\d+)/.test(strip(r.Reward)) ? +/\+\$?(\d+)/.exec(strip(r.Reward))[1] : null, _raw: r._raw, _line: r._line }));
  // §4.10 Renown
  S.renown = T('4.10').rows.map((r) => ({ level: num(r.Level), modifier: strip(r.Modifier), _raw: r._raw, _line: r._line }));
  // §4.12 lessons
  S.lessons = T('4.12').rows.map((r) => ({ n: num(r['#']), predicate: strip(r.Predicate), text: unq(r.Text), _raw: r._raw, _line: r._line }));
  // §4.13 tooltips
  S.tooltips = T('4.13').rows.map((r) => ({ id: strip(r.Id), trigger: strip(r.Trigger), text: unq(r.Text), _raw: r._raw, _line: r._line }));

  // §4.1 colours
  S.colours = T('4.1').rows.map((r) => {
    const nm = /^(\w+)(?:\s*\(([^)]+)\))?/.exec(strip(r.Colour)); const shape = strip(r['Token shape']);
    const hex = (s) => { const m = /#[0-9A-Fa-f]{6}/.exec(s); return m ? m[0].toUpperCase() : null; };
    return { id: strip(r.Id), name: nm ? nm[1] : strip(r.Colour), chem: nm ? nm[2] : null, glyph: [...shape][0], shape: shape.replace(/^\S+\s*/, ''), role: strip(r.Role), hex: hex(r.Default), hc: hex(r['High-contrast']), _raw: r._raw, _line: r._line };
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
    ['spec.parse.lessons', '§4.12', 'lessons table', S.lessons.length, 13],
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

export { parseSpec, parseTubeToken, cyrb128, rngNext, refRng };
