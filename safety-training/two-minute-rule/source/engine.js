// Deterministic timeline engine for video.html.
// Every visual state is a pure function of t (seconds), so frame N always renders identically.
//
// Markup:
//   <section class="scene" data-scene="id">            shown for that scene's span in timing.json
//   data-in="type ref [dur]"   entrance; data-out="type ref [dur]" exit
//     type: fade up down left right pop zoom draw wipe wipeup grow growy type count blur
//     ref : s3-2 (cue start) | s3-2.end | ^1.5 (scene start + 1.5) | $-1 (scene end - 1) | 12.5 (absolute)
//           any ref may carry +x / -x offsets, e.g. s3-2+0.4 or s3-2.end-0.2
//   data-from / data-to / data-fmt on type=count;  pathLength="1" on type=draw paths
//   HOOKS[sceneId] = (t, lt, api) => {...} for bespoke per-frame drawing
(function () {
  const T = window.TIMING;
  const CUE = {}, SCN = {};
  T.cues.forEach(c => (CUE[c.id] = c));
  T.scenes.forEach(s => (SCN[s.id] = s));
  const XF = 0.45; // scene crossfade

  const ease = {
    out: x => 1 - Math.pow(1 - x, 3),
    inOut: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    back: x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    lin: x => x,
  };
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, start, dur) => (dur <= 0 ? (t >= start ? 1 : 0) : clamp((t - start) / dur));

  // ref grammar: (cue id "s3-2" | "s3-2.end" | "^x" scene start + x | "$x" scene end - x | absolute seconds) then +/- offsets
  // ref grammar: cue "s3-2" | "s3-2.end" | "s3-2@0.4" (40% through the cue) | "s3-2~word" (estimated time the word is spoken,
  // by its character position in the caption) | "^x" scene start + x | "$x" scene end - x | absolute seconds; then +/- offsets
  function parseRef(r, scene) {
    r = String(r).trim();
    const m = r.match(/^(?:(s\d+-\d+)(\.end|@\d*\.?\d+|~[A-Za-z'’]+)?|([\^$])(\d*\.?\d*)|(\d*\.?\d+))((?:[+\-]\d*\.?\d+)*)$/);
    if (!m) throw new Error('bad time ref "' + r + '" in scene ' + scene);
    let v;
    if (m[1]) {
      const c = CUE[m[1]]; if (!c) throw new Error('unknown cue ' + m[1] + ' in scene ' + scene);
      const mod = m[2] || '';
      if (mod === '.end') v = c.end;
      else if (mod[0] === '@') v = c.start + parseFloat(mod.slice(1)) * (c.end - c.start);
      else if (mod[0] === '~') {
        const w = mod.slice(1).toLowerCase(), txt = c.text.toLowerCase();
        const re = new RegExp('\\b' + w.replace(/[’']/g, "['’]") + '\\b'); const mm = txt.match(re);
        if (!mm) throw new Error('word "' + w + '" not in cue ' + m[1]);
        // measured word times (synth.py aligns each line's phrases to the pauses in its audio); else estimate by position
        const norm = s => s.replace(/’/g, "'"), hit = (c.words || []).find(([tok]) => { const k = norm(tok); return k === norm(w) || k.split(/[-']/).includes(norm(w)); });
        v = hit ? hit[1] : c.start + (mm.index / txt.length) * (c.end - c.start);
      } else v = c.start;
    }
    else if (m[3]) v = m[3] === '^' ? SCN[scene].start + parseFloat(m[4] || 0) : SCN[scene].end - parseFloat(m[4] || 0);
    else v = parseFloat(m[5]);
    (m[6].match(/[+\-]\d*\.?\d+/g) || []).forEach(o => (v += parseFloat(o)));
    return v;
  }

  window.REF = parseRef;   // lets tooling/events.js resolve sound-cue times with the same grammar
  const anims = [];
  const lits = [];
  let marks = [], lightFrom = [];
  const scenes = [];
  const DEF = { fade: 0.5, up: 0.6, down: 0.6, left: 0.6, right: 0.6, pop: 0.55, zoom: 0.7, draw: 1.2, wipe: 0.8, wipeup: 0.8, grow: 0.8, growy: 0.8, type: 1.2, count: 1.2, blur: 0.7 };

  function spec(el, attr, scene) {
    const v = el.getAttribute(attr); if (!v) return null;
    const [type, r, d] = v.trim().split(/\s+/);
    return { type, t: parseRef(r || '^0', scene), d: d !== undefined ? parseFloat(d) : DEF[type] ?? 0.5 };
  }

  window.ready = function () {
    document.querySelectorAll('.scene').forEach(sec => {
      const id = sec.dataset.scene;
      if (!SCN[id]) throw new Error('scene not in timing: ' + id);
      scenes.push({ el: sec, id, s: SCN[id] });
      // data-lit="from to [from to ...]": full opacity inside any window, data-dim (default .25) outside; also sets --on
      // data-hl ="from to [from to ...]": highlight only (sets --on 0..1 for CSS), no dimming
      sec.querySelectorAll('[data-lit],[data-hl]').forEach(el => {
        for (const kind of ['lit', 'hl']) {
          const v = el.getAttribute('data-' + kind); if (!v) continue;
          const parts = v.trim().split(/\s+/), wins = [];
          for (let i = 0; i < parts.length; i += 2) wins.push([parseRef(parts[i], id), parseRef(parts[i + 1], id)]);
          lits.push({ el, scene: id, wins, kind, dim: parseFloat(el.dataset.dim || 0.25) });
        }
      });
      sec.querySelectorAll('[data-in],[data-out]').forEach(el => {
        const a = { el, scene: id, i: spec(el, 'data-in', id), o: spec(el, 'data-out', id) };
        if (a.i && a.i.type === 'type') a.text = el.textContent;
        if (a.i && a.i.type === 'draw') { el.style.strokeDasharray = '1 1'; }
        anims.push(a);
      });
    });
    marks = (window.CHAPTER_MARKS || []).map(([r, sc, label]) => ({ t: parseRef(r, sc), scene: sc, label }));
    lightFrom = (window.CHROME_LIGHT || []).map(([r, sc]) => ({ t: parseRef(r, sc), scene: sc }));
    const missing = T.scenes.filter(s => !scenes.find(x => x.id === s.id)).map(s => s.id);
    if (missing.length) throw new Error('scenes without markup: ' + missing.join(','));
  };

  function apply(a, t) {
    const el = a.el; let op = 1, tx = 0, ty = 0, sc = 1, clip = null, blur = 0;
    if (a.i) {
      const raw = prog(t, a.i.t, a.i.d), p = (a.i.type === 'pop' ? ease.back : a.i.type === 'type' || a.i.type === 'count' ? ease.lin : ease.out)(raw);
      const po = ease.out(raw);
      switch (a.i.type) {
        case 'fade': op *= po; break;
        case 'up': op *= po; ty += (1 - p) * 44; break;
        case 'down': op *= po; ty -= (1 - p) * 44; break;
        case 'left': op *= po; tx += (1 - p) * 70; break;
        case 'right': op *= po; tx -= (1 - p) * 70; break;
        case 'pop': op *= clamp(raw * 2.2); sc *= lerp(0.55, 1, p); break;
        case 'zoom': op *= po; sc *= lerp(1.12, 1, p); break;
        case 'blur': op *= po; blur = (1 - p) * 14; break;
        case 'draw': el.style.strokeDashoffset = String(1 - ease.inOut(raw)); break;
        case 'wipe': clip = `inset(-5% ${(1 - ease.inOut(raw)) * 100}% -5% -5%)`; break;
        case 'wipeup': clip = `inset(${(1 - ease.inOut(raw)) * 100}% -5% -5% -5%)`; break;
        case 'grow': el.style.transformOrigin = el.style.transformOrigin || 'left center'; el.style.transform = `scaleX(${ease.inOut(raw)})`; break;
        case 'growy': el.style.transformOrigin = el.style.transformOrigin || 'center bottom'; el.style.transform = `scaleY(${ease.inOut(raw)})`; break;
        case 'type': { const n = Math.round(a.text.length * raw); el.textContent = a.text.slice(0, n); op *= raw > 0 ? 1 : 0; break; }
        case 'count': {
          const f = parseFloat(el.dataset.from || 0), to = parseFloat(el.dataset.to), v = lerp(f, to, ease.out(raw));
          const fmt = el.dataset.fmt || '{}';
          el.textContent = fmt.replace('{}', (el.dataset.dec ? v.toFixed(+el.dataset.dec) : Math.round(v).toLocaleString('en-US')));
          op *= raw > 0 || f !== 0 ? 1 : 0; break;
        }
      }
    }
    if (a.o) {
      const raw = prog(t, a.o.t, a.o.d), p = ease.inOut(raw);
      switch (a.o.type) {
        case 'fade': op *= 1 - p; break;
        case 'up': op *= 1 - p; ty -= p * 44; break;
        case 'down': op *= 1 - p; ty += p * 44; break;
        case 'left': op *= 1 - p; tx -= p * 70; break;
        case 'right': op *= 1 - p; tx += p * 70; break;
        case 'pop': op *= 1 - p; sc *= lerp(1, 0.7, p); break;
        case 'zoom': op *= 1 - p; sc *= lerp(1, 1.1, p); break;
        case 'blur': op *= 1 - p; blur += p * 14; break;
        case 'dim': op *= lerp(1, 0.28, p); break;
        case 'wipe': clip = `inset(-5% -5% -5% ${p * 100}%)`; break;
      }
    }
    if (!(a.i && /^(draw|grow|growy)$/.test(a.i.type))) {
      el.style.opacity = op.toFixed(4);
      const tr = [];
      if (tx || ty) tr.push(`translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px)`);
      if (sc !== 1) tr.push(`scale(${sc.toFixed(4)})`);
      el.style.transform = tr.join(' ');
    } else el.style.opacity = op.toFixed(4);
    el.style.clipPath = clip || '';
    el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
  }

  const api = { ease, clamp, lerp, prog, cue: id => CUE[id], scene: id => SCN[id], ref: (r, s) => parseRef(r, s) };
  window.HOOKS = window.HOOKS || {};

  const cap = () => document.getElementById('cap');
  function captionAt(t) {
    for (let i = 0; i < T.cues.length; i++) {
      const c = T.cues[i], n = T.cues[i + 1];
      const holdTo = n && n.start - c.end < 0.9 ? n.start : c.end + 0.25;
      if (t >= c.start - 0.08 && t < holdTo) return c;
    }
    return null;
  }

  window.seek = function (t) {
    for (const sc of scenes) {
      const { start, end } = sc.s;
      const vis = t >= start - 0.001 && t < end + XF;
      sc.el.style.display = vis ? '' : 'none';
      if (!vis) continue;
      sc.el.style.opacity = start === 0 ? 1 : ease.inOut(prog(t, start, XF)).toFixed(4);
    }
    for (const a of anims) {
      const s = SCN[a.scene];
      if (t < s.start - 0.001 || t >= s.end + XF) continue;
      apply(a, t);
    }
    for (const l of lits) {
      const s = SCN[l.scene];
      if (t < s.start - 0.001 || t >= s.end + XF) continue;
      let on = 0;
      for (const [a, b] of l.wins) on = Math.max(on, Math.min(prog(t, a - 0.15, 0.3), 1 - prog(t, b - 0.15, 0.3)));
      on = ease.inOut(on);
      if (l.kind === 'lit') l.el.style.opacity = lerp(l.dim, 1, on).toFixed(4);
      l.el.style.setProperty('--on', on.toFixed(4));
    }
    if (window.HOOKS['*']) window.HOOKS['*'](t, api);
    for (const sc of scenes) {
      const h = window.HOOKS[sc.id];
      if (h && sc.el.style.display !== 'none') h(t, t - sc.s.start, api);
    }
    const c = captionAt(t), el = cap();
    if (el) {
      const txt = c ? c.text : '';
      if (el.dataset.cur !== txt) { el.dataset.cur = txt; el.querySelector('span').textContent = txt.replace(/Stop & get help/g, 'Stop\u00a0&\u00a0get\u00a0help').replace(/Fix it/g, 'Fix\u00a0it').replace(/thank you/g, 'thank\u00a0you'); }
      el.querySelector('span').style.opacity = c ? 1 : 0;   // band stays; only the text clears between lines
    }
    const cur = [...T.scenes].reverse().find(s => t >= s.start) || T.scenes[0];
    const curSc = scenes.find(x => x.id === cur.id);
    let dark = curSc && curSc.el.classList.contains('dark');
    for (const l of lightFrom) if (l.scene === cur.id && t >= l.t) dark = false;   // light slates inside a dark scene
    document.body.classList.toggle('on-dark', !!dark);
    const ch = document.getElementById('chapter');
    if (ch) {
      let label = cur.chapter || '';
      for (const m of marks) if (m.scene === cur.id && t >= m.t) label = m.label;
      if (ch.dataset.cur !== label) { ch.dataset.cur = label; ch.textContent = label; }
      (ch.parentElement || ch).style.opacity = label ? 1 : 0;
    }
    const bar = document.getElementById('progress');
    if (bar) bar.style.transform = `scaleX(${clamp(t / T.duration).toFixed(5)})`;
  };
})();
