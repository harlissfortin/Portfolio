# Green Belt Exam Bank — Section D: Improve

Part of the Green Belt certification item bank. Blueprint, minimally competent candidate
statement, tag format and pool rules: [`../exam-bank.md`](../exam-bank.md). Governing policy:
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).
Project-side requirements these items assess against: [`../project/review-rubric.md`](../project/review-rubric.md)
(Improve items I1–I4, mandatory ★ I3). Teach-text these items draw on:
[`../weeks/week-07.md`](../weeks/week-07.md).

Section D draws **15 items per form** from the **52 CERT items** below. Objective **G6** —
select, pilot and implement countermeasures with mistake-proofing. Tag format
`[section · objective · Bloom · vertical · type · pool]`; correct option ✅; rationale after the
dash. Exhibits (type X) precede the stem as a small table or a fenced block of software-style
output. All figures are illustrative; every quantity states its units and basis.

---

## Section D — Improve: solution generation and selection, pilots, poka-yoke, kaizen, flow basics (52 CERT)

**D1.** A discharge lead-time team on a 32-bed medical unit verified in Analyze (one-way ANOVA across discharge types, large effect) that discharges waiting for a pharmacist's medication review leave a median 95 minutes later than discharges that do not. The sponsor has favored a discharge lounge since week 1. The Green Belt runs SCAMPER. Which output shows the tool used as intended?
A. Seven prompts applied to "the discharge process as a whole," producing a discharge lounge, a discharge coordinator role, a patient-education video and a new whiteboard · B. Seven prompts applied to the step "pharmacist medication review," producing: start the review the evening before for planned discharges (Rearrange), fold it into the reconciliation the ward pharmacist already does (Combine), let a trained nurse do it for patients on unchanged medications (Substitute) ✅ · C. The team votes for the discharge lounge, then uses SCAMPER to generate ways to staff, furnish and schedule it · D. Seven prompts applied to the problem statement "discharges are late," so that no cause is assumed
`[D · G6 · Analyze · HC · S · CERT]` — SCAMPER is applied to the step where the verified cause lives; A applies it to the whole process and produces the sponsor's favorite dressed as an output, which is the failure mode I1 exists to catch.

**D2.** The correct output of a benchmarking visit in Improve is:
A. The decision — a process that already works elsewhere does not need a pilot · B. The other site's forms and software configuration, to be copied as they stand · C. Candidates for the selection matrix — the mechanism the other process uses, written up within 24 hours by the people who do the work ✅ · D. A target for the pilot prediction, taken from the other site's metric
`[D · G6 · Understand · NEU · K · CERT]` — B imports the artifact and leaves the cause; the mechanism is what transfers, and the visit produces candidates, never a decision.

**D3.** A stamping cell's verified cause (two-sample t, difference 16 min, 95% CI 11 to 21 min) is bolt hunting during die changes: the die set uses nine bolt lengths and setters search for the right ones while the press is stopped. The team visits a sister plant with 18-minute changeovers and returns with drawings of its kit cart and shadow board. What is the defect in this benchmark?
A. The team copied the artifact without checking the mechanism — the sister plant's cause was die retrieval time, not fastener variety; the candidate to import for this cause is standardized bolt lengths or a pre-sorted bolt kit, and the cart is a candidate only if it carries one ✅ · B. Benchmarking requires a competitor or a different industry, not a sister plant in the same company · C. An 18-minute changeover is too far from the cell's 47 minutes for the two processes to be comparable · D. Benchmarking belongs in Analyze, before the cause is verified, so the visit came too late
`[D · G6 · Analyze · MFG · S · CERT]` — C confuses distance from the benchmark with relevance; the question is whether the mechanism matches, and here it only partly does.

**D4.** A claims-intake project verified (chi-square, 11.2-point difference, 95% CI 8.9 to 13.5) that claims submitted on the paper form, where the member ID is written by hand and keyed by a clerk, have a far higher rejection rate than portal claims. A team member proposes "send members a letter asking them to print the ID clearly." The Green Belt should:
A. Add it to the matrix — it is cheap, scores well on effort and can be compared fairly with the other candidates · B. Pilot it first, since it can start tomorrow and the other candidates need IT time · C. Reject it because a letter's effect cannot be measured on the primary metric · D. Set it aside as not a countermeasure for this cause — members respond rationally to a form that accepts anything, so candidates change the step: a pre-printed ID label, a lookup by name and date of birth at keying, or validation against the membership file at entry ✅
`[D · G6 · Apply · TXN · S · CERT]` — A is the near miss; the letter would score well on effort and still leave the field that produces the errors, so it belongs in the log of ideas, not the matrix.

**D5.** At Tollgate 3 an emergency-department team has a fishbone with 31 causes and a cause-and-effect matrix, but no cause verified with data; the sponsor asks for countermeasures by Friday. The Green Belt should:
A. Run SCAMPER on the top three causes from the cause-and-effect matrix at once, so Friday's list covers the likeliest ones · B. Say plainly that Improve cannot start — SCAMPER on an unverified cause generates countermeasures for a story — and take the top causes back to Analyze with a two-week test plan ✅ · C. Run SCAMPER on the problem statement, since it is the one thing everyone in the room agrees on · D. Substitute a benchmarking visit, which produces candidates without depending on a verified cause
`[D · G6 · Apply · HC · S · CERT]` — A is what a rational sponsor deadline produces; three unverified causes give three sets of countermeasures for three stories, and D imports someone else's cause.

**D6.** A molding team's verified cause (one-way ANOVA across supplier lots, large effect) is incoming resin moisture. SCAMPER output on the step "load resin to the press hopper":

| Prompt | Candidate |
|---|---|
| Substitute | Replace the open hopper with a closed dryer-hopper that interlocks the press until moisture is in range |
| Combine | Fold a moisture reading into the lot-release check at goods receipt |
| Modify | Increase the frequency of operator refresher training on pressure and hold settings |
| Rearrange | Move dryer verification to before the lot goes to the press instead of after the first shot |

Which candidate should be removed before the selection matrix, and why?
A. Substitute — an interlock is a control device and belongs in the Control phase, not in Improve · B. Combine — goods receipt is outside the project's process boundary · C. Modify — training on press settings acts on a cause the project never verified; it can be logged as an idea, but scoring it would let it win on effort alone ✅ · D. Rearrange — the dryer is already verified after the first shot, so moving the check is cosmetic
`[D · G6 · Analyze · MFG · X · CERT]` — Every candidate on the matrix must trace to the verified cause; B is wrong because a cause can be countered upstream of the step where it shows.

**D7.** A mortgage-processing team's verified mechanism is "supporting documents arrive incomplete and are chased one item at a time." Which benchmarking visit is most likely to produce a usable candidate?
A. A hospital pre-admission unit that collects a complete pack from each patient before the visit date — a different industry with the same mechanism ✅ · B. A competitor lender's published turnaround times and marketing claims · C. A sister branch that uses the same application form and has the same completeness rate · D. An industry survey of average working days from application to approval
`[D · G6 · Apply · TXN · K · CERT]` — Functional benchmarking follows the mechanism across industries; C is the tempting "internal" choice, but it has the same design and therefore the same problem.

**D8.** After a cause is verified, the house term for what the team pilots is "countermeasure" rather than "solution" because:
A. "Solution" is reserved for Black Belt projects with a designed experiment behind them · B. A countermeasure is by definition a temporary fix that a permanent solution later replaces · C. The two words mean the same thing and the rubric accepts either at the tollgate · D. A countermeasure is a tested response aimed at a named verified cause; the word keeps the link to the cause visible, while "solution" assumes the result before the pilot has run ✅
`[D · G6 · Understand · NEU · K · CERT]` — B is the common misreading; a countermeasure becomes the standard once the pilot and the control plan hold.

**D9.** Selection matrix from an emergency-department door-to-provider project. Verified cause (two-sample t, 14 min difference, 95% CI 10 to 18 min): the triage nurse also asks the registration questions, so triage takes 14 minutes longer per patient than at the sister site, where a clerk registers after triage. Weights were confirmed by the sponsor before scoring; 3 is best on every criterion.

| Candidate | Impact (w 0.4) | Effort (w 0.3) | Risk (w 0.2) | Reversibility (w 0.1) | Total |
|---|---|---|---|---|---|
| A — clerk registers after triage | 3 | 2 | 3 | 3 | 2.7 |
| B — second triage nurse 11:00–23:00 | 3 | 1 | 3 | 1 | 2.2 |
| C — nurse-first protocol with standing orders | 2 | 2 | 2 | 2 | 2.0 |
| D — waiting-room signage: "have your ID and insurance card ready" | 3 | 3 | 3 | 3 | 3.0 |

The reviewer's first objection is:
A. Four criteria are too many for a Green Belt matrix; impact and effort would have been enough · B. Effort should carry the largest weight in a hospital, where staff time is the scarce resource · C. Candidate D scores 3 on impact although nothing in Analyze links card readiness to the verified cause; impact is traced to the effect size, so D scores 1 or leaves the matrix, and A wins ✅ · D. Candidate B should win because a second nurse doubles triage capacity for twelve hours a day
`[D · G6 · Analyze · HC · X · CERT]` — The matrix is only as honest as its impact column; D wins on paper because a cheap idea received an impact score it never earned.

**D10.** Weights in a selection matrix are agreed with the sponsor before anyone scores so that:
A. The sponsor argues about criteria rather than about a favorite, and the matrix cannot be tuned afterward to produce a predetermined winner ✅ · B. The weighted total can be computed, since scoring is impossible without weights · C. Effort can be given the highest weight, which sponsors prefer · D. The reviewer has a signed weights sheet to file with the tollgate record
`[D · G6 · Understand · NEU · K · CERT]` — B is arithmetically true and misses the point: weights could be written after the scores, and that is exactly the decoration the rule prevents.

**D11.** A changeover team has three candidates and a sponsor who wants the choice made in a 30-minute meeting. Impact for each is known from the Analyze effect size and effort in technician hours has been estimated. The Green Belt should:
A. Build the full four-criterion weighted matrix anyway, because rubric item I1 cannot be earned without one · B. Use the effort/impact 2×2 — for four or fewer candidates it does the same job in ten minutes — place each candidate from the effect size and the hours, name the risk of each aloud, and record the placement as the I1 evidence ✅ · C. Pilot all three in parallel on the same press and let the data choose the winner · D. Choose the cheapest, since effort is the only criterion the sponsor directly controls
`[D · G6 · Apply · MFG · S · CERT]` — I1 asks for stated criteria, not a specific form; C tests three factors at once, which is a designed experiment and outside Green Belt scope.

**D12.** Selection matrix from a claims-intake project. Verified cause: the policy number is re-keyed from a scanned form (chi-square, scanned versus e-submitted). Sheet note: "3 = best on every criterion; weights confirmed by the sponsor."

| Candidate | Estimate | Impact (0.4) | Effort (0.3) | Risk (0.2) | Reversibility (0.1) | Total |
|---|---|---|---|---|---|---|
| A — barcode on the form, read at intake | 40 IT hours | 3 | 1 | 3 | 3 | 2.4 |
| B — replace scanning with a new intake system | 900 IT hours, 9 months | 3 | 3 | 2 | 1 | 2.6 |
| C — policy-number lookup at keying | 60 IT hours | 3 | 1 | 3 | 3 | 2.4 |

The team recommends B. What went wrong?
A. The effort column is scored backwards — 900 hours received a 3 and 40 hours a 1 against a "3 = best" scale; corrected, A totals 3.0, C 3.0 and B 2.0, and the choice is between A and C ✅ · B. Impact should be weighted 0.6 for a transactional process, which would let A and C overtake B · C. Reversibility does not apply to software changes and should be removed as a criterion · D. Nothing — a new system removes the cause permanently and the weighted total is the highest, so the recommendation stands
`[D · G6 · Analyze · TXN · X · CERT]` — D reads the total without checking the scoring; the matrix is a structured conversation, and a total that contradicts the estimates column is the signal to check the scale.

**D13.** A medication-room project has one feasible countermeasure this quarter — an update to the infusion-pump drug library — and two others that need a capital request with a 14-month lead. To satisfy I1 the Green Belt should:
A. Build the matrix with all three so that more than one option is shown, as the rubric wording requires · B. Score the two capital options 1 on effort so that the library update wins on paper · C. Record the single feasible candidate with the reason the other two are infeasible in the project window, score it against the stated criteria, and say so at the tollgate rather than staging a matrix around it ✅ · D. Postpone Improve until the capital options are available so the comparison is fair
`[D · G6 · Apply · HC · S · CERT]` — A and B are the same act: a matrix decorated around a known winner, which reviewers can tell; the rubric rewards stated criteria, not theatre.

**D14.** The leading candidate in a changeover matrix — impact 3, effort 3 — is to skip the first-article inspection after each die change, which the video showed taking 9 minutes of press-stopped time. Which criterion should stop it, and how?
A. Reversibility — an inspection step, once removed from the procedure, is difficult to reinstate · B. Risk — the criterion covers risk to the customer and to other metrics; the first article is the check that catches a mis-set die before a full run, so the candidate scores 1 on risk and a side metric (first-run rejects) is named before it could go anywhere ✅ · C. Effort — the inspector's time is still paid, so the saving is smaller than it looks · D. None — the weighted total decides, and the team scored honestly against the agreed weights
`[D · G6 · Analyze · MFG · S · CERT]` — D treats the matrix as an oracle; the risk column exists so that a candidate that moves the primary metric by exporting defects to the customer loses in the open.

**D15.** After the matrix, the Green Belt has one paragraph to defend the winner — a pick list of the vendor's open purchase orders replacing a free-text PO field — to the sponsor. Which sentence does the job?
A. "The team was unanimous that the pick list is the right answer and is ready to start" · B. "The pick list scored 3.0, the highest weighted total on the matrix by a clear margin" · C. "The pick list is what the sister site uses, so it is proven in our own company" · D. "The pick list removes the free-text entry that Analyze tied to a 9.5-point exception gap (95% CI 7.8 to 11.2), needs about 30 IT hours, and can be switched off in an hour if the pilot fails" ✅
`[D · G6 · Apply · TXN · S · CERT]` — B reports the matrix's output instead of its reasoning; the sponsor needs the cause, the cost and the way back, which is what the criteria were for.

**D16.** The six elements of a Green Belt pilot plan are:
A. Bounded scope, a written prediction, the same success measure as the baseline, a stop rule, a comparison design and an other-changes log ✅ · B. Charter, SIPOC, voice of the customer, critical-to-quality tree, baseline and control plan · C. Hypothesis, alpha, power, sample size, test statistic and p-value · D. Countermeasure, owner, budget, go-live date, training plan and communication plan
`[D · G6 · Remember · NEU · K · CERT]` — D is an implementation plan, which comes after the pilot has shown the countermeasure works; C is the machinery of a test, not the design of a pilot.

**D17.** An infusion-clinic project's verified cause explains 37 minutes of chair wait (95% CI 29 to 45 min, two-sample t on log-transformed minutes). The draft pilot plan predicts "median wait from 58 to 15 minutes within four weeks." The problem is:
A. Nothing — an ambitious target motivates the team and the sponsor will accept a near miss · B. The prediction should be stated as a percentage reduction so that it can be compared across projects · C. The prediction exceeds what the verified cause explains — removing a 37-minute cause from a 58-minute median supports a prediction near 21 to 30 minutes; a 15-minute prediction cannot be met by this countermeasure and turns a real success into a "failure" ✅ · D. The prediction should be a p-value threshold rather than a number of minutes
`[D · G6 · Analyze · HC · S · CERT]` — The target comes from the Analyze effect size, not from ambition; A is the sponsor's instinct and D replaces a practical prediction with a statistical one.

**D18.** Stop-rule section of a submitted pilot plan for a kit-cart changeover pilot on press 12:

```
Stop rule:  "We will stop the pilot if it is clearly not working or if the
             cell lead has concerns."
```

The best rewrite is:
A. "Harm stop: any die crash, safety incident or first-article reject traced to staging stops the pilot the same day; the cell lead decides. Futility stop: if after 15 changeovers the pilot median is not below the 47-minute baseline median, stop and return to Analyze." ✅ · B. "Stop the pilot if the sponsor asks, or if the plant manager raises a concern at the weekly production meeting." · C. "Stop the pilot if three setters raise concerns in the same week, recorded by the cell lead." · D. "Stop after 20 changeovers whatever the result, and review the data at the next checkpoint."
`[D · G6 · Apply · MFG · X · CERT]` — A stop rule names a trigger, a decider and a time; D is a scope boundary, not a stop rule, and C measures opinion rather than harm or futility.

**D19.** Success-measure section of a pilot plan for a contact-center project:

```
Primary metric:        Handle time, seconds per call, working hours
Baseline collection:   ACD system timestamp, call answered to call released;
                       8 weeks, n = 6,240 calls
Pilot collection:      Agents self-log start and end on a tally sheet "so we
                       capture the wrap-up work the system misses"
Prediction:            Mean handle time 412 s → 340 s within 3 weeks
```

The reviewer should require:
A. Acceptance as written — self-logging is more complete than the system timestamp, so the pilot measure is better · B. Both methods during the pilot, reporting whichever gives the larger reduction against the baseline · C. Self-logging corrected by subtracting the average difference between the two methods in the first pilot week · D. The ACD timestamps for the pilot, unchanged from the baseline; if wrap-up time matters, log it alongside as a second metric that is never compared to the timestamp baseline ✅
`[D · G6 · Analyze · TXN · X · CERT]` — Same metric, same operational definition, same collection method is the ★ I3 rule; C sounds rigorous but calibrates one unknown with another and still voids the comparison.

**D20.** A pre-visit lab-draw pilot on two infusion chairs is scheduled for the same month the hospital switches every unit to a new electronic scheduling module. The Green Belt should:
A. Postpone the pilot six months until the scheduling module has settled and the baseline can be re-collected · B. Run the pilot as a concurrent comparison — the two pilot chairs against the ten untouched chairs in the same weeks — so that whatever the scheduling change does happens to both groups, and record the module go-live date in the other-changes log ✅ · C. Run a before/after on the baseline chart and rely on the other-changes log to explain any effect of the scheduling change · D. Extend the pilot to all twelve chairs so the scheduling change affects every patient equally and cannot bias the result
`[D · G6 · Analyze · HC · S · CERT]` — C is the near miss: the log records the change but cannot separate its effect from the countermeasure's; only a concurrent group does that, and D destroys the comparison group.

**D21.** A process runs about once a week, and each part number or account comes through about once a month. Twenty pilot points in the new state would take five months. The comparison design to use is:
A. Stretch the pilot window to five months and report at the six-month completion deadline · B. Read the shift from eight points on the staged I-MR chart, since the limits are already known · C. A paired comparison — the same part number or account measured before and after the change — with the small number of pairs stated as a limitation at the tollgate ✅ · D. Fill in the missing points by interpolation between the ones collected
`[D · G6 · Apply · NEU · K · CERT]` — Natural pairs remove between-unit variation, so fewer points carry more information; B reads a chart with too few points and A holds a bounded project open.

**D22.** The other-changes log in a pilot plan exists so that:
A. Changes the team makes to the countermeasure during the pilot are recorded with a date · B. Every change in the pilot window that could move the metric — a new hire, a volume swing, a software release — is on record with its date, so the team and the reviewer can separate the countermeasure from coincidence ✅ · C. The organization's change-control requirements are satisfied before go-live · D. The sponsor's decisions during the pilot are documented for the tollgate
`[D · G6 · Understand · NEU · K · CERT]` — A is the nearest wrong answer; mid-pilot changes to the countermeasure belong in the log too, but the log's job is to catch everything else that moved.

**D23.** An accounts-payable sponsor wants the pilot to introduce the PO pick list, a new approval routing and a vendor-portal launch in the same five weeks "to get it over with." The Green Belt should:
A. Agree — more change in the window gives a bigger and faster result on the exception rate · B. Agree and attribute the result to the three changes in proportion to their selection-matrix scores · C. Run all three as a designed experiment, since Green Belts learn what one is and the sponsor wants all three tested · D. Pilot one change at a time, or each on a separate vendor slice with its own comparison — testing several factors at once is a designed experiment, a Black Belt tool the Green Belt can name and does not run ✅
`[D · G6 · Apply · TXN · S · CERT]` — B invents an attribution the data cannot support; C is outside level scope, and matrix scores are not effect estimates.

**D24.** The infusion-clinic sponsor proposes running the pre-visit lab-draw pilot on all 12 chairs "so we get 20 points in a week instead of four." The Green Belt should:
A. Keep the pilot to two chairs — the untouched chairs are the concurrent comparison and the way back; twelve chairs give more points but no comparison group and no reversible scope ✅ · B. Agree — a pilot only counts toward ★ I3 when it covers the full process the baseline described · C. Agree, but keep the first pilot week as the baseline so a before/after is still possible · D. Run six chairs one week and the other six the next, so every chair is piloted and every chair is a control
`[D · G6 · Apply · HC · S · CERT]` — C confuses a baseline with a pilot's first week; the baseline already exists and the question is what the 20 points will be compared against.

**D25.** Staged I-MR chart from a kit-cart changeover pilot, described from the software output:

```
I chart — changeover time, press 12 (minutes, last good part of run A to first good part of run B)
Stage 1 (baseline, 26 changeovers):  centre 47.2   UCL 68.9   LCL 25.5;  no signals
Stage 2 (pilot, 24 changeovers, stage-1 limits extended):
  Test 1 (beyond 3σ):    point 33 = 71 min, above UCL
                          other-changes log: damaged die found at staging, replaced same shift
  Test 2 (run on one side of centre):  points 27–50, all 24 below centre
  Stage-2 mean 32.4 min;  stage-2 mean without point 33 = 30.7 min
Prediction posted before the pilot:  47 → 33 min or better within 24 changeovers
Untouched press 9, same weeks:  mean 46.8 → 44.1 min
```

The honest reading is:
A. Remove point 33 as an outlier with a known cause and report the pilot mean as 30.7 minutes · B. Nothing can be concluded because point 33 breaks the stage-1 limits and the stage-2 data are therefore not stable · C. The shift is real and meets the prediction: a 24-point run below centre and a stage-2 mean of 32.4 minutes; point 33 stays on the chart as a documented special cause; the 2.7-minute drift on press 9 is noted as a small shared effect that does not account for the 15-minute shift ✅ · D. The press 9 drift shows the shift is seasonal, not the cart, and the pilot should be repeated in another quarter
`[D · G6 · Analyze · MFG · X · CERT]` — A removes an inconvenient point that the log already explains; D reads a 2.7-minute drift as if it were the 15-minute shift.

**D26.** Paired comparison from a referral-to-appointment pilot across eight primary-care clinics (median working days per clinic, same operational definition before and after):

| Clinic | Before | After | After − Before |
|---|---|---|---|
| 1 | 21 | 14 | −7 |
| 2 | 18 | 12 | −6 |
| 3 | 25 | 15 | −10 |
| 4 | 17 | 13 | −4 |
| 5 | 22 | 14 | −8 |
| 6 | 16 | 17 | +1 |
| 7 | 20 | 12 | −8 |
| 8 | 19 | 12 | −7 |

```
Paired t:   mean difference −6.1 days   95% CI −8.9 to −3.3   t = −5.2   p = 0.001
Prediction: −5 working days per clinic
```

The sentence for the sponsor is:
A. "The improvement is highly significant, p = 0.001, so the countermeasure should be rolled out" · B. "Across the eight clinics, referral-to-appointment time fell by about 6 working days per clinic (95% CI 3 to 9), in line with the predicted 5; clinic 6 rose by a day and is the one to go and see" ✅ · C. "The average fell 6.1 working days, so every clinic improved and the roll-out can be uniform" · D. "Because clinic 6 got worse, the countermeasure did not work and the pilot should be repeated"
`[D · G6 · Analyze · HC · X · CERT]` — A gives a p-value with no size or meaning; C is contradicted by the table, and D lets one pair overrule seven.

**D27.** Pilot summary submitted for ★ I3 by an accounts-payable project:

```
Primary metric:  Exception rate on emailed invoices, pilot vendor group, per week
Baseline (weeks 1–8):   exception = any invoice returned to the vendor OR held more
                         than 1 working day for a missing or invalid PO
                         13.6% of emailed invoices (n = 1,840)
Pilot (weeks 9–13):     exception = any invoice returned to the vendor
                         4.4% of emailed invoices (n = 1,110)
Reported result:        13.6% → 4.4% (−9.2 points); prediction was −8 points — MET
Concurrent control group (non-pilot vendors, weeks 9–13, baseline definition): 13.1%
```

The reviewer's finding:
A. Prediction met with a concurrent control group in place — record ★ I3 as earned · B. The control group at 13.1% confirms the effect, so the definition change is immaterial to the result · C. The pilot sample of 1,110 is too small to compare with a baseline of 1,840 · D. The operational definition changed between before and after — "held more than 1 working day" was dropped — so the two rates are not comparable and ★ I3 is not earned; recount the pilot weeks under the baseline definition, which the held-invoice queue log makes possible ✅
`[D · G6 · Analyze · TXN · X · CERT]` — B is the trap: the control group was counted under the baseline definition, so it is comparable with the baseline but not with the pilot figure it is being used to defend.

**D28.** A pilot ran as planned and the primary metric did not move. What earns full marks on ★ I3?
A. The unmet result read honestly against the posted prediction on the same chart, what the team learned about the cause theory, and the next step it took — a second candidate from the matrix or a return to Analyze ✅ · B. Nothing — ★ I3 requires a shift shown on a control chart or a paired comparison · C. A sponsor statement that staff liked the change and it should be rolled out · D. A second metric that did move, substituted for the primary with a note
`[D · G6 · Understand · NEU · K · CERT]` — D is the quiet failure: swapping the metric after the fact; the rubric passes a documented "did not work, here is what we did next" and fails a demonstration.

**D29.** Stage 2 of a staged I chart for a pre-staged-kit pilot on press 12 (minutes per changeover; stage-1 limits: centre 47.2, UCL 68.9, LCL 25.5):

```
Points 27–36 (weeks 1–2):  all below centre;  mean 33.8
Points 37–50 (weeks 3–5):  scattered around centre;  mean 46.1;  no run-rule signals
Prediction: 47 → 33 min or better within 24 changeovers
Other-changes log: none recorded
```

The right reading is:
A. Report the weeks 1–2 result — the countermeasure works when it is followed, and adherence is a Control-phase matter · B. The pilot did not hold — a two-week improvement that returns to baseline looks like an attention effect or a practice that lapsed; go and see whether kits are still being staged, record the result as unmet against the prediction, and find out what design decision let staging stop ✅ · C. Extend the pilot until the mean drops again, since the first two weeks show the cart can work · D. Report the 24-point mean of 41.0 minutes as a partial improvement of about 6 minutes
`[D · G6 · Analyze · MFG · X · CERT]` — A reports the half of the data that agrees with the prediction; D averages two different states into a number that describes neither.

**D30.** Concurrent comparison from an infusion-chair pilot (median minutes from check-in to pump start, clinic hours, same operational definition throughout):

```
Pilot chairs (2):       baseline median 58  →  pilot weeks median 41
Untouched chairs (10):  baseline median 57  →  same weeks median 44
Prediction: pilot chairs to 30 or better; untouched chairs to stay near 58
Other-changes log, week 2: hospital-wide scheduling template changed (all chairs)
```

The honest reading:
A. The pilot succeeded — a 17-minute drop on the pilot chairs is large and in the predicted direction · B. Both groups improved, so the countermeasure should be rolled out to all chairs without delay · C. The comparison is void because the untouched chairs changed, so the pilot has to be repeated · D. Most of the drop is shared: the untouched chairs fell 13 minutes, so about 3 to 4 minutes is attributable to the countermeasure against a predicted 28; the scheduling change is the likelier driver — record the prediction as unmet and investigate why the cause did not respond ✅
`[D · G6 · Analyze · HC · X · CERT]` — A reads the pilot chairs alone, which is the mistake the concurrent design exists to prevent; C misreads the control group moving as a failure of the design when it is the design doing its job.

**D31.** During a five-week accounts-payable pilot, the month-end week shows a spike in exceptions on both the pilot and control groups. The AP manager asks the Green Belt to leave that week out "because it is not representative." The Green Belt should:
A. Leave it out, since the baseline period's month-end weeks were also unusually high and this keeps the comparison clean · B. Leave it out and note the exclusion and its reason in the report · C. Keep every week on the chart, annotate the month-end week from the other-changes log, and point out that the eight-week baseline contains two month-ends under the same definition, so the comparison already includes them ✅ · D. Replace the week with the average of the adjacent weeks and footnote the substitution
`[D · G6 · Apply · TXN · S · CERT]` — B is honest about the removal and still removes it; an inconvenient point with a known cause stays on the chart with its annotation.

**D32.** Two-sample t-test on the changeover pilot, from the software output:

```
Two-sample t — changeover_min by stage
Baseline   n = 26   mean 47.2   SD 8.1
Pilot      n = 24   mean 32.4   SD 6.4
Difference (baseline − pilot) = 14.8 min   95% CI 10.6 to 19.0   t = 7.1   p < 0.001
Test for equal variances: p = 0.21
Cause effect from Analyze (kit pre-staged vs not): 16 min, 95% CI 11 to 21
Prediction: 47 → 33 min or better
```

The sentence for the sponsor:
A. "Changeovers on press 12 are about 15 minutes shorter with the kit cart (95% CI 11 to 19 minutes), which matches the 16-minute effect the staging cause showed in Analyze; the prediction of 33 minutes or better was met at 32.4" ✅ · B. "The improvement is statistically significant at p < 0.001, with equal variances confirmed" · C. "Because t = 7.1 is well above 2, the cart works and the result is beyond doubt" · D. "Changeover time fell 31%, which beats the 16-minute prediction from Analyze"
`[D · G6 · Analyze · MFG · X · CERT]` — D mixes a percentage with a minutes prediction and calls the cause effect a prediction; B and C report the test statistic where the sponsor needs the size in minutes and its link to the cause.

**D33.** A surgical-unit manager wants to start a discharge-order countermeasure next week and asks the Green Belt to use her recollection — "we used to average about 90 minutes from order to leaving" — as the baseline, because no data were collected. The Green Belt should:
A. Use 90 minutes as the baseline and label it an estimate from the process owner · B. Collect a baseline under the operational definition before the change goes live — even three weeks is a baseline — and, if the change cannot wait, run it as a concurrent comparison against an untouched unit instead of a before/after; a baseline from memory is never reconstructed ✅ · C. Use average length of stay from the finance system as a proxy baseline, since it is already collected · D. Skip ★ I3 and rely on I1 and I2 for the Improve score, noting the missing baseline
`[D · G6 · Apply · HC · S · CERT]` — C substitutes a different metric for the primary one; ★ I3 is mandatory, so D fails the project, and A is a data-ethics stop.

**D34.** Mistake-proofing levels ordered from strongest to weakest are:
A. Downstream detection, detection at source, prevention · B. Warning device, physical device, sequence device · C. Checklist, alarm, fixture · D. Prevention (the error cannot be made), detection at source (the error is flagged before the work leaves the step), downstream detection (inspection or a report after the fact) ✅
`[D · G6 · Remember · NEU · K · CERT]` — B lists device families, not levels; C puts a reminder first, and a checklist is not a mistake-proofing device.

**D35.** A changeover team's classification of its mistake-proofing devices:

| Device | Team's classification |
|---|---|
| Keyed socket on the kit cart that accepts only the correct bolt length | Prevention |
| Shadow board that shows an empty outline for any missing bolt before the changeover starts | Detection at source |
| Laminated changeover checklist signed by the setter at each step | Prevention |
| Weekly first-article reject report from quality | Downstream detection |

Which row is wrong, and what is the fix?
A. Row 1 — a keyed socket is detection at source because the setter still has to try the bolt before the mismatch shows · B. Row 2 — a shadow board is downstream detection because it is only checked after staging is complete · C. Row 3 — a checklist is a reminder that depends on attention, not a mistake-proofing device; keep it, but it earns I4 nothing on its own ✅ · D. Row 4 — a weekly report is detection at source because quality is the first function to see it
`[D · G6 · Analyze · MFG · X · CERT]` — A confuses the attempt with the error: a socket that cannot accept the wrong bolt makes the error impossible, which is prevention.

**D36.** An infusion-pump drug library offers two settings for a dose limit: a soft limit that alarms and lets the nurse confirm and continue, and a hard limit that will not run the infusion. For the failure mode "wrong rate programmed," the hard limit is the stronger device because:
A. It is cheaper to maintain and generates fewer alarm records for the pharmacy to review · B. It is a control device — the error cannot proceed — while the soft limit is a warning that depends on the nurse's response at the moment of the alarm; the warning's residual risk is a confirm-and-continue under load, which the control plan must count ✅ · C. Alarms are not mistake-proofing devices, so only the hard limit counts toward I4 · D. It removes the need for the drug library to be reviewed and maintained by pharmacy
`[D · G6 · Apply · HC · K · CERT]` — C is wrong because a warning is a legitimate device family, just a weaker one; the distinction the item tests is control (stops the process) versus warning (informs a person).

**D37.** For rubric item I4, an account-opening project submits a laminated eight-step checklist that the clerk ticks, including step 6, "cross-check the address against the ID document." The reviewer should say:
A. The checklist is an information device and earns I4, provided the residual risk is written · B. Add a signature line to step 6 to make it a sequence device that cannot be skipped · C. The checklist is a reminder and stays, but the device for I4 is the one that makes step 6 impossible to skip — the account form will not submit until the address-verification field is completed with a value from the ID scan — with the residual risk (a matching but wrong document) named ✅ · D. Replace the checklist with a training refresher and a monthly adherence audit
`[D · G6 · Apply · TXN · S · CERT]` — B dresses the reminder as a device; a signature still depends on attention, and D repeats the design decision that made step 6 skippable.

**D38.** A machining cell's bore diameters run 0.010 mm above nominal on average on a stable X̄-R chart, and 6% of bores exceed the upper specification. The team proposes a go/no-go gauge at the station as the I4 device. The Green Belt should say:
A. The gauge is prevention, since a bad bore cannot pass it, so it resolves the problem · B. Add a second gauge downstream for redundancy, since 6% is high enough to justify two checks · C. Make the gauge trigger a warning light so the operator sees each reject as it happens · D. This is not an error to mistake-proof — it is a stable process centered in the wrong place; the countermeasure is to recenter the process (tool offset, verified on the chart), and the gauge is at most a detection layer that catches bad bores without changing how many are made ✅
`[D · G6 · Analyze · MFG · S · CERT]` — A is wrong twice: a gauge is detection, and the "error" here is common-cause variation around an off-target centre, which no device at the station addresses.

**D39.** Two look-alike vials in a medication room are told apart by cap color only (one blue, one green). The mistake-proofing improvement is:
A. Add a second and third cue — a label in large type, a different vial shape or size, and a fixed, separated storage position — because an information device never relies on color alone ✅ · B. Change the colors to red and yellow, which are further apart on the spectrum and easier to tell apart · C. Add a checklist step, "confirm cap color before drawing up," signed at each administration · D. Store the two vials side by side so that nurses see both and learn the difference
`[D · G6 · Apply · HC · K · CERT]` — B keeps the single cue that fails for color-vision deficiency and under poor light; C adds a reminder where a device is needed.

**D40.** FMEA row before and after a mistake-proofing device, from an accounts-payable project:

```
Failure mode:   PO number keyed incorrectly on an emailed invoice
Before:         Severity 6   Occurrence 7   Detection 6   RPN 252
Device:         PO field validates against the vendor's open-PO list at entry (prevention)
After (team):   Severity 2   Occurrence 2   Detection 2   RPN 8
```

What is wrong with the re-score?
A. Nothing — the risk priority number fell from 252 to 8, which is what a prevention device is expected to deliver · B. Severity should not change — the device stops the error being made, not how bad it is when it happens; occurrence falls (2 is defensible), detection improves only as far as the device flags a bypass, and the residual risk (a valid PO attached to the wrong invoice) has to be named ✅ · C. Occurrence should stay at 7 until the device has run for a full year of invoices · D. The risk priority number should be 0, because prevention makes the error impossible and nothing is left to score
`[D · G6 · Analyze · TXN · X · CERT]` — A accepts a severity cut that the device cannot deliver; D ignores the residual risk, which is the part of I4 the reviewer reads first.

**D41.** A barcode medication-administration scanner is the I4 device for a wrong-patient failure mode. Two weeks in, the Green Belt finds nurses printing flat copies of patient wristbands and scanning those at the workstation, because the scanner reads curved bands on the wrist only after several tries. The Green Belt should:
A. Retrain nurses to scan the wristband on the patient, since that is what the standard work says · B. Audit compliance and report the bypass rate to the unit manager for follow-up with the individuals involved · C. Treat the bypass as a design finding — the device added a step that fails under load — measure the bypass rate, fix the scanner or band so scanning at the bedside works first time, and record the bypass as the device's residual risk in the control plan ✅ · D. Remove the scanner, since a bypassed device protects nothing and the flat copies create a new risk
`[D · G6 · Analyze · HC · S · CERT]` — A and B treat a rational response to a device that does not work as a people problem; D discards the level of protection instead of fixing the design that defeats it.

**D42.** As co-lead of a kaizen event, the Green Belt's duties in the two to three weeks before the event are:
A. Facilitate the event and lead the report-out to the sponsor on day 5 · B. Charter the event with the sponsor, collect baseline data against an operational definition, walk the scope, get team members released from their day jobs in writing, and book the room and supplies ✅ · C. Design the experiment the team will run on day 3 and analyze its results overnight · D. Write the standard work and the control method alone so the team can review them on day 1
`[D · G6 · Remember · NEU · K · CERT]` — A is the Black Belt facilitator's role; D pre-empts the day-4 work that belongs to the people who do the job.

**D43.** A plant manager wants a kaizen week next month on paint-line defects. The team's leading suspect cause, booth humidity, needs six weeks of data across a season change to verify. The Green Belt should:
A. Run the event and verify the cause on day 1 with the data the team can gather that morning · B. Run the event on the top fishbone cause, since the room will hold the people who know the line best · C. Run the event and have the Black Belt collect the humidity data in parallel during the week · D. Defer the event until the cause is verified — an event on an unverified cause produces a week of changes to a story — or rescope it to a cause the data already support ✅
`[D · G6 · Apply · MFG · S · CERT]` — A compresses six weeks of data into a morning; the "when not" rule for kaizen is exactly a cause that needs weeks of data to settle.

**D44.** Day-30 follow-up list from a claims-intake kaizen event, as presented to the Green Belt co-lead at the day-30 review:

| # | Item | Owner | Due | Status |
|---|---|---|---|---|
| 1 | Install second scanner at intake | J. Ortiz | Day 12 | Done |
| 2 | Update the intake standard work with the new sort step | — | — | Open |
| 3 | IT: lookup field on the intake screen | IT queue | Day 45 | Open |
| 4 | Remove old form stock from branches | — | Day 20 | Open |
| 5 | Train weekend staff on the new sort step | K. Lee | Day 25 | Open |

The co-lead's action at the review:
A. Give every item a named owner and a date today — items 2 and 4 have neither — and for anything past 30 days, including item 3 at day 45, close it, reassign it or escalate it to the sponsor that day; nothing older than 30 days stays on the list ✅ · B. Extend the list to 60 days to give IT time, and review again then with the same owners · C. Hand the list to the sponsor, since the event is over and the co-lead's role ended at the report-out · D. Close items 2 and 4 as out of scope, because an item nobody claimed was never really part of the event
`[D · G6 · Apply · TXN · X · CERT]` — B is the rational manager's instinct and the mechanism by which follow-up lists die; "IT queue" is not a name and day 45 is not inside the rule.

**D45.** On day 3 of a kaizen event on branch account opening, the team wants to write a proposal to IT for a new intake screen instead of trying anything in the room, because "nothing real can change without the system." The co-lead should:
A. Accept it — system changes need IT approval, and a written proposal is the fastest route · B. End the event early and reconvene when IT responds to the proposal · C. Extend the event until IT delivers the screen, so the team can test it together · D. Run try-storming as planned — mock the new sequence up on paper and a spare workstation, run ten real applications through it, time them — and put the IT screen on the follow-up list with a name and a date; changes made in the week are what the event is for ✅
`[D · G6 · Apply · TXN · S · CERT]` — A converts a kaizen event into a proposal meeting; the mock-up tests the sequence, which does not depend on the screen, and the IT dependency is what the follow-up list is for.

**D46.** An accounts-payable queue, stable for the last month, holds 1,800 invoices at the start of the day. The team processes 300 invoices per working day, and the queue is worked first in, first out. The expected lead time for an invoice arriving now, from Little's Law, is:
A. 6 working days ✅ · B. 0.17 working days · C. 6 calendar days · D. 1.2 working days
`[D · G6 · Apply · TXN · X · CERT]` — Lead time = work in process ÷ throughput = 1,800 ÷ 300 per working day; B inverts the ratio, C changes the basis (six working days is more than a calendar week), and D divides again by a five-day week.

**D47.** Accounts-payable flow, one representative week (working days):

```
Step           Throughput (invoices/day)   Queue in front (start of week)
Intake         420                          150
Coding         400                          200
Approval       300                          1,800
Payment run    600                          40
Target lead time (sponsor): 2 working days from receipt to approval
```

The sponsor proposes hiring two more intake clerks. The Green Belt's advice:
A. Agree — intake is where invoices enter, so faster intake shortens every queue behind it · B. Intake already runs faster than approval, which is the constraint; more intake at the same approval throughput only lengthens the 1,800-invoice queue. Set a work-in-process cap at intake of about 600 invoices (2 days × 300 per day) so lead time meets the target, and add capacity at approval if the throughput itself has to rise ✅ · C. Set the work-in-process cap at the approval step, where the queue actually is, and leave intake alone · D. Split the single approval queue into one queue per approver so that each queue is smaller and easier to manage
`[D · G6 · Analyze · TXN · X · CERT]` — C places the limit downstream of the constraint, so the queue moves upstream to coding; D lengthens lead time at the same throughput, since one shared queue beats a queue per server.

**D48.** Sizing a kanban loop for a machined bracket: demand 240 units per working day, replenishment lead time 1.5 working days, safety factor 0.2, container quantity 50 units. Kanbans = (daily demand × replenishment lead time × (1 + safety factor)) ÷ container quantity, rounded up. The number of kanbans is:
A. 6 · B. 8 · C. 9 ✅ · D. 7
`[D · G6 · Apply · MFG · X · CERT]` — 240 × 1.5 × 1.2 ÷ 50 = 8.64, rounded up to 9; B rounds down (or omits the safety factor and rounds up), D omits the safety factor and rounds down, and A omits the lead time.

**D49.** A video of a 47-minute die change on press 12 shows: 14 minutes retrieving the die and bolts from the tool crib, 11 minutes bolting, 9 minutes adjusting, the remainder in moves and checks — all with the press stopped. The first setup-reduction move is:
A. Buy a press with faster clamping, since the bolting and adjusting together are 20 minutes · B. Reduce adjustment first, because it is the hardest step and the rest will follow · C. Replace the bolts with quarter-turn clamps first, because bolting is the second-largest element and clamps are cheap · D. Convert die and bolt retrieval from internal to external — stage the die and a kit before the run ends — because it is the largest element that needs no press-stopped time; then streamline what stays internal (clamps), then reduce adjustment ✅
`[D · G6 · Apply · MFG · S · CERT]` — C skips the step that costs nothing; the order is separate, convert internal to external, streamline internal, reduce adjustment.

**D50.** A spare-parts cell receives one-off orders that arrive unpredictably — some weeks none, some weeks twenty. The sponsor asks the Green Belt to "put it on kanban." The Green Belt should say:
A. Kanban is a replenishment signal that needs a demand pattern; with one-off, lumpy demand there is nothing to replenish, so the flow countermeasure is a make-to-order signal with a work-in-process limit at release, not a kanban loop ✅ · B. Size the kanban on peak-week demand so the loop never runs dry in a busy week · C. Size the kanban on average demand with a safety factor of 1.0 to absorb the swings · D. Kanban works for any demand as long as the containers are small and the loop is checked daily
`[D · G6 · Analyze · MFG · K · CERT]` — B builds inventory for a peak that arrives a few weeks a year; the "when not" rule for kanban is demand with no pattern to signal against.

**D51.** An infusion clinic's chair-occupancy log shows the queue at the lab-and-pharmacy release step is always full while chairs sit empty for the first 40 minutes of most visits. The medical director proposes adding four chairs. The Green Belt's advice:
A. Add the chairs — capacity is capacity, and empty chairs at the start of a visit are a scheduling matter · B. Add the chairs and a work-in-process limit at check-in so the new chairs do not fill with waiting patients · C. The release step is the constraint and sets throughput; four more chairs fill with waiting patients — more work in process at the same throughput means longer lead time, by Little's Law — so the countermeasure sits at the release step, with the clinical release criteria written down before any pull signal is introduced ✅ · D. Add a nurse to the chair area so that patients are set up faster once they are seated
`[D · G6 · Analyze · HC · S · CERT]` — B adds cost and a limit at the wrong place; capacity added anywhere but the constraint changes cost, not flow, and pull without written release criteria becomes an argument.

**D52.** Medical-unit flow, from the bed-management system:

```
Beds (occupied, stable):     32
Average length of stay:      4.0 days (calendar; discharge-to-admission gap negligible)
Requested by the ED:         10 admissions per day
```

Using Little's Law, the unit's current admission capacity and the change needed to reach 10 per day are:
A. 10 per day already — occupancy, not length of stay, limits admissions · B. 4 per day; reaching 10 needs 80 beds · C. 32 per day; reaching 10 needs nothing beyond the existing beds · D. 8 per day (32 beds ÷ 4.0 days); reaching 10 needs an average stay of 3.2 days at 32 beds, or 40 beds at a 4.0-day stay ✅
`[D · G6 · Apply · HC · X · CERT]` — Throughput = work in process ÷ lead time; B divides by 8 and C uses the beds alone; the answer also tells the sponsor that the lever is the release step (length of stay), not the bed count.

<!--
Section D tallies (52 items)
Key position:  A 13 (D3 D7 D10 D12 D16 D18 D24 D28 D32 D39 D44 D46 D50) · B 13 (D1 D5 D11 D14 D20 D22 D26 D29 D33 D36 D40 D42 D47) · C 13 (D2 D6 D9 D13 D17 D21 D25 D31 D35 D37 D41 D48 D51) · D 13 (D4 D8 D15 D19 D23 D27 D30 D34 D38 D43 D45 D49 D52)
Type:  S 21 (40%) · X 18 (35%) · K 13 (25%)
Bloom: Remember 3 · Understand 5 · Apply 22 · Analyze 22 → Apply/Analyze 44 (85%)
Vertical: MFG 14 · HC 15 · TXN 14 · NEU 9
Negative stems: 0
Topic coverage: SCAMPER/benchmarking D1–D8 · selection matrices D9–D15 · pilot design D16–D24 · before/after evidence D25–D33 · mistake-proofing D34–D41 · kaizen D42–D45 · flow D46–D52
"When not to use" coverage: SCAMPER on an unverified cause (D5), benchmarking the artifact (D3), matrix around one candidate (D13), before/after when other changes are in flight (D20), before/after when the process runs rarely (D21), whole-process pilot (D24), several changes at once (D23), poka-yoke on common-cause variation (D38), kaizen on an unverified cause (D43), kanban on lumpy demand (D50), WIP limit downstream of the constraint (D47), capacity away from the constraint (D51)
-->

---

v1.0 · 2026-09-20
