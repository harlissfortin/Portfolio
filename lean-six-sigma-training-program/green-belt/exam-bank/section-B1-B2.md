# Green Belt Exam Bank — Sections B1 and B2: Measure

Part of the Green Belt certification item bank. Blueprint, minimally competent candidate
statement, tag format and assembly constraints are in [`../exam-bank.md`](../exam-bank.md);
item-writing rules are in
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).

Section B1 draws 8 items per form from 28; Section B2 draws 9 from 32. Both carry enough NEU
items to fill their quota alone (vertical rule). Correct option ✅; tag line, then a
one-sentence rationale. Exhibit (X) items show the exhibit first. Every numerical item states
its time basis (calendar vs working) in the stem; where a second basis would give a different
number, the stem closes it off.

---

## Section B1 — Measure: mapping, VSM, lead time, %C&A, PCE, data types (28 CERT)

**B1-1.** Your team's map of invoice processing has 63 boxes, one per screen and keystroke. The sponsor has asked for a value stream map with lead time and %C&A at Tollgate 1 in four days. The best move is:
A. Present the 63-step map; more detail is always safer at a tollgate · B. Cut the map to the five steps the SOP names · C. Re-map at process-block level (about 8–15 steps where work queues or changes hands), attach a data box to each, and keep the keystroke map for later use in Analyze ✅ · D. Skip the map and report lead time alone
`[B1 · G2 · Apply · TXN · S · CERT]` — A VSM works at the altitude where queues and handoffs are visible; option A buries the queues in detail and option B hides the workarounds the 63-step walk found.

**B1-2.** A current-state VSM data box for a process step normally carries:
A. Process time per unit, changeover time, uptime, batch size, number of people, and %C&A ✅ · B. The step owner's name, the SOP number, and the audit date · C. The specification limits, Cpk and DPMO for the step · D. The step's budget, headcount and overtime hours
`[B1 · G2 · Understand · NEU · K · CERT]` — The data box holds what you need to compute lead time and locate flow problems; option C is capability information that belongs on the baseline chart, not the map.

**B1-3.**
| Step | Process time per unit (min) | Queue before the step (working hours) |
|---|---|---|
| Cut | 12 | 16 |
| Weld | 25 | 24 |
| Paint | 18 | 8 |

The plant runs two 8-hour shifts, Monday to Friday; every figure above is already in working time, and there is no queue after Paint. Process cycle efficiency for one unit, on a working-time basis, is closest to:
A. 0.6% · B. 1.9% ✅ · C. 11.5% · D. 53%
`[B1 · G2 · Apply · MFG · X · CERT]` — Process time 55 min; lead time 48 working h × 60 = 2,880 min + 55 = 2,935 min; 55 ÷ 2,935 = 1.9%; option C divides by a single 8-hour shift and option D treats the queue hours as minutes.

**B1-4.**
| Step in the referral chain | %C&A as rated by the next step |
|---|---|
| Referral received from primary care | 80% |
| Insurance verification | 90% |
| Scheduling | 95% |
| Pre-visit packet sent | 70% |

A clinic team computes the mean %C&A of the chain as 84% and tells the sponsor the referral process is "mostly clean". The correct rolled figure and its meaning is:
A. 84% — the mean is the right summary because each step is rated independently · B. 70% — the chain is only as good as its weakest step · C. 35% — subtract the four failure rates from 100% · D. 48% — multiply the four; roughly half of referrals need rework somewhere before the visit, so the 84% mean overstates the chain's health ✅
`[B1 · G2 · Analyze · HC · X · CERT]` — Rolled %C&A is the product (0.80 × 0.90 × 0.95 × 0.70 = 0.48); option B ignores that errors accumulate across steps.

**B1-5.** A supplier quotes a lead time of "6 working days". Your VSM of the same order path, timed from purchase-order release to dock receipt, shows 9 calendar days. The sponsor asks whether the supplier is missing its quote. Your best answer is:
A. Convert both to one basis before comparing — 9 calendar days spanning a weekend is about 7 working days, so the gap is one day, not three; state the basis on every figure ✅ · B. Yes — 9 is greater than 6 · C. No — quotes are always in calendar days · D. The comparison is impossible because the two figures use different units
`[B1 · G2 · Analyze · MFG · S · CERT]` — Lead time is only comparable on a stated basis; option D gives up on a conversion that takes one line.

**B1-6.** "Number of scratches counted on each painted panel" is, as a data type:
A. Continuous measurement data · B. Count (attribute) data ✅ · C. Classification (defective / not defective) data · D. Ordinal rating data
`[B1 · G2 · Remember · NEU · K · CERT]` — A count of occurrences per unit is attribute count data; option C would apply only if each panel were recorded as pass or fail.

**B1-7.** A lending team's CTQ is "customers wait too long for a decision". They must choose the primary metric before mapping. The strongest choice is:
A. Number of applications decided per analyst per day · B. Lead time in working hours from application receipt to decision sent, because analysts work weekdays · C. Lead time in calendar hours from the application-received timestamp to the decision-sent timestamp, because the customer experiences calendar time ✅ · D. Percentage of applications the customer rates as "slow" in a survey
`[B1 · G2 · Apply · TXN · S · CERT]` — The basis follows the customer's experience; option B measures the analysts' calendar, not the customer's wait, and would hide weekend delays.

**B1-8.**
| Step | Process time per claim (min) | Queue before the step (working days of 8 h) |
|---|---|---|
| Intake | 6 | 0.5 |
| Verification | 9 | 1.0 |
| Adjudication | 22 | 4.5 |
| Payment | 4 | 1.0 |

All figures are on a working-time basis. The sponsor proposes a software change that cuts adjudication process time from 22 to 15 minutes. The best reading of the map is:
A. Adjudication is the bottleneck because it has the longest process time, so the change is the right lever · B. Cut verification instead — its queue is shorter and easier to remove · C. The change is worthwhile because process time is the only part the team controls · D. The 4.5-day queue before adjudication is about two-thirds of the roughly 3,400-minute lead time; saving 7 minutes changes lead time by about 0.2% — find out why claims wait for adjudication ✅
`[B1 · G2 · Analyze · TXN · X · CERT]` — Lead time ≈ 7 working days of queue (3,360 min) + 41 min of process time; option A confuses the longest touch time with the biggest wait.

**B1-9.** Process cycle efficiency should **not** be used to:
A. Rank two different processes measured on different time bases, or set a target for its own sake ✅ · B. Show a sponsor how much of lead time is waiting · C. Locate which queue to study first on a current-state map · D. Compare the same process before and after a pilot on the same basis
`[B1 · G2 · Understand · NEU · K · CERT]` — PCE is a diagnostic within one process on one basis; option D is a legitimate before/after use precisely because the basis is held constant.

**B1-10.** Your emergency department map, built from the policy manual, shows triage → registration → bed. Walking five patient journeys, you see registration done at the bedside in three of five, and a hallway wait after triage that appears nowhere in the policy. The correct map is:
A. The policy version, with a note that staff deviate · B. The observed flow, showing the hallway queue with its measured wait and the two registration paths with their frequencies ✅ · C. The observed flow for the bedside cases only, since that is the majority · D. The policy version, until the department agrees which path is correct
`[B1 · G2 · Analyze · HC · S · CERT]` — The current state is what happens, with variant paths and their frequencies; option C discards the two cases that reveal why the paths differ.

**B1-11.**
| Quantity | Value |
|---|---|
| Work in process in the machining cell (units waiting plus units being worked) | 240 |
| Throughput | 60 units per working day (one 8-hour shift) |

Using Little's Law and the working-day basis given, the average lead time of a unit through the cell is:
A. 0.25 working day · B. 240 working hours · C. 8 working days · D. 4 working days ✅
`[B1 · G2 · Apply · MFG · X · CERT]` — Lead time = WIP ÷ throughput = 240 ÷ 60 = 4 working days; option A inverts the ratio.

**B1-12.** For the data box of a press, the operator estimates changeover at "about 20 minutes". You time three changeovers during the mapping week: 35, 48 and 31 minutes. In the data box you record:
A. 20 min, because the operator knows the press best · B. The 48-minute worst case, to be conservative · C. The observed figure (about 38 min mean, range 31–48) with a note that n = 3 and the estimate was 20 ✅ · D. Nothing, until you have 30 changeovers
`[B1 · G2 · Apply · MFG · S · CERT]` — The map records observed reality with its sample size and the gap to the estimate; option A records a belief, and the gap itself is a finding worth keeping.

**B1-13.**
```
Baseline summary — Contract review step
Cycle time: 40 min (mean of 25 timed reviews, range 22–71 min)
Reviewers: 3   Reviews per week: 110
```
Sales reports that customers wait "about three weeks" for a contract to come back. The report above most importantly omits:
A. Evidence that the customers are exaggerating · B. Process time in hours rather than minutes · C. A larger sample; 25 reviews is too few to report · D. Queue time — the 40 minutes is touch time; lead time from contract received to contract returned, including the wait before review, is what the customer experiences ✅
`[B1 · G2 · Analyze · NEU · X · CERT]` — Cycle (process) time and lead time are different quantities and the customer sees the second; option C is a distraction because the sample is adequate for what it measures.

**B1-14.**
| Reason the pharmacy rated a medication order "not complete and accurate" | Share of rejected orders |
|---|---|
| Patient weight missing | 41% |
| Allergy field blank | 22% |
| Dose outside reference range | 18% |
| Free-text instruction unreadable | 12% |
| Other | 7% |

Pharmacy rates 62% of orders complete and accurate. The sponsor reads this as "prescribers make errors 38% of the time; schedule retraining." The best reading is:
A. Most rejections are fields the order form does not require before submission — a form and system design issue; only "dose outside range" points to prescriber judgment; fix the form and re-measure %C&A ✅ · B. Retraining is right because %C&A measures the producing step's competence · C. The %C&A is invalid because pharmacy, not the prescribers, rated it · D. Combine the top two reasons and retrain on those only
`[B1 · G2 · Analyze · HC · X · CERT]` — %C&A is rated by the receiver and counts every reason for rework, most of which here trace to a form design decision; option C rejects the one correct way to measure %C&A.

**B1-15.** A team is chartered to reduce the 4% error rate on a single approval step that has no queue before or after it; the sponsor asks for a value stream map "because Green Belts do VSMs". The right response is:
A. Build the VSM anyway; every project needs one · B. Explain that a VSM answers flow and lead-time questions; this project's question is accuracy at one step, so a detailed map of that step with a check sheet of error types serves it better, and say so at the tollgate ✅ · C. Build a VSM of the whole department to justify the tool · D. Refuse to map at all because the problem is not about time
`[B1 · G2 · Analyze · TXN · S · CERT]` — Tool choice follows the question; option A spends a week producing a lead-time picture for a problem that is not about lead time.

**B1-16.** The %C&A figure for a step on a current-state VSM is provided by:
A. The step's own staff, from their error log · B. The team, from the SOP's quality requirements · C. The people at the next step downstream, who receive the work and know how often they must correct, clarify or add to it ✅ · D. The customer at the end of the value stream
`[B1 · G2 · Understand · NEU · K · CERT]` — Work that looks complete to its producer is judged by whoever must use it next; option A is the same information from the party least able to see the gap.

**B1-17.**
```
Order 44817 — timestamps (plant local time)
Order received:   Friday 14:00
Order shipped:    Wednesday 10:00 (following week)
Plant working hours: Monday–Friday 06:00–22:00 (16 h per day); closed weekends
```
The sponsor's dashboard reports lead time in working hours. The customer sees the elapsed time. You report:
A. 116 working hours · B. 44 calendar hours · C. 60 working hours, counting the weekend as one shift each day · D. 44 working hours for the dashboard, and 116 calendar hours as the customer experiences it — both, each labeled with its basis ✅
`[B1 · G2 · Apply · MFG · X · CERT]` — Working: 8 (Fri) + 16 + 16 + 4 = 44 h; calendar: 4 days 20 h = 116 h; option A attaches the customer's number to the plant's label.

**B1-18.** A ward team wants to measure "discharge readiness" and proposes a 1–5 score the charge nurse assigns at the morning huddle. Before adopting it, the better choice for the Measure phase is:
A. Define the observable events (for example, discharge order written, transport requested, patient leaves the bed) and measure the time between them in minutes, because continuous time between recorded events can be checked and charted, and the score cannot ✅ · B. Keep the 1–5 score because it is faster to collect · C. Use a Yes/No "ready by 11:00" flag because attribute data needs no measurement check · D. Ask each patient to rate their readiness on the same 1–5 scale
`[B1 · G2 · Apply · HC · S · CERT]` — Continuous data between defined events carries more information per observation and can be verified; option B trades measurability for convenience.

**B1-19.**
| Item | Value (calendar basis) |
|---|---|
| Statements arriving for printing | spread evenly across 24 hours |
| Print run | once daily at 18:00, batch of about 500 |
| Process time per statement | 0.5 min |
| Courier pick-up | 10:00 the following day |

The team is asked where the map points first for shortening statement lead time. The best answer is:
A. Reduce the 0.5-minute process time with a faster printer · B. Move the courier pick-up to 09:00 · C. The once-a-day batch release — a statement waits on average about 12 calendar hours for the run and then 16 hours for pick-up, so releasing smaller batches more often removes most of the lead time; the printing itself is negligible ✅ · D. Add a second print operator to the 18:00 run
`[B1 · G2 · Analyze · TXN · X · CERT]` — Batching creates the wait; options A and D speed up the 0.5-minute part of a roughly 28-hour lead time.

**B1-20.** On a swimlane process map, each lane represents:
A. A stage of the DMAIC cycle · B. A role, team or system that performs the work, so that every lane crossing shows a handoff ✅ · C. A shift or time period · D. A customer segment
`[B1 · G2 · Remember · NEU · K · CERT]` — Lanes carry the who, which makes handoffs countable; option C describes a timeline, not a swimlane.

**B1-21.** A gear-housing team computes PCE at 2.1% and a member proposes reclassifying the final inspection as value-added "because the customer wants quality," which would raise PCE to 6%. The best judgment is:
A. Accept it — customer intent decides value · B. Reject it because PCE must stay below 5% to justify the project · C. Accept it only if inspection finds defects · D. Reject it — inspection fails the "transforms the product" test, so it is necessary non-value-added; relabeling changes the number without changing a single minute the housing waits ✅
`[B1 · G2 · Analyze · MFG · S · CERT]` — Value-added classification uses the three tests, not the desired PCE; option A would let any step be relabeled and the map would stop pointing anywhere.

**B1-22.**
| Lab step | Process time per specimen (min) | Lead time through the step incl. queue (min) | %C&A (rated by next step) | Uptime |
|---|---|---|---|---|
| 1 Receive and log | 3 | 25 | 91% | — |
| 2 Centrifuge | 12 | 40 | 99% | 97% |
| 3 Analyze | 45 | 30 | 96% | 92% |
| 4 Verify and report | 6 | 210 | 88% | — |

Before this data box table goes into the Tollgate 2 pack, the entry you re-measure first is:
A. Step 3 — a lead time shorter than its own process time is impossible; one of the two was mis-recorded ✅ · B. Step 4 — 210 minutes is too long to be true · C. Step 1 — uptime is missing · D. Step 2 — 99% %C&A is suspiciously high
`[B1 · G2 · Analyze · HC · X · CERT]` — Lead time through a step includes its process time, so 30 < 45 is an arithmetic impossibility; option B is a long queue, which is plausible and is the kind of thing the map exists to find.

**B1-23.** A service desk promises callbacks "within two business days". The team measures callback lead time for the baseline. The correct basis is:
A. Calendar hours, because customers experience calendar time · B. Business days, using the same holiday and weekend calendar the promise uses, with the rule written into the operational definition ✅ · C. Working hours of the agent who took the call · D. Whichever basis makes the baseline look worse, to be conservative
`[B1 · G2 · Apply · TXN · S · CERT]` — The metric must be on the basis the promise is made on, or the baseline cannot be compared with the promise; option A is the right basis for a different CTQ.

**B1-24.** A team can record either "shipment on time: Yes/No" or "hours early or late versus the promise". The better default for the baseline is:
A. Yes/No, because it needs no measurement system check · B. Yes/No, because the sponsor's KPI is on-time percentage · C. Hours early or late — it can be converted to Yes/No later against any promise, shows how late, and needs far fewer observations to see a change ✅ · D. Both, collected by separate people
`[B1 · G2 · Understand · NEU · K · CERT]` — Continuous data can be collapsed to attribute data but not the reverse; option B lets the reporting format limit what the team can learn.

**B1-25.**
| Step | %C&A (rated by next step) |
|---|---|
| Machining | 88% |
| Deburr | 96% |
| Assembly | 78% |
| Test | 93% |

Rolled %C&A is 61%. The sponsor proposes adding a final inspection station so that "%C&A to the customer becomes 99%." The best judgment is:
A. Agree — the customer only sees the last step · B. Explain that %C&A on the map measures first-pass work between steps; a final inspection adds a non-value-added step and lead time without changing the 61%, so the team should go to the assembly and machining handoffs where the rework originates ✅ · C. Agree, but only for the assembly step · D. Reject the idea because inspection is never acceptable
`[B1 · G2 · Analyze · MFG · X · CERT]` — Inspection catches what the chain produced; it does not raise any step's first-pass %C&A; option D overstates the case — inspection may be a necessary interim containment while causes are fixed.

**B1-26.** Your inpatient team has two hours with the unit manager and the case-management lead and can produce a map in the conference room. For the current-state map you submit at Tollgate 1, the best approach is:
A. Use the conference-room map; the two leads know the process · B. Use the conference-room map and label it "validated by management" · C. Survey the nurses by email to confirm the conference-room map · D. Treat the conference-room map as a hypothesis, then follow five discharges on the unit end to end, timing each wait, and submit what you observed ✅
`[B1 · G2 · Analyze · HC · S · CERT]` — Work as imagined and work as done differ, and only observation with timing gives the data boxes; option A submits the hypothesis as the finding.

**B1-27.** The stepped timeline drawn along the bottom of a value stream map shows:
A. Waiting and queue time on the upper segments and process time on the lower segments, summed into lead time and process time, from which PCE is computed ✅ · B. Takt time on the upper segments and cycle time on the lower · C. The shift schedule of each step · D. Cumulative %C&A as work moves left to right
`[B1 · G2 · Remember · NEU · K · CERT]` — The timeline is where the map's lead-time arithmetic lives; option B describes a comparison made elsewhere on the map.

**B1-28.** Your loan-processing map shows that 30% of applications return from underwriting to intake for missing documents and make a second pass. On the map and in the lead-time figure you:
A. Omit the loop because it is an exception path · B. Draw the loop but exclude looped applications from lead time so the baseline is "clean" · C. Draw the rework loop with its 30% frequency and the intake-to-underwriting queue it re-enters, and report lead time as the weighted average across first-pass and looped applications, with both figures shown ✅ · D. Draw the loop and report only the looped applications' lead time, since those are the problem
`[B1 · G2 · Apply · TXN · S · CERT]` — The loop is a %C&A failure with a lead-time cost, and the baseline must include it; option B removes inconvenient data, which the rubric treats as a data-ethics failure.

<!-- B1 tally: keys A 7 · B 7 · C 7 · D 7 — types S 11 · X 10 · K 7 — Bloom Remember 3 · Understand 4 · Apply 9 · Analyze 12 (Apply/Analyze 21 of 28 = 75%) — verticals NEU 8 · MFG 7 · HC 6 · TXN 7 — negative stems 1 (B1-9) -->

---

## Section B2 — Measure: operational definitions, data collection, sampling, MSA (32 CERT)

**B2-1.** Two medical units report "medication reconciliation completed on admission" at 94% and 61% for the same month. Interviews show one unit counts a completed form, the other counts a pharmacist-verified list in the electronic record. Before either number goes into the baseline, the team must:
A. Average the two rates · B. Write one operational definition naming the observable event, the record it is read from and the inclusion rules, then re-collect on both units ✅ · C. Adopt the 94% unit's method because it produces more data · D. Report both rates and let the sponsor choose
`[B2 · G3 · Analyze · HC · S · CERT]` — Two definitions produce two different measures of two different things; option C picks a definition for its result rather than its clarity.

**B2-2.** Which data collection plan could a stranger execute and produce the same numbers?
A. "Track cycle time for a few weeks and see what we learn" · B. "Analyst records late orders in the tracker" · C. "Each shift lead records, for every 5th order by order number, the minutes from order-release timestamp to pack-complete timestamp, on the shared sheet, for 4 weeks starting 6 October; target 200 orders" ✅ · D. "Collect enough data to run a t-test"
`[B2 · G3 · Understand · NEU · K · CERT]` — Who, what, how, how many, when and where recorded are all present; option B names a person and a place but no definition, sample or schedule.

**B2-3.**
```
Gage R&R Study (ANOVA) — Shaft diameter, mm    10 parts × 3 operators × 2 trials
Source            StdDev    %Study Var   %Tolerance (Tol = 0.30 mm)
Total Gage R&R    0.00389      9.2            7.8
  Repeatability   0.00258      6.1            5.2
  Reproducibility 0.00292      6.9            5.8
Part-to-Part      0.04210     99.6           84.2
Total Variation   0.04228    100.0           84.6
Number of Distinct Categories = 15
```
The correct conclusion is:
A. The measurement system is acceptable for both process study and conformance decisions; proceed to the baseline ✅ · B. Marginal — reproducibility exceeds repeatability, so operators need training first · C. Unacceptable — part-to-part variation is 84% of tolerance · D. The study is invalid because %Study Var and %Tolerance disagree
`[B2 · G3 · Analyze · MFG · X · CERT]` — Total Gage R&R under 10% on both bases with ndc ≥ 5 passes; option C reads the process spread as a gauge problem, and that 84% is a capability question for Week 4, not an MSA result.

**B2-4.**
```
Gage R&R Study (ANOVA) — Fastener torque, N·m    10 joints × 3 operators × 2 trials
Source            StdDev    %Study Var   %Tolerance (Tol = 12 N·m)
Total Gage R&R    0.861       41.0           43.1
  Repeatability   0.819       39.0           41.0
  Reproducibility 0.265       12.6           13.3
Part-to-Part      1.915       91.2           95.8
Total Variation   2.100      100.0          105.0
Number of Distinct Categories = 3
```
The best next step is:
A. Proceed to the baseline but note the result; 41% is close to the 30% line · B. Retrain the three operators, since they disagree with each other · C. Widen the tolerance so the %Tolerance figure passes · D. Stop before collecting baseline data; repeatability dominates, so look at the analyzer, its fixture and the measurement method (position, speed, reading), fix, and re-run the study ✅
`[B2 · G3 · Analyze · MFG · X · CERT]` — Over 30% is unacceptable and the split says the same operator cannot repeat their own reading, which points at the instrument and method; option B addresses the smaller component.

**B2-5.** Your primary metric is invoice lead time computed from two system timestamps: "invoice created" and "invoice approved". A teammate schedules a Gage R&R with three analysts re-reading 10 invoices. The better plan is:
A. Run the Gage R&R as scheduled; the rubric requires one · B. Do not run a Gage R&R — the timestamps repeat perfectly by construction; instead check that the two events mean what the definition says (who triggers "approved"?), that clocks agree, and sample about 30 invoices to compare the timestamps with what was observed, and write this up as the MSA ✅ · C. Skip the MSA entirely because system data is trusted · D. Run an attribute agreement study on whether the invoice was late
`[B2 · G3 · Apply · TXN · S · CERT]` — A Gage R&R on a deterministic field measures nothing; the rubric accepts a written, reasoned substitute and rejects "we trust the system", which is what option C offers.

**B2-6.** In a Gage R&R, the variation seen when the same operator measures the same part several times with the same instrument is:
A. Repeatability ✅ · B. Reproducibility · C. Part-to-part variation · D. Bias
`[B2 · G3 · Remember · NEU · K · CERT]` — Repeatability is the instrument-and-method component; option B is the between-operator component.

**B2-7.**
```
Attribute Agreement Analysis — "Fall-risk screen complete" (Yes/No)
30 charts · 3 appraisers (nurses A, B, C) · 2 trials · standard set by the falls committee

Within Appraiser             Appraiser  #Inspected  #Matched  Percent   95% CI
                             A             30          28       93.3   (77.9, 99.2)
                             B             30          26       86.7   (69.3, 96.2)
                             C             30          21       70.0   (50.6, 85.3)
Each Appraiser vs Standard   A             30          19       63.3   (43.9, 80.1)
                             B             30          18       60.0   (40.6, 77.3)
                             C             30          16       53.3   (34.3, 71.7)
Between Appraisers                         30          15       50.0   (31.3, 68.7)
All Appraisers vs Standard                 30          13       43.3   (25.5, 62.6)
Fleiss' kappa (all appraisers vs standard) = 0.41
```
The best diagnosis is:
A. Nurse C is the problem; remove her ratings and re-run · B. The system is acceptable because the two most experienced nurses are above 85% within-appraiser · C. Nurses A and B are self-consistent but all three disagree with the standard and with each other — the definition of "complete" is unclear or the reference charts are ambiguous; fix the definition with borderline examples, recalibrate everyone, and re-run ✅ · D. The sample of 30 charts is too small to conclude anything
`[B2 · G3 · Analyze · HC · X · CERT]` — Low agreement with the standard across everyone, with a kappa near 0.4, is a definition problem, not a person problem; option A removes the appraiser whose result is most informative and mistakes a symptom for the cause.

**B2-8.** For a Gage R&R on bore diameter, a technician pulls the 10 parts from one lot produced in one hour, so the parts span 0.02 mm while the process normally spans 0.12 mm. The study returns Total Gage R&R = 38% of study variation, ndc = 3, %Tolerance = 9%. The correct reading is:
A. The gauge is unacceptable; replace it · B. The gauge is acceptable because %Tolerance is 9% · C. Both figures are invalid; discard the study · D. %Study Var and ndc are inflated because the parts do not span the process range — the %Tolerance figure still stands; re-run with parts chosen across the full range before judging the gauge for process study ✅
`[B2 · G3 · Analyze · MFG · S · CERT]` — %Study Var compares gauge variation with the variation of the parts you happened to select; %Tolerance compares it with the specification and is unaffected; option A judges the gauge from a figure the part selection distorted.

**B2-9.** You use %Study Variation rather than %Tolerance as the acceptance figure when the purpose of the measurement is:
A. Deciding whether a unit conforms to the customer's specification · B. Tracking and improving the process — detecting shifts and telling good units from bad within the process spread ✅ · C. Calibrating the instrument against a reference standard · D. Auditing supplier certificates
`[B2 · G3 · Understand · NEU · K · CERT]` — The denominator follows the question: process spread for process work, tolerance for conformance; option A is the %Tolerance case.

**B2-10.** Accounts payable processes about 12,000 invoices a month. The team proposes auditing the first 100 invoices of each month for coding errors. A better sampling plan is:
A. A random or systematic sample drawn across the whole month (for example every 100th invoice by sequence number, about 120 per month), recording the day, the entry channel and the clerk's queue so patterns can be seen later ✅ · B. The first 100 invoices, because early-month invoices are typical · C. All invoices that generated a complaint · D. The 100 largest invoices by value
`[B2 · G3 · Apply · TXN · S · CERT]` — The first 100 arrive under month-start conditions and miss month-end volume; option C samples on the outcome and cannot give an error rate.

**B2-11.**
| Plan element | Entry |
|---|---|
| What | Minutes from "case opened" to "first response sent", per case |
| Operational definition | Both timestamps read from the ticketing system's audit log; first response = first outbound message to the customer, not an internal note |
| Who | The two team analysts |
| How many / when | A few cases each week, when time allows, for about a month |
| Where recorded | Baseline tab of the project workbook |
| Stratification | Case type (billing, technical, account) and intake channel |

The row you fix before the plan is used is:
A. "What" — minutes should be hours · B. "Who" — analysts should not collect their own data · C. "How many / when" — there is no sampling frame, schedule or target count, so a stranger could not reproduce the sample; specify, for example, every 10th case opened, all channels, four weeks from a stated date, about 200 cases ✅ · D. "Stratification" — three case types are too many
`[B2 · G3 · Apply · TXN · X · CERT]` — The plan is strong except for the sample, which is currently a convenience sample; option B is a preference, not a defect, when the data is a system timestamp.

**B2-12.** An attribute agreement study on "discharge summary complete" fails (kappa 0.38 versus the standard). The pharmacist on the team suggests that "since the standard came from the medical director, the appraisers just need to be told to try harder." The Green Belt's correct response is:
A. Agree and re-run next week · B. Rewrite the definition with the specific borderline cases the study exposed, build a reference set of 10 summaries with agreed ratings, calibrate all appraisers on it, then re-run with new charts; the baseline waits until the study passes ✅ · C. Drop the metric and use length of stay instead · D. Proceed to the baseline with the medical director as the single rater
`[B2 · G3 · Analyze · HC · S · CERT]` — A failed attribute study is a definition and calibration problem to be fixed and re-tested; option D avoids the test by removing the people who will actually collect the baseline.

**B2-13.** The "number of distinct categories" reported with a Gage R&R tells you:
A. How many operators took part · B. How many parts were measured · C. How many specification zones the gauge can resolve · D. How many non-overlapping groups of parts the measurement system can reliably distinguish across the process range — 5 or more is the usual acceptance guideline ✅
`[B2 · G3 · Remember · NEU · K · CERT]` — ndc is resolution relative to the part variation; option C confuses the process range with the tolerance.

**B2-14.**
```
Gage R&R Study (ANOVA) — Fill volume, mL    Spec 500 ± 11 mL (Tol = 22 mL)
Source            StdDev   %Study Var   %Tolerance
Total Gage R&R    0.330      22.0           9.0
  Repeatability   0.278      18.5           7.6
  Reproducibility 0.179      11.9           4.9
Part-to-Part      1.463      97.6          39.9
Total Variation   1.500     100.0          40.9
Number of Distinct Categories = 6
```
The team's project aims to detect and reduce fill-volume variation. The correct statement for the tollgate is:
A. "Acceptable for deciding whether a container is in specification (9% of tolerance); marginal for studying the process (22% of study variation, ndc 6), so we will accept it for the baseline, state the limitation, and improve the gauge if the process spread shrinks" ✅ · B. "Acceptable on both criteria; nothing to note" · C. "Unacceptable; the gauge must be replaced before any data is collected" · D. "Invalid because part-to-part is only 40% of tolerance"
`[B2 · G3 · Analyze · MFG · X · CERT]` — Both figures are true of the same gauge and the purpose decides which governs; option B hides a limitation that will matter once the project narrows the process spread.

**B2-15.** Your primary metric is weld strength from a pull test that destroys the sample. A teammate sets up a standard crossed Gage R&R: 10 welds, 3 operators, 2 trials. The correct response is:
A. Run it; the design is standard · B. Run it with 1 trial to avoid the problem · C. Stop — no weld can be measured twice, so the crossed design cannot separate repeatability from part variation; raise it with your Black Belt coach, who can set up a nested study on welds drawn from homogeneous batches, and record that decision as the MSA plan ✅ · D. Skip the MSA and note "destructive test" as the reason
`[B2 · G3 · Apply · MFG · S · CERT]` — Destructive measurement is the classic case where a crossed study is invalid and the nested alternative is a Black Belt tool; option D gives up on a measurement check the coach can help design.

**B2-16.** Your baseline counted "rework" as any application returned to intake. During the pilot, the team realizes returns for a single missing signature should not count, and starts excluding them. For the before/after comparison you must:
A. Compare as is; the exclusion is small · B. Adjust the baseline by subtracting the estimated share of signature returns · C. Keep the new definition for the after data and note the change in the report · D. Choose one definition and apply it to both periods — re-count the baseline from the original records under the new definition, or keep the original definition for the after data; never compare across a definition change ✅
`[B2 · G3 · Analyze · TXN · S · CERT]` — Changing the operational definition between before and after ends a rubric review with a resubmission request; option B reconstructs a baseline from an estimate, which is the same fault in another form.

**B2-17.**
```
Operational definition — Door-to-provider time (draft 2)
Unit: minutes, one decimal
Start event: "Arrival" timestamp entered by the greeter at the front desk kiosk
End event: provider sees the patient
Source: emergency department tracking board export, fields ARRIVE_TS and PROV_TS
Include: all walk-in and ambulance arrivals
Exclude: patients who leave before being seen (report their count separately)
Collector: unit clerk, daily export at 07:00 for the previous calendar day
```
The element that most needs fixing before collection starts is:
A. The unit — minutes should be whole numbers · B. The end event — "provider sees the patient" is not an observable, recorded event; state which recorded action sets PROV_TS (for example, provider assignment in the tracking board, or first provider note opened) and whether that is the moment the provider is physically with the patient ✅ · C. The exclusion — left-without-being-seen patients should be included with a time of zero · D. The collector — a clerk should not export clinical data
`[B2 · G3 · Apply · HC · X · CERT]` — A definition is only as good as its least observable event, and the end event here can be read three ways; option C would corrupt the metric with values that measure nothing.

**B2-18.** Two appraisers agree on 85% of 60 claims rated "pay / deny", but kappa is 0.30. The correct interpretation is:
A. Kappa is miscalculated; 85% agreement is good · B. The appraisers are biased in opposite directions · C. About 90% of claims are "pay", so two people flipping a weighted coin would agree on most of them; kappa removes that chance agreement and shows the appraisers barely agree on the claims that matter ✅ · D. The sample of 60 is too small for kappa
`[B2 · G3 · Understand · NEU · K · CERT]` — Percent agreement is inflated whenever one category dominates; option A trusts the inflated figure.

**B2-19.** For a baseline of a continuous metric (order lead time), a team offers two options: (1) 8 orders timed in one hour on Tuesday morning; (2) 40 orders sampled over two weeks across both shifts and all three product families. The better baseline, and why:
A. Option 2 — the baseline must span the sources of variation you expect to matter (shift, day, mix) so that the chart shows the process, not one hour of it ✅ · B. Option 1 — it is faster and 8 is enough for a mean · C. Option 1 — a single hour avoids confounding by shift · D. Option 2, but only if it reaches 100 orders
`[B2 · G3 · Apply · NEU · S · CERT]` — Rational coverage of the process's natural cycles matters more than the raw count; option D sets an arbitrary threshold when 40 well-spread observations are enough to start a control chart.

**B2-20.**
```
Attribute Agreement Analysis — "Invoice coded correctly" (Yes/No)
50 invoices · 3 appraisers · 2 trials · standard set by the coding supervisor

Within Appraiser             A: 98.0%   B: 96.0%   C: 98.0%
Each Appraiser vs Standard   A: 72.0%   B: 70.0%   C: 72.0%
Between Appraisers           94.0%      (kappa 0.88)
All Appraisers vs Standard   68.0%      (kappa 0.40)
```
The best diagnosis is:
A. The appraisers are inconsistent with themselves; retrain them individually · B. The study is acceptable because between-appraiser agreement is 94% · C. The standard is wrong because three people cannot all be mistaken · D. All three appraisers apply the same rule consistently, and that rule differs from the standard — check whether the supervisor's standard and the team's training describe the same thing, and which of them the customer's coding requirement actually supports, then recalibrate ✅
`[B2 · G3 · Analyze · TXN · X · CERT]` — High within and between agreement with low agreement to the standard is a shared misreading, not individual noise; option B ignores that agreeing with each other is not the same as being right.

**B2-21.** A typical crossed variable Gage R&R design at Green Belt level is:
A. 3 parts, 10 operators, 1 trial · B. About 10 parts chosen across the process range, 2–3 operators who normally take the measurement, 2–3 trials each, measured in random order and blind to part identity and to each other's readings ✅ · C. 30 parts, 1 operator, 1 trial · D. 1 reference part measured 30 times by the calibration lab
`[B2 · G3 · Remember · NEU · K · CERT]` — The design needs enough parts to represent the process and repeated, blinded readings to separate the components; option D measures bias, not R&R.

**B2-22.** A Gage R&R on the dispensing scale returns 34% of study variation. The pharmacy director, under a deadline, asks you to "collect the baseline now and fix the scale later." Your best response is:
A. Explain that a baseline measured through a system that contributes a third of the observed variation cannot be interpreted — the chart would show the scale, not the process — propose a one-week fix (calibration, fixture, method sheet) and re-study, and move the deadline with the sponsor ✅ · B. Collect the baseline now and subtract the measurement variation later · C. Collect the baseline now with the most experienced technician only · D. Refuse and escalate to the sponsor without proposing a plan
`[B2 · G3 · Analyze · HC · S · CERT]` — The rubric asks what was done when the system failed, and the answer is fix and re-run before the baseline; option B assumes a subtraction that leaves the individual points as unreliable as before.

**B2-23.**
```
Two-Way ANOVA Table With Interaction — Bore diameter, mm   10 parts × 3 operators × 2 trials
Source            DF    SS        MS         F        P
Part               9    0.8412    0.09347   112.4    0.000
Operator           2    0.0031    0.00155     1.86   0.184
Part × Operator   18    0.0150    0.000832    4.02   0.000
Repeatability     30    0.0062    0.000207
Total             59    0.8655
```
The significant Part × Operator term means:
A. The operators differ from each other on average · B. The parts differ from each other, which is expected · C. Different operators measure particular parts differently — for example, one operator seats an out-of-round part at a different angle — so look at the part-by-operator plot and standardize the method for those parts, rather than retraining everyone ✅ · D. The study must be repeated with more trials before anything can be said
`[B2 · G3 · Analyze · MFG · X · CERT]` — The Operator main effect is not significant, so the disagreement is specific to certain parts, which points to method and part geometry; option A reads the wrong row.

**B2-24.** A service team suspects the error rate differs by intake channel — web (70% of volume), phone (25%) and mail (5%). A simple random sample of 200 cases would yield about 10 mail cases. The better plan is:
A. Sample web only, since it is most of the volume · B. Stratify by channel and take enough cases in each stratum (for example 100 web, 60 phone, 40 mail) so each channel's rate can be estimated and compared, then weight back to the overall rate ✅ · C. Take 200 random cases and ignore the channel · D. Sample the mail channel only, since it is probably the worst
`[B2 · G3 · Apply · TXN · S · CERT]` — Stratification protects the comparisons the team plans to make; option C leaves the mail estimate at 10 cases, too few to say anything, and option D samples on a suspicion.

**B2-25.** A Gage R&R addresses the precision of a measurement system. Its bias — whether readings are systematically high or low against a reference value — is established by:
A. Increasing the number of trials · B. Comparing the three operators' means · C. Reading the %Tolerance line · D. A calibration or bias study against a traceable reference standard, which a Gage R&R does not replace ✅
`[B2 · G3 · Understand · NEU · K · CERT]` — R&R separates spread into repeatability and reproducibility; a gauge can pass R&R and still read 0.05 mm high everywhere; option B compares operators to each other, not to the truth.

**B2-26.**
| Plan element | Entry |
|---|---|
| What | Wall thickness of molded caps, mm |
| Sampling | Every 4th cap off the conveyor; 50 caps per shift |
| Process note | 4-cavity mold; cavities eject in a fixed sequence 1-2-3-4 |
| Where recorded | Shift log, with time |

The flaw in this plan is:
A. Every 4th cap from a 4-cavity mold is always the same cavity, so the baseline sees one cavity and hides cavity-to-cavity differences; sample with an interval not divisible by 4 (or randomly within each cycle) and record the cavity number ✅ · B. 50 caps per shift is too many for a baseline · C. Wall thickness should be recorded as pass/fail · D. The shift log is the wrong place to record data
`[B2 · G3 · Analyze · MFG · X · CERT]` — Systematic sampling that matches a process cycle aliases with it; option C throws away continuous information for no gain.

**B2-27.** The attribute agreement study for "wound documentation complete" fails at 74% against the standard. A team member notes that the newest nurse scored lowest and proposes re-running the analysis without her ratings, which would bring the figure to 86%. The Green Belt's correct decision is:
A. Accept it; new staff are not representative · B. Accept it, but disclose it in a footnote · C. Decline — she will collect baseline data like everyone else, and her result is evidence that the definition and onboarding do not transmit the standard; fix those, then re-run with everyone ✅ · D. Re-run with the newest nurse only, to isolate the problem
`[B2 · G3 · Analyze · HC · S · CERT]` — Removing an inconvenient appraiser is the measurement-system version of removing inconvenient points; option B makes the manipulation visible without making it right.

**B2-28.** An attribute agreement study on "claim correctly denied" reports kappa = 0.62 for all appraisers versus the standard and 91% within-appraiser agreement. The measurement system is best classified as:
A. Acceptable; both figures are above 0.6 · B. Marginal — appraisers are self-consistent, but agreement with the standard is below the usual 0.75 guideline, so the definition needs work before this metric supports a before/after claim ✅ · C. Unacceptable; kappa below 0.9 fails · D. Not assessable without a Gage R&R
`[B2 · G3 · Understand · NEU · K · CERT]` — Common guidelines treat kappa above about 0.75 as good and 0.4–0.75 as moderate; option A applies a threshold that is not the guideline, and option D asks for a variable-data tool on attribute data.

**B2-29.**
```
Gage R&R Study (ANOVA) — Call handle time by stopwatch, seconds   10 recorded calls × 3 team leads × 2 trials
Source            StdDev   %Study Var
Total Gage R&R    18.4       28.0
  Repeatability   17.2       26.2
  Reproducibility  6.5        9.9
Part-to-Part      63.1       96.0
Total Variation   65.7      100.0
Number of Distinct Categories = 4
Note: the telephony platform logs handle time for every call automatically.
```
The best decision is:
A. Improve the stopwatch method (defined start and stop cues) and re-run until it passes · B. Accept 28% as marginal and proceed · C. Add a fourth team lead to reduce reproducibility · D. Stop measuring by stopwatch — use the platform's logged handle time after verifying its start and stop events against about 30 observed calls; the stopwatch was the wrong measurement system, not a bad one ✅
`[B2 · G3 · Apply · TXN · X · CERT]` — When a better measurement system exists, fixing the worse one is effort on the wrong problem; option A improves a method the project does not need.

**B2-30.** For the baseline count of missed medication-administration times on a ward, the team can have (1) nurses tick a one-line check sheet at the medication cart at the moment of a late dose, or (2) a quality analyst reconstruct the week each Friday from the electronic record and staff recollection. The better choice is:
A. Option 2 — an analyst is more objective than the nurses · B. Option 2 — the electronic record is complete · C. Option 1 — collected at the point of work, at the moment, by the person who knows, with the definition on the sheet; the Friday reconstruction relies on memory and on a record that does not capture "late" as defined ✅ · D. Both, and use whichever gives the lower count
`[B2 · G3 · Apply · HC · S · CERT]` — Data collected when and where the event happens is more accurate than data reconstructed later; option D chooses data by its result.

**B2-31.** Your primary metric is "late supplier payments per month", produced by a query against the ERP system. A colleague asks how you will satisfy the rubric's MSA requirement. The correct plan is:
A. Verify the query rather than run a Gage R&R — re-derive the count for one closed month by hand from a random sample of about 50 payments against the written operational definition of "late", reconcile every difference, and document the query logic, the date fields it uses and the reconciliation as the MSA ✅ · B. Run a Gage R&R with three analysts running the same query · C. Run an attribute agreement study on whether each payment "feels late" · D. State that ERP data is system data and needs no check
`[B2 · G3 · Apply · TXN · S · CERT]` — A query is a measurement system whose failure modes are logic and field choice, not repeatability; option B would show 100% agreement whatever the query gets wrong.

**B2-32.**
```
Gage R&R — Housing height, mm    same 10 parts, 3 operators, 2 trials, both studies
                         Before fixture (12 Sept)    After fixture and method sheet (26 Sept)
Total Gage R&R %SV            38.0                          12.0
  Repeatability %SV           35.1                           9.4
  Reproducibility %SV         14.6                           7.5
Number of Distinct Categories   3                            11
```
Between the two studies, 60 baseline measurements were taken with the old setup. The correct handling for Tollgate 2 is:
A. Keep the 60 points; the parts did not change · B. Keep the 60 points but widen the control limits to allow for the old gauge · C. Average the two studies and report 25% · D. Report the before and after studies as the MSA, discard the 60 points from the baseline (state that they were collected through a failed measurement system), and collect the baseline again with the fixture ✅
`[B2 · G3 · Analyze · MFG · X · CERT]` — The fixed system is acceptable and the earlier data were measured through one that was not; option A keeps points whose chart pattern would reflect the gauge, and option B invents a limit adjustment that does not exist.

<!-- B2 tally: keys A 8 · B 8 · C 8 · D 8 — types S 13 · X 11 · K 8 — Bloom Remember 3 · Understand 5 · Apply 10 · Analyze 14 (Apply/Analyze 24 of 32 = 75%) — verticals NEU 9 · MFG 8 · HC 7 · TXN 8 — negative stems 0 — "when not to run a Gage R&R": B2-5, B2-15, B2-29, B2-31; "what to do when the measurement system fails": B2-4, B2-12, B2-22, B2-27, B2-32 -->
