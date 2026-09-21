# Black Belt Exam Bank — Sections A and B

Part of the Black Belt certification item bank. The blueprint, the minimally competent
candidate statement, the form-assembly constraints and the pool rules are in
[`../exam-bank.md`](../exam-bank.md); item-writing policy is
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).

**Tag format:** `[section · objective · Bloom · vertical · type · pool]` — **B1** select and
charter strategically linked projects and run advanced VOC: build and defend a project
portfolio, trace a metric to an objective with arithmetic, design and read a Kano survey, say
what a conjoint study is for, write a charter that carries decision rights and escalation, and
launch a team you do not manage. **B2** design and interpret advanced measurement systems:
choose the study that fits the metric, run nested and attribute-complex designs, read expanded
Gage R&R output, state measurement uncertainty, and validate system-generated data before it
carries a baseline. Type: K = concept, S = scenario judgment, X = exhibit interpretation.
Correct option ✅; rationale after the dash.

**Conventions used in these items.** Exhibits are product-neutral and organization-neutral.
Unless a stem says otherwise, the prioritization matrix is the course's: strategic linkage 30,
annualized impact 25, data and measurement feasibility 15, cross-functional scope 10,
implementation risk 10, time to first benefit 10, each criterion scored 1–5 against a written
anchor, maximum 500. Triage removes Just-Do-Its (cause verified, countermeasure known, one
function), capital or policy decisions, and unmeasurable candidates before any scoring. A
strategic linkage statement has four parts: the objective quoted with its target and date; the
primary metric with its operational definition and measured baseline; the mechanism as
checkable "therefore" steps; and the arithmetic, on the objective's own scale and time basis.
Kano categories are M must-be, O one-dimensional, A attractive, I indifferent, R reverse and
Q questionable; the satisfaction coefficient is CS = (A + O) ÷ (A + O + M + I) and the
dissatisfaction coefficient is DS = −(O + M) ÷ (A + O + M + I), with R and Q excluded from the
denominator and reported separately. MSA acceptance criteria, written into the plan before any
data are collected: %GRR of study variation below 10% acceptable, 10–30% marginal with a
written reason, above 30% unacceptable; ndc ≥ 5; kappa ≥ 0.75 acceptable and below 0.40
unacceptable; Kendall's coefficients ≥ 0.90. The 6σ convention (AIAG, the Minitab default) is
the house standard, so %tolerance = 6 × SD_GRR ÷ (USL − LSL) and
ndc = 1.41 × SD_part ÷ SD_GRR, truncated. In a balanced nested study with o operators, b
batches per operator and n items per batch the expected mean squares are σ²_rep;
σ²_rep + n·σ²_batch; σ²_rep + n·σ²_batch + n·b·σ²_operator — so the operator term is tested
against batch(operator), never against repeatability. Cohen's kappa = (P_o − P_e) ÷ (1 − P_e).
A paired audit's difference is recorded − observed; its mean is the bias, and its standard
deviation is compared with the process standard deviation and with the charter's δ.
Uncertainty: standard uncertainties combine in quadrature; a rectangular half-width a
contributes a ÷ √3; an instrument resolution r contributes r ÷ (2√3); a calibration
certificate quoted at k = 2 contributes half its stated value; and the expanded uncertainty is
U = k·u_c with k = 2 for about 95%. Control limits come from the process; specification limits
come from the customer.

---

## Section A — Strategic Define (42 CERT)

**A1.** Exhibit — contract electronics assembler, the five candidates surviving triage, scored on the published weights (the totals column has been left off deliberately):
| Candidate | Linkage (30) | Impact (25) | Feasibility (15) | Cross-fn (10) | Risk (10) | Time (10) |
|---|---|---|---|---|---|---|
| P · Inbound component defects | 5 | 4 | 3 | 4 | 3 | 3 |
| Q · Label print rework | 3 | 3 | 5 | 3 | 5 | 5 |
| R · Freight expedite spend | 4 | 5 | 4 | 4 | 2 | 2 |
| S · Conformal-coat scrap | 2 | 5 | 5 | 2 | 4 | 4 |
| T · Warranty diagnosis time | 5 | 3 | 4 | 3 | 3 | 3 |

Capacity is two Black Belt projects. The two the matrix selects are:
A. Q and S, strongest on the criteria the team can act on fastest · B. P and R, the two highest weighted totals ✅ · C. P and Q, the two highest totals of the unweighted 1–5 scores · D. R and S, the two candidates scoring 5 on annualized impact
`[A · B1 · Apply · MFG · X · CERT]` — Weighted totals are P 395, R 385, T 375, Q 370, S 360, so P and R are selected; C is the unweighted ranking (Q 24 against P’s 22), and the weights exist precisely to override it — Q leads on three criteria worth 35 points between them and trails on linkage, which carries 30 on its own.

**A2.** A shared-services centre's candidate list includes "duplicate vendor payments, $190K a year." The accounts-payable lead's note says the cause is already verified — two vendor master records are created because invoices arrive down two intake paths — and the fix is to merge the records and close one path, both inside her own team. Your handling of this candidate:
A. Score it in the matrix; a verified cause makes it low-risk and highly feasible, so it will rank where it deserves to · B. Route it to a Green Belt as a DMAIC project, since the payment data still need analysis first · C. Take it off the list before scoring, with a one-line note naming the owner and the date the records will be merged ✅ · D. Reject it outright, because work that does not need DMAIC sits outside the improvement programme
`[A · B1 · Analyze · TXN · S · CERT]` — Triage removes the Just-Do-It — a verified cause plus a known countermeasure inside one function is work to be done, not investigated — so that the matrix compares investigations with investigations; A is the tempting choice because the scores really would be high, and that is the problem: a candidate needing no investigation would outrank ones that do.

**A3.** Exhibit — regional hospital system, six candidates offered for scoring; the Measure window in the calendar is three weeks:
| # | Candidate | Linked objective | Metric exists? | Est. annual impact | Functions | Months to first benefit |
|---|---|---|---|---|---|---|
| 1 | Medication reconciliation on discharge | Readmissions | Yes, EHR field | $640K | 4 | 4 |
| 2 | Theatre turnaround time | Surgical throughput | Yes, theatre log | $520K | 3 | 5 |
| 3 | Clinic no-show rate | Access | Yes, scheduling system | $310K | 2 | 3 |
| 4 | "Improve staff morale on the wards" | (blank) | No metric; none proposed | Not estimated | All | Not estimated |
| 5 | Sterile-instrument set errors | Surgical safety | Partial, incident log only | $180K | 3 | 6 |
| 6 | Second CT scanner | Imaging wait time | Yes, RIS | $1.1M | 1 | 14 |

The portfolio rule you apply to row 4 is:
A. Return it to the chief nursing officer before scoring, with the question “what would we count, and who would count it?” ✅ · B. Score it with feasibility 1 and leave the impact blank, so that the matrix records it honestly and it falls to the bottom · C. Select it anyway, since the Measure phase exists to build the metrics a candidate does not yet have · D. Reject it permanently, because a problem nobody has found a way to count is not yet a problem
`[A · B1 · Analyze · HC · X · CERT]` — The unmeasurable candidate leaves the list at triage with a question rather than a score, and returns next cycle if an answer arrives, because the matrix is the argument shown to the functional heads and a candidate that cannot be measured inside the three-week Measure window cannot be compared with ones that can; B is the honest-looking distractor, but a 1 on a 15-point criterion still leaves the candidate competing on impact and linkage.

**A4.** The portfolio pitch is over. The plant manager — who proposed the candidate that ranked fourth on the criteria she agreed to two weeks ago — says quietly, "I still think that one is the real problem here." Your response:
A. Add it as a third project; sponsor support is worth more to the programme than a ranking · B. Drop the lowest-ranked selected project and substitute hers, so that she stays engaged · C. Say that the criteria have spoken, thank her for the proposal, and move the meeting on to the next agenda item · D. Say where it ranks on the criteria she agreed, then ask what would have to be true for it to rank first ✅
`[A · B1 · Evaluate · MFG · S · CERT]` — A senior leader’s favourite is information — she is closer to something the criteria did not capture, and her answer is data about a risk the scorecard is not yet carrying — and the question surfaces it without either caving or dismissing her; B keeps her engaged at the cost of the only thing that made the ranking worth agreeing to.

**A5.** You score the portfolio on the published weights, then re-run it with strategic linkage at 40 and annualized impact at 15 to see whether the top two change. This sensitivity run is legitimate because:
A. Once the scores are visible, the weights can be replaced with ones that fit the evidence better · B. It tests how far the selection rests on one judgment, is run before the decision, and is reported beside the original ✅ · C. Any weighting is arbitrary, so several rankings should be published and the sponsor left to choose among them · D. Two weights that still sum to 100 cannot change any candidate’s rank, which is what makes the matrix defensible
`[A · B1 · Understand · NEU · K · CERT]` — Sensitivity analysis and re-weighting to change the winner use the same arithmetic and differ entirely in when and why they are done, which is why the second ranking is reported beside the first rather than in place of it; A is that second thing, and it is the failure the “weights before scores” rule exists to prevent.

**A6.** Exhibit — insurance operations, the five candidates remaining after triage; capacity is two Black Belt projects:
| Rank | Candidate | Total | Constraint resource needed | Weeks needed |
|---|---|---|---|---|
| 1 | Underwriting referral loop | 430 | Data engineer (the only one) | Weeks 3–10 |
| 2 | First-notification-of-loss handoff | 415 | Data engineer (the only one) | Weeks 3–11 |
| 3 | Renewal quote turnaround | 405 | None — data already in the warehouse | — |
| 4 | Complaint root-cause coding | 360 | Data engineer (the only one) | Weeks 6–12 |
| 5 | Premium refund cycle time | 340 | None | — |

There is no contract-resource budget this year, and the data engineer is the only person who can build the extracts the first two candidates need. Your recommendation to the sponsor:
A. Select ranks 1 and 2 and ask the data engineer to split her time between them; a 50% allocation delays each by a few weeks · B. Select ranks 1 and 2 and re-sequence the second to start when she finishes the first, which fits both inside the year · C. Re-score rank 2 with lower feasibility, so that the matrix produces the capacity answer by itself rather than a person · D. Select ranks 1 and 3, recording rank 2 as deferred for capacity — the resource, the weeks and the reconsideration date named ✅
`[A · B1 · Analyze · TXN · X · CERT]` — Capacity is a selection criterion, and the honest form of a capacity decision names the resource and the date rather than disguising itself as a score, so that the deferral reads as a resource statement rather than a judgment on the project; B pushes the second project to weeks 11–19 and so defers it too, but as a schedule nobody agreed rather than as a decision the sponsor made, and C is the one to reject hardest, because it produces the right projects by corrupting the record of why.

**A7.** A regulator's inspection finding requires a documented corrective action on medication labelling within 90 days. The quality director asks you to enter it in the improvement portfolio and score it alongside the other candidates. You advise:
A. Score it alongside the rest; a regulatory finding scores 5 on strategic linkage and 5 on risk, so it will win on its merits anyway · B. Score it with the weights temporarily adjusted so that any item carrying a statutory deadline ranks first · C. Keep it out of the matrix: a mandated action with a statutory deadline is resourced first, and the matrix allocates what is left ✅ · D. Decline it; corrective actions belong to the quality management system rather than to the improvement portfolio
`[A · B1 · Evaluate · HC · S · CERT]` — A prioritization matrix allocates discretionary capacity among things that could be chosen, and putting a mandate into it implies the mandate could lose; A reaches the right resourcing by an argument that would fail the first time a mandate scored badly on feasibility.

**A8.** Exhibit — a capital candidate from an axle plant's list, scored on the published weights:
```
Candidate 6 — "Second machining centre"
Linkage 4 · Impact 5 · Feasibility 2 · Cross-functional 4 · Risk 2 · Time to first benefit 1
Estimated annual impact $1.1M (the machining department's own model, not yet with Finance)
Months to first benefit 14 · Functions in scope: machining only, plus the capital committee
Selected projects this cycle score 425 and 400
```
What the portfolio record should say:
A. Score 345, with a note that the $1.1M is unverified and late, and route the purchase to the capital committee ✅ · B. Select it; $1.1M dwarfs everything else on the list and the programme is judged on dollars banked · C. Reject it, because a benefit arriving more than a year out cannot be credited to a Black Belt project · D. Divide the $1.1M across the 14 months and re-enter it monthly, so the comparison with the others is fair
`[A · B1 · Analyze · MFG · X · CERT]` — The arithmetic is 4×30 + 5×25 + 2×15 + 4×10 + 2×10 + 1×10 = 345 against the selected projects’ 425 and 400, and the score is the smaller point: a purchase decision is a capital case rather than a DMAIC investigation, so it leaves the matrix at triage whatever it scores, going to the capital committee with the business case the department has started; D is the most seductive distractor because re-basing a benefit figure to “make the comparison fair” is exactly how a capital item wins a competition it should not have entered.

**A9.** A collections-team candidate is single-function, has a $40K estimated annual impact, has clean data available, and has no verified cause. The programme's Black Belt threshold is $75K annualized and cross-functional scope. You:
A. Take it as a Black Belt project; the impact figure will grow once the analysis has properly started · B. Reject it; below the impact threshold it is not worth anybody’s project time · C. Bundle it with two other small collections candidates so that the total clears $75K · D. Route it to a Green Belt with a named coach, recording that it went on scope and scale ✅
`[A · B1 · Apply · TXN · S · CERT]` — Routing is a decision the portfolio records rather than a rejection, and the note saying it went on scope and scale rather than on merit is what the proposer is owed; C is the failure mode to name — three unrelated candidates bundled to clear a threshold produce one project with three problem statements and no verifiable cause.

**A10.** Exhibit — the same four candidates under the published weights and under a sensitivity run:
| Candidate | Linkage | Impact | Total, published (L 30 · I 25) | Total, sensitivity (L 40 · I 15) |
|---|---|---|---|---|
| V1 | 5 | 3 | 385 | 405 |
| V2 | 4 | 5 | 405 | 395 |
| V3 | 3 | 4 | 375 | 365 |
| V4 | 4 | 3 | 340 | 350 |

(All other criteria and scores are unchanged; both weightings sum to 100; the sponsor has seen neither ranking and the decision has not yet been made.) What you do with this:
A. Use the published weights and file the sensitivity run with the working papers; it has no standing once the weights are agreed · B. Average the two rankings and select the top two candidates of the averaged order · C. Report both, and ask the sponsor the one question they differ on: close the biggest scorecard gap, or bank the most money? ✅ · D. Run a third weighting and select whichever two candidates rank top in at least two of the runs
`[A · B1 · Analyze · NEU · X · CERT]` — V1 and V2 swap places and nothing else moves, which localizes the disagreement to one judgment about linkage against impact — and only the sponsor owns that judgment, because only the sponsor can say what the organization is buying this year; A is the procedurally safe answer and the poor one, since it hides a choice the sponsor alone can settle.

**A11.** Exhibit — inputs for a strategic linkage statement:
```
Objective, quoted from the FY plan: "Reduce the 30-day all-cause readmission rate from 14.8%
  to 12.5% by 30 June."
Project primary metric: proportion of medical discharges with a completed medication
  reconciliation and a booked follow-up within 7 calendar days
Baseline 46% (2,400 medical discharges per quarter, 90 days of EHR data, validated in week 3)
Target 85%
Fitted from 24 months of the system's own monthly data: each 10-percentage-point rise in the
  bundle completion rate is associated with a 0.35-percentage-point fall in the readmission
  rate. The fit is of the system-wide readmission rate on the medical-discharge completion
  rate, so it is already expressed on the objective's scale.
```
The arithmetic line the statement should carry:
A. About 11.8%, closing the whole 2.3-point gap: completion rises 85% of the way, which is 8.5 units of ten points · B. About 13.4% — some 1.4 of the 2.3 points of gap — with the statement naming the project expected to carry the rest ✅ · C. About 14.3%, because the 1.4-point effect applies only to medical discharges, about a third of all discharges · D. No arithmetic: the fitted relationship is associational, so the statement says only that the project “supports the objective”
`[A · B1 · Apply · HC · X · CERT]` — The rise is 39 points, or 3.9 units of ten, so 3.9 × 0.35 = 1.365 points off 14.8 gives 13.4 and closes 59% of the gap, with the portfolio project expected to carry the remainder named in the statement; C is the reasonable alternative basis the exhibit closes off in its last sentence, and applying the discount twice is the commonest way a linkage statement understates itself.

**A12.** A draft linkage statement for a contact-centre project reads: "This project supports our customer-experience strategy and will deliver significant savings in the centre." The sponsor has already initialled it. Your review comment:
A. Adequate — the sponsor’s initials are what rubric item D2 scores, and the arithmetic arrives with Finance at Control · B. Replace “significant” with a dollar figure from the Finance partner’s cost model and leave the rest as written · C. Add the three CTQs from the Kano survey, which is where any customer-experience claim has to come from · D. Nothing in it can be checked: no objective with a target and date, no metric with a baseline, no mechanism, no arithmetic ✅
`[A · B1 · Evaluate · TXN · S · CERT]` — A signature on an unverifiable sentence commits nobody to anything, which is why D2 asks for a line a stranger could verify step by step and not for the endorsement — so it is rewritten and taken back for initials; B fixes the one word that is easiest to see and leaves the statement still unable to say which number moves, by how much, by when.

**A13.** A candidate meets the programme's impact threshold, crosses three functions, and has a signed sponsor. It may still not be a Black Belt project. The test that decides is:
A. Whether the candidate's cause is already known, in which case it is a Just-Do-It · B. If this project fully succeeds, which number on the sponsor's scorecard moves, by how much, and by when? ✅ · C. Whether the annualized impact has been verified by the Finance partner rather than estimated by the proposing function · D. Whether the team members' managers have signed time contracts for the duration
`[A · B1 · Understand · NEU · K · CERT]` — Scale, scope and sponsorship are entry conditions; strategic linkage is the test, and a candidate that fails all three parts of it is a worthwhile local project that should be routed and said so; C is a real requirement that arrives later and answers "how much", never "which number".

**A14.** Exhibit — inputs for a strategic linkage statement:
```
Objective, quoted from the operations plan: "Reduce total cost of poor quality from 3.8% of
  revenue to 2.5% by year end." Revenue plan $420M.
Project primary metric: first-pass yield at final test, weekly, all product families
Baseline 91.4% (26 weeks, validated in week 3) · Target 96.0%
Finance partner's cost model: $38 per unit failing final test (materials, labour, retest),
  240,000 units built per year
```
The arithmetic line the statement should carry:
A. About $420K a year — 11,040 fewer failures at $38 — which is about 8% of the $5.46M gap, and the statement says so ✅ · B. About $420K a year, which closes the cost-of-poor-quality objective, since it is the largest single contributor on the list · C. About $784K a year: 8.6% of the 240,000 units built, at $38 each, is the failure cost the project is aimed at · D. No dollar figure until the Finance partner has signed the benefit, so the linkage statement waits until Control closes
`[A · B1 · Analyze · MFG · X · CERT]` — Failures fall from 20,640 to 9,600 units, so 11,040 × $38 = $419,520 against a gap of 1.3% × $420M = $5.46M, which is 7.7% — and the statement names the other portfolio projects expected to carry the rest; C is the total cost of today’s failures rather than the reduction, and it is the figure a project claims when it forgets that the target is not zero.

**A15.** The calendar requires the charter signed at the end of week 2. No measured baseline exists for the boarding-time metric, the timestamp audit is scheduled for week 3, and the bed-management director says "it was about four hours last year — everybody knows that." You:
A. Use 4 hours, marked “estimated”, and replace it after Measure; the charter needs a number in order to be signed · B. Delay the charter until the measured baseline exists, which moves the signature from week 2 to week 4, and tell the sponsor why the calendar slipped · C. Write the baseline as “to be measured in week 3 from the bed-management extract”, set the target as a percentage reduction, and sign on time ✅ · D. Use 4 hours, set the target at 2 hours, and adjust both in the tollgate pack if the measured baseline differs
`[A · B1 · Evaluate · HC · S · CERT]` — A baseline reconstructed from memory is the one number that cannot be corrected later, because every claim built on it inherits it — so the charter is signed on the calendar’s date with the gap named, the target fixed once the baseline exists, and the sponsor told why the number is not there yet; D is the version that does most damage, since a target set against a remembered baseline quietly becomes the benefit the project reports.

**A16.** Exhibit — two benefit claims submitted to the Finance partner from the same portfolio:
```
Project   Primary metric                        Claimed annual benefit   Benefit class
P-14      First-time-right application rate           $380,000           Cost avoidance
P-19      Re-work touches per application             $265,000           Cost avoidance

Finance partner's note: both figures are computed from the same pool — the 18,400 re-work
touches recorded last year at a loaded $35 per touch. P-14 removes touches by preventing the
errors that cause them; P-19 removes touches by handling each one once instead of twice.
```
The correct reading:
A. Both claims stand; each project independently removes the touches its own mechanism addresses, and neither double-counts · B. Halve both claims, since two projects are drawing benefit from one pool of re-work touches · C. Drop P-19, because a prevention project upstream makes a downstream rework project unnecessary · D. The claims total $645K against a pool of $644K, so the pool is apportioned by mechanism before either charter is signed ✅
`[A · B1 · Analyze · TXN · X · CERT]` — 18,400 × $35 = $644,000, so the two claims consume the whole pool — possible only if neither project leaves any re-work for the other — and the portfolio would promise the executive team more than exists, so both Black Belts and the Finance partner apportion it and restate both linkage statements; B lands near the right answer by arithmetic that nobody can check, and an apportionment Finance cannot trace is the claim that gets withdrawn at the first audit.

**A17.** A candidate would cut a maintenance team's paperwork by about 200 hours a year. The hours are not backfilled, the team's headcount is fixed, no scorecard metric changes, and the maintenance manager — who is short-staffed and reasoning sensibly — wants it done. You:
A. Charter it as a Black Belt project and count the 200 hours a year as a hard saving against the budget · B. Say plainly that it has no line to a scorecard objective, route it to the team’s own Yellow Belt, and record it ✅ · C. Charter it as a Black Belt project but classify the benefit as cost avoidance rather than as a hard saving · D. Decline it and explain that capacity released without a backfill is no benefit, so the request should not have been made
`[A · B1 · Apply · MFG · S · CERT]` — The linkage test fails on all three parts and the honest answer routes the work to a named coach rather than inflating it, recording on the portfolio what was routed and why so the sponsor can see it; D reaches the same routing decision by telling a manager he was wrong to ask, which is how a programme loses the next candidate that would have been a good one.

**A18.** Exhibit — linkage arithmetic as submitted for review:
```
"Cycle time falls 12 minutes per unit. The line makes 340 units per shift.
 12 × 340 = 4,080 minutes = 68 hours saved per shift, which at $62 per loaded hour is
 $4,216 a shift and $3.1M a year on 740 shifts."
 Staffing on the line: six operators per 8-hour shift.
```
The reviewer's correction:
A. The sums are right and the basis is wrong: 68 hours a shift exceeds the 48 paid hours six operators contain, so the minutes are queue time ✅ · B. The arithmetic is wrong: 4,080 minutes is 6.8 hours rather than 68, so the annual figure is out by a factor of ten and should read about $310K · C. The basis should be calendar days rather than shifts, which brings the annual figure down to about $1.0M · D. The figure computes correctly but must be halved, because a first-year benefit is claimed for six months only
`[A · B1 · Apply · MFG · X · CERT]` — Every number in the chain computes correctly and the conversion from cycle-time minutes to paid hours is the defect, which the staffing line makes visible: 48 paid hours exist to be saved and the claim is 68, so the benefit is stated as released capacity in units per shift and Finance decides whether and when it becomes cash; B is the arithmetic slip a reviewer expects to find and does not, which is why the basis has to be read even when the sums are right.

**A19.** Exhibit — Kano survey, commercial insurance claimants, 120 respondents, six requirements:
| Requirement | A | O | M | I | R | Q | Category | CS | DS |
|---|---|---|---|---|---|---|---|---|---|
| Same-day acknowledgement of a claim | 12 | 30 | 58 | 14 | 2 | 4 | M | 0.37 | −0.77 |
| Single point of contact throughout | 20 | 44 | 28 | 22 | 3 | 3 | O | 0.56 | −0.63 |
| Online claim tracking | 61 | 24 | 7 | 22 | 2 | 4 | A | 0.75 | −0.27 |
| Settlement within 10 working days | 8 | 34 | 62 | 10 | 2 | 4 | M | 0.37 | −0.84 |
| Choice of repair network | 26 | 12 | 6 | 58 | 14 | 4 | I | 0.37 | −0.18 |
| Photo upload from a phone | 33 | 14 | 5 | 52 | 12 | 4 | I | 0.45 | −0.18 |

Which requirement takes a specification limit, and which takes none at all:
A. Online tracking takes the tightest limit, since its satisfaction coefficient is the highest on the list · B. Every requirement with DS below −0.50 takes a limit, and the three above that line leave scope · C. Settlement within 10 working days takes a limit; online tracking takes none, being attractive rather than a conformance test ✅ · D. Single point of contact takes the limit, because one-dimensional requirements are the only ones measured on a continuous scale
`[A · B1 · Analyze · TXN · X · CERT]` — Must-be requirements set limits — settlement within 10 working days, DS −0.84 — one-dimensional requirements set targets on a scale, and attractive requirements set neither, so online tracking is a design option for Improve and a differentiator; D is the closest wrong answer because it is right that “single point of contact” is measured on a scale and wrong that a scale implies a limit.

**A20.** An attractive (A) requirement is never written as a specification limit because:
A. Its absence is not held against you, so a limit would fail the process on something no customer is dissatisfied by ✅ · B. Attractive requirements are optional features, and an optional feature has no measurable form to specify · C. Attractive requirements migrate towards must-be over time, so any limit set today is wrong within a year · D. Specification limits come from the process, while attractive requirements come from the customer’s own words
`[A · B1 · Understand · NEU · K · CERT]` — The category describes an asymmetry — satisfaction rises when the feature is present and does not fall when it is absent — so its presence is a design choice rather than a conformance test, while a limit assumes the symmetry a must-be has; C states something true about drift and draws the wrong conclusion, since migration is a reason to re-survey rather than a reason not to specify, and D reverses the house rule, in which specification limits come from the customer and control limits come from the process.

**A21.** Exhibit — one respondent's Kano answer pairs, outpatient clinic patients (five-point scale: like · expect · neutral · can live with · dislike):
| Requirement | Functional answer | Dysfunctional answer |
|---|---|---|
| R1 Appointment reminder by text | like | neutral |
| R2 Same clinician at each visit | expect | dislike |
| R3 Evening appointments | like | dislike |
| R4 Television in the waiting room | neutral | neutral |

Classified on the standard evaluation table, these four are:
A. R1 attractive · R2 must-be · R3 one-dimensional · R4 indifferent ✅ · B. R1 one-dimensional · R2 must-be · R3 attractive · R4 indifferent · C. R1 attractive · R2 one-dimensional · R3 must-be · R4 questionable · D. R1 must-be · R2 attractive · R3 one-dimensional · R4 reverse
`[A · B1 · Apply · HC · X · CERT]` — Like paired with dislike is one-dimensional, like paired with anything softer is attractive, and expect paired with dislike is must-be; B swaps R1 and R3, which is the error of reading only the functional answer, and neutral/neutral is indifferent rather than questionable, since questionable needs a contradiction (like/like or dislike/dislike).

**A22.** Exhibit — one requirement from a spare-parts distributor's Kano survey, 96 customers, shown pooled and split by segment:
| Group | n | A | O | M | I | R | Q | Plurality |
|---|---|---|---|---|---|---|---|---|
| All respondents | 96 | 24 | 10 | 6 | 38 | 14 | 4 | I |
| Plants with < 200 staff | 44 | 22 | 8 | 3 | 9 | 1 | 1 | A |
| Plants with ≥ 200 staff | 52 | 2 | 2 | 3 | 29 | 13 | 3 | I (R = 13) |

Requirement: "we hold your consumables on site and invoice on consumption." The correct reading:
A. Drop it: an indifferent category overall means that no segment of the customer base cares about it enough to pay anything for it · B. Include it for everyone; 24 attractive answers is the largest positive count on the whole survey · C. Re-run the survey with clearer wording, since a category this unstable is usually a questionable-answer problem · D. Offer it to the small plants and exclude it from the large-plant design; the pooled category averages two opposite answers ✅
`[A · B1 · Analyze · MFG · X · CERT]` — Thirteen reverse answers concentrated in one segment — a quarter of the large plants, who have their own stores staff — is a segment finding rather than noise, and pooling has cancelled a real preference against a real objection, so the split is written into the CTQ table; C is the right instinct applied to the wrong signal, because only 4 of 96 answers were questionable and the wording is doing its job.

**A23.** A logistics provider's project serves three contract customers who between them are 78% of revenue and who renegotiate service terms annually, plus about 400 small accounts. The team proposes one 40-respondent Kano survey across the whole customer base. You advise:
A. Run it as planned; 40 respondents clears the sample-size rule and will return the categories · B. Run it, but weight every response by that customer’s share of annual revenue, so the three largest accounts carry the categories · C. Keep the three large accounts out of the survey, read their contracts, interview them directly, and survey the small accounts ✅ · D. Replace the survey with a conjoint study, which handles unequal customer size correctly at this sample size
`[A · B1 · Evaluate · TXN · S · CERT]` — A survey is the wrong instrument where a named customer’s own words are already negotiated and binding, and the plurality rule is what makes it wrong here — 37 small accounts could outvote 78% of the revenue — while on the small-account segment it answers a question nothing else can; B tries to repair the instrument with weights, which produces a category that no respondent and no contract actually asserts.

**A24.** Exhibit — one requirement's Kano tally, 120 respondents:
```
Requirement: "the dealer confirms the service completion time before work starts"
A 27   O 39   M 18   I 24   R 8   Q 4
```
The satisfaction and dissatisfaction coefficients are:
A. CS 0.55, DS −0.48 · B. CS 0.61, DS −0.53 ✅ · C. CS 0.61, DS −0.39 · D. CS 0.25, DS −0.53
`[A · B1 · Apply · TXN · X · CERT]` — The denominator is A + O + M + I = 108, so CS = 66 ÷ 108 = 0.61 and DS = −57 ÷ 108 = −0.53; A is what you get by dividing by all 120 responses, which leaves the reverse and questionable answers in a denominator the method excludes, and C uses M + I in the numerator of DS instead of O + M.

**A25.** Exhibit — one requirement's Kano tally, 120 respondents:
```
Requirement: "the machine's fault code names the part to change"
A 14   O 32   M 34   I 26   R 6   Q 8
CS 0.43   DS −0.62
```
How this requirement enters the CTQ table:
A. As a must-be carrying a specification limit; on a Kano tally the plurality of answers decides the category, and here M leads · B. As one-dimensional, because a two-response margin is no decision and both coefficients lean that way · C. Not at all until the survey is re-run with enough respondents to separate M from O convincingly · D. Carrying both patterns: a limit at the threshold customers named, a target on the scale beyond it, basis recorded as mixed ✅
`[A · B1 · Analyze · MFG · X · CERT]` — Reading a plurality as a decision when two categories sit two responses apart is the commonest Kano error, and CS 0.43 with DS −0.62 sits between the must-be and one-dimensional profiles, so the basis line reads “mixed; plurality margin within sampling noise”; B is the better of the two single-category answers and still discards the must-be half of the evidence, which is the half that sets a limit.

**A26.** Exhibit — one requirement's Kano tally, 120 respondents:
```
Requirement: "the system tells you when your request will be finished"
A 18   O 21   M 12   I 42   R 4   Q 23
Answer pairs behind the 23 questionable responses: 21 are like/like; 2 are dislike/dislike
```
The correct handling:
A. Classify it indifferent — 42 is the plurality — and drop the requirement from the project’s scope · B. Exclude the 23 questionable responses and classify on the remaining 97, which is what the method prescribes · C. Record no category: fix the dysfunctional stem and re-ask this one requirement, because the survey measured the wording ✅ · D. Treat like/like as attractive, since a respondent who welcomes both presence and absence wants something unexpected
`[A · B1 · Analyze · NEU · X · CERT]` — Questionable is a defect signal about the item, and at 23 of 120 responses — 19%, and 21 of them like/like — it is the finding rather than a rounding loss: most respondents read the dysfunctional question as something they would also welcome; B is the method’s standard handling and the best distractor, because excluding 23 responses correctly computes coefficients for a question a fifth of the sample did not read as intended.

**A27.** A Kano survey classes "decision communicated within 5 working days" as must-be with DS −0.81. Current performance is 71% within five days. The sponsor asks for a target. You write the CTQ as:
A. “Decision within 5 working days, 100% of applications — a must-be requirement admits no failures” · B. “Decision within 5 working days for ≥ 95% of complete applications (baseline 71%); the threshold is the survey’s, the 95% the sponsor’s” ✅ · C. “Median decision time ≤ 5 working days (baseline 7.2 days); a must-be is stated as a median, so that the metric resists outliers and skew” · D. “Decision within 5 working days, ≥ 95% of complete applications. Basis: the published industry benchmark”
`[A · B1 · Apply · TXN · S · CERT]` — A CTQ carries a threshold, a level of performance against it, and the separate source of each recorded separately, because the survey can set the first and only the sponsor’s risk appetite can set the second; C is the sophisticated wrong answer — a median hides exactly the tail of late decisions that a must-be is about, since a customer experiences their own application and not the distribution.

**A28.** A community-clinic group's Kano survey returns 52 usable responses, splitting 34 and 18 between the two patient segments the team intended to compare. You:
A. Report the pooled coefficients and both segments’ categories, and say plainly that 18 is below the 30 a comparison needs ✅ · B. Report both segments’ coefficients; 18 respondents is enough for a descriptive statistic that is not being tested · C. Combine the segments, because a comparison that cannot be made honestly should not be reported at all · D. Report the 34-respondent segment’s coefficients and describe the other qualitatively, without saying why they differ
`[A · B1 · Understand · HC · K · CERT]` — The rule is at least 30 per segment you intend to compare, and the honest form names what the smaller segment can and cannot support — then either collects more from it or treats its result as an interview finding rather than a survey result; D reaches almost the right treatment and omits the sentence that lets a reader judge it, which is the part the reviewer of record reads.

**A29.** A conjoint study and a Kano survey answer different questions. The one only conjoint answers is:
A. Which requirements customers will punish you for missing, and which ones they will not notice at all · B. The exchange rate between requirements: how much of one attribute a customer gives up for another ✅ · C. Which customer segments exist in the base, how large each one is, and which is growing · D. Whether a requirement is stable enough over time to be written as a specification limit
`[A · B1 · Understand · NEU · K · CERT]` — Kano gives the category of each requirement one at a time; conjoint gives the trade-off between them by making respondents choose between whole offers; A is what Kano does, and both methods can surface segments, so C discriminates nothing.

**A30.** A clinic network's Improve phase must choose between extending evening hours and guaranteeing the same clinician at each visit. Both are one-dimensional requirements, both are expensive, the choice will be hard to reverse, and the decision is twelve weeks away. You:
A. Run a second Kano survey with the two requirements phrased as alternatives to one another · B. Decide on complaint volume, which already ranks the two requirements against each other · C. Commission a choice-based conjoint through a research partner: this is the trade-off case, and twelve weeks is enough ✅ · D. Run the conjoint in-house from a fractional factorial design, which uses the same arithmetic already taught in Module 5
`[A · B1 · Apply · HC · S · CERT]` — The trade-off itself is the decision, and the method’s preconditions are all present — two one-dimensional requirements, a choice that is hard to reverse, and time for the designed profile set and the 150–300 respondents it needs — which is exactly when a Black Belt commissions rather than substitutes; D is the trap for a candidate who has just learned fractional factorials, because the design is the smallest part of a conjoint study and the estimation, panel and analysis are the rest.

**A31.** A spare-parts distributor's Black Belt proposes a conjoint study to settle whether customers value next-day delivery more than a wider stocked range. Improve starts in five weeks, the external research budget is zero, and the top eight customers are 60% of revenue and are met quarterly by the sales team. You:
A. Commission it anyway and delay Improve by four weeks; the trade-off is the project’s central decision · B. Run a cut-down conjoint in-house with eight profiles and the thirty respondents the sales team can reach · C. Substitute a Kano survey, which measures the same trade-off at a fraction of the cost and inside five weeks · D. Do not commission it — respondents, budget and weeks are all absent — and take the trade-off to the eight customers ✅
`[A · B1 · Evaluate · MFG · S · CERT]` — When the method’s preconditions are absent — a designed profile set, 150–300 respondents, specialist analysis and four to eight weeks — the answer is a different method honestly labelled: a structured choice at the next quarterly meeting, with the basis recorded as interviews with the accounts that carry the revenue; C is wrong for the reason a conjoint was proposed in the first place, since Kano returns a category per requirement and never an exchange rate between two.

**A32.** Exhibit — decision-rights table as submitted in a charter:
| Decision | Decides | Consulted | Informed |
|---|---|---|---|
| Anything about the incoming inspection plan | Raj (quality manager) | the Black Belt | purchasing |
| Trials on line 2 | Maria (production manager) | Raj | quality |
| Money | the sponsor | the Black Belt | Finance |
| Anything else | the Black Belt | — | the sponsor |

Your review comment:
A. It is adequate; naming people is clearer than naming roles, and everyone on the team already knows who to ask about which decision · B. Add a fourth column for “who may veto a decision”, which is the one real gap in this table · C. Three defects — people rather than decision classes, no spend threshold, no time trigger; rewrite with five classes and a clock ✅ · D. Replace the table with a RACI chart, which is the standard instrument for cross-functional work
`[A · B1 · Evaluate · MFG · X · CERT]` — A decision-rights table earns D3 by being usable by a stranger in month four, and this one fails on durability (the rows die the month Raj changes role), on boundaries (“Money” carries no threshold and “Anything else” no edge, so the two rows that will actually be tested say nothing) and on timing (no row has a clock); D changes the format and fixes none of the three, which is why a reviewer reads the rows rather than the instrument.

**A33.** Exhibit — escalation path as submitted in a charter:
```
"If the project is blocked, the Black Belt escalates to the sponsor."
"If a team member is unavailable, the Black Belt will work with the functional head."
"Scope changes are agreed by the steering group as needed."
```
Your review comment:
A. Adequate for a first charter; an escalation path is refined as the project meets real obstacles · B. None of the three can fire: a trigger needs a condition, a clock and a destination, and these carry destinations only ✅ · C. The first is adequate and the other two are not, because a sponsor is available on request and needs no clock · D. The defect is the destination rather than the clock: escalation should go to the steering group in every case
`[A · B1 · Analyze · HC · X · CERT]` — Without a condition and a clock, escalation becomes a judgment call made by the person with the least authority at the moment they can least afford to make it; the rewrite reads “a decision in the table pending more than 5 working days → sponsor” and “a team member withdrawn for more than two weeks → functional head and sponsor, within 2 working days”; C is the closest wrong answer because it treats availability as the point, when the point is that the clock is agreed before anyone is under pressure.

**A34.** The decision-rights table is drafted and the sponsor offers to sign it today. The four functional heads have not seen it. The reason you take it to them first is:
A. The rows are promises those four functions are making, and a promise the promiser has not read is not one ✅ · B. The sponsor’s signature is invalid unless all four functional heads have countersigned each row · C. Heads consulted afterwards usually ask for the table to be redrafted, which costs the project a week it has not got · D. The charter template requires the four functional signatures to be collected before the sponsor’s
`[A · B1 · Understand · NEU · K · CERT]` — Authority to sign is not authority to commit somebody else’s team, so each row is negotiated with the person who will have to honour it before the sponsor signs anything, and a table the heads first see in week 9 is relitigated in week 9 by people acting reasonably; C names a real cost and treats the negotiation as a scheduling problem rather than as the thing that makes the table hold.

**A35.** Exhibit — problem statement as submitted:
```
"Because the night shift does not follow the setup sheet, first-piece rejects on the stamping
 press have risen. This costs the plant money and frustrates the day shift. The project will
 retrain the night shift."
```
Your review comment:
A. Adequate: it names the process, the defect and the countermeasure, which are the three things rubric item D1 asks a statement to carry · B. The only defect is the retraining sentence; remove that and the rest of the statement is sound · C. Add the dollar figure the plant loses each week and the statement is then complete as it stands · D. Four defects: an unverified cause, pinned on a group of people, no number with a time basis, and a countermeasure named before Measure ✅
`[A · B1 · Analyze · MFG · X · CERT]` — D1 scores a statement that is cause-free, blame-free and quantified in the business’s own metric, and this one fails all three plus the time basis, naming the countermeasure before Measure; rewritten it reads: first-piece rejects on the stamping press averaged 6.2% of setups over the last 13 weeks against a plant standard of 2.0%; B removes the most visible fault and leaves the cause and the blame in the first clause, where they will steer the whole Measure phase.

**A36.** In week 6 the sponsor asks to add a second service line "since the team is already looking at this." The charter's decision-rights table places scope changes with the steering group, sponsor and Black Belt consulted. You:
A. Agree; the sponsor is the sponsor, the request is reasonable and the team is in the area already · B. Decline; the charter is signed and scope stays fixed until the project closes at Control · C. Cost the request — weeks, hours, what is dropped — and take it to the steering group with a recommendation ✅ · D. Agree provisionally and add the second service line in Improve, once the countermeasures are known
`[A · B1 · Evaluate · HC · S · CERT]` — The table already names who decides, so the Black Belt’s job is to make the trade-off visible and recommend rather than to hold or to concede; D is the most damaging option because a scope change smuggled into Improve arrives after the baseline, the MSA and the verified causes were all scoped to one service line.

**A37.** Exhibit — charter summary as submitted:
```
Title              Reduce re-keying in the payments team
Functions          Payments operations (one team, nine people)
Problem            "Payments are re-keyed from e-mail into the ledger, which takes time"
Baseline           Not measured; "about 40 minutes per payment run"
Impact             $52,000 annualized (the team's estimate, not with Finance)
Sponsor            Payments operations manager
Linked objective   (blank)
```
Your handling:
A. Sign it; the impact figure will rise once the baseline has been measured properly in Measure · B. Sign it and enter the linked objective as “operational efficiency”, which covers this work · C. Return it and ask the payments manager to find a second function to include, which would make it cross-functional · D. Return it: one function, no measured baseline, no linked objective, impact below threshold — route it ✅
`[A · B1 · Analyze · TXN · X · CERT]` — Four of the charter’s entry conditions fail at once and the correct response routes the work to a Green Belt with a named coach and records on the portfolio why, so the payments manager gets an answer rather than silence; C is the failure mode to name, because a function added to satisfy a criterion produces a team whose second half has no stake in the problem.

**A38.** In week 7 a charter trigger fires for the first time and you escalate a blocked data request to the sponsor. A peer asks whether this reflects badly on the project. The accurate answer:
A. No: the trigger is the charter working — a condition, a clock and a destination agreed before anyone was under pressure ✅ · B. Yes: a well-run project anticipates its blockers and should not need to escalate them at all · C. It depends on whether the sponsor resolves the block inside the time the trigger names · D. Yes, if it is the first one: a first escalation as late as week 7 means the triggers were set much too loose to fire
`[A · B1 · Understand · NEU · K · CERT]` — Escalation is designed in so that a routine obstacle does not become a personal negotiation, and firing a trigger moves the decision to the person who owns it instead of leaving the Black Belt to negotiate it personally; a project with no escalations is usually one where the Black Belt absorbed the blockers; C is half right — the sponsor’s response time matters — and it answers a different question from the one the peer asked.

**A39.** Five managers have verbally agreed to release one person each for two hours a week for twelve weeks. Kickoff is in four days. Before it, you:
A. Send a calendar invitation for the twelve sessions; on a cross-functional team the calendar is the contract · B. Put the two hours a week for twelve weeks in writing for each head to sign, then deliver each invitation yourself ✅ · C. Ask the sponsor to send a note telling the five managers that their people are now assigned · D. Start without written contracts; asking for signatures before any result exists spends goodwill you will need later
`[A · B1 · Apply · HC · S · CERT]` — The time contract and the invitation do two different jobs — one binds the manager, the other recruits the person to a purpose they can see on the scorecard, which is why you carry the linkage statement to it — and skipping either is what produces a team of three by week 4; C gets the time committed by the one route that guarantees five managers experience the project as something done to them.

**A40.** Working agreements are written in the team's first meeting rather than after the first disagreement because:
A. Rubric item L1 requires them dated in the first week of the project, and a later date scores zero on that item · B. Most disagreements on a cross-functional team are about data, and “go and measure” saves time · C. The same words read as a verdict after a conflict and as a shared rule before one, and the decision log starts empty ✅ · D. Teams that write their agreements later tend to write longer ones, which are harder to follow
`[A · B1 · Understand · NEU · K · CERT]` — Timing changes what the same sentence means to the people bound by it, which is the whole reason the agreements come first — and the dated decision log that L1 asks for only exists if it was started before there was anything to log; B is true and is one clause of the agreement rather than the reason for its timing.

**A41.** Exhibit — stakeholder strategy canvas, dated extracts from a field-service project:
| Stakeholder | Week 1 (dated) | Week 5 (dated revision) |
|---|---|---|
| Field-service lead | Supportive · low influence | Neutral · high influence |
| IT service owner | Neutral · medium influence | Supportive · medium influence |
| Regional director | Supportive · high influence | Supportive · high influence |
| Union representative | (not listed) | Sceptical · high influence |

What the reviewer credits, and what the reviewer asks next:
A. Credits the dated revision as L1 evidence, and asks what changed the lead’s rating and what was done about the union ✅ · B. Credits nothing until the canvas is stable, since two versions inside five weeks suggest that the first one was guessed · C. Credits only the union-representative row, a new stakeholder being the one material change here · D. Asks for the two versions to be consolidated into one current view, since both of them cannot be true
`[A · B1 · Analyze · TXN · X · CERT]` — L1 scores the canvas at start plus at least one dated revision, and the revision is evidence of looking again rather than of having been wrong — so the reviewer asks what moved the field-service lead from low to high influence, and what the project did about a high-influence stakeholder who was not on the first canvas at all; D destroys the only thing the pair of canvases proves, which is that the candidate’s picture of the stakeholders changed and when.

**A42.** Two weeks after kickoff, attendance has fallen from six to three. Every time contract is signed, no member has withdrawn, and the two meetings so far have assigned data tasks and reviewed progress against them. Your first move:
A. Escalate the fallen attendance to the five functional heads under the charter’s withdrawal trigger · B. Shorten the meetings to thirty minutes, so that attending costs each member half as much · C. Ask the sponsor to attend the next two meetings and say plainly that attendance matters · D. Put the handoff data the members collected on a chart, show it, and name what each function gets ✅
`[A · B1 · Apply · NEU · S · CERT]` — Nobody has withdrawn, so no trigger applies, and two meetings of task assignment with nothing shown back is the design flaw the “give something back in week 2” rule addresses — one thing each member’s own function gets from it in the next two weeks; C borrows authority to fill a room and teaches the team that attendance is about who is watching.

---

## Section B — Measurement systems, advanced (35 CERT)

**B1.** Four questions decide which measurement study a metric needs. One of them, answered no, leaves a whole family of designs with no data to compute from — rather than merely uninformative — so it is asked first. It is:
A. Who or what produces the value — a person with an instrument, or a system? · B. Is the result a number, or a category that a person assigns to it? · C. Can the same item be measured a second time, or does the test consume it? ✅ · D. How many sites, instruments and days does the metric span?
`[B · B2 · Understand · NEU · K · CERT]` — If the item cannot be measured twice, no crossed design has the data it needs, and the choice narrows at once to a nested design on homogeneous batches, a repeatability-only study on a reference, or an attribute study of the decision the test drives; A is the closest wrong answer and is asked third — a system-written field can be pulled twice, so a crossed study on it computes perfectly well and simply answers nothing, which is a different failure from having no data at all.

**B2.** A project carries four metrics: weld pull strength (the bracket breaks on test), a five-level ordinal severity grade assigned by an inspector, a "line stopped" timestamp written by the PLC, and fill weight measured at three plants on three checkweighers. The four studies are, in that order:
A. Nested Gage R&R · attribute agreement with kappa by category and Kendall's coefficients · provenance walk plus paired audit · expanded Gage R&R ✅ · B. Crossed Gage R&R · attribute agreement with overall kappa only · crossed Gage R&R with the PLC as the operator · crossed Gage R&R at the largest plant · C. Repeatability-only study on a reference coupon · attribute agreement with overall kappa only · paired audit · nested Gage R&R with plant as the batch · D. Nested Gage R&R · attribute agreement with overall kappa only · provenance walk alone · crossed Gage R&R with plant as a second operator
`[B · B2 · Apply · MFG · S · CERT]` — Each metric fails a different one of the four questions, and the designs follow: destructive, ordinal, system-written, multi-site; D is the closest wrong answer because it gets the first metric right and then drops Kendall's on an ordinal judgment, stops at the provenance walk without the audit that gives bias and spread, and treats a plant as an operator, which confounds site, instrument and person.

**B3.** A candidate's MSA plan lists the workflow system's "case closed" timestamp and proposes a crossed Gage R&R: three analysts, each pulling the field twice for ten cases. Your review comment:
A. Sound; the analysts are the operators and the repeat pulls give you the repeatability term · B. Change it to a nested design, since a database extract cannot honestly be repeated twice · C. Keep the crossed study but add a fourth analyst, which raises the degrees of freedom on the reproducibility estimate usefully · D. It shows three people read one field alike, not that the field matches the event — run a provenance walk and paired audit ✅
`[B · B2 · Analyze · TXN · S · CERT]` — The operators of a system field are the code that writes it and the people who trigger it, so the study has to compare the field with the event rather than analysts with each other, and it states the bias and spread against the charter’s δ; B is the right instinct — this is not a crossed situation — applied to the wrong reason, since a database extract repeats perfectly.

**B4.** Acceptance criteria — the %GRR bands, ndc, kappa and Kendall's thresholds — are written into the MSA plan before any data are collected because:
A. The software will not compute variance components until the acceptance thresholds are entered · B. A threshold chosen once the output is on screen is chosen to fit the result, and the plan is what the reviewer scores ✅ · C. The criteria vary with the measurement technology, so they have to be fixed to the particular equipment in use on the day · D. A study whose criteria were set afterwards cannot legitimately be re-run on the same items
`[B · B2 · Understand · NEU · K · CERT]` — Pre-stated criteria are what makes a marginal result a marginal result rather than an acceptable one, and the plan is the auditable record; D inverts the rule, since a failed or marginal study that is fixed and re-run with both results side by side outscores one that passed and cannot be explained.

**B5.** Exhibit — adhesive bond shear strength, study as submitted:
```
Gage R&R Study — Crossed    Response: shear_strength_N
Operators = 3   Parts = 10   Trials = 2   N = 60
Source                VarComp   %Contribution   %Study Var
Total Gage R&R         0.0081          2.9          17.1
  Repeatability        0.0072          2.6          16.1
  Reproducibility      0.0009          0.3           5.7
Part-to-Part           0.2700         97.1          98.5
Total Variation        0.2781        100.0         100.0
Number of distinct categories = 8
Technician's method note: "the bond is destroyed by the test, so trial 2 used the next
  coupon off the same press cycle"
```
The correct reading:
A. Accept it: 17.1% is marginal and defensible with a written reason, and ndc = 8 clears the threshold comfortably · B. Re-run the crossed study with three trials rather than two, which estimates repeatability more precisely · C. The study could not have happened: trial 2 was a different coupon, so “repeatability” is coupon-to-coupon. Re-run nested ✅ · D. Accept the part-to-part figure and discard the gage figures, since only part-to-part is estimable on this test
`[B · B2 · Analyze · MFG · X · CERT]` — A crossed design requires the same part measured twice and the method note says that never happened, so every gage statistic here answers a question nobody asked and the eight distinct categories are not real; the re-run nests batches of consecutive coupons inside each operator, read knowing that within-batch coupon-to-coupon difference cannot be separated from the test’s repeatability; A is what the software invites, and the low %GRR is the direction the error pushes, which is why a study that looks good needs its method note read first.

**B6.** Exhibit — weld pull strength, nested study, LSL 3.0 kN:
```
Gage R&R Study — Nested ANOVA    Response: pull_strength_kN
Operators = 3   Batches per operator = 5 (consecutive brackets, one weld cycle)
Items per batch = 3   N = 45   randomized test order
Source                DF        SS        MS        F        P
Operator               2     5.840    2.9200    5.615    0.019
Batch(Operator)       12     6.240    0.5200   13.000    0.000
Repeatability         30     1.200    0.0400
Total                 44    13.280

Variance components       VarComp   %Contribution    StdDev   %Study Var
Total Gage R&R            0.2000         55.6         0.447        74.5
  Repeatability           0.0400         11.1         0.200        33.3
  Reproducibility         0.1600         44.4         0.400        66.7
Part-to-Part (Batch)      0.1600         44.4         0.400        66.7
Total Variation           0.3600        100.0         0.600       100.0
Number of distinct categories = 1
```
The correct reading:
A. The batches were not homogeneous, which has inflated repeatability; re-run with all three items from one weld cycle · B. Operator differences dominate: reproducibility is 44% of total variance, F = 5.62 against batch(operator), ndc = 1 ✅ · C. %GRR is 55.6%, which is unacceptable, so the metric becomes an attribute pass/fail test at the 3.0 kN limit · D. The study is acceptable: the batch term is highly significant at P = 0.000, which is what a sound nested study looks like
`[B · B2 · Analyze · MFG · X · CERT]` — Reproducibility is four times repeatability, which points at how the three operators set up the test rather than at the test itself, and the operator term tested correctly against batch(operator) gives F = 5.62 with P = 0.019; at %GRR 74.5% and ndc = 1 the test cannot distinguish any band of strength, so the operator-to-operator difference in fixturing or pull rate is found and removed before any baseline is stated; C quotes %Contribution (55.6%) as though it were %Study Var (74.5%) — both fail, but the two figures are not interchangeable and the reviewer will notice which one was read.

**B7.** Every reading of a nested Gage R&R states one limit that is true of the design whatever the sampling. It is:
A. The repeatability term holds both the test’s own repeatability and real within-batch differences, inseparably ✅ · B. The operator × part interaction cannot be estimated, so the operator effects are understated · C. Reproducibility cannot be estimated at all, because no two operators ever measure the same item · D. Part-to-part variation is always understated, the batches being a narrower slice of production than the process runs
`[B · B2 · Understand · NEU · K · CERT]` — The batch is a stand-in for one part, so the residual term is repeatability plus within-batch product variation by construction; B is true that no interaction term exists and wrong that this understates operators, since operator is still estimated against batch(operator), and D is a sampling risk you can design away rather than a property of the design.

**B8.** A wound-care project's metric is wound area in cm², measured by planimetry on a standardized photograph. Each wound is unique, so the team proposes a nested Gage R&R with wound type as the batch. You reject the nested design because:
A. Nested designs need five batches per operator, and four wound types cannot be subdivided that finely · B. Wound area varies with the angle of the photograph, so no measurement study applies to it at all · C. Nested designs are valid only where the specification is one-sided, and wound area has no specification · D. The item measured is the photograph, and a photograph can be measured any number of times by anyone ✅
`[B · B2 · Evaluate · HC · S · CERT]` — Question one is about the item the measurement system actually acts on, and here that is the image rather than the patient, so nothing is destroyed, nothing needs nesting, and the crossed study adds the operator × part interaction as well; B names a genuine source of variation, which is an argument for standardizing the photograph and including it as a factor, not for abandoning the study.

**B9.** Exhibit — sterile-barrier pouch peel strength, nested study, mean squares only:
```
Nested Gage R&R    Response: peel_strength_N
Operators = 3   Batches per operator = 5   Items per batch = 3   N = 45
Source              DF        MS
Operator             2     1.8600
Batch(Operator)     12     0.6200
Repeatability       30     0.0500
```
The F statistic that tests whether the three operators differ, with its degrees of freedom:
A. 37.20 on 2 and 30 degrees of freedom · B. 3.00 on 2 and 12 degrees of freedom ✅ · C. 12.40 on 12 and 30 degrees of freedom · D. 0.33 on 12 and 2 degrees of freedom
`[B · B2 · Apply · HC · X · CERT]` — In a nested layout the expected mean square for batch(operator) is the correct denominator for operator, giving 1.86 ÷ 0.62 = 3.00 on 2 and 12 (P = 0.088, so the operators are not distinguishable from batch noise); A divides by repeatability, which is the standard error of the wrong comparison and would declare an operator difference at almost any data set, and C is the batch test rather than the operator test.

**B10.** A project's metric is the burst pressure of a one-off welded pressure vessel. Each vessel is unique, the test destroys the weld, and no two vessels can honestly be treated as the same part. Your MSA plan says:
A. Use a nested design with vessel type as the batch; type is close enough for the components to mean something · B. Skip the MSA — a destructive test on a unique item cannot be studied — and note the omission in the plan · C. No homogeneous batch exists: run repeatability on a reference coupon plus an attribute study on the accept/reject call ✅ · D. Run the crossed study on reference coupons and report the resulting %GRR as the metric’s own %GRR
`[B · B2 · Apply · MFG · S · CERT]` — When the batch assumption genuinely fails, the honest plan measures what it can and writes down that the test’s true repeatability on the product itself is unknowable, while the decision the test drives is still measurable; D is the plausible wrong answer because the coupon study is worth running — it just describes the instrument on a reference material and not the system on the product, and reporting it as the metric’s %GRR claims otherwise.

**B11.** Exhibit — the same tear-strength test, same three operators, two nested studies:
```
                            Study 1                      Study 2
Batches drawn from          one extruder run, consecutive  three runs across the grade range
Repeatability VarComp       0.0144                       0.0144
Reproducibility VarComp     0.0025                       0.0025
Batch VarComp               0.0600                       0.1600
%GRR (of study variation)   46.9 %                       30.9 %
ndc                         2                            4
Repeatability SD            0.12 N                       0.12 N
Charter δ                   a 0.5 N increase in mean tear strength
```
The correct reading:
A. Neither ratio describes the test: R and R are identical and only the denominator moved — judge it on 0.12 N against δ ✅ · B. Study 2 shows the test improved between the studies, once the three operators had more practice with the fixture · C. Study 1 is the honest study, because narrow batches are the correct design for a destructive test · D. Average the two figures and report 38.9% as the test’s capability across the whole grade range
`[B · B2 · Analyze · MFG · X · CERT]` — %GRR is a ratio to whatever variation you chose to put into the study, so it moves when the sampling moves even though the instrument did not, which is why the batch sourcing statement travels beside the number and the test is judged by its repeatability SD of 0.12 N against the charter’s 0.5 N δ; C is half right — narrow batches are the correct design — and draws the wrong conclusion, since narrow batches make the ratio look worse while telling you nothing new about the test.

**B12.** A nested study on pouch burst pressure returns %GRR of 34%, just outside the acceptable band. One batch contains an item that the production log shows came from a different sealer cycle. The MSA plan defined the batch but set down no rule for an item that breaches it, and the breach came to light only after %GRR was computed. Removing that item drops %GRR to 27%, inside the marginal band. The candidate asks what to do:
A. Remove it and note the removal in the plan; a mis-sampled item is a known sampling error rather than data · B. Remove it, re-run, and report only the corrected study, since reporting a study you know to be wrong misleads the reviewer · C. Keep it and report 34% only; a re-run after a failed study is a second attempt at the same question · D. Keep it, report 34%, and report beside it a fresh study run under a written sampling rule — both results, both dated ✅
`[B · B2 · Evaluate · MFG · S · CERT]` — The data-ethics rule is not “never exclude” but “never exclude the point that changes the conclusion, and never without the rule written first”, and a re-run with both results shown is what earns M1; A is the most reasonable-sounding wrong answer, and with no rule in the plan it takes the acceptance decision and the exclusion decision in the wrong order — removing the single point that moves an answer across an acceptance line is exactly the exclusion the reviewer of record looks for.

**B13.** Exhibit — pressure-injury staging study; the project stratifies its outcome metric by stage:
```
Attribute Agreement Analysis   Response: pressure_injury_stage (1–4, ordinal)
Appraisers = 3 wound nurses   Trials = 2   Items = 40 photographs
Standard: three-clinician panel, agreed by discussion before the study

Each appraiser vs standard   Inspected  Matched  Percent   Fleiss' kappa   Kendall's corr
  Nurse A                        40       32      80.0        0.73            0.92
  Nurse B                        40       34      85.0        0.80            0.94
  Nurse C                        40       29      72.5        0.64            0.90
Between appraisers              40       25      62.5        0.67     Kendall's W = 0.93
All appraisers vs standard      40       24      60.0        0.72

Kappa by category (all vs standard):  Stage 1  0.88   Stage 2  0.49   Stage 3  0.52   Stage 4  0.86
Disagreements: 29 of 34 are one stage apart; 24 of those 29 are stage 2 against stage 3
```
The correct reading:
A. Nurse C is the outlier at 72.5% and kappa 0.64; retrain her and re-run on the same photographs · B. Kappa is below 0.75 for two appraisers and between appraisers, so the judgment fails and a different measure is needed · C. Ordering holds — W 0.93, all ≥ 0.90 — while kappa sags at stages 2 and 3, so rewrite those two criteria and re-run ✅ · D. Collapse to “stage 1 against stage 2 or above”, which lifts kappa above 0.85 and settles the question
`[B · B2 · Analyze · HC · X · CERT]` — High Kendall’s with moderate kappa is the signature of appraisers who rank consistently and disagree about where one boundary sits — 24 of the 29 one-stage disagreements are stage 2 against stage 3 — so the fix goes to the definition, rewritten with the three nurses and re-run on the same 40 photographs; D is the move to hold in reserve rather than use here, because the project stratifies by stage and collapsing discards the stratification the metric exists to support.

**B14.** Kappa is supplemented by Kendall's coefficients on an ordinal judgment because:
A. Kappa cannot be computed at all once there are more than two categories to agree about · B. Kappa counts every disagreement equally, while Kendall’s credits agreement on the order ✅ · C. Kendall’s coefficients correct kappa for the number of appraisers taking part in the study · D. Kappa requires an agreed standard to compare against and Kendall’s coefficients do not
`[B · B2 · Understand · NEU · K · CERT]` — Order is information kappa throws away — an appraiser one level out scores like one four levels out — and throwing it away is what makes a one-step boundary drift look like a broken measurement system, while Kendall’s separates near-misses from far ones; A is simply false: kappa handles any number of categories and reports per-category values too.

**B15.** Exhibit — attribute study, one analyst against the panel standard, 50 complaint files:
```
                             Standard: escalate   Standard: do not escalate   Total
Analyst: escalate                    33                     4                  37
Analyst: do not escalate              2                    11                  13
Total                                35                    15                  50
```
Cohen's kappa for this analyst is:
A. 0.88 · B. 0.76 · C. 0.70 ✅ · D. 0.28
`[B · B2 · Apply · TXN · X · CERT]` — Observed agreement is 44 ÷ 50 = 0.88 and expected agreement is (37×35 + 13×15) ÷ 2,500 = 0.596, so kappa = 0.284 ÷ 0.404 = 0.70, below the 0.75 the plan required; A is raw percent agreement read as kappa, and B is what you get by assuming an even 0.50 chance agreement instead of computing it from the margins — which is the error that makes an unbalanced judgment look acceptable.

**B16.** An attribute agreement study on triage acuity is offered the charge nurse of 22 years' experience as the standard. The project needs to know whether acuity is assigned correctly, not only consistently. You:
A. Accept her; the most experienced appraiser available is the best reference the project can get · B. Accept her, but report the result as “agreement with the reference appraiser” rather than with the standard · C. Drop the versus-standard analysis and report only within-appraiser and between-appraiser agreement · D. Convene a panel of three who agree each answer by discussion first, or use outcome data where it exists ✅
`[B · B2 · Evaluate · HC · S · CERT]` — A standard has to be independent of the appraisers being measured, or “correct” collapses into “like her”, and a single appraiser as the standard would credit the department for reproducing whatever that habit is; C is honest about what it does and does not measure and leaves the project’s actual question — is acuity assigned correctly — unanswered.

**B17.** Exhibit — defect coding on assembled boards; the countermeasures differ by code (insufficient solder points at stencil aperture, cold joint at reflow profile):
```
Attribute Agreement Analysis   Response: defect_code (6 nominal categories)
Appraisers = 4 inspectors   Trials = 2   Items = 60 boards   Standard: engineering panel
All appraisers vs standard   Inspected 60   Matched 41   Percent 68.3   Fleiss' kappa 0.61

Kappa by category (all vs standard)
  Solder bridge        0.89        Insufficient solder   0.42
  Tombstone            0.91        Cold joint            0.46
  Component missing    0.93        Lifted pad            0.87
Confusion pattern: 37 of 76 disagreements are "insufficient solder" coded as "cold joint" or
  the reverse; the other 39 are spread thinly across all remaining pairs
```
The correct reading:
A. Overall kappa 0.61 is below the 0.75 threshold, so all six definitions need rewriting and all four inspectors need retraining · B. Four codes run 0.87 to 0.93 and two do not, and 37 of the 76 disagreements are that one pair: rewrite those two ✅ · C. Collapse the two weak codes into a single “solder-volume defect” category, which removes the disagreement · D. Drop the two weak codes from the project’s stratification and analyse only the four that already work
`[B · B2 · Analyze · MFG · X · CERT]` — Per-category kappa exists to locate the disagreement, and a healthy four with a weak pair that confuse only each other is a definition problem at one boundary — rewritten with photographed boundary cases, re-run on the same 60 boards, the other four left alone; C removes the measurement problem by removing the distinction, which the stem closes off, since the two codes lead to different countermeasures and a merged category cannot be acted on.

**B18.** You are designing an attribute agreement study for a five-level complaint-severity judgment that routes cases. The design you specify:
A. Forty cases with every level five times over and borderlines over-represented, three assessors, two blind trials a day apart ✅ · B. Thirty cases drawn at random from the last month, three assessors, one pass each, the standard set by the team leader on his own · C. One hundred consecutive cases, two assessors, two trials on the same afternoon, standard set by the busiest assessor · D. Forty cases, five assessors, one trial each, no standard at all, reporting between-assessor agreement only
`[B · B2 · Apply · TXN · S · CERT]` — Borderline cases are where measurement systems fail, every category needs enough items for its own kappa to mean anything, and two separated trials are what make within-appraiser agreement estimable; the standard is a three-person panel, and the report carries kappa overall and per category, Kendall’s W, each assessor’s Kendall’s correlation, and the collapsed “route to a specialist or not” decision; C is the most seductive because 100 cases feels rigorous, and consecutive sampling under-represents the boundaries while two trials the same afternoon measure memory rather than repeatability.

**B19.** A "severity score" from 1 to 10 is produced by rounding a continuous risk index the system already calculates. The right measurement study is:
A. An attribute agreement study on the 1–10 score with Kendall’s coefficients, the score being ordinal · B. An attribute agreement study on the collapsed high/low routing decision the score drives · C. A variable study on the underlying continuous index; studying the score measures the rounding rule ✅ · D. No study at all, since a field the system calculates carries no measurement error of its own
`[B · B2 · Understand · NEU · K · CERT]` — Where a number exists behind the category, the number is the measurement and the category is a decision rule applied to it, so the 1–10 score is a coarsened measurement; D is wrong for a separate reason worth knowing — a calculated field inherits the uncertainty of every input it is calculated from.

**B20.** An attribute study of 45 complaint files returns kappa by category of 0.86, 0.81, 0.79, 0.84 and 0.31. The fifth category appears in three of the 45 files. You report:
A. The overall kappa only, since a per-category figure that rests on only three items is misleading to report at all · B. That the fifth category rests on three items and is not actionable — then add files or collapse it, and say which ✅ · C. That the fifth category fails, so the outcome metric cannot be stratified by that category at all · D. All five figures without comment; the item counts are in the table for a reader to see for themselves
`[B · B2 · Analyze · TXN · S · CERT]` — A category with three items produces a kappa that is noise, and the honest report says so and names the remedy — five per category is the design minimum, so either add files or collapse with the nearest neighbour, reporting the other four as they stand — rather than letting the number stand or disappear; C treats a missing estimate as a failed one, which will cost the project a stratification it may well be entitled to.

**B21.** Exhibit — paired audit of a service-desk "case resolved" timestamp:
```
Difference = recorded − observed (minutes)   N = 50 cases, all three shifts, two weeks
Mean          6.8      StDev   14.5      Min  −22      Max   61
95% CI for the mean bias   (2.7, 10.9)
Process SD of the metric last quarter: 62 min    Charter δ: a 20-min reduction in the median
Recorded minutes falling on :00, :15, :30 or :45: 44 of 50 (88%; about 7% expected if unrounded)
Differences below −10 min: 4 of 50, all on cases that were reopened and re-closed
```
The correct reading:
A. The 6.8-min bias is small against a 20-min δ and the interval excludes zero, so subtract it and proceed · B. The study passes: 14.5 ÷ 62 is inside the 10–30% marginal band, and a written reason is all that is asked · C. Discard the four negative differences as data-entry errors and recompute the bias on the remaining 46 cases · D. Spread is 23% of process SD, 88% of stamps land on a quarter-hour, and re-closes overwrite first closes ✅
`[B · B2 · Analyze · TXN · X · CERT]` — A bias you can subtract is only harmless when it is stable, and the quarter-hour clustering says agents close cases in batches, so the stamp records the batch rather than the resolution — first-close times come from the audit log, the operational definition is restated, and the field is re-audited before any baseline; B is the reading that stops one step early: the ratio is inside the marginal band and the two signatures say the number is measuring something other than the event, which no written reason repairs.

**B22.** The system owner tells you the "time of first antibiotic dose" field is "straight from the eMAR, so it is clean." Before the field carries a baseline you:
A. Sit with the nurse who scans the dose and the system owner: what sets the field, who may edit it, whether it was backfilled ✅ · B. Accept it; an eMAR timestamp is machine-written and has no human hand anywhere in the chain · C. Run null and range checks over a year of extracts, which is the practical form of a provenance walk · D. Compare the field with a second system’s field for the same patients; agreement between two independent systems validates both
`[B · B2 · Apply · HC · S · CERT]` — The provenance walk asks five questions no extract can answer — what event is supposed to set the field, what actually sets it, who can edit it afterwards, what it holds when no dose was given, and whether it has been migrated or backfilled — and it is done with the person who triggers the event, which is what lets you then design the paired audit against the observed administration; D is the most common shortcut and the most misleading, because two fields fed by the same scan agree perfectly and are wrong together.

**B23.** The baseline window is last year's 14,000 records, the project needs the full year for its seasonality argument, and the events those records describe can no longer be observed. You:
A. Observe the event now for 60 records and apply this year’s measured bias back to last year’s data · B. State the field as unvalidated by audit, run every internal consistency check the data allow, complete the provenance walk ✅ · C. Drop the historical baseline and start fresh from today’s audited data, accepting the loss of a year · D. Use the historical data without comment; 14,000 records is a large sample, and sample size compensates for measurement error
`[B · B2 · Evaluate · TXN · S · CERT]` — Where the event cannot be observed, the provenance walk and the internal consistency checks — negative durations, impossible sequences, duplicate stamps, default values such as 01/01/1900, records edited after first write — are the whole of the validation, and only then do you decide whether the baseline can be stated at all; A assumes the bias has been constant across a year and any system change in it, which is the assumption the audit was supposed to test.

**B24.** Exhibit — audit-log extract for a "resolution time" field, 300 sampled cases:
```
Cases where the field was written once                       218
Cases where the field was edited after first write            82
  edited by the case owner                                    61
  edited by a team leader                                     18
  edited by a scheduled system job                              3
Mean resolution time, cases never edited                     5.4 h
Mean resolution time, cases edited by the case owner         3.1 h
Team target published on the wallboard                       4 h
```
The correct reading:
A. Use the 218 unedited cases as the baseline, which removes the problem at no cost to sample size · B. Report the mean of all 300 cases and note the edit pattern in the data-provenance section of the Measure tollgate pack · C. The people measured edit the field, and their values land on the friendly side of the target: use the first write ✅ · D. Remove the 18 team-leader edits as the unauthorized ones and keep the 61 made by the case owners
`[B · B2 · Analyze · TXN · X · CERT]` — A field edited by the people it measures records the edit, not the event, and the split of means either side of the wallboard number is the signature — nobody here is breaking a rule, because the wallboard target and the edit right were designed together, but the baseline waits for first-write times from the audit log; A is the most tempting because the 218 look clean, and they are a self-selected subset — the cases nobody needed to adjust — so a baseline built on them is biased in the same direction by a different route.

**B25.** A service metric, "time to resolution", exists only for resolved cases. Thirty per cent of cases in the baseline window are still open, some for months. The team computes a mean of 5.4 hours from the resolved cases. The process was redesigned six months ago, so earlier windows describe a different process. You:
A. Report the mean as it stands; the resolved cases are the population this metric is actually about in the first place · B. Impute a resolution time for the open cases from the mean of the resolved ones and recompute it · C. Use an older window in which every case has since resolved, so that coverage is complete at last · D. The mean is biased low, the open cases being the hard ones: report coverage at 70% and add an open-case metric ✅
`[B · B2 · Analyze · TXN · S · CERT]` — A system that records only completed events is systematically missing the slowest ones, so coverage is part of the number, and the metric the open cases appear in — age of open cases, or the proportion resolved inside the target — comes before any baseline; C is a real technique, a fully matured window, and the stem closes it off, because that window describes a process the project is no longer studying.

**B26.** Calling a workflow timestamp "a measurement system" is useful mainly because it makes you ask:
A. Who or what the operators are — the code that writes the field, and the people who trigger it ✅ · B. Whether the database holding the field is backed up and its access properly audited and logged · C. Whether the field is stored to the second or only rounded to the nearest minute · D. Whether the system’s vendor has validated the field against its own specification
`[B · B2 · Understand · NEU · K · CERT]` — The frame earns its keep by forcing the two questions every measurement system answers, bias and spread, on a number that usually arrives with neither; C is a real contributor — resolution is a term in an uncertainty budget — and answers only a small part of the spread.

**B27.** Exhibit — paired audit design and result, as submitted:
```
Field                  "line restart" timestamp, written by the PLC event log
Sample                 30 restarts, all from day shift, one week
Observed by            the Black Belt, stopwatch, from the control-room window
Result                 mean difference −0.4 min    SD 1.1 min
Process SD of downtime per stop: 14 min      Charter δ: a 6-min reduction in mean downtime
Note from the maintenance planner: night-shift restarts are logged through the handheld
  terminal, not the control-room panel
```
Your review comment:
A. Accept the field: an SD of 1.1 min is 7.9% of the process SD, and the bias is negligible against the 6-min δ · B. Reject the field: a −0.4 min bias means the log fires before the restart, which is physically impossible · C. Accept it for day shift and extend the audit across all shifts and two weeks, including the handheld route ✅ · D. Raise the sample to 100 day-shift restarts, which will tighten the confidence interval on the bias
`[B · B2 · Apply · MFG · X · CERT]` — Good numbers describe only the conditions sampled — the spread is excellent where it was measured and the design has not yet looked anywhere else — and two code paths write this field while the audit has tested one, which is the route the maintenance planner has just named; D improves the precision of a result whose coverage, not precision, is the problem.

**B28.** Exhibit — expanded Gage R&R across three plants:
```
Expanded Gage R&R   Response: fill_weight_g   N = 240
Factors: Sample (crossed, 10 containers spanning the range) · Site · Checkweigher(Site) ·
  Operator(Site) · Repeatability
3 sites · 2 checkweighers per site · 2 operators per site · 2 trials · randomized within site

Source                    VarComp   %Contribution   StdDev   %Study Var
Total Gage R&R               5.41         13.1        2.326       36.1
  Repeatability              1.00          2.4        1.000       15.5
  Site                       4.00          9.7        2.000       31.1
  Checkweigher(Site)         0.25          0.6        0.500        7.8
  Operator(Site)             0.16          0.4        0.400        6.2
Sample-to-Sample            36.00         86.9        6.000       93.2
Total Variation             41.41        100.0        6.435      100.0

Site means on the 250.0 g certified reference container:  A 251.9   B 248.4   C 250.2
Number of distinct categories = 3
```
The correct reading:
A. The checkweighers are the problem, and two per site is too few to estimate the instrument component reliably · B. %GRR is 36.1% and the site itself carries most of it, instruments and operators agreeing inside each site ✅ · C. Site B reads 1.6 g low on the reference container, so replace site B’s two checkweighers and re-run · D. ndc = 3 means the study needs more samples; repeat it with 20 containers instead of the 10 used
`[B · B2 · Analyze · MFG · X · CERT]` — The point of adding factors is to locate the variation, and here site carries 31.1% of study variation while instrument and operator carry under 8% each, which points at the reference each plant calibrates to: align all three to one certified reference container and re-run before any site is compared with another, because part of the “site effect” on the project’s stratified charts is measurement; C acts on the right observation with the wrong remedy, since the two checkweighers at site B agree with each other and are both anchored to the same local reference.

**B29.** Exhibit — expanded Gage R&R on point-of-care glucose meters at one site, one reagent lot throughout:
```
Expanded Gage R&R   Response: glucose_mg_dL   N = 300
Factors: Sample (10 controls, 60–350 mg/dL) · Day · Operator · Repeatability
5 days · 3 nurses · 2 trials

Source                  VarComp   %Contribution   StdDev   %Study Var
Total Gage R&R            10.24         12.4        3.200       35.2
  Repeatability            1.44          1.7        1.200       13.2
  Day                      8.41         10.2        2.900       31.9
  Operator                 0.39          0.5        0.625        6.9
Sample-to-Sample          72.25         87.6        8.500       93.6
Total Variation           82.49        100.0        9.082      100.0

Day means on the 100 mg/dL control:  D1 97.2   D2 101.6   D3 103.8   D4 99.1   D5 96.0
Number of distinct categories = 3
```
The correct reading:
A. Three nurses is too few to estimate reproducibility on a meter; add nurses and re-run the study · B. %GRR of 35.2% fails, so the meters are unfit and the metric must move to a laboratory assay · C. The study confounds day with reagent lot, so nothing at all can be concluded from these variance components · D. Day carries 10.2% of variance and day means wander 96.0 to 103.8 with no operator pattern: this is drift ✅
`[B · B2 · Analyze · HC · X · CERT]` — A large day component with small repeatability and operator terms is the signature of drift, which is managed with a reference control on a daily I-MR gage-stability chart, bias and linearity checks across the 60–350 mg/dL range, and a calibration interval set from what the chart shows, rather than with more operators; C would be the right objection in most such studies and the exhibit closes it off by stating that one reagent lot ran throughout.

**B30.** A candidate proposes an expanded Gage R&R with site, instrument, day and operator on a metric whose single-site crossed study has not yet been run. The design comes to 480 readings across eight weeks. You:
A. Run the single-site crossed study first: a system that fails at one site fails at four, at an eighth of the cost ✅ · B. Approve the expanded design; it contains the single-site study as a special case within it, so nothing is wasted · C. Approve it but cut the trials from three to two, which nearly halves the data-collection burden · D. Replace it with an uncertainty budget, which answers the same question with no data collection at all
`[B · B2 · Evaluate · TXN · S · CERT]` — Expanded studies are for locating variation in a system already known to be roughly fit, and the expanded output cannot be interpreted until you know what one site looks like — so you expand only if the single-site study passes and the project genuinely compares sites; running the expanded study first spends eight weeks to learn what a two-day study would have said; C reduces trials before samples, which is the right order of cuts, and still approves a study that should not start yet.

**B31.** An expanded study will run at three hospital laboratories. Each has exactly one technologist qualified on the assay and each runs its own analyser, and neither people nor instruments can be moved between sites. You:
A. Report site, instrument and operator components as usual; the software estimates all three from the design · B. Drop the site factor from the model and report the repeatability and operator components only · C. Report one “laboratory” component and state that site, instrument and technologist are confounded inside it ✅ · D. Randomize the run order of samples within each laboratory, which removes the confounding
`[B · B2 · Analyze · HC · S · CERT]` — A factor you cannot rotate over is confounded by the structure of the design, and the plan’s job is to name the confound rather than let the software print three numbers that are one — then decide with the sponsor whether swapping one analyser between two sites for a week is worth what that would buy; D is the most common misunderstanding, since randomizing run order protects against drift within a site and cannot break a structural confound.

**B32.** On a tightly controlled process a gauge returns %study variation of 42% and %tolerance of 14%. Both figures are computed correctly from the same study. What you tell the sponsor:
A. They answer different questions: fine against the customer’s tolerance, not fine against this process’s spread ✅ · B. The study is internally inconsistent, so it has to be re-run before either figure is used · C. Use the lower figure: 14% sits inside the marginal band, so the gauge passes on tolerance · D. Use the higher figure, because %study variation is the AIAG headline number in every case and in every application
`[B · B2 · Understand · NEU · K · CERT]` — The two ratios share a numerator and differ in denominator — process spread against tolerance width — so a capable process makes a gauge look worse on one and better on the other, and here the pair implies a Cp of about 3: the gauge can sort conforming from non-conforming parts and cannot show the process moving, so which figure matters depends on what the metric is for; C and D both pick a number before asking that question, which is the decision the two figures exist to inform.

**B33.** Exhibit — Gage R&R summary for a compounded dose concentration:
```
SD Total Gage R&R        0.0100 mg/mL
SD Part-to-Part          0.0540 mg/mL
SD Total Variation       0.0549 mg/mL
Specification            5.00 ± 0.10 mg/mL   (from the pharmacopoeial monograph)
House convention         6σ (AIAG); %tolerance = 6 × SD_GRR ÷ (USL − LSL)
```
%tolerance for this system is:
A. 18.2%, which is the %study variation figure expressed on a different scale · B. 5.0%, which is the SD of total gage R&R divided by the full tolerance width · C. 15.0%, which is three standard deviations of gage R&R over the full tolerance width · D. 30.0% — marginal on tolerance, while %study variation is 18.2%; both are reported ✅
`[B · B2 · Apply · HC · X · CERT]` — 6 × 0.0100 ÷ 0.200 = 30.0%, and the gap from 18.2% is the process’s own incapability — a part-to-part SD of 0.0540 against a ±0.10 tolerance — rather than an error in either figure, which is why both are reported: they answer different questions; C halves the convention by using 3σ, which is the slip that turns an unacceptable tolerance ratio into an acceptable-looking one.

**B34.** Exhibit — uncertainty budget for a single torque reading, target 12.0 N·m:
```
Contributor                                Type   Value              Standard uncertainty u
Repeatability, SD of 15 readings             A    0.24 N·m                  0.24
Calibration certificate, ±0.30 N·m at k = 2  B    0.30 N·m                  0.15
Resolution 0.1 N·m (rectangular)             B    0.1 ÷ (2√3)               0.029
Temperature effect, ±0.10 N·m (rectangular)  B    0.10 ÷ √3                 0.058
```
The expanded uncertainty U at k = 2 is:
A. 0.29 N·m · B. 0.58 N·m ✅ · C. 0.48 N·m · D. 0.95 N·m
`[B · B2 · Apply · MFG · X · CERT]` — u_c = √(0.24² + 0.15² + 0.029² + 0.058²) = 0.290 N·m and U = 2 × 0.290 = 0.58 N·m; A is u_c with the coverage factor forgotten, and C adds the contributors arithmetically instead of in quadrature, which overstates u_c by about 64% and then omits k as well.

**B35.** Exhibit — single-reading uncertainty statement for delivered volume on an infusion-pump test:
```
Combined standard uncertainty u_c   0.35 mL
Coverage factor                     k = 2 (about 95%)
Specification for the test          50.0 mL ± 1.0 mL
```
On one reading, a result can be declared conforming only if it falls:
A. Between 49.70 and 50.30 mL; readings in the two outer strips cannot be declared either way ✅ · B. Between 49.35 and 50.65 mL, using the combined standard uncertainty rather than U · C. Between 48.30 and 51.70 mL, because the uncertainty widens the band a reading may legitimately fall in · D. Between 49.00 and 51.00 mL, because an uncertainty does not change the specification
`[B · B2 · Apply · HC · X · CERT]` — U = 2 × 0.35 = 0.70 mL, so the guard band pulls each acceptance limit inwards by 0.70 and leaves 49.00–49.70 and 50.30–51.00 indeterminate on a single reading; C moves the band the wrong way, which is the error that accepts non-conforming product, and D is right that the specification is unchanged and wrong that the decision is.

<!-- Section A tally — keys: A 10 · B 10 · C 11 · D 11 (no letter above 26%) | types: X 20 · S 14 · K 8 | Bloom: Apply 11 · Analyze 15 · Evaluate 8 = 34 of 42 (Understand 8, Remember 0) | verticals: MFG 11 · HC 10 · TXN 11 · NEU 10 | negative stems: 0 | option parity: key is the longest option in 14 of 42 (33%, against 25% by chance); mean key-to-distractor length ratio 1.10 | coverage: portfolio and prioritization A1 A2 A3 A4 A5 A6 A7 A8 A9 A10; strategic linkage A11 A12 A13 A14 A15 A16 A17 A18; Kano A19 A20 A21 A22 A23 A24 A25 A26 A27 A28; conjoint awareness A29 A30 A31; charter at scale, decision rights and escalation A32 A33 A34 A35 A36 A37 A38; team launch without authority A39 A40 A41 A42 | "when not to use": prioritization matrix on a regulatory mandate A7, matrix on a capital decision A8, matrix on a Just-Do-It A2, Kano where the customers are three named accounts A23, Kano coefficients below 30 per segment A28, Kano where the wording is the defect A26, conjoint without respondents, budget or time A31, a Black Belt charter on a single-function candidate A37 A17 | arithmetic recomputed and exhibits checked for internal consistency: A1 A3 A8 A10 A11 A14 A16 A18 A19 A21 A22 A24 A25 A26 -->

<!-- Section B tally — keys: A 9 · B 9 · C 9 · D 8 (no letter above 26%) | types: X 15 · S 13 · K 7 | Bloom: Apply 10 · Analyze 13 · Evaluate 5 = 28 of 35 (Understand 7, Remember 0) | verticals: MFG 10 · HC 9 · TXN 9 · NEU 7 | negative stems: 0 | option parity: key is the longest option in 8 of 35 (23%, against 25% by chance); mean key-to-distractor length ratio 1.07 | coverage: choosing the study B1 B2 B3 B4; destructive and nested B5 B6 B7 B8 B9 B10 B11 B12; attribute-complex, nominal and ordinal B13 B14 B15 B16 B17 B18 B19 B20; validating system-generated data B21 B22 B23 B24 B25 B26 B27; expanded Gage R&R B28 B29 B30 B31; uncertainty and tolerance ratios B32 B33 B34 B35 | "when not to use": crossed design on a destructive test B5, nested design where the item can be measured again B8, nested design with no homogeneous batch B10, %GRR read without its batch sourcing B11, attribute agreement on a coarsened continuous measure B19, per-category kappa on three items B20, a single senior appraiser as the standard B16, a paired audit where the event cannot be observed B23, an expanded study before the single-site study B30, factors that cannot be randomized over B31, %study variation where %tolerance was the question B32 B33 | arithmetic recomputed and exhibits checked for internal consistency: B5 B6 B9 B11 B13 B15 B17 B21 B27 B28 B29 B33 B34 B35 | form-assembly note: B6 and B9 are both nested-ANOVA exhibits on separate data and may co-occur; B28 and B29 are both expanded studies and should not appear on the same form -->

<!-- Second-SME review (policy §2), 2026-09-20 — 77 items reviewed adversarially; item numbering, item count and every tag position unchanged. Defects corrected: A1 exhibit said "eight candidates" and showed five; A6 admitted a defensible second answer (fund a contractor) until the stem closed the budget off; A8 was tagged MFG on a hospital scenario and re-used A3's candidate list — rewritten as an axle-plant capital case, selected-project totals changed to 425 and 400 so the two items no longer share a scenario; A10 rationale conceded distractor A was "defensible", so the stem now states the decision is not yet made and the rationale was reworded; A11 rationale named a project absent from the exhibit; A28 was tagged HC with no healthcare content in the stem; A35 key said "named early" where the defect is "named before Measure"; B1 tested recall of a numbered list and left two options defensible as "first" — the stem now discriminates on no-data-to-compute-from against uninformative, and the rationale no longer mis-cites its own options; B8 key was elliptical; B12 admitted a defensible second answer (exclude a documented mis-sample) until the stem recorded that no exclusion rule was written before the result was seen; B17 key over-stated "half" where 37 of 76 is the figure. Systemic defect corrected across 70 items: the key was the longest option in 71 of 77 items at a mean of 2.72× the distractors, so "choose the longest" scored 92% — keys were trimmed, justification moved into the rationale line, and distractors given parallel reasoning; the key is now longest in 22 of 77 (29%) at a mean ratio of 1.08. Verified unchanged: all keys, Bloom levels, verticals, types and pools; no negative stems; no "all/none of the above"; every X item still needs its exhibit to be answerable. -->

---

v1.0 · 2026-09-20
