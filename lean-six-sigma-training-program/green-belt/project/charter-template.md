# Green Belt Project Charter — Template, Examples and Smells

*One page. You bring a sponsor-signed version to day 1 (the charter agreement); you rewrite it
in the week 1 charter clinic; your sponsor signs the rewrite before Tollgate 1 in week 2. The
charter is scored under rubric items D1 and D2 and is the reference point for every tollgate
after that — see [`review-rubric.md`](review-rubric.md) and
[`tollgate-checklists.md`](tollgate-checklists.md).*

**Who fills it:** you, the Green Belt, with the sponsor and the process owner in the room or on
the call. A charter written alone and sent for signature is the first smell on the list at the
end of this document.

---

## 1. The one-page charter

### Header

| | |
|---|---|
| **Project title** | *(verb + metric + place — "Reduce first-pass rejects at coating line 2". No solution in the title: "Implement…" and "Install…" are not projects, they are decisions already made.)* |
| **Green Belt / cohort** | |
| **Organization and area** | *(site, unit or department; the process you touch in your own work)* |
| **Vertical** | ☐ MFG ☐ HC ☐ TXN |
| **Source** | ☐ Employer project ☐ Partner-pool project ☐ Practicum (instructor acts as sponsor — credential labeled accordingly) |
| **Charter version** | ☐ Pre-course agreement (signed before day 1) ☐ Week 1 rewrite (signed before Tollgate 1) ☐ Re-scoped at Tollgate ___ (date) |

### Problem statement (D1)

What is wrong, where, since when or how often, how big, and why it matters. No cause, no blame,
no solution. Everyone on the team can sign it whatever they think the cause is.

> _______________________________________________________________________________

### Business case — why this, why now

Two or three lines: who is hurt by the gap (customer, patient, staff, the ledger) and what it
costs in the units the sponsor manages. If you do not know the cost yet, say "not yet
quantified — Finance partner to confirm at Tollgate 2" rather than guess.

> _______________________________________________________________________________

### Primary metric and operational definition (D2, M2)

| | |
|---|---|
| **Primary metric** | *(one metric; the one the goal statement moves)* |
| **Operational definition** | *(what is counted or measured, the exact start and stop of a timing, the unit, the data source, who records it, when, and any exclusions — written so a stranger collects the same number you would)* |
| **Basis** | ☐ per unit ☐ per day ☐ per shift ☐ per week · ☐ calendar time ☐ working time |
| **Data type** | ☐ continuous ☐ count of defects ☐ defectives (pass/fail) ☐ time |
| **Baseline (if known)** | *(value, period, n — "unknown, collected weeks 3–4" is an honest entry)* |
| **Guardrail metric** | *(what must not get worse while the primary metric improves, with its own operational definition)* |
| **Customer and CTQ (D3)** | *(who receives the output — internal counts — and the requirement, with target and specification source)* |

### Goal statement

> Move **[primary metric]** from **[baseline]** to **[target]** by **[date]**, holding
> **[guardrail]** at or better than **[level]**.

Mark the target ☐ provisional (baseline not yet measured — confirmed at Tollgate 2) or
☐ confirmed. A target set before the baseline is measured is a wish; that is fine in week 1
as long as it is labeled.

### Scope (D2)

| | |
|---|---|
| **Start point** | *(the first act inside scope — "the discharge order is signed in the EHR")* |
| **Stop point** | *(the last act inside scope — "the patient leaves the unit")* |
| **In scope** | *(products, shifts, sites, customer types, channels)* |
| **Out of scope** | *(named exclusions — the things people will assume are in unless you say so)* |
| **Constraints** | *(no capital, no headcount change, regulatory limits, IT freeze dates)* |

### Team and roles (D2)

| Role | Name | Commitment |
|---|---|---|
| Sponsor | | Attends four tollgates (30 min each); removes blockers; signs verification |
| Process owner | | Co-builds the map; owns the control plan at handover |
| Green Belt | | 5–8 h/week project work for 8 weeks, then through closure |
| Team member (works the process daily) | | 1–2 h/week |
| Team member | | 1–2 h/week |
| Finance partner *(where money will be claimed)* | | Calculation basis at Tollgate 2; validation memo at closure |
| Mission-metric validator *(HC/service, where no money is claimed)* | | Signs the mission-metric validation at closure |

The instructor and coach are not on this table. They coach; they do not decide, and the
reviewer who scores the project is neither of them.

### Timeline (aligned to the 8-week cohort calendar)

| Week | Milestone | Date | Gate |
|---|---|---|---|
| Before day 1 | Charter agreement signed by sponsor | | — |
| 1 | Charter rewritten in the clinic; SIPOC; CTQ tree; stakeholder map | | — |
| 2 | Current-state map; metric definitions | | **Tollgate 1 — Define** |
| 3 | Data collection plan; MSA started | | — |
| 4 | Baseline chart and capability; MSA result | | **Tollgate 2 — Measure** |
| 5 | Prioritized causes; test plan | | — |
| 6 | Root causes verified with data | | **Tollgate 3 — Analyze** |
| 7 | Pilot run or scheduled; before/after evidence plan | | — |
| 8 | Control plan drafted; handover scheduled | | **Tollgate 4 — Improve/Control** |
| After week 8 | Pilot complete; control plan handed to owner (day 0 of monitoring) | | Monthly coaching checkpoint |
| Closure | Package submitted with ≥ 30 days of live monitoring | | Independent review |
| Closure + 90 days from handover | Sustainment check sent to sponsor | | `sustained` flag |

Closure may extend up to **6 months after week 8**. Certification waits for closure; the
learning does not.

### Signatures

| | Name | Title | Signature | Date |
|---|---|---|---|---|
| **Sponsor** — *I own this problem, I have authority over the process between the start and stop points, and I will attend the four tollgates.* | | | | |
| **Process owner** — *I will co-build the current-state map and I will own the control plan at handover.* | | | | |
| **Green Belt** — *I collect data honestly, keep the operational definition fixed between before and after, and report what I find.* | | | | |

---

## 2. Filled examples, one per vertical

All figures are illustrative and stated with their basis; they are typical of the processes
described, not measurements from a named organization.

### 2.1 MFG — Reduce first-pass rejects at powder-coating line 2

| | |
|---|---|
| **Problem statement** | Since the March changeover to the B-series bracket family, coating line 2 has rejected an average 6.8% of brackets at final inspection (12-week baseline, ≈ 210 units per day inspected, day and evening shifts), against a plant standard of 2%. Each reject costs ≈ 14 minutes of strip-and-recoat labor plus powder; rejects are the largest single cause of late shipments from the plant this quarter. |
| **Business case** | ≈ 14 rejected units per day × 14 min ≈ 3.3 labor-hours per day of rework, plus powder and oven time; two customer late-shipment penalties in the last quarter traced to line 2 rework backlog. Finance partner to confirm unit costs at Tollgate 2. |
| **Primary metric** | First-pass reject rate |
| **Operational definition** | Units failing the station 2 visual standard (orange peel, runs, bare spots) or measuring < 60 µm dry film at any of the three gauge points, divided by units inspected at station 2, per production day, from the station 2 inspection log. Reworked units re-entering the line are excluded from the denominator. |
| **Basis / data type** | Per production day; defectives (pass/fail); p chart |
| **Baseline** | 6.8% (12 weeks, n ≈ 12,600 units) — to be re-collected weeks 3–4 with the checked measurement system |
| **Guardrail** | Line throughput (units per hour, from the line counter) at or above 26; no increase in escapes found at customer incoming inspection |
| **Customer and CTQ** | Assembly (internal): bracket coating passes the visual standard and ≥ 60 µm at all points; specification from drawing note 7 |
| **Goal** | Reduce first-pass reject rate from 6.8% to ≤ 3.0% by week 12, holding throughput ≥ 26 units per hour. *Provisional until Tollgate 2.* |
| **Start / stop** | Racked parts enter the pretreatment wash → part passes or fails station 2 inspection |
| **In scope** | Coating line 2, B-series brackets, day and evening shifts |
| **Out of scope** | Line 1; powder supplier qualification; oven replacement; the night-shift cleanup crew's procedures |
| **Constraints** | No capital spend this quarter; no change to the powder specification without customer approval |
| **Team** | Sponsor: plant operations manager · Process owner: coating line supervisor · Green Belt: quality engineer · Members: one line operator from each shift, maintenance technician · Finance partner: plant cost accountant |
| **Timeline** | Cohort calendar; pilot planned for weeks 8–10; handover target week 11; closure target week 14 |

### 2.2 HC — Reduce discharge order-to-departure time on the medical-surgical unit

| | |
|---|---|
| **Problem statement** | On the 32-bed medical-surgical unit, the time from a signed discharge order to the patient leaving the unit has a median of 214 minutes and a 90th percentile of 410 minutes (8 weeks, n = 396 discharges to home, weekdays and weekends), against a hospital target of 120 minutes. Late departures hold beds that the emergency department needs; the ED boarded a median 3 admitted patients per weekday afternoon over the same period. |
| **Business case** | Bed hours released to the ED; the hospital's admitted-patient boarding time is a board-reported quality measure. No money is claimed; the mission metric is validated by the director of nursing. |
| **Primary metric** | Discharge order-to-departure time |
| **Operational definition** | Minutes from the timestamp of the signed discharge order in the EHR to the departure timestamp entered by the unit clerk when the patient leaves the unit, per patient discharged to home or self-care. Discharges to skilled nursing or rehabilitation facilities are excluded (transport-dependent). Timestamps are system-recorded; the MSA question is whether the clerk's departure entry matches observed departure (attribute agreement on a sample of 30). |
| **Basis / data type** | Per patient; continuous (minutes); calendar time; I-MR chart on daily median, box plots by day of week |
| **Baseline** | Median 214 min, 90th percentile 410 min (8 weeks) — re-stated at Tollgate 2 after the clerk-entry check |
| **Guardrail** | 7-day unplanned readmissions for the unit (rate per 100 discharges) not worse than baseline; discharge-instruction item on the patient survey not worse |
| **Customer and CTQ** | Patient (external) and ED charge nurse (internal): patient leaves within 120 minutes of the order with completed instructions; target from the hospital's throughput standard |
| **Goal** | Reduce median order-to-departure time from 214 to ≤ 150 minutes by week 12 with the 7-day readmission rate unchanged. *Provisional until Tollgate 2.* |
| **Start / stop** | Discharge order signed in the EHR → patient leaves the unit |
| **In scope** | Unit 4 discharges to home or self-care, all days, all shifts |
| **Out of scope** | Facility discharges; ED boarding process itself; bed cleaning after departure; physician rounding order |
| **Constraints** | No change to medication reconciliation policy; no additional staff |
| **Team** | Sponsor: director of nursing · Process owner: unit nurse manager · Green Belt: unit quality nurse · Members: charge nurse, case manager, unit pharmacist, unit clerk · Mission-metric validator: director of nursing (sponsor also holds the executive metric; the chief nursing officer countersigns) |
| **Timeline** | Cohort calendar; pilot on weekdays for 3 weeks from week 8; handover week 11; closure week 15 |

### 2.3 TXN — Reduce new-account applications returned to branches

| | |
|---|---|
| **Problem statement** | Across the bank's 12 branches, 18.4% of personal checking and savings applications sent to the operations center are returned to the branch for missing or inconsistent information (12 weeks, ≈ 260 applications per week, n = 3,140), against a service standard of 5%. A returned application adds a median 2.6 calendar days to account opening and a second customer contact; returns are the top reason for account-opening complaints this year. |
| **Business case** | ≈ 48 returns per week × ≈ 25 minutes of branch and operations rework each ≈ 20 staff-hours per week (soft benefit unless a budget line moves); complaint handling costs and lost deposits not yet quantified. Finance partner to state the basis at Tollgate 2. |
| **Primary metric** | Application return rate |
| **Operational definition** | Applications given a return code in the workflow system by an operations-center processor, divided by applications received by the operations center, per week. Any return code counts; an application returned twice counts once in the numerator and once in the denominator. Data from the weekly workflow extract. The MSA question is whether processors apply return codes consistently (attribute agreement, 3 processors × 40 applications). |
| **Basis / data type** | Per week; defectives (pass/fail); p chart |
| **Baseline** | 18.4% (12 weeks) — re-stated after the processor agreement study |
| **Guardrail** | Operations-center processing time per accepted application (median minutes) not worse; no increase in post-opening corrections |
| **Customer and CTQ** | New account holder (external): account open within 2 business days of signing, with no second visit; standard from the retail service charter |
| **Goal** | Reduce the return rate from 18.4% to ≤ 9% by week 12, with processing time per accepted application unchanged. *Provisional until Tollgate 2.* |
| **Start / stop** | Customer signs the application at the branch → operations center accepts or returns it |
| **In scope** | Personal checking and savings applications; all 12 branches; paper and tablet capture |
| **Out of scope** | Business accounts; online self-service applications; operations-center processing after acceptance; the core banking system release scheduled for next quarter |
| **Constraints** | No change to identity-verification requirements; workflow system configuration changes only through the IT change process |
| **Team** | Sponsor: head of retail banking operations · Process owner: operations-center manager · Green Belt: branch operations analyst · Members: two branch service representatives, one operations processor, workflow system administrator · Finance partner: finance business partner, retail |
| **Timeline** | Cohort calendar; pilot in 3 branches for 4 weeks from week 8; handover week 12; closure week 16 |

---

## 3. Charter smells — check before you ask for a signature

A smell is not a failure. It is a sign that the charter will cost you a tollgate later. Fix it
now, in the clinic, while it is cheap.

| Smell | What it looks like | Why it costs you later |
|---|---|---|
| **Solution in the title** | "Implement a discharge checklist"; "Install a second gauge" | The countermeasure is chosen before the cause is verified; A3 fails by design |
| **Cause in the problem statement** | "…because staff skip the second check" | The team stops investigating; the person named stops talking |
| **"Lack of…"** | "Lack of training", "lack of a system" | A solution wearing a problem costume; nobody can measure a lack |
| **Metric without an operational definition** | "Turnaround time"; "error rate" | Two people collect two different numbers; before and after become incomparable (I3) |
| **Percentage without a denominator** | "Reduce returns by 50%" | 50% of what, per what period? Nobody can tell whether it happened |
| **Target set before the baseline, unlabeled** | "From 12% to 6%" with no period, no n, no source | The target becomes a promise the data has not agreed to; label it provisional |
| **Stop point outside the sponsor's authority** | Scope ends in another department's process | The sponsor cannot approve the countermeasure; the project stalls at Tollgate 4 |
| **No guardrail** | Only the primary metric is named | The improvement is bought by making something else worse, and nobody measured it |
| **A rare process** | The event happens twice a month | Eight weeks yields four data points; there is no baseline chart and no test |
| **No data and no way to get any in two weeks** | "We will ask IT for an extract" with no date | Measure has nothing to measure; Tollgate 2 becomes a hold |
| **Team of one** | Only the Green Belt is named | The people who work the process are not in the room; the map is the documented process, not the observed one (M1) |
| **Sponsor is not the process owner's manager** | The sponsor cannot direct the process owner | Handover has no authority behind it; the control plan is nobody's (C1) |
| **The Green Belt does not touch the process** | A project in another building | Access, trust and observation time all suffer; go see is a plane ticket |
| **Multi-site scope** | "All 12 branches" as the pilot | Pilot before roll-out; scope the study to where you can observe and control |
| **The project is a system implementation** | "Go live on the new ERP module" | Not DMAIC; there is no cause to verify and the metric is "did it go live" |
| **Savings stated before analysis** | "$120K annual savings" in the business case | Anchors Finance and the sponsor to a number nobody derived; state the cost of the gap, not the savings of the fix |
| **"Increase awareness" as the goal** | Any goal without a measurable shift | Cannot be evidenced; not a Green Belt project |
| **Timeline of "when it is ready"** | No dates against the tollgates | Tollgates are on the calendar, not on the project's mood |
| **Charter written alone** | Sponsor sees it first at signature | The sponsor signs a document rather than a commitment; expect a re-scope at Tollgate 1 |

Two checks a coach runs on every charter in the week 1 clinic: read the problem statement aloud
to someone who disagrees about the cause — can they sign it? — and hand the operational
definition to someone who has never seen the process — do they collect your number?

---
*v1.0 · 2026-09-20*
