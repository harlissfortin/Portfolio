# Module 2 — Measurement Systems, Advanced (week 3 · 4 h self-paced + one 2.5 h live lab)

**Learning objectives.** By the end of this module the learner can:
1. Choose the measurement study that fits a metric's data type and situation — crossed, nested, expanded, attribute-nominal, attribute-ordinal, or a system-data validation — and state why the Green Belt crossed study does not apply where it does not.
2. Design a nested Gage R&R for a destructive test, read its variance components and ANOVA table, and state in plain language what the design cannot separate.
3. Design an attribute agreement study for a multi-category or ordinal judgment, read kappa, per-category kappa and Kendall's coefficients, and locate the boundary where the disagreement lives.
4. Validate a system-generated metric (a timestamp, an ERP or workflow field) with a paired audit and a field-provenance walk, and state the bias and spread against the charter's δ.
5. Read an expanded Gage R&R with site, instrument and day factors, and build a basic measurement-uncertainty budget with an expanded uncertainty and a guard band.
6. Write the MSA plan for every primary and secondary metric on their project that earns rubric item M1, including what was found inadequate and what was fixed before baseline.

Rubric items served: M1, with the provenance half of M3, in [`../project/review-rubric.md`](../project/review-rubric.md). Exam section B, objective B2. Prerequisite: Green Belt week 3 (crossed variable Gage R&R, attribute agreement on pass/fail, %study variation, %tolerance, ndc, kappa) and the Green Belt [`msa-plan.md`](../../green-belt/templates/msa-plan.md) template, which this module extends.

Green Belt gave you two studies and a rule: no capability until the ruler is checked. Black Belt projects bring metrics that break both studies: the part is destroyed when you measure it; the judgment has five ordered levels; the number is written by a system nobody has compared to the event; three sites measure the same thing on different instruments. This module is the set of designs for those cases and, in each, the sentence you tell the sponsor about how much of the number is the measurement.

---

## 2.1 Choosing the study (25 min)

**Hook.** Your project has four metrics: a weld pull strength (the bracket breaks), a triage acuity level (1 to 5, assigned by a nurse), a "claim received" timestamp (written by a workflow system) and a fill weight read at three plants on three scales. A crossed Gage R&R fits none of them cleanly. The week-3 deliverable is an MSA plan for every one — so the first skill is matching the study to the metric.

**Teach.** Four questions decide the design, in order:

1. **Can the same item be measured again?** Yes → crossed designs are available. No (destructive, or the item changes on measurement — a swab culture, a part that deforms) → nested design on homogeneous batches, or a repeatability-only study.
2. **Is the result a number or a category?** Number → variable study. Category → attribute study; if the categories are ordered (grade, stage, acuity), an ordinal study that credits near-misses.
3. **Who or what produces the value?** A person with an instrument → operators are a factor. A system → the "operators" are code paths and the humans who trigger the event; the study is an audit against the observed event.
4. **How many places, instruments and days does the metric span?** Several → an expanded study with those as factors, because a metric pooled across three plants carries three sets of bias.

| Metric situation | Study | What it separates | What it cannot separate |
|---|---|---|---|
| Repeatable, numeric, one gauge | Crossed Gage R&R (Green Belt) | Repeatability, reproducibility, operator × part interaction, part-to-part | — |
| Destructive or one-shot numeric | Nested Gage R&R on batches | Operator, batch(operator), repeatability | Within-batch part-to-part from repeatability |
| Pass/fail judgment | Attribute agreement, kappa (Green Belt) | Within, between, versus standard | — |
| Multi-category nominal judgment | Attribute agreement with per-category kappa | Which categories are confused with which | Whether a miss was "close" (no order exists) |
| Ordinal judgment | Attribute agreement plus Kendall's W and Kendall's correlation | Near-misses from far-misses; ordering from labeling | — |
| System-generated timestamp or field | Paired audit (recorded − observed) plus provenance walk | Bias, spread, systematic rounding, edit paths | Events the system never sees |
| Numeric across sites, instruments, days | Expanded Gage R&R | Site, instrument(site), day, operator, repeatability | — |
| A single reported value's doubt | Uncertainty budget (Type A + Type B) | Contributors to one reading's uncertainty | Process variation (a different question) |

Acceptance thresholds carry over from Green Belt and you state them before you run anything: %GRR of study variation under 10% acceptable, 10–30% marginal with a written reason, over 30% unacceptable; ndc ≥ 5; kappa ≥ 0.75 acceptable, below 0.40 unacceptable; Kendall's coefficients ≥ 0.90. The 6σ convention (AIAG, the Minitab default) is the house standard; if a legacy study used 5.15σ, say so and do not compare across conventions.

**Show (NEU, the four metrics above).** Weld pull → nested (2.2). Acuity level → ordinal attribute (2.3). Claim-received timestamp → paired audit (2.4). Fill weight at three plants → expanded Gage R&R, plus an uncertainty budget for the scale the customer audits (2.5).

**Try.** List every metric in your charter and answer the four questions for each in one line. Any metric for which you cannot answer question 3 is the first thing you go and see this week.

---

## 2.2 Nested Gage R&R for destructive tests (55 min)

**Hook (MFG).** A welded bracket has a lower specification of 3.0 kN on a pull test; the bracket breaks. The Green Belt on the team ran "a Gage R&R" with three operators each testing ten brackets twice and got %GRR = 3%. The software accepted the data. The study was impossible: trial 2 was a different bracket, so the study reported the difference between two brackets as repeatability. Nobody was careless — the crossed template was the only one they had been given.

**Teach.** When each item can be measured once, no operator can measure a part twice and no two operators can measure the same part. The **nested design** replaces "part" with **batch**: items made so close together — same coil, same weld cycle, consecutive positions — that you are willing to treat them as the same part. Each operator gets their own batches (batches are *nested* within operators) and tests two or three items from each. The variance components:

- **Operator** — reproducibility, tested against batch(operator) in the ANOVA.
- **Batch(operator)** — the part-to-part variation you can see: differences between batches within each operator.
- **Repeatability** — differences between items in the same batch. This term carries the design's limit: it is the test's repeatability *plus* whatever true within-batch difference exists. The two are inseparable, and every reading of a nested study says so.

Design around two consequences. If batches are not homogeneous, repeatability is inflated and the gauge looks worse than it is — conservative, which is the right direction to be wrong. If batches are drawn from too narrow a slice of production (one coil when production uses six), batch-to-batch understates the process and %GRR looks worse for the opposite reason; choose batches across the process range as you chose parts at Green Belt. Sample size: 3 operators × 5 batches × 2 items is the 30-test minimum; 3 items per batch is worth the extra 15 brackets when the test is cheap. There is no operator × part interaction term — an operator cannot interact with a part they did not measure — so that Green Belt signal is unavailable here.

**Show (MFG).** Illustrative data from the bracket line, 3 operators, 5 batches per operator (consecutive brackets from one weld cycle), 2 brackets per batch, 30 tests, randomized order, LSL 3.0 kN:

```
Gage R&R Study — Nested ANOVA    Response: pull_strength_kN
Operators = 3   Batches per operator = 5   Items per batch = 2   N = 30

Source                DF        SS        MS        F        P
Operator               2    0.7188    0.3594    1.075    0.372
Batch(Operator)       12    4.0128    0.3344   23.222    0.000
Repeatability         15    0.2160    0.0144
Total                 29    4.9476

Variance components        VarComp   %Contribution
Total Gage R&R              0.0169         9.55
  Repeatability             0.0144         8.14
  Reproducibility           0.0025         1.41
Part-to-Part (Batch)        0.1600        90.45
Total Variation             0.1769       100.00

                          StdDev   %Study Var
Total Gage R&R             0.130        30.9
  Repeatability            0.120        28.5
  Reproducibility          0.050        11.9
Part-to-Part               0.400        95.1
Total Variation            0.421       100.0

Number of distinct categories = 4
%Tolerance not computed: specification is one-sided (LSL = 3.0 kN)
```

*The sentence you tell your sponsor:* "About 31% of the spread we see in pull-test results is the test itself plus the small differences between brackets welded in the same cycle — the two cannot be told apart on a destructive test. That is marginal: the test can distinguish about four bands of strength, and we need five before we trust it to show a change. Operators agree with each other; the issue is the fixture or the batch. We are re-running with brackets from single weld cycles and a clamping jig before we state the baseline."

Reading the table as the reviewer will: the operator F is tested against batch(operator), not repeatability — P = 0.37 says operators are not distinguishable from batch noise. The batch F of 23 says the batches spanned the process, as intended. Repeatability at 28.5% is the number under suspicion, and the design has already told you it is an upper bound on the test's own repeatability.

**Software parity.** Minitab: Stat > Quality Tools > Gage Study > Gage R&R Study (Nested); Operator, Part (the batch column), Measurement; a one-sided specification gives no %Tolerance unless you enter a process-based tolerance and say so. Excel: the stats add-in's nested Gage R&R, or a nested ANOVA by hand from the sums of squares (expected mean squares: σ²ᵣ; σ²ᵣ + 2σ²ᵦ; σ²ᵣ + 2σ²ᵦ + 10σ²ₒ for this layout). R: `SixSigma::ss.rr()` does not nest — fit `lme4::lmer(y ~ 1 + (1|operator/batch))` or `VCA::anovaVCA(y ~ operator/batch)`. Python: `statsmodels` `MixedLM` with a variance component for batch within operator, or a nested ANOVA via `ols` and `anova_lm`.

**When NOT to use a nested design.** When the item can be measured again — a crossed study answers more (interaction) with the same data. When no homogeneous batch exists (a surgical case, a custom weldment): run a repeatability-only study on a reference material and an attribute study on the decision the test drives, and say the true repeatability is unknowable. When the process has huge unit-to-unit variation: %GRR will look acceptable because part-to-part dwarfs everything, which says nothing about the test — report the repeatability SD in the metric's units against δ from the charter instead.

**Try.** The case file `m2-nested-weld-mfg.csv` has the 30 tests above plus a second study with batches taken across three coils. Run both. The second study's %GRR moves; write which component moved and why the test itself did not change.

---

## 2.3 Attribute-complex cases: multi-category and ordinal (50 min)

**Hook (HC).** An emergency department's project metric is time to provider, stratified by triage acuity on a five-level ordinal scale (1 = resuscitation, 5 = non-urgent). The stratification is only as good as the acuity assignment. A nurse who assigns level 3 where the reference panel said 4 has made a different kind of error from one who assigns 1 where the panel said 5, and the Green Belt pass/fail study cannot tell them apart.

**Teach.** Two extensions to the Green Belt study.

**Multi-category nominal** (defect type, complaint category, denial reason code): kappa is computed overall and *per category*. Overall kappa says whether the judgment is reproducible; per-category kappa says *which* categories are confused with each other. Low kappa on two categories with healthy kappa on the rest is a definition problem at one boundary, not a training problem.

**Ordinal** (grade, stage, priority, acuity): kappa treats every disagreement as equal. Add **Kendall's coefficient of concordance (W)**, which credits appraisers for agreeing on the *order* of items even when their labels differ by one step, and **Kendall's correlation coefficient** for each appraiser against the standard. The pattern to expect: kappa moderate, Kendall's high — appraisers rank items consistently and disagree about where one boundary sits, so you fix the boundary wording. Kappa and Kendall's both low means the judgment is not reproducible and the metric is not ready for stratification.

Design: 30–50 items, every category at least five times, borderline cases over-represented (they are where measurement systems fail); a panel standard, not the most senior appraiser alone; three appraisers, two trials, blind, randomized, with a day between trials. Ask whether the *decision* the process makes needs all the categories: if only "level 1–2 versus 3–5" changes what happens next, test that collapsed judgment too and report both.

**Show (HC).** Illustrative study: three triage nurses, 30 charts, two trials, a three-physician panel as the standard:

```
Attribute Agreement Analysis    Response: acuity_level (ordinal, 1–5)
Appraisers = 3   Trials = 2   Items = 30   Standard: physician panel

Within appraiser           Inspected  Matched  Percent   Fleiss' kappa
  Nurse A                       30       25     83.3        0.78
  Nurse B                       30       27     90.0        0.86
  Nurse C                       30       22     73.3        0.65

Each appraiser vs standard Inspected  Matched  Percent   Fleiss' kappa   Kendall's corr
  Nurse A                       30       24     80.0        0.72            0.85
  Nurse B                       30       26     86.7        0.82            0.90
  Nurse C                       30       20     66.7        0.56            0.78

Between appraisers            30       18     60.0        0.61     Kendall's W = 0.89
All appraisers vs standard    30       17     56.7        0.68

Kappa by category (all vs standard):  L1 0.91   L2 0.83   L3 0.45   L4 0.52   L5 0.80
Disagreement summary: 21 of 26 disagreements are one level apart; 17 of those are 3-vs-4
```

*The sentence you tell your sponsor:* "The three nurses agree with the physician panel on acuity about four times in five, and when they disagree it is almost always by one level, almost always between levels 3 and 4. Kendall's W of 0.89 says the ordering is sound; kappa of 0.61 between nurses says the 3/4 boundary is not. We are rewriting the level 3 and 4 criteria with the nurses this week and re-running on the same 30 charts before we stratify anything by acuity."

Notice what you did not conclude: Nurse C is not "the problem". Her lower kappas are driven by the same 3/4 boundary as everyone else's; her shift pattern brings her more of the borderline patients. A definition fix serves all three.

**Software parity.** Minitab: Stat > Quality Tools > Attribute Agreement Analysis; tick "categories are ordered" for Kendall's coefficients; kappa by category is in the same output. Excel: the toolkit workbook computes Fleiss' kappa from the cross-tables and Kendall's W from rank sums. R: `irr::kappam.fleiss(detail = TRUE)`, `irr::kendall()` for W, `cor(method = "kendall")` versus the standard. Python: `statsmodels.stats.inter_rater.fleiss_kappa`, `scipy.stats.kendalltau`; W by hand from rank sums.

**When NOT to use attribute agreement here.** When the categories are a coarsened measurement (a 1–10 score derived from a continuous reading) — measure the reading and run a variable study. When the "standard" is one senior person's opinion — you would be measuring agreement with a habit; convene a panel or use outcome data. When fewer than five items fall in a category — that category's kappa is noise; add items or collapse and say so. And never to grade the appraisers — the output goes to the definition, not to a personnel file.

**Try.** The case file `m2-triage-ordinal-hc.csv` contains the 30 charts × 3 nurses × 2 trials. Run it with and without the ordinal option, then collapse to "1–2 versus 3–5" and re-run. Write the sentence for the sponsor: is the stratified metric usable now, at the collapsed level, or not yet?

---

## 2.4 Validating system-generated data before you trust it (45 min)

**Hook (TXN).** An insurance claims team's primary metric is hours from claim received to first adjuster touch, both timestamps from the workflow system, 9,400 claims a quarter. "It's system data, so it's clean." The received timestamp is written when a mail-room clerk scans the envelope batch, twice a day. The first-touch timestamp is written when anyone opens the record — including the audit team's spot checks. Nobody designed it wrong; the fields were built for billing, not for this project.

**Teach.** A system field is a measurement system with two parts you cannot see: the code that writes it and the humans who trigger it. You validate it in two moves.

**The provenance walk (M3).** For each field: what event is supposed to set it; what actually sets it (a scan, a click, a nightly job, a default); whether it can be edited afterward and by whom; what it holds when the event never happened (blank, zero, 01/01/1900, the creation time); whether it has been migrated or backfilled. You do this by sitting with the person who triggers the event and the system's owner, and by pulling the audit log for a sample of records. Write it down; the reviewer reads this before any chart.

**The paired audit.** Observe the real event for a sample of records, record the true time yourself, and compare to the system's time. The difference (recorded − observed) is a measurement error with a **bias** (its mean) and a **spread** (its SD). Chart the differences in time order and read the histogram for signatures: a spike at :00 and :30 (rounding); large positives clustered at one time of day (a batch job); negatives (an edit after the fact, or a clock mismatch); exact duplicates (a default). Then judge against the charter: is the bias stable and known (a constant 4 minutes is harmless once known; a bias that differs by shift is a confound), and is the spread small next to δ? The ratio SD_audit ÷ SD_process is your %study variation for this metric.

For a categorical field (status, close reason, department code), the audit is an attribute agreement study between the field and the ground truth, with the disagreement table read for pattern.

**Show (TXN).** Illustrative audit: 60 claims followed from envelope opening to first adjuster action, two weeks, all three intake windows; the metric's process SD last quarter was 95 minutes, and the charter δ is a 30-minute reduction in median time to first touch:

```
Paired audit: received_ts    Difference = recorded − observed (minutes)   N = 60
Mean          4.2      StDev   11.8      Min  −3      Max  41
95% CI for mean bias   (1.2, 7.2)        t = 2.76   P = 0.008
Differences ≥ 20 min: 7 of 60 (all from the 13:00 scan batch)
Recorded minutes ending :00 or :30: 24 of 60 (40%; expected ≈ 7% if unrounded)
Audit SD / process SD = 11.8 / 95 = 12.4% of study variation

Paired audit: first_touch_ts   N = 60
Mean          0.6      StDev    2.1      Records where "first touch" was an audit view: 9 of 60
```

*The sentence you tell your sponsor:* "The received time runs about four minutes late on average, and about one claim in eight from the afternoon batch is stamped twenty to forty minutes after it actually arrived. Against the 30-minute improvement you are looking for, that spread is about 12% of what we see in the process — usable, once we exclude the afternoon batch effect by scanning on arrival. The first-touch time is accurate, but one record in seven is a quality-audit view, not an adjuster; we are adding the user role to the extract so the metric counts only adjusters. Until both fixes are in, the baseline is not stated."

**Software parity.** Minitab: Stat > Basic Statistics > Paired t for the bias and its interval; Graph > Histogram of the differences; Stat > Quality Tools > Gage Study > Gage Bias and Linearity if you audit at several reference times. Excel: `AVERAGE`, `STDEV.S`, `CONFIDENCE.T` on the difference column; `MOD(MINUTE(ts),30)=0` to count rounded stamps. R: `t.test(recorded, observed, paired = TRUE)`; `lubridate::minute()` for the rounding check. Python: `scipy.stats.ttest_rel`; `pandas` `.dt.minute` for the rounding check.

**When NOT to rely on a paired audit.** When you cannot observe the true event (it happened last year) — the provenance walk and internal consistency checks (negative durations, impossible sequences, duplicate stamps) are all you have, and the baseline statement says the field is unvalidated. When the field is edited after the fact by the people whose performance it measures — the audit measures the edit; pull the audit log. When the system records only completed events: a "time to resolution" field is silent about cases never resolved.

**Try.** Pick one system field on your project. Do the provenance walk with the owner this week. Then design the paired audit: sample size (30–60 events across every window and shift), who observes, how the true time is captured, and the δ you will compare the spread to.

---

## 2.5 Expanded Gage R&R and measurement uncertainty basics (45 min)

**Hook (HC).** A health system's project metric is point-of-care glucose, measured at three sites with two meters each, by whichever nurse is on shift, on whatever day. A single-site crossed study passed at 8%. Pooled across the sites, the same control solution reads up to 5 mg/dL apart, and the project's stratified charts show "site effects" that are half measurement.

**Teach.** An **expanded Gage R&R** adds the factors your metric actually spans — site, instrument nested in site, day, operator — and reports a variance component for each. You read it like the basic study, with one addition: each factor's %contribution tells you *where* the measurement variation lives, and therefore what to fix. A large site component with small repeatability is a calibration or reference-material difference, not a meter problem. A large day component is drift — the case for a **gage stability** chart (a reference sample measured daily on an I-MR chart) and for bias and linearity checks against reference values across the range.

Sample sizes grow quickly: 3 sites × 2 meters × 2 operators × 10 samples × 2 trials is 240 readings. Reduce trials before samples; reduce operators per site before sites. Randomize within site and day.

**Show (HC).** Illustrative expanded study on ten control-solution samples spanning 60–350 mg/dL, three sites, two meters per site (nested), two nurses per site, two trials:

```
Expanded Gage R&R    Response: glucose_mg_dL    N = 240
Factors: Sample (crossed) · Site · Meter(Site) · Operator(Site) · Repeatability

Source                   VarComp   %Contribution   StdDev   %Study Var
Total Gage R&R             7.27          7.0        2.70       26.5
  Repeatability            2.70          2.6        1.64       16.1
  Site                     3.22          3.1        1.79       17.6
  Meter(Site)              0.93          0.9        0.96        9.5
  Operator(Site)           0.42          0.4        0.65        6.4
Sample-to-Sample          96.60         93.0        9.83       96.4
Total Variation          103.87        100.0       10.19      100.0

Site means on the 100 mg/dL control:  A 101.8   B 96.9   C 99.4
Number of distinct categories = 5
```

*The sentence you tell your sponsor:* "Across the three sites, about a quarter of the spread we see in glucose readings is the measurement, and the largest single piece is the site itself — site B reads about five points low against the same control. Meters and nurses within a site agree well. Before we compare sites, we align calibration to one reference lot and re-run; if the site component drops below ten percent, the chart differences we have been calling 'site effects' will shrink accordingly."

**Measurement uncertainty basics (MFG).** A Gage R&R answers "can this system see the process?" A customer, auditor or regulator asking "how sure are you of *this reading*?" wants a **measurement uncertainty** statement, built by the GUM method: list the contributors, express each as a standard uncertainty, combine in quadrature, multiply by a coverage factor (k = 2 for roughly 95%). **Type A** uncertainties come from your own data (a repeatability SD); **Type B** from documents and physics (a calibration certificate; an instrument's resolution r contributes r ÷ (2√3)).

Illustrative budget for a checkweigher scale on a 250 g fill, LSL 249.0 g:

```
Uncertainty budget: fill_weight_g   (single reading)
Contributor                      Type   Value        Standard uncertainty u
Repeatability (SD of 10 readings)  A    0.040 g             0.040
Calibration certificate (±0.05 g, k=2)  B    0.050 g        0.025
Resolution 0.1 g (rectangular)     B    0.1 / (2√3)          0.029
Combined standard uncertainty u_c = √(0.040² + 0.025² + 0.029²) = 0.055 g
Expanded uncertainty U = k·u_c = 2 × 0.055 = 0.11 g   (k = 2, ≈ 95%)
Guard band at LSL: readings between 249.00 and 249.11 g are indeterminate
```

*The sentence you tell your sponsor:* "Any single weight from this scale is known to within about ±0.11 g. A container reading 249.05 g cannot be declared in specification; we either set the target so that few readings fall in that band, or we average three readings, which brings the uncertainty to about ±0.07 g." Process visibility and single-reading doubt use overlapping data and give different numbers on purpose; report the one that was asked for.

**Software parity.** Minitab: Stat > Quality Tools > Gage Study > Gage R&R Study (Expanded) for factor lists and nesting; Gage Bias and Linearity Study; I-MR for gage stability; the uncertainty budget is built in a worksheet. Excel: the budget is arithmetic (`SQRT(SUMSQ(...))`); the add-in's expanded Gage R&R covers nesting. R: `lme4::lmer()` with the factor structure, `VCA` for variance components, `metRology` for budgets. Python: `statsmodels` `MixedLM`; the budget by hand or with the `uncertainties` package.

**When NOT to expand the study or build a budget.** Do not add factors you cannot randomize over (one operator per site, working days only) and then read their components as if you could — state them as confounded. Do not run an expanded study before the single-site study passes; it will report what you already know at eight times the cost. Do not present an uncertainty budget where the question is process capability — U says nothing about part-to-part variation. And do not build a budget from a lapsed calibration certificate; the Type B term is then fiction.

**Try.** For the metric on your project that spans the most sites, instruments or days, sketch the expanded design and count the readings. Then cut it to what the sponsor will fund, saying which factor you dropped and what you can therefore no longer separate.

---

## 2.6 Writing the MSA plan that earns M1 (20 min)

Rubric item M1 is earned per metric, not per project. For each primary and secondary metric, one row: data type and situation; the study chosen and why it fits (2.1); the design (items, batches, appraisers, trials, factors, sample size, randomization, standard); acceptance criteria stated before the study; the result with the sentence; and, where it failed or was marginal, what you changed and the re-run result beside the first. A study that failed and was fixed outscores one that passed and cannot be explained. A metric with no MSA row does not appear in your baseline, and a system field with no provenance walk is not validated, whatever the spreadsheet looks like.

Data ethics apply here as in Measure: you do not drop the appraiser whose kappa was lowest, exclude the batch that inflated repeatability, or change the operational definition of a field between the audit and the baseline. Any of those is a stop for the reviewer of record.

---

## Live lab — Designing the MSA for three hard cases (week 3 · 150 min · run of show)

**Setup.** Teams of four, mixed verticals. Each team designs an MSA plan on the one-page template for three case cards, one per vertical, in rotation. Cards carry a metric, its purpose in the project, the context, what is available (people, instruments, time, budget) and the sponsor's δ. Planted in each card is one feature that breaks the obvious design:

- **Card MFG — burst pressure of heat-sealed pouches.** Destructive; pouches come from a four-lane sealer and lanes differ. The obvious nested design pools lanes, confounding lane-to-lane variation with batch. The good plan nests batch within lane and crosses operators with lanes, or restricts to one lane and says so.
- **Card HC — pressure-injury stage (1–4 plus unstageable) assessed by wound nurses at three hospitals.** Ordinal with one non-ordinal category; the standard offered is "the wound-care lead at hospital A"; borderline 2/3 cases are common. The good plan uses a panel standard, over-samples 2/3 cases, reports kappa by category and Kendall's on the ordinal subset only, and tests the collapsed decision (stage ≥ 2 triggers the care bundle).
- **Card TXN — "case resolved" timestamp from a service-desk system where agents can close and reopen cases.** The field is overwritten on each close; 30% of cases reopen at least once. The good plan pulls the audit log for the first close, defines "resolved" operationally (no reopen within 5 working days), audits against the customer's confirmation email as the observed event, and states the survivorship gap.

- **0:00–0:15 — Frame and the trap.** Poll: "Which case is easiest?" Save it. State the test: a plan a stranger could run tomorrow, with the confound it cannot separate written on it.
- **0:15–0:50 — Case 1 (each team starts on a different card).** Facilitator floats with one question per team: "What does this design *not* separate?" Failure modes: a crossed template on the destructive case; the wound-care lead accepted as the standard; an audit that uses the same system's second field as the "observed" event. Do not correct; ask what the reviewer would write.
- **0:50–1:25 — Case 2.** Rotate cards. Watch for the ordinal case planned as pass/fail "to keep it simple", and the timestamp case planned as a Gage R&R with "operators".
- **1:25–1:35 — Break.**
- **1:35–2:05 — Case 3.** Rotate. Facilitator move: at 1:50 hand each team the sponsor's budget cut (half the items, one trial) and require the plan to say what was lost.
- **2:05–2:25 — Debrief.** Three teams present one plan each, one per card; the room names the confound and checks whether the plan does. Re-run the opening poll. Name the patterns: batch is not part; ordinal earns Kendall's; the standard is a panel; a system field has a provenance walk before it has a chart; every plan states what it cannot separate. **Protect the debrief:** if case 3 overruns, drop the budget cut and start the debrief at 2:05; never cut the debrief or the transfer.
- **2:25–2:30 — Transfer.** Each learner posts which of their own metrics matches which card and the one design decision they will change before the week-4 checkpoint.

---

## Project work this week (keyed to the rubric)

| Rubric item | Deliverable by end of week 3 |
|---|---|
| M1 Measurement systems | MSA plan for every primary and secondary metric: study matched to data type and situation, with the reason; design with sample sizes and randomization; acceptance criteria stated before the study; studies run or dated; results in the sponsor sentence; inadequate or marginal systems fixed and re-run, both results side by side; no baseline stated on an unvalidated metric |
| M3 Data provenance (system fields) | Provenance walk record for every system-generated field: what sets it, edit paths, defaults, backfills; paired-audit design and result |
| Carried from Module 1 | Charter δ in the sponsor's words, used as the comparison for every audit spread and marginal %GRR |

The second Master Black Belt coaching session falls in week 4 alongside Module 3; bring the plan with every metric's row filled or dated.

## Coaching prompts (week 4 checkpoint)

1. "Show me the metric on your project where the same item cannot be measured twice. What design did you use, and read me the line in your plan that says what it cannot separate."
2. "For the system field your baseline depends on: who sets it, when, and can they edit it afterward? What was the bias and spread in your audit, and how does the spread compare to the δ in your charter?"
3. "Which of your studies came back marginal or failed? What did you change, and what did the re-run say beside the first result?"

## Vertical case dataset (Module 2)

The Black Belt practicum cases are being built alongside this module; until they ship in the practicum data folder, facilitators generate the Module 2 files from these specifications.

- **`m2-nested-weld-mfg.csv`** — 60 rows, two studies. Columns: `study` (1 = single-cycle batches, 2 = cross-coil batches), `operator` (A/B/C), `batch` (1–5 within operator), `item` (1–2), `test_order`, `pull_strength_kN`, `coil_id`. Planted: study 1 reproduces the 2.2 output (σ_rep 0.12, σ_batch 0.40, σ_op 0.05 kN; %GRR ≈ 31%, ndc 4); study 2 spans three coils so batch-to-batch rises and %GRR falls to about 20% with no change to the test — the number depends on what you chose as a batch; one study-1 batch contains a bracket from the wrong weld cycle (`coil_id` shows it), inflating operator B's repeatability and tempting removal — it stays, with the rule written.
- **`m2-triage-ordinal-hc.csv`** — 180 rows. Columns: `chart_id`, `nurse` (A/B/C), `trial` (1/2), `acuity_assigned` (1–5), `panel_standard` (1–5), `days_between_trials`. Planted: the 3/4 boundary carries two-thirds of disagreements; level 5 has exactly five charts so its kappa is fragile; Nurse C's disagreements sit on borderline charts, not across the range; collapsing to 1–2 versus 3–5 raises every kappa above 0.85.
- **`m2-timestamp-audit-txn.csv`** — 60 rows. Columns: `claim_id`, `intake_window` (08:00/13:00/16:30), `observed_received`, `recorded_received`, `observed_first_touch`, `recorded_first_touch`, `first_touch_role` (adjuster/audit), `edited_after` (yes/no). Planted: the 13:00 batch carries the seven large positives; 40% of recorded minutes end in :00 or :30; nine first touches are audit-role views; three `edited_after = yes` records have negative differences.
- **`m2-lab-cases.md`** — the three case cards with facilitator-only notes on the planted confound in each.

All values are illustrative; variance structures are drawn from published MSA examples and observed studies, scaled to the vertical.

## Takeaways

- Match the study to the metric: batch replaces part when the item is destroyed, and the plan states what the nested design cannot separate.
- Ordinal judgments earn kappa by category and Kendall's coefficients; when the order holds and the labels drift at one boundary, fix the definition, not the appraiser.
- A system field is a measurement system with invisible operators: walk its provenance, audit it against the observed event, and compare the spread to the charter's δ before the baseline exists.
- Expanded studies tell you where measurement variation lives; an uncertainty budget answers a different question about one reading — report the one that was asked.

## Cumulative check (re-testing Module 1)

**C-PRAC-1.** In week 5 of a discharge-timing project (HC), the case-management director reassigns the team's analyst to a payer audit "for the next month." The signed charter's escalation path reads: "team member withdrawn for more than two weeks → functional head and sponsor, within 2 working days." The Black Belt should:
A. Notify the director and the sponsor within two working days, citing the trigger, and ask for the decision the charter assigns them ✅ · B. Absorb the analyst's data tasks personally to avoid disturbing the director · C. Pause the project until the analyst returns and note the delay in the tollgate · D. Ask the sponsor to overrule the director before speaking to the director
`[A · B1 · Apply · HC · S · PRAC]` — escalation with a clock is the charter working, not failing; the trigger names both the destination and the timing. Absorbing the work hides the capacity problem the charter was written to surface; going to the sponsor first bypasses the functional head the path names.

**C-PRAC-2.** A distributor's candidate list (MFG) includes "install a second automated sorter," proposed by the warehouse manager with the largest impact figure on the list. The sponsor asks the Black Belt to score it in the prioritization matrix. The best response is:
A. Score it; its impact figure will carry it to the top where it belongs · B. Score it but cap its impact score at 3 because of the capital cost · C. Reject it because a purchase is never an improvement · D. Route it to the capital process with a note: the answer is a purchase decision, not an investigation, and the matrix scores DMAIC projects ✅
`[A · B1 · Analyze · MFG · S · PRAC]` — triage removes capital and policy decisions before scoring; the matrix compares investigations, and scoring a purchase against them misleads whichever way the weights fall. Rejecting it outright loses a decision the sponsor still has to make.

---

v1.0 · 2026-09-20
