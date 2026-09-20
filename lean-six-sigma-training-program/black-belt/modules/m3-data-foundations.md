# Module 3 — Data Foundations: Distributions, Capability, Power and Intervals

**Weeks 4–5** · ≈ 8 h self-paced + two 2.5 h live labs · Exam section C (objective B3) ·
Rubric items M2 and M3 · Prerequisite: Green Belt week 4 (stability before capability,
Cp/Cpk on normal data) and Module 2 (your MSA plan).

**Learning objectives.** By the end of this module the learner can:
1. Identify the distribution family a dataset most plausibly follows, using a control chart,
   stratified histograms, probability plots and Anderson-Darling statistics together, and
   defend the choice in one paragraph.
2. Apply a Box-Cox or Johnson transformation, transform the specification limits with it,
   and state the three situations in which the transformation misleads.
3. State process capability for non-normal data (fitted distribution or transformed scale)
   as a Ppk and an expected parts-per-million, and reconcile it with the observed rate.
4. Calculate the sample size for a two-sample t-test, a paired t-test, a one-way ANOVA and a
   two-proportion test from a difference that matters, and calculate the power of a study
   that is already constrained.
5. Distinguish a confidence interval, a prediction interval and a tolerance interval, and
   choose the one that answers the sponsor's actual question.
6. Write the baseline statement that earns rubric item M2, including the sample-size
   justification and the data-provenance record for M3.

Green Belt taught you to check stability first and then compute Cp and Cpk with the normal
model. This module covers what you do when the normal model is wrong, how many observations
you need before a comparison means anything, and which interval answers which question.
Everything here is software-first: you read output, you write the sentence.

---

## 3.1 Distribution identification (60 min)

**Hook (HC).** An emergency department reports door-to-provider time. The sponsor asks: "What
fraction of patients wait more than 60 minutes, and is that getting better?" The Green Belt on
the team fitted a normal distribution to 180 arrivals (mean 42.8 min, SD 28.9 min) and
reported 27.6% over 60 minutes. The observed fraction in the same data is 18.9%. Nobody made
an arithmetic error. The model was wrong for the data, and the tail is where the model's
error lives.

**Teach.** Capability, prediction intervals, tolerance intervals and most sample-size formulas
are statements about the *tails* of a distribution. The center of almost any dataset looks
normal enough; the tails do not. Identifying the distribution is therefore not a formality
before capability — it *is* the capability calculation.

The sequence:
1. **Stability first.** Put the data on the right control chart (I-MR for individuals). A
   process with shifts or trends has no single distribution to identify; the histogram is a
   blend of several. Fix or stratify before you fit anything.
2. **Histogram by stratum.** Split by the obvious factors (site, shift, machine, product
   line). Two humps means two processes. A distribution fitted across them describes neither.
3. **Reason about the physics before you look at p-values.** Time-to-event data (waits,
   cycle times, time to failure) are bounded at zero and skewed right: lognormal, Weibull,
   gamma and exponential are the candidates. Strength and dimensional data are often normal
   or Weibull. Counts and defectives are Poisson or binomial and get attribute capability, not
   a fitted continuous curve.
4. **Fit the candidates and compare.** The Anderson-Darling (AD) statistic measures the
   distance between the data and the fitted curve, weighting the tails. Smaller is closer.
   The p-value tests "could this family have produced these data?" — read it as a screen, not
   a verdict.
5. **Choose the simplest family that fits and makes physical sense.** A two-parameter family
   that fits beats a three-parameter family that fits slightly better. Say why you chose it.

Two traps with the p-value. At large n (several hundred), AD rejects everything, including
families that are perfectly usable; look at the probability plot and the size of the AD
statistic instead. At small n (under 30), AD rejects nothing; you have too little data to
distinguish families, and the honest statement is that the tail estimate is uncertain.
A third trap is resolution: data recorded to whole minutes, or to a gauge's coarse step,
produce a staircase on the probability plot and a rejected normal fit that has nothing to do
with the underlying process.

**Show (HC).** The same 180 door-to-provider times, four candidate families:

```
Individual Distribution Identification: door_to_provider_min   N = 180

Distribution          AD       P        Parameters
Normal              7.494   <0.005      Mean = 42.8   StDev = 28.9
Lognormal           0.351    0.467      Location = 3.573   Scale = 0.597
Exponential        15.322   <0.003      Mean = 42.8
Weibull             2.887   <0.010      Shape = 1.640   Scale = 48.2

Lognormal percentiles:  Median = 35.6    95th = 95.0
Estimated proportion > 60 min:  Lognormal 0.191   Normal 0.276   Observed 0.189
```

*The sentence you tell your sponsor:* "Wait times follow a lognormal pattern — most patients
are seen in about 35 minutes, but the long waits are much longer than a bell curve would
predict. About one patient in five waits over an hour today; the earlier figure of 28% was a
modeling error, not a change in the department."

**Software parity.** Minitab: Stat > Quality Tools > Individual Distribution Identification.
Excel: no native tool; the Excel stats add-in provides AD by family, or plot the empirical
percentiles against `LOGNORM.INV`/`NORM.INV` quantiles by hand. R: `fitdistrplus::fitdist()`
for each family, `goftest::ad.test()` or `nortest::ad.test()`. Python:
`scipy.stats.<family>.fit()` then `scipy.stats.anderson()` (normal, exponential, Weibull)
or a hand-computed AD from the fitted CDF.

**When NOT to use distribution identification.** When the process is unstable (fix that
first); when the data are counts or defectives (attribute capability); when n < 30 (report
the observed rate with a wide interval and say the tail is unknown); when the "non-normality"
is two strata blended (split them).

**Try.** Three datasets are provided: a stable lognormal, a normal with two-decimal rounding,
and a two-site mixture. For each, write the one-paragraph justification of the family you
choose or the reason you refuse to choose. Compare with the key in the module workbook.

---

## 3.2 Box-Cox and Johnson transformations — and when they mislead (50 min)

**Hook (TXN).** An accounts-payable team measures invoice processing time in working hours
from receipt to approval (n = 150; mean 22.0 h, median 18.7 h, SD 15.1 h). A normal
capability against a 40 h service target claims 12% late; the invoices themselves show 9%
late. The team is asked to "transform the data so the tools work."

**Teach.** A transformation changes the scale of the data so that a normal model fits. The
**Box-Cox** family raises the data to a power λ (λ = 1 leaves it alone, λ = 0.5 is a square
root, λ = 0 is the natural log, λ = −1 is the reciprocal). Software estimates λ by finding
the value that makes the transformed data most normal and gives a confidence interval; you
round to the nearest interpretable value inside that interval. The **Johnson** system is a
larger family of curves that can be bent to fit almost any single-humped shape.

Three rules, in order of how often they are broken:
- **Transform the specification limits with the same λ, and report every result back on the
  original scale.** A Ppk on the log scale means nothing to Finance; a "40 h" target becomes
  ln(40) = 3.69 inside the calculation and 40 h again in the sentence.
- **A transformation cannot repair a mixture.** Two humps stay two humps.
- **A transformation cannot repair instability.** A trend or a shift transformed is still a
  trend or a shift, now harder to see.

**Show (TXN).** Box-Cox on the invoice data:

```
Box-Cox Transformation: invoice_hours   N = 150

Estimated lambda       0.02
95% CI for lambda    (-0.16, 0.21)
Rounded lambda         0.00  (natural log)

Anderson-Darling normality:  original 7.522 (P < 0.005)   transformed 0.442 (P = 0.285)
```

*The sentence you tell your sponsor:* "Processing times are skewed — a log scale makes them
behave — and on that scale the 40-hour target is missed by about 9% of invoices, which
matches what we count by hand. The 12% figure came from forcing a bell curve on skewed data."

**Where it misleads (illustrative, TXN).** Take a two-site blend: 70 invoices from a site that
averages 4.0 h and 50 from a site that averages 11.5 h. Box-Cox estimates λ = −0.14 with a
confidence interval from −0.50 to 0.24, which looks like a normal answer. The AD statistic
after transformation is 5.5 (P < 0.005). The transformation did nothing useful, because the
non-normality was two processes, not one skewed process. A Johnson fit would have found a
curve that passes AD, and that curve would predict a tail belonging to no real site.

Also count as misleading: a hard boundary (a wait that cannot be below zero, a fill that
cannot exceed the container), where the fitted curve places probability where the process
cannot go; a λ estimated from fewer than about 50 points, whose interval is too wide to mean
anything; and any dataset from which inconvenient points were removed before transforming.
Removing points is a data-ethics stop under the rubric, not a modeling choice.

**Software parity.** Minitab: Stat > Control Charts > Box-Cox Transformation, or the
Transform option inside Capability Analysis; Johnson via Individual Distribution
Identification. Excel: compute `LN()` or `x^λ` in a column and re-run normality with the
add-in; there is no Johnson fit without an add-in. R: `MASS::boxcox()`,
`car::powerTransform()`, `SuppDists` for Johnson. Python: `scipy.stats.boxcox()` returns λ
and its interval; `scipy.stats.johnsonsu.fit()`.

**When NOT to transform.** When a physically meaningful family fits directly (fit it instead
— see 3.3); when the data are a mixture or unstable; when the audience must act on the
number and the transformed scale hides the units; when the customer's specification is
one-sided and the family is known (Weibull for strength, lognormal for waits), because the
fit tells the same story with fewer steps.

**Try.** Re-run the two-site blend after stratifying. Report the capability for each site
against the 40 h target, then write the one sentence that explains why the blended number was
not reportable.

---

## 3.3 Non-normal capability (60 min)

**Hook (MFG).** A pull-off test on adhesive labels has a lower specification of 20 N. 120
labels from a stable run: mean 30.5 N, SD 7.2 N, minimum 15.8 N, nine failures below 20 N.
The customer wants a Ppk and an expected failure rate. Three analysts give three answers.

**Teach.** For non-normal data you have two honest routes and one dishonest one.
- **Fit a distribution and read the percentiles.** Software reports Ppk by the ISO method:
  Ppl = (median − LSL) / (median − X₀.₁₃₅%), Ppu = (USL − median) / (X₉₉.₈₆₅% − median),
  where the percentiles come from the fitted curve. Expected PPM is the fitted tail area
  beyond the specification, times a million.
- **Transform, compute normal capability on the transformed scale, report on the original
  scale.** Same rules as 3.2.
- **Force the normal model and hope.** Not a route.

Most software reports only overall capability (Pp, Ppk) for non-normal fits; the
within-subgroup Cpk depends on the normal model and is omitted. Say "Ppk" and mean it.

Always put three numbers side by side: the **expected PPM from the fit**, the **observed PPM**
from the data, and the **PPM the normal model would have claimed**. When the fit and the
observation disagree by a lot, the fit is wrong, not the data. When the normal model and the
fit agree, the choice did not matter — say so and move on.

**Show (MFG).** Weibull capability for the label pull-off force:

```
Process Capability Report: pull_off_force_N   Distribution: Weibull (2-parameter)
N = 120   Shape = 4.65   Scale = 33.31   LSL = 20.0   USL = none
Anderson-Darling (Weibull) = 0.574   (Normal fit: AD = 0.264, P = 0.693)

Overall capability          Ppl = 0.47    Ppk = 0.47
Percentiles (fitted)        X0.135% = 8.0   Median = 30.8   X99.865% = 50.0

Performance                 PPM < LSL
  Observed                   75,000
  Expected (Weibull)         89,087
  Expected (Normal)          71,291
```

*The sentence you tell your sponsor:* "Roughly one label in twelve fails the 20 N minimum, and
the process is stable, so that rate continues until the process changes. Ppk is about 0.5 on
either model — the two curves agree here, so the choice of model is not what is holding the
number down; the process center and spread are."

Notice that the Weibull and the normal fits agree within the uncertainty of nine failures.
On the door-to-provider data in 3.1 they did not: the normal model claimed 276,000 PPM over
60 minutes against a lognormal 191,000 and an observed 189,000. The gap opens as skew grows
and as the specification moves into the tail. You cannot know in advance which case you are
in, which is why you always show the three numbers.

**Attribute capability.** For defectives (binomial) or defects per unit (Poisson), capability
is the long-run rate from a stable p or u chart, stated as DPMO or a sigma level with the
basis (defects per opportunity, opportunities per unit) written down. No continuous fit.

**Software parity.** Minitab: Stat > Quality Tools > Capability Analysis > Nonnormal (choose
the family) or Normal with the Box-Cox transform option. Excel: `WEIBULL.DIST(LSL, shape,
scale, TRUE)` for the expected fraction, percentiles via `scale*(-LN(1-p))^(1/shape)`; the
add-in wraps this. R: `fitdistrplus::fitdist()` then `qweibull()`/`pweibull()`; `qcc` or
`SixSigma` for the report. Python: `scipy.stats.weibull_min.fit(x, floc=0)`, then `.ppf()` and
`.cdf()`.

**When NOT to state non-normal capability.** When the chart shows the process is not stable
(state the instability and its cause instead); when the measurement system is inadequate
(Module 2 — a 40% Gage R&R makes every tail estimate a guess); when n is under about 50 with
a one-sided specification deep in the tail (report the observed rate with its binomial
interval); when the data are a mixture.

**Try.** The module workbook has a fill-weight dataset with a natural lower boundary. Compute
capability three ways (Weibull, lognormal, Box-Cox) and reconcile with the observed rate.
One of the three places probability below the physical boundary. Find it and say why.

---

## 3.4 Power and sample size (60 min)

**Hook (TXN).** A claims-processing pilot expects to raise first-pass acceptance from 82% to
88%. The sponsor offers one week per arm at 130 claims a day — about 650 claims each. Is that
enough? If the pilot shows nothing, was the change useless or was the study too small?

**Teach.** Every test involves five quantities: the **difference that matters** (δ, in the
metric's units), the **noise** (σ, from your baseline and your MSA), the **false-alarm risk**
(α, usually 0.05), the **power** (1 − β, the chance of detecting δ if it is real; use 0.80,
0.90 when a miss is expensive) and the **sample size** (n). Fix four and the software gives
the fifth. The one that needs a human is δ: it is the smallest improvement the sponsor would
act on, and it comes from the charter, not from the data.

Rules of thumb you should be able to reproduce (α = 0.05, power 0.80, per group):
- Two-sample t: n ≈ 16 (σ/δ)². σ = 5 min, δ = 2 min → 100 per group; δ = 1 min → 394;
  δ = 3 min → 45.
- Paired t: uses the SD of the *differences*, which is usually much smaller than σ. Mean
  difference 1.5 with SD of differences 4 → 58 pairs.
- One-way ANOVA, four levels, σ = 5: maximum difference 3 between the extreme levels →
  62 per level; maximum difference 4 → 36 per level.
- Two proportions: strongly dependent on the baseline rate; see the output below.

Two misuses to refuse. **Retrospective power** ("the test was not significant, so let us
compute the power we had") adds nothing the p-value did not already say; power is a planning
number. **Power without an MSA**: if the gauge contributes half the σ, half the sample is
measuring the gauge.

**Show (TXN).** Sample size for the claims pilot, with the alternatives the sponsor might
prefer:

```
Power and Sample Size — Test for Two Proportions
Baseline proportion p1 = 0.82   alpha = 0.05   two-sided   power = 0.80

Comparison p2    Difference    Sample size per group
    0.86            0.04             1,314
    0.88            0.06               551
    0.90            0.08               290
    0.92            0.10               172

Power at n = 250 per group for p2 = 0.88:  0.47
```

*The sentence you tell your sponsor:* "To see an improvement from 82% to 88% reliably we need
about 550 claims in each arm — a little over four working days each at 130 a day, so your
one-week-per-arm offer covers it. If the pilot were cut to two days per arm, we would have
less than a coin-flip chance of detecting that improvement, and a null result would tell us
nothing."

**Software parity.** Minitab: Stat > Power and Sample Size > (2-Sample t, Paired t, One-Way
ANOVA, 2 Proportions). Excel: no native tool; the add-in has it, or use the t-test rule of
thumb above. R: `power.t.test()`, `power.prop.test()`, `power.anova.test()`, or the `pwr`
package. Python: `statsmodels.stats.power` — `TTestIndPower`, `TTestPower`, `FTestAnovaPower`,
`NormalIndPower` with `proportion_effectsize()`.

**When NOT to run a sample-size calculation.** When δ has not been agreed with the sponsor
(agree it first — the calculation is otherwise decoration); when the data already exist and
the question is what they show (analyze them; do not compute retrospective power); when the
measurement system has not passed (Module 2); when the comparison will be made on a control
chart over time rather than as a one-shot test (then the question is subgroup size and
frequency, Module 6).

**Try.** Your project's primary metric: write δ in words the sponsor used, take σ from your
baseline, and compute n for the comparison you plan. Then compute the power you actually have
if the sponsor halves the time window. Both numbers go in your M2 baseline statement.

---

## 3.5 Confidence, prediction and tolerance intervals (45 min)

**Hook (HC).** A pharmacy measures medication order turnaround (minutes from verification to
delivery), n = 60 orders: mean 45.7 min, median 42 min, SD 19.3 min, longest 121 min. Three
people ask three questions. The director: "What is our average?" The charge nurse: "How long
will the next order take?" The accreditation lead: "What time covers 95% of orders?"

**Teach.** Three intervals, three questions:
- A **confidence interval** brackets a *parameter* — the process mean, the median, the
  proportion. It narrows as n grows. It answers "what is the average?"
- A **prediction interval** brackets *one future observation*. It does not narrow much as n
  grows, because the next observation carries the full process spread. It answers "what will
  the next one be?"
- A **tolerance interval** brackets *a stated fraction of the population* with stated
  confidence — "95% of orders, with 95% confidence." It is the interval behind capability and
  behind most regulatory and customer commitments. It answers "what covers nearly all of
  them?"

All three depend on the distribution assumption, and the prediction and tolerance intervals
depend on it heavily because they reach into the tails. When the data are skewed, compute
them on the identified family or the transformed scale, then translate back. When you cannot
identify a family, a **non-parametric tolerance interval** uses order statistics: with n ≥ 59
the largest observation is a one-sided 95/95 upper bound, and with n ≥ 93 the smallest and
largest together form a two-sided one. The price of assuming nothing is a wider interval and a
larger n.

**Show (HC).** The turnaround data are lognormal (AD 0.208, P = 0.86; normal AD 1.285,
P = 0.002). Both scales shown so you can see what the assumption costs:

```
Intervals: turnaround_min   N = 60   Mean = 45.7   StDev = 19.3   Max = 121

                                       Normal model        Lognormal model
95% CI for the center                  (40.7, 50.7) mean   (38.2, 46.8) median
95% prediction interval, next order    (6.8, 84.6)         (19.1, 93.7)
95/95 upper tolerance bound            84.7                93.9
Non-parametric 95/95 upper bound       121 (largest of 60; confidence 0.954)
```

*The sentences you tell each person:* Director — "Our average is about 46 minutes, and we are
confident it is between 41 and 51." Charge nurse — "Any single order will most likely take
between 20 and 95 minutes; the normal model's 7-minute lower bound is an artifact." Accreditation
lead — "With 95% confidence, 95% of orders are delivered within about 94 minutes; if you want
a number that assumes nothing about the shape, the longest of our 60 orders, 121 minutes, is
the bound."

**Software parity.** Minitab: Stat > Basic Statistics > 1-Sample t (CI), Stat > Regression
or Predict for prediction intervals, Stat > Quality Tools > Tolerance Intervals (normal and
non-parametric). Excel: `CONFIDENCE.T()` for the CI; prediction interval by
`mean ± T.INV.2T(0.05, n−1) * s * SQRT(1 + 1/n)`; tolerance factors from a k-table or the
add-in. R: `t.test()`, `predict(lm(y~1), interval = "prediction")`, `tolerance::normtol.int()`
and `nptol.int()`. Python: `scipy.stats.t.interval()`, `scipy.stats.nct` for the k factor,
or `statsmodels` `get_prediction()`.

**When NOT to use each.** A confidence interval never answers a question about individual
orders or parts — quoting it to the charge nurse is the most common misuse. A prediction
interval is for one unit, not a fraction of the population. A tolerance interval on an
unstable process covers a population that does not exist; on n < 30 it is so wide it says
little, and you should say that.

**Try.** For your project's baseline data, write the three questions your sponsor, your
process owner and your customer would each ask, and compute the interval that answers each.
Note which one you were previously reporting for all three.

---

## 3.6 The baseline statement (15 min)

Rubric item M2 is earned by one paragraph and its exhibits. The paragraph reads, in order:
the chart and the subgrouping rationale and the stability verdict; the distribution
identified and why; capability as Ppk and expected PPM with the observed rate beside it; the
sample size used and the sample size justified for the comparison to come. M3 sits underneath
it: where every row came from, what was excluded and why, and the operational definition
that did not change. A baseline reconstructed from memory, or from a spreadsheet whose rows
were tidied before anyone looked at the chart, does not earn either item — and the reviewer
is instructed to treat it as a stop.

---

## Live lab, week 4 — "Which distribution, which capability" — run of show

**Duration:** 150 minutes, live virtual · **Teams of 4** · **Prerequisite:** 3.1–3.3 read;
software installed and the case dataset loaded before joining.

**Lab outcomes.** Every team (1) is fooled at least once by fitting a curve to data that had
no single distribution, (2) reconciles three capability numbers with an observed rate, and
(3) writes a baseline statement that would earn M2.

**The case: "Time to first good part at the Halden press cell" (MFG).** Two injection-molding
presses, two shifts, 26 weeks of changeovers; response = minutes from last good part of the
old job to first good part of the new job; USL = 45 min from the plant's scheduling model.
Ground truth (facilitator only) is described under *Vertical case dataset* below.

### 0:00–0:10 — Setup and the trap
Frame: "Your sponsor wants one Ppk for the cell by the end of the session." Poll: "Which
family do you expect changeover time to follow, gut only?" Save the results. Teams receive the
dataset and the specification; nothing else.

### 0:10–0:35 — Round 1: is there a process to describe?
Teams chart the data as individuals in time order. Most teams go straight to the histogram
and the identification tool; the facilitator does not stop them. The I-MR chart shows a
downward step in week 15 (press B only). Checkpoint at 0:30: each team states, in writing,
whether the 26 weeks are one process. Teams that missed the step go back; teams that found it
split the data before proceeding. **Do not rescue early** — the cost of fitting a curve to
26 weeks blended is the lesson.

### 0:35–1:05 — Round 2: identification by stratum
Post-step data only (weeks 15–26), stratified by press and shift. Teams run identification
on each stratum and on the combined post-step data. Press A alone is lognormal (AD ≈ 0.3);
combined with press B the AD statistics reject everything except a three-parameter fit that
none of the teams can explain physically. Facilitator floats with one question: "What is the
physical reason for the family you picked?" Teams that answer "the software said" get sent
back to the histogram.

### 1:05–1:35 — Round 3: capability three ways
Each team computes capability for the stratum the sponsor cares most about (press B, day
shift): lognormal fit, Box-Cox transform, normal model. Then the observed fraction over 45
minutes. Teams post their four numbers on the shared board. The normal model and the fits
disagree by a factor of about two in PPM on this stratum; the lognormal and Box-Cox agree
with each other and with the observed rate within the sampling uncertainty of the count of
failures.

### 1:35–1:55 — Round 4: how many changeovers?
The cell plans a setup-reduction kaizen (Module 7) and wants to prove a 10-minute reduction
in median changeover. Teams compute the sample size for a two-sample comparison using the σ
from their stratum, then the power available if the sponsor allows only four weeks of
changeovers per arm. Each team writes the sentence for the sponsor.

### 1:55–2:20 — Debrief: the anatomy of a wrong curve
Reveal ground truth. Teams narrate: when they first charted in time order; what the blended
identification told them; which capability number they would have sent the sponsor at 0:35.
Re-run the opening poll. Name the transferable patterns: stability before shape; stratify
before fit; three PPM numbers beside the observed rate, always; the physical reason for the
family, always; the sample-size sentence written before the kaizen, not after.

### 2:20–2:30 — Transfer
Each learner writes the baseline statement skeleton for their own project (chart, family,
Ppk and PPM, observed rate, n justified) and posts which element they cannot yet fill. The
Master Black Belt coach uses that list in the week 5 checkpoint.

### Facilitator notes and failure modes
- **A team charts in time order first and finds the step in 10 minutes:** promote them to
  reviewers. Their job in Round 2 is to challenge every other team's family choice with "what
  changed in week 15 and why would that change the shape?"
- **A team removes the three 90-minute changeovers as outliers:** stop the round for that
  team. Ask what operational definition would exclude them. There is none; they are the process
  on a bad day. Data ethics is the reason the rubric has a stop.
- **A team reports a Johnson-transformed Ppk with confidence:** ask them to draw the fitted
  curve over the histogram of press A and press B separately. It fits neither.
- **Software drift:** teams on Excel finish identification later than teams on Minitab or R.
  Pair them for Round 2 rather than extending the round.
- **Protect the debrief.** If Round 3 overruns, cut Round 4 to the two-sample t case only
  and start the debrief on time. A team that has not finished all four capability numbers
  learns more from the reveal than from finishing.

## Live lab, week 5 — Sample size and intervals clinic (compact run of show)

**150 minutes.** 0:00–0:15 each learner posts their project's δ, σ and the source of each.
0:15–0:55 pairs review each other's sample-size calculation against the charter wording; the
facilitator collects the δ values that were invented rather than agreed and returns them to
their owners. 0:55–1:35 interval clinic: each learner computes the confidence, prediction
and tolerance interval for their baseline metric and writes the sentence for the person who
asked for it; the facilitator picks three for the room to critique. 1:35–2:15 baseline
statement workshop — every learner reads a peer's M2 paragraph as the reviewer of record
would, with the rubric open. 2:15–2:30 close: what each learner will collect before the
week 6 checkpoint. Failure mode to watch: learners whose σ comes from a source other than
their own baseline or MSA; send them to Module 2's MSA plan.

---

## Project work this module

| Rubric item | What you produce by the end of week 5 |
|---|---|
| **M2 Baseline with the right distribution** | Baseline chart in time order with subgrouping rationale; stability verdict; distribution identified with the physical reason and the AD comparison; Ppk and expected PPM beside the observed rate; sample size for the coming comparison computed from an agreed δ, with the power you have if the window shrinks |
| **M3 Data provenance** | A one-page record: source system and extract date for every dataset; the operational definition and confirmation it did not change; every exclusion with the rule that excluded it; who cleaned what and how, reproducible by a stranger |
| Carried from M1/M2 | Charter δ confirmed in writing by the sponsor; MSA result for the primary metric attached, because σ without an MSA is not a σ |

If your data are a mixture, the baseline is stated per stratum and the project scope note
says which stratum the project addresses. If your process is unstable, the baseline statement
says so and the capability line is replaced by the special-cause investigation.

## Coaching prompts (week 5 checkpoint)

1. "Show me the chart in time order before you show me the histogram. What did the chart
   say, and what did you do about it before fitting anything?"
2. "What is the physical reason your metric follows the family you chose — and what do the
   observed rate, the fitted PPM and the normal PPM look like side by side?"
3. "Where did δ come from? Read me the sponsor's words. Now tell me the power you have if
   the pilot window is cut in half."

## Vertical case dataset — `m3-halden-changeovers.csv` (MFG)

One row per changeover, 26 weeks, two presses, two shifts, about 620 rows. Columns:
`date`, `week`, `press` (A/B), `shift` (day/night), `from_job`, `to_job`,
`changeover_min` (last good part to first good part), `mold_family`, `setter_id` (coded),
`notes`. Planted features, in the order teams should find them: (1) a step down of about 12
minutes in press B from week 15, when a pre-staged tooling cart was introduced on that press
only — the data are two processes in time; (2) press A is lognormal (median ≈ 31 min, log
scale ≈ 0.45), press B post-step is lognormal with a smaller median, and the blend rejects
every two-parameter family; (3) three changeovers over 90 minutes with `notes` showing a
mold-heater fault — real, in-process, not to be removed; (4) `changeover_min` recorded to the
whole minute, producing a staircase on the probability plot that tempts a normal rejection at
small n; (5) night shift on press A has four rows where the setter logged the time to first
*shot* rather than first *good* part (the note says so) — a changed operational definition,
to be excluded with the rule written down, not silently. The USL of 45 min is illustrative;
the shapes and step size are drawn from observed setup-reduction baselines. The file ships in
the practicum data folder when it is published; until then, the facilitator generates it from
this description and the parameters above.

## Takeaways

- Stability, then stratification, then shape — a fitted curve on a blend or a shifting process
  describes nothing.
- Transformations change the scale, not the data: transform the specs too, report on the
  original scale, and never transform a mixture or an unstable series.
- State non-normal capability as Ppk and expected PPM with the observed rate and the normal
  model's number beside it; the tail is where models disagree.
- Sample size begins with the sponsor's δ; the interval you quote must match the question
  that was asked.

## Cumulative check (re-testing Modules 1 and 2)

**C-PRAC-1.** A Black Belt candidate's charter names a $110K annualized saving from reducing
sterile-supply reprocessing rework (HC). The strategic linkage line reads "supports the
hospital's quality goals." The sponsor has signed. As the reviewer of record for D2, the
highest-leverage feedback is:
A. Accept — the sponsor's signature is the linkage · B. Require the line to name the specific
organizational objective and its metric, and have the sponsor confirm that link in the charter ✅
· C. Reduce the D2 score but pass the tollgate because the dollar figure is large · D. Ask for
a Kano survey before the charter can be accepted
`[A · B1 · Evaluate · HC · S · PRAC]` — D2 requires a written line to a stated objective
confirmed by the sponsor; a signature on a generic phrase is not that line, and a Kano survey
addresses D4, not linkage.

**C-PRAC-2.** A destructive tensile test on welded brackets (MFG) is being studied for
measurement error. Three operators will each test parts; a part can be tested only once.
Which design and interpretation is correct?
A. Crossed Gage R&R with each operator testing the same 10 parts twice · B. Attribute
agreement analysis on pass/fail results · C. Nested Gage R&R with batches of homogeneous
parts assigned to operators, accepting that part-to-part variation within a batch is
inseparable from repeatability ✅ · D. A paired t-test between operators
`[B · B2 · Apply · MFG · S · PRAC]` — destruction forces a nested design where each operator
gets different parts; a crossed design is impossible, and the interpretation must state the
confounding of within-batch variation with repeatability.

---

v1.0 · 2026-09-20
