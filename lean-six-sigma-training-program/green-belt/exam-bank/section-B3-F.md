# Green Belt Exam Bank — Sections B3 and F

Part of the Green Belt certification item bank. The blueprint, the minimally competent
candidate statement, the form-assembly constraints and the pool rules are in
[`../exam-bank.md`](../exam-bank.md); item-writing policy is
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).

**Tag format:** `[section · objective · Bloom · vertical · type · pool]` — **G4** state
stability, then capability · **G8** run tollgates, manage sponsor and team, handle data
ethically. Type: K = concept, S = scenario judgment, X = exhibit interpretation. Correct option
✅; rationale after the dash.

**Conventions used in these items.** Exhibits are product-neutral, software-style output.
Basic run rules as taught in Week 4: Test 1 = one point beyond 3σ; Test 2 = nine in a row on
one side of the center line; Test 3 = six in a row all increasing or all decreasing. Sigma
level uses the conventional table that includes the 1.5-sigma shift (3.4 DPMO = 6 sigma;
6,210 = 4 sigma; 66,807 = 3 sigma); an item says so wherever the answer depends on it.
Control limits come from the process; specification limits come from the customer.

---

## Section B3 — Measure: control charts, stability, capability, DPMO, sigma (28 CERT)

**B3-1.** Exhibit — baseline for a bottle-filling line, one bottle measured each hour:
```
I-MR chart — fill volume (mL), 30 hours
I chart:  center 502.1   UCL 507.8   LCL 496.4
  Test 1 (one point beyond 3σ): hour 17 = 509.2
MR chart: MR-bar 2.14   UCL 6.99   no tests failed
Customer specification: 500 ± 5 mL
```
The sponsor has asked for the baseline Cpk at Tollgate 2, which is tomorrow. Your best next step is to:
A. Compute Cpk from all 30 hours now; one signal in 30 points is within what chance produces on a stable process · B. Remove hour 17 as an outlier, recompute the limits and compute Cpk from the remaining 29 hours · C. Find out what happened at hour 17 before claiming capability, and keep the point in the record whatever you find ✅ · D. Set the chart limits to 495–505 mL so the chart and the customer's specification agree, then compute Cpk
`[B3 · G4 · Analyze · MFG · X · CERT]` — Capability assumes a stable process, so the signal has to be explained first; B is the tempting shortcut, but removing a point before its cause is found is the "cleaning" the rubric treats as a stop, and D confuses control limits (from the process) with specification limits (from the customer).

**B3-2.** A colleague asks you to "set the control limits to the customer's tolerance so the chart flags out-of-spec parts." Control limits differ from specification limits in that control limits:
A. Are set by the customer and tell you which units to reject · B. Are calculated from the process's own variation and tell you when the process has changed ✅ · C. Always sit inside the specification limits when the process is capable · D. Are placed by the process owner at the target plus or minus an agreed tolerance
`[B3 · G4 · Understand · NEU · K · CERT]` — The chart's job is to detect change, not to sort units; C is the best distractor because it is true only of a capable, centered process and is not what defines a control limit.

**B3-3.** Exhibit — hospital unit, discharge summaries not complete within 24 hours:
```
p chart — proportion of discharges with incomplete summary, weekly, 20 weeks
subgroup size (discharges per week): 180–240
p-bar 0.083   limits vary with subgroup size
Test 1 (point beyond 3σ): none
Test 2 (9 in a row on one side of center): weeks 12–20, all below center
```
Your countermeasure is not due to start until next month. The correct reading is:
A. Something changed around week 12 that lowered the rate; find it, and if it persists and is explained, recompute limits from week 12 onward as a new stage ✅ · B. The process is stable because no point falls beyond a control limit; proceed to capability on all 20 weeks · C. The varying limits mean the p chart is the wrong tool; rebuild the data as an np chart before reading it · D. Nine consecutive weeks below center confirm the target has been met, so Analyze can be shortened to a confirmation
`[B3 · G4 · Analyze · HC · X · CERT]` — A run of nine on one side of center is a special-cause signal even with every point inside the limits; B is wrong because Test 1 is only one of the rules, and C is wrong because varying limits are exactly how a p chart handles unequal subgroup sizes.

**B3-4.** You count keying errors per invoice in an accounts-payable team. Invoices range from 3 to 60 line items, and each line is a place an error can occur. The chart that puts a 3-line and a 60-line invoice on a fair footing is:
A. A c chart of errors per invoice, because errors are counts and invoices are the unit · B. A p chart of the proportion of invoices with at least one error, because pass/fail is simpler to collect · C. An I-MR chart of the daily error count, because one value per day is what the team sees · D. A u chart of errors per line item, because the area of opportunity varies by invoice ✅
`[B3 · G4 · Apply · TXN · K · CERT]` — A c chart assumes a constant area of opportunity, which invoices of 3 and 60 lines do not share; B is defensible only if you are willing to throw away the counts the stem says you already have.

**B3-5.** A packaging line audits every carton shipped each day for label defects, and the day's shipment ranges from 40 to 110 cartons. A team member sets up an np chart of defective cartons per day. You advise against it because:
A. Label defects are a measurement, so an I-MR chart of the daily count is required · B. An np chart needs a constant subgroup size; with 40 to 110 cartons a day, a p chart of the proportion defective is the right choice ✅ · C. Defective cartons should be charted per opportunity on a u chart, with the label as the opportunity · D. Daily samples are too small for any attribute chart; weekly totals are needed before charting
`[B3 · G4 · Apply · MFG · S · CERT]` — The np chart's center line and limits assume the same n every day; C is wrong because the audit records defective cartons (pass/fail), not defects counted per carton.

**B3-6.** Exhibit — lending team, turnaround of loan applications in working days:
```
Capability — turnaround (working days), 20 subgroups of 20 applications
LSL: none   USL: 5 working days (customer SLA)   mean 3.9
Within σ 0.71   Overall σ 1.02
Cp   *        Cpk  0.52
Pp   *        Ppk  0.36
Observed PPM > USL   120,000     Expected overall PPM > USL   140,000
```
The sponsor asks what the difference between 0.52 and 0.36 means. Your answer:
A. The software could not compute Cp or Pp, so the Cpk and Ppk values are unreliable and should be recomputed by hand · B. Cpk is the customer's requirement and Ppk is the process's actual performance; the gap between them is the improvement target · C. Within-subgroup variation is smaller than overall variation, so the process drifts between subgroups; the control chart should show why, and 0.36 is what the customer is living with ✅ · D. The indices differ only because the sample is small; averaging them to 0.44 is the fairest number to report
`[B3 · G4 · Analyze · TXN · X · CERT]` — Cp and Pp are starred because a one-sided specification has no width to compare to, not because of an error; D is wrong because the indices measure different things, and averaging hides the drift the gap is telling you about.

**B3-7.** A capability study reports Cp = 1.8 and Cpk = 0.6 on the same data. The sentence you tell the sponsor is:
A. "The process spread fits the specification comfortably; it is running off-center, so centering is the lever" ✅ · B. "The process is capable at 1.8; the 0.6 is the worst single subgroup and can be treated as a special cause" · C. "Variation is far too large; reducing spread is the only lever that will move Cpk toward 1.33" · D. "The two numbers contradict each other, so the study has to be repeated before anything is reported"
`[B3 · G4 · Understand · NEU · K · CERT]` — Cp ignores centering and Cpk penalizes it, so a wide gap means the mean sits close to one specification limit; C is wrong because a Cp of 1.8 says the spread is already small relative to the specification width.

**B3-8.** Exhibit — pharmacy medication-order audit, one month:

| Item | Value |
|---|---|
| Medication orders audited (units) | 2,400 |
| Opportunities per order, per the data collection plan (drug, dose, route, frequency, allergy check) | 5 |
| Defects found | 36 |

The project reports its baseline as DPMO **per opportunity, using the five opportunities defined in the data collection plan**. The DPMO is:
A. 300 · B. 3,000 ✅ · C. 15,000 · D. 30,000
`[B3 · G4 · Apply · HC · X · CERT]` — 36 ÷ (2,400 × 5) × 1,000,000 = 3,000; C (15,000) is what you get by dividing by orders instead of opportunities, the per-unit basis the stem closes off.

**B3-9.** A sponsor points out that your report calls 66,807 DPMO "a 3-sigma process" while a statistics textbook's normal table puts 6.7% in the tail at about 1.5 standard deviations. The correct explanation is:
A. The textbook table is for two-sided limits and DPMO is one-sided, so the two never agree · B. Sigma level counts standard deviations of the specification, not of the process, so the table does not apply · C. Your report is wrong; 66,807 DPMO is a 1.5-sigma process and the one-pager should be corrected · D. The conventional sigma level adds a 1.5-sigma shift allowance to the table value; state which convention you use and use the same one before and after ✅
`[B3 · G4 · Understand · NEU · K · CERT]` — Both numbers describe the same defect rate under different conventions, so the report needs to name its convention rather than change it; C is wrong because the shifted scale is the one the program and industry use, and the real error would be mixing scales between baseline and result.

**B3-10.** A claims team has 6,000 claims and 240 defective claims in its baseline. Preparing the Tollgate 2 one-pager, a team member proposes defining 40 opportunities per claim (every field on the form) "because that takes DPMO from 40,000 to 1,000 and looks a lot better." The right response:
A. Agree; more opportunities give a more precise picture of where defects occur in the form · B. Compromise on 20 opportunities so the number improves but stays believable to the reviewer · C. Keep the opportunity count to the places a defect the customer would notice can occur, define it before collecting data, and hold it constant before and after ✅ · D. Drop DPMO entirely and report only the count of defective claims, since opportunity counts are always arguable
`[B3 · G4 · Analyze · TXN · S · CERT]` — Inflating opportunities lowers DPMO without changing a single claim, and changing the definition between before and after is a data-ethics stop; D throws away a legitimate metric instead of defining it honestly.

**B3-11.** Exhibit — machining cell, shaft diameter:
```
X̄-R chart — diameter (mm), 25 subgroups of 5 consecutive parts, one subgroup per hour
R chart:  R-bar 0.018   UCL 0.038   no tests failed
X̄ chart: center 12.504   UCL 12.514   LCL 12.494
  Test 1: subgroups 4 (12.519), 11 (12.492), 19 (12.517)
```
The correct reading:
A. Variation within each hour is consistent, but the process mean moves between hours; look for what differs hour to hour, such as setup, material lot or temperature ✅ · B. The R chart is in control, so the process is stable and the three X̄ points are chance; proceed to Cpk · C. Three points beyond the limits out of 25 is a 12% failure rate, which is the process's baseline defect rate · D. The X̄ limits are too tight because they were computed from R-bar; widen them to the specification before reading the chart
`[B3 · G4 · Analyze · MFG · X · CERT]` — Read the R chart first because the X̄ limits depend on R-bar, and a quiet R chart with X̄ signals points to between-subgroup causes; B is wrong because stability requires both charts to be free of signals, and C confuses control-limit signals with specification defects.

**B3-12.** A lab measures turnaround time for five samples every hour, run on the same analyzer by the same technician. A team member charts all 200 individual readings on an I-MR chart. Which statement is correct about detecting a shift of one standard deviation in mean turnaround?
A. Both charts detect it equally, because both use 3-sigma limits computed from the same data · B. The I-MR chart detects it sooner because it has 200 points to work with instead of 40 · C. Neither chart detects a shift that small; only a point beyond the limits counts as a signal · D. An X̄-R chart with subgroups of 5 detects it sooner, because its limits are set from within-subgroup variation and sit closer to the mean; the I-MR chart discards the subgroup structure ✅
`[B3 · G4 · Apply · HC · S · CERT]` — Subgroup means vary less than individuals (by a factor of √5), so the same shift crosses the X̄ limits long before it crosses the I chart's; B is wrong because more points on a chart with wider limits does not make a shift more visible.

**B3-13.** The program teaches "stability before capability" because:
A. Capability software refuses to run on data that contains special-cause signals · B. A capability index from an unstable process describes only the sample you took; next month's number will differ for reasons the index cannot see, so it is not a prediction ✅ · C. Control charts are required by the rubric and capability indices are optional at Green Belt · D. Stability guarantees the process is capable, so the second step confirms what the chart already shows
`[B3 · G4 · Understand · NEU · K · CERT]` — Capability is a statement about what the process will keep doing, which only a stable process can support; D is the common confusion, since a stable process can predictably fail the specification.

**B3-14.** Exhibit — back-office data entry, one batch of 500 forms per day:
```
c chart — errors per daily batch (constant batch size 500), 25 days
center 4.2   UCL 10.4   LCL 0
Test 1 (point beyond 3σ): day 8 = 12
Test 2 (9 in a row on one side of center): not triggered — days 15–22 below center (8 points)
```
The right reading and action:
A. Day 8 is a special cause to investigate; the eight days below center are not yet a signal, so watch and do not act ✅ · B. Day 8 and the eight-day run are both signals; the process changed twice and the limits must be recomputed at each change · C. No action; 12 errors in 500 forms is 2.4%, which is inside any reasonable tolerance for data entry · D. Day 8 should be removed so that the limits reflect a typical day, and the chart reread without it
`[B3 · G4 · Analyze · TXN · X · CERT]` — The rules exist to stop you over-reading noise as much as under-reading signals, and eight is one short of the nine the rule requires; C confuses a specification-style tolerance with a control limit computed from the process.

**B3-15.** A plant manager draws the customer's specification limits on a control chart and proposes a rule: "only investigate points that are out of spec; a point beyond the control limit but inside the spec is still a good part." Your response:
A. Agree; the customer only cares about the specification, so control limits inside the spec add work without value · B. Agree, but move the control limits out to the specification so the two rules match and the chart stays simple · C. Explain that a point beyond a control limit means the process has changed even though that part is fine; investigate it now, before the change produces out-of-spec parts ✅ · D. Explain that control limits are a certification requirement and every signal must be logged regardless of the spec
`[B3 · G4 · Apply · MFG · S · CERT]` — Control limits (from the process) give early warning of change, which is worth more than sorting parts against a spec after the fact; B is the tempting compromise, but limits set at the spec no longer say anything about the process.

**B3-16.** Exhibit — biomedical engineering, infusion pump flow-rate check:

| Infusion pump flow rate (mL/h) | Value |
|---|---|
| Specification (device standard) | 95–105 |
| Mean | 102.3 |
| Within σ | 1.11 |
| Cp | 1.50 |
| Cpk | 0.81 |

Which lever should the team pursue first, and what would it do to Cpk?
A. Reduce variation, because a Cpk below 1.0 always means the spread is too wide for the specification · B. Widen the specification to 90–110 with the device committee so that Cpk rises above 1.33 · C. Reduce variation, because centering cannot change Cpk once Cp has been computed from the same data · D. Center the process on 100 mL/h; with σ unchanged, Cpk rises to about 1.5 without touching variation ✅
`[B3 · G4 · Apply · HC · X · CERT]` — Cp of 1.50 says the spread already fits, and the 2.3 mL/h offset is what drags Cpk down; A is wrong for that reason, and B changes the customer's requirement instead of the process.

**B3-17.** You have 12 daily values of your primary metric and Tollgate 2 is next week. A team member argues for computing control limits and Cpk from the 12 points "so we have something to show." Your judgment:
A. Twelve points are enough; control limits are statistically valid from 10 points onward · B. Compute trial limits and a capability figure if the sponsor needs a number, label both preliminary, say the stability judgment is provisional, and keep collecting to 20–25 points before you rely on either ✅ · C. Show no chart until 25 points exist; a chart from 12 points is a data-ethics violation under the rubric · D. Skip the chart and report Cpk alone, since capability is the number the sponsor asked for
`[B3 · G4 · Analyze · NEU · S · CERT]` — Limits from a dozen points are unstable estimates, so honesty means showing them with their status rather than hiding them; C is wrong because a labeled preliminary chart is honest — the ethics stop is for altered data, not for small samples reported as such.

**B3-18.** Exhibit — packaging line, heat-seal strength:
```
Capability — seal strength (N), 30 subgroups of 4, one subgroup per shift
LSL 18   USL 30   mean 24.3
Cp 1.60   Cpk 1.50
Pp 0.90   Ppk 0.80
```
The team reads this as "capable at 1.5." The better reading:
A. The process is capable; Pp and Ppk are long-term indices that always run lower and are Black Belt material · B. The specification is too tight; a Cp of 1.60 with a Pp of 0.90 means the limits should be reviewed with the customer · C. Within a shift the process is capable, but from shift to shift the mean moves enough that overall performance is not; the control chart should show between-shift signals to investigate ✅ · D. The two pairs disagree because of a subgroup-size error; recompute with subgroups of 5 and report whichever pair agrees
`[B3 · G4 · Analyze · MFG · X · CERT]` — Cp/Cpk use within-subgroup σ and Pp/Ppk use overall σ, so a gap this size says the subgroups are not all coming from the same process; A is wrong because the customer experiences overall performance, which is why the rubric asks for stability before capability.

**B3-19.** A claims project audits 1,250 claims against a pass/fail operational definition, one opportunity per claim; 40 claims fail. The baseline DPMO to report, with its basis stated as **per claim**, is:
A. 32,000 ✅ · B. 3,200 · C. 320,000 · D. 4,000
`[B3 · G4 · Apply · TXN · S · CERT]` — 40 ÷ 1,250 × 1,000,000 = 32,000 (3.2% defective, roughly 3.3 sigma on the shifted convention); B and C are decimal slips, and D (40 × 100) is what a team gets by treating a percentage as a rate.

**B3-20.** A rational subgroup is best described as:
A. Any five consecutive values, chosen so that every subgroup is the same size · B. A sample large enough to represent the whole week's production in one number · C. A group of measurements from different machines or shifts, so the subgroup reflects the whole process · D. A small set of measurements taken under conditions as alike as possible, so only common cause acts within it and any special cause shows up between subgroups ✅
`[B3 · G4 · Remember · NEU · K · CERT]` — The subgroup's job is to estimate common-cause variation cleanly; C is the reverse, since mixing sources inside the subgroup inflates R-bar, widens the X̄ limits and hides exactly the shifts you want to see.

**B3-21.** An emergency department project has a stable 24-week baseline I-MR chart of daily door-to-provider time. The team lead proposes recomputing the control limits every Friday with the new week's data "so the chart stays current." The right advice:
A. Agree; limits computed from more data are always more accurate estimates · B. Freeze the limits from the stable baseline and extend them; recompute only after a deliberate, verified change, because otherwise a shift is absorbed into the limits and the chart stops signaling ✅ · C. Recompute monthly rather than weekly, which balances currency against stability · D. Recompute weekly but keep the old limits drawn on the chart as a reference line
`[B3 · G4 · Analyze · HC · S · CERT]` — Limits are a prediction from a known-stable period, and updating them continuously turns every shift into the new normal; C is the compromise that still hides the change, just more slowly.

**B3-22.** Exhibit — lending process, three sub-processes audited over the same month:

| Sub-process | Units audited | Opportunities per unit | Defects | DPMO |
|---|---|---|---|---|
| Intake | 2,000 | 4 | 96 | 12,000 |
| Underwriting | 2,000 | 10 | 160 | 8,000 |
| Payout | 2,000 | 2 | 60 | 15,000 |

The sponsor asks in which sub-process a customer is most likely to experience a defect. Your answer:
A. Payout, because its DPMO is the highest of the three · B. Intake, because it is first in the flow and its defects propagate downstream · C. Underwriting: 0.080 defects per unit, against 0.048 for Intake and 0.030 for Payout; its DPMO looks better only because it counts ten opportunities ✅ · D. They are equivalent, because all three audited the same 2,000 units in the same month
`[B3 · G4 · Analyze · TXN · X · CERT]` — DPMO answers "per opportunity" and the sponsor asked "per unit," which is defects ÷ units; A is the trap of reading the normalized figure as the customer's experience.

**B3-23.** A changeover-time project has a stable I-MR chart, but the histogram is strongly right-skewed: most changeovers take 20–30 minutes and a tail runs to 90. Against a USL of 45 minutes, the software gives Cpk 0.9 with an expected 3,500 PPM over the limit, while the observed count is 26,000 PPM. What do you report at Tollgate 2?
A. The observed 26,000 PPM (2.6% over 45 min) with the skew shown on the histogram; note that the normal-based Cpk does not describe this shape, and ask your coach whether a Black Belt should look at it ✅ · B. Cpk 0.9 and the expected 3,500 PPM, since the index is the standard capability measure the rubric asks for · C. Neither figure; capability cannot be stated for skewed data at any belt level · D. The average of the two PPM figures, with a note that the true value lies somewhere between them
`[B3 · G4 · Apply · MFG · S · CERT]` — Cpk assumes a roughly normal shape, and when observed and expected disagree this much the observed count is the honest number; transforming or fitting another distribution is Black Belt scope, which is why B misleads the sponsor and C throws away a valid observed figure.

**B3-24.** Exhibit:
```
I chart — daily cycle time (hours, working time), 30 days
center 6.4   UCL 9.1   LCL 3.7
Test 1 (point beyond 3σ): none
Test 3 (6 in a row, all increasing or all decreasing): days 22–27 (6.5, 6.9, 7.2, 7.6, 8.0, 8.4)
MR chart: no tests failed
```
The correct reading:
A. The process is stable; every point sits inside the control limits and the MR chart is quiet · B. Days 22–27 are common cause, because none of them crossed 9.1 · C. The chart is invalid because a trend test cannot be applied to individual values · D. A trend is a special cause even inside the limits; find what began changing around day 22 before the process crosses the limit ✅
`[B3 · G4 · Analyze · NEU · X · CERT]` — The run rules detect drift before a single point breaks 3σ; A is what a reader who only checks Test 1 concludes, and it lets the drift run for another week.

**B3-25.** A team's one-pager states "Cpk = 1.33, which is a Six Sigma process." The correction:
A. Cpk 1.33 corresponds to about 3 sigma; Six Sigma needs Cpk 1.33 on both sides of the target · B. Cpk 1.33 corresponds to a 4-sigma process (short-term Z = 3 × Cpk); Six Sigma capability is Cpk 2.0 ✅ · C. Cpk and sigma level measure different things and cannot be compared on one page · D. The statement is right provided the process is centered on the target
`[B3 · G4 · Remember · NEU · K · CERT]` — Short-term sigma level is three times Cpk, so 1.33 is 4 sigma and 2.0 is 6; D is wrong because centering is already built into Cpk, and a centered 1.33 is still 4 sigma.

**B3-26.** A hospital pharmacy project has 20 weeks of baseline data for order-verification time. In week 8 the pharmacy introduced a new electronic order set, unrelated to your project. The I-MR chart shows a run of nine below center starting in week 9 and is otherwise quiet. For Tollgate 2 you:
A. Report capability from all 20 weeks, since the change was not part of your project · B. Report capability from weeks 1–8 only, because that is the true baseline before anything changed · C. Stage the chart at week 8, check that weeks 9–20 are stable, report capability from that segment as the current process, and say why on the one-pager ✅ · D. Restart data collection now, since a baseline containing any change is unusable for certification
`[B3 · G4 · Analyze · HC · S · CERT]` — Capability describes the process as it now runs, and the post-change segment is that process; A blends two processes into one index, and B reports the capability of a process that no longer exists.

**B3-27.** Exhibit — fabrication cell, bracket hole position:
```
Capability — hole position (mm from nominal), 25 subgroups of 5
LSL −0.20   USL +0.20   mean 0.01
Cpk 1.67   Ppk 1.61
Expected overall PPM outside spec   1.4
Observed PPM outside spec   48,000
```
Before Tollgate 2 you:
A. Report Cpk 1.67; the expected PPM is the statistically valid figure and the observed count is sampling noise · B. Report the observed 48,000 PPM and drop the indices, since observed data always beat estimates · C. Report both figures side by side and let the sponsor choose which to track · D. Report neither yet; an index of 1.67 and 4.8% observed outside the limits cannot both describe a stable, roughly normal process, so look at the histogram and the control chart for what the summary hides — a second population, a data-entry problem or an unstable mean ✅
`[B3 · G4 · Analyze · MFG · X · CERT]` — The contradiction is the finding; A trusts an assumption the data has already contradicted, and B reports a number without knowing what produced it.

**B3-28.** A customer-service project measures ticket resolution time in working hours. The sponsor's internal goal is 24 working hours; the customer contract commits to 40 working hours. For the baseline capability on the Tollgate 2 one-pager you:
A. Compute capability against the 40-hour contract, name the contract as the specification source, and show the 24-hour goal separately as a target ✅ · B. Compute capability against the 24-hour goal, because the sponsor owns the project and set it · C. Use the tighter of the two whenever they disagree, as the conservative choice for the customer · D. Compute capability against both and average the resulting Cpk values on the one-pager
`[B3 · G4 · Apply · TXN · S · CERT]` — The specification limit comes from the customer, and the rubric requires the source to be named; B treats a management target as a specification, which is the same confusion as drawing a target line and calling it a limit.

<!-- Section B3 tally — keys: A 7 · B 7 · C 7 · D 7 | types: X 11 · S 10 · K 7 | Bloom: Apply/Analyze 22 of 28 (Remember 2, Understand 4) | verticals: MFG 7 · HC 6 · TXN 7 · NEU 8 | negative stems: 0 | "when not to use": np (B3-5), c (B3-4), I-MR vs X̄-R (B3-12), Cpk on skewed data (B3-23), capability on unstable or short data (B3-1, B3-13, B3-17), DPMO with inflated opportunities (B3-10), DPMO vs DPU (B3-22), recomputed limits (B3-21) -->

---

## Section F — Leading the project: tollgates, sponsor, team, resistance basics, ethics of data (28 CERT)

**F1.** Tollgate 1 is on Thursday. Your charter is signed, but your SIPOC is half drawn and the stakeholder map is not started because two team members were pulled into month-end close. You:
A. Ask the coach to move Tollgate 1 to the following week, when the deliverables will be complete · B. Present on Thursday with what exists, name each gap and the date you will close it, and take the sponsor's decisions on what is there ✅ · C. Finish the SIPOC and stakeholder map yourself the night before so the tollgate looks complete · D. Skip Tollgate 1 and fold it into Tollgate 2, since Define and Measure overlap in week 2
`[F · G8 · Apply · TXN · S · CERT]` — Tollgates are on the calendar, not "when the project is ready," and a gap presented honestly becomes a coaching conversation rather than a silent slip; C hides the resource problem the sponsor needs to hear about.

**F2.** The one-page tollgate summary exists primarily so that:
A. The sponsor has a dated record to file for the annual audit re-review · B. The team can present a fuller deck later without repeating the basics · C. The reviewer can score the project without having to read the A3 · D. A stranger can follow problem → cause → change → result in under ten minutes, with exhibits carrying the argument ✅
`[F · G8 · Understand · NEU · K · CERT]` — The rubric scores exactly that ten-minute test under S1; B reverses the standard, since the one page and the A3 are the record, not a preview of a deck.

**F3.** Your sponsor, a nursing director, has missed two monthly coaching checkpoints and sends a delegate to Tollgate 2 who says "I'll pass it along." The delegate cannot decide the scope question you raised. Your best move:
A. Ask the sponsor directly for fifteen minutes, bring the one page and the one decision you need, and if it continues raise it with your coach as a sponsorship risk to the project ✅ · B. Accept the delegate's note as the tollgate decision and proceed; the calendar cannot slip · C. Ask the delegate to become the sponsor, since they are the one who shows up · D. Pause the project until the sponsor reappears; nothing valid can happen without them in the room
`[F · G8 · Analyze · HC · S · CERT]` — A project without an engaged sponsor cannot pass sponsor verification, so the disengagement is a project risk to manage rather than an inconvenience to route around; B moves the project forward on a decision nobody with authority has made.

**F4.** Exhibit — reviewer's score sheet for a machining project:

| Rubric area | Score | Note |
|---|---|---|
| Define | 14 / 15 | |
| Measure | 18 / 20 | ★ M3 earned |
| Analyze | 19 / 25 | ★ A3: 4 / 10 — "cause agreed in a team meeting; no test run" |
| Improve | 18 / 20 | ★ I3 earned |
| Control | 14 / 15 | ★ C1 earned |
| Storytelling | 5 / 5 | |
| **Total** | **88 / 100** | |

The outcome:
A. Pass: 88 exceeds the 75-point threshold with room to spare · B. Pass with a note, because four of the five mandatory items were earned · C. Does not pass; A3 is mandatory, and the feedback leads with the single most useful step to verify the cause with data, followed by resubmission ✅ · D. Fail with no resubmission; a project that reaches Control without a verified cause has to restart at Analyze
`[F · G8 · Analyze · MFG · X · CERT]` — Mandatory items are pass/fail regardless of total, which is the credential's asymmetry; D ignores the one revise-and-resubmit cycle every project gets.

**F5.** Your post-pilot data contain three weeks where turnaround spiked during a core-system outage. A team member says "that is not our process" and proposes deleting the three weeks from the dataset before it goes to the reviewer, with no note. You:
A. Agree; an outage is a special cause, and special causes are excluded from capability by definition · B. Agree, but keep a private copy of the full data in case the reviewer asks for it · C. Refuse, and stop the project until the reviewer rules on whether the outage counts · D. Keep the three weeks in the dataset and on the chart, annotate the outage with dates and evidence, and show the effect with and without it, labeled as such ✅
`[F · G8 · Analyze · TXN · S · CERT]` — Points can be explained and annotated but never silently removed, because removal is a data-ethics stop; A is the best distractor because excluding a known special cause from a limit calculation is legitimate only when it is shown, dated and explained.

**F6.** At the Tollgate 4 rehearsal, your sponsor says: "January had a bad batch of raw material. Take it out of the baseline so the improvement shows what it really is." Your response:
A. Agree; the sponsor owns the project and the bad batch genuinely was not typical of the line · B. Explain that the baseline stays as collected; if the bad batch is a verified special cause, show it annotated, add a labeled "typical months" comparison alongside, and let both numbers be seen ✅ · C. Decline without explanation; the reviewer will decide what counts as baseline · D. Remove January from the baseline but say so in a footnote on the one-pager
`[F · G8 · Analyze · MFG · S · CERT]` — A sponsor asking for a cleaner story is responding rationally to pressure to show results, and the honest chart usually tells that story better; D is the tempting middle, but a baseline with a month removed is no longer the baseline, footnote or not.

**F7.** The program requires that the reviewer who scores a Green Belt project is not the learner's instructor or coach because:
A. Someone who helped shape the project cannot judge it independently, and the credential depends on that judgment being separate from the coaching ✅ · B. Instructors and coaches are not calibrated on the rubric and would score inconsistently · C. Coaches are paid by the learner and would be biased toward a pass · D. The reviewer needs to be from a different vertical to catch industry blind spots
`[F · G8 · Understand · NEU · K · CERT]` — Separation of coaching and assessment protects both the learner (honest coaching) and the credential (honest scoring); C is wrong on the facts and on the reason, since the issue is role, not payment.

**F8.** At Tollgate 3, your sponsor asks you to add the inpatient pharmacy to your emergency-department medication-reconciliation project "because it is the same problem." You:
A. Agree; a bigger scope means a bigger result at certification · B. Agree on condition that the timeline extends by three months and the team gains a pharmacist · C. Hold the chartered scope, log the request, and propose it as a follow-on project or a Black Belt referral; a bounded slice finished passes, an expanded slice unfinished does not ✅ · D. Refuse, because scope cannot change after Tollgate 1 under any circumstances
`[F · G8 · Apply · HC · S · CERT]` — The rubric scores the project that was chartered and notes over-scoping, so protecting the boundary protects the sponsor's own outcome; D is too rigid, because a sponsor can re-charter, but that is a deliberate decision with a new charter, not an addition at a tollgate.

**F9.** Exhibit — your Week 1 stakeholder map for a production-line project:

| Stakeholder | Influence | Current stance | Note from interview |
|---|---|---|---|
| Line supervisor (process owner) | High | Resistant | "We tried this in 2019; it lasted a month" |
| Plant manager (sponsor) | High | Supportive | |
| Operators, both shifts | Medium | Neutral | Not yet involved |
| Finance analyst | Low | Neutral | Will validate savings at closure |

The resistance risk to plan for first, and the plan:
A. The operators; run a kick-off session so that they are no longer neutral · B. The Finance analyst; agree the savings method now so closure is not delayed later · C. The line supervisor; ask the sponsor to make participation an expectation of the role · D. The line supervisor; go and hear the 2019 story, find the design decision that let it lapse, and involve them in building the current-state map ✅
`[F · G8 · Analyze · MFG · X · CERT]` — High influence plus resistance is the risk that can stop the project, and the 2019 note is information about the system rather than stubbornness; C uses authority where curiosity would work, and hardens the stance.

**F10.** Which statement about the Practicum track is correct?
A. Practicum projects are scored on a simplified rubric without the sponsor items · B. Practicum projects are scored on the same rubric against a simulated dataset, with sponsor items scored by the practicum instructor acting as sponsor, and the credential carries the "(Practicum)" label ✅ · C. The Practicum label is removed once the learner completes a real project within a year · D. Practicum is the default route for corporate cohorts whose projects are confidential
`[F · G8 · Remember · NEU · K · CERT]` — The label is part of the credential rather than a provisional state; C is wrong because a later real project would be a separate certification, not a relabeling.

**F11.** An individual enrollee has no employer project and wants the unlabeled credential. Between the partner-project pool and the Practicum track, you advise:
A. Practicum, because a simulated dataset is cleaner to analyze and the exam is identical · B. Either; employers treat the two credentials the same and the rubric is identical · C. The partner-project pool, because it is a real project with a real sponsor, which is what the unlabeled credential requires ✅ · D. Neither; individuals without an employer project cannot enroll at Green Belt
`[F · G8 · Apply · TXN · S · CERT]` — The Practicum credential is distinctly labeled by design, so the only path to the unlabeled one is a real, sponsor-verified project; A trades the credential the learner wants for convenience.

**F12.** Two weeks into baseline collection on a ward, nurses have stopped filling in the paper tally you designed. The form takes about four minutes per patient, and nobody has seen a chart from it. The move that treats this as a design problem:
A. Shorten the form to the one operational definition you need, show the first chart to the ward within the week, and ask the nurses what would make the tally fit their round ✅ · B. Ask the nurse manager to remind staff that data collection is mandatory for the project · C. Collect the data yourself for the remaining four weeks to keep the baseline clean and consistent · D. Switch to a system report, even though it measures something slightly different from the tally
`[F · G8 · Apply · HC · S · CERT]` — People who see no result from four minutes of extra work per patient are responding rationally; B treats a design failure as a compliance failure, and D changes the operational definition mid-baseline.

**F13.** Exhibit — before/after summary submitted with a Green Belt project:

| | Baseline (Jan–Feb) | Post-pilot (May) |
|---|---|---|
| Metric | First-pass yield | First-pass yield |
| Operational definition | Units passing final test with no rework | Units passing final test, rework permitted before test |
| Result | 82% | 94% |

The reviewer's correct action:
A. Accept the 12-point improvement with a caveat about the definition change · B. Stop the review, request resubmission with one operational definition applied to both periods (re-deriving the baseline from test records where they exist), and note it to the assessment lead ✅ · C. Score I3 at half marks for a partially comparable result and pass the project on total · D. Ask the learner to add a third period under the original definition and average the three
`[F · G8 · Analyze · MFG · X · CERT]` — A changed operational definition between before and after is one of the three named data-ethics stops, and the 94% may say nothing about the countermeasure; A rewards a comparison the rubric says is not a comparison.

**F14.** Your team started its pilot before collecting a baseline. The supervisor offers "we were running about 70% before, everyone knows that." For the before/after evidence you:
A. Use 70% as the baseline and attribute it to the supervisor by name · B. Use 70% but widen it to a 65–75% range to show the uncertainty honestly · C. Present the post-pilot data alone and call the project an honest failure · D. Do not present a remembered figure as a baseline; pull the metric from system records for the pre-pilot period if they exist, otherwise collect a comparison from an unpiloted area or period and say exactly what it is ✅
`[F · G8 · Analyze · NEU · S · CERT]` — A baseline reconstructed from memory is a data-ethics stop, however sincere the memory; B dresses the same problem in a range.

**F15.** The Green Belt calendar puts each tollgate on a fixed week rather than "when the project is ready." The purpose:
A. To let the instructor review all projects in the same week and calibrate scores · B. To shorten the course by removing slack from the eight weeks · C. To keep each project moving with the phase being taught and make the sponsor's decision a fixed event, so a slipped deliverable becomes a coaching conversation instead of a silent delay ✅ · D. To ensure every project finishes by the end of week 8
`[F · G8 · Understand · NEU · K · CERT]` — Phase-locking is the learning design, because you execute what you learned that week; D is wrong because completion may extend up to six months after week 8, with certification withheld until closure.

**F16.** At closure of a billing project, the sponsor says "I'll sign whatever you send me — you did the work." You:
A. Walk them through the one page and the control plan, ask them to check the results against what they saw, and make sure Finance has validated the claimed saving before they attest to it ✅ · B. Send the form; the sponsor's confidence in the team is itself the attestation · C. Ask your coach to sign instead, since they know the project in more detail than the sponsor · D. Leave the financial line blank so the sponsor has less to verify and the form goes through faster
`[F · G8 · Apply · TXN · S · CERT]` — Sponsor verification is an attestation that the project happened and the results are real, and it is sampled in the annual 10% re-review; B turns a check into a formality, which is what the check exists to prevent.

**F17.** Exhibit — timeline of a clinic project:

| Milestone | Date |
|---|---|
| Week 8 (Tollgate 4 held; control plan drafted) | 12 Jun |
| Pilot start (unit could not release staff earlier) | 15 Aug |
| Pilot end; before/after evidence due | 26 Sep |
| Control plan live for 30 days | 26 Oct |

In late June the sponsor asks for the certificate "since the course is finished." The correct position:
A. Issue the certificate now; the exam is passed and the eight weeks are complete · B. The learning is complete; certification waits for closure, which may run up to six months after week 8, with monthly coaching checkpoints until then ✅ · C. Issue the "(Practicum)" credential now and upgrade it when the pilot closes · D. Withdraw the project; a pilot that cannot start within the eight weeks fails the timeline requirement
`[F · G8 · Analyze · HC · X · CERT]` — Three gates are required, and the project gate cannot be earned before the before/after evidence and the control plan exist; C misuses the Practicum label, which marks a simulated project, not an unfinished real one.

**F18.** In your team meetings, the process engineer answers every question first and the two operators have not spoken in three sessions. The meetings are in the engineer's office at the start of the operators' shift. The change that addresses the design of the meeting:
A. Ask the engineer privately to speak less and leave room for others · B. Remove the engineer from the team so the operators feel free to contribute · C. Ask the operators privately afterwards for what they did not say in the room · D. Move the meeting to the line or a neutral room at a time inside the operators' shift, and use silent writing and round-robin so every member contributes before discussion opens ✅
`[F · G8 · Apply · MFG · S · CERT]` — The engineer is responding rationally to a setting that favors them, so change the setting and the method; C accepts the silence in the room as permanent and builds a workaround around it.

**F19.** At Tollgate 2 of an accounts-receivable project, the sponsor asks "so what is the root cause?" Your best answer:
A. "We do not know yet — here is the stable baseline, the capability against the customer's terms, and the candidate causes we will test in Analyze; Tollgate 3 is where you get the verified answer" ✅ · B. Give the team's strongest hunch, clearly labeled as a hunch, to keep the sponsor engaged · C. Ask the sponsor for their opinion on the cause and record it as the leading hypothesis · D. Say the cause is obvious from the fishbone and describe the branch with the most entries
`[F · G8 · Apply · TXN · S · CERT]` — The Measure tollgate's job is stability and capability, and naming a cause before it is tested primes the team and the sponsor toward it; B is the best distractor because the label does not stop a sponsor from acting on a hunch.

**F20.** Under the review rubric, which project can pass?
A. A 60% improvement measured over a two-day window, with a signed control plan · B. A verified cause with a countermeasure that was never piloted because the sponsor approved it directly · C. A pilot that did not move the metric, documented with the same rigor as a success and a real next step, with every mandatory item earned ✅ · D. A project scoring 92 in which the root cause was agreed by the team but not tested
`[F · G8 · Understand · NEU · K · CERT]` — Honest failure passes and a two-day "success" does not; D is the high-scoring fail that the reviewer calibration anchor set exists to teach.

**F21.** Your pilot on a clinic was planned for six weeks with a written prediction. At week six the metric has not moved. A team member proposes running "another couple of weeks until it shows improvement" and reporting the best six weeks. You:
A. Extend by two weeks; six was arbitrary and more data is always better · B. Report the full six weeks against the prediction as written; if you extend, write a new prediction and a reason first, and report the whole window either way ✅ · C. Stop the pilot and report it as a success on the direction of the trend · D. Report the best six weeks, with a note that the early weeks were a learning period
`[F · G8 · Analyze · HC · S · CERT]` — Choosing the window after seeing the data is selective reporting, whatever the note says; D is the polite version of the same thing.

**F22.** Exhibit — a claims project's draft Tollgate 3 one-pager, as checked by the coach:
```
Tollgate 3 one-pager — contents check
1. Problem statement (unchanged since charter)                    present
2. Baseline I-MR chart, stable; Ppk 0.6 against 5-day SLA         present
3. Fishbone → C&E matrix → 5 checkable causes                    present
4. Verified cause "Monday batch release": two-sample t, p = 0.003
   (no effect size, no plain-language sentence)                   partial
5. Proposed countermeasure: daily release                         present
6. Ask of the sponsor                                             missing
```
Your single highest-leverage feedback:
A. Add the ask of the sponsor; a tollgate without a decision is a status update · B. Replace the t-test with a chart, since sponsors do not read p-values · C. Move the countermeasure to Tollgate 4, where the rubric places Improve · D. State the effect size in days and the sentence you would tell the sponsor for item 4; a p-value alone does not earn the mandatory A3 item, and everything after it depends on that ✅
`[F · G8 · Analyze · TXN · X · CERT]` — The rubric reads the ★ items first, and A3 is what this page has not yet earned; A is a real gap but a smaller one, and it is the second sentence of the feedback, not the first.

**F23.** The three gates that must all be met for the Green Belt credential are:
A. The proctored exam, the rubric-reviewed project scored by a reviewer who is not the learner's coach, and sponsor verification ✅ · B. The proctored exam, attendance at all eight live labs, and the coach's sign-off on the A3 · C. The exam, a project of any scope, and a Finance-validated saving · D. The exam, the project, and the 90-day sustainment check
`[F · G8 · Remember · NEU · K · CERT]` — Sustainment is checked after certification and feeds the badge's "sustained" flag; D moves a post-certification check into the gate.

**F24.** Between Tollgates 2 and 3, your sponsor says "we already know it is the supplier — order the countermeasure now and skip the statistics." You:
A. Implement the supplier change; the sponsor has the authority, and Analyze can be documented afterwards · B. Refuse, and remind the sponsor that the calendar does not allow changes between tollgates · C. Treat "the supplier" as the leading candidate cause and test it first — stratify the baseline by supplier and run the comparison — and explain that a countermeasure aimed at an unverified cause fails the mandatory A3 item ✅ · D. Run the test the sponsor wants and implement the change regardless of what it shows
`[F · G8 · Apply · MFG · S · CERT]` — The sponsor may well be right, and testing their hypothesis first is both respectful and fast; A gambles the project's certification and, if the supplier is not the cause, the sponsor's money.

**F25.** Your reviewer's feedback on a clinic project lists two strengths, then: "★ M3 not earned — 'we trust the system timestamps' is not a reviewer-accepted reason; ★ A3 earned; ★ I3 earned; ★ C1 earned. Highest-leverage fix: a timestamp integrity check on 30 records." You:
A. Appeal the score, since the timestamps come from the electronic record and are objectively accurate · B. Run the integrity check the feedback names, document the result and what you did about any gap, and use the one revise-and-resubmit cycle ✅ · C. Ask your coach to score the resubmission, since they know from the checkpoints that the timestamps are reliable · D. Rewrite the project around a manual metric so that a Gage R&R can be run instead
`[F · G8 · Apply · HC · S · CERT]` — The feedback format leads with the single fix that earns the missing ★ item, and the resubmission cycle exists for exactly this; C breaks the coach/assessor separation, and D replaces a good metric with a worse one to satisfy a form.

**F26.** Exhibit — the roles table of a charter brought to the Week 1 charter clinic:

| Charter role | Name |
|---|---|
| Sponsor | Plant manager |
| Process owner | (blank) |
| Team members | Two operators, one maintenance technician, one planner |
| Coach | Program coach, checkpoints monthly |
| Project reviewer | The same program coach |

The corrections the coach makes before anything else:
A. Add a Finance representative to the team and move the coach to the sponsor line · B. Replace the two operators with their supervisor and add a quality engineer · C. Replace the plant manager as sponsor with the line supervisor and add Finance · D. Strike the coach from the reviewer line — the reviewer is a Black Belt or Master Black Belt who is not the coach or instructor — and name the process owner who will sign the control plan ✅
`[F · G8 · Apply · MFG · X · CERT]` — Both fixes touch certification (separation of coaching and assessment; ★ C1 requires a named owner), so they come before nice-to-haves; B removes the people who know the work best.

**F27.** Three weeks after handover of new standard work in a contact center, the team leads report that agents "are not following it on Fridays because the volumes do not fit." The sponsor proposes a compliance audit. You:
A. Treat it as information about the design: go and see a Friday, measure what does not fit, and revise the standard with the agents who do the work ✅ · B. Support the audit; a standard that is not followed has to be enforced first and improved later · C. Add a Friday exception to the standard so that compliance is technically met · D. Escalate to the sponsor's manager to reinforce the change with more authority
`[F · G8 · Analyze · TXN · S · CERT]` — Resistance that names a specific condition is a design finding, and the people naming it are the most competent people in the room about Fridays; B enforces a standard the work has already shown does not fit.

**F28.** The 90-day sustainment check asks the sponsor:
A. Whether the learner is ready to be nominated for Black Belt · B. Whether the financial saving has grown since closure · C. Whether the control plan held, which feeds the published outcomes page and the badge's "sustained" flag ✅ · D. Whether the team has started a second project on the same process
`[F · G8 · Remember · NEU · K · CERT]` — The check is about the process holding, not about new results; B expects growth where the goal is sustainment.

<!-- Section F tally — keys: A 7 · B 7 · C 7 · D 7 | types: S 15 · X 6 · K 7 | Bloom: Apply/Analyze 21 of 28 (Remember 3, Understand 4) | verticals: MFG 7 · HC 6 · TXN 7 · NEU 8 | negative stems: 0 | coverage: tollgates F1 F2 F15 F19 F22; sponsor F3 F6 F16 F24; team and resistance F9 F12 F18 F27; data ethics F5 F6 F13 F14 F21; scope F8; coach/assessor separation F7 F25 F26; Practicum and credential F10 F11 F17 F23 F28; rubric outcomes F4 F20 -->

---

v1.0 · 2026-09-20
