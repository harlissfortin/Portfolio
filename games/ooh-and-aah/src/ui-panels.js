/* ============================================================
   ui-panels.js — UI_PANELS (panels module; see CONTRACT.md)

   #board    Desktop Festival board (left column, >= 1200 px):
             one row per festival with its Twilight / Evening /
             Headliner targets (OOH.target), pass/miss per show from
             runStats.history, sponsored rings, the current-show
             marker and the posted Headliner cards; below them a
             log-y target-curve sparkline with the Applause dots.
   #showlog  Show log: the attributed breakdown of the last show,
             one line per burst, built from the §9 resolution trace.
             It streams in sync with GAME 'present' events during
             RESOLVING and settles at 'result'. A side column at
             >= 1200 px; below that it presents as the 'showlog'
             bottom sheet when GAME.open('showlog') is called.

   Reads GAME.state and pure OOH helpers only; never mutates SIM
   state. Every cross-module call is guarded.
============================================================ */
const UI_PANELS = (() => {
  let G = null;                                   // GAME
  let boardEl = null, logEl = null, panel = null, P = null, mq = null;
  let snap = null;        // the build as last seen (pre-light), for the log header and ♛
  let lit = null;         // the show being resolved: {sn, events, fresh}
  let inFlight = false;   // between light and the slam: the board holds still (no spoilers)
  let log = null;         // the Show log model (see newLog)
  let histLen = -1, backdropOn = false, syncing = false;

  const SLOT = ['Twilight', 'Evening', 'Headliner'];
  const CNAME = {R: 'Red', A: 'Gold', G: 'Green', B: 'Blue', W: 'White', X: 'Rainbow'};
  const FEST0 = ['Spring Lanterns', 'May Fair', 'Midsummer', 'Regatta', 'Harvest Moon', 'Bonfire Night', 'Winter Lights', "New Year's Eve"];

  /* ---------- small helpers ---------- */
  const sim = () => (typeof OOH !== 'undefined' && OOH) || null;
  const data = () => (sim() && sim().DATA) || {};
  const call = (o, k, ...a) => {
    if (!o || typeof o[k] !== 'function') return undefined;
    try { return o[k](...a); } catch (e) { return undefined; }
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const cap = s => String(s || '').replace(/^./, c => c.toUpperCase());
  const num = v => (typeof v === 'number' && isFinite(v) ? v : null);
  const isDesk = () => (mq ? mq.matches : window.innerWidth >= 1200);
  const reduced = () => !!(G && G.reducedMotion);
  const lastOf = a => a && a[a.length - 1];
  const clone = v => (v == null ? v : JSON.parse(JSON.stringify(v)));
  // Scroll lists fade only at an edge that has more content beyond it.
  function edges(el) {
    if (!el) return;
    el.classList.toggle('fade-t', el.scrollTop > 2);
    el.classList.toggle('fade-b', el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }
  function watchEdges(el) {
    if (!el || el._edges) return;
    el._edges = true;
    el.addEventListener('scroll', () => edges(el), {passive: true});
  }
  function row(tab, id) {
    if (!tab || id == null) return null;
    if (Array.isArray(tab)) return tab.find(r => r && (r.id === id || r.key === id)) || null;
    return tab[id] || null;
  }
  // §8.5 number format (OOH.fmt), with a local fallback.
  function fmt(n) {
    const r = call(sim(), 'fmt', n);
    if (r != null) return String(r);
    n = Math.floor(+n || 0);
    const a = Math.abs(n);
    if (a < 1e4) return n.toLocaleString('en-US');
    for (const [d, u] of [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']]) {
      if (a >= d) { const v = n / d; return (v >= 10 ? Math.floor(v) : Math.floor(v * 10) / 10) + u; }
    }
    return String(n);
  }
  function tubeCount(L) {
    const n = ((L.snap && L.snap.tubes) || []).length;
    if (n) return n;
    let m = 0;
    for (const ln of L.lines) if (ln.tube != null) m = Math.max(m, ln.tube + 1);
    return m || 'the last tube';
  }
  // Aah: 1 decimal below 100, none above (§3.1).
  const fmtA = a => { const r = call(sim(), 'fmtAah', a); return r != null ? String(r) : a < 100 ? (Math.floor(a * 10) / 10).toFixed(1) : fmt(a); };
  const fmtX = f => '×' + String(Math.round(f * 100) / 100);

  /* ---------- names (GAME.label and OOH.DATA; tolerant of array- or id-keyed tables) ---------- */
  const label = (k, v) => {
    const L = G && G.label;
    if (!L || typeof L[k] !== 'function') return null;
    try { const r = L[k](v); return r ? String(r) : null; } catch (e) { return null; }
  };
  function festName(f) {
    const F = data().FESTIVALS;
    let r = Array.isArray(F) ? F[f - 1] : null;
    if (r && typeof r === 'object') r = r.name;
    return r || (f <= 8 && label('festival', f)) || FEST0[f - 1] || 'Afterparty ' + (f - 8);
  }
  function showName(s) {
    const r = call(sim(), 'showName', s);
    if (r) return String(r);
    return s === 23 ? 'Midnight Countdown' : festName(Math.floor(s / 3) + 1) + ' ' + SLOT[s % 3];
  }
  function hl(id) {
    const D = data(), r = row(D.RULE_INFO, id) || row(D.HEADLINERS, id) || {};
    return {id, name: r.name || label('rule', id) || cap(id), rule: r.text || r.rule || call(sim(), 'describeRule', id) || ''};
  }
  const shellName = id => { const r = row(data().SHELLS, id); return (r && r.name) || label('shell', id) || cap(id); };
  const rigName = id => { const r = row(data().RIGS, id); return (r && r.name) || cap(id); };
  function tgt(st, s) {
    const t = call(sim(), 'target', st, s);
    if (num(t) != null) return t;
    const T = data().TARGETS;
    return (T && T[s]) || 0;
  }
  const hist = st => (st && st.runStats && Array.isArray(st.runStats.history) ? st.runStats.history : []);
  const hIdx = e => (e.s != null ? e.s : e.show);       // history entries carry the 0-based show index
  function histMap(st) {
    const m = {};
    for (const e of hist(st)) (m[hIdx(e)] = m[hIdx(e)] || []).push(e);
    return m;
  }

  /* ---------- glyphs (inline SVG, currentColor) ---------- */
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
    book: 'M4 3.5h9.5a2 2 0 0 1 2 2V17H6a2 2 0 0 1-2-2zM4 15a2 2 0 0 1 2-2h9.5M7.5 7h5',
    _: 'M7.5 7.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M10 14.5v.5'
  };
  IC.countdown3 = IC.countdown;
  const icon = (id, cls) => `<svg class="${cls || 'pn-ic'}" viewBox="0 0 20 20" aria-hidden="true"><path d="${IC[id] || IC._}"/></svg>`;
  const crowdIcon = '<svg class="pn-ic" viewBox="0 0 24 16" aria-hidden="true"><path d="M5 15v-3a2.5 2.5 0 0 1 5 0v3M14 15v-3a2.5 2.5 0 0 1 5 0v3M7.5 7.5a2 2 0 1 0 0-.1M16.5 7.5a2 2 0 1 0 0-.1M3 6l2 3M21 6l-2 3"/></svg>';
  // §4.1 colour shapes: ● Red, ▲ Gold, ■ Green, ◆ Blue, ✚ White, ✺ Rainbow (4 wedges).
  const wedge = (c, d) => `<path style="fill:var(--c-${c})" d="${d}"/>`;
  const SHAPE = {
    R: '<circle cx="8" cy="8" r="6.2"/>',
    A: '<path d="M8 1.6 14.8 13.8H1.2z"/>',
    G: '<rect x="2" y="2" width="12" height="12" rx="3"/>',
    B: '<path d="M8 1 15 8 8 15 1 8z"/>',
    W: '<path d="M6 1.5h4V6h4.5v4H10v4.5H6V10H1.5V6H6z"/>',
    X: wedge('R', 'M8 8V1a7 7 0 0 1 7 7z') + wedge('A', 'M8 8h7a7 7 0 0 1-7 7z') + wedge('G', 'M8 8v7a7 7 0 0 1-7-7z') + wedge('B', 'M8 8H1a7 7 0 0 1 7-7z')
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
    // Re-rendering replaces the board: keep keyboard focus on the same control (or the list).
    const fEl = document.activeElement, hadFocus = fEl && boardEl.contains(fEl) ? (fEl.dataset && fEl.dataset.bd) || (fEl.classList.contains('bd-list') ? 'list' : null) : null;
    boardEl.innerHTML = `<div class="bd${showScores ? ' is-scores' : ''}">
<header class="bd-head"><h2 class="bd-title">Your run</h2><p class="bd-sub"><span class="num">${esc(sub)}</span>${renown ? `<span class="bd-tag">Renown ${renown}</span>` : ''}${st.fairWeather ? '<span class="bd-tag">Fair Weather</span>' : ''}<button type="button" class="bd-scores" data-bd="scores" aria-pressed="${showScores}">Scores</button></p></header>
<div class="bd-cols" aria-hidden="true"><span>Twilight</span><span>Evening</span><span>Headliner</span></div>
<ol class="bd-list" tabindex="0" aria-label="Festivals">${rows}</ol>
<section class="bd-curve" aria-label="Target curve">${spark(st, ctx.hm, shows, s, building)}</section>
</div>`;
    // First paint (or a new width): redraw the curve at the width it actually got.
    const curve = boardEl.querySelector('.bd-curve'), svg = curve && curve.querySelector('svg.sp'), cw = curveW(curve);
    if (svg && cw && cw !== svg.width.baseVal.value) curve.innerHTML = spark(st, ctx.hm, shows, s, building, cw);
    // Keep the reader's scroll position; after each new result bring tonight's festival into view.
    const list = boardEl.querySelector('.bd-list'), nowRow = boardEl.querySelector('.bd-row.is-now');
    const played = hist(st).length;
    if (list) {
      list.scrollTop = keep;
      if (nowRow && played !== histLen) {
        const top = nowRow.offsetTop - list.offsetTop, bottom = top + nowRow.offsetHeight;
        if (top < list.scrollTop || bottom > list.scrollTop + list.clientHeight) list.scrollTop = Math.max(0, bottom - list.clientHeight + 26);
      }
    }
    histLen = played;
    watchEdges(list); edges(list);
    if (hadFocus) { const b = hadFocus === 'list' ? list : boardEl.querySelector(`[data-bd="${hadFocus}"]`); if (b) b.focus({preventScroll: true}); }
  }
  // "Scores" reveals, as text in each played festival, what the stamps and cells only show as
  // marks and icons: each show's target and Applause and the Headliner's name (no hover needed).
  let showScores = false;
  function onBoardClick(e) {
    const b = e.target.closest && e.target.closest('[data-bd="scores"]');
    if (!b) return;
    showScores = !showScores;
    b.setAttribute('aria-pressed', String(showScores));
    const bd = boardEl.querySelector('.bd');
    if (bd) bd.classList.toggle('is-scores', showScores);
    const list = boardEl.querySelector('.bd-list');
    if (list) edges(list);
  }

  /* No title tooltips (no hover-only information, §13): each row's aria-label carries every show's
     target and Applause and the Headliner; sighted readers get the same as text from "Scores".
     One festival. Once it is over it collapses to a stamped line (✓ ✓ ✗); otherwise it
     shows its three targets, and the current and next festival show their posted
     Headliner card (Headliners are posted a festival ahead, §4.7). */
  function festivalRow(c, f) {
    const {st, s, curF, building, hm} = c;
    const past = f < curF || (!building && f === curF && !!hm[f * 3 - 1]);
    const now = f === curF && !past;
    const posted = f <= curF + 1 || !building;
    // The Headliner show's own rules: at Renown 7+ the Countdown also brings the Rival, and at 8 it counts in threes.
    const hr = f <= 8 ? call(sim(), 'rulesFor', st, f * 3 - 1) : null;
    const hlIds = Array.isArray(hr) && hr.length ? hr : f <= 8 ? [st.headliners && st.headliners[f - 1]] : ((st.endlessTwists && st.endlessTwists[f]) || []);
    const hls = hlIds.filter(Boolean).map(hl);
    const tw = f > 1 && f <= 8 && st.twilightTwists ? st.twilightTwists[f - 1] : null;   // Renown 2
    const say = [], det = [];
    let cells = '', stamps = '';
    for (let k = 0; k < 3; k++) {
      const si = (f - 1) * 3 + k, e = lastOf(hm[si]);
      const isNow = building && si === s;
      const t = e && !isNow ? e.target : tgt(st, si);
      const sp = (e && e.sponsored) || (isNow && st.sponsor && st.sponsor.accepted);
      const twist = k === 0 && tw && posted ? hl(tw) : null;
      const lbl = `${SLOT[k]} ${fmt(t)}${sp ? ', sponsored' : ''}` +
        `${e ? (e.pass ? ', passed with ' : ', missed with ') + fmt(e.applause || 0) : ''}${isNow ? ', tonight' : ''}${twist ? ', twist: ' + twist.name : ''}`;
      say.push(lbl);
      det.push({t, e, isNow, sp, twist, slot: SLOT[k]});
      const state = e ? (e.pass ? 'is-pass' : 'is-miss') : '';
      if (past) {
        stamps += `<span class="bd-stamp ${state || 'is-skip'}${sp ? ' is-sp' : ''}">${e ? (e.pass ? '✓' : '✗') : '–'}</span>`;
      } else {
        const cls = ['bd-cell', state, isNow ? 'is-now' : '', sp ? 'is-sp' : '', !e && !isNow ? 'is-todo' : ''].filter(Boolean).join(' ');
        const mark = isNow ? '▸' : e ? (e.pass ? '✓' : '✗') : '';
        cells += `<div class="${cls}"><span class="bd-mk">${mark}</span><span class="bd-t num">${fmt(t)}</span>${twist ? icon(tw, 'pn-ic bd-tw') : ''}</div>`;
      }
    }
    const names = hls.map(h => h.name).join(' + ');
    let mini = '', card = '';
    if (!hls.length || !posted) mini = `<span class="bd-hlmini is-sealed">${icon('_')}<span>Not announced yet</span></span>`;
    else if (past) mini = `<span class="bd-hlmini">${hls.map(h => icon(h.id)).join('')}</span>`;
    else if (f > curF + 1) mini = `<span class="bd-hlmini">${hls.map(h => icon(h.id)).join('')}<span>${esc(names)}</span></span>`;
    else card = hls.map(h => `<p class="bd-hl">${icon(h.id, 'pn-ic bd-hl-ic')}<b>${esc(h.name)}</b>${h.rule ? ' ' + esc(h.rule) : ''}</p>`).join('');
    const aria = `Festival ${f}, ${festName(f)}${now ? ', tonight' : ''}. ${say.join('. ')}. Headliner: ${posted && hls.length ? names : 'not announced yet'}.`;
    // "Scores": under the column heads, each show's Applause (✓ / ✗) over its target, then the notes
    // the stamps, rings and icons only mark: sponsored shows, a twist, a past festival's Headliner.
    let more = '';
    if (past || now) {
      const g = det.map(d => `<span class="${d.e ? (d.e.pass ? 'is-pass' : 'is-miss') : ''}"><b>${d.e ? (d.e.pass ? '✓ ' : '✗ ') + fmt(d.e.applause || 0) : d.isNow ? '▸ tonight' : '–'}</b><i>of ${fmt(d.t)}</i></span>`).join('');
      const notes = [];
      const sps = det.filter(d => d.sp).map(d => d.slot);
      if (sps.length) notes.push('Sponsored: ' + sps.join(', '));
      const tw1 = det.find(d => d.twist);
      if (tw1) notes.push('Twist: ' + tw1.twist.name);
      if (past && hls.length) notes.push('Headliner: ' + names);
      more = `<div class="bd-more" aria-hidden="true"><div class="bd-more-g">${g}</div>${notes.map(n => `<p>${esc(n)}</p>`).join('')}</div>`;
    }
    const far = !past && !now && (f > curF + 1 || !building);    // a festival further ahead: a light two-line row
    return `<li class="bd-row ${past ? 'is-past' : now ? 'is-now' : 'is-future'}${far ? ' is-far' : ''}" aria-label="${esc(aria)}"${now ? ' aria-current="step"' : ''}>
<div class="bd-name" aria-hidden="true"><span class="bd-num num">${f}</span><span class="bd-fest">${esc(festName(f))}</span>${mini}${stamps ? `<span class="bd-stamps">${stamps}</span>` : ''}</div>
${cells ? `<div class="bd-cells" aria-hidden="true">${cells}</div>` : ''}${more}${card ? `<div aria-hidden="true">${card}</div>` : ''}</li>`;
  }

  /* Log-y target curve (dashed step line for the shows ahead) with Applause dots, drawn to scale. */
  // The curve's content width (inside its padding), so the SVG draws 1:1 and its 16px labels render at 16px.
  function curveW(box) {
    if (!box || !box.clientWidth) return 0;
    const cs = getComputedStyle(box);
    return Math.floor(box.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0));
  }
  function spark(st, hm, n, s, building, w) {
    const W = Math.max(160, w || curveW(boardEl.querySelector('.bd-curve')) || boardEl.clientWidth - 38 || 282), H = 136;
    const L = 44, R = 8, T = 10, B = 26, pw = W - L - R, ph = H - T - B;
    const tg = [], dots = [];
    for (let i = 0; i < n; i++) { const e = lastOf(hm[i]); tg.push(e && !(building && i === s) ? e.target : tgt(st, i)); }
    for (const e of hist(st)) { const i = hIdx(e); if (i >= 0 && i < n) dots.push(e); }
    const vmax = Math.max(1, ...tg, ...dots.map(e => e.applause || 0));
    const lo = 40, hi = vmax * 1.6, l0 = Math.log10(lo), l1 = Math.log10(hi);
    const y = v => +(T + ph * (1 - (Math.log10(Math.max(lo, v)) - l0) / (l1 - l0))).toFixed(1);
    const x = i => +(L + pw * (i + 0.5) / n).toFixed(1);
    const xe = i => +(L + pw * i / n).toFixed(1);
    let g = '';
    // decade gridlines and labels
    const decs = [];
    for (let d = 100; d <= hi; d *= 10) decs.push(d);
    const every = decs.length > 5 ? 2 : 1;
    decs.forEach((d, j) => {
      if (j % every) return;
      g += `<line class="sp-grid" x1="${L}" x2="${W - R}" y1="${y(d)}" y2="${y(d)}"/><text class="sp-lab" x="${L - 6}" y="${y(d) + 5}" text-anchor="end">${fmt(d)}</text>`;
    });
    // festival bands and numbers
    const nf = n / 3, curF = Math.floor(s / 3);
    for (let f = 0; f < nf; f++) {
      if (f % 2) g += `<rect class="sp-band" x="${xe(f * 3)}" y="${T}" width="${(xe(f * 3 + 3) - xe(f * 3)).toFixed(1)}" height="${ph}"/>`;
      if (nf <= 8 || f % 2 === 0 || f === curF) g += `<text class="sp-lab sp-f${f === curF && building ? ' is-now' : ''}" x="${x(f * 3 + 1)}" y="${H - 6}" text-anchor="middle">${f + 1}</text>`;
    }
    // the target step line: solid up to tonight, dashed ahead
    let pDone = '', pNext = '';
    for (let i = 0; i < n; i++) {
      const seg = `${xe(i)} ${y(tg[i])}H${xe(i + 1)}`;
      if (i <= s) pDone += (pDone ? 'L' : 'M') + seg;
      else pNext += (pNext ? 'L' : `M${xe(i)} ${y(tg[i - 1] || tg[i])}L`) + seg;
    }
    g += `<path class="sp-tg" d="${pDone}"/><path class="sp-tg is-next" d="${pNext}"/>`;
    if (building && s < n) {
      g += `<line class="sp-now" x1="${x(s)}" x2="${x(s)}" y1="${T}" y2="${T + ph}"/>` +
        `<circle class="sp-nowdot" cx="${x(s)}" cy="${y(tg[s])}" r="4.5"><title>Tonight: show ${s + 1}, target ${fmt(tg[s])}</title></circle>`;
    }
    // Applause dots: ● pass, ✕ miss, ring = sponsored
    const last = dots.length - 1;
    dots.forEach((e, j) => {
      const i = hIdx(e), cx = x(i), cy = y(e.applause || 0), fresh = j === last && lit && lit.fresh ? ' is-new' : '';
      const tip = `<title>Show ${i + 1}, ${esc(showName(i))}: Applause ${fmt(e.applause || 0)} vs ${fmt(e.target)}${e.pass ? ', passed' : ', missed'}${e.sponsored ? ', sponsored' : ''}${e.encore ? ', encore' : ''}</title>`;
      const cross = `M${cx - 4.5} ${cy - 4.5}l9 9m0-9l-9 9`;
      g += `<g class="sp-dot${fresh}">${tip}${e.sponsored ? `<circle class="sp-sp" cx="${cx}" cy="${cy}" r="8"/>` : ''}` +
        (e.pass ? `<circle class="sp-pass" cx="${cx}" cy="${cy}" r="4.5"/>` : `<path class="sp-halo" d="${cross}"/><path class="sp-miss" d="${cross}"/>`) + '</g>';
    });
    const passed = dots.filter(e => e.pass).length, anyMiss = dots.length > passed, anySp = dots.some(e => e.sponsored);
    const aria = `Target curve, log scale: ${n} shows from ${fmt(tg[0])} to ${fmt(tg[n - 1])}. ` +
      (dots.length ? `Your Applause on ${dots.length} show${dots.length > 1 ? 's' : ''}, ${passed} passed.` : 'No shows lit yet.');
    const lg = `<span class="sp-lg"><svg viewBox="0 0 22 10" aria-hidden="true"><path class="sp-tg" d="M1 7H8V3H21"/></svg>Target</span>` +
      `<span class="sp-lg"><svg viewBox="0 0 12 12" aria-hidden="true"><circle class="sp-pass" cx="6" cy="6" r="4.5"/></svg>Applause</span>` +
      (anyMiss ? `<span class="sp-lg"><svg viewBox="0 0 12 12" aria-hidden="true"><path class="sp-miss" d="M1.5 1.5l9 9m0-9l-9 9"/></svg>Miss</span>` : '') +
      (anySp ? `<span class="sp-lg"><svg viewBox="0 0 18 18" aria-hidden="true"><circle class="sp-sp" cx="9" cy="9" r="7.5"/></svg>Sponsored</span>` : '');
    return `<h3 class="bd-h3">Target curve</h3><svg class="sp" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(aria)}">${g}</svg><p class="sp-legend">${lg}</p>`;
  }

  /* =====================================================================
     SHOW LOG — model
     A pure reduction of the §9 event chain:
       fuseLit → (launch, burst, fusion, gainOoh, gainAah, multAah, clear,
       extend, repeat, crowdGain, coinGain, skyAge)* → crowdCheer →
       applause → payout → rainCheck | relight | runLost | runWon.
     Each burst opens a line; the events after it attach to that line.
  ===================================================================== */
  function capture(st) {
    if (!st || !Array.isArray(st.tubes)) return null;
    const s = st.show | 0;
    return {
      s, crowd: st.crowd | 0, sponsored: !!(st.sponsor && st.sponsor.accepted),
      rules: call(sim(), 'rulesFor', st, s) || [], target: tgt(st, s),
      tubes: st.tubes.map(t => ({shell: t && t.shell ? {id: t.shell.id, col: t.shell.col, star: t.shell.star || 1, uid: t.shell.uid || 0, paid: 0} : null, rig: (t && t.rig) || null})),
      fav: undefined
    };
  }
  function newLog(sn) {
    const L = {snap: sn, lines: [], cur: null, byN: {}, pass: 0, shot: 0, cheer: null, app: null, pay: null, notes: [],
      ooh: 0, aah: 1, done: false, live: true, fav: null};
    if (sn) {
      // ♛ as of lighting (§3.3 favourite), computed from the pre-light rack.
      if (sn.fav === undefined) sn.fav = num(call(sim(), 'favourite', sn.tubes, sn.crowd));
      L.fav = sn.fav;
    }
    return L;
  }
  function item(L, it) {
    if (L.app || !L.cur) return;           // nothing attaches before the first burst or after the slam
    L.cur.items.push(it);
    L.cur.v++;
    L.cur.ooh = L.ooh; L.cur.aah = L.aah;
  }
  function totals(L, ev) {
    if (num(ev.ooh) != null) L.ooh = ev.ooh;
    if (num(ev.aah) != null) L.aah = ev.aah;
  }
  function reduce(L, ev) {
    if (!ev || !ev.type) return;
    switch (ev.type) {
      case 'fuseLit':
        if (!L.snap) L.snap = {s: ev.show, tubes: [], crowd: 0, sponsored: false};
        if (num(ev.show) != null) L.snap.s = ev.show;
        if (Array.isArray(ev.rules)) L.snap.rules = ev.rules;
        if (num(ev.target) != null) L.snap.target = ev.target;
        if (num(ev.fav) != null) L.fav = ev.fav;
        break;
      case 'launch': L.shot = ev.shot | 0; break;
      case 'burst': {
        if (L.app) break;
        const id = typeof ev.shell === 'object' && ev.shell ? ev.shell.id : ev.shell;
        const pass = ev.pass | 0;
        if (pass > L.pass) {
          L.pass = pass;
          L.lines.push({sep: true, v: 1, text: pass === 1 && L.snap && (L.snap.rules || []).includes('countdown') ? 'The fuse turns: 1 → ' + tubeCount(L) : 'The fuse turns again'});
        }
        if (num(ev.n) != null) L.byN[ev.n] = {id, col: ev.col};
        L.cur = {
          tube: num(ev.tube), id, col: ev.col || 'W', star: ev.star || 1, shot: L.shot,
          sees: num(ev.sees) ?? (Array.isArray(ev.up) ? ev.up.length : 0), up: Array.isArray(ev.up) ? ev.up.slice() : null,
          dud: !!ev.dud, half: !!ev.half, washed: !!ev.washed, wild: !!ev.wild, last: !!ev.last,
          items: [], v: 0, ooh: L.ooh, aah: L.aah
        };
        L.lines.push(L.cur);
        break;
      }
      case 'fusion': item(L, {k: 'fusion', name: ev.name || cap(ev.key), first: !!ev.first}); break;
      case 'gainOoh': totals(L, ev); item(L, {k: 'ooh', v: ev.v || 0, critic: !!ev.critic, fu: !!ev.fusion}); break;
      case 'gainAah': totals(L, ev); item(L, {k: 'aah', v: ev.v || 0, capped: !!ev.capped, floor: !!ev.floor, rig: ev.rig || null, fu: !!ev.fusion}); break;
      case 'multAah': totals(L, ev); item(L, {k: 'x', v: num(ev.factor) ?? 1, fu: !!ev.fusion}); break;
      case 'clear': item(L, {k: 'clear', v: ev.n | 0}); break;
      case 'extend': item(L, {k: 'extend', by: ev.by || 1, n: ev.n | 0}); break;
      case 'repeat': item(L, {k: 'repeat', id: ev.shell || (L.byN[ev.from] || {}).id, rate: num(ev.rate)}); break;
      case 'crowdGain': item(L, {k: 'crowd', v: ev.v || 0}); break;
      case 'coinGain': item(L, {k: 'coin', v: ev.v || 0, rig: ev.rig || null}); break;
      case 'crowdCheer': totals(L, ev); L.cheer = {v: ev.v || 0, half: !!ev.half}; L.cur = null; break;
      case 'applause':
        L.app = {ooh: num(ev.ooh), aah: num(ev.aah), score: num(ev.score), target: num(ev.target), pass: !!ev.pass,
          encore: !!ev.encore, ratio: num(ev.ratio), short: num(ev.short)};
        L.cur = null;
        break;
      case 'payout': L.pay = ev; break;
      case 'rainCheck': L.notes.push({k: 'rain', text: 'Rain check used. Miss one more show and the run ends.'}); break;
      case 'relight': L.notes.push({k: 'relight', text: 'The crowd stays for one more! Relight the Countdown.'}); break;
      case 'runLost': L.notes.push({k: 'lost', text: 'The crowd went home.'}); break;
      case 'runWon': L.notes.push({k: 'won', text: ev.final ? 'The Afterparty is over. What a run!' : 'Happy New Year!'}); break;
      default: break;
    }
  }
  // At the slam: the history entry is authoritative for the header and the Applause line.
  function settle(L, entry, summary) {
    const a = L.app || (L.app = {});
    const src = entry || summary || {};
    if (num(src.applause) != null) a.score = src.applause;
    if (num(src.ooh) != null) a.ooh = src.ooh;
    if (num(src.aah) != null) a.aah = src.aah;
    if (num(src.target) != null) a.target = src.target;
    if (src.pass != null) a.pass = !!src.pass;
    if (src.encore != null) a.encore = !!src.encore;
    if (L.snap) {
      if (entry && num(hIdx(entry)) != null) L.snap.s = hIdx(entry);
      if (Array.isArray(src.rules)) L.snap.rules = src.rules;
      if (num(src.target) != null) L.snap.target = src.target;
      if (src.sponsored != null) L.snap.sponsored = !!src.sponsored;
    }
    L.done = true; L.live = false; L.cur = null;
  }
  /** Build a complete log from an event list (pure; used at the slam and by tests). */
  function buildLog(events, sn, entry, summary) {
    const L = newLog(sn);
    for (const ev of events || []) reduce(L, ev);
    if (entry || summary || L.app) settle(L, entry, summary);
    return L;
  }
  /* A restored run has history but no trace: re-resolve the last lit rack (history
     keeps it) so the log still explains the last show. */
  function fromHistory(st) {
    const rec = lastOf(hist(st)), O = sim();
    if (!rec || !Array.isArray(rec.rack) || !O || typeof O.resolveShow !== 'function') return null;
    let r = null;
    try { r = O.resolveShow(rec.rack, {rules: rec.rules || [], crowd: rec.crowdAtLight | 0, fav: rec.fav, trace: true}); } catch (e) { return null; }
    if (!r || !Array.isArray(r.trace)) return null;
    const sn = {s: hIdx(rec), crowd: rec.crowdAtLight | 0, sponsored: !!rec.sponsored, rules: rec.rules || [], target: rec.target, tubes: clone(rec.rack), fav: undefined};
    const evs = r.trace.concat([
      {type: 'crowdCheer', v: r.cheer, half: (rec.rules || []).includes('ferry'), ooh: r.ooh, aah: r.aah},
      {type: 'applause', ooh: rec.ooh, aah: rec.aah, score: rec.applause, target: rec.target, pass: rec.pass, encore: rec.encore}
    ]);
    return buildLog(evs, sn, rec);
  }

  /* =====================================================================
     SHOW LOG — view
  ===================================================================== */
  function skeleton() {
    logEl.innerHTML = `<div class="sl-scrim" aria-hidden="true"></div>
<div class="sl-panel">
  <header class="sl-head">
    <div class="sl-title-row"><h2 class="sl-title">Show log</h2><span class="sl-live" hidden><i aria-hidden="true"></i>Live</span>
      <button type="button" class="btn sl-close" data-sl="close" aria-label="Close the show log">✕</button></div>
    <div class="sl-meta"></div>
  </header>
  <p class="sl-key" aria-hidden="true"><span>Bursts</span><span>Running Ooh × Aah</span></p>
  <div class="sl-body">
    <ol class="sl-lines" aria-label="Bursts, in firing order"></ol>
    <div class="sl-sum"></div>
  </div>
  <div class="sl-foot"><button type="button" class="btn sl-book" data-sl="logbook">${icon('book')}Logbook<kbd>L</kbd></button></div>
</div>`;
    panel = logEl.querySelector('.sl-panel');
    P = {meta: logEl.querySelector('.sl-meta'), body: logEl.querySelector('.sl-body'), lines: logEl.querySelector('.sl-lines'),
      sum: logEl.querySelector('.sl-sum'), live: logEl.querySelector('.sl-live')};
    watchEdges(P.body);
    P.body.addEventListener('scroll', () => { const B = P.body; P.follow = B.scrollTop + B.clientHeight >= B.scrollHeight - 48; }, {passive: true});
    logEl.addEventListener('click', e => {
      if (e.target.classList.contains('sl-scrim')) { closeSheet(); return; }
      const b = e.target.closest('[data-sl]');
      if (!b) return;
      if (b.dataset.sl === 'close') closeSheet();
      else if (b.dataset.sl === 'logbook') {
        if (!isDesk()) closeSheet();
        if (G && typeof G.open === 'function') G.open('logbook');
      }
    });
  }

  function metaHTML(L) {
    const sn = L && L.snap;
    if (!sn) {
      const st = G && G.state;
      if (!st || st.phase !== 'build') return '';
      return `<p class="sl-sub">Next up: <span class="num">Show ${(st.show | 0) + 1}</span> · ${esc(showName(st.show | 0))}</p>`;
    }
    // each Headliner / twist as its chip followed by its rule, in plain sight (no hover tooltip)
    const rules = (sn.rules || []).map(id => { const h = hl(id); return `<p class="sl-rx"><span class="sl-rule">${icon(id)}${esc(h.name)}</span>${h.rule ? ` <span class="sl-rt">${esc(h.rule)}</span>` : ''}</p>`; }).join('');
    return `<p class="sl-sub"><span class="num">Show ${sn.s + 1}</span> · ${esc(showName(sn.s))}</p>
<p class="sl-tg"><span>Target <b class="num">${fmt(sn.target || 0)}</b></span>${sn.sponsored ? '<span class="sl-sp">Sponsored ×1.5</span>' : ''}</p>${rules}`;
  }

  // "sees Willow, Peony" (names of the bursts up, §3.2). Beyond two: the count, then every name,
  // repeats grouped ("sees 5: Peony ×3, Willow, Palm"), so nothing hides in a hover tooltip.
  function seesText(ln, L) {
    if (ln.dud) return '';
    if (!ln.sees) return 'empty sky';
    const names = ln.up ? ln.up.map(n => L.byN[n] && shellName(L.byN[n].id)).filter(Boolean) : [];
    if (names.length === ln.sees && names.length <= 2) return 'sees ' + names.join(', ');
    if (!names.length) return `sees ${ln.sees}`;
    const cnt = new Map();
    for (const n of names) cnt.set(n, (cnt.get(n) || 0) + 1);
    const list = [...cnt].map(([n, k]) => (k > 1 ? `${n} ×${k}` : n)).join(', ');
    const more = ln.sees - names.length;
    return `sees ${ln.sees}: ${list}${more > 0 ? ` +${more}` : ''}`;
  }
  function seesFull(ln, L) {
    if (!ln.up || !ln.up.length) return '';
    return ln.up.map(n => L.byN[n] && shellName(L.byN[n].id)).filter(Boolean).join(', ');
  }
  function chipsHTML(ln) {
    let h = '';
    const reps = ln.items.filter(it => it.k === 'repeat');
    let repDone = false;
    for (const it of ln.items) {
      const fu = it.fu ? ' is-fu' : '';
      switch (it.k) {
        case 'fusion': h += `<span class="chip chip-fusion sl-c">✦ ${esc(it.name)}${it.first ? ' <em>new!</em>' : ''}</span>`; break;
        case 'ooh':
          h += it.critic ? `<span class="chip sl-c is-off${fu}">0 Ooh <em>Critic</em></span>` : `<span class="chip sl-c${fu}">+${fmt(it.v)} Ooh</span>`;
          break;
        case 'aah': {
          const why = it.rig ? rigName(it.rig) : it.floor ? 'no ×' : it.capped ? 'capped' : '';
          h += `<span class="chip chip-aah sl-c${fu}">+${fmtA(it.v)} Aah${why ? ` <em>${esc(why)}</em>` : ''}</span>`;
          break;
        }
        case 'x': h += `<span class="chip chip-x sl-c${fu}">${fmtX(it.v)} Aah</span>`; break;
        case 'clear': h += `<span class="sl-t">clears ${it.v}</span>`; break;
        case 'extend': h += `<span class="sl-t">+${it.by} Hang${it.n ? ` (${it.n} up)` : ''}</span>`; break;
        case 'repeat':
          if (repDone) break;
          repDone = true;
          h += `<span class="sl-t">${ln.id === 'cake' ? 'repeats' : 'echoes'} ${esc(reps.slice(0, 2).map(r => shellName(r.id)).join(', '))}${reps.length > 2 ? ' +' + (reps.length - 2) : ''}${reps[0].rate ? ' ' + Math.round(reps[0].rate * 100) + '%' : ''}</span>`;
          break;
        case 'crowd': h += `<span class="sl-t sl-hi">Crowd +${fmt(it.v)}</span>`; break;
        case 'coin': h += `<span class="sl-t sl-hi">+$${it.v}${it.rig ? ' ' + esc(rigName(it.rig)) : ''}</span>`; break;
        default: break;
      }
    }
    return h;
  }
  function lineHTML(ln, L) {
    if (ln.sep) return `<p class="sl-sep">${esc(ln.text)}</p>`;
    const col = ln.col || 'W';
    const isFav = L.fav != null && ln.tube === L.fav;
    const cn = ln.washed ? 'washed out' : ln.wild || col === 'X' ? 'Rainbow' : col !== 'W' ? CNAME[col] || '' : '';
    const star = ln.star > 1 ? `<span class="sl-star num">★${Math.min(3, ln.star)}</span>` : '';   // spelled out, not pips + tooltip
    const flags = (ln.shot > 0 ? `<span class="sl-flag is-shot">burst ${ln.shot + 1}</span>` : '') + (ln.dud ? '<span class="sl-flag is-dud">dud</span>' : '') + (ln.half ? '<span class="sl-flag">½ strength</span>' : '') + (ln.last ? '<span class="sl-flag">last</span>' : '');
    const sees = seesText(ln, L);
    const chips = flags + (sees ? `<span class="sl-sees">${esc(sees)}</span>` : '') + chipsHTML(ln);
    const tot = `<span class="sl-run num">${fmt(Math.floor(ln.ooh))}<i>×</i>${fmtA(ln.aah)}</span>`;
    return `<div class="sl-l1"><span class="sl-tube num">T${ln.tube != null ? ln.tube + 1 : '?'}</span>${shape(ln.wild ? 'X' : col)}<span class="sl-name">${esc(shellName(ln.id))}${cn ? ` <span class="sl-col">(${esc(cn)})</span>` : ''}${star}</span>${isFav ? '<span class="sl-fav">♛ Crowd Favourite</span>' : ''}</div>
<div class="sl-chips">${chips}${tot}</div>`;
  }
  function lineLabel(ln, L) {
    if (ln.sep) return ln.text;
    const full = seesFull(ln, L);
    const gains = [];
    for (const it of ln.items) {
      if (it.k === 'fusion') gains.push('fusion ' + it.name);
      else if (it.k === 'ooh') gains.push(it.critic ? 'no Ooh, the Critic' : `plus ${fmt(it.v)} Ooh`);
      else if (it.k === 'aah') gains.push(`plus ${fmtA(it.v)} Aah${it.rig ? ' from ' + rigName(it.rig) : ''}`);
      else if (it.k === 'x') gains.push(`times ${String(Math.round(it.v * 100) / 100)} Aah`);
      else if (it.k === 'clear') gains.push(`clears ${it.v}`);
      else if (it.k === 'extend') gains.push(`Hang plus ${it.by}`);
      else if (it.k === 'repeat') gains.push(`repeats ${shellName(it.id)}`);
      else if (it.k === 'crowd') gains.push(`Crowd plus ${fmt(it.v)}`);
      else if (it.k === 'coin') gains.push(`plus ${it.v} dollars`);
    }
    return `Tube ${ln.tube + 1}${ln.shot > 0 ? ', burst ' + (ln.shot + 1) : ''}: ${shellName(ln.id)}${ln.star > 1 ? ', star ' + Math.min(3, ln.star) : ''}${ln.col && ln.col !== 'W' ? ', ' + (CNAME[ln.col] || '') : ''}` +
      `${ln.dud ? ', dud' : ''}${ln.half ? ', half strength' : ''}${ln.last ? ', last' : ''}${L.fav === ln.tube ? ', crowd favourite' : ''}. ` +
      `${ln.dud ? '' : ln.sees ? 'Sees ' + ln.sees + (full ? ': ' + full : '') + '. ' : 'Empty sky. '}` +
      `${gains.length ? gains.join(', ') + '. ' : ''}Running total Ooh ${fmt(Math.floor(ln.ooh))} times Aah ${fmtA(ln.aah)}.`;
  }

  function sumHTML(L) {
    let h = '';
    if (L.cheer) {
      h += `<div class="sl-cheer"><span class="sl-cheer-ic">${crowdIcon}</span><span>Crowd${L.cheer.half ? ' <span class="sl-flag">½ Late Ferry</span>' : ''}</span><span class="chip sl-c">+${fmt(L.cheer.v)} Ooh</span></div>`;
    }
    const a = L.app;
    if (a && a.score != null) {
      const t = a.target != null ? a.target : (L.snap && L.snap.target) || 0;
      const ratio = a.ratio != null ? a.ratio : t ? a.score / t : 0;
      const verdict = a.pass
        ? `<span class="sl-ok">✓ Pass · ${(Math.floor(ratio * 10) / 10).toFixed(1)}× target</span>${a.encore ? '<span class="sl-encore">Encore!</span>' : ''}`
        : `<span class="sl-bad">✗ ${fmt(a.short != null ? a.short : Math.max(0, t - a.score))} short</span>`;
      h += `<div class="sl-app ${a.pass ? 'is-pass' : 'is-miss'}">
<div class="sl-app-row"><span class="sl-app-lbl">Applause<span class="sl-app-tg num">target ${fmt(t)}</span></span><span class="sl-app-v"><span class="sl-app-n num">${fmt(a.score)}</span>${a.score >= 1e4 ? `<span class="sl-app-x num">${Math.floor(a.score).toLocaleString('en-US')}</span>` : ''}</span></div>
<div class="sl-app-eq num">= <span class="chip">Ooh ${fmt(Math.floor(a.ooh != null ? a.ooh : L.ooh))}</span> × <span class="chip chip-aah">Aah ${fmtA(a.aah != null ? a.aah : L.aah)}</span></div>
<div class="sl-verdict">${verdict}</div>${payHTML(L.pay, a)}</div>`;
    } else if (L.live) {
      const t = L.snap && L.snap.target;
      h += `<div class="sl-app is-pending"><div class="sl-app-row"><span class="sl-app-lbl">Applause${t ? `<span class="sl-app-tg num">target ${fmt(t)}</span>` : ''}</span><span class="sl-app-n num" aria-hidden="true">…</span></div>
<div class="sl-app-eq num">Ooh ${fmt(Math.floor(L.ooh))} × Aah ${fmtA(L.aah)}</div></div>`;
    }
    for (const n of L.notes) h += `<p class="sl-note is-${n.k}">${esc(n.text)}</p>`;
    return h;
  }
  // §5.2 payout, itemised: base, interest, Sponsor reward, Crowd (+Encore), shell coins.
  function payHTML(p, a) {
    if (!p) return '';
    const bits = [];                                   // [text, kind]: coin | crowd | card | none
    if (p.base) bits.push([`+$${p.base} show fee`, 'coin']);
    if (p.interest) bits.push([`+$${p.interest} interest`, 'coin']);
    const sp = p.sponsor && typeof p.sponsor === 'object' ? p.sponsor : null;
    if (sp && sp.coins) bits.push([`+$${sp.coins} sponsor`, 'coin']);
    if (p.shellCoins) bits.push([`+$${p.shellCoins} from shells`, 'coin']);
    const cr = (p.crowdPass || 0) + (p.crowdHeadliner || 0);
    if (cr) bits.push([`Crowd +${cr}`, 'crowd']);
    if (p.crowdEncore) bits.push([`Encore: Crowd +${p.crowdEncore}`, 'crowd']);
    if (sp && sp.crowd) bits.push([`Crowd +${sp.crowd} sponsor`, 'crowd']);
    if (sp && sp.collector) bits.push(['Collector card next shop', 'card']);
    if (!a.pass) bits.unshift(['No payout on a miss', 'none']);
    const after = num(p.coins) != null ? `<span class="sl-after">Now $${p.coins}${num(p.crowd) != null ? ` · Crowd ${fmt(p.crowd)}` : ''}</span>` : '';
    // one pill per item, so a wrap never splits an item
    return bits.length || after ? `<p class="sl-pay num">${bits.map(([t, k]) => `<span class="sl-pb is-${k}">${esc(t)}</span>`).join('')}${after}</p>` : '';
  }

  // Painting is batched: the stream only marks the log dirty and one rAF paints it, every DOM write
  // first and at most one scroll last, with no layout reads while streaming (whether the reader is
  // following the bottom comes from the scroll handler). A closed sheet is painted when it opens.
  let paintRaf = 0, paintForce = false;
  function schedulePaint(force) {
    paintForce = paintForce || !!force;
    if (!paintRaf) paintRaf = requestAnimationFrame(() => { paintRaf = 0; paintLog(false); });
  }
  const setHTML = (el, html) => { if (el._html !== html) { el._html = html; el.innerHTML = html; } };
  function paintLog(force) {
    if (!P) return;
    if (paintRaf) { cancelAnimationFrame(paintRaf); paintRaf = 0; }
    force = force || paintForce; paintForce = false;
    if (logEl.hidden) { P.stale = true; return; }
    P.stale = false;
    const L = log;
    setHTML(P.meta, metaHTML(L));
    P.live.hidden = !(L && L.live);
    panel.classList.toggle('is-live', !!(L && L.live));
    if (!L || (!L.lines.length && !L.app)) {
      P.lines.innerHTML = `<li class="sl-empty">${emptyHTML()}</li>`;
      setHTML(P.sum, L ? sumHTML(L) : '');
      edges(P.body);
      return;
    }
    // While live, follow the stream unless the reader has scrolled up to look at an earlier line.
    const B = P.body, follow = P.follow !== false;
    if (force || P.lines.querySelector('.sl-empty')) P.lines.innerHTML = '';
    const kids = P.lines.children;
    let added = false;
    L.lines.forEach((ln, i) => {
      let li = kids[i];
      if (!li) {
        li = document.createElement('li');
        li.className = 'sl-line' + (L.live ? ' is-in' : '');
        P.lines.appendChild(li);
        added = true;
      }
      // re-render a line only when it changed (or a name it shows became known)
      const key = `${ln.v}:${ln.items ? ln.items.length : 0}:${L.fav}:${ln.up ? ln.up.filter(n => L.byN[n]).length : 0}`;
      if (li._key !== key) {
        li._key = key;
        li.innerHTML = lineHTML(ln, L);
        li.setAttribute('aria-label', lineLabel(ln, L));
        li.classList.toggle('is-sep', !!ln.sep);
        li.classList.toggle('is-fav', !ln.sep && L.fav != null && ln.tube === L.fav);
        li.classList.toggle('is-dud', !!ln.dud);
      }
    });
    while (kids.length > L.lines.length) P.lines.lastChild.remove();
    setHTML(P.sum, sumHTML(L));
    if (L.live) { if (added || follow) B.scrollTo({top: 1e7, behavior: reduced() || !added ? 'auto' : 'smooth'}); }   // edges follow from the scroll events
    else edges(B);
  }
  function emptyHTML() {
    const again = hist(G && G.state).length > 0;
    return `<p class="sl-empty-h">${again ? 'Light the fuse to fill the log.' : 'The fuse hasn’t been lit yet.'}</p>` +
      '<p>Your next show appears here burst by burst: what each burst saw in the sky, the Ooh and Aah it added, fusions, multipliers and the Crowd’s Ooh.</p>' +
      exampleHTML();
  }
  // A worked example line (the spec's own), drawn with the real line markup and labelled part by part.
  function exampleHTML() {
    const L = {fav: null, byN: {0: {id: 'peony', col: 'R'}}};
    const ln = {tube: 2, id: 'palm', col: 'R', star: 1, shot: 0, sees: 1, up: [0], items: [{k: 'ooh', v: 12}, {k: 'aah', v: 3}], ooh: 12, aah: 4};
    return `<figure class="sl-ex" aria-label="Example line: tube 3 fires a Red Palm; it sees a Peony, adds 12 Ooh and 3 Aah; the show now stands at 12 Ooh times 4 Aah.">
<figcaption>How to read a line</figcaption>
<div class="sl-line sl-ex-line" aria-hidden="true">${lineHTML(ln, L)}</div>
<ol class="sl-ex-key" aria-hidden="true"><li><b>T3</b> the tube it fired from</li><li><b>sees</b> the bursts still up</li><li><b>+ Ooh, + Aah</b> what it added</li><li><b>12 × 4.0</b> the show so far</li></ol>
</figure>`;
  }

  /* ---------- sheet presentation (< 1200 px) ----------
     core's open('showlog') un-hides #showlog and pushes it on the overlay stack (below
     1200 px only); close() restores the hidden state it found. Here the column is
     re-dressed as a .sheet over a scrim while it is open. */
  function setOpen(open) {
    if (!logEl) return;
    const desk = isDesk(), sheet = !desk && !!open;
    syncing = true;
    logEl.hidden = desk ? false : !sheet;
    logEl.classList.toggle('is-sheet', sheet);
    if (panel) panel.classList.toggle('sheet', sheet);
    logEl.setAttribute('role', sheet ? 'dialog' : 'complementary');
    if (sheet) logEl.setAttribute('aria-modal', 'true'); else logEl.removeAttribute('aria-modal');
    syncing = false;
    if (P && P.stale && !logEl.hidden) paintLog(true);
    if (!open) return;
    if (sheet && panel) panel.scrollTop = 0;
    if (desk && panel) { panel.classList.remove('is-flash'); void panel.offsetWidth; panel.classList.add('is-flash'); }
    setTimeout(() => {
      if (logEl.contains(document.activeElement)) return;
      const b = logEl.querySelector(desk ? '.sl-book' : '.sl-close');
      if (b) b.focus({preventScroll: true});
    }, 0);
  }
  // Fallback if something toggles [hidden] without an 'overlay' event.
  function onHiddenChange() {
    if (syncing || !logEl) return;
    if (isDesk()) { if (logEl.hidden) { syncing = true; logEl.hidden = false; syncing = false; } return; }
    const open = !logEl.hidden;
    if (open !== logEl.classList.contains('is-sheet')) setOpen(open);
  }
  const topIsLog = () => !!(G && typeof G.top === 'function' && G.top() === 'showlog');
  function openSheet() { if (G && typeof G.open === 'function') G.open('showlog'); else setOpen(true); }
  function closeSheet() {
    if (topIsLog() && typeof G.close === 'function') G.close('showlog');
    setOpen(false);
  }
  function onMode() {
    if (isDesk()) {
      if (topIsLog()) { try { G.close('showlog'); } catch (e) { /* ignore */ } }
      setOpen(false);
      attachBackdrop();
      if (!inFlight) renderBoard();
    } else setOpen(topIsLog());
  }
  // GAME.boot() attaches canvas#backdrop when the page opens at desktop width; this covers a
  // window that grows into the desktop layout later.
  function attachBackdrop() {
    if (backdropOn || !isDesk() || typeof FX === 'undefined' || !FX || typeof FX.attachBackdrop !== 'function') return;
    const c = document.getElementById('backdrop');
    if (!c) return;
    try { FX.attachBackdrop(c); backdropOn = true; } catch (e) { /* optional */ }
  }

  /* ---------- GAME wiring ---------- */
  function startLive(events) {
    if (inFlight && log && log.live) { if (events && lit && !lit.events) lit.events = events; return; }
    inFlight = true;
    const now = capture(G && G.state);              // GAME.state still shows the pre-light build here
    if (now && (!snap || now.s === snap.s)) snap = now;
    lit = {sn: snap, events: events || null, fresh: false};
    log = newLog(clone(snap));
    paintLog(true);
  }
  function onPresent(ev) {
    if (!ev || !ev.type || ev.type === 'buildOpen') return;
    if (!inFlight || !log || !log.live) {
      if (!/^(fuseLit|launch|burst)$/.test(ev.type)) return;
      startLive(null);
    }
    reduce(log, ev);
    schedulePaint(false);
  }
  function onResult(p) {
    p = p || {};
    const sn = (lit && lit.sn && clone(lit.sn)) || (log && log.snap) || clone(snap);
    const evs = Array.isArray(p.events) ? p.events : (lit && lit.events);
    const streamed = !!(log && log.live && log.lines.length);
    if (evs) log = buildLog(evs, sn, p.entry, p.summary);
    else if (log) settle(log, p.entry, p.summary);
    else log = buildLog([], sn, p.entry, p.summary);
    inFlight = false;
    if (lit) lit.fresh = true;
    paintLog(!streamed);
    // settle on the verdict: the Applause sits at the end of the log
    P.body.scrollTop = P.body.scrollHeight;
    edges(P.body);
    renderBoard();
    if (lit) lit.fresh = false;
    snap = capture(G.state);
  }
  function onRunStart() {
    inFlight = false; lit = null; histLen = -1;
    snap = capture(G.state);
    log = hist(G.state).length ? fromHistory(G.state) : null;
    paintLog(true);
    renderBoard();
  }

  function init(game) {
    G = game;
    boardEl = document.getElementById('board');
    if (boardEl) boardEl.addEventListener('click', onBoardClick);
    logEl = document.getElementById('showlog');
    if (!G || (!boardEl && !logEl)) return;
    mq = typeof matchMedia === 'function' ? matchMedia('(min-width: 1200px)') : null;
    if (logEl) {
      skeleton();
      if (typeof MutationObserver === 'function') new MutationObserver(onHiddenChange).observe(logEl, {attributes: true, attributeFilter: ['hidden']});
    }
    const on = (n, f) => {
      if (typeof G.on !== 'function') return;
      G.on(n, x => { try { f(x); } catch (e) { if (G.flags && (G.flags.debug || G.flags.test)) console.warn('[panels] ' + n, e); } });
    };
    on('change', () => { if (!inFlight && G.ui !== 'RESOLVING') { snap = capture(G.state); renderBoard(); } });
    on('sim', p => { if (p && p.action && p.action.type === 'light') startLive(p.events); });
    on('ui', p => {
      if (!p) return;
      if (p.to === 'RESOLVING') startLive(lit && inFlight ? lit.events : null);
      else if ((p.to === 'BUILD' || p.to === 'END') && !inFlight) { snap = capture(G.state); renderBoard(); }
    });
    on('present', onPresent);
    on('result', onResult);
    on('runStart', onRunStart);
    on('runEnd', renderBoard);
    on('overlay', p => { if (p && p.name === 'showlog') setOpen(!!p.open); });
    on('resize', () => { if (isDesk() && !inFlight) renderBoard(); }); // mid-show the state is already post-show: wait for the slam
    if (typeof G.onKey === 'function') {
      G.onKey('showlog', e => {
        const k = e && (e.key || e);
        if (k === 'Escape' || k === 'Esc') { if (e.preventDefault) e.preventDefault(); closeSheet(); return true; }
        return false;
      });
    }
    if (mq) {
      if (mq.addEventListener) mq.addEventListener('change', onMode);
      else if (mq.addListener) mq.addListener(onMode);
    }
    backdropOn = isDesk();                            // GAME.boot() attached it already
    onRunStart();
    onMode();
  }

  return {
    init,
    /** Re-render both panels from GAME.state. */
    render() { renderBoard(); paintLog(true); },
    renderBoard,
    renderLog: () => paintLog(true),
    /** Open / close the Show log (the 'showlog' sheet below 1200 px; a focus flash on desktop). */
    open: openSheet,
    close: closeSheet,
    /** Pure: build a Show log model from a §9 event list (tests). */
    buildLog,
    /** Test view of the Show log: header, line count, totals, verdict. */
    log: () => (log ? {
      show: log.snap ? log.snap.s : null, lines: log.lines.filter(l => !l.sep).length, live: log.live, done: log.done,
      ooh: log.ooh, aah: log.aah, applause: log.app ? log.app.score : null, pass: log.app ? log.app.pass : null, fav: log.fav
    } : null)
  };
})();
