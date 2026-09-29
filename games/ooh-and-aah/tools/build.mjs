#!/usr/bin/env node
// Ooh × Aah: single-file build.
//
// Assembles index.html from src/ in the order fixed by src/CONTRACT.md, then runs the
// page-contract checks from DESIGN.md §11.1–§11.3. See tools/README.md for the full list.
//
//   node tools/build.mjs [--src=DIR] [--out=FILE] [--allow-missing] [--force] [--quiet]
//
// Exit codes: 0 = PASS (warnings allowed), 1 = FAIL, 2 = bad usage.
// On FAIL the output file is left untouched unless --force is given.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME_DIR = path.resolve(HERE, '..');

// ---------------------------------------------------------------- contract
const HEAD = 'head.html';
const BODY = 'body.html';
const CSS = ['base.css', 'play.css', 'panels.css', 'end.css', 'menus.css'];
const JS = ['sim.js', 'audio.js', 'fx.js', 'core.js', 'ui-play.js', 'ui-panels.js', 'ui-end.js', 'ui-menus.js'];
const BOOT = 'GAME.boot();';
const GLOBALS = {
  'sim.js': ['OohSim', 'OOH'],
  'audio.js': ['AUDIO'],
  'fx.js': ['FX'],
  'core.js': ['GAME'],
  'ui-play.js': ['UI_PLAY'],
  'ui-panels.js': ['UI_PANELS'],
  'ui-end.js': ['UI_END'],
  'ui-menus.js': ['UI_MENUS'],
};
const KIB = 1024;
const WARN_KB = 900; // lead override of spec §11.1 (CONTRACT.md "Size")
const FAIL_KB = 1200;
// DESIGN.md §11.1 size budget, mapped onto the contract's files (informational only).
const BUDGETS = [
  { label: 'sim.js (DATA 10 + SIM 24 + BOTS 9)', files: ['sim.js'], kb: 43 },
  { label: 'fx.js (FX)', files: ['fx.js'], kb: 22 },
  { label: 'audio.js (AUDIO)', files: ['audio.js'], kb: 9 },
  { label: 'core + ui-*.js (UI 32 + SHELL 16)', files: ['core.js', 'ui-play.js', 'ui-panels.js', 'ui-end.js', 'ui-menus.js'], kb: 48 },
  { label: 'CSS', files: CSS, kb: 13 },
];
const ALLOWED_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);
// XML namespace identifiers are URIs, not requests.
const NAMESPACE_URIS = new Set([
  'http://www.w3.org/2000/svg',
  'http://www.w3.org/1999/xlink',
  'http://www.w3.org/1999/xhtml',
  'http://www.w3.org/1998/Math/MathML',
  'http://www.w3.org/2000/xmlns/',
  'http://www.w3.org/XML/1998/namespace',
]);

// ---------------------------------------------------------------- args
const USAGE = `Usage: node tools/build.mjs [options]

  --src=DIR         source directory (default: ${rel(path.join(GAME_DIR, 'src'))})
  --out=FILE        output file (default: ${rel(path.join(GAME_DIR, 'index.html'))})
  --allow-missing   substitute a no-op stub for missing sources (parallel development)
  --force           write the output even when a check FAILs (exit code is still 1)
  --quiet           print only warnings, failures and the verdict
  -h, --help        show this help`;

function rel(p) {
  const r = path.relative(process.cwd(), p);
  return r && !r.startsWith('..') ? r : p;
}

function parseArgs(argv) {
  const opts = { src: path.join(GAME_DIR, 'src'), out: path.join(GAME_DIR, 'index.html'), allowMissing: false, force: false, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const m = /^--([a-z-]+)(?:=(.*))?$/.exec(a);
    if (a === '-h' || a === '--help') { console.log(USAGE); process.exit(0); }
    if (!m) usage(`unexpected argument: ${a}`);
    const [, key, inline] = m;
    const value = () => {
      if (inline !== undefined) return inline;
      if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) usage(`--${key} needs a value`);
      return argv[++i];
    };
    switch (key) {
      case 'src': opts.src = path.resolve(value()); break;
      case 'out': opts.out = path.resolve(value()); break;
      case 'allow-missing': opts.allowMissing = true; break;
      case 'force': opts.force = true; break;
      case 'quiet': opts.quiet = true; break;
      default: usage(`unknown option --${key}`);
    }
  }
  return opts;
}

function usage(msg) {
  console.error(`build: ${msg}\n\n${USAGE}`);
  process.exit(2);
}

// ---------------------------------------------------------------- text helpers
function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return starts;
}
function lineOf(starts, idx) {
  let lo = 0, hi = starts.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= idx) lo = mid; else hi = mid - 1; }
  return lo + 1;
}
function snippet(text, idx, len = 70) {
  const s = text.lastIndexOf('\n', idx) + 1;
  let e = text.indexOf('\n', idx); if (e < 0) e = text.length;
  const line = text.slice(s, e);
  if (line.trim().length <= len) return line.trim();
  const from = Math.max(0, Math.min(idx - s - 20, line.length - len));
  return (from > 0 ? '…' : '') + line.slice(from, from + len).trim() + (from + len < line.length ? '…' : '');
}

// Replace a range with spaces, keeping newlines so line numbers survive.
function blankInto(out, a, b) { for (let k = a; k < b; k++) if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '; }

// Lexically strips JS comments (always) and string / template / regex contents (unless keepStrings).
// Delimiters stay in place and every newline is preserved, so indices and lines map 1:1 onto the source.
// Regex-vs-division uses the previous significant token; a candidate regex must close on its own line.
const REGEX_AFTER_WORD = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);
function stripJs(src, { keepStrings = false } = {}) {
  const n = src.length;
  const out = src.split('');
  const tpl = []; // brace depth inside each open ${ … }
  let lastSig = '';
  let lastWord = '';
  const blankStr = (a, b) => { if (!keepStrings) blankInto(out, a, b); };
  const regexAllowed = () => {
    if (lastSig === '') return true;
    if (/[\w$]/.test(lastSig)) return REGEX_AFTER_WORD.has(lastWord);
    return lastSig !== ')' && lastSig !== ']';
  };
  const scanTemplate = (j) => {
    const start = j;
    while (j < n) {
      const ch = src[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === '`') { blankStr(start, j); return j + 1; }
      if (ch === '$' && src[j + 1] === '{') { blankStr(start, j); tpl.push(0); lastSig = '('; lastWord = ''; return j + 2; }
      j++;
    }
    blankStr(start, n);
    return n;
  };
  let i = 0;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') {
      let j = src.indexOf('\n', i); if (j < 0) j = n;
      blankInto(out, i, j); i = j; continue;
    }
    if (c === '/' && d === '*') {
      let j = src.indexOf('*/', i + 2); j = j < 0 ? n : j + 2;
      blankInto(out, i, j); i = j; continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      blankStr(i + 1, Math.min(j, n)); i = j + 1; lastSig = c; lastWord = ''; continue;
    }
    if (c === '`') { i = scanTemplate(i + 1); lastSig = '`'; lastWord = ''; continue; }
    if (c === '{' && tpl.length) tpl[tpl.length - 1]++;
    if (c === '}' && tpl.length) {
      if (tpl[tpl.length - 1] === 0) { tpl.pop(); i = scanTemplate(i + 1); lastSig = '`'; lastWord = ''; continue; }
      tpl[tpl.length - 1]--;
    }
    if (c === '/') {
      if (regexAllowed()) {
        let j = i + 1, inClass = false, closed = false;
        while (j < n && src[j] !== '\n') {
          const ch = src[j];
          if (ch === '\\') { j += 2; continue; }
          if (inClass) { if (ch === ']') inClass = false; } else if (ch === '[') inClass = true; else if (ch === '/') { closed = true; break; }
          j++;
        }
        if (closed && j > i + 1) {
          blankStr(i + 1, j); j++;
          while (j < n && /[a-z]/i.test(src[j])) j++;
          i = j; lastSig = ')'; lastWord = ''; continue;
        }
      }
      lastSig = '/'; lastWord = ''; i++; continue;
    }
    if (/[\w$]/.test(c)) {
      let j = i; while (j < n && /[\w$]/.test(src[j])) j++;
      lastWord = src.slice(i, j); lastSig = lastWord[lastWord.length - 1]; i = j; continue;
    }
    if (!/\s/.test(c)) { lastSig = c; lastWord = ''; }
    i++;
  }
  return out.join('');
}

function stripCssComments(src) {
  const out = src.split('');
  src.replace(/\/\*[\s\S]*?(\*\/|$)/g, (m, _e, off) => { blankInto(out, off, off + m.length); return m; });
  return out.join('');
}
function stripHtmlComments(src) {
  const out = src.split('');
  src.replace(/<!--[\s\S]*?(-->|$)/g, (m, _e, off) => { blankInto(out, off, off + m.length); return m; });
  return out.join('');
}

// Top-level declarations (brace/paren/bracket depth 0) in comment- and string-stripped JS.
function topLevelDecls(code) {
  const depth = new Int32Array(code.length + 1);
  let dep = 0;
  for (let i = 0; i < code.length; i++) {
    depth[i] = dep;
    const c = code[i];
    if (c === '{' || c === '(' || c === '[') dep++;
    else if (c === '}' || c === ')' || c === ']') dep = Math.max(0, dep - 1);
  }
  const found = [];
  const re = /\b(const|let|var|class)\s+([A-Za-z_$][\w$]*)|\b(function)\b\s*(?:\*\s*)?([A-Za-z_$][\w$]*)/g;
  let m;
  while ((m = re.exec(code))) {
    if (depth[m.index] !== 0) continue;
    // A named function *expression* (`= function f(){}`, `(function f(){})`) declares nothing at top level.
    if (m[3] && /([=(,:?&|!+\-*[]|\breturn)\s*$/.test(code.slice(Math.max(0, m.index - 12), m.index))) continue;
    found.push({ kind: m[1] || m[3], name: m[2] || m[4], index: m.index });
  }
  return found;
}

// ---------------------------------------------------------------- stubs for --allow-missing
function jsStub(file) {
  const names = GLOBALS[file] || [];
  const warn = `console.warn(${JSON.stringify(`[ooh build] ${file} is missing: using a no-op stub`)});`;
  const proxy = `(function(){var noop=function(){};var base={` +
    `play:function(evs,o){o=o||{};try{(evs||[]).forEach(function(e){o.onPresent&&o.onPresent(e)});o.onDone&&o.onDone()}catch(e){}` +
    `return{fastForward:noop,skip:noop,done:Promise.resolve()}},` +
    `pictogram:function(){var c=document.createElement('canvas');c.width=c.height=1;return c},` +
    `stats:function(){return{}},init:noop};` +
    `return new Proxy(base,{get:function(t,k){if(k in t)return t[k];` +
    `if(typeof k!=='string'||k==='then'||k==='toJSON')return undefined;return noop}})})()`;
  if (file === 'sim.js') {
    return `${warn}\nfunction OohSim(){return ${proxy}}\nconst OOH = OohSim();\n`;
  }
  return `${warn}\n${names.map((nm) => `const ${nm} = ${proxy};`).join('\n')}\n`;
}

// ---------------------------------------------------------------- main
function main() {
  const opts = parseArgs(process.argv.slice(2));
  const issues = [];
  const add = (level, file, line, msg) => issues.push({ level, file, line, msg });
  const log = (...a) => { if (!opts.quiet) console.log(...a); };

  if (!fs.existsSync(opts.src) || !fs.statSync(opts.src).isDirectory()) usage(`source directory not found: ${opts.src}`);

  // -- read sources
  const sources = new Map(); // name -> {text, missing, kind}
  const kindOf = (f) => (f.endsWith('.js') ? 'js' : f.endsWith('.css') ? 'css' : 'html');
  for (const f of [HEAD, ...CSS, BODY, ...JS]) {
    const p = path.join(opts.src, f);
    const kind = kindOf(f);
    if (!fs.existsSync(p)) {
      if (opts.allowMissing) {
        add('WARN', f, 0, 'missing: substituted a stub (--allow-missing)');
        const text = kind === 'js' ? jsStub(f) : kind === 'css' ? `/* ${f} missing (stub) */\n` : `<!-- ${f} missing (stub) -->\n`;
        sources.set(f, { text, missing: true, kind, path: p });
      } else {
        add('FAIL', f, 0, 'missing source file (use --allow-missing during parallel development)');
        sources.set(f, { text: '', missing: true, kind, path: p });
      }
      continue;
    }
    const buf = fs.readFileSync(p);
    let text = buf.toString('utf8');
    if (!Buffer.from(text, 'utf8').equals(buf)) add('FAIL', f, 0, 'not valid UTF-8');
    if (text.charCodeAt(0) === 0xfeff) { text = text.slice(1); add('WARN', f, 1, 'UTF-8 byte-order mark removed'); }
    if (/\S/.test(text) === false) add('WARN', f, 0, 'file is empty');
    sources.set(f, { text, missing: false, kind, path: p });
  }

  // -- assemble (CONTRACT.md "Assembly order")
  const parts = []; // {file, text} in output order, for the size table and line mapping
  const push = (file, text) => parts.push({ file, text });
  push(HEAD, sources.get(HEAD).text.replace(/\s+$/, '') + '\n');
  push('<style>', '<style>\n');
  for (const f of CSS) push(f, `/* ==== ${f} ==== */\n` + sources.get(f).text.replace(/\s+$/, '') + '\n');
  push('</style>', '</style>\n');
  push(BODY, sources.get(BODY).text.replace(/\s+$/, '') + '\n');
  push('<script>', '<script>\n');
  for (const f of JS) push(f, `// ==== ${f} ====\n` + sources.get(f).text.replace(/\s+$/, '') + '\n');
  push('boot', `${BOOT}\n`);
  push('</script>', '</script>\n');
  const output = parts.map((p) => p.text).join('');
  const outBytes = Buffer.byteLength(output, 'utf8');

  // -- checks
  const present = [...sources.entries()].filter(([, s]) => !s.missing);

  // head.html shape (DESIGN.md §11.2: the file starts with the two metas, then <title>, then <style>)
  {
    const head = sources.get(HEAD);
    if (!head.missing) {
      const t = head.text.trimStart();
      if (!/^<meta charset="utf-8">/i.test(t)) add('FAIL', HEAD, 1, 'must start with <meta charset="utf-8"> (spec §11.2)');
      if (!/<meta name="viewport" content="width=device-width,\s*initial-scale=1,\s*viewport-fit=cover">/i.test(t)) add('FAIL', HEAD, 0, 'missing <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">');
      if (!/<title>[^<]+<\/title>/i.test(t)) add('FAIL', HEAD, 0, 'missing <title>');
      if (/<(script|style|link|div)\b/i.test(t)) add('WARN', HEAD, 0, 'head.html should hold only the two metas and the <title>');
    }
  }

  for (const [f, s] of present) {
    const raw = s.text;
    const starts = lineStarts(raw);
    const at = (idx) => lineOf(starts, idx);
    // Comment-free text (strings kept) for tag and URL scans; code-only text for call scans.
    const noComments = s.kind === 'js' ? stripJs(raw, { keepStrings: true }) : s.kind === 'css' ? stripCssComments(raw) : stripHtmlComments(raw);
    const code = s.kind === 'js' ? stripJs(raw) : null;

    // 1. document-level tags: the artifact host supplies them
    for (const m of noComments.matchAll(/<\/?\s*(!doctype|html|head|body)\b/gi)) {
      add('FAIL', f, at(m.index), `forbidden <${m[1].toLowerCase()}> tag (the host wraps the page; spec §11.2): ${snippet(raw, m.index)}`);
    }

    // 2. tags that would end the enclosing <script>/<style> early (checked raw: the HTML parser ignores JS/CSS comments)
    if (s.kind === 'js') {
      for (const m of raw.matchAll(/<\/script/gi)) add('FAIL', f, at(m.index), `"</script" inside JS ends the page's <script> early (write "<\\/script"): ${snippet(raw, m.index)}`);
      for (const m of raw.matchAll(/<!--|<script\b/gi)) add('WARN', f, at(m.index), `"${m[0]}" inside a <script> can confuse the HTML parser: ${snippet(raw, m.index)}`);
    }
    if (s.kind === 'css') {
      for (const m of raw.matchAll(/<\/style/gi)) add('FAIL', f, at(m.index), `"</style" inside CSS ends the page's <style> early: ${snippet(raw, m.index)}`);
    }
    if (s.kind === 'html' && f === BODY) {
      for (const m of noComments.matchAll(/<(script|style)\b/gi)) add('WARN', f, at(m.index), `<${m[1]}> in body.html: put ${m[1] === 'script' ? 'JS in a module file' : 'CSS in a .css file'} instead`);
    }

    // 3. alert / confirm / prompt
    if (s.kind === 'js') {
      for (const m of code.matchAll(/(^|[^\w$.])(alert|confirm|prompt)\s*\(/g)) {
        const idx = m.index + m[1].length;
        if (/\bfunction\s*$/.test(code.slice(Math.max(0, idx - 20), idx))) continue; // a local function declaration
        add('FAIL', f, at(idx), `${m[2]}() is forbidden (use an inline 2-tap confirmation; spec §11.2): ${snippet(raw, idx)}`);
      }
      for (const m of code.matchAll(/\b(window|self|globalThis|top|parent)\s*\.\s*(alert|confirm|prompt)\s*\(/g)) {
        add('FAIL', f, at(m.index), `${m[1]}.${m[2]}() is forbidden (spec §11.2): ${snippet(raw, m.index)}`);
      }
    } else if (s.kind === 'html') {
      for (const m of noComments.matchAll(/\bon[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi)) {
        const v = m[1];
        const mm = /\b(alert|confirm|prompt)\s*\(/.exec(v);
        if (mm) add('FAIL', f, at(m.index), `${mm[1]}() in an inline handler is forbidden: ${snippet(raw, m.index)}`);
        else add('WARN', f, at(m.index), `inline event handler attribute (wire events in JS): ${snippet(raw, m.index)}`);
      }
    }

    // 4. determinism of the SIM (spec §11.3)
    if (f === 'sim.js') {
      for (const m of code.matchAll(/\bMath\s*\.\s*random\b|\bMath\s*\[\s*(['"`])\s*/g)) {
        if (m[1] && !/Math\s*\[\s*(['"`])random\1/.test(raw.slice(m.index, m.index + 20))) continue;
        add('FAIL', f, at(m.index), `Math.random in sim.js (the SIM uses rngNext only; spec §11.3): ${snippet(raw, m.index)}`);
      }
      for (const m of code.matchAll(/\bDate\s*\.\s*now\b/g)) add('FAIL', f, at(m.index), `Date.now in sim.js (spec §11.3): ${snippet(raw, m.index)}`);
      for (const m of code.matchAll(/\bperformance\s*\.\s*now\b|\bnew\s+Date\b|\bcrypto\s*\.\s*(getRandomValues|randomUUID)\b/g)) {
        add('WARN', f, at(m.index), `non-deterministic source in sim.js: ${snippet(raw, m.index)}`);
      }
    }

    // 5. external URLs (only Google Fonts may be requested; spec §11.2, §14)
    for (const m of noComments.matchAll(/\b([a-z][a-z0-9+.-]*):\/\/([^\s'"`()<>\\,;]*)/gi)) {
      const scheme = m[1].toLowerCase();
      if (!['http', 'https', 'ws', 'wss', 'ftp'].includes(scheme)) continue;
      const url = m[0];
      if (NAMESPACE_URIS.has(url.replace(/[.#]$/, ''))) continue;
      const host = m[2].split(/[/?#:]/)[0].toLowerCase();
      if (ALLOWED_HOSTS.has(host)) continue;
      add('FAIL', f, at(m.index), `external URL (only fonts.googleapis.com / fonts.gstatic.com are allowed): ${url.slice(0, 100)}`);
    }
    if (s.kind === 'css') {
      for (const m of noComments.matchAll(/url\(\s*(['"]?)([^'")]*)\1\s*\)/gi)) {
        const v = m[2].trim();
        if (/^(data:|#|https?:\/\/)/i.test(v) || v === '') continue; // absolute URLs are handled above
        add('FAIL', f, at(m.index), `url(${v}) points at a separate file; the page must be self-contained`);
      }
    }
    if (s.kind === 'html') {
      for (const m of noComments.matchAll(/\s(src|href|srcset|poster|data|action)\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
        const v = (m[3] ?? m[4] ?? '').trim();
        if (v === '' || /^(data:|blob:|#|javascript:void|https?:\/\/|mailto:)/i.test(v)) continue;
        add('FAIL', f, at(m.index), `${m[1]}="${v}" points at a separate file or host; the page must be self-contained`);
      }
    }
    if (s.kind === 'js') {
      for (const m of code.matchAll(/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\b\s*\(/g)) {
        add('WARN', f, at(m.index), `network API ${m[1]}(): the page must make no requests besides Google Fonts`);
      }
    }

    // 6. CSS contract (spec §11.2)
    if (s.kind === 'css') {
      for (const m of noComments.matchAll(/\b100vh\b/g)) add('WARN', f, at(m.index), `100vh: size the app with height:100% (spec §11.2)`);
      for (const m of noComments.matchAll(/@import\b/gi)) {
        const before = f === 'base.css' ? noComments.slice(0, m.index) : 'x';
        if (/[^\s]/.test(before.replace(/@import[^;]*;/gi, '').replace(/@charset[^;]*;/gi, ''))) {
          add('WARN', f, at(m.index), '@import is ignored unless it is the first rule of the stylesheet (put it at the top of base.css)');
        }
      }
    }

    // 7. module shape: one contract global per file (CONTRACT.md)
    if (s.kind === 'js') {
      const decls = topLevelDecls(code);
      const want = GLOBALS[f] || [];
      for (const d of decls) {
        if (!want.includes(d.name)) add('WARN', f, at(d.index), `extra top-level ${d.kind} "${d.name}" (each module defines only ${want.join(' / ')})`);
      }
      for (const nm of want) {
        if (!decls.some((d) => d.name === nm)) add(f === 'core.js' && nm === 'GAME' ? 'FAIL' : 'WARN', f, 0, `does not declare the contract global "${nm}" at top level`);
      }
    }

    // 8. duplicate ids in the static DOM
    if (f === BODY) {
      const seen = new Map();
      for (const m of noComments.matchAll(/\sid\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
        const id = m[2] ?? m[3] ?? m[4];
        if (seen.has(id)) add('WARN', f, at(m.index), `duplicate id="${id}" (first on line ${seen.get(id)})`);
        else seen.set(id, at(m.index));
      }
    }
  }

  // 9. syntax: node --check per file, then the assembled <script> compiled as one classic script
  const checked = [];
  for (const f of JS) {
    const s = sources.get(f);
    if (s.missing) continue;
    const r = spawnSync(process.execPath, ['--check', s.path], { encoding: 'utf8' });
    if (r.status !== 0) {
      const msg = (r.stderr || r.stdout || '').split(s.path).join(f).trim().split('\n').filter((l) => l.trim() && !/^\s*at |^Node\.js v/.test(l)).slice(0, 6).join(' | ');
      const lm = /:(\d+)\s*$/m.exec((r.stderr || '').split('\n')[0] || '');
      add('FAIL', f, lm ? Number(lm[1]) : 0, `node --check failed: ${msg}`);
    } else checked.push(f);
  }
  if (checked.length === JS.filter((f) => !sources.get(f).missing).length) {
    const scriptParts = parts.slice(parts.findIndex((p) => p.file === '<script>') + 1, parts.findIndex((p) => p.file === '</script>'));
    const script = scriptParts.map((p) => p.text).join('');
    try {
      new vm.Script(script, { filename: 'assembled-script.js' });
    } catch (e) {
      // Map the error line back onto a module.
      let where = '', fileHit = 'index.html', lineHit = 0;
      const lm = /assembled-script\.js:(\d+)/.exec(String(e.stack));
      if (lm) {
        let line = Number(lm[1]);
        for (const p of scriptParts) {
          const n = p.text.split('\n').length - 1;
          if (line <= n) { fileHit = p.file === 'boot' ? 'index.html (boot line)' : p.file; lineHit = p.file === 'boot' ? 0 : line - 1; break; }
          line -= n;
        }
        where = ` (${fileHit}${lineHit ? ':' + lineHit : ''})`;
      }
      add('FAIL', fileHit, lineHit, `the assembled <script> does not compile as one classic script${where}: ${e.message}` +
        (/already been declared/.test(e.message) ? ' (two modules declare the same top-level name)' : ''));
    }
  }

  // 10. size
  const kb = outBytes / KIB;
  if (kb > FAIL_KB) add('FAIL', 'index.html', 0, `output is ${kb.toFixed(1)} KB; the hard ceiling is ${FAIL_KB} KB (spec §11.1)`);
  else if (kb > WARN_KB) add('WARN', 'index.html', 0, `output is ${kb.toFixed(1)} KB; the target is ≤ ${WARN_KB} KB (cut Tier 3 in order; spec §11.1)`);

  // 11. the finished page starts with the charset meta (spec §11.2)
  if (!output.startsWith('<meta charset="utf-8">')) add('FAIL', 'index.html', 1, 'output must start with <meta charset="utf-8">');

  // ---------------------------------------------------------------- report
  const fails = issues.filter((x) => x.level === 'FAIL');
  const warns = issues.filter((x) => x.level === 'WARN');

  if (!opts.quiet) {
    const gz = zlib.gzipSync(Buffer.from(output, 'utf8'), { level: 9 }).length;
    const rows = [];
    const sizeOf = (f) => parts.filter((p) => p.file === f).reduce((a, p) => a + Buffer.byteLength(p.text, 'utf8'), 0);
    for (const f of [HEAD, ...CSS, BODY, ...JS]) {
      const s = sources.get(f);
      rows.push([f, sizeOf(f), s.missing ? (opts.allowMissing ? 'stub' : 'MISSING') : '']);
    }
    const wrap = ['<style>', '</style>', '<script>', 'boot', '</script>'].reduce((a, f) => a + sizeOf(f), 0);
    rows.push(['(wrappers + boot)', wrap, '']);
    const w = Math.max(...rows.map((r) => r[0].length), 18);
    log(`\nOoh × Aah build  ${rel(opts.src)} → ${rel(opts.out)}\n`);
    log(`  ${'file'.padEnd(w)}  ${'bytes'.padStart(8)}  ${'KB'.padStart(6)}  ${'share'.padStart(6)}`);
    log(`  ${'-'.repeat(w)}  ${'-'.repeat(8)}  ${'-'.repeat(6)}  ${'-'.repeat(6)}`);
    for (const [f, b, note] of rows) {
      log(`  ${f.padEnd(w)}  ${String(b).padStart(8)}  ${(b / KIB).toFixed(1).padStart(6)}  ${((100 * b) / outBytes).toFixed(1).padStart(5)}%${note ? '  ' + note : ''}`);
    }
    log(`  ${'-'.repeat(w)}  ${'-'.repeat(8)}  ${'-'.repeat(6)}  ${'-'.repeat(6)}`);
    const flag = kb > FAIL_KB ? '  over the 1,200 KB ceiling' : kb > WARN_KB ? '  over the 900 KB warning line' : '';
    log(`  ${'total'.padEnd(w)}  ${String(outBytes).padStart(8)}  ${kb.toFixed(1).padStart(6)}  100.0%${flag}`);
    log(`  ${'gzip -9 (info)'.padEnd(w)}  ${String(gz).padStart(8)}  ${(gz / KIB).toFixed(1).padStart(6)}`);
    log(`\n  spec §11.1 budget (info; 1 KB = 1024 bytes)`);
    for (const b of BUDGETS) {
      const bytes = b.files.reduce((a, f) => a + (sources.get(f).missing ? 0 : Buffer.byteLength(sources.get(f).text, 'utf8')), 0);
      const k = bytes / KIB;
      log(`    ${b.label.padEnd(38)} ${k.toFixed(1).padStart(6)} / ~${b.kb} KB${k > b.kb * 1.15 ? '  (over)' : ''}`);
    }
    log(`\n  node --check: ${checked.length}/${JS.filter((f) => !sources.get(f).missing).length} JS files OK`);
  }

  const fmtIssue = (x) => `  ${x.level}  ${x.file}${x.line ? ':' + x.line : ''}  ${x.msg}`;
  if (warns.length) { console.log(`\nWarnings (${warns.length}):`); for (const x of warns) console.log(fmtIssue(x)); }
  if (fails.length) { console.log(`\nFailures (${fails.length}):`); for (const x of fails) console.log(fmtIssue(x)); }

  const ok = fails.length === 0;
  let wrote = false;
  if (ok || opts.force) {
    const tmp = path.join(path.dirname(opts.out), `.${path.basename(opts.out)}.${process.pid}.tmp`);
    fs.mkdirSync(path.dirname(opts.out), { recursive: true });
    fs.writeFileSync(tmp, output);
    fs.renameSync(tmp, opts.out);
    wrote = true;
  }
  const stubbed = [...sources.values()].filter((s) => s.missing).length;
  console.log(`\nBUILD ${ok ? 'PASS' : 'FAIL'}: ${fails.length} failure(s), ${warns.length} warning(s), ${(outBytes / KIB).toFixed(1)} KB` +
    (stubbed && opts.allowMissing ? `, ${stubbed} stubbed file(s) (dev build)` : '') +
    (wrote ? ` → wrote ${rel(opts.out)}` : ` → ${rel(opts.out)} not written${ok ? '' : ' (use --force to write anyway)'}`));
  process.exit(ok ? 0 : 1);
}

export { stripJs, stripCssComments, stripHtmlComments, topLevelDecls };
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
