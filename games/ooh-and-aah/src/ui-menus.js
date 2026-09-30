/* ==========================================================================
   UI_MENUS (ui-menus.js): the pause menu, Settings, the Logbook, Help,
   toasts and the "Tap to continue" overlay. Spec §7.1, §7.5, §8.3, §13.
   Renders only into its contract containers:
     #pause-menu #settings #logbook #help #toasts #tap-continue
   Overlays open and close only through GAME.open / GAME.close; this module
   refreshes them on the 'overlay' event. Settings go through
   GAME.setSetting; saves through GAME.exportSave / importSave /
   resetProgress. It never touches storage or the SIM state.
   Keys (via GAME.onKey): global P / L / ?, plus one scope per overlay.
   ========================================================================== */
const UI_MENUS = (() => {
  'use strict';

  /* ---------- module refs (all optional except GAME) ---------- */
  let G = null;
  const sim = () => (typeof OOH !== 'undefined' && OOH) || null;
  const fx = () => (typeof FX !== 'undefined' && FX) || null;
  const snd = () => (typeof AUDIO !== 'undefined' && AUDIO) || null;
  const DATA = () => (sim() && sim().DATA) || {};
  const can = (o, k) => !!o && typeof o[k] === 'function';
  const $ = (id) => document.getElementById(id);
  const call = (o, k, ...a) => { try { return can(o, k) ? o[k](...a) : undefined; } catch (e) { return undefined; } };

  /* ---------- tiny DOM helpers ---------- */
  const PROPS = new Set(['checked', 'value', 'disabled', 'hidden', 'readOnly', 'tabIndex']);
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const k in props || {}) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (PROPS.has(k)) el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(3)) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : String(kid));
    return el;
  }
  // A heading's brass rule is its own element (not ::after) so the text sits on the panel alone.
  const rule = () => h('span', { class: 'm-rule', 'aria-hidden': 'true' });
  const ICONS = {
    play: '<path fill="currentColor" stroke="none" d="M8 5.5v13l10.5-6.5z"/>',
    gear: '<path d="M4 7h10M18 7h2M4 17h3M11 17h9"/><circle cx="16" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    book: '<path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v14H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19M9 8h6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    copy: '<path d="M9 9h10v11H9zM5 15V4h10"/>',
    flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.8l-5.4 2.7 1.2-6-4.5-4.2 6.1-.7z"/>',
    lock: '<path d="M6 11h12v10H6zM9 11V7a3 3 0 0 1 6 0v4"/>',
    unlock: '<path d="M6 11h12v10H6zM9 11V7a3 3 0 0 1 5.8-1"/>',
    spark: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/>',
    rehearse: '<path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6"/><path d="M12 7.5v2.5"/>',
    umbrella: '<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9zM12 12v7a2 2 0 0 0 4 0"/>',
    // Headliners (§4.7 telegraph motifs)
    headwind: '<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h6"/>',
    drizzle: '<path d="M7 15a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8a3.5 3.5 0 0 1 .5 7zM8 18.5l-1 2.5M12.5 18.5l-1 2.5M17 18.5l-1 2.5"/>',
    critic: '<circle cx="10" cy="9" r="5"/><path d="M13.5 12.5L20 21"/>',
    shortfuse: '<path d="M4 19V7M8.5 19V7M13 19V7M16.5 8l4.5 10M21 8l-4.5 10"/>',
    fog: '<path d="M3 8c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 13c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/>',
    ordinance: '<path d="M2.5 9.2h4l5-4.4v14.4l-5-4.4h-4z"/><text x="13" y="17.5" font-size="11" font-weight="700" fill="currentColor" stroke="none">½</text>',
    windshift: '<path d="M5 21v-6M10 21v-6M15 21v-6M20 21v-6M20 8H5M8.5 4.5 5 8l3.5 3.5"/>',
    ferry: '<path d="M3 16l2 4h14l2-4zM6 16v-5h12v5M9 11V7h6v4M12 3v4"/>',
    crossed: '<path d="M4 5c8 0 8 14 16 14M4 19c8 0 8-14 16-14"/>',
    streetlights: '<path d="M9 21h6M12 21V8c0-3 3-4 6-4M16 4h5l-1 3h-3z"/>',
    powercut: '<path d="M13 3L6 13h5l-1 8 7-10h-5zM3 3l18 18"/>',
    rival: '<path d="M4 17L3 7l5 4 4-6 4 6 5-4-1 10zM4 20h16"/>',
    countdown: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    // Rigs (§4.6 glyphs)
    tall: '<path d="M8 21V9h8v12M12 2v7M9 5l3-3 3 3"/>',
    brass: '<path d="M7 21V5h10v16M6 10h12M6 13h12"/>',
    spotlight: '<path d="M9 3h6l-1 4h-4zM10 7L4 21h16L14 7"/>',
    lucky: '<path d="M6 20v-9a6 6 0 0 1 12 0v9M4 20h4M16 20h4"/>',
    mortar: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
  };
  function icon(name, cls) {
    const t = document.createElement('template');
    t.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="m-ico ' + (cls || '') +
      '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[name] || ICONS.spark) + '</svg>';
    return t.content.firstChild;
  }

  /* ---------- data access: OOH.DATA tables (arrays or id-keyed objects) + sim helpers ---------- */
  const rows = (x) => !x ? [] : Array.isArray(x) ? x : Object.keys(x).map((k) => Object.assign({ id: k }, x[k]));
  const find = (x, id) => rows(x).find((r) => r && r.id === id) || null;
  const meta = () => (G && G.meta) || {};
  const codex = () => meta().codex || {};
  const simFn = (k, ...a) => call(sim(), k, ...a);
  const fmt = (n) => { const v = simFn('fmt', n); return v != null ? v : Number(n || 0).toLocaleString('en-US'); };
  const RARITY = { C: 'Common', U: 'Uncommon', R: 'Rare' };
  const festName = (f) => rows(DATA().FESTIVALS)[f - 1] || 'Festival ' + f;
  const slotName = (s) => (s === 23 ? 'Midnight Countdown' : (DATA().SHOW_NAMES || ['Twilight', 'Evening', 'Headliner'])[s % 3]);
  const colName = (c) => (c === '*' ? 'Any colour' : simFn('colourName', c) || c);
  const nameOf = (table, id) => { const r = find(DATA()[table], id); return (r && r.name) || String(id || ''); };
  // DATA card text is a ★-template ('+{20} Ooh', '×{x0.3} Aah'); this renders ★1 when no sim helper answers.
  const untemplate = (t) => String(t || '').replace(/\{x([\d.]+)\}/g, (_, k) => String(1 + Number(k))).replace(/\{%\}/g, '100%').replace(/\{([^}]*)\}/g, '$1');

  /* The key map (§13) lives here: it is UI copy no other module shows. */
  const KEYMAP = [
    ['Tab / Shift+Tab', 'Move focus: HUD, Sponsor, rack, Crate, tools, cards, workshop, Light'],
    ['← → or A D', 'Move the rack cursor across the tubes, then the Crate'],
    ['↑ ↓ or W S', 'Switch between the rack row and the shop row'],
    ['Enter / Space', 'Pick up the focused shell or card, then drop it on the focused slot'],
    ['Esc', 'Cancel a pick; otherwise pause'],
    ['1 2 3 4', 'Select shop card 1–4'],
    ['G', 'Rig card (then ← → and Enter to choose a tube)'],
    ['T', 'Add tube'], ['X', 'Reroll'],
    ['Backspace / Delete', 'Sell the focused shell (press again to confirm)'],
    ['C', "Cycle a wild card's colour (Chemist)"],
    ['M', 'Match'], ['B', 'Restore last order'], ['U or Z', 'Undo'], ['H', 'Rehearse'], ['I', 'Inspect'],
    ['F', 'Light the fuse'], ['Space (while firing)', 'Fast-forward; press again to Skip'],
    ['P', 'Pause'], ['L', 'Logbook'], ['?', 'Help'], ['R / Enter (end screen)', 'Run it back'],
  ];

  /* ---------- milestones and locks ---------- */
  function unlockName(id) {
    for (const t of ['SHELLS', 'KITS']) { const r = find(DATA()[t], id); if (r) return r.name + (t === 'KITS' ? ' kit' : ''); }
    return String(id);
  }
  function msInfo(id) {
    const r = find(DATA().MILESTONES, id) || {}, un = r.unlocks || {};
    const list = Array.isArray(un) ? un.map(unlockName) : typeof un === 'string' ? [un]
      : [...(un.shells || []).map(unlockName), ...(un.kits || []).map(unlockName), ...(un.other || []).map(otherText)];
    return { id, name: r.name || id, goal: Number(r.goal) || 1, metric: r.metric || '', cond: r.text || '', unlocks: list.join(', ') };
  }
  const otherText = (t) => String(t).replace(/its left half as a silhouette/i, 'its first shell');
  const hurtsLine = (t) => {
    t = String(t).trim().replace(/\s*\([^)]*["“][^)]*\)/g, '').replace(/\.$/, '');
    const c = t.indexOf(': ');
    if (c > 0 && !/^hurts$/i.test(t.slice(0, c))) t = t.slice(c + 2);
    const up = t.charAt(0).toUpperCase() + t.slice(1);
    return /^(hurts|every)\b/i.test(t) || c > 0 ? up + '.' : 'Hurts: ' + t + '.';
  };
  const msIdFor = (lock) => { const m = rows(DATA().MILESTONES).find((r) => r.id === lock || r.name === lock); return m ? m.id : lock; };
  function isUnlocked(lock) {
    if (!lock || lock === 'start') return true;
    if (G && G.flags && G.flags.unlock === 'all') return true;
    return (meta().unlocked || []).includes(msIdFor(lock));
  }
  function msProgress(id) {
    const info = msInfo(id), done = (meta().unlocked || []).includes(id);
    const v = done ? info.goal : Math.min(info.goal, Number((meta().progress || {})[id]) || 0);
    return { info, done, v };
  }
  const lockHint = (lock) => { const p = msProgress(msIdFor(lock)); return p.info.name + ' ' + p.v + '/' + p.info.goal; };
  const lockBadge = (lock) => { const p = msProgress(msIdFor(lock)); return p.v + '/' + p.info.goal; };
  const lockLine = (lock) => { const p = msProgress(msIdFor(lock)); return 'Unlocks with the ' + p.info.name + ' milestone: ' + p.info.cond + '.'; };
  const fusionParts = (r) => { const k = String(r.key || r.id || ''); return [r.a || k.split('>')[0], r.b || k.split('>')[1]]; };
  const fusionEntry = (r) => { const [a, b] = fusionParts(r); return (codex().fusions || {})[a + '>' + b] || null; };

  /* ---------- pictograms (FX.pictogram → cached data URL <img>) ---------- */
  const pictoCache = new Map();
  function picto(id, col, star, size) {
    const c = col && col !== '*' ? col : 'W';
    const hc = !!(G && G.settings && G.settings.highContrast);
    const key = [id, c, star || 1, size, hc].join('|');
    let url = pictoCache.get(key);
    if (url === undefined) {
      url = null;
      const cv = call(fx(), 'pictogram', id, c, star || 1, size, { highContrast: hc });
      if (cv && cv.width) { try { url = cv.toDataURL(); } catch (e) { url = null; } }
      if (url) pictoCache.set(key, url);   // a miss is retried next render (FX may not be ready yet)
    }
    return url ? h('img', { src: url, alt: '', width: size, height: size, class: 'm-picto', draggable: 'false' })
      : h('span', { class: 'm-picto m-picto-fb', 'data-col': c, style: 'width:' + size + 'px;height:' + size + 'px' });
  }

  /* ---------- 2-tap confirmations: armed until the next input (§11.2) ---------- */
  const armed = new Set();
  function twoTap(btn, idle, armedText, onConfirm) {
    const label = btn.querySelector('.m-2tap-label') || btn;
    const set = (on) => {
      btn.dataset.armed = on ? 'true' : 'false';
      label.textContent = on ? armedText : idle;
      if (on) armed.add(btn); else armed.delete(btn);
    };
    btn._disarm = () => set(false);
    set(false);
    btn.addEventListener('click', () => {
      if (btn.dataset.armed === 'true') { set(false); onConfirm(); }
      else { set(true); call(G, 'announce', armedText + '.'); }
    });
  }
  const disarmAll = (except) => { for (const b of [...armed]) if (b !== except) b._disarm(); };
  // Pointer input disarms here; keyboard input disarms in the scope handlers (core owns keydown).
  function disarmOnKey(e) {
    if (!armed.size) return;
    const a = document.activeElement;
    const activating = (e.key === 'Enter' || e.key === ' ') && armed.has(a);
    disarmAll(activating ? a : null);
  }

  /* ---------- small shared bits ---------- */
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const fill = (el, ...kids) => el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false));
  /* Soft-hyphenate long words for 2-line tile captions (hyphens:auto needs a
     dictionary the browser may lack): VC|C nearest the middle, else V|C. */
  const DIGRAPH = /^(ch|sh|th|ph|wh|ck|gh)$/i, V = /[aeiouy]/i;
  const soft = (text) => String(text).replace(/[A-Za-z]{10,}/g, (w) => {
    let best = -1;
    for (const pass of [2, 1]) {
      for (let i = 2; i < w.length - 3; i++) {
        const ok = pass === 2 ? V.test(w[i - 1]) && !V.test(w[i]) && !V.test(w[i + 1]) && !DIGRAPH.test(w[i] + w[i + 1])
          : V.test(w[i]) && !V.test(w[i + 1]);
        if (ok && (best < 0 || Math.abs(i + 0.5 - w.length / 2) < Math.abs(best + 0.5 - w.length / 2))) best = i;
      }
      if (best >= 0) break;
    }
    return best < 0 ? w : w.slice(0, best + 1) + '\u00AD' + w.slice(best + 1);
  });
  const eyebrow = (t) => h('p', { class: 'm-eyebrow' }, t);
  const closeBtn = (name, label) => h('button', { type: 'button', class: 'btn m-x', 'aria-label': label || 'Close', onclick: () => G.close(name) }, icon('close'));
  function head(name, kicker, title, extra) {
    return h('header', { class: 'm-head' },
      h('div', { class: 'm-titles' }, eyebrow(kicker), h('div', { class: 'm-title-row' }, h('h2', { class: 'display', id: name + '-title' }, title), extra || null)),
      closeBtn(name));
  }
  function bunting() {
    const cols = ['R', 'A', 'G', 'B', 'W'];
    let tri = '';
    for (let i = 0; i < 9; i++) {
      const x = 22 + i * 34.5, t = x / 320, y = (1 - t) * (1 - t) * 3 + 2 * (1 - t) * t * 26 + t * t * 3;
      tri += '<path class="b-' + cols[i % 5] + '" d="M' + (x - 8).toFixed(1) + ' ' + y.toFixed(1) + 'h16l-8 13z"/>';
    }
    const t = document.createElement('template');
    t.innerHTML = '<svg class="m-bunting" viewBox="0 0 320 32" preserveAspectRatio="none" aria-hidden="true"><path class="b-line" d="M0 3Q160 49 320 3" fill="none"/>' + tri + '</svg>';
    return t.content.firstChild;
  }
  function settleFocus(el, pref, force) {
    setTimeout(() => {
      if (el.hidden || !pref) return;
      const a = document.activeElement;
      if (force ? a !== pref : (a === el || a === document.body || !el.contains(a))) pref.focus();
    }, 0);
  }
  async function copyText(text, field) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); return 'copied'; }
    } catch (e) { /* fall back to selection */ }
    if (field) {
      field.focus(); field.select();
      try { if (document.execCommand && document.execCommand('copy')) return 'copied'; } catch (e) { /* manual copy */ }
    }
    return 'selected';
  }

  /* ======================================================================
     PAUSE MENU (§8.3): Resume · Settings · Logbook · Help · Seed · Abandon
     ====================================================================== */
  const P = {};
  function buildPause() {
    const root = $('pause-menu');
    root.setAttribute('aria-labelledby', 'pause-menu-title');
    P.where = h('p', { class: 'm-sub' });
    P.resume = h('button', { type: 'button', id: 'pause-resume', 'data-autofocus': true, class: 'btn btn-primary m-wide', onclick: () => G.close('pause') }, icon('play'), 'Resume');
    const tile = (id, ic, label, name) => h('button', { type: 'button', id, class: 'btn pm-tile', onclick: () => G.open(name) }, icon(ic), h('span', null, label));
    P.seed = h('input', { id: 'pause-seed', class: 'pm-seed-val', type: 'text', readOnly: true, 'aria-label': 'Seed', spellcheck: 'false', autocomplete: 'off' });
    P.copyNote = h('span', { class: 'pm-copied', role: 'status' });
    P.copy = h('button', { type: 'button', id: 'pause-seed-copy', class: 'btn pm-copy', 'aria-label': 'Copy seed', onclick: onCopySeed }, icon('copy'), h('span', null, 'Copy'));
    P.tags = h('p', { class: 'pm-tags' });
    P.abandon = h('button', { type: 'button', id: 'pause-abandon', class: 'btn btn-danger m-wide pm-abandon' }, icon('flag'), h('span', { class: 'm-2tap-label' }));
    twoTap(P.abandon, 'Abandon run', 'Tap again to abandon', () => { G.close('pause'); call(G, 'abandon'); });
    const panel = h('div', { class: 'panel m-panel pm-panel' },
      bunting(),
      h('header', { class: 'm-head pm-head' }, h('div', { class: 'm-titles' }, eyebrow('Intermission'), h('h2', { class: 'display', id: 'pause-menu-title' }, 'Paused'), P.where)),
      h('div', { class: 'm-body pm-body' },
        P.resume,
        h('div', { class: 'pm-tiles' + (can(G, 'startTutorial') ? ' pm-tiles-4' : '') }, tile('pause-settings', 'gear', 'Settings', 'settings'), tile('pause-logbook', 'book', 'Logbook', 'logbook'), tile('pause-help', 'help', 'Help', 'help'),
          can(G, 'startTutorial') ? h('button', { type: 'button', id: 'pause-tutorial', class: 'btn pm-tile', onclick: startTutorial }, icon('rehearse'), h('span', null, 'Tutorial')) : null),
        h('div', { class: 'pm-ticket' }, h('div', { class: 'pm-ticket-v' }, h('label', { for: 'pause-seed', class: 'pm-ticket-k' }, 'Seed'), P.seed), P.copy, P.copyNote),
        P.tags,
        P.abandon));
    root.replaceChildren(panel);
  }
  async function onCopySeed() {
    const r = await copyText(P.seed.value, P.seed);
    P.copyNote.textContent = r === 'copied' ? 'Copied' : 'Selected: copy it now';
  }
  function renderPause(keepArmed) {
    const st = (G && G.state) || {};
    // While a show plays (and on its result card) the SIM has already moved on: name the show being played.
    const playing = (G.ui === 'RESOLVING' || G.ui === 'RESULT') && P.lastBuild != null && P.lastBuild <= (Number(st.show) || 0);
    const s = playing ? P.lastBuild : Number(st.show) || 0, f = Math.floor(s / 3) + 1;
    const where = st.phase === 'won' ? ['Happy New Year!', 'Show ' + (s + 1)]
      : s >= 24 ? ['Afterparty', 'Show ' + (s + 1) + ' of 36']
        : [festName(f) + ' · ' + slotName(s), 'Show ' + (s + 1) + ' of 24'];
    const run = st.seed != null;
    P.where.replaceChildren(...(run ? where.map((t) => h('span', null, t)) : []));
    P.seed.value = run ? String(st.seed) : '';
    P.seed.closest('.pm-ticket').hidden = !run;
    P.copyNote.textContent = '';
    const tags = [];
    if (st.kit) tags.push('Kit: ' + nameOf('KITS', st.kit));
    if (st.renown) tags.push('Renown ' + st.renown);
    if (st.fairWeather) tags.push('Fair Weather');
    if (st.daily) tags.push('Daily Show');
    P.tags.replaceChildren(...tags.map((t) => h('span', { class: 'chip pm-chip' }, t)));
    P.abandon.hidden = !(st.phase === 'build' && G.ui !== 'END');
    if (!keepArmed) P.abandon._disarm();
  }

  // Help and Pause both start "Rehearsal Night": close the menus first, then the core sets the run aside.
  function startTutorial() {
    if (G && G.ui === 'RESOLVING') return; // a show in flight would finish off-screen; the buttons say "after this show"
    for (let n = 0; n < 8 && call(G, 'top') && call(G, 'top') !== 'end'; n++) call(G, 'close');
    call(G, 'startTutorial');
  }
  // The tutorial sets the run aside, so it waits for a show in flight to finish.
  function syncTutorialButtons() {
    const busy = !!G && G.ui === 'RESOLVING';
    for (const [id, idle, wait] of [['pause-tutorial', 'Tutorial', 'After this show'], ['help-tutorial', 'Play the tutorial', 'Play it after this show']]) {
      const b = document.getElementById(id); if (!b) continue;
      b.disabled = busy; const sp = b.querySelector('span'); if (sp) sp.textContent = busy ? wait : idle;
    }
  }

  /* ======================================================================
     SETTINGS (§8.3, §7.5): every control is a labelled form control.
     ====================================================================== */
  const S = {};
  const setting = (k) => { const s = (G && G.settings) || {}; return k === 'soundVol' ? (s.soundVol != null ? s.soundVol : s.sfxVol) : s[k]; };
  function set(k, v) { call(G, 'setSetting', k, v); }
  function switchRow(id, key, label, hint) {
    const inp = h('input', {
      type: 'checkbox', role: 'switch', id, class: 'st-switch', 'aria-describedby': hint ? id + '-hint' : null,
      onchange: (e) => { set(key, e.target.checked); syncSettings(); },
    });
    S[key] = inp;
    return h('label', { class: 'st-row', for: id }, h('span', { class: 'st-text' }, h('span', { class: 'st-label' }, label), hint ? h('span', { class: 'st-hint', id: id + '-hint' }, hint) : null), inp);
  }
  function volumeRow(id, key, label) {
    const out = h('output', { class: 'st-val num', for: id });
    let raf = 0;
    const inp = h('input', {
      type: 'range', id, class: 'st-range', min: '0', max: '100', step: '5',
      oninput: (e) => { out.textContent = e.target.value + '%'; e.target.style.setProperty('--p', e.target.value + '%'); cancelAnimationFrame(raf); raf = requestAnimationFrame(() => set(key, Number(e.target.value) / 100)); },
      onchange: (e) => { set(key, Number(e.target.value) / 100); if (key === 'soundVol') call(snd(), 'ui', 'tick'); },
    });
    S[key] = inp; S[key + 'Out'] = out;
    return h('div', { class: 'st-row st-sub' }, h('label', { for: id, class: 'st-label' }, label), inp, out);
  }
  function radioRow(name, key, legend, opts, hint) {
    S[key] = [];
    const seg = h('div', { class: 'st-seg' }, opts.map(([val, text]) => {
      const id = 'set-' + name + '-' + String(val).replace('.', '');
      const inp = h('input', { type: 'radio', name: 'set-' + name, id, value: String(val), class: 'vh-radio', onchange: () => { set(key, typeof val === 'number' ? Number(val) : val); syncSettings(); } });
      inp._val = val; S[key].push(inp);
      return [inp, h('label', { for: id }, text)];
    }));
    return h('fieldset', { class: 'st-row st-radios', role: 'radiogroup', 'aria-labelledby': 'set-' + name + '-legend' },
      h('legend', { class: 'st-label', id: 'set-' + name + '-legend' }, legend), hint != null ? h('span', { class: 'st-hint', id: 'set-' + name + '-hint' }, hint) : null, seg);
  }
  const section = (title, ...kids) => h('section', { class: 'st-sec' }, h('h3', { class: 'display st-h' }, h('span', null, title), rule()), kids);

  function buildSettings() {
    const root = $('settings');
    root.setAttribute('aria-labelledby', 'settings-title');
    const vibe = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
    // Save tools
    S.exportText = h('textarea', { id: 'set-export-text', class: 'st-text-in', rows: '3', readOnly: true, hidden: true, 'aria-label': 'Your save string', spellcheck: 'false' });
    S.exportNote = h('p', { class: 'st-note', role: 'status' });
    S.importText = h('textarea', { id: 'set-import-text', class: 'st-text-in', rows: '3', placeholder: 'Paste a save string here', spellcheck: 'false', autocomplete: 'off', 'aria-describedby': 'set-import-status' });
    S.importNote = h('p', { class: 'st-note', id: 'set-import-status', role: 'status' });
    S.reset = h('button', { type: 'button', id: 'set-reset', class: 'btn btn-danger st-reset' }, h('span', { class: 'm-2tap-label' }));
    S.resetNote = h('p', { class: 'st-note', role: 'status' });
    twoTap(S.reset, 'Reset progress', 'Tap again to erase', () => {
      call(G, 'resetProgress');
      S.resetNote.textContent = 'Progress erased. The Logbook starts fresh.';
      syncSettings();
    });
    S.fairNote = h('span', { class: 'st-hint st-warn', id: 'set-fair-next' });
    const body = h('div', { class: 'm-body st-body' },
      section('Sound',
        switchRow('set-sound', 'sound', 'Sound effects'), volumeRow('set-sound-vol', 'soundVol', 'Effects volume'),
        switchRow('set-music', 'music', 'Music', 'River sounds and a music box.'), volumeRow('set-music-vol', 'musicVol', 'Music volume')),
      section('Motion & display',
        radioRow('motion', 'reducedMotion', 'Reduced motion', [['auto', 'Auto'], ['on', 'On'], ['off', 'Off']], ''),
        switchRow('set-contrast', 'highContrast', 'High contrast', 'Pure black sky, white outlines, no glows.'),
        radioRow('speed', 'speed', 'Show speed', [[0.5, '50%'], [0.75, '75%'], [1, '100%']]),
        switchRow('set-instant', 'instant', 'Instant results', 'Skip the fireworks and list each burst’s score.')),
      section('Play',
        radioRow('chips', 'chips', 'Hints while holding a shell', [['full', 'Full'], ['partners', 'Fusions only']], 'Full shows what each tube would add. Fusions only shows just the ✦ hints.'),
        switchRow('set-mood', 'mood', 'Crowd mood', 'Shows Restless, Hopeful or Eager before you light.'),
        vibe ? switchRow('set-haptics', 'haptics', 'Haptics', 'Short buzzes on drops, multipliers and misses.') : null),
      section('Assist',
        h('div', { class: 'st-assist' },
          switchRow('set-fair', 'fairWeather', 'Fair Weather', 'Every target ×0.75, and you can relight the Midnight Countdown once. These runs are marked Fair Weather. Milestones still count. Renown does not go up.'),
          S.fairNote)),
      section('Your save',
        h('div', { class: 'st-block' },
          h('p', { class: 'st-label' }, 'Export save'),
          h('p', { class: 'st-hint' }, 'Copy a text string with your progress and settings.'),
          h('button', { type: 'button', id: 'set-export', class: 'btn', onclick: onExport }, icon('copy'), 'Copy save string'),
          S.exportText, S.exportNote),
        h('div', { class: 'st-block' },
          h('label', { class: 'st-label', for: 'set-import-text' }, 'Import save'),
          h('p', { class: 'st-hint' }, 'Paste a string from Export, then Apply. It replaces this device’s progress.'),
          S.importText,
          h('button', { type: 'button', id: 'set-import-apply', class: 'btn', onclick: onImport }, 'Apply'),
          S.importNote),
        h('div', { class: 'st-block' },
          h('p', { class: 'st-label' }, 'Reset progress'),
          h('p', { class: 'st-hint' }, 'Erases milestones, the Logbook, records and posters.'),
          S.reset, S.resetNote)));
    const foot = h('footer', { class: 'm-foot' }, h('button', { type: 'button', id: 'settings-done', class: 'btn btn-primary m-wide', onclick: () => G.close('settings') }, 'Done'));
    root.replaceChildren(h('div', { class: 'panel m-panel st-panel' }, head('settings', 'Backstage', 'Settings'), body, foot));
  }
  function onExport() {
    let str = '';
    try { str = String(call(G, 'exportSave') || ''); } catch (e) { str = ''; }
    if (!str) { S.exportNote.textContent = 'There is nothing to export yet.'; return; }
    S.exportText.hidden = false; S.exportText.value = str;
    copyText(str, S.exportText).then((r) => {
      S.exportNote.textContent = r === 'copied' ? 'Copied to the clipboard. Keep it somewhere safe.' : 'Selected. Copy the text above and keep it somewhere safe.';
    });
  }
  function onImport() {
    const str = S.importText.value.trim();
    S.importNote.dataset.kind = 'error';
    if (!str) { S.importNote.textContent = 'Paste a save string first.'; S.importText.focus(); return; }
    let ok = false;
    try { ok = !!call(G, 'importSave', str); } catch (e) { ok = false; }
    if (ok) { S.importNote.dataset.kind = 'ok'; S.importNote.textContent = 'Save imported. Your progress and settings are restored.'; S.importText.value = ''; syncSettings(); }
    else { S.importNote.textContent = 'That string could not be read as an Ooh × Aah save. Paste the whole string from Export and try again.'; S.importText.focus(); }
  }
  // Save-tool status lines belong to one visit (core's reset/import may close every overlay mid-handler).
  function clearSaveNotes() {
    if (!S.exportText) return;
    S.exportText.hidden = true; S.exportText.value = '';
    for (const n of [S.exportNote, S.importNote, S.resetNote]) n.textContent = '';
  }
  function syncSettings() {
    if (!S.sound) return;
    for (const k of ['sound', 'music', 'highContrast', 'instant', 'mood', 'fairWeather', 'haptics']) if (S[k]) S[k].checked = !!setting(k);
    for (const k of ['soundVol', 'musicVol']) {
      const v = Math.round(100 * (setting(k) != null ? Number(setting(k)) : (k === 'musicVol' ? 0.35 : 0.8)));
      S[k].value = String(v); S[k + 'Out'].textContent = v + '%'; S[k].style.setProperty('--p', v + '%');
      S[k].closest('.st-row').dataset.off = setting(k === 'soundVol' ? 'sound' : 'music') ? 'false' : 'true';
    }
    const radios = { reducedMotion: setting('reducedMotion') || 'auto', speed: Number(setting('speed') || 1), chips: setting('chips') || 'full' };
    for (const k in radios) for (const r of S[k]) r.checked = r._val === radios[k];
    const mq = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mh = $('set-motion-hint');
    if (mh) mh.textContent = 'Auto follows your device (currently ' + (mq ? 'reduced' : 'full motion') + ').';
    const st = (G && G.state) || null;
    S.fairNote.textContent = st && st.phase === 'build' && !!st.fairWeather !== !!setting('fairWeather') ? 'Applies from your next run.' : '';
  }

  /* ======================================================================
     LOGBOOK (§7.1, §8.3): full-screen sheet, tabs, 72 px tiles, details.
     ====================================================================== */
  const L = { tab: 'shells', open: null };
  const TABS = [
    ['shells', 'Shells'], ['fusions', 'Fusions'], ['headliners', 'Headliners'], ['rigs', 'Rigs'],
    ['kits', 'Kits'], ['milestones', 'Milestones'], ['records', 'Records'], ['posters', 'Posters'],
  ];
  function buildLogbook() {
    const root = $('logbook');
    root.setAttribute('aria-labelledby', 'logbook-title');
    L.tabs = TABS.map(([id, label]) => h('button', {
      type: 'button', role: 'tab', id: 'lb-tab-' + id, class: 'lb-tab', 'aria-controls': 'lb-panel', 'data-tab': id,
      onclick: () => selectTab(id, false),
    }, h('span', { class: 'lb-tab-name' }, label), h('span', { class: 'lb-tab-n num' })));
    L.tablist = h('div', { role: 'tablist', class: 'lb-tabs', 'aria-label': 'Logbook sections' }, L.tabs);
    L.tablist.addEventListener('scroll', tabEdges, { passive: true });
    L.panel = h('div', { role: 'tabpanel', id: 'lb-panel', class: 'm-body lb-body' });
    L.detail = h('section', { id: 'lb-detail', class: 'lb-detail', 'aria-live': 'polite', 'aria-label': 'Entry details', hidden: true });
    L.total = h('p', { class: 'lb-total num' });
    root.replaceChildren(h('div', { class: 'panel m-panel lb-sheet' }, head('logbook', 'Field notes', 'Logbook', L.total), L.tablist, L.panel, L.detail));
  }
  // Fade the tab strip's edges while more tabs sit off-screen (phones), so it reads as scrollable.
  function tabEdges() {
    const t = L.tablist;
    if (!t) return;
    const l = t.scrollLeft > 2, r = t.scrollLeft + t.clientWidth < t.scrollWidth - 2;
    t.dataset.edge = (l ? 'l' : '') + (r ? 'r' : '');
  }
  function selectTab(id, focus) {
    L.tab = id;
    for (const t of L.tabs) {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      t.toggleAttribute('data-autofocus', on);
      if (on) {
        if (focus) t.focus({ preventScroll: true });
        const tr = t.getBoundingClientRect(), lr = L.tablist.getBoundingClientRect();   // centre the tab, clear of the edge fades
        if (lr.width) L.tablist.scrollLeft += (tr.left + tr.width / 2) - (lr.left + lr.width / 2);
      }
    }
    L.panel.setAttribute('aria-labelledby', 'lb-tab-' + id);
    tabEdges();
    closeDetail(false);
    renderTab();
    L.panel.scrollTop = 0;
  }
  function renderLogbook() {
    const a = document.activeElement, keep = a && a.classList && a.classList.contains('lb-tile') ? a.dataset.key : null;
    let found = 0, total = 0;
    for (const t of L.tabs) {
      const c = COUNT[t.dataset.tab] ? COUNT[t.dataset.tab]() : null;
      t.querySelector('.lb-tab-n').textContent = c ? c[0] + '/' + c[1] : '';
      if (c && t.dataset.tab !== 'posters') { found += c[0]; total += c[1]; }
    }
    L.total.textContent = found + '/' + total + ' found';
    selectTab(L.tab, false);
    const again = keep && L.panel.querySelector('.lb-tile[data-key="' + keep.replace(/"/g, '') + '"]');
    if (again) again.focus();
  }

  /* --- per-tab entries: {key, state:'found'|'seen'|'unseen'|'locked', art, name, cap, label, detail()} --- */
  const shellSeen = (id) => { const c = (codex().shells || {})[id]; return !!(c && (c.seen || c.owned)); };
  const WILD = ['R', 'A', 'G', 'B'];
  const shellCol = (id) => { const r = find(DATA().SHELLS, id); return r && r.col !== '*' ? r.col : 'A'; };
  const rarityOf = (r) => RARITY[r.rar || r.rarity] || '';
  function shellArt(r, i, size, silhouette) {
    const col = r.col === '*' ? WILD[i % 4] : r.col;   // wild rows cycle colours so the grid reads as a festival
    return h('span', { class: 'lb-art' + (silhouette ? ' is-sil' : ''), style: '--art:' + size + 'px' },
      h('span', { class: 'lb-plate', 'data-col': r.col || 'W' }), picto(r.id, col, 1, Math.round(size * 0.78)),
      silhouette ? null : h('span', { class: 'lb-mono' }, r.mono || ''));
  }
  function shellEntries() {
    return rows(DATA().SHELLS).map((r, i) => {
      const unlocked = isUnlocked(r.lock), seen = shellSeen(r.id), fest = r.fest || 1;
      const state = !unlocked ? 'locked' : seen ? 'found' : 'unseen';
      const cap = state === 'found' ? r.name : state === 'locked' ? msInfo(msIdFor(r.lock)).name : 'Festival ' + fest + '+';
      return {
        key: r.id, state, cap, art: (sz) => shellArt(r, i, sz, state !== 'found'), badge: state === 'locked' ? lockBadge(r.lock) : null,
        label: state === 'found' ? r.name + ', ' + colName(r.col) + ', ' + rarityOf(r) : state === 'locked' ? 'Locked shell. ' + lockHint(r.lock) : 'Not seen yet. Offered from Festival ' + fest,
        detail: () => shellDetail(r, i, state, fest),
      };
    });
  }
  const shellText = (r, star) => simFn('describeShell', r.id, r.col === '*' ? null : r.col, star) || (star === 1 ? untemplate(r.text) : '');
  function shellDetail(r, i, state, fest) {
    if (state === 'locked') return dPanel(shellArt(r, i, 80, true), 'Locked shell', [lockHint(r.lock)], [lockLine(r.lock)]);
    if (state === 'unseen') return dPanel(shellArt(r, i, 80, true), 'Not seen yet', ['Festival ' + fest + '+'], ['Offered in shops from Festival ' + fest + ' (' + festName(fest) + ').']);
    const TAG_WORDS = { mono: 'one-colour skies', rainbow: 'mixed colours', canopy: 'long-hanging skies', salvo: 'many bursts',
      thunder: 'clearing the sky', crowd: 'a big Crowd', position: 'a set place in the fire order' };
    const tags = (Array.isArray(r.tags) ? r.tags : String(r.tags || '').split(/[,·]\s*/)).map((t) => TAG_WORDS[String(t).trim().toLowerCase()]).filter(Boolean).join(', ');
    const partners = rows(DATA().FUSIONS).filter((f) => fusionParts(f).includes(r.id) && (fusionEntry(f) || {}).found)
      .map((f) => { const [a, b] = fusionParts(f); return nameOf('SHELLS', a) + ' → ' + nameOf('SHELLS', b) + ' (' + f.name + ')'; });
    const owned = ((codex().shells || {})[r.id] || {}).owned;
    const lines = [1, 2, 3].map((st) => { const t = shellText(r, st); return t ? h('span', { class: 'lb-star' }, h('b', null, '★' + st + ' '), t) : null; });
    return dPanel(shellArt(r, i, 80, false), r.name,
      [rarityOf(r), '$' + r.cost, 'Hang ' + r.hang + (r.shots > 1 ? ' each' : ''), colName(r.col), 'Festival ' + fest + '+'],
      [h('span', { class: 'lb-rule' }, lines), r.shots > 1 ? r.shots + ' bursts per shell.' : null, tags ? 'Works with: ' + tags + '.' : null,
        partners.length ? 'Fuses: ' + partners.join('; ') + '.' : null, owned ? 'Bought ' + plural(owned, 'time') + '.' : null]);
  }

  function fusionEntries() {
    const half = (meta().unlocked || []).includes('m_logbook');   // Logbook Half: every left half shows
    return rows(DATA().FUSIONS).map((r) => {
      const [a, b] = fusionParts(r), key = a + '>' + b, e = fusionEntry(r) || {};
      const own = e.leftSeen || half || (((codex().shells || {})[a] || {}).owned > 0);
      const state = e.found ? 'found' : own ? 'seen' : 'unseen';
      const an = nameOf('SHELLS', a), bn = nameOf('SHELLS', b);
      const cap = state === 'found' ? r.name : state === 'seen' ? an + ' → ?' : '? → ?';
      const art = (sz) => h('span', { class: 'lb-art lb-fuse', style: '--art:' + sz + 'px' },
        h('span', { class: state === 'unseen' ? 'is-sil' : '' }, picto(a, shellCol(a), 1, Math.round(sz * 0.44))),
        h('span', { class: 'lb-arrow', 'aria-hidden': 'true' }, '→'),
        h('span', { class: state === 'found' ? '' : 'is-sil' }, picto(b, shellCol(b), 1, Math.round(sz * 0.44))));
      const later = r.lock && !isUnlocked(r.lock) ? ' Possible once ' + msInfo(msIdFor(r.lock)).name + ' is unlocked.' : '';
      return {
        key, state, cap, art,
        label: state === 'found' ? r.name + ': ' + an + ' then ' + bn : state === 'seen' ? an + ' then an undiscovered partner' : 'Undiscovered fusion',
        detail: () => state === 'found'
          ? dPanel(art(80), r.name, [an + ' → ' + bn, 'Fired ' + (e.fired || 0) + '×'],
            ['Fire ' + an + ' right before ' + bn + '. ' + bn + '’s first burst gains: ' + (simFn('describeFusion', key) || untemplate(r.text)).replace(/\.$/, '') + '.'])
          : dPanel(art(80), cap, [state === 'seen' ? 'Partner unknown' : 'Unknown'],
            [(state === 'seen' ? 'One shell fuses when it fires right after a ' + an + '. Try different shells in the next tube.'
              : 'Own the shell that starts this fusion to see it here.') + later]),
      };
    });
  }

  function glyphArt(name, sz, sil) { return h('span', { class: 'lb-art lb-glyph' + (sil ? ' is-sil' : ''), style: '--art:' + sz + 'px' }, icon(name)); }
  function headlinerEntries() {
    const seenTab = codex().headliners || {};           // core: id → times faced (0 = posted, not yet faced)
    return rows(DATA().HEADLINERS).map((r) => {
      const seen = seenTab[r.id] != null || r.id === 'countdown', faced = seenTab[r.id] || 0;
      const win = r.min ? (r.max && r.max !== r.min ? 'Festivals ' + r.min + '–' + r.max : 'Festival ' + r.min) : '';
      return {
        key: r.id, state: seen ? 'found' : 'unseen', cap: seen ? r.name : 'Unseen',
        art: (sz) => glyphArt(r.id, sz, !seen),
        label: seen ? r.name + ' headliner' : 'Unseen headliner. ' + (win ? 'Appears in ' + win : ''),
        detail: () => seen
          ? dPanel(glyphArt(r.id, 80), r.name, [win, faced ? 'Faced ' + faced + '×' : null],
            [r.text || r.rule || '', r.counters ? hurtsLine(r.counters) : null, r.telegraph ? 'On the rack: ' + r.telegraph + '.' : null])
          : dPanel(glyphArt(r.id, 80, true), 'Unseen headliner', [win], ['Each Headliner is announced a festival ahead, so you will see it coming.' + (win ? ' Look for it in ' + win + '.' : '')]),
      };
    });
  }
  function rigEntries() {
    const seenTab = codex().rigs || {};                 // core: id → times installed (0 = offered)
    return rows(DATA().RIGS).map((r) => {
      const seen = seenTab[r.id] != null, n = seenTab[r.id] || 0;
      return {
        key: r.id, state: seen ? 'found' : 'unseen', cap: seen ? r.name : 'Festival 2+',
        art: (sz) => glyphArt(r.id, sz, !seen), label: seen ? r.name + ' rig' : 'Rig not seen yet',
        detail: () => seen
          ? dPanel(glyphArt(r.id, 80), r.name, ['$' + r.cost, 'Installed ' + n + '×'], [r.text || '', 'Rigs stay with the tube, not the shell.'])
          : dPanel(glyphArt(r.id, 80, true), 'Not seen yet', ['Festival 2+'], ['Rig cards appear in the workshop from Festival 2.']),
      };
    });
  }
  // kit racks: [[id, col], …] in sim.js; objects {id, col} or {shell} are accepted too
  const kitRack = (r) => (r.rack || []).map((t) => (Array.isArray(t) ? { id: t[0], col: t[1] } : t && (t.shell || t))).filter((t) => t && t.id);
  function kitArt(r, sz, sil) {
    const rack = kitRack(r).slice(0, 3);
    return h('span', { class: 'lb-art lb-kit' + (sil ? ' is-sil' : ''), style: '--art:' + sz + 'px' },
      rack.map((t) => picto(t.id, t.col || shellCol(t.id), 1, Math.round(sz * 0.36))));
  }
  function kitEntries() {
    const wins = (meta().records || {}).winsByKit || {};
    return rows(DATA().KITS).map((r) => {
      const open = isUnlocked(r.lock);
      const rack = () => kitRack(r).map((t) => nameOf('SHELLS', t.id) + (t.col && find(DATA().SHELLS, t.id) && find(DATA().SHELLS, t.id).col === '*' ? ' (' + colName(t.col) + ')' : '')).join(', ');
      return {
        key: r.id, state: open ? 'found' : 'locked', cap: open ? r.name : msInfo(msIdFor(r.lock)).name, badge: open ? null : lockBadge(r.lock),
        art: (sz) => kitArt(r, sz, !open), label: open ? r.name + ' kit' : 'Locked kit. ' + lockHint(r.lock),
        detail: () => open
          ? dPanel(kitArt(r, 80), r.name, ['Starts with $' + (r.coins || 0), r.crowd ? 'Crowd +' + r.crowd : null, plural(wins[r.id] || 0, 'win')],
            ['Starts with ' + rack() + '.', r.text && r.text !== 'Default' ? r.text + '.' : 'The default kit.'])
          : dPanel(kitArt(r, 80, true), 'Locked kit', [lockHint(r.lock)], [lockLine(r.lock)]),
      };
    });
  }
  function ringArt(p, sz) {
    const R = 26, C = 2 * Math.PI * R, frac = Math.max(0, Math.min(1, p.v / p.info.goal));
    const t = document.createElement('template');
    t.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true" class="lb-ring"><circle cx="32" cy="32" r="' + R + '" class="lb-ring-bg"/>' +
      '<circle cx="32" cy="32" r="' + R + '" class="lb-ring-fg" stroke-dasharray="' + (C * frac).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 32 32)"/></svg>';
    return h('span', { class: 'lb-art lb-ms' + (p.done ? ' is-done' : ''), style: '--art:' + sz + 'px' }, t.content.firstChild,
      p.done ? icon('check', 'lb-ms-ico') : h('span', { class: 'lb-ms-v num' }, p.v + '/' + p.info.goal));
  }
  function milestoneEntries() {
    return rows(DATA().MILESTONES).map((r) => {
      const p = msProgress(r.id);
      return {
        key: r.id, state: p.done ? 'found' : 'seen', cap: p.info.name, art: (sz) => ringArt(p, sz),
        label: p.info.name + (p.done ? ', done' : ', ' + p.v + ' of ' + p.info.goal),
        detail: () => dPanel(ringArt(p, 80), p.info.name, [p.done ? 'Done' : 'Best ' + p.v + '/' + p.info.goal],
          [p.info.cond + '.', p.info.metric && !p.done ? 'Progress: ' + p.info.metric + (r.id === 'm_logbook' ? '' : ', best in any run') + '.' : null,
            p.info.unlocks ? (p.done ? 'Unlocked: ' : 'Unlocks: ') + p.info.unlocks + '.' : null]),
      };
    });
  }
  const ENTRIES = { shells: shellEntries, fusions: fusionEntries, headliners: headlinerEntries, rigs: rigEntries, kits: kitEntries, milestones: milestoneEntries };
  const countOf = (tab) => { const es = ENTRIES[tab](); return [es.filter((e) => e.state === 'found').length, es.length]; };
  const COUNT = {
    shells: () => countOf('shells'), fusions: () => countOf('fusions'), headliners: () => countOf('headliners'), rigs: () => countOf('rigs'),
    kits: () => countOf('kits'), milestones: () => countOf('milestones'),
    posters: () => [Math.min(5, (meta().posters || []).length), 5],
  };
  const INTRO = {
    shells: 'Every shell you have been offered. Tap one for its rule at each ★.',
    fusions: 'Fire a shell right before its partner, and the partner’s first burst fuses. Found fusions show their bonus.',
    headliners: 'The third show of each festival twists the rules. Each is announced a festival ahead.',
    rigs: 'Tube upgrades. They stay on the tube when shells move.',
    kits: 'Starting racks. Each trades a constraint for a bonus.',
    milestones: 'Goals that unlock new shells and kits. Progress counts in lost runs too. Each unlock starts with your next run.',
  };

  function tileArt(e) {
    const art = e.art(72);
    if (e.badge) art.append(h('span', { class: 'lb-badge num' }, icon('lock'), e.badge));
    return art;
  }
  function renderTab() {
    const tab = L.tab, TAB_LABEL = (TABS.find((t) => t[0] === tab) || [])[1];
    L.panel.removeAttribute('tabindex');
    if (tab === 'records') return renderRecords();
    if (tab === 'posters') return renderPosters();
    const es = ENTRIES[tab]();
    const c = countOf(tab);
    const grid = h('ul', { class: 'lb-grid', role: 'list' }, es.map((e) => h('li', { class: 'lb-cell' },
      h('button', {
        type: 'button', class: 'lb-tile', 'data-state': e.state, 'data-key': e.key, 'aria-label': e.label,
        'aria-expanded': 'false', 'aria-controls': 'lb-detail', onclick: (ev) => toggleDetail(e, ev.currentTarget),
      }, tileArt(e), h('span', { class: 'lb-cap', 'aria-hidden': 'true' }, soft(e.cap))))));
    const tech = tab === 'fusions' ? rows(DATA().TECHNIQUES) : [];
    fill(L.panel,
      h('div', { class: 'lb-lede' }, h('p', { class: 'lb-count display' }, TAB_LABEL + ' ', h('span', { class: 'num' }, c[0] + '/' + c[1])), h('p', { class: 'lb-intro' }, INTRO[tab])),
      es.length ? grid : h('p', { class: 'lb-empty' }, 'Nothing here yet.'),
      tech.length ? h('section', { class: 'lb-tech', 'aria-labelledby': 'lb-tech-h' }, h('h3', { class: 'display', id: 'lb-tech-h' }, 'Techniques'),
        h('p', { class: 'lb-intro' }, 'Not fusions, just good habits.'),
        h('ul', null, tech.map((t) => { const m = String(t).match(/^([^:]+):\s*(.*)$/); return h('li', null, m ? [h('b', null, m[1] + ': '), m[2]] : t); }))) : null);
  }
  function renderRecords() {
    const m = meta(), r = m.records || {}, bs = r.bestShow, br = r.bestRun;
    const wins = r.winsByKit || {}, kitIds = Object.keys(wins).filter((k) => wins[k] > 0).sort((a, b) => wins[b] - wins[a]);
    const kitWins = kitIds.length ? h('ul', { class: 'lb-rec-list' }, kitIds.map((k) => h('li', null, h('span', null, nameOf('KITS', k)), h('b', { class: 'num' }, String(wins[k]))))) : null;
    const renownWon = r.highestRenown != null ? r.highestRenown : (m.wins > 0 && m.renown ? Math.max(0, (m.renown.max || 1) - 1) : null);
    const ms = r.fastestWinMs, mmss = ms ? Math.floor(ms / 60000) + ':' + String(Math.floor(ms / 1000) % 60).padStart(2, '0') : null;
    const rec = (k, v, sub) => h('div', { class: 'lb-rec' + (v == null ? ' is-empty' : '') }, h('dt', null, k), h('dd', { class: 'num' }, v == null ? 'Not yet' : v, sub ? h('span', { class: 'lb-rec-sub' }, sub) : null));
    L.panel.tabIndex = 0;
    fill(L.panel, 
      h('div', { class: 'lb-lede' }, h('p', { class: 'lb-count display' }, 'Records'), h('p', { class: 'lb-intro' }, plural(m.runs || 0, 'run') + ' · ' + plural(m.wins || 0, 'win'))),
      h('dl', { class: 'lb-records' },
        rec('Best show', bs && bs.score != null ? fmt(bs.score) : null, bs ? 'Show ' + ((bs.show != null ? bs.show : 0)) + (bs.seed ? ' · seed ' + bs.seed : '') : null),
        rec('Best run', br && br.shows ? 'Show ' + br.shows : null, br && br.shows && br.total != null ? fmt(br.total) + ' total Applause' : null),
        rec('Fastest win', mmss, mmss ? 'build time' : null),
        rec('Best Afterparty', r.bestAfterparty ? r.bestAfterparty + ' shows' : null),
        rec('Wins by kit', kitWins),
        rec('Highest Renown won', renownWon != null && m.wins > 0 ? 'Renown ' + renownWon : null)));
  }
  const endUI = () => (typeof UI_END !== 'undefined' && UI_END) || null;
  function renderPosters() {
    const list = (meta().posters || []).slice(-5).reverse();
    const paint = can(endUI(), 'paintPoster');       // share UI_END's painter so posters match the end screen
    L.panel.tabIndex = 0;
    const jobs = [];
    const cards = list.map((p) => {
      const rack = posterRack(p), n = Math.max(rack.length, 1);
      const f = typeof p.festival === 'number' ? festName(p.festival) : p.festival || '';
      const score = p.score != null ? p.score : p.best;
      let art;
      if (paint) { art = h('canvas', { class: 'lb-poster-cv', 'aria-hidden': 'true' }); jobs.push([art, p]); }
      else {
        art = h('div', { class: 'lb-poster-sky', 'aria-hidden': 'true' }, rack.map((t, i) => h('span', { class: 'lb-poster-col', style: '--x:' + ((i + 0.5) / n).toFixed(3) + ';--y:' + (0.18 + 0.22 * Math.abs(Math.sin(i * 1.7 + n))).toFixed(3) },
          t ? picto(t.id, t.col || shellCol(t.id), t.star || 1, 52) : null)));
      }
      const title = p.won ? (p.endless ? 'The Afterparty' : 'Happy New Year!') : f || 'The show';
      const where = [p.show != null ? 'Show ' + p.show : null, p.seed ? 'seed ' + p.seed : null];   // painted on the canvas too
      const facts = [score ? 'Best show ' + fmt(score) : null, p.kit ? nameOf('KITS', p.kit) : null, p.renown ? 'Renown ' + p.renown : null,
        p.fair ? 'Fair Weather' : null, p.date || null];
      return h('figure', { class: 'lb-poster' + (p.won ? ' is-won' : '') }, art,
        h('figcaption', null, h('strong', { class: paint ? 'vh' : 'display-italic' }, title + (paint ? ', ' + where.filter(Boolean).join(', ') + '. ' : '')),
          h('span', null, (paint ? facts : [...where, ...facts]).filter(Boolean).join(' · '))));
    });
    fill(L.panel, 
      h('div', { class: 'lb-lede' }, h('p', { class: 'lb-count display' }, 'Posters ', h('span', { class: 'num' }, list.length + '/5')), h('p', { class: 'lb-intro' }, 'Your last five racks, painted as festival posters.')),
      cards.length ? h('div', { class: 'lb-posters' }, cards) : h('p', { class: 'lb-empty' }, 'Finish a run to paint your first poster.'));
    for (const [cv, p] of jobs) call(endUI(), 'paintPoster', cv, p, { width: cv.clientWidth || 300, height: 180 });
  }
  const posterRack = (p) => (p.tubes || p.rack || []).map((t) => (t && (t.shell || (t.id ? t : null))) || null);

  /* --- detail card (tap a tile for its rule text) --- */
  function dPanel(art, title, chips, lines) {
    return [h('div', { class: 'lb-d-art' }, art),
      h('div', { class: 'lb-d-head' }, h('h3', { class: 'display' }, title),
        h('p', { class: 'lb-d-chips' }, chips.filter(Boolean).map((c) => h('span', { class: 'chip' }, c)))),
      h('div', { class: 'lb-d-body' }, lines.filter(Boolean).map((l) => h('p', { class: 'lb-d-line' }, l)))];
  }
  function toggleDetail(entry, tile) {
    if (L.open === tile) return closeDetail(true);
    closeDetail(false);
    L.open = tile; tile.setAttribute('aria-expanded', 'true');
    fill(L.detail, ...entry.detail(), h('button', { type: 'button', class: 'btn m-x lb-d-x', 'aria-label': 'Close details', onclick: () => closeDetail(true) }, icon('close')));
    L.detail.hidden = false;
    call(snd(), 'ui', 'tick');
    if (tile.scrollIntoView) tile.scrollIntoView({ block: 'nearest' });
  }
  function closeDetail(refocus) {
    if (!L.detail) return;
    const t = L.open;
    L.detail.hidden = true; L.detail.replaceChildren(); L.open = null;
    if (t) { t.setAttribute('aria-expanded', 'false'); if (refocus && t.isConnected) t.focus(); }
  }
  function logbookKey(e) {
    const a = document.activeElement, k = e.key;
    if (k === 'Escape' && L.open) { closeDetail(true); return true; }
    if (a && a.getAttribute('role') === 'tab' && L.tabs.includes(a)) {
      const i = L.tabs.indexOf(a), n = L.tabs.length;
      const j = k === 'ArrowRight' ? (i + 1) % n : k === 'ArrowLeft' ? (i + n - 1) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
      if (j < 0) return false;
      if (e.preventDefault) e.preventDefault();
      selectTab(L.tabs[j].dataset.tab, true);
      return true;
    }
    if (a && a.classList && a.classList.contains('lb-tile') && /^Arrow/.test(k)) {
      const tiles = [...L.panel.querySelectorAll('.lb-tile')], i = tiles.indexOf(a);
      const cols = Math.max(1, tiles.filter((t) => t.offsetTop === tiles[0].offsetTop).length);
      const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[k];
      const j = i + d;
      if (e.preventDefault) e.preventDefault();
      if (j < 0 && k === 'ArrowUp') { (L.tabs.find((t) => t.tabIndex === 0) || L.tabs[0]).focus(); return true; }
      if (tiles[j]) tiles[j].focus();
      return true;
    }
    return false;
  }
  /** Open the Logbook on a tab (and optionally a tile key such as 'salute>comet'). */
  function openLogbook(tab, key) {
    if (tab && TABS.some((t) => t[0] === tab)) L.tab = tab;
    L.pendingKey = key || null;
    call(G, 'open', 'logbook', { tab: L.tab, key });
  }

  /* ======================================================================
     HELP (§1 rules card, glossary, §13 key map)
     ====================================================================== */
  /* 'R / Enter (end screen)' → <kbd>R</kbd> / <kbd>Enter</kbd> (end screen) */
  function keyCell(spec) {
    const paren = spec.match(/\s*\(.*\)$/), out = [];
    (paren ? spec.slice(0, paren.index) : spec).split(' ').forEach((tok) => {
      if (tok === '/' || tok === 'or') out.push(' ' + tok + ' ');
      else { if (out.length && typeof out[out.length - 1] !== 'string') out.push(' '); out.push(h('kbd', null, tok)); }
    });
    if (paren) out.push(h('span', { class: 'hp-note' }, paren[0]));
    return out;
  }
  function buildHelp() {
    const root = $('help');
    root.setAttribute('aria-labelledby', 'help-title');
    let rules = DATA().RULES_CARD;
    rules = Array.isArray(rules) ? rules : typeof rules === 'string' ? rules.split(/\n+/).map((s) => s.replace(/^\s*\d+[.)]\s*/, '')).filter(Boolean) : [];
    const gl = rows(DATA().GLOSSARY).map((g) => Array.isArray(g) ? g : [g.term || g.id || g.name, g.meaning || g.text || g.def]).filter((g) => g[0]);
    const tut = can(G, 'startTutorial') ? h('div', { class: 'hp-tut' },
      h('p', { class: 'hp-tut-t' }, h('span', { class: 'display-italic' }, 'Rehearsal Night'), h('span', null, 'Learn by playing, in about 2 minutes.')),
      h('button', { type: 'button', id: 'help-tutorial', class: 'btn hp-tut-b', onclick: startTutorial }, icon('rehearse'), h('span', null, 'Play the tutorial'))) : null;
    const body = h('div', { class: 'm-body hp-body', tabindex: '0', role: 'region', 'aria-label': 'Rules, glossary and keys' },
      tut,
      h('ol', { class: 'hp-card', 'aria-label': 'The rules' }, rules.slice(0, 3).map((t, i) => h('li', null, h('span', { class: 'hp-n display-italic', 'aria-hidden': 'true' }, String(i + 1)), h('span', null, t)))),
      gl.length ? h('section', { class: 'hp-sec', 'aria-labelledby': 'hp-gl' }, h('h3', { class: 'display', id: 'hp-gl' }, h('span', null, 'Glossary'), rule()),
        h('dl', { class: 'hp-gloss' }, gl.map(([t, d]) => h('div', null, h('dt', null, t), h('dd', null, d))))) : null,
      h('section', { class: 'hp-sec', 'aria-labelledby': 'hp-keys' }, h('h3', { class: 'display', id: 'hp-keys' }, h('span', null, 'Keys'), rule()),
        h('table', { class: 'hp-keys' }, h('tbody', null, KEYMAP.map(([k, d]) => h('tr', null,
          h('th', { scope: 'row' }, keyCell(k)), h('td', null, d)))))));
    const foot = h('footer', { class: 'm-foot' }, h('button', { type: 'button', id: 'help-done', class: 'btn btn-primary m-wide', onclick: () => G.close('help') }, 'Back to the show'));
    root.replaceChildren(h('div', { class: 'panel m-panel hp-panel' }, head('help', 'The playbill', 'How to play'), body, foot));
  }

  /* ======================================================================
     TOASTS (render GAME 'toast'; #toasts is aria-hidden: each text is voiced when it arrives)
     One rule, everywhere, so a toast never covers level-1 information:
       - toasts play only over the play screen in BUILD or RESULT: never during a show, never while
         any overlay is up (menus, the Inspect and Show-log sheets, the end screen, Tap to continue);
         until then they queue (the queue survives: they play when the player is back at the show);
       - one at a time, in the lowest band of the sky that nothing else occupies at that moment
         (the HUD, Sponsor strip, readout, result card, info card, sky labels and cheer meter are
         obstacles), which is usually the sky's lower band just above the rack. When no band is
         tall enough (a result card filling a short sky), the toast waits for the next change;
       - a toast that something opens over, or that new sky content would touch, steps back into
         the queue and plays again in full later;
       - tips (one at a time) go first and stay until the core's 'tipDone' (the next action).
     The sky is measured only when a toast is about to play, or when the screen under a playing
     toast changes (state, overlay, resize, the sky's own content): at most once per frame.
     ====================================================================== */
  const T = { q: [], cur: null, raf: 0, gap: 0, mo: null, ro: null, watching: false };
  const TOAST_ICON = { milestone: 'star', logbook: 'book', discover: 'book', unlock: 'unlock', fusion: 'spark', tip: 'help' };
  const TOAST_MAX = 6, EDGE = 4, CLEAR = 6, MOVING = 24;   // queue cap; px from the sky's edges / any obstacle / a moving one
  function toast(text, kind, id) {
    if (!$('toasts') || !text) return;
    if ((T.cur && T.cur.text === text) || T.q.some((t) => t.text === text)) return;
    const it = { text: String(text), kind: kind || 'info', id, tip: kind === 'tip', el: null, h: 0, timer: 0 };
    if (it.tip) {
      T.q = T.q.filter((t) => !t.tip || t.late);
      if (T.cur && T.cur.tip) retire(T.cur, true);
      else if (T.cur) requeue();                 // a tip points at the play screen now: it goes first
      T.q.unshift(it);
    } else {
      T.q.push(it);
      while (T.q.length > TOAST_MAX) { const i = T.q.findIndex((t) => !t.tip); if (i < 0) break; T.q.splice(i, 1); }
    }
    kick();
  }
  const toastEl = (it) => h('div', { class: 'toast', 'data-kind': it.kind }, h('span', { class: 'toast-ico' }, icon(TOAST_ICON[it.kind] || 'spark')),
    h('span', { class: 'toast-text' }, it.tip ? h('b', { class: 'toast-k' }, 'Tip ') : null, it.text));
  // Held: not at the play screen (a show, the end, boot) or something is open over it.
  function toastsHeld() {
    const app = $('app'), ui = app ? app.dataset.ui : '';
    // Rehearsal Night shows no toasts: any queued from the run set aside wait for its return.
    return (ui !== 'BUILD' && ui !== 'RESULT') || !!topName() || document.hidden || !!(G && G.tutorial);
  }
  function kick() {
    if (!T.raf && (T.cur || T.q.length)) T.raf = requestAnimationFrame(toastFrame);
  }
  function toastFrame() {
    T.raf = 0;
    const held = toastsHeld();
    if (T.cur && (held || !refit())) requeue();
    if (!T.cur && T.q.length && !T.gap && !held) playNext();
    watchSky(!held && !!(T.cur || T.q.length));
  }
  // The sky's free bands (px, relative to #app), after every obstacle that shares its width.
  function skyBands() {
    const app = $('app'), wrap = $('sky-wrap');
    if (!app || !wrap) return null;
    const ar = app.getBoundingClientRect(), sr = wrap.getBoundingClientRect();
    if (sr.height < 40 || sr.width < 160) return null;
    let left = sr.left - ar.left + EDGE, right = sr.right - ar.left - EDGE;
    const obs = [];
    const add = (el) => {
      if (!el || el.hidden || !el.getClientRects().length) return;
      if (getComputedStyle(el).visibility === 'hidden') return;   // (one fading in counts already)
      let r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      // Still easing in or moving (e.g. the info card lifting over the fusion arc): allow for its
      // travel; its 'transitionend' / 'animationend' re-checks against where it settled.
      if (el.getAnimations && el.getAnimations().length) r = { left: r.left, right: r.right, top: r.top - MOVING, bottom: r.bottom + MOVING };
      if (el.classList.contains('cheer')) { if (r.left > sr.left + sr.width / 2) right = Math.min(right, r.left - ar.left - CLEAR); return; }
      obs.push(r);
    };
    add($('hud')); add($('sponsor'));
    const over = $('sky-overlay');
    if (over) for (const c of over.children) add(c.classList.contains('result') ? (c.querySelector('.res-card') || c) : c); // the result wrapper fills the sky; only its card is occupied
    let free = [[sr.top - ar.top + EDGE, sr.bottom - ar.top - EDGE]];
    for (const r of obs) {
      if (r.right - ar.left <= left || r.left - ar.left >= right) continue;
      const a = r.top - ar.top - CLEAR, b = r.bottom - ar.top + CLEAR;
      free = free.flatMap(([x, y]) => (b <= x || a >= y ? [[x, y]] : [[x, Math.min(y, a)], [Math.max(x, b), y]].filter(([p, q]) => q > p)));
    }
    return { left: Math.round(left), width: Math.max(0, Math.round(right - left)), free };
  }
  // The lowest band that fits a toast of height hgt: its top edge, or null.
  function bandTop(lane, hgt) {
    for (let i = lane.free.length - 1; i >= 0; i--) { const [x, y] = lane.free[i]; if (y - x >= hgt) return Math.floor(y - hgt); }
    return null;
  }
  function playNext() {
    const box = $('toasts'), it = T.q[0];
    const lane = box && it && skyBands();
    if (!lane || lane.width < 160) return;
    const el = it.el || (it.el = toastEl(it));
    box.style.left = lane.left + 'px'; box.style.width = lane.width + 'px';
    el.classList.add('is-measure');
    box.append(el);
    it.h = el.offsetHeight;
    const top = bandTop(lane, it.h);
    if (top == null) { el.remove(); return; }   // no room right now: wait for the next change
    box.style.top = top + 'px';
    el.classList.remove('is-measure');
    T.q.shift();
    T.cur = it;
    it.w = lane.width;
    // Tips stay until core's 'tipDone' (the next action); other toasts leave on their own.
    if (!it.tip || it.late) it.timer = setTimeout(() => retire(it, false), (it.late ? 2000 : 0) + 3200 + Math.min(2000, it.text.length * 30));
  }
  // The playing toast after a change: stays if its band is still free, moves if another band fits.
  function refit() {
    const it = T.cur, box = $('toasts');
    const lane = box && skyBands();
    if (!lane || lane.width !== it.w) return false;
    const y = parseFloat(box.style.top) || 0;
    if (lane.free.some(([a, b]) => a <= y && y + it.h <= b)) return true;
    const top = bandTop(lane, it.h);
    if (top == null) return false;
    box.style.top = top + 'px';
    return true;
  }
  function requeue() {
    const it = T.cur;
    if (!it) return;
    clearTimeout(it.timer);
    if (it.el) it.el.remove();
    T.cur = null;
    T.q.unshift(it);
  }
  function retire(it, now) {
    clearTimeout(it.timer);
    T.q = T.q.filter((t) => t !== it);
    if (T.cur !== it) return;
    T.cur = null;
    const el = it.el;
    it.el = null;
    if (el) { if (now) el.remove(); else { el.classList.add('is-out'); setTimeout(() => el.remove(), 260); } }
    // the next toast follows once this one has gone
    clearTimeout(T.gap);
    T.gap = setTimeout(() => { T.gap = 0; kick(); }, now ? 0 : 300);
  }
  // While a toast plays or waits at the play screen, anything new in the sky (an info card, the
  // Sponsor strip, a label) or a change of the sky's size (the layout easing between a show and the
  // build) re-checks its band. Nothing is watched while toasts are held (a show, an overlay).
  function watchSky(on) {
    if (on === T.watching) return;
    T.watching = on;
    if (!on) { if (T.mo) T.mo.disconnect(); if (T.ro) T.ro.disconnect(); return; }
    if (typeof MutationObserver === 'function') {
      if (!T.mo) T.mo = new MutationObserver(kick);
      const o = { attributes: true, attributeFilter: ['hidden', 'class', 'style'] };
      for (const id of ['sky-wrap', 'sponsor']) if ($(id)) T.mo.observe($(id), o);
      if ($('sky-overlay')) T.mo.observe($('sky-overlay'), { ...o, childList: true, subtree: true });
    }
    if (typeof ResizeObserver === 'function' && $('sky-wrap')) {
      if (!T.ro) T.ro = new ResizeObserver(kick);
      T.ro.observe($('sky-wrap'));
    }
  }
  // The core marks a tip seen when it sends it, so a tip that is still waiting for room when its
  // 'tipDone' arrives is not dropped: it plays later as a timed toast (any 'tipDone' also ends it).
  const tipDone = (p) => {
    const match = (x) => x.tip && (x.late || !p || !p.id || !x.id || x.id === p.id);
    for (const x of T.q) if (match(x)) x.late = true;
    if (T.cur && match(T.cur)) retire(T.cur, false);
  };

  /* ======================================================================
     TAP TO CONTINUE (after the tab was hidden; any tap or key resumes)
     ====================================================================== */
  function buildTap() {
    const root = $('tap-continue');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Paused while away');
    T.tap = h('button', { type: 'button', id: 'tap-continue-btn', 'data-autofocus': true, class: 'tc-btn' },
      h('span', { class: 'tc-moon', 'aria-hidden': 'true' }),
      h('span', { class: 'tc-title display-italic' }, 'Tap to continue'),
      h('span', { class: 'tc-sub' }, 'The crowd kept your spot on the riverbank.'));
    root.replaceChildren(T.tap);
    root.addEventListener('click', resumeFromAway);   // any tap on the overlay resumes
  }
  function resumeFromAway() {
    if (!$('tap-continue').hidden) call(G, 'close', 'tapContinue');   // core resumes audio and the loop
  }

  /* ======================================================================
     KEYS (core routes: top overlay scope → play → global)
     ====================================================================== */
  const typing = (el) => !!el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|search|url|email|number|password)$/i.test(el.type || 'text') && !el.readOnly));
  const topName = () => { const t = call(G, 'top'); return t && typeof t === 'object' ? t.name : t || null; };
  const isOpen = (id) => { const el = $(id); return !!el && !el.hidden; };
  const keyEvent = (a, b) => (a && typeof a === 'object' && 'key' in a ? a : b && typeof b === 'object' ? b : { key: a });
  function toggleOverlay(name, id) {
    const top = topName();
    if (top === name) { G.close(name); return true; }
    if (isOpen(id)) return true;           // open lower in the stack: leave it be
    G.open(name);
    return true;
  }
  function globalKey(a, b) {
    const e = keyEvent(a, b);
    disarmOnKey(e);
    if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target || document.activeElement)) return false;
    const top = topName(), k = e.key;
    if (top === 'tapContinue') return false;
    if (k === 'p' || k === 'P') {
      if (top && !['pause', 'inspect', 'showlog'].includes(top)) return false;
      return toggleOverlay('pause', 'pause-menu');
    }
    if (k === 'l' || k === 'L') return toggleOverlay('logbook', 'logbook');
    if (k === '?') { if (e.preventDefault) e.preventDefault(); return toggleOverlay('help', 'help'); }
    return false;
  }
  const scoped = (extra) => (a, b) => { const e = keyEvent(a, b); disarmOnKey(e); return extra ? extra(e) : false; };
  function tapKey(a, b) {
    const e = keyEvent(a, b);
    if (/^(Shift|Control|Alt|Meta|CapsLock|Tab)$/.test(e.key)) return false;
    if (e.preventDefault) e.preventDefault();
    resumeFromAway();
    return true;
  }

  /* ======================================================================
     WIRING
     ====================================================================== */
  const OVERLAY_EL = { pause: 'pause-menu', settings: 'settings', logbook: 'logbook', help: 'help' };
  function stackAbove(el) {
    let z = 50;
    for (const o of document.querySelectorAll('#app > .overlay, #app > .sheet')) {
      if (o !== el && !o.hidden && o.id !== 'tap-continue') z = Math.max(z, (parseInt(getComputedStyle(o).zIndex, 10) || 40) + 1);
    }
    el.style.zIndex = String(z);
  }
  function onOverlay(p) {
    const name = p && p.name, open = !!(p && p.open);
    kick();
    if (open && OVERLAY_EL[name]) stackAbove($(OVERLAY_EL[name]));
    if (!open) {
      disarmAll();
      // Back on the pause menu: return focus to the tile for the sheet that just closed.
      const tile = { settings: 'pause-settings', logbook: 'pause-logbook', help: 'pause-help' }[name];
      if (tile && topName() === 'pause' && $(tile)) $(tile).focus();
      if (name === 'logbook') closeDetail(false);
      if (name === 'settings') clearSaveNotes();
      return;
    }
    if (name === 'pause') { renderPause(); settleFocus($('pause-menu'), P.resume, true); }
    else if (name === 'settings') { clearSaveNotes(); syncSettings(); settleFocus($('settings'), $('settings').querySelector('input,button')); }
    else if (name === 'logbook') {
      const o = p.opts || {};
      if (o.tab && TABS.some((t) => t[0] === o.tab)) L.tab = o.tab;
      renderLogbook();
      const key = o.key || L.pendingKey; L.pendingKey = null;
      const tile = key && L.panel.querySelector('.lb-tile[data-key="' + String(key).replace(/"/g, '') + '"]');
      if (tile) { tile.click(); settleFocus($('logbook'), tile, true); }
      else settleFocus($('logbook'), L.tabs.find((t) => t.tabIndex === 0), true);
    } else if (name === 'help') settleFocus($('help'), $('help-done'));
    else if (name === 'tapContinue') settleFocus($('tap-continue'), T.tap, true);
  }
  function init(game) {
    G = game;
    if (!G) return;
    for (const id of ['pause-menu', 'settings', 'logbook', 'help', 'toasts', 'tap-continue']) { const el = $(id); if (el && !el.closest('[lang]')) el.setAttribute('lang', 'en'); }
    buildPause(); buildSettings(); buildLogbook(); buildHelp(); buildTap();
    call(G, 'on', 'overlay', onOverlay);
    call(G, 'on', 'toast', (p) => {
      if (!p) return;
      const text = p.text || (typeof p === 'string' ? p : '');
      toast(text, p.kind, p.id);
      if (text && !p.announced) call(G, 'announce', text);   // #toasts is aria-hidden; core does not voice toasts
    });
    call(G, 'on', 'tipDone', tipDone);
    call(G, 'on', 'resize', () => { requeue(); kick(); if (isOpen('logbook')) tabEdges(); });
    call(G, 'on', 'ui', kick);
    // Rehearsal Night starts: the toast on screen (or fading out) leaves at once; the queue waits for the run's return.
    call(G, 'on', 'tutorial', (p) => { if (p && p.active) { requeue(); const box = $('toasts'); if (box) box.replaceChildren(); } kick(); });
    const settled = (e) => { if ((T.cur || T.q.length) && e.target && e.target.closest && e.target.closest('#sky-wrap, #sponsor, #hud')) kick(); };
    if ($('play')) for (const ev of ['transitionend', 'animationend']) $('play').addEventListener(ev, settled, { passive: true });
    call(G, 'on', 'change', kick);
    call(G, 'on', 'settings', (p) => {
      if (p && p.key === 'highContrast') pictoCache.clear();
      if (isOpen('settings')) syncSettings();
      if (isOpen('logbook') && p && p.key === 'highContrast') renderLogbook();
    });
    call(G, 'on', 'meta', () => { if (isOpen('logbook') && !L.open) renderLogbook(); });
    call(G, 'on', 'change', () => { if (isOpen('pause-menu')) renderPause(true); });
    const noteBuild = () => { if (G.ui === 'BUILD' && G.state) P.lastBuild = Number(G.state.show) || 0; };
    noteBuild();
    call(G, 'on', 'ui', (p) => { if (p && p.to === 'BUILD') noteBuild(); if (isOpen('pause-menu')) renderPause(true); });
    call(G, 'on', 'runStart', () => { P.lastBuild = null; noteBuild(); T.q = []; if (T.cur) retire(T.cur, true); }); // a new run never inherits the last run's waiting tips
    call(G, 'on', 'overlay', syncTutorialButtons); call(G, 'on', 'ui', syncTutorialButtons);
    call(G, 'onKey', 'global', globalKey);
    call(G, 'onKey', 'pause', scoped());
    call(G, 'onKey', 'settings', scoped());
    call(G, 'onKey', 'help', scoped());
    call(G, 'onKey', 'logbook', scoped(logbookKey));
    call(G, 'onKey', 'tapContinue', tapKey);
    document.addEventListener('pointerdown', (e) => {
      if (!armed.size) return;
      const btn = e.target && e.target.closest && e.target.closest('[data-armed]');
      disarmAll(btn && armed.has(btn) ? btn : null);
    }, true);
  }

  return { init, toast, openLogbook, renderLogbook: () => { if (L.panel) renderLogbook(); }, syncSettings };
})();
