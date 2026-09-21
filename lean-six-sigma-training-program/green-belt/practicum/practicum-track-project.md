# The Practicum-Track Project — One Simulated Case, End to End

*The route to the credential "Certified Lean Six Sigma Green Belt (Practicum)". You work one
vertical case as a full DMAIC project, on the cohort's eight-week calendar, through the same
four tollgates, against the same 100-point rubric, with a practicum instructor in the
sponsor's chair. This page is how you are routed here, what happens at each gate, how every
rubric item is scored when the sponsor is simulated, what the label on the credential can and
cannot claim, and how you convert to the standard credential later with a real project.*

The policy this page implements:
[`../project/partner-pool-and-practicum-track.md`](../project/partner-pool-and-practicum-track.md)
§3. Calendar and gates: [`../README.md`](../README.md). Rubric:
[`../project/review-rubric.md`](../project/review-rubric.md). Gate standard:
[`../project/tollgate-checklists.md`](../project/tollgate-checklists.md). Where this page and
the policy could be read two ways, the policy governs.

**Who reads this page.** You, your coach, the practicum instructor, and the reviewer. It names
the data packs and when each is released; it does not say what is planted in them. That is
section 4 of your case file, which you do not receive, along with `data/generate.py`. Knowing
the release schedule is not a spoiler — on a real project you also know when the extract is
coming.

---

## 1. How you are routed here

Three routes in, and no others.

| Route | Condition | Who owns the decision | When it is written |
|---|---|---|---|
| **A · No match** | You enroll as an individual with no employer project, and the partner-pool coordinator cannot match you from the pool three weeks before day 1 | Partner-pool coordinator | Before day 1 |
| **B · Collapse after Tollgate 2** | Your employer or partner project stops after Tollgate 2 and you choose the track rather than finishing the surviving slice (policy §2.7) | You, on the coach's and cohort lead's written options | Within 5 business days of the stop decision |
| **C · No process to touch** | You are between roles, or in a role with no process inside anyone's reach — and the pool has no remote-observable match | Partner-pool coordinator | Before day 1 |

**Routes that do not exist.** A project that collapses *before* Tollgate 2 is re-matched from
the pool within 10 business days; you do not land here for a sponsor's early change of mind. A
corporate learner without a project is a sponsor-readiness question for the account, handled in
the cohort playbook — the program does not sell the Practicum as a way around it. And you
cannot ask for this track because the simulated data look tidier or the calendar looks kinder.
It is not faster, not cheaper, and not sold separately.

**The route note.** Before your first gate you sign a one-page note, countersigned by the
cohort lead and filed with your project record. It says four things in the words this page
uses: the credential is named with the parenthetical on every surface; it cannot claim a
verified improvement on a real process; the partner pool stays open to you afterwards; and the
conversion route in §7 exists and costs the published project-review fee. Nobody should learn
any of that in week 6.

**You pick the vertical.** Manufacturing and supply chain
([`case-mfg.md`](case-mfg.md) — bracket line B, hole position), healthcare
([`case-hc.md`](case-hc.md) — discharge order to departure), or transactional and services
(`case-txn.md` — accounts payable invoice entry). Pick the vertical closest to the work you
want next, not the one whose data type you find least frightening; the labs expose you to all
three regardless. You may switch once before Tollgate 1, with the charter re-signed. After
Tollgate 1 you do not switch, because the baseline you are about to fix at Tollgate 2 belongs
to one process.

---

## 2. One case, end to end, on the same calendar

The live labs run on all three verticals. **Your project is one case, worked whole.** You do
not sample three cases, and you do not run the MFG Gage R&R in the week 3 lab and then write it
up as your own project's measurement system analysis unless MFG is your case.

The calendar is the calendar in [`../README.md`](../README.md), unchanged: self-paced hours and
the live lab each week, tollgates in weeks 2, 4, 6 and 8, project completion up to six months
after week 8. In practice a practicum project closes four to eight weeks after week 8, because
the monitoring pack that ★ C1 needs is released on a schedule rather than lived through. The
six-month limit still applies, and certification still waits for closure.

### 2.1 What you receive, and when

Packs are dated and released on request, the way an organization releases an extract. **Asking
for the right data at the right time is part of what is scored** — your case file's section 2
says which request belongs to which week.

| Week | What you receive | How it is released |
|---|---|---|
| 1 | The sponsor's brief as received, the process description, the customer document | With your case pack on day 1 |
| 2 | The go-see notes and the main log or extract (MFG: `data/mfg-bracket-line.csv`) | Given |
| 3 | The measurement study as the process runs it (MFG: `data/mfg-gage-rr.csv`); the repeat study under a written method after you have interpreted the first | Second study on request, after your interpretation is on file |
| 4 | The maintenance, engineering or operational change log | **On request only.** A learner who finds points beyond the control limits and does not ask what happened those days has not investigated a special cause |
| 7 | The pilot pack for the countermeasure you chose (MFG: `data/mfg-pilot.csv`) | **Only after your pilot design and written prediction are on file.** There is no way to see the result first |
| 8 | The simulated cost table (MFG, TXN) or mission-metric table (HC) | On request, at the C3 conversation |
| Closure | The 30-day monitoring pack | After the instructor accepts your control plan in the sponsor role |

Two rules hold across all of it. **The pack you get in week 7 is generated from the
countermeasure you chose**, not from the one the case designer preferred; the instructor holds
a response pack for every countermeasure a Green Belt could reasonably pick. And **the
data-ethics stop applies to simulated data exactly as it does to a real extract**. An
impossible value dropped without a note, an operational definition that changes between before
and after, a baseline window chosen after you saw the chart — each ends the review with a
resubmission request and a note to the assessment lead, and "it was only simulated" is not a
mitigation. The habit is the point.

Software is unchanged: every analysis in your case file's section 2 is specified in Minitab,
Excel, and R or Python side by side, and
[`../templates/software-parity.md`](../templates/software-parity.md) is the reference.

---

## 3. The instructor in the sponsor's chair

A practicum instructor — a certified program instructor who is **not** your coach for this
project and not your reviewer — plays the sponsor, and where the case needs them, the process
owner and the Finance partner or mission-metric validator. The separation is a staffing
requirement, not a preference: a cohort that cannot staff both chairs separately borrows a
practicum instructor from the bench. Either way, nobody who sat in the sponsor's chair or the
coach's chair scores your project
([`../delivery/facilitator-and-coaching-system.md`](../delivery/facilitator-and-coaching-system.md)
§3).

They sign the charter *as instructor acting as sponsor*, and they sign Part A of the sponsor
attestation with the words *instructor acting as sponsor (Practicum)*
([`../project/sponsor-verification-and-finance-validation.md`](../project/sponsor-verification-and-finance-validation.md)).
The charter's **Source** line is ticked `Practicum`
([`../project/charter-template.md`](../project/charter-template.md)).

### 3.1 What the role does and does not do

| In role, the sponsor… | Out of role, the instructor… |
|---|---|
| Answers what the brief knows: history, priorities, who works the process, what was tried before | Does not answer what the brief does not know — "I don't know, ask the process owner" is a real sponsor answer and is used |
| Makes the five decisions the gate allows: proceed, proceed with conditions, hold, re-scope, stop | Does not soften a hold to keep you on the calendar. Most projects take one hold; the track is not an exception |
| Pushes back once on scope, and once on a conclusion they did not expect | Does not tell you which test to run, which chart fits the data type, or what your effect size means. That is the coach's conversation, in a different room |
| Releases data packs, dated, and states the calculation basis they will accept | Does not release the pilot pack early, even when the calendar is tight |
| Holds a diary: twenty-five minutes per gate, one sponsor slot between gates | Does not answer at 9 p.m. on a Tuesday because the learner is behind. A sponsor who is always available is not a simulation |

The instructor names the hat before answering when it matters: *as sponsor*, *as process
owner*, *as your Finance partner*. Three roles in one chair is the track's one concession, and
saying which one is speaking is how it stays honest.

---

## 4. The four tollgates with a simulated sponsor

Unchanged at every gate: ten minutes, one page, twenty-five minutes in the room; the
[`../templates/tollgate-one-pager.md`](../templates/tollgate-one-pager.md) page is the record,
never a deck; the reviewer's gate note lands within five business days with each due rubric
item marked *evidenced*, *at risk* or *not evidenced*, plus the data-ethics line and the
coaching flag. Read the gate-by-gate checklists as written — they apply to you in full.

### Tollgate 1 — Define (week 2)

What changes: the signature is the instructor's, dated, in role, and the process boundary is
whatever the case brief says it is. Charter a stop point outside it and you get a re-scope, not
a shrug.

The gate's real test is the brief itself. Every case brief arrives with a cause and a
countermeasure already in it — the MFG production manager wants 100% inspection on nights and a
gauge refresher for "the newer operators"; the HC director of nursing wants a discharge-by-11
leaderboard and a nurse checklist; the TXN brief names its own cause and its own fix in the same
breath. Your week 1 job is to take both out of the problem statement
and onto a list for weeks 6 and 7, and then to say that to the person who wrote them, in the
room. The instructor plays the sponsor who meant it.

### Tollgate 2 — Measure (week 4)

What changes: nothing about ★ M3 or M4, and one thing about the baseline. Once the instructor
accepts it in role, **the baseline is fixed** — you do not get a cleaner extract, and the
impossible records and blanks in your log stay handled in writing rather than quietly. The
change log is released only if you ask for it, which is how a real engineering log works.

The Finance partner or mission-metric validator (the instructor, saying so) states in one line
the calculation basis they will accept at closure, drawn from the case's simulated table. Get
that line at this gate; a basis argued at closure is a closure delay here as anywhere.

### Tollgate 3 — Analyze (week 6)

What changes: the sponsor believed something, and on these cases at least one widely believed
cause does not survive the test. The instructor plays the sponsor hearing that, and asks you to
defend the sentence — not the p-value, the sentence with its effect size that they would act
on. A real project gives you that conversation once, unrehearsed, with your credibility in it.
Here it is on the calendar, and your coach debriefs it afterwards.

Your written prediction for Improve goes on the page **at this gate**, because the week 7 pilot
pack is not released until it exists. On a real project the prediction is a discipline you can
skip. Here the data enforce it.

### Tollgate 4 — Improve/Control (week 8)

What changes: the countermeasure is approved in role, the control-plan owner is named in role
(the case's process owner — without a name here, ★ C1 cannot be earned), and there is no live
handover to a person with real authority. What follows instead is a simulated 30-day monitoring
pack, released after the instructor accepts your control plan, with one planted drift in it. Your
response plan either catches that drift or does not, and the reviewer can see which.

The gate is also the rehearsal for closure, in the same ten minutes and one page. Then the
closure submission check in
[`../project/tollgate-checklists.md`](../project/tollgate-checklists.md) runs unchanged, with
your coach, before you submit.

---

## 5. How the rubric is scored when the sponsor is simulated

Same rubric. Same 100 points, same weights, same **pass = 75 with every mandatory item
earned**. There is no score cap, no separate cut score and no simplified rubric for this track.
The reviewer is an independent certified Black Belt or Master Black Belt who is neither your
practicum instructor nor your coach, and who scores blind to which cohort produced the file.

The reviewer holds the case's answer key. **The key is a check on arithmetic, not a marking
scheme for conclusions.** A learner who chooses a defensible test the key did not use, checks
its assumptions and reads it correctly earns the item; a learner who lands on the key's
conclusion through the wrong test for the data type does not.

### 5.1 Items whose evidence comes from the instructor in role

| Item | Scored from |
|---|---|
| D2 Charter and scope | The charter signed *as instructor acting as sponsor*, post-clinic, with start/stop inside the case's process boundary |
| D3 VOC → CTQ | The case's customer document (the MFG drawing note, and the equivalent document in the HC and TXN packs) and the customer it names — an internal customer counts |
| M2 Data collection plan | Your operational definition, plus the data-access line the instructor gave you with a date |
| C1 owner, C3 validator | The instructor's decisions in the process-owner and Finance or mission-metric roles |
| S1 Tollgate narrative | The four one-pagers and the decisions written on them in the room |

Everything else — M1, ★ M3, M4, A1, A2, ★ A3, A4, I1, I2, I4, C2 — is scored exactly as it is
on a real project, from your analysis of a messy dataset.

### 5.2 ★ M3 Measurement system analysis attempted (6)

The route that gets used most on real projects is **closed by design on all three cases**. The
MFG station reads position with a hand-held gauge and no written method; the HC "discharge
ready" call is a rater judgment; the TXN correction flag is a coded judgment. None of them is a
system timestamp, so "not applicable" is not available to you, and a reviewer who accepts it on
a practicum file is out of calibration. Full marks: the study run on the primary metric and on
the real thing (crossed Gage R&R, or attribute agreement against a standard), interpreted
against the thresholds in [`../templates/msa-plan.md`](../templates/msa-plan.md), and something
*done* about the result before you use the baseline. A study run, numbers reported, no
interpretation and no action scores partial. A study you decided was unnecessary scores zero and
fails the credential, whatever your total.

### 5.3 ★ A3 Root cause verified with data (10)

Unchanged in substance: an appropriate method from
[`../templates/hypothesis-test-selector.md`](../templates/hypothesis-test-selector.md),
assumptions checked and stated, the effect size with its units, and the sentence you would tell
your sponsor in plain language. A p-value alone verifies nothing here either. Two practicum
specifics: the cases are built so that the right question needs the right test — a test of means
where the cause lives in the spread, or a test of means on a TXN correction rate that is
pass/fail data, is the wrong test for the question, and the reviewer says so; and because the sponsor believed something that does not verify, A3 and A4 are read
together. Verification is what you tested, not what the room agreed.

### 5.4 ★ I3 Before/after evidence (8)

This is the item the response packs exist for. You submit the pilot design and the written
prediction; the instructor generates the pack for **your** countermeasure and dates it. Then:

- A countermeasure aimed at a verified cause moves the metric about as far as the effect size
  predicted. You are scored on reading that honestly, including on saying what a short pilot
  window cannot confirm.
- A countermeasure aimed at a cause that did not verify moves nothing. **That is not a failed
  project.** "It did not work, here is why, here is what I did next" earns full marks, as it
  would on a real process. You are scored on the reading, never on the choice.
- Same metric, same operational definition, same collection method, before and after. If you
  change the measurement method mid-project — a legitimate move after a failed measurement
  system analysis — date the change on the chart and say how much of the observed shift left
  with the gauge rather than with the countermeasure. Either choice passes if it is written
  down. An undated switch is a data-ethics stop.

### 5.5 ★ C1 Control plan handed to a named owner (7)

What cannot exist here: a signature from a person with real authority over a live process, and
a real 60 days of monitoring. What is scored: the plan complete on all five fields — metric,
method, frequency, owner, response plan — in
[`../templates/control-plan.md`](../templates/control-plan.md); the owner named and accepted by
the instructor in the process-owner role; and the plan's performance against the **30-day
simulated monitoring pack**, which is labeled *simulated* on every exhibit and satisfies the
rubric's 30-day requirement in that labeled form. The pack carries one planted drift. A response
plan that watches only the headline chart tends to see one borderline point and miss it; a plan
that watches the stratum where the cause lived, with a stated trigger and a named actor, catches
it. Saying what happened and what the response plan did is the evidence.

The 60-day `sustained` flag cannot be earned. It reads `not-applicable`, by rule, in
[`../project/sustainment-check.md`](../project/sustainment-check.md) §5 — not `false`, and never
`true`.

### 5.6 C3 Financial or mission-metric validation (4)

Scored on **classification and basis only**. Every figure you use comes from the case's
simulated table and is labeled *simulated* wherever it appears, including on the one-page
summary. Full marks look like: the benefit class named and defended (hard, soft, cost avoidance,
or clinical and service impact); a calculation basis agreed with the Finance partner in role
at Tollgate 2 that matches your metric's operational definition; no annualization beyond
the window the basis allows; and the no-double-counting question asked out loud — on a simulated
case the answer is "no other project claims this process", but the asking is the scored
behavior.

What earns nothing: a figure you invented that is not in the simulated table; a simulated figure
presented without its label; annualizing a two-week pilot; and, on the HC case, converting a
mission metric such as bed-hours released into money. Parts B and C of the sponsor form are
completed against the simulated tables and labeled the same way.

---

## 6. What the label can and cannot claim

The credential is **"Certified Lean Six Sigma Green Belt (Practicum)"**. The parenthetical is
part of the name on the badge, the PDF, the verification page, the LMS record and the alumni
directory. Badge fields read `track: practicum`, `verifiedImpact: simulated`, `sustained:
not-applicable`
([`../bok-crosswalk-and-credential.md`](../bok-crosswalk-and-credential.md) §2.3).

### 6.1 On a résumé

Write the name as issued, then describe what you did.

**Accurate:**

> Certified Lean Six Sigma Green Belt (Practicum) — 2026  
> Eight-week DMAIC project on a simulated manufacturing inspection dataset: crossed Gage R&R on
> the primary metric, stability and capability against the drawing specification, cause verified
> by analysis of variance with effect size, piloted countermeasure with a written prediction,
> control plan with a response plan. Proctored 100-item exam.

**Not accurate, and a misrepresentation the program acts on:** the name without the
parenthetical; "verified improvement"; "sponsor-verified"; a money figure from the simulated
table, with or without the word simulated attached to it; "equivalent to Green Belt".
Misrepresenting the credential — including presenting a Practicum credential as the standard one
— is grounds for revocation under the
[terms of certification](../../program-operations/terms-of-certification.md).

### 6.2 To an employer, in two sentences

*"I hold the Practicum version of the Green Belt, which means I ran the full DMAIC cycle on a
simulated case with an instructor as sponsor, and it was reviewed against the same rubric by an
independent Black Belt. What it does not include is a real sponsor and a real process, and the
verification page says exactly that — the next project I run is the one that converts it."*

That is the whole answer. It is a better interview answer than the alternative, because an
employer who reads the verification page will find it says the same thing: *"This holder's
project was completed on a simulated dataset with the instructor acting as sponsor; no
real-process impact, sponsor verification or sustainment is claimed."*

### 6.3 What it does claim

The same proctored exam at the same cut score. A full DMAIC cycle against the same rubric with
every mandatory item earned, scored by an independent reviewer. Correct use and plain-language
interpretation of the Green Belt toolkit on realistic, messy data. Four tollgates presented to
the ten-minute, one-page standard. Eligibility to lead a real project, and to submit it under
§7. Recertification on the same three-year cycle.

One limit worth naming early: Black Belt admission requires a certified Green Belt **and** one
completed DMAIC project on a real process. The Practicum credential satisfies the first only. A
later real project completes it — and is the same project that converts the label.

---

## 7. Converting to the standard credential

You lead a real, sponsored DMAIC project — at an employer, or through the partner pool, which
stays open to you for exactly this purpose — and submit it for independent review against the
full rubric with the full sponsor verification.

| Carries over | Does not carry over |
|---|---|
| The exam: no retake, within your current recertification cycle | Any rubric item from the practicum project. The new project is scored whole, from D1 |
| Your original issue date, shown alongside the upgrade date | The practicum evidence. You do not re-file a simulated measurement system analysis against a real process |
| Your Practicum record, retained and superseded rather than erased; its verification URL resolves to the upgraded record | The simulated cost or mission-metric table. Finance or the mission-metric executive validates the real figure or no figure is claimed |

On a pass the credential is reissued as "Certified Lean Six Sigma Green Belt", the sustainment
check runs on the real project at day 90 like any other, and the `sustained` flag moves off
`not-applicable`. The cost is the published project-review fee — a review by a named independent
reviewer is real work by a real person, and that is what the fee buys. If your recertification
cycle has lapsed, recertify first, then submit.

---

## 8. What is deliberately not offered

Consistent with the published refusals
([what we refuse](../../program-operations/what-we-refuse.md)):

- **No "Practicum Plus", and no tier between the two credentials.** Not a second simulated
  case, not an extra module, not an advanced practicum, not a "verified practicum". Belt
  inflation is on the program's own list of ways these businesses fail, and a tier invented
  between two honest names is belt inflation with better manners.
- **No upgrade by fee alone.** There is no amount of money, no additional exam, no extra
  coursework and no volume of simulated work that removes the parenthetical. One thing removes
  it: a real project on a real process with a real sponsor, reviewed in full. The fee in §7 pays
  for that review; it does not buy the outcome, and a failed review after a paid one stays a
  failed review.
- **No letter that omits the label.** If an employer, an agency or an adviser asks for written
  confirmation without the parenthetical, the program declines and sends the verification page,
  which states what you did in the words above.
- **No Practicum route for a corporate cohort** in place of sponsor readiness.
- **No Practicum credential without the parenthetical, anywhere, ever.**

### 8.1 Nothing from a practicum project enters the published outcomes figures

This is a rule, not a preference. **No result from a simulated project appears in any impact
figure the program publishes** — not the sponsor-verified impact per cohort, not the
Finance-validated benefit, not the verified-improvement share, not the sustainment rate, not a
case study, not a sales deck. The simulated cost table exists to teach C3 and to be scored; it
is not an outcome. Practicum completions are published as **their own count**, labeled, with
n, in the evaluation plan and on the
[outcomes page](../../program-operations/outcomes-page.md).

What *is* published about this track: the count of completions, and the comparison between
practicum and standard-track projects — exam scores, rubric first-submission pass rate, the
mandatory-item failure profile and mean section scores
([`../evaluation/evaluation-plan.md`](../evaluation/evaluation-plan.md) §2.4). That comparison
is the track's own control chart. A practicum pass rate materially above the standard track's
means the simulated case is too clean or a response pack too generous, and the fix lands on the
case file, not on the learner. A mandatory item that fails only here names a design flaw in the
same way.

---

## 9. How the track is kept honest

- The reviewer is independent of the practicum instructor and the coach, scores blind to
  cohort, and holds the key only to check arithmetic.
- Learners rate the instructor-as-sponsor role on the same end-of-cohort items a standard-track
  learner uses for their sponsor, and those answers are read as data about the role, not about
  the instructor's likeability.
- The practicum-versus-standard comparison is read at the annual review, and the planted
  structure is made harder when it needs to be.
- The route note, the charter's `Practicum` source line, Part A's *instructor acting as
  sponsor* wording, the `simulated` labels and the `track: practicum` badge field all say the
  same thing in five places. That redundancy is deliberate: a label survives by being written
  everywhere, not by being written well once.

---
*v1.0 · 2026-09-20*
