# Week 2 — Define → Measure: Mapping the Current State and Defining the Metric (3 h self-paced + 2.5 h live lab)

**Phase:** Define → Measure · **Objective codes:** G2 (map and quantify), G8 (run the
tollgate) · **Gate:** **Tollgate 1 — Define** at the end of this week. Rubric items due:
D1–D4; started, not due: M1 and M2. Rubric: [`../project/review-rubric.md`](../project/review-rubric.md);
gate standard: [`../project/tollgate-checklists.md`](../project/tollgate-checklists.md).

**Learning objectives.** By the end of this week the learner can:
1. Build a current-state process map at process-block altitude (8–15 steps) from a dated
   go-see, showing observed variant paths with their frequencies and at least one thing the
   documented process does not show.
2. Convert the map into a value stream map with a data box per step and a timeline ladder,
   every number traced to an observation, a timestamp or a count.
3. Compute lead time, rolled %C&A and process cycle efficiency for one unit of work, state the
   time basis (calendar vs working), and convert between the two.
4. Classify a metric as continuous, count or attribute data and name the chart, the
   measurement study and the tests that type allows in weeks 3–6.
5. Present the Define tollgate on one page in ten minutes with D1–D4 evidenced, and write the
   sponsor's decision on the page before leaving the room.

---

## 2.1 The current state as observed, not as documented (35 min)

**Hook.** Your prework was to walk your process once with a stopwatch and a notebook. If the
walk matched the procedure, walk it again; you followed the procedure, not the work. Rubric
item M1 is scored on one phrase: *as observed, not as documented*.

**Teach.** At Yellow Belt you drew a swimlane map with the people who do the work. At Green
Belt the map carries numbers, and numbers are only honest if they were observed. Four rules:

1. **Follow the unit of work, not the department.** One bracket, one patient, one invoice,
   from the charter's start point to its stop point; three to five units on different days
   and shifts. One unit is an anecdote.
2. **Map at process-block altitude: 8–15 steps.** A block is where work waits, changes hands
   or changes state. A 60-box keystroke map hides the queues in detail; a 5-box SIPOC hides
   them in generality. Keep the detailed map; it returns in Analyze.
3. **Record what the procedure leaves out.** The queue in front of each step, the rework
   loop, and the workaround are never in a procedure. Draw all three with how often you saw
   them ("3 of 5 discharges", "every lot").
4. **Draw variant paths with their frequencies.** Four intake channels handled four ways are
   four paths, not one "receive invoice" box. A path seen once in five walks is drawn with
   "1/5" beside it, not erased.

Write the date, the shift and who walked with you on the map; a map without a date is a
drawing. Nobody is at fault for the gap between the procedure and the work: the procedure
describes the design, and the workarounds are the people who run the process keeping it
running. Record them, thank the people who showed you, and take the gap to the sponsor as a
finding.

**Show (HC).** Medicine unit 4E, discharge order signed to patient leaves the unit. The
documented process has six boxes: order signed → nurse completes discharge → pharmacy sends
medications → patient education → transport → departure. Five walked discharges over three
days, day and evening shifts, give eleven blocks; the five the procedure does not show:

| Observed block | Seen in | What it is |
|---|---|---|
| Order sits in the nurse's worklist until the next task break | 5/5 | Queue, median 30 min |
| Discharge prescriptions sent to central pharmacy | 5/5 (4% of records skip it: no discharge medications) | Variant path |
| Prescriptions wait in the pharmacy queue before they are filled | 5/5 | Queue; the procedure shows one box |
| Pharmacy phones with a question; nurse pages the physician | 1/5 | Rework loop |
| Patient waits for transport after the request | 5/5 | Queue |

On unit 3W the same walk gives a different map: discharge medications come from the unit's own
cabinet, so the pharmacy queue is off the path. Two units, two current states. The extract
agrees: median 185 calendar minutes on 4E, 92 on 3W.

**Try.** Redraw your prework map at block altitude. Mark every queue, rework loop and
workaround you saw, with a frequency. If you have none, walk again before the lab.

---

## 2.2 Building the value stream map (40 min)

**Hook.** A process map says what happens. A value stream map says how long each thing takes,
how long the work waits in between, and how much of it arrives usable. Yellow Belts read one;
you build one.

**Teach.** A **value stream map (VSM)** is the block map with a **data box** under each step
and a **timeline ladder** along the bottom. The data box holds, for one unit of work:

| Field | Meaning | Source |
|---|---|---|
| Process time (PT) | Touch time: minutes someone works on the unit | Stopwatch on 5–10 units; mean, range and n |
| Wait before the step | Time the unit sits before the step starts | Timestamps where they exist; otherwise count the work in process (WIP) and use Little's Law (2.3) |
| %C&A | Share of units arriving **complete and accurate**: usable without correcting, clarifying or chasing | Rated by the people at *this* step about what arrives: a one-week tally, or the rejection reasons they already keep |
| Batch size; people; systems | How many units move together; who and what the step uses | Observation |
| Changeover; uptime (MFG) | Minutes to switch product; share of time the machine is available | Time three changeovers; the machine log |

Two rules on the numbers. **The estimate goes in a note, not the box.** If the operator says
"about 20 minutes" and three timed changeovers are 31, 35 and 48, the box says 38 min (n = 3,
range 31–48) and the note says "estimated 20"; the gap is a finding. **%C&A is rated by the
receiver.** Work looks complete to the person who produced it; the person who has to use it
knows how often it is not.

The ladder has wait times on the upper rail and process times on the lower. Lead time is the
sum of both along one unit's path; process time is the lower rail alone.

**When not to build a VSM.** When the question is not about flow. A project on the 4% error
rate at one approval step with no queue on either side needs a detailed map of that step and a
check sheet of error types, not a lead-time picture. Say so at the tollgate; the reviewer
scores whether the map answers the charter's question.

**Software parity.** *Minitab:* the VSM tool lives in Minitab Workspace (formerly Companion),
not in Minitab Statistical Software. *Excel:* the toolkit VSM workbook (a data-box row per
step; ladder totals are formulas). *R / Python:* where timestamps exist, compute wait and
process time per unit (`difftime`; `pandas` datetime subtraction) and summarize with medians
and ranges; draw the map in Miro or on paper.

**Show (MFG).** Bracket line B, drilled brackets, from kit staged at the line to bracket
loaded on the daily truck. Line B runs three shifts Monday to Friday, about 30 brackets a day,
so **working time is 24 hours per weekday**. Five walked lots of ten; process times from the
walks, failure rate from the inspection log; illustrative of a line of this kind.

| Step | PT per bracket (min) | Wait before (working h) | Why the wait exists | %C&A of what arrives, rated here |
|---|---|---|---|---|
| 1 Kit staged from stores | — | 12.0 | Kits arrive once a day at 06:00; drilling runs round the clock, so a bracket waits 0–24 h | — |
| 2 Drill | 4.5 (n = 50, range 3.8–5.6) | — | — | 97% (wrong stock length; operator re-cuts) |
| 3 Deburr | 2.0 | 3.5 | Deburr takes the shift's lot of ten together | 99% |
| 4 Inspect hole position | 1.5 | 4.0 | Inspection at the end of each shift | 93.3% (101 of 1,500 outside ±0.25 mm, 10-week log) |
| 4a Rework loop (6.7% of brackets) | 20 (n = 101, median 18, range 7–41) | 8.0 | Reworked brackets rejoin the next shift's inspection | — |
| 5 Pack and stage | 0.5 | 1.0 | — | 99% |
| 6 Truck at 15:00 daily (stop) | — | 12.0 | One departure a day | — |

The rework loop and the end-of-shift inspection were not on the line's documented flow. The
walk found both in the first hour.

**Try.** Fill a data box for every block on your map, with the source beside each number. A
box whose source is "asked someone" is a box to observe before Tollgate 1.

---

## 2.3 Lead time, %C&A and process cycle efficiency, with the basis stated (40 min)

**Hook.** "Lead time is 12 days" means nothing until you say twelve of what. Twelve working
days of eight hours is 96 hours of process availability; twelve calendar days is 288 hours of
a customer waiting. Every lead-time number this program accepts carries its basis.

**Teach.**

- **Lead time (LT)** is the elapsed time for one unit from the charter's start point to its
  stop point: every wait plus every process time on the unit's path. When steps run in
  parallel, lead time is the longest path, not the sum of the branches.
- **Process time (PT)** is the touch time on that path. "Cycle time" means two things in the
  literature (touch time per unit, or the interval between completions); prefer "process
  time" on the map.
- **%C&A** for a step is the share of arriving units the receiver can use without correction.
  **Rolled %C&A** for a chain is the product, because each unit must survive every step:
  80% × 90% × 95% × 70% = 48%, not the 84% mean.
- **Process cycle efficiency (PCE)** = PT ÷ LT on the **same basis**. Under 10% is usual in
  transactional and manufacturing streams; clinical streams with much hands-on time run
  higher. PCE locates the waiting inside one process, on one basis, before and after. Do not
  rank two processes by it or set a PCE target; the target is the lead time or %C&A the
  customer asked for.
- **Basis.** *Working time* counts the hours the process is staffed; *calendar time* counts
  the clock. The customer almost always experiences calendar time (payment terms, a bed, a
  promise date); the owner's dashboard is often in working time. Lead with the customer's
  basis, convert when a dashboard needs it, label both, and never mix them in one sum.

**Little's Law** gives a queue's wait when you cannot time it: in a stable system, lead time
= work in process ÷ throughput, in matching units. Forty invoices waiting for an approver who
clears 16 a working day is 2.5 working days for the next invoice in. Count the queue on three
days at the same hour; a count is a number a stranger can repeat.

**Worked numbers (MFG, line B above; working basis, 24 working h per weekday).** Waits on the
main path: 12.0 + 3.5 + 4.0 + 1.0 + 12.0 = 32.5 working h = 1,950 min. PT = 4.5 + 2.0 + 1.5 +
0.5 = 8.5 min. LT = 1,958.5 min ≈ 32.6 working h. **PCE = 8.5 ÷ 1,958.5 = 0.43%.** The rework
loop adds, averaged across all brackets, 0.067 × (20 + 480) ≈ 34 min of lead time and 1.3 min
of process time; it stays on the map as a loop with its 6.7%. Rolled %C&A = 0.97 × 0.99 ×
0.933 × 0.99 = **0.887**: one bracket in nine needs someone to fix something on the way
through. **Basis check:** a lot staged Friday at 18:00 and drilled Monday at 06:00 waited 60
calendar hours but 12 working hours. The promise date is calendar; for lots that cross the
weekend, report the calendar figure beside the working one.

**Worked numbers (TXN; working basis of 8 h per weekday, calendar for the vendor).** Accounts
payable, invoice received to payment scheduled, from workflow timestamps over two weeks and
five walked invoices; illustrative of an AP process at this scale.

| Step | PT (min) | Wait before (working time) | %C&A of what arrives |
|---|---|---|---|
| 1 Receive (portal, email-PDF, scanned paper, EDI) | — | 2 h (intake cleared twice a day) | 90.2% (9.8% missing a purchase-order number, a line total or a vendor code; rated by the entry clerks; n = 3,120, last quarter) |
| 2 Enter | 6 (median 5.9; 2.4 by EDI, 9.0 by paper) | — | — |
| 3 Code and match to the purchase order | 4 | — | 96% |
| 4 Approve | 3 | 2.5 working days (40 waiting, 16 cleared a day) | 88% (12% returned by approvers) |
| 5 Post and schedule payment | 2 | 0.5 working day (nightly batch) | 99% |

Waits: 2 + 20 + 4 = 26 working h = 1,560 min. PT = 15 min. LT = 1,575 min = 3.3 working days.
**PCE = 15 ÷ 1,575 = 0.95%.** Rolled %C&A = 0.902 × 0.96 × 0.88 × 0.99 = **0.754**: a quarter
of invoices are touched twice somewhere. The vendor's terms are calendar days, so the sponsor
also hears that 3.3 working days is 3.3 to 5.3 calendar days depending on the weekend, and
that invoices returned at approval add a median 1.8 working days. The approval queue is 60% of
lead time; a faster scanner changes six minutes.

**Worked numbers (HC; calendar minutes, the patient's clock).** Unit 4E from 2.1. Process time
on the critical path: nurse tasks 25 + pharmacy fill 15 + teaching 15 + transport move 10 =
65 min. Median lead time from the extract: 185 min (n ≈ 300 discharges on 4E, 16 weeks).
**PCE ≈ 65 ÷ 185 = 35%**; the other 120 minutes are three queues: worklist 30, pharmacy about
90, transport 22 at the median. The step medians sum to 207, more than the median total,
because the longest pharmacy waits and the longest transport waits rarely land on the same
patient. Medians do not add; use the ladder to locate the wait and the extract for the
baseline. The patient, the ED and the bed are all on calendar time, so the map is too.

**The sentence you would tell your sponsor (TXN).** *"An invoice takes about three and a third
working days to get through AP and we touch it for fifteen minutes. Two and a half of those
days are the approval queue, and one invoice in four comes back for something. Before we
change anything, we are going to find out why invoices wait for approvers."*

**Try.** Total your ladder. Write LT, PT, rolled %C&A and PCE with the basis on each. Convert
LT to the other basis and decide which one the customer in your CTQ tree experiences.

---

## 2.4 Data types: what each one lets you do later (25 min)

**Hook.** The type of number you collect in week 3 decides the measurement study in week 3,
the chart in week 4 and the test in week 6. Choose it now, on purpose.

**Teach.**

| Type | What it is | Examples | Chart (wk 4) | MSA (wk 3) | Tests (wk 6) | Sample size |
|---|---|---|---|---|---|---|
| **Continuous** | Measured on a scale; any value between two others is possible | Minutes order-to-departure; µm of film; mm of hole deviation | I-MR, X̄-R | Variable Gage R&R; timestamp validation | t-tests, ANOVA, correlation, regression | Fewest: 20–25 subgroups |
| **Count (attribute)** | Occurrences per unit or per area of opportunity | Missing fields per invoice; scratches per panel | c, u | Attribute agreement on what counts as an occurrence | Chi-square | More |
| **Classification (attribute)** | Each unit in one of two or more classes | Complete/incomplete; pass/fail; before noon yes/no | p, np | Attribute agreement | Chi-square; two-proportion test | Most: n × p̄ ≥ 5 per subgroup |

An ordinal rating ("readiness 1–5") is ordered categories with no fixed distance between
them; treat it as a classification (top box or not) unless the scale has been validated.

The rule: **measure the continuous quantity when one exists**. "Late" is days past the
promise; "before noon" is minutes past the order; "reject" is µm below 60. The continuous
number carries more information per observation, needs a smaller sample, can be checked with
a Gage R&R, and shows drift on a chart before the proportion moves. Report a class when the
customer's requirement is a class, and keep the continuous value in the same row.

**Show (TXN).** The AP extract carries three metrics on one invoice: `entry_minutes`
(continuous; I-MR by day; timestamp validation rather than a Gage R&R), the number of fields
corrected (count; u chart per 100 invoices), and `corrected` Yes/No (classification; p chart;
the week 3 attribute agreement study). The `corrected` column arrives with eight spellings
(`Y`, `yes`, `YES`, `y` and their opposites). Write the standardization rule, apply it to every
row, log it with the date, and change nothing the rule does not cover. Six blank entry times
stay in the file, flagged.

**Show (HC, short).** "Discharged before noon" hides a 45-minute improvement in a patient who
leaves at 12:30 either way. Minutes stay the primary metric; the class goes to the dashboard
that asks for it.

**When not to convert.** Never turn a continuous metric into pass/fail because it looks
easier: you trade 20 subgroups for 20 subgroups of 50 and lose the Gage R&R.

**Try.** For your primary and consequential metrics, write the type, the chart, the MSA and
the test family each allows. If a continuous value exists under a class, write down why you
are not using it.

---

## 2.5 Tollgate 1 — Define: ten minutes, one page, sponsor in the room (30 min)

**Hook.** The gate is on the calendar, not "when the project is ready". Ten minutes to show one
page; ten of questions; five in which the sponsor decides and signs the line. The calendar
holds.

**Teach. What the one page must show**, keyed to the rubric, in the order you present it:

| Minute | On the page | Rubric |
|---|---|---|
| 0–1 | Problem statement: what, where, since when, how big with period and n, why it matters; no cause, blame or solution; the team has signed it | D1 |
| 1–3 | Charter: start and stop points inside the sponsor's authority; in/out list; named team; tollgate dates; the sponsor's signature on the *week 1 rewrite* | D2 |
| 3–5 | Primary metric with operational definition, basis and data type; consequential metric; baseline as measured (value, period, n) or "collected weeks 3–4"; target marked provisional or confirmed | D2, M2 |
| 5–6 | Customer named; one CTQ with unit, target, limit and a basis that is a document or a person | D3 |
| 6–8 | SIPOC at 5–8 steps matching the charter's start and stop; stakeholder map with one resistance risk, owner, response and date | D4 |
| 8–9 | The first go-see: date, what you watched, one thing the procedure did not show | M1 (started) |
| 9–10 | Data access: who gives you the extract, by what date; the one decision you need | M2 |

**What the sponsor decides.** Four questions, asked by the reviewer if the sponsor does not:
Is this the problem you want solved, at this scope, with authority over everything between
the start and stop points? Is this the number you want to see move, defined this way? Are the
named people released for the stated hours, and is the data access real? Then the decision:
**proceed / proceed with conditions / hold / re-scope / stop**. You write it on the page, with
any conditions and their dates, before you leave.

**What the reviewer records.** D1–D4 as evidenced, at risk or not evidenced; whether the
charter carries the post-rewrite signature (D2 is not evidenced without it); whether the
operational definition passes the stranger test; decision and conditions; a data-ethics line
(at this gate, usually about how the baseline *will* be collected); a one-line coaching flag.
The record reaches you, your sponsor and your coach within two business days. It is formative,
not the score.

A hold is not a failure; most projects take one. The common holds: a smuggled cause or a "lack
of" in D1; a metric named but not defined; no data-access date; a stop point outside the
sponsor's authority; a stakeholder map with no risk on it.

**Show (TXN).** The commercial quote project from week 1 arrives with the stop point "quote
accepted by the broker". The reviewer asks the authority question; the sponsor manages
underwriting, not brokers. Decision: **hold**, one item: re-scope the stop point to "quote
letter sent" and re-sign within ten business days. Nothing else changes; the follow-up takes
ten minutes. The record also notes that the sponsor asked for "quotes per underwriter per
day" and chose to keep median working days from request received to quote sent, because that
is the broker's CTQ. The choice is on paper for Tollgate 4.

**Try.** Draft the one page tonight and read it aloud with a timer. Cut until it fits. Send it
to the sponsor two days before the gate with the one decision you need in the first line.

---

## Live lab — run of show: the value stream lab (150 min)

**Format.** Live virtual, 8–20 learners, one instructor (producer above 12). Teams of 4–5 by
vertical for the case; pairs across verticals for the learner's own process. The case pack
(procedure, walk notes, WIP counts, %C&A tallies, baseline extract) is loaded before 0:05.
Each vertical's procedure omits a queue, a rework loop and a variant path. Do not say so
before 2:10.

**Outcomes.** Every team leaves with a current-state VSM of the case showing the three
omissions, with lead time, rolled %C&A and PCE on a stated basis and a sponsor sentence; every
learner leaves with data boxes for their own process, each number marked observed, told or
computed.

### 0:00–0:10 — Setup and the rule
- Poll: "On your own process, what share of lead time is touch time? Under 1% / 1–5% /
  5–20% / over 20%." Save the answers.
- Frame: "The procedure in your pack is true and incomplete. Find what it leaves out, then
  put numbers on it."
- Rule: every number on the map carries a source. "Told" is a source, written in words in a
  different color, and it does not count toward the ladder.

### 0:10–0:35 — Block 1: the map as observed (25 min)
- Teams read the walk notes and redraw the procedure at block altitude, 8–15 steps, with
  every queue, loop and variant path, each with a frequency.
- **Checkpoint:** a map that matches the procedure box for box has not read the notes.
  Instructor asks: "Where did unit 3 spend Tuesday afternoon?"

### 0:35–1:05 — Block 2: data boxes and the ladder (30 min)
- Process times from the timed units (mean, range, n); waits from timestamps where they
  exist and from WIP counts with Little's Law where they do not; %C&A from the receivers'
  tallies.
- The pack states some figures in working hours and some in calendar days on purpose. Teams
  choose the basis the customer experiences, convert, and label both.
- **Instructor floats with one question:** "Observed, told or computed? Show me." A box with
  no source is emptied, not corrected.

### 1:05–1:15 — Break

### 1:15–1:40 — Block 3: read the map (25 min)
- Teams compute LT, PT, rolled %C&A and PCE, then write the sponsor sentence: the number,
  where the wait lives, what the team will find out next. No countermeasure in it.
- Sentences read aloud; the room votes on whether the basis is stated and a sponsor would
  know what happens next. Rewrite until both.
- Every team's PCE goes on the board with its basis. Two teams with different bases for the
  same case are the demonstration: same process, one number a third of the other.

### 1:40–2:10 — Block 4: your own process (30 min)
- Silent work, 15 minutes: data boxes for the learner's own map from the prework walk, each
  number marked observed, told or computed.
- Pairs across verticals, 6 minutes each way: for each told number, "what would you count or
  time on Monday to replace it?" The answer goes on the week 3 data collection plan.

### 2:10–2:25 — Debrief: what the procedure could not tell you (15 min)
- Reveal the three planted omissions per vertical. Teams say which they found, which they
  missed, and what in the walk notes would have shown it.
- Re-run the opening poll. Say it plainly: "Nobody wrote a wrong procedure. The procedure
  describes the design; the map describes the work. The gap is where the project lives."
- Transferable patterns: the biggest number on the upper rail beats every touch-time
  improvement; %C&A is rated by the receiver; medians do not add; state the basis or the
  number is not comparable.

### 2:25–2:30 — Close
- Tollgate 1 logistics: page to the sponsor two days ahead; the reviewer's name goes to the
  learner and the sponsor and nobody else; the decision is written on the page in the room.

### Facilitator notes and failure modes
- **A team maps from memory** ("we know this process"): send them to the walk notes for unit
  3. Institutional knowledge is a source labeled "told".
- **"We have no queue times":** count the WIP. Demonstrate Little's Law once on the board,
  then stop rescuing.
- **PCE on mixed bases** (working-hour waits, calendar-day lead time): the most common
  arithmetic error in the room and on the exam. Ask which basis the customer experiences and
  rebuild the sum on that one.
- **A team starts designing the countermeasure** ("inspect hourly"): park it on the week 7
  list and ask what they would measure first to know it would work.
- **The step with the worst %C&A is blamed** ("intake sends us junk"): redirect to the reasons
  behind the rating. In every pack, most trace to a form, a system or a timing decision
  upstream of the people at the step.
- **Protect the debrief.** If block 2 overruns, cut block 4 to the silent 15 minutes and drop
  the pair round; never shorten the debrief. A room that leaves without the reveal keeps
  trusting procedures.
- **Virtual logistics:** one board frame per team with the procedure pre-drawn in grey so the
  observed map is drawn over it; walk notes as locked frames; a basis reminder on every frame.

---

## Project work this week

| Rubric item | Deliverable at Tollgate 1 | Full marks look like |
|---|---|---|
| D1–D4 | The week 1 deliverables on the one page, sponsor-signed after the clinic | As in week 1's table, now with the stop point inside the sponsor's authority, the data type and basis on the metric, and the target labeled provisional or confirmed |
| M1 (started) | Dated go-see and block map | As observed, with one thing the procedure did not show; data boxes begun with sources |
| M2 (started) | Metric definition and data-access line | Type and basis stated; who provides the extract, by when |

Also: the page sent to the sponsor two days ahead; the decision written on the page in the
room; the reviewer's record filed with your coach. The full VSM with lead time, %C&A and PCE
is due at Tollgate 2; this week's job is the walk and the sources. Practicum-track learners
present the same page on the vertical case with the practicum instructor as sponsor.

---

## Coaching prompts

1. "Show me the date on your map and tell me one thing you saw that is not in the procedure.
   If there is nothing, when is the next walk?"
2. "Read me your lead time with its basis. Now read me the same number on the other basis.
   Which one does the customer in your CTQ tree feel?"
3. "What did the sponsor decide at the gate, in their words, and what is written on the page
   that they will be reminded of at Tollgate 4?"

---

## The week's vertical case dataset

The practicum datasets (`../practicum/data/`, generated by `generate.py`; the case files
`case-mfg.md`, `case-hc.md` and `case-txn.md` hold the facilitator keys) carry the vertical
cases from this week to week 8. The week 2 pack adds, per vertical, the documented procedure,
walk notes for five units with timestamps, WIP counts at three times of day, and %C&A tally
sheets kept by the receiving steps. The plants below are in the key, not in the learner pack.

- **MFG — bracket line B** (`mfg-bracket-line.csv`, 1,500 brackets, 10 weeks, three shifts):
  `part_id`, `date`, `shift`, `machine`, `fixture`, `operator_id`, `hole_pos_dev_mm`,
  `result`, `rework_min`. 101 of 1,500 fail ±0.25 mm (6.7%); rework mean 19.6 min.
  *Planted:* the documented flow has no rework loop and no end-of-shift inspection queue; the
  walk notes show both. Five rows have a blank measurement logged as a pass and one reads
  12.50 mm as a pass (a keying error; true value near 0.125): find and report, do not delete.
  The fixture and shift patterns are for weeks 5–6.
- **HC — discharge, four units** (`hc-discharge.csv`, 1,234 discharges, 16 weeks):
  `discharge_id`, `date`, `unit` (3W, 4E, 5N, 6S), `weekday`, `order_time`,
  `actual_discharge_time`, `pharmacy_turnaround_min`, `transport_wait_min`. Median
  order-to-departure 131 calendar minutes overall; 92 on 3W, 96 on 5N, 185 on 4E, 191 on 6S.
  *Planted:* the procedure shows one path; the walk notes put central pharmacy on the critical
  path for 4E and 6S and the unit cabinet on 3W and 5N, plus a worklist queue no procedure
  mentions. Two records have a departure before the order (a transposed hour): report, do not
  delete. The Monday effect is for weeks 4–5.
- **TXN — accounts payable invoice entry** (`txn-invoices.csv`, 2,053 rows, 26 weeks):
  `invoice_id`, `date`, `entry_channel` (Portal, Email-PDF, Paper-scan, EDI), `clerk_code`,
  `vendor_group`, `entry_minutes`, `corrected`, `days_to_pay`. Corrected after approval 7.3%
  overall: 1.3% EDI, 5.5% Portal, 7.2% Paper-scan, 13.8% Email-PDF. *Planted:* four channels
  are four variant paths with different %C&A; the procedure has one "receive invoice" box.
  Eight non-standard Yes/No spellings, six blank entry times, one duplicated row, one negative
  `days_to_pay`; `days_to_pay` is blank for invoices unpaid at extract (censoring, not missing
  data). The April step change in entry minutes is for week 4.

Week 1's teaching examples (the powder-coating cell, unit 4B, the quote team) return as Show
examples; the lab and the Practicum track run on the datasets above.

---

## Takeaways

- The current state is what you watched, dated, with its queues, loops and variant paths;
  the procedure is the design, and the gap is the finding.
- Every data-box number has a source: timed, timestamped, counted, or rated by the receiver.
  "Told" goes in a note.
- Lead time, rolled %C&A and PCE are only numbers on a stated basis; the customer's basis
  leads, the other is labeled beside it, and medians do not add.
- Choose the data type on purpose: the continuous quantity, when it exists, buys the chart,
  the Gage R&R and the test you will want in weeks 3–6.

---

## Cumulative check (week 1)

**W2-C1.** A cell supervisor proposes a Green Belt project on powder overspray in the coating
booth: it recurs daily, it is measured in kg per shift, and the reclaim filter is known to be
undersized, with a replacement already budgeted. The best decision is:
A. Charter it as a Green Belt project; recurring and measurable are the criteria that matter ·
B. Run it as a Just-Do-It PDCA cycle (noting Deming's PDSA): replace the filter, check the
kg per shift, and keep the Green Belt project for a problem whose cause is not known ✅ ·
C. Widen the scope to include coating thickness so the project is large enough to charter ·
D. Refer it to a Black Belt because a filter change is an engineering decision
`[A · G1 · Apply · MFG · S · PRAC]` — a known cause with a chosen countermeasure fails the
"cause unknown" criterion; option C bolts an unrelated problem onto a fix to justify DMAIC.

**W2-C2.** A quote team writes its CTQ as "quote issued within 6.4 working days of request
received," citing "our median over the last 12 weeks" as the basis. Before the tollgate, the
required correction is:
A. Replace the basis with the customer's requirement (the broker's stated need or the
service-level clause), because a specification limit comes from the customer and 6.4 days is
the process's own current performance ✅ · B. Convert 6.4 working days to calendar days ·
C. Raise the limit to the 90th percentile so the process can meet it · D. Remove the number
and keep "quotes should be timely"
`[A · G1 · Analyze · TXN · S · PRAC]` — the team has written the process's own performance as
a specification; option C makes the same error with a different percentile.

---

v1.0 · 2026-09-20
