# Week 6 — Analyze II: Verifying Causes with Data (3 h self-paced + 2.5 h live lab)

**Where you are.** Week 5 ended with five checkable causes and a test plan: H₀ and H₁, α, the
practical difference that matters to the sponsor, the selector row, the data pulled. This
week you run the tests, and the live lab closes with **Tollgate 3 — Analyze**, scored on
rubric items A1–A4 including mandatory ★ A3: a cause tested with an appropriate method,
assumptions checked, effect size stated, conclusion in plain language. A p-value alone is a
hold at this gate.

Every test is taught the same way: the software runs it; you read four numbers (n, the
effect, its 95% confidence interval, p) and one assumption check; you finish with **the
sentence you would tell your sponsor**. The worked outputs are computed from the practicum
files in `../practicum/data/` (simulated, with planted effects); any other number is
illustrative and says so.

**Learning objectives.** By the end of this week the learner can:
1. Run a one-sample, two-sample (Welch) and paired t-test, check the assumptions from the
   plot and the normality output, and report n, effect, 95% CI and p.
2. Run a one-way ANOVA with Tukey comparisons, state which groups differ and by how much
   with intervals, and name what ANOVA does not test.
3. Run a chi-square test of association, read expected counts and cell contributions, and
   follow with a two-proportion interval for the pair that matters.
4. Run a Pearson correlation and a simple linear regression, read slope, CI, R² and S, check
   the residual plots, and state the X range the model holds for.
5. Write the sponsor sentence for any result, including the null-result sentence that earns
   rubric item A4.
6. Name the wrong test for a given design — paired data run unpaired, three t-tests instead
   of one ANOVA, a t-test on pass/fail — and say what each gets wrong.

---

## 6.1 Reading any output: four numbers, one check, one sentence (20 min)

**Hook.** Two Green Belts test the same cause. One reports "p = 0.003." The other reports
"fixture F3 places holes 0.135 mm further from nominal than F4, CI 0.118 to 0.153, on 394 and
377 parts; a quarter of the tolerance band." Only the second passes ★ A3, and only the second
lets a sponsor decide anything.

**Teach.** Read every output in the same order. **n** per group: how far the result can be
trusted, and whether a null result is a small-sample statement. **Effect**: the difference of
means, the mean paired difference, the difference in rates, the slope — in the metric's
units. **95% CI**: the range of true effects consistent with the data; its width is your
honesty device. **p**: whether chance alone is a plausible explanation at this n — last,
never first. **Assumption check**: the plot from week 5 plus the normality or residual output.

A 95% CI for a mean is x̄ ± t × s/√n; for a proportion, p ± 1.96 × √(p(1 − p)/n) at large n;
for a difference or a slope the software prints it. Three reading rules, against the
practical difference in your test plan: whole interval on the "matters" side — verified, act;
whole interval inside "does not matter" — set aside and record it (A4); straddling both — the
sample was too small to decide, and the sentence says so.

**The sentence template.** *"[Group]'s [metric] is [value] versus [value] — a difference of
[effect, units] (95% CI [lo] to [hi]) on [n] and [n] [units] collected [when]. Against
[tolerance, target or baseline] that means [practical meaning]. Next: [step]."* Fill every
slot. Filled cards for each test are in
[`../templates/hypothesis-test-selector.md`](../templates/hypothesis-test-selector.md).

**The cleaning log, before any test.** The practicum files carry faults you met in weeks 3–4:
an impossible 12.50 mm deviation keyed as a pass, five blank measurements, two discharges
whose departure precedes the order, a duplicated invoice row, eight spellings of yes/no. Each
exclusion goes in the cleaning log with its reason *before* the test and is shown at the
gate. Removing a point because it spoils a result is a different act — the rubric's
data-ethics stop. A large value that is *possible* stays in; report with and without it.

**Software.** Minitab prints all four numbers in one block. Excel's Analysis ToolPak gives t,
df and p but no interval for a difference — compute difference ± `T.INV.2T` × SE. R's
`t.test()` and Python's `scipy.stats` results carry the interval; `statsmodels` prints ANOVA
and regression tables.

---

## 6.2 One-sample and two-sample t-tests (35 min)

**Hook.** The week 5 box plot by fixture showed F3 above the other three. The plant manager
asked the right question: F3 and F4 share machine M2, so is it the fixture or the machine?
F3 versus F4 answers it, because the machine is the same for both.

**Teach.** The **one-sample t** compares a mean with a stated number: a target, a
specification, a supplier's claim. The **two-sample t** compares two independent groups.
Leave "assume equal variances" unchecked: the Welch version costs nothing when the spreads
match and protects you when they do not. Assumptions: independent observations; roughly
normal within each group, or about 30 or more per group; no single point carrying the
difference. With hundreds per group a normality test flags skew that changes nothing; with
12 per group and a long tail, the plot is your evidence.

**Show (MFG — bracket line B, hole-position deviation from nominal, mm, tolerance ±0.25).**
1,494 parts after the cleaning log (five blanks and the 12.50 mm keying error excluded and
logged).

```
Two-Sample T-Test and CI: hole_pos_dev_mm by fixture (F3 vs F4)
Welch's t, equal variances not assumed

fixture     N     Mean    StDev   SE Mean
F3        394   0.1317   0.1245    0.0063
F4        377  -0.0034   0.1226    0.0063

Difference = mean(F3) - mean(F4)
Estimate for difference:   0.1351 mm
95% CI for difference:    (0.1177, 0.1526)
T-Value = 15.19   DF = 768   P-Value < 0.001
```

*Assumptions:* F3's whole box sits higher; spreads equal; Anderson-Darling flags mild
non-normality in both groups (p ≈ 0.03), irrelevant at n ≈ 390 per group and noted on the
page. *Reading:* even the low end of the interval, 0.118 mm, is nearly a quarter of the
0.50 mm tolerance band. F3 makes 26% of the parts and 61% of the failures (15.7% fail rate
against 3.5% on the other fixtures).

**The sentence you tell your sponsor.** *"Holes from fixture F3 sit 0.135 mm further from
nominal than holes from F4 on the same machine — CI 0.118 to 0.153 mm, on 394 and 377 parts
over ten weeks. That is a quarter of the tolerance and six in ten of our failed brackets.
Next: inspect F3's locating pin; the pilot replaces it and predicts F3's failure rate falls
to the other fixtures' 3–4%."* The week 5 proxy is now visible: machine M2 tests 0.060 mm
high against M1 (CI 0.047 to 0.073) only because M2 carries F3. A countermeasure aimed at M2
leaves the pin in place.

**One-sample, briefly (TXN, illustrative claim).** The portal vendor's proposal said "under
five minutes per invoice." Portal entry time before the 6 April template change: n = 346,
mean 5.92 min, SD 2.17, 95% CI 5.69 to 6.15, p < 0.001 against 5.0. *"Portal entry runs
0.9 minutes above the claim (CI 0.7 to 1.1) — about 11 clerk hours a quarter: real, and not
where the benefit lives, because the primary metric is the correction rate."* Statistically
clear and practically small is a legitimate finding.

**Software.** Minitab: Stat > Basic Statistics > 1-Sample t / 2-Sample t. Excel: ToolPak
"t-Test: Two-Sample Assuming Unequal Variances"; no one-sample tool — `CONFIDENCE.T` for the
interval. R: `t.test(y ~ group)`, `t.test(y, mu = 5)`. Python:
`scipy.stats.ttest_ind(a, b, equal_var=False)`, `ttest_1samp(y, 5)`.

**When NOT to use it.** Three or more groups (three t-tests carry about a 14% combined
false-alarm risk; run ANOVA). The same units measured twice (paired t). A yes/no outcome
(chi-square). A comparison value that is itself a small-sample estimate. Before and after a
change *you* made — ★ I3 evidence, where the staged control chart is the primary tool.

**Try.** Run the two-sample t from your plan. Write the sentence; then write the null-result
version you would have written had the CI straddled zero.

---

## 6.3 Paired t-test (20 min)

**Hook.** The week 3 practicum Gage R&R failed on reproducibility. The same ten parts were
measured by every operator, so "does OP-22 read higher than OP-12?" is a paired question,
and running it unpaired throws away the design.

**Teach.** A **paired t** works on the differences: same part on two gauges, same clerk on two
screens, same patient before and after a change to their own pathway. It removes unit-to-unit
variation, which is why it can find an effect a two-sample t on the same numbers cannot.
Assumptions: genuine pairs; the *differences* roughly normal, or 30 or more pairs; order
balanced so learning or fatigue is not the effect.

**Show (MFG — practicum Gage R&R file, mm).** Ten parts spanning the process, each part's
value the mean of two trials.

```
Paired T-Test and CI: OP-22 minus OP-12
10 parts, each measured by both operators (mean of two trials), mm

Difference     N     Mean    StDev   SE Mean
              10   0.0255   0.0330    0.0104

95% CI for mean difference:  (0.0019, 0.0491)
T-Value = 2.45   P-Value = 0.037

Same 20 numbers run as a two-sample t (the wrong test):  P-Value = 0.61
```

*Reading:* eight of ten differences are positive; the effect is about 0.026 mm, 5% of the
tolerance band; the interval runs from almost nothing to 0.049 mm because ten pairs is a
small study. The unpaired p of 0.61 is no contradiction: part-to-part spread (about 0.11 mm)
swamps a 0.026 mm operator difference unless the pairing removes it.

**The sentence you tell your sponsor.** *"On the same ten parts, OP-22 reads about 0.026 mm
higher than OP-12 (CI 0.002 to 0.049 mm) — a tenth of the fixture effect, and consistent with
week 3: the method never fixed where on the hole to place the probe, so each operator
measures in their own habit. Next: the standardized method from the week 3 plan; the fixture
test stands, because operators are spread across fixtures."* Nobody here is at fault.

**Software.** Minitab: Stat > Basic Statistics > Paired t. Excel: ToolPak "t-Test: Paired Two
Sample for Means". R: `t.test(a, b, paired = TRUE)`. Python: `scipy.stats.ttest_rel(a, b)`.

**When NOT to use it.** Different units in the two conditions — different patients in
different months are not pairs. More than two conditions on the same units (repeated
measures, Black Belt). Before/after on the process rather than the unit, where the control
chart is the evidence.

**Try.** Find one genuine pairing in your project data. If there is none, say so rather than
pairing by date.

---

## 6.4 One-way ANOVA and Tukey comparisons (35 min)

**Hook.** The HC box plot by unit showed two units high and two low. Four groups make six
pairs; ANOVA asks all six questions on one false-alarm budget.

**Teach.** **One-way ANOVA** tests whether any of three or more means differ; its p answers
only "at least one does." **Tukey** simultaneous intervals say which pairs, by how much. Read
the descriptive block, then F and p, then the Tukey pairs that matter, then R² (the share of
variation the grouping accounts for) and S (typical spread within a group, in the metric's
units). Assumptions: independent groups; residuals roughly normal; largest SD under twice the
smallest.

**Show (HC — discharge, order written to patient off the unit, calendar minutes).** Four
units, 16 weeks; two records with departure keyed before the order (a transposed hour)
excluded and logged.

```
One-way ANOVA: order_to_actual_min versus unit
1,232 discharges, 5 Jan - 26 Apr 2026

Source     DF         SS        MS        F        P
unit        3    2587804    862601   422.51   < 0.001
Error    1228    2507120      2042
Total    1231    5094924

S = 45.18   R-Sq = 50.8%

unit     N     Mean   StDev
3W     369     94.2    34.9
4E     295    183.8    53.0
5N     244     98.5    32.5
6S     324    190.7    55.0

Tukey 95% simultaneous CIs, difference of means (min)
4E - 3W    89.6   ( 80.5,  98.7)
6S - 3W    96.5   ( 87.6, 105.3)
4E - 5N    85.3   ( 75.3,  95.4)
6S - 5N    92.1   ( 82.3, 102.0)
6S - 4E     6.8   ( -2.5,  16.2)
5N - 3W     4.3   ( -5.3,  13.9)
```

*Assumptions:* SD ratio 55.0/32.5 = 1.7, inside the rule of thumb; residuals right-skewed
(every unit has a tail of very late departures) and the normality test fails — with 244 or
more per group and a 90-minute effect the conclusion does not depend on it, and the page says
so. *Reading:* unit is half the story (R² = 50.8%); the other half is within-unit spread
(S = 45 min). 4E and 6S are indistinguishable, as are 3W and 5N. Against the 120-minute
target, 89% of 4E and 6S discharges miss it; 23% of 3W and 5N do.

**The sentence you tell your sponsor.** *"Discharges on 4E and 6S take about 90 minutes
longer than on 3W and 5N — 184 and 191 minutes against 94 and 99, every slow-fast difference
inside 80 to 105 minutes, on 1,232 discharges over 16 weeks. Nine in ten discharges on the
slow units miss the 120-minute target. The pairing matches the one design difference between
them: on 4E and 6S the pharmacy's discharge-medication turnaround is on the critical path.
Next: regression of delay on turnaround within 4E."*

**What ANOVA does not test.** On the MFG file, ANOVA of deviation by shift gives F = 3.37,
p = 0.035 — real, and a 0.02 mm difference in means nobody would act on. The night shift's
problem is *spread*: SD 0.156 against 0.119 on days, and a 12.2% failure rate against about
4%. ANOVA compares centers. When the box is wider, not higher, report the box plot and the
failure rate by shift (a chi-square); a formal test of equal spread is not a Green Belt tool.

**Software.** Minitab: Stat > ANOVA > One-Way, Comparisons > Tukey, Graphs > Four in one.
Excel: ToolPak "ANOVA: Single Factor" gives F and p only — report pairwise two-sample
intervals and say they are unadjusted. R: `aov()`, `TukeyHSD()`, `plot(fit)`. Python:
`statsmodels` `ols` + `anova_lm`, `pairwise_tukeyhsd`.

**When NOT to use it.** Two groups (two-sample t). Repeated measures on the same units. A
second factor acting at the same time (two-way ANOVA is Black Belt; show the multi-vari chart
and test one factor within one level of the other, as 6.6 does). A spread problem dressed as
a mean problem.

**Try.** Run the ANOVA from your plan. Name the pairs that matter before you look at Tukey.

---

## 6.5 Chi-square test of association (25 min)

**Hook.** The TXN primary metric is a correction *rate*. A t-test on yes/no counts is one of
the Tollgate 3 common holds; "does the rate depend on the channel?" is a chi-square question.

**Teach.** Lay Y (corrected / not) against X (channel) as a table of counts. The test compares
observed counts with those **expected** if the rate were the same in every channel. Read the
row percentages, then χ², df and p, then the expected counts (each 5 or more; the software
warns) and the **contributions** to χ², which say *which* cells drive the result. Then run
the two-proportion test on the pair that matters, because χ² has no effect size of its own.

**Show (TXN — accounts payable, invoices corrected after entry, Q1–Q2 2026).**

```
Chi-Square Test for Association: corrected versus entry_channel
2,052 invoices (one duplicated row removed; eight yes/no spellings standardized; logged)

              Corrected    Not   Total   % corr.   Expected corr.   Contribution
EDI                   6    439     445      1.3%           32.5           21.6
Email-PDF            83    518     601     13.8%           43.9           34.7
Paper-scan           22    281     303      7.3%           22.1            0.0
Portal               39    664     703      5.5%           51.4            3.0
Total               150   1902    2052      7.3%

Pearson Chi-Square = 64.05   DF = 3   P-Value < 0.001
All expected counts >= 22

Two-proportion follow-up, Email-PDF vs Portal:
Difference = 8.3 percentage points   95% CI (5.0, 11.5)   P-Value < 0.001
```

*Reading:* two cells carry the association — Email-PDF corrected far more often than expected
(83 against 44) and EDI far less (6 against 33). Paper-scan sits on its expectation.
Email-PDF is 29% of invoices and 55% of corrections.

**The sentence you tell your sponsor.** *"Emailed-PDF invoices are corrected 13.8% of the
time against 5.5% for portal invoices — 8.3 points higher, CI 5 to 11.5 points, about two and
a half times as often, on 601 and 703 invoices. Emailed PDFs are three in ten of our invoices
and more than half of our corrections; EDI at 1.3% shows what structured intake does. Next:
pull the correction reasons for emailed PDFs and pilot a structured upload form."*

**The null result, written for A4.** The week 5 first-level chart showed clerk C07 at 10.2%
and C03 at 5.2%. Chi-square by clerk: χ² = 6.88, df = 11, p = 0.81; by vendor group: χ² = 6.60,
df = 4, p = 0.16. *"Across twelve clerks and five vendor groups we found no evidence that the
correction rate depends on who keys the invoice or who sends it; with about 170 invoices per
clerk we could only have detected a clerk running roughly five points above the rest. Both
causes are set aside, not declared false; the clerk cause is retired because channel explains
the first-level chart."*

**Software.** Minitab: Stat > Tables > Chi-Square Test for Association; Stat > Basic
Statistics > 2 Proportions. Excel: PivotTable for counts, expected = row total × column total
÷ n, `CHISQ.TEST(observed, expected)`; the two-proportion interval by hand. R:
`chisq.test(table(x, y))`, `prop.test()`. Python: `scipy.stats.chi2_contingency`,
`statsmodels` `confint_proportions_2indep`. R and Python apply a continuity correction on
2 × 2 tables by default, so χ² reads slightly below Minitab's; the conclusion does not move.

**When NOT to use it.** A unit in more than one cell. Expected counts below 5 in many cells
(collapse sparse categories and say so). Defect *counts* per unit that can exceed one (ask
your coach). A continuous X (bin it into three or four ranges and state the loss; logistic
regression is Black Belt).

**Try.** Build your table with expected counts. Write which cells carry the result before you
read p.

---

## 6.6 Correlation and simple linear regression (35 min)

**Hook.** ANOVA said 4E and 6S are slow. The cause is a quantity — pharmacy turnaround
minutes — so the question becomes "how many minutes of delay does each minute of turnaround
cost, and how much of the delay does it explain?"

**Teach.** **Pearson's r** (−1 to +1) says how tightly two measurements move together on a
straight line; r² is the share of Y's variation associated with X. **Simple linear
regression** sizes it: the **slope** (Y change per unit of X) with its CI, **R²**, and **S**
(scatter of Y around the line, in Y's units). Check the scatter plot for shape, clusters and
lone points; then the residual plots: roughly normal, no funnel against fitted values, no
pattern in run order, no high-leverage point. Predict only inside the observed X range.
Correlation screens; regression sizes; the pilot verifies.

**Show (HC — unit 4E, delay versus pharmacy turnaround, minutes).**

```
Regression Analysis: order_to_actual_min versus pharmacy_turnaround_min
Unit 4E only, 281 discharges with a discharge-medication order

Term                        Coef   SE Coef   T-Value   P-Value        95% CI
Constant                   93.92      5.75     16.33   < 0.001   (82.6, 105.2)
pharmacy_turnaround_min    0.940     0.054     17.56   < 0.001   (0.834, 1.045)

S = 34.17   R-Sq = 52.5%   R-Sq(adj) = 52.3%
Pearson correlation r = 0.725   (95% CI 0.664 to 0.776)
Range of X observed: 24 to 251 min

Same model on unit 3W (359 discharges):
pharmacy_turnaround_min    0.011     0.090      0.12     0.903   (-0.166, 0.188)   R-Sq = 0.0%
```

*Assumptions:* a straight band with no curve, cluster or lone point (largest Cook's distance
0.05); no funnel in the residuals; mild skew flagged (p = 0.03) at n = 281, noted. *Reading:*
the slope is about 1 — every minute of pharmacy turnaround on 4E is a minute of discharge
delay, which is what "on the critical path" means in numbers. The intercept, 94 minutes, is a
4E discharge with instant pharmacy — close to 3W's mean of 94, a second confirmation. On 3W
the same X has a slope of zero: meds are not on the path there.

**The hidden-category warning.** Pooling all four units gives r = 0.76 and a slope of 1.24 —
larger than the truth on any single unit, because the slow units also have the long
turnarounds. Regression across a category you have not plotted verifies a mixture. Fit within
the group, or stratify the scatter plot, before you believe a slope.

**The sentence you tell your sponsor.** *"On 4E, each minute of pharmacy turnaround adds
about one minute to the discharge (CI 0.83 to 1.05, 281 discharges). Across the turnarounds
we saw, 24 to 251 minutes, that is a swing of about 3.5 hours; turnaround accounts for half
of 4E's delay variation. Bringing 4E's median turnaround from 95 minutes to 3W's 55 predicts
the mean discharge falls from about 184 to about 146 minutes — inside the observed range, and
only on units where meds are on the path. Next: pilot 'meds prepared at order' on 4E with 6S
untouched as the comparison."* That prediction is the number the week 7 pilot plan is built
from.

**Software.** Minitab: Stat > Basic Statistics > Correlation; Stat > Regression > Fit
Regression Model, Graphs > Four in one. Excel: `CORREL`, ToolPak "Regression" (coefficients,
SE, t, p, 95% interval, R²; tick the residual-plot boxes). R: `cor.test(x, y)`, `lm(y ~ x)`,
`plot(fit)`. Python: `scipy.stats.pearsonr`, `statsmodels` `ols(...).fit().summary()`.

**When NOT to use it.** A curved scatter (show the plot and escalate; transformations are
Black Belt). One point far from the others (report with and without). More than one X at once
(multiple regression is Black Belt). A yes/no Y (logistic — Black Belt). Predicting outside
the observed range. Two variables that both trend with time.

**Try.** Fit the regression from your plan, within one group if a category is in play. Write
the swing across your observed range as a share of the tolerance or target.

---

## Live lab — run of show: the stats lab and Tollgate 3 (150 min)

**Outcome.** Every team runs every test on the case data and leaves with a sponsor sentence
for each; every learner runs one test on their own data and rehearses the ★ A3 line.
**Room.** Teams of 4–5 by case; producer above 16; software open with the practicum file and
the week 5 test plan; the selector printed.

### 0:00–0:10 — Setup and the trap
On screen: "Two-sample t, p = 0.003." Poll: *"Is this cause verified — yes or no?"* Save the
count. Frame: *"By 2:10 you will know why the honest answer is 'I can't tell yet.'"*

### 0:10–0:45 — Round 1: the planned tests, on the case
Each team runs the t-test, the ANOVA and the chi-square from the case test plan and writes
the sentence for each. Facilitator's one question at every table: *"Where is the effect in
the sponsor's units, and what is it a share of?"* **Failure mode:** the sentence leads with
p. Hand it back unread.

### 0:45–1:10 — Round 2: regression and the hidden category
HC teams fit delay on turnaround pooled, then within 4E and within 3W, and explain the three
slopes. MFG teams test M2 versus M1, then F3 versus F4, and name the proxy. TXN teams run the
chi-square by clerk after the one by channel. **Failure mode:** a team reports the pooled
slope with a clean residual plot and calls it verified. Ask what the week 5 box plot by unit
said.

### 1:10–1:20 — Break

### 1:20–1:45 — Round 3: the null results and A4
Each team takes one planted null — clerk, vendor group, the HC weekend — and writes the
null-result sentence: the CI half-width as "the smallest difference we could have seen," the
cause set aside, not declared false. Then the MFG shift ANOVA: significant, tiny, and beside
the point; the team rewrites it as a spread finding. **Failure mode:** "not significant, so
no effect." The CI reading rules go back on screen.

### 1:45–2:10 — Transfer: your own project
Pairs across verticals. Each learner runs one test from their own plan and reads the four
numbers aloud; the partner writes the sentence from what they hear; they compare. Learners
whose data are not yet in run the test on the case and write "n available / n wanted"
honestly for the gate.

### 2:10–2:30 — Debrief and Tollgate 3 rehearsal
Re-run the opening poll; say the change plainly. Each learner reads their ★ A3 line —
method, assumption check, effect with interval, sentence — in 60 seconds to a facilitator
playing the sponsor, who asks only "so what would you have me do?" **Protect the debrief.** If
round 3 overruns, cut it at 1:45 with one null sentence per team; the rehearsal is the gate.

**Facilitator notes.** Teams finishing round 1 early run the wrong test on purpose (paired
data unpaired; a t-test on the pass/fail column) and tell the room what changed. Keep the
cleaning log visible; a team that deletes the 12.50 mm value without a log entry has produced
the gate's data-ethics stop, and the debrief names it. Single-vertical corporate cohorts:
give one team the off-vertical case.

---

## Project work this week — Tollgate 3

Keyed to [`../project/review-rubric.md`](../project/review-rubric.md) and the Tollgate 3
checklist in [`../project/tollgate-checklists.md`](../project/tollgate-checklists.md):

| Rubric item | What is on the one page |
|---|---|
| A1 Cause generation and narrowing (6) | The week 5 chain unchanged: fishbone → C&E matrix → working FMEA → five checkable causes, parked causes with their scores |
| A2 Graphical analysis (5) | The stratified charts that pointed the tests, labeled with metric, units, period and n; proxies named as proxies |
| ★ A3 Root cause verified with data (10) | At least one cause with: the test and its selector row; the assumption check and its result; n per group; the effect in the metric's units with its 95% CI; the sponsor sentence; the cleaning log. A p-value with no effect size is the shortest hold at this gate |
| A4 Honest handling of what did not verify (4) | Every tested cause that did not survive, with the same output block and the null-result sentence stating the smallest difference the sample could have detected |

Also on the page: the **prediction** — "if [verified cause] is removed, the primary metric
moves from [baseline] to about [value]" — from the effect size, before Improve starts; causes
outside scope with a proposed home. Coaching checkpoint: 30 minutes, on the ★ A3 line.

## Coaching prompts

1. "Read me the effect and its interval. Which end of the interval would still change the
   sponsor's decision, and which would not?"
2. "What did you check before you trusted the arithmetic, and what would you have done if the
   check had failed?"
3. "Show me the cause that did not verify. How small a difference could your sample have
   seen, and does the sponsor know that?"

## The week's vertical case dataset

This week runs on the practicum files in `../practicum/data/`; values are simulated with
planted effects, and learners see the data, not the key.

- **MFG — `mfg-bracket-line.csv`, `mfg-gage-rr.csv`.** 1,500 brackets over ten weeks:
  `part_id`, `date`, `shift`, `machine` (M1/M2), `fixture` (F1–F4; F3 and F4 on M2),
  `operator_id`, `hole_pos_dev_mm` (tolerance ±0.25), `result`, `rework_min`. Planted: F3
  about 0.13 mm high (worn locating pin); M2 and one operator appear high only because they
  carry F3; the night shift wider, not higher; a two-day special cause on M2 from week 4; five
  blanks and one 12.50 mm keying error. The Gage R&R file (10 parts × 3 operators × 2 trials)
  supplies the paired test.
- **HC — `hc-discharge.csv`.** 1,234 discharges over 16 weeks: `discharge_id`, `date`, `unit`
  (3W/4E/5N/6S), `weekday`, `order_time`, `actual_discharge_time`, `pharmacy_turnaround_min`,
  `transport_wait_min`. Planted: 4E and 6S about 90 minutes slower because turnaround is on
  their critical path (slope ≈ 1 there, ≈ 0 on 3W and 5N); Mondays about 40 minutes slower on
  every unit; weekends no effect; transport wait a small real contributor; two transposed-time
  records.
- **TXN — `txn-invoices.csv`.** 2,053 invoice rows over 26 weeks: `invoice_id`, `date`,
  `entry_channel` (Portal/Email-PDF/Paper-scan/EDI), `clerk_code`, `vendor_group`,
  `entry_minutes`, `corrected`, `days_to_pay`. Planted: correction rate by channel 5.5% /
  13.8% / 7.3% / 1.3%; no clerk or vendor-group effect; corrected invoices paid about seven
  days later; a 6 April template change in the change log; one duplicate row, eight yes/no
  spellings, one negative days-to-pay.

## Takeaways

- Read every output in the same order — n, effect, interval, p, assumption — and finish with
  the sentence: effect size and practical meaning in the sponsor's units. p never leads.
- Stratify before you fit: a slope or a difference across a category you have not plotted
  verifies a mixture, and a proxy verifies as happily as a cause.
- A null result is a finding with a width: "the smallest difference we could have seen" is
  the A4 sentence; "there is no effect" is not.
- The cleaning log is written before the test and shown at the gate; an exclusion without a
  reason is the review's stop.

## Cumulative check (weeks 3–4)

**W6-C1.** Before the fixture test, a Green Belt builds the week 4 baseline chart of daily
mean hole-position deviation (mm, one value per working day, 50 days): X̄ = 0.037 mm and the
average moving range MR̄ = 0.041 mm. The upper control limit of the individuals chart is:
A. 0.160 mm · B. 0.146 mm ✅ · C. 0.171 mm · D. 0.083 mm
`[B3 · G4 · Apply · MFG · S · PRAC]` — UCL = X̄ + 2.66 × MR̄ = 0.037 + 0.109 = 0.146 mm; A
uses 3 × MR̄ without the d₂ correction, C applies the MR chart's 3.267 factor to the I chart,
and D adds MR̄ itself to X̄.

**W6-C2.** The paired test in 6.3 shows OP-22 reading about 0.026 mm higher than OP-12 on the
same ten parts. In week 3 terms this is evidence of which measurement-system component, and
what does it mean for the two-sample t on fixtures F3 and F4?
A. Repeatability; the fixture test is invalid until the gauge is replaced ·
B. Reproducibility; it widens the spread inside each fixture group and the interval, but does not bias the comparison as long as operators are spread across both fixtures — state it on the page ✅ ·
C. Gauge bias; subtract 0.026 mm from every OP-22 reading in the bracket file before testing ·
D. Linearity; the difference grows with part size, so only the largest parts are affected
`[B2 · G3 · Analyze · MFG · S · PRAC]` — between-operator disagreement on the same parts is
reproducibility; A names the within-operator component, C silently alters data on a
ten-part estimate, and D would need a difference that trends with the part value, which the
ten differences do not show.

---

v1.0 · 2026-09-20
