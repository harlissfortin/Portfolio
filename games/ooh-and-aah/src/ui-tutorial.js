/* ============================================================
   ui-tutorial.js — UI_TUTORIAL: "Rehearsal Night", the optional
   2-minute tutorial (CONTRACT.md, last section).
   Renders into #tutorial:
     - the coach-mark layer: a scrim with cut-outs, a brass ring on
       each spotlit control, and one callout card (title, text,
       progress, Next / Show me / Skip tutorial);
     - the first-launch offer ("New here? …"), a small card in the
       sky that never blocks play.
   Reads GAME.tutorial and the 'tutorial' event; advances with
   GAME.tutorialGoto(i); exits with GAME.endTutorial({startRun}).
   Step text comes from OOH.DATA.TUTORIAL (one table); this module
   only decides where to point and what input to let through.
============================================================ */
const UI_TUTORIAL = (() => {
  let G = null;
  const E = {};
  const HELP_MS = 8000;          // "Show me" / Next fallback delay
  const BEAT_MS = 650;           // the tick of success before the next step loads
  const T = {
    active: false, step: -1, total: 0, def: null, xs: [], phase: 0,
    watching: false,             // a show is playing: the callout steps aside, no scrim
    satisfied: false,            // the show's expectation was met: advance when RESULT opens
    fusionSeen: false, fusion: null,   // the fusion event the 'fusion' phase is waiting for
    hold: false,                 // expectation met, waiting on Next (a recap is showing)
    beat: 0, help: false, helpTimer: 0, nudge: '',
    aside: false, asideGuess: false, results: [], runTouched: false, stuck: false, reverting: false,
    offerGone: false, offerKey: '',
    raf: 0, key: '', lastFocusPhase: '',
  };

  /* ---------- small helpers ---------- */
  const fnIn = (o, k) => !!o && typeof o[k] === 'function';
  const safe = (fn, d) => { try { const v = fn(); return v === undefined ? d : v; } catch (e) { return d; } };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const sim = () => (typeof OOH !== 'undefined' ? OOH : null);
  const defs = () => { const d = safe(() => sim().DATA.TUTORIAL, null); return Array.isArray(d) ? d : []; };
  const num = n => safe(() => String(sim().fmt(n)), String(Math.floor(Number(n) || 0)));
  const announce = t => { if (fnIn(G, 'announce')) safe(() => G.announce(t)); };
  const ui = () => (G && G.ui) || 'BOOT';
  const building = () => ui() === 'BUILD' || ui() === 'RESULT';
  const topOverlay = () => (fnIn(G, 'top') ? safe(() => G.top(), null) : null);
  const reduced = () => !!(G && G.reducedMotion);
  const slotOf = v => (v == null ? null : typeof v === 'number' ? { zone: 'tube', i: v } : v);
  const sameSlot = (a, b) => !!a && !!b && (a.zone || 'tube') === (b.zone || 'tube') && a.i === b.i;
  const visible = el => { if (!el || !el.isConnected || el.closest('[hidden]')) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const tubeEl = i => (i == null ? null : $(`#rack [data-tube="${i}"]`));
  const cardEl = i => (i == null ? null : $(`#shop [data-card="${i}"]`));

  /* ---------- step model ---------- */
  // A step's `expect` may be one expectation or a short sequence (an array, or {…, then:[…]}).
  // Each expectation may carry its own `text` for its phase.
  function expectsOf(def) {
    const x = def && def.expect;
    if (Array.isArray(x)) return x.length ? x : [{ type: 'next' }];
    if (x && Array.isArray(x.then)) return [x, ...x.then];
    return [x || { type: 'next' }];
  }
  const X = () => T.xs[Math.min(T.phase, T.xs.length - 1)] || { type: 'next' };
  const isShowX = x => x && (x.type === 'light' || x.type === 'result' || x.type === 'fusion');
  const isLast = () => !!(T.def && T.def.last) || T.step >= T.total - 1;
  // The live numbers any step text may quote: {ooh} {aah} {applause} {target} {first}.
  function fill(s) {
    const r = T.results[T.results.length - 1] || {}, f = T.results[0] || {};
    return String(s || '').replace(/\{(ooh|aah|applause|target|first)\}/g, (m, k) =>
      k === 'first' ? (f.applause != null ? num(f.applause) : m) : r[k] != null ? (k === 'aah' ? String(r.aah) : num(r[k])) : m);
  }
  function tubeOfShell(id) {
    const st = G && G.state, tubes = (st && st.tubes) || [];
    for (let i = 0; i < tubes.length; i++) if (tubes[i] && tubes[i].shell && tubes[i].shell.id === id) return i;
    return null;
  }
  function cardOfShell(id) {
    const cards = safe(() => G.state.shop.cards, []) || [];
    for (let i = 0; i < cards.length; i++) if (cards[i] && cards[i].id === id && !cards[i].sold) return i;
    return null;
  }
  // Normalised expectation: {type, card, tube, from, to, displace, id, key}
  function norm(x) {
    const o = { ...x };
    if (o.type === 'buy' || o.type === 'upgrade') {
      if (o.tube == null && o.to != null) o.tube = slotOf(o.to).i;
      if (o.card == null && o.id) o.card = cardOfShell(o.id);
    }
    if (o.type === 'move') {
      o.to = slotOf(o.to);
      o.from = slotOf(o.from);
      if (!o.from && o.id) { const i = tubeOfShell(o.id); if (i != null) o.from = { zone: 'tube', i }; }
    }
    return o;
  }

  /* ---------- which controls to spotlight ---------- */
  // Steps that only explain (expect 'next') point at what they explain. A def may name its own
  // selectors in `spot`; otherwise its id/title picks a row here.
  function crateSel() {
    const c = safe(() => G.state.crate, []) || [];
    const k = c.findIndex(Boolean);
    return `#tools [data-crate="${k < 0 ? 0 : k}"]`;
  }
  const SPOT = [
    [/result|ooh|applause|score/i, () => ['#sky-overlay .res-card']],
    [/sky|sees|hang/i, () => ['#rack .t-sees']],
    [/crate|crowd/i, () => [crateSel(), '#hud [data-hud="crowd"]']],
    [/mood|headliner|rain|ready|finish/i, () => ['#firebar .mood', '#hud [data-hud="head"]', '#hud [data-hud="rain"]']],
  ];
  function spotFor(def) {
    if (def && Array.isArray(def.target) && def.target.length) return def.target;
    if (def && Array.isArray(def.spot)) return def.spot;
    const key = ((def && def.id) || '') + ' ' + ((def && def.title) || '');
    for (const [re, f] of SPOT) if (re.test(key)) return f();
    return [];
  }
  // A positioned wrapper much larger than its one visible child (the result card's frame) lights the child instead.
  function tighten(el) {
    const kids = [...el.children].filter(visible);
    if (kids.length !== 1 || el.tagName === 'BUTTON' || [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return el;
    if (safe(() => getComputedStyle(el).position, '') !== 'absolute') return el;
    const a = el.getBoundingClientRect(), b = kids[0].getBoundingClientRect();
    return b.width * b.height < 0.6 * a.width * a.height ? kids[0] : el;
  }
  const els = list => {
    const out = [];
    for (const s of list) {
      if (!s) continue;
      const found = typeof s === 'string' ? safe(() => $$(s), []) : [s];
      for (let el of found) {
        if (!visible(el) || !(el.childElementCount || el.textContent.trim() || el.tagName === 'BUTTON')) continue;
        el = tighten(el);
        if (!out.includes(el)) out.push(el);
      }
    }
    return out;
  };
  // {act: elements the player may use, show: elements lit for reading, avoid: extra rects the callout keeps clear of}
  function view() {
    if (!T.active) return null;
    if (T.watching) return { act: [], show: [], avoid: els(['#sky-wrap', '#rack', '#firebar']), dim: false, phase: 'watch' };
    if (T.hold) return { act: [], show: els(['#sky-overlay .res-card']), avoid: [], dim: true, phase: 'hold' };
    const x = norm(X());
    if (isShowX(x)) return { act: els(['#fire']), show: [], avoid: [], dim: true, phase: 'fire' };
    if ((x.type === 'buy' || x.type === 'upgrade') && !cardEl(x.card) || x.type === 'move' && !(x.from && tubeEl(x.from.i))) {
      const t = els(spotFor(T.def));      // the step names its own controls
      if (t.length) return { act: t, show: [], avoid: [], dim: true, phase: 'pick' };
    }
    if (x.type === 'buy' || x.type === 'upgrade') {
      const card = cardEl(x.card), tube = tubeEl(x.tube);
      const cards = card ? [card] : $$('#shop [data-card]').filter(b => !b.disabled);
      const held = cards.some(b => b.classList.contains('sel'));
      const tubes = tube ? [tube] : $$('#rack [data-tube]');
      return held ? { act: els([...cards, ...tubes]), show: els(['#rack .tubes']), avoid: [], dim: true, phase: 'drop' }
        : { act: els(cards), show: els(tubes), avoid: [], dim: true, phase: 'pick' };
    }
    if (x.type === 'move') {
      const from = x.from ? tubeEl(x.from.i) : null, to = x.to ? tubeEl(x.to.i) : null;
      const froms = from ? [from] : $$('#rack [data-tube]');
      const held = froms.some(b => b.classList.contains('sel'));
      return held ? { act: els([...froms, to || $$('#rack [data-tube]')].flat()), show: [], avoid: [], dim: true, phase: 'drop' }
        : { act: els(froms), show: els([to]), avoid: [], dim: true, phase: 'pick' };
    }
    if (isLast()) return { act: [], show: els(spotFor(T.def)), avoid: [], dim: true, phase: 'finish' };
    return { act: [], show: els(spotFor(T.def)), avoid: [], dim: true, phase: 'next' };
  }

  /* ---------- DOM ---------- */
  function build() {
    const root = E.root = document.getElementById('tutorial');
    if (!root) return false;
    root.hidden = false;
    root.innerHTML =
      '<svg class="tu-scrim" aria-hidden="true" focusable="false"><defs><mask id="tu-mask" maskUnits="userSpaceOnUse">' +
        '<rect class="tu-m-all" x="0" y="0" width="100%" height="100%" fill="#fff"/><g class="tu-holes"></g></mask></defs>' +
        '<rect class="tu-dim" x="0" y="0" width="100%" height="100%" mask="url(#tu-mask)"/></svg>' +
      '<div class="tu-rings" aria-hidden="true"></div>' +
      '<section class="tu-card" role="group" aria-roledescription="tutorial step" aria-labelledby="tu-title" aria-describedby="tu-text" hidden>' +
        '<i class="tu-tail" aria-hidden="true"></i>' +
        '<header class="tu-head"><span class="tu-prog"><span class="tu-eyebrow">Rehearsal Night</span>' +
          '<span class="tu-dots" aria-hidden="true"></span><span class="tu-count num"></span></span>' +
          '<button type="button" class="tu-skip" data-tu="skip" aria-keyshortcuts="Escape">Skip tutorial</button></header>' +
        '<h2 id="tu-title" class="tu-title"></h2>' +
        '<p id="tu-text" class="tu-text"></p>' +
        '<p class="tu-note" hidden></p>' +
        '<div class="tu-actions" hidden>' +
          '<button type="button" class="btn tu-show" data-tu="show" hidden>Show me</button>' +
          '<button type="button" class="btn tu-alt" data-tu="back" hidden>Start a new run</button>' +
          '<button type="button" class="btn btn-primary tu-next" data-tu="next" hidden>Next</button>' +
        '</div>' +
      '</section>' +
      '<section class="tu-offer" aria-labelledby="tu-offer-t" hidden>' +
        '<p id="tu-offer-t" class="tu-offer-t"><span class="tu-offer-k">New here?</span> Play the 2-minute tutorial</p>' +
        '<div class="tu-offer-b">' +
          '<button type="button" class="btn btn-primary" data-tu="offer-play">Play tutorial</button>' +
          '<button type="button" class="btn tu-offer-no" data-tu="offer-no">No thanks</button>' +
        '</div>' +
      '</section>';
    E.scrim = $('.tu-scrim', root); E.holes = $('.tu-holes', root);
    E.rings = $('.tu-rings', root);
    E.card = $('.tu-card', root); E.tail = $('.tu-tail', root);
    E.dots = $('.tu-dots', root); E.count = $('.tu-count', root);
    E.title = $('.tu-title', root); E.text = $('.tu-text', root); E.note = $('.tu-note', root);
    E.skip = $('[data-tu="skip"]', root); E.show = $('[data-tu="show"]', root);
    E.back = $('[data-tu="back"]', root); E.next = $('[data-tu="next"]', root);
    E.offer = $('.tu-offer', root);
    E.actions = $('.tu-actions', root);
    root.addEventListener('click', onOwnClick);
    window.addEventListener('keydown', gateKey, true);
    return true;
  }

  function onOwnClick(e) {
    const b = e.target instanceof Element ? e.target.closest('[data-tu]') : null;
    if (!b) return;
    const k = b.dataset.tu;
    if (k === 'skip') return skipTutorial();
    if (k === 'next') return onNext();
    if (k === 'back') return finish(true);
    if (k === 'show') return showMe();
    if (k === 'offer-play') return start();
    if (k === 'offer-no') return declineOffer();
  }

  /* ---------- callout content ---------- */
  function renderCard() {
    if (!E.card) return;
    const def = T.def || {}, x = X();
    const n = T.total || defs().length || 1, i = Math.max(0, T.step);
    let dots = '';
    for (let j = 0; j < n; j++) dots += `<i class="${j < i ? 'done' : j === i ? 'now' : ''}"></i>`;
    E.dots.innerHTML = dots;
    E.count.textContent = `${i + 1} / ${n}`;
    E.title.textContent = fill(def.title || '');
    let text = fill((x && x.text) || def.text || '');
    if (T.watching) text = T.satisfied ? 'That was it. Here comes the result.' : 'Watch the sky. Each burst adds its Ooh and Aah.';
    if (T.hold) text = holdText();
    E.text.textContent = text;
    E.note.hidden = !T.nudge;
    E.note.textContent = T.nudge;
    const x0 = norm(x);
    const finishing = isLast() && x0.type === 'next' && !T.watching;
    const isNext = (x0.type === 'next' && !finishing) || T.hold;
    const stuck = !T.watching && (T.stuck || (T.help && !isNext && !finishing && !canDo(x0)));
    E.next.hidden = !(isNext || finishing || stuck);
    E.next.textContent = finishing ? (T.aside ? 'Back to my run' : startLabel()) : 'Next';
    E.back.textContent = startLabel();
    E.back.hidden = !(finishing && T.aside);
    E.show.hidden = !(T.help && !stuck && !T.watching && !T.hold && !isNext && !finishing && canDo(x0));
    E.skip.hidden = finishing;
    E.actions.hidden = E.show.hidden && E.back.hidden && E.next.hidden;
    E.card.dataset.phase = T.watching ? 'watch' : finishing ? 'finish' : isNext ? 'next' : 'do';
    E.card.classList.toggle('tu-ok', !!T.beat);
    E.card.hidden = false;
    T.key = '';   // re-place
    if (testMode()) loop();
  }
  function holdText() {
    const r = T.results[T.results.length - 1], f = T.results[0];
    if (!r) return 'Nice.';
    const fu = X().type === 'fusion' && T.fusion;
    if (fu) {
      const nm = id => safe(() => G.label.shell(id), '') || id;
      const [a, b] = String(fu.key || '').split('>');
      const how = r.pass ? 'beat' : 'against';
      return `${a && b ? `${nm(a)} and ${nm(b)} fused into a ${fu.name}.` : `${fu.name}!`} Applause ${num(r.applause)} ${how} the target of ${num(r.target)}.`;
    }
    if (f && f !== r && r.applause > f.applause) return `Applause ${num(r.applause)}, up from ${num(f.applause)} in your first show.`;
    return `Applause ${num(r.applause)} against a target of ${num(r.target)}.`;
  }
  function startLabel() {
    const runs = safe(() => G.meta.runs, 0) || 0;
    return runs === 0 && !T.aside ? 'Start your first run' : 'Start a new run';
  }

  /* ---------- stepping ---------- */
  function onTutorialEvent(p) {
    if (!p || !p.active) return teardown();
    const step = Number.isInteger(p.step) ? p.step : safe(() => G.tutorial.step, 0);
    const def = p.def || defs()[step] || null;
    const total = safe(() => G.tutorial.total, 0) || (p.total | 0) || defs().length || 1;
    if (!T.active) begin();
    setStep(step, def, total);
  }
  function begin() {
    T.active = true;
    T.results = [];
    T.offerGone = true;
    // "Back to my run" when there is a run to go back to (the core's hasRun). A brand-new player's untouched first
    // run does not count ("Start your first run" makes the same run); any run of a returning player does.
    const t = safe(() => G.tutorial, null) || {}, ta = t.aside != null ? t.aside : t.hasRun;
    const veteran = (safe(() => G.meta.runs, 0) | 0) > 0;
    T.aside = typeof ta === 'boolean' ? ta && (T.asideGuess || veteran) : T.asideGuess;
    E.root.dataset.on = '1';
    document.getElementById('app')?.setAttribute('data-tutorial', 'on');
    E.offer.hidden = true;
    addGates();
    loop();
  }
  function setStep(step, def, total) {
    clearTimeout(T.helpTimer); clearTimeout(T.beat); T.beat = 0;
    // a card or shell still held from the last step is put down
    if (fnIn(UI_PLAY_ref(), 'clearSelection')) safe(() => UI_PLAY_ref().clearSelection());
    T.step = step; T.def = def; T.total = total;
    T.xs = expectsOf(def); T.phase = 0;
    T.satisfied = false; T.fusionSeen = false; T.fusion = null; T.hold = false; T.help = false; T.stuck = false; T.nudge = '';
    T.watching = ui() === 'RESOLVING';
    T.lastFocusPhase = '';
    renderCard();
    armHelp();
    const x = norm(X());
    announce(`Tutorial, step ${step + 1} of ${total}. ${fill(def && def.title || '')}. ${fill((x && x.text) || (def && def.text) || '')}`);
    requestAnimationFrame(() => focusNow(true));
  }
  function nextPhase() {
    T.phase++;
    T.satisfied = false; T.fusionSeen = false; T.fusion = null; T.help = false; T.stuck = false; T.nudge = '';
    T.watching = ui() === 'RESOLVING';
    T.lastFocusPhase = '';
    renderCard();
    armHelp();
    const x = X();
    if (x && x.text) announce(fill(x.text));
    requestAnimationFrame(() => focusNow(true));
  }
  function armHelp() {
    clearTimeout(T.helpTimer);
    const x = X();
    if (!x || x.type === 'next') return;
    T.helpTimer = setTimeout(() => { if (!T.active || T.watching || T.hold) return; T.help = true; renderCard(); }, HELP_MS);
  }
  function goto(i) {
    if (!T.active) return;
    if (i >= T.total) return finish(false);
    if (fnIn(G, 'tutorialGoto')) safe(() => G.tutorialGoto(i));
  }
  // The expectation of the current phase has happened.
  function satisfied() {
    clearTimeout(T.helpTimer);
    T.help = false; T.nudge = '';
    if (T.phase < T.xs.length - 1) {
      T.beat = setTimeout(() => { T.beat = 0; nextPhase(); }, reduced() ? 0 : BEAT_MS / 2);
      E.card && E.card.classList.add('tu-ok');
      return;
    }
    const nd = defs()[T.step + 1];
    const showStep = isShowX(norm(X()));
    // A show that ends the step: hold on its result (with a recap and Next) unless the next step explains it anyway.
    // A fusion show always holds: the next step moves on to other things, and the recap names the fusion.
    if (showStep && nd && (X().type === 'fusion' || (expectsOf(nd)[0] && expectsOf(nd)[0].type !== 'next'))) {
      T.hold = true;
      renderCard();
      announce(holdText());
      requestAnimationFrame(() => focusNow(true));
      return;
    }
    E.card && E.card.classList.add('tu-ok');
    T.beat = setTimeout(() => { T.beat = 0; goto(T.step + 1); }, showStep || reduced() ? 0 : BEAT_MS);
  }
  function onNext() {
    if (!T.active) return;
    const x = norm(X());
    if (isLast() && x.type === 'next' && !T.hold) return finish(!T.aside);
    goto(T.step + 1);
  }
  // Can the current phase's action still be done on the live state? A step's own `do` list wins.
  // Legality is asked of the SIM itself (a step on a copy), so a swap-in (`displace`) counts too.
  function legalNow(a) {
    const st = G && G.state;
    if (!a || !st) return false;
    if (a.type === 'light') return building() && st.phase === 'build';
    if (!building()) return false;
    const ev = safe(() => sim().step(sim().clone(st), a), null);
    return Array.isArray(ev) && !(ev[0] && ev[0].type === 'illegal');
  }
  function actionFor(x) {
    const d = T.def && Array.isArray(T.def.do) ? T.def.do : [];
    const own = d.length === T.xs.length ? d[T.phase] : T.xs.length === 1 ? d[0] : null;   // `do` runs phase by phase
    if (own && legalNow(own)) return own;
    const to = x.tube != null ? { zone: 'tube', i: x.tube } : null;
    let a = null;
    if (isShowX(x)) a = { type: 'light' };
    else if (x.type === 'buy' && x.card != null && to) a = { type: 'buy', card: x.card, to, ...(x.displace ? { displace: x.displace } : {}) };
    else if (x.type === 'upgrade' && x.card != null && to) a = { type: 'upgrade', card: x.card, to };
    else if (x.type === 'move' && x.from && x.to) a = { type: 'move', from: x.from, to: x.to };
    return legalNow(a) ? a : null;
  }
  const canDo = x => !!actionFor(x);
  function showMe() {
    const x = norm(X()), a = actionFor(x);
    if (!a) { renderCard(); return; }
    if (fnIn(UI_PLAY_ref(), 'clearSelection')) safe(() => UI_PLAY_ref().clearSelection());
    if (a.type === 'light') { if (fnIn(G, 'light')) G.light(); return; }
    if (fnIn(G, 'dispatch')) G.dispatch(a);
  }
  const UI_PLAY_ref = () => (typeof UI_PLAY !== 'undefined' ? UI_PLAY : null);

  /* ---------- matching GAME events ---------- */
  function matchSim(x, events) {
    for (const e of events || []) {
      if (!e) continue;
      if (x.type === 'buy' && e.type === 'bought' && (x.card == null || e.card === x.card) &&
        (x.tube == null || (e.to && e.to.zone === 'tube' && e.to.i === x.tube)) && (!x.displace || e.displace === x.displace) && (!x.id || e.id === x.id)) return true;
      if (x.type === 'upgrade' && e.type === 'upgraded' && (x.card == null || e.card === x.card) &&
        (x.tube == null || (e.to && e.to.zone === 'tube' && e.to.i === x.tube))) return true;
      if (x.type === 'move' && e.type === 'moved' && !e.displaced && (!x.to || sameSlot(e.to, x.to)) && (!x.from || sameSlot(e.from, x.from)) && (!x.id || e.id === x.id)) return true;
    }
    return false;
  }
  function onSim(p) {
    if (!T.active || T.reverting) return;
    const a = p && p.action;
    if (!a || a.type === 'light') return;
    const x = norm(X());
    if (!T.hold && !T.watching && !T.beat && (x.type === 'buy' || x.type === 'upgrade' || x.type === 'move') && (matchSim(x, p.events) || sameAsScript())) return satisfied();
    // Anything else is not this step's move: take it back so the script stays on its rails.
    revert();
  }
  // Another way to the same place counts (e.g. the Strobe moved onto the Palm's tube instead of the Palm onto the
  // Strobe's): the state now equals the script's state after this phase's own action.
  function sameAsScript() {
    const S = sim(), d = T.def && Array.isArray(T.def.do) ? T.def.do : [];
    if (!S || !fnIn(S, 'tutorialState') || !fnIn(S, 'hashState') || d.length !== T.xs.length) return false;
    return safe(() => {
      const want = S.tutorialState(T.step);
      for (let k = 0; k <= T.phase; k++) S.step(want, d[k]);
      return S.hashState(want) === S.hashState(G.state);
    }, false);
  }
  function revert() {
    T.reverting = true;
    setTimeout(() => {
      if (fnIn(G, 'canUndo') && G.canUndo() && fnIn(G, 'undo')) safe(() => G.undo());
      else goto(T.step);
      T.reverting = false;
      T.nudge = 'Not that one yet. Follow the glowing ring.';
      if (T.active) { renderCard(); announce(T.nudge + ' ' + E.text.textContent); }
    }, 0);
  }
  function onPresent(ev) {
    if (!T.active || !ev || ev.type !== 'fusion') return;
    const x = X();
    if (x && x.type === 'fusion' && (!x.key || ev.key === x.key)) { T.fusionSeen = true; T.fusion = ev; }
  }
  function onResult(p) {
    const sm = p && p.summary;
    if (T.active && sm) T.results.push({ applause: sm.applause, ooh: sm.ooh, aah: sm.aah, target: sm.target, pass: sm.pass });
    if (!T.active) return;
    const x = X();
    if (!isShowX(x)) return;
    if (x.type === 'fusion') {
      const evs = (p && p.events) || [];
      const fe = evs.find(e => e && e.type === 'fusion' && (!x.key || e.key === x.key));
      if (fe && !T.fusion) T.fusion = fe;
      if (!T.fusionSeen && !fe) {
        T.nudge = 'No fusion this time. Tap Next to go on.';
        T.stuck = true;    // Next becomes the way on
        return;
      }
    }
    T.satisfied = true;
    renderCard();
  }
  function onUi(p) {
    const to = p && p.to;
    if (!T.active) {
      if (to === 'RESOLVING') T.offerGone = true;
      return;
    }
    const was = T.watching;
    T.watching = to === 'RESOLVING';
    if (T.watching) { clearTimeout(T.helpTimer); T.help = false; T.nudge = ''; renderCard(); return; }
    if (was && (to === 'RESULT' || to === 'BUILD')) {
      if (T.satisfied) { T.satisfied = false; satisfied(); return; }
      renderCard();
      if (T.help || T.stuck) return;
      armHelp();
    }
  }

  /* ---------- entry and exit ---------- */
  function closeOverlays() {
    for (let n = 0; n < 8 && topOverlay() && topOverlay() !== 'end'; n++) safe(() => G.close());
  }
  function start() {
    if (!G || !fnIn(G, 'startTutorial')) return false;
    trackRun();
    closeOverlays();
    safe(() => G.startTutorial());
    return true;
  }
  // A run is "set aside" when there is something to go back to: a show already played or a change made.
  function runWorthKeeping() {
    const st = G && G.state;
    if (!st || st.phase !== 'build') return false;
    return (st.show | 0) > 0 || T.runTouched;
  }
  function trackRun() { if (!T.active && G && !safe(() => G.tutorial, null)) T.asideGuess = runWorthKeeping(); }
  function end(o) {
    if (fnIn(G, 'endTutorial')) safe(() => G.endTutorial(o));
    else teardown();
  }
  function skipTutorial() {
    if (!T.active) return;
    const last = isLast();
    end({ startRun: false, done: last });
    setMetaOnce(last ? 'done' : 'skipped');
    focusGame();
  }
  function finish(startRun) {
    if (!T.active) return;
    end({ startRun: !!startRun, done: true });
    setMetaOnce('done');
    focusGame();
  }
  function setMetaOnce(v) {
    const cur = safe(() => G.meta.tutorial, null);
    if (cur === 'done' || cur === v) return;
    if (fnIn(G, 'setMeta')) safe(() => G.setMeta({ tutorial: v }));
  }
  function focusGame() {
    requestAnimationFrame(() => { const f = document.getElementById('fire'); if (f && !topOverlay()) safe(() => f.focus({ preventScroll: true })); });
  }
  function teardown() {
    const was = T.active;
    T.active = false; T.step = -1; T.def = null; T.xs = []; T.hold = false; T.watching = false; T.help = false;
    clearTimeout(T.helpTimer); clearTimeout(T.beat); T.beat = 0;
    removeGates();
    if (E.root) {
      delete E.root.dataset.on;
      E.card.hidden = true;
      E.holes.innerHTML = ''; E.rings.innerHTML = '';
      E.scrim.classList.remove('on');
    }
    document.getElementById('app')?.removeAttribute('data-tutorial');
    T.key = '';
    if (was) { T.runTouched = false; }
    syncOffer();
  }
  function declineOffer() {
    setMetaOnce('skipped');
    T.offerGone = true;
    const hadFocus = E.offer.contains(document.activeElement);
    syncOffer();
    if (hadFocus) focusGame();
  }

  /* ---------- the first-launch offer ---------- */
  function offerWanted() {
    if (!G || T.active || T.offerGone || !fnIn(G, 'startTutorial')) return false;
    const m = G.meta || {};
    // "New here?": only a player who has not finished a run yet, and only until they answer
    if (m.tutorial != null || (m.runs | 0) > 0) return false;
    const st = G.state;
    if (!st || (st.show | 0) !== 0 || st.phase !== 'build' || !building()) return false;
    return !topOverlay();
  }
  function syncOffer() {
    if (!E.offer) return;
    const want = offerWanted();
    if (want === !E.offer.hidden) return;
    E.offer.hidden = !want;
    if (want) { T.offerKey = ''; loop(); }
  }

  /* ---------- input gating (capture phase, before every other listener) ---------- */
  let gatesOn = false;
  const PTR = ['pointerdown', 'mousedown', 'click', 'dblclick', 'auxclick', 'contextmenu'];
  function addGates() {
    if (gatesOn) return;
    gatesOn = true;
    for (const t of PTR) window.addEventListener(t, gatePointer, true);
  }
  function removeGates() {
    if (!gatesOn) return;
    gatesOn = false;
    for (const t of PTR) window.removeEventListener(t, gatePointer, true);
  }
  function overlayEl() {
    const t = topOverlay();
    if (!t) return null;
    const id = { pause: 'pause-menu', tapContinue: 'tap-continue' }[t] || t;
    return document.getElementById(id);
  }
  let allowed = [];
  // The controls in play right now (asked of view() at each event, so a tap never meets last frame's list).
  function liveAllowed() { const v = view(); allowed = v ? v.act : []; return allowed; }
  function isAllowed(el) {
    if (!(el instanceof Element)) return false;
    if (E.card && E.card.contains(el)) return true;
    const ov = overlayEl();
    if (ov && ov.contains(el)) return true;
    if (!T.active) return true;
    if (T.beat) return false;                                // the step is done: nothing more until the next one loads
    if (T.watching) return !!el.closest('#play') && !el.closest('[data-act="pause"]'); // Skip / tap to hurry the show
    return liveAllowed().some(a => a === el || a.contains(el));
  }
  function swallow(e) { e.preventDefault(); e.stopImmediatePropagation(); }
  function gatePointer(e) {
    if (!T.active) return;
    const t = e.target instanceof Element ? e.target : null;
    if (t && isAllowed(t)) return;
    // An open sheet (e.g. Inspect from a long press) closes on an outside tap, as it always does.
    const top = topOverlay();
    if (top && (top === 'inspect' || top === 'showlog') && e.type === 'pointerdown') { safe(() => G.close(top)); swallow(e); return; }
    swallow(e);
    if (e.type === 'click' && !T.watching) pulse();
  }
  // Always on (the offer needs it too): Enter / Space on this module's own buttons is theirs alone, so the
  // play keys (which send Enter to the rack when focus is outside #play) never swallow the native click.
  function gateKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const own = document.activeElement;
    if (E.root && own && own !== document.body && E.root.contains(own) && (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar')) { e.stopImmediatePropagation(); return; }
    if (!T.active) return;
    const k = e.key, top = topOverlay();
    if (k === 'Escape' || k === 'Esc') {
      if (top === 'inspect' || top === 'showlog') return;    // Esc closes the sheet first; the next Esc skips
      if (top) return;
      swallow(e);
      if (isLast()) finish(false); else skipTutorial();
      return;
    }
    if (top) return;                                        // the overlay's own keys (Tap to continue, a sheet)
    const a = document.activeElement;
    if (k === 'Tab') { swallow(e); cycleFocus(e.shiftKey ? -1 : 1); return; }
    if ((k === 'Enter' || k === ' ' || k === 'Spacebar') && a && a !== document.body && isAllowed(a)) return;
    swallow(e);
  }
  function focusables() {
    const own = [E.skip, E.show, E.back, E.next].filter(b => b && !b.hidden && !b.disabled);
    const act = liveAllowed().filter(el => el.tagName === 'BUTTON' && !el.disabled);
    return [...act, ...own.filter(b => b !== E.skip), E.skip].filter(b => b && !b.hidden);
  }
  function cycleFocus(dir) {
    const list = focusables();
    if (!list.length) return;
    const i = list.indexOf(document.activeElement);
    const j = i < 0 ? (dir > 0 ? 0 : list.length - 1) : (i + dir + list.length) % list.length;
    safe(() => list[j].focus());
  }
  function focusNow(force) {
    if (!T.active || topOverlay()) return;
    const v = view();
    if (!v) return;
    const tag = T.step + ':' + T.phase + ':' + v.phase + ':' + T.hold;
    if (!force && tag === T.lastFocusPhase) return;
    T.lastFocusPhase = tag;
    let el = null;
    if (v.phase === 'watch') return;
    if (v.phase === 'drop') el = v.act[v.act.length - 1];
    else if (v.act.length) el = v.act[0];
    if (!el || v.phase === 'next' || v.phase === 'hold' || v.phase === 'finish') el = !E.next.hidden ? E.next : el;
    if (!el) return;
    safe(() => el.focus({ preventScroll: true }));
    if (force && el !== E.next) safe(() => el.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
  }
  function pulse() {
    if (!E.rings) return;
    E.rings.classList.remove('tu-nudge');
    void E.rings.offsetWidth;
    E.rings.classList.add('tu-nudge');
  }

  /* ---------- layout: scrim holes, rings, callout placement (one rAF loop while needed) ---------- */
  // ?test=1 runs no rAF loop (spec §11.6): there, one frame is drawn per change instead (see init).
  const testMode = () => !!(G && G.flags && G.flags.test);
  function loop() {
    if (T.raf) return;
    const tick = () => {
      T.raf = 0;
      if (!E.root) return;
      if (T.active) frameTutorial();
      if (!E.offer.hidden) frameOffer();
      if ((T.active || !E.offer.hidden) && !testMode()) T.raf = requestAnimationFrame(tick);
    };
    T.raf = requestAnimationFrame(tick);
  }
  const rectOf = el => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
  const inflate = (r, p) => ({ l: r.l - p, t: r.t - p, r: r.r + p, b: r.b + p });
  const overlap = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
  const rk = r => `${r.l | 0},${r.t | 0},${r.r | 0},${r.b | 0}`;
  function frameTutorial() {
    const v = view();
    if (!v) return;
    allowed = v.act;
    const lr = E.root.getBoundingClientRect();
    const off = r => ({ l: r.l - lr.left, t: r.t - lr.top, r: r.r - lr.left, b: r.b - lr.top });
    const act = v.act.map(el => off(rectOf(el))), show = v.show.map(el => off(rectOf(el)));
    const avoid = v.avoid.map(el => off(rectOf(el)));
    const cw = E.card.offsetWidth, ch = E.card.offsetHeight;
    const key = [v.phase, v.dim, act.map(rk).join(';'), show.map(rk).join(';'), avoid.map(rk).join(';'), cw, ch, lr.width | 0, lr.height | 0, E.card.dataset.phase].join('|');
    if (key === T.key) return;
    T.key = key;
    // scrim + holes
    const pad = r => inflate(r, 6);
    let holes = '';
    for (const r of [...show, ...act].map(pad)) holes += `<rect x="${r.l}" y="${r.t}" width="${r.r - r.l}" height="${r.b - r.t}" rx="12" ry="12" fill="#000"/>`;
    E.holes.innerHTML = holes;
    E.scrim.classList.toggle('on', !!v.dim);
    // rings: act = strong, show = quiet
    let rings = '';
    const ringHTML = (r, cls) => { const p = pad(r); return `<i class="tu-ring ${cls}" style="left:${p.l}px;top:${p.t}px;width:${p.r - p.l}px;height:${p.b - p.t}px"></i>`; };
    for (const r of show) rings += ringHTML(r, 'show');
    for (const r of act) rings += ringHTML(r, 'act');
    E.rings.innerHTML = rings;
    // callout: keep clear of every lit rect; sit as near as possible to the first control to use
    // unlit shells and cards cost a little to cover, so an equally near spot in the open sky wins
    const soft = v.phase === 'watch' ? [] : $$('#rack .tube, #shop .card').filter(el => visible(el) && !v.act.includes(el) && !v.show.includes(el)).map(el => off(rectOf(el)));
    const keep = [...act.map(r => ({ ...r, w: 12 })), ...show.map(r => ({ ...r, w: 3 })), ...avoid.map(r => ({ ...r, w: 1 })), ...soft.map(r => ({ ...r, w: 0.02 }))];
    const anchor = act[0] || show[0] || avoid[0] || null;
    placeCard(E.card, keep, anchor, lr, v.phase === 'watch');
    if (!T.hold && !T.watching) focusNow(false);
  }
  const H_SHORT = () => innerHeight < 620;
  function insets() {
    const cs = safe(() => getComputedStyle(document.getElementById('app')), null);
    const px = s => parseFloat(s) || 0;
    return cs ? { t: px(cs.paddingTop), b: px(cs.paddingBottom), l: px(cs.paddingLeft), r: px(cs.paddingRight) } : { t: 0, b: 0, l: 0, r: 0 };
  }
  // Scan positions for the card: no overlap with `keep` first, then the smallest distance to `anchor`.
  function bestSpot(w, h, keep, anchor, box, preferBelow, gap = 10) {
    const xs = [];
    const clampX = x => Math.min(Math.max(x, box.l), box.r - w);
    if (anchor) xs.push(clampX((anchor.l + anchor.r) / 2 - w / 2));
    xs.push(clampX((box.l + box.r) / 2 - w / 2));
    if (anchor) { xs.push(clampX(anchor.l - 16 - w)); xs.push(clampX(anchor.r + 16)); }
    let best = null;
    for (let xi = 0; xi < xs.length; xi++) {
      const x = xs[xi];
      for (let y = box.t; y <= box.b - h + 0.5; y += 4) {
        const r = { l: x, t: y, r: x + w, b: y + h };
        let ov = 0;
        for (const k of keep) ov += overlap(r, inflate(k, gap)) * (k.w || 1);
        let d = 0;
        if (anchor) {
          const dx = Math.max(0, anchor.l - r.r, r.l - anchor.r), dy = Math.max(0, anchor.t - r.b, r.t - anchor.b);
          d = Math.hypot(dx, dy) + (preferBelow && r.t < anchor.b ? 40 : 0);
        } else d = Math.abs(y - box.t);
        const score = ov * 4 + d + xi * 6;
        if (!best || score < best.score) best = { x, y, score, ov };
      }
    }
    return best || { x: box.l, y: box.t, ov: 0 };
  }
  function placeCard(card, keep, anchor, lr, watch) {
    const ins = insets(), m = H_SHORT() ? 8 : 12;
    const W = lr.width, H = lr.height;
    const side = W - ins.l - ins.r < 400 ? 12 : 16;
    const w = Math.min(400, W - ins.l - ins.r - 2 * side);
    card.style.width = w + 'px';
    const h = card.offsetHeight;
    const box = { l: ins.l + side, r: W - ins.r - side, t: ins.t + m, b: H - ins.b - m };
    const a = watch && anchor ? { l: anchor.l, r: anchor.r, t: anchor.b, b: anchor.b } : anchor;
    const s = bestSpot(w, h, keep, a, box, false, H_SHORT() ? 6 : 10);
    card.dataset.clash = s.ov > 0 ? '1' : '0';
    card.style.transform = `translate(${Math.round(s.x)}px,${Math.round(s.y)}px)`;
    // the tail points at the control when the card sits right above or below it
    const tail = E.tail;
    tail.className = 'tu-tail';
    tail.style.left = tail.style.top = '';
    if (anchor && !watch) {
      const cx = (anchor.l + anchor.r) / 2 - s.x, cy = (anchor.t + anchor.b) / 2 - s.y;
      if (cx > 22 && cx < w - 22 && s.y >= anchor.b - 2 && s.y - anchor.b < 60) { tail.classList.add('up'); tail.style.left = cx + 'px'; }
      else if (cx > 22 && cx < w - 22 && s.y + h <= anchor.t + 2 && anchor.t - (s.y + h) < 60) { tail.classList.add('down'); tail.style.left = cx + 'px'; }
      else if (cy > 22 && cy < h - 22 && s.x + w <= anchor.l + 2 && anchor.l - (s.x + w) < 60) { tail.classList.add('right'); tail.style.top = cy + 'px'; }
      else if (cy > 22 && cy < h - 22 && s.x >= anchor.r - 2 && s.x - anchor.r < 60) { tail.classList.add('left'); tail.style.top = cy + 'px'; }
    }
  }
  function frameOffer() {
    if (!offerWanted()) { syncOffer(); return; }
    const sky = document.getElementById('sky-wrap');
    if (!sky || !visible(sky)) return;
    const lr = E.root.getBoundingClientRect(), sr = sky.getBoundingClientRect();
    const box = { l: sr.left - lr.left + 12, r: sr.right - lr.left - 12, t: sr.top - lr.top + 8, b: sr.bottom - lr.top - 8 };
    const obst = $$('#sky-overlay .sky-top, #sky-overlay .tip, #sky-overlay .info, #sky-overlay .legend, #sky-overlay .result, #sky-overlay .lastchance, #sponsor, #toasts > *')
      .filter(visible).map(el => { const r = el.getBoundingClientRect(); return { l: r.left - lr.left, t: r.top - lr.top, r: r.right - lr.left, b: r.bottom - lr.top }; });
    const w = Math.min(360, box.r - box.l);
    E.offer.style.width = w + 'px';
    const h = E.offer.offsetHeight;
    const key = [rk(box), obst.map(rk).join(';'), w, h].join('|');
    if (key === T.offerKey) return;
    T.offerKey = key;
    // Prefer the low sky (just above the rack), clear of the tips and labels up top.
    const anchor = { l: (box.l + box.r) / 2, r: (box.l + box.r) / 2, t: box.b, b: box.b };
    const s = bestSpot(w, h, obst, anchor, box, false);
    E.offer.style.left = Math.round(s.x) + 'px';
    E.offer.style.top = Math.round(s.y) + 'px';
    E.offer.dataset.crowded = s.ov > 0 ? '1' : '0';
  }

  /* ---------- init ---------- */
  function init(game) {
    G = game;
    if (!G || !build()) return;
    const on = (n, f) => { if (fnIn(G, 'on')) G.on(n, x => { try { f(x); } catch (e) { if (G.flags && (G.flags.debug || G.flags.test)) console.warn('[tutorial]', n, e); } }); };
    on('tutorial', onTutorialEvent);
    on('sim', p => { if (!T.active && p && p.action && p.action.type !== 'light') T.runTouched = true; trackRun(); onSim(p); });
    on('present', onPresent);
    on('result', onResult);
    on('ui', onUi);
    on('runStart', p => { if (!T.active && !safe(() => G.tutorial, null) && !(p && p.restored)) T.runTouched = false; trackRun(); syncOffer(); });
    on('meta', syncOffer);
    on('overlay', () => { syncOffer(); if (T.active) T.key = ''; });
    on('change', () => { if (!T.active) { trackRun(); syncOffer(); } });
    on('resize', () => { T.key = ''; T.offerKey = ''; });
    on('settings', () => { T.key = ''; T.offerKey = ''; });
    if (testMode()) {
      // no loop under ?test=1: draw one frame after anything that can move the layout
      const once = () => { if (T.active || (E.offer && !E.offer.hidden)) loop(); };
      for (const n of ['change', 'ui', 'overlay', 'resize', 'settings', 'tutorial', 'sim', 'result']) on(n, once);
      for (const t of ['click', 'keyup', 'pointerup']) window.addEventListener(t, once);
    }
    // A tutorial already running (a module initialised late) picks up where the core is.
    const cur = safe(() => G.tutorial, null);
    if (cur && Number.isInteger(cur.step)) onTutorialEvent({ active: true, step: cur.step, def: defs()[cur.step] });
    // the offer waits for the first render of the play screen
    requestAnimationFrame(syncOffer);
  }

  return {
    init,
    start,
    get active() { return T.active; },
    // read-only snapshot for harnesses: the step, its phase and what completes it
    state: () => ({ active: T.active, step: T.step, phase: T.phase, expect: T.active ? X() : null, watching: T.watching, hold: T.hold, help: T.help }),
    skip: skipTutorial,
  };
})();
