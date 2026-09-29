#!/usr/bin/env node
// Ooh × Aah: fx.js self-test. Owner: fx.
//
// Drives tools/fx-demo.html (the real src/sim.js + src/fx.js, no build) in headless Chromium at 360×740 (DPR 2)
// and 1440×900 (DPR 1, with the desktop backdrop), in the normal, reduced-motion and high-contrast variants.
// Every scenario is stepped deterministically (FX.update(1/60) + FX.render() per frame) and every render is timed.
//
//   node tools/fx-demo.mjs [--only=mobile|desk] [--scenes=a,b] [--no-shots] [--flush]
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

const browser = await chromium.launch();
const report = { when: new Date().toISOString(), views: {} };
let fail = [];
for (const v of VIEWS) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr });
  const page = await ctx.newPage();
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL0);
  await page.waitForFunction(() => window.DEMO && typeof FX !== 'undefined', null, { timeout: 8000 }).catch(e => { console.error(errors); throw e; });
  await page.evaluate(() => document.body.classList.add('shot'));
  const R = report.views[v.id] = { scenes: [], errors };
  for (const [scene, o, shots] of PLAN) {
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
    if (row.p95 > 6) fail.push(`${v.id} ${tag}: render p95 ${row.p95} ms > 6`);
    if (row.peakParticles > 400) fail.push(`${v.id} ${tag}: ${row.peakParticles} particles > 400`);
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
  console.log(`\n${id}: scene                events  p50   p95   p99   max  (ms render/frame)  peak particles`);
  for (const s of R.scenes) console.log(`  ${s.scene.padEnd(18)} ${String(s.presented + '/' + s.events).padStart(7)} ${s.p50.toFixed(2).padStart(5)} ${s.p95.toFixed(2).padStart(5)} ${s.p99.toFixed(2).padStart(5)} ${s.max.toFixed(2).padStart(5)}   ${String(s.peakParticles).padStart(4)}`);
  console.log(`  live rAF countdown: render p50 ${R.live.render.p50} p95 ${R.live.render.p95} max ${R.live.render.max} · frame interval p50 ${R.live.frameP50} p95 ${R.live.frameP95} · errors ${R.errors.length}`);
}
console.log(fail.length ? '\nFAIL\n  ' + fail.join('\n  ') : '\nPASS');
process.exit(fail.length ? 1 : 0);
