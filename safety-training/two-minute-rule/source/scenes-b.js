// Scene markup, part B: the four two-minute saves on a patch line (scenes 7–10). Stage = left 1080 x 642 px under
// the top band. Every save: sting · setup with the clue visible · "What would make you stop here?" hold · the catch
// (red ring) · "Your call?" hold · the call with its reason · the steps · Go · what it prevented.
(function () {
  const { I, A, P, html, check, cross, ring } = window.SC, SC = window.SC;
  const stage = (body) => `<div class="abs" style="left:0;top:130px;width:1080px;height:642px" data-in="fade ^1.1 0.5">${body}</div>`;
  const svg = (body, attrs = '') => `<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="642" viewBox="0 0 1080 642" ${attrs}>${body}</svg>`;
  const lab = (txt, attrs = '', style = '') => `<div class="tag" style="font-size:22px;${style}" ${attrs}>${txt}</div>`;
  const gloss = (txt, style = '') => `<span class="tag grey" style="font-size:21px;${style}">${txt}</span>`;
  const icon = (id, x, y, s, col, attrs = '') => `<g ${attrs} style="color:${col}"><svg x="${x}" y="${y}" width="${s}" height="${s}"><use href="#i-${id}"/></svg></g>`;

  // 7 ─ Save 1 · Solvent transfer, before you start ──────────────────────────
  // Fix it: bonding is a step in your procedure. Clamps on bare metal, lamp green, then the pump goes in.
  const S1 = 'save-1-solvent-bonding';
  html.push(SC.scene(S1, '', `
    ${SC.sting()}
    ${SC.topband(1, 'Solvent transfer', 'start', ['', '', 's7-3 s7-5', ''], SC.WHEN.s1)}
    ${stage(`
      ${svg(`${TD.mixRoom({
        hookClamps: 'data-out="fade s7-6~clamps 0.3"',
        pumpClampH: 'data-in="fade s7-6~bare 0.4" data-out="fade s7-7~go-0.5 0.3"', pumpClamp: 'data-in="fade s7-7~go-0.5 0.4"', drumClamp: 'data-in="fade s7-6~bare+0.35 0.4"',
        lampRed: 'data-out="fade s7-7~green-0.15 0.2"', lampGreen: 'data-in="fade s7-7~green-0.15 0.2"',
        wandHolder: 'data-out="fade s7-7~go-0.5 0.4"', wand: 'data-in="fade s7-7~go-0.5 0.4"',
        vapor: 'data-in="fade s7-4 0.6" data-out="fade s7-6 0.4"',
        spark: 'data-in="pop s7-4~spark 0.4" data-out="fade s7-6 0.4"', sparkX: 'opacity="0"',
        hookLbl: 'data-in="fade s7-3~hook 0.3"', bareLbl: 'data-in="fade s7-6~bare 0.3"' })}
        <g data-in="fade s7-8 0.4" fill="none" stroke="var(--muted)" stroke-width="4" stroke-linecap="round" opacity=".5">${[586, 608, 630].map(x => `<path d="M${x} 252 q10 -14 0 -28 q-10 -14 0 -28"/>`).join('')}</g>
        <g data-in="pop s7-8~spark 0.4" style="color:var(--fix);stroke-dasharray:7 6" opacity=".7"><svg x="584" y="128" width="54" height="54"><use href="#i-bolt"/></svg></g>
        <g data-in="pop s7-8~spark+0.25 0.4" style="color:var(--dim)"><svg x="574" y="118" width="74" height="74"><use href="#i-x"/></svg></g>
        ${P(500, 600, 265, { goggles: true, gloves: 'var(--q3)' })}`)}
      ${A(240, 30, gloss('Bonding = clamps and wires that stop static sparks'), 'data-in="up s7-3~bonding" data-out="fade s7-5 0.3"')}
      ${A(650, 128, lab('Static charge', '', 'color:var(--fix)'), 'data-in="up s7-4~static" data-out="fade s7-6 0.3"')}
      ${A(20, 20, lab('Clamps first, on bare metal'), 'data-in="up s7-6~clamps" data-out="fade s7-7~green 0.3"')}
      ${A(300, 76, `<span class="tag ok" style="font-size:22px">BONDED ✓</span>`, 'data-in="pop s7-7~green 0.35"')}
      <div class="abs" style="left:790px;top:20px;display:flex;flex-direction:column;gap:8px;white-space:nowrap">
        ${check('Drum', 'data-in="pop s7-7~drum 0.3"')}${check('Pump', 'data-in="pop s7-7~pump 0.3"')}${check('Hose: conductive', 'data-in="pop s7-7~bonded 0.3"')}${check('Tank: grounded', 'data-in="pop s7-7~bonded+0.3 0.3"')}
        <div data-in="fade s7-7~green+0.4 0.4" style="margin-top:6px">${gloss('Won’t go green?<br>Stop &amp; get help', 'font-size:19px;display:inline-block;line-height:1.3;white-space:normal')}</div></div>
      <div class="abs" style="left:0;top:0" data-out="fade s7-6~clamps 0.3">${ring(440, 246, 196, 's7-3~hook')}</div>
    `)}
    ${SC.casecard({ catch: 'Clamps still on their hook', catchAt: 's7-3~hook', call: 'fix', callAt: 's7-6', why: 'A step in your procedure', goAt: 's7-7~go', prev: 'No static spark where the vapor comes out', prevAt: 's7-8' })}
    ${SC.predict(S1, 's7-2', 3.0, 's7-3-0.1')}
    ${SC.yourCall(S1, 's7-5', 2.4, 'fix', 's7-6', 's7-6+1.6')}
  `));

  // 8 ─ Save 2 · Roll staging, after a break ─────────────────────────────────
  // Stop & get help: the pallet is up on the beam, a forklift job, and you're trained on the pallet truck only.
  // The trained driver's lowering is shown as a slow dissolve to the end state (no forklift travel near people).
  const S2 = 'save-2-material-handling';
  const you2 = `${P(978, 600, 280)}<rect x="986" y="414" width="14" height="18" rx="3" fill="#fff" stroke="var(--q3)" stroke-width="3"/>`;
  html.push(SC.scene(S2, '', `
    ${SC.sting()}
    ${SC.topband(2, 'Roll staging', 'break', ['s8-3 s8-5', '', '', ''], SC.WHEN.s2)}
    ${stage(`
      ${svg(`${TD.staging({
        palletHigh: 'data-out="fade s8-9.end+0.2 1.2"', palletLow: 'data-in="fade s8-9.end+0.2 1.2"',
        spot: 'data-out="fade s8-9.end+0.5 0.8"', doorSign: 'data-out="fade s8-9~lead 0.4"', driver: 'data-in="fade s8-9~driver 0.6"', forklift: 'data-out="fade s8-10 0.6"' })}
        <text x="846" y="648" text-anchor="middle" font-size="15" font-weight="750" fill="var(--muted)" data-in="fade s8-3~forklift+0.3 0.4" data-out="fade s8-7 0.3">walk-behind · floor level</text>
        <g data-out="fade s8-9 0.5">${P(690, 600, 270, { color: '#9aa4b1' })}</g>
        <g data-in="left s8-9~lead 0.8" data-out="fade s8-11 0.5">${P(1036, 600, 270, { vest: 'var(--q3)' })}</g>
        <g id="s8-mover">${TD.palletTruck(750)}<g data-in="left ^1.3 0.8">${you2}</g></g>
        <path d="M838 217 L986 420" stroke="var(--steel)" stroke-width="3" stroke-dasharray="6 5" data-in="fade ^1.3 0.4" data-out="fade s8-7+0.6 0.4"/>
        ${icon('hand', 466, 384, 72, 'var(--dim)', 'data-in="pop s8-7~authorized 0.4" data-out="fade s8-9 0.4"')}
        ${icon('radio', 896, 440, 52, 'var(--ink)', 'data-in="pop s8-8~call 0.35" data-out="fade s8-9+0.4 0.3"')}`)}
      ${A(800, 15, TD.cardInset(), 'data-in="fade ^1.3 0.4" data-out="fade s8-7+0.6 0.4"')}
      ${A(330, 20, gloss('Roll staging: rolls wait here for the line'), 'data-in="up s8-1~staging" data-out="fade s8-2~what-0.3 0.3"')}
      ${A(400, 6, `<div class="card" style="padding:10px 14px 4px;border-radius:16px"><div style="font-size:19px;font-weight:850;color:var(--q1)">Before your break</div>${TD.beforeBreak()}</div>`, 'data-in="pop s8-3 0.4" data-out="fade s8-7+0.6 0.4"')}
      ${A(30, 16, `<span class="tag hz" style="font-size:22px">Up high: forklift job</span>`, 'data-in="pop s8-3~high+0.2 0.35" data-out="fade s8-7 0.3"')}
      ${A(420, 214, `<div class="bubble right" style="font-size:22px;width:330px">Line’s waiting. Just grab the forklift!</div>`, 'data-in="fade ^1.3 0.4" data-out="fade s8-8~thanks 0.3"')}
      ${A(608, 164, `<div style="display:flex;gap:8px;align-items:center">${I('clock', '', 'width:34px;height:34px;color:var(--fix)')}<span class="tag" style="font-size:19px;color:var(--fix)">Line waiting</span></div>`, 'data-in="pop s8-5~waiting 0.35" data-out="fade s8-8~thanks 0.3"')}
      ${A(560, 256, `<div class="bubble right" style="font-size:22px">Fair enough.</div>`, 'data-in="pop s8-8.end-0.4 0.35" data-out="fade s8-9 0.3"')}
      ${A(300, 598, gloss('Forklift: ride-on · lifts loads high'), 'data-in="up s8-3~forklift" data-out="fade s8-4~different-0.3 0.3"')}
      ${A(300, 598, gloss('Different truck · its own training'), 'data-in="up s8-4~different" data-out="fade s8-7 0.3"')}
      ${A(380, 604, lab('Not your truck', '', 'color:var(--muted);font-size:20px'), 'data-in="up s8-7~authorized+0.2" data-out="fade s8-9 0.3"')}
      ${A(62, 372, gloss('No climbing the rack<br>No pulling it down', 'display:inline-block;line-height:1.35;font-size:19px'), 'data-in="up s8-7~forklift+0.2" data-out="fade s8-9 0.3"')}
      ${A(668, 136, `<div class="bubble right" style="font-size:22px;width:340px">Thanks, but I’m not trained on that one. I’ll call our lead.</div>`, 'data-in="pop s8-8~thanks-0.2 0.35" data-out="fade s8-9 0.3"')}
      ${A(742, 150, `<div class="bubble right" style="font-size:22px;white-space:nowrap">Thanks. What did you see?</div>`, 'data-in="pop s8-9~lead+0.4 0.35" data-out="fade s8-10 0.3"')}
      ${A(976, 256, lab('Your lead', '', 'font-size:18px'), 'data-in="up s8-9~lead+0.5" data-out="fade s8-11 0.3"')}
      ${A(400, 262, `<div style="display:flex;gap:8px">${lab('Trained driver', '', 'font-size:19px')}<span class="tag ok" style="font-size:19px">Forklift ✓</span></div>`, 'data-in="up s8-9~driver" data-out="fade s8-10 0.3"')}
      ${A(60, 598, gloss('Stand clear · nobody under the forks or in its path'), 'data-in="up s8-9~stand" data-out="fade s8-10+0.4 0.3"')}
      
      <div class="abs" style="left:0;top:0" data-out="fade s8-7 0.3">${ring(180, 222, 290, 's8-3~high')}</div>
      <div class="abs" style="left:0;top:0" data-out="fade s8-7 0.3">${ring(991, 174, 76, 's8-4~card')}</div>
    `)}
    ${SC.casecard({ catch: 'Up high: forklift job · card: pallet truck only<div class="srcline" style="margin-top:6px;font-size:19px">29 CFR 1910.178(l)</div>', catchAt: 's8-4~card', call: 'stop', callAt: 's8-7', why: 'Not authorized to drive a forklift', goAt: 's8-10~go', prev: 'Nobody drives a truck they’re not trained on', prevAt: 's8-11' })}
    ${SC.predict(S2, 's8-2', 3.0, 's8-3-0.1')}
    ${SC.yourCall(S2, 's8-6', 2.4, 'stop', 's8-7', 's8-7+1.6')}
  `));

  // 9 ─ Save 3 · Die cutter at handover ──────────────────────────────────────
  // Stop & get help: the guard is off and someone else's lock is on. Only the owner (or a supervisor under the
  // site's lock-removal procedure) removes it. You never touch the lock, the tag or the guard.
  const S3 = 'save-3-die-cutter-lock';
  html.push(SC.scene(S3, '', `
    ${SC.sting()}
    ${SC.topband(3, 'Die cutter', 'handover', ['', '', 's9-3 s9-5', ''], SC.WHEN.s3)}
    ${stage(`
      ${svg(`${TD.dieCutter({ guardOff: 'data-out="fade s9-8~guard 0.4"', guardOn: 'data-in="fade s9-8~guard+0.2 0.5"', lock: 'data-out="up s9-8~removes 0.4"', note: 'data-out="fade s9-9 0.4"' })}
        ${icon('check', 520, 462, 40, 'var(--go)', 'data-in="pop s9-8~guard+0.8 0.3"')}
        <g id="s9-tech"><g data-in="fade s9-7~owner 0.5" data-out="fade s9-9 0.4">${P(820, 600, 290, { gloves: 'var(--q1)' })}</g></g>
        ${P(950, 600, 300)}
        ${icon('phone', 880, 410, 50, 'var(--ink)', 'data-in="pop s9-6~help 0.35" data-out="fade s9-7 0.3"')}`)}
      ${A(748, 536, `<span class="tag grey" style="font-size:18px;transform:rotate(-6deg);display:inline-block">Assumed</span>`, 'data-in="pop s9-3 0.35" data-out="fade s9-6 0.3"')}
      ${A(300, 70, gloss('Die station = where patches are cut'), 'data-in="up s9-3~station" data-out="fade s9-5 0.3"')}
      
      
      ${A(700, 120, lab('Technician · lock owner', '', 'font-size:20px'), 'data-in="up s9-7~owner+0.2" data-out="fade s9-8~restart 0.3"')}
      ${A(770, 196, `<span class="tag grey" style="font-size:18px">Owner removes their lock</span>`, 'data-in="pop s9-8~removes 0.3" data-out="fade s9-9 0.3"')}
      ${A(20, 10, `<div class="card" style="padding:12px 18px;width:760px;font-size:20px;font-weight:650;line-height:1.35;color:var(--muted)"><b style="color:var(--ink)">Or a supervisor, using the site’s lock-removal procedure:</b><br>owner not on site · every effort to reach them · told before they’re back</div>`, 'data-in="up s9-7~supervisor" data-out="fade s9-8 0.3"')}
      <div class="abs" style="left:20px;top:10px;display:flex;flex-direction:column;gap:6px;white-space:nowrap">
        <div class="lab" style="font-size:20px;font-weight:850;letter-spacing:.1em;color:var(--muted)" data-in="fade s9-8~restart-0.2 0.3">YOU</div>
        ${[['Guard on', 's9-8~restart'], ['Area clear', 's9-8~restart+0.35'], ['Restart checks', 's9-8~checks+0.2']].map(([t, r]) => check(t, `data-in="pop ${r} 0.3"`)).join('')}</div>
      <div class="abs" style="left:0;top:0" data-out="fade s9-6 0.3">${ring(200, 450, 230, 's9-3~guard')}</div>
      <div class="abs" style="left:0;top:0" data-out="fade s9-6 0.3">${ring(709, 380, 130, 's9-4~lock')}</div>
    `)}
    ${SC.casecard({ catch: 'Guard off · someone else’s lock on', catchAt: 's9-4~lock', call: 'stop', callAt: 's9-6', why: 'Someone else’s unfinished work', goAt: 's9-8~go', prev: 'No start with the guard off and the work unfinished', prevAt: 's9-9' })}
    ${SC.predict(S3, 's9-2', 3.0, 's9-3-0.1')}
    ${SC.yourCall(S3, 's9-5', 2.4, 'stop', 's9-6', 's9-6+1.6')}
  `));

  // 10 ─ Save 4 · Blade change at a changeover ──────────────────────────────
  // Fix it: getting the right gloves on is your own PPE step. The slitter is locked out (power and air) under your own
  // locks (YOURS) from the first frame to the last; nothing runs. Cut-resistant gloves go on over your thin gloves.
  // In the close-up, one blade at a time: knob open, pinch the used blade by its back, slide it out, edge-first into the
  // USED BLADES box slot (the fingers let go only at the slot mouth, with the blade already inside), a new blade by its
  // back from the dispenser, seated to its stop, knob closed. Each stage blade fades out while its close-up blade slides
  // out and the new one fades in while it is seated. Then: close-up away, cover closed (gloves still on), cut-resistant
  // gloves off (back on the hook), Go.
  const S4 = 'save-4-blade-change';
  html.push(SC.scene(S4, '', `
    ${SC.sting()}
    ${SC.topband(4, 'Blade change', 'change', ['', 's10-3 s10-4', '', ''], SC.WHEN.s4)}
    ${stage(`
      ${svg(`${TD.slitter({ prodA: 'data-out="fade s10-1~changeover+0.4 0.3"', prodB: 'data-in="fade s10-1~changeover+0.4 0.3"',
          cardTick: 'data-in="pop s10-6~procedure 0.3"', hookGloves: 'data-out="fade s10-6~gloves-0.2 0.3"', hookGlovesBack: 'opacity="0" data-in="fade s10-8~off 0.3"',
          cover: 'data-out="fade s10-7+0.3 0.4"', coverUp: 'data-in="fade s10-7+0.3 0.4" data-out="fade s10-8~off-0.4 0.4"', coverBack: 'opacity="0" data-in="fade s10-8~off-0.4 0.4"' })}
        ${P(440, 600, 280, { gloves: 'var(--q3)' })}
        ${TD.cutGloves(440, 600, 280, 'data-in="fade s10-6~gloves 0.3" data-out="fade s10-8~off 0.3"')}
        <path d="M440 220 L484 466" stroke="var(--steel)" stroke-width="3" stroke-dasharray="6 5" data-in="fade ^1.3 0.4" data-out="fade s10-6.end+0.1 0.3"/>
        <g data-in="fade s10-7~hold 0.4" data-out="fade s10-8~off-0.7 0.3"><path id="s10-lead" d="M514 150 L640 240" stroke="var(--steel)" stroke-width="3" stroke-dasharray="6 5"/></g>`)}
      ${A(300, 8, TD.gloveInset({ knit: 'data-in="fade s10-6~gloves 0.4"' }), 'data-in="fade ^1.3 0.4" data-out="fade s10-6.end+0.1 0.3"')}
      ${A(300, 8, TD.bladeInset(), 'data-in="fade s10-7~hold 0.4" data-out="fade s10-8~off-0.7 0.3"')}
      ${A(8, 456, lab('Locked out', '', 'font-size:20px'), 'data-in="up s10-1~locked" data-out="fade s10-2~what-0.3 0.3"')}
      <div class="abs steps" style="left:544px;top:18px;display:flex;flex-direction:column;gap:6px;white-space:nowrap">
        ${check('Cut-resistant gloves your procedure names', 'data-in="pop s10-6~names 0.3"')}
        ${check('By its back, never the edge', 'data-in="pop s10-7~back 0.3"')}
        ${check('Each used one straight into the blade box', 'data-in="pop s10-8~box 0.3"')}
        ${check('Cut-resistant gloves off before it runs', 'data-in="pop s10-8~off 0.3"')}</div>
      <div class="abs" style="left:0;top:0" data-out="fade s10-5 0.3">${ring(712, 300, 224, 's10-3~blades')}</div>
      <div class="abs" style="left:0;top:0" data-out="fade s10-5 0.3">${ring(410, 118, 176, 's10-3~thin')}</div>
    `)}
    ${SC.casecard({ catch: 'Razor-sharp blades · thin&nbsp;gloves', catchAt: 's10-3~thin', call: 'fix', callAt: 's10-5', why: 'Your own PPE step', goAt: 's10-8~go', prev: 'No cut from a blade that’s worn, but still sharp', prevAt: 's10-9' })}
    ${SC.predict(S4, 's10-2', 3.0, 's10-3-0.1')}
    ${SC.yourCall(S4, 's10-4', 2.4, 'fix', 's10-5', 's10-5~is-0.3')}
  `));
})();
