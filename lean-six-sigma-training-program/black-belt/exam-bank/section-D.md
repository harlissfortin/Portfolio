# Black Belt Exam Bank — Section D: Modeling

Part of the Black Belt certification item bank. Blueprint, minimally competent candidate
statement, tag format and form-assembly rules: [`../exam-bank.md`](../exam-bank.md). Policy:
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).
Teach-text these items draw on: [`../modules/m4-modeling.md`](../modules/m4-modeling.md).

**Reading the exhibits.** Fenced blocks are software-style outputs in the layout Module 4 uses
in the week 6 and week 7 labs. The same numbers come from Minitab (Fit Regression Model, Fit
Binary Logistic Model, Nonparametrics, Fit General Linear Model), the Excel stats add-in, and
R (`lm`, `car::vif`, `glm(family = binomial)`, `wilcox.test`, `kruskal.test`, `aov`) or Python
(`statsmodels` `ols`/`logit`/`anova_lm`, `scipy.stats`); only the labels differ. Unless an
exhibit says otherwise: α = 0.05, two-sided; T = Coef ÷ SE Coef and Z = Coef ÷ SE Coef; VIF is
1 ÷ (1 − R²ⱼ) for that predictor against the others; an odds ratio is e^Coef and its interval
is e^(Coef ± 1.96 × SE); a non-parametric confidence interval is the software's inverted-test
interval; and every stem states the units and the basis of its numbers. Residual-diagnostic
summaries inside a fence replace the four plots the candidate would see on screen. All outputs
are illustrative and internally consistent; none is from a real employer.

Correct option ✅; tag in brackets; rationale after the dash.

---

## Section D — Modeling: multiple and logistic regression, diagnostics, non-parametrics, two-way ANOVA/GLM, when not to model (84 CERT)

**D1.** Bond strength (N, one destructive pull test per assembly) for 96 assemblies from four weeks of production on an adhesive line. Cure temperature ran 150–170 °C, cure time 20–60 s, and adhesive lot age at use ran 1–45 days. All four residual checks pass: flat band against fitted values, no drift against run order, normal plot AD = 0.41 (P = 0.31), largest Cook's distance 0.14.

```
Regression Analysis: bond_strength_N versus cure_temp_C, cure_time_s, lot_age_d   N = 96

Term                    Coef   SE Coef       T       P     VIF
Constant             -12.400    6.1500   -2.02   0.047
cure_temp_C            0.2840    0.0231   12.29   0.000   1.03
cure_time_s            0.1520    0.0186    8.17   0.000   1.02
lot_age_d             -0.0475    0.0154   -3.08   0.003   1.01

S = 2.85   R-Sq = 74.8%   R-Sq(adj) = 74.0%

Analysis of Variance
Source        DF         SS        MS       F      P
Regression     3    2217.40    739.13   91.03  0.000
Error         92     747.00      8.12
Total         95    2964.40
```

The sentence you tell your sponsor:
A. "Cure temperature is the factor to control. Its t of 12.29 is half again the next term's, its coefficient of 0.284 is the largest of the three, and its p is the smallest, so it carries more of the bond strength than cure time and lot age put together. Hold temperature tightly, leave the other two where the line already sets them, and put the gauge and the reaction plan on the temperature loop." · B. "Across the 150–170 °C the line actually ran, temperature is worth about 5.7 N and the 20–60 s time range about 6.1 N; adhesive six weeks old costs about 2 N. The model accounts for about three-quarters of the variation and places an individual assembly only to within about ±5.7 N, so it says where to aim, not what each assembly will do — and these are associations from production history." ✅ · C. "All four terms have p below 0.05, so all four are verified causes of bond strength: temperature, time and lot age each cleared the threshold on 96 assemblies with every residual check passing, which is the evidence the cause record asks for." · D. "R-sq is 74.8% and the residuals are clean, so the model is strong enough to set the bond-strength specification: read the fitted value at the settings we run and publish the band either side of it as the strength the customer can count on."
`[D · B4 · Analyze · MFG · X · CERT]` — The effects are stated in newtons across the range the data cover, with the precision of an individual prediction (±2S) and the observational caveat; C treats a p-value as verification, which no observational fit can deliver.

**D2.** Quote cycle time (working hours, enquiry logged to quote sent) for 185 quotes from one sales-support team over six months.

```
Regression Analysis: quote_cycle_h versus pages, options, rep_exp_m, backlog   N = 185

Term                    Coef   SE Coef       T       P
Constant              -4.6200    2.1100   -2.19   0.030
pages                  0.8450    0.0610   13.85   0.000
options                1.9050    0.1840   10.35   0.000
rep_exp_m             -0.0842    0.0131   -6.43   0.000
backlog                0.1620    0.0146   11.10   0.000

S = 7.42   R-Sq = 71.2%   R-Sq(adj) = 70.6%

Residual diagnostics
  Residuals vs fitted: SD 3.9 h (fitted < 20 h), 5.2 h (20-40 h), 11.4 h (> 40 h)
  Residuals vs observation order: no pattern
  Normal probability plot: AD = 2.24 (P < 0.005), long right tail
  Nine fitted values below zero; largest Cook's distance 0.09
```

What you do next, and what you tell the sponsor now:
A. Report the four effects with their p-values. R-sq of 71.2% on 185 quotes with four terms below 0.001 is a stronger result than most observational models produce, the order plot shows no drift and no quote is influential at 0.09 — the analysis carries itself, and the sponsor needs the four numbers rather than a discussion of the plots. · B. Remove the nine quotes with negative fitted values. They are the ones the model cannot represent, no cycle time is negative in reality, and with those nine gone the fit is defined over the range that actually exists, so the four effects can go to the sponsor as they stand. · C. Say the model is wrong in a specific way — its errors are nearly three times larger on the slow quotes than the fast ones and it predicts negative cycle times — refit on ln(cycle time) before quoting any effect, and tell the sponsor exactly that ✅ · D. Keep the model and multiply every prediction interval by three, so that the slow quotes at the wide end of the funnel are covered by the interval the sponsor is quoted and the fast ones are covered with room to spare.
`[D · B4 · Evaluate · TXN · X · CERT]` — A funnel plus negative fitted values is the signature of a multiplicative process, and the honest interim sentence names the defect rather than the R-sq; B deletes the observations that expose a scale error, which is a data-ethics stop.

**D3.** Discharge time (minutes from discharge order to patient leaving the unit) for 150 discharges collected over six consecutive weeks on one medical unit, in collection order.

```
Regression Analysis: discharge_time_min versus orders_pending, meds, weekend   N = 150

Term                    Coef   SE Coef       T       P
Constant              82.400    9.1500    9.01   0.000
orders_pending         3.1200    0.4100    7.61   0.000
meds                   4.8500    0.9200    5.27   0.000
weekend (1 = yes)     18.600    4.1500    4.48   0.000

S = 22.4   R-Sq = 51.2%   R-Sq(adj) = 50.2%

Residual diagnostics
  Residuals vs fitted: flat band, SD 21.8 / 22.1 / 22.9 min across thirds
  Normal probability plot: AD = 0.52 (P = 0.19)
  Residuals vs observation order: mean residual -6.2 min over discharges 1-50,
    +1.1 min over 51-100, +7.4 min over 101-150 - a steady climb
  Largest Cook's distance 0.12
```

The correct reading:
A. The spread of the errors grows with the response — 21.8 to 22.9 minutes across the thirds of the fitted range — so the model has a variance problem; transform discharge time onto a log scale, refit, and read the coefficients as percentages per order pending rather than as minutes. · B. There are outliers late in the collection window: the last fifty discharges average +7.4 minutes of residual, so flag the high residuals there, remove them under the project's written outlier rule and refit on what remains. · C. The model is under-specified in `meds`: a mean residual that climbs steadily is the signature of a missing curve, so add the squared term for medications with its parent term kept, re-check the four plots, and expect the order pattern to close once the curvature is in. · D. Something moved across the six weeks that is not in the model — a staffing change, a new order set, a census shift — so the coefficients are averaging two processes; find it and either add it as a term or split the period, and say in the record which you did ✅
`[D · B4 · Analyze · HC · X · CERT]` — Only the order plot fails, and a drift against order is a nuisance variable that moved during collection, not a shape or an outlier problem; B removes the evidence of the drift and leaves the cause in place.

**D4.** In a multiple regression with four predictors, the coefficient on one predictor is:
A. the change in Y per unit change in that predictor with the other three held fixed — which is why it can differ in size, and sometimes in sign, from the simple-regression slope for the same predictor ✅ · B. the change in Y per unit change in that predictor averaged over the other three, and therefore equal to the simple-regression slope for the same predictor apart from rounding — which is why a coefficient whose sign differs between the two fits points to a coding or software error rather than to anything in the data · C. the share of R-sq that predictor contributes, so that the four coefficients can be ranked against one another and added up to the model's explanatory power · D. the correlation between that predictor and Y, rescaled into Y's units, so that it measures the strength of that one relationship independently of the other three
`[D · B4 · Understand · NEU · K · CERT]` — "Holding the others fixed" is the whole difference from Green Belt's simple regression and the reason a coefficient can surprise you; B is the belief that makes a sign flip look like a software error instead of a collinearity warning.

**D5.** Coating weight (gsm, averaged from three cross-web scans per roll) for 72 rolls.

```
Regression Analysis: coating_weight_gsm versus pump_speed_rpm, web_speed_mpm   N = 72

Term                    Coef   SE Coef       T       P
Constant              18.550    1.9400    9.56   0.000
pump_speed_rpm         0.0612    0.0049   12.49   0.000
web_speed_mpm         -0.1985    0.0223   -8.90   0.000

S = 1.62   R-Sq = 68.1%   R-Sq(adj) = 67.2%

Residual diagnostics
  Residuals vs fitted: a single smooth arch - negative at both ends of the fitted
    range, positive through the middle, spanning about 4 gsm
  Residuals vs observation order: no pattern
  Normal probability plot: AD = 0.61 (P = 0.11)
  Largest Cook's distance 0.08
```

The correct next step:
A. Transform the response with Box-Cox. An arched residual band is a variance problem — narrow at the ends of the fitted range and wide through the middle — and one change of scale on coating weight settles the variance and the shape together without adding a term nobody asked for. · B. Remove the rolls at the two ends of the fitted range, which are the ones the straight-line model misses, and refit through the middle where the residual band is already flat. · C. Plot the residuals against each predictor in turn to see which one they bend on, add that predictor's squared term with its parent term kept, and re-check the four plots — the line's physics says pump output per revolution falls at high speed, which is where to look first ✅ · D. Accept the model: R-sq is 68.1% on 72 rolls, both predictors are below 0.001, the order plot and the normal plot pass and no roll is influential at 0.08, so the fit is adequate for cause verification and the arch is a detail the sponsor does not need.
`[D · B4 · Analyze · MFG · X · CERT]` — Curvature in the residual band means a missing term or a wrong scale, and the residual-versus-each-X plots say which; A treats a curve as a funnel and would transform a response whose spread is already constant.

**D6.** A purchasing team models supplier lead time (calendar days, purchase order released to receipt) for 260 orders. The sponsor's question is which lever to change.

```
Model 1 - all candidate predictors                     R-Sq = 94.8%   S = 3.12
  expedite_emails       Coef  4.1850   SE 0.0994   T 42.10   P 0.000
  backlog               Coef  0.0121   SE 0.0099   T  1.22   P 0.224
Model 2 - expedite_emails removed                      R-Sq = 72.4%   S = 7.18
  backlog               Coef  0.1584   SE 0.0146   T 10.85   P 0.000

Data dictionary: expedite_emails = emails from the buyer chasing the order, counted
from the order mailbox between order release and receipt.
```

The Black Belt's call:
A. Report model 2 and record why: emails chasing a late order are produced by the delay, so they cannot be a lever anyone can pull, and carrying them displaces backlog — the one thing the planner sets ✅ · B. Report model 1. R-sq of 94.8% and a t of 42 on 260 orders are the strongest evidence in the study, the count comes from a mailbox record rather than anyone's recollection, and setting the largest term in the model aside on a judgment about which way the arrow points is not something the data support. · C. Report model 1 with the term renamed "communication intensity," which describes what the count actually measures and drops the implication that the emails lengthened the lead time. · D. Report model 1 for prediction and model 2 for causes. The two questions are different — what lead time to expect and what to change — and each model answers one of them, so the record should carry both with a line saying which is which.
`[D · B4 · Evaluate · TXN · S · CERT]` — A consequence of Y always predicts Y and steals the credit from real causes; D is the most defensible wrong answer, but nobody needs a prediction of a lead time the buyer's own mailbox already reveals, and the sponsor asked for a lever.

**D7.** Laboratory turnaround (minutes, specimen receipt to verified result) for 64 analyzer runs.

```
Regression Analysis: lab_tat_min versus batch_size, analyzer_age_mo, priority_pct

All 64 runs                                  63 runs, run 41 removed
Term               Coef   SE Coef      T     Term               Coef   SE Coef      T
Constant        21.400    4.6200    4.63     Constant        24.850    5.9100    4.20
batch_size       0.4120    0.0385   10.70    batch_size       0.3180    0.0712    4.47
analyzer_age_mo  0.1815    0.0642    2.83    analyzer_age_mo  0.1902    0.0655    2.90
priority_pct     0.2940    0.0715    4.11    priority_pct     0.3015    0.0728    4.14
S = 6.15  R-Sq = 74.2%                       S = 6.18  R-Sq = 61.8%

Largest Cook's distance 1.34 (run 41: a batch of 240 specimens; every other batch in
the data is 20-90). Run 41 is a genuine overnight re-run after an analyzer fault and
is in the M3 provenance record.
```

The correct handling:
A. Remove run 41. A Cook's distance of 1.34 is above the conventional cut of 1, which is the definition of an influential outlier, and the 63-run model is what the other 63 batches actually support — batch size at 0.32 minutes per specimen, every term still significant, and no single row steering the slope. · B. Keep run 41 and report only the 64-run model. It is a genuine test on a genuine batch and it is in the M3 provenance record, and printing a second fit with a real row deleted invites the reader to prefer the version with the inconvenient observation missing. · C. Recode run 41's batch size to 90, the largest value the rest of the data supports, so that its leverage disappears while the row itself stays in the analysis and the count of runs is unchanged. · D. Report both fits and say what the row is: batch size is worth 0.41 min per specimen with run 41 and 0.32 without, so over the 20–90 range the lab actually runs the effect is somewhere between about 22 and 29 minutes, and nothing in either model applies to a batch of 240 ✅
`[D · B4 · Evaluate · HC · X · CERT]` — One high-leverage row that is genuine is reported both ways with the range of conclusions it produces; B is half right — the row stays — but hiding that one observation is steering the slope is the failure the diagnostic exists to catch, and C edits data.

**D8.** Module 4's rule is "diagnostics before coefficients, coefficients before p-values." The reason for that order:
A. Software computes the residual plots before it computes the coefficient table, so reading them in that order follows the sequence in which the output is produced and nothing is read out of turn. · B. A failed diagnostic changes what the coefficients and their standard errors mean, so reading them first means reading numbers whose margins are already wrong; and the p-value comes last because it answers "could this be zero," not "how big is it and can we act on it" ✅ · C. p-values are unreliable in observational data and should not be reported at all; the coefficients and their intervals carry what the sponsor needs, and the diagnostics decide whether those intervals mean anything. · D. The residual plots are what establish that the predictors are causes rather than associations: a model whose residuals are flat, straight on the normal plot, patternless against run order and free of influential rows has ruled out the competing explanations, which is what verification means.
`[D · B4 · Understand · NEU · K · CERT]` — The order runs from what makes the numbers meaningful to what they mean to the process, with the weakest question last; D promotes a diagnostic into a causal argument, which only a designed experiment or a verified mechanism supplies.

**D9.** A service desk models handling time (minutes per ticket) on 260 tickets. The operations director asks what handling time to expect if the open-ticket queue reaches 150 during the migration weekend.

```
Regression Analysis: ln(handling_min) versus tickets_open, complexity, agent_exp_m

Term                    Coef    SE Coef       T       P
Constant             2.04500    0.05120   39.94   0.000
tickets_open         0.01185    0.00061   19.43   0.000
complexity           0.13620    0.00940   14.49   0.000
agent_exp_m         -0.00412    0.00048   -8.58   0.000

S = 0.182   R-Sq = 84.2%   R-Sq(adj) = 84.0%
Back-transformed: each open ticket x1.012; each complexity point x1.146
Range in the data: tickets_open 8-74 (median 31); complexity 1-5; agent_exp_m 2-96
```

The right answer to the director:
A. The model cannot answer it: no ticket in these 260 was handled with more than 74 open, the 1.2% per ticket is fitted inside 8–74, and 150 is twice the worst load observed — offer the 74-ticket figure of about 25 minutes as the highest defensible estimate and a plan to measure during the migration itself ✅ · B. About 62 minutes. The model is fitted, the arithmetic is straightforward, all three terms are below 0.001 and R-sq is 84.2%, so the estimate rests on the best evidence the team has; a number the director can plan the weekend's staffing around is worth more than a refusal, and it can be revised once the migration data land. · C. About 62 minutes, and widen the prediction interval by half to allow for the distance between a queue of 150 and the range the model was fitted on. · D. About 62 minutes, with a footnote saying the figure is an extrapolation beyond the observed range of 8 to 74 open tickets and should be read as indicative.
`[D · B4 · Evaluate · TXN · X · CERT]` — A model says nothing outside the range that produced it, and a queue at twice its observed maximum is exactly where the mechanism (how work is triaged once capacity is gone) is likely to change; D is the most tempting wrong answer, because a footnote does not make the number defensible and the director will act on the number, not the footnote.

**D10.** A pressure-vessel team has finished its cause structure and drafts the model.

```
Candidate model from the C&E matrix
  Y   = burst_pressure_bar (one destructive test per vessel)
  X's = wall_thickness_mm, weld_current_A, weld_speed_mm_s, preheat_C,
        filler_lot (3 levels = 2 indicator terms), operator (4 levels = 3 indicator terms)
Terms to estimate, excluding the constant: 9
Vessels available for destructive test this quarter: 22
```

The right call:
A. Fit all nine terms. Twenty-two vessels leave 12 error degrees of freedom, which is enough to estimate nine coefficients and still test each against the residual, the C&E matrix says all nine are credible, and destructive tests are expensive — dropping terms before the data have spoken is how a real cause gets left in the process, and there is no second quarter of vessels to spend. · B. Use stepwise selection to reduce the nine terms to the ones that reach p < 0.05, which lets the 22 vessels support the smaller model the data can carry. · C. Do not fit this model: nine terms need roughly 90–135 vessels at 10–15 per term, so 22 destructive tests would fit noise. Cut to the two or three terms the C&E matrix ranks highest, and take weld current and speed — both settable — into a designed experiment, which an observational model could not separate anyway ✅ · D. Fit all nine terms and report only those with p < 0.01. A stricter threshold is the standard protection against a small sample: it holds the false positives down, and the terms that survive it on 22 destructive tests are the ones worth taking to the control plan.
`[D · B4 · Apply · MFG · S · CERT]` — Observations per term is the first gate on any regression, and the honest alternative is a smaller model plus an experiment; D confuses a stricter p-value threshold with having enough data, which it never substitutes for.

**D11.** Consultation response time (minutes, consult ordered to consultant note filed) for 212 consults, fitted two ways on the same terms.

```
Model P - ln(consult_response_min) versus service, urgency, orders_pending   N = 212
  Residuals vs fitted: flat band, SD 0.21 / 0.20 / 0.22 across thirds
  Residuals vs observation order: no pattern
  Normal probability plot: AD = 0.78 (P = 0.041); straight from the 5th to the 95th
    percentile, four of 212 points slightly high in the upper tail
  Largest Cook's distance 0.09
  S = 0.208   R-Sq = 71.4%

Model Q - consult_response_min (untransformed) versus the same terms   N = 212
  Residuals vs fitted: funnel, SD 9 / 16 / 41 min across thirds
  Normal probability plot: AD = 4.92 (P < 0.005), long right tail
  S = 26.1   R-Sq = 58.1%
```

The correct reading:
A. Both models fail the residual normality check — AD = 0.78 with P = 0.041 on model P, AD = 4.92 on model Q — so neither fit can carry an honest confidence interval; compare the services and urgency levels with a rank test, which asks nothing of the residuals at all, and report the shift in minutes. · B. Model P passes in the way that matters: at n = 212 a mild departure from a straight normal plot costs almost nothing, and the plot is straight through the body of the data. Model Q's AD is a symptom of the funnel rather than a separate defect — one change of scale fixed both. Report model P ✅ · C. Model Q is preferable because its coefficients are already in minutes, which is what the sponsor needs; a log-scale coefficient has to be translated before anyone can use it, and the translation is where the mistakes get made. · D. Neither model can be used until the four points in model P's upper tail are removed and both fits repeated, since those four are what pushed the Anderson-Darling p-value below 0.05.
`[D · B4 · Analyze · HC · X · CERT]` — Residual normality is the least demanding of the four checks at this sample size, and the funnel was the real problem; A discards two usable models over the check that matters least, and C prefers convenient units to correct ones.

**D12.** A candidate presents this model of claim cycle time (working hours, receipt to decision).

```
Regression Analysis: cycle_h versus items, amount_k, exp_m, queue, status_calls   N = 480

Term                    Coef   SE Coef       T       P
Constant               1.850    0.7400    2.50   0.013
items                  0.9210    0.0480   19.19   0.000
amount_k               0.1104    0.0162    6.81   0.000
exp_m                 -0.0391    0.0069   -5.67   0.000
queue                  0.0184    0.0091    2.02   0.044
status_calls           3.4120    0.0610   55.93   0.000

S = 2.71   R-Sq = 96.1%   R-Sq(adj) = 96.1%

Row check: 480 rows, 456 distinct claim_id; 24 claim_ids appear twice, all in weeks
11-16, once with extract_batch = 1 and once with extract_batch = 2
Data dictionary: status_calls = claimant enquiries logged against the claim while it
is open
```

What this output is telling you:
A. Nothing is wrong. Twenty-four duplicated rows in 480 is 5%, within any reasonable tolerance for an extract assembled from two batches, R-sq of 96.1% is the best in the cohort and every term including queue depth clears 0.05 — the model is ready for the A2 exhibit, and the duplication can be noted in the provenance record without refitting. · B. Drop the 24 duplicated rows and refit; with 5% of the rows counted twice the coefficients will move materially once the duplication is gone, and the corrected table is the one to report. · C. Weight the duplicated rows at 0.5 each, so that no claim counts twice while no data are lost and all 480 rows in the extract still contribute to the fit. · D. Two separate defects: `status_calls` is a consequence of a long cycle, which is why R-sq is 96% and queue depth has nearly dropped out; and 24 claims counted twice make every standard error in the table too small, so no interval here is honest. Write the exclusion rule, remove the consequence term, then refit ✅
`[D · B4 · Evaluate · TXN · X · CERT]` — Count the units before the p-values and ask of every X whether Y could cause it; B fixes the provenance but leaves the consequence term, and duplicating 5% of rows moves standard errors far more than it moves coefficients.

**D13.** A sponsor asks, "How close will this model be for one order?" The statistic that answers that question is:
A. R-sq, the share of the variation in cycle time the model accounts for, which is the usual summary of how well a regression is doing its job · B. R-sq(adj), which corrects R-sq for the number of terms in the model and so reports how accurate the fit is without rewarding it for extra predictors — the version to quote once a model carries more than one X · C. S, the standard deviation of the residuals in the response's own units — roughly ±2S brackets an individual order, while R-sq and R-sq(adj) compare models and say nothing about the size of a miss ✅ · D. the F statistic from the analysis of variance, which tests the model as a whole and so reports whether its predictions can be relied on for one order
`[D · B4 · Understand · NEU · K · CERT]` — Only S is in the units the sponsor's question is asked in; B is the trap for candidates who have learned that R-sq(adj) is the "better" R-sq and assume better means it answers more questions.

**D14.** Hardness (HRC, one Rockwell reading per part) for 59 tempered parts. All four residual checks pass. The heat-treat engineer asks whether a part run at 530 °C for 100 minutes will be inside the 40–50 HRC specification.

```
Regression Analysis: hardness_HRC versus temper_temp_C, soak_time_min   N = 59

Term                    Coef     SE Coef       T       P
Constant              68.4200    2.15000   31.82   0.000
temper_temp_C         -0.04120   0.00385  -10.70   0.000
soak_time_min         -0.01950   0.00512   -3.81   0.000

S = 2.62   R-Sq = 66.4%   R-Sq(adj) = 65.2%

Prediction for temper_temp_C = 530, soak_time_min = 100
  Fit = 44.63 HRC     SE Fit = 0.52
  95% CI = (43.6, 45.7)          95% PI = (39.3, 50.0)
Specification: 40-50 HRC
```

The correct answer to the engineer:
A. "Not reliably: the 95% prediction interval for one part, 39.3 to 50.0 HRC, reaches past the lower limit and right up to the upper one, so individual parts will fall outside. The 43.6 to 45.7 interval is where the average of many parts at these settings lies, which is a different question." ✅ · B. "Yes: the 95% confidence interval, 43.6 to 45.7 HRC, sits well inside the 40–50 specification with room at both ends, and it is the interval the software prints for exactly these settings." · C. "Yes: the fitted value of 44.63 HRC sits close to the middle of the 40–50 specification, which is the best single estimate the model can give for a part run at those settings." · D. "Neither interval bears on it. Whether parts land inside 40–50 is a capability question, which needs a run of parts at the settings and a capability index on their spread; a regression interval describes the fit, not the process, so the honest answer is to run thirty parts at 530 °C and 100 minutes and compute capability from them."
`[D · B4 · Apply · MFG · X · CERT]` — One future part is the prediction interval's question, and quoting the mean's interval for a part is the most common misuse of a regression output; D is the strongest distractor, since a capability study answers the same question with more data but does not make the prediction interval irrelevant.

**D15.** A candidate proposes to model pain at four hours after surgery.

```
Module 2 record - pain-score metric
  Y to be modeled: pain at 4 h, 0-10 numeric rating scale, recorded by the ward assessor
  Gauge R&R study (3 assessors x 20 patients x 2 repeats)
    Total Gauge R&R = 38.4% of study variation
    Repeatability 26.1%   Reproducibility 28.2%
    Number of distinct categories = 2
Candidate model: pain_4h versus analgesic_dose_mg, block_used, age_y, surgery_min
Effect the sponsor cares about: 2 points on the 0-10 scale
```

The reviewer's call:
A. Fit the model and add assessor as a predictor, so that the share of the pain score belonging to the assessor is estimated rather than left in the error. With three assessors that costs two indicator terms, the remaining coefficients are then adjusted for who did the scoring, and the 38% Gauge R&R is accounted for inside the model rather than ignored. · B. Fit the model; regression is robust to error in the response, because that error goes into the residual term — it widens S and every interval honestly without biasing a single coefficient, so the model is less precise than a clean gauge would give but not wrong. · C. Fit the model and widen every confidence interval by 38% to allow for the measurement system, which carries the Gauge R&R result through to the numbers the sponsor reads. · D. Do not fit it: at 38% Gauge R&R with two distinct categories the metric cannot resolve the 2-point difference the sponsor cares about, so the model would be fitting the assessors. Repair the measurement system — one anchoring script, one assessor per patient, then re-run the study — and record the decision in the A3 paragraph ✅
`[D · B4 · Evaluate · HC · S · CERT]` — Module 2 comes before Module 4 for exactly this reason; A models the error instead of removing it, and B is true only of random noise, not of a system that cannot tell two levels of pain apart.

**D16.** Engineering rework (hours per drawing package, released to re-released) for 196 packages, fitted on the log scale after the raw-scale residuals funnelled.

```
Regression Analysis: ln(rework_h) versus drawings, revisions, vendor_tier   N = 196

Term                       Coef     SE Coef       T       P
Constant                0.62150    0.06420    9.68   0.000
drawings                0.04180    0.00312   13.40   0.000
revisions               0.19850    0.01640   12.10   0.000
vendor_tier (1 = new)   0.28850    0.04120    7.00   0.000

S = 0.212   R-Sq = 79.6%   R-Sq(adj) = 79.3%
Residuals vs fitted: SD 0.21 / 0.20 / 0.22 across thirds; normal plot AD = 0.44 (P = 0.29)
Back-transformed: each drawing x1.043; each revision x1.220; new-tier vendor x1.334
Range in the data: drawings 4-24 (median 12); revisions 0-4; 38% of packages new-tier
```

The sponsor sentence:
A. "Each drawing adds 0.042 hours of rework, each revision 0.199 hours and a new-tier vendor 0.289 hours — the three coefficients straight from the table, in the units rework was recorded in." · B. "A typical 12-drawing package with one revision takes about 3.8 hours of rework from an established vendor and about 5.0 from a new-tier one — a third more. Each further revision multiplies rework by about 1.22, so a 20-drawing package with three revisions from a new-tier vendor runs near 10.4 hours. The percentages hold at every package size, which is why we quote hours at sizes you recognise." ✅ · C. "R-sq is 79.6% on the log scale, so the model accounts for about 80% of rework hours, which is the headline to put beside the three effects." · D. "The coefficients are in log-hours, which cannot be translated back into hours without losing the intervals, so the honest report gives the three multipliers — 1.043 per drawing, 1.220 per revision, 1.334 for a new-tier vendor — and stops there. Converting them to hours at a chosen package size attaches a precision the model does not have, and it implies we can predict one package, which S says we cannot."
`[D · B4 · Apply · TXN · X · CERT]` — On a log scale a coefficient is a percentage and the sponsor needs hours at named settings; A reads log-scale coefficients as if they were hours, which understates a large package by a factor of several.

**D17.** Net fill weight (g, checkweigher reading on every pack) for 120 packs from a stable run.

```
Regression Analysis: fill_weight_g versus auger_speed_rpm, hopper_level_pct   N = 120

Term                       Coef     SE Coef       T       P
Constant              248.62000    1.84000  135.12   0.000
auger_speed_rpm         0.09420    0.00285   33.05   0.000
hopper_level_pct        0.00180    0.00061    2.95   0.004

S = 0.412   R-Sq = 91.2%   R-Sq(adj) = 91.0%
All four residual checks pass; largest Cook's distance 0.07
Range in the data: auger_speed_rpm 180-240; hopper_level_pct 25-95
Fill specification 250.0 +/- 1.5 g     Checkweigher resolution 0.1 g
Process SD from the stable I-MR chart: 0.44 g
```

The correct reading of the hopper-level term:
A. Hopper level is a verified cause at p = 0.004 on 120 consecutive packs with every residual check passing, so it belongs in the control plan with a hold range, a gauge and a reaction plan, beside auger speed. · B. Hopper level should be dropped because 0.004 does not clear the 0.001 threshold the other term reaches, and a model written into a control plan carries only the terms it has established beyond argument. · C. Hopper level is real and immaterial: across the 25–95% the line runs it moves fill weight about 0.13 g — barely above the checkweigher's 0.1 g resolution, under a third of the 0.44 g process SD, against a ±1.5 g tolerance. Record it in A4 as tested and too small to act on; auger speed, worth about 5.7 g across its range, is the lever ✅ · D. Both terms matter: together they account for 91.2% of fill-weight variation on a stable run, so the model is the control strategy. Hold auger speed and hopper level inside the ranges the data cover, put both on the line's dashboard with alarm limits, and fill weight looks after itself — which is what an R-sq of 91% on 120 consecutive packs is telling you.
`[D · B4 · Evaluate · MFG · X · CERT]` — Statistical clarity and practical size are different questions, and a 0.13 g effect against a ±1.5 g tolerance is a finding to record, not a countermeasure; A acts on a p-value without ever converting the coefficient into grams.

**D18.** A residuals-versus-fitted plot that funnels open to the right tells you:
A. two or more predictors are collinear, so their coefficients are dividing one effect between them and every standard error in the table is inflated · B. one observation is influential and is steering the fit, which is what opens the band at the end of the fitted range where that observation sits · C. the response is not normally distributed, so the response must be transformed before any model is fitted — the funnel is how a skewed Y shows itself once a straight line has been put through it, the Anderson-Darling test on Y will confirm it, and a Box-Cox on Y is the remedy that closes the band, which is why normality of Y is checked before the terms are chosen · D. the size of the error grows with the response, so every standard error, confidence interval and prediction interval in the output is wrong — too narrow where the response is large, too wide where it is small — and the usual remedy is a different scale for Y, often the logarithm, rather than a different set of terms ✅
`[D · B4 · Understand · NEU · K · CERT]` — The funnel is about the errors, not about the marginal shape of Y; C is the near-miss that sends candidates to test Y for normality, which is not an assumption of regression at all.

**D19.** Customer onboarding (calendar days, contract signed to first transaction) for 220 customers across three intake sites; site A is the reference level.

```
Regression Analysis: onboarding_days versus documents, site_B, site_C   N = 220

Term                       Coef     SE Coef       T       P
Constant                4.18500    0.51200    8.17   0.000
documents               0.81400    0.04620   17.62   0.000
site_B (1 = yes)        3.12000    0.41800    7.46   0.000
site_C (1 = yes)        0.28500    0.42100    0.68   0.499

S = 2.48   R-Sq = 68.4%   R-Sq(adj) = 68.0%
Test of the site factor as a set: F = 28.14, DF 2 and 216, P = 0.000
All four residual checks pass
```

The correct reading:
A. Site B adds about 3.1 days at any document count — the same as about four extra documents — while site C is indistinguishable from site A at 0.3 ± 0.8 days. Two sites run the same process and one does not, so the question is what site B does differently, not whether site matters ✅ · B. All three sites differ from each other: the site factor as a set is significant at P = 0.000 on 2 and 216 degrees of freedom, and that is the test which settles whether site matters. · C. Site C is also slower, by 0.285 days. The effect is smaller than site B's and its p-value is large, but the point estimate is positive and it is the best estimate these 220 customers give. · D. Since site C's term does not reach p = 0.05, drop it and refit with site B alone, which simplifies the model without losing information — a term at P = 0.499 is noise, and the two-site model will estimate the document effect more precisely, which is what the sponsor is paying for.
`[D · B4 · Analyze · TXN · X · CERT]` — Indicator coefficients are read against the reference level, and a significant set does not make every level differ; D silently pools site C into the reference, which changes what the reference means and what every other coefficient is measured against.

**D20.** A Black Belt's model of consultation response time (minutes) gives a clear coefficient on the number of orders pending at the time of the consult. The sponsor says: "So if we cap the pending-order queue at ten, we save about 14 minutes a consult." The correct response:
A. Agree; the coefficient is the saving per unit and the arithmetic is the model's own — a queue held at ten instead of where it ran means about 14 minutes off each consult. · B. Explain that the model says consults took longer on shifts when the queue was deep, which is an association — the same staffing shortfall could be lengthening consults and backing up orders. The honest next step is to set the queue deliberately: cap it on some sessions and not others, blocked across weekdays, and measure. The model says where to run that test, not what it will return ✅ · C. Agree, but halve the estimate to allow for measurement error in the queue count, which is read from the order system at one moment and understates how deep the queue ran between reads. · D. Withdraw the model and refit it without the queue term, because a predictor the team intends to change cannot be verified observationally: once the sponsor has said they will cap the queue, that coefficient is being read as a forecast of an intervention, and the model was never built to carry one. Report the terms nobody will touch, and take the queue question to the experiment where it belongs.
`[D · B4 · Analyze · HC · S · CERT]` — An observational coefficient on a settable X is a candidate for an experiment, which is why Module 4 hands the lever to Module 5; D over-corrects by deleting the most useful finding in the model instead of labelling it.

**D21.** Delivery-round duration (hours per round, depot departure to depot return) for 140 rounds. The dispatch rule puts roughly the same number of parcels at every stop, so stops and parcels correlate at 0.96.

```
Regression Analysis: delivery_h versus stops, parcels, route_km, driver_exp_m   N = 140

Model A - all four predictors
Term                       Coef     SE Coef       T       P     VIF
Constant                3.21500    0.88400    3.64   0.000
stops                   0.09410    0.06200    1.52   0.131   13.80
parcels                 0.00412    0.00268    1.54   0.127   13.50
route_km                0.02180    0.00296    7.36   0.000    1.09
driver_exp_m           -0.00815    0.00215   -3.79   0.000    1.06
S = 0.742   R-Sq = 81.4%   R-Sq(adj) = 80.8%

Model B - parcels removed
Term                       Coef     SE Coef       T       P     VIF
Constant                3.40200    0.61500    5.53   0.000
stops                   0.11320    0.01680    6.74   0.000    1.05
route_km                0.02165    0.00293    7.39   0.000    1.07
driver_exp_m           -0.00808    0.00213   -3.79   0.000    1.05
S = 0.741   R-Sq = 81.3%   R-Sq(adj) = 80.9%
```

The correct reading:
A. Neither stops nor parcels affects round duration: both p-values in model A are above 0.10, so distance and driver experience are the only real factors, and the dispatch rule the sponsor asked about is not one of them. · B. Keep model A and report that stops and parcels are jointly important but individually unclear, which is the most complete statement the data support: both VIFs sit near 14, both coefficients are positive, and saying which of the two carries the effect would go beyond what 140 rounds can show. The sponsor gets the whole table with the caveat, and nothing is asserted that the collinearity cannot carry. · C. Stops and parcels carry the same information, so model A splits one effect between them and neither looks real. Model B fits identically — S 0.741 against 0.742, R-sq 81.3% against 81.4% — and makes the effect readable at about 0.11 h, near 7 minutes, per stop. Report stops, which is what the dispatcher sets, and record that the pair cannot be separated in this data ✅ · D. Discard both and refit on distance and driver experience alone, since a VIF near 14 means neither variable can be trusted in any model, while the surviving two terms sit near 1 and can be reported without qualification.
`[D · B4 · Analyze · TXN · X · CERT]` — Identical fit with one term removed is the signature of redundancy, and the remedy keeps the predictor someone can set; B is technically true but leaves the sponsor with no number, when the same data yields 7 minutes per stop.

**D22.** A predictor's variance inflation factor is 9. In practical terms:
A. its standard error is three times what it would be if that predictor moved independently of the others, so its interval is three times as wide and the coefficient may be unreadable even where the model as a whole predicts well ✅ · B. it accounts for nine times as much variation in Y as an independent predictor would, so a term carrying a VIF of 9 is doing nine times the work of a term at 1 and is the one to keep when a model has to be cut down to size — the figure ranks a predictor's contribution · C. nine of the model's other terms are collinear with it, so the number itself says how much of the table has to be rebuilt · D. the model's predictions are inflated ninefold and must be rescaled before use, which is what the phrase variance inflation is naming
`[D · B4 · Understand · NEU · K · CERT]` — VIF multiplies the variance, so its square root multiplies the standard error, which is the number that decides whether a lever is readable; D confuses inflated variance with inflated predictions, which collinearity does not cause.

**D23.** A moulding cell's shrinkage model exists for one purpose: choosing a hold time inside the settings the press already runs. No one will act on a temperature coefficient.

```
Regression Analysis: shrinkage_pct versus barrel_temp_C, melt_temp_C, hold_time_s   N = 80

Term                       Coef     SE Coef       T       P     VIF
Constant                4.18500    0.51200    8.17   0.000
barrel_temp_C          -0.00842    0.00615   -1.37   0.175   25.40
melt_temp_C            -0.00615    0.00570   -1.08   0.284   25.30
hold_time_s            -0.03920    0.00410   -9.56   0.000    1.03

S = 0.094   R-Sq = 88.6%   R-Sq(adj) = 88.1%
Barrel and melt temperature correlate at 0.98 (the melt probe sits in the barrel).
All four residual checks pass.
```

The statement to put in the record:
A. The model is invalid: a VIF above 10 disqualifies any regression from a cause-verification record, whatever the model is being used for. · B. Drop melt temperature so that every VIF falls below 10, then report the barrel-temperature coefficient as the temperature effect. With the redundant probe gone the surviving term carries the whole effect of heat on shrinkage and can be read straight off the table, the record shows no VIF above the threshold anyone will ask about, and that is the standard remedy for collinearity at a cost of one term. · C. Report both temperatures as having no effect on shrinkage, which is what their p-values of 0.175 and 0.284 say on 80 mouldings. · D. The collinearity does not touch this use: predictions inside the settings the press runs are unaffected by VIF, and hold time — VIF 1.03, about 0.04 percentage points of shrinkage per second — is the only coefficient anyone will read. Record that the two temperatures move together and that no separate temperature effect can be claimed from this data ✅
`[D · B4 · Evaluate · MFG · X · CERT]` — VIF damages statements about individual levers, not prediction inside the data's range, so the honest record separates the two; B buys a low VIF and then reads the surviving coefficient as if the data had separated the pair, which it never did.

**D24.** Length of stay (days) against patient age (years, 20–95, mean 62) on a medical ward, 210 stays. The team hypothesized curvature in advance.

```
Uncentered: los_days versus age_y, age_y^2                          N = 210
Term                       Coef      SE Coef       T       P      VIF
Constant                2.14000     1.815000    1.18   0.240
age_y                   0.04120     0.042800    0.96   0.337    34.20
age_y^2                 0.000318    0.000441    0.72   0.472    34.10
S = 1.845   R-Sq = 21.4%   R-Sq(adj) = 20.6%

Centred at 62 y: los_days versus age_c, age_c^2                     N = 210
Term                       Coef      SE Coef       T       P      VIF
Constant                5.91680     0.152000   38.93   0.000
age_c                   0.08063     0.007400   10.90   0.000     1.02
age_c^2                 0.000318    0.000441    0.72   0.472     1.02
S = 1.845   R-Sq = 21.4%   R-Sq(adj) = 20.6%
```

The correct action and reading:
A. A VIF of 34 disqualifies the quadratic model; fit the linear model alone, report the age slope from it and record that curvature could not be assessed. · B. Centring age is the fix, and the two outputs show why: the fit is identical (S 1.845, R-sq 21.4% both ways) but the VIFs drop to 1.02 and the linear term becomes readable — about 0.08 days of stay per year of age near 62 — with no evidence of curvature (P = 0.472). Report the linear effect and record the curvature as tested and absent ✅ · C. Keep the uncentered output and report that age has no effect on length of stay, since neither term reaches p = 0.05 on 210 stays and the quadratic model is the one the team pre-specified — a finding of no effect is still a finding for A4. · D. Replace age with bands (under 50, 50–74, 75+), which removes the collinearity by removing the continuous scale: three indicator terms carry VIFs near 1, the bands are how the ward already talks about its patients, any curvature shows up as an uneven step between bands rather than as a term nobody can read, and the result is easier to explain at a tollgate.
`[D · B4 · Apply · HC · X · CERT]` — A variable and its own square are collinear by construction and centring removes it without changing the fit; C reads an artefact of parameterisation as a finding about patients.

**D25.** A coating line's four candidate predictors for dry-film thickness, with the correlation matrix from 60 rolls.

```
  line_speed_mpm   set by the operator at the console
  oven_temp_C      set by the operator at the console
  viscosity_cP     measured at the applicator; rises as oven inlet temperature falls
  humidity_pct     ambient, logged hourly, not controllable

Correlation matrix (60 rolls)
                 line_speed   oven_temp   viscosity   humidity
line_speed             1.00
oven_temp             -0.08        1.00
viscosity              0.05       -0.94        1.00
humidity               0.11       -0.06        0.09        1.00
```

The remedy that keeps the model interpretable:
A. Drop viscosity: it sits downstream of oven temperature, so controlling the temperature controls both, and the physics rather than the data makes that choice. Record that the pair cannot be separated observationally and that a separate viscosity effect would need an experiment ✅ · B. Drop oven temperature, which will carry the higher VIF of the pair once both are fitted, and keep viscosity — the measurement taken at the applicator, closest to the film itself. · C. Keep both and report their p-values, noting in the record that collinearity widens the intervals but does not bias the coefficients, so the point estimates still stand. · D. Combine oven temperature and viscosity into one standardized index and fit that instead: the index carries the information the two share, its VIF is 1 by construction, and both measurements keep contributing to the model rather than one of them being discarded, which is what the remedy order recommends when two terms cannot be separated.
`[D · B4 · Evaluate · MFG · S · CERT]` — The remedy order is drop-the-downstream-term, then combine, then experiment, and here one term physically sets the other; D is the legitimate second remedy misapplied, because a standardized blend of °C and cP is not a quantity any operator can set.

**D26.** Weld strength (kN, one destructive test per coupon) for 76 coupons. The sponsor asks which machine setting to change.

```
Regression Analysis: weld_strength_kN versus current_A, travel_speed_mm_s, heat_input

Model A - all three terms                                            N = 76
Term                       Coef     SE Coef       T       P     VIF
Constant               -2.18500    1.94000   -1.13   0.264
current_A              -0.01420    0.00812   -1.75   0.085   31.60
travel_speed_mm_s      -0.09850    0.04120   -2.39   0.020   28.40
heat_input              0.41200    0.12400    3.32   0.001   47.20
S = 0.284   R-Sq = 78.4%   R-Sq(adj) = 77.5%

Note from the data dictionary: heat_input is computed in the extract as
current_A x voltage_V / travel_speed_mm_s

Model B - heat_input removed                                         N = 76
Term                       Coef     SE Coef       T       P     VIF
Constant                1.84200    0.41500    4.44   0.000
current_A               0.01185    0.00142    8.35   0.000    1.04
travel_speed_mm_s      -0.06420    0.00815   -7.88   0.000    1.04
S = 0.286   R-Sq = 77.9%   R-Sq(adj) = 77.3%
```

The correct reading:
A. Model A is the better model: higher R-sq, heat input is the only term below 0.01 on 76 destructive coupons, and it is the term the welding literature treats as the governing quantity, so the fit and the physics agree on which of the three to report. · B. Current's coefficient flips sign between the models because heat input is arithmetically built from current and travel speed, so model A asks the data to separate a quantity from its own ingredients. Model B fits as well (77.9% against 78.4%) and agrees with the welding engineer — more current, more strength, about 0.012 kN per amp. Drop the derived term and report the two settings ✅ · C. Both models are unusable: model A's VIFs exceed 10 and model B has too few terms to describe a weld, so the study has to be repeated on more coupons with voltage recorded as well. · D. Keep model A and interpret heat input only, ignoring the two terms it is built from. Heat input is the physical quantity that melts the metal, it is the only term below 0.01, and its coefficient of 0.412 kN is the effect to report once current and travel speed are held where the fit puts them; reporting the ingredients beside it would count the same energy twice and invite the sponsor to add up three effects that overlap.
`[D · B4 · Analyze · MFG · X · CERT]` — A derived variable fitted alongside its own components is perfect collinearity in all but name, and the sign flip is the symptom; D is the sophisticated error, because heat input's coefficient in model A is conditional on the very terms it contains, and no operator sets heat input directly.

**D27.** A candidate's A4 table reads: "Tested and not verified — agent tenure (p = 0.31); agent training hours (p = 0.24)." The two correlate at 0.92 because training hours accrue with tenure; their VIFs are 6.8 and 6.9. Either one fitted alone reaches p < 0.001.
A. Accept the entry: both terms were tested, both failed to reach p = 0.05, and that is exactly what A4 records — the next team will see that tenure and training hours were looked at and can spend its time elsewhere, which is the whole purpose of the table, and neither VIF reaches 7, so nothing in the output flags a problem either. · B. Require the candidate to keep whichever term has the lower p-value and drop the other, so that one readable coefficient survives instead of two unreadable ones. · C. Require a stepwise run to decide which of the two belongs in the model, letting the data rather than the candidate choose between terms carrying the same information. · D. Reject the entry: the two terms carry the same information, so the fit divided one effect and made both look inert. Experience does matter — either term alone is below 0.001 — and what the data cannot say is which of the two does the work. A4 must record that, not "not verified" ✅
`[D · B4 · Analyze · TXN · S · CERT]` — "Not verified" and "cannot be separated" are different findings and only one of them is true here; A takes two p-values at face value without asking why two strongly related variables both vanished.

**D28.** Ward length of stay (days) for 168 stays, with selected correlations.

```
Regression Analysis: ward_los_days versus age_y, comorbidity_count, admit_acuity,
                     home_support_score, distance_km                  N = 168

Term                       Coef     SE Coef       T       P     VIF
Constant                2.41500    0.91200    2.65   0.009
age_y                   0.01850    0.00612    3.02   0.003    1.42
comorbidity_count       0.48200    0.15600    3.09   0.002    7.90
admit_acuity            0.61500    0.19800    3.11   0.002    8.10
home_support_score     -0.72400    0.11500   -6.30   0.000    1.18
distance_km             0.00420    0.00385    1.09   0.277    1.05

S = 1.94   R-Sq = 62.4%   R-Sq(adj) = 61.2%
Correlations: comorbidity_count & admit_acuity 0.93; age_y & comorbidity_count 0.43;
              home_support_score & age_y -0.31
```

What needs attention before any coefficient is quoted:
A. `distance_km` carries the highest p-value at 0.277 and should be dropped first, since a term that fails on 168 stays adds noise to every other estimate in the table and widens the intervals the discharge team will be quoted. · B. Every VIF is below 10, the threshold the module gives, so no collinearity action is needed and the table can be reported as it stands — five terms, four of them significant, on a model whose R-sq is 62.4%. · C. Comorbidity count and admit acuity overlap (r = 0.93, VIF near 8), so their two coefficients divide one clinical fact and neither should be quoted as a separate lever — report them as one burden-of-illness effect, or keep the one recorded reliably at admission and say which. Home support (VIF 1.18, about 0.72 fewer days per point) is the term the discharge team can act on ✅ · D. The model is missing the comorbidity-by-acuity interaction, which is what a correlation of 0.93 between them indicates: two predictors moving together that closely are acting jointly on length of stay, so the product term belongs in the model, its absence is why both coefficients look smaller than they should, and adding it with both parents kept will settle the VIFs.
`[D · B4 · Analyze · HC · X · CERT]` — Ten is a rule of thumb, not a boundary, and a VIF near 8 on a pair correlated at 0.93 already makes each coefficient unreadable; D confuses correlation between two predictors with an interaction between them, which is a statement about their joint effect on Y.

**D29.** A plating line's two settings have always moved together.

```
  bath_temp_C     set by the recipe; ran 52-58 C over 18 months
  dwell_time_s    set by the same recipe; fell from 95 s to 78 s over the same period
  Correlation across the same 18 months of production history: -0.97
Candidate model of coating_thickness_um with both terms: VIF 17.8 and 17.6
Proposal on the table: extract another 12 months of history (about 9,000 more parts)
to bring the standard errors down
```

Your advice to the team:
A. Accept the proposal: more observations always narrow a standard error, and 9,000 further parts is a large enough addition that both coefficients should become readable even at a VIF near 18. · B. Reject it: another 12 months of the same recipe repeats the same pairing, so the correlation and the VIFs stay where they are. Separating the two means moving them independently — a two-factor experiment at four corner settings with a few parts per corner, which the line can run inside one shift and which Module 5 designs ✅ · C. Accept it, but drop one term so that the extra data estimate the survivor precisely, which is the most the line's history can support. · D. Reject it and use principal components instead, which removes the collinearity mathematically: the first component carries nearly all the movement in the pair, it can be fitted with a VIF of 1, and no new data are needed at all — the 18 months already extracted are enough once the two settings are replaced by the component they share.
`[D · B4 · Evaluate · MFG · S · CERT]` — More data from the same pairing adds rows but no independent movement, which is the only thing that separates two collinear levers; D removes the collinearity and the interpretability together, leaving components no operator can set.

**D30.** A model reports a VIF of 14 on one term. Which situation does **not** call for action on that VIF?
A. The process owner wants to know how much of the joint effect belongs to that term rather than to its partner, and how much of the budget to put behind each of them. · B. The team intends to change that setting and predict the result at the new level. · C. The model is used only to predict Y inside the range the data already cover, and no one will read or act on an individual coefficient ✅ · D. The term will appear in the A2 record as a verified cause, with its interval and its estimate in the process's own units.
`[D · B4 · Understand · NEU · K · CERT]` — Collinearity damages statements about single levers, not prediction inside the data's own range; D is the clearest call for action, because A2 is precisely the claim a VIF of 14 cannot support.

**D31.** Two levers in a collections process — reminder contacts per account and days to first contact — correlate at −0.93 across eleven months of history; VIF 8.4 each. Together they are worth about nine days of collection time; individually neither coefficient is readable. The sponsor asks, "Which one do we fund?"
A. "Reminder contacts — it has the lower p-value of the two, so it is the one eleven months of history supports best, and it is also the cheaper of the two to change: adding a contact costs a template, while moving the first-contact date moves the whole collections calendar." · B. "Neither. With VIFs of 8.4 the two coefficients are too imprecise to read, and a lever we cannot size is a lever we cannot fund. Eleven months is the most complete record we have and it does not support a claim about either contact rule, so the honest answer is that collections has no driver we can put money behind this year." · C. "Both, funded in proportion to their coefficients, which is how the nine days divides between them on the evidence we hold — that way neither is starved and the split can be revised once a quarter of new data is in." · D. "The history cannot tell them apart, because we have never varied them separately — whenever we contacted early we also contacted often. Together they are worth about nine days. To fund one, we run four weeks on matched account groups, early-and-few against late-and-many; that costs one analyst's month and answers what eleven months of history cannot." ✅
`[D · B4 · Evaluate · TXN · S · CERT]` — The sponsor gets the joint effect, the reason the split is unknown, and a priced way to find out; B reports the two individual p-values as if they were the answer and throws away a nine-day effect the data does establish.

**D32.** A discharge-timeliness team offered fourteen columns from the electronic record to stepwise selection. The candidate brings both models to the week 7 checkpoint.

```
Stepwise, final model                                            N = 310
Term                        Coef     SE Coef       T       P
Constant                 1.84200    0.41500    4.44   0.000
notes_count              0.08150    0.00612   13.32   0.000
consults                 0.51200    0.10850    4.72   0.000
labs_ordered             0.02140    0.00615    3.48   0.001
weekend_admit (1 = yes)  0.41800    0.19200    2.18   0.030
S = 1.62   R-Sq = 61.2%   R-Sq(adj) = 60.7%

Pre-specified model from the A1 cause structure                  N = 310
Term                              Coef     SE Coef       T       P
Constant                       3.21500    0.23800   13.51   0.000
consults                       0.61800    0.11200    5.52   0.000
home_o2_needed (1 = yes)       1.18500    0.24100    4.92   0.000
placement_required (1 = yes)   2.84000    0.31500    9.02   0.000
S = 1.94   R-Sq = 44.1%   R-Sq(adj) = 43.6%

Data dictionary: notes_count = nursing notes filed during the stay;
labs_ordered = laboratory tests ordered during the stay
```

The reviewer's judgment for A2:
A. The stepwise model: higher R-sq and adjusted R-sq, every term significant, and the search looked at all fourteen columns rather than only the ones the team thought of. · B. The pre-specified model earns A2. Notes and labs accumulate because a stay is long — they are consequences, which is why R-sq is 17 points higher and why the search found them first. Every term in the pre-specified model is something a discharge team can act on, and its p-values mean what they say because the model was not chosen on this sample ✅ · C. Neither; run best subsets on all fourteen columns and take the model with the lowest Mallows' Cp, which penalises extra terms and so corrects for the size of the search. · D. Combine them: keep the pre-specified terms and add the stepwise terms that survive alongside them. That gives the sponsor the levers a discharge team can act on and the best fit 310 stays can produce, every term in the combined table clears 0.05, and R-sq lands above either model on its own — the version that earns A2 and predicts best at the same time.
`[D · B4 · Evaluate · HC · X · CERT]` — A search maximizes fit on the sample at hand and reports p-values that do not know a search happened, and here it found two consequences of the response; D looks like a compromise but imports the same two consequence terms and the same uncorrected p-values.

**D33.** "The model is specified before it is fitted." What that rule protects against:
A. software defaults that centre predictors, or drop rows with one missing value, without being asked · B. a reviewer's objection that the model carries too many terms for the number of observations behind it · C. the risk that a residual plot fails after the model has been chosen, which would leave the team re-specifying with the fitted results already in front of them and no way to show the second choice was made innocently · D. reporting p-values that do not account for the search: with ten candidate X's and no cause structure, two or three clear p < 0.05 by chance alone, and nothing in the output shows that a search took place ✅
`[D · B4 · Understand · NEU · K · CERT]` — The damage is to the meaning of every p-value in the final table, which is invisible in the output; C names a real event but one that is handled by changing the model for a stated reason, which the rule explicitly allows.

**D34.** A candidate screened the eleven columns the maintenance extract carried against press downtime. One term — `ambient_temp_C` — reaches p = 0.031 and lifts R-sq from 0.58 to 0.61. The candidate cannot say what the term is doing, and it was not in the cause structure. Your guidance:
A. Leave it out and record it in A4 as tested with its estimate and interval. A p-value is the only argument for it, nobody can tell the process owner what it means, and one term at p = 0.031 out of eleven candidates is what chance produces ✅ · B. Keep it: p = 0.031 is below 0.05 and R-sq rose by three points, which is what a term has to do to earn its place in a model. · C. Keep it and interpret it as a proxy for seasonal effects, which is a reasonable physical story — presses run hotter in summer, hydraulic oil thins, seals leak and downtime follows. The mechanism is ordinary enough to put in the record beside the coefficient and its interval. · D. Keep it but report it with a wider interval to reflect that it was unexpected, so the record carries both the estimate and the uncertainty about why the term is there.
`[D · B4 · Evaluate · MFG · S · CERT]` — "When NOT to add a term" begins with a term whose only argument is its p-value and whose meaning nobody can state; C invents a mechanism after the fact, which is the same error dressed as physics.

**D35.** Module 4's rule is that a model is specified before it is fitted. Inside that rule, adjusted R-sq and Mallows' Cp are properly used to:
A. search a set of candidate predictors for the best-fitting model: adjusted R-sq rewards a term only when it earns its degree of freedom and Cp penalises an over-fitted subset, which is what best-subsets output ranks candidate models on · B. decide whether an individual coefficient is significant, since both statistics respond to whether a term earns the degree of freedom it costs · C. compare two models that were each specified in advance for stated reasons — a different act from searching, since neither statistic knows or corrects for how many models were tried ✅ · D. confirm that the residual assumptions hold before any coefficient is read, since both statistics move when the fit is wrong
`[D · B4 · Understand · NEU · K · CERT]` — Both statistics penalize complexity but neither penalizes selection, which is the harm stepwise does; A is exactly how the two are misused in practice, and the penalty for extra terms is what makes the misuse look principled.

**D36.** A candidate's surface-finish model keeps the speed-by-feed interaction (p = 0.004) but drops the feed main effect, which reached only p = 0.21. Your guidance:
A. Correct as it stands: a term at p = 0.21 adds noise without adding information, and the interaction it sits in reaches 0.004 on its own. · B. Put feed back. An interaction keeps its parent terms, because without them the interaction is estimated against a model asserting that feed does nothing, and the fitted surface no longer passes through the data's own averages. Report feed with its interval and say it is small alone and matters through the interaction ✅ · C. Drop the interaction too, so that the model holds only terms below 0.05 and every coefficient in it is one the data establish. · D. Keep the interaction and replace feed with feed squared, which is the stronger term: curvature in feed is what the linear main effect was failing to pick up, the squared term will reach significance where the linear one did not, and the interaction still has a feed parent in the model — hierarchy satisfied at a lower p-value.
`[D · B4 · Apply · MFG · S · CERT]` — Hierarchy is the same rule Module 5 applies to factorial models, and a parent term stays whatever its p-value; C answers a question about structure by deleting the finding.

**D37.** Adding `branch_footfall` to a model of counter service time flips `queue_length` from +0.42 to −0.18 minutes per person waiting. Footfall and queue length correlate at 0.88.
A. Do not add it. A term whose only visible effect is to reverse a coefficient you can explain is a collinearity symptom, not a finding — a longer queue does not make service faster. Keep the model that matches the mechanism, and record footfall as tested and rejected with the reason and the correlation ✅ · B. Add it: R-sq rose, the term is significant, and the data are to be believed over anyone's intuition about how a counter behaves when the branch is busy. · C. Add it and report the negative coefficient with a note that it is counter-intuitive. The data are what they are, the term improved the fit, and flagging a sign we cannot explain is more honest than suppressing a result — the reader can weigh it. Two correlated predictors are ordinary in service data, and the model predicts better with both in it. · D. Add it and drop queue length, keeping whichever of the two has the smaller p-value, so that one readable term carries the crowding effect into the control plan.
`[D · B4 · Evaluate · TXN · S · CERT]` — Two predictors correlated at 0.88 cannot both be read, and the sign flip is the warning; C reports a number the candidate knows to be physically wrong, which is worse than not reporting it.

**D38.** A candidate's A4 table arrives in this state.

```
Draft A4 - "Tested and not verified"
| Term tested                 | Result                     |
| shift (day / night)         | p = 0.62, not significant  |
| admitting service           | p = 0.41, not significant  |
| transport team staffing     | p = 0.08, not significant  |
```

The correction the reviewer requires:
A. Accept it: A4 asks for what did not verify, and that is what the table lists — three terms tested, three p-values above 0.05, and a reviewer can see at a glance where the team looked and stopped. · B. Remove the transport row; at 0.08 it is close enough to 0.05 to be reported as a finding instead, and a staffing effect the team can act on should not be buried in a table of things that did not work. · C. Require an effect estimate, its interval and the observations behind each row. "Night shift 4 min slower, 95% CI −9 to +17 min, 38 discharges" rules almost nothing out; "night shift 1 min slower, CI −3 to +5, 420 discharges" rules out anything worth acting on. A p-value alone cannot tell those apart, and A4 exists so that the next team knows which it was ✅ · D. Require the three terms to be re-tested one-sided, which has more power at the same sample size: the team expected each of the three to lengthen discharge, a one-sided test is the correct alternative for a directional hypothesis, and transport staffing at 0.08 two-sided clears 0.05 one-sided without one extra observation being collected.
`[D · B4 · Apply · HC · S · CERT]` — "Not verified" is only useful when it says how much was ruled out, which takes an interval and a sample size; B treats a threshold as a sliding scale and turns an inconclusive row into a claim.

**D39.** Started applications for a business account: a random sample of 520 from the roughly 4,100 the channel starts in a quarter, each recorded as abandoned before submission or not. The digital lead asks what to change.

```
Binary Logistic Regression: abandoned versus form_fields, wait_days, prefilled
N = 520     Events (abandoned) = 130     Non-events = 390

Term                       Coef   SE Coef       Z       P   Odds ratio    95% CI
Constant                -4.1040    0.4550   -9.02   0.000
form_fields              0.0864    0.0171    5.05   0.000     1.09     (1.05, 1.13)
wait_days                0.3120    0.0614    5.08   0.000     1.37     (1.21, 1.54)
prefilled (1 = yes)     -0.9163    0.2214   -4.14   0.000     0.40     (0.26, 0.62)

Test that all slopes are zero: G = 71.4, DF = 3, P < 0.001
Goodness of fit: Hosmer-Lemeshow chi-square = 6.82, DF = 8, P = 0.556
Events per predictor: 43

Predicted probability of abandonment
  28 fields, 2-day document wait, not pre-filled    0.257     pre-filled   0.122
  42 fields, 2-day document wait, not pre-filled    0.537
  28 fields, 6-day document wait, not pre-filled    0.547
```

The sponsor sentence:
A. "Form length, document wait and pre-filling all reach p < 0.001 on 520 applications, so all three drive abandonment and all three belong in the redesign brief; the three odds ratios are the sizes to quote when the work is prioritised." · B. "On today's 28-field form with a two-day document wait, about a quarter of started applications are abandoned. Pre-filling what we already hold cuts that to about 12% at the same length — the single biggest move. Each extra field multiplies the odds by about 1.09, so the 42-field commercial form sits near 54%, and each day of document wait multiplies them by about 1.37. Pre-fill first, then cut fields; the wait belongs to the credit team." ✅ · C. "Pre-filling reduces abandonment by 60%, which is what an odds ratio of 0.40 means: four abandonments where we would otherwise have had ten." · D. "The three odds ratios — 1.09 per field, 1.37 per day of document wait and 0.40 for pre-filling — are the effects to report. An odds ratio is the one figure that stays the same wherever the abandonment rate sits, so it travels from this quarter to the next and from the 28-field form to the 42-field one. Probabilities would tie the report to one form length and have to be recomputed every time the form changed, which is how a reported number goes stale."
`[D · B4 · Analyze · TXN · X · CERT]` — Probabilities at settings the lead recognises, an order of work and an owner for what the team cannot change; C converts an odds ratio straight into a percentage reduction in the rate, which only holds when the event is rare and here overstates the gain.

**D40.** An odds ratio of 1.5 on a binary outcome means:
A. the probability of the event is 1.5 times higher per unit of X — a 5% event becomes 7.5% and a 50% event becomes 75% — which is why an odds ratio can be read straight across as a relative risk once the software has printed it, with no base rate needed · B. the event happens 50% more often per unit of X, whatever rate it starts from, which is what makes an odds ratio portable from one process to another · C. the risk rises by 50 percentage points per unit of X, so a 5% event becomes 55% and a 50% event reaches the point of happening every time · D. the odds, p ÷ (1 − p), multiply by 1.5 per unit of X — which moves a 5% event to about 7% and a 50% event to 60%; how much the probability moves depends on where it starts, which is why the report quotes probabilities at named settings ✅
`[D · B4 · Understand · NEU · K · CERT]` — Odds ratios are constant and probability changes are not, so the translation is the whole reporting step; A and B are the same error stated two ways and are close to true only when the event is rare.

**D41.** Castings scrapped at final inspection (yes/no) for 380 pours across two shifts. A supervisor reads the output and says, "Night shift doubles our scrap."

```
Binary Logistic Regression: scrap versus pour_temp_C, cycle_s, night_shift
N = 380     Events (scrap) = 152     Non-events = 228

Term                       Coef   SE Coef       Z       P   Odds ratio    95% CI
Constant                39.0700    8.1200    4.81   0.000
pour_temp_C             -0.02880   0.00670   -4.30   0.000     0.97     (0.96, 0.98)
cycle_s                  0.02040   0.00490    4.16   0.000     1.02     (1.01, 1.03)
night_shift (1 = yes)    0.6931    0.1985    3.49   0.000     2.00     (1.36, 2.95)

Test that all slopes are zero: G = 49.6, DF = 3, P < 0.001
Goodness of fit: Hosmer-Lemeshow chi-square = 11.2, DF = 8, P = 0.191
Events per predictor: 51

Predicted probability of scrap (at cycle_s = 72, the line's normal setting)
  1420 C, day 0.412   night 0.583        1440 C, day 0.282   night 0.440
```

The correct correction:
A. "Night shift doubles the odds, not the rate. At the 1420 °C and 72-second settings the line normally runs, day-shift scrap is about 41% and night about 58% — a rise of 17 percentage points, real and worth acting on, but not a doubling. Read as a rate it overstates the gap by about 24 points of scrap." ✅ · B. "Correct: an odds ratio of 2.00 is twice the scrap on nights, on 380 pours with every term below 0.001 and the predicted probabilities in the output to back it up." · C. "Incorrect: with P = 0.000 the effect is established, but the size of it cannot be quoted from an odds ratio without a day-shift rate to apply it to, so the supervisor should be given the odds ratio and nothing further." · D. "Incorrect: the night-shift effect is confounded with pour temperature and cannot be reported at all. Nights run cooler — that is why the temperature term is in the model — so the 2.00 is carrying a temperature difference the model has only partly adjusted for, and the honest answer to the supervisor is that shift and temperature cannot be separated in production data."
`[D · B4 · Evaluate · MFG · X · CERT]` — At a 41% base rate the odds ratio and the rate ratio are far apart, and the correction has to give the supervisor the right number, not just the objection; C refuses a translation the output's own predicted probabilities have already made.

**D42.** Thirty-day readmissions after discharge from a medical unit, 640 discharges.

```
Binary Logistic Regression: readmit_30d versus meds_at_discharge, prior_admits_12m,
                            followup_booked
N = 640     Events (readmitted) = 96     Non-events = 544

Term                          Coef   SE Coef       Z       P   Odds ratio    95% CI
Constant                   -2.7070    0.3620   -7.48   0.000
meds_at_discharge           0.1182    0.0312    3.79   0.000     1.13     (1.06, 1.20)
prior_admits_12m            0.4055    0.0918    4.42   0.000     1.50     (1.25, 1.80)
followup_booked (1 = yes)  -0.6931    0.2240   -3.09   0.002     0.50     (0.32, 0.78)

Test that all slopes are zero: G = 44.8, DF = 3, P < 0.001
Goodness of fit: Hosmer-Lemeshow chi-square = 11.2, DF = 8, P = 0.191
Events per predictor: 32

Predicted probability of 30-day readmission
  8 meds, 0 prior admissions, follow-up not booked   0.147     booked   0.079
  14 meds, 2 prior admissions, follow-up not booked  0.440     booked   0.282
```

The sponsor sentence:
A. "All three terms reach significance on 640 discharges, so all three belong in the discharge bundle: fewer medications at discharge, attention to patients with prior admissions, and a booked follow-up. The model is checked — 32 events per predictor, Hosmer-Lemeshow at P = 0.191 — so the bundle can be written straight off the table." · B. "Booking follow-up halves readmission, which is what an odds ratio of 0.50 means — one readmission avoided for every two that would otherwise have happened. On 96 readmissions a year that is about 48 avoided, which is the figure to take to the quality committee." · C. "For a patient leaving on eight medications with no admission in the past year, booking the follow-up before discharge takes the 30-day readmission chance from about 15% to about 8%. For a higher-risk patient — fourteen medications, two prior admissions — from about 44% to about 28%. Each prior admission multiplies the odds by 1.5 and each medication by 1.13. Booking is the one thing we control at discharge, and it is worth most in absolute terms to the higher-risk patients, which is where to start." ✅ · D. "The Hosmer-Lemeshow p-value of 0.191 shows the model fits, so the three odds ratios can be reported as they stand: 1.13 per medication, 1.50 per prior admission, 0.50 for a booked follow-up. With 32 events per predictor and the slopes test below 0.001 there is nothing left to check, and odds ratios are what the readmission literature reports, so they are what the bundle should be written against and what the next unit can compare itself with."
`[D · B4 · Analyze · HC · X · CERT]` — Two named patients, absolute probabilities, and the lever ranked by where it pays; B halves the odds and the rate as if they were the same, which passes unnoticed at 15% (7.5% against the model's 7.9%) and is wrong by 6 points at 44%, where halving the rate gives 22% against the model's 28%.

**D43.** A candidate offers this output as the A2 exhibit for a central-line infection project.

```
Binary Logistic Regression: line_infection versus dwell_d, lumens, site,
                            insert_setting, anticoag
N = 210     Events (infection) = 14     Non-events = 196

Term                          Coef   SE Coef       Z       P   Odds ratio    95% CI
Constant                   -6.0340    3.1180   -1.94   0.053
dwell_d                     0.1840    0.0961    1.91   0.056     1.20     (1.00, 1.45)
lumens                      0.8712    0.6215    1.40   0.161     2.39     (0.71, 8.08)
site (1 = femoral)          1.4816    1.0214    1.45   0.147     4.40     (0.59, 32.57)
insert_setting (1 = ward)   0.9821    0.9982    0.98   0.325     2.67     (0.38, 18.89)
anticoag (1 = yes)         -0.4108    0.8815   -0.47   0.641     0.66     (0.12, 3.73)

Test that all slopes are zero: G = 9.2, DF = 5, P = 0.101
Goodness of fit: Hosmer-Lemeshow chi-square = 5.2, DF = 8, P = 0.736
Events per predictor: 2.8
```

The reviewer of record's verdict:
A. Accept: the model is complete, the Hosmer-Lemeshow p-value of 0.736 shows no misfit, and dwell days is all but significant at 0.056 with an odds ratio of 1.20 — a 20% rise in infection odds per day of dwell is a finding the unit can act on, and the other four terms record what was tested and did not verify. Rejecting the exhibit for wide intervals would leave the project with no A2 at all. · B. Accept, with the femoral-site odds ratio of 4.4 highlighted as the largest effect found and the one to take to the insertion-practice group: a four-fold difference between sites is the kind of gap a practice change can close, and the interval is wide only because line infections are rare. · C. Reject and require stepwise selection to cut five predictors down to the ones that matter, so that 14 events are spent on two or three terms rather than five and the surviving intervals are narrow enough to read. · D. Reject: 14 events across five predictors is under three per predictor against a minimum of ten, the model as a whole is not established (G = 9.2, P = 0.101), and the intervals say so — femoral site runs from 0.59 to 32.6. A goodness-of-fit test on 14 events cannot detect misfit, so its large p-value is not evidence of fit. Compare two groups on the data that exist and state how many events a five-term model would need ✅
`[D · B4 · Evaluate · HC · X · CERT]` — Events per predictor is the gate, and every interval here spans "protective" to "four-fold"; A mistakes a powerless test's large p-value for a passing grade, which is the specific misreading the Hosmer-Lemeshow test invites.

**D44.** A binary logistic model reports Hosmer-Lemeshow chi-square 6.8 on 8 degrees of freedom, P = 0.56. The correct reading:
A. The model fits well and accounts for 56% of the variation in the outcome, in the way R-sq does for a linear model — the closer the value sits to 1, the better the grouped predictions match the observed events, and 0.56 is adequate. · B. There is no evidence of misfit when observations are grouped by predicted probability and observed events compared with expected — which is not the same as evidence of fit, and on a small number of events the test has little power to find misfit at all ✅ · C. 56% of observations fall in the decile their predicted probability puts them in, which is the agreement the test measures. · D. The model's predictions are right 56% of the time, which is the accuracy to report beside the odds ratios.
`[D · B4 · Understand · NEU · K · CERT]` — Every goodness-of-fit test screens for a discrepancy and a large p-value means none was detected, which depends on how much power there was to detect one; A converts a p-value into a share of explained variation, which no fit test reports.

**D45.** Leak at final test (yes/no) for 640 assemblies.

```
Binary Logistic Regression: leak versus torque_Nm, gasket_lot_age_d, fixture
N = 640     Events (leak) = 96     Non-events = 544

Term                       Coef   SE Coef       Z       P   Odds ratio    95% CI
Constant                 3.8120    1.2140    3.14   0.002
torque_Nm               -0.1842    0.0402   -4.58   0.000     0.83     (0.77, 0.90)
gasket_lot_age_d         0.0284    0.0086    3.30   0.001     1.03     (1.01, 1.05)
fixture (1 = B)          0.5108    0.2180    2.34   0.019     1.67     (1.09, 2.56)

Test that all slopes are zero: G = 38.2, DF = 3, P < 0.001
Goodness of fit: Hosmer-Lemeshow chi-square = 25.6, DF = 8, P = 0.001
Events per predictor: 32

Observed and expected leaks by decile of predicted probability
  Decile    N    Observed   Expected        Decile    N    Observed   Expected
     1     64        1         1.3             6      64        8         8.9
     2     64        2         2.4             7      64        9        11.6
     3     64        6         3.5             8      64       14        15.0
     4     64       11         4.8             9      64       16        19.4
     5     64       14         6.6            10      64       15        22.5
```

The correct reading:
A. The model is sound: all three terms are significant, the slopes test is below 0.001, and 32 events per predictor clears the ten-per-predictor rule with room to spare. · B. Drop the deciles where observed and expected disagree and refit on the remainder, which is the range where the model already describes the process. · C. The model misfits in a readable pattern — it under-predicts leaks in deciles 3 to 5 (31 observed against about 15 expected) and over-predicts in 9 and 10 (31 against about 42), so its probability curve is too flat. Plot residuals against torque, try a torque-by-fixture interaction or a squared torque term named in advance, and quote no probability at a named setting until the pattern closes ✅ · D. The Hosmer-Lemeshow test is unreliable and can be set aside whenever every coefficient is significant: it is sensitive to how the deciles are cut, a different grouping gives a different p-value, and with all three terms below 0.02 and the slopes test below 0.001 the terms are established. The decile table is a diagnostic, not a verdict, and the coefficients are what the control plan will use.
`[D · B4 · Analyze · MFG · X · CERT]` — Significant coefficients and a misfitting curve coexist easily, and the decile table says where the curve is wrong; D discards the only check in the output that looks at the predictions rather than the terms.

**D46.** A candidate proposes to model whether a quote breached the service standard.

```
Proposed model
  Y  = late_flag: 1 if the quote took more than 40 working hours, 0 otherwise
       (40 h is the published service standard)
  Also in the same extract: quote_cycle_h, recorded to 0.1 h, for all 185 quotes
  Observed: 51 late, 134 on time
  X's = pages, options, rep_exp_m, backlog
```

The reviewer's advice:
A. Model the hours, not the flag. The extract already holds cycle time to a tenth of an hour, and cutting at 40 h makes 41 h and 140 h the same observation, and 39 h and 4 h the same observation. Fit the continuous model — on a log scale if the residuals funnel — and then read the late rate off the fitted model or off the capability statement if the sponsor wants it ✅ · B. Use logistic regression: a yes/no service standard is a yes/no outcome, 51 events across four predictors clears the ten-per-predictor rule, and the sponsor's question — what makes a quote breach the standard — is a question about the flag rather than about hours. The published standard is what the business manages to, so the model should be fitted on the thing the business actually reports. · C. Fit both and report whichever has the better fit statistics on these 185 quotes, since the two models answer the same question and the data can decide between them. · D. Use logistic regression but move the cut to the median, which balances events against non-events and so maximizes the power of the test at this sample size.
`[D · B4 · Evaluate · TXN · S · CERT]` — Binning a measured response throws away most of what was measured, and the late rate is recoverable from the continuous model anyway; D optimizes the power of an analysis that should not be run, which is the more sophisticated version of the same loss.

**D47.** A binary logistic model reports a pseudo-R-sq of 0.14. The correct use of that number:
A. Treat it as close to uninformative: pseudo-R-sq runs low for logistic models by construction, so the model is judged on its coefficients and intervals, its goodness-of-fit check, its events per predictor and how well its predicted probabilities separate the two outcomes ✅ · B. Reject the model; 0.14 is far below the 0.6 a usable model needs, and a fit that leaves seven-eighths of the outcome unexplained cannot support a countermeasure or a control plan whatever its individual coefficients say — collect better predictors and refit. · C. Read it as 14% of the outcome explained, the meaning R-sq carries in linear regression, and report it beside the odds ratios so the sponsor can see how much of the outcome the model captures. · D. Compare it with the R-sq of a linear model on the same data and keep whichever of the two is higher.
`[D · B4 · Understand · NEU · K · CERT]` — Pseudo-R-sq is not a share of variance and has no threshold, so it decides nothing; C is the assumption behind both B and D and is what makes candidates discard sound logistic models.

**D48.** A candidate proposes a logistic model of incomplete discharge summaries.

```
Proposed model
  Y  = discharge_summary_incomplete (yes/no), judged by the ward clerk at filing
  X's = discharging_service, weekend, resident_grade, summaries_pending

Module 2 attribute agreement study (3 clerks x 60 records x 2 repeats, expert standard)
  Within-appraiser agreement       96%, 93%, 97%
  Each appraiser versus standard   kappa 0.44, 0.38, 0.41
  Prevalence in the study set      14% incomplete
```

The reviewer's decision:
A. Proceed: within-appraiser agreement above 90% is the threshold that matters for a binary judgment, and all three clerks clear it. · B. Proceed, and add clerk as a predictor so that the disagreement between the three is modeled rather than left in the response. · C. Proceed, but report only the odds ratios whose intervals exclude 1, since measurement error in the response widens the others honestly: the terms that survive misclassification are the strong ones, the weak ones were never going to carry a countermeasure, and the kappa problem then costs the model nothing it needed. · D. Do not fit it: at kappa near 0.4 against the standard the clerks are not reliably identifying incomplete summaries, so the model would describe the clerks. High self-agreement on a population that is 86% "complete" is inflated by prevalence, not evidence of accuracy. Repair the operational definition, re-run the study, then model ✅
`[D · B4 · Evaluate · HC · S · CERT]` — Repeatability without agreement to the standard is consistency in being wrong, and a skewed population inflates raw agreement; B adds the source of the error to the model instead of removing it, which changes nothing about the response being misclassified.

**D49.** Out-of-spec parts (yes/no) for 300 mouldings, the same model fitted twice.

```
Binary Logistic Regression: out_of_spec versus press_pressure_bar, dwell_s
N = 300     Events = 66     Non-events = 234

As fitted on the raw scales
Term                       Coef   SE Coef       Z       P   Odds ratio    95% CI
Constant                16.6760    3.8400    4.34   0.000
press_pressure_bar      -0.1620    0.0362   -4.48   0.000     0.85     (0.79, 0.91)
dwell_s                 -0.0845    0.0214   -3.95   0.000     0.92     (0.88, 0.96)

The same model with pressure centred at 105 bar and dwell centred at 12 s
Term                       Coef   SE Coef       Z       P   Odds ratio    95% CI
Constant                -1.3480    0.1520   -8.87   0.000
press_c                 -0.1620    0.0362   -4.48   0.000     0.85     (0.79, 0.91)
dwell_c                 -0.0845    0.0214   -3.95   0.000     0.92     (0.88, 0.96)

Predicted probability of an out-of-spec part
  105 bar, 12 s   0.206        112 bar, 12 s   0.077
   98 bar, 12 s   0.447        105 bar, 16 s   0.156
```

What the pair of outputs shows, and what to report:
A. The two models disagree, so one of them is misspecified and both need refitting. A constant of 16.68 in one table and −1.348 in the other cannot both describe the same 300 mouldings, the predicted probabilities were computed from one of the two, and until it is clear which fit produced them no odds ratio here belongs in an A2 exhibit. Refit once, from the raw scales, and report a single table. · B. Centring moves the constant and nothing else: −1.348 is the log-odds at 105 bar and 12 s, which is about a 21% chance of an out-of-spec part at the line's normal settings, while every odds ratio, standard error and p-value is unchanged. Report the centred model with the probabilities, because a raw constant of 16.68 is the log-odds at 0 bar and 0 seconds — a setting that does not exist ✅ · C. The raw model is preferable: its constant is positive and significant at Z = 4.34, which says the model has something to explain before either setting is entered, and moving the reference to 105 bar and 12 s is a presentational choice rather than a result. · D. Centring changes the odds ratios, so the two sets should be averaged before reporting — the raw fit carries the scale the press is set in, the centred fit the scale the sponsor reads.
`[D · B4 · Apply · MFG · X · CERT]` — Centring re-expresses the intercept at a setting people recognise and leaves the slopes alone, which is what makes the output readable; C reads the intercept's Z as if it measured anything about the process, when it only measures the distance from zero.

**D50.** A sponsor asks one question — "Which intake channel loses applications?" — and nobody has asked which other factors predict abandonment.

```
Abandonment rate by channel, last 12 weeks, all 4,120 started applications
  Channel              Started   Abandoned    Rate
  Branch tablet          1,180         71      6.0%
  Website (desktop)      1,640        158      9.6%
  Website (mobile)       1,020        347     34.0%
  Telephone                280         14      5.0%
Mobile volume is steady week to week and its rate has been 32-36% in each of the 12 weeks.
```

The Black Belt's next step:
A. Fit a logistic model with channel as a predictor, to establish that the difference is significant before anyone is asked to spend money on it. · B. Fit the model with channel plus the six other available predictors, to control for confounding before acting. Mobile users may be different people making different applications at different times, and a channel effect that survives adjustment is a channel effect while one that does not was never the channel at all — acting on an unadjusted rate is how a team ends up rebuilding a form for a population that was always going to abandon. · C. Do not model. One channel carries a rate three to six times the others, steadily, on about a thousand applications a week; a model would attach a p-value to what is already visible and would still not say why mobile abandons. Complete the form on a phone, session-record ten abandonments, and write the A3 paragraph saying the chart answered it ✅ · D. Run a chi-square test of channel against outcome, which is the correct test for two attributes and gives the p-value the sponsor will ask for.
`[D · B4 · Evaluate · TXN · S · CERT]` — When the graph answers the question, restraint is the scored deliverable and the next move is observation, not arithmetic; B is the most defensible wrong answer, but with a rate gap this size and this stable, confounding would have to be implausibly large to matter, and the model still would not name the cause.

**D51.** Rework at first inspection (yes/no) for 480 machined parts.

```
Binary Logistic Regression: rework versus coolant_age_wk, insert_lot, operator_new
N = 480     Events (rework) = 72     Non-events = 408

Term                       Coef   SE Coef       Z       P   Odds ratio    95% CI
Constant                -2.6420    0.3610   -7.32   0.000
coolant_age_wk           0.1140    0.0298    3.83   0.000     1.12     (1.06, 1.19)
insert_lot (1 = new)     0.4055    0.2650    1.53   0.126     1.50     (0.89, 2.52)
operator_new (1 = yes)   0.0198    0.2410    0.08   0.935     1.02     (0.64, 1.64)

Test that all slopes are zero: G = 17.8, DF = 3, P < 0.001
Goodness of fit: Hosmer-Lemeshow chi-square = 6.82, DF = 8, P = 0.556
Events per predictor: 24
```

What the insert-lot row supports:
A. The new insert lot raises the odds of rework by 50%; report it as a verified cause with its interval and take it to the supplier, since 1.50 is the largest effect in the table. · B. The new insert lot has no effect, since P = 0.126 is above 0.05 and 480 parts is a large enough sample to have found one. · C. Report the operator term as the second finding, since its odds ratio of 1.02 is closest to 1 and so the most precisely estimated of the three: a tight interval around no effect is the strongest statement the data make, it clears new operators of the rework the supervisor has been attributing to them, and it saves the next team from re-testing training. · D. The best estimate is a 50% rise in the odds of rework, but the interval runs from an 11% fall to a 2.5-fold rise, so the data neither confirm nor rule out an effect of practical size. Record it in A4 as tested and inconclusive with the interval, and plan a lot-controlled comparison. Coolant age is the verified term: about 12% more rework odds per week, 1.06 to 1.19 ✅
`[D · B4 · Analyze · MFG · X · CERT]` — An interval that spans "protective" and "half again as bad" is an inconclusive finding, which is not the same as no effect and not the same as a verified one; B reads a p-value above 0.05 as a demonstration of absence on an interval that plainly does not demonstrate it.

**D52.** The response is medication errors per 1,000 doses dispensed, recorded weekly for 80 weeks, with the doses dispensed varying week to week. The model family that fits this response:
A. binary logistic regression, since an error either happens on a dose or it does not, with the doses dispensed each week entered as a predictor to carry the varying volume · B. multiple linear regression on the raw weekly counts, since 80 weeks is a large sample and weekly totals are high enough for the errors to behave like a continuous response · C. a Poisson or negative-binomial regression on the count with doses dispensed as the exposure — a rate per opportunity is a count model, which a general linear model reaches through the same regression engine ✅ · D. two-way ANOVA with week as a factor and doses dispensed as a covariate, which adjusts the weekly rate for how much was dispensed
`[D · B4 · Understand · NEU · K · CERT]` — The response is a count with a varying denominator, which is what an exposure term is for; A would fit if each dose were a row, but the data are weekly totals and the varying denominator is exactly what logistic regression on weeks cannot carry.

**D53.** A logistic model of business-account application abandonment estimates that pre-filling data the bank already holds would take abandonment at the current 28-field form length from about 26% to about 12%. About 4,100 applications are started per quarter in that channel; Finance has agreed a basis of about $140 of lost margin per abandoned application. The pre-fill build is quoted at eleven developer-weeks. The sponsor asks whether to fund it.
A. "Yes — the odds ratio of 0.40 is the largest effect in the model, and pre-filling is the only one of the three levers the digital team owns outright, so it is the one to fund." · B. "On the model's estimate the pre-fill recovers about 14 points of abandonment on roughly 4,100 started applications a quarter — about 570 applications, near $80K a quarter at the $140 basis Finance agreed — against eleven developer-weeks. It is worth funding, and it is an estimate from history rather than a tested effect: build it for one channel first, measure four weeks against the unchanged channels, and let that decide the rest." ✅ · C. "No: the model is observational, so no estimate from it can support a funding decision — the pre-fill effect is an association read off a quarter's history, and eleven developer-weeks should not be committed on an association." · D. "Yes, and the $80K a quarter can go to Finance now as a validated hard saving: the basis is Finance's own $140, the volume is the channel's own, and the model's estimate is the best evidence anyone has. Booking it now puts the benefit in the quarter the work is funded, which is what the business case needs, and the figure can be trued up when the build lands."
`[D · B4 · Evaluate · TXN · S · CERT]` — The decision needs the effect in money on an agreed basis, the cost beside it, and a way to test the estimate before the whole build is committed; D books a benefit from an observational model before anything has been measured, which is the claim Finance rejects.

**D54.** Supplier-query resolution time (working hours, query logged to query answered) for two data vendors used by a reference-data team. About 260 queries a month are split roughly evenly between them.

```
Mann-Whitney Test and CI: query_resolution_h (vendor A) vs (vendor B)

Vendor    N   Median   Q1-Q3    Mean   Max
A        24     10.0    7-17     14.6    58
B        22     20.0   12-36     28.4    95
Both distributions right-skewed (AD on the raw data 0.61 and 0.72, P < 0.01).

Point estimate for B - A (Hodges-Lehmann): 9.0 h
95% CI for the difference: (3.0, 17.5)
W (vendor A) = 432.5     Test of A = B vs A not = B:  P = 0.004
(Welch t on the same data: difference of means 13.8 h, 95% CI (2.4, 25.1), P = 0.019)
```

The sponsor sentence:
A. "The two vendors differ at P = 0.004, which is well inside our threshold, so the difference is established and the contract review can proceed on that basis — the test is the finding and the medians in the table say which way it runs." · B. "Vendor B is 13.8 hours slower on average, 2.4 to 25.1 hours, and that is the number for the contract review: the mean is what multiplies out to total workload, it is in the units the contract is written in, and the test that produced it clears 0.05 on 46 queries." · C. "On a typical query vendor B takes about 9 more working hours than vendor A — plausibly 3 to 17. Both vendors have a few week-long queries, so we compared distributions rather than averages; the mean gap is wider, 13.8 hours, because B's tail is longer, and that is the figure for total workload. At about 130 queries each a month, the typical-query gap is roughly 1,170 working hours a month of waiting attributable to the vendor — before we know what in B's process causes it." ✅ · D. "The medians are 10 and 20 working hours, so vendor B takes exactly twice as long on a typical query. A doubling is the cleanest thing to put to a vendor: it comes straight from the two medians, it needs no statistical explanation in a contract review, it is conservative next to the gap in the means, and on about 130 queries a month it sizes the problem well enough to open the negotiation with."
`[D · B4 · Analyze · TXN · X · CERT]` — The shift estimate with its interval is the finding, the mean is named for the one question it answers better, and the total is stated on a basis; D reads two rounded medians as an exact ratio, which the interval on the shift does not support.

**D55.** A Mann-Whitney test compares two groups by replacing values with ranks. What it tests, and what it does not:
A. It asks whether values in one group tend to be larger than in the other, and with a Hodges-Lehmann shift estimate it gives the size of that tendency in the data's own units. It does not compare means, and where the two distributions have different shapes it responds to the shape difference as well as to location — which the report has to say ✅ · B. It tests whether the two medians are equal, under no assumptions at all, which is why it is the safe choice whenever a normal plot fails. · C. It tests whether the two groups have the same distribution: the null is that one sample could have come from the other, so a significant result means the two differ somewhere — in location, in spread or in shape — and the report cannot say which of the three it was without going back to the histograms, which is the price of a rank test. · D. It tests the means without assuming normality, which is why its confidence interval is for the difference of means and can be multiplied out to a monthly total.
`[D · B4 · Understand · NEU · K · CERT]` — Rank tests are about stochastic ordering and are read through the shift estimate, with the shape caveat stated; B is the common shorthand, and it fails on "no assumptions" — a clean median reading needs the two shapes to be similar.

**D56.** Rework time per casting (minutes) for three tooling suppliers, 18 castings each, all right-skewed.

```
Kruskal-Wallis Test: rework_min versus tooling_supplier

Supplier    N   Median   Ave Rank      Z
S1         18     14.5      17.8     -3.20
S2         18     20.5      30.6      1.02
S3         18     22.5      34.1      2.18
Overall    54               27.5
H = 10.71    DF = 2    P = 0.005

Pairwise Mann-Whitney with Hodges-Lehmann shift (three comparisons run)
  S2 - S1   +6 min   95% CI (2, 11)     P = 0.011
  S3 - S1   +8 min   95% CI (3, 13)     P = 0.003
  S3 - S2   +2 min   95% CI (-3, 8)     P = 0.457
```

The correct reading:
A. All three suppliers differ from each other, since H is significant at P = 0.005 across 54 castings — that is what an omnibus test on three groups establishes, and the three pairwise runs confirm the ordering the average ranks already showed. · B. The suppliers rank S1, S2, S3 from best to worst and should be scored in that order: the medians, the average ranks and the two shift estimates all put them in the same sequence, so the supplier scorecard can use it as it stands and the sourcing decision follows from it. · C. Nothing can be concluded, because three pairwise tests on the same data inflate the false-positive rate and no adjustment was applied to the three p-values reported, so any of the three could be the chance result. · D. S1 is clearly better than both others — about 6 and 8 minutes per casting, both intervals excluding zero — while S2 and S3 cannot be told apart on 18 castings each (+2 min, −3 to +8). Report that three comparisons were run, and treat S2 and S3 as one group until more castings say otherwise ✅
`[D · B4 · Analyze · MFG · X · CERT]` — Kruskal-Wallis says the groups are not all alike and the pairwise shifts say which, with the intervals deciding what is established; B reads an ordering of point estimates as an ordering of suppliers when one of the two gaps is indistinguishable from zero.

**D57.** Referral-to-appointment time (calendar days) at two clinics, 30 referrals each. The four longest waits in clinic 2 — 240, 310, 420 and 480 days — are genuine: three awaiting an out-of-area specialist, one patient who twice deferred. All are in scope and in the provenance record.

```
Clinic      N   Median   Q1-Q3    Mean   Max
1          30     27.5   21-51     40.9    128
2          30     32.0   23-61     80.2    480

Mood's Median Test: chi-square = 0.60, DF = 1, P = 0.438
  Above the overall median of 30.0 days   clinic 1: 13   clinic 2: 16
  At or below                             clinic 1: 17   clinic 2: 14
Mann-Whitney: W (clinic 1) = 852.0, P = 0.355
  Hodges-Lehmann (clinic 2 - clinic 1) +4.0 days, 95% CI (-4.0, 14.0)
Welch t: difference of means 39.3 days, 95% CI (-6.4, 85.0), P = 0.090
```

The sentence for the two clinic managers:
A. "Clinic 2's waits are twice as long: 80 days against 41 on 30 referrals each, which is the comparison the two managers will recognise because it uses every referral in the sample rather than a rank of it." · B. "For the typical referral the clinics are within about four days of each other and the difference is not established — on 30 referrals each, anywhere from four days faster to fourteen slower. Clinic 2's mean is double because of four genuine long waits, three of them out-of-area: that is a separate problem with a separate cause, and it goes in the record, not out of the data. The next step is to size the out-of-area pathway, not to compare the clinics further." ✅ · C. "Mood's is the least powerful of the three tests, so use the Welch result, which comes closest to significance at P = 0.090. It is the only one of the three that uses the actual waiting times rather than counts or ranks, the four long waits are real referrals that belong in the comparison, and a 39-day gap in the means is what the managers need to hear — the rank tests are simply too blunt to find it on 30 referrals each." · D. "At P = 0.438 the two clinics are equivalent and no further work is needed here: three separate tests agree, the one that comes closest to significance still does not reach it, and the referral pathway is not where this project's time should go."
`[D · B4 · Evaluate · HC · X · CERT]` — Mood's is the right choice when a few genuine extremes would dominate, and the honest report separates the typical referral from the tail that is its own project; D turns "not established on 30 referrals" into "equivalent," which an interval running to fourteen days does not support.

**D58.** Handling time per call (minutes) for two contact-centre teams over one month. The sponsor's question is what the difference costs in agent hours per month; team volumes are about 21,000 calls for A and 20,000 for B.

```
Team     N   Mean   Median   SD    Max   Skewness   AD (normal)       P
A      180   14.9    14.1    5.1   35.3    0.89        2.13       <0.005
B      175   16.8    16.2    5.0   33.3    0.73        1.51       <0.005

Welch two-sample t: difference of means (B - A) = 1.95 min
  95% CI (0.90, 3.01)     P = 0.0003
Mann-Whitney: Hodges-Lehmann +2.0 min, 95% CI (1.2, 3.0), P < 0.001
```

Which result to report, and why:
A. The Welch t: at 175–180 per group the skew is mild, the two tests agree to within a tenth of a minute, and the sponsor's question is about total agent hours, which is a question about the mean — about 2.0 min on 20,000 calls is roughly 660 agent-hours a month, and a rank test's shift does not multiply out to a total ✅ · B. The Mann-Whitney: both Anderson-Darling tests reject normality at P < 0.005, so the t-test's assumption has failed and its interval cannot be trusted. The rank test makes no distributional claim, its shift of 2.0 minutes is the honest estimate, and it happens to be the larger of the two, so nothing is given away by using it. · C. Neither: transform both teams' handling times to normality, re-test on the transformed scale and back-transform the difference into minutes. · D. Both, side by side, and let the sponsor choose which to use — they agree to within a tenth of a minute, so the choice costs nothing.
`[D · B4 · Evaluate · TXN · X · CERT]` — Above about 30 per group the t-test tolerates mild skew and its interval is in the units the sponsor's arithmetic needs; B applies a normality verdict from a test that at n = 180 rejects departures too small to matter, and throws away the summary the question requires.

**D59.** Coating thickness (µm) on the same 22 panels, measured once by the reference micrometer and once by the new inline gauge. The question is whether the new gauge reads the same as the reference.

```
Wilcoxon signed-rank test on the paired differences (new - reference)
  N = 22   (20 negative differences, 2 positive, 0 ties)
  Median of the differences = -5.0 um
  Hodges-Lehmann estimate of the median difference = -5.0 um
  95% CI (-6.0, -3.6)      W = 4.0      P < 0.001

Mann-Whitney on the same numbers treated as two independent groups
  W (reference) = 572.5    P = 0.070
  Hodges-Lehmann (new - reference) -5.0 um, 95% CI (-9.5, 0.0)
```

The correct reading:
A. The two tests disagree — P < 0.001 against P = 0.070 — so the comparison is inconclusive and more panels are needed before the gauge can be accepted. · B. Use the Mann-Whitney result, which is the more conservative of the two and so the safer basis for a decision about a new instrument. · C. The panels are paired by design, so the signed-rank test on the 22 differences is the right one: the new gauge reads about 5 µm low, 3.6 to 6.0 µm, on essentially every panel. Mann-Whitney throws the pairing away, so panel-to-panel thickness variation swamps a consistent 5 µm offset and the effect all but vanishes ✅ · D. Neither: comparing two instruments is a Module 2 bias study, so no rank test applies here — the right output is a bias-and-linearity study against the reference across the thickness range, with a tolerance-based acceptance rule. A hypothesis test on 22 panels answers a different question from the one a gauge decision needs.
`[D · B4 · Analyze · MFG · X · CERT]` — Pairing removes the between-panel variation, which is most of the noise, and the same point estimate with a far tighter interval shows exactly what it bought; D is close, because this *is* the bias half of an MSA — and the signed-rank test on paired differences is how that bias is read when the differences are not symmetric.

**D60.** Discharge-instruction clarity, patient survey at two sites, 60 responses each.

```
Rating: 1 = not at all clear ... 5 = completely clear

Site    N     1    2    3    4    5   Median   Mean rank
1      60     3    7   18   20   12     4.0      69.1
2      60     8   14   19   13    6     3.0      51.9

Mann-Whitney: W (site 1) = 4148.0     P = 0.005
Point estimate for site 1 - site 2 (Hodges-Lehmann): 1.0 rating point
95% CI for the difference: (0.5, 1.0)
```

The correct handling and report:
A. Compute each site's mean rating (3.52 and 2.92) and compare with a two-sample t-test; 60 responses per site is well past the point where the two means behave, and a difference of 0.6 of a rating point is a number both ward managers can hold on to. · B. Collapse the scale to "clear" (4 or 5) against "not clear" (1 to 3) and run a two-proportion test, which is easier to explain to a ward: 53% against 32% is a difference anyone can act on, the test gives an interval on the gap in percentage points, and a single agreed threshold is easier to defend than a five-level scale nobody reads the same way. · C. Report the two medians only; an ordinal scale supports no other honest summary, and 4.0 against 3.0 is the whole of what the survey can say. · D. Mann-Whitney is right — a 1-to-5 scale is already ranks — and the report is the distribution beside the shift: site 1 sits about one rating point higher (0.5 to 1.0), and 53% of site 1's patients answered 4 or 5 against 32% at site 2. Quote the distribution, because the step from 3 to 4 is not the same size as the step from 4 to 5, and a mean of the numbers assumes it is ✅
`[D · B4 · Apply · HC · X · CERT]` — Ordinal data are ranks already, so the rank test needs no justification and the distribution carries what a single number cannot; B is defensible for a headline but discards the difference between a 1 and a 3, which is where the worst experiences live.

**D61.** A candidate's A2 exhibit for a rank test reads, in full: "Mann-Whitney on invoice cycle time, site A versus site B: W = 612, P = 0.018. The sites differ." The highest-leverage feedback:
A. Require the p-value to three decimals and the exact value of W, so that the exhibit is reproducible from the record by anyone who re-runs the test. · B. Require the Hodges-Lehmann shift with its interval in working hours, both medians and quartiles, both sample sizes and a sentence on the two shapes. "Site B is about 7 hours slower on a typical invoice, plausibly 2 to 13" is a finding; "the sites differ" is not something anyone can cost, act on or argue with ✅ · C. Require a Welch t-test beside it, so that the reader can see whether the two methods agree and can read the difference in hours rather than in ranks. · D. Require the test re-run one-sided, since the team expected site B to be slower: a directional hypothesis stated in advance is the correct alternative, it halves the p-value to 0.009, and the finding then clears any threshold a sponsor might apply — without one further invoice being collected, which makes it the cheapest strengthening available.
`[D · B4 · Evaluate · TXN · S · CERT]` — Every method in this module ends in an effect size with an interval in the process's units, and a rank test's is the shift estimate; D would halve the p-value without adding a single number the sponsor can use, and changing the alternative after seeing the data is its own defect.

**D62.** An analyst plans a Mann-Whitney comparison of cure time between two autoclaves.

```
Cure time (minutes), 96 parts from autoclave 1, right-skewed with a long upper tail
  Histogram: two clear peaks, near 92 min and near 128 min
  Recipe log: two product families run on this autoclave - 61 parts of family P
              (small) and 35 of family Q (large). The family code is not in the
              extract the analyst pulled.
```

Your advice:
A. Stop and stratify: two peaks are two product families, so a rank test on the blend compares one mixture with another and its shift estimate describes neither family. Pull the family code, identify and compare within family, then decide whether a rank test is still needed ✅ · B. Run Mann-Whitney: rank tests assume nothing about the shape of a distribution, so two peaks are no obstacle — the test compares the two autoclaves on ranks, one mixture ranks against another perfectly well, and the 96 parts are a real sample of what the autoclave actually cures. · C. Run Mood's median test instead, which counts observations either side of the overall median and so is unaffected by bimodality, then report the count difference to the process owner. · D. Transform cure time to normality first, then run a two-sample t-test on the transformed values, which recovers the power a rank test gives away and pulls the two peaks into one distribution.
`[D · B4 · Evaluate · MFG · S · CERT]` — Skew that is really two strata is a Module 3 stop, and no test repairs a mixture; B is the half-truth that does the damage — rank tests need no distributional family, but they still need the groups they compare to be one thing each.

**D63.** Rework hours per claim file are strongly right-skewed: median 2.1 h, mean 5.4 h, a handful of files above 60 h, all genuine. The sponsor's question is the annual rework cost of the current process against the redesigned one.
A. Compare medians with Mann-Whitney and multiply the median shift by the annual file count, which is the standard way to turn a rank-test result into money. · B. Compare medians with Mood's median test, which handles the long files by counting them rather than letting them dominate. · C. Remove the files above 60 h as outliers and compare the means with a t-test: a handful of extreme files makes a mean unstable, the redesign was never aimed at them, and the comparison the sponsor is paying for is between the two processes as they run on ordinary work — with the exclusion rule written into the provenance note. · D. Compare means, because a total is a mean times a count and the long files are part of the cost. The mean is the right summary even though it is an ugly one; put a bootstrap interval on the difference of means so the skew does not corrupt the interval, and report the median beside it so nobody mistakes the mean for a typical file ✅
`[D · B4 · Evaluate · TXN · S · CERT]` — The summary follows the sponsor's question, and a cost total is a question about means; A multiplies a typical-file shift by every file, which understates the cost by exactly the long files the redesign is meant to remove.

**D64.** You choose Mood's median test over Mann-Whitney when:
A. the two sample sizes differ, which the rank sums behind Mann-Whitney do not handle well once one group is much larger than the other · B. the data are ordinal rather than continuous, so the values carry an order but no spacing and cannot be ranked against each other reliably · C. a few genuine extreme values would dominate the ranks and the question is about the typical unit — Mood's counts how many observations fall each side of the overall median, so it is indifferent to how extreme the extremes are, at the price of being the least powerful of the choices ✅ · D. the two distributions have different shapes, which Mann-Whitney cannot handle — Mood's compares only position, so a difference in shape leaves it unaffected, and it stays the correct choice whenever the two histograms do not look alike
`[D · B4 · Understand · NEU · K · CERT]` — Mood's trades power for insensitivity to extreme values, which is worth paying when those values are real and must stay in; D overstates the remedy — a shape difference changes what Mood's tests too, it only changes it less.

**D65.** A Kruskal-Wallis test across four triage levels returns P = 0.002. The candidate then runs six pairwise Mann-Whitney tests and reports the three that returned P < 0.05. What you require:
A. All six comparisons with their shift estimates, intervals and sample sizes, and a sentence saying six were run — reporting only the three that cleared 0.05 hides the search and inflates the chance that at least one is a false positive, and the pattern across all six is the finding ✅ · B. Only the three significant comparisons, which are the findings; the other three said nothing and would pad the report. · C. A Bonferroni adjustment dividing 0.05 by six, after which only comparisons below 0.008 are reported: six tests on the same data need the threshold tightened, the ones that survive at 0.008 are the ones the evidence supports, and that is the standard correction for multiplicity a reviewer will ask for. · D. The Kruskal-Wallis result alone; pairwise tests after an omnibus test are not permitted, and P = 0.002 is the finding to report.
`[D · B4 · Apply · HC · S · CERT]` — Reporting the comparisons you ran, not the ones that worked, is what makes a multiplicity claim honest; C is a reasonable addition to that but not a substitute, because it still reports a subset and still omits every interval.

**D66.** Switching from a two-sample t-test to Mann-Whitney relaxes some requirements. Which one is **not** relaxed?
A. That the response be roughly normal within each group, which is the assumption a normal probability plot on the residuals is checked against · B. That the observations be independent of one another and the two groups independent of each other — no rank test repairs a paired design, a nested sample or an autocorrelated series ✅ · C. That the response be measured on an interval scale rather than an ordinal one, since ranks need only an order between values · D. That the response carry no extreme values able to dominate the summary, since replacing values with ranks caps how far any one point can reach
`[D · B4 · Understand · NEU · K · CERT]` — Rank tests relax distributional requirements and tame extreme values, but independence is structural and no test recovers it; D is the most tempting, because replacing values with ranks limits an extreme value's influence, which is precisely why the requirement is relaxed rather than kept.

**D67.** In an invoice-intake comparison, Mood's median test puts the two sites' typical invoices within about three working hours of each other (P = 0.20). Site 2's mean is more than double site 1's because of three disputed invoices at 190, 240 and 310 working hours, all genuine and in scope. The sponsor asks, "So the sites are the same?"
A. "Yes — the test says there is no difference between the two sites, and it is the test we chose in advance for exactly this shape of data, so it is the answer we are bound by." · B. "No — the means differ by more than double, which is the honest comparison: the disputed invoices are real work that real people waited on, and leaving them out of the summary understates what the intake process costs. A mean is the only summary that adds up to a total, and a total is what the sponsor funds against." · C. "For a typical invoice, yes, within about three hours — that is what the test compared. It says nothing about the three disputed invoices, which carry about 740 working hours between them and have their own cause. Those are a second project, not a tail of this one, and they stay in the data with the reason recorded." ✅ · D. "The test we used is the least powerful available, so nothing can be concluded either way until a more sensitive comparison is run on more invoices."
`[D · B4 · Analyze · TXN · S · CERT]` — The answer names what the test compared, what it did not, and where the remaining hours go; B quotes a mean driven by three files as if it described the intake process, which is the reading Mood's was chosen to prevent.

**D68.** Call resolution time (minutes) with a new call script, run for two weeks across three queues; eight calls sampled per cell, randomized within shift.

```
Two-way ANOVA: resolution_min versus script_version, queue_type   N = 48 (8 per cell)

Source                        DF        SS       MS       F       P
script_version                 1    40.333   40.333   17.93   0.000
queue_type                     2   287.387  143.693   63.86   0.000
script_version*queue_type      2    30.427   15.213    6.76   0.003
Error                         42    94.500    2.250
Total                         47   452.647
S = 1.500   R-Sq = 79.1%   R-Sq(adj) = 76.6%
Residuals: flat band in all six cells, SD 1.4-1.6 min; normal plot AD = 0.38 (P = 0.39)

Cell means (minutes)    billing   technical   retention    Script mean
script old                 9.8       14.2        12.4         12.13
script new                 7.1       14.6         9.2         10.30
Queue mean                 8.45      14.40       10.80        11.22
```

The correct reading:
A. The new script saves 1.83 minutes a call: that is the script effect, it is significant at P = 0.000, and it is the figure that multiplies out across all three queues — roll it out. · B. Queue type matters most — F = 63.86 against 17.93 for the script — so the script effect is secondary, and the technical queue is where the time is. · C. The interaction is significant, so no main effect can be reported at all: with a script-by-queue term at P = 0.003 the two script means are averages over queues that behave differently, and the analysis has to stop at the six cell means. Publish those and let each queue manager decide for themselves; nothing general can be said about the script. · D. Read the interaction first: the new script saves about 2.7 minutes on billing and 3.2 on retention, and saves nothing on technical, where it runs 0.4 minutes slower. The 1.83-minute average is the mean of two real savings and one non-effect. Roll it out on billing and retention, and find out what the technical script is doing before touching that queue ✅
`[D · B4 · Analyze · TXN · X · CERT]` — With an interaction present the main effect is an average nobody experiences, and the cell means carry the decision; C over-corrects — a main effect is still reportable, but only as a conditional statement, which is what the sponsor sentence has to be.

**D69.** Medication turnaround (minutes, order verified to dose delivered) from two pharmacies at three times of day; ten orders per cell.

```
Two-way ANOVA: med_turnaround_min versus pharmacy, time_of_day   N = 60 (10 per cell)

Source                    DF        SS        MS       F       P
pharmacy                   1   308.267   308.267   19.27   0.000
time_of_day                2  1452.233   726.117   45.38   0.000
pharmacy*time_of_day       2     1.233     0.617    0.04   0.962
Error                     54   864.000    16.000
Total                     59  2625.733
S = 4.000   R-Sq = 67.1%   R-Sq(adj) = 64.0%
Residuals: flat in all six cells, SD 3.7-4.2 min; normal plot AD = 0.41 (P = 0.33)

Cell means (minutes)     morning   afternoon   evening    Pharmacy mean
central                    22.4       28.1        34.6       28.37
satellite                  26.9       33.0        38.8       32.90
Time mean                  24.65      30.55       36.70      30.63
```

The sponsor sentence:
A. "The interaction is not significant, so the two factors are independent and only one of them needs controlling: take the larger — time of day at F = 45.38 — and the satellite gap comes along with it once evening cover is fixed. A flat interaction is exactly what licenses treating the two as one effect, and running them as two projects would duplicate a piece of work. Report time of day and hold the pharmacy question." · B. "The two effects add up: the satellite pharmacy runs about 4.5 minutes slower than central at every time of day, and turnaround lengthens about 12 minutes from morning to evening at both pharmacies. Because the interaction is flat (P = 0.962), those two statements hold together and each can be acted on by itself — the evening staffing question and the satellite-process question are two projects, not one." ✅ · C. "Time of day has the larger F, so the satellite difference can be set aside until evening staffing has been settled." · D. "R-sq is 67.1%, so a third of turnaround is unexplained and neither effect should be reported until the missing third has been found and added to the model."
`[D · B4 · Analyze · HC · X · CERT]` — A flat interaction is what licenses reporting the two main effects as separate, additive facts, and it is the finding that splits the work; A draws the right conclusion about additivity and then the wrong one about action, since both effects are real and both are worth about the same.

**D70.** Assembly torque (N·m) with two lubricants on three nutrunners, six joints per cell, randomized within shift. The assembly torque specification is 43–48 N·m. Purchasing wants one lubricant on the line.

```
Two-way ANOVA: torque_Nm versus lubricant, tool   N = 36 (6 per cell)

Source              DF        SS       MS       F       P
lubricant            1     0.203    0.203    0.08   0.780
tool                 2    88.065   44.033   17.20   0.000
lubricant*tool       2    68.625   34.312   13.40   0.000
Error               30    76.800    2.560
Total               35   233.693
S = 1.600   R-Sq = 67.1%   R-Sq(adj) = 61.7%
Residuals: flat in all six cells, SD 1.4-1.8 N.m; normal plot AD = 0.44 (P = 0.28)

Cell means (N.m)      tool 1   tool 2   tool 3    Lubricant mean
lubricant A            48.2     44.6     41.00       44.60
lubricant B            45.1     44.5     44.65       44.75
Tool mean              46.65    44.55    42.83       44.68
```

The decision and the sentence behind it:
A. Specify lubricant B. Averaged over the three tools the lubricants are indistinguishable (P = 0.780), and that average hides the finding: with lubricant A torque runs from 48.2 N·m on tool 1 to 41.0 on tool 3 — above the specification at one end and below it at the other — while lubricant B holds 44.5 to 45.1 on every tool. B is not better on average; it is insensitive to the tool, which is what a three-tool line needs ✅ · B. Either lubricant: the main effect says they are indistinguishable at P = 0.780 on 36 joints, so choose on price, and the tool differences are a maintenance question rather than a purchasing one. · C. Specify lubricant A on tool 1 and lubricant B on tools 2 and 3, which gives the highest torque on each tool — 48.2 N·m, 44.5 and 44.65, read straight from the cell means the experiment produced. Matching the lubricant to the tool is what a significant interaction is telling you to do, purchasing can stock both, and the cost is one more drum and a label at each station. · D. Neither: a significant interaction means this experiment cannot support a recommendation until it is repeated with more than six joints per cell and with the tools serviced to a common standard first.
`[D · B4 · Evaluate · MFG · X · CERT]` — Equal means with unequal sensitivity is a robustness finding, and robustness is the property a multi-tool line buys; C maximizes a point estimate on tool 1 at 48.2 N·m, which is already outside the specification, and puts two lubricants on one line.

**D71.** In a two-way ANOVA you read the interaction before the main effects because:
A. the interaction carries the most degrees of freedom of any term in the table, so it holds the most information and is read before the terms that hold less · B. software prints the interaction last in the ANOVA table, so it is read last and the main effects are taken in the order the output puts them · C. when an interaction is present a main effect is the average of two or more different facts, so the sponsor sentence has to be conditional — "on this machine, that film loses 2 N" — and the main effect alone would report an average nobody experiences ✅ · D. a significant interaction invalidates the main effects, which then have to be removed from the model so that the cell means carry the report on their own — an interaction and its parent terms cannot both be reported, since the parents are averages the interaction has already shown to be misleading
`[D · B4 · Understand · NEU · K · CERT]` — The order exists because the interaction decides whether a main effect can be stated unconditionally; D is the overcorrection — hierarchy keeps the parent terms in the model, and the main effects are still reported, conditionally.

**D72.** A team plans a two-way ANOVA on handling time.

```
Proposed: handling_min versus channel (3 levels) and product (3 levels)
Cell counts from nine months of history

                    product X   product Y   product Z
channel: phone            84         61          38
channel: web             102         77          55
channel: branch           46         29           0

Note: product Z has never been sold in a branch - the branch is not licensed for it.
```

The correct plan:
A. Fill the empty cell from the web figures for product Z, the closest channel to a branch in how it is handled. · B. Run the two-way ANOVA as proposed. The software will fit it, the missing cell simply contributes no residuals, and the remaining eight cells carry the interaction between them; with 492 observations across nine months there is more than enough data to support a 3 × 3 model, an empty cell is ordinary in an observational extract, and nothing in the output will mislead a reader who checks the cell counts. · C. Drop product Z and analyze the 3 × 2 design that remains, where every cell has data and the interaction is estimable. · D. The channel-by-product interaction is not estimable with an empty cell, so fit what the data support: either the two main effects without the interaction, labelled as such, or the interaction on the 2 × 3 block where every cell has data, with product Z's two channels reported separately. Record that the branch cannot sell product Z — a licensing fact, not missing data ✅
`[D · B4 · Apply · TXN · S · CERT]` — An empty cell removes the very comparison the interaction is made of, and the honest response is to fit the estimable model and say which term is absent and why; C throws away 93 phone-and-web observations of product Z to avoid one empty cell.

**D73.** Discharge-summary completion time (minutes) across three services and two day types, from nine months of records.

```
General Linear Model: discharge_summary_min versus service, day_type
Observational data: the levels are whatever the wards ran; nobody assigned them.

Cell counts          weekday   weekend
  medicine               48        11
  surgery                39         8
  orthopaedics           40         2

Source                   DF    Adj SS     Adj MS       F       P
service                   2    3846.2    1923.10   14.54   0.000
day_type                  1    1180.5    1180.50    8.92   0.003
service*day_type          2     512.4     256.20    1.94   0.148
Error                   142   18786.6     132.30
Total                   147
S = 11.50
Note: with unbalanced cells the adjusted sums of squares do not add to the total.
```

The correct statement for the record:
A. The design is unbalanced, so no conclusion can be drawn from it: with cells running from 2 to 48 records, nothing in the table is comparable. · B. Report the three effects as printed; the general linear model has handled the imbalance with adjusted sums of squares, so the table reads like a balanced two-way ANOVA and every term is already adjusted for the others — which is the whole reason for fitting a general linear model rather than a classical ANOVA on records the wards happened to produce. · C. Report the two main effects with their estimates, say the interaction is not established and say why it cannot be — two weekend orthopaedic discharges cannot detect an interaction whatever the software prints — and state that the whole comparison is observational, so a service difference may be a case-mix difference ✅ · D. Re-run with the orthopaedic weekend cases removed, which restores a comparison the model can support at a cost of two records out of 148.
`[D · B4 · Evaluate · HC · X · CERT]` — The general linear model fits unbalanced data but does not manufacture information in a cell with two observations, and an observational factor never becomes an assignment; B is the error the software's clean output invites, since nothing in the table shows where the data are thin.

**D74.** Heat-seal strength (N) across three sealers, 16 seals each; film gauge (µm) recorded for every seal.

```
Fit General Linear Model: seal_strength_N versus sealer, covariate film_gauge_um

Sealer alone (one-way ANOVA)
Source      DF      SS      MS      F       P
sealer       2   9.482   4.741   2.55   0.089
Error       45  83.640   1.859
Total       47  93.122

With film gauge as a covariate
Source            DF   Adj SS    Adj MS       F       P
film_gauge_um      1   12.440   12.4400   12.69   0.001
sealer             2   44.850   22.4250   22.88   0.000
Error             44   43.120    0.9800
Total             47
S = 0.990
film_gauge_um coefficient: 0.4120 N per um, SE 0.1157, T = 3.56, P = 0.001
Mean film gauge by sealer: M1 51.2 um, M2 48.1 um, M3 45.4 um
Note: with a covariate present the adjusted sums of squares do not add to the total.
```

What the covariate changed, and how to report it:
A. The covariate inflated the sealer effect artificially and should be removed; the one-way result is the honest one. Sealer at P = 0.089 on 48 seals says the three machines are within reach of each other, adding a term until a p-value falls is how a finding gets manufactured, film gauge was not in the cause structure either, and the team should report that the sealers could not be separated. · B. Film gauge was doing the hiding. The three sealers happened to run different gauges — 51.2, 48.1 and 45.4 µm — and at about 0.41 N per µm that spread masked the sealer differences. Adjusted for gauge the sealers separate clearly (P = 0.000) and the residual spread falls from 1.36 to 0.99 N. Report the gauge-adjusted comparison, and say it is observational: nobody set a gauge per sealer ✅ · C. Report both results without preference, since neither is more correct than the other and the reader can see what the covariate did. · D. Film gauge at P = 0.001 is the real cause, so sealer should be dropped and the seal-strength work aimed at the film supplier.
`[D · B4 · Analyze · MFG · X · CERT]` — A covariate that differs between groups is confounded with them, and adjusting for it both reveals the group effect and shrinks the error; A reads a larger effect as an artefact when the covariate's own coefficient and the halved residual spread show it is the unadjusted comparison that was wrong.

**D75.** A team proposes a two-way ANOVA on hand-hygiene compliance.

```
Proposed: Y = the ward's monthly compliance, a proportion (compliant moments observed
              / moments observed); 24 monthly values per ward
          Factors: ward (4 levels) and quarter (4 levels)
Moments observed per ward-month range from 18 to 140.
Compliance values range from 0.62 to 1.00; five ward-months are exactly 1.00.
```

The right approach:
A. Do not use two-way ANOVA on the proportion: the response is a count of compliant moments out of a varying number observed, its variance depends on the proportion itself, and five months sit on the 1.00 boundary. Model the counts — logistic regression with moments observed as the denominator and ward and quarter as factors — and use a p chart with variable limits for the control strategy ✅ · B. Use two-way ANOVA on the proportions; with 24 monthly values per ward the central limit theorem applies to the cell means. · C. Use two-way ANOVA after an arcsine transformation of the proportion, which stabilizes the variance. It is the classical remedy for a proportion response, it pulls the 1.00 months back off the boundary, the factors can then be read as on any continuous response, back-transformed means give compliance percentages the wards recognise, and the whole analysis stays inside what a Black Belt is expected to fit unaided. · D. Use two-way ANOVA on the raw counts of compliant moments, which are whole numbers and therefore better behaved than a ratio.
`[D · B4 · Apply · HC · S · CERT]` — A proportion out of a varying denominator is a count model's response, and the varying denominator is the part no transformation of the proportion carries; C is the classical remedy and the strongest distractor, but 18 moments and 140 moments do not deserve equal weight and the arcsine does not fix the boundary months.

**D76.** A general linear model extends two-way ANOVA. What it adds at Black Belt level, and where the boundary sits:
A. Nothing; the two are different names for one procedure, and the choice between them is a menu item rather than a decision. · B. The ability to test more than two factors, which two-way ANOVA cannot do. Once a third factor enters the design the general linear model is the only route to a table, and that is where the level boundary sits — two factors from the ANOVA menu at Black Belt, three or more through the general linear model, with the crosswalk saying so. · C. A likelihood ratio in place of the p-value, which is more reliable on unbalanced data: the comparison of nested likelihoods does not depend on equal cell counts, which is what makes the general linear model the right tool whenever the design is uneven. · D. It removes the restrictions: unbalanced cell counts, a continuous covariate alongside factors, nested factors, factors treated as random. At Black Belt you recognise an unbalanced design or a covariate and fit it in software with the same diagnostics as a regression; choosing among sums-of-squares types and fitting mixed models is Master Black Belt work, and the crosswalk says so ✅
`[D · B4 · Understand · NEU · K · CERT]` — The general linear model is the same regression engine with the balance and factor-type restrictions lifted, which is also where the level boundary is drawn; B names a real capability but not the one that distinguishes them, since a three-factor balanced ANOVA is still ordinary ANOVA.

**D77.** Burr height (µm) across three deburr stations and two materials, seven parts per cell.

```
Two-way ANOVA: burr_height_um versus deburr_station, material   N = 42 (7 per cell)

Source                     DF        SS        MS       F       P
deburr_station              2     7.723     3.862    0.43   0.654
material                    1   452.772   452.772   50.31   0.000
deburr_station*material     2     0.163     0.082    0.01   0.991
Error                      36   324.000     9.000
Total                      41   784.658
S = 3.000   R-Sq = 58.7%   R-Sq(adj) = 53.0%

Cell means (um)            material m1   material m2        Station mean
  station 1                    18.2          24.6              21.40
  station 2                    19.1          25.8              22.45
  station 3                    18.6          25.2              21.90
  Material mean                18.63         25.20             21.92

Residual SD by cell (um)   material m1   material m2
  station 1                     1.1           4.1
  station 2                     1.2           4.2
  station 3                     1.0           4.0
```

What the residual table requires before any F test is reported:
A. Nothing: the F test is robust to unequal spread as long as the cells are balanced, and seven parts in each of the six cells is as balanced as a design gets, so the pooled error is the right error term and the table can be read as printed. · B. Drop material m2, whose spread is about four times material m1's, and report the three stations on m1 alone, where the residuals are tight enough for an F test to mean something. · C. Say it and act on it. The spread on m2 is about four times m1's, so the pooled error of 9.0 overstates the noise on m1 and understates it on m2, and every F test in the table rests on that pooling. Analyze the two materials separately — the stations are indistinguishable within each, and the 6.6 µm material difference is the finding — and record that m2's variability is itself worth a project ✅ · D. Transform burr height to stabilize the variance and report the same table on the transformed scale: a log or square-root transform brings the two materials' spreads together, the pooled error then describes both, every F test in the table becomes valid, and the back-transformed cell means can still be quoted in microns — the textbook remedy for unequal variance in a balanced design.
`[D · B4 · Evaluate · MFG · X · CERT]` — Equal spread across cells is the fourth check, and a four-fold difference makes one pooled error term describe neither material; D would stabilize the variance and hide the finding, and it leaves the sponsor with burr height in units nobody specifies.

**D78.** Stratifying a solder-defect rate by machine gives machine 1 at 0.4%, machine 2 at 0.5%, machine 3 at 6.8% and machine 4 at 0.4%, on about 40,000 joints per machine over eight weeks, stable week to week. A candidate proposes a logistic model with machine, shift, operator and paste lot as predictors.
A. Decline the model and say why in the A3 paragraph: one machine carries about fifteen times the others' rate on 40,000 joints each, steadily. A model would attach a p-value to what the stratification has established and still would not say what machine 3 does differently. Go to machine 3 with the process owner, and keep the model for a question the graph cannot answer ✅ · B. Fit the model: without controlling for shift, operator and paste lot the machine difference could be confounded with one of them — machine 3 may run mostly nights, or the older paste, and rebuilding a machine that was never the problem is an expensive mistake. Eight weeks of stable data is enough to fit four terms, and an adjusted odds ratio is what the process owner will be asked for. · C. Fit the model to get the odds ratio for machine 3, which puts a number on the effect and lets the team rank it against the other causes in the matrix. · D. Run a chi-square test of machine against outcome first, then act on machine 3 — the test is quick and it documents that the gap is not chance.
`[D · B4 · Evaluate · MFG · S · CERT]` — Restraint is scored, and here the stratification is the analysis; B is the serious objection, but a confounder would have to be implausibly strong and implausibly machine-specific to manufacture a fifteen-fold gap on 160,000 joints, and the model would still not name the mechanism.

**D79.** A team wants to establish what its new approval routing achieved.

```
Proposed model
  Y = invoice_cycle_h (working hours, receipt to approval)
  X = period (0 = the 14 weeks before the new routing, 1 = the 12 weeks after)
  Plus invoice_value_k, line_items, approver_grade
  The operational definition of cycle time is unchanged across all 26 weeks.
  The team also holds an I-MR chart of weekly means across the 26 weeks.
```

The reviewer's guidance:
A. Fit the model: the period coefficient with its interval is the cleanest estimate of the change, and it adjusts for invoice value, line items and approver grade, so the estimate is not contaminated by a shift in the mix of work across the 26 weeks. A control chart shows the level but cannot separate the routing from a change in what was being approved, which is the first objection Finance will raise — the coefficient is the defensible number, and its interval is what the benefit case needs. · B. Do not model the change. A before-and-after on one unchanged operational definition is read on the control chart: the shift appears as a run below the old centre line with its date, and the chart also shows whether the new level held and whether anything drifted back. That chart is the I1 evidence the rubric asks for, while a period coefficient is the same comparison with more places to go wrong and no timeline. Keep the model for the cause work ✅ · C. Fit the model but drop the three covariates, none of which the routing changed, so that the period coefficient is the plain before-and-after difference. · D. Fit both and report whichever gives the more favourable estimate, since the sponsor is entitled to the best supportable figure.
`[D · B4 · Evaluate · TXN · S · CERT]` — The rubric asks whether the improvement held, which is a question about time order that only a chart answers; A produces a defensible average shift and throws away the sustainment evidence, and D is a data-ethics stop.

**D80.** A candidate's model of theatre turnaround (minutes, patient out to next patient in) has R-sq 0.31 and a residuals-versus-order plot with an obvious step down at week 15. In week 15 the hospital opened a second recovery bay.
A. Add a squared term to absorb the step, which bends the fitted line through both periods and lifts R-sq without anyone having to decide where one process ends and the next begins. · B. Report the model and note the step in the limitations section, so that a reader knows a change occurred during collection and can discount the estimate accordingly. · C. Drop the weeks before 15, keep the current state and refit on that: the second recovery bay is permanent, the old process no longer exists, and a model of the theatre as it runs today is the one the sponsor can act on. Weeks 1–14 describe a hospital with one recovery bay, and fitting across a step nobody intends to undo is what produces a turnaround level that describes neither period. · D. Split at the change: weeks 1–14 and 16 onward are two processes, so fit each and report both, with week 15 excluded by a written rule as the transition. One model across the step estimates a turnaround level that existed in neither period — and the size of the step, which is what the second bay was worth, is a finding the single model destroys ✅
`[D · B4 · Analyze · HC · S · CERT]` — A known change with a date is stratified, not absorbed, and the step is itself the most valuable number in the data; C is reasonable for prediction but discards the baseline the project needs and the estimate of what the bay bought.

**D81.** Four candidates submit an A3 paragraph. Which one earns the rubric point?
A. "No model was needed, because the team did not have a statistical software licence and the analysis was done in a spreadsheet." · B. "We fitted every model the module taught — regression, logistic, rank tests and a two-way ANOVA — and reported the regression, which was the best of them on adjusted R-sq. The others are in the appendix with their output so the reviewer can see the work behind the choice, and fitting them all is how we made sure nothing in the data was missed." · C. "We did not model the relationship between staffing and backlog. The two moved together all year, so nothing in the history separates them, and the question the sponsor asked — whether adding a person clears the backlog — is a change we can test in four weeks on one team. The correlation, the reason and the test we will run instead are in the record." ✅ · D. "We declined to model because the data were not normally distributed, and a regression on a non-normal response is not defensible at a tollgate."
`[D · B4 · Evaluate · NEU · S · CERT]` — A3 wants a named question, a stated reason from the 4.7 list and what was done instead; D gives a reason that is not one — regression assumes nothing about the marginal distribution of the response, and rank tests exist for the cases where it matters.

**D82.** Two changes a candidate made between the draft and the final A2 exhibit.

```
  1. Six of 210 pull-test results were removed. Each was a genuine test on a genuine
     coupon. R-sq rose from 0.58 to 0.74 and the residual funnel closed.
  2. The speed*feed interaction was removed and preheat added. Both changes were made
     after seeing the p-values; neither was in the A1 cause structure.
  Candidate's note in the record: "Removed six outliers and simplified the model."
```

The reviewer of record's action:
A. Accept both, with the note expanded to list the six coupons by identifier and to name the term that was added. · B. Accept the model change and reject the removals, since terms may be revised for a stated reason but rows may not. · C. Accept the removals if a statistical outlier test flags the same six, and reject the model change: an objective test replaces the candidate's judgment about which rows to drop, the terms in a model have to come from the cause structure whatever the p-values say, and a documented test result is the audit trail the record was missing — which keeps the improved fit and repairs the provenance at the same time. · D. Reject both and stop the tollgate. Rows leave a dataset only by a rule written before the analysis, and "the fit improved" is not a rule; terms are not added or removed to move a p-value across 0.05. Restore the six, refit the pre-specified model, and report what it says — including the funnel, which is a finding about the scale rather than about the six coupons ✅
`[D · B4 · Evaluate · MFG · S · CERT]` — Both changes are on the policy's stop list and both were made after seeing the result, which is what makes them stops; C is the most plausible wrong answer, because an outlier test run after the fact still selects rows on their residuals, which is the same act with a statistic attached.

**D83.** A candidate's entire A2 paragraph reads: "Multiple regression of length of stay on consults, home oxygen and placement: R-sq 44.1%, all three terms P < 0.001. Root cause verified." The highest-leverage feedback:
A. Require a higher R-sq before A2 can be awarded: 44.1% leaves most of length of stay unexplained, and a model that misses more than half of what it is modelling cannot carry a claim that a root cause has been verified. · B. Require the sequence A2 is scored on, none of which is present: the sponsor's question in their words; why regression fits this question and this data type; the four residual plots with their verdicts; the effects in days at named settings with intervals; the alternative explanations considered and how each was handled; and the caveat that these are associations until a change is tested ✅ · C. Require a logistic model as well, since length of stay can be dichotomized at the unit's target and the odds of a long stay are what the sponsor actually manages to. R-sq of 44.1% on a continuous response is weak, a binary model of the target usually fits better, and the exhibit would then carry two results rather than one. · D. Require the p-values to three decimals and the F statistic added, so that the exhibit is complete, reproducible from the record and consistent with the way the other sections report their models.
`[D · B4 · Evaluate · HC · S · CERT]` — A2 is earned by the whole sequence, not by an index and three p-values, and the missing diagnostics are what a reviewer checks first; A asks for a bigger number when the paragraph's problem is that no number in it is in days.

**D84.** A candidate's model verified two of five candidate causes. The sponsor asks why the other three appear in the report at all.
A. Because a cause ruled out is a finding: A4 exists so the next team does not re-test what this one has narrowed, and so the terms that were inconclusive are told apart from the terms that were ruled out. Each row carries its estimate, its interval and its sample size, which is what makes that distinction possible ✅ · B. Because the rubric requires a table of tested causes, whatever that table turns out to hold, and an incomplete A4 is a scored omission at the tollgate. · C. Because listing them shows the reviewer the breadth of the analysis and the number of causes the team was willing to test before it settled on two. · D. They should not appear: a sponsor's report carries the verified causes and the countermeasures, and the rest belongs in the candidate's working file. Three terms that did not verify are three things the sponsor does not need to read, and including them invites a debate about the analysis instead of a decision about the countermeasures.
`[D · B4 · Analyze · TXN · S · CERT]` — A4 is a handover document, and the distinction between "ruled out" and "could not tell" is the part that saves the next team months; D is how most reports are written and is exactly why the same causes get re-investigated two years later.

<!-- Section D tally (84 items)
Keys: A 20 (D4 D6 D9 D14 D19 D22 D25 D34 D37 D41 D46 D47 D55 D58 D62 D65 D70 D75 D78 D84)
      B 21 (D1 D8 D11 D16 D20 D24 D26 D29 D32 D36 D39 D44 D49 D53 D57 D61 D66 D69 D74 D79 D83)
      C 22 (D2 D5 D10 D13 D17 D21 D28 D30 D35 D38 D42 D45 D50 D52 D54 D59 D64 D67 D71 D73 D77 D81)
      D 21 (D3 D7 D12 D15 D18 D23 D27 D31 D33 D40 D43 D48 D51 D56 D60 D63 D68 D72 D76 D80 D82)
      No key letter exceeds 26% (policy cap 35%).
Type: X 37 (44%) · S 30 (36%) · K 17 (20%). Items carrying a fenced software-style exhibit: 51
      of 84 (61%) - all 37 X items plus 14 S items (D6 D10 D15 D25 D29 D38 D46 D48 D50 D62 D72
      D75 D79 D82). That meets "at least half are exhibit items" without pushing the X tag above
      the blueprint's approximate 45%.
Bloom: Understand 17 · Apply 11 · Analyze 23 · Evaluate 33 · Remember 0
      Apply/Analyze/Evaluate = 67 of 84 = 80% (constraint >= 60%).
Vertical: MFG 23 · HC 20 · TXN 23 · NEU 18, with at least one NEU item in every subtopic. A
      vertical-specific form draws NEU plus that vertical (18 + 20 to 23 items), which covers
      the section's 24-item form quota (policy 2.5).
Negative stems: 2 (D30, D66) = 2.4% (policy cap 5%; task cap 4).
Topic spread: multiple regression and residual diagnostics D1-D20 · multicollinearity and VIF
      D21-D31 · model-selection restraint D32-D38 · binary logistic regression D39-D53 ·
      non-parametrics D54-D67 · two-way ANOVA and GLM D68-D77 · when not to model and the
      A2/A3/A4 record D78-D84.
"When not to use it" coverage: multiple regression D6 D10 D15 D17 · VIF D23 D30 · stepwise and
      term-adding D33 D34 D35 D37 · logistic D43 D46 D48 D50 D52 · rank tests D58 D59 D62 D63
      D66 · two-way ANOVA D72 D75 D77 · GLM D73 D76 · no model at all D50 D78 D79 D80 D81.
Required skills per the task: sponsor sentence D1 D16 D39 D42 D54 D57 D61 D69; multicollinearity
      D21 D23 D24 D26 D27 D28 D29 D31; extrapolation D7 D9; residual pattern D2 D3 D5 D11 D18
      D45 D77; interaction misread D68 D70 D71 D73; odds-ratio misread D40 D41 D42 D51;
      when not to model D10 D15 D50 D78 D79 D80 D81. Effect size and practical meaning appear
      in every key that quotes a result; no key is a p-value alone (D17 and D51 test that
      distinction directly).
Arithmetic verification (re-run at second-SME review): in every fenced regression output
      T = Coef / SE Coef, MS = SS / DF, F = MS(term) / MS(error), R-Sq = 1 - SSE/SST and
      R-Sq(adj) = 1 - MSE/(SST/DF total) were recomputed; in every logistic output Z = Coef / SE
      Coef, the odds ratio = e^Coef and the interval = e^(Coef +/- 1.96 SE), and every predicted
      probability at a named setting was recomputed from the coefficients and checked against the
      stated event rate; two-way ANOVA sums of squares were recomputed from the cell means, the
      marginal means from the cells, and the pooled error against the per-cell residual SDs;
      rank-test statistics, shift estimates and intervals were recomputed from constructed
      datasets, and each Hosmer-Lemeshow statistic from its own decile table.
Corrections made at second-SME review: D45 Hosmer-Lemeshow chi-square 18.9 -> 25.6 (P 0.015 ->
      0.001), the value its own decile table produces; D56 H 10.83 -> 10.71 and Z -3.22 -> -3.20,
      1.04 -> 1.02, the values its average ranks produce; D70 lubricant SS and MS 0.202 -> 0.203,
      so that the SS column adds to the stated total; D77 cell residual SDs reduced so that they
      pool to the 9.0 error mean square (as printed they pooled to 11.5); D42 rationale
      re-derived - reading the odds ratio as a rate passes unnoticed at 15% and is out by six
      points at 44%, not the reverse; D28 predictor correlation 0.86 -> 0.93, which is what a VIF
      near 8 requires; D29 history 14 -> 18 months to match its own stem, and the dwell range
      written low-to-high; D39 N = 520 restated as a sample of the channel's ~4,100 a quarter, to
      agree with D53; D34 stem now states the eleven candidate terms its key argues from; D35 and
      D50 stems carry the explicit discriminator policy 2.2 requires. Every item's options were
      rewritten for parallel length: the key was the longest option in all 84 items before this
      review and is the longest in 26 of 84 now, and it averages 1.5 times the mean distractor
      length rather than 3.9 - so option length no longer identifies the answer. Distractors were
      lengthened by giving each the argument a competent practitioner would actually make for it;
      no key was shortened at the cost of an effect size, an interval or a caveat.
Form-assembly note: no two items sharing a scenario go on one form (policy 3.2). The groups are
      D2 with D46 (the same 185 quotes and the same four predictors), D11 with D20 (the same
      consult-response model), D9 with D58 (contact-centre handling time), and D39 with D50 and
      D53 (application abandonment - D53 prices D39's model, D50 is the same intake question one
      step earlier).
Second-SME review: complete (policy section 2). Every item was read against 2.1-2.3 for a
      second defensible option, for an exhibit that carries its weight, and for a stem that is
      not a definition in disguise; every number in every exhibit was recomputed. No empirical
      item statistics yet.
-->

---

v1.0 · 2026-09-20
