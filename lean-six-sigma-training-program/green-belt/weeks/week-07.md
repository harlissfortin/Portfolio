# Week 7 — Improve: Countermeasures, Pilots and Mistake-Proofing (3 h self-paced + 2.5 h live lab)

You passed Tollgate 3 with at least one root cause verified with data (rubric item A3). This
week you turn that verified cause into a countermeasure you can defend, a pilot that can fail,
and a before/after evidence plan. The calendar calls this "solution generation"; from here on
the house term is **countermeasure** — a tested response aimed at a verified cause, not a fix
chosen in advance. Every number in this week's examples is illustrative.

**Learning objectives.** By the end of this week the learner can:
1. Generate at least three distinct countermeasures for a verified cause using SCAMPER and a
   benchmarking visit, and state which cause each one targets.
2. Build a selection matrix with weighted criteria agreed with the sponsor before scoring, and
   defend the choice in one paragraph.
3. Write a pilot plan with a bounded scope, a written prediction, a stop rule, and a success
   measure identical to the baseline metric and its operational definition.
4. Classify a mistake-proofing device as prevention, detection at source or downstream
   detection, and name its residual risk.
5. List the co-lead's duties before, during and after a kaizen event.
6. Apply Little's Law to a flow problem in their vertical and name the one flow countermeasure
   (kanban or setup reduction; queue discipline; patient-flow pull) that fits it.

Rubric items in play: I1, I2, I4, and the evidence plan for ★ I3
([`../project/review-rubric.md`](../project/review-rubric.md)).

---

## 7.1 Generating countermeasures: SCAMPER and benchmarking (35 min)

**Hook.** Your sponsor has had a solution in mind since week 1. So, probably, have you. Rubric
item I1 asks for more than one option, because the first idea is the most familiar, not the
best, and a sponsor who sees three options argues about criteria instead of a favorite.

**Teach.** You generate countermeasures from the **verified cause**, not from the problem
statement. Write the cause at the top of the page as Analyze verified it, with its effect
size. Then use two generators.

**SCAMPER** is seven prompts applied to the process step where the verified cause lives:

| Prompt | Ask about the step |
|---|---|
| Substitute | What input, tool, role or sequence could replace the one the cause depends on? |
| Combine | What two steps, forms or checks could become one so the handoff disappears? |
| Adapt | Who else has this mechanism, and what do they do? (Benchmarking plugs in here.) |
| Modify | What if the step were larger, smaller, earlier, later, more visible? |
| Put to another use | What existing device, field or signal could do this job? |
| Eliminate | What if the step, field or approval did not exist? |
| Rearrange | What if the order changed so the check happens before the error can propagate? |

Ten minutes per prompt, in silence first (everyone writes), then aloud. You are after quantity
and difference; the matrix in 7.2 does the choosing.

**Benchmarking** means going to see a process that has already dealt with the same *mechanism*:
internal (another shift, site or department), functional (a different industry with the same
mechanism — a pharmacy that pre-stages kits can learn from an airline's pre-flight kit), or
competitive (rarely accessible). Benchmark the mechanism, not the artifact; take the people
who do the work; write what you saw within 24 hours; a visit produces candidates, never a
decision.

**Show (TXN — accounts payable invoice exceptions).** Verified cause from week 6: on invoices
that arrive as emailed PDFs, the PO number is keyed free-text; chi-square showed an exception
rate of 13.6% on emailed invoices (n = 1,840) against 4.1% on portal invoices (n = 2,210), a
difference of 9.5 percentage points, 95% CI 7.8 to 11.2. SCAMPER on the "enter PO number"
step gives: *Substitute* the free-text field with a pick list of that vendor's open POs;
*Combine* intake with goods-receipt confirmation so the PO is already attached; *Modify* the
field to validate against the open-PO list at entry; *Eliminate* the field and auto-match on
vendor plus amount; *Rearrange* the PO check to run before approval routing instead of after.
Internal benchmark: the sister site's portal already validates at entry. Six candidates, and
"train the vendors" is not one of them: vendors are responding rationally to a free-text field
that accepts anything.

**When NOT to use this.** SCAMPER on an unverified cause generates countermeasures for a story;
go back to A3. Benchmarking that copies the artifact (their form, their software) without the
mechanism (validation at the point of entry) imports the surface and leaves the cause.

**Try.** For your own verified cause, run three SCAMPER prompts and name one internal benchmark
you can visit this week. Bring the list to the live lab.

---

## 7.2 Choosing: the selection matrix with stated criteria (30 min)

**Hook.** "We picked it because it felt right" fails I1 even when the pick is good. Stated
criteria let the sponsor disagree with the weights instead of the result.

**Teach.** Candidates in rows, criteria in columns, weights agreed with the sponsor *before*
anyone scores. Green Belt criteria: predicted impact on the primary metric (from the Analyze
effect size, not enthusiasm); effort (hours and cost to pilot and roll out); risk to the
customer or patient and to other metrics; reversibility. Score 1 to 3 with word anchors on the
sheet ("3 = removes the cause for every unit; 1 = reduces it for some units"). Score as a
team, sum the weighted scores, then sanity-check the winner aloud: the matrix is a structured
conversation, not an oracle. For four or fewer candidates the effort/impact 2×2 does the same
job in ten minutes.

**Show (MFG — press changeover).** Verified cause: die retrieval from the tool crib and bolt
hunting happen while the press is stopped (internal setup). Week 6 t-test on changeovers where
a kit happened to be pre-staged (n = 22) against those where it was not (n = 26): mean 31 min
versus 47 min, difference 16 min, 95% CI 11 to 21 min, measured last good part of run A to
first good part of run B. Candidates: **A** pre-staged kit cart with a shadow board; **B** a
second tool crib beside the press; **C** standardized bolt lengths across the die set; **D** a
dedicated setup technician per shift.

| Candidate | Impact (w 0.4) | Effort (w 0.3) | Risk (w 0.2) | Reversibility (w 0.1) | Weighted total |
|---|---|---|---|---|---|
| A — kit cart, external staging | 3 | 3 | 3 | 3 | 3.0 |
| B — second tool crib | 3 | 1 | 2 | 1 | 2.0 |
| C — standardize bolts | 2 | 1 | 3 | 2 | 1.9 |
| D — dedicated setup technician | 3 | 2 | 2 | 1 | 2.3 |

Scale: 3 is best on every criterion. Candidate D scores well on impact and badly on
reversibility and running cost; the sponsor sees why it lost without anyone calling it a bad
idea. The sentence you tell the sponsor: "A kit cart staged before the run ends targets the
verified cause directly, costs about two days of a maintenance technician's time, and can be
withdrawn in an hour if the pilot fails."

**When NOT to use this.** When only one candidate is feasible, say so rather than staging a
matrix around it. When the weights are written after the scores, the matrix is decoration;
reviewers can tell.

**Try.** Build the matrix for your SCAMPER candidates. Draft the weights, then write the one
question you will ask your sponsor to confirm them.

---

## 7.3 Pilot design: prediction, stop rule, same metric (40 min)

**Hook.** A pilot without a prediction cannot fail, and a pilot that cannot fail cannot teach.
The rubric gives full marks to a documented pilot that did not work and led somewhere; it gives
nothing to "we tried it and everyone liked it."

**Teach.** The pilot plan (`../templates/pilot-plan.md`) has six elements.

1. **Bounded scope.** One line, unit, team or vendor group. Long enough for at least 20 data
   points in the new state, or two full process cycles, whichever is longer — a Practitioner
   rule of thumb, not a statistical guarantee.
2. **A written prediction.** "If [verified cause] is removed by [countermeasure], then [primary
   metric] will move from [baseline] to [target] within [window]." The target comes from the
   Analyze effect size: a cause that explained 16 minutes does not justify predicting 30.
3. **The same success measure.** Same metric, same operational definition, same collection
   method, same collectors where possible. Changing the operational definition between before
   and after voids ★ I3 and is a data-ethics stop in review.
4. **A stop rule**, of two kinds. A harm stop: any patient-safety event, defect escape or
   safety incident stops the pilot the same day. A futility stop: "if after 15 points the
   median has not moved past the baseline median, stop and return to Analyze."
5. **A comparison design.** Default: before/after on the baseline control chart with the pilot
   period as a second stage. Better when other changes are in flight or the season is moving:
   a concurrent comparison, pilot line against an untouched line in the same weeks. When units
   pair naturally (the same account before and after), a paired comparison.
6. **An other-changes log.** Every change in the window — a new hire, a volume swing, a
   software release — with its date, because any of them could move the metric. Change one
   thing at a time; testing several factors at once is a designed experiment, a Black Belt
   tool you know exists and do not run.

Expect a **Hawthorne** bump: attention alone moves a metric for a week or two. That is one
reason for 20 points and for the day-90 sustainment check.

**Show (HC — outpatient infusion chair wait).** Primary metric: minutes from check-in timestamp
to pump-start timestamp, clinic hours, per visit. Baseline (week 4): median 58 min, stable on
an I-MR chart. Verified cause (week 6): pharmacy compounding starts at check-in for patients
whose labs are drawn the same day; patients with labs drawn the day before waited a median
24 min against 61 min, difference 37 min, 95% CI 29 to 45 (two-sample t on log-transformed
minutes, assumptions checked). Countermeasure: pre-visit lab draw plus conditional pharmacy
release for patients on stable protocols.

Pilot plan: 2 of 12 chairs, four weeks, about 25 pilot patients a week, so roughly 100 points.
Prediction: pilot-chair median from 58 to 30 min or better within four weeks; non-pilot chairs
stay near 58 (a built-in concurrent comparison). Operational definition unchanged. Harm stop:
any compounded dose discarded because day-before labs no longer qualified the patient is
reviewed the same day; three in one week stops the pilot. Futility stop: after 40 pilot
patients, a median above 50 min ends it. Side metric named in advance: discarded doses per
week. Other-changes log opened on day one.

**Software parity for the evidence.** Staged I-MR chart: Minitab — I-MR with a phase column
under *Stages*; Excel — limits computed from the baseline period only and extended across the
pilot period (or the stats add-in's staged chart); R — `qcc(..., newdata = pilot)`; Python —
limits from the baseline block, both blocks plotted. Backup comparison: two-sample or paired t
in Minitab, the Excel ToolPak, R `t.test()` or Python `scipy.stats`. Every output ends with the
sentence you tell your sponsor: "The median moved from 58 to 31 minutes on the pilot chairs,
the untouched chairs stayed at 57, and the shift matches the 37-minute cause effect found in
Analyze."

**When NOT to run a before/after pilot.** When the countermeasure cannot be reversed (a system
or layout change), run a concurrent comparison on a slice before committing the whole. When
the process runs so rarely that 20 points would take a year, use a per-unit paired comparison
and state the limitation at the tollgate rather than stretching the window.

**Try.** Draft your six elements. If someone outside the project cannot tell from your
prediction what "failed" would look like, rewrite it.

---

## 7.4 Poka-yoke: mistake-proofing (30 min)

**Hook.** Shigeo Shingo's distinction: errors are inevitable, defects are not. A defect is an
error that reached the next step. Mistake-proofing is the design work between the two.

**Teach.** Three levels, in order of strength:
- **Prevention** — the error cannot be made: a fixture that accepts the part one way; a form
  that will not submit without a valid PO; a pump library with hard dose limits.
- **Detection at source** — the error is made and flagged before the work leaves the step: a
  shadow board that shows a missing bolt; a scale that beeps when the kit is light.
- **Downstream detection** — inspection or a report after the fact. Cheapest to build, weakest
  in effect, and the level most teams stop at.

Four device families: physical (shape, size, fit), sequence (the system will not advance),
information (label plus shape plus position — never color alone), warning (alarm, light,
tone). **A checklist is a reminder, not a poka-yoke:** it depends on attention, which is what
fails under load. Keep the checklist; it does not earn I4 on its own.

For I4 you also name the **residual risk**: what happens when the device is bypassed, fails or
is switched off. Then return to the week 5 FMEA and lower the occurrence or detection score
for the failure mode the device addresses; the recomputed risk priority number is your I4
evidence.

**Show (one device per vertical).**
- *MFG:* the kit cart's shadow board shows a missing bolt before the changeover starts
  (detection at source); a keyed socket that accepts only the correct bolt length is
  prevention. Residual risk: a setter borrows a bolt from another cart; carts are sealed at
  staging.
- *HC:* pump library hard limits prevent an over-rate infusion; a bedside double check is
  detection that depends on two attentive people at the end of a shift. Residual risk: a drug
  outside the library falls back to manual entry; the control plan counts library bypasses.
- *TXN:* validating the PO number against the open-PO list at entry is prevention; the weekly
  exception report is downstream detection. Residual risk: a valid PO attached to the wrong
  invoice, caught by the amount-tolerance check or held in a queue with an owner.

**When NOT to use this.** When the "error" is common-cause variation — a process centered in
the wrong place — a device that catches out-of-tolerance units improves nothing about the
process that makes them; return to the control chart. When the device adds a step people route
around under load, go and watch it in use before you count it.

**Try.** Classify six devices from the case pack by level and family, then write the residual
risk for one device on your own project.

---

## 7.5 Kaizen event basics: the co-lead's job (20 min)

**Teach.** A kaizen event is a three-to-five-day, cross-functional, bounded improvement with
changes made during the week rather than proposed for later. Yellow Belts are the core team; a
Black Belt facilitates; you **co-lead** — the Practitioner level on the skills matrix — which
means the data and the follow-through are yours.

*Before (two to three weeks out):* charter with the sponsor; baseline data against an
operational definition; scope walk; team members released from their day job in writing;
room and supplies booked. *During:* day 1 current state and go see; day 2 causes and
countermeasure generation (7.1 and 7.2 compressed); day 3 try-storming — mock it up, run it,
time it; day 4 standard work drafted with the people who do the work, plus the control method;
day 5 report-out. You keep the data board current daily. *After:* the **30-day follow-up
list** — every unfinished item has a name and a date, you chair the day-30 review, and nothing
older than 30 days stays on the list.

**Show (MFG).** The changeover team runs a three-day event on candidate A: day 1 films two
changeovers and separates internal from external steps; day 2 builds the cart from a spare
trolley and a plywood shadow board; day 3 runs three changeovers at 33, 29 and 31 min against
the 47-min baseline mean and drafts the staging standard with the two setters. The follow-up
list carries "weld the cart frame" with a name and a date.

**When NOT to use a kaizen event.** When the cause is unverified and verifying it needs weeks
of data; when the change needs authority the room does not hold; when the people cannot be
released — a half-attended event produces a half-owned standard.

---

## 7.6 The vertical flow module (25 min) — Green Belt depth

**Common core: Little's Law.** In a stable system, work in process = throughput × lead time,
with matching units. In accounts payable, 1,200 invoices in the queue at 300 invoices per
working day means 4 working days of lead time for the next invoice in — before anyone
measures it. The law predicts lead time from a WIP cap, sizes a kanban loop, and shows a
sponsor that more intake without more throughput only lengthens the queue. Future-state value
stream design is awareness here and practice at Black Belt.

**MFG — pull and setup reduction.** A kanban is a signal from the downstream step that
authorizes the upstream step to make or move a fixed quantity; nothing moves without a signal.
Kanbans in a loop = (daily demand × replenishment lead time in days × (1 + safety factor)) ÷
container quantity, rounded up: 400 units a day, a 2-day replenishment, a 0.25 safety factor
and 100-unit containers give 10 kanbans. Setup reduction has four steps: separate internal
steps (press stopped) from external (press running); convert internal to external — the kit
cart; streamline what stays internal (quarter-turn clamps instead of bolts); reduce
adjustment. Do not use kanban for one-off or lumpy demand; a signal loop needs a pattern.

**TXN — queue management.** One queue serving all agents beats a queue per agent on lead time
at the same throughput. Add first-in-first-out discipline, a WIP limit at intake (Little's Law
sets it from the target lead time), a fast lane for items under five minutes, and leveled
arrivals where the upstream step can batch less. In the AP example, a WIP cap of 600 at the
same throughput halves the queue lead time to 2 working days. Do not impose a WIP limit downstream of the constraint; the queue moves
upstream.

**HC — patient flow.** Chairs and beds are work in process; the stay is lead time. Pull from
downstream: a discharge or chair turnover releases the next admission, so the countermeasure
that moves flow usually sits at the release step, not the entry. Find the constraint (the step
whose queue is always full) and protect it; capacity added anywhere else changes cost, not
flow. In the infusion pilot, the lab-and-pharmacy release step, not the chair count, sets
throughput. Do not implement pull
where the clinical release criteria are not written down; the signal becomes an argument.

---

## Live lab — run of show (150 min)

**Facilitator:** certified program instructor (Black Belt or above); producer above 12
learners. **Attendees bring:** the verified cause with its effect size, three SCAMPER
candidates, a draft matrix. **Lab outcomes:** every learner leaves with a peer-reviewed pilot
plan (I2) and one classified mistake-proofing device with a named residual risk (I4).

### 0:00–0:10 — Frame
State the week's asymmetry: an honest pilot that fails passes I3; a pilot that "went well"
with no prediction does not. Poll: "Does your draft plan say what failure looks like?" Save
the count.

### 0:10–0:55 — Pilot design lab (45 min)
- Breakouts of three, mixed verticals on purpose; learners import fewer assumptions into an
  unfamiliar process. Each learner presents the six elements in four minutes. The other two run the **red-team
  card**: What else could move this metric in this window? Is the target bigger than the cause
  effect? Would the baseline collector recognize the operational definition? What is the harm
  stop? Fifteen minutes per learner including the rewrite.
- **Facilitator floats with two jobs:** enforce that predictions carry a number and a window;
  catch the operational definition drifting ("we will time it more carefully in the pilot" is
  a drift).
- **Failure mode:** a countermeasure that cannot be reversed. Move the learner to a
  concurrent comparison on a slice; do not let the group settle for "we will be careful."

### 0:55–1:05 — Break

### 1:05–1:50 — Mistake-proofing clinic (45 min)
- Whole room, ten minutes: six case-pack devices on screen; learners classify each by level
  and family by selecting a category (no drag-and-drop). Reveal, then argue the two contested
  ones; the checklist is always one of them.
- Breakouts by vertical, thirty minutes: each learner names the week 5 FMEA failure mode the
  countermeasure addresses, proposes one device, classifies it, writes the residual risk, and
  re-scores occurrence and detection.
- **Failure mode:** every device in the room is a downstream report. Ask each learner, "What
  would make the error impossible?" and accept "nothing feasible this month" as long as the
  residual risk is written.

### 1:50–2:20 — Flow module by vertical (30 min)
- Three breakouts on the case dataset's flow loop: MFG sizes the kanban loop and separates
  internal from external steps on the changeover log; TXN sets a WIP cap from a target lead
  time and designs the fast lane; HC finds the constraint from the chair-occupancy log and
  names the release criterion. Each room reports one number and one sentence.

### 2:20–2:30 — Debrief and commit
- Re-run the opening poll; the change in the count is the lesson, said plainly.
- Each learner posts to the cohort channel: "My pilot starts on [date], my prediction is
  [number], my stop rule is [rule]." Coaches follow these up at the checkpoint.
- **Protect the debrief.** If the flow module overruns, cut it to one report per room at 2:15;
  never compress the commit block. The posted prediction makes next week's evidence honest.

---

## Project work this week

| Rubric item | What you produce by the week 8 checkpoint |
|---|---|
| I1 Countermeasure selection | Three or more candidates; the matrix with sponsor-confirmed weights; one paragraph on why the winner targets the verified cause |
| I2 Pilot design | The six-element pilot plan, with prediction and stop rules posted to the cohort channel before the pilot starts |
| ★ I3 Before/after evidence (plan) | The baseline chart with the pilot stage added as it runs; the other-changes log open; the collection method confirmed identical to baseline in writing |
| I4 Mistake-proofing and risk | One device classified with its residual risk; FMEA row re-scored |

Pilot run or scheduled by the end of this week. If the pilot cannot start before week 8, the
tollgate accepts a scheduled start date, a signed release from the process owner, and the
posted prediction.

## Coaching prompts

1. "Read me your prediction. Which number in Analyze did it come from?"
2. "What would make you stop the pilot on Thursday, and who decides?"
3. "If the baseline collector and the pilot collector swapped weeks, would the numbers change?"

## Vertical case dataset — week 7

Each case pack extends the week 4 baseline and week 6 analysis files with a pilot-stage file.
Numbers are illustrative; planted features are in the facilitator key.

- **MFG — press changeover** (`changeover_pilot.csv`): one row per changeover; `date`,
  `shift`, `press`, `die_from`, `die_to`, `kit_prestaged`, `changeover_min` (last good part
  to first good part), `setter_id`, `other_change_note`. Planted: 26 baseline changeovers at
  mean 47 min; 24 pilot changeovers at mean 32 min on press 12; an untouched press that drifts
  down 3 min over the same weeks (a volume dip the other-changes log should catch); one 71-min
  changeover caused by a damaged die, which a learner must not delete.
- **HC — infusion chair wait** (`chair_wait_pilot.csv`): one row per visit; `date`, `chair`,
  `pilot_chair`, `labs_day_before`, `checkin_ts`, `pump_start_ts`, `wait_min`,
  `dose_discarded`, `protocol_stable`. Planted: 96 pilot visits at median 31 min against a
  58-min baseline; untouched chairs at median 57; two discarded doses in week 2 (below the harm
  stop); a week 3 scheduler change that shifted arrivals for all chairs, logged in the pack.
- **TXN — AP invoice exceptions** (`ap_exceptions_pilot.csv`): one row per invoice; `week`,
  `channel`, `vendor_group`, `po_validated_at_entry`, `exception`, `exception_type`,
  `queue_wip_start_of_week`, `invoices_processed`. Planted: the pilot vendor group's
  emailed-invoice exception rate falls from 13.6% to 5.2% over five weeks on a p-chart with
  unequal subgroup sizes; a control group stays near 13%; a month-end volume spike in week 4
  raises the queue without raising the exception rate, for the Little's Law exercise.

## Takeaways

- Generate from the verified cause, choose against criteria the sponsor agreed before scoring,
  and let the matrix be a conversation.
- A pilot has a prediction with a number, a stop rule written in advance, and the same
  operational definition as the baseline; anything else is a demonstration.
- Prevention beats detection at source beats downstream inspection; a checklist is a reminder,
  and the residual risk is always written down.
- Little's Law turns a queue into arithmetic; the flow countermeasure lives at the release step
  or the constraint, not at the entry.

## Cumulative check (2 items from weeks 4 and 6)

**CC7.1.** A Green Belt starts a pilot on a scheduling change and, after nine working days,
reports that the daily mean wait has fallen from 58 to 41 minutes and asks to declare the pilot
successful. The baseline I-MR chart had 30 points and was stable. The best response is:
A. Accept the result; a 17-minute drop is larger than the cause effect · B. Add the nine pilot
points as a second stage on the baseline chart and wait for about 20 points before reading a
shift ✅ · C. Recompute the control limits using the nine pilot points · D. Run a capability
study on the nine points to confirm the improvement
`[B3 · G4 · Apply · HC · S · PRAC]` — Stability is read on the same chart with enough points
in the new state; recomputing limits from nine points (C) hides the shift you are looking for,
and capability (D) is meaningless before stability is stated.

**CC7.2.** Before choosing a countermeasure, a team re-reads its week 6 result: "two-sample t,
p = 0.03." Nothing else is written. To satisfy rubric item A3 and select against it, the team
must first:
A. Rerun the test with a larger sample so p falls below 0.01 · B. Switch to a one-way ANOVA
because there may be more than two groups · C. State the difference between the group means
with its confidence interval and write what it means in the process's units ✅ · D. Convert
the p-value to a sigma level for the sponsor
`[C2 · G5 · Analyze · NEU · S · PRAC]` — A p-value alone is not a verification; the effect
size and its interval are what the pilot prediction is built from, and a smaller p (A) adds no
practical meaning.

---

v1.0 · 2026-09-20
