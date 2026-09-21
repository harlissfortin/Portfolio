# DOE Planning Canvas — Question, Response, Factors, Design, Runs, Analysis Plan, Decision Rule

*Black Belt toolkit · drafted in week 8 (Module 5, section 5.2), reviewed at the week 9 lab,
frozen and dated before the first run. Used on the project experiment and on the practicum
apparatus. Rubric ★ I1 when the experiment is the solution evidence, ★ A2 when it verifies
the cause; M1 for the response's measurement system. The record of what happened when the
design met the process is the companion [`experiment-logbook.md`](experiment-logbook.md).
Design mechanics: [`../modules/m5-design-of-experiments.md`](../modules/m5-design-of-experiments.md).*

## Purpose

The canvas makes you decide, in writing and in order, everything an experiment needs before
the data exist: what question the experiment answers, what you will measure and whether the
gauge can see it, which factors move and how far, what nuisance variables you will hold,
block or randomize over, how many runs you can afford and what effect size those runs can
detect, how you will analyze the result, and — the block reviewers read first — what result
would change what you do. An experiment planned after the data are in is a model of the past;
the canvas is the difference between a designed experiment and a busy week.

The order matters. Factors chosen before the response is defined get levels that move nothing
the customer sees. Run counts chosen before the power calculation detect the effects you
could already see by eye and miss the ones you ran the experiment for. The decision rule is
written before the analysis so that a p-value of 0.06 cannot become "trending toward".

## The canvas

### 1 · Header

| | |
|---|---|
| **Project / Black Belt** | |
| **Experiment number and title** | (experiments are numbered; a second experiment is sequential, not a do-over) |
| **Where in DMAIC and which rubric item** | cause verification (★ A2) · solution evidence and operating window (★ I1) · practicum |
| **Process, equipment, scope** | which press, unit, cell or simulator; what is held out |
| **Canvas version and date frozen** | frozen before the first run; changes go in the logbook's change table |
| **Reviewed by** | coach or Master Black Belt, date |

### 2 · The question

| | |
|---|---|
| **The question in the sponsor's words** | one sentence; the sponsor could read it |
| **What is known already** | the cause structure (A1), the observational model (Module 4) and its caveat, prior experiments |
| **Why an experiment and not observation** | which X's were never varied independently; what the observational data cannot separate |
| **Restraint check** | a written reason an experiment is warranted here (Module 5, 5.11). If the honest answer is "it is not", stop: the reason is the A3 exhibit |

### 3 · Response and its measurement system

| | |
|---|---|
| **Primary response (Y)** | name, units, continuous where possible |
| **Operational definition, version** | the same one the baseline uses, by reference |
| **Measurement system and MSA result** | device, study date, % study variation or kappa, ndc, resolution — from the [`../../green-belt/templates/msa-plan.md`](../../green-belt/templates/msa-plan.md) plan extended in Module 2 |
| **Is the gauge fine enough for the smallest effect you care about?** | resolution and gauge SD compared with the effect in section 6; if not, fix the gauge first |
| **Secondary responses and guardrails** | what else is recorded per run (cycle time, a defect count, a cost) and the limit that stops the experiment |

### 4 · Factors and levels

| Factor | Type (continuous / categorical) | Low (−1) | High (+1) | Basis for the levels | Feasible range today | Hard or easy to change? Settling time | Held or varied |
|---|---|---|---|---|---|---|---|
| A | | | | | | | |
| B | | | | | | | |
| C | | | | | | | |
| D | | | | | | | |

**Levels** are set wide enough to move the response and inside the range the process could
run tomorrow. Write the basis: the observational range, the specification, the engineer's
limit. A factor that takes 25 minutes to settle is written as hard to change, and the run
budget in section 6 includes the settling.

### 5 · Nuisance variables: hold, block or randomize

| Nuisance variable | Could it move the response by how much? | Strategy: hold constant · block · randomize over | How it is controlled or recorded |
|---|---|---|---|
| | | | |

Everything that could move the response and is not a factor goes on this table with one of
the three words. "Ignore" is not on the list.

### 6 · Design choice, resolution, run count and power

| | |
|---|---|
| **Design** | 2^k full · 2^(k−p) fraction · with center points · in blocks; generators written out |
| **Resolution and aliasing** | for a fraction: resolution and the alias structure of every two-factor interaction you care about; for a blocked full factorial: which interaction is confounded with blocks |
| **Alternatives considered and why rejected** | at least one |
| **Replicates (whole design, fresh random order) and repeats** | replicates give pure error; repeats measure the gauge — say which you have |
| **Center points** | how many, where in the run order; what curvature would mean |
| **Total runs and their cost** | runs × (settling + run + measurement time) × rate; materials; production lost |
| **Noise estimate σ and its source** | from the baseline chart's within-subgroup SD or the gauge study plus process history |
| **Smallest effect worth acting on** | in the response's units, with the reason it is the threshold |
| **Standard error of an effect** | 2σ/√N |
| **Power for that effect at α = 0.05** | with the error degrees of freedom you will actually have; and for one effect size smaller |
| **Decision on run count** | run as designed · add a replicate · run sequentially (screen, then augment) |

**Software parity — creating and sizing the design.** Minitab: Stat > DOE > Factorial > Create
Factorial Design (blocks, center points and randomization in the dialog; show the alias
table) and Stat > Power and Sample Size > 2-Level Factorial Design. Excel: coded columns and
generator products built by hand, `RAND()` sorted within block for run order; power from
effect ÷ (2σ/√N) against `T.DIST` with the error df; the Excel stats add-in's DOE menu creates
standard designs. R: `FrF2::FrF2(nruns, nfactors, blocks, ncenter, randomize = TRUE)` and
`design.info()$aliased`; power by simulation or `power.t.test` on the effect/SE ratio.
Python: `pyDOE3.fracfact("a b c abc")` then shuffle within block; power with
`statsmodels.stats.power.TTestPower`.

### 7 · Randomization and blocking (the run order)

| | |
|---|---|
| **Blocks** | what a block is (shift, day, lot, operator), how many, how many runs each |
| **Run order** | drawn once by software with the seed recorded; center points at random positions within each block |
| **Restrictions on randomization** | any factor that cannot be reset every run, and what you do about it (accept and record; or the split-plot fork, which is Master Black Belt help, not silent) |
| **Standard order ↔ run order table attached** | yes / no — it is the first page of the logbook |

### 8 · Analysis plan (written before the data)

| Step | What you will do |
|---|---|
| Model fitted first | all main effects, all two-factor interactions, blocks (and three-factor terms in a replicated design) |
| Effect screening | replicated: ANOVA of effects with pure error · unreplicated: half-normal plot and Lenth's method; three-factor terms pooled into error only if they sit on the line |
| Curvature | center-point test; if significant, no interpolation across the middle — say what you will do instead |
| Residual checks | normal plot; residuals vs fitted; residuals vs **run order**; residuals by block |
| Hierarchy | an interaction keeps its parent main effects |
| Effects in units | each retained effect in the response's units, with its interval, at named settings |
| Operating window | the region of settings that meets the response target inside every guardrail; how you will confirm it (n confirmation runs at the chosen settings, prediction written first) |
| The sponsor sentence | the sentence you will be able to say, with blanks for the numbers |

### 9 · What would change the decision

| If the experiment shows… | Then the project will… |
|---|---|
| The expected effect, larger than the threshold | |
| An interaction you did not expect | |
| Curvature | |
| No effect above the threshold | (this is a finding: A4; the cause is elsewhere) |
| A guardrail crossed at the promising settings | |
| A run-order trend or a block effect larger than the factor effects | |
| A gauge or provenance problem found in the residuals | |

### 10 · Logistics and sign-off

| | |
|---|---|
| **Runs on which dates and shifts; who runs them; who measures** | |
| **Materials, parts, coupons, simulator seeds reserved** | |
| **Decision-rights check** | which row of the charter's decision-rights table covers this trial, and who was notified when |
| **Stop rule** | the guardrail reading that halts the experiment and who decides to resume |
| **Sign-off** | process owner · sponsor (if production is used) · Black Belt · date |

---

## Filled example — MFG: part weight at the injection-molding cell, press 2

The scrap project from [`../project/charter-and-strategic-linkage.md`](../project/charter-and-strategic-linkage.md)
(section 2.1). Numbers are illustrative and derived as a Black Belt would derive them.

**Header.** Experiment 1, "Part weight versus press settings, press 2, tool 4471". Cause
verification and operating window (★ A2 and ★ I1). Canvas frozen week 8, Friday; reviewed by
the coach at the week 9 lab.

**The question.** *"Which press settings stop short shots on press 2, and at what settings
can we run without lengthening the cycle?"* Known: 71% of scrapped parts over 26 weeks are
short shots or sinks at the weigh station (Pareto, A1); the observational model in Module 4
found part weight associated with hold pressure and melt temperature, but the two setters
adjust them together at start-up, so the history cannot separate them (VIF 7.4 — the
observational caveat from Module 4). An experiment is warranted because the factors were
never varied independently and the press is available for one shift per block under the
charter's "trial ≤ 8 h" decision right.

**Response and measurement system.** Y = part weight in grams, one part per run measured on
balance BAL-07, resolution 0.01 g; gauge R&R (Module 2, week 3): 4.8% of study variation,
ndc 29 — the gauge can see 0.05 g, and the smallest effect of interest is 0.4 g. Operational
definition: MW-P2 v1, the weight of the part with the runner removed, 10 minutes after
ejection. Secondary response: short shots and sinks per 200 parts in the same run, judged by
the inspector (attribute agreement kappa 0.86, week 3) — used as a check, not modeled, because
200 parts at 3–8% yields 6–16 events, too few to test. Guardrail: cycle time per shot from
the press controller; the charter's escalation trigger (any press +5% for a shift) is the stop
rule.

**Factors and levels.**

| Factor | Type | Low (−1) | High (+1) | Basis | Feasible today | Settling | Held or varied |
|---|---|---|---|---|---|---|---|
| A melt temperature | continuous | 215 °C | 235 °C | resin datasheet range 210–240; setters run 220–230 | yes | 10 min | varied |
| B hold pressure | continuous | 55 bar | 75 bar | tool card 50–80; history spans 58–72 | yes | 1 min | varied |
| C hold time | continuous | 4 s | 8 s | adds ≤ 4 s to a 38 s cycle (+10% at worst — inside the trigger only if the window lands at ≤ 6 s; see section 9) | yes | none | varied |
| D mold temperature | continuous | 40 °C | 60 °C | chiller range; history spans 44–52 | yes | 25 min (hard to change) | varied |
| Cooling time | — | 18 s | — | fixed at the setup-sheet value | — | — | held |
| Resin lot | — | one lot | — | 240 kg from lot L-2291 reserved | — | — | held |

Cooling time was a candidate fifth factor. It is held because every second of cooling is a
second of cycle, and the guardrail would fire before the effect was seen; it becomes a
sequential question if the window from this design is not enough.

**Nuisance variables.**

| Nuisance variable | Could move Y by | Strategy | Control or record |
|---|---|---|---|
| Shift (setter, ambient, start-up state) | ≈ 0.3 g between shifts in the baseline | **block** — block 1 day shift, block 2 night shift | ABCD confounded with block (below) |
| Resin moisture | up to 0.5 g if the dryer is short-cycled | hold | dryer ≥ 4 h before each block; dew point logged |
| Warm-up of the barrel across the shift | drift ≤ 0.2 g over 8 h | randomize | run order randomized within block; residuals vs run order checked |
| Balance drift | negligible | hold | check weight 50.000 g at the start of each block, logged |
| Hopper level | unknown | randomize | logged per run |

**Design, run count and power.** 2^4 full factorial in two blocks of eight, ABCD confounded
with blocks (the four-factor interaction is the term you are most willing to give up), plus
two center points per block (215/235 → 225 °C, 65 bar, 6 s, 50 °C). Total 20 runs, one part
weighed per run after 200 shots at the setting. Alternative considered: a 2^(5−1) resolution
V with cooling time as E, 16 runs — rejected because the guardrail would stop it and because
five factors with settling would not fit in two shifts. Replicates: none; error comes from the
four three-factor interactions (4 df) and the center points (3 df), 7 df in all. σ ≈ 0.25 g
from within-shift part-weight SD on the baseline X̄-R chart (subgroups of 5, 26 weeks).
Smallest effect worth acting on: 0.4 g — the short-shot limit is 41.2 g against a 42.0 g
nominal, and a 0.4 g shift is half the margin. SE of an effect = 2 × 0.25 / √16 = 0.125 g.
Power at α = 0.05 with 7 error df: ≈ 0.78 for 0.4 g, ≈ 0.98 for 0.6 g, ≈ 0.42 for 0.25 g. A
second replicate (36 runs, 23 df) would give ≈ 0.99 for 0.4 g but costs two more shifts; the
decision is to run 20 and add the replicate only if the half-normal plot is ambiguous around
0.4 g — sequential, and written here so it cannot be decided after seeing the result. Cost:
20 runs × (settling ≈ 15 min average + 200 shots ≈ 2.1 h at the longest cycle) is two full
shifts of press 2 at $140/h ≈ $2,200, plus 240 kg of resin at $3.10 ≈ $750; parts from runs
inside specification go to inspection as normal production.

**Randomization and blocking.** Run order drawn in Minitab (seed 20260914, recorded); center
points at random positions within each block. Restriction: D takes 25 minutes to settle; the
design is still fully randomized within block and the settling is in the run budget (each
block ≈ 10 runs × 15 min average settling plus run time, inside 8 h). The split-plot
alternative was discussed with the Master Black Belt and declined for this size of design.

**Analysis plan.** Fit all main effects, all six two-factor interactions and block; screen
with a half-normal plot and Lenth's method; pool three-factor terms into error only if they
lie on the line; center-point curvature test; four residual plots including run order and
block; hierarchy kept. Report each retained effect in grams with its interval; predicted
weight at every corner; operating window = settings with predicted weight ≥ 41.6 g (limit plus
one SE-margin) and cycle time ≤ 38 s + 5%; three confirmation runs at the chosen settings with
the prediction written on the logbook first. The sponsor sentence with blanks: *"Raising ___
from ___ to ___ adds about ___ g of part weight (from ___ to ___); at ___ the short-shot rate
in 200 parts fell from ___ to ___; the cycle changes by ___ s."*

**What would change the decision.**

| If the experiment shows… | Then… |
|---|---|
| B (hold pressure) effect ≥ 0.4 g, no interaction | setup sheet changes hold pressure only; confirmation runs on press 2, then presses 1 and 3 |
| B×C interaction | the setup sheet specifies pressure and hold time together, never one alone; the window is drawn on the interaction plot |
| Curvature significant | no interpolation to the middle; add axial points on the two live factors (sequential; RSM introduction, with Master Black Belt help) |
| No effect above 0.4 g | the short shots are not a setting problem on this tool — back to the cause structure (tool venting, resin moisture); recorded under A4 |
| Window needs C = 8 s (cycle +10%) | the escalation trigger fires; production manager decides; the project tests cooling-time reduction as the sequential experiment |
| Run-order trend larger than the block effect | report it, identify the drifting nuisance, block on it next time; effects reported with the caveat |
| One residual > 3 s | check the weigh-station record and the logbook before anything else; a re-run, never a silent drop |

**Logistics.** Blocks on the Tuesday day shift and Wednesday night shift of week 10; run by
the two setters on the team; weighed by the quality technician; charter decision right "trial
on a press ≤ 8 h — production manager, 5 working days' notice" met on the Wednesday before;
stop rule as above. Signed: cell supervisor (process owner), production manager, Black Belt.

---

## Common mistakes

- **Factors first, response last.** Choose the response and check its gauge before naming a
  factor; an experiment measured with a 30% gauge R&R measures the gauge.
- **Levels too close together.** "Because that is where we run today" produces effects of the
  size of the noise. Set levels at the edge of what the process could run tomorrow, and write
  the basis.
- **No power calculation, or one done after.** The standard error of an effect is 2σ/√N;
  compare it with the smallest effect worth acting on before you book the press. Sixteen
  runs that cannot see 0.4 g are sixteen runs.
- **"Randomized" with no run-order table.** If the standard order and the run order are the
  same, the experiment is confounded with time and the M5 TXN case dataset shows what that
  costs. Draw the order once, record the seed, keep the table.
- **Repeats presented as replicates.** Weighing the same part twice estimates the balance.
  A replicate is the whole design run again in a fresh random order.
- **A fraction without its alias table.** Resolution III with two-factor interactions you
  care about aliased to main effects is a design that cannot answer the question. Write the
  alias structure on the canvas, not in your head.
- **A hard-to-change factor reset in the run order as if it were easy.** Either budget the
  settling and randomize, or name the restriction and get help; never silently run the hard
  factor in two halves and analyze as if randomized.
- **The decision rule written after the analysis.** Section 9 is filled before the first run,
  dated. "Trending toward significance" is what a missing section 9 sounds like.
- **Ignoring the guardrail.** An operating window that meets the response by crossing the
  cycle-time trigger is not a window. The guardrail is on the canvas and the stop rule names
  who decides.

## Rubric items evidenced

| Item | What on this canvas evidences it |
|---|---|
| ★ I1 Experimental solution evidence | Design justified (section 6 with alternatives), analysis plan written before data (8), operating window and confirmation runs with the prediction first (8), decision rule (9) |
| ★ A2 Root cause verified with an appropriate method | Why an experiment and not observation (2); effects reported in the response's units at named settings (8) |
| M1 Measurement systems | Section 3: the response's MSA result and the resolution-versus-effect check |
| M3 Data provenance | Run-order table, seed, held nuisance variables logged (5, 7) — carried into the logbook |
| A3 Restraint | The restraint check in section 2 when the honest answer is that an experiment is not warranted |
| A4 Rejected hypotheses | Section 9's "no effect above the threshold" row, and the factors that turn out inert |
| I4 Implementation management | Section 10: dates, owners, decision-rights row, stop rule |

*v1.0 · 2026-09-20*
