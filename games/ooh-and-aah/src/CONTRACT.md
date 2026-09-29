# Ooh × Aah: module contract

The game ships as one HTML file (`index.html`) assembled by `tools/build.mjs` from the sources in `src/`. Several engineers build these modules in parallel, so this file fixes the file layout, the global names, the cross-module APIs and the DOM ids. The design spec is `../DESIGN.md`. Where the spec and this file disagree on game rules, the spec wins; on module boundaries, this file wins.

## Assembly order

`index.html` =

1. `src/head.html`: the two metas and `<title>Ooh × Aah</title>` (spec §11.2).
2. `<style>` + the CSS files in this order + `</style>`:
   `base.css`, `play.css`, `panels.css`, `end.css`, `menus.css`, `tutorial.css`.
3. `src/body.html`: the static DOM skeleton (empty containers; each module renders into its own container).
4. `<script>` + the JS files in this order, then the line `GAME.boot();` + `</script>`:
   `sim.js`, `audio.js`, `fx.js`, `core.js`, `ui-play.js`, `ui-panels.js`, `ui-end.js`, `ui-menus.js`, `ui-tutorial.js`.

There is one script tag and one shared global scope. Each JS module defines exactly one global const (below) and nothing else at top level.

## Size (lead override of spec §11.1)

Completeness and clarity win over bytes:
- **Do not cut features or tiers to save size.** Every Tier 1, 2 and 3 item in spec §11.1 ships.
- **Do not minify or obfuscate.** Keep the code readable.
- **Budgets:** there is no hard budget below 1,200 KB. `tools/build.mjs` warns above 900 KB and fails only above 1,200 KB.
- **Still avoid bloat.** Share helpers through the contract instead of duplicating them, and keep long text in one table.

## Ownership

| File | Owner | Global |
|---|---|---|
| `head.html`, `tools/build.mjs`, `tools/playtest.mjs` | tooling | — |
| `base.css`, `body.html`, this file | lead (fixed; propose changes in your report) | — |
| `sim.js`, `tools/test-sim.mjs` | sim | `OohSim` (factory) and `OOH` |
| `audio.js` | audio | `AUDIO` |
| `fx.js` | fx | `FX` |
| `core.js` | core | `GAME` |
| `ui-play.js`, `play.css` | play | `UI_PLAY` |
| `ui-panels.js`, `panels.css` | panels | `UI_PANELS` |
| `ui-end.js`, `end.css` | end | `UI_END` |
| `ui-menus.js`, `menus.css` | menus | `UI_MENUS` |
| `ui-tutorial.js`, `tutorial.css` | tutorial | `UI_TUTORIAL` |

Edit only the files you own. If you need something from another module that is not in this contract, code against the most natural extension of the contract, guard it (`typeof X.fn === 'function'`), and list it in your report so the integrator can wire it.

## `OOH` (sim.js)

`function OohSim(){ …; return api }`, then `const OOH = OohSim();`, then `if (typeof module === 'object' && module.exports) module.exports = OOH;`.

`OohSim` is fully self-contained (no outer references), so the page can build a Blob Worker from `OohSim.toString()` for in-page bots.

`api`:
- Everything in spec §11.4: `createState, step, legalActions, rulesFor, resolveShow, previewChips, mood, matchPerm, favourite, shapley, clone, hashState`.
- `DATA`: `TARGETS, SHELLS, FUSIONS, RIGS, HEADLINERS, TWISTS, KITS, RENOWN, MILESTONES, LESSONS, TOOLTIPS, COLOURS` (colour/shape/glyph/monogram table §4.1), `FESTIVALS` and show names, `GLOSSARY`, `RULES_CARD`.
- Pure helpers: `target(state, s)` (with Sponsor/Renown applied), `fireOrder(state, rules)`, `seesPerTube(state, rules)`, `payoutPreview(state)`, `nearMiss(finalPreLight, rules)` (§8.6), `lessonFor(runSummary)` (§4.12), `milestoneProgress(runStats, meta)`, `fmt(n)` (§8.5 number format), `describeShell(id, col, star)` (one-line rule text), `dailySeed(dateString)`.
- `bots`: `{random, donothing, greedy, greedyMood, novice, human, oracle, mono(arch)}`; `runBots({bot, n, seeds, opts}) → summary` (§12).

## `AUDIO` (audio.js)

`const AUDIO = (() => { … })()`.

API: `unlock()` (create or resume the AudioContext; called from the first pointerdown/keydown) · `onEvent(ev)` (every §9 event) · `ui(name, opts)` (`'pluck'` with `{col}`, `'coin'`, `'shuffle'`, `'tick'`, `'chime'`, `'error'`) · `setSettings({sound, soundVol, music, musicVol})` · `setPhase('build'|'resolve'|'paused'|'off')` · `setCrowd(n)` · `suspend()` · `resume()`.

It never throws, even with no WebAudio.

## `FX` (fx.js)

`const FX = (() => { … })()`. The API is documented in a header comment.

- `init(canvas, opts)` · `resize()` · `setOptions({reducedMotion, highContrast, speed})`.
- `setScene({festival, show, crowd, rules, tubes:[{x, soot, shellCol}], haze, cheer})`. `x` is the tube centre in canvas CSS px.
- `play(events, {speed, instant, onPresent(ev), onDone()}) → {fastForward(), skip(), done: Promise}`.
  - Paces the §9 chain.
  - Calls `onPresent(ev)` at the moment each event is shown.
  - With `instant`, it presents everything synchronously.
- `update(dtSec)`, `render()`: called by the core's fixed-timestep rAF loop.
- `pictogram(shellId, col, star, sizePx, opts) → HTMLCanvasElement`: token art for DOM use (§4.1, §4.4).
- `finale()`, `dim()`, `critical(on)`, `stats()`.
- Optional: `attachBackdrop(canvas)`, which mirrors bursts at low alpha on a second full-bleed canvas (desktop).

## `GAME` (core.js)

`const GAME = (() => { … })()`. It owns the SIM state, the loop, the show flow, persistence, meta and the test hooks.

**Read-only fields:**

| Field | Contents |
|---|---|
| `state` | The live SIM state. Treat it as read-only; mutate only through `dispatch`. |
| `meta` | The persistent meta (§7.5 schema): unlocks, Logbook, bests, milestones, Renown, kits, posters. |
| `settings` | The §8.3 settings: `sound, soundVol, music, musicVol, reducedMotion ('auto'\|'on'\|'off'), highContrast, speed (0.5\|0.75\|1), instant, haptics, chips ('full'\|'partners'), fairWeather, mood`. |
| `ui` | `'BOOT'\|'BUILD'\|'RESOLVING'\|'RESULT'\|'END'`. Mirrored to `#app[data-ui]`. |
| `flags` | Parsed URL flags: `{test, seed, debug, sim, bot, kit, renown, unlock, fresh}`. |
| `preview` | `{rules, rehearse}`: the rule set the chips use. `UI_PLAY` sets `rehearse`. |
| `lastRun` | Snapshot for the end screen: `{won, state, history, finalPreLight, seed, kit, renown, bestShow, newUnlocks[], milestoneDeltas[]}`. |
| `reducedMotion` | The resolved boolean. |

**Methods:**

| Method | What it does |
|---|---|
| `boot()` | Parse flags, load storage, init FX and AUDIO, `init(GAME)` every UI module present, create or restore the run, start the loop. |
| `dispatch(action) → events` | Pushes to the undo stack, runs `OOH.step`, emits `'sim'` then `'change'`. On an illegal action it emits `'illegal'`. During RESOLVING a build action is held for 120 ms (spec §11.5): it is applied if RESULT begins within that window, otherwise it expires with `'illegal'` reason `'busy'`; while held, `dispatch` returns `[]`. |
| `undo()` · `canUndo()` | |
| `light()` | Enter RESOLVING, play through FX, emit `'present'` per event and `'result'` at the slam, then go to RESULT → BUILD, or END (emitting `'runEnd'`). |
| `fastForward()` · `skip()` | |
| `newRun({seed?, kit?, renown?, keepsake?, replay?})` · `abandon()` · `enterAfterparty()` | |
| `setSetting(key, value)` · `setMeta(patch)` · `saveNow()` · `exportSave() → string` · `importSave(str) → bool` · `resetProgress()` | |
| `open(name, opts)` · `close(name?)` · `top()` | Overlay stack. Names: `'pause','settings','logbook','help','inspect','end','showlog','tapContinue'`. Opening shows the element (`hidden=false`), traps focus inside it, and restores focus on close. |
| `announce(text, {assertive})` | Writes to `#live-polite` / `#live-assertive`. |
| `toast(text, {kind})` | Emits `'toast'`; `UI_MENUS` renders it. |
| `on(name, fn) → off` · `emit(name, payload)` | |
| `onKey(scope, fn)` | See **Keyboard routing** below. |
| `haptic(pattern)` | Vibrates only if the setting is on and `navigator.vibrate` exists. |

**Emitted events:**

| Event | Payload |
|---|---|
| `'change'` | `{state}` |
| `'sim'` | `{action, events}` |
| `'illegal'` | `{action, reason}` |
| `'present'` | `ev` |
| `'result'` | `{entry, events, summary}` |
| `'ui'` | `{from, to}` |
| `'settings'` | `{key, value, settings}` |
| `'meta'` | `{meta}` |
| `'milestone'` | `{id, value, goal, done}` |
| `'unlock'` | `{kind, id}` |
| `'discover'` | `{kind, id}` (a Logbook entry) |
| `'runStart'` | `{state}` |
| `'runEnd'` | `{won, lastRun}` |
| `'overlay'` | `{name, open}` |
| `'toast'` | `{text, kind}` |
| `'resize'` | `{w, h, layout: 'regular'\|'compact'\|'scroll'\|'desktop'}` |
| `'preview'` | `{rules, rehearse}`: fired whenever `GAME.preview` changes |

**Keyboard routing.** `core.js` owns the one `keydown` listener. For each key it calls handlers in this order and stops at the first that returns `true`:
1. The top overlay's scope (e.g. `'end'`, `'settings'`).
2. `'play'`, only when no overlay is open.
3. `'global'`.

If nothing handled the key:
- Esc closes the top overlay, or opens `'pause'` when none is open.
- The first keydown or pointerdown also calls `AUDIO.unlock()`.

**Test hooks.** `core.js` installs `window.__game` with every spec §11.6 hook and honours every §11.6 URL flag, including the `?sim=` Blob Worker built from `OohSim.toString()`.

## UI modules

Each defines `const UI_X = (() => { …; return { init(game), … } })()`. `GAME.boot()` calls `init` on each module that exists. A module renders into its own containers from `body.html`, subscribes to `GAME` events, and re-renders from `GAME.state` on `'change'`. None of them touches SIM state directly.

| Module | Scope |
|---|---|
| `UI_PLAY` | `#hud`, `#sponsor`, `#sky-overlay` (live readout, result card, info card, mood, Headliner telegraph labels), `#rack`, `#tools`, `#shop`, `#workshop`, `#fire`, `#inspect`. Owns selection and drag state, the §8.4 legibility layer, and the play-scope keys. It also renders the `.mood` button inside `#firebar` and makes the HUD Coins and Crowd tappable buttons (`[data-hud]`) that open one-line sheets. It calls `FX.setScene` with tube centres after each layout or state change. |
| `UI_PANELS` | `#board` and `#showlog` (a desktop side panel; on mobile it opens as the `'showlog'` sheet by tapping the Applause on the result card). |
| `UI_END` | `#end` (the spec §8.2 end screen). Opens on `'runEnd'`; `'end'`-scope keys. |
| `UI_MENUS` | `#pause-menu`, `#settings`, `#logbook`, `#help`, `#toasts`, `#tap-continue`; global keys `P`, `L`, `?`. |

## DOM ids (the Playwright harness relies on these)

- `#app[data-ui]`, `canvas#sky`.
- Shop cards: `button[data-card="0..3"]`. Tubes: `button[data-tube="0..5"]`. Crate slots: `button[data-crate="0|1"]`.
- `#fire` (Light the fuse / Skip).
- `[data-act="reroll"]`, `[data-act="buyTube"]`, `[data-act="buyRig"]`, `[data-act="undo"]`, `[data-act="match"]`, `[data-act="restore"]`, `[data-act="rehearse"]`, `[data-act="sponsor"]`, `[data-act="pause"]`.
- `#hud-coins`, `#hud-crowd`, `#hud-target`, `#hud-show`.
- `#end`, `#run-it-back`, `#pause-menu`, `#settings`, `#logbook`, `#help`, `#inspect`.
- `#live-polite`, `#live-assertive`.

**Interaction model:** tap a card, then tap a tube, to buy into that tube (or upgrade its twin). Drag works too.

## Styling

`base.css` holds:
- the tokens (spec §8.5; one deliberate night look, repeated for the dark-scheme selectors, with high contrast on `:root[data-contrast="high"]`);
- the reset, the fonts and the type scale;
- the `#app` frame, with its mobile column and desktop 3-column grid;
- shared primitives: `.btn`, `.btn-primary`, `.chip`, `.overlay`, `.sheet`, `.card-surface`, `.vh`, focus rings, and reduced motion.

Module CSS files scope every selector under their own containers and use only the tokens from `base.css`; they never redefine tokens.

## Tutorial ("Rehearsal Night")

An optional, interactive tutorial of about 2 minutes. The player plays scripted mini-shows that cannot be failed, with one instruction at a time. It is never a gate: the game still opens straight into play.

**Entry points:**
- A dismissible offer on the first launch ("New here? Play the 2-minute tutorial"). It is shown while `meta.tutorial` is unset, and dismissing it sets `meta.tutorial = 'skipped'`.
- A "Play the tutorial" button in Help.
- A "Tutorial" button in Pause.

**Rules while it runs:**
- It never writes a run save, meta progress, milestones, the Logbook or records, and it queues no first-run tips or toasts.
- The run in progress is set aside in memory and restored on exit. Exit comes from finishing, Skip or Esc.
- Finishing sets `meta.tutorial = 'done'` and offers "Start your first run" (a fresh first run) or "Back to my run".

**SIM (`sim.js`):**
- `DATA.TUTORIAL` is an array of step definitions `{id, title, text, expect}`, one per step, with player-facing text in plain words. `expect` is what completes the step:
  - `{type:'light'}` / `{type:'result'}`
  - `{type:'buy', card, tube}`
  - `{type:'move', to}`
  - `{type:'upgrade', tube}`
  - `{type:'fusion', key}`
  - `{type:'next'}` (the player taps Next)
- `tutorialState(i) → State` builds the exact scripted state for step `i`: rack, Crate, shop cards, coins, Crowd, show index and rules. Every state is a valid SIM state, so `step`, `legalActions`, `previewChips` and `resolveShow` work on it unchanged.
- `tools/test-sim.mjs` plays each step's intended action on `tutorialState(i)` and asserts the expected outcome. For example, the fusion step's swap-in really fuses, and no step can fail its target.

**Core (`core.js`):**
- `GAME.startTutorial()`, `GAME.tutorialGoto(i)` (loads `OOH.tutorialState(i)` as the live state, ui BUILD) and `GAME.endTutorial({startRun})`.
- `GAME.tutorial` is `null` or `{step, total}`.
- It emits `'tutorial'` `{active, step, def}` on every change.
- While the tutorial is active, the show flow works normally (light → FX → RESULT) but never reaches END, and all persistence, meta, tips and toasts are suppressed. `announce()` still works for screen readers.

**UI (`ui-tutorial.js`, `tutorial.css`):**
- It renders into `#tutorial` a coach-mark layer: a callout with the step title and text, progress dots (3 / 8), Next when `expect.type === 'next'`, and "Skip tutorial".
- It spotlights the step's target elements (by the DOM ids above) and dims everything else.
- It gates input: pointer and key events outside the allowed targets and its own controls are swallowed in the capture phase, while Esc (skip) always works.
- It advances when a GAME event matches `expect`.
- It is keyboard-operable, announces each step via `announce()`, moves focus to the target, and honours reduced motion.
- It also renders the first-launch offer. `UI_MENUS` adds the Help and Pause entries (calling `GAME.startTutorial()`).
