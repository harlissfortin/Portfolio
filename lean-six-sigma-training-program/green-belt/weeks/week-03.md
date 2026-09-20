# Week 3 — Measure: Operational Definitions, Data Collection & Measurement System Analysis (3 h self-paced + 2.5 h live lab)

**Phase:** Measure · **Objective code:** G3 · **Gate:** none this week (Tollgate 2 is next week, and
it needs this week's MSA result — start the study by Thursday).

**Learning objectives.** By the end of this week the learner can:
1. Write an operational definition (criterion, test, decision) that lets a stranger collect the
   same number you would.
2. Build a data collection plan — who, what, when, how, how many, stratified by what — and
   choose a sampling strategy that fits the question and the data type.
3. Design and run a crossed variable Gage R&R, read %study variation, %tolerance and the
   number of distinct categories, and name which part of the measurement system failed.
4. Design and run an attribute agreement analysis and read % agreement and kappa within
   appraisers, between appraisers and against the standard.
5. Decide what to do when a measurement system fails, and state the decision to a sponsor in
   one sentence.

---

## 3.1 Operational definitions: the number a stranger would get (30 min)

**Hook.** In week 2 you wrote a metric definition for your primary metric. This week you test
it: hand it to someone who has never seen your process and ask them to collect five values.
If their five differ from your five, you do not yet have a measurement.

**Teach.** An **operational definition** has three parts, after Deming:
- a **criterion** — the property you are judging ("the invoice is complete");
- a **test** — the exact procedure for judging it ("compare fields 1–9 against the checklist;
  a field is present if non-blank and in the format on the checklist");
- a **decision** — the rule that turns the test result into the recorded value ("complete =
  all nine present; otherwise incomplete, and record which fields failed").

A definition is finished when it fixes the **start and stop events** (for any time metric),
the **unit** and **basis** (working minutes or calendar minutes; per shift or per day), the
**resolution** (to the nearest minute, to 0.01 mm), and the **exclusions** (what is not counted,
and why — written down before collection, never after).

**Show (HC).** "Door-to-provider time" in an emergency department. Three clerks were asked to
abstract it for the same ten visits and produced values 3–12 minutes apart, because "door" had
never been fixed: one used the kiosk check-in timestamp, one used registration-complete, one
used the triage note. None of them was wrong; the definition was missing. The rewrite:
*start = kiosk check-in timestamp; stop = timestamp of the first provider note; unit = whole
minutes, calendar time; excluded = visits with no kiosk record (walk-backs from ambulance bay,
logged separately).*

**Show (MFG).** "On-time shipment": the customer counts arrival at their dock by 17:00 on the
promised date; the plant counted the truck leaving. The two honest numbers differed by eleven
points. The CTQ from week 1 says whose clock counts.

**Try.** Take your own primary metric. Write its criterion, test and decision on one card.
Give the card to a colleague outside your team and have them collect five values while you
collect the same five independently. Bring both lists to the lab.

---

## 3.2 The data collection plan (30 min)

**Hook.** A plan is what makes the baseline defensible. Reviewers reject a baseline they
cannot trace to a plan written before the data existed (rubric M2), and the
data-ethics stop in the rubric is explicit: a baseline reconstructed from memory ends the review.

**Teach.** The plan is a table, one row per measure, using the `data-collection-plan.md`
template in the toolkit:

| Column | What goes there | Reviewer's test |
|---|---|---|
| Measure and type | Name; continuous, count or attribute | Type decides the MSA (3.4 vs 3.5) and the chart (week 4) |
| Operational definition | Criterion, test, decision; start/stop; unit; basis | Would a stranger get the same number? |
| Stratification factors | Shift, site, product family, day of week, clerk queue — as *context columns*, not *person columns* | Can you slice the data by the suspects your fishbone will raise in week 5? |
| Source | System field, check sheet, observation | Is it collected as the work happens, or reconstructed? |
| Who collects | Named role, trained on the definition | Is that person also being measured by it? |
| When and how many | Sampling scheme (3.3); duration; expected count | Enough for 20–25 subgroups on the baseline chart? |
| How it is recorded | Sheet or file with the columns fixed now | Are the context columns there from row one? |

Two Yellow Belt rules still apply: context columns yes, person columns no; and pilot the sheet
on ten items before the real collection.

**Show (TXN).** Accounts-payable invoice processing. Measure: "invoice complete and accurate on
first receipt" (attribute; this is the %C&A figure from your week 2 value stream map, now with
a definition that can be audited). Stratification: supplier group, submission channel, day of
week. Source: the AP inbox, sampled at receipt — not the rejection log, which only records what
approvers noticed. Who: two AP analysts, trained together on twelve reference invoices. How
many: 40 invoices per working day for four weeks, systematic (every fifth arrival), at an
observed 9.8% incomplete rate.

**Try.** Fill the plan for your primary metric and one stratification factor. Wherever you
wrote "the system has it", ask who has checked what the field actually records. That is 3.4.

---

## 3.3 Sampling: enough of the right thing (25 min)

**Hook.** You rarely need every event; you always need the events you took to stand for the
ones you did not.

**Teach.** Four schemes a Green Belt uses:
- **Simple random** — every unit has the same chance. Best for a one-off estimate; hard to do
  honestly by hand (use a random-number column, not "whichever invoices are on top").
- **Systematic** — every *k*th unit. Practical for flowing work; check that *k* does not
  align with a cycle (every 10th part off a 10-cavity mould samples one cavity forever).
- **Stratified** — sample within each stratum (shift, site) so each is represented. Use when
  you already suspect the strata differ and want to see it.
- **Rational subgroups** — small samples taken close together in time, so that within-subgroup
  variation is common cause only. This is the sampling scheme behind X̄-R charts and it is
  week 4's first topic; plan it now.

**How many.** Two honest rules of thumb, each stated with its basis:
- For a baseline control chart: **20–25 subgroups** (or 20–25 individual values for an I-MR
  chart) before you compute limits you intend to keep.
- For a proportion (attribute data): choose *n* per subgroup so that *n × p̄ ≥ 5*. At the
  9.8% incomplete rate above, *n* ≥ 51 — so 40 per day is thin; the TXN team either samples
  60 or subgroups by two-day blocks. To *estimate* a proportion to within ±*E* with 95%
  confidence, *n ≈ (1.96/E)² × p(1−p)*: to within ±3 points at *p* = 0.10, *n ≈ 384*.
- For a mean to within ±*E*: *n ≈ (1.96 × s / E)²*, with *s* from a pilot of 20–30 values.

**When NOT to sample.** When the system already records every event, take the census; the
question becomes "is the timestamp what we think it is" (3.4 applies to system data as much as
to calipers). And never sample only the convenient period: a baseline collected during the
annual shutdown is a sample of the shutdown.

**Show (HC).** Ward discharge times are in the bed-management system for every patient, so the
team takes the census — 1,140 discharges over 90 calendar days — stratified by weekday versus
weekend and by discharging service. The sampling decision left is the observation one: the 30
discharges they time by hand to validate the timestamp are a stratified random 10 per shift,
not the 30 easiest.

**Try.** Write the "when and how many" row of your plan with its basis (calendar or working
time; per shift or per day), and state the one cycle your systematic scheme must avoid.

---

## 3.4 Variable Gage R&R: how much of the chart is the ruler (50 min)

**Hook.** Yellow Belts ask one question before trusting a chart: *has the measurement system
been checked?* You are now the person who answers it.

**Teach.** Every observed value is process plus measurement:

> σ²_observed = σ²_process + σ²_measurement, and σ²_measurement = σ²_repeatability + σ²_reproducibility

- **Repeatability** (equipment variation, EV): the same person measures the same item again
  with the same gauge and gets a different number. Lives in the gauge, the fixture, the
  resolution.
- **Reproducibility** (appraiser variation, AV): different people measure the same item and get
  systematically different numbers. Lives in the method — where they hold the caliper, which
  timestamp they call "start".
- **Interaction**: some operators differ more on some parts than others. Software reports it;
  the range method below cannot.

**The crossed study.** 10 parts chosen to *span the process range* (not ten good ones), 3
appraisers, 2–3 trials each, measured blind in random order. Fewer parts is acceptable only
for a rough check, and the worked example below uses five so that you can follow the
arithmetic; your project study uses ten.

**The three verdicts** (Automotive Industry Action Group conventions, which every software
package reports):

| Statistic | What it compares | Accept | Conditional | Reject |
|---|---|---|---|---|
| %Study variation (%GRR) | Measurement spread ÷ total observed spread | < 10% | 10–30% | > 30% |
| %Tolerance | 6 × measurement SD ÷ (USL − LSL) | < 10% | 10–30% | > 30% |
| Number of distinct categories (ndc) | How many bands of the process the gauge can tell apart | ≥ 5 | 2–4 | 1 |

%Study variation answers "can this gauge see the process?" — the question for Analyze.
%Tolerance answers "can this gauge sort good from bad?" — the question for inspection. A
gauge can pass one and fail the other. Report both when a specification exists. (%Contribution,
the variance ratio, is also printed; it is the same information on a squared scale, with
thresholds 1% / 9%.)

**Worked example (MFG, illustrative numbers).** Shaft diameter, digital caliper reading to
0.01 mm, specification 10.00 ± 0.10 mm. Five shafts, three operators, two trials, blind and
randomized. All values in mm.

| Part | A trial 1 | A trial 2 | B trial 1 | B trial 2 | C trial 1 | C trial 2 | Part mean |
|---|---|---|---|---|---|---|---|
| 1 | 10.01 | 10.02 | 10.03 | 10.03 | 10.05 | 10.04 | 10.030 |
| 2 | 10.04 | 10.05 | 10.06 | 10.05 | 10.08 | 10.08 | 10.060 |
| 3 | 9.97 | 9.98 | 9.99 | 9.98 | 10.01 | 10.02 | 9.992 |
| 4 | 10.06 | 10.07 | 10.08 | 10.09 | 10.11 | 10.10 | 10.085 |
| 5 | 9.99 | 10.00 | 10.01 | 10.00 | 10.03 | 10.03 | 10.010 |
| **Operator mean** | **10.019** | | **10.032** | | **10.055** | | |

Average-and-range method (constants for 2 trials, 3 operators, 5 parts: K1 = 0.8862,
K2 = 0.5231, K3 = 0.4030):

1. **Repeatability.** The 15 within-operator ranges (|trial 1 − trial 2|) sum to 0.12, so
   R̄ = 0.008. EV = R̄ × K1 = 0.008 × 0.8862 = **0.0071**.
2. **Reproducibility.** Operator means span X̄diff = 10.055 − 10.019 = 0.036.
   AV = √[(0.036 × 0.5231)² − EV²/(parts × trials)] = √[0.000355 − 0.000005] = **0.0187**.
3. **Gage R&R.** GRR = √(EV² + AV²) = √(0.0000503 + 0.000350) = **0.0200**.
4. **Part variation.** Part means span Rp = 10.085 − 9.992 = 0.0933; PV = Rp × K3 = **0.0376**.
5. **Total variation.** TV = √(GRR² + PV²) = √(0.000400 + 0.001415) = **0.0426**.
6. **Verdicts.** %GRR = 0.0200 ÷ 0.0426 = **47%** (reject); of which %EV = 17% and
   %AV = 44%. %Tolerance = 6 × 0.0200 ÷ 0.20 = **60%** (reject).
   ndc = 1.41 × PV ÷ GRR = 1.41 × 0.0376 ÷ 0.0200 = 2.65 → truncate to **2**.

**Reading the pattern.** Repeatability is small — each operator agrees with themselves to a
hundredth. Reproducibility is large — operator C reads about 0.036 mm above operator A on every
part. That signature says *method*, not *gauge*: nobody in the study is careless, and the
caliper is fine. Go and watch: the measurement instruction never said where along the shaft
or at what orientation to measure, the shafts are slightly out of round, and each operator
has a consistent habit. The countermeasure is a marked measurement location and a defined
orientation, then re-run. (The ANOVA method the software uses gives the same conclusion here
and reports the operator × part interaction as not significant, p = 0.78.)

The other signatures: **EV dominant** — gauge resolution or fixture (resolution should be at
most one-tenth of the tolerance); **interaction** — usually one part with a feature operators
handle differently; go and look at that part.

**The sentence you would tell your sponsor.** *"Half of the spread we see in shaft diameter is
the way we measure it, not the shafts; the caliper can only tell two bands of product apart.
We are fixing the measurement instruction this week and re-running the study before we chart
the baseline."*

**When NOT to use a crossed Gage R&R.** Destructive tests (tensile pull, a blood sample) — the
same item cannot be measured twice, so the study must be nested; that is Black Belt material,
and your move at Green Belt is to bring it to your coach. Attribute data — use 3.5. A system
timestamp — there is no repeatability to test; instead validate the timestamp against
observed time on 30 events and report the mean and spread of the difference. And do not run
one on parts that do not span the range: a study on ten near-identical parts produces a low
ndc and a high %GRR that indict the gauge for a sampling error.

**Software parity.** *Minitab:* Stat > Quality Tools > Gage Study > Gage R&R Study (Crossed);
ANOVA method by default; enter the tolerance to get %Tolerance. *Excel:* the toolkit's MSA
workbook (`msa-plan.md` describes it) computes the average-and-range method above; the stats
add-in's Gage R&R routine gives the ANOVA version. *R:* `SixSigma::ss.rr(var, part, appr)`;
*Python:* fit a two-way ANOVA with interaction in `statsmodels` and compute the variance
components from the mean squares — the toolkit notebook shows the six lines.

**Try.** Run the worked example in your software and match the numbers to within rounding.
Then lower operator C's values by 0.03 and re-run: %GRR falls and ndc rises. That is what
fixing the method is worth.

---

## 3.5 Attribute agreement analysis: can we agree on what a defect is (35 min)

**Hook.** Most healthcare and transactional primary metrics are judgments. The gauge is a
person with a definition.

**Teach.** The study: 2–3 appraisers, 30–50 items, each judged twice by each appraiser, blind
and in random order, against a **standard** set by an expert panel before the study. Build the
item set deliberately: roughly half in each class, and include the borderline cases — an item
set of obvious passes and obvious fails proves nothing.

Four numbers come out, each with a % agreement and a **kappa**:
- **Within appraiser** (each person versus themselves — repeatability);
- **Between appraisers** (do the people agree with each other — reproducibility);
- **Each appraiser versus standard** (are they right);
- **All appraisers versus standard** (is the system right).

**Kappa** corrects raw agreement for the agreement two coin-flippers would reach by chance:
κ = (P_observed − P_expected) ÷ (1 − P_expected). Worked arithmetic (TXN, illustrative): 20
invoices, standard says 12 complete and 8 incomplete. Appraiser 1 agrees with the standard on
10 completes and 6 incompletes, calling 2 completes "incomplete" and 2 incompletes "complete".

| | Standard: complete | Standard: incomplete | Appraiser total |
|---|---|---|---|
| Appraiser: complete | 10 | 2 | 12 |
| Appraiser: incomplete | 2 | 6 | 8 |
| Standard total | 12 | 8 | 20 |

P_observed = 16/20 = 0.80. P_expected = (12/20 × 12/20) + (8/20 × 8/20) = 0.36 + 0.16 = 0.52.
κ = (0.80 − 0.52) ÷ (1 − 0.52) = 0.28 ÷ 0.48 = **0.58**. Eighty percent agreement sounds fine;
kappa says the appraiser is only moderately better than chance on a set where "complete" was
the safe guess.

**Thresholds, stated honestly.** The conventions differ. The Automotive Industry Action Group
guidance reads κ > 0.75 as good and κ < 0.40 as poor; many practitioners use κ ≥ 0.70 and
≥ 90% agreement versus standard as the working bar. Whatever bar you choose, name it before the
study, apply it to every appraiser, and report the lowest number, not the average.

**Reading the pattern.** Low within-appraiser kappa: the definition is unclear even to one
person — rewrite it. High within, low between: each has a private definition — calibrate with
the reference set. High agreement with each other, low with the standard: the standard has
drifted from the CTQ, or the panel is wrong — revisit week 1. Most often, one specific field or
criterion drives every disagreement; the disagreement table tells you which.

**When NOT to use it.** When the judgment is really a measurement in disguise ("late" = more
than 5 days) — measure the days and run 3.4 on the timestamp instead. When the standard cannot
be established (nobody can say what the right answer is) — that is a CTQ problem, not an MSA.
And when appraisers know which items are being scored: unblinded studies measure attentiveness,
not the system.

**Software parity.** *Minitab:* Stat > Quality Tools > Attribute Agreement Analysis, with the
known standard column; reports Fleiss' kappa. *Excel:* the toolkit workbook builds the
cross-tables and computes kappa by the formula above. *R:* `irr::kappa2()` for two raters,
`irr::kappam.fleiss()` for three or more. *Python:* `sklearn.metrics.cohen_kappa_score`;
`statsmodels.stats.inter_rater.fleiss_kappa`.

**The sentence you would tell your sponsor.** *"Our two reviewers agree with the audit
standard 80% of the time, but kappa is 0.58 — barely better than guessing on the borderline
invoices. Every disagreement is about the same field. We are tightening that one definition
and re-testing before we use the %C&A number as a baseline."*

---

## 3.6 Wrap: when the measurement system fails (10 min)

You have four honest moves and one dishonest one.

1. **Fix the definition** and re-run — the usual answer when reproducibility dominates.
2. **Fix the gauge or the method** (resolution, fixture, measurement location) and re-run —
   when repeatability dominates.
3. **Calibrate the people against the reference set** and re-run — for attribute systems.
4. **Change the metric or the measurement** — if the primary metric cannot be measured to
   ndc ≥ 5 and no fix is available in your timeline, tell the sponsor now, and choose a
   metric that can be (a system field, a count, a different gauge). This is a charter change;
   your coach signs off on it.

The dishonest move is to chart the baseline anyway and mention the MSA in an appendix. Rubric
M3 gives full marks to a failed MSA that was acted on and zero to "we trust the system".

---

## Live lab — run of show (150 min)

**Setup for the facilitator.** Each learner has the vertical case MSA dataset loaded in their
software before the session; producer confirms by 0:05. Teams of 4–5 by vertical. The
Gage R&R in every vertical's dataset fails; the *signature* differs by vertical (see the
dataset section). Do not tell the teams it fails.

### 0:00–0:10 — Setup and the trap
- Poll: *"What fraction of the variation in your project's primary metric do you think is
  measurement? 0–5% / 5–15% / 15–30% / more."* Save the results.
- Frame: *"Today you will find out whether your ruler can see your process. Then you will
  decide what to do about it with a tollgate seven days away."*

### 0:10–0:25 — Operational-definition clinic
- Pairs, cross-team. Each learner reads their partner's definition card and describes how they
  would collect one value. Where the partner's description differs from the author's intent,
  the author rewrites the card. Two rounds.
- Facilitator collects the three most common gaps on screen (start event, basis, exclusions).

### 0:25–0:40 — Predict before you run
- Teams read the case MSA design (10 parts or items, 3 appraisers, 2 trials, tolerance given)
  and write two predictions: %GRR band, and which component will dominate. Predictions go on
  the board. **Do not skip** — the gap between prediction and result is the lesson.

### 0:40–1:10 — Run the Gage R&R
- Teams run the crossed study in their software and fill the one-page result sheet: %EV,
  %AV, %GRR, %Tolerance, ndc, and the interaction verdict. Facilitator checks that every team
  entered the tolerance.
- Result: every vertical fails (%GRR 40–65%, ndc 1–3). Teams must write which component
  dominates and one checkable hypothesis for *why* — a process reason, not a person.
- **Facilitator floats with one job:** stop the room from convicting appraiser C. *"C is
  consistent with themself. What would make a careful person read high every time?"*

### 1:10–1:35 — Decide, with the tollgate clock running
- In character as sponsor: *"Tollgate 2 is next Tuesday. I need a baseline. What are you
  doing?"* Teams choose among the four moves in 3.6, cost it in days, and write the
  sponsor sentence.
- Each team reads its sentence aloud; the room votes on whether a sponsor would understand it
  and whether it states a number. Rewrite until both.

### 1:35–1:55 — Attribute agreement on the case's %C&A metric
- Teams run the attribute study (3 appraisers × 30 items × 2 trials, standard given). Result:
  agreement looks acceptable, kappa for one pair is below 0.6, and the disagreement table
  points at one criterion. Teams name the criterion and rewrite it.

### 1:55–2:20 — Debrief: the anatomy of a ruler that lies
- Reveal the planted cause for each vertical. Teams compare their prediction, their result,
  and their hypothesis. Re-run the opening poll; the shift is the lesson — say it plainly:
  *"Nobody in the study was careless. The measurement instruction was incomplete, so three
  careful people did three different things."*
- Name the transferable patterns: reproducibility signature means definition or method;
  repeatability signature means gauge or resolution; interaction means go look at one item;
  80% agreement can hide a kappa of 0.5.
- **Protect the debrief.** If 0:40–1:10 overruns, cut the attribute block to 12 minutes and
  give the kappa answer directly. Never shorten the debrief or the transfer.

### 2:20–2:30 — Transfer to the project
- Each learner writes their MSA plan on the template: metric, type, study design, appraisers,
  items, date the study runs (must be before Tuesday), and who sets the standard.
- Post to the cohort channel; coaches follow up at the checkpoint.

### Facilitator notes and failure modes
- **A team wants to drop appraiser C** ("then it passes"): this is the data-ethics stop in
  miniature. Ask what happens on Monday when C measures production. Removing the person who
  reveals the method problem is removing the finding.
- **A team proposes averaging the three appraisers** as the measurement: averaging hides
  reproducibility; it does not remove it, and production does not measure in triplicate.
- **"Our metric is a system timestamp, so MSA does not apply":** correct that a Gage R&R does
  not apply; incorrect that nothing does. Their plan must include the timestamp validation
  (3.4, "when NOT"), and the facilitator says so in front of the room, because a third of
  the room is thinking it.
- **A team finishes early with the right diagnosis:** promote them to adversarial reviewers of
  another team's sponsor sentence — "what number is missing, and what will the sponsor ask?"
- **Software stalls:** result sheets per vertical are pre-computed; a team without output by
  0:55 reads from the sheet and spends the time on the diagnosis.
- **Virtual logistics:** breakout rooms per team, facilitator rotating every five minutes during
  0:40–1:10; the producer keeps a visible clock for the sponsor deadline.

---

## Project work this week

Keyed to the [review rubric](../project/review-rubric.md).

- **M2 — Data collection plan and operational definitions.** Plan complete on the template
  before collection starts; the definition has passed the stranger test with someone outside
  the team; stratification factors named; basis stated.
- **★ M3 — MSA attempted (started this week, result due at Tollgate 2).** Study type chosen
  to match the data type; design written (items, appraisers, trials, tolerance or standard);
  study run by the end of the week; if the metric is a system field, the timestamp validation
  is designed and started instead, with the reason written for the reviewer. "We trust the
  system" is not a reason.
- **Baseline collection** may begin in parallel *only* after the MSA result is in and
  acceptable; if the MSA fails, collect on the corrected definition and discard nothing
  silently — keep the pre-fix values in a separate labeled file.
- **Sponsor touchpoint:** ten minutes this week on what the MSA found and what it changes.

## Coaching prompts

1. *"Read me your operational definition. Now tell me one way a careful person could follow
   it and get a different number."*
2. *"Your Gage R&R came back at 34%. Which component dominates, what did you go and see, and
   what changed before the re-run?"*
3. *"If your metric cannot be measured acceptably by Tuesday, what do you tell the sponsor,
   and what metric do you propose instead?"*

## The week's vertical case dataset

Each vertical case ships two files this week. The first supports the crossed Gage R&R: columns
`item_id`, `appraiser` (A/B/C), `trial` (1/2), `value`, `run_order`, plus the tolerance in the
header. The second supports the attribute study: `item_id`, `appraiser`, `trial`, `verdict`,
`standard`, `reason_code`. Learners see only the data; the plants below are in the facilitator
key.

- **MFG — shaft diameter (mm), caliper, tolerance ±0.10.** Ten shafts spanning the range, three
  operators, two trials. *Planted:* repeatability adequate (%EV ≈ 15%), reproducibility large
  (%AV ≈ 50%), because the instruction names no measurement location or orientation and the
  shafts have ≈ 0.03 mm ovality; each operator measures consistently in their own habit.
  Attribute file: surface-finish pass/fail, 30 parts; one inspector's kappa versus standard
  ≈ 0.55, every disagreement on "minor scratch outside the sealing band" — the definition
  never said the band was the only zone that mattered.
- **HC — door-to-provider (minutes), abstracted from the chart by three clerks, target ≤ 30.**
  Ten visits, two abstractions each. *Planted:* repeatability near-perfect (%EV ≈ 5%),
  reproducibility very large (%AV ≈ 60%), ndc = 1, because "door" was never fixed (kiosk vs
  registration vs triage note); one clerk trained under an older definition. The lesson: a
  perfect gauge with no definition is not a measurement. Attribute file: "discharge summary
  complete" on 30 charts; disagreement concentrated on whether a pending-lab note counts as
  complete.
- **TXN — after-call work time (seconds), timed by three QA analysts from call recordings.**
  Ten calls, two timings each. *Planted:* both components poor (%EV ≈ 30%, %AV ≈ 40%,
  interaction present on two calls) because the end event ("call complete") is undefined and
  the stopwatch is started by ear; the two interaction calls have a long silence before the
  wrap-up code. Attribute file: "invoice complete and accurate on receipt", 30 invoices — the
  week 2 %C&A metric — with kappa ≈ 0.6 for one analyst pair, driven by the purchase-order
  field.

Cases and keys live in `../practicum/` (`case-mfg.md`, `case-hc.md`, `case-txn.md`).

## Takeaways

- A definition is done when a stranger gets your number; a plan is done before the first value.
- Observed variation is process plus measurement. %Study variation, %Tolerance and ndc say
  whether the ruler can see the process; the *pattern* (EV, AV, interaction) says where to look.
- Kappa, not % agreement, is the honest number for judgments; report the lowest, not the mean.
- A failed MSA is a finding to act on and report, never a reason to chart anyway.

## Cumulative check (weeks 1–2)

**W3-C1.** A charter's problem statement reads: "Since March, 14% of outbound orders (n ≈ 2,400/mo)
ship after the promised date because the pick-list printer is slow, costing ≈ $6k/mo in fines."
The single required edit before the sponsor signs is:
A. Add the team roster · B. Remove the cause clause — "because the printer is slow" — and keep
the measured gap ✅ · C. Convert the monthly count to a weekly one · D. Replace the dollar
figure with a percentage
`[A · G1 · Apply · MFG · S · PRAC]` — the statement smuggles a cause; the other edits are
cosmetic and none is required by the rubric.

**W3-C2.** A value stream map shows a lead time of 12 **working days of 8 hours** and 96 minutes
of touch time. Process cycle efficiency is:
A. 13.3% · B. 8.3% · C. 1.7% ✅ · D. 0.6%
`[B1 · G2 · Apply · TXN · S · PRAC]` — 96 min ÷ (12 × 8 × 60 = 5,760 working minutes) = 1.7%;
0.6% is the calendar-hour basis, which the stem closes off.

---

v1.0 · 2026-09-20
