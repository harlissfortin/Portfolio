# Ooh × Aah tools

Everything here runs on Node 22 with no install step. The browser tools load Playwright from the
global modules (`createRequire('/opt/node22/lib/node_modules/')`) and use the Chromium that is
already on the machine; never run `playwright install`.

The usual loop:

```sh
node tools/build.mjs                      # src/ → index.html, plus the page-contract checks
node tools/test-sim.mjs                   # SIM golden tests, invariants, bots
node tools/playtest.mjs --flow=smoke      # the game boots, plays and ends in a real browser
node tools/playtest.mjs                   # every flow at every viewport (a few minutes)
```

## build.mjs

```
node tools/build.mjs [--src=DIR] [--out=FILE] [--allow-missing] [--force] [--quiet]
```

Assembles `index.html` from `src/` in the order fixed by `src/CONTRACT.md`: `head.html`, the CSS
files (base, play, panels, end, menus) in one `<style>`, `body.html`, then the JS modules (sim,
audio, fx, core, ui-play, ui-panels, ui-end, ui-menus) and `GAME.boot();` in one `<script>`.
Exit codes: 0 PASS (warnings allowed), 1 FAIL, 2 bad usage. On FAIL the output is left untouched
unless `--force` is given. `--allow-missing` builds with absent modules (for early integration).

Checks, in order (spec §11.1 to §11.3):

1. No document-level tags (`<!doctype>`, `<html>`, `<head>`, `<body>`): the artifact host adds them.
2. No `</script>` or `</style>` inside a module that would close the element early.
3. No `alert`, `confirm` or `prompt`.
4. SIM determinism: `Math.random` or `Date.now` in `sim.js` FAILs; `performance.now`, `new Date`
   and `crypto` random sources warn.
5. No external URLs except Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`); network
   APIs are a warning.
6. CSS contract (spec §11.2): `100vh` warns (size the app with `height:100%`), and so does an
   `@import` that is not the first rule of `base.css`.
7. Module shape: each file defines its one contract global (`OohSim`/`OOH`, `AUDIO`, `FX`, `GAME`,
   `UI_PLAY`, `UI_PANELS`, `UI_END`, `UI_MENUS`).
8. No duplicate ids in the static DOM.
9. Syntax: `node --check` per file, then the assembled script compiled as one classic script.
10. Size: warns above 800 KB and fails above 1,200 KB (the lead's override of spec §11.1; see
    CONTRACT.md "Budgets"). The per-module spec budgets are printed for information only.
11. The page starts with the charset meta.

## playtest.mjs

```
node tools/playtest.mjs [--flow=smoke|ui|keys|bots|full] [--viewports=360x740,360x640,375x548,1440x900]
                        [--seed=S] [--shows=N] [--out=DIR] [--json=FILE] [--file=index.html] [--jobs=N]
                        [--fonts=abort|stub|live] [--bots-timeout=MS] [--task-timeout=MS] [--verbose]
```

Loads the built page in headless Chromium, inside an artifact-like host skeleton (a doctype page
with the host's own base styles) and, in the smoke flow, also raw. Prints one PASS/FAIL line per
(flow × viewport) task with its failures and warnings (`--verbose` prints every check), writes one
screenshot per state per viewport to `--out` (default `tools/shots/`, git-ignored) and a JSON
report (default `<out>/report.json`: verdict, totals, machine load, and per run its checks, frame
timings, screenshots and notes). Exits 1 if any check FAILs, 2 on bad usage.

Status levels: **FAIL** breaks the contract or the spec and fails the run; **WARN** is a likely
defect worth a look; **INFO** is context.

### Flows

| Flow | What it does |
| --- | --- |
| `smoke` | Boot; layout audit and screenshot in BUILD; buy three shells through `__game.act`; light the fuse with a real click (screenshots mid-RESOLVING and at RESULT, frame timing); layout audit once the shop is up; one build action must dismiss RESULT → BUILD; then `skipAnimations(true)` and keep lighting until END; check `#end` and its focus, audit and screenshot it. Runs in the host skeleton and raw. |
| `ui` | Pointer only. Each show: tap a card, then a tube (checked in `__game.state()`), Undo (the first time, then sometimes), Reroll, Match when legal, the Sponsor toggle, then `#fire`, sometimes tapping the sky (fast-forward) or Skip. If the run ends early it audits END and clicks Run it back. `--shows` shows (default 6). |
| `keys` | Keyboard only. Lights show 1 with F (there is no shop before show 1), then a Tab walk: every stop needs a visible focus indicator; `#fire`, tubes and cards must be reachable, in the §13 order. P, L, ? and Esc open their overlays, focus moves in and is trapped, Esc closes and restores focus. Then plays `--shows` shows: card + Enter, tube + Enter (or 1–4, then Enter), U, X, F, Space. |
| `bots` | `?test=1&sim=50&bot=human` must print a JSON summary of 50 runs to the console and a `<pre>` without long tasks. Then, per viewport, drives a whole run to END through `__game.act` (checking SIM invariants), checks `#end` and its focus, clicks Run it back (a fresh run in under 1 s, new seed) and replays the action log from `reset(seed)` to the same hash. |
| `full` | All four (the default). |

### Checks

- **Boot:** `#app[data-ui]` reaches `BUILD` within 3 s of navigation; `window.__game` exists and
  exposes the §11.6 hooks (a missing `act`, `state` or `legalActions` is a FAIL).
- **Errors:** no `pageerror`, no `console.error`, no page crash; no request leaves the page except
  Google Fonts (font failures are ignored).
- **Layout** (per state and viewport): no horizontal page scroll and the play column never pans
  sideways; `#fire` fully inside the viewport, at least 44 px tall and not covered (a FAIL in
  BUILD/RESULT); every button, tube, card, crate slot and link offers a 44 × 44 px hit area
  (probed with `elementFromPoint` 21.5 px out from its centre, so a padded `::before` counts);
  no text overflow (text cut off by a clipping ancestor, spilling out of its own box, or off the
  side of the screen: WARN; ellipsis and decoration-only overflow are INFO); text at least 16 px
  (spec §8.1: WARN).
- **Play loop:** `#fire` enters RESOLVING; each show ends in RESULT, BUILD or END and adds one
  entry to `runStats.history`. RESULT counts as a build state: the spec (§2.4) keeps the result
  card up until the first build action and `#fire` stays live, so no flow waits for RESULT → BUILD
  on its own.
- **Performance:** frame deltas (rAF) and long tasks through the first show: p50, p95, max,
  long-task count and longest. WARN when p95 > 34 ms or a long task > 100 ms, unless the machine
  is busy (1-minute load above 1.5 per CPU), in which case the numbers are recorded as INFO.
- **Screenshots:** `<flow>-<viewport>-<variant>-<state>.png`: BUILD, RESOLVING, RESULT,
  RESULT-settled, END, overlays (pause, logbook, help), focus, restart; plus `stuck`, `error` or
  `timeout` when something goes wrong.

### Time limits (nothing waits forever)

- Every Playwright action has a 5 s default (navigation 10 s); every `page.evaluate` is raced
  against 15 s (the bots run gets 60 s), so a hung main thread surfaces as
  `page.evaluate got no answer … during "<step>"` instead of a silent stall.
- Each task has a hard budget: smoke 90 s, ui 180 s, keys 180 s, bots 120 s, the `?sim=50` run
  `--bots-timeout` + 30 s (`--task-timeout` overrides all of them). Over budget, the task FAILs
  with its current step and last `data-ui`, its page is closed, and after a wedged renderer the
  next task starts on a fresh Chromium.
- The suite as a whole has a deadline (sum of budgets / jobs + 60 s). The JSON report is written
  before Chromium is closed.
- Google Fonts requests are aborted by default (`--fonts=abort`), so a font load can never
  stall a check. `--fonts=stub` answers them with empty CSS, `--fonts=live` lets them through.

Typical run times on an idle 4-core box: smoke ≈ 10–25 s per task, ui ≈ 15–50 s, keys ≈ 45 s,
bots ≈ 30 s for the sim plus ≈ 4 s per viewport. `--jobs=N` runs tasks in parallel (frame timings
get noisier).

## Other tools

Each file's header comment has its usage.

| Tool | Purpose |
| --- | --- |
| `test-sim.mjs` | SIM golden tests, unit checks, invariants, timing and the bot suite (spec §11.7, §11.8, §12). |
| `audio-check.mjs` | `audio.js` self-test (no-WebAudio page, levels). |
| `fx-demo.mjs` | `fx.js` self-test on `fx-demo.html` (real sim + fx, no build). |
| `fuzz.mjs` | Seeded UI chaos monkey against the built page. |
| `humanplay.mjs` | Human-proxy playtester. |
| `perf.mjs` | Performance probe in an artifact-like host. |
| `gallery.mjs` | Screenshot contact sheet and filmstrips for review. |
| `audit/a11y.mjs`, `audit/spec-audit.mjs` | Accessibility/layout audit and spec audit. |
| `balance/analyze.mjs` | Balance analyses against the SIM (spec §12). |
| `dev/` | Per-module harnesses and stubs used while the modules were built in parallel. |
