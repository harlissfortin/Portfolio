# Black Belt Exam Bank — Section E1: Factorial experiments

Part of the Black Belt certification item bank. Blueprint, minimally competent candidate
statement, tag format and form-assembly rules: [`../exam-bank.md`](../exam-bank.md). Policy:
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).
Teaching source: [`../modules/m5-design-of-experiments.md`](../modules/m5-design-of-experiments.md)
(sections 5.1–5.4, 5.11 and 5.12). Project-side requirement these items assess against:
rubric item ★ I1 in [`../project/review-rubric.md`](../project/review-rubric.md).

Section E1 draws **15 items per form** from the **53 CERT items** below. Objective **B5** —
design, run and analyze experiments. Fractional factorials, blocking, center points, sequential
strategy and response-surface awareness are Section E2.

**Reading the exhibits.** Fenced blocks are software-style outputs in the layout Module 5 uses.
Factors are coded −1 (low) and +1 (high); design tables are shown in standard order, and the
runs were executed in a randomized order recorded in the logbook unless the stem says
otherwise. An **effect** is the mean response at the high level minus the mean at the low
level; the **coefficient** is half the effect. Minitab's effects table reports both; Excel
(Data Analysis > Regression on coded columns, or the Excel stats add-in's DOE menu), R (`lm` on
±1 codes) and Python (`statsmodels` `ols`) report coefficients only. Standard errors, t and p
come from the pure-error term of the replicated design. Every quantity states its units and
basis in the stem. All outputs are illustrative and internally consistent; none is from a real
employer, and the practicum apparatus (catapult, paper helicopter, transactional process
simulator) is the one described in Module 5.12.

Correct option ✅; tag in brackets; rationale after the dash.

---

## Section E1 — DOE: factorial design and analysis, effects, interactions, residuals, operating windows (53 CERT)

**E1-1.** A practicum team runs the catapult with A pull-back angle (130° / 170°), B rubber bands (1 / 2) and C projectile (foam / rubber ball). Response: landing distance in cm, read off a floor tape at the mark made by a second team member (two-marker agreement checked first). 2^3, two replicates, 16 runs randomized within one morning.

```
Factorial fit: Distance (cm) versus A, B, C — 2^3 full factorial, 2 replicates, N = 16
Term          Effect     Coef  SE Coef       T       P
Constant             216.750    2.273   95.38   0.000
A angle       83.250   41.625    2.273   18.32   0.000
B bands       51.500   25.750    2.273   11.33   0.000
C ball        11.000    5.500    2.273    2.42   0.042
A*B           22.750   11.375    2.273    5.01   0.001
A*C            3.750    1.875    2.273    0.83   0.433
B*C           -1.000   -0.500    2.273   -0.22   0.831
A*B*C         -4.750   -2.375    2.273   -1.05   0.327
S = 9.09   R-Sq = 98.4%   R-Sq(adj) = 97.0%   residual df = 8
```

Which sentence do you give the practicum observer, who scores against the rubric's requirement for effect sizes in real units?
A. "Angle adds about 42 cm, bands about 26 cm and the rubber ball about 5.5 cm; the interaction adds 11 cm." · B. "Angle is the dominant lever — about 83 cm more from 130° to 170°, averaged over the other settings — and a second band adds about 52 cm; the two reinforce each other, so with two bands the angle change is worth about 106 cm rather than 61. Ball type adds about 11 cm. Shot-to-shot noise is about 9 cm." ✅ · C. "Angle, bands, ball and the angle × bands interaction are significant at α = 0.05; the other three terms are not." · D. "Because R-Sq is 98%, the model predicts any setting to within about 2% of the true distance."
`[E1 · B5 · Analyze · MFG · X · CERT]` — Effects in cm with the interaction read as two conditional effects and the noise stated; C is true but is a list of p-values, which tells the observer nothing about what to set. A reads the coefficients as effects.

**E1-2.** Cell means of catapult landing distance (cm) by pull-back angle and rubber-band count, averaged over projectile, from a replicated 2^3 with S = 9 cm.

| | 1 band | 2 bands |
|---|---|---|
| 130° | 160.8 | 189.5 |
| 170° | 221.3 | 295.5 |

Which description of the interaction plot is correct?
A. The two lines are parallel: a second band adds about 29 cm at either angle · B. The lines cross: a second band helps at 130° and hurts at 170° · C. The gap between 106 and 61 cm is inside the run-to-run noise, so the interaction is an artefact of the replicate count · D. Both lines rise from 130° to 170° and the two-band line rises more steeply — angle is worth about 61 cm with one band and about 106 cm with two — so the factors reinforce rather than cancel, and the best corner is 170° with two bands ✅
`[E1 · B5 · Analyze · MFG · X · CERT]` — Diverging lines are a same-sign interaction; C is wrong because a 45 cm difference between the two conditional effects is five times the noise, not inside it.

**E1-3.** A Black Belt fits a replicated 2^2 in R with `lm(y ~ A*B)` on ±1 codes and reads the coefficient for A as 4.2. The same data analyzed in Minitab's factorial tool would show, for A:
A. Effect = 8.4 and Coef = 4.2 ✅ · B. Effect = 4.2 and Coef = 2.1 · C. Effect = 4.2 and Coef = 4.2 · D. Effect = 2.1 and Coef = 4.2
`[E1 · B5 · Understand · NEU · K · CERT]` — A regression coefficient is the change per coded unit, and low to high is two coded units; B halves in the wrong direction, treating the regression coefficient as if it were already the effect.

**E1-4.** A helicopter team plans a 2^3 with two replicates. To save build time they propose making one helicopter per corner and dropping it twice in a row, recording both flight times, in a single random order of the eight corners. The facilitator's correct call:
A. Accept it: sixteen measurements are sixteen runs · B. Accept it if the two drops are averaged before analysis · C. That is eight runs with a repeat each — the second drop repeats the measurement, not the build or the set-up, so the error term will reflect timing noise only and every standard error will be too small; build a second helicopter per corner and run all sixteen in a fresh random order ✅ · D. Drop each helicopter four times instead of twice so the averages are more stable
`[E1 · B5 · Apply · HC · S · CERT]` — A replicate is the whole design run again; a repeat estimates measurement noise, not process noise, and D makes the same mistake with more effort.

**E1-5.** A helicopter cohort runs A wing length (7 / 10 cm), B body length (5 / 8 cm), C paper clips (1 / 2). Response: flight time in seconds from a 2.5 m drop, mean of two stopwatches (agreement checked). 2^3, two replicates, 16 runs randomized.

```
Factorial fit: Flight time (s) versus A, B, C — 2^3 full factorial, 2 replicates, N = 16
Term          Effect     Coef  SE Coef       T       P
Constant               2.335    0.017  140.01   0.000
A wing         0.567    0.284    0.017   17.01   0.000
B body        -0.110   -0.055    0.017   -3.30   0.011
C clips       -0.488   -0.244    0.017  -14.62   0.000
A*B            0.053    0.026    0.017    1.57   0.154
A*C           -0.270   -0.135    0.017   -8.09   0.000
B*C            0.033    0.016    0.017    0.97   0.358
A*B*C         -0.035   -0.018    0.017   -1.05   0.325
S = 0.067   R-Sq = 98.6%   R-Sq(adj) = 97.5%   residual df = 8

Cell means (s), A × C:  7 cm/1 clip 2.16   7 cm/2 clips 1.94   10 cm/1 clip 3.00   10 cm/2 clips 2.24
```

What does the A×C effect of −0.27 s mean for the design of the longest-flying helicopter?
A. Long wings and one clip are each good, and the negative sign shows the combination is better still than the two main effects add up to · B. Wing length reduces flight time when a second clip is present, so the clip count decides which wing to use · C. The second clip costs about 0.22 s with short wings but about 0.76 s with long wings — the clip penalty is largest exactly where the wing gain is largest — so the recommendation is long wings with one clip (about 3.0 s), and the two settings must be stated together ✅ · D. The interaction is small relative to A and C, so the factors can be treated as additive
`[E1 · B5 · Analyze · HC · X · CERT]` — The interaction is half the difference between the two conditional clip effects (−0.76 and −0.22); A has the sign story backwards, since a negative A×C means the high-high corner falls short of what the main effects would add.

**E1-6.** The Pareto chart of standardized effects for the helicopter model in E1-5, with the analysis plan's stated rule "terms past the α = 0.05 reference line enter the model, with hierarchy".

```
Pareto Chart of the Standardized Effects (response Flight time, α = 0.05)
Term      |t|
A        17.01  ████████████████████████████████████
C        14.62  ██████████████████████████████
A*C       8.09  █████████████████
B         3.30  ███████
A*B       1.57  ███
A*B*C     1.05  ██
B*C       0.97  ██
Reference line at 2.306
```

Which reduced model does the candidate fit next?
A. A, B, C and A×C — the four terms past the line, with B kept as a detected main effect in its own right — and A×B, B×C and A×B×C pooled into error ✅ · B. A, C and A×C only: B's effect of 0.11 s is too small to be worth a term · C. All seven terms: dropping any term changes the estimates of the others · D. A and C only: interactions are removed before main effects in a reduced model
`[E1 · B5 · Analyze · HC · X · CERT]` — The reference line is t(0.025, 8) and B clears it; C is wrong because in a balanced 2^k the columns are orthogonal, so dropping a term leaves the other effects unchanged and only moves its sum of squares into error.

**E1-7.** A contact centre wants to test two call-script variants and two hold-message settings in a 2^2 with 200 live calls per cell, customers randomized to cells. One script variant is expected to lengthen calls and lower first-contact resolution; the sponsor wants it in the design "so we have the full picture". The Black Belt's correct call:
A. Run it: randomization makes the exposure fair to every customer · B. Run it with 50 calls per cell to limit the number of customers exposed · C. Refuse: transactional services cannot be experimented on · D. Do not assign real customers to a setting expected to serve them worse; run the 2^2 in the process simulator to size the effects, then take the promising setting to a controlled pilot with a comparison group and a written prediction ✅
`[E1 · B5 · Evaluate · TXN · S · CERT]` — Setting a factor to its harmful level on real customers is the module's first reason not to experiment, and the simulator-then-pilot route is what I1 accepts; B reduces the harm without removing it.

**E1-8.** In the accounts-payable process simulator, A batching (single-piece / batches of 10) and B validation point (at approval / at entry). Response: mean invoice cycle time in working hours over one simulated week; fresh random seeds per run. 2^2, three replicates, 12 runs randomized.

```
Factorial fit: Cycle time (working h) versus A, B — 2^2 full factorial, 3 replicates, N = 12
Term          Effect     Coef  SE Coef       T       P
Constant              27.842    0.215  129.27   0.000
A batching     6.050    3.025    0.215   14.04   0.000
B validation  -5.350   -2.675    0.215  -12.42   0.000
A*B            2.417    1.208    0.215    5.61   0.001
S = 0.746   R-Sq = 98.0%   R-Sq(adj) = 97.2%   residual df = 8

Cell means (h):  single/approval 28.7   batch/approval 32.3   single/entry 20.9   batch/entry 29.4
```

Which reading of the interaction is correct?
A. Batching costs about 6 h wherever validation sits, and validation at entry saves about 5 h wherever batching sits · B. Batching costs about 3.6 h when validation is at approval but about 8.5 h when validation is at entry — moving validation to entry pays most when batching also stops, so the two changes belong together in the recommendation ✅ · C. Validation at entry saves 5.35 h at either batching level; only the batching effect is conditional · D. The +2.4 h interaction means that batching and validation at entry together add 2.4 h to cycle time
`[E1 · B5 · Analyze · TXN · X · CERT]` — Both conditional effects come straight from the cell means; A is the additive reading, which a 2.4 h interaction at 0.2 h standard error rules out.

**E1-9.** For the simulator design in E1-8 the requirement is a mean cycle time of at most 24 working hours. The 95% confidence interval on each cell mean has half-width t(0.025, 8) × s × √(4/12) = 2.306 × 0.746 × 0.577 = 0.99 h.

| Setting | Predicted mean (h) | 95% CI on the mean |
|---|---|---|
| single-piece / at approval | 28.7 | 27.7 – 29.7 |
| batches of 10 / at approval (today) | 32.3 | 31.3 – 33.3 |
| single-piece / at entry | 20.9 | 19.9 – 21.9 |
| batches of 10 / at entry | 29.4 | 28.4 – 30.4 |

The operating window and the next step:
A. Only single-piece flow with validation at entry meets the requirement, with about 2 h of margin at the upper confidence bound; the next step is confirmation runs at that setting with the prediction (about 21 h, plausibly 20 to 22) written down before they start ✅ · B. Validation at entry alone meets the requirement, because its −5.4 h main effect takes today's 32.3 h to about 27 h · C. Two settings meet it — single-piece/at entry and single-piece/at approval — because 28.7 h is within one main effect of 24 h · D. No window can be stated until a prediction interval for individual invoices has been computed
`[E1 · B5 · Apply · TXN · X · CERT]` — The window is the set of settings whose upper bound clears the requirement, and only one does; B applies a main effect to a corner where the interaction says the effect is smaller, and the arithmetic in B is wrong even on its own terms (32.3 − 5.4 = 26.9, still over 24).

**E1-10.** A candidate builds the 2^3 matrix for the helicopter design by hand in standard (Yates) order and checks run 6 against the logbook. Run 6 is:
A. A low, B high, C high · B. A high, B high, C low · C. A high, B low, C low · D. A high, B low, C high ✅
`[E1 · B5 · Understand · NEU · K · CERT]` — A alternates every run, B every two, C every four, so run 6 is (+, −, +); B is run 4.

**E1-11.** On an adhesive press, cure temperature takes 40 minutes to change. The operator proposes running all eight 120 °C runs of a replicated 2^3 first, then all eight 160 °C runs, randomizing the other factors within each half. The Black Belt's correct response:
A. Accept it: randomization within each half is enough · B. Reject the experiment: without full randomization nothing can be learned from it · C. Recognize that temperature is then confounded with time — any press drift or adhesive-lot change over the shift lands in the temperature effect — and either fully randomize and pay the changeover cost, or run it as proposed and write in the record that the temperature effect is confounded with run order, with the residuals-versus-run-order plot shown ✅ · D. Run it as proposed and analyze it as a standard 2^3, since the software cannot tell the two orders apart
`[E1 · B5 · Apply · MFG · S · CERT]` — Restricted randomization is a recorded compromise with a named cost, not a hidden one; D is the compromise without the record, which is the failure the module calls "an observational study with extra steps".

**E1-12.** Before the catapult experiment, a team sizes it. Shot-to-shot standard deviation from the Lab 8 pilot shots is 9 cm; the smallest distance change worth acting on is 10 cm (the target zone on the floor tape is ±5 cm).

```
Power and Sample Size — 2-Level Factorial Design
α = 0.05   Assumed standard deviation = 9 (cm)
Factors: 3   Base design: 3, 8   Blocks: none   Center points: 0
Including terms of order up to 3 in the model
Effect   Reps   Total Runs   Power
  15.0     2         16      0.8304
  10.0     2         16      0.4977
  10.0     4         32      0.8542
```

The correct reading before running:
A. Sixteen runs will find any effect of 10 cm or more, because the 15 cm row shows power above 0.8 · B. With two replicates the design has about a coin-flip chance of detecting a 10 cm effect; if 10 cm is the smallest effect that matters, run four replicates (32 runs) or reduce the shot-to-shot noise first — and decide now, not after the runs ✅ · C. Power 0.83 means about 83% of a 15 cm effect will show up in the estimate · D. The 10 cm effect is unimportant, so 16 runs are enough
`[E1 · B5 · Analyze · MFG · X · CERT]` — Power is the chance of detecting an effect of the stated size, and the row that matters is the one at the smallest effect worth acting on; A reads the wrong row.

**E1-13.** An emergency department wants to know whether triage acuity affects door-to-doctor time and proposes a 2^2 with "acuity (level 2 / level 4)" and "fast-track open (yes / no)". The Black Belt's correct call:
A. Acuity is not a factor you can set — patients arrive with it — so treat it as a covariate (block on it or model it) and experiment only on fast-track, which the department controls; say in the record that the acuity conclusion is observational ✅ · B. Run the 2^2 as proposed: the software treats acuity like any other factor · C. Randomly assign arriving patients to acuity levels so the design is balanced · D. Drop acuity from the study entirely and run a one-factor trial on fast-track without recording acuity
`[E1 · B5 · Analyze · HC · S · CERT]` — A variable the experimenter cannot assign is a covariate, not a factor; D throws away the covariate instead of using it, so fast-track's effect would be confounded with whatever acuity mix happened to arrive.

**E1-14.** A hospital laboratory tests its pneumatic tube route with standardized quality-control blood samples (no patient samples). A carrier padding (none / foam insert), B send speed (low / high). Response: hemolysis index (instrument units) per sample. 2^2, three replicates, 12 runs randomized across one day.

```
Factorial fit: Hemolysis index versus A, B — 2^2 full factorial, 3 replicates, N = 12
Term          Effect     Coef  SE Coef       T       P
Constant              52.583    1.061   49.58   0.000
A padding    -16.833   -8.417    1.061   -7.94   0.000
B speed       13.167    6.583    1.061    6.21   0.000
A*B           -7.500   -3.750    1.061   -3.54   0.008
S = 3.67   R-Sq = 93.4%   R-Sq(adj) = 91.0%   residual df = 8

Cell means (HI):  none/low 50.7   foam/low 41.3   none/high 71.3   foam/high 47.0
```

The correct reading of the interaction:
A. Padding and speed are additive: padding saves about 17 units and high speed costs about 13 at any setting · B. The negative interaction means the foam insert stops working at high speed · C. The interaction can be ignored because its effect (−7.5) is smaller than either main effect · D. Foam padding saves about 9 units at low speed and about 24 at high speed — padding matters most where the damage is worst — and once foam is in, high speed costs only about 6 units rather than 21 ✅
`[E1 · B5 · Analyze · HC · X · CERT]` — Both conditional effects are read from the cell means, and the sign says padding protects more at high speed; B reads the sign as "stops working", which is the opposite of what the cell means show.

**E1-15.** For the tube design in E1-14, the laboratory's acceptance limit for using the route with potassium samples is a hemolysis index of at most 50 (an illustrative threshold). The 95% confidence interval on each cell mean has half-width 2.306 × 3.67 × 0.577 = 4.9. Foam inserts cost about $4 per carrier once; high speed shortens transit by about 40 s.

| Setting | Predicted mean | 95% CI on the mean |
|---|---|---|
| none / low (today) | 50.7 | 45.8 – 55.6 |
| foam / low | 41.3 | 36.4 – 46.2 |
| none / high | 71.3 | 66.4 – 76.2 |
| foam / high | 47.0 | 42.1 – 51.9 |

The recommendation:
A. Keep today's setting: a predicted 50.7 rounds to the limit and the interval includes values under 50 · B. Foam at low speed is the only setting whose upper confidence bound clears 50; foam at high speed is marginal (upper bound 51.9), so recommend foam inserts at low speed, confirm with QC samples, and treat high speed as a follow-up question if the 40 s matters clinically ✅ · C. Foam at high speed: it meets the limit on average and saves 40 s per transit · D. Neither foam setting is acceptable, because both intervals overlap today's interval
`[E1 · B5 · Evaluate · HC · X · CERT]` — The window is defined by the bound, not the point estimate, and the cheapest setting inside it is chosen; C picks a setting whose interval crosses the limit and would be defended by the mean alone.

**E1-16.** The reason the run order of a factorial experiment is randomized:
A. To make the effects table easier to read in standard order · B. To increase the degrees of freedom available for the error term · C. So that nuisance variables you did not think of — drift, warm-up, fatigue, a lot change — are spread across the factor levels instead of lined up with one of them ✅ · D. To guarantee that no two runs share the same factor setting
`[E1 · B5 · Understand · NEU · K · CERT]` — Randomization protects against unknown nuisances by breaking any alignment with the factors; B confuses randomization with replication, which is what adds error degrees of freedom.

**E1-17.** Injection moulding: shrinkage (%) of a bracket, A melt temperature (220 / 240 °C), B hold pressure (40 / 60 MPa). 2^2, two replicates, 8 runs randomized, analyzed in Excel on coded ±1 columns plus a product column.

```
SUMMARY OUTPUT  (Data Analysis > Regression; X columns coded −1/+1)
Regression Statistics
Multiple R          0.995
R Square            0.990
Adjusted R Square   0.983
Standard Error      0.0284
Observations        8

                 Coefficients  Standard Error   t Stat   P-value
Intercept            1.2000         0.0100     119.52    0.000
A (melt temp)        0.1075         0.0100      10.72    0.000
B (hold pressure)   -0.1700         0.0100     -16.94    0.000
A×B                  0.0163         0.0100       1.63    0.178
```

The effect of raising melt temperature from 220 to 240 °C on shrinkage, averaged over hold pressure, is:
A. About +0.22 percentage points of shrinkage — the coefficient is per coded unit, and low to high is two units ✅ · B. About +0.11 percentage points of shrinkage · C. About +0.34 percentage points of shrinkage · D. About +10.8% of today's shrinkage
`[E1 · B5 · Apply · MFG · X · CERT]` — Excel reports coefficients, and the effect is double; B reads the coefficient as the effect, the most common error when a factorial is analyzed as a regression.

**E1-18.** During Lab 8 a transactional team's 2^2 with three replicates in the process simulator returns identical cycle times in all three replicates of every cell; the effects table shows S = 0.000 and every p-value as 0.000. Earlier in the session the facilitator had frozen the random seeds for a teaching point. The correct call:
A. Report the effects as they stand: zero noise is a feature of the simulator · B. Report the effects and omit the p-values, since they cannot be computed sensibly · C. Drop two of the three replicates as duplicates and analyze the eight remaining runs · D. The replicates are not replicates — with frozen seeds every rerun reproduced the same simulated week — so unfreeze the seeds and rerun the replicates so that the error term measures week-to-week variation ✅
`[E1 · B5 · Analyze · TXN · S · CERT]` — Replication has to reproduce the process's noise, and a frozen seed removes it; C keeps a single replicate and still has no error estimate.

**E1-19.** A document-intake team runs a 2^3 on its scanning station: A resolution (200 / 300 dpi), B auto-classification (off / on), C batch size (25 / 50 documents). Response: mean handling time per document in seconds over a batch. Two replicates; replicate 1 was run on Monday and replicate 2 on Tuesday, each randomized within its day.

```
Factorial fit: Handling time (s) versus A, B, C — 2^3 full factorial, 2 replicates, N = 16
Term            Effect     Coef  SE Coef       T       P
Constant                29.837    0.771   38.70   0.000
A resolution    -7.550   -3.775    0.771   -4.90   0.001
B classify      -2.250   -1.125    0.771   -1.46   0.183
C batch          1.350    0.675    0.771    0.88   0.407
A*B              2.575    1.288    0.771    1.67   0.134
A*C              0.325    0.163    0.771    0.21   0.838
B*C             -0.425   -0.213    0.771   -0.28   0.790
A*B*C           -0.700   -0.350    0.771   -0.45   0.662
S = 3.08   R-Sq = 78.9%   R-Sq(adj) = 60.5%   residual df = 8
Residuals versus run order: runs 1–8 (Monday) all between −1.5 and −3.0 s;
runs 9–16 (Tuesday) all between +1.5 and +3.0 s.
```

The correct reading:
A. Auto-classification and every interaction are inert; resolution is the only factor that matters · B. Something shifted the whole process by about 4 to 5 s between Monday and Tuesday — a heavier document mix, a different operator — and that shift sits in the error term, inflating S and possibly hiding B and A×B; report the effects as provisional, name the day shift, and next time block on day so it comes out of the error ✅ · C. The Tuesday runs are outliers; drop them and analyze Monday's eight runs alone · D. The day shift is a three-factor interaction, which is what the A×B×C row is showing
`[E1 · B5 · Analyze · TXN · X · CERT]` — The run-order plot is the honesty plot: a step between days is a nuisance variable that randomization spread across levels but could not remove from S; A turns "not detected under inflated noise" into "inert".

**E1-20.** An interaction between two factors in a factorial experiment means:
A. The two factors are correlated in the design matrix · B. Both factors have large main effects · C. The effect of one factor depends on the level of the other — which is why the interaction plot is read before the main-effect plot ✅ · D. The two factors cannot be varied independently of each other
`[E1 · B5 · Understand · NEU · K · CERT]` — An interaction is a conditional effect; A describes confounding, which a balanced factorial is built to avoid.

**E1-21.** Powder-coat adhesion on brackets: A cure temperature (180 / 200 °C), B cure time (10 / 20 min), C grit blast (no / yes). Response: pull-off adhesion in MPa on a calibrated tester. 2^3, two replicates, 16 runs randomized.

```
Factorial fit: Adhesion (MPa) versus A, B, C — 2^3 full factorial, 2 replicates, N = 16
Term          Effect     Coef  SE Coef       T       P
Constant               3.208    0.011  287.79   0.000
A temp         0.907    0.454    0.011   40.71   0.000
B time         0.012    0.006    0.011    0.56   0.590
C blast        0.427    0.214    0.011   19.18   0.000
A*B           -0.590   -0.295    0.011  -26.47   0.000
A*C            0.005    0.003    0.011    0.22   0.828
B*C           -0.060   -0.030    0.011   -2.69   0.027
A*B*C          0.033    0.016    0.011    1.46   0.183
S = 0.045   R-Sq = 99.7%   R-Sq(adj) = 99.5%   residual df = 8

Cell means (MPa), A × B:  180 °C/10 min 2.45   180 °C/20 min 3.05   200 °C/10 min 3.95   200 °C/20 min 3.37
```

A reviewer writes: "Cure time has no effect (p = 0.59); drop it from the model and set it to 10 minutes to save oven time." The correct response:
A. Cure time matters a great deal — it adds about 0.6 MPa at 180 °C and removes about 0.6 MPa at 200 °C — and the main effect of 0.01 MPa is the average of two opposite effects; at 200 °C, 10 minutes is indeed the better setting, but for the interaction's reason, not because time is inert ✅ · B. The reviewer is right: a p-value of 0.59 rules time out as a factor · C. Keep time in the model only to satisfy hierarchy; it has no practical meaning for the process · D. Re-run the experiment with a wider time range so that the main effect becomes significant
`[E1 · B5 · Analyze · MFG · X · CERT]` — A near-zero main effect with a large interaction is the classic case where the interaction plot, not the main-effect p-value, carries the meaning; C keeps the term but discards the finding.

**E1-22.** Catapult logbook, replicated 2^3. Run 11: "ball struck table leg, no landing mark" written before any distance was read. Run 14: landed about 60 cm short of its replicate, logged normally at the time; during analysis a team member says "that one must have slipped". The correct handling:
A. Exclude both runs; they are obviously wrong · B. Keep both runs; nothing is ever excluded from an experiment · C. Exclude run 11 and keep run 14, and analyze the fifteen remaining runs as they are · D. Exclude run 11 — a cause recorded at the time, before the result — and re-run it at the same setting in the remaining random order; keep run 14, because "must have slipped" is a reaction to the result, not a recorded cause, and investigate it through the residual plots and report it ✅
`[E1 · B5 · Evaluate · MFG · S · CERT]` — The rule is exclusion only for a cause recorded before the result, and a missing run in a 2^k breaks the balance and is re-run; C applies the rule but leaves the design unbalanced.

**E1-23.** A helicopter team chose levels "close to the standard template": A wing length (8.0 / 8.5 cm), B body length (6.0 / 6.5 cm), C wing width (3.5 / 4.0 cm). The kit template allows wing lengths from 5 to 12 cm. The goal is a helicopter that flies at least 1 s longer than the standard 2.4 s.

```
Factorial fit: Flight time (s) versus A, B, C — 2^3 full factorial, 2 replicates, N = 16
Term          Effect     Coef  SE Coef       T       P
Constant               2.368    0.015  158.38   0.000
A wing         0.132    0.066    0.015    4.43   0.002
B body        -0.020   -0.010    0.015   -0.67   0.522
C width       -0.095   -0.047    0.015   -3.18   0.013
A*B            0.033    0.016    0.015    1.09   0.309
A*C           -0.017   -0.009    0.015   -0.59   0.574
B*C            0.075    0.038    0.015    2.51   0.036
A*B*C         -0.013   -0.006    0.015   -0.42   0.687
S = 0.060   R-Sq = 82.7%   R-Sq(adj) = 67.5%   residual df = 8
```

The best next step:
A. Add two more replicates to firm up body length and the interactions · B. The levels span about a tenth of the feasible range, so even the detected effects (0.13 s for wing, 0.10 s for width) are far too small to reach the 1 s goal; redesign with wide levels inside the feasible range (for example wing 6 / 11 cm) and run again ✅ · C. Conclude that wing length and width are the only levers and set each to its better level · D. Report the model as it stands: R-Sq is 83% and three terms are significant
`[E1 · B5 · Analyze · HC · X · CERT]` — Levels too close together produce small effects however precisely they are estimated; A spends runs sharpening estimates of effects that cannot matter at this range.

**E1-24.** A replicated 2^3 (two replicates, full model) reports residual df = 8. A candidate explains: "Eight degrees of freedom because there are eight corners." The correct explanation:
A. The candidate is right: error degrees of freedom equal the number of distinct settings · B. Eight because there are eight terms in the model including the constant · C. Sixteen runs minus the eight parameters estimated (the constant plus seven effects); the eight that remain are the pure-error comparisons between the two replicates at each corner, and with a single replicate there would be none ✅ · D. Eight because 2^3 = 8 regardless of how many replicates are run
`[E1 · B5 · Understand · NEU · K · CERT]` — Degrees of freedom are runs minus parameters, which is why replication is what makes the tests possible; D would give a saturated single replicate the same eight, which it does not have.

**E1-25.** Stratifying a claims team's baseline shows that 80% of late payments come from claims routed through one queue whose service-level timer starts late by design — a system configuration nobody has revisited since a migration. A Black Belt proposes a 2^3 on template, batching and routing rule to find the causes of lateness. The correct call:
A. Do not experiment yet: the baseline already points to a single design decision, so go and look at the timer setting, fix it, re-baseline, and only then ask whether an experiment on the remaining lateness is worth its runs ✅ · B. Run the 2^3 with the queue added as a fourth factor · C. Run the 2^3 anyway, because experimental evidence always outranks observational evidence · D. Run a one-factor trial on the timer setting with 32 runs to prove the point
`[E1 · B5 · Analyze · TXN · S · CERT]` — "The answer is already visible" is a listed reason not to experiment; D dresses an obvious fix in a run count.

**E1-26.** The fitted model for the accounts-payable simulator, in coded units with coefficients (half-effects): cycle time (h) = 27.84 + 3.03·xA − 2.68·xB + 1.21·xA·xB, where xA = +1 for batches of 10 and −1 for single-piece, and xB = +1 for validation at entry and −1 for validation at approval. The predicted mean cycle time for single-piece flow with validation at entry is:
A. 14.0 h · B. 23.3 h · C. 33.6 h · D. 20.9 h ✅
`[E1 · B5 · Apply · TXN · X · CERT]` — 27.84 − 3.03 − 2.68 + 1.21 × (−1)(+1) = 20.9; B gets the product's sign wrong, and A doubles the coefficients as if they were effects.

**E1-27.** In a helicopter cohort's measurement check, two timers disagree by about 0.3 s on flights of about 2.4 s, while the drop-to-drop standard deviation of the same helicopter is about 0.07 s. The team wants to start the 2^3. The correct call:
A. Proceed: averaging the two timers cancels the disagreement · B. Fix the measurement first — with timer disagreement four times the process noise, the error term would be mostly measurement — by standardizing the start and stop cues (release call, floor contact), re-checking agreement, and only then running ✅ · C. Add replicates so the timer disagreement averages out · D. Use only the timer who is usually faster, for consistency
`[E1 · B5 · Apply · HC · S · CERT]` — An experiment measured with a poor gauge measures the gauge; C treats a systematic measurement problem as if it were random process noise.

**E1-28.** A catapult team ran a 2^3 once (eight runs) and presents this output as evidence of "an excellent model".

```
Factorial fit: Distance (cm) versus A, B, C — 2^3 full factorial, 1 replicate, N = 8
Term        Effect     Coef
Constant           219.875
A angle     84.250   42.125
B bands     47.250   23.625
C ball      14.250    7.125
A*B         18.750    9.375
A*C         -3.250   -1.625
B*C         -6.250   -3.125
A*B*C       -2.750   -1.375
S = *   R-Sq = 100.0%   residual df = 0
* No degrees of freedom for error: the full model is saturated.
```

The observer's correct response:
A. Agree: 100% is the best fit a model can achieve · B. The high R-Sq shows that replication would have been wasted runs · C. With eight runs and eight parameters the model fits every point exactly by arithmetic, so R-Sq carries no information and no effect can be tested; run a second replicate in a fresh random order — or apply the unreplicated-design analysis of Module 5.5 with a half-normal plot and stated pooling — before claiming anything ✅ · D. Drop the constant from the model to free one degree of freedom for error
`[E1 · B5 · Analyze · MFG · X · CERT]` — A saturated model has no error term, and R-Sq = 100% is a property of the arithmetic, not of the process; D would produce a meaningless model rather than an error estimate.

**E1-29.** Model hierarchy in a factorial analysis means:
A. A model that contains the A×B interaction keeps A and B as terms even when a parent main effect is not significant, so that the interaction's meaning and the predictions in natural units stay interpretable ✅ · B. Main effects are always tested before interactions are examined · C. Higher-order interactions are always larger than the lower-order ones they contain · D. Terms are entered into the model in standard order
`[E1 · B5 · Understand · NEU · K · CERT]` — Hierarchy is a rule about which terms a model keeps, not the order of testing; B is the opposite of the module's reading rule (interaction plot first).

**E1-30.** A practicum candidate on the transactional simulator presents: "Batching p < 0.001, validation point p < 0.001, routing p = 0.002, template p = 0.71. Recommendation: set the significant factors to their better level." The observer's rubric feedback:
A. Pass: every significant factor has been identified and the recommendation follows · B. Redo the presentation: state each effect in working hours with a comparison to today, read the interaction plot before the main effects, and give the predicted cycle time at the recommended setting with its interval and confirmation plan — p-values alone do not tell a sponsor what to change or what to expect ✅ · C. Redo: the template should have been dropped from the experiment once it looked unpromising · D. Pass, but add the R-Sq value to the summary slide
`[E1 · B5 · Evaluate · TXN · S · CERT]` — The rubric requires effect sizes in engineering units, an operating window and a prediction; A accepts a list of p-values as an analysis, which is the defect the open-notes exam is built to catch.

**E1-31.** A hospital pharmacy ran a 2^2 on IV compounding using training batches (standardized order sets, no patient orders): A hood pre-staging (no / yes), B label printing (in batches / at order). Response: compounding time per batch in minutes. Three replicates, 12 runs randomized.

```
Factorial fit: Compounding time (min) versus A, B — 2^2 full factorial, 3 replicates, N = 12
Term            Effect     Coef  SE Coef       T       P
Constant                13.800    0.122  112.94   0.000
A pre-staging   -5.267   -2.633    0.122  -21.55   0.000
B labels        -1.700   -0.850    0.122   -6.96   0.000
A*B             -0.167   -0.083    0.122   -0.68   0.514
S = 0.423   R-Sq = 98.5%   residual df = 8
Predicted mean at pre-staging yes / labels at order: 10.2 min (95% CI 9.7 – 10.8); today's setting 17.2 min

Confirmation — five live shifts at the recommended setting, real order mix (min per batch):
13.9   14.2   13.1   14.6   13.7      mean 13.9
```

The correct conclusion:
A. The confirmation succeeded: 13.9 min is well below today's 17.2 · B. The experiment was wrong and should be discarded · C. Adjust the model's constant to match 13.9 and proceed to the control plan · D. The confirmation failed the prediction (13.9 against 9.7 – 10.8): something in the live process — order-mix complexity, interruptions — is not in the training-batch experiment; do not put the setting in the control plan yet, report the gap honestly, and run a controlled pilot on live orders with a written prediction ✅
`[E1 · B5 · Analyze · HC · X · CERT]` — Confirmation compares to the prediction, not to today, and a miss of three minutes against a half-minute interval is a finding about what the experiment left out; A is the honest-sounding version of ignoring the prediction.

**E1-32.** An adhesive team's Module 2 study of the lap-shear tester gave a gauge R&R of 38% of study variation. The team wants to run its 2^3 this week, with the power calculation based on the process standard deviation from last month's parts. The correct call:
A. Fix the measurement system first — at 38% the error term will be largely gauge, and the power calculation that assumed process noise is wrong — then repeat the R&R and run the experiment ✅ · B. Run it now: replication averages gauge error out of the effects · C. Run it now with four replicates instead of two · D. Run it now and subtract the gauge variance from S afterwards
`[E1 · B5 · Analyze · MFG · S · CERT]` — Measurement readiness is a listed precondition for experimenting; B is right that replication reduces the standard error, but the design was sized for the wrong noise and a 38% gauge can still hide effects the power calculation promised to find.

**E1-33.** A paint line runs a 2^3 with two replicates on primer, flash time and booth humidity. Response: defects per panel, a count from 0 to about 30.

```
Factorial fit: Defects per panel versus A, B, C — 2^3, 2 replicates, N = 16
S = 4.1   R-Sq = 91.2%   residual df = 8
Residuals versus fitted values: spread about ±1 at fitted values of 1–3 defects,
about ±8 at fitted values of 15–25 (a funnel opening to the right).
Normal probability plot of residuals: S-shaped, both tails off the line.
Residuals versus run order: no pattern.
```

The correct action:
A. Accept the model: R-Sq is 91% and the run-order plot is clean · B. Remove the high-defect runs so that the residual spread is even · C. The response is a count whose spread grows with its mean, so the constant-variance assumption behind the t and p values fails; re-analyze on a square-root or log transform of the count (or a rate with enough events per run), check the plots again, and only then read any p-value ✅ · D. Add a fourth factor to explain the extra spread at high defect counts
`[E1 · B5 · Analyze · MFG · X · CERT]` — A funnel with a count response is the case the module lists under "when not to fit the standard factorial model"; B deletes the data that reveal the problem.

**E1-34.** An operating window, as the course uses the term, is:
A. The range of factor levels used in the design · B. The region of factor settings where the fitted model predicts the requirement is met with a stated margin — an upper or lower confidence or prediction bound, depending on whether the requirement is on the mean or on individual results — followed by confirmation runs before the setting enters the control plan ✅ · C. The control limits of the response after the change is made · D. The set of settings at which the response was actually measured
`[E1 · B5 · Understand · NEU · K · CERT]` — The window is a model-based region with its uncertainty stated and then confirmed; A confuses the factor space explored with the region that meets the requirement.

**E1-35.** A transactional team chooses levels for batch size in the process simulator. The real process handles batches of 10 to 40 invoices today; the system's hard cap is 60. Week-to-week noise in cycle time is about 1 h. Which pair of levels is best?
A. 10 and 12, to stay close to today's practice · B. 10 and 200, to make the effect as large as possible · C. 20 and 25, the two most common batch sizes · D. 10 and 40 — wide enough apart to move the response well beyond the noise, and both inside the range the process could actually run ✅
`[E1 · B5 · Apply · TXN · S · CERT]` — Levels wide enough to move the response but inside the feasible range; B models a process nobody will operate, and A and C bury the effect in noise.

**E1-36.** The grouped ANOVA for the helicopter model in E1-5.

```
Analysis of Variance for Flight time (s)
Source              DF       SS       MS        F       P
Main effects         3   2.2866   0.7622   171.33   0.000
2-way interactions   3   0.3072   0.1024    22.99   0.000
3-way interaction    1   0.0049   0.0049     1.10   0.325
Residual error       8   0.0356   0.0044
  Pure error         8   0.0356   0.0044
Total               15   2.6343
```

A candidate writes: "All three main effects and all three two-way interactions are significant (both p < 0.001)." The correct response:
A. The grouped rows test each group as a whole; a significant "2-way interactions" row can be carried by one interaction (here A×C) with the other two inert — name which terms matter from the term-by-term effects table, not from the grouped ANOVA ✅ · B. The candidate is right: an F-value for a group applies to every term in it · C. The candidate is wrong because interactions do not occur in a paper helicopter · D. The 3-way row is the one to interpret first, because it is the highest-order term
`[E1 · B5 · Analyze · HC · X · CERT]` — Grouped and term-level tables carry the same sums of squares partitioned differently, and only the term table says which interaction; B reads a group test as a set of individual tests.

**E1-37.** In a replicated 2^3 on an adhesive press, the press tripped on run 9 (standard order 3, replicate 2) and the coupon was lost; fifteen results remain and the analysis is due tomorrow. The correct handling:
A. Analyze the fifteen runs as a 2^3 with two replicates; the software will cope · B. Copy the replicate 1 value for standard order 3 into the gap so the design is complete · C. Re-run the lost coupon at the same setting as a sixteenth run, logging the reason; if a re-run is impossible, analyze the unbalanced fifteen runs as a regression with the missing cell declared (the effects are then correlated and the standard errors differ) — never silently average around the gap ✅ · D. Drop the other replicate of standard order 3 as well so that the design is balanced again
`[E1 · B5 · Analyze · MFG · S · CERT]` — A missing run breaks the balance that makes effects independent, and the module's rule is a documented re-run or a declared imputation; D throws away a good run to hide the problem.

**E1-38.** The residuals-versus-run-order plot is kept in every factorial analysis because:
A. The software produces it by default in the four-in-one layout · B. It shows whether the factor levels were entered in the right columns · C. It tests whether the residuals follow a normal distribution · D. It is the plot that reveals a nuisance variable moving during the experiment — drift, warm-up, a lot change — which randomization spread across the factor levels but which still inflates the error term, and it tells you what to block on next time ✅
`[E1 · B5 · Understand · NEU · K · CERT]` — The plot is the reason the run order is recorded; C is the job of the normal probability plot.

**E1-39.** A sterile processing department wants to run a 2^2 on washer temperature and detergent dose next week. Last month's cycle-time chart shows three special-cause signals: a broken dosing pump (replaced last week), a water-temperature excursion (traced to the plant), and an unexplained shift that lasted four days. The Black Belt's correct call:
A. Run it: randomization takes care of instability · B. Establish stability first — the pump is new and the four-day shift is not understood, and special causes during the runs will masquerade as effects; if the experiment must run next week, block on day and record every signal in the logbook so that runs affected by a recorded cause can be treated as such ✅ · C. Run it with more replicates so the special causes are swamped by the extra runs · D. Postpone it indefinitely: an unstable process cannot be experimented on
`[E1 · B5 · Evaluate · HC · S · CERT]` — Stability is a listed precondition and the fallback is to block on the time structure you can see; D refuses without offering the design that manages the risk.

**E1-40.** For the accounts-payable simulator design in E1-8, the sponsor changes the requirement to "no individual week above 24 working hours". With s = 0.746 h, the 95% prediction interval for one new week has half-width 2.306 × 0.746 × √(1 + 4/12) = 1.99 h.

| Setting | Predicted mean (h) | 95% PI for one week |
|---|---|---|
| single-piece / at entry | 20.9 | 18.9 – 22.9 |
| single-piece / at approval | 28.7 | 26.7 – 30.7 |
| batches of 10 / at entry | 29.4 | 27.4 – 31.4 |

The correct statement:
A. The confidence interval on the mean (19.9 – 21.9 h) is the right bound, because the requirement is stated as a weekly figure · B. No setting can meet a requirement stated for individual weeks · C. Single-piece with validation at entry meets the requirement for individual weeks with about 1 h of margin at the upper prediction bound; the prediction interval, not the confidence interval on the mean, is the right basis when the requirement applies to each week ✅ · D. The prediction interval is unnecessary because R-Sq is 98%
`[E1 · B5 · Apply · TXN · X · CERT]` — A requirement on individuals is sized from the prediction interval; A uses the narrower interval for the mean and overstates the margin by a factor of two.

**E1-41.** An engineer proposes to study cure temperature, cure time and surface preparation one factor at a time: vary temperature with the others fixed (4 runs), then time (4 runs), then preparation (4 runs) — 12 runs. The Black Belt's correct response:
A. Replace it with a 2^3 — 8 runs, or 16 with replication — because every run informs every effect, so each main effect is estimated from all the runs rather than four, and the interactions, which one-factor-at-a-time cannot see, come at no extra cost ✅ · B. Accept the plan: it uses fewer runs than a replicated factorial · C. Accept the plan, provided the twelve runs are randomized · D. Run both designs and compare their answers
`[E1 · B5 · Apply · MFG · S · CERT]` — Factorial structure is what buys interactions and precision per run; C fixes the run order but not the design's blindness to interactions.

**E1-42.** Residual plots from a helicopter cohort's replicated 2^3, with the logbook and data file for the run in question.

```
Residual plots — Flight time (s), 2^3, 2 replicates, N = 16
Normal probability plot: 15 residuals on a straight line between −0.10 and +0.10 s;
one residual at +0.92 s (run 7, standard order 6, replicate 2).
Residuals versus fitted: the same point stands alone; all other spread within ±0.10 s.
S = 0.25 s

Logbook, run 7 (written at the drop): "2.28 s — timer 1 2.27, timer 2 2.29"
Data file, run 7: 3.28
```

The correct action:
A. Delete run 7 as an outlier and re-fit · B. Keep 3.28: the data file is the record of the experiment · C. Add a third replicate so the point carries less weight · D. Correct the data file to 2.28 — the logbook written at the time shows a transcription error, which is a recorded cause, not an inconvenient result — re-run the analysis, and note the correction in the record ✅
`[E1 · B5 · Analyze · HC · X · CERT]` — The residual plots found a data-entry error before anyone read the column, which is what they are for; A removes a real, correctly recorded flight instead of fixing the typo.

**E1-43.** In natural units, a fitted adhesive model gives 0.087 MPa per °C of cure temperature and 0.031 MPa per minute of cure time. An engineer concludes that temperature is "almost three times as important" as time. The correct response:
A. Agree: the temperature slope is larger · B. Slopes in natural units are not comparable because their units differ; compare the effects in coded units — each factor's change from its low to its high level as tested, which is what the effects table reports — and recognize that this comparison depends on the ranges chosen ✅ · C. Time is more important, because a minute costs less than a degree · D. Neither can be compared until both are converted to percentages of the mean
`[E1 · B5 · Understand · NEU · K · CERT]` — Comparing MPa per °C with MPa per minute compares units, not importance; D proposes a conversion that still ignores the ranges tested.

**E1-44.** A transactional team sizes a 2^3 in the process simulator: the smallest cycle-time effect worth acting on is 1 h, the week-to-week standard deviation of a one-week run is about 4 h, and the software says 64 runs are needed for power 0.8. The lab budget is 16 runs. The correct call:
A. Run the 16 runs and see what turns up · B. Run the 16 runs at α = 0.20 so that more effects clear the line · C. Either reduce the noise — a longer simulated horizon per run (a four-week window roughly halves s), a less noisy response (a mean rather than a maximum), blocking — or do not run; decide before running, and never by adding runs until a p-value drops ✅ · D. Report that the simulator is unsuitable for experiments
`[E1 · B5 · Analyze · TXN · S · CERT]` — "The design cannot be powered" has two honest exits, less noise or no experiment; B buys power by raising the false-alarm rate, which is not the same thing.

**E1-45.** From a replicated catapult 2^3 (S = 9.09 cm, residual df = 8), the projectile term:

```
Term        Effect     Coef  SE Coef      T      P
C ball      11.000    5.500    2.273   2.42  0.042
95% CI for the C effect: 0.5 to 21.5 cm
```

The rubber ball costs more than the standard foam ball. The team's analysis plan set the smallest distance change worth acting on at 25 cm. The candidate's correct decision:
A. Specify the rubber ball: the effect is significant at α = 0.05 · B. Drop C from the model, because its p-value is close to 0.05 · C. Re-run the experiment with more replicates to settle the ball question · D. Report ball type as a detected but small effect — about 11 cm, plausibly 1 to 21 cm, below the 25 cm action threshold — keep the standard ball, and note the rubber ball as a reserve lever ✅
`[E1 · B5 · Evaluate · MFG · X · CERT]` — Statistical detection and practical importance are separate questions and the plan fixed the threshold in advance; A acts on a p-value against the team's own written decision rule.

**E1-46.** A pharmacy proposes a 2^3 on order-verification workflow that includes "second technician on shift (no / yes)" as a factor. Everyone, including the sponsor, agrees the second technician reduces waiting and that the effect is monotone; the open questions are two workflow factors. The Black Belt's correct call:
A. Take staffing out of the experiment — a factor with a known monotone effect is set, not tested — hold it constant at the level the department will actually run, and spend the runs on the uncertain workflow factors; confirm the staffing number once, separately, if the business case needs it ✅ · B. Keep staffing in: an eight-run design needs three factors · C. Keep staffing in so the sponsor sees at least one large effect · D. Run staffing alone as a one-factor experiment with 16 runs before the workflow study
`[E1 · B5 · Apply · HC · S · CERT]` — "One factor with a known monotone effect: set it and confirm" is on the module's list of reasons not to experiment; B fills a design slot for its own sake.

**E1-47.** ANOVA of effects for the accounts-payable simulator 2^2 (three replicates, N = 12).

```
Analysis of Variance for Cycle time (working h)
Source          DF       SS       MS        F       P
A batching       1  109.808  109.808   197.26   0.000
B validation     1   85.867   85.867   154.25   0.000
A*B              1   17.521   17.521    31.47   0.001
Residual error   8    4.453    0.557
Total           11  217.649
```

A candidate writes: "Batching accounts for 109.8 hours of cycle time." The correct reading:
A. Correct: the sum of squares is in hours, the same units as the response · B. Batching accounts for about half of the variation in cycle time across the twelve runs (109.8 / 217.6 ≈ 50%); the size of its effect is a separate number — 6.05 h, which is 2 × √(SS/N) = 2 × √(109.8/12) — and that is the figure a sponsor needs ✅ · C. Batching accounts for 109.8 h², so its effect is √109.8 ≈ 10.5 h · D. The F-value of 197 is the batching effect in hours
`[E1 · B5 · Apply · TXN · X · CERT]` — A sum of squares is a share of variation, and the effect comes from it only through N; C takes the square root without the design's scaling and reports an effect the cell means contradict.

**E1-48.** During an adhesive 2^3 the oven could not hold 160 °C for the last four high-temperature runs (a heater fault); it held 150 °C, and the operator logged the actual temperature for each run. The correct handling:
A. Analyze as designed: 150 °C is close enough to 160 °C · B. Relabel the four runs as 160 °C in the data file, since that was the intended setting · C. Repair the oven and re-run the four runs at 160 °C in a fresh random order if coupons can be spared; if not, analyze with the actual temperatures as a regression in natural units, state that the temperature effect is estimated over a narrower and uneven range, and record the fault — never relabel a setting ✅ · D. Drop the four runs and analyze the remaining twelve as a 2^3
`[E1 · B5 · Evaluate · MFG · S · CERT]` — Levels are never changed on paper; the record shows what was run and the analysis uses it. D discards half the high-temperature information and leaves an unbalanced design anyway.

**E1-49.** Replication in a 2^k experiment buys:
A. A more accurate measurement of each individual run · B. Protection against the need to randomize the run order · C. The ability to use wider factor ranges · D. An estimate of pure error — run-to-run variation at the same setting — which gives the t and F tests their denominator and degrees of freedom; a full model fitted to a single replicate has none ✅
`[E1 · B5 · Understand · NEU · K · CERT]` — Replication supplies the noise estimate every test compares effects against; A describes a repeat, not a replicate.

**E1-50.** A helicopter cohort's paper arrived in two reams. To keep the builds organized, a team proposes cutting all long-wing helicopters from ream 1 and all short-wing helicopters from ream 2. The correct call:
A. Accept it: paper of the same stated weight is interchangeable · B. Ream is then confounded with wing length — any difference in weight or stiffness between reams lands in the wing-length effect — so cut each corner's helicopters from both reams (ream balanced across levels) or use one ream for all builds, and record which ream each helicopter came from ✅ · C. Add ream as a fourth factor assigned at random · D. Weigh the two reams and adjust the flight times by the difference
`[E1 · B5 · Analyze · HC · S · CERT]` — A nuisance variable lined up with a factor is exactly what the design must prevent; C spends design capacity on a nuisance that should be balanced or held constant.

**E1-51.** A claims team's replicated 2^2 on first-pass yield (% of claims passing quality review without rework, per batch of 50).

```
Factorial fit: First-pass yield (%) versus A, B — 2^2 full factorial, 3 replicates, N = 12
Term            Effect     Coef  SE Coef       T       P     95% CI for effect
Constant                 81.40     0.78  104.3   0.000
A checklist       6.80     3.40     0.78    4.36  0.002     (3.2, 10.4)
B pre-fill        3.20     1.60     0.78    2.05  0.075     (−0.4, 6.8)
A*B              -0.60    -0.30     0.78   -0.38  0.711     (−4.2, 3.0)
S = 2.70   residual df = 8
```

What do you say about pre-fill?
A. "Pre-fill's effect is not established at this sample size: the estimate is about 3 points, plausibly anywhere from slightly negative to nearly 7 — worth a follow-up if 3 points matter to the business case, not a reason to drop it." ✅ · B. "Pre-fill has no effect (p = 0.075)." · C. "Pre-fill adds 3.2 points of yield; roll it out with the checklist." · D. "Pre-fill's effect is 1.6 points, half the checklist's."
`[E1 · B5 · Analyze · TXN · X · CERT]` — The interval, not the p-value, is the honest statement about an effect near the line; B turns "not detected" into "none", and D reads the coefficient as the effect.

**E1-52.** A team plans a 2^3 with two replicates on a press, draws one random order for the eight runs, and uses the same order again for the second replicate "for consistency". The correct call:
A. Accept it: the order was drawn at random · B. Accept it if the two replicates are run on different days · C. Draw a fresh random order for each replicate; repeating the order lines up any time pattern within a replicate with the same settings both times, which defeats the purpose of randomizing and can make drift look like an effect ✅ · D. Run the second replicate in standard order as a check on the first
`[E1 · B5 · Apply · MFG · S · CERT]` — A replicate is the whole design run again in a fresh random order; B adds a day difference on top of the repeated pattern without fixing it.

**E1-53.** Summary of the pneumatic tube experiment for the laboratory director (standardized QC samples; acceptance limit hemolysis index ≤ 50, illustrative).

```
Cell means (HI):  none/low 50.7 (today)   foam/low 41.3   none/high 71.3   foam/high 47.0
S = 3.67   Effects: padding −16.8   speed +13.2   padding × speed −7.5   (all p ≤ 0.008)
95% CI half-width on a cell mean: 4.9
```

The sentence for the director:
A. "Padding is significant at p < 0.001 and speed at p < 0.001, with a significant interaction at p = 0.008." · B. "Foam inserts cut the hemolysis index by about 17 units on average." · C. "Foam inserts bring the hemolysis index from about 51 to about 41 at today's speed — under the 50 limit with room to spare — and they protect even more at high speed (about 24 units), where the unpadded carrier is far over the limit; recommend foam inserts at low speed now, confirmed with QC samples, and revisit high speed only if the 40 s transit gain matters clinically." ✅ · D. "Low speed with padding is the optimum, and the tube can now be used for all sample types."
`[E1 · B5 · Evaluate · HC · X · CERT]` — Effect sizes in the response's units, a comparison to today and the limit, the interaction read as two conditional effects, and a confirmation step; B is true but averages over an interaction that changes the number by a factor of nearly three, and D claims more than QC samples and one requirement can support.

<!--
Key tally (53 items): A = 13 (E1-3, 6, 9, 13, 17, 21, 25, 29, 32, 36, 41, 46, 51) · B = 13 (E1-1, 8, 12, 15, 19, 23, 27, 30, 34, 39, 43, 47, 50) · C = 13 (E1-4, 5, 11, 16, 24, 28, 33, 37, 40, 44, 48, 52, 53) · D = 14 (E1-2, 7, 10, 14, 18, 20, 22, 26, 31, 35, 38, 42, 45, 49)
Type: X = 24 (45%) · S = 19 (36%) · K = 10 (19%)
Bloom: Analyze = 23 · Apply = 12 · Evaluate = 8 · Understand = 10 · Remember = 0 (Apply/Analyze/Evaluate = 43 = 81%)
Vertical: MFG = 15 · HC = 15 · TXN = 13 · NEU = 10
Negative stems: 0
Contexts: catapult (E1-1, 2, 12, 22, 28, 45) · helicopter (E1-4, 5, 6, 10, 23, 27, 36, 42, 50) · process simulator (E1-7, 8, 9, 18, 26, 30, 35, 40, 44, 47) · project processes (the rest)
"When not to" coverage: run an experiment at all (E1-7 harm, 13 cannot set the factor, 25 answer already visible, 32 measurement not ready, 39 process unstable, 44 cannot be powered, 46 known monotone factor) · fit the standard factorial model (E1-19 run-order drift, 28 saturated, 33 count response) · one-factor-at-a-time (E1-41) · repeats as replicates (E1-4, 18) · restricted randomization (E1-11, 50, 52)
Exhibit data are generated to be internally consistent: effects, coefficients, SE, t, p, SS and R-Sq agree with each other and with the cell means quoted; CI and PI half-widths use t(0.025, 8) = 2.306.
-->

v1.0 · 2026-09-20
