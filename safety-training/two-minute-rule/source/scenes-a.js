// Scene markup, part A: shared helpers, the save template, and scenes 1–5.
// Coordinates are px inside .content (1680 x 772). Timing refs (engine.js): sN-M cue start, sN-M~word estimated word
// time (measured by synth.py where it can be), sN-M.end, sN-M@0.5 fraction of the cue, ^x scene start + x, $x scene end - x.
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
  const ST = SC.ST = 'stroke-linecap="round" stroke-linejoin="round"';
  SC.check = (txt, attrs = '', col = 'var(--go)') => `<div class="check" ${attrs}>${I('check', '', `color:${col}`)}<span>${txt}</span></div>`;
  SC.tankBox = (prefix, x, y, scale, overlay, opts = {}) => {
    const w = Math.round(860 * scale), h = Math.round(660 * scale);
    return `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" ${opts.attrs || ''}>
      ${ART.tank(Object.assign({ prefix, width: w, height: h, person: false }, opts.tank || {}))}
      <svg viewBox="0 0 860 660" width="${w}" height="${h}" class="abs" style="left:0;top:0;overflow:visible">${overlay}</svg></div>`;
  };
  // a red catch ring that throbs once it lands (HOOKS['*'] animates .throb)
  SC.ring = (x, y, d, ref) => A(x - d / 2, y - d / 2, `<div class="throb" style="width:${d}px;height:${d}px;border:6px solid var(--stop);border-radius:50%"></div>`, `data-in="pop ${ref} 0.45"`);

  // ---------- the save template ----------
  // top band: save tag + trigger chip (left), four-question rail (right; lit windows per question)
  SC.topband = (n, title, trig, trigIcon, lits, sub = '') => `
    ${A(0, 0, `<div class="savetag"><span class="t">Save ${n}</span><span class="t muted" style="font-weight:650">· ${title}</span><span class="chip trig">${I(trigIcon)}${trig}${sub ? `<span class="muted" style="font-weight:600">· ${sub}</span>` : ''}</span></div>`, 'data-in="fade ^1.1 0.5"')}
    ${A(0, 0, `<div class="hrail" style="width:1680px;justify-content:flex-end">${Q.map((q, i) => `<div data-lit="${lits[i] || '0 0.001'}" data-dim=".62"><div class="hq ${q[0]}"><span class="n">${i + 1}</span>${q[1]}</div></div>`).join('')}</div>`, 'data-in="fade ^1.1 0.5"', 'top:64px')}`;
  // the case card: catch / call / prevented. call = 'fix' | 'stop'
  SC.casecard = (c) => A(1120, 130, `<div class="casecard">
      <div class="row">${I('mag')}<div><div class="lab">The catch</div><div class="val" data-in="up ${c.catchAt}">${c.catch}</div></div></div>
      <div class="row">${I('sign')}<div><div class="lab">The call</div><div style="display:flex;gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap">
        <span data-in="pop ${c.callAt}" class="minibtn ${c.call}">${c.call === 'fix' ? I('wrench') + 'Fix it' : I('phone') + 'Stop &amp; get help'}</span>
        <span data-in="fade ${c.goAt}" style="font-size:28px;color:var(--muted)">→</span>
        <span data-in="pop ${c.goAt}" class="minibtn go">${I('check')}Go</span></div>
        ${c.why ? `<div style="margin-top:10px;font-size:24px;font-weight:700;color:var(--ink)" data-in="fade ${c.callAt}+0.5">${c.why}</div>` : ''}</div></div>
      <div class="row">${I('shield')}<div><div class="lab">What it prevented</div><div class="val" data-in="up ${c.prevAt}">${c.prev}</div></div></div>
    </div>`, 'data-in="fade ^1.1 0.5"');
  // sound cues: [time ref, scene id, kind]; tooling/events.js resolves them and tooling/mix.py places the sounds
  window.SFX = window.SFX || [];
  SC.sfx = (ref, scene, kind) => { window.SFX.push([ref, scene, kind]); return ''; };
  // prediction holds. predict(): "What would make you stop here?" over the empty case card, with a ring that fills
  // through the silent hold. yourCall(): "Your call?" with the three calls dimmed; the chosen one lights on the reveal.
  const holdRing = (from, dur) => `<svg width="74" height="74" viewBox="0 0 74 74" style="flex:none"><circle cx="37" cy="37" r="30" fill="none" stroke="var(--line)" stroke-width="8"/>
      <g transform="rotate(-90 37 37)"><circle cx="37" cy="37" r="30" fill="none" stroke="var(--amber)" stroke-width="8" stroke-linecap="round" pathLength="1" data-in="draw ${from} ${dur}"/></g></svg>`;
  SC.predict = (scene, cue, hold, out) => {
    SC.sfx(`${cue}.end+0.15`, scene, 'tick'); SC.sfx(`${cue}.end+1.15`, scene, 'tick'); SC.sfx(`${cue}.end+2.15`, scene, 'tick');
    return A(1120, 130, `<div class="promptcard">
      <div style="display:flex;align-items:center;gap:14px">${I('mag', '', 'width:44px;height:44px;color:var(--amber-text)')}<div class="lab" style="color:var(--amber-text)">Look for the catch</div></div>
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

  // ---------- small equipment illustrations ----------
  SC.packLine = (noStack) => `<svg viewBox="0 0 1680 320" width="1680" height="320">
      <rect x="40" y="190" width="1300" height="44" rx="22" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      ${Array.from({ length: 14 }, (_, i) => `<circle cx="${90 + i * 92}" cy="212" r="10" fill="var(--line)"/>`).join('')}
      <rect x="150" y="30" width="360" height="160" rx="14" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <rect x="180" y="58" width="200" height="90" rx="8" fill="none" stroke="var(--steel)" stroke-width="4"/>
      <text x="330" y="176" text-anchor="middle" font-size="22" font-weight="700" fill="var(--muted)">BLISTER PACKER</text>
      <g id="lc-left0">${[0, 1, 2].map(i => `<rect x="${620 + i * 120}" y="140" width="80" height="50" rx="6" fill="var(--panel2)" stroke="var(--steel)" stroke-width="4"/>`).join('')}</g>
      ${noStack ? '' : `<g fill="var(--panel2)" stroke="var(--steel)" stroke-width="4"><rect x="1390" y="130" width="110" height="80" rx="6"/><rect x="1510" y="130" width="110" height="80" rx="6"/><rect x="1450" y="50" width="110" height="80" rx="6"/></g>
      <path d="M1340 234 H1630" stroke="var(--steel)" stroke-width="6" stroke-linecap="round"/>`}
      <g id="lc-left1"><rect x="1000" y="136" width="84" height="54" rx="6" fill="#f6d9a8" stroke="#b86e00" stroke-width="4"/></g>
      <g id="lc-left2"><rect x="1180" y="150" width="70" height="40" rx="4" fill="#e9c7f0" stroke="#7a4fd0" stroke-width="4"/><path d="M1192 162 h46 M1192 172 h34" stroke="#7a4fd0" stroke-width="3"/></g>
    </svg>`;

  const html = SC.html, P = SC.P;

  // 1 ─ title ────────────────────────────────────────────────────────────────
  const mini = (ic, label, ref, col) => `<div class="card" style="width:440px;height:250px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px" data-in="pop ${ref}">${I(ic, '', `width:110px;height:110px;color:${col}`)}<div class="h4">${label}</div></div>`;
  html.push(SC.scene('title-open', '', `
    <div class="abs" style="inset:0" data-out="dim s1-3 0.6">
      <div class="abs" data-out="fade s1-3~that 0.5" style="left:60px;top:60px;display:flex;gap:70px">
        ${mini('gear', 'Clear a jam', 's1-1~jam', 'var(--fix)')}${mini('wrench', 'Break a line', 's1-1~line', 'var(--q1)')}${mini('lock', 'Open a vessel', 's1-1~vessel', 'var(--q3)')}
      </div>
    </div>
    <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
      <g data-in="fade s1-3 0.5" data-out="fade s1-3~that 0.5">${P(700, 740, 380)}
        <g style="color:var(--ink)" data-in="pop s1-3~before 0.4"><svg x="806" y="410" width="88" height="88"><use href="#i-hand"/></svg></g>
        <g transform="rotate(-90 850 454)"><circle cx="850" cy="454" r="74" fill="none" stroke="var(--amber)" stroke-width="12" pathLength="1" data-in="draw s1-3~give 1.0"/></g>
        <text x="950" y="470" font-size="40" font-weight="800" fill="var(--amber-text)" data-in="fade s1-3~minutes">Two minutes</text></g>
    </svg>
    ${A(670, 0, ART.stopwatch('sw1', { size: 340 }), 'data-in="pop s1-3~that"')}
    ${A(0, 400, `<div class="h0" style="width:1680px;text-align:center">The 2-Minute Rule</div>`, 'data-in="up s1-3~that+0.2"')}
    ${A(0, 570, `<div class="h3 muted" style="width:1680px;text-align:center;font-weight:600">Six saves on a pharma floor</div>`, 'data-in="up s1-3~that+0.8"')}
  `));

  // 2 ─ the rule ─────────────────────────────────────────────────────────────
  const tl = (x, label, ic, ref) => `${A(x - 30, -30, `<div style="width:60px;height:60px;border-radius:50%;background:var(--panel);border:4px solid var(--amber);display:flex;align-items:center;justify-content:center">${I(ic, '', 'width:34px;height:34px;color:var(--amber-text)')}</div>`, `data-in="pop ${ref}"`)}
      ${A(x - 110, 46, `<div class="small" style="width:220px;text-align:center;font-weight:750;color:var(--ink)">${label}</div>`, `data-in="up ${ref}+0.1"`)}`;
  html.push(SC.scene('the-rule', '', `
    ${A(0, 20, `<div style="display:flex;align-items:center;gap:20px">${I('pin', '', 'width:70px;height:70px;color:var(--amber)')}<div class="h1">A pause at the point of work</div></div>`, 'data-in="up s2-1"')}
    <div class="abs" style="left:60px;top:330px;width:1560px" data-out="fade s2-3 0.5">
      ${A(0, 0, `<div style="width:1560px;height:6px;border-radius:3px;background:var(--line)"></div>`, 'data-in="grow s2-1~point 0.8"')}
      ${tl(110, 'Before you start', 'pause', 's2-2~start')}${tl(440, 'Break', 'clock', 's2-2~break')}${tl(770, 'Handover', 'people', 's2-2~handover')}${tl(1100, 'Interruption', 'bell', 's2-2~interruption')}${tl(1430, 'Change', 'gear', 's2-2~change')}
    </div>
    ${A(220, 200, ART.stopwatch('sw2', { size: 330 }), 'data-in="pop s2-3"')}
    ${A(680, 330, `<div class="h2">A guide, not an exact time</div>`, 'data-in="up s2-3~guide"')}
    ${A(680, 450, `<div class="h3 muted">What matters is the pause</div>`, 'data-in="up s2-3~what"')}
  `));

  // 3 ─ line clearance for people ───────────────────────────────────────────
  html.push(SC.scene('line-clearance', '', `
    <div class="abs" style="inset:0" data-out="fade s3-3 0.5">
      ${A(0, 0, `<div class="h2">Line clearance: product</div>`, 'data-in="up s3-1" data-out="fade s3-2 0.4"')}
      ${A(0, 0, `<div class="h1">Line clearance for <span style="color:var(--q3)">people</span></div>`, 'data-in="up s3-2~people-0.4"')}
      ${A(1080, 6, `<span class="tag grey" style="font-size:24px">21 CFR 211.130(e) · Inspected right before use</span>`, 'data-in="left s3-1~product+0.4" data-out="fade s3-2 0.4"')}
      <div class="abs" style="left:0;top:330px" data-in="wipe s3-1 1.2">${SC.packLine(true)}
        <div id="lc-mag" class="abs" style="left:0;top:40px;opacity:0">${I('mag', '', 'width:140px;height:140px;color:var(--ink)')}</div>
      </div>
      <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
        <g data-in="fade s3-2 0.6">${P(1490, 560, 300)}</g>
        <g transform="rotate(-90 1490 410)"><circle cx="1490" cy="410" r="170" fill="none" stroke="var(--q3)" stroke-width="7" pathLength="1" data-in="draw s3-2~people 0.9"/></g>
      </svg>
    </div>
    <div class="abs" style="inset:0" data-out="fade s3-4 0.5">
      ${A(0, 0, `<div class="h1">Adds to. <span class="muted">Never replaces.</span></div>`, 'data-in="up s3-3~never"')}
      ${A(740, 150, ART.stopwatch('sw3', { size: 220 }), 'data-in="down s3-3~lockout+0.4"')}
      ${A(980, 200, `<div style="font-size:80px;font-weight:850;color:var(--amber-text)">+</div>`, 'data-in="pop s3-3~lockout+0.6"')}
      <div class="abs" style="left:30px;top:440px;display:flex;gap:24px">
        ${[['doc', 'Procedures', 's3-3~procedures'], ['form', 'Permits', 's3-3~permits'], ['lock', 'Lockout', 's3-3~lockout'], ['shield', 'Guards &amp; interlocks', 's3-3~lockout+0.3']].map(([ic, l, r]) => `<div class="block" style="width:390px;height:100px;justify-content:center;font-size:34px" data-in="up ${r}">${I(ic)}${l}</div>`).join('')}
      </div>
    </div>
    <div class="abs" style="inset:0">
      ${A(0, 0, `<div class="h1">You see what plans miss</div>`, 'data-in="up s3-4+0.2"')}
      ${A(160, 220, `<div class="card" style="width:360px;height:420px;display:flex;flex-direction:column;gap:22px;align-items:center;justify-content:center">${I('doc', '', 'width:120px;height:120px;color:var(--muted)')}<div class="h3">The plan</div></div>`, 'data-in="left s3-4"')}
      ${A(760, 380, I('bolt', '', 'width:110px;height:110px;color:var(--fix)'), 'data-in="pop s3-4~missed"')}
      <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
        <g data-in="fade s3-4 0.5">${P(1250, 700, 380)}</g></svg>
      ${A(1300, 290, I('eye', '', 'width:90px;height:90px;color:var(--q3)'), 'data-in="pop s3-4~see"')}
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
      ${A(0, 290, `<div style="display:flex;align-items:center;gap:16px;font-size:34px;font-weight:800;color:var(--ok-text)">${I('verify', '', 'width:46px;height:46px')}Checked or assumed? <span style="color:var(--ink)">Did you look or test it yourself, or are you guessing?</span></div>`, 'data-in="up s4-5"', 'width:1680px')}
    </div>
    ${A(0, 330, `<div style="width:1680px;display:flex;justify-content:center">${SC.btns(['', '', ''], ['data-in="pop s4-6~go"', 'data-in="pop s4-6~fix"', 'data-in="pop s4-6~stop"'])}</div>`, 'data-out="fade s4-7-0.2 0.4"')}
    ${A(0, 250, `<div class="contrast" style="width:1680px">
      <div class="col fix" data-in="up s4-7"><div class="ttl">${I('wrench', '', 'width:46px;height:46px;color:var(--fix)')}Fix it, only if</div>
        <ul><li data-in="fade s4-7~trained">You’re trained <b>and</b> authorized</li><li data-in="fade s4-7~step">It’s a step in your procedure</li></ul>
        <div class="eg" data-in="fade s4-7~procedure+0.2">e.g. put on the face shield your procedure lists · clean up a small spill with the spill kit, as your procedure says</div></div>
      <div class="col stop" data-in="up s4-8"><div class="ttl">${I('phone', '', 'width:46px;height:46px;color:var(--stop)')}Stop &amp; get help for</div>
        <ul><li data-in="fade s4-8~permit">No permit yet</li><li data-in="fade s4-8~someone">Someone else’s unfinished work</li><li data-in="fade s4-8~authorized">Not authorized for it</li></ul>
        <div class="eg" data-in="fade s4-8~help">e.g. someone else’s lock on the switch · a guard that won’t close · a hose you’re not trained to change</div></div></div>`)}
    ${A(0, 690, `<div class="h4" style="width:1680px;text-align:center">Not sure, or the fix doesn’t work? <span style="color:var(--stop)">Stop &amp; get help.</span></div>`, 'data-in="up s4-9"')}
  `));

  // 5 ─ a routine Go ─────────────────────────────────────────────────────────
  const rq = (i, ans, ref, ansRef) => `<div style="display:flex;align-items:center;gap:18px" data-in="up ${ref}">${SC.qcard(i, 'width:500px;box-sizing:border-box', 'sm')}
      <div style="display:flex;align-items:center;gap:10px;font-size:25px;font-weight:750;white-space:nowrap" data-in="pop ${ansRef}">${I('check', '', 'width:38px;height:38px;color:var(--go)')}${ans}</div></div>`;
  html.push(SC.scene('routine-go', '', `
    ${A(0, 0, `<div class="savetag"><span class="t">A routine Go</span><span class="chip trig">${I('clock')}Start of shift</span><span class="t muted" style="font-weight:650">· Cleaning a weighing booth</span></div>`, 'data-in="fade ^0.2 0.5"')}
    <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
      <path d="M0 660 H760" stroke="var(--line)" stroke-width="6"/>
      <path d="M60 140 H640 V660 M60 140 V660" fill="none" stroke="var(--steel)" stroke-width="7" stroke-linejoin="round"/>
      <rect x="60" y="120" width="580" height="44" rx="10" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/>
      <text x="350" y="150" text-anchor="middle" font-size="20" font-weight="800" fill="var(--muted)">WEIGHING BOOTH</text>
      ${[150, 260, 370, 480].map(x => `<path d="M${x} 190 v70 m-12 -14 l12 14 l12 -14" fill="none" stroke="var(--n2)" stroke-width="4" stroke-linecap="round" opacity=".55"/>`).join('')}
      <circle id="rg-air" cx="600" cy="196" r="14" fill="var(--go)"/><text x="562" y="202" text-anchor="end" font-size="16" font-weight="800" fill="var(--muted)">AIRFLOW</text>
      <rect x="120" y="440" width="460" height="26" rx="6" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/>
      <path d="M150 466 V660 M550 466 V660" stroke="var(--steel)" stroke-width="7"/>
      <rect x="250" y="396" width="140" height="44" rx="6" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/><rect x="270" y="384" width="100" height="10" rx="3" fill="var(--steel)"/>
      <g data-in="pop s5-4~spill 0.4"><rect x="660" y="560" width="96" height="100" rx="10" fill="#f2c94c" stroke="#9a7400" stroke-width="4"/><text x="708" y="606" text-anchor="middle" font-size="16" font-weight="900" fill="#5c4500">SPILL</text><text x="708" y="628" text-anchor="middle" font-size="16" font-weight="900" fill="#5c4500">KIT</text></g>
      <g data-in="fade s5-1 0.5">${P(470, 660, 300, { goggles: true, gloves: 'var(--q3)', ppeAttrs: 'data-in="fade s5-3~gloves 0.4"' })}</g>
      <g data-in="pop s5-3~checked 0.4"><circle cx="600" cy="196" r="30" fill="none" stroke="var(--go)" stroke-width="5"/></g>
    </svg>
    <div class="abs" style="left:800px;top:110px;display:flex;flex-direction:column;gap:20px">
      ${rq(0, 'Nothing', 's5-2', 's5-2~nothing')}
      ${rq(1, `<span style="display:flex;flex-direction:column;line-height:1.25"><span data-in="fade s5-2~leftover 0.3">Powder, cleaning chemical</span><span data-in="fade s5-3~gloves 0.3">→ gloves &amp; goggles on</span></span>`, 's5-2~could', 's5-2~leftover')}
      ${rq(2, 'Checked: airflow green', 's5-3~checked-0.6', 's5-3~green')}
      ${rq(3, 'Spill kit there', 's5-4', 's5-4~spill')}
    </div>
    ${A(800, 586, `<div style="display:flex;align-items:center;gap:16px"><div class="h4" style="margin-right:4px">Your call?</div><div data-out="fade s5-5 0.3">${holdRing('s5-4.end', 2.6)}</div>
      ${[['go', 'check', 'Go'], ['fix', 'wrench', 'Fix it'], ['stop', 'phone', 'Stop &amp; get help']].map(([k, ic, t]) => `<div style="position:relative" ${k !== 'go' ? 'data-out="fade s5-5 0.3"' : ''}><div class="btn ${k}" style="font-size:24px;padding:10px 18px;background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 3px var(--${k})">${I(ic, '', `color:var(--${k})`)}${t}</div>${k === 'go' ? `<div class="abs" style="inset:0" data-in="fade s5-5 0.3"><div class="btn go" style="font-size:24px;padding:10px 18px;height:100%;box-sizing:border-box">${I('check')}Go</div></div>` : ''}</div>`).join('')}</div>`, 'data-in="pop s5-4~call-0.15 0.4"')}
    ${A(800, 690, `<div class="h4">A few seconds.</div>`, 'data-in="up s5-5~few"')}
    ${SC.sfx('s5-4.end+0.25', 'routine-go', 'tick')}${SC.sfx('s5-4.end+1.25', 'routine-go', 'tick')}
    ${SC.sfx('s5-5', 'routine-go', 'go')}
  `));

  // 5 ─ six saves ───────────────────────────────────────────────────────────
  const SAVES = SC.SAVES = [['Tablet press', 'Handover', 'people', 'q1', 'gear'], ['Powder charge', 'Before you start', 'pause', 'q2', 'bolt'], ['Filter dryer', 'Change · Campaign', 'gear', 'q2', 'cloud'],
    ['Blister packer', 'Interruption', 'bell', 'q3', 'lock'], ['Potent ingredient', 'After a break', 'clock', 'q3', 'shield'], ['Line break', 'Before you start', 'pause', 'q4', 'wrench']];
  html.push(SC.scene('six-saves', '', `
    <div class="abs" style="inset:0" data-out="fade s6-2~here-0.55 0.4">
      ${A(0, 0, `<div class="h1">Most pauses end in Go</div>`, 'data-in="up s6-1"')}
      ${A(0, 120, `<div class="h3 muted">In seconds</div>`, 'data-in="up s6-1+0.4"')}
      <svg id="ss-ticks" class="abs" style="left:40px;top:330px;overflow:visible" width="1600" height="200" viewBox="0 0 1600 200" data-in="fade s6-1 0.4"></svg>
      ${A(40, 520, `<div style="display:flex;gap:40px;font-size:26px;font-weight:700;color:var(--ink)"><span style="display:flex;gap:12px;align-items:center"><span style="width:10px;height:30px;border-radius:4px;background:var(--go)"></span>A pause that ended in Go</span><span style="display:flex;gap:12px;align-items:center"><span style="width:30px;height:30px;border-radius:50%;border:5px solid var(--amber)"></span>A pause that caught something</span></div>`, 'data-in="fade s6-1+0.6 0.5"')}
    </div>
    <div class="abs" style="inset:0">
      ${A(0, 0, `<div class="h2">Six two-minute saves</div>`, 'data-in="up s6-2~here"')}
      ${A(880, 26, `<div style="font-size:28px;font-weight:700;color:var(--muted);white-space:nowrap">A save = a pause that caught a problem</div>`, 'data-in="fade s6-2~here+0.3 0.5"')}
      ${SAVES.map(([t, trig, tic, q, ic], i) => A((i % 3) * 560, 120 + Math.floor(i / 3) * 250, `<div class="card" style="width:530px;height:220px;padding:22px 26px;border-left:12px solid var(--${q});display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;align-items:center;gap:16px"><div style="font-size:44px;font-weight:850;color:var(--${q})">${i + 1}</div>${I(ic, '', 'width:56px;height:56px;color:var(--ink)')}<div class="h4">${t}</div></div>
          <div><span class="chip trig">${I(tic)}${trig}</span></div></div>`, `data-in="pop s6-2~here+${(0.15 + i * 0.12).toFixed(2)}"`)).join('')}
      ${A(0, 650, `<span class="tag grey">Examples built from common pharma hazards, not real events</span>`, 'data-in="fade s6-3"')}
      ${A(850, 636, `<div style="display:flex;align-items:center;gap:14px;background:var(--panel);border:4px solid var(--amber);border-radius:999px;padding:10px 26px;font-size:27px;font-weight:800;white-space:nowrap">${I('mag', '', 'width:38px;height:38px;color:var(--amber-text)')}It asks twice: find the problem, pick your call</div>`, 'data-in="pop s6-4"')}
    </div>
  `));
})();
