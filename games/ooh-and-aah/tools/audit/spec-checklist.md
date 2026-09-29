# Ooh × Aah: spec checklist

Every testable requirement of `DESIGN.md` (v1.1) and `src/CONTRACT.md`, grouped by the module that owns it (CONTRACT ownership table). Each row gives the spec section and how it is verified.

**How to run the automated part**

```
node tools/build.mjs                              # rebuild index.html first
node tools/audit/spec-audit.mjs                   # everything (node + Chromium), ~1 min
node tools/audit/spec-audit.mjs --no-browser      # node only (spec, data, golden, trace, sim, static), ~3 s
node tools/audit/spec-audit.mjs --only data,golden,trace --verbose
node tools/audit/spec-audit.mjs --bots 200        # also run the §12.2 bot suites (slow)
```

Output: one line per check (`PASS|FAIL|WARN|SKIP id §ref [owner] title — summary`), then indented details: each mismatch names the field, the spec value, the actual value and the DESIGN.md line. A JSON report goes to `tools/audit/out/spec-audit.json` and layout screenshots to `tools/audit/out/shots/`. The exit code is 1 when any check fails.

**Methods**

| Method | Meaning |
|---|---|
| **AUTO** `id` | Checked by `tools/audit/spec-audit.mjs`; `id` is the check id it prints. |
| **HARNESS** `tool` | Checked by another tool in `tools/` (named); not duplicated here. |
| **VISUAL** | Needs a human looking at the running page or the screenshots in `tools/audit/out/shots/`. |
| **MANUAL** | Needs a human playing, listening or using a real device. |

---

## spec (DESIGN.md itself)

The parser must read every content table before anything can be compared, so the audit starts by checking the spec.

| § | Requirement | Method |
|---|---|---|
| §4.1–§4.13, §5.1, §1, §11.8 | Every content table parses with the expected row count (34 shells, 25 patterns, 12 fusions, 5 rigs, 13 Headliners, 5 kits, 3 Sponsors, 8 Renown, 10 milestones, 14 lessons, 16 tooltips, 7 colours, 24 targets, 29 glossary terms, 3 rules-card lines, 8 festivals, 30 goldens, 3 traces) | AUTO `spec.parse.*` |
| §4, §11.8 | Every shell name, unlock name, kit rack cell and golden tube token resolves to an id | AUTO `spec.parse.integrity` |
| §4.3 | 22 shells have Unlock = start | AUTO `spec.self.startpool` |
| §4.2 | Every ★1 card text is ≤ 64 characters | AUTO `spec.self.cardtext64` |
| §4.2 | Shell and fusion params use only §4.2 vocabulary keys | AUTO `spec.self.vocab` |
| §5.1 | The target table equals bases × (1, 1.3, 1.8) rounded to 2 s.f. (shows 2, 3, 24 fixed) | AUTO `spec.self.targets2sf` |
| §1, §5.1 | Festival names agree between §1 and §5.1 | AUTO `spec.self.festivals` |
| §5.3 | Twin-upgrade examples equal ceil(1.5c) / 2c of the row cost | AUTO `spec.self.upgradeprices` |
| §4.4 | Every shell has a burst pattern | AUTO `spec.self.patterns` |
| §4.7 | Every festival F1–F7 has an eligible Headliner | AUTO `spec.self.headlinerwindows` |
| §6 vs §3.3 | The §6 mood examples agree with the §3.3 bucket thresholds | AUTO `spec.self.mood6` |
| §11.7 vs §11.4 | Shapley results "sum to the Applause" (§11.7) vs "{tube→share}" (§11.4): ambiguous | AUTO `sim.invariants` (reported as WARN) |

## sim (src/sim.js, tools/test-sim.mjs)

### API and data

| § | Requirement | Method |
|---|---|---|
| §11.4, CONTRACT | `OOH` exposes createState, step, legalActions, rulesFor, resolveShow, previewChips, mood, matchPerm, favourite, shapley, clone, hashState; the CONTRACT helpers target, fireOrder, seesPerTube, payoutPreview, nearMiss, lessonFor, milestoneProgress, fmt, describeShell, dailySeed, runBots; `bots.{random, donothing, greedy, greedyMood, novice, human, oracle, mono}`; the DATA tables | AUTO `data.api` |
| CONTRACT | `OohSim` is self-contained (no outer references) so a Blob Worker can be built from its source | AUTO `data.api` (heuristic), `flags.sim`, `hooks.runBots` |
| §4.3 | 34 shell rows: name, monogram, colour, rarity, cost, Hang, earliest festival, unlock, params, shots, wildColour, tags, ★1 card text, pattern | AUTO `data.shells` |
| §4.4 | 25 burst patterns: n (incl. 8→32, 3×36, 10×10, 5×14, 36+24), speed, gravity, drag, life, trail, twinkle, special | AUTO `data.patterns` |
| §4.5 | 12 fusions: A → B key, name, bonus params, unlock, first festival, order | AUTO `data.fusions` |
| §4.6 | 5 rigs: name, cost, glyph, effect, unlock; table order (the rig roll indexes it) | AUTO `data.rigs` |
| §4.7 | 13 Headliners: name, window, rule, counters, telegraph; table order (drives the draw) | AUTO `data.headliners` |
| §4.10, §5.10 | Twist pools: Renown 2 Twilight {headwind, drizzle, critic}; Afterparty 8 twists in listed order | AUTO `data.twists` |
| §4.8 | 5 kits: name, starting rack with colours, coins, Crowd, constraint text, unlock; salvo 2 cards, chemist no rigs, market interest cap 2 + shop before show 1, showman no Sponsors | AUTO `data.kits` |
| §4.9 | Sponsor kinds (order = rng index), flavour names, rewards | AUTO `data.sponsors` |
| §4.10 | Renown 1–8 modifier text; Countdown target 900,000 at Renown 8 | AUTO `data.renown` |
| §4.11 | 10 milestones: name, condition, goal, unlocked shells and kits; every locked row points at its milestone | AUTO `data.milestones` |
| §4.12 | 14 lessons in priority order: predicate and text | AUTO `data.lessons` |
| §4.13 | 16 tooltips: id, trigger, text | AUTO `data.tooltips` |
| §4.1 | Colour table: name, chemical, glyph, shape, role, default and high-contrast hex; Rainbow wedges | AUTO `data.colours` |
| §5.1, §5.10 | TARGETS (24), bases, show multipliers, Afterparty targets (12) | AUTO `data.targets` |
| §1, Fiction | Festival names (8, then Afterparty I–IV) and show names | AUTO `data.names` |
| §1 | Glossary (29 terms) and the 3-line rules card | AUTO `data.glossary`, `data.rulescard` |
| §5.6 | Rarity weights per festival | AUTO `data.rarity` |
| §4.3, CONTRACT | `describeShell(id, col, ★1)` equals the §4.3 card text; ★2 doubles the numbers | AUTO `sim.helpers` |

### Rules

| § | Requirement | Method |
|---|---|---|
| §3.1, §4.2, §11.8 | `resolveShow` reproduces all 30 golden rows (33 variants), including Ooh × Aah where given | AUTO `golden.resolver` |
| §3.3, §11.8 | `matchPerm`: reverse under windshift; odd then even under crossed; identity otherwise; the Match property test (880 / re-seated orders) | AUTO `golden.match` |
| §3.3 | `favourite`: largest drop, ties leftmost, empty rack → null | AUTO `sim.favourite` |
| §3.3, §6 | `mood`: Restless < 0.85 ≤ Hopeful < 1.25 ≤ Eager; the §6 show-3 Headwind scores 276 / 162 / 126 / 132 | AUTO `sim.mood` |
| §3.3 | `previewChips` returns local facts only, never the total | AUTO `sim.helpers`, `hooks.preview-mood-shapley` |
| §3.3, §8.4 | `fireOrder` follows the rule (windshift reverses) | AUTO `sim.helpers` |
| §2, §4.7, §4.10 | `rulesFor`: the posted Headliner on k = 2, the Countdown at show 24, `countdown3` at Renown 8, `rival` at Renown 7–8, Renown 2 Twilight twists from F2 | AUTO `sim.rulesFor` |
| §5.1 | `target`: Renown 1 Headliners ×1.25 (not the Countdown), Renown 8 Countdown 900,000, Fair Weather ×0.75, Sponsor ×1.5, rounded, in that order | AUTO `sim.target` |
| §5.2 | Payout: shell coins and Crowd always; on a pass interest min(cap, floor(coins/5)), base $4/$6, Sponsor reward, Crowd +1, +2 at a Headliner, +2f on an Encore; nothing else on a miss | AUTO `trace.*` (every show line compares coins and Crowd after payout) |
| §5.3, §4.10 | Prices: tubes $6/$10 (+$4 at Renown 4), max 6; reroll $1 +$1 (Renown 3 from $2); sell max(1, floor(0.75 × paid)); upgrade ceil(1.5c) / 2c from the row cost; cards +$1 at Renown 5 | AUTO `sim.prices` |
| §5.4, §4.10, §7.4 | First miss spends the rain check; second miss loses; Renown 6 has no rain check; a Countdown miss loses; Fair Weather relights the Countdown once | AUTO `sim.losing` |
| §5.5, §5.6, §5.7 | Shop generation: RNG order, card count, distinct ids, unlocked rows with fest ≤ f, rarity weights, wild colour rolls, pity, Collector card, rig card from F2, Sponsor roll only F3+ Twilight/Evening | AUTO `trace.*` (exact RNG order), `sim.shop` (properties over 40 seeds) |
| §5.6, §6 | First-ever-run overrides: show-2 shop Crossette (G) $5 / Palm (R) $3 / Comet (G) $3; first F2 shop Salute / Palm / Salute + Comet | AUTO `sim.firstRun` |
| §4.7, §6 | First-ever run uses seed `first-show`, Apprentice, Headwind at F1 | AUTO `sim.firstRun`, `page.rest` |
| §4.8 | Kits at createState (rack, coins, Crowd); the best show-1 arrangement scores 150 / 270 / 220 / 192; salvo shops show 2 cards; chemist never sees a rig; showman never sees a Sponsor; market has a show-0 shop | AUTO `sim.kits` |
| §4.8 | Night Market passes show 1 after buying any one card (0 failures in 1,000 seeds, min 210) | HARNESS `tools/test-sim.mjs` |
| §7.3 | Keepsake starts in Crate slot 1 at ★1 with its colour | AUTO `sim.keepsake` |
| §5.10 | Afterparty after a win: `endless` legal, two distinct twists per Headliner from the pool, Afterparty targets, no Sponsor, shop every show | AUTO `sim.afterparty` |
| §5.10 | The Afterparty ends at the first miss or after show 36; records shows cleared and best Applause | MANUAL (needs a full winning run; see `tools/humanplay.mjs`) |
| §2.5 | Every action's legality rule; illegal → `[{type:'illegal', reason}]` with state unchanged | AUTO `sim.illegal`, `sim.legalActions` |
| §2.5 | `legalActions` order: light, sponsor, buy, upgrade, buyRig, buyTube, move, sell, reroll, match, restore, setColour; never empty in build | AUTO `sim.legalActions` |
| §2.5 | Restore: shells return to their last-lit tubes by uid; displaced shells fill empty tubes, then the Crate | HARNESS `tools/test-sim.mjs` |
| §11.4 | State fields and types (v, seed, rng[4], kit, renown, …, runStats) | AUTO `sim.createState` |
| §11.3 | RNG is the exact sfc32/cyrb128 code, seeded with 15 discards; createState calls it 7× (+7 at Renown 2); Headliner draw = eligible rows in table order | AUTO `sim.rng`, `trace.*` (final rng state) |
| §11.3 | No Math.random / Date.now in the SIM | AUTO `sim.determinism` (runtime trap), `static.sim-purity` (source scan) |
| §11.3, §11.7 | Same seed + same actions → same hash; `hashState` is hex over canonical (key-sorted) JSON; `clone` is deep | AUTO `sim.determinism` |
| §9, §11.4 | Events use §9 names with their fields and a strictly increasing `seq` | AUTO `sim.events` |
| §11.7 | No NaN/Infinity, Applause < 1e300, ≤ 6 tubes, integer coins ≥ 0, legalActions non-empty, Shapley sums | AUTO `sim.invariants` |
| §11.7 | `resolveShow` 6-tube Countdown ≤ 0.2 ms; `step` ≤ 2 ms | AUTO `sim.invariants` (WARN when over) |
| §11.8 | The three seed-level traces (Script B): Headliners, twists, shop, Sponsor, rack, rules, Applause/target, coins and Crowd per show, final RNG state | AUTO `trace.golden-1`, `trace.golden-2`, `trace.golden-3` |
| §7.4 | `dailySeed` = `daily-YYYY-MM-DD` | AUTO `sim.dailySeed` |
| §8.5 | `fmt`: 8,100 · 12K · 1.2M · 3.4B · 1.23e12 | AUTO `sim.fmt` |
| §4.12 | `lessonFor` predicates, first match wins, fields filled from the run log | HARNESS `tools/test-sim.mjs`; AUTO `sim.helpers` (text is a §4.12 row) |
| §4.11, §7.2 | Milestone progress on SIM events (also in lost runs); unlocks apply to the next run | HARNESS `tools/test-sim.mjs`; MANUAL on the end screen |
| §8.6 | `nearMiss`: best arrangement (≤ 720 permutations) and single actions; smallest passing change; Headliner cost; chunked in 8 ms slices, done in 1 s | HARNESS `tools/test-sim.mjs` |
| §8.6 | Shapley: exact over tubes + Crowd, 2^(n+1) resolves, clamp negatives, renormalise | AUTO `sim.invariants` (sum, no negatives); HARNESS `tools/test-sim.mjs` |
| §12.1, §12.2 | Bot definitions and the balance gates | AUTO `bots.gates` (with `--bots N`); HARNESS `tools/test-sim.mjs`, `tools/balance/analyze.mjs` |

## core (src/core.js)

| § | Requirement | Method |
|---|---|---|
| §6, §11.2 | First load opens straight into the show 1 build (no menu), no page errors | AUTO `page.boot`, `page.rest` |
| CONTRACT | `GAME` fields and methods; `GAME.settings` keys | AUTO `page.globals` |
| §11.6 | `window.__game` hooks: reset, act, step, state, legalActions, events, hash, setPaused, config, resolve, preview, mood, shapley, skipAnimations, runBots, meta, setMeta | AUTO `hooks.present` |
| §11.6 | `config` = {version, TARGETS, SHELLS, FUSIONS, RIGS, HEADLINERS, KITS, RENOWN, MILESTONES} | AUTO `hooks.config` |
| §11.6 | `state()` is a clone; `reset(seed)` restarts; `act` returns events; `events()` drains; `step(n)` in test mode; `hash()` deterministic | AUTO `hooks.reset-state`, `hooks.act-events`, `hooks.determinism` |
| §11.6 | `resolve` reproduces goldens in the page; `preview`, `mood`, `shapley(i)`, `skipAnimations`, `setPaused` | AUTO `hooks.resolve`, `hooks.preview-mood-shapley` |
| §11.6 | `meta()` / `setMeta()`; `runBots({bot, n})` → summary through a Worker | AUTO `hooks.meta`, `hooks.runBots` |
| §11.6 | `?test=1` no rAF loop, instant; `?seed=`; `?kit=`; `?renown=`; `?unlock=all`; `?fresh=1`; `?debug=1` overlay (frame ms, SIM ms, particles, entities, hash); `?sim=N&bot=` JSON to console and `<pre>` | AUTO `flags.test`, `flags.seed`, `flags.kit`, `flags.renown`, `flags.unlock`, `persist.fresh`, `flags.debug`, `flags.sim` |
| §7.5 | Key `oohxaah.v1`; schema {v, settings, meta, run:{state, uiSeed}}; run saved after every light | AUTO `persist.save`, `static.storage` |
| §7.5 | Reload restores the run straight into its build | AUTO `persist.restore` |
| §7.5 | Invalid or wrong-version storage is replaced with defaults; the game runs with no storage | AUTO `persist.corrupt`, `persist.no-storage` |
| §11.2, §7.5 | Every localStorage access inside try/catch | AUTO `static.storage` |
| §11.5 | visibilitychange / blur: pause, save, suspend audio; resume only through "Tap to continue" | AUTO `persist.lifecycle` |
| §11.5 | rAF loop with DT = 1/60, 0.25 s clamp, ≤ 8 steps, accumulator reset | AUTO `static.loop` (source); MANUAL for behaviour under throttling |
| §11.5 | Input buffered 120 ms during RESOLVING | MANUAL |
| §2.5 | Undo is a clone stack, cleared on reroll and light | AUTO `ui.buy-undo` (undo of a buy); HARNESS `tools/playtest.mjs` |
| §8.1 | ResizeObserver picks Regular ≥ 700 / Compact < 700 / scroll < 520 / desktop (`#app[data-layout]`) | AUTO `layout.*` |
| §11.2 | No alert / confirm / prompt | AUTO `static.dialogs`, `ui.no-dialogs` |
| §13 | Keyboard routing: top overlay scope → play → global; Esc closes the top overlay or opens pause | AUTO `ui.keys` |
| §7.4 | Fair Weather labelled on the HUD umbrella, end screen and records; blocks Renown progress | MANUAL |
| §7.4 | Daily Show after the first win (seed daily-YYYY-MM-DD, Apprentice, Renown 0) | MANUAL (needs a win) |
| §9 | Haptics via `navigator.vibrate` behind the setting, patterns per §9; off by default on desktop | MANUAL (real device) |

## play (src/ui-play.js, play.css)

| § | Requirement | Method |
|---|---|---|
| §6, §11.2 | At rest: target 100, 3-shell rack + empty T4, "Light the fuse", Headwind poster chip, sky painted | AUTO `page.rest`; VISUAL `out/shots/layout-360x740.png` |
| CONTRACT | DOM hooks: `button[data-tube]`, `button[data-crate]`, `button[data-card]`, `[data-act=…]`, `#hud-*`, `#fire` | AUTO `page.dom`, `page.dom-f2` |
| CONTRACT, §2.5 | Tap a card then a tube buys into that tube; drag works too | AUTO `ui.buy-undo` (tap); HARNESS `tools/playtest.mjs` (drag) |
| §6 | Light → resolution → next build: $8, Crowd 1, curated show-2 shop at $3 | AUTO `ui.fire` |
| §8.1 | Workshop row hidden in F1; rig card, Add tube, Reroll from F2 | AUTO `page.dom-f2` |
| §8.1 | Match disabled unless tonight's rule permutes the fuse; tools have aria-labels | AUTO `ui.tools` |
| §8.1 | Play column min(100%, 480 px), 16 px gutters, no horizontal overflow, Light the fuse never clipped (sticky in scroll mode) | AUTO `layout.*` |
| §8.1, §13 | Every tap target ≥ 44 × 44 px (probing the 44 px square for pseudo-element hit areas); every text ≥ 16 px | AUTO `layout.*`; HARNESS `tools/audit/a11y.mjs` |
| §8.1 | Row heights (Regular 60/0-40/1fr/132/52/124/48/56; Compact 44/1fr/120/48/96/44/48), sky min 140 / 96 | AUTO `layout.*` (sky minimum); VISUAL for exact rows |
| §8.1 | Shop cards: 3 cards 104 × 120 (Regular) / 104 × 96 (Compact); 4 cards as a 2 × 2 grid; one badge (Fuses, Twin ★2 $5, Collector, Pity) | VISUAL; HARNESS `tools/audit/a11y.mjs` |
| §8.1 | Sponsor strip "Sponsor ×1.5 → 645 · pays +$2 [Accept]" as a 44 px toggle; flavour in aria-label | VISUAL; HARNESS `tools/playtest.mjs` |
| §8.1 | Info card docks at the sky bottom while a card or tube is selected (68 / 48 px) | VISUAL |
| §8.1 | During RESOLVING the lower rows slide away and Fire becomes "Skip ▸▸" | VISUAL; MANUAL |
| §8.4 | Fire-order numerals (ranges for multi-shot, ★ LAST, two rows for the Countdown); "sees N" chips via previewChips | AUTO `ui.tube-labels` (fires / sees in aria-labels); VISUAL |
| §8.4 | Holding a shell shows local chips and a canopy arc, never totals; "Partners only" shows only badges | VISUAL; MANUAL |
| §8.4 | Mood pill = word + pose, recomputed after every action; hidden in shows 1–2 of the first-ever run | AUTO `sim.mood` (value); VISUAL (pill) |
| §8.4 | ♛ badge recomputed after every build action | VISUAL |
| §8.4 | Rehearse (H) previews the next Headliner and its telegraph; auto-on during a Headliner build | MANUAL |
| §4.7 | Headliner telegraphs drawn on the rack (dud hatch, crossed Hang pips, monocle, hatched tube 6, fog band, ½ badges, reversed arrow, lamp glyph, cap tick, Countdown rows) | VISUAL (per Headliner) |
| §5.4 | Critical state cues: red cracked umbrella, red rim, red ember; "Last chance" banner + pulse + heartbeat only on the listed builds | VISUAL; MANUAL |
| §13 | Tube aria-label "Tube 3: Palm, Red circle, star 1, Hang 2, rig Brass, fires 3rd of 6, sees 2" (+ crowd favourite / half strength / washed out) | AUTO `ui.tube-labels` |
| §13 | Keyboard map: arrows / WASD cursor, Enter / Space pick and drop, 1–4, G, T, X, Backspace sell (2-press), C, M, B, U/Z, H, I, F, Space while resolving | AUTO `ui.keys` (1, F); HARNESS `tools/playtest.mjs --flow=keys` |
| §13 | #live-polite messages for build open, purchases and results | AUTO `ui.tools`, `a11y.basics` |
| §11.5 | touch-action:none, setPointerCapture, pointercancel, isPrimary, 10 px tap slop, 450 ms long-press, contextmenu prevented, overscroll-behavior / user-select / touch-callout / tap highlight | AUTO `static.input` (source); MANUAL on a touch device |

## panels (src/ui-panels.js, panels.css)

| § | Requirement | Method |
|---|---|---|
| §8.1 | Desktop 1440 × 900: left Festival board (320 px) and right Show log (360 px) visible around the 480 px column | AUTO `layout.1440x900` |
| §8.1 | Board: 8 festival rows with targets, posted Headliner cards, current-show marker, sparkline with Applause dots | VISUAL `out/shots/layout-1440x900.png` |
| §8.1 | Show log: one attributed line per burst, fusions, crowd cheer, ♛, Applause; Logbook shortcut | VISUAL; MANUAL |
| §8.1 | On mobile the Show log opens by tapping the Applause on the result card | MANUAL |

## end (src/ui-end.js, end.css)

| § | Requirement | Method |
|---|---|---|
| §8.2, §13 | A lost run opens #end: "The crowd went home: <festival>, show N"; seed, kit, Renown; focus on Run it back | AUTO `end.screen` |
| §8.2, §4.12 | One §4.12 lesson; best show; near-miss line; unlock bars; keepsake picker with None; Replay seed · Kit · Renown · Logbook | AUTO `end.screen` (text presence) |
| §8.2 | R / Enter: Run it back, new random seed, restarts in < 1 s | AUTO `end.screen` |
| §8.2 | Win header "Happy New Year!", Afterparty as the second button | MANUAL (needs a win) |
| §8.2 | Poster (180 px) painted from the final rack, saved to `posters` | VISUAL; AUTO `persist.save` (posters key exists) |
| §8.2 | Log-y Applause chart over a dashed step target line; misses red ×, Headliners ♛, sponsored rings | VISUAL |
| §8.2, §8.6 | Pareto bar chart: per-shell share + Crowd, sorted, cumulative line, 80 % marker | VISUAL |
| §7.3 | Keepsake: Commons from the final rack, else 3 random unlocked Commons; stored in meta.keepsake | MANUAL; AUTO `sim.keepsake` (consumption) |

## menus (src/ui-menus.js, menus.css)

| § | Requirement | Method |
|---|---|---|
| §13 | P pause, L Logbook, ? Help, Esc closes | AUTO `ui.keys` |
| §8.3, §1 | Help: 3-line rules card, glossary, key map | AUTO `ui.help` |
| §8.3 | Settings: sound + volume, music + volume, reduced motion (Auto/On/Off), high contrast, speed 50/75/100 %, instant, haptics, chips, crowd mood, Fair Weather, export / import (in-page text field), reset (inline 2-tap) | AUTO `ui.settings` (labels); MANUAL (2-tap arming, export/import round trip) |
| §8.3 | Pause: Resume (focused), Settings, Logbook, Help, Seed, Abandon (inline 2-tap) | AUTO `ui.keys` (opens); MANUAL (focus, 2-tap) |
| §7.1, §8.3 | Logbook tabs Shells 34 · Fusions 12 · Headliners 13 · Rigs 5 · Kits 5 · Records; silhouettes with milestone progress; "? → ?" / "Salute → ?"; records | HARNESS `tools/playtest.mjs`; VISUAL |
| §13 | Confirmations stay armed until the next input (no timers) | MANUAL |
| CONTRACT | Toasts rendered from `GAME` 'toast' events | VISUAL |

## fx (src/fx.js)

| § | Requirement | Method |
|---|---|---|
| §11.5 | Canvas 2D {alpha:false}; backing store = CSS × min(DPR, 2) via setTransform; ResizeObserver + DPR matchMedia; no shadowBlur; 400-particle pool | AUTO `static.fx` (source); HARNESS `tools/fx-demo.mjs` |
| §4.4 | Burst patterns per the table; pictogram = frozen frame at 45 % of life | HARNESS `tools/fx-demo.mjs`, `tools/gallery.mjs`; VISUAL |
| §9 | Juice map per event: popups sized by tier (16 + 4 × tier, max 40), shake (world only, capped), hit-stop, chain pacing max(110, 420 × 0.86^k) ms ÷ speed, merges, ≤ 12 popups | HARNESS `tools/fx-demo.mjs`; VISUAL |
| §9, §13 | Reduced motion: no shake / zoom / sparks / flashes, 300 ms fixed interval; never more than 3 flashes per second | HARNESS `tools/fx-demo.mjs`; VISUAL |
| §8.5 | Sky gradient, procedural skyline from the seed, river reflection, crowd silhouettes min(160, 6 + floor(14 log2(1 + crowd/4))), soot steps, haze | VISUAL |
| §11.7 | Render ≤ 6 ms on a mid-range phone; no allocations in the particle loop | HARNESS `tools/perf.mjs`; MANUAL (device) |
| CONTRACT | Optional desktop backdrop mirroring bursts at low alpha | VISUAL `out/shots/layout-1440x900.png` |

## audio (src/audio.js)

| § | Requirement | Method |
|---|---|---|
| §11.2, §10 | Audio starts only after a user gesture | AUTO `persist.audio-gesture` |
| CONTRACT, §10 | API never throws, even without WebAudio; every §9 event handled | HARNESS `tools/audio-check.mjs` |
| §10, §9 | Procedural voices per event (crowd vowels, × bell, fusion chord, heartbeat −24 dB, …), music-box line, volumes | MANUAL (listening); HARNESS `tools/audio-check.mjs --levels` |
| §11.5 | Suspended on hide, resumed only through Tap to continue | AUTO `persist.lifecycle` (flow); MANUAL (sound) |

## lead (src/base.css, src/body.html, CONTRACT)

| § | Requirement | Method |
|---|---|---|
| §11.2, §8.5 | Google Fonts @import exactly as specified; serif and sans fallbacks; tabular-nums | AUTO `static.fonts` |
| §11.2 | Base CSS: html box-sizing + height 100 %, inherit, html/body height/margin/background/overflow; never 100vh; #app safe-area padding | AUTO `static.css-base` |
| §8.5, §4.1 | Tokens on :root, repeated under the dark-scheme @media and [data-theme="dark"], high contrast under [data-contrast="high"]; §4.1 colours as tokens | AUTO `static.tokens` |
| §13 | Contrast ≥ 4.5:1; focus ring 3 px `--focus` with 2 px offset; high contrast removes glows and adds outlines | AUTO `a11y.basics` (focus ring, contrast switch); HARNESS `tools/audit/a11y.mjs` (contrast ratios) |
| CONTRACT, §11.1 | body.html holds every contracted container id; live regions with aria-live | AUTO `static.dom`, `a11y.basics` |
| CONTRACT | One global per module with the contracted API | AUTO `page.globals`, `static.modules` |
| §11.2 | No external requests other than Google Fonts | AUTO `static.external`, `page.requests` |

## tooling (src/head.html, tools/build.mjs)

| § | Requirement | Method |
|---|---|---|
| §11.2 | The file starts with the two metas, then `<title>Ooh × Aah</title>`, then `<style>` | AUTO `static.head` |
| §11.2 | No `<!doctype>`, `<html>`, `<head>` or `<body>` tags | AUTO `static.wrappers` |
| §11.1, CONTRACT | ≤ 1,200 KB (warn > 800 KB); the §11.1 150 / 190 KB budget is lifted by CONTRACT | AUTO `static.size` |
| CONTRACT | Assembly order (CSS files, then one script with the modules in order, ending `GAME.boot();`) | AUTO `static.modules` |
| §11.1 | Every Tier 1–3 item ships (CONTRACT: no cuts) | MANUAL (feature walk-through against §11.1) |

## Out of scope (§14)

Nothing to test; §14 lists what must not be built. A reviewer confirms by reading the feature list (MANUAL).
