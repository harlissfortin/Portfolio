# Module 4 — Modeling: Regression, Logistic, Non-parametrics, Two-way ANOVA — and When Not To

**Weeks 6–7** · ≈ 8 h self-paced + two 2.5 h live labs · Exam section D (objective B4) ·
Rubric items ★ A2, A3, A4 · Prerequisite: Green Belt week 6 (t-tests, one-way ANOVA,
chi-square, simple regression), Module 2 (MSA on every metric you model) and Module 3
(distribution identification, power).

**Learning objectives.** By the end of this module the learner can:
1. Fit a multiple regression, read every coefficient in the process's units, and run the four
   residual checks (versus fitted, versus order, normal plot, influence) before reading any
   p-value.
2. Detect multicollinearity from VIF and the correlation matrix, state what it does to the
   coefficients, and choose a remedy that keeps the model interpretable.
3. Specify a model before fitting it, and refuse stepwise selection as a substitute for a
   cause structure.
4. Fit a binary logistic regression, translate odds ratios into probabilities at named
   settings, and check goodness of fit.
5. Choose Mann-Whitney, Kruskal-Wallis or Mood's median when they are the honest choice,
   report a shift estimate with its interval, and say what each test does not tell you.
6. Analyze a two-way ANOVA with interaction, read the interaction before the main effects,
   and describe what a general linear model adds.
7. Decide in writing when not to model, and write the A2, A3 and A4 record a reviewer can
   audit.

Green Belt verified causes with one X at a time. This module is about several X's at once,
about outcomes that are yes/no, and about data that refuse the assumptions. The rule that
carries through every section: **diagnostics before coefficients, coefficients before
p-values, and the sponsor sentence in real units.** A model without diagnostics does not earn
A2; a two-sample comparison that answered the question outscores a regression that did not
need to exist (A3).

---

## 4.1 Multiple regression and residual diagnostics (75 min)

**Hook (TXN).** A claims-processing team wants to know what drives cycle time (working hours
from receipt to decision). Six months, 240 claims, four candidate X's: line items, claim
amount ($K), reviewer experience (months) and queue depth on arrival. An analyst fits all
four, gets R-sq 80% and tells the sponsor "each claim in the queue adds 0.3 hours." The number
is wrong, and the R-sq is why nobody looked.

**Teach.** Multiple regression fits Y = b₀ + b₁X₁ + … + bₖXₖ. Each coefficient is the change
in Y per unit of its X *holding the other X's fixed*, which is why it can differ from the
simple-regression slope Green Belt taught. Four assumptions, four plots:
- **Residuals versus fitted values** — a flat band. A funnel means the noise grows with the
  response (usual for times and costs) and the standard errors are wrong; a curve means a
  missing squared term or a wrong scale.
- **Residuals versus observation order** — patternless. A drift means a nuisance variable
  moved during collection.
- **Normal probability plot of residuals** — roughly straight. Mild departures matter little
  above n = 50; a long tail plus a funnel usually means transform.
- **Influence** — Cook's distance near 1, or a point far outside the X-range, means one row is
  steering the fit. You do not remove it; you report the fit with and without it and say what
  the row is.

Only after the four plots pass do you read the coefficients, and only then the p-values.

**Show (TXN).** The claims model as first fitted:

```
Regression Analysis: cycle_h versus items, amount_k, exp_m, queue     N = 240

Term          Coef    SE Coef       T       P     VIF
Constant     -3.74      1.30     -2.88   0.004
items         2.332     0.105    22.20   0.000   1.01
amount_k      0.3145    0.0351    8.96   0.000   1.00
exp_m        -0.1307    0.0149   -8.75   0.000   1.04
queue         0.2960    0.0158   18.77   0.000   1.04

S = 5.96   R-Sq = 80.5%   R-Sq(adj) = 80.2%

Analysis of Variance
Source        DF        SS       MS       F      P
Regression     4   34520.6   8630.1  243.3  0.000
Error        235    8336.9     35.5
Total        239   42857.5

Residual diagnostics
  Residuals vs fitted: SD of residuals 3.7 h (fitted < 17 h), 3.5 h (17-27 h), 8.5 h (> 27 h)
  Normal probability plot: AD = 1.70 (P < 0.005), long right tail
  Residuals vs observation order: no pattern
  Largest Cook's distance 0.11; five fitted values below zero
```

*The sentence you tell your sponsor at this point:* "The four factors together account for
about 80% of the variation in cycle time, but the model is wrong in a specific way — its errors
are more than twice as large for the slow claims as for the fast ones, and it predicts negative
times for some small claims. I can't quote an effect with an honest margin yet; I need to refit
on the right scale." That is a legitimate sponsor sentence. Diagnostics before coefficients.

The funnel and the negative fitted values say the process is multiplicative: each factor
scales cycle time rather than adding to it. Refit on ln(cycle time):

```
Regression Analysis: ln(cycle_h) versus items, amount_k, exp_m, queue     N = 240

Term          Coef     SE Coef       T       P
Constant     1.7738    0.0425    41.71   0.000
items        0.10570   0.00343   30.79   0.000
amount_k     0.01131   0.00115    9.85   0.000
exp_m       -0.00568   0.00049  -11.60   0.000
queue        0.01340   0.00052   25.98   0.000

S = 0.195   R-Sq = 88.5%   R-Sq(adj) = 88.3%
Residuals vs fitted: SD 0.19 / 0.18 / 0.21 across thirds     Normal plot: AD = 0.45 (P = 0.27)
Back-transformed: each line item x1.11; each $1K x1.011; each month of experience x0.994;
each claim in queue x1.013
```

*The sentence you tell your sponsor:* "A typical claim — six line items, about $5K, a reviewer
with four years' experience — takes about 17 working hours when 50 claims are in the queue,
about 12 h at 25 and about 24 h at 75; every claim in the queue adds about 1.3%. Line items
are the biggest lever: a 10-item claim takes about 27 hours against 13 for a 3-item one. These
are associations from six months of history. Queue depth is something we can set, so it is the
factor we take into a designed test in Module 5." Effects in hours at named settings, a lever
identified, and the observational caveat stated.

**Software parity.** Minitab: Stat > Regression > Regression > Fit Regression Model; the
four-in-one residual plots and VIF are on by default. Excel: Data Analysis > Regression with
residual and normal plots ticked; plot residuals against fitted and against row order
yourself; Cook's distance needs the Excel stats add-in. R: `lm()`, `plot(fit)`,
`cooks.distance()`. Python: `statsmodels.formula.api.ols().fit()`, `fit.resid`,
`fit.get_influence().cooks_distance`.

**When NOT to use multiple regression.** Fewer than about 10–15 observations per predictor;
X's not measured on the same units and period as Y; an X that is a *consequence* of Y rather
than a candidate cause (the lab); a question that is really "do these two groups differ",
which is a t-test or Mann-Whitney and earns A3; a measurement system for Y that has not passed
(Module 2).

**Try.** Fit both models on `m4-claims-cycle.csv` and write the queue-depth sentence from
each. The raw model says 0.3 h per claim everywhere; the log model says 1.3%, which is 0.16 h
on a 12-hour claim and 0.32 h on a 24-hour one. Say which the reviewer should believe and why.

---

## 4.2 Multicollinearity and VIF (40 min)

**Hook (MFG).** A coating line measures dry-film thickness (µm) against line speed (m/min),
oven temperature (°C), coating viscosity at the applicator (cP) and ambient humidity (%RH).
The engineer's model says temperature and viscosity are both "not significant." The line's
own experience says temperature matters a great deal. Both are right.

**Teach.** When two X's move together, the data cannot say which one is doing the work. The
regression splits the shared effect between them arbitrarily, both standard errors inflate,
signs can flip, and each looks unimportant while the pair matters. The **variance inflation
factor** of a predictor is 1 / (1 − R²ⱼ), where R²ⱼ is the R-sq from regressing that X on the
other X's: VIF 1 means independent; above about 5 the standard error has more than doubled;
above 10 the individual coefficients are not interpretable. VIF does not hurt prediction from
the model as a whole; it hurts what you can say about each lever, which is the point of a
cause-verification model.

Remedies, in order: drop the predictor that is physically downstream of the other (measure
one thing, control it); combine the pair into one meaningful variable; collect data where the
pair are moved independently, which is a designed experiment (Module 5). Never keep both and
read the p-values.

**Show (MFG).** Viscosity at the applicator is set by oven inlet temperature; the correlation
between the two in this data is −0.94.

```
Regression Analysis: thickness_um versus line_speed, oven_temp, viscosity, humidity     N = 60

Model A — all four predictors
Term            Coef    SE Coef       T       P     VIF
Constant       56.98     16.75      3.40   0.001
line_speed    -0.9548    0.0473   -20.17   0.000   1.02
oven_temp      0.0791    0.0422     1.87   0.066   9.15
viscosity     -0.0084    0.0108    -0.78   0.440   9.38
humidity       0.0388    0.0139     2.78   0.007   1.10
S = 1.256   R-Sq = 89.5%   R-Sq(adj) = 88.7%

Model B — viscosity removed
Term            Coef    SE Coef       T       P     VIF
Constant       44.11      2.58     17.09   0.000
line_speed    -0.9571    0.0471   -20.33   0.000   1.01
oven_temp      0.1100    0.0142     7.73   0.000   1.05
humidity       0.0410    0.0136     3.01   0.004   1.06
S = 1.252   R-Sq = 89.4%   R-Sq(adj) = 88.8%
```

The fit did not change: S and R-sq agree to the second decimal. Temperature's standard error
fell from 0.042 to 0.014 and its effect became readable. Keeping viscosity and dropping
temperature instead fits equally well (R-sq 88.8%) and attributes the same effect to
viscosity; the data cannot separate them, and the physics chooses.

*The sentence you tell your sponsor:* "Line speed dominates: each metre per minute removes
about 1 µm of coating, so the 18–30 m/min range spans about 11 µm. Oven temperature adds about
1.1 µm per 10 °C. Viscosity is not a separate lever — it is set by the oven — so we measure
one and control one. Humidity is real but small: about 1.6 µm across the 30–70% range the plant
sees."

**Software parity.** Minitab: VIF is a column in the coefficients table. Excel: regress each X
on the others and compute 1/(1−R²) by hand, or use the add-in; `CORREL()` for the matrix. R:
`car::vif(fit)`. Python: `statsmodels.stats.outliers_influence.variance_inflation_factor`.

**When NOT to worry about VIF.** When the model only predicts inside the data's range and no
one acts on an individual coefficient; when the collinear pair is a factor and its own square
(center the factor first); when two indicator columns overlap by construction.

---

## 4.3 Model-selection restraint (30 min)

**Teach.** Stepwise, best-subsets and "add terms until adjusted R-sq stops rising" choose the
model that fits *this* sample best, not the one that describes the process. With ten candidate
X's and no cause structure, stepwise finds two or three that pass p < 0.05 by chance alone, and
the reported p-values do not account for the search.

The rule: **the model is specified before it is fitted.** The cause structure from A1 (C&E
matrix, FMEA, stratified graphs) names the X's; you fit that model, check it and report it,
including the terms that did not verify (A4). You change it only for a stated reason: a
diagnostic failed, an interaction was hypothesized in advance, or a VIF forced a choice.
Adjusted R-sq and Mallows' Cp compare two *pre-specified* models; they do not search.
Hierarchy holds as in Module 5: an interaction keeps its parent terms.

**Show (HC, in words).** A discharge-timeliness team put 14 columns from the electronic record
into stepwise and got a five-term model with R-sq 0.61 that included "number of nursing
notes" — a consequence of long stays, not a cause. The pre-specified three-term model from
their cause structure had R-sq 0.44, and every term was a lever someone could pull. The second
earns A2; the first is how a cause gets verified wrongly.

**When NOT to add a term.** When its p-value is the only argument for it; when it flips the
sign of a term you understand; when the model already predicts within the measurement
system's resolution; when you cannot tell the process owner what the term is doing.

---

## 4.4 Binary logistic regression and odds ratios in plain words (60 min)

**Hook (HC).** A medical unit records whether each discharge leaves after 16:00 (yes/no) and
wants to know what drives the late ones. Green Belt week 6 could only bin one X and run
chi-square. With three X's — the hour the order was written, medications to reconcile, and
whether transport was pre-booked — you need a model whose outcome is a probability.

**Teach.** Logistic regression models ln(odds of the event) = b₀ + b₁X₁ + …, where odds =
p / (1 − p). Each coefficient is a change in log-odds per unit of X; e^b is the **odds
ratio**, the factor by which the odds multiply per unit. Odds ratios are not probability
ratios: an odds ratio of 1.5 moves a 5% event to about 7% and a 50% event to 60%. So you
always translate to predicted probabilities at named settings; that is the plain-words step.

Checks: at least 10 events *and* 10 non-events per predictor; a goodness-of-fit test
(Hosmer-Lemeshow groups observations by predicted probability and compares observed to
expected; a large p-value means no evidence of misfit, not proof of fit); VIF as in 4.2.
Pseudo-R-sq values are low for logistic models by nature; do not judge the model by them.

**Show (HC).**

```
Binary Logistic Regression: late_discharge (after 16:00) versus order_hr, meds, transport_prebooked
N = 420 discharges     Events (late) = 143     Non-events = 277

Term                       Coef   SE Coef       Z       P   Odds ratio    95% CI
Constant                 -2.951    0.401    -7.36   0.000
order_hr (h after 08:00)  0.421    0.059     7.14   0.000     1.52     (1.36, 1.71)
meds_to_reconcile         0.243    0.060     4.03   0.000     1.28     (1.13, 1.44)
transport_prebooked      -1.212    0.248    -4.89   0.000     0.30     (0.18, 0.48)

Log-likelihood = -220.87     Deviance = 441.7 on 416 DF
Test that all slopes are zero: G = 97.0, DF = 3, P < 0.001
Goodness of fit: Hosmer-Lemeshow chi-square = 11.5, DF = 8, P = 0.173

Predicted probability of late discharge
  Order at 10:00, 4 meds, transport not pre-booked   0.24     pre-booked   0.09
  Order at 14:00, 4 meds, transport not pre-booked   0.63     pre-booked   0.34
  Order at 10:00, 8 meds, transport not pre-booked   0.46
```

*The sentence you tell your sponsor:* "Every hour later the discharge order is written raises
the odds of a late discharge by about half. An order at 10:00 with four medications and no
transport booked has about a one-in-four chance of leaving after 16:00; the same order at
14:00 is nearer two in three. Pre-booking transport cuts the odds by about 70% at any order
time — that 10:00 discharge drops from 24% to 9%. Each extra medication to reconcile adds about
28% to the odds. Transport pre-booking is the lever we can pilot on this unit; order time
belongs to the rounding schedule and is a separate conversation."

**Software parity.** Minitab: Stat > Regression > Binary Logistic Regression > Fit Binary
Logistic Model; odds ratios and Hosmer-Lemeshow in the output; Predict for named settings.
Excel: no native tool — the add-in, or maximize the log-likelihood with Solver (teachable, not
for project use). R: `glm(y ~ ..., family = binomial)`, `exp(coef())`, `exp(confint())`,
`ResourceSelection::hoslem.test()`. Python: `statsmodels.formula.api.logit().fit()`,
`np.exp(fit.params)`, `fit.predict()`.

**When NOT to use logistic regression.** Fewer than 10 events per predictor (collect more,
or reduce the model); an outcome that is really a count or a time you binned (model the count
or the time; binning throws information away); a yes/no produced by an attribute measurement
system with kappa below 0.7 (Module 2: you are modeling the auditor); a stratified bar chart
of rates that already answers the question (A3).

**Try.** Change the transport odds ratio above to 0.60 and recompute the two 10:00
probabilities (the pre-booked figure becomes about 16%). Then write the sentence a sponsor
needs to decide whether a pre-booking pilot is worth two months of a coordinator's time.

---

## 4.5 Non-parametrics: Mann-Whitney, Kruskal-Wallis, Mood's median (55 min)

**Teach.** The t-test and ANOVA compare means and assume roughly normal noise. Above about
30 per group they tolerate skew; below that, or with heavy tails, the mean is a poor summary
and the p-value is untrustworthy. Rank-based tests replace values with ranks and ask whether
one group's values tend to be larger:
- **Mann-Whitney** (two groups) — the rank analogue of the two-sample t. Reports W or U, a
  p-value, and the part you use: a **Hodges-Lehmann shift estimate** (the median of all
  pairwise differences) with its confidence interval.
- **Kruskal-Wallis** (three or more groups) — the rank analogue of one-way ANOVA, statistic
  H; follow with pairwise Mann-Whitney tests and shift estimates, saying you ran several.
- **Mood's median** — counts how many in each group fall above the overall median. Least
  powerful, but indifferent to extreme values: the honest choice when a few genuine but wild
  observations would dominate the ranks and the question is about the typical unit.

They are **the honest choice** when groups are small and visibly skewed, when the data are
ordinal (a 1–5 scale is ranks already), or when extreme values are real and must stay in.
They are not a licence to stop looking: a rank test comparing a skewed group to a symmetric
one tests shape as much as location, and you say so.

**Show (MFG).** Rework minutes per casting from two suppliers, 28 and 25 castings, both
right-skewed (AD 0.54 and 0.64 on the raw data):

```
Mann-Whitney Test and CI: rework_min (supplier A) vs rework_min (supplier B)

Supplier    N   Median   Q1-Q3    Mean   Max
A          28    21.0    12-32    24.1    60
B          25    29.0    22-41    33.8    68

Point estimate for B - A (Hodges-Lehmann): 9.0 min
95.0% CI for the difference: (2.0, 17.0)
W = 621.0    Test of A = B vs A not = B:  P = 0.016
(Welch t on the same data: difference of means 9.8 min, 95% CI (1.9, 17.6), P = 0.016)
```

*The sentence you tell your sponsor:* "Castings from supplier B need about 9 more minutes of
rework each than supplier A on a typical part — plausibly anywhere from 2 to 17. Both suppliers
have a few hour-long jobs, so we compared whole distributions rather than averages; the
ordinary t-test happens to agree, which tells you the choice of test was not what mattered
here. At about 400 castings a month, that is roughly 60 hours of rework a month attributable
to the supplier difference — before we know what about the castings causes it."

**Show (HC).** Emergency department wait to provider by triage level:

```
Kruskal-Wallis Test: ED_wait_min versus triage_level

Level     N   Median   Ave Rank      Z
3        40    18.5      35.6     -6.43
4        55    35.0      78.3      1.82
5        45    42.0      92.0      4.32
Overall 140              70.5
H = 44.27    DF = 2    P < 0.001
Pairwise Mann-Whitney, Hodges-Lehmann shift:  3 vs 4  +16 min (P < 0.001)
                                              4 vs 5   +7 min (P = 0.093)
```

*The sentence you tell your sponsor:* "Triage-3 patients wait a median of about 18 minutes;
triage-4 and -5 patients about 35 and 42. The 16-minute step from level 3 to 4 is clearly
real. The 7-minute step from 4 to 5 is not established with these 140 visits — the two
lower-acuity levels are being worked as one queue, which is probably the design and may be
the finding."

**Mood's median (TXN, in words).** Two invoice-intake sites, 30 invoices each. Site 2 has
three disputed invoices at 190, 240 and 310 working hours, genuine and in scope. Means 18.4 h
versus 42.8 h; medians 16.5 h versus 19.0 h. Mood's median test: chi-square 1.67, P = 0.20;
Mann-Whitney P = 0.052; Welch t P = 0.07. The sentence: "For the typical invoice the sites are
within about three hours of each other and the difference is not established. Site 2's mean
is more than double because of three disputed invoices, which are a separate problem with a
separate cause; they go in the record, not out of the data."

**Software parity.** Minitab: Stat > Nonparametrics > Mann-Whitney / Kruskal-Wallis / Mood's
Median Test. Excel: no native tool; rank with `RANK.AVG()` and compute W by hand, or use the
add-in. R: `wilcox.test(conf.int = TRUE)`, `kruskal.test()`, `RVAideMemoire::mood.medtest()`.
Python: `scipy.stats.mannwhitneyu`, `kruskal`, `median_test`; the Hodges-Lehmann estimate is
the median of the pairwise differences, computed by hand.

**When NOT to use a rank test.** Large n with mild non-normality (the t-test is fine and its
interval is in the units people use); skew that is really two strata blended (stratify,
Module 3); a sponsor question about the *mean* because totals matter (total rework hours,
total cost), where the mean is the right summary even when ugly and a bootstrap interval is
the tool; paired groups (Wilcoxon signed-rank, not Mann-Whitney).

---

## 4.6 Two-way ANOVA with interaction; GLM awareness (45 min)

**Hook (MFG).** Heat-seal strength (N) on a packaging line: three sealers, two film suppliers.
The purchasing question is "which film?" The one-way ANOVA on film says "no difference." The
line's operators say S2 film "doesn't run on M3." Both are right.

**Teach.** Two-way ANOVA partitions variation into factor A, factor B, their interaction and
error. The interaction is read first: if it is present, a main effect is the average of two
different facts and the sponsor sentence must be conditional. Balanced data (equal cell
counts) make the sums of squares unambiguous. Check residuals as in 4.1, plus equal spread
across cells.

**Show (MFG).** Four seals per cell, 24 in total, randomized within a shift; illustrative
minimum 28 N.

```
Two-way ANOVA: seal_strength_N versus sealer, film_supplier     N = 24 (4 per cell)

Source                  DF       SS      MS       F       P
sealer                   2   66.443  33.222   29.53   0.000
film_supplier            1    0.260   0.260    0.23   0.636
sealer*film_supplier     2   13.813   6.907    6.14   0.009
Error                   18   20.253   1.125
Total                   23  100.770
S = 1.061   R-Sq = 79.9%   R-Sq(adj) = 74.3%

Cell means (N)       film S1    film S2    Sealer mean
sealer M1             30.95      32.28       31.61
sealer M2             30.52      30.85       30.69
sealer M3             28.85      26.58       27.71
Film mean             30.11      29.90
```

*The sentence you tell your sponsor:* "Averaged over the three sealers, the two films are
indistinguishable — and that average hides the finding. On M1 and M2, either film gives about
31 N. On M3, S2 film loses about 2.3 N and the cell drops to 26.6 N, below the 28 N minimum;
M3 is also about 2 N weaker than the others on S1 film. Either qualify S2 film off M3 or find
what M3 does differently — we recommend the second, because M3 is the problem on both films."

**GLM awareness.** The **general linear model** is the same machinery with the restrictions
removed: unbalanced cell counts, a continuous covariate alongside factors (analysis of
covariance: seal strength adjusted for film gauge), random factors (operator as a sample of
operators, not the three you have), nested factors. Software fits it through the same
regression engine as 4.1, so the diagnostics are identical. At Black Belt you recognize an
unbalanced design or a covariate and fit the GLM in software; choosing among sums-of-squares
types and fitting mixed models is Master Black Belt territory, and the crosswalk says so.

**Software parity.** Minitab: Stat > ANOVA > General Linear Model > Fit General Linear
Model (two-way and GLM alike), Factorial Plots for the interaction. Excel: Data Analysis >
ANOVA: Two-Factor With Replication (balanced only, no covariates). R: `aov(y ~ A*B)`, `lm()`
with `car::Anova(type = 2)` for unbalanced data, `interaction.plot()`. Python: `statsmodels`
`ols("y ~ C(A)*C(B)")` then `anova_lm(typ = 2)`.

**When NOT to use two-way ANOVA.** Factor levels that were never chosen, only whatever the
process ran, with badly unbalanced cells (fit the GLM and say the comparison is
observational); an empty cell (the interaction is not estimable); a proportion or count
response (logistic or Poisson regression); a question the operators' knowledge and a
stratified dot plot already answer.

---

## 4.7 When NOT to model (40 min)

The rubric awards A3 for restraint on purpose, and the reviewer guidance says a two-sample
comparison that answered the question outscores a regression that did not need to exist.
Before any model, answer these in writing; the answers are the A3 exhibit whichever way they
go.

- **The graph already answers it.** (MFG) Stratifying a defect rate by machine shows one of
  four machines producing 80% of the defects; a regression with machine as a factor adds a
  p-value to the obvious. Go and look at the machine.
- **The measurement system has not passed.** Gauge R&R above 30%, or attribute kappa below
  0.7, means the model is fitting the gauge. Module 2, then come back.
- **You cannot get 10–15 observations per term.** (HC) A unit with 40 discharges a month and
  six candidate X's needs three months before a model means anything. Compare two groups with
  what you have and say what you could not test.
- **The candidate X is downstream of Y.** Status calls per claim, nursing notes per stay,
  expediting emails per order: consequences of a long cycle, not causes. Any model will love
  them. The lab makes this mistake on purpose.
- **The X's were never varied independently.** Temperature and viscosity that always moved
  together are separated by an experiment (Module 5), not a model.
- **The data are a mixture or unstable.** Two sites, or a step change in week 15, fitted as
  one process describe neither (Module 3). Stratify or chart first.
- **The question is about a change you made.** Before-and-after on the same operational
  definition is I1 evidence, read on a control chart; a model with "after" as a predictor is
  the same comparison with more places to go wrong.
- **The model would predict outside the data.** (TXN) Nobody in the data had a queue depth
  above 90; the model has nothing to say about 150.

**Data ethics in modeling.** Rows are never dropped because they hurt the fit; a row is
excluded only by a rule written before the analysis (a changed operational definition, a
duplicate extract, a coded missing value), and the rule is in the M3 record. Operational
definitions never change between baseline and model. Terms are never added or removed to move
a p-value across 0.05. The reviewer treats each of these as a stop.

---

## 4.8 Writing the A2, A3 and A4 record (15 min)

★ A2 is earned by one paragraph and its exhibits, in this order: the question in the sponsor's
words; the method and why it fits the question and the data type; the four diagnostic plots
(or the shape check for a rank test) with the verdict; the effect in the process's units at
named settings with its interval; the alternative explanations considered and how each was
addressed; the caveat that observational effects are associations until Module 5. A3 is one
paragraph naming a place you did not model and why. A4 is the table of everything tested that
did not verify — the film supplier main effect, the inert predictor — with its result, because
a cause ruled out is a finding.

---

## Live lab, week 6 — "The model that looks great and is wrong" — run of show

**Duration:** 150 minutes, live virtual · **Teams of 4** · **Prerequisite:** 4.1–4.3 read;
software installed; `m4-claims-cycle.csv` loaded before joining.

**Lab outcomes.** Every team (1) fits a model with R-sq above 0.95 and is proud of it for
about twenty minutes, (2) takes it apart with the four plots and three provenance questions,
and (3) answers one question with a graph instead of a model and writes the A3 sentence.

**The case (TXN).** The claims dataset from 4.1, extended: about 480 claims from two intake
sites, the four X's plus `status_calls` (claimant enquiries logged against the claim), `site`,
and a re-extracted six weeks. Ground truth is under *Vertical case dataset*.

### 0:00–0:10 — Setup and the trap
Frame: "Your sponsor wants the model of claim cycle time by the end of the session." Poll:
"What R-sq would satisfy you, gut only?" Save the results. Teams get the file, the data
dictionary and nothing else.

### 0:10–0:35 — Round 1: fit everything
Teams fit all available predictors. Most get R-sq about 0.96 with `status_calls` the strongest
term and queue depth dropping out. Checkpoint at 0:30: each team posts its R-sq and its
sponsor sentence on the shared board. Do not comment on the sentences yet. **Do not rescue
early**; the pride is the product.

### 0:35–1:05 — Round 2: the four plots and one question
Teams produce the four residual plots. The funnel appears; teams that transform find it
closes. Then the facilitator asks each team: "For each X in your model, could Y cause it?"
Teams that answer honestly remove `status_calls`, watch R-sq fall to about 0.80, and see queue
depth return. Failure mode: a team keeps `status_calls` "because it predicts well"; ask what
the process owner would do with it. Nothing; it is a thermometer.

### 1:05–1:30 — Round 3: provenance
Three prompts, one at a time. "How many distinct claim IDs are there?" (24 rows are duplicated
from the re-extract; the SEs were too small.) "What does experience = 0 mean?" (Eleven
contractors were coded 0, not measured: a coded missing value, excluded by a written rule,
not deleted.) "Plot residuals by site." (Site B sits about 3 hours higher at every fitted
value: an unrecorded process difference that belongs in the model as a factor and in the
record as a question.)

### 1:30–1:50 — Round 4: the restraint decision
The sponsor's second question arrives in character: "Does the site difference matter enough
to act on?" Teams answer with a stratified box plot and the site coefficient's interval, and
write the A3 sentence: what they decided not to model further and why. A team reaching for a
second regression is asked what it would add.

### 1:50–2:15 — Debrief: the anatomy of a wrong certainty — protect this block
Reveal ground truth. Each team narrates its 0:30 sentence, what the funnel told them, which
plot caught the site, when they noticed the duplicates. Re-run the opening poll. Name the
transferable patterns: R-sq is not evidence; a consequence of Y will always predict Y;
diagnostics before coefficients; count your IDs before your p-values; the graph that answers
the question is the analysis. If Round 3 overruns, cut Round 4 to the box plot alone and start
the debrief on time.

### 2:15–2:30 — Transfer
Each learner lists the X's in their own cause structure, marks any that could be downstream
of Y, and posts the one diagnostic plot they have not yet made. The Master Black Belt coach
uses that list at the week 7 checkpoint.

### Facilitator notes and failure modes
- **A team finds `status_calls` in Round 1** (someone reads the data dictionary and asks the
  question unprompted): promote them to reviewers of the other teams' sentences in Round 2.
- **A team deletes the contractor rows and the duplicates without writing the rule:** stop the
  round for that team; the rule is the deliverable, not the cleaner file.
- **A team removes the $129K claim as an outlier:** it is real and high-leverage; the honest
  report shows the fit with and without it. Removing it is a data-ethics stop.
- **Software drift:** Excel teams reach the four plots later; pair them with an R or Minitab
  team for Round 2 rather than extending it.

## Live lab, week 7 — Logistic and non-parametric clinic (compact run of show)

**150 minutes.** 0:00–0:20 each learner posts their project's cause-verification question
and the data type of Y and each X; the facilitator sorts the room into "regression",
"logistic", "rank test", "two-way/GLM" and "no model needed" and reads the last group's
reasons aloud. 0:20–1:00 logistic clinic on the discharge data: fit, translate two odds ratios
into probabilities at settings the sponsor named, check events per predictor and
Hosmer-Lemeshow. 1:00–1:35 rank-test clinic: the supplier rework data and the invoice data
with the three disputed invoices; each pair chooses Mann-Whitney or Mood's and defends it,
then writes the shift sentence. 1:35–2:15 A2 paragraph workshop — every learner reads a
peer's A2 draft as the reviewer of record would, with the rubric open, checking first for the
four plots. 2:15–2:30 close: what each learner will collect before the week 8 checkpoint.
Failure mode to watch: a learner whose Y is a binned continuous variable — send them back to
the continuous model.

---

## Project work this module

| Rubric item | What you produce by the end of week 7 |
|---|---|
| **★ A2 Root cause verified with an appropriate method** | The 4.8 paragraph with exhibits: method matched to question and data type; four diagnostic plots (or the shape check) with verdicts; VIF where more than one continuous X; effect in process units at named settings with interval; alternative explanations addressed; observational caveat |
| **A3 Restraint** | One paragraph naming a question you answered graphically or by a two-group comparison instead of a model, or a model you declined to fit, with the 4.7 reason |
| **A4 Rejected hypotheses shown** | Every X and interaction tested that did not verify, with result and interval; an inert term is a finding |
| Carried from A1 / M3 | The cause structure that named the model's terms before fitting; the provenance record updated with every exclusion rule and the duplicate check |

If your primary metric is yes/no, the logistic output and the events-per-predictor count are
the A2 exhibit; if your groups are small and skewed, the rank test with its shift estimate is;
if the answer is visible on a stratified chart, the chart is, and the paragraph saying why no
model was needed earns A3 as well.

## Coaching prompts (week 7 checkpoint)

1. "Show me the residuals-versus-fitted plot before you show me the coefficients. What did
   it say, and what did you change because of it?"
2. "Which of your X's could be a consequence of Y rather than a cause? How many distinct
   units are in the model, and where is the rule for every row you excluded?"
3. "Read me the effect in the sponsor's units at two settings they recognize. Now tell me
   one thing you decided not to model, and why."

## Vertical case dataset — `m4-claims-cycle.csv` (TXN)

One row per claim, about 480 rows, two intake sites, 26 weeks. Columns: `claim_id`, `site`
(A/B), `received_date`, `items`, `amount_k`, `reviewer_id` (coded), `exp_m`, `queue`,
`status_calls`, `cycle_h`, `extract_batch`. Planted, in the order teams should find them:
(1) `status_calls` is generated from `cycle_h`, a consequence of Y that lifts R-sq to about
0.96 and displaces queue depth; (2) multiplicative error, so raw-scale residuals funnel and
the log scale is right; (3) 24 rows duplicated by a second extract (`extract_batch` = 2
repeats six weeks of batch 1), to be removed by a written rule; (4) `exp_m` = 0 for eleven
contractors, a code, not a value; (5) site B about 3 working hours slower at every fitted
value, recorded nowhere else in the file; (6) one genuine $129K claim with high leverage, to
be reported with and without. The 4.1 outputs reproduce on site A, batch 1, contractors
excluded. The other worked datasets (`m4-mfg-coating.csv`, `m4-hc-discharge-late.csv`,
`m4-hc-ed-triage.csv`, `m4-mfg-seal-strength.csv`) match their sections' outputs.
Coefficients and rates are illustrative; structures are drawn from observed claims, coating
and discharge processes. Files ship in the practicum data folder when published; until then,
facilitators generate them from these parameters.

## Takeaways

- Diagnostics before coefficients, coefficients before p-values, the sentence in real units
  at named settings. A funnel means a wrong scale; a consequence of Y will always predict Y.
- VIF tells you which levers you cannot separate; the physics, or an experiment, chooses.
- Logistic coefficients are odds ratios; sponsors need probabilities at settings they
  recognize. Rank tests are the honest choice for small, skewed or ordinal data, and they
  come with a shift estimate.
- The interaction is read first. The decision not to model is written down, and it earns A3.

## Cumulative check (re-testing Modules 2 and 3)

**C-PRAC-1.** A Black Belt candidate (HC) plans a logistic model of "discharge summary
incomplete" (yes/no). The Module 2 attribute agreement study shows each auditor agrees with
themselves 96% of the time, but kappa against the expert standard is 0.41, with 85% of records
judged complete. The best next action is:
A. Fix the measurement system before modeling: self-agreement on a mostly-"complete"
population is inflated by prevalence, and kappa 0.41 says the auditors are not reliably
finding incomplete records, so the model would fit the auditor ✅ · B. Proceed; 96% agreement
exceeds the 90% threshold · C. Proceed but add auditor as a predictor in the model · D. Use
Mood's median test instead, which is robust to measurement error
`[B · B2 · Evaluate · HC · S · PRAC]` — within-appraiser agreement without agreement to the
standard is repeatability without accuracy; adding auditor as a predictor models the error
rather than removing it, and no test is robust to a response that is wrong.

**C-PRAC-2.** A customer asks a fastener supplier (MFG): "What torque will 95% of your
fasteners hold?" The candidate's baseline of 80 parts is stable and normal (mean 42.5 N·m,
SD 1.9) and the candidate reports the 95% confidence interval for the mean, 42.1–42.9 N·m.
The reviewer's correct feedback is:
A. Accept; the interval is correctly computed · B. Replace it with the 95% prediction
interval for the next fastener · C. Widen it using the two-sample t formula · D. Replace it
with a 95/95 tolerance interval, because the customer asked what covers a stated fraction of
fasteners, not where the mean lies; on these data the lower bound is about 38.5 N·m ✅
`[C · B3 · Apply · MFG · S · PRAC]` — the confidence interval brackets the mean and narrows
with n; the customer's question is about a fraction of the population, which is a tolerance
interval; a prediction interval answers "the next one," not "95% of them."

---

v1.0 · 2026-09-20
