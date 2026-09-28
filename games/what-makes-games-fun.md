# What Makes Games Fun: Design Research Brief

This is the research behind the game in this folder. Seven researchers each took one angle: theory of fun, incremental loops, roguelite synergy, systems and emergence, game feel and onboarding, feedback loops and balance, and single-file browser engineering. Their findings were combined into this brief. It ends with the 14-criterion fun rubric that every concept pitch and every build review is scored against.

---


**Scope note.** This brief combines 7 research reports. Most primary pages could not be fetched, so the claims rest on search-result summaries and expert knowledge of the primary texts. Treat every number as a starting value to tune with headless simulation, not as a law.

**Target aesthetics (MDA):**
- Primary: Challenge, Discovery, Expression.
- Secondary: Sensation (juice) and Submission (a calm rhythm that suits mobile).
- Out of scope: Fellowship. Narrative is limited to flavour lines.

**Vocabulary:**
- **action**: one input.
- **round**: build, then resolve, then payout.
- **stage**: 3 rounds, the last of which is a boss.
- **run**: about 8 stages.
- **meta**: everything that carries across runs.

---

## 1. What fun is

**P1. Fun is learning, and boredom means the patterns are used up.**
- Sources: Koster, *Theory of Fun*; Cook, skill atoms and burnout; Juul, emergence vs. progression.
- Rule: every 2–3 rounds the player meets a new pattern (a piece, interaction or rule) that changes what existing pieces are worth. A stretch where only the numbers get bigger is a bug.

**P2. The game atom: act, get readable feedback, update the mental model. Outcomes are hard to predict but easy to explain afterwards.**
- Sources: Koster's atomic theory; Schultz on reward prediction error; Swink, *Game Feel*; Schell's Lens of Surprise.
- Rule: randomize the inputs and resolve them deterministically. Resolve step by step so the result overshoots the player's estimate, and show a breakdown that explains the overshoot.

**P3. Autonomy comes from interesting decisions.**
- Sources: Meier; Schell (dominant strategies, Lens of Triangularity); SDT and PENS (Ryan, Rigby & Przybylski 2006).
- Rule: every round has at least one decision whose options differ *in kind* (now vs. later, safe vs. greedy, generic vs. synergy). The value of each option depends on the current build, and skipping is always allowed.

**P4. Competence and flow need challenge that tracks growing skill, and controls that never get in the way.**
- Sources: Csikszentmihalyi; Chen (flOw); Przybylski et al. 2014 on competence-impeding play.
- Rule: one input type, learnable in under 60 s. Every failure can be traced to a decision. Players tune their own challenge through in-world risk offers, not a menu.

**P5. A positive feedback loop needs an outside counter-force.**
- Sources: LeBlanc (GDC 1999); MDA's Monopoly example; Adams & Dormans (friction, stopping mechanisms, escalation); Salen & Zimmerman.
- Rule: the engine is the positive loop, and it is what ends the run. The counter-force is a fixed geometric target curve plus hard caps on slots or space. Difficulty is **never** computed from the player's current power.

**P6. Curiosity is a gap the player believes they can close.**
- Sources: Loewenstein 1994; Berlyne's inverted U; Lazzaro's Easy Fun; progressive disclosure in Candy Box and A Dark Room.
- Rule: show the unknown as countable silhouettes ("Fusions 7/24"), each 1–2 steps from something the player already knows. Only one new unknown is in play at a time.

**P7. Rewards should inform or generate, never control.**
- Sources: Deci, Koestner & Ryan 1999; Schüll's "machine zone"; Zagal et al. on dark patterns; Bogost's Cow Clicker.
- Rule: every reward is either information (a breakdown, a record) or something new to play with (a verb, a piece). Randomness goes into offers, not payouts. No streaks, energy, FOMO timers, or daily obligations.

**P8. Failure is fun when it is fair, informative and cheap.**
- Sources: Juul, *Art of Failure*; Into the Breach; Tetris ("errors pile up, accomplishments disappear").
- Rule: telegraph threats. Restart takes one tap and under 1 s. The end screen names the near-miss and one lesson. A lost run still feeds the meta.

### Contradictions between researchers, resolved

- **Adaptive vs. fixed difficulty.** The juice and pacing report proposed pressure of about k × the player's recent gain, in the style of Left 4 Dead. The feedback-loop report forbids reading the player's power at all. **Decision: fixed curve.** Adaptive scaling erases the feeling of growth (Oblivion level scaling). Keep Left 4 Dead's *shape* (build, peak, relax) and get adaptivity from risk the player chooses (flOw, elites).
- **Score preview.** LocalThunk leaves it out of Balatro because players would stop watching. Islanders and Into the Breach show exact consequences before commit. **Decision: preview decisions, not payoffs.** Before commit, show exact local effects: this placement adds +X, these neighbours contribute, "fuses with Ember". Resolve the full chain as a timed sequence and show the total only when it lands. If playtesters start skipping the animation because they already know the answer, cut the preview back to partners and direction only.
- **How much juice.** Jonasson & Purho showed juice changes how a game feels. Juul & Begy found no difference in performance or perceived quality, and Kao found extreme juice no better than moderate. **Decision:** moderate juice, arranged in a hierarchy, scaled by log(magnitude), with readability first.
- **The "one more run" mechanism.** The Zeigarnik effect failed replication (Ghibellini & Meier 2025), while Ovsiankina (the tendency to resume an interrupted task) held up. The hook is therefore "I can build a better engine", not anxiety.
- **Output randomness.** Luck be a Landlord uses random resolution and still works, because it has many samples per decision and the player curates the distribution. **Default: input randomness only.**
- **Run length.** Estimates were 3–8, 5–12, 8–15, 15–25 and 45–90 minutes. **Decision:**
  - Losing runs: 3–8 min.
  - Winning run: 12–18 min.
  - First-ever run: ends at 3–5 min.
  - The 45–90 min incremental-style arc belongs to the meta loop, not to a single run.

---

## 2. Anatomy of a loop that builds on itself

### 2.1 Nested loops

Each loop's period is roughly 10× the one inside it (Pecorella).

| Loop | Period | Contents | Feeds |
|---|---|---|---|
| Moment | 1–5 s | Pick, place or trigger, with same-frame feedback | The round's state and score |
| Round | 30–90 s | Build or draft (Easy Fun), then resolve against the target (Hard Fun), then payout | The engine state and currency for the next round |
| Run | 3–18 min | 8 stages × 3 rounds; the last round of each stage is a boss with a rule twist | Codex entries and unlock progress |
| Meta | across runs | Codex, unlock pool, kits, Heat ladder | New *options* for the next run, not power |

At every moment the player should be holding three goals at once:
- Seconds: the next placement.
- Minutes: this round's target, or finishing a fusion.
- Run or meta: an unlock bar, a codex entry, a personal best.

Stagger when these goals complete so they never all resolve together (Meier's "one more turn"; Schell's interest curve).

### 2.2 What must feed into what

1. **Each round's output is the input to the next round's decision**: currency, board state, pieces.
2. **Every new piece changes the value of at least one existing piece**, through tags, adjacency or order. Content is added as new rows in one interaction table, never as bespoke rules.
3. **Additive buckets feed a multiplicative bucket.**
   - Formula: `Score = (ΣBase) × (Σ+Mult) × Π(xMult)`, plus retrigger.
   - Item mix: about 50% additive, about 25% conditional or tag-reading ("+2 Mult per [Fire]"), about 15% xMult, under 10% retrigger or copy.
   - Pure additive stacking grows linearly and feels flat. Unchecked multiplication runs away.
   - Keep xMult rare and tied to commitment (adjacency, order, tag count).
   - Evaluate left to right, so arranging pieces is free depth: 40×((4+4)×2)=640 but 40×((4×2)+4)=480.
4. **A second compounding resource gives engine vs. tempo.** Interest of +1 per 5 coins held, capped at +5, sets up a spend-vs-bank tension every round.
5. **Cashing out should cost something.** As with greening in Dominion, meeting the target should use up stock, lock a slot or carry over only partly. That makes "invest vs. bank" a real decision rather than "number go up".

### 2.3 Progressive reveal

- **Start small.** One verb, at most 3 piece types. Add one element every 2–3 rounds using the kishōtenketsu arc: introduce it alone, develop it, twist it by combining it with an earlier element (this is where the synergy is discovered), then test it.
- **Front-load novelty.** Something new every 20–40 s for the first 5 minutes, then every 2–3 rounds.
- **Review every new layer.** Ask: *what decision exists here that did not exist before?* If the only answer is "a bigger multiplier", cut it (the Paperclips and Cow Clicker lesson).
- **Automate what is mastered.** When a decision becomes rote (for example, reordering), compress it (auto-arrange) and reveal the decision one level up.
- **Complexity ceiling.** At most 3–4 resources and 3–4 active decision surfaces on screen. The rules must fit on a 3-line help card.

### 2.4 Pressure scales alongside power

- **Fixed geometric target curve.**
  - Suggested stage bases: 300, 800, 2000, 4500, 9000, 16000, 28000, 45000.
  - Round multipliers within a stage: ×1, ×1.5, ×2.
  - The steepest jump (×2–2.5 per stage) comes at stages 2–4, when the engine should come online. It then eases to about ×1.5–1.8, so strong builds visibly pull ahead late. Show the next 2–3 targets.
- **Calibration by bots:**
  - Random bot wins 0–5%.
  - Greedy, synergy-blind bot dies around stage 3–4 (wins 15–35% at most).
  - Synergy-aware planner bot wins 60–85%.
- **Stopping mechanisms:**
  - 5 slots, so replacement is forced from mid-run.
  - Reroll cost rises with each use.
  - Each repeat purchase costs ×1.3–1.6 more.
  - Interest is capped.
- **Internal pressure (placement variants):** success uses up space. A tier-k piece costs 3^k base pieces, so the board itself is the life bar.
- **Rule-twisting bosses** every 3rd round, drawn from a pool of about 10 and revealed a full stage ahead. Early bosses are mild; later ones hit the most common archetypes.
- **Sawtooth pacing:** build, peak (boss), release (shop, celebration), then a higher baseline.
- **Decision point:** the round at which the outcome can be predicted with more than 90% accuracy must fall in the last 20–30% of the run.

### 2.5 Ending a run well

- **Fixed arc:** fragile, then competent, then godlike, then a final exam that sits well above the curve.
- **Losses:** a telegraphed critical state (for example, rim turns red and a 3-turn countdown starts). End quickly once the run can't be recovered; there should be no zombie endgame. Allow one last-chance tool per run.
- **Wins:** a clear fiero moment. After it, offer an optional Endless mode where targets grow ×3, ×4, ×5 per stage. The broken engine is the reward, and Endless still always ends.
- **End screen:**
  - The final board or engine, kept as a keepsake.
  - A score-per-round curve, so the compounding is visible.
  - The best single play.
  - The near-miss, and one concrete lesson.
  - Progress toward the next 2 unlocks, plus one silhouette of something not yet seen.
  - A **Run it back** button that already has focus.

### 2.6 Meta that feeds the next run without making it trivial

**Allowed (horizontal):**
- **Unlock pool:** starts at about 20 of 40–50 items and adds 2–3 per milestone. Milestones are teaching achievements, such as "win with 3 xMult items" or "discover a fusion".
- **Codex** of items and fusion recipes. A recipe, once found, becomes something to aim for in later runs.
- **Starting kits:** 3–5, each a constraint plus a bonus (the Brotato pattern).
- **Heat / Ascension ladder:** stacking and opt-in, one modifier per level, unlocked by wins, and never reset by a loss.
- **Keepsake:** start the next run with one item from the last run, at common rarity.

**Forbidden:**
- Permanent stat power. The only exception is a clearly labelled assist mode, like Hades' God Mode or Celeste's Assist Mode.

**Incremental-style prestige** (sqrt payout, multiplicative bonus) trivializes a run-based game. Use it only in archetype C below. Even there, each prestige must unlock a mechanic, and it should be recommended when the gain is at least +50–100%.

### 2.7 Archetypes

**A. Score-attack engine builder** (Balatro, Luck be a Landlord, Slay the Spire)
- Loop: draft 1 of 3 or skip, arrange slots, resolve against the target, shop.
- How it compounds: Chips × Mult buckets, tags, order, interest.
- Main risks: late-run autopilot and a single dominant build.
- Countered by: slot caps, bosses, rarity.

**B. Spatial merge / placement** (Triple Town, Threes, Dorfromantik, Islanders, Tetris, Mini Metro)
- Loop: place the previewed piece drawn from a bag, apply adjacency and merges, let cascades free space, and pay rewards in supply (+N pieces).
- How it compounds:
  - The board is the player's capital.
  - Clusters score superlinearly: joining a cluster of size n scores n, so a cluster is worth n(n+1)/2.
  - A merge result lands on the cell just placed, so players can engineer cascades.
  - A producer tier (for example, a Workshop that upgrades a neighbour each turn) adds leverage without adding a verb.
- Main risk: a dominant heuristic, like 2048's corner strategy.
- Countered by: wandering blockers, one-step movement, rotating contracts.

**C. Paradigm-shift incremental** (Universal Paperclips, Antimatter Dimensions, A Dark Room, Kittens Game)
- Loop: produce, then buy producers.
  - Producer cost: `base·r^owned`, with r = 1.07–1.15.
  - Milestone doublings at 10, 25, 50 and 100 owned.
  - A derivative chain of 3–4 tiers.
  - A breakthrough purchase opens the next system.
- Main risks: dead-time walls and hollow layers.

**Fit for this brief:** A, or a hybrid of A and B (a small grid engine resolved as a sequenced chain against a fixed target, turn-based), scores best on scope, mobile fitness and decisions per minute. C struggles to avoid dead time within short sessions.

---

## 3. Game feel & onboarding rules (checkable)

### Feel

- **F1. Latency.**
  - Acknowledge input on the same frame (under 16 ms); the full effect lands within 100 ms.
  - Use `pointerdown`, not `click`.
  - Buffer inputs for about 120 ms during animations and hit-stop.
  - If the real effect is delayed, show anticipation immediately.
- **F2. One `juice(event, magnitude, x, y)` function.**
  - Tier = floor(log10(value)). Each tier sets scale punch, particle count, shake trauma, hit-stop, pitch and popup size.
  - The top tier (bass thump, flash, fanfare) is reserved for a run-best or a boss clear.
- **F3. Sequenced resolution.**
  - Each trigger highlights or wiggles its source and floats its contribution: white `+12` for additive, gold `×1.5` for multiplicative, red for penalties.
  - Pitch rises one pentatonic step per link.
  - Step interval shrinks from about 180 ms to about 40 ms as the chain grows.
  - Batch identical triggers ("+12 ×5"). Tap to fast-forward. The final total slams in last.
- **F4. Hit-stop.**
  - Durations: 0 ms for common events, 30–60 ms for notable ones, 80–150 ms for rare climaxes.
  - When triggers overlap, take the max, don't add them.
  - Freeze only the simulation, never rendering, UI tweens or input.
- **F5. Shake.**
  - Shake = trauma², with trauma decaying at about 1.5/s. Maximum offset is 1.5–2% of the short screen side, plus up to 2° of rotation. Use smooth noise.
  - Shake the world layer only, never the HUD.
  - Add a directional kick on big impacts.
- **F6. Easing.**
  - Spawns pop in with easeOutBack over 150–250 ms.
  - Impacts squash to 1.25×0.8 and spring back.
  - Counters roll up with exponential smoothing.
- **F7. Popups.**
  - Merge popups within 150 ms and 40 px of each other. Cap at about 12 on screen.
  - Format numbers as 1.2K, 3.4M, then 1.23e45.
  - Keep a persistent `Base × Mult` readout.
- **F8. Audio.**
  - Randomize pitch by ±3–5%.
  - At most 8 voices, with 30 ms de-duplication.
  - A compressor on the master bus.
  - Never use identical repeated samples.
- **F9. Visual hierarchy.**
  - L1, game-critical: highest contrast, never covered.
  - L2: state.
  - L3: decoration, at low alpha, lasting 200–600 ms, drawn behind L1.
  - Pass a squint test on a screenshot taken at the biggest chain.
- **F10. Particle budget.** Pool of 300–400. When over budget, shrink per-event counts; never drop the effects of big events.
- **F11. Permanence.** Leave faint residue of past actions so the board shows how far the run has compounded.

### Onboarding

- **O1.** One tap from load to play. No menu gate, no tutorial screen.
- **O2.** The first action is guaranteed to succeed, with a full juice bundle, within 5–10 s.
- **O3.** The first merge or synergy is possible within 3 moves. The first visible compounding (a chain, or a multiplier above 1) happens by 45–60 s.
- **O4.** The first meaningful 1-of-3 choice comes by about 90 s.
- **O5.** Failure is impossible in the first minute. The first 2 rounds can be won with the starting kit alone. Every engine or economy piece also adds a small Base value so it is never dead on arrival.
- **O6.** Follow the introduce, develop, twist, test arc. Never teach two unknowns at once, and never combine two mechanics before each has been taught alone.
- **O7.** Tooltips are one line, appear only after the player first meets the thing, never block play, and state exact numbers.
- **O8.** The first threat is a "Goomba": slow, readable, and beaten by the verb the player just learned.
- **O9.** The first run ends at about 3–5 min. Its end screen states one concrete lesson ("Chains of 5+ triple your gain").

---

## 4. Pitfalls and mitigations

Ranked by how likely each is in a compounding-loop game.

| # | Pitfall | Tell-tale sign | Mitigation |
|---|---|---|---|
| 1 | Runaway snowball; outcome decided early (Monopoly) | Decision point before the last third; late rounds feel like mop-up | Fixed geometric targets tuned against measured growth; slot, interest and price caps; the broken endgame moves into optional Endless |
| 2 | Number inflation without new patterns (hollow layers, Cow Clicker) | Late rounds differ from early ones only in scale | A new pattern every 2–3 rounds; the "what new decision?" review for each layer; each prestige or unlock adds a verb |
| 3 | Dominant strategy (2048's corner, "always pick X") | A trivial bot gets near human scores; one item is a pick/win outlier | Bots over 1,000 seeds; bosses that counter archetypes; value depends on the situation; rarity instead of nerfs; rotating contracts or blockers |
| 4 | Late-run autopilot (the engine plays itself) | Decisions per minute fall in the last third | Every round has a decision; slot caps force replacement; bosses force re-arranging; output must be reinvested |
| 5 | Opaque math; compounding you can't see | Players can't explain a score | Sequenced, attributed resolution; live `Base × Mult`; synergy badges on offers ("Fuses with Ember"); an end-of-run curve |
| 6 | Particle soup and feedback inflation at the peak; juice that slows the loop | The squint test fails; a 60-trigger chain drags | Visual hierarchy and budgets; log-tiered feedback; chains that speed up; batching; tap to skip |
| 7 | Dead opening, or a dead zone before the engine comes online | Early picks feel useless; players quit before round 5 | A seeded opening board; bridge items in stages 1–2; Base value on engine pieces; the steep target jump comes only after 3–5 picks |
| 8 | Death spiral or zombie endgame | Lost runs keep going for minutes | Sell pieces for about 75% to pivot; one second-wind tool; a critical-state countdown; fast failure |
| 9 | Bricked runs and output randomness | "Three shops with nothing that fits my build" | Bag randomizer; pity after 2–3 misses; a paid reroll with rising cost; Skip pays coins; deterministic resolution |
| 10 | Complexity creep through bespoke rules; clutter on mobile | The help card needs more than 3 lines | One interaction table; at most one new rule per unlock; the Islanders test ("can we cut this?"); 3–4 resources at most |
| 11 | Optimizing the fun out (stalling for interest, reroll spam, refresh-scumming) | The best play is tedious | Rounds always advance; rerolls cost more each time; RNG state is saved; overkill bonuses reward pushing forward |
| 12 | Controls that impede competence | Mis-taps; losses blamed on the UI | One input model; 44 px targets; drag-off to cancel; undo in the build phase; no precision timing |
| 13 | Vertical meta grind | Wins correlate with hours played | Horizontal unlocks only; an opt-in Heat ladder; a labelled assist mode |
| 14 | Dark patterns (streaks, timers, FOMO) | Players come back from obligation | None of them. The daily seed is an optional invitation. Runs end cleanly |
| 15 | Late-game performance collapse | Frame drops exactly when the engine is strongest | Pools, caps, aggregation; a late-game perf test in Playwright |
| 16 | Flat or monotonic difficulty | No hook, no climax, fatigue | Sawtooth pacing with shop breathers, boss spikes and a final exam |
| 17 | Dead-time walls; prestige that feels like loss (archetype C) | Nothing to decide while waiting | Cap time to the next meaningful event at 60–90 s; preview prestige gain live; carry over a new mechanic |

---

## 5. Implementation rules for a single-file browser game

**I1. Packaging.**
- One `.html` file, no external requests, under 150 KB.
- Canvas 2D (`{alpha:false}`) for the playfield. A DOM overlay for the HUD, cards and menus, using real `<button>`s.
- Pure DOM with CSS transforms is fine for a grid with fewer than about 100 moving pieces.
- Never `fillText` body text every frame.

**I2. Architecture.** Five parts:
- `RNG`
- `SIM`, which is pure: `createState(seed, opts)`, `step(state, action) → events[]`, `legalActions(state)`. State is plain JSON with no functions. The SIM never touches the DOM, `Date.now` or `Math.random`.
- `PRESENTATION`: `render(state, alpha)`, which consumes events.
- `INPUT`: maps pointer and keyboard input to the *same* action objects the bots use.
- `SHELL`: the loop, storage and settings.

**I3. Fixed timestep.**
- `DT = 1/60` with an accumulator. Clamp frame delta to 0.25 s. Run at most 8 steps per frame, and reset the accumulator if that limit is hit.
- Timers are counted in integer ticks.
- A `gameSpeed` multiplier gives a 50–100% speed setting for free.
- In a turn-based design, the SIM resolves instantly and emits ordered events. The animation queue exists only in presentation.

**I4. Seeded RNG.**
- `sfc32`, seeded through a `cyrb128`/`xmur3` string hash.
- `rng.game` is used only by the SIM; `rng.fx` handles cosmetics.
- The seed is shown on the pause and end screens. The daily seed is `hash(date)`.
- Save the RNG state with the run so a reload can't re-roll. Keep an action log for exact replay.
- Never let object-key or Set iteration order affect the order of RNG calls.

**I5. Test hooks.**
- `window.__game = {reset(seed), step(n), act(a), state(), legalActions(), events(), hash(), setPaused(b), config}`.
- `?test=1` stops the rAF loop and skips intros. `?seed=N` fixes the seed. `?debug=1` shows ms per frame and entity count. `?sim=N` runs bots headless.

**I6. Bot suite.**
- Bots: random, do-nothing, greedy, planner (1–2 ply lookahead or small MCTS), and one monomaniac bot per archetype. Run 200–1,000 seeds.
- Assert:
  - no NaN or Infinity;
  - bounded entity counts;
  - `legalActions` is never empty while the player is alive;
  - the same seed plus action log gives the same state hash.
- Measure:
  - the win-rate gradient;
  - pick rate vs. win rate when owned, per item;
  - each archetype's win rate within ±10 points;
  - log(power) vs. log(target) per round;
  - the run-length distribution;
  - the decision-point round;
  - decision regret (the gap between the best and second-best option);
  - time to the next meaningful event.
- Re-run after every tuning change.

**I7. Input.**
- Pointer Events.
- Set `touch-action:none` on the canvas *before* any gesture.
- `setPointerCapture`; handle `pointercancel`; ignore `!isPrimary`.
- Movement under 10 px counts as a tap. Drag and release commits; dragging off the board cancels.
- Also set `overscroll-behavior:none`, `user-select:none`, `-webkit-touch-callout:none` and a transparent tap highlight, and prevent `contextmenu`.
- No information that is only available on hover: tap or long-press to inspect instead.
- **Keyboard parity:** arrows/WASD move a cursor, Enter/Space confirm, 1–3 pick cards, Esc/P pause, R restart, and focus is always visible.

**I8. DPR and layout.**
- `<meta viewport … viewport-fit=cover>`.
- The app is `100dvh` with safe-area padding. A logical world (for example 360×640 portrait) is scaled uniformly and letterboxed.
- Backing store = CSS size × `min(DPR, 2)`, drawn through `setTransform`.
- Resize on `ResizeObserver` and on a DPR `matchMedia` listener. Convert pointer coordinates to world units through `getBoundingClientRect`.
- HUD at the top, cards and actions at the bottom in the thumb zone.
- Targets at least 44 px, with 8 px gaps.
- Test at 360×740 and 1440×900.

**I9. Audio.**
- Create or resume one lazily built `AudioContext` inside the first `pointerdown`/`keydown`.
- Master gain feeds separate SFX and music gains, each with a persisted volume and mute.
- Use `setValueAtTime` and exponential ramps from 0.0001. Prebuild one noise buffer. Put a DynamicsCompressor on the master.
- Sound is never the only cue for anything.

**I10. Lifecycle.**
- On `visibilitychange` to hidden, and on `blur`: pause, save and suspend audio.
- Resume only through a "Tap to continue" overlay.

**I11. Persistence.**
- Wrap every `localStorage` call in try/catch with defaults. Use a versioned key and validate-or-reset on load.
- The game must be fully playable with no storage at all.
- Save settings when they change, bests at game over, and the in-progress run on hide. An optional export string backs up the save.

**I12. Motion and flashes.**
- `prefers-reduced-motion` or an in-game toggle turns off shake, zoom, big bursts and full-screen flashes, replacing them with fades and outline pulses.
- Never more than 3 flashes per second (WCAG 2.3.1).

**I13. Accessibility basics.**
- Every type is distinguished by shape, colour and glyph, using the Okabe-Ito palette, and the game must be playable in greyscale.
- Text at least 16 px, contrast at least 4.5:1.
- A high-contrast palette option.
- No hold-to-act.
- Pause at any time.
- `aria-live` announcements for round start, choosing an upgrade, and game over.
- All settings persisted.

**I14. Performance.**
- SIM at most 2 ms per step; render at most 6 ms on a mid-range phone.
- Zero allocations in the hot loop; object pools; about 300 entities and 400 particles at most.
- Pre-render sprites to offscreen canvases. No `shadowBlur`.
- Keep every value below 1e308, or stage that limit as the finale.

**I15. Event-driven presentation.**
- All feedback subscribes to SIM events: particles, sound, shake, `navigator.vibrate` (behind a setting) and aria text.
- The same run can then play with full juice, reduced motion, or headless.

---

## 6. FUN RUBRIC

Score each criterion from 1 to 5. Criteria marked **(×2)** are double-weighted.
- **Ship gate:** weighted mean of at least 4.0, with no criterion below 3.
- **Concept stage:** judge from the rules, a data-table sketch, and a paper walkthrough of round 1, round 12 and the final boss.
- **Built stage:** requires bot metrics (I6) plus a cold playtest with 3 people, timed with a stopwatch.

| # | Criterion | 1 | 3 | 5 |
|---|---|---|---|---|
| 1 | **Core loop clarity** | The loop can't be stated in one sentence; several verbs; the current goal is unclear | Statable in one sentence, but needs a text tutorial; the goal is sometimes off-screen | One verb; rules fit on a 3-line card; a newcomer can state the loop after one round; the goal is always visible |
| 2 | **Depth of compounding and synergy (×2)** | Additive stat soup; no piece changes another's value; linear growth | Some multipliers and combos; position and order don't matter; synergies are few and obvious | Additive buckets feed multiplicative ones; at least 25% of pieces read the build; order or adjacency matters; 8–12 named fusions; new pieces add patterns, not just scale; rare broken combos need assembly |
| 3 | **Meaningful decisions per minute (×2)** | Fewer than 1 per minute, or choices are obvious or random | 1–3 per minute; some forced picks; decisions thin out late | At least 4 per minute through the final third; options differ in kind; Skip is viable; simulated regret is neither clear-cut nor negligible |
| 4 | **Pressure and tension scaling (×2)** | Flat or rubber-banded difficulty; outcome clear by the midpoint | Rising but monotonic targets; decision point in the middle third | Fixed geometric curve, sawtooth pacing and rule-twisting bosses; decision point in the last 20–30%; strong builds sometimes lose late; weak builds lose early and fast |
| 5 | **Emergent variety across runs** | One viable build; runs feel identical | 2 archetypes; seed variety is mostly cosmetic | 3–5 archetypes with win rates within ±10 points; seeds, kits and boss pools change which build is best; players tell different stories about their runs |
| 6 | **Legibility of compounding** | Scores appear with no explanation | A breakdown exists only after the fact or in tooltips; chains resolve instantly | Sequenced, attributed resolution; live `Base × Mult`; exact rule text; synergy badges; players predict within about 2× and can explain the overshoot |
| 7 | **Onboarding speed** | Text wall or menu gate; first payoff after 30 s or more; several mechanics at once | Payoff under 15 s, but first compounding after 2 min or more, or first choice after 3 min or more | One tap to play; payoff within 10 s; compounding within 60 s; first 1-of-3 within 90 s; one new element per 2–3 rounds; no tutorial screen |
| 8 | **Juice and feedback** | Silent and static, or noise that hides the game state | Present but uniform, or feedback delays input | Same-frame acknowledgement; log-tiered feedback; pitch-rising chains; top tier reserved; passes the squint test; skippable |
| 9 | **"One more run" pull** | Restart takes over 5 s or goes through menus; end screen shows only a score | Quick restart and a best score, but no near-goal | One-tap restart under 1 s with focus set; near-miss, lesson, 2 unlock bars and a silhouette; 3 overlapping goal timescales; no manipulation |
| 10 | **Meta-progression health** | None, or a stat grind needed to win, or dark patterns | Horizontal unlocks, but thin or unrelated to skill; losses yield nothing | Unlocks tied to teaching milestones; codex with closable gaps; opt-in stacking Heat; losses still progress; no permanent power beyond a labelled assist |
| 11 | **Resistance to degenerate strategies (×2)** | A greedy, corner or do-nothing bot reaches the late game; stall, reroll or refresh exploits exist | No trivial exploit, but one item or archetype is an outlier | Planner bot far outscores greedy; no pick/win outliers; exploits closed; bosses counter one-trick builds |
| 12 | **Failure quality and fairness** | Losses come from hidden randomness or controls; long dead endgames | Losses are fair but not telegraphed; vague end screen | Input randomness only; bag and pity; telegraphed threats; critical-state countdown; fast ending; a specific near-miss explanation |
| 13 | **Scope feasibility for a single HTML file** | Needs assets or a server; many bespoke rules or hand-coded content | Feasible, but content-heavy or with 2 or more bespoke subsystems; over 250 KB | 3–5 interacting rules; content is rows in one table; procedural art and audio; under 150 KB; the SIM runs headless |
| 14 | **Accessibility and mobile fitness** | Needs hover, precision or holding; colour-only cues; breaks at 360 px | Works on touch, but small targets, no reduced motion or no keyboard parity | Portrait-first at 360 px; 44 px targets in the thumb zone; pointer and keyboard parity; shape plus colour; reduced motion; pause and speed settings; turn-based or self-paced |

---

## 7. Sources

**Theory of fun and motivation**
- Koster, *A Theory of Fun for Game Design* (2004/2013); "An Atomic Theory of Fun"; "Theory of Fun 10 Years Later" (GDC 2012).
- Hunicke, LeBlanc & Zubek, "MDA" (AAAI 2004); LeBlanc, 8 Kinds of Fun; LeBlanc, "Feedback Systems and the Dramatic Structure of Competition" (GDC 1999).
- Csikszentmihalyi, *Flow* (1990); Chen, "Flow in Games" (thesis 2006; CACM 2007); Sweetser & Wyeth, GameFlow (2005).
- Ryan, Rigby & Przybylski, *Motivation and Emotion* 30(4) (2006); Przybylski, Rigby & Ryan, *Rev. Gen. Psych.* 14(2) (2010); Przybylski et al., *JPSP* 106(3) (2014); Rigby & Ryan, *Glued to Games* (2011).
- Meier, "Interesting Decisions" (GDC 2012); Schell, *The Art of Game Design* (lenses: Meaningful Choices, Triangularity, Emergence, Surprise, Interest Curve).
- Lazzaro, "Why We Play Games: Four Keys" (GDC 2004); Loewenstein, "Psychology of Curiosity" (1994); Berlyne (1970).
- Deci, Koestner & Ryan, *Psych. Bulletin* 125(6) (1999); Schüll, *Addiction by Design* (2012); Schultz, reward prediction error (Diederen & Fletcher 2021).
- Juul, *The Art of Failure* (2013); Juul, "The Open and the Closed" (2002).
- Cook, "The Chemistry of Game Design" (2007) and "Loops and Arcs" (2012).
- Costikyan, *Uncertainty in Games* (2013).
- Ghibellini & Meier, Zeigarnik/Ovsiankina meta-analysis, *HSSC* 12:962 (2025); Madigan, "The Zeigarnik Effect and Quest Logs".

**Loops, balance and simulation**
- Adams & Dormans, *Game Mechanics: Advanced Game Design* (2012); Dormans, *Engineering Emergence*; Salen & Zimmerman, *Rules of Play* (2003).
- E. Adams, "Preventing the Downward Spiral"; Sirlin, "Balancing Multiplayer Games" and GDC 2009 handout.
- Burgun, "Randomness and Game Design"; Brown (GMTK), "The Two Types of Random" (2020).
- Soren Johnson, "Water Finds a Crack" (2011).
- Giovannetti, "Slay the Spire: Metrics Driven Design" (GDC 2019).
- Zook, Harrison & Riedl, arXiv 1908.01423; Mahlmann, Togelius & Yannakakis, Dominion balancing (CEC 2012).
- Zagal, Björk & Lewis, "Dark Patterns in the Design of Games" (FDG 2013); Hodent, *The Gamer's Brain* (2017).
- Hick (1952) and Hyman (1953); Iyengar & Lepper (2000); Scheibehenne et al. (2010).

**Incrementals**
- Pecorella, "The Math of Idle Games" I–III; "Quest for Progress" (GDC Europe 2016); "Idle Games" (GDC 2015).
- Spiel, Alharthi et al., "It Started as a Joke" (CHI PLAY 2019); Alharthi et al., "Playing to Wait" (CHI 2018).
- Buergi, *Replay* 12(1) (2024); Bogost on Cow Clicker; Lantz interview (PC Games Insider).
- Kittens Game README (nuclear-unicorn/kittensgame); A Dark Room iOS postmortems (Game Developer, PocketGamer.biz); "The recipe behind Cookie Clicker" (2013).
- Wikis for Cookie Clicker, AdVenture Capitalist, Antimatter Dimensions and Universal Paperclips.

**Roguelikes and deckbuilders**
- Brown (GMTK), "Balatro's Cursed Design Problem"; Greer, "Balatro score growth"; Balatro wiki (Blinds and Antes, Activation Sequence, Stakes); dood.gg scoring guide.
- Source Gaming and Game Afternoon on breaking Balatro; LocalThunk interviews and AMA.
- Davis, Into the Breach postmortem (GDC 2019); "sacrifice cool ideas for clarity" (Game Developer).
- Kasavin on Hades (Game Developer; GDC podcast); wikis for Hades (Duo Boons, Pact, Mirror), Slay the Spire (Ascension), Vampire Survivors (Evolution), Luck be a Landlord (Rent), Brotato (Waves, Characters) and Peglin.
- Cooke, "poggable moments" (ScreenRant); Rosewater, "Timmy, Johnny and Spike"; Path of Exile on increased vs. more modifiers; bugnet.io on horizontal vs. vertical meta.

**Emergence and placement**
- Threes design archive (asherv.com/threes/threemails); nbickford on Threes and 2048; makegamessa thread on intrinsic difficulty.
- Curry brothers (GDC 2023, Pocket Tactics); Forte Labs on Mini Metro and the Theory of Constraints.
- Toukana on Dorfromantik (Digital Trends; GOG); Grizzly Games on Islanders (GameWorldObserver).
- Spry Fox on Triple Town (PocketGamer.biz); Springer on shapez (GameDiscoverCo).
- Opus Magnum (PC Gamer); "Open-Ended Puzzle Design at Zachtronics" (GDC 2019); Tetris wiki, Random Generator.

**Feel, onboarding and pacing**
- Swink, *Game Feel* (2008); Jonasson & Purho, "Juice it or lose it" (2012) and the grapefrukt/juicy-breakout repository; Nijman, "The Art of Screenshake" (2013).
- Eiserloh, "Juicing Your Cameras With Math" (GDC 2016); Sakurai, "Thinking About Hitstop" (Famitsu vol. 490); Shoryuken on Street Fighter V hitstop.
- Hicks, Dickinson et al., "Juicy Game Design" (CHI PLAY 2019); Kao, *Entertainment Computing* (2020); Juul & Begy, "Good Feedback for Bad Players?"; CHI 2024 paper on juice and effectance; Pichlmair & Johansen, "Designing Game Feel" (2020).
- Miyamoto & Tezuka on World 1-1 (Eurogamer 2015); Hayashida on kishōtenketsu (Gamasutra 2012; GMTK).
- Booth, "The AI Systems of Left 4 Dead" (2009); loot-box arousal study (PMC7882574); Thomas & Johnston, *The Illusion of Life*; Penner's easing equations.

**Implementation**
- MDN: Anatomy of a video game, requestAnimationFrame, devicePixelRatio, Optimizing canvas, Pointer Events, setPointerCapture, touch-action, mobile touch controls, viewport units, Web Audio best practices and advanced techniques, Audio for web games, Page Visibility, visibilitychange, localStorage, prefers-reduced-motion.
- WCAG 1.4.1, 2.3.1 and 2.5.8; Game Accessibility Guidelines (basic tier); Okabe & Ito, Color Universal Design; Xbox Accessibility Guideline 103.
- Fiedler, "Fix Your Timestep!"; Nystrom, *Game Programming Patterns* (Game Loop, Event Queue).
- bryc, JS PRNGs (sfc32, cyrb128/xmur3); Playwright Clock API.
- Kontra GameLoop; LittleJS; ZzFX; js13kGames resources; Derek Yu, "Finishing a Game" (2010).