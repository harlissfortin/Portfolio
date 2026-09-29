/* ============================================================
   core.js: GAME (see CONTRACT.md). It owns:
   - the SIM state and the undo stack;
   - the show flow BUILD → RESOLVING → RESULT → BUILD | END;
   - the fixed-timestep rAF loop and the loop-tick timers;
   - persistence (key oohxaah.v1), settings and meta (milestones,
     unlocks, Logbook, records, Renown, kits, keepsake, posters);
   - the overlay stack with focus trap, keyboard routing, lifecycle,
     aria-live messages, haptics and the §11.6 hooks (window.__game).
   Every call into OOH / FX / AUDIO / UI_* is guarded.
   GAME.state is always the live SIM state. After light() it is
   already post-show; 'change' is held back until the slam, and the
   rack as lit is in GAME.lastLit (and each lastRun history entry).
============================================================ */
const GAME = (() => {
  'use strict';

  /* ---------- constants ---------- */
  const STORE_KEY = 'oohxaah.v1';
  const DT = 1 / 60, MAX_FRAME = 0.25, MAX_STEPS = 8, FX_MAX_DT = 0.1;
  const ticks = sec => Math.round(sec * 60);
  const BUFFER_TICKS = ticks(0.12), EVQ_MAX = 1000;
  const OVERLAY_ID = {pause: 'pause-menu', settings: 'settings', logbook: 'logbook', help: 'help',
    inspect: 'inspect', end: 'end', showlog: 'showlog', tapContinue: 'tap-continue'};
  const PAUSING = ['pause', 'tapContinue'];
  const SHEETS = ['inspect', 'showlog'];
  const FEST = ['Spring Lanterns', 'May Fair', 'Midsummer', 'Regatta', 'Harvest Moon', 'Bonfire Night', 'Winter Lights', "New Year's Eve"];
  const SLOT = ['Twilight', 'Evening', 'Headliner'];
  const COL = {R: ['Red', 'circle'], A: ['Gold', 'triangle'], G: ['Green', 'square'], B: ['Blue', 'diamond'], W: ['White', 'cross'], X: ['Rainbow', 'star']};
  const MOOD = {restless: 'Restless', hopeful: 'Hopeful', eager: 'Eager'};
  // Fallbacks when DATA.MILESTONES / KITS lack a field: [name, goal].
  const MS = {m_fusion: ['First Fusion', 1], m_busy: ['Busy Sky', 8], m_mono: ['Monochrome Night', 5],
    m_spectrum: ['Full Spectrum', 3], m_crowd: ['Packed House', 40], m_triple: ['Triple-break', 3],
    m_headliner: ['Headliner Hunter', 1], m_rigger: ['Rigger', 3], m_win: ['Happy New Year', 1], m_logbook: ['Logbook Half', 6]};
  const KIT_LOCK = {apprentice: null, salvo: 'm_busy', chemist: 'm_spectrum', market: 'm_rigger', showman: 'm_crowd'};
  const HAPTIC = {bought: 8, upgraded: 8, moved: 8, rigInstalled: 8, tubeAdded: 8, sold: 8, matched: 8,
    multAah: 15, fusion: [20, 30, 20], clear: 12, rainCheck: 40, relight: 20};
  const DROP_TYPES = ['buy', 'upgrade', 'move', 'sell', 'buyRig', 'buyTube', 'reroll', 'sponsor', 'match', 'restore', 'setColour'];

  /* ---------- module state ---------- */
  const S = {
    booted: false, flags: {}, settings: null, meta: null, runOpts: null, bootOpts: null,
    state: null, ui: 'BOOT', undo: [], lastRun: null, reducedMotion: false,
    rehearse: false, stack: [], listeners: {}, keys: {}, paused: new Set(),
    loopOn: false, raf: 0, last: 0, acc: 0, tick: 0, timers: [], gameSpeed: 1,
    res: null, evQueue: [], skipAnim: false, simMs: 0, frameMs: 16.7, dbgTick: 0,
    // per run (saved with the run)
    lit: [], lastPreLight: null, runBest: {}, startProgress: {}, runUnlocks: [], counted: false,
    buildMs: 0, missPending: false, recordAtStart: 0, recordHit: false, posterAdded: false,
    lastChance: false, pendingToasts: [], tipQueue: [], tipShown: null,
    layout: 'regular', gestured: false, unlocked: false, audioHeld: false, kickQueued: false, resizeQueued: false, ann: {polite: [], assertive: [], queued: false}, cache: {},
  };

  /* ---------- tiny utilities ---------- */
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const isStr = v => typeof v === 'string' && v.length > 0;
  const isBool = v => typeof v === 'boolean';
  const isNum = v => typeof v === 'number' && isFinite(v);
  const isInt = v => Number.isInteger(v) && v >= 0;
  const clampInt = (v, lo, hi, d) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const byId = id => document.getElementById(id);
  const cap = s => String(s || '').replace(/^./, c => c.toUpperCase());
  const warn = (where, e) => { if (S.flags.debug || S.flags.test) console.warn('[core] ' + where, e); };
  const safe = (fn, d) => { try { const v = fn(); return v === undefined ? d : v; } catch (e) { warn('safe', e); return d; } };
  const sim = () => (typeof OOH !== 'undefined' && OOH) || null;
  const fx = () => (typeof FX !== 'undefined' && FX) || null;
  const snd = () => (typeof AUDIO !== 'undefined' && AUDIO) || null;
  const can = (o, k) => !!o && typeof o[k] === 'function';
  const call = (o, k, ...a) => { if (!can(o, k)) return undefined; try { return o[k](...a); } catch (e) { warn(k, e); return undefined; } };
  const callFX = (k, ...a) => call(fx(), k, ...a);
  const callAudio = (k, ...a) => call(snd(), k, ...a);
  const data = () => (sim() && sim().DATA) || {};
  const cloneJSON = v => (v == null ? v : JSON.parse(JSON.stringify(v)));
  const simClone = st => (can(sim(), 'clone') ? sim().clone(st) : cloneJSON(st));
  const hist = st => (st && st.runStats && Array.isArray(st.runStats.history) ? st.runStats.history : []);
  const cur = () => S.state;
  const playUI = () => typeof UI_PLAY !== 'undefined' && !!UI_PLAY;   // UI_PLAY shows the §4.13 tips itself
  const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const randomSeed = () => Math.random().toString(36).slice(2, 7);
  const fmt = n => { const r = safe(() => sim().fmt(n)); return r != null ? String(r) : Math.floor(Number(n) || 0).toLocaleString('en-US'); };
  const fmtAah = a => { const r = safe(() => sim().fmtAah(a)); return r != null ? String(r) : a < 100 ? (Math.floor(a * 10) / 10).toFixed(1) : fmt(a); };

  /* ---------- DATA lookups (tables may be arrays or id-keyed objects) ---------- */
  function rows(name) {
    if (S.cache[name]) return S.cache[name];
    const t = data()[name];
    const out = Array.isArray(t) ? t.filter(Boolean) : isObj(t) ? Object.keys(t).map(k => (isObj(t[k]) ? {id: k, ...t[k]} : {id: k, value: t[k]})) : [];
    if (t) S.cache[name] = out;
    return out;
  }
  const row = (name, id) => rows(name).find(r => r.id === id || r.key === id) || null;
  const lockOf = r => { const l = r && (r.lock != null ? r.lock : r.unlock); return l && l !== 'start' ? l : null; };
  const shellName = id => (row('SHELLS', id) || {}).name || cap(id);
  const colName = c => (COL[c] || [c || ''])[0];
  const ruleName = id => (id === 'countdown' || id === 'countdown3' ? 'Midnight Countdown' : (row('RULE_INFO', id) || row('HEADLINERS', id) || {}).name || cap(id));
  const kitName = id => (row('KITS', id) || {}).name || cap(id);
  function festName(f) {
    const r = rows('FESTIVALS')[f - 1];
    return (r && (typeof r === 'string' ? r : r.name || r.value)) || FEST[f - 1] || 'Afterparty';
  }
  function fusionList() {
    if (S.cache.fus) return S.cache.fus;
    const out = rows('FUSIONS').map(r => {
      const key = String(r.key || (r.a || r.from) && (r.a || r.from) + '>' + (r.b || r.to) || r.id || '');
      const [a, b] = key.split('>');
      return {key, a, b, name: r.name, lock: lockOf(r)};
    }).filter(f => f.a && f.b);
    if (out.length) S.cache.fus = out;
    return out;
  }
  function fusionKey(ev) {
    if (!ev) return null;
    if (isStr(ev.key) && ev.key.includes('>')) return ev.key;
    if (isStr(ev.id) && ev.id.includes('>')) return ev.id;
    const a = ev.a || ev.from || (ev.prev && ev.prev.id), b = ev.b || ev.to || (ev.shell && ev.shell.id) || (typeof ev.shell === 'string' && ev.shell);
    if (a && b && typeof a === 'string' && typeof b === 'string') return a + '>' + b;
    const f = fusionList().find(x => x.name === ev.name);
    return f ? f.key : (ev.name ? 'name:' + ev.name : null);
  }
  function milestones() {
    if (S.cache.ms) return S.cache.ms;
    const src = rows('MILESTONES');
    const ids = src.length ? src.map(r => r.id) : Object.keys(MS);
    const out = ids.map(id => {
      const r = src.find(x => x.id === id) || {}, fb = MS[id] || [cap(id), 1];
      return {id, name: r.name || fb[0], goal: isNum(r.goal) ? r.goal : isNum(r.target) ? r.target : fb[1]};
    });
    return (S.cache.ms = out);
  }

  /* ---------- event bus ---------- */
  function on(name, fn) {
    if (typeof fn !== 'function') return () => {};
    (S.listeners[name] || (S.listeners[name] = [])).push(fn);
    return () => { const l = S.listeners[name], i = l ? l.indexOf(fn) : -1; if (i >= 0) l.splice(i, 1); };
  }
  function emit(name, payload) {
    const l = S.listeners[name];
    if (l) for (const fn of l.slice()) { try { fn(payload); } catch (e) { warn('listener ' + name, e); } }
    const w = S.listeners['*'];
    if (w) for (const fn of w.slice()) { try { fn(name, payload); } catch (e) { warn('listener *', e); } }
  }
  function onKey(scope, fn) {
    if (typeof fn !== 'function') return () => {};
    (S.keys[scope] || (S.keys[scope] = [])).push(fn);
    return () => { const l = S.keys[scope], i = l ? l.indexOf(fn) : -1; if (i >= 0) l.splice(i, 1); };
  }

  /* ---------- settings (§8.3, persisted §7.5) ---------- */
  const mq = q => typeof matchMedia === 'function' && matchMedia(q).matches;
  const hasVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  const defaultSettings = () => ({sound: true, soundVol: 0.8, music: true, musicVol: 0.35, reducedMotion: 'auto',
    highContrast: false, speed: 1, instant: false, haptics: hasVibrate() && mq('(pointer: coarse)'),
    chips: 'full', mood: true, fairWeather: false});
  const isVol = v => isNum(v) && v >= 0 && v <= 1;
  const SETTING_OK = {sound: isBool, music: isBool, highContrast: isBool, instant: isBool, haptics: isBool,
    fairWeather: isBool, mood: isBool, soundVol: isVol, musicVol: isVol,
    reducedMotion: v => ['auto', 'on', 'off'].includes(v), speed: v => [0.5, 0.75, 1].includes(v),
    chips: v => ['full', 'partners'].includes(v)};
  function cleanSettings(raw) {
    const s = defaultSettings();
    if (!isObj(raw)) return s;
    if (isVol(raw.sfxVol)) s.soundVol = raw.sfxVol;
    for (const k in SETTING_OK) if (SETTING_OK[k](raw[k])) s[k] = raw[k];
    return s;
  }
  function applySettings() {
    const s = S.settings, root = document.documentElement;
    S.reducedMotion = s.reducedMotion === 'on' || (s.reducedMotion === 'auto' && mq('(prefers-reduced-motion: reduce)'));
    if (S.reducedMotion) root.setAttribute('data-motion', 'reduced'); else root.removeAttribute('data-motion');
    if (s.highContrast) root.setAttribute('data-contrast', 'high'); else root.removeAttribute('data-contrast');
    callFX('setOptions', {reducedMotion: S.reducedMotion, highContrast: s.highContrast, speed: s.speed});
    callAudio('setSettings', {sound: s.sound, soundVol: s.soundVol, music: s.music, musicVol: s.musicVol});
  }
  function setSetting(key, value) {
    if (!SETTING_OK[key]) return false;
    if (key === 'speed') value = Number(value);
    if (!SETTING_OK[key](value)) return false;
    if (S.settings[key] === value) return true;
    S.settings[key] = value;
    applySettings();
    saveNow();
    emit('settings', {key, value, settings: S.settings});
    if (key === 'fairWeather' && S.state && S.state.phase === 'build' && !!S.state.fairWeather !== value)
      toast('Fair Weather ' + (value ? 'on' : 'off') + ' from your next run.', {kind: 'info'});
    if (key === 'mood' || key === 'chips') emit('change', {state: cur()});
    return true;
  }

  /* ---------- meta (§7.5 schema; validate-or-reset per sub-object) ---------- */
  const defaultMeta = () => ({runs: 0, wins: 0, unlocked: [], progress: {}, renown: {max: 0, selected: 0},
    kit: 'apprentice', keepsake: null, seenTips: [],
    codex: {shells: {}, fusions: {}, headliners: {}, rigs: {}},
    records: {bestShow: null, bestRun: null, fastestWinMs: null, bestAfterparty: 0, winsByKit: {}, highestRenown: null},
    posters: []});
  const objOf = (raw, test) => { const o = {}; if (isObj(raw)) for (const k in raw) if (test(raw[k])) o[k] = raw[k]; return o; };
  function cleanMeta(raw) {
    const m = defaultMeta();
    if (!isObj(raw)) return m;
    if (isInt(raw.runs)) m.runs = raw.runs;
    if (isInt(raw.wins)) m.wins = Math.min(raw.wins, m.runs);
    if (Array.isArray(raw.unlocked)) m.unlocked = [...new Set(raw.unlocked.filter(isStr))];
    m.progress = objOf(raw.progress, v => isNum(v) && v >= 0);
    if (isObj(raw.renown) && isInt(raw.renown.max)) {
      const max = Math.min(8, raw.renown.max);
      m.renown = {max, selected: isInt(raw.renown.selected) ? Math.min(max, raw.renown.selected) : 0};
    }
    if (isStr(raw.kit)) m.kit = raw.kit;
    if (isObj(raw.keepsake) && isStr(raw.keepsake.id)) m.keepsake = {id: raw.keepsake.id, col: isStr(raw.keepsake.col) ? raw.keepsake.col : null};
    if (Array.isArray(raw.seenTips)) m.seenTips = raw.seenTips.filter(isStr);
    const c = isObj(raw.codex) ? raw.codex : {};
    m.codex = {shells: objOf(c.shells, isObj), fusions: objOf(c.fusions, isObj),
      headliners: objOf(c.headliners, isInt), rigs: objOf(c.rigs, isInt)};
    const r = isObj(raw.records) ? raw.records : {};
    if (isObj(r.bestShow) && isNum(r.bestShow.score)) m.records.bestShow = r.bestShow;
    if (isObj(r.bestRun) && isNum(r.bestRun.shows)) m.records.bestRun = r.bestRun;
    if (isNum(r.fastestWinMs)) m.records.fastestWinMs = r.fastestWinMs;
    if (isInt(r.bestAfterparty)) m.records.bestAfterparty = r.bestAfterparty;
    m.records.winsByKit = objOf(r.winsByKit, isInt);
    if (isInt(r.highestRenown)) m.records.highestRenown = r.highestRenown;
    if (Array.isArray(raw.posters)) m.posters = raw.posters.filter(isObj).slice(-5);
    return m;
  }
  function setMeta(patch) {
    if (!isObj(patch)) return false;
    S.meta = cleanMeta({...S.meta, ...cloneJSON(patch)});
    saveNow();
    emit('meta', {meta: S.meta});
    return true;
  }
  const unlockAll = () => S.flags.unlock === 'all';
  const isDone = id => S.meta.unlocked.includes(id);
  const unlockedList = () => (unlockAll() ? milestones().map(m => m.id) : S.meta.unlocked.slice());
  function kitUnlocked(id) {
    const r = row('KITS', id);
    if (!r && rows('KITS').length) return false;
    const lock = r && (r.lock !== undefined || r.unlock !== undefined) ? lockOf(r) : KIT_LOCK[id];
    return !lock || unlockAll() || isDone(lock);
  }
  const renownMax = () => (unlockAll() ? 8 : S.meta.renown.max);
  const canAfterparty = () => !!S.state && S.state.phase === 'won' && !S.state.endless;
  const canDaily = () => unlockAll() || isDone('m_win') || S.meta.wins > 0;
  const discovered = (kind, id) => { const t = S.meta.codex[kind === 'fusion' ? 'fusions' : kind + 's']; const e = t && t[id]; return kind === 'fusion' ? !!(e && e.found) : e != null; };

  /* ---------- persistence (every access in try/catch; ?fresh=1 ignores storage) ---------- */
  function readStore() {
    if (S.flags.fresh) return null;
    try { const raw = localStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function runForSave() {
    const st = S.state;
    if (!st || st.phase !== 'build' || S.ui === 'END') return null;
    return {state: st, uiSeed: st.seed, buildMs: Math.round(S.buildMs), counted: S.counted, lit: S.lit,
      best: S.runBest, startProgress: S.startProgress, unlocks: S.runUnlocks, missPending: S.missPending,
      recordAtStart: S.recordAtStart, recordHit: S.recordHit, posterAdded: S.posterAdded};
  }
  const snapshot = () => ({v: 1, settings: {...S.settings, sfxVol: S.settings.soundVol}, meta: S.meta, run: runForSave()});
  function saveNow() {
    if (!S.booted || S.flags.fresh) return false;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(snapshot())); return true; } catch (e) { return false; }
  }
  function validRun(r) {
    if (!isObj(r) || !isObj(r.state)) return false;
    const st = r.state;
    if (st.v !== 1 || st.phase !== 'build' || !Array.isArray(st.tubes) || !Array.isArray(st.rng) || st.rng.length !== 4) return false;
    const la = safe(() => sim().legalActions(st), null);
    return Array.isArray(la) && la.length > 0;
  }
  function exportSave() {
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(snapshot())))); } catch (e) { return ''; }
  }
  function importSave(str) {
    let obj;
    try { obj = JSON.parse(decodeURIComponent(escape(atob(String(str || '').trim())))); } catch (e) { return false; }
    if (!isObj(obj) || obj.v !== 1) return false;
    S.settings = cleanSettings(obj.settings);
    S.meta = cleanMeta(obj.meta);
    applySettings();
    emit('settings', {key: null, value: null, settings: S.settings});
    emit('meta', {meta: S.meta});
    if (validRun(obj.run)) { abortResolve(); closeAll(); restoreRun(obj.run); beginRun(true); }
    saveNow();
    toast('Save imported.', {kind: 'info'});
    return true;
  }
  function resetProgress() {
    S.meta = defaultMeta();
    S.lastRun = null;
    emit('meta', {meta: S.meta});
    newRun({});
    toast('Progress reset. A fresh season begins.', {kind: 'info'});
    return true;
  }

  /* ---------- rules, targets, mood ---------- */
  const rulesAt = (st, s) => (st ? safe(() => sim().rulesFor(st, s), []) || [] : []);
  const targetAt = (st, s) => { const v = st ? safe(() => sim().target(st, s), null) : null; return isNum(v) ? v : 0; };
  const nextHeadliner = s => s - (s % 3) + 2;
  const moodVisible = () => { const st = cur(); return !!S.settings.mood && !!st && !(st.firstRun && st.show < 2); };
  const moodOf = (st, rules, show) => safe(() => sim().mood(st, rules, show), null);
  const moodWord = (st, rules, show) => { const m = moodOf(st, rules, show); return MOOD[m] || cap(m || ''); };
  function isCritical() {
    const st = S.state;
    if (!st || st.phase !== 'build') return false;
    const rs = st.runStats;
    return rs && isNum(rs.rainUsed) ? rs.rainUsed > 0 : hist(st).some(e => e && e.pass === false);
  }
  const previewShow = () => { const st = cur(); return !st ? 0 : S.rehearse ? nextHeadliner(st.show) : st.show; };
  // GAME.preview {rules, rehearse}: the rule set the chips use. A plain data object: UI_PLAY writes both
  // fields from its own Rehearse toggle; core resets it at every build open (tonight's rules).
  const preview = {rules: [], rehearse: false};
  // Event 'preview' (payload GAME.preview) fires whenever its rules or rehearse flag change; at a build open it
  // fires right after 'ui', so 'ui' / 'change' listeners already read the new build's preview (no settling).
  function refreshPreview(quiet) {
    const st = cur();
    if (!st) return false;
    const rules = rulesAt(st, previewShow()), rehearse = S.rehearse || st.show % 3 === 2;
    const changed = rehearse !== preview.rehearse || String(rules) !== String(preview.rules);
    preview.rules = rules;
    preview.rehearse = rehearse;
    if (changed && !quiet) emit('preview', preview);
    return changed;
  }
  function setRehearse(v) {
    v = !!v;
    if (S.rehearse === v) return;
    S.rehearse = v;
    refreshPreview();
    emit('change', {state: cur()});
    const st = cur();
    if (v && st) announce('Rehearsing ' + (preview.rules.map(ruleName).join(' and ') || 'the next show') + (moodVisible() ? ': ' + moodWord(st, preview.rules, previewShow()) + '.' : '.'));
    else announce('Rehearse off.');
  }

  /* ---------- UI state ---------- */
  function audioPhase() {
    if (S.stack.some(e => PAUSING.includes(e.name))) return 'paused';
    return S.ui === 'RESOLVING' ? 'resolve' : S.ui === 'BOOT' ? 'off' : 'build';
  }
  // A switch into a build (BUILD / RESULT) refreshes GAME.preview first, then emits 'ui' and, if it changed, 'preview'.
  function setUI(to) {
    const from = S.ui;
    if (from === to) return;
    const pv = (to === 'BUILD' || to === 'RESULT') && from !== 'BUILD' && from !== 'RESULT' && refreshPreview(true);
    S.ui = to;
    const app = byId('app');
    if (app) app.setAttribute('data-ui', to);
    callAudio('setPhase', audioPhase());
    emit('ui', {from, to});
    if (pv) emit('preview', preview);
  }

  /* ============================================================
     RUN LIFECYCLE
  ============================================================ */
  function resetRunFields() {
    S.undo = []; S.rehearse = false; S.lit = []; S.lastPreLight = null; S.runBest = {};
    S.startProgress = {...S.meta.progress}; S.runUnlocks = []; S.counted = false; S.buildMs = 0; S.missPending = false;
    S.recordAtStart = (S.meta.records.bestShow && S.meta.records.bestShow.score) || 0; S.recordHit = false;
    S.posterAdded = false; S.lastChance = false; S.pendingToasts = []; S.tipQueue = []; S.tipShown = null;
  }
  function restoreRun(saved) {
    resetRunFields();
    S.state = saved.state;
    const st = saved.state;
    S.runOpts = {kit: st.kit, renown: st.renown | 0, fairWeather: !!st.fairWeather, firstRun: !!st.firstRun, daily: !!st.daily,
      unlocked: Array.isArray(st.unlocked) ? st.unlocked.slice() : [], discovered: Array.isArray(st.discovered) ? st.discovered.slice() : [], keepsake: null};
    S.buildMs = isNum(saved.buildMs) ? saved.buildMs : 0;
    S.counted = !!saved.counted;
    if (Array.isArray(saved.lit)) S.lit = saved.lit;
    if (isObj(saved.best)) S.runBest = saved.best;
    if (isObj(saved.startProgress)) S.startProgress = saved.startProgress;
    if (Array.isArray(saved.unlocks)) S.runUnlocks = saved.unlocks;
    S.missPending = !!saved.missPending;
    if (isNum(saved.recordAtStart)) S.recordAtStart = saved.recordAtStart;
    S.recordHit = !!saved.recordHit; S.posterAdded = !!saved.posterAdded;
  }
  // Build a new SIM state from options (no events). Returns the state or null.
  function createRun(o) {
    const O = sim();
    if (!can(O, 'createState')) return null;
    const m = S.meta, force = !!o.force;
    const daily = !!o.daily && (force || canDaily());
    const last = S.lastRun || {};
    const explicit = o.seed != null || o.replay || daily || o.kit || o.renown != null;
    const firstRun = o.firstRun != null ? !!o.firstRun : m.runs === 0 && !explicit;
    let seed = o.seed != null ? String(o.seed)
      : o.replay ? String(last.seed || (S.state && S.state.seed) || randomSeed())
      : daily ? String(safe(() => O.dailySeed(ymd(new Date())), null) || 'daily-' + ymd(new Date()))
      : firstRun ? 'first-show' : randomSeed();
    let kit = firstRun || daily ? 'apprentice' : o.replay && last.kit ? last.kit : (o.kit || S.flags.kit || m.kit || 'apprentice');
    if (!force && !kitUnlocked(kit)) kit = 'apprentice';
    let renown = firstRun || daily ? 0 : clampInt(o.renown != null ? o.renown : o.replay && last.renown != null ? last.renown
      : S.flags.renown != null ? S.flags.renown : m.renown.selected, 0, 8, 0);
    if (!force && renown > renownMax()) renown = renownMax();
    let keepsake = firstRun || daily ? null : o.keepsake !== undefined ? o.keepsake : m.keepsake;
    if (!isObj(keepsake) || !isStr(keepsake.id)) keepsake = null;
    const opts = {kit, renown, fairWeather: o.fairWeather != null ? !!o.fairWeather : !!S.settings.fairWeather,
      firstRun, daily, unlocked: Array.isArray(o.unlocked) ? o.unlocked.slice() : unlockedList(),
      discovered: Array.isArray(o.discovered) ? o.discovered.slice() : foundFusionKeys(),
      keepsake: keepsake ? {id: keepsake.id, col: keepsake.col || null} : null};
    let st = null;
    try { st = O.createState(seed, opts); } catch (e) { warn('createState', e); return null; }
    if (!st) return null;
    S.runOpts = cloneJSON(opts);
    if (!force) {
      if (keepsake || o.keepsake === null) m.keepsake = null;         // consumed by this createState (§7.3)
      if (!firstRun && !daily && !o.replay && o.kit && kitUnlocked(kit)) m.kit = kit;
      if (!firstRun && !daily && o.renown != null && renown <= renownMax()) m.renown.selected = renown;
    }
    return st;
  }
  // Emit the run start and open its first build (the page is complete at rest).
  function beginRun(restored) {
    setUI('BUILD');
    callFX('critical', isCritical());
    if (S.state) callFX('setSeed', S.state.seed);
    callAudio('onEvent', {type: 'runStart'});
    const bo = S.state ? safe(() => sim().describeBuild(S.state), null) : null;
    if (bo) callAudio('onEvent', bo);
    callAudio('setCrowd', S.state ? S.state.crowd : 0);
    emit('runStart', {state: S.state, restored: !!restored});
    emit('change', {state: S.state});
    kick();
    codexScan(S.state);
    onBuildOpen();
    if (!restored) saveNow();
  }
  function newRun(o = {}) {
    if (!isObj(o)) o = {};
    const resolving = !!S.res;
    abortResolve();
    if (resolving) callFX('clearSky', {all: true});         // no popups / banners from the aborted show
    closeAll();
    const st = createRun(o);
    if (!st) { warn('newRun', 'no state'); return null; }
    resetRunFields();
    S.state = st;
    beginRun(false);
    return st;
  }
  const startDaily = () => newRun({daily: true});
  function setKeepsake(shell) {
    S.meta.keepsake = isObj(shell) && isStr(shell.id) ? {id: shell.id, col: shell.col || null} : null;
    saveNow();
    emit('meta', {meta: S.meta});
  }
  function abandon() {
    if (!S.state || S.ui === 'END' || S.ui === 'BOOT') return false;
    if (S.res) { completeNow(); callFX('clearSky', {all: true}); }
    if (S.ui === 'END' || S.state.phase !== 'build') return false;
    finalizeRun({abandoned: true});
    closeAll();
    goEnd();
    return true;
  }
  function enterAfterparty() {
    const O = sim();
    if (!canAfterparty() || !can(O, 'step')) return false;
    const events = safe(() => O.step(S.state, {type: 'endless'}), []) || [];
    if (events.some(e => e && e.type === 'illegal') || S.state.phase !== 'build') return false;
    queueEvents(events);
    S.undo = []; S.missPending = false;
    closeAll();
    setUI('BUILD');
    emit('sim', {action: {type: 'endless'}, events});
    emit('change', {state: S.state});
    for (const ev of events) callAudio('onEvent', ev);
    codexScan(S.state);
    onBuildOpen();
    saveNow();
    return true;
  }

  /* ---------- the build phase ---------- */
  function onBuildOpen() {
    const st = S.state;
    if (!st || st.phase !== 'build') return;
    const crit = isCritical();
    const bo = safe(() => sim().describeBuild(st), null);
    S.lastChance = bo && bo.lastChance != null ? !!bo.lastChance : crit && (S.missPending || st.show % 3 === 2);
    S.missPending = false;
    callFX('critical', crit);
    callAudio('onEvent', {type: 'critical', on: crit, lastChance: S.lastChance});
    emit('critical', {on: crit, lastChance: S.lastChance});
    refreshPreview();
    announce(buildOpenText(st));
    buildTips(st);
    showNextTip();
  }
  function buildOpenText(st) {
    const s = st.show, f = Math.floor(s / 3) + 1, k = s % 3, rules = rulesAt(st, s);
    let t = (st.endless ? 'Afterparty, show ' + (s + 1) : 'Show ' + (s + 1) + ' of 24') + ', ' + festName(f) + ' ' +
      (s === 23 ? 'Midnight Countdown' : SLOT[k] + (rules.length ? ': ' + rules.map(ruleName).join(' and ') : '')) + '.';
    const T = targetAt(st, s);
    t += ' Target ' + fmt(T) + '.';
    if (moodVisible()) t += ' Crowd mood: ' + moodWord(st) + '.';
    const sp = st.sponsor;
    if (sp) {
      const raised = sp.accepted ? T : Math.round(T * 1.5);
      const pay = sp.kind === 'coin' ? 'pays 2 coins' : sp.kind === 'crowd' ? 'pays Crowd plus 4' : 'adds a rare card to the next shop';
      t += ' Sponsor ' + (sp.accepted ? 'accepted' : 'offered') + ': target ' + fmt(raised) + ', ' + pay + '.';
    }
    const nh = nextHeadliner(s);
    if (nh !== s && nh < (st.endless ? 36 : 24)) t += ' Next Headliner: ' + (rulesAt(st, nh).map(ruleName).join(' and ') || 'none') + '.';
    if (S.lastChance) t += ' Last chance.';
    return t;
  }
  function dismissResult() { if (S.ui === 'RESULT') setUI('BUILD'); }

  /* ---------- dispatch + undo (§2.5) ---------- */
  // __game.events() queue. Only test tools drain it, so in play it is a ring of the last EVQ_MAX events
  // (~25 per show: a whole 24-show run fits) instead of growing for 200 shows.
  function queueEvents(events) {
    for (const ev of events) S.evQueue.push(ev);
    if (S.evQueue.length > EVQ_MAX + 200) S.evQueue.splice(0, S.evQueue.length - EVQ_MAX);
  }
  function illegal(action, reason) {
    const ev = {type: 'illegal', reason};
    emit('illegal', {action, reason});
    callAudio('onEvent', ev);
    return [ev];
  }
  function dispatch(action) {
    const O = sim();
    if (!O || !S.state || !isObj(action)) return [];
    if (action.type === 'light') return light();
    if (action.type === 'endless') return enterAfterparty() ? S.evQueue.slice(-8) : illegal(action, 'not available');
    if (S.ui === 'RESOLVING' && bufferAction(action)) return [];
    if (!(S.ui === 'BUILD' || S.ui === 'RESULT') || S.state.phase !== 'build') return illegal(action, 'busy');
    const pre = simClone(S.state);
    const t0 = now();
    let events;
    try { events = O.step(S.state, action) || []; } catch (e) { warn('step', e); S.state = pre; return illegal(action, 'error'); }
    S.simMs = now() - t0;
    const bad = events.find(e => e && e.type === 'illegal');
    if (bad) { emit('illegal', {action, reason: bad.reason}); callAudio('onEvent', bad); return events; }
    if (action.type === 'reroll') S.undo = [];
    else { S.undo.push(pre); if (S.undo.length > 60) S.undo.shift(); }
    dismissResult();
    dismissTip();
    queueEvents(events);
    for (const ev of events) {
      if (!(ev.type === 'moodChanged' && !moodVisible())) callAudio('onEvent', ev);
      hapticFor(ev);
    }
    codexOnBuild(action, pre, events);
    emit('sim', {action, events});
    emit('change', {state: S.state});
    kick();
    callAudio('setCrowd', S.state.crowd);
    announce(actionText(action, pre, S.state));
    actionTips(action, S.state);
    showNextTip();
    return events;
  }
  // §11.5 input buffer: a build action during RESOLVING (the run goes on) is held for 120 ms; if RESULT begins
  // within that window it is applied then, in order, else it lapses as illegal 'busy'. Returns true if held.
  function bufferAction(action) {
    const r = S.res;
    if (!r || !S.loopOn || !S.state || S.state.phase !== 'build' || !DROP_TYPES.includes(action.type)) return false;
    const q = r.buffer || (r.buffer = []), b = {action: cloneJSON(action), until: S.tick + BUFFER_TICKS};
    const lapse = x => { const i = q.indexOf(x); if (i < 0) return; q.splice(i, 1); illegal(x.action, 'busy'); };
    q.push(b);
    if (q.length > 4) lapse(q[0]);
    after(BUFFER_TICKS + 1, () => { if (S.res === r) lapse(b); });
    return true;
  }
  const canUndo = () => S.undo.length > 0 && (S.ui === 'BUILD' || S.ui === 'RESULT') && !!S.state && S.state.phase === 'build';
  function undo() {
    if (!canUndo()) return false;
    S.state = S.undo.pop();
    dismissResult();
    emit('sim', {action: {type: 'undo'}, events: []});
    emit('change', {state: S.state});
    callAudio('ui', 'tick');
    announce('Undone. ' + S.state.coins + ' coins.' + (moodVisible() ? ' Crowd mood: ' + moodWord(S.state) + '.' : ''));
    return true;
  }
  function slotText(slot) {
    if (!isObj(slot)) return '';
    return slot.zone === 'crate' ? 'the Crate' : 'tube ' + (slot.i + 1);
  }
  function shellAt(st, slot) {
    if (!st || !isObj(slot)) return null;
    const t = slot.zone === 'crate' ? st.crate && st.crate[slot.i] : st.tubes[slot.i] && st.tubes[slot.i].shell;
    return t || null;
  }
  const shellText = sh => (sh ? shellName(sh.id) + (sh.col && sh.col !== 'W' && sh.col !== 'X' ? ', ' + colName(sh.col) : '') : 'a shell');
  function actionText(a, pre, st) {
    const card = pre.shop && pre.shop.cards && pre.shop.cards[a.card];
    const tail = ' ' + st.coins + ' coins left.' + (moodVisible() ? ' Crowd mood: ' + moodWord(st) + '.' : '');
    switch (a.type) {
      case 'buy': return 'Bought ' + shellText(card) + ', into ' + slotText(a.to) + '.' + tail;
      case 'upgrade': { const sh = shellAt(st, a.to); return 'Upgraded ' + shellText(sh) + ' to star ' + (sh ? sh.star : 2) + ' in ' + slotText(a.to) + '.' + tail; }
      case 'move': return 'Moved ' + shellText(shellAt(pre, a.from)) + ' to ' + slotText(a.to) + (shellAt(pre, a.to) ? ', swapping with ' + shellText(shellAt(pre, a.to)) : '') + '.' + tail;
      case 'sell': return 'Sold ' + shellText(shellAt(pre, a.from)) + ' for ' + Math.max(0, st.coins - pre.coins) + ' coins.' + tail;
      case 'buyRig': { const r = pre.shop && pre.shop.rig; return 'Installed ' + ((r && (row('RIGS', r.id) || {}).name) || 'a rig') + ' on tube ' + (a.tube + 1) + '.' + tail; }
      case 'buyTube': return 'Added tube ' + st.tubes.length + '.' + tail;
      case 'reroll': return 'New cards: ' + ((st.shop && st.shop.cards) || []).map(c => shellText(c)).join('; ') + '.' + tail;
      case 'sponsor': return 'Sponsor ' + (a.accept ? 'accepted: target ' : 'declined: target ') + fmt(targetAt(st, st.show)) + '.' + (moodVisible() ? ' Crowd mood: ' + moodWord(st) + '.' : '');
      case 'match': return 'Shells re-seated to match tonight\'s fuse.' + tail;
      case 'restore': return 'Restored your last order.' + tail;
      case 'setColour': return 'Card colour set to ' + colName(a.col) + '.';
      default: return '';
    }
  }

  /* ============================================================
     THE SHOW: light() → RESOLVING → slam → RESULT | END
  ============================================================ */
  const isInstant = () => !!(S.flags.test || S.settings.instant || S.skipAnim || !S.loopOn);
  function light() {
    const O = sim(), st = S.state;
    if (!O || !st || S.res || st.phase !== 'build' || !(S.ui === 'BUILD' || S.ui === 'RESULT')) return [];
    const pre = simClone(st);
    const rules = rulesAt(pre, pre.show);
    const fav = rules.includes('rival') ? safe(() => O.favourite(pre.tubes, pre.crowd), null) : null;
    const t0 = now();
    let events;
    try { events = O.step(st, {type: 'light'}) || []; } catch (e) { warn('light', e); S.state = pre; return illegal({type: 'light'}, 'error'); }
    S.simMs = now() - t0;
    const bad = events.find(e => e && e.type === 'illegal');
    if (bad) { emit('illegal', {action: {type: 'light'}, reason: bad.reason}); return events; }
    S.undo = [];
    dismissTip();
    if (S.lastChance) callAudio('onEvent', {type: 'critical', on: true, lastChance: false});
    S.lastChance = false;
    S.lastPreLight = pre;
    S.lit.push({show: pre.show, tubes: cloneJSON(pre.tubes), rules, crowd: pre.crowd, fav, target: targetAt(pre, pre.show)});
    annotate(events);
    queueEvents(events);
    const info = afterLight(pre, rules, events);
    saveNow();
    const r = {token: {}, events, pre, info, presented: new Set(), slam: false, done: false, slamTick: 0,
      handle: null, instant: isInstant(), ff: false, dimmed: false, watchdog: null};
    S.res = r;
    emit('sim', {action: {type: 'light'}, events});
    setUI('RESOLVING');
    const F = fx(), tok = r.token;
    if (can(F, 'play')) {
      try {
        r.handle = F.play(events, {speed: S.settings.speed, instant: r.instant,
          onPresent: ev => present(tok, ev), onDone: () => chainDone(tok)}) || null;
        const done = r.handle && r.handle.done;
        if (done && typeof done.then === 'function') done.then(() => chainDone(tok), () => chainDone(tok));
      } catch (e) { warn('FX.play', e); r.handle = null; }
    }
    if (S.res === r && !r.done) {
      if (!r.handle || r.instant) completeNow();
      else {
        const secs = events.length * 0.6 / (S.settings.speed || 1) + 8;
        r.watchdog = after(ticks(secs), () => { if (S.res === r && !r.done) completeNow(); });
      }
    }
    return events;
  }
  // Fusion "first" flags (FX banner + Logbook toast) come from the Logbook, which the SIM cannot see.
  function annotate(events) {
    const seen = new Set();
    for (const ev of events) {
      if (!ev || ev.type !== 'fusion') continue;
      const key = fusionKey(ev);
      const f = key && S.meta.codex.fusions[key];
      if (ev.first == null) ev.first = !!key && !(f && f.found) && !seen.has(key);
      if (key) seen.add(key);
      if (key && ev.key == null) ev.key = key;
    }
  }
  function present(tok, ev) {
    const r = S.res;
    if (!r || r.token !== tok || !ev || r.presented.has(ev)) return;
    r.presented.add(ev);
    emit('present', ev);
    if (!(ev.type === 'moodChanged' && !moodVisible())) callAudio('onEvent', ev);
    hapticFor(ev);
    switch (ev.type) {
      case 'applause': slam(r); break;
      case 'fusion':
        if (ev.first) toast('Logbook +1 (' + foundFusions() + '/' + Math.max(12, fusionList().length) + ')', {kind: 'discover'});
        break;
      case 'rainCheck': announce('Rain check used. Last chance.', {assertive: true}); break;
      case 'relight': announce('The crowd stays for one more! You may relight the Countdown.', {assertive: true}); break;
      case 'runLost': callFX('dim'); r.dimmed = true; break;
    }
  }
  function slam(r) {
    if (r.slam) return;
    r.slam = true;
    r.slamTick = S.tick;
    emit('change', {state: S.state});
    callAudio('setCrowd', S.state.crowd);
    emit('result', {entry: r.info.entry, events: r.events, summary: r.info.summary});
    announce(resultText(r.info.summary));
    const tt = r.info.topTier;
    if (tt) {
      callFX('finale');
      callAudio('onEvent', {type: 'topTier', reason: tt});
      haptic(40);
      emit('topTier', {reason: tt});
    }
  }
  function chainDone(tok) {
    const r = S.res;
    if (!r || r.token !== tok || r.done) return;
    for (const ev of r.events) present(tok, ev);               // anything FX did not present
    slam(r);
    r.done = true;
    if (r.watchdog) S.timers = S.timers.filter(t => t !== r.watchdog);
    const imm = r.instant || !S.loopOn;
    if (S.state.phase !== 'build') {
      if (S.state.phase === 'lost' && !r.dimmed) callFX('dim');
      after(imm ? 0 : ticks(S.state.phase === 'lost' ? 0.9 : 1.6), () => { if (S.res === r) { S.res = null; goEnd(); } });
    } else {
      after(imm ? 0 : Math.max(0, ticks(0.6) - (S.tick - r.slamTick)), () => { if (S.res === r) { S.res = null; toResult(r.buffer); } });
    }
  }
  function completeNow() {
    const r = S.res;
    if (!r) return;
    r.instant = true;
    if (r.handle && !r.done) { try { if (can(r.handle, 'skip')) r.handle.skip(); } catch (e) { warn('skip', e); } }
    chainDone(r.token);
    if (S.res === r) { S.res = null; if (S.state.phase === 'build') toResult(r.buffer); else goEnd(); }
  }
  function abortResolve() {
    if (!S.res) return;
    const r = S.res;
    if (r.handle && !r.done) { try { if (can(r.handle, 'skip')) r.handle.skip(); } catch (e) { /* ignore */ } }
    S.res = null;
    S.timers = [];
  }
  function fastForward() {
    const r = S.res;
    if (!r || r.done) return false;
    r.ff = true;
    if (r.handle && can(r.handle, 'fastForward')) { try { r.handle.fastForward(); } catch (e) { warn('ff', e); } }
    return true;
  }
  function skip() {
    const r = S.res;
    if (!r || r.done) return false;
    if (r.handle && can(r.handle, 'skip')) { try { r.handle.skip(); } catch (e) { warn('skip', e); } }
    else completeNow();
    return true;
  }
  function toResult(buffered) {
    setUI('RESULT');
    emit('change', {state: S.state});
    kick();
    flushToasts();
    onBuildOpen();
    if (buffered) for (const b of buffered) if (b.until >= S.tick && (S.ui === 'RESULT' || S.ui === 'BUILD')) dispatch(b.action);
  }
  function goEnd() {
    closeAll();
    setUI('END');
    // The end screen shows milestone progress and one "Just unlocked" card each (§7.2), so milestone
    // toasts from the final show would only cover its header.
    S.pendingToasts = S.pendingToasts.filter(t => t[1] !== 'milestone');
    flushToasts();
    callAudio('onEvent', {type: 'critical', on: false});
    const lr = S.lastRun;
    emit('runEnd', {won: !!(lr && lr.won), lastRun: lr});
    announce(endText(lr), {assertive: true});
    if (top() !== 'end') open('end', {focus: '#run-it-back'});
    saveNow();
  }
  function resultText(sm) {
    if (!sm) return '';
    let t = 'Applause ' + fmt(sm.applause) + ': Ooh ' + fmt(Math.floor(sm.ooh || 0)) + ' times Aah ' + fmtAah(sm.aah || 0).replace(/\.0$/, '') + '. ';
    t += sm.pass ? 'Passed, ' + (Math.round(sm.ratio * 10) / 10) + ' times the target.' + (sm.encore ? ' Encore!' : '')
      : 'Missed by ' + fmt(Math.max(0, sm.target - sm.applause)) + '.';
    if (sm.crowd > 0) t += ' Crowd plus ' + sm.crowd + '.';
    return t;
  }
  function endText(lr) {
    if (!lr) return 'The run is over.';
    const st = lr.state || {}, s = st.show != null ? st.show : 0;
    if (lr.abandoned) return 'Run abandoned at show ' + (s + 1) + '. Run it back is ready.';
    if (lr.won && !lr.afterparty) return 'Happy New Year! You won the season. Run it back, or stay for the Afterparty.';
    if (lr.won) return 'The Afterparty is over: ' + lr.afterpartyShows + ' shows cleared.';
    return 'The crowd went home: ' + festName(Math.floor(s / 3) + 1) + ', show ' + (s + 1) + '. Run it back is ready.';
  }

  /* ---------- bookkeeping after a light: Logbook, records, milestones, run end ---------- */
  function afterLight(pre, rules, events) {
    const st = S.state, m = S.meta, c = m.codex;
    const h = hist(st), entry = h[h.length - 1] || null;
    const app = events.find(e => e && e.type === 'applause') || {};
    const pay = events.find(e => e && e.type === 'payout') || null;
    const target = isNum(app.target) ? app.target : entry && isNum(entry.target) ? entry.target : targetAt(pre, pre.show);
    const score = isNum(app.score) ? app.score : entry && isNum(entry.applause) ? entry.applause : 0;
    const pass = app.pass != null ? !!app.pass : entry && entry.pass != null ? !!entry.pass : score >= target;
    const summary = {show: pre.show, festival: Math.floor(pre.show / 3) + 1, rules, target, applause: score,
      ooh: isNum(app.ooh) ? app.ooh : entry && entry.ooh, aah: isNum(app.aah) ? app.aah : entry && entry.aah,
      pass, encore: app.encore != null ? !!app.encore : !!(entry && entry.encore), sponsored: !!(entry && entry.sponsored) || !!(pre.sponsor && pre.sponsor.accepted),
      ratio: target > 0 ? score / target : 0, coins: st.coins - pre.coins, coinsAfter: st.coins,
      crowd: st.crowd - pre.crowd, crowdAfter: st.crowd, payout: pay,
      rainUsed: events.some(e => e && e.type === 'rainCheck'), relit: events.some(e => e && e.type === 'relight'),
      over: st.phase !== 'build', won: st.phase === 'won', lost: st.phase === 'lost', endless: !!st.endless};
    // Logbook: Headliners faced, fusions found and fired
    for (const id of rules) if (row('HEADLINERS', id) || id === 'countdown') c.headliners[id] = (c.headliners[id] || 0) + 1;
    for (const ev of events) {
      if (!ev || ev.type !== 'fusion') continue;
      const key = fusionKey(ev);
      if (!key) continue;
      const f = c.fusions[key] || (c.fusions[key] = {leftSeen: true, found: false, fired: 0});
      f.leftSeen = true; f.fired = (f.fired || 0) + 1;
      if (!f.found) { f.found = true; emit('discover', {kind: 'fusion', id: key}); }
    }
    codexScan(st);
    // records: best show (the "run-best" top tier fires once per run, only when an older record is beaten)
    const r = m.records;
    let record = false;
    if (!r.bestShow || score > r.bestShow.score) {
      record = S.recordAtStart > 0 && !S.recordHit;
      if (record) S.recordHit = true;
      r.bestShow = {score, show: pre.show + 1, seed: st.seed};
    }
    if (!pass && st.phase === 'build') S.missPending = true;
    evaluateMilestones(st);
    let topTier = null;
    if (st.phase === 'won') topTier = 'runWon';
    else if (pass && pre.show % 3 === 2) topTier = pre.show === 23 ? 'countdown' : 'headliner';
    else if (pass && record) topTier = 'record';
    if (st.phase !== 'build') finalizeRun({});
    return {entry, summary, topTier};
  }
  function finalizeRun(o) {
    const st = S.state, m = S.meta, r = m.records, h = hist(st);
    const seasonWon = st.phase === 'won' || !!st.endless;
    if (!S.counted) {
      S.counted = true;
      m.runs += 1;
      if (seasonWon) {
        m.wins += 1;
        r.winsByKit[st.kit] = (r.winsByKit[st.kit] || 0) + 1;
        if (r.fastestWinMs == null || S.buildMs < r.fastestWinMs) r.fastestWinMs = Math.round(S.buildMs);
        if (!st.fairWeather) {
          r.highestRenown = Math.max(r.highestRenown == null ? 0 : r.highestRenown, st.renown | 0);
          const next = Math.min(8, (st.renown | 0) + 1);
          if (next > m.renown.max) { m.renown.max = next; pushUnlock('renown', next, 'm_win'); }
        }
        evaluateMilestones(st);
      }
    }
    const shows = h.reduce((n, e) => Math.max(n, (e.show | 0) + 1), 0);
    const total = h.reduce((n, e) => n + (e.applause || 0), 0);
    if (!r.bestRun || shows > r.bestRun.shows || (shows === r.bestRun.shows && total > r.bestRun.total)) r.bestRun = {shows, total};
    const apShows = h.filter(e => e.show >= 24 && e.pass).length;
    if (st.endless) r.bestAfterparty = Math.max(r.bestAfterparty || 0, apShows);
    let best = null;
    h.forEach((e, i) => { if (!best || (e.applause || 0) > best.applause) best = {applause: e.applause || 0, show: (e.show | 0) + 1, index: i}; });
    // UI_END paints and saves the poster when it exposes posterOf; otherwise core keeps a plain one.
    const endUI = typeof UI_END !== 'undefined' ? UI_END : null;
    if (!can(endUI, 'posterOf')) {
      const poster = {seed: st.seed, kit: st.kit, renown: st.renown | 0, won: seasonWon, show: shows || st.show + 1,
        festival: Math.min(12, Math.floor(Math.max(0, shows - 1) / 3) + 1), score: best ? best.applause : 0, date: ymd(new Date()),
        tubes: st.tubes.map(t => (t && t.shell ? {id: t.shell.id, col: t.shell.col, star: t.shell.star, rig: t.rig || null} : null))};
      if (S.posterAdded && m.posters.length) m.posters[m.posters.length - 1] = poster;
      else { m.posters.push(poster); m.posters = m.posters.slice(-5); S.posterAdded = true; }
    }
    const pre = S.lastPreLight;
    S.lastRun = {
      won: seasonWon, lost: !seasonWon, abandoned: !!o.abandoned, afterparty: !!st.endless, afterpartyShows: apShows,
      state: simClone(st), history: litHistory(h), finalPreLight: pre, buildStart: pre && pre.runStats ? pre.runStats.buildStart || null : null,
      rules: pre ? rulesAt(pre, pre.show) : [], target: pre ? targetAt(pre, pre.show) : 0,
      seed: st.seed, kit: st.kit, renown: st.renown | 0, fairWeather: !!st.fairWeather, daily: !!st.daily, firstRun: !!st.firstRun,
      bestShow: best, newUnlocks: S.runUnlocks.slice(), milestoneDeltas: milestoneDeltas(), milestones: milestoneRows(),
      lit: S.lit.slice(), buildMs: Math.round(S.buildMs), keepsakeOptions: keepsakeOptions(st),
    };
    emit('meta', {meta: m});
    saveNow();
  }
  // History entries plus the rack as lit ({tubes, rules, crowd, fav}) for the end screen's Shapley chart.
  function litHistory(h) {
    const same = S.lit.length === h.length;
    return h.map((e, i) => {
      if (!isObj(e)) return e;
      let l = same ? S.lit[i] : null;
      if (!l || l.show !== e.show) l = [...S.lit].reverse().find(x => x.show === e.show) || null;
      return l ? {...e, lit: l} : {...e};
    });
  }
  function keepsakeOptions(st) {
    const ko = safe(() => sim().keepsakeOptions(st, st.unlocked), null);
    if (ko && Array.isArray(ko.options)) return ko.options;
    const common = sh => { const rw = row('SHELLS', sh.id); return !rw || !rw.rarity || rw.rarity === 'C'; };
    const owned = [...st.tubes.map(t => t && t.shell), ...(st.crate || [])].filter(Boolean).filter(common).map(sh => ({id: sh.id, col: sh.col}));
    const seen = new Set(), out = [];
    for (const k of owned) { const key = k.id + ':' + k.col; if (!seen.has(key)) { seen.add(key); out.push(k); } }
    if (out.length) return out;
    const pool = rows('SHELLS').filter(r => r.rarity === 'C' && (!lockOf(r) || isDone(lockOf(r))));
    const pick = [];
    for (let i = 0; pool.length && i < 3; i++) pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return pick.map(r => ({id: r.id, col: r.col === '*' ? 'R' : r.col}));
  }

  /* ---------- milestones (§4.11) and the unlock flow (§7.2) ---------- */
  const foundFusionKeys = () => Object.keys(S.meta.codex.fusions).filter(k => S.meta.codex.fusions[k] && S.meta.codex.fusions[k].found);
  const foundFusions = () => foundFusionKeys().length;
  function colourCounts(cf) {
    if (isObj(cf)) return cf;
    if (Array.isArray(cf)) { const o = {}; cf.forEach(c => { o[c] = (o[c] || 0) + 1; }); return o; }
    return null;
  }
  function measure(st) {
    const h = hist(st), v = {};
    const owned = [...st.tubes.map(t => t && t.shell), ...(st.crate || [])].filter(Boolean);
    v.m_fusion = h.reduce((n, e) => n + (Array.isArray(e.fusions) ? e.fusions.length : 0), 0);
    v.m_busy = h.reduce((n, e) => Math.max(n, e.bursts | 0), 0);
    v.m_mono = 0; v.m_spectrum = 0;
    for (const e of h) {
      const cc = colourCounts(e.colsFired);
      const up = isNum(e.colsUp) ? e.colsUp : Array.isArray(e.colsUp) ? e.colsUp.length : 0;
      let distinct = isNum(e.colsFired) ? e.colsFired : 0;
      if (cc) {
        const cols = ['R', 'A', 'G', 'B'].filter(k => cc[k] > 0);
        distinct = cols.length;
        if (cols.length === 1 && !(cc.X > 0)) v.m_mono = Math.max(v.m_mono, cc[cols[0]]);
      }
      v.m_spectrum = Math.max(v.m_spectrum, Math.min(3, up), distinct >= 4 ? 3 : Math.min(2, distinct));
    }
    v.m_crowd = st.crowd | 0;
    v.m_triple = owned.reduce((n, sh) => Math.max(n, sh.star | 0), 0);
    v.m_headliner = h.some(e => e.show === 11 && e.pass) ? 1 : 0;
    v.m_rigger = st.tubes.filter(t => t && t.rig).length;
    v.m_win = st.phase === 'won' || st.endless ? 1 : 0;
    v.m_logbook = foundFusions();
    // The SIM's own reading wins where it has one (it sees per-burst colour data).
    const p = safe(() => sim().milestoneProgress(st.runStats, S.meta, st), null);
    const put = (id, val) => { const n = isNum(val) ? val : isObj(val) ? (isNum(val.value) ? val.value : val.v) : null; if (isNum(n)) v[id] = n; };
    if (Array.isArray(p)) p.forEach(x => x && put(x.id, x));
    else if (isObj(p)) for (const id in p) put(id, p[id]);
    return v;
  }
  function evaluateMilestones(st) {
    if (!st) return;
    const vals = measure(st), m = S.meta;
    let improved = null;
    for (const ms of milestones()) {
      const val = vals[ms.id];
      if (!isNum(val)) continue;
      if (val > (S.runBest[ms.id] || 0)) S.runBest[ms.id] = val;
      const best = m.progress[ms.id] || 0;
      if (val > best) {
        m.progress[ms.id] = val;
        emit('milestone', {id: ms.id, value: val, goal: ms.goal, done: val >= ms.goal});
        if (val < ms.goal && !isDone(ms.id) && ms.id !== 'm_crowd' && (!improved || val / ms.goal > improved.val / improved.goal)) improved = {...ms, val};
      }
      if (!isDone(ms.id) && val >= ms.goal) completeMilestone(ms, val);
    }
    if (improved && improved.val / improved.goal >= 0.5) S.pendingToasts.push([improved.name + ' ' + improved.val + '/' + improved.goal, 'milestone']);
  }
  function pushUnlock(kind, id, milestone) {
    if (S.runUnlocks.some(u => u.kind === kind && u.id === id)) return;
    S.runUnlocks.push({kind, id, milestone});
    emit('unlock', {kind, id});
  }
  function completeMilestone(ms, val) {
    const m = S.meta;
    m.unlocked.push(ms.id);
    m.progress[ms.id] = Math.max(m.progress[ms.id] || 0, val);
    pushUnlock('milestone', ms.id, ms.id);
    for (const r of rows('SHELLS')) if (lockOf(r) === ms.id) pushUnlock('shell', r.id, ms.id);
    for (const f of fusionList()) if (f.lock === ms.id) pushUnlock('fusion', f.key, ms.id);
    for (const r of rows('KITS')) if ((r.lock !== undefined || r.unlock !== undefined ? lockOf(r) : KIT_LOCK[r.id]) === ms.id) pushUnlock('kit', r.id, ms.id);
    if (!rows('KITS').length) for (const k in KIT_LOCK) if (KIT_LOCK[k] === ms.id) pushUnlock('kit', k, ms.id);
    if (ms.id === 'm_win') { pushUnlock('mode', 'afterparty', ms.id); pushUnlock('mode', 'daily', ms.id); }
    emit('milestone', {id: ms.id, value: val, goal: ms.goal, done: true});
    S.pendingToasts.push([ms.name + ' ✓ Unlocks from your next run.', 'milestone']);
    emit('meta', {meta: m});
    saveNow();
  }
  function milestoneRows() {
    return milestones().map(ms => ({id: ms.id, name: ms.name, goal: ms.goal, best: S.meta.progress[ms.id] || 0,
      run: S.runBest[ms.id] || 0, done: isDone(ms.id)}));
  }
  function milestoneDeltas() {
    return milestoneRows().map(d => ({...d, before: S.startProgress[d.id] || 0, after: d.best,
      newly: S.runUnlocks.some(u => u.kind === 'milestone' && u.id === d.id)})).filter(d => d.after > d.before || d.newly);
  }
  function flushToasts() {
    const list = S.pendingToasts;
    S.pendingToasts = [];
    for (const [text, kind] of list) toast(text, {kind});
  }

  /* ---------- Logbook discovery (§7.1) ---------- */
  function codexScan(st) {
    if (!st) return;
    const c = S.meta.codex;
    const see = (kind, table, id, init) => { if (id && table[id] == null) { table[id] = init; emit('discover', {kind, id}); } };
    const shop = st.shop || {};
    for (const card of shop.cards || []) if (card && card.id) see('shell', c.shells, card.id, {seen: true, owned: 0});
    const owned = [...st.tubes.map(t => t && t.shell), ...(st.crate || [])].filter(Boolean);
    for (const sh of owned) {
      see('shell', c.shells, sh.id, {seen: true, owned: 1});
      for (const f of fusionList()) if (f.a === sh.id && !c.fusions[f.key]) c.fusions[f.key] = {leftSeen: true, found: false, fired: 0};
    }
    // Headliners are posted a festival ahead: this festival's and the next one's.
    const s = st.show;
    for (const hs of [nextHeadliner(s), nextHeadliner(s) + 3]) for (const id of rulesAt(st, hs)) if (row('HEADLINERS', id) || id === 'countdown') see('headliner', c.headliners, id, 0);
    if (shop.rig && shop.rig.id) see('rig', c.rigs, shop.rig.id, 0);
  }
  function codexOnBuild(a, pre, events) {
    const c = S.meta.codex;
    if (a.type === 'buy') {
      const card = pre.shop && pre.shop.cards && pre.shop.cards[a.card];
      if (card && card.id) { const e = c.shells[card.id] || (c.shells[card.id] = {seen: true, owned: 0}); e.owned = (e.owned || 0) + 1; }
    }
    if (a.type === 'buyRig') { const rid = pre.shop && pre.shop.rig && pre.shop.rig.id; if (rid) c.rigs[rid] = (c.rigs[rid] || 0) + 1; }
    codexScan(S.state);
  }

  /* ---------- one-line tooltips (§4.13): shown once, as 'tip' toasts, dismissed by the next action ---------- */
  function tipText(id) {
    const t = data().TOOLTIPS;
    const r = Array.isArray(t) ? t.find(x => x && x.id === id) : isObj(t) ? t[id] : null;
    return typeof r === 'string' ? r : r && (r.text || r.value) || null;
  }
  function queueTip(id) {
    if (playUI() || S.meta.seenTips.includes(id) || S.tipQueue.includes(id) || S.tipShown === id || !tipText(id)) return;
    S.tipQueue.push(id);
  }
  function tip(id) {
    if (S.meta.seenTips.includes(id) || S.tipQueue.includes(id) || !tipText(id)) return false;
    S.tipQueue.push(id);
    showNextTip();
    return true;
  }
  function showNextTip() {
    if (S.tipShown || !S.tipQueue.length || S.ui === 'RESOLVING' || S.ui === 'END') return;
    const id = S.tipQueue.shift();
    S.tipShown = id;
    S.meta.seenTips.push(id);
    const text = tipText(id);
    emit('tip', {id, text});
    toast(text, {kind: 'tip', id});
  }
  function dismissTip() {
    if (!S.tipShown) return;
    const id = S.tipShown;
    S.tipShown = null;
    emit('tipDone', {id});
  }
  function buildTips(st) {
    const s = st.show, f = Math.floor(s / 3) + 1, rules = rulesAt(st, s), sm = S.res && S.res.info && S.res.info.summary;
    const last = hist(st)[hist(st).length - 1];
    if (last) {
      if ((last.aah || 0) > 1) queueTip('t_aah');
      if (st.crowd > 0) queueTip('t_crowd');
      if (last.pass === false) queueTip('t_rain');
    }
    const pay = sm && sm.payout;
    if (pay && (pay.interest || 0) > 0) queueTip('t_interest');
    if (s === 0) queueTip('t_fuse');
    if (s === 2 && rules.includes('headwind')) { queueTip('t_head'); if (st.firstRun) queueTip('t_mood'); }
    if (s === 21 || s === 23) queueTip('t_count');
    if (rules.includes('windshift') || rules.includes('crossed')) queueTip('t_match');
    if (st.sponsor) queueTip('t_sponsor');
    const shop = st.shop || {};
    if (shop.rig) queueTip('t_rig');
    if (f >= 2 && !st.endless && st.tubes.length < 6) queueTip('t_tube');
    const owned = [...st.tubes.map(t => t && t.shell), ...(st.crate || [])].filter(Boolean);
    if ((shop.cards || []).some(cd => cd && owned.some(sh => sh.id === cd.id && sh.star < 3))) queueTip('t_twin');
  }
  function actionTips(a) {
    if ((a.type === 'buy' || a.type === 'move') && a.to && a.to.zone === 'crate') queueTip('t_crate');
  }

  /* ---------- aria-live (§13) and toasts ---------- */
  function announce(text, o = {}) {
    if (!text) return;
    const A = S.ann;
    (o.assertive ? A.assertive : A.polite).push(String(text));
    if (!A.queued) { A.queued = true; Promise.resolve().then(flushAnnounce); }
  }
  function flushAnnounce() {
    const A = S.ann;
    A.queued = false;
    for (const [q, id] of [[A.polite, 'live-polite'], [A.assertive, 'live-assertive']]) {
      if (!q.length) continue;
      // Separate queued messages as sentences ("Full Spectrum 2/3. Show 2 of 24, …").
      const text = [...new Set(q)].map(s => s.trim()).filter(Boolean).map((s, i, a) => (i < a.length - 1 && !/[.!?:…]$/.test(s) ? s + '.' : s)).join(' '), el = byId(id);
      q.length = 0;
      if (el) el.textContent = el.textContent === text ? text + ' ' : text;
    }
  }
  function toast(text, o = {}) {
    if (!text) return;
    const p = {text: String(text), kind: o.kind || 'info'};
    if (o.id) p.id = o.id;
    emit('toast', p);
    if (typeof UI_MENUS === 'undefined') fallbackToast(p);
  }
  function fallbackToast(p) {
    const box = byId('toasts');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'card-surface';
    el.style.cssText = 'position:absolute;left:50%;top:72px;transform:translateX(-50%);z-index:60;padding:10px 14px;max-width:min(90%,420px);font-size:var(--t-s)';
    el.textContent = p.text;
    box.replaceChildren(el);
    setTimeout(() => el.remove(), 3200);
  }

  /* ---------- haptics (§9) ---------- */
  function haptic(pattern) {
    if (!S.settings || !S.settings.haptics || !hasVibrate() || !S.gestured) return false;
    try { return navigator.vibrate(pattern); } catch (e) { return false; }
  }
  function hapticFor(ev) {
    if (!ev) return;
    const p = ev.type === 'applause' ? (ev.pass === false ? [60, 40, 60] : 20) : HAPTIC[ev.type];
    if (p) haptic(p);
  }

  /* ============================================================
     OVERLAYS: stack, focus trap, focus restore, pausing
  ============================================================ */
  // Tab stops only: no tabindex="-1" (roving radios), nothing disabled, hidden, inert or invisible; in a
  // native radio group only the checked radio (else the first) is a stop, as in the browser's own order.
  const FOCUSABLE = 'button,a[href],area[href],input:not([type="hidden"]),select,textarea,summary,iframe,[contenteditable]:not([contenteditable="false"]),[tabindex]';
  function focusables(el) {
    const out = [], seen = new Set();
    for (const x of el.querySelectorAll(FOCUSABLE)) {
      if (x.tabIndex < 0 || x.getAttribute('tabindex') === '-1' || x.hasAttribute('disabled') || safe(() => x.matches(':disabled'), false)) continue;
      if (!x.getClientRects().length || x.closest('[hidden],[inert]')) continue;
      if (safe(() => getComputedStyle(x).visibility, 'visible') !== 'visible') continue;
      if (x.tagName === 'INPUT' && x.type === 'radio' && x.name) {
        const root = x.form || el, key = x.name;
        if (seen.has(key)) continue;
        const group = [...root.querySelectorAll('input[type="radio"]')].filter(r => r.name === key && el.contains(r));
        const pick = group.find(r => r.checked) || x;
        seen.add(key);
        out.push(pick);
        continue;
      }
      out.push(x);
    }
    return out;
  }
  const topEntry = () => S.stack[S.stack.length - 1] || null;
  const top = () => (topEntry() ? topEntry().name : null);
  const isOpen = name => S.stack.some(e => e.name === name);
  function focusIn(el, opts) {
    const pick = () => {
      let t = null;
      const f = opts && opts.focus;
      if (f) t = typeof f === 'string' ? el.querySelector(f) || byId(f.replace(/^#/, '')) : f;
      if (t && !el.contains(t)) t = null;
      t = t || el.querySelector('[data-autofocus],[autofocus]') || focusables(el)[0] || null;
      if (!t) { if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1'); t = el; }
      try { t.focus({preventScroll: true}); } catch (e) { /* ignore */ }
      return t !== el;
    };
    if (!pick()) setTimeout(() => { const e = topEntry(); if (e && e.el === el && (document.activeElement === el || !el.contains(document.activeElement))) pick(); }, 0);
  }
  function fallbackPanel(name, el) {
    if (el.children.length || name === 'showlog') return;
    const panel = document.createElement('div');
    panel.className = 'panel';
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn btn-primary';
    b.textContent = name === 'tapContinue' ? 'Tap to continue' : 'Continue';
    b.addEventListener('click', () => close(name));
    panel.append(b);
    el.append(panel);
  }
  function open(name, opts = {}) {
    const el = byId(OVERLAY_ID[name] || '');
    if (!el) return false;
    if (name === 'showlog' && S.layout === 'desktop') {   // a docked side panel on desktop: no modal
      emit('overlay', {name, open: true, opts, docked: true});
      focusIn(el, opts);
      return true;
    }
    const i = S.stack.findIndex(e => e.name === name);
    if (i >= 0) {
      if (i < S.stack.length - 1) S.stack.push(S.stack.splice(i, 1)[0]);
    } else {
      const back = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
      S.stack.push({name, el, back, opts, wasHidden: el.hidden});
    }
    el.hidden = false;
    el.classList.add('is-open');
    syncOverlays();
    emit('overlay', {name, open: true, opts});
    fallbackPanel(name, el);
    focusIn(el, opts);
    return true;
  }
  function close(name) {
    const i = name ? S.stack.findIndex(e => e.name === name) : S.stack.length - 1;
    if (i < 0) {
      if (name === 'showlog') emit('overlay', {name, open: false});
      return false;
    }
    const wasTop = i === S.stack.length - 1;
    const [e] = S.stack.splice(i, 1);
    e.el.hidden = e.name === 'showlog' ? !!e.wasHidden : true;
    e.el.classList.remove('is-open');
    syncOverlays();
    emit('overlay', {name: e.name, open: false});
    if (wasTop) {
      // Back to the control that opened the closing overlay when it is still a stop in the now-top layer
      // (the page when the stack is empty); otherwise the top overlay's first stop.
      const t = topEntry(), b = e.back;
      const layer = t ? t.el : document.body;
      const back = b && b !== document.body && b.isConnected && layer.contains(b) && !b.closest('[hidden],[inert]') &&
        !b.hasAttribute('disabled') && b.getClientRects().length ? b : null;
      if (back) { try { back.focus({preventScroll: true}); } catch (err) { /* ignore */ } }
      if (t && !t.el.contains(document.activeElement)) focusIn(t.el, {});
    }
    return true;
  }
  function closeAll() { while (S.stack.length) close(); }
  function syncOverlays() {
    const t = topEntry();
    for (const id of ['play', 'board', 'showlog']) {
      const el = byId(id);
      if (el) el.inert = !!t && el !== t.el && !(id === 'showlog' && S.stack.some(e => e.el === el));
    }
    for (const e of S.stack) e.el.inert = e !== t;
    const pausing = S.stack.some(e => PAUSING.includes(e.name));
    setPaused('overlay', pausing);
    if (!pausing && S.audioHeld && !S.stack.length) { S.audioHeld = false; callAudio('unlock'); callAudio('resume'); }
    callAudio('setPhase', audioPhase());
  }

  /* ============================================================
     INPUT: one keydown listener, first-gesture audio unlock
  ============================================================ */
  const isTyping = el => !!el && (el.tagName === 'TEXTAREA' || el.isContentEditable ||
    (el.tagName === 'INPUT' && /^(text|search|url|email|number|password)$/i.test(el.type || 'text') && !el.readOnly));
  function gesture() {
    S.gestured = true;
    if (!S.unlocked) { S.unlocked = true; callAudio('unlock'); }
  }
  function trapTab(e) {
    const t = topEntry();
    const f = focusables(t.el);
    if (!f.length) { e.preventDefault(); focusIn(t.el, {}); return; }
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
  }
  function onKeyDown(e) {
    gesture();
    const t = topEntry();
    if (e.key === 'Tab' && t) { trapTab(e); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const typing = isTyping(e.target);
    const scopes = t ? [t.name] : typing ? [] : ['play'];
    if (!typing) scopes.push('global');
    for (const sc of scopes) {
      for (const fn of (S.keys[sc] || []).slice()) {
        let r = false;
        try { r = fn(e); } catch (err) { warn('key ' + sc, err); }
        if (r === true) return;
      }
    }
    // defaults
    if (e.key === 'Escape') {
      e.preventDefault();
      if (t) { if (t.name !== 'end') close(t.name); }
      else if (S.ui === 'BUILD' || S.ui === 'RESULT' || S.ui === 'RESOLVING') open('pause');
      return;
    }
    if (t && t.name === 'tapContinue' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); close('tapContinue'); return; }
    if (!t && !typing && S.ui === 'RESOLVING' && (e.key === ' ' || e.key === 'Spacebar')) {
      e.preventDefault();
      if (S.res && !S.res.ff) fastForward(); else skip();
    }
  }
  function onPointerDown(e) {
    gesture();
    if (e.isPrimary === false) return;
    const t = topEntry(), target = e.target instanceof Element ? e.target : null;
    if (t && SHEETS.includes(t.name) && target && !t.el.contains(target)) { close(t.name); return; }
    if (!t && S.ui === 'RESOLVING' && target && target.closest('#play') && !target.closest('#fire,[data-act="pause"]')) fastForward();
  }
  function onFocusIn(e) {
    const t = topEntry();
    if (t && e.target instanceof Node && !t.el.contains(e.target)) focusIn(t.el, {});
  }

  /* ---------- lifecycle: page hidden → pause + save + suspend; resume only via tapContinue ---------- */
  function onHidden() {
    if (!S.booted || S.ui === 'BOOT') return;
    saveNow();
    if (S.flags.test) return;
    callAudio('suspend');
    S.audioHeld = true;
    if (S.ui === 'END') { S.unlocked = false; S.audioHeld = false; return; }
    if (!isOpen('tapContinue') && !isOpen('pause')) open('tapContinue');
  }

  /* ---------- layout: the column height picks the mode (§8.1) ---------- */
  function measureLayout() {
    S.resizeQueued = false;
    const play = byId('play'), w = window.innerWidth, h = play ? play.clientHeight : window.innerHeight;
    const layout = w >= 1200 ? 'desktop' : h < 520 ? 'scroll' : h < 700 ? 'compact' : 'regular';
    const app = byId('app');
    if (app && app.getAttribute('data-layout') !== layout) app.setAttribute('data-layout', layout);
    const changed = layout !== S.layout;
    S.layout = layout;
    if (changed && layout === 'desktop' && isOpen('showlog')) close('showlog');
    callFX('resize');
    emit('resize', {w, h, layout});
    if (!S.loopOn || S.paused.size) callFX('render');
  }
  function queueLayout() {
    if (S.flags.test || typeof requestAnimationFrame !== 'function') return measureLayout();
    if (!S.resizeQueued) { S.resizeQueued = true; requestAnimationFrame(measureLayout); }
  }

  /* ============================================================
     LOOP: fixed timestep (§11.5)
  ============================================================ */
  function after(n, fn) {
    if (n <= 0 || !S.loopOn) { fn(); return null; }
    const t = {at: S.tick + n, fn};
    S.timers.push(t);
    return t;
  }
  function runTimers() {
    if (!S.timers.length) return;
    const due = S.timers.filter(t => t.at <= S.tick);
    if (!due.length) return;
    S.timers = S.timers.filter(t => t.at > S.tick);
    for (const t of due) { try { t.fn(); } catch (e) { warn('timer', e); } }
  }
  // One loop tick: the timers only. FX is presentation, so frame() advances it once per rAF (below);
  // the SIM never runs here (it steps on actions), so its determinism does not depend on the loop.
  function tick() {
    S.tick++;
    runTimers();
  }
  function tickOnce() {
    tick();
    callFX('update', DT * S.gameSpeed);
  }
  function frame(t) {
    S.raf = requestAnimationFrame(frame);
    const dt = Math.min(MAX_FRAME, Math.max(0, (t - (S.last || t)) / 1000));
    S.last = t;
    S.frameMs = S.frameMs * 0.9 + dt * 100;
    if (S.paused.size) { S.acc = 0; return; }
    if (S.ui === 'BUILD' || S.ui === 'RESULT') S.buildMs += dt * 1000;
    S.acc += dt;
    let n = 0;
    while (S.acc >= DT && n < MAX_STEPS) { tick(); S.acc -= DT; n++; }
    if (n >= MAX_STEPS) S.acc = 0;
    // A slow frame must not buy extra FX work (the old catch-up ran FX.update up to 8× per rAF and fed the
    // stall): one update per rAF for the ticks just run, clamped to 0.1 s of show time before speed.
    if (n) callFX('update', Math.min(FX_MAX_DT, n * DT) * S.gameSpeed);
    callFX('render');
    if (S.flags.debug) debugFrame();
  }
  // Without the rAF loop (?test=1) draw once after a change so the page is complete at rest.
  function kick() {
    if (S.loopOn || S.kickQueued) return;
    S.kickQueued = true;
    setTimeout(() => { S.kickQueued = false; callFX('render'); }, 0);
  }
  function startLoop() {
    if (S.loopOn || typeof requestAnimationFrame !== 'function') return;
    S.loopOn = true;
    S.last = 0;
    S.raf = requestAnimationFrame(frame);
  }
  function setPaused(reason, on) {
    if (on) S.paused.add(reason); else S.paused.delete(reason);
    if (!S.paused.size) { S.last = 0; S.acc = 0; }
  }

  /* ---------- ?debug=1 overlay ---------- */
  function debugFrame() {
    if (S.tick - S.dbgTick < 15) return;
    S.dbgTick = S.tick;
    const el = byId('debug');
    if (!el) return;
    const st = callFX('stats') || {}, g = S.state;
    el.textContent = 'frame ' + S.frameMs.toFixed(1) + ' ms · sim ' + S.simMs.toFixed(2) + ' ms\n' +
      'particles ' + (st.particles != null ? st.particles : '–') + ' · entities ' + (st.entities != null ? st.entities : st.emitters != null ? st.emitters : '–') + '\n' +
      S.ui + ' · show ' + (g ? g.show + 1 : '–') + ' · ' + (g ? g.phase : '–') + (S.paused.size ? ' · paused' : '') + '\n' +
      'hash ' + hash();
  }
  function showDebug() {
    const el = byId('debug');
    if (!el) return;
    el.hidden = false;
    el.style.cssText = 'position:absolute;left:8px;top:8px;z-index:90;margin:0;padding:6px 8px;border-radius:var(--radius-s);' +
      'background:var(--scrim);color:var(--ok);font:12px/1.35 ui-monospace,Menlo,Consolas,monospace;pointer-events:none;white-space:pre';
    if (!S.loopOn) el.textContent = 'test mode · hash ' + hash();
  }

  /* ============================================================
     TEST HOOKS (§11.6) and in-page bots (Blob Worker)
  ============================================================ */
  const hash = () => (S.state ? String(safe(() => sim().hashState(S.state), '')) : '');
  function runBots(o = {}) {
    const O = sim();
    const bot = String(o.bot || 'human'), n = clampInt(o.n, 1, 100000, 100);
    const seeds = Array.isArray(o.seeds) && o.seeds.length ? o.seeds.slice() : Array.from({length: n}, (_, i) => i + 1);
    const opts = isObj(o.opts) ? o.opts : {};
    const job = {bot, n: seeds.length, seeds, opts};
    return new Promise(resolve => {
      if (!can(O, 'runBots')) { resolve({error: 'OOH.runBots is missing', bot, n}); return; }
      let settled = false;
      const done = v => { if (!settled) { settled = true; resolve(v); } };
      const fallback = () => {
        if (settled) return;
        // One run per MessageChannel tick keeps the main thread responsive.
        const parts = [], ch = typeof MessageChannel === 'function' ? new MessageChannel() : null;
        const exact = can(O, 'playRun') && can(O, 'runRecord') && can(O, 'summarizeRuns');
        let i = 0;
        const work = () => {
          const t0 = now();
          do {
            const sd = seeds[i++];
            parts.push(exact ? safe(() => O.runRecord(O.playRun(sd, bot, opts).state), null) : safe(() => O.runBots({bot, n: 1, seeds: [sd], opts}), null));
          } while (i < seeds.length && now() - t0 < 8);
          if (i < seeds.length) { if (ch) ch.port2.postMessage(0); else setTimeout(work, 0); }
          else done(exact ? safe(() => O.summarizeRuns(parts.filter(Boolean), {bot, opts}), {error: 'summarize failed'}) : mergeSummaries(parts, job));
        };
        if (ch) ch.port1.onmessage = work;
        work();
      };
      let w = null;
      try {
        if (typeof Worker !== 'function' || typeof OohSim !== 'function') throw new Error('no worker');
        const src = "'use strict';\nconst OohSim = " + OohSim.toString() + ";\nconst OOH = OohSim();\n" +
          'onmessage = e => { let r; try { r = OOH.runBots(e.data); } catch (err) { r = {error: String(err && err.message || err)}; } postMessage(r); };';
        const url = URL.createObjectURL(new Blob([src], {type: 'text/javascript'}));
        w = new Worker(url);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        w.onmessage = e => { w.terminate(); done(e.data); };
        w.onerror = ev => { if (ev && ev.preventDefault) ev.preventDefault(); try { w.terminate(); } catch (err) { /* ignore */ } fallback(); };
        w.postMessage(job);
      } catch (e) { fallback(); }
    });
  }
  // Merge single-seed summaries from the fallback path: sums counts, re-derives rates, concatenates lists.
  function mergeSummaries(parts, job) {
    const list = parts.filter(isObj);
    if (can(sim(), 'mergeSummaries')) { const m = safe(() => sim().mergeSummaries(list), null); if (m) return m; }
    const out = {bot: job.bot, n: list.length, fallback: true};
    for (const p of list) for (const k in p) {
      const v = p[k];
      if (k === 'bot' || k === 'n') continue;
      if (isNum(v)) out[k] = (out[k] || 0) + v;
      else if (Array.isArray(v)) out[k] = (out[k] || []).concat(v);
      else if (out[k] === undefined) out[k] = v;
    }
    for (const k in out) if (isNum(out[k]) && /rate|pct|mean|avg|median|p\d+/i.test(k) && list.length) out[k] /= list.length;
    return out;
  }
  function runSimFlag() {
    const out = byId('sim-out');
    runBots({bot: S.flags.bot || 'human', n: S.flags.sim, opts: {...(S.flags.kit ? {kit: S.flags.kit} : {}), ...(S.flags.renown != null ? {renown: S.flags.renown} : {})}})
      .then(sum => {
        const text = JSON.stringify(sum);
        console.log(text);
        window.__simSummary = sum;
        if (out) {
          out.textContent = JSON.stringify(sum, null, 2);
          out.setAttribute('data-state', 'done');
          out.hidden = false;
          out.style.cssText = 'position:absolute;left:8px;right:8px;bottom:8px;z-index:95;max-height:50%;overflow:auto;margin:0;padding:8px;' +
            'border-radius:var(--radius-s);background:var(--surface-2);color:var(--paper);font:12px/1.35 ui-monospace,Menlo,Consolas,monospace;user-select:text';
        }
        emit('simDone', sum);
      });
  }
  function installHooks() {
    window.__game = {
      // reset(seed, opts): a fresh run with the boot run's createState options unless opts overrides them,
      // so reset(bootSeed) reproduces the boot state (same seed + same actions → same hash).
      reset(seed, opts) {
        const o = {...(S.bootOpts || {}), ...(isObj(opts) ? opts : {})};
        newRun({...o, seed: seed != null ? String(seed) : o.seed != null ? o.seed : randomSeed(), force: true, firstRun: !!o.firstRun});
        return hash();
      },
      act(action) {
        if (S.res) completeNow();
        return dispatch(action);
      },
      step(n = 1) {
        if (!S.flags.test) return false;
        for (let i = 0; i < Math.max(0, n | 0); i++) tickOnce();
        callFX('render');
        return S.tick;
      },
      state: () => (S.state ? simClone(S.state) : null),
      legalActions: () => (S.state ? safe(() => sim().legalActions(S.state), []) : []),
      events() { const q = S.evQueue; S.evQueue = []; return q; },
      hash,
      setPaused: b => setPaused('api', !!b),
      get config() {
        const d = data();
        return {version: d.version || d.VERSION || '1.1', TARGETS: d.TARGETS, SHELLS: d.SHELLS, FUSIONS: d.FUSIONS, RIGS: d.RIGS,
          HEADLINERS: d.HEADLINERS, KITS: d.KITS, RENOWN: d.RENOWN, MILESTONES: d.MILESTONES};
      },
      resolve: (tubes, ctx) => safe(() => sim().resolveShow(tubes, ctx || {rules: [], crowd: 0}), null),
      preview: () => (S.state ? safe(() => sim().previewChips(S.state, preview.rules && preview.rules.length ? preview.rules : rulesAt(S.state, S.state.show)), []) : []),
      mood: () => (S.state ? moodOf(S.state) : null),
      shapley(i) {
        const l = S.lit[i == null ? S.lit.length - 1 : i];
        return l ? safe(() => sim().shapley(l.tubes, l.rules, l.crowd, l.fav), null) : null;
      },
      skipAnimations(b = true) { S.skipAnim = !!b; if (S.skipAnim && S.res) completeNow(); return S.skipAnim; },
      runBots,
      meta: () => cloneJSON(S.meta),
      setMeta,
      ui: () => S.ui,
      game: api,
    };
  }

  /* ============================================================
     BOOT
  ============================================================ */
  function parseFlags() {
    const q = new URLSearchParams(location.search || '');
    const hq = new URLSearchParams((location.hash || '').replace(/^#/, ''));
    const get = k => (q.has(k) ? q.get(k) : hq.has(k) ? hq.get(k) : null);
    const truthy = k => { const v = get(k); return v != null && v !== '0' && v !== 'false'; };
    const sim = get('sim');
    return {test: truthy('test'), seed: get('seed') || null, debug: truthy('debug'),
      sim: sim != null ? clampInt(sim, 1, 100000, 200) : 0, bot: get('bot') || 'human',
      kit: get('kit') || null, renown: get('renown') != null ? clampInt(get('renown'), 0, 8, 0) : null,
      unlock: get('unlock') || null, fresh: truthy('fresh')};
  }
  function boot() {
    if (S.booted) return api;
    S.flags = parseFlags();
    installHooks();
    const stored = readStore();
    const ok = isObj(stored) && stored.v === 1;
    S.settings = cleanSettings(ok ? stored.settings : null);
    S.meta = cleanMeta(ok ? stored.meta : null);
    applySettings();
    // FX on canvas#sky (+ optional desktop backdrop), then the resolved options.
    const sky = byId('sky');
    if (sky) callFX('init', sky, {reducedMotion: S.reducedMotion, highContrast: S.settings.highContrast, speed: S.settings.speed,
      test: S.flags.test, debug: S.flags.debug, seed: S.flags.seed || 'first-show'});
    const bd = byId('backdrop');
    if (bd && mq('(min-width: 1200px)')) callFX('attachBackdrop', bd);
    applySettings();
    // Restore the run saved on hide, or create one (first-ever run → curated seed).
    const f = S.flags;
    const fresh = f.seed != null || f.kit != null || f.renown != null;
    const saved = ok && !fresh && validRun(stored.run) ? stored.run : null;
    if (saved) restoreRun(saved);
    else {
      resetRunFields();
      S.state = createRun({seed: f.seed != null ? f.seed : undefined, kit: f.kit || undefined, renown: f.renown != null ? f.renown : undefined,
        force: !!(f.kit || f.renown != null)});
    }
    S.bootOpts = S.runOpts ? cloneJSON(S.runOpts) : null;
    S.booted = true;
    // UI modules render into their containers.
    const mods = [typeof UI_PLAY !== 'undefined' ? UI_PLAY : null, typeof UI_PANELS !== 'undefined' ? UI_PANELS : null,
      typeof UI_END !== 'undefined' ? UI_END : null, typeof UI_MENUS !== 'undefined' ? UI_MENUS : null];
    for (const m of mods) if (can(m, 'init')) { try { m.init(api); } catch (e) { console.error('[core] UI init', e); } }
    // Input and lifecycle.
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('contextmenu', e => { if (e.target instanceof Element && e.target.closest('#app') && !isTyping(e.target)) e.preventDefault(); });
    // Only a page that is really hidden pauses (§11.5 Lifecycle): focus leaving the page (Tab past the last
    // stop, another window) keeps the show going.
    document.addEventListener('visibilitychange', () => { if (document.hidden) onHidden(); });
    window.addEventListener('blur', () => { if (document.hidden) onHidden(); });
    window.addEventListener('pagehide', saveNow);
    const tc = byId('tap-continue');
    if (tc) tc.addEventListener('click', () => { if (isOpen('tapContinue')) close('tapContinue'); });
    const media = [['(prefers-reduced-motion: reduce)', () => { if (S.settings.reducedMotion === 'auto') { applySettings(); emit('settings', {key: 'reducedMotion', value: 'auto', settings: S.settings}); } }]];
    for (const [q, fn] of media) { try { const m = matchMedia(q); if (m.addEventListener) m.addEventListener('change', fn); else if (m.addListener) m.addListener(fn); } catch (e) { /* ignore */ } }
    const play = byId('play');
    if (typeof ResizeObserver === 'function' && play) new ResizeObserver(queueLayout).observe(play);
    window.addEventListener('resize', queueLayout);
    measureLayout();
    // Go.
    if (S.state) beginRun(!!saved);
    else console.error('[core] no SIM state: OOH.createState is missing or failed');
    if (!f.test) startLoop();
    else callFX('render');
    if (f.debug) showDebug();
    if (f.sim) runSimFlag();
    return api;
  }

  /* ---------- public API ---------- */
  const api = {
    get state() { return cur(); },
    get meta() { return S.meta; },
    get settings() { return S.settings; },
    get ui() { return S.ui; },
    get flags() { return S.flags; },
    preview,
    get lastRun() { return S.lastRun; },
    get reducedMotion() { return S.reducedMotion; },
    get critical() { return {on: isCritical(), lastChance: S.lastChance}; },
    get layout() { return S.layout; },
    get lastLit() { return S.lit.length ? S.lit[S.lit.length - 1] : null; },
    boot, dispatch, undo, canUndo, light, fastForward, skip,
    newRun, abandon, enterAfterparty, startDaily, setKeepsake, setRehearse, dismissResult,
    setSetting, setMeta, saveNow, exportSave, importSave, resetProgress,
    open, close, top, isOpen, announce, toast, on, emit, onKey, haptic, tip,
    moodVisible, kitUnlocked, renownMax, canAfterparty, canDaily, discovered,
    label: {festival: festName, slot: k => SLOT[k], shell: shellName, rule: ruleName, colour: colName, kit: kitName},
  };
  return api;
})();
