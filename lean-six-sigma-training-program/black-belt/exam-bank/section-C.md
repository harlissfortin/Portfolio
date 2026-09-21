# Black Belt Exam Bank — Section C: Data foundations

Part of the Black Belt certification item bank. Blueprint, minimally competent candidate
statement, tag format and form-assembly rules: [`../exam-bank.md`](../exam-bank.md). Policy:
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).
Teach-text these items draw on: [`../modules/m3-data-foundations.md`](../modules/m3-data-foundations.md).

**Reading the exhibits.** Fenced blocks are software-style outputs in the layout Module 3 uses
in the week 4 and week 5 labs. The same numbers come from Minitab (Individual Distribution
Identification, Box-Cox and Johnson transformation, Capability Analysis > Nonnormal, Power and
Sample Size, Tolerance Intervals), the Excel stats add-in, and R (`fitdistrplus`, `MASS::boxcox`,
`power.t.test`, `power.prop.test`, `power.anova.test`, `tolerance`) or Python (`scipy.stats`,
`statsmodels.stats.power`); only the labels differ. Unless an exhibit says otherwise: α = 0.05,
two-sided, target power 0.80, sample sizes are **per group**, and Ppk for a fitted distribution
uses the ISO percentile method (median and the 0.135% / 99.865% percentiles of the fitted
curve). Every number states its units and basis in the stem. All outputs are illustrative and
internally consistent; none is from a real employer.

Correct option ✅; tag in brackets; rationale after the dash.

---

## Section C — Data foundations: distributions, transformations, non-normal capability, power and sample size, intervals (63 CERT)

**C1.** Triage-to-provider time (minutes, from triage timestamp to first provider note) for 210 consecutive arrivals at one emergency department. The I-MR chart in time order shows no signals.

```
Individual Distribution Identification: triage_to_provider_min   N = 210

Distribution          AD       P        Parameters
Normal              5.912   <0.005      Mean = 38.4   StDev = 24.1
Lognormal           0.286    0.614      Location = 3.470   Scale = 0.580
Exponential        12.047   <0.003      Mean = 38.4
Weibull             1.402   <0.010      Shape = 1.71   Scale = 43.1
```

The Black Belt's one-paragraph justification of the family should say:
A. "Weibull — its AD is under 2, and time-to-event data are Weibull by definition." · B. "Lognormal — the closest fit by AD and the only family the data do not reject, and a wait bounded at zero with a long right tail is what a lognormal describes; the tail estimate rests on that reasoning, not on the p-value alone." ✅ · C. "Normal — with 210 observations the central limit theorem makes the normal model appropriate." · D. "No family — three of the four are rejected, so the data cannot be identified and capability cannot be stated."
`[C · B3 · Analyze · HC · X · CERT]` — The choice combines the smallest tail-weighted distance with a physical reason; C misapplies the central limit theorem, which is about averages, to individual waits.

**C2.** Shaft diameter (mm, one CMM reading per shaft) from a stable run of 1,850 shafts.

```
Individual Distribution Identification: shaft_dia_mm   N = 1,850

Distribution     AD       P
Normal         0.912    0.019
Lognormal      0.948    0.017
Weibull        3.610   <0.010
Gamma          0.930    0.021

Normal probability plot: points lie on the line from the 0.5th to the 99.5th percentile;
three of the 1,850 points sit slightly below the line in the lower tail.
```

The correct reading:
A. "Every family is rejected; apply a Johnson transformation until one passes." · B. "Choose the gamma, because it has the highest p-value." · C. "At n = 1,850 the AD test detects departures too small to matter; the plot is straight and AD ≈ 0.9 is small, so use the normal model and note the three low points as a check on the lower tail." ✅ · D. "Collect more shafts until a p-value above 0.05 appears."
`[C · B3 · Evaluate · MFG · X · CERT]` — At large n the p-value rejects usable families and the plot plus the size of AD decide; B ranks near-identical p-values as if the third decimal carried information.

**C3.** Call handling time for 45 calls at a benefits helpline, read from the phone system, which logs whole minutes only. Normal fit: AD = 1.08, P = 0.007. The normal probability plot shows the points in horizontal runs — six points at 4 minutes, nine at 5, eight at 6 — stepping like a staircase along a line that is otherwise straight from end to end.

The Black Belt's correct conclusion:
A. The rejection is a resolution artefact: whole-minute recording makes 45 points sit on about eight distinct values; pull the seconds-level timestamps from the system (or treat the underlying process as plausibly normal and say why) rather than change the family ✅ · B. The data are lognormal, since handling times are bounded at zero · C. Apply a Box-Cox transformation, which corrects the staircase · D. The normal model is rejected, so compute capability non-parametrically from the observed counts
`[C · B3 · Analyze · TXN · X · CERT]` — Coarse measurement resolution produces a rejected fit that says nothing about the process; D accepts a verdict the exhibit itself shows to be about the recording, not the shape.

**C4.** Stat potassium turnaround (minutes, receipt to result) for 240 samples run on the lab's two analyzers, combined. The histogram shows two peaks, near 28 and near 46 minutes.

```
Individual Distribution Identification: TAT_min   N = 240

Distribution                AD       P        Parameters
Normal                    4.88   <0.005
Lognormal                 3.21   <0.005
Weibull                   3.95   <0.010
3-Parameter Loglogistic   0.41   >0.250      Threshold = 11.2   Location = 3.02   Scale = 0.21
```

The correct next step:
A. Report capability on the 3-parameter loglogistic, the only family that passes · B. Apply a Johnson transformation so a normal model can be used · C. Use the normal model, since n = 240 is large · D. Split the data by analyzer and identify each separately — two peaks are two processes, and the three-parameter curve that fits the blend describes neither ✅
`[C · B3 · Analyze · HC · X · CERT]` — A mixture has no single distribution and a flexible family will always find a curve; A reports a tail that belongs to no real analyzer.

**C5.** Eighteen weld-strength results (N) from a prototype run. Distribution identification: normal, lognormal, Weibull and smallest-extreme-value all pass (every P > 0.25, AD between 0.21 and 0.34). The sponsor wants a Ppk against the 500 N lower specification.

The best response:
A. Pick the family with the smallest AD and report its Ppk · B. State that with 18 points the families cannot be told apart and their tails differ by an order of magnitude, so report the observed count below 500 N with its interval and say the tail is unknown until 50 or more points exist from the production process ✅ · C. Report the average of the four Ppk values with their range · D. Use the normal model, since it passed and is the default
`[C · B3 · Evaluate · MFG · S · CERT]` — At small n a goodness-of-fit test rejects nothing, so "passes" carries no information about the tail; A treats a tiny difference in AD between indistinguishable fits as a decision.

**C6.** The Anderson-Darling statistic and its p-value, as used in distribution identification:
A. AD measures the gap between the sample mean and the fitted mean; a p-value under 0.05 means the fit is good · B. AD counts the points off the probability-plot line; the p-value is the fraction on the line · C. AD is a tail-weighted distance between the data and the fitted curve — smaller is closer — and its p-value screens "could this family have produced these data", to be read alongside the plot and the size of AD, not as a verdict ✅ · D. AD is the correlation between observed and fitted quantiles; a p-value above 0.05 confirms the family is correct
`[C · B3 · Understand · NEU · K · CERT]` — The statistic is a distance that weights the tails, which is why it serves capability; D turns a screen into a confirmation, which no goodness-of-fit test provides.

**C7.** Invoice cycle time (working hours, receipt to approval) charted as individuals over 12 weeks shows seven consecutive rising weekly means with the last four points above the upper control limit. The analyst wants to run distribution identification to pick the family for the baseline capability.

The right call:
A. Do not fit anything yet — an unstable process has no single distribution to identify; find the cause of the trend, or if a known change explains it, stratify into before and after, then identify each ✅ · B. Fit the lognormal, since cycle times are lognormal by physics, and mention the trend · C. Use the Johnson transformation, which absorbs trends · D. Drop the last four weeks as special causes and fit the first eight
`[C · B3 · Apply · TXN · S · CERT]` — Stability precedes shape; D discards the most recent data instead of explaining it, which is both a modeling error and a data-ethics stop.

**C8.** Before opening the identification tool for a metric defined as "time from request to fulfilment," bounded at zero and visibly right-skewed, the Black Belt expects the candidate families to be:
A. Normal and t, because the sample is large · B. Binomial and Poisson, because requests are counted · C. Uniform and triangular, because the range is bounded · D. Lognormal, Weibull, gamma and exponential — the bounded-at-zero, right-skewed families — with the normal a candidate only if the spread is small relative to the mean ✅
`[C · B3 · Understand · NEU · K · CERT]` — Reasoning about the physics narrows the search before any p-value; B confuses a continuous time with the count of events that generated it.

**C9.** Tensile strength (MPa) of 140 extruded profiles from a stable run; two-sided specification 380–460 MPa; mean 420, SD 12.

```
Distribution              AD       P        Parameters
Normal                  0.312    0.548
Weibull                 0.287   >0.250
3-Parameter Weibull     0.262   >0.500      Threshold = 351.7
Lognormal               0.339    0.494
```

The best decision:
A. Use the 3-parameter Weibull — the smallest AD · B. Every family fits and the specification sits about 3.3 SD from the center on each side, so the choice barely moves the capability; use the simplest family with a physical reason (normal, or two-parameter Weibull for a strength), state that the choice is immaterial here, and move on ✅ · C. Report Ppk under all four families and let the customer choose · D. Reject all four because they cannot be distinguished
`[C · B3 · Evaluate · MFG · X · CERT]` — When candidate fits agree and the specification is not deep in a tail, the honest statement is that the model does not matter; A buys a third parameter for a difference of 0.05 in AD and no physical reason.

**C10.** Keying errors on invoices are recorded daily (0 to 7 errors per day, about 100 invoices per day, 90 days). An analyst runs distribution identification on the daily error counts to compute a capability index.

The right call:
A. Fit a Weibull, since counts are right-skewed · B. Transform the counts with Box-Cox λ = 0.5 before fitting · C. Stop — counts of defects per unit are attribute data; capability is the long-run rate from a stable u chart, stated as defects per unit or DPMO with the basis (errors per invoice, invoices per day) written down, with no continuous fit ✅ · D. Use the normal model, since each daily count averages over 100 invoices
`[C · B3 · Apply · TXN · S · CERT]` — Attribute data get attribute capability; D reaches for the central limit theorem on a count of 0 to 7 that is nowhere near a normal shape.

**C11.** Medication-order turnaround (minutes, verification to delivery) for 95 orders. On the normal probability plot the points fall below the line at the low end and rise above it at the high end, bending upward in a single smooth curve; on the lognormal plot they lie straight. AD: normal 2.9 (P < 0.005), lognormal 0.24 (P = 0.77).

The correct reading:
A. The data are left-skewed; use the smallest-extreme-value family · B. The data are bimodal; split them before fitting · C. The data are normal with a few high outliers; remove the top points and re-test · D. The data are right-skewed — the upward bend on the normal plot is the long upper tail — and the lognormal describes them; state capability on that family ✅
`[C · B3 · Analyze · HC · X · CERT]` — A single smooth bend is skew, not a mixture, and the straight lognormal plot confirms it; C names the tail "outliers" and removes the very observations the sponsor cares about.

**C12.** Module 3 states that identifying the distribution "is the capability calculation." The reason:
A. Capability software will not run until a family is selected · B. Capability, prediction intervals and tolerance intervals are statements about the tails, and the tails are where candidate families disagree most while their centers look alike ✅ · C. The normal model is almost never correct for process data · D. Ppk is defined only for the lognormal family
`[C · B3 · Understand · NEU · K · CERT]` — The expected PPM is a tail area of the chosen curve, so the choice of curve is the estimate; C overstates the case — the normal is often fine, which is why the decision has to be checked rather than assumed either way.

**C13.** An analyst removes the six longest of 180 loan-file cycle times "as outliers," after which the normal model fits (AD 0.40, P = 0.36) and the capability against a 10-day service standard is Ppk 1.12.

The reviewer's correct response:
A. Accept — six of 180 is 3%, within any reasonable trimming allowance · B. Accept with a footnote listing the six removed files · C. Keep them out but fit a Weibull instead of the normal · D. Restore them: no operational definition excludes a slow file, the six are the process on its bad days, and the capability must be identified and stated with them in — removing points to obtain a fit is a data-ethics stop under the rubric ✅
`[C · B3 · Evaluate · TXN · S · CERT]` — Points are excluded only by a rule written before the analysis and reported; B documents the removal but leaves the estimate based on data that has been made to fit.

**C14.** Claim-handling time (working hours, receipt to decision) for 210 claims; the service standard (USL) is 24 h.

```
Box-Cox Transformation: handling_h   N = 210

Estimated lambda       0.48
95% CI for lambda    (0.22, 0.79)
Rounded lambda         0.50  (square root)

Anderson-Darling normality:  original 4.71 (P < 0.005)   transformed 0.38 (P = 0.41)
```

The correct procedure:
A. Transform the data with λ = 0.48 exactly and test against the USL of 24 as entered · B. Use λ = 0 (natural log), the usual choice for times, since the interval is close to it · C. Transform the data with λ = 0.5, transform the USL the same way (√24 = 4.90), compute normal capability on that scale, and report Ppk and the expected percentage over 24 h back in hours ✅ · D. Report the sponsor a mean of 3.8 and a USL of 4.90 so the numbers match the analysis
`[C · B3 · Apply · TXN · X · CERT]` — Same λ for data and specification, results on the original scale; B picks a value outside the confidence interval because it is familiar.

**C15.** Bore diameter (mm) for 120 machined housings from a stable run.

```
Box-Cox Transformation: bore_mm   N = 120

Estimated lambda       0.83
95% CI for lambda    (0.55, 1.12)
Rounded lambda         1.00

Anderson-Darling normality:  original 0.52 (P = 0.18)   transformed 0.49 (P = 0.21)
```

The correct conclusion:
A. No transformation is warranted — the interval for λ includes 1 and the original data already pass normality; run normal capability on the raw diameters ✅ · B. Transform with λ = 0.83 for precision · C. Transform with λ = 0.5, since it lies inside the interval · D. Switch to a Johnson transformation, since Box-Cox found no λ different from 1
`[C · B3 · Analyze · MFG · X · CERT]` — λ = 1 inside the interval means "leave the data alone"; D treats the absence of a needed transformation as a failure of the tool.

**C16.** Discharge-order-to-departure time (minutes) for 260 discharges from two inpatient units, combined in one column.

```
Box-Cox Transformation: order_to_depart_min   N = 260

Estimated lambda      −0.11
95% CI for lambda    (−0.42, 0.20)
Rounded lambda         0.00  (natural log)

Anderson-Darling normality:  original 6.9 (P < 0.005)   transformed 4.6 (P < 0.005)
Histogram of transformed data: two peaks.
```

The correct reading:
A. Try a Johnson transformation, which is more flexible · B. The transformation did nothing useful because the non-normality is two processes, not one skewed process — split by unit, chart each, and identify each on its own ✅ · C. Use λ = −0.11 unrounded, which will pass · D. Collect more discharges until the transformed data pass
`[C · B3 · Analyze · HC · X · CERT]` — A transformation cannot repair a mixture; A would find a curve that passes and predicts a tail belonging to no real unit.

**C17.** Box-Cox on setup time (minutes) for 95 changeovers reports λ = 0.38 with a 95% interval of (0.11, 0.62). The Black Belt should transform with:
A. λ = 0.38 exactly, because it is the maximum-likelihood estimate · B. λ = 0, because the log is the conventional choice for times · C. λ = 1, so the units stay in minutes · D. λ = 0.5 — the nearest interpretable value inside the interval — applied to the data and to the specification limits alike ✅
`[C · B3 · Apply · MFG · S · CERT]` — Round to an interpretable λ the interval supports; B picks a value the interval excludes, and A carries a precision the interval says does not exist.

**C18.** Benefit-application processing time (calendar days, receipt to decision) for 160 applications over 20 weeks.

```
Johnson Transformation: processing_days   N = 160
Selected function: SB   Z = 1.21 + 0.94 * ln((X − 0.4) / (31.6 − X))
Anderson-Darling after transformation: 0.35 (P = 0.45)

I-MR chart of original data: 8 points beyond limits; level steps down from week 9 onward
(median 12.5 days weeks 1–8, 7.8 days weeks 9–20).
```

The correct reading:
A. The transformation passed AD but cannot repair instability — the step at week 9 is still there, now hidden inside a curve; split the data at the change, describe each period, and state capability only for the current one ✅ · B. The transformed data pass, so capability can be computed on all 20 weeks · C. Replace Johnson with Box-Cox, which handles steps · D. Chart the transformed data; if it shows no signals, the capability is valid
`[C · B3 · Analyze · TXN · X · CERT]` — A curve flexible enough to pass on a shifted series describes a blend of two processes; D uses the transformation's ability to hide the step as evidence the step is gone.

**C19.** Box-Cox reports a rounded λ of 0.00 for invoice processing hours, with a 40 h service target. In the calculation and in the report:
A. λ = 0 means no transformation; the target enters as 40 and is reported as 40 h · B. λ = 0 means the reciprocal; the target enters as 1/40 = 0.025 and is reported as 0.025 · C. λ = 0 means the natural log; the target enters as ln(40) = 3.69 inside the calculation and is reported as 40 h in the sentence ✅ · D. λ = 0 means the square root; the target enters as 6.32 and is reported as 6.32 h
`[C · B3 · Apply · NEU · K · CERT]` — The Box-Cox family defines λ = 0 as the log; A confuses it with λ = 1, and every option that reports the transformed value to the sponsor has the direction of translation backwards.

**C20.** Door-to-needle time (minutes) for 28 stroke patients over four months. Box-Cox: λ = −0.30, 95% interval (−1.4, 0.9); normal fit AD 1.4 (P < 0.005).

The best decision:
A. Transform with λ = −0.3 and compute capability · B. Do not transform — with 28 points the interval for λ runs from a reciprocal to almost no transformation, so it says nothing; report the observed fraction over the 60-minute target with its interval and collect toward 50 or more before fitting ✅ · C. Transform with λ = 0, since it lies inside the interval · D. Transform with λ = 1, since it lies inside the interval
`[C · B3 · Analyze · HC · S · CERT]` — A λ estimated from fewer than about 50 points has an interval too wide to mean anything; C and D each pick a value the interval permits and treat permission as evidence.

**C21.** Bracket weld strength (N), lower specification 500 N, 160 welds from a stable process. The two-parameter Weibull fits directly (AD 0.30, P > 0.25). A colleague insists on a Box-Cox transformation "so the data are normal and the capability tool works."

The Black Belt's correct response:
A. Box-Cox is required — Ppk is defined only on the normal scale · B. Run both and report the average Ppk · C. Use a Johnson transformation instead, which fits strength data better · D. Fit the Weibull directly: with a one-sided specification and a family that has a physical reason (strength), the fitted-distribution capability tells the same story in fewer steps and keeps the percentiles in newtons ✅
`[C · B3 · Evaluate · MFG · S · CERT]` — When a meaningful family fits, transforming adds a step and removes the units; A is the belief that makes transformation a ritual instead of a tool.

**C22.** Time from order entry to result (minutes) for 130 point-of-care tests.

```
Individual Distribution Identification: result_min   N = 130

Distribution      AD      P      Percentiles: 0.135%   50%    99.865%
Johnson (SU)    0.42   0.33                    −3.8    27.0    118.4
Lognormal       0.51   0.19                     6.1    26.8    121.0
```

Which family, and why?
A. Johnson — the smaller AD · B. Johnson, with the negative percentile reported as zero · C. Lognormal — both fit, but the Johnson curve places probability below zero minutes where the process cannot go, and a family bounded at zero is the physically sensible choice for a time ✅ · D. Neither — use the normal model, which is simpler than both
`[C · B3 · Analyze · HC · X · CERT]` — A hard boundary rules out a curve that crosses it, whatever its AD; B patches the symptom and keeps a lower tail that is fiction.

**C23.** Box-Cox and Johnson transformations differ in that:
A. Johnson is a larger family that can be bent to fit almost any single-humped shape, so it will often pass a goodness-of-fit test on data that have no single distribution; the price is a curve with no physical meaning, where Box-Cox is one interpretable power ✅ · B. Johnson applies only to data that are already nearly normal · C. Box-Cox can repair a mixture and Johnson cannot · D. The two are algebraically equivalent and always give the same capability
`[C · B3 · Understand · NEU · K · CERT]` — Flexibility is the benefit and the hazard; C is false for both, since no transformation repairs a mixture.

**C24.** After a log transformation of pharmacy turnaround (minutes), the back-transformed mean of the logs is 42 min; the arithmetic mean of the raw data is 45.7 min. The director asks, "What is our average turnaround?"

The Black Belt should:
A. Report 42 minutes as the average, since the analysis was done on the log scale · B. Report "a typical (median) order takes about 42 minutes; the arithmetic average is about 46 because the long orders pull it up" — and never call the back-transformed 42 the average ✅ · C. Report 45.7 minutes and abandon the transformation · D. Report the mean of the two figures, about 44 minutes
`[C · B3 · Apply · HC · S · CERT]` — The exponential of the mean of the logs is the geometric mean, which estimates the median for a lognormal; A hands the director a number that is not what the word "average" means to Finance.

**C25.** Capability of the triage-to-provider times from C1 against a 60-minute target.

```
Process Capability Report: triage_to_provider_min   Distribution: Lognormal
N = 210   Location = 3.470   Scale = 0.580   USL = 60   LSL = none

Overall capability          Ppu = 0.18    Ppk = 0.18
Percentiles (fitted)        X0.135% = 5.6   Median = 32.1   X99.865% = 183.1

Performance                 PPM > USL
  Observed                   138,095
  Expected (Lognormal)       141,000
  Expected (Normal)          185,000
```

The sentence for the sponsor:
A. "Ppk is 0.18, so the process is incapable; 18.5% of patients wait more than an hour." · B. "The two models disagree by 44,000 PPM, so capability cannot be stated for this department." · C. "About one patient in seven waits over an hour — 14% by count, and the lognormal model agrees — and the bell-curve figure of 18.5% overstated it; Ppk 0.18 means the process as it runs today is nowhere near the 60-minute target." ✅ · D. "Ppk is 0.18; the fastest a patient can be seen is 5.6 minutes and the slowest 183."
`[C · B3 · Analyze · HC · X · CERT]` — Fitted PPM, observed PPM and the normal model's PPM side by side, with the practical read; A quotes the normal model's tail after the exhibit has shown it is the wrong one.

**C26.** Pull-off force (N) of adhesive labels, lower specification 15 N, 150 labels from a stable run.

```
Process Capability Report: pull_off_N   Distribution: Weibull (2-parameter)
N = 150   Shape = 4.20   Scale = 28.0   LSL = 15.0   USL = none
Anderson-Darling (Weibull) = 0.48   (Normal fit: AD = 0.33, P = 0.51)

Overall capability          Ppl = 0.54    Ppk = 0.54     (Normal model: Ppk = 0.52)

Performance                 PPM < LSL
  Observed                   66,667
  Expected (Weibull)         70,100
  Expected (Normal)          60,700
```

The sentence for the sponsor:
A. "Roughly one label in fifteen fails the 15 N minimum, and the process is stable, so that rate continues until something changes; both models put Ppk near 0.5, so the choice of curve is not what holds the number down — the center and spread are." ✅ · B. "The Weibull says 70,100 PPM and the normal 60,700; report the normal, which passed its goodness-of-fit test." · C. "The two models disagree, so the Weibull fit is wrong and the data need re-collection." · D. "Ppk is 0.54; convert it to a Cpk so the customer can compare it with last year."
`[C · B3 · Analyze · MFG · X · CERT]` — When the fits agree within the uncertainty of ten failures, say so and point at the process; C reads a difference of one failure in fifteen as a failed model.

**C27.** Quote turnaround (working hours) for 150 quotes, service standard 40 h. The analyst fitted a lognormal (AD 1.9, P < 0.005) and reports:

```
Expected PPM > 40 h (Lognormal) =  4,200
Expected PPM > 40 h (Normal)    = 12,000
Observed > 40 h                 = 9 of 150  (60,000 PPM; 95% CI roughly 28,000 to 111,000)
```

The correct conclusion:
A. Report 4,200 PPM as the capability, since the lognormal is the right family for times · B. Report the normal's 12,000 PPM as a compromise between the two · C. Average the three figures · D. The fit and the observation disagree by more than tenfold, and a rejected fit that misses the tail is wrong, not the data — examine the nine late quotes (a second process? a special cause?) and report the observed 6% with its interval until a model reproduces it ✅
`[C · B3 · Analyze · TXN · X · CERT]` — The observed rate is the check on every fitted tail; A defends a family by its name after its own goodness-of-fit and its tail have both failed.

**C28.** A candidate's baseline statement reads "Cpk = 0.71 (Weibull fit, LSL 20 N)." As reviewer of record, the Master Black Belt's feedback:
A. Fine — Cpk and Ppk are interchangeable labels for the same index · B. Relabel it Ppk: a fitted-distribution capability is overall capability, and the within-subgroup Cpk is not computed for a non-normal family; the statement should say so rather than imply a short-term index exists ✅ · C. Recompute Cpk with the normal model so the label is correct · D. Reject the Weibull and require a Box-Cox transformation
`[C · B3 · Evaluate · MFG · S · CERT]` — Software reports Pp/Ppk for non-normal fits and the candidate must say "Ppk" and mean it; C fixes the label by breaking the model.

**C29.** Sterile-tray reprocessing time (minutes, one value per tray in time order, 90 trays), USL 240 min.

```
I-MR Chart: reprocess_min   N = 90
Tests failed: 5 points beyond control limits (observations 12, 41, 42, 43, 77)
              9 consecutive points above the center line (observations 55–63)

Process Capability (Lognormal):  Ppk = 0.62   Expected PPM > USL = 31,500   Observed = 44,444 (4 of 90)
```

The correct baseline statement:
A. "Ppk = 0.62 with the caveat that the chart shows some signals." · B. "Ppk = 0.68 after removing the five out-of-control points." · C. "The process is not stable — three consecutive signals at trays 41–43 and a sustained shift at 55–63 — so no capability is claimed; the baseline states the instability and its investigation, and capability is deferred until the causes are found." ✅ · D. "Ppk = 0.62 by the normal model, which is less sensitive to instability."
`[C · B3 · Evaluate · HC · X · CERT]` — Capability describes a population that exists only if the process is stable; A reports the number with a caveat that cancels it, which is how wrong numbers get into charters.

**C30.** Thirty-eight quotes from a new pricing desk, service standard 72 h; none exceeded 72 h; the longest was 51 h. A lognormal fit reports an expected 850 PPM over 72 h. The sponsor wants the capability stated.

The right statement:
A. "None of 38 quotes exceeded 72 h; the true rate is plausibly anywhere up to about 9%, and a tail estimate from 38 points is a guess — we will state a PPM once 50 or more quotes from the running process exist." ✅ · B. "Expected 850 PPM over 72 h (lognormal)." · C. "0 PPM — no quote has exceeded the standard." · D. "Expected PPM from the normal model, since the lognormal cannot be trusted at this n."
`[C · B3 · Analyze · TXN · S · CERT]` — Under about 50 points with a one-sided specification in the tail, report the observed rate with its binomial interval; C confuses "none observed" with "none possible."

**C31.** Insert thickness (mm), LSL 1.20 mm, 1,500 inserts.

```
Gage R&R Study (ANOVA method): thickness_mm
Total Gage R&R   %Study Var = 42.3%   %Tolerance = 38.9%   Number of Distinct Categories = 3

Process Capability (Weibull): Ppk = 0.91   Expected PPM < LSL = 3,150   Observed = 2,667 (4 of 1,500)
```

The correct conclusion:
A. Ppk 0.91 is close to 1.0; report it and plan a modest centering effort · B. Use the normal model, which is less affected by gauge error · C. Report only the observed 2,667 PPM, which does not depend on the gauge · D. Stop: a gauge consuming 42% of the study variation with three distinct categories means the fitted tail is largely measurement noise; fix the measurement system, re-measure, then state capability ✅
`[C · B3 · Evaluate · MFG · X · CERT]` — Every tail estimate inherits the gauge, and 1,500 parts do not shrink that error; C forgets that the four observed failures were also read on the failed gauge.

**C32.** A fitted distribution gives a median of 30.8 N, X0.135% = 8.0 N and X99.865% = 50.0 N. The upper specification is 45 N (one-sided). Using the ISO percentile method the software applies to fitted distributions — not the normal (USL − mean)/3σ formula, which would use the sample mean 30.5 N and SD 7.2 N — Ppu is:
A. 0.67 · B. 0.74 ✅ · C. 0.88 · D. 1.48
`[C · B3 · Apply · NEU · K · CERT]` — Ppu = (45 − 30.8)/(50.0 − 30.8) = 14.2/19.2 = 0.74; A is the normal formula the stem closes off, and C uses the whole fitted range instead of the upper half.

**C33.** Module 3 requires the expected PPM from the fit, the observed PPM, and the PPM the normal model would have claimed to be shown side by side because:
A. When the fit and the observed rate disagree by a lot the fit is wrong, and when the fit and the normal agree the choice of model did not matter — you cannot know in advance which case you are in ✅ · B. Regulators require three estimates for any capability claim · C. The average of the three is the best estimate of capability · D. The normal PPM is the official figure and the others are supporting evidence
`[C · B3 · Understand · NEU · K · CERT]` — The three numbers are a check, not a menu; C averages a right answer with two wrong ones.

**C34.** Invoice processing time (working hours) for 250 invoices, USL 40 h; 2 of 250 exceeded 40 h (8,000 PPM observed).

```
Capability summary: invoice_hours   N = 250   USL = 40 h
Method                              Ppk    Expected PPM > USL    Fit AD (P)
Normal (untransformed)              1.05           830           5.9  (<0.005)
Lognormal fit                       0.81         7,900           0.34 (0.49)
Box-Cox (λ = 0), normal on ln(x)    0.80         8,300           0.36 (0.44)
```

What goes to the sponsor?
A. Ppk 1.05 — the highest of the three, and the one the normal capability tool reports · B. Neither fit — the lognormal and the Box-Cox disagree (7,900 vs 8,300), so average them · C. All three indices, without choosing between them · D. Ppk about 0.8 and roughly 8,000 PPM late from the lognormal (the Box-Cox route says the same, and both match the 2 of 250 observed); the normal model understates the tail tenfold and is shown only to explain why the earlier figure was wrong ✅
`[C · B3 · Evaluate · TXN · X · CERT]` — Two honest routes agreeing with each other and with the count is the reportable answer; B treats a 400 PPM difference between equivalent methods as a disagreement.

**C35.** Two injection-molding presses feed one cell. Changeover times are lognormal on each press with different medians (31 min on press A, 19 min on press B after a tooling change); combined, they reject every two-parameter family. The sponsor asks for "one Ppk for the cell" against a 45-minute USL.

The right response:
A. Fit a three-parameter family to the combined data, which passes, and report its Ppk · B. State capability per press, and if the sponsor needs one cell-level figure give the observed fraction of changeovers over 45 minutes for the cell — a fitted Ppk for a mixture describes neither press ✅ · C. Compute Ppk for each press and report the volume-weighted average · D. Apply a Johnson transformation to the combined data
`[C · B3 · Apply · MFG · S · CERT]` — A mixture gets a baseline per stratum and an observed rate for the whole; C averages two indices whose percentile bases are different curves, which yields a number with no interpretation.

**C36.** Last year's baseline for ED boarding time reported "Cpk = 1.1" using the normal model on right-skewed data. The Black Belt's lognormal analysis of this year's stable data gives Ppk = 0.6, with fitted and observed rates agreeing. The sponsor asks whether the department has got worse.

The best response:
A. Report 0.6 and let the sponsor draw the comparison · B. Keep the normal model this year for comparability with last year · C. Report the 0.6, recompute last year's data on the same lognormal basis so the two years can be compared, and say plainly that the 1.1 was a modeling error, not a level of performance the department has lost ✅ · D. Report both this year's normal and lognormal figures and use the higher
`[C · B3 · Evaluate · HC · S · CERT]` — Comparability comes from the same correct method on both periods, not from repeating the error; B preserves a false number to keep it consistent with itself.

**C37.** Claim-handling time (working hours) for 210 claims, USL 24 h, analyzed with a Box-Cox λ = 0 transformation.

```
Process Capability Report: handling_h   Box-Cox λ = 0 applied to data
Transformed data: Mean = 2.45   StDev = 0.55   USL = 24 (as entered)
Ppu = (24 − 2.45) / (3 × 0.55) = 13.1     Expected PPM > USL = 0
Observed > 24 h: 19 of 210 (90,476 PPM)
```

The correct reading:
A. The specification was left on the original scale while the data were transformed; with ln(24) = 3.18 the Ppu is about 0.44 and the expected rate about 93,000 PPM — which matches the 19 late claims — and that is the number to report ✅ · B. Ppu = 13.1 is correct; the 19 late claims are special causes to be removed · C. The transformation failed; refit with a Weibull · D. Recompute with λ = 0.5, which gives a Ppu closer to 1
`[C · B3 · Analyze · TXN · X · CERT]` — A Ppk of 13 beside 9% observed failures is the signature of an untransformed specification; B explains away the observed failures to protect an impossible index.

**C38.** A shared-services team plans a two-sample comparison of file-handling time (minutes of touch time per file). The charter says a 1-minute reduction is the smallest change the sponsor would act on. The sponsor offers 30 files per arm.

```
Power and Sample Size — 2-Sample t Test
α = 0.05  two-sided   Assumed standard deviation = 5 (minutes, from the baseline)

Difference   Sample size (per group)   Target power   Actual power
    1.0              394                   0.80           0.801
    2.0              100                   0.80           0.802
    3.0               45                   0.80           0.807

Power at n = 30 per group:   δ = 1.0 → 0.12     δ = 2.0 → 0.34     δ = 3.0 → 0.63
```

The sentence for the sponsor:
A. "Thirty per arm is fine — the p-value will tell us whether the change worked." · B. "We need 394 files in total, so about 200 per arm." · C. "With 30 per arm we would have a 12% chance of seeing the 1-minute change you asked for, so a null result would tell us nothing; either we collect about 400 per arm, or you tell us that a 2- or 3-minute change is what matters and we size to that." ✅ · D. "Switch to a one-sided test and 30 per arm will have enough power."
`[C · B3 · Analyze · TXN · X · CERT]` — Power is stated for the sponsor's δ at the offered n, with the two honest ways out; B halves the requirement by reading "per group" as a total.

**C39.** An outpatient clinic pilots a reminder redesign; missed appointments run at 10%. The sponsor offers one month per arm, about 450 appointments each.

```
Power and Sample Size — Test for Two Proportions
Baseline proportion p1 = 0.10   α = 0.05  two-sided   power = 0.80

Comparison p2    Difference    Sample size per group
    0.08            0.02              3,213
    0.07            0.03              1,355
    0.05            0.05                435
```

The correct reading:
A. 450 per arm is ample — proportion tests need fewer observations than tests of means · B. 450 per arm reliably detects a halving of missed appointments (10% to 5%) but would usually miss a 2- or 3-point drop; agree with the sponsor which change matters before running — a 2-point change needs about 3,200 per arm ✅ · C. 450 in total is enough, since 435 is the table's smallest entry · D. Run the month and compute the power afterwards from the observed rates
`[C · B3 · Analyze · HC · X · CERT]` — Sample size for proportions depends steeply on the difference and the baseline rate; D substitutes retrospective power for the planning decision the table exists to support.

**C40.** A fixture-rework project wants to show a 1.5 µm mean improvement in flatness per fixture.

```
Power and Sample Size — Paired t Test
Difference = 1.5 (µm, before − after, same fixture)   SD of paired differences = 4.0
α = 0.05  two-sided   power = 0.80   →   58 pairs

Power and Sample Size — 2-Sample t Test
Difference = 1.5   Assumed SD = 12.0 (µm, fixture-to-fixture)
α = 0.05  two-sided   power = 0.80   →   1,024 per group
```

The correct design decision:
A. Measure each fixture before and after: pairing removes the fixture-to-fixture variation (SD 12) from the comparison, so 58 fixtures answer the question that would otherwise need about 2,000 measurements ✅ · B. The two outputs should agree; one of the SDs is wrong · C. Use the two-sample design — the larger n is the safer choice · D. Collect 58 fixtures and analyze them as two independent groups
`[C · B3 · Analyze · MFG · X · CERT]` — The SD of differences is what pairing buys, and the sample size follows; D collects the paired sample and then throws the pairing away in the analysis.

**C41.** Benefit-application processing time (minutes) will be compared across four intake channels. The charter names a 2-minute difference between channels as the smallest that matters. The sponsor offers 40 applications per channel.

```
Power and Sample Size — One-Way ANOVA
Number of levels = 4   Assumed standard deviation = 5 (minutes)   α = 0.05   power = 0.80

Maximum difference between level means    Sample size per level
             2                                     139
             3                                      62
             4                                      36
             5                                      23
```

The sentence for the sponsor:
A. "40 per channel is enough — 160 in total exceeds the 139 the table asks for." · B. "Run six pairwise t-tests instead, which need fewer applications." · C. "23 per channel will do; the 5-minute row is the safe one." · D. "With 40 per channel we can reliably see a gap of about 4 minutes between the best and worst channel, not the 2-minute gap you named; that needs about 139 per channel — 556 applications — or we agree that 4 minutes is the difference worth finding." ✅
`[C · B3 · Analyze · TXN · X · CERT]` — The table is per level and the maximum-difference row must match the charter's δ; A reads a per-level requirement as a total.

**C42.** A Black Belt sizes a pilot using, as δ, the 3.1-minute difference observed in a two-week trial run of the new rooming process. As the coach, your feedback:
A. Sound — the trial is the best evidence of the effect size · B. Not sound — δ is the smallest improvement the sponsor would act on, taken from the charter in the sponsor's words; sizing to the difference you have already seen makes the calculation circular and can size a study to detect an effect nobody would act on ✅ · C. Not sound — use 0.5 standard deviations as the default δ · D. Not sound — use the largest difference seen in any earlier project
`[C · B3 · Evaluate · HC · S · CERT]` — δ is a decision, not an estimate; C replaces the sponsor's judgment with a convention that has no connection to the process.

**C43.** A two-sample comparison of coating thickness under two nozzle settings (25 parts per setting) returns p = 0.21. The production manager asks the Black Belt to "compute the power we had, so we know whether the null result counts."

The correct response:
A. Compute the observed power from the observed difference and report it beside the p-value · B. Report that the power was 5%, the value at the null · C. Decline retrospective power — computed from the observed effect it restates the p-value and adds nothing — and instead report the confidence interval for the difference in microns, and if the study is to be repeated the n for the δ the charter names ✅ · D. Raise α to 0.10 so the result becomes significant
`[C · B3 · Evaluate · MFG · S · CERT]` — Power is a planning number; the interval already says what the study could and could not see; A produces a figure that is a deterministic function of p and looks like new information.

**C44.** A claims-processing pilot was designed to detect a rise in first-pass acceptance from 82% to 88%.

```
Power and Sample Size — Test for Two Proportions
p1 = 0.82   p2 = 0.88   α = 0.05  two-sided
Sample size per group for power 0.80 = 551
Power at n = 250 per group = 0.47

Pilot result (n = 250 per arm):  p̂(old) = 0.824   p̂(new) = 0.860
Difference = 0.036   95% CI = (−0.028, 0.100)   P = 0.27
```

The correct conclusion:
A. The pilot had under a coin-flip chance of detecting the change it was built to find; p = 0.27 means "not detected," and the interval (a 3-point drop to a 10-point gain) still contains the 6-point target — extend the pilot to about 550 per arm before deciding ✅ · B. The pilot shows the new process has no effect · C. Declare success — 86% is above 82% · D. Re-run the test one-sided to obtain p < 0.05
`[C · B3 · Analyze · TXN · X · CERT]` — A null result from an under-powered study is uninformative, and the interval says so; B converts absence of evidence into evidence of absence.

**C45.** A Black Belt sizes a two-sample comparison of specimen-labeling time using σ from the baseline. The Module 2 MSA on that timing method found that the measurement system accounts for about half the variance in the baseline σ. The right call:
A. Increase n to compensate for the gauge · B. Switch to a comparison of medians, which is unaffected by measurement error · C. Proceed — measurement error does not change power · D. Fix the measurement system first: with half the variance coming from the gauge, half the sample would be measuring the gauge, and the σ in the calculation is not the process σ ✅
`[C · B3 · Evaluate · HC · S · CERT]` — Power without a passed MSA sizes a study to detect an effect through noise that is not the process; A buys more observations of the same inflated σ.

**C46.** Of the five quantities in every sample-size calculation — the difference that matters, the noise, the false-alarm risk, the power and the sample size — the one that cannot come from the software or the data is:
A. The noise σ, which must be assumed · B. The difference that matters δ, which is the smallest improvement the sponsor would act on and comes from the charter ✅ · C. The power, which is always 0.80 · D. The false-alarm risk, which the regulator sets
`[C · B3 · Understand · NEU · K · CERT]` — Fix four and the software gives the fifth, but δ is a decision about value; A is wrong because σ comes from the baseline and the MSA, not from an assumption.

**C47.** A two-sample t comparison with σ = 5 min and δ = 2 min needs about 100 per group at power 0.80. If a missed improvement would be expensive and the team wants power 0.90, the requirement becomes approximately:
A. 100 per group — power does not change n · B. About 115 per group · C. About 133 per group — roughly a third more ✅ · D. About 200 per group — double
`[C · B3 · Apply · NEU · K · CERT]` — The rule of thumb moves from 16(σ/δ)² to about 21(σ/δ)²; D is the intuitive "twice as sure, twice the data" guess.

**C48.** A plant will judge a new dosing pump by watching the fill-weight X̄-R chart for three months after the change rather than by a one-shot before/after test. The Black Belt begins computing a two-sample t sample size.

The right call:
A. Stop — when the comparison is a control chart over time, the questions are subgroup size and sampling frequency (Module 6), not a one-shot n; a two-sample sample size answers a question nobody is asking ✅ · B. Compute the two-sample n anyway and collect that many fills before starting the chart · C. Compute a one-way ANOVA sample size with month as the factor · D. Compute a paired sample size, since the same pump is measured before and after
`[C · B3 · Apply · MFG · S · CERT]` — The design of the comparison determines which calculation applies; D pairs at the wrong level, since fills are not matched.

**C49.** The choice between a one-sided and a two-sided test in a sample-size calculation:
A. Should always be one-sided, because it needs fewer observations · B. Should be made after the data show which direction the effect took · C. Is immaterial, because two-sided tests need fewer observations · D. Must be made before data are collected, and one-sided is legitimate only when the direction is fixed in advance and a change in the other direction would be treated exactly like no change ✅
`[C · B3 · Understand · NEU · K · CERT]` — A one-sided test chosen for its smaller n or after seeing the data doubles the real false-alarm rate; B is the misuse that the exam's "switch to one-sided" distractors describe.

**C50.** The claims pilot in C44 was sized at about 550 per arm. The sponsor now offers half the time — about 275 per arm. The sentence for the sponsor:
A. "Fine — with 275 per arm we can still compute a p-value." · B. "At 275 per arm we would have roughly a coin-flip chance of detecting the 82-to-88% improvement, so a null result would tell us nothing; either keep the full window, or accept that the pilot can only show a larger change, around 10 points." ✅ · C. "The pilot cannot be run at 275 per arm." · D. "Run it one-sided and 275 per arm will do."
`[C · B3 · Apply · TXN · S · CERT]` — Power at the reduced n, in the sponsor's terms, with the two honest options; C refuses a study that could still be informative if the sponsor accepts what it can see.

**C51.** For a test of two proportions at fixed α and power, the sample size for a given absolute difference:
A. Is the same whatever the baseline rate · B. Is always smaller than for a comparison of means · C. Grows sharply as the baseline rate becomes rarer — a 2-point improvement on a 3% defect rate needs far more observations than a 2-point improvement on 30% ✅ · D. Depends only on the difference, not on either rate
`[C · B3 · Understand · NEU · K · CERT]` — Binomial variance depends on the rate, so rare events are expensive to compare; B is the belief behind under-sized proportion pilots.

**C52.** A Black Belt sizes a comparison of machined-bore diameters with σ = 0.008 mm taken from the tool supplier's brochure, because the project's own baseline has not yet been charted. As the coach, your feedback:
A. Not acceptable — σ comes from the project's own baseline and its MSA; a borrowed σ makes n a guess, so chart the baseline (and pass the MSA) before sizing ✅ · B. Acceptable — use the specification width divided by 6 instead · C. Acceptable — sample-size calculations are approximate, so any σ of the right magnitude will do · D. Acceptable — replace σ with the pilot's own SD once the pilot is finished
`[C · B3 · Evaluate · MFG · S · CERT]` — The noise in the calculation is this process's noise as measured by this gauge; D sizes the study after it has been run, which is not sizing.

**C53.** Medication turnaround (minutes, verification to delivery), 75 orders, lognormal (AD 0.21, P = 0.85; normal AD 1.31, P = 0.002). The pharmacy director asks, "What is our average turnaround?"

```
Intervals: verify_to_deliver_min   N = 75   Mean = 38.2   Median = 35.0   StDev = 15.9   Max = 98

                                       Normal model          Lognormal model
95% CI for the center                  (34.5, 41.9) mean     (31.9, 38.4) median
95% prediction interval, next order    (6.2, 70.2)           (15.4, 79.5)
95/95 upper tolerance bound            70.9                  84.6
Non-parametric 95/95 upper bound       98 (largest of 75; confidence 0.979)
```

The sentence for the director:
A. "Any single order will take between 15 and 80 minutes." · B. "Our average is about 38 minutes and we are confident it is between about 34 and 42; a typical order is nearer 35, because the long ones pull the average up." ✅ · C. "With 95% confidence, 95% of orders are delivered within 85 minutes." · D. "Orders take between 6 and 70 minutes."
`[C · B3 · Apply · HC · X · CERT]` — The question is about the center, so the confidence interval answers it; C gives the accreditation lead's answer to the director's question.

**C54.** Loan-application decision time (calendar days), 80 applications, right-skewed; lognormal fits (AD 0.30), normal is rejected (AD 1.9). The team lead asks, "How long will the next application take?"

```
Intervals: decision_days   N = 80   Mean = 6.4   StDev = 4.9   Max = 24

                                      Normal model      Lognormal model
95% CI for the center                 (5.3, 7.5) mean   (4.6, 6.1) median
95% prediction interval, next one     (−3.4, 16.2)      (1.2, 21.5)
```

The correct answer to the team lead:
A. "Between 5.3 and 7.5 days." · B. "Between 0 and 16 days — the model's −3.4 is treated as zero." · C. "We cannot answer without more applications." · D. "Most likely between about 1 and 22 days; the normal model's lower bound of −3 days is an artefact of the wrong curve, and its upper bound is five days too short — the tail is where the model matters." ✅
`[C · B3 · Analyze · TXN · X · CERT]` — A prediction interval for one future observation on the identified family; B patches the impossible lower bound and keeps the understated upper one, which is the bound the team lead will be caught by.

**C55.** A customer's supply agreement asks the plant to "state the hardness value that 99% of delivered parts will fall within, with 95% confidence." The interval that answers this is:
A. A 95% confidence interval for the mean hardness · B. A 95% prediction interval for the next part · C. A 99/95 tolerance interval — 99% of the population with 95% confidence — computed on the identified distribution from a stable process ✅ · D. The control limits of the hardness X̄ chart
`[C · B3 · Apply · MFG · S · CERT]` — A stated fraction of the population with stated confidence is the tolerance interval's question; B covers one part, not 99% of them.

**C56.** As the sample size grows, the three intervals behave differently:
A. The confidence interval narrows toward zero width; the prediction interval barely narrows, because the next observation carries the full process spread; the tolerance interval converges on the population's percentile band ✅ · B. All three narrow at the same rate · C. Only the prediction interval narrows; the other two are fixed by the process spread · D. The tolerance interval narrows to zero width, since with enough data the population is known
`[C · B3 · Understand · NEU · K · CERT]` — Only the interval about a parameter collapses with n; D confuses knowing the population's spread exactly with the spread being zero.

**C57.** Complaint-resolution time (working hours), 45 cases from a stable process; no family fits well and the analyst uses the non-parametric route.

```
Nonparametric Tolerance Interval: resolution_h   N = 45
Upper bound = 9.2 h (largest observation)
Requested: 95% of the population with 95% confidence
Achieved confidence = 90.1%
```

The correct statement:
A. "9.2 hours is our 95/95 upper bound." · B. "With 45 cases the largest observation covers 95% of resolutions with about 90% confidence, not 95%; a one-sided 95/95 bound needs at least 59 observations — report it as 95/90, or collect 14 more cases." ✅ · C. "Use the second-largest observation to reach 95% confidence." · D. "Use the normal tolerance factor instead, which reaches 95/95 at n = 45."
`[C · B3 · Analyze · TXN · X · CERT]` — Assuming nothing about the shape costs sample size, and the software reports the confidence actually achieved; D buys the confidence by assuming a family the stem says does not fit.

**C58.** Pin diameter (mm), 22 pins from a new fixture, stable I-MR chart, normal fit passes. Specification 11.85–12.15 mm.

```
Tolerance Interval: pin_mm   N = 22   Mean = 12.000   StDev = 0.060
Normal method   95% of population, 95% confidence   k = 2.75
95/95 tolerance interval: (11.835, 12.165)
```

The sponsor asks, "So are we capable?" The best answer:
A. "No — the tolerance interval extends beyond both specification limits." · B. "Yes — ±2 SD is 11.88 to 12.12, inside the specification." · C. "Not yet knowable — with 22 pins the tolerance factor is 2.75 rather than the 1.96 a known process would use, so the interval is 40% wider than the process alone would make it; collect 50 to 100 pins from the running fixture before stating a tolerance interval or a capability index." ✅ · D. "Use the non-parametric interval instead, which with 22 pins is exact."
`[C · B3 · Evaluate · MFG · X · CERT]` — On n < 30 a tolerance interval is so wide that it says little, and the statement must say that; A reads the width of the analyst's uncertainty as the width of the process.

**C59.** A charge nurse asks, "How long will the next medication order take?" The Black Belt answers with the 95% confidence interval for the mean, "34 to 42 minutes." As the coach reviewing the exchange:
A. Wrong interval — a confidence interval is about the average, not about one order; the nurse needs the prediction interval on the identified family, which is several times wider ✅ · B. Correct — the confidence interval is the most defensible number · C. Wrong interval — the nurse needs the tolerance interval · D. Wrong interval — the nurse needs the control limits from the I-MR chart
`[C · B3 · Evaluate · HC · S · CERT]` — Quoting the mean's interval as if it covered individual orders is the most common misuse of the three; C answers a question about a fraction of the population that the nurse did not ask.

**C60.** Sterile-tray failures at release inspection: none in the last 60 consecutive trays. The department's target is a failure rate below 1%.

```
Test and CI for One Proportion: tray_failure
X = 0   N = 60   Sample p = 0.000   95% CI (exact) = (0.000, 0.060)
```

The sentence for the sponsor:
A. "Our failure rate is 0%." · B. "Our failure rate is 6%." · C. "Zero failures in 60 proves we are below the 1% target." · D. "None of the last 60 trays failed, but the true rate is plausibly anywhere up to about 6%, so we cannot yet claim we are below 1% — roughly 300 consecutive clean trays would be needed to show that with confidence." ✅
`[C · B3 · Analyze · HC · X · CERT]` — Zero observed events give an upper bound, not a rate, and the bound sets the sample needed for the target; C mistakes "none seen in 60" for "fewer than one in a hundred."

**C61.** A customer certificate must state, for each shipped part, the interval its hardness will fall in — the question is about a single part, not about a fraction of the shipment. The interval to compute is:
A. A 95% confidence interval for the mean hardness · B. A 95/95 tolerance interval · C. The Cpk of the hardness process · D. A 95% prediction interval for one part, on the identified distribution from a stable process ✅
`[C · B3 · Apply · MFG · S · CERT]` — One future unit is the prediction interval's question and the stem closes off the population reading; B answers "what covers 95% of parts," which the certificate does not ask.

**C62.** For right-skewed data, prediction and tolerance intervals should be computed:
A. On the identified family or the transformed scale and translated back to original units, because both intervals reach into the tails where the normal model is most wrong ✅ · B. On the normal model regardless of shape, since the intervals are robust · C. Only non-parametrically, never on a fitted family · D. Only after removing the skewed observations
`[C · B3 · Understand · NEU · K · CERT]` — The intervals that reach into the tails depend heavily on the distribution assumption; C pays the non-parametric price in sample size even when a family fits.

**C63.** A candidate's M2 baseline paragraph for a quoting process reads, in full: "Ppk = 0.82 (lognormal), expected 7,900 PPM late against the 40 h standard." As the reviewer of record, the highest-leverage feedback:
A. Accept — the family, the index and the PPM are all present · B. Require a Cpk beside the Ppk · C. Require the paragraph to open with the chart in time order and its stability verdict, give the physical reason for the family with the AD comparison, put the observed rate beside the expected PPM, and end with the sample size for the coming comparison computed from the sponsor's δ — none of which is present ✅ · D. Require a Johnson transformation to confirm the lognormal
`[C · B3 · Evaluate · TXN · S · CERT]` — M2 is earned by the whole sequence (stability, family with reason, three numbers beside the observed rate, n justified), not by the index alone; B asks for an index the non-normal fit does not produce.

<!--
Key tally (63 items): A = 16 (C3, 7, 15, 18, 23, 26, 30, 33, 37, 40, 44, 48, 52, 56, 59, 62) · B = 16 (C1, 5, 9, 12, 16, 20, 24, 28, 32, 35, 39, 42, 46, 50, 53, 57) · C = 16 (C2, 6, 10, 14, 19, 22, 25, 29, 36, 38, 43, 47, 51, 55, 58, 63) · D = 15 (C4, 8, 11, 13, 17, 21, 27, 31, 34, 41, 45, 49, 54, 60, 61)
Type: X = 28 (44%) · S = 22 (35%) · K = 13 (21%)
Bloom: Analyze = 22 · Evaluate = 17 · Apply = 14 · Understand = 10 · Remember = 0 (Apply/Analyze/Evaluate = 84%)
Vertical: MFG = 17 · HC = 16 · TXN = 17 · NEU = 13
Negative stems: 0
"When not to use" coverage: distribution identification (C5, 7, 10, 13) · Box-Cox (C15, 16, 20, 21) · Johnson (C18, 22, 23) · non-normal capability (C29, 30, 31, 35) · sample-size calculation (C42, 43, 45, 48, 52) · confidence interval (C59) · prediction interval (C54, 61) · tolerance interval (C57, 58) · retrospective power (C43, 44)
Topic spread: distributions C1–C13 · transformations C14–C24 · non-normal capability C25–C37 · power and sample size C38–C52 · intervals and baseline statement C53–C63
-->

v1.0 · 2026-09-20
