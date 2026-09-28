#!/usr/bin/env node
// Ooh × Aah: audio self-test (src/audio.js).
//   node tools/audio-check.mjs [--levels]
// 1. No-WebAudio page: every API call and event is a silent no-op.
// 2. Live page: lazy unlock on a real click, every §9 event and UI sound, every music phase,
//    rationed heartbeat, 8-voice limiter with oldest-steal, 30 ms de-dup, suspend/resume/hidden.
// 3. OfflineAudioContext: every recipe renders non-silent and peaks below 1.0.
// Exit 0 = PASS, 1 = FAIL.
import { createRequire } from 'module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = fs.readFileSync(path.join(HERE, '../src/audio.js'), 'utf8');
const LEVELS = process.argv.includes('--levels');

let failed = 0;
const check = (cond, msg) => { console.log(`${cond ? '  ok  ' : '  FAIL'} ${msg}`); if (!cond) failed++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const isFontNoise = t => /fonts\.(googleapis|gstatic)\.com|font/i.test(t);

function watch(page) {
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !isFontNoise(m.text())) errs.push('console: ' + m.text()); });
  return errs;
}

// Every §9 event with a representative payload, and the sound ids it must trigger ([] = silent by design).
const COLS = ['R', 'A', 'G', 'B', 'W'];
const EVENTS = [
  [{ type: 'buildOpen', show: 0, target: 100, rules: [], sponsor: null, mood: 'hopeful' }, ['page']],
  [{ type: 'moodChanged', bucket: 'restless', preview: false }, ['mood']],
  [{ type: 'moodChanged', bucket: 'hopeful' }, ['mood']],
  [{ type: 'moodChanged', bucket: 'eager' }, ['mood']],
  [{ type: 'bought', card: 0, to: { zone: 'tube', i: 0 }, shell: { id: 'peony', col: 'R', star: 1 } }, ['drop']],
  [{ type: 'upgraded', shell: { id: 'palm', col: 'A', star: 2 } }, ['drop']],
  [{ type: 'moved', col: 'G' }, ['drop']],
  [{ type: 'sold', shell: { id: 'comet', col: 'B' } }, ['drop']],
  [{ type: 'rigInstalled', tube: 1, id: 'brass' }, ['drop']],
  [{ type: 'tubeAdded' }, ['drop']],
  [{ type: 'matched' }, ['drop']],
  [{ type: 'rerolled' }, ['shuffle']],
  [{ type: 'fuseLit' }, ['hiss']],
  [{ type: 'launch', tube: 0 }, ['thump']],
  [{ type: 'burst', tube: 0, shell: { id: 'crackle', col: 'W', star: 2 }, col: 'W', sees: 3 }, ['burst', 'link']],
  [{ type: 'burst', tube: 1, shell: 'glitter', col: 'A', sees: [1, 2], half: true }, ['burst', 'link']],
  [{ type: 'burst', tube: 2, shell: 'peony', col: 'W', washed: true }, ['burst', 'link']],
  [{ type: 'burst', tube: 3, shell: 'peony', col: 'R', dud: true }, ['burst']],
  [{ type: 'gainOoh', v: 80, tube: 0 }, ['ooh']],
  [{ type: 'gainOoh', v: 2e6, tube: 0 }, ['ooh']],
  [{ type: 'gainAah', v: 6 }, ['aah']],
  [{ type: 'multAah', factor: 1.8 }, ['bell']],
  [{ type: 'multAah', factor: 9 }, ['bell']],
  [{ type: 'fusion', name: 'Palm Grove', first: true }, ['fusion']],
  [{ type: 'clear', n: 3 }, ['clear']],
  [{ type: 'extend', n: 2 }, ['extend']],
  [{ type: 'repeat', from: 1, rate: 1 }, ['echo']],
  [{ type: 'crowdGain', v: 4 }, ['swell']],
  [{ type: 'coinGain', v: 1 }, ['coin']],
  [{ type: 'skyAge', expired: [3] }, []],
  [{ type: 'crowdCheer', v: 84 }, ['roar']],
  [{ type: 'applause', ooh: 290, aah: 3, score: 870, target: 300, pass: true, encore: true }, ['applause']],
  [{ type: 'applause', ooh: 90, aah: 2, score: 180, target: 300, pass: false }, ['miss']],
  [{ type: 'payout', total: 7, base: 5, interest: 2 }, ['payout']],
  [{ type: 'rainCheck' }, []],
  [{ type: 'critical' }, []],
  [{ type: 'relight' }, ['rise']],
  [{ type: 'milestone', id: 'm_busy', value: 6 }, ['tick']],
  [{ type: 'runLost' }, ['drone']],
  [{ type: 'illegal', reason: 'coins' }, ['error']],
  [{ type: 'unknownThing' }, []],
];

// Every recipe, rendered offline: [recipe, params, min peak].
const RENDERS = [
  ['pluck', { col: 'R' }, .05], ['pluck', { col: 'B' }, .05], ['coin', {}, .02], ['coin', { n: 5 }, .02],
  ['drop', { col: 'G', up: 1, coin: 1 }, .05], ['shuffle', {}, .02], ['tick', {}, .02], ['error', {}, .02],
  ['hiss', {}, .02], ['thump', {}, .1], ['burst', { col: 'R', tier: 0 }, .05], ['burst', { col: 'W', tier: 6, crackle: 1 }, .05],
  ['burst', { col: 'D', g: .15 }, .01], ['chime', { f: 523.25 }, .05], ['chime', { f: 3520 }, .05], ['page', {}, .02],
  ['vowel', { m: 0, g: .15, n: 1 }, .03], ['vowel', { m: 1, g: .15, n: 1 }, .03], ['vowel', { m: 0, g: .5, r: .7, n: 3 }, .1],
  ['vowel', { m: 1, g: .5, r: .7, n: 3 }, .1], ['murmur', { b: 'restless' }, .004], ['murmur', { b: 'hopeful' }, .004],
  ['murmur', { b: 'eager' }, .004], ['swell', {}, .02], ['bell', { tier: 0 }, .1], ['bell', { tier: 6 }, .1], ['fusion', {}, .05],
  ['clear', {}, .1], ['echo', {}, .02], ['roar', { g: .05, d: 1.2 }, .01], ['roar', { g: .5, d: 2.5 }, .1], ['miss', {}, .05],
  ['rise', {}, .05], ['beat', {}, .01], ['fanfare', {}, .1], ['drone', {}, .03],
];

const browser = await chromium.launch();
try {
  // ---------------------------------------------------------------- 1. no WebAudio
  console.log('No WebAudio:');
  {
    const page = await browser.newPage();
    const errs = watch(page);
    await page.setContent(`<script>delete window.AudioContext; delete window.webkitAudioContext; window.AudioContext = undefined;</script><script>${SRC}\n</script>`);
    const r = await page.evaluate(evs => {
      const out = [];
      const all = () => {
        AUDIO.unlock(); AUDIO.setSettings({ sound: true, soundVol: .5, music: true, musicVol: .3 }); AUDIO.setSettings(null);
        for (const p of ['build', 'resolve', 'paused', 'off', 'bogus']) AUDIO.setPhase(p);
        AUDIO.setCrowd(90); AUDIO.setCrowd('x');
        for (const e of evs) AUDIO.onEvent(e);
        AUDIO.onEvent(null); AUDIO.onEvent(undefined); AUDIO.onEvent({ type: 'burst', shell: null, sees: null });
        for (const n of ['pluck', 'coin', 'shuffle', 'tick', 'chime', 'error', 'nope']) AUDIO.ui(n, { col: 'R' });
        AUDIO.ui('pluck'); AUDIO.suspend(); AUDIO.resume();
      };
      try { all(); out.push('ok'); } catch (e) { out.push('threw: ' + e.message); }
      return { out, ctx: AUDIO._t.ctx() };
    }, EVENTS.map(e => e[0]));
    check(r.out[0] === 'ok', 'every API call and event is a no-op without WebAudio (' + r.out[0] + ')');
    check(!r.ctx, 'no AudioContext exists');
    check(errs.length === 0, 'no console errors ' + errs.join(' | '));
    await page.close();
  }

  // ---------------------------------------------------------------- 2. live page
  console.log('Live page:');
  const page = await browser.newPage();
  const errs = watch(page);
  await page.setContent(`<button id="go" style="width:240px;height:120px">tap</button><script>${SRC}\n;document.getElementById('go').addEventListener('pointerdown', () => AUDIO.unlock());</script>`);
  const pre = await page.evaluate(evs => {
    AUDIO.setSettings({ sound: true, soundVol: .8, music: true, musicVol: .35 }); AUDIO.setPhase('build'); AUDIO.setCrowd(10);
    for (const e of evs) AUDIO.onEvent(e);
    AUDIO.ui('pluck', { col: 'R' });
    return !!AUDIO._t.ctx();
  }, EVENTS.map(e => e[0]));
  check(!pre, 'AudioContext is not created before unlock()');
  await page.click('#go');
  await page.waitForFunction(() => AUDIO._t.ctx() && AUDIO._t.ctx().state === 'running', null, { timeout: 5000 });
  check(true, 'click → unlock() → AudioContext running');
  const graph = await page.evaluate(() => {
    const c = AUDIO._t.ctx();
    return { rate: c.sampleRate };
  });
  check(graph.rate > 0, `context sample rate ${graph.rate}`);

  // Music phases.
  await sleep(900);
  let g = await page.evaluate(() => ({ m: AUDIO._t.music(), g: AUDIO._t.gains() }));
  check(g.m === 1, 'music plays in build');
  check(Math.abs(g.g[1] - .35) < .03, `music gain ≈ 0.35 in build (${g.g[1].toFixed(3)})`);
  check(Math.abs(g.g[0] - .8) < .03, `sfx gain ≈ 0.8 (${g.g[0].toFixed(3)})`);
  await page.evaluate(() => AUDIO.setPhase('resolve'));
  await sleep(900);
  g = await page.evaluate(() => ({ m: AUDIO._t.music(), g: AUDIO._t.gains() }));
  check(g.m === 1 && Math.abs(g.g[1] - .35 * 10 ** (-8 / 20)) < .02, `music ducks −8 dB in resolve (${g.g[1].toFixed(3)})`);
  await page.evaluate(() => AUDIO.setPhase('paused'));
  await sleep(300);
  check(await page.evaluate(() => AUDIO._t.music()) === 0, 'music stops on paused');
  await page.evaluate(() => AUDIO.setPhase('build'));
  await sleep(300);
  check(await page.evaluate(() => AUDIO._t.music()) === 1, 'music restarts on build');
  await page.evaluate(() => AUDIO.setPhase('off'));
  await sleep(300);
  check(await page.evaluate(() => AUDIO._t.music()) === 0, 'music stops on off');
  await page.evaluate(() => { AUDIO.setPhase('build'); AUDIO.setSettings({ music: false }); });
  await sleep(300);
  check(await page.evaluate(() => AUDIO._t.music()) === 0, 'music off setting stops music');
  await page.evaluate(() => AUDIO.setSettings({ music: true, musicVol: .35 }));
  await sleep(300);
  check(await page.evaluate(() => AUDIO._t.music()) === 1, 'music on setting restarts music');
  // Let the music-box line run for a few seconds (build phase), then check the pad cross-fade has scheduled.
  await sleep(2500);

  // Every event.
  for (const [ev, ids] of EVENTS) {
    const d = await page.evaluate(ev => {
      const before = { ...AUDIO._t.count };
      AUDIO.onEvent(ev);
      const after = AUDIO._t.count;
      return Object.keys(after).filter(k => after[k] !== before[k]);
    }, ev);
    const want = ids.slice().sort().join(','), got = d.sort().join(',');
    check(want === got, `${ev.type}${ev.dud ? ' (dud)' : ''}${ev.pass === false ? ' (miss)' : ''} → [${got}]`);
    await sleep(40);
  }
  // Top tier: a Headliner clear, then runWon (fanfare gated to one per 3 s).
  await page.evaluate(() => AUDIO.onEvent({ type: 'buildOpen', show: 2, rules: ['fog'] }));
  await sleep(40);
  let d = await page.evaluate(() => { const b = AUDIO._t.count.fanfare || 0; AUDIO.onEvent({ type: 'applause', score: 500, target: 400, pass: true }); return (AUDIO._t.count.fanfare || 0) - b; });
  check(d === 1, 'Headliner clear → fanfare');
  d = await page.evaluate(() => { const b = AUDIO._t.count.fanfare || 0; AUDIO.onEvent({ type: 'runWon' }); return (AUDIO._t.count.fanfare || 0) - b; });
  check(d === 0, 'runWon right after a Headliner-clear fanfare does not double up');
  await sleep(3100);
  d = await page.evaluate(() => { const b = AUDIO._t.count.fanfare || 0; AUDIO.onEvent({ type: 'runWon' }); return (AUDIO._t.count.fanfare || 0) - b; });
  check(d === 1, 'runWon → fanfare');
  await page.evaluate(() => AUDIO.onEvent({ type: 'buildOpen', show: 3, rules: [] }));
  await sleep(3100);
  d = await page.evaluate(() => { const b = AUDIO._t.count.fanfare || 0; AUDIO.onEvent({ type: 'applause', score: 500, target: 400, pass: true }); AUDIO.onEvent({ type: 'applause', score: 900, target: 400, pass: true, runBest: true }); return (AUDIO._t.count.fanfare || 0) - b; });
  check(d === 1, 'Twilight clear: no fanfare; a run-best flag → fanfare');

  // Link chime climbs the pentatonic.
  d = await page.evaluate(async () => {
    AUDIO.onEvent({ type: 'fuseLit' });
    const n = [];
    for (let i = 0; i < 12; i++) { AUDIO.onEvent({ type: 'burst', shell: 'peony', col: 'R' }); n.push(AUDIO._t.count.link); await new Promise(r => setTimeout(r, 35)); }
    return n;
  });
  check(d[11] - d[0] === 11, 'link chime fires once per burst across a 12-burst chain');

  // UI sounds.
  for (const n of ['pluck', 'coin', 'shuffle', 'tick', 'chime', 'error']) {
    for (const col of n === 'pluck' ? COLS : [undefined]) {
      const k = await page.evaluate(([n, col]) => { const b = AUDIO._t.count['ui-' + n] || 0; AUDIO.ui(n, { col }); return (AUDIO._t.count['ui-' + n] || 0) - b; }, [n, col]);
      check(k === 1, `ui('${n}'${col ? `, {col:'${col}'}` : ''})`);
      await sleep(40);
    }
  }

  // De-dup and the voice limiter.
  d = await page.evaluate(() => { const b = AUDIO._t.count.thump || 0; for (let i = 0; i < 20; i++) AUDIO.onEvent({ type: 'launch', tube: 0 }); return AUDIO._t.count.thump - b; });
  check(d === 1, `30 ms de-dup: 20 identical launches in one tick → ${d} voice`);
  await sleep(3200);
  const lim = await page.evaluate(() => {
    const s0 = AUDIO._t.steals(), v0 = AUDIO._t.voices();
    const evs = [{ type: 'clear' }, { type: 'fusion' }, { type: 'multAah', factor: 2 }, { type: 'crowdCheer', v: 90 }, { type: 'applause', score: 3, target: 1, pass: true },
      { type: 'runLost' }, { type: 'gainOoh', v: 50 }, { type: 'gainAah', v: 5 }, { type: 'extend' }, { type: 'repeat' }, { type: 'crowdGain' }, { type: 'fuseLit' }];
    const peak = [];
    for (const e of evs) { AUDIO.onEvent(e); peak.push(AUDIO._t.voices()); }
    return { v0, peak, steals: AUDIO._t.steals() - s0 };
  });
  check(Math.max(...lim.peak) <= 8, `limiter caps concurrent one-shots at 8 (voices after each of 12 cues: ${lim.peak.join(' ')})`);
  check(lim.peak[lim.peak.length - 1] === 8, 'limiter holds exactly 8 once saturated');
  check(lim.steals >= 12 - 8 - lim.v0, `oldest voices are stolen (${lim.steals} steals)`);

  // Heartbeat rationing (§5.4): first build after the miss, then only Headliner / Countdown builds.
  await page.evaluate(() => { AUDIO.onEvent({ type: 'runStart' }); AUDIO.setPhase('build'); AUDIO.onEvent({ type: 'buildOpen', show: 3, rules: [] }); });
  const beats = () => page.evaluate(() => AUDIO._t.count.beat || 0);
  let b0 = await beats(); await sleep(1300);
  check(await beats() === b0, 'no heartbeat before any miss');
  await page.evaluate(() => { AUDIO.onEvent({ type: 'fuseLit' }); AUDIO.setPhase('resolve'); AUDIO.onEvent({ type: 'applause', score: 1, target: 9, pass: false }); AUDIO.onEvent({ type: 'rainCheck' }); AUDIO.onEvent({ type: 'critical' }); AUDIO.onEvent({ type: 'buildOpen', show: 4, rules: [] }); });
  b0 = await beats(); await sleep(700);
  check(await beats() === b0, 'heartbeat waits for the build phase');
  await page.evaluate(() => AUDIO.setPhase('build'));
  b0 = await beats(); await sleep(2450);
  const nb = await beats() - b0;
  check(nb >= 2 && nb <= 3, `heartbeat every 1.1 s on the first build after the miss (${nb} in 2.45 s)`);
  await page.evaluate(() => { AUDIO.onEvent({ type: 'fuseLit' }); AUDIO.setPhase('resolve'); });
  b0 = await beats(); await sleep(1300);
  check(await beats() === b0, 'heartbeat stops when the fuse is lit');
  await page.evaluate(() => { AUDIO.onEvent({ type: 'buildOpen', show: 5, rules: ['fog'] }); AUDIO.setPhase('build'); });
  b0 = await beats(); await sleep(1300);
  check(await beats() > b0, 'heartbeat on a later Headliner build');
  await page.evaluate(() => { AUDIO.onEvent({ type: 'fuseLit' }); AUDIO.onEvent({ type: 'buildOpen', show: 6, rules: ['drizzle'] }); AUDIO.setPhase('build'); });
  b0 = await beats(); await sleep(1300);
  check(await beats() === b0, 'no heartbeat on a later Twilight/Evening build');
  await page.evaluate(() => { AUDIO.onEvent({ type: 'fuseLit' }); AUDIO.onEvent({ type: 'buildOpen', show: 23, rules: ['countdown'] }); AUDIO.setPhase('build'); });
  b0 = await beats(); await sleep(1300);
  check(await beats() > b0, 'heartbeat on the Countdown build');
  await page.evaluate(() => { AUDIO.setPhase('paused'); });
  b0 = await beats(); await sleep(1300);
  check(await beats() === b0, 'heartbeat silent while paused');
  await page.evaluate(() => { AUDIO.onEvent({ type: 'runLost' }); AUDIO.setPhase('build'); AUDIO.onEvent({ type: 'buildOpen', show: 5, rules: ['fog'] }); });
  b0 = await beats(); await sleep(1300);
  check(await beats() === b0, 'run end clears the critical state');

  // Settings: sound off silences one-shots.
  d = await page.evaluate(() => { AUDIO.setSettings({ sound: false }); const b = AUDIO._t.count.fusion || 0; AUDIO.onEvent({ type: 'fusion' }); const k = (AUDIO._t.count.fusion || 0) - b; AUDIO.setSettings({ sound: true, sfxVol: .6 }); return k; });
  check(d === 0, 'sound off → no one-shots');
  await sleep(300);
  g = await page.evaluate(() => AUDIO._t.gains());
  check(Math.abs(g[0] - .6) < .05, `sfxVol alias sets the sfx gain (${g[0].toFixed(3)})`);

  // Suspend / resume / hidden.
  let st = await page.evaluate(async () => { AUDIO.suspend(); await new Promise(r => setTimeout(r, 200)); return AUDIO._t.ctx().state; });
  check(st === 'suspended', 'suspend() suspends the context');
  d = await page.evaluate(() => { const b = AUDIO._t.count.clear || 0; AUDIO.onEvent({ type: 'clear' }); return (AUDIO._t.count.clear || 0) - b; });
  check(d === 0, 'no one-shots are queued while suspended');
  await page.mouse.click(600, 500); // a gesture outside the unlock button: only AUDIO's own wake listener sees it
  st = await page.evaluate(async () => { await new Promise(r => setTimeout(r, 200)); return AUDIO._t.ctx().state; });
  check(st === 'suspended', 'an explicit suspend() is not undone by a stray gesture (the core calls resume())');
  st = await page.evaluate(async () => { AUDIO.resume(); await new Promise(r => setTimeout(r, 300)); return AUDIO._t.ctx().state; });
  check(st === 'running', 'resume() resumes the context');
  st = await page.evaluate(async () => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise(r => setTimeout(r, 300));
    return AUDIO._t.ctx().state;
  });
  check(st === 'suspended', 'tab hidden → context suspended');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await sleep(200);
  st = await page.evaluate(() => AUDIO._t.ctx().state);
  check(st === 'suspended', 'visible again: stays suspended until the next gesture (tap to continue)');
  await page.click('#go');
  await sleep(300);
  st = await page.evaluate(() => AUDIO._t.ctx().state);
  check(st === 'running', 'next gesture resumes');

  // ---------------------------------------------------------------- 3. offline renders
  console.log('Offline renders (raw recipe output, before the bus, master and compressor):');
  const res = await page.evaluate(async list => {
    const out = [];
    for (const [n, p] of list) {
      const c = new OfflineAudioContext(1, 44100 * 3.5, 44100);
      AUDIO._t.run(n, p, .01, c.destination, c);
      const d = (await c.startRendering()).getChannelData(0);
      let peak = 0, s = 0;
      for (const x of d) { peak = Math.max(peak, Math.abs(x)); s += x * x; }
      out.push({ peak, rms: Math.sqrt(s / d.length) });
    }
    return { out, recipes: Object.keys(AUDIO._t.R) };
  }, RENDERS);
  const covered = new Set(RENDERS.map(r => r[0]));
  const missing = res.recipes.filter(r => !covered.has(r));
  check(missing.length === 0, `every recipe is rendered (${res.recipes.length})${missing.length ? ' missing: ' + missing : ''}`);
  RENDERS.forEach(([n, p, min], i) => {
    const { peak, rms } = res.out[i];
    const label = `${n} ${JSON.stringify(p)}`.padEnd(44);
    check(peak >= min && peak < 1 && rms > 0, `${label} peak ${peak.toFixed(3)}  rms ${rms.toFixed(4)}`);
  });
  if (LEVELS) console.log(JSON.stringify(res.out));

  check(errs.length === 0, 'no console errors or page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await page.close();
} finally {
  await browser.close();
}
console.log(failed ? `FAIL (${failed})` : 'PASS');
process.exit(failed ? 1 : 0);
