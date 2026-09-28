// AUDIO: procedural WebAudio for Ooh × Aah (spec §10) and the audio column of the §9 juice map.
//
// API (CONTRACT.md): unlock() · onEvent(ev) · ui(name, {col}) · setSettings({sound, soundVol, music, musicVol})
//                    setPhase('build'|'resolve'|'paused'|'off') · setCrowd(n) · suspend() · resume()
// Every call is wrapped so it never throws; without WebAudio everything is a silent no-op.
// The AudioContext is created (or resumed) only inside unlock(), which the core calls on the first gesture.
//
// Graph: one-shot voices → sfx ─┐
//        music bus       → mus ─┴→ master 0.9 → compressor (−18 dB, knee 12, 4:1, 3 ms, 250 ms) → destination
//
// Optional payload fields read beyond §9: buildOpen.show is the 0-based s (s mod 3 = 2 is a Headliner; a
// 'countdown…' rule is the Countdown); buildOpen/critical {lastChance} overrides the heartbeat rationing;
// applause {top|topTier|runBest} forces the top-tier fanfare; payout {total|coins} sets the number of blips.
const AUDIO = (() => {
  const W = typeof window == 'object' ? window : {}, AC = W.AudioContext || W.webkitAudioContext, rnd = Math.random;
  const S = {sound: true, soundVol: .8, music: true, musicVol: .35};
  const cl = (x, a, b) => Math.min(b, Math.max(a, x));
  const PL = {R: 392, A: 440, G: 329.63, B: 523.25, W: 293.66, X: 587.33};  // pluck pitch by colour (G4 A4 E4 C5 D4)
  const BC = {R: 900, A: 1400, G: 700, B: 2000, W: 3000, X: 1700, D: 450}; // burst band centre (D = dud puff)
  const PEN = [523.25, 587.33, 659.25, 783.99, 880];                      // C-major pentatonic from C5
  const PAD = [[130.81, 164.81, 196], [110, 130.81, 164.81], [87.31, 110, 130.81], [98, 123.47, 146.83]]; // C Am F G
  let ctx, sfx, mus, bus, river, voices = [], last = {}, count = {}, steals = 0, phase = 'off', crowd = 0, held = 0;
  let mOn = 0, nChord = 0, ci = 0, nBox = 0, nBeat = 0, step = 0, cur = {}, crit = 0, first = 0, heart = 0, lastFan = -9;
  const safe = f => (...a) => { try { return f(...a); } catch (e) {} };

  // 2 s white noise and brown noise (leaky integrator), built once per context.
  const BUF = new WeakMap(), buf = (c, k) => {
    if (!BUF.has(c)) {
      const n = 2 * c.sampleRate, w = c.createBuffer(1, n, c.sampleRate), b = c.createBuffer(1, n, c.sampleRate);
      const wd = w.getChannelData(0), bd = b.getChannelData(0);
      for (let i = 0, y = 0; i < n; i++) { wd[i] = rnd() * 2 - 1; y = (y + .02 * wd[i]) / 1.02; bd[i] = y * 3.5; }
      BUF.set(c, {w, b});
    }
    return BUF.get(c)[k];
  };

  // Node helpers. A recipe gets o = {c: context, d: output node, e: latest stop time, j: pitch jitter},
  // so the same recipe plays live or renders into an OfflineAudioContext.
  const sv = (p, v, t) => p.setValueAtTime(v, t);
  const xr = (p, v, t) => p.exponentialRampToValueAtTime(v, t);
  const G = (o, v, to) => { const g = o.c.createGain(); g.gain.value = v; g.connect(to || o.d); return g; };
  // Envelope: 0.0001 → pk over a seconds → 0.0001 over r seconds, exponential both ways.
  const env = (o, t, pk, a, r, to) => { const g = G(o, 0, to), p = g.gain; sv(p, 1e-4, t); xr(p, pk, t + a); xr(p, 1e-4, t + a + r); return g; };
  const F = (o, type, f, q, to) => {
    const n = o.c.createBiquadFilter();
    n.type = type; n.frequency.value = f; n.Q.value = q; n.connect(to || o.d);
    return n;
  };
  const src = (o, n, t, d, to, off) => { n.connect(to); n.start(t, off); n.stop(t + d); o.e = Math.max(o.e, t + d); return n; };
  const osc = (o, type, f, t, d, to) => { const n = o.c.createOscillator(); n.type = type; sv(n.frequency, f * o.j, t); return src(o, n, t, d, to); };
  const noise = (o, t, d, to, k = 'w') => { // looped white ('w') or brown ('b') noise from a random offset
    const n = o.c.createBufferSource();
    n.buffer = buf(o.c, k); n.loop = true;
    return src(o, n, t, d, to, rnd() * 1.5);
  };
  const tone = (o, type, f, t, pk, a, r, to) => osc(o, type, f, t, a + r + .02, env(o, t, pk, a, r, to));
  const clicks = (o, n, t, span, g) => { // n random 4 ms crackle clicks over span seconds
    for (let i = 0; i < n; i++) { const x = t + rnd() * span; noise(o, x, .005, env(o, x, g * (.4 + .6 * rnd()), 5e-4, .0035)); }
  };

  // Recipes (spec §10 table): (o, params, start time).
  const R = {
    pluck(o, p, t) { // triangle at the colour pitch + 2nd harmonic at −12 dB, 180 ms
      const f = (PL[p.col] || PL.W) * (p.oct || 1);
      tone(o, 'triangle', f, t, .3, .005, .18); tone(o, 'sine', 2 * f, t, .075, .005, .18);
    },
    coin(o, p, t) { // square 1320 → 1760 Hz over 60 ms, low-passed at 3 kHz; p.n blips 70 ms apart
      for (let i = 0, x = t; i < (p.n || 1); i++, x += .07) {
        xr(tone(o, 'square', 1320, x, .12, .002, .16, F(o, 'lowpass', 3000, .7)).frequency, 1760 * o.j, x + .06);
      }
    },
    drop(o, p, t) { R.pluck(o, p, t); p.up && R.pluck(o, {col: p.col, oct: 2}, t + .07); p.coin && R.coin(o, {}, t + .04); },
    shuffle(o, p, t) { const bp = F(o, 'bandpass', 2500, 1); for (let x = t; x < t + .15; x += .06) noise(o, x, .02, env(o, x, .35, .001, .015, bp)); },
    tick(o, p, t) { tone(o, 'triangle', 1800, t, .1, .001, .03); },
    error(o, p, t) { const lp = F(o, 'lowpass', 900, .7); tone(o, 'square', 150, t, .1, .005, .07, lp); tone(o, 'square', 150, t + .1, .1, .005, .07, lp); },
    hiss(o, p, t) { noise(o, t, .36, F(o, 'bandpass', 3500 * o.j, 2, env(o, t, .15, .02, .33))); clicks(o, 6, t, .35, .25); },
    thump(o, p, t) { // sine 90 → 40 Hz + a 20 ms high-passed click
      xr(tone(o, 'sine', 90, t, .6, .003, .14).frequency, 40 * o.j, t + .12);
      noise(o, t, .02, F(o, 'highpass', 1000, .7, env(o, t, .15, .001, .018)));
    },
    burst(o, p, t) { // band-passed noise at the colour centre; Crackle, Glitter and Brocade add 12–30 clicks
      const r = .4 + .08 * (p.tier || 0);
      noise(o, t, r + .02, F(o, 'bandpass', (BC[p.col] || BC.W) * o.j, .8, env(o, t, p.g || .5, .005, r)));
      p.crackle && clicks(o, 12 + rnd() * 19 | 0, t + .05, .6, .3);
    },
    chime(o, p, t) { // sine + 3rd harmonic at −14 dB
      const g = p.g || .18, r = p.r || .25;
      tone(o, 'sine', p.f, t, g, .003, r); tone(o, 'sine', 3 * p.f, t, g * .2, .003, r);
    },
    page(o, p, t) { R.chime(o, {f: 783.99, g: .07, r: .5}, t); R.chime(o, {f: 1046.5, g: .07, r: .6}, t + .09); },
    // Signature crowd vowel: noise + 1–3 detuned saws (voices grow with the crowd) into two parallel band-pass formants.
    // m = 0 is "Oo" (F1 300 Hz Q8, F2 870 Hz Q10), m = 1 is "Aa" (F1 730 Hz Q6, F2 1090 Hz Q8); between is a blend.
    vowel(o, p, t) {
      const {m, a = .06, r = .5} = p, d = a + r + .05, n = p.n || 1 + (crowd >= 20) + (crowd >= 80);
      const out = env(o, t, p.g, a, r), mix = G(o, 6 - m, F(o, 'bandpass', (300 + 430 * m) * o.j, 8 - 2 * m, out));
      mix.connect(F(o, 'bandpass', (870 + 220 * m) * o.j, 10 - 2 * m, out));
      noise(o, t, d, G(o, .35, mix));
      for (let i = 0; i < n; i++) {
        const f = p.f || 150 + rnd() * 70, s = osc(o, 'sawtooth', f, t, d, G(o, .5 / Math.sqrt(n), mix));
        s.detune.value = (i - (n - 1) / 2) * 14; xr(s.frequency, f * o.j * .93, t + d);
      }
    },
    murmur(o, p, t) { // −30 dB, 400 ms: Restless "oo" at 150 Hz, Hopeful a blend, Eager "aa" at 220 Hz
      const m = {restless: 0, eager: 1}[p.b] ?? .5;
      R.vowel(o, {m, f: 150 + 70 * m, g: .032, a: .1, r: .3}, t);
    },
    swell(o, p, t) { R.vowel(o, {m: .5, g: .1, a: .3, r: .5}, t); },
    bell(o, p, t) { // 2-operator FM: carrier 880 × (1 + 0.06 tier), modulator ratio 3.5, index 3 → 0 over 1.2 s
      const f = 880 * (1 + .06 * p.tier), md = G(o, 0, tone(o, 'sine', f, t, .3, .003, 1.2).frequency);
      sv(md.gain, 10.5 * f * o.j, t); xr(md.gain, .001, t + 1.2);
      osc(o, 'sine', 3.5 * f, t, 1.23, md);
    },
    fusion(o, p, t) { [523.25, 659.25, 783.99].forEach((f, i) => tone(o, 'triangle', f, t + i * .03, .12, .01, .69)); },
    clear(o, p, t) { // 60 Hz boom + a whoosh swept 400 → 4000 Hz
      tone(o, 'sine', 60, t, .6, .005, .3);
      const lp = F(o, 'lowpass', 400, .9, env(o, t, .3, .15, .3));
      sv(lp.frequency, 400, t); xr(lp.frequency, 4000, t + .4); noise(o, t, .46, lp);
    },
    echo(o, p, t) { // a tap through a 90 ms delay with 0.3 feedback
      const d = o.c.createDelay(.2), e = env(o, t, .12, .002, .03);
      d.delayTime.value = .09; d.connect(G(o, .3, d)); d.connect(o.d); e.connect(d);
      osc(o, 'triangle', 1500, t, .04, e); o.e = t + .7;
    },
    roar(o, p, t) { // crowd roar / applause: band-passed noise, amplitude-modulated by random 10–20 Hz pulses
      const d = p.d || 1.2, g = G(o, 0), q = g.gain, am = G(o, .5, g);
      sv(q, 1e-4, t); xr(q, p.g, t + .12); xr(q, p.g * .6, t + d * .6); xr(q, 1e-4, t + d); sv(am.gain, .5, t);
      for (let x = t; x < t + d; x += .05 + rnd() * .05) am.gain.linearRampToValueAtTime(.3 + .7 * rnd(), x);
      noise(o, t, d, F(o, 'bandpass', 1200 * o.j, .7, am));
    },
    miss(o, p, t) { // falling two-tone 330 → 220 Hz + a murmur
      sv(tone(o, 'sine', 330, t, .25, .01, .42).frequency, 220 * o.j, t + .2);
      R.vowel(o, {m: 0, f: 150, g: .08, a: .1, r: .6}, t + .1);
    },
    rise(o, p, t) { sv(tone(o, 'sine', 220, t, .22, .01, .42).frequency, 330 * o.j, t + .2); },
    beat(o, p, t) { tone(o, 'sine', 55, t, .063, .005, .12); tone(o, 'sine', 55, t + .08, .063, .005, .12); }, // −24 dB
    fanfare(o, p, t) { // 400 ms 50 Hz thump + 5 pentatonic sawtooth notes, low-passed at 2 kHz
      tone(o, 'sine', 50, t, .6, .005, .4);
      const lp = F(o, 'lowpass', 2000, .7);
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(o, 'sawtooth', f, t + i * .12, .15, .005, i < 4 ? .14 : .6, lp));
    },
    drone(o, p, t) { const lp = F(o, 'lowpass', 250, .7, env(o, t, .2, .4, 2.6)); osc(o, 'sawtooth', 55, t, 3.1, lp); osc(o, 'sawtooth', 55.4, t, 3.1, lp); },
  };

  // One-shots: 30 ms de-dup per id, ±4% pitch jitter, at most 8 voices (the oldest is stolen).
  const run = (name, p, t, to, c = ctx) => { const o = {c, d: to, e: t, j: .96 + rnd() * .08}; R[name](o, p || {}, t); return o; };
  const play = (name, p, id = name, at = 0) => {
    if (!ctx || !S.sound || ctx.state != 'running' || !R[name] || performance.now() - (last[id] ?? -99) < 30) return;
    const t = ctx.currentTime, g = G({c: ctx}, 1, sfx);
    last[id] = performance.now();
    voices = voices.filter(v => v.o.e > t || v.g.disconnect());
    while (voices.length > 7) {
      const v = voices.shift();
      steals++; v.g.gain.setTargetAtTime(0, t, .005); setTimeout(() => v.g.disconnect(), 80);
    }
    voices.push({g, o: run(name, p, Math.max(at, t + .005), g)});
    count[id] = (count[id] || 0) + 1;
  };

  // Music: brown-noise river bed, C–Am–F–G pad (8 s per chord, cross-faded), shop music-box line.
  // It plays in 'build' and 'resolve' (ducked −8 dB), fades out on 'paused'/'off', and freezes with the context when hidden.
  const mo = () => ({c: ctx, d: bus, e: 0, j: 1});
  const chord = T => {
    const o = mo(), g = G(o, 0), p = g.gain, lp = F(o, 'lowpass', 900, .7, g);
    sv(p, 1e-4, T - 1.5); xr(p, .05, T + 1.5); sv(p, .05, T + 6.5); xr(p, 1e-4, T + 9.5);
    for (const f of PAD[ci++ % 4]) for (const dt of [-7, 7]) osc(o, 'triangle', f, T - 1.5, 11.1, lp).detune.value = dt;
  };
  const tick = safe(() => { // 200 ms look-ahead scheduler for the music and the heartbeat
    if (!ctx || ctx.state != 'running') return;
    const now = ctx.currentTime, end = now + .5, want = S.music && /^(build|resolve)$/.test(phase);
    if (want && !mOn) {
      mOn = 1; bus = G({c: ctx}, 0, mus); sv(bus.gain, 1e-4, now); xr(bus.gain, 1, now + 1.5);
      const o = mo(); river = noise(o, now, 1e5, F(o, 'lowpass', 400, .7, G(o, .032)), 'b'); // −30 dB
      nChord = now + 1.5; nBox = now + .5; ci = 0;
    } else if (!want && mOn) {
      const b = bus, q = b.gain;
      mOn = 0; (q.cancelAndHoldAtTime || q.cancelScheduledValues).call(q, now); q.setTargetAtTime(0, now, .08);
      river.stop(now + .6); setTimeout(() => b.disconnect(), 700);
    }
    if (mOn) {
      for (; nChord < end; nChord += 8) chord(nChord);
      for (; nBox < end; nBox += .5 + rnd() * .4) { // a note every 700 ± 200 ms, 30% rests, shop only
        if (phase == 'build' && rnd() > .3) tone(mo(), 'sine', PEN[rnd() * 5 | 0] * (1 + (rnd() < .5)), nBox, .06, .005, .8);
      }
    }
    // Rationed heartbeat (§5.4): two thumps every 1.1 s, only during a flagged build.
    if (heart && phase == 'build') for (nBeat = Math.max(nBeat, now + .05); nBeat < end; nBeat += 1.1) play('beat', 0, 'beat', nBeat);
    else nBeat = 0;
  });
  const gains = () => {
    if (!ctx) return;
    const t = ctx.currentTime;
    sfx.gain.setTargetAtTime(S.sound ? +S.soundVol : 0, t, .03);
    mus.gain.setTargetAtTime(S.music ? S.musicVol * (phase == 'resolve' ? .398 : 1) : 0, t, .15);
    tick();
  };

  // §9 events → sounds. Tiers: gains clamp(floor(log10 v), 0, 6); × factors clamp(round(3 log2 f), 0, 6).
  const tierG = v => cl(Math.log10(Math.max(1, v || 1)) | 0, 0, 6);
  const tierX = f => cl(Math.round(3 * Math.log2(f || 1)), 0, 6);
  const vow = (m, tier) => ({m, g: Math.min(.5, .15 + .06 * tier), r: .3 + tier / 15});
  const big = e => /countdown/.test(e.rules) || (e.k ?? e.show % 3) === 2; // a Headliner or Countdown build
  const fan = () => { if (ctx && ctx.currentTime - lastFan > 3) { lastFan = ctx.currentTime; play('fanfare'); } };
  const reset = () => { crit = first = heart = 0; };
  const ON = {
    // The heartbeat plays on the first build after the rain check is spent, then on Headliner/Countdown builds.
    buildOpen(e) { if (!e.show) reset(); cur = e; heart = e.lastChance ?? (first || crit && big(e)); first = 0; play('page'); },
    rainCheck() { if (!crit) first = 1; crit = 1; },
    critical(e) { if (e.on === false) return reset(); ON.rainCheck(); if (e.lastChance != null) heart = e.lastChance; },
    moodChanged: e => play('murmur', {b: e.bucket}, 'mood'),
    fuseLit() { step = heart = 0; play('hiss'); },
    burst(e) {
      const sh = e.shell || {}, k = step++, sees = e.sees?.length ?? e.sees | 0;
      play('burst', {
        col: e.dud ? 'D' : e.washed ? 'W' : e.col || sh.col, g: e.dud ? .15 : e.half ? .35 : .5,
        tier: e.dud ? 0 : cl((sh.star || e.star || 1) - 1 + (sees >> 1), 0, 6), crackle: /^(crackle|glitter|brocade)$/.test(sh.id || sh),
      });
      // Link chime: one pentatonic step per burst; 10 steps span C5–A6, then the climb restarts an octave up.
      e.dud || play('chime', {f: PEN[k % 5] * 2 ** ((k % 10) / 5 | 0) * 2 ** (k / 10 | 0)}, 'link');
    },
    gainOoh: e => play('vowel', vow(0, tierG(e.v)), 'ooh'),
    gainAah: e => play('vowel', vow(1, tierG(e.v)), 'aah'),
    multAah: e => play('bell', {tier: tierX(e.factor)}),
    extend: () => play('chime', {f: 1760, g: .1, r: .35}, 'extend'),
    crowdCheer: e => play('roar', {g: cl(.12 * Math.log10((e.v ?? crowd) + 1), .03, .4)}),
    applause(e) { // pass: applause 1.2–2.5 s, gain ∝ log10(ratio + 1); miss: falling two-tone
      const r = e.target > 0 ? e.score / e.target : 1;
      if (e.pass === false || e.pass == null && r < 1) return play('miss');
      play('roar', {g: cl(.3 * Math.log10(r + 1), .05, .5), d: 1.2 + 1.3 * cl((r - 1) / 3, 0, 1)}, 'applause');
      if (e.top || e.topTier || e.runBest || big(cur)) fan();
    },
    payout: e => play('coin', {n: cl(Math.round(e.total ?? e.coins ?? e.v ?? 3), 1, 5)}, 'payout'),
    runLost() { reset(); play('drone'); },
    runWon() { reset(); fan(); },
    runStart: reset, finale: fan, topTier: fan,
  };
  const SIMPLE = {rerolled: 'shuffle', launch: 'thump', fusion: 'fusion', clear: 'clear', repeat: 'echo', crowdGain: 'swell',
    coinGain: 'coin', relight: 'rise', milestone: 'tick', illegal: 'error'};
  for (const k in SIMPLE) ON[k] = () => play(SIMPLE[k]);
  // Build actions: a pluck at the colour's pitch, a coin blip when money moves, an octave twin on upgrade.
  'bought upgraded sold rigInstalled tubeAdded moved matched'.split(' ').forEach((k, i) =>
    ON[k] = e => play('drop', {col: e.col || e.shell && e.shell.col, coin: i < 5, up: i == 1}));

  const api = {
    unlock() {
      if (!AC) return;
      if (!ctx) {
        ctx = new AC();
        const comp = ctx.createDynamicsCompressor(), m = G({c: ctx}, .9, comp);
        Object.entries({threshold: -18, knee: 12, ratio: 4, attack: .003, release: .25}).forEach(([k, v]) => comp[k].value = v);
        comp.connect(ctx.destination); sfx = G({c: ctx}, 0, m); mus = G({c: ctx}, 0, m);
        buf(ctx, 'w'); setInterval(tick, 200); gains();
      }
      held = 0;
      ctx.state == 'running' || ctx.resume().then(tick, () => {});
    },
    onEvent(e) { e && ON[e.type] && ON[e.type](e); },
    ui(n, o) { play(n == 'chime' ? 'page' : n, o, 'ui-' + n); },
    setSettings(s) { for (const k in s) if (s[k] != null) S[k == 'sfxVol' ? 'soundVol' : k] = s[k]; gains(); },
    setPhase(p) { phase = p; gains(); },
    setCrowd(n) { crowd = +n || 0; },
    suspend() { held = 1; ctx && ctx.suspend(); },
    resume() { held = 0; ctx && ctx.resume().then(tick, () => {}); },
  };
  for (const k in api) api[k] = safe(api[k]);
  // Suspend when hidden; the next gesture (tap to continue) resumes unless suspend() was called explicitly.
  const D = W.document, wake = () => ctx && !held && !D.hidden && ctx.state != 'running' && api.unlock();
  if (D) {
    D.addEventListener('visibilitychange', () => D.hidden && ctx && ctx.suspend());
    W.addEventListener('pointerdown', wake, true); W.addEventListener('keydown', wake, true);
  }
  // Test hooks for tools/audio-check.mjs. run(recipe, params, time, node, context) renders a recipe into any context.
  api._t = {count, R, run, ctx: () => ctx, music: () => mOn, steals: () => steals, gains: () => [sfx.gain.value, mus.gain.value],
    voices: () => voices.filter(v => v.o.e > ctx.currentTime).length};
  return api;
})();
