# Green Belt Exam Bank — Section E: Control

Part of the Green Belt certification item bank. Blueprint, minimally competent candidate
statement, tag format and pool rules: [`../exam-bank.md`](../exam-bank.md). Governing policy:
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).
Project-side requirements these items assess against: [`../project/review-rubric.md`](../project/review-rubric.md)
(Control items C1–C3, mandatory ★ C1).

Section E draws **12 items per form** from the **42 CERT items** below. Objective **G7** —
control plan, handover, financial validation, closure. Tag format
`[section · objective · Bloom · vertical · type · pool]`; correct option ✅; rationale after the
dash. Exhibits (type X) precede the stem as a small table or a fenced block of software-style
output. All monetary figures are illustrative; every quantity states its units and basis.

---

## Section E — Control: control plans, SPC in sustainment, standard work, response plans, closure, financial validation (42 CERT)

**E1.** A Green Belt submits this control plan for a discharge lead-time project on a 32-bed medical unit.

| Process step | Metric | Operational definition | Method | Frequency | Owner | Response plan |
|---|---|---|---|---|---|---|
| Discharge order → bed vacant | Discharge lead time | Minutes from discharge-order timestamp to bed status "vacant" in the bed-management system | I-MR chart; limits from post-change weeks 1–4 | Every discharge; chart read at the 15:00 huddle | Unit nurse manager (named) | — |
| Discharge medications ready | % discharges with meds ready before order | Meds "ready" flag timestamp earlier than order timestamp | p chart, daily subgroup | Daily | Pharmacy supervisor (named) | "Escalate" |

Against rubric item ★ C1, what stops this plan from earning the item?
A. The first row should use an X̄-R chart, not I-MR · B. Reading the chart once a day is too infrequent for a nurse manager · C. Neither row has a response plan that names an action and who takes it — "Escalate" names neither ✅ · D. The Green Belt, not the nurse manager, should be the owner until the day-90 check
`[E · G7 · Analyze · HC · X · CERT]` — Metric, method, frequency and a named owner are present; the missing element is the response plan; A is wrong because one value per discharge is individual data and I-MR is the right chart.

**E2.** The "method" column of a control plan exists so that:
A. Whoever inherits the process can see it the same way you did — the instrument or data source, the chart type and where its limits came from ✅ · B. The countermeasure that was implemented is on record · C. The customer's specification is visible on the shop floor · D. Auditors know when the standard work is checked
`[E · G7 · Understand · NEU · K · CERT]` — The countermeasure is recorded in the Improve documentation; the control plan's job is to tell a stranger how to keep watching the process, which B confuses with what changed.

**E3.** A Green Belt verified with a chi-square test that torque tools whose calibration interval had drifted past 4 weeks accounted for most loose-fastener defects on an assembly line. The draft control plan monitors only the loose-fastener rate from final audit, on a monthly p chart. The best improvement to the plan is to:
A. Move the p chart from monthly to weekly · B. Add rework hours as a second output metric · C. Replace the p chart with a c chart · D. Add the verified input — calibration interval, checked against the 4-week limit at every calibration by the tool-crib lead — so drift is caught before defects are made ✅
`[E · G7 · Apply · MFG · S · CERT]` — A control plan controls the X the project verified, not only the Y; A still sees defects only after they exist, just sooner.

**E4.** The accounts-payable baseline defined an invoice error as "any invoice returned by AP for correction after approval" (9.8% of invoices, n = 3,120, one quarter). The AP supervisor drafts the control plan with "invoice error = any invoice rejected at the first automated AP screen," because that count is produced automatically. The new sustainment chart shows 3.1%. What can you conclude about the improvement?
A. It is a 6.7-percentage-point reduction and can go to Finance · B. Nothing yet — the operational definition changed between before and after, so the two rates are not comparable; keep the baseline definition on the sustainment chart and add the automated count as a second metric if it is useful ✅ · C. The automated definition is better because it removes judgment, so restate the baseline using it · D. Report the average of the two rates until a full quarter of new data exists
`[E · G7 · Analyze · TXN · S · CERT]` — Same metric, same operational definition, same collection method is the rule for before/after and for sustainment; C would require reconstructing a baseline that was never collected under the new definition.

**E5.** One row of a control plan for a bored housing:

```
Metric:     Bore diameter (mm)
Method:     X̄-R chart, n = 5 bores every hour
Limits:     LCL 24.98   UCL 25.02   (drawing tolerance 25.00 ± 0.02 mm)
Response:   Stop and adjust the boring bar when a subgroup mean is outside the limits
```

The defect in this row is that:
A. It uses the specification limits as chart limits; control limits must be computed from the process's own subgroup data, and adjusting to specification limits will either miss real shifts or cause tampering ✅ · B. Five bores per subgroup is too many for an X̄-R chart · C. The X̄ chart should plot individual bores rather than subgroup means · D. Nothing — tolerance-based limits keep the operator focused on the customer
`[E · G7 · Analyze · MFG · X · CERT]` — Specification limits describe what the customer needs; control limits describe what the process does, and only the second can tell you the process changed; D is the seductive one because it sounds customer-focused.

**E6.** The right monitoring frequency in a control plan is set by:
A. Whatever frequency the existing reporting system already produces · B. Monthly, because that is when the sponsor reviews results · C. As often as physically possible, to maximize the data · D. How fast the process can drift and how quickly the response plan can act — often enough that a drift is caught and contained before it reaches the customer ✅
`[E · G7 · Understand · NEU · K · CERT]` — A is the common failure mode: a monthly report cadence rarely matches the speed at which a process drifts.

**E7.** A control plan for an outpatient-clinic check-in process names the owner as "the check-in improvement team." The team disbands at closure. The correct fix is to:
A. Keep the team on standby for the day-90 check · B. Name the role that runs the process every day — the clinic office manager — and have that person sign the plan after running the chart and the response plan with you ✅ · C. Name the sponsor, the clinic medical director, because they have the authority to act · D. Name the Green Belt, who knows the project best
`[E · G7 · Apply · HC · S · CERT]` — Ownership belongs to whoever sees the process and can act inside the response window; the sponsor in C has authority but does not see the chart daily.

**E8.** A small-business lending team decides about four loan applications a day. Each application produces one value: working hours from receipt to decision, recorded by the analyst who decides it. The team lead wants a sustainment chart updated as each decision is made. The chart to use is:
A. A p chart of the proportion of applications over 8 working hours · B. An X̄-R chart with each week's applications as one subgroup · C. An I-MR chart of each application's decision time, in working hours ✅ · D. A c chart of applications decided per day
`[E · G7 · Apply · TXN · S · CERT]` — Low-volume individual measurements belong on I-MR; B is the nearest alternative but a week-long subgroup delays every signal by a week and averages away the shifts the plan is meant to catch.

**E9.** Daily invoice processing at a shared-service center, first week after handover:

| Day | Invoices processed | Invoices with one or more errors |
|---|---|---|
| Mon | 212 | 9 |
| Tue | 148 | 6 |
| Wed | 305 | 14 |
| Thu | 96 | 3 |
| Fri | 260 | 10 |

The sustainment chart for this metric is:
A. A p chart of the proportion of invoices with errors per day, with limits computed for each day's volume ✅ · B. An np chart of the count of invoices with errors per day · C. A c chart of errors per day · D. An I-MR chart of the daily count of invoices with errors
`[E · G7 · Apply · TXN · X · CERT]` — Subgroup size varies from 96 to 305, which rules out np; the count is of defective invoices, not of defects, which rules out c.

**E10.** A 28-bed inpatient unit tracks patient falls. Occupancy varies from month to month and a patient can fall more than once. The control plan metric is falls per 1,000 patient-days by month. The chart to use is:
A. A p chart of the proportion of patients who fell · B. An np chart of monthly falls · C. An I-MR chart of the monthly count of falls · D. A u chart — events per unit of exposure, with patient-days as the varying area of opportunity ✅
`[E · G7 · Apply · HC · K · CERT]` — Falls are events, not defective items, and the denominator is exposure; C ignores that a 30% swing in patient-days changes the expected count.

**E11.** Sustainment chart for a changeover-time project, described from the software output:

```
I chart — changeover time, line 3 (minutes per changeover)
Limits frozen from 25 post-change changeovers (weeks 1–3 after handover)
Centre 31.4   UCL 47.9   LCL 14.9
Weeks 4–9: 38 further changeovers plotted
Test 1 (1 point beyond 3σ):                    none
Test 2 (9 in a row on one side of centre):     points 51–59, all above centre
Test 3 (6 in a row steadily increasing):       none
Test 5 (2 of 3 beyond 2σ, same side):          points 57, 58
Pre-project baseline mean: 52 minutes
```

What should the process owner conclude?
A. Every point is inside the limits, so no action is needed · B. The process has shifted upward — the run above centre and the 2-of-3 signal show a special cause drifting changeover time back toward the old 52-minute level; run the response plan now ✅ · C. The improvement has been lost and the project should be reopened · D. Recalculate the limits from weeks 4–9 so the run rule stops firing
`[E · G7 · Analyze · MFG · X · CERT]` — A reads "no Test 1" as "in control"; the run rules exist to catch drift before a single point breaks 3σ; C is premature because the run is a drift to act on, not a lost improvement, and D would hide the signal.

**E12.** After the countermeasure goes live, a Green Belt keeps plotting new points on the baseline chart with the baseline limits. The first 15 post-change points all sit below the baseline lower control limit. The owner asks what to do with the limits. Best answer:
A. Keep the baseline limits so the improvement stays visible on the chart · B. Widen the limits until the new points fit inside them · C. Once the changed process has enough data — around 20–25 points or subgroups with no signals — recalculate the centre and limits from post-change data only and freeze them for sustainment; keep the baseline chart as before/after evidence ✅ · D. Replace the control limits with the customer's specification limits
`[E · G7 · Analyze · NEU · S · CERT]` — A keeps limits that describe a process that no longer exists, so drift inside the new process is invisible until it reaches the old level.

**E13.** Fill-weight sustainment chart, described from the software output:

```
X̄-R chart — fill weight (g), 5 bottles every 30 min, limits frozen from 30 post-change subgroups
R chart:  centre 1.8   UCL 3.8   LCL 0
          subgroup 14: R = 4.6    subgroup 15: R = 5.1   (both above UCL)
X̄ chart: centre 502.1   UCL 503.2   LCL 501.0
          all subgroup means within limits; no run-rule signals
```

The line lead says "the means are fine, no action." The right response is:
A. Act now — the R chart is read first: within-subgroup variation has jumped at subgroups 14–15, and the X̄ limits are only valid while R is in control; find what changed around subgroup 14 ✅ · B. Agree — the customer sees the mean, not the range · C. Recompute the X̄ limits using the new, larger average range · D. Switch to an I-MR chart so the range signal disappears
`[E · G7 · Analyze · MFG · X · CERT]` — B mistakes "the mean is on target" for "the process is stable"; the range chart signals first because X̄ limits are built from R̄.

**E14.** A Green Belt proposes an I-MR chart of the monthly average call-handling time (one point per month, seconds, working days only) as the sustainment chart for a contact-center project. This is a poor choice because:
A. Monthly averages violate the normality assumption of an I-MR chart · B. An I-MR chart needs at least 50 points before it can be read · C. Averages can never be plotted on a control chart · D. One point a month means a drift takes months to signal and the response plan cannot act within its window, and the chart cannot even have limits for nearly two years; plot weekly (or daily) values instead ✅
`[E · G7 · Analyze · TXN · S · CERT]` — B invents a threshold; the real problem is detection speed relative to the response window, not the arithmetic of the chart.

**E15.** Sustainment chart for a claims-intake project:

```
p chart — claims with missing documentation, per working day
Subgroup size n varies 60–340 claims/day; limits computed for each day
p̄ = 0.042
Day 22:  n = 64    7 missing-doc claims    p = 0.109    UCL for n = 64  = 0.117
Day 23:  n = 310   24 missing-doc claims   p = 0.077    UCL for n = 310 = 0.076
```

Which day is a signal?
A. Day 22 — it has the highest proportion · B. Both days · C. Day 23 only — its proportion exceeds the limit for its own subgroup size; day 22's high proportion is inside the wider limit a small subgroup gets ✅ · D. Neither — both are within one point of p̄
`[E · G7 · Analyze · TXN · X · CERT]` — A reads the largest proportion as the signal and ignores that a p chart's limits widen as n shrinks.

**E16.** Emergency-department sustainment chart, eight weeks after handover:

```
I chart — minutes from ED arrival to first provider contact, daily median
Limits frozen from 24 post-change days:  centre 28   UCL 46   LCL 10
Days 41–52: 12 consecutive points below centre (lowest 16)
Owner's note, day 40: "started a nurse-first triage trial on my own"
```

What should the Green Belt advise?
A. Ignore it — the run is in the improving direction · B. Treat the run as the special cause it is: the owner's change is documented and desirable, so verify it, write it into the standard work, and recalculate the limits from data after day 40 ✅ · C. Ask the owner to stop the trial because it was not part of the project · D. Keep the current limits so the improvement stays visible
`[E · G7 · Analyze · HC · X · CERT]` — A treats a good-direction signal as noise; it is still a process change that has to be understood and locked in, or it will drift away as quietly as it arrived.

**E17.** Response plan submitted with a control plan for a mortgage-document-checking process:

| Trigger | Action | Owner | By when |
|---|---|---|---|
| A point outside the control limits | Investigate | Team | — |
| Eight points in a row on one side of centre | Review | Team | — |

What is missing?
A. A trigger for the 2-of-3 beyond 2σ rule · B. An escalation step to the sponsor · C. A budget for corrective action · D. A named owner and a real action — each row needs the person or role who acts, the immediate containment step, and a time bound ✅
`[E · G7 · Analyze · TXN · X · CERT]` — B is part of a complete plan, but a plan whose first line is "Team" and "Investigate" has no first responder; that is the failure mode that leaves the signal unanswered.

**E18.** Who should own the response plan for a machining cell's sustainment chart?
A. The cell team lead — the person present when the signal appears, with authority to stop and contain ✅ · B. The Green Belt who built the chart · C. The quality engineer who reviews the charts every Friday · D. The plant manager, who can authorize any spend
`[E · G7 · Apply · MFG · S · CERT]` — C is the closest alternative, but a signal reviewed on Friday is up to a week old before anyone acts.

**E19.** A response plan for medication reconciliation reads "when reconciliation errors seem high, the charge nurse reviews the process." The trigger should be replaced with:
A. Any single error · B. Any concern raised by the sponsor · C. A chart rule on the sustainment chart — a point beyond a control limit or a run of eight on one side of centre ✅ · D. A decision at the monthly quality meeting
`[E · G7 · Apply · HC · S · CERT]` — A reacts to every error, which is tampering with common cause; the trigger has to distinguish signal from noise, and only the chart does that.

**E20.** A complete response plan entry contains:
A. Trigger, root cause, countermeasure and cost · B. Trigger, immediate containment action, named owner, escalation path and a time bound ✅ · C. Metric, specification limit, audit date and sponsor · D. Fishbone, cause-and-effect matrix and pilot plan
`[E · G7 · Remember · NEU · K · CERT]` — A describes the analysis that follows a signal, not the plan for the moment the signal appears.

**E21.** Paint-line sustainment record, eight weeks after handover:

```
I chart — paint film thickness (µm), one panel per hour
Weeks 1–4: centre 62.0   UCL 68.5   LCL 55.5; no signals; average moving range 2.4 µm
Owner's adjustment log, weeks 5–8: "Turned gun pressure down whenever a reading was
  above 62; up whenever below" — 31 adjustments
Weeks 5–8: 4 points beyond the limits (2 high, 2 low); average moving range 4.1 µm
```

The most likely explanation:
A. The spray gun is wearing and needs replacement · B. The owner is not adjusting often enough · C. The limits are too tight for this process and should be widened · D. The owner is tampering — adjusting to common-cause variation around the centre line — and has roughly doubled the variation; the response plan must trigger on chart rules only ✅
`[E · G7 · Analyze · MFG · X · CERT]` — A is possible in isolation, but the log explains the pattern: 31 adjustments made against the centre line, not against a signal, is Deming's funnel experiment on a paint line.

**E22.** A Green Belt writes the new standard work for discharge medication reconciliation alone from the pilot notes. The night-shift nurses say the sequence does not fit how handover works at 19:00. The right move is to:
A. Rewrite it with nurses from each shift who do the work, observing the actual sequence, and pilot the document on every shift before the owner signs ✅ · B. Issue it as written and audit adherence · C. Add a night-shift appendix written by the Green Belt · D. Drop the standard work and rely on the checklist
`[E · G7 · Apply · HC · S · CERT]` — C repeats the design decision that caused the mismatch: a document written away from the work; the people doing the work are the authors, and the rubric (C2) scores their involvement.

**E23.** Standard work for a process step contains:
A. The organization chart and the escalation path · B. The sustainment control chart and its limits · C. The sequence of steps, the key points that make each step succeed (quality, safety, technique) and the reason for each key point, with expected timing where it matters ✅ · D. The project charter and the verified root cause
`[E · G7 · Understand · NEU · K · CERT]` — B is the control plan's content; standard work is the method, written so the reason for each key point travels with it.

**E24.** A molding team verified that incoming resin moisture, varying by supplier lot, explains most short shots (one-way ANOVA across lots, large effect). They propose new operator standard work as the countermeasure. Why is that the wrong tool here?
A. Operators will not follow it · B. The verified cause is an input the operator does not control; standard work standardizes the operator's method and cannot remove variation from the input — the countermeasure must act on the input (dryer verification, incoming moisture check), with standard work only as the method for that check ✅ · C. Standard work is a Black Belt tool · D. Standard work applies only to transactional processes
`[E · G7 · Analyze · MFG · S · CERT]` — Standard work has a role — the incoming check — but aiming it at the operator answers a cause the project did not verify.

**E25.** The new standard for account-opening checks exists as a 14-page procedure in the document-control system. An adherence audit finds that 40% of clerks skip step 6 (the address-verification cross-check). Best response:
A. Retrain all clerks on the procedure · B. Add a sign-off line for step 6 · C. Audit adherence weekly instead of monthly · D. Build a one-page visual version at the point of use with the clerks, giving step 6's key point and its reason; keep the 14-page document as the controlled reference ✅
`[E · G7 · Apply · TXN · S · CERT]` — A treats a design decision (14 pages in a system nobody opens mid-task) as a people problem; the clerks are responding rationally to where the standard lives.

**E26.** In week 8 the Green Belt offers to keep updating the sustainment chart and email it to the unit manager each week "so nothing slips." The reviewer should expect:
A. Exactly that — the Green Belt is the most reliable person to keep the chart · B. The sponsor to take over the chart, since the sponsor owns results · C. A handover: the unit manager (or a designated charge nurse) updates and reads the chart, signs the control plan, and the Green Belt steps back to a scheduled check ✅ · D. The chart automated so nobody needs to own it
`[E · G7 · Apply · HC · S · CERT]` — Rubric ★ C1 requires the process owner's signature on a plan they run; a chart the owner has never updated has not been handed over, and D removes the reading, not the need for it.

**E27.** The handover meeting for a kitting-cell project should include:
A. The owner walking the process against the standard work, updating the chart with today's data, and rehearsing the response plan on a simulated signal ✅ · B. The Green Belt presenting the tollgate deck · C. The sponsor signing the control plan · D. Emailing the control plan, chart file and standard work to the owner
`[E · G7 · Apply · MFG · S · CERT]` — C confuses authority with ownership; the plan is signed by the person who will run it, and a rehearsal is how you know they can.

**E28.** A Green Belt submits the project for review in week 8. The control plan is drafted, the process owner is named, and monitoring starts next month. The reviewer's correct decision on ★ C1 is:
A. Award the item — every element of the plan is present · B. Withhold the item until monitoring has been live for at least 30 days; the project can be resubmitted inside the six-month completion window ✅ · C. Fail the project outright · D. Award half the points for a complete draft
`[E · G7 · Apply · NEU · S · CERT]` — Mandatory items are earned on evidence, not intention, and are not partial (D); C is wrong because the completion window exists for exactly this situation.

**E29.** Closure checklist for a purchase-order-correction project, presented to the sponsor:

| Closure item | Status |
|---|---|
| Before/after evidence, same operational definition | Done — 10 weeks post-change on the chart |
| Control plan signed by the process owner | Done — monitoring live 5 weeks |
| Standard work at the point of use | Done |
| Benefit classified and validated | Claimed $118,000/yr hard savings; Finance review "pending" |
| Lessons learned recorded | Done |

The sponsor wants to close today. What blocks closure?
A. The control plan has to be live 60 days before closure · B. Nothing — every item is done or in progress · C. Lessons learned should be delivered as a presentation · D. The hard-savings figure is unvalidated — close with the benefit recorded as "pending Finance validation," or wait; a hard-savings number does not enter the closure record until Finance signs ✅
`[E · G7 · Analyze · TXN · X · CERT]` — A confuses the thresholds: 30 days live is the submission bar, 60 days is for the `sustained` flag at day 90.

**E30.** A discharge-before-noon project set a target of 40%. The verified result is 29% from an 18% baseline, stable over 8 weeks with the control plan live. The sponsor asks whether to close. Best answer:
A. Keep the project open until 40% is reached · B. Close it and report it as a failed project · C. Close honestly — record the verified shift (18% → 29% of discharges before noon), the gap to target, what the data say is left, and the next step (a follow-on project or the owner's PDCA); the rubric passes a documented partial result ✅ · D. Revise the target to 29% so the project meets it
`[E · G7 · Analyze · HC · S · CERT]` — D changes the goal after the fact; A keeps a bounded project open indefinitely when the remaining gap is a different piece of work.

**E31.** The closure record for a Green Belt project consists of:
A. The final A3 or one-pager, the before/after chart, the signed control plan, the location of the standard work, the benefit classification with Finance sign-off where money is claimed, lessons learned, and open items assigned to a named owner ✅ · B. The tollgate slide deck and the team's recognition note · C. The raw datasets and the analysis files · D. The signed charter and the sponsor's attestation
`[E · G7 · Understand · NEU · K · CERT]` — D is the beginning and the attestation of the project, not its record; the A3 or storyboard is the record, not a deck (B).

**E32.** A medication-delivery project frees about 0.4 FTE of nurse time on one unit (about 16 hours/week, measured over 8 weeks). Headcount, overtime and agency hours are unchanged. This benefit is classified as:
A. Hard savings · B. Soft — capacity freed with no change to a budget line; it becomes hard only when Finance confirms a budget change, such as reduced agency hours ✅ · C. Cost avoidance · D. Revenue
`[E · G7 · Apply · HC · K · CERT]` — C applies to a cost that was going to be incurred and now will not be; nothing here was planned to be spent.

**E33.** A claims backlog improvement absorbs the volume growth for which a two-person hire had been approved but not yet made. The hire is cancelled. The benefit is classified as:
A. Hard savings · B. Soft savings · C. Revenue · D. Cost avoidance — an approved expense not yet incurred that now will not be ✅
`[E · G7 · Apply · TXN · K · CERT]` — A is wrong because nothing left the current budget; the salaries were never paid.

**E34.** Benefit calculation from a bottleneck-throughput project:

```
Bottleneck throughput:      118 → 131 units/h  (verified over 9 weeks, X̄ chart)
Extra units per year:       13 units/h × 6,000 run-hours/yr = 78,000 units
Selling price:              $42 per unit
Annual benefit claimed:     78,000 × $42 = $3,276,000   (classified: hard — revenue)
```

The error is:
A. Revenue is counted at full selling price; the benefit of an extra unit is its contribution margin (price minus variable cost), and only for units that are actually sold — demand must be confirmed with Sales and Finance before anything is claimed ✅ · B. Run-hours should be 8,760 · C. The throughput gain should be averaged over 12 months before annualizing · D. Nothing — Finance will apply the margin
`[E · G7 · Analyze · MFG · X · CERT]` — B substitutes calendar hours for the stated run-hours basis; D leaves a $3.3 million figure in circulation that Finance will cut by most of its value.

**E35.** A fall-prevention project reduces falls from 5.1 to 2.9 per 1,000 patient-days (verified, u chart, 6 months). This benefit is classified as:
A. Hard savings · B. Revenue · C. Clinical or service impact — reported in its own unit; monetized only with a Finance-agreed method (for example, avoided cost per fall with injury) and then as cost avoidance, never as hard savings ✅ · D. Soft savings
`[E · G7 · Understand · HC · K · CERT]` — D is the nearest wrong answer; soft savings describe freed capacity, and a clinical outcome is neither capacity nor money until Finance agrees on a method.

**E36.** Benefit calculation from an invoice-rework project:

```
Rework eliminated:        46 invoices/week × 18 min each = 13.8 h/week
Fully loaded labor rate:  $48/h  (Finance's published rate)
Annual benefit:           13.8 h × $48 × 52 weeks = $34,445  (Finance annualizes on 52 weeks)
Classification:           Hard savings
Headcount / overtime change since go-live: none
```

The error is:
A. The annualization should use 50 working weeks · B. The classification — time freed with no headcount or overtime change is soft (capacity), not hard; the arithmetic is right, the label is wrong ✅ · C. The rate should be base salary, not fully loaded · D. The minutes should be converted at 50-minute productive hours
`[E · G7 · Analyze · TXN · X · CERT]` — A would only change the number, and the stem states Finance's 52-week convention; the error is calling capacity a budget change.

**E37.** Benefit claim from a scrap-reduction project on molding line 2:

```
Baseline scrap (Jan–Mar):    4.8% of 60,000 units/quarter = 2,880 units
Post-change (Jul–Sep):       2.1% of 60,000 = 1,260 units
Reduction claimed:           1,620 units/quarter × $31 material and labor = $50,220/quarter
                             → $200,880/yr hard savings
Note in the project file: a separate Black Belt die-replacement project on line 2
closed in May; its closure claimed scrap 4.8% → 3.0%.
```

The error is:
A. Quarterly savings should be multiplied by 4 — they were · B. Unit cost should be the selling price · C. The post-change period is too short · D. Double counting — the die project already claimed the 4.8% → 3.0% portion; this project's baseline must be the post-die-change rate, so its claim is 3.0% → 2.1% = 540 units/quarter ≈ $16,740/quarter ✅
`[E · G7 · Analyze · MFG · X · CERT]` — C is defensible on its own but is not the error asked for; a quarter of stable post-change data is acceptable, whereas claiming a reduction another project already booked is not.

**E38.** Annualization of an emergency-department re-visit project:

```
Metric:                    Avoidable ED re-visits within 72 h of discharge
Pilot period:              June–July, 8 weeks; ED volume during pilot 1,520 visits/week (summer peak)
Re-visit rate:             3.4% → 2.2%  (verified, p chart)
Avoided re-visits/week:    0.012 × 1,520 = 18.2
Annualized:                18.2 × 52 = 949 avoided re-visits/yr   (Finance annualizes on 52 weeks)
Annual ED volume, last 12 months (Finance): 71,000 visits
```

The error is:
A. The annualization extrapolates the summer weekly volume; on Finance's annual volume the estimate is 0.012 × 71,000 ≈ 852, and the rate itself has not been shown to hold in winter, so the figure is a projection until 12 months of data exist ✅ · B. Fifty working weeks should be used instead of 52 · C. The pre-change rate should be re-measured in winter before anything is claimed · D. Nothing — a verified rate multiplied by 52 is the standard method
`[E · G7 · Analyze · HC · X · CERT]` — D is the trap: the rate is verified but the volume basis is not; C would delay honest reporting when a stated projection on the right basis is the answer.

**E39.** Finance reviews a Green Belt's benefit claim and says the $48/h fully loaded rate should be $31/h direct labor and the class should be soft, not hard. The Green Belt should:
A. Argue for the fully loaded rate, which is standard in the training material · B. Keep the original figure in the report and note Finance's view in a footnote · C. Use Finance's rate and classification — Finance owns the method — report the figure Finance signs, and record the freed hours as the operational measure ✅ · D. Ask the sponsor to overrule Finance
`[E · G7 · Apply · NEU · S · CERT]` — B produces two numbers for one project; the closure record carries only the validated one, and the hours remain real whichever rate is applied.

**E40.** The annualization basis for a Green Belt project's benefit is:
A. Twelve months from the project start date, at the pilot's run rate · B. Twelve months forward from the date the change went live, at the volume Finance uses for the year, net of one-time implementation cost and any continuing cost, and labeled a projection until 12 months of post-change data exist ✅ · C. The baseline period, restated at the improved rate · D. Whatever period the team and sponsor agree makes the case
`[E · G7 · Understand · NEU · K · CERT]` — A counts months before the change existed; C uses a period that may not represent the coming year's volume.

**E41.** Day-90 sustainment check on a customer-refund project. The sponsor replies "still going great." The reviewer finds the sustainment chart was last updated on day 45; the process owner changed roles on day 50 and nobody was named to replace them. The reviewer should record:
A. Not sustained — monitoring lapsed; the control plan did not hold because the chart and response plan stopped, whatever the sponsor's impression; offer the sponsor a re-handover to a new owner ✅ · B. Sustained, on the sponsor's attestation · C. Sustained, provided the last plotted points were below the baseline · D. Reopen the project and withdraw the certification
`[E · G7 · Analyze · TXN · S · CERT]` — C mistakes a snapshot for sustainment; the `sustained` flag says the monitoring and response system is alive, not that the metric looked good on the day it stopped.

**E42.** Day-90 sustainment check on a first-pass-yield project:

```
p chart — line 4 defective rate, daily, n ≈ 400 units/day
Limits frozen day 30:  p̄ = 0.031;  all days plotted through day 90
Signals:  day 61 above UCL (p = 0.058)
Response log, day 61 (cell lead): "New operator on station 3 — paired with trainer,
  2-h containment sort of that day's output; back inside limits day 62;
  standard work reviewed with the operator"
Days 62–90: no signals; centre unchanged
Pre-project baseline: p̄ = 0.089
```

The reviewer's conclusion for the `sustained` flag:
A. Not sustained — a signal occurred after handover · B. Recalculate the limits without day 61 before deciding · C. Sustained only if the response log is confirmed by the sponsor · D. Sustained — the control plan held: the signal was detected, the named owner ran the response plan within its window, the process returned to its post-change level, and monitoring continued to day 90 ✅
`[E · G7 · Analyze · MFG · X · CERT]` — A confuses sustainment with the absence of signals; a control plan is judged by what happens when a signal appears, and B would remove an inconvenient point.

<!--
Section E tallies (42 items)
Key position:  A 11 (E2 E5 E9 E13 E18 E22 E27 E31 E34 E38 E41) · B 10 (E4 E7 E11 E16 E20 E24 E28 E32 E36 E40) · C 10 (E1 E8 E12 E15 E19 E23 E26 E30 E35 E39) · D 11 (E3 E6 E10 E14 E17 E21 E25 E29 E33 E37 E42)
Type:  S 17 (40%) · X 15 (36%) · K 10 (24%)
Bloom: Remember 1 · Understand 6 · Apply 15 · Analyze 20 → Apply/Analyze 35 (83%)
Vertical: MFG 11 · HC 11 · TXN 11 · NEU 9
Negative stems: 0
"When not to use" coverage: baseline limits after a change (E12), specification limits as chart limits (E5), np vs p (E9), p/I-MR vs u for exposure-based events (E10), weekly subgroups vs I-MR (E8), monthly aggregation (E14), standard work aimed at an input (E24), pilot-rate annualization (E38), selling price as benefit (E34), hard vs soft (E36)
-->

---

v1.0 · 2026-09-20
