// Scene markup, part C: scenes 11–13, mounting, and per-frame hooks.
(function () {
  const { I, A, P, html, SAVES } = window.SC, SC = window.SC;

  // 11 ─ all four end in Go ─────────────────────────────────────────────────
  const calls = ['fix', 'stop', 'stop', 'fix'], why = ['A step in your procedure', 'Not authorized', 'Someone else’s<br>unfinished work', 'Your own gowning step'];
  html.push(SC.scene('all-four-end-in-go', '', `
    <div class="abs" style="inset:0" data-out="fade s11-1.end 0.4">
      ${A(0, 0, `<div class="h1">All four end in Go</div>`, 'data-in="up s11-1~all"')}
      <div class="abs" style="left:0;top:170px;display:flex;gap:40px">
        ${SAVES.map(([t, , q, ic], i) => `<div class="card" style="width:390px;height:420px;padding:22px;border-top:12px solid var(--${q});display:flex;flex-direction:column;align-items:center;gap:10px" data-in="pop ^0.1+${(i * 0.1).toFixed(2)} 0.4">
          <div style="font-size:48px;font-weight:850;color:var(--ink)">${i + 1}</div>${I(ic, '', 'width:64px;height:64px;flex:none;color:var(--ink)')}<div class="h4" style="font-size:32px;text-align:center">${t}</div>
          <span class="minibtn ${calls[i]}" style="font-size:24px;padding:8px 16px" data-in="pop ${calls[i] === 'fix' ? 's11-1~fix' : 's11-1~stop-0.2'}+${(i % 3 ? 0.15 : 0).toFixed(2)} 0.3">${calls[i] === 'fix' ? I('wrench') + 'Fix it' : I('phone') + 'Stop &amp; get help'}</span>
          <div style="font-size:22px;font-weight:700;text-align:center;color:var(--ink);min-height:52px" data-in="fade ${calls[i] === 'fix' ? 's11-1~fix' : 's11-1~stop'}+0.4 0.4">${why[i]}</div>
          <span class="minibtn go" style="font-size:24px;padding:8px 18px" data-in="pop s11-1~all+${(i * 0.13).toFixed(2)} 0.3">${I('check')}Go</span></div>`).join('')}
      </div>
    </div>
    <div class="abs" style="inset:0" data-in="fade s11-1.end+0.3 0.5">
      ${A(0, 0, `<div class="h1">Most pauses end in Go</div>`)}
      
      <svg id="a4-ticks" class="abs" style="left:40px;top:300px;overflow:visible" width="1600" height="240" viewBox="0 0 1600 240"></svg>
      ${A(40, 540, `<div style="display:flex;gap:12px;align-items:center;font-size:26px;font-weight:700"><span style="width:30px;height:30px;border-radius:50%;background:var(--go)"></span>Four saves, among all the pauses that simply ended in Go</div>`)}
    </div>
  `));

  // 12 ─ what leaders commit to (dark), with the response shown, not just listed ──────────────────────────────────────
  html.push(SC.scene('what-makes-it-work', 'dark', `
    <div class="abs" style="inset:0" data-out="fade s12-2 0.4">
      ${A(140, 120, `<div class="tile" style="--on:1;width:300px;height:280px">${I('hand')}<div class="w">STOP</div></div>`, 'data-in="pop s12-1 0.5"')}
      <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
        <g data-in="fade s12-1~staff 0.5">${P(600, 600, 320)}</g>
        <g data-in="fade s12-1~contractor 0.5">${P(760, 600, 320)}<g style="color:var(--amber)"><svg x="726" y="230" width="68" height="68"><use href="#i-helmet"/></svg></g></g>
      </svg>
      ${A(880, 140, `<div class="h2">Anyone can stop a job</div>`, 'data-in="up s12-1+0.2"')}
      ${A(880, 240, `<div class="h4 muted">Staff or contractor</div>`, 'data-in="up s12-1~contractor"')}
      ${A(880, 300, `<div style="display:flex;gap:12px;align-items:center">${I('clock', '', 'width:40px;height:40px;color:var(--amber)')}<span class="h4 muted">Even on a late batch</span></div>`, 'data-in="up s12-1~late"')}
      ${A(880, 400, `<div class="h3" style="color:var(--amber)">No punishment · No blame</div>`, 'data-in="up s12-1~punishment"')}
      ${A(880, 480, `<div style="font-size:28px;font-weight:700;line-height:1.3;color:var(--ink)">Stop the task. Running processes are stopped only through your operating procedures.</div>`, 'data-in="fade s12-1~punishment+0.6"', 'width:720px')}
    </div>
    <div class="abs" style="inset:0" data-in="fade s12-2 0.4" data-out="fade s12-3 0.4">
      ${A(0, 0, `<div class="h2">Leaders commit to</div>`, 'data-in="up s12-2"')}
      <svg class="abs" style="left:0;top:0;overflow:visible" width="1680" height="772" viewBox="0 0 1680 772">
        <g>${P(160, 640, 320)}</g><g data-in="left s12-2~come 0.6">${P(400, 640, 340, { vest: 'var(--q3)' })}</g>
        <text x="160" y="690" text-anchor="middle" font-size="24" font-weight="700" fill="var(--muted)">You</text>
        <text x="400" y="690" text-anchor="middle" font-size="24" font-weight="700" fill="var(--muted)" data-in="fade s12-2~come 0.4">Your lead</text>
      </svg>
      ${A(60, 250, I('hand', '', 'width:70px;height:70px;color:var(--amber)'), 'data-in="pop s12-2 0.3"')}
      ${A(40, 140, `<div style="width:430px;display:flex;justify-content:flex-end"><div class="bubble right lightvars" style="color:var(--ink)">Thanks. What did you see?</div></div>`, 'data-in="pop s12-2~thank 0.35" data-out="fade s12-2~tell-0.2 0.3"')}
      ${A(40, 140, `<div style="width:430px;display:flex;justify-content:flex-end"><div class="bubble right lightvars" style="color:var(--ink)">Fixed. Here’s what changed.</div></div>`, 'data-in="pop s12-2~tell 0.35"')}
      <div class="abs" style="left:700px;top:150px;display:flex;flex-direction:column;gap:22px">
        ${[['clock', 'Come quickly', 'come'], ['check', 'Thank you', 'thank'], ['wrench', 'Fix the cause', 'fix'], ['ask', 'Tell you what changed', 'tell']].map(([ic, l, w]) =>
          `<div class="block" style="width:700px;background:var(--panel)" data-in="up s12-2~${w}">${I(ic, '', 'color:var(--q3)')}${l}</div>`).join('')}
      </div>
    </div>
    <div class="abs" style="inset:0" data-in="fade s12-3 0.4">
      ${A(160, 160, `<div style="position:relative;color:var(--muted)">${I('form', '', 'width:240px;height:240px')}<svg class="abs" style="left:-20px;top:-10px" width="280" height="260"><path d="M20 240 L260 20" stroke="var(--dim)" stroke-width="10" stroke-linecap="round" pathLength="1" data-in="draw s12-3+0.3 0.5"/></svg></div>`)}
      ${A(160, 450, `<div class="h2">Not a form</div>`, 'data-in="up s12-3~form"')}
      ${A(760, 230, `<div style="display:flex;align-items:center;gap:26px">${I('mag', '', 'width:110px;height:110px;color:var(--ink)')}<span style="font-size:60px;color:var(--muted)">→</span>${I('doc', '', 'width:120px;height:120px;color:var(--q3)')}</div>`, 'data-in="fade s12-3~report 0.5"')}
      ${A(760, 450, `<div class="h3">Report what you caught the usual way</div>`, 'data-in="up s12-3~report"')}
    </div>
  `));

  // 13 ─ recap card (all five triggers named), the voiced "find out who you call" slate, end card ───────────────────────────
  html.push(SC.scene('close-recap', 'dark', `
    <div class="abs lightvars" style="left:60px;top:8px;width:1560px;height:716px;border-radius:30px;background:#fbf9f4;padding:30px 50px">
      <div style="display:flex;align-items:center;gap:22px" data-in="fade ^0.2 0.6">${I('watch', '', 'width:70px;height:70px;color:var(--amber)')}<div class="h2">The 2-Minute Rule</div><div class="h3" style="color:var(--q3);margin-left:20px">Line clearance for people</div></div>
      <div class="abs" style="left:50px;top:130px;display:flex;gap:20px">
        ${[['STOP', 'hand', 's13-1~stop'], ['LOOK', 'eye', 's13-1~look'], ['ASK', 'ask', 's13-2'], ['DECIDE', 'sign', 's13-4~decide']].map(([w, ic, r]) => `<div class="pill" style="font-size:28px;padding:12px 26px;gap:14px" data-in="pop ${r} 0.4">${I(ic, '', 'width:34px;height:34px')}${w}</div>`).join('')}
      </div>
      <div class="abs" style="left:50px;top:640px;width:1460px;display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:24px;font-weight:800;color:var(--muted)" data-in="fade s13-1 0.4">PAUSE:</div>
        ${['start', 'break', 'handover', 'interruption', 'change'].map(k => `<div class="pill" style="font-size:24px;padding:8px 20px;gap:10px;border-color:var(--amber)" data-in="pop s13-1~${k} 0.35">${I(SC.TRIG[k][0], '', 'width:28px;height:28px;color:var(--amber-text)')}${SC.TRIG[k][1]}</div>`).join('')}
      </div>
      <div class="abs" style="left:50px;top:212px;display:grid;grid-template-columns:720px 720px;gap:12px 20px">
        ${[0, 1, 2, 3].map(i => `<div data-in="pop ${['s13-2~what\'s', 's13-2~could', 's13-3', 's13-3~what'][i]} 0.4">${SC.qcard(i, 'padding:15px 24px')}</div>`).join('')}
      </div>
      <div class="abs" style="left:0;top:452px;width:1560px;display:flex;justify-content:center">${SC.btns(['', '', ''], ['data-in="pop s13-4~go 0.4"', 'data-in="pop s13-4~fix 0.4"', 'data-in="pop s13-4~stop 0.4"'],
        ['', '<div class="small" style="margin:10px 18px 0;text-align:center;font-weight:700;color:var(--ink)" data-in="fade s13-5~only">Only if trained,<br>authorized &amp; in procedure</div>', '<div class="small" style="margin:10px 18px 0;text-align:center;font-weight:700;color:var(--ink)" data-in="fade s13-4~help+0.3">No permit yet · someone else’s unfinished work<br>not authorized · not sure → your lead</div>'])}</div>
    </div>
    <div class="abs lightvars" style="inset:-110px -120px -198px -120px;background:#fbf9f4" data-in="up s13-7-0.5 0.6">
      <div class="abs" style="left:240px;top:170px;width:1440px">
        <div class="kicker">Your site · before your next shift</div>
        <div class="h2" style="margin-top:14px">Who do you call for help?</div>
        <div style="margin-top:26px;display:flex;flex-direction:column;gap:18px;font-size:34px;font-weight:650">
          ${[['people', 'Your lead: days'], ['clock', 'Your lead: nights'], ['clock', 'Your lead: weekends'], ['radio', 'Radio or phone'], ['phone', 'No answer? Call'], ['doc', 'Report what I caught to']].map(([ic, t]) => `<div style="display:flex;align-items:flex-end;gap:16px">${I(ic, '', 'width:44px;height:44px;color:var(--q1)')}<span>${t}:</span><span style="flex:none;width:420px;border-bottom:4px solid var(--line);height:40px"></span></div>`).join('')}
        </div>
        <div class="h4" style="margin-top:34px;display:flex;align-items:center;gap:14px;color:var(--amber-text)">${I('form', '', 'width:44px;height:44px')}Write it on your pocket card.</div>
      </div>
    </div>
    <div class="abs lightvars" style="inset:-110px -120px -198px -120px;background:#fbf9f4" data-in="up s13-8-0.6 0.6">
      <div class="abs" style="left:200px;top:140px;width:1520px">
        <div class="h4">Follow your site’s procedures. This video is awareness training only: not lockout, solvent-bonding, forklift-operator or potent-compound handling training.</div>
        <div class="kicker" style="margin-top:34px">Sources</div>
        <ol style="margin:16px 0 0;padding-left:34px;font-size:25px;line-height:1.5;color:var(--ink)">
          <li>21 CFR 211.130(e), packaging and labeling operations (line clearance)</li>
          <li>OSHA 29 CFR 1910.147, control of hazardous energy (lockout/tagout), including (e)(3) on removing another person’s lock</li>
          <li>OSHA 29 CFR 1910.106(e)(6)(ii) and NFPA 77, <i>Recommended Practice on Static Electricity</i> (bonding before dispensing flammable liquids)</li>
          <li>OSHA 29 CFR 1910.178(l), powered industrial truck operator training, and (m)(2), no one under raised forks</li>
          <li>NIOSH skin-exposure guidance: wash skin with soap and water</li>
        </ol>
        <div class="srcline" style="margin-top:24px">Use cases are illustrative composites, not real incidents. Narration is a synthesized voice.</div>
      </div>
    </div>
    <div class="abs" style="inset:-110px -120px -198px -120px;background:#000" data-in="fade $1.3 1.1"></div>
  `));

  document.getElementById('stage').innerHTML = html.join('\n');
  window.CHAPTER_MARKS = [['s13-7-0.5', 'close-recap', 'Your site'], ['s13-8-0.6', 'close-recap', 'Sources']];
  window.CHROME_LIGHT = [['s13-7-0.5', 'close-recap']];

  // ---------- per-frame hooks ----------
  const H = window.HOOKS = window.HOOKS || {};
  const $ = id => document.getElementById(id);
  H['*'] = (t) => { document.querySelectorAll('.throb').forEach(el => { el.style.transform = `scale(${(1 + 0.06 * Math.sin(t * 7)).toFixed(4)})`; }); };
  // one shift of pauses: a dense run of small ticks (each a pause that ended in Go), the break (cup), and four larger
  // rings at the saves. savesGo: the rings are solid green (after the saves were resolved).
  const N = 99, X = i => 10 + i * 16, MARKS = SAVES.map(s => Math.round(s[4] * (N - 1)));
  function ticks(id, t, t0, savesGo, pulse = 0) {
    const el = $(id); if (!el) return;
    let s = `<path d="M0 100 H1600" stroke="var(--line)" stroke-width="6"/>
      <text x="0" y="170" font-size="22" font-weight="750" fill="var(--muted)">Start of shift</text><text x="1600" y="170" text-anchor="end" font-size="22" font-weight="750" fill="var(--muted)">End of shift</text>
      <g style="color:var(--muted)"><svg x="${X(Math.round(SC.CUP * (N - 1))) - 18}" y="30" width="36" height="36"><use href="#i-cup"/></svg></g>`;
    for (let i = 0; i < N; i++) {
      const x = X(i), on = t > t0 + i * 0.022;
      if (MARKS.includes(i)) s += savesGo ? `<circle cx="${x}" cy="100" r="17" fill="var(--go)"/>` : `<circle cx="${x}" cy="100" r="${(17 + 7 * pulse).toFixed(1)}" fill="var(--panel)" stroke="var(--amber)" stroke-width="5"/>`;
      else if (Math.abs(i - Math.round(SC.CUP * (N - 1))) > 1) s += `<rect x="${x - 4}" y="86" width="8" height="28" rx="3" fill="${on ? 'var(--go)' : 'var(--line)'}"/>`;
    }
    el.innerHTML = s;
  }
  H['title-open'] = (t, lt, a) => ART.setStopwatch('sw1', a.ease.inOut(a.prog(t, a.ref('s1-3.end+0.3', 'title-open'), 1.4)), false);
  H['the-rule'] = (t, lt, a) => { ART.setStopwatch('sw2', 1, false); const e = $('sw2'); if (e) e.querySelector('.sw-txt').style.opacity = (1 - a.prog(t, a.ref('s2-3~guide', 'the-rule'), 0.6)).toFixed(3); };
  H['line-clearance'] = (t, lt, a) => {
    ART.setStopwatch('sw3', 1, false);
    const m = $('lc-mag'), s = a.ref('s3-1+0.2', 'line-clearance'), e = a.ref('s3-1.end-0.3', 'line-clearance');
    m.style.transform = `translateX(${(a.prog(t, s, e - s) * 1300).toFixed(1)}px)`;
    m.style.opacity = Math.min(a.prog(t, s, 0.3), 1 - a.prog(t, e, 0.4)).toFixed(3);
    const out = a.prog(t, e - 0.3, 0.6);
    ['lc-left0', 'lc-left1', 'lc-left2'].forEach(id => { const g = $(id); g.style.opacity = (1 - out).toFixed(3); g.style.transform = `translateY(${(-60 * out).toFixed(1)}px)`; });
  };
  H['routine-go'] = (t, lt, a) => {
    const R = r => a.ref(r, 'routine-go');
    const k = a.prog(t, R('s5-3~tested'), 0.8), lift = -10 * Math.sin(Math.PI * k);           // the roll lifts a finger's width and settles
    const low = 40 * a.ease.inOut(a.prog(t, R('s5-5'), 0.5));                                   // on Go the roll is lowered to carry it low
    $('rg-roll').setAttribute('transform', `translate(0 ${(lift + low).toFixed(2)})`);
    const go = a.ease.inOut(a.prog(t, R('s5-5+0.6'), 3.2)) * 200;                              // then rolls off slowly toward the unwind
    $('rg-lifter').setAttribute('transform', `translate(${go.toFixed(1)} 0)`); $('rg-person').setAttribute('transform', `translate(${go.toFixed(1)} 0)`);
    $('rg-grip').setAttribute('transform', `translate(${go.toFixed(1)} ${low.toFixed(2)})`);
  };
  H['four-saves'] = (t, lt, a) => {
    const p = a.prog(t, a.ref('s6-2~catches', 'four-saves'), 1.2);  // the four "caught something" rings pulse on "catches"
    ticks('ss-ticks', t, a.ref('s6-1+0.3', 'four-saves'), false, p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0);
  };
  H['save-2-material-handling'] = (t, lt, a) => {
    const dx = -564 * a.ease.inOut(a.prog(t, a.ref('s8-10+0.4', 'save-2-material-handling'), 3.0));  // your truck glides under the pallet
    $('s8-mover').setAttribute('transform', `translate(${dx.toFixed(1)} 0)`);
  };
  H['save-3-die-cutter-lock'] = (t, lt, a) => {
    const R = r => a.ref(r, 'save-3-die-cutter-lock');
    const go = a.ease.inOut(a.prog(t, R('s9-8~finishes'), 0.9)), back = a.ease.inOut(a.prog(t, R('s9-8~removes+0.4'), 0.7));
    $('s9-tech').setAttribute('transform', `translate(${(-200 * (go - back)).toFixed(1)} 0)`);
  };
  H['save-4-potent-ppe'] = (t, lt, a) => {
    const R = r => a.ref(r, 'save-4-potent-ppe');
    const away = a.ease.inOut(a.prog(t, R('s10-6~gloves+0.3'), 1.2)), back = a.ease.inOut(a.prog(t, R('s10-8~go-0.9'), 0.9));
    $('s10-you').setAttribute('transform', `translate(${(-125 * (away - back)).toFixed(1)} 0)`);
  };
  H['all-four-end-in-go'] = (t, lt, a) => ticks('a4-ticks', t, a.ref('s11-1.end+0.4', 'all-four-end-in-go') - 3, true);
  H['close-recap'] = (t, lt, a) => {
    const end = a.scene('close-recap').end, fade = a.prog(t, end - 1.3, 1.1);
    ['header', 'progress-track', 'cap'].forEach(id => ($(id).style.opacity = (1 - fade).toFixed(3)));
  };
})();
