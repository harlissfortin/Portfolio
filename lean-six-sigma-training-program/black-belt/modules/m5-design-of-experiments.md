# Module 5 — Design of Experiments (weeks 8–11 · 16 h self-paced + 4 × 2.5 h live labs + the 2-day DOE practicum)

This is the centerpiece of the Black Belt course: about a fifth of the structured time. Four
weeks, four live labs, and Immersion 1 in week 10. By the end you have designed, run and
analyzed at least three experiments on the practicum apparatus and, where the process allows,
one on your own project. The rubric item this module serves is **★ I1** (experimental or
piloted solution evidence) in [`../project/review-rubric.md`](../project/review-rubric.md).

**Learning objectives.** By the end of this module the learner can:
1. State, for a given question, why an observational analysis cannot answer it and what an
   experiment must control, randomize and replicate.
2. Design a 2^k full factorial: choose factors and levels, write the standard-order matrix,
   randomize the run order, and choose replication from a power calculation.
3. Compute effects and coefficients, read main-effect and interaction plots, produce and
   interpret the ANOVA of effects, check residuals, and write the sponsor sentence with effect
   sizes in engineering units.
4. Derive an operating window from a fitted model with its prediction uncertainty stated.
5. Analyze an unreplicated design with a half-normal plot and Lenth's method.
6. Build a fractional factorial from generators, write the defining relation and alias table,
   state its resolution, and read confounding straight off an effects table.
7. Choose and apply blocking, and name what is confounded with blocks.
8. Add center points, test for curvature, and choose the next step in a sequential strategy
   (screen → characterize → optimize).
9. Describe steepest ascent and a central composite design well enough to recognize when to
   ask for response-surface help (awareness level per the skills matrix; running RSM unaided
   is Master Black Belt territory).
10. Decide, with written reasons, when not to run an experiment.

**How the four weeks run**

| Week | Self-paced sections | Live lab | Project |
|---|---|---|---|
| 8 | 5.1–5.4 full factorials, effects, ANOVA, operating windows | Lab 8: design, run and analyze a 2^3 on the apparatus | DOE planning canvas drafted |
| 9 | 5.5–5.7 unreplicated designs, fractional factorials, blocking | Lab 9: the ambiguous table; a 2^(4−1) on the apparatus | Design chosen and justified; measurement system confirmed |
| 10 | 5.8 center points and curvature; practicum prep | **Immersion 1: DOE practicum (2 days)** | Experiment or pilot scheduled |
| 11 | 5.9–5.12 sequential strategy, RSM introduction, when not to experiment, the apparatus | Lab 11: project experiment clinic | Prediction written before the runs |

Section minutes below total about 10 h; the remaining self-paced time is the Try exercises,
the case datasets and your own analysis files.

---

## 5.1 Why experiments beat observation (30 min)

**Hook.** Your Module 4 regression found that invoices handled by the team that uses the new
template close 6 hours faster. Your sponsor wants to roll the template out. Should they?

**Teach.** Observational data records what the process happened to do. Everything that varied
with the factor you care about varied with it, together, and the data cannot tell them apart.
The template team may also get simpler invoices, sit closer to the approver, or have been
staffed with the people who volunteered for a pilot. A regression can adjust for variables you
measured; it cannot adjust for ones you did not, and it cannot break a correlation the process
itself built in.

An experiment does three things observation cannot:
- **Control:** you set the factor levels, so the factor is not chosen by the process.
- **Randomization:** you assign the run order (and, where relevant, the units) by chance, so
  every nuisance you did not think of is spread across levels rather than lined up with one.
- **Replication:** you repeat conditions so the analysis has an honest estimate of noise to
  compare effects against.

Add **factorial structure** — varying several factors at once in a balanced pattern — and you
also get to see interactions, which one-factor-at-a-time trials structurally cannot.

**Show (HC).** A hospital pharmacy sees faster IV compounding on days when the second
technician starts early. Observationally, early starts coincide with lighter census, because
scheduling adds the early start on days the manager expects to be quiet. The manager is
responding rationally to the roster they inherited. Only an experiment — early start assigned
by coin flip across 20 days, census recorded as a covariate — separates the start time from the
census. The observational estimate was 22 minutes per batch; the randomized estimate was 9.
Both numbers are illustrative; the direction of the bias is the lesson.

**Try.** For your own project's leading cause, write one sentence: what nuisance variable is
most likely lined up with it in your observational data, and what would an experiment have to
randomize to break that alignment?

---

## 5.2 Designing a 2^k factorial: factors, levels, randomization, replication (60 min)

**Teach.** A **2^k full factorial** runs every combination of k factors at two levels each.
Coded levels are −1 (low) and +1 (high). In **standard (Yates) order** factor A alternates
every run, B every two runs, C every four, and so on. You never run in standard order; you
run in a **randomized order** drawn once and recorded in the logbook.

Design decisions, in the order the DOE planning canvas asks them (`../templates/doe-planning-canvas.md`):
1. **Objective and response.** One response, continuous where possible, with an operational
   definition and a measurement system whose gauge R&R you have checked (Module 2). An
   experiment measured with a poor gauge is an expensive way to measure the gauge.
2. **Factors and levels.** Two to five factors for a first design. Levels wide enough to move
   the response but inside the range the process could actually run. Levels too close together
   produce small effects buried in noise; levels outside the feasible range produce a model of a
   process nobody will operate.
3. **Nuisance variables.** For each one: hold it constant, block on it (5.7), or randomize over
   it. Write which.
4. **Replication.** A **replicate** is the whole design run again in a fresh random order.
   Measuring the same run twice is a **repeat**, and it estimates measurement noise, not
   process noise. Replicates give a pure-error estimate and the degrees of freedom for tests.
5. **Run count and power.** The standard error of an effect in a 2-level design is
   2σ/√N, where N is the total number of runs. For the adhesive design in 5.3 (N = 16,
   σ ≈ 0.6 MPa, 8 error degrees of freedom), an effect of 1.0 MPa is detected with power 0.83
   at α = 0.05; an effect of 0.6 MPa only 0.42. If the smallest effect worth acting on is 0.6
   MPa, 16 runs is not enough, and knowing that before you run is the point.
6. **Analysis plan and decision rule.** Written before the data exist: which terms you will
   fit, what residual checks you will do, and what result would change the process.

**Software parity — creating designs and sizing them**

| Task | Minitab | Excel | R / Python |
|---|---|---|---|
| Create 2^k, randomize | Stat > DOE > Factorial > Create Factorial Design (randomize runs on) | Build coded columns by hand; RAND() column, sort to randomize | R `FrF2::FrF2(nruns, nfactors, randomize = TRUE)`; Python `pyDOE3.ff2n(k)` then shuffle |
| Power for an effect | Stat > Power and Sample Size > 2-Level Factorial Design | Effect ÷ (2σ/√N) against the t distribution with T.DIST | R `power.t.test` on the effect/SE ratio, or simulate; Python `statsmodels.stats.power.TTestPower` |

**Show (MFG, the design used in 5.3).** Lap-shear strength of a structural adhesive. Factors:
A cure temperature (120 / 160 °C), B cure time (20 / 40 min), C surface preparation (solvent
wipe / plasma). Response: strength in MPa on a calibrated tester (gauge R&R 9% of study
variation, Module 2). Two replicates, N = 16, run order randomized within one shift on one
press. Bonded coupons are destroyed by the test, so each run is a fresh coupon.

**Try.** Fill in the canvas for the practicum apparatus (catapult, helicopter or simulator)
with three factors. Choose levels; then say what would happen to your effect estimates if you
chose levels half as far apart.

---

## 5.3 Effects, interaction plots, ANOVA of effects, residuals — worked design 1 (75 min)

**Teach.** The **effect** of a factor is the mean response at its high level minus the mean at
its low level. The **coefficient** in the regression form is half the effect, because the
coded factor moves two units from −1 to +1. Minitab reports both; regression output in Excel,
R and Python reports the coefficient, so double it to get the effect. An **interaction** AB is
the effect computed on the product column A × B; it is half the difference between the effect
of A at B high and the effect of A at B low.

**Data (MFG, worked design 1)** — standard order shown; the runs were executed in the
randomized order recorded in the logbook.

```
Std  A(temp)  B(time)  C(prep)   Rep 1   Rep 2
 1     −1       −1       −1       7.4     7.4
 2     +1       −1       −1      13.0    13.3
 3     −1       +1       −1      10.3    10.7
 4     +1       +1       −1      11.3    12.9
 5     −1       −1       +1      10.6    11.1
 6     +1       −1       +1      14.6    15.7
 7     −1       +1       +1      11.7    12.4
 8     +1       +1       +1      14.5    14.3
```

**Effects table**

```
Factorial fit: Strength (MPa) versus A, B, C — 2^3 full factorial, 2 replicates, N = 16
Term          Effect     Coef  SE Coef       T       P
Constant              11.950    0.137   87.20   0.000
A temp         3.500    1.750    0.137   12.78   0.000
B time         0.625    0.313    0.137    2.28   0.052
C prep         2.325    1.163    0.137    8.49   0.000
A*B           -1.525   -0.763    0.137   -5.57   0.001
A*C           -0.175   -0.088    0.137   -0.64   0.541
B*C           -0.400   -0.200    0.137   -1.46   0.182
A*B*C          0.550    0.275    0.137    2.01   0.080
S = 0.548   R-Sq = 97.2%   R-Sq(adj) = 94.8%   residual df = 8
```

**ANOVA of effects**

```
Source            DF      SS      MS       F       P
Main effects       3  72.185  24.062   80.21   0.000
2-way interactions 3  10.065   3.355   11.18   0.003
3-way interaction  1   1.210   1.210    4.03   0.080
Residual error     8   2.400   0.300
  Pure error       8   2.400   0.300
Total             15  85.860
```

**Reading it.** Each effect's sum of squares is N × effect² / 4 (for A: 16 × 3.5² / 4 = 49.0),
so the ANOVA and the effects table are the same information; the ANOVA groups it. Because the
design is replicated and the full model is fitted, the residual is entirely pure error:
s = 0.548 MPa is the run-to-run noise of the process plus gauge.

Three terms are clearly real: A (3.5 MPa), C (2.3 MPa) and the A×B interaction (−1.5 MPa).
B's main effect is marginal (p = 0.052), but B stays in the model because A×B is in it
(**hierarchy**: a model with an interaction keeps its parent main effects). A×B×C at p = 0.08
is not pursued: three-factor interactions are rare in physical processes, the effect is small,
and chasing every p near 0.05 is how experiments get over-fitted.

**The interaction plot.** Cell means of strength by A and B, averaged over C:

| | B = 20 min | B = 40 min |
|---|---|---|
| A = 120 °C | 9.1 | 11.3 |
| A = 160 °C | 14.2 | 13.3 |

At 120 °C, going from 20 to 40 minutes adds 2.2 MPa. At 160 °C it removes 0.9 MPa. The lines
cross; that is what a −1.5 interaction effect looks like. **A main effect for B of "0.6 MPa"
is not a fact about the process; it is the average of two opposite facts.** Interaction plots
are read before main-effect plots for exactly this reason.

**Residual checks** (the same three plots as Module 4, and just as mandatory): a normal
probability plot of the 16 residuals (roughly straight here), residuals versus fitted values
(no funnel — the spread at 7.4 MPa and at 15 MPa is similar), and residuals versus **run
order** (no trend — this is the plot that catches a drifting press or a warming oven, and it
is the reason you kept the run order). A trend in run order means a nuisance variable moved
during the experiment; you report it and, next time, block on it.

**The sentence you would tell your sponsor.** "Raising cure temperature from 120 to 160 °C
adds about 3.5 MPa of shear strength (from roughly 10 to 14); plasma preparation adds about
2.3 MPa on top. Cure time only matters at 120 °C. At 160 °C with plasma prep, 20 minutes is
as strong as 40 — predicted 15.3 MPa against today's 10.1 at 120 °C / 40 min / solvent — so
the change also halves cure time." Effect sizes in MPa, a comparison to today, and the
practical consequence. No p-value in the sentence.

**When not to use this analysis.** Don't fit a full factorial model when the response is a
count of rare events per run (use a rate with enough events per run, or expect to transform),
when runs were not randomized and a run-order trend exists (the effects are confounded with
time), or when one run failed and you silently averaged around it — a missing run in a 2^k
breaks the balance and needs a documented imputation or a re-run.

**Software parity — analysis and plots**

| Task | Minitab | Excel | R / Python |
|---|---|---|---|
| Effects, ANOVA | Stat > DOE > Factorial > Analyze Factorial Design | Data Analysis > Regression on coded A, B, C and product columns; effect = 2 × coefficient; the Excel stats add-in's DOE menu does this directly | R `lm(y ~ A*B*C, data)` with ±1 numeric codes, `anova()`; Python `statsmodels.formula.api.ols("y ~ A*B*C")`, `anova_lm` |
| Main-effect and interaction plots | Stat > DOE > Factorial > Factorial Plots | PivotTable of cell means → line chart | R `interaction.plot()`; Python `seaborn.pointplot` |
| Residual plots | Graphs in the Analyze dialog (four in one) | Regression residual output → scatter charts vs fitted and vs run order | R `plot(fit)`; Python residuals from `fit.resid` |

**Try (case dataset, MFG).** Re-run the analysis from `data/m5-mfg-adhesive.csv`. One
value in the file is planted as 74 instead of 7.4. Find it from the residual plots before
you find it by reading the column, and write down which plot showed it first.

---

## 5.4 From model to operating window — worked design 2 (45 min)

**Teach.** An **operating window** is the set of factor settings the model predicts will meet
the requirement with a stated margin. You derive it from the fitted equation, state the
uncertainty, then choose the cheapest setting inside it — and then you **confirm** with runs
at that setting, because a model is a claim about the process, not a fact about it.

**Data (HC, worked design 2).** A sterile processing department's washer-disinfector. Factors:
A wash temperature (45 / 65 °C), B enzymatic detergent dose (4 / 8 mL per L). Response:
residual protein in micrograms per instrument, measured by swab assay on standard-soiled
hemostats. Three replicate trays per cell, N = 12, randomized over five days. The department's
acceptance limit is 10 µg per instrument (an illustrative threshold; use your facility's).

```
Std  A(temp)  B(dose)   Rep 1  Rep 2  Rep 3
 1     −1       −1       12.0   12.2   10.9
 2     +1       −1        9.6    7.0    7.2
 3     −1       +1        8.9    7.7    9.1
 4     +1       +1        8.0    6.3    6.4
```

```
Factorial fit: Residual protein (µg/instrument) — 2^2, 3 replicates, N = 12
Term          Effect     Coef  SE Coef       T       P
Constant               8.775    0.291   30.15   0.000
A temp        -2.717   -1.358    0.291   -4.67   0.002
B dose        -2.083   -1.042    0.291   -3.58   0.007
A*B            1.050    0.525    0.291    1.80   0.109
S = 1.008   R-Sq = 82.6%   residual df = 8
```

**Reading it.** Temperature and dose both reduce residual protein (−2.7 and −2.1 µg). The
interaction is not established (p = 0.11, effect +1.05 with SE 0.58) — the data are
consistent with the two factors simply adding.

**The equation in natural units.** With xA = (temp − 55) / 10 and xB = (dose − 6) / 2:
predicted protein = 8.775 − 1.358·xA − 1.042·xB + 0.525·xA·xB.

**Predicted corner means and the 95% confidence interval on each mean** (half-width
t₀.₀₂₅,₈ × s × √(4/12) = 2.306 × 1.008 × 0.577 = 1.34 µg):

| Setting | Predicted mean | 95% CI on the mean | Meets ≤ 10 with margin? |
|---|---|---|---|
| 45 °C, 4 mL/L (today) | 11.7 | 10.4 – 13.0 | No |
| 45 °C, 8 mL/L | 8.6 | 7.2 – 9.9 | Barely |
| 65 °C, 4 mL/L | 7.9 | 6.6 – 9.3 | Yes |
| 65 °C, 8 mL/L | 6.9 | 5.6 – 8.2 | Yes |

The window is the region where the upper confidence bound sits under 10: everything except
today's setting, with the high-dose/low-temperature corner marginal. The cheapest reliable
setting is **65 °C at 4 mL per L** — detergent cost stays where it is, and the change is a
cycle parameter. Note the distinction from Green Belt capability work: the CI above is for the
*mean* tray; an individual instrument varies around it with s ≈ 1.0 µg, so a **prediction
interval** for one instrument is about ±2.7 µg. If the requirement is "no instrument over 10",
you size the margin from the prediction interval, not the confidence interval.

**Confirmation.** Five trays at 65 °C / 4 mL per L, run the following week: mean 8.1 µg,
inside the interval. Only now does the countermeasure go into the control plan.

**The sponsor sentence.** "Raising wash temperature to 65 °C cuts residual protein from about
12 to about 8 µg per instrument at the current detergent dose, with confirmation runs
agreeing. Increasing detergent as well buys another microgram at a recurring cost; we recommend
temperature alone and keep dose as a reserve lever."

**Try.** Suppose the acceptance limit were 7 µg instead of 10. Using the table, write the honest
conclusion — and say what the next experiment would have to change (factor ranges, or a new
factor such as pre-soak time). An experiment that finds no window inside the ranges tested is
a successful experiment.

---

## 5.5 Unreplicated designs: half-normal plots and Lenth's method — worked design 3 (45 min)

**Teach.** With four or more factors, replication doubles an already large run count, and the
usual choice is a **single replicate**. There is then no error degree of freedom: the full
model uses every one. Two ways out, used together:
- **Half-normal plot of effects.** Sort |effects|, plot them against half-normal quantiles.
  Inert effects fall on a line through the origin; real ones stand off to the right.
- **Lenth's method.** A pseudo standard error (PSE) computed from the small effects: s₀ = 1.5 ×
  median |effect|; PSE = 1.5 × median of the |effects| below 2.5·s₀; margin of error
  ME = t₀.₀₂₅, d/3 × PSE, where d is the number of effects. Effects beyond ±ME are declared active.
Then refit the model with only the active terms; the pooled inactive terms become the error.
This is the one place in the course where the analysis legitimately chooses terms after seeing
the data, and the guardrails are the half-normal plot, hierarchy, and physical sense.

**Data (TXN, worked design 3).** Invoice processing in the accounts-payable process simulator
(transactional cohorts run this live in Lab 8). Factors: A batching (single-piece / batches of
10), B validation point (at approval / at entry), C form template (current / redesigned),
D routing (manual / rule-based). Response: mean invoice cycle time in working hours over one
simulated week. 2^4, single replicate, 16 randomized runs.

```
Std   A   B   C   D   Cycle time (h)     Std   A   B   C   D   Cycle time (h)
 1   −1  −1  −1  −1      31.4             9   −1  −1  −1  +1      29.1
 2   +1  −1  −1  −1      34.9            10   +1  −1  −1  +1      32.5
 3   −1  +1  −1  −1      23.4            11   −1  +1  −1  +1      19.5
 4   +1  +1  −1  −1      35.3            12   +1  +1  −1  +1      31.6
 5   −1  −1  +1  −1      33.9            13   −1  −1  +1  +1      28.9
 6   +1  −1  +1  −1      36.7            14   +1  −1  +1  +1      33.1
 7   −1  +1  +1  −1      24.2            15   −1  +1  +1  +1      20.9
 8   +1  +1  +1  −1      32.5            16   +1  +1  +1  +1      30.7
```

**Effects, sorted by size, with Lenth's method**

```
Term    Effect    |   Term    Effect    |   Lenth's method (15 effects)
A        7.000    |   BC      -0.775    |   s0  = 1.5 × median|effect| = 1.5 × 0.725 = 1.087
B       -5.300    |   ABC     -0.750    |   PSE = 1.5 × median of |effects| < 2.72   = 0.562
A*B      3.525    |   AC      -0.725    |   ME  = t(0.025, 5) × PSE = 2.571 × 0.562 = 1.45
D       -3.250    |   C        0.400    |
BCD      0.800    |   AD       0.375    |   Active (|effect| > 1.45): A, B, A*B, D
ACD      0.350    |   CD      -0.175    |   Half-normal plot: four points stand off the line;
BD       0.075    |   ABD      0.050    |   the other eleven lie on it through the origin
ABCD    -0.025    |            
```

**Reduced model** (C and all inactive interactions pooled into error, 11 df):

```
Term        Effect     Coef  SE Coef       T       P
Constant            29.912    0.252  118.7    0.000
A batch      7.000    3.500    0.252   13.90   0.000
B valid.    -5.300   -2.650    0.252  -10.52   0.000
D routing   -3.250   -1.625    0.252   -6.45   0.000
A*B          3.525    1.763    0.252    7.00   0.000
S = 1.007   R-Sq = 97.3%   residual df = 11 (pooled)
```

**Reading it.** Batching costs 7.0 hours of cycle time on average, but the A×B interaction says
how much depends on where validation sits: with validation at approval, batching costs
7.0 + 3.5 = 10.5 hours; with validation at entry, 7.0 − 3.5 = 3.5 hours. The redesigned form
(C) does nothing detectable (0.4 h against a margin of 1.45). Rule-based routing saves 3.3 h.
Predicted best: single-piece, validation at entry, rule-based routing = 20.4 h; today's
setting (batch, approval, manual) = 35.9 h; both match their observed cells within a hour.

**The sponsor sentence.** "Moving validation to the point of entry and stopping batching
takes mean invoice cycle time from about 36 working hours to about 20, and rule-based routing
takes it to about 20 from 24 on its own. The redesigned form makes no measurable difference,
so it is not worth the change-management cost." Note the last clause: a null result on C is a
finding, and it goes in the record (rubric A4).

**When not to use Lenth's method.** When fewer than about 8 effects exist (the PSE is unstable),
when more than half the effects are large (the median is then a large effect and the PSE is
inflated, hiding everything), or as a substitute for replication when replication was
affordable. And never combine it with dropping runs you did not like.

---

## 5.6 Fractional factorials: generators, confounding, resolution, aliasing (90 min)

**Teach.** Five factors is 32 runs; seven is 128. A **fractional factorial** 2^(k−p) runs a
1/2^p fraction by *generating* the extra factor columns from interactions of the base design.
The price is **confounding** (aliasing): each column now estimates the sum of two or more
effects, and the data cannot separate them. You choose which effects to sacrifice, and the
choice is written in the **defining relation**.

- **Generator:** the rule for an added column, e.g. D = ABC. The **word** is ABCD = I.
- **Defining relation:** I = every word and every product of words. It lists everything
  aliased with the mean.
- **Alias of any effect:** multiply it into every word of the defining relation (letters
  squared vanish).
- **Resolution** = the length of the shortest word:
  - **III** — main effects aliased with two-factor interactions. Screening only, and only when
    you accept that a "main effect" might be an interaction.
  - **IV** — main effects clear of two-factor interactions; two-factor interactions aliased
    with each other. The workhorse for characterization.
  - **V** — main effects and two-factor interactions all clear of each other. Safe for a
    model with interactions; e.g. 2^(5−1) with E = ABCD in 16 runs.

**Choosing a fraction (the table every Black Belt keeps to hand)**

| Factors | Runs | Design | Resolution | Generators |
|---|---|---|---|---|
| 4 | 8 | 2^(4−1) | IV | D = ABC |
| 5 | 8 | 2^(5−2) | III | D = AB, E = AC |
| 5 | 16 | 2^(5−1) | V | E = ABCD |
| 6 | 16 | 2^(6−2) | IV | E = ABC, F = BCD |
| 7 | 8 | 2^(7−4) | III | D = AB, E = AC, F = BC, G = ABC |
| 7 | 16 | 2^(7−3) | IV | E = ABC, F = BCD, G = ACD |

**Worked design 4 (HC): a resolution III screen and what it cost.** An outpatient clinic's
analytics team has a discrete-event simulation of the clinic day, validated against three
months of arrival and visit data. Five candidate levers, 8 runs first. Factors: A slot length
(15 / 20 min), B double-booking (off / on), C rooming by (medical assistant / nurse), D lab
draw (after / before the visit), E kiosk check-in (off / on). Response: mean patient wait in
minutes over a simulated 20-clinic-day month; each run uses fresh random seeds.

Generators D = AB and E = AC. Defining relation: **I = ABD = ACE = BCDE** (the third word is
the product of the first two). Resolution III (shortest word has three letters). Alias table:

```
Column   Estimates (up to three-factor terms)
A        A + BD + CE
B        B + AD
C        C + AE
AB       D + AB
AC       E + AC
BC       BC + DE
ABC      CD + BE
```

```
Std   A   B   C   D=AB  E=AC   Wait (min)      Effects (8-run, aliased)
 1   −1  −1  −1   +1    +1      37.1           A  + BD + CE  = -11.82
 2   +1  −1  −1   −1    −1      31.0           B  + AD       =   8.98
 3   −1  +1  −1   −1    +1      47.2           C  + AE       =  -1.27
 4   +1  +1  −1   +1    −1      38.6           D  + AB       =  -1.02
 5   −1  −1  +1   +1    −1      40.4           E  + AC       =  -4.47
 6   +1  −1  +1   −1    +1      24.9           BC + DE       =   0.12
 7   −1  +1  +1   −1    −1      50.3           CD + BE       =   0.23
 8   +1  +1  +1   +1    +1      33.2
```

**Reading confounding straight off the table.** The −11.8 on column A is "slot length, or the
double-booking × lab-timing interaction, or rooming × kiosk, or some mix". The −4.5 on the E
column is "kiosk, or slot length × rooming". Physically, slot length dominating is very
plausible and A × C is not, so a Black Belt would provisionally read A and B as real. But
"plausible" is not "shown", and the −4.5 is genuinely ambiguous: kiosk check-in is cheap and a
slot-length × rooming interaction would be an operational headache. The screen bought a lot
for 8 runs; it did not buy that answer.

**The fold-over.** Run the same 8 runs with every sign reversed (a **full fold-over**). The
combined 16 runs are a resolution IV design: main effects are now clear of two-factor
interactions. Combined estimates:

```
Effect (16 runs, resolution IV)
A slot length       -12.09
B double-booking      8.71
C rooming             -1.49
D lab timing          -1.39
E kiosk               -4.94
AC (+ BE + …)          0.46
```

The kiosk effect is real (about −5 min) and A × C is nothing. Sixteen runs total, sequenced,
told you what a 32-run full factorial would have — and if the first 8 had shown nothing
ambiguous, you would have stopped there.

**The sponsor sentence.** "Slot length is the dominant lever: 20-minute slots cut mean wait by
about 12 minutes. Double-booking adds about 9. Kiosk check-in saves about 5. Who rooms the
patient and when the lab draw happens make no detectable difference. Twenty-minute slots with
no double-booking and kiosk check-in predicts a mean wait near 25 minutes against about 51
today, in the simulation; the next step is a two-clinic pilot with a written prediction."

**Worked design 5 (MFG): resolution IV and the alias pair you cannot break.** Powder-coat
film thickness (µm) on brackets. Factors: A gun voltage (60 / 90 kV), B powder flow (30 / 50%),
C gun-to-part distance (200 / 300 mm), D spray passes (1 / 2). 2^(4−1), D = ABC, I = ABCD,
resolution IV, 8 runs randomized.

```
Std   A   B   C   D=ABC   Thickness (µm)     Column   Estimates        Effect
 1   −1  −1  −1   −1        64.2             A        A + BCD           9.62
 2   +1  −1  −1   +1        81.9             B        B + ACD           3.82
 3   −1  +1  −1   +1        71.3             C        C + ABD          -0.93
 4   +1  +1  −1   −1        72.8             ABC      D + ABC           7.98
 5   −1  −1  +1   +1        66.4             AB       AB + CD          -0.12
 6   +1  −1  +1   −1        68.2             AC       AC + BD           0.02
 7   −1  +1  +1   −1        67.2             BC       BC + AD           4.83
 8   +1  +1  +1   +1        84.7
```

Voltage (+9.6 µm) and passes (+8.0 µm) are clear, because in resolution IV a main effect's
only aliases are three-factor interactions, which you accept as negligible. The 4.8 on the
BC column is **either** flow × distance **or** voltage × passes. Both are physically
plausible: a second pass at high voltage may build more film, and high flow at short distance
may as well. The design cannot say. Options, in order of cost: run the other half fraction
(D = −ABC, 8 more runs, giving the full 2^4 with everything clear), or a single-factor
fold-over on A (8 runs, clears every interaction involving A). Either way you run more only
because the ambiguity matters to the decision — if the process will always run two passes,
the AD question is moot and you stop.

**Software parity — fractional designs**

| Task | Minitab | Excel | R / Python |
|---|---|---|---|
| Create with generators, show aliases | Create Factorial Design > Designs > choose fraction; Display Available Designs; alias table printed | Build the base 2^(k−p) columns and multiply to generate; write the defining relation by hand (it is worth doing once) | R `FrF2(8, 5, generators = c("AB","AC"))`, `aliases(fit)`; Python `pyDOE3.fracfact("a b c ab ac")` |
| Fold-over | Stat > DOE > Modify Design > Fold Design | Copy the design, multiply every column by −1, append | R `FrF2::fold.design()`; Python: negate the array and stack |

**When not to use a fractional factorial.** When k ≤ 3 (the full factorial is cheap and clear);
when you already expect specific two-factor interactions and can only afford resolution III
(you will not be able to read them); when the process is a person-facing service where every
run is a day of real customers and an 8-run resolution III screen followed by a fold-over is
more disruptive than a well-chosen 2^3.

---

## 5.7 Blocking — worked design 6 (45 min)

**Teach.** A **block** is a group of runs made under one condition of a nuisance variable —
one day, one lot, one team, one machine. Blocking removes that nuisance from the error term
instead of letting it inflate it. In a 2^k you block by confounding a high-order interaction
(usually the highest) with the block difference: runs where ABC = +1 go to one block, ABC = −1
to the other. You give up ABC, which you were not going to interpret anyway, and gain a
smaller s. Rules: randomize *within* blocks; never confound a main effect with blocks;
with replicates, each replicate splits into its own pair of blocks.

**Data (TXN, worked design 6).** Property-claims handling, run live in two adjuster teams over
two weeks. Factors: A automated triage (off / on), B adjuster template (current / new),
C second-review threshold ($2,000 / $5,000). Response: mean cycle time in working hours over
a batch of 25 claims per run. Two replicates; each replicate split into two blocks of 4 by
ABC. Blocks: 1 = Team North week 1, 2 = Team South week 1, 3 = Team North week 2,
4 = Team South week 2. Team South handles a heavier commercial mix — a known nuisance,
which is exactly why the design blocks on team.

```
Std   A   B   C   ABC    Rep 1 (block)   Rep 2 (block)
 1   −1  −1  −1   −1     29.1  (1)       29.0  (3)
 2   +1  −1  −1   +1     27.4  (2)       22.7  (4)
 3   −1  +1  −1   +1     29.2  (2)       27.6  (4)
 4   +1  +1  −1   −1     18.7  (1)       20.8  (3)
 5   −1  −1  +1   +1     36.4  (2)       32.4  (4)
 6   +1  −1  +1   −1     20.2  (1)       22.2  (3)
 7   −1  +1  +1   −1     24.6  (1)       26.0  (3)
 8   +1  +1  +1   +1     25.8  (2)       24.5  (4)

Block means (h):  1: 23.2   2: 29.7   3: 24.5   4: 26.8
```

**ANOVA with blocks**

```
Source       DF       SS       MS        F       P
Blocks        3   98.787   32.929    33.51   0.000
A triage      1  169.000  169.000   172.01   0.000
B template    1   30.802   30.802    31.35   0.001
C threshold   1    3.610    3.610     3.67   0.104
A*B           1   17.640   17.640    17.95   0.006
A*C           1    0.122    0.122     0.12   0.736
B*C           1    0.160    0.160     0.16   0.700
Error         6    5.895    0.983
Total        15  326.016
S = 0.991     Effects: A −6.50   B −2.78   C +0.95   A*B +2.10
```

**The same data analyzed as if blocks did not exist**

```
Term        Effect       F       P        (residual df = 8, S = 1.815)
A           -6.500    51.29   0.000
B           -2.775     9.35   0.016
C            0.950     1.10   0.326
A*B          2.100     5.35   0.049
A*C         -0.175     0.04   0.852
B*C          0.200     0.05   0.831
A*B*C        4.425    23.77   0.001   ← this is the team difference wearing an interaction's name
```

**Reading it.** Blocked: s = 0.99 h, and the A×B interaction is clearly established. Unblocked:
s nearly doubles to 1.82 h, A×B drops to p = 0.049, and a large "three-factor interaction"
appears at p = 0.001. It is not an interaction. It is Team South's heavier claim mix, which
the block design deliberately confounded with ABC so it could be taken out. An analyst who
did not know the design was blocked would report a triage × template × threshold interaction
that does not exist and try to explain it in a meeting. **The block structure is part of the
data; record it in the logbook and declare it in the software.**

**The sponsor sentence.** "Automated triage cuts mean claim cycle time by about 6.5 working
hours (from around 29 to 22); the new template adds about 2.8 hours of saving, and slightly
more when triage is on. Raising the second-review threshold makes no detectable difference,
so keep it at $2,000 for control. Both teams show the same effects despite different claim
mixes — the design was built to check that."

**Software parity.** Minitab: Create Factorial Design > Number of blocks (it chooses the
confounded interaction and prints it); Analyze includes Blocks automatically. Excel: add a
block indicator column (or three dummy columns for four blocks) to the regression. R
`FrF2(16, 3, blocks = 4, replications = 2)` or `lm(y ~ block + A*B*C)`; Python: add `C(block)`
to the `ols` formula.

**When not to block.** When you cannot fill a block with a balanced set of runs (an unbalanced
block confounds with main effects); when the "nuisance" is actually a factor you should be
studying (if team matters, make it factor D); or when blocks would number more than about a
third of the runs — at that point the design is a different design.

---

## 5.8 Center points and curvature — worked design 7 (45 min)

**Teach.** A two-level design fits a plane. If the true surface bends, the plane still fits the
corners and lies about the middle — and the middle is often where you want to operate.
**Center points** (runs at the coded 0 of every continuous factor) test this cheaply: if the
mean of the center points differs from the mean of the factorial points by more than noise
allows, **curvature** is present. The test is a one-degree-of-freedom F on
SS_curv = nF·nC·(ȳF − ȳC)² / (nF + nC), and the center points also give a pure-error estimate
without replicating the corners. Three to five center points is the norm. They need continuous
factors: there is no "middle" between solvent wipe and plasma.

**Data (MFG, worked design 7).** CNC turning of a bearing seat; response surface roughness
Ra (µm). Factors: A feed (0.10 / 0.20 mm per rev), B cutting speed (150 / 250 m per min).
Corners replicated twice (8 runs) plus 4 center points at 0.15 mm per rev and 200 m per min;
12 runs randomized. Requirement: Ra ≤ 1.6 µm.

```
Corners (Std, A, B: Rep 1, Rep 2)          Center points (0, 0)
 1  −1  −1:  1.83  1.84                    1.54   1.65   1.57   1.68
 2  +1  −1:  2.55  2.52
 3  −1  +1:  1.17  1.31                    ȳ(factorial) = 1.986   ȳ(center) = 1.610
 4  +1  +1:  2.34  2.33
```

```
Source        DF       SS        MS         F       P
A feed         1   1.6110   1.6110    482.96   0.000
B speed        1   0.3160   0.3160     94.74   0.000
A*B            1   0.0780   0.0780     23.39   0.002
Curvature      1   0.3775   0.3775    113.17   0.000
Pure error     7   0.0233   0.00334
Total         11   2.4058
Effects: A +0.898   B −0.397   A*B +0.197   Curvature (ȳF − ȳC) = +0.376 µm
```

**Reading it.** The plane predicts 1.99 µm at the center; the process delivers 1.61 there. The
surface bows downward in the middle by 0.38 µm — five times the pure-error standard deviation
of about 0.06 µm — so a first-order model is wrong exactly where the specification is met.
The corners say "low feed, high speed" (1.24 µm, the only corner under 1.6); the center points
say the specification may also be met near the middle at higher feed, which is faster. You do
not know the shape yet. **Curvature detected is a decision point, not a conclusion:** the
next design is second-order (5.10), typically the same corners plus axial points.

**The sponsor sentence.** "Feed is the strongest lever on roughness (about +0.9 µm from the
low to the high setting), and speed helps (−0.4 µm). The process is not straight-line between
the settings tested: the mid-point is smoother than the model expects, which means there is
probably a feed setting faster than 0.10 that still meets 1.6 µm. We need about eight more
runs to locate it before we set a standard."

**Software parity.** Minitab: Create Factorial Design > Options > Number of center points;
Analyze prints a Curvature row. Excel: compute ȳF, ȳC, SS_curv by formula and F.DIST.RT
against pure error. R `FrF2(8, 2, replications = 2, ncenter = 4)`, then compare `lm` with and
without a center indicator; Python: add a center-point indicator column to the `ols` formula.

**When not to add center points.** Categorical factors only; when the factor range is so
narrow that curvature cannot be practically important; or when the objective is a screen and
curvature will be checked later at the characterization stage anyway.

---

## 5.9 Sequential experimentation: screen → characterize → optimize (45 min)

**Teach.** Nobody runs one big experiment. The strategy that works, and that the practicum
assesses, spends runs in stages and lets each stage decide the next:

| Stage | Question | Typical design | Runs | Output |
|---|---|---|---|---|
| **Screen** | Of 5–8 candidates, which few matter? | Resolution III/IV fraction, single replicate, a few center points | 8–16 | 2–4 active factors; drop the rest |
| **Characterize** | How do the active factors behave and interact? | Full 2^k or resolution V, replicated or with center points, blocked as needed | 8–32 | Effects, interactions, curvature yes/no, operating window if no curvature |
| **Optimize** | Where is the best setting inside the window? | Steepest ascent path, then a central composite design (5.10) | 6–20 | A second-order model and a confirmed optimum |
| **Confirm** | Does the process do what the model says? | 3–10 runs at the recommended setting | 3–10 | The number that goes to the sponsor |

A rule of thumb from the DOE literature that the practicum enforces: **spend no more than
about a quarter of the run budget on the first design.** The first design is always partly
wrong — wrong factors, wrong ranges, a response that turns out to be too noisy — and the
budget has to survive that.

**Steepest ascent (or descent).** After a first-order model with no curvature, the fastest
direction of improvement is along the coefficients: move each factor in proportion to its
coefficient, step by step, running one trial per step, until the response stops improving.
Then center a new design there.

**Worked design 8 (TXN).** Accounts-payable simulator, minimizing cycle time (hours) with two
continuous factors: x₁ batch size (coded from 10–30 invoices, center 20) and x₂ approval
threshold (coded from $500–$1,500, center $1,000). A 2^2 with three center points gave
ŷ = 18.4 − 2.1·x₁ − 1.3·x₂ with no curvature (p = 0.4). Step: Δx₁ = +1 coded (10 invoices);
Δx₂ = (−1.3 / −2.1) × 1 = +0.62 coded (about $310).

```
Step   Batch size   Threshold   Cycle time (h, simulator)
 0        20         $1,000        18.6
 1        30         $1,310        16.4
 2        40         $1,620        15.8   ← minimum
 3        50         $1,930        17.4
 4        60         $2,240        20.5
 5        70         $2,550        25.1
```

The response improves for two steps and then worsens: the first-order model was right near
its center and wrong beyond it, as first-order models are. Next design: a new 2^2 with center
points at (40, $1,600), which will almost certainly show curvature — and that is when the
optimization stage begins.

**When not to use steepest ascent.** With categorical factors; when the current design already
shows curvature (go straight to a second-order design); or when a factor's path leaves the
feasible range (batches of 70 may exceed the daily volume) — clip to the constraint and say so.

---

## 5.10 Response surface methods: an introduction (30 min)

**Teach (awareness level).** A **response surface design** fits a second-order model —
squared terms as well as interactions — so it can locate a maximum, minimum or ridge. The
standard design is the **central composite design (CCD)**: the 2^k corners, center points, and
2k **axial (star) points** at coded distance ±α on each axis (α = 1.414 for k = 2, 1.682 for
k = 3, which makes the design rotatable — equal prediction precision in all directions). For
two factors that is 4 + 4 + 5 = 13 runs; for three, 8 + 6 + 6 = 20. The **Box-Behnken**
design is the alternative when the corners are infeasible (it has none).

For worked design 7, the next step is exactly this: keep the 8 corner runs and 4 center
points already run (they are the first block of a CCD), add 4 axial runs at feed 0.079 and
0.221 mm per rev and speed 129 and 271 m per min, fit the quadratic, draw the contour plot of
Ra against feed and speed, and read the operating window as the region under the 1.6 µm
contour — then pick the highest feed inside it.

**What you are expected to do at Black Belt:** recognize when a project has reached the
optimize stage, describe the CCD to a sponsor in a sentence, read a contour plot and a
software-produced optimum with its confidence interval, and bring in a Master Black Belt for
the design and analysis of the second-order model. Running RSM unaided is not in this
credential's minimally competent candidate statement, on purpose.

**Software parity.** Minitab: Stat > DOE > Response Surface > Create / Analyze Response
Surface Design, Contour Plot, Response Optimizer. Excel: regression with squared and product
columns will fit the quadratic; contour plots need the add-in. R `rsm::ccd()`, `rsm()`,
`steepest()`, `contour()`; Python `pyDOE3.ccdesign()` with `statsmodels` for the fit.

---

## 5.11 When NOT to run an experiment (30 min)

The rubric rewards restraint (A3) as much as sophistication. Run the following before the
canvas, and write the answer into the project record whichever way it goes.

- **You cannot set the factor.** Patient acuity, weather, incoming order mix. These are
  covariates, not factors; block on them or model them (Module 4), and say the conclusion is
  observational.
- **Setting a factor to its "bad" level harms someone.** You do not randomize patients to a
  slower discharge or customers to a worse script. Move the experiment to the simulator, to a
  physical sub-process (instrument reprocessing, specimen transport, label printing), or use
  the controlled-pilot route in I1 with a comparison group and a written prediction.
- **The measurement system is not ready.** A gauge R&R above 30% of study variation, or an
  attribute agreement below 90%, means the error term is mostly gauge. Fix it first (M1).
- **The process is not stable.** Special causes will masquerade as effects. Establish
  stability, or block on the time structure you can see, before you experiment.
- **The answer is already visible.** If stratifying the baseline by machine shows one machine
  produces 80% of the defects, go and look at the machine. An experiment here is a way of
  looking busy.
- **The design cannot be powered.** If the smallest effect worth acting on needs 64 runs at
  the process's noise level and you can afford 16, either reduce noise (blocking, a better
  gauge, a more precise response) or do not run. Compute this before you run, never after.
- **Randomization is refused.** An "experiment" run in the order the supervisor prefers is
  an observational study with extra steps. You can still run it — and you write in the record
  that run order was not randomized and what that confounds.
- **One factor with a known monotone effect.** Just set it and confirm.

**Data ethics in experiments.** Runs are never dropped because the result looked wrong; a run
is excluded only for a cause recorded in the logbook *at the time*, before analysis (a jam, a
wrong setting discovered on the run sheet). Levels are never changed mid-design. The run
order, the block structure and every excluded run are part of the record the reviewer sees.

---

## 5.12 The practicum apparatus and the process simulator (30 min)

Every candidate runs the immersion on one of two platforms; virtual learners receive the
physical kit by post two weeks before week 10. The full kit contents, set-up standard and
observer rubric are in `../practicum/doe-practicum.md`.

**Catapult (MFG and open-enrollment cohorts).** A desktop catapult with five settable factors:
pull-back angle, stop position, cup position, rubber-band count and projectile type. Response:
landing distance in cm, measured on a taped floor scale with the landing point marked by a
second person (an attribute-and-continuous measurement whose R&R you check first). Typical
run: under a minute, so 16-run designs with replication fit in a morning. Noise is real —
release technique varies — which is why randomization and replication are not optional.

**Paper helicopter (HC and virtual cohorts).** Templates printed on the kit's paper stocks;
factors: wing length, body length, wing width, paper weight, paper-clip count. Response:
flight time in seconds from a 2.5 m drop, timed by two stopwatches (again, check the
measurement system). Build cost is a sheet of paper, so a helicopter cohort can afford a
2^(5−1) resolution V design and fold-overs the catapult cohort cannot.

**Transactional process simulator (TXN cohorts).** A browser-based stochastic model of an
invoice, claim or application process with settable factors (batching, validation point,
routing rule, staffing pattern, template, second-review threshold) and outputs (cycle time,
first-pass yield, queue length) over a simulated week per run. Each run draws fresh random
seeds unless the facilitator freezes them for a teaching point. Worked designs 3 and 8 come
from it. The simulator's job is not realism; it is to let a services cohort feel randomization,
noise, aliasing and curvature with the same hands-on cycle a catapult gives a plant.

---

## Live labs — run of show

All labs: 2.5 h, live virtual or in person, teams of 3–4, facilitator plus producer above 12
learners. Every team has the kit or simulator access, the DOE planning canvas, the experiment
logbook, and the cohort's chosen software open.

### Lab 8 (week 8) — Design, run and analyze a 2^3 (150 min)

- **0:00–0:15 Frame and the trap.** "Today you will randomize, and you will resent it." Show
  the invoice regression from 5.1; poll: roll out the template, yes or no, gut only. Save.
- **0:15–0:45 Canvas.** Teams choose three factors and levels on their apparatus, write the
  response's operational definition, and run a 10-shot quick gauge check (two timers or two
  markers). Checkpoint: no team runs until the facilitator has seen a randomized run order in
  the logbook and a written analysis plan. Failure mode: levels too close together — ask
  "what distance do you expect between the corners?" and widen.
- **0:45–1:25 Runs.** 2^3 with two replicates, 16 runs, randomized. Facilitator floats with two
  jobs: (1) enforce the logbook — every run's actual settings and anything odd, written
  *before* the result is known; (2) stop re-runs. A team that wants to redo "a bad shot" is
  told the rule: excluded for a cause recorded before the result, or kept. The pain is the
  product.
- **1:25–2:05 Analysis.** Effects table, interaction plots, ANOVA, the three residual plots,
  and one sponsor sentence per team, in the software of the cohort. Producer checks each team's
  residuals-vs-run-order plot; any trend gets named in the debrief.
- **2:05–2:30 Debrief — protect this block.** Each team reads its sponsor sentence aloud;
  the room asks whether it contains an effect size in real units and a comparison to today.
  Re-run the opening poll after showing the randomized version of the invoice story. Name the
  transferable patterns: interaction plot before main-effect plot; hierarchy; the run-order
  plot is the honesty plot. If runs overrun, cut analysis at 2:05 and debrief on whatever
  exists — an unfinished analysis debriefs better than a skipped debrief.

### Lab 9 (week 9) — The ambiguous table (150 min)

- **0:00–0:20 Warm-up.** Teams receive the 8-run resolution III clinic table from 5.6
  *without* the alias column and must write the defining relation and alias table from the
  generators, then read the −4.5 on the E column aloud in words. Checkpoint: every team says
  "E or A×C" without prompting.
- **0:20–0:50 Design a fraction.** On the apparatus: four factors, 8 runs, D = ABC. Teams write
  the alias table before running and predict which pair of two-factor interactions they most
  fear being confounded, from physics.
- **0:50–1:30 Runs and analysis.** 8 runs randomized; effects table; half-normal plot; Lenth's
  method by hand once (it takes five minutes and the number stays with you).
- **1:30–2:00 The fold-over decision.** Each team states whether the ambiguity they found
  matters to the decision, and if so, which 8-run follow-up resolves it. Teams with time run
  it. Failure mode: a team runs the fold-over reflexively when their alias pair is both tiny —
  ask what decision changes.
- **2:00–2:30 Debrief.** Reading confounding off a table; resolution as a promise about what
  you can and cannot separate; the sequential logic. Close with the immersion logistics and
  the week-10 pre-read (5.8).

### Immersion 1 (week 10) — the DOE practicum, two days

Run against `../practicum/doe-practicum.md`; the outline here so the module hangs together.
- **Day 1 morning:** measurement system on the apparatus (gauge R&R or two-timer agreement),
  then a 5-factor screen (2^(5−2) resolution III or 2^(5−1) resolution V depending on
  platform), designed on the canvas and randomized in the logbook.
- **Day 1 afternoon:** analysis; alias reading; decide the characterization design; run it
  (full 2^k or fold-over) with center points; residuals.
- **Day 2 morning:** blocking across the two mornings (day is a block — the facilitator makes
  the room discover why); curvature test; steepest ascent path if the surface is flat, or a
  facilitator-supported CCD if it is not.
- **Day 2 afternoon:** confirmation runs at the recommended setting with a **written
  prediction and interval before the runs**; 10-minute presentation per candidate to the
  observer: canvas, design and why, effects with plots, residuals, operating window,
  prediction versus confirmation, what they would do next. Scored pass/redo on the practicum
  rubric. A redo is a second attempt at the presentation with the same data, not a failure.

### Lab 11 (week 11) — Project experiment clinic (150 min)

- **0:00–0:10 Frame.** I1's wording read aloud: design justified, analysis correct, operating
  window derived — or, for a pilot, a written prediction, a comparison, the same metric as
  baseline, and an honest reading of an unmet outcome.
- **0:10–1:40 Clinic.** Each candidate presents their project's experiment or pilot plan in
  8 minutes: the canvas, the 5.11 checklist answered, the design, the power calculation, the
  prediction. A peer reviewer and the facilitator use the eight questions: What is the
  response and how is it measured? What are the factors and why those levels? What is
  randomized, blocked, held constant? How many runs, and what effect can they detect? What is
  the analysis plan? What result changes the process? What would make you stop? What is the
  prediction, written down, before the first run?
- **1:40–2:15 Steepest ascent and curvature drill.** Teams take the worked design 7 output and
  write the next design (the axial points, run count, and what they would do with the contour
  plot). Facilitator shows the CCD and the contour, and names the Master Black Belt handoff.
- **2:15–2:30 Debrief.** Each candidate states one thing they will change in their plan
  because of a peer's question, and the date of their first run. Posted to the cohort channel;
  the coach follows up at the next 1:1.

---

## Project work this module

Keyed to [`../project/review-rubric.md`](../project/review-rubric.md).

- **★ I1 Experimental or piloted solution evidence (14 pts).** This is the module's
  deliverable. Path A, an experiment on the process: DOE planning canvas, the 5.11 checklist
  answered in writing, design with its justification (factors, levels, fraction, blocks,
  center points, run count and power), the experiment logbook with run order and every
  deviation, the effects table and ANOVA, residual plots, the operating window with its
  interval, confirmation runs, and the sponsor sentence. Path B, where a designed experiment
  is not possible (5.11): a controlled pilot with a written prediction, a comparison group or
  period, the same operational definition as baseline (never changed between before and
  after), and the result compared to the prediction — including when it fell short. Either
  path: the prediction is dated before the first run.
- **★ A2 Root cause verified** where the experiment is the verification. An effect with its
  size and interval, in the process's units, with the alternative explanations the design
  ruled out (that is what randomization and blocking bought).
- **A4 Rejected hypotheses.** Inert factors are findings. The redesigned form in worked design
  3 goes in the record.
- **M3 Data provenance.** The logbook is provenance. Excluded runs with their recorded cause.
- **I2 Solution design and risk.** An FMEA on the new operating settings before they enter the
  control plan; what happens if the temperature controller drifts to 60 °C?
- **Timing.** Design chosen by the end of week 9; first run scheduled during week 11; analysis
  in the week-12 coaching session; confirmation runs before Tollgate Improve.

---

## Coaching prompts

Three questions the Master Black Belt asks at the checkpoint:
1. "Show me the run order and the prediction you wrote before the first run. What did the
   confirmation runs say, in the same units?"
2. "Which effects in your table are aliased with what, and which of those aliases could
   change the decision?"
3. "What did you decide *not* to test, and why — and where is that written?"

---

## Vertical case datasets

Three files under `data/`, one per vertical, each matching a worked design so the analysis
can be checked against the text; each carries a planted feature the learner must find.

- **`m5-mfg-adhesive.csv`** (worked design 1). Columns: `std_order`, `run_order`, `temp_C`,
  `time_min`, `prep`, `replicate`, `strength_MPa`, `logbook_note`. Planted: one strength value
  recorded as 74 (a slipped decimal for 7.4) — visible on the residual plots long before it is
  visible in a column of 16 numbers; and a logbook note on run 11 ("press paused 4 min,
  coupon re-clamped") that the learner must decide to keep or exclude, and defend.
- **`m5-hc-clinic-screen.csv`** (worked design 4, both halves). Columns: `std_order`,
  `run_order`, `fold`, `slot_min`, `double_book`, `rooming`, `lab_timing`, `kiosk`, `seed`,
  `mean_wait_min`. Planted: two runs share the same random seed, so they are not independent
  replicates of the simulator — a provenance question (M3), not a statistics question.
- **`m5-txn-invoice-2k4.csv`** (worked design 3). Columns: `std_order`, `run_order`, `batching`,
  `validation`, `template`, `routing`, `cycle_time_h`. Planted: `run_order` equals `std_order`
  — the runs were executed in standard order, not randomized. The residuals-versus-run-order
  plot shows a mild trend; the learner must state what that confounds (the trend lines up
  with factor D) and what the honest report says.

The practicum's own datasets (helicopter and catapult reference runs, simulator exports) live
under `../practicum/data/`.

---

## Takeaways

- Observation shows what varied together; only control, randomization and replication show
  what causes what. Interactions are the reason for factorial structure.
- Read the interaction plot first, keep hierarchy, check the three residual plots, and write
  the sponsor sentence in the process's units with a comparison to today.
- A fraction buys runs with confounding; resolution says what you can separate; the alias
  table is read before the effects table. Blocks take a known nuisance out of the error and
  must be declared, or they surface as phantom interactions.
- Center points ask whether the plane is lying. Spend the run budget in stages, and the
  decision *not* to experiment is a written decision too.

---

## Cumulative check (PRAC pool; retests Modules 2 and 4)

**M5-C1.** A candidate is about to run a 2^3 factorial on bond strength. The tester's gauge
R&R from Module 2 came back at 38% of study variation and the study has not been repeated. The
best next action is:
A. Proceed — randomization spreads gauge error evenly across the factor levels · B. Switch to
a 2^(3−1) fraction to reduce runs while the gauge is investigated · C. Resolve the measurement
system first, then size the design; otherwise the error term is mostly gauge and the effects
the design can detect shrink ✅ · D. Double the replicates so the averaging removes the gauge
error
`[B · B2 · Apply · MFG · S · PRAC]` — randomization spreads gauge error but does not shrink
it; doubling replicates halves the SE of an already-inflated noise term at twice the cost,
which the power calculation in 5.2 would show is a poor trade.

**M5-C2.** A multiple regression from Module 4 on claim cycle time has R-sq 0.81. The plot of
residuals against fitted values fans out as fitted values increase. The best next step is:
A. Report the model; R-sq above 0.8 is sufficient for a tollgate · B. Transform the response
(for example a log) or use weighted regression, refit, and re-check the residuals before
reading the coefficients ✅ · C. Add more predictors until the fan disappears · D. Remove the
observations with the largest residuals and refit
`[D · B4 · Analyze · TXN · X · PRAC]` — a funnel is non-constant variance, which makes the
standard errors and intervals wrong regardless of R-sq; removing large residuals is a data
ethics stop, not a diagnostic.

---

v1.0 · 2026-09-20
