// AUDIO: procedural WebAudio (spec §10) and the §9 audio column. Never throws; silent without WebAudio.
// API: unlock() · onEvent(ev) · ui(name, {col}) · setSettings({sound, soundVol|sfxVol, music, musicVol})
//      setPhase('build'|'resolve'|'paused'|'off') · setCrowd(n) · suspend() · resume()
// _t: test hooks {voices(), steals(), count, ctx(), music(), render(recipe, params, secs) → Promise<{peak, rms}>}
const AUDIO = (() => {
  const W = typeof window === 'object' ? window : {}, AC = W.AudioContext || W.webkitAudioContext;
  const S = {sound: true, soundVol: .8, music: true, musicVol: .35};
  const PL = {R: 392, A: 440, G: 329.63, B: 523.25, W: 293.66, X: 587.33};          // pluck pitch by colour
  const BC = {R: 900, A: 1400, G: 700, B: 2000, W: 3000, X: 1700, D: 450};         // burst centre (D = dud)
  const PEN = [523.25, 587.33, 659.25, 783.99, 880];                              // C-major pentatonic, C5
  const PAD = [[130.81, 164.81, 196], [110, 130.81, 164.81], [87.31, 110, 130.81], [98, 123.47, 146.83]]; // C Am F G
  const rnd = Math.random, dB = x => 10 ** (x / 20), cl = (x, a, b) => Math.min(b, Math.max(a, x));
  let ctx, sfx, mus, bus, river, voices = [], last = {}, count = {}, steals = 0;
  let phase = 'off', crowd = 0, held = 0, mOn = 0, nChord = 0, ci = 0, nBox = 0, nBeat = 0;

  // Prebuilt 2 s white noise and brown noise (leaky integrator), one pair per context.
  const BUF = new WeakMap();
  const bufs = c => {
    let b = BUF.get(c);
    if (!b) {
      const n = 2 * c.sampleRate, w = c.createBuffer(1, n, c.sampleRate), br = c.createBuffer(1, n, c.sampleRate);
      const wd = w.getChannelData(0), bd = br.getChannelData(0);
      for (let i = 0, y = 0; i < n; i++) { wd[i] = rnd() * 2 - 1; y = (y + .02 * wd[i]) / 1.02; bd[i] = y * 3.5; }
      BUF.set(c, b = {w, br});
    }
    return b;
  };

  // Node helpers. o = {c: context, d: output node, e: latest stop time, j: pitch jitter}; so any recipe can target any context.
  const G = (o, v, to) => { const g = o.c.createGain(); g.gain.value = v; g.connect(to || o.d); return g; };
  const env = (o, t, pk, a, r, to) => {
    const g = G(o, 0, to), p = g.gain;
    p.setValueAtTime(1e-4, t); p.exponentialRampToValueAtTime(pk, t + a); p.exponentialRampToValueAtTime(1e-4, t + a + r);
    return g;
  };
  const F = (o, type, f, q, to) => { const n = o.c.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; n.connect(to || o.d); return n; };
  const src = (o, n, t, d, to, off) => { n.connect(to); n.start(t, off); n.stop(t + d); o.e = Math.max(o.e, t + d); return n; };
  const osc = (o, type, f, t, d, to) => { const n = o.c.createOscillator(); n.type = type; n.frequency.setValueAtTime(f * o.j, t); return src(o, n, t, d, to); };
  const noise = (o, t, d, to, br) => { const n = o.c.createBufferSource(); n.buffer = bufs(o.c)[br ? 'br' : 'w']; n.loop = true; return src(o, n, t, d, to, rnd() * 1.5); };
  const tone = (o, type, f, t, pk, a, r, to) => osc(o, type, f, t, a + r + .02, env(o, t, pk, a, r, to));
  const clicks = (o, n, t, span, g) => { for (let i = 0; i < n; i++) { const x = t + rnd() * span; noise(o, x, .005, env(o, x, g * (.4 + .6 * rnd()), 5e-4, .0035)); } };

  // Recipes (o, params, startTime).
  const R = {
    pluck(o, p, t) { const f = (PL[p.col] || PL.W) * (p.oct || 1); tone(o, 'triangle', f, t, .3, .005, .18); tone(o, 'sine', 2 * f, t, .3 * dB(-12), .005, .18); },
    coin(o, p, t) { tone(o, 'square', 1320, t, .12, .002, .16, F(o, 'lowpass', 3000, .7)).frequency.exponentialRampToValueAtTime(1760 * o.j, t + .06); },
    coins(o, p, t) { for (let i = 0; i < (p.n || 1); i++) R.coin(o, p, t + i * .07); },
    drop(o, p, t) { R.pluck(o, p, t); if (p.up) R.pluck(o, {col: p.col, oct: 2}, t + .07); if (p.coin) R.coin(o, p, t + .04); },
    shuffle(o, p, t) { const bp = F(o, 'bandpass', 2500, 1); for (let i = 0; i < 3; i++) noise(o, t + i * .06, .02, env(o, t + i * .06, .35, .001, .015, bp)); },
    tick(o, p, t) { tone(o, 'triangle', 1800, t, .1, .001, .03); },
    error(o, p, t) { const lp = F(o, 'lowpass', 900, .7); [0, .1].forEach(x => tone(o, 'square', 150, t + x, .1, .005, .07, lp)); },
    hiss(o, p, t) { noise(o, t, .36, F(o, 'bandpass', 3500 * o.j, 2, env(o, t, .15, .02, .33))); clicks(o, 6, t, .35, .25); },
    thump(o, p, t) {
      tone(o, 'sine', 90, t, .6, .003, .14).frequency.exponentialRampToValueAtTime(40 * o.j, t + .12);
      noise(o, t, .02, F(o, 'highpass', 1000, .7, env(o, t, .15, .001, .018)));
    },
    burst(o, p, t) {
      const tier = p.tier || 0;
      noise(o, t, .42 + .08 * tier, F(o, 'bandpass', (BC[p.col] || BC.W) * o.j, .8, env(o, t, p.g || .5, .005, .4 + .08 * tier)));
      if (p.crackle) clicks(o, 12 + (rnd() * 19 | 0), t + .05, .6, .3);
    },
    chime(o, p, t) { const g = p.g || .18, r = p.r || .25; tone(o, 'sine', p.f, t, g, .003, r); tone(o, 'sine', 3 * p.f, t, g * dB(-14), .003, r); },
    page(o, p, t) { R.chime(o, {f: 783.99, g: .07, r: .5}, t); R.chime(o, {f: 1046.5, g: .07, r: .6}, t + .09); },
    // Signature crowd vowel: noise + 1–3 detuned saws through two parallel band-pass formants. m: 0 = "oo", 1 = "aa".
    vowel(o, p, t) {
      const m = p.m, a = p.a || .06, r = p.r || .5, d = a + r + .05, n = p.n || 1 + (crowd >= 20) + (crowd >= 80);
      const out = env(o, t, p.g, a, r), mix = G(o, 5, F(o, 'bandpass', (300 + 430 * m) * o.j, 8 - 2 * m, out));
      mix.connect(F(o, 'bandpass', (870 + 220 * m) * o.j, 10 - 2 * m, out));
      noise(o, t, d, G(o, .35, mix));
      for (let i = 0; i < n; i++) {
        const f = p.f || 150 + rnd() * 70, s = osc(o, 'sawtooth', f, t, d, G(o, .5 / Math.sqrt(n), mix));
        s.detune.value = (i - (n - 1) / 2) * 14; s.frequency.exponentialRampToValueAtTime(f * o.j * .93, t + d);
      }
    },
    murmur(o, p, t) { const m = {restless: 0, hopeful: .5, eager: 1}[p.b] ?? .5; R.vowel(o, {m, f: 150 + 70 * m, g: dB(-30), a: .1, r: .3}, t); },
    bell(o, p, t) {
      const f = 880 * (1 + .06 * (p.tier || 0)), c = tone(o, 'sine', f, t, .3, .003, 1.2), md = G(o, 0, c.frequency);
      md.gain.setValueAtTime(3 * 3.5 * f * o.j, t); md.gain.exponentialRampToValueAtTime(1e-3, t + 1.2);
      osc(o, 'sine', 3.5 * f, t, 1.23, md);
    },
    fusion(o, p, t) { [523.25, 659.25, 783.99].forEach((f, i) => tone(o, 'triangle', f, t + i * .03, .12, .01, .69)); },
    clear(o, p, t) {
      tone(o, 'sine', 60, t, .6, .005, .3);
      const lp = F(o, 'lowpass', 400, .9, env(o, t, .3, .15, .3));
      lp.frequency.setValueAtTime(400, t); lp.frequency.exponentialRampToValueAtTime(4000, t + .4); noise(o, t, .46, lp);
    },
    echo(o, p, t) {
      const d = o.c.createDelay(.2), e = env(o, t, .12, .002, .03);
      d.delayTime.value = .09; d.connect(G(o, .3, d)); d.connect(o.d); e.connect(d);
      osc(o, 'triangle', 1500, t, .04, e); o.e = t + .7;
    },
    // Crowd roar / applause: band-passed noise, amplitude-modulated by random 10–20 Hz pulses.
    roar(o, p, t) {
      const d = p.d || 1.2, g = G(o, 0), q = g.gain, am = G(o, .5, g);
      q.setValueAtTime(1e-4, t); q.exponentialRampToValueAtTime(p.g, t + .12); q.exponentialRampToValueAtTime(p.g * .6, t + d * .6); q.exponentialRampToValueAtTime(1e-4, t + d);
      am.gain.setValueAtTime(.5, t);
      for (let x = t; x < t + d; x += 1 / (10 + 10 * rnd())) am.gain.linearRampToValueAtTime(.3 + .7 * rnd(), x);
      noise(o, t, d, F(o, 'bandpass', 1200 * o.j, .7, am));
    },
    miss(o, p, t) { tone(o, 'sine', 330, t, .25, .01, .42).frequency.setValueAtTime(220 * o.j, t + .2); R.vowel(o, {m: 0, f: 150, g: .08, a: .1, r: .6}, t + .1); },
    rise(o, p, t) { tone(o, 'sine', 220, t, .22, .01, .42).frequency.setValueAtTime(330 * o.j, t + .2); },
    beat(o, p, t) { [0, .08].forEach(x => tone(o, 'sine', 55, t + x, dB(-24), .005, .12)); },
    fanfare(o, p, t) {
      tone(o, 'sine', 50, t, .6, .005, .4);
      const lp = F(o, 'lowpass', 2000, .7);
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(o, 'sawtooth', f, t + i * .12, .15, .005, i < 4 ? .14 : .6, lp));
    },
    drone(o, p, t) { const lp = F(o, 'lowpass', 250, .7, env(o, t, .2, .4, 2.6)); [55, 55.4].forEach(f => osc(o, 'sawtooth', f, t, 3.1, lp)); },
  };
  R.swell = (o, p, t) => R.vowel(o, {m: .5, g: .1, a: .3, r: .5}, t);

  // One-shots: 30 ms de-dup per id, ±4% pitch jitter, at most 8 voices (the oldest is stolen).
  const run = (name, p, t, to, c = ctx) => { const o = {c, d: to, e: t, j: 1 + (rnd() * 2 - 1) * .04}; R[name](o, p || {}, t); return o; };
  const play = (id, name, p, at) => {
    if (!ctx || !S.sound || ctx.state !== 'running' || !R[name]) return;
    const now = ctx.currentTime;
    if (now - (last[id] ?? -1) < .03) return;
    last[id] = now;
    voices = voices.filter(v => v.o.e > now || v.g.disconnect());
    while (voices.length >= 8) {
      const v = voices.shift();
      steals++; v.g.gain.setTargetAtTime(0, now, .005); setTimeout(() => v.g.disconnect(), 80);
    }
    const g = ctx.createGain();
    g.connect(sfx);
    voices.push({g, o: run(name, p, Math.max(at || 0, now + .005), g)});
    count[id] = (count[id] || 0) + 1;
  };

  // Music: river bed + C–Am–F–G pad (8 s each, cross-faded) + a shop music-box line; ducked while resolving.
  const mo = () => ({c: ctx, d: bus, e: 0, j: 1});
  const chord = T => {
    const o = mo(), g = G(o, 0), p = g.gain, lp = F(o, 'lowpass', 900, .7, g);
    p.setValueAtTime(1e-4, T - 1.5); p.exponentialRampToValueAtTime(.05, T + 1.5); p.setValueAtTime(.05, T + 6.5); p.exponentialRampToValueAtTime(1e-4, T + 9.5);
    PAD[ci++ % 4].forEach(f => [-7, 7].forEach(dt => { osc(o, 'triangle', f, T - 1.5, 11.1, lp).detune.value = dt; }));
  };
  const mStart = now => {
    mOn = 1; bus = ctx.createGain(); bus.connect(mus);
    bus.gain.setValueAtTime(1e-4, now); bus.gain.exponentialRampToValueAtTime(1, now + 1.5);
    const o = mo(); river = noise(o, now, 1e5, F(o, 'lowpass', 400, .7, G(o, dB(-30))), 1);
    nChord = now + 1.5; nBox = now + .5; ci = 0;
  };
  const mStop = () => {
    const b = bus, q = b.gain, now = ctx.currentTime;
    mOn = 0; (q.cancelAndHoldAtTime || q.cancelScheduledValues).call(q, now); q.setTargetAtTime(0, now, .08);
    river.stop(now + .6); setTimeout(() => b.disconnect(), 700);
  };
  const tick = () => {
    try {
      if (!ctx || ctx.state !== 'running') return;
      const now = ctx.currentTime, ahead = now + .5;
      if (S.music && (phase === 'build' || phase === 'resolve')) {
        if (!mOn) mStart(now);
        for (; nChord < ahead; nChord += 8) chord(nChord);
        for (; nBox < ahead; nBox += .5 + rnd() * .4) if (phase === 'build' && rnd() >= .3) tone(mo(), 'sine', PEN[rnd() * 5 | 0] * (rnd() < .5 ? 1 : 2), nBox, .06, .005, .8);
      } else if (mOn) mStop();
      // Rationed heartbeat (§5.4): only during the flagged build.
      if (heart && phase === 'build') { if (nBeat < now) nBeat = now + .05; for (; nBeat < ahead; nBeat += 1.1) play('beat', 'beat', 0, nBeat); }
      else nBeat = 0;
    } catch (e) {}
  };
  const gains = () => {
    if (!ctx) return;
    const t = ctx.currentTime;
    sfx.gain.setTargetAtTime(S.sound ? +S.soundVol : 0, t, .03);
    mus.gain.setTargetAtTime(S.music ? S.musicVol * (phase === 'resolve' ? dB(-8) : 1) : 0, t, .15);
    tick();
  };

  // §9 event → sound.
  const tierG = v => cl(Math.floor(Math.log10(Math.max(1, v || 1))), 0, 6), tierX = f => cl(Math.round(3 * Math.log2(f || 1)), 0, 6);
  const vow = (m, tier) => ({m, g: Math.min(.5, .15 + .06 * tier), r: .3 + tier / 15});
  const big = e => /countdown/.test(e.rules) || (e.k ?? e.show % 3) === 2;            // Headliner or Countdown build (show = 0-based s)
  const drop = (e, p) => play('drop', 'drop', {col: e.col || (e.shell && e.shell.col) || 'W', ...p});
  let step = 0, cur = {}, crit = 0, first = 0, heart = 0, lastFan = -9;
  const fan = () => { if (ctx && ctx.currentTime - lastFan > 3) { lastFan = ctx.currentTime; play('fanfare', 'fanfare'); } };
  const ON = {
    buildOpen(e) { if (!e.show) crit = first = 0; cur = e; heart = e.lastChance != null ? !!e.lastChance : !!(first || (crit && big(e))); first = 0; play('page', 'page'); },
    moodChanged: e => play('mood', 'murmur', {b: e.bucket}),
    bought: e => drop(e, {coin: 1}), upgraded: e => drop(e, {up: 1, coin: 1}), moved: e => drop(e), matched: e => drop(e),
    sold: e => drop(e, {coin: 1}), rigInstalled: e => drop(e, {coin: 1}), tubeAdded: e => drop(e, {coin: 1}),
    rerolled: () => play('shuffle', 'shuffle'),
    fuseLit() { step = 0; heart = 0; play('hiss', 'hiss'); },
    launch: () => play('launch', 'thump'),
    burst(e) {
      const sh = e.shell || {}, id = sh.id || sh, k = step++, sees = (e.sees && e.sees.length) ?? e.sees;
      play('burst', 'burst', {col: e.dud ? 'D' : e.washed ? 'W' : e.col || sh.col, tier: e.dud ? 0 : cl((sh.star || e.star || 1) - 1 + (sees / 2 | 0), 0, 6),
        crackle: /^(crackle|glitter|brocade)$/.test(id), g: e.dud ? .15 : e.half ? .35 : .5});
      if (!e.dud) play('link', 'chime', {f: PEN[k % 5] * 2 ** ((k % 10) / 5 | 0) * 2 ** (k / 10 | 0)}); // +1 octave after 10 steps
    },
    gainOoh: e => play('ooh', 'vowel', vow(0, tierG(e.v))),
    gainAah: e => play('aah', 'vowel', vow(1, tierG(e.v))),
    multAah: e => play('bell', 'bell', {tier: tierX(e.factor)}),
    fusion: () => play('fusion', 'fusion'),
    clear: () => play('clear', 'clear'),
    extend: () => play('extend', 'chime', {f: 1760, g: .1, r: .35}),
    repeat: () => play('echo', 'echo'),
    crowdGain: () => play('swell', 'swell'),
    coinGain: () => play('coin', 'coin'),
    crowdCheer: e => play('roar', 'roar', {g: cl(.12 * Math.log10((e.v ?? crowd) + 1), .03, .4), d: 1.2}),
    applause(e) {
      const r = e.target > 0 ? e.score / e.target : 1;
      if (e.pass === false || (e.pass == null && r < 1)) return play('miss', 'miss');
      play('applause', 'roar', {g: cl(.3 * Math.log10(r + 1), .05, .5), d: 1.2 + 1.3 * cl((r - 1) / 3, 0, 1)});
      if (e.top || e.topTier || e.runBest || big(cur)) fan();
    },
    payout: e => play('payout', 'coins', {n: cl(Math.round(e.total ?? e.coins ?? e.v ?? 3), 1, 5)}),
    rainCheck() { if (!crit) first = 1; crit = 1; },
    critical(e) { if (e.on === false) crit = heart = 0; else { ON.rainCheck(); if (e.lastChance != null) heart = !!e.lastChance; } },
    relight: () => play('relight', 'rise'),
    milestone: () => play('tick', 'tick'),
    runLost() { crit = first = heart = 0; play('drone', 'drone'); },
    runWon() { crit = first = heart = 0; fan(); },
    runStart() { crit = first = heart = 0; },
    finale: () => fan(), topTier: () => fan(),
    illegal: () => play('error', 'error'),
  };

  if (W.document) {
    W.document.addEventListener('visibilitychange', () => { if (W.document.hidden && ctx) ctx.suspend(); });
    const wake = () => { if (ctx && !held && !W.document.hidden && ctx.state !== 'running') api.unlock(); };
    W.addEventListener('pointerdown', wake, true); W.addEventListener('keydown', wake, true);
  }

  const api = {
    unlock() {
      if (!AC) return;
      if (!ctx) {
        ctx = new AC();
        const comp = ctx.createDynamicsCompressor(), m = ctx.createGain();
        Object.entries({threshold: -18, knee: 12, ratio: 4, attack: .003, release: .25}).forEach(([k, v]) => comp[k].value = v);
        m.gain.value = .9; m.connect(comp); comp.connect(ctx.destination);
        sfx = ctx.createGain(); mus = ctx.createGain(); sfx.gain.value = mus.gain.value = 0; sfx.connect(m); mus.connect(m);
        bufs(ctx); setInterval(tick, 200); gains();
      }
      held = 0;
      if (ctx.state !== 'running') ctx.resume().then(tick, () => {});
    },
    onEvent(ev) { if (ev && ON[ev.type]) ON[ev.type](ev); },
    ui(name, o) { play('ui-' + name, name === 'chime' ? 'page' : name, o); },
    setSettings(s) { for (const k in s) if (s[k] != null) S[k === 'sfxVol' ? 'soundVol' : k] = s[k]; gains(); },
    setPhase(p) { phase = p; gains(); },
    setCrowd(n) { crowd = +n || 0; },
    suspend() { held = 1; if (ctx) ctx.suspend(); },
    resume() { held = 0; if (ctx) ctx.resume().then(tick, () => {}); },
  };
  for (const k in api) { const f = api[k]; api[k] = (...a) => { try { f(...a); } catch (e) {} }; }
  api._t = {
    voices: () => ctx ? voices.filter(v => v.o.e > ctx.currentTime).length : 0, steals: () => steals, count, ctx: () => ctx, music: () => mOn, gains: () => [sfx.gain.value, mus.gain.value], recipes: Object.keys(R),
    render(name, p, secs = 3) {
      const c = new OfflineAudioContext(1, 44100 * secs, 44100);
      run(name, p, .01, c.destination, c);
      return c.startRendering().then(b => { let pk = 0, s = 0; for (const x of b.getChannelData(0)) { pk = Math.max(pk, Math.abs(x)); s += x * x; } return {peak: pk, rms: Math.sqrt(s / b.length)}; });
    },
  };
  return api;
})();
