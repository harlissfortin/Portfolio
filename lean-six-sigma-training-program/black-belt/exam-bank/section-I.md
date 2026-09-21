# Black Belt Exam Bank — Section I: Program economics, DFSS and digital CI

Part of the Black Belt certification item bank. Blueprint, minimally competent candidate
statement, tag format and pool rules: [`../exam-bank.md`](../exam-bank.md). Governing policy:
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).
Project-side requirements these items assess against: [`../project/review-rubric.md`](../project/review-rubric.md)
(Financial validation ★ F1 and F2).

Section I draws **12 items per form** from the **42 CERT items** below. Objective **B9** —
build the financial case with Finance (items I1–I30: cost of poor quality, benefit
classification, calculation basis and annualization, double counting, Finance partnership and
sign-off, project cost netting, extrapolation limits). Objective **B10** — DFSS and digital CI
awareness (items I31–I42: when a process must be designed rather than improved, the DMADV
phases, QFD as a translation tool; what an event log is and what process mining can and cannot
tell you, automation triage, cautions for AI-era operations). Tag format
`[section · objective · Bloom · vertical · type · pool]`; correct option ✅; rationale after the
dash. Exhibits (type X) precede the stem as a small table or a fenced block of software-style
output. All monetary figures are illustrative; every quantity states its units and basis, and
the Finance convention that governs an item is stated in its stem.

---

## Section I — Program economics, DFSS awareness, digital CI awareness (42 CERT)

**I1.** Cost-of-quality lines from a machining plant's annual quality-cost review, as the plant controller drafted them (illustrative, last fiscal year):

| Line | Annual cost | Category assigned |
|---|---|---|
| Incoming inspection of castings | $184,000 | Prevention |
| Scrap and rework, machining | $612,000 | Internal failure |
| Warranty returns and field repair | $355,000 | External failure |
| Gauge calibration program | $41,000 | Appraisal |
| Operator training on the new fixture standard | $28,000 | Prevention |
| Customer chargebacks for shipments late after rework | $97,000 | External failure |

Which line is misclassified?
A. Incoming inspection — it detects defects already made by the supplier's process; that is appraisal, not prevention ✅ · B. Gauge calibration — keeping gauges accurate stops defects from being made, so it is prevention · C. Customer chargebacks — a shipping penalty is a logistics cost, not a quality cost · D. Operator training — training is a general overhead cost, not a quality cost
`[I · B9 · Analyze · MFG · X · CERT]` — Prevention spend stops a defect from being made; inspection finds one that was; B is the nearest contest, but calibration keeps the measurement system fit to detect and is booked with appraisal, so the controller's assignment stands while incoming inspection under prevention does not.

**I2.** A site's cost-of-poor-quality report shows prevention spending up 60% year on year, appraisal flat, internal failure down 35%, external failure down 50% and total quality cost down 18%. The site lead reads the first line and proposes cutting the prevention budget back to last year's level "because quality costs are rising." The Black Belt's best reply:
A. Agree — prevention is overhead, and the failure reductions are now locked in by the control plans · B. Show the four categories together: the prevention increase is the investment that produced the failure reductions and the total fell; cutting it is the decision most likely to bring the failure costs back ✅ · C. Move the training and mistake-proofing spend from prevention to appraisal so the report reads better next year · D. Report only the total quality cost from now on so the prevention line stops drawing attention
`[I · B9 · Evaluate · NEU · K · CERT]` — A treats prevention as a cost to minimize rather than the lever that moves the failure categories; C and D fix the report instead of the decision.

**I3.** Cost-of-quality lines for a hospital laboratory's specimen process (illustrative, annual):

| Line | Annual cost | Category assigned |
|---|---|---|
| Phlebotomy competency training and annual re-check | $62,000 | Prevention |
| Repeat blood draws after hemolyzed samples, detected in the lab before any result was reported | $148,000 | External failure |
| Monthly chart audits of specimen labeling | $19,000 | Appraisal |
| Bedside barcode label printers (one-time, year 1) | $54,000 | Prevention |
| Treatment delays and extended stays traced to results reported late or wrong | $410,000 | External failure |

Which line is misclassified, and why?
A. Chart audits — audits improve the process, so they are prevention · B. Barcode printers — a capital purchase is never a quality cost · C. Repeat draws — the defect was caught inside the lab before a result reached the clinician or patient, so it is internal failure; external failure is what escapes to the customer ✅ · D. Treatment delays — clinical consequences are a patient-safety measure, not a cost of quality
`[I · B9 · Analyze · HC · X · CERT]` — The internal/external line is where the defect is detected relative to the customer, not how expensive it was; A is the common confusion between checking (appraisal) and preventing.

**I4.** A Black Belt in a mortgage-servicing operation completes a cost-of-poor-quality study: rework, re-keying, customer call-backs and regulatory remediation total $2.6 million/yr (illustrative). The sponsor drafts the charter with "financial benefit: $2.6 million" and asks Finance to book it at closure. What should the Black Belt do with the figure?
A. Keep it as the benefit; the study was thorough and Finance supplied the cost rates · B. Halve it to be conservative and book the remainder as soft savings · C. Book it as cost avoidance, because once the process is fixed those costs will no longer be incurred · D. Use it to size and prioritize the opportunity in the charter; state the benefit at closure as only the verified reduction in those cost lines, on the project's scope, classified and signed by Finance ✅
`[I · B9 · Apply · TXN · S · CERT]` — A cost-of-poor-quality total is the size of the pool, not a claim; C mislabels a current expense as an avoided one, and B is a made-up number wearing prudence.

**I5.** Finance's convention for the program: benefits are reported net of the incremental cash costs the project caused; time already paid for in existing salaries is not netted unless a position or overtime line changed. A project lists: (1) $22,000 one-time for a new fixture and its validation; (2) $9,000/yr for a software license the countermeasure requires; (3) 320 hours of the team's regular working time over four months; (4) $6,000 one-time for a team member's external training last year, unrelated to the countermeasure. Which lines are netted against the benefit?
A. Lines 1 and 2 — the incremental one-time and continuing costs the countermeasure created; line 3 is existing salaried time and line 4 predates and is unrelated to it ✅ · B. Lines 1, 2 and 3 — every hour of effort has a cost and should be counted · C. Line 1 only — a continuing cost belongs in the department's running budget, not the project · D. All four — every cost associated with the project and the people on it
`[I · B9 · Apply · NEU · K · CERT]` — C is the common omission: a continuing cost the countermeasure created is netted every year it runs; B costs time that would have been paid anyway, against the stated convention.

**I6.** Benefits register submitted to Finance by a shared-services Black Belt (illustrative; Finance-agreed rates):

| # | Benefit line | Annual amount | Class claimed |
|---|---|---|---|
| 1 | Overtime in the invoicing team reduced; confirmed in the department's monthly actuals | $61,000 | Hard |
| 2 | 1.4 FTE of processing time freed across three teams; no headcount, agency or overtime change | $98,000 | Hard |
| 3 | Approved requisition for two temporary staff at year-end, cancelled before hiring | $44,000 | Cost avoidance |
| 4 | Early-payment discounts recovered by paying inside supplier terms; confirmed in AP actuals | $37,000 | Hard |
| 5 | Supplier calls handled per week, down from 210 to 90 | — | Operational measure |

Which line is misclassified?
A. Line 3 — a cancelled requisition is hard savings because the spend was approved · B. Line 2 — freed time with no change to a budget line is soft (capacity), not hard; it becomes hard only when a headcount, agency or overtime line moves and Finance confirms it ✅ · C. Line 4 — recovered discounts are revenue, not savings · D. Line 5 — every benefit line must carry a monetary value to be registered
`[I · B9 · Analyze · TXN · X · CERT]` — A confuses "approved" with "spent": the temps were never paid, so the expense was avoided, not saved; line 5 is the honest way to carry a result that has no budget movement.

**I7.** A Black Belt's project raises the output rate of a sub-assembly cell from 88 to 104 units/h (verified, 10 weeks, X̄ chart). The cell feeds final assembly, which is the plant constraint at 92 units/h; the plant sells everything final assembly builds. The sponsor proposes a revenue benefit: 16 units/h × contribution margin × run-hours. The Black Belt's assessment:
A. Valid — the cell now makes 16 more units an hour and each carries its contribution margin · B. Valid in principle, but at selling price rather than contribution margin · C. Not valid as revenue — the constraint still releases 92 units/h, so no extra unit is sold; the gain is capacity at a non-constraint, reported as soft unless the cell's overtime or shifts are reduced, which would then be hard ✅ · D. Valid as cost avoidance, since the cell will not need a second shift when volume grows
`[I · B9 · Evaluate · MFG · S · CERT]` — A counts units that pile up as inventory in front of the constraint; D assumes a second shift was planned, which the stem does not say.

**I8.** A Black Belt reduces sepsis-bundle non-compliance in an emergency department from 31% to 12% of eligible patients (verified, p chart, 5 months). No budget line moves. The Chief Medical Officer signs a statement attesting the metric, the baseline and the method; Finance was not asked to sign. At capstone review, ★ F1 should be scored as:
A. Unearned — F1 requires a named Finance partner's signature on every certifiable project · B. Unearned — the project should have monetized the compliance gain as avoided treatment cost · C. Earned only if Finance also countersigns the Chief Medical Officer's statement · D. Earned — a mission or clinical benefit is reported in its own unit and validated by the sponsor's executive equivalent, named; monetizing it without a Finance-agreed method would be the defect ✅
`[I · B9 · Evaluate · HC · S · CERT]` — The rubric names the executive equivalent for mission-metric projects; B invents a dollar figure the evidence does not carry, and A applies the money rule to a project that claims no money.

**I9.** Benefit calculation, claims-intake rework project at an insurer (illustrative):

```
Rework rate:                 8.4% → 3.1% of claims  (verified, p chart, 9 weeks)
Rework cost per claim:       $14.60  (Finance's agreed rate)
Volume basis used:           trailing 12 months, 412,000 claims
Annual benefit claimed:      0.053 × 412,000 × $14.60 = $318,800  hard
Finance note in the file:    "Volume forecast, next 12 months: 290,000 claims — the largest
                              client contract ends in November; already announced."
```

What is wrong with the claim?
A. It annualizes on trailing volume when Finance has a forward forecast 30% lower; the 12-month figure uses 290,000 claims (≈ $224,000), and the difference is never reported as benefit ✅ · B. Nothing — trailing 12 months is the standard annualization basis · C. The rate reduction should be re-verified after November before anything is claimed · D. The claim should be discounted by half because a forecast is uncertain
`[I · B9 · Analyze · TXN · X · CERT]` — Annualization runs forward from go-live at the volume Finance expects to see; B applies a convention the stem's Finance note overrides, and C delays a legitimate, correctly based claim.

**I10.** First-year benefit statement from a fixture-redesign project (illustrative). Finance's convention: first-year net benefit = gross annual hard savings − one-time implementation cost − continuing costs incurred in that year.

```
Gross annual hard savings (scrap and rework, confirmed in plant actuals):   $212,000
One-time cost (fixtures, validation, first-article inspection):              $46,000
Continuing cost (annual calibration contract for the new gauges):            $18,000/yr
Reported:  "First-year net benefit $166,000; ongoing $212,000/yr"
```

The correct figures under Finance's convention are:
A. First year $166,000; ongoing $212,000 — as reported, because the calibration contract is a department cost · B. First year $148,000; ongoing $194,000 — the calibration contract recurs every year and was left out of both figures ✅ · C. First year $148,000; ongoing $212,000 — continuing costs apply in year one only · D. First year $212,000; ongoing $212,000 — implementation costs are capital and excluded from benefit
`[I · B9 · Apply · MFG · X · CERT]` — The reported figure nets the one-time cost and forgets the cost that never stops; C nets it once, which is the same omission a year later.

**I11.** Benefits register for a hospital's nursing division, three projects closed this year (illustrative):

| Project | Claimed hard savings | Basis |
|---|---|---|
| Discharge-by-noon (Black Belt) | $140,000/yr | Nursing overtime reduced, unit 4 East |
| Admission-order turnaround (Green Belt) | $95,000/yr | Nursing overtime reduced, unit 4 East |
| Float-pool scheduling (Green Belt) | $75,000/yr | Nursing overtime reduced, division-wide |
| Total claimed | $310,000/yr | |
| Division nursing overtime, last fiscal year (Finance actuals) | $240,000 | |
| Division nursing overtime, current year to date, annualized | $158,000 | |

What should the Black Belt conclude?
A. The claims are valid; each project verified its own before/after on its own chart · B. Only the Black Belt project's claim stands, because it is the largest and best documented · C. The claims are double counted — three projects draw on one overtime pool and the total exceeds it; reconcile with Finance to the observed budget movement (about $82,000/yr so far) and attribute it across the projects by an agreed method before any is booked ✅ · D. Report $310,000 as run-rate and $82,000 as realized to date
`[I · B9 · Analyze · HC · X · CERT]` — D keeps a total the budget line proves cannot exist; A ignores that three before/after comparisons on one overtime line all measured the same drop.

**I12.** At the week-2 charter review a sponsor tells a Black Belt: "Don't bother Finance until we have a result to show them." The project's primary metric is a cost line. The Black Belt's best move:
A. Follow the sponsor's lead and prepare a complete benefit case for Finance at closure · B. Ask Finance to sign the charter's target as a commitment to the executive team · C. Send Finance the baseline data at the end of Measure for information only · D. Name a Finance partner now and agree the calculation basis — metric, unit values, volume basis, classes, what counts as a cost — before the baseline closes, so the "before" is Finance's number as much as the team's ✅
`[I · B9 · Apply · NEU · S · CERT]` — A is the sponsor's rational shortcut and the most common reason F1 fails: a method argued about after the result exists looks like negotiation; B asks Finance to attest a forecast, which is not its role.

**I13.** A Black Belt's imaging-turnaround project claims $210,000/yr hard savings (freed technologist time at a fully loaded rate). The named Finance partner will sign $90,000 hard — an agency-staffing contract cancelled — and lists the remaining hours as capacity. The sponsor asks the Black Belt to show "$210,000, under Finance review" on the executive readout, because that is what the executive team was promised. The Black Belt should:
A. Present $90,000 hard, Finance-signed, plus the freed hours as an operational result and what the unit is doing with them; explain to the sponsor beforehand why one validated number protects their credibility more than a larger unsigned one ✅ · B. Present $210,000 with a footnote that Finance's view differs and will be reconciled · C. Present both figures side by side and let the executive team decide which to accept · D. Present $150,000 as a midpoint the sponsor and Finance can both live with
`[I · B9 · Evaluate · HC · S · CERT]` — B and C put two numbers for one project in front of the people who set the promise; the closure record and the readout carry the validated figure, and the capacity is real and is reported as such.

**I14.** Benefit statement from a changeover-reduction project (illustrative):

```
Pilot lines:         2 of 8 packaging lines (lines 3 and 5)
Verified per line:   $38,000/yr hard  (overtime reduced, confirmed in actuals, 12 weeks)
Rollout status:      lines 1–2, 4, 6–8 scheduled over the next two quarters
Benefit claimed:     8 × $38,000 = $304,000/yr hard
```

The reviewer's correct reading for ★ F1 and F2:
A. Accept $304,000 — the same countermeasure will be applied on every line by the same team · B. Verified hard savings are $76,000/yr on the two pilot lines; the remaining $228,000 is a projection that may be shown only with its assumption labeled (same result on lines that differ in product and equipment) and stays out of the signed figure until each line's own actuals move ✅ · C. Reject the claim entirely until all eight lines have 12 weeks of post-change data · D. Accept $304,000 as cost avoidance, since the other lines' overtime will now be avoided
`[I · B9 · Analyze · MFG · X · CERT]` — C throws away a clean verified result; D changes the class to escape the evidence window, which is the same extrapolation under another label.

**I15.** Finance reports a project's benefit as two figures: "realized to date" and "annualized run-rate." Eight months after go-live a project shows $48,000 realized and a $96,000 run-rate. Which statement uses the two figures correctly?
A. The project has delivered $96,000, since the run-rate is the annual figure · B. The project has delivered $144,000, the two figures combined · C. The change has produced $48,000 of confirmed budget movement so far; if the current monthly rate holds for 12 months it would produce $96,000/yr — the second figure is a projection, and only the first is booked ✅ · D. The run-rate is the figure Finance signs, because it is the annualized one
`[I · B9 · Understand · NEU · K · CERT]` — B adds a realized amount to a rate, and D reverses what gets signed: Finance signs what has moved in the actuals and labels the rest.

**I16.** A payments operation has paid a regulator's late-reporting penalty of about $120,000 in each of the last three years; the amount sits as a line in the compliance budget. A Black Belt's project fixes the reporting cycle; the penalty is not incurred this year and Finance confirms the budget line has been released. A second project in the same operation redesigns a control so that a *possible* future fine of up to $500,000, never yet levied, becomes unlikely. How are the two benefits classified?
A. Both hard savings — each removes a regulatory cost · B. Both cost avoidance — a penalty is a cost the organization avoids · C. The first is cost avoidance; the second is hard, because the amount is larger and the control is confirmed · D. The first is hard savings — a recurring, budgeted expense stopped and Finance confirms the line moved; the second is cost avoidance at most, and only with a Finance-agreed probability-weighted method, since the expense was never in a budget ✅
`[I · B9 · Analyze · TXN · S · CERT]` — B treats "penalty" as a category; the discriminator is whether the money was a budgeted, recurring outflow that has now stopped, not what the money was for.

**I17.** A medication-administration redesign on two inpatient units frees a verified 48 nursing hours/week (measured 10 weeks, same operational definition as baseline). The units cancel a 1.0 FTE (40 h/week) agency-nurse contract worth $148,000/yr, which Finance confirms; the remaining freed hours are absorbed into patient care with no other budget change. The benefit statement should read:
A. Hard savings $148,000/yr (agency contract cancelled, Finance-confirmed); the remaining ≈ 8 hours/week reported as soft capacity, in hours, not dollars ✅ · B. Hard savings for all 48 hours/week at the agency rate, since every freed hour is real · C. Soft savings for all 48 hours/week, since nursing headcount is unchanged · D. Cost avoidance of $148,000/yr, since the agency contract was a future expense
`[I · B9 · Apply · HC · S · CERT]` — C misses that a budget line did move; B values the hours nobody stopped paying for at the rate of the ones that were, and D calls a cancelled current contract an avoided one.

**I18.** A cost-of-poor-quality study for a plant totals $4.2 million/yr across scrap, rework, warranty and inspection (illustrative). The plant manager asks a Black Belt to charter one project "to take out the $4.2 million." The Black Belt's best reply:
A. Accept — a large target is what a Black Belt–scale project is for · B. Use the study to see where the $4.2 million concentrates, charter the project on the largest addressable stream with a target it can verify, and put the rest into the site's portfolio as candidate projects ✅ · C. Decline — cost-of-poor-quality studies are too imprecise to charter from · D. Charter the project at $4.2 million and re-scope it downward at each tollgate as the data come in
`[I · B9 · Evaluate · MFG · S · CERT]` — D writes a target the project cannot own and leaves it to shrink in public; C throws away the study's real use, which is to point the portfolio at the money.

**I19.** Two-year cost-of-quality summary for a claims operation (illustrative, $ thousands, same definitions both years, claims volume flat):

| Category | Year 1 | Year 2 |
|---|---|---|
| Prevention (training, standard work, error-proofing) | 210 | 390 |
| Appraisal (QA sampling, audits) | 480 | 470 |
| Internal failure (rework before payment) | 1,120 | 760 |
| External failure (overpayments, complaints, regulatory remediation) | 890 | 610 |
| Total | 2,700 | 2,230 |

The operations director's proposal for year 3 is "cut QA sampling by half now that failure is down." Which reading is correct?
A. Agree — appraisal is now the largest controllable line and the failure trend is favorable · B. Failure fell because appraisal caught more; keep sampling as it is and trim prevention instead · C. Prevention rose and both failure categories fell while appraisal stayed flat, so the reduction traces to prevention; cutting sampling before the failure rate is shown stable on a chart removes the detection that would reveal a relapse — reduce appraisal only after stability is demonstrated, and by design ✅ · D. Total quality cost is still $2.2 million, so nothing has really changed and the proposal is premature for that reason
`[I · B9 · Evaluate · TXN · X · CERT]` — B has the causal arrow backward: appraisal did not change, so it cannot explain the drop; A is the rational reaction of someone reading a budget line without the chart behind it.

**I20.** Finance publishes two labor rates: a fully loaded rate ($68/h, including allocated overhead such as facilities and IT) and a direct rate ($44/h, salary and benefits). A project eliminates one vacant position that will not be backfilled (hard savings, Finance-confirmed) and separately frees 300 hours/yr of a supervisor's time (soft). Which rates apply?
A. Fully loaded for both — it is the true cost of an hour of work · B. Direct for the position, fully loaded for the freed hours · C. Fully loaded for the position, direct for the freed hours · D. The position at the budget line that actually disappears — salary and benefits, the direct rate; the freed hours in hours, with a dollar value only if Finance chooses to state one and at the direct rate at most, because allocated overhead does not leave the building when a position does ✅
`[I · B9 · Apply · NEU · K · CERT]` — A is the training-deck habit Finance strips out: an overhead allocation is an accounting spread, not a cash flow a project can remove.

**I21.** Benefit calculation from a changeover project on a non-constraint filling line (illustrative):

```
Time saved per changeover:    17 min  (verified, I-MR, 40 changeovers)
Changeovers:                  6 per shift
Basis used:                   3 shifts/day × 365 days = 1,095 shifts/yr
Hours freed:                  17 × 6 × 1,095 / 60 = 1,861 h/yr
Value:                        1,861 h × $52/h (Finance's line-crew rate) = $96,800/yr
Class:                        Soft (capacity; no crew or overtime change)
Plant operating pattern:      2 shifts/day, 250 days/yr; the line is idle on the third shift
```

The error is:
A. The basis — the line runs 500 shifts/yr, not 1,095, so the freed time is 17 × 6 × 500 / 60 = 850 h/yr (≈ $44,200 at Finance's rate, still soft) ✅ · B. The class — freed crew time on a running line is hard savings · C. The rate — soft savings are valued at the fully loaded rate, not the crew rate · D. The verification — 40 changeovers is too few to annualize from
`[I · B9 · Analyze · MFG · X · CERT]` — The class is right and the rate is Finance's; B would compound the error by hardening capacity on a line that changed no budget, and D invents a sample threshold.

**I22.** Revenue benefit from an outpatient-clinic access project (illustrative):

```
Additional bookable visit slots:   22 per week  (verified: template redesign, 8 weeks)
Slots actually filled, weeks 1–8:  15 per week on average
Gross charge per visit:            $210
Benefit claimed:                   22 × $210 × 50 weeks = $231,000/yr   (class: hard savings)
Finance note:                      net collection rate for this clinic: 41% of gross charges
```

What is wrong with the claim?
A. Fifty weeks should be 52, since the clinic is open year-round · B. Three things — it counts slots rather than filled visits, values them at gross charge rather than the net collected amount (Finance's 41%), and labels revenue as hard savings; on Finance's basis the figure is 15 × $210 × 0.41 × 50 ≈ $64,600/yr as revenue, contingent on demand holding ✅ · C. Revenue can never be claimed from a healthcare access project, only clinical impact · D. The claim should wait for a full year of collections before any figure is stated
`[I · B9 · Analyze · HC · X · CERT]` — A quibbles with a basis Finance did not challenge; D delays a claim that has a correct basis available now, and C confuses "hard to value" with "not a benefit."

**I23.** The Finance partner on a Black Belt project says: "I will not sign — I cannot vouch that the root cause is right or that the change will last." What does the Finance sign-off on ★ F1 attest to?
A. That the project passed its tollgates and its root cause is verified by an appropriate method · B. That the benefit will be realized for at least three years at the stated rate · C. That the classification, the calculation basis and the figure are ones Finance agrees with and would recognize in its own actuals, with no double counting against other projects — the root cause and sustainment are attested by the Master Black Belt reviewer and the control plan, not by Finance ✅ · D. That the sponsor has approved closure and the benefit may be reported to the executive team
`[I · B9 · Apply · NEU · K · CERT]` — A asks Finance to do the reviewer's job, which is the objection the partner raised; the answer is to show the partner the narrow scope of what they are signing.

**I24.** Benefit claim from a molding scrap project (illustrative). Finance values scrap at the current standard material-and-labor cost, $26/unit.

```
Scrap, baseline quarter:       2,880 units at $31/unit  = $89,280
Scrap, post-change quarter:    1,900 units at $26/unit  = $49,400
Claimed:                       $39,880/quarter hard  → $159,520/yr
Note: standard cost fell from $31 to $26 during the interval, after Procurement
      renegotiated the resin contract.
```

The correct quarterly claim is:
A. $39,880 — the scrap cost line fell by that amount and Finance can see it in the actuals · B. $30,380 — 980 fewer units at the baseline cost of $31 · C. $19,940 — half the drop, shared equally with Procurement · D. $25,480 — 980 fewer units at Finance's current standard of $26; the $14,400 of the drop that comes from the price change belongs to Procurement's negotiation, not to the project ✅
`[I · B9 · Analyze · MFG · X · CERT]` — A claims another function's result; B uses a cost basis the stem's Finance convention closes off; C splits by guess rather than by separating the volume effect from the price effect.

**I25.** A capstone submission states: "Annualized benefit $180,000/yr hard (12 months forward at Finance's volume forecast), on 8 weeks of post-change actuals running at $15,000/month; assumption: the post-change rate holds through the Q4 seasonal peak, which the evidence window does not cover. Realized to date: $30,000. Finance partner (named) has signed both figures and the assumption." Against F2, the reviewer should:
A. Award full marks — the annualization basis is stated, the evidence window is stated, the extrapolation beyond it carries a labeled assumption, and realized and projected are separated ✅ · B. Withhold the marks — no benefit may be annualized on fewer than 12 months of post-change data · C. Withhold the marks — the seasonal assumption should have been tested before submission · D. Award half — the projection is honest but too large relative to what has been realized
`[I · B9 · Evaluate · NEU · S · CERT]` — The rubric bars unlabeled extrapolation, not extrapolation; B would make every project wait a year to close, and D scores the ratio rather than the honesty of the statement.

**I26.** A Black Belt's OEE project on a bottleneck line raises available capacity enough that a planned second line — $1.2 million capital, approved in next year's plan — is cancelled by plant leadership, with Finance's confirmation. How does this enter the benefit statement?
A. Hard savings of $1.2 million/yr — the money will not be spent · B. Cost avoidance of $1.2 million, one-time, on its own line, with the depreciation and operating cost the second line would have carried shown separately if Finance chooses to state them — never annualized as a recurring saving ✅ · C. Hard savings of $240,000/yr — the capital spread over a five-year life · D. Soft savings, since no money has changed hands in either direction
`[I · B9 · Analyze · MFG · S · CERT]` — C converts a purchase that will not happen into a recurring budget release that does not exist; A books as hard a sum that was never in a spending actual.

**I27.** Benefit slide drafted for an executive readout, customer-onboarding project at a bank (illustrative):

```
Overtime reduced (Finance-confirmed)                          $84,000/yr
Analyst capacity freed, 2.1 FTE (no headcount change)         $167,000/yr
Planned contractor extension cancelled                        $120,000  (one-time)
Fee revenue from faster onboarding (net, Finance basis)       $55,000/yr
Planned system upgrade no longer required                     $300,000  (one-time capital)
                                              TOTAL BENEFIT   $726,000
```

What is the defect in the slide?
A. Freed capacity should be left off the slide entirely, since it carries no budget movement · B. Revenue and savings cannot appear on the same slide · C. Five classes, two of them one-time, are added into one "total benefit" Finance will not recognize; show each class on its own line with its status (signed, projected), a Finance-signed recurring figure of $84,000/yr hard plus $55,000/yr revenue, and the one-time avoidances and the capacity stated separately ✅ · D. The one-time items should be divided by five and added in as annual amounts
`[I · B9 · Evaluate · TXN · X · CERT]` — D manufactures a recurring figure from a one-off; A hides a real operational result that belongs on the slide in hours or FTE, just not inside the money total.

**I28.** A Black Belt's medication-reconciliation project pilots on two units from March to June; the reconciliation completion rate rises from 64% to 89%. In April the hospital's EHR vendor turned on a new automated reconciliation prompt across all units. Two comparison units without the project rose from 65% to 78% over the same months. What may the project claim?
A. The full 25-point gain — the project units improved and the pilot was verified on its own chart · B. Nothing — the EHR change makes the result unreadable and the pilot must be repeated · C. Only the gain from April onward, when both changes were in place · D. The difference over the comparison units — about 11 points (25 − 13) — attributed to the project, with the EHR prompt's share stated and the attribution method agreed with Finance and the sponsor before any monetization ✅
`[I · B9 · Analyze · HC · S · CERT]` — A double counts the vendor's change; B discards a comparison group that exists precisely to separate the two effects.

**I29.** A payroll bureau's client runs its own reconciliation check on every payroll file the bureau delivers. In one quarter the client's check catches 14 files with wrong deductions and returns them before any employee is paid. The bureau's Black Belt classifies the correction cost as internal failure "because no employee was affected." For the bureau's cost-of-quality accounting, this is:
A. External failure — the defect left the bureau's process and was found by the customer; that the customer's own check caught it before the end user does not move it back inside ✅ · B. Internal failure — the defect was caught before its consequence reached the people being paid · C. Appraisal — the check that found it is an inspection activity, so its cost is appraisal · D. Prevention — the client's check prevented a mispayment from occurring
`[I · B9 · Apply · TXN · K · CERT]` — B chooses the end user as the boundary; the boundary is the bureau's process and its customer, and C confuses whose inspection cost it is.

**I30.** Benefit method sheet submitted with a Black Belt charter for a collections-call project (illustrative):

```
Metric:          Right-party contacts per agent-hour
Baseline:        3.1  (Jan–Mar, 12 weeks; same operational definition as the sustainment chart)
Target:          4.0
Unit value:      $18 per additional right-party contact
Volume basis:    agent-hours, next 12 months, from the Workforce Management forecast
Class:           Revenue
Costs to net:    dialer configuration $9,000 one-time; none continuing
Annualization:   12 months forward from go-live; labeled projection until 12 months of actuals
```

What is missing before Finance can agree it?
A. A sensitivity analysis on the 4.0 target · B. The source and derivation of the $18 unit value and the name of the Finance partner who agrees to it — an unsourced unit value is the element most likely to be rewritten at closure ✅ · C. The cost of the project team's time over the 16 weeks · D. The control chart type that will be used for sustainment
`[I · B9 · Analyze · TXN · X · CERT]` — Every other element is present and correctly based; C is a cost the program's convention does not net, and D belongs to the control plan, not the benefit method.

**I31.** An outpatient pharmacy has run three DMAIC projects in four years on prescription wait time: mean 42 → 31 → 26 → 24 minutes, each verified and stable afterward. The remaining variation is common cause; the layout, the single verification counter and the paper queue are the same as when the pharmacy opened. The health system now requires a 15-minute wait for 90% of patients. The Black Belt's assessment for the sponsor:
A. Charter a fourth DMAIC project with the 15-minute requirement as its target · B. Report that the requirement is unattainable and ask for it to be revised · C. The process is at the entitlement of its current design and the requirement is beyond it; this is a design problem — DMADV: define the requirement, translate it to CTQs, generate and select concepts, design the process, verify it — rather than another improvement cycle, and a candidate for a Master Black Belt–led or specialist-supported effort ✅ · D. Run a kaizen event on the verification counter, the visible bottleneck
`[I · B10 · Evaluate · HC · S · CERT]` — A is what a fourth project would look like and what three projects have already shown; the tell is stable common-cause performance on a fixed design with a target far outside it.

**I32.** Draft plan for a new customer-onboarding process at a broker; no such process exists today:

```
Phase 1  Define    Business case, scope, charter, team
Phase 2  Measure   Baseline the current onboarding cycle time and defect rate
Phase 3  Analyze   Generate two or three process concepts; select against the CTQs
Phase 4  Design    Detailed process design, capacity model, FMEA, mistake-proofing
Phase 5  Verify    Pilot at scale; demonstrate capability against the CTQs; hand over
```

What is wrong with the plan?
A. Analyze should come before Measure in a design method · B. Verify should be replaced by Control, so the process has a control plan · C. The plan is a DMAIC project mislabeled as DMADV · D. Phase 2 — there is no current process to baseline; Measure in DMADV gathers customer requirements and translates them to CTQs with targets and measurement methods, which is what Analyze then selects concepts against ✅
`[I · B10 · Analyze · TXN · X · CERT]` — Phases 3–5 are correctly described, so C is wrong; the plan imported a DMAIC Measure into a design method.

**I33.** A DFSS team designing a new packaging line has 14 ranked customer requirements from interviews and a Kano survey, and 20 candidate design features, none of which exists yet. The tool that translates the requirements into prioritized design characteristics, showing which feature serves which requirement and how strongly, is:
A. Quality function deployment — the house of quality ✅ · B. A cause-and-effect matrix, which relates process inputs to process outputs · C. A design FMEA, which ranks the features' failure modes by risk · D. A full factorial experiment on the 20 features
`[I · B10 · Apply · MFG · K · CERT]` — B is the nearest tool and the Black Belt's habit, but it scores inputs of a process that exists; QFD works before there is a process, and D cannot be run on features that are not built.

**I34.** A director asks a Black Belt to "lead the DFSS on the new returns-processing service — you're certified." The Black Belt's honest position:
A. Accept — DFSS is DMAIC with different phase names and the same tools · B. Say plainly that Black Belt covers DFSS at awareness — recognizing when a process needs design rather than improvement, the DMADV phases, and QFD as a translation tool — and propose to carry the Define, Measure (CTQ) and Verify work under a Master Black Belt or DFSS specialist who leads the design phases ✅ · C. Decline entirely — DFSS is a product-development discipline outside Lean Six Sigma · D. Accept and run the design as a large DMAIC project with a longer Improve phase
`[I · B10 · Evaluate · NEU · S · CERT]` — D is A in practice; the program's scope line is explicit, and the credible move is to name what the Black Belt can carry and who leads the rest.

**I35.** Tollgate 1 evidence for a proposed fourth project on a grinding operation (illustrative):

```
Characteristic:   Shaft diameter, tolerance ±0.050 mm
Current process:  stable (X̄-R, 6 months, no signals), centered; σ_within = 0.018 mm → Cpk ≈ 0.93
History:          three DMAIC projects in 2 years: σ_within 0.031 → 0.024 → 0.020 → 0.018 mm
Machine:          maker's stated repeatability ±0.030 mm (about 0.015 mm as a σ-equivalent)
New requirement:  Cpk ≥ 1.67 from next model year  (needs σ_within ≤ 0.010 mm)
```

The correct reading:
A. Charter the fourth DMAIC project; the history shows σ still falling with every project · B. Ask the customer to loosen the tolerance to fit the process · C. The process is near the entitlement of its equipment (σ cannot go much below 0.015 mm on this grinder) and the requirement needs 0.010 mm: no improvement project can get there; this is a design decision — process or equipment redesign, a DMADV-type effort — to put to the sponsor now ✅ · D. Run a designed experiment on speed, feed and dressing to find the settings that give σ = 0.010 mm
`[I · B10 · Evaluate · MFG · X · CERT]` — A reads a decelerating trend as open-ended; D asks an experiment to find a setting the machine does not have, and B is the customer's decision, not the team's.

**I36.** A DFSS team has designed a new pre-admission testing clinic: layout, staffing, scheduling rules and standard work. The design team, the sponsor and the architect have signed the design package. The team proposes to go live next month and "monitor with a control chart." What does the Verify phase require before handover?
A. Sign-off by the design team and sponsor — that is the verification · B. A control chart on the primary metric through the first month of live operation · C. A design review of the package by the Master Black Belt · D. Running the designed process at realistic scale — a pilot or a simulation with real patient flow — and showing with data that it meets each CTQ target (wait time, throughput, completeness) before the design is declared done and handed to the operations owner with its control plan ✅
`[I · B10 · Apply · HC · S · CERT]` — B monitors after the fact what Verify is meant to demonstrate before; A confuses approval of a drawing with evidence that the process performs.

**I37.** A Black Belt joining a DMADV effort as the Measure-phase lead schedules a gauge R&R on the department's existing instruments and a capability study of last year's data. Measure in DMADV actually produces:
A. The customer requirements translated to critical-to-quality characteristics, each with a target, a specification basis and a measurement method, so that concepts can be selected and the design verified against them ✅ · B. The baseline capability of the current process on the right distribution · C. The measurement system analysis of the existing gauges before the baseline is taken · D. The verified root cause of the current process's performance gap
`[I · B10 · Understand · NEU · K · CERT]` — B, C and D are DMAIC Measure and Analyze outputs; a design project has no current process to baseline or diagnose, which is the difference the shared phase name hides.

**I38.** Process-mining summary from a purchase-to-pay system's event log, last quarter (illustrative):

```
Cases (purchase orders):        12,400
Activities in log:              9   (Create PO … Pay invoice)
Distinct variants:              214;  top variant covers 31% of cases
Median case duration:           6.2 working days;  90th percentile 19.4 days
"Return invoice for correction": present in 38% of cases; median loop duration 2.1 days
Cases with more than one loop:  11%
Note: PO approval happens by email outside the system and is not logged
```

What can the Black Belt conclude, and what comes next?
A. The rework loop is the root cause of the long tail; automate invoice correction · B. The log quantifies a rework loop in 38% of cases and 214 ways the process actually runs, which sizes the opportunity and points at where to look; it shows what happened and when, not why — next is to go to the people who return invoices and find the causes, noting that the email approval step is invisible to the log ✅ · C. The 214 variants mean the log is unreliable and should not be used for baseline work · D. The 6.2-day median is acceptable for purchase-to-pay, so no project is warranted
`[I · B10 · Analyze · TXN · X · CERT]` — A treats a symptom the log surfaced as a verified cause; C mistakes the process's real variety for a data problem, which is what the log is for.

**I39.** A Black Belt wants to use process mining on a hospital's bed-cleaning turnaround. Environmental services records cleans on a paper board; the bed-management system logs "bed dirty" and "bed clean" status changes with timestamps and bed IDs; the steps in between (request received, cleaner assigned, clean started) exist only on the board. The right expectation:
A. Transcribe the paper board into a spreadsheet and mine that alongside the system log · B. Process mining is the wrong tool for any healthcare process · C. The log can show the dirty-to-clean interval per bed — a useful duration measure — and cannot show the steps between, because an event log needs a case ID, an activity name and a timestamp for each step; the in-between steps must be observed directly (time observation, a spaghetti diagram) or logged first ✅ · D. Ask the software vendor to reconstruct the missing steps from the durations
`[I · B10 · Apply · HC · S · CERT]` — A creates a log from data collected for another purpose and without timestamps; D asks software to invent events, and the honest answer is that mining reads what a system recorded and nothing else.

**I40.** A supply-chain director wants to buy robotic process automation for purchase-order expediting, which four planners do by hand. A process-mining pass shows 160 variants for a nine-step process, the top variant covering 34% of orders, 29% of orders re-expedited within a week, and each planner using a different rule for which suppliers to call first. The Black Belt's recommendation:
A. Automate now — the software can be configured to handle the variants · B. Automate the top variant and leave the rest manual for the planners · C. Decline automation on principle; expediting is judgment work · D. Standardize first — agree one expediting rule set with the planners, remove the causes of re-expediting, reduce the variants, then automate the stable, rule-based part; automating the process as it runs today would execute 160 versions of it faster and lock in the defect rate ✅
`[I · B10 · Evaluate · MFG · S · CERT]` — B is the tempting shortcut: it automates 34% of the work while the other 66% keeps generating the exceptions that consume the planners' time; C mistakes a sequencing rule for a ban.

**I41.** Automation candidates from a shared-services triage (illustrative):

| Process | Volume/month | Distinct variants | Rule-based? | Exception rate | Standard work in place? |
|---|---|---|---|---|---|
| P1 Vendor master updates | 3,800 | 6 | Yes | 2% | Yes, audited |
| P2 Expense-claim review | 9,200 | 74 | Partly (judgment on receipts) | 18% | No |
| P3 Intercompany reconciliation | 410 | 12 | Yes | 4% | Yes |
| P4 Customer credit decisions | 1,600 | 51 | No (judgment) | 27% | No |

Which process is the best first automation candidate, and which should go to an improvement project first?
A. Automate P1 first — high volume, few variants, rule-based, stable with audited standard work; send P2 to an improvement project to remove the exceptions and standardize before any automation ✅ · B. Automate P2 first — it has the highest volume and therefore the largest payback · C. Automate P4 first — it has the highest exception rate, which automation will fix · D. Automate P3 first — reconciliation is the most tedious work and staff want it gone
`[I · B10 · Evaluate · TXN · X · CERT]` — B chooses on volume alone and would automate 74 variants with an 18% exception rate; C aims automation at a judgment process, where it fails first; P3 is a sound candidate but at 410/month its payback is lower than P1's.

**I42.** A hospital deploys a vendor's machine-learning model that predicts which clinic patients will not attend, and the scheduling team overbooks the predicted no-show slots. A Black Belt is asked to run an improvement project on clinic utilization using the model's predictions. The most important caution to build into the project:
A. Use the model's no-show probability as the project's primary metric · B. Treat the model as a measurement system: check its predictions against the operational definition of a no-show on a holdout period, record its accuracy by patient group, monitor it on a chart for drift, keep the project's metrics (utilization, patient wait, overbooked-patient wait) defined and measured exactly as before, and keep a named person accountable for the overbooking decision ✅ · C. Accept the vendor's published accuracy figure and proceed to the pilot · D. Replace the baseline with the model's back-tested predictions for last year
`[I · B10 · Evaluate · HC · S · CERT]` — C skips the validation any new instrument gets; D reconstructs a baseline from a model's output, which is the baseline rule applied to a new kind of instrument; A changes the metric to the model's belief instead of what happened.

<!--
Section I tallies (42 items)
Key position:  A 11 (I1 I5 I9 I13 I17 I21 I25 I29 I33 I37 I41) · B 11 (I2 I6 I10 I14 I18 I22 I26 I30 I34 I38 I42) · C 10 (I3 I7 I11 I15 I19 I23 I27 I31 I35 I39) · D 10 (I4 I8 I12 I16 I20 I24 I28 I32 I36 I40)
Objective: B9 30 (I1–I30) · B10 12 (I31–I37 DFSS/DMADV, I38–I42 digital CI)
Type:  X 17 (40%) · S 17 (40%) · K 8 (19%)
Bloom: Understand 2 · Apply 11 · Analyze 15 · Evaluate 14 → Apply/Analyze/Evaluate 40 (95%)
Vertical: MFG 11 · HC 11 · TXN 11 · NEU 9
Negative stems: 0
Exhibits with an error to find: I1 I3 I6 I9 I10 I11 I14 I21 I22 I24 I27 I30 I32; CoPQ tables I1 I3 I19; event-log summary I38; triage table I41; capability/entitlement I35
"When not to use" coverage: CoPQ total as a benefit claim (I4, I18), fully loaded rate for an eliminated position (I20), trailing volume for annualization (I9), annualizing a one-time avoidance (I26, I27), summing benefit classes (I27), C&E matrix in place of QFD (I33), DMAIC Measure in a design project (I32, I37), DOE against equipment entitlement (I35), process mining without an event log (I39), automation before standardization (I40, I41), a model's output as metric or baseline (I42)
-->

---

v1.0 · 2026-09-20
