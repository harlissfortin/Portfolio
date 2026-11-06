// Scene markup, part A: shared helpers, the save template, and scenes 1–6.
// Coordinates are px inside .content (1680 x 772). Timing refs (engine.js): sN-M cue start, sN-M~word word time
// (measured by synth.py where it can be), sN-M.end, sN-M@0.5 fraction of the cue, ^x scene start + x, $x scene end - x.
(function () {
  const SC = window.SC = { html: [] };
  const I = SC.I = (id, cls = '', style = '') => `<svg class="${cls}" style="${style}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const A = SC.A = (x, y, inner, attrs = '', style = '') => `<div class="abs" style="left:${x}px;top:${y}px;${style}" ${attrs}>${inner}</div>`;
  const Q = SC.Q = [['q1', 'What’s different?', 'docs'], ['q2', 'What could hurt us?', 'warn'], ['q3', 'Checked or assumed?', 'verify'], ['q4', 'What if it goes wrong?', 'branch']];
  SC.qcard = (i, style = '', cls = '') => `<div class="q ${Q[i][0]} ${cls}" style="${style}"><div class="n">${i + 1}</div><svg class="ic"><use href="#i-${Q[i][2]}"/></svg><div class="t">${Q[i][1]}</div></div>`;
  SC.btns = (lit = ['', '', ''], ins = ['', '', ''], extra = ['', '', '']) => `<div class="decide">
      <div ${lit[0]}><div class="btn go" ${ins[0]}>${I('check')}Go</div>${extra[0]}</div>
      <div ${lit[1]}><div class="btn fix" ${ins[1]}>${I('wrench')}Fix it</div>${extra[1]}</div>
      <div ${lit[2]}><div class="btn stop" ${ins[2]}>${I('phone')}Stop &amp; get help</div>${extra[2]}</div></div>`;
  SC.scene = (id, cls, body) => `<section class="scene ${cls}" data-scene="${id}"><div class="content">${body}</div></section>`;
  SC.P = ART.person;
  SC.check = (txt, attrs = '', col = 'var(--go)') => `<div class="check" ${attrs}>${I('check', '', `color:${col}`)}<span>${txt}</span></div>`;
  SC.cross = (txt, attrs = '') => `<div class="check" ${attrs} style="color:var(--muted)">${I('x', '', 'color:var(--stop)')}<span>${txt}</span></div>`;
  // a red catch ring that throbs once it lands (HOOKS['*'] animates .throb)
  SC.ring = (x, y, d, ref) => A(x - d / 2, y - d / 2, `<div class="throb" style="width:${d}px;height:${d}px;border:6px solid var(--stop);border-radius:50%"></div>`, `data-in="pop ${ref} 0.45"`);
  // the five pause triggers, with the icons every trigger chip reuses
  SC.TRIG = { start: ['play', 'Before you start'], break: ['cup', 'After a break'], handover: ['people', 'Handover'], interruption: ['bell', 'Interruption'], change: ['swap', 'Change'] };

  // the shift strip: one shift from start to end, the break (cup) about a third of the way, and an amber dot for "now".
  // w = width in px; frac = where the dot sits (null: no dot); marks = extra amber rings (fractions)
  SC.CUP = 0.34;
  SC.shift = (frac, w = 600, attrs = '', rings = []) => {
    const x0 = 112, x1 = w - 100, X = f => (x0 + f * (x1 - x0)).toFixed(1);
    return `<svg width="${w}" height="40" viewBox="0 0 ${w} 40" style="overflow:visible" ${attrs}>
      <text x="0" y="26" font-size="15" font-weight="750" fill="var(--muted)">Start of shift</text>
      <text x="${w}" y="26" text-anchor="end" font-size="15" font-weight="750" fill="var(--muted)">End of shift</text>
      <path d="M${x0} 21 H${x1}" stroke="var(--line)" stroke-width="5" stroke-linecap="round"/>
      <g style="color:var(--muted)"><svg x="${+X(SC.CUP) - 12}" y="0" width="24" height="24"><use href="#i-cup"/></svg></g>
      ${rings.map(f => `<circle cx="${X(f)}" cy="21" r="10" fill="var(--panel)" stroke="var(--amber)" stroke-width="4"/>`).join('')}
      ${frac == null ? '' : `<circle cx="${X(frac)}" cy="21" r="10" fill="var(--amber)" stroke="var(--panel)" stroke-width="3"/>`}</svg>`;
  };
  SC.WHEN = { routine: 0.03, s1: 0.12, s2: 0.42, s3: 0.6, s4: 0.84 };

  // ---------- the save template ----------
  // top band: save tag + trigger chip and the shift strip (left), four-question rail (right; lit windows per question)
  SC.topband = (n, title, trig, lits, when) => `
    ${A(0, 0, `<div class="savetag"><span class="t">Save ${n}</span><span class="t muted" style="font-weight:650">· ${title}</span><span class="chip trig">${I(SC.TRIG[trig][0])}${SC.TRIG[trig][1]}</span></div>`, 'data-in="fade ^1.1 0.5"')}
    ${A(0, 78, SC.shift(when, 460), 'data-in="fade ^1.1 0.5"')}
    ${A(0, 0, `<div class="hrail" style="width:1680px;justify-content:flex-end">${Q.map((q, i) => `<div data-lit="${lits[i] || '0 0.001'}" data-dim=".62"><div class="hq ${q[0]}"><span class="n">${i + 1}</span>${q[1]}</div></div>`).join('')}</div>`, 'data-in="fade ^1.1 0.5"', 'top:64px')}`;
  // the case card: catch / call / prevented. call = 'fix' | 'stop'
  SC.casecard = (c) => A(1120, 130, `<div class="casecard">
      <div class="row">${I('mag')}<div><div class="lab">The catch</div><div class="val" data-in="up ${c.catchAt}">${c.catch}</div></div></div>
      <div class="row">${I('sign')}<div><div class="lab">The call</div><div style="display:flex;gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap">
        <span data-in="pop ${c.callAt}" class="minibtn ${c.call}">${c.call === 'fix' ? I('wrench') + 'Fix it' : I('phone') + 'Stop &amp; get help'}</span>
        <span data-in="fade ${c.goAt}" style="font-size:28px;color:var(--muted)">→</span>
        <span data-in="pop ${c.goAt}" class="minibtn go">${I('check')}Go</span></div>
        ${c.why ? `<div style="margin-top:10px;font-size:24px;font-weight:700;color:var(--ink);line-height:1.25" data-in="fade ${c.callAt}+0.5">${c.why}</div>` : ''}</div></div>
      <div class="row">${I('shield')}<div><div class="lab">What it prevented</div><div class="val" data-in="up ${c.prevAt}">${c.prev}</div></div></div>
    </div>`, 'data-in="fade ^1.1 0.5"');
  // sound cues: [time ref, scene id, kind]; tooling/events.js resolves them and tooling/mix.py places the sounds
  window.SFX = window.SFX || [];
  SC.sfx = (ref, scene, kind) => { window.SFX.push([ref, scene, kind]); return ''; };
  // prediction holds. predict(): "What would make you stop here?" over the empty case card, with a ring that fills
  // through the silent hold. yourCall(): "Your call?" with the three calls dimmed; the chosen one lights on the reveal.
  const holdRing = SC.holdRing = (from, dur) => `<svg width="74" height="74" viewBox="0 0 74 74" style="flex:none"><circle cx="37" cy="37" r="30" fill="none" stroke="var(--line)" stroke-width="8"/>
      <g transform="rotate(-90 37 37)"><circle cx="37" cy="37" r="30" fill="none" stroke="var(--amber)" stroke-width="8" stroke-linecap="round" pathLength="1" data-in="draw ${from} ${dur}"/></g></svg>`;
  SC.predict = (scene, cue, hold, out) => {
    SC.sfx(`${cue}.end+0.15`, scene, 'tick'); SC.sfx(`${cue}.end+1.15`, scene, 'tick'); SC.sfx(`${cue}.end+2.15`, scene, 'tick');
    return A(1120, 130, `<div class="promptcard">
      <div style="display:flex;align-items:center;gap:14px">${I('mag', '', 'width:44px;height:44px;color:var(--amber-text)')}<div class="lab" style="color:var(--amber-text)">Find the problem</div></div>
      <div class="h3" style="margin-top:18px;line-height:1.15">What would make you stop here?</div>
      <div style="display:flex;align-items:center;gap:18px;margin-top:26px">${holdRing(`${cue}.end`, hold)}<div class="muted" style="font-size:24px;font-weight:650;line-height:1.3">Look at the picture.<br>Watching alone? Pause now.</div></div></div>`,
      `data-in="pop ${cue}~what-0.15 0.4" data-out="fade ${out} 0.3"`);
  };
  SC.yourCall = (scene, cue, hold, choice, reveal, out) => {
    SC.sfx(`${cue}.end+0.15`, scene, 'tick'); SC.sfx(`${cue}.end+1.15`, scene, 'tick'); SC.sfx(reveal, scene, choice === 'fix' ? 'fix' : 'stop');
    const opts = [['go', 'check', 'Go'], ['fix', 'wrench', 'Fix it'], ['stop', 'phone', 'Stop &amp; get help']];
    return A(1120, 130, `<div class="promptcard">
      <div style="display:flex;align-items:center;justify-content:space-between"><div class="h3">Your call?</div>${holdRing(`${cue}.end`, hold)}</div>
      <div style="display:flex;flex-direction:column;gap:14px;margin-top:18px">${opts.map(([k, ic, t]) => `<div style="position:relative"><div class="btn ${k}" style="font-size:30px;padding:14px 24px;width:100%;box-sizing:border-box;background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 4px var(--${k})">${I(ic, '', `color:var(--${k})`)}${t}</div>${k === choice ? `<div class="abs" style="inset:0" data-in="fade ${reveal} 0.3"><div class="btn ${k}" style="font-size:30px;padding:14px 24px;width:100%;height:100%;box-sizing:border-box">${I(ic)}${t}</div></div>` : ''}</div>`).join('')}</div></div>`,
      `data-in="pop ${cue}~call-0.15 0.4" data-out="fade ${out} 0.35"`);
  };
  // the 1 s Stop · Look · Ask · Decide sting that opens each save (no narration)
  SC.sting = () => A(330, 250, `<div style="display:flex;gap:18px;align-items:center">${[['STOP', 'hand'], ['LOOK', 'eye'], ['ASK', 'ask'], ['DECIDE', 'sign']].map(([w, ic], i) =>
      `<div data-in="pop ^${(0.08 + i * 0.2).toFixed(2)} 0.3" style="width:230px;height:150px;border-radius:20px;background:var(--panel);border:3px solid var(--amber);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">${I(ic, '', 'width:56px;height:56px;color:var(--ink)')}<div style="font-size:30px;font-weight:850;letter-spacing:.06em">${w}</div></div>`).join('')}</div>`,
    'data-out="fade ^1.05 0.3"');

  // ---------- a patch line for line clearance ----------
  SC.patchLine = () => `<svg viewBox="0 0 1680 320" width="1680" height="320">
      <rect x="40" y="190" width="1300" height="44" rx="22" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      ${Array.from({ length: 14 }, (_, i) => `<circle cx="${90 + i * 92}" cy="212" r="10" fill="var(--line)"/>`).join('')}
      <rect x="150" y="30" width="360" height="160" rx="14" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <circle cx="250" cy="100" r="46" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/><circle cx="250" cy="100" r="12" fill="var(--steel)"/>
      <rect x="330" y="64" width="150" height="80" rx="8" fill="none" stroke="var(--steel)" stroke-width="4"/>
      <text x="405" y="112" text-anchor="middle" font-size="20" font-weight="800" fill="var(--muted)">POUCHER</text>
      <text x="330" y="176" text-anchor="middle" font-size="20" font-weight="800" fill="var(--muted)">PATCH LINE</text>
      <g id="lc-left0">${[0, 1, 2].map(i => `<rect x="${640 + i * 110}" y="150" width="70" height="40" rx="12" fill="color-mix(in srgb, var(--q3) 18%, var(--panel))" stroke="var(--q3)" stroke-width="4"/>`).join('')}</g>
      <g id="lc-left1"><rect x="1000" y="140" width="96" height="50" rx="6" fill="#fff" stroke="var(--steel)" stroke-width="4"/><path d="M1014 156 h66 M1014 170 h44" stroke="var(--steel)" stroke-width="4"/></g>
      <g id="lc-left2"><rect x="1180" y="130" width="90" height="60" rx="6" fill="#e9c7f0" stroke="#7a4fd0" stroke-width="4"/><path d="M1180 144 h90" stroke="#7a4fd0" stroke-width="3" stroke-dasharray="6 5"/></g>
    </svg>`;

  const html = SC.html, P = SC.P;

  // 1 ─ title ────────────────────────────────────────────────────────────────
  const mini = (ic, label, ref, col) => `<div class="card" style="width:440px;height:250px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px" data-in="pop ${ref}">${I(ic, '', `width:110px;height:110px;color:${col}`)}<div class="h4">${label}</div></div>`;
  html.push(SC.scene('title-open', '', `
    <div class="abs" style="inset:0" data-out="dim s1-2 0.6">
      <div class="abs" data-out="fade s1-3.end 0.5" style="left:60px;top:40px;display:flex;gap:70px">
        ${mini('drum', 'Pump solvent', 's1-1~pump', 'var(--q3)')}${mini('pallet', 'Move pallets', 's1-1~pallets', '#9a6a3a')}${mini('slit', 'Slit rolls', 's1-1~slit', 'var(--q1)')}
      </div>
    </div>
    <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
      <g data-in="fade s1-2 0.5" data-out="fade s1-3.end 0.5">${P(700, 740, 380)}
        <text x="770" y="420" font-size="90" font-weight="850" fill="var(--amber-text)" data-in="pop s1-2~different 0.4" data-out="fade s1-3 0.3">?</text>
        <g style="color:var(--ink)" data-in="pop s1-3~hands 0.4"><svg x="806" y="410" width="88" height="88"><use href="#i-hand"/></svg></g>
        <g transform="rotate(-90 850 454)"><circle cx="850" cy="454" r="74" fill="none" stroke="var(--amber)" stroke-width="12" pathLength="1" data-in="draw s1-3~two 1.0"/></g>
        <text x="950" y="470" font-size="40" font-weight="800" fill="var(--amber-text)" data-in="fade s1-3~minutes">Two minutes</text></g>
    </svg>
    ${A(690, 0, ART.stopwatch('sw1', { size: 300 }), 'data-in="pop s1-3.end+0.15"')}
    ${A(0, 350, `<div class="h0" style="width:1680px;text-align:center">The 2-Minute Rule</div>`, 'data-in="up s1-3.end+0.35"')}
    ${A(0, 515, `<div class="h3 muted" style="width:1680px;text-align:center;font-weight:600">One shift on a patch line</div>`, 'data-in="up s1-3.end+0.7"')}
    ${A(540, 620, SC.shift(null, 600), 'data-in="wipe s1-3.end+0.8 0.6"')}
  `));

  // 2 ─ the rule ─────────────────────────────────────────────────────────────
  const tl = (x, key, ref) => `${A(x - 30, -30, `<div style="width:60px;height:60px;border-radius:50%;background:var(--panel);border:4px solid var(--amber);display:flex;align-items:center;justify-content:center">${I(SC.TRIG[key][0], '', 'width:34px;height:34px;color:var(--amber-text)')}</div>`, `data-in="pop ${ref}"`)}
      ${A(x - 110, 46, `<div class="small" style="width:220px;text-align:center;font-weight:750;color:var(--ink)">${key === 'break' ? 'Break' : SC.TRIG[key][1]}</div>`, `data-in="up ${ref}+0.1"`)}`;
  html.push(SC.scene('the-rule', '', `
    ${A(0, 0, `<div class="h1">The 2-minute rule</div>`, 'data-in="up s2-1~rule-0.3"')}
    ${A(0, 130, `<div style="display:flex;align-items:center;gap:16px">${I('pin', '', 'width:54px;height:54px;color:var(--amber)')}<div class="h3">Pause at the point of work</div></div>`, 'data-in="up s2-1~point"')}
    <div class="abs" style="left:60px;top:360px;width:1560px" data-out="fade s2-3 0.5">
      ${A(0, 0, `<div style="width:1560px;height:6px;border-radius:3px;background:var(--line)"></div>`, 'data-in="grow s2-1~pause 0.8"')}
      ${tl(110, 'start', 's2-1~start')}${tl(440, 'break', 's2-2~break')}${tl(770, 'handover', 's2-2~handover')}${tl(1100, 'interruption', 's2-2~interruption')}${tl(1430, 'change', 's2-2~change')}
    </div>
    ${A(220, 250, ART.stopwatch('sw2', { size: 300 }), 'data-in="pop s2-3"')}
    ${A(660, 340, `<div class="h2">Two minutes is a guide</div>`, 'data-in="up s2-3~minutes"')}
    ${A(660, 450, `<div class="h3 muted">What matters is the pause</div>`, 'data-in="up s2-3~matters"')}
  `));

  // 3 ─ line clearance for people ───────────────────────────────────────────
  html.push(SC.scene('line-clearance', '', `
    <div class="abs" style="inset:0" data-out="fade s3-2.end+0.45 0.4">
      ${A(0, 0, `<div class="h2">Line clearance for product</div>`, 'data-in="up s3-1" data-out="fade s3-2~people-0.8 0.3"')}
      ${A(0, 0, `<div class="h1">Line clearance for <span style="color:var(--q3)">people</span></div>`, 'data-in="up s3-2~people-0.4"')}
      ${A(1000, 6, `<span class="tag grey" style="font-size:24px">21 CFR 211.130(e) · Checked right before use</span>`, 'data-in="left s3-1~clearance 0.6" data-out="fade s3-2~people-0.8 0.3"')}
      ${A(0, 150, `<div style="display:flex;gap:30px">${['No laminate left', 'No labels left', 'No pouches left'].map((t, i) => SC.check(t, `data-in="pop s3-1.end${['-0.4', '-0.15', '+0.1'][i]} 0.3"`)).join('')}</div>`, 'data-out="fade s3-2~people-0.8 0.3"')}
      <div class="abs" style="left:0;top:330px" data-in="wipe s3-1 1.2">${SC.patchLine()}
        <div id="lc-mag" class="abs" style="left:0;top:40px;opacity:0">${I('mag', '', 'width:140px;height:140px;color:var(--ink)')}</div>
      </div>
      <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
        <g data-in="fade s3-2 0.6">${P(1490, 560, 300)}</g>
        <g transform="rotate(-90 1490 410)"><circle cx="1490" cy="410" r="170" fill="none" stroke="var(--q3)" stroke-width="7" pathLength="1" data-in="draw s3-2~people 0.9"/></g>
      </svg>
      ${A(1260, 130, `<div style="display:flex;gap:10px">${[0, 1, 2, 3].map(i => `<div style="width:46px;height:46px;border-radius:12px;border:4px solid var(--${SC.Q[i][0]})" data-in="pop s3-2~people-${(0.5 - i * 0.12).toFixed(2)} 0.3"></div>`).join('')}</div>`)}
    </div>
    <div class="abs" style="inset:0">
      ${A(0, 0, `<div class="h1"><span style="display:inline-block" data-in="up s3-3~adds">Adds to.</span> <span class="muted" style="display:inline-block" data-in="up s3-3~never">Never replaces.</span></div>`)}
      ${A(740, 170, ART.stopwatch('sw3', { size: 220 }), 'data-in="down s3-3~guards+0.2"')}
      ${A(980, 220, `<div style="font-size:80px;font-weight:850;color:var(--amber-text)">+</div>`, 'data-in="pop s3-3~guards+0.4"')}
      <div class="abs" style="left:30px;top:460px;display:flex;gap:24px">
        ${[['doc', 'Procedures', 's3-3~procedures'], ['form', 'Permits', 's3-3~permits'], ['lock', 'Lockout', 's3-3~lockout'], ['shield', 'Guards', 's3-3~guards']].map(([ic, l, r]) => `<div class="block" style="width:390px;height:100px;justify-content:center;font-size:34px" data-in="up ${r}">${I(ic)}${l}</div>`).join('')}
      </div>
    </div>
  `));

  // 4 ─ how to run it ───────────────────────────────────────────────────────
  const tiles = [['STOP', 'hand', 's4-1~stop', 's4-1~stop s4-2'], ['LOOK', 'eye', 's4-2', 's4-2 s4-3'], ['ASK', 'ask', 's4-3', 's4-3 s4-6'], ['DECIDE', 'sign', 's4-6', 's4-6 $0']];
  html.push(SC.scene('how-to-run-it', '', `
    ${tiles.map(([w, ic, ref, hl], i) => A(105 + i * 380, 0, `<div data-hl="${hl}"><div class="tile" style="height:190px;gap:12px" data-in="down ^0.1+${(i * 0.12).toFixed(2)}">${I(ic, '', 'width:80px;height:80px')}<div class="w" style="font-size:42px">${w}</div></div></div>`)).join('')}
    ${A(105, 214, `<div class="h4" style="width:330px;text-align:center">Hands off</div>`, 'data-in="up s4-1~hands" data-out="fade s4-3 0.4"')}
    ${A(445, 214, `<div class="h4" style="width:410px;text-align:center">Around the job<br>Compare with the plan</div>`, 'data-in="up s4-2~around" data-out="fade s4-3 0.4"')}
    <div class="abs" style="left:0;top:300px" data-out="fade s4-6 0.4">
      ${A(0, 0, SC.qcard(0, 'width:810px'), 'data-in="pop s4-3~what\'s"')}
      ${A(870, 0, SC.qcard(1, 'width:810px'), 'data-in="pop s4-3~could"')}
      ${A(0, 140, SC.qcard(2, 'width:810px'), 'data-in="pop s4-4"')}
      ${A(870, 140, SC.qcard(3, 'width:810px'), 'data-in="pop s4-4~what"')}
      ${A(0, 290, `<div style="display:flex;align-items:center;gap:16px;font-size:34px;font-weight:800;color:var(--ok-text)">${I('verify', '', 'width:46px;height:46px')}<span>Checked <span style="color:var(--ink)">= you saw or tested it yourself ·</span> Assumed <span style="color:var(--ink)">= you’re guessing</span></span></div>`, 'data-in="up s4-5"', 'width:1680px')}
    </div>
    ${A(0, 270, `<div style="width:1680px;text-align:center;font-size:28px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Your call</div>`, 'data-in="fade s4-6~call 0.4" data-out="fade s4-7-0.2 0.4"')}
    ${A(0, 330, `<div style="width:1680px;display:flex;justify-content:center">${SC.btns(['', '', ''], ['data-in="pop s4-6~go"', 'data-in="pop s4-6~fix"', 'data-in="pop s4-6~stop"'])}</div>`, 'data-out="fade s4-7-0.2 0.4"')}
    ${A(0, 250, `<div class="contrast" style="width:1680px">
      <div class="col fix" data-in="up s4-7"><div class="ttl">${I('wrench', '', 'width:46px;height:46px;color:var(--fix)')}Fix it, only if</div>
        <ul><li data-in="fade s4-7~trained">You’re trained <b>and</b> authorized</li><li data-in="fade s4-7~step">It’s a step in your procedure</li></ul>
        <div class="eg" data-in="fade s4-7~procedure+0.2">e.g. a small adhesive drip or a full trim-waste bag, as your procedure says</div></div>
      <div class="col stop" data-in="up s4-8"><div class="ttl">${I('phone', '', 'width:46px;height:46px;color:var(--stop)')}Stop &amp; get help for</div>
        <ul><li data-in="fade s4-8~permit">No permit yet</li><li data-in="fade s4-8~someone">Someone else’s unfinished work</li><li data-in="fade s4-8~authorized">Not authorized</li></ul>
        <div class="eg" data-in="fade s4-8~help">e.g. a guard that won’t close · a web wrapped on a roll you’re not trained to clear · an alarm you don’t recognize</div></div></div>`)}
    ${A(0, 690, `<div class="h4" style="width:1680px;text-align:center">Not sure, or the fix doesn’t work? <span style="color:var(--stop)">Stop &amp; get help.</span></div>`, 'data-in="up s4-9"')}
  `));

  // 5 ─ a routine Go ─────────────────────────────────────────────────────────
  const rq = (i, ans, ref, ansRef) => `<div style="display:flex;align-items:center;gap:18px" data-in="up ${ref}">${SC.qcard(i, 'width:500px;box-sizing:border-box', 'sm')}
      <div style="display:flex;align-items:center;gap:10px;font-size:25px;font-weight:750;white-space:nowrap" data-in="pop ${ansRef}">${I('check', '', 'width:38px;height:38px;color:var(--go)')}${ans}</div></div>`;
  html.push(SC.scene('routine-go', '', `
    ${A(0, 0, `<div class="savetag"><span class="t">A routine Go</span><span class="chip trig">${I('play')}Before you start</span><span class="t muted" style="font-weight:650">· Moving a laminate roll</span></div>`, 'data-in="fade ^0.2 0.5"')}
    ${A(0, 70, SC.shift(SC.WHEN.routine, 460), 'data-in="fade ^0.2 0.5"')}
    <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
      <g transform="translate(20 60)">
        ${TD.rollRoom({ lifter: 'id="rg-lifter"', roll: 'id="rg-roll"' })}
        <path d="M300 606 H740" stroke="var(--go)" stroke-width="9" opacity="0" data-in="fade s5-4~aisle 0.4"/>
        <g id="rg-grip"><g data-in="pop s5-3~tested 0.4"><circle cx="236" cy="412" r="40" fill="none" stroke="var(--go)" stroke-width="5"/></g></g>
        <g id="rg-person">${P(120, 600, 280)}</g>
      </g>
    </svg>
    ${A(120, 210, `<div style="display:flex;flex-direction:column;gap:4px"><span class="tag" style="font-size:22px">Roll lifter</span><span class="small" style="font-weight:700">lifts a roll by its core</span></div>`, 'data-in="up s5-1~lifter" data-out="fade s5-5 0.4"')}
    <div class="abs" style="left:800px;top:120px;display:flex;flex-direction:column;gap:20px">
      ${rq(0, 'Nothing', 's5-2', 's5-2~nothing')}
      ${rq(1, 'A heavy roll', 's5-2~could', 's5-2~heavy')}
      ${rq(2, 'Checked: grip tested', 's5-3', 's5-3~tested')}
      ${rq(3, 'Nobody in the aisle', 's5-4', 's5-4~aisle')}
    </div>
    ${A(800, 596, `<div style="display:flex;align-items:center;gap:16px"><div class="h4" style="margin-right:4px">Your call?</div><div data-out="fade s5-5 0.3">${holdRing('s5-4.end', 2.4)}</div>
      ${[['go', 'check', 'Go'], ['fix', 'wrench', 'Fix it'], ['stop', 'phone', 'Stop &amp; get help']].map(([k, ic, t]) => `<div style="position:relative" ${k !== 'go' ? 'data-out="fade s5-5 0.3"' : ''}><div class="btn ${k}" style="font-size:24px;padding:10px 18px;background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 3px var(--${k})">${I(ic, '', `color:var(--${k})`)}${t}</div>${k === 'go' ? `<div class="abs" style="inset:0" data-in="fade s5-5 0.3"><div class="btn go" style="font-size:24px;padding:10px 18px;height:100%;box-sizing:border-box">${I('check')}Go</div></div>` : ''}</div>`).join('')}</div>`, 'data-in="pop s5-4~call-0.15 0.4"')}
    ${A(1280, 596, `<div class="h4" style="line-height:74px">That took seconds.</div>`, 'data-in="up s5-5~took"')}
    ${SC.sfx('s5-4.end+0.25', 'routine-go', 'tick')}${SC.sfx('s5-4.end+1.25', 'routine-go', 'tick')}
    ${SC.sfx('s5-5', 'routine-go', 'go')}
  `));

  // 6 ─ four saves ──────────────────────────────────────────────────────────
  const SAVES = SC.SAVES = [['Solvent transfer', 'start', 'q3', 'drum', SC.WHEN.s1], ['Roll staging', 'break', 'q1', 'pallet', SC.WHEN.s2],
    ['Die cutter', 'handover', 'q3', 'die', SC.WHEN.s3], ['Potent product', 'change', 'q2', 'glove', SC.WHEN.s4]];
  html.push(SC.scene('four-saves', '', `
    <div class="abs" style="inset:0" data-out="up s6-2~save-0.1 0.5">
      ${A(0, 0, `<div class="h1">Most pauses end in Go</div>`, 'data-in="up s6-1"')}
      
      <svg id="ss-ticks" class="abs" style="left:40px;top:300px;overflow:visible" width="1600" height="240" viewBox="0 0 1600 240" data-in="fade s6-1 0.4"></svg>
      ${A(40, 540, `<div style="display:flex;gap:40px;font-size:26px;font-weight:700;color:var(--ink)"><span style="display:flex;gap:12px;align-items:center"><span style="width:10px;height:30px;border-radius:4px;background:var(--go)"></span>A pause that ended in Go</span><span style="display:flex;gap:12px;align-items:center"><span style="width:30px;height:30px;border-radius:50%;border:5px solid var(--amber)"></span>A pause that caught a problem</span></div>`, 'data-in="fade s6-1+0.6 0.5"')}
    </div>
    <div class="abs" style="inset:0">
      ${A(0, 0, `<div class="h2">Four two-minute saves</div>`, 'data-in="up s6-2~save+0.4"')}
      ${A(830, 26, `<div style="font-size:28px;font-weight:700;color:var(--muted);white-space:nowrap">A save = a pause that caught a problem</div>`, 'data-in="fade s6-2~save+0.4 0.5"')}
      ${A(0, 120, SC.shift(null, 1680, '', [SC.WHEN.s1, SC.WHEN.s2, SC.WHEN.s3, SC.WHEN.s4]), 'data-in="wipe s6-2~save+0.2 0.6"')}
      ${SAVES.map(([t, trig, q, ic, f], i) => A(i * 420, 200, `<div class="card" style="width:400px;height:250px;padding:22px 26px;border-left:12px solid var(--${q});display:flex;flex-direction:column;gap:16px">
          <div style="display:flex;align-items:center;gap:16px"><div style="font-size:44px;font-weight:850;color:var(--ink)">${i + 1}</div>${I(ic, '', 'width:60px;height:60px;color:var(--ink)')}</div>
          <div class="h4" style="font-size:34px">${t}</div>
          <div><span class="chip trig">${I(SC.TRIG[trig][0])}${SC.TRIG[trig][1]}</span></div></div>`, `data-in="pop s6-3~four+${(0.1 + i * 0.15).toFixed(2)}"`)).join('')}
      ${A(0, 500, `<span class="tag grey">Four examples, not real events</span>`, 'data-in="fade s6-3~examples"')}
      ${A(0, 580, `<div style="display:inline-flex;align-items:center;gap:14px;background:var(--panel);border:4px solid var(--amber);border-radius:999px;padding:10px 26px;font-size:27px;font-weight:800;white-space:nowrap">${I('mag', '', 'width:38px;height:38px;color:var(--amber-text)')}Each one asks you twice: find the problem, then pick your call</div>`, 'data-in="pop s6-4"')}
    </div>
  `));
})();
