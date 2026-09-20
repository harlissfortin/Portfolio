# Week 5 — Analyze I: Seeing the Variation and Narrowing the Causes (3 h self-paced + 2.5 h live lab)

**Where you are.** Tollgate 2 is behind you: a baseline chart, a stability statement, a
capability figure and an MSA result. Analyze starts now. This week you *look* before you
*test*: stratified pictures that show where the variation lives, then a structured narrowing
from the team's long list of suspicions to a short list you can check with data. Week 6 runs
the checks. Rubric items in play: A1 (cause generation and narrowing) and A2 (graphical
analysis); the test plan you write this week is the setup for ★ A3.

**Learning objectives.** By the end of this week the learner can:
1. Build and read a histogram, a box plot, a scatter plot and a multi-vari chart on the
   project's baseline data, stratified by a suspected cause, and state in one sentence where
   the variation lives.
2. Convert a fishbone of 30–50 causes into a cause-and-effect (C&E) matrix scored against the
   project CTQs, and defend the ranking.
3. Complete a working-level FMEA for the top-ranked causes and use it to pick what to test
   first.
4. State a null and alternative hypothesis, choose alpha, and explain a p-value in plain words
   to someone who has never heard the term.
5. Distinguish practical from statistical significance with numbers, and select the
   appropriate basic test from the data types of Y and X.
6. Write a test plan: for each of five checkable causes, the test, the data needed, the sample
   size available, the owner and the date.

---

## 5.1 Graphical analysis: where does the variation live? (50 min)

**Hook.** Your week 4 chart says the process is stable and not capable. Stable means the
variation is common cause — built into the process, present every day. The question is no
longer "what went wrong on Tuesday?" but "which parts of the process carry the variation?"
Pictures answer that before tests do.

**Teach.** Four charts do most of the work at Green Belt.

| Chart | Question it answers | Y | X |
|---|---|---|---|
| Histogram | What shape is the variation — one hump, two humps, a long tail, a wall at a limit? | Continuous | none |
| Box plot (stratified) | Does center or spread differ between groups? | Continuous | Categorical |
| Scatter plot | Does Y move with X, and how? | Continuous | Continuous |
| Multi-vari chart | Which *family* of variation is largest: within a unit, unit to unit, or over time? | Continuous | Two or three categorical, nested |

**Stratify** means split the data by a suspected cause and draw the picture once per group.
Every fishbone cause that is a category (machine, unit, channel, shift, day of week) can be
a stratifier; every cause that is a quantity (tool age, line items, minutes since the last
delivery) can be a scatter-plot X. The picture does not prove the cause; it tells you which
causes deserve a test.

Reading rules, sharpened from Yellow Belt:
- Two humps in a histogram means two processes are mixed in one dataset. Find the stratifier
  first.
- A wall at a specification limit usually means inspection or rework is removing points. Ask
  how the data were collected before you trust the shape.
- In a box plot, compare the boxes (middle 50%) before the whiskers. Points beyond the
  whiskers are flagged, not deleted.
- In a scatter plot, look for shape (straight, curved, fan), then clusters, then lone points.
  A cluster usually means a hidden category.
- Multi-vari has three families: **positional** (within one unit), **cyclical** (unit to
  unit, batch to batch), **temporal** (hour to hour, day to day). The family that carries
  most of the range is where you look for the cause.

**Show (HC).** Discharge order-to-departure time, four inpatient units, six weeks, n = 400
(the week's case dataset; values are simulated with planted effects).

```
Descriptive Statistics: order_to_depart_min by unit

unit    N    Mean   StDev   Median     Q1     Q3    Min    Max
N1     98   130.9    28.2    127.2  110.4  148.9   74.2  215.6
N2    104   138.2    33.5    132.6  114.1  157.0   80.5  241.3
N3     96   172.8    25.4    168.5  154.8  188.6  121.0  247.9
N4    102   135.8    37.5    126.6  109.7  154.3   72.8  262.1
```

*Reading:* N3's box sits about 40 minutes above the others, and its lower quartile (154.8)
is above the other units' upper quartiles. N1, N2 and N4 overlap almost completely. Long
right tails appear on every unit — the worst waits are everywhere; the *typical* wait is
what differs on N3. The multi-vari chart (units within day of week, across six weeks) agrees:
the unit-to-unit family is the largest, day of week is flat, week-to-week lines are parallel.
Weekend staffing, the team's favorite theory, is not where the variation lives.

**Show (MFG).** Bore diameter deviation from nominal (µm), 240 housings, scattered against
parts machined since the last tool change: the cloud rises left to right with two parallel
bands about 6 µm apart. A rising cloud says "tool age is a regression candidate." Two bands
say "there is a category you have not plotted." Marking machine A and B with different
shapes separates the bands: machine B runs high. Two causes, one picture.

**Show (TXN).** Invoice rejection is yes/no, so a box plot of "rejection" makes no sense.
Stratify the *rate*: rejection rate by channel (portal 4.2%, e-mail 11.2%, paper 18.1%) with
the invoice count printed under each bar. A 50% rate on four invoices is not a finding.

**Software.** Minitab: Graph > Histogram / Boxplot (With Groups) / Scatterplot (With Groups);
Stat > Quality Tools > Multi-Vari Chart. Excel: PivotTable to stratify, then the native
box-and-whisker chart; multi-vari as a line chart of group means with raw points overlaid.
R: `boxplot(y ~ group)`, `plot(x, y)`, `interaction.plot()`. Python: `seaborn.boxplot`,
`seaborn.scatterplot(hue=)`, `seaborn.pointplot`.

**When NOT to use these.** A histogram on fewer than about 30 points shows noise, not shape
— use a dot plot. A box plot hides two humps inside one box; draw the histogram per group
when a box looks oddly wide. Two variables that both trend with time will scatter as if
related — plot each against time first. A multi-vari chart needs the same structure in every
unit; with unbalanced data it misleads.

**Try.** On your own baseline data: histogram of Y; one box plot per categorical cause on your
fishbone (at least three); one scatter plot per quantitative cause. Write one sentence per
chart: "The variation in Y is / is not different across X, by about ___ units."

---

## 5.2 From fishbone to C&E matrix (35 min)

**Hook.** Your fishbone has 40 causes. Five are checkable this month. The C&E matrix chooses
the five without the loudest voice choosing for you.

**Teach.** The **cause-and-effect matrix** scores every candidate cause against every project
output (the CTQs from week 1 plus any secondary Y the sponsor cares about).
1. Outputs across the top, each weighted 1–10 by importance to the customer. The primary
   metric carries the highest weight; do not weight everything 10.
2. Causes down the side, one per row, as checkable statements ("labels smear when the
   printer runs hot," not "labels are bad").
3. Score each cause against each output: 0 none, 1 weak, 3 moderate, 9 strong. The 0/1/3/9
   scale forces the team to separate strong from moderate instead of drifting to 5s.
4. Total = sum of (score × weight). Sort descending. The top ten go to the FMEA; the rest are
   parked with their scores, not deleted.

The matrix is the team's *opinion*, structured. It ranks; it does not verify. It earns A1
credit because a reviewer can see why cause 7 outranked cause 23.

**Show (TXN).** Accounts payable rejections. Outputs: rejection rate (weight 10), days to pay
(6), clerk rework minutes (4). Six of the 38 causes:

| Cause (checkable statement) | Rejection rate (10) | Days to pay (6) | Rework min (4) | Total |
|---|---|---|---|---|
| Paper invoices are keyed by hand and PO numbers are mistyped | 9 | 3 | 9 | 144 |
| E-mailed PDFs arrive without a PO number on the first page | 9 | 3 | 3 | 120 |
| Approver is out of office and no delegate is set | 1 | 9 | 1 | 68 |
| Supplier segment (new vs established) | 3 | 3 | 1 | 52 |
| Clerk experience under 6 months | 3 | 1 | 3 | 48 |
| Amount above the second-signature threshold | 1 | 3 | 0 | 28 |

*Reading:* channel causes dominate; clerk experience scored low even though two managers
named it first. The matrix does not say the managers are wrong; it says that on the team's
own scoring, channel is worth testing first.

**Software.** Any spreadsheet with SUMPRODUCT; the program FMEA template carries a C&E tab;
Minitab has a Cause-and-Effect Matrix under Stat > Quality Tools in recent releases.

**When NOT to use it.** Under about ten causes, rank by discussion and go check. With a
single output the matrix collapses to one column — vote and check. Never cite a total as
evidence; 144 is a reason to test, not a result.

**Try.** Score your own fishbone. Mark which of your top ten you could check with data you
already have from Measure.

---

## 5.3 FMEA at working level (35 min)

**Hook.** Two causes score 144 and 120. One of them, if true, means a supplier is paid twice.
Score alone would test them in that order; risk says otherwise.

**Teach.** A **failure mode and effects analysis (FMEA)** asks, for each process step, how it
can fail (failure mode), what happens (effect), why (cause), and whether you would catch it
(control). Three 1–10 scores: **Severity (S)** of the effect on the customer or patient —
1 trivial, 10 safety or regulatory; **Occurrence (O)** — 1 rare, 10 nearly every time, from
Measure data where you have it, marked as an estimate where you do not; **Detection (D)** —
1 certain to be caught by the current control, 10 no control exists.

**Risk priority number (RPN) = S × O × D**, 1–1,000. Working level at Green Belt means: FMEA
the top ten causes from the C&E matrix to decide test order and log risk; rank by RPN; treat
any S of 8 or above as "test this regardless of RPN." Equal RPNs are not equal problems —
10 × 2 × 5 and 2 × 10 × 5 differ. Full process FMEA for design and control plans is Black
Belt scope.

**Show (HC).** Discharge, unit N3, four rows of the working FMEA:

| Step | Failure mode | Effect | S | Cause | O | Current control | D | RPN |
|---|---|---|---|---|---|---|---|---|
| Pharmacy sends discharge meds | Meds arrive after transport is booked | Patient waits; bed blocked; transport re-booked | 6 | Once-per-shift pharmacy delivery window on N3 | 8 | None — nurse phones to chase | 8 | 384 |
| Pending consult sign-off | Consult note unsigned at order | Order rescinded; patient stays | 8 | Consult service rounds after 2 pm | 5 | Charge nurse checks board at 10 am | 4 | 160 |
| Transport request | Stretcher request queued behind ambulatory | 40–60 min wait for stretcher patients | 4 | Single transport queue, no priority field | 6 | None | 7 | 168 |
| Paperwork printed | Wrong printer selected on N3 | Nurse walks to N2 to collect | 2 | Default printer mapped to old bay | 7 | Nurse notices | 3 | 42 |

*Reading:* the pharmacy window has the highest RPN and the box plot already points at N3, so
it is tested first. The consult row is tested second on severity alone. The printer row is a
Just-Do-It — fix it this week, log it, do not test it. No row names a person; every cause is
a design decision someone made rationally (a pharmacy that batches deliveries once per shift
is saving courier trips).

**Software.** The program FMEA template; Minitab Workspace and most quality platforms have an
FMEA form. Nothing statistical is computed.

**When NOT to use it.** When all causes are low-severity and the C&E ranking is clear, the
FMEA adds an hour and no information — say so in your A1 narrative. Do not apply RPN
thresholds ("act above 100") as a rule. Do not FMEA a process you have not mapped; the steps
come from the week 2 map.

**Try.** FMEA your top ten. Test order: RPN rank, severity override, then "already have the
data" as tiebreaker.

---

## 5.4 The hypothesis-testing framework (45 min)

**Hook.** Unit N3 is about 37 minutes slower on the box plot. A manager asks: "Could that be
chance? Six weeks is not much." She is asking the right question. A hypothesis test is the
disciplined way to answer it.

**Teach.** Every test in week 6 follows one frame.

**Null hypothesis (H₀):** the boring explanation — no difference between groups, no
relationship between X and Y, the mean equals the target. **Alternative (H₁):** there is a
difference, a relationship, a gap. You state both before you look, together with the
practical difference that would matter to the sponsor. That number is not in the software;
it comes from the charter.

**Alpha (α):** the false-alarm risk you accept. House default 0.05; 0.01 when a false alarm
is expensive (you would re-tool a line on the result); 0.10 when the test is a screen, not a
verdict. Choose before the test and write it in the test plan.

**The p-value, in plain words:** *if the null hypothesis were true, how often would sampling
alone produce a result at least as extreme as this one?* A p-value of 0.003 means "about
three times in a thousand." What a p-value is not: the probability the null is true; the
probability you are right; how big the effect is; how important it is. Each of those four
misreadings is a defect in a tollgate.

**Decision:** p ≤ α → reject H₀, "the data show a difference." p > α → fail to reject H₀,
"the data do not show a difference *at this sample size*." Never "there is no difference."
Absence of evidence with n = 12 is a small-sample statement, and A4 requires you to say so.

**Two ways to be wrong.** Type I: you reject H₀ and it was true (false alarm; rate α).
Type II: you fail to reject and it was false (a miss; rate β; **power** = 1 − β). At Green
Belt you do not design for power; you check it after a "not significant" result, using the
software's power-and-sample-size tool with the practical difference you named up front. If
power to detect that difference was 30%, the honest sentence is "we could not tell."

**Practical versus statistical significance.** Statistical significance says the effect is
probably not zero. Practical significance says it is big enough to act on.
- **TXN.** Rejection rate for established suppliers 9.6% vs new suppliers 10.8%, n = 1,800.
  Chi-square gives p ≈ 0.4 — not significant — and even if it were, 1.2 percentage points on
  a 10% rate is not where the benefit lives.
- **MFG.** Shift 3 bore deviation averages 2.1 µm above shifts 1 and 2, n = 80 per shift;
  two-sample t gives p = 0.02. Statistically real, and 2.1 µm is 14% of the tolerance. Then
  the multi-vari chart shows why: tool changes happen at the start of shift 1, so shift 3
  runs the oldest tools every day. Shift is **confounded** with tool age — a proxy. Testing
  it would verify the proxy, and a countermeasure aimed at shift 3 would leave the cause
  running.

The rule: the effect size in the customer's units, with its confidence interval (week 6),
decides practical significance; the p-value only says whether chance is a plausible
explanation. Your sponsor sentence always contains the first and rarely leads with the second.

**Which test do I use?** Classify Y and X by data type (week 2), then read the row. The
printable selector with worked examples is `templates/hypothesis-test-selector.md`.

| Y (outcome) | X (suspected cause) | Question | Test (week 6) |
|---|---|---|---|
| Continuous | None — a target or claim | Is the mean different from the target? | One-sample t |
| Continuous | Categorical, 2 groups, different units in each | Do the two means differ? | Two-sample t (Welch) |
| Continuous | 2 conditions on the *same* units | Does the within-unit difference average zero? | Paired t |
| Continuous | Categorical, 3+ groups | Do any means differ; which? | One-way ANOVA + Tukey |
| Continuous | Continuous | Does Y change with X; by how much per unit? | Correlation + simple linear regression |
| Attribute (yes/no, category) | Categorical | Is the rate associated with the group? | Chi-square test of association |
| Attribute | Continuous | — | Out of scope (logistic regression is Black Belt); bin X into groups and use chi-square, stating the loss |
| Continuous, heavily skewed, small n | Categorical | Do the groups differ? | Ask your coach; t and ANOVA tolerate moderate skew above about 30 per group, and the non-parametric alternatives are listed as exclusions in the credential crosswalk |

**Software.** Minitab: Stat > Basic Statistics, Stat > ANOVA, Stat > Power and Sample Size.
Excel: Analysis ToolPak (t-Test, ANOVA: Single Factor, Regression) plus `CHISQ.TEST`; no
power tool — use R or a named online calculator. R: `t.test`, `aov`, `chisq.test`, `lm`,
`power.t.test`. Python: `scipy.stats` and `statsmodels.stats.power`.

**When NOT to test.** When the graph shows two non-overlapping distributions at n = 100 per
group, the test adds a decimal place to the obvious; run it for the record and spend your
time on confounding. When the groups are before and after a change *you* made, that is
Improve evidence (★ I3) and the control chart is the primary tool. When the measurement
system failed its MSA, no test rescues it.

**Try.** For each of your top five causes: H₀, H₁, α, the practical difference, the selector
row. If a cause fits no row, rewrite it until it does or explain why it will be checked by
observation instead.

---

## 5.5 The test plan (15 min)

One row per surviving cause; six columns. "n available / n wanted" is the A4 honesty column.

| Cause (checkable) | Y and X types | Test | Data needed and where it lives | n available / n wanted | Owner and date |
|---|---|---|---|---|---|
| N3 pharmacy delivery window drives order-to-depart time | Continuous Y; categorical X (4 units) | One-way ANOVA, Tukey | Six weeks of discharge timestamps by unit, extracted in week 4 | 400 / 400 | Nurse lead, Thu |
| Meds arriving after the order add delay on every unit | Continuous Y; categorical X (Y/N) | Two-sample t | Add the pharmacy delivery timestamp to the extract | 400 / 200 per group | Pharmacy analyst, Fri |

---

## Live lab — run of show: the cause-narrowing lab (150 min)

**Outcome.** Every team leaves with five checkable causes and a test plan, from a fishbone of
forty, on the vertical case; every learner leaves with the same for their own project.
**Room.** Teams of 4–5 by case; producer above 16; boards pre-loaded with the case fishbone
(40 causes — six deliberately uncheckable, three the site manager's favorites), the dataset,
and blank C&E, FMEA and test-plan frames.

### 0:00–0:10 — Setup and the trap
Poll: "Which of the 40 causes is it? Gut only." Save the results. Frame: *"You will narrow
40 to 5 with scoring you can defend, then find out how much of the room's gut survived."*

### 0:10–0:35 — Round 1: pictures first
Teams stratify the case Y by five categorical causes and two quantitative ones (charts
pre-built; teams choose which to open and write one sentence each). Facilitator's one
question: *"Where does the variation live — and is that a cause, or a proxy for one?"* The
MFG shift confound and the HC weekend theory are planted here. Teams that plot by shift and
stop have found a proxy; do not rescue them yet.

### 0:35–1:05 — Round 2: checkability and the C&E matrix
Teams rewrite the six uncheckable causes or strike them with a reason, then score the matrix.
Two rules enforced: no 5s, and any 9 must name the data that would show it. **Failure mode:**
the site manager's favorite scores 9 across the board. Ask: *"What did the box plot say about
that one?"*

### 1:05–1:35 — Round 3: FMEA on the top ten
S, O, D scored, O from data where it exists, severity override applied, Just-Do-Its marked.
**Failure mode:** every D is a 10 because "nobody checks anything." Push for the control that
actually exists, even if it is a person noticing; a 7 with a reason beats a 10 by reflex.

### 1:35–1:55 — Round 4: the test plan
Five causes; H₀, H₁, α, practical difference, selector row, data source, n available. If the
confounded shift cause survives, it gets its test — and the facilitator asks what the
countermeasure would be. The team cannot write one. That is the lesson: a proxy verifies, but
it cannot be fixed.

### 1:55–2:15 — Transfer: your own project
Pairs from different verticals. Three minutes each on your own fishbone-to-five; the partner
hunts for the uncheckable cause and the proxy. Revised plans posted to the cohort channel for
the week 6 checkpoint.

### 2:15–2:30 — Debrief: what survived
Reveal the planted causes; re-run the opening poll against the teams' final five. Typically a
third of the gut picks survive. Name the patterns: the loudest cause was a proxy; the
highest-RPN row was not the highest C&E score; the Just-Do-It was hiding in the matrix.
**Protect the debrief.** If round 3 overruns, cut it at 1:35 with the top-ten order as it
stands; an unfinished FMEA learns more from the reveal than from ten more minutes of scoring.

**Facilitator notes.** A team at five causes by 1:05 gets the adversarial job: "Which of your
five would you bet is *wrong*, and what data would show it?" Matrix frames must be editable
by everyone at once or scoring becomes one person typing; test the boards before round 2.
Single-vertical corporate cohorts: give one team the off-vertical case and compare in the
debrief.

---

## Project work this week

Keyed to [`../project/review-rubric.md`](../project/review-rubric.md):
- **A1 Cause generation and narrowing (6 pts).** Fishbone → C&E matrix with weights and
  scores visible → working FMEA on the top ten → five checkable causes. The reviewer must be
  able to trace why each of the five is there and why the parked causes were parked.
- **A2 Graphical analysis (5 pts).** At least three stratified charts on the baseline data,
  labeled with units and n, each with a one-sentence reading. Proxies named as proxies.
- **Setup for ★ A3.** The test plan, "n available / n wanted" filled honestly; data pulls
  scheduled so the numbers exist before the week 6 lab.
- **Data ethics.** Stratifying is not filtering. If a chart looks better without a group, the
  group stays in and the caption says why it looks that way.

Coaching checkpoint this week: 30 minutes, on the test plan.

## Coaching prompts

1. "Show me the cause the room was surest about in week 1. Where did it land in the C&E
   matrix, and what did the stratified chart say about it?"
2. "For your top cause: what practical difference would matter to your sponsor, in the
   metric's units, and where did that number come from?"
3. "Which of your five is a proxy — a shift, a person, a day — and what does it stand for?"

## The week's vertical case dataset

Each learner works one case all course; the three share a structure. Values are simulated
with planted effects and are labeled as such in the practicum files.

- **MFG — housing bore diameter, line 2.** 240 parts, four weeks. Columns: part_id, date,
  shift (1/2/3), machine (A/B), operator_code, parts_since_tool_change (0–320),
  coolant_temp_C, material_lot, bore_deviation_um (nominal 25.000 mm, specification ±15 µm).
  Planted: machine B runs about 6 µm high (fixture datum wear); deviation rises about 0.03 µm
  per part of tool age; shift 3 *appears* worse only because tool changes start shift 1; one
  operator appears worse only because they run machine B; coolant temperature and material
  lot carry no effect.
- **HC — discharge order-to-departure time, four inpatient units.** 400 discharges, six
  weeks. Columns: discharge_id, date, unit (N1–N4), day_of_week, order_time, departure_time,
  order_to_depart_min, transport_mode, meds_to_bedside_after_order (Y/N), pending_consult
  (Y/N). Planted: N3 runs about 37 minutes longer (once-per-shift pharmacy window); meds
  after the order add about 45 minutes on every unit; day of week carries no effect;
  transport mode a small effect for stretcher patients only.
- **TXN — accounts payable invoice rejections.** 1,800 invoices, one quarter. Columns:
  invoice_id, received_date, channel (portal/e-mail/paper), supplier_segment, line_items,
  clerk_code, amount_band, rejected (Y/N), rejection_reason, days_to_pay. Planted: rejection
  rate by channel 4.2% / 11.2% / 18.1%; days_to_pay rises with line_items; a clerk effect
  appears in a first-level chart and vanishes when stratified by channel, because clerks are
  assigned by channel; supplier segment carries no effect.

Each case ships the 40-cause fishbone used in the lab; the uncheckable and favorite-theory
causes are marked in the facilitator key only.

## Takeaways

- Stratify before you test: box plots, scatter plots and multi-vari charts show where the
  variation lives and expose proxies that a test would happily verify.
- The C&E matrix ranks by structured opinion; the FMEA re-ranks by risk; neither verifies.
  The narrowing logic must be visible to a reviewer.
- A p-value answers one question — could chance alone do this? — and never how big or how
  important. The practical difference comes from the charter, before the test.

## Cumulative check

**C1.** In week 4 your baseline I-MR chart of order-to-depart time showed a stable process
with Ppk = 0.42 against the 120-minute upper limit. This week the stratified box plot shows
unit N3 about 37 minutes above the others. The correct restatement of the week 4 result is:
A. The process was never stable — N3 is a special cause and should be removed from the baseline ·
B. The process is stable and not capable; stratification shows part of the common-cause variation is unit-to-unit, which is where Analyze looks first ✅ ·
C. Recompute capability with N3 excluded so the baseline reflects the "true" process ·
D. Tighten the control limits to the N1/N2/N4 spread
`[B3 · G4 · Analyze · HC · S · PRAC]` — Stability was assessed on the mixed stream, which is
how the customer experiences it; N3 is common-cause variation to investigate, not a special
cause to delete. A confuses a stratification finding with a chart signal; C is the rubric's
data-ethics stop.

**C2.** Your week 3 variable Gage R&R on the bore gauge returned 34% of study variation, and
no better gauge is available before Analyze. You want to test whether machine B runs high
(observed difference about 6 µm). The most defensible course is:
A. Run the two-sample t-test as planned; the p-value accounts for measurement error ·
B. Skip the test and rely on the box plot ·
C. Re-check the gauge on machine B's parts only, since that is where the difference is ·
D. Run the test and state in A4 that a third of the observed variation is measurement error, so the effect estimate carries that uncertainty and a gauge improvement is a pre-condition for the pilot ✅
`[B2 · G3 · Apply · MFG · S · PRAC]` — A known-marginal measurement system is disclosed, not
ignored; a p-value describes sampling error, not gauge error, which is why A is wrong. C
changes the measurement study between groups and biases the comparison.

---

v1.0 · 2026-09-20
