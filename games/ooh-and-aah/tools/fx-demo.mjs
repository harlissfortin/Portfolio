#!/usr/bin/env node
// Ooh × Aah: fx.js self-test. Owner: fx.
//
// Drives tools/fx-demo.html (the real src/sim.js + src/fx.js, no build) in headless Chromium at 360×740 (DPR 2)
// and 1440×900 (DPR 1, with the desktop backdrop), in the normal, reduced-motion and high-contrast variants.
// Every scenario is stepped deterministically (FX.update(1/60) + FX.render() per frame) and every render is timed.
//
//   node tools/fx-demo.mjs [--only=mobile|desk] [--scenes=a,b] [--no-shots] [--no-bench]
//   node tools/fx-demo.mjs --game[=path/to/index.html]   FX inside the real built game (default ../index.html):
//        boots it at 360×740 and 1440×900, lights the fuse, screenshots BUILD / mid-chain / slam / RESULT, times
//        FX.render per frame and checks the sky is never left black, one cheer meter, no page errors.
//
// Output: tools/shots/fx/*.png, tools/shots/fx/report.json, and a short table on stdout.
// Exit 1 on a page error, a render p95 over 6 ms, or more than 400 live particles.
import { createRequire } from 'module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'shots', 'fx');
const URL0 = pathToFileURL(path.join(HERE, 'fx-demo.html')).href;
const args = Object.fromEntries(process.argv.slice(2).map(a => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const SHOTS = !args['no-shots'];
const FLUSH = !!args.flush;
fs.mkdirSync(OUT, { recursive: true });

const VIEWS = [
  { id: 'mobile', w: 360, h: 740, dpr: 2 },
  { id: 'desk', w: 1440, h: 900, dpr: 1 }
].filter(v => !args.only || args.only === v.id);

// [scene, variant opts, [[label, how, ms]]]: how = 'at' (ms after play) | 'slam' (ms after the slam) | 'done' | 'idle' (no play)
const PLAN = [
  ['first', {}, [['build', 'idle', 600], ['mid', 'at', 950], ['slam', 'slam', 260]]],
  ['mixed', {}, [['mid', 'at', 1250], ['slam', 'slam', 300]]],
  ['fusion', {}, [['mid', 'at', 1650]]],
  ['rhythm', {}, [['mid', 'at', 1500]]],
  ['droop', {}, [['mid', 'at', 1700]]],
  ['blue', {}, [['mid', 'at', 1500]]],
  ['late', {}, [['mid', 'at', 1600]]],
  ['countdown', {}, [['mid', 'at', 2600], ['slam', 'slam', 450], ['end', 'done', 900]]],
  ['misc', {}, [['slam', 'slam', 250], ['finale', 'done', 700]]],
  ['miss', {}, [['slam', 'slam', 300], ['crit', 'done', 1200]]],
  ['relight', {}, [['banner', 'done', 150]]],
  ['all', {}, [['sky', 'at', 700]]],
  ['mixed', { rm: true }, [['mid', 'at', 1250], ['slam', 'slam', 300]]],
  ['countdown', { rm: true }, [['mid', 'at', 2600]]],
  ['mixed', { hc: true }, [['mid', 'at', 1250], ['slam', 'slam', 300]]],
  ['countdown', { hc: true }, [['mid', 'at', 2600]]]
].filter(p => !args.scenes || String(args.scenes).split(',').includes(p[0]));

const BENCH = [['mixed', {}, 3000], ['countdown', {}, 4500], ['all', {}, 2200], ['countdown', { rm: true }, 3000], ['countdown', { hc: true }, 3000]].filter(p => !args.scenes || String(args.scenes).split(',').includes(p[0]));

const browser = await chromium.launch();
if (args.game) { await gameCheck(); await browser.close(); process.exit(process.exitCode || 0); }
const report = { when: new Date().toISOString(), views: {} };
let fail = [];
for (const v of VIEWS) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr });
  const page = await ctx.newPage();
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto(URL0);
  await page.waitForFunction(() => window.DEMO && typeof FX !== 'undefined', null, { timeout: 8000 }).catch(e => { console.error(errors); throw e; });
  await page.evaluate(() => document.body.classList.add('shot'));
  const R = report.views[v.id] = { scenes: [], errors };
  for (const [scene, o, shots] of PLAN) {
    process.stderr.write(`${v.id} ${scene}${o.rm ? '-rm' : ''}${o.hc ? '-hc' : ''} `);
    const tag = scene + (o.rm ? '-rm' : '') + (o.hc ? '-hc' : '');
    const info = await page.evaluate(([s, o]) => { const r = DEMO.load(s, o); DEMO.step(100); DEMO.timing(true); return r; }, [scene, o]);
    let played = false, t = 0;
    for (const [label, how, ms] of shots) {
      if (how === 'idle') await page.evaluate(ms => DEMO.step(ms), ms);
      else {
        if (!played) { await page.evaluate(f => { DEMO.play(); }, FLUSH); played = true; }
        if (how === 'at') { await page.evaluate(([ms, f]) => DEMO.step(ms, { flush: f }), [ms - t, FLUSH]); t = ms; }
        else await page.evaluate(([how, ms]) => DEMO.until(how, ms), [how, ms]);
      }
      if (SHOTS) await page.screenshot({ path: path.join(OUT, `${v.id}-${tag}-${label}.png`) });
    }
    if (played) await page.evaluate(() => DEMO.until('done', 400));
    const res = await page.evaluate(() => ({ t: DEMO.timing(true), st: FX.stats(), presented: DEMO.presented.length }));
    const row = { scene: tag, events: info.events, presented: res.presented, ...res.t, peakParticles: res.st.peak, renderMaxMs: res.st.renderMaxMs };
    R.scenes.push(row);
    await page.evaluate(() => FX.stats().resetMax());
    if (played && res.presented < info.events) fail.push(`${v.id} ${tag}: presented ${res.presented}/${info.events}`);
    if (row.peakParticles > 400) fail.push(`${v.id} ${tag}: ${row.peakParticles} particles > 400`);
  }
  // render budget (§11.7: ≤ 6 ms): per-frame minimum over 2 deterministic replays
  R.bench = [];
  if (!args['no-bench']) for (const [scene, o, ms] of BENCH) {
    const b = await page.evaluate(([s, o, ms]) => DEMO.bench(s, o, ms, 2), [scene, o, ms]);
    b.scene = scene + (o.rm ? '-rm' : '') + (o.hc ? '-hc' : '');
    R.bench.push(b);
    if (b.p95 > 6) fail.push(`${v.id} ${b.scene}: FX.render p95 ${b.p95} ms > 6 (min of 2 replays)`);
    if (b.peak > 400) fail.push(`${v.id} ${b.scene}: ${b.peak} particles > 400`);
  }
  // real-time rAF probe on the biggest chain
  const liveT = await page.evaluate(async () => {
    DEMO.load('countdown', {}); DEMO.timing(true); DEMO.play(); DEMO.startLive();
    const iv = []; let last = 0;
    await new Promise(res => { const f = ts => { if (last) iv.push(ts - last); last = ts; if (iv.length < 240) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    DEMO.stopLive();
    iv.sort((a, b) => a - b);
    return { render: DEMO.timing(true), frameP50: +iv[iv.length >> 1].toFixed(2), frameP95: +iv[Math.floor(iv.length * 0.95)].toFixed(2) };
  });
  R.live = liveT;
  if (SHOTS) {
    await page.evaluate(() => DEMO.sheet(false));
    await page.screenshot({ path: path.join(OUT, `${v.id}-pictograms.png`), fullPage: false });
    await page.evaluate(() => DEMO.sheet(true));
    await page.screenshot({ path: path.join(OUT, `${v.id}-pictograms-hc.png`), fullPage: false });
  }
  if (errors.length) fail.push(`${v.id}: ${errors.length} page errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));

for (const [id, R] of Object.entries(report.views)) {
  console.log(`\n${id}: presented events / peak particles: ` + R.scenes.map(s => `${s.scene} ${s.presented}/${s.events} ${s.peakParticles}p`).join(' · '));
  console.log(`  FX.render bench (ms/frame, per-frame min of 2 replays): scene p50 / p95 / p99 / max  [with software raster p50 / p95]`);
  for (const b of R.bench) console.log(`  ${b.scene.padEnd(16)} ${b.p50.toFixed(2)} / ${b.p95.toFixed(2)} / ${b.p99.toFixed(2)} / ${b.max.toFixed(2)}  [${b.fullP50.toFixed(2)} / ${b.fullP95.toFixed(2)}]  peak ${b.peak}p`);
  console.log(`  live rAF countdown: render p50 ${R.live.render.p50} p95 ${R.live.render.p95} max ${R.live.render.max} · frame interval p50 ${R.live.frameP50} p95 ${R.live.frameP95} · errors ${R.errors.length}`);
}
console.log(fail.length ? '\nFAIL\n  ' + fail.join('\n  ') : '\nPASS');
process.exit(fail.length ? 1 : 0);

async function gameCheck() {
  const os = await import('node:os');
  const src = typeof args.game === 'string' ? path.resolve(args.game) : path.join(HERE, '..', 'index.html');
  const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + fs.readFileSync(src, 'utf8') + '</body></html>';
  const file = path.join(os.tmpdir(), 'ooh-fx-game.html');
  fs.writeFileSync(file, html);
  const fails = [];
  for (const v of [{ id: 'mobile', w: 360, h: 740, dpr: 2 }, { id: 'desk', w: 1440, h: 900, dpr: 1 }].filter(v => !args.only || args.only === v.id)) {
    const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr });
    const page = await ctx.newPage();
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message || e)));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await page.goto(pathToFileURL(file).href + '?seed=fx-check');
    await page.waitForFunction(() => window.__game && typeof FX !== 'undefined', null, { timeout: 15000 });
    await page.waitForTimeout(700);
    // time FX.render per frame in place (the core looks FX.render up on every call)
    await page.evaluate(() => { const r = FX.render; window.__fxT = []; FX.render = function () { const t = performance.now(); r(); window.__fxT.push(performance.now() - t); }; });
    const ui = () => page.evaluate(() => document.getElementById('app').dataset.ui);
    const shot = async n => { if (SHOTS) await page.screenshot({ path: path.join(OUT, `game-${v.id}-${n}.png`) }); };
    const skyPx = () => page.evaluate(() => { const c = document.getElementById('sky'), g = c.getContext('2d'), d = g.getImageData(Math.floor(c.width / 2), 4, 1, 1).data; return [d[0], d[1], d[2]]; });
    await shot('build');
    const u0 = await ui();
    await page.evaluate(() => { const b = document.getElementById('fire'); if (b && !b.disabled) b.click(); else window.__game.act({ type: 'light' }); });
    await page.waitForTimeout(1100); await shot('mid');
    const mid = await page.evaluate(() => ({ st: FX.stats(), ui: document.getElementById('app').dataset.ui, meters: document.querySelectorAll('#sky-overlay .cheer').length }));
    let t0 = Date.now(), u = await ui();
    while (u === 'RESOLVING' && Date.now() - t0 < 15000) { await page.waitForTimeout(150); u = await ui(); }
    await page.waitForTimeout(250); await shot('result');
    const px = await skyPx();
    const res = await page.evaluate(() => { const a = window.__fxT.slice().sort((x, y) => x - y), q = p => +(a[Math.min(a.length - 1, Math.floor(p * a.length))] || 0).toFixed(2); return { frames: a.length, p50: q(0.5), p95: q(0.95), max: q(1), st: FX.stats() }; });
    console.log(`game ${v.id}: ${u0} → ${mid.ui} → ${u} · FX.render ${res.frames} frames p50 ${res.p50} p95 ${res.p95} max ${res.max} ms · peak ${res.st.peak} particles · canvas ${res.st.w}×${res.st.h}@${res.st.dpr} · RESULT sky px ${px} · DOM meters ${mid.meters} · errors ${errors.length}`);
    if (errors.length) fails.push(`${v.id}: page errors: ${errors.slice(0, 3).join(' | ')}`);
    if (mid.ui !== 'RESOLVING') fails.push(`${v.id}: mid-chain UI is ${mid.ui}`);
    if (u === 'RESOLVING') fails.push(`${v.id}: still RESOLVING after 15 s`);
    if (px[0] + px[1] + px[2] === 0) fails.push(`${v.id}: the sky is black at ${u}`);
    if (res.p95 > 6) fails.push(`${v.id}: FX.render p95 ${res.p95} ms > 6`);
    await ctx.close();
  }
  console.log(fails.length ? 'FAIL\n  ' + fails.join('\n  ') : 'PASS');
  if (fails.length) process.exitCode = 1;
}
