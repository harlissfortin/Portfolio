# OOH × AAH: Build Spec v1.1

This spec is written so an engineer can implement it without asking questions. It revises v1.0 to fix the red-team findings (see §0.1 and Appendix A). Every number in it was produced by a headless reference simulator of these exact rules, a design-time tool that was not shipped:

- The simulator held the content tables, resolver, shop and economy. It was derived from the red team's spec-literal re-implementation, so it is written from the text of this spec, not from the v1.0 sim.
- It ran the bots from §12.1 over 1,000 seeds, plus analysis passes for draws, pick/win rates, decision points, Shapley attribution, the score ceiling and the first run.
- The game's `src/sim.js` is its port, and `tools/test-sim.mjs` re-runs the golden tests and the bot suite against it.

Where this document and the reference sim disagree, this document wins. §12.3 lists what the sim leaves out.

---

## 0. Decision record

**Concept built: "engine" (Ooh × Aah).** It had the top weighted mean (4.50) and two of the three judges ranked it first. None of the flaws the judges named is structural, and each is fixed here in data or presentation.

| Judge flaw | Fix in this spec |
|---|---|
| Balatro-shaped skeleton (originality 3) | The resource that compounds from show to show is the **Crowd** (from Everpot), not money. Overkill pays Crowd, not coins. Players set their own challenge inside the fiction through **Sponsors**. The core is the lingering-sky window, the fuse direction, rigs bound to tubes, and the **Midnight Countdown** (the fuse counts down N→1, then fires 1→N). **Rival Crew** targets your live ♛ Crowd Favourite. |
| Blue × rares won 84–100% of runs they appeared in | Retuned, and measured with mid-run snapshots instead of final racks (final racks carry survivorship bias). Pure Sky scales with how committed the sky is (0.5 per burst). Rares appear only from Festival 4. |
| Dead rows (Fern, Dahlia, Horsetail, Tourbillon, Girandola) | Each was reworked around a distinct pattern. |
| × shells scored 0 when their condition failed | Every × shell pays +1 or +2 Aah when its condition fails. |
| Hang-ageing edge cases were hard to read at 360 px | One rule: **every burst ages the sky by 1**. Every tube always shows a "sees N" chip and a fire-order numeral. |
| Arrangement overload (720 permutations) | **Match**, **Restore** and **Rehearse** buttons, the ♛ marker and the **Crowd mood**. There is no auto-solver. |
| No general pity rule | A pity rule after 2 dry shops (§5.7). |
| Keepsake could be any rarity | Commons only. |
| Hard counters cut matching racks by 60–90% | Noise Ordinance is half strength. Short Fuse fires 5 tubes. The Power Cut cap is 30. Sodium Streetlights washes out only tubes 2, 4 and 6. Every Headliner is drawn on the rack a festival ahead. |
| 25% of late decisions were near-ties | A Sponsor bet on every non-Headliner show from Festival 3. Taking it when the crowd reads Hopeful is a real gamble; when it reads Eager it is safe. |

**Why not the runner-up (Everpot, 4.45):** its flaws are structural. In two judges' probes the Stock carried about 99% of the final bowl, and the game has no move verb, so late rounds thin out to "reroll, simmer". Grafting Everpot's best idea (a residue that lasts the whole run and pours into every score) into Ooh × Aah costs one number and one rule. Fixing Everpot would need a new verb and a rebalanced core.

**Grafts from other pitches:**
- **Everpot:** the Crowd; the live ♛ Crowd Favourite; the favourite-halving exam (Rival Crew; Renown 7).
- **Bottleneck:** the Charter, which becomes Sponsors; the counterfactual near-miss; the exact-shortfall readout.
- **Quickmatch:** the Dare, merged into Sponsors; "fires Nth of M · LAST" ordinals; soot marks on tubes.
- **Foxfire:** Headliners drawn a festival ahead; a live cheer meter and a crowd that reacts; the pity rule.

**Grafts rejected:**
- Wishes: over the complexity ceiling.
- Backlog: the rain check is the one second-wind tool.
- Improve sink: it would create an "always upsize" line.

**Portfolio tie-in:** one small, unlabelled "What made your applause" Pareto chart on the end screen, computed with Shapley values (§8.6). There is no Lean Six Sigma vocabulary anywhere in the game.

### 0.1 v1.1 revision: red-team changes and their measured effect

All figures come from the v11 sim, 1,000 seeds unless noted. The bots are defined in §12.1.

| Red-team issue (severity) | v1.1 change | Measured effect |
|---|---|---|
| Balance was calibrated against a perfect-information planner (critical) | Three reference bots. The ship gates sit on the `human` and `novice` proxies; `oracle` is only a headroom check. Adds the **Crowd mood**: a 3-word, pre-light forecast that never shows a number. Target curve retuned. | human 50.7%, novice 18.8%, oracle 81.6%. On v1.0 rules the same bots scored 40.0%, 9.5% and 70.0%. |
| The Countdown and the arrangement Headliners (high) | The Countdown fires **N→1, then 1→N**. **Match** replaces Mirror. The mood is shown in every build. t_count rewritten. | Leaving the rack in its natural order passes 78% of oracle Countdown arrivals (v1.0 palindrome: 60%). Human arrivals pass 76%. Match raises kept-order Wind Shift / Crossed Wires from 0.25 / 0.29 to 0.75 / 0.68 of the no-rule score. |
| Renown 2 twist on show 1; Renown 6 (high) | Twilight twists start in Festival 2. | Every kit passes show 1. |
| Hard-counter Headliners and draw luck (high) | Power Cut cap 15 → 30. Colourblind Mayor → **Sodium Streetlights** (tubes 2, 4 and 6 count as White). | Oracle miss rate when drawn is ≤ 11% for every Headliner (Power Cut was 52%). For the human, P(win \| drawn) − P(win \| not drawn) stays within ±8 points for every Headliner. |
| First-ever run onboarding (high) | Show 3 target 150. t_head rewritten. F2 override fixed. Mood appears at show 3. Heartbeat rationed. | The Comet opener the chips suggest passes (162 / 150). The crowd-aware novice's first run: median 3.4 min. |
| Mobile height and page contract (high) | charset and viewport metas. Compact layout below 700 px. Scroll fallback below 520 px. | Compact fixed rows total 424 px; at 375 × 548 the sky gets 124 px. |
| Sponsors were unreadable (medium) | ×1.5 kept, now readable through the mood with Accept on. | Cautious human: 0 sponsored misses. Bold human: 3.7% sponsored misses and 49.4% wins vs 50.7%. Removing Sponsors costs 8–9 points. |
| Renown 8 easier than 7; assist did nothing (medium) | R8: three passes at 900,000 (1,000,000 until round 1). The assist becomes **Fair Weather**. | R8 wins 11.2% (oracle) / 3.1% (human) at 1,000 seeds, below R7's 12.2 / 3.4 (at 1,000,000 they read 9.3 / 2.7, under both floors). Fair Weather takes the novice from 16.8% to 49.5% (400 seeds). |
| Milestones unreachable (medium) | Busy Sky needs 8+ bursts. Full Spectrum needs 3 colours up at once, or 4 colours fired. | Novice reaches them in 32% and 17% of runs. |
| Reference sim diverged from the spec (medium) | New spec-literal sim; F1 tube rule; canonical RNG order; seed-level golden traces. | Every number regenerated. |
| Target curve shape (medium) | New bases. | Oracle median Applause/target: 2.70 / 2.67 / 2.61 through F5–F7, then 3.58 in F8. |
| Mobile width and the Crate (medium) | 48 px tubes with 8 px gaps. 16 px numerals. Crate pinned. 2×2 grid for 4 cards. Info card docked in the sky. Card text ≤ 64 characters. | 6 tubes use exactly 328 px. |
| Ambiguities that change scores (medium) | All resolved in §3. 15 new golden tests. | — |
| Scope (medium) | Tiers and a cut order. In-page bots run in a Blob worker. | — |
| Pareto maths (medium) | Shapley values over tubes plus the Crowd. | Shares sum to exactly 100%. About 30 ms per run in node. |
| Overkill had no value (low) | Encore pays Crowd +2 × festival. | Crowd share of Countdown Ooh: 18% (was 10–12%). |
| Pure Sky / Chemist outliers (low) | Pure Sky 0.5. Saturn 0.05 (new, see §12.2). Chemist kept as is. | Every pick/win value is within ±22 points. |
| Naming, keys, fatigue (low) | Renamed to Fair Weather, Afterparty and Sodium Streetlights. WASD cursor. No Sponsor hotkey. Untimed confirmations. Heartbeat rationed. | — |
| Found during this pass (not red-team) | Renown 5 was a no-op; it becomes "shell cards cost +$1". The Night Market could not pass show 1 on 10% of seeds; it now starts with Peony + Strobe and $6. | R5: oracle 37.5% → 25.5%. Night Market show-1 failures: 0 of 1,000 seeds. |

---

## 1. Identity

- **Name:** Ooh × Aah (said "Ooh and Aah"). Title tag: `<title>Ooh × Aah</title>`.
- **Pitch:** Load fireworks into a rack of mortar tubes and light one fuse. Every burst scores off whatever earlier bursts left hanging in the sky, and the crowd's Applause is literally Ooh × Aah.
- **Rules card.** The help card shows exactly these three lines:
  1. The fuse fires your tubes left to right. Each burst stays up for the next few bursts (its Hang), and later shells score by what is still up.
  2. Shells add Ooh, add Aah or multiply Aah. Aah starts at 1, and your Crowd adds its size to Ooh. Applause is Ooh × Aah. Reach the target to pass. You may miss one show per run (your rain check).
  3. Between shows, spend coins on shells, tubes and rigs. Drop a card on its twin to upgrade it. Some shells fuse when they fire right after a partner.

### Fiction

A river town hires you, a junior pyrotechnician, to fire its festival year. There are eight festivals of three shows each (Twilight, Evening, Headliner), and the year ends at New Year's Eve's Midnight Countdown.

- You load shells into a wood-and-brass rack of mortar tubes, and one fuse lights them in order.
- Bursts hang in the sky, and every later shell is judged against what is still up.
- The riverbank crowd grows with every show you pass and never goes home. Before you light, you can read its mood.
- The colours are real pyrotechnic chemistry: strontium Red, sodium Gold, barium Green, copper Blue and magnesium White. Blue is the hardest colour to make, which is why it carries the rare × shells.

**Festivals:** 1 Spring Lanterns, 2 May Fair, 3 Midsummer, 4 Regatta, 5 Harvest Moon, 6 Bonfire Night, 7 Winter Lights, 8 New Year's Eve.

### Glossary (help card and Logbook)

| Term | Meaning |
|---|---|
| Ooh | The base of your score. Shells add Ooh, and your Crowd adds its size. |
| Aah | Multiplies Ooh. It starts at 1 each show, and shells add to it or multiply it. |
| Applause | Your score for a show: Ooh × Aah. Reach the target to pass. |
| Burst | One firing of a shell. Most shells make 1 burst, a Roman Candle makes 3, and a Mortar rig doubles a tube's bursts. |
| Up / the sky | The bursts still hanging when a shell fires. The burst being fired is not up yet. |
| Hang | How many later bursts a burst stays up for. |
| Sees N | The number of bursts up when this tube fires for the first time. |
| Fire order | The order in which bursts fire: normally tube 1 to the last tube, unless tonight's rule changes it. |
| Tube | A slot in the rack. You start with 4; the maximum is 6. |
| Rig | A tube upgrade. It stays on the tube, not on the shell. |
| Crate | 2 spare slots. Shells in the Crate don't fire. |
| ★ / break | Upgrade tier: ★1, ★2 (double-break), ★3 (triple-break). |
| Twin | A card for a shell you own. Drop it on that shell to upgrade it: all its numbers double, up to ★3. |
| Fusion | Fire a shell right before its partner, and the partner's first burst fuses. The Logbook lists all 12. |
| Crowd | A counter that persists through the run and adds its size to Ooh at the end of every show. |
| Crowd mood | Restless, Hopeful or Eager: the crowd's read of your rack against tonight's target. It never shows a number. |
| Interest | After each show you pass, +$1 for every $5 you hold (up to +$5). |
| Rain check | Forgives one miss per run, but not at the Countdown. |
| Encore | Applause of at least 2× the target. Crowd +2 × the festival number. |
| Sponsor | Optional. Raises this show's target ×1.5 for a reward. |
| Headliner | The 3rd show of each festival, with a rule twist. It is announced a festival ahead. |
| Match | Re-seats your shells so that tonight's fuse fires them in their usual order. |
| Rehearse | Previews the next Headliner: the chips and the crowd mood read your rack under its rule. |
| Restore | Puts your shells back in the tubes they held at the last show. |
| ♛ Crowd Favourite | The shell whose removal would cost the most Applause right now. |
| Keepsake | After a run, keep one Common shell. It starts your next run in the Crate. |
| Renown | Harder levels you unlock by winning. Each level adds one rule to all the ones before it. |
| Fair Weather | An easier mode: every target ×0.75, and you can relight the Countdown once. These runs are marked (§7.4). |
| Afterparty | The optional endless mode after a win (§5.10). |

---

## 2. Core loop state machine

### 2.1 Nested loops

| Loop | Period | Contents |
|---|---|---|
| Moment | 1–5 s | One build action (buy, move, upgrade, rig, sell, reroll, sponsor, match), with feedback in the same frame, updated local chips and the Crowd mood. |
| Round = show | 25–45 s | Build (shop, arrange, sponsor), then Light the fuse, a 2–5 s sequenced resolution and the payout. |
| Stage = festival | ~2 min | Twilight (×1), Evening (×1.3), Headliner (×1.8, rule twist). |
| Run | 3–5 min for a first run, 12–18 min for a win | 8 festivals = 24 shows. Show 24 is the Midnight Countdown. |
| Meta | Across runs | Milestones unlock shells and kits; Logbook; Renown; keepsake; Afterparty. |

### 2.2 Indices

- In prose and the UI, **shows are numbered 1–24**. Code uses `s = show − 1`, so `s ∈ 0..23`; the Afterparty continues from `s = 24`.
- Festival `f = floor(s/3) + 1`.
- Slot `k = s mod 3`, where 0 = Twilight, 1 = Evening and 2 = Headliner.

`rulesFor(s)` returns a list of rule ids, in this order:
1. **`s = 23`:** `['countdown']`, or `['countdown3']` at Renown 8. At Renown ≥ 7, append `'rival'`.
2. **`k = 2`:** `[headliners[f−1]]`. In the Afterparty, the festival's two twists instead.
3. **`k = 0`, Renown ≥ 2 and `f ≥ 2`:** `[twilightTwists[f−1]]`.
4. **Otherwise:** `[]`.

### 2.3 SIM phases

```
createState → phase 'build' (show 1)
build --light--> [resolve (instant)] → payout/check →
    'build' (next show)       pass, or a miss that spends the rain check
    'build' (show 24 again)   Countdown miss while a Fair Weather relight is left (no new shop, no Sponsor)
    'lost'                    miss with no rain check, or a Countdown miss with no relight
    'won'                     Countdown passed
won --endless--> 'build' (show 25, Afterparty) … first miss → 'lost'; passing show 36 → 'won' (final victory card)
```

**Opening a build phase:**
1. Generate the shop with the canonical RNG order (§5.6): shell cards → pity → Collector → rig → Sponsor.
   - Before show 1 there is no shop, except with the Night Market kit.
   - First-ever-run overrides replace cards after the RNG calls have been made.
2. Snapshot `buildStart`, which the near-miss search uses.
3. Clear the undo stack.

### 2.4 Presentation states (UI only; never in the SIM)

- BOOT (at most 1 frame) → BUILD → RESOLVING → RESULT → BUILD …
- END (the end screen).
- Overlays: PAUSE, LOGBOOK, SETTINGS, INSPECT (bottom sheet), HELP, TAP-TO-CONTINUE (shown after the tab was hidden).
- **RESULT** needs no tap. After the Applause slam (at least 600 ms) the shop slides up, and the result card stays pinned in the sky until the first build action.
- Tapping anywhere during RESOLVING fast-forwards ×4. The Skip button jumps straight to the slam.

### 2.5 Actions

Actions are plain JSON. Pointer input, keyboard input and bots all emit exactly these objects. A slot is `{zone:'tube'|'crate', i}`. Every action is legal only in phase `build` unless the table says otherwise.

| Action | Legal when | Effect |
|---|---|---|
| `{type:'buy', card:i, to:slot}` | Card `i` is an unsold shell card, its `cost ≤ coins`, and the slot is empty. | Pay `cost`. Place a new ★1 copy with `paid = cost`. |
| `{type:'buy', card:i, to:{zone:'tube', i:j}, displace:'crate'\|'sell'}` (one-gesture swap-in) | Card `i` is an unsold shell card and tube `j` holds a shell that is not its twin (a twin is an `upgrade`). `'crate'`: a Crate slot is empty and `cost ≤ coins`. `'sell'`: `cost ≤ coins + max(1, floor(0.75 × paid))` of the old shell (the refund counts first). | `'crate'`: the old shell moves to the first empty Crate slot. `'sell'`: the old shell is sold (as `sell`). Then as `buy`. One action, so one Undo step. Events: `moved` or `sold` (with `displaced: true`), then `bought`. `legalActions` never lists it; bots use `sell` then `buy`. |
| `{type:'upgrade', card:i, to:slot}` | Card `i`'s id equals that of the shell at `slot`, the shell is below ★3, and `upCost ≤ coins`. | Pay `upCost`: ceil(1.5 × row cost) for ★1→★2, 2 × row cost for ★2→★3. Then `star += 1` and `paid += upCost`. The card's colour is discarded; the twin keeps its colour. |
| `{type:'setColour', card:i, col}` | Chemist kit only. Card `i` is a wild shell (row colour `*`) and `col ∈ {R, A, G, B}`. | Free. Sets the card's colour. |
| `{type:'buyRig', tube:j}` | The rig card is unsold, its `cost ≤ coins`, and tube `j`'s rig is not this rig. A Mortar also requires that no tube has one. | Pay. Set `tubes[j].rig = id`. Any old rig is destroyed with no refund. |
| `{type:'buyTube'}` | `f ≥ 2`, fewer than 6 tubes, and `tubeCost ≤ coins`. | Pay $6 for the 5th tube or $10 for the 6th (Renown 4: +$4 each). Append an empty tube with no rig on the right. |
| `{type:'move', from:slot, to:slot}` | `from` is occupied and `from ≠ to`. | Free. Moves the shell, or swaps if `to` is occupied. |
| `{type:'sell', from:slot}` | `from` is occupied. | `coins += max(1, floor(0.75 × paid))`. The shell is removed. |
| `{type:'reroll'}` | A shop exists, the show is in F2 or later (the workshop row is hidden in F1), and `rerollCost ≤ coins`. | Pay `rerollCost`, then `rerolls += 1`. Regenerate the shell cards (not a Collector card) and the rig card (§5.6). |
| `{type:'sponsor', accept:bool}` | A Sponsor is offered this show and `accept ≠ sponsor.accepted`. | `sponsor.accepted = accept`. The effective target becomes `round(target × 1.5)` while accepted. |
| `{type:'match'}` | Tonight's rules include `windshift` or `crossed`, and at least 2 shells are in tubes. | Re-seat the tube contents so tonight's fuse fires them in their plain order (§3.3 `matchPerm`). Rigs stay put. Pressing it again applies the permutation again. |
| `{type:'restore'}` | `lastOrder` exists. | Shells you still own return to the tubes they held at the last lit show, matched by `uid`. Displaced shells fill the remaining empty tubes left to right, then the Crate. |
| `{type:'light'}` | Always, even with empty tubes. | Resolve, pay out and advance (§3, §5). |
| `{type:'endless'}` | Phase `won` and not already in the Afterparty. | Enter the Afterparty (§5.10). |

**Not SIM actions:**
- **Undo** is a SHELL feature: a stack of `clone(state)` pushed before every build action and cleared on `reroll` and on `light`.
- **New run** and choosing the keepsake are also SHELL features (§7).

**`legalActions(state)` order** (deterministic, for bots):
1. `light`
2. `sponsor`
3. `buy`, ordered by card and then by slot (tubes left to right, then the Crate)
4. `upgrade`
5. `buyRig`, by tube
6. `buyTube`
7. `move`, by `from` and then `to`
8. `sell`, by slot
9. `reroll`
10. `match`
11. `restore`
12. `setColour`

---

## 3. Resolution algorithm (pure, deterministic)

### 3.1 `resolveShow(tubes, ctx)`

`ctx = {rules: string[], crowd, fav, trace}`. `fav` is the ♛ tube index, fixed at lighting; it is used only when `rules` includes `'rival'`.

**Fire sequence** (tube indices, 0-based):
1. Start with `seq = [0 .. n−1]`.
2. `windshift`: reverse `seq`.
3. `crossed`: the odd indices in order (tubes 2, 4, 6), then the even ones (tubes 1, 3, 5).
4. `shortfuse`: keep only indices < 5.
5. `countdown`: `seq = reverse(seq) ++ seq`. The fuse counts down N→1, then fires 1→N.
6. `countdown3` (Renown 8): `seq = seq ++ reverse(seq) ++ seq`.
7. Drop empty tubes.

Then `totalBursts = Σ shots(tube)`, where `shots = row.shots (default 1) × (rig = mortar ? 2 : 1)`.

**Initial state:**

```
ooh=0; aah=1; addAah=0; coins=0; crowd=ctx.crowd; crowdGain=0
sky=[]; fired=0; prevTubeShell=null; prevBurst=null; colFired={}; luckyPaid={}
```

**For each tube `t` in `seq`**, and for each shot `k = 0 .. shots−1`:

1. **Context.**
   - `washed` = `streetlights ∈ rules` and `t` is odd (tubes 2, 4 and 6).
   - `col` = the shell's colour (`R`, `A`, `G`, `B`, `W`, or `X` for Rainbow), or `'W'` if washed.
   - `wild` = the row has `wildColour` and the burst is not washed.
   - `vis` = the whole sky; under Fog, only the 2 newest bursts.
   - `isLast = (fired == totalBursts − 1)`.
   - `half` = (`ordinance` and the row colour is `W`) or (`rival` and `t == fav`). Tourbillon's row colour is `X`, so Ordinance never halves it.
   - `m = starMult(star) × (half ? 0.5 : 1)`, where `starMult` is 1, 2 and 4 for ★1, ★2 and ★3.
2. **Dud.** Under Headwind, the burst with `fired == 0` skips steps 3–5. It still ages the sky and enters it (step 6).
3. **Fusion.** Applies when `k == 0`, `prevTubeShell ≠ null` and `FUSIONS[prevTubeShell.id + '>' + shell.id]` exists.
   - Apply the fusion's params through steps 4a–4e with `m = 1` and `half = false`, then emit `fusion`.
   - Critic and Spotlight apply to the fusion's Ooh, and Power Cut clamps its Aah.
   - A fusion's × terms have no floor.
   - At the Countdown turn, tube 1 fires twice in a row, so `prevTubeShell` is itself. A Palm there fuses with itself (Palm Grove). This is intended.
4. **Shell effect**, in this exact order:
   - **a. +Ooh.**
     1. `o` = the sum of the shell's Ooh terms (§4.2), plus any repeated Ooh (step 4f).
     2. **Critic:** if `prevBurst` exists, `prevBurst.col == col`, `col ∉ {W, X}` and neither burst is wild, then `o = 0`.
     3. **Spotlight** rig: `o ×= 2`.
     4. `ooh += o`.
   - **b. +Aah.**
     1. `a` = the Aah terms, plus clear-Aah, plus any repeated Aah.
     2. **Power Cut:** clamp so that `addAah` never exceeds 30.
     3. `addAah += a` and `aah += a`.
   - **c. Side effects.** `coins +=` the coin terms, and `crowd +=` the crowd terms, which also add to `crowdGain`. Both take effect immediately for later readers.
   - **d. × terms.**
     1. Evaluate every × term in the row and multiply together the factors whose condition holds.
     2. If the row has × terms and **none** of them held, add `floorAah × m` as +Aah (clamped by Power Cut).
     3. `aah ×= x`. Emit `multAah` if `x > 1`.
     4. `xLastPerUp` holds only when `isLast` **and** at least 1 burst is up.
   - **e. Extend (Glitter).** Every burst in the *full* sky gets `ceil(extend × m)` more Hang.
   - **f. Repeats** (computed inside a and b):
     - **Echo:** if `prevBurst` exists and its shell is not an Echo or a Cake, compute that shell's **+terms** with its own `starMult` (never halved), its colour, and the current context (`vis`, `fired`, `isLast`, live Crowd). Multiply by `echoRate[echo's star − 1] × (half ? 0.5 : 1)`. Echo copies the shell, not the outcome, so after a dud it still copies the dud's shell.
     - **Cake:** do the same for every burst in `vis` whose **row colour** is not `B` and whose shell is not an Echo or a Cake, at `cakeRate[cake's star − 1]`. A Peony rolled Blue is copied; a Blue Moon is not.
     - "+terms" means every key in the repeatable group of §4.2. Clears, × terms, extend, coins and crowd are never repeated.
5. **Rig.** Brass: +2 Aah after the burst (clamped by Power Cut). Lucky: +$1, at most once per tube per show.
6. **Ageing.**
   1. If this shell clears (Salute, Thunder King), set `sky = []`. This clears the whole sky, even under Fog.
   2. Every burst in the sky loses 1 Hang, and bursts at ≤ 0 are removed (emit `skyAge`).
   3. `h = row.hang + (tall ? 1 : 0) − (drizzle ? 1 : 0)`. If `h > 0`, push `{uid, shellId, col, wild, star, hang:h, tube}`.
7. `fired += 1`; `colFired[col] += 1`; `prevBurst = {shellId, col, wild, star}`.

After all shots of a tube, set `prevTubeShell` = that tube's shell.

**End of show:**
- `cheer = floor(crowd × (ferry ? 0.5 : 1))`. Emit `crowdCheer`. Then `ooh += cheer`.
- **Applause = floor(ooh × aah).**
- `ooh` and `aah` are float64. Display Ooh floored. Display Aah with 1 decimal below 100 and none above.

### 3.2 Reading rules

| Phrase | Definition |
|---|---|
| "burst up" | A burst in `vis` when this burst fires. The firing burst is excluded. |
| "X is up" / "per X up" | The count of bursts in `vis` with `col == X` or `wild`. |
| "a burst of its colour is up" (Palm) | The Palm's effective colour is not `W` (and a Palm is never `X`), and some burst up matches it. |
| "distinct colours up" | `\|{R, A, G, B among non-wild bursts up}\| + (number of wild bursts up)`, capped at 4. White never counts. |
| "all share one colour" (Pure Sky) | At least 2 bursts up. Take the first non-wild burst's colour `c`; if every burst up is wild, the check passes. Otherwise `c ≠ W` and every burst up is wild or `c`. **White breaks a Pure Sky.** |
| "fired before it" | `fired`: every burst earlier this show, including duds and every Countdown pass. |
| "Gold burst fired before it" | `colFired['A']`, counted by effective colour. Washed bursts count as White. Tourbillon (`X`) never counts. |
| "first to fire" | `fired == 0`. After a Headwind dud, nothing else is first. |
| "last to fire" | `isLast`: the final burst of the show, including the final Countdown burst. Short Fuse's unfired tube is not "last". |
| "Crowd" (Town Crest, Hometown Hero) | The live Crowd, including gains earlier this show. |
| "Crowd gained so far this show" (Saturn) | `crowdGain` at the moment it fires. |
| Stars | `m` multiplies every number: Ooh and Aah amounts, per-unit amounts, clearAah, minimums, floorAah, coins, crowd, extend, and the `k` inside every × term (so ×1.5 becomes ×2 at ★2 and ×3 at ★3). `m` never changes Hang, thresholds, the Crowd divisor, or copy rates, which use their own arrays. |

### 3.3 Pure helpers (shared by the UI, bots and end screen)

**`previewChips(state, rules, held?, slot?)`**
- Runs `resolveShow` with a trace on a hypothetical rack.
- Returns local facts per tube only: `sees`, +Ooh, +Aah, ×, `xAah` (the Aah this tube's × terms add: the Aah in the sky before each × times (× − 1), summed over its bursts), the fusion name (or `?` if not yet discovered), `fusionNext` on a fusion's first piece (`{key, name, tube}` when the next tube to fire holds its partner and the fusion fires), Crowd and coin gains, and "fires Nth of M" / "LAST".
- With a held card over a tube it also returns the drop: `kind` (`buy`, `upgrade`, `swap` = old shell to the Crate, or `replace` = old shell sold when the Crate is full), `displace`, `out` (the displaced shell), `crate` or `refund`, and `action` (the exact §2.5 action for that drop).
- **It never returns the total.**

**`favourite(tubes, crowd)`**
- Resolves under no rule, then once more for each occupied tube with that tube emptied.
- ♛ is the tube with the largest drop. Ties go to the leftmost tube; an empty rack gives `null`.

**`mood(state, previewRules?)`**
1. Compute `A = resolveShow(tubes, {rules: previewRules ?? rulesFor(s), crowd, fav})`. `fav` is the favourite whenever `rival` is in the rules.
2. Compute the ratio `A / T`:
   - For tonight, `T` is the effective target, including an accepted Sponsor.
   - While previewing a future Headliner, `T` is that show's base target.
3. Map the ratio to a bucket: **Restless** below 0.85, **Hopeful** from 0.85 to below 1.25, **Eager** from 1.25.
4. Return only the bucket. The ratio never leaves the SIM.

**`matchPerm(n, rules)`**
- Build `order` = `[0..n−1]`; reverse it under `windshift`; under `crossed`, put the odd indices first and then the even ones.
- Match moves the contents of tube `j` to tube `order[j]`, for j = 0..n−1.

**`nearMiss(buildStart, finalPreLight, rules, target)`**: see §8.6.

**`shapley(tubes, rules, crowd, fav)`**: see §8.6.

---

## 4. Content tables

### 4.1 Colour, shape and glyph language (the game is playable in greyscale)

| Colour | Id | Token shape | Role | Default | High-contrast |
|---|---|---|---|---|---|
| Red (strontium) | R | ● circle | Aah | `#D55E00` | `#FF7A33` |
| Gold (sodium) | A | ▲ triangle | Hang, coins, Crowd | `#E69F00` | `#FFC23D` |
| Green (barium) | G | ■ rounded square | Ooh | `#009E73` | `#22D3A6` |
| Blue (copper) | B | ◆ diamond | × (rare) | `#56B4E9` | `#8AD7FF` |
| White (magnesium) | W | ✚ cross | Utility; counts as no colour | `#F0F0F0` | `#FFFFFF` |
| Rainbow (Tourbillon) | X | ✺ 8-point star with 4 colour wedges | Counts as every colour while up | 4 colours | 4 colours |
| Fusion accent | — | Braid / ✦ | Fusion banners and badges | `#CC79A7` | `#F29BD4` |

**Every shell token** is 48 × 60 px (48 × 56 in Compact) and shows:
- the colour shape as a background plate;
- a 26 px procedural pictogram of its burst pattern (§4.4);
- a 2-letter monogram, bottom-right, 16 px bold;
- star pips top-right: • / •• / •••;
- Hang pips under the token (filled dots = Hang).

Washed tubes under Streetlights show their tokens desaturated with a streetlamp glyph.

### 4.2 Effect vocabulary (the only keys the resolver interprets)

**Repeatable +terms** (Echo and Cake can copy these):

| Key | Meaning |
|---|---|
| `ooh:n` | +n Ooh |
| `oohPerUp:n` | +n Ooh per burst up |
| `oohIfEmpty:[a,b]` | +a Ooh if no bursts are up, else +b |
| `oohIfFirst:[a,b]` | +a Ooh if first to fire, else +b |
| `oohIfLast:[a,b]` | +a Ooh if last to fire, else +b |
| `oohPerFired:n` | +n Ooh per burst fired before it |
| `oohPerDistinct:n` | +n Ooh per distinct colour up |
| `aah:n` | +n Aah |
| `aahIfOwnColUp:n` | +n Aah if a burst of its colour is up |
| `aahIfColUp:[c,n]` | +n Aah if a `c` burst is up |
| `aahPerColUp:[c,n,min]` | +n Aah per `c` burst up; +min if there are none |
| `aahPerUp:n` | +n Aah per burst up |
| `aahPerDistinct:n` | +n Aah per distinct colour up |
| `aahPerFired:n` | +n Aah per burst fired before it |
| `aahPerCrowd:d` | +max(1, floor(crowd / d)) Aah |

**Non-repeatable terms:**

| Key | Meaning |
|---|---|
| `clearAah:n` | Clears the sky; +n Aah per burst cleared (counted in `vis`) |
| `clearX:k` | Clears the sky; ×(1 + k × cleared) |
| `x:k` | ×(1 + k) |
| `xPerUp:k` | ×(1 + k per burst up); holds only if at least 1 burst is up |
| `xPerDistinct:k` | ×(1 + k per distinct colour up) |
| `xMonoPerUp:k` | ×(1 + k per burst up) if all bursts up share one colour |
| `xLastPerUp:k` | ×(1 + k per burst up) if last to fire **and** at least 1 burst is up |
| `xIfColUp:[c,k]` | ×(1 + k) if a `c` burst is up |
| `xPerColFired:[c,k]` | ×(1 + k per `c` burst fired before it) |
| `xPerFired:k` | ×(1 + k per burst fired before it) |
| `xPerCrowdGained:k` | ×(1 + k per Crowd gained so far this show) |
| `floorAah:n` | +n Aah if none of the row's × terms held |
| `extend:n` | Every burst up hangs `ceil(n × m)` longer |
| `echo:[r1,r2,r3]` | Repeats the previous burst's +terms at the rate for the Echo's own star |
| `refire:[r1,r2,r3]` | Repeats every burst up whose row colour is not Blue, at the rate for the Cake's own star |
| `coin:n` | +$n |
| `coinIfColUp:[c,count,n]` | +$n if at least `count` `c` bursts are up |
| `crowd:n` | Crowd +n |

**Row flags:**
- `shots` (default 1), `wildColour` (Tourbillon).
- `col`: `R`/`A`/`G`/`B`/`W`, `X` (Rainbow), or `*` (wild: rolled when the card is offered).
- `hang`, `rarity`, `cost`.
- `fest`: the earliest festival in which it can be offered.
- `lock`: a milestone id, or null.
- `pattern`, `mono` (the monogram), `text`.
- `text` is at most 64 characters and shows the numbers for the shell's current ★. The Inspect sheet generates the full rule from `params`.

### 4.3 Shells (34 rows; 22 in the starting pool)

Column key: **R** = rarity (C/U/R), **$** = cost, **H** = Hang, **F** = earliest festival offered. Col `*` means the colour is rolled when the card is offered.

| id | Name (mono) | Col | R | $ | H | Card text (★1) | Params | Tags | F | Unlock |
|---|---|---|---|---|---|---|---|---|---|---|
| peony | Peony (Pe) | * | C | 3 | 1 | +20 Ooh. | `ooh:20` | basic | 1 | start |
| chrys | Chrysanthemum (Ch) | * | C | 3 | 1 | +10 Ooh; +20 Ooh per burst up. | `ooh:10, oohPerUp:20` | Canopy | 1 | start |
| comet | Comet (Co) | * | C | 3 | 0 | +40 Ooh if the sky is empty, else +10. | `oohIfEmpty:[40,10]` | Thunder | 1 | start |
| strobe | Strobe (St) | W | C | 3 | 0 | +10 Ooh, +2 Aah. | `ooh:10, aah:2` | basic | 1 | start |
| palm | Palm (Pa) | * | C | 3 | 2 | +12 Ooh; +3 Aah if a burst of its colour is up. | `ooh:12, aahIfOwnColUp:3` | Mono, Rainbow | 1 | start |
| willow | Willow (Wi) | A | C | 4 | 3 | +20 Ooh. | `ooh:20` | Canopy | 1 | start |
| mine | Mine (Mi) | * | C | 3 | 1 | +40 Ooh if first to fire, else +15. | `oohIfFirst:[40,15]` | Position, Salvo | 1 | start |
| salute | Salute (Sa) | W | C | 4 | 0 | +10 Ooh. Clears the sky: +3 Aah per burst cleared. | `ooh:10, clearAah:3` | Thunder | 2 | start |
| candle | Roman Candle (RC) | * | C | 4 | 1 each | 3 bursts, each +15 Ooh. | `shots:3, ooh:15` | Salvo | 2 | start |
| heart | Heart (He) | R | C | 3 | 1 | +3 Aah; +3 more if a Red is up. | `aah:3, aahIfColUp:[R,3]` | Mono | 2 | start |
| girandola | Girandola (Gi) | A | C | 3 | 1 | +10 Ooh, +1 Aah. Crowd +3. | `ooh:10, aah:1, crowd:3` | Crowd | 2 | start |
| fern | Fern (Fe) | G | C | 3 | 2 | +10 Ooh; +3 Aah per Green up. | `ooh:10, aahPerColUp:[G,3,0]` | Mono | 2 | Monochrome Night |
| crossette | Crossette (Cr) | * | U | 5 | 1 | +4 Aah per burst up. | `aahPerUp:4` | Canopy, Salvo | 3 | start |
| echo | Echo Shell (Ec) | W | U | 4 | 1 | Repeats the + numbers of the burst before it (100%). | `echo:[1,1.5,2]` | Salvo | 3 | start |
| waterfall | Waterfall (Wa) | W | U | 5 | 2 | +60 Ooh if last to fire, else +15. | `oohIfLast:[60,15]` | Position, Canopy | 3 | start |
| kamuro | Kamuro (Ka) | A | U | 5 | 3 | +20 Ooh; +$1 if 2+ Gold are up. | `ooh:20, coinIfColUp:[A,2,1]` | Canopy, Gold | 3 | start |
| dahlia | Dahlia (Da) | * | U | 5 | 1 | +10 Ooh and +3 Aah per distinct colour up. | `oohPerDistinct:10, aahPerDistinct:3` | Rainbow | 3 | start |
| smiley | Smiley (Sm) | * | U | 5 | 2 | +15 Ooh, +1 Aah. Crowd +4. | `ooh:15, aah:1, crowd:4` | Crowd | 3 | start |
| glitter | Glitter (Gl) | A | U | 5 | 2 | +10 Ooh, +2 Aah; every burst up hangs 1 longer. | `ooh:10, aah:2, extend:1` | Canopy | 3 | start |
| strontium | Strontium Star (Sr) | R | U | 5 | 2 | +10 Ooh; +3 Aah per Red up (min +1). | `ooh:10, aahPerColUp:[R,3,1]` | Mono | 3 | First Fusion |
| crackle | Crackle (Ck) | W | U | 5 | 2 | +2 Aah, +1 Aah per burst fired before it. | `aah:2, aahPerFired:1` | Salvo, Thunder | 3 | First Fusion |
| horsetail | Horsetail (Ho) | G | U | 5 | 2 | +10 Ooh per burst fired before it. | `oohPerFired:10` | Salvo | 3 | Busy Sky |
| brocade | Brocade (Br) | A | U | 5 | 2 | +10 Ooh; +2 Aah per Gold up. | `ooh:10, aahPerColUp:[A,2,0]` | Mono (Gold) | 3 | Monochrome Night |
| tourbillon | Tourbillon (To) | X | U | 5 | 1 | +20 Ooh, +2 Aah. While up, counts as every colour. | `ooh:20, aah:2, wildColour` | Rainbow, Mono | 3 | Full Spectrum |
| crest | Town Crest (TC) | A | U | 6 | 1 | +1 Aah per 12 Crowd (min +1). | `aahPerCrowd:12` | Crowd | 3 | Packed House |
| thunder | Thunder King (TK) | W | R | 7 | 0 | +20 Ooh. Clears sky: ×(1+0.4 per cleared) Aah, else +1 Aah. | `ooh:20, clearX:0.4, floorAah:1` | Thunder | 4 | start |
| finale | Grand Finale (GF) | B | R | 8 | 3 | Last with 1+ up: ×(1+0.4 per burst up) Aah. Else +2 Aah. | `xLastPerUp:0.4, floorAah:2` | Canopy | 4 | start |
| puresky | Pure Sky (PS) | B | R | 8 | 1 | 2+ up, one colour, no White: ×(1+0.5 per up) Aah; else +2. | `xMonoPerUp:0.5, floorAah:2` | Mono | 4 | start |
| barrage | Barrage (Ba) | B | R | 8 | 1 | ×(1+0.05 per burst fired before it) Aah; if first, +1 Aah. | `xPerFired:0.05, floorAah:1` | Salvo | 4 | start |
| prism | Prism (Pr) | B | R | 8 | 1 | ×(1+0.4 per distinct colour up) Aah; if none, +1 Aah. | `xPerDistinct:0.4, floorAah:1` | Rainbow | 4 | Full Spectrum |
| bluemoon | Blue Moon (BM) | B | R | 8 | 2 | ×1.6 Aah if another Blue is up. Else +2 Aah. | `xIfColUp:[B,0.6], floorAah:2` | Mono (Blue) | 4 | Headliner Hunter |
| nishiki | Nishiki Kamuro (NK) | A | R | 8 | 3 | ×(1+0.1 per Gold fired before it) Aah; if none, +1 Aah. | `xPerColFired:[A,0.1], floorAah:1` | Gold, Canopy | 4 | Triple-break |
| cake | Cake (Ca) | * | R | 9 | 1 | Repeats the + numbers of every non-Blue burst up (75%). | `refire:[0.75,1,1.5]` | Salvo, Canopy | 4 | Busy Sky |
| saturn | Saturn (Sn) | B | R | 8 | 2 | ×(1+0.05 per Crowd gained this show) Aah; if none, +1 Aah. | `xPerCrowdGained:0.05, floorAah:1` | Crowd | 4 | Packed House |

**Mix across the 34 rows:**
- 18 additive or conditional-additive (53%).
- 2 clearers (6%).
- 9 × shells (26%), 7 of them rare.
- 2 copy shells (6%).
- 3 Crowd/economy shells (9%).
- 25 of 34 rows (74%) read the sky, a colour, a position, the fire count or the Crowd.

**Archetypes** (the monomaniac bot lists; Peony and Strobe are allowed for all):
- **Canopy:** Willow, Glitter, Chrysanthemum, Crossette, Cake, Kamuro, Grand Finale, Waterfall.
- **Mono:** Heart, Strontium Star, Palm, Fern, Brocade, Pure Sky, Kamuro, Nishiki Kamuro, Blue Moon.
- **Rainbow:** Palm, Dahlia, Tourbillon, Prism, Chrysanthemum, Comet, Heart, Fern.
- **Salvo:** Roman Candle, Crackle, Crossette, Echo, Mine, Horsetail, Cake, Barrage.
- **Thunder:** Salute, Thunder King, Comet, Crackle, Willow, Chrysanthemum, Waterfall, Echo.
- **Crowd:** Girandola, Smiley, Town Crest, Saturn, Kamuro, Willow, Glitter.

### 4.4 Burst patterns (one parametric generator; a shell's pictogram is a frozen frame at 45% of its life)

Units: `n` = base particle count; speed in px/s; gravity in px/s²; drag per frame at 60 Hz; life in seconds; trail and twinkle from 0 to 1.

| Pattern | Used by | n | Speed | Gravity | Drag | Life | Trail | Twinkle | Special |
|---|---|---|---|---|---|---|---|---|---|
| sphere | Peony, Dahlia (multi-hue stars) | 48 | 170 | 40 | .975 | 1.4 | .25 | 0 | — |
| trails | Chrysanthemum | 56 | 180 | 40 | .975 | 1.6 | .7 | 0 | — |
| streak | Comet | 12 | 120 | 30 | .98 | 1.2 | .9 | 0 | A single rising star with a long tail, then a 12-star pop |
| strobe | Strobe | 24 | 120 | 20 | .97 | 1.2 | 0 | 1 | Stars blink at 8 Hz |
| fronds | Palm, Fern (as leaflets) | 42 | 150 | 70 | .985 | 1.8 | .8 | 0 | 7 thick arms × 6 stars |
| droop | Willow; Kamuro (denser); Nishiki (glitter) | 60 | 120 | 90 | .99 | 2.8 | .95 | .2 | — |
| fan | Mine | 36 | 260 | 120 | .98 | 1.2 | .5 | 0 | Upward fan ±40° from the ground |
| ring | Salute; Thunder King (double ring plus a sky-wide shock line); Pure Sky (ring plus inner sphere) | 32 | 220 | 0 | .95 | .6 | 0 | 0 | White flash disc, 120 ms, subject to the flash limits |
| triple | Roman Candle | 16 per shot | 150 | 40 | .97 | 1.0 | .3 | 0 | Each shot rises from the tube and pops |
| heart | Heart; Strontium Star (as a 5-point star outline) | 40 | 150 | 25 | .97 | 1.5 | .3 | 0 | Parametric outline |
| spiral | Girandola, Tourbillon | 16 | 90 | 10 | .99 | 1.8 | .6 | .3 | Rotates at 6 rad/s |
| split | Crossette | 8→32 | 160 | 40 | .975 | 1.6 | .4 | 0 | Each star splits into 4 at 45% of its life |
| ghost | Echo | — | — | — | — | — | — | — | Replays the previous pattern at 50% alpha, 80 ms later |
| curtain | Waterfall | 60 | 40 | 110 | .99 | 2.2 | .9 | .2 | 30 emitters along a horizontal line |
| smiley | Smiley | 44 | 140 | 20 | .97 | 1.6 | .2 | 0 | Circle, 2 eyes and an arc |
| glitter | Glitter, Brocade | 56 | 160 | 50 | .98 | 2.2 | .8 | .8 | — |
| crackle | Crackle | 24 | 150 | 40 | .97 | 1.0 | .2 | 0 | 40 micro-pops between 40% and 90% of its life |
| cascade | Horsetail | 50 | 200 | 150 | .985 | 2.0 | .8 | 0 | A fountain arcing to one side |
| crest | Town Crest | 44 | 140 | 20 | .97 | 1.6 | .2 | 0 | Shield outline |
| cluster | Grand Finale | 3×36 | 180 | 40 | .975 | 1.8 | .5 | .3 | 3 spheres 120 ms apart |
| salvo | Barrage | 10×10 | 140 | 40 | .97 | .9 | .3 | 0 | 10 pops over 500 ms up its column |
| prism | Prism | 48 | 170 | 40 | .975 | 1.5 | .3 | 0 | 4 hue quadrants |
| moon | Blue Moon | 30 | 60 | 0 | .99 | 1.8 | 0 | .3 | Glowing disc and halo ring |
| rain | Cake | 5×14 | 120 | 40 | .97 | 1.0 | .3 | 0 | 5 pops sweeping left to right |
| planet | Saturn | 36+24 | 130 | 10 | .98 | 1.8 | .2 | 0 | Sphere plus a tilted ring |

**Lingering bursts and the particle budget:**
- After its `life`, a burst decays to 10 drifting embers, which stay until the SIM ages it out (`skyAge`). Its Hang pips float beside it.
- Particle count per event = `n × (0.6 + 0.2 × tier)`.
- The global pool holds 400 particles. When over budget, shrink the decorative (L3) emitters first; never drop the current burst.

### 4.5 Fusions (directional)

A fusion needs A's tube to fire immediately before B's tube. It applies to B's first burst, before B's own effect, and goes through steps 4a–4e (§3.1).

| # | A → B | Name | Bonus params | First possible with |
|---|---|---|---|---|
| 1 | Palm → Palm | Palm Grove | `aah:3` | Start (F1) |
| 2 | Salute → Comet | Thunderclap Comet | `x:0.3` | Start (F2) |
| 3 | Strobe → Crossette | Strobing Crossette | `aahPerUp:1` | Start (F3) |
| 4 | Roman Candle → Crossette | Crossfire | `aah:6` | Start (F3) |
| 5 | Comet → Thunder King | Falling Star | `xPerUp:0.25` | Start (F4) |
| 6 | Waterfall → Grand Finale | Niagara Finale | `ooh:60, xLastPerUp:0.2` | Start (F4) |
| 7 | Kamuro → Pure Sky | Midas Sky | `x:0.5` | Start (F4) |
| 8 | Heart → Strontium Star | Sweetheart Star | `aahPerColUp:[R,2,0]` | First Fusion |
| 9 | Crackle → Thunder King | Dragon's Roar | `aah:2, aahPerFired:1` | First Fusion |
| 10 | Glitter → Brocade | Golden Veil | `coin:2, aahPerColUp:[A,1,0]` | Monochrome Night |
| 11 | Dahlia → Prism | Aurora | `xPerDistinct:0.2` | Full Spectrum |
| 12 | Smiley → Town Crest | Hometown Hero | `aahPerCrowd:12` | Packed House |

**Non-fusion synergies** (Logbook "Techniques" page; information only):
- Long hang first: Willow, Glitter or a Tall Tube before Chrysanthemum, Crossette or Grand Finale.
- Clear, then Comet: Salute or Thunder King right before Comet.
- Many bursts first: Roman Candle or Mortar before Crackle, Horsetail or Barrage.
- Spotlight on a Chrysanthemum ★3.
- Mortar on a × shell.
- Grow the Crowd early: fire Girandola and Smiley in the first festivals and sell them later. The Crowd stays.
- Countdown: your last tube opens and closes the show.

### 4.6 Rigs (one per tube; they never move with shells and cannot be sold)

| id | Name | $ | Glyph | Effect | Unlock |
|---|---|---|---|---|---|
| tall | Tall Tube | 4 | Taller tube outline ↑ | This tube's bursts hang 1 longer. | start |
| brass | Brass Tube | 5 | Brass band ring | +2 Aah after each burst from this tube. | start |
| spotlight | Spotlight | 5 | Beam cone | Ooh from this tube (shell and fusion) ×2. | start |
| lucky | Lucky Tube | 4 | Horseshoe ∩ | +$1 when this tube fires (once per show). | start |
| mortar | Mortar | 10 | Double ring ◎ | This tube fires its shell twice. At most 1 Mortar per rack. | start |

### 4.7 Headliners (announced a festival ahead; each is drawn on the rack as a telegraph, §8.4)

The Counters and Rack telegraph cells are player text: the Logbook shows them as "Hurts: …" and "On the rack: …".

| id | Name | Window | Rule | Counters | Rack telegraph |
|---|---|---|---|---|---|
| headwind | Headwind | F1 (always F1 in the first-ever run) | The first burst is a dud: it scores nothing but still hangs. | a strong first shell | a gust icon on the first tube to fire, hatched to show the dud |
| drizzle | Drizzle | F1–3 | All Hang −1. | long-hanging shells | one Hang pip crossed out on every shell |
| critic | The Critic | F2–5 | A burst the same colour as the burst before it earns no Ooh (White and Rainbow exempt). | one-colour skies | a monocle between back-to-back tubes of the same colour |
| shortfuse | Short Fuse | F3–6 | Only tubes 1–5 fire. | a 6th tube | tube 6 hatched out |
| fog | Fog | F3–7 | Shells see only the 2 newest bursts. | long-hanging shells and Rainbow shells | a fog band, and no tube sees more than 2 |
| ordinance | Noise Ordinance | F3–7 | Shells printed White fire at half strength. | racks built on White shells | a ½ badge on White shells |
| windshift | Wind Shift | F4–7 | The fuse runs right to left; rigs stay put. | rigs and fusions | the fuse arrow and tube numbers reversed, and Match lit |
| ferry | Late Ferry | F4–7 | Half the Crowd misses the show: the Crowd adds only half. | a big Crowd | a ½ on the Crowd counter |
| crossed | Crossed Wires | F5–7 | Tubes 2, 4, 6 fire first, then 1, 3, 5. | fire order and fusions | tube numbers in the new firing order, and Match lit |
| streetlights | Sodium Streetlights | F5–7 | The embankment lamps wash out tubes 2, 4 and 6: their bursts count as White. | one-colour and Rainbow skies | tubes 2, 4 and 6 greyed, with a lamp icon |
| powercut | Power Cut | F6–7 | +Aah is capped at 30 per show (× still works). | big +Aah stacks | a cap mark at 30 on the Aah meter |
| rival | Rival Crew | F6–7 | Your ♛ Crowd Favourite (as of lighting) fires at half strength. | a rack that leans on one shell | a ½ on the ♛ tube |
| countdown | **Midnight Countdown** | F8 (fixed) | The fuse fires your tubes last to first, then first to last. The sky carries over, and there is **no rain check**. | Every shell fires twice | an out-and-back fuse path, with two rows of tube numbers |

**Drawing:**
- At `createState`, for f = 1..7 in order: `eligible` = the rows (in table order) with `min ≤ f ≤ max` that have not been drawn yet; pick `eligible[floor(rng() × len)]`. F8 is always `countdown`.
- In the first-ever run, F1 is then overwritten with `headwind`; the RNG call for it has already been made.
- The pool must contain 12 rows so that every window has at least one eligible row.

### 4.8 Starting kits (a constraint plus a bonus)

| id | Name | Rack (4 tubes) | $ | Crowd | Constraint / bonus | Unlock |
|---|---|---|---|---|---|---|
| apprentice | Apprentice | T1 Willow (Gold), T2 Peony (Red), T3 Strobe, T4 empty | 4 | 0 | Default | start |
| salvo | Salvo Crew | T1 Roman Candle (Red), T2 Crackle, T3–T4 empty | 0 | 0 | Shops show only 2 shell cards | Busy Sky |
| chemist | Chemist | T1 Palm (Red), T2 Heart, T3 Dahlia (Green), T4 empty | 0 | 0 | You choose the colour of every wild shell card (`setColour`); rigs are never offered | Full Spectrum |
| market | Night Market | T1 Peony (Red), T2 Strobe, T3–T4 empty | 6 | 0 | A shop opens before show 1; interest is capped at +$2 | Rigger |
| showman | Showman | T1 Girandola, T2 Peony (Red), T3 Strobe, T4 empty | 4 | 5 | Sponsors never appear | Packed House |

- Every kit's starting rack passes show 1 in the best arrangement: Apprentice 150, Salvo Crew 270, Chemist 220, Showman 192.
- The Night Market passes show 1 after buying any one card from its show-0 shop: 0 failures in 1,000 seeds. The lowest result is 126 (a non-Red Palm, 42 × 3), still above the target of 100.
- The keepsake (§7.3), if chosen, starts in Crate slot 1.

### 4.9 Sponsors (Festival 3+, Twilight and Evening shows)

- The kind is rolled uniformly for each show; the flavour names are cosmetic.
- Accepting sets this show's effective target to `round(target × 1.5)`.
- Missing a sponsored show is a normal miss. The reward pays only on a pass.
- **While Accept is on, the Crowd mood reads against the raised target.**
  - Eager with the Sponsor on is a safe bet (the cautious human proxy never missed one).
  - Hopeful is a real gamble: 68% of Hopeful shows pass.

| Kind | Flavour | Reward |
|---|---|---|
| coin | Riverside Brewery | +$2 |
| crowd | The Gazette | Crowd +4 |
| rare | The Collector | The next shop adds a 4th card: a Rare (an Uncommon in Festival 3). Rerolls keep it. |

### 4.10 Renown (the Heat ladder)

Renown is opt-in and stacks. Level n+1 unlocks when you win at level n, and a loss never resets it. Select it on the end screen or before a run. Renown 2's twists are rolled at `createState` and posted a festival ahead.

| Level | Modifier |
|---|---|
| 1 | Headliner targets +25% (not the Countdown). |
| 2 | Every Twilight from Festival 2 on gets a mild twist: Headwind, Drizzle or The Critic. |
| 3 | Rerolls start at $2 (+$1 each). |
| 4 | Tubes cost +$4 ($10 / $14). |
| 5 | Shell cards cost +$1. Upgrade prices don't change. |
| 6 | No rain check. |
| 7 | The Countdown also halves your ♛ Crowd Favourite, as Rival Crew does. |
| 8 | The Countdown fires your tubes first to last, last to first, then first to last again. Its target is 900,000. |

### 4.11 Milestones (teaching achievements)

Milestones progress in lost runs too. Progress bars show the best value ever reached. The rates in brackets are the share of runs that reach the milestone, for the greedy / novice / human proxies.

| id | Name | Condition (within one run) | Unlocks |
|---|---|---|---|
| m_fusion | First Fusion | Fire any fusion (1 / 84 / 87%) | Strontium Star, Crackle |
| m_busy | Busy Sky | 8+ bursts in one show (18 / 32 / 42% before the Countdown) | Horsetail, Cake, Salvo Crew kit |
| m_mono | Monochrome Night | A show with 5+ coloured bursts, all one colour, White ignored (4 / 30 / 29%) | Fern, Brocade |
| m_spectrum | Full Spectrum | 3 colours up at once, or bursts of all 4 colours fired in one show (2 / 17 / 27%) | Prism, Tourbillon, Chemist kit |
| m_crowd | Packed House | Crowd reaches 40 (16 / 96 / 99%) | Town Crest, Saturn, Showman kit |
| m_triple | Triple-break | Own a ★3 shell (33 / 81 / 93%) | Nishiki Kamuro |
| m_headliner | Headliner Hunter | Pass Festival 4's Headliner (2 / 87 / 97%) | Blue Moon |
| m_rigger | Rigger | 3 rigs installed at once (greedy never buys rigs; novice 97%) | Night Market kit |
| m_win | Happy New Year | Win a run | Renown 1, Afterparty, Daily Show |
| m_logbook | Logbook Half | Discover 6 of the 12 fusions | Information only: every unfound fusion shows its first shell |

### 4.12 Lessons

The end screen shows one lesson. Evaluate the predicates top to bottom; the first match wins. `{}` fields come from the run log; numbers print without a trailing ".0", and "1 bursts" reads "1 burst". Lesson 2's {show} reads "show 9 (Midsummer Headliner)". Lessons 1 and 4 reuse the near-miss search's best order (§8.6) when the end screen has it.

| # | Predicate | Text |
|---|---|---|
| 1 | Lost at the Countdown, and the best reorder of the final rack would have passed | "The Countdown fires your last tube first and last. Rearranging would have scored {n}." |
| 2 | Lost on a show lit while the crowd was Restless | "The crowd was Restless when you lit {show}. Keep building until it reads Hopeful or Eager." |
| 3 | The losing show had a × shell with more +Aah after it than before it | "Your {shell} multiplied {a} Aah, then {b} more Aah arrived after it. Fire +Aah shells first." |
| 4 | Lost on a Headliner, and the best reorder passes | "Rearranging for {Headliner} would have scored {n}. Try Rehearse (H){ and Match (M)} before Headliners." Include the Match clause only when the Headliner was Wind Shift or Crossed Wires. |
| 5 | A sky reader averaged fewer than 1.5 bursts seen over the last 3 shows | "Your {shell} saw {x} bursts on average. Put it after your long-hanging shells." |
| 6 | A clearer averaged ≤ 1 burst cleared | "Your {shell} cleared {x} bursts on average. Fire it after the sky fills up." |
| 7 | Lost on a sponsored show | "Sponsors raise the target ×1.5. Take one when the crowd stays Eager with Accept on." |
| 8 | An empty tube fired in 2+ shows while you held ≥ $3 | "An empty tube fired nothing in {n} shows. Even a Peony adds 20 Ooh." |
| 9 | Never held ≥ $5 at a payout after show 4 | "Holding $5 or more pays +$1 per $5 every show (up to +$5)." |
| 10 | Lost with no fusion all run and 3+ upgrades | "Upgrades double. ✦ fusions and × shells multiply. Drop a card on a full tube next to its partner. The old shell moves to the Crate." |
| 11 | Never upgraded | "Drop a card on its twin: all its numbers double." |
| 12 | Crowd < 25 at the end of F4 | "Girandola and Smiley pay into every future show through the Crowd." |
| 13 | Won | "Next: Renown {n+1}: {modifier}." |
| 14 | Default | "Put long-hanging shells first and the shells that count the sky after them." |

### 4.13 One-line tooltips

Each tooltip is shown once, on first encounter. Tooltips never block play and are dismissed by the next action.

- Core queues every tip (at each build open and after each action). The play screen adds the two triggers only it can see: t_sky when a shell is lifted, and t_fusion when a ✦ badge is drawn.
- One tip shows at a time. When several are due they wait in this order: t_sky, t_crate, t_fuse, t_rain, t_head, t_count, t_match, t_mood, t_sponsor, t_aah, t_fusion, t_twin, t_crowd, t_interest, t_rig, t_tube.
- A tip waits while its subject is off screen: t_fusion, t_twin and t_rig need that card in the shop, t_tube the tube button, t_sponsor an offer, t_head, t_match and t_count tonight's rule, and t_mood a visible mood.
- Lifting a shell shows t_sky at once. A tip it replaces that was up for less than 3 s returns after the next action.

| Id | Trigger | Text |
|---|---|---|
| t_fuse | Show 1 build | "Light the fuse. Tubes fire left to right." |
| t_sky | First shell lifted | "Bursts hang in the sky. The sees number counts the bursts still up when a tube fires." |
| t_aah | First Aah > 1 at the slam | "Aah multiplies Ooh." |
| t_head | Show 3 build | "Headwind: your first burst is a dud but still hangs. Open with a long-hanging shell." |
| t_mood | Show 3 build (first-ever run), after t_head | "The crowd's mood reads your rack against tonight's target. It never shows the score." |
| t_crowd | First Crowd gain | "Every show you pass grows your Crowd. It adds its size to Ooh." |
| t_interest | First payout at ≥ $5 | "+$1 for every $5 you hold (max +$5)." |
| t_twin | First twin card | "Drop it on its twin: all its numbers double." |
| t_fusion | First fusion badge | "✦ This card fuses with a shell you own. Drop it where the rack shows ✦." |
| t_crate | First shell placed in the Crate | "Crate shells don't fire. Swap them in any time." |
| t_rig | First rig card | "Rigs stay with the tube, not the shell." |
| t_tube | First tube button | "More tubes, more bursts. 6 at most." |
| t_sponsor | First Sponsor | "A sponsor raises tonight's target ×1.5 and pays if you make it. Check the crowd with Accept on." |
| t_match | First Wind Shift or Crossed Wires build | "Match re-seats your shells so tonight's fuse fires them in their usual order." |
| t_rain | First miss | "Your umbrella is red now: the rain check is used for this run." (the miss card itself says "Rain check used. One more miss ends the run.") |
| t_count | F8 build | "Midnight Countdown: the fuse fires your tubes last to first, then first to last. Your last tube opens and closes the show." |

---

## 5. Economy and pressure

### 5.1 Targets (fixed; they never read the player's power)

- Festival bases: 100, 330, 1,000, 2,600, 5,500, 9,600, 16,000, 26,500.
- Show multipliers ×1 / ×1.3 / ×1.8, rounded to 2 significant figures.
- Shows 2 and 3 are fixed at 130 and 150. Show 24 is 180,000.
- The table below is the data (`TARGETS[s]`).

| Festival | Twilight | Evening | Headliner |
|---|---|---|---|
| 1 Spring Lanterns | 100 | 130 | 150 |
| 2 May Fair | 330 | 430 | 590 |
| 3 Midsummer | 1,000 | 1,300 | 1,800 |
| 4 Regatta | 2,600 | 3,400 | 4,700 |
| 5 Harvest Moon | 5,500 | 7,200 | 9,900 |
| 6 Bonfire Night | 9,600 | 12,000 | 17,000 |
| 7 Winter Lights | 16,000 | 21,000 | 29,000 |
| 8 New Year's Eve | 27,000 | 34,000 | **Midnight Countdown 180,000** |

**Target modifiers**, in this order:
1. Renown 1: Headliners ×1.25, rounded (not the Countdown).
2. Renown 8: the Countdown is 900,000.
3. Fair Weather: ×0.75, rounded.
4. An accepted Sponsor: ×1.5, rounded.

**Curve shape:**
- **Growth per festival:** ×3.3, ×3.0, ×2.6, ×2.1, ×1.75, ×1.67, ×1.66.
- **F2–F4 is the steepest stretch**, while the engine comes online.
- **From F5 the curve eases just below measured power growth.** The oracle's median Applause/target holds flat through F5–F7 (2.70 / 2.67 / 2.61) and rises into F8 (3.58). Strong builds pull ahead before the exam, while the human proxy sits at about 2.0 (2.11 / 1.99 / 1.90 / 2.33).
- **Sawtooth:** every Headliner is followed by a shop (the breather).
  - Early Twilights sit above the previous Headliner: 150→330, 590→1,000, 1,800→2,600, 4,700→5,500.
  - Late Twilights sit just below it (9,900→9,600, 17,000→16,000, 29,000→27,000): the release after each late boss.
- The HUD always shows the next targets (§8.1).

### 5.2 Payout after a show

1. **Always paid, even on a miss:** coins from shells and rigs (Kamuro, Golden Veil, Lucky) and Crowd gained from shells.
2. **On a pass, in this order:**
   1. `interest = min(cap, floor(coins / 5))`, where `coins` already includes step 1. The cap is 5, or 2 for the Night Market.
   2. Base: $4 for a Twilight or Evening, $6 for a Headliner.
   3. The Sponsor reward.
   4. Crowd: +1, then +2 more at a Headliner, then **+2 × f more on an Encore** (Applause ≥ 2 × the effective target; F1 +2 … F8 +16).
3. **On a miss:** no base, no interest, no Crowd and no Sponsor reward.

### 5.3 Prices, caps, selling

| Item | Rule |
|---|---|
| Shell card | Commons $3–4, Uncommons $4–6, Rares $7–9, per the row. Renown 5: +$1. |
| Twin upgrade | ★1→★2: ceil(1.5 × row cost). ★2→★3: 2 × row cost. Examples: Peony $5 / $6; Crossette $8 / $10; Finale $12 / $16. |
| Twin purchase choice | A card whose id you own below ★3 shows two prices, e.g. "New $3 · Twin ★2 $5". The drop target decides which applies. |
| Tubes | Start with 4. The 5th costs $6 and the 6th $10 (Renown 4: +$4 each). Maximum 6. Available from F2. |
| Rig card | One per shop from F2 (never for the Chemist). Uniform over the unlocked rigs, excluding Mortar if one is installed. |
| Reroll | $1, then +$1 per reroll within the same shop (Renown 3: starts at $2). |
| Sell | max(1, floor(0.75 × total paid)). Rigs cannot be sold. |
| Crate | 2 slots. Moves are free, and Crate shells never fire. |
| Coins | Integers with no cap. |

### 5.4 Losing, critical state, winning

**First miss** (not the Countdown) while the rain check is unused: the rain check is spent and the **critical state** begins.
- These cues stay on for the rest of the run:
  - the umbrella icon turns red and cracked;
  - the rack rim turns red (static);
  - the fuse ember glows red.
- These cues play **only** on the first build after the miss and on every Headliner or Countdown build afterwards:
  - a "Last chance: one more miss ends the run" banner;
  - a slow 1.2 s rim pulse with no flashing;
  - a heartbeat at −24 dB.

**Second miss, or any Countdown miss:** the run ends with a 900 ms dim, then the end screen.
- With Fair Weather, the first Countdown miss relights instead (§7.4).
- A losing human-proxy run ends a median of 2 shows after its first miss (p90: 3).

**Win:** pass the Countdown. A top-tier full-sky finale plays (§9), then the end screen offers the Afterparty.

### 5.5 Colour rolls for wild shells

When a wild card is created:
1. `owned` = the colours of owned shells, excluding `W` and `X`, listed in tube order and then Crate order.
2. If `owned` is non-empty, call `rng()`. If the result is < 0.4, set `col = owned[floor(rng() × owned.length)]` and stop.
3. Otherwise `r = rng()`: Red if `r < 0.3`, Gold if `r < 0.6`, Green if `r < 0.9`, else Blue.

If `owned` is empty, step 2 makes no RNG call.

### 5.6 Shop generation (canonical order of `rng` calls)

The shop for show `s` uses festival `f = floor(s/3) + 1`.

1. **Shell cards.** `N = 3` (Salvo Crew: 2), with distinct ids. For each card in turn:
   1. Make up to 20 tries. In each try, roll `r = rng() × 100` and map it to a rarity with the table below. Let `ids` = the unlocked rows of that rarity with `fest ≤ f` that are not already on a card (table order). If `ids` is non-empty, `id = ids[floor(rng() × len)]` and stop trying.
   2. Roll the card's colour immediately if it is wild (§5.5).
   3. The price is `row cost` (+1 at Renown 5).
2. **Pity** (§5.7).
3. **Collector card** (if `rareNext`): a Rare (an Uncommon if `f = 3`) from the eligible ids not already on a card: `rng()` index, then a colour roll. Then `rareNext = false`.
4. **Rig card** (`f ≥ 2`, not the Chemist): `rng()` index over the allowed rigs in table order.
5. `rerolls = 0`.
6. **Sponsor roll** (`f ≥ 3`, `k < 2`, not the Showman, not the Afterparty): `kind = ['coin','crowd','rare'][floor(rng() × 3)]`.
7. **First-ever-run overrides.** These run after all RNG calls above and replace card contents only.
   - **Shop before show 2:** the cards become exactly Chrysanthemum (Green), Palm (Red) and Comet (Green), at $3 each.
   - **Shop before show 4** (the first F2 shop):
     - If you own a Comet, card 1 = Salute.
     - Else, if you own a Palm, card 1 = Palm in your Palm's colour.
     - Else, card 1 = Salute and card 2 = Comet (Green).
     - If an override duplicates another card's id, remove that other card.

A reroll repeats steps 1, 2 and 4 only. The Collector card is kept (appended after the new cards) and the Sponsor is unchanged.

Rarity weights by festival (Common / Uncommon / Rare):

| Festival | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8+ |
|---|---|---|---|---|---|---|---|---|
| C / U / R | 100/0/0 | 100/0/0 | 70/30/0 | 55/33/12 | 50/35/15 | 45/37/18 | 42/38/20 | 40/38/22 |

### 5.7 Pity

- A generated set of shell cards **has synergy** if any card is a twin of an owned shell below ★3, or a fusion partner (in either direction) of an owned shell.
- No synergy: `dry += 1`. If `dry > 2`, replace the last shell card with a random synergy card (Common or Uncommon, eligible, not already shown; `rng()` index, then a colour roll) and set `dry = 0`.
- Synergy present: `dry = 0`.
- Rerolls count as generations.

### 5.8 Overkill

An Encore (≥ 2× the effective target) pays Crowd +2 × f, not coins. Overkill never banks Applause. The Crowd supplies 18% of Ooh at the Countdown (human proxy, p50).

### 5.9 Resources on screen

There are exactly 4: Ooh and Aah (per show), and Coins and Crowd (per run). The Crowd mood is a forecast, not a resource.

### 5.10 Afterparty (endless; optional after a win)

- The rack, coins and Crowd carry over.
- **Targets:** `base9 = 80,000`, then `base_n = base_{n−1} × (n − 6)`, i.e. ×4, ×5, ×6. Show multipliers ×1 / ×1.3 / ×1.8, rounded to 2 significant figures: F9 80K / 100K / 140K; F10 320K / 420K / 580K; F11 1.6M / 2.1M / 2.9M; F12 9.6M / 12M / 17M.
- **Headliners combine two distinct twists** from {drizzle, critic, fog, ordinance, ferry, streetlights, powercut, rival}. On `endless`, for n = 9..12, draw `pool[floor(rng() × 8)]`, then a second twist from the remaining 7.
- There is a shop every show, but no rain check, no Sponsors and no relight.
- The run ends at the first miss, or with a victory card after show 36. Record the shows cleared and the best Applause.
- Every run ends: at the first miss, or at the hard stop after show 36. Hand-built all-★3 racks clear 2–7 of the 12 Afterparty shows. A full clear is a rare, aspirational victory: gate "every run ends; full clears ≤ 2% of oracle wins". Round 1: with the v1.1 bots, oracle wins on seeds 1–400 cleared p50 2, p90 6 shows and seed 309 cleared all 12; after the round-1 changes, 330 oracle wins cleared p50 2, p90 8, max 11, with no full clear.

---

## 6. Reveal schedule

The first-ever run is detected when there is no meta save, or `meta.runs == 0`. It uses seed `first-show`, the Apprentice kit, and the overrides in §4.7 and §5.6. The Crowd mood is hidden in shows 1–2 of the first-ever run only; with the starting rack, those shows cannot fail whatever you buy into an empty tube or a twin, or however you order the tubes. Only emptying a tube can fail one: parking a shell in the Crate, or a swap-in drop (§2.5) that parks the Strobe (Comet dropped on the Strobe at show 2 scores 51 vs 130).

| Clock (novice) | What happens | New element (one at a time) |
|---|---|---|
| 0:00 | Load opens straight into the show 1 build: skyline, riverbank, the 3-shell rack, a glowing **Light the fuse**, "Target 100", and the Headwind poster chip for show 3. There is no menu. The first tap anywhere starts audio. | Fuse and order |
| 0:04–0:08 | Show 1: Willow +20 → Peony +20 (sees 1) → Strobe +10 Ooh, +2 Aah (sees 2). **50 × 3 = 150** vs 100: pass. +$4 → $8. Crowd +1 (t_crowd). | Ooh × Aah |
| 0:10 | The shop before show 2 is curated: Crossette (Green, $5), Palm (Red, $3), Comet (Green, $3). Lifting a card shows canopy arcs and local chips on every tube (t_sky). | The sky (Hang / sees) |
| 0:10–0:30 | The chips make order matter from minute one:<br>• Crossette: the naive T4 drop sits right after the starting Strobe and fuses: **Strobing Crossette** ✦ on T3 and T4 (408, show 2's first fusion at about 0:42). Before the Strobe (T3) it scores more, 561, without the fusion; T2 357, T1 153. The show-2 choice is ✦ versus sees.<br>• Palm: T4 = 189 (its worst); right after the Red Peony = **378** (+3 Aah).<br>• Comet: T4 = 183 (its worst); moved to T1 (empty sky) = 273. | Order matters; first fusion (the sky and ✦ arrive together) |
| ~0:35 | Show 2 (target 130): the Palm build scores **378** (×2.9). **Encore!** Crowd +1 +2 → 4. Coins: $5 + $1 interest + $4 = $10 (t_interest). | First compounding; ×6 Aah (t_aah) |
| ~1:00 | Show 3, **Headwind** (the Goomba; target 150), posted since load. The crowd's mood appears (t_head, t_mood).<br>• A Willow-first rack loses only the Willow's 20 Ooh (the dud still hangs): **276**, Eager.<br>• The chip-suggested Comet opener scores **162**: Hopeful, passes.<br>• Naive T4 racks read low: Comet in T4 scores 126 (ratio 0.84, Restless) and Palm in T4 scores 132 (ratio 0.88, Hopeful, under the §3.3 thresholds). One swap fixes them (216 / 264). | Rearranging; the Crowd mood |
| ~1:30 | First F2 shop: the workshop row appears (rig card and tube button; t_rig, t_tube). Salute, Roman Candle, Heart and Girandola enter the pool. The first-run override always offers a fusion partner: Palm for Palm owners, Salute for Comet owners, and Salute + Comet otherwise. | Workshop; clearers; multi-burst |
| 0:42–2:30 | First fusion: Strobing Crossette at show 2 when the Crossette goes in T4; otherwise Thunderclap Comet or Palm Grove, now reachable with the one-gesture swap-in (§2.5). Braid banner, the toast "New fusion: Strobing Crossette (1 of 12 found)", and "First Fusion done: Strontium Star and Crackle join the shop next run". | Fusion |
| ~2:30 | Shows 5–6. The F2 Headliner (Drizzle or The Critic) has been drawn on the rack since show 1. | Posted counter |
| ~3:00 | F3: Uncommons (Crossette, Echo, Waterfall, Kamuro, Dahlia, Smiley, Glitter) and the first **Sponsor** (t_sponsor). | Risk offer |
| 3:00–5:00 | A typical first run ends here. The end screen shows one lesson (§4.12), 2 unlock bars (e.g. "Packed House 22/40", "Busy Sky 6/8") and 1 silhouette ("Salute → ?"). | — |

How the proxies' first runs end (time model in §12.2):
- **Crowd-aware novice proxy (greedy-mood):** dies in F2 (12%), F3 (34%), F4 (41%) or F5 (13%). Median show 10, 3.4 min (p10 2.0, p90 4.5). On the curated seed it reaches show 9 (3.0 min).
- **Chip-blind greedy proxy:** dies in F2–F4 93% of the time (median show 8, 2.7 min). On the curated seed it ignores the Restless crowd and loses at show 4 (1.2 min). That is the only path shorter than 3 minutes, and lesson 2 names it.

**A winning run continues:**
- **F4 (~5–6 min):** Rares (the Blue ×). Wind Shift and Late Ferry become possible Headliners, and Match appears (t_match).
- **F5:** Crossed Wires and Sodium Streetlights.
- **F6:** Power Cut and Rival Crew.
- **F7:** the Countdown is posted (t_count), and Rehearse and the mood matter.
- **F8:** the Countdown exam.

New patterns arrive every 2–3 shows: fusions, twins, rigs, Sponsors, Headliner types, Match, then the Countdown.

**Across runs:**
- **Run 1:** usually First Fusion, sometimes Monochrome Night.
- **Runs 2–4:** Packed House, Busy Sky, Triple-break, Headliner Hunter, Rigger and Full Spectrum. Each unlock adds 1–3 rows or a kit; the end screen shows only the nearest silhouette.
- **First win:** Renown 1, the Afterparty and the Daily Show.

### 6.1 Tutorial (Rehearsal Night)

An optional, interactive tutorial of about 2 minutes. The player plays a scripted run of short shows that cannot be failed, one instruction at a time. A spotlight rings the one control to use, and the step advances when the player actually does it. It is never a gate: the game still opens straight into play (§6), and Skip or Esc always leaves it.

**Entry points:**
- A dismissible offer on the first launch: "New here? Play the 2-minute tutorial". It shows while `meta.tutorial` is unset; dismissing it sets `meta.tutorial = 'skipped'`.
- "Play the tutorial" in Help, and "Tutorial" in Pause.

**Rules while it runs:**
- The run in progress is set aside in memory (never in storage), with the undo stack and every per-run field, and comes back exactly as it was (same `hashState`). A show that is resolving finishes first. A run that had ended comes back to its end screen.
- Entering saves the run in progress once, as a page hide would, so a tab closed mid-tutorial keeps the player's last moves. From then on the stored run never changes.
- It writes no run save: a save during the tutorial writes the settings and the real meta and keeps the stored run as it is.
- It records no meta progress, milestones, Logbook entries or records, and shows no first-run tips or toasts. Its bookkeeping lands in a scratch copy of the meta that is thrown away, and the `meta`, `milestone`, `unlock`, `discover`, `toast` and `tip` events are muted. `announce()` still speaks.
- The show flow is the normal one (light → FX → RESULT → BUILD) but never reaches END.
- Only the step's action is allowed (the UI swallows every other input). If the action cannot happen, a "Show me" / Next fallback appears after a short delay, so nothing soft-locks.
- Finishing sets `meta.tutorial = 'done'`. With no run set aside it offers **Start your first run** (a first run while `meta.runs` is 0). With a run set aside it offers only **Back to my run**, because a one-tap new run there would throw away the set-aside run unrecorded; ending a run stays a Pause decision. The tutorial can't be entered while a show is resolving. Leaving early sets `'skipped'` unless it is already set. Setting it writes the meta only, never a run save.

**The scripted run** (seed `rehearsal-night`, Apprentice, first-run flags). Steps 1–6 are exactly the first-ever run's opening (§6): show 1 with Willow (Gold), Peony (Red) and Strobe, then the curated show-2 shop (Crossette, Palm, Comet). Show 3 is left out: it is the Headwind Headliner, and a dud would muddle the fusion lesson. Step 7 opens a scripted show 4 (May Fair Twilight, no rule twist, $10, Crowd 4) with the rack Willow, Peony, Strobe, Palm, so that a Crossette dropped on the Palm fires right after the Strobe. Every number below is the SIM's, and `tools/test-sim.mjs` checks each one against the step text.

| # | Title | Spotlight | The player… | What the SIM does |
|---|---|---|---|---|
| 1 | Light the fuse | Light the fuse | lights show 1 (target 100) | Willow +20, Peony +20 (sees 1), Strobe +10 Ooh, +2 Aah (sees 2): **50 × 3 = 150**, pass. +$4 → $8, Crowd 1. |
| 2 | Ooh × Aah | the result card | taps Next | "Applause is Ooh × Aah: 50 × 3 = 150. It beat the target of 100, so the show passes." |
| 3 | The sky | the Peony's and Strobe's sees chips | taps Next | The chips read sees 0 / 1 / 2 for Willow / Peony / Strobe. |
| 4 | Buy a shell | the Palm card, then tube 4 | buys the Palm (Red, $3) into the empty tube 4 | Palm in tube 4 sees only the Willow: +12 Ooh and no Aah (a 189 rack). Swap-ins are off here (first run, show 2). |
| 5 | Order matters | Palm, then tube 3 | moves the Palm to tube 3 (it swaps with the Strobe) | Palm now fires right after the Red Peony: +3 Aah. The rack reads 378 (was 189). |
| 6 | Watch it pay off | Light the fuse | lights show 2 (target 130) | **63 × 6 = 378**, an Encore. Crowd 4, $10. |
| 7 | Twins | the Peony card, then the Peony | taps the Peony card, then the Peony | Peony ★2: +20 Ooh becomes +40 (the text quotes both). $5 left. |
| 8 | Fusions and swapping | the Crossette card, then the Palm; then Light the fuse | swaps the Crossette in for the Palm (`displace: 'crate'`), then lights show 4 (target 330) | Palm goes to the Crate. Strobe → Crossette fuses (**Strobing Crossette**, +1 Aah per burst up): **74 × 8 = 592**, pass. Crowd 5. |
| 9 | The Crate and the Crowd | the Crate slot and the HUD Crowd | taps Next | Palm rests in the Crate; the Crowd added its size (4) to Ooh. |
| 10 | Mood, Headliners and the rain check | the mood, the Headliner chip and the umbrella | taps a finish button | Show 5 (target 430): the mood reads Eager; the Headliner (show 6) is posted; the rain check is unspent. |

Two changes from the first draft of the script, both for the real rules:
- Step 4 names tube 4's chips only. In the first run's show 2 the swap-in is off, so a held card shows chips on the empty tube and the Crate, not on every tube.
- Palm's text says "adds 3 Aah when a Red burst is up": Palm checks for one burst of its colour, not one per burst.

**Steps as data.** `DATA.TUTORIAL[i] = {id, title, text, state, target, expect, do, last?}`:
- `state`: `'fresh'` means the core loads `tutorialState(i)`. `'live'` means it keeps the state the player's own actions made, as long as that equals `tutorialState(i)` (same `hashState`); otherwise it loads the scripted state.
- `target`: the CSS selectors to spotlight, drawn from the contract's DOM ids.
- `expect`: `{type:'result'}`, `{type:'buy', card, tube, displace?}`, `{type:'move', from, to}`, `{type:'upgrade', card, tube}`, `{type:'fusion', key}` or `{type:'next'}`. Tubes are 0-based. A list is a sequence of phases, each with its own `text`: step 8 is the swap-in, then the fusion.
- `do`: the exact SIM actions that complete the step. "Show me" plays them, and so do the tests.

`tutorialState(i)` is pure and deterministic. It replays the script from step 1: each earlier step's `do`, plus the fresh setups of steps 1 and 7. Every state is a plain, valid build-phase state.

---

## 7. Meta, Logbook, persistence

### 7.1 Logbook (codex)

Tabs: **Shells** 34 · **Fusions** 12 · **Headliners** 13 · **Rigs** 5 · **Kits** 5 · **Records**.

- **Seen but not unlocked:** a silhouette plus its milestone and progress, e.g. "Busy Sky: 6/8 bursts".
- **Fusions:**
  - Undiscovered, and you have never owned its A shell: "? → ?".
  - After you own A: "Salute → ?".
  - Discovered: the full entry, plus the number of times fired.
- **Records:**
  - Best show (Applause, show, seed).
  - Best run (shows reached, total Applause).
  - Fastest win (ms of build time).
  - Best Afterparty.
  - Wins by kit.
  - Highest Renown won.
  - A poster of the last 5 runs (rack JSON, re-rendered on view).

### 7.2 Unlock flow

Milestones are checked on SIM events during a run. Unlocks apply to the **next** run and are revealed on the end screen as cards, one "Just unlocked" card each.

### 7.3 Keepsake

- On the end screen, pick one **Common** shell from the final tubes and Crate, or "None". If none of them is Common, offer 3 random unlocked Commons.
- It starts the next run in Crate slot 1 at ★1, with its colour.
- It is stored in `meta.keepsake` and consumed by the next `createState`.

### 7.4 Assist, mood and daily

**Fair Weather** (assist):
- A settings toggle: all targets ×0.75, and the Countdown may be **relit once**. After a Countdown miss you return to the Countdown build with the same rack and coins, with no new shop and no Sponsor. Shell coins and Crowd from the failed attempt are kept.
- It is labelled on the HUD umbrella, the end screen and in records ("Fair Weather").
- It doesn't block milestones, but it does block Renown progress.
- It more than doubles the novice proxy's win rate (16.8% → 49.5%, same 400 seeds).

**Crowd mood** (setting: On/Off, default On): Off hides the mood pill and the crowd's poses. It has no effect on records.

**Daily Show** (after the first win):
- Seed `daily-YYYY-MM-DD` (local date), Apprentice kit, Renown 0.
- It is an invitation only: no streaks and no timers.

### 7.5 Persistence

- Key `oohxaah.v1`. Every read and write goes through a try/catch wrapper.
- On load: parse, check `v === 1` and the field types, and replace any invalid sub-object with defaults.
- The game must run with no storage at all.

```json
{
  "v": 1,
  "settings": {"sound": true, "sfxVol": 0.8, "music": true, "musicVol": 0.35,
               "reducedMotion": "auto", "highContrast": false, "speed": 1.0,
               "instant": false, "haptics": true, "chips": "full", "mood": true, "fairWeather": false},
  "meta": {"runs": 0, "wins": 0, "unlocked": ["m_fusion"],
           "progress": {"m_busy": 6, "m_crowd": 22, "m_spectrum": 2, "m_mono": 4, "m_rigger": 2, "m_logbook": 1},
           "renown": {"max": 0, "selected": 0}, "kit": "apprentice",
           "keepsake": {"id": "palm", "col": "R"},
           "seenTips": ["t_fuse"],
           "codex": {"shells": {"palm": {"seen": true, "owned": 3}},
                     "fusions": {"salute>comet": {"leftSeen": true, "found": true, "fired": 4}},
                     "headliners": {"fog": 1}, "rigs": {"tall": 2}},
           "records": {"bestShow": {"score": 12735, "show": 12, "seed": "k3j9"},
                       "bestRun": {"shows": 18, "total": 210044}, "fastestWinMs": null,
                       "bestAfterparty": 0, "winsByKit": {}},
           "posters": []},
  "run": null
}
```

- `run` = `{state, uiSeed}`, where `state` is the full SIM state JSON, including the RNG state.
- `meta.tutorial` = `'skipped'` \| `'done'`, absent until the player answers the tutorial offer or plays the tutorial (§6.1). The tutorial itself never writes `run`.
- Save the run after every `light` and on `visibilitychange` to hidden. Clear it when the run ends.
- Loading an existing run opens its build phase directly, so it is still one tap from load. "New run" lives in the pause menu.
- Save settings on change, and meta at run end and on unlock.
- **Settings → Export save / Import save** use a base64 string in an in-page text field. Never use `prompt()`.

---

## 8. Screens, layout, visual identity

### 8.1 Layout

**Play column:**
- `width: min(100%, 480px)`, centred, `height: 100%`, 16 px side gutters. It is a CSS grid with 4 px gaps.
- A `ResizeObserver` on the column picks the height mode:

| Mode | Column height | Behaviour |
|---|---|---|
| **Regular** | ≥ 700 px | Rows below. |
| **Compact** | < 700 px | Rows below. |
| Compact with scroll | < 520 px | The column becomes a vertical scroll container (`overflow-y:auto`) and the Fire row is `position:sticky; bottom:0`, so **Light the fuse is never clipped**. |

**Widths at 360 px** (328 px usable):
- Tubes: 6 × 48 + 5 × 8 = 328.
- Tools row: 2 × 44 (Crate) + 8 (divider) + 4 × 44 (tools) + 4 × 8 (gaps) = 304.
- Every tap target is ≥ 44 × 44 px, and every text is ≥ 16 px.

**Regular rows** (portrait 360 × 740):

| Row | Height | Contents |
|---|---|---|
| HUD | 60 | **Row A (32):** festival · show name (Fraunces 600, 18 px, ellipsis) on the left; coins `$12`, crowd glyph + `84`, umbrella (44 px hit area) and pause ⏸ (44 px) on the right. **Row B (28):** **Target 430** (bold), then "▸ 590♛ · 1K" (the next 2 targets; ♛ marks Headliners), then the Headliner icon chip, whose 44 px hit area opens the card. |
| Sponsor strip | 0 / 40 | Only when offered: "Sponsor ×1.5 → 645 · pays +$2 [Accept]". It is a toggle with a 44 px hit area. The flavour name is in the `aria-label` and the inspect sheet. |
| Sky canvas | 1fr, min 140 | Skyline and riverbank crowd at the bottom (36 px); lingering bursts with Hang pips; reader threads; the live readout "OOH 145 × AAH 19.5" at top centre (Fraunces italic 22 px); a cheer meter on the right edge (8 px bar with a target tick, filling live). The result card is pinned here after the slam. The **info card** docks at the sky's bottom edge while a card or tube is selected: 68 px, the card text in 3 lines at 16/20 px, plus ⓘ. |
| Rack | 132 | Fire-order numerals (16 px) → "sees N" chips (18 px) → tube tokens (48 × 60, 8 px gaps) → rig plates (16 px) → fuse line with ember (6 px). ♛ badge on the favourite tube. Countdown builds show two numeral rows. |
| Tools | 52 | Crate × 2 (44 px slots) pinned on the left and always visible, then an 8 px divider, then Undo, Match, Restore and Rehearse (44 px icon buttons with `aria-label`s). Match is disabled unless tonight's rule permutes the fuse. |
| Shop | 124 | **3 cards:** 104 × 120 vertical cards (token 48 × 60, name up to 2 lines at 16 px with `hyphens:auto`, price chip, rarity pips, one badge: "✦ Fuses", "Twin ★2 $5", "Collector" or "Pity"). **4 cards:** a 2 × 2 grid of 160 × 58 tiles (token 40 × 48, one-line name, price and badge). |
| Workshop | 48 | Rig card (glyph, name, $), Add tube ($6 / $10) and Reroll ($n). Hidden in F1. |
| Fire | 56 | **Light the fuse** in the thumb zone. Beside it, a separate **mood button**: a crowd glyph (arms down / half / up) plus "Restless", "Hopeful" or "Eager". Tapping it opens a one-line sheet explaining the mood. *(Build decision: as part of the fire button, tapping the pill to learn what it meant lit the fuse.)* |

- Fixed rows total 472 px, plus 28 px of gaps = 500 px.
- At 740 px the sky gets about 240 px, or about 196 px with the Sponsor strip.

**Compact rows** (portrait 360 × 640, 375 × 548):

| Row | Height | Contents |
|---|---|---|
| HUD | 44 | One row: pause (44), the flex target block ("**Target 430** ▸590♛" with an inline Headliner icon; `min-width:0`, ellipsis), `$12`, crowd `84`, umbrella (44). The festival · show name moves to a DOM label at the sky's top-left. |
| Sky canvas | 1fr, min 96 | As Regular. The Sponsor offer overlays the sky's top edge as a 40 px strip instead of taking a row. The info card is 48 px (2 lines, ⓘ for more). |
| Rack | 120 | Numerals (16) → sees chips (18) → tokens 48 × 56 → rig plates (14) → fuse (6). |
| Tools | 48 | As Regular. |
| Shop | 96 | **3 cards:** 104 × 96 (token 40 × 48, one-line name with ellipsis, price chip). **4 cards:** a 2 × 2 grid of 160 × 44 tiles (token 32 × 40, one-line name, price chip). |
| Workshop | 44 | As Regular. |
| Fire | 48 | As Regular. |

- Fixed rows total 400 px, plus 24 px of gaps = 424 px.
- The sky gets 216 px at 640, 124 px at 548, and reaches its 96 px minimum at 520.

**Names and card text:**
- Full shell names are always in the card's `aria-label`, the info card and Inspect.
- Card text is at most 64 characters, with numbers scaled for the shell's ★.

**During RESOLVING:** the shop, workshop and tools rows keep their space and dim, and the Fire button becomes **Skip ▸▸**. *(Build decision: sliding the rows away and growing the sky caused about 36 layout shifts per show; keeping the space brings it to 2.)* The info card may grow to 88 px when an owned shell's rule needs three lines.

**Desktop (1440 × 900):**
- Three columns over a full-bleed decorative sky; the sky keeps drawing bursts behind the side panels at low alpha (L3).
- **Left (320 px), Festival board:** 8 festival rows with their targets, the posted Headliner cards, a marker for the current show, and a target-curve sparkline with your Applause dots.
- **Centre:** the play column (480 px, Regular mode; ideal sky height 420).
- **Right (360 px), Show log:** an attributed breakdown of the last show, one line per burst ("T3 Palm (Red) · sees Peony · +12 Ooh · +3 Aah"), fusions, the crowd cheer, ♛ and the Applause. A Logbook shortcut sits below it.
- On mobile, the Show log opens by tapping the Applause number on the result card.

### 8.2 End screen (a scrolling card; focus lands on **Run it back**)

1. **Header:** "The crowd went home: Harvest Moon, show 14", or "Happy New Year!". Seed, kit, Renown, and the Fair Weather label if it was on.
2. **Poster (180 px):** the final rack painted as a festival poster: each shell's burst pattern in its tube column, with the festival name in Fraunces. Saved to `posters`.
3. **Applause per show:** a log-y line with dots, over the target curve drawn as a dashed step line. Misses are red ×; Headliners are ♛ markers; sponsored shows have a ring.
4. **Best show:** its Applause and which show it was.
5. **Near-miss** (after a loss), e.g. "412 short (95%) at Harvest Moon · Late Ferry. Late Ferry cost you 1,030. Swapping Willow and Comet would have scored 8,420." See §8.6.
6. **Lesson:** §4.12.
7. **Unlock bars:** the 2 nearest milestones as bars with "best / goal", plus 1 silhouette (the nearest undiscovered fusion or shell).
8. **What made your applause:** a small Pareto bar chart: per-shell share of the run's Applause plus a "Crowd" bar, sorted, with a cumulative line and an 80% marker. No jargon.
9. **Keepsake picker:** a row of Common tokens plus "None".
10. **Buttons:**
    - **Run it back:** primary; Enter or R; new random seed; restarts in under 1 s.
    - Replay seed · Kit ▾ · Renown ▾ · Logbook.
    - After a win, **Afterparty** is the second button.

### 8.3 Other screens

- **Logbook:** a full-screen sheet with tabs (§7.1): a grid of 72 px tiles; tapping one opens its rule text.
- **Settings:**
  - Sound on/off + volume; Music on/off + volume.
  - Reduced motion (Auto / On / Off); High contrast.
  - Show speed (50 / 75 / 100%); Instant results (skip the chain animation and show a breakdown list instead).
  - Haptics (only if `navigator.vibrate` exists); Chips (Full / Partners only); Crowd mood (On / Off).
  - Fair Weather.
  - Export / Import save.
  - Reset progress: an inline 2-tap confirmation that stays armed until the next input. There is no timer.
- **Pause:** Resume (focused) · Settings · Logbook · Help · Seed · Abandon run (an inline 2-tap that stays armed until the next input).
- **Help:** the 3-line rules card, the glossary and the key map.

### 8.4 Build-phase legibility layer

- **Fire-order numerals:** above each tube, the burst order under the preview rule. Multi-shot tubes show a range ("3–5"). The last burst gets a ★ "LAST". The Countdown shows a countdown row (N…1) above a celebration row (N+1…2N).
- **"Sees N" chips:** always on during the build, computed with `previewChips` under the preview rule.
- **Holding a shell** (dragging it, or with a card selected):
  - Every legal target shows local chips: "+60 Ooh · sees 3", "+9 Aah", "×1.8 (+6 Aah)", "✦ ?", "Crowd +4", "fires 6th of 6 · LAST". A × chip adds the Aah its × terms add at that burst (`xAah`), so it compares with a +Aah chip.
  - ✦ shows on both pieces of a fusion: on the second piece (`fusion`) and on the first piece's tube when the next tube to fire holds its partner (`fusionNext`).
  - An occupied tube that is not the card's twin is a legal target too (one-gesture swap-in, §2.5): "Swap in · old shell → Crate", or "Replace +$n" when the Crate is full (the old shell is sold). Its chips preview the rack with the new shell in that tube.
  - A canopy arc is drawn over the tubes that will see this burst.
  - **No totals.** With Chips set to "Partners only", only the fusion and direction badges show.
- **Crowd mood** (`mood()`):
  - Recomputed after every build action and every Sponsor toggle; it reflects the current rack only, never a held card.
  - It shows as the Fire pill, the crowd's arm pose and the band on the cheer meter.
  - The pill always shows tonight's mood.
- **♛ Crowd Favourite:** recomputed after every build action.
- **Rehearse (H):**
  - Sets the preview rule to the next posted Headliner, which drives numerals, chips and overlays. A second pill, "Rehearsing Wind Shift: Eager", sits at the sky's top-left, computed against that show's target.
  - It turns on automatically during a Headliner's own build (tonight's rule).
  - The overlays are those in the telegraph column of §4.7.
- **Match (M)** and **Restore (B):** see §2.5.

- **Fusions at rest and fusions at risk** *(round-4 review)*: a live fusion (or a first piece whose partner fires next) carries a ✦ badge on its token at rest. While holding a card or shell, a drop target whose drop would end a live fusion shows a `✦✕` chip, and its label says which fusion it breaks. `previewChips` reports this as `breaks: [{key, name}]`.

### 8.5 Visual identity

**One deliberate night look.** Define the tokens on `:root`, and repeat the same values under `@media (prefers-color-scheme: dark){:root:not([data-theme="light"])}` and under `:root[data-theme="dark"]`. High contrast lives under `:root[data-contrast="high"]`.

| Token | Value | High contrast |
|---|---|---|
| `--bg` | `#070A18` | `#000000` |
| `--sky-top` | `#0B1026` | `#000000` |
| `--sky-horizon` | `#1B1440` | `#0A0A0A` |
| `--ink` (silhouettes) | `#05070F` | `#000000` with a 1 px `#FFFFFF` rim |
| `--wood` / `--wood-hi` | `#3A2A1C` / `#5A4330` | `#1A1A1A` / `#FFFFFF` |
| `--brass` (fuse, rims) | `#C9A227` | `#FFD166` |
| `--paper` (text) | `#F4EFE6` | `#FFFFFF` |
| `--paper-dim` | `#B9B2C7` (≈9:1 on sky-top) | `#E6E6E6` |
| `--line` | `#2A2F4A` | `#FFFFFF` |
| `--ooh` chip | `#FFFFFF` on `rgba(255,255,255,.12)` | same |
| `--aah` chip | `#F2C14E` | `#FFD166` |
| `--x` chip | `#F2C14E` text in a `#56B4E9` ring | `#FFD166` in `#8AD7FF` |
| `--danger` | `#F07560` (build decision: lifted from `#E0533D` to reach 4.5:1 on every surface) | `#FF6B5E` |
| `--ok` | `#7BD389` | `#8CFF9E` |
| `--focus` | `#FFD166`, 3 px outline, 2 px offset | same |
| Colour tokens | §4.1 | §4.1 |

- **Type:** Google Fonts **Fraunces** (italic 700 for the Applause number and banners; roman 600 for show names; `opsz` 9..144) and **Atkinson Hyperlegible** (400/700 for the UI; ≥ 16 px; `font-variant-numeric: tabular-nums` where supported).
  - Fallbacks: `Georgia, 'Times New Roman', serif` and `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`.
- **Sky:** a vertical gradient from `--sky-top` to `--sky-horizon`.
  - The skyline is procedural from the seed: rooftops, a church spire, a bridge with 3 arches.
  - The river reflects bursts at 25% alpha with a 2 px sine wobble.
  - Crowd silhouettes along the embankment: `figures = min(160, 6 + floor(14 × log2(1 + crowd/4)))`.
  - During the build their arms show the mood (down / half / up). During resolution they rise with the live cheer meter.
- **Rack:** wooden planks, brass tube rims and a brass fuse line.
- **Permanence:**
  - Soot on each tube rim darkens in 5 steps with `log2(1 + timesFired)`.
  - Smoke haze builds over each festival and clears at the next.
  - The crowd grows for the whole run.
- **Number format:** below 10,000, grouped (`8,100`). Then `12K`, `1.2M`, `3.4B`, and `1.23e12` beyond 999B.

### 8.6 End-screen computations

**Near-miss** (asynchronous, chunked into 8 ms slices, finished within 1 s):
1. From `finalPreLight`, build these candidates:
   - A. The best arrangement of the tube shells (all permutations, at most 720) under the show's rules.
   - B. Each single legal build action from `finalPreLight` (buy, upgrade, rig, tube, move, sell, match; Sponsor off if it was accepted), applied without re-arranging.
2. Report the passing candidate with the smallest change, preferring arrangement-only candidates. If nothing passes, report the closest one.
3. Headliner cost = Applause without the rule − Applause with it.

**Pareto attribution (Shapley values):**
1. For every lit show, the players are the occupied tubes plus **the Crowd**. `v(S)` = the Applause with the tubes outside `S` emptied (rigs stay), the Crowd set to `crowd` if the Crowd is in `S` and to 0 otherwise, the same rules, and `fav` fixed at its lit value. `v(∅) = 0`.
2. Compute exact Shapley values: 2^(n+1) ≤ 128 resolves per show.
3. They sum exactly to the show's Applause. Clamp the rare negative values to 0 (seen in fewer than 0.5% of shows) and renormalise to shares of 100%.
4. The run chart is the mean of the per-show shares, grouped by shell id plus "Crowd".
5. Cost: about 1.6 s of node time for 1,400 shows, i.e. about 30 ms per run. Run it in the same 8 ms chunks.

---

## 9. Juice map

**Tiers:**
- Gains: `tier = clamp(floor(log10(max(1, v))), 0, 6)`.
- × factors: `clamp(round(3 × log2(factor)), 0, 6)`.

**Scaling by tier:**
- Popup font size: 16 + 4 × tier px, maximum 40.
- Particles: see §4.4.
- Shake applies to the world layer only, on × and clear events only. It uses `trauma²`, decays at 1.5/s, and is capped at 2% of the short side and 2° of rotation. Trauma per event = 0.15 + 0.08 × tier.
- Hit-stop freezes the SIM playback only; it never freezes rendering, UI tweens or input. Overlapping hit-stops take the maximum instead of adding.

**Chain pacing:**
- The interval before burst `k` = `max(110, 420 × 0.86^k)` ms ÷ speed. A 7-burst show takes about 2.4 s; a 14-burst Countdown about 3.8 s.
- Identical consecutive popups within 150 ms and 40 px merge ("+15 ×3").
- At most 12 popups on screen.
- A tap switches to ×4 for the rest of the chain; Skip jumps to the slam.

| SIM event | Visual (L1 critical / L2 state / L3 decoration) | Audio | Haptic |
|---|---|---|---|
| `buildOpen {show, target, rules, sponsor, mood}` | L1: the target rolls in; the Headliner chip pulses when k=2; the Sponsor strip slides down. | Soft page chime | — |
| `moodChanged {bucket, preview}` | L2: the Fire pill cross-fades to the new word; the crowd's arms re-pose (220 ms); the cheer-meter band moves. | Crowd murmur, one step higher for each better bucket (−30 dB) | — |
| `bought / upgraded / moved / sold / rigInstalled / tubeAdded / matched / restored` | L1: the token pops in (easeOutBack, 180 ms). Upgrade: the twins slam together with a gold ring and a new star pip. Sell: coins fly to the HUD. Tube: a new tube rises from the planks. Match: the shells arc to their new tubes (260 ms, staggered 30 ms). | Pluck pitched by colour (Red G4, Gold A4, Green E4, Blue C5, White D4); coin blip | 8 ms on drop |
| `rerolled` | Cards flip, staggered 60 ms | Card shuffle (3 noise clicks) | — |
| `fuseLit` | The ember crawls along the fuse to the first tube (280 ms) | Hiss (band-passed noise) | — |
| `launch {tube}` | L2: the tube recoils (squash 1.25 × 0.8, 120 ms). L3: a mortar trail up its column. | Launch thump | — |
| `burst {tube, shell, col, sees, dud, half, washed}` | L1: the burst pattern blooms. L2: reader threads (1.5 px, burst colour at 60% alpha) to every burst counted, pulsing for 250 ms. Dud: a grey puff and a "dud" tag. Half: a "½" badge. Washed: a desaturated bloom. | Burst noise pitched by colour; link chime one pentatonic step higher per burst | — |
| `gainOoh {v, tube}` | White "+80 Ooh" popup; the OOH counter punches (1.15×, 90 ms) | Crowd "oo" vowel, gain ∝ tier | — |
| `gainAah {v}` | Gold "+6 Aah" popup; the AAH counter punches | Crowd "aa" vowel | — |
| `multAah {factor}` | Gold-on-blue "×1.8" slam with a ring shockwave; AAH counter punch 1.3×; shake; hit-stop 40 + 20 × tier ms (max 120) | × bell (FM), pitch rising with tier | 15 ms |
| `fusion {name, first}` | The two bursts braid (bezier spiral, fusion pink) and a name banner shows for 900 ms; hit-stop 100 ms. First discovery adds a "New fusion: Thunderclap Comet (1 of 12 found)" toast. | Fusion chord | 20-30-20 ms |
| `clear {n}` | A white wave sweeps the sky and the cleared bursts fly into AAH as sparks; shake | Boom + whoosh | 12 ms |
| `extend {n}` | Every burst up gains a Hang pip with a sparkle | High chime | — |
| `repeat {from, rate}` | Ghost copies of the repeated bursts at 50% alpha; popups tagged "echo" | Echo tap (delay 90 ms, feedback 0.3) | — |
| `crowdGain {v}` | New silhouettes walk in; "Crowd +4" chip | Murmur swell | — |
| `coinGain {v}` | A coin sparkle flies to the HUD | Coin blip | — |
| `skyAge {expired}` | Expired bursts fade from embers to nothing (300 ms) | — | — |
| `crowdCheer {v}` | A stream of light flows from the riverbank into OOH; "Crowd +84 Ooh" | Crowd roar, gain ∝ log(crowd) | — |
| `applause {ooh, aah, score, target, pass, encore}` | The OOH and AAH chips slide together, then a × spark. The number rolls up (400 ms of exponential smoothing), then slams (Fraunces, sized by tier). The crowd's arms rise ∝ min(1, ratio). Pass: "Pass ×2.9" in green. Encore: an "Encore!" banner. Miss: "412 short" in red and the crowd deflates. | Applause noise (1.2–2.5 s, gain ∝ log ratio). Miss: a falling two-tone. | Pass 20 ms; miss 60-40-60 ms |
| `payout {...}` | An itemised ticker on the result card | Coin blips (max 5) | — |
| `rainCheck` / `critical` | The umbrella cracks and the rim turns red. The pulse and "Last chance" appear only on the builds listed in §5.4. | Heartbeat at −24 dB, only on those builds | 40 ms |
| `relight` (Fair Weather) | "The crowd stays for one more!" banner; the sky resets | Rising two-tone | 20 ms |
| `milestone {id, value}` | Toast "Busy Sky: 6 of 8 bursts in one show"; on completion "Triple-break done: Nishiki Kamuro joins the shop next run". In the first run, progress toasts wait until show 4. | Tick | — |
| `runLost` | The sky dims and the lanterns go out; end screen after 900 ms | Low drone fades out | — |
| **Top tier** (Headliner or Countdown clear, run-best show, `runWon`) | Full-sky finale (every tube fires a barrage); one white flash (never more than 3 flashes per second); hit-stop 150 ms; confetti embers | Bass thump + 5-note pentatonic fanfare | 40 ms |

**Reduced motion** (from the OS setting or the toggle):
- No shake, hit-stop zoom, travelling sparks or flashes.
- Bursts become radial-gradient glows that fade over 400 ms.
- Popups fade in place; counters update without a punch; the crowd's arms step instead of animating.
- The chain interval is fixed at 300 ms.

**Visual hierarchy check (squint test):** at the biggest chain (the 14-burst Countdown), the live readout, the fire numerals and the Applause keep the highest contrast. L3 stays at ≤ 40% alpha and behind L1.

---

## 10. Audio (procedural WebAudio only)

**Graph:**
- One `AudioContext`, created or resumed lazily inside the first `pointerdown` or `keydown`.
- `sfxGain` and `musicGain` feed `masterGain` (0.9), which feeds a `DynamicsCompressor` (threshold −18 dB, knee 12, ratio 4, attack 3 ms, release 250 ms), then the destination.
- A prebuilt 2 s white-noise buffer. Brown noise comes from a leaky integrator.
- At most 8 simultaneous one-shots (steal the oldest); 30 ms de-duplication per sound id; pitch jitter ±4%.
- Envelopes use `setValueAtTime` and exponential ramps from 0.0001.
- Suspend when hidden. Sound is never the only cue for anything: the mood always has its word, and the heartbeat has the rim.

| Sound | Recipe |
|---|---|
| Pluck (UI) | Triangle wave at the colour pitch; 5 ms attack; 180 ms exponential decay; plus the 2nd harmonic at −12 dB |
| Coin | Square wave 1,320→1,760 Hz over 60 ms; low-pass at 3 kHz; gain 0.12 |
| Fuse hiss | Noise → band-pass at 3.5 kHz, Q 2; 350 ms; gain 0.15; 6 random 4 ms crackle clicks |
| Launch thump | Sine 90→40 Hz (exponential, 120 ms), gain 0.6; plus a 20 ms noise click (high-pass at 1 kHz) |
| Burst | Noise → band-pass at the colour's centre (Red 900, Gold 1,400, Green 700, Blue 2,000, White 3,000 Hz), Q 0.8; 5 ms attack; decay 400 + 80 × tier ms. Crackle, Glitter and Brocade add 12–30 random 4 ms clicks over 600 ms. |
| Link chime | Sine plus a 3rd harmonic at −14 dB. C-major pentatonic from C5 (523.25 Hz), one step up per burst, +1 octave after 10 steps. 250 ms decay; gain 0.18. |
| **Crowd vowels (signature)** | Noise mixed with 1–3 detuned sawtooths (150–220 Hz; voices = 1 + (crowd ≥ 20) + (crowd ≥ 80)) through two parallel band-pass formants. "Oo": F1 300 Hz (Q 8), F2 870 Hz (Q 10). "Aa": F1 730 Hz (Q 6), F2 1,090 Hz (Q 8). 60 ms attack; 300–700 ms release by tier; gain 0.15 + 0.06 × tier (max 0.5). |
| Mood murmur | The same vowel graph at −30 dB, 400 ms. Restless uses the "oo" formants at 150 Hz, Hopeful a 50/50 mix, Eager the "aa" formants at 220 Hz. |
| × bell | 2-operator FM: carrier 880 × (1 + 0.06 × tier) Hz, modulator ratio 3.5, index 3→0 over 1.2 s; gain 0.3 |
| Fusion chord | 3 triangle waves (pentatonic root, 3rd and 5th), 700 ms, staggered 30 ms |
| Clear | Sine at 60 Hz for 300 ms, plus a whoosh (noise with a low-pass swept 400→4,000 Hz over 400 ms) |
| Crowd roar / applause | Noise → band-pass at 1.2 kHz, Q 0.7, amplitude-modulated by random 10–20 Hz pulses; 1.2–2.5 s; gain ∝ log10(ratio + 1) |
| Miss | Sine 330→220 Hz over 400 ms, plus a murmur |
| Heartbeat | Two 55 Hz sine thumps 80 ms apart, every 1.1 s, at −24 dB. Only on the builds listed in §5.4. |
| Fanfare | 5 pentatonic notes (sawtooth → low-pass at 2 kHz, 120 ms each), plus a 400 ms 50 Hz sine thump |
| **Music** (on by default, volume 0.35) | River bed: brown noise low-passed at 400 Hz, at −30 dB. Pad: 2 detuned triangle waves per note on roots C, Am, F, G, 8 s each, cross-faded, low-passed at 900 Hz. The shop phase adds a music-box line (sine; a random pentatonic note every 700 ± 200 ms; 30% rests). Music ducks −8 dB during resolution and stops on pause or when hidden. |

---

## 11. Architecture

### 11.1 Single-file layout

The target is ≤ 150 KB of unminified, readable code; the hard ceiling is 190 KB.

> **Build decision (supersedes the budget and the tier cuts below):** every tier ships and nothing is minified. The shipped file is about 750 KB unminified (about 225 KB gzipped). `tools/build.mjs` warns above 800 KB and fails above 1,200 KB. See `src/CONTRACT.md` § Size.

```
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Ooh × Aah</title>
<style> @import Google Fonts; tokens; layout (Regular / Compact); components; reduced-motion; high-contrast </style>
<div id="app"> static DOM skeleton: HUD, sponsor strip, <canvas id=sky>, rack, tools, shop, workshop, fire button,
               overlays (pause, logbook, settings, inspect, help, end), #live-polite, #live-assertive </div>
<script> 1 RNG · 2 DATA · 3 SIM · 4 BOTS · 5 AUDIO · 6 FX (sky/particles/patterns) · 7 UI · 8 INPUT · 9 SHELL · 10 TEST HOOKS </script>
```

**Size budget:**

| Module | KB |
|---|---|
| DATA | ~10 |
| SIM | ~24 |
| BOTS | ~9 |
| FX | ~22 |
| UI | ~32 |
| AUDIO | ~9 |
| SHELL (including the end-screen charts) | ~16 |
| CSS | ~13 |

**Build tiers.** Build in tier order. If the file passes 150 KB after Tier 2, cut Tier 3 items in the order listed.

| Tier | Contents |
|---|---|
| **1 (ship)** | The full SIM (every rule in §3 and §5); the 22 starting-pool shells; fusions 1–7; the 12 Headliners plus the Countdown; the Apprentice, Salvo Crew and Night Market kits; Renown 1–6; Fair Weather; the Crowd mood; Match, Restore, Rehearse and Undo; the core FX and audio; the end screen (curve, near-miss, lesson, Pareto). |
| **2** | The 12 locked shells and fusions 8–12, with their milestones; the Chemist and Showman kits; the Logbook tabs beyond Shells and Fusions; posters; the keepsake. |
| **3 (cut first, in this order)** | Monomaniac bots in the page (keep them in the node harness) · export/import · the music-box line · Daily Show · Afterparty · Renown 7–8. |

### 11.2 Page contract

- The file starts with `<meta charset="utf-8">` and `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">`, then `<title>`, then `<style>`.
- There are no `<!doctype>`, `<html>`, `<head>` or `<body>` tags. The artifact host wraps the page; the metas keep the file correct when it is opened raw from the repo.
- Fonts come from `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,700&family=Atkinson+Hyperlegible:wght@400;700&display=swap')`. There are no other external requests.
- CSS base: `html{box-sizing:border-box;height:100%}`, `*,*::before,*::after{box-sizing:inherit}`, `html,body{height:100%;margin:0;background:var(--bg);overflow:hidden}`. Size the app with `height:100%`, never `100vh`.
- Keep safe-area padding on `#app`: `padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)`.
- No `alert`, `confirm` or `prompt`. Every confirmation is an inline 2-tap that stays armed until the next input.
- Audio starts only after a user gesture.
- Every `localStorage` access is in a try/catch.
- **The page looks complete at rest:** the show 1 build, fully drawn, with only ambient twinkles moving.
- Test the layout at 360 × 740, 360 × 640, 375 × 548 and 1440 × 900.

### 11.3 RNG (exact code)

```js
function cyrb128(str){let h1=1779033703,h2=3144134277,h3=1013904242,h4=2773480762;
 for(let i=0,k;i<str.length;i++){k=str.charCodeAt(i);h1=h2^Math.imul(h1^k,597399067);h2=h3^Math.imul(h2^k,2869860233);
  h3=h4^Math.imul(h3^k,951274213);h4=h1^Math.imul(h4^k,2716044179);}
 h1=Math.imul(h3^(h1>>>18),597399067);h2=Math.imul(h4^(h2>>>22),2869860233);h3=Math.imul(h1^(h3>>>17),951274213);
 h4=Math.imul(h2^(h4>>>19),2716044179);h1^=(h2^h3^h4);h2^=h1;h3^=h1;h4^=h1;return [h1>>>0,h2>>>0,h3>>>0,h4>>>0];}
function rngNext(st){let [a,b,c,d]=st.rng;a|=0;b|=0;c|=0;d|=0;let t=(a+b|0)+d|0;d=d+1|0;a=b^b>>>9;b=c+(c<<3)|0;
 c=(c<<21|c>>>11);c=c+t|0;st.rng=[a>>>0,b>>>0,c>>>0,d>>>0];return (t>>>0)/4294967296;}   // sfc32
// seeding: st.rng = cyrb128(String(seed)); then call rngNext(st) 15 times and discard the results.
```

- `state.rng` holds 4 unsigned 32-bit ints and is advanced only by `rngNext(state)` inside the SIM.
- Cosmetics use a separate `fxRng` seeded from `seed + 'fx'`; it is never stored in the SIM state.
- Bots use their own xorshift32 (§12.1), never the SIM's RNG.
- Never call `Math.random` or `Date.now` in the SIM.
- Never let object-key or Set iteration order drive RNG calls; iterate the arrays in the listed order.

**`createState` RNG order:**
1. Headliners for f = 1..7 (1 call each).
2. Renown ≥ 2: twilight twists for f = 2..8 (1 call each; F1 makes no call).
3. The keepsake (no RNG).
4. `openBuild(show 1)`: the Night Market shop (§5.6); no Sponsor is possible in F1.

### 11.4 SIM API (pure functions; state is plain JSON)

```
createState(seed:string, opts:{kit, renown, fairWeather, firstRun, daily, unlocked:string[], keepsake}) → State
step(state, action) → Event[]        // mutates state in place; an illegal action returns [{type:'illegal', reason}] and leaves state unchanged
legalActions(state) → Action[]       // §2.5 order
rulesFor(state, s) → string[]
resolveShow(tubes, {rules, crowd, fav, trace}) → {ooh, aah, applause, coins, crowdGain, cheer, bursts, maxUp, colsUp, colsFired, fusions[], trace[]}
previewChips(state, rules, held?, slot?) → Chip[]
mood(state, previewRules?) → 'restless'|'hopeful'|'eager'
matchPerm(n, rules) → int[]
favourite(tubes, crowd) → index|null
shapley(tubes, rules, crowd, fav) → {tube→share, crowd→share}
clone(state) → State                  // structuredClone
hashState(state) → hex                // cyrb128 of canonical JSON (keys sorted)
tutorialState(i) → State              // §6.1: the scripted state at the start of tutorial step i (DATA.TUTORIAL)
```

**State fields:**

| Field | Contents |
|---|---|
| Identity | `v:1`, `seed`, `rng[4]`, `kit`, `renown`, `fairWeather`, `firstRun`, `daily`, `unlocked[]` |
| Progress | `show` (0-based `s`), `phase` (`'build'` \| `'won'` \| `'lost'`), `endless` |
| Resources | `coins`, `crowd`, `rain` (0/1), `relight` (0/1) |
| Rack | `tubes: [{shell: {uid, id, col, star, paid} \| null, rig: id \| null}]`; `crate: [shell\|null, shell\|null]`; `nextUid` |
| Shop | `{cards: [{kind:'shell', id, col, cost, tag: null\|'pity'\|'collector', sold}], rig: {id, cost, sold} \| null, rerolls}` |
| Sponsor | `{kind, accepted} \| null` |
| Rules | `headliners[8]`, `twilightTwists[8]` (index 0 is null), `endlessTwists: {9:[a,b], …}` |
| Flags | `dry`, `rareNext`, `lastOrder[]` (uids per tube at the last light) |
| `runStats` | `history: [{show, rules, target, applause, ooh, aah, pass, sponsored, encore, relit, bursts, maxUp, colsUp, colsFired, fusions[], moodAtLight}]`; `timesFired{tube}`; milestone maxima; `buildStart` (a snapshot of the current build); `lastLostPreLight` |

**Events:** `{type, ...fields}` exactly as named in §9. Every event carries `seq`, a monotonically increasing index. The resolution events form the trace that FX consumes.

### 11.5 Presentation, input, shell

- **FX:** Canvas 2D (`{alpha:false}`). Backing store = CSS size × `min(devicePixelRatio, 2)`, applied via `setTransform`. Resize on `ResizeObserver` and on a DPR `matchMedia` listener. Pre-render sprites (pictograms, tokens, skyline) to offscreen canvases. No `shadowBlur`. Particles are pooled (400).
- **UI:** DOM with real `<button>`s. Re-render from state after every step. Never `fillText` body text every frame; the sky labels and the info card are DOM overlays.
- **Loop:** `requestAnimationFrame` with a fixed timestep `DT = 1/60` and an accumulator. Clamp the delta to 0.25 s and run at most 8 steps per frame, resetting the accumulator when the cap is hit. Timers count integer ticks. `gameSpeed` scales FX time.
- **Input:**
  - Pointer Events on the play column: `touch-action:none`, `setPointerCapture`, handle `pointercancel`, ignore `!isPrimary`.
  - Movement under 10 px is a tap. Dragging and releasing over a target commits; releasing elsewhere cancels.
  - A long-press (≥ 450 ms) or ⓘ opens the inspect sheet.
  - Also set `overscroll-behavior:none`, `user-select:none`, `-webkit-touch-callout:none` and a transparent tap highlight, and prevent `contextmenu`.
  - Buffer input for 120 ms during RESOLVING.
- **Lifecycle:** when the page becomes hidden (`visibilitychange` to hidden, or `blur` while `document.hidden`): pause, save and suspend audio. Resume only through the "Tap to continue" overlay. Keyboard focus leaving the page (Tab past the last control) is not a reason to pause. *(Build decision: a plain `blur` paused the game on every Tab wrap.)*
- **In-page bots** (`?sim=N`): run in a Blob Worker built from the RNG, DATA, SIM and BOTS module sources (`Function.prototype.toString`). If a Worker can't be created, fall back to one run per `MessageChannel` tick. Never block the main thread for more than 16 ms.

### 11.6 Test hooks and URL flags

`window.__game` exposes:
- `reset(seed, opts)`
- `act(action)` → events
- `step(n)`: advance n FX frames (test mode only)
- `state()`: a clone
- `legalActions()`
- `events()`: drains the event queue
- `hash()`
- `setPaused(bool)`
- `config`: `{version, TARGETS, SHELLS, FUSIONS, RIGS, HEADLINERS, KITS, RENOWN, MILESTONES}`
- `resolve(tubes, ctx)`
- `preview()`
- `mood()`
- `shapley(showIndex)`
- `skipAnimations(bool)`
- `runBots({bot, n, opts})` → a summary (Worker)
- `meta()` / `setMeta(obj)`

| Flag | Effect |
|---|---|
| `?test=1` | No rAF loop, instant animations, no intro, deterministic FX |
| `?seed=abc` | Fixes the run seed |
| `?debug=1` | Overlay with frame ms, SIM ms, particle and entity counts, and the hash |
| `?sim=200&bot=human` | Runs bots headless (Worker) and prints a JSON summary to the console and to a `<pre>` |
| `?kit=` | Starting kit |
| `?renown=` | Renown level |
| `?unlock=all` | Unlocks everything |
| `?fresh=1` | Ignores storage |

### 11.7 Performance and invariants

- `resolveShow` for a 6-tube Countdown ≤ 0.2 ms (the reference averages about 17 µs per resolve in node).
- `step` ≤ 2 ms, including shop generation, ♛ and the mood.
- Render ≤ 6 ms on a mid-range phone.
- No allocations in the particle loop.

**Asserted in the bot suite:**
- no NaN or Infinity;
- Applause < 1e300 (the largest hand-built Countdown seen was 8.9e9);
- `legalActions` is non-empty in `build`;
- the same seed plus the same action log gives the same hash;
- at most 6 tubes and 400 particles;
- every `shapley` result's shares sum to 1 (100% of the show's Applause) within 1e-6.

### 11.8 Golden tests (must match exactly)

**Notation:** colours `:R/:A/:G/:B` (`A` = Gold); `*n` = star; rigs listed per tube (`–` = no rig); `crowd` = the Crowd at lighting. R6 = `brass, mortar, –, spotlight, –`; R9 = `brass, mortar, tall, spotlight, brass, spotlight`.

| # | Tubes | Rigs | Rules | Crowd | Applause |
|---|---|---|---|---|---|
| 1 | Willow:A, Peony:R, Strobe, – | – | none | 0 | **150** (50 × 3) |
| 2 | Willow, Peony:R, Palm:R, Strobe | – | none | 1 | **378** |
| 3 | Willow, Peony:R, Palm:R, Strobe | – | headwind | 4 | **276** |
| 4 | Comet:G, Willow, Peony:R, Strobe | – | headwind | 4 | **162** |
| 5 | Peony:R, Strobe, Comet:G, Willow | – | headwind | 4 | **222** |
| 6 | Willow, Palm:A, Salute*2, Comet:A, Comet:G | R6 | none / windshift | 39 | **7,827 / 1,338** |
| 7 | Salute*2, Palm:A, Willow, Comet:A, Comet:G | R6 | windshift | 39 | **6,021** |
| 8 | Salute*3, Palm:A, Willow, Comet:A, Comet:G | R6 | windshift | 39 | **10,935** (243 × 45) |
| 9 | Finale, Waterfall, Palm*2:R, Palm*3:R, Candle:R, Palm*3:R | R9 | countdown | 84 | **50,094** (726 × 69) |
| 10 | Candle:R, Palm*3:R, Palm*2:R, Palm*3:R, Waterfall, Finale | R9 | countdown / none | 84 / 82 | **274,095 / 95,905** |
| 11 | Strobe*3, Echo / Strobe*3, Echo*3 | – | none | 0 | **1,360 / 3,000** |
| 12 | Willow, Peony:R, Salute, Comet:R | – | none | 0 | **819** (Thunderclap Comet) |
| 13 | Candle:G, Crackle, Barrage | mortar, –, – | none | 0 | **1,093** |
| 14 | Girandola, Smiley:R, Saturn | – | none | 10 | **170** (Saturn 0.05) |
| 15 | Willow, Glitter, Chrys:G, Crossette:R, Cake:G, Finale | – | none | 20 | **3,381** |
| 16 | Strobe, Finale | – | none | 0 | **50** (Finale is last with an empty sky: +2 Aah floor) |
| 17 | Peony:R, Finale | – | none | 0 | **28** (Finale ×1.4) |
| 18 | Strobe, Tourbillon, Palm:R | – | ordinance | 0 | **259** (Strobe halved; Tourbillon not halved; Palm sees the wild burst) |
| 19 | Palm:R, Palm:R, Palm:R, Palm:R | – | streetlights | 0 | **624** (tubes 2 and 4 wash to White) |
| 20 | Heart*3, Heart*3, Crossette*3:R, Strobe*3, Crackle*3 | brass × 5 | powercut | 0 | **1,240** (40 × 31: +Aah capped at 30) |
| 21 | Palm:R, Heart, Pure Sky | – | none | 0 | **168** (×2 = 1 + 0.5 × 2) |
| 22 | Peony:A, Echo*2 | – | none | 0 | **50** (the Echo's own ★2 rate, 150%, on a ★1 Peony) |
| 23 | Blue Moon, Peony:B, Cake | – | none | 0 | **105** (Cake skips Blue Moon but copies the Blue-rolled Peony) |
| 24 | Willow, Glitter, Chrys:G | – | rival (♛ = tube 2) | 0 | **150** (the halved Glitter still extends by ceil(0.5) = 1) |
| 25 | Palm:R, Palm:R, Heart | – | critic | 0 | **156** |
| 26 | Same rack as #9 | R9 | countdown + rival (Renown 7) | 84 | **35,910** |
| 27 | Same rack as #10 | R9 | countdown3 + rival (Renown 8) | 84 | **468,910** |
| 28 | Mine:G, Willow, Chrys:R, Salute, Comet:R | – | crossed | 12 | **388** |
| 29 | Willow, Palm:A, Chrys:A, Crossette:A | – | fog | 5 | **1,044** |
| 30 | Girandola, Smiley:A, Crest | – | ferry | 30 | **387** (Hometown Hero) |

**Match property test.** For the rig-less, fusion-less rack Willow:A, Chrys:G, Peony:R, Crossette:R, Strobe, Dahlia:G:
- Plain score = **880**.
- `match` then crossed = **880**; the order becomes Crossette, Willow, Strobe, Chrys, Dahlia, Peony.
- `match` then windshift = **880**; the order becomes Dahlia, Strobe, Crossette, Peony, Chrys, Willow.

**Seed-level golden traces.** These validate RNG order, shop generation, colour rolls, pity, rig and Sponsor rolls, payout and the resolver end to end.

Script B is deterministic and uses no search. In every build, loop:
1. Take the first unsold card (in card order) that twins a tube shell below ★3 and whose `upCost ≤ coins`, and upgrade that shell.
2. Otherwise, take the first unsold affordable card and put it in the leftmost empty tube.
3. Otherwise, if no tube is empty, `f ≥ 2`, there are fewer than 6 tubes and `coins ≥ tubeCost + 3`, buy a tube and continue.
4. Otherwise, stop.

Script B never rerolls, never buys rigs, never accepts Sponsors and never rearranges. It then lights. All three traces use `unlocked=[]`.

Each trace line reads: show | shop (+ rig card) | Sponsor | rack as lit | rules | Applause/target | coins and crowd after the payout.

```
golden-1 {}  headliners=drizzle,critic,fog,ordinance,shortfuse,streetlights,powercut,countdown
s1 | - | - | willow:A peony:R strobe:W - | - | 150/100 pass | $8 crowd 1
s2 | peony:G palm:G strobe:W | - | willow:A peony*2:R strobe:W palm:G | - | 249/130 pass | $4 crowd 2
s3 | mine:A palm:G peony:G | - | willow:A peony*2:R strobe:W palm:G | drizzle | 252/150 pass | $10 crowd 5
s4 | chrys:A peony:G comet:A +rig mortar | - | willow:A peony*3:R strobe:W palm:G | - | 381/330 pass | $8 crowd 6
s5 | girandola:A chrys:R salute:W +rig lucky | - | willow:A peony*3:R strobe:W palm:G | - | 384/430 MISS | $8 crowd 6
s6 | girandola:A mine:R strobe:W +rig spotlight | - | willow:A peony*3:R strobe*2:W palm:G | critic | 690/590 pass | $9 crowd 9
s7 | dahlia:A salute:W willow:A +rig brass | rare | willow*2:A peony*3:R strobe*2:W palm:G | - | 805/1000 MISS | $3 crowd 9
rng after run: 665032909,1761345453,613650395,3606393848

golden-2 {renown:2}  headliners=headwind,critic,drizzle,ordinance,crossed,powercut,fog,countdown
                     twilight=-,headwind,drizzle,critic,drizzle,critic,critic,headwind
s1 | - | - | willow:A peony:R strobe:W - | - | 150/100 pass | $8 crowd 1
s2 | comet:R mine:G willow:A | - | willow*2:A peony:R strobe:W - | - | 213/130 pass | $6 crowd 2
s3 | palm:A chrys:R peony:G | - | willow*2:A peony*2:R strobe:W - | headwind | 156/188 MISS | $1 crowd 2
s4 | chrys:G comet:A strobe:W +rig spotlight | - | willow*2:A peony*2:R strobe:W - | headwind | 156/330 MISS | $1 crowd 2
rng after run: 1248311162,950182965,560462635,1133918716

golden-3 {kit:market}  headliners=headwind,drizzle,fog,shortfuse,crossed,powercut,windshift,countdown
s1 | peony:R willow:A palm:R | - | peony*2:R strobe:W - - | - | 150/100 pass | $5 crowd 1
s2 | palm:G mine:R chrys:A | - | peony*2:R strobe:W palm:G - | - | 189/130 pass | $6 crowd 2
s3 | strobe:W palm:B mine:G | - | peony*2:R strobe*2:W palm:G - | headwind | 170/150 pass | $7 crowd 5
s4 | willow:A peony:G comet:B +rig brass | - | peony*3:R strobe*2:W palm:G - | - | 585/330 pass | $5 crowd 6
s5 | palm:R candle:G strobe:W +rig tall | - | peony*3:R strobe*2:W palm*2:G - | - | 650/430 pass | $4 crowd 7
s6 | chrys:G peony:R salute:W +rig brass | - | peony*3:R strobe*2:W palm*2:G chrys:G | drizzle | 805/590 pass | $7 crowd 10
s7 | dahlia:G glitter:A peony:R +rig brass | rare | peony*3:R strobe*2:W palm*2:G chrys:G | - | 820/1000 MISS | $7 crowd 10
s8 | chrys:G girandola:A glitter:A +rig tall | coin | peony*3:R strobe*2:W palm*2:G chrys*2:G | - | 970/1300 MISS | $2 crowd 10
rng after run: 3845607480,3809455179,4275672863,3248025966
```

---

## 12. Bots and balance targets

### 12.1 Bot definitions

All bots drive the SIM only through `step` / `legalActions`; they may also call the pure helpers. Bot randomness comes from xorshift32, seeded with `(seedNumber × 2654435761) >>> 0` (a string seed uses `cyrb128(seed)[0]`) and never from the SIM's RNG.

**Shared machinery:**
- **`hill(rack, rules, H, passes)`:** pairwise swaps over tubes `i < j`, accepting any improvement immediately. Up to `passes` passes; stop early after a pass with no improvement.
- **`U(rack) = ln(1 + 0.5·min(g, b′) + 0.5·g)`:**
  - `g` = `hill` (6 passes) Applause under no rule, with the Crowd projected as `(ooh + crowdGain × H) × aah`, where `H = min(4, max(0, 22 − s))`.
  - `b` = the same under tonight's rules if there are any, else under the current festival's Headliner. **Match-aware (human and oracle only; the novice has no Match):** when that rule is Wind Shift or Crossed Wires, `b = max(b, the same on the Match re-seat of the rack)`, because pairwise `hill` swaps never find the Match permutation that these bots press on the night.
  - `b′ = b / 10` if that rule is the Countdown, else `b`.
- **Purchase step:**
  - Enumerate every affordable (offer, placement): upgrade the twin (the first tube with that id below ★3); place into each tube, selling any occupant (net cost = cost − sell value); add a tube and place into it (when all tubes are full, `f ≥ 2` and there are fewer than 6 tubes); and the rig on each tube.
  - With the Chemist, each wild card is also tried in R, A, G and B.
  - `value = ΔU − 0.004 × net cost − (comfortable ? 0.04 × [an interest bracket is lost] : 0)`.
  - `comfortable` = `b ≥ 1.3 × target(s)` and `g ≥ 1.2 × max(target(s..s+2))` (base targets with Renown and Fair Weather applied).
  - Buy the best if it clears the bot's margin. Otherwise reroll if not comfortable, `f ≥ 2` (rerolls are illegal in F1), `coins ≥ rerollCost + 5` and under the bot's reroll cap. Otherwise stop.
  - At most 6 purchase steps.

**The bots:**

- **oracle** (v1.0's "planner"; perfect information; a headroom check, not the ship gate):
  - Buy margin 0; up to 2 rerolls per shop.
  - Final arrangement: an exhaustive search over the distinct permutations (≤ 720) under tonight's rules.
  - Sponsor: accept if Applause ≥ 1.5 × base target × (rain check unused ? 1.25 : 1.45).
- **human** (**the ship-gate proxy**: a player who has learned the rules and uses the chips and the mood):
  - Valuation noise: one N(0, 0.10) draw per offer per shop generation, added to that offer's best-placement value. The placement itself is chosen by exact ΔU, because the chips show exact local effects.
  - Buy margin 0.03; at most 1 reroll per shop.
  - Arrangement:
    1. Under Wind Shift or Crossed Wires, press Match if it raises tonight's Applause.
    2. One `hill` pass under tonight's rules.
    3. If the mood is below Eager (Applause < 1.25 × effective target), up to 3 more passes.
    4. If it is still below Eager and `coins ≥ 3`: a second purchase loop (≤ 3 steps, margin 0), then up to 3 passes.
  - Sponsor: accept if the mood with Accept on is Eager (Applause ≥ 1.25 × the raised target).
  - **human-bold:** also accept at Hopeful (≥ 0.85 × the raised target) while the rain check is unused.
- **novice** (the red team's human proxy):
  - The purchase loop with a fresh N(0, 0.10) added to **every** candidate evaluation (every offer × placement, every step), buy margin 0.03, up to 2 rerolls.
  - Arrangement: one `hill` pass. No Match and no use of the mood.
  - Sponsor: accept if last show's Applause was ≥ 2 × its target and the rain check is unused (lesson 7's rule of thumb).
- **greedy** (synergy-blind):
  - Face value = the Applause of the shell alone in an empty rack + 20 × its flat `aah` + its cost.
  - Buys a tube whenever all tubes are full and it can afford one.
  - Buys the affordable card with the highest face value. It upgrades a twin if it owns one; otherwise it places into the first empty tube; otherwise it replaces the tube shell with the lowest face value, but only if the newcomer is ≥ 1.2× better.
  - Never rearranges, buys rigs, rerolls or takes Sponsors.
- **greedy-mood** (the first-run novice proxy): greedy, plus one `hill` pass whenever tonight's mood is Restless.
- **random:**
  - Up to 3 purchases. Before each, it stops with probability 30%; otherwise it picks a uniform random affordable offer with a uniform random legal placement.
  - Then a random permutation of the tubes.
  - Accepts a Sponsor 30% of the time.
- **do-nothing:** lights the fuse every show and never buys.
- **monomaniac[archetype]:** the human (or oracle) bot, but from show 7 (`s ≥ 6`) it may buy only its archetype list (§4.3) plus Peony, Strobe and rigs.

### 12.2 Reference results (final rules; 1,000 seeds `1..1000` unless noted)

**Minutes** are estimated with this time model:
- Show 1: 10 s.
- Each later show: 12 s + 6 s per purchase + 3 s of arranging + 0.4 s per burst + 4 s of slam and result.

Real players are slower: at 30–45 s per show, a 24-show win takes 12–18 minutes.

**Round-1 re-baseline** (F1 reroll ban, Match-aware human and oracle purchase value, Renown 8 Countdown at 900,000; seeds 1..1000, `analyze.mjs --seeds=1000 --sweep-seeds=200`, plus `--only=renown --seeds=1000`): rows marked † were re-measured; the v1.1 value follows in brackets.

| Metric | Gate | Reference |
|---|---|---|
| Random: win % / deaths | 0–5%; dies in F1–F2 | 0% (400 seeds); F1 17%, F2 76%, F3 8% |
| Do-nothing | Dies by F2 | 100% die in F2 (200 seeds) |
| Greedy: win % / deaths | 0–5%; ≥ 70% of deaths in F2–F4 | 0%; F2 27%, F3 36%, F4 30%, F5 6% (93% in F2–F4); median 8 shows, 2.7 min |
| Greedy-mood (first run) | Median first run 3–5 min | 0%; median 10 shows = 3.4 min (p10 2.0, p90 4.5). Curated seed: show 9, 3.0 min. |
| **Novice** win % | **8–25%** | † **18.6%** [18.8%] |
| **Human** win % (ship gate) | **40–60%** | † **52.7%** [50.7%] |
| Oracle win % (headroom) | 75–92% | † 83.2% [81.6%] |
| Human losses by festival | ≥ 75% in F6–F8 | † 92% (F5 7%, F6 21%, F7 24%, F8 48% of 473 losses) [91% of 493] |
| Countdown arrivals that pass | Human ≥ 70% | † Human 77% (682 arrivals), oracle 89%, novice 63% [76% of 665, 89%, 64%] |
| Countdown natural order | Informational | The rack as lit at show 23 passes 78% of oracle arrivals vs 89% for the best order (v1.0 palindrome: 60% vs 88%) |
| No-Sponsor penalty | 5–18 points | † Human −8.0 (52.7 → 44.7), oracle −4.6 (83.2 → 78.6; WARN: under the floor, inside the 95% sampling interval); 1,000 seeds, paired [human −8, oracle −9 at 400 seeds] |
| Sponsor gamble (human-bold) | Sponsored-miss rate 3–10%; win rate within ±5 of the cautious human | † 3.6% (0.35 per run); 51.1% vs 52.7%; 9.4 vs 8.3 Sponsor passes per run [3.7%; 49.4% vs 50.7%] |
| Oracle median Applause/target by festival | F5→F8 non-decreasing (±0.1) | 2.64, 3.94, 3.62, 3.04, **2.70, 2.67, 2.61, 3.58** |
| Human median Applause/target by festival | Informational | 2.56, 3.63, 3.15, 2.52, 2.11, 1.99, 1.90, 2.33; Headliner p10 ≈ 0.8–0.9 in F5–F7 |
| Headliner miss rate when played (human) | Every Headliner ≤ 30% | † Rival 26, Crossed 21, Power Cut 19, Streetlights 15, Wind Shift 12, Ordinance 11, Ferry 6, Fog 4, Short Fuse 3, Critic 0, Headwind 0, Drizzle 0 [Rival 28, Crossed 22, Wind Shift 14] |
| Headliner miss rate when played (oracle) | Every Headliner ≤ 15% | † Rival 9, Power Cut 8, all others ≤ 5 [Rival 11] |
| Headliner cost (oracle; best-arranged score ÷ best with no rule) | p10 ≥ 0.4 | p50 0.70 (Headwind) to 1.00 (Drizzle, Short Fuse, Fog); lowest p10 0.51 (Power Cut). With the plain order kept: Wind Shift 0.25, Crossed 0.29; with Match: 0.75 / 0.68. |
| Draw luck (human) | P(win \| drawn) − P(win \| not drawn) within ±10 for every Headliner | † Worst: Late Ferry +9, Crossed −6, Drizzle +6; Wind Shift −3 [Wind Shift −7, Late Ferry +8]. Human wins by hard late Headliners drawn (1/2/3/4): 60/53/48/45% [63/50/48/32%]. |
| Rain check used in wins | Novice 10–40% | Novice 17%, human 8%, oracle 2% |
| Crowd share of Ooh at the Countdown | p50 15–25% | Human 18%, oracle 20%, novice 21%; Crowd at the Countdown p50 152 (human) |
| Pick/win outliers (show-18 snapshot, n ≥ 15) | \|Δ\| ≤ 25 points vs P(win \| alive) | Human (base 56%): Nishiki +22 (n=51), Pure Sky +20 (127), Brocade +16 … Strobe −19 (173), Peony −21 (72). Oracle (base 82%): Saturn +18 (18) … Strobe −22 (173). |
| Decision regret (oracle) | Clear-cut (> 0.3) 5–20%; near-ties (< 0.02) ≤ 35% | Early (shows 1–12): median 0.097, 13% clear, 18% near-ties. Late (shows 17–24): median 0.049, 6% clear, 31% near-ties. |
| Decision point (single-threshold accuracy) | The first show at ≥ 90% is show 18 or later | Oracle: show 19 (base rate 82%). Human: 86% at show 23, ≥ 90% only at the Countdown. Novice: ≤ 85% before the Countdown. |
| Starting pool vs full pool | Within ±10 points (meta = options, not power) | Oracle 85.0 vs 81.6; human 56.5 vs 50.7 (200 seeds for the starting pool) |
| Kits (200 seeds; oracle / human) | Human within ±10 of Apprentice; oracle 70–92 | Apprentice 81.6 / 50.7 · Salvo Crew 82.0 / 59.0 · Chemist 78.0 / 47.0 · Night Market 78.5 / 47.0 · Showman 84.5 / 56.5 |
| Renown (1,000 seeds, cumulative; oracle / human) | Non-increasing within ±5; R8 oracle ≥ 10%, human ≥ 3% | † R1 72.4 / 37.9 · R2 52.6 / 25.9 · R3 50.5 / 22.8 · R4 40.8 / 17.9 · R5 23.0 / 7.3 · R6 16.5 / 5.0 · R7 12.2 / 3.4 · R8 11.2 / 3.1 (Countdown 900,000). At 1,000,000 and v1.1 bots, R8 read 9.3 / 2.7, under both floors. [200 seeds: R8 12.0 / 5.0] |
| Fair Weather | At least doubles the novice's win rate | Novice 16.8% → 49.5% (same 400 seeds); human 87.3% |
| Archetype spread (200 seeds each) | All within ±10 of the mean | Human-based: Canopy 19.5, Mono 10.0, Rainbow 19.5, Salvo 19.5, Thunder 20.5, Crowd 9.0 (mean 16.3; −7.3 / +4.2). Oracle-based: 22.0, 26.0, 36.5, 22.0, 36.5, 18.0 (mean 26.8; −8.8 / +9.7). |
| Milestones reachable in runs 2–4 | Each ≥ 12% per run for the novice | First Fusion 84, Busy Sky 32, Monochrome Night 30, Full Spectrum 17, Packed House 96, Triple-break 81, Headliner Hunter 87, Rigger 97 (%) |
| Crowd mood buckets at lighting (human) | Hopeful must straddle pass/fail | Restless 2% of shows (0% pass), Hopeful 6% (68% pass), Eager 92% (100% pass) |
| Applause p10 / p50 / p90 at shows 6, 12, 18, 24 | — | Human: 1,272 / 1,990 / 3,024 · 6,009 / 9,823 / 17K · 14K / 25K / 47K · 127K / 320K / 1.07M. Oracle: 1,537 / 2,235 / 3,367 · 7,788 / 12K / 20K · 20K / 34K / 60K · 173K / 572K / 2.66M. |
| Median bursts per show (human) | — | 3 (show 1), 4 (F1), 5 (F2–F3), 6 (F4–F6), 7 (F7–F8), 14 (Countdown) |
| Degenerate loops | None | † Rerolls 2.5 per run (none in F1) and pity 1.2 per run (human). Coins held at payout: p50 $3, p90 $9 (no stalling for interest). Selling always loses 25%. Every Afterparty run ends; the oracle fully cleared it in 0 of 330 wins (seeds 1–400; p50 2, p90 8, max 11 shows) (§5.10). |

### 12.3 Sim simplifications and watch-list levers

**Not simulated:**
- The Crate, the keepsake, Undo, Restore, the Afterparty and the Daily Show.
- Kit, Renown, archetype and starting-pool rows were measured before the Saturn 0.07 → 0.05 trim; re-measure them.

**Simulated:** pity, the Collector, Chemist colour choice (all four colours tried), Match, the mood thresholds, the Fair Weather relight, and Renown 1–8.

**Re-run the whole suite at 1,000 seeds after porting,** and diff the §11.8 golden tests and seed traces first.

**Watch-list levers:**
- Human proxy wins > 60% → raise the F5–F8 bases by 5%. Below 40% → lower them by 5%.
- Novice below 8% → lower the F4–F6 bases by 5%.
- Late near-ties above 35% → the F6+ rig card becomes "either a rig or a twin card".
- Any shell's pick/win above +25 (n ≥ 15) → cut its per-unit number by 20% (e.g. Pure Sky 0.5 → 0.4, Nishiki 0.1 → 0.08, Saturn 0.05 → 0.04).
- An archetype below the mean − 10 → Heart +4, Prism 0.45, or Girandola Crowd +4 for Mono, Rainbow and Crowd respectively.
- Human miss rate on a Headliner above 30% → soften it. For Rival Crew: "♛ fires at ⅔ strength" (round 1, 1,000 seeds: human miss 27.7 → 21.9%, novice 48.7 → 38.3%, win rates within ±0.9; the older "halves the ♛'s + numbers but not its × terms" moved it only 27.7 → 26.7%).
- Crowd share above 25% → Encore pays Crowd +f.
- Human-proxy Countdown pass rate below 70% → Countdown target 160,000.

### 12.4 Human gates (built stage)

A cold stopwatch test with 3 people:
- the first fusion lands by 2:30 in the first run, and the greedy-mood proxy's first run lasts 3–5 min. A chip-reading player's first-run length is informational: any change that lets a novice build an engine makes their run longer (round-1 design review, finding C);
- the first 1-of-3 choice comes before 0:30;
- at least 2 of 3 testers predict Applause within 2× by show 6;
- at least 2 of 3 can say what the crowd's mood means after show 3.

No tester should skip animations because they already know the total. If one does, set Chips to "Partners only" by default. If testers skip because of the mood, show the mood only while Rehearse is held.

---

## 13. Accessibility and input mapping

**General:**
- Targets ≥ 44 px with ≥ 8 px gaps between tubes; text ≥ 16 px, including the fire-order numerals (the Applause and banners are larger); contrast ≥ 4.5:1 (tokens in §8.5).
- Every type is distinguished by shape, colour, pictogram and monogram, so the game works in greyscale.
- High-contrast mode adds 2 px white outlines to tokens and removes glows.
- The mood is always a word plus a pose, never colour alone.
- No hover-only information and no hold-to-act (long-press is only a shortcut to ⓘ).
- No timing requirements: confirmations stay armed until the next input. Pause is always available.
- **Reduced motion:** see §9. Never more than 3 flashes per second.

**aria-live:**
- `#live-polite`:
  - Build open: "Show 5 of 24, May Fair Evening. Target 430. Crowd mood: Eager. Sponsor offered: target 645, pays 2 coins. Next Headliner: Drizzle."
  - Purchases: "Bought Palm, Red, into tube 3. You have 5 coins. Crowd mood: Hopeful."
  - Result: "Applause 1,950: Ooh 162 times Aah 12. Passed, 4.5 times the target. Crowd plus 3."
- `#live-assertive`: "Rain check used. One more miss ends the run." and the run end.

**Tube buttons:** `aria-label="Tube 3: Palm, Red circle, star 1, Hang 2, rig Brass, fires 3rd of 6, sees 2"`. The Crowd Favourite adds ", crowd favourite"; Headliner effects add ", half strength" or ", washed out".

**Focus:** always visible (`--focus`). When the end screen opens, focus moves to Run it back.

**Keyboard map (full parity):**

| Key | Action |
|---|---|
| Tab / Shift+Tab | Move focus: HUD → Sponsor toggle → rack tubes → Crate → tools → cards → workshop → Light |
| ← / → or A / D | Move the rack cursor across the tubes, then the Crate slots |
| ↑ / ↓ or W / S | Switch between the rack row and the shop row |
| Enter / Space | Pick up the focused shell or card, then drop it on the focused slot (buy, upgrade, move or swap). On the focused Sponsor toggle, toggle it. |
| Esc | Cancel a pick; otherwise pause |
| 1 / 2 / 3 / 4 | Select shop card 1–4 |
| G | Rig card (then ←/→ and Enter to choose a tube) |
| T | Add tube |
| X | Reroll |
| Backspace / Delete | Sell the focused shell (press again to confirm; stays armed until the next input) |
| C | Cycle the selected wild card's colour (Chemist) |
| M | Match |
| B | Restore last order |
| U or Z | Undo |
| H | Rehearse |
| I | Inspect |
| F | Light the fuse |
| Space (while resolving) | Fast-forward; press again to Skip |
| P | Pause |
| L | Logbook |
| ? | Help |
| R / Enter (end screen) | Run it back |

There is no single-key Sponsor shortcut: accepting a ×1.5 target needs focus plus Enter. Pointer and keyboard both produce the §2.5 actions.

**Haptics:** `navigator.vibrate` behind a setting, with the patterns in §9. Off by default on desktop.

---

## 14. Explicitly out of scope

- Accounts, cloud saves, leaderboards, image sharing, multiplayer, analytics, and network calls other than Google Fonts.
- Streaks, timers, energy, daily obligations, notifications, monetisation.
- Wishes or contracts, a Backlog carry-over, an "Improve" coin sink, consumable one-shot shells, and extra rain checks outside the labelled Fair Weather assist.
- An auto-arranger or optimal-order button (only Match, a fixed permutation, and Restore). Showing the pre-light Applause total or ratio: the Crowd mood's three words are the only forecast.
- More than 6 tubes, a Crate larger than 2, selling or moving rigs, more than one Mortar.
- Narrative beyond flavour lines and festival names; voice acting; sampled audio or asset files; 3D; WebGL.
- Localisation (English only; all strings in one table, ready for later), gamepad support, a landscape phone layout (the portrait column is centred and letterboxed).
- An Afterparty beyond festival 12: it hard-stops there with a victory card.
- Any Lean Six Sigma vocabulary in the game. The only portfolio nod is the unlabelled Pareto chart on the end screen.

---

## Appendix A. Rejected or modified red-team items

**A1. Critical: gate the red team's human proxy at 25–40% (modified).** Their proxy, kept here as `novice`, draws fresh noise for every candidate and takes the maximum over about 25–40 candidates per step. This winner's curse makes it buy options that are worse in truth on most steps. It is a useful lower bound, not a model of a player who reads exact local chips.

We gate on two proxies instead:
- `human` at 40–60% is the ship gate: noise per offer, with exact placement from the chips.
- `novice` at 8–25% is the floor.

Retuning targets alone cannot put the red team's proxy at 25–40% without pushing the oracle to about 94%; the red team measured this itself. After the mood, Match and the Countdown fix, the novice rose from 9.5% to 18.8% while the oracle stays at 81.6%, below its 92% ceiling. The §12.4 playtest remains the final arbiter.

**A2. Critical: a 4-bucket forecast including "2×+" (modified to 3 buckets).** A 2×+ bucket would announce the Encore in advance on about half of all shows (51% for the human proxy), removing the overshoot reveal the brief asks for (P2). Three buckets keep the Encore a surprise, and Hopeful straddles pass/fail (68% of Hopeful shows pass).

**A3. High: "Keep my order" putting last show's closer in tube 1 at the Countdown (rejected; Countdown redesigned).** Under the old palindrome, "closer to tube 1" is exactly Mirror, which the red team measured as worse than doing nothing (43% vs 60%). We changed the direction instead: N→1, then 1→N. The natural order is now close to optimal (78% vs 89% best), Match covers Wind Shift and Crossed Wires exactly, and Mirror is removed.

**A4. High: buff Critic and Drizzle to a cost p50 ≤ 0.9, and gate every Headliner at an oracle miss rate of 3–20% (rejected).**
- The F1–F3 Headliners are the brief's "Goombas". Their 0% oracle miss rate is by design, because early Applause/target ratios are about 3.
- The stated purpose, keeping draw luck from swinging a run by about 30 points, is met without buffs: the human proxy's P(win) moves by at most ±8 points for any Headliner.
- The replacement gates are in §12.2: human miss rate ≤ 30%, oracle miss rate ≤ 15%, cost p10 ≥ 0.4, and draw luck within ±10.

**A5. High: an F1 miss starts the critical state only in F2 (rejected in favour of the fatigue fix).** Hiding a real danger contradicts P8 (telegraph threats). Instead, the persistent cues stay (a static red rim and a cracked umbrella), and the heartbeat, pulse and banner are rationed to the next build and to Headliner or Countdown builds. That fixes the novice's fatigue in every festival, not just F1.

**A6. High: Headwind target 150 on the first-ever run only (modified: all runs).** One fixed target table is simpler and just as fair. The F1 Headliner is always Headwind or Drizzle, both mild. Show 3 = 150 everywhere.

**A7. Medium: turn Sponsors into rule-twist offers at an unchanged target (rejected).** With the mood, the ×1.5 bet is readable: Eager with Accept on is safe, and Hopeful is a real gamble that is roughly neutral in expected value (49.4% vs 50.7%). Twist offers would add arrangement puzzles on non-Headliner shows, which is the very burden the red team found hurts human-like players most, and would blunt the Headliners. The gate "oracle sponsored-miss rate 3–10%" is also replaced with the human-bold measurement, because a perfect-information bot never loses a bet it can see.

**A8. Medium: Renown 8 target 1.5M (modified to 1,000,000, then 900,000).** The Countdown changed direction, so the number was re-derived. At 1,000,000, Renown 8 passes 70% of oracle arrivals and 57% of human arrivals, below Renown 7's 80% and 63%. Round 1 re-measured it at 1,000 seeds: R8 wins were 9.3% (oracle) and 2.7% (human), under both floors (10% / 3%). The sweep read 2.7 / 9.3 at 1,000,000, 3.0 / 10.4 at 900,000, 3.1 / 11.6 at 850,000 and 3.3 / 12.0 at 800,000 (human / oracle). 900,000 is the smallest change that meets both floors and keeps R8 harder than R7 (800,000 would put the oracle's R8 above its R7). With the round-1 bots (oracle / human): R8 11.2 / 3.1 vs R7 12.2 / 3.4. The human floor has almost no margin; consider a ≥ 2% human floor.

**A9. Low: Encore pays Crowd +f (modified to +2f).** Measured: +f left the Crowd at about 12% of Countdown Ooh, below the red team's own 15–25% gate. +2f gives 18–20% and makes overkill matter late.

**A10. Low: Chemist colour choice for Commons only, or at $1 (rejected).** After the retune, the Chemist with full colour choice measures 78.0% (oracle) and 47.0% (human), against Apprentice's 81.6% and 50.7%. It is not an outlier; it has no rigs, which is its constraint. Keeping the full choice keeps the kit's identity.

**A11. Low: rename the assist "Umbrella mode" (modified to "Fair Weather").** The assist no longer adds umbrellas (rain checks); it lowers targets and allows one Countdown relight. "Afterparty" and "Sodium Streetlights" are accepted as proposed.

**A12. Medium, mobile: the Sponsor as a HUD chip, and the workshop merged into the tools row (modified).**
- At 328 usable px, the Compact HUD has no room for a Sponsor chip, so the Sponsor strip overlays the top of the sky instead.
- The tools row cannot hold the Crate, 4 tools and 3 workshop buttons at 44 px (396 px needed), so the workshop keeps its own 44 px row in Compact.
- Every other width and height fix is accepted (§8.1).

**A13. Medium: candidate target bases 100 / 330 / 900 / 2,300 / 4,600 / 8,500 / 15,000 / 24,000 (modified).** These were replaced by bases tuned against the human gate and the red team's own F5→F8 shape gate: 100 / 330 / 1,000 / 2,600 / 5,500 / 9,600 / 16,000 / 26,500, with the Countdown at 180,000. The red team's candidates left the oracle's ratio falling from F5 to F7.

**A14. Medium, scope: the red team's tier list (accepted with one addition).** Fair Weather, the Crowd mood and Match go into Tier 1, because the balance gates depend on them.