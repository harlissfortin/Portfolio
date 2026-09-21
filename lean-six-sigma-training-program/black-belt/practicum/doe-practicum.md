# Immersion 1 — The DOE Practicum (week 10 · two days · certification requirement 3)

Two days in which every candidate designs, runs, analyzes and presents an experiment end to
end on a platform whose physics they cannot argue with. Module 5
([`../modules/m5-design-of-experiments.md`](../modules/m5-design-of-experiments.md)) taught the
methods and rehearsed them in Labs 8 and 9; the practicum certifies that you can carry a
sequential experiment from a screen to a confirmed operating window, under time pressure,
with a logbook a reviewer can audit. It is scored **pass / redo** by a certified observer
against the rubric in section 5, and the result is recorded on the credential's badge
metadata (see [`../bok-crosswalk-and-credential.md`](../bok-crosswalk-and-credential.md)).

The practicum uses the DOE planning canvas
([`../templates/doe-planning-canvas.md`](../templates/doe-planning-canvas.md)) and the experiment
logbook ([`../templates/experiment-logbook.md`](../templates/experiment-logbook.md)). Bring both,
printed or open.

**Outcomes.** By the end of the two days, the candidate can, observed:
1. Check a measurement system on the apparatus and state whether it is adequate for the
   effect sizes the experiment must detect.
2. Design a five-factor screen with a written alias table, randomize it in the logbook, and
   read confounding off the effects table in words.
3. Choose the characterization design that the screen's ambiguity justifies, add center
   points, and run it with the day as a declared block.
4. Test for curvature and choose the next step — steepest ascent, a second-order design with
   Master Black Belt support, or stop — with the reason written.
5. Write a prediction with its interval before the confirmation runs, run them, and report
   the comparison honestly.
6. Present the whole sequence in ten minutes to a reviewer who will ask what the design could
   not separate.

---

## 1. The three platforms

Each cohort runs on one platform. Physical kits ship to virtual learners two weeks before
week 10, with a return label; the simulator is browser-based with a spreadsheet fallback.
Every platform has a **customer requirement card** so that "operating window" means something:
the experiment ends when you can say which settings meet the requirement, with what margin.

### 1.1 Paper-helicopter kit (HC and virtual cohorts)

**Kit contents** (one kit per pair; pairs act as each other's second timer)

| Item | Specification | Why it is specified |
|---|---|---|
| Templates | 60 sheets: 20 each of 80, 100 and 120 gsm, pre-printed with the helicopter outline, cut lines for wing length at 70 / 90 / 110 mm, and fold lines for body width at 25 / 35 / 45 mm | Three levels of each continuous factor so center points are buildable |
| Paper clips | 100 small clips, nominal 0.5 g each (the kit states the measured mean mass of the batch) | Added mass in equal steps: 1, 2 or 3 clips |
| Drop reference | 3 m tape with a marked 2.5 m release height, and a doorframe clip to hang it | Release height is held constant, not a factor |
| Timers | Two stopwatches (or the phone app named on the kit card, with 0.01 s display) | Two timers per drop; the mean is the response |
| Logbook, ruler, scissors, pencil | — | The logbook is paper on purpose: a pen note "hit the chair" written before the time is read is the exclusion standard |

**Factors and levels**

| Factor | Low (−1) | Center (0) | High (+1) | Type |
|---|---|---|---|---|
| A Wing length | 70 mm | 90 mm | 110 mm | Continuous |
| B Body width | 25 mm | 35 mm | 45 mm | Continuous |
| C Paper weight | 80 gsm | 100 gsm | 120 gsm | Continuous (three stocks) |
| D Paper clips | 1 | 2 | 3 | Continuous in mass, equal steps |
| E Body length | 60 mm | 80 mm | 100 mm | Continuous (cut line on the template) |
| Wing width | 35 mm | — | — | Held constant unless a cohort chooses it as a sixth factor |

**Run standard.** One helicopter per run, built fresh (a re-used helicopter is a repeat, not
a replicate). Release at 2.5 m measured to the bottom of the body, held by the wing tips, arms
still, over a clear floor. Both timers start on release and stop on first floor contact. Record
both times, then the mean, in the logbook, before anything is said about the result. A run is
excluded only for a cause written *before* the time is read (helicopter touched a wall,
clip fell off, release fumbled) and the exclusion is a logbook line, not an erasure.

**Response.** Flight time in seconds (mean of two timers). Typical range across the design
space: about 1.3 to 2.6 s. Drop-to-drop standard deviation at a fixed setting: about 0.10 s.

**Measurement system check (Day 1, first 30 minutes).** Ten drops of one reference
helicopter (90 mm / 35 mm / 100 gsm / 2 clips), both timers. Report the mean difference
between timers, the standard deviation of the differences, and the drop-to-drop standard
deviation. Expect a timer-difference standard deviation near 0.08–0.10 s and a drop-to-drop
standard deviation near 0.10 s: the timing is roughly a third of the run-to-run variation,
acceptable for effects of 0.3 s and above, and the reason no candidate is allowed to set
levels closer than the kit's cut lines. If the timer-difference standard deviation exceeds
0.15 s, re-standardize (who calls "go", where each timer looks) and repeat before any run.

**Customer requirement card (HC).** *A flight of at least 2.3 s, using the cheapest build that
achieves it reliably.* Cost order: fewer clips is cheaper than more, 80 gsm is cheaper than
120, shorter wings use less paper.

### 1.2 Catapult kit (MFG and open-enrollment cohorts)

**Kit contents.** One desktop catapult per pair with five settable factors; a bag of 20
light balls (about 3 g) and 20 heavy balls (about 7 g); a 3 m floor tape marked in cm; a
landing-spot marker (a small bean bag the spotter places at first contact); the logbook.

**Factors and levels**

| Factor | Low (−1) | Center (0) | High (+1) | Type |
|---|---|---|---|---|
| A Arm length (stop position) | Hole 2 | Hole 3 | Hole 4 | Continuous, discrete settings |
| B Pull-back angle | 120° | 140° | 160° | Continuous, protractor scale |
| C Cup position | Position 1 | Position 2 | Position 3 | Continuous, discrete settings |
| D Rubber-band count | 1 | 2 | 3 | Continuous in tension, equal steps |
| E Ball mass | Light (≈ 3 g) | — | Heavy (≈ 7 g) | Categorical (no center) |

**Run standard.** Catapult base clamped to the table; the front edge on a taped line. Pull
back to the angle read against the scale by the person *not* releasing; release without
pushing. The spotter watches the floor, not the ball, and marks the first contact; the
releaser reads the tape to the marker's near edge. Record distance in cm in the logbook before
retrieving the ball. Exclusion rule as for the helicopter: a cause written before the number
is read (ball hit a table leg, band slipped).

**Response.** Landing distance in cm. Typical range: 60 to 320 cm. Shot-to-shot standard
deviation at a fixed setting: about 8 cm, and larger at high tension — a heteroscedasticity
teaching point that the residual plots will show.

**Measurement system check.** Ten shots at the center setting, two spotters marking
independently (each with a marker, before either speaks). Report the mean and standard
deviation of the between-spotter difference and the shot-to-shot standard deviation. Expect
spotters to agree within about 3 cm; shot-to-shot near 8 cm. A spotter disagreement above
6 cm means the marking standard needs fixing before any run.

**Customer requirement card (MFG).** *Land the ball at 200 cm ± 10 cm on at least 9 shots in
10, using two rubber bands or fewer* (bands wear; fewer is cheaper to maintain).

**Safety.** Eye line: nobody sits downrange. Bands are replaced when nicked; the kit carries
spares. Band count is never exceeded beyond three.

### 1.3 Transactional process simulator (TXN cohorts)

A stochastic model of an invoice-processing cell, delivered as a browser application and,
for cohorts whose IT policy blocks it, as a spreadsheet with the same response structure and
`RAND()`-driven noise. Worked designs 3 and 8 in Module 5 come from it. Its job is not
realism; it is to let a services cohort feel randomization, noise, aliasing and curvature with
the same hands-on cycle a catapult gives a plant.

**Specification**

| Element | Specification |
|---|---|
| Unit of run | One simulated working week (5 days × 8 h) of invoice arrivals, about 410 per day with day-to-day and hour-to-hour variation |
| Settable factors | Batch size (1–30 invoices, continuous); validation point (at approval / at entry); routing rule (manual / rule-based); form template (current / redesigned); staffing (2–6 clerks on the cell, continuous); second-review threshold ($500–$2,500, continuous) |
| Outputs per run | Mean invoice cycle time (working hours, first touch to approval); first-pass yield (%); maximum queue length; the seed used |
| Noise | Fresh random seed per run unless the facilitator freezes seeds; run-to-run standard deviation of mean cycle time near 0.8 h at the default setting |
| Run time | Under five seconds; a 16-run design is a ten-minute job, which is why the design decisions, not the runs, are what the observer scores |
| Export | A CSV per design: run order, every setting in natural units, seed, outputs — the same columns as `data/simulator-runs.csv` |
| Facilitator controls | Freeze or set seeds; apply an overnight "block shift" (Day 2 arrivals run about 6% higher — the room discovers this); reveal the hidden response structure at the debrief |
| Hidden structure | Main effects on batch size, validation point, routing and staffing; a routing × staffing interaction (routing helps less when staffing is generous); curvature in batch size (a minimum near 8–10 invoices once validation is at entry); the template inert; the second-review threshold weak. Held in the facilitator appendix and never shown before Day 2's debrief |
| Spreadsheet version | One sheet of 2,000 invoice rows; service and wait times drawn from lognormal distributions whose parameters depend on the settings; cycle time computed per invoice and averaged; a settings block at the top and a run log sheet the candidate must fill in by hand — deliberately, so the logbook discipline is the same as on a physical kit |

**Run standard.** Every run is entered in the logbook before it is executed: run order, the
settings in natural units, and the seed after. A run is never re-executed because the result
looked odd; a wrong setting discovered from the log is a documented exclusion and a fresh run
appended at the end of the order.

**Customer requirement card (TXN).** *Mean invoice cycle time of 24 working hours or less,
with the fewest clerks that achieve it.*

---

## 2. Pre-work (weeks 9–10)

Sent with the kit or the simulator login two weeks ahead. Bring the results printed.

1. **Analyze `data/helicopter-2k.csv`** (all cohorts, regardless of platform). A 2^4 with two
   replicates and four center points on the helicopter kit. Produce the effects table, the
   interaction plot for the largest interaction, the three residual plots, the curvature test,
   and one sponsor sentence against the HC requirement card. Note which factors are inert.
2. **Analyze `data/simulator-runs.csv`** (all cohorts). Sixteen runs of the simulator built
   with the simulator's *default* generator. Before you compute anything, write the defining
   relation, the resolution and the alias table from the coded columns. Then the effects,
   Lenth's method, and one paragraph on what the largest interaction column could be.
3. **Draft your canvas** for the platform you will use: five factors, levels from the tables
   above, the response's operational definition, the nuisance variables you expect and what
   you will do with each.

The facilitator checks the pre-work against the answer key in section 8 during Day 1's first
block. A candidate who arrives without it does the analysis in the first hour while the room
runs the measurement check, and starts the screen an hour behind.

---

## 3. Run of show

Two days, 08:30–17:00, in person or live virtual with cameras on the apparatus. Staffing: lead
facilitator; producer above 12 candidates; **one certified observer per eight candidates**
(a Master Black Belt, or a Black Belt calibrated on the practicum anchor set), who scores
the presentations and is not the candidate's coach. Teams: pairs on physical kits (each
candidate owns an experiment; the pair alternates whose design is running and who is timing);
individuals on the simulator.

### Day 1 — screen and characterize

- **08:30–09:00 Frame and pre-work check.** The requirement card read aloud; the run budget
  stated (physical: about 60 runs per candidate over two days; simulator: unlimited runs but a
  budget of 48 *logged* runs, because the discipline is the point). Pre-work effects tables
  checked against the key in pairs; the facilitator names the two mistakes the key shows most
  often (an inert factor read as real from a p near 0.05; the aliased column read as a
  two-factor interaction without saying which one).
- **09:00–09:40 Measurement system.** Ten reference drops or shots with two timers or two
  spotters; simulator candidates run the default setting ten times with fresh seeds and
  compute the run-to-run standard deviation. Every candidate writes the number into the canvas
  and the sentence: "effects below about ___ are inside the noise of this measurement."
  **Checkpoint:** no design is randomized until the facilitator has seen that sentence.
- **09:40–10:20 Design the screen.** Five factors from the platform table. Helicopter and
  simulator: 2^(5−1), E = ABCD, resolution V, 16 runs. Catapult: 2^(5−2), D = AB, E = AC,
  resolution III, 8 runs, because a catapult run takes a minute and rebuilding tension is
  slow. Each candidate writes the defining relation and alias table by hand, the analysis
  plan, and the decision rule ("if the alias pair on column X is active and could change the
  setting we choose, we fold on ___"). Run order drawn by software or dice and written into
  the logbook. **Checkpoint:** facilitator initials the logbook page against three things —
  the randomized order, the alias table, the analysis plan.
- **10:20–12:00 Run the screen.** Facilitator floats with two jobs: the logbook is written
  *before* the result is known, and nobody re-runs "a bad one". A candidate who wants to
  drop a run is asked for the line in the logbook written before the number; if it is not
  there, the run stays. The pain is the product. Simulator candidates finish in twenty
  minutes and are handed the next task early: write the prediction for what the
  characterization design will show, before analyzing the screen.
- **13:00–14:15 Analyze the screen.** Effects table; half-normal plot and Lenth's method (by
  hand once); alias reading aloud in words — every active column is read as "A, or BCE, and
  physically that is A because…"; residual plots including residuals against run order.
  Catapult candidates find that at least one active column is "a main effect or a two-factor
  interaction" and must decide whether the ambiguity changes the setting they would choose.
  **Checkpoint:** each candidate states to the observer, in one sentence, which factors they
  are carrying forward, which they are dropping, and what one ambiguity they have not
  resolved.
- **14:15–15:00 Design the characterization step.** From the two to four active factors: a
  full 2^k (or the fold-over, for catapult candidates whose ambiguity matters), with
  **three to four center points** on the continuous factors, one replicate today. Levels may
  be widened or narrowed with a written reason; a factor may be moved from "factor" to "held
  constant" with the level named. Written before running: the prediction for the center points
  ("the plane predicts ___ at the center; if the center points read more than about 2 s
  away, curvature").
- **15:00–16:30 Run and analyze the characterization step.** Effects, interaction plots read
  before main-effect plots, ANOVA, residuals, curvature test. Every candidate leaves with a
  fitted model and a note on whether the plane is lying.
- **16:30–17:00 Debrief — protect this block.** Three candidates read their alias sentence and
  their curvature sentence aloud. The facilitator asks the room what will be different about
  tomorrow morning's runs, and does *not* answer. Overnight: paper takes up moisture, bands
  relax, and the simulator's Day 2 arrivals run 6% higher. Nobody is told; the room is asked.

### Day 2 — block, curve, confirm, present

- **08:30–09:15 The day is a block.** Each candidate runs a second replicate of yesterday's
  characterization design (or the other half of the fraction), randomized afresh within
  today. Before analyzing, they write what they expect the block effect to be and which
  interaction they will confound with it (the highest-order one, named). **Failure mode:** the
  candidate who pools both days without a block term and reports a phantom three-factor
  interaction — the observer lets them present it and asks the room where the team difference
  went in Module 5's worked design 6.
- **09:15–10:15 Analyze with blocks; curvature decision.** The blocked ANOVA; the block effect
  in the response's units; the curvature test now on pure error from replicated corners and
  center points. Three routes, chosen with a written reason:
  1. No curvature, requirement not yet met → **steepest ascent** along the coefficients, one
     run per step, until the response turns.
  2. Curvature present → a **facilitator-supported** central composite design: the corners and
     center points already run become the first block; axial points at ±1.4 (two factors) or
     ±1.7 (three factors) in coded units, translated to the kit's settings; the quadratic fitted
     and the contour read *with* the facilitator, since running RSM unaided is Master Black
     Belt territory (Module 5.10).
  3. Requirement already met inside the window with margin → **stop**, and write why more
     runs would not change the decision.
- **10:15–12:00 Run the chosen route.** Steepest-ascent candidates typically take four to six
  steps; CCD candidates run 4–6 axial points plus two more center points. Stop-route
  candidates instead run a second confirmation setting (the cheapest one at the edge of the
  window) so that the afternoon has a comparison.
- **13:00–13:45 Operating window and prediction.** From the fitted model: the settings that
  meet the requirement card, the 95% confidence interval on the mean at the recommended
  setting, and the prediction interval for a single run, both in the response's units.
  **The prediction is written into the logbook, dated and timed, and initialed by the
  observer before the first confirmation run.** The cheapest setting inside the window is the
  recommendation; the reason it is cheapest is written.
- **13:45–14:30 Confirmation runs.** Five runs at the recommended setting (ten for the catapult,
  because the requirement is 9 in 10). Result compared with the prediction: inside the
  interval, or not, stated as such. A confirmation that misses the prediction is not a failed
  practicum; it is a finding that goes on the last slide with the next design.
- **14:30–16:45 Presentations.** Ten minutes per candidate to the observer, in two parallel
  rooms of eight, with a five-minute question-and-score slot; peers attend their own room.
  The sequence is fixed: canvas and measurement check → screen design and its alias table →
  what the screen showed and what it could not separate → characterization design and why →
  effects with interaction plots and residuals → block and curvature decisions → operating
  window with intervals → prediction versus confirmation → what they would do next and what
  they would tell the sponsor. The observer asks at least one question from the list in
  section 5.3. Scored pass/redo on the rubric during the slot; the sheet goes to the candidate
  the same day.
- **16:45–17:00 Close.** Redo slots scheduled (section 5.4). Each candidate states the first
  run date of their project experiment (Lab 11 clinic follows). The simulator's hidden
  structure is revealed, and the room is asked which of its features they found and which
  they missed, and why.

---

## 4. What the candidate hands in

The observer scores what is on paper and screen, not what is remembered. By the end of the
presentation slot the candidate has submitted, as a single folder to the cohort drive:

| Item | Standard |
|---|---|
| DOE planning canvas | Every field complete; the nuisance-variable table says hold, block or randomize for each |
| Experiment logbook | Every run in the executed order with actual settings and both raw measurements; every exclusion with its cause written before the result; facilitator initials on the screen page; observer initials on the prediction |
| Design files | Each design with its defining relation, resolution and alias table (screen); block assignment (Day 2); center points marked |
| Analysis files | The cohort's software file or script for every stage, reproducible from the raw logbook data |
| The one page | Effects tables, the interaction plot that mattered, residual plots, the curvature test, the window with intervals, prediction versus confirmation, in that order |
| The sponsor sentence | Effect sizes in the response's units, the recommended setting, the comparison to the requirement card, no p-value |

---

## 5. Pass / redo rubric

Scored by the certified observer during the presentation slot, from the folder and the
presentation. Every criterion is observable: the observer marks what they saw or read, not
what they believe the candidate knows. **Pass = every "must" criterion observed.** A "should"
criterion not observed is written on the sheet as feedback and does not fail the practicum
on its own; three or more unobserved "should" criteria trigger a redo of the presentation.

### 5.1 Criteria

| Area | Must — observed as | Should — observed as |
|---|---|---|
| **Measurement system checked** | The canvas states the timer or spotter or run-to-run standard deviation from the Day 1 check and the sentence "effects below about ___ are inside the noise" | Levels chosen so that the expected corner-to-corner difference is at least five times that number, and the candidate says so |
| **Design justified** | For each design: factors and levels with a reason; the defining relation, resolution and alias table written *before* the runs; run count tied to the noise estimate ("with s ≈ 0.10 s and N = 16, the standard error of an effect is 0.05 s") | Nuisance variables listed with hold / block / randomize for each; the decision rule written before the screen ("if column X is active and changes the setting, we fold") |
| **Randomization done** | The logbook shows a run order drawn before the first run and the runs executed in that order; the residuals-versus-run-order plot is shown | Day 2 randomized afresh within the block; the candidate names what would have been confounded had they run in standard order |
| **Logbook and data ethics** | Every run present; every exclusion carries a cause written before the result; no run re-executed because of its value; the observer's initials on the prediction pre-date the confirmation runs | Deviations (a slipped setting, a re-clamp) noted at the time, not reconstructed |
| **Analysis correct** | Effects computed on the right columns; the alias of each active column read aloud in words; interaction plot read before main-effect plots; hierarchy kept; the three residual plots shown and read; the block declared in the Day 2 analysis; the curvature test reported with its F and the difference in the response's units | Lenth's method or a half-normal plot used on the unreplicated screen; pure error separated from lack of fit where replicates exist |
| **Operating window stated** | The settings that meet the requirement card, with the 95% confidence interval on the mean and the prediction interval for one run, in the response's units; the cheapest setting inside the window recommended with the cost reason | The window drawn (a contour or a table of predicted corners); the margin between the interval bound and the requirement stated |
| **Prediction versus confirmation** | A dated, initialed prediction with an interval; the confirmation runs at the recommended setting; the result stated as inside or outside the interval | If outside: a stated cause hypothesis and the next design, not an excuse |
| **Limits acknowledged** | At least one sentence each on: what the design could not separate (the alias that remained); what was held constant and therefore untested; the range outside which the model is silent | The nuisance variable most likely to have moved between days named, with the block effect in units |
| **Presentation** | Ten minutes; the fixed sequence followed; the sponsor sentence with effect sizes and the recommendation, without a p-value; at least one observer question answered from the record | Exhibits over prose; every chart labeled with units and n |

### 5.2 What fails regardless of the rest

- A run removed without a cause written before its result, or a run re-executed because of
  its value. This is the data-ethics standard from Module 5.11 and it ends the practicum with
  a note to the assessment lead; the candidate re-runs the full experiment in a redo slot with
  a different observer.
- A prediction written after the confirmation runs, or without the observer's initials.
- No randomization, or runs executed in standard order: the practicum is re-run from the
  screen.

### 5.3 Observer questions (ask at least one; record which)

1. "Which column in your screen table could have been something else, and what did you do
   about it?"
2. "Show me the residuals against run order. What would a trend there have meant for
   yesterday's results?"
3. "Your window says 2.3 s is met at this setting. Met by the mean, or by the next drop?"
4. "What did you hold constant, and what happens to your recommendation if it moves?"
5. "You blocked on day. What did you give up to do that, and what did you gain in units?"
6. "If you had eight more runs, where would they go — and if you had none, what would you
   tell the sponsor tonight?"

### 5.4 Redo rules

A redo is a second attempt, not a failure. The three kinds, in order of how often they
happen:

| Redo of | When | How |
|---|---|---|
| The presentation | A "must" analysis, window or limits criterion was not observed, but the logbook and design are sound | Same data; a new ten-minute slot within 10 business days, live virtual, to the same observer |
| The confirmation | The prediction was not written and initialed before the runs | Five new confirmation runs on the kit at home or on the simulator, filmed or logged with the seed, with the prediction sent to the observer first |
| The experiment | No randomization; a data-ethics stop; a measurement system never checked | Full re-run in a scheduled redo session (a half day on the next cohort's Day 2, or a supervised virtual session), different observer |

Two redos of the same kind are the limit before the assessment lead reviews the case.

---

## 6. Facilitator failure modes

- **Rescuing the alias.** A candidate stares at a column that could be A or BD. The facilitator
  who says "it's A, obviously" has taken the practicum's central lesson away. Ask: "what would
  you have to run to know?"
- **Allowing the tidy re-run.** "That drop was clearly bad" is the most common sentence on Day
  1 and the answer is the same each time: show me the line you wrote before you read the time.
- **Letting levels shrink.** Candidates pick 85 and 95 mm because "it's a cleaner design" and
  then find nothing. The measurement check exists so you can point at the number: your noise
  is 0.10 s, and those levels move the response by 0.15.
- **Running Day 2 without the block.** If nobody in the room proposes blocking on day by
  09:00, do not tell them; hand out the Module 5 worked design 6 output and ask where the
  team difference went. Ten minutes; the room finds it.
- **Doing the CCD for them.** "Facilitator-supported" means the facilitator sits beside the
  candidate, not at their keyboard. The candidate translates the axial points into kit settings
  and reads the contour aloud.
- **Skipping the prediction initial.** The observer initials every prediction *before* the
  first confirmation run, with the time. Missing initials are a redo of the confirmation, and
  the fault is the observer's; do not make it the candidate's.
- **Letting presentations overrun.** Ten minutes is the executive standard the whole program
  holds to. Stop the candidate at ten, score what was shown, and ask the question anyway.
- **Skipping the debrief to finish runs.** If Day 1 runs overrun, cut the characterization
  run count (one replicate of a 2^3 with three center points is enough) and hold the debrief.
  An unfinished design debriefs better than a skipped debrief.
- **Simulator cohorts treated as easy.** Runs are cheap, so the pressure moves to design
  discipline: enforce the logged-run budget of 48, and freeze seeds only for a teaching point,
  never to make a candidate's table come out cleanly.
- **Physical kits with cross-cohort drift.** Bands relax and paper stock varies by batch. The
  kit card states the batch's measured clip mass and band lot; a facilitator who ignores the
  card and compares this cohort's numbers with last cohort's is doing what the practicum tells
  candidates not to do.

---

## 7. Logistics

| Item | Standard |
|---|---|
| Kit dispatch | Two weeks before week 10 for virtual learners; kits checked against the contents table on receipt by the learner (a checklist card in the box); return label enclosed |
| Room | In person: one 3 m clear drop or throw lane per two pairs, tape on the floor, a table per pair, power. Live virtual: each pair's camera on the apparatus for the measurement check and the confirmation runs; the producer records both |
| Software | The cohort's chosen package open on every laptop with the Module 5 parity tables to hand; a shared script or template for effects, Lenth's method, the curvature test and blocked ANOVA released on Day 1 morning |
| Observers | One certified observer per eight candidates, calibrated on the practicum anchor set (two recorded presentations — one pass, one redo — scored before the event; any "must" disagreement re-calibrated) |
| Accessibility | A candidate who cannot drop or throw runs the design with their pair partner executing the runs; the design, logbook, analysis and presentation remain the candidate's own and are scored the same way. Timer and spotter roles can be swapped for a phone-video measurement with the standard written into the canvas |
| Records | Scored rubric sheets to the candidate the same day and to the reviewer of record's file; folders retained for the audit sample |

---

## 8. Facilitator answer key — the two reference datasets

*Facilitator and observer use only. Not distributed to candidates before Day 1's check. Both
files are generated by `data/generate.py` from a planted response structure with a fixed seed;
re-running the script reproduces them exactly. The numbers below are computed from the files.*

### 8.1 `data/helicopter-2k.csv` — 2^4, two replicates, four center points

Columns: `run_order`, `std_order`, `replicate`, `point_type` (factorial / center),
`wing_length_mm`, `body_width_mm`, `paper_gsm`, `clips`, coded `A`–`D`, `timer_1_s`,
`timer_2_s`, `flight_time_s` (mean of the two timers). Thirty-six rows in the executed
random order.

**Planted:** A (wing length) and D (clips) real; A×D real; B (body width) and C (paper
weight) inert; center points fly longer than the plane predicts; two timers whose
disagreement is about a third of the run-to-run noise.

**Two-timer check** (from the file): mean difference timer 1 − timer 2 = −0.04 s; standard
deviation of the differences 0.10 s (n = 36). Adequate for effects of 0.3 s and above.

**Effects table** (N = 32 factorial runs; pure error pooled from the 16 replicated cells and
the 4 center points, 19 df; s = 0.099 s; SE(effect) = 2s/√32 = 0.035 s)

```
Factorial fit: flight time (s) versus A wing, B body, C paper, D clips
Term      Effect     Coef   SE Coef       T    Reading
Constant           2.071    0.018             (factorial mean)
A wing     0.596    0.298    0.018    17.0    real
B body     0.025    0.013    0.018     0.7    inert
C paper    0.009    0.005    0.018     0.3    inert
D clips   -0.471   -0.236    0.018   -13.5    real
A*B       -0.012   -0.006    0.018    -0.3
A*C        0.015    0.008    0.018     0.4
A*D        0.227    0.113    0.018     6.5    real
B*C        0.062    0.031    0.018     1.8    noise (largest inert term)
B*D        0.026    0.013    0.018     0.8
C*D        0.006    0.003    0.018     0.2
A*B*C     -0.023   -0.011    0.018    -0.6
A*B*D      0.027    0.013    0.018     0.8
A*C*D      0.001    0.001    0.018     0.0
B*C*D      0.058    0.029    0.018     1.7
A*B*C*D    0.046    0.023    0.018     1.3
Curvature: mean(center) − mean(factorial) = 2.364 − 2.071 = +0.293 s
           SS = 32·4·0.293²/36 = 0.304   F = 0.304 / 0.00978 = 31.1 on 1, 19 df
Reduced model (A, D, A*D): s = 0.096 s, R-sq = 95.1%, residual df = 28
```

**Interaction plot cell means (s), wing length × clips, averaged over B and C**

| | 1 clip | 3 clips |
|---|---|---|
| 70 mm wings | 2.12 | 1.42 |
| 110 mm wings | 2.49 | 2.25 |

Adding two clips costs 0.70 s with short wings and 0.24 s with long wings; the lines do not
cross but they are far from parallel, which is what a +0.23 s interaction looks like. The
main effect of D, −0.47 s, is the average of those two facts.

**Residual plots.** Normal plot roughly straight; no funnel against fitted values; correlation
of residuals with run order 0.03 — nothing moved during the run.

**Operating window against the HC card (≥ 2.3 s, cheapest build).** Predicted corner means
from the reduced model, 95% CI on the mean ± 0.07 s, prediction interval for one drop
± 0.21 s:

| Setting | Predicted mean | 95% CI | PI for one drop | Meets 2.3 s? |
|---|---|---|---|---|
| 70 mm, 1 clip | 2.12 | 2.05 – 2.19 | 1.91 – 2.33 | No |
| 110 mm, 1 clip | 2.49 | 2.42 – 2.56 | 2.28 – 2.70 | Mean yes; a single drop can miss |
| 70 mm, 3 clips | 1.42 | 1.35 – 1.49 | 1.21 – 1.63 | No |
| 110 mm, 3 clips | 2.25 | 2.18 – 2.32 | 2.04 – 2.46 | No |

Body width and paper weight are inert, so the cheapest build inside the window is 110 mm
wings, 1 clip, 80 gsm paper, any body width. But the plane predicts 2.07 s at the center and
the center points average 2.36 s (F = 31): the surface bows upward in the middle. A 90 mm wing
with 2 clips may meet 2.3 s using less paper than 110 mm — the model cannot say, and that is
the decision point for a second-order design, not a conclusion.

**The sponsor sentence the key expects.** "Wing length is the strongest lever — 110 mm wings
fly about 0.6 s longer than 70 mm (about 2.4 s against 1.8). Each extra clip costs time, and
costs more with short wings. Body width and paper weight make no detectable difference, so use
the cheapest stock. 110 mm wings with one clip meet 2.3 s on average, with single drops
occasionally under; the mid-point settings fly longer than the straight-line model expects,
so about eight more runs would tell us whether a shorter, cheaper wing also meets the
requirement."

**Mistakes to look for in the pre-work.** B×C or B×C×D read as real from t ≈ 1.8 (they are
inside the noise; with fifteen effects, one or two near 1.7 is what noise looks like). The
curvature ignored because "the corners are what we tested". The CI used where the requirement
is about single drops.

### 8.2 `data/simulator-runs.csv` — 2^(5−1), the simulator's default generator

Columns: `run_order`, `std_order`, `batch_size`, `validation_point`, `routing`, `template`,
`staffing_clerks`, coded `A`–`E`, `seed`, `cycle_time_h`. Sixteen runs in executed order.

**The trap.** The simulator's design menu defaults to E = ABC, not E = ABCD. The candidate
who writes the defining relation from the coded columns finds **I = ABCE, resolution IV**:
main effects clear of two-factor interactions, but **AB = CE, AC = BE, BC = AE**, and every
D interaction aliased with a three-factor term. A candidate who assumes the Module 5 table's
resolution V design without checking reads the AB column as batch size × validation point
and never sees the alternative.

**Planted:** A batch size +6.0 h, B validation −4.0 h, C routing −3.0 h, E staffing −2.5 h,
D template inert; a real **C×E** interaction of +1.8 h (rule-based routing helps less when
five clerks are on the cell) which the design puts on the same column as A×B. Noise 0.8 h.

**Effects, sorted, with Lenth's method (15 columns)**

```
Column        Estimates            Effect   |  Lenth: s0 = 1.5 × median|effect| = 0.626
A             A + BCE               6.310   |         PSE = 1.5 × median of |effects| < 1.565 = 0.461
B             B + ACE              -4.145   |         ME  = t(0.025, 5) × PSE = 2.571 × 0.461 = 1.19
C             C + ABE              -2.665   |
E             E + ABC              -2.640   |  Active: A, B, C, E, and the AB/CE column
AB            AB + CE               2.013   |
ACD           ACD + BD             -0.600   |  Grand mean 30.35 h
BC            BC + AE               0.578   |
AC            AC + BE               0.418   |  Reduced model (A, B, C, E, AB/CE column):
CD            CD + ABDE            -0.358   |    s = 0.70 h, SE(effect) = 0.35 h, residual df = 10
ABD           ABD + CD*            -0.315   |    Coefficients: 30.35 + 3.16A − 2.07B − 1.33C
D             D + ABCDE             0.300   |                  − 1.32E + 1.01·(AB or CE)
AD, BD, BCD, DE                    < 0.15   |
```

(*In this design ABD and CD are on distinct columns only through their higher-order
aliases; the key lists the 15 orthogonal columns as the software reports them.)

**What the key expects the candidate to write.** "Batching costs about 6 h of cycle time;
validation at entry saves about 4; rule-based routing about 2.7; five clerks about 2.6;
the template does nothing. The +2.0 h on the AB column is batch × validation *or* routing ×
staffing, and the design cannot tell. Both are plausible: Module 5's worked design 3 found a
real batch × validation interaction, and routing mattering less with more staff is what a
queue does." The ambiguity **matters to the decision**: at the recommended setting (batch of
1, validation at entry, rule-based routing, five clerks) the model predicts 21.5 h if the
interaction is A×B and 23.5 h if it is C×E — the difference between comfortable and marginal
against the 24 h card. The resolving run is the other half fraction (E = −ABC, 16 more runs)
or a fold-over on A or C; on the simulator that is a ten-minute job, and the answer is C×E.
The confirmation runs would have said so too: the true model gives 23.1 h at that setting.

Note for the debrief: today's setting (batch 20, validation at approval, manual routing,
three clerks) is **not in this half fraction** — E = ABC forces five clerks at that
combination. The candidate who noticed has read the design, not just the table.

---

## Takeaways

- The practicum scores design discipline and honest reporting, not the size of the effects
  you found. A confirmation that misses its prediction, reported as such with the next design,
  passes; a tidied dataset does not.
- Read the alias table before the effects table, the interaction plot before the main-effect
  plot, and the run-order residual plot before you believe anything.
- The day is a block, the prediction is written and initialed before the runs, and the window
  is stated with the interval that matches the requirement — mean or single unit.

---

v1.0 · 2026-09-20
