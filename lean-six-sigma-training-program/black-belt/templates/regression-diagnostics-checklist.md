# Regression Diagnostics Checklist — Residual Plots, VIF, Leverage and Influence, Extrapolation, the Restraint Question

*Black Belt toolkit · used in weeks 6–7 (Module 4) on every regression or logistic model
offered as cause verification, and again on the model behind any experiment's operating
window. Rubric ★ A2 — "a model without diagnostics, or a p-value without an effect, does not
earn this" — with A3 (restraint) and A4 (rejected hypotheses). The checklist is filled before
the coefficients are read. Method detail: [`../modules/m4-modeling.md`](../modules/m4-modeling.md).*

## Purpose

A regression output always produces coefficients and p-values; it produces them for a wrong
model as readily as for a right one, and the wrong ones are often the more impressive. The
checklist is the fixed order in which you ask the model whether it deserves to be read: first
whether it should exist at all, then whether its errors behave, then whether its predictors
can be told apart, then whether one or two rows are steering it, then whether the question
you are answering lies inside the data, and last — with everything above it passed — what the
coefficients say in the process's units.

The reviewer scores the order as much as the answers. A candidate who reports R-sq 80% and a
p-value for queue depth, then discovers the funnel, has a finding; a candidate who reports the
funnel, refits on the right scale and then states the effect in hours has ★ A2.

## The checklist

### Part A — Before the fit: should this model exist?

| # | Question | Pass looks like | If it fails | Answer for this model |
|---|---|---|---|---|
| A1 | What is the question, in the sponsor's words? | A sentence about an effect in the process's units, not "what predicts Y" | Rewrite until it is | |
| A2 | Is the model specified from the cause structure (A1 of the rubric) before fitting? | The terms are named, with the reason each is a candidate cause | No stepwise, no best-subsets, no "add until adjusted R-sq stops" | |
| A3 | Could a graph answer it? | A stratified plot, a box plot by group, a Pareto — if one of these answers the question, the model is not needed | Do the graph; record the restraint (rubric A3) | |
| A4 | Has the measurement system for Y passed? | Gauge R&R < 30% (better < 10%) or kappa ≥ 0.7, on record (Module 2) | Fix the gauge; a model on a failed gauge fits the gauge | |
| A5 | Observations per term | ≥ 10–15 per predictor (for logistic: ≥ 10 events of the rarer outcome per predictor) | Fewer terms, more data, or a two-group comparison with what you have | |
| A6 | Is any X a consequence of Y? | Every X could be changed before Y happens | Drop it; it is not a lever | |
| A7 | Were the X's varied independently in the data? | Correlations among X's below about 0.7; nobody adjusts two together | Expect VIF trouble (Part C) and plan the experiment that separates them | |
| A8 | Is the data one stable process? | Baseline chart stable; no site mixture; one operational definition throughout | Stratify or stage first (Module 3) | |
| A9 | Exclusion rules written before the fit? | Which rows are out and by what rule (a changed definition, a duplicate extract, a coded missing value), in the M3 record | Nothing is removed for hurting the fit | |
| **Decision** | **Model, or do not model, because:** | | | |

### Part B — The four residual plots (read before any coefficient)

| # | Plot | Pass looks like | What a failure means and what you do | Exhibit ref. and verdict |
|---|---|---|---|---|
| B1 | Residuals versus fitted values | A flat band of even width | Funnel: noise grows with the response (times, costs, counts) — transform (ln, square root) or use a model for the right distribution. Curve: a missing squared term or wrong scale | |
| B2 | Residuals versus observation (or run) order | Patternless | Drift or steps: a nuisance variable moved during collection — find it in the provenance record; stage the data or add the variable | |
| B3 | Normal probability plot of residuals | Roughly straight; Anderson-Darling p not tiny for n < 50 | Long tail with a funnel: transform. Isolated points off the line: go to Part D | |
| B4 | Residuals versus each predictor (and, for logistic, deviance residuals and the Hosmer-Lemeshow or calibration check) | No curve, no funnel | Curve in one X: that X needs a squared term or a transform; document it as a pre-hypothesized change or as an exploratory finding, not as the model | |
| B5 | If transformed: the same four plots on the refit | Pass | If the transform did not fix it, the model is wrong in a way a transform cannot fix — say so | |

### Part C — Multicollinearity

| # | Check | Pass looks like | If it fails | Answer |
|---|---|---|---|---|
| C1 | VIF for every predictor | All below 5; below 10 at worst, with a reason | Above 5: the pair's coefficients are not separately interpretable. Drop the one physically downstream; or combine; or separate them with an experiment. Never keep both and read the p-values | |
| C2 | Correlation matrix of the X's | Nothing above about 0.7 that is not a factor and its own square | Center the factor before adding its square; otherwise see C1 | |
| C3 | Does the fit change when the collinear term is dropped? | S and R-sq nearly unchanged; the surviving coefficient's SE falls | Report both models; the physics or the process owner chooses which lever is real | |

### Part D — Leverage and influence

| # | Check | Pass looks like | If it fails | Answer |
|---|---|---|---|---|
| D1 | Leverage (hat values) | No row above about 2p/n (p = terms including the constant) | The row is far out in X-space — a rare setting, a data-entry error, a different process. Find out which from the provenance record | |
| D2 | Cook's distance | All well below 1 (and no single row far above the others) | The row steers the fit: report the model with and without it and say what the row is. You do not remove it | |
| D3 | Standardized residuals | No row beyond about ±3 without an explanation | Check the source record; a slipped decimal is corrected from the source, never guessed | |
| D4 | The with-and-without table | Coefficients that matter do not change their sign or their practical meaning | If they do, the finding depends on one row and the sponsor sentence must say so | |

### Part E — Extrapolation and the range of validity

| # | Check | Pass looks like | If it fails | Answer |
|---|---|---|---|---|
| E1 | Range of each X in the data (min, max, and how many rows in the top and bottom tenth) | The settings you will recommend are inside the range, with rows near them | The model has nothing to say outside; the operating window is bounded by the data, or you run an experiment there | |
| E2 | Joint range (the hull) | The recommended combination of settings occurred in the data | Two X's each inside their range but never seen together is still extrapolation | |
| E3 | Prediction interval at the recommended settings | Stated, in the process's units | A point prediction alone is not a prediction | |
| E4 | Period and place | The data's period and site match the place the model will be used | A model from one site, one quarter, is a model of that site and quarter until shown otherwise | |

### Part F — The restraint question (rubric A3), answered whichever way it goes

| Question | Answer, with the reason |
|---|---|
| Is there a place in this analysis where you chose *not* to model or test? | |
| What did the graph, the two-group comparison, or the measurement system tell you instead? | |
| What could you not test with these data, and what would it take? | |

### Part G — Reporting (only after A–F)

| | |
|---|---|
| **Each retained effect in the process's units at named settings, with its interval** | e.g. "each claim in the queue adds about 1.3% to cycle time — 0.16 h on a 12-hour claim, 0.32 h on a 24-hour one" |
| **The largest lever and its practical meaning** | |
| **Alternative explanations considered and how each was addressed** | confounders, reverse causation, the mixture, the period |
| **The observational caveat** | associations until an experiment or a controlled pilot |
| **Rejected terms (rubric A4)** | every term tested that did not verify, with its result |
| **The sentence you would tell your sponsor** | effect size, practical meaning, caveat; no p-value alone |

**Software parity.**

| Check | Minitab | Excel | R / Python |
|---|---|---|---|
| Four residual plots | Stat > Regression > Fit Regression Model > Graphs > Four in one; residuals vs variables | Data Analysis > Regression, residual output; scatter residuals vs fitted, vs row order, vs each X; normal plot from ranked residuals | R `plot(fit)` (four plots) and `plot(resid(fit) ~ x)`; Python `fit.resid` with `matplotlib`, `statsmodels.graphics.gofplots.qqplot` |
| VIF, correlations | VIF column in the coefficients table; Stat > Basic Statistics > Correlation | Regress each X on the others, VIF = 1/(1−R²); `CORREL()`; or the Excel stats add-in | R `car::vif(fit)`, `cor()`; Python `variance_inflation_factor`, `DataFrame.corr()` |
| Leverage, Cook's D, standardized residuals | Storage in the Fit Regression dialog; unusual observations table | The Excel stats add-in's influence output; hat values by hand are impractical beyond two predictors | R `hatvalues()`, `cooks.distance()`, `rstandard()`, `influence.measures()`; Python `fit.get_influence()` — `.hat_matrix_diag`, `.cooks_distance`, `.resid_studentized_internal` |
| Prediction interval | Predict in the Regression menu | Interval by hand from S, the design matrix and t — use the add-in | R `predict(fit, newdata, interval = "prediction")`; Python `fit.get_prediction(new).summary_frame()` |
| Logistic checks | Stat > Regression > Binary Logistic; goodness-of-fit tests and deviance residuals | Not native; the add-in or Solver-based fits | R `glm(family = binomial)`, `ResourceSelection::hoslem.test`; Python `statsmodels.Logit`, calibration by decile |

---

## Filled example — HC: minutes from ED arrival to first antibiotic, sepsis-screened patients

The sepsis project from [`../project/charter-and-strategic-linkage.md`](../project/charter-and-strategic-linkage.md)
(section 2.2), 90 days, n = 268 screened patients. Numbers are illustrative and in the range
seen for this process. The question: *"How much of the delay to the first dose is explained by
the lactate result turnaround, the wait for a physician, and how full the department is — and
which of these is the lever?"*

**Part A.** Model specified from the cause structure: four terms — triage-to-physician
minutes, lactate result turnaround minutes, ED occupancy at arrival (% of licensed spaces),
and night arrival (indicator, 19:00–07:00) — each a candidate cause from the swimlane and the
C&E matrix. A3: the day/night difference was answered graphically first (box plots by shift:
medians 112 and 131 min, spread overlapping heavily); the model keeps the indicator only to
adjust the other effects, and the restraint is recorded. Measurement system: the two
timestamps were audited on 40 charts (arrival within ±2 min in 39; dose-administration scan
within ±5 min in 36 — the four failures were manual back-entries, all night shift, rule
written: back-entered doses flagged, analyzed with and without). Observations per term: 268/4
= 67. No X is downstream of Y: all three continuous X's are complete before the dose in
every row. Correlations among X's: lactate turnaround and occupancy 0.41 (the lab is slower
when the department is full — expected, and below the 0.7 line). Stability: the baseline
I-MR of weekly medians is stable across the 13 weeks; one site, one definition. Exclusions:
7 patients who arrived with an antibiotic already given by transport, per the charter.
**Decision: model.**

**Part B.** First fit on raw minutes: residuals versus fitted show a funnel (residual SD 22
min below 90 min fitted, 51 min above 150); normal plot long right tail (AD 2.9); no pattern
by observation order; residual versus lactate turnaround slightly curved. Refit on ln(minutes):

```
Regression Analysis: ln(min_to_abx) versus triage_md, lactate_tat, occupancy, night     N = 261

Term            Coef    SE Coef       T       P     VIF
Constant       3.681      0.118    31.2   0.000
triage_md     0.00620    0.00091    6.81   0.000   1.08
lactate_tat   0.00712    0.00104    6.85   0.000   1.24
occupancy     0.00381    0.00147    2.59   0.010   1.21
night         0.091      0.056      1.62   0.106   1.05

S = 0.376   R-Sq = 46.8%   R-Sq(adj) = 46.0%
Residuals vs fitted: SD 0.37 / 0.38 / 0.38 across thirds     Normal plot: AD = 0.39 (P = 0.38)
Residuals vs observation order: no pattern      Residuals vs lactate_tat: flat after the transform
```

Four plots pass on the log scale; the exhibit numbers are in the appendix.

**Part C.** All VIF below 1.3. The 0.41 correlation between lactate turnaround and occupancy
did not inflate either SE materially; both are readable.

**Part D.** Leverage: one row at 0.11 against 2p/n = 0.038 — a patient whose lactate result
took 410 minutes (analyzer fault, confirmed from the lab's incident log). Cook's distance
0.27, the largest by a factor of four. Refit without it: lactate coefficient 0.00694 (from
0.00712), no sign or meaning changes. Reported with and without; the row stays in. Standardized
residuals: two beyond ±3, both back-entered doses (rule from Part A); with the four flagged
rows removed, coefficients change in the third decimal.

**Part E.** Ranges: triage-to-physician 4–142 min (top tenth above 68); lactate turnaround
21–410 min (top tenth above 95; only 3 rows above 200); occupancy 61–118% (only 4 rows above
110%). The recommended future state — lactate turnaround ≈ 30 min via point-of-care testing —
is at the bottom of the observed range, where 24 rows sit; inside the hull with occupancy
80–100%. Prediction interval for the typical patient at 30-minute lactate turnaround: median
≈ 95 min (95% PI 45–200 min). The model is of this ED, this quarter; the countermeasure's
effect is what the pilot (★ I1) tests.

**Part F — restraint.** Day/night answered graphically (above). Not tested: the effect of
stocking a first-dose antibiotic in the ED cabinet — no patient in the data received one that
way, so the model has nothing to say; that is the pilot's question, with a written prediction.

**Part G.** Back-transformed effects: each 10 minutes of physician wait ×1.064 (≈ +6%); each
10 minutes of lactate turnaround ×1.074 (≈ +7%); each 10 points of occupancy ×1.039; night
×1.10 (95% CI 0.98–1.22 — not verified, A4). Typical patient (physician wait 35 min, lactate
turnaround 62 min, occupancy 90%, day): predicted median 116 min against the observed 118.
*The sentence to the sponsor:* "Two waits explain most of what we can explain: every ten
minutes waiting for the physician adds about 6% to the time to the first dose, and every ten
minutes waiting for the lactate result adds about 7%. For a typical patient that is 116
minutes; with the lactate result in 30 minutes instead of 62 it would be about 92, and with
the physician at 20 minutes as well about 84. Night arrival adds about 10% but we cannot
verify it with these numbers. How full the department is matters, but it is not something
this project can change. These are associations from one quarter; the pilot in weeks 9–12
tests whether moving the lactate result and the first dose earlier does what the model says."

---

## Common mistakes

- **Coefficients first.** The p-values are read last. A funnel means the standard errors are
  wrong, so every p-value you read before the plots was fiction.
- **Stepwise as a cause structure.** The model is specified from A1 and fitted once; changes
  need a stated reason (a failed diagnostic, a pre-hypothesized interaction, a VIF choice).
  Adjusted R-sq compares two pre-specified models; it does not search.
- **"Not significant" read as "no effect".** Night ×1.10 with a CI of 0.98–1.22 is an effect
  the data cannot pin down, not an absence; it goes in the A4 table with its interval.
- **Deleting the high-leverage row.** Report with and without, say what the row is. The
  410-minute lactate is a real patient and a real analyzer fault.
- **Ignoring VIF because R-sq is high.** Collinearity does not hurt the fit; it hurts what you
  can say about each lever, which is the only reason a cause-verification model exists.
- **Recommending settings the data never saw.** A window at a lactate turnaround of 10 minutes
  from data whose minimum is 21 is an extrapolation, and two X's each in range but never seen
  together is too.
- **Transforming and forgetting to back-transform.** The sponsor sentence is in minutes and
  percentages, never in log units.
- **A model where a plot would do.** The reviewer's guidance: a two-sample comparison that
  answered the question outscores a regression that did not need to exist. Part A3 is the
  first place A3 of the rubric is earned.
- **Changing the operational definition or dropping rows to improve the fit.** The data-ethics
  stop; a note goes to the assessment lead.

## Rubric items evidenced

| Item | What on this checklist evidences it |
|---|---|
| ★ A2 Root cause verified with an appropriate method | Parts A–E in order, with exhibits; effects in the process's units with intervals (G); alternative explanations addressed (G) |
| A3 Restraint | Part A3 and Part F — the graph that answered the day/night question; the countermeasure not modeled because no data exist |
| A4 Rejected hypotheses shown | The rejected-terms line in Part G with intervals |
| M1 Measurement systems | Part A4: the timestamp audit and the back-entry rule |
| M3 Data provenance | Parts A9 and D: exclusions by pre-written rule; the analyzer fault traced to the lab's incident log |
| ★ I1 (indirectly) | Part E and F name what the pilot must test and at what settings, so the pilot's prediction has a source |

*v1.0 · 2026-09-20*
