# Week 8 — Control: Control Plans, Sustainment and Closure (3 h self-paced + 2.5 h live lab)

Your pilot is running, finished, or scheduled with a posted prediction. This week you build
what outlives the project: a control plan a named owner runs without you, a chart someone
reads, standard work written by the people who do the work, and a benefit figure Finance will
sign. Then you tell the story on one page in ten minutes with your sponsor in the room.
Tollgate 4 is the last gate on the calendar, not the last conversation. Every number in this
week's examples is illustrative and continues the week 7 cases.

**Learning objectives.** By the end of this week the learner can:
1. Write a control plan with metric, method, frequency, owner and a response plan stating
   what reading triggers what action by whom, for the output metric and the countermeasure.
2. Choose the sustainment chart, state when its limits are recalculated, name who reads it,
   and read a scripted signal against the response plan.
3. Draft standard work in the vertical's format with the people who do the work, with a
   training plan naming people and dates.
4. Run a handover meeting, obtain the process owner's signature, and set the closure calendar:
   day 0, the 30-day submission point, the day-90 sustainment check.
5. Classify each benefit row as hard, soft, cost avoidance or clinical/service impact, write
   the calculation basis, annualize only beside the measured figure, and answer the
   no-double-counting question.
6. Present a project as problem → cause → change → result on one page in ten minutes, timed.

Rubric items in play: I1–I4, ★ C1, C2, C3, S1
([`../project/review-rubric.md`](../project/review-rubric.md)); the gate is in
[`../project/tollgate-checklists.md`](../project/tollgate-checklists.md).

---

## 8.1 The control plan: what, how, how often, who — and then what (30 min)

**Hook.** A countermeasure removes a cause. Nothing removes the reasons the cause existed:
the tool crib is still across the plant, pharmacy still batches, vendors still email PDFs.
Without a named reader and a written action the process drifts back for the same rational
reasons it was where it was. That is why ★ C1 is mandatory.

**Teach.** A control plan is one table with seven columns, and a blank cell is a hole the
process will find: **what is monitored** (the primary metric, at least one *input* — the
countermeasure itself, is it being done — and the guardrail); the **operational definition**,
copied from the charter word for word; the **method** and where it lives; the **frequency**
of collection and of review, which differ; **who reads it** — a role with a name and the
authority to act, never the Green Belt; the **trigger**, a chart rule or threshold two people
would agree fired; and the **response** — action, person, time limit, escalation. The last
two columns are the **response plan**; "investigate" is not a response. Monitor the input as
well as the output: the output says the process drifted, the input says why, weeks earlier.

**Show (MFG — press changeover, press 12).**

| What | Operational definition | Method | Frequency | Who reads | Trigger | Response |
|---|---|---|---|---|---|---|
| Changeover time | Minutes, last good part of run A to first good part of run B, from the press log | I-MR on the cell board | Every changeover; reviewed Monday cell meeting | Cell lead, press 12 (named) | Any of the four rules on the I chart | Setter writes the reason on the chart the same shift; cell lead audits staging within two shifts; two signals in a month → kit list review with the maintenance planner |
| Kit pre-staged before run A ends | Yes/no on the changeover sheet, checked against the shadow board | Weekly tally, percent staged | Weekly | Cell lead | Below 90% in a week | Cell lead asks the shift what stopped staging and logs the design reason; escalates a resource gap to the value stream manager |

The 71-minute damaged-die changeover from the pilot stays on the chart, annotated; the plan
makes the next one a counted event, not a deleted one.

**When NOT to.** Three rows a cell lead reads beat twelve nobody does. A role without a person,
or a person without authority, is not an owner; "tell the Green Belt" is not a response.

**Try.** Draft your rows in the toolkit's `control-plan.md`. Ask a colleague whether each
trigger fired on last week's chart; where you disagree, rewrite the trigger.

---

## 8.2 SPC in sustainment: which chart, who reads it, what a signal triggers (35 min)

**Hook.** The week 4 baseline chart has a second stage now. In sustainment it becomes the
owner's chart, and the question changes from "is it stable?" to "is it still where we left
it, and who noticed first?"

**Teach.** Three decisions.

*Which chart.* The one you chose in week 4 for the data type: I-MR for one value per period,
X̄-R with rational subgroups, p or np for classified units, c or u for counts. Changing chart
type at handover changes what a signal means.

*Which limits.* The baseline limits stay as the reference until the post-change stage has
about 20 to 25 points. Then recalculate from post-change data only, draw the stage line, and
label both stages with period and n. Recalculate again only for a deliberate, dated change,
never because a run of points is inconvenient.

*Who reads it, and what a signal triggers.* The people who work the process see the chart
where they work; the named owner reads it at the plan's frequency; the reviewer reads it once
at day 90. A signal — the four rules from week 4, named on the chart — is a trigger in the
control plan and is read in the plan's words: rule, response, person, time limit. A signal in
the good direction is investigated too. Control limits are from the process, the target and
specification from the customer; both are on the chart, and the owner is taught the difference
before the handover meeting ends.

**Show (TXN — AP invoice exceptions, emailed invoices after roll-out).** Weekly p chart,
unequal subgroups. Post-change p̄ = 5.2% over 12 weeks, weekly n from 70 to 120. Limits step
weekly: UCL = p̄ + 3√(p̄(1 − p̄)/nᵢ), with 0.052 × 0.948 = 0.0493. At n = 90, 3 × √(0.0493/90)
= 3 × 0.0234 = 0.070, UCL 12.2%; at n = 120, UCL 11.3%; the lower limit computes below zero,
so there is none. Week 9: 11 exceptions on 84 invoices, 13.1% against that week's UCL of
12.5% — rule 1. The AP team lead reads it Monday, per the plan, and walks the intake queue: a
new vendor group was onboarded without its open-PO list loaded, the pick list was empty, and
the clerk keyed the number by hand — the old cause, back through a gap in onboarding design.
List loaded and an onboarding checklist line added that week; week 10 is 4.8%. Signal,
response, recovery is what "the control plan held" means at day 90.

**Software parity.** *Minitab:* I-MR or p chart with a stage column under *Stages*, tests
named. *Excel:* p̄ from the post-change block, a UCL column per week from that week's n, three
series plotted (or the stats add-in's staged chart). *R:* `qcc(x, sizes = n, type = "p")` on
the post-change block with the baseline as reference. *Python:* limits by the formula per
subgroup, both stages plotted, as the toolkit notebook does.

**When NOT to.** A small sustained shift that matters — 5% creeping to 7% — is what CUSUM and
EWMA detect, and they are Black Belt tools: write in the plan that a small shift matters and
ask for help; do not tighten limits by hand. Do not chart a metric the owner cannot act on. Do
not keep baseline limits on a changed process indefinitely; every point below the old center
reads as a signal and the owner stops reading.

**Try.** Add the sustainment stage to your chart in your software and write the sentence the
owner would say at Monday's meeting about the latest point.

---

## 8.3 Standard work written with the people who do the work (25 min)

**Hook.** A standard nobody helped write is a document; one written by the people who run it
is a promise they made to each other. C2 scores the second.

**Teach.** Standard work records the current best way to do the changed step: the
**sequence**, the **key points** (what makes each action succeed or safe), the **reason** for
each key point, and the **time** where it applies. Write it at the step, after watching the
people do it at least three times, with them holding the pen, in the vertical's own format so
it lives with their other standards: a standard work or job element sheet at the press (MFG);
a protocol, order set or unit checklist in the clinic's policy format (HC); a desk procedure in
the team's knowledge base with screen names as they appear (TXN). Yellow Belt visual controls —
shadow board, labeled staging square, label plus shape plus position — are how the standard is
seen without being read. The **training plan** names who is trained, by whom, by when, and how
you know it took: an observed run against the sheet, not a signature. New starters and cover
staff are the population that matters in month 4.

**Show (HC — pre-visit lab draw and conditional pharmacy release).** Written with two infusion
nurses, the scheduler and the pharmacist in the clinic's protocol template. Sequence: at
booking the scheduler flags stable-protocol patients and books the draw for the day before;
pharmacy checks the result against the release criteria at 07:00 and compounds for release;
the chair nurse confirms the flag at check-in. Key point and reason: "release criteria are the
written ones on the protocol — a verbal criterion becomes an argument on a busy morning."
Training: the two nurses train the other eight over two weeks, each observed once by the nurse
manager. The pharmacist added the line the Green Belt would have missed: a result older than
48 hours does not qualify and the flag clears automatically.

**When NOT to.** Not for a step you have not watched; not alone with signatures collected
after; not before the pilot has shown the step works. The sheet says how; the plan says whether.

**Try.** Draft sequence and key points, take them to one person who does the work, and change
at least one line on what they say. Record which line.

---

## 8.4 Handover to a named owner, and closing the project (20 min)

**Hook.** If you were away for a month, would the chart still be kept and the response plan
run? If that depends on you, the handover has not happened.

**Teach.** The **handover meeting** is thirty minutes with the process owner, the sponsor and
the people who work the process: the one page; the chart and its two stages; the control plan
read row by row, the owner saying aloud what they would do at each trigger; standard work and
training plan; the other-changes log, now the owner's; the signature. The signing date is
**day 0** for the sustainment check ([`../project/sustainment-check.md`](../project/sustainment-check.md)),
and you step back to observer.

**Closure** follows a calendar set at Tollgate 4. ★ C1 needs 30 days of live monitoring at
submission, so day 30 is the earliest date for the closure submission check with your coach
(last section of the tollgate checklists). The package: the page on top; the chart continuous
from baseline through monitoring with one operational definition, or a dated, explained
change; the sponsor attestation, written by the sponsor in their own words and never drafted
by you; the Finance memo or mission-metric validation; rejected causes and unmet predictions
included. Independent review returns in 15 business days with one revise-and-resubmit cycle.
At day 90 the reviewer asks the sponsor whether the plan held; the answer sets the badge's
`sustained` flag and cannot change the credential.

**Show (MFG).** Handover on the Friday of week 10: the cell lead signs with the Monday review
in her calendar; the chart moves from the Green Belt's laptop to the cell board; the
maintenance planner takes the kaizen follow-up list with two dated items. Day 30 is week 15;
the submission check finds the Finance memo missing its no-double-counting line, a day's fix.
Submission week 16, feedback week 19, day-90 check week 23.

**When NOT to.** Not during the pilot — the owner receives a process, not an experiment. Not
to the sponsor: the sponsor attests, the owner runs.

**Try.** Write your closure calendar with dates and the sentence you will use to ask the owner.
If you have not asked yet, that is this week's project work.

---

## 8.5 Financial validation with Finance (35 min)

**Hook.** "We saved $180,000 a year" is the sentence that gets a Green Belt program
disbelieved. The outcomes page carries measured-window figures only, and the badge's
verified-impact field points at what Finance signed. C3 scores classification and basis; the
arithmetic is the easy part.

**Teach.** Four rules, from Part B of
[`../project/sponsor-verification-and-finance-validation.md`](../project/sponsor-verification-and-finance-validation.md).

1. **Classify every row.** *Hard*: a ledger line moved — overtime, scrap, consumables, fees,
   penalties paid, revenue booked in the window. *Soft*: time or capacity freed with no budget
   line moved, reported in hours or units, converted only at Finance's rate and labeled soft.
   *Cost avoidance*: budgeted or committed spend that now will not occur, the commitment dated
   before the project. *Clinical or service impact*: a mission metric, validated in Part C,
   never converted. Rows stay separate; classes are never added into one headline.
2. **Write the basis** in eight lines: metric and operational definition; baseline value and
   period; post-change value and evidence window (after full implementation, at least four
   weeks, at least the I3 window); volume basis and source; unit cost or rate and source; the
   formula written out; project costs netted; net measured benefit. The Finance partner stated
   the basis at Tollgate 2; this week you confirm it.
3. **Annualize only beside the measured figure**, by run rate, capped at 12 months, assumption
   stated. The measured figure is the validated one.
4. **No double counting.** Ask in writing whether any part is claimed by another project, a
   Yellow Belt mini-project, a system implementation or a cost program; write the split.

Finance attests arithmetic, sources and class — not causation, which the reviewer scores from
your I3 evidence, and not a forecast.

**Show (TXN — AP invoice exceptions, worked).** Evidence window: 8 weeks after roll-out to all
emailed invoices, 1,120 invoices. Exception rate 13.6% → 5.2%, same definition (returned to
the vendor or held for a missing or mismatched PO). Exceptions avoided ≈ (0.136 − 0.052) ×
1,120 ≈ 94. Rework per exception from the week 2 map: 22 minutes; 94 × 22 ≈ 2,070 minutes
≈ 34.5 hours.

| Row | Class | Working | Measured, 8 weeks |
|---|---|---|---|
| AP overtime | Hard | Overtime hours on the AP cost center fell 9 h against the prior 8 weeks × $41/h loaded overtime rate (Finance, dated) | $369 |
| Rework capacity beyond the overtime reduction | Soft | 34.5 h − 9 h = 25.5 h; no budget line moved; Finance's rate $34/h | 25.5 h (≈ $867, soft) |
| Early-payment discounts captured | Hard | Discount ledger line up $1,140 against the prior 8 weeks; procurement moved a second vendor group to the portal in the same window; Finance attributes half to this project, split written in B4 | $570 |
| Late-payment penalties | Not claimed | None assessed in the window; no signed commitment shows one would have been | — |
| Pilot cost | Netted | IT configured the pick list in 6 h; Finance does not cost internal hours; no external spend | $0 |
| **Net measured hard benefit** | | | **$939** |

Run rate, stated beside it by Finance: ≈ $6,100 per year, projected, current volume, no
roll-out to paper invoices assumed. The sentence Finance signs: "Over the eight weeks from
[date] to [date], the change removed about $939 from the AP overtime and discount lines and
freed about 25 hours of rework capacity that has not been removed from the budget."

**HC (Part C, no money).** Chair wait, stable-protocol patients: median 58 → 31 minutes over
8 weeks (n = 812 visits), 90th percentile 118 → 64; guardrail discarded doses 0.4 → 0.6 per
week, within the pharmacy's month-to-month range. On the clinic's access scorecard; the
director of ambulatory services validates. No chair-hour or revenue conversion — if the
sponsor wants one, it is a Part B row with its own basis.

**MFG (double counting).** The kit cart frees 16 minutes per changeover. A Yellow Belt 5S
mini-project on the tool crib already claimed 4 minutes per changeover on the same presses last
quarter. The Green Belt row is calculated on the 12 minutes beyond it, the mini-project
referenced in B4 — and the minutes are **soft** unless the press is the constraint and the
extra output was sold and booked in the window.

**Software.** None: a spreadsheet with the formula written in words above the numbers, saved
with Finance's dated rate sheet.

**When NOT to claim.** Revenue expected rather than booked; a penalty that "would have"
happened with no signed commitment; hours saved that nobody has redeployed, labeled savings;
any conversion of a mission metric to money on the Part C page.

**Try.** Write your rows with the class column first. For every "hard," name the ledger line
and the person who can show it moved.

---

## 8.6 Storytelling the project on one page (20 min)

**Hook.** The page is the record; the deck is not. A stranger reads it and ten minutes later
retells problem → cause → change → result. That stranger is the reviewer; S1 is five points
for making the job easy.

**Teach.** Use the toolkit's `a3.md` or a storyboard; the layout is the argument.

| Left — what was true | Right — what you did |
|---|---|
| Problem statement, the charter's words (D1) | Countermeasure and the matrix's paragraph (I1) |
| Baseline chart, stability stated; capability or DPMO with the specification source (M4) | Prediction and the staged chart baseline → pilot → sustainment, one definition, limits labeled (I2, ★ I3) |
| The stratified chart that showed where variation lived (A2) | Result against the prediction in the customer's units — met, partial or unmet, said plainly |
| Verified cause with effect size and interval; causes that did not verify (★ A3, A4) | Control plan summary with the owner's name and day 0 (★ C1); standard work and training (C2); benefit row with class and validator (C3) |
| | Next steps and the parking lot, including the problem bigger than this project |

Three charts and four sentences carry most projects; every chart carries metric, units, period
and n. The unmet prediction goes on the page in the same font as the met one — the rubric
passes honest failure, and the sponsor's attestation asks whether the summary says so.

**Show (HC).** The infusion page opens with "Stable-protocol patients wait a median 58 minutes
from check-in to pump start (12 weeks, n = 1,190); the access target is 30," shows the stable
baseline, the day-before-versus-same-day box plot (24 against 61 minutes), and the staged chart
at 31 with untouched chairs at 57, and its parking lot says the same-day-lab patients still
wait 58 — a pharmacy capacity question outside this charter.

**When NOT to.** Not a deck with the page attached; not a second page for methods — exhibits
sit behind the page; not the statistics first. Lead with the sentence; let the chart prove it.

**Try.** Give the draft to someone outside the project for ten minutes and ask for four
sentences back. Every stumble is an edit.

---

## 8.7 Tollgate 4, and what happens after week 8 (15 min)

**Tollgate 4 — Improve/Control.** Ten minutes, one page, sponsor deciding, process owner
present, tollgate reviewer recording.

| Item | On the page | Reviewer reads for |
|---|---|---|
| I1 | Candidates; matrix with sponsor-confirmed weights; the paragraph | Targets the Tollgate 3 verified cause, not an asserted one |
| I2 | Bounded pilot; prediction with number and window; identical success measure; stop rule | Falsifiable |
| ★ I3 (in progress) | Staged chart or paired comparison to date; result against prediction, or "not yet run" | Same metric, definition, method; would the design produce comparable evidence if continued |
| I4 | Device classified; residual risk; FMEA row re-scored | Residual risk written, not waved |
| ★ C1 (draft) | Control plan rows; owner named; handover date; the chart they will keep | Was the owner in the room; does the response name a person and a time |
| C2 (draft) | Standard work in the vertical's format; training plan with names and dates | Written with the people who do the work |
| C3 (basis) | Class per row; Finance or mission-metric basis agreed; the double-counting question asked | No money without Finance in the conversation |
| S1 | The page | Could a stranger follow it in ten minutes |
| Closure | Date within 6 months of week 8, ≥ 30 days of monitoring before submission | On the calendar |

The sponsor decides five things: the countermeasure beyond the pilot, or the pilot as
designed; the control-plan owner and their authority; the validator on the stated basis; the
closure and day-90 dates; then proceed to closure, proceed with conditions, hold, re-scope or
stop. A hold is one specific item; most projects take one somewhere.

**After week 8.** The course ends; the project closes within six months. Your coach holds
checkpoint 3 around this gate and, from month 3, a 30-minute checkpoint each month until the
file is submitted; two consecutive months with no movement on the closure calendar trigger a
three-way conversation with the sponsor about finishing a bounded slice with honest evidence,
or closing the project as documented learning without the credential this cycle
([`../delivery/facilitator-and-coaching-system.md`](../delivery/facilitator-and-coaching-system.md) §4.2).
Certification follows the exam, the reviewed project and the sponsor attestation. At day 90
from handover the reviewer of record — not your coach — sends the sponsor five questions; the
answer sets the `sustained` flag, feeds the published sustainment rate, and never changes the
credential. If the plan did not hold, you get a coaching note with three questions and the
sponsor an offer of a conversation about restarting it.

**The Black Belt invitation.** When a project reveals a problem bigger than its scope — a
cause across functions, two factors that must move together, a change needing authority the
sponsor does not hold — the reviewer records it at the gate and in the final feedback. That
note is the invitation. Admission requires a certified Green Belt and one completed DMAIC
project on a real process; a Practicum credential satisfies the first only, and a later
sponsored project completes it.

---

## Live lab — run of show: the tollgate rehearsal (150 min)

**Facilitator:** certified program instructor (Black Belt or above); producer above 12
learners; the second coach takes a room above 12. **Rooms:** 4–5 learners each, mixed
verticals; the tollgate reviewer joins where available. **Attendees bring:** the page, the
sustainment chart, the control plan draft, the benefit rows. **Sponsors** are invited for
their learner's 15-minute slot; a sponsor who cannot come is played by a peer from the sponsor
question list. **Lab outcomes:** a timed run, a stranger's retelling, and a response plan that
survived three scripted signals.

### 0:00–0:10 — Frame
Poll: "Could a stranger retell your project from your page in ten minutes?" Save the count.
Rules, said once: ten minutes, stopped at 10:00; one page; no deck; questions after, never
during. The asymmetry: an unmet prediction honestly read passes; a page that hides one does not.

### 0:10–1:25 — Rehearsal rounds (75 min)
- Five 15-minute slots per room. Ten minutes timed, the timer visible, the facilitator stops
  the learner mid-sentence at 10:00 — that is the rehearsal. Then five minutes: the sponsor or
  stand-in asks two Tollgate 4 questions; one peer retells the project in four sentences from
  the page alone; the reviewer or facilitator reads out items evidenced and at risk, one
  sentence per ★ item.
- **Facilitator moves.** Read the page, not the learner: if the retelling misses the cause,
  the cause is not on the page. Ask every time: "Whose name is on the control plan, and are
  they here?" and "What class, and who agreed the basis?"
- **Failure modes.** The deck smuggled in as "backup exhibits" — the page presents, exhibits
  answer questions. After-data with a shorter definition ("we timed from pump start this
  time") — a data-ethics conversation now, a stop at review. Money with no Finance partner —
  the row is rewritten as soft or "basis to be agreed" before the slot ends.

### 1:25–1:35 — Break

### 1:35–2:05 — Response plan drill (30 min)
- Pairs. Each learner's chart gets three scripted readings: a point beyond the recalculated
  UCL; six points rising toward the baseline; nine points below center in the good direction.
  The partner plays the owner and reads each against the plan: rule, response, who, by when.
  The learner answers only what the plan answers; where it is silent, the plan is edited on the
  spot.
- **Failure mode:** every response is "the Green Belt looks into it." Send the learner out of
  the pair for two minutes; the partner must act from the plan alone.

### 2:05–2:20 — The benefit row (15 min)
- Each learner writes their Part B or Part C rows, class column first. The partner checks for
  a run rate presented as measured, soft presented as hard, and a rate with no source. One fix
  each, written.

### 2:20–2:30 — Debrief and commit
- Re-run the opening poll; the change in the count is the lesson, said plainly.
- Each learner posts to the cohort channel: "My handover is on [date] to [name, title]; my
  closure date is [date]; my benefit is [class] on the basis agreed with [name]." Coaches
  follow these at the monthly checkpoints.
- **Protect the debrief.** If rounds overrun, make the benefit-row block a homework post at
  2:05; never cut the drill below 20 minutes or the commit block at all. The posted handover
  date is the first line of the closure calendar.

---

## Project work this week — Tollgate 4

| Rubric item | What you produce |
|---|---|
| I1, I2, I4 | Closed out on the week 7 page; matrix, pilot plan, device and re-scored FMEA row behind it |
| ★ I3 | Staged chart continued as the pilot runs; other-changes log current; result against prediction written, or the scheduled start and posted prediction |
| ★ C1 | Control plan with all seven columns; owner named and asked; handover date set; the owner in the room at the gate |
| C2 | Standard work drafted with the people who do the work, in the vertical's format; training plan with names and dates |
| C3 | Benefit rows classified; basis confirmed in writing with the Finance partner or validator; the double-counting question asked and answered |
| S1 | The page, tested on a stranger, presented in ten minutes |
| Closure | The calendar: day 0, day 30, submission, day 90 — within six months of this week |

## Coaching prompts

1. "Read me your response for a point beyond the limit. Who acts, and have they said yes?"
2. "Which benefit row moved a ledger line, and who can show me the line?"
3. "If the plan does not hold at day 90, what in it fails first?"

## Vertical case dataset — week 8

Each case pack adds a sustainment-stage file to the week 7 pilot file, plus a simulated cost
and outcome table for the Practicum track. Numbers are illustrative; plants are in the
facilitator key.

- **MFG — press changeover** (`changeover_sustain.csv`): one row per changeover after roll-out
  on press 12; `date`, `shift`, `setter_id`, `kit_prestaged`, `changeover_min`,
  `other_change_note`. Planted: 30 post-change changeovers at mean 31.4 min, MR̄ 4.1, stable,
  for the recalculation (UCL ≈ 42.3, LCL ≈ 20.5); then six rising from 33 to 44 min while
  `kit_prestaged` drops to 60% — a new setter started on nights before the training plan
  reached them, logged; one damaged-die changeover at 68 min, annotated. Cost table: loaded
  overtime rate, press-hour rate, and the Yellow Belt 5S claim of 4 min per changeover.
- **HC — infusion chair wait** (`chair_wait_sustain.csv`): one row per visit, 8 weeks after
  roll-out to all chairs; `date`, `chair`, `labs_day_before`, `protocol_stable`, `wait_min`,
  `dose_discarded`, `release_flag_set`. Planted: weekly median near 32 for stable-protocol
  patients; a week 6 signal at 47 traced to a pharmacy software update that cleared release
  flags overnight, logged; discarded doses 0–1 per week; same-day-lab patients unchanged at
  58. Outcome table for Part C: scorecard definition and the guardrail's monthly range.
- **TXN — AP invoice exceptions** (`ap_exceptions_sustain.csv`): one row per week for 12
  weeks; `week`, `vendor_group`, `invoices`, `exceptions`, `po_list_loaded`, `overtime_h`,
  `discounts_captured`. Planted: p̄ = 5.2%, n 70–120; the week 9 signal at 11 of 84 from a
  vendor group onboarded without its PO list; recovery week 10; overtime and discount ledger
  lines for the Part B example; procurement's portal move in week 5 for the attribution split.

## Takeaways

- A control plan is monitoring plus a response with a name and a time limit, for the output
  and the countermeasure, owned by someone who is not you.
- The sustainment chart is the week 4 chart with a second stage: same type, limits recalculated
  once from post-change data, read by the owner, signals answered from the plan.
- Benefit rows are classified before they are added; the measured-window figure is the
  validated one; the run rate sits beside it; nothing is counted twice.
- One page, ten minutes, the unmet prediction in the same font as the met one.

## Cumulative check (2 items from weeks 5 and 6)

**CC8.1.** In week 5 the working FMEA row "bolt missing from changeover kit" scored severity 6,
occurrence 7, detection 8 (RPN 336). The countermeasure adds a shadow board on the kit cart
that shows an empty bolt position before the changeover starts. The correct re-score for I4 is:
A. Detection falls (to about 3); occurrence is unchanged because the board does not stop the
bolt being left out; RPN ≈ 126 ✅ · B. Occurrence falls to 2 because the board reminds the
setter to include the bolt · C. Severity falls because the missing bolt is now caught before it
matters · D. All three scores fall, since the failure mode is addressed
`[C1 · G5 · Apply · MFG · S · PRAC]` — A shadow board is detection at source: it changes how
likely the error is caught, not how often it is made (B) or how bad its effect is if it
escapes (C); the residual risk is the unchanged occurrence.

**CC8.2.** At closure the sponsor asks whether the AP result "proves" the countermeasure. Over
the 8-week window the rolled-out vendor groups show 58 exceptions on 1,120 emailed invoices
(5.2%); a concurrent control group not yet rolled out shows 138 on 1,050 (13.1%); chi-square
p < 0.001. The sentence to tell the sponsor is:
A. "The p-value is below 0.001, so the countermeasure caused the improvement" · B. "A
two-sample t-test on the weekly rates is needed before anything can be said" · C. "Both groups
are below the 15% target, so the difference is not practically meaningful" · D. "The exception
rate is about 7.9 percentage points lower in the rolled-out groups, 95% CI roughly 5.5 to 10.4
points, matching the Analyze effect; the concurrent control group rules out the month-end
volume swing as the explanation" ✅
`[C2 · G5 · Analyze · TXN · S · PRAC]` — The effect size with its interval and the comparison
design are the sentence; a p-value alone (A) says chance is implausible, not that the change
caused it; C confuses a target with the practical question of what the change did.

---

v1.0 · 2026-09-20
