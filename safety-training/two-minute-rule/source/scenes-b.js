// Scene markup, part B: the six two-minute saves (scenes 6–11). Stage = left 1080 x 642 px under the top band.
(function () {
  const { I, A, P, html, check, ring } = window.SC, SC = window.SC;
  const stage = (body) => `<div class="abs" style="left:0;top:130px;width:1080px;height:642px" data-in="fade ^1.1 0.5">${body}</div>`;
  const svg = (body, attrs = '') => `<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="642" viewBox="0 0 1080 642" ${attrs}>${body}</svg>`;
  const lab = (txt, attrs, style = '') => `<div class="tag" style="font-size:24px;${style}" ${attrs}>${txt}</div>`;
  const lockIcon = (x, y, attrs, col = 'var(--stop)') => `<g ${attrs} style="color:${col}"><svg x="${x}" y="${y}" width="56" height="56"><use href="#i-lock"/></svg><rect x="${x + 16}" y="${y + 56}" width="26" height="30" rx="4" fill="var(--fix)"/><circle cx="${x + 29}" cy="${y + 64}" r="4" fill="var(--panel)"/></g>`;
  const people = (label, attrs, grey = false) => `<div style="display:flex;align-items:center;gap:10px;font-size:24px;font-weight:750;color:${grey ? 'var(--dim)' : 'var(--ink)'}" ${attrs}>${I('people', '', `width:52px;height:52px;color:${grey ? 'var(--dim)' : 'var(--q1)'}`)}${label}</div>`;
  const floor = `<path d="M0 600 H1080" stroke="var(--line)" stroke-width="5"/>`;

  // 6 ─ Save 1 · Tablet press at handover ───────────────────────────────────
  html.push(SC.scene('save-1-tablet-press', '', `
    ${SC.sting()}
    ${SC.topband(1, 'Tablet press', 'Handover', 'people', ['s6-2 s6-4'])}
    ${stage(`
      ${svg(`${floor}
        <g data-in="left ^1.3 0.6">${P(70, 600, 300)}</g>
        <rect x="230" y="170" width="300" height="430" rx="18" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
        <text x="380" y="214" text-anchor="middle" font-size="22" font-weight="800" fill="var(--muted)">TABLET PRESS</text>
        <rect x="260" y="250" width="240" height="170" rx="10" fill="none" stroke="var(--steel)" stroke-width="5"/>
        <ellipse cx="380" cy="350" rx="100" ry="30" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/>
        ${Array.from({ length: 8 }, (_, i) => i < 4 ? `<rect x="${306 + i * 20}" y="304" width="11" height="34" rx="3" fill="var(--steel)"/>` : `<rect x="${306 + i * 20}" y="304" width="11" height="34" rx="3" fill="none" stroke="var(--steel)" stroke-width="2" stroke-dasharray="3 3"/><rect x="${306 + i * 20}" y="304" width="11" height="34" rx="3" fill="var(--steel)" data-in="fade s6-5~start+${(1.5 + (i - 4) * 0.12).toFixed(2)} 0.3"/>`).join('')}
        <g data-out="fade s6-5~start-0.5 0.3"><path d="M260 250 L178 226 L178 444 L260 420 Z" fill="color-mix(in srgb, var(--n2) 16%, transparent)" stroke="var(--steel)" stroke-width="4"/></g>
        <g data-in="fade s6-5~start+1.5 0.3" data-out="fade s6-5~close 0.3"><path d="M260 250 L178 226 L178 444 L260 420 Z" fill="color-mix(in srgb, var(--n2) 16%, transparent)" stroke="var(--steel)" stroke-width="4"/></g>
        <rect x="260" y="250" width="240" height="170" rx="10" fill="color-mix(in srgb, var(--n2) 16%, transparent)" stroke="var(--steel)" stroke-width="4" data-in="fade s6-5~start-0.5 0.3" data-out="fade s6-5~start+1.5 0.3"/>
        <rect x="260" y="250" width="240" height="170" rx="10" fill="color-mix(in srgb, var(--n2) 16%, transparent)" stroke="var(--steel)" stroke-width="4" data-in="fade s6-5~close 0.3" data-out="fade s6-6~test 0.2"/>
        <g data-in="fade s6-6~test 0.2" data-out="fade s6-6~test+1.4 0.3"><path d="M260 250 L236 244 L236 426 L260 420 Z" fill="color-mix(in srgb, var(--n2) 16%, transparent)" stroke="var(--steel)" stroke-width="4"/><rect x="260" y="250" width="240" height="170" rx="10" fill="none" stroke="var(--steel)" stroke-width="4"/></g>
        <rect x="260" y="250" width="240" height="170" rx="10" fill="color-mix(in srgb, var(--n2) 16%, transparent)" stroke="var(--steel)" stroke-width="4" data-in="fade s6-6~test+1.4 0.3"/>
        <rect x="498" y="300" width="22" height="44" rx="4" fill="var(--steel)"/>
        <g data-out="fade s6-5~start-0.5 0.3" style="color:var(--stop)"><svg x="514" y="290" width="40" height="40"><use href="#i-x"/></svg></g>
        <g data-in="pop s6-6~test+1.0" style="color:var(--go)"><svg x="514" y="290" width="40" height="40"><use href="#i-check"/></svg></g>
        <rect x="400" y="470" width="96" height="54" rx="10" fill="var(--go)"/><text x="448" y="505" text-anchor="middle" font-size="20" font-weight="800" fill="#fff">START</text>
        <g data-in="down s6-5~start 0.4" data-out="fade s6-5~start+1.2 0.3" style="color:var(--ink)"><svg x="414" y="396" width="64" height="72"><use href="#i-point"/></svg></g>
        <g data-in="down s6-6~test+0.3 0.4" data-out="fade s6-6~test+1.5 0.3" style="color:var(--ink)"><svg x="414" y="396" width="64" height="72"><use href="#i-point"/></svg></g>
        <path d="M530 470 H1070" stroke="var(--steel)" stroke-width="10"/><text x="1060" y="450" text-anchor="end" font-size="20" font-weight="800" fill="var(--muted)">AIR</text>
        <path d="M740 452 L770 470 L740 488 Z M800 452 L770 470 L800 488 Z" fill="var(--panel)" stroke="var(--steel)" stroke-width="4"/>
        <rect x="600" y="250" width="90" height="130" rx="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
        <text x="645" y="240" text-anchor="middle" font-size="18" font-weight="800" fill="var(--muted)">DISCONNECT</text>
        <g data-out="fade s6-5~lock 0.3"><rect x="622" y="288" width="46" height="46" rx="6" fill="none" stroke="var(--dim)" stroke-width="3" stroke-dasharray="5 4"/><path d="M634 300 l22 22 M656 300 l-22 22" stroke="var(--stop)" stroke-width="4"/></g>
        ${lockIcon(617, 280, 'data-in="pop s6-5~lock 0.4" data-out="up s6-6~remove 0.4"')}
        ${lockIcon(742, 380, 'data-in="pop s6-5~lock+0.3 0.4" data-out="up s6-6~remove 0.4"')}
        <rect x="820" y="540" width="200" height="22" rx="6" fill="var(--panel2)" stroke="var(--steel)" stroke-width="4"/>
        <text x="920" y="590" text-anchor="middle" font-size="18" font-weight="800" fill="var(--muted)">TOOLING TRAY</text>
        <g data-out="fade s6-5~start+1.5 0.6">${[0, 1, 2, 3].map(i => `<rect x="${850 + i * 40}" y="500" width="12" height="40" rx="3" fill="var(--steel)"/>`).join('')}</g>
      `)}
      ${A(20, 10, `<div class="note">Last shift: tooling change started</div>`, 'data-in="down s6-2~note 0.5" data-out="fade s6-4 0.4"')}
      ${A(560, 10, `<div class="card" style="padding:16px 22px;display:flex;align-items:center;gap:14px">${I('phone', '', 'width:44px;height:44px;color:var(--q1)')}${people('Your lead', '')}<span class="muted" style="font-size:22px;font-weight:650">checks with<br>the last shift</span></div>`, 'data-in="fade s6-4~call 0.4" data-out="fade s6-5 0.4"')}
      ${A(700, 300, lab('Your lock · authorized', '', 'font-size:21px'), 'data-in="up s6-5~lock+0.4" data-out="fade s6-6~remove 0.3"')}
      ${A(700, 350, check('Air bled to 0', '', 'var(--go)'), 'data-in="pop s6-5~lock+1.0" data-out="fade s6-6~remove 0.3"')}
      ${A(560, 490, check('Nothing moves'), 'data-in="pop s6-5~start+0.35" data-out="fade s6-5~count 0.3"')}
      ${A(240, 116, lab('Guard shut for the test', '', 'font-size:21px'), 'data-in="up s6-5~start-0.4" data-out="fade s6-5~start+1.5 0.3"')}
      ${A(860, 494, check('Counted', '', 'var(--go)'), 'data-in="pop s6-5~count+0.7"')}
      ${A(20, 196, lab('Guard closed', ''), 'data-in="up s6-5~close+0.3" data-out="fade s6-6 0.3"')}
      <div class="abs" style="left:770px;top:10px;display:flex;flex-direction:column;gap:6px">
        ${[['Tools off', 's6-6+0.05'], ['Area clear', 's6-6+0.3'], ['Lock off', 's6-6~remove+0.3'], ['Team told', 's6-6~remove+0.6'], ['Interlock tested', 's6-6~test+1.0'], ['Start-up checks', 's6-6~go-0.45']].map(([t, r]) => check(t, `data-in="pop ${r} 0.3"`)).join('')}
      </div>
      <div class="abs" style="left:0;top:0" data-out="fade s6-4 0.3">${ring(250, 335, 170, 's6-3~guard')}</div>
    `)}
    ${SC.casecard({ catch: 'Guard off · tooling half in · no lock', catchAt: 's6-3~tooling', call: 'stop', callAt: 's6-4', goAt: 's6-6~go-0.3', prev: 'No start with tooling half in', prevAt: 's6-7' })}
  `));

  // 7 ─ Save 2 · Powder charge into an inerted reactor ──────────────────────
  html.push(SC.scene('save-2-powder-charge', '', `
    ${SC.sting()}
    ${SC.topband(2, 'Powder charge', 'Before you start', 'pause', ['', 's7-2 s7-3', 's7-3 s7-5'])}
    ${stage(`
      ${svg(`${floor}
        <path d="M120 270 Q120 230 160 230 H380 Q420 230 420 270 V520 Q420 560 380 560 H160 Q120 560 120 520 Z" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
        <rect x="124" y="430" width="292" height="126" rx="30" fill="color-mix(in srgb, var(--n2) 18%, var(--panel))"/>
        <text x="270" y="500" text-anchor="middle" font-size="22" font-weight="800" fill="var(--n2)">FLAMMABLE SOLVENT</text>
        <path d="M232 230 L200 120 H340 L308 230" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5" stroke-linejoin="round"/>
        <text x="270" y="400" text-anchor="middle" font-size="22" font-weight="800" fill="var(--muted)">REACTOR</text>
        <path d="M170 560 v40 M370 560 v40" stroke="var(--steel)" stroke-width="7" stroke-linecap="round"/>
        <rect x="150" y="262" width="150" height="50" rx="8" fill="#0b1420"/><text x="225" y="295" text-anchor="middle" font-size="19" font-weight="800" fill="#43d17e">O₂ &lt; LIMIT</text>
        <text x="350" y="160" font-size="20" font-weight="800" fill="var(--muted)">MANWAY</text>
        <g data-in="fade s7-2~vapor 0.6" data-out="fade s7-3 0.4" fill="none" stroke="var(--muted)" stroke-width="4" stroke-linecap="round" opacity=".7">${[230, 270, 310].map(x => `<path d="M${x} 110 q12 -16 0 -32 q-12 -16 0 -32"/>`).join('')}</g>
        <g data-in="pop s7-2~static 0.4" data-out="fade s7-3 0.4" style="color:var(--fix)" opacity=".75"><svg x="330" y="40" width="60" height="60"><use href="#i-bolt"/></svg></g>
        <g data-in="pop s7-6 0.4" style="color:var(--fix)" opacity=".7"><svg x="330" y="40" width="60" height="60"><use href="#i-bolt"/></svg></g>
        <g data-in="pop s7-6 0.4" style="color:var(--dim)"><svg x="322" y="32" width="76" height="76"><use href="#i-x"/></svg></g>
        <path d="M600 250 V600 M840 250 V600 M600 250 H840" stroke="var(--steel)" stroke-width="7" stroke-linecap="round" opacity=".6"/>
        <rect x="640" y="300" width="160" height="260" rx="14" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
        <path d="M640 360 H800 M640 500 H800" stroke="var(--steel)" stroke-width="4"/>
        <ellipse cx="720" cy="300" rx="80" ry="14" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/>
        <path d="M640 300 q20 26 40 6 q20 -20 40 4 q20 24 40 0 q20 -18 40 0" fill="none" stroke="#c9b98a" stroke-width="5"/>
        <text x="720" y="440" text-anchor="middle" font-size="22" font-weight="800" fill="var(--muted)">POWDER</text>
        <rect x="880" y="420" width="96" height="110" rx="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
        <circle id="s7-earth" cx="928" cy="458" r="20" fill="#cf3434"/><text id="s7-glyph" x="928" y="466" text-anchor="middle" font-size="24" font-weight="900" fill="#fff">✕</text><text id="s7-earthtxt" x="928" y="510" text-anchor="middle" font-size="16" font-weight="800" fill="var(--muted)">NO EARTH</text>
        <g data-out="fade s7-4~clip 0.3"><path d="M880 480 C 860 560, 870 590, 900 596" fill="none" stroke="#2f9e5a" stroke-width="6" stroke-linecap="round"/><rect x="896" y="584" width="26" height="16" rx="3" fill="#2f9e5a"/></g>
        <g data-in="fade s7-4~clip 0.3"><path d="M880 470 C 850 420, 830 330, 806 316" fill="none" stroke="#2f9e5a" stroke-width="6" stroke-linecap="round"/><rect x="794" y="304" width="22" height="26" rx="3" fill="#2f9e5a"/></g>
        <g data-in="pop s7-3~oxygen 0.3" data-out="fade s7-3~earth 0.3" style="color:var(--ink)"><svg x="300" y="240" width="90" height="90"><use href="#i-mag"/></svg></g>
        <g data-in="pop s7-3~earth 0.3" data-out="fade s7-4 0.3" style="color:var(--ink)"><svg x="960" y="380" width="90" height="90"><use href="#i-mag"/></svg></g>
      `)}
      ${A(150, 322, `<span class="tag ok" style="font-size:22px">N₂ inerted ✓</span>`, 'data-in="up ^1.6"')}
      ${A(0, 164, `<span class="tag ok" style="font-size:22px">O₂ below limit ✓</span>`, 'data-in="up s7-3~oxygen+0.3"')}
      ${A(440, 50, lab('Static', ''), 'data-in="up s7-2~static+0.2" data-out="fade s7-3 0.3"')}
      ${A(620, 200, `<span class="tag ok">Specified liner ✓</span>`, 'data-in="up s7-5~specified"')}
      ${A(860, 250, lab('Trained · in procedure', '', 'font-size:20px'), 'data-in="up s7-4~clip+0.3"')}
      <div class="abs" style="left:0;top:0" data-out="fade s7-4~clip 0.3">${ring(905, 590, 150, 's7-3~red')}</div>
    `)}
    ${SC.casecard({ catch: 'Clamp off, no earth', catchAt: 's7-3~red', call: 'fix', callAt: 's7-4', goAt: 's7-5~go', prev: 'No spark at the manway', prevAt: 's7-6' })}
  `));

  // 8 ─ Save 3 · Opening an inerted filter dryer between campaigns ──────────
  html.push(SC.scene('save-3-inerted-vessel', '', `
    ${SC.sting()}
    ${SC.topband(3, 'Inerted vessel', 'Change', 'gear', ['', 's8-2 s8-3', 's8-3 s8-6'], 'Campaign')}
    ${stage(`
      ${SC.tankBox('c3v', 30, 80, 0.7, `
        <path d="M300 520 H640" stroke="var(--steel)" stroke-width="5" stroke-dasharray="14 8"/>
        <rect id="c3v-air" x="292" y="162" width="356" height="390" rx="8" fill="#eaf3fb" opacity="0"/>
        <text x="470" y="590" text-anchor="middle" font-size="18" font-weight="800" fill="var(--muted)">FILTER DRYER · N₂</text>
        <text x="470" y="300" text-anchor="middle" font-size="64" font-weight="850" fill="#d6e6ff" stroke="#0b1420" stroke-width="3" paint-order="stroke" data-in="fade s8-2 0.6" data-out="fade s8-6~ventilate+0.6 1.0">N₂</text>
        <g data-in="fade s8-6~isolate 0.4"><path d="M700 90 H620 V150" fill="none" stroke="#b7c3d0" stroke-width="13" stroke-linejoin="round"/><circle cx="720" cy="90" r="15" fill="var(--stop)"/><rect x="714" y="60" width="12" height="60" rx="4" fill="var(--stop)"/></g>
        <g id="c3v-person">${P(110, 620, 330)}</g>
        <path d="M380 70 H560" stroke="var(--stop)" stroke-width="10" stroke-linecap="round" data-in="grow s8-5 0.4" data-out="fade s8-6~permit 0.3"/>
        <path d="M380 60 v20 M560 60 v20" stroke="var(--stop)" stroke-width="8" stroke-linecap="round" data-in="fade s8-5 0.4" data-out="fade s8-6~permit 0.3"/>
      `, { tank: { closed: true, liquidTop: 562 } })}
      ${A(250, 310, `<span class="tag" style="color:var(--n2)">Low O₂ ↓</span>`, 'data-in="up s8-2~low" data-out="fade s8-6~ventilate 0.5"')}
      ${A(230, 310, `<span class="tag ok">O₂ 20.9% ✓</span>`, 'data-in="up s8-6~retest+1.3"')}
      ${A(470, 70, `<div style="display:flex;gap:10px;align-items:center"><div style="color:var(--stop)">${I('lock', '', 'width:44px;height:44px')}</div><span class="tag grey" style="font-size:20px">Blind in</span></div>`, 'data-in="pop s8-6~isolate 0.4"')}
      ${A(330, 20, I('breath', '', 'width:64px;height:64px;color:var(--q3)'), 'data-in="pop s8-6~ventilate 0.4"')}
      ${A(40, 590, `<div style="display:flex;gap:28px">${people('Your lead', 'data-in="up s8-5+0.4"')}${people('Authorized team', 'data-in="up s8-6"')}</div>`)}
      <div class="abs" style="left:700px;top:20px;width:380px" data-in="fade s8-2~color 0.4" data-out="fade s8-3 0.3">
        <div style="display:flex;gap:30px;color:var(--muted)">${['eye', 'nose'].map(ic => `<div style="position:relative">${I(ic, '', 'width:90px;height:90px')}<div class="abs" style="left:-4px;top:41px;width:98px;height:6px;background:var(--dim);transform:rotate(-35deg);border-radius:3px"></div></div>`).join('')}</div>
        <div class="h4" style="margin-top:18px">Low O₂<br>No color · No smell</div></div>
      <div class="abs" style="left:700px;top:20px;width:380px;display:flex;flex-direction:column;gap:20px" data-out="fade s8-6 0.3">
        ${[['lock', 'Positively isolated?', 's8-3~isolated'], ['meter', 'Air tested at opening?', 's8-3~tested'], ['form', 'Permit?', 's8-4~permit']].map(([ic, t, r]) => `<div data-in="up ${r}"><div style="display:flex;gap:14px;align-items:center;font-size:28px;font-weight:750">${I(ic, '', 'width:44px;height:44px;color:var(--muted)')}${t}</div>
          <div style="margin:6px 0 0 58px" data-in="pop s8-4+${r.endsWith('permit') ? '0.5' : r.endsWith('tested') ? '0.25' : '0'} 0.3"><span class="tag hz" style="font-size:20px">Not yet</span></div></div>`).join('')}
      </div>
      <div class="abs" style="left:700px;top:0;width:380px" data-in="fade s8-6~test 0.4" data-out="fade s8-6~retest 0.3">
        <div style="display:flex;gap:12px;align-items:center">${I('meter', '', 'width:60px;height:60px;color:var(--ink)')}<span class="tag grey" style="font-size:20px">Bump-tested</span></div>
        <div style="margin-top:14px">${check('Solvent vapor')}</div>
        <div style="margin-top:8px;display:flex;gap:12px;align-items:center;font-size:28px;font-weight:750;color:var(--stop)">${I('x', '', 'width:34px;height:34px')}O₂ low</div></div>
      <div class="abs" style="left:690px;top:0;width:390px" data-in="fade s8-6~retest 0.4" data-out="fade s8-7 0.4">
        ${ART.gauge('g3', { width: 360, height: 257 })}
        <div class="small" style="font-weight:700;color:var(--ink)">O₂ 19.5–23.5% · Vapor ✓</div></div>
      <div class="abs" style="left:700px;top:330px;display:flex;flex-direction:column;gap:6px">
        ${check('Permit issued', 'data-in="pop s8-6~permit+0.2"')}
        <div data-in="fade s8-6~go+0.2"><span class="tag grey" style="font-size:20px">Under permit</span></div></div>
      <div class="abs" style="left:700px;top:20px;width:380px" data-in="fade s8-7 0.4">
        <div style="display:flex;align-items:center;gap:16px">${ART.stopwatch('sw8', { size: 120 })}<span style="font-size:60px;font-weight:850;color:var(--amber-text)">+</span>${I('form', '', 'width:100px;height:100px;color:var(--go)')}</div>
        <div class="h3" style="margin-top:12px">No permit, no Go</div></div>
      <div class="abs" style="left:0;top:0" data-out="fade s8-5~help 0.3">${ring(359, 172, 160, 's8-4')}</div>
    `)}
    ${SC.casecard({ catch: 'No test, no permit', catchAt: 's8-4', call: 'stop', callAt: 's8-5', goAt: 's8-6~go-0.4', prev: 'Nobody leans into low O₂', prevAt: 's8-8' })}
  `));

  // 9 ─ Save 4 · Blister packer jam the tool can't reach ─────────────────────
  html.push(SC.scene('save-4-blister-jam', '', `
    ${SC.sting()}
    ${SC.topband(4, 'Blister packer', 'Interruption', 'phone', ['', '', 's9-2 s9-6'])}
    ${stage(`
      ${svg(`${floor}
        <g id="s9-person">${P(70, 600, 300)}</g>
        <rect x="150" y="170" width="470" height="330" rx="18" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
        <text x="385" y="210" text-anchor="middle" font-size="22" font-weight="800" fill="var(--muted)">BLISTER PACKER</text>
        <rect x="190" y="235" width="300" height="170" rx="10" fill="none" stroke="var(--steel)" stroke-width="5"/>
        <path d="M200 360 H480" stroke="var(--steel)" stroke-width="6"/>
        <g data-out="up s9-5~go 0.5"><path d="M380 360 l30 -40 l26 30 l24 -36" fill="none" stroke="var(--fix)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>
        <rect x="190" y="235" width="300" height="170" rx="10" fill="color-mix(in srgb, var(--n2) 14%, transparent)" stroke="var(--steel)" stroke-width="4"/>
        <circle id="s9-status" cx="560" cy="250" r="16" fill="var(--go)"/>
        <rect x="510" y="400" width="96" height="54" rx="10" fill="var(--go)"/><text x="558" y="435" text-anchor="middle" font-size="20" font-weight="800" fill="#fff">START</text>
        <g data-in="down s9-5~try 0.4" data-out="fade s9-6 0.3" style="color:var(--ink)"><svg x="524" y="326" width="64" height="72"><use href="#i-point"/></svg></g>
        <g data-in="left s9-1~jams 0.6" data-out="fade s9-3 0.4" style="color:var(--ink)"><svg x="200" y="390" width="70" height="70"><use href="#i-wrench"/></svg></g>
        <g data-in="pop s9-1~tool 0.4" data-out="fade s9-3 0.4" style="color:var(--dim)"><svg x="290" y="380" width="60" height="60"><use href="#i-x"/></svg></g>
        <rect x="680" y="200" width="96" height="130" rx="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
        <text x="728" y="190" text-anchor="middle" font-size="18" font-weight="800" fill="var(--muted)">DISCONNECT</text>
        <path d="M620 470 H1070" stroke="var(--steel)" stroke-width="10"/><text x="1070" y="512" text-anchor="end" font-size="20" font-weight="800" fill="var(--muted)">AIR IN</text>
        <path d="M950 452 L980 470 L950 488 Z M1010 452 L980 470 L1010 488 Z" fill="var(--panel)" stroke="var(--steel)" stroke-width="4"/>
        ${lockIcon(700, 228, 'data-in="pop s9-3~power-0.1 0.4"')}
        ${lockIcon(952, 380, 'data-in="pop s9-3~air-0.45 0.4"')}
        <path d="M700 470 V540" stroke="var(--steel)" stroke-width="8"/><path d="M684 540 h32" stroke="var(--steel)" stroke-width="8" stroke-linecap="round"/>
        <text x="700" y="580" text-anchor="middle" font-size="18" font-weight="800" fill="var(--muted)">BLEED</text>
        <g id="s9-puffs" fill="none" stroke="var(--muted)" stroke-width="4" stroke-linecap="round"></g>
        <g data-in="zoom s9-4~gauge 0.5"><path d="M860 470 V420" stroke="var(--steel)" stroke-width="8"/><circle cx="860" cy="360" r="62" fill="var(--panel)" stroke="var(--steel)" stroke-width="7"/>
          <text x="830" y="392" text-anchor="middle" font-size="20" font-weight="800" fill="var(--ink)">0</text>
          <line id="s9-needle" x1="860" y1="360" x2="860" y2="310" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/><circle cx="860" cy="360" r="8" fill="var(--ink)"/></g>
      `)}
      ${A(150, 100, `<div class="h3">Stopped ≠ isolated</div>`, 'data-in="up s9-2~stopped"')}
      ${A(200, 516, lab('Tool can’t reach the jam', ''), 'data-in="up s9-1~tool+0.2" data-out="fade s9-3 0.3"')}
      ${A(680, 110, lab('Power + air locked · authorized', '', 'font-size:21px'), 'data-in="up s9-3~power+0.2"')}
      ${A(900, 300, check('Zero'), 'data-in="pop s9-5~zero+0.4"')}
      ${A(300, 520, check('Nothing moves'), 'data-in="pop s9-5~nothing+0.2"')}
      <div class="abs" style="left:0;top:0" data-out="fade s9-5 0.3">${ring(860, 360, 140, 's9-4~trapped')}</div>
    `)}
    ${SC.casecard({ catch: 'Trapped air pressure', catchAt: 's9-4~trapped', call: 'fix', callAt: 's9-5', goAt: 's9-5~go-0.4', prev: 'Hands clear of stored energy', prevAt: 's9-6' })}
  `));

  // 10 ─ Save 5 · Potent API at an isolator, back from break ───────────────
  html.push(SC.scene('save-5-isolator', '', `
    ${SC.sting()}
    ${SC.topband(5, 'Potent API', 'After a break', 'clock', ['s10-2 s10-3', '', 's10-3 s10-5'])}
    ${stage(`
      ${A(20, 60, ART.isolator('iso5', { width: 760, height: 499 }))}
      ${svg(`${floor}
        <g transform="translate(20,60) scale(1.0857)">
          <rect x="300" y="200" width="70" height="80" rx="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="4"/><rect x="300" y="200" width="70" height="22" rx="6" fill="var(--steel)"/>
          <path d="M310 240 h50" stroke="#c9b98a" stroke-width="16"/>
          <path d="M455 150 l14 26" stroke="var(--stop)" stroke-width="6" stroke-linecap="round" data-in="fade s10-3~cut 0.3" data-out="fade s10-5 0.3"/>
          <g data-in="fade s10-5 0.5"><path d="M416 262 V170 Q416 140 434 140 H466 Q484 140 484 170 V262" fill="color-mix(in srgb, var(--q3) 30%, var(--panel))" stroke="var(--steel)" stroke-width="4"/>${[-24, -8, 8, 24].map(d => `<path d="M${450 + d} 142 V112" stroke="var(--steel)" stroke-width="12" stroke-linecap="round"/><path d="M${450 + d} 142 V112" stroke="color-mix(in srgb, var(--q3) 30%, var(--panel))" stroke-width="5" stroke-linecap="round"/>`).join('')}</g>
        </g>
        <g data-in="left ^1.3 0.6">${P(930, 600, 300)}</g>
      `)}
      ${A(20, 0, `<span class="tag" style="font-size:26px">Highly potent API</span>`, 'data-in="up s10-1~isolator"')}
      ${A(560, 0, `<span class="tag ok">In range ✓</span>`, 'data-in="up s10-2~range"')}
      ${A(200, 90, I('mag', '', 'width:90px;height:90px;color:var(--ink)'), 'data-in="pop s10-3~check 0.3" data-out="fade s10-3~glove+0.5 0.2"')}
      ${A(232, 92, I('check', '', 'width:50px;height:50px;color:var(--go)'), 'data-in="pop s10-3~glove+0.4 0.3"')}
      ${A(484, 92, I('check', '', 'width:50px;height:50px;color:var(--go)'), 'data-in="pop s10-5~leak+0.4 0.3"')}
      ${A(440, 90, I('mag', '', 'width:90px;height:90px;color:var(--ink)'), 'data-in="pop s10-3~glove+0.6 0.3" data-out="fade s10-4 0.3"')}
      ${A(452, 352, `<span class="tag hz" style="font-size:22px">Do not use</span>`, 'data-in="pop s10-4+0.2" data-out="fade s10-5 0.3"')}
      ${A(780, 10, `<div style="display:flex;flex-direction:column;gap:8px">${people('Your lead', 'data-in="up s10-4+0.4"')}
        ${check('Glove changed', 'data-in="pop s10-5+0.2"')}${check('Leak-tested', 'data-in="pop s10-5~leak+0.2"')}${check('Pressure in range', 'data-in="pop s10-5~go-0.6"')}${check('Reported', 'data-in="pop s10-6+0.3"')}</div>`)}
      <div class="abs" style="left:0;top:0" data-out="fade s10-4 0.3">${ring(518, 237, 130, 's10-3~cut')}</div>
    `)}
    ${SC.casecard({ catch: 'Cut in a glove', catchAt: 's10-3~cut', call: 'stop', callAt: 's10-4', goAt: 's10-5~go-0.4', prev: 'No exposure to the API', prevAt: 's10-6' })}
  `));

  // 11 ─ Save 6 · Breaking a line after CIP ─────────────────────────────────
  html.push(SC.scene('save-6-cip-line-break', '', `
    ${SC.sting()}
    ${SC.topband(6, 'Line break', 'Before you start', 'pause', ['', '', 's11-3~check s11-5', 's11-2 s11-3~check'])}
    ${stage(`
      ${svg(`${floor}
        <rect x="40" y="250" width="170" height="260" rx="36" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
        <text x="125" y="390" text-anchor="middle" font-size="20" font-weight="800" fill="var(--muted)">CIP TANK</text>
        <path d="M80 510 v90 M170 510 v90" stroke="var(--steel)" stroke-width="7"/>
        <path d="M210 470 H296" stroke="var(--steel)" stroke-width="12"/>
        <circle cx="340" cy="470" r="44" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/><path d="M324 448 L364 470 L324 492 Z" fill="var(--steel)"/>
        <text x="340" y="545" text-anchor="middle" font-size="18" font-weight="800" fill="var(--muted)">PUMP</text>
        <path d="M384 470 H430 V250 H620" fill="none" stroke="var(--steel)" stroke-width="12" stroke-linejoin="round"/>
        <path d="M486 232 L510 250 L486 268 Z M534 232 L510 250 L534 268 Z" fill="var(--panel)" stroke="var(--steel)" stroke-width="4"/>
        <rect x="620" y="170" width="150" height="300" rx="12" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
        <text x="695" y="500" text-anchor="middle" font-size="18" font-weight="800" fill="var(--muted)">TRANSFER PANEL</text>
        <g data-out="up s11-7~no 0.6"><path d="M650 250 H730 V340 H650" fill="none" stroke="var(--q1)" stroke-width="16" stroke-linejoin="round"/><text x="690" y="302" text-anchor="middle" font-size="16" font-weight="800" fill="var(--q1)">ELBOW</text></g>
        <path d="M580 250 V200" stroke="var(--steel)" stroke-width="7"/><circle cx="580" cy="160" r="40" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
        <line id="s11-needle" x1="580" y1="160" x2="606" y2="132" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><circle cx="580" cy="160" r="6" fill="var(--ink)"/>
        <text x="558" y="186" text-anchor="middle" font-size="16" font-weight="800" fill="var(--ink)">0</text>
        <g data-in="fade s11-4~hot 0.4"><rect x="372" y="150" width="22" height="80" rx="11" fill="none" stroke="var(--steel)" stroke-width="4"/><rect id="s11-temp" x="377" y="164" width="12" height="62" rx="6" fill="var(--stop)"/></g>
        <path d="M770 380 H820 V560" stroke="var(--steel)" stroke-width="8" fill="none"/><path d="M800 590 H840" stroke="var(--steel)" stroke-width="6"/>
        <text x="792" y="596" text-anchor="end" font-size="18" font-weight="800" fill="var(--muted)">DRAIN</text>
        <g id="s11-drops" fill="var(--q1)"></g>
        <path d="M738 300 Q 800 262 846 318" fill="none" stroke="var(--stop)" stroke-width="5" stroke-dasharray="10 10" data-in="fade s11-2~spray 0.5" data-out="fade s11-3~step 0.4"/>
        ${lockIcon(482, 160, 'data-in="pop s11-3~lock 0.4"')}
        ${lockIcon(312, 382, 'data-in="pop s11-3~pump 0.4"')}
        <g id="s11-person">${P(910, 600, 300)}<g data-in="fade s11-3~step+0.4 0.4"><rect x="884" y="316" width="52" height="58" rx="12" fill="rgba(160,205,240,.55)" stroke="var(--steel)" stroke-width="3"/><circle cx="858" cy="470" r="11" fill="var(--q3)"/><circle cx="962" cy="470" r="11" fill="var(--q3)"/></g></g>
        <rect x="60" y="80" width="250" height="80" rx="10" fill="#0b1420"/><text x="185" y="130" text-anchor="middle" font-size="24" font-weight="800" fill="#43d17e">CIP complete ✓</text>
      `)}
      ${A(830, 210, lab('Spray path?', '', 'color:var(--stop)'), 'data-in="up s11-2~spray+0.2" data-out="fade s11-3~step 0.3"')}
      ${A(240, 20, lab('Supply + pump locked · authorized', '', 'font-size:21px'), 'data-in="up s11-3~pump+0.4" data-out="fade s11-5 0.3"')}
      ${A(800, 100, `<span class="tag ok" style="font-size:21px">Line-break permit ✓</span>`, 'data-in="up s11-1~disconnect"')}
      ${A(800, 10, `<span class="tag grey" style="font-size:20px;display:block;line-height:1.35">Stand to the side<br>Face shield · Chem gloves</span>`, 'data-in="up s11-3~step+0.4" data-out="fade s11-6 0.3"')}
      ${A(240, 20, `<div style="display:flex;gap:10px;align-items:center">${I('clock', '', 'width:40px;height:40px;color:var(--ink)')}<span class="tag grey" style="font-size:20px">Wait · Vent · Zero &amp; cool</span></div>`, 'data-in="fade s11-5~wait 0.4" data-out="fade s11-6 0.3"')}
      ${A(440, 556, `<span class="tag ok" style="font-size:20px">Vent open · No flow</span>`, 'data-in="up s11-5~zero+0.4" data-out="fade s11-6 0.3"')}
      ${A(240, 20, `<div style="display:flex;gap:18px">${lab(`${I('form', '', 'width:30px;height:30px')} Screen: reports the cycle`, '')}${lab(`${I('meter', '', 'width:30px;height:30px')} Gauge: reports your line`, '')}</div>`, 'data-in="up s11-6"')}
      <div class="abs" style="left:0;top:0" data-out="fade s11-5 0.3">${ring(582, 158, 108, 's11-4~pressure')}</div>
    `)}
    ${SC.casecard({ catch: 'Pressure on gauge, line hot', catchAt: 's11-4~pressure', call: 'fix', callAt: 's11-5', goAt: 's11-5~go-0.4', prev: 'No hot caustic or steam', prevAt: 's11-7' })}
  `));
})();
