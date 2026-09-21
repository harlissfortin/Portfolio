# Practicum Case — MFG: Bracket Line B, Hole Position

*The manufacturing vertical case for the Green Belt live labs (weeks 2–8) and the Practicum
track. Sections 1–3 are the learner's case pack, released piece by piece on the calendar in
[`practicum-track-project.md`](practicum-track-project.md). Section 4 is the **facilitator
answer key**: what is planted and what every analysis returns. Do not hand section 4, or
`data/generate.py`, to learners. The data are simulated to behave like a real inspection log;
every figure in this file is computed from the CSVs as shipped.*

Level calendar and gates: [`../README.md`](../README.md). Rubric:
[`../project/review-rubric.md`](../project/review-rubric.md). Tollgate pages:
[`../project/tollgate-checklists.md`](../project/tollgate-checklists.md).

**Files** (`data/`): `mfg-bracket-line.csv` (1,500 rows — the inspection log, 2 Mar–8 May
2026) · `mfg-gage-rr.csv` (60 rows — the gauge study as the line runs it) ·
`mfg-gage-rr-after.csv` (60 rows — the same parts under a written method; released after the
first study is interpreted) · `mfg-pilot.csv` (300 rows, 1–12 Jun 2026 — released after the
pilot design and written prediction are submitted).

---

## 1. The case

### 1.1 The sponsor's brief (as received — it contains a cause and a countermeasure)

> From: production manager, machining. Bracket line B has been reworking too many parts
> since we went to three shifts in February. First-pass yield at the inspection station has
> been running about 93% against the 98% we promised assembly, and assembly has sent back two
> lots this quarter for holes that would not line up. It is mostly the night shift — the newer
> operators are not as careful with the gauge. I want 100% inspection on nights until it
> settles down, and a refresher on gauge use for the night crew. Budget is approved for the
> inspection hours. Can your project make that stick?

The learner's week 1 job is to take the cause ("night operators") and the countermeasure
("100% inspection, retraining") out of the problem statement and keep both on a list for
week 7, where the data decide whether either survives.

### 1.2 The process

Line B drills two mounting holes in a stamped steel bracket. Two machining centres, **M1**
and **M2**, each run two fixtures: M1 carries **F1** and **F2**, M2 carries **F3** and **F4**.
Three shifts — Day, Swing, Night — with three operators each (`OP-11` … `OP-33`); operators
stay on their shift. Fixtures are changed at changeover (about 25 minutes, illustrative) and
the fixture used is recorded on the traveller.

At the inspection station a hand-held gauge reads the position of hole 1 relative to the
datum edge. The recorded value is the **deviation from nominal in millimetres** (positive =
toward the outer edge). The drawing note — the customer document — sets **±0.25 mm**; the
customer is the assembly plant (internal), where a bracket outside that band will not sit on
the frame studs. Inspection samples **10 brackets per shift** (every twentieth part off the
line, about 200 per shift), records pass or fail against ±0.25 mm, and sends fails to the
manual rework station, where the rework time in minutes is logged.

**Go-see observations for the week 2 value stream map** (illustrative, from the case walk):
drill cycle 45 s per bracket; batches of 200 per shift move to inspection on a cart; wait for
inspection 20–90 minutes; inspection 1 minute per sampled part; rework 18–20 minutes per part
(the log has the real figures); lead time from stamping to the assembly buffer about 1.5
working days; the traveller is filled in by hand and the fixture field is sometimes left for
the next operator to complete.

### 1.3 The customer document

*Drawing B-4471 rev D, note 6:* "Hole 1 position ±0.25 mm to datum edge A. Parts outside
this band are not to be shipped without disposition." The 98% first-pass-yield promise sits in
the internal supply agreement with assembly; it is a target, not a specification.

### 1.4 The measurement system

One hand-held gauge at the station, zeroed on a master block "when it looks off". Three
operators use it across a day. No written method: the part is held by hand against the datum
edge; reading is taken when the display "settles". Resolution 0.01 mm.

### 1.5 The change log (released on request in week 4)

The maintenance and engineering log for line B, 2 March – 8 May, as kept by the line lead.
Routine entries are real routine; one entry matters.

| Date | Entry |
|---|---|
| 04 Mar | Coolant concentration checked, both machines, in range |
| 11 Mar | M1 way-cover replaced |
| 18 Mar | Gauge master block re-certified (no change) |
| 25 Mar | F2 clamp handle replaced, like for like |
| 02 Apr | Planned maintenance window moved from Sat AM to Sun PM, before Night shift start |
| 09 Apr | Coolant concentration checked, both machines, in range |
| 13 Apr | M2 drill insert changed, Swing shift (insert life reached) |
| 15 Apr | M2 tool offset re-taught after insert change, Day shift start |
| 22 Apr | F4 locating pin inspected at annual check — within wear limit |
| 29 Apr | Coolant concentration checked, both machines, in range |
| 06 May | Night shift added second inspector for one week (sponsor request) |

### 1.6 Columns

| File | Column | Meaning | Type |
|---|---|---|---|
| bracket-line, pilot | `part_id` | Sampled part | ID |
| | `date` | Working day | Date |
| | `shift` | Day / Swing / Night | Category |
| | `machine` | M1 / M2 | Category |
| | `fixture` | F1–F4 | Category |
| | `operator_id` | Operator on the machine | Category |
| | `hole_pos_dev_mm` | Deviation from nominal, mm | Continuous |
| | `result` | pass / fail as recorded by the inspector | Attribute |
| | `rework_min` | Minutes at the rework station (fails only) | Continuous |
| gage-rr (both) | `part`, `operator`, `trial`, `measurement_mm` | 10 parts × 3 operators × 2 trials | Gage R&R layout |

---

## 2. Week by week — which data, which tool, which rubric item

| Week | Data | Tool | Software | Rubric |
|---|---|---|---|---|
| 2 | Go-see notes; `result`, `rework_min` for %C&A and the rework loop | SIPOC, current-state value stream map, lead time, %C&A, process cycle efficiency; operational definition of the primary metric | Any map tool; a spreadsheet for the timeline | M1, M2, D2 |
| 3 | `mfg-gage-rr.csv`, then `-after.csv` | Crossed Gage R&R (ANOVA method), %study variation, %tolerance, distinct categories; the written method | Minitab Stat > Quality Tools > Gage Study > Gage R&R (Crossed), tolerance 0.50 · Excel toolkit MSA workbook · R `SixSigma::ss.rr()`; Python: two-way ANOVA with `statsmodels` and the variance-component arithmetic from `msa-plan.md` | ★ M3 |
| 4 | `hole_pos_dev_mm` by `date` × `shift`; `result` | Data audit; X̄-S (or X̄-R) with subgroups of 10 by shift and day; I-MR on daily means as a cross-check; Cp/Cpk/Pp/Ppk, DPMO, sigma level; the change log | Minitab Stat > Control Charts > Variables Charts for Subgroups > Xbar-S; Stat > Quality Tools > Capability Analysis > Normal · Excel toolkit capability calculator · R `qcc::qcc(type="xbar")`, `qcc::process.capability()`; Python `numpy`/`scipy` with the constants table | M4 |
| 5 | All columns | Box plots by fixture, shift, machine, operator; multi-vari (fixture within shift); fishbone → C&E matrix → FMEA; test plan from the selector | Minitab Graph > Boxplot (With Groups); Stat > Quality Tools > Multi-Vari · Excel PivotTable + box-and-whisker · R `ggplot2`; Python `seaborn.boxplot` | A1, A2 |
| 6 | All columns | Welch two-sample t; one-way ANOVA + Tukey; chi-square of fail rate by category; equal-variance check; simple regression on time | Minitab Stat > Basic Statistics > 2-Sample t; Stat > ANOVA > One-Way; Stat > Tables > Chi-Square Test for Association; Stat > ANOVA > Test for Equal Variances · Excel Analysis ToolPak t-Test (unequal variances), Anova: Single Factor, `CHISQ.TEST` · R `t.test()`, `aov()` + `TukeyHSD()`, `chisq.test()`, `car::leveneTest()`; Python `scipy.stats.ttest_ind(equal_var=False)`, `f_oneway`, `chi2_contingency`, `levene`, `statsmodels` `pairwise_tukeyhsd` | ★ A3, A4 |
| 7 | Written prediction, then `mfg-pilot.csv` | Countermeasure selection; pilot plan with stop rule; poka-yoke on the changeover; setup-reduction module on the changeover log | Pilot plan template | I1, I2, I4 |
| 8 | Baseline + pilot on one chart | X̄-S continued with baseline limits; two-proportion test on fail rate; capability after; control plan; response plan; standard work for changeover; simulated cost table | Same as weeks 4 and 6 | ★ I3, ★ C1, C2, C3, S1 |

**The primary metric, as the learner should define it by Tollgate 1:** hole 1 position
deviation from nominal in mm, read on the station gauge by the method in the MSA plan, for
each sampled bracket (10 per shift, every twentieth part); reported as the X̄-S chart by
shift-day and as percent of sampled brackets outside ±0.25 mm. Guardrail: rework minutes per
week and assembly returns.

**What the learner asks for, and when.** The inspection log in week 2 (given); the gauge
study in week 3 (given); the change log in week 4 (on request — a learner who finds three
subgroups beyond the limits and does not ask what happened those days has not investigated
a special cause); the pilot file in week 7 (released only after the pilot design and
prediction are on file); the simulated cost table in week 8.

---

## 3. What the learner submits by gate

| Gate | On the one page |
|---|---|
| Tollgate 1 (wk 2) | Cause-free problem statement with the 93% first-pass figure and its basis (sampled parts, 10 per shift); charter with start (blank loaded) and stop (part released from inspection or rework); CTQ from drawing note 6; SIPOC; stakeholder map naming the night shift lead as a resistance risk and the planned response |
| Tollgate 2 (wk 4) | Gage R&R result and what was done; X̄-S chart with the April subgroups explained, not deleted; Cp/Cpk/Pp/Ppk with the drawing named as the specification source; the two impossible records handled in writing |
| Tollgate 3 (wk 6) | Fishbone → C&E → short list; box plots; the fixture test with effect size in mm and the plain sentence; the operator test that did not verify, shown; the prediction for Improve |
| Tollgate 4 (wk 8) | Selection matrix; pilot plan and prediction; before/after chart; capability after; control plan with the changeover owner named; standard work; simulated benefit with class stated |

---

## 4. FACILITATOR ANSWER KEY — do not distribute

### 4.1 What is planted

Generated with a fixed seed by `data/generate.py`; re-running reproduces the files exactly.

| Feature | Where | Size | Found by |
|---|---|---|---|
| **Fixture F3 mean shift** (worn locating pin) | `fixture == F3`, every shift, every day | +0.12 mm true; +0.13 mm observed | Box plot by fixture; two-sample t or ANOVA; chi-square on fail rate |
| **Night-shift spread** (no spindle warm-up after the Sunday-evening maintenance window; coolant temperature drifts through the first hours) | `shift == Night`, every fixture | sd × 1.6 true (0.156 vs 0.119 observed) | Box plot by shift; S chart by shift; equal-variance test; chi-square on fail rate. **Not** found by a t-test or ANOVA on means |
| **Two-day special cause** (M2 insert changed 13 Apr, offset not re-taught until 15 Apr) | `machine == M2`, 13–14 Apr 2026 | +0.15 mm true on those parts | X̄-S beyond limits on 3 subgroups; I-MR on daily means; the change log |
| **Measurement system** (hand-held gauge, no method) | Gage study; also adds noise to every baseline value | Repeatability sd 0.030; operator bias +0.035 / −0.025 mm | Gage R&R fails; the "after" study passes |
| **Common-cause part-to-part variation** | Everything else | sd 0.09 mm true | Cp ≈ Pp; the process is incapable even without F3 |
| **Two impossible records and five blanks** | `B01146` = 12.50 mm logged "pass" (keyed in hundredths; true ≈ 0.125); `B00168`, `B00225`, `B00641`, `B00646`, `B01320` blank with `result` = pass | 6 rows | Data audit before any chart |
| **What does not verify** | Operator (`operator_id`): no effect beyond shift. Machine: "verifies" then dissolves — M2 is where F3 lives. Trend over time: none | — | A4 |

### 4.2 Week 3 — Gage R&R

**Design:** 10 parts spanning −0.17 to +0.18 mm true position, three operators (one per
shift: OP-12, OP-22, OP-32), two trials, randomized; tolerance 0.50 mm (±0.25).
Interaction p = 0.60 in both studies, so the software pools it (Minitab does this above
p = 0.25 by default; a learner who leaves the interaction in gets figures within 1 point of
these).

| Source | SD (mm) | Study var (6 SD) | %Study variation | %Tolerance |
|---|---|---|---|---|
| Total Gage R&R | 0.0392 | 0.235 | **34.9** | **47.1** |
| Repeatability | 0.0303 | 0.182 | 26.9 | 36.3 |
| Reproducibility (operator) | 0.0250 | 0.150 | 22.2 | 30.0 |
| Part-to-part | 0.1053 | 0.632 | 93.7 | 126.3 |
| Total variation | 0.1124 | 0.674 | 100 | — |

Number of distinct categories = 1.41 × 0.1053 ÷ 0.0392 = 3.78 → **3**. Operator means:
OP-12 0.016, OP-22 0.042, OP-32 −0.010 mm — a spread of 0.052 mm, a tenth of the tolerance,
between people reading the same parts. **Verdict: unacceptable on all three criteria** (the
house thresholds are in [`../templates/msa-plan.md`](../templates/msa-plan.md)): both
components fail, repeatability slightly worse than reproducibility. The sentence: *"Almost
half the tolerance is consumed by the gauge and the way it is used; the gauge can only sort
parts into three bands, so the inspection decision near ±0.25 is a coin toss and the baseline
chart is blurred."*

**After** (written method: part seated in the check block against datum A, gauge zeroed on
the master at shift start, reading taken at a two-second count; same parts, same operators):

| Source | SD (mm) | %Study variation | %Tolerance |
|---|---|---|---|
| Total Gage R&R | 0.0113 | **10.4** | **13.5** |
| Repeatability | 0.0099 | 9.1 | 11.8 |
| Reproducibility (operator) | 0.0054 | 5.0 | 6.5 |
| Part-to-part | 0.1075 | 99.5 | — |

ndc = 13.46 → **13**. Marginal by the 10–30% band on both criteria and accepted with a plan:
the baseline and pilot charts carry the note "gauge R&R 13.5% of tolerance"; the closure
capability claim is confirmed on the CMM in the monitoring pack. Operator spread falls to
0.012 mm.

**Like-for-like decision the key expects.** The baseline log (2 Mar–8 May) was collected
under the old method, and the pilot file was measured under the *same* old method so that
before and after compare like for like (★ I3: same collection method). The written method
runs in parallel from week 4 and becomes the station standard at handover, with the change
dated on the chart. A learner who instead switches the station to the new method in week 4
and compares pilot to baseline must date the change and say that about 0.03 mm of observed
spread left the chart with the gauge, not with the countermeasure. Either choice passes if
it is written down; an undated switch is a data-ethics stop.

### 4.3 Week 4 — audit, stability, capability

**Audit.** 1,500 rows. Five blanks logged as pass (the inspector recorded a decision without a
number); one value of 12.50 mm logged as pass (a 0.125 keyed without the point). Expected
handling: exclude the six from the numeric analysis, keep them in the record with the reason,
and add "value must be within ±1.00 mm or the entry is refused" to the data collection plan.
Clean n = **1,494**. A learner who keeps 12.50 gets overall sd 0.349 and Ppk 0.20 — the
number to look for on a page that claims the process is "far worse than we thought".

**Baseline (clean):** mean **+0.037 mm**, overall sd **0.133**; **101 fails of 1,494 =
6.76%**; first-pass yield 93.2%; **DPMO 67,604**; Z_bench 1.49; sigma level **3.0
(1.5-shift convention)**. Rework: 101 parts × mean 19.6 min (median 18) = 1,980 min = 33 h
over ten weeks on the sampled parts alone.

**X̄-S chart** (150 subgroups of 10, shift within day; X̄-R gives the same picture): x̿ = 0.037,
s̄ = 0.127, X̄ limits **−0.087 to +0.160**, S upper limit 0.217. Beyond the X̄ limits:
**13 Apr Night (0.169), 14 Apr Day (0.260), 14 Apr Night (0.172)**; beyond the S limit: 13 Apr
Night (0.225). I-MR on the 50 daily means: centre 0.037, limits −0.054 to +0.127; 14 Apr
(0.182) above. Stratify those days by machine: M2 parts on 13–14 Apr average **+0.239 mm
(n = 39)** against +0.056 on M2's other days (Welch t = 8.3, p < 0.001); M1 on the same days
averages −0.021. The change log (released on request) has the insert change on 13 Apr Swing
and the offset re-taught on 15 Apr Day — a tool change with no offset-reset step in the
changeover standard. The learner keeps the points, explains them on the chart, and reports
capability both ways.

**Capability** (specification ±0.25 from drawing note 6; within-subgroup sd from s̄/c₄ =
0.130; overall sd 0.133):

| Basis | Cp | Cpk | Pp | Ppk | Expected ppm (overall) | Observed ppm |
|---|---|---|---|---|---|---|
| All clean data (n = 1,494) | **0.64** | **0.55** | **0.63** | **0.53** | 69,897 | 67,604 |
| Excluding M2 on 13–14 Apr (n = 1,455) | 0.65 | 0.57 | 0.65 | 0.57 | 59,071 | 57,732 |

Two readings the key expects: Cp ≈ Pp, so the process is not being hurt by between-subgroup
drift — it is wide every hour of every day; and the two-day event is not what makes it
incapable (Cpk 0.55 vs 0.57). The mean sits +0.037 high because a quarter of parts come off F3.
Sentence: *"Stable apart from two explained days in April; not capable — the process spread
alone is about 1.5 times the tolerance band, and it is centred slightly high."*

### 4.4 Week 5 — where the variation lives

| Stratum | n | Mean (mm) | SD (mm) | Fail rate |
|---|---|---|---|---|
| F1 | 357 | 0.004 | 0.112 | 2.2% |
| F2 | 366 | 0.007 | 0.121 | 4.4% |
| **F3** | 394 | **0.132** | 0.125 | **15.7%** |
| F4 | 377 | −0.003 | 0.123 | 4.0% |
| Day | 499 | 0.026 | 0.119 | 3.8% |
| Swing | 496 | 0.036 | 0.119 | 4.2% |
| **Night** | 499 | 0.048 | **0.156** | **12.2%** |
| M1 | 723 | 0.006 | 0.117 | 3.3% |
| M2 | 771 | 0.066 | 0.141 | 10.0% |
| Operators OP-11 … OP-33 | 146–184 each | 0.022–0.052 | Day/Swing 0.114–0.128; Night 0.151–0.167 | Day/Swing 2.7–5.4%; Night 10.1–14.7% |

The multi-vari (fixture within shift) is the exhibit that separates the two causes: F3 sits
at +0.13 on every shift (0.137 / 0.133 / 0.126); Night is wider on every fixture (sd 0.130–0.160
vs 0.097–0.110). F3 accounts for 62 of the 101 fails; Night for 61; the overlap is 24.

Expected short list after the C&E matrix: F3 locating pin (fixture); night thermal drift
(machine/environment); gauge method (measurement — already handled); operator technique
(the sponsor's cause — kept on the list to be tested, not assumed away).

### 4.5 Week 6 — the tests

**Fixture F3 — verifies.** Welch two-sample t, F3 (n = 394) vs the other three fixtures
(n = 1,100): difference **+0.129 mm, 95% CI 0.115 to 0.143**, t = 17.9, p < 0.001.
One-way ANOVA across fixtures: F(3, 1490) = 112, p < 0.001; Tukey: F3 differs from each of
F1, F2, F4 by 0.125–0.135 mm; F1, F2, F4 do not differ from one another (adjusted p ≥ 0.63).
Fail rate: **15.7% (62/394) vs 3.5% (39/1,100)**, chi-square 66.5, df 1, p < 0.001. Sentence:
*"Parts off fixture F3 sit 0.13 mm further out than parts off any other fixture — half the
distance to the tolerance limit — and fail four times as often; F3 alone accounts for six of
every ten rejects. Nothing else about F3's machine, shift or operators explains it."*

**Night shift — verifies, as a spread cause.** ANOVA on shift means: F(2, 1491) = 3.37,
p = 0.035, but the largest mean difference is 0.02 mm — real and trivial. The equal-variance
test (Levene p < 0.001; Bartlett p < 0.001) and the S chart by shift are the evidence: Night
sd 0.156 vs 0.119. Fail rate by shift: Night 12.2%, Day 3.8%, Swing 4.2%; chi-square 35.6,
df 2, p < 0.001. Sentence: *"Night-shift parts are centred in the same place as the other
shifts but are spread about 30% wider, so three times as many fall outside the band; the
cause is in the machine's condition on nights, not in who is running it."* A learner who runs
only a t-test on means and concludes "night is not different" has the right test for the
wrong question; A3 asks for the appropriate method.

**Machine — verifies, then dissolves (A4).** M2 vs M1: t = −9.0, p < 0.001, difference
0.06 mm. Within M2, F4 averages −0.003 with 4.0% fails; F3 averages 0.132 with 15.7%. The
machine effect is the fixture effect wearing a different label; the page should show the
stratification, not the t-test alone.

**Operator — does not verify (A4).** ANOVA across nine operators: F(8, 1485) = 1.18,
p = 0.31. Night operators' fail rates of 10–15% are the shift's spread; within Night the three
operators are indistinguishable (sd 0.151–0.167). Sentence for the sponsor: *"With 150–180
parts per operator we would have seen a difference of about 0.04 mm between operators if one
existed; we saw none."*

**Trend over time — does not verify.** Regression of deviation on day: slope 0.0003 mm per
day, p = 0.077, r² = 0.002.

**Prediction for Improve (I2), written at Tollgate 3:** if F3 is brought to the other
fixtures' position, F3's fail rate falls from 15.7% to about 4% and the line's from 6.8% to
about 4%; Cpk rises from 0.55 to about 0.7 because the mean centres; the process remains
incapable until the night spread is addressed.

### 4.6 Week 7–8 — pilot

**Countermeasure in the shipped pack:** F3 locating pin replaced; clamp-torque check added to
the changeover standard work with a go/no-go gauge (poka-yoke on the setting that wore the
pin); offset-reset step added after every insert change (from the April event). Night warm-up
deliberately left for the next cycle. Two weeks, 1–12 June, all shifts, same sampling, same
gauge and method as the baseline.

| Measure | Baseline (n = 1,494) | Pilot (n = 300) |
|---|---|---|
| Overall mean (mm) | +0.037 | **+0.006** |
| Fails | 101 (6.76%) | **14 (4.67%)** |
| DPMO | 67,604 | 46,667 |
| F3 mean (mm) | 0.132 (n = 394) | **0.019 (n = 80)** |
| F3 fails | 62/394 = 15.7% | **3/80 = 3.75%** |
| Fails by shift | Day 19 · Swing 21 · Night 61 | **Day 0 · Swing 0 · Night 14** |
| Cp / Cpk / Pp / Ppk | 0.64 / 0.55 / 0.63 / 0.53 | **0.72 / 0.70 / 0.70 / 0.69** |
| Rework, min per week | 198 | 151 |

Tests the key expects: F3 before vs after, Welch t = 8.4, p < 0.001, shift of **−0.11 mm**;
F3 vs other fixtures within the pilot, p = 0.21 — F3 is now indistinguishable from the
others. Line fail rate 6.76% → 4.67%: two-proportion z = 1.35, **p = 0.18**, 95% CI for the
difference −1.1 to +4.4 points. On the X̄-S chart continued with baseline limits, 0 of 30
pilot subgroups are beyond the limits and the mean of means moves from 0.037 to 0.006 — a
centring the learner should describe as "consistent with the prediction, not yet proven on
the chart; keep the limits and watch for the run".

**The honest reading that earns ★ I3:** the countermeasure did to F3 exactly what the
prediction said; the line's fail rate moved in the predicted direction, but 300 parts cannot
confirm a 2-point drop with confidence; every one of the 14 pilot rejects is a night-shift
part, which is the second verified cause, untouched by design. Next cycle: spindle warm-up
before the Night shift's first batch. A page that claims "rejects down 31%" from the pilot
alone, or that hides the night rejects, has not read its own chart.

### 4.7 Response packs for other countermeasures (Practicum track)

The shipped `mfg-pilot.csv` is the pack for a countermeasure aimed at the verified F3 cause.
For any other countermeasure the practicum instructor generates the pack from `generate.py`'s
`mfg_rows()` with the parameter below, dates it, and releases it as the plant would release an
extract. The learner's honest reading of the result is what is scored, not the choice.

| Learner's countermeasure | Aimed at | Parameter | What the pack shows |
|---|---|---|---|
| Night warm-up cycle before first batch | Verified cause 2 | `MFG_NIGHT_MULT` 1.6 → 1.0 | Night sd falls to day level; night fails fall to about 4%; F3 still at +0.13; line fail rate ≈ 5% |
| F3 pin **and** warm-up | Both | both changes | Line fail rate ≈ 3%; Cpk ≈ 0.85; still not 1.33 — common cause remains |
| Retraining night operators / 100% inspection on nights | The sponsor's unverified cause | no change (`tool_event=False`) | Nothing moves; inspection hours rise; the learner's "did not work, here is why" earns I3 |
| Gauge method only | Measurement | `meas_sd` 0.037 → 0.011 | Observed sd falls ~0.005; fail rate barely moves; a learner who claims improvement has confused measurement with process |

### 4.8 Monitoring pack (30 working days after handover) and the planted drift

Generated by the instructor: 30 working days after the F3 countermeasure, all shifts, same
sampling. Planted: on days 18–20 F3 returns to +0.09 mm (a changeover where the torque check
was skipped — the log shows the go/no-go gauge missing from the kit). The response plan
should call for the fixture check at the first subgroup beyond the limit or the first run of
three F3 parts above +0.15 on the stratified chart; a control plan that only watches the
overall X̄ chart sees a single borderline point and misses it. Recovery on day 21 after the
check. This exercises ★ C1 and feeds the `sustained` reading, which on the Practicum track is
`not-applicable`.

### 4.9 Simulated cost table (C3 — every figure labelled simulated)

| Item | Basis | Value |
|---|---|---|
| Rework labour | 19.6 min per reject × loaded rate $38/h | $12.40 per reject |
| Rejects per week, line (all parts, 600/shift × 15 shifts, at 6.76%) | 608 rejects | $7,540 per week |
| At the pilot rate 4.67% | 420 rejects | $5,210 per week |
| Difference, annualized over 48 weeks | Hard (labour avoided is redeployable, Finance's call) or soft — Finance states which | ≈ $112,000 simulated |
| Assembly returns | Two lots per quarter, $4,800 each | Cost avoidance, not claimed until 90 days |

Finance partner (instructor in role) accepts the calculation basis at Tollgate 2: rejects ×
minutes × rate, no annualization beyond 48 weeks, no counting the night-shift fails the pilot
did not touch.

### 4.10 Common learner errors the facilitator should expect

- Charting the raw 1,500 rows as an I-MR chart of individual parts: it works but wastes the
  subgroup structure; the X̄-S by shift-day is what shows the April event and the night spread.
- Deleting the April subgroups "because they were explained": explained points stay on the
  chart with a note; capability is reported both ways.
- Reporting sigma level 3.0 without the convention.
- Concluding "night is fine" from a t-test on means.
- Attributing the machine effect to M2 and proposing an M2 overhaul.
- Claiming the 31% reject reduction from two weeks; or, the opposite error, reporting "no
  significant change" and missing that F3 did exactly what was predicted.

---
*v1.0 · 2026-09-20*
