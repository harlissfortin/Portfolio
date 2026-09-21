# Module 6 — Advanced SPC: Charting at Scale, Time-Weighted Charts and the Control Strategy

**Week 12** · ≈ 4 h self-paced + one 2.5 h live lab · Exam section F (objective B6) ·
Rubric items C1 and C3 · Prerequisite: Green Belt week 4 (I-MR, X̄-R, p, np, c and u charts;
the Western Electric and Nelson rule families) and Module 3 (stability before capability).

Green Belt gave you one chart for one metric on one process. A Black Belt project controls
several metrics across many machines, clinics or teams: some measured every minute, some
events that happen twice a year, some a mix of part numbers that never repeats. This module
is about choosing the chart that answers the question you are actually asking, forming
subgroups so it can, catching the drift a Shewhart chart is blind to, and writing it into a
control strategy the process owner runs without you. Every method ends with the sentence
you would tell your sponsor and the situation in which it does not apply.

**Learning objectives.** By the end of this module the learner can:
1. Select a charting approach for a process with many parallel streams, for autocorrelated
   data and for rare events (g and t charts at awareness level per the skills matrix), and
   state what question each chart answers.
2. Form rational subgroups for a stated question, diagnose a wrongly formed subgroup from
   the chart's arithmetic, and quantify what it hides.
3. Set up an EWMA chart (λ, L) and a tabular CUSUM (k, h) for a stated shift size, read
   both, and state from average run lengths when each beats a Shewhart chart.
4. Build a nominal or a standardized short-run chart for mixed part numbers or case types,
   and choose between them from a test of the variances.
5. Design the control strategy for a project's metrics: chart, subgroup, sampling frequency,
   response plan and owner, each with its reason written.

---

## 6.1 Chart selection at scale (40 min)

**Hook.** Your project reduced door-to-provider time across fourteen emergency departments.
Fourteen I-MR charts is not a control strategy; neither is one chart of the pooled data,
which hides any single site drifting.

**Teach — many streams.** Filler heads, mould cavities, analyzer channels, clinics, adjuster
teams: a **stream** is a parallel path through the same nominal process. Before choosing a
chart, ask of a stable period: *do the streams share one cause system?* Stratify — a box
plot by stream, a one-way ANOVA of stream means, Levene's test on the variances. Then:

| Finding | Approach | What the chart answers |
|---|---|---|
| Streams differ in neither mean nor spread | One chart on the pooled stream, subgrouped by time (6.2), plus a periodic stratified check | Has the whole process moved? |
| Streams differ in mean, not in spread | Chart each value as a deviation from its stream's own center (the nominal chart, 6.4) on one chart, stream identified on each point | Has any stream moved relative to itself? |
| Streams differ in spread as well | Standardized chart (6.4), or separate charts where the owner can act on them | Same, with unequal noise allowed for |
| Dozens of streams, one owner | A **group chart**: plot only the highest and lowest stream each period, labelled with which stream; or an exception list produced by software running the rules on every stream | Which stream needs attention today? |

A process owner acts on about five to eight charts; beyond that you design the exception
system, not the wall. Multivariate charts (Hotelling's T²) are Master Black Belt territory;
know the name so you can ask.

**Teach — autocorrelated data.** A control chart assumes successive values are independent.
Continuous processes sampled faster than they change — tank temperature every minute, ED
census every hour, open-claims backlog every day — violate that. Each value is close to the
last, the moving range is small, and I-MR limits computed from it are too tight. With
first-order autocorrelation φ, the moving-range estimate of σ is √(2(1 − φ)) of the true
value: at φ = 0.8 that is 0.63σ. The "3σ" limits sit at 1.9 true σ, the false-alarm rate
per point is 5.8% instead of 0.27%, and the in-control average run length falls from about
370 points to 17. The chart alarms every three weeks of daily data on a process that has
not changed, and the owner learns to ignore it.

Diagnose first with an autocorrelation plot of the stable period; lag-1 above about 0.5 is
a problem. Remedies, cheapest first: sample less often, at an interval where lag-1 drops
below 0.3; chart subgroup means over a window long enough to break the correlation; or fit
a time-series model and chart its residuals — Master Black Belt work, but recognize when it
is the right call. Never widen the limits by eye.

**Show (TXN).** Daily open property claims, 60 working days, lag-1 autocorrelation 0.82 —
open claims are WIP, and today's backlog is mostly yesterday's. The I-MR chart flags nine of
60 days. Weekly closures (throughput) have lag-1 of 0.15 and chart cleanly; the backlog is
tracked against its Little's Law cap (Module 7), not on control limits.

**Teach — rare events (awareness).** When events are rare — central-line infections,
wrong-site procedures, recordable injuries, misposted payments — a p or u chart needs n × p̄
of at least 5 per subgroup, which can mean a quarter of data per point and a lower limit of
zero, so improvement can never show. The **g chart** plots the number of opportunities
(cases, units, days) *between* events; the **t chart** plots the *time* between events on a
transformed scale. Improvement reads as points above the upper limit. You are expected to
recognize the situation and ask for the chart; building it is outside this credential's
minimally competent candidate statement.

**When not to use these approaches.** Do not pool streams that failed the stratification
test. Do not chart an autocorrelated series on I-MR at its native sampling rate and call
the result "unstable". Do not use a g or t chart when events are frequent enough for a u
chart, which has more power.

**Try.** List your primary metric's streams, write the question the owner will ask each
week, and name the table row that answers it.

---

## 6.2 Rational subgrouping: the decision, and a wrong subgroup worked through (50 min)

**Hook.** A six-head rotary filler has been "in control" on an X̄-R chart for two years,
overfilling one bottle in six by about 0.3% the whole time. The chart is not lying; it was asked
the wrong question.

**Teach.** A **rational subgroup** holds only common-cause variation; the chart tests the
variation *between* subgroups against it. Green Belt gave you the rule; Black Belt work is
the decision before it. Write the question first, then form the subgroup that leaves
everything relevant to the question *between* subgroups:

| Question the owner asks | Subgroup | Wrong subgroup and what it hides |
|---|---|---|
| Has the whole process shifted over time? | n consecutive units from one stream, close in time | One unit from each stream: stream differences inflate R̄, limits widen, time shifts hide |
| Is one stream different from the others? | The stream is the stratum, not the subgroup: stratified analysis or a per-stream chart | Pooling streams in time: the difference is averaged away |
| Does the day (or shift) drift? | Units close in time within the day; the day is between subgroups | A daily subgroup spanning the day: within-day drift sits inside R̄ |
| Do batches differ? | Units within a batch; batch is between subgroups | Units from several batches per subgroup |

**Show (MFG, worked example).** Bottle fill volume, target 500.0 mL, six-head rotary filler,
subgroups of six formed as one bottle from each head every 15 minutes, 25 subgroups over a
shift. Head 4's nozzle was set about 1.7 mL high at the last rebuild: the technician set it
to the drawing, and the drawing predates a nozzle change. The values are simulated from that
description with within-head short-term σ = 0.5 mL and a whole-filler shift of +0.8 mL (a
supply-pressure change) planted from subgroup 18.

```
Xbar-R chart of fill volume (mL) — subgroup = one bottle per head, n = 6, 25 subgroups
Xbar chart:  center 500.57   UCL 501.72   LCL 499.42   (A2 = 0.483, Rbar = 2.38)
R chart:     center   2.38   UCL   4.76   LCL   0.00   (D4 = 2.004)
Sigma (Rbar/d2, d2 = 2.534): 0.94 mL
Tests: none of the 25 subgroups signals on either chart
```

Now stratify the first 17 subgroups by head:

```
One-way ANOVA: fill volume (mL) versus head, subgroups 1–17 (n = 17 per head)
Head    Mean     SD          Source   DF      F       P
 1    499.95    0.56         Head      5    37.2   0.000
 2    500.40    0.33         Error    96
 3    500.12    0.42         Pooled SD within head = 0.47 mL
 4    501.67    0.38         Levene's test for equal variances: P = 0.31
 5    500.05    0.59
 6    499.76    0.39
```

**Reading it.** Head 4 runs 1.3–1.9 mL above the others. Because each subgroup contains all
six heads, that offset sits *inside* every range: R̄ is 2.38 mL where within-head variation
alone would give about 1.27, the estimated σ is 0.94 mL against a true 0.47, and the X̄
limits sit ±1.15 mL from center where they should sit ±0.58. The R chart stays quiet because
the offset is constant. Two things hide at once: the head difference (a nozzle adjustment)
and, from subgroup 18, the +0.8 mL shift, which lifts every subgroup mean but never reaches
a limit twice as wide as it should be. With correct limits a 0.8 mL shift signals on the
first or second subgroup (probability about 0.8 per subgroup); with the inflated limits the
probability is about 0.04 per subgroup — an average of over 20 subgroups, more than five
hours, running 0.8 mL over.

**The right subgrouping** follows the question. To watch the filler for shifts in time,
subgroup four consecutive bottles from *one* head, rotating heads each sample, with limits
from within-head variation; head-to-head differences then belong to a weekly stratified
check. To watch heads against each other, chart each head's deviation from its own center
on a nominal chart (6.4), head identified on every point. Rebuilt on the same subgroups with σ
estimated from each head's own run-to-run variation (center 500.33, UCL 500.87), the data
signal at subgroup 18 and on six of the eight subgroups after it.

**The sentence you would tell your sponsor.** "The filler chart was built so that a head
difference and a process shift both hid inside the limits. Head 4 has run about 1.7 mL
high since the rebuild — about 0.3% giveaway on every bottle it fills, and a nozzle
adjustment. The re-subgrouped
chart catches a shift under 1 mL within half an hour instead of most of a shift."

**When not to subgroup at all.** One value per period (a daily median, a monthly rate), or
units close in time that are not independent (6.1): use an individuals chart and say why.
A subgroup chosen to make the chart "quiet" is a stop; the subgroup is a design decision
recorded in the control plan with its reason.

**Try (case dataset, MFG).** From `data/m6-mfg-filler.csv`, reproduce both outputs, then
build the within-head chart and confirm where it first signals.

---

## 6.3 EWMA and CUSUM: catching the small shift (60 min)

**Hook.** After your improvement the daily median door-to-provider time sits at 18 minutes.
Over the next month it drifts to 19.5 and no point crosses a limit. A Shewhart chart looks
at one point at a time; a 0.75σ shift takes it, on average, 81 points to notice.

**Teach — the average run length.** The **ARL** is the mean number of points until a
signal: long in control (few false alarms), short after a shift. A Shewhart individuals
chart at 3σ has ARL₀ ≈ 370 and, for a shift of δ standard deviations, ARL₁ =
1/(1 − Φ(3 − δ) + Φ(−3 − δ)). Time-weighted charts accumulate evidence across points, so
they win on small shifts and lose little on large ones.

**EWMA.** z_t = λ·x_t + (1 − λ)·z_{t−1}, starting at z₀ = the target or in-control mean.
Limits: μ₀ ± L·σ·√[λ/(2 − λ)·(1 − (1 − λ)^{2t})], widening over the first few points and
settling at μ₀ ± L·σ·√[λ/(2 − λ)]. Parameters:
- **λ** (0 to 1) sets memory. Small λ (0.05–0.1) is most sensitive to shifts of 0.5σ or
  less; λ = 0.2–0.3 balances; λ = 1 is a Shewhart chart.
- **L** sets the limit width. Pairings giving ARL₀ ≈ 500: λ = 0.1 with L = 2.7; λ = 0.2
  with L = 2.86; λ = 0.4 with L = 3.05.
- σ comes from the in-control period, estimated as for the individuals chart.

**CUSUM (tabular).** Two running sums, reset at zero:
C⁺_t = max[0, x_t − (μ₀ + K) + C⁺_{t−1}] and C⁻_t = max[0, (μ₀ − K) − x_t + C⁻_{t−1}].
A signal is C⁺ or C⁻ exceeding H. Parameters:
- **K = k·σ**, the reference value, with **k = δ/2** where δ is the shift, in σ units, you
  want to detect fastest; k = 0.5 targets a 1σ shift and is the standard choice.
- **H = h·σ**, the decision interval; **h = 4 or 5**. With k = 0.5, h = 4 gives ARL₀ ≈ 168
  and h = 5 gives ARL₀ ≈ 465.
The chart also tells you *when* the shift began (where the winning sum left zero) and its
rough size (sum ÷ points since then, plus K), which the response plan uses.

**ARL₁ by shift size** (individuals data; standard-table values, rounded; the three charts
sit at slightly different ARL₀, so read the columns as orders of magnitude):

| Shift δ (σ) | Shewhart 3σ (ARL₀ 370) | CUSUM k = 0.5, h = 5 (ARL₀ 465) | EWMA λ = 0.1, L = 2.7 (ARL₀ 500) |
|---|---|---|---|
| 0.5 | 155 | 38 | 31 |
| 1.0 | 44 | 10 | 10 |
| 2.0 | 6.3 | 4.0 | 4.4 |
| 3.0 | 2.0 | 2.6 | 2.9 |

Under about 1.5σ the time-weighted charts are four to five times faster; above 2.5σ the
Shewhart chart is marginally faster. Many control plans run both — Shewhart for the jump,
EWMA or CUSUM for the drift — and the response plan names which signal means what.

**Show (HC, worked example).** Daily median door-to-provider time, control phase, 30 days;
μ₀ = 18.0 min and σ = 2.0 min from the stable post-improvement period. Values are simulated
with a +1.5 min shift (0.75σ) planted from day 11 so the charts can be compared against a
known truth. EWMA: λ = 0.2, L = 2.86 (steady limits 18.0 ± 1.91). CUSUM: k = 0.5
(K = 1.0 min), h = 5 (H = 10.0 min). I chart limits 12.0 / 24.0.

```
Day    x    I-chart   EWMA z   (UCL)    C+     C-
  1  19.7             18.34   19.14    0.7    0.0
  2  19.6             18.59   19.47    1.3    0.0
  3  14.0             17.67   19.64    0.0    3.0
  ...
 10  15.5             17.23   19.90    0.0    1.6
 11  19.1             17.61   19.90    0.1    0.0   <- shift begins (unknown to the chart)
 12  16.1             17.31   19.90    0.0    0.9
 13  19.5             17.74   19.90    0.5    0.0
 14  16.8             17.56   19.90    0.0    0.2
 15  19.7             17.98   19.91    0.7    0.0
 16  22.3             18.85   19.91    4.0    0.0   <- C+ leaves zero for good
 17  22.3             19.54   19.91    7.3    0.0
 18  21.9             20.01*  19.91   10.2*   0.0   <- EWMA and CUSUM both signal
 19  16.0             19.21   19.91    7.2    1.0
 ...
 25  24.1     *       20.32*  19.91   13.8*   0.0   <- first I-chart signal (24.1 > 24.0)
 28  13.4             19.06   19.91   11.3*   3.6
 30  19.4             19.07   19.91   11.4*   0.0
Mean days 1–10: 17.5 min   Mean days 11–30: 19.3 min
```

**Reading it.** The individuals chart signals once, on day 25, on a single high day, and
would send the owner looking for a day-25 special cause. EWMA and CUSUM both signal on
day 18, a week into the drift, and the CUSUM says when it started: C⁺ left zero on day 16
and stayed up. The estimated shift, (10.2 ÷ 3) + 1.0 ≈ 4 min, overstates it — the first
days of a run are noisy — but direction and timing are what the response plan needs. Hand
check of the recurrences on day 16: z = 0.2 × 22.3 + 0.8 × 17.98 = 18.84;
C⁺ = max(0, 22.3 − 19.0 + 0.7) = 4.0.

**The sentence you would tell your sponsor.** "The median has drifted up about a minute and
a half since mid-month; the drift chart caught it in a week where the ordinary chart would
have needed most of a quarter. It coincides with the old triage form reappearing on two
shifts, which the response plan sends the charge nurse to check first."

**Choosing between EWMA and CUSUM.** They perform alike. EWMA is easier to explain to an
owner ("a weighted average of recent days") and tolerates non-normal data better at small
λ; CUSUM gives the change point directly and its parameters state the shift you care about
in words a sponsor can approve ("catch a 1σ shift within about ten days"). Pick one, write
why, and keep the Shewhart chart beside it.

**When not to use a time-weighted chart.** When the shifts that matter are large and sudden
(a tool break, a system outage): Shewhart is faster and simpler. When the data are
autocorrelated (6.1): the EWMA's inertia makes it worse. When the process is not yet
stable: these charts assume an in-control μ₀ and σ. And never tune λ or h after seeing the
data to make a signal appear or disappear; the parameters come from the shift size written
in the control plan, before the data.

---

## 6.4 Short-run SPC: nominal and standardized charts (35 min)

**Hook.** A job shop machines 40 part numbers in lots of 8 to 30. A claims team handles
auto glass, small property and commercial claims with targets of 2, 4 and 9 working hours.
No part number and no claim type produces the 20–25 subgroups a chart of its own needs.

**Teach.** Short-run charts put different products on one chart by removing what differs
between them.
- **Nominal (deviation-from-target) chart.** Plot x − T, where T is the product's target or
  historical center, on an I-MR or X̄-R chart. Valid when the products share a common
  spread: Levene's test on the history does not reject and the largest-to-smallest ratio of
  standard deviations is under about 1.3.
- **Standardized chart.** Plot z = (x − T)/σ_product with limits at ±3. Use it when spreads
  differ. It needs σ per product from at least 20 historical values; with fewer, borrow σ
  from a family of similar products and say so in the control plan.
Either way the point carries its product label, and the response plan is per product
because the countermeasure is.

**Show (TXN, worked example).** Claims cycle time in working hours; targets and σ from a
12-week history (illustrative). Levene's test across the types rejects equal variances
(P = 0.002), so the chart is standardized. Today's three closures:

```
Standardized (Z-MR) chart — claims cycle time, working hours
Type            Target T   sigma   Observed   x - T    z = (x-T)/sigma
Auto glass         2.0     0.6       2.9      +0.9     +1.50
Property < $5k     4.0     1.1       5.1      +1.1     +1.00
Commercial         9.0     2.8       6.2      -2.8     -1.00
Limits on z: +3 / -3.   Chart center 0.   No signal today.
```

On a nominal chart the commercial claim's −2.8 h would be the day's largest excursion;
standardized, it is an ordinary one-σ day for a type whose noise is 2.8 h, and the
auto-glass claim, only 0.9 h off target, is the point furthest from center. The chart now
asks the same question of every type: *how unusual is this, for this type?*

**Show (MFG).** The job shop's bore diameters: 40 part numbers in three material families,
standard deviations within a family within 20% of each other (Levene P = 0.4 in each). A
nominal chart per family — three charts — replaces 40 that could never have enough points,
and the setter reads deviation from drawing in the micrometres they already think in.

**When not to use a short-run chart.** When one product dominates volume: chart it alone
and put the rest on the short-run chart. When T is a drawing nominal the process does not
center on: the nominal chart shows the offset as a permanent bias and the limits from x − T
are wrong — use the historical center as T and record the offset as a capability finding
(M2). And never use the specification tolerance as σ; it is a customer number, not a
process one.

**Try (case dataset, TXN).** From `data/m6-txn-claims-shortrun.csv`, run Levene's test across
the four claim types, build the chart the test tells you to, and find the claim type whose
σ was estimated from too few closures.

---

## Software parity

| Task | Minitab | Excel (or the stats add-in) | R / Python |
|---|---|---|---|
| Stratify streams; test means and variances | Stat > ANOVA > One-Way; Stat > ANOVA > Test for Equal Variances | Data Analysis > ANOVA: Single Factor; Levene by hand on absolute deviations from medians | R `aov()`, `car::leveneTest()`; Python `scipy.stats.f_oneway`, `scipy.stats.levene` |
| Autocorrelation | Stat > Time Series > Autocorrelation | `CORREL()` between the series and itself lagged one row | R `acf()`; Python `statsmodels.tsa.stattools.acf` |
| X̄-R with chosen subgrouping | Stat > Control Charts > Variables Charts for Subgroups > Xbar-R (subgroups by column or size) | Compute X̄, R per subgroup; limits by A2, D3, D4 | R `qcc::qcc(data, type = "xbar")`; Python `pyspc` or a pandas groupby |
| EWMA | Stat > Control Charts > Time-Weighted Charts > EWMA (weight λ, limit L) | Recurrence in a column; limits by the formula | R `qcc::ewma(x, lambda, nsigmas)`; Python `pandas.Series.ewm(alpha = λ)` and the limit formula |
| CUSUM | Time-Weighted Charts > CUSUM (h, k; tabular) | Two `MAX(0, …)` columns | R `qcc::cusum(x, decision.interval = h, se.shift = 2k)`; Python: two running sums |
| g and t charts | Stat > Control Charts > Rare Event Charts > G Chart / T Chart | Hand-built with the transformation; not recommended | R `qicharts2::qic(x, chart = "g")` / `"t"`; Python: hand-built |
| Short-run | Variables Charts for Individuals > Z-MR (options: pooled or by-part σ) | Compute x − T or z in a column, chart as I-MR | R `qcc` on the transformed column; Python: transform in pandas, chart as individuals |

---

## 6.5 Designing the control strategy for your project's metrics (45 min)

**Hook.** Rubric item C1 needs 60 days of live monitoring at submission. The clock starts
when the process owner signs a control plan whose chart, subgroup and response plan you can
defend. You write it this week so the 60 days finish before closure.

**Teach.** For each primary and secondary metric, the strategy answers seven questions in
order, each with its reason recorded:
1. **What question is the chart asked?** Whole-process shift, stream difference, drift,
   rare event. One question per chart.
2. **Which chart?** From 6.1–6.4 and the Green Belt table: data type, subgroups possible or
   not, streams, autocorrelation, event frequency, mixed products, the shift size that
   matters.
3. **What subgroup, and why?** The 6.2 table; what is deliberately inside and outside.
4. **How often?** From two numbers: the shift that costs money or harm, and how long you
   can tolerate it. Time to detect ≈ sampling interval × ARL₁. The filler tolerates about
   half an hour of a 0.8 mL shift; at ARL₁ ≈ 1.2 subgroups, 15-minute sampling meets it.
   The ED tolerates about a week of a 1.5-minute drift; daily EWMA at ARL₁ ≈ 10 does not,
   so the plan charts per shift. Module 7 adds the other anchor: at least once per pitch,
   so a bad release is caught before the next.
5. **Which limits, from which data?** A stable post-improvement period of 20–25 subgroups,
   the phase declared on the chart; never carried over from the baseline, never recomputed
   to make a signal disappear.
6. **What is the response plan?** Per rule: who looks, at what, within how long, and what
   they may adjust without asking. A signal with no named response is a chart on a wall.
7. **Who owns it?** A named process owner who can explain the chart without you (C2), a
   review cadence, and the date the strategy is reviewed.

**Show (HC, the door-to-provider project).** Control strategy excerpt:

| Metric | Question | Chart | Subgroup / frequency | Response | Owner |
|---|---|---|---|---|---|
| Median door-to-provider (min) | Drift after go-live | I chart + EWMA (λ 0.2, L 2.86) | One value per shift; limits from 30 post-go-live days | EWMA signal: charge nurse checks triage form version and rooming staffing within one shift | ED nurse manager |
| Same, by site (14 EDs) | Any site moving | Nominal chart, x − site center, site labelled | Daily per site | Two sites signalling the same week: regional lead calls both | Regional director |
| Left-without-being-seen | Rare event | g chart, visits between events | Per event | Any point below LCL: same-day review | ED medical director |

**Data ethics in Control.** The metric's operational definition is the baseline's; changing
it after go-live is a stop. A signal point is investigated, not removed. If the process
changes deliberately, a new phase is declared and the reason dated.

**The sentence you would tell your sponsor.** "Three charts, one owner each, sampled at a
rate chosen from how fast a real shift would hurt. Any of them signals within about a week
of a shift worth acting on, and each signal has a named response."

**When not to chart.** A once-a-quarter finance figure (track it, do not chart it); a count
so small that a chart flags every non-zero month (g chart, or report the count with a
date); a failure a hard stop (poka-yoke) already prevents, where the chart would only
confirm it.

---

## Live lab — run of show

### Lab 12 (week 12) — Chart at scale, then design the strategy (150 min)

Teams of 3–4, facilitator plus producer above 12 learners; each team has the three case
datasets, a blank control-strategy table, and the cohort's software open.

- **0:00–0:10 Frame and the trap.** Show the filler X̄-R chart from 6.2 — 25 quiet points.
  Poll: "Is this process in control? Yes, no, cannot say." Save the result. Rule of the
  room: every chart today carries, in writing, the question it is being asked.
- **0:10–0:35 Round 1 — triage.** Eight metric cards, one minute each: hourly ED census;
  bottle fill on six heads; days between wrong-site events; job-shop bores across 40 parts;
  weekly claims closed; daily open claims; a monthly finance figure; call-handle time
  drifting after a script change. Teams write chart, subgroup, frequency and the question.
  Checkpoint: the census and open-claims cards must say "autocorrelated" before any chart
  is named. Failure mode: a team charts the finance figure — ask what response a signal
  would trigger.
- **0:35–1:15 Round 2 — the filler.** Teams build the X̄-R chart from `m6-mfg-filler.csv`
  exactly as the plant did, then are told to stratify: reproduce the by-head ANOVA, say in
  words what sits inside R̄, rebuild the chart with a within-head subgroup. Checkpoint: every
  team names subgroup 18 as the first signal on the rebuilt chart. Do not rescue a team that
  argues the original chart proves stability before 1:00; the reveal does it. Facilitator
  move: "what would this chart have to look like for head 4 to show?"
- **1:15–1:45 Round 3 — the race.** The HC series, planted shift undisclosed. Half the
  teams run a Shewhart individuals chart, half an EWMA and a CUSUM with parameters justified
  in one sentence *before* they see the data. Compare signal days on the board. Failure
  mode: a team that tunes λ after seeing the plot — name it as the data-ethics case it is
  and re-run with the pre-declared value.
- **1:45–2:15 Round 4 — your strategy.** Each learner fills the seven-question table for
  their own primary metric; a peer checks that every row carries a reason and a named
  owner. The producer collects the frequency reasoning; any "weekly, because that is when
  we meet" is read aloud, kindly, in the debrief.
- **2:15–2:30 Debrief — protect this block.** Re-run the opening poll. Name the patterns:
  the question before the chart; the subgroup is a design decision; a small drift needs a
  chart with memory; a signal needs a name beside it. If Round 4 overruns, stop it at 2:15
  with tables half filled; the coaching session finishes them, the debrief cannot be.

---

## Project work this week

Keyed to [`../project/review-rubric.md`](../project/review-rubric.md).

- **★ C1 Control plan live ≥ 60 days (10 pts).** The control strategy table for every
  primary and secondary metric, the response plan per rule, and the process owner's signed
  acceptance, dated: the 60-day clock runs from that signature and from live data, so sign
  before Tollgate Improve. Limits from a declared post-improvement phase.
- **C3 Control strategy at scale (5 pts).** The written justification: why this chart and not
  the Green Belt default; the subgroup with what it contains and excludes; the sampling
  frequency reasoned from shift size and tolerable time-to-detect, or from pitch; where an
  EWMA, CUSUM, short-run or rare-event chart was chosen, or considered and rejected, with
  the reason. A reasoned rejection earns the item as fully as adoption.
- **M2 Baseline revisited.** If your baseline chart was subgrouped across streams, re-check
  it with the 6.2 arithmetic; a corrected baseline is dated, never silently replaced.
- **C2 Standard work.** The owner's one-page chart guide, written with them: what the chart
  shows, what each signal means, what they do.
- **Timing.** Strategy drafted before the week-12 coaching session; owner signature before
  Tollgate Improve; the first 20–25 post-improvement subgroups charted before Module 8's
  executive readout rehearsal.

---

## Coaching prompts

Three questions the Master Black Belt asks at the checkpoint:
1. "What question is each chart asked, and what did you deliberately put inside the
   subgroup so the chart cannot see it?"
2. "How long would a shift that costs money run before this chart signals, and where did
   the sampling interval come from?"
3. "Show me the response plan for the last signal, and who acted on it without you."

---

## Vertical case datasets

Three files under `data/`, one per vertical, each matching a worked example so the analysis
can be checked against the text; each carries a planted feature the learner must find.

- **`m6-mfg-filler.csv`** (6.2). Columns: `subgroup`, `timestamp`, `head`, `bottle_seq`,
  `fill_mL`. Planted: head 4 offset of about +1.7 mL throughout; a whole-filler shift of
  +0.8 mL from subgroup 18. The plant's X̄-R chart shows nothing; the by-head ANOVA and the
  within-head chart show both.
- **`m6-hc-door-to-provider.csv`** (6.3 and 6.1). Columns: `date`, `shift`, `phase`,
  `median_dtp_min`, `visits`, `ed_census_hourly_mean`. Planted: a +1.5 min shift in the
  control phase from day 11, visible on EWMA or CUSUM a week before the individuals chart;
  and a census column with lag-1 autocorrelation near 0.8 that alarms repeatedly on I-MR —
  the learner must diagnose it with the ACF, not chart it.
- **`m6-txn-claims-shortrun.csv`** (6.4). Columns: `claim_id`, `close_date`, `claim_type`,
  `target_h`, `cycle_time_h`. Planted: one claim type with σ about 2.5 times the others, so
  Levene's test rejects and a nominal chart mis-ranks its points; and a fourth type with
  only nine closures, whose σ must be borrowed and the borrowing recorded.

---

## Takeaways

- Write the question before you choose the chart; streams, autocorrelation, rare events
  and mixed products each change the answer.
- A subgroup is a design decision: what is inside it, the chart cannot see. Check R̄
  against the within-stream noise, not the quiet chart.
- EWMA (λ, L) and CUSUM (k, h) catch drifts of a σ or less four to five times faster than
  Shewhart; set the parameters from the shift that matters, before the data.
- A control strategy is chart, subgroup, frequency with a reason, limits from a declared
  phase, a named response and a named owner. Signed, it starts the 60-day clock.

---

## Cumulative check (PRAC pool; retests Modules 4 and 5)

**M6-C1.** A binary logistic regression from Module 4 models whether an invoice is paid
late (TXN). Output excerpt:

```
Predictor            Coef    SE Coef      Z      P   Odds ratio   95% CI
Constant           -2.310     0.210   -11.0  0.000
Manual entry (1/0)  0.788     0.190     4.1  0.000     2.20     1.52 – 3.19
Invoice value ($k)  0.012     0.031     0.4  0.700     1.01     0.95 – 1.08
Goodness-of-fit (Hosmer-Lemeshow): P = 0.62      Baseline late rate: 9%
```

The best sentence for the sponsor is:
A. "Manual entry is highly significant (p < 0.001) and invoice value is not" · B. "Manually
entered invoices have about 2.2 times the odds of paying late — roughly 18% late against 9%
for system-entered ones at typical values — and invoice value makes no detectable difference,
so the countermeasure targets entry, not approval thresholds" ✅ · C. "Invoice value should
be dropped and the model refitted before anything is reported" · D. "Manual entry raises the
late rate by 0.788 percentage points"
`[D · B4 · Analyze · TXN · X · PRAC]` — A2 requires the effect size in plain terms and its
practical consequence; A reports p-values alone, and D misreads a log-odds coefficient as a
rate difference.

**M6-C2.** A 2² factorial with two replicates and four center points on a coating line (MFG)
returns effects A = +3.1 µm, B = −1.8 µm, A×B = +0.4 µm, and a curvature term with
ȳ(factorial) − ȳ(center) = +2.6 µm against a pure-error standard deviation of 0.5 µm
(P = 0.000). The specification is met only near the center of the factor ranges. The best
next step is:
A. Report the best corner from the effects and set it as the standard · B. Add more
replicates at the corners to tighten the effect estimates · C. Augment the design with axial
points to fit a second-order model, bringing in Master Black Belt support for the response
surface, before setting any standard ✅ · D. Drop A×B and refit the first-order model
`[E2 · B5 · Apply · MFG · X · PRAC]` — curvature five times the noise means the plane is
wrong where the specification is met, so the corners cannot locate the optimum; more corner
replicates sharpen a model that is already known to be the wrong shape.

---

v1.0 · 2026-09-20
