// Resolve the sound-cue times from the scene code, with the same time grammar the picture uses, into build/events.json.
// Sources: window.SFX entries ([ref, scene, kind], e.g. prediction ticks), plus cues read from the markup:
// the Stop · Look · Ask · Decide sting at the start of each save, every red catch ring, and every Go in a case card.
// Usage: node tooling/events.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const timing = JSON.parse(fs.readFileSync(path.join(ROOT, 'source/timing.json'), 'utf8'));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(t => { window.TIMING = t; }, timing);
  await p.goto('file://' + path.join(ROOT, 'source/video.html'));
  await p.evaluate(() => window.ready());
  const ev = await p.evaluate(() => {
    const out = [], R = window.REF, refOf = (el) => (el.getAttribute('data-in') || '').trim().split(/\s+/)[1];
    for (const [r, sc, kind] of window.SFX || []) out.push({ t: R(r, sc), kind, src: `${sc} ${r}` });
    document.querySelectorAll('section[data-scene^="save-"]').forEach(s => out.push({ t: R('^0.08', s.dataset.scene), kind: 'sting', src: s.dataset.scene }));
    document.querySelectorAll('.throb').forEach(el => { const host = el.parentElement, sc = el.closest('section').dataset.scene; out.push({ t: R(refOf(host), sc), kind: 'ring', src: `${sc} ${refOf(host)}` }); });
    document.querySelectorAll('.casecard .minibtn.go').forEach(el => { const sc = el.closest('section').dataset.scene; out.push({ t: R(refOf(el), sc), kind: 'go', src: `${sc} ${refOf(el)}` }); });
    return out.sort((a, b) => a.t - b.t);
  });
  await b.close();
  if (errs.length) { console.error('page errors:\n' + errs.join('\n')); process.exit(1); }
  fs.writeFileSync(path.join(ROOT, 'build/events.json'), JSON.stringify(ev, null, 1));
  const n = {}; ev.forEach(e => (n[e.kind] = (n[e.kind] || 0) + 1));
  console.log(ev.length, 'sound cues', JSON.stringify(n));
})().catch(e => { console.error(e); process.exit(1); });
