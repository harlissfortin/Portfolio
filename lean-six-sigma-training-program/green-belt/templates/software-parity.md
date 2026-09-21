# Software Parity — Every Green Belt Analysis in Minitab, Excel, and R or Python

*Green Belt toolkit · referenced from every week and every template. The credential does not
depend on one vendor's license: every analysis in this level runs in Minitab, in Excel (with
the Analysis ToolPak or a named add-in), and in R or Python, and the live labs show all three
on the case data. This page is the map — where each analysis lives in each tool, and the
numbered notes on which outputs differ between tools and why. The choice of test is in
[`hypothesis-test-selector.md`](hypothesis-test-selector.md); the arithmetic behind capability
is in [`capability-worksheet.md`](capability-worksheet.md); the study designs are in
[`msa-plan.md`](msa-plan.md).*

## Purpose

The same data, run in two tools, can print two different numbers. Almost always the
difference is a **default** — a pooled versus a separate variance, a continuity correction
applied or not, a standard deviation estimated from ranges or from a pooled sum of squares,
a kappa computed against one set of marginals or another. The conclusion rarely moves; the
second decimal does, and a reviewer who sees Cpk 0.55 on one page and 0.57 on the next wants
to know which estimator each page used. You state the tool and the method choice in every
exhibit's caption, and this page tells you what to state.

Three uses:

| You are | Use this page to |
|---|---|
| Running an analysis for the first time | Find the menu path, function or call in the tool you have (Part A) |
| Comparing your output with a lab partner's, a textbook's, or the practicum key | Find the note that explains the gap (Part B) |
| Writing the caption on an exhibit | Name the tool, the version, and the method choice the note tells you matters |

## Before you start — versions, setup, data layout

| Tool | This level assumes | Setup |
|---|---|---|
| **Minitab** | Minitab Statistical Software, release 19 or later; menu paths below are the *Stat* and *Graph* menus, unchanged across those releases. If a path differs in your release, the search box on the toolbar finds the command by name | Nothing to install beyond the license. Minitab Workspace (the former Companion) holds the mapping and FMEA tools, not the statistics |
| **Excel** | Microsoft 365 desktop, with the **Analysis ToolPak** enabled: File > Options > Add-ins > Manage: Excel Add-ins > Go > tick Analysis ToolPak (Windows); Tools > Excel Add-ins (Mac). It appears as Data > Data Analysis | For Gage R&R, attribute agreement, staged control charts and Tukey comparisons, native Excel and the ToolPak are not enough. The program's Excel-stats track uses a **named add-in** — SigmaXL or QI Macros (licensed per seat), or the free Real Statistics Resource Pack for the tests — and the **toolkit workbooks** (`msa-plan.md`, `capability-worksheet.md`) are the no-add-in route with the formulas visible |
| **R** | R 4.x with `qcc`, `SixSigma`, `irr`, `car`, `ggplot2` — `install.packages(c("qcc", "SixSigma", "irr", "car", "ggplot2"))` | Base R's `stats` package carries every hypothesis test on this page |
| **Python** | Python 3.10+ with `pandas`, `scipy` (1.11 or later, for confidence intervals on t-tests), `statsmodels`, `seaborn`, `matplotlib`, `scikit-learn` — `pip install pandas scipy statsmodels seaborn matplotlib scikit-learn` | There is no standard SPC package; the toolkit notebook computes control limits explicitly from the formulas in week 4 and plots them |

**Data layout is the first difference.** Minitab and R's formula interface and `statsmodels`
want **stacked** (long) data: one column of values, one column of group labels, one row per
observation. Excel's ToolPak t-test and ANOVA tools want **unstacked** data: each group in its
own column range. `scipy.stats` wants one array per group. Keep the master file long — one
row per bracket, invoice or discharge, as the practicum CSVs ship — and unstack with a
PivotTable or a filter only for the ToolPak.

**Missing values are the second.** Minitab shows `*` and skips it; R shows `NA` and most
functions need `na.rm = TRUE` or fail loudly; `pandas` shows `NaN` and skips it silently;
Excel treats a blank as absent in `AVERAGE` but as **zero** in arithmetic and in some charts.
A blank that becomes a zero is the week 4 data-audit mistake, and it is invisible until the
histogram grows a spike at zero.

---

## Part A — Where each analysis lives

Rows follow the calendar. The last column points to the note in Part B that explains where
the outputs differ.

| Analysis (week) | Minitab | Excel (native · ToolPak · add-in) | R | Python | Note |
|---|---|---|---|---|---|
| **Descriptive statistics** (2, 4) | Stat > Basic Statistics > Display Descriptive Statistics; Graphical Summary adds the histogram, the Anderson-Darling test and a 95% CI for the mean | `AVERAGE`, `MEDIAN`, `STDEV.S`, `QUARTILE.INC`, `MIN`, `MAX`, `COUNT` · ToolPak: Descriptive Statistics, tick Summary statistics and Confidence Level for Mean | `summary(x)`, `sd(x)`, `quantile(x)` | `df.describe()`, `df["y"].std()`, `scipy.stats.describe(x)` | 1 |
| **Run chart** (2, 4) | Stat > Quality Tools > Run Chart (subgroup size 1); prints tests for clustering, mixtures, trends, oscillation | Line chart with a `MEDIAN` constant series; no tests | `plot(x, type = "b"); abline(h = median(x))` — `qcc` has no run chart | `ax.plot(x); ax.axhline(np.median(x))` | 3 |
| **I-MR chart** (4) | Stat > Control Charts > Variables Charts for Individuals > I-MR; I-MR Options > Tests to enable rules 1, 2, 3 and 5 | Moving-range column, centers with `AVERAGE`, limits by the week 4 formulas, line chart with three constant series (capability worksheet shows the build) · add-in: Individuals chart | `qcc(x, type = "xbar.one")`; `qcc(mr, type = "R")` on the moving ranges | Formulas: `mr = s.diff().abs()`, `MRbar/1.128`, `matplotlib` | 2, 3 |
| **X̄-R and X̄-S charts** (4) | Stat > Control Charts > Variables Charts for Subgroups > Xbar-R (n ≤ 8) or Xbar-S; data stacked with a subgroup column, or across columns | Subgroup `AVERAGE` and `MAX − MIN` (or `STDEV.S`), limits with A2, D3, D4 from the constants table, two line charts · add-in: Xbar-R / Xbar-S | `qcc(matrix, type = "xbar")`; `type = "R"`; `type = "S"` | `df.groupby("subgroup").agg(["mean", "std", "min", "max"])`, formulas, `matplotlib` | 2, 3 |
| **p, np, c, u charts** (4, 8) | Stat > Control Charts > Attributes Charts > P / NP / C / U, with the subgroup-size column; limits step with n by default | Column of nᵢ, p̄ by `SUM/SUM`, per-row limits, line chart · add-in: p / np / c / u | `qcc(defectives, sizes = n, type = "p")`; `"np"`, `"c"`, `"u"` | Per-row limits in `pandas`, `matplotlib` | 3 |
| **Staged chart** baseline → pilot → monitoring (7, 8) | Any control chart > Options > Stages, with a stage column; limits recalculated per stage or held | Limits computed from the baseline rows only and extended across the pilot rows; recalculated block for the post-change stage · add-in: staged charts | `qcc(baseline, newdata = pilot)` holds the baseline limits; separate `qcc` objects per stage to recalculate | Limits from the baseline block; both blocks plotted | 3 |
| **Gage R&R, crossed** (3) | Stat > Quality Tools > Gage Study > Gage R&R Study (Crossed); ANOVA method; enter the tolerance under Options for %Tolerance | Toolkit MSA workbook (average-and-range method, formulas visible) · add-in: Gage R&R (ANOVA) | `SixSigma::ss.rr(var, part, appr, data, lsl, usl)` | Two-way ANOVA with interaction in `statsmodels` (`ols("y ~ C(part) * C(operator)")`, `anova_lm`), then the variance components from the mean squares — the toolkit notebook | 4 |
| **Attribute agreement** (3) | Stat > Quality Tools > Attribute Agreement Analysis, with the known-standard column; Fleiss' kappa by default | Toolkit workbook builds the cross-tables and computes kappa by formula · add-in: Attribute MSA | `irr::kappa2()` two raters; `irr::kappam.fleiss()` three or more; `irr::agree()` % agreement | `sklearn.metrics.cohen_kappa_score`; `statsmodels.stats.inter_rater.fleiss_kappa` (needs `aggregate_raters` first) | 5 |
| **Normality and equal-variance checks** (4, 6) | Stat > Basic Statistics > Normality Test (Anderson-Darling default); Graph > Probability Plot; Stat > ANOVA > Test for Equal Variances (Levene's and, for normal data, Bartlett's) | No normality test natively; a normal probability plot from `NORM.S.INV((RANK−0.5)/n)` against the sorted data · ToolPak: F-Test Two-Sample for Variances (two groups only) · add-in: Anderson-Darling, Levene | `shapiro.test(x)`, `qqnorm(x); qqline(x)`, `car::leveneTest(y ~ g)`, `bartlett.test` | `scipy.stats.shapiro`, `anderson`, `levene`, `bartlett`; `statsmodels.graphics.gofplots.qqplot` | 6 |
| **Capability — Cp, Cpk, Pp, Ppk, PPM, Z_bench** (4, 8) | Stat > Quality Tools > Capability Analysis > Normal (subgroup size or column, both specs; Options > Benchmark Z's for Z.Bench); Capability Sixpack shows the chart and the indices together; > Binomial for defectives, > Poisson for defects | Capability worksheet: `STDEV.S` for σ_overall, R̄ ÷ d2 (or MR̄ ÷ 1.128) for σ_within, the four index formulas, `NORM.S.DIST` for PPM, `NORM.S.INV` for Z_bench · add-in: Process Capability | `qcc::process.capability(qcc_object, spec.limits = c(LSL, USL))`; `pnorm`, `qnorm` | Formulas in a few lines; `scipy.stats.norm.sf` for tail areas, `norm.isf` for Z_bench | 2, 7 |
| **1-sample t and CI** (6) | Stat > Basic Statistics > 1-Sample t (Options: confidence level, alternative) | No ToolPak tool: t = (x̄ − μ₀) ÷ (s ÷ √n), p = `T.DIST.2T(ABS(t), n−1)`, half-width `CONFIDENCE.T(0.05, s, n)` · add-in: 1-Sample t | `t.test(y, mu = 5)` | `scipy.stats.ttest_1samp(y, 5)`; `.confidence_interval()` | 8 |
| **2-sample t** (6) | Stat > Basic Statistics > 2-Sample t; leave "Assume equal variances" unticked (Welch is the default) | ToolPak: t-Test: Two-Sample Assuming **Unequal** Variances (there is a separate Equal Variances tool); no CI for the difference — compute difference ± `T.INV.2T(0.05, df)` × SE · add-in: 2-Sample t | `t.test(y ~ group)` (Welch by default; `var.equal = TRUE` pools) | `scipy.stats.ttest_ind(a, b, equal_var=False)` — the default `equal_var=True` pools | 8 |
| **Paired t** (6, 7) | Stat > Basic Statistics > Paired t | ToolPak: t-Test: Paired Two Sample for Means; `T.TEST(a, b, 2, 1)` for p only; CI from the differences column with `CONFIDENCE.T` | `t.test(a, b, paired = TRUE)` | `scipy.stats.ttest_rel(a, b)` | 8 |
| **One-way ANOVA with Tukey** (6) | Stat > ANOVA > One-Way; Comparisons > Tukey; Graphs > Four in one | ToolPak: Anova: Single Factor gives F and p only — pairwise intervals must come from 2-sample t runs, labeled *unadjusted* · add-in: One-Way ANOVA with Tukey | `fit <- aov(y ~ g); summary(fit); TukeyHSD(fit); plot(fit)`; `oneway.test()` for Welch's ANOVA | `statsmodels.formula.api.ols("y ~ C(g)").fit()`, `anova_lm`; `statsmodels.stats.multicomp.pairwise_tukeyhsd(y, g)` | 9 |
| **Chi-square test of association; 2-proportion test** (6) | Stat > Tables > Chi-Square Test for Association (raw data or a summarized table); Stat > Basic Statistics > 2 Proportions | PivotTable for the observed counts; expected = row total × column total ÷ n; `CHISQ.TEST(observed, expected)` gives p; χ² itself by `SUMPRODUCT((O−E)^2/E)`; 2-proportion CI by hand · add-in: Chi-Square, 2 Proportions | `chisq.test(table(x, y))`; `prop.test(c(x1, x2), c(n1, n2))` | `scipy.stats.chi2_contingency(table)`; `statsmodels.stats.proportion.test_proportions_2indep`, `confint_proportions_2indep` | 10 |
| **Chi-square goodness-of-fit** (6) | Stat > Tables > Chi-Square Goodness-of-Fit Test (One Variable) | `CHISQ.TEST(observed, expected)` with the expected column written before looking | `chisq.test(counts, p = expected_props)` | `scipy.stats.chisquare(observed, expected)` | 10 |
| **Correlation** (5, 6) | Stat > Basic Statistics > Correlation (Pearson; Spearman under Method); Graph > Scatterplot | `CORREL(x, y)` or `PEARSON`; p by hand from t = r√(n−2)/√(1−r²) · ToolPak: Correlation (matrix, no p) · Spearman: `RANK.AVG` both columns, then `CORREL` | `cor.test(x, y)`; `method = "spearman"` | `scipy.stats.pearsonr(x, y)`; `spearmanr` | 11 |
| **Simple linear regression** (6) | Stat > Regression > Fit Regression Model (or Regression > Fitted Line Plot); Graphs > Four in one; Predict for a value of X | ToolPak: Regression — coefficients, SE, t, p, 95% interval, R², "Standard Error" = S; tick Residual Plots and Line Fit Plots; `SLOPE`, `INTERCEPT`, `RSQ`, `LINEST` for the numbers only | `fit <- lm(y ~ x); summary(fit); confint(fit); plot(fit); predict(fit, newdata, interval = "prediction")` | `statsmodels.formula.api.ols("y ~ x").fit().summary()`; `.get_prediction(new).summary_frame()` | 11 |
| **Confidence intervals** (6, and every exhibit) | Printed with every test above; Stat > Basic Statistics > 1 Proportion for a rate (exact by default) | Mean: `CONFIDENCE.T`; proportion: p ± 1.96 × √(p(1−p)/n) (Wald) · add-in: exact or Wilson | `t.test()$conf.int`; `binom.test()` (exact); `prop.test()` (Wilson, corrected) | `scipy.stats.t.interval(0.95, df, loc, scale)`; `statsmodels.stats.proportion.proportion_confint(k, n, method="wilson")` | 12 |
| **Pareto chart** (5, and Yellow Belt) | Stat > Quality Tools > Pareto Chart (raw categories or a frequency column; categories after the 95% cumulative line are combined into "Other") | Insert > Chart > Histogram > Pareto (Excel 2016+) from a category column, or a sorted summary table with a cumulative-% line on a secondary axis | `qcc::pareto.chart(table)` | Sorted `value_counts()`, bars plus a cumulative line on `ax.twinx()` | 13 |
| **Histogram, box plot, scatter, stratified** (5) | Graph > Histogram; Graph > Boxplot > With Groups; Graph > Scatterplot > With Groups | Insert > Insert Statistic Chart > Histogram / Box and Whisker (quartile method under Format); scatter with groups as separate series; PivotTable to stratify | `hist`, `boxplot(y ~ g)`, `plot(x, y)`; `ggplot2` for anything faceted | `seaborn.histplot`, `boxplot(x=g, y=y)`, `scatterplot(hue=)` | 1 |
| **Multi-vari chart** (5) | Stat > Quality Tools > Multi-Vari Chart (up to four factors; plots means with connecting lines and the individual points) | Line chart of group means with the raw points overlaid as a scatter series | `interaction.plot(f1, f2, y)` (means only); `ggplot2` with `geom_point` and `stat_summary` | `seaborn.pointplot(x=f1, y=y, hue=f2, errorbar=None)` plus `stripplot` for the points | 14 |
| **Mapping, C&E matrix, FMEA** (2, 5) | Minitab Workspace (not the statistics package): Value Stream Map, C&E Matrix, FMEA forms | Toolkit VSM workbook; the program's C&E and FMEA templates as sheets | Not a statistics task; where timestamps exist, `difftime` for waits | `pandas` datetime subtraction for waits | — |

---

## Part B — Where the outputs differ, and why

### Note 1 — Standard deviations, quartiles and whiskers

Every tool on this page uses the **sample** standard deviation (n − 1) by default — Minitab,
Excel `STDEV.S`, R `sd()`, `pandas .std()` — except `numpy.std`, which divides by n unless you
pass `ddof=1`. `scipy.stats.describe` uses n − 1. Excel's `STDEV.P` divides by n; do not use it
for process data.

Quartiles differ by interpolation rule. Minitab places Q1 at position (n + 1)/4 and
interpolates, which is Excel's `QUARTILE.EXC` and R's `type = 6`. Excel's `QUARTILE.INC` (the
default and the "inclusive median" option on the box-and-whisker chart), R's default
`type = 7` and `pandas.quantile` all use position (n − 1)/4 + 1. On a small sample the
quartiles can differ by a few percent of the IQR, the whiskers (1.5 × IQR in every tool) move
with them, and **a point on the edge can be flagged as an outlier in one tool and not
another**. State the rule when a box plot's outlier flag matters; the point is never removed
either way.

Kurtosis: Excel `KURT`, Minitab and `pandas .kurt()` report sample-corrected excess kurtosis
and agree; `scipy.stats.kurtosis` reports the population version unless `bias=False`. You will
rarely quote it; do not compare it across tools.

### Note 2 — Sigma estimators for capability (referenced from the capability worksheet)

Two standard deviations feed the four indices, and each has more than one estimator.

| Quantity | Minitab default | Toolkit Excel worksheet | `qcc::process.capability` | Python toolkit notebook |
|---|---|---|---|---|
| σ_within, subgroups | **Pooled standard deviation** with the c4 unbiasing constant (Estimate tab; R̄ ÷ d2 and S̄ ÷ c4 are options) | **R̄ ÷ d2** | The `qcc` object's `std.dev`: R̄ ÷ d2 for `type = "xbar"` | Whichever you code; the notebook uses R̄ ÷ d2 to match the worksheet |
| σ_within, individuals | **MR̄ ÷ 1.128** (median moving range is an option) | MR̄ ÷ 1.128 | MR̄ ÷ 1.128 for `type = "xbar.one"` | MR̄ ÷ 1.128 |
| σ_overall | Sample SD of all values; an unbiasing constant can be applied under Options (off by default) | `STDEV.S` of all values | `sd()` of all values | `.std()` of all values |

Pooled SD and R̄ ÷ d2 estimate the same thing and differ in the second decimal on a stable
process — the practicum key's Cpk 0.55 (S̄ ÷ c4) reads 0.54–0.56 by the other routes. On an
**unstable** chart they diverge more, because ranges and pooled sums of squares respond
differently to the special-cause subgroups; that divergence is a symptom, not a choice to
make. Write the estimator on the capability exhibit: "Cpk 0.55 (σ_within = S̄ ÷ c4, Minitab)".

Minitab prints **Expected PPM within** (from σ_within), **Expected PPM overall** (from
σ_overall) and **Observed PPM**; the worksheet computes the first two and counts the third.
**Z.Bench** in Minitab is the benchmark Z with no shift added. Some Excel add-ins print a
"sigma level" or "short-term sigma" that adds 1.5; the add-in's help says which. The
program's rule stands whatever the tool prints: DPMO on a stated basis and Z_bench, and a
sigma level only with "(1.5-shift convention)" on the same line.

### Note 3 — Control chart limits and rule sets

**Limits.** All tools compute 3σ limits from the same constants (d2, A2, D3, D4, c4); with
the same estimator (Note 2) the limits agree to the last digit. Two places they do not:
`qcc` and the worksheet compute R-chart limits with D3 = 0 for n ≤ 6, as Minitab does; for
attribute charts with varying nᵢ, Minitab and `qcc` (given `sizes`) draw **stepped** limits, the
Excel build must compute them per row, and a chart built on the average n draws a constant
limit that mis-calls the small-n days (week 4, the TXN case).

**Rule sets are the real trap.** The program's four rules map onto Minitab's numbered tests
as follows:

| Program rule | Minitab test | `qcc` | Excel / add-in |
|---|---|---|---|
| 1 — one point beyond a limit | Test 1 | `beyond.limits`, on by default | By eye or a flag column `=OR(x>UCL, x<LCL)` · add-ins: configurable |
| 2 — nine consecutive on one side of the center | Test 2 (9) | `violating.runs`, **run length 7 by default** — set `qcc.options(run.length = 9)`; newer releases expose the rules differently, check `?qcc.options` | Flag column counting the run · add-ins: usually 8 or 9, check |
| 3 — six consecutive rising or falling | Test 3 (6) | Not built in; compute from `diff()` | Flag column · add-ins: configurable |
| 4 — two of three beyond 2σ on the same side | **Test 5** (Minitab's test 4 is "14 alternating") | Not built in | Flag column · add-ins: configurable |

Minitab runs **test 1 only** by default; tick 1, 2, 3 and 5 under Options > Tests, and name
them on the chart. A chart that fired "rule 4" in Minitab fired the alternating-points test,
not the program's rule 4.

**Run chart tests.** Minitab's run chart prints p-values for clustering, mixtures, trends
and oscillation. They are not the SPC rules and are not on the program's rule set; read the
run chart for the median crossing pattern and move to a control chart. Minitab centers the
run chart on the median by default; a line chart in Excel centers on whatever you draw.

**Staged charts.** `qcc(baseline, newdata = pilot)` plots the pilot against the *baseline*
limits without recalculating — the week 7 evidence chart. To recalculate for the post-change
stage, build a second `qcc` object on the new stage's points once it has 20–25 of them.
Minitab's Stages option recalculates per stage by default; hold the limits with the
"historical" options when you want the baseline limits extended.

### Note 4 — Gage R&R: method, pooling, multiplier, tolerance

| Choice | Minitab | `SixSigma::ss.rr` | Toolkit workbook | Python notebook |
|---|---|---|---|---|
| Method | ANOVA (default) or X̄-R | ANOVA | X̄-R (average and range) | ANOVA from `statsmodels` mean squares |
| Operator × part interaction | Dropped from the model when its p > **0.25** (Options) | Dropped when p > `alphaLim`, **0.05 by default** | Not estimated — the X̄-R method has no interaction term | You decide; the notebook uses 0.25 to match Minitab |
| Study-variation multiplier | **6** (5.15 under Options) | 6 | 6 | 6 |
| %Tolerance | Only when the tolerance is entered | Only with `lsl` and `usl` | Enter the tolerance | Enter the tolerance |
| Negative variance component | Set to zero | Set to zero | — | Set to zero in the notebook |

The pooling rule is the difference that bites: a study with interaction p = 0.15 keeps the
interaction in Minitab and drops it in `ss.rr`, and reproducibility moves by a few points of
%Study Variation. The practicum key's studies have interaction p = 0.60, so every route
agrees within a point. The X̄-R method has no interaction term at all and reads a little
lower on reproducibility when one exists — say "X̄-R method, toolkit workbook" on the exhibit.

**%Contribution** is a share of *variance* (σ²); **%Study Variation** and **%Tolerance** are
shares of *standard deviation* (6σ). The three columns do not add the same way; the
acceptance bands in `msa-plan.md` are on %Study Variation and %Tolerance. `ndc` is
1.41 × σ_part ÷ σ_GRR truncated, in every tool.

### Note 5 — Attribute agreement: kappa variants

Kappa is agreement beyond chance, and "chance" is computed from the raters' marginal
frequencies — which is where the variants differ.

| Statistic | Where it appears | What it compares |
|---|---|---|
| **Cohen's kappa** | `irr::kappa2`; `sklearn cohen_kappa_score`; the toolkit workbook; Minitab under Options | Two raters (or one rater vs the standard), each rater's own marginals for the chance term |
| **Fleiss' kappa** | Minitab's default for within-appraiser, between-appraiser and vs-standard; `irr::kappam.fleiss`; `statsmodels fleiss_kappa` | Any number of raters, marginals pooled across raters for the chance term |
| **Kendall's coefficient** | Minitab, when you tick that the categories are ordered | Ordinal ratings (wound stage 1–4): agreement that credits near misses. Not for pass/fail |

On the same two-trial data, Minitab's within-appraiser kappa (Fleiss', treating the two
trials as two raters) and `irr::kappa2` on the same two columns (Cohen's) differ in the
second decimal because the chance term is computed differently; the practicum key's 0.72 and
0.86 read 0.70–0.74 and 0.85–0.87 by the other route. Name the variant on the exhibit.

Two more definitional differences. Minitab's "Appraiser vs Standard" **percentage** counts
an item as agreed only when **every** trial matches the standard; a per-trial percentage in
R or Python reads higher — replicate the all-trials rule (the toolkit notebook does).
Minitab's confidence intervals on the percentages are **exact** (Clopper–Pearson); the
workbook's formula is Wald and reads narrower on 30 items; `binom.test` in R and
`proportion_confint(method="beta")` in Python reproduce Minitab's.

### Note 6 — Normality and equal-variance tests: different tests, different p-values

Minitab's default normality test is **Anderson-Darling**; R's `shapiro.test` and SciPy's
`shapiro` are **Shapiro-Wilk**; SciPy's `anderson` returns critical values, not a p-value.
They ask slightly different questions and their p-values will not match; on the same data
one can read 0.04 and the other 0.08. The judgment is the probability plot plus the rule of
thumb in the selector, not the p-value, and the exhibit names which test you ran. Excel has
no normality test without an add-in; the probability plot built from `NORM.S.INV` is the
Green Belt's tool there.

For spread: Minitab's **Levene's test** uses absolute deviations from the **median** (the
Brown–Forsythe form); `car::leveneTest` and `scipy.stats.levene` default to the median too,
so the three agree. Bartlett's test agrees everywhere and is sensitive to non-normality;
Minitab prints it only when it thinks the data are normal. Excel's ToolPak F-test compares
two variances only, is more sensitive to non-normality than either, and should be named as
an F-test when used.

### Note 7 — Capability output labels

Minitab's "Within" column is Cp and Cpk; "Overall" is Pp and Ppk; the report calls
σ_within "StDev(Within)" and σ_overall "StDev(Overall)". `qcc::process.capability` prints Cp,
Cp_l, Cp_u, Cp_k and **Cpm** (a target-based index, Black Belt; ignore it) and, with the
`std.dev` from a subgroup chart, its indices are Cp/Cpk, not Pp/Ppk — pass
`std.dev = sd(all values)` to get the overall pair. Some add-ins label the overall pair
"long-term" and the within pair "short-term"; they are the same four numbers under other
names. The worksheet's line 21 (Cp − Cpk and Cpk − Ppk) is not printed by any tool; you write
it.

### Note 8 — t-tests: pooled vs Welch, and degrees of freedom

| Tool | Two-sample default | How to switch |
|---|---|---|
| Minitab | **Welch** (separate variances) | Tick "Assume equal variances" to pool |
| Excel ToolPak | Two separate tools — pick **Unequal Variances** | The Equal Variances tool pools |
| R `t.test` | **Welch** (`var.equal = FALSE`) | `var.equal = TRUE` pools |
| Python `scipy.stats.ttest_ind` | **Pooled** (`equal_var=True`) | Pass `equal_var=False` |

Pooling borrows the larger group's spread for the smaller one. When the sample sizes and
spreads are similar the two versions agree to the third decimal — the practicum key's F3
test reads t = 17.8 on 664 df (Welch) and t = 18.2 on 1,492 df (pooled), p < 0.001 either way.
When they are not similar the difference is not cosmetic. Illustrative: group A n = 12,
SD 8; group B n = 40, SD 3; difference 5 units. Pooled: SE 1.51, t = 3.31, 50 df,
**p = 0.002**. Welch: SE 2.36, t = 2.12, 11.9 df, **p = 0.056**. The pooled test has used the
40 tight observations to vouch for the 12 loose ones. Welch is the program's default and the
selector's; the only reason to pool is a sponsor's reviewer asking for the textbook version,
and then you report both.

Welch's degrees of freedom are fractional. R and SciPy use the fraction (11.9); Minitab
truncates to an integer (11); the Excel ToolPak rounds it. The p-values differ in the third
decimal; the caption says which tool.

The Excel ToolPak prints t, df and p and **no confidence interval** for the difference.
Compute it: difference ± `T.INV.2T(0.05, df)` × SE, where SE = √(s₁²/n₁ + s₂²/n₂) for Welch.
An exhibit with p and no interval fails ★ A3 whatever tool it came from. SciPy returns the
interval only from release 1.11 (`result.confidence_interval()`); older releases need
`statsmodels.stats.weightstats.CompareMeans` or the formula.

### Note 9 — ANOVA and Tukey

`aov()` in R, `anova_lm` in `statsmodels`, Minitab's One-Way with "Assume equal variances"
ticked (its default) and the Excel ToolPak all compute the classic F. R's `oneway.test()`
defaults to **Welch's ANOVA** (`var.equal = FALSE`), as does Minitab when you untick the
box; the F and the df change, and the caption says which.

Tukey's simultaneous 95% intervals are the same arithmetic in Minitab, `TukeyHSD()` and
`pairwise_tukeyhsd`; the output layouts differ (Minitab and `statsmodels` print a
"reject" column; R prints adjusted p-values). The Excel ToolPak has **no pairwise
comparisons**: pairwise 2-sample t intervals are wider than the truth is narrow and are not
adjusted for the number of comparisons; label them *unadjusted* and, for three or more
groups, prefer an add-in, R or Python for the Tukey table.

### Note 10 — Chi-square and 2-proportion: continuity corrections and CI methods

On a **2 × 2 table**, `chisq.test` in R and `chi2_contingency` in SciPy apply Yates'
continuity correction by default (`correct = FALSE` / `correction=False` to switch it off);
Minitab and Excel's `CHISQ.TEST` do not. The corrected χ² is smaller. The selector's Card 6
table (173 of 910 vs 133 of 2,210) reads χ² ≈ 123 uncorrected and 121.6 corrected; p < 0.001
both ways. On a table with fewer than 50 units the correction can move p across 0.05; report
which you used, and when expected counts are below 5 read the Fisher exact p that Minitab
and R print instead.

For the **2-proportion test**: Minitab's default estimates the two proportions separately
for both the test and the Wald interval and prints Fisher's exact p alongside; R's
`prop.test` uses the pooled estimate with the continuity correction (its χ² equals the
corrected 2 × 2 value) and a Wilson-type interval; `statsmodels test_proportions_2indep` uses
the pooled score test by default and `confint_proportions_2indep` a Newcombe (score)
interval. The pooled, uncorrected z² equals the uncorrected 2 × 2 χ². On the practicum
numbers (emailed 250 of 1,840 vs portal 91 of 2,210) every route gives p < 0.001 and an
interval within a tenth of a point of 7.8 to 11.2; on the pilot's 29 of 548 vs 250 of 1,840
the interval methods differ by a few tenths at the ends. Report the interval and the method.

Excel: `CHISQ.TEST` returns p only. For the χ² statistic use `SUMPRODUCT((O−E)^2/E)`, and for
the 2-proportion interval compute (p₁ − p₂) ± 1.96 × √(p₁(1 − p₁)/n₁ + p₂(1 − p₂)/n₂) — Wald,
the same as Minitab's default.

### Note 11 — Correlation and regression

The arithmetic is identical; the labels are not. Minitab's **S** is R's "Residual standard
error", `statsmodels`' square root of `mse_resid`, and the Excel ToolPak's "Standard Error"
in the Regression Statistics block. Minitab prints R-sq, R-sq(adj) and R-sq(pred); the
ToolPak prints R Square and Adjusted R Square; `statsmodels` prints both and adds
Durbin-Watson and Jarque-Bera lines you can ignore at this level. The ToolPak's
"Significance F" is the p-value for the model, which for one X equals the slope's p.

Prediction intervals: Minitab's Predict, R's `predict(interval = "prediction")` and
`statsmodels`' `get_prediction().summary_frame()` agree; the ToolPak has none — the fitted
line plot's bands, if you draw them, are confidence bands for the mean, not prediction
intervals for a new value, and the caption must not confuse the two.

Spearman: Minitab under Method; R and SciPy by argument; Excel by ranking both columns with
`RANK.AVG` and running `CORREL` on the ranks (ties handled as averages, as the others do).

### Note 12 — Confidence intervals for proportions

Four methods are in play and they differ on small samples.

| Method | Where it is the default |
|---|---|
| Exact (Clopper–Pearson) | Minitab 1 Proportion; R `binom.test`; `proportion_confint(method="beta")` |
| Wilson (score) | R `prop.test` (with continuity correction); `proportion_confint(method="wilson")` |
| Wald (normal approximation) | The Excel formula; `proportion_confint` default (`method="normal"`) |

On 30 items at 90% agreement the exact interval is about 73–98%, Wilson about 74–97%,
Wald about 79–101% — Wald exceeds 100%, which is the sign it should not be used with few
items or rates near 0 or 1. Means: every tool's t-interval agrees.

### Note 13 — Pareto

Minitab combines every category after the cumulative line passes **95%** into "Other" by
default (Options to change it); Excel's Pareto chart type and `qcc::pareto.chart` draw every
category. Two Paretos of the same log can therefore show a different number of bars; the
percentages of the bars they share agree. When categories carry a cost or a time weight,
every tool needs the pre-summarized table (category, weighted total); Minitab and `qcc`
accept a frequency column, Excel's chart type does not — build the summary first.

### Note 14 — Multi-vari

Minitab's Multi-Vari Chart plots group means joined by lines with the individual points
shown. `interaction.plot` in R plots means only; add the points with `ggplot2`.
`seaborn.pointplot` draws **95% confidence bars by default** (bootstrapped) that Minitab does
not draw; pass `errorbar=None` or say on the exhibit what the bars are. The chart is a
picture of where the variation lives; it prints no statistic in any tool, and the test that
follows it is chosen from the selector.

---

## Worked example — one test, three tools

The practicum key's verified cause (MFG, week 6): hole-position deviation, fixture F3
(n = 394, mean 0.132, SD 0.125) against the other three fixtures (n = 1,100, mean 0.003,
SD 0.119), Welch 2-sample t. The outputs, as each tool prints them:

**Minitab** — Stat > Basic Statistics > 2-Sample t, "Assume equal variances" unticked:

```
Two-Sample T-Test and CI: hole_pos_dev_mm vs fixture_group
Equal variances were not assumed for this analysis.

Sample     N     Mean    StDev  SE Mean
F3       394   0.1320   0.1250   0.0063
Other   1100   0.0030   0.1190   0.0036

Difference   95% CI for Difference
   0.1290        (0.1148, 0.1432)

T-Value    DF   P-Value
  17.80   664     0.000
```

**Excel** — Data > Data Analysis > t-Test: Two-Sample Assuming Unequal Variances, the two
groups unstacked into two columns; the interval computed beside it:

```
                               F3        Other
Mean                        0.1320      0.0030
Variance                    0.0156      0.0142
Observations                   394        1100
Hypothesized Mean Diff           0
df                             664
t Stat                       17.80
P(T<=t) two-tail             0.000
t Critical two-tail          1.963

95% CI  = 0.1290 ± T.INV.2T(0.05, 664) × SQRT(0.0156/394 + 0.0142/1100)
        = 0.1290 ± 1.963 × 0.00725  →  0.1148 to 0.1432
```

**R** — `t.test(hole_pos_dev_mm ~ fixture_group, data = brackets)`:

```
	Welch Two Sample t-test
t = 17.8, df = 664.4, p-value < 2.2e-16
95 percent confidence interval:
 0.1148 0.1432
sample estimates:
mean in group F3  mean in group Other
           0.132                0.003
```

**Python** — `res = scipy.stats.ttest_ind(f3, other, equal_var=False)`; `res.confidence_interval()`:

```
TtestResult(statistic=17.80, pvalue=1.3e-58, df=664.4)
ConfidenceInterval(low=0.1148, high=0.1432)
```

Four outputs, one sentence, and the caption names the tool: *"Parts off fixture F3 sit
0.13 mm further out than parts off any other fixture (95% CI 0.115 to 0.143 mm; Welch
2-sample t, Minitab 22) — half the distance to the tolerance limit."* The p-value is the
same fact printed four ways (0.000, 1.3 × 10⁻⁵⁸, < 2.2 × 10⁻¹⁶); the interval is what the
sponsor hears.

---

## Common mistakes

- **`scipy.stats.ttest_ind` without `equal_var=False`.** The one default on this page that
  contradicts the program's method. Every notebook in the toolkit passes it explicitly.
- **`numpy.std` without `ddof=1`.** Divides by n; the SD reads low and Cpk reads high. Use
  `pandas .std()` or pass `ddof=1`.
- **Excel blanks read as zeros.** A blank in a formula range is skipped by `AVERAGE` and
  counted as zero in a subtraction or a chart series. Audit before charting (week 4).
- **Excel dates and times.** A timestamp is a fraction of a day; a difference of 0.0417 is
  one hour. Multiply by 1,440 for minutes and say so in the operational definition.
- **`qcc`'s run rule of seven called "rule 2."** The program's rule 2 is nine; set the
  option or compute the run yourself, and name the length on the chart.
- **Minitab test 4 mistaken for the program's rule 4.** The program's rule 4 is Minitab
  test 5. Tick 1, 2, 3 and 5.
- **Comparing a corrected χ² with an uncorrected one** and concluding the tools disagree.
  They agree; one applied Yates. Name it.
- **An add-in's "sigma level" quoted bare.** Find out whether the 1.5 was added; write the
  convention on the same line either way.
- **A Cpk from one estimator beside a Cpk from another.** Baseline from the Minitab report
  (pooled SD), pilot from the worksheet (R̄ ÷ d2): the second decimal moves and the reviewer
  asks. Use one route for before and after, and name it.
- **Pasting output as evidence.** A block of software output without the sentence — effect,
  interval, practical meaning — is not A3 evidence in any tool.
- **No tool, version or method in the caption.** "2-sample t, p < 0.001" is unreadable a
  year later; "Welch 2-sample t, Minitab 22, n = 394 and 1,100" is a record.

## Rubric items evidenced

| Item | What this page contributes |
|---|---|
| ★ M3 MSA attempted | The Gage R&R and attribute agreement rows and Notes 4–5: the method, pooling rule, multiplier and kappa variant named on the exhibit, so the reviewer can read the study whatever tool produced it |
| M4 Stability before capability | Notes 2, 3 and 7: the rule set mapped to the tool's tests; the sigma estimator named; the same route for baseline and after |
| A2 Graphical analysis | Notes 1, 13, 14: quartile rules, Pareto "Other" thresholds and multi-vari error bars, so a chart's outlier flags and bars mean what the caption says |
| ★ A3 Root cause verified | Notes 8–12: Welch by default, the interval computed where the tool omits it, the continuity correction and CI method named |
| ★ I3 Before/after evidence | The staged-chart row and Note 3: baseline limits held across the pilot in every tool; the same estimator before and after |
| S1 Storytelling | Every exhibit captioned with tool, version and method choice, so a stranger — or a reviewer with a different license — can reproduce the number |

*v1.0 · 2026-09-20*
