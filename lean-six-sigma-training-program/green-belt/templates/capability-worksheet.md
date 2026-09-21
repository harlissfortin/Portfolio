# Capability Worksheet — Stability First, Then Cp/Cpk/Pp/Ppk, DPMO and Sigma Level

*Green Belt toolkit · used in week 4 (the "is it stable? then is it capable?" lab), at
Tollgate 2 for rubric item M4, and again at closure to state the after-capability on the new
stable stage (★ I3). The arithmetic is shown so you can check the software; the software steps
are in [`software-parity.md`](software-parity.md). Fillable versions ship as a spreadsheet tab
that reads the baseline chart's data.*

## Purpose

A capability index answers one question: *if the process keeps doing what it is doing, how
much of its output will meet the specification?* The "if" is the whole worksheet. An index
computed on an unstable process describes a mixture of past processes and predicts nothing;
an index computed against a control limit instead of a specification limit is a number with
no customer in it. Rubric M4 is worded *stability before capability* for those reasons, and it
gives full credit for "capability withheld — not stable, investigating X" and no credit for a
Cpk on an unstable chart.

The worksheet runs in order. You do not skip to Part C.

| Part | Output | Rubric |
|---|---|---|
| A — Stability check | A one-sentence stability statement with the rule set named and every signal accounted for | M4 |
| B — Preconditions | MSA verdict, specification source, data shape, sample size | M3, D3, M4 |
| C — Arithmetic | σ_within, σ_overall, Cp/Cpk, Pp/Ppk, expected fraction out of spec, DPMO, Z_bench, sigma level with its convention | M4 |
| D — The sentence | What you tell the sponsor, stability first, number second | M4, S1 |

---

## Part A — The stability check (a written statement, made first)

**Metric:** ____________ **Operational definition (ref.):** ____________ **Data type:** ☐ continuous
☐ defectives (pass/fail) ☐ defects (count) **Basis:** ☐ per unit ☐ per day ☐ per shift ·
☐ calendar time ☐ working time
**Chart:** ☐ I-MR ☐ X̄-R (n = __) ☐ p ☐ np ☐ c ☐ u **Why not the nearest alternative:** ____________
**Points / subgroups:** ____ (I-MR ≥ 25–30 points; X̄-R ≥ 20–25 subgroups; attribute charts:
n p̄ ≥ 5 per subgroup) **Window:** ____ to ____, covering ☐ all shifts ☐ weekdays and weekends
☐ month-end or peak ☐ the product / case / form mix

**Rule set on the chart (name it on the chart itself):** 1 — one point beyond a control limit;
2 — nine consecutive points on one side of the center line; 3 — six consecutive points rising
or falling; 4 — two of three consecutive points beyond two standard deviations on the same side.

| Signal (point or subgroup) | Rule | What you went and found | Action | Written on the chart? |
|---|---|---|---|---|
| | | | ☐ annotated, kept ☐ excluded with the documented reason ☐ cause not found, kept | ☐ |
| | | | ☐ annotated, kept ☐ excluded with the documented reason ☐ cause not found, kept | ☐ |

**Stability statement — choose one and complete it verbatim:**

- ☐ *"The [chart] of [metric] over [window] shows no violation of rules 1–4 across [n] points;
  the process is stable and the capability below describes it."*
- ☐ *"The [chart] shows [k] signals. [Point] was [cause, documented where]; it is excluded from
  the limits and shown on the chart. The remaining [n] points are stable and the capability
  below describes that segment from [date] to [date]."*
- ☐ *"The [chart] shows [k] signals not yet explained. **Capability is withheld.** We are
  investigating [what], by [when]. The observed fraction outside the target over the window
  was [x]%, reported as history, not as a rate."*

A point is never removed because it spoils the picture. If the cause is not found, the point
stays and the statement says so. A stability statement that hides a signal is the data-ethics
stop in the rubric.

---

## Part B — Preconditions (all four before Part C)

| Precondition | Evidence | Status |
|---|---|---|
| Measurement system acceptable, or marginal with a written plan ([`msa-plan.md`](msa-plan.md)) | %GRR __% of tolerance, ndc __ · or kappa __ · or timestamp audit: __% within ± __ | ☐ met ☐ marginal (caveat written on the chart) ☐ failed → no capability on this metric |
| Specification with its **source** — the customer's limit, never the control limit | LSL ____ USL ____ (or target ____ for attribute data) · source: ☐ customer drawing/contract ☐ clinical or service standard ☐ SLA ☐ internal CTQ agreed with the customer, dated ____ | ☐ two-sided ☐ one-sided upper ☐ one-sided lower ☐ none → no index; DPMO against the target once one exists |
| Data shape | Histogram: ☐ one hump, roughly symmetric ☐ long tail ☐ two humps ☐ wall at a limit | ☐ indices meaningful ☐ report observed fraction and DPMO instead (say why) |
| Enough data, over the conditions the process runs in | ____ individuals / ____ subgroups of ____, window covers the conditions ticked in Part A | ☐ met ☐ short — interval on the index will be wide; say so |

Two humps or a wall mean the histogram is asking a question (a hidden stratifier; inspection
removing points) that you answer before any index. A long tail on time data (waits,
turnarounds) is the normal case in healthcare and services: for those, Part C3 reports the
observed fraction outside the limit and the DPMO, and the index is shown only with its caveat
or not at all. Transformations and non-normal capability are Black Belt; tell your coach.

---

## Part C — The arithmetic

### C1 · Two estimates of the standard deviation

| Estimate | From | Formula | Used for |
|---|---|---|---|
| **σ_within** ("within", "potential") | The chart's range or moving range — common-cause spread only | X̄-R: σ_within = R̄ ÷ d2 · I-MR: σ_within = MR̄ ÷ 1.128 | Cp, Cpk, expected PPM (within) |
| **σ_overall** ("overall", "performance") | All the data, ordinary sample standard deviation (n − 1) | `STDEV.S` of every value | Pp, Ppk, expected PPM (overall), Z_bench |

Control chart constants (subgroup size n):

| n | d2 | A2 | D3 | D4 |
|---|---|---|---|---|
| 2 | 1.128 | 1.880 | 0 | 3.267 |
| 3 | 1.693 | 1.023 | 0 | 2.574 |
| 4 | 2.059 | 0.729 | 0 | 2.282 |
| 5 | 2.326 | 0.577 | 0 | 2.114 |
| 6 | 2.534 | 0.483 | 0 | 2.004 |
| 7 | 2.704 | 0.419 | 0.076 | 1.924 |
| 8 | 2.847 | 0.373 | 0.136 | 1.864 |
| 9 | 2.970 | 0.337 | 0.184 | 1.816 |

Software may estimate σ_within by the pooled standard deviation instead of R̄ ÷ d2; the
result differs in the second decimal. Say which you used
([`software-parity.md`](software-parity.md), note 2).

### C2 · The four indices

| Index | Formula | Reads as |
|---|---|---|
| Cp | (USL − LSL) ÷ (6 σ_within) | The spread the process *could* fit if it were centered |
| Cpk | min [ (USL − X̿) ÷ (3 σ_within) , (X̿ − LSL) ÷ (3 σ_within) ] | The same, penalized for being off-center. **Cp − Cpk is the price of centering** |
| Pp | (USL − LSL) ÷ (6 σ_overall) | Cp with all the variation counted |
| Ppk | min [ (USL − X̿) ÷ (3 σ_overall) , (X̿ − LSL) ÷ (3 σ_overall) ] | Cpk with all the variation counted. **Cpk − Ppk is the price of drift between subgroups** |

One-sided specification: report only the side that exists — Cpu = (USL − X̿) ÷ 3σ or
Cpl = (X̿ − LSL) ÷ 3σ — and its P-equivalent. There is no Cp for a one-sided spec.

Reference points, with the caveat that they assume a stable, roughly normal process: 1.00 means
the ±3σ spread just fits (about 0.27% out, both sides); 1.33 is the common customer minimum
(about 64 PPM); 1.67 is the usual "new process" target (about 0.6 PPM). Below 1.00 the process
is producing out-of-spec output now.

### C3 · Expected fraction out of specification

z_upper = (USL − X̿) ÷ σ · z_lower = (X̿ − LSL) ÷ σ · fraction out = P(Z > z_upper) + P(Z > z_lower)

Compute it twice, once with σ_within ("within" or "potential" PPM) and once with σ_overall
("overall" or "expected" PPM). Excel: `=1-NORM.S.DIST(z, TRUE)`. Compare with the **observed**
fraction (count out of spec ÷ count measured): if they disagree by more than the sample can
explain, the data are not normal enough for the index and the observed figure is what you
report.

### C4 · DPMO from counts

DPMO = defects ÷ (units × opportunities per unit) × 1,000,000

Two bases, always stated:

| Basis | Numerator | Denominator | When to prefer it |
|---|---|---|---|
| **Per unit** (defective units per million) | Units with at least one defect | Units | When the customer experiences the unit — an invoice is rejected, a patient waits, a bracket is reworked. Default for Green Belt reporting |
| **Per opportunity** | Total defects counted | Units × opportunities | When the opportunities are real, fixed, and agreed before you look. Counting opportunities generously flatters any process |

### C5 · Z_bench and the sigma level — the 1.5-shift convention, stated honestly

**Z_bench** is the z-value whose one-sided upper tail equals the total fraction defective
(from C3 or C4): Excel `=NORM.S.INV(1 − DPMO ÷ 1,000,000)`. It is a measurement of your
process.

**Sigma level**, as Motorola defined it, is Z_bench **+ 1.5**. The 1.5 is a convention: the
argument was that a process measured over a short window will drift by about 1.5σ over the
long run, so a short-term Z of 4.5 corresponds to a long-term 3.4 DPMO, which the convention
calls "six sigma." The 1.5 has never been measured on your process, and the data you have are
long-term data already (weeks of production or arrivals), so adding 1.5 to them is adding
drift you have already counted. Some software prints Z_bench without the shift; some Excel
add-ins add 1.5 and print "sigma level" or "short-term"; sponsors compare figures across
projects that used different tables.

**This program's rule.** Report DPMO on a stated basis and Z_bench. If you quote a sigma level,
write it as *"sigma level 3.6 (1.5-shift convention)"* on the same line, never the bare number.
Between two projects, compare DPMO per unit, not sigma levels.

| DPMO | Z_bench (no shift) | Sigma level (1.5-shift convention) |
|---|---|---|
| 500,000 | 0.0 | 1.5 |
| 308,538 | 0.5 | 2.0 |
| 158,655 | 1.0 | 2.5 |
| 66,807 | 1.5 | 3.0 |
| 22,750 | 2.0 | 3.5 |
| 6,210 | 2.5 | 4.0 |
| 1,350 | 3.0 | 4.5 |
| 233 | 3.5 | 5.0 |
| 32 | 4.0 | 5.5 |
| 3.4 | 4.5 | 6.0 |

---

## Part D — The worksheet

**Project:** ______________ **Metric:** ______________ **Stability statement (Part A, verbatim):**
______________________________________________ **Segment used:** ____ to ____ (n = ____)

| Line | Quantity | Value | Units | Source / formula |
|---|---|---|---|---|
| 1 | LSL | | | spec source: |
| 2 | USL | | | spec source: |
| 3 | X̿ (process mean) | | | mean of all values in the segment |
| 4 | R̄ or MR̄ | | | from the chart |
| 5 | d2 | | — | table (n = __) or 1.128 for I-MR |
| 6 | σ_within | | | line 4 ÷ line 5 |
| 7 | σ_overall | | | `STDEV.S` of all values |
| 8 | Cp | | — | (2 − 1) ÷ (6 × 6) |
| 9 | Cpu · Cpl | | — | (2 − 3) ÷ (3 × 6) · (3 − 1) ÷ (3 × 6) |
| 10 | **Cpk** | | — | min of line 9 |
| 11 | Pp | | — | (2 − 1) ÷ (6 × 7) |
| 12 | Ppu · Ppl | | — | (2 − 3) ÷ (3 × 7) · (3 − 1) ÷ (3 × 7) |
| 13 | **Ppk** | | — | min of line 12 |
| 14 | z_upper · z_lower (overall) | | — | (2 − 3) ÷ 7 · (3 − 1) ÷ 7 |
| 15 | Expected fraction out (overall) | | | `1−NORM.S.DIST(z,TRUE)` summed |
| 16 | Expected PPM (within) | | PPM | same with σ_within |
| 17 | Observed out of spec | | count / total = % | from the data |
| 18 | **DPMO** | | per ☐ unit ☐ opportunity | line 15 × 10⁶, or C4 from counts |
| 19 | **Z_bench** | | — | `NORM.S.INV(1 − 18 ÷ 10⁶)` |
| 20 | Sigma level | | — | line 19 + 1.5, written "(1.5-shift convention)" |
| 21 | Cp − Cpk (centering) · Cpk − Ppk (drift) | | — | in words on line 22 |
| 22 | **The sentence** | | | Part E |

For attribute data, lines 1–17 are replaced by: units inspected, defective units, defects
counted, opportunities per unit (agreed before counting), target and its source; then lines
18–20 on both bases.

### Building it in Excel (no add-in)

Raw data in column A (or subgroups across columns B–E with `=AVERAGE(B2:E2)` and
`=MAX(B2:E2)-MIN(B2:E2)` in F and G). Named cells: `LSL`, `USL`, `Xbb` `=AVERAGE(F:F)`,
`Rbar` `=AVERAGE(G:G)`, `d2` from the table, `sw` `=Rbar/d2`, `so` `=STDEV.S(B2:E26)` (every raw
value). Then `Cp` `=(USL-LSL)/(6*sw)`, `Cpk` `=MIN((USL-Xbb)/(3*sw),(Xbb-LSL)/(3*sw))`, `Pp`
and `Ppk` the same with `so`, `PPMo` `=(1-NORM.S.DIST((USL-Xbb)/so,TRUE)+1-NORM.S.DIST((Xbb-LSL)/so,TRUE))*10^6`,
`Zbench` `=NORM.S.INV(1-PPMo/10^6)`. For I-MR data, `MRbar` `=AVERAGE(ABS(A3:A31-A2:A30))` (entered
as an array in older Excel) and `sw` `=MRbar/1.128`. Keep the stability chart on the same sheet;
the worksheet reads only the stable segment's rows.

---

## Part E — Worked examples, one per vertical

All three are illustrative and use the week 4 case data. The MSA verdicts are from week 3.

### MFG — shaft diameter, two-sided specification (X̄-R)

**Part A.** X̄-R chart, 25 hourly subgroups of 4, one shift, rule set 1–4 named on the chart.
R chart read first: all ranges inside 0 to 0.073 mm. X̄ chart: no violations across 25 subgroups.
*Stability statement:* "The X̄-R chart of shaft diameter over 25 hourly subgroups shows no
violation of rules 1–4; the process is stable and the capability below describes it."
**Part B.** Gage R&R 8% of tolerance, ndc 9 — acceptable. Specification 25.00 ± 0.05 mm from the
customer drawing (rev. C). Histogram of the 100 values: one hump, mild symmetry.

| Line | Quantity | Value |
|---|---|---|
| 1–2 | LSL · USL | 24.95 · 25.05 mm (width 0.10) |
| 3 | X̿ | 25.012 mm |
| 4–5 | R̄ · d2 (n = 4) | 0.032 mm · 2.059 |
| 6 | σ_within | 0.032 ÷ 2.059 = **0.01554 mm** |
| 7 | σ_overall | **0.0181 mm** (STDEV.S of 100 values) |
| 8 | Cp | 0.10 ÷ (6 × 0.01554) = 0.10 ÷ 0.0932 = **1.07** |
| 9 | Cpu · Cpl | (25.05 − 25.012) ÷ 0.0466 = 0.038 ÷ 0.0466 = **0.82** · 0.062 ÷ 0.0466 = **1.33** |
| 10 | Cpk | **0.82** |
| 11 | Pp | 0.10 ÷ (6 × 0.0181) = 0.10 ÷ 0.1086 = **0.92** |
| 12 | Ppu · Ppl | 0.038 ÷ 0.0543 = **0.70** · 0.062 ÷ 0.0543 = **1.14** |
| 13 | Ppk | **0.70** |
| 14 | z_upper · z_lower (overall) | 0.038 ÷ 0.0181 = **2.10** · 0.062 ÷ 0.0181 = **3.43** |
| 15 | Expected fraction out (overall) | 0.0179 + 0.0003 = **0.0182** → 18,200 PPM |
| 16 | Expected PPM (within) | z = 2.45 and 3.99 → 0.0072 + 0.00003 → **7,300 PPM** |
| 17 | Observed out of spec | 2 of 100 oversize (2.0%) — consistent with line 15 at this n |
| 18 | DPMO (per shaft) | **18,200** (overall) |
| 19 | Z_bench | NORM.S.INV(1 − 0.0182) = **2.09** (overall); 2.44 (within) |
| 20 | Sigma level | **3.6 (1.5-shift convention)** |
| 21 | Cp − Cpk = 0.25 · Cpk − Ppk = 0.12 | Centering costs a quarter of an index point; hour-to-hour movement inside the limits costs another tenth |

**The sentence.** *"The shaft process is stable. Against the ±0.05 mm drawing tolerance it runs
0.012 mm high: Cpk 0.82, Ppk 0.70, about 1.8% of shafts oversize on current performance
(18,200 per million; Z 2.09, sigma level 3.6 on the 1.5-shift convention). Centering alone
would take Cpk above 1.0; reaching the customer's 1.33 needs less spread as well. Why it sits
high is the Analyze question."*

### HC — ED door-to-provider time, one-sided target, skewed data (I-MR of daily medians)

**Part A.** I-MR of the daily median, 40 weekdays. One signal: day 23 (41 min, rule 1; MR also
beyond its limit) — the registration-system outage in the IT change log. *Stability
statement:* "The I-MR chart of the daily median shows one signal; day 23 was a documented
registration outage, excluded from the limits and shown on the chart. The remaining 39 days
are stable and the capability below describes them." An I chart of the raw per-visit times
fired rule 1 a dozen times — all common cause from the right-skewed shape, which is why the
daily median is charted.
**Part B.** Timestamp audit: 40 arrivals, 95% within ± 3 min of observed — accepted (M3 reason
written). Target: ≤ 30 minutes per arrival, from the department's published service standard.
Histogram of per-visit times: one hump with a long right tail — **the indices will mislead**;
the observed fraction and DPMO are the report.

| Quantity | Value |
|---|---|
| Arrivals on the 39 stable days | 5,850 |
| Arrivals over 30 min (observed) | 1,632 → **27.9%** |
| Per-visit mean · SD · median | 25.1 · 13.8 · 21.6 min |
| Cpu, for the record | (30 − 25.1) ÷ (3 × 13.8) = 4.9 ÷ 41.4 = 0.12 — which would predict P(Z > 0.36) = 36% over target |
| Why Cpu is not reported | The normal model says 36%; the process shows 27.9%. The gap is the skew. A number that mispredicts the fraction it exists to predict is not reported |
| DPMO (per arrival, one opportunity) | 1,632 ÷ 5,850 × 10⁶ = **278,974** |
| Z_bench | NORM.S.INV(1 − 0.279) = **0.59** |
| Sigma level | **2.1 (1.5-shift convention)** |

**The sentence.** *"On stable weekdays, 28% of arrivals wait longer than the 30-minute standard
(1,632 of 5,850; DPMO 279,000 per arrival). The typical wait is 22 minutes; the problem is the
long tail, not the middle. The daily median is stable, so this is what the department produces
by design, every day, until something in the design changes. Cpk is not a meaningful number for
a distribution this skewed and we are not quoting one."*

### TXN — invoices incomplete on receipt, attribute data (p chart)

**Part A.** p chart, 20 working days, nᵢ from 118 to 214, stepped limits, p̄ = 0.098. One
signal: day 12 at 0.19 on nᵢ = 150 (rule 1), traced to the supplier-master migration on day 11
that blanked the PO field for one supplier group. *Stability statement:* "The p chart shows
one signal; day 12 was the documented migration, excluded from the limits and shown on the
chart. The remaining 19 days are stable and the capability below describes them."
**Part B.** Attribute agreement on "incomplete": 90% vs standard, kappa 0.86 — accepted after
the definition fix ([`msa-plan.md`](msa-plan.md)). Target: ≤ 3% incomplete, from the AP
service-level agreement. Opportunities: the four required fields, agreed with AP before
counting.

| Quantity | Value |
|---|---|
| Invoices inspected (19 stable days) | 2,790 |
| Invoices with at least one missing field | 259 |
| Missing fields counted, all invoices | 306 |
| **Per-unit** DPMO | 259 ÷ 2,790 × 10⁶ = **92,832** · Z_bench = NORM.S.INV(0.9072) = **1.32** · sigma level **2.8** (1.5-shift convention) |
| **Per-opportunity** DPMO | 306 ÷ (2,790 × 4) × 10⁶ = 306 ÷ 11,160 × 10⁶ = **27,419** · Z_bench **1.92** · sigma level **3.4** (1.5-shift convention) |
| Target on the per-unit basis | 3% = 30,000 DPMO; the process runs at 3.1 × the target |

Same process, two honest numbers 0.6 sigma apart. The customer (the payment run) experiences
the invoice, not the field: **the per-unit figure is the one on the Tollgate 2 page**, with the
per-opportunity figure in a footnote so nobody later "improves" the process by changing the
basis.

**The sentence.** *"Outside the migration day, 9.3% of invoices arrive with at least one of the
four required fields missing (259 of 2,790; 92,800 per million) against the SLA's 3%. The
process is stable — this is its normal rate, not a bad fortnight. On a per-field basis the
figure is 27,400 per million; we report per invoice because that is what reaches the payment
run."*

---

## Common mistakes

- **Capability on an unstable chart.** The whole-series Cpk in the week 4 MFG case was
  arithmetically right and predicted nothing, because after subgroup 18 it was a different
  process. State stability first; the honest page for an unstable process withholds the index.
- **Control limits used as specification limits.** Cpk against ±3σ is 1.00 by construction.
  The specification comes from the customer and its source is written on the page.
- **Reporting one pair.** Cp and Cpk without Pp and Ppk hides drift; Pp and Ppk without Cp and
  Cpk hides what centering alone would buy. Report all four and read the two gaps in words.
- **An index on skewed time data.** Waits and turnarounds have long right tails; the normal
  model over- or under-predicts the fraction out. Report the observed fraction and DPMO, and
  say why there is no index.
- **Opportunities chosen after looking.** Counting more opportunities per unit lowers DPMO
  without changing the process. Fix the count with the customer before the data, and prefer
  the per-unit basis.
- **A bare sigma level.** "4.6 sigma" with no convention is unreadable: it may be Z_bench, or
  Z_bench + 1.5, from within or overall σ. Write "(1.5-shift convention)" on the same line, or
  report DPMO and Z_bench only.
- **Comparing this project's sigma to another's.** Different bases, different conventions,
  different tables. Compare DPMO per unit on a stated definition.
- **Recomputing "after" capability on nine points.** The after-stage needs its own stability
  statement first (≥ 20 points in the new state, week 7's rule); capability follows.
- **Dropping the signal to get a cleaner index.** Excluding a point requires a documented cause
  and the exclusion written on the chart; otherwise it stays. Rubric: data-ethics stop.

## Rubric items evidenced

| Item | What on this worksheet evidences it |
|---|---|
| M4 Stability before capability | Part A statement with the rule set and every signal accounted for; Part C with the specification source; the sentence in Part E |
| ★ M3 MSA attempted | Part B, first row — the index is not computed on a failed, unfixed measurement system |
| D3 VOC → CTQ | Part B, second row — the specification and its customer source |
| ★ I3 Before/after evidence | The same worksheet re-run on the post-change stable stage, same metric and definition, the two Part D tables side by side |
| ★ C1 Control plan | The post-change σ_within and center feed the control plan's limits ([`control-plan.md`](control-plan.md)) |

*v1.0 · 2026-09-20*
