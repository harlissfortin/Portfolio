# Practicum Case — HC: Discharge Order to Departure, Four Inpatient Units

*The healthcare vertical case for the Green Belt live labs (weeks 2–8) and the Practicum
track. Sections 1–3 are the learner's case pack, released piece by piece on the calendar in
[`practicum-track-project.md`](practicum-track-project.md). Section 4 is the **facilitator
answer key**: what is planted and what every analysis returns. Do not hand section 4, or
`data/generate.py`, to learners. The data are simulated to behave like a real EHR extract;
every figure in this file is computed from the CSVs as shipped, except the go-see notes,
the timestamp audit and the cost basis, which are labelled illustrative.*

Level calendar and gates: [`../README.md`](../README.md). Rubric:
[`../project/review-rubric.md`](../project/review-rubric.md). Tollgate pages:
[`../project/tollgate-checklists.md`](../project/tollgate-checklists.md). The control-plan
template's filled HC example ([`../templates/control-plan.md`](../templates/control-plan.md))
is this case at handover.

**Files** (`data/`): `hc-discharge.csv` (1,234 rows — every discharge from four units,
5 Jan–26 Apr 2026, 112 calendar days) · `hc-attribute-agreement.csv` (50 rows — the
"discharge ready" study: 50 charts × 3 raters × 2 trials against a two-physician standard) ·
`hc-pilot.csv` (233 rows, 1–21 Jun 2026 — released after the pilot design and written
prediction are submitted).

---

## 1. The case

### 1.1 The sponsor's brief (as received — it contains two causes and a countermeasure)

> From: director of nursing, surgical and medical services. Bed turnover on 4E and 6S is too
> slow. Emergency-department boarding hours are up about a third since January, and those two
> units are where the beds get stuck. Discharge orders are written on morning rounds and the
> patients are still on the unit mid-afternoon. It is the afternoon workload — nurses on those
> units do not get to discharge tasks until after lunch — and physicians writing orders late.
> I want a "discharge by 11" target with a daily leaderboard on 4E and 6S and a discharge
> checklist for the nurses. Can your project make that stick before the summer census peak?

The learner's week 1 job is to take the causes ("afternoon workload", "late orders") and the
countermeasure ("leaderboard and checklist") out of the problem statement and keep all three
on a list for weeks 6 and 7, where the data decide what survives. Both causes are tested in
week 6; neither verifies.

### 1.2 The process

Four inpatient units discharge patients to home or home with services: **3W** (medicine, about
30% of discharges), **4E** (surgery, 25%), **5N** (orthopaedics, 20%) and **6S** (telemetry,
25%). A physician signs the discharge order in the EHR on rounds — nine in ten orders are
signed between 09:00 and 13:00. The order lands on the nurse's worklist. Discharge
medications are prescribed for 96% of patients; on **4E and 6S** the prescriptions go to the
**central pharmacy**, which verifies, fills and sends them to the bedside; on **3W and 5N**
most discharge medications are dispensed from the **unit cabinet** and only a few lines go to
central pharmacy. The nurse completes teaching, the clerk requests transport, a porter takes
the patient off the unit and the clerk clicks "patient left unit" on the tracking board. Bed
cleaning starts from that click.

**Go-see observations for the week 2 value stream map** (illustrative, from five walked
discharges on 4E and three on 3W): worklist queue median 30 min; nurse discharge tasks about
25 min of touch time; pharmacy verification-to-bedside on 4E 60–150 min, during which the
nurse and patient wait; on 3W the cabinet dispense takes about 10 min and the nurse does not
wait for it; teaching 15 min; transport request to porter arrival median 22 min; the porter
move 10 min. On a Monday walk the charge nurse showed the case-management inbox: home-care
and equipment confirmations requested on Saturday and Sunday are cleared on Monday morning,
and the Monday discharges wait for them. No procedure mentions it.

### 1.3 The customer document

*Patient-flow standard PF-03 (bed-management committee, revised 2025):* "A patient with a
discharge order is expected to have left the unit within **120 minutes** of the order being
signed, measured from the order timestamp to the tracking-board departure click." The customer
is the emergency department and bed management (internal): a bed that turns 60 minutes
earlier is 60 minutes less boarding for the next patient. The patient is a customer too, and
week 1 asks the learner to say so in the CTQ tree. The sponsor's "discharge by 11" is a
target for order time, not a specification for the delay; the learner should say which is
which.

### 1.4 The measurement system

Two timestamps. `order_time` is written by the EHR when the physician signs — a system
timestamp; the entry step is the physician's click. `actual_discharge_time` is the unit
clerk's click on the tracking board, made when the porter leaves with the patient — or, on a
busy afternoon, when the clerk gets back to the desk. The **timestamp audit** in the week 3
pack (illustrative, 30 observed departures against the recorded click, all four units, two
shifts): 29 of 30 within ±5 minutes; one keyed 40 minutes late at a shift change. The learner
treats the departure click as a measurement with a known, small, occasional lateness and
writes that on the chart.

"Discharge ready" is a **judgment**. The unit's readiness tally — used for the %C&A of the
first step on the value stream map, and the number behind the sponsor's belief that patients
are "not ready when the order is written" — is the charge nurse's yes/no reading of the chart
at the time of the order. Definition v1, as used on the units: *"Ready = discharge order
signed, medication reconciliation documented, and no pending consult."* The week 3 study
tests whether three charge nurses can make that call the same way twice and the same way as
a two-physician panel.

### 1.5 The change log (released on request in week 4)

The unit and hospital change log kept by the patient-flow coordinator, 3 January – 26 April.
Routine entries are real routine; two entries matter.

| Date | Entry |
|---|---|
| 03 Jan | Case-management weekend coverage ended (budget decision for the quarter); weekend home-care and equipment requests are queued to the Monday morning huddle |
| 12 Jan | Tracking-board software update; "patient left unit" button relabelled, same function |
| 26 Jan | Pharmacy: second discharge-medication verifier rostered weekdays 13:00–17:00 |
| 09 Feb | 6S telemetry monitor replacement complete |
| 23 Feb | 3W unit cabinet: two discharge medication lines added to stock |
| 09 Mar | Transport dispatch phone number changed; posters on all units |
| 16 Mar | EHR discharge order set: optional "anticipated discharge date" field added |
| 06 Apr | Pharmacy discharge worklist moved to the new queue screen; same staffing |
| 20 Apr | 6S: two long-stay discharges with same-morning home equipment delivery and Monday case-management sign-off (charge nurse note) |

### 1.6 Columns

| File | Column | Meaning | Type |
|---|---|---|---|
| discharge, pilot | `discharge_id` | Discharge | ID |
| | `date` | Calendar day the order was signed | Date |
| | `unit` | 3W / 4E / 5N / 6S | Category |
| | `weekday` | Mon … Sun | Category |
| | `order_time` | EHR timestamp, order signed (HH:MM) | Time |
| | `actual_discharge_time` | Tracking-board click, patient left unit (HH:MM) | Time |
| | `pharmacy_turnaround_min` | Central pharmacy: verified → at bedside, minutes; blank when no discharge medications (4%) | Continuous |
| | `transport_wait_min` | Transport requested → porter arrives, minutes | Continuous |
| attribute-agreement | `record_id`, `standard`, `R1_trial1` … `R3_trial2` | 50 charts; two-physician consensus standard; three charge nurses, two blind trials a week apart | Attribute agreement layout |

The primary metric is not a column: the learner computes **order-to-departure minutes** from
the two times. No discharge in the file crosses midnight (orders are signed 07:00–16:00), so
the subtraction is safe; the learner should check that before trusting it.

---

## 2. Week by week — which data, which tool, which rubric item

| Week | Data | Tool | Software | Rubric |
|---|---|---|---|---|
| 2 | Go-see notes; the two times for lead time; the readiness tally for %C&A | SIPOC; current-state value stream map with two paths (central pharmacy vs unit cabinet); lead time on the patient's calendar clock; %C&A; process cycle efficiency; operational definition of the primary metric | Any map tool; a spreadsheet for the ladder | M1, M2, D2 |
| 3 | `hc-attribute-agreement.csv`; the timestamp audit table | Attribute agreement analysis: within, between, each vs standard, all vs standard, kappa; the timestamp audit as the variable-form MSA on a system field | Minitab Stat > Quality Tools > Attribute Agreement Analysis (known standard column) · Excel toolkit MSA workbook (cross-tables and kappa by formula) · R `irr::kappam.fleiss()`, `irr::kappa2()`; Python `statsmodels.stats.inter_rater.fleiss_kappa` and Cohen's kappa by the formula in week 3 | ★ M3 |
| 4 | Order-to-departure by `date`, `unit`, `weekday` | Data audit; I-MR on the daily median (all units, then per unit); weekly p chart of discharges beyond 120 min; DPMO and sigma level against PF-03; the change log | Minitab Stat > Control Charts > Variables Charts for Individuals > I-MR; Attributes Charts > P; Stat > Quality Tools > Capability Analysis (one-sided, USL 120) · Excel toolkit capability calculator · R `qcc::qcc(type="xbar.one")`, `qcc(type="p")`; Python `numpy`/`scipy` with the constants table | M4 |
| 5 | All columns | Box plots by unit, weekday, order hour; scatter of delay vs pharmacy turnaround, stratified by unit; multi-vari (unit within weekday); fishbone → C&E matrix → FMEA; test plan from the selector | Minitab Graph > Boxplot (With Groups); Graph > Scatterplot (With Groups); Stat > Quality Tools > Multi-Vari · Excel PivotTable, box-and-whisker, scatter · R `ggplot2`; Python `seaborn` | A1, A2 |
| 6 | All columns | One-way ANOVA + Tukey on unit; Welch t on Monday; simple regression of delay on turnaround within unit; chi-square of "beyond 120" by unit; equal-variance check | Minitab Stat > ANOVA > One-Way; Stat > Basic Statistics > 2-Sample t; Stat > Regression > Fit Regression Model; Stat > Tables > Chi-Square Test for Association · Excel ToolPak Anova: Single Factor, t-Test (unequal variances), Regression, `CHISQ.TEST` · R `aov()` + `TukeyHSD()`, `t.test()`, `lm()`, `chisq.test()`; Python `scipy.stats.f_oneway`, `ttest_ind(equal_var=False)`, `chi2_contingency`, `statsmodels` `ols` and `pairwise_tukeyhsd` | ★ A3, A4 |
| 7 | Written prediction, then `hc-pilot.csv` | Countermeasure selection; pilot plan with stop rule and a comparison unit; poka-yoke on the order set; patient-flow module on the pharmacy queue | Pilot plan template | I1, I2, I4 |
| 8 | Baseline + pilot on one chart | I-MR of the 4E daily median continued with baseline limits; Welch t and two-proportion test before/after; capability after; control plan; response plan; standard work; simulated mission-metric table | Same as weeks 4 and 6 | ★ I3, ★ C1, C2, C3, S1 |

**The primary metric, as the learner should define it by Tollgate 1:** minutes from the EHR
discharge-order timestamp to the tracking-board "patient left unit" click, calendar minutes,
for every discharge to home or home with services on 3W, 4E, 5N and 6S, seven days a week;
reported as the daily median on an I-MR chart per unit and as percent of discharges beyond
120 minutes (PF-03). Guardrails: discharge medication packs prepared and then returned
(waste from preparing early); readmission within 7 days (the clinical guardrail, reported by
the unit, not in the extract).

**What the learner asks for, and when.** The extract in week 2 (given); the attribute study
and the timestamp audit in week 3 (given); the change log in week 4 (on request — a learner
who sees every Monday above the centre line, or the 20 April point on 6S, and does not ask
what happened has not investigated a signal); the pilot file in week 7 (released only after
the pilot design and prediction are on file); the simulated mission-metric table in week 8.

---

## 3. What the learner submits by gate

| Gate | On the one page |
|---|---|
| Tollgate 1 (wk 2) | Cause-free problem statement with the 131-minute median and 56% beyond 120 and their basis (all discharges, four units, 16 weeks, calendar minutes); charter with start (order signed) and stop (patient left unit); CTQ from PF-03 with the ED named as customer; SIPOC; stakeholder map naming the pharmacy lead and the physician group as resistance risks with the planned response |
| Tollgate 2 (wk 4) | Timestamp audit and the attribute study result with what was done; I-MR per unit with the Monday pattern and the 20 April point explained, not deleted; percent beyond 120, DPMO and sigma level per unit with PF-03 named as the source; the two transposed records handled in writing |
| Tollgate 3 (wk 6) | Fishbone → C&E → short list; box plots by unit and weekday; the unit ANOVA and the turnaround regression with effect sizes in minutes and the plain sentence; the order-time and weekend tests that did not verify, shown; the prediction for Improve |
| Tollgate 4 (wk 8) | Selection matrix; pilot plan with 6S as the comparison unit and the prediction; before/after chart on 4E with baseline limits; percent beyond 120 after; control plan with the 4E nurse manager named; standard work 4E-SW-014; simulated bed-hours with the class stated (mission metric, no money) |

---

## 4. FACILITATOR ANSWER KEY — do not distribute

### 4.1 What is planted

Generated with a fixed seed by `data/generate.py`; re-running reproduces the files exactly.

| Feature | Where | Size | Found by |
|---|---|---|---|
| **Pharmacy turnaround on the critical path** (central pharmacy fills discharge medications while the patient waits) | `unit` 4E and 6S: 100% of turnaround adds to the delay; 3W and 5N: 15% | +90 min on the unit mean; slope ≈ 1.0 min per min on 4E/6S, ≈ 0 on 3W/5N | Box plot by unit; ANOVA + Tukey; regression within unit; the two-path value stream map |
| **Longer turnaround on the slow units** (the same pharmacy, a longer worklist) | `pharmacy_turnaround_min`: 4E and 6S mean 105 / sd 40 true; 3W and 5N mean 55 / sd 20 | Median 95 and 105 vs 52 and 54 observed | Box plot of turnaround by unit |
| **Monday effect** (weekend case-management requests cleared Monday morning) | `weekday == Mon`, every unit | +40 min true; +43 observed | Box plot by weekday; a recurring pattern on the daily chart; Welch t; the change log |
| **Transport wait** | Every discharge | Mean 25, sd 18 min; adds minute for minute | Regression; a small real contributor that does not separate the units |
| **Common-cause spread** | Everything else | Base 55 min plus noise sd 25 min, floor 20, ceiling 600 | S ≈ 35 min within a fast unit; the process is not capable on any unit |
| **Two transposed records** | `D00098` (6S, 13 Jan, 10:31 → 08:56) and `D00149` (3W, 16 Jan, 10:41 → 09:06): departure 95 min *before* the order | 2 rows | Data audit before any chart; both are −95 min, a keyed hour |
| **Legitimate blanks** | `pharmacy_turnaround_min` blank for 47 discharges with no discharge medications | 47 rows | Not an error; the learner says so |
| **What does not verify** | Order time of day: no effect. Weekend: no effect. Trend over 16 weeks: none. Nursing "afternoon workload": on 4E the 14 discharges with no discharge medications average 92 min — the same nurses, the same afternoons, 3W's figure | — | A4 |

### 4.2 Week 3 — measurement system

**Timestamp audit (variable form, illustrative table in the learner pack):** 29 of 30
departure clicks within ±5 min; one 40 min late at a shift change. Verdict: the primary
metric's measurement is fit for a process whose spread is 60 minutes and whose effect sizes
are 40–90 minutes; the one late click is a known failure mode of the clerk's desk and goes on
the data collection plan ("click at the porter's departure, not at the desk"). This is the
★ M3 evidence for the primary metric: a system timestamp with the entry step checked, which
the reviewer accepts.

**Attribute agreement — "discharge ready", definition v1.** Standard: 30 ready, 20 not
ready. Three charge nurses (R1 days 3W, R2 days 4E, R3 evenings, rotating), two blind trials
a week apart, charts re-ordered between trials.

| Statistic | R1 | R2 | R3 | All |
|---|---|---|---|---|
| Within rater (trial 1 = trial 2) | 41/50 (82%) | 41/50 (82%) | 38/50 (76%) | — |
| Kappa, trial 1 vs trial 2 | 0.63 | 0.63 | 0.52 | — |
| Vs standard, both trials correct | 41/50 (82%), 95% CI 69–90% | 39/50 (78%), CI 65–87% | 35/50 (70%), CI 56–81% | — |
| Kappa vs standard (mean of two trials) | 0.81 | 0.73 | 0.64 | — |
| "Ready" charts called "not ready" (of 60 readings) | 5 | 8 | **14** | — |
| "Not ready" charts called "ready" (of 40 readings) | 4 | 5 | 4 | — |
| Between raters, all six readings agree | — | — | — | **20/50 (40%)** |
| All raters vs standard, all six correct | — | — | — | **20/50 (40%)** |
| Fleiss' kappa, six readings per chart | — | — | — | **0.52** |

Pairwise agreement on both trials: R1–R2 68%, R1–R3 52%, R2–R3 54%. **Verdict: unacceptable**
on the house thresholds ([`../templates/msa-plan.md`](../templates/msa-plan.md) Part B):
within-rater agreement is marginal for all three, between-rater and all-vs-standard are far
below 80%, and the overall kappa is in the middle band. The pattern: R3 calls one ready chart
in four "not ready", consistently in one direction; the case brief (not the CSV) has the
reason — R3 reads medication reconciliation as documented only when it appears in the
discharge navigator, while R1 and R2 also accept the reconciliation note in the progress
notes, and definition v1 says "documented" without saying where. R3 is not wrong; the
definition is silent. The sentence: *"Three charge nurses agree with each other on fewer than
half of the charts; the readiness tally cannot be a baseline for anything, and the belief
that patients are 'not ready' when the order is written rests on a number nobody can
reproduce."*

**What the key expects the learner to do.** (1) Keep the timestamp metric as primary — it
passed. (2) Retire the readiness tally as a project measure: the sponsor's "not ready" cause
is tested in week 6 through what the extract can measure (turnaround, transport, order time),
not through a judgment that cannot be made twice. (3) Rewrite definition v1 with the two
physicians ("reconciliation documented in the navigator *or* signed in the progress notes")
for the unit's own use and record that the %C&A on the value stream map was collected under
v1 and is not used again. A learner who instead retrains R3 to definition v1 has fixed the
person and not the definition; a learner who re-scores the baseline readiness tally under v2
from memory has crossed the data-ethics line. An instructor may run a v2 re-study in the lab
on the same 50 charts; there is no shipped file for it, and any figures used are labelled
illustrative.

### 4.3 Week 4 — audit, stability, capability

**Audit.** 1,234 rows. Two departures keyed before the order — both exactly 95 minutes before
(a keyed hour: 12:06 became 08:56; 12:16 became 09:06). Expected handling: exclude the two
from the numeric analysis, keep them in the record with the reason, and add "departure time
later than order time or the entry is refused" to the data collection plan. Forty-seven blank
turnarounds are discharges without discharge medications, not missing data. Clean n =
**1,232**. Weekday volume 12.7 discharges a day, weekend 6.8.

**Baseline (clean, all units):** mean **141.9 min**, median **131**, sd 64.3; **694 of 1,232
= 56.3% beyond 120 min**; 41.2% beyond 150. **DPMO 563,312**; Z_bench −0.16; sigma level
**1.3 (1.5-shift convention)**. One-sided Cpu against 120 is −0.11: the mean is above the
limit, and the arithmetic says only what the fraction already said. By unit:

| Unit | n | Mean | Median | SD | Beyond 120 | DPMO | Sigma (1.5 shift) |
|---|---|---|---|---|---|---|---|
| 3W | 369 | 94.2 | 92 | 34.9 | 23.0% | 230,352 | 2.2 |
| **4E** | 295 | **183.8** | **185** | 53.0 | **89.2%** | 891,525 | 0.3 |
| 5N | 244 | 98.5 | 96 | 32.5 | 23.4% | 233,607 | 2.2 |
| **6S** | 324 | **190.7** | **191.5** | 55.0 | **89.2%** | 891,975 | 0.3 |

**I-MR on the daily median, all units** (112 days): centre 133.3, MR̄ 34.4, limits **41.9 to
224.7**; MR limit 112.3. No point beyond the limits; longest run on one side 6. What the chart
shows instead is a **pattern**: every Monday — 16 of 16 — sits above the centre line, four of
them beyond 2σ, and the Monday medians average 171.7 against 126.9 on other days. A recurring
seventh-point pattern is a non-random signal; a learner who marks weekday on the chart or box
plots by weekday finds it in week 4 or week 5 and asks for the change log, where 3 January
explains it. A learner who reports "stable, no points beyond limits" and stops has read the
limits and not the chart. The I-MR on the daily mean (centre 140.6, limits 66.8 to 214.5) says
the same.

**Per unit** (about three discharges a day, so the daily median is noisy and the limits are
wide — the reviewer accepts either the daily-median I-MR or a weekly-median chart with 16
points, provided the choice is stated): 4E centre 180.4, limits 75.6 to 285.2, none beyond;
3W centre 91.4, limits 14.7 to 168.1, none beyond; **6S centre 190.1, limits 70.7 to 309.5,
one beyond — 20 April (a Monday), median 357.5 from two discharges of 383 and 332 min**. The
change log has the charge nurse's note for that day. The learner keeps the point, annotates
it and reports capability with and without it (it moves 6S's mean by 1 minute). Weekly p
chart of discharges beyond 120 min: p̄ 0.563, 16 weeks, n 61–96, limits about 0.39–0.73, no
point beyond.

**Capability sentence the key expects:** *"Predictable apart from a Monday pattern we can
explain and one explained day on 6S; not capable on any unit — the fast units miss the
two-hour standard one time in four, the slow units nine times in ten, and the two slow units
are the two on the central-pharmacy path."* Cp-style indices are not the honest report here;
percent beyond 120 by unit and the DPMO are.

### 4.4 Week 5 — where the variation lives

| Stratum | n | Mean (min) | Median | SD | Beyond 120 |
|---|---|---|---|---|---|
| 3W / 5N | 369 / 244 | 94.2 / 98.5 | 92 / 96 | 34.9 / 32.5 | 23.0% / 23.4% |
| **4E / 6S** | 295 / 324 | **183.8 / 190.7** | 185 / 191.5 | 53.0 / 55.0 | **89.2% / 89.2%** |
| **Monday** | 226 | **176.7** | 168 | 62.6 | **78.8%** |
| Tue–Fri | 789 | 133.8 | 116.5–126 | 59–66 | 51.2% |
| Sat / Sun | 106 / 111 | 135.0 / 135.3 | 124 / 126 | 58.7 / 63.5 | 50.9% / 52.3% |
| Order before 14:00 / after | 1,195 / 37 | 142.5 / 123.9 | — | — | — |

Pharmacy turnaround by unit: 3W median 52 (mean 54.9, sd 20.7, n 359); **4E 95 (100.5, sd
38.2, n 281)**; 5N 54 (55.0, sd 19.7); **6S 105 (107.5, sd 39.7, n 312)**. Transport wait:
median 22, mean 26, sd 18, no difference by unit.

The two exhibits that separate the causes: the **box plot by unit** (two fast, two slow,
pairing exactly with the pharmacy path on the map) and the **scatter of delay against
turnaround stratified by unit** — a 45-degree band on 4E and 6S, a flat cloud on 3W and 5N.
The multi-vari (unit within weekday) shows Monday adding about 40 minutes on every unit, on
top of the unit difference: the two causes are additive, not one cause in disguise.

Expected short list after the C&E matrix: pharmacy turnaround on the critical path (process
design, 4E/6S); Monday case-management queue (staffing design, all units); transport wait
(all units, small); order time of day (the sponsor's cause — kept on the list to be tested,
not assumed away); afternoon nursing workload (the sponsor's other cause — testable only
indirectly, and the key expects the learner to say how).

### 4.5 Week 6 — the tests

**Unit — verifies.** One-way ANOVA: F(3, 1228) = 422.5, p < 0.001, R² = 50.8%, S = 45.2 min.
Tukey: 4E − 3W **+89.6 (80.5 to 98.7)**; 6S − 3W +96.5 (87.6 to 105.3); 4E − 5N +85.3; 6S −
5N +92.1; 6S − 4E +6.8 (−2.5 to 16.2, p = 0.24); 5N − 3W +4.3 (−5.3 to 13.9, p = 0.65).
Assumptions: SD ratio 55.0/32.5 = 1.7 (Levene p < 0.001 — the slow units are also wider,
which the Welch version confirms: slow pair vs fast pair +91.5, CI 86.4 to 96.5, t = 35.6);
residuals right-skewed, and with 244 or more per group and a 90-minute effect the conclusion
does not depend on it. Chi-square of "beyond 120" by unit: 545.6, df 3, p < 0.001. Sentence:
*"Discharges on 4E and 6S take about 90 minutes longer than on 3W and 5N — 184 and 191 against
94 and 99 — and nine in ten miss the two-hour standard against one in four. The two slow
units are the two where the central pharmacy fills discharge medications while the patient
waits; nothing else about them differs."*

**Pharmacy turnaround — verifies as the mechanism, within unit.** Regression of delay on
turnaround, 4E (n = 281): slope **0.940 min per min, 95% CI 0.834 to 1.045**, p < 0.001,
R² = 52.5%, S = 34.2, intercept 93.9, turnaround range 24 to 251. 6S (n = 312): slope 1.053
(0.967 to 1.138), R² = 65.3%, intercept 81.6. 3W (n = 359): slope 0.011 (−0.166 to 0.188),
p = 0.90, R² = 0.0%. 5N (n = 233): slope 0.147 (−0.067 to 0.360), p = 0.18. Pooled across
units the slope is 1.24 and r = 0.76 — larger than on any single unit, because the slow units
also have the long turnarounds; the page fits within unit. Sentence: *"On 4E every minute of
pharmacy turnaround is a minute of discharge delay (CI 0.83 to 1.05); on 3W the same
turnaround adds nothing. The intercept, 94 minutes, is what a 4E discharge takes with instant
pharmacy — 3W's number. Turnaround explains half of 4E's delay variation."*

**Monday — verifies, as an additive cause.** Welch t, Monday (n = 226) vs Tuesday–Friday
(n = 789): **+42.9 min, CI 33.6 to 52.2**, t = 9.1, p < 0.001; within units +34 to +41, each
p < 0.001. Two-factor model (unit + weekday, no interaction): Monday coefficient +40.0;
weekday F(6, 1222) = 25.0, p < 0.001; weekday excluding Monday F = 0.05, p = 0.998. Sentence:
*"A Monday discharge takes about 40 minutes longer on every unit, fast or slow; from Tuesday
to Sunday the day of the week makes no difference at all. The log dates weekend
case-management cover ending on 3 January; Monday's discharges wait for the weekend's
confirmations."*

**Transport wait — real, small.** Adjusted for unit and weekday: slope 0.94 (0.82 to 1.06),
p < 0.001. On 3W it accounts for 29% of the delay variation; on 4E 7.6%. With sd 18 min it
is worth about 18 minutes of spread on every unit — a next-cycle candidate, not this project's
cause.

**Order time of day — does not verify (A4).** On 4E, slope 0.03 min per hour of order time,
p = 0.99, R² = 0.0%; all units −1.3 min per hour, p = 0.28. The 37 orders signed after 14:00
average 124 min against 142 — later orders are, if anything, faster. Sentence for the
sponsor: *"When the order is written has no bearing on how long the discharge takes; a
'discharge by 11' target would move the order and not the patient."*

**Weekend — does not verify.** Saturday and Sunday vs Tuesday–Friday: +1.4 min, CI −7.8 to
+10.7, p = 0.76, n = 217.

**Afternoon nursing workload — does not verify, indirectly.** The 14 discharges on 4E with no
discharge medications average **92 min** against 188 for the rest of 4E — the same nurses,
the same afternoons, 3W's figure. The learner says the sample is small (n = 14) and the
inference is indirect; a countermeasure aimed at nursing speed has no verified cause under it.

**Trend — does not verify.** Slope 0.035 min per day, p = 0.54, R² = 0.0%.

**Prediction for Improve (I2), written at Tollgate 3:** if 4E's pharmacy turnaround is
brought to 3W's level (median 95 → about 55), 4E's mean delay falls from 184 to about
**146** (93.9 + 0.94 × 55), percent beyond 120 from 89% to roughly 65–70%, and 6S — untouched
— stays at about 190. 4E stays slower than 3W by about 50 minutes because the pharmacy is
still on its critical path; only taking medications off the path closes that gap.

### 4.6 Weeks 7–8 — pilot

**Countermeasure in the shipped pack:** "meds at order" on 4E — a pharmacy technician on the
4E morning discharge round prepares discharge medications when the order is verified, with
the "meds at order" flag added to the order set (the poka-yoke row in the control plan
template). 6S is the untouched comparison unit. Three weeks, 1–21 June, all units, same
timestamps, same clerk click.

| Measure | 4E baseline (n = 295) | 4E pilot (n = 59) | 6S baseline (n = 324) | 6S pilot (n = 60) |
|---|---|---|---|---|
| Mean (min) | 183.8 | **132.7** | 190.7 | 196.8 |
| Median | 185 | **139** | 191.5 | 194.5 |
| SD | 53.0 | 44.0 | 55.0 | 57.4 |
| Beyond 120 | 89.2% | **57.6%** | 89.2% | 88.3% |
| Beyond 150 | 73.2% | 39.0% | 78.1% | — |
| 90th percentile | 249 | 190 | — | — |
| Pharmacy turnaround, mean | 100.5 | **56.1** | 107.5 | 106.8 |

Tests the key expects: 4E after vs before, Welch t = −7.9, p < 0.001, shift **−51.1 min, CI
−64.0 to −38.2** — the prediction (−38) sits inside the interval, at its edge. Beyond 120:
89.2% → 57.6%, two-proportion z = −6.0, p < 0.001. 6S: +6.2 min, CI −9.8 to +22.1, p = 0.44
— unchanged, so the June weeks did not move on their own; 3W −4.3 (p = 0.26) and 5N −8.0
(p = 0.27) agree. Within the pilot, 4E is still **42.8 min slower than 3W** (p < 0.001) and the
turnaround slope on 4E is still 1.03 (n = 55): the pharmacy is shorter and still on the path,
exactly as the prediction said. Mondays on 4E in the pilot: 166 (n = 5) against 130 — the
second cause, untouched by design.

On the 4E daily-median I-MR continued with baseline limits (centre 180.4, LCL 75.6): 18 of 20
pilot days below the centre line; a run of 12 below it from 9 June, so rule 2 fires on 18
June; 6 June (a Saturday with two discharges, median 57.5) below the LCL. The learner
describes it as "the shift the prediction called for, on the chart within three weeks; keep
the baseline limits until 25 post-change days are stable, then re-stage" — the limits
recalculation in the control plan template.

**The honest reading that earns ★ I3:** the countermeasure did to the turnaround what it was
designed to do and the delay followed the regression; 4E is now a 133-minute unit and still
misses the standard on six discharges in ten; the comparison unit did not move; Mondays did
not move. Next cycle: weekend case-management cover (all units, about 40 minutes on
Mondays), then medications off the critical path on 4E and 6S. A page claiming "4E fixed" or
"delay down 28%" without the 58% beyond-120 figure has not read its own chart; a page that
reports "prediction missed" because 133 is not 146 has confused a point prediction with its
interval.

### 4.7 Response packs for other countermeasures (Practicum track)

The shipped `hc-pilot.csv` is the pack for a countermeasure aimed at the verified turnaround
cause on 4E. For any other countermeasure the practicum instructor generates the pack from
`generate.py`'s `hc_rows()` with the parameter below, dates it, and releases it as the
hospital would release an extract. The learner's honest reading of the result is what is
scored, not the choice.

| Learner's countermeasure | Aimed at | Parameter | What the pack shows |
|---|---|---|---|
| Meds at order on 4E **and** 6S | Verified cause 1, both units | `tat_override={"4E": (55, 20), "6S": (55, 20)}` | Both slow units fall to about 135; hospital median falls about 25 min; no comparison unit left — the learner names that as the design's weakness |
| Weekend case-management cover | Verified cause 2 | `HC_MONDAY` 40 → 0 | Mondays fall to the other days' level on every unit (−40 min on Mondays, about −6 on the weekly mean); 4E and 6S still at 185–190 |
| Medications off the critical path on 4E (unit cabinet stock, pre-order preparation) | The mechanism, not the turnaround | `MEDS_ON_PATH["4E"]` 1.0 → 0.15 | 4E falls to about 100 — 3W's level; the strongest result, and the one most likely to be outside the sponsor's authority (pharmacy governance): the reviewer looks for the escalation on the page |
| "Discharge by 11" leaderboard and nurse checklist | The sponsor's unverified causes | no change (`tat_override=None`) | Nothing moves beyond noise; order times shift earlier if the instructor also shifts the order mean; the learner's "did not work, here is why" earns I3 |
| Transport: second porter on the day shift | The small real contributor | transport `gamma(25, 18)` → `gamma(15, 10)` | About −10 min on every unit; 4E and 6S still miss the standard |

### 4.8 Monitoring pack (30 days after handover) and the planted drift

Generated by the instructor: 30 calendar days on 4E after handover, same extract. Planted:
on days 15–19 the technician post is uncovered (leave, no backfill) and 4E's turnaround
returns to about 100 min — the daily median climbs to 170–190 for five days. The control plan
in the template catches it on day 15 at row 2 (any verified order older than 45 minutes on
the round sheet) before row 1 (the daily median) fires; the response is the pharmacist
covering the round, and the median returns by day 20. A control plan that only watches the
daily median sees the signal on day 17 or 18 and asks why two days later. This exercises
★ C1 and feeds the `sustained` reading, which on the Practicum track is `not-applicable`.

### 4.9 Simulated mission-metric table (C3 — every figure labelled simulated)

No money is claimed; the benefit class is **clinical/service impact**, validated by the
bed-management director (instructor in role) as mission-metric validator.

| Item | Basis | Value |
|---|---|---|
| 4E bed-minutes released per discharge | Baseline mean 183.8 − pilot mean 132.7 | 51 min (measured, pilot window) |
| 4E discharges per week | 295 over 16 weeks | 18.4 |
| Bed-hours released per week, 4E | 51 × 18.4 ÷ 60 | **≈ 15.7 bed-hours per week (simulated)** |
| ED boarding hours avoided | Not claimed: the link from a bed released to a boarder placed depends on the hour and the census; the validator states whether it is tracked | Cost avoidance / service, not counted |
| Medication packs prepared then returned | Guardrail, pharmacy return log | Pilot ran at 1–2 per week (simulated); reported, not netted |

The mission-metric validator accepts the calculation basis at Tollgate 2: measured-window
means, 4E only, no extrapolation to 6S until 6S has its own pilot.

### 4.10 Common learner errors the facilitator should expect

- Charting every discharge on an I chart: the skewed raw series fires rule 1 a dozen times on
  common cause; the daily median (or weekly median per unit) is the chart.
- Reading "no points beyond the limits" as "nothing to see" and missing 16 Mondays in a row
  above the centre line.
- Pooling the four units in one regression and reporting a slope of 1.24.
- Deleting the two transposed records silently, or the 20 April 6S point "because it was
  explained".
- Reporting Cpk on a metric whose mean is beyond the one-sided limit, or sigma level 1.3
  without the convention.
- Testing the sponsor's "late orders" cause and reporting only p = 0.99 without the
  sentence — or not testing it at all because the team already believed the pharmacy.
- Claiming "4E fixed" from three weeks, or claiming the prediction missed because 133 ≠ 146.
- Retraining R3 to definition v1.

---
*v1.0 · 2026-09-20*
