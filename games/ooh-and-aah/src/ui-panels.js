/* ============================================================
   ui-panels.js — UI_PANELS (panels module; see CONTRACT.md)
   #board    Desktop Festival board: 8 festival rows (targets via
             OOH.target, posted Headliner cards, the current-show
             marker, pass/miss from runStats.history, sponsored
             rings) and a log-y target-curve sparkline with the
             player's Applause dots.
   #showlog  Show log: the attributed breakdown of the last show,
             streamed from GAME 'present' events during RESOLVING
             and settled at 'result'. A side column at >= 1200 px;
             below that it presents as the 'showlog' bottom sheet
             when GAME.open('showlog') is called.
   Reads GAME.state and pure OOH helpers only; never mutates SIM
   state. Every cross-module call is guarded.
============================================================ */
const UI_PANELS = (() => {
  let G = null, boardEl = null, logEl = null, panel = null, P = null, mq = null, mo = null;
  let snap = null, lit = null, inFlight = false, log = null, histLen = -1, backdropOn = false, fixing = false;

  const SLOT = ['Twilight', 'Evening', 'Headliner'];
  const CNAME = {R: 'Red', A: 'Gold', G: 'Green', B: 'Blue', W: 'White', X: 'Rainbow'};
  const FEST0 = ['Spring Lanterns', 'May Fair', 'Midsummer', 'Regatta', 'Harvest Moon', 'Bonfire Night', 'Winter Lights', "New Year's Eve"];

  /* ---------- small helpers ---------- */
  const sim = () => (typeof OOH !== 'undefined' && OOH) || null;
  const data = () => (sim() && sim().DATA) || {};
  const call = (o, k, ...a) => { if (!o || typeof o[k] !== 'function') return undefined; try { return o[k](...a); } catch (e) { return undefined; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const cap = s => String(s || '').replace(/^./, c => c.toUpperCase());
  const isDesk = () => (mq ? mq.matches : window.innerWidth >= 1200);
  const reduced = () => !!(G && G.reducedMotion);
  const num = v => (typeof v === 'number' && isFinite(v) ? v : null);
  function row(tab, id) {
    if (!tab || id == null) return null;
    if (Array.isArray(tab)) return tab.find(r => r && (r.id === id || r.key === id)) || null;
    return tab[id] || null;
  }
  function fmt(n) {
    const r = call(sim(), 'fmt', n);
    if (r != null) return String(r);
    n = Math.floor(+n || 0); const a = Math.abs(n);
    if (a < 1e4) return n.toLocaleString('en-US');
    if (a >= 1e12) return n.toExponential(2).replace('+', '');
    for (const [d, u] of [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']]) if (a >= d) { const v = n / d; return (v >= 10 ? Math.floor(v) : Math.floor(v * 10) / 10) + u; }
    return String(n);
  }
  const fmtA = a => (a < 100 ? (Math.round(a * 10) / 10).toFixed(1) : fmt(Math.floor(a)));
  const fmtX = f => '×' + (Math.round(f * 100) / 100);

  /* ---------- data lookups (tolerant of array- or map-shaped tables) ---------- */
  // GAME.label (core) holds the shared name helpers; fall back to DATA lookups when it is absent.
  const label = (k, v) => { const L = G && G.label; if (L && typeof L[k] === 'function') { try { const r = L[k](v); if (r) return String(r); } catch (e) { /* fall through */ } } return null; };
  function festName(f) {
    if (f <= 8) { const n = label('festival', f); if (n && n !== 'Afterparty') return n; }
    const F = data().FESTIVALS;
    let r = F && (Array.isArray(F) ? F[f - 1] : (F.names ? F.names[f - 1] : F[f]));
    if (r && typeof r === 'object') r = r.name;
    return r || FEST0[f - 1] || 'Afterparty ' + (f - 8);
  }
  function showName(s) {
    const f = Math.floor(s / 3) + 1, k = s % 3;
    if (s === 23) return "New Year's Eve · Midnight Countdown";
    return festName(f) + ' ' + SLOT[k];
  }
  function hl(id) {
    const r = row(data().HEADLINERS, id) || row(data().TWISTS, id) || {};
    return {id, name: r.name || label('rule', id) || cap(id), rule: r.rule || r.text || r.desc || ''};
  }
  function shellName(id) { const r = row(data().SHELLS, id); return (r && r.name) || label('shell', id) || cap(id); }
  function fusionName(ev) {
    let n = ev.name || ev.fusion || ev.id || '';
    const r = row(data().FUSIONS, n);
    return (r && r.name) || (/>/.test(n) ? n.split('>').map(shellName).join(' → ') : cap(n));
  }
  function tgt(st, s) {
    const t = call(sim(), 'target', st, s);
    if (num(t) != null) return t;
    const T = data().TARGETS; return (T && T[s]) || 0;
  }
  const hist = st => (st && st.runStats && Array.isArray(st.runStats.history) ? st.runStats.history : []);
  const hIdx = e => (e.s != null ? e.s : e.show);
  function histMap(st) { const m = {}; for (const e of hist(st)) { const s = hIdx(e); (m[s] = m[s] || []).push(e); } return m; }
  const lastOf = a => a && a[a.length - 1];

  /* ---------- glyphs ---------- */
  const IC = {
    headwind: 'M2 7h9a3 3 0 1 0-3-3M2 11h13a3 3 0 1 1-3 3M2 15h6',
    drizzle: 'M10 2.5c3.2 4.2 5 7.2 5 10a5 5 0 0 1-10 0c0-2.8 1.8-5.8 5-10z',
    critic: 'M13 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0zM11.6 11.6l5.4 6',
    shortfuse: 'M3 17V7M7 17V7M11 17V7M14.5 7l4 10M18.5 7l-4 10',
    fog: 'M2 6q4-3 8 0t8 0M2 10.5q4-3 8 0t8 0M2 15q4-3 8 0t8 0',
    ordinance: 'M2.5 8h3l4.5-4v12l-4.5-4h-3zM13 7.5a3.5 3.5 0 0 1 0 5',
    windshift: 'M18 10H3.5M8 5.5 3.5 10 8 14.5',
    ferry: 'M2 12.5h16l-2.5 4h-11zM6 12.5V8h8v4.5M10 8V4.5',
    crossed: 'M2 5c6.5 0 9.5 10 16 10M2 15c6.5 0 9.5-10 16-10',
    streetlights: 'M6 18V4.5h6.5M12.5 4.5V7M9.5 7h6l-1 3h-4zM4 18h4',
    powercut: 'M11.5 2 5 11h5l-1.5 7L15 9h-5z',
    rival: 'M3 15.5h14M3 15.5 2 6l5 4 3-6 3 6 5-4-1 9.5',
    countdown: 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0zM10 5.5V10l3 2',
    _: 'M7.5 7.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M10 14.5v.5'
  };
  IC.countdown3 = IC.countdown;
  const icon = (id, cls) => `<svg class="${cls || 'pn-ic'}" viewBox="0 0 20 20" aria-hidden="true"><path d="${IC[id] || IC._}"/></svg>`;
  const WEDGE = (c, d) => `<path style="fill:var(--c-${c})" d="${d}"/>`;
  const SHAPE = {
    R: '<circle cx="8" cy="8" r="6.2"/>',
    A: '<path d="M8 1.6 14.8 13.8H1.2z"/>',
    G: '<rect x="2" y="2" width="12" height="12" rx="3"/>',
    B: '<path d="M8 1 15 8 8 15 1 8z"/>',
    W: '<path d="M6 1.5h4V6h4.5v4H10v4.5H6V10H1.5V6H6z"/>',
    X: WEDGE('R', 'M8 8V1a7 7 0 0 1 7 7z') + WEDGE('A', 'M8 8h7a7 7 0 0 1-7 7z') + WEDGE('G', 'M8 8v7a7 7 0 0 1-7-7z') + WEDGE('B', 'M8 8H1a7 7 0 0 1 7-7z')
  };
  const shape = c => `<svg class="pn-shape" data-col="${esc(c)}" viewBox="0 0 16 16" aria-hidden="true">${SHAPE[c] || SHAPE.W}</svg>`;

  /* =====================================================================
     FESTIVAL BOARD
  ===================================================================== */
  function renderBoard() {
    const st = G && G.state;
    if (!boardEl || !st) return;
    const s = st.show | 0, building = st.phase === 'build';
    const nF = (st.endless || s >= 24) ? 12 : 8, shows = nF * 3;
    const ctx = {st, s, curF: Math.floor(s / 3) + 1, building, hm: histMap(st)};
    let rows = '';
    for (let f = 1; f <= nF; f++) rows += festivalRow(ctx, f);
    const renown = st.renown | 0;
    const sub = st.phase === 'won' ? 'Happy New Year!' : st.phase === 'lost' ? 'The crowd went home' : `Show ${Math.min(s + 1, shows)} of ${shows}`;
    const oldList = boardEl.querySelector('.bd-list'), keep = oldList ? oldList.scrollTop : 0;
    boardEl.innerHTML = `<div class="bd">
<header class="bd-head"><h2 class="bd-title">The festival year</h2><p class="bd-sub"><span class="num">${esc(sub)}</span>${renown ? `<span class="bd-tag">Renown ${renown}</span>` : ''}${st.fairWeather ? '<span class="bd-tag">Fair Weather</span>' : ''}</p></header>
<div class="bd-cols" aria-hidden="true"><span>Twilight</span><span>Evening</span><span>Headliner</span></div>
<ol class="bd-list">${rows}</ol>
<section class="bd-curve" aria-label="Target curve">${spark(st, ctx.hm, shows, s, building)}</section>
</div>`;
    // keep the reader's scroll position; after each new result, bring tonight's festival into view
    const list = boardEl.querySelector('.bd-list'), nowRow = boardEl.querySelector('.bd-row.is-now');
    const played = hist(st).length;
    if (list) {
      list.scrollTop = keep;
      if (nowRow && played !== histLen) {
        const top = nowRow.offsetTop - list.offsetTop, bottom = top + nowRow.offsetHeight;
        if (top < list.scrollTop || bottom > list.scrollTop + list.clientHeight) list.scrollTop = Math.max(0, bottom - list.clientHeight + 8);
      }
    }
    histLen = played;
  }

  /* One festival: a single stamped line once it is over, else its three targets
     plus the posted Headliner card (current and next festival). */
  function festivalRow(c, f) {
    const {st, s, curF, building, hm} = c;
    const past = f < curF || (!building && f === curF && !!hm[f * 3 - 1]);
    const now = f === curF && !past;
    const posted = f <= curF + 1 || !building;
    const hlIds = f <= 8 ? [st.headliners && st.headliners[f - 1]] : ((st.endlessTwists && st.endlessTwists[f]) || []);
    const hls = hlIds.filter(Boolean).map(hl);
    const tw = f > 1 && f <= 8 && st.twilightTwists ? st.twilightTwists[f - 1] : null;
    const say = [];
    let cells = '', stamps = '';
    for (let k = 0; k < 3; k++) {
      const si = (f - 1) * 3 + k, e = lastOf(hm[si]);
      const isNow = building && si === s;
      const t = e && !isNow ? e.target : tgt(st, si);
      const sp = (e && e.sponsored) || (isNow && st.sponsor && st.sponsor.accepted);
      const twist = k === 0 && tw && posted ? hl(tw) : null;
      const lbl = `${SLOT[k]} ${fmt(t)}${sp ? ', sponsored' : ''}${e ? (e.pass ? ', passed with ' : ', missed with ') + fmt(e.applause || 0) : ''}${isNow ? ', tonight' : ''}${twist ? ', twist: ' + twist.name : ''}`;
      say.push(lbl);
      const state = e ? (e.pass ? 'is-pass' : 'is-miss') : '';
      if (past) {
        stamps += `<span class="bd-stamp ${state || 'is-skip'}${sp ? ' is-sp' : ''}" title="${esc(lbl)}">${e ? (e.pass ? '✓' : '✗') : '–'}</span>`;
      } else {
        const cls = ['bd-cell', state, isNow ? 'is-now' : '', sp ? 'is-sp' : '', !e && !isNow ? 'is-todo' : ''].filter(Boolean).join(' ');
        const mark = isNow ? '▸' : e ? (e.pass ? '✓' : '✗') : '';
        cells += `<div class="${cls}" title="${esc(lbl)}"><span class="bd-mk" aria-hidden="true">${mark}</span><span class="bd-t num">${fmt(t)}</span>${twist ? icon(tw, 'pn-ic bd-tw') : ''}</div>`;
      }
    }
    let mini = '', card = '';
    const names = hls.map(h => h.name).join(' + ');
    if (!hls.length || !posted) mini = `<span class="bd-hlmini is-sealed" title="Headliner not posted yet">${icon('_')}<span>Unposted</span></span>`;
    else if (past) mini = `<span class="bd-hlmini" title="${esc(names)}">${hls.map(h => icon(h.id)).join('')}</span>`;
    else if (f > curF + 1) mini = `<span class="bd-hlmini">${hls.map(h => icon(h.id)).join('')}<span>${esc(names)}</span></span>`;
    else card = hls.map(h => `<div class="bd-hl"><span class="bd-hl-ic">${icon(h.id)}</span><p class="bd-hl-tx"><b>${esc(h.name)}</b>${h.rule ? ` ${esc(h.rule)}` : ''}</p></div>`).join('');
    const aria = `Festival ${f}, ${festName(f)}${now ? ', tonight' : ''}. ${say.join('. ')}. Headliner: ${posted && hls.length ? names : 'not posted yet'}.`;
    const cls = past ? ' is-past' : now ? ' is-now' : ' is-future';
    return `<li class="bd-row${cls}" aria-label="${esc(aria)}"${now ? ' aria-current="step"' : ''}>
<div class="bd-name" aria-hidden="true"><span class="bd-num num">${f}</span><span class="bd-fest">${esc(festName(f))}</span>${mini}${stamps ? `<span class="bd-stamps">${stamps}</span>` : ''}</div>
${cells ? `<div class="bd-cells" aria-hidden="true">${cells}</div>` : ''}${card ? `<div aria-hidden="true">${card}</div>` : ''}</li>`;
  }

  /* log-y target curve (dashed step line) with Applause dots, drawn to scale */
  function spark(st, hm, n, s, building) {
    const box = boardEl.querySelector('.bd-curve');
    const W = Math.max(240, Math.round((box && box.clientWidth) || boardEl.clientWidth - 34 || 286)), H = 136;
    const L = 44, R = 8, T = 10, B = 26, pw = W - L - R, ph = H - T - B;
    const tg = [], dots = [];
    for (let i = 0; i < n; i++) { const e = lastOf(hm[i]); tg.push(e && !(building && i === s) ? e.target : tgt(st, i)); }
    for (const e of hist(st)) { const i = hIdx(e); if (i >= 0 && i < n) dots.push(e); }
    const vmax = Math.max(1, ...tg, ...dots.map(e => e.applause || 0));
    const lo = 40, hi = vmax * 1.6, l0 = Math.log10(lo), l1 = Math.log10(hi);
    const y = v => +(T + ph * (1 - (Math.log10(Math.max(lo, v)) - l0) / (l1 - l0))).toFixed(1);
    const x = i => +(L + pw * (i + 0.5) / n).toFixed(1), xe = i => +(L + pw * i / n).toFixed(1);
    let g = '';
    const decs = []; for (let d = 100; d <= hi; d *= 10) decs.push(d);
    const step = decs.length > 5 ? 2 : 1;
    decs.forEach((d, j) => { if (j % step) return; g += `<line class="sp-grid" x1="${L}" x2="${W - R}" y1="${y(d)}" y2="${y(d)}"/><text class="sp-lab" x="${L - 6}" y="${y(d) + 5}" text-anchor="end">${fmt(d)}</text>`; });
    const nf = n / 3, curF = Math.floor(s / 3);
    for (let f = 0; f < nf; f++) {
      if (f % 2) g += `<rect class="sp-band" x="${xe(f * 3)}" y="${T}" width="${(xe(f * 3 + 3) - xe(f * 3)).toFixed(1)}" height="${ph}"/>`;
      if (nf <= 8 || f % 2 === 0 || f === curF) g += `<text class="sp-lab sp-f${f === curF && building ? ' is-now' : ''}" x="${x(f * 3 + 1)}" y="${H - 6}" text-anchor="middle">${f + 1}</text>`;
    }
    let pDone = '', pNext = '';
    for (let i = 0; i < n; i++) {
      const seg = `${xe(i)} ${y(tg[i])}H${xe(i + 1)}`;
      if (i <= s) pDone += (pDone ? 'L' : 'M') + seg; else pNext += (pNext ? 'L' : `M${xe(i)} ${y(tg[i - 1] || tg[i])}L`) + seg;
    }
    g += `<path class="sp-tg" d="${pDone}"/><path class="sp-tg is-next" d="${pNext}"/>`;
    if (building && s < n) g += `<line class="sp-now" x1="${x(s)}" x2="${x(s)}" y1="${T}" y2="${T + ph}"/><circle class="sp-nowdot" cx="${x(s)}" cy="${y(tg[s])}" r="4.5"><title>Tonight: show ${s + 1}, target ${fmt(tg[s])}</title></circle>`;
    const last = dots.length - 1;
    dots.forEach((e, j) => {
      const i = hIdx(e), cx = x(i), cy = y(e.applause || 0), fresh = j === last && lit && lit.fresh ? ' is-new' : '';
      const tip = `<title>Show ${i + 1}, ${showName(i)}: Applause ${fmt(e.applause || 0)} vs ${fmt(e.target)}${e.pass ? ', passed' : ', missed'}${e.sponsored ? ', sponsored' : ''}${e.encore ? ', encore' : ''}</title>`;
      g += `<g class="sp-dot${fresh}">${tip}${e.sponsored ? `<circle class="sp-sp" cx="${cx}" cy="${cy}" r="8"/>` : ''}` +
        (e.pass ? `<circle class="sp-pass" cx="${cx}" cy="${cy}" r="4.5"/>`
          : `<path class="sp-halo" d="M${cx - 4.5} ${cy - 4.5}l9 9m0-9l-9 9"/><path class="sp-miss" d="M${cx - 4.5} ${cy - 4.5}l9 9m0-9l-9 9"/>`) + '</g>';
    });
    const passed = dots.filter(e => e.pass).length, anyMiss = dots.length > passed, anySp = dots.some(e => e.sponsored);
    const aria = `Target curve, log scale: ${n} shows from ${fmt(tg[0])} to ${fmt(tg[n - 1])}. ${dots.length ? `Your Applause on ${dots.length} show${dots.length > 1 ? 's' : ''}, ${passed} passed.` : 'No shows lit yet.'}`;
    const lg = `<span class="sp-lg"><svg viewBox="0 0 22 10" aria-hidden="true"><path class="sp-tg" d="M1 7H8V3H21"/></svg>Target</span>` +
      `<span class="sp-lg"><svg viewBox="0 0 12 12" aria-hidden="true"><circle class="sp-pass" cx="6" cy="6" r="4.5"/></svg>Applause</span>` +
      (anyMiss ? `<span class="sp-lg"><svg viewBox="0 0 12 12" aria-hidden="true"><path class="sp-miss" d="M1.5 1.5l9 9m0-9l-9 9"/></svg>Miss</span>` : '') +
      (anySp ? `<span class="sp-lg"><svg viewBox="0 0 18 18" aria-hidden="true"><circle class="sp-sp" cx="9" cy="9" r="7.5"/></svg>Sponsored</span>` : '');
    return `<h3 class="bd-h3">Target curve</h3><svg class="sp" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(aria)}">${g}</svg><p class="sp-legend">${lg}</p>`;
  }

  /* =====================================================================
     SHOW LOG — model
  ===================================================================== */
  function capture(st) {
    if (!st || !Array.isArray(st.tubes)) return null;
    const s = st.show | 0;
    return {
      s, crowd: st.crowd | 0, sponsored: !!(st.sponsor && st.sponsor.accepted), sponsor: st.sponsor || null,
      rules: call(sim(), 'rulesFor', st, s) || [], target: tgt(st, s),
      tubes: st.tubes.map(t => (t && t.shell ? {id: t.shell.id, col: t.shell.col, star: t.shell.star || 1, rig: t.rig || null} : {id: null, rig: t && t.rig || null})),
      fav: undefined
    };
  }
  function newLog(sn) {
    const L = {snap: sn, lines: [], cur: null, cheer: null, app: null, pay: null, notes: [], ooh: 0, aah: 1, done: false, live: true, fav: null, v: 0};
    if (sn) {
      if (sn.fav === undefined) {
        const tubes = sn.tubes.map(t => ({shell: t.id ? {id: t.id, col: t.col, star: t.star, uid: 0, paid: 0} : null, rig: t.rig}));
        const f = call(sim(), 'favourite', tubes, sn.crowd);
        sn.fav = num(f);
      }
      L.fav = sn.fav;
    }
    return L;
  }
  const vOf = ev => num(ev.v) ?? num(ev.value) ?? num(ev.amount) ?? num(ev.n) ?? 0;
  function item(L, it) {
    if (L.app) return;                     // payout-time gains (after the slam) are not part of the show
    if (!L.cur) { L.cur = {tube: null, pre: true, items: [], k: L.lines.length, v: 0}; L.lines.push(L.cur); }
    L.cur.items.push(it); L.cur.v++; L.cur.ooh = L.ooh; L.cur.aah = L.aah;
  }
  function reduce(L, ev) {
    if (!ev || !ev.type) return;
    L.v++;
    const t = ev.type;
    switch (t) {
      case 'burst': {
        if (L.app) break;
        const sh = ev.shell && typeof ev.shell === 'object' ? ev.shell : {id: ev.shell || ev.shellId || ev.id, star: ev.star, col: ev.col};
        const tube = num(ev.tube) ?? num(ev.t);
        const seen = ev.seen || ev.up || ev.vis || (Array.isArray(ev.sees) ? ev.sees : null);
        L.cur = {
          tube, id: sh.id, star: sh.star || ev.star || 1, col: ev.col || sh.col, rowCol: sh.col, shot: num(ev.shot) ?? num(ev.k), shots: num(ev.shots),
          sees: Array.isArray(seen) ? seen.length : (num(ev.sees) ?? 0), seen: Array.isArray(seen) ? seen : null,
          dud: !!ev.dud, half: !!ev.half, washed: !!ev.washed, items: [], k: L.lines.length, v: 0, ooh: L.ooh, aah: L.aah
        };
        L.lines.push(L.cur);
        break;
      }
      case 'fusion': item(L, {k: 'fusion', name: fusionName(ev), first: !!ev.first}); break;
      case 'gainOoh': { const v = vOf(ev); L.ooh += v; item(L, {k: 'ooh', v, src: ev.src || ev.from || null}); break; }
      case 'gainAah': { const v = vOf(ev); L.aah += v; item(L, {k: 'aah', v, src: ev.src || ev.from || null}); break; }
      case 'multAah': { const f = num(ev.factor) ?? num(ev.x) ?? 1; L.aah *= f; item(L, {k: 'x', v: f, src: ev.src || null}); break; }
      case 'clear': item(L, {k: 'clear', v: vOf(ev)}); break;
      case 'extend': item(L, {k: 'extend', v: vOf(ev) || 1, n: num(ev.bursts) ?? num(ev.count)}); break;
      case 'repeat': item(L, {k: 'repeat', from: ev.from, rate: num(ev.rate)}); break;
      case 'crowdGain': item(L, {k: 'crowd', v: vOf(ev)}); break;
      case 'coinGain': item(L, {k: 'coin', v: vOf(ev), src: ev.src || null}); break;
      case 'crowdCheer': { const v = vOf(ev); L.ooh += v; L.cheer = {v, half: !!(ev.half || ev.ferry)}; L.cur = null; break; }
      case 'applause': L.app = {ooh: num(ev.ooh), aah: num(ev.aah), score: num(ev.score) ?? num(ev.applause), target: num(ev.target), pass: !!ev.pass, encore: !!ev.encore}; L.cur = null; break;
      case 'payout': L.pay = ev; break;
      case 'rainCheck': L.notes.push({k: 'rain', text: 'Rain check used. Miss again and the season ends.'}); break;
      case 'relight': L.notes.push({k: 'relight', text: 'The crowd stays for one more! Relight the Countdown.'}); break;
      case 'runLost': L.notes.push({k: 'lost', text: 'The crowd went home.'}); break;
      case 'runWon': L.notes.push({k: 'won', text: 'Happy New Year!'}); break;
      default: L.v--;
    }
  }
  function settle(L, entry, summary) {
    if (entry) {
      const a = L.app || (L.app = {});
      if (num(entry.applause) != null) a.score = entry.applause;
      if (num(entry.ooh) != null) a.ooh = entry.ooh;
      if (num(entry.aah) != null) a.aah = entry.aah;
      if (num(entry.target) != null) a.target = entry.target;
      if ('pass' in entry) a.pass = !!entry.pass;
      if ('encore' in entry) a.encore = !!entry.encore;
      a.sponsored = !!entry.sponsored; a.relit = !!entry.relit;
      if (L.snap && hIdx(entry) != null && hIdx(entry) !== L.snap.s) { L.snap.s = hIdx(entry); L.snap.rules = entry.rules || L.snap.rules; }
      if (L.snap && Array.isArray(entry.rules)) L.snap.rules = entry.rules;
      if (L.snap) { L.snap.target = entry.target; L.snap.sponsored = !!entry.sponsored; }
    }
    if (summary && L.app && L.app.score == null && num(summary.applause) != null) { L.app.score = summary.applause; L.app.ooh = summary.ooh; L.app.aah = summary.aah; }
    L.done = true; L.live = false; L.cur = null;
  }
  /** Build a complete log from an event list (pure; also used by tests). */
  function buildLog(events, sn, entry, summary) {
    const L = newLog(sn);
    for (const ev of events || []) reduce(L, ev);
    if (entry || summary || L.app) settle(L, entry, summary);
    return L;
  }

  /* =====================================================================
     SHOW LOG — view
  ===================================================================== */
  function skeleton() {
    logEl.innerHTML = `<div class="sl-scrim" aria-hidden="true"></div>
<div class="sl-panel">
  <header class="sl-head"><div class="sl-title-row"><h2 class="sl-title">Show log</h2><span class="sl-live" hidden><i aria-hidden="true"></i>Live</span>
  <button type="button" class="btn sl-close" data-sl="close" aria-label="Close the show log">✕</button></div><div class="sl-meta"></div></header>
  <ol class="sl-lines" aria-label="Bursts, in firing order"></ol>
  <div class="sl-sum"></div>
  <div class="sl-foot"><button type="button" class="btn sl-book" data-sl="logbook">${icon('_', 'pn-ic sl-book-ic')}Logbook<kbd>L</kbd></button></div>
</div>`;
    panel = logEl.querySelector('.sl-panel');
    P = {meta: logEl.querySelector('.sl-meta'), lines: logEl.querySelector('.sl-lines'), sum: logEl.querySelector('.sl-sum'), live: logEl.querySelector('.sl-live')};
    const book = panel.querySelector('.sl-book-ic'); if (book) book.innerHTML = '<path d="M4 3.5h9.5a2 2 0 0 1 2 2V17H6a2 2 0 0 1-2-2zM4 15a2 2 0 0 1 2-2h9.5M7.5 7h5"/>';
    logEl.addEventListener('click', e => {
      const b = e.target.closest('[data-sl]');
      if (e.target.classList.contains('sl-scrim')) { closeSheet(); return; }
      if (!b) return;
      if (b.dataset.sl === 'close') closeSheet();
      else if (b.dataset.sl === 'logbook') { if (!isDesk()) closeSheet(); if (G && G.open) G.open('logbook'); }
    });
  }

  function metaHTML(L) {
    const sn = L && L.snap;
    if (!sn) {
      const st = G && G.state;
      if (!st || st.phase !== 'build') return '';
      return `<p class="sl-sub">Next up: <span class="num">Show ${(st.show | 0) + 1}</span> · ${esc(showName(st.show | 0))}</p>`;
    }
    const rules = (sn.rules || []).map(id => { const h = hl(id); return `<span class="sl-rule" title="${esc(h.rule)}">${icon(id)}${esc(h.name)}</span>`; }).join('');
    return `<p class="sl-sub"><span class="num">Show ${sn.s + 1}</span> · ${esc(showName(sn.s))}</p>
<p class="sl-tg"><span>Target <b class="num">${fmt(sn.target)}</b></span>${sn.sponsored ? '<span class="sl-sp">Sponsored ×1.5</span>' : ''}${rules}</p>`;
  }

  function seesText(ln) {
    if (ln.dud) return '';
    const names = ln.seen && ln.seen.map(b => (b && typeof b === 'object') ? shellName(b.shellId || b.id) : shellName(b)).filter(Boolean);
    if (names && names.length) return 'sees ' + (names.length <= 2 ? names.join(', ') : names.slice(0, 2).join(', ') + ' +' + (names.length - 2));
    return ln.sees ? 'sees ' + ln.sees : 'sees nothing';
  }
  function itemHTML(it, L) {
    switch (it.k) {
      case 'ooh': return `<span class="chip sl-c">+${fmt(it.v)} Ooh${it.src && it.src !== 'shell' ? ` <em>${esc(srcName(it.src))}</em>` : ''}</span>`;
      case 'aah': return `<span class="chip chip-aah sl-c">+${fmtA(it.v)} Aah${it.src && it.src !== 'shell' ? ` <em>${esc(srcName(it.src))}</em>` : ''}</span>`;
      case 'x': return `<span class="chip chip-x sl-c">${fmtX(it.v)} Aah</span>`;
      case 'fusion': return `<span class="chip chip-fusion sl-c">✦ ${esc(it.name)}${it.first ? ' <em>new</em>' : ''}</span>`;
      case 'clear': return `<span class="sl-t">clears ${it.v}</span>`;
      case 'extend': return `<span class="sl-t">+${it.v} Hang${it.n ? ' to ' + it.n : ''}</span>`;
      case 'repeat': return `<span class="sl-t">echo${it.from ? ' of ' + esc(Array.isArray(it.from) ? it.from.map(f => shellName(f && f.id || f)).join(', ') : shellName(it.from && it.from.id || it.from)) : ''}${it.rate ? ' ' + Math.round(it.rate * 100) + '%' : ''}</span>`;
      case 'crowd': return `<span class="sl-t sl-crowd">Crowd +${fmt(it.v)}</span>`;
      case 'coin': return `<span class="sl-t sl-coin">+$${it.v}${it.src ? ' ' + esc(srcName(it.src)) : ''}</span>`;
    }
    return '';
  }
  function srcName(src) { const r = row(data().RIGS, src); return (r && r.name) || (src === 'fusion' ? 'fusion' : src === 'echo' ? 'echo' : cap(src)); }

  function lineHTML(ln, L) {
    if (ln.pre) return `<div class="sl-chips">${ln.items.map(it => itemHTML(it, L)).join('')}</div>`;
    const col = ln.washed ? 'W' : (ln.col || 'W');
    const isFav = L.fav != null && ln.tube === L.fav;
    const name = shellName(ln.id);
    const star = ln.star > 1 ? `<span class="sl-star" aria-label="star ${ln.star}">${'•'.repeat(Math.min(3, ln.star))}</span>` : '';
    const cn = ln.washed ? 'washed White' : (col !== 'W' ? CNAME[col] || col : '');
    const shot = ln.shots > 1 && ln.shot != null ? ` <span class="sl-dim">${ln.shot + 1}/${ln.shots}</span>` : '';
    const flags = (ln.dud ? '<span class="sl-flag is-dud">dud</span>' : '') + (ln.half ? '<span class="sl-flag">½</span>' : '');
    const sees = seesText(ln);
    const chips = (sees ? `<span class="sl-sees">${esc(sees)}</span>` : '') + ln.items.map(it => itemHTML(it, L)).join('');
    const tot = `<span class="sl-run num" title="Running Ooh × Aah">${fmt(Math.floor(ln.ooh))}<i>×</i>${fmtA(ln.aah)}</span>`;
    return `<div class="sl-l1"><span class="sl-tube num">T${ln.tube != null ? ln.tube + 1 : '?'}</span>${shape(col)}<span class="sl-name">${esc(name)}${cn ? ` <span class="sl-col">(${esc(cn)})</span>` : ''}${star}${isFav ? ' <span class="sl-fav" title="Crowd Favourite">♛</span>' : ''}${shot}${flags}</span></div>
<div class="sl-chips">${chips || '<span class="sl-t">no score</span>'}${tot}</div>`;
  }

  function sumHTML(L) {
    if (!L) return '';
    let h = '';
    if (L.cheer) h += `<div class="sl-cheer"><span class="sl-cheer-ic" aria-hidden="true">${crowdGlyph()}</span><span>Crowd cheer${L.cheer.half ? ' <span class="sl-flag">½ Late Ferry</span>' : ''}</span><span class="chip sl-c">+${fmt(L.cheer.v)} Ooh</span></div>`;
    const a = L.app;
    if (a && a.score != null) {
      const t = a.target ?? (L.snap && L.snap.target);
      const ratio = t ? a.score / t : 0;
      const verdict = a.pass
        ? `<span class="sl-ok">✓ Pass ×${(Math.floor(ratio * 10) / 10).toFixed(1)}</span>${a.encore ? '<span class="sl-encore">Encore!</span>' : ''}`
        : `<span class="sl-bad">✗ ${fmt(Math.max(0, (t || 0) - a.score))} short</span>`;
      h += `<div class="sl-app ${a.pass ? 'is-pass' : 'is-miss'}">
<div class="sl-app-row"><span class="sl-app-lbl">Applause</span><span class="sl-app-n num">${fmt(a.score)}</span></div>
<div class="sl-app-eq num">= <span class="chip">Ooh ${fmt(Math.floor(a.ooh ?? L.ooh))}</span> × <span class="chip chip-aah">Aah ${fmtA(a.aah ?? L.aah)}</span></div>
<div class="sl-verdict">${verdict}<span class="sl-dim num">target ${fmt(t || 0)}</span></div>${payHTML(L.pay, a)}</div>`;
    } else if (L.live) {
      h += `<div class="sl-app is-pending"><div class="sl-app-row"><span class="sl-app-lbl">Applause</span><span class="sl-app-n num">…</span></div><div class="sl-app-eq num">Ooh ${fmt(Math.floor(L.ooh))} × Aah ${fmtA(L.aah)}</div></div>`;
    }
    for (const n of L.notes) h += `<p class="sl-note is-${n.k}">${esc(n.text)}</p>`;
    return h;
  }
  function payHTML(p, a) {
    if (!p || !a.pass) return '';
    const bits = [];
    const g = k => num(p[k]);
    if (g('base')) bits.push(`+$${p.base} show`);
    if (g('interest')) bits.push(`+$${p.interest} interest`);
    const spc = g('sponsorCoins') ?? (typeof p.sponsor === 'number' ? p.sponsor : null);
    if (spc) bits.push(`+$${spc} sponsor`);
    if (p.sponsor && typeof p.sponsor === 'object' && p.sponsor.kind) bits.push({coin: 'Brewery +$2', crowd: 'Gazette: Crowd +4', rare: 'Collector card next shop'}[p.sponsor.kind] || 'Sponsor paid');
    const cr = g('crowd') ?? g('crowdGain');
    if (cr) bits.push(`Crowd +${cr}`);
    if (!bits.length && g('coins')) bits.push(`+$${p.coins}`);
    return bits.length ? `<p class="sl-pay num">${bits.map(esc).join(' · ')}</p>` : '';
  }
  const crowdGlyph = () => '<svg viewBox="0 0 24 16" class="pn-ic"><path d="M5 15v-3a2.5 2.5 0 0 1 5 0v3M14 15v-3a2.5 2.5 0 0 1 5 0v3M7.5 7.5a2 2 0 1 0 0-.1M16.5 7.5a2 2 0 1 0 0-.1M3 6l2 3M21 6l-2 3"/></svg>';

  function paintLog(force) {
    if (!P) return;
    const L = log;
    P.meta.innerHTML = metaHTML(L);
    P.live.hidden = !(L && L.live);
    panel.classList.toggle('is-live', !!(L && L.live));
    if (!L || (!L.lines.length && !L.app)) {
      P.lines.innerHTML = `<li class="sl-empty">${emptyHTML()}</li>`;
      P.sum.innerHTML = L ? sumHTML(L) : lastSummaryHTML();
      return;
    }
    if (force || P.lines.querySelector('.sl-empty')) P.lines.innerHTML = '';
    const kids = P.lines.children;
    let added = null;
    L.lines.forEach((ln, i) => {
      let li = kids[i];
      if (!li) { li = document.createElement('li'); li.className = 'sl-line' + (L.live ? ' is-in' : ''); P.lines.appendChild(li); li._v = -1; added = li; }
      const key = ln.v + ':' + ln.items.length + ':' + (L.fav ?? '');
      if (li._v !== key) { li.innerHTML = lineHTML(ln, L); li._v = key; li.classList.toggle('is-fav', L.fav != null && ln.tube === L.fav); li.classList.toggle('is-dud', !!ln.dud); }
    });
    while (kids.length > L.lines.length) P.lines.lastChild.remove();
    P.sum.innerHTML = sumHTML(L);
    if (L.live && added) P.lines.scrollTo({top: P.lines.scrollHeight, behavior: reduced() ? 'auto' : 'smooth'});
  }
  function emptyHTML() {
    const again = hist(G && G.state).length > 0;
    return `<p class="sl-empty-h">${again ? 'Light the fuse to fill the log.' : 'The fuse hasn\'t been lit yet.'}</p><p>Every burst of your next show is itemised here: what it saw in the sky, the Ooh and Aah it added, fusions, multipliers, and the crowd's cheer.</p>`;
  }
  function lastSummaryHTML() {
    const e = lastOf(hist(G && G.state));
    if (!e) return '';
    return `<div class="sl-app ${e.pass ? 'is-pass' : 'is-miss'}"><div class="sl-app-row"><span class="sl-app-lbl">Last show ${hIdx(e) + 1}</span><span class="sl-app-n num">${fmt(e.applause || 0)}</span></div>
<div class="sl-verdict">${e.pass ? '<span class="sl-ok">✓ Pass</span>' : '<span class="sl-bad">✗ Missed</span>'}<span class="sl-dim num">target ${fmt(e.target)}</span></div></div>`;
  }

  /* ---------- sheet presentation (< 1200 px) ---------- */
  function syncSheet() {
    if (!logEl || fixing) return;
    fixing = true;
    const desk = isDesk();
    const open = !desk && !logEl.hidden && (logEl.classList.contains('is-sheet') || (G && typeof G.top === 'function' && G.top() === 'showlog'));
    if (desk && logEl.hidden) logEl.hidden = false;
    logEl.classList.toggle('is-sheet', open);
    if (panel) panel.classList.toggle('sheet', open);
    logEl.setAttribute('role', open ? 'dialog' : 'complementary');
    if (open) logEl.setAttribute('aria-modal', 'true'); else logEl.removeAttribute('aria-modal');
    fixing = false;
  }
  function setOpen(open) {
    if (!logEl) return;
    fixing = true;
    const desk = isDesk();
    if (desk) { logEl.hidden = false; logEl.classList.remove('is-sheet'); if (panel) panel.classList.remove('sheet'); }
    else { logEl.hidden = !open; logEl.classList.toggle('is-sheet', !!open); if (panel) panel.classList.toggle('sheet', !!open); }
    logEl.setAttribute('role', !desk && open ? 'dialog' : 'complementary');
    if (!desk && open) logEl.setAttribute('aria-modal', 'true'); else logEl.removeAttribute('aria-modal');
    fixing = false;
    if (open) {
      if (P) P.lines.scrollTop = 0;
      if (desk && panel) { panel.classList.remove('is-flash'); void panel.offsetWidth; panel.classList.add('is-flash'); }
      setTimeout(() => { if (logEl.contains(document.activeElement)) return; const b = logEl.querySelector(desk ? '.sl-book' : '.sl-close'); if (b) b.focus(); }, 0);
    }
  }
  function openSheet() { if (G && typeof G.open === 'function') G.open('showlog'); else setOpen(true); }
  function closeSheet() {
    if (G && typeof G.close === 'function' && (typeof G.top !== 'function' || G.top() === 'showlog')) G.close('showlog');
    setOpen(false);
  }
  function onMode() {
    const desk = isDesk();
    if (desk) {
      if (G && typeof G.top === 'function' && G.top() === 'showlog') { try { G.close('showlog'); } catch (e) {} }
      setOpen(false);
      attachBackdrop();
      renderBoard();
    } else setOpen(G && typeof G.top === 'function' && G.top() === 'showlog');
  }
  // GAME.boot() attaches canvas#backdrop when the page opens at desktop width; this covers a
  // window that grows into the desktop layout later.
  function attachBackdrop() {
    if (backdropOn || !isDesk() || typeof FX === 'undefined' || !FX || typeof FX.attachBackdrop !== 'function') return;
    const c = document.getElementById('backdrop');
    if (!c) return;
    try { FX.attachBackdrop(c); backdropOn = true; } catch (e) {}
  }

  /* ---------- GAME wiring ---------- */
  function startLive(events) {
    if (inFlight && log && log.live) return;
    inFlight = true;
    const now = capture(G && G.state);                 // core shows the pre-light state until the slam
    if (now && (!snap || now.s === snap.s)) snap = now;
    lit = {sn: snap, events: events || null, fresh: false};
    log = newLog(snap ? JSON.parse(JSON.stringify(snap)) : null);
    paintLog(true);
  }
  function onPresent(ev) {
    if (!ev || !ev.type) return;
    if (ev.type === 'buildOpen') return;
    if (!inFlight || !log || !log.live) { if (!/^(fuseLit|launch|burst)$/.test(ev.type)) return; startLive(null); }
    reduce(log, ev);
    paintLog(false);
  }
  function onResult(p) {
    p = p || {};
    const sn = (log && log.snap) || (lit && lit.sn) || (snap && JSON.parse(JSON.stringify(snap)));
    const evs = Array.isArray(p.events) ? p.events : (lit && lit.events);
    const streamed = !!(log && log.live && log.lines.length);
    log = evs ? buildLog(evs, sn, p.entry, p.summary) : (log ? (settle(log, p.entry, p.summary), log) : buildLog([], sn, p.entry, p.summary));
    inFlight = false;
    if (lit) lit.fresh = true;
    paintLog(!streamed);
    if (streamed && P) P.lines.scrollTop = P.lines.scrollHeight;
    renderBoard();
    if (lit) lit.fresh = false;
    snap = capture(G.state);
  }

  function init(game) {
    G = game;
    boardEl = document.getElementById('board');
    logEl = document.getElementById('showlog');
    if (!G || (!boardEl && !logEl)) return;
    mq = window.matchMedia ? window.matchMedia('(min-width: 1200px)') : null;
    if (logEl) {
      skeleton();
      if (typeof MutationObserver === 'function') { mo = new MutationObserver(syncSheet); mo.observe(logEl, {attributes: true, attributeFilter: ['hidden']}); }
    }
    snap = capture(G.state);
    log = null;
    const on = (n, f) => { if (typeof G.on === 'function') G.on(n, x => { try { f(x); } catch (e) { if (G.flags && G.flags.debug) console.error('[panels]', n, e); } }); };
    on('change', () => { if (!inFlight && G.ui !== 'RESOLVING') { snap = capture(G.state); renderBoard(); } });
    on('sim', p => { if (p && p.action && p.action.type === 'light') startLive(p.events); });
    on('ui', p => {
      if (!p) return;
      if (p.to === 'RESOLVING') startLive(lit && inFlight ? lit.events : null);
      else if (p.to === 'BUILD' || p.to === 'END') { if (inFlight && log && log.live && p.from !== 'RESOLVING') { inFlight = false; } if (!inFlight) { snap = capture(G.state); renderBoard(); } }
    });
    on('present', onPresent);
    on('result', onResult);
    on('runStart', () => { inFlight = false; lit = null; log = null; histLen = -1; snap = capture(G.state); paintLog(true); renderBoard(); });
    on('runEnd', () => { renderBoard(); });
    on('settings', p => { if (p && (p.key === 'highContrast' || p.key === 'reducedMotion')) renderBoard(); });
    on('overlay', p => { if (p && p.name === 'showlog') setOpen(!!p.open); });
    on('resize', () => { if (isDesk()) renderBoard(); });
    if (typeof G.onKey === 'function') G.onKey('showlog', e => {
      const k = e && (e.key || e);
      if (k === 'Escape' || k === 'Esc') { closeSheet(); return true; }
      return false;
    });
    if (mq) { const h = () => onMode(); if (mq.addEventListener) mq.addEventListener('change', h); else if (mq.addListener) mq.addListener(h); }
    backdropOn = isDesk();                             // already attached by GAME.boot()
    onMode();
    renderBoard();
    paintLog(true);
  }

  return {
    init,
    render() { renderBoard(); paintLog(true); },
    renderBoard,
    renderLog: () => paintLog(true),
    open: openSheet,
    close: closeSheet,
    buildLog,
    /** Test/debug view of the current Show log model. */
    log: () => (log ? {show: log.snap && log.snap.s, lines: log.lines.length, live: log.live, done: log.done, ooh: log.ooh, aah: log.aah, applause: log.app && log.app.score, pass: log.app && log.app.pass} : null)
  };
})();
