// Scene markup, part A: shared helpers, the save template, and scenes 1–5.
// Coordinates are px inside .content (1680 x 772). Timing refs (engine.js): s4-1 cue start, s4-1~word estimated word
// time, s4-1.end, s4-1@0.5 fraction of the cue, ^x scene start + x, $x scene end - x.
(function () {
  const SC = window.SC = { html: [] };
  const I = SC.I = (id, cls = '', style = '') => `<svg class="${cls}" style="${style}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const A = SC.A = (x, y, inner, attrs = '', style = '') => `<div class="abs" style="left:${x}px;top:${y}px;${style}" ${attrs}>${inner}</div>`;
  const Q = SC.Q = [['q1', 'What’s different?', 'docs'], ['q2', 'What could hurt us?', 'warn'], ['q3', 'Checked or assumed?', 'verify'], ['q4', 'What if it goes wrong?', 'branch']];
  SC.qcard = (i, style = '', cls = '') => `<div class="q ${Q[i][0]} ${cls}" style="${style}"><div class="n">${i + 1}</div><svg class="ic"><use href="#i-${Q[i][2]}"/></svg><div class="t">${Q[i][1]}</div></div>`;
  SC.btns = (lit = ['', '', ''], ins = ['', '', ''], extra = ['', '', '']) => `<div class="decide">
      <div ${lit[0]}><div class="btn go" ${ins[0]}>${I('check')}Go</div>${extra[0]}</div>
      <div ${lit[1]}><div class="btn fix" ${ins[1]}>${I('wrench')}Fix it, if safe</div>${extra[1]}</div>
      <div ${lit[2]}><div class="btn stop" ${ins[2]}>${I('hand')}Stop &amp; get help</div>${extra[2]}</div></div>`;
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
        <span data-in="pop ${c.callAt}" class="minibtn ${c.call}">${c.call === 'fix' ? I('wrench') + 'Fix it, if safe' : I('hand') + 'Stop &amp; get help'}</span>
        <span data-in="fade ${c.goAt}" style="font-size:28px;color:var(--muted)">→</span>
        <span data-in="pop ${c.goAt}" class="minibtn go">${I('check')}Go</span></div></div></div>
      <div class="row">${I('shield')}<div><div class="lab">What it prevented</div><div class="val" data-in="up ${c.prevAt}">${c.prev}</div></div></div>
    </div>`, 'data-in="fade ^1.1 0.5"');
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
    <div class="abs" style="inset:0" data-out="dim s1-2 0.6">
      <div class="abs" data-out="fade s1-3 0.5" style="left:60px;top:60px;display:flex;gap:70px">
        ${mini('gear', 'Clear a jam', 's1-1~jam', 'var(--fix)')}${mini('wrench', 'Break a line', 's1-1~line', 'var(--q1)')}${mini('lock', 'Open a vessel', 's1-1~vessel', 'var(--q3)')}
      </div>
    </div>
    <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
      <g data-in="fade s1-2 0.5" data-out="fade s1-3+0.2 0.5">${P(700, 740, 380)}
        <g style="color:var(--ink)" data-in="pop s1-2~before 0.4"><svg x="806" y="410" width="88" height="88"><use href="#i-hand"/></svg></g>
        <g transform="rotate(-90 850 454)"><circle cx="850" cy="454" r="74" fill="none" stroke="var(--amber)" stroke-width="12" pathLength="1" data-in="draw s1-2~give 1.0"/></g>
        <text x="950" y="470" font-size="40" font-weight="800" fill="var(--amber-text)" data-in="fade s1-2~minutes">Two minutes</text></g>
    </svg>
    ${A(670, 0, ART.stopwatch('sw1', { size: 340 }), 'data-in="pop s1-3+0.1"')}
    ${A(0, 400, `<div class="h0" style="width:1680px;text-align:center">The 2-Minute Rule</div>`, 'data-in="up s1-3+0.3"')}
    ${A(0, 570, `<div class="h3 muted" style="width:1680px;text-align:center;font-weight:600">Six saves on a pharma floor</div>`, 'data-in="up s1-3+0.9"')}
  `));

  // 2 ─ the rule ─────────────────────────────────────────────────────────────
  const tl = (x, label, ic, ref) => `${A(x - 30, -30, `<div style="width:60px;height:60px;border-radius:50%;background:var(--panel);border:4px solid var(--amber);display:flex;align-items:center;justify-content:center">${I(ic, '', 'width:34px;height:34px;color:var(--amber-text)')}</div>`, `data-in="pop ${ref}"`)}
      ${A(x - 110, 46, `<div class="small" style="width:220px;text-align:center;font-weight:750;color:var(--ink)">${label}</div>`, `data-in="up ${ref}+0.1"`)}`;
  html.push(SC.scene('the-rule', '', `
    ${A(0, 20, `<div style="display:flex;align-items:center;gap:20px">${I('pin', '', 'width:70px;height:70px;color:var(--amber)')}<div class="h1">A pause at the point of work</div></div>`, 'data-in="up s2-1"')}
    <div class="abs" style="left:60px;top:330px;width:1560px" data-out="fade s2-3 0.5">
      ${A(0, 0, `<div style="width:1560px;height:6px;border-radius:3px;background:var(--line)"></div>`, 'data-in="grow s2-1~point 0.8"')}
      ${tl(110, 'Before you start', 'pause', 's2-2~start')}${tl(440, 'Break', 'clock', 's2-2~break')}${tl(770, 'Handover', 'people', 's2-2~handover')}${tl(1100, 'Interruption', 'phone', 's2-2~interruption')}${tl(1430, 'Change', 'gear', 's2-2~change')}
    </div>
    ${A(220, 200, ART.stopwatch('sw2', { size: 330 }), 'data-in="pop s2-3"')}
    ${A(680, 330, `<div class="h1">Rule of thumb</div>`, 'data-in="up s2-3~rule"')}
    ${A(680, 450, `<div class="h3 muted">The pause is what matters</div>`, 'data-in="up s2-3~what"')}
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
        ${[['doc', 'SOPs', 's3-3~sops'], ['form', 'Permits', 's3-3~permits'], ['lock', 'Lockout', 's3-3~lockout'], ['shield', 'Guards &amp; interlocks', 's3-3~lockout+0.3']].map(([ic, l, r]) => `<div class="block" style="width:390px;height:100px;justify-content:center;font-size:34px" data-in="up ${r}">${I(ic)}${l}</div>`).join('')}
      </div>
    </div>
    <div class="abs" style="inset:0">
      ${A(0, 0, `<div class="h1">You see what plans miss</div>`, 'data-in="up s3-4+0.2"')}
      ${A(160, 220, `<div class="card" style="width:360px;height:420px;display:flex;flex-direction:column;gap:22px;align-items:center;justify-content:center">${I('doc', '', 'width:120px;height:120px;color:var(--muted)')}<div class="h3">The plan</div></div>`, 'data-in="left s3-4"')}
      ${A(760, 380, I('bolt', '', 'width:110px;height:110px;color:var(--fix)'), 'data-in="pop s3-4~missed"')}
      <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
        <g data-in="fade s3-4 0.5">${P(1250, 700, 380)}</g></svg>
      ${A(1300, 290, I('eye', '', 'width:90px;height:90px;color:var(--q3)'), 'data-in="pop s3-4~because"')}
    </div>
  `));

  // 4 ─ how to run it ───────────────────────────────────────────────────────
  const tiles = [['STOP', 'hand', 's4-1', 's4-1 s4-2'], ['LOOK', 'eye', 's4-2', 's4-2 s4-3'], ['ASK', 'ask', 's4-3', 's4-3 s4-5'], ['DECIDE', 'sign', 's4-5', 's4-5 $0']];
  html.push(SC.scene('how-to-run-it', '', `
    ${tiles.map(([w, ic, ref, hl], i) => A(105 + i * 380, 0, `<div data-hl="${hl}"><div class="tile" style="height:190px;gap:12px" data-in="down ^0.1+${(i * 0.12).toFixed(2)}">${I(ic, '', 'width:80px;height:80px')}<div class="w" style="font-size:42px">${w}</div></div></div>`)).join('')}
    ${A(105, 214, `<div class="h4" style="width:330px;text-align:center">Hands off</div>`, 'data-in="up s4-1+0.2" data-out="fade s4-3 0.4"')}
    ${A(445, 214, `<div class="h4" style="width:410px;text-align:center">Around it · Next to it<br>Against the plan</div>`, 'data-in="up s4-2~around" data-out="fade s4-3 0.4"')}
    <div class="abs" style="left:0;top:300px" data-out="fade s4-5 0.4">
      ${A(0, 0, SC.qcard(0, 'width:810px'), 'data-in="pop s4-3~what\'s"')}
      ${A(870, 0, SC.qcard(1, 'width:810px'), 'data-in="pop s4-3~could"')}
      ${A(0, 140, SC.qcard(2, 'width:810px'), 'data-in="pop s4-4"')}
      ${A(870, 140, SC.qcard(3, 'width:810px'), 'data-in="pop s4-4~what"')}
    </div>
    ${A(0, 330, `<div style="width:1680px;display:flex;justify-content:center">${SC.btns(['', '', ''], ['data-in="pop s4-5~go"', 'data-in="pop s4-5~fix"', 'data-in="pop s4-5~stop"'],
      ['', `<div class="small" style="margin-top:14px;text-align:center;font-weight:700;color:var(--ink)" data-in="up s4-5~procedure">Only if trained, authorized<br>&amp; in procedure</div>`, `<div class="small" style="margin-top:14px;text-align:center;font-weight:700;color:var(--ink)" data-in="up s4-5~stop+0.5">Get help: your lead</div>`])}</div>`)}
  `));

  // 5 ─ six saves ───────────────────────────────────────────────────────────
  const SAVES = SC.SAVES = [['Tablet press', 'Handover', 'people', 'q1', 'gear'], ['Powder charge', 'Before you start', 'pause', 'q2', 'bolt'], ['Inerted vessel', 'Change · Campaign', 'gear', 'q2', 'cloud'],
    ['Blister packer', 'Interruption', 'phone', 'q3', 'lock'], ['Potent API', 'After a break', 'clock', 'q3', 'shield'], ['Line break', 'Before you start', 'pause', 'q4', 'wrench']];
  html.push(SC.scene('six-saves', '', `
    <div class="abs" style="inset:0" data-out="fade s5-2~here-0.3 0.4">
      ${A(0, 0, `<div class="h1">Most pauses end in Go</div>`, 'data-in="up s5-1"')}
      ${A(0, 120, `<div class="h3 muted">Repeat task: seconds</div>`, 'data-in="up s5-1~repeat"')}
      <svg id="ss-ticks" class="abs" style="left:40px;top:330px;overflow:visible" width="1600" height="200" viewBox="0 0 1600 200" data-in="fade s5-1 0.4"></svg>
      ${A(40, 520, `<div style="display:flex;gap:40px;font-size:26px;font-weight:700;color:var(--ink)"><span style="display:flex;gap:12px;align-items:center"><span style="width:10px;height:30px;border-radius:4px;background:var(--go)"></span>A pause that ended in Go</span><span style="display:flex;gap:12px;align-items:center"><span style="width:30px;height:30px;border-radius:50%;border:5px solid var(--amber)"></span>A pause that caught something</span></div>`, 'data-in="fade s5-1~repeat 0.5"')}
    </div>
    <div class="abs" style="inset:0">
      ${A(0, 0, `<div class="h2">Six two-minute saves</div>`, 'data-in="up s5-2~here"')}
      ${SAVES.map(([t, trig, tic, q, ic], i) => A((i % 3) * 560, 120 + Math.floor(i / 3) * 250, `<div class="card" style="width:530px;height:220px;padding:22px 26px;border-left:12px solid var(--${q});display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;align-items:center;gap:16px"><div style="font-size:44px;font-weight:850;color:var(--${q})">${i + 1}</div>${I(ic, '', 'width:56px;height:56px;color:var(--ink)')}<div class="h4">${t}</div></div>
          <div><span class="chip trig">${I(tic)}${trig}</span></div></div>`, `data-in="pop s5-2~here+${(0.15 + i * 0.12).toFixed(2)}"`)).join('')}
      ${A(0, 650, `<span class="tag grey">Illustrative composites, built from common pharma hazards</span>`, 'data-in="fade s5-3"')}
    </div>
  `));
})();
