// Scene markup for "The 2-Minute Rule". Coordinates are px inside .content (1680 x 772).
// Timing refs (see engine.js): s4-1 cue start, s4-1~word estimated word time, s4-1.end, ^x scene start + x, $x scene end - x.
(function () {
  const I = (id, cls = '', style = '') => `<svg class="${cls}" style="${style}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const A = (x, y, inner, attrs = '', style = '') => `<div class="abs" style="left:${x}px;top:${y}px;${style}" ${attrs}>${inner}</div>`;
  const Q = [['q1', 'What’s different?', 'docs'], ['q2', 'What could hurt us?', 'warn'], ['q3', 'Checked or assumed?', 'verify'], ['q4', 'What if it goes wrong?', 'branch']];
  const qcard = (i, style = '', cls = '') => `<div class="q ${Q[i][0]} ${cls}" style="${style}"><div class="n">${i + 1}</div><svg class="ic"><use href="#i-${Q[i][2]}"/></svg><div class="t">${Q[i][1]}</div></div>`;
  const rail = (lits, x, y, inAttr) => A(x, y, `<div class="rail" style="position:static">${lits.map((l, i) => `<div data-lit="${l}" data-dim=".32">${qcard(i)}</div>`).join('')}</div>`, inAttr);
  const btns = (lit = ['', '', ''], ins = ['', '', '']) => `<div class="decide">
      <div ${lit[0]}><div class="btn go" ${ins[0]}>${I('check')}Go</div></div>
      <div ${lit[1]}><div class="btn fix" ${ins[1]}>${I('wrench')}Fix it, if safe</div></div>
      <div ${lit[2]}><div class="btn stop" ${ins[2]}>${I('hand')}Stop &amp; get help</div></div></div>`;
  const scene = (id, cls, body) => `<section class="scene ${cls}" data-scene="${id}"><div class="content">${body}</div></section>`;
  const ST = 'stroke-linecap="round" stroke-linejoin="round"';

  // ---------- small illustrations ----------
  function sketch(open, idp) { // pipe -> valve -> vessel
    const valveCol = open ? 'var(--hazard)' : 'var(--steel)';
    return `<svg viewBox="0 0 620 300" width="620" height="300">
      <g fill="none" stroke="var(--steel)" stroke-width="10" ${ST}>
        <path d="M20 170 H250 M330 170 H430"/>
        <rect x="430" y="70" width="160" height="200" rx="26"/>
      </g>
      ${open ? `<path id="${idp}-flow" d="M24 170 H250 M330 170 H426" stroke="var(--n2)" stroke-width="4" stroke-dasharray="14 18" fill="none"/>` : ''}
      <g transform="translate(290,170)">
        <path d="M-40 -28 L0 0 L-40 28 Z M40 -28 L0 0 L40 28 Z" fill="${open ? 'none' : 'var(--steel)'}" stroke="${valveCol}" stroke-width="6" stroke-linejoin="round"/>
        <path d="M0 -4 V-52 M-30 -52 H30" stroke="${valveCol}" stroke-width="8" stroke-linecap="round"/>
      </g>
      <text x="290" y="260" text-anchor="middle" font-size="30" font-weight="800" fill="${valveCol}" letter-spacing="2">${open ? 'OPEN' : 'CLOSED'}</text>
      ${open ? `<circle id="${idp}-ring" cx="290" cy="170" r="70" fill="none" stroke="var(--hazard)" stroke-width="5"/>` : ''}
    </svg>`;
  }
  function workstation() {
    return `<svg viewBox="0 0 560 440" width="700" height="550">
      <rect x="170" y="90" width="340" height="300" rx="18" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <rect x="200" y="122" width="150" height="110" rx="10" fill="none" stroke="var(--steel)" stroke-width="5"/>
      <circle cx="420" cy="150" r="20" fill="var(--go)"/><circle cx="470" cy="150" r="20" fill="var(--stop)"/>
      <rect x="380" y="200" width="104" height="22" rx="6" fill="var(--line)"/>
      <path d="M170 300 H510" stroke="var(--line)" stroke-width="5"/>
      <path d="M190 390 v30 M490 390 v30 M20 422 H540" stroke="var(--steel)" stroke-width="6" stroke-linecap="round"/>
      ${ART.person(95, 420, 300)}
    </svg>`;
  }
  function packLine() {
    return `<svg viewBox="0 0 1680 320" width="1680" height="320">
      <rect x="40" y="190" width="1300" height="44" rx="22" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      ${Array.from({ length: 14 }, (_, i) => `<circle cx="${90 + i * 92}" cy="212" r="10" fill="var(--line)"/>`).join('')}
      <rect x="150" y="30" width="360" height="160" rx="14" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <rect x="180" y="58" width="200" height="90" rx="8" fill="none" stroke="var(--steel)" stroke-width="4"/>
      <text x="330" y="176" text-anchor="middle" font-size="22" font-weight="700" fill="var(--muted)">BLISTER PACKER</text>
      ${[0, 1, 2].map(i => `<rect x="${620 + i * 120}" y="140" width="80" height="50" rx="6" fill="var(--panel2)" stroke="var(--steel)" stroke-width="4"/>`).join('')}
      <g fill="var(--panel2)" stroke="var(--steel)" stroke-width="4">
        <rect x="1390" y="130" width="110" height="80" rx="6"/><rect x="1510" y="130" width="110" height="80" rx="6"/><rect x="1450" y="50" width="110" height="80" rx="6"/>
      </g>
      <path d="M1340 234 H1630" stroke="var(--steel)" stroke-width="6" stroke-linecap="round"/>
      <g id="lc-left1"><rect x="1000" y="136" width="84" height="54" rx="6" fill="#f6d9a8" stroke="#b86e00" stroke-width="4"/></g>
      <g id="lc-left2"><circle cx="1210" cy="160" r="30" fill="#e9c7f0" stroke="#7a4fd0" stroke-width="5"/><circle cx="1210" cy="160" r="9" fill="var(--panel)" stroke="#7a4fd0" stroke-width="4"/></g>
    </svg>`;
  }
  function tabletPress() {
    return `<svg viewBox="0 0 700 460" width="700" height="460">
      <rect x="160" y="40" width="300" height="360" rx="20" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <rect x="190" y="150" width="240" height="120" rx="12" fill="none" stroke="var(--steel)" stroke-width="5"/>
      <ellipse cx="310" cy="210" rx="96" ry="30" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/>
      ${Array.from({ length: 7 }, (_, i) => `<rect x="${236 + i * 22}" y="${168}" width="10" height="34" rx="3" fill="var(--steel)"/>`).join('')}
      <text x="310" y="110" text-anchor="middle" font-size="24" font-weight="700" fill="var(--muted)">TABLET PRESS</text>
      <path d="M150 420 H480" stroke="var(--steel)" stroke-width="6" stroke-linecap="round"/>
      <g id="tp-tool" data-in="left s5-1+0.6 0.9">
        <rect x="500" y="240" width="170" height="70" rx="10" fill="#dfe8f7" stroke="var(--q1)" stroke-width="5"/>
        ${Array.from({ length: 5 }, (_, i) => `<rect x="${518 + i * 30}" y="${252}" width="14" height="46" rx="4" fill="var(--q1)"/>`).join('')}
        <text x="585" y="345" text-anchor="middle" font-size="22" font-weight="700" fill="var(--q1)">NEW TOOLING</text>
      </g>
    </svg>`;
  }
  function cipSkid() {
    return `<svg viewBox="0 0 760 460" width="760" height="460">
      <rect x="80" y="110" width="180" height="270" rx="40" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <path d="M260 160 H600 V268 M260 340 H548" fill="none" stroke="var(--steel)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="600" cy="320" r="50" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <path d="M582 296 L626 320 L582 344 Z" fill="var(--steel)"/>
      <text x="664" y="372" font-size="22" font-weight="700" fill="var(--muted)">PUMP</text>
      <path d="M60 430 H680" stroke="var(--steel)" stroke-width="6" stroke-linecap="round"/>
      <path d="M130 380 v50 M210 380 v50 M600 370 v60" stroke="var(--steel)" stroke-width="6"/>
      <g id="cip-steam" fill="none" stroke="var(--muted)" stroke-width="5" stroke-linecap="round"></g>
      <g style="color:var(--hazard)"><svg x="130" y="190" width="80" height="80"><use href="#i-drop"/></svg></g>
    </svg>`;
  }
  function blisterPacker() {
    return `<svg viewBox="0 0 760 460" width="760" height="460">
      <rect x="60" y="90" width="420" height="250" rx="18" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <rect x="92" y="122" width="240" height="140" rx="10" fill="none" stroke="var(--steel)" stroke-width="5"/>
      <text x="270" y="312" text-anchor="middle" font-size="22" font-weight="700" fill="var(--muted)">BLISTER PACKER</text>
      <path d="M40 360 H500" stroke="var(--steel)" stroke-width="6" stroke-linecap="round"/>
      <path d="M480 200 H560" stroke="var(--steel)" stroke-width="6"/>
      <rect x="560" y="140" width="130" height="150" rx="12" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <text x="625" y="130" text-anchor="middle" font-size="20" font-weight="700" fill="var(--muted)">DISCONNECT</text>
      <g transform="translate(593,180)" style="color:var(--stop)"><svg width="64" height="64"><use href="#i-lock"/></svg></g>
      <path d="M625 228 V250" stroke="var(--fix)" stroke-width="3"/>
      <rect x="605" y="250" width="40" height="34" rx="5" fill="var(--fix)"/><circle cx="625" cy="259" r="5" fill="var(--panel)"/>
      <rect x="370" y="170" width="84" height="56" rx="10" fill="var(--go)"/>
      <text x="412" y="206" text-anchor="middle" font-size="20" font-weight="800" fill="#fff">START</text>
      <g data-in="down s5-3~verify 0.5" style="color:var(--ink)"><svg x="380" y="100" width="64" height="72"><use href="#i-point"/></svg></g>
    </svg>`;
  }
  function reactor() {
    return `<svg viewBox="0 0 760 460" width="760" height="460">
      <path d="M140 140 Q140 100 180 100 H360 Q400 100 400 140 V320 Q400 380 340 380 H200 Q140 380 140 320 Z" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <rect x="225" y="70" width="90" height="30" rx="6" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/>
      <path d="M232 70 L200 10 H340 L308 70" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5" stroke-linejoin="round"/>
      <path d="M180 380 v40 M360 380 v40 M100 420 H460" stroke="var(--steel)" stroke-width="6" stroke-linecap="round"/>
      <text x="270" y="250" text-anchor="middle" font-size="22" font-weight="700" fill="var(--muted)">REACTOR</text>
      <path d="M420 250 C 520 250, 520 150, 610 150" fill="none" stroke="var(--q4)" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round" pathLength="1" data-in="draw s5-4~charging+0.4 1.0" style="stroke-dasharray:none"/>
      <g style="color:var(--q4)" data-in="pop s5-4~charging+1.2"><svg x="615" y="105" width="90" height="90"><use href="#i-exit"/></svg></g>
      <g style="color:var(--q4)" data-in="pop s5-4~charging+1.6"><svg x="615" y="250" width="80" height="80"><use href="#i-phone"/></svg></g>
    </svg>`;
  }
  function tankBox(prefix, x, y, scale, overlay, opts = {}) {
    const w = Math.round(860 * scale), h = Math.round(660 * scale);
    return `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" ${opts.attrs || ''}>
      ${ART.tank(Object.assign({ prefix, width: w, height: h, person: false }, opts.tank || {}))}
      <svg viewBox="0 0 860 660" width="${w}" height="${h}" class="abs" style="left:0;top:0;overflow:visible">${overlay}</svg>
    </div>`;
  }
  const P = ART.person;
  const hatch = { x: 470, y: 136 };

  const html = [];

  // 1 ─ cold open + title ────────────────────────────────────────────────
  html.push(scene('cold-open-title', '', `
    ${A(20, 120, `<div class="card" style="width:760px;height:500px"><div style="display:flex;justify-content:space-between;align-items:center"><div class="h3">PLAN</div><span class="tag grey">Written earlier</span></div><div style="margin-top:40px;margin-left:10px">${sketch(false, 'plan')}</div></div>`, 'data-out="fade s1-3 0.6"')}
    ${A(900, 120, `<div class="card" style="width:760px;height:500px"><div style="display:flex;justify-content:space-between;align-items:center"><div class="h3 amber">NOW</div><span class="tag grey">Here, at the job</span></div><div style="margin-top:40px;margin-left:10px">${sketch(true, 'now')}</div></div>`, 'data-in="right s1-2" data-out="fade s1-3 0.6"')}
    ${A(790, 290, `<div style="font-size:120px;font-weight:850;color:var(--hazard)">≠</div>`, 'data-in="pop s1-2~may" data-out="fade s1-3 0.4"')}
    ${A(670, 20, ART.stopwatch('sw1', { size: 340 }), 'data-in="pop s1-3+0.2"')}
    ${A(0, 420, `<div class="h0" style="width:1680px;text-align:center">The 2-Minute Rule</div>`, 'data-in="up s1-3+0.5"')}
    ${A(0, 590, `<div class="h3 muted" style="width:1680px;text-align:center;font-weight:600">A pause at the point of work</div>`, 'data-in="up s1-3+1.2"')}
  `));

  // 2 ─ what it is ─────────────────────────────────────────────────────────
  const tl = (x, label, ref) => `
      ${A(x - 26, -26, I('pause', '', 'width:52px;height:52px;color:var(--amber)'), `data-in="pop ${ref}"`)}
      ${A(x - 130, 52, `<div class="small" style="width:260px;text-align:center;font-weight:700;color:var(--ink)">${label}</div>`, `data-in="up ${ref}+0.1"`)}`;
  html.push(scene('what-it-is', '', `
    <div class="abs" style="inset:0" data-out="fade s2-3 0.5">
      ${A(0, 200, workstation(), 'data-in="fade ^0 0.6"')}
      ${A(300, 30, I('pause', '', 'width:120px;height:120px;color:var(--amber)'), 'data-in="down s2-1+0.3"')}
      ${A(760, 60, `<div class="h2">A deliberate pause</div>`, 'data-in="up s2-1+0.4"')}
      ${A(760, 150, `<div class="h3 muted">At the point of work</div>`, 'data-in="up s2-1~where"')}
      <div class="abs" style="left:760px;top:420px;width:900px">
        ${A(0, 0, `<div style="width:900px;height:6px;border-radius:3px;background:var(--line)"></div>`, 'data-in="grow s2-2 0.8"')}
        ${tl(80, 'Before you start', 's2-2~start')}${tl(330, 'After a break', 's2-2~break')}${tl(580, 'After handover', 's2-2~handover')}${tl(820, 'Any change', 's2-2~change')}
      </div>
    </div>
    <div class="abs" style="inset:0" data-out="fade s2-4 0.5">
      ${A(140, 150, `<div class="doc" style="border-color:var(--amber);background:color-mix(in srgb,var(--amber) 14%,var(--panel))">${I('pause', '', 'color:var(--amber)')}2-minute pause<span style="margin-left:auto;font-size:44px;color:var(--amber)">+</span></div>`, 'data-in="down s2-3~never-0.9 0.7"')}
      ${['SOP', 'Permit', 'Lockout', 'Confined space'].map((d, i) => A(140, 256 + i * 104, `<div class="doc">${I('doc')}${d}</div>`, `data-in="up s2-3~${['sops', 'permits', 'lockout', 'confined'][i]}"`)).join('')}
      ${A(800, 260, `<div class="h1">Adds to.</div>`, 'data-in="up s2-3+0.3"')}
      ${A(800, 380, `<div class="h1 muted">Never replaces.</div>`, 'data-in="up s2-3~never"')}
    </div>
    <div class="abs" style="inset:0" data-out="fade s2-5 0.5">
      ${A(260, 90, ART.stopwatch('sw2', { size: 360 }), 'data-in="pop s2-4" data-out="fade s2-4~what 0.6"')}
      ${A(340, 210, I('pause', '', 'width:200px;height:200px;color:var(--amber)'), 'data-in="fade s2-4~what 0.6"')}
      ${A(110, 150, `<div style="font-size:220px;font-weight:300;color:var(--amber);line-height:1">~</div>`, 'data-in="pop s2-4~rule" data-out="fade s2-4~what 0.6"')}
      ${A(820, 200, `<div class="h1">Rule of thumb</div>`, 'data-in="up s2-4~rule"')}
      ${A(820, 330, `<div class="h3 muted">What matters is the pause.</div>`, 'data-in="up s2-4~what"')}
    </div>
    <div class="abs" style="inset:0">
      ${A(0, 200, `<div class="h2">Same name.</div><div class="h2 muted" style="margin-top:14px">Different rule.</div>`, 'data-in="up s2-5+0.2"')}
      ${A(880, 80, `<div class="card" style="width:600px;height:460px;transform:rotate(2deg)"><div class="h4">Productivity tip</div>
        ${['Quick task? Do it now.', 'Reply to that email', 'File the report'].map(t => `<div style="display:flex;gap:16px;align-items:center;margin-top:30px;font-size:30px;color:var(--muted)"><span style="width:32px;height:32px;border:3px solid var(--line);border-radius:6px"></span>${t}</div>`).join('')}</div>`, 'data-in="left s2-5"')}
      ${A(1080, 330, `<div class="stamp">Not this rule</div>`, 'data-in="pop s2-5~productivity+0.4"')}
    </div>
  `));

  // 3 ─ line clearance ─────────────────────────────────────────────────────
  html.push(scene('line-clearance', '', `
    <div class="abs" style="inset:0" data-out="fade s3-4 0.6">
      ${A(0, 0, `<div class="h1">Line clearance</div>`, 'data-in="up s3-1"')}
      ${A(0, 120, `<div class="h3 muted">For product</div>`, 'data-in="up s3-1+0.6"')}
      <div class="abs" style="left:0;top:330px" data-in="wipe s3-1+0.2 1.4" data-out="dim s3-3 0.6">${packLine()}
        ${A(1000 - 22, 136 - 22, `<div style="width:128px;height:98px;border:5px solid var(--hazard);border-radius:14px"></div>`, 'data-in="pop s3-2+0.4" data-out="up s3-2~remains 0.6"')}
        ${A(1210 - 52, 160 - 52, `<div style="width:104px;height:104px;border:5px solid var(--hazard);border-radius:50%"></div>`, 'data-in="pop s3-2+0.7" data-out="up s3-2~remains 0.6"')}
        <div id="lc-mag" class="abs" style="left:0;top:40px;opacity:0">${I('mag', '', 'width:150px;height:150px;color:var(--ink)')}</div>
      </div>
      ${A(900, 20, `<div class="h3">Immediately before use</div>`, 'data-in="up s3-2+0.2"')}
      ${A(900, 90, `<div class="h3 muted">Nothing left behind</div>`, 'data-in="up s3-2~remains"')}
      ${A(1140, 180, `<div class="card" style="width:500px;height:440px">
          <div style="display:flex;align-items:center;gap:14px">${I('doc', '', 'width:44px;height:44px;color:var(--muted)')}<div class="h4">Batch record</div></div>
          ${['Dispensing', 'Line clearance', 'Packaging'].map((r, i) => `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px;font-size:30px;font-weight:650;${i === 1 ? 'color:var(--ink)' : 'color:var(--muted)'}"><span>${r}</span><span style="width:46px;height:46px;border:3px solid var(--line);border-radius:8px;display:flex;align-items:center;justify-content:center">${i === 1 ? `<span data-in="pop s3-3~results">${I('check', '', 'width:40px;height:40px;color:var(--go)')}</span>` : ''}</span></div>`).join('')}
          <div style="margin-top:44px"><span class="tag grey">21 CFR 211.130(e)</span></div></div>`, 'data-in="up s3-3 0.7"')}
    </div>
    <div class="abs" style="inset:0">
      ${A(0, 0, `<div class="h1" style="width:1680px;text-align:center">Line clearance for people</div>`, 'data-in="up s3-4+0.2"')}
      <svg class="abs" style="left:0;top:0" width="1680" height="772" viewBox="0 0 1680 772">
        <g data-in="fade s3-4+0.4">${P(840, 700, 400)}</g>
        ${[[480, 300, 'bolt', 'Energy', 'var(--fix)'], [1200, 300, 'drop', 'Chemicals', 'var(--stop)'], [480, 560, 'cloud', 'Atmosphere', 'var(--q1)'], [1200, 560, 'gear', 'Moving parts', 'var(--q2)']].map(([x, y, ic, lab, col], i) => `
          <g data-in="pop s3-4+${(0.7 + i * 0.25).toFixed(2)}" style="color:${col}"><svg x="${x - 50}" y="${y - 50}" width="100" height="100"><use href="#i-${ic}"/></svg></g>
          <circle cx="${x}" cy="${y}" r="82" fill="none" stroke="${col}" stroke-width="6" pathLength="1" data-in="draw s3-5+${(i * 0.55).toFixed(2)} 0.7"/>
          <text x="${x}" y="${y + 124}" text-anchor="middle" font-size="32" font-weight="750" fill="var(--ink)" data-in="fade s3-5+${(i * 0.55 + 0.3).toFixed(2)}">${lab}</text>`).join('')}
      </svg>
    </div>
  `));

  // 4 ─ how it works ───────────────────────────────────────────────────────
  const tiles = [['STOP', 'hand', 's4-1~stop', '^0 s4-2~look', 's4-2 s4-2~look'], ['LOOK', 'eye', 's4-1~look', '^0 s4-2 s4-2~look s4-3', 's4-2~look s4-3'], ['ASK', 'ask', 's4-1~ask', '^0 s4-2', '0 0.001'], ['DECIDE', 'sign', 's4-1~decide', '^0 s4-2', '0 0.001']];
  html.push(scene('how-it-works', '', `
    <div class="abs" style="inset:0" data-out="fade s4-3 0.5">
      ${tiles.map(([w, ic, ref, lit, hl], i) => A(105 + i * 380, 190, `<div data-lit="${lit}" data-dim=".3"><div data-hl="${hl}"><div class="tile" data-in="down ${ref}">${I(ic)}<div class="w">${w}</div></div></div></div>`)).join('')}
      ${A(105, 530, `<div class="h4" style="width:330px;text-align:center">Hands off</div>`, 'data-in="up s4-2+0.3"')}
      ${A(485 - 40, 530, `<div class="h4" style="width:410px;text-align:center">Look around,<br>and next to it</div>`, 'data-in="up s4-2~look+0.2"')}
    </div>
    ${A(0, 10, `<div class="h3">Four questions</div>`, 'data-in="up s4-3+0.3"')}
    ${A(0, 110, qcard(0, 'width:810px;padding:30px'), 'data-in="pop s4-3+0.5"')}
    ${A(870, 110, qcard(1, 'width:810px;padding:30px'), 'data-in="pop s4-3~could"')}
    ${A(0, 270, qcard(2, 'width:810px;padding:30px'), 'data-in="pop s4-4+0.1"')}
    ${A(870, 270, qcard(3, 'width:810px;padding:30px'), 'data-in="pop s4-4~what"')}
    ${A(0, 480, `<div class="h3" style="width:1680px;text-align:center">Then decide</div>`, 'data-in="up s4-5"')}
    ${A(0, 580, `<div style="width:1680px;display:flex;justify-content:center">${btns(['', '', ''], ['data-in="pop s4-5~go"', 'data-in="pop s4-5~fix"', 'data-in="pop s4-5~stop"'])}</div>`)}
  `));

  // 5 ─ on the floor ───────────────────────────────────────────────────────
  const vig = (inRef, outRef, body) => `<div class="abs" style="left:480px;top:0;width:1200px;height:772px" data-in="fade ${inRef} 0.5"${outRef ? ` data-out="fade ${outRef} 0.4"` : ''}>${body}</div>`;
  html.push(scene('on-the-floor', '', `
    ${rail(['s5-1 s5-2', 's5-2 s5-3', 's5-3 s5-4', 's5-4 $0'], 0, 20, 'data-in="left ^0 0.6"')}
    ${vig('s5-1', 's5-2', `${A(60, 10, `<span class="tag" style="font-size:32px">First run after a tooling change</span>`, 'data-in="up s5-1+0.4"')}${A(120, 110, tabletPress(), '', 'transform:scale(1.3);transform-origin:0 0')}`)}
    ${vig('s5-2', 's5-3', `${A(60, 10, `<span class="tag" style="font-size:32px">Clean- or steam-in-place</span>`, 'data-in="up s5-2+0.3"')}${A(60, 100, cipSkid(), '', 'transform:scale(1.25);transform-origin:0 0')}
        ${A(980, 240, `<span class="tag hz" style="font-size:32px">Hot caustic</span>`, 'data-in="up s5-2~caustic"')}${A(980, 330, `<span class="tag hz" style="font-size:32px">Steam</span>`, 'data-in="up s5-2~steam"')}`)}
    ${vig('s5-3', 's5-4', `${A(60, 10, `<span class="tag" style="font-size:32px">Locked out. Verified by you?</span>`, 'data-in="up s5-3~locked"')}${A(40, 130, blisterPacker(), '', 'transform:scale(1.25);transform-origin:0 0')}
        ${A(980, 230, `<div style="display:flex;align-items:center;gap:12px;font-size:30px;font-weight:750;color:var(--go)">${I('check', '', 'width:60px;height:60px')}Nothing moves</div>`, 'data-in="pop s5-3~verify+0.9"')}
        ${A(980, 340, `<div class="btn go" style="font-size:30px;padding:14px 28px">${I('check')}Go</div>`, 'data-in="pop s5-3.end-0.2" data-out="fade s5-4-0.1 0.4"')}`)}
    ${vig('s5-4', 's5-5', `${A(60, 10, `<span class="tag" style="font-size:32px">Charging a reactor</span>`, 'data-in="up s5-4+0.3"')}${A(60, 110, reactor(), '', 'transform:scale(1.25);transform-origin:0 0')}
        ${A(980, 250, `<div class="h3" style="color:var(--q4)">Your next move?</div>`, 'data-in="up s5-4~next"')}`)}
    ${vig('s5-5', '', `<svg class="abs" style="left:0;top:0" width="1240" height="772" viewBox="0 0 1240 772"><g>${P(600, 680, 420)}</g></svg>
        ${['Rushed', 'Tired', 'Distracted'].map((c, i) => A([170, 790, 760][i], [180, 160, 380][i], `<span class="chip" style="font-size:34px">${c}</span>`, `data-in="pop s5-5~${c.toLowerCase()}"`)).join('')}
        ${A(330, 0, `<div class="h3" style="color:var(--q4)">Check yourself, too</div>`, 'data-in="up s5-5~check"')}`)}
  `));

  // 6 ─ the case ───────────────────────────────────────────────────────────
  html.push(scene('the-case', 'dark', `
    <div class="abs" style="inset:0" data-out="fade s6-2 0.6">
      ${A(60, 60, `<div class="card" style="width:640px;height:420px;position:relative;overflow:hidden;background:var(--panel)">
          <svg width="640" height="420" viewBox="0 0 640 420" class="abs" style="left:0;top:0">
            ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 90} 0 V420" stroke="var(--line)" stroke-width="2" opacity=".5"/>`).join('')}${Array.from({ length: 5 }, (_, i) => `<path d="M0 ${i * 90} H640" stroke="var(--line)" stroke-width="2" opacity=".5"/>`).join('')}
            <path d="M0 0 H120 C 150 90, 110 160, 180 230 S 260 330, 330 420 H0 Z" fill="var(--n2)" opacity=".16"/>
            <path d="M120 0 C 150 90, 110 160, 180 230 S 260 330, 330 420" fill="none" stroke="var(--n2)" stroke-width="6" opacity=".6"/>
            <text x="28" y="396" font-size="22" fill="var(--muted)" font-weight="650">Pacific Ocean</text>
          </svg>
          <div class="abs" style="left:300px;top:110px;color:var(--amber)" data-in="down s6-1+0.2 0.6">${I('pin', '', 'width:110px;height:110px')}</div></div>`, 'data-in="fade s6-1 0.6"')}
      ${A(60, 510, `<div class="h3">Los Angeles · January 2011</div>`, 'data-in="up s6-1~los"')}
      ${A(900, 130, `<div style="color:var(--muted)">${I('plant', '', 'width:240px;height:240px')}</div>`, 'data-in="up s6-1~biopharmaceutical"')}
      ${A(900, 410, `<span class="tag" style="font-size:32px">Biopharmaceutical plant</span>`, 'data-in="up s6-1~biopharmaceutical+0.3"')}
    </div>
    <div class="abs" style="inset:0" data-in="fade s6-2 0.8">
      ${tankBox('c6', 300, 200, 0.8, `
        <defs><clipPath id="c6-above"><rect x="-600" y="-900" width="2200" height="1051"/></clipPath></defs>
        <g id="c6-o2"></g>
        <g clip-path="url(#c6-above)">
          <g id="c6-p1" opacity="0">${P(0, 0, 330)}<g style="color:var(--amber)"><svg x="44" y="-178" width="54" height="54"><use href="#i-thermo"/></svg></g></g>
          <g id="c6-p2" opacity="0">${P(0, 0, 320)}</g>
          <g id="c6-p3" opacity="0">${P(0, 0, 330)}</g>
        </g>
        <circle id="c6-ring" cx="${hatch.x}" cy="${hatch.y}" r="40" fill="none" stroke="var(--amber)" stroke-width="6" opacity="0"/>
        <g data-in="pop s6-7+0.2" style="color:var(--fix)"><svg x="${hatch.x - 50}" y="${hatch.y - 130}" width="100" height="100"><use href="#i-helmet"/></svg></g>
      `)}
      <div id="c6-dim" class="abs" style="inset:-200px;background:#0b111a;opacity:0;pointer-events:none"></div>
      ${A(614, 600, `<span class="tag" style="background:#3b2c08;border-color:#e7c46a;color:#f6dc98">Plasma</span>`, 'data-in="up s6-2~plasma"')}
      ${A(905, 340, `<span class="tag">6,000 L</span>`, 'data-in="up s6-2~liter"')}
      <div class="abs" style="left:1190px;top:40px;width:490px">
        ${A(0, 40, `<div class="h3" style="font-size:40px;white-space:nowrap">Oxygen pushed out</div>`, 'data-in="up s6-3+0.3" data-out="fade s6-4 0.4"')}
        ${A(0, 130, `<span class="tag grey" style="font-size:30px">Air not tested</span>`, 'data-in="up s6-3~untested"')}
        ${A(0, 40, `<div class="h3" style="font-size:40px;white-space:nowrap">Entry to take a reading</div>`, 'data-in="up s6-4+0.3" data-out="fade s6-5 0.4"')}
        ${A(0, 220, `<span class="tag grey" style="font-size:30px">No rescue plan or equipment</span>`, 'data-in="up s6-5~rescue"')}
        ${A(0, 320, `<span class="tag" style="font-size:30px">Brought out by firefighters</span>`, 'data-in="up s6-7+0.3"')}
      </div>
      ${A(1190, 650, `<div class="srcline">Source: Cal/OSHA (2011);<br>OSHA accident summary 202542296</div>`, 'data-in="fade s6-2+1.0"')}
    </div>
    <div class="abs" style="inset:-110px -120px -198px -120px;background:#121a25" data-in="fade s6-7.end+0.4 1.2">
      <div class="abs center" style="left:0;right:0;top:400px;height:120px"><div class="h2" style="font-weight:600;color:#e6ecf3" data-out="fade s6-8 0.7">The technician died.</div></div>
      <div class="abs center" style="left:0;right:0;top:350px;height:220px;flex-direction:column;gap:18px" data-in="fade s6-8+0.5 0.9"><div class="h2" style="font-weight:700;color:#e6ecf3">Not careless people.</div><div class="h2" style="font-weight:700;color:var(--amber)">Gaps in the system.</div></div>
    </div>
  `));

  // 7 ─ pause one ──────────────────────────────────────────────────────────
  const twoMarks = (lit) => `<div style="position:relative;width:520px;height:90px">
      <div class="abs" style="left:20px;top:18px;width:480px;height:5px;background:var(--line);border-radius:3px"></div>
      ${[['Before entry', 40], ['Before rescue', 400]].map(([l, x], i) => `<div class="abs" style="left:${x}px;top:6px;width:30px;height:30px;border-radius:50%;background:${i === lit ? 'var(--amber)' : 'var(--line)'}"></div><div class="abs" style="left:${x - 85}px;top:46px;width:200px;white-space:nowrap;text-align:center;font-size:24px;font-weight:700;color:${i === lit ? 'var(--ink)' : 'var(--dim)'}">${l}</div>`).join('')}</div>`;
  const panel = (inRef, outRef, body) => `<div class="abs" style="left:1180px;top:110px;width:500px" data-in="up ${inRef} 0.5" data-out="fade ${outRef} 0.4">${body}</div>`;
  html.push(scene('pause-one', 'dark', `
    ${A(480, 0, `<div class="h3">Pause one: before entry</div>`, 'data-in="up s7-1~first"')}
    ${A(1160, -10, twoMarks(0), 'data-in="fade s7-1+0.2 0.8"')}
    ${rail(['s7-2 s7-3', 's7-3 s7-5', 's7-5 s7-8', 's7-8 $0'], 0, 100, 'data-in="left s7-1~first"')}
    ${tankBox('c7', 500, 180, 0.74, `
      <g>${P(110, 620, 330)}</g>
      <g data-in="down s7-1+0.4" style="color:var(--amber)"><svg x="75" y="190" width="70" height="70"><use href="#i-pause"/></svg></g>
      <rect x="292" y="164" width="356" height="250" rx="8" fill="none" stroke="var(--n2)" stroke-width="4" stroke-dasharray="12 10" data-in="fade s7-3+0.2" data-out="fade s7-4 0.4"/>
      <text x="470" y="300" text-anchor="middle" font-size="34" font-weight="800" fill="var(--n2)" data-in="fade s7-3+0.4" data-out="fade s7-4 0.4">N₂ (invisible)</text>
      <g data-in="fade s7-7 0.6" data-out="fade s7-9 0.4">
        <path d="M660 490 H740 M740 462 V518 H808 V462 Z" fill="none" stroke="var(--q3)" stroke-width="5" stroke-dasharray="8 8"/>
        <text x="774" y="450" text-anchor="middle" font-size="44" font-weight="850" fill="var(--q3)">?</text>
      </g>
    `, { tank: {} })}
    ${A(645, 150, `<span class="tag n2">N₂ still flowing</span>`, 'data-in="up s7-2~nitrogen" data-out="fade s7-4 0.4"')}
    ${A(875, 150, `<span class="tag hz">Not isolated</span>`, 'data-in="up s7-2~isolated" data-out="fade s7-4 0.4"')}
    ${A(960, 652, `<span class="tag ok">Outside reading?</span>`, 'data-in="up s7-7+0.4" data-out="fade s7-9 0.4"')}
    ${A(530, 135, `<span class="tag dashed" style="font-size:28px">Watcher?</span>`, 'data-in="pop s7-8~watching" data-out="fade s7-9+0.6 0.4"')}
    ${A(700, 135, `<span class="tag dashed" style="font-size:28px">Rescue plan?</span>`, 'data-in="pop s7-8~rescue" data-out="fade s7-9+0.6 0.4"')}
    ${panel('s7-3~color', 's7-4', `<div style="display:flex;gap:40px;color:var(--muted)">
        <div style="position:relative">${I('eye', '', 'width:120px;height:120px')}<div class="abs" style="left:-6px;top:56px;width:132px;height:7px;background:var(--hazard);transform:rotate(-35deg);border-radius:4px"></div></div>
        <div style="position:relative">${I('nose', '', 'width:120px;height:120px')}<div class="abs" style="left:-6px;top:56px;width:132px;height:7px;background:var(--hazard);transform:rotate(-35deg);border-radius:4px"></div></div></div>
        <div class="h3" style="margin-top:30px">No color.<br>No smell.</div>`)}
    ${panel('s7-4', 's7-5', `<div style="color:var(--hazard)">${I('breath', '', 'width:120px;height:120px')}</div>
        <div class="h3" style="margin-top:20px">1–2 breaths can knock you out</div><div class="h4 muted" style="margin-top:16px">No warning</div>
        <div class="srcline" style="margin-top:40px">U.S. Chemical Safety Board, Bulletin 2003-10-B</div>`)}
    ${panel('s7-5', 's7-9', `${ART.gauge('g7', { width: 430, height: 307 })}
        <div style="font-size:24px;font-weight:650;color:var(--muted);margin-top:4px">Normal air: 20.9%</div>
        <div style="font-size:24px;font-weight:650;color:var(--hazard);margin-top:6px">Below 19.5%: too little O₂ (OSHA)</div>
        <div class="abs" style="left:0;top:420px" data-out="fade s7-6 0.3">${['O₂ measured?', 'Permit needed?'].map((t, i) => `<div style="display:flex;gap:16px;align-items:center;margin-top:16px;font-size:32px;font-weight:750" data-in="up s7-5~${i ? 'permit' : 'measured'}"><span style="width:40px;height:40px;border:4px solid var(--muted);border-radius:8px"></span>${t}</div>`).join('')}</div>
        <div class="abs" style="left:0;top:420px">${['Isolate N₂', 'Test the air'].map((t, i) => `<div style="display:flex;gap:16px;align-items:center;margin-top:16px;font-size:32px;font-weight:750" data-in="up s7-6${i ? '~test' : '+0.3'}"><span style="width:40px;height:40px;border:4px solid var(--q3);border-radius:8px"></span>${t}</div>`).join('')}</div>`)}
    ${A(500, 680, btns(['data-lit="0 0.001" data-dim=".28"', 'data-lit="0 0.001" data-dim=".28"', 'data-lit="s7-9~stop $0" data-dim=".5"']), 'data-in="up s7-9"')}
  `));

  // 8 ─ pause two ──────────────────────────────────────────────────────────
  html.push(scene('pause-two', 'dark', `
    ${A(480, 0, `<div class="h3">Pause two: before rescue</div>`, 'data-in="up s8-1"')}
    ${A(1160, -10, twoMarks(1), 'data-in="fade ^0 0.6"')}
    ${rail(['s8-2@0.25 s8-2@0.38', 's8-2@0.38 s8-2@0.51 s8-3 s8-4', 's8-2@0.51 s8-2@0.64', 's8-2@0.64 s8-2@0.77 s8-4 $0'], 0, 100, 'data-in="fade ^0 0.5"')}
    ${tankBox('c8', 500, 180, 0.74, `
      <defs><radialGradient id="c8-glow"><stop offset="0" stop-color="#ffb81c" stop-opacity=".75"/><stop offset="1" stop-color="#ffb81c" stop-opacity="0"/></radialGradient></defs>
      <ellipse id="c8-glowel" cx="470" cy="470" rx="170" ry="80" fill="url(#c8-glow)"/>
      <text x="470" y="380" text-anchor="middle" font-size="34" font-weight="800" fill="#ffd27a">Someone down</text>
      <g id="c8-people">${P(-10, 620, 320)}${P(122, 620, 330)}</g>
      <g id="c8-rings"></g>
    `)}
    ${panel('s8-2', 's8-3', `<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="none" stroke="var(--line)" stroke-width="14"/><circle id="c8-sec" cx="100" cy="100" r="80" fill="none" stroke="var(--amber)" stroke-width="14" pathLength="1" stroke-dasharray="1 1" transform="rotate(-90 100 100)" stroke-linecap="round"/></svg>
        <div class="h3" style="margin-top:20px">Even in seconds</div>`)}
    ${panel('s8-3', 's8-4', `${ART.gauge('g8', { width: 430, height: 307 })}<div style="margin-top:10px"><span class="tag grey">Not tested</span></div>
        <div class="h3" style="margin-top:26px;font-size:40px;white-space:nowrap">Assume the air did this</div>`)}
    ${panel('s8-4', 's8-5', `<div class="h3" style="margin-top:40px">More people at risk</div>`)}
    ${A(1180, 560, `<div class="card" style="width:500px;padding:16px 24px;font-size:25px;line-height:1.35;font-weight:600;color:var(--muted)">NIOSH, 1983–1993: some who died in confined spaces were would-be rescuers.</div>`, 'data-in="up s8-4@0.75" data-out="fade s8-5 0.4"')}
    <div class="abs" style="left:1170px;top:135px;width:510px">
      ${[['hand', 'Don’t go in', 's8-5~don'], ['phone', 'Call trained rescue', 's8-5~call'], ['barrier', 'Keep others out', 's8-5~keep'], ['tripod', 'Retrieval gear', 's8-5~retrieval']].map(([ic, l, r], i) => A((i % 2) * 265, Math.floor(i / 2) * 195, `<div class="card" style="width:245px;height:178px;padding:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">${I(ic, '', 'width:70px;height:70px;color:var(--q3)')}<div style="font-size:26px;font-weight:750;text-align:center">${l}</div></div>`, `data-in="pop ${r}"`)).join('')}
      ${A(0, 405, `<div class="block" style="width:510px;background:color-mix(in srgb,var(--q3) 14%,var(--panel));border-color:var(--q3);font-size:28px">${I('shield')}Plan and gear, in place beforehand</div>`, 'data-in="up s8-6+0.2"')}
    </div>
  `));

  // 9 ─ what they found ────────────────────────────────────────────────────
  const xItem = (t, ref, sub = false) => `<div style="display:flex;gap:16px;align-items:center;margin-top:${sub ? 12 : 26}px;margin-left:${sub ? 60 : 0}px;font-size:${sub ? 30 : 34}px;font-weight:${sub ? 600 : 750};color:${sub ? 'var(--muted)' : 'var(--ink)'}" data-in="up ${ref}">${I('x', '', `width:${sub ? 34 : 44}px;height:${sub ? 34 : 44}px;color:var(--stop);flex:none`)}${t}</div>`;
  html.push(scene('what-they-found', '', `
    ${A(0, 0, `<div class="kicker">Cal/OSHA findings</div>`, 'data-in="up s9-1" data-out="fade s9-5 0.5"')}
    <div class="abs" style="inset:0" data-out="fade s9-4 0.5">
      ${A(0, 70, `<div style="display:flex;align-items:baseline;gap:20px"><span class="h0 num" data-in="count s9-1+0.2 1.4" data-from="0" data-to="11">0</span><span class="h3">citations</span></div>`)}
      ${A(0, 260, `<div style="display:flex;align-items:baseline;gap:20px"><span class="h1 num" style="color:var(--stop)" data-in="count s9-1~four 0.8" data-from="0" data-to="4">0</span><span class="h3">willful</span></div>`, 'data-in="fade s9-1~four"')}
      ${A(700, 60, `<div class="card" style="width:980px"><div class="h4">Employer’s program</div>
          ${xItem('Air not tested', 's9-2~test')}
          ${xItem('Confined-space program fell short', 's9-3+0.3')}
          ${xItem('Air testing', 's9-3~testing', true)}${xItem('Protective gear', 's9-3~protective', true)}${xItem('Rescue', 's9-3~rescue', true)}</div>`, 'data-in="up s9-2"')}
    </div>
    <div class="abs" style="inset:0" data-out="fade s9-5 0.5">
      ${A(0, 230, `<div class="h1" style="width:1680px;text-align:center">The program,</div>`, 'data-in="up s9-4+0.2"')}
      ${A(0, 350, `<div class="h1 muted" style="width:1680px;text-align:center">not the technician.</div>`, 'data-in="up s9-4~not"')}
    </div>
    <div class="abs" style="inset:0" data-in="fade s9-5 0.5" data-out="fade s9-7 0.5">
      ${A(0, 0, `<div class="h2">The design lesson</div>`, 'data-in="up s9-5+0.3"')}
      ${A(0, 140, `<div class="h3" style="width:640px">A reading shouldn’t require going inside.</div>`, 'data-in="up s9-5~reading"')}
      ${A(0, 330, `<span class="tag ok" style="font-size:32px">Installed probe or sample port</span>`, 'data-in="up s9-6+0.6"')}
      ${tankBox('c9', 720, 60, 0.95, `
        <g data-in="fade s9-5~reading 0.6">
          <g style="color:var(--fix)"><svg x="${hatch.x - 40}" y="-30" width="80" height="80"><use href="#i-thermo"/></svg></g>
          <path d="M${hatch.x} 60 V250" stroke="var(--fix)" stroke-width="5" stroke-dasharray="10 10"/><path d="M${hatch.x - 14} 236 l14 18 l14 -18" fill="none" stroke="var(--fix)" stroke-width="5"/>
          <path d="M${hatch.x - 70} 90 L${hatch.x + 70} 210" stroke="var(--stop)" stroke-width="8" stroke-linecap="round" pathLength="1" data-in="draw s9-5~going 0.6"/>
        </g>
        <g data-in="fade s9-6 0.4">
          <path d="M600 490 H760" stroke="var(--q3)" stroke-width="10" stroke-linecap="round" pathLength="1" data-in="draw s9-6 0.8"/>
          <rect x="760" y="460" width="74" height="60" rx="10" fill="var(--q3)" data-in="pop s9-6+0.6"/>
          <text x="797" y="500" text-anchor="middle" font-size="24" font-weight="800" fill="#fff" data-in="pop s9-6+0.6">°C</text>
          <path d="M470 560 v34 h44" fill="none" stroke="var(--q3)" stroke-width="10" stroke-linecap="round" data-in="fade s9-6~sample 0.5"/>
          <circle cx="526" cy="594" r="15" fill="var(--q3)" data-in="pop s9-6~sample"/>
        </g>
      `, { tank: { n2: false } })}
    </div>
    <div class="abs" style="inset:0" data-in="fade s9-7 0.6">
      <svg class="abs" style="left:140px;top:10px;overflow:visible" width="1400" height="740" viewBox="0 0 1400 740">
        <path d="M700 200 V680 M560 680 H840" stroke="var(--steel)" stroke-width="12" stroke-linecap="round"/>
        <path d="M664 206 L700 150 L736 206 Z" fill="var(--steel)"/>
        <g id="sc-beam">
          <path d="M220 150 H1180" stroke="var(--steel)" stroke-width="12" stroke-linecap="round"/>
          <g id="sc-left"><path d="M220 150 L150 340 M220 150 L290 340 M120 340 H320" stroke="var(--steel)" stroke-width="5" fill="none" stroke-linecap="round"/>
            <rect x="166" y="248" width="108" height="92" rx="14" fill="var(--panel)" stroke="var(--line)" stroke-width="3"/>
            <g style="color:var(--amber)"><svg x="185" y="259" width="70" height="70"><use href="#i-pause"/></svg></g>
            <text x="220" y="395" text-anchor="middle" font-size="32" font-weight="750" fill="var(--ink)">Worker’s pause</text></g>
          <g id="sc-right"><path d="M1180 150 L990 340 M1180 150 L1370 340 M960 340 H1400" stroke="var(--steel)" stroke-width="5" fill="none" stroke-linecap="round"/>
            ${[['meter', 'Gas meter', 1035], ['doc', 'Permit', 1180], ['people', 'Rescue team', 1325]].map(([ic, l, x]) => `<rect x="${x - 56}" y="236" width="112" height="104" rx="14" fill="var(--panel)" stroke="var(--line)" stroke-width="3"/><g style="color:var(--q3)"><svg x="${x - 40}" y="248" width="80" height="80"><use href="#i-${ic}"/></svg></g><text x="${x}" y="385" text-anchor="middle" font-size="26" font-weight="700" fill="var(--muted)">${l}</text>`).join('')}
            <text x="1180" y="440" text-anchor="middle" font-size="32" font-weight="750" fill="var(--ink)">What the system supplies</text></g>
        </g>
      </svg>
    </div>
  `));

  // 10 ─ what makes it work ────────────────────────────────────────────────
  const fblock = (ic, t, ref, extra = '') => `<div class="block" style="width:800px;margin-top:14px" data-in="up ${ref}">${I(ic)}${t}${extra}</div>`;
  html.push(scene('what-makes-it-work', '', `
    <div id="mw-left" class="abs" style="left:0;top:0;width:820px;height:772px">
    ${A(355, 0, I('pause', '', 'width:110px;height:110px;color:var(--amber)'), 'data-in="down s10-1"')}
    ${A(0, 130, `<div style="display:flex;gap:18px;width:820px;justify-content:center">
        ${[['wrench', 'Tools', 'tools'], ['clock', 'Time', 'time'], ['hand', 'Authority to stop', 'authority']].map(([ic, l, w]) => `<span class="chip" style="display:inline-flex;gap:12px;align-items:center;color:var(--ink)" data-in="pop s10-1~${w}">${I(ic, '', 'width:36px;height:36px;color:var(--q3)')}${l}</span>`).join('')}</div>`)}
    ${A(10, 230, `${fblock('hand', 'Stop without reprisal', 's10-2')}
        ${fblock('people', 'Leaders thank you, then fix it', 's10-3', `<span class="tag ok" style="margin-left:auto;font-size:22px" data-in="pop s10-3~thank">“Thanks for stopping.”</span>`)}
        ${fblock('bulb', 'Near misses → learning', 's10-4')}
        ${fblock('shield', 'Engineer the hazard out', 's10-5')}`)}
    </div>
    <div class="abs" style="left:920px;top:40px;width:760px;height:700px" data-in="fade s10-6 0.5" data-out="fade s10-7 0.4">
      ${[[-8, 0], [0, 30], [8, 60]].map(([r, dx], i) => A(120 + dx, 40 + i * 14, `<div class="card" style="width:360px;height:250px;transform:rotate(${r}deg);display:flex;flex-direction:column;gap:14px"><div class="h4">${i === 2 ? 'TAKE 5' : '&nbsp;'}</div>${[1, 2, 3].map(() => '<div style="height:10px;border-radius:5px;background:var(--line)"></div>').join('')}</div>`)).join('')}
      ${A(40, 380, `<span class="tag grey" style="font-size:30px;white-space:normal;width:640px">Cards as paperwork: no evidence they made work safer (2022)</span>`, 'data-in="up s10-6~evidence"')}
      ${A(40, 520, `<div class="srcline">One construction-project study · see sources</div>`, 'data-in="fade s10-6~evidence+0.4"')}
    </div>
    <div class="abs" style="left:920px;top:60px;width:760px;height:700px" data-in="fade s10-7 0.5" data-out="fade s10-8 0.4">
      ${A(40, 40, `<span class="chip" style="display:inline-flex;gap:16px;align-items:center;font-size:50px;font-weight:850;color:var(--ink);padding:20px 40px">${I('pause', '', 'width:60px;height:60px;color:var(--amber)')}A habit.</span>`, 'data-in="pop s10-7~habit"')}
      ${A(40, 240, `<div style="display:flex;gap:24px;align-items:center">${I('arch', '', 'width:130px;height:130px;color:var(--q3)')}<div class="h3">A gateway<br>to stopping.</div></div>`, 'data-in="up s10-7~gateway"')}
    </div>
    <div class="abs" style="left:920px;top:60px;width:760px;height:700px" data-in="fade s10-8 0.5">
      ${A(60, 30, `<div style="position:relative;color:var(--muted)">${I('form', '', 'width:200px;height:200px')}<svg class="abs" style="left:-20px;top:-10px" width="240" height="220"><path d="M10 200 L230 20" stroke="var(--stop)" stroke-width="6" stroke-linecap="round" pathLength="1" data-in="draw s10-8+0.4 0.5"/></svg></div>`)}
      ${A(60, 300, `<div class="h1">Not a form.</div>`, 'data-in="up s10-8~not"')}
      ${A(60, 420, `<div class="h1" style="color:var(--q3)">Not blame.</div>`, 'data-in="up s10-8~blame"')}
    </div>
  `));

  // 11 ─ your two minutes ─────────────────────────────────────────────────
  html.push(scene('your-two-minutes', '', `
    ${A(0, 0, `<div class="h2">Before you start. When things change.</div>`, 'data-in="up s11-1"')}
    <div class="abs" style="left:0;top:220px;width:1000px" data-in="fade s11-1+0.3 0.6" data-out="fade s11-2 0.4">
      <div style="width:1000px;height:6px;border-radius:3px;background:var(--line)"></div>
      ${[['Before you start', 130, 1], ['After a break', 390, 0], ['After handover', 640, 0], ['Any change', 900, 1]].map(([l, x, on]) => `${A(x - 26, -26, I('pause', '', `width:52px;height:52px;color:${on ? 'var(--amber)' : 'var(--line)'}`))}${A(x - 130, 52, `<div class="small" style="width:260px;text-align:center;font-weight:750;color:${on ? 'var(--ink)' : 'var(--dim)'}">${l}</div>`)}`).join('')}
    </div>
    ${tankBox('c11', 1060, 250, 0.62, `
      <path d="M600 490 H740" stroke="var(--q3)" stroke-width="10" stroke-linecap="round"/><rect x="740" y="460" width="74" height="60" rx="10" fill="var(--q3)"/><text x="777" y="500" text-anchor="middle" font-size="24" font-weight="800" fill="#fff">°C</text>
      ${P(800, 620, 330)}
    `, { tank: { n2: false }, attrs: 'data-in="fade s11-1~change 0.6" data-out="fade s11-2-0.3 0.4"' })}
    ${A(1120, 680, `<span class="tag ok">Reading from outside</span>`, 'data-in="up s11-1~change+0.4" data-out="fade s11-2-0.3 0.4"')}
    ${A(0, 130, qcard(0, 'width:810px'), 'data-in="pop s11-2"')}
    ${A(870, 130, qcard(1, 'width:810px'), 'data-in="pop s11-2~could"')}
    ${A(0, 270, qcard(2, 'width:810px'), 'data-in="pop s11-3"')}
    ${A(870, 270, qcard(3, 'width:810px'), 'data-in="pop s11-3~what"')}
    ${A(0, 480, `<div style="width:1680px;display:flex;justify-content:center">${btns(['data-lit="s11-4~go $0" data-dim=".35"', 'data-lit="s11-4~fix $0" data-dim=".35"', 'data-lit="s11-4~stop $0" data-dim=".35"'])}</div>`, 'data-in="up s11-4"')}
  `));

  // 12 ─ closing card + sources ───────────────────────────────────────────
  html.push(scene('closing-card', '', `
    <div id="cl-card" class="abs" style="left:240px;top:0;width:1200px" data-in="zoom ^0.1 0.8">
      <div class="card" style="padding:40px 50px">
        <div style="display:flex;align-items:center;gap:20px">${I('watch', '', 'width:72px;height:72px;color:var(--amber)')}<div class="h2">The 2-Minute Rule</div></div>
        <div class="kicker" style="margin-top:18px">Stop · Look · Ask · Decide</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px">${[0, 1, 2, 3].map(i => qcard(i, '', 'sm')).join('')}</div>
        <div style="display:flex;gap:30px;margin-top:26px;font-size:32px;font-weight:800"><span style="color:var(--go)">Go</span><span style="color:var(--dim)">·</span><span style="color:var(--fix)">Fix it, if safe</span><span style="color:var(--dim)">·</span><span style="color:var(--stop)">Stop &amp; get help</span></div>
      </div>
    </div>
    ${A(0, 650, `<div class="h3" style="width:1680px;text-align:center">You know this work best.</div>`, 'data-in="up s12-1" data-out="fade s12-2 0.4"')}
    ${A(0, 640, `<div class="h2" style="width:1680px;text-align:center">Line clearance for people</div>`, 'data-in="up s12-2~clear"')}
    <div class="abs" style="inset:-110px -120px -198px -120px;background:var(--bg)" data-in="up s12-2.end+3.2 0.8">
      <div class="abs" style="left:200px;top:150px;width:1520px">
        <div class="kicker">Sources</div>
        <ol style="margin:22px 0 0;padding-left:34px;font-size:26px;line-height:1.5;color:var(--ink)">
          <li>Cal/OSHA citations announced July 2011, as reported by Fierce Pharma and CBS Los Angeles</li>
          <li>OSHA accident summary 202542296 (event date January 21, 2011)</li>
          <li>U.S. Chemical Safety Board, Safety Bulletin 2003-10-B, <i>Hazards of Nitrogen Asphyxiation</i></li>
          <li>21 CFR 211.130(e) (line clearance) · 29 CFR 1910.146 (permit-required confined spaces)</li>
          <li>NIOSH Publication 94-103, <i>Worker Deaths in Confined Spaces</i> (1994)</li>
          <li>IOGP Report 459-1, <i>Start Work Checks</i>; IOGP <i>Process Safety Fundamentals</i></li>
          <li>SLAM (Stop, Look, Assess, Manage), Leadership and Worker Involvement Toolkit hosted by UK HSE</li>
          <li>Havinga, Shire &amp; Rae (2022), <i>Safety</i> 8(2):27</li>
        </ol>
        <div class="srcline" style="margin-top:26px">Illustrations are schematic. The employer and people involved are not named. Narration is a synthesized voice.</div>
      </div>
    </div>
    <div class="abs" style="inset:-110px -120px -198px -120px;background:#000" data-in="fade $1.3 1.1"></div>
  `));

  document.getElementById('stage').innerHTML = html.join('\n');
  // chapter label changes inside a scene: [from-ref, scene, label]
  window.CHAPTER_MARKS = [['s9-5', 'what-they-found', 'Beyond the findings'], ['s9-7', 'what-they-found', 'What a pause can’t do']];

  // ---------- per-frame hooks ----------
  const H = window.HOOKS = window.HOOKS || {};
  const $ = id => document.getElementById(id);
  H['cold-open-title'] = (t, lt, a) => {
    const f = $('now-flow'); if (f) f.setAttribute('stroke-dashoffset', (-t * 60).toFixed(1));
    const r = $('now-ring'); if (r) { const k = (t * 0.9) % 1; r.setAttribute('r', (40 + 50 * k).toFixed(1)); r.setAttribute('opacity', (a.prog(t, a.ref('s1-2~may', 'cold-open-title'), 0.4) * (1 - k)).toFixed(3)); }
    const s = a.ref('s1-3+0.2', 'cold-open-title');
    ART.setStopwatch('sw1', a.ease.inOut(a.prog(t, s, 2.6)), false);
  };
  H['what-it-is'] = () => ART.setStopwatch('sw2', 1, false);
  H['line-clearance'] = (t, lt, a) => {
    const m = $('lc-mag'); const s = a.ref('s3-2+0.2', 'line-clearance'), e = a.ref('s3-2~remains', 'line-clearance');
    const p = a.prog(t, s, e - s);
    m.style.transform = `translateX(${(p * 1350).toFixed(1)}px)`;
    m.style.opacity = (Math.min(a.prog(t, s, 0.3), 1 - a.prog(t, e, 0.4))).toFixed(3);
    const out = a.prog(t, a.ref('s3-2~remains', 'line-clearance'), 0.6);
    ['lc-left1', 'lc-left2'].forEach(id => { const g = $(id); g.style.opacity = (1 - out).toFixed(3); g.style.transform = `translateY(${(-60 * out).toFixed(1)}px)`; });
  };
  H['on-the-floor'] = (t) => {
    const g = $('cip-steam'); if (!g) return; let s = '';
    for (let i = 0; i < 6; i++) { const k = ((t * 0.5) + i / 6) % 1; const x = 360 + (i % 3) * 70, y = 170 - k * 150; s += `<path d="M${x} ${y} q12 -14 0 -28 q-12 -14 0 -28" opacity="${(Math.sin(k * Math.PI) * 0.9).toFixed(2)}"/>`; }
    g.innerHTML = s;
  };
  function o2dots(gid, t, on) {
    const g = $(gid); if (!g) return; let s = '';
    for (let i = 0; i < 9; i++) {
      const k = ((t * 0.28) + i / 9) % 1, x = 330 + ((i * 67) % 280) + (470 - 330 - ((i * 67) % 280)) * k, y = 400 - k * 330;
      s += `<g opacity="${(on * Math.sin(Math.PI * Math.min(1, k * 1.2))).toFixed(3)}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16" fill="#34d1bf" opacity=".85"/><text x="${x.toFixed(1)}" y="${(y + 6).toFixed(1)}" text-anchor="middle" font-size="15" font-weight="800" fill="#06322d">O₂</text></g>`;
    }
    g.innerHTML = s;
  }
  H['the-case'] = (t, lt, a) => {
    const R = r => a.ref(r, 'the-case');
    ART.bubbles($('c6-bubbles'), t, a.prog(t, R('s6-2+0.4'), 1.0));
    $('c6-n2').setAttribute('opacity', (0.95 * a.ease.inOut(a.prog(t, R('s6-3'), 3.0))).toFixed(3));
    o2dots('c6-o2', t, Math.min(a.prog(t, R('s6-3'), 0.6), 1 - a.prog(t, R('s6-4'), 1.0)));
    const ring = $('c6-ring'); const r1 = R('s6-4~collapses'), r2 = R('s6-6');
    const k1 = a.prog(t, r1, 1.6), k2 = a.prog(t, r2, 2.2);
    if (t < r1) ring.setAttribute('opacity', 0);
    else { ring.setAttribute('r', (40 + 50 * a.ease.out(k1) + 60 * a.ease.out(k2)).toFixed(1)); ring.setAttribute('opacity', (0.25 + 0.75 * (1 - k1) * (t < r2 ? 1 : 0) + 0.6 * (t >= r2 ? 1 - k2 * 0.6 : 0)).toFixed(3)); }
    $('c6-dim').style.opacity = (0.25 * a.prog(t, r1, 1.0)).toFixed(3);
    $('c6-depth').setAttribute('opacity', a.prog(t, R('s6-2+1.0'), 0.6).toFixed(3));
    // people climb in through the hatch: walk to it, then step down behind the rim (clipped), nothing inside is drawn
    const walkIn = (id, tIn, tGo, x0) => {
      const g = $(id), m = a.ease.inOut(a.prog(t, tGo, 0.7)), d = a.ease.inOut(a.prog(t, tGo + 0.7, 1.3));
      g.setAttribute('transform', `translate(${a.lerp(x0, 470, m).toFixed(1)},${(150 + 360 * d).toFixed(1)})`);
      g.setAttribute('opacity', (a.prog(t, tIn, 0.5) * (1 - a.prog(t, tGo + 1.9, 0.2))).toFixed(3));
    };
    walkIn('c6-p1', R('s6-4'), R('s6-4~goes'), 370);
    walkIn('c6-p2', R('s6-5'), R('s6-5~go'), 370);
    walkIn('c6-p3', R('s6-5+0.3'), R('s6-5~go+0.9'), 280);
  };
  H['pause-one'] = (t, lt, a) => {
    const R = r => a.ref(r, 'pause-one');
    ART.bubbles($('c7-bubbles'), t, 1);
    $('c7-n2').setAttribute('opacity', 0.9);
    const ln = $('c7-n2line'); const on = Math.min(a.prog(t, R('s7-2'), 0.3), 1 - a.prog(t, R('s7-4'), 0.4));
    ln.style.filter = on > 0.01 ? `drop-shadow(0 0 ${(6 + 8 * on * (0.5 + 0.5 * Math.sin(t * 6))).toFixed(1)}px #79aefc)` : '';
    ART.setGauge('g7', 12.5, '?'); const g = $('g7'); g.querySelector('.g-needle').setAttribute('opacity', 0); g.querySelector('.g-val').setAttribute('fill', '#a7b5c7');
  };
  H['pause-two'] = (t, lt, a) => {
    const R = r => a.ref(r, 'pause-two');
    ART.bubbles($('c8-bubbles'), t, 1); $('c8-n2').setAttribute('opacity', 0.9);
    $('c8-glowel').setAttribute('opacity', (0.7 + 0.3 * Math.sin(t * 2.2)).toFixed(3));
    const sec = $('c8-sec'); if (sec) sec.setAttribute('stroke-dashoffset', (1 - ((t - R('s8-2')) % 1 + 1) % 1).toFixed(3));
    ART.setGauge('g8', 12.5, '?'); const g = $('g8'); g.querySelector('.g-needle').setAttribute('opacity', 0); g.querySelector('.g-val').setAttribute('fill', '#a7b5c7');
    // one warning ring at the hatch splits into three
    const s = R('s8-4+0.2'), k = a.ease.inOut(a.prog(t, s, 1.2)), vis = Math.min(a.prog(t, s, 0.3), 1 - a.prog(t, R('s8-5'), 0.5));
    let rings = ''; [-1, 0, 1].forEach(d => { rings += `<circle cx="${(470 + d * 150 * k).toFixed(1)}" cy="${(136 + Math.abs(d) * 60 * k).toFixed(1)}" r="46" fill="none" stroke="#ffb81c" stroke-width="6" opacity="${(vis * (d === 0 ? 1 : k)).toFixed(3)}"/>`; });
    $('c8-rings').innerHTML = rings;
    const back = a.ease.inOut(a.prog(t, R('s8-5+0.3'), 1.2));
    $('c8-people').setAttribute('transform', `translate(${(-22 * back).toFixed(1)},0)`);
  };
  H['what-makes-it-work'] = (t, lt, a) => {
    const k = a.ease.inOut(a.prog(t, a.ref('s10-6-0.3', 'what-makes-it-work'), 0.8));
    $('mw-left').style.transform = `translateX(${(430 * (1 - k)).toFixed(1)}px)`;
  };
  H['what-they-found'] = (t, lt, a) => {
    const k = a.ease.inOut(a.prog(t, a.ref('s9-7+0.8', 'what-they-found'), 1.6));
    const ang = 8 * k;
    $('sc-beam').setAttribute('transform', `rotate(${ang.toFixed(2)} 700 150)`);
    // keep pans hanging level
    const rad = ang * Math.PI / 180;
    $('sc-left').setAttribute('transform', `rotate(${(-ang).toFixed(2)} 220 150)`);
    $('sc-right').setAttribute('transform', `rotate(${(-ang).toFixed(2)} 1180 150)`);
  };
  H['closing-card'] = (t, lt, a) => {
    const k = a.ease.inOut(a.prog(t, a.ref('s12-2', 'closing-card'), 0.8));
    $('cl-card').style.transformOrigin = '50% 0'; $('cl-card').style.transform = `scale(${(1 - 0.06 * k).toFixed(4)})`;
    const end = a.scene('closing-card').end, fade = a.prog(t, end - 1.3, 1.1);
    ['header', 'progress-track', 'cap'].forEach(id => ($(id).style.opacity = (1 - fade).toFixed(3)));
  };
})();
