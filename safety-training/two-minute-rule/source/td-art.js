// Transdermal-line drawings for the four saves. Each returns SVG markup for the 1080 x 642 save stage (floor at y=600).
// `at` maps a part name to extra attributes (usually data-in / data-out timing) so the scene decides when parts change.
window.TD = (function () {
  const a = (at, k) => (at && at[k]) || '';
  const lbl = (x, y, t, size = 18, anchor = 'middle', fill = 'var(--muted)', halo = '') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="800" fill="${fill}"${halo ? ` stroke="${halo}" stroke-width="8" paint-order="stroke" stroke-linejoin="round"` : ''}>${t}</text>`;
  const floor = `<path d="M0 600 H1080" stroke="var(--line)" stroke-width="5"/>`;
  const WOOD = '#c99e6b';

  // Save 1: mix room. A solvent drum, an air drum pump in its holder, the hose to the adhesive mix tank, and the
  // bonding reel on the wall with its clamps. Parts: hookClamps (clamps hanging on the hook), drumClamp/pumpClamp
  // (clamps on bare metal), lampRed/lampGreen (bonding indicator), wand (pump wand in the drum), vapor, spark, sparkX.
  function mixRoom(at = {}) {
    const clamp = (x, y, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-12 -6 L12 -6 L16 6 L-16 6 Z" fill="#2f9e5a"/><path d="M-10 6 L-14 18 M10 6 L14 18" stroke="#2f9e5a" stroke-width="5" stroke-linecap="round"/></g>`;
    return `${floor}
      <!-- wall bonding reel and indicator -->
      <rect x="330" y="150" width="120" height="96" rx="12" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      ${lbl(390, 140, 'BONDING', 17)}
      <circle cx="372" cy="198" r="30" fill="none" stroke="#2f9e5a" stroke-width="7"/><circle cx="372" cy="198" r="8" fill="var(--steel)"/>
      <circle cx="424" cy="178" r="11" fill="#cf3434" ${a(at, 'lampRed')}/><circle cx="424" cy="178" r="11" fill="#2f9e5a" ${a(at, 'lampGreen')}/>
      <path d="M408 206 h32" stroke="var(--steel)" stroke-width="4"/>
      <path d="M336 246 V270 M444 246 V262" stroke="var(--steel)" stroke-width="5" stroke-linecap="round"/>
      <path d="M444 262 h18" stroke="var(--steel)" stroke-width="6" stroke-linecap="round"/><g ${a(at, 'hookLbl')}>${lbl(470, 266, 'HOOK', 16, 'start')}</g>
      <g ${a(at, 'hookClamps')}>
        <path d="M398 228 C 410 260, 440 270, 452 268" fill="none" stroke="#2f9e5a" stroke-width="5" stroke-linecap="round"/>
        <path d="M398 228 C 400 280, 440 296, 454 296" fill="none" stroke="#2f9e5a" stroke-width="5" stroke-linecap="round"/>
        ${clamp(456, 280, 0)}${clamp(458, 306, 0)}
      </g>
      <!-- solvent drum -->
      <g ${a(at, 'wand')}><rect x="225" y="150" width="24" height="380" rx="6" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/><rect x="219" y="120" width="36" height="40" rx="8" fill="var(--steel)"/>
        <path d="M237 120 C 237 80, 330 70, 420 84 S 530 110, 560 200" fill="none" stroke="var(--steel)" stroke-width="8" stroke-linecap="round"/>${lbl(212, 140, 'DRUM PUMP', 15, 'end')}</g>
      <rect x="80" y="330" width="190" height="270" rx="14" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <path d="M80 400 H270 M80 530 H270" stroke="var(--steel)" stroke-width="5"/>
      <rect x="84" y="430" width="134" height="70" fill="color-mix(in srgb, var(--fix) 20%, var(--panel))"/>
      ${lbl(150, 462, 'FLAMMABLE', 19, 'middle', 'var(--fix)')}${lbl(150, 488, 'SOLVENT', 19, 'middle', 'var(--fix)')}
      <ellipse cx="175" cy="330" rx="95" ry="14" fill="var(--panel2)" stroke="var(--steel)" stroke-width="6"/>
      <rect x="222" y="310" width="30" height="18" rx="4" fill="var(--steel)"/>
      <rect x="264" y="350" width="14" height="22" rx="3" fill="#b9c4d1" stroke="var(--steel)" stroke-width="2"/><g ${a(at, 'bareLbl')}>${lbl(286, 394, 'BARE METAL', 16, 'start')}</g>
      <!-- pump wand: in its holder at first, then in the drum -->
      <g ${a(at, 'wandHolder')}><rect x="20" y="210" width="16" height="390" rx="4" fill="var(--panel2)" stroke="var(--steel)" stroke-width="3"/>
        <rect x="40" y="170" width="24" height="380" rx="6" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/><rect x="34" y="140" width="36" height="40" rx="8" fill="var(--steel)"/>
        <path d="M52 140 C 52 90, 140 80, 300 92 S 520 110, 560 200" fill="none" stroke="var(--steel)" stroke-width="8" stroke-linecap="round"/>${lbl(130, 120, 'DRUM PUMP', 15, 'middle')}</g>
      <!-- adhesive mix tank -->
      <rect x="560" y="260" width="250" height="300" rx="26" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <rect x="640" y="196" width="90" height="64" rx="10" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/>
      <path d="M685 260 V470 M640 470 H730" stroke="var(--steel)" stroke-width="6" stroke-linecap="round"/>
      <path d="M560 200 V262" stroke="var(--steel)" stroke-width="8"/>
      ${lbl(685, 380, 'ADHESIVE', 20, 'middle', 'var(--muted)', 'var(--panel)')}${lbl(685, 406, 'MIX TANK', 20, 'middle', 'var(--muted)', 'var(--panel)')}
      <path d="M590 560 v40 M780 560 v40" stroke="var(--steel)" stroke-width="7" stroke-linecap="round"/>
      <path d="M810 540 H836 V578 M822 578 H850 M827 586 H845 M832 594 H840" stroke="var(--steel)" stroke-width="4" stroke-linecap="round" fill="none"/>${lbl(836, 624, 'GROUNDED', 15)}
      <!-- clamps on: drum chime and pump -->
      <g ${a(at, 'drumClamp')}><path d="M398 228 C 380 300, 320 340, 280 360" fill="none" stroke="#2f9e5a" stroke-width="5" stroke-linecap="round"/>${clamp(276, 362, 90)}</g>
      <g ${a(at, 'pumpClampH')}><path d="M398 228 C 300 170, 140 140, 70 150" fill="none" stroke="#2f9e5a" stroke-width="5" stroke-linecap="round"/>${clamp(66, 152, 90)}</g>
      <g ${a(at, 'pumpClamp')}><path d="M398 228 C 360 200, 300 190, 262 150" fill="none" stroke="#2f9e5a" stroke-width="5" stroke-linecap="round"/>${clamp(258, 146, 120)}</g>
      <!-- vapour and spark (what it could do) -->
      <g ${a(at, 'vapor')} fill="none" stroke="var(--muted)" stroke-width="4" stroke-linecap="round" opacity=".7">${[586, 608, 630].map(x => `<path d="M${x} 252 q10 -14 0 -28 q-10 -14 0 -28"/>`).join('')}</g>
      <g ${a(at, 'spark')} style="color:var(--fix);stroke-dasharray:7 6" opacity=".85"><svg x="584" y="128" width="54" height="54"><use href="#i-bolt"/></svg></g>
      <g ${a(at, 'sparkX')} style="color:var(--dim)"><svg x="574" y="118" width="74" height="74"><use href="#i-x"/></svg></g>`;
  }

  // A wooden pallet with two stretch-wrapped master rolls standing on end. (x, y) = pallet's bottom-left; 240 wide.
  function rollsPallet(x, y, label = true) {
    const roll = (rx) => `<rect x="${rx}" y="${y - 160}" width="100" height="140" rx="6" fill="var(--panel2)" stroke="var(--steel)" stroke-width="4"/>
      <path d="M${rx + 4} ${y - 120} L${rx + 96} ${y - 140} M${rx + 4} ${y - 80} L${rx + 96} ${y - 100} M${rx + 4} ${y - 40} L${rx + 96} ${y - 60}" stroke="color-mix(in srgb, var(--steel) 22%, transparent)" stroke-width="3"/>
      <ellipse cx="${rx + 50}" cy="${y - 160}" rx="50" ry="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="4"/><ellipse cx="${rx + 50}" cy="${y - 160}" rx="12" ry="3.5" fill="var(--steel)"/>`;
    return `<g>${roll(x + 12)}${roll(x + 126)}
      <rect x="${x}" y="${y - 20}" width="240" height="8" rx="2" fill="${WOOD}" stroke="#7a5534" stroke-width="2"/>
      ${[0, 108, 216].map(d => `<rect x="${x + d}" y="${y - 12}" width="24" height="12" fill="${WOOD}" stroke="#7a5534" stroke-width="2"/>`).join('')}
      ${label ? lbl(x + 120, y - 82, 'BACKING FILM', 18, 'middle', 'var(--muted)', 'var(--panel2)') : ''}</g>`;
  }
  // A walk-behind powered pallet truck, forks pointing left. x0 = fork tip, floor at y=600.
  function palletTruck(x0, at = {}) {
    return `<g ${a(at, 'truck')}>
      <path d="M${x0} 590 Q${x0} 584 ${x0 + 8} 584 H${x0 + 116} V598 H${x0 + 6} Q${x0} 598 ${x0} 592 Z" fill="var(--steel)"/>
      <circle cx="${x0 + 22}" cy="596" r="5" fill="var(--panel)" stroke="var(--steel)" stroke-width="2"/>
      <rect x="${x0 + 110}" y="500" width="66" height="96" rx="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      <rect x="${x0 + 110}" y="500" width="66" height="16" rx="6" fill="var(--steel)"/>
      <circle cx="${x0 + 150}" cy="590" r="12" fill="var(--steel)"/>
      <path d="M${x0 + 168} 508 L${x0 + 196} 470" stroke="var(--steel)" stroke-width="8" stroke-linecap="round"/>
      <path d="M${x0 + 188} 466 H${x0 + 208}" stroke="var(--steel)" stroke-width="9" stroke-linecap="round"/>
      ${a(at, 'yours') === 'none' ? '' : `<g ${a(at, 'yours')}><rect x="${x0 + 116}" y="530" width="54" height="24" rx="12" fill="var(--q3)"/><text x="${x0 + 143}" y="547" text-anchor="middle" font-size="13" font-weight="900" fill="#fff">YOURS</text></g>`}
      ${a(at, 'label') === 'none' ? '' : lbl(x0 + 96, 626, 'PALLET TRUCK', 16)}</g>`;
  }
  // A sit-down counterbalance forklift facing left, parked: mast down, forks flat on the floor (tips at x=300).
  // Parts: driver (trained driver seated, lap belt on).
  function forklift(at = {}) {
    return `<g ${a(at, 'forklift')}>
      <rect x="490" y="404" width="16" height="66" rx="6" fill="var(--steel)"/>
      <g ${a(at, 'driver')}>${ART.person(520, 572, 200, { vest: '#7f95ad' })}<path d="M498 472 L542 476" stroke="#e07a00" stroke-width="7" stroke-linecap="round"/></g>
      <path d="M300 594 H362" stroke="var(--steel)" stroke-width="9" stroke-linecap="round"/>
      <rect x="352" y="516" width="14" height="82" rx="3" fill="var(--steel)"/>
      <rect x="366" y="280" width="20" height="316" rx="4" fill="var(--panel2)" stroke="var(--steel)" stroke-width="4"/>
      <path d="M402 330 H592 M404 330 V486 M588 330 V486" stroke="var(--steel)" stroke-width="8" stroke-linecap="round"/>
      <path d="M392 494 Q392 482 404 482 H612 Q626 482 626 496 V566 Q626 580 612 580 H404 Q392 580 392 566 Z" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      <path d="M546 482 V580" stroke="var(--steel)" stroke-width="3"/>
      <path d="M432 482 L452 446" stroke="var(--steel)" stroke-width="6" stroke-linecap="round"/><ellipse cx="454" cy="444" rx="16" ry="5" fill="none" stroke="var(--steel)" stroke-width="5"/>
      <circle cx="432" cy="574" r="27" fill="var(--steel)"/><circle cx="432" cy="574" r="9" fill="var(--panel)"/>
      <circle cx="580" cy="578" r="22" fill="var(--steel)"/><circle cx="580" cy="578" r="7" fill="var(--panel)"/>
      ${lbl(470, 536, 'FORKLIFT', 22)}</g>`;
  }
  // Save 2: roll staging on the warehouse side of the line's material airlock. A pallet rack (pallet of backing-film
  // rolls on the top beam), the empty NEXT ROLL spot, a parked forklift, your pallet truck, the airlock door.
  // Parts: palletHigh / palletLow (the pallet up on the beam, or down in the NEXT ROLL spot), spot, forklift, driver,
  // truck, yours, door.
  function staging(at = {}) {
    return `${floor}
      <!-- airlock door (background) -->
      <g ${a(at, 'door')}><rect x="984" y="262" width="92" height="338" rx="4" fill="color-mix(in srgb, var(--panel2) 60%, transparent)" stroke="var(--line)" stroke-width="4"/>
        <rect x="1004" y="352" width="52" height="40" rx="4" fill="none" stroke="var(--line)" stroke-width="4"/>
        <g ${a(at, 'doorSign')}>${lbl(1030, 292, 'MATERIAL', 13, 'middle', 'var(--dim)')}${lbl(1030, 310, 'AIRLOCK', 13, 'middle', 'var(--dim)')}${lbl(1030, 336, 'TO LINE →', 13, 'middle', 'var(--dim)')}</g></g>
      <!-- pallet rack: two uprights and a beam -->
      ${[36, 306].map(x => `<rect x="${x}" y="110" width="14" height="490" fill="var(--panel)" stroke="var(--steel)" stroke-width="4"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<rect x="${x + 5}" y="${130 + i * 38}" width="4" height="10" fill="var(--steel)"/>`).join('')}`).join('')}
      <rect x="36" y="300" width="284" height="16" rx="2" fill="#c98a5c" stroke="#8a5530" stroke-width="3"/>
      <rect x="36" y="110" width="284" height="10" rx="2" fill="#c98a5c" stroke="#8a5530" stroke-width="3"/>
      <!-- the line's NEXT ROLL floor spot -->
      <g ${a(at, 'spot')}><rect x="60" y="586" width="240" height="14" fill="none" stroke="var(--dim)" stroke-width="3" stroke-dasharray="10 7"/>${lbl(180, 574, 'NEXT ROLL', 14, 'middle', 'var(--dim)')}</g>
      <g ${a(at, 'palletHigh')}>${rollsPallet(60, 300)}</g>
      <g ${a(at, 'palletLow')}>${rollsPallet(60, 600)}</g>
      ${forklift(at)}`;
  }
  // "Trained on" close-up of your lanyard card: pallet truck ticked, forklift box empty. 240 x 240.
  function cardInset(at = {}) {
    return `<svg viewBox="0 0 240 240" width="240" height="240" overflow="visible">
      <circle cx="120" cy="120" r="116" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      <rect x="40" y="34" width="160" height="10" rx="5" fill="var(--q3)"/>
      <text x="120" y="76" text-anchor="middle" font-size="17" font-weight="900" letter-spacing="1.5" fill="var(--muted)">TRAINED ON</text>
      <text x="30" y="120" font-size="25" font-weight="800" fill="var(--ink)">Pallet truck</text>
      <path d="M182 108 l9 9 l18 -20" fill="none" stroke="var(--go)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="30" y="168" font-size="25" font-weight="800" fill="var(--ink)">Forklift</text>
      <rect x="172" y="140" width="38" height="38" rx="5" fill="var(--panel)" stroke="var(--ink)" stroke-width="4"/>
      <path d="M62 200 H132 M144 200 H178 M84 214 H156" stroke="var(--line)" stroke-width="4" stroke-linecap="round"/></svg>`;
  }
  // "Before your break": the same rack bay a few minutes ago, with the pallet on the floor in the NEXT ROLL spot. 220 x 150.
  function beforeBreak(w = 170) {
    return `<svg viewBox="0 0 360 330" width="${w}" height="${Math.round(w * 330 / 360)}" overflow="visible">
      <path d="M0 320 H360" stroke="var(--line)" stroke-width="6"/>
      ${[36, 306].map(x => `<rect x="${x}" y="40" width="14" height="280" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>`).join('')}
      <rect x="36" y="130" width="284" height="16" rx="2" fill="#c98a5c" stroke="#8a5530" stroke-width="3"/>
      ${rollsPallet(60, 320, false)}</svg>`;
  }
  // Routine Go: a laminate roll held by its core on a roll lifter, the aisle to the slitter unwind, and your pallet truck
  // parked against the wall. 760 x 600 box, floor at y=600. Parts: lifter (the lifter + roll group), lifterLabel.
  function rollRoom(at = {}) {
    return `<path d="M0 600 H760" stroke="var(--line)" stroke-width="5"/>
      <path d="M300 606 H740" stroke="#e5b800" stroke-width="7" stroke-dasharray="40 18" ${a(at, 'aisle')}/>
      <!-- slitter unwind stand (outline) -->
      <path d="M612 600 L664 396 L716 600" fill="none" stroke="var(--steel)" stroke-width="7" stroke-linejoin="round" opacity=".6"/><circle cx="664" cy="396" r="12" fill="var(--steel)" opacity=".6"/>
      ${lbl(664, 372, 'SLITTER UNWIND', 15, 'middle', 'var(--dim)')}
      <g ${a(at, 'lifter')}>
        <rect x="150" y="588" width="190" height="10" rx="4" fill="var(--steel)"/><circle cx="160" cy="600" r="8" fill="var(--steel)"/><circle cx="330" cy="600" r="8" fill="var(--steel)"/>
        <rect x="204" y="250" width="22" height="342" rx="4" fill="var(--panel2)" stroke="var(--steel)" stroke-width="4"/>
        <path d="M206 472 H164" stroke="var(--steel)" stroke-width="9" stroke-linecap="round"/>
        <g ${a(at, 'roll')}><rect x="222" y="404" width="96" height="16" rx="4" fill="var(--steel)"/>
          <circle cx="330" cy="412" r="96" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/><circle cx="330" cy="412" r="72" fill="none" stroke="color-mix(in srgb, var(--steel) 20%, transparent)" stroke-width="3"/>
          <circle cx="330" cy="412" r="24" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/><path d="M318 404 H342 M318 420 H342" stroke="var(--steel)" stroke-width="5"/>
          ${lbl(330, 476, 'LAMINATE', 17, 'middle', 'var(--muted)', 'var(--panel2)')}</g>
      </g>`;
  }

  // Save 3: the rotary die cutter at handover. The die station with its guard off and leaning on the frame, the
  // power switch with someone else's lock, and a "ready to run" note. Parts: guardOff / guardOn, lock, note, matrix.
  function dieCutter(at = {}) {
    return `${floor}
      <path d="M0 360 H636" stroke="var(--q3)" stroke-width="4"/>${lbl(14, 350, 'LAMINATE', 14, 'start')}
      <rect x="250" y="170" width="330" height="430" rx="16" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      ${lbl(415, 160, 'DIE STATION', 18)}
      <circle cx="415" cy="300" r="58" fill="var(--panel2)" stroke="var(--steel)" stroke-width="6"/>
      ${Array.from({ length: 10 }, (_, i) => { const ang = i * Math.PI / 5; return `<rect x="${(415 + 58 * Math.cos(ang) - 6).toFixed(1)}" y="${(300 + 58 * Math.sin(ang) - 6).toFixed(1)}" width="12" height="12" rx="2" fill="var(--steel)" transform="rotate(${(ang * 180 / Math.PI).toFixed(1)} ${(415 + 58 * Math.cos(ang)).toFixed(1)} ${(300 + 58 * Math.sin(ang)).toFixed(1)})"/>`; }).join('')}
      <circle cx="415" cy="420" r="58" fill="var(--panel2)" stroke="var(--steel)" stroke-width="6"/>
      ${lbl(415, 306, 'DIE', 16)}${lbl(415, 426, 'ANVIL', 16)}
      <circle cx="530" cy="232" r="30" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/><path d="M455 300 Q500 260 512 252" fill="none" stroke="var(--q3)" stroke-width="3" stroke-dasharray="6 5"/>
      ${lbl(530, 196, 'WASTE', 12)}
      <!-- the guard: off and leaning at first, back on later -->
      <g ${a(at, 'guardOff')}><path d="M150 600 L196 300 L250 306 L214 600 Z" fill="color-mix(in srgb, var(--n2) 18%, transparent)" stroke="var(--steel)" stroke-width="4"/>${lbl(186, 620, 'GUARD', 14)}</g>
      <rect x="262" y="210" width="306" height="300" rx="12" fill="color-mix(in srgb, var(--n2) 18%, transparent)" stroke="var(--steel)" stroke-width="4" ${a(at, 'guardOn')}/>
      <!-- power switch (disconnect) with someone else's lock -->
      <rect x="660" y="240" width="96" height="140" rx="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      ${lbl(708, 230, 'POWER SWITCH', 15)}
      <rect x="696" y="270" width="24" height="64" rx="6" fill="var(--steel)"/>
      <g ${a(at, 'lock')} style="color:var(--stop)"><svg x="680" y="318" width="56" height="56"><use href="#i-lock"/></svg><path d="M708 372 V382" stroke="var(--steel)" stroke-width="2"/><rect x="676" y="382" width="66" height="56" rx="5" fill="#ffd34d" stroke="#9a7400" stroke-width="2"/><circle cx="709" cy="390" r="3.5" fill="var(--panel)"/><text x="709" y="406" text-anchor="middle" font-size="13" font-weight="900" fill="#3d2d00">DO NOT</text><text x="709" y="420" text-anchor="middle" font-size="12" font-weight="900" fill="#3d2d00">OPERATE</text><path d="M686 431 q5 -7 9 0 t9 0 t9 -2 t9 2 t9 0" fill="none" stroke="#3d2d00" stroke-width="2" stroke-linecap="round"/></g>
      <rect x="600" y="440" width="150" height="150" rx="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      <rect x="616" y="456" width="118" height="66" rx="6" fill="#0b1420"/><text x="675" y="496" text-anchor="middle" font-size="16" font-weight="800" fill="#43d17e">STOPPED</text>
      <g ${a(at, 'note')}><g transform="rotate(-3 675 556)"><rect x="606" y="526" width="138" height="62" rx="4" fill="#fff4b8" stroke="#b39500" stroke-width="2"/><text x="675" y="550" text-anchor="middle" font-size="15" font-weight="800" fill="#4a3c00">Die change done.</text><text x="675" y="574" text-anchor="middle" font-size="15" font-weight="800" fill="#4a3c00">Ready to run ✓</text></g></g>`;
  }

  // Save 4: slitting at a product change. The slitter (unwind, knives, rewinds), the PPE board by the door, the gowning
  // point with a sink, and the potent trim-waste bin. Parts: prodA / prodB (the roll's product label), boardNew (the
  // NEW tags that pulse on "board").
  function slitter(at = {}) {
    const row = (y, icon, t, isNew, crossed) => `<g ${crossed ? 'opacity=".45"' : ''}>${icon}<text x="98" y="${y + 6}" font-size="16" font-weight="800" fill="var(--ink)">${t}</text>
      ${crossed ? `<path d="M44 ${y + 1} H236" stroke="var(--stop)" stroke-width="3"/>` : ''}
      ${isNew ? `<g ${a(at, 'boardNew')}><rect x="198" y="${y - 32}" width="52" height="22" rx="11" fill="var(--q2)"/><text x="224" y="${y - 16}" text-anchor="middle" font-size="14" font-weight="900" fill="#fff">NEW</text></g>` : ''}</g>`;
    const glove = (x, y, col = 'var(--q3)') => `<path d="M${x} ${y + 16} v-22 q0 -5 5 -5 q5 0 5 5 v-5 q0 -5 5 -5 q5 0 5 5 v3 q0 -5 5 -5 q5 0 5 5 v24 q0 9 -10 9 h-10 q-10 0 -10 -9 z" fill="${col}"/>`;
    const board = `<rect x="30" y="110" width="232" height="280" rx="14" fill="var(--panel)" stroke="var(--q2)" stroke-width="5"/>
      <rect x="30" y="110" width="232" height="46" rx="14" fill="var(--q2)"/><rect x="30" y="140" width="232" height="16" fill="var(--q2)"/>
      <text x="146" y="140" text-anchor="middle" font-size="16" font-weight="900" fill="#fff">NOW: POTENT PRODUCT</text>
      ${row(194, `<path d="M52 176 h28 l6 30 h-40 z" fill="#eef3f8" stroke="var(--steel)" stroke-width="3"/>`, 'Coat', false)}
      ${row(250, `${glove(46, 242)}${glove(64, 246, 'var(--q1)')}`, 'Double gloves', true)}
      ${row(306, `<rect x="48" y="290" width="40" height="22" rx="7" fill="color-mix(in srgb, var(--q2) 40%, var(--panel))" stroke="var(--q2)" stroke-width="3"/>`, 'Sleeve covers', true)}
      ${row(360, glove(54, 352, 'var(--dim)'), 'Single gloves', false, true)}`;
    return `${floor}
      <path d="M278 600 V96" stroke="var(--line)" stroke-width="5" stroke-dasharray="14 10"/>${lbl(286, 262, 'DOOR', 13, 'start')}
      <g transform="translate(0 -92)">${board}</g>
      <!-- gowning point -->
      <rect x="40" y="440" width="190" height="24" rx="6" fill="var(--panel2)" stroke="var(--steel)" stroke-width="4"/>
      <path d="M70 464 V600 M200 464 V600" stroke="var(--steel)" stroke-width="6"/><path d="M110 440 v-30 h30" fill="none" stroke="var(--steel)" stroke-width="5" stroke-linecap="round"/>
      ${lbl(110, 500, 'SINK', 15)}${lbl(110, 524, 'GOWNING', 13)}
      <!-- slitter -->
      <circle cx="500" cy="380" r="80" fill="var(--panel2)" stroke="var(--steel)" stroke-width="6"/><circle cx="500" cy="380" r="20" fill="var(--steel)"/>
      <g ${a(at, 'prodA')}>${lbl(500, 346, 'PRODUCT A', 15, 'middle', 'var(--muted)', 'var(--panel2)')}</g>
      <g ${a(at, 'prodB')}>${lbl(500, 342, 'PRODUCT B', 15, 'middle', 'var(--q2)', 'var(--panel2)')}${lbl(500, 432, 'POTENT', 15, 'middle', 'var(--q2)', 'var(--panel2)')}</g>
      <path d="M500 300 L740 300" stroke="var(--q3)" stroke-width="5"/>
      <rect x="650" y="240" width="150" height="120" rx="12" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      ${[0, 1, 2].map(i => `<circle cx="${690 + i * 36}" cy="300" r="15" fill="var(--panel2)" stroke="var(--steel)" stroke-width="4"/>`).join('')}
      ${[0, 1, 2].map(i => `<path d="M800 ${292 + i * 8} L${930} ${330 + i * 70}" stroke="var(--q3)" stroke-width="3"/><circle cx="960" cy="${330 + i * 70}" r="34" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/><circle cx="960" cy="${330 + i * 70}" r="9" fill="var(--steel)"/>`).join('')}
      ${lbl(1004, 584, 'REWINDS', 14, 'start')}
      <path d="M500 460 V600 M725 360 V600 M960 500 V600" stroke="var(--steel)" stroke-width="7" stroke-linecap="round"/>
      ${lbl(725, 222, 'SLITTER', 18)}
      <!-- trim chute to the potent trim-waste bin -->
      <path d="M800 350 L846 470" stroke="var(--steel)" stroke-width="10" stroke-linecap="round" opacity=".7"/>
      <rect x="806" y="478" width="96" height="122" rx="8" fill="color-mix(in srgb, var(--q2) 14%, var(--panel))" stroke="var(--q2)" stroke-width="4"/>
      ${lbl(854, 522, 'POTENT', 14, 'middle', 'var(--q2)')}${lbl(854, 539, 'TRIM', 14, 'middle', 'var(--q2)')}${lbl(854, 556, 'WASTE', 14, 'middle', 'var(--q2)')}
      <!-- a potent-waste bin at the working position, for used gloves -->
      <rect x="404" y="540" width="62" height="60" rx="6" fill="color-mix(in srgb, var(--q2) 14%, var(--panel))" stroke="var(--q2)" stroke-width="3"/>${lbl(435, 566, 'POTENT', 13, 'middle', 'var(--q2)')}${lbl(435, 582, 'WASTE', 13, 'middle', 'var(--q2)')}`;
  }
  // A knee-length lab coat over ART.person (same (x, y, h)); the sleeves stop just short of the glove, leaving the wrist.
  function coat(x, y, h, attrs = '') {
    const sc = h / 200;
    return `<g ${attrs}><g transform="translate(${x},${y}) scale(${sc})"><path d="M-24 -156 Q0 -162 24 -156 Q32 -153 33 -144 L37 -101 L28 -99 L24 -128 L27 -44 L-27 -44 L-24 -128 L-28 -99 L-37 -101 L-33 -144 Q-32 -153 -24 -156 Z" fill="#eef3f8" stroke="var(--steel)" stroke-width="2"/><path d="M0 -150 V-44" stroke="var(--steel)" stroke-width="1.6"/></g></g>`;
  }
  // Sleeve covers and an outer pair of gloves over the coat cuffs (no skin showing).
  function gowned(x, y, h, attrs = '', parts = 'sleeves gloves') {
    const sc = h / 200, sl = parts.includes('sleeves'), gl = parts.includes('gloves');
    return `<g ${attrs}><g transform="translate(${x},${y}) scale(${sc})">${[-1, 1].map(d => `${sl ? `<path d="M${d * 24} -132 L${d * 38} -92 L${d * 28} -90 L${d * 22} -124 Z" fill="color-mix(in srgb, var(--q2) 45%, var(--panel))" stroke="var(--q2)" stroke-width="1.6"/>` : ''}${gl ? `<circle cx="${d * 33}" cy="-89" r="8.5" fill="var(--q1)"/><path d="M${d * 27} -94 L${d * 39} -96" stroke="var(--q1)" stroke-width="5" stroke-linecap="round"/>` : ''}`).join('')}</g></g>`;
  }


  // A close-up of a wrist: sleeve, glove cuff, and the gap of bare skin between them (or no gap once gowned).
  // Parts: gap (bare wrist), covered (second glove + sleeve cover over the cuff).
  function wrist(at = {}) {
    return `<svg viewBox="0 0 220 220" width="220" height="220" overflow="visible">
      <circle cx="110" cy="110" r="104" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      <clipPath id="wr-clip"><circle cx="110" cy="110" r="100"/></clipPath>
      <g clip-path="url(#wr-clip)">
        <rect x="-20" y="80" width="110" height="60" fill="var(--person)"/>
        <g ${a(at, 'gap')}><rect x="88" y="84" width="36" height="52" fill="#e8b98f"/></g>
        <path d="M122 82 h70 q30 0 30 28 q0 28 -30 28 h-70 z" fill="var(--q3)"/><rect x="118" y="80" width="14" height="60" rx="4" fill="color-mix(in srgb, var(--q3) 70%, #fff)"/>
        <g ${a(at, 'covered')}><rect x="-20" y="74" width="132" height="72" rx="8" fill="color-mix(in srgb, var(--q2) 40%, var(--panel))" stroke="var(--q2)" stroke-width="3"/>
          <path d="M100 76 h92 q36 0 36 34 q0 34 -36 34 h-92 z" fill="var(--q1)"/><rect x="96" y="74" width="16" height="72" rx="4" fill="color-mix(in srgb, var(--q1) 70%, #fff)"/></g>
      </g></svg>`;
  }

  return { coat, gowned, mixRoom, staging, rollsPallet, palletTruck, forklift, cardInset, beforeBreak, rollRoom, dieCutter, slitter, wrist };
})();
