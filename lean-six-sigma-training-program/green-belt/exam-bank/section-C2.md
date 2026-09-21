# Green Belt Exam Bank — Section C2: Analyze, hypothesis tests and interpretation

Part of the Green Belt certification item bank. Blueprint, minimally competent candidate
statement, tag format and form-assembly rules: [`../exam-bank.md`](../exam-bank.md). Policy:
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).

**Reading the exhibits.** Fenced blocks are software-style outputs in the layout the course
uses in the stats lab (week 6). The same numbers come from Minitab, the Excel stats add-in
(Data Analysis ToolPak: t-Test, ANOVA: Single Factor, Regression) and R (`t.test`, `aov`,
`chisq.test`, `lm`) or Python (`scipy.stats`, `statsmodels`); only the labels differ. Two-sample
t results do not assume equal variances unless the exhibit says so. Every number states its
units and basis in the stem. All outputs are illustrative and internally consistent; none is
from a real employer.

Correct option ✅; tag in brackets; rationale after the dash.

---

## Section C2 — Analyze: t-tests, ANOVA, chi-square, correlation, simple regression, confidence intervals, interpretation (56 CERT)

**C2-1.** A packaging plant compares cycle time per case (minutes, from label print to pallet scan, same shift, same product, 30 cases sampled per line over one week).

```
Two-Sample T-Test and CI: Cycle_min by Line
Line   N   Mean   StDev  SE Mean
A     30  42.60    5.10     0.93
B     30  38.90    4.70     0.86
Difference = μ(A) − μ(B)
Estimate for difference: 3.70
95% CI for difference: (1.17, 6.23)
T-Value = 2.92   DF = 57   P-Value = 0.005
```

Which sentence do you give the sponsor?
A. "p = 0.005 proves Line B is the better line." · B. "Line B runs about 3.7 minutes per case faster than A — plausibly 1 to 6 minutes, roughly 9% of A's cycle — so it is worth finding out what B does differently." ✅ · C. "The lines differ by 3.7 minutes, and because p is below 0.05 the cause of the difference is confirmed." · D. "The standard deviations overlap the difference, so the lines are the same within noise."
`[C2 · G5 · Analyze · MFG · X · CERT]` — The sentence carries the size, the interval and the practical read; C is wrong because the test shows a difference exists, not what causes it.

**C2-2.** Two inpatient units are compared on discharge time (minutes from discharge order to patient leaving the room, 12 discharges sampled per unit in the same fortnight).

```
Two-Sample T-Test and CI: Discharge_min by Unit
Unit   N   Mean  StDev  SE Mean
4     12  148.0   40.0     11.5
6     12  131.0   44.0     12.7
Difference = μ(4) − μ(6)
Estimate for difference: 17.0
95% CI for difference: (−18.6, 52.6)
T-Value = 0.99   DF = 21   P-Value = 0.333
```

The Green Belt's correct reading is:
A. Units 4 and 6 perform the same; remove "unit" from the cause list · B. Unit 4 is 17 minutes slower; start the countermeasure there · C. The test failed because the standard deviations are large; compare medians instead · D. The data cannot tell the units apart — the true gap could be anything from Unit 4 being 19 minutes faster to 53 minutes slower — so with 12 discharges per unit, collect more before deciding ✅
`[C2 · G5 · Analyze · HC · X · CERT]` — A non-significant result at small n is "not detected," not "no difference," and the wide interval says so; A turns absence of evidence into evidence of absence.

**C2-3.** A shared-services team pilots a new invoice template and measures processing time per invoice (minutes of processor touch time, 400 invoices each way). The project goal is a 1-minute reduction.

```
Two-Sample T-Test and CI: Proc_min by Template
Template   N   Mean  StDev  SE Mean
Old      400   6.42   1.50     0.075
New      400   6.21   1.50     0.075
Difference = μ(Old) − μ(New)
Estimate for difference: 0.210
95% CI for difference: (0.002, 0.418)
T-Value = 1.98   DF = 798   P-Value = 0.048
```

Which conclusion is best?
A. The difference is probably real but tiny — about 13 seconds per invoice against a goal of 60 — so the template is not the lever the project needs ✅ · B. p is below 0.05, so the new template works; roll it out · C. The interval touches zero, so there is no effect · D. 400 per group is too many; re-run the pilot with 30 per group
`[C2 · G5 · Analyze · TXN · X · CERT]` — Large samples make small effects significant; the effect size, not the p-value, answers the sponsor's question, and B mistakes statistical for practical significance.

**C2-4.** A machining cell wants to know whether a new fixture reduces bore-diameter variation. The new fixture was installed on the day shift, which also received a new bar-stock lot that week; the old fixture stayed on nights with the old lot. The team has 40 parts from each fixture.

A. Run the two-sample t-test; a p-value under 0.05 settles it · B. Run a one-way ANOVA with fixture as the factor · C. Do not run the comparison yet — fixture, shift and material lot change together, so any difference cannot be attributed; re-run with both fixtures on the same shift and lot, or stratify the data so each factor can be separated ✅ · D. Use a paired t-test, since this is a before-and-after comparison
`[C2 · G5 · Analyze · MFG · S · CERT]` — A confounded comparison cannot verify a cause no matter how small the p-value; A tests the wrong question with confidence.

**C2-5.** A team wants to verify "Supplier B's gasket stock is thinner" as a cause of leaks. Both outputs come from the same week.

```
Gage R&R Study — Thickness_mm (ANOVA method)
Source            %Study Var   %Tolerance
Total Gage R&R        41.6         38.2
  Repeatability       36.9         33.9
  Reproducibility     19.2         17.7
Number of Distinct Categories = 3

Two-Sample T-Test and CI: Thickness_mm by Supplier
Supplier   N    Mean   StDev
A         25  2.0310  0.0180
B         25  2.0190  0.0200
Difference = μ(A) − μ(B)
Estimate for difference: 0.0120
95% CI for difference: (0.0012, 0.0228)
T-Value = 2.23   DF = 47   P-Value = 0.031
```

The correct next step is:
A. Supplier B stock is thinner by 0.012 mm (p = 0.031); switch suppliers · B. Stop: a gage that consumes 38% of tolerance with three distinct categories cannot reliably see a 0.012 mm difference — fix the measurement system, then re-measure and re-test ✅ · C. Increase the sample to 100 per supplier to narrow the interval · D. Use a paired t-test because the same gage measured both suppliers
`[C2 · G5 · Analyze · MFG · X · CERT]` — A test is only as good as the numbers going in, and a failed MSA means the difference may be measurement noise; C narrows the interval around a number that may still be wrong.

**C2-6.** A contact centre changed its call script. A two-sample t-test on average handle time (minutes per call, 250 calls each way) gives a 95% CI for the reduction (old minus new) of (2.1, 5.3) minutes, p < 0.001. The project target was a 1.5-minute reduction. The best plain-language statement is:
A. "95% of calls were between 2.1 and 5.3 minutes shorter." · B. "There is a 95% chance the true reduction is exactly 3.7 minutes." · C. "We are 95% confident the script cut average handle time by somewhere between 2.1 and 5.3 minutes — even the low end beats the 1.5-minute target." ✅ · D. "The reduction is significant, so the effect is 5.3 minutes."
`[C2 · G5 · Apply · TXN · X · CERT]` — The interval is about the average, not individual calls, and comparing its low end to the target is what makes it useful to a sponsor; A confuses a CI for a mean with the spread of individual calls.

**C2-7.** A ward wants to know whether a redesigned medication-reconciliation form shortens the task. Twenty nurses each complete one reconciliation on the old form and, a week later, one on the new form (minutes, timed by observer). The right analysis is:
A. A paired t-test on each nurse's before-minus-after difference ✅ · B. A two-sample t-test treating the old-form and new-form times as independent groups · C. A one-way ANOVA with nurse as the factor · D. A chi-square test on nurse × period counts
`[C2 · G5 · Apply · HC · S · CERT]` — Each nurse is her own control, so pairing removes nurse-to-nurse variation from the comparison; B throws that advantage away and will often miss a real change.

**C2-8.** Fifteen loan reviewers timed one file review before and one after a new checklist (minutes per file; baseline mean 41.2 min).

```
Paired T-Test and CI: After − Before
             N    Mean   StDev  SE Mean
Difference  15   −9.40    6.80     1.76
95% CI for mean difference: (−13.17, −5.63)
T-Test of mean difference = 0 (vs ≠ 0): T-Value = −5.35   P-Value < 0.001
```

The sentence for the sponsor:
A. "Fifteen reviewers is too few for this result to be trusted." · B. "The checklist cut review time by 13.2 minutes." · C. "p < 0.001 means there is a 99.9% chance the checklist works." · D. "Reviewers were on average 9.4 minutes faster with the checklist — plausibly 6 to 13 minutes, about a quarter of the 41-minute baseline — and the gain showed up across reviewers, not just a few." ✅
`[C2 · G5 · Analyze · TXN · X · CERT]` — Size, interval and practical fraction of baseline, with the pairing read correctly; B reports the interval's edge as if it were the estimate.

**C2-9.** Twelve moulding machines were each measured for scrap rate (% of shots, one week) before and after a nozzle change. Two analyses were run on the same data.

```
Two-Sample T (Before vs After, treated as independent)
Period   N   Mean  StDev
Before  12  27.40   5.60
After   12  25.50   5.90
Estimate for difference: 1.90   95% CI: (−2.97, 6.77)   T = 0.81   P = 0.427

Paired T (After − Before, by machine)
             N   Mean  StDev
Difference  12  −1.90   1.80
95% CI for mean difference: (−3.04, −0.76)   T = −3.66   P = 0.004
```

Why do the results disagree, and which is right?
A. The paired analysis is correct: machine-to-machine variation (SD about 5.7 points) swamps a 1.9-point change unless each machine is its own control, which the paired test provides ✅ · B. The two-sample analysis is correct; the paired result is an artefact of small n · C. Report both and let the sponsor choose · D. The disagreement shows the data are unreliable and should be recollected
`[C2 · G5 · Analyze · MFG · X · CERT]` — Pairing removes between-machine variation from the denominator, which is exactly why the study was designed that way; B ignores the study design.

**C2-10.** A hospital lab's target for stat potassium turnaround is 45 minutes (receipt to result, minutes). A sample of 40 stat requests over one week:

```
One-Sample T: TAT_min
Test of μ = 45 vs ≠ 45
 N   Mean  StDev  SE Mean     95% CI       T      P
40  49.80  11.20     1.77  (46.22, 53.38)  2.71  0.010
```

The best reading:
A. 95% of samples take between 46 and 53 minutes · B. The lab meets the target, since 45 is close to 46.2 · C. Average turnaround is about 5 minutes over target (plausibly 46 to 53 minutes), and with an SD of 11 minutes many individual samples miss by far more — both the average and the spread need work ✅ · D. p = 0.010 means there is a 1% chance the lab is on target
`[C2 · G5 · Apply · HC · X · CERT]` — The interval is for the mean; the SD tells the sponsor about individual results, and both matter for a target; A applies the CI to individuals.

**C2-11.** Tensile strength (MPa) of M10 bolts from four suppliers, 20 bolts each, one gage, one operator.

```
One-way ANOVA: Strength_MPa versus Supplier
Source     DF       SS      MS      F      P
Supplier    3  14500.0  4833.3  22.16  0.000
Error      76  16577.5   218.1
Total      79  31077.5
S = 14.77   R-Sq = 46.7%

Supplier   N    Mean  StDev
A         20  812.0   14.2
B         20  798.0   15.8
C         20  835.0   13.9
D         20  809.0   15.1
```

Which sentence is right for the sponsor?
A. "All four suppliers differ from each other, because p < 0.001." · B. "Supplier C's bolts are clearly the strongest (about 835 MPa, 23–37 MPa above the others) and B's the weakest; A and D cannot be told apart; supplier choice accounts for close to half the strength variation we see." ✅ · C. "The F-value of 22 means Supplier C is 22 times better." · D. "The differences are noise, because the standard deviations (14–16 MPa) overlap the means."
`[C2 · G5 · Analyze · MFG · X · CERT]` — ANOVA's p says at least one mean differs; the group means, their gaps relative to S, and R-sq give the practical story; A over-reads a single p-value as pairwise proof.

**C2-12.** Average handle time (minutes per call) at five call centres, 200 calls each, same week, same call types.

```
One-way ANOVA: AHT_min versus Centre
Source   DF       SS     MS     F      P
Centre    4    31.02  7.754  3.72  0.005
Error   995  2076.64  2.087
Total   999  2107.66
S = 1.445   R-Sq = 1.5%

Centre  N   Mean  StDev
1     200   5.98   1.42
2     200   6.38   1.51
3     200   6.12   1.38
4     200   6.47   1.47
5     200   6.21   1.44
```

The correct conclusion:
A. Centre 4 (6.47 min) is the problem centre; retrain it · B. p = 0.005 confirms location as the root cause of long handle times · C. The test is invalid because 200 per centre is too many · D. The centres differ statistically, but centre explains only 1.5% of handle-time variation — the means span 0.5 minutes while calls within a centre vary by 1.4 — so the causes worth chasing vary within centres, not between them ✅
`[C2 · G5 · Analyze · TXN · X · CERT]` — R-sq and the ratio of between-centre spread to within-centre spread show a real but unimportant factor; B confuses a significant factor with a root cause.

**C2-13.** Time from order to first dose (minutes) on three units, 15 orders each.

```
One-way ANOVA: Order_to_dose versus Unit
Source  DF      SS     MS     F      P
Unit     2   228.7  114.3  1.72  0.191
Error   42  2788.0   66.4
Total   44  3016.7

Unit   N   Mean  StDev
A     15   53.2    4.1
B     15   54.9    4.3
C     15   58.6   12.8
```

The Green Belt should:
A. Set the means aside and first find out why Unit C's times vary three times as much as A's and B's — the unequal spread both breaks the test's assumption and is the more important finding ✅ · B. Report p = 0.191 as evidence the units are equivalent · C. Drop Unit C's slowest orders as outliers and re-run · D. Raise alpha to 0.10 so the difference is detected
`[C2 · G5 · Analyze · HC · X · CERT]` — ANOVA assumes similar spread, and a group with triple the SD is the story; C removes the inconvenient data instead of investigating it.

**C2-14.** Changeover time (minutes) by shift, five changeovers observed per shift.

```
One-way ANOVA: Changeover_min versus Shift
Source  DF     SS    MS     F      P
Shift    2   5.43  2.72  0.28  0.764
Error   12 118.32  9.86
Total   14 123.75

Shift  N   Mean  StDev
1      5  14.80   2.90
2      5  16.20   3.40
3      5  15.10   3.10
```

The correct statement for the test plan:
A. Shifts are identical; strike shift from the fishbone · B. Shift 2 is worst at 16.2 minutes; act on it · C. With five observations per shift this test could only detect a very large gap; record "no difference detected at this sample size" and keep shift on the list until a larger sample or a stratified chart rules it out ✅ · D. Use chi-square instead because there are three groups
`[C2 · G5 · Analyze · MFG · X · CERT]` — Low power turns "not significant" into "not tested hard enough," which the rubric's A4 item asks the candidate to acknowledge; A converts weak evidence into a firm elimination.

**C2-15.** A benefits team asks: "Does the rejection rate of applications (rejected yes/no) differ across our four intake channels (web, phone, mail, walk-in)?" They have 1,800 applications from last quarter with channel and outcome recorded. The right test is:
A. One-way ANOVA on the rejection rate by channel · B. A chi-square test of association on the channel × outcome count table ✅ · C. A two-sample t-test on the two largest channels · D. Correlation between channel number and rejection
`[C2 · G5 · Apply · TXN · S · CERT]` — Both variables are categorical, so counts in a two-way table are the data; A treats a yes/no outcome as a continuous measurement.

**C2-16.** Missed outpatient appointments by reminder channel, one quarter, 300 appointments randomly assigned per channel.

```
Chi-Square Test for Association: Channel, Outcome
              Missed   Kept   Total
No reminder       62    238     300
                46.0  254.0
SMS               41    259     300
                46.0  254.0
Phone call        35    265     300
                46.0  254.0
Total            138    762     900
Cell contents: Count / Expected count
Pearson Chi-Square = 10.322, DF = 2, P-Value = 0.006
```

The sentence for the clinic manager:
A. "Missed appointments are linked to reminder channel: about 21% with no reminder against 14% with SMS and 12% with a call — a 7 to 9 point drop, roughly 21 to 27 fewer missed slots per 300 appointments." ✅ · B. "Phone calls are significantly better than SMS." · C. "Reminders cause a 2-point improvement." · D. "p = 0.006 means reminders explain 99.4% of missed appointments."
`[C2 · G5 · Analyze · HC · X · CERT]` — The row percentages and their gap are the effect; the omnibus test does not compare SMS with calls, so B claims a pairwise result the exhibit does not test.

**C2-17.** Defect type by shift on a coating line, one week's rejects.

```
Chi-Square Test for Association: Shift, Defect
          Run    Scratch   Blister   Total
Day        18        4         3       25
         17.4      4.3       3.3
Swing      15        6         2       23
         16.0      3.9       3.0
Night      20        3         5       28
         19.5      4.8       3.7
Total      53       13        10       76
Cell contents: Count / Expected count
Pearson Chi-Square = 2.712, DF = 4, P-Value = 0.607
* NOTE * 6 cells with expected counts less than 5
```

The correct reading:
A. p = 0.607 shows defect type is unrelated to shift · B. Night shift has the most blisters; focus there · C. Six of nine cells have expected counts below 5, so the chi-square result is unreliable — combine the two rarer defect types or collect more weeks before drawing any conclusion ✅ · D. Switch to ANOVA on the defect counts
`[C2 · G5 · Analyze · MFG · X · CERT]` — The expected-count rule is the test's precondition and the software flags it; A reads a p-value the exhibit itself warns against.

**C2-18.** Rework by processing clerk, 200 files each, one month.

```
Chi-Square Test for Association: Clerk, Rework
        Rework    None   Total
A          28     172     200
         30.7   169.3
B          45     155     200
         30.7   169.3
C          19     181     200
         30.7   169.3
Total      92     508     600
Pearson Chi-Square = 13.429, DF = 2, P-Value = 0.001
```

Files are routed by type: Clerk B receives the commercial accounts, A and C the retail ones. The Green Belt's correct conclusion:
A. Clerk B causes rework; retrain B · B. The association is significant, so clerk is the verified root cause · C. The test is invalid because clerks are people rather than process factors · D. Rework is associated with clerk, but clerks receive different file types — check whether commercial files carry the rework at any clerk before concluding anything about B ✅
`[C2 · G5 · Analyze · TXN · X · CERT]` — Association is not cause, and the stem hands the candidate the confounder; A aims a countermeasure at a person for a difference the routing rule may explain.

**C2-19.** A pharmacy asks: "Is time from order to first dose (minutes, continuous, from the system log) different under the new verification workflow than the old one?" Orders under each workflow come from different weeks and different patients. The right test:
A. Chi-square on workflow × late/on-time counts · B. Correlation between workflow and minutes · C. Paired t-test on the two workflows · D. Two-sample t-test on minutes by workflow, after plotting both distributions to check spread and shape ✅
`[C2 · G5 · Apply · HC · S · CERT]` — A continuous Y across two independent groups is the two-sample case; C requires each order to be measured under both workflows, which these were not.

**C2-20.** Seal strength (N) against oven temperature (°C) on 48 sealed pouches, temperature read from the oven's calibrated probe.

```
Correlation: Seal_N, Oven_C
Pearson correlation of Seal_N and Oven_C = 0.620
P-Value = 0.000   N = 48
```

The plain-language sentence:
A. "Seal strength rises 0.62 N for every degree." · B. "Higher oven temperature goes with higher seal strength, and temperature accounts for about 38% of the variation we see — so other factors matter at least as much." ✅ · C. "Temperature explains 62% of seal-strength variation." · D. "p < 0.001 proves temperature is the root cause of weak seals."
`[C2 · G5 · Apply · MFG · X · CERT]` — r² (0.38) is the share of variation explained; C reports r as if it were r², the most common misreading of a correlation output.

**C2-21.** Wait time at a licensing counter (minutes) against queue length at arrival (people), 50 customers.

```
Correlation: Wait_min, Queue_len
Pearson correlation = 0.120   P-Value = 0.407   N = 50
```

The scatter plot shows waits falling as the queue grows from 0 to 6 (a second window opens at 5), then rising steeply from 7 upward. The correct reading:
A. r measures straight-line association only; the plot shows a curved relationship, so the finding is real and the number is the wrong summary of it ✅ · B. There is no relationship between queue length and wait · C. Collect more customers until p drops below 0.05 · D. Run simple regression, which handles curves automatically
`[C2 · G5 · Analyze · TXN · X · CERT]` — Plot first: a near-zero r can hide a strong non-linear pattern; B trusts the coefficient over the picture.

**C2-22.** Falls per month on a rehabilitation unit against agency-staff hours that month, six months of data.

```
Correlation: Falls, Agency_hrs
Pearson correlation = 0.850   P-Value = 0.032   N = 6
```

One month (agency hours 310, falls 9) sits far from the other five (agency hours 40–95, falls 1–3). The Green Belt should:
A. Treat the cause as verified — r = 0.85 with p < 0.05 · B. Remove the far month and recompute · C. Treat this as a lead, not a verification: six points with one of them driving the line cannot verify anything, so collect more months and stratify by census before testing ✅ · D. Accept six points because p is below 0.05
`[C2 · G5 · Analyze · HC · X · CERT]` — One influential point in six can manufacture a large r; B deletes the inconvenient month instead of getting enough data to know what it means.

**C2-23.** Across 52 weeks, nurse overtime hours per week and inpatient falls per week correlate at r = 0.58, p < 0.001. Both series also rise and fall with weekly patient census. The best conclusion:
A. Overtime causes falls; cap overtime · B. Both variables move with census, so the link may be a shared cause rather than overtime driving falls — compare weeks at similar census, or test overtime's effect within census bands, before concluding ✅ · C. r = 0.58 is weak; ignore it · D. The direction is reversed: falls cause overtime
`[C2 · G5 · Analyze · HC · X · CERT]` — A lurking variable named in the stem is the discriminator; A treats correlation as causation and aims a countermeasure at it.

**C2-24.** Simple regression of seal strength (N) on oven temperature (°C), the 48 pouches from C2-20; oven range in the data 150–190 °C.

```
Regression Analysis: Seal_N versus Oven_C
Seal_N = 12.4 + 0.0850 Oven_C
Predictor    Coef   SE Coef      T      P
Constant    12.40     2.710   4.58  0.000
Oven_C     0.0850   0.01586   5.36  0.000
S = 1.90   R-Sq = 38.4%   R-Sq(adj) = 37.1%
```

The correct interpretation of the slope:
A. Seal strength is 12.4 N at 150 °C · B. Temperature explains 85% of seal strength · C. Within 150–190 °C, each extra 1 °C of oven temperature is associated with about 0.085 N more seal strength — about 0.85 N per 10 °C ✅ · D. Raising the oven 10 °C guarantees 0.85 N more strength on every pouch
`[C2 · G5 · Apply · MFG · X · CERT]` — The slope is a rate in Y-units per X-unit, over the range observed; D turns an average association into a per-part guarantee.

**C2-25.** Processing time per invoice (minutes) against number of line items, 40 invoices.

```
Regression Analysis: Proc_min versus Items
Proc_min = 4.60 + 1.32 Items
Predictor   Coef  SE Coef     T      P
Constant    4.60    1.319  3.49  0.001
Items       1.32    0.168  7.87  0.000
S = 3.78   R-Sq = 62.0%   R-Sq(adj) = 61.0%
```

Which sentence is correct?
A. "Line-item count accounts for about 62% of the variation in processing time; each extra line item adds about 1.3 minutes on average." ✅ · B. "62% of invoices are predicted correctly." · C. "Each line item adds 4.6 minutes." · D. "An R-sq of 62% is too low to be useful."
`[C2 · G5 · Apply · TXN · X · CERT]` — R-sq is the share of variation explained and the slope is the per-item effect; C reads the intercept as the slope.

**C2-26.** Using the C2-24 model (data 150–190 °C), an engineer proposes setting the oven to 230 °C and predicts 12.4 + 0.085 × 230 = 31.9 N. The Green Belt's correct response:
A. Accept the prediction and set the oven to 230 °C · B. The prediction is valid because R-sq is 38% · C. The prediction is valid because p < 0.001 · D. The model has no data above 190 °C, so 31.9 N is an extrapolation the line may not hold (seal material can scorch); if 230 °C is worth trying, run a small trial there rather than compute it ✅
`[C2 · G5 · Analyze · MFG · X · CERT]` — A regression describes the range it was fitted on; A applies it 40 °C outside that range.

**C2-27.** For the C2-25 model, the residuals-versus-fitted-values plot shows residuals tightly clustered (±2 min) at fitted values below 10 minutes and fanning out to ±12 min at fitted values above 20. The correct reading:
A. The funnel proves the relationship is not real · B. Variation in processing time grows with invoice size, so the line is a fair description of the average but predictions for large invoices will be far less precise than S = 3.8 suggests — say so, and look at what drives the big-invoice spread ✅ · C. Residual plots matter only for multiple regression · D. Remove the large invoices so the residuals look even
`[C2 · G5 · Analyze · TXN · X · CERT]` — A fan pattern means non-constant spread, which limits prediction more than the slope; D deletes data to satisfy the plot.

**C2-28.** In the C2-24 output, S = 1.90 N. The specification window for seal strength is 5 N wide. The right use of S:
A. S is the standard error of the slope · B. S = 1.90 means 1.9% of variation is unexplained · C. S is the average seal strength · D. S is the typical scatter of individual pouches around the line — roughly ±2 × 1.9 ≈ ±4 N — so even with temperature held perfectly, pouch-to-pouch variation nearly fills a 5 N window and temperature control alone will not hold the spec ✅
`[C2 · G5 · Apply · MFG · X · CERT]` — S is in Y-units and describes prediction precision; A confuses it with the coefficient's SE, which is in Y-per-X units.

**C2-29.** A 95% confidence interval for a mean is best described as:
A. A range of plausible values for the true mean given the data; the method captures the true value in 95% of repeated samples ✅ · B. The range that contains 95% of the individual observations · C. A 95% probability that the sample mean is correct · D. The range the process will stay inside during the control phase
`[C2 · G5 · Understand · NEU · K · CERT]` — The interval is about the parameter, not the observations; B is the CI-versus-spread confusion that C2-6 and C2-10 test in context.

**C2-30.** A team's 95% CI for mean cycle time is 2 minutes wide with n = 30 and they want it about 1 minute wide. Keeping everything else the same, they need roughly:
A. Twice the sample (60) · B. Four times the sample (about 120), since interval width shrinks with the square root of n ✅ · C. A 99% confidence level · D. To remove the widest observations
`[C2 · G5 · Understand · NEU · K · CERT]` — Width scales with 1/√n, so halving it costs four times the data; A is the intuitive linear guess.

**C2-31.** A new admission form is compared with the old on nurse completion time (minutes, 18 admissions per form, different patients).

```
Two-Sample T-Test and CI: Complete_min by Form
Form   N   Mean  StDev
New   18  22.40  11.60
Old   18  19.80  10.90
Difference = μ(New) − μ(Old)
Estimate for difference: 2.60
95% CI for difference: (−5.03, 10.23)
T-Value = 0.69   DF = 33   P-Value = 0.493
```

The right statement:
A. The two forms are equivalent · B. The new form is 2.6 minutes slower; drop it · C. The data are consistent with anything from the new form being 5 minutes faster to 10 minutes slower — the question is unanswered at 18 per group, so state that and size a larger comparison ✅ · D. Because the interval includes zero, the result is wrong
`[C2 · G5 · Analyze · HC · X · CERT]` — An interval spanning zero widely is an inconclusive result, not a tie; A reports equivalence the data cannot support.

**C2-32.** A Green Belt suspects that two identical presses produce different shim thicknesses. She has four measured parts from each press and wants to run a two-sample t-test now. The best advice:
A. Run it; a small sample is fine if p comes out under 0.05 · B. Use chi-square instead · C. Run it, and if p > 0.05 remove press from the cause list · D. Use the software's power and sample-size tool with the smallest thickness difference worth detecting and the process SD, collect that many parts per press, then test ✅
`[C2 · G5 · Apply · MFG · S · CERT]` — Four per group can only detect huge differences and a non-result would mean nothing; C would eliminate a plausible cause on an under-powered test.

**C2-33.** Setting alpha at 0.05 for a test means the team accepts:
A. A 5% chance the countermeasure will fail · B. That 5% of the data may be discarded · C. A 95% chance the alternative hypothesis is true · D. A 5% risk of declaring a difference when none exists (a false alarm, Type I error) ✅
`[C2 · G5 · Understand · NEU · K · CERT]` — Alpha is the false-alarm rate under the null; C is the inverted-probability reading that leads to over-claiming.

**C2-34.** A claims team screened twelve suspected causes of late payments, one two-sample t-test each, same month of data.

```
Cause tested            P-Value
Adjuster                  0.61
Claim type                0.44
Day of week               0.03
Region                    0.72
Intake channel            0.19
Attachment count          0.88
Policy age                0.51
Amount band               0.27
Reviewer                  0.66
Prior claim               0.35
Language flag             0.09
System (old/new)          0.58
```

The right conclusion:
A. With twelve tests at α = 0.05 about one false alarm is expected by chance alone; treat "day of week" as a lead to confirm on fresh data, not as a verified cause ✅ · B. Day of week is verified, since p < 0.05 · C. Eleven causes are eliminated and one is confirmed · D. Lower alpha to 0.01 and the problem goes away
`[C2 · G5 · Analyze · TXN · X · CERT]` — Multiple testing inflates false alarms and a screening hit needs replication; B treats one p-value in a batch of twelve as proof.

**C2-35.** Time to bed (minutes from ED decision-to-admit to arrival on the ward) under two bed-assignment methods, nine admissions each.

```
Descriptive Statistics: Bed_min by Method
Method   N   Mean  Median  StDev  Min   Max
Board    9   38.0    22.0   28.4   11    92
Pager    9   77.0    24.0  128.6   12   410
```

A Green Belt wants to run a two-sample t-test. The best advice:
A. Run it; the t-test is robust to non-normality · B. Do not test means on nine heavily skewed values per group — plot both groups, compare medians and the long-tail cases (what happened at 410?), and collect more admissions before testing ✅ · C. Delete the 410-minute case as an outlier and run the test · D. Log-transform, run the t-test, and report the mean of the logs as minutes
`[C2 · G5 · Analyze · HC · X · CERT]` — Means of nine skewed values are unstable and the extreme case is information, not noise; A leans on a robustness that needs larger n.

**C2-36.** A team's before/after comparison of length of stay (days) gives p = 0.11. A member notes that removing three long-stay patients from the "after" group brings p to 0.02. The correct action:
A. Remove them; three points are a small fraction · B. Remove them and note it in the appendix · C. Keep them only if the sponsor agrees · D. Keep them: investigate each long stay as a possible special cause and report the test with them in — and, if a documented reason justifies it, also without, clearly labeled as such ✅
`[C2 · G5 · Analyze · HC · S · CERT]` — Removing points to move a p-value is the data-ethics line the program draws; B makes the same choice with a footnote.

**C2-37.** A collections team measured "calls resolved on first contact" for a baseline, then changed the definition mid-project so that a call transferred within the team now counts as resolved. They want to run a chi-square test on baseline versus post-change resolution counts. The right call:
A. Run the test; the definition change is small · B. The comparison is invalid — the operational definition changed between before and after — so re-collect the baseline under the new definition (or re-score the after period under the old) before any test ✅ · C. Run the test and adjust alpha to 0.01 for the definition change · D. Use a paired t-test instead
`[C2 · G5 · Analyze · TXN · S · CERT]` — A test compares numbers, and the two sets no longer measure the same thing; A would report a change that is partly the definition.

**C2-38.** A unit manager tells a Green Belt "before the huddle board, door-to-triage was about 20 minutes — I remember it well," and asks for a t-test against this month's 14-minute average from the system log. The correct response:
A. Run the one-sample t-test against 20 minutes · B. Run a two-sample t-test with the remembered value as one group · C. Do not test a remembered baseline; pull the pre-change period from the same system log under the same definition, or, if none exists, say the before/after comparison cannot be made and start a proper baseline now ✅ · D. Average the remembered value with the log value
`[C2 · G5 · Analyze · HC · S · CERT]` — A baseline reconstructed from memory is not data, and the same system log almost certainly holds the real one; A dresses a recollection in a p-value.

**C2-39.** A torque-wrench station runs at three tool settings. The question is whether mean torque (N·m, from a calibrated checker, 25 joints per setting) differs across the settings. The right test:
A. One-way ANOVA of torque by setting, followed by plots of the three groups ✅ · B. Three separate two-sample t-tests · C. Chi-square on setting × pass/fail · D. Correlation between setting number and torque
`[C2 · G5 · Apply · MFG · S · CERT]` — One continuous Y across three groups is ANOVA's case; B inflates the false-alarm rate and answers a different question three times.

**C2-40.** A billing team wants to know whether the error rate (invoices with at least one error, yes/no) is lower on the new form than on the old one; they have 500 invoices from each. The right test:
A. Two-sample t-test on the two error rates · B. One-way ANOVA with form as the factor · C. A chi-square test of association on the form × error count table (equivalently, a two-proportion test) ✅ · D. Paired t-test, since the same team processed both
`[C2 · G5 · Apply · TXN · S · CERT]` — Two proportions from independent groups are a 2 × 2 table; D pairs at the wrong level, since invoices are not matched.

**C2-41.** A clinic asks whether rooming time (minutes) is related to the number of medications on a patient's list (a count from 0 to 22). Both are recorded for 120 visits. The right first analysis:
A. Chi-square on medication count × rooming time · B. A scatter plot of rooming time against medication count, then correlation and simple regression if the pattern is roughly linear ✅ · C. One-way ANOVA with medication count as the factor · D. A two-sample t-test on patients above and below 10 medications
`[C2 · G5 · Apply · HC · S · CERT]` — Continuous Y against a numeric X is the correlation/regression case, and the plot comes first; D throws away most of the information in X by splitting it in two.

**C2-42.** A contact centre's service standard is an average speed of answer of 20 seconds. The Green Belt has one week of 400 calls from the phone system and wants to know whether the centre is meeting the standard on average. The right test:
A. Two-sample t-test comparing this week with the standard · B. Chi-square on answered/not-answered counts · C. Correlation between call number and answer time · D. One-sample t-test of mean answer time against 20 seconds, with the 95% CI reported alongside ✅
`[C2 · G5 · Apply · TXN · S · CERT]` — One sample against a fixed target is the one-sample case; A treats a constant as a second group.

**C2-43.** In plain language, the null hypothesis of a two-sample t-test comparing suppliers says:
A. Supplier A is better than B · B. Supplier makes no difference to the mean; the test then asks how surprising the observed gap would be if that were true ✅ · C. The sample means are equal · D. The samples are large enough
`[C2 · G5 · Understand · NEU · K · CERT]` — The null is a statement about the process means, and the p-value is computed assuming it; C mistakes the sample means (which almost never match) for the process means.

**C2-44.** A test returns p = 0.03. This means:
A. There is a 3% chance the null hypothesis is true · B. There is a 97% chance the improvement works · C. The effect is 3% · D. If there were truly no difference, data at least this far apart would occur about 3% of the time ✅
`[C2 · G5 · Understand · NEU · K · CERT]` — The p-value is the probability of the data given the null, not of the null given the data; A is the inversion most sponsors make and the Green Belt has to correct.

**C2-45.** "Statistically significant" and "practically significant" differ in that:
A. Statistical significance says the difference is unlikely to be chance; practical significance is whether the size of the difference matters to the sponsor — a verification needs both ✅ · B. Practical significance is the p-value in plain words · C. Statistical significance implies practical significance when n is large · D. Practical significance replaces the need for a test
`[C2 · G5 · Understand · NEU · K · CERT]` — Two different questions, one about chance and one about size; C is backwards — large n makes trivially small differences significant.

**C2-46.** Door-to-doctor time (minutes, from registration timestamp to first physician note) before and after a triage redesign, 60 patients sampled each period, same weekday mix.

```
Two-Sample T-Test and CI: D2D_min by Period
Period   N   Mean  StDev
Before  60  31.40   9.80
After   60  24.10   8.60
Difference = μ(Before) − μ(After)
Estimate for difference: 7.30
95% CI for difference: (3.97, 10.63)
T-Value = 4.34   DF = 116   P-Value = 0.000
```

The sponsor sentence:
A. "p < 0.001 means the new triage works 99.9% of the time." · B. "The redesign cut door-to-doctor time by 10.6 minutes." · C. "The redesign cut average door-to-doctor time by about 7 minutes — plausibly 4 to 11 — roughly a quarter off the 31-minute baseline, provided nothing else changed between the two periods." ✅ · D. "95% of patients are seen 4 to 11 minutes sooner."
`[C2 · G5 · Analyze · HC · X · CERT]` — Size, interval, fraction of baseline and the before/after caveat; D applies a CI for the mean to individual patients.

**C2-47.** Days to close a claim against claim amount (thousands of dollars), 120 claims.

```
Regression Analysis: Days versus Amount_k
Days = 11.2 + 0.0310 Amount_k
Predictor    Coef  SE Coef     T      P
Constant    11.20    0.914 12.25  0.000
Amount_k   0.0310  0.00978  3.17  0.002
S = 6.41   R-Sq = 7.8%   R-Sq(adj) = 7.0%
```

The correct conclusion:
A. p = 0.002 makes claim amount the root cause of slow closure · B. The association is statistically clear but claim amount explains under 8% of the variation in closing time — about 0.3 extra days per additional $10,000 — so it is not the main lever ✅ · C. An R-sq of 7.8% means the test failed · D. Larger claims take 3.1% longer to close
`[C2 · G5 · Analyze · TXN · X · CERT]` — Significance with a small R-sq is a real but minor factor; A promotes a weak predictor to root cause on the strength of p alone.

**C2-48.** Regression of discharge delay (minutes from discharge order to departure) on the number of orders still pending when the discharge order was written, 80 discharges: `Delay_min = 38.0 + 6.20 Pending`, slope p < 0.001, R-Sq = 41%. The slope means:
A. Each additional pending order is associated with about 6 extra minutes of delay; a patient with five pending orders averages about 69 minutes ✅ · B. Each pending order adds 38 minutes · C. Delay grows 6.2% per pending order · D. Pending orders explain 6.2% of delay variation
`[C2 · G5 · Apply · HC · X · CERT]` — Slope in Y-units per X-unit, applied to a concrete case; B reads the intercept as the per-order effect.

**C2-49.** Pairwise comparison output for the supplier ANOVA in C2-11.

```
Grouping Information Using the Tukey Method and 95% Confidence
Supplier   N   Mean  Grouping
C         20  835.0  A
A         20  812.0    B
D         20  809.0    B C
B         20  798.0      C
Means that do not share a letter are significantly different.
```

The correct reading:
A. Supplier D is in two groups, so the analysis is inconclusive · B. The letters rank the suppliers: A best, C worst · C. Only C differs; the other three are equal · D. Suppliers that share a letter cannot be told apart at this confidence: A and D are indistinguishable, D and B likewise, but A differs from B, and C differs from all three ✅
`[C2 · G5 · Analyze · MFG · X · CERT]` — Overlapping groups are normal and D's double membership is exactly what "cannot be told apart from either neighbour" looks like; A treats that as a failure of the method.

**C2-50.** A team has this quarter's counts of five defect types and last year's published proportions of the same five types. To ask "has the mix of defect types changed from last year?", the right test is:
A. Chi-square test of association on a defect × quarter table · B. One-way ANOVA on the counts · C. Chi-square goodness-of-fit of this quarter's counts against last year's proportions ✅ · D. Correlation between this quarter's and last year's counts
`[C2 · G5 · Understand · NEU · K · CERT]` — One set of counts against known expected proportions is goodness-of-fit; A needs raw counts for both periods, and the stem gives last year only as proportions.

**C2-51.** Before comparing mean fill weight (g) across four filler heads, the team checks spread.

```
Test for Equal Variances: Fill_g versus Head
Head   N   StDev
1     30    1.21
2     30    1.18
3     30    2.64
4     30    1.25
Levene's Test: Test Statistic = 4.87, P-Value = 0.004
```

The right response:
A. Assume equal variances and run the standard one-way ANOVA · B. Head 3 is more than twice as variable as the others — that spread difference is a finding to investigate in its own right; if means are still compared, use a method that does not assume equal variances and say so ✅ · C. Levene's p < 0.05 shows the mean fill weights differ · D. Pool all four heads and report one overall SD
`[C2 · G5 · Analyze · MFG · X · CERT]` — Unequal spread is both an assumption check and often the more useful result; C reads a variance test as a test of means.

**C2-52.** A team plans a two-sample comparison of file-handling time (minutes). Their SD from the baseline is 5 minutes and the smallest difference worth acting on is 2 minutes.

```
Power and Sample Size — 2-Sample t Test
Testing mean 1 = mean 2 (versus ≠)
Calculating power for mean 1 = mean 2 + difference
α = 0.05   Assumed standard deviation = 5
Difference   Sample Size   Target Power   Actual Power
         2           100            0.8         0.8020
The sample size is for each group.
```

The correct reading:
A. 100 files in total will do · B. 100 per group guarantees the 2-minute difference will be found · C. About 100 files per group gives an 80% chance of detecting a 2-minute difference if it exists; the 30 per group the team had planned would likely miss it ✅ · D. Power 0.8 means 80% of the difference will show up
`[C2 · G5 · Apply · TXN · X · CERT]` — Power is the chance of detecting a real effect of the stated size at the stated n per group; B turns a probability into a guarantee.

**C2-53.** Changeover time on a labeller (hours per changeover, 30 changeovers over two months). The plant standard is 4.0 hours.

```
One-Sample T: Changeover_h
Test of μ = 4.0 vs ≠ 4.0
 N   Mean  StDev  SE Mean     95% CI       T      P
30  3.840  0.620    0.113  (3.61, 4.07)  −1.41  0.168
```

The right statement:
A. The average changeover is plausibly anywhere from 3.6 to 4.1 hours; the data cannot say it is below the 4-hour standard, and the sponsor should hear that rather than "3.84" ✅ · B. Changeover averages 3.84 hours, so the 4-hour standard is beaten · C. 95% of changeovers take between 3.6 and 4.1 hours · D. p = 0.168 means there is a 17% chance the mean is exactly 4.0
`[C2 · G5 · Apply · MFG · X · CERT]` — The interval, not the point estimate, is what you can defend; B reports the point estimate as if it had no uncertainty.

**C2-54.** Hours from sepsis alert to first antibiotic, 40 patients before and 40 after a new order-set protocol. The electronic-record "sepsis alert" banner also went live the same month the protocol started.

```
Two-Sample T-Test and CI: Hours by Period
Period   N   Mean  StDev
Before  40   4.60   1.50
After   40   3.10   1.20
Difference = μ(Before) − μ(After)
Estimate for difference: 1.50
95% CI for difference: (0.89, 2.11)
T-Value = 4.94   DF = 74   P-Value = 0.000
```

The Green Belt's correct conclusion:
A. The protocol is verified: p < 0.001 · B. A 1.5-hour change is too small to matter · C. The 1.5-hour drop (plausibly 0.9 to 2.1 hours) is real, but it cannot be attributed to the protocol alone because the alert banner started at the same time — separate the two (for example, units or weeks with the banner but not the order set) before claiming either ✅ · D. Use a paired t-test, since it is the same hospital
`[C2 · G5 · Analyze · HC · X · CERT]` — Two changes launched together are confounded; A credits one of them on a p-value that cannot distinguish them.

**C2-55.** Monthly customer complaints against promotional mailings sent (thousands), 36 months at a retail bank; slope 0.42 complaints per thousand mailings, r = 0.66, p < 0.001, R-Sq = 44%. Both series peak every fourth quarter, when transaction volume is highest. The correct conclusion:
A. Both series rise with seasonal volume, so volume — not mailings — may drive complaints; check the relationship within seasons or after adjusting for transaction volume before concluding ✅ · B. Mailings cause complaints; cut the mailing programme · C. R-sq of 44% proves the causal link · D. Complaints cause mailings
`[C2 · G5 · Analyze · TXN · X · CERT]` — A shared seasonal driver named in the stem is the lurking variable; B acts on a correlation as if the confounder had been ruled out.

**C2-56.** A Green Belt wants to run a chi-square test of defect category (five categories, classified by inspectors) against shift. The attribute agreement study on the classification, run in week 3, showed 71% agreement between inspectors and 68% against the reference standard. The best next step:
A. Run the chi-square; attribute agreement only matters for Gage R&R on measurements · B. Run the test on the pooled data of all shifts · C. Convert the counts to percentages and run ANOVA instead · D. Fix the classification system first — with 71% agreement, part of any shift-to-shift difference may be inspectors calling the same defect different names; repeat the agreement study after the fix, then test ✅
`[C2 · G5 · Analyze · MFG · S · CERT]` — A count-based test inherits every disagreement in how the counts were assigned; A applies the MSA rule to the wrong data type and skips the check the rubric makes mandatory.

<!--
Key tally (56 items): A = 14 (C2-3, 7, 9, 13, 16, 21, 25, 29, 34, 39, 45, 48, 53, 55) · B = 14 (C2-1, 5, 11, 15, 20, 23, 27, 30, 35, 37, 41, 43, 47, 51) · C = 14 (C2-4, 6, 10, 14, 17, 22, 24, 31, 38, 40, 46, 50, 52, 54) · D = 14 (C2-2, 8, 12, 18, 19, 26, 28, 32, 33, 36, 42, 44, 49, 56)
Type: X = 36 (64%) · S = 13 · K = 7
Bloom: Analyze = 32 · Apply = 17 · Understand = 7 · Remember = 0 (Apply/Analyze = 88%)
Vertical: MFG = 17 · HC = 16 · TXN = 16 · NEU = 7
Negative stems: 0
"When not to use" coverage: two-sample t (C2-4, 5, 9, 54) · paired t (C2-9, 40) · one-sample t (C2-38) · ANOVA (C2-13, 15, 51) · chi-square (C2-17, 56) · correlation (C2-21, 22, 23) · regression (C2-26, 27, 55) · CI/p-value (C2-31, 34, 35)
-->

v1.0 · 2026-09-20
