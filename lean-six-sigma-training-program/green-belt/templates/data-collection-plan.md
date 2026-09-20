# Data Collection Plan

*Green Belt toolkit · used in week 3, rubric item M2, and again in week 7 for the pilot's
before/after evidence (I3). One row per metric. Fillable versions ship as a spreadsheet tab
that feeds the check sheet and the baseline chart.*

## Purpose

A data collection plan is the contract between the question you are asking and the numbers
you will get. It exists so that a stranger could collect the same number you would, so that
the baseline and the "after" are measured the same way, and so that you find out *before*
collecting that the sample is too small, the definition is ambiguous, or the data already
exist in a system. Rubric M2 scores exactly that: "the operational definition would let a
stranger collect the same number."

You write it after the current-state map (you know where in the flow the number is born)
and before the MSA (the MSA tests the measurement this plan describes).

## The plan

**Project:** ______________________ **Primary metric (from the charter):** ______________________
**Question(s) this data must answer:** ______________________________________________________
**Plan owner:** ______________ **Collection window:** ____ to ____ **Version / date:** ________

| # | Metric or characteristic | Operational definition (what, threshold, clock start/stop, source) | Data type | Where in the flow it is captured | Who collects | When / how often | How many (and why that many) | How recorded (form, system field, check sheet) | Stratification factors captured with it | Measurement check (MSA planned) | Analysis planned |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | ☐ Continuous ☐ Attribute ☐ Count | | | | | | | | |
| 2 | | | ☐ Continuous ☐ Attribute ☐ Count | | | | | | | | |
| 3 | | | ☐ Continuous ☐ Attribute ☐ Count | | | | | | | | |
| 4 | | | ☐ Continuous ☐ Attribute ☐ Count | | | | | | | | |

**Sampling approach** (choose and justify): ☐ Every unit ☐ Systematic (every *k*th)
☐ Random ☐ Stratified by ____________ — *Conditions the window must cover:* shifts ☐
weekdays/weekends ☐ product/patient/case mix ☐ month-end or peak ☐
**Pilot of the plan:** one day/one shift on ________, reviewed by ________, changes made: ______
**Data ethics statement:** no person-identifying fields; no patient, customer or employee
data beyond what the operational definition needs; the definition is frozen from the date
above and any change is logged with its date and reason.

## Filling each column

**Operational definition.** Four parts, always: what is being measured; the threshold or
rule that decides a yes/no; the clock (what event starts it, what event stops it, whose
clock); and the source (system field, observation, form). Test: hand the definition to
someone who has never seen the process and have them collect an hour of data alongside
you. Disagreements are the definition's fault, not theirs.

**Data type.** Continuous data (time, length, money) carries more information per
observation than attribute data (pass/fail), so it needs fewer observations and supports
the variable control charts and capability indices. If you can measure "minutes late"
instead of counting "late: yes/no," do; you can always derive the yes/no later, never the
reverse.

**Where in the flow.** Name the step on the current-state map. The number should be captured
where it is born, not reconstructed afterwards from memory or from a downstream system that
overwrites it.

**How many.** Rules of thumb at Green Belt (formal power calculation is Black Belt, module M3):

| You want | Rule of thumb | Why |
|---|---|---|
| A baseline control chart, continuous data | ≥ 20–25 subgroups (X̄-R) or ≥ 25–30 individual points (I-MR), spread over the conditions above | Limits computed from fewer points are unreliable |
| A baseline p-chart | Enough per subgroup to expect ≥ 5 defects: n ≥ 5 / p (p = 5% → ≥ 100 per subgroup) | A subgroup that cannot show a defect cannot show a change |
| An estimate of a proportion within ± E | n ≈ 3.84 × p(1 − p) / E² — e.g. p ≈ 10%, E = 3 points → n ≈ 384 | 95% confidence interval half-width |
| An estimate of a mean within ± E | n ≈ (1.96 × s / E)² — e.g. s = 9 min, E = 3 min → n ≈ 35 | 95% confidence interval half-width |
| A 2-sample comparison | ≥ 30 per group as a floor; more when spread is large relative to the difference you care about | Assumption robustness and interval width |
| An attribute agreement study | 30–50 items, ≥ 30% known-defective, 2–3 appraisers, 2 trials | See [`msa-plan.md`](msa-plan.md) |

Whatever the number, the window must cover the conditions in which the process varies —
a week with no month-end, or days only, is a sample of a different process.

**Stratification factors.** Record with every observation the things you might later split
by: shift, day of week, operator group (not name), machine, form type, vendor, triage
level. You cannot add them afterwards. Do not record names; this data improves processes,
not performance reviews, and the people collecting it are told so in writing.

**Measurement check.** Every primary metric gets an MSA (rubric ★ M3). Say here which kind
and when. "System timestamp" is not automatically exempt: you still check that the
timestamp is written by the event you think it is (the door time in most ED systems is the
registration clerk's click, not the patient's arrival).

## Filled example — HC: ED door-to-provider time

**Project:** Emergency department door-to-provider time, main ED, weekday and weekend.
**Primary metric:** minutes from patient arrival to first provider contact; CTQ target ≤ 30
min (customer: patients and the admitting service; specification source: the department's
published standard).
**Question:** what is the baseline distribution of door-to-provider time and where — by
shift, day, triage level — does the variation live?

| # | Metric | Operational definition | Data type | Where captured | Who collects | When / how often | How many | How recorded | Stratification | MSA planned | Analysis planned |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Door-to-provider time (min) | Start: arrival timestamp = the greeter's tablet tap when the patient crosses the ambulatory entrance or the ambulance bay door (not registration). Stop: first provider timestamp = the "provider assigned and at bedside" click by the physician or advanced-practice provider (not the triage nurse). Source: EHR tracking board fields ARRIVE_TS and PROV_TS. Exclude: left-without-being-seen (recorded separately as metric 3). | Continuous | Step 1 (arrival) and step 5 (provider evaluation) on the current-state map | Charge nurse pulls the tracking-board export each morning for the previous 24 h; Green Belt validates weekly | Every arrival, four weeks (28 days) | All arrivals, ≈ 4,200 in the window; supports an I-MR chart of daily median and a box plot by shift with ≥ 40 per shift-day | EHR export to the project workbook, one row per arrival, no names or MRNs (visit sequence number only) | Arrival hour, shift (day 07–15, evening 15–23, night 23–07), day of week, triage level 1–5, arrival mode | Timestamp audit: 40 arrivals over two days observed by a Green Belt with a stopwatch and compared with ARRIVE_TS and PROV_TS; acceptance: 95% within ± 3 min. Attribute check that "greeter tap" happens at the door, not at registration, on both entrances | I-MR chart of daily median; box plot by shift and by triage level; ANOVA by shift in week 6; capability as % ≤ 30 min (DPMO basis: arrivals) |
| 2 | Discharge orders written by 10:00 (secondary; admitted patients) | Order timestamp on the admitting unit's discharge order set ≤ 10:00 on the day of departure | Attribute | Inpatient unit, upstream of ED boarding | Unit clerk report, daily | Daily, same four weeks | All discharges ≈ 120/month | Unit report to workbook | Unit, weekday | Not primary; system timestamp cross-checked on 20 orders | p-chart weekly, context for boarding |
| 3 | Left without being seen | Patient registered but no PROV_TS and disposition code LWBS | Attribute | Step 1–5 | Same export | Daily | All arrivals | Same workbook | Shift, day | Included in the timestamp audit | Weekly p-chart; reported alongside metric 1 so a faster door-to-provider is not bought by more walk-outs |

**Sampling:** every arrival (the data are already captured; the cost is validation, not
collection). Window covers four full weeks including two weekends and one month-start.
**Plan pilot:** first two days' export reviewed on day 3; finding — the ambulance-bay
entrance had no greeter tablet on nights, so ARRIVE_TS for those arrivals defaulted to
registration. Fixed by adding the tablet before the window started; the two pilot days are
excluded and the exclusion is written on the chart.
**Data ethics:** visit sequence numbers only; nothing that identifies a patient or a named
provider; definition frozen on the date above; the same export and the same definition will
be used for the pilot's "after" data in week 7.

*Numbers are illustrative; the timestamp finding is the kind of thing a plan pilot reliably
turns up.*

## Common mistakes

- **"Clear" definitions.** "Time to see a doctor" is not an operational definition; the
  example above needed four sentences to become one, and the ambulance-bay tablet only
  surfaced because someone tried to use it.
- **Trusting the system field without checking what writes it.** The click and the event
  are different things. Rubric M3 does not accept "we trust the system."
- **Sampling the convenient hour.** Data collected 09:00–11:00 on weekdays describes a
  process that runs 24/7 only if the process does not vary by hour or day — which is
  exactly what you have not yet shown.
- **Forgetting stratification factors.** You cannot split by shift later if you did not
  record shift now. Record the factors; never record the names.
- **Skipping the plan pilot.** One day of trial collection finds the flaw that four weeks of
  real collection would have buried.
- **Changing the definition between baseline and after.** This is a data-ethics stop in the
  rubric. If the definition must change, the baseline is re-collected under the new one.
- **Collecting attribute data when the measurement was available.** "Late yes/no" throws
  away the minutes that would have told you how late and whether the pilot moved the
  distribution.

*v1.0 · 2026-09-20*
