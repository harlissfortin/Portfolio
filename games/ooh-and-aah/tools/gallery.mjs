#!/usr/bin/env node
// Ooh × Aah: screenshot gallery and filmstrips (review tooling; owner: review/perf).
//
// Produces a contact sheet a reviewer can open straight from disk:
//   tools/shots/gallery/index.html   one row per screen, one column per viewport
//                                    (360×740, 360×640, 375×548, 1440×900), plain <img> grid
//   tools/shots/gallery/shots/       the screenshots (<screen>__<w>x<h>.png)
//   tools/shots/gallery/strips/      filmstrips: every frame (f000.jpg …), a strip.html, and one
//                                    composed image per chain (<chain>.png)
//   tools/shots/gallery/gallery.report.json   every cell: status, data-ui, show, method, notes
//
//   node tools/gallery.mjs [options]
//
//   --html=FILE        game file (default: index.html; if missing, a temporary build from src/ with
//                      `tools/build.mjs --allow-missing` into OUT/_build/; index.html is never written)
//   --build            always build a temporary copy from src/ first
//   --out=DIR          output directory (default: tools/shots/gallery)
//   --only=IDS         comma list of screen ids and/or strip ids (see --list); other rows are kept
//                      from the previous gallery.report.json
//   --viewports=LIST   e.g. 360x740,1440x900 (default: the four spec viewports, §11.2)
//   --dpr=N            device pixel ratio for screenshots (default 1)
//   --no-strips        skip the filmstrips      --strips-only   only the filmstrips
//   --strip-interval=MS  frame spacing (default 100)   --strip-max=MS  cap per chain (default 9000)
//   --fonts            let Google Fonts load (default blocked: offline, repeatable fallbacks)
//   --list             print the screen and strip ids and exit
//   --headed           show the browser
//   -h, --help
//
// How states are reached: only through window.__game (reset/act/state/skipAnimations/setPaused),
// the GAME overlay API (open/setSetting) and the DOM contract (#fire, [data-card], [data-tube],
// [data-act=…], keys P/L/?/I/Esc). Racks are built from __game.reset + __game.state and loaded with
// the first method that verifies (a __game load hook, the §7.5 save + reload, or GAME.state in place);
// see tools/perf.mjs. A screen that cannot be reached is kept on the sheet as "skipped" with the
// reason; a screen that errors is captured anyway and marked in red.
//
// Filmstrips use Playwright's fake clock (page.clock), so the game's rAF, timers and performance.now
// advance exactly --strip-interval ms between frames: identical runs give identical strips. CSS
// transitions still run on real time. If the clock cannot drive the game, it falls back to real-time
// screenshots and labels each frame with its measured time.
//
// Exit codes: 0 = sheet written (skips allowed), 1 = sheet written but some cells errored,
// 2 = could not run.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  GAME_DIR, RACKS, sleep, rel, waitFor, loadPlaywright, resolveHtml, fileStats, startServer, newContext,
  gotoGame, injectScenario, ensureAnimated, lightShow, ui, dismissTapContinue,
} from './perf.mjs';

// ------------------------------------------------------------------ racks for the screens
const MID = RACKS.show7; // F4 Twilight, 6 tubes, shop: Crossette (twin), Waterfall (fuses with Finale), Kamuro
const S = {
  mid: MID,
  sponsor: {
    seed: 'gal-sponsor', show: 6, crowd: 12, coins: 9, sponsor: 'coin',
    tubes: [['willow', 'A', 1, null], ['palm', 'R', 1, null], ['peony', 'R', 2, null], ['strobe', 'W', 1, null], ['chrys', 'G', 1, 'tall']],
    shop: { cards: [['dahlia', 'G'], ['echo', 'W'], ['smiley', 'R']], rig: 'brass' },
  },
  headliner: { ...MID, seed: 'gal-head', show: 11, headliner: 'windshift' },
  rehearse: { ...MID, seed: 'gal-rehearse', show: 10, headliner: 'windshift' }, // headliner index = floor(10/3) = 3 (F4)
  weak: {
    seed: 'gal-weak', show: 3, crowd: 1, coins: 0,
    tubes: [['peony', 'R', 1, null], null, null, null],
    shop: { cards: [['salute', 'W'], ['candle', 'G'], ['heart', 'R']], rig: 'tall' },
  },
  win: RACKS.cdwin,
  fusion: {
    seed: 'gal-fusion', show: 12, crowd: 40, coins: 12,
    tubes: [['willow', 'A', 2, 'tall'], ['palm', 'A', 2, 'mortar'], ['salute', 'W', 2, null],
      ['comet', 'A', 2, 'spotlight'], ['waterfall', 'W', 2, null], ['finale', 'B', 2, 'brass']],
    shop: { cards: [['glitter', 'A'], ['kamuro', 'A'], ['crossette', 'G']], rig: 'lucky' },
  },
};

class Skip extends Error {}

// ------------------------------------------------------------------ scene helpers
function helpers(page, srv, vp, cell) {
  const h = {
    page, vp,
    note: (t) => cell.notes.push(t),
    desktop: vp.w >= 1200,
    async fresh() {
      const b = await gotoGame(page, srv, { clean: true });
      if (!b.ok) throw new Skip(`the game never left BOOT (data-ui=${b.ui}); is GAME.boot() running?`);
      return b;
    },
    async inject(spec, settingsPatch = null) {
      await h.fresh();
      const hasReset = await page.evaluate(() => !!(window.__game && typeof window.__game.reset === 'function' && typeof window.__game.state === 'function'));
      if (!hasReset) throw new Skip('window.__game.reset/state missing: cannot build the rack');
      const r = await injectScenario(page, srv, spec, { settingsPatch });
      if (!r.how) throw new Skip(`could not load the rack (no load hook; §7.5 restore and GAME.state in place did not verify)${r.notes.length ? ': ' + r.notes.join('; ') : ''}`);
      cell.setup = r.how;
      return r;
    },
    async skipAnims(on) {
      return page.evaluate((on) => { const g = window.__game; if (g && typeof g.skipAnimations === 'function') { g.skipAnimations(on); return true; } return false; }, on);
    },
    async lightInstant() {
      const had = await h.skipAnims(true);
      if (!had) h.note('no skipAnimations hook: shows play in full');
      const r = await lightShow(page, { timeoutMs: 40000 });
      await h.skipAnims(false);
      if (!r.ok) throw new Skip(`lighting failed: ${r.error}`);
      return r;
    },
    async setting(k, v) {
      return page.evaluate(([k, v]) => { try { if (typeof GAME !== 'undefined' && typeof GAME.setSetting === 'function') { GAME.setSetting(k, v); return true; } } catch (e) { /* ignore */ } return false; }, [k, v]);
    },
    async visible(sel) { return page.evaluate((s) => window.__oohTools.visible(s), sel).catch(() => false); },
    async waitVisible(sel, ms = 900) { return !!(await waitFor(() => h.visible(sel), ms, 60)); },
    async key(k) { await page.evaluate(() => { const a = document.activeElement; if (a && a !== document.body && a.blur) a.blur(); }); await page.keyboard.press(k); },
    async click(sel) { const loc = page.locator(sel).first(); if (!(await loc.count())) return false; await loc.click({ force: true, timeout: 3000 }); return true; },
    async api(name, opts) {
      return page.evaluate(([n, o]) => { try { if (typeof GAME !== 'undefined' && typeof GAME.open === 'function') { GAME.open(n, o); return true; } } catch (e) { return false; } return false; }, [name, opts || null]);
    },
    // Tries each route in order until the selector is visible; records which route worked.
    async open(sel, routes, label) {
      for (const [how, fn] of routes) {
        try { await fn(); } catch { continue; }
        if (await h.waitVisible(sel)) { cell.method = `${label} via ${how}`; return how; }
      }
      throw new Skip(`${sel} never became visible (tried ${routes.map((r) => r[0]).join(', ')})`);
    },
    async openPause() {
      return h.open('#pause-menu', [
        ['⏸ [data-act=pause]', () => h.click('[data-act="pause"]')],
        ['key P', () => h.key('p')],
        ['key Esc', () => h.key('Escape')],
        ['GAME.open', () => h.api('pause')],
      ], 'pause');
    },
    async viaPauseButton(re) {
      if (!(await h.visible('#pause-menu'))) await h.openPause().catch(() => {});
      const btns = page.locator('#pause-menu button');
      const n = await btns.count();
      for (let i = 0; i < n; i++) { const t = (await btns.nth(i).innerText().catch(() => '')) || ''; if (re.test(t)) { await btns.nth(i).click({ force: true }); return true; } }
      throw new Error('no such pause-menu button');
    },
    async state() { return page.evaluate(async () => { const s = await window.__game.state(); return { show: s.show, phase: s.phase, rain: s.rain, coins: s.coins }; }).catch(() => null); },
    async startLight() {
      await ensureAnimated(page);
      const mark = await page.evaluate(() => window.__oohTools.uiLog.length);
      await page.locator('#fire').click({ force: true, timeout: 4000 }).catch(() => {});
      const ok = await waitFor(() => page.evaluate((m) => window.__oohTools.uiLog.slice(m).some((e) => e.ui === 'RESOLVING'), mark), 3000, 30);
      if (!ok) {
        const alt = await page.evaluate(() => { try { if (typeof GAME !== 'undefined' && typeof GAME.light === 'function') { GAME.light(); return true; } } catch (e) { /* ignore */ } return false; });
        if (!alt || !(await waitFor(async () => (await ui(page)) === 'RESOLVING', 3000, 30))) throw new Skip('RESOLVING never started after #fire / GAME.light()');
        h.note('#fire click did not start the show; used GAME.light()');
      }
      return mark;
    },
  };
  return h;
}

async function holdCard(h) {
  if (!(await h.click('button[data-card="0"]'))) throw new Skip('no button[data-card="0"] in the shop');
  await sleep(300);
  const sel = await h.page.evaluate(() => {
    const b = document.querySelector('button[data-card="0"]');
    return b ? (b.getAttribute('aria-pressed') || b.getAttribute('aria-selected') || b.getAttribute('data-selected') || (b.className.match(/\b(selected|held|active|lifted)\b/) || [])[0] || null) : null;
  });
  h.note(sel ? `card 0 selected (${sel})` : 'card 0 clicked (no selection attribute found)');
}

async function midChain(h, ms = 1100) {
  const mark = await h.startLight();
  await sleep(ms);
  const still = await h.page.evaluate((m) => { const L = window.__oohTools.uiLog.slice(m); return L.length ? L[L.length - 1].ui : null; }, mark);
  if (still !== 'RESOLVING') h.note(`data-ui was ${still} at +${ms} ms (chain shorter than expected?)`);
  else h.note(`+${ms} ms after Light the fuse`);
}

const LOGBOOK_TABS = ['Shells', 'Fusions', 'Headliners', 'Rigs', 'Kits', 'Records'];
async function logbookTab(h, name, idx) {
  await h.fresh();
  await h.open('#logbook', [['key L', () => h.key('l')], ['pause-menu Logbook', () => h.viaPauseButton(/logbook/i)], ['GAME.open', () => h.api('logbook')]], 'logbook');
  const tabs = h.page.locator('#logbook [role="tab"]');
  const n = await tabs.count();
  if (!n) { if (idx === 0) { h.note('no [role=tab] in #logbook; captured the default view'); return; } throw new Skip('no [role="tab"] elements in #logbook'); }
  let pick = -1;
  for (let i = 0; i < n; i++) { const t = ((await tabs.nth(i).innerText().catch(() => '')) || '').trim(); if (new RegExp('^\\W*' + name, 'i').test(t)) { pick = i; break; } }
  if (pick < 0) { if (idx < n) { pick = idx; h.note(`no tab named ${name}; used tab #${idx + 1}`); } else throw new Skip(`no ${name} tab (${n} tabs)`); }
  await tabs.nth(pick).click({ force: true });
  await sleep(250);
  h.note(`tab: ${((await tabs.nth(pick).innerText().catch(() => '')) || '').trim().replace(/\s+/g, ' ').slice(0, 40)}`);
}

// id, title, section, viewports ('all' | 'desktop' | 'mobile'), reducedMotion, run(h)
const SCREENS = [
  { id: 'build-first', title: 'BUILD show 1 (first-ever run)', section: 'Play', run: async (h) => { await h.fresh(); const s = await h.state(); if (s && s.show !== 0) h.note(`expected show 1, got show ${s.show + 1}`); } },
  { id: 'build-mid-held', title: 'BUILD mid-run: 6 tubes, holding a card (chips)', section: 'Play', run: async (h) => { await h.inject(S.mid); await holdCard(h); } },
  { id: 'sponsor', title: 'Sponsor offered (F3 Twilight)', section: 'Play', run: async (h) => { await h.inject(S.sponsor); if (!(await h.visible('#sponsor'))) h.note('#sponsor is not visible (Compact overlays the sky edge, or not rendered)'); } },
  { id: 'headliner', title: 'Headliner build: Wind Shift, Rehearse on (tonight)', section: 'Play', run: async (h) => {
    await h.inject(S.headliner);
    const p = await h.page.evaluate(() => { const b = document.querySelector('[data-act="rehearse"]'); return b ? (b.getAttribute('aria-pressed') || 'no aria-pressed') : 'no [data-act=rehearse]'; });
    h.note(`rehearse: ${p}`);
  } },
  { id: 'rehearse', title: 'Evening build with Rehearse pressed (previews Wind Shift)', section: 'Play', run: async (h) => {
    await h.inject(S.rehearse);
    if (!(await h.click('[data-act="rehearse"]'))) { await h.key('h'); h.note('no [data-act=rehearse]; pressed H'); }
    await sleep(300);
  } },
  { id: 'resolving', title: 'RESOLVING mid-chain (+1.1 s)', section: 'Play', run: async (h) => { await h.inject(S.mid); await midChain(h); } },
  { id: 'result', title: 'RESULT card (after the slam)', section: 'Play', run: async (h) => {
    await h.inject(S.mid);
    const mark = await h.startLight();
    const got = await waitFor(() => h.page.evaluate((m) => window.__oohTools.uiLog.slice(m).some((e) => e.ui === 'RESULT'), mark), 20000, 50);
    if (!got) { await waitFor(async () => (await ui(h.page)) === 'BUILD', 20000); h.note('data-ui never showed RESULT; captured the build with the pinned result card'); }
    await sleep(300);
  } },
  { id: 'critical', title: 'Rain check spent: critical state (first build after a miss)', section: 'Play', run: async (h) => {
    await h.inject(S.weak);
    await h.lightInstant();
    const s = await h.state();
    if ((await ui(h.page)) !== 'BUILD') throw new Skip(`expected BUILD after the first miss, got ${await ui(h.page)}`);
    h.note(`show ${s.show + 1}, rain=${s.rain}`);
  } },
  { id: 'end-loss', title: 'END: loss (second miss)', section: 'End', run: async (h) => {
    await h.inject(S.weak);
    await h.lightInstant();
    if ((await ui(h.page)) === 'BUILD') await h.lightInstant();
    if ((await ui(h.page)) !== 'END') throw new Skip(`expected END after two misses, got ${await ui(h.page)}`);
    await h.waitVisible('#end', 3000);
    await sleep(1400); // near-miss search finishes within 1 s (§8.6)
  } },
  { id: 'end-win', title: 'END: win (Countdown passed)', section: 'End', run: async (h) => {
    await h.inject(S.win);
    await h.lightInstant();
    if ((await ui(h.page)) !== 'END') throw new Skip(`expected END after the Countdown, got ${await ui(h.page)}`);
    await h.waitVisible('#end', 3000);
    await sleep(1400);
  } },
  { id: 'pause', title: 'Pause menu', section: 'Menus', run: async (h) => { await h.fresh(); await h.openPause(); } },
  { id: 'settings', title: 'Settings', section: 'Menus', run: async (h) => {
    await h.fresh();
    await h.open('#settings', [['pause-menu Settings', () => h.viaPauseButton(/settings/i)], ['GAME.open', () => h.api('settings')]], 'settings');
  } },
  ...LOGBOOK_TABS.map((t, i) => ({ id: `logbook-${t.toLowerCase()}`, title: `Logbook: ${t}`, section: 'Menus', run: (h) => logbookTab(h, t, i) })),
  { id: 'help', title: 'Help', section: 'Menus', run: async (h) => {
    await h.fresh();
    await h.open('#help', [['key ?', () => h.key('?')], ['pause-menu Help', () => h.viaPauseButton(/help|how to play/i)], ['GAME.open', () => h.api('help')]], 'help');
  } },
  { id: 'inspect', title: 'Inspect sheet (tube 1)', section: 'Menus', run: async (h) => {
    await h.inject(S.mid);
    await h.open('#inspect', [
      ['focus tube 1 + key I', async () => { await h.page.focus('button[data-tube="0"]'); await h.page.keyboard.press('i'); }],
      ['select tube 1 + ⓘ', async () => { await h.click('button[data-tube="0"]'); await sleep(200); const b = h.page.locator('#play button').filter({ hasText: 'ⓘ' }).first(); if (await b.count()) await b.click({ force: true }); else await h.click('#play [aria-label*="nspect"], #play [data-act="inspect"]'); }],
      ['long-press tube 1', async () => { const bb = await h.page.locator('button[data-tube="0"]').boundingBox(); if (!bb) throw new Error('no tube'); await h.page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await h.page.mouse.down(); await sleep(650); await h.page.mouse.up(); }],
      ['GAME.open', () => h.api('inspect', { zone: 'tube', i: 0, tube: 0 })],
    ], 'inspect');
  } },
  { id: 'showlog', title: 'Show log (sheet on mobile, side panel on desktop)', section: 'Menus', run: async (h) => {
    await h.inject(S.mid);
    await h.lightInstant();
    await sleep(300);
    if (h.desktop) { if (!(await h.visible('#showlog'))) h.note('#showlog panel not visible at desktop width'); else h.note('desktop side panel'); return; }
    await h.open('#showlog', [
      ['result-card Applause', async () => {
        const cands = ['#sky-overlay [data-act="showlog"]', '#sky-overlay [aria-label*="how log" i]', '#sky-overlay [aria-label*="pplause" i]', '#sky-overlay button'];
        for (const c of cands) if (await h.click(c)) return;
        throw new Error('no clickable Applause');
      }],
      ['GAME.open', () => h.api('showlog')],
    ], 'showlog');
  } },
  { id: 'desktop-panels', title: 'Desktop: festival board + show log panels (after a show)', section: 'Menus', viewports: 'desktop', run: async (h) => {
    await h.inject(S.mid);
    await h.lightInstant();
    await sleep(300);
    for (const s of ['#board', '#showlog', '#backdrop']) if (!(await h.visible(s))) h.note(`${s} not visible`);
  } },
  { id: 'hc-build', title: 'High contrast: BUILD holding a card', section: 'Accessibility', run: async (h) => {
    await h.inject(S.mid, { highContrast: true });
    if (!(await h.page.evaluate(() => document.documentElement.getAttribute('data-contrast') === 'high'))) { await h.setting('highContrast', true); await sleep(200); }
    if (!(await h.page.evaluate(() => document.documentElement.getAttribute('data-contrast') === 'high'))) h.note(':root[data-contrast="high"] NOT set');
    await holdCard(h);
  } },
  { id: 'hc-resolving', title: 'High contrast: RESOLVING mid-chain', section: 'Accessibility', run: async (h) => {
    await h.inject(S.mid, { highContrast: true });
    if (!(await h.page.evaluate(() => document.documentElement.getAttribute('data-contrast') === 'high'))) await h.setting('highContrast', true);
    await midChain(h);
  } },
  { id: 'rm-build', title: 'Reduced motion: BUILD holding a card', section: 'Accessibility', reducedMotion: true, run: async (h) => {
    await h.inject(S.mid, { reducedMotion: 'on' });
    const rm = await h.page.evaluate(() => { try { return typeof GAME !== 'undefined' ? GAME.reducedMotion : null; } catch (e) { return null; } });
    if (rm === false) { await h.setting('reducedMotion', 'on'); }
    h.note(`GAME.reducedMotion=${await h.page.evaluate(() => { try { return typeof GAME !== 'undefined' ? String(GAME.reducedMotion) : 'n/a'; } catch (e) { return 'n/a'; } })}`);
    await holdCard(h);
  } },
  { id: 'rm-resolving', title: 'Reduced motion: RESOLVING mid-chain', section: 'Accessibility', reducedMotion: true, run: async (h) => {
    await h.inject(S.mid, { reducedMotion: 'on' });
    await midChain(h);
  } },
];

const STRIPS = [
  { id: 'strip-countdown', title: 'Countdown chain → win finale (golden #10 rack, 18 bursts)', spec: S.win, vp: { w: 360, h: 740 } },
  { id: 'strip-fusion', title: 'Fusion / × chain (Thunderclap Comet, Niagara Finale, Salute clear, Mortar)', spec: S.fusion, vp: { w: 360, h: 740 } },
];

// ------------------------------------------------------------------ capture
async function captureScreens(browser, srv, opts, viewports, results, consoleLog) {
  const shotsDir = path.join(opts.out, 'shots');
  fs.mkdirSync(shotsDir, { recursive: true });
  for (const vp of viewports) {
    const prof = { width: vp.w, height: vp.h, dpr: opts.dpr, mobile: vp.w < 800 };
    const ctx = await newContext(browser, prof, { fonts: opts.fonts, log: consoleLog });
    let page = await ctx.newPage();
    const vpKey = `${vp.w}x${vp.h}`;
    process.stdout.write(`  ${vpKey}: `);
    for (const sc of SCREENS) {
      if (opts.only && !opts.only.has(sc.id)) continue;
      const cell = { status: 'ok', notes: [], file: null, ui: null, show: null, method: null, setup: null, errors: 0, capturedAt: opts.runAt };
      (results[sc.id] = results[sc.id] || {})[vpKey] = cell;
      const applies = !sc.viewports || sc.viewports === 'all' || (sc.viewports === 'desktop' ? vp.w >= 1200 : vp.w < 1200);
      if (!applies) { cell.status = 'n/a'; continue; }
      const errBefore = consoleLog.length;
      const t0 = Date.now();
      try {
        if (page.isClosed()) page = await ctx.newPage();
        await page.emulateMedia({ reducedMotion: sc.reducedMotion ? 'reduce' : 'no-preference' });
        const h = helpers(page, srv, vp, cell);
        await Promise.race([sc.run(h), sleep(90000).then(() => { throw new Error('scene timed out after 90 s'); })]);
        await dismissTapContinue(page);
        await settle(page);
      } catch (e) {
        if (e instanceof Skip) { cell.status = 'skip'; cell.reason = e.message; } else { cell.status = 'error'; cell.reason = String(e.message || e).split('\n')[0].slice(0, 300); }
      }
      if (cell.status !== 'skip') {
        const file = `shots/${sc.id}__${vpKey}.png`;
        try { await page.screenshot({ path: path.join(opts.out, file), caret: 'hide', timeout: 15000 }); cell.file = file; } catch (e) { cell.status = 'error'; cell.reason = (cell.reason ? cell.reason + '; ' : '') + `screenshot failed: ${e.message.split('\n')[0]}`; }
        try {
          const info = await page.evaluate(async () => { const T = window.__oohTools; let s = null; try { s = window.__game ? await window.__game.state() : null; } catch (e) { /* ignore */ } return { ui: T.ui(), show: s ? s.show + 1 : null, phase: s ? s.phase : null, contrast: document.documentElement.getAttribute('data-contrast') }; });
          cell.ui = info.ui; cell.show = info.show; cell.phase = info.phase;
        } catch { /* ignore */ }
      }
      cell.errors = consoleLog.slice(errBefore).filter((e) => e.kind !== 'warning').length;
      cell.ms = Date.now() - t0;
      process.stdout.write(cell.status === 'ok' ? '.' : cell.status === 'skip' ? 's' : 'E');
    }
    process.stdout.write('\n');
    await ctx.close().catch(() => {});
  }
}

async function settle(page) {
  await sleep(350);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});
}

async function captureStrip(browser, srv, opts, strip, consoleLog) {
  const dir = path.join(opts.out, 'strips', strip.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const out = { id: strip.id, title: strip.title, status: 'ok', frames: [], notes: [], mode: 'fake clock', intervalMs: opts.stripInterval, capturedAt: opts.runAt };
  const prof = { width: strip.vp.w, height: strip.vp.h, dpr: opts.dpr, mobile: true };
  const ctx = await newContext(browser, prof, { fonts: opts.fonts, log: consoleLog });
  const page = await ctx.newPage();
  try {
    let clockOk = true;
    try { await page.clock.install(); } catch (e) { clockOk = false; out.notes.push(`clock.install failed: ${e.message}`); }
    const cell = { notes: [] };
    const h = helpers(page, srv, { w: strip.vp.w, h: strip.vp.h }, cell);
    await h.inject(strip.spec);
    out.setup = cell.setup;
    await ensureAnimated(page);
    await sleep(400);
    const snap = async (i, t) => {
      const f = `f${String(i).padStart(3, '0')}.jpg`;
      await page.screenshot({ path: path.join(dir, f), type: 'jpeg', quality: 82, caret: 'hide' });
      const info = await page.evaluate(() => { let p = null; try { if (typeof FX !== 'undefined' && FX && typeof FX.stats === 'function') { const s = FX.stats(); p = s && (s.particles ?? s.live ?? null); } } catch (e) { /* ignore */ } return { ui: window.__oohTools.ui(), particles: p }; }).catch(() => ({}));
      out.frames.push({ file: f, t: Math.round(t), ui: info.ui, particles: info.particles });
    };
    const maxFrames = Math.ceil(opts.stripMax / opts.stripInterval) + 1;
    let endAt = null;
    if (clockOk) {
      const now = await page.evaluate(() => Date.now());
      await page.clock.pauseAt(now + 50);
      await page.locator('#fire').click({ force: true, timeout: 4000 }).catch(() => {});
      // Did the game react under the paused clock? Give it one interval.
      await page.clock.runFor(opts.stripInterval);
      const started = await page.evaluate(() => window.__oohTools.uiLog.some((e) => e.ui === 'RESOLVING'));
      if (!started) {
        const alt = await page.evaluate(() => { try { if (typeof GAME !== 'undefined' && typeof GAME.light === 'function') { GAME.light(); return true; } } catch (e) { /* ignore */ } return false; });
        if (alt) await page.clock.runFor(opts.stripInterval);
      }
      for (let i = 0; i < maxFrames; i++) {
        await snap(i, (i + 1) * opts.stripInterval);
        const u = out.frames[out.frames.length - 1].ui;
        if (u === 'END' || (u === 'BUILD' && i > 3)) { if (endAt === null) endAt = i; if (i - endAt >= Math.ceil(1000 / opts.stripInterval)) break; }
        await page.clock.runFor(opts.stripInterval);
      }
      const moving = new Set(out.frames.map((f) => fs.statSync(path.join(dir, f.file)).size)).size;
      if (!out.frames.some((f) => f.ui === 'RESOLVING') || moving < 3) {
        out.notes.push(`fake clock did not drive the chain (ui seen: ${[...new Set(out.frames.map((f) => f.ui))].join(',')}); retrying in real time`);
        clockOk = false;
        await page.clock.resume().catch(() => {});
      }
    }
    if (!clockOk) {
      out.mode = 'real time'; out.frames = [];
      for (const f of fs.readdirSync(dir)) fs.rmSync(path.join(dir, f));
      await h.inject(strip.spec);
      await ensureAnimated(page);
      await sleep(300);
      await page.locator('#fire').click({ force: true, timeout: 4000 }).catch(() => {});
      const t0 = Date.now();
      for (let i = 0; i < maxFrames * 2; i++) {
        const target = t0 + i * opts.stripInterval;
        if (Date.now() < target) await sleep(target - Date.now());
        await snap(i, Date.now() - t0);
        const u = out.frames[out.frames.length - 1].ui;
        if (u === 'END' || (u === 'BUILD' && i > 3)) { if (endAt === null) endAt = Date.now(); if (Date.now() - endAt > 1000) break; }
        if (Date.now() - t0 > opts.stripMax) break;
      }
      out.notes.push('real-time capture: frame times are measured, spacing is approximate');
    }
    // compose: strip.html next to the frames, rendered to one image
    const cols = 10; const scale = 0.5;
    const fw = Math.round(strip.vp.w * scale); const fh = Math.round(strip.vp.h * scale);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(strip.title)}</title><style>
      body{margin:0;background:#111;color:#ddd;font:12px/1.3 system-ui,sans-serif}
      h1{font-size:15px;margin:0;padding:8px 10px}
      .g{display:grid;grid-template-columns:repeat(${cols},${fw}px);gap:6px;padding:0 10px 10px}
      figure{margin:0}img{display:block;width:${fw}px;height:${fh}px;border:1px solid #333}
      figcaption{padding:2px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .R{color:#f2c14e}.E{color:#7bd389}</style></head><body>
      <h1>${esc(strip.title)} · ${out.mode}, every ${opts.stripInterval} ms · ${out.frames.length} frames</h1><div class="g">
      ${out.frames.map((f) => `<figure><img src="${f.file}"><figcaption class="${f.ui === 'RESOLVING' ? 'R' : f.ui === 'END' || f.ui === 'RESULT' ? 'E' : ''}">+${(f.t / 1000).toFixed(1)} s · ${f.ui || '?'}${f.particles != null ? ` · ${f.particles}p` : ''}</figcaption></figure>`).join('\n')}
      </div></body></html>`;
    fs.writeFileSync(path.join(dir, 'strip.html'), html);
    const vw = cols * (fw + 6) + 20;
    const cp = await ctx.newPage();
    await cp.setViewportSize({ width: vw, height: 400 });
    await cp.goto(pathToFileURL(path.join(dir, 'strip.html')).href);
    await cp.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = r; i.onerror = r; })))));
    out.image = `strips/${strip.id}.png`;
    await cp.screenshot({ path: path.join(opts.out, out.image), fullPage: true });
    await cp.close();
    out.html = `strips/${strip.id}/strip.html`;
    out.uiSequence = out.frames.map((f) => f.ui).filter((u, i, a) => u !== a[i - 1]);
  } catch (e) {
    out.status = e instanceof Skip ? 'skip' : 'error'; out.reason = String(e.message || e).split('\n')[0];
  } finally {
    await ctx.close().catch(() => {});
  }
  return out;
}

// ------------------------------------------------------------------ contact sheet
function esc(s) { return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function sheetHtml(rep) {
  const vps = rep.viewports;
  const sections = [...new Set(SCREENS.map((s) => s.section))];
  const cellHtml = (sc, vpKey) => {
    const c = rep.screens[sc.id] && rep.screens[sc.id][vpKey];
    const [w] = vpKey.split('x').map(Number);
    if (!c) return '<td class="na">not captured</td>';
    if (c.status === 'n/a') return '<td class="na">n/a at this width</td>';
    if (c.status === 'skip') return `<td class="skip"><b>skipped</b><br>${esc(c.reason)}</td>`;
    const cap = [c.capturedAt && c.capturedAt !== rep.generatedAt ? `<span class="bad">earlier run ${esc(c.capturedAt)}</span>` : '', c.ui && `ui=${c.ui}`, c.show && `show ${c.show}`, c.method, c.setup && `rack: ${c.setup}`, ...(c.notes || []), c.errors ? `<span class="bad">${c.errors} console error(s)</span>` : '', c.status === 'error' ? `<span class="bad">ERROR: ${esc(c.reason)}</span>` : ''].filter(Boolean);
    return `<td class="${c.status}"><a href="${esc(c.file)}"><img src="${esc(c.file)}" loading="lazy" style="width:calc(${w}px * var(--s${w >= 1200 ? 'd' : 'm'}))" alt="${esc(sc.title)} at ${vpKey}"></a><div class="cap">${cap.map((x) => (x.startsWith('<span') ? x : esc(x))).join(' · ')}</div></td>`;
  };
  const rows = sections.map((sec) => {
    const list = SCREENS.filter((s) => s.section === sec && rep.screens[s.id]);
    if (!list.length) return '';
    return `<tr class="sec"><th colspan="${vps.length + 1}">${esc(sec)}</th></tr>` + list.map((sc) => `<tr><th class="rh" id="${sc.id}">${esc(sc.title)}<br><code>${sc.id}</code></th>${vps.map((v) => cellHtml(sc, v)).join('')}</tr>`).join('\n');
  }).join('\n');
  const strips = (rep.strips || []).map((s) => `<section class="strip"><h3>${esc(s.title)} <code>${s.id}</code></h3>${s.status === 'ok'
    ? `<p class="cap">${s.capturedAt && s.capturedAt !== rep.generatedAt ? `<span class="bad">earlier run ${esc(s.capturedAt)}</span> · ` : ''}${esc(s.mode)}, every ${s.intervalMs} ms, ${s.frames.length} frames · rack: ${esc(s.setup || '?')} · ui: ${esc((s.uiSequence || []).join(' → '))} · <a href="${esc(s.html)}">frames page</a>${(s.notes || []).length ? ' · ' + esc(s.notes.join('; ')) : ''}</p><a href="${esc(s.image)}"><img class="stripimg" src="${esc(s.image)}" loading="lazy" alt="${esc(s.title)}"></a>`
    : `<p class="skip"><b>${s.status}</b>: ${esc(s.reason)}</p>`}</section>`).join('\n');
  const counts = rep.counts;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ooh × Aah gallery</title><style>
:root{--sm:1;--sd:.5;color-scheme:dark}
body{margin:0;padding:16px;background:#0d0f1a;color:#e8e4dc;font:14px/1.4 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
h1{font-size:20px;margin:0 0 4px}h3{margin:18px 0 4px;font-size:15px}code{color:#9fb3ff}
.meta{color:#aaa;margin:0 0 12px}.ctl{margin:0 0 12px}.ctl button{background:#222640;color:#eee;border:1px solid #444;border-radius:6px;padding:4px 10px;margin-right:6px;cursor:pointer}
table{border-collapse:separate;border-spacing:8px}th,td{vertical-align:top;text-align:left}
thead th{position:sticky;top:0;background:#0d0f1a;z-index:1;padding:4px 0}
.rh{width:170px;font-weight:600}.sec th{font-size:16px;padding-top:18px;color:#f2c14e;border-bottom:1px solid #333}
td img{display:block;border:1px solid #333;background:#000}td.error img{border:2px solid #e0533d}
.cap{font-size:12px;color:#aaa;max-width:360px;margin-top:4px}.bad{color:#ff6b5e;font-weight:700}
td.skip,p.skip{color:#e0a64d;max-width:320px;font-size:13px;border:1px dashed #6b5320;padding:8px;border-radius:6px}
td.na{color:#666;font-size:12px}
.stripimg{max-width:100%;border:1px solid #333}
</style></head><body>
<h1>Ooh × Aah: screen gallery</h1>
<p class="meta">${esc(rep.generatedAt)} · <code>${esc(rep.file.file)}</code> ${rep.file.kb} KB (sha1 ${esc(rep.file.sha1)})${rep.buildNote ? ' · ' + esc(rep.buildNote) : ''} · game version ${esc(rep.api && rep.api.version || 'n/a')} · hooks: ${esc(rep.api ? rep.api.hooks.join(', ') : 'n/a')}<br>
cells: ${counts.ok} ok, ${counts.skip} skipped, ${counts.error} errors · DPR ${rep.dpr} · fonts ${rep.fonts ? 'loaded' : 'blocked (fallback faces)'} · <a href="gallery.report.json">gallery.report.json</a></p>
<div class="ctl">Mobile size: <button onclick="document.documentElement.style.setProperty('--sm',1)">100%</button><button onclick="document.documentElement.style.setProperty('--sm',.5)">50%</button>
Desktop size: <button onclick="document.documentElement.style.setProperty('--sd',.5)">50%</button><button onclick="document.documentElement.style.setProperty('--sd',1)">100%</button> · <a href="#strips">filmstrips</a></div>
<table><thead><tr><th></th>${vps.map((v) => `<th>${v.replace('x', ' × ')}</th>`).join('')}</tr></thead><tbody>
${rows}
</tbody></table>
<h2 id="strips">Filmstrips</h2>
${strips || '<p class="na">not captured (--no-strips)</p>'}
</body></html>`;
}

// ------------------------------------------------------------------ main
const USAGE = (() => { const lines = []; for (const l of fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1)) { if (!l.startsWith('//') || l.startsWith('// How states')) break; lines.push(l.slice(3)); } return lines.join('\n'); })();

function parseArgs(argv) {
  const o = { html: null, build: false, out: path.join(GAME_DIR, 'tools', 'shots', 'gallery'), only: null, viewports: ['360x740', '360x640', '375x548', '1440x900'], dpr: 1, strips: true, stripsOnly: false, stripInterval: 100, stripMax: 9000, fonts: false, headed: false };
  for (const a of argv) {
    const m = /^--([a-z-]+)(?:=(.*))?$/.exec(a);
    if (a === '-h' || a === '--help') { console.log(USAGE); process.exit(0); }
    if (!m) { console.error(`unknown argument ${a}\n\n${USAGE}`); process.exit(2); }
    const [, k, v] = m;
    switch (k) {
      case 'html': o.html = v; break;
      case 'build': o.build = true; break;
      case 'out': o.out = path.resolve(v); break;
      case 'only': o.only = new Set(v.split(',').map((s) => s.trim()).filter(Boolean)); break;
      case 'viewports': o.viewports = v.split(',').map((s) => s.trim()).filter((s) => /^\d+x\d+$/.test(s)); break;
      case 'dpr': o.dpr = Math.max(1, Math.min(3, Number(v) || 1)); break;
      case 'no-strips': o.strips = false; break;
      case 'strips-only': o.stripsOnly = true; break;
      case 'strip-interval': o.stripInterval = Math.max(16, parseInt(v, 10) || 100); break;
      case 'strip-max': o.stripMax = Math.max(1000, parseInt(v, 10) || 9000); break;
      case 'fonts': o.fonts = true; break;
      case 'headed': o.headed = true; break;
      case 'list':
        console.log('screens:'); for (const s of SCREENS) console.log(`  ${s.id.padEnd(20)} ${s.title}${s.viewports ? ` (${s.viewports} only)` : ''}`);
        console.log('strips:'); for (const s of STRIPS) console.log(`  ${s.id.padEnd(20)} ${s.title}`);
        process.exit(0);
      default: console.error(`unknown option --${k}\n\n${USAGE}`); process.exit(2);
    }
  }
  return o;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  opts.runAt = new Date().toISOString();
  fs.mkdirSync(opts.out, { recursive: true });
  let src;
  try { src = resolveHtml({ html: opts.html, build: opts.build, outDir: opts.out }); } catch (e) { console.error(`gallery: ${e.message}`); process.exit(2); }
  const reportPath = path.join(opts.out, 'gallery.report.json');
  // Rows not re-captured this run (--only, --strips-only, --no-strips) are kept from the previous
  // report; their captions carry their own capture time.
  let prev = null;
  if (fs.existsSync(reportPath)) { try { prev = JSON.parse(fs.readFileSync(reportPath, 'utf8')); } catch { prev = null; } }
  const keepScreens = !!(prev && prev.screens && (opts.only || opts.stripsOnly));
  const keepStrips = !!(prev && prev.strips && (opts.only || !opts.strips));
  if (!opts.only) {
    if (!opts.stripsOnly) fs.rmSync(path.join(opts.out, 'shots'), { recursive: true, force: true });
    if (opts.strips) fs.rmSync(path.join(opts.out, 'strips'), { recursive: true, force: true });
  }
  const { chromium } = loadPlaywright();
  const srv = await startServer(src.html);
  const browser = await chromium.launch({ headless: !opts.headed, args: ['--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'] });
  const consoleLog = [];
  const viewports = opts.viewports.map((s) => { const [w, h] = s.split('x').map(Number); return { w, h }; });
  const rep = {
    tool: 'tools/gallery.mjs', generatedAt: opts.runAt, file: fileStats(src.file, src.html), buildNote: src.note || null,
    viewports: viewports.map((v) => `${v.w}x${v.h}`), dpr: opts.dpr, fonts: opts.fonts, api: null,
    screens: keepScreens ? prev.screens : {}, strips: keepStrips ? prev.strips : [], console: consoleLog,
  };
  process.stdout.write(`gallery: ${rel(src.file)} (${rep.file.kb} KB) → ${rel(opts.out)}${src.note ? ` [${src.note}]` : ''}\n`);
  try {
    // API probe (also a smoke test that the page boots at all)
    {
      const ctx = await newContext(browser, { width: 360, height: 740, dpr: 1, mobile: true }, { fonts: opts.fonts, log: consoleLog });
      const page = await ctx.newPage();
      const b = await gotoGame(page, srv, { clean: true });
      rep.api = b.api; rep.bootOk = b.ok;
      if (!b.ok) process.stdout.write(`  warning: the page never left BOOT (data-ui=${b.ui}); most screens will be skipped\n`);
      await ctx.close();
    }
    if (!opts.stripsOnly) {
      if (opts.only) for (const id of Object.keys(rep.screens)) if (opts.only.has(id)) delete rep.screens[id];
      await captureScreens(browser, srv, opts, viewports, rep.screens, consoleLog);
    }
    if (opts.strips) {
      const want = STRIPS.filter((s) => !opts.only || opts.only.has(s.id) || opts.stripsOnly);
      for (const s of want) {
        process.stdout.write(`  ${s.id}… `);
        const r = await captureStrip(browser, srv, opts, s, consoleLog);
        rep.strips = rep.strips.filter((x) => x.id !== s.id).concat([r]).sort((a, b) => STRIPS.findIndex((x) => x.id === a.id) - STRIPS.findIndex((x) => x.id === b.id));
        process.stdout.write(`${r.status}${r.frames ? ` (${r.frames.length} frames, ${r.mode})` : ''}${r.reason ? ': ' + r.reason : ''}\n`);
      }
    }
  } finally {
    await browser.close().catch(() => {});
    await srv.close();
  }
  const counts = { ok: 0, skip: 0, error: 0, na: 0 };
  for (const row of Object.values(rep.screens)) for (const c of Object.values(row)) counts[c.status === 'n/a' ? 'na' : c.status] = (counts[c.status === 'n/a' ? 'na' : c.status] || 0) + 1;
  rep.counts = counts;
  fs.writeFileSync(reportPath, JSON.stringify(rep, null, 1));
  fs.writeFileSync(path.join(opts.out, 'index.html'), sheetHtml(rep));
  // readable summary
  const skipped = [];
  for (const sc of SCREENS) for (const [vp, c] of Object.entries(rep.screens[sc.id] || {})) if (c.status === 'skip' || c.status === 'error') skipped.push(`  ${c.status.toUpperCase().padEnd(5)} ${sc.id} @${vp}: ${c.reason}`);
  if (skipped.length) process.stdout.write(`${skipped.join('\n')}\n`);
  process.stdout.write(`gallery: ${counts.ok} ok, ${counts.skip} skipped, ${counts.error} errors; strips: ${rep.strips.map((s) => `${s.id} ${s.status}`).join(', ') || 'none'}\n  → ${rel(path.join(opts.out, 'index.html'))}\n`);
  process.exit(counts.error || rep.strips.some((s) => s.status === 'error') ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((e) => { console.error(`gallery: fatal: ${e.stack || e.message}`); process.exit(2); });
}
