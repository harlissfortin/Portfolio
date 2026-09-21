# Pilot Plan — Prediction, Stop Rule, Same Metric, Comparison Period

*Green Belt toolkit · used in week 7 (the pilot design lab), rubric item I2, and as the
evidence plan for ★ I3. The pilot plan is posted to the cohort channel before the pilot
starts — the prediction is only a prediction if it is dated before the data. Evidence steps
per software: [`software-parity.md`](software-parity.md).*

## Purpose

A pilot is an experiment with one factor: the countermeasure. It exists to find out whether
removing the verified cause moves the primary metric by about the amount Analyze said it
would — and to find out cheaply, on a slice, before the organization commits. A pilot that
cannot fail cannot teach, which is why the rubric gives full marks to a documented pilot that
did not work and led somewhere, and nothing to "we tried it and everyone liked it."

The plan fixes four things before the first pilot unit is processed: what you **predict**,
what would make you **stop**, that the **metric and its definition are the baseline's**, and
what period and group the pilot is **compared** with. Everything else is logistics.

## The plan

### 1 · Header

| | |
|---|---|
| **Project / Green Belt** | |
| **Verified cause (★ A3, verbatim with its effect size and interval)** | |
| **Countermeasure (I1 — from the selection matrix, which candidate and why)** | |
| **Process owner releasing the slice** | name, title — signature at the end |
| **Pilot window** | from ____ to ____ (____ working days / ____ cycles) |
| **Plan posted to the cohort channel on** | date — before the window opens |

### 2 · Bounded scope

| | |
|---|---|
| **Where** (one line, unit, team, vendor group, chair block) | |
| **Who does the work in the pilot** | the people who do it now, briefed on the new step; not a hand-picked crew |
| **Volume expected in the window** | ____ units / week × ____ weeks = ____ (≥ 20 data points in the new state, or two full process cycles, whichever is longer) |
| **What is deliberately outside the pilot** | the untouched lines, units, channels — including the one you will compare against |

### 3 · Prediction (written before the pilot; the number comes from Analyze)

> If **[verified cause]** is removed by **[countermeasure]**, then **[primary metric, unit,
> basis]** will move from **[baseline value, with n and period]** to **[predicted value]**
> within **[window]**, while **[guardrail metric]** stays at or better than **[level]**.

**Where the predicted value comes from:** the Analyze effect size (a cause that explained 16
minutes does not justify predicting 30) · the comparison group's level (portal invoices run at
4.1%, so an emailed invoice with the same validation should approach it) · a physical limit.
Write which: ______________

**What "did not work" looks like, in numbers:** ______________ (if a stranger cannot tell
from this line what failure is, rewrite it).

### 4 · Success measure — identical to the baseline

| | Baseline | Pilot | Same? |
|---|---|---|---|
| Metric and unit | | | ☐ |
| Operational definition (version and date, from [`data-collection-plan.md`](data-collection-plan.md)) | | | ☐ |
| Start and stop events / decision rule | | | ☐ |
| Data source (system field, form, observation) | | | ☐ |
| Who collects | | | ☐ same people ☐ different, briefed on the same definition |
| Sampling (every unit, every *k*th, stratified by) | | | ☐ |
| Measurement system (MSA ref.) | | | ☐ same gauge and method |

Any "no" in the last column is written up before the pilot starts, with why, and the
comparison is made on the common basis. Changing the operational definition between before
and after voids ★ I3 and is a data-ethics stop.

### 5 · Stop rules (decided before; who decides is named)

| Rule | Trigger | Who decides | Action the same day |
|---|---|---|---|
| **Harm stop** | any safety event, defect escape, patient-safety event, duplicate payment, or ______________ attributable to the pilot | process owner | pilot stops; revert to the old step; incident recorded; sponsor told within 24 h |
| **Harm watch** | guardrail metric worse than ____ for ____ consecutive periods | Green Belt + process owner | review with the people doing the work; continue, adjust, or stop — written down |
| **Futility stop** | after ____ pilot units / ____ days, the metric has not moved past ____ (e.g. the baseline median) | Green Belt with coach | pilot stops; return to Analyze; the null result is written up under A4 |
| **Early-success trap** | the metric moves in the first days | nobody | **no action** — a Hawthorne bump is expected for a week or two; the window runs its full length |

### 6 · Comparison design and comparison period

| Element | Your choice |
|---|---|
| **Design** | ☐ Before/after on the baseline control chart, pilot as a second stage (default) ☐ Concurrent comparison: pilot slice vs an untouched slice in the same weeks (use when other changes are in flight or the season is moving) ☐ Paired: the same units before and after (same accounts, same patients on their own pathway, same setters) |
| **Baseline comparison period** | from ____ to ____; ____ points; same subgrouping as the pilot (daily / weekly); covers the same conditions (month-end, weekend, shift mix) as the pilot window |
| **Pilot period** | from ____ to ____; ____ points |
| **Comparison group (concurrent designs)** | who / what, untouched, measured the same way |
| **Chart** | ☐ I-MR ☐ X̄-R ☐ p ☐ u — limits from the **baseline stage only**, extended across the pilot; the pilot stage is not used to recompute limits until it has ≥ 20 points and its own stability statement |
| **What the chart is expected to show if the prediction holds** | e.g. "rule 2 (nine below the center) fires by week 9; at five weeks, five points below center and no rule fires" — write it now so nobody is surprised at the tollgate |
| **Backup comparison with an interval** | ☐ 2-sample t ☐ paired t ☐ 2-proportion — reported with the effect size and 95% CI against the prediction ([`hypothesis-test-selector.md`](hypothesis-test-selector.md)) |
| **Reading rules, stated now** | prediction met · partly met (by how much) · not met · cannot tell yet (interval straddles the prediction and the baseline) |

### 7 · Other-changes log (opened on day one, kept by the Green Belt)

| Date | Change (hire, volume, release, policy, weather, reorganization) | Affects pilot / comparison / both | Likely direction on the metric |
|---|---|---|---|
| | | | |

Change one thing at a time. If a second countermeasure must go in, log it and treat the
result as confounded; testing several factors at once is a designed experiment, a Black Belt
tool you know exists and do not run.

### 8 · Roles, dates, sign-off

| Role | Name | Commitment |
|---|---|---|
| Process owner | | releases the slice; owns the harm stop; will own the control plan if the pilot holds |
| People doing the work | roles, not names | briefed on ____; asked what would make the new step fail |
| Data collector | | same as baseline ☐ |
| Sponsor | | told the prediction and the stop rules before the start; hears the result at Tollgate 4 or the next checkpoint |
| Coach | | reviews the plan before posting; not a decision-maker |

Process owner signature ______________ date ______ · Green Belt ______________ date ______

---

## Filled example — TXN: accounts payable, emailed-PDF invoice exceptions

**Verified cause (★ A3):** on invoices that arrive as emailed PDFs the PO number is keyed
free-text; exception rate 13.6% (250 of 1,840) against 4.1% (91 of 2,210) on portal invoices —
a difference of 9.5 percentage points, 95% CI 7.8 to 11.2 (2-proportion test; chi-square
χ² = 112, df = 1, agrees). **Countermeasure (I1):** a structured upload form for emailed
invoices with a required PO field that validates against the vendor's open POs at entry —
candidate A of five in the selection matrix (impact 3, effort 2, risk 3, reversibility 3;
"train the vendors" scored 1 on impact because vendors are responding rationally to a field
that accepts anything). Numbers are illustrative and match the week 7 practicum file.

**Bounded scope.** Emailed invoices from the Raw-materials and MRO vendor groups (about 110 a
week, 60% of emailed volume), five weeks, two AP clerks who already handle those groups.
Outside: portal, EDI and paper channels; emailed invoices from Services, Freight and
Utilities vendors — which stay on the old intake and are the concurrent comparison group.
Expected volume 550 pilot invoices.

**Prediction.** *If free-text PO entry is removed by the validated upload form, then the
exception rate on emailed invoices from the pilot vendor groups will fall from 13.6%
(1,320 invoices, 12 weeks) to 6% or below within five weeks, while entry minutes per invoice
stay at or below the baseline 7.5 min and the comparison group stays near 13%.* The 6% comes
from the portal's 4.1% plus about two points for exception types the PO field does not touch
(amount mismatches, missing goods receipt — 1.9% of portal exceptions in the baseline). **Did
not work:** a pilot-group rate above 11% at week 5, or a rate that falls in the comparison
group as much as in the pilot group.

**Success measure — identical.** Exception = "invoice returned to the clerk queue for
correction after first entry," definition v2 dated week 3 (the v1 → v2 change re-scored the
baseline; both figures are on the A3). Source: the workflow system's return flag, exported
weekly by the same analyst. Every invoice, subgrouped by week. Attribute agreement on the flag
93% vs standard, kappa 0.86 (week 3). Same clerks.

**Stop rules.** *Harm stop:* any duplicate payment traceable to the form, or a pilot vendor
unable to submit for more than one business day — AP manager decides, same day, form
withdrawn, vendors returned to the mailbox. *Harm watch:* more than three vendor escalations
in a week, or entry minutes above 9.0 for two consecutive weeks — review with the two clerks.
*Futility stop:* after three weeks (about 330 invoices) a rate of 11% or more — stop, return
to Analyze. *Early-success trap:* week 1 is expected to look good; the window runs five weeks.

**Comparison design.** Before/after on the weekly p chart of the pilot vendor groups' emailed
invoices, continued from the 12-week baseline (p̄ = 0.136; for a week of n = 110 the limits are
0.136 ± 3 × √(0.136 × 0.864 ÷ 110) = 0.136 ± 0.098 → UCL 0.234, LCL 0.038), plus the concurrent
comparison group on its own chart. **What the chart is expected to show:** a rate of 6% sits
*inside* the baseline limits (LCL 3.8%), so no rule 1 signal; five pilot weeks below the center
line is not yet rule 2 (nine needed). The chart will not call it at Tollgate 4; it is expected
to fire rule 2 around week 9 if the rate holds, and it continues into the control plan.
**Backup comparison with an interval:** 2-proportion test, baseline 12 weeks (1,320) vs pilot
5 weeks (550); if the pilot runs at the predicted 6% (33 of 550) the difference is 7.6 points
with a 95% CI of roughly 5 to 10 points — an interval that excludes both zero and the
baseline. **Reading rules:** met if the pilot rate is ≤ 6% and the comparison group is within
2 points of its baseline; partly met if 6–11% with the CI excluding the baseline; not met at
≥ 11%; cannot tell if the interval includes 13.6%.

**Other-changes log, opened day one.** Week 2: month-end volume spike (both groups). Week 3:
new clerk joined the portal queue (not the pilot). Week 4: a pilot vendor changed its AP
contact — three escalations that week, reviewed under harm watch, continued.

**Result, for the record (Tollgate 4).** Pilot 5 weeks, 548 invoices, 29 exceptions — 5.3%
(prediction ≤ 6%: met). Comparison group 13.2% (n = 372) — unchanged. Difference from
baseline 8.3 points, 95% CI 5.6 to 11.0. Entry minutes 6.8 vs 7.5 (guardrail held). Weekly
p chart: five points below the center line, no rule fired, as predicted on the plan; the
chart continues under the control plan and fired rule 2 in week 9. *"On the pilot vendors,
about one emailed invoice in nineteen now comes back for correction instead of one in
seven; the untouched vendors did not change, so the form and not the season did it. That is
about 90 fewer returned invoices a month at full volume, and the control plan owner has the
chart."*

## Common mistakes

- **A prediction without a number, or with a number from nowhere.** "It will improve" is
  unfalsifiable; "from 13.6% to 2%" when the cause explained nine points is a wish. The
  prediction is the Analyze effect size applied.
- **A stop rule that is really a hope.** "We will monitor closely" stops nothing. A harm stop
  names the event and the person; a futility stop names the count and the value.
- **Timing it "more carefully" in the pilot.** That is a changed operational definition. The
  pilot is measured exactly as badly as the baseline was.
- **Reading five points as a shift.** A chart with baseline limits needs ≥ 20 points in the
  new state, or a run rule, to say the process moved. Write the expected chart reading on the
  plan so the tollgate does not argue about it.
- **No comparison group when something else is moving.** A volume drop, a new hire, a season
  change can move the metric on its own; the untouched slice shows what would have happened
  anyway.
- **Choosing the pilot window after seeing early results.** The window is dated on the plan
  before the first unit. Extending it because week 5 looked bad is a data-ethics concern the
  reviewer records.
- **A slice that cannot be reversed.** A system or layout change is not a pilot; run a
  concurrent comparison on a piece of it before committing the whole.
- **Two countermeasures at once.** The result then belongs to neither. Log it as confounded if
  it cannot be avoided; do not present it as verification of either.

## Rubric items evidenced

| Item | What on this plan evidences it |
|---|---|
| I2 Pilot design | Sections 2, 3, 5 and 6: bounded scope, written prediction, stop rules, comparison period — dated before the pilot |
| ★ I3 Before/after evidence | Section 4 (same metric, definition, method) and section 6 (chart continued from baseline; backup comparison with interval; reading rules); the result against the prediction, honestly read |
| I1 Countermeasure selection | Header: which candidate and why it targets the verified cause |
| I4 Mistake-proofing and risk | The harm stop and guardrail; residual risks carried from [`fmea.md`](fmea.md) |
| A4 Honest handling | A futility stop that leads back to Analyze, with the null result written up |
| ★ C1 Control plan | The pilot chart and its limits become the control plan's monitoring chart ([`control-plan.md`](control-plan.md)) |

*v1.0 · 2026-09-20*
