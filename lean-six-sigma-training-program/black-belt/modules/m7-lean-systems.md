# Module 7 — Lean at System Level (weeks 13–14 · ≈ 8 h self-paced + two 2.5 h live labs)

At Green Belt you redesigned one process for flow. This module designs the whole value
stream, and the difference is arithmetic: a future-state map without takt, WIP targets and
balance numbers is a drawing. Rubric item I3 asks for the arithmetic, and certification
requirement 4 asks you to lead a kaizen event that installs part of the design. Every method
here ends with the number you would show a sponsor and the situation in which the method
does not apply.

**Learning objectives.** By the end of this module the learner can:
1. Compute takt time and apply Little's Law to a real value stream, stating the basis
   (working vs calendar time, per shift vs per day) and the window over which the averages hold.
2. Design a future-state value stream by answering the eight design questions in order, with
   the takt, WIP and balance arithmetic shown.
3. Balance a line or level a workload against takt from observed cycle times, and write the
   staffing decision as a trade-off.
4. Size a pull loop (kanban count or WIP cap) from demand, replenishment lead time, container
   size and a stated safety factor, and say when pull is the wrong design.
5. Lead a setup-reduction (SMED) effort at the decision level: choose the changeover, separate
   internal from external work, and convert minutes saved into lot size and inventory.
6. Compute OEE from shift data and locate the largest loss (MFG), or build an hourly
   demand–capacity profile and locate the mismatch (HC/TXN).
7. Apply the five focusing steps of the theory of constraints and explain why improving a
   non-constraint moves WIP, not throughput.
8. Charter, prepare, run and follow up a 3–5 day kaizen event to the facilitation-rubric
   standard (certification requirement 4).

---

## 7.1 The eight future-state design questions (40 min)

**Hook.** Your current-state map from Measure is a photograph: lead time 11.5 working days,
process time 48 minutes, five queues. A photograph does not tell you what to build.
Future-state design is a fixed sequence of questions, and the order is the method.

**Teach.** The questions come from Rother and Shook's *Learning to See*; the right-hand
columns translate them for the verticals where "supermarket" means a capped queue with a
signal, not a rack of parts.

| # | Question | MFG reading | HC / TXN reading |
|---|---|---|---|
| 1 | What is takt time? | available working time ÷ demand | same; demand is arrivals, referrals or requests |
| 2 | Finish to a supermarket, or ship direct? | finished-goods policy | schedule into a capped template, or serve on arrival |
| 3 | Where can work flow with no queue between steps? | cells, one-piece flow | co-located intake teams; single-owner case handling |
| 4 | Where must a supermarket pull loop sit? | between steps that cannot flow (shared, distant, long changeover) | between departments that cannot co-locate; a WIP cap with a signal |
| 5 | Which single point receives the schedule (the pacemaker)? | one process downstream of the last supermarket | the scheduling desk; the release point for cases |
| 6 | How is mix levelled at the pacemaker? | heijunka box | template scheduling; release by case type |
| 7 | What increment of work is released and taken away (pitch)? | takt × pack quantity | the next hour's cases, every hour |
| 8 | What process improvements does the design need to run? | kaizen bursts | same |

Takt comes first because every later answer is measured against it. Improvements come last
because a burst you cannot tie to a design question is a pet project.

**Show (HC).** Outpatient infusion centre, numbers illustrative but in the observed range.
Current state: 34 chairs, 118 patients per day, median 52 min from arrival stamp to
chair-assignment stamp (working day, weekdays). Q1: chair capacity 34 × 10 h = 340
chair-hours/day; demand 118 × mean 2.6 h = 307 chair-hours; nominal utilisation 90%, which is
why the queue forms at 10:00 (7.6 explains the curve). Q2: schedule into a template. Q3:
compounding and chair assignment cannot flow because the drug is not mixed until the day's
labs return — the real question is whether labs can be drawn the day before (they can, for
about 60% of regimens). Q4: a supermarket of pre-mixed standard bags for the 12 commonest
regimens, replenished on a signal. Q5: the template is the pacemaker. Q6: no more than 40%
of infusions longer than 4 h started before 10:00. Q7: pitch = 30-minute assignment slots.
Q8: bursts — prior-day labs, the pre-mix loop, a chair-turnover standard.

**Try.** Answer the eight questions for your project stream in writing. Two answers will be
"not applicable" — write why. That page is the start of I3.

---

## 7.2 Takt and Little's Law: the two equations the design rests on (60 min)

**Hook.** A plant manager asks for "more capacity". Takt tells you whether she needs it.
Little's Law tells you why lead time is three days when the work takes eight minutes.

**Teach.** *Takt time* = available working time ÷ customer demand, both over the same
period. Available time excludes planned breaks and meetings. It does **not** exclude
unplanned downtime, changeovers or rework: those are losses you want visible against takt,
not hidden inside it. State the basis every time you write a takt.

*Little's Law:* average WIP = average throughput × average lead time. It holds for any
system averaged over a window long enough that WIP at the start and the end are similar,
with agreeing units (items, items per day, days). Rearranged, lead time = WIP ÷ throughput —
which is why lead time cannot fall unless WIP falls or throughput rises, and why expediting
one item changes nothing on average.

**Show (MFG).** Valve assembly cell. Demand 9,200 units/month, six-month mean, 21 working
days/month → 438 units/day. Available time: two 8-hour shifts, each less 30 min breaks and a
10-min start-of-shift meeting → 2 × 440 = 880 min/day = 52,800 s/day. **Takt = 52,800 ÷ 438 =
120.5 s per unit** (working-time basis, per day, breaks excluded, unplanned downtime not
excluded). A floor count on Tuesday at 08:00 finds 1,310 units in the cell (queues, racks,
at stations). **Lead time = 1,310 ÷ 438 = 3.0 working days.** Process time per unit (sum of
station cycle times, 7.3) is 506 s. Process cycle efficiency = 8.4 min ÷ (3.0 × 880 min) =
0.3%. The design target follows directly: for a lead time of one shift (440 min) at the same
throughput, WIP must fall to 438 × 0.5 = 219 units. That is a WIP cap; 7.4 sizes the loop
that enforces it.

**Show (TXN).** Claims: 2,640 open claims (system count, Monday 08:00); 410 closed per
working day (12-week mean). Lead time = 6.4 working days. For a 3-day promise at current
throughput, open claims must be held at 1,230. The manager's plan — ask adjusters to work
faster — lifts throughput perhaps 5%, which is a rational response to the metric she is
given (closures per adjuster). The design lever is different: two approval queues hold
1,700 of the 2,640 claims, and intake control (7.7) sets the cap.

**When NOT to use.** Takt is meaningless when demand inside the period swings more than the
process can absorb — an emergency department, a call centre — use the demand–capacity
profile (7.6). Little's Law fails during a ramp (WIP rising), when units do not agree (open
claims against completed letters), or applied to a single day; it is an average over a
stable window. Never present a lead time computed from Little's Law as a measured lead
time; label which it is.

**Software.** The arithmetic is Excel. Before you trust the averages, chart daily WIP and
daily throughput on I-MR charts (Minitab Stat > Control Charts > Variables Charts for
Individuals; R `qcc::qcc(type="xbar.one")`; Python `pyspc` or a hand-built chart) — an
unstable WIP series means the window is not stable and the law does not apply yet.

**Try.** Compute takt and the Little's Law lead time for your stream, with basis. Compare the
computed lead time to the lead time you measured in Measure and explain the gap (usually a
one-moment WIP count against a lead time tracked over weeks).

---

## 7.3 Line balancing and workload levelling (60 min)

**Hook.** The cell in 7.2 runs five operators and cannot make takt. The operators are not
the reason.

**Teach.** *Balancing* distributes work content across stations so no station exceeds takt
and idle time is minimised. Inputs: observed cycle time per station (median of at least ten
cycles, timed by you, never taken from the routing) and takt. Minimum stations = total
content ÷ takt, rounded up. A Yamazumi (stacked-bar) chart shows each station's content
against the takt line, with value-added, necessary non-value-added and non-value-added
segments distinguished by label or pattern, not by colour alone. Balance delay =
(stations × takt − content) ÷ (stations × takt).

*Levelling* (heijunka) works the other axis: demand that arrives lumpy in time or in mix.
Level by volume (release the average per pitch) and by mix (alternate types so each resource
sees a steady load).

**Show (MFG).** Station medians: 95, 118, 74, 131, 88 s → 506 s content. Takt 120 s.
Station 4 at 131 s cannot make takt; the cell yields 880 × 60 ÷ 131 = 403 units/day, 35
short, hence 1.5 h of overtime daily. Walk the stations: 38 s of the 506 is walking to a
shared tester and re-opening component bags — a tester placed for an earlier layout, and bags
heat-sealed by the supplier for a different customer's spec. Remove it: 468 s → 468 ÷ 120 =
3.9 → four stations at 117 s each. The leader's options:

| Option | Operators | Load per station | Balance delay | Trade-off |
|---|---|---|---|---|
| (a) | 4 | 117 s (97.5% of takt) | 2.5% | Any minor stop misses takt; needs standard work, andon, and a response plan |
| (b) | 5 | 94 s (78% of takt) | 22% | One operator's time partly free; pair with a second cell or absorb material handling |

Neither is wrong. Write the choice as a trade-off between fragility and labour; that
sentence is I3 evidence.

**Show (HC).** Endoscopy: 96 procedures/week; room capacity 22/day. Monday runs 31 booked
(weekend referrals batched Monday morning), Friday 11. Level by template: 19–20 per day, with
the referral desk releasing into the template instead of into Monday. Monday overtime and
Friday idle both disappear and no procedure gets faster.

**Show (TXN).** Invoice processing: 3,100 invoices/week, 55% arriving in the last two working
days of the month. Pitch: release 620/day from a visible backlog board; anything beyond the
pitch waits in a *counted* queue. The count is the signal that capacity, not effort, is short.

**When NOT to use.** Balancing to a takt built on demand that swings ±40% week to week gives
a line that is right on average and wrong every week — level first, or design to the profile.

**Software.** Yamazumi as an Excel stacked bar; nothing statistical is needed.

**Try.** Balance your stream or level its intake; produce the Yamazumi or the template and
the trade-off sentence.

---

## 7.4 Pull system design and kanban sizing (55 min)

**Hook.** Push releases work because it arrived. Pull releases work because downstream
consumed. Design question 4 says where pull must sit; this section says how much inventory
or WIP the signal authorises.

**Teach.** Kanban count N = D × L × (1 + α) ÷ C, where D is demand per unit time, L the
replenishment lead time in the same unit (signal to available, including queue and
changeover), α a safety factor for variability (10–30%, with a stated reason), C the
container quantity. Round up. For work rather than parts (cases, files) the same logic gives
a WIP cap: target lead time × throughput, plus α. Rules: nothing enters without a signal;
the count is visible; the count is reviewed monthly and *reduced* deliberately, because the
purpose of pull is to expose problems at lower WIP, not to store parts comfortably.

**Show (HC).** Ward two-bin for IV start kits: usage 24/day (three-month mean, SD 6),
replenishment from central supply 2 days, bin of 12. α = 25% because weekday usage varies
(SD ÷ mean = 0.25). N = 24 × 2 × 1.25 ÷ 12 = 5 bins. The par-level system it replaces held
120 kits and still ran out, because par was counted weekly rather than on consumption.

**Show (MFG).** Machined-body supermarket between machining and the assembly cell: D =
438/day, L = 0.5 day (an 84-min changeover plus run plus move), C = 20, α = 20% from
breakdown history. N = 438 × 0.5 × 1.2 ÷ 20 = 13.1 → 14 cards = 280 bodies. After the SMED
work in 7.5, L = 0.25 day → 7 cards = 140 bodies. The changeover bought inventory, not speed.

**Show (TXN).** Underwriting CONWIP: cap = 2 days × 60 files/day × 1.2 = 144 files in
process; intake releases a file only when one completes. By Little's Law the cap *is* the
lead-time promise.

**When NOT to use.** Erratic demand (coefficient of variation above about 1), one-off custom
work, or a product launched last month with no history: a count computed from a three-month
mean is then a guess. Label it, start generous, trim monthly. Never take L from the routing's
standard lead time; measure it.

**Software.** Excel. D's mean and SD come from the data you charted in M6; confirm stability
before sizing.

**Try.** Size one loop in your stream; state D, L, C, α and the source of each.

---

## 7.5 Setup reduction at the leadership level (45 min)

**Hook.** SMED is a shop-floor technique. The Black Belt decision is which changeover to
attack and what the minutes buy.

**Teach.** Shingo's method: separate internal work (machine stopped) from external (can be
done while running); convert internal to external; streamline both; standardise. The
leadership arithmetic is EPEI — every part every interval. With available time A per week,
run time R needed for demand, changeover time c and P part numbers: affordable changeovers =
(A − R) ÷ c, and EPEI = P ÷ affordable changeovers. Shorter changeovers buy smaller lots,
which lower WIP by Little's Law and shorten lead time. They buy "more capacity" only when the
machine is the constraint (7.7).

**Show (MFG).** Press, 6 part numbers, A = 4,400 min/week, R = 3,600 min, c = 84 min (median
of three videoed changeovers). Affordable changeovers = 800 ÷ 84 = 9.5/week → EPEI = 6 ÷
9.5 weeks ≈ every 4.4 working days → lot ≈ 4.4 days of demand. First SMED pass (typical of a
first pass; illustrative): 31 min of die fetching, paperwork and gauge collection made
external; 15 min of die-height adjustment removed by pre-set shims; no streamlining yet →
38 min. Affordable = 21/week → EPEI 2.0 days → lots halve, supermarket cards halve (7.4). Video
the changeover with the operators; they find external work faster than any engineer.

**Show (HC).** OR turnover, median 41 min patient-out to patient-in. Internal: terminal
clean. External: next case cart, instrument count, consent check — currently done after the
room empties because the standard was written when one team did everything. Moving cart
preparation and the count external → 26 min. The leadership reason is not more cases; it is
predictable start times, which levels the recovery unit downstream.

**When NOT to use.** Attacking a changeover on a non-constraint improves a number nobody's
lead time depends on.

**Try.** Choose one changeover (turnover, or context switch in a transactional queue) in your
stream and compute the EPEI or the schedule effect of halving it.

---

## 7.6 TPM and OEE (MFG) · demand–capacity management (HC/TXN) (70 min)

### A — TPM and OEE

**Teach.** OEE = Availability × Performance × Quality, on planned production time. The six
big losses: breakdowns and changeovers (availability); minor stops and reduced speed
(performance); start-up rejects and production rejects (quality). TPM supplies the routines:
autonomous maintenance (operators own cleaning, inspection, lubrication), planned
maintenance, focused improvement. OEE is a diagnostic. It is never an operator scorecard.

**Show (MFG).** Moulding machine, one day. Planned 880 min. Breakdowns 70 + changeovers 62 =
132 min → operating 748 min → **A = 85.0%.** Ideal cycle 0.40 min/unit; output 1,540 → **P =
0.40 × 1,540 ÷ 748 = 82.4%.** Good 1,470 → **Q = 95.5%.** OEE = 0.850 × 0.824 × 0.955 =
**66.9%.** In minutes: availability loss 132, performance loss 132 (748 − 616), quality loss
28. The performance loss equals the downtime, and nobody logs it — minor stops never appear
on the downtime Pareto. Compare a machine to its own trend; the "85% is world class" figure
is folklore and you should say so if a sponsor quotes it.

**When NOT to use.** OEE on a non-constraint that already outruns takt: raising it makes
inventory. Watch for changeovers being moved into "planned" time to lift the number.

### B — Demand–capacity management

**Teach.** Where arrivals vary by hour and weekday, the design object is the hourly profile:
arrivals per hour (mean and 85th percentile, by weekday) against staffed capacity per hour.
Waiting grows non-linearly with utilisation. In the simplest queue (M/M/1) time in queue is
proportional to ρ ÷ (1 − ρ): at 80% utilisation the queue is 4× what it is at 50%, at 95% it
is 19×. Variability in arrivals and in service multiplies it further (Kingman's
approximation, awareness level). Design rule: match capacity to the profile, keep peak
utilisation below about 85%, and reduce variability before adding staff. Discrete-event
simulation is Master Black Belt scope; here you use the profile and the rule.

**Show (HC).** Emergency department, 160 visits/day (illustrative, typical of a mid-size
site). Arrivals ≈ 3/h from 03:00 to 07:00, rising to 9/h by 11:00, ≈ 11/h from 11:00 to
21:00, then falling. A physician takes ≈ 2.0 new patients/h. Current staffing: three 8-hour
shifts, 4 physicians each → 8/h flat. Deficit 11:00–21:00: 3/h × 10 h = 30 patients queued
by 21:00, cleared after midnight, while night utilisation runs near 20%. Redesign: 10-hour
shifts starting 07:00, 11:00 and 15:00 with 4, 4 and 3 physicians → 8/h at 07:00, 16/h
11:00–17:00, 14/h 17:00–21:00, 6/h overnight, same paid hours within 2%. The model tells you
where to look; you verify with the same door-to-provider metric on an I-MR chart (M6), not
with the model.

**Show (TXN).** Contact centre: the same profile at 30-minute intervals; staffing by Erlang C
(the M/M/c model) is awareness here.

**Software.** Profiles as Excel pivots; Minitab has no queueing module; R `queueing`;
Python `numpy` for a ten-line Erlang C function.

**Try.** MFG: one week of OEE on your constraint, losses in minutes. HC/TXN: an hourly
profile for a representative week against staffed capacity; list the hours above 85%.

---

## 7.7 Theory of constraints basics (40 min)

**Teach.** Five focusing steps: identify the constraint; exploit it (no idle minute, no
defect processed on it, no changeover in demand hours); subordinate everything else (release
work at the constraint's pace — the rope — and protect it with a time buffer); elevate (buy
capacity) only after exploiting; return to step 1, because the constraint moves. Stream
throughput equals constraint throughput; improvement anywhere else changes WIP, not output.

**Show (TXN).** Mortgage stream, files per day: intake 90, processing 80, appraisal review
60, underwriting 75, closing 85. Stream = 60/day; WIP grows ahead of appraisal review at
30/day. Exploit: reviewers spend 25% of their day chasing missing documents — move that
check to intake, lifting effective review to about 75. Rope: intake releases 75/day. Elevate:
a second reviewer only if demand exceeds 75. The manager who earlier added intake staff was
responding rationally to the metric she owned (intake backlog); it made the review queue
worse.

**When NOT to use.** The constraint is outside the process (market demand, a regulatory
clock) or is a policy (a batching rule): "elevate" is then a management decision, not a
capacity purchase.

---

## 7.8 Kaizen event leadership (90 min)

**Hook.** You participated at Yellow Belt and co-led at Green Belt. Requirement 4 is to lead
one, observed or video-reviewed. The event is three to five days; the leadership is six
weeks.

**Teach — charter (two to four weeks before).** Scope one stream segment you can walk in
20 minutes. One primary metric with an operational definition and a checked measurement
system. A target the sponsor signs in numbers (lead time −50%), not "improve". Team of six to
nine: at least half people who do the work, one upstream, one downstream, one fresh-eyes
outsider, one from maintenance or IT if the change will need them. Decision rights written:
what the team may change without asking (layout inside the area, standard work, visual
controls) and what needs whom (IT configuration, anything touching another department).
Backfill for every team member arranged and named.

**Pre-work.** Two or more weeks of baseline on the metric, charted; a current-state walk and
video; supplies; sponsor kick-off and report-out on the calendar; leadership briefed that
day 3 will look worse than day 1.

**The five days** (a three-day event compresses days 1–2 and 4–5):

| Day | What happens | Your job |
|---|---|---|
| 1 | Kick-off; just-in-time training (30 min maximum); walk; current state drawn from observation; baseline reviewed; issue list ("newspaper") opened | Set the room's rules; keep training short |
| 2 | Analysis using 7.2–7.7 at event scale; future state; countermeasures ranked; sponsor check-in | Ask for the basis of every number |
| 3 | Try: mock-ups, cardboard, trial standard work, timed; several try-adjust cycles | Protect trial time from tidy-up pressure |
| 4 | Implement and standardise: standard work written by the people doing it; visual controls; training; measure | Stop scope growth |
| 5 | Verify against baseline on the same metric; 30-day list (≤ 10 items, owner, date); report-out by team members | Team presents, not you |

**Follow-up.** Process owner reviews the 30-day list weekly with you; the metric continues on
the same chart with a 30-, 60- and 90-day check. The observer scores preparation,
facilitation, safety of the room and closure against the rubric in
[`../practicum/kaizen-facilitation.md`](../practicum/kaizen-facilitation.md); the kit is at
[`../templates/kaizen-event-leaders-kit.md`](../templates/kaizen-event-leaders-kit.md).

**Show (TXN).** Accounts-payable matching cell, five-day event. Baseline: 6.4 working days
first-touch to approval, I-MR chart over four weeks. Day 2 arithmetic: Little's Law shows
1,900 invoices in process against 410/day; the future state caps WIP at two days. Day 3 trial
co-locates matching and exception handling on cardboard desks; the trial shows the ERP
screen lacks a hold-reason field. That needs IT: it goes on the 30-day list with an owner
and a date, not into the "done" column. Day 5: a 40-invoice timed sample gives 2.1 days;
the report-out says "2.1 days on a 40-invoice sample; the 30-day chart will confirm or not".

**Failure modes.** The event as theatre — no baseline, a result announced from a two-hour
sample. Scope growing on day 2. The sponsor solving from the doorway. Team members pulled
back to their desks because backfill was never arranged. A 30-day list of 40 items, of which
none closes. You facilitating content instead of process — it is the team's future state.

**Try.** Draft your charter with the kit; book the observer or the video review.

---

## Live lab — run of show

### Lab 13 (week 13) — Future-state design on the case (150 min, teams of 4)
Prerequisite: 7.1–7.4 complete; own current-state map and a first I3 draft.

- **0:00–0:10 Setup.** Present the case (dataset below). Rule of the room: every number on the
  map carries its basis in writing.
- **0:10–0:35 Round 1 — takt and Little's Law.** Teams compute takt from the demand and
  calendar sheets and lead time from the WIP counts. Planted traps: the demand sheet holds
  a promotion month 40% above the mean; two WIP counts differ by 30%. Facilitator asks only
  "what is the basis?"
- **0:35–1:10 Round 2 — balance.** Ten timed cycles per station plus the routing sheet. The
  routing shows station 4 at 68 s; the observations show 118 s. Teams that balance to the
  routing balance a line that does not exist. Yamazumi and the trade-off sentence required.
- **1:10–1:40 Round 3 — pull and constraint.** Size the supermarket; find the constraint (the
  tester shared with a second cell, visible only in the downtime log as "waiting tester");
  decide where the rope ties.
- **1:40–2:05 Report-outs.** Three minutes per team; the room challenges every basis.
- **2:05–2:20 Debrief.** Who used the promotion month; who used the routing; who found the
  tester. Name the pattern: design from observed numbers, or design a fiction.
- **2:20–2:30 Transfer.** Each learner writes the one design question their project has not
  yet answered and the number they need to answer it.

Facilitator moves: do not rescue a team that took the routing time before 1:00; the report-out
does that. A team that finishes early becomes the sponsor: "why should I fund four operators
at 97.5% loading?" **Protect the debrief** — if Round 3 overruns, stop it at 1:40; a team
without a constraint decision learns more from the reveal than from ten more minutes.

### Lab 14 (week 14) — Kaizen leadership simulation (150 min)
- **0:00–0:10 Setup.** Requirement 4 logistics: observer, video, deadline inside the closure
  window.
- **0:10–0:40 Charter clinic.** Pairs review each other's charter against the kit checklist:
  walkable scope, metric with operational definition, checked measurement system, decision
  rights, team composition, named backfill. Rewrite on the spot.
- **0:40–1:30 "Day 3, 2 pm" cards.** Six scenario cards, eight minutes each (three to decide,
  five to play, an observer scoring with the practicum rubric lines): the sponsor widens the
  scope; a countermeasure needs IT; a team member's manager pulls them out; the baseline
  turns out to have been counted under a different definition; one voice dominates; a trial
  is unsafe.
- **1:30–1:55 Report-out practice.** One team runs a mock day-5 readout under the rule that
  team members present; the room plays leadership.
- **1:55–2:20 Debrief.** Which cards were about process and which about content; where the
  leader solved instead of facilitated.
- **2:20–2:30 Close.** Event dates posted to the cohort channel.

Failure modes: learners who "solve" every card with authority they will not have; a room that
treats the baseline-definition card as a technicality — stop and name it as the data-ethics
case it is (you cannot compare day 5 to a baseline counted differently). **Protect the
debrief.**

---

## Project work this fortnight (rubric items)

- **I3 Flow and system design:** future-state map or capacity model with takt, Little's Law
  and balance arithmetic, each number with basis; or the written reason it does not apply.
- **I2 Solution design and risk:** FMEA on the future-state steps that change; mistake-proofing
  at the release point.
- **I4 Implementation management:** the kaizen event on the plan with owner and date; the
  people doing the work named in the design.
- **C3 Control strategy at scale:** sampling frequency reasoned from pitch, not habit.
- **L1:** the stakeholder canvas revised — a flow redesign touches functions you do not manage.
- **Requirement 4:** event chartered, dated, observer or video review booked.

## Coaching prompts (monthly checkpoint)
1. Show me the takt and the lead time — what is the basis of each, and over what window?
2. Where is the constraint, and what did you decide *not* to improve because of it?
3. What can your kaizen team change without asking anyone, and who agreed to that in writing?

## Vertical case dataset — the valve assembly cell
MFG primary; HC ("the infusion centre") and TXN ("the claims intake cell") reskins share the
structure with cases and files in place of units. Files:

| File | Columns | Planted |
|---|---|---|
| `demand.csv` | month, units ordered, units shipped, working days, note | One promotion month at +40% |
| `calendar.csv` | shift, planned minutes, break minutes, meeting minutes | Nothing — but unplanned downtime is not here, on purpose |
| `cycle-times.csv` | station, cycle number (1–10), seconds, observer | Station 4 observed 118 s against routing 68 s |
| `routing.csv` | station, standard seconds | The fiction |
| `wip-count.csv` | timestamp, location, units | Two counts 30% apart |
| `downtime-log.csv` | date, machine, minutes, reason code | "Waiting tester" entries reveal the shared constraint; minor stops absent |
| `changeover-log.csv` | date, from part, to part, minutes | External work recorded as changeover time |
| `arrivals-by-hour.csv` (HC/TXN reskins) | weekday, hour, arrivals | The 11:00–21:00 plateau against flat staffing |

## Takeaways
- A future state is eight answered questions and the arithmetic behind them; takt first.
- Lead time = WIP ÷ throughput. Nothing else moves it.
- Improve the constraint; elsewhere you make inventory.
- A kaizen event is six weeks of leadership around five days of work; the baseline is
  measured before, on the same definition.

## Cumulative check
**CC7.1.** (M6) A four-cavity injection mould is charted on an X̄-R chart with each subgroup
formed from the four parts of one shot. Cavity 3 runs consistently 0.04 mm larger than the
others. The chart shows no signals. The most likely explanation is:
A. The process is stable and capable · B. The cavity difference sits inside each subgroup, inflating R̄ and widening the limits so shot-to-shot shifts are hidden ✅ · C. Subgroups of four are too small for an X̄-R chart · D. The 0.04 mm offset is below the gauge resolution
`[F · B6 · Analyze · MFG · S · PRAC]` — Rational subgrouping puts only common-cause variation inside a subgroup; A is wrong because "no signals" on limits inflated by a known systematic difference is not evidence of stability.

**CC7.2.** (M5) A 2⁴⁻¹ resolution IV screening experiment shows a large apparent BC interaction. Before acting on it, the Black Belt should:
A. Add centre points to test curvature · B. Rerun the same eight runs to confirm · C. Recognise that BC is aliased with AD and run the fold-over fraction to separate them ✅ · D. Drop factor A from the model and refit
`[E2 · B5 · Apply · NEU · S · PRAC]` — In resolution IV two-factor interactions are aliased with each other; D is wrong because dropping A assumes the very thing in question.

---
v1.0 · 2026-09-20
