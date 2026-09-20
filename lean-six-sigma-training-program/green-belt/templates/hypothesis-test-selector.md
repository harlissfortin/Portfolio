# Hypothesis Test Selector — "Which Test Do I Use?"

*Green Belt toolkit · used in weeks 5–6, the Analyze tollgate and rubric item ★ A3. Print
the decision table; keep the test cards open while you run the analysis. Software steps for
every test are in [`software-parity.md`](software-parity.md).*

## Purpose

You use this page at one moment in a project: a cause has survived the fishbone and the C&E
matrix, you have (or can collect) data on it, and you need to decide whether the data
support it. The selector turns four questions about your data into one named test, tells you
what the test assumes, and gives you the sentence you will say to your sponsor when it is
done. A p-value alone never leaves this page.

## Before you pick a test — four questions and one rule

1. **What is Y?** The output you are trying to explain (your primary metric or a slice of it).
   Is it **continuous** (a measurement: minutes, mm, dollars, count per unit that behaves like
   a measurement) or **attribute** (pass/fail, category, a count of defects)?
2. **What is X?** The suspected cause. Is it a **grouping** (fixture A vs B, three shifts, two
   forms) or a **measurement** (torque, arrival volume, invoice value)?
3. **How many groups** does X have — one compared with a target, two, or three or more?
4. **Are the observations independent or paired?** Paired means the same unit was measured
   under both conditions (same clerk, both screens; same part, both gauges).

**The rule:** plot it first. A box plot by group, a scatter plot, or a stacked bar of
proportions shows you the answer most of the time and shows you the assumption problems
every time. The test quantifies what the plot shows; it does not replace it.

Decide **before you run**: the significance level (α = 0.05 unless your sponsor has a reason
for another) and the **practical difference** that would change a decision ("a 5-minute
shift in door-to-provider matters; 30 seconds does not"). Write both down. You judge the
result against the practical difference, not just against α.

## The decision table

| Your question | Y is | X is | Groups | Green Belt test | Key assumptions | Fallback when assumptions fail (Black Belt — named, not taught at this level) |
|---|---|---|---|---|---|---|
| Is our average different from a target or a claimed value? | Continuous | none (one sample vs a number) | 1 | **1-sample t-test** | Independent observations; roughly normal, or n ≥ 30 | 1-sample Wilcoxon, 1-sample sign |
| Do two groups differ in average? | Continuous | Grouping | 2, independent | **2-sample t-test** (Welch, unequal variances — the software default) | Independent; roughly normal within each group, or each n ≥ 30; no extreme outliers | Mann-Whitney |
| Did the same units change between two conditions? | Continuous | Condition (before/after, method 1/2) | 2, paired | **Paired t-test** | Pairs are genuine; the *differences* are roughly normal, or ≥ 30 pairs | Wilcoxon signed-rank |
| Do three or more groups differ in average? | Continuous | Grouping | 3+ independent | **One-way ANOVA** with Tukey pairwise comparisons | Independent; roughly normal residuals; similar spread (largest SD < 2 × smallest as a rule of thumb) | Kruskal-Wallis, Mood's median; Welch's ANOVA when spreads differ |
| Is our defect rate different from a target? | Attribute (yes/no) | none | 1 | **1-proportion test** | Independent trials; at least 5 expected defects and 5 expected non-defects | Exact binomial (software gives it automatically; read it the same way) |
| Do two groups differ in defect rate? | Attribute (yes/no) | Grouping | 2 | **2-proportion test** (identical to a 2 × 2 chi-square) | Independent; ≥ 5 expected in every cell | Fisher's exact test (software gives it when counts are small) |
| Does the category of Y depend on the category of X? | Attribute (category) | Grouping (category) | any | **Chi-square test of association** (contingency table) | Independent counts, each unit in one cell; ≥ 5 expected per cell (≥ 80% of cells) | Fisher's exact; collapse categories (Green Belt workaround, state it) |
| Are defects spread across categories the way we expect? | Attribute (counts by category) | none | any | **Chi-square goodness-of-fit** | Expected counts stated before you look; ≥ 5 expected per category | Collapse categories |
| Do two measurements move together? | Continuous | Continuous | — | **Pearson correlation** | Linear relationship (check the scatter); no single point drives it; both roughly normal for the p-value | Spearman rank correlation |
| How much does Y change per unit of X, and how well does X predict Y? | Continuous | Continuous | — | **Simple linear regression** | Linear; residuals roughly normal with constant spread; independent; no influential point; predict only inside the observed X range | Transformations; multiple regression (more than one X) |
| Does a defect depend on a measurement? | Attribute (yes/no) | Continuous | — | *No Green Belt test fits directly.* Workaround: flip it — compare X between defect and non-defect units with a 2-sample t; or bin X into 2–4 ranges and run a chi-square | State the workaround in your A3 | Binary logistic regression |
| Do two or more causes act at once, or interact? | Continuous | Two or more groupings or measurements | — | *Not a Green Belt test.* Look at each X one at a time; use a multi-vari chart to see where the variation lives; tell your coach | — | Two-way ANOVA, multiple regression, designed experiments |
| How precise is our estimate of the average or the rate? | Either | none | 1 | **Confidence interval** (not a test — the reporting device for every row above) | Same as the matching test | — |

**How the assumption checks work at Green Belt.** For each test you (a) look at the plot,
(b) run the software's normality test on each group or on the residuals (Anderson-Darling in
Minitab, Shapiro-Wilk in R and Python; Excel has none — use a histogram and a normal
probability plot from the add-in), and (c) apply the rule of thumb in the table. If the check
fails and the fallback is Black Belt, you do not run the fallback: you report the Green Belt
test with the caveat, show the plot, and ask your coach whether the conclusion changes. A
large, obvious effect survives a mild assumption failure; a marginal one does not, and you
say so.

**Sample size at Green Belt.** Formal power and sample-size calculation is Black Belt
(module M3). At this level you use the rules of thumb in each card and one honesty
device: the width of the confidence interval. If the interval includes both "no practical
difference" and "a difference that would matter," your sample was too small to decide, and
your sentence says so.

---

## Test cards

Each card: when to use · when not to use · what to check · what to report · the sponsor
sentence · a filled example. The sentence template is deliberately rigid. Fill every slot.

### Card 1 — 1-sample t-test

**Use when** you compare a continuous metric's average with a stated number: a target, a
specification, last year's mean from a large dataset, a supplier's claim.
**Do not use when** the comparison value is itself an estimate from a small sample (use the
2-sample t with both datasets), or when the metric is a proportion (1-proportion test).
**Check:** histogram and normality test; with n ≥ 30 mild skew is fine.
**Report:** n, mean, SD, the difference from the target, its 95% CI, p.

**Sponsor sentence:** *"Our average [metric] over [period, n units] is [mean, units], which
is [difference] [above/below] the [target/claim] of [value] (95% CI [lo] to [hi]). In
practice that means [consequence]. [Next step.]"*

**Filled example (HC).** Discharge orders on Unit 4, target written by 10:00. Sample: 45
discharges over two weeks; mean order time 10:41, SD 58 min. Difference from target +41 min,
95% CI +24 to +58 min, p < 0.001.
*"Over the last two weeks (45 discharges) the discharge order is written at 10:41 on
average, 41 minutes after the 10:00 target (CI 24–58 min). Because the pharmacy and
transport steps take about 90 minutes after the order, an order at 10:41 makes a noon
departure unlikely before anything else goes wrong. Next: stratify order time by attending
and by day of week."*

### Card 2 — 2-sample t-test

**Use when** two independent groups (two fixtures, two clinics, two intake channels) are
compared on a continuous metric.
**Do not use when** the two samples are the same units measured twice (paired t), when there
are three or more groups (ANOVA — running three 2-sample tests inflates the false-alarm
rate), or when the metric is pass/fail (2-proportion).
**Check:** box plot by group; normality per group or n ≥ 30 each; look for a single outlier
that carries the difference. Leave the "assume equal variances" box unchecked; the Welch
version costs nothing when spreads are equal and protects you when they are not.
**Report:** both n, both means and SDs, the difference, its 95% CI, p, and the difference
expressed against something the sponsor understands (the tolerance, the target, the
baseline).

**Sponsor sentence:** *"[Group A]'s [metric] averages [value], [Group B]'s averages [value] —
a difference of [effect, units] (95% CI [lo] to [hi]), based on [n_A] and [n_B] [units]
collected [how/when]. That difference is [comparison to tolerance/target/baseline], so
[practical meaning]. [Next step.]"*

**Filled example (MFG).** Bracket line B, hole-position offset from nominal (mm), 30 parts
from fixture A and 30 from fixture B, sampled across three shifts. Fixture A: mean 0.031,
SD 0.021; fixture B: mean 0.012, SD 0.022. Difference 0.019 mm, 95% CI 0.008 to 0.030,
p = 0.001. Box plots overlap but A's whole distribution sits higher; no outliers.
*"Parts from fixture A sit on average 0.019 mm further from nominal than parts from fixture
B (CI 0.008–0.030 mm), on 30 parts each across three shifts. That is a fifth of the ±0.10 mm
tolerance and explains why nearly all out-of-spec brackets last month came from A. Next:
check whether A's clamp holds torque (Card 8), then decide whether to rebuild A or move the
work to B while we fix it."*

**When the result is "no difference":** *"We could not detect a difference between A and B
larger than about [CI half-width]; a smaller difference may still exist, and with [n] parts
we would only reliably see one larger than [value]. We are setting this cause aside, not
declaring it false."* Record it under rubric item A4.

### Card 3 — Paired t-test

**Use when** each unit is measured under both conditions: the same clerk on the old and new
screen, the same sample on two gauges, the same patient before and after a change in their
own pathway.
**Do not use when** the "before" and "after" are different units (different patients in
different months) — that is a 2-sample t, and usually a control chart is the better tool for
before/after evidence (rubric I3).
**Check:** histogram of the differences (not of each condition); ≥ 30 pairs makes normality of
differences unimportant. Confirm the pairing is real and the order was balanced (half did new
first) so learning or fatigue is not the effect.
**Report:** number of pairs, mean difference, SD of differences, 95% CI, p.

**Sponsor sentence:** *"On the same [n] [units], [condition B] [metric] was [effect, units]
[lower/higher] than [condition A] (95% CI [lo] to [hi]). Scaled to [volume], that is
[practical meaning]. [Next step.]"*

**Filled example (TXN).** Twelve AP clerks each code the same batch of 20 invoices on the
current entry screen and on the redesigned one; order balanced. Mean time per batch fell by
4.6 min (SD of differences 3.1 min), 95% CI −6.6 to −2.6 min, p < 0.001.
*"On identical batches, the same twelve clerks coded 20 invoices 4.6 minutes faster on the
new screen (CI 2.6–6.6 min), about 14 seconds per invoice. At 240 invoices per clerk per
week that is roughly 55 minutes per clerk per week — useful, but the project's primary
metric is the correction rate, not speed. Next: the pilot measures corrections with the same
operational definition as the baseline."*

### Card 4 — One-way ANOVA (with Tukey comparisons)

**Use when** three or more independent groups are compared on a continuous metric (shifts,
clinics, vendors, machines).
**Do not use when** you have two groups (2-sample t is the same test and easier to read),
when groups are repeated measures on the same units (Black Belt: repeated-measures or a
blocked design — ask your coach), or when a second factor is clearly acting at the same
time (two-way ANOVA is Black Belt; look at a multi-vari chart instead).
**Check:** box plot by group; residual plots (normality and equal spread); largest SD < 2 ×
smallest. ANOVA's p-value only says "at least one group differs" — Tukey's comparisons
tell you which, with intervals.
**Report:** group n, means, SDs; F, p; the Tukey intervals for the pairs that matter; the
spread of group means against the target.

**Sponsor sentence:** *"[Metric] differs by [factor]: [group] averages [value] versus
[value] and [value] for the others — [group] is [effect, units] [higher/lower] than [group]
(95% CI [lo] to [hi]), while [pairs that do not differ] are indistinguishable. Against the
[target], that means [practical meaning]. [Next step.]"*

**Filled example (HC).** ED door-to-provider time (minutes) by shift, 40 arrivals per shift
sampled across four weeks. Day: mean 22, SD 8.5. Evening: mean 31, SD 10.1. Night: mean
19, SD 8.3. F(2, 117) = 19.3, p < 0.001. Tukey: evening − day = +9 min (CI 4.2 to 13.8);
evening − night = +12 min (CI 7.2 to 16.8); day − night = +3 min (CI −1.8 to 7.8).
*"Door-to-provider time depends on shift: evening arrivals wait 31 minutes on average versus
22 on days and 19 on nights — about 9 to 12 minutes longer (CIs 4–14 and 7–17 min); days and
nights are indistinguishable. Against the 30-minute target, evening is the only shift
routinely missing it. Next: a multi-vari chart of evening by hour to see whether it is the
19:00–22:00 arrival peak or the whole shift."* (Times are right-skewed; with 40 per group
the ANOVA is robust, and the plot shows the same story. Note the skew in the A3.)

### Card 5 — 1-proportion and 2-proportion tests

**Use when** Y is yes/no and you compare one rate with a target, or two groups' rates with
each other. A 2 × 2 chi-square gives the same p-value as the 2-proportion test; the
2-proportion output adds the confidence interval for the difference, which is what you
report.
**Do not use when** the "defects" are counts per unit that can exceed one (that is a rate,
not a proportion — use a u-chart view or a count comparison; ask your coach), or when the
groups are three or more (chi-square, Card 6).
**Check:** at least 5 expected defects and 5 expected non-defects in each group; the
software warns you when the normal approximation is unsafe and prints an exact p-value —
read that one instead.
**Report:** both n, both counts and rates, the difference in percentage points with its 95%
CI, p, and the ratio if it helps ("three times as often").

**Sponsor sentence:** *"[Group A]'s [defect] rate is [p_A]% ([x_A] of [n_A]) versus [p_B]%
([x_B] of [n_B]) — [effect] percentage points [higher/lower] (95% CI [lo] to [hi]), or about
[ratio] times as often. [Practical meaning against volume or cost.] [Next step.]"*

**Filled example (TXN).** Corrected invoices by vendor situation, Q2. Vendors with one open
PO: 133 of 2,210 corrected (6.0%). Vendors with two or more open POs: 173 of 910 (19.0%).
Difference 13.0 points, 95% CI 10.3 to 15.7, p < 0.001.
*"Invoices from vendors with more than one open PO are corrected 19% of the time versus 6%
for single-PO vendors — 13 points higher (CI 10–16 points), about three times as often.
Those vendors send 29% of our invoices but produce 57% of our corrections. Next: the pilot
shows the open POs on the entry screen and requires a selection (see the pilot plan)."*

### Card 6 — Chi-square test of association

**Use when** both Y and X are categories and you ask whether the mix of Y depends on X:
defect type by supplier, correction category by intake channel, disposition by triage level.
**Do not use when** the same unit appears in more than one cell (each unit lands in exactly
one), when many expected counts are below 5 (collapse sparse categories, and say you did),
or when a category order matters (ordinal methods are Black Belt).
**Check:** the expected-count table the software prints; the largest contributions to
chi-square (they tell you *which* cells drive the result).
**Report:** the table with row percentages, χ², df, p, and the two or three cells that
carry the association, in plain words.

**Sponsor sentence:** *"[Y] depends on [X]: [cell] runs at [rate] against an overall
[rate], and [cell] at [rate] — the association is driven by [cells]. [Practical meaning.]
[Next step.]"*

**Filled example (TXN).** Same Q2 data as Card 5 as a 2 × 2 table: χ² = 123.2, df = 1,
p < 0.001. The cell contributing most is "2+ open POs, corrected" (observed 173, expected
89). *(Same sentence as Card 5; use the 2-proportion output for the interval.)* Note for
R and Python users: `chisq.test` and `chi2_contingency` apply a continuity correction on
2 × 2 tables by default, so the χ² will read slightly lower than Minitab's or Excel's; the
conclusion does not change (see [`software-parity.md`](software-parity.md)).

### Card 7 — Chi-square goodness-of-fit

**Use when** you have counts across categories and a stated expectation: defects spread
evenly across four stations, errors in proportion to volume by day of week.
**Do not use when** the "expected" was chosen after looking at the data, or when expected
counts are below 5 in any category.
**Report:** observed vs expected table, χ², df, p, and the categories that deviate most.

**Sponsor sentence:** *"[Counts] are not spread [as expected]: [category] carries [observed]
against an expected [value] — [share]% of the total on [share]% of the volume. [Next step.]"*

**Filled example (MFG).** 96 rework tags over four weeks across four stations with equal
volume; expected 24 each; observed 41, 19, 20, 16; χ² = 15.9, df = 3, p = 0.001. *"Rework is
not evenly spread: station 1 produced 41 of 96 tags, 43% of the rework on 25% of the volume.
Next: the fixture comparison (Card 2) at station 1."*

### Card 8 — Pearson correlation

**Use when** both Y and X are measurements and you want to know whether they move together
and how strongly (r from −1 to +1).
**Do not use when** the scatter plot is curved (r understates a real relationship), when one
point sits far from the others (r can be an artifact of one point — check with and without,
and report both), or to claim cause: correlation is a screen, not a verification. The
verification comes from regression plus a change you make on purpose (the pilot).
**Report:** n, r, its p-value, the scatter plot, and r² as "share of variation associated
with X."

**Sponsor sentence:** *"[Y] and [X] move together: r = [value] across [n] [units]; about
[r²]% of the variation in [Y] is associated with [X] (the rest is other things). The
scatter plot shows [pattern/caveat]. Next: regression to size the effect, then a pilot to
test it."*

### Card 9 — Simple linear regression

**Use when** you want the size of the relationship (slope: how much Y changes per unit of
X), a confidence interval for it, and a prediction inside the observed range.
**Do not use when** the relationship is clearly curved, when you have more than one X to
consider at once (multiple regression — Black Belt), when Y is yes/no (logistic — Black
Belt), or to predict outside the range of X you observed.
**Check:** the four-in-one residual plot (Minitab) or its equivalent: residuals roughly
normal, no funnel shape against fitted values, no pattern in run order; look for one point
with high leverage.
**Report:** the slope with its 95% CI, the intercept only if it means something, R², S (the
typical scatter of Y around the line, in Y's units), n, and the range of X the model is
valid for.

**Sponsor sentence:** *"Each additional [unit of X] changes [Y] by about [slope, units]
(95% CI [lo] to [hi]); across the range we observed ([X min] to [X max]) that is a swing of
[slope × range] in [Y], which is [comparison to tolerance/target]. [X] accounts for about
[R²]% of the variation in [Y]. This holds only within [range]. [Next step.]"*

**Filled example (MFG).** Clamp torque at changeover (N·m) against mean hole offset of the
first 20 parts (mm), 25 changeovers, torque observed from 12 to 26 N·m. r = −0.71; slope
−0.0042 mm per N·m (95% CI −0.0060 to −0.0024); R² = 0.50; S = 0.014 mm. Residual plots
clean; one changeover at 12 N·m is the lowest torque and the highest offset but removing it
leaves the slope at −0.0038 — reported both ways.
*"Each extra newton-metre of clamp torque reduces the mean hole offset by about 0.004 mm
(CI 0.002–0.006). Across the 12–26 N·m range we observed, that is a 0.06 mm swing — more
than half the ±0.10 mm tolerance. Torque accounts for about half the offset variation; the
rest is something else. This holds only between 12 and 26 N·m. Next: pilot a specified
torque of 24 N·m with a click-type wrench at every changeover and predict offsets under
0.02 mm."*

### Card 10 — Confidence intervals (how every result is reported)

A 95% confidence interval is the range of true values consistent with your data. It does
the job a p-value cannot: it shows the **size** of the effect and how **precisely** you know
it. Every sentence on this page carries one.

- Mean: x̄ ± t × s/√n (the software prints it; in Excel, `CONFIDENCE.T` gives the half-width).
- Proportion: p ± 1.96 × √(p(1 − p)/n) for large n; the software's exact interval when
  defects are few.
- Difference between groups: from the 2-sample t, paired t, Tukey, or 2-proportion output.

**Reading rules.** If the whole interval is on the "matters" side of your practical
difference, act. If the whole interval is inside "does not matter," set the cause aside
(rubric A4). If the interval straddles both, your sample was too small to decide — say so,
and either collect more or move on with that stated.

---

## Common mistakes

- **Reporting p and stopping.** "p = 0.003, so fixture A is the cause" fails rubric A3. The
  sentence needs the effect size, the interval, and what it means in the sponsor's units.
- **Testing before plotting.** A single outlier or a curved relationship is visible in ten
  seconds on a plot and invisible in a p-value.
- **Three 2-sample t-tests instead of one ANOVA.** Each test carries its own 5% false-alarm
  risk; three of them together run near 14%. Use ANOVA with Tukey.
- **Pairing what is not paired, or not pairing what is.** Different patients in different
  months are not pairs. The same clerk on two screens is.
- **Confusing "not significant" with "no effect."** A wide interval means you do not know.
  Write the null-result sentence from Card 2.
- **Treating correlation as verification.** The fixture-torque relationship became a verified
  cause when a specified torque changed the offset in the pilot, not when r came out at −0.71.
- **Running a Black Belt fallback from a menu because it was there.** If the assumption
  check fails, report the Green Belt test with the caveat and the plot, and ask your coach.
  Reviewers can tell the difference between a chosen method and a found one.
- **Changing the question after seeing the data.** The hypothesis, α, and the practical
  difference are written in the test plan (week 5) before the data are analyzed (week 6).
- **Dropping the inconvenient points.** Never. Report with and without, and let the reader
  see both.

*v1.0 · 2026-09-20*
