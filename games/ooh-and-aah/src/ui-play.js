/* ============================================================
   ui-play.js — UI_PLAY: the play screen (spec §8.1, §8.4, §11.5, §13)

   Renders #hud, #sponsor, #sky-overlay, #rack, #tools, #shop,
   #workshop, #fire and #inspect. Owns selection and drag, the
   build-phase legibility layer (local chips, canopy arc, ♛, mood,
   Rehearse), the 'play' key scope, the first-run hints (§6, §4.13)
   and the tube centres it hands to FX.setScene.

   It never mutates SIM state: every game action goes through
   GAME.dispatch / GAME.light / GAME.undo / GAME.skip.

   Public API: init(game), render(), layout(), select(item),
   clearSelection(), inspect(item), mode(), tubeCentres().
============================================================ */
const UI_PLAY = (() => {
  'use strict';

  /* ================= 0. Fixed tables (visual keys only; every rule, tip and name text comes from OOH.DATA) ================= */

  const PLATE_KEY = { R: 'circle', A: 'triangle', G: 'square', B: 'diamond', W: 'cross', X: 'star' }; // plate outline per colour
  const RARITY = { C: ['Common', 1], U: ['Uncommon', 2], R: ['Rare', 3] };
  // Play-screen tips that are not in OOH.DATA.TOOLTIPS (DATA wins when it adds the id).
  const UI_TIPS = { t_swap: 'Drop on a tube to swap. The old shell goes to the Crate.' };

  /* ================= 1. Icons (inline SVG, currentColor) ================= */

  const svg = (inner, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${inner}</svg>`;
  const S_ = d => `<path d="${d}"/>`;
  const F_ = d => `<path class="f" d="${d}"/>`;
  const ICON = {
    pause: svg(F_('M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z')),
    umbrella: svg(F_('M2.5 12.5a9.5 8.5 0 0 1 19 0z') + S_('M12 12.5v6.2a2.2 2.2 0 0 1-4.4 0M12 2.8v1.2')),
    crack: S_('M11 4.5l-2.2 3.4 3 1.8-2.4 2.8'),
    crowd: svg(F_('M8 11.2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16.4 10.4a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2zM2 20.5a6 6 0 0 1 12 0zM13.2 20.5a7.4 7.4 0 0 0-1.6-5A5.4 5.4 0 0 1 22 18.8v1.7z')),
    undo: svg(S_('M9 14.5 4 9.5l5-5M4.5 9.5h10a5.5 5.5 0 0 1 0 11H11')),
    match: svg(S_('M3 7h14M13.5 3.5 17 7l-3.5 3.5M21 17H7M10.5 13.5 7 17l3.5 3.5')),
    restore: svg(S_('M3.5 12a8.5 8.5 0 1 0 2.6-6.1M3.5 4v5h5M12 7.5V12l3 2')),
    rehearse: svg(S_('M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z') + '<circle cx="12" cy="12" r="3"/>'),
    // "sees": a burst hanging in the sky (Rehearse keeps the eye)
    sees: svg('<circle class="f" cx="12" cy="12" r="2.8"/>' + S_('M12 2.8v4M12 17.2v4M2.8 12h4M17.2 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M18.5 5.5l-2.8 2.8M8.3 15.7l-2.8 2.8'), 'ic sees-ic'),
    info: svg('<circle cx="12" cy="12" r="9.2"/>' + S_('M12 11v6M12 7.6v.2')),
    crown: svg(F_('M3 8.5l4.6 3.8L12 5l4.4 7.3L21 8.5 19.2 19H4.8z'), 'ic crown'),
    crate: svg(S_('M3.5 9h17v11h-17zM3.5 9l2-4.5h13l2 4.5M9.5 13h5')),
    reroll: svg(S_('M19.5 11A7.8 7.8 0 0 0 5.6 6.4L4 8.2M4 3.5v4.8h4.8M4.5 13a7.8 7.8 0 0 0 13.9 4.6l1.6-1.8M20 20.5v-4.8h-4.8')),
    plus: svg(S_('M12 5v14M5 12h14')),
    addTube: svg(S_('M5 21V9.5h7.5V21M4 21h9.5M5 12.5h7.5M18 3.5v7M14.5 7h7')),
    twin: svg('<circle cx="9" cy="12" r="5.6"/><circle cx="15" cy="12" r="5.6"/>', 'ic twin'),
    gust: svg(S_('M3 8.5h10.5a2.8 2.8 0 1 0-2.8-2.8M3 12.5h14.5a2.8 2.8 0 1 1-2.8 2.8M3 16.5h6')),
    monocle: svg('<circle cx="10" cy="10" r="5.5"/>' + S_('M14 14l6 6.5')),
    lamp: svg(S_('M12 21V10M8 10h8l-1.8-5h-4.4zM9 21h6')),
    fog: svg(S_('M3 8c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 12.5c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 17c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0')),
    bolt: svg(F_('M13.5 2 5 13.5h5.6L9.5 22 19 9.8h-5.8z')),
    drop: svg(S_('M12 3.5c3.2 4.6 5.6 7.8 5.6 10.8a5.6 5.6 0 0 1-11.2 0c0-3 2.4-6.2 5.6-10.8z')),
    hush: svg(F_('M2.5 9.2h4l5-4.4v14.4l-5-4.4h-4z') + '<text x="13" y="17.5" font-size="11" font-weight="700" fill="currentColor" stroke="none">½</text>'),
    wind: svg(S_('M5 21v-6M10 21v-6M15 21v-6M20 21v-6M20 8H5M8.5 4.5 5 8l3.5 3.5')),
    ferry: svg(S_('M3 15.5h18l-2.6 4.5H5.6zM6 15.5v-4.2h12v4.2M9.5 11.3V7.5h5v3.8')),
    wires: svg(S_('M3.5 6.5c7 0 10 11 17 11M3.5 17.5c7 0 10-11 17-11')),
    rival: svg(S_('M5.5 21V3.5M5.5 4.5h12l-2.5 4 2.5 4h-12')),
    clock: svg('<circle cx="12" cy="12" r="8.6"/>' + S_('M12 7v5.2l3.4 2')),
    cut: svg(S_('M4 19V7M8.5 19V7M13 19V7M16.5 8l4.5 10M21 8l-4.5 10')),
    half: '<b class="half-b" aria-hidden="true">½</b>',
    rig: {
      tall: svg(S_('M8 21V6.5l4-3.5 4 3.5V21M12 16V9M9.6 11.2 12 8.8l2.4 2.4')),
      brass: svg(S_('M6.5 4.5h11v15h-11zM6.5 9.5h11M6.5 14.5h11')),
      spotlight: svg(S_('M9 3h6v4H9z') + F_('M9.4 7h5.2l5.4 14H4z')),
      lucky: svg(S_('M7 20.5V11a5 5 0 0 1 10 0v9.5M5 20.5h4M15 20.5h4')),
      mortar: svg('<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4"/>'),
    },
  };
  // Crowd figure for the mood pill: arms down / level / up (§8.4: a word plus a pose)
  const POSE = {
    restless: 'M12 10.5l-3.6 5M12 10.5l3.6 5',
    hopeful: 'M12 10.5l-5 .6M12 10.5l5 .6',
    eager: 'M12 10.5l-3.8-5.2M12 10.5l3.8-5.2',
  };
  const moodIcon = m => svg('<circle class="f" cx="12" cy="5.6" r="2.4"/>' + S_('M12 8.5v7M12 15.5l-3 5.5M12 15.5l3 5.5' + (POSE[m] ? ' ' + POSE[m] : '')), 'ic pose');

  /* ================= 2. Tiny helpers ================= */

  let G = null;                                                   // the GAME api
  const E = {};                                                   // element refs
  const $ = (sel, root = document) => root.querySelector(sel);
  const fnIn = (o, f) => !!o && typeof o[f] === 'function';
  const sim = () => (typeof OOH !== 'undefined' ? OOH : null);
  const fxApi = () => (typeof FX !== 'undefined' ? FX : null);
  const audioApi = () => (typeof AUDIO !== 'undefined' ? AUDIO : null);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const cap = s => String(s || '').replace(/^./, c => c.toUpperCase());
  const S = () => G.state;
  const ui = () => (G && G.ui) || 'BOOT';
  const building = () => ui() === 'BUILD' || ui() === 'RESULT';
  const reduced = () => !!(G && G.reducedMotion);
  const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  const touchy = () => (lastPointer ? lastPointer !== 'mouse' : !!(window.matchMedia && matchMedia('(hover: none)').matches));
  const overflows = el => !!el && el.getClientRects().length > 0 && el.scrollWidth > el.clientWidth + 0.5;
  // Progressive fitting: raise host[data-fit] one level at a time (CSS sheds detail per level) until over() is false.
  // `key` names everything the fit depends on (markup, width, fonts): an unchanged key skips the climb, which
  // would otherwise force a layout per level on every render.
  let fitEpoch = 0; // bumped when web fonts arrive
  function fitLadder(host, levels, over, key, pre) {
    if (!host) return 0;
    const k = key == null ? null : fitEpoch + '|' + mode + '|' + lastW + '|' + key;
    if (k != null && host._fitKey === k) return +host.dataset.fit || 0;
    if (!host.getClientRects().length) { host._fitKey = null; return +host.dataset.fit || 0; } // not rendered: fit when shown
    let lv = 0;
    host.dataset.fit = '0';
    if (pre) safe(pre);
    while (lv < levels && safe(over, false)) host.dataset.fit = String(++lv);
    host._fitKey = k;
    return lv;
  }
  // The ladders run in one frame callback, after every render of the task has written its markup: a click or a
  // GAME emit can render several times, and measuring inside each render forced a layout per render. The frame
  // callback runs before that frame's own layout and paint, so nothing unfitted is ever drawn. While a show
  // resolves the rows below the rack are collapsed: their ladders wait for the build (the next render re-queues).
  const fitJobs = new Map();
  let fitFrame = 0;
  const LIVE_FITS = ['hud', 'rack']; // visible while RESOLVING
  function queueFit(name, fn) {
    if (ui() === 'RESOLVING' && !LIVE_FITS.includes(name)) { fitJobs.delete(name); return; }
    fitJobs.set(name, fn);
    if (!fitFrame) fitFrame = requestAnimationFrame(flushFits);
  }
  function flushFits() {
    if (fitFrame) { cancelAnimationFrame(fitFrame); fitFrame = 0; }
    const live = ui() === 'RESOLVING', jobs = [...fitJobs].filter(([name]) => !live || LIVE_FITS.includes(name));
    fitJobs.clear();
    for (const [, f] of jobs) safe(f);
  }
  // A soft hyphen in long words (a VC|CV or V|CV break nearest the middle), for engines without hyphenation dictionaries.
  const shy = str => String(str).replace(/[A-Za-z]{8,}/g, w => {
    const V = c => /[aeiouy]/i.test(c);
    let best = -1;
    for (let p = 3; p <= w.length - 4; p++) {
      const ok = (V(w[p - 2]) && !V(w[p - 1]) && !V(w[p])) || (V(w[p - 1]) && !V(w[p]) && V(w[p + 1]));
      if (ok && (best < 0 || Math.abs(p - w.length / 2) < Math.abs(best - w.length / 2))) best = p;
    }
    return best < 0 ? w : w.slice(0, best) + '\u00ad' + w.slice(best);
  });
  // Write markup only when it changed: re-parsing tokens (SVG plates, pictogram data URLs) on every render is the
  // costliest part of a render, and unchanged nodes keep their animations, hover and focus.
  function setHTML(el, html) { if (el && el._html !== html) { el.innerHTML = html; el._html = html; } }
  const sfx = (name, opts) => { const a = audioApi(); if (fnIn(a, 'ui')) { try { a.ui(name, opts); } catch (e) { /* audio never blocks play */ } } };
  const announce = (text, o) => { if (G && fnIn(G, 'announce') && text) G.announce(text, o); };
  const haptic = p => { if (G && fnIn(G, 'haptic')) G.haptic(p); };
  function safe(fn, fallback) { try { return fn(); } catch (e) { if (G && G.flags && G.flags.debug) console.error('[play]', e); return fallback; } }

  /* ================= 3. Data access (OOH.DATA first, spec fallbacks second) ================= */

  const DATA = () => (sim() && sim().DATA) || {};
  function lookup(table, id) {
    if (!table || id == null) return null;
    if (Array.isArray(table)) return table.find(r => r && r.id === id) || null;
    return table[id] || null;
  }
  function row(id) {
    const r = lookup(DATA().SHELLS, id);
    return r || { id, name: cap(id), mono: cap(id).slice(0, 2), cost: 3, hang: 1, rarity: 'C' };
  }
  function rigInfo(id) {
    const r = lookup(DATA().RIGS, id) || {};
    return { id, name: r.name || cap(id), cost: r.cost != null ? r.cost : 0, text: r.text || r.effect || r.rule || '' };
  }
  function ruleInfo(id) {
    const r = lookup(DATA().RULE_INFO, id) || lookup(DATA().HEADLINERS, id) || {};
    return { id, name: r.name || cap(id), text: r.rule || r.text || r.effect || '' };
  }
  function tipText(id) {
    const t = DATA().TOOLTIPS, e = t && (Array.isArray(t) ? t.find(x => x && x.id === id) : t[id]);
    let s = (e && (typeof e === 'string' ? e : e.text)) || UI_TIPS[id] || '';
    if (id === 't_count') { const n = S().tubes.length; s = s.replace(/6→1/, n + '→1').replace(/1→6/, '1→' + n); }
    return s;
  }
  // A tip's advice without its opening restatement of the rule ("Headwind: … . Open with …" → "Open with …").
  function tipAdvice(id, name) {
    const t = tipText(id);
    if (!name || !t.startsWith(name + ':')) return t;
    return t.split(/(?<=[.!?])\s+/).slice(1).join(' ') || t;
  }
  const colRow = c => lookup(DATA().COLOURS, c) || lookup(DATA().COLOURS, 'W') || {};
  const colName = c => colRow(c).name || 'White';
  const colShape = c => colRow(c).shape || PLATE_KEY[c] || 'cross';
  const moodName = m => (DATA().MOOD_NAMES && DATA().MOOD_NAMES[m]) || cap(m);
  const shellName = sh => row(sh.id).name || cap(sh.id);
  const shellCol = sh => sh.col || row(sh.id).col || 'W';
  const rigShort = id => rigInfo(id).name.replace(/ Tube$/, '');
  function festName(f) {
    const t = DATA().FESTIVALS, e = t && t[f - 1];
    return (e && (typeof e === 'string' ? e : e.name)) || 'Afterparty ' + (f - 8);
  }
  function cardText(id, col, star) {
    const o = sim();
    const t = fnIn(o, 'describeShell') ? safe(() => o.describeShell(id, col, star), '') : '';
    return t || row(id).text || '';
  }
  function fusionPairs() {
    const F = DATA().FUSIONS;
    if (!F) return [];
    if (Array.isArray(F)) return F.map(f => [f.a || f.from, f.b || f.to, f]);
    return Object.keys(F).map(k => { const [a, b] = k.split('>'); return [a, b, F[k]]; });
  }
  function fusionFound(a, b) {
    const c = G.meta && G.meta.codex && G.meta.codex.fusions, e = c && c[a + '>' + b];
    return !!(e && e.found);
  }

  /* ---------- show indices, rules, targets (§2.2) ---------- */

  const festOf = s => Math.floor(s / 3) + 1;
  const slotOf = s => s % 3;
  const lastShow = () => (S().endless ? 35 : 23);
  const headlinerShow = s => s + (2 - slotOf(s));
  const showName = s => (s === 23 ? ruleInfo('countdown').name : ((DATA().SHOW_NAMES || [])[slotOf(s)] || ''));
  function rulesFor(s) {
    const o = sim(), st = S();
    if (fnIn(o, 'rulesFor')) { const r = safe(() => o.rulesFor(st, s), null); if (Array.isArray(r)) return r; }
    const f = festOf(s), k = slotOf(s);
    if (s === 23) return [st.renown >= 8 ? 'countdown3' : 'countdown'].concat(st.renown >= 7 ? ['rival'] : []);
    if (k === 2) return st.headliners && st.headliners[f - 1] ? [st.headliners[f - 1]] : [];
    if (k === 0 && st.renown >= 2 && f >= 2 && st.twilightTwists && st.twilightTwists[f - 1]) return [st.twilightTwists[f - 1]];
    return [];
  }
  function targetOf(s) {
    const o = sim();
    if (fnIn(o, 'target')) { const t = safe(() => o.target(S(), s), null); if (typeof t === 'number') return t; }
    const T = DATA().TARGETS;
    return (T && T[s]) || 0;
  }
  function fmt(n) {
    const o = sim();
    if (fnIn(o, 'fmt')) return o.fmt(n);
    n = Math.floor(n || 0);
    if (Math.abs(n) < 1e4) return n.toLocaleString('en-US');
    for (const [d, u] of [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']]) if (Math.abs(n) >= d) { const v = n / d; return (v >= 10 ? Math.floor(v) : Math.floor(v * 10) / 10) + u; }
    return String(n);
  }
  const fmtAah = a => (a < 100 ? String(Math.round(a * 10) / 10) : fmt(a));
  const fmtChip = v => (Math.abs(v) < 100 && v % 1 ? String(Math.round(v * 10) / 10) : fmt(v));
  const fmtX = x => '×' + (Math.round(x * 100) / 100);

  /* ---------- rack math: prices, fire order, the sky (§3.1) ---------- */

  const starMult = st => [1, 2, 4][(st || 1) - 1] || 1;
  function upCost(sh) {
    const o = sim();
    if (fnIn(o, 'upCost')) { const v = safe(() => o.upCost(sh.id, sh.star || 1), null); if (typeof v === 'number') return v; }
    const c = row(sh.id).cost || 3;
    return sh.star >= 2 ? 2 * c : Math.ceil(1.5 * c);
  }
  const sellValue = sh => (fnIn(sim(), 'sellValue') ? sim().sellValue(sh) : Math.max(1, Math.floor(0.75 * (sh.paid || 0))));
  const rarityOf = r => RARITY[r.rar || r.rarity] || RARITY.C;
  function rerollCost() {
    const o = sim(), st = S();
    if (fnIn(o, 'rerollCost')) return o.rerollCost(st);
    return (st.renown >= 3 ? 2 : 1) + ((st.shop && st.shop.rerolls) || 0);
  }
  function tubeCost() {
    const o = sim(), st = S();
    if (fnIn(o, 'tubeCost')) return o.tubeCost(st);
    return (st.tubes.length <= 4 ? 6 : 10) + (st.renown >= 4 ? 4 : 0);
  }
  const shots = tb => ((row(tb.shell.id).shots || 1) * (tb.rig === 'mortar' ? 2 : 1));
  const hangOf = (tb, rules) => (row(tb.shell.id).hang || 0) + (tb.rig === 'tall' ? 1 : 0) - (rules.includes('drizzle') ? 1 : 0);

  function fireSeq(tubes, rules) {
    let seq = tubes.map((_, i) => i);
    if (rules.includes('windshift')) seq.reverse();
    if (rules.includes('crossed')) seq = seq.filter(i => i % 2).concat(seq.filter(i => !(i % 2)));
    if (rules.includes('shortfuse')) seq = seq.filter(i => i < 5);
    if (rules.includes('countdown')) seq = seq.slice().reverse().concat(seq);
    if (rules.includes('countdown3')) seq = seq.concat(seq.slice().reverse(), seq);
    return seq.filter(i => tubes[i] && tubes[i].shell);
  }
  // Per tube: the burst ordinals it fires, grouped by fuse pass (Countdown has 2 or 3 passes).
  function fireOrder(tubes, rules) {
    const per = tubes.map(() => []), seq = fireSeq(tubes, rules);
    let n = 0, pass = 0, seen = new Set();
    for (const t of seq) {
      if (seen.has(t)) { pass++; seen = new Set(); }
      seen.add(t);
      const k = shots(tubes[t]);
      per[t].push({ pass, from: n + 1, to: n + k });
      n += k;
    }
    return { per, total: n, seq, passes: pass + 1 };
  }
  // A small replay of hang ageing: "sees N" and which tubes see each tube's bursts (canopy arc).
  function skyRun(tubes, rules) {
    const sees = tubes.map(() => null), seenBy = tubes.map(() => new Set());
    const fog = rules.includes('fog');
    let sky = [];
    for (const t of fireSeq(tubes, rules)) {
      const tb = tubes[t], r = row(tb.shell.id), p = r.params && typeof r.params === 'object' ? r.params : {};
      for (let k = 0; k < shots(tb); k++) {
        const vis = fog ? sky.slice(-2) : sky;
        if (sees[t] == null) sees[t] = vis.length;
        vis.forEach(b => { if (b.t !== t) seenBy[b.t].add(t); });
        if (p.extend) sky.forEach(b => { b.h += Math.ceil(p.extend * starMult(tb.shell.star)); });
        if ('clearAah' in p || 'clearX' in p) sky = [];
        sky.forEach(b => { b.h -= 1; });
        sky = sky.filter(b => b.h > 0);
        const h = hangOf(tb, rules);
        if (h > 0) sky.push({ t, h });
      }
    }
    return { sees, seenBy };
  }
  // previewChips → one normalised chip per tube (null for empty tubes). Never a total (§3.3).
  function chipsOf(state, rules) {
    const o = sim(), n = state.tubes.length, out = new Array(n).fill(null);
    if (!fnIn(o, 'previewChips')) return out;
    const raw = safe(() => o.previewChips(state, rules), null);
    const arr = Array.isArray(raw) ? raw : (raw && (raw.tubes || raw.chips)) || [];
    arr.forEach((c, j) => {
      if (!c || typeof c !== 'object') return;
      const t = Number.isInteger(c.tube) ? c.tube : j;
      if (t >= 0 && t < n) out[t] = normChip(c);
    });
    return out;
  }
  function normChip(c) {
    const num = (...ks) => { for (const k of ks) if (typeof c[k] === 'number' && isFinite(c[k])) return c[k]; return 0; };
    const fu = c.fusion || c.fusionName || null;
    return {
      sees: typeof c.sees === 'number' ? c.sees : null,
      ooh: num('ooh', 'plusOoh', 'oohGain', 'gainOoh'),
      aah: num('aah', 'plusAah', 'aahGain', 'gainAah'),
      x: num('x', 'mult', 'times', 'multAah') || 1,
      xAah: num('xAah'),
      fusion: fu && typeof fu === 'object' ? (fu.name || fu.id || '?') : fu,
      fusionKey: fu && typeof fu === 'object' ? fu.key || null : null,
      fusionNext: c.fusionNext && typeof c.fusionNext === 'object' ? { key: c.fusionNext.key || '', name: c.fusionNext.name || '?', tube: c.fusionNext.tube } : null,
      crowd: num('crowd', 'crowdGain'),
      coin: num('coin', 'coins', 'coinGain'),
      half: !!c.half, washed: !!c.washed, dud: !!c.dud,
    };
  }
  function moodOf(state, rules) {
    const o = sim();
    if (!fnIn(o, 'mood')) return null;
    const m = safe(() => (rules ? o.mood(state, rules) : o.mood(state)), null);
    return m ? String(m).toLowerCase() : null;
  }
  const legalList = () => (fnIn(sim(), 'legalActions') ? safe(() => sim().legalActions(S()), []) || [] : []);

  /* ---------- slots ---------- */

  const slotKey = s => s.zone + ':' + s.i;
  const sameSlot = (a, b) => !!a && !!b && a.zone === b.zone && a.i === b.i;
  const slotShell = s => (s.zone === 'tube' ? ((S().tubes[s.i] || {}).shell || null) : ((S().crate || [])[s.i] || null));
  const slotName = s => (s.zone === 'tube' ? 'tube ' + (s.i + 1) : 'Crate slot ' + (s.i + 1));
  function owned() { // [{sh, slot}] in tube order, then Crate order
    const out = [];
    S().tubes.forEach((tb, i) => { if (tb.shell) out.push({ sh: tb.shell, slot: { zone: 'tube', i } }); });
    (S().crate || []).forEach((sh, i) => { if (sh) out.push({ sh, slot: { zone: 'crate', i } }); });
    return out;
  }

  /* ================= 4. Module state ================= */

  let mode = 'regular';          // 'regular' | 'compact' | 'scroll' (§8.1)
  let view = null;               // derived per render (rules, order, chips, sees, ♛, mood…)
  let held = null;               // {kind:'card', i} | {kind:'shell', slot} | {kind:'rig'}
  let hover = null;              // slot under the drag / keyboard focus while holding
  let targets = new Map();       // slotKey → the legal action for dropping `held` there
  let swaps = new Map();         // slotKey → {kind:'swap'|'replace', out, refund, cost} for a card over an occupied tube
  let hypo = new Map();          // slotKey → {state, chips, order, sky} for that drop
  let sellArmed = null;          // slotKey armed for a 2-tap sell
  let flash = null;              // transient info-card message, cleared by the next input
  let rehearse = false;          // Rehearse (H): preview the next Headliner
  let drag = null;               // pointer bookkeeping
  let lastPointer = '';          // 'mouse' | 'touch' | 'pen' of the last press (the chip legend is for touch)
  let suppressUntil = 0;         // swallow the click that follows a drag / long-press
  let shownShow = -1;            // the show whose build we last opened
  let frozen = false;            // HUD / rack / shop hold still while RESOLVING
  let litTarget = 0;             // the target of the show being resolved
  const readout = { on: false, ooh: 0, aah: 1, score: 0 };
  let result = null;             // the pinned result card
  let tip = null;                // {id, anchor} currently shown
  const tipQueue = [];
  const seenLocal = new Set();
  let ffOnce = false;            // Space while resolving: fast-forward first, then skip
  let swallowKeyClick = 0;       // a handled Space/Enter must not also "click" the focused button
  const pictos = new Map();

  /* ================= 5. Tokens (§4.1): plate shape + pictogram + monogram + pips ================= */

  const PLATE = {
    circle: '<circle cx="22" cy="22" r="18.6"/>',
    triangle: '<path d="M22 4.2 40.2 37.6H3.8z"/>',
    square: '<rect x="4.6" y="4.6" width="34.8" height="34.8" rx="8"/>',
    diamond: '<path d="M22 2.4 41.6 22 22 41.6 2.4 22z"/>',
    cross: '<path d="M15.6 3.4h12.8v12.2h12.2v12.8H28.4v12.2H15.6V28.4H3.4V15.6h12.2z"/>',
    star: (() => { // 8 points, 4 colour wedges (Rainbow)
      const P = (a, r) => (22 + r * Math.cos(a)).toFixed(1) + ' ' + (22 + r * Math.sin(a)).toFixed(1);
      let s = '';
      for (let k = 0; k < 8; k++) {
        const a = (k * 45 - 90) * Math.PI / 180, d = Math.PI / 8;
        s += `<path class="w${k >> 1}" d="M22 22L${P(a - d, 8.6)}L${P(a, 20.4)}L${P(a + d, 8.6)}z"/>`;
      }
      return s;
    })(),
  };
  const plateSVG = col => `<svg class="tok-plate" viewBox="0 0 44 44" aria-hidden="true" focusable="false">${PLATE[PLATE_KEY[col] || 'cross']}</svg>`;

  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function fallbackPicto(col) { // a plain radial burst when FX.pictogram is unavailable
    const c = document.createElement('canvas');
    c.width = c.height = 52;
    const g = c.getContext('2d');
    if (!g) return '';
    const cols = col === 'X' ? ['R', 'A', 'G', 'B'] : [col];
    g.lineCap = 'round'; g.lineWidth = 2.6;
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6, cx = Math.cos(a), cy = Math.sin(a);
      g.strokeStyle = g.fillStyle = cssVar('--c-' + cols[k % cols.length]) || '#fff';
      g.beginPath(); g.moveTo(26 + 6 * cx, 26 + 6 * cy); g.lineTo(26 + 18 * cx, 26 + 18 * cy); g.stroke();
      g.beginPath(); g.arc(26 + 22 * cx, 26 + 22 * cy, 2.4, 0, 7); g.fill();
    }
    return c.toDataURL();
  }
  function picto(id, col, star) {
    const key = id + '|' + col + '|' + star;
    if (pictos.has(key)) return pictos.get(key);
    let url = '';
    const f = fxApi();
    if (fnIn(f, 'pictogram')) {
      const cv = safe(() => f.pictogram(id, col, star, 26, { highContrast: !!(G.settings && G.settings.highContrast) }), null);
      if (cv && fnIn(cv, 'toDataURL')) url = safe(() => cv.toDataURL(), '');
    }
    if (!url) url = fallbackPicto(col);
    pictos.set(key, url);
    return url;
  }
  function pipsHTML(hang, drizzle) {
    if (hang == null) return '';
    const n = Math.max(0, hang);
    let s = '';
    for (let k = 0; k < n; k++) s += '<i></i>';
    if (drizzle) s += '<i class="x"></i>';
    if (!s) s = '<i class="o"></i>';
    return `<span class="tok-hang">${s}</span>`;
  }
  // o: {size:'lg'|'md'|'sm'|'xs'|'mini', hang, drizzle, cls, badges}
  function tokenHTML(sh, o = {}) {
    const col = shellCol(sh), star = sh.star || 1, r = row(sh.id);
    let stars = '';
    for (let k = 0; k < star; k++) stars += '<i></i>';
    return `<span class="tok tok-${o.size || 'lg'}${o.cls || ''}" data-col="${col}">${plateSVG(col)}` +
      `<span class="tok-pic" style="background-image:url(${picto(sh.id, col, star)})"></span>` +
      `<span class="tok-star" aria-hidden="true">${stars}</span><span class="tok-mono" aria-hidden="true">${esc(r.mono || '')}</span>` +
      (o.size === 'mini' ? '' : pipsHTML(o.hang, o.drizzle)) + (o.badges || '') + '</span>';
  }
  const describeTok = sh => `${shellName(sh)}, ${colName(shellCol(sh))} ${colShape(shellCol(sh))}, star ${sh.star || 1}`;

  /* ================= 6. Skeleton (built once; renders only update contents) ================= */

  function build() {
    E.app = $('#app');
    E.play = $('#play');
    E.hud = $('#hud');
    E.sponsor = $('#sponsor');
    E.skyWrap = $('#sky-wrap');
    E.sky = $('#sky');
    E.over = $('#sky-overlay');
    E.rack = $('#rack');
    E.tools = $('#tools');
    E.shop = $('#shop');
    E.workshop = $('#workshop');
    E.firebar = $('#firebar');
    E.fire = $('#fire');
    E.inspect = $('#inspect');

    // HUD: one DOM, two grid layouts (Regular two rows / Compact one row)
    E.hud.innerHTML =
      `<button type="button" class="hud-ic hud-pause" data-act="pause" aria-label="Pause (P)">${ICON.pause}</button>` +
      '<div class="hud-title"><span id="hud-show"></span></div>' +
      '<div class="hud-tgt"><span id="hud-target"></span><span class="hud-next"></span>' +
      '<button type="button" class="hud-head" data-hud="head"></button></div>' +
      `<button type="button" class="hud-coins" data-hud="coins"><span class="vh">Coins</span><span id="hud-coins" class="num" data-fx-anchor="coins"></span></button>` +
      `<button type="button" class="hud-crowd" data-hud="crowd"><span class="vh">Crowd</span>${ICON.crowd}<span id="hud-crowd" class="num"></span><span class="hud-half" hidden>½</span></button>` +
      '<button type="button" class="hud-ic hud-rain" data-hud="rain"></button>';
    E.hudTitle = $('.hud-title', E.hud);
    E.hudTgt = $('.hud-tgt', E.hud);
    E.show = $('#hud-show');
    E.target = $('#hud-target');
    E.next = $('.hud-next', E.hud);
    E.head = $('.hud-head', E.hud);
    E.coins = $('#hud-coins');
    E.crowd = $('#hud-crowd');
    E.crowdHalf = $('.hud-half', E.hud);
    E.coinsBtn = $('.hud-coins', E.hud);
    E.crowdBtn = $('.hud-crowd', E.hud);
    E.rain = $('.hud-rain', E.hud);

    // Sponsor: the whole strip is one toggle
    E.sponsor.innerHTML = '<button type="button" class="sp-toggle" data-act="sponsor" aria-pressed="false"><span class="sp-text"></span><span class="sp-switch"><span class="sp-knob"></span><span class="sp-word">Accept</span></span></button>';
    E.spBtn = $('.sp-toggle', E.sponsor);

    // Sky overlay: DOM labels over the canvas (never fillText body text; §11.5)
    E.over.innerHTML =
      '<div class="sky-top"><div class="sky-label"></div><button type="button" class="rh-pill" data-sky="rule" hidden></button></div>' +
      '<div class="lastchance" hidden>Last chance: one more miss ends the run</div>' +
      '<div class="readout" hidden aria-hidden="true"><span class="ro-o">OOH <b data-fx-anchor="ooh">0</b></span><span class="ro-x">×</span><span class="ro-a">AAH <b data-fx-anchor="aah">1</b></span><span class="ro-cap" hidden>cap 30</span></div>' +
      '<div class="result" hidden></div>' +
      '<div class="tip" hidden role="note"></div>' +
      '<div class="cheer" aria-hidden="true"><i class="band"></i><i class="fill"></i><i class="tick"></i></div>' +
      '<div class="info" hidden></div>' +
      '<div class="legend" hidden aria-hidden="true"></div>';
    E.skyLabel = $('.sky-label', E.over);
    E.rhPill = $('.rh-pill', E.over);
    E.lastChance = $('.lastchance', E.over);
    E.readout = $('.readout', E.over);
    E.roO = $('.ro-o b', E.over);
    E.roA = $('.ro-a b', E.over);
    E.roCap = $('.ro-cap', E.over);
    E.result = $('.result', E.over);
    E.tip = $('.tip', E.over);
    E.cheer = $('.cheer', E.over);
    E.info = $('.info', E.over);
    E.legend = $('.legend', E.over);

    // Rack: 6 stable tube buttons (unused ones hidden), canopy arc, fuse
    let tubes = '';
    for (let i = 0; i < 6; i++) {
      tubes += `<button type="button" class="tube" data-tube="${i}"><span class="t-num"></span><span class="t-sees"></span>` +
        '<span class="t-body"><span class="t-tok"></span><span class="t-chips"></span></span><span class="t-rig"></span></button>';
    }
    E.rack.innerHTML = '<svg class="arc" aria-hidden="true" focusable="false"></svg>' +
      `<div class="tubes">${tubes}</div><div class="fuse" aria-hidden="true"><i class="ember"></i></div>`;
    E.arc = $('.arc', E.rack);
    E.tubesWrap = $('.tubes', E.rack);
    E.fuse = $('.fuse', E.rack);
    E.ember = $('.ember', E.fuse);
    E.tubes = [...E.rack.querySelectorAll('.tube')].map(b => ({
      btn: b, num: $('.t-num', b), sees: $('.t-sees', b), body: $('.t-body', b), tok: $('.t-tok', b), chips: $('.t-chips', b), rig: $('.t-rig', b),
    }));

    // Tools: Crate ×2 pinned left, divider, Undo / Match / Restore / Rehearse
    E.tools.innerHTML =
      '<div class="crate">' +
      '<button type="button" class="slot" data-crate="0"></button><button type="button" class="slot" data-crate="1"></button></div>' +
      '<span class="divider" aria-hidden="true"></span>' +
      `<button type="button" class="tool" data-act="undo" aria-label="Undo (U)">${ICON.undo}<span class="tl" aria-hidden="true">Undo</span></button>` +
      `<button type="button" class="tool" data-act="match" aria-label="Match: re-seat shells for tonight's fuse (M)">${ICON.match}<span class="tl" aria-hidden="true">Match</span></button>` +
      `<button type="button" class="tool" data-act="restore" aria-label="Restore last show's order (B)">${ICON.restore}<span class="tl" aria-hidden="true">Restore</span></button>` +
      `<button type="button" class="tool" data-act="rehearse" aria-pressed="false" aria-label="Rehearse the next Headliner (H)">${ICON.rehearse}<span class="tl" aria-hidden="true">Rehearse</span></button>`;
    E.crates = [...E.tools.querySelectorAll('[data-crate]')];
    E.undo = $('[data-act="undo"]', E.tools);
    E.match = $('[data-act="match"]', E.tools);
    E.restore = $('[data-act="restore"]', E.tools);
    E.rehearse = $('[data-act="rehearse"]', E.tools);


    // Shop: 4 stable card buttons (3 in a row, or 4 in a 2×2 grid)
    let cards = '';
    for (let i = 0; i < 4; i++) cards += `<button type="button" class="card" data-card="${i}"></button>`;
    E.shop.innerHTML = `<div class="cards">${cards}</div><p class="shop-empty" hidden></p>`;
    E.cards = [...E.shop.querySelectorAll('[data-card]')];
    E.shopEmpty = $('.shop-empty', E.shop);

    // Workshop: rig card, add tube, reroll (hidden in Festival 1)
    E.workshop.innerHTML =
      '<button type="button" class="ws ws-rig" data-act="buyRig"></button>' +
      '<button type="button" class="ws ws-tube" data-act="buyTube"></button>' +
      '<button type="button" class="ws ws-reroll" data-act="reroll"></button>';
    E.rigBtn = $('[data-act="buyRig"]', E.workshop);
    E.tubeBtn = $('[data-act="buyTube"]', E.workshop);
    E.rerollBtn = $('[data-act="reroll"]', E.workshop);

    // Fire: the label only. The mood pill is its own button beside it (a tap on it explains the mood, never lights).
    E.fire.innerHTML = '<span class="fire-lbl">Light the fuse</span>';
    E.fireLbl = $('.fire-lbl', E.fire);
    E.mood = document.createElement('button');
    E.mood.type = 'button';
    E.mood.className = 'mood';
    E.mood.dataset.act = 'mood';
    E.mood.hidden = true;
    E.firebar.appendChild(E.mood);
  }

  /* ================= 7. Layout (ResizeObserver on the column; §8.1) ================= */

  let lastW = 0;
  // Rack geometry, read only where layout is already clean (the ResizeObserver callback) or in a frame callback,
  // never straight after a render's DOM writes (that forces a full layout: ~130 ms of Run it back on a phone).
  // Tube centres follow from it by arithmetic (48 px tubes, flex-centred, --tgap apart).
  const geo = { ok: false, wrapW: 0, offX: 0, rackX: 0, rackW: 0 };
  let rackGap = 8;
  function readGeo() { // → true when it changed
    const w = E.tubesWrap.clientWidth;
    if (!w) { const was = geo.ok; geo.ok = false; return was; }
    const tr = E.tubesWrap.getBoundingClientRect(), sr = E.sky.getBoundingClientRect(), rr = E.rack.getBoundingClientRect();
    const g = { ok: true, wrapW: w, offX: tr.left + E.tubesWrap.clientLeft - sr.left, rackX: tr.left + E.tubesWrap.clientLeft - rr.left, rackW: rr.width };
    const changed = !geo.ok || ['wrapW', 'offX', 'rackX', 'rackW'].some(k => Math.abs(g[k] - geo[k]) > 0.25);
    Object.assign(geo, g);
    return changed;
  }
  function measure() {
    if (!E.play) return;
    const h = E.play.clientHeight, w = E.play.clientWidth;
    const moved = readGeo();
    const m = h >= 700 ? 'regular' : h >= 520 ? 'compact' : 'scroll';
    if (m !== mode || E.play.dataset.mode !== m) {
      mode = m;
      E.play.dataset.mode = m;
      (m === 'regular' ? E.hudTitle : E.skyLabel).appendChild(E.show);
      lastW = w;
      render(); flushFits();
    } else if (w !== lastW || moved) { lastW = w; render(); flushFits(); } // tube spacing and the fit ladders depend on the width
    else pushScene();
  }

  // Tube centres in canvas CSS px, for FX.setScene (x of tube i from the cached geometry; no layout read).
  const tubeX = (i, n, off) => off + (geo.wrapW - (n * 48 + (n - 1) * rackGap)) / 2 + 24 + i * (48 + rackGap);
  function tubeCentres() {
    if (!E.sky || !G || !G.state) return [];
    const n = S().tubes.length;
    if (!geo.ok) readGeo(); // an explicit call before the first layout pass: measure once
    return S().tubes.map((_, i) => tubeX(i, n, geo.offX));
  }
  let sceneFrame = 0;
  let lastScene = '';
  function pushScene() {
    const f = fxApi();
    if (!fnIn(f, 'setScene') || !view || frozen) return;
    if (!geo.ok) { // not laid out yet (or hidden): measure in the next frame, where the layout is due anyway
      if (!sceneFrame) sceneFrame = requestAnimationFrame(() => { sceneFrame = 0; readGeo(); if (geo.ok) pushScene(); });
      return;
    }
    const st = S(), xs = tubeCentres(), tf = (st.runStats && st.runStats.timesFired) || {};
    const cheer = { restless: 0.2, hopeful: 0.5, eager: 0.85 }[view.mood] || 0;
    const scene = {
      festival: festOf(view.s), show: view.s, crowd: st.crowd, rules: view.tonight, previewRules: view.rules,
      tubes: st.tubes.map((tb, i) => ({ x: Math.round(xs[i] * 10) / 10, soot: soot(tf[i]), shellCol: tb.shell ? shellCol(tb.shell) : null, shellId: tb.shell ? tb.shell.id : null, star: tb.shell ? tb.shell.star : 0, rig: tb.rig || null })),
      haze: slotOf(view.s) / 3, cheer, mood: moodVisible() ? view.mood : null, fav: view.fav,
    };
    const sig = JSON.stringify(scene);
    if (sig === lastScene) return;
    lastScene = sig;
    safe(() => f.setScene(scene));
  }
  const soot = n => Math.min(4, Math.floor(Math.log2(1 + (n || 0))));

  /* ================= 8. Derived view (computed once per render) ================= */

  function computeView() {
    const st = S(), s = st.show | 0;
    const tonight = rulesFor(s), hs = headlinerShow(s);
    const auto = hs === s; // a Headliner's own build: tonight's rule is the preview (§8.4)
    const hRules = rulesFor(Math.min(hs, lastShow()));
    const rehearsing = rehearseOn() && !auto && hRules.length > 0;
    const rules = rehearsing ? hRules : tonight;
    const order = fireOrder(st.tubes, rules);
    const chips = chipsOf(st, rules);
    const sky = skyRun(st.tubes, rules);
    let sees = fnIn(sim(), 'seesPerTube') ? safe(() => sim().seesPerTube(st, rules), null) : null;
    if (!Array.isArray(sees)) sees = chips.some(c => c && c.sees != null) ? chips.map(c => (c ? c.sees : null)) : sky.sees;
    const fav = fnIn(sim(), 'favourite') ? safe(() => sim().favourite(st.tubes, st.crowd), null) : null;
    const mood = moodOf(st), pmood = rehearsing ? moodOf(st, rules) : mood;
    view = { s, tonight, hs, hRules, rules, rehearsing, auto, order, chips, sky, sees, fav, mood, pmood, legal: legalList(), pv: pvSig() };
  }
  // GAME.preview.rehearse is the source of truth (core); a local flag stands in without it.
  function rehearseOn() { const p = G.preview; return p && typeof p === 'object' && 'rehearse' in p ? !!p.rehearse : rehearse; }
  const pvSig = () => { const p = G.preview; return p && typeof p === 'object' ? String(p.rehearse) + '|' + String(p.rules) : ''; };
  function setRehearse(v) {
    const p = G.preview;
    if (fnIn(G, 'setRehearse')) G.setRehearse(v);
    else if (p && typeof p === 'object' && 'rehearse' in p) p.rehearse = v;
    else { rehearse = v; if (fnIn(G, 'emit')) G.emit('preview', { rehearse: v }); render(); }
  }
  function moodVisible() {
    if (!view || !view.mood) return false;
    if (fnIn(G, 'moodVisible')) return !!G.moodVisible();
    return !(G.settings && G.settings.mood === false) && !(S().firstRun && view.s < 2);
  }
  const hasRule = r => !!view && view.rules.includes(r);
  function missedBefore() { const h = (S().runStats && S().runStats.history) || []; return h.some(e => e && !e.pass && !e.relit); }
  const critical = () => missedBefore() && S().phase !== 'lost';
  function lastChance() { // §5.4: first build after the miss, and every Headliner / Countdown build after it
    if (G.critical && typeof G.critical === 'object') return !!G.critical.lastChance && building();
    if (!critical() || !building()) return false;
    const h = S().runStats.history, last = h[h.length - 1];
    return (last && !last.pass) || slotOf(view.s) === 2;
  }
  const legalHas = type => view.legal.some(a => a.type === type);

  /* ================= 9. Rendering ================= */

  function render() {
    if (!G || !G.state || !E.play) return;
    safe(() => {
      syncShow();
      computeView();
      if (!frozen) { renderHud(); renderSponsor(); renderRack(); renderTools(); renderShop(); renderWorkshop(); }
      renderFire();
      renderSky();
      pushScene();
      checkTips();
    });
  }

  /* ---------- HUD (Regular: 2 rows; Compact: 1 row) ---------- */
  function renderHud() {
    const st = S(), s = view.s;
    // "Festival · Show"; when that would truncate, the show name folds into 3 pips (Twilight · Evening · ♛ Headliner)
    const k = slotOf(s);
    let pips = '';
    for (let j = 0; j < 3; j++) pips += j === 2 ? `<i class="hl${k === 2 ? ' now' : ''}">${ICON.crown}</i>` : `<i class="${j < k ? 'done' : j === k ? 'now' : ''}"></i>`;
    setHTML(E.show, `<span class="hs-fest">${esc(festName(festOf(s)))}</span><span class="hs-slot"> · ${esc(showName(s))}</span>` +
      `<span class="hs-pips" aria-hidden="true" title="${esc(showName(s))}">${pips}</span>`);
    setHTML(E.target, `<span class="tgt-w">Target </span><span class="tgt-g" aria-hidden="true">◎</span><b class="display num">${fmt(targetOf(s))}</b>`);
    const nx = [];
    for (let j = s + 1; j <= Math.min(lastShow(), s + 2); j++) nx.push(`<span class="nx${j - s}">${fmt(targetOf(j))}${slotOf(j) === 2 ? ICON.crown : ''}</span>`);
    setHTML(E.next, nx.length ? '<span aria-hidden="true">▸</span> ' + nx.join('<span class="nx2"> · </span>') : '');
    E.next.setAttribute('aria-label', 'Next targets: ' + [s + 1, s + 2].filter(j => j <= lastShow()).map(j => fmt(targetOf(j)) + (slotOf(j) === 2 ? ' (Headliner)' : '')).join(', '));
    const hid = view.hRules[0];
    E.head.hidden = !hid;
    if (hid) {
      const h = ruleInfo(hid), tonight = view.hs === s;
      setHTML(E.head, `<span class="hh-pill">${ruleIcon(hid)}<span class="hh-name">${esc(h.name)}</span></span>`);
      E.head.setAttribute('aria-label', `${tonight ? 'Tonight' : 'Headliner, show ' + (view.hs + 1)}: ${h.name}. ${h.text} Open the card.`);
      E.head.classList.toggle('now', tonight);
    }
    E.coins.textContent = '$' + st.coins;
    E.crowd.textContent = fmt(st.crowd);
    E.crowdHalf.hidden = !hasRule('ferry');
    E.coinsBtn.setAttribute('aria-label', `Coins: $${st.coins}. What they do`);
    E.crowdBtn.setAttribute('aria-label', `Crowd: ${fmt(st.crowd)}${hasRule('ferry') ? ', half tonight' : ''}. What it does`);
    const used = critical(), fw = !!st.fairWeather;
    const noRain = !used && (view.tonight.some(r => /^countdown/.test(r)) || st.renown >= 6 || st.rain === 0);
    setHTML(E.rain, ICON.umbrella.replace('</svg>', (used ? ICON.crack : '') + '</svg>') + (fw ? '<span class="fw">FW</span>' : ''));
    E.rain.dataset.state = used ? 'used' : noRain ? 'none' : 'ok';
    E.rain.setAttribute('aria-label', (used ? 'Rain check used: last chance' : noRain ? 'No rain check tonight' : 'Rain check: unused') + (fw ? '. Fair Weather on' : ''));
    queueFit('hud', fitHud);
  }
  // Nothing in the HUD clips at 360 px: each row sheds detail in a fixed order until it fits (fonts vary by device).
  function fitHud() {
    // Row A (Regular only; Compact shows the name in the sky): 1 pips · 2 Crowd to Row B · 3 both · 4 festival name only
    const hk = E.show._html + E.coins.textContent + E.crowd.textContent + E.crowdHalf.hidden;
    if (mode === 'regular') fitLadder(E.hud, 4, () => overflows(E.show), hk); else { E.hud.dataset.fit = '0'; E.hud._fitKey = null; }
    // Row B: 1 Headliner chip icon only · 2 one next target · 3 no next targets
    fitLadder(E.hudTgt, 3, () => E.hudTgt.scrollWidth > E.hudTgt.clientWidth + 0.5, hk + E.hud.dataset.fit + E.target._html + E.next._html + E.head._html + E.head.hidden);
  }
  function ruleIcon(id) {
    const m = { headwind: ICON.gust, critic: ICON.monocle, streetlights: ICON.lamp, fog: ICON.fog, powercut: ICON.bolt, drizzle: ICON.drop,
      ordinance: ICON.hush, windshift: ICON.wind, ferry: ICON.ferry, crossed: ICON.wires, rival: ICON.rival, countdown: ICON.clock,
      countdown3: ICON.clock, shortfuse: ICON.cut };
    return m[id] || ICON.crown;
  }

  /* ---------- Sponsor strip (Regular: its own row; Compact: over the sky's top edge) ---------- */
  function renderSponsor() {
    const sp = S().sponsor;
    E.sponsor.hidden = !sp;
    E.play.toggleAttribute('data-sponsor', !!sp);
    if (!sp) return;
    const s = view.s, t = sp.accepted ? targetOf(s) : Math.round(targetOf(s) * 1.5);
    const k = lookup(DATA().SPONSORS, sp.kind) || {}, name = k.flavour || cap(sp.kind), reward = k.reward || '';
    E.spBtn.setAttribute('aria-pressed', sp.accepted ? 'true' : 'false');
    const pay = k.short || (sp.kind === 'rare' ? 'a Collector card' : reward);
    const tx = E.spBtn.querySelector('.sp-text');
    setHTML(tx, `<span class="sp-l1"><b>Sponsor</b> <span class="sp-x">×1.5 </span>→ <b class="num">${fmt(t)}</b></span>` +
      `<span class="sp-l2"><span class="sp-dot"> · </span><span class="sp-p">pays </span>${esc(pay)}</span>`);
    // 360 px: the reward moves to a second line, then "pays" goes, then "×1.5" (all stay in the aria-label and Inspect)
    const l1 = tx.firstElementChild, l2 = tx.lastElementChild;
    queueFit('sponsor', () => fitLadder(E.sponsor, 3, () => overflows(tx) || overflows(l1) || overflows(l2), tx._html + sp.accepted));
    E.spBtn.querySelector('.sp-word').textContent = sp.accepted ? 'Accepted' : 'Accept';
    E.spBtn.setAttribute('aria-label', `Sponsor, ${name}: target times 1.5, to ${fmt(t)}. If you pass: ${reward.replace(/\.$/, '')}. ${sp.accepted ? 'Accepted' : 'Not accepted'}.`);
  }

  /* ---------- Rack: numerals → sees → token → rig plate → fuse ---------- */
  function renderRack() {
    const st = S(), v = view, n = st.tubes.length, rules = v.rules;
    const passes = rules.includes('countdown3') ? 3 : rules.includes('countdown') ? 2 : 1;
    E.rack.dataset.rows = passes;
    E.rack.classList.toggle('crit', critical());
    E.rack.classList.toggle('pulse', lastChance());
    E.rack.classList.toggle('fog', rules.includes('fog'));
    E.rack.classList.toggle('holding', !!held);
    const partners = G.settings && G.settings.chips === 'partners';
    const tf = (st.runStats && st.runStats.timesFired) || {};
    const firstT = v.order.seq[0];
    const critic = criticMarks(st.tubes, rules);
    // Spread the tubes when there are fewer than 6 (8–16 px gaps), so each "sees" chip has room.
    const W = geo.ok ? geo.wrapW : 0, gap = n > 1 && W ? Math.max(8, Math.min(16, Math.floor((W - n * 48) / (n - 1)))) : 8;
    E.rack.style.setProperty('--tgap', gap + 'px');
    rackGap = gap;
    // Numerals and sees chips describe ONE rack: the hovered drop's rack while hovering, else tonight's rack.
    // Each other legal drop shows its own local "sees" (and, on an empty tube, a ghost numeral).
    const hovKey = held && hover && hover.zone === 'tube' && targets.has(slotKey(hover)) ? slotKey(hover) : null;
    const hv = hovKey ? hypoFor(hovKey) : null;
    for (let i = 0; i < 6; i++) {
      const T = E.tubes[i], tb = st.tubes[i];
      T.btn.hidden = !tb;
      if (!tb) continue;
      const key = 'tube:' + i, can = !!held && targets.has(key), hy = can ? hypoFor(key) : null;
      // One numbering at a time: the hovered drop's rack while hovering, else tonight's rack as it stands. An empty
      // legal tube gets no numeral; its chip says where the drop would fire ("3rd", "LAST").
      const sh = tb.shell, ord = hv ? hv.order : v.order;
      // fire-order numerals (one row per fuse pass)
      let num = '';
      for (let p = 0; p < passes; p++) {
        const e = ord.per[i].find(x => x.pass === p);
        const last = e && e.to === ord.total;
        const lbl = !e ? '' : last && e.from === e.to ? 'LAST' : e.from === e.to ? String(e.from) : e.from + '–' + e.to;
        num += `<span class="n${last ? ' last' : ''}${!e ? ' none' : ''}">${lbl}</span>`;
      }
      if (rules.includes('shortfuse') && i >= 5) num = '<span class="n none">no fuse</span>';
      setHTML(T.num, num);
      // sees chip (hypothetical while this tube is a legal drop)
      const sees = hv ? hv.sees[i] : hy ? hy.sees[i] : v.sees[i];
      const showSees = (sh || hy || (hv && hovKey === key)) && sees != null;
      setHTML(T.sees, showSees ? `${ICON.sees}<span class="sw">sees\u00a0</span>${sees}` : '');
      T.sees.classList.toggle('local', !!(hy || hv) && showSees);
      T.sees.classList.toggle('fogged', rules.includes('fog') && sees != null);
      // token + telegraph badges
      const washed = rules.includes('streetlights') && i % 2 === 1;
      const half = sh && ((rules.includes('ordinance') && (row(sh.id).col === 'W')) || (rules.includes('rival') && v.fav === i));
      const dud = sh && rules.includes('headwind') && firstT === i;
      let badges = '';
      if (v.fav === i && sh) badges += `<span class="b-fav" title="Crowd Favourite">${ICON.crown}</span>`;
      if (half) badges += '<span class="b-half">½</span>';
      if (washed && sh) badges += `<span class="b-lamp">${ICON.lamp}</span>`;
      if (dud) badges += `<span class="b-dud">${ICON.gust}</span>`;
      if (critic.has(i) && sh) badges += `<span class="b-critic">${ICON.monocle}</span>`;
      const ch = v.chips[i];
      if (sh && ch && ch.crowd > 0 && !can) badges += `<span class="b-crowd">${ICON.crowd}+${fmtChip(ch.crowd)}</span>`;
      if (sh && ch && (ch.fusion || ch.fusionNext) && !held) badges += '<span class="b-fuse" title="Fuses">✦</span>';
      // Hang pips; under Drizzle one pip is shown crossed out (§4.7 telegraph)
      const baseHang = sh ? hangOf(tb, []) : 0, drz = rules.includes('drizzle') && baseHang > 0;
      setHTML(T.tok, sh ? tokenHTML(sh, { size: 'lg', hang: drz ? baseHang - 1 : baseHang, drizzle: drz, cls: washed ? ' washed' : '', badges })
        : `<span class="t-empty">${ICON.plus}</span>`);
      // local chips on legal drops: +Ooh, +Aah, ×, ✦, Crowd, $ (never a total; §8.4)
      let chips = '';
      const sw = can ? swaps.get(key) : null;
      if (hy && !sh && !hv) { // where an empty tube's drop would fire
        const e = hy.order.per[i];
        if (e && e.length) chips += `<span class="chip c-ord">${e[e.length - 1].to === hy.order.total ? 'LAST' : ordinal(e[0].from)}</span>`;
      }
      if (hy && hy.chips[i]) {
        const c = hy.chips[i], fu = c.fusion || (c.fusionNext && c.fusionNext.name);
        if (!partners) {
          if (c.ooh) chips += `<span class="chip c-ooh">+${fmtChip(c.ooh)}</span>`;
          if (c.aah) chips += `<span class="chip chip-aah c-aah">+${fmtChip(c.aah)}</span>`;
          if (c.x > 1) chips += `<span class="chip chip-x c-x">${fmtX(c.x)}</span>` + (c.xAah >= 0.05 ? `<span class="chip c-xaah">(+${fmtChip(c.xAah)})</span>` : '');
        }
        if (fu) chips += `<span class="chip chip-fusion">✦${fu === '?' ? ' ?' : ''}</span>`;
        if (!partners && c.crowd) chips += `<span class="chip c-crowd">${ICON.crowd}+${fmtChip(c.crowd)}</span>`;
        if (!partners && c.coin) chips += `<span class="chip c-coin">+$${fmtChip(c.coin)}</span>`;
        if (!partners && !c.ooh && !c.aah && !(c.x > 1) && !c.crowd && !c.coin && !fu) chips += '<span class="chip c-none">+0</span>';
      } else if (hy && !partners) chips += '<span class="chip c-none">+0</span>';
      if (hy && hy.breaks && hy.breaks.length) chips += `<span class="chip chip-fusion c-break" title="Breaks ${esc(hy.breaks.map(n => n || 'a new fusion').join(', '))}">✦✕</span>`;
      if (sw) chips += sw.kind === 'swap' ? `<span class="chip c-swap" title="Swap in: ${esc(shellName(sw.out))} goes to the Crate">→${ICON.crate}</span>`
        : `<span class="chip c-swap sell" title="Replace: sells ${esc(shellName(sw.out))}">✕+$${sw.refund}</span>`;
      setHTML(T.chips, chips);
      // rig plate
      setHTML(T.rig, tb.rig ? (ICON.rig[tb.rig] || '') : '');
      T.rig.className = 't-rig' + (tb.rig ? ' has' : '') + (held && held.kind === 'rig' && can ? ' can' : '');
      // state classes
      T.btn.dataset.soot = soot(tf[i]);
      T.btn.classList.toggle('empty', !sh);
      T.btn.classList.toggle('sel', !!held && held.kind === 'shell' && sameSlot(held.slot, { zone: 'tube', i }));
      T.btn.classList.toggle('can', can);
      T.btn.classList.toggle('hov', can && !!hover && hover.zone === 'tube' && hover.i === i);
      T.btn.classList.toggle('dim', !!held && !can && !T.btn.classList.contains('sel'));
      T.btn.classList.toggle('hatched', (rules.includes('shortfuse') && i >= 5) || !!dud);
      T.btn.classList.toggle('armed', sellArmed === key);
      T.btn.setAttribute('aria-label', tubeLabel(i, ord, sees, { half, washed }));
      T.btn.setAttribute('aria-pressed', T.btn.classList.contains('sel') ? 'true' : 'false');
    }
    // fuse: ember at the first tube; direction from tonight's (or rehearsed) rule
    const dir = rules.includes('countdown') || rules.includes('countdown3') ? 'back' : rules.includes('windshift') ? 'rtl' : rules.includes('crossed') ? 'cross' : 'ltr';
    E.fuse.dataset.dir = dir;
    E.fuse.style.width = Math.max(0, (n - 1) * (48 + gap)) + 'px';
    E.fuse.style.setProperty('--ex', (dir === 'rtl' || dir === 'back' ? Math.max(0, (n - 1) * (48 + gap)) : 0) + 'px'); // the fuse's start
    // "sees N" must never touch its neighbour: snug, then an eye glyph for the word (fonts vary by device)
    const rk = gap + E.tubes.map(t => (t.btn.hidden ? '-' : t.sees._html + t.sees.className)).join('|');
    queueFit('rack', () => fitLadder(E.rack, 2, () => E.tubes.some(t => !t.btn.hidden && t.sees.firstChild && t.sees.offsetWidth > 48 + gap - 3), rk));
    renderArc();
  }
  function tubeLabel(i, ord, sees, o) {
    const tb = S().tubes[i], sh = tb.shell;
    let s = `Tube ${i + 1}: `;
    if (!sh) s += 'empty';
    else {
      s += `${describeTok(sh)}, Hang ${Math.max(0, hangOf(tb, view.rules))}`;
    }
    if (tb.rig) s += ', rig ' + rigShort(tb.rig);
    if (sh) {
      const e = ord.per[i];
      if (e.length) s += ', fires ' + e.map(x => ordinal(x.from) + (x.to > x.from ? ' to ' + ordinal(x.to) : '')).join(' and ') + ' of ' + ord.total;
      else s += ', does not fire';
      if (sees != null) s += ', sees ' + sees;
      if (view.fav === i) s += ', Crowd Favourite';
      const vc = view.chips && view.chips[i];
      if (vc && vc.fusion) s += vc.fusion !== '?' ? ', fuses: ' + vc.fusion : ', fuses';
      else if (vc && vc.fusionNext) s += ', fuses with the next tube';
      if (o.half) s += ', half strength';
      if (o.washed) s += ', washed out';
    }
    if (held && targets.has('tube:' + i)) {
      const w = swaps.get('tube:' + i);
      s += !w ? ', drop here' : w.kind === 'swap' ? `, drop here to swap in: ${shellName(w.out)} goes to the Crate` : `, drop here to replace: sells ${shellName(w.out)} for ${w.refund} coins`;
      const hb = hypoFor('tube:' + i);
      if (hb && hb.breaks && hb.breaks.length) s += ', breaks ' + hb.breaks.map(n => n ? 'the ' + n + ' fusion' : 'a new fusion').join(' and ');
    }
    return s;
  }
  // The Critic: tubes with a burst right after a same-colour burst (White / Rainbow / wild exempt).
  function criticMarks(tubes, rules) {
    const out = new Set();
    if (!rules.includes('critic')) return out;
    let prev = null;
    for (const t of fireSeq(tubes, rules)) {
      const sh = tubes[t].shell, col = rules.includes('streetlights') && t % 2 ? 'W' : shellCol(sh);
      const wild = !!row(sh.id).wildColour;
      for (let k = 0; k < shots(tubes[t]); k++) {
        if (prev && prev.col === col && col !== 'W' && col !== 'X' && !wild && !prev.wild) out.add(t);
        prev = { col, wild };
      }
    }
    return out;
  }
  // Canopy arcs (§8.4): from where the held shell would fire over the tubes that will see it. Hovering (or
  // keyboard focus on) a legal drop draws that one; a held card with up to 3 legal tubes and no hover draws
  // each faintly; a selected racked shell draws its own.
  function renderArc() {
    const arcs = [];
    const hy = k => hypoFor(k);
    if (held && hover && hover.zone === 'tube' && targets.has(slotKey(hover))) { const h = hy(slotKey(hover)); if (h) arcs.push({ src: hover.i, tubes: h.state.tubes, strong: true }); }
    else if (held && held.kind === 'shell' && held.slot.zone === 'tube') arcs.push({ src: held.slot.i, tubes: S().tubes, strong: true });
    else if (held && held.kind === 'card') {
      const keys = [...targets.keys()].filter(k => k.startsWith('tube:'));
      if (keys.length <= 3) keys.forEach(k => { const h = hy(k); if (h) arcs.push({ src: +k.slice(5), tubes: h.state.tubes, strong: keys.length === 1 }); });
    }
    const live = arcs.filter(a => a.tubes[a.src] && a.tubes[a.src].shell);
    E.skyWrap.classList.toggle('has-arc', live.length > 0);
    if (!live.length) { setHTML(E.arc, ''); E.arc.removeAttribute('data-on'); return; }
    if (!geo.ok) readGeo();
    const n = S().tubes.length, rw = Math.round(geo.rackW), x = j => tubeX(j, n, geo.rackX);
    const H = 20; // the arcs rise from the brass rim into the sky
    E.arc.setAttribute('viewBox', `0 0 ${rw} ${H + 6}`);
    E.arc.style.width = rw + 'px';
    E.arc.dataset.col = shellCol(live[0].tubes[live[0].src].shell);
    E.arc.dataset.on = '1';
    let svgOut = '';
    for (const a of live) {
      const seen = [...skyRun(a.tubes, view.rules).seenBy[a.src]], cls = a.strong ? '' : ' alt';
      if (seen.length) {
        const xs = [a.src, ...seen].map(x), lo = Math.min(...xs), hi = Math.max(...xs);
        svgOut += `<path class="span${cls}" d="M${lo} ${H} C${lo + 4} 1 ${hi - 4} 1 ${hi} ${H}"/>`;
        seen.forEach(j => { svgOut += `<circle class="dot${cls}" cx="${x(j)}" cy="${H}" r="3.5"/>`; });
      }
      svgOut += `<circle class="src${cls}" cx="${x(a.src)}" cy="${H}" r="${a.strong ? 5 : 4}"/>`;
    }
    setHTML(E.arc, svgOut);
  }

  /* ---------- Tools row: Crate ×2 · Undo · Match · Restore · Rehearse ---------- */
  function renderTools() {
    const crate = S().crate || [null, null];
    E.crates.forEach((b, i) => {
      const sh = crate[i], key = 'crate:' + i, can = !!held && targets.has(key);
      setHTML(b, sh ? tokenHTML(sh, { size: 'mini' }) : ICON.crate + '<span class="tl" aria-hidden="true">Crate</span>');
      b.classList.toggle('empty', !sh);
      b.classList.toggle('sel', !!held && held.kind === 'shell' && sameSlot(held.slot, { zone: 'crate', i }));
      b.classList.toggle('can', can);
      b.classList.toggle('hov', can && !!hover && hover.zone === 'crate' && hover.i === i);
      b.classList.toggle('armed', sellArmed === key);
      b.setAttribute('aria-label', `Crate slot ${i + 1}: ${sh ? describeTok(sh) + ', does not fire' : 'empty'}${can ? ', drop here' : ''}`);
    });
    const canUndo = fnIn(G, 'canUndo') ? !!G.canUndo() : false;
    E.undo.disabled = !canUndo || !building();
    const permutes = view.tonight.includes('windshift') || view.tonight.includes('crossed');
    E.match.disabled = !permutes || !legalHas('match');
    E.match.classList.toggle('lit', permutes);
    E.restore.disabled = !legalHas('restore');
    const hName = view.hRules[0] ? ruleInfo(view.hRules[0]).name : '';
    E.rehearse.setAttribute('aria-pressed', view.rehearsing || (view.auto && view.rules.length) ? 'true' : 'false');
    E.rehearse.setAttribute('aria-label', view.auto ? (view.rules.length ? `Rehearse: tonight's ${hName} is live` : 'Rehearse (H)') : `Rehearse ${hName || 'the next Headliner'} (H)`);
    E.rehearse.classList.toggle('on', view.rehearsing);
    E.rehearse.disabled = !hName || view.auto;
    // Every tool carries its name under the icon; at 360 px with wide fallback fonts the row tightens instead of clipping.
    queueFit('tools', () => fitLadder(E.tools, 2, () => E.tools.scrollWidth > E.tools.clientWidth + 0.5 || [...E.tools.querySelectorAll('.tl')].some(overflows), String(view.rehearsing) + (S().crate || []).map(x => !!x).join()));
  }

  /* ---------- Shop: 3-card row or 2×2 grid ---------- */
  function renderShop() {
    const st = S(), shop = st.shop, cards = (shop && shop.cards) || [];
    const four = cards.length >= 4;
    E.shop.dataset.n = four ? '4' : '3';
    E.shopEmpty.hidden = cards.length > 0;
    if (!cards.length) E.shopEmpty.textContent = view.s === 0 ? 'The shop opens after the first show.' : 'No shop tonight.';
    const mine = owned();
    const pairs = fusionPairs();
    E.cards.forEach((b, i) => {
      const c = cards[i];
      b.hidden = !c;
      if (!c) return;
      const tagOn = held && held.kind === 'card' && held.i === i;
      b.classList.toggle('sel', !!tagOn);
      b.classList.toggle('sold', !!c.sold);
      if (c.sold) {
        b.disabled = true;
        setHTML(b, '<span class="c-sold">Sold</span>');
        b.setAttribute('aria-label', `Card ${i + 1}: sold`);
        return;
      }
      b.disabled = false;
      const r = row(c.id), sh = { id: c.id, col: c.col || r.col, star: 1 };
      const twin = mine.find(o => o.sh.id === c.id && (o.sh.star || 1) < 3);
      const fuses = pairs.some(([a, bb]) => (a === c.id && mine.some(o => o.sh.id === bb)) || (bb === c.id && mine.some(o => o.sh.id === a)));
      let badge = '', badgeLong = '';
      if (twin) { badge = `<span class="c-badge b-twin">${four ? '' : '<span class="bw">Twin </span>'}${ICON.twin}★${(twin.sh.star || 1) + 1} $${upCost(twin.sh)}</span>`; badgeLong = `Twin star ${(twin.sh.star || 1) + 1} for $${upCost(twin.sh)}`; }
      else if (fuses) { badge = '<span class="c-badge b-fuse">✦<span class="bw"> Fuses</span></span>'; badgeLong = 'Fuses with a shell you own'; }
      else if (c.tag === 'collector') { badge = '<span class="c-badge b-coll"><span class="bw">Collector</span></span>'; badgeLong = 'Collector card'; }
      else if (c.tag === 'pity') { badge = '<span class="c-badge b-pity"><span class="bw">Pity</span></span>'; badgeLong = 'Pity card'; }
      const rar = rarityOf(r);
      const poor = c.cost > st.coins && !(twin && upCost(twin.sh) <= st.coins);
      let pips = '';
      for (let k = 0; k < 3; k++) pips += `<i${k < rar[1] ? ' class="on"' : ''}></i>`;
      const size = four ? (mode === 'regular' ? 'md' : 'xs') : (mode === 'regular' ? 'lg' : 'md');
      b.classList.toggle('poor', poor);
      setHTML(b, tokenHTML(sh, { size, hang: r.hang || 0 }) +
        `<span class="c-side"><span class="c-price num">$${c.cost}</span><span class="c-rar" aria-hidden="true">${pips}</span></span>` +
        `<span class="c-name" lang="en">${shy(esc(r.name || cap(c.id)))}</span>` + badge);
      b.setAttribute('aria-label', `Card ${i + 1}: ${r.name}, ${colName(sh.col)} ${colShape(sh.col)}, ${rar[0]}, new $${c.cost}${badgeLong ? '. ' + badgeLong : ''}. ${cardText(c.id, sh.col, 1)}`);
      b.classList.toggle('badged', !!badge);
      b.dataset.rar = rar[1];
      const bd = b.querySelector('.c-badge');
      const bk = b._html + b.className, nm = b.querySelector('.c-name');
      // §8.1 Regular 3-card: the name gets its 2 lines (hyphens:auto) even with a badge; the token steps down to make room
      const wrap = () => { b.removeAttribute('data-wrap'); if (!four && mode === 'regular' && badge && nm.scrollHeight > 27) b.setAttribute('data-wrap', ''); };
      queueFit('card' + i, () => fitLadder(b, 2, () => overflows(bd), bk, wrap)); // 1: badges shed their word ("Twin ★2 $5" → "⧉★2 $5", "✦ Fuses" → "✦") · 2: no badge
    });
  }

  /* ---------- Workshop: rig card · add tube · reroll ---------- */
  function renderWorkshop() {
    const st = S(), f = festOf(view.s);
    E.workshop.hidden = f < 2;
    if (f < 2) return;
    const rc = st.shop && st.shop.rig;
    if (!rc) {
      E.rigBtn.disabled = true;
      setHTML(E.rigBtn, '<span class="ws-name">No rig today</span>');
      E.rigBtn.setAttribute('aria-label', 'No rig card this show');
    } else {
      const ri = rigInfo(rc.id);
      E.rigBtn.disabled = !!rc.sold;
      setHTML(E.rigBtn, `<span class="ws-glyph">${ICON.rig[rc.id] || ''}</span><span class="ws-name ws-rigname">${esc(ri.name)}</span>` +
        (rc.sold ? '<span class="ws-price">Sold</span>' : `<span class="ws-price num">$${rc.cost != null ? rc.cost : ri.cost}</span>`));
      E.rigBtn.setAttribute('aria-label', rc.sold ? `Rig ${ri.name}: sold` : `Rig card: ${ri.name}, $${rc.cost != null ? rc.cost : ri.cost}. ${ri.text} Pick it, then choose a tube (G).`);
      E.rigBtn.classList.toggle('sel', !!held && held.kind === 'rig');
      E.rigBtn.classList.toggle('poor', !rc.sold && (rc.cost || ri.cost) > st.coins);
    }
    const n = st.tubes.length, tc = tubeCost();
    E.tubeBtn.hidden = n >= 6; // a full rack frees the room for the rig's name
    setHTML(E.tubeBtn, n >= 6 ? '<span class="ws-name">6 tubes</span>' : `${ICON.addTube}<span class="ws-name ws-word">Tube</span><span class="ws-price num">$${tc}</span>`);
    E.tubeBtn.disabled = n >= 6;
    E.tubeBtn.classList.toggle('poor', n < 6 && tc > st.coins);
    E.tubeBtn.setAttribute('aria-label', n >= 6 ? 'The rack is full: 6 tubes' : `Add tube ${n + 1} for $${tc} (T)`);
    const rc$ = rerollCost();
    setHTML(E.rerollBtn, `${ICON.reroll}<span class="ws-name ws-word">Reroll</span><span class="ws-price num">$${rc$}</span>`);
    // 360 px: tighten with each price under its word, then Tube / Reroll keep only their icons, then the rig keeps only its glyph (names stay in aria-labels)
    const wk = E.rigBtn._html + E.tubeBtn._html + E.tubeBtn.hidden + E.rerollBtn._html;
    queueFit('workshop', () => fitLadder(E.workshop, 3, () => [...E.workshop.querySelectorAll('.ws-name')].some(overflows), wk));
    E.rerollBtn.disabled = !(st.shop && st.shop.cards && st.shop.cards.length);
    E.rerollBtn.classList.toggle('poor', rc$ > st.coins);
    E.rerollBtn.setAttribute('aria-label', `Reroll the shop for $${rc$} (X)`);
  }

  /* ---------- Fire button + mood pill ---------- */
  function renderFire() {
    const u = ui();
    const resolving = u === 'RESOLVING';
    E.fire.classList.toggle('skip', resolving);
    E.fireLbl.textContent = resolving ? 'Skip ▸▸' : 'Light the fuse';
    E.fire.disabled = !(resolving || u === 'BUILD' || u === 'RESULT');
    const mv = !resolving && moodVisible();
    E.mood.hidden = !mv;
    E.firebar.classList.toggle('has-mood', mv);
    if (mv) {
      E.mood.dataset.mood = view.mood;
      setHTML(E.mood, moodIcon(view.mood) + `<span class="mood-w">${esc(moodName(view.mood))}</span>`);
      E.mood.setAttribute('aria-label', `Crowd mood: ${moodName(view.mood)}. What it means`);
    }
    E.fire.setAttribute('aria-label', resolving ? 'Skip to the result (Space twice)' : 'Light the fuse (F)');
    E.fire.classList.toggle('glow', !resolving && !!S().firstRun && view.s === 0);
    E.fire.classList.toggle('crit', critical());
  }

  /* ---------- Sky overlay: label, rule pill, readout, result, info card, tip, cheer meter ---------- */
  function renderSky() {
    const u = ui(), st = S();
    E.skyLabel.hidden = mode === 'regular';
    // rule / rehearse pill (the telegraph label)
    const rid = view.rules[0];
    const showPill = !!rid && u !== 'RESOLVING' && !(result && u !== 'BUILD');
    E.rhPill.hidden = !showPill;
    if (showPill) {
      const r = ruleInfo(rid), extra = view.rules.slice(1).map(x => ruleInfo(x).name);
      const moodTxt = view.rehearsing && moodVisible() && view.pmood ? `: ${moodName(view.pmood)}` : '';
      setHTML(E.rhPill, ruleIcon(rid) + `<span>${view.rehearsing ? 'Rehearsing ' : 'Tonight: '}${esc(r.name)}${extra.length ? ' + ' + esc(extra.join(' + ')) : ''}${esc(moodTxt)}</span>`);
      E.rhPill.dataset.mood = view.rehearsing ? view.pmood || '' : '';
      E.rhPill.setAttribute('aria-label', `${view.rehearsing ? 'Rehearsing' : 'Tonight'}: ${r.name}. ${r.text}${moodTxt ? ' Crowd mood ' + moodTxt.slice(2) : ''}. Open the card.`);
    }
    E.lastChance.hidden = !lastChance() || !!result;
    // live readout during the chain
    E.readout.hidden = !readout.on;
    E.roCap.hidden = !(readout.on && view.tonight.includes('powercut'));
    paintReadout();
    // info card (docked at the sky's bottom edge); while it is up the pinned result card steps aside
    const info = u === 'RESOLVING' ? null : infoHTML();
    E.info.hidden = !info;
    if (info) {
      setHTML(E.info, info);
      // the hover line (a drop's local chips) replaces the card text; a card with nowhere to go says why
      E.info.classList.toggle('hovering', !flash && !!held && !!hover && targets.has(slotKey(hover)));
      E.info.classList.toggle('blocked', !flash && !!held && held.kind !== 'shell' && !targets.size);
      const t = E.info.querySelector('.info-t'); queueFit('info', () => fitLadder(E.info, 2, () => overflows(t), info));
    }
    E.skyWrap.classList.toggle('has-info', !!info);
    // A racked shell's rule gets its 3 lines beside Sell (spec §8.1): the card grows only when 2 lines would cut it.
    const tallable = !!info && !flash && !!held && held.kind === 'shell' && mode === 'regular';
    if (!tallable) { E.info.classList.remove('tall'); E.skyWrap.classList.remove('info-tall'); }
    else queueFit('infoTall', () => {
      const x = E.info.querySelector('.info-x');
      E.info.classList.remove('tall');
      const tall = !!x && x.getClientRects().length > 0 && x.scrollHeight > x.clientHeight + 1;
      E.info.classList.toggle('tall', tall);
      E.skyWrap.classList.toggle('info-tall', tall);
    });
    // §8.4 chip legend while a card or shell is held on touch (no hover line there): the chip colours in words
    const lg = !!info && !flash && !!held && held.kind !== 'rig' && targets.size > 0 && !hover && touchy();
    E.legend.hidden = !lg;
    if (lg) {
      const partners = G.settings && G.settings.chips === 'partners';
      setHTML(E.legend, (partners ? '' : '<span class="chip c-ooh">+Ooh</span><span class="chip c-aah">+Aah</span><span class="chip c-x">×Aah</span>') +
        '<span class="chip chip-fusion">✦ fuse</span>' + (() => { const kinds = new Set([...swaps.values()].map(w => w.kind));
          return (kinds.has('swap') ? `<span class="chip c-swap">→${ICON.crate} swap</span>` : '') + (kinds.has('replace') ? '<span class="chip c-swap sell">✕ sells old</span>' : ''); })()
        + ([...targets.keys()].some(k => { const h = hypoFor(k); return h && h.breaks && h.breaks.length; }) ? '<span class="chip chip-fusion c-break">✦✕ breaks</span>' : ''));
    }
    // result card (pinned until the first build action)
    const showRes = !!result && u !== 'RESOLVING' && !info;
    E.result.hidden = !showRes;
    if (showRes) { const h = resultHTML(result); if (h !== E.result.dataset.html) { E.result.innerHTML = h; E.result.dataset.html = h; } queueFit('result', fitResult); } // no replayed rise on every render
    else { delete E.result.dataset.html; E.result._fitKey = null; E.play.removeAttribute('data-res-cover'); }
    E.skyWrap.classList.toggle('has-result', showRes);
    // cheer meter: mood band while building, live fill while resolving
    const target = readout.on || result ? (result ? result.target : litTarget) : targetOf(view.s);
    const score = result ? result.applause : readout.on ? readout.ooh * readout.aah : 0;
    E.cheer.style.setProperty('--fill', Math.min(1, target ? score / target / 2 : 0).toFixed(3));
    E.cheer.dataset.band = !readout.on && !result && moodVisible() ? view.mood : '';
    renderTip();
  }
  function paintReadout() {
    E.roO.textContent = fmt(readout.ooh);
    E.roA.textContent = fmtAah(readout.aah);
  }
  // Restart a one-shot animation. Web Animations need no reflow (a class restart forced a layout per event,
  // dozens per show); the CSS class is the fallback.
  function replay(el, frames, opts, cls) {
    if (!el) return;
    if (fnIn(el, 'animate')) { if (el._anim) el._anim.cancel(); el._anim = el.animate(frames, opts); return; }
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  }
  function punch(el, big) { // §9: the counter punches 1.15× (90 ms); × punches harder
    if (reduced() || !el) return;
    const easing = big ? 'cubic-bezier(.34,1.56,.64,1)' : 'ease-out'; // per segment, as the CSS keyframes had it
    replay(el, [{ transform: 'none', easing }, { transform: `scale(${big ? 1.3 : 1.15})`, offset: big ? 0.45 : 0.5, easing }, { transform: 'none' }],
      { duration: big ? 160 : 90 }, big ? 'punch-big' : 'punch');
  }
  // §9 fuseLit: the ember crawls in along the fuse to the first tube that fires (280 ms), then glows there.
  function lightFuse(ev) {
    const n = S().tubes.length, step = 48 + rackGap, len = Math.max(0, (n - 1) * step);
    const seq = ev && Array.isArray(ev.order) && ev.order.length ? ev.order : view && view.order.seq.length ? view.order.seq : [0];
    const x = Math.max(0, Math.min(n - 1, seq[0] | 0)) * step;
    const rules = ev && Array.isArray(ev.rules) ? ev.rules : view ? view.tonight : [];
    const right = rules.some(r => r === 'windshift' || /^countdown/.test(r)); // the fuse starts at the right end
    const lead = Math.min(40, Math.max(18, geo.ok ? (geo.wrapW - len) / 2 : 24)); // from off the rack's edge
    const from = right ? len + lead : -lead;
    E.fuse.style.setProperty('--ex', x + 'px');
    E.fuse.classList.add('lit');
    if (!reduced()) replay(E.ember, [{ transform: `translateX(${from - x}px) scale(.6)`, opacity: 0.5 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: 'linear' }, 'crawl');
  }
  // §9 launch: the tube recoils (squash 1.25 × 0.8, 120 ms).
  function recoil(T) {
    if (!T || reduced()) return;
    replay(T.body, [{ transform: 'none', easing: 'ease-out' }, { transform: 'scale(1.25,.8)', offset: 0.5, easing: 'ease-out' }, { transform: 'none' }], { duration: 120 }, 'recoil');
  }

  function resultHTML(r) {
    const ratio = r.target ? r.applause / r.target : 0;
    const verdict = r.pass ? `Pass · ${(Math.floor(ratio * 10) / 10).toFixed(1)}× target` : `${fmt(Math.max(0, r.target - r.applause))} short`;
    let pay = '', coins = 0, crowd = 0;
    for (const it of r.items) {
      pay += `<li class="${it.kind === 'c' ? 'p-crowd' : 'p-coin'}">${esc(it.text)}</li>`;
      if (it.kind === 'c') crowd += it.v; else coins += it.v;
    }
    const tot = [coins ? `+$${coins}` : '', crowd ? `Crowd +${crowd}` : ''].filter(Boolean).join(' · ');
    return `<div class="res-card" data-pass="${r.pass ? 1 : 0}">` +
      `<div class="res-head"><span class="res-verdict">${esc(verdict)}</span>${r.encore ? '<span class="res-encore enc">Encore!</span>' : ''}${r.relit ? '<span class="res-encore">One more!</span>' : ''}</div>` +
      `<button type="button" class="res-app" data-res="log" aria-label="Applause ${fmt(r.applause)}. Open the show log.">${fmt(r.applause)}</button>` +
      `<div class="res-eq">Ooh ${fmt(r.ooh)} × Aah ${fmtAah(r.aah)} <span class="res-vs">· target ${fmt(r.target)}</span></div>` +
      (r.rainUsed ? '<p class="res-rain">Rain check used. One more miss ends the run.</p>' : '') +
      (pay ? `<ul class="res-pay">${pay}</ul>` : '') +
      (tot ? `<p class="res-tot">${r.encore ? '<span class="tot-x">Encore! · </span>' : ''}${esc(tot)}</p>` : '') + '</div>';
  }
  // The result card sheds detail until it fits between the sky's top furniture (the compact Sponsor strip) and
  // its bottom edge: 1 smaller Applause · 2 Applause beside the verdict · 3 no target, tighter chips · 4 totals for the
  // itemised payout · 5 no Ooh × Aah line · 6 the card also covers the compact Sponsor strip until the first action.
  // Nothing is ever cut mid-row.
  function fitResult() {
    const card = E.result.firstElementChild;
    if (!card || E.result.hidden) { E.play.removeAttribute('data-res-cover'); return; }
    const h = E.skyWrap.clientHeight;
    fitLadder(E.result, 6, () => card.offsetHeight > E.result.clientHeight + 0.5, E.result.dataset.html + '|' + h + '|' + E.play.hasAttribute('data-sponsor'),
      () => E.play.removeAttribute('data-res-cover'));
    E.play.toggleAttribute('data-res-cover', E.result.dataset.fit === '6');
  }

  /* ---------- Info card ---------- */
  function infoHTML() {
    if (flash) return `<div class="info-body"><p class="info-t">${flash.title}</p><p class="info-x">${esc(flash.text)}</p></div>` + infoBtns(flash.btns || '');
    if (!held || !building()) return '';
    const st = S();
    let title = '', text = '', line3 = '', btns = '';
    if (held.kind === 'card') {
      const c = st.shop.cards[held.i], r = row(c.id), col = c.col || r.col;
      const twin = owned().find(o => o.sh.id === c.id && (o.sh.star || 1) < 3);
      title = `<b>${esc(r.name)}</b><span class="t-o1"> · ${colName(col)}</span> · $${c.cost}${twin ? `<span class="t-o2"> · twin ★${twin.sh.star + 1} $${upCost(twin.sh)}</span>` : ''}`;
      text = cardText(c.id, col, 1);
      const need = targets.size ? 0 : shortfall(held.i);
      line3 = targets.size ? 'Tap a lit tube. Chips: white +Ooh · gold +Aah · ringed ×' : need > 0 ? `Need $${need} more.` : 'No free tube: move a shell to the Crate, sell one, or add a tube.';
      if (st.kit === 'chemist' && r.col === '*') btns += '<button type="button" class="ib" data-info="colour" aria-label="Change colour (C)">Colour</button>';
    } else if (held.kind === 'shell') {
      const sh = slotShell(held.slot);
      if (!sh) return '';
      const tb = held.slot.zone === 'tube' ? st.tubes[held.slot.i] : null;
      title = `<b>${esc(shellName(sh))}</b><span class="t-o1"> · ${colName(shellCol(sh))}</span> · ★${sh.star || 1}<span class="t-o2"> · Hang ${Math.max(0, tb ? hangOf(tb, view.rules) : (row(sh.id).hang || 0))}</span>`;
      text = cardText(sh.id, shellCol(sh), sh.star || 1);
      line3 = held.slot.zone === 'crate' ? 'In the Crate: it does not fire. Tap a tube to swap it in.' : 'Tap another tube to move or swap. The arc shows who sees it.';
      const k = slotKey(held.slot), armed = sellArmed === k;
      btns += `<button type="button" class="ib sell${armed ? ' armed' : ''}" data-info="sell" aria-label="${armed ? 'Confirm: sell' : 'Sell'} ${esc(shellName(sh))} for ${sellValue(sh)} coins">${armed ? '<span>Tap again</span><span>to sell</span>' : `<span>Sell</span><span>$${sellValue(sh)}</span>`}</button>`;
    } else if (held.kind === 'rig') {
      const rc = st.shop.rig, ri = rigInfo(rc.id);
      title = `<b>${esc(ri.name)}</b><span class="t-o1"> · rig</span> · $${rc.cost != null ? rc.cost : ri.cost}`;
      text = ri.text;
      line3 = targets.size ? 'Tap a tube to install it. Rigs stay with the tube.' : `Need $${(rc.cost || ri.cost) - st.coins} more.`;
    }
    if (hover && targets.has(slotKey(hover))) line3 = hoverLine(hover) || line3;
    return `<div class="info-body"><p class="info-t">${title}</p><p class="info-x">${esc(text)}</p><p class="info-h">${esc(line3)}</p></div>` + infoBtns(btns);
  }
  const infoBtns = extra => `<div class="info-btns">${extra}<button type="button" class="ib ib-i" data-info="inspect" aria-label="Inspect (I)">${ICON.info}</button></div>`;
  const fusePartner = (key, first) => { const [a, b] = String(key || '').split('>'); const id = first ? b : a; return id ? row(id).name || cap(id) : ''; };
  function chipWords(c) { // a drop's local chips in words (the hover line and the legend's source of truth)
    const bits = [];
    if (!c) return bits;
    if (c.ooh) bits.push(`+${fmtChip(c.ooh)} Ooh`);
    if (c.aah) bits.push(`+${fmtChip(c.aah)} Aah`);
    if (c.x > 1) bits.push(c.xAah >= 0.05 ? `${fmtX(c.x)} (+${fmtChip(c.xAah)} Aah)` : `${fmtX(c.x)} Aah`);
    if (c.fusion) bits.push(c.fusionKey ? `✦ with ${fusePartner(c.fusionKey, false)}` : '✦ ' + c.fusion);
    if (c.fusionNext) bits.push(`✦ with ${fusePartner(c.fusionNext.key, true)} next`);
    if (c.crowd) bits.push(`Crowd +${fmtChip(c.crowd)}`);
    if (c.coin) bits.push(`+$${fmtChip(c.coin)}`);
    return bits;
  }
  function hoverLine(slot) {
    if (slot.zone === 'crate') return `${slotName(slot)}: shells here do not fire.`;
    const key = slotKey(slot), hy = hypoFor(key);
    if (!hy) return '';
    const e = hy.order.per[slot.i], w = swaps.get(key), bits = [`Tube ${slot.i + 1}`];
    if (w) bits.push(w.kind === 'swap' ? `Swap in · ${shellName(w.out)} → Crate` : `Replace · +$${w.refund}`);
    bits.push(...chipWords(hy.chips[slot.i]));
    if (hy.breaks && hy.breaks.length) bits.push('breaks ' + hy.breaks.map(n => n || 'a new fusion').join(', '));
    if (hy.sees[slot.i] != null) bits.push('sees ' + hy.sees[slot.i]);
    if (e && e.length) bits.push(`fires ${ordinal(e[0].from)} of ${hy.order.total}${e[e.length - 1].to === hy.order.total ? ' · LAST' : ''}`);
    return bits.join(' · ');
  }

  /* ================= 10. Holding: legal targets and hypothetical racks (§8.4) ================= */

  // §2.5 one-gesture swap-in is off in the first-ever run's shows 1–2: the mood is hidden there, and those shows
  // cannot be failed (spec §6), so no drop may make them failable.
  const swapsOn = () => !(S().firstRun && (S().show | 0) < 2);
  function computeTargets(item) {
    const m = new Map();
    swaps = new Map();
    for (const a of view.legal) {
      if (item.kind === 'card' && (a.type === 'buy' || a.type === 'upgrade') && a.card === item.i && a.to) m.set(slotKey(a.to), a);
      else if (item.kind === 'shell' && a.type === 'move' && sameSlot(a.from, item.slot) && a.to) m.set(slotKey(a.to), a);
      else if (item.kind === 'rig' && a.type === 'buyRig') m.set('tube:' + a.tube, a);
    }
    // A card over an occupied non-twin tube: swap it in (the old shell goes to the Crate) or, with the Crate
    // full, replace it (the old shell is sold). OOH.placeHeld names the exact action; the SIM judges it.
    const o = sim();
    if (item.kind === 'card' && swapsOn() && fnIn(o, 'placeHeld')) {
      S().tubes.forEach((tb, j) => {
        const key = 'tube:' + j;
        if (!tb.shell || m.has(key)) return;
        const h = safe(() => o.placeHeld(S(), { card: item.i }, j), null);
        if (!h || (h.kind !== 'swap' && h.kind !== 'replace') || !h.action) return;
        if (fnIn(o, 'illegalReason') && safe(() => o.illegalReason(S(), h.action), 'error')) return;
        m.set(key, h.action);
        swaps.set(key, { kind: h.kind, out: h.out || tb.shell, refund: h.refund || 0, cost: h.cost });
      });
    }
    return m;
  }
  // The coins a held card still lacks for its cheapest drop (0 when money is not what blocks it).
  function shortfall(i) {
    const st = S(), c = st.shop.cards[i];
    if (!c) return 0;
    const opts = [];
    if (st.tubes.some(t => !t.shell) || (st.crate || []).some(x => !x)) opts.push(c.cost);
    const twin = owned().find(o => o.sh.id === c.id && (o.sh.star || 1) < 3);
    if (twin) opts.push(upCost(twin.sh));
    if (swapsOn()) st.tubes.forEach(t => {
      if (!t.shell || t.shell.id === c.id) return;
      opts.push((st.crate || []).some(x => !x) ? c.cost : c.cost - sellValue(t.shell));
    });
    if (!opts.length) return 0;
    return Math.max(0, Math.min(...opts) - st.coins);
  }
  // Apply the drop to a clone to read its exact local chips (the SIM stays untouched).
  function hypoFor(key) {
    if (hypo.has(key)) return hypo.get(key);
    const act = targets.get(key), o = sim();
    let res = null;
    if (act && fnIn(o, 'clone') && fnIn(o, 'step')) {
      res = safe(() => {
        const st2 = o.clone(S()), ev = o.step(st2, act);
        if (Array.isArray(ev) && ev[0] && ev[0].type === 'illegal') return null;
        const chips = chipsOf(st2, view.rules), sky = skyRun(st2.tubes, view.rules);
        const sees = chips.some(c => c && c.sees != null) ? chips.map(c => (c ? c.sees : null)) : sky.sees;
        const keyOf = c => c && c.fusion ? (c.fusionKey || c.fusion) : null;
        const after = new Set(chips.map(keyOf).filter(Boolean));
        const breaks = (view.chips || []).filter(c => keyOf(c) && !after.has(keyOf(c))).map(c => (c.fusion === '?' ? '' : c.fusion));
        return { state: st2, chips, sees, breaks, order: fireOrder(st2.tubes, view.rules) };
      }, null);
    }
    hypo.set(key, res);
    return res;
  }
  function draggable(item) {
    if (!item) return false;
    if (item.kind === 'card') { const c = S().shop && S().shop.cards[item.i]; return !!c && !c.sold; }
    if (item.kind === 'rig') { const r = S().shop && S().shop.rig; return !!r && !r.sold; }
    return !!slotShell(item.slot);
  }
  function hold(item) {
    if (!building()) return;
    if (!view) computeView();
    held = item;
    hover = null;
    hypo = new Map();
    flash = null;
    disarmSell();
    targets = computeTargets(item);
    sfx('tick');
    dismissTip();
    if (item.kind !== 'rig') queueTip('t_sky', '#rack');
    // The first time the rack is full while a card is held: say that a drop on a tube swaps (§2.5).
    if (item.kind === 'card' && S().tubes.every(t => t.shell) && [...swaps.values()].some(w => w.kind === 'swap')) showOwnTip('t_swap');
    render();
  }
  function clearHeld(silent) {
    const had = !!held;
    held = null; hover = null; targets = new Map(); hypo = new Map(); swaps = new Map();
    if (tip && tip.id === 't_swap') { tip = null; renderTip(); }
    if (had && !silent) render();
  }
  function setHover(slot) {
    const k = slot ? slotKey(slot) : '', cur = hover ? slotKey(hover) : '';
    if (k === cur) return;
    hover = slot;
    render();
  }

  /* ================= 11. Actions ================= */

  // Everything goes through GAME.dispatch. Core announces the action (§13), AUDIO sounds the SIM build
  // events (pluck / coin / shuffle) and core runs the haptics; this adds only what the SIM does not voice.
  const SILENT_IN_AUDIO = { sponsor: ['chime'], restore: ['pluck', { col: 'G' }], setColour: ['pluck'] };
  function commit(act) {
    if (!G || !fnIn(G, 'dispatch')) return false;
    clearHeld(true);
    disarmSell();
    flash = null;
    const ev = G.dispatch(act) || [];
    const bad = Array.isArray(ev) && ev.find(e => e && e.type === 'illegal');
    if (bad) { deny(null, 'Not possible', bad.reason ? cap(String(bad.reason)) + '.' : 'That move is not allowed right now.', true); return false; }
    if (Array.isArray(ev) && !ev.length) return true; // held in core's 120 ms input buffer (RESOLVING): nothing happened yet, so no success feedback
    const extra = SILENT_IN_AUDIO[act.type];
    if (extra) sfx(extra[0], act.type === 'setColour' ? { col: act.col } : extra[1]);
    if (act.type === 'reroll' && !reduced()) E.cards.forEach((b, i) => { b.style.animationDelay = i * 60 + 'ms'; b.classList.remove('flip'); void b.offsetWidth; b.classList.add('flip'); });
    if ((act.type === 'buy' || act.type === 'upgrade' || act.type === 'move') && act.to) popSlot(act.to, act.type === 'upgrade');
    if (act.type === 'buyTube') popSlot({ zone: 'tube', i: S().tubes.length - 1 });
    if (!fnIn(G, 'tip') && act.to && act.to.zone === 'crate') queueTip('t_crate');
    return true;
  }
  function popSlot(slot, big) {
    if (reduced()) return;
    requestAnimationFrame(() => {
      const el = slot.zone === 'tube' ? E.tubes[slot.i] && E.tubes[slot.i].tok.firstElementChild : E.crates[slot.i] && E.crates[slot.i].firstElementChild;
      if (el) { el.classList.remove('pop', 'pop-up'); void el.offsetWidth; el.classList.add(big ? 'pop-up' : 'pop'); }
    });
  }
  function deny(el, title, text, voiced) {
    if (!voiced) sfx('error'); // a refused dispatch is already voiced by AUDIO.onEvent('illegal')
    flash = { title: `<b>${esc(title)}</b>`, text };
    if (el && !reduced()) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
    render();
  }
  function hint(title, text) { flash = { title: `<b>${esc(title)}</b>`, text }; render(); }

  function light() {
    if (!building() || !fnIn(G, 'light')) return; // RESULT is a build too: the card stays pinned until the next action
    clearHeld(true); disarmSell(); flash = null; dismissTip();
    litTarget = targetOf(S().show | 0);
    litAt = performance.now();
    G.light();
  }
  let litAt = 0;
  function fireClick() {
    // A double tap on Light the fuse must not also skip the show: ignore Skip for 400 ms after lighting.
    if (ui() === 'RESOLVING') { if (performance.now() - litAt < 400) return; if (fnIn(G, 'skip')) G.skip(); return; }
    light();
  }
  function toggleSponsor() {
    const sp = S().sponsor;
    if (!sp || !building()) return;
    commit({ type: 'sponsor', accept: !sp.accepted });
  }
  function toggleRehearse() {
    if (!view.hRules.length) return;
    if (view.auto) { hint("Tonight's rule is live", 'Numerals, chips and the mood already use it.'); return; }
    sfx('chime');
    setRehearse(!view.rehearsing);
  }
  function doUndo() {
    if (!fnIn(G, 'undo') || !(fnIn(G, 'canUndo') ? G.canUndo() : true)) { sfx('error'); return; }
    clearHeld(true); disarmSell(); flash = null;
    G.undo();
  }
  function tryAct(type, extra) {
    const a = view.legal.find(x => x.type === type) || Object.assign({ type }, extra || {});
    commit(a);
  }
  function cycleColour() {
    if (!held || held.kind !== 'card') return;
    const c = S().shop.cards[held.i], order = ['R', 'A', 'G', 'B'];
    if (row(c.id).col !== '*' || S().kit !== 'chemist') return;
    const i = held.i, next = order[(order.indexOf(c.col) + 1) % 4];
    if (commit({ type: 'setColour', card: i, col: next })) hold({ kind: 'card', i });
  }

  /* ---------- 2-tap sell (stays armed until the next input) ---------- */
  function sellSlot(slot) {
    const sh = slot && slotShell(slot);
    if (!sh || !building()) return;
    const k = slotKey(slot);
    if (sellArmed === k) { commit({ type: 'sell', from: slot }); return; }
    sellArmed = k;
    sfx('tick');
    announce(`Sell ${shellName(sh)} for ${sellValue(sh)} coins? Press again to confirm.`);
    if (!held || held.kind !== 'shell' || !sameSlot(held.slot, slot)) { held = { kind: 'shell', slot }; targets = computeTargets(held); hypo = new Map(); }
    render();
  }
  function disarmSell() { if (sellArmed) { sellArmed = null; return true; } return false; }

  /* ================= 12. Pointer input (§11.5: tap vs drag, capture, long-press) ================= */

  const itemEl = t => t && t.closest && t.closest('[data-tube],[data-crate],[data-card],[data-act="buyRig"]');
  function itemOf(el) {
    if (!el) return null;
    if (el.dataset.tube != null) return { kind: 'slot', slot: { zone: 'tube', i: +el.dataset.tube } };
    if (el.dataset.crate != null) return { kind: 'slot', slot: { zone: 'crate', i: +el.dataset.crate } };
    if (el.dataset.card != null) return { kind: 'card', i: +el.dataset.card };
    return { kind: 'rig' };
  }
  const asHeld = it => (it.kind === 'slot' ? { kind: 'shell', slot: it.slot } : it);
  function slotAt(x, y) {
    const el = itemEl(document.elementFromPoint(x, y));
    const it = itemOf(el);
    return it && it.kind === 'slot' ? it.slot : null;
  }

  function onDown(e) {
    lastPointer = e.pointerType || lastPointer;
    if (!e.isPrimary || e.button > 0) return;
    if (ui() === 'RESOLVING') return; // core fast-forwards ×4 on a tap anywhere in #play (§2.4)
    const el = itemEl(e.target);
    if (!el || el.disabled || !building()) return;
    drag = { el, item: itemOf(el), x0: e.clientX, y0: e.clientY, id: e.pointerId, moved: false, long: false, ghost: null };
    drag.timer = setTimeout(() => {
      if (!drag || drag.moved) return;
      drag.long = true;
      inspectItem(drag.item);
    }, 450);
  }
  function onMove(e) {
    if (!drag) { // a mouse hovering a legal drop previews it (numerals, sees, arc); taps and keys show the same by other means
      if (held && e.pointerType === 'mouse' && building() && E.play.contains(e.target)) {
        const t = slotAt(e.clientX, e.clientY);
        setHover(t && targets.has(slotKey(t)) ? t : null);
      }
      return;
    }
    if (e.pointerId !== drag.id) return;
    if (!drag.moved) {
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (dx * dx + dy * dy < 100 || drag.long) return;
      const h = asHeld(drag.item);
      if (!draggable(h)) { clearTimeout(drag.timer); drag = null; return; }
      drag.moved = true;
      clearTimeout(drag.timer);
      try { drag.el.setPointerCapture(drag.id); } catch (err) { /* capture is best-effort */ }
      hold(h);
      drag.ghost = makeGhost(h);
    }
    e.preventDefault();
    if (drag.ghost) drag.ghost.style.transform = `translate(${e.clientX - 24}px, ${e.clientY - 40}px) scale(1.08)`;
    const t = slotAt(e.clientX, e.clientY);
    setHover(t && targets.has(slotKey(t)) ? t : null);
  }
  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    clearTimeout(drag.timer);
    const d = drag;
    drag = null;
    if (d.long) { suppressUntil = performance.now() + 400; return; }
    if (!d.moved) return;
    suppressUntil = performance.now() + 400;
    if (d.ghost) d.ghost.remove();
    const t = e.type === 'pointercancel' ? null : slotAt(e.clientX, e.clientY);
    const act = t && targets.get(slotKey(t));
    if (act) commit(act);
    else { clearHeld(); if (t && !(held && held.kind === 'shell' && sameSlot(held.slot, t))) sfx('error'); }
  }
  function makeGhost(h) {
    const g = document.createElement('div');
    g.className = 'ghost';
    g.setAttribute('aria-hidden', 'true');
    if (h.kind === 'rig') g.innerHTML = `<span class="ghost-rig">${ICON.rig[S().shop.rig.id] || ''}</span>`;
    else {
      const sh = h.kind === 'card' ? { id: S().shop.cards[h.i].id, col: S().shop.cards[h.i].col, star: 1 } : slotShell(h.slot);
      g.innerHTML = tokenHTML(sh, { size: 'lg', hang: row(sh.id).hang || 0 });
    }
    E.play.appendChild(g);
    return g;
  }

  // Taps and keyboard activation both arrive here as clicks.
  function onClick(e) {
    const el = e.target.closest('button');
    if (!el || !E.play.contains(el) && !E.inspect.contains(el)) return;
    if (e.detail > 0 && performance.now() < suppressUntil) { e.preventDefault(); e.stopPropagation(); return; }
    if (e.detail === 0 && performance.now() < swallowKeyClick) { swallowKeyClick = 0; return; } // the key handler already acted
    const act = el.dataset.act;
    if (el === E.fire) return fireClick();
    if (act === 'pause') { if (fnIn(G, 'open')) G.open('pause'); return; }
    if (E.inspect.contains(el)) return inspectClick(el);
    if (!building()) return;
    if (act === 'sponsor') return toggleSponsor();
    if (act === 'undo') return doUndo();
    if (act === 'match') return tryAct('match');
    if (act === 'restore') return tryAct('restore');
    if (act === 'rehearse') return toggleRehearse();
    if (act === 'reroll') { clearHeld(true); return tryAct('reroll'); }
    if (act === 'buyTube') { clearHeld(true); return tryAct('buyTube'); }
    if (el.dataset.hud === 'head' || el.dataset.sky === 'rule') return inspectItem({ kind: 'rule', id: el.dataset.sky ? view.rules[0] : view.hRules[0] });
    if (el.dataset.hud === 'rain') return inspectItem({ kind: 'rain' });
    if (el.dataset.hud === 'coins' || el.dataset.hud === 'crowd') return inspectItem({ kind: el.dataset.hud });
    if (act === 'mood') return inspectItem({ kind: 'mood' });
    if (el.dataset.res === 'log') { if (fnIn(G, 'open')) G.open('showlog'); return; }
    const inf = el.dataset.info;
    if (inf === 'inspect') return inspectItem(held ? (held.kind === 'shell' ? { kind: 'slot', slot: held.slot } : held) : null);
    if (inf === 'sell' && held && held.kind === 'shell') return sellSlot(held.slot);
    if (inf === 'colour') return cycleColour();
    const it = itemOf(itemEl(el));
    if (it) tap(it, el);
  }
  function tap(it, el) {
    if (it.kind === 'slot') {
      const sh = slotShell(it.slot), k = slotKey(it.slot);
      if (held) {
        if (held.kind === 'shell' && sameSlot(held.slot, it.slot)) return clearHeld();
        const act = targets.get(k);
        if (act) return commit(act);
        if (held.kind === 'card') {
          const c = S().shop.cards[held.i], nm = row(c.id).name, need = shortfall(held.i);
          if (sh && sh.id === c.id && (sh.star || 1) >= 3) return deny(el, `${nm} is already ★3`, 'Drop it on another tube, or pick another card.');
          if (sh && (it.slot.zone === 'crate' || !swapsOn())) return deny(el, `${cap(slotName(it.slot))} is taken`, `Drop ${nm} on an empty tube${owned().some(o => o.sh.id === c.id) ? ' or on its twin' : ''}.`);
          return deny(el, 'Not enough coins', need > 0 ? `Need $${need} more.` : `${nm} costs $${c.cost}. You have $${S().coins}.`);
        }
        if (held.kind === 'rig') return deny(el, 'Rig not allowed here', it.slot.zone === 'crate' ? 'Rigs go on tubes.' : 'That tube already has this rig, or the rack already has a Mortar.');
        if (sh) return hold({ kind: 'shell', slot: it.slot });
        return clearHeld();
      }
      if (sh) return hold({ kind: 'shell', slot: it.slot });
      return hint(it.slot.zone === 'tube' ? `Tube ${it.slot.i + 1} is empty` : `Crate slot ${it.slot.i + 1} is empty`,
        it.slot.zone === 'tube' ? 'Pick a card below, then tap here to load it.' : 'Park a shell here: Crate shells do not fire.');
    }
    if (held && held.kind === it.kind && (it.kind === 'rig' || held.i === it.i)) return clearHeld();
    hold(it);
  }

  /* ================= 13. Keyboard ('play' scope; §13) ================= */

  function rowEls(which) {
    if (which === 'rack') return E.tubes.map(t => t.btn).filter(b => !b.hidden).concat(E.crates);
    return E.cards.filter(b => !b.hidden && !b.disabled).concat(!E.workshop.hidden && !E.rigBtn.disabled ? [E.rigBtn] : []);
  }
  function whichRow(el) {
    if (!el) return null;
    if (el.matches('[data-tube],[data-crate]')) return 'rack';
    if (el.matches('[data-card],[data-act="buyRig"]')) return 'shop';
    return null;
  }
  function moveCursor(dx, dy) {
    const a = document.activeElement;
    let r = whichRow(a);
    if (!r) { const first = rowEls('rack')[0]; if (first) first.focus(); return; }
    let list = rowEls(r), i = Math.max(0, list.indexOf(a));
    if (dy) {
      const ratio = list.length > 1 ? i / (list.length - 1) : 0;
      r = r === 'rack' ? 'shop' : 'rack';
      list = rowEls(r);
      if (!list.length) return;
      i = Math.round(ratio * (list.length - 1));
    } else i = Math.min(list.length - 1, Math.max(0, i + dx));
    if (list[i]) list[i].focus();
  }
  function focusedSlot() {
    const it = itemOf(itemEl(document.activeElement));
    return it && it.kind === 'slot' ? it.slot : held && held.kind === 'shell' ? held.slot : null;
  }
  function keyEvent(a, b) { return a && typeof a === 'object' && 'key' in a ? a : b && typeof b === 'object' && 'key' in b ? b : { key: String(a || ''), preventDefault() {} }; }
  function onPlayKey(a, b) {
    const e = keyEvent(a, b), k = e.key;
    if (e.ctrlKey || e.metaKey || e.altKey || !G || !G.state) return false;
    const done = () => { if (fnIn(e, 'preventDefault')) e.preventDefault(); return true; };
    if (ui() === 'RESOLVING') {
      if (k === ' ' || k === 'Spacebar' || k === 'Enter') {
        if (!ffOnce && fnIn(G, 'fastForward')) { ffOnce = true; G.fastForward(); } else if (fnIn(G, 'skip')) G.skip();
        swallowKeyClick = performance.now() + 600; // cleared right after this key's keyup (Space clicks on keyup)
        return done();
      }
      // A build key pressed as the show ends goes to core, which holds it for 120 ms and applies it if RESULT
      // begins in time (spec §11.5); otherwise it expires as 'busy'.
      const early = { t: { type: 'buyTube' }, x: { type: 'reroll' }, m: { type: 'match' }, b: { type: 'restore' } }[k.length === 1 ? k.toLowerCase() : k];
      if (early) { commit(early); return done(); }
      return false;
    }
    if (!building()) return false;
    const lk = k.length === 1 ? k.toLowerCase() : k;
    if (lk !== 'Backspace' && lk !== 'Delete' && disarmSell()) render();
    switch (lk) {
      case 'ArrowLeft': case 'a': moveCursor(-1, 0); return done();
      case 'ArrowRight': case 'd': moveCursor(1, 0); return done();
      case 'ArrowUp': case 'w': moveCursor(0, -1); return done();
      case 'ArrowDown': case 's': moveCursor(0, 1); return done();
      case 'Enter': case ' ': {
        const el = document.activeElement;
        if (el && el.tagName === 'BUTTON' && (E.play.contains(el))) return false; // native click does it
        const first = rowEls('rack')[0];
        if (first) first.focus();
        return done();
      }
      case 'Escape':
        if (held || flash) { clearHeld(true); flash = null; render(); return done(); }
        return false;
      case '1': case '2': case '3': case '4': {
        const i = +lk - 1, b = E.cards[i];
        if (!b || b.hidden || b.disabled) return false;
        b.focus();
        if (held && held.kind === 'card' && held.i === i) clearHeld(); else hold({ kind: 'card', i });
        return done();
      }
      case 'g':
        if (E.workshop.hidden || E.rigBtn.disabled) return false;
        if (held && held.kind === 'rig') clearHeld(); else hold({ kind: 'rig' });
        { const first = E.tubes.map(t => t.btn).find(bb => !bb.hidden && targets.has('tube:' + bb.dataset.tube)); if (first) first.focus(); }
        return done();
      case 't': if (E.workshop.hidden) return false; tryAct('buyTube'); return done();
      case 'x': if (E.workshop.hidden) return false; tryAct('reroll'); return done();
      case 'Backspace': case 'Delete': { const sl = focusedSlot(); if (!sl) return false; sellSlot(sl); return done(); }
      case 'c': cycleColour(); return done();
      case 'm': if (E.match.disabled) { sfx('error'); return done(); } tryAct('match'); return done();
      case 'b': if (E.restore.disabled) { sfx('error'); return done(); } tryAct('restore'); return done();
      case 'u': case 'z': doUndo(); return done();
      case 'h': toggleRehearse(); return done();
      case 'i': {
        const it = itemOf(itemEl(document.activeElement));
        inspectItem(it || (held ? (held.kind === 'shell' ? { kind: 'slot', slot: held.slot } : held) : null));
        return done();
      }
      case 'f': light(); return done();
      default: return false;
    }
  }

  /* ================= 14. Resolving: live readout, result card (§8.1, §9) ================= */

  // Core keeps GAME.state as the rack-as-lit during RESOLVING and swaps in the live state at the slam
  // ('change' then 'result'); the rows below the rack stay collapsed until RESULT.
  function onUi(p) {
    const to = p && p.to;
    if (to === 'RESOLVING') {
      frozen = true; ffOnce = false;
      clearHeld(true); disarmSell(); flash = null;
      litTarget = litTarget || targetOf(S().show | 0);
      readout.on = true; readout.ooh = 0; readout.aah = 1; readout.score = 0;
      result = null;
      E.tubes.forEach(t => { t.btn.classList.remove('fired'); t.body.classList.remove('recoil'); });
    } else {
      frozen = false;
      E.tubes.forEach(t => { t.btn.classList.remove('fired'); t.body.classList.remove('recoil'); });
      E.fuse.classList.remove('lit');
      if (to !== 'RESULT') { readout.on = false; litTarget = 0; }
    }
    render();
    // Core refreshes GAME.preview before 'ui' and emits 'preview' when it changes (subscribed in init). Guard for a
    // core without that event: re-render once settled only if the preview we drew from went stale.
    if (to !== 'RESOLVING') Promise.resolve().then(() => { if (view && pvSig() !== view.pv) render(); });
  }
  let renderQueued = false;
  function renderSoon() {
    if (renderQueued) return;
    renderQueued = true;
    Promise.resolve().then(() => { renderQueued = false; render(); });
  }
  function onPresent(ev) {
    if (!ev || !ev.type) return;
    const T = typeof ev.tube === 'number' ? E.tubes[ev.tube] : null;
    switch (ev.type) {
      case 'fuseLit': lightFuse(ev); if (typeof ev.target === 'number') litTarget = ev.target; break;
      case 'launch': recoil(T); break;
      case 'burst': if (T) T.btn.classList.add('fired'); break;
      case 'gainOoh': case 'crowdCheer': readout.ooh += +ev.v || 0; punch(E.roO); break;
      case 'gainAah': readout.aah += +ev.v || 0; punch(E.roA); break;
      case 'multAah': readout.aah *= +ev.factor || 1; punch(E.roA, true); break;
      case 'applause': if (typeof ev.target === 'number') litTarget = ev.target; break;
      default: break;
    }
    // The SIM stamps running totals on gain / × / cheer / applause events: prefer them over the sum.
    if (typeof ev.ooh === 'number' && typeof ev.aah === 'number' && /^(gainOoh|gainAah|multAah|crowdCheer|applause)$/.test(ev.type)) {
      readout.ooh = ev.ooh; readout.aah = ev.aah;
    }
    readout.score = Math.floor(readout.ooh * readout.aah);
    if (!E.readout.hidden) paintReadout();
    E.cheer.style.setProperty('--fill', Math.min(1, litTarget ? readout.score / litTarget / 2 : 0).toFixed(3));
  }
  function onResult(p) {
    const entry = (p && p.entry) || {}, evs = (p && p.events) || [], sm = (p && p.summary) || {};
    const ap = evs.find(e => e && e.type === 'applause') || {};
    const pay = sm.payout || evs.find(e => e && e.type === 'payout') || null;
    result = {
      applause: num(sm.applause, entry.applause, ap.score, readout.score),
      ooh: num(sm.ooh, entry.ooh, ap.ooh, readout.ooh),
      aah: num(sm.aah, entry.aah, ap.aah, readout.aah),
      target: num(sm.target, entry.target, ap.target, litTarget),
      pass: sm.pass != null ? !!sm.pass : entry.pass != null ? !!entry.pass : !!ap.pass,
      encore: sm.encore != null ? !!sm.encore : !!(entry.encore || ap.encore),
      relit: !!(sm.relit || entry.relit), over: !!sm.over, items: payoutItems(pay),
      rainUsed: !!sm.rainUsed && !sm.over && !(sm.pass != null ? sm.pass : entry.pass),
    };
    readout.on = false;
    frozen = false; // the HUD takes the payout at the slam
    render();
  }
  const num = (...xs) => { for (const x of xs) if (typeof x === 'number' && isFinite(x)) return x; return 0; };
  // The itemised payout ticker (§5.2): coins first, then Crowd.
  function payoutItems(pay) {
    const out = [];
    if (!pay || typeof pay !== 'object') return out;
    const n = v => (typeof v === 'number' && isFinite(v) ? v : 0);
    const coin = (v, label) => { if (n(v)) out.push({ kind: '$', v, text: `+$${v} ${label}` }); };
    const crowd = (v, label) => { if (n(v)) out.push({ kind: 'c', v, text: `${label} +${v}` }); };
    const sp = pay.sponsor && typeof pay.sponsor === 'object' ? pay.sponsor : null;
    coin(pay.base, 'show fee');
    coin(pay.interest, 'interest');
    coin(sp ? sp.coins : pay.sponsorCoins, 'sponsor');
    coin(pay.shellCoins, 'from shells');
    crowd(n(pay.crowdPass) + n(pay.crowdHeadliner) + n(pay.shellCrowd), 'Crowd');
    crowd(pay.crowdEncore, 'Encore: Crowd');
    crowd(sp ? sp.crowd : 0, 'Sponsor: Crowd');
    if (sp && sp.collector) out.push({ kind: '$', v: 0, text: 'Collector card next shop' });
    return out;
  }

  /* ================= 15. Inspect sheet (#inspect; §4.13, §11.5) ================= */

  function inspectItem(item) {
    if (!item || !E.inspect || !G || !G.state) return;
    const html = safe(() => inspectHTML(item), '');
    if (!html) return;
    E.inspect.innerHTML = html;
    E.inspect.dataset.item = JSON.stringify(item);
    if (fnIn(G, 'open')) G.open('inspect'); else E.inspect.hidden = false;
    sfx('tick');
    requestAnimationFrame(() => { const b = $('[data-insp="close"]', E.inspect); if (b && !E.inspect.contains(document.activeElement)) b.focus(); });
  }
  function closeInspect() { if (fnIn(G, 'close')) G.close('inspect'); else E.inspect.hidden = true; }
  function inspectClick(el) {
    const a = el.dataset.insp;
    if (a === 'close') return closeInspect();
    if (a === 'sell') {
      const it = safe(() => JSON.parse(E.inspect.dataset.item || 'null'), null);
      if (!it || it.kind !== 'slot') return;
      const k = slotKey(it.slot);
      if (sellArmed === k) { closeInspect(); commit({ type: 'sell', from: it.slot }); return; }
      sellArmed = k;
      el.classList.add('armed');
      el.textContent = `Tap again: sell $${sellValue(slotShell(it.slot))}`;
      announce('Press again to confirm the sale.');
    }
    if (a === 'logbook' && fnIn(G, 'open')) { closeInspect(); G.open('logbook', { tab: 'shells', key: el.dataset.key }); }
  }
  function inspectHTML(item) {
    const st = S();
    const tipLine = id => (tipText(id) ? `<p class="insp-tip">${esc(tipText(id))}</p>` : '');
    const close = '<button type="button" class="btn btn-primary" data-insp="close">Close</button>';
    const shellSheet = (sh, where, extraBtns) => {
      const r = row(sh.id), col = shellCol(sh), star = sh.star || 1, rar = rarityOf(r);
      const hang = where && where.tb ? Math.max(0, hangOf(where.tb, view.rules)) : (r.hang || 0);
      let tiers = '';
      for (let k = 1; k <= 3; k++) tiers += `<li${k === star ? ' class="now"' : ''}><b>★${k}</b> ${esc(cardText(sh.id, col, k))}</li>`;
      const fus = fusionPairs().filter(([a, b]) => a === sh.id || b === sh.id);
      const known = fus.filter(([a, b]) => fusionFound(a, b));
      const fusTxt = known.map(([a, b, f]) => `<li>✦ ${esc(row(a).name)} → ${esc(row(b).name)}: <b>${esc((f && f.name) || '')}</b></li>`).join('') +
        (fus.length > known.length ? `<li class="dim">✦ ${fus.length - known.length} more fusion${fus.length - known.length > 1 ? 's' : ''} to discover</li>` : '');
      const facts = [`${colName(col)} ${colShape(col)}`, `★${star}`, `Hang ${hang}${r.shots > 1 ? ' each' : ''}`, rar[0], `$${r.cost}`];
      if (r.shots > 1) facts.push(`${r.shots} bursts`);
      let place = '';
      if (where && where.slot) {
        if (where.slot.zone === 'crate') place = `<p class="insp-where">In the Crate: it does not fire.</p>`;
        else {
          const i = where.slot.i, e = view.order.per[i];
          place = `<p class="insp-where">Tube ${i + 1}${where.tb.rig ? ' · rig ' + esc(rigInfo(where.tb.rig).name) : ''}` +
            (e.length ? ` · fires ${e.map(x => ordinal(x.from)).join(' and ')} of ${view.order.total}` : ' · does not fire') +
            (view.sees[i] != null ? ` · sees ${view.sees[i]}` : '') + (view.fav === i ? ' · ♛ Crowd Favourite' : '') + '</p>';
        }
      }
      return `<div class="insp-head">${tokenHTML(sh, { size: 'xl', hang })}<div><h2>${esc(r.name)}</h2><p class="insp-sub">${esc(facts.join(' · '))}</p></div></div>` +
        place + `<ul class="insp-tiers">${tiers}</ul>` + (fusTxt ? `<ul class="insp-fus">${fusTxt}</ul>` : '') +
        tipLine(where && where.tip || 't_sky') +
        `<div class="insp-btns">${extraBtns || ''}${close}</div>`;
    };
    if (item.kind === 'card') {
      const c = st.shop && st.shop.cards[item.i];
      if (!c) return '';
      const twin = owned().find(o => o.sh.id === c.id && (o.sh.star || 1) < 3);
      return shellSheet({ id: c.id, col: c.col || row(c.id).col, star: 1 }, { tip: twin ? 't_twin' : 't_sky' });
    }
    if (item.kind === 'slot' || item.kind === 'shell') {
      const slot = item.slot, sh = slotShell(slot);
      if (!sh) return `<h2>${esc(cap(slotName(slot)))}</h2><p>${slot.zone === 'tube' ? 'Empty. Pick a card, then tap this tube to load it.' : 'Empty. Crate shells do not fire.'}</p>${tipLine(slot.zone === 'tube' ? 't_tube' : 't_crate')}<div class="insp-btns">${close}</div>`;
      const tb = slot.zone === 'tube' ? st.tubes[slot.i] : null, k = slotKey(slot), armed = sellArmed === k;
      const sell = building() ? `<button type="button" class="btn btn-danger${armed ? ' armed' : ''}" data-insp="sell">${armed ? 'Tap again: sell' : 'Sell'} $${sellValue(sh)}</button>` : '';
      return shellSheet(sh, { slot, tb, tip: slot.zone === 'crate' ? 't_crate' : 't_sky' }, sell);
    }
    if (item.kind === 'rig') {
      const rc = st.shop && st.shop.rig;
      if (!rc) return '';
      const ri = rigInfo(rc.id);
      return `<div class="insp-head"><span class="insp-glyph">${ICON.rig[rc.id] || ''}</span><div><h2>${esc(ri.name)}</h2><p class="insp-sub">Rig · $${rc.cost != null ? rc.cost : ri.cost}</p></div></div>` +
        `<p class="insp-rule">${esc(ri.text)}</p><p>Rigs stay on the tube when shells move, and cannot be sold. A new rig replaces the old one.</p><div class="insp-btns">${close}</div>`;
    }
    if (item.kind === 'rule') {
      if (!item.id) return '';
      const r = ruleInfo(item.id), s = view.s, show = view.rules[0] === item.id && !view.rehearsing ? s : view.hs;
      return `<div class="insp-head"><span class="insp-glyph">${ruleIcon(item.id)}</span><div><h2>${esc(r.name)}</h2><p class="insp-sub">${show === s ? 'Tonight' : 'Show ' + (show + 1) + ' · ' + festName(festOf(show)) + ' Headliner'} · target ${fmt(targetOf(show))}</p></div></div>` +
        `<p class="insp-rule">${esc(r.text)}</p>` +
        (show !== s ? '<p>Press <b>Rehearse</b> (H) to preview it on your rack: numerals, chips and the crowd\'s mood switch to its rule.</p>' : '') +
        (() => { // the tip's advice only: the rule itself is the line above
          const id = item.id === 'windshift' || item.id === 'crossed' ? 't_match' : item.id === 'headwind' ? 't_head' : /^countdown/.test(item.id) ? 't_count' : null;
          const t = id ? tipAdvice(id, r.name) : '';
          return t ? `<p class="insp-tip">${esc(t)}</p>` : '';
        })() +
        `<div class="insp-btns">${close}</div>`;
    }
    if (item.kind === 'rain') {
      const used = critical();
      return `<div class="insp-head"><span class="insp-glyph${used ? ' bad' : ''}">${ICON.umbrella}</span><div><h2>Rain check</h2><p class="insp-sub">${used ? 'Used' : 'Unused'}${st.fairWeather ? ' · Fair Weather' : ''}</p></div></div>` +
        `<p class="insp-rule">Forgives one missed show per run, but not the Midnight Countdown.</p>${used ? '<p class="insp-tip">One more miss ends the run.</p>' : ''}` +
        (st.fairWeather ? '<p>Fair Weather: targets ×0.75, and the Countdown can be relit once.</p>' : '') + `<div class="insp-btns">${close}</div>`;
    }
    if (item.kind === 'mood') {
      const m = view.mood, b = k => (k === m ? `<b>${esc(moodName(k))}</b>` : esc(moodName(k)));
      return `<div class="insp-head"><span class="insp-glyph">${moodIcon(m)}</span><div><h2>Crowd mood: ${esc(moodName(m))}</h2></div></div>` +
        `<p class="insp-rule">How your rack reads against tonight's target. ${b('eager')}: likely pass · ${b('hopeful')}: close · ${b('restless')}: likely miss.</p>` +
        `<div class="insp-btns">${close}</div>`;
    }
    if (item.kind === 'coins') {
      return `<div class="insp-head"><span class="insp-glyph coin">$</span><div><h2>Coins: $${st.coins}</h2></div></div>` +
        `<p class="insp-rule">Spend them in the shop between shows. ${esc(tipText('t_interest'))}</p><div class="insp-btns">${close}</div>`;
    }
    if (item.kind === 'crowd') {
      const n = st.crowd, half = view.tonight.includes('ferry') ? Math.floor(n / 2) : null;
      return `<div class="insp-head"><span class="insp-glyph">${ICON.crowd}</span><div><h2>Crowd: ${fmt(n)}</h2></div></div>` +
        `<p class="insp-rule">Adds ${fmt(n)} Ooh to every show${half != null ? ` (${fmt(half)} tonight: ${esc(ruleInfo('ferry').name)})` : ''}. Grows each show you pass.</p><div class="insp-btns">${close}</div>`;
    }
    return '';
  }

  /* ================= 16. First-run hints (§6, §4.13) ================= */
  // Core owns the tooltip queue (shown once, as 'tip' toasts, dismissed by the next action). This module
  // adds the two triggers only the play screen can see (t_sky: first shell lifted; t_fusion: first
  // fusion badge) and lights up the element each tip is about, one at a time. Without GAME.tip it
  // shows the line itself in the sky.
  const TIP_ANCHOR = {
    t_fuse: '#fire', t_sky: '#rack', t_aah: '.readout, .result', t_head: '.hud-head', t_mood: '#firebar .mood',
    t_crowd: '.hud-crowd', t_interest: '.hud-coins', t_twin: '.card .b-twin', t_fusion: '.card .b-fuse',
    t_crate: '.crate', t_rig: '[data-act="buyRig"]', t_tube: '[data-act="buyTube"]', t_sponsor: '[data-act="sponsor"]',
    t_match: '[data-act="match"]', t_rain: '.hud-rain', t_count: '.hud-head',
  };
  function seen(id) { const m = G.meta; return seenLocal.has(id) || !!(m && Array.isArray(m.seenTips) && m.seenTips.includes(id)); }
  // Rehearsal Night (CONTRACT "Tutorial") queues no first-run tips and marks none as seen.
  const tutorialOn = () => !!(G && safe(() => G.tutorial, null));
  function queueTip(id) {
    if (!G || tutorialOn() || seen(id)) return;
    if (fnIn(G, 'tip')) { seenLocal.add(id); G.tip(id); return; }
    if ((tip && tip.id === id) || tipQueue.includes(id) || !tipText(id)) return;
    tipQueue.push(id);
    if (!tip) nextTip();
  }
  // A tip this screen shows itself (in the sky), once ever, until the next action or the end of the hold.
  function showOwnTip(id) {
    if (!G || tutorialOn() || seen(id) || !tipText(id)) return;
    tipQueue.length = 0;
    tipQueue.push(id);
    nextTip();
  }
  function nextTip() {
    const id = tipQueue.shift();
    tip = id ? { id, own: true } : null;
    if (tip) {
      seenLocal.add(id);
      const m = G.meta, list = m && Array.isArray(m.seenTips) ? m.seenTips : [];
      if (!list.includes(id) && fnIn(G, 'setMeta')) safe(() => G.setMeta({ seenTips: list.concat(id) }));
    }
    renderTip();
  }
  function dismissTip() { if (tip) { const own = tip.own; tip = null; if (own) nextTip(); else renderTip(); } }
  function renderTip() {
    const show = !!tip && ui() !== 'RESOLVING';
    E.tip.hidden = !(show && tip.own);
    let el = null;
    if (show) {
      if (tip.own) E.tip.textContent = tipText(tip.id);
      const sel = TIP_ANCHOR[tip.id], a = sel && $(sel.split(', ').map(x => '#play ' + x).join(', '));
      el = a && (a.closest('button, .hud-crowd, .hud-coins, .crate, #rack, .readout, .result') || a);
      if (el && !el.getClientRects().length) el = null;
    }
    // touch the classes only when the lit element changes (no restyle on every render)
    document.querySelectorAll('#play .tip-anchor').forEach(x => { if (x !== el) x.classList.remove('tip-anchor'); });
    if (el && !el.classList.contains('tip-anchor')) el.classList.add('tip-anchor');
  }
  function checkTips() {
    if (!building() || !view) return;
    if (!fnIn(G, 'tip')) { // core queues the rest itself
      const st = S(), s = view.s;
      if (s === 0) queueTip('t_fuse');
      if (view.tonight.includes('headwind')) queueTip('t_head');
      if (st.sponsor) queueTip('t_sponsor');
      if (view.tonight.includes('windshift') || view.tonight.includes('crossed')) queueTip('t_match');
      if (E.shop.querySelector('.b-twin')) queueTip('t_twin');
    }
    if (E.shop.querySelector('.b-fuse')) queueTip('t_fusion');
  }

  /* ================= 17. Build open, run start ================= */

  function syncShow() { // a new build opened (after the slam, a relight, a restore or a new run)
    if (ui() === 'RESOLVING' || !G.state) return;
    const s = S().show | 0;
    if (s === shownShow) return;
    shownShow = s;
    rehearse = false;
    clearHeld(true); disarmSell(); flash = null;
  }
  function onSim(p) {
    const a = p && p.action;
    if (a && a.type !== 'light' && result) result = null; // the result card stays pinned until the first build action
    dismissTip();
  }
  function onRunStart() {
    shownShow = -1; result = null; readout.on = false; frozen = false; rehearse = false; litTarget = 0;
    clearHeld(true); disarmSell(); flash = null; tip = null; tipQueue.length = 0;
    pictos.clear(); lastScene = '';
    render();
  }

  /* ================= 18. Init ================= */

  function init(game) {
    G = game;
    if (!G || !$('#play')) return;
    build();
    E.play.dataset.mode = mode;
    // pointer + click routing (delegated on the column; #inspect handles its own buttons)
    E.play.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    E.play.addEventListener('click', onClick);
    E.inspect.addEventListener('click', onClick);
    E.play.addEventListener('contextmenu', e => e.preventDefault());
    E.skyWrap.addEventListener('pointerdown', e => { // tapping the sky drops a selection
      if (building() && e.target.closest('button') == null && (held || flash)) { clearHeld(true); flash = null; render(); }
    });
    E.play.addEventListener('focusin', e => { // keyboard hover while holding
      // Only keyboard focus: a pointer focus arrives between pointerdown and click, and re-rendering the
      // rack then would detach the node under the finger and swallow the click (the tap never commits).
      if (!held || drag || !safe(() => e.target.matches(':focus-visible'), true)) return;
      const it = itemOf(itemEl(e.target));
      if (it && it.kind === 'slot' && targets.has(slotKey(it.slot))) setHover(it.slot); else if (hover) setHover(null);
    });
    // "the next input" disarms a sell and clears a transient message
    window.addEventListener('pointerdown', e => {
      const t = e.target;
      // a tap on the dimmed area around the Inspect sheet closes it (and does nothing else)
      if (!E.inspect.hidden && !(t.closest && t.closest('#inspect')) && (!fnIn(G, 'top') || G.top() === 'inspect')) {
        suppressUntil = performance.now() + 450; e.stopPropagation(); closeInspect(); return;
      }
      suppressUntil = 0; // a new gesture: only the click that ends a drag or long-press is swallowed
      if (sellArmed && !(t.closest && t.closest('[data-info="sell"],[data-insp="sell"]'))) { sellArmed = null; if (!itemEl(t)) render(); }
      if (flash && !(t.closest && t.closest('.info'))) { flash = null; if (!itemEl(t)) render(); }
    }, true);
    // the click a handled Space / Enter would synthesise lands during its keyup; after that, key clicks count again
    window.addEventListener('keyup', () => { if (swallowKeyClick) setTimeout(() => { swallowKeyClick = 0; }, 0); }, true);
    window.addEventListener('keydown', e => {
      if (/^(Shift|Control|Alt|Meta|Tab)$/.test(e.key)) return;
      let dirty = false;
      if (sellArmed && !['Backspace', 'Delete', 'Enter', ' '].includes(e.key)) { sellArmed = null; dirty = true; }
      if (flash) { flash = null; dirty = true; }
      if (dirty && building()) requestAnimationFrame(render);
    }, true);
    // layout mode
    if (typeof ResizeObserver === 'function') { const ro = new ResizeObserver(() => measure()); [E.play, E.tubesWrap].forEach(el => ro.observe(el)); }
    window.addEventListener('resize', measure);
    // GAME wiring
    const on = (n, f) => { if (fnIn(G, 'on')) G.on(n, x => safe(() => f(x))); };
    on('change', () => render());
    on('preview', () => { if (ui() !== 'RESOLVING') render(); }); // GAME.preview changed (Rehearse, build open)
    on('critical', () => renderSoon());
    on('sim', onSim);
    on('ui', onUi);
    on('present', onPresent);
    on('result', onResult);
    on('runStart', onRunStart);
    on('resize', () => measure());
    on('meta', () => { if (view) renderShop(); });
    on('settings', p => {
      if (p && (p.key === 'highContrast')) pictos.clear();
      if (p && ['highContrast', 'chips', 'mood', 'reducedMotion', 'fairWeather'].includes(p.key)) render();
    });
    on('overlay', p => { if (p && p.name === 'inspect' && !p.open) { sellArmed = null; if (building()) render(); } });
    on('tip', p => { if (p && p.id) { tip = { id: p.id, own: false }; seenLocal.add(p.id); renderTip(); } });
    on('tipDone', p => { if (p && p.again) seenLocal.delete(p.id); if (tip && !tip.own && (!p || p.id === tip.id)) { tip = null; renderTip(); } });
    if (fnIn(G, 'onKey')) G.onKey('play', onPlayKey);
    // the fit ladders measure text: measure again once the web fonts arrive (their widths differ from the fallbacks)
    const fonts = document.fonts;
    const refit = () => { fitEpoch++; render(); };
    if (fonts) { safe(() => fonts.ready.then(refit)); if (fnIn(fonts, 'addEventListener')) fonts.addEventListener('loadingdone', refit); }
    measure();
    render();
  }

  return {
    init,
    render,
    layout: measure,
    mode: () => mode,
    tubeCentres,
    select(item) { if (item && draggable(asHeld(item))) hold(asHeld(item)); },
    clearSelection() { clearHeld(); },
    inspect: inspectItem,
  };
})();
