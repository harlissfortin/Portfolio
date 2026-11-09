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

  // Save 4: the slitter at a changeover, locked out (power and air) to replace its worn razor blades (no web threaded).
  // Left to right: the BLADE CHANGE procedure card (Lock out · Cut-resistant gloves); two isolation points, the POWER
  // disconnect and the AIR lockout valve, each with your own teal lock and its own DO NOT OPERATE tag (name scribble),
  // one YOURS pill under both; the unwind roll; on the knife station's left side a hook with a pair of light-grey knit
  // cut-resistant gloves and, under it, a small shelf with the yellow USED BLADES box (slot on top) and a grey blade
  // dispenser showing the back of one new blade (outside the knife area, beside where you stand); the knife station
  // face-on (knife bar, three razor holders, each blade clamped below its holder above the anvil roll, hinged cover);
  // the control panel with its screen unlit; and the rewinds.
  // Parts: prodA / prodB (roll label), cardTick (✓ on the card's glove row), hookGloves, hookGlovesBack (the same pair
  // back on the hook), cover / coverUp / coverBack (cover closed / hinged up, attached / closed again before Go).
  // Each holder has a worn blade (g#s10-ob<i>, dull grey edge band) and a hidden new one (g#s10-nb<i>, bright edge);
  // the scene hook swaps them in step with the close-up. KNIVES are the three holder x positions; nothing slides.
  const KNIVES = [640, 712, 784];
  const KNIT = '#b4bbc3', KNIT_DK = '#7c848d', WORN = '#7c848d', BLADE = '#dfe7ef', BACK = '#9aa8b8';
  const knitDef = id => `<defs><pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 5 L5 0 M-1 1 L1 -1 M4 6 L6 4" stroke="#8b929a" stroke-width="1.1"/></pattern></defs>`;
  // a cut-resistant glove hanging fingers-down, palm facing out, thumb on the left. (x, y) = top centre of the cuff.
  const GLOVE = 'M-12 12 H12 V47 Q12 50 9 50 Q6 50 6 47 V36 V53 Q6 56 3 56 Q0 56 0 53 V36 V55 Q0 58 -3 58 Q-6 58 -6 55 V36 V52 Q-6 55 -9 55 Q-12 55 -12 52 Z';
  function cutGlove(x, y, s = 1, pat = 'knitS') {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-19" y="20" width="8" height="19" rx="4" transform="rotate(28 -15 22)" fill="${KNIT}" stroke="var(--steel)" stroke-width="1.4"/>
      <path d="${GLOVE}" fill="${KNIT}"/><path d="${GLOVE}" fill="url(#${pat})" stroke="var(--steel)" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="-13" y="0" width="26" height="13" rx="3" fill="${KNIT_DK}"/><path d="M-8 1 v11 M-3 1 v11 M2 1 v11 M7 1 v11" stroke="#636a72" stroke-width="1.2"/></g>`;
  }
  // One razor holder on the knife bar: holder body, clamp jaws with a small clamp knob, and its blade below them (a
  // blade reads as a blade, not a nozzle tip, when it is wider at the edge than at the back). Two blades per holder:
  // g#s10-ob<i>, the worn one (dull grey edge band), and g#s10-nb<i>, the new one (bright edge with a fine bevel line,
  // hidden). The scene hook fades the worn one out while its close-up blade slides out of the clamp, and the new one in
  // while its close-up blade is seated, so the stage never shows a blade the close-up has taken out. No nicks or chips.
  function stageBlade(x, worn) {
    return `<path d="M${x - 9} 289 L${x + 9} 289 L${x + 14} 318 L${x - 14} 318 Z" fill="${BLADE}" stroke="var(--steel)" stroke-width="2.5" stroke-linejoin="round"/>` +
      (worn ? `<path d="M${x - 12} 315 H${x + 12}" stroke="${WORN}" stroke-width="3.5" stroke-linecap="round"/>`
        : `<path d="M${x - 11} 311 H${x + 11}" stroke="var(--steel)" stroke-width="1" opacity=".7"/><path d="M${x - 12} 315 H${x + 12}" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>`);
  }
  function knifeHolder(x, i) {
    return `<g><circle cx="${x}" cy="238" r="7" fill="var(--steel)"/>
      <rect x="${x - 17}" y="242" width="34" height="42" rx="6" fill="var(--panel2)" stroke="var(--steel)" stroke-width="4"/>
      <g id="s10-ob${i}">${stageBlade(x, true)}</g><g id="s10-nb${i}" opacity="0">${stageBlade(x, false)}</g>
      <rect x="${x - 11}" y="282" width="22" height="11" rx="2.5" fill="var(--steel)"/><circle cx="${x + 15}" cy="287" r="4.5" fill="var(--panel)" stroke="var(--steel)" stroke-width="2"/></g>`;
  }
  function slitter(at = {}) {
    const card = `<rect x="20" y="18" width="216" height="142" rx="12" fill="var(--panel)" stroke="var(--steel)" stroke-width="4"/>
      <path d="M20 30 Q20 18 32 18 H224 Q236 18 236 30 V52 H20 Z" fill="var(--steel)"/>
      <text x="128" y="41" text-anchor="middle" font-size="15" font-weight="900" fill="var(--panel)" letter-spacing=".05em">BLADE CHANGE</text>
      <g style="color:var(--ink)"><svg x="34" y="60" width="32" height="32"><use href="#i-lock"/></svg></g><text x="78" y="83" font-size="18" font-weight="800" fill="var(--ink)">Lock out</text>
      ${cutGlove(50, 100, 0.7)}<text x="78" y="120" font-size="18" font-weight="800" fill="var(--ink)">Cut-resistant</text><text x="78" y="142" font-size="18" font-weight="800" fill="var(--ink)">gloves</text>
      <g ${a(at, 'cardTick')} style="color:var(--go)"><svg x="138" y="122" width="28" height="28"><use href="#i-check"/></svg></g>`;
    return `${knitDef('knitS')}${floor}
      ${card}
      ${lbl(49, 210, 'POWER', 13)}${lbl(119, 210, 'AIR', 13)}
      <rect x="20" y="220" width="58" height="124" rx="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      <rect x="39" y="238" width="20" height="64" rx="6" fill="var(--steel)"/>
      <path d="M90 262 H148" stroke="var(--steel)" stroke-width="9" stroke-linecap="round"/>
      <rect x="114" y="236" width="10" height="12" rx="2" fill="var(--panel2)" stroke="var(--steel)" stroke-width="2.5"/><path d="M114 241 H124 M114 245 H124" stroke="var(--steel)" stroke-width="1.2"/>
      <rect x="103" y="248" width="32" height="28" rx="6" fill="var(--panel)" stroke="var(--steel)" stroke-width="4"/>
      <rect x="114" y="270" width="10" height="34" rx="4" fill="var(--steel)"/>
      ${[49, 119].map(x => `<g style="color:var(--q3)"><svg x="${x - 17}" y="294" width="34" height="34"><use href="#i-lock"/></svg></g>
      <path d="M${x} 324 V360" stroke="var(--steel)" stroke-width="2"/>
      <rect x="${x - 26}" y="360" width="52" height="56" rx="5" fill="#ffd34d" stroke="#9a7400" stroke-width="2"/><circle cx="${x}" cy="367" r="3" fill="var(--panel)"/>
      <text x="${x}" y="384" text-anchor="middle" font-size="10.5" font-weight="900" fill="#3d2d00">DO NOT</text><text x="${x}" y="397" text-anchor="middle" font-size="10" font-weight="900" fill="#3d2d00">OPERATE</text>
      <path d="M${x - 22} 408 q5 -7 9 0 t9 0 t9 -2 t9 2 t9 0" fill="none" stroke="#3d2d00" stroke-width="2" stroke-linecap="round"/>`).join('')}
      <rect x="30" y="424" width="116" height="22" rx="11" fill="var(--q3)"/><text x="88" y="440" text-anchor="middle" font-size="13" font-weight="900" fill="#fff">YOURS</text>
      <circle cx="232" cy="372" r="72" fill="var(--panel2)" stroke="var(--steel)" stroke-width="6"/><circle cx="232" cy="372" r="18" fill="var(--steel)"/>
      <g ${a(at, 'prodA')}>${lbl(232, 342, 'PRODUCT A', 14, 'middle', 'var(--muted)', 'var(--panel2)')}</g>
      <g ${a(at, 'prodB')}>${lbl(232, 342, 'PRODUCT B', 14, 'middle', 'var(--q1)', 'var(--panel2)')}</g>
      <path d="M232 444 V600" stroke="var(--steel)" stroke-width="7" stroke-linecap="round"/>
      <!-- cut-resistant gloves on their hook, on the knife station's left side -->
      <path d="M560 206 H522 v10" fill="none" stroke="var(--steel)" stroke-width="5" stroke-linecap="round"/>
      <g ${a(at, 'hookGloves')}>${cutGlove(534, 220, 1.5)}${cutGlove(516, 216, 1.5)}</g>
      <g ${a(at, 'hookGlovesBack')}>${cutGlove(534, 220, 1.5)}${cutGlove(516, 216, 1.5)}</g>
      <!-- blade-change shelf under the hook, on the station's left side: the used-blade box (slot on top) and the blade
           dispenser with the back of one new blade showing. Outside the knife area, not under the web. -->
      <path d="M558 378 H488" stroke="var(--steel)" stroke-width="5" stroke-linecap="round"/><path d="M558 402 L530 380" stroke="var(--steel)" stroke-width="4" stroke-linecap="round"/>
      <rect x="490" y="330" width="46" height="46" rx="4" fill="#ffd34d" stroke="#9a7400" stroke-width="2"/><rect x="497" y="330" width="32" height="5" rx="2" fill="#3d2d00"/>
      <text x="513" y="352" text-anchor="middle" font-size="10" font-weight="900" fill="#3d2d00">USED</text><text x="513" y="365" text-anchor="middle" font-size="10" font-weight="900" fill="#3d2d00">BLADES</text>
      <path d="M541 334 L553 334 L554.5 340 L539.5 340 Z" fill="${BACK}" stroke="var(--steel)" stroke-width="1.2"/>
      <rect x="538" y="339" width="20" height="37" rx="3" fill="var(--panel2)" stroke="var(--steel)" stroke-width="2.2"/><path d="M541 339.5 H555" stroke="var(--steel)" stroke-width="2"/>
      <!-- knife station, face-on -->
      <rect x="560" y="196" width="300" height="214" rx="14" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <rect x="574" y="226" width="272" height="10" rx="4" fill="var(--steel)"/>
      <rect x="574" y="332" width="272" height="16" rx="8" fill="var(--panel2)" stroke="var(--steel)" stroke-width="3"/>
      ${KNIVES.map((x, i) => knifeHolder(x, i)).join('')}
      <rect x="568" y="206" width="284" height="156" rx="8" fill="color-mix(in srgb, var(--n2) 14%, transparent)" stroke="var(--steel)" stroke-width="4" ${a(at, 'cover')}/>
      <path d="M568 206 L852 206 L840 164 L580 164 Z" fill="color-mix(in srgb, var(--n2) 14%, transparent)" stroke="var(--steel)" stroke-width="4" stroke-linejoin="round" ${a(at, 'coverUp')}/>
      <rect x="568" y="206" width="284" height="156" rx="8" fill="color-mix(in srgb, var(--n2) 14%, transparent)" stroke="var(--steel)" stroke-width="4" ${a(at, 'coverBack')}/>
      ${lbl(710, 394, 'SLITTER', 18)}
      <rect x="620" y="436" width="180" height="120" rx="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      <rect x="636" y="452" width="148" height="60" rx="6" fill="#1a2330"/>
      <path d="M640 556 V600 M780 556 V600 M584 410 V600 M836 410 V600" stroke="var(--steel)" stroke-width="7" stroke-linecap="round"/>
      ${[0, 1, 2].map(i => `<circle cx="966" cy="${332 + i * 70}" r="34" fill="var(--panel2)" stroke="var(--steel)" stroke-width="5"/><circle cx="966" cy="${332 + i * 70}" r="9" fill="var(--steel)"/>`).join('')}
      <path d="M966 506 V600" stroke="var(--steel)" stroke-width="7" stroke-linecap="round"/>
      ${lbl(1004, 584, 'REWINDS', 14, 'start')}`;
  }
  // Cut-resistant gloves over the hands of ART.person (same (x, y, h)), worn over the thin gloves.
  function cutGloves(x, y, h, attrs = '') {
    const sc = h / 200;
    return `<g ${attrs}><g transform="translate(${x},${y}) scale(${sc})">${[-1, 1].map(d => `<path d="M${d * 28} -98.9 L${d * 38} -100.9" stroke="var(--q3)" stroke-width="2" stroke-linecap="round"/><circle cx="${d * 33}" cy="-87" r="7.6" fill="${KNIT}"/><circle cx="${d * 33}" cy="-87" r="7.6" fill="url(#knitS)" stroke="var(--steel)" stroke-width="1.8"/><path d="M${d * 28} -95 L${d * 38} -97" stroke="#636a72" stroke-width="4.5" stroke-linecap="round"/>`).join('')}</g></g>`;
  }
  // Glove close-up (unchanged).
  function gloveInset(at = {}) {
    const HAND = 'M78 220 V150 q-22 -18 -26 -44 q-2 -10 8 -12 q9 -1 13 9 l10 22 V62 q0 -11 11 -11 q11 0 11 11 v52 V46 q0 -11 11 -11 q11 0 11 11 v68 V54 q0 -11 11 -11 q11 0 11 11 v62 V74 q0 -10 10 -10 q10 0 10 10 v74 q0 26 -18 40 V220 z';
    return `<svg viewBox="0 0 220 220" width="220" height="220" overflow="visible">
      <circle cx="110" cy="110" r="104" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      <clipPath id="gl-clip"><circle cx="110" cy="110" r="100"/></clipPath><clipPath id="gl-knit"><path d="${HAND}"/></clipPath><clipPath id="gl-top"><rect x="0" y="0" width="220" height="190"/></clipPath>
      <g clip-path="url(#gl-clip)">
        <rect x="70" y="196" width="88" height="40" fill="var(--person)"/>
        <g ${a(at, 'thin')}><path d="${HAND}" fill="color-mix(in srgb, var(--q3) 78%, #fff)"/><path d="M84 74 v52 M106 60 v40" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/><rect x="74" y="188" width="84" height="10" rx="5" fill="var(--q3)"/></g>
        <g ${a(at, 'knit')}><g clip-path="url(#gl-top)"><path d="${HAND}" fill="${KNIT}"/><g clip-path="url(#gl-knit)">${Array.from({ length: 17 }, (_, i) => `<path d="M40 ${40 + i * 9} H180" stroke="#8b929a" stroke-width="2" stroke-dasharray="3 4"/>`).join('')}</g>
          <path d="${HAND}" fill="none" stroke="var(--steel)" stroke-width="2.5"/></g><rect x="72" y="172" width="88" height="18" rx="5" fill="${KNIT_DK}"/><path d="M80 175 v12 M92 175 v12 M104 175 v12 M116 175 v12 M128 175 v12 M140 175 v12 M152 175 v12" stroke="#6a7179" stroke-width="2"/></g>
      </g></svg>`;
  }
  // Blade-change close-up in the shared inset (220 x 220). Top: the knife bar and one razor holder (clamp jaws, clamp
  // knob). Lower left: the USED BLADES box, a dark slot in its lid; lower right: the blade dispenser with the back of the
  // next blade showing. The moving parts are driven by the scene hook (attribute transforms / opacity, no data-in):
  //   g#s10-ih   holder, both blades and the clamp (dips between blades while the close-up moves to the next holder)
  //   g#s10-old  the used blade (grey worn edge); g#s10-new  the new blade (bright edge), starting in the dispenser
  //   g#s10-kn   the clamp knob's notch (rotates open / closed)
  //   g#s10-hd   your cut-resistant-gloved thumb and finger; the group origin is the fingertip, which grips the knob's right rim or pinches the top
  //              of the blade's dark back strip (pinch = blade origin + [16, -1])
  //   g#s10-ao / g#s10-ac  the small arc arrows for knob open / closed
  // Blade geometry (origin = centre of its back): back 40 wide, edge 56 wide, 36 tall; the edge always points down.
  // Draw order: blades, then the holder's clamp, then box and dispenser (a blade going into the slot sinks behind the box
  // front; a new blade rises from behind the dispenser front), then the hand (always in front: never inside the box).
  // IN: rest (seated), out (slid 16 down, clear of the clamp), hov (over the slot, edge 18 px above the lid), rls (back
  // top hidden under the slot band: the fingers let go here, at the slot mouth y 152), gone (inside the box), disp (in the
  // dispenser, back showing), lift (pulled up clear of the dispenser), knob (clamp knob centre), slotY (box lid line).
  const IN = { rest: [100, 86], out: [100, 102], hov: [64, 98], rls: [64, 153], gone: [64, 194], disp: [142, 140], lift: [142, 102], knob: [134, 86], slotY: 152 };
  function bladeShape(worn) {
    return `<path d="M-20 0 L20 0 L28 36 L-28 36 Z" fill="${BLADE}" stroke="var(--steel)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M-20 0 L20 0 L22.2 10 L-22.2 10 Z" fill="${BACK}" stroke="var(--steel)" stroke-width="2" stroke-linejoin="round"/>
      ${[-13, 0, 13].map(x => `<rect x="${x - 4.5}" y="15.5" width="9" height="6" rx="3" fill="var(--panel)" stroke="var(--steel)" stroke-width="1.4"/>`).join('')}
      ${worn ? `<path d="M-25 32 H25" stroke="${WORN}" stroke-width="4.5" stroke-linecap="round"/>`
        : `<path d="M-24 27.5 H24" stroke="var(--steel)" stroke-width="1.2" opacity=".7"/><path d="M-25 32 H25" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>`}`;
  }
  function bladeInset() {
    const [rx, ry] = IN.rest, [kx, ky] = IN.knob, [dx, dy] = IN.disp, sx = IN.rls[0], sy = IN.slotY;
    return `<svg viewBox="0 0 220 220" width="220" height="220" overflow="visible">
      <circle cx="110" cy="110" r="104" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      <clipPath id="bi-clip"><circle cx="110" cy="110" r="100"/></clipPath>
      <g clip-path="url(#bi-clip)">
        <rect x="0" y="12" width="220" height="14" fill="var(--steel)"/>
        <g transform="translate(${dx} ${dy + 3})">${bladeShape(false)}</g>
        <g id="s10-ih">
          <circle cx="${rx}" cy="28" r="8" fill="var(--steel)"/>
          <rect x="${rx - 24}" y="30" width="48" height="52" rx="8" fill="var(--panel2)" stroke="var(--steel)" stroke-width="4"/>
          <g id="s10-old" transform="translate(${rx} ${ry})">${bladeShape(true)}</g>
          <g id="s10-new" transform="translate(${dx} ${dy})">${bladeShape(false)}</g>
          <rect x="${rx - 14}" y="78" width="28" height="16" rx="3" fill="var(--steel)"/>
          <circle cx="${kx}" cy="${ky}" r="9" fill="var(--panel)" stroke="var(--steel)" stroke-width="3"/>
          <g id="s10-kn" transform="rotate(0 ${kx} ${ky})"><path d="M${kx} ${ky} V${ky - 8}" stroke="var(--steel)" stroke-width="3" stroke-linecap="round"/></g>
        </g>
        <rect x="${sx - 37}" y="${sy}" width="74" height="80" rx="6" fill="#ffd34d" stroke="#9a7400" stroke-width="3"/>
        <rect x="${sx - 30}" y="${sy - 1}" width="60" height="6" rx="3" fill="#3d2d00"/>
        <text x="${sx + 12}" y="${sy + 22}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#3d2d00">USED</text>
        <text x="${sx + 12}" y="${sy + 35}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#3d2d00">BLADES</text>
        <rect x="${dx - 32}" y="${dy + 8}" width="64" height="80" rx="6" fill="var(--panel2)" stroke="var(--steel)" stroke-width="3"/>
        <path d="M${dx - 25} ${dy + 9} H${dx + 25}" stroke="var(--steel)" stroke-width="3"/>
        <g id="s10-hd" transform="translate(${kx} ${ky})">
          <g transform="rotate(-32)">
            <rect x="34" y="-22" width="56" height="40" rx="16" fill="${KNIT}" stroke="var(--steel)" stroke-width="2.5"/>
            <rect x="2" y="-19" width="44" height="12" rx="6" fill="${KNIT}" stroke="var(--steel)" stroke-width="2.2"/>
            <rect x="-2" y="-5" width="48" height="13" rx="6.5" fill="${KNIT}" stroke="var(--steel)" stroke-width="2.2"/>
            <g opacity=".7"><path d="M40 -14 H84 M40 -6 H86 M40 2 H86 M40 10 H84" stroke="#8b929a" stroke-width="1.6" stroke-dasharray="3 4"/></g>
            <rect x="84" y="-24" width="20" height="44" rx="4" fill="${KNIT_DK}"/><path d="M89 -22 v40 M94 -22 v40 M99 -22 v40" stroke="#636a72" stroke-width="1.5"/>
            <rect x="104" y="-22" width="8" height="40" rx="3" fill="var(--q3)"/>
          </g></g>
        <g id="s10-ao" opacity="0"><path d="M${kx + 3} ${ky - 15.7} A16 16 0 0 0 ${kx - 9} ${ky - 13}" fill="none" stroke="var(--steel)" stroke-width="3" stroke-linecap="round"/><path d="M${kx - 4} ${ky - 18} L${kx - 10} ${ky - 13} L${kx - 4} ${ky - 7}" fill="none" stroke="var(--steel)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>
        <g id="s10-ac" opacity="0"><path d="M${kx - 9} ${ky - 13} A16 16 0 0 1 ${kx + 3} ${ky - 15.7}" fill="none" stroke="var(--steel)" stroke-width="3" stroke-linecap="round"/><path d="M${kx - 2} ${ky - 20.5} L${kx + 3.5} ${ky - 15.7} L${kx - 2.5} ${ky - 10.8}" fill="none" stroke="var(--steel)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>
      </g></svg>`;
  }

  return { mixRoom, staging, rollsPallet, palletTruck, forklift, cardInset, beforeBreak, rollRoom, dieCutter, slitter, cutGloves, gloveInset, bladeInset, KNIVES, IN };
})();
