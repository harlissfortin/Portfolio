// Render source/video.html frame by frame against source/timing.json and mux with the narration.
// Usage: node tooling/render.js [--workers 3] [--from s] [--to s] [--out file.mp4] [--stills t1,t2,...] [--mux-only]
// --mux-only re-muxes existing build/seg-*.mp4 with the current narration (for audio-only changes).
// --clean renders without burned-in caption text (for LMS players that draw captions.vtt themselves).
// Deterministic: every frame is window.seek(t) followed by a screenshot; nothing depends on wall-clock time.
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build'); fs.mkdirSync(BUILD, { recursive: true });
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const timing = JSON.parse(fs.readFileSync(path.join(ROOT, 'source/timing.json'), 'utf8'));
const FPS = timing.fps || 30;
const W = 1920, H = 1080;
const from = parseFloat(arg('from', 0)), to = parseFloat(arg('to', timing.duration));
const workers = parseInt(arg('workers', 3));
const out = path.resolve(arg('out', path.join(ROOT, 'two-minute-rule.mp4')));
const stills = arg('stills', null);

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exitCode = 1; });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('console:', m.text()); });
  await page.addInitScript(t => { window.TIMING = t; }, timing);
  await page.goto('file://' + path.join(ROOT, 'source/video.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.ready && window.ready());
  if (process.argv.includes('--clean')) await page.addStyleTag({ content: '#cap span { display: none !important; }' });
  return page;
}

async function renderStills(list) {
  const browser = await chromium.launch();
  const page = await openPage(browser);
  const dir = path.join(BUILD, 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const s of list) {
    const t = parseFloat(s);
    await page.evaluate(t => window.seek(t), t);
    const f = path.join(dir, `still-${t.toFixed(2).padStart(7, '0')}.png`);
    await page.screenshot({ path: f });
    console.log(f);
  }
  await browser.close();
}

async function renderSegment(browser, i, f0, f1) {
  const page = await openPage(browser);
  const seg = path.join(BUILD, `seg-${String(i).padStart(2, '0')}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
  for (let f = f0; f < f1; f++) {
    await page.evaluate(t => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 300 === 0) console.log(`worker ${i}: frame ${f - f0}/${f1 - f0}`);
  }
  ff.stdin.end(); await done; await page.close();
  return seg;
}

(async () => {
  if (stills) return renderStills(stills.split(','));
  const F0 = Math.round(from * FPS), F1 = Math.round(to * FPS), n = F1 - F0;
  const t0 = Date.now();
  let segs;
  if (process.argv.includes('--mux-only')) {
    segs = fs.readdirSync(BUILD).filter(f => /^seg-\d+\.mp4$/.test(f)).sort().map(f => path.join(BUILD, f));
    if (!segs.length) throw new Error('no segments to mux');
  } else {
    const browser = await chromium.launch();
    const bounds = Array.from({ length: workers }, (_, i) => [F0 + Math.floor(n * i / workers), F0 + Math.floor(n * (i + 1) / workers)]);
    segs = await Promise.all(bounds.map(([a, b], i) => renderSegment(browser, i, a, b)));
    await browser.close();
  }
  const list = path.join(BUILD, 'segments.txt');
  fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
  // the mixed soundtrack (tooling/mix.py: voice + music bed + cues) when present, else the bare narration
  const wav = fs.existsSync(path.join(BUILD, 'mix.wav')) ? path.join(BUILD, 'mix.wav') : path.join(BUILD, 'narration.wav');
  // chapter markers from the scene list, for players and LMS navigation
  const chap = [';FFMETADATA1', 'title=The 2-Minute Rule'];
  const titleOf = sc => sc.chapter || (sc.id === timing.scenes[0].id ? 'Intro' : 'Close');
  timing.scenes.forEach(sc => chap.push('[CHAPTER]', 'TIMEBASE=1/1000', `START=${Math.round(sc.start * 1000)}`, `END=${Math.round(sc.end * 1000)}`, `title=${titleOf(sc)}`));
  const chapFile = path.join(BUILD, 'chapters.txt'); fs.writeFileSync(chapFile, chap.join('\n') + '\n');
  // two-pass loudness normalization to -16 LUFS; the -2.5 dBTP ceiling leaves room for AAC overshoot and cue transients so the file stays under -1.5 dBTP
  const meas = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-i', wav, '-af', 'loudnorm=I=-16:TP=-2.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const m = JSON.parse(meas.slice(meas.lastIndexOf('{'), meas.lastIndexOf('}') + 1));
  const ln = `loudnorm=I=-16:TP=-2.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
    '-ss', String(from), '-t', String(to - from), '-i', wav, '-i', chapFile,
    '-map', '0:v', '-map', '1:a', '-map_metadata', '2', '-map_chapters', '2', '-metadata:s:a:0', 'language=eng', '-metadata:s:v:0', 'language=eng', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p',
    '-af', `${ln},aresample=48000,alimiter=limit=0.75:attack=1:release=50:level=0`, '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-movflags', '+faststart', '-shortest',
    '-metadata', 'title=The 2-Minute Rule', out], { stdio: 'inherit' });
  console.log(`rendered ${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s -> ${out}`);
  // poster / LMS thumbnail: the title card
  const titleEnd = timing.scenes[0].end - 0.25;
  if (!process.argv.includes('--clean')) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(titleEnd), '-i', out, '-frames:v', '1', path.join(path.dirname(out), 'poster.png')]);
})().catch(e => { console.error(e); process.exit(1); });
