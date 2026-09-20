# Week 4 — Measure: Stability Before Capability (3 h self-paced + 2.5 h live lab)

**Phase:** Measure · **Objective code:** G4 · **Gate:** **Tollgate 2 — Measure**, scored against
rubric items M1–M4, including mandatory ★ M3.

**Learning objectives.** By the end of this week the learner can:
1. Select the control chart that matches the data type and subgrouping (I-MR, X̄-R, p, np, c, u)
   and state why the alternatives do not fit.
2. Construct an I-MR, an X̄-R and a p chart from raw data — center line and control limits with
   the arithmetic shown — and read them with a stated rule set.
3. State whether a process is stable, and what was investigated, before any capability figure
   is quoted.
4. Compute and interpret Cp, Cpk, Pp and Ppk with the specification source named, and explain
   in plain language what the gap between each pair means.
5. Compute DPMO and a sigma level, state the 1.5-shift convention explicitly, and choose which
   figure to report to a sponsor.

Rubric items in play: **M1–M4** in [`../project/review-rubric.md`](../project/review-rubric.md).
Tollgate 2 is this week's live lab close; the one page you bring is the deliverable.

---

## 4.1 Stability first: which chart, and why the order matters (25 min)

**Hook.** A capability index computed on an unstable process is a description of the past
that predicts nothing. Cpk assumes tomorrow looks like today. The control chart is how you
check that assumption, which is why the rubric words M4 as *stability before capability* and
not the other way around.

**Teach.** Two vocabularies you already have, now used precisely:
- **Control limits** come from the process — about three standard deviations of *common-cause*
  variation either side of the center line, computed from the data. **Specification limits**
  come from the customer (week 1's CTQ). A chart with spec lines drawn on it is a chart that
  will be misread.
- **Common cause**: the variation the process produces every day by design. **Special cause**:
  a signal that something changed. A stable process shows only common cause; it is
  predictable, which is not the same as acceptable.

Chart selection is two questions — what kind of data, and how is it grouped:

| Data | Grouping | Chart | Counts what |
|---|---|---|---|
| Continuous (minutes, mm, dollars) | One value per period or event | **I-MR** (individuals and moving range) | The value and its point-to-point change |
| Continuous | Rational subgroups of 2–9 taken close together | **X̄-R** | Subgroup mean and range |
| Attribute: units classified pass/fail | Subgroup size varies | **p** | Proportion defective |
| Attribute: units classified pass/fail | Subgroup size constant | **np** | Number defective |
| Attribute: defects counted per unit or area | Area of opportunity constant | **c** | Count of defects |
| Attribute: defects counted | Area of opportunity varies | **u** | Defects per unit |

The classification question is "how many invoices had *any* error" (p/np); the count question
is "how many errors across all invoices" (c/u). Ask which one your CTQ is about.

**Show (HC).** Daily median door-to-provider time, one value per day: I-MR. Percentage of
discharges before noon, with a different number of discharges each day: p chart. Medication
errors per 1,000 patient-days, with patient-days varying by month: u chart.

**Try.** Write your primary metric and its data type in one line. Choose the chart, then write
one sentence on why the nearest alternative is wrong. Bring it to the lab's selection sprint.

---

## 4.2 I-MR: the chart most Green Belt projects use (35 min)

**Hook.** Most primary metrics arrive one value at a time — a day's median, a week's cycle
time, a batch's yield. The individuals chart is built for that.

**Teach.** Two panels. The **I chart** plots each value; the **MR chart** plots the absolute
difference between consecutive values (moving range, span 2). The MR chart estimates
common-cause spread; read it first, because the I chart's limits are computed from it.

Center and limits:
- I chart: center = X̄ (mean of the values); UCL/LCL = X̄ ± 2.66 × MR̄.
- MR chart: center = MR̄; UCL = 3.267 × MR̄; no lower limit for span 2.
- The 2.66 is 3 ÷ d2 with d2 = 1.128 for a moving range of two; σ_within = MR̄ ÷ 1.128.

**Worked arithmetic (HC, illustrative).** Daily median door-to-provider time, 40 weekdays.
X̄ = 24.6 min, MR̄ = 3.9 min (calendar minutes, weekdays only).
UCL = 24.6 + 2.66 × 3.9 = 24.6 + 10.37 = **35.0 min**; LCL = 24.6 − 10.37 = **14.2 min**;
MR UCL = 3.267 × 3.9 = **12.7 min**. Day 23's value is 41 minutes: beyond UCL, a special
cause. The MR for day 23 (16.8) is also beyond its limit. The chart has done its job; the
work now is to find out what happened on day 23, not to compute anything else.

**Reading the chart: pick a rule set and state it.** Every software package offers the
Western Electric and Nelson rule families and enables different subsets by default. At Green
Belt, use four rules and name them on the chart:
1. One point beyond a control limit.
2. Nine consecutive points on one side of the center line (a shift).
3. Six consecutive points steadily rising or falling (a trend).
4. Two of three consecutive points beyond two standard deviations on the same side.

A signal means *investigate*, not *delete*. If you find the cause (day 23 was the registration
system outage, documented in the IT log), say so on the chart, and either recompute the limits
without that day *and say you did* or leave it in with the annotation. If you cannot find a
cause, it stays. Removing a point because it spoils the picture is the data-ethics stop in the
rubric.

**Two conditions.** Values must be independent (a value should not be mostly determined by the
one before it — a daily running total fails this) and reasonably symmetric. Strongly skewed
data such as raw waiting times give an I chart that flags every long wait; chart the daily
median or a subgroup mean instead, or use a transformation with your coach's agreement.

**When NOT to use I-MR.** When you can form rational subgroups (use X̄-R — it detects shifts
sooner); when the data are counts or classifications (attribute charts); when the values are
autocorrelated (a Black Belt problem — bring it to your coach rather than charting through it).

**Software parity.** *Minitab:* Stat > Control Charts > Variables Charts for Individuals > I-MR;
enable the four tests under Options > Tests. *Excel:* a column of moving ranges, `AVERAGE` for
the centers, the two formulas above for limits, a line chart with three constant series; the
toolkit's `capability-worksheet.md` walks through it. *R:* `qcc::qcc(x, type = "xbar.one")` and
`type = "R"` on the moving ranges. *Python:* compute MR with `pandas.Series.diff().abs()`, the
limits by formula, and plot with `matplotlib` — there is no standard SPC package, so the
toolkit notebook does it explicitly.

**Try.** Build the I-MR for the 40-day HC series in your software; confirm the limits above;
list every rule violation with the rule number.

---

## 4.3 X̄-R: when you can take rational subgroups (25 min)

**Hook.** Four shafts measured every hour tell you more than one shaft every 15 minutes, because
the four together separate *within-hour* spread from *hour-to-hour* movement.

**Teach.** A **rational subgroup** is a small sample taken under conditions as alike as
possible — consecutive parts, one shift, one machine — so that within-subgroup variation is
common cause only. Between-subgroup movement is then what the chart tests. Subgroup badly (one
part from each of four machines) and the chart tests the wrong thing.

Center and limits, subgroup size n, constants from the standard table (n = 4: A2 = 0.729,
D3 = 0, D4 = 2.282, d2 = 2.059):
- X̄ chart: center = X̿; UCL/LCL = X̿ ± A2 × R̄.
- R chart: center = R̄; UCL = D4 × R̄; LCL = D3 × R̄ (zero for n ≤ 6).
- σ_within = R̄ ÷ d2.

**Worked arithmetic (MFG, illustrative).** Shaft diameter, 25 hourly subgroups of 4, one
shift. X̿ = 25.012 mm, R̄ = 0.032 mm.
X̄ chart: UCL = 25.012 + 0.729 × 0.032 = 25.012 + 0.0233 = **25.035**;
LCL = 25.012 − 0.0233 = **24.989**. R chart: UCL = 2.282 × 0.032 = **0.073**; LCL = 0.
Read the R chart first: if ranges are stable, the σ_within estimate is trustworthy and the
X̄ limits mean what they say. All 25 subgroups inside both sets of limits with no rule
violations → stable; this is the data that feeds 4.5.

**When NOT to use X̄-R.** Subgroups larger than about 9 (use X̄-S, which uses the standard
deviation; it is one menu option away and reads the same); subgroups that mix conditions;
when only one value per period exists (I-MR).

**Software parity.** *Minitab:* Stat > Control Charts > Variables Charts for Subgroups > Xbar-R,
data in one column with a subgroup column or across columns. *Excel:* subgroup means and ranges
by `AVERAGE`/`MAX−MIN`, limits by the formulas, two line charts. *R:* `qcc::qcc(matrix, type =
"xbar")` and `type = "R"`. *Python:* group with `pandas.groupby`, formulas as above.

---

## 4.4 Attribute charts: p, np, c, u (30 min)

**Hook.** "Percent complete and accurate", "discharges before noon", "orders shipped on time" —
your week 2 %C&A is a proportion, and a proportion gets a p chart.

**Teach.** The limits for a p chart move with the subgroup size, because a proportion from 200
invoices is more precise than one from 120:

> UCL, LCL = p̄ ± 3 × √[p̄ (1 − p̄) ÷ nᵢ]

where p̄ is total defective ÷ total inspected across all subgroups, and nᵢ is that subgroup's
size. Stepped limits are correct, not a chart error. An **np chart** is the same test with
constant n, plotting the count: center = n p̄, limits n p̄ ± 3 √[n p̄ (1 − p̄)]. A **c chart**
plots defect counts with a constant area of opportunity: center c̄, limits c̄ ± 3 √c̄. A
**u chart** plots defects per unit with a varying area: center ū, limits ū ± 3 √(ū ÷ nᵢ).
A negative lower limit is set to zero.

**Worked arithmetic (TXN, illustrative).** Invoices sampled at receipt, four weeks, one
subgroup per working day. Across 20 days, 2,940 invoices inspected, 288 incomplete:
p̄ = 288 ÷ 2,940 = **0.098**. For a day with nᵢ = 150:
√[0.098 × 0.902 ÷ 150] = √0.000589 = 0.0243; UCL = 0.098 + 3 × 0.0243 = **0.171**;
LCL = 0.098 − 0.0728 = **0.025**. For a day with nᵢ = 200 the same arithmetic gives 0.161 and
0.035 — narrower, as it should be. Day 12 shows 0.19 on nᵢ = 150: a signal. The change log
shows the supplier master file was migrated on day 11; the "incomplete" field was the
purchase-order number, which the migration blanked for one supplier group. That is a special
cause with a documented origin, and the team's countermeasure conversation with IT starts
before Analyze does.

**Reading attribute charts.** The same four rules apply. Two additional cautions: with
n p̄ < 5 the limits are unreliable — subgroup more (week 3's rule); and when subgroups are very
large (thousands), the p chart flags almost every point because day-to-day variation exceeds
the binomial assumption. That over-dispersion has a fix (the Laney p′ chart), which is Black
Belt scope; at Green Belt, recognize the pattern — every point outside, nothing to find — and
ask your coach.

**When NOT to use attribute charts.** When the underlying measurement is continuous ("late" =
days over the promise): chart the days on an I-MR, which sees drift long before the
proportion late moves. When the "defect" has no operational definition that passed week 3's
attribute agreement — the chart would be charting the appraisers.

**Software parity.** *Minitab:* Stat > Control Charts > Attributes Charts > P / NP / C / U, with
the subgroup-size column. *Excel:* a column of nᵢ, the p̄ formula, per-row limits, and a
line chart. *R:* `qcc::qcc(defectives, sizes = n, type = "p")`; `type = "np"`, `"c"`, `"u"`.
*Python:* formulas in `pandas`, plotted with `matplotlib`.

**Try.** Chart your own %C&A data (or the TXN case) as a p chart with stepped limits. Then
chart the same data as an np chart using the average n and note what the constant limits hide.

---

## 4.5 Capability: Cp, Cpk, Pp, Ppk (35 min)

**Hook.** The sponsor will ask "what's our Cpk?" this week. The answer has three preconditions
and two numbers, and the honest version names all five.

**Teach.** Capability compares the process spread to the specification width.

- **Cp** = (USL − LSL) ÷ 6 σ_within — the spread the process *could* fit if centered.
- **Cpk** = min[(USL − X̿) ÷ 3 σ_within, (X̿ − LSL) ÷ 3 σ_within] — the same, penalized for
  being off-center. Cp − Cpk is the price of centering.
- **Pp** and **Ppk** — identical formulas with σ_overall, the ordinary sample standard deviation
  of all the data. Cpk − Ppk is the price of instability and drift between subgroups.

Software labels the σ_within pair "within" or "potential" and the σ_overall pair "overall".
Report both, and name the specification's source (the CTQ, the contract, the clinical
standard) on the page — rubric M4 requires it.

**Preconditions.** Stable on the chart (4.2–4.4), measurement system acceptable (week 3), and
data reasonably normal — look at the histogram; a long tail or two humps means the indices
will mislead. For one-sided specs report only the side that exists (Cpu or Cpl). If the data are
clearly non-normal, report the observed and expected out-of-spec fractions and the DPMO of 4.6
instead of an index, and tell your coach — non-normal capability is Black Belt material.

**Worked arithmetic (MFG, illustrative).** The 25 stable subgroups of 4 from 4.3.
Specification from the customer drawing: 25.00 ± 0.05 mm, so LSL = 24.95, USL = 25.05, width
0.10. X̿ = 25.012, R̄ = 0.032; the overall standard deviation of all 100 values is 0.0181.

1. σ_within = R̄ ÷ d2 = 0.032 ÷ 2.059 = **0.01554**.
2. Cp = 0.10 ÷ (6 × 0.01554) = 0.10 ÷ 0.0932 = **1.07**.
3. Cpu = (25.05 − 25.012) ÷ (3 × 0.01554) = 0.038 ÷ 0.0466 = **0.82**;
   Cpl = (25.012 − 24.95) ÷ 0.0466 = 0.062 ÷ 0.0466 = **1.33**; Cpk = min = **0.82**.
4. Pp = 0.10 ÷ (6 × 0.0181) = **0.92**; Ppu = 0.038 ÷ (3 × 0.0181) = **0.70**; Ppk = **0.70**.

**Reading it.** Cp 1.07 says the spread would just about fit if centered. Cpk 0.82 says the
process sits 0.012 mm high and is producing oversize shafts now. Ppk 0.70 below Cpk 0.82 says
the hour-to-hour movement, even inside the limits, costs a further tenth or so. The gap to
Cp is the first thing to fix — centering is usually cheaper than reducing spread — and that
is a week 5 question, not a week 4 conclusion.

**The sentence you would tell your sponsor.** *"The shaft process is stable and runs about
0.012 mm high against a ±0.05 mm drawing tolerance; Cpk is 0.82, so about 1.8% of shafts are
oversize on current performance. Centering alone would take it above 1.0; reducing spread is
what gets to 1.33."*

**When NOT to compute capability.** On an unstable chart (state "not yet stable; capability
withheld" — that sentence earns M4 credit; a Cpk on unstable data loses it). Without a
specification (no CTQ target with a source → no index; report the baseline chart and DPMO
against the target once one exists). On data from a failed measurement system.

**Software parity.** *Minitab:* Stat > Quality Tools > Capability Analysis > Normal; enter the
subgroup size or column and both specs; the report shows within and overall. *Excel:* the
capability worksheet — `STDEV.S` for σ_overall, R̄ ÷ d2 for σ_within, the four formulas.
*R:* `qcc::process.capability(qcc_object, spec.limits = c(LSL, USL))`. *Python:* the formulas
in a few lines, with `scipy.stats.norm.sf` for the expected fractions in 4.6.

---

## 4.6 DPMO and sigma level — with the 1.5-shift convention stated honestly (20 min)

**Hook.** Sigma level is the number that made Six Sigma famous and the one most often quoted
without its basis. You will quote it with its basis or not at all.

**Teach.** Two ways to get a **DPMO** (defects per million opportunities):

- **From counts.** DPMO = defects ÷ (units × opportunities per unit) × 1,000,000. The TXN
  baseline: 3,120 invoices, 306 with at least one error, 369 errors in total across four
  checked fields. Per-unit basis: 306 ÷ 3,120 = 0.098 → **98,077 defective units per million**.
  Per-opportunity basis: 369 ÷ (3,120 × 4) = 0.0296 → **29,567 DPMO**. Same process, two
  numbers that differ by a factor of three. Counting opportunities generously makes any process
  look better; state the basis, and prefer the per-unit figure when the customer experiences
  the unit.
- **From capability.** For the shaft data, z_upper = (25.05 − 25.012) ÷ 0.0181 = 2.10 and
  z_lower = 3.43; the normal tail areas are 0.0179 and 0.0003, total 0.0182 → **18,196 DPMO**
  expected overall (the "1.8%" in 4.5's sponsor sentence).

**Sigma level.** Z_bench is the z-value whose one-sided tail equals the total defect fraction:
for 18,196 DPMO, Z_bench = **2.09**. Motorola's convention adds **1.5** to a long-term Z to report
a "short-term sigma level", on the argument that processes drift by about that much over time.
Under that convention this process is "3.6 sigma", and 3.4 DPMO is "6 sigma". The 1.5 is a
convention, not a measurement of your process. This program's rule: report DPMO and Z_bench;
if you quote a sigma level, write "sigma level 3.6 (1.5-shift convention)" and never the bare
number. Reference points, both bases:

| DPMO | Z_bench (no shift) | Sigma level (1.5-shift convention) |
|---|---|---|
| 308,538 | 0.5 | 2.0 |
| 66,807 | 1.5 | 3.0 |
| 6,210 | 2.5 | 4.0 |
| 233 | 3.5 | 5.0 |
| 3.4 | 4.5 | 6.0 |

**When NOT to quote a sigma level.** When opportunities were chosen to flatter; when the
process is unstable (the DPMO is a history, not a rate); when a sponsor will compare it to
another project's figure computed on a different basis. Between two projects, compare DPMO
on a stated per-unit basis.

**Software parity.** *Minitab:* the capability report prints PPM (within and overall) and, with
Capability Sixpack or the benchmark option, Z.Bench; Stat > Quality Tools > Capability
Analysis > Binomial for defective counts. *Excel:* `=NORM.S.DIST(z, TRUE)` for tail areas,
`=NORM.S.INV(1 − DPMO/1e6)` for Z_bench. *R / Python:* `pnorm`/`qnorm`;
`scipy.stats.norm.sf`/`.isf`.

---

## 4.7 Tollgate 2: the one page (10 min)

Ten minutes, one page, sponsor in the room, keyed to M1–M4:

| Item | On the page | Reviewer reads for |
|---|---|---|
| M1 | Current-state map or VSM as observed; lead time, %C&A, PCE with basis | Observed, not documented; basis stated |
| M2 | Data collection plan; the operational definition verbatim | Stranger test passed |
| ★ M3 | MSA study type, result (%GRR and ndc, or kappa), verdict, what was done | Acted on, not appended |
| M4 | Baseline chart with rule set named; stability statement; Cp/Cpk or DPMO with spec source, *or* "capability withheld — unstable, investigating X" | Stability stated before capability |

The sponsor question you rehearse for: *"So are we capable or not?"* Your answer names the
stability finding first and the number second.

---

## Live lab — run of show: "is it stable? then is it capable?" (150 min)

**Setup for the facilitator.** Each learner has the week 4 case dataset loaded before 0:05;
teams of 4–5 by vertical. Every vertical's baseline is unstable in a different way and every
dataset comes with a specification or target, so a Cpk *can* be computed — the lab is about
whether it *should* be. Do not say "unstable" before 1:40.

### 0:00–0:10 — Setup and the trap
- Poll: *"Your sponsor asks for the Cpk today. Do you have one? Yes / No / Depends."* Save it.
- Frame: *"The number is easy. The sentence in front of it is the lab."*

### 0:10–0:30 — Chart selection sprint
- Eight metric descriptions on screen (two per data type, two deliberately ambiguous: a
  proportion whose numerator is really a continuous lateness; a count with a varying area of
  opportunity described as constant). Teams choose a chart for each and one reason.
- Facilitator takes the two ambiguous ones with the room: the discriminating question is
  always "what is the CTQ *about*?"

### 0:30–1:00 — Build the baseline chart
- Teams build the appropriate chart for their case data with the four rules enabled and named,
  list every violation with its rule number, and write one checkable "what changed, and when"
  hypothesis per violation using the case's change log and context columns.
- **Facilitator floats with one job:** stop anyone deleting points. *"You may annotate. You
  may recompute with the point excluded if you write why on the chart. You may not make it
  disappear."*

### 1:00–1:20 — The sponsor wants a number
- In character: *"I have the steering committee at four. What's the Cpk?"* Teams choose: (a)
  compute on all the data and label it; (b) compute on the stable segment and say so; (c)
  withhold and state why. Each choice is defensible in some case and wrong in others; teams
  must match theirs to their chart.
- Each team writes the sponsor sentence. Read aloud; the room asks the one follow-up a sponsor
  would ask.

### 1:20–1:40 — Capability and DPMO
- Teams compute Cp, Cpk, Pp, Ppk (or DPMO for the attribute case), by hand for one index and
  by software for the rest, and reconcile. They write the sigma level with the convention
  stated, and the DPMO on the basis the customer experiences.
- Facilitator checks two things on every sheet: the specification source is written, and
  Cpk versus Ppk is interpreted in words.

### 1:40–2:05 — Debrief: the number that was true and useless
- Reveal each vertical's plant. Teams compare their stability verdict, their chosen option
  in 1:00–1:20, and the reveal. Re-run the opening poll.
- Say plainly: *"A Cpk of 0.82 on the whole MFG series was arithmetically correct and told the
  sponsor nothing, because after subgroup 18 the process was a different process. The stable
  segment's Cpk was the honest number, and the tool change was the finding."*
- Name the transferable patterns: read the range chart first; stepped p-chart limits are
  correct; a skewed I chart flags common cause as special; every sigma level needs its
  convention on the same line.
- **Protect the debrief.** If 0:30–1:00 overruns, shorten 1:20–1:40 to the hand calculation of
  Cpk only and give the rest from the pre-computed sheet. Never compress the debrief or the
  rehearsal.

### 2:05–2:30 — Tollgate 2 rehearsal
- Triads. Each learner presents their own one page in three minutes: M1–M4 in order, MSA verdict
  stated before the chart, stability stated before capability. The two listeners score against
  the rubric wording and ask the sponsor question. Rotate.
- Close: the tollgate itself runs in the coaching slot this week; the one page is submitted
  24 hours before.

### Facilitator notes and failure modes
- **A team computes Cpk on the unstable series and reports 0.82 confidently:** let them present
  it in the debrief and ask the room what the number predicts about next week. The room will
  get there; you do not need to.
- **A team wants to remove the HC outliers "because they were a system outage":** correct
  instinct, wrong move. The outage is documented, so the exclusion is legitimate *if written on
  the chart*; the lesson is the annotation, not the deletion.
- **Someone reports "4.6 sigma" with no convention:** ask which table they used and have them
  write both figures. This happens every cohort.
- **A team whose metric has no specification asks how to compute Cpk:** they cannot, and saying
  so on the one page with a DPMO against the target is full M4 credit. Say this to the whole
  room.
- **The HC team's I chart shows a dozen violations:** the raw waiting times are skewed. Ask what
  the daily median chart looks like; that is the planted lesson for HC.
- **Virtual logistics:** breakout rooms per team; the producer displays the sponsor's 4 pm
  deadline during 1:00–1:20 and holds the pre-computed answer sheets until 1:40.

---

## Project work this week — Tollgate 2

Keyed to the [review rubric](../project/review-rubric.md).

- **M1 — Process map / VSM:** the current-state map from week 2, as observed, with lead time,
  %C&A and PCE and their basis on the one page.
- **M2 — Data collection plan and operational definitions:** final; the definition that passed
  the stranger test, and the stratification factors your baseline can be sliced by.
- **★ M3 — MSA result interpreted:** %GRR, %tolerance and ndc, or kappa and % agreement versus
  standard, with the verdict and what was done if it failed. If the metric is a system field:
  the timestamp validation result (mean and spread of the difference on ≥ 30 events) and the
  written reason a Gage R&R is not applicable. This item is pass/fail regardless of total.
- **M4 — Baseline chart and capability:** the right chart for the data type; the rule set
  named; stability stated; special causes investigated and annotated, none silently removed;
  Cp/Cpk or DPMO/sigma with the specification source named — or capability withheld with the
  reason. A baseline from a failed, unfixed MSA is not a baseline.
- **Data ethics, stated on the page:** the operational definition used for the baseline is the
  one that will be used after the change, in writing, now.

## Coaching prompts

1. *"Show me your chart. Which rule set is on, which points fired, and what did you go and find
   for each one?"*
2. *"You quoted a Cpk of 1.1. Read me the specification source, then tell me what the gap
   between your Cpk and your Ppk says about the process between subgroups."*
3. *"If your sponsor hears 'sigma level 3.6', what will they compare it to, and is that
   comparison on the same basis?"*

## The week's vertical case dataset

One file per vertical, continuing the week 3 cases. Columns are common where possible:
`period`, `subgroup_id`, `value` (or `n_inspected`, `n_defective`), `shift`, plus the case's
`change_log` sheet with dated events. The specification or target and its source are in the
header. Plants are in the facilitator key.

- **MFG — shaft diameter (mm), 25 hourly subgroups of 4, spec 25.00 ± 0.05 from the customer
  drawing.** *Planted:* subgroups 1–17 stable at X̿ ≈ 25.012; a tool change at subgroup 18
  (in the change log) shifts the mean to ≈ 25.030 — rule 2 fires on the X̄ chart, the R chart
  stays quiet. Whole-series Cpk ≈ 0.82 and Ppk ≈ 0.70 are arithmetically right and predict
  nothing; the stable segment's Cpk (≈ 0.95) with "tool change under investigation" is the
  honest one page.
- **HC — door-to-provider (calendar minutes), 40 weekdays, target ≤ 30 from the department's
  service standard.** Two columns: every visit's raw value and the daily median. *Planted:* the
  raw series is right-skewed and an I chart on it fires rule 1 a dozen times — all common cause;
  the daily-median chart shows exactly one signal, day 23, a documented registration-system
  outage. A second, quieter plant: the two shifts have different medians, visible only when the
  `shift` column is used. Capability is one-sided (Cpu against 30), and the honest page reports
  the expected fraction over 30 minutes from the median chart's stable days.
- **TXN — invoices incomplete on receipt, 20 working days, nᵢ from 118 to 214, target ≤ 3%
  from the AP service-level agreement.** *Planted:* p̄ ≈ 0.098 with stepped limits; day 12 beyond
  the UCL after the supplier-master migration on day 11, traceable to the purchase-order field
  in the `reason_code` column; teams that chart with a constant average n miss that day 5's
  0.155 on nᵢ = 118 is inside its own limit. DPMO on the per-unit basis (≈ 98,000) versus the
  per-opportunity basis (≈ 29,600) is the second lesson.

Cases and keys live in `../practicum/` (`case-mfg.md`, `case-hc.md`, `case-txn.md`).

## Takeaways

- Stability is a statement about the chart with a named rule set; capability is a statement
  about the spec; make the first before the second, every time.
- Read the R (or MR) chart first; stepped p-chart limits are right; skewed raw data want a
  median or a subgroup mean.
- Cp − Cpk is centering; Cpk − Ppk is drift; both numbers, both named with the spec source.
- DPMO with its basis; Z_bench; a sigma level only with "(1.5-shift convention)" on the same line.

## Cumulative check (weeks 1–2)

**W4-C1.** A pharmacy's internal customer (the ward) says: "We need meds to arrive fast enough
that first doses aren't late." The team writes the CTQ as "pharmacy turnaround ≤ 60 minutes
from order verification to delivery, calendar minutes, per the ward's first-dose policy."
Which element makes this a usable CTQ rather than a restated wish?
A. A measurable characteristic with a target and a named specification source ✅ · B. The
word "fast" replaced with a number · C. The ward being named as the customer · D. The choice
of calendar minutes over working minutes
`[A · G1 · Analyze · HC · S · PRAC]` — rubric D3 needs all three: characteristic, target,
specification basis; B is necessary but alone gives a number with no source.

**W4-C2.** For a value stream map of order entry, the team records for each order whether it
was complete and accurate on arrival (yes/no) and the minutes it waited before entry. The
data types are, in order:
A. Both continuous · B. Both attribute · C. Continuous, then attribute · D. Attribute, then
continuous ✅
`[B1 · G2 · Apply · TXN · S · PRAC]` — a yes/no classification is attribute data (it feeds
%C&A and a p chart); minutes are continuous (an I-MR chart); C reverses them.

---

v1.0 · 2026-09-20
