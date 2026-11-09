// Render one still per cue (near the end of each cue, when its visual beat has landed) and tile them into contact sheets.
// Usage: node tooling/stills.js [scenePrefix] [--at end|start|mid]   -> build/sheets/sheet-NN.png
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'build/sheets');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const timing = JSON.parse(fs.readFileSync(path.join(ROOT, 'source/timing.json'), 'utf8'));
const filt = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
const at = process.argv.includes('--at') ? process.argv[process.argv.indexOf('--at') + 1] : 'end';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(t => { window.TIMING = t; }, timing);
  await p.goto('file://' + path.join(ROOT, 'source/video.html'));
  await p.evaluate(() => document.fonts.ready); await p.evaluate(() => window.ready());
  const cues = timing.cues.filter(c => !filt || c.scene.startsWith(filt) || c.id.startsWith(filt));
  const files = [];
  for (const c of cues) {
    const t = at === 'start' ? c.start + 0.25 : at === 'mid' ? (c.start + c.end) / 2 : c.end - 0.05;
    await p.evaluate(t => window.seek(t), t);
    const f = path.join(OUT, `${c.id}.png`); await p.screenshot({ path: f }); files.push([f, `${c.id}  t=${t.toFixed(1)}`]);
  }
  await b.close();
  if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].join('\n'));
  for (let i = 0; i < files.length; i += 6) {
    const chunk = files.slice(i, i + 6), sheet = path.join(OUT, `sheet-${String(i / 6 + 1).padStart(2, '0')}.png`);
    const args = []; chunk.forEach(([f, l]) => args.push('-label', l, f));
    execFileSync('montage', [...args, '-tile', '2x3', '-geometry', '940x529+6+6', '-pointsize', '22', '-background', '#888', sheet]);
    console.log(sheet);
  }
})().catch(e => { console.error(e); process.exit(1); });
