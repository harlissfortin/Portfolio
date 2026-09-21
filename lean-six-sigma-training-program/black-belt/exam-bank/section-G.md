# Black Belt Exam Bank — Section G: Lean at system level

Part of the Black Belt certification item bank. The blueprint, the minimally competent
candidate statement, the form-assembly constraints and the pool rules are in
[`../exam-bank.md`](../exam-bank.md); item-writing policy is
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).

**Tag format:** `[section · objective · Bloom · vertical · type · pool]` — **B7** design flow
at system level: answer the future-state design questions with the arithmetic, compute takt
and apply Little's Law with the basis stated, balance and level, size pull loops, decide setup
reduction, read OEE or a demand–capacity profile, apply the theory of constraints, and lead a
kaizen event. Type: K = concept, S = scenario judgment, X = exhibit interpretation. Correct
option ✅; rationale after the dash.

**Conventions used in these items.** Takt = available working time ÷ demand over the same
period; available time excludes planned breaks and meetings and does not exclude unplanned
downtime, changeovers or rework. Little's Law: average WIP = average throughput × average lead
time, over a window in which WIP is stable, with agreeing units. Minimum stations = work
content ÷ takt, rounded up; balance delay = (stations × takt − content) ÷ (stations × takt).
Kanban count N = D × L × (1 + α) ÷ C, rounded up (D demand per unit time, L replenishment lead
time in the same unit, α safety factor, C container quantity); a WIP cap for work items is
target lead time × throughput × (1 + α). EPEI: affordable changeovers per week = (A − R) ÷ c,
EPEI = P ÷ affordable changeovers (A available minutes, R run minutes for demand, c changeover
minutes, P part numbers). OEE = Availability × Performance × Quality on planned production
time, where Availability = operating time ÷ planned time, Performance = ideal cycle × output ÷
operating time, Quality = good ÷ output; changeovers and breakdowns are availability losses,
minor stops and reduced speed are performance losses, start-up and production rejects are
quality losses. Queueing: in the simplest single-server queue, time in queue is proportional to
ρ ÷ (1 − ρ), ρ = utilization; design rule: match capacity to the hourly profile and keep peak
utilization below about 85%. Theory of constraints: identify, exploit, subordinate, elevate,
repeat. Unless a stem says otherwise, a working day is 880 min of available time (two 8-hour
shifts less 30 min of breaks and a 10-min meeting each) and a week has five working days.

---

## Section G — Lean at system level (63 CERT)

**G1.** Exhibit — valve assembly cell, inputs for the future-state map:
| Item | Value | Source |
|---|---|---|
| Customer demand | 7,560 units per month, six-month mean | Order history |
| Working days | 21 per month | Plant calendar |
| Shift pattern | 2 shifts × 8 h | Calendar |
| Planned breaks | 30 min per shift | Calendar |
| Start-of-shift meeting | 10 min per shift | Calendar |
| Unplanned downtime | 45 min per day, mean | Downtime log |
| Changeovers | 60 min per day, mean | Changeover log |

The takt time you write on the map, with its basis, is:
A. 160.0 s per unit, on 960 min per day of shift time · B. 146.7 s per unit, on 880 min per day of working time with breaks and meetings excluded and downtime and changeovers left in ✅ · C. 129.2 s per unit, on 775 min per day after removing downtime and changeovers · D. 73.3 s per unit, on 440 min per shift against the daily demand
`[G · B7 · Apply · MFG · X · CERT]` — 7,560 ÷ 21 = 360 units per day and 2 × (480 − 40) = 880 min = 52,800 s, so 52,800 ÷ 360 = 146.7 s; C is the tempting "realistic" takt, but removing downtime and changeovers hides the losses that takt exists to expose, and A counts breaks the line does not work.

**G2.** Takt time excludes planned breaks and meetings but does not exclude unplanned downtime, changeovers or rework, because:
A. Downtime and changeovers are too variable to forecast, so they are handled by the safety factor in the kanban count instead · B. Planned breaks are the only time the customer agrees not to be served · C. Takt is the pace the customer sets on the time the process is meant to run; losses inside that time must stay visible as a gap between takt and what the process makes, not be absorbed into a slower takt ✅ · D. Excluding them would make takt shorter than the slowest station's cycle time, which is not allowed
`[G · B7 · Understand · NEU · K · CERT]` — A takt that quietly allows for downtime has made the losses permanent; A confuses two separate designs, and D is a coincidence of one cell's numbers, not a rule.

**G3.** Exhibit — claims processing:
```
Open claims (system count, Monday 08:00):        2,880
Claims closed per working day (12-week mean,
  stable on an I-MR chart):                          360
Customer promise:                                  3 working days
Manager's proposal: a 10% rise in closures per adjuster through coaching
```
The WIP that delivers the promise at current throughput, and the lead time the manager's proposal alone would deliver, are:
A. 1,080 open claims; the 10% proposal alone gives about 7.3 working days ✅ · B. 960 open claims; the 10% proposal alone gives about 7.3 working days · C. 1,080 open claims; the 10% proposal gives 3.0 working days, because closing faster is the same as capping WIP · D. 2,880 open claims can stay as they are; lead time reaches 3 working days once adjusters work the oldest claims first
`[G · B7 · Apply · TXN · X · CERT]` — Lead time = WIP ÷ throughput, so 3 × 360 = 1,080 and 2,880 ÷ 396 = 7.3 days; B divides the count by the promise, which is not a quantity in the law, and D reorders the queue, which changes who waits, not the average.

**G4.** A Green Belt in an outpatient infusion centre counts four patients in the waiting area at 08:00, divides by 118 patients per day and reports "Little's Law gives a waiting time of about 2 minutes" as the baseline for a project on the 10:00 queue. Your coaching comment:
A. The arithmetic is correct; report it as the measured wait and move on to Analyze · B. Use the 10:00 count instead, when the queue is largest, so the baseline is conservative · C. Average the 08:00 and 10:00 counts to get a representative WIP for the day · D. Little's Law is an average over a window in which WIP is stable; the waiting area fills and empties within the day, so a one-moment count gives a number that means nothing — take the baseline from arrival and chair-assignment timestamps over several weeks ✅
`[G · B7 · Analyze · HC · S · CERT]` — The law needs a stable window and agreeing units, and a snapshot of a system that ramps up every morning has neither; B replaces a low fiction with a high one, and the honest baseline is measured, not computed.

**G5.** Exhibit — bracket line, current-state data box per step; demand 360 units per day:
| Step | C/T (s) | C/O | Uptime | Notes |
|---|---|---|---|---|
| Cut | 40 | 90 min | 80% | Shared with two other product lines |
| Weld | 55 | 5 min | 98% | Dedicated |
| Assemble | 35 | none | 100% | Dedicated |
| Test | 60 | none | 95% | Dedicated |
| Pack | 30 | none | 100% | Dedicated |

Answering design questions 3, 4 and 5 (flow, pull, pacemaker) from this table:
A. Put a supermarket between every pair of steps, so that no step is ever starved; schedule Cut, which is the first process · B. Make Cut through Pack one flow cell, because every cycle time is below takt; schedule Pack, the process closest to the customer · C. Weld, Assemble, Test and Pack can flow (dedicated, short or no changeovers, high uptime); Cut cannot flow into Weld (shared, 90-min changeover, 80% uptime), so a supermarket of cut blanks sits after Cut and Weld is the pacemaker as the first process downstream of the last supermarket ✅ · D. Cut is the pacemaker, because it is the step with the most losses and therefore the one the schedule must protect
`[G · B7 · Analyze · MFG · X · CERT]` — Flow is possible where the steps are dedicated and their changeovers and uptime allow it, pull sits where it is not, and the schedule goes to one point just downstream of the last supermarket; B is attractive because cycle times all beat takt, but a shared machine with a 90-min changeover cannot run at the cell's pace.

**G6.** Exhibit — referral-to-first-appointment pathway, queue counts from the scheduling system at 08:00 on one Tuesday:
| Queue | Referrals waiting |
|---|---|
| Awaiting triage | 1,200 |
| Awaiting scheduling call | 2,000 |
| Awaiting pre-visit laboratory work | 400 |
| Scheduled, awaiting appointment date | 1,200 |

Referrals completed (first appointment held): 400 per working day, 10-week mean, stable. The Little's Law lead time from referral receipt to first appointment, counting all four queues, in working days, is:
A. 9.0 · B. 12.0 ✅ · C. 16.8 · D. 5.0
`[G · B7 · Apply · HC · X · CERT]` — 4,800 waiting ÷ 400 per day = 12.0 working days; A drops the appointment queue that the stem says to include, C converts to calendar days the stem did not ask for, and D is the largest queue alone.

**G7.** In the future-state design sequence, takt is answered first and process improvements last because:
A. Every later answer — where to flow, where to pull, where to schedule, what to release — is measured against takt, and an improvement that cannot be tied to one of those answers is a pet project rather than a design need ✅ · B. Takt is the easiest number to compute and improvements take the longest to implement · C. Improvements need the sponsor's budget, which is only approved after the map is drawn · D. Takt is a customer requirement and improvements are internal, so the customer items come first
`[G · B7 · Understand · NEU · K · CERT]` — The order is the method: each question's answer is an input to the next, and the kaizen bursts are whatever the design needs to run; B is true in practice but is not why the sequence is fixed.

**G8.** An outpatient infusion centre queues from 10:00 most days. A Green Belt proposes adding two chairs. Your walk of the eight design questions finds: chair-hours are 90% utilized on paper; the drug for most patients is not mixed until that day's laboratory results return, so chairs are held by patients waiting for their bag; about 60% of regimens could have labs drawn the day before; twelve standard regimens are 70% of volume. Your recommendation:
A. Add the two chairs; 90% utilization is above the design rule and capacity is the binding limit · B. Add the chairs and ask pharmacy to start compounding earlier in the day · C. Reduce the number of long infusions started before 10:00, which spreads the chair load without any other change · D. Prior-day labs for the eligible regimens and a small supermarket of pre-mixed standard bags replenished on a signal, which lets compounding and chair assignment flow; re-measure the queue before deciding on chairs ✅
`[G · B7 · Evaluate · HC · S · CERT]` — Questions 3 and 4 locate the reason the steps cannot flow (same-day labs) and the place a pull loop belongs (standard bags); C is a real levelling move from question 6, but on its own it leaves every chair still waiting for a bag that cannot be mixed until the labs return.

**G9.** Exhibit — invoice-processing team, last working week of the month:
```
Arrivals (invoices):   Mon 380   Tue 410   Wed 520   Thu 940   Fri 850   (week total 3,100)
Team capacity: 12 processors, 620 invoices per day in total; backlog board empty at 08:00 Monday
Design: release 620 per day (the week's pitch); anything beyond the pitch waits in a counted queue on the board
```
At close on Friday the counted queue holds:
A. 0 invoices, because the week's capacity (3,100) equals the week's arrivals · B. 320 invoices · C. 550 invoices ✅ · D. 1,170 invoices
`[G · B7 · Apply · TXN · X · CERT]` — Monday to Wednesday clear on arrival; Thursday leaves 940 − 620 = 320 and Friday 320 + 850 − 620 = 550; A is the average-thinking answer, which is exactly the fiction the counted queue exists to expose, and B forgets Friday.

**G10.** Exhibit — five-station assembly cell, balance data:
```
Station:                          1     2     3     4     5    Total
Routing standard (s):            90   105    70    70    85    420
Observed median of 10 cycles (s): 88   112    71   126    83    480
Takt 120 s (880 min per day working time, demand 440 per day)
Output, last 20 days: mean 416 units per day; overtime 1.5 h per day
```
The correct reading:
A. Station 4 at 126 s observed is the cell's bottleneck, and 880 × 60 ÷ 126 ≈ 419 per day matches the output seen; the routing's 70 s describes a line that does not exist, so balance from the observed 480 s and go to station 4 to find the 56 s ✅ · B. Content is 420 s, so 420 ÷ 120 = 3.5 → four stations at 105 s; the shortfall is a discipline problem at station 4 · C. The cell is balanced within 10% on the routing; the shortfall is explained by the overtime, which lowers daily output per hour · D. Increase takt to 126 s so that the line is balanced to what station 4 can do
`[G · B7 · Analyze · MFG · X · CERT]` — Observed content is the only content, and the output arithmetic confirms which number is real; B balances the routing and blames the operator for the gap, and D treats takt as a knob when it is the customer's number.

**G11.** Exhibit — account-onboarding cell:
```
Steps timed (median of 10 cases, min): verify identity 12, set up profile 15, configure access 9, welcome call 8   (content 44 min)
Demand 40 accounts per 8-hour day of staffed time (480 min): takt 12 min
```
The minimum number of stations and the balance delay of that configuration are:
A. 4 stations; balance delay 91.7% · B. 4 stations at 11 min each; balance delay 8.3% ✅ · C. 5 stations; balance delay 26.7% · D. 3 stations; balance delay 10%
`[G · B7 · Apply · TXN · X · CERT]` — 44 ÷ 12 = 3.67 → 4 stations, and (4 × 12 − 44) ÷ 48 = 8.3%; A reports the loading (91.7%) as the delay, C is a valid five-station option but not the minimum the stem asks for, and D rounds down to a configuration that cannot make takt.

**G12.** After removing non-value-added walking, a cell's content is 468 s against a takt of 120 s. Two options are on the table: four operators at 117 s (97.5% of takt) or five at 94 s. The stop log for the cell shows about six minor stops per 440-min shift, averaging 3 min each, and the cell has no andon. The sponsor prefers four. Your advice:
A. Four; the arithmetic works and the minor stops will be absorbed once the operators settle into the new standard work · B. Four, with the fifth operator kept on the payroll as a floater to cover stops · C. Five, permanently; a line at 97.5% loading is never a responsible design · D. Five now: the four-station margin is about 11 min per shift (2.5% of 440) and the logged stops consume about 18, so four operators cannot make takt until the stops are below the margin; write the move to four as conditional on an andon, standard work and a stop rate below about 2% ✅
`[G · B7 · Evaluate · MFG · S · CERT]` — The staffing choice is a trade-off between fragility and labor, and the stop log says which side the cell is on today; B pays for five while designing for four, and C states a rule the module does not — four at 97.5% is a valid design once the stops are controlled.

**G13.** An endoscopy unit books 96 procedures a week against room capacity of 22 per day. Mondays run 31 booked (weekend referrals are batched by the referral desk on Monday morning) and Fridays 11. The sponsor proposes opening a second room on Mondays. You recommend:
A. The second room on Mondays; 31 against 22 is a 41% shortfall that scheduling cannot close · B. Overtime on Mondays and a shorter day on Fridays, which matches staffing to the demand pattern · C. A template of 19–20 procedures per day that the referral desk releases into, because the Monday peak is created by the desk's batching, not by the patients; 96 per week against 110 of capacity needs no new room ✅ · D. Faster room turnover, which lifts Monday capacity toward 31
`[G · B7 · Apply · HC · S · CERT]` — Levelling by template removes a peak that the process itself manufactures, at no cost; B is the rational manager's response to the metric she owns and pays every week for a batching rule that costs nothing to change.

**G14.** Balancing a line or a cell to takt is the wrong first step when:
A. Demand swings widely from week to week, since a line balanced to the average is right on average and wrong every week; level the demand first or design to the profile ✅ · B. The cell has fewer than four stations, since balancing needs enough stations to redistribute work · C. The observed cycle times differ from the routing, since balancing requires the routing to be corrected first · D. The process is transactional, since balancing applies only to physical assembly
`[G · B7 · Understand · NEU · K · CERT]` — Balance answers "how is work distributed against a pace," which presumes a pace worth designing to; C reverses the lesson — the observed times are the ones to balance from, and the routing is what needs correcting afterwards.

**G15.** Exhibit — ward two-bin system for IV start kits:
| Input | Value | Source |
|---|---|---|
| Usage | 30 kits per day, mean; SD 9 per day | Three-month consumption record |
| Replenishment lead time | 2 days, signal to bin on ward | Timed over 10 replenishments |
| Bin size | 15 kits | Central supply pack |
| Safety factor α | 30% | SD ÷ mean = 0.30 |

The number of bins to put in the loop is:
A. 3 · B. 4 · C. 5 · D. 6 ✅
`[G · B7 · Apply · HC · X · CERT]` — N = 30 × 2 × 1.30 ÷ 15 = 5.2, rounded up to 6; C rounds down and would run short on the variable days the safety factor exists for, and B omits α altogether.

**G16.** Exhibit — machined-body supermarket between machining and assembly:
```
Before setup reduction:  D = 400 bodies per day   L = 0.50 day (84-min changeover + run + move)   C = 25   α = 20% (breakdown history)
After setup reduction:   changeover 42 min, L measured again at 0.25 day; D, C and α unchanged
Machining is not the constraint: it runs about 60% loaded against takt
```
What the setup reduction bought:
A. About 400 min per week of machining capacity, which lifts cell output by roughly 10% · B. The supermarket falls from 10 cards (250 bodies) to 5 cards (125 bodies), which by Little's Law halves the time a body waits there; output does not change, because machining was not the constraint ✅ · C. Nothing until D changes, because the kanban count depends on demand and demand is unchanged · D. A reason to raise α, because a shorter lead time leaves less time to recover from a breakdown
`[G · B7 · Analyze · MFG · X · CERT]` — 400 × 0.5 × 1.2 ÷ 25 = 9.6 → 10 and 400 × 0.25 × 1.2 ÷ 25 = 4.8 → 5; A is what changeover minutes buy only on the constraint, which the stem closes off.

**G17.** Exhibit — underwriting stream, CONWIP design:
| Input | Value |
|---|---|
| Lead-time promise | 2 working days |
| Throughput | 75 files per working day (10-week mean, stable) |
| Safety factor α | 20% |
| Files in process today | 310 |

The WIP cap and what it requires today:
A. Cap 180 files; intake stops releasing until WIP drains to 180, which takes about 1.7 working days at 75 completions per day if intake pauses entirely ✅ · B. Cap 150 files; intake keeps releasing at its normal rate and the excess clears on its own · C. Cap 310 files, frozen at today's count, and reduced by 10% a month · D. Cap 180 files; today's 310 is inside tolerance because the safety factor covers the difference
`[G · B7 · Apply · TXN · X · CERT]` — 2 × 75 × 1.2 = 180, and 310 − 180 = 130 files drain at 75 per day; B is the cap without α and leaves intake releasing, which is push with a number on it, and C is a WIP freeze that makes today's 4.1-day lead time the design.

**G18.** A service company launched a new product line five weeks ago and wants a WIP cap on its fulfilment queue. Weekly demand over the five weeks: 40, 130, 25, 210, 60 requests. A team member sizes the cap from the five-week mean and a 20% safety factor. Your advice:
A. Use the five-week mean; the safety factor is there to cover this kind of variation · B. Use the highest week, 210, so the cap never starves the team · C. The demand coefficient of variation is about 0.8 on five points from a launch; a count computed from it is a guess — say so, start with a generous cap, review it every month against the data and trim it once demand shows a stable mean, and do not present the number as a designed loop ✅ · D. Do not use a cap at all; a WIP cap works only for physical parts with a container quantity
`[G · B7 · Evaluate · TXN · S · CERT]` — The formula assumes a demand history it can trust, and a five-week launch has none; A dresses a guess as a design, and D throws away a tool whose logic (target lead time × throughput) applies to work items exactly as it does to parts.

**G19.** A pull loop's kanban count is reviewed monthly in order to:
A. Raise it whenever a stock-out has occurred, so that the loop never fails the same way twice · B. Reduce it deliberately, because the purpose of pull is to expose problems at lower WIP, and the current count is the amount of inventory the loop's problems currently require ✅ · C. Recompute it from the routing's standard lead time as the routing is updated · D. Confirm that the cards are all physically present, which is an audit of the visual control
`[G · B7 · Understand · NEU · K · CERT]` — The count is a ceiling to lower, not a stock level to protect; D is a real routine, but it is a card audit, not the reason the count is reviewed.

**G20.** Exhibit — stamping press, EPEI inputs (per five-day week):
| Input | Value |
|---|---|
| Available time A | 4,400 min per week |
| Run time R for demand | 3,700 min per week |
| Changeover time c | 70 min, median of three videoed changeovers |
| Part numbers P | 5 |

The EPEI (every part every interval) in working days is:
A. 0.5 · B. 1.25 · C. 5.0 · D. 2.5 ✅
`[G · B7 · Apply · MFG · X · CERT]` — (4,400 − 3,700) ÷ 70 = 10 changeovers per week, and 5 ÷ 10 = 0.5 week = 2.5 working days; A reports the week fraction as days, and B is the EPEI after a changeover halved to 35 min, which has not happened.

**G21.** Exhibit — press changeover, elements from the video (min); the press is stopped for all of them today:
| Element | Min | Where done today |
|---|---|---|
| Fetch next die from store | 12 | After the press stops |
| Loosen and remove old die | 9 | Press stopped |
| Fetch gauges from cabinet | 6 | After the press stops |
| Fit new die | 11 | Press stopped |
| Adjust die height by trial and error | 14 | Press stopped |
| Complete changeover paperwork | 5 | Before restart |
| First-off check | 8 | Press stopped |
| **Total** | **65** | |

The team's first pass moves every element that can be done while the press runs to external, removes the height adjustment with pre-set shims, and streamlines nothing. The press-stopped time after the first pass is:
A. 28 min ✅ · B. 42 min · C. 51 min · D. 20 min
`[G · B7 · Analyze · MFG · X · CERT]` — Fetching the die, fetching gauges and paperwork (23 min) become external and the 14-min adjustment disappears: 65 − 23 − 14 = 28; B moves the external work but keeps the adjustment, and D also drops the first-off check, which is internal and has not been streamlined.

**G22.** Operating-room turnover runs a median 41 min from patient out to patient in. Cart preparation and the instrument count are done after the room empties because the standard was written when one team did everything. Moving both external brings turnover to about 26 min. The surgical director wants the change so that each room "fits another case a day". Your reading for the sponsor:
A. Agree; 15 min per turnover on three turnovers is 45 min, and a room at 45 min of saving per day fits one more case · B. Disagree; the change is not worth making unless it adds a case · C. On a median case of 2 h, 15 min × 2–3 turnovers does not buy a case; the leadership reason is predictable start times, which levels the load on the recovery unit downstream and removes the late-day cancellations — say that, and let the added case come only where the schedule already shows it ✅ · D. Agree, provided the terminal clean is also moved external
`[G · B7 · Evaluate · HC · S · CERT]` — What the minutes buy is the Black Belt's question, and here they buy predictability, not capacity; A is the arithmetic a sponsor will do, and it fails against the case length; D moves a genuinely internal element and would compromise the clean.

**G23.** Two machines in a stream: the press (the constraint, changeover 84 min, loaded above takt) and the deburring station (changeover 40 min, loaded about 60% against takt). The engineer proposes the first setup-reduction event on deburring "because it is easier and we will learn the method". Your decision:
A. Agree; a quick win on deburring builds the skill for the harder press event · B. Run the event on the press: minutes saved on a non-constraint improve a number nobody's lead time depends on, while every minute saved on the press is either smaller lots or more output; use the easier deburring changeover as the training exercise inside the press event if a warm-up is needed ✅ · C. Run both events in parallel, since the method is the same · D. Agree, because deburring's shorter changeover means a smaller supermarket ahead of it, which reduces total inventory
`[G · B7 · Evaluate · MFG · S · CERT]` — Setup reduction is chosen by where the minutes matter, not by difficulty; D is true in the small (fewer cards ahead of deburring) but the inventory that governs lead time is queued ahead of the press.

**G24.** Exhibit — moulding machine, one day's OEE as calculated by the team:
```
Planned production time:   880 min (two shifts less breaks and meetings)
Changeovers:               60 min — "scheduled, so excluded from planned time" → team's planned time 820 min
Breakdowns:                41 min → operating time 779 min → Availability = 779 ÷ 820 = 95.0%
Ideal cycle 0.50 min/unit; output 1,400 → Performance = 700 ÷ 779 = 89.9%
Good units 1,358 → Quality = 97.0%
OEE = 0.950 × 0.899 × 0.970 = 82.8%
```
Your review:
A. 82.8% is right; a scheduled changeover is planned time by definition · B. Changeovers are an availability loss, so Availability = 779 ÷ 880 = 88.5% and OEE = 0.885 × 0.899 × 0.970 = 77.2%; moving changeovers into planned time is the standard way an OEE figure is inflated ✅ · C. OEE = 79.6%, because Quality should not be applied when the rejects are reworked · D. OEE = 68.3%, because Performance must be computed on planned time, not operating time
`[G · B7 · Analyze · MFG · X · CERT]` — The six big losses put changeovers in availability, and the 5.6-point gap is exactly the changeover time removed from the denominator; D double-counts the downtime by putting it in both Availability and Performance.

**G25.** Exhibit — packaging machine, one day:
```
Planned production time 880 min
Downtime log: breakdowns 38 min, changeovers 52 min   (the log has no "minor stop" code)
Ideal cycle 0.40 min/unit; output 1,620 units; good 1,590
```
The largest of the three losses, in minutes, and where it appears in the plant's data:
A. Availability, 90 min; it is the whole of the downtime Pareto · B. Quality, 30 units; it appears in the scrap report · C. Availability, 132 min; the changeovers are under-recorded · D. Performance, about 142 min (790 min operating − 648 min of ideal-cycle output); it appears nowhere, because the minor stops and slow running that make it up are never logged ✅
`[G · B7 · Analyze · MFG · X · CERT]` — Operating time 880 − 90 = 790, ideal output time 0.40 × 1,620 = 648, so 142 min is lost to stops too short to log and speed below ideal, against 90 min of logged downtime and 12 min (30 × 0.40) of quality loss; A is the answer the downtime Pareto gives, which is why it is wrong.

**G26.** A plant manager proposes putting OEE on every machine's board as an operator performance measure, with a target of 85% "because that is world class". Your advice:
A. OEE is a diagnostic of where a machine loses time, read against that machine's own trend and worked on the constraint; as an operator scorecard it invites moving changeovers into planned time and running non-constraints for inventory, and the 85% figure is folklore rather than a benchmark for any particular machine ✅ · B. Agree, but set the target at 65% first and raise it to 85% over a year · C. Agree, provided the target applies only to the constraint · D. Agree, since OEE is already computed by the machine controllers and costs nothing to display
`[G · B7 · Evaluate · MFG · S · CERT]` — The measure is fine and the use is the problem; C fixes the non-constraint issue but keeps a scorecard that rewards the wrong classification of losses.

**G27.** In total productive maintenance, autonomous maintenance means:
A. Condition-monitoring sensors that schedule maintenance without human intervention · B. Maintenance planned from mean-time-between-failure data rather than from a fixed calendar · C. Operators own the routine cleaning, inspection and lubrication of their own equipment and see the early signs of a loss, with maintenance specialists doing the planned and focused work ✅ · D. Each production team maintains its own spare-parts stock so that a breakdown does not wait on the storeroom
`[G · B7 · Understand · NEU · K · CERT]` — Autonomous refers to the operators, not to the equipment; A describes condition-based maintenance and B planned maintenance, which are the other pillars.

**G28.** Exhibit — emergency department, arrivals against staffed physician capacity (weekday mean; each physician takes 2.0 new patients per hour):
| Block | Arrivals per h | Physicians on | Capacity per h |
|---|---|---|---|
| 07:00–11:00 | 6 | 4 | 8 |
| 11:00–15:00 | 11 | 4 | 8 |
| 15:00–19:00 | 12 | 4 | 8 |
| 19:00–23:00 | 9 | 4 | 8 |
| 23:00–03:00 | 4 | 4 | 8 |
| 03:00–07:00 | 3 | 4 | 8 |

The correct reading:
A. Capacity is 192 per day against 180 arrivals, so the department is 6% over-provisioned; the waits are a triage-discipline problem · B. The deficit is 12 patients per day, the difference between capacity and arrivals · C. The shortfall is 44 patients a day, the sum of every hour's arrivals above 8 · D. By 23:00 about 32 patients are queued (3 + 4 + 1 short per hour over the three 4-hour blocks), cleared overnight while physicians run about 44% utilized; the fix is the shape of the roster, not its size ✅
`[G · B7 · Analyze · HC · X · CERT]` — Waiting is built hour by hour, and a flat roster against a peaked profile queues patients in the afternoon and idles physicians at night; A is the daily-average reading that a profile exists to defeat.

**G29.** Exhibit — contact-centre queue, time in queue relative to the value at 50% utilization (single-queue approximation, ρ ÷ (1 − ρ)):
```
Utilization ρ:      0.50   0.70   0.80   0.90   0.95
Relative wait:      1.0    2.3    4.0    9.0    19.0
```
The centre runs at 80% utilization. Finance proposes cutting staff to reach 90% "for a 12% saving". The effect on average time in queue, other things unchanged:
A. About 12% longer, in proportion to the change in utilization · B. About 2.25 times longer, because time in queue rises from 4.0 to 9.0 on this scale ✅ · C. About 9 times longer · D. Unchanged, because capacity still exceeds demand at 90%
`[G · B7 · Apply · TXN · X · CERT]` — Waiting is non-linear in utilization, and the last 10 points cost more than the first 30; A is the linear reading that makes the staffing cut look free, and C compares 90% to 50% rather than to today.

**G30.** An emergency-department team computes a takt of 9 minutes (160 visits ÷ 24 h) and proposes staffing so that "one patient is seen every 9 minutes around the clock". Your advice:
A. Takt does not apply: arrivals swing from about 3 to 12 per hour within the day, more than the process can absorb, so a single pace describes no hour of it; build the hourly demand–capacity profile by weekday and staff to that ✅ · B. Recompute takt on working time rather than clock time, which will give a shorter and more realistic figure · C. Use takt for the day shift only, where arrivals are steadiest · D. Takt is correct; the staffing model should be Erlang C with a mean arrival rate of 6.7 per hour
`[G · B7 · Evaluate · HC · S · CERT]` — Takt is a design pace for demand that is steady enough to pace to, and an emergency department is the standard example of when it is not; D applies a queueing model to the same wrong mean.

**G31.** For a service whose arrivals vary by hour, the demand–capacity design rule is:
A. Staff to the daily mean plus one standard deviation, which covers the peaks · B. Staff to the peak hour, so that no hour exceeds capacity · C. Match staffed capacity to the hourly profile, keep peak-hour utilization below about 85%, and reduce variability in arrivals and service before adding staff ✅ · D. Hold utilization near 100% in every hour, since idle capacity is a cost the customer pays
`[G · B7 · Understand · NEU · K · CERT]` — The profile is the design object, and the 85% ceiling comes from the non-linear growth of waiting; B is safe and expensive, and D is the rule that produces the queues.

**G32.** Exhibit — mortgage stream, capacity per working day (files) and demand:
```
Intake 100   Processing 85   Appraisal review 65   Underwriting 80   Closing 90
Demand: 95 files per day.   Backlog ahead of appraisal review: 620 files, growing about 20 per day
Manager's proposal: add an intake clerk (+15 files per day at intake)
```
The correct reading:
A. Stream output is 85 per day, limited by processing; the intake clerk closes most of the gap to 95 · B. Every step should be raised to 95 per day, starting with the cheapest · C. The intake clerk is the right first step because the backlog is upstream of review, so faster intake clears it · D. Stream output is 65 per day, set by appraisal review; processing feeds review at 85, hence the pile growing at 20 per day, and more intake adds to the pile without moving output — exploit review first, then release intake at review's rate ✅
`[G · B7 · Analyze · TXN · X · CERT]` — Throughput equals the constraint's throughput, and every step ahead of it that runs faster only builds WIP; C is the manager's rational response to the backlog metric she owns, and it makes that backlog worse.

**G33.** A cell's tester is the constraint: at 2.0 min per test it could make 440 tests in an 880-min day, but it sits idle for the operators' 60 min of breaks (410 tests) and about 8% of tests are retests of units that failed and were reworked, so about 380 good units a day leave the cell against a demand of 440. The engineer requests a second tester. Your decision:
A. Exploit first: stagger breaks so the tester never stops (440 tests), and move the visual pre-check upstream so most failures never reach the tester (retests toward about 2%, roughly 431 good units); then elevate for whatever gap remains ✅ · B. Buy the second tester now; a 14% shortfall is beyond what exploitation can close · C. Move the tester's breaks to the end of the shift, which adds 60 min of test time and lifts output to 440 good units · D. Add a pre-test station upstream, which raises the cell's throughput to 440 without touching the tester
`[G · B7 · Analyze · MFG · S · CERT]` — Two exploitation moves close about 51 of the 60-unit gap at no capital cost; C keeps the idle minutes (breaks moved are still breaks) and ignores the retests, and D improves a non-constraint.

**G34.** Improving the capacity of a step that is not the constraint changes:
A. Throughput, because every step's capacity contributes to the stream's rate · B. WIP ahead of the constraint (or idle time at the improved step), not throughput, because the stream's output is fixed by the constraint's rate ✅ · C. Lead time directly, because faster steps move work through the stream sooner · D. The location of the constraint, which always moves to the step just improved
`[G · B7 · Understand · NEU · K · CERT]` — Output cannot exceed the slowest step, so extra speed elsewhere shows up as inventory or waiting; C reverses Little's Law, since the extra WIP lengthens lead time.

**G35.** In a loan-approval stream every step has capacity above demand, yet lead time is 9 working days because applications wait for a credit committee that meets on Thursdays. The team wants to "elevate the constraint" by adding an analyst to the committee's preparation team. Your advice:
A. Agree; the preparation team is the constraint and an analyst elevates it · B. Add a second analyst as well, since the committee's decision rate then doubles · C. The constraint is a policy (weekly batching), not a capacity; "elevate" here is a management decision — a committee that meets daily or delegates decisions below a threshold — and no analyst changes a calendar ✅ · D. Subordinate the stream to the committee by releasing applications only on Fridays, which reduces WIP
`[G · B7 · Evaluate · TXN · S · CERT]` — When the constraint is a rule, the five steps still apply but the elevation is not a purchase; D is technically subordination and leaves every applicant waiting a week by design.

**G36.** Exhibit — draft kaizen event charter, hospital, submitted for the pre-event review:
| Field | As drafted |
|---|---|
| Scope | "Patient flow across the hospital" |
| Primary metric | "Patient satisfaction" (survey, reported quarterly) |
| Target | "Improve" |
| Team | 11: eight department managers, two analysts, the Black Belt |
| Decision rights | Not written |
| Backfill | "To be arranged" |
| Baseline | "Will be collected during the event" |

Your review decision:
A. Approve with one change: replace patient satisfaction with a metric the team can measure daily · B. Approve; a broad scope and senior team give the event the authority to make changes stick · C. Reject the team composition only; managers should be replaced by analysts who can do the measurement · D. Do not schedule: the charter fails on scope (not a segment you can walk in 20 min), metric (no operational definition, not measurable within the event), target (no number), team (no one who does the work), decision rights and backfill (unwritten) and baseline (none before the event); rewrite it with the kit and re-review in two weeks ✅
`[G · B7 · Evaluate · HC · X · CERT]` — Every field is the one the failure modes trace back to, and an event run on this charter is theatre by design; A fixes the metric and leaves a scope no team can walk and a baseline that does not exist.

**G37.** On day 4 of a kaizen event in a hospital pharmacy the team discovers that the four-week baseline of "turnaround time" was counted from order verification to dispensing, while the event's timed samples count from order entry to dispensing, as the new standard work defines it. The event leader proposes adjusting the baseline "by the typical 20 minutes between entry and verification". Your decision:
A. Accept the adjustment; 20 minutes is well known and the report-out is tomorrow · B. Do not reconstruct a baseline: report day 5 as "x minutes on the new definition, on an n-order sample", start the 30-day chart on the new definition from today, and state plainly that no before-and-after comparison exists yet ✅ · C. Recount the timed samples on the old definition so that the comparison is like for like, and change the standard work back to match · D. Report both numbers and let the sponsor decide which is the improvement
`[G · B7 · Evaluate · HC · S · CERT]` — Changing an operational definition between before and after, or reconstructing a baseline from memory, is the data-ethics case in its plainest form; C makes the numbers comparable by putting the worse definition into the standard, which is the wrong direction to be consistent in.

**G38.** At the day-2 sponsor check-in of an accounts-payable kaizen event, the sponsor asks the team to "also fix the supplier invoice format problem while you are in there". The supplier format issue sits outside the charter's scope and needs procurement. As event leader you:
A. Thank the sponsor, write the request on the issue list with a note that it needs procurement, and hold the charter's scope; offer it as a candidate for the next event or the 30-day list if a countermeasure inside scope depends on it ✅ · B. Accept it, because the sponsor owns the charter and can change its scope at any check-in · C. Accept it if the team votes to, since the team owns the future state · D. Refuse it and ask the sponsor to leave the check-in to the team
`[G · B7 · Apply · TXN · S · CERT]` — Scope growth on day 2 is the named failure mode, and the leader's job that day is to stop it without losing the sponsor; B is the reason the day-2 check-in is where events lose their shape.

**G39.** On day 3 of a kaizen event the trial of the new matching cell shows that the ERP screen lacks a "hold reason" field the standard work needs; the IT team lead says it is a two-week configuration change. The right handling on the day-5 report-out:
A. Report the countermeasure as done, since the standard work is written and the field is a detail · B. Delay the report-out until the field is live · C. Drop the hold-reason step from the standard work so that the event can report a completed countermeasure · D. Put the field on the 30-day list with the IT lead as owner and a date, run the standard work with a paper workaround until then, and say so at the report-out ✅
`[G · B7 · Apply · TXN · S · CERT]` — The charter's decision rights say what needs whom, and an IT change is the standard example of a 30-day item rather than a "done"; A is how a 30-day list acquires items nobody owns.

**G40.** On day 5 of a kaizen event in an outpatient clinic, a 40-patient timed sample shows 2.1 days from referral to scheduled appointment against a four-week baseline of 6.4. The event leader plans to present "a 67% reduction in lead time" to leadership. Your coaching:
A. Present it as drafted; a 40-patient sample against a four-week baseline is a like-for-like comparison · B. Present a 60% reduction instead, to leave a margin for the sample · C. The team members present, not the leader, and the sentence is "2.1 days on a 40-patient sample; the 30-day chart on the same metric will confirm or not" — a day-5 sample is evidence of a trial, and the comparison to the baseline is made on the chart, not at the podium ✅ · D. Postpone the report-out 30 days so that the chart is available
`[G · B7 · Evaluate · HC · S · CERT]` — Who presents and what is claimed are both rubric lines, and the honest claim names its sample; A is the announcement that turns an event into theatre when the chart later disagrees.

**G41.** Exhibit — 30-day list handed to the process owner at the close of a five-day claims-intake kaizen event:
```
Items: 38     Items with a named owner: 17     Items with a date: 23 (15 of them "ASAP")
Sample items: "Implement CRM hold-status module" · "Train all 60 staff on the new standard" · "Ask Finance about the write-off rule" · "Move printer" · "Rewrite the intake standard for exceptions (owner: Black Belt)"
```
Your review as coach:
A. Accept it; a long list shows the team found a lot and the owner can prioritize · B. Cut it to at most ten items, each with one owner and a date, and move the rest to the issue list; the CRM module is a project, not a 30-day item, and goes to the sponsor as such; the owner reviews the list weekly with the Black Belt, and the Black Belt should not be the owner of the standard the team writes ✅ · C. Keep all 38 but assign every unowned item to the process owner · D. Accept it, provided "ASAP" is replaced by the report-out date plus 30 days for every item
`[G · B7 · Evaluate · TXN · X · CERT]` — A 30-day list of 40 items of which none closes is the named failure mode, and the fix is fewer items with real owners; C makes the process owner the owner of everything, which is the same list under one name.

**G42.** A kaizen charter writes down decision rights — what the team may change without asking and what needs whom — in order to:
A. Let the team change layout, standard work and visual controls inside its area on day 3 and 4 without waiting, and route anything touching IT or another department to a named person, so that the event neither stalls nor oversteps ✅ · B. Protect the sponsor from being asked for decisions during the event · C. Record which manager is accountable if the event fails · D. Give the facilitator authority over the team members' managers for the week
`[G · B7 · Understand · NEU · K · CERT]` — Decision rights are what make a five-day event able to act and safe to act; B is half the story, since the sponsor is still on the day-2 check-in and the escalation path, and D is an authority a Black Belt does not have.

**G43.** On the afternoon of day 2, the event team is stuck between two future-state layouts. The event leader, who has designed six cells before, draws the layout she knows will work, and the team adopts it. Your observation as the requirement-4 observer:
A. Good facilitation: the leader used her expertise to keep the event on schedule · B. Acceptable, provided the team is given the chance to change it on day 3 · C. A minor issue; the layout is only the day-2 draft · D. The leader facilitated content instead of process; the team's future state is now hers, which is the failure mode the rubric names — the move was to ask what each layout does to the walk distance and the WIP, put both on cardboard on day 3 and let the timed trial decide ✅
`[G · B7 · Evaluate · TXN · S · CERT]` — The leader's job is the basis of every number and the safety of the room, not the answer; B is the accommodation that leaves the team defending a layout it did not choose.

**G44.** Exhibit — outpatient infusion centre, one working day (10 h):
| Item | Value |
|---|---|
| Chairs | 30 |
| Patients per day | 110 (six-month mean) |
| Mean chair time | 2.4 h |
| Queue at 10:00, median | 9 patients waiting for a chair |

The correct statement about capacity:
A. Chair-hours (300) exceed demand (264), so capacity is sufficient and the queue is a staff-behavior problem · B. The takt is 600 ÷ 110 = 5.5 min, so a chair must turn over every 5.5 min for the centre to keep up · C. Nominal utilization is 264 ÷ 300 = 88%, above the 85% design ceiling, and starts bunch in the morning, so morning utilization is higher still; level the starts across the day and shorten chair time (for example, prior-day labs) before deciding on chairs ✅ · D. Utilization is 88%, so add four chairs to bring it to 78% and clear the queue
`[G · B7 · Analyze · HC · X · CERT]` — Waiting grows non-linearly with utilization and the morning profile is what matters, not the daily average; D is the capacity answer, and it is not wrong in arithmetic but is the last lever, not the first.

**G45.** Exhibit — claims lead-time estimate prepared by an analyst:
```
Open claims (system count, Monday 08:00): 2,400   — of which 700 are on hold awaiting customer documents
Closure letters sent per working day (12-week mean): 300
Claims closed per working day, all outcomes incl. withdrawals (12-week mean): 380
Analyst's lead time: 2,400 ÷ 300 = 8.0 working days
Operational definition of lead time for the project: open to closed, all outcomes, hold time included
```
The correct estimate and the correction:
A. 8.0 working days as stated; letters are the customer-facing closure · B. 6.3 working days (2,400 ÷ 380): the numerator and denominator must count the same unit, and the definition says claims closed by any outcome; keep the 700 on hold in the count and expect the measured lead time to differ from this average because the on-hold claims wait longest ✅ · C. 4.5 working days (1,700 ÷ 380), because on-hold claims are not in process · D. 5.7 working days (1,700 ÷ 300), correcting both the units and the on-hold claims
`[G · B7 · Analyze · TXN · X · CERT]` — Little's Law fails when units disagree, and letters are not claims; C removes the on-hold claims that the project's own definition says are inside lead time, which is a change of operational definition dressed as a correction.

**G46.** A valve cell has a takt of 146.7 s (880 min per day, 360 units per day) and station cycle times of 95, 118, 74, 131 and 88 s. It makes about 334 units a day, and the sponsor asks for a sixth station "because the cell is short of capacity". The downtime log shows about 150 min a day of breakdowns and waiting for material. Your reply:
A. No station exceeds takt; at 880 min the slowest station could make about 403 per day, and (880 − 150) × 60 ÷ 131 ≈ 334 explains the output exactly — the cell is short of availability, not stations; work the breakdowns and the material supply before adding anyone ✅ · B. Agree; six stations bring the load per station to about 84 s and restore the margin · C. Rebalance the five stations so that station 4 is below 120 s, which recovers the 26 units · D. Raise takt to allow for the downtime, which shows that the cell is actually on pace
`[G · B7 · Analyze · MFG · S · CERT]` — Takt is computed without removing downtime precisely so that this gap is visible as a loss; B adds labor to a cell whose stations are all inside takt, and D hides the loss in the number that exists to show it.

**G47.** Exhibit — outpatient referral scheduling desk, future-state proposal submitted for rubric item I3:
```
Open referrals (Monday 08:00 system count, 8-week mean): 1,800
Referrals scheduled per working day (8-week mean, stable): 150
Current lead time (Little's Law): 12.0 working days       Target: 5 working days
Proposed countermeasure: "schedule the oldest referrals first every morning"
```
Your review:
A. Approve; working the oldest first shortens the tail of the distribution, which is what the target measures · B. Approve, with the target restated as a median rather than a mean · C. Return it: the target should be 6.0 days, since halving lead time is the most an event can achieve · D. Return it: an average lead time of 5 days at 150 per day requires WIP of 750, or throughput of 360 per day at today's WIP; the proposal changes which referrals wait, not how many, so the average cannot move — the design needs a release cap at intake or a capacity change, with the arithmetic shown ✅
`[G · B7 · Evaluate · HC · X · CERT]` — Lead time = WIP ÷ throughput, and a sequencing rule changes neither term; A is true about the tail and silent about the average that the target names.

**G48.** Exhibit — Yamazumi data for a five-station cell, seconds per unit (VA = value-added, NNVA = necessary non-value-added, NVA = non-value-added, removable):
| Station | VA | NNVA | NVA | Total |
|---|---|---|---|---|
| 1 | 60 | 20 | 15 | 95 |
| 2 | 80 | 25 | 13 | 118 |
| 3 | 50 | 12 | 12 | 74 |
| 4 | 85 | 20 | 26 | 131 |
| 5 | 62 | 14 | 12 | 88 |
| **Total** | **337** | **91** | **78** | **506** |

Takt 120 s. After the removable NVA is taken out and the cell is rebalanced, the minimum number of stations and their load are:
A. 3 stations at 143 s, because 428 ÷ 120 rounds to 3 · B. 4 stations at 126.5 s, because 506 ÷ 4 = 126.5 · C. 4 stations at about 107 s (428 ÷ 120 = 3.57, rounded up), about 89% of takt ✅ · D. 5 stations at 86 s, because NNVA cannot be rebalanced across stations
`[G · B7 · Analyze · MFG · X · CERT]` — Only the NVA segment leaves the content (506 − 78 = 428), and the station count is rounded up; B rebalances without removing anything and lands above takt at every station, and A rounds down to a loading that cannot make takt.

**G49.** A hospital laboratory receives about 70% of the day's inpatient specimens between 07:00 and 09:00, when the wards draw morning bloods, and the analyzers then idle from 11:00 to 15:00. Turnaround targets are missed only for the morning arrivals. The laboratory manager asks for a third analyzer. You propose first:
A. A third analyzer, because the morning peak exceeds the two analyzers' capacity · B. Level the arrivals: stagger the draw times across wards (and start phlebotomy earlier on the wards whose results are needed first), so the same specimens arrive across four hours instead of two; re-measure turnaround before deciding on equipment ✅ · C. Prioritize the specimens from the wards with the earliest rounds, which meets the targets that matter most · D. Extend the morning shift by two hours to run the backlog
`[G · B7 · Apply · HC · S · CERT]` — The peak is created upstream by a scheduling habit, and levelling it needs no capacity; C is triage inside the peak and leaves the peak where it is.

**G50.** Exhibit — prior-authorization desk, WIP cap inputs:
| Input | Value | Source |
|---|---|---|
| Lead-time promise | 4 working days | Service agreement |
| Throughput | 90 requests per working day | 12-week mean, stable on an I-MR chart |
| Safety factor α | 15% | Day-to-day variation in completions (CV ≈ 0.15) |

The WIP cap on requests in process is:
A. 414 requests ✅ · B. 360 requests · C. 450 requests · D. 104 requests
`[G · B7 · Apply · HC · X · CERT]` — 4 × 90 × 1.15 = 414; B omits the safety factor the stem specifies, and C uses 25%, which is a number in the module's range but not the one the data support.

**G51.** A team designing a future state places a supermarket between two steps that are dedicated, adjacent, have no changeover and both run below takt. The consequence:
A. Better protection against breakdowns at either step, at no cost · B. A shorter lead time, since the downstream step never waits · C. Nothing, since a supermarket between flowing steps holds only a few units · D. Added inventory and lead time with no design reason; a supermarket belongs only where flow is not possible (shared, distant, long changeover, unreliable), and between steps that can flow the answer to question 3 is to flow ✅
`[G · B7 · Understand · NEU · K · CERT]` — Pull is what you do where you cannot flow, not an improvement over flow; A is the "just in case" logic that fills a plant with supermarkets.

**G52.** Pitch, in future-state design, is:
A. The time between two consecutive units leaving the pacemaker · B. The smallest lot size the constraint can run economically · C. The increment of work released to the pacemaker and taken away from it — takt × pack quantity in a plant, or "the next hour's cases" in a service — which sets how often the schedule is checked against reality ✅ · D. The difference between takt and the slowest station's cycle time
`[G · B7 · Understand · NEU · K · CERT]` — Pitch is the management time-frame that makes a missed takt visible within the hour rather than at the end of the shift; A is takt itself.

**G53.** Exhibit — stamping press, effect of a setup-reduction event:
```
A = 4,400 min per week   R = 3,560 min per week   P = 8 part numbers   demand 360 units per day (all parts)
Changeover c: 84 min before the event, 42 min after (median of three videoed changeovers each)
The press runs about 81% loaded against takt and is not the stream's constraint
```
What the halved changeover buys, and what it does not:
A. Output rises by about 10%, because 10 changeovers × 42 min = 420 min per week of press time is freed · B. EPEI falls from 4.0 to 2.0 working days, so the lot per interval falls from about 1,440 to about 720 units across the eight parts and the average cycle stock from about 720 to about 360 units; output does not change, because the press is not the constraint ✅ · C. Nothing until demand changes, since EPEI is fixed by the number of part numbers · D. EPEI is unchanged because P is unchanged; the benefit is fewer operator hours on changeovers
`[G · B7 · Apply · MFG · X · CERT]` — (4,400 − 3,560) ÷ 84 = 10 changeovers per week → EPEI 8 ÷ 10 = 0.8 week = 4.0 days, and at 42 min, 20 per week → 2.0 days; A is what freed press minutes buy only on the constraint, which the stem closes off.

**G54.** Exhibit — blow-moulding machine, one 440-min shift, OEE as calculated by the team:
```
Planned production time 440 min; breakdowns 22 min; changeover 30 min → operating 388 min → Availability 88.2%
Ideal cycle 0.25 min/unit; output 1,400 → Performance = 350 ÷ 388 = 90.2%
Rejects: 40 at start-up after the changeover (scrapped as "normal warm-up"), 30 during the run
Quality = (1,400 − 30) ÷ 1,400 = 97.9%      OEE = 0.882 × 0.902 × 0.979 = 77.9%
```
The corrected OEE:
A. 75.6%; start-up rejects are a quality loss like any other, so Quality = 1,330 ÷ 1,400 = 95.0% ✅ · B. 77.9% as calculated; warm-up scrap after a changeover is part of the changeover · C. 66.6%; Performance should be computed on planned time, giving 350 ÷ 440 = 79.5% · D. 83.8%; Performance should be left out because the machine ran at ideal cycle whenever it ran
`[G · B7 · Analyze · MFG · X · CERT]` — Start-up rejects are the fifth of the six big losses, and 0.882 × 0.902 × 0.950 = 75.6%; B moves a quality loss into a category where it has already been counted as time, so the 40 units disappear from OEE entirely.

**G55.** Exhibit — CT scanning, one weekday, arrivals against technologist capacity (each technologist scans 3 patients per hour):
| Block | Arrivals per h | Technologists on | Capacity per h |
|---|---|---|---|
| 08:00–10:00 | 3 | 2 | 6 |
| 10:00–16:00 | 6 | 2 | 6 |
| 16:00–18:00 | 6 | 1 | 3 |
| 18:00–20:00 | 2 | 1 | 3 |

Daily overtime runs about an hour. The redesign you propose first:
A. A third technologist from 16:00 to 20:00 · B. Approve the overtime as standing, since daily capacity (60) exceeds daily arrivals (58) · C. Shorten the scan protocol so that each technologist does 4 per hour · D. Move the second technologist's shift from 08:00–16:00 to 10:00–18:00: capacity then matches arrivals in every block (3 vs 3, 6 vs 6, 6 vs 6, 3 vs 2), the 6-patient queue that builds between 16:00 and 18:00 never forms, and paid hours are unchanged ✅
`[G · B7 · Apply · HC · X · CERT]` — The mismatch is the shape of the roster, and two idle technologist-hours in the morning are the same two that are missing in the late afternoon; A buys capacity the profile does not need, and B is the daily-average reading that the queue at 16:00 refutes.

**G56.** Two service queues run at the same 85% utilization; one has average waits four times the other's. The most likely reason:
A. The busier queue has more servers, and more servers always lengthen waits at the same utilization · B. Utilization is measured differently in the two queues · C. Arrival and service-time variability differ: waiting at a given utilization is multiplied by the variability of arrivals and of service, so the queue with lumpy arrivals or highly variable work waits far longer at the same load ✅ · D. One queue is a transactional process and the other is clinical, and clinical queues are inherently longer
`[G · B7 · Understand · NEU · K · CERT]` — Utilization sets the base and variability multiplies it, which is why "reduce variability before adding staff" is the design rule; A is backwards, since pooling servers at the same utilization shortens waits.

**G57.** A cutting department upstream of the stream's constraint press is measured on machine utilization and runs at 95%, building a pile of cut blanks that has reached nine days of press demand. The press is never starved. Your design instruction for the cutting department:
A. Keep cutting at 95%; the pile guarantees the press is never starved, which is what subordination means · B. Release cutting work at the press's rate (the rope), with a time buffer of cut blanks ahead of the press sized to the press's longest usual disruption — about a day, not nine; cutting's utilization falls, and that is the design working, so change what cutting is measured on ✅ · C. Balance cutting to the press by removing one cutting operator · D. Move the constraint to cutting, since a constraint at the first step is easier to manage
`[G · B7 · Apply · MFG · S · CERT]` — Subordination means the non-constraints work at the constraint's pace, and the buffer is sized to protect it, not to fill the floor; A is the utilization metric's rational answer, and it is why the pile exists.

**G58.** Exhibit — document-review stream, capacity in files per day, before and after a project that added a second analyst at step B:
```
                 Step A   Step B   Step C   Demand
Before:           100       70       90       95
After:            100      110       90       95
The team's next proposal: cross-train a third person for step B "to reach 130 and finally beat demand"
```
Your review:
A. Stop: after elevation the constraint moved to step C (90 per day); the stream now makes 90, not 110, and any further capacity at B adds WIP ahead of C — return to step 1 and exploit C ✅ · B. Approve: step B is the historical constraint and needs a margin above demand · C. Approve, since 130 at B allows B to catch up its backlog · D. Stop, because 110 at B already exceeds demand and the stream is now unconstrained
`[G · B7 · Analyze · TXN · X · CERT]` — The fifth step exists because the constraint moves, and a team that keeps working on the old one is now building inventory; D forgets that C at 90 is below demand.

**G59.** A kaizen team on day 3 wants to change a field in the CRM's case-status list to make its new standard work usable. The charter's decision rights say CRM configuration needs the IT change board. The change board meets in ten days. As event leader you:
A. Make the change; a status-list edit is trivial, and the change board can be told afterwards · B. Ask the sponsor to overrule the change board for the event · C. Stop the trial until the change is approved · D. Run the day-3 trial with a paper or spreadsheet workaround, put the CRM change on the 30-day list with a named change-board owner and the meeting date, and note the dependency at the report-out ✅
`[G · B7 · Apply · TXN · S · CERT]` — Decision rights were written for exactly this moment, and a workaround keeps the trial honest without breaking a rule the team agreed to; A is the small overstep that costs the next event its IT support.

**G60.** On day 3 the sponsor arrives unannounced during the cardboard trial, looks at the layout and says "put the printers in the middle, that's what worked at our other site". The team goes quiet and starts moving the printers. Your move as event leader:
A. Let it happen; the sponsor's suggestion is probably right and the team can adjust it later · B. Ask the sponsor to leave the area · C. Thank the sponsor, restate the room's rule that every layout is timed before it is adopted, ask the team to run the printers-in-the-middle version as one of the trials alongside its own, and speak with the sponsor afterwards about the day-2 and day-5 check-in agreement ✅ · D. Override the sponsor in front of the team so that the team keeps ownership
`[G · B7 · Evaluate · TXN · S · CERT]` — The sponsor solving from the doorway is a named failure mode, and the leader protects the team's ownership by making the suggestion a trial rather than a decision; D protects ownership by breaking the relationship the event depends on.

**G61.** A Black Belt's requirement-4 submission describes a three-day event in a document-scanning cell: no baseline chart was made ("the team knew the process was slow"), a two-hour sample on the last afternoon gave 45% less handling time per document, and the sponsor announced "a 45% improvement" that evening. As the observer you score:
A. Pass on results; a 45% improvement is well above what most events achieve · B. Redo: the event fails on preparation (no baseline on a defined metric before the event) and on closure (a result announced from a two-hour sample with nothing to compare it to), which is the event-as-theatre failure mode regardless of what the cell may actually have improved ✅ · C. Pass on facilitation, redo on closure only · D. Pass, with a note that a baseline should be collected now for the 30-day check
`[G · B7 · Evaluate · TXN · S · CERT]` — Requirement 4 is scored on preparation, facilitation, safety and closure, and a result that cannot be compared to anything is not a result; D collects a baseline after the change, which is the reconstructed-baseline error in a new form.

**G62.** Process cycle efficiency (process time ÷ lead time) of 0.3% on a value stream most usefully tells you that:
A. The lead time is almost entirely queue time, so the design levers are WIP and release control, not the speed of the work itself ✅ · B. The stations are slow, and cycle-time reduction at each station will bring the figure up · C. The measurement window was too short to capture the process time · D. The stream is roughly 300 times below world class and needs a full redesign
`[G · B7 · Understand · NEU · K · CERT]` — By Little's Law a lead time of days on minutes of work is WIP, and no amount of station speed changes that ratio much; B is the manager's instinct that faster work shortens lead time, and it moves the numerator by seconds against a denominator of days.

**G63.** Design question 2 — finish to a supermarket or ship direct to the customer — is answered "supermarket" when:
A. The product is customized to each order and demand for any one item is unpredictable · B. Lead time to the customer is long enough for the product to be made after the order arrives · C. The plant has floor space for finished goods · D. A small number of items with steady, repeating demand make up most of the volume and the customer expects delivery faster than the stream can make the item; the supermarket is sized by the same D × L × (1 + α) logic, and everything else is made to order ✅
`[G · B7 · Understand · NEU · K · CERT]` — Finished-goods pull is a decision about demand pattern and required lead time, not about space; A and B are the two conditions under which ship direct (make to order) is the answer.

<!-- Section G tally — keys: A 16 · B 16 · C 15 · D 16 | types: X 28 · S 22 · K 13 | Bloom: Apply 18 · Analyze 17 · Evaluate 15 = 50 of 63 (Understand 13, Remember 0) | verticals: MFG 17 · HC 16 · TXN 17 · NEU 13 | negative stems: 0 | coverage: future-state design G5 G7 G8 G51 G52 G63; takt and Little's Law G1 G2 G3 G4 G6 G45 G46 G47 G62; balancing and levelling G9 G10 G11 G12 G13 G14 G48 G49; pull and kanban sizing G15 G16 G17 G18 G19 G50; SMED and EPEI G20 G21 G22 G23 G53; TPM/OEE G24 G25 G26 G27 G54; demand–capacity and queueing G28 G29 G30 G31 G44 G55 G56; theory of constraints G32 G33 G34 G35 G57 G58; kaizen leadership G36 G37 G38 G39 G40 G41 G42 G43 G59 G60 G61; "when not to use": takt on swinging demand G30, Little's Law on a snapshot or mismatched units G4 G45, balancing before levelling G14, kanban from a launch history G18, SMED on a non-constraint G23, OEE as a scorecard or on a non-constraint G26, supermarket between flowing steps G51, elevate when the constraint is a policy G35, a kaizen event without a baseline G61; numerical items verified: G1 G3 G6 G9 G11 G15 G16 G17 G20 G21 G24 G25 G28 G29 G44 G45 G47 G48 G50 G53 G54 G55 -->

---

v1.0 · 2026-09-20
