// Scene markup, part C: scenes 13–15, mounting, and per-frame hooks.
(function () {
  const { I, A, P, html, check, SAVES } = window.SC, SC = window.SC;

  // 13 ─ all six end in Go ─────────────────────────────────────────────────
  const calls = ['stop', 'fix', 'stop', 'fix', 'stop', 'fix'];
  html.push(SC.scene('all-six-end-in-go', '', `
    <div class="abs" style="inset:0" data-out="fade s13-1.end+0.2 0.5">
      ${A(0, 0, `<div class="h1">All six end in Go</div>`, 'data-in="up s13-1~all"')}
      <div class="abs" style="left:0;top:170px;display:flex;gap:28px">
        ${SAVES.map(([t, , , q, ic], i) => `<div class="card" style="width:256px;height:404px;padding:20px;border-top:10px solid var(--${q});display:flex;flex-direction:column;align-items:center;gap:14px" data-in="pop ^0.1+${(i * 0.08).toFixed(2)} 0.4">
          <div style="font-size:44px;font-weight:850;color:var(--${q})">${i + 1}</div>${I(ic, '', 'width:56px;height:56px;flex:none;color:var(--ink)')}<div class="h4" style="font-size:26px;text-align:center;height:64px;flex:none;display:flex;align-items:center;line-height:1.15">${t}</div>
          <span class="minibtn ${calls[i]}" style="font-size:21px;padding:6px 12px" data-in="pop ${calls[i] === 'fix' ? 's13-1~fixes' : 's13-1~calls'}+${(Math.floor(i / 2) * 0.12).toFixed(2)} 0.3">${calls[i] === 'fix' ? 'Fix it' : 'Stop &amp; get help'}</span>
          <div style="flex:none;height:44px;font-size:17px;font-weight:700;line-height:1.25;text-align:center;color:var(--ink)" data-in="fade s13-1~calls+0.4 0.4">${['Someone else’s work', 'In procedure', 'No permit yet', 'In procedure, own lock', 'Not authorized · barrier', 'In procedure, permit held'][i]}</div>
          <span class="minibtn go" style="font-size:21px;padding:6px 14px" data-in="pop s13-1~all+${(i * 0.13).toFixed(2)} 0.3">${I('check')}Go</span></div>`).join('')}
      </div>
    </div>
    <div class="abs" style="inset:0" data-in="fade s13-1.end+0.75 0.6">
      ${A(0, 0, `<div class="h1">Most pauses end in Go</div>`)}
      ${A(0, 120, `<div class="h3 muted">Good for people, product and the line</div>`)}
      <svg id="a6-ticks" class="abs" style="left:40px;top:330px;overflow:visible" width="1600" height="200" viewBox="0 0 1600 200"></svg>
      ${A(40, 520, `<div style="display:flex;gap:12px;align-items:center;font-size:26px;font-weight:700"><span style="width:30px;height:30px;border-radius:50%;background:var(--go)"></span>Your six saves, among all the pauses that simply ended in Go</div>`)}
    </div>
  `));

  // 14 ─ what leaders commit to (dark), with the response shown, not just listed ──────────────────────────────────────
  html.push(SC.scene('what-makes-it-work', 'dark', `
    <div class="abs" style="inset:0" data-out="fade s14-2 0.4">
      ${A(140, 120, `<div class="tile" style="--on:1;width:300px;height:280px">${I('hand')}<div class="w">STOP</div></div>`, 'data-in="pop s14-1 0.5"')}
      <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
        <g data-in="fade s14-1~staff 0.5">${P(600, 600, 320)}</g>
        <g data-in="fade s14-1~contractor 0.5">${P(760, 600, 320)}<g style="color:var(--amber)"><svg x="726" y="230" width="68" height="68"><use href="#i-helmet"/></svg></g></g>
      </svg>
      ${A(880, 140, `<div class="h2">Anyone can stop a job</div>`, 'data-in="up s14-1+0.2"')}
      ${A(880, 240, `<div class="h4 muted">Staff &amp; contractors</div>`, 'data-in="up s14-1~contractor"')}
      ${A(880, 300, `<div style="display:flex;gap:12px;align-items:center">${I('clock', '', 'width:40px;height:40px;color:var(--amber)')}<span class="h4 muted">Even on a late batch</span></div>`, 'data-in="up s14-1~late"')}
      ${A(880, 400, `<div class="h3" style="color:var(--amber)">No punishment · No blame</div>`, 'data-in="up s14-1~punishment"')}
      ${A(880, 480, `<div style="font-size:28px;font-weight:700;line-height:1.3;color:var(--ink)">Stop the task. Running processes are stopped only through your operating procedures.</div>`, 'data-in="fade s14-1~punishment+0.6"', 'width:720px')}
    </div>
    <div class="abs" style="inset:0" data-in="fade s14-2 0.4" data-out="fade s14-3 0.4">
      ${A(0, 0, `<div class="h2">Leaders commit to</div>`, 'data-in="up s14-2"')}
      <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
        <g>${P(160, 640, 320)}</g><g data-in="left s14-2~come 0.6">${P(400, 640, 340, { vest: 'var(--q3)' })}</g>
        <text x="160" y="690" text-anchor="middle" font-size="24" font-weight="700" fill="var(--muted)">You</text>
        <text x="400" y="690" text-anchor="middle" font-size="24" font-weight="700" fill="var(--muted)" data-in="fade s14-2~come 0.4">Your lead</text>
      </svg>
      ${A(60, 250, I('hand', '', 'width:70px;height:70px;color:var(--amber)'), 'data-in="pop s14-2 0.3"')}
      ${A(40, 140, `<div style="width:430px;display:flex;justify-content:flex-end"><div class="bubble right lightvars" style="color:var(--ink)">Thanks. What did you see?</div></div>`, 'data-in="pop s14-2~thank 0.35" data-out="fade s14-2~tell-0.2 0.3"')}
      ${A(40, 140, `<div style="width:430px;display:flex;justify-content:flex-end"><div class="bubble right lightvars" style="color:var(--ink)">Fixed. Here’s what changed.</div></div>`, 'data-in="pop s14-2~tell 0.35"')}
      <div class="abs" style="left:700px;top:150px;display:flex;flex-direction:column;gap:22px">
        ${[['clock', 'Come quickly', 'come'], ['check', 'Thank you', 'thank'], ['wrench', 'Fix the cause', 'fix'], ['ask', 'Tell you what changed', 'tell']].map(([ic, l, w]) =>
          `<div class="block" style="width:700px;background:var(--panel)" data-in="up s14-2~${w}">${I(ic, '', 'color:var(--q3)')}${l}</div>`).join('')}
      </div>
    </div>
    <div class="abs" style="inset:0" data-in="fade s14-3 0.4">
      ${A(160, 160, `<div style="position:relative;color:var(--muted)">${I('form', '', 'width:240px;height:240px')}<svg class="abs" style="left:-20px;top:-10px" width="280" height="260"><path d="M20 240 L260 20" stroke="var(--dim)" stroke-width="10" stroke-linecap="round" pathLength="1" data-in="draw s14-3+0.3 0.5"/></svg></div>`)}
      ${A(160, 450, `<div class="h2">Not a form</div>`, 'data-in="up s14-3+0.2"')}
      ${A(760, 230, `<div style="display:flex;align-items:center;gap:26px">${I('mag', '', 'width:110px;height:110px;color:var(--ink)')}<span style="font-size:60px;color:var(--muted)">→</span>${I('doc', '', 'width:120px;height:120px;color:var(--q3)')}</div>`, 'data-in="fade s14-3~report 0.5"')}
      ${A(760, 450, `<div class="h3">Report through your usual channels</div>`, 'data-in="up s14-3~usual"')}
    </div>
  `));

  // 15 ─ recap card (all five triggers named), the voiced "find out who you call" slate, end card ───────────────────────────
  html.push(SC.scene('close-recap', 'dark', `
    <div class="abs lightvars" style="left:60px;top:8px;width:1560px;height:716px;border-radius:30px;background:#fbf9f4;padding:30px 50px">
      <div style="display:flex;align-items:center;gap:22px" data-in="fade ^0.2 0.6">${I('watch', '', 'width:70px;height:70px;color:var(--amber)')}<div class="h2">The 2-Minute Rule</div><div class="h3" style="color:var(--q3);margin-left:20px">Line clearance for people</div></div>
      <div class="abs" style="left:50px;top:130px;display:flex;gap:20px">
        ${[['STOP', 'hand', 's15-1~stop'], ['LOOK', 'eye', 's15-1~look'], ['ASK', 'ask', 's15-2'], ['DECIDE', 'sign', 's15-4~decide']].map(([w, ic, r]) => `<div class="pill" style="font-size:28px;padding:12px 26px;gap:14px" data-in="pop ${r} 0.4">${I(ic, '', 'width:34px;height:34px')}${w}</div>`).join('')}
      </div>
      <div class="abs" style="left:50px;top:640px;width:1460px;display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:24px;font-weight:800;color:var(--muted)" data-in="fade s15-1 0.4">PAUSE:</div>
        ${[['pause', 'Before you start', 'start'], ['clock', 'After a break', 'break'], ['people', 'Handover', 'handover'], ['bell', 'Interruption', 'interruption'], ['gear', 'Change', 'change']].map(([ic, t, w]) => `<div class="pill" style="font-size:24px;padding:8px 20px;gap:10px;border-color:var(--amber)" data-in="pop s15-1~${w} 0.35">${I(ic, '', 'width:28px;height:28px;color:var(--amber-text)')}${t}</div>`).join('')}
      </div>
      <div class="abs" style="left:50px;top:212px;display:grid;grid-template-columns:720px 720px;gap:12px 20px">
        ${[0, 1, 2, 3].map(i => `<div data-in="pop ${['s15-2~what\'s', 's15-2~could', 's15-3', 's15-3~what'][i]} 0.4">${SC.qcard(i, 'padding:15px 24px')}</div>`).join('')}
      </div>
      <div class="abs" style="left:0;top:452px;width:1560px;display:flex;justify-content:center">${SC.btns(['', '', ''], ['data-in="pop s15-4~go 0.4"', 'data-in="pop s15-4~fix 0.4"', 'data-in="pop s15-4~stop 0.4"'],
        ['', '<div class="small" style="margin-top:10px;text-align:center;font-weight:700;color:var(--ink)" data-in="fade s15-4~procedure">Only if trained, authorized<br>&amp; in procedure</div>', '<div class="small" style="margin-top:10px;text-align:center;font-weight:700;color:var(--ink)" data-in="fade s15-4~stop+0.4">No permit · someone else’s work<br>not authorized · not sure → your lead</div>'])}</div>
    </div>
    <div class="abs lightvars" style="inset:-110px -120px -198px -120px;background:#fbf9f4" data-in="up s15-6-0.5 0.6">
      <div class="abs" style="left:240px;top:170px;width:1440px">
        <div class="kicker">Your site · before your next shift</div>
        <div class="h2" style="margin-top:14px">Who do you call for help?</div>
        <div style="margin-top:26px;display:flex;flex-direction:column;gap:18px;font-size:34px;font-weight:650">
          ${[['clock', 'Days'], ['clock', 'Nights'], ['clock', 'Weekends'], ['phone', 'Radio channel or extension'], ['phone', 'No answer? Call'], ['doc', 'Report what I caught to']].map(([ic, t]) => `<div style="display:flex;align-items:flex-end;gap:16px">${I(ic, '', 'width:44px;height:44px;color:var(--q1)')}<span>${t}:</span><span style="flex:none;width:420px;border-bottom:4px solid var(--line);height:40px"></span></div>`).join('')}
        </div>
        <div class="h4" style="margin-top:34px;display:flex;align-items:center;gap:14px;color:var(--amber-text)">${I('form', '', 'width:44px;height:44px')}Write it on your pocket card.</div>
      </div>
    </div>
    <div class="abs lightvars" style="inset:-110px -120px -198px -120px;background:#fbf9f4" data-in="up s15-7-0.6 0.6">
      <div class="abs" style="left:200px;top:140px;width:1520px">
        <div class="h4">Follow your site’s SOPs, lockout and permit procedures. This video is awareness training, not lockout or confined-space training.</div>
        <div class="kicker" style="margin-top:34px">Sources</div>
        <ol style="margin:16px 0 0;padding-left:34px;font-size:25px;line-height:1.5;color:var(--ink)">
          <li>21 CFR 211.130(e), packaging and labeling operations (line clearance)</li>
          <li>OSHA 29 CFR 1910.147, control of hazardous energy (lockout/tagout), and OSHA interpretations on minor servicing</li>
          <li>OSHA 29 CFR 1910.212, machine guarding · OSHA 29 CFR 1910.146, permit-required confined spaces</li>
          <li>U.S. Chemical Safety Board, Safety Bulletin 2003-10-B, <i>Hazards of Nitrogen Asphyxiation</i></li>
          <li>NFPA 77, <i>Recommended Practice on Static Electricity</i> · CCPS Process Safety Beacon, March 2025</li>
          <li>Isolator glove programs: visual check at each use and physical integrity testing (EU GMP Annex 1, 2022, for aseptic isolators)</li>
        </ol>
        <div class="srcline" style="margin-top:24px">Use cases are illustrative composites, not real incidents. Narration is a synthesized voice.</div>
      </div>
    </div>
    <div class="abs" style="inset:-110px -120px -198px -120px;background:#000" data-in="fade $1.3 1.1"></div>
  `));

  document.getElementById('stage').innerHTML = html.join('\n');
  window.CHAPTER_MARKS = [['s15-6-0.5', 'close-recap', 'Your site'], ['s15-7-0.6', 'close-recap', 'Sources']];
  window.CHROME_LIGHT = [['s15-6-0.5', 'close-recap']];

  // ---------- per-frame hooks ----------
  const H = window.HOOKS = window.HOOKS || {};
  const $ = id => document.getElementById(id);
  H['*'] = (t) => { document.querySelectorAll('.throb').forEach(el => { el.style.transform = `scale(${(1 + 0.06 * Math.sin(t * 7)).toFixed(4)})`; }); };
  function ticks(id, t, t0, savesGo, pulse = 0) {
    const el = $(id); if (!el) return; let s = '<path d="M0 100 H1600" stroke="var(--line)" stroke-width="6"/>';
    const marks = [7, 23, 31, 52, 71, 84];          // irregular: no catch rate can be read off the chart
    for (let i = 0; i < 99; i++) {
      const x = 10 + i * 16, on = t > t0 + i * 0.022;
      if (marks.includes(i)) s += savesGo ? `<circle cx="${x}" cy="100" r="17" fill="var(--go)"/>` : `<circle cx="${x}" cy="100" r="${(17 + 7 * pulse).toFixed(1)}" fill="var(--panel)" stroke="var(--amber)" stroke-width="5"/>`;
      else s += `<rect x="${x - 4}" y="86" width="8" height="28" rx="3" fill="${on ? 'var(--go)' : 'var(--line)'}"/>`;
    }
    el.innerHTML = s;
  }
  H['title-open'] = (t, lt, a) => ART.setStopwatch('sw1', a.ease.inOut(a.prog(t, a.ref('s1-3+0.1', 'title-open'), 2.2)), false);
  H['the-rule'] = (t, lt, a) => { ART.setStopwatch('sw2', 1, false); const e = $('sw2'); if (e) e.querySelector('.sw-txt').style.opacity = (1 - a.prog(t, a.ref('s2-3~guide', 'the-rule'), 0.6)).toFixed(3); };
  H['line-clearance'] = (t, lt, a) => {
    ART.setStopwatch('sw3', 1, false);
    const m = $('lc-mag'), s = a.ref('s3-1+0.5', 'line-clearance'), e = a.ref('s3-1~right', 'line-clearance');
    m.style.transform = `translateX(${(a.prog(t, s, e - s) * 1300).toFixed(1)}px)`;
    m.style.opacity = Math.min(a.prog(t, s, 0.3), 1 - a.prog(t, e, 0.4)).toFixed(3);
    const out = a.prog(t, e - 0.3, 0.6);
    ['lc-left0', 'lc-left1', 'lc-left2'].forEach(id => { const g = $(id); g.style.opacity = (1 - out).toFixed(3); g.style.transform = `translateY(${(-60 * out).toFixed(1)}px)`; });
  };
  H['six-saves'] = (t, lt, a) => {
    const p = a.prog(t, a.ref('s6-2~catches', 'six-saves'), 1.2);  // the six "caught something" markers pulse on "catches"
    ticks('ss-ticks', t, a.ref('s6-1+0.3', 'six-saves'), false, p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0);
  };
  H['all-six-end-in-go'] = (t, lt, a) => ticks('a6-ticks', t, a.ref('s13-1.end+0.4', 'all-six-end-in-go') - 3, true);
  H['save-2-powder-charge'] = (t, lt, a) => {
    const R = r => a.ref(r, 'save-2-powder-charge');
    const ok = t >= R('s8-8~green-0.4');
    $('s7-earth').setAttribute('fill', ok ? '#2f9e5a' : '#cf3434'); $('s7-glyph').textContent = ok ? '✓' : '✕'; $('s7-earthtxt').textContent = ok ? 'GROUNDED' : 'NO GROUND';
  };
  H['save-3-inerted-vessel'] = (t, lt, a) => {
    const R = r => a.ref(r, 'save-3-inerted-vessel');
    const iso = R('s9-8~isolates');
    ART.bubbles($('c3v-bubbles'), t, (1 - a.prog(t, iso, 0.8)), 340, 524);
    $('c3v-n2').setAttribute('opacity', (0.95 * a.prog(t, R('^1.3'), 1.2) * (1 - 0.85 * a.prog(t, R('s9-8~ventilates'), 1.6))).toFixed(3));
    const k = a.ease.inOut(a.prog(t, R('s9-8~retests'), 1.4)), v = a.lerp(4, 20.9, k);
    ART.setGauge('g3', v, k >= 1 ? '20.9%' : '');                        // no intermediate readings shown
    $('c3v-air').setAttribute('opacity', (0.8 * a.ease.inOut(a.prog(t, R('s9-8~ventilates'), 1.6))).toFixed(3));
    const back = a.ease.inOut(a.prog(t, R('s9-7+0.2'), 0.8));
    $('c3v-person').setAttribute('transform', `translate(${(-40 * back).toFixed(1)},0)`);
  };
  H['save-4-blister-jam'] = (t, lt, a) => {
    const R = r => a.ref(r, 'save-4-blister-jam');
    $('s9-status').setAttribute('fill', t < R('s10-1+0.8') ? 'var(--go)' : 'var(--line)');
    const b = R('s10-8~bleed'), z = R('s10-8~zero');
    const f = 0.55 * (1 - a.ease.inOut(a.prog(t, b, Math.max(0.5, z - b)))); // 0.55 of scale -> 0
    const ang = Math.PI * 1.25 - f * Math.PI * 1.5;
    const n = $('s9-needle'); n.setAttribute('x2', (860 + 46 * Math.cos(ang)).toFixed(1)); n.setAttribute('y2', (360 - 46 * Math.sin(ang)).toFixed(1));
    let s = ''; if (t > b && t < z + 0.4) for (let i = 0; i < 4; i++) { const k = ((t - b) * 1.6 + i / 4) % 1; s += `<path d="M${(670 - k * 50).toFixed(1)} ${(548 + i * 6 - k * 10).toFixed(1)} q-10 -6 -20 0" opacity="${(1 - k).toFixed(2)}"/>`; }
    $('s9-puffs').innerHTML = s;
  };
  H['save-6-cip-line-break'] = (t, lt, a) => {
    const R = r => a.ref(r, 'save-6-cip-line-break');
    const v = R('s12-8~vent'), z = R('s12-8~zero');
    const f = 0.45 * (1 - a.ease.inOut(a.prog(t, v, Math.max(0.6, z - v))));
    const ang = Math.PI * 1.25 - f * Math.PI * 1.5;
    const n = $('s11-needle'); n.setAttribute('x2', (580 + 30 * Math.cos(ang)).toFixed(1)); n.setAttribute('y2', (160 - 30 * Math.sin(ang)).toFixed(1));
    const cool = a.prog(t, R('s12-8~cool'), 1.0), temp = $('s11-temp');
    temp.setAttribute('fill', cool > 0.5 ? 'var(--q1)' : 'var(--stop)'); temp.setAttribute('height', (62 - 40 * cool).toFixed(1)); temp.setAttribute('y', (280 + 40 * cool).toFixed(1));
    let s = ''; if (t > v && t < z) for (let i = 0; i < 5; i++) { const k = ((t - v) * 1.3 + i / 5) % 1; s += `<circle cx="820" cy="${(400 + k * 180).toFixed(1)}" r="6" opacity="${(1 - k * 0.6).toFixed(2)}"/>`; }
    $('s11-drops').innerHTML = s;
    const st = a.ease.inOut(a.prog(t, R('s12-5~step'), 0.8));
    $('s11-person').setAttribute('transform', `translate(${(130 * st).toFixed(1)},0)`);
  };
  H['close-recap'] = (t, lt, a) => {
    const end = a.scene('close-recap').end, fade = a.prog(t, end - 1.3, 1.1);
    ['header', 'progress-track', 'cap'].forEach(id => ($(id).style.opacity = (1 - fade).toFixed(3)));
  };
})();
