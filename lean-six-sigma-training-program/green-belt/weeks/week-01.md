# Week 1 — Define: Selecting, Scoping and Chartering the Project (3 h self-paced + 2.5 h live lab)

**Learning objectives.** By the end of this week the learner can:
1. Score a candidate project against five selection criteria and slice it to a bounded
   Green Belt scope (8 weeks of learning, closure within 6 months).
2. Write a charter whose problem statement passes the "no cause, no blame, no solution"
   rubric and whose goal, scope, metric, team and timeline a sponsor can sign.
3. Build a stakeholder map that names at least one resistance risk and a planned response.
4. Translate one voice-of-the-customer statement into a measurable critical-to-quality
   characteristic with a unit, a target and a stated specification basis.
5. Produce a SIPOC at 5–8 steps whose start and stop points match the charter.

Rubric items in play this week: **D1–D4** in
[`../project/review-rubric.md`](../project/review-rubric.md). Read them first; the project
is run toward the rubric.

---

## 1.1 Project selection and scoping (30 min)

**Hook.** Most Green Belt projects that fail do so in week 1, and the failure stays invisible
for two months: too big, a metric nobody can measure, or a sponsor who has already chosen
the answer. You can fix all three now for the cost of an hour.

**Teach.** A Green Belt project is a bounded DMAIC project on a process you touch, with a
primary metric you can measure within two weeks, a cause you do not yet know, and a sponsor
who owns the process. Test a candidate against five criteria:

| Criterion | Passes when | Fails when |
|---|---|---|
| Recurring | The problem happens weekly or more often, so a baseline and an after-measure both fit inside the course | A one-off event, a project already in flight, a seasonal problem you cannot re-measure |
| Measurable | You can name a primary metric and imagine its data collection plan | The metric is "satisfaction" with no instrument, or lives only in someone's memory |
| Cause unknown | The team does not agree on the cause; several plausible theories exist | The sponsor has already bought the countermeasure; the project is implementation, not DMAIC |
| Bounded | One process, one site or unit, one product family; start and stop points fit on a SIPOC | "Order-to-cash," "discharge hospital-wide," "onboarding" |
| Owned | A sponsor who can approve process changes signs the charter | The process owner sits in another division and has not been asked |

Sizing is the criterion learners get wrong most. A problem that is too big is sliced, not
abandoned: by **location** (one unit, one line), by **product or request type** (one
family), or by **segment of the flow** (order entry to release, not to shipment). The slice
must still be a problem the sponsor cares about.

Two other outcomes are legitimate. A problem with a known cause and countermeasure is a
**Just-Do-It** for a Yellow Belt PDCA cycle (noting Deming's PDSA), not a DMAIC project. A
problem that crosses three functions, needs a designed experiment, or carries a six-figure
target is a **Black Belt project**; say so, and charter the Green Belt-sized slice inside it.

**Show (MFG).** A powder-coating cell scores three candidates. Numbers are illustrative.

| Candidate | Recurring | Measurable | Cause unknown | Bounded | Owned | Decision |
|---|---|---|---|---|---|---|
| Coating thickness out of specification; about 8% of panels reworked | Daily | Microns per panel, gauge in the cell | Four theories on the floor | One cell, one product family | Cell supervisor's manager | **Select** |
| Late deliveries to the largest customer | Weekly | On-time delivery | Partly; everyone blames the rework | Order-to-ship across four departments | Plant manager | Too wide; the thickness slice sits inside it |
| Powder waste in the booth | Daily | kg per shift | No; the reclaim filter is known to be undersized | One booth | Cell supervisor | Just-Do-It: replace the filter, check the result |

**Try.** Score your own candidate on the five criteria. If it fails "bounded," write three
possible slices and pick one with your sponsor before the live lab. Bring the table.

---

## 1.2 The charter (40 min)

**Hook.** A charter is a contract about a gap, not a plan to close it. Every sentence a
sponsor signs that assumes a cause or a countermeasure is a sentence you will have to
un-sign in week 6.

**Teach.** The program's one-page charter template (`project/charter-template.md`) holds
six parts.

1. **Problem statement.** What, where, since when, how big, why it matters; no cause, no
   blame, no solution. This is the Yellow Belt rubric
   ([`../../yellow-belt/templates/problem-statement-rubric.md`](../../yellow-belt/templates/problem-statement-rubric.md))
   at a higher standard: at Green Belt "how big" is a measured baseline with its period and
   sample size. If you have no baseline yet, write a placeholder and the date by which the
   baseline will exist. Never reconstruct a baseline from memory.
2. **Goal statement.** The same metric moved from the baseline value to a target value by a
   date. The target is negotiated with the sponsor and the customer requirement (1.4); write
   where it came from.
3. **Scope.** Start and stop points from the SIPOC (1.5) and a two-column in/out list. The
   "out" column is what keeps the project alive when someone asks for more in week 5.
4. **Primary metric with a draft operational definition.** The unit, the start and stop
   events, the data source. Week 3 tightens this until a stranger could collect the same
   number; week 1 needs the draft so the goal statement means something. Add one
   **consequential metric**: the thing that could get worse while the primary metric
   improves (rework falls, scrap rises; discharges speed up, readmissions rise).
5. **Team and roles.** Sponsor, process owner if different, Green Belt, two to five members
   who do the work, the Finance or data contact. Name people, not departments.
6. **Timeline.** The four tollgates as dates, plus the closure date within six months.

A charter contains no cause, no countermeasure, and no savings figure Finance has not seen;
a business-case sentence is fine, the money goes in after week 8.

**Show (HC).** Charter for the healthcare vertical case. Numbers are illustrative, chosen to
sit inside the range published discharge studies report.

> **Problem statement.** Since March, on the 32-bed medicine unit 4B, the interval from
> discharge order signed to patient departure has a median of 214 minutes and a 90th
> percentile of 410 minutes (n = 412 discharges, April–June, EHR timestamps), against the
> 120-minute target agreed with bed management. Each delayed departure holds a bed while
> emergency department patients board; ED boarding for admissions to 4B had a median of 156
> minutes over the same period.
>
> **Goal.** Reduce the median order-to-departure interval on 4B from 214 to 150 minutes by
> 31 January, with the 90th percentile below 300 minutes and no increase in the 30-day
> readmission rate (consequential metric).
>
> **Scope.** Start: discharge order signed in the EHR. Stop: bed status set to "vacant" by
> the unit clerk. In: 4B, discharges to home or home with services. Out: transfers to other
> facilities, deaths, the ED boarding process itself, pharmacy staffing.
>
> **Primary metric (draft operational definition).** Minutes between the EHR timestamp
> "discharge order signed" and the EHR timestamp "bed vacant," per discharge, reported as a
> weekly median. Source: the bed-management extract, pulled Mondays.
>
> **Team.** Sponsor: nursing director, medicine. Process owner: 4B nurse manager. Green
> Belt: the unit's quality nurse. Members: a charge nurse, a case manager, a hospitalist, a
> unit clerk. Data contact: clinical informatics analyst.
>
> **Timeline.** Tollgate 1 week 2; Tollgate 2 week 4; Tollgate 3 week 6; Tollgate 4 week 8;
> closure with 30 days of monitored control plan by the end of month 4.

Read the problem statement again. A hospitalist who believes the cause is pharmacy and a
case manager who believes it is transport can both sign it. That is the test.

**Try.** Draft your charter in the template before the live lab. Mark every number with its
source and period. Circle any sentence that names a cause, a person or a fix; you will
rewrite those live.

---

## 1.3 Stakeholder analysis (25 min)

**Hook.** The countermeasure you pilot in week 7 changes someone's work. If you meet that
person for the first time in week 7, the pilot fails, and the failure is your design
decision, not their attitude.

**Teach.** A stakeholder map lists everyone the project affects or depends on and rates each
on **impact** (how much the project changes their work) and **influence** (how much they can
help or stop it). For each high-impact or high-influence stakeholder record their current
position (supportive, neutral, resistant, unknown) and the position you need. Where the two
differ, that is a **resistance risk**, and it gets a planned response with an owner and a
date. Rubric item D4 requires at least one; a map with only supporters has not been thought
through.

Resistance is not a character flaw. People resist changes that cost them time, status,
control or certainty, and they are usually right about the cost. So the response is rarely
"communicate more"; it is to involve them in the measurement so they trust the data, put
their constraint into the scope, give them the pilot's stop rule, or take the item to the
sponsor because it is above your authority.

The sponsor is a stakeholder too. Agree now how often you meet (30 minutes every two weeks
is the default), what you bring (one page), and what they do (remove the obstacle you name,
attend tollgates, sign the charter and the control plan).

**Show (TXN).** A commercial insurance quote team charters a project on quote turnaround.

| Stakeholder | Impact | Influence | Now | Needed | Risk and planned response |
|---|---|---|---|---|---|
| Underwriting manager (sponsor) | High | High | Supportive | Supportive | None; biweekly 30-minute review |
| Underwriters (6) | High | Medium | Neutral to resistant | Supportive | Risk: any intake checklist looks like intake pushing work onto them. Response: two underwriters on the team; they write the definition of "complete submission" in week 3 |
| Brokers (top 12 by volume) | Medium | High | Unknown | Neutral | Risk: a new submission form is seen as friction. Response: broker-relations lead joins the VOC interviews this week; no form changes before a cause is verified |
| Pricing team | Medium | Low | Supportive | Supportive | None; one member on the team |
| IT (workflow system) | Low now, high in Improve | Medium | Unknown | Neutral | Risk: any system change queues behind the Q4 release. Response: raise at Tollgate 1 so the sponsor can hold a slot; scope states no system change is needed to reach the target |

**Try.** Map your stakeholders. Name one resistance risk you would rather not write down,
and write it down with a response.

---

## 1.4 Voice of the customer → critical-to-quality (45 min)

**Hook.** "Faster" is not a requirement. "Within two hours of the order, for 95% of
patients" is a requirement. The distance between those sentences is this section.

**Teach.** The **voice of the customer (VOC)** is what customers say they need, in their
words. A **critical-to-quality characteristic (CTQ)** is a measurable requirement translated
from it. The **CTQ tree** does the translation:

1. **Need**: the customer's statement, verbatim.
2. **Drivers**: the two to four things that must be true for the need to be met.
3. **CTQs**: for each driver, one measurable characteristic with a **unit**, a **target**,
   and a **specification limit** with its **basis** (the document or person it comes from).

Where VOC comes from, in order of trust: complaint and return data; interviews (five to
eight customers, 20 minutes, open questions, verbatim notes); observing the customer use the
output; surveys last, because they answer the question you asked. Internal customers count,
and the next step in the process is usually the right one to start with. Rubric item D3
requires the customer to be named.

Two vocabulary rules. **Specification limits come from the customer**, through the CTQ tree,
a drawing or a contract. **Control limits come from the process** and arrive in week 4.
Never write "what we usually achieve" as a specification. And not every CTQ is two-sided:
turnaround time has an upper limit only; a dimension has both.

**When not to use a CTQ tree.** When the requirement is already written and measured (a
drawing tolerance, a service-level agreement), cite the source instead. Do not use the tree
to invent a target the customer never expressed, and do not build one with fifteen CTQs; a
project has one primary metric, and the tree's job is to justify it.

**Show (MFG).** The powder-coating cell's customer is an OEM assembler whose complaint
history reads "coating fails in the field" and "we reject panels at receiving." Interviews
with the assembler's receiving inspector and field-service lead produce:

| Need (VOC, verbatim) | Driver | CTQ | Unit | Target and limits | Basis |
|---|---|---|---|---|---|
| "The finish has to last outdoors; we get corrosion callbacks" | Coating thickness | Film thickness at five marked points per panel | µm | 75; 60 to 90 | Customer drawing note 4, citing the powder supplier's data sheet |
| | Adhesion | Cross-hatch adhesion rating | class | 4B or better | ASTM D3359 method B, named in the customer specification |
| "It has to match the other parts on the unit" | Color match | Color difference versus the master plaque | ΔE | ≤ 1.0 | Customer specification, section 6 |
| "Don't make us re-inspect everything" | Receiving rejects | Panels rejected at customer receiving | % of shipped | ≤ 0.5% | Supply agreement quality clause |

The primary metric is film thickness, because the cell's own data say thickness drives most
of the rework and the field failures cluster with thin coating. The customer's rejection
rate becomes the consequential metric. The tree turned "the finish has to last" into a
number with a unit, a two-sided limit and a citation.

**Show (HC, short).** For the discharge project the customer named is the ED charge nurse
(internal): "I need to know a bed will be free before I promise it." Driver: predictable
departure. CTQ: minutes from order to bed vacant; upper specification 120 minutes; basis:
the bed-management agreement signed with the ED in February.

**Try.** Interview two customers of your process this week (one internal counts). Build a
tree with one need, two drivers and two CTQs, each with unit, target, limit and basis.

---

## 1.5 SIPOC at Green Belt altitude (20 min)

**Hook.** You built SIPOCs at Yellow Belt. At Green Belt the SIPOC has one extra job: it
settles the scope argument in writing before anyone maps anything.

**Teach.** Build it middle-out: steps and boundaries first, then outputs and customers with
their requirements, then inputs and suppliers. Green Belt differences:

- **5–8 steps.** Fewer is a black box; more is mapping, which is week 2.
- **The start and stop points are the charter's scope.** Copy them word for word. If the
  charter says "from order signed" and the SIPOC says "from order written," you have two
  projects.
- **Requirements come from the CTQ tree**, not guesswork.
- **Inputs carry their own requirement.** An incomplete input is the most common upstream
  cause of a downstream problem, and the first place a %C&A number (week 2) will live.

**Show (TXN).** SIPOC for "commercial quote request to quote issued."

| Suppliers | Inputs (requirement) | Process (start: request received in the intake mailbox; stop: quote letter sent) | Outputs | Customers (requirement) |
|---|---|---|---|---|
| Brokers | Submission (complete: application, loss runs, schedule of values) | 1 Log and clear the request → 2 Triage to an underwriter → 3 Gather missing information → 4 Rate and price → 5 Underwriter review and terms → 6 Prepare and send the quote | Quote letter; declination; request for information | Broker (quote within 3 working days; terms clear); underwriting manager (loss ratio within appetite) |
| Rating system vendor | Rates current | | | |
| Loss-run providers | Loss runs less than 30 days old | | | |

Step 3 is there because it happens, not because anyone designed it. The SIPOC records the
process as it runs.

**Try.** Build your SIPOC with two people who work the process. Confirm the start and stop
points match the charter.

---

## 1.6 Leading the project from the first number (20 min)

**Hook.** In eight weeks you stand in front of your sponsor with one page and ten minutes.
Everything you do this week is the first draft of that page.

**Teach.** Three habits start now. **Run the team, do not carry it:** a first meeting of 45
minutes, charter read aloud, each member asked what would stop them signing it; data
collection assigned to the people who touch the data. **Manage the sponsor with one page:**
problem, phase, finding, the one decision you need. **Handle data honestly from the first
number:** three things end a review with a resubmission request, and all three tempt you in
week 1: a baseline reconstructed from memory, an operational definition changed between
before and after, and inconvenient points dropped. Write the definition down now, date it,
and keep every number.

**Show (HC).** The 4B sponsor asks whether the project can "just fix the pharmacy delay."
The reply the sponsor accepts: "Pharmacy is one of four theories for the week 5 fishbone.
If the data verify it, the countermeasure goes there. If we start there and it is not the
cause, we spend the pilot weeks on nothing." The sponsor is not wrong to ask; they inherited
a unit where the last three fixes were chosen the same way.

**Try.** Book the first team meeting and the biweekly sponsor slot before the live lab.

---

## Live lab — run of show: the charter clinic (150 min)

**Format.** Live virtual, 8–20 learners, one instructor (producer above 12). Every
learner's draft charter is on the shared board before the session; Practicum-track learners
bring the charter drafted from their vertical case. Four passes, each rewriting one part of
every charter in public against a rubric line. Nobody presents; everybody rewrites.

**Outcomes.** Every learner leaves with a charter v2 (cause-free, quantified problem
statement; goal on the same metric; start and stop points; in/out list), one CTQ with unit,
target, limit and basis, one named resistance risk with a response, and the list of what
must be true before the sponsor signs this week.

### 0:00–0:10 — Setup and the rule
- Frame: "Every charter in this room will be rewritten today, including the good ones. The
  rewrite is the deliverable."
- Show D1–D4 with their point values. Poll: "Which line is your charter weakest on right
  now?" Save the answers for the close.
- Rule: a comment on a charter is a rubric line plus a proposed sentence, not an opinion.

### 0:10–0:35 — Pass 1: the problem statement (25 min)
- Pairs, 4 minutes each way: the partner searches for "because," "due to," "lack of," "no
  [noun]," a person or team used as an explanation, and any verb that is a fix; then circles
  every number and asks for its source and period.
- Instructor pulls three statements onto the main board (one clean, one with a smuggled
  solution, one with a baseline from memory); the room rewrites the flawed two aloud.
- **Checkpoint:** every statement has a measured baseline with period and n, or a dated
  placeholder. A statement without a number does not proceed to pass 2; that learner drafts
  a one-week baseline collection plan and rejoins at pass 3.

### 0:35–1:00 — Pass 2: scope, metric and size (25 min)
- Each learner writes start and stop points and the in/out list. Instructor reads five aloud:
  "Does this fit 8 weeks plus 6 months? Name the slice."
- Metric test in pairs: "Read me your operational definition. What is the first number you
  would write down tomorrow, and where does it come from?" A metric that cannot pass in 60
  seconds is rewritten now.
- Instructor names the consequential metric for two charters that have none.

### 1:00–1:25 — Pass 3: VOC to CTQ (25 min)
- Learners post one CTQ line: customer, need verbatim, CTQ, unit, target, limit, basis.
  Instructor walks the board with one question per line: "Who said so?" A basis of "team
  judgment" or "industry standard" is rewritten to name a document or a person, or marked
  as an interview to run this week.
- Watch for control limits dressed as specifications ("we normally hit 2.5 hours, so the
  spec is 2.5 hours"). Say the rule once: specifications come from the customer; control
  limits come from the process, and you do not have those yet.

### 1:25–1:35 — Break

### 1:35–2:00 — Pass 4: stakeholders and the sponsor conversation (25 min)
- Each learner names the one stakeholder whose position must change and the response.
  Triads, 3 minutes per learner: one plays the sponsor, one the resistant stakeholder, one
  the Green Belt asking for one thing. Rotate. Debrief: was the thing asked for something the
  sponsor could actually give?
- Instructor collects the resistance risks on the board without names; the usual three are
  "more work for us," "the data will be used against us," "a system change we cannot get."

### 2:00–2:22 — The rewrite (22 min)
- Silent work: every learner rewrites charter v2 from the four passes. Instructor floats with
  the sponsor test: "Could the person who disagrees with you about the cause sign this?"
- Learners mark each of D1–D4 as ready, needs data, or needs the sponsor.

### 2:22–2:30 — Close
- Re-run the opening poll; say what moved the weakest lines.
- Assignment: sponsor signature on charter v2 by the end of the week. Week 2 prework: walk
  your process once with a stopwatch and a notebook; the VSM lab cannot run on a process
  nobody has watched.

### Facilitator notes and failure modes
- **A charter arrives with the countermeasure built in** ("implement a discharge lounge").
  Do not argue with it. Ask what gap it is meant to close, write that gap as the problem
  statement, and park the countermeasure on a list the learner shows the sponsor in week 7
  if the data point there.
- **A project is three projects.** Have the learner write the three slices on the board and
  ask the room which one the sponsor would sign this week. Sizing is the sponsor's call; the
  learner leaves with a question, not an answer.
- **No baseline and no data source.** The project's first task is a one-week tally. Do not
  accept a baseline from memory to keep the session moving.
- **The sponsor has not engaged.** Escalate to the cohort lead the same day; a learner whose
  sponsor cannot be reached in week 1 moves to the partner-project pool by week 2.
- **Learners critique each other's causes instead of statements.** Redirect every time:
  "That is a week 5 conversation. Today we only decide whether the sentence is signable."
- **Protect the rewrite.** If passes overrun, cut pass 4 to the triad role-play. Never
  shorten the 22-minute rewrite; a clinic without the rewrite is a critique session, and
  critique does not change charters.
- **Virtual logistics.** One board frame per learner, pre-loaded; a visible timer; breakout
  audio checked before pass 4.

---

## Project work this week

| Rubric item | Deliverable at the coaching checkpoint | Full marks look like |
|---|---|---|
| D1 Problem statement | Charter v2, problem statement | Measured baseline with period and n; no cause, blame or solution; every team member has read it and would sign it |
| D2 Charter and scope | Charter v2 signed by the sponsor | Start/stop points; in/out list; named team; tollgate dates; primary metric with a draft operational definition and a consequential metric |
| D3 VOC → CTQ | CTQ tree, one page | Customer named (internal counts); at least one CTQ with unit, target, limit and basis; two customer contacts recorded with dates |
| D4 SIPOC and stakeholders | SIPOC and stakeholder map | 5–8 steps whose start and stop match the charter; input requirements filled; at least one resistance risk with owner, response and date |

Also: first team meeting held; biweekly sponsor slot booked; process walk scheduled as
week 2 prework. Practicum-track learners submit the same four deliverables on the vertical
case; the practicum instructor signs as sponsor.

---

## Coaching prompts

1. "Read me the problem statement. Who on your team disagrees with you about the cause, and
   have they read this sentence?"
2. "What number will you write down on Monday morning, where does it come from, and who else
   could get the same number without asking you?"
3. "Which stakeholder would you rather not have listed, and what did you write as the
   response?"

---

## The week's vertical case dataset

Each learner follows one vertical case through all eight weeks (case files and data live in
`practicum/`; where a case file is not yet in the folder, this description is its
specification). The week 1 pack contains:

- **A one-page situation brief** written from the sponsor's point of view, containing a
  cause and a preferred countermeasure. Planted: the learner must remove both from the
  problem statement.
- **A 12-week baseline extract** (CSV), one row per unit of work, with start and stop
  timestamps and three or four context columns. MFG: `panel_id`, `order_id`, `color_code`,
  `line_shift`, `coat_date`, `thickness_um_p1` to `_p5`, `rework_flag`. HC: `encounter_id`,
  `order_signed_ts`, `bed_vacant_ts`, `disposition`, `weekday`, `attending_group`. TXN:
  `request_id`, `broker_id`, `received_ts`, `quote_sent_ts`, `line_of_business`,
  `submission_complete_flag`, `underwriter_id`. Planted in all three: about 4% of rows have
  the stop timestamp before the start, and one week is missing. The learner must find both,
  report them, and not silently delete them.
- **Six VOC verbatims** from two customer groups; two are opinions about causes rather than
  needs. Planted: only four translate into CTQs.
- **A stakeholder list** of eight names with roles; two carry a resistance risk the brief
  hints at but does not state.
- **A customer document** (drawing note, bed-management agreement, service-level clause)
  giving the specification limit and its basis, so the CTQ tree can cite it.

Baseline values in the briefs: MFG, 7.8% of panels outside 60–90 µm at first inspection
(n = 2,340 panels, 8 weeks); HC, median 214 minutes, 90th percentile 410 minutes (n = 412
discharges, 12 weeks); TXN, median 6.4 working days from request received to quote sent,
58% of submissions complete on arrival (n = 1,180 requests, 12 weeks). Illustrative, chosen
to sit inside ranges reported for these process types.

---

## Takeaways

- Select for recurring, measurable, cause-unknown, bounded and owned; slice rather than
  abandon, and say so when you see a Just-Do-It or a Black Belt problem.
- A charter is a contract about a gap: measured baseline, goal on the same metric, start and
  stop points, a metric a stranger could collect, no cause and no countermeasure.
- Specifications come from the customer through a cited CTQ; control limits come from the
  process and arrive in week 4.
- The resistance risk you would rather not write down is the one the reviewer looks for.

---

v1.0 · 2026-09-20
