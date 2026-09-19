# Unit 3B — Data Basics II: Pareto, Run Charts & the Numbers You'll Be Shown (1.5 h)

**Prerequisite:** Unit 3A and the sim data collection (20 orders on your own check sheet).

**Learning objectives.** By the end of this unit the learner can:
1. Build a Pareto chart from check-sheet data and use it to choose a focus.
2. Read a run chart: distinguish routine variation from a signal, and resist tampering.
3. Describe a set of data by its **center and spread** (mean, median, range, standard
   deviation — as concepts), and read a histogram.
4. Read a **control chart** a Green Belt hands them: say what the limits mean, what "in
   control" does and doesn't mean, and why limits are not specifications or targets.
5. Explain in plain words what a **capability index** (Cpk) is telling the room, and ask
   the one measurement-system question a Yellow Belt should always ask.

*Objectives 3–5 exist so that the Yellow Belt is a competent reader of the numbers Green and
Black Belts produce — aligned to the IASSC and ASQ Yellow Belt bodies of knowledge — without
being expected to compute any of them.*

---

## 3B.1 Pareto: choosing your battle (25 min)

The **Pareto principle**: in most processes, a large majority of the trouble (~80%) comes
from a few of the causes/categories (~20%). A **Pareto chart** is a bar chart sorted
tallest first, with a cumulative-% line, used to pick the vital few and ignore the trivial
many — the single most useful chart in improvement work.

Build rules:
- Bars sorted descending; "Other" always last regardless of size.
- Cumulative line marks where you cross ~80%.
- **Chart the pain, not just the count**, when severities differ wildly: a Pareto by
  *cost* or *time lost* often reorders the bars dramatically. (The sim shows the same data
  both ways: the most *frequent* error is a 2-minute fix; the most *expensive* is #4 by
  count.)
- **Second-level Pareto:** once the big bar is chosen, Pareto *within* it (top defect by
  machine, by shift, by form type…). Two levels of Pareto is often most of an Analyze phase
  at this scale.

Reading rules:
- A flat Pareto (all bars similar) is also an answer: no dominant category — the
  categories may be wrong, or the problem is systemic rather than categorical.
- Pareto shows *where* to look, never *why*. The tallest bar is a door, not a diagnosis.

**Try (sim):** Build the Pareto from your 20-order check sheet (auto-tallied), by count and
then by minutes-lost; state which category you'd attack and defend the choice in one
sentence.

---

## 3B.2 Run charts: seeing behavior over time (25 min)

A **run chart** is data plotted in time order with the median drawn as a reference line.
It answers the question a bar chart and an average both hide: **how does this process
behave over time?**

**Two kinds of variation:**
- **Common-cause (routine) variation:** the ordinary jiggle every process has — the voice
  of the process design. You reduce it by *changing the process*.
- **Special-cause (signal) variation:** something changed — a pattern ordinary jiggle
  doesn't produce. You address it by *finding what changed*.

Yellow Belt signal rules (run chart with a median; after Perla, Provost & Murray):
1. **Shift:** 6+ consecutive points all on one side of the median.
2. **Trend:** 5+ consecutive points all rising (or all falling).
3. **Astronomical point:** a value wildly outside everything the process has ever done.
Everything else — a good day here, a bad day there — is routine. (Unit 3B.4 shows how a
control chart formalizes the same idea with calculated limits.)

**The tampering lesson:** reacting to routine variation as if it were a signal —
"yesterday was bad, everyone tighten up!" — is called **tampering**, and it provably
*increases* variation while exhausting the team. The discipline: no explanations demanded
for individual points inside routine variation; energy goes to shifting the whole
distribution (improvement) or investigating genuine signals. Also banned: comparing two
single points ("errors are up versus last week!"). **Two points is not a trend.**

**Try (sim):** Four run charts, one question each: "Signal or routine — and which rule?"
Then the trap exercise: a manager's memo reacting to a routine down-week; learner drafts
the two-sentence run-chart-literate reply.

---

## 3B.3 Center and spread: describing a pile of numbers (15 min)

When someone says "our turnaround is 3 days," a Yellow Belt asks two questions: *which
kind of 3 days* — and *how spread out?*

**Center.**
- **Mean** (average): add them up, divide by how many. Pulled around by extreme values —
  one 40-day outlier drags a 3-day mean upward.
- **Median**: the middle value when sorted. Resistant to outliers. That's why run charts
  use the median as their reference line — a few wild points don't move it.
- **Mode**: the most common value. Useful for categories ("most orders are 2 days").
Rule of thumb: skewed data (waiting times, costs, anything with a long tail) → report the
median and say so. Ask "mean or median?" whenever a number is presented alone.

**Spread.**
- **Range**: largest minus smallest. Quick, crude, sensitive to one outlier.
- **Standard deviation (SD, σ)**: the typical distance of a value from the mean. You don't
  compute it at Yellow Belt; you *read* it: a small SD means consistent, a large SD means
  the customer is getting wildly different experiences. Two processes with the same mean
  and different SDs are different processes (Module 3's espresso café, in a number).
- **Histogram**: bars showing how many values fall in each range. Look for the shape —
  symmetric bell, long tail to one side, or two humps (two humps almost always means two
  processes hiding in one data set: two shifts, two machines, two forms).

**Try:** Three data sets shown as histograms with mean and median marked; for each: "Which
center would you report, and what does the shape tell you to go look for?"

---

## 3B.4 Reading a control chart (15 min)

A **control chart** is a run chart with two extra lines: an **upper and lower control
limit**, calculated *from the process's own data* — typically about three standard
deviations either side of the center line. Green Belts build them; Yellow Belts must read
them correctly, because they will be shown them at every tollgate.

What the limits mean:
- Points inside the limits with no patterns → **only common-cause variation**: the process
  is *stable* ("in control"). Stable does **not** mean good — a stable process can be
  stably terrible. It means predictable, and that improving it requires changing the
  process, not chasing points.
- A point outside a limit, or a run/trend pattern like the run-chart rules → a **special
  cause**: something changed; go find it.

What the limits are **not**:
- **Not specification limits.** Spec limits come from the customer ("must be delivered
  within 5 days"). Control limits come from the process ("this process delivers in 2–9
  days"). A process can be perfectly in control and still miss the spec on every order.
- **Not targets.** Nobody "aims for" a control limit. And drawing a target line on the
  chart does not make the process capable of hitting it.

The Yellow Belt questions to ask when shown a control chart: *Is it stable? Where did the
limits come from? Are the specs on this chart too — and how does the process spread compare
to the spec width?*

**Try:** Four control charts (two stable, one with a point beyond limits, one stable but
entirely outside the customer's spec); learner states "stable / not stable" and "meeting
spec / not meeting spec" for each — the separation of the two ideas is the test.

---

## 3B.5 Capability and measurement error — what the Green Belt is saying (10 min)

**Capability in one picture.** Put the customer's spec width next to the process's spread
(roughly six standard deviations). If the process spread is narrower than the spec width
*and* centered, the process is **capable**. The index Green Belts quote is **Cpk**: it
compares the spec width to the process spread, penalized for being off-center.
Plain-language reading:
- **Cpk < 1** — the process spread is wider than the spec (or badly off-center); it is
  producing out-of-spec output *right now*.
- **Cpk ≈ 1** — barely fits; any drift produces defects.
- **Cpk ≥ 1.33** — the conventional "capable" threshold; comfortable margin.
You will not compute Cpk. You will hear "we're at 0.8" and know it means "we are shipping
defects, and inspection is the only thing catching them."

**Measurement error.** Two people measuring the same thing get different numbers; the
same gauge reads differently in the morning and after lunch; two auditors count
"incomplete" differently (Unit 3A). Some of the variation in any chart is the *measurement
system's*, not the process's. Green Belts test this formally (a Gage R&R or attribute
agreement study). The Yellow Belt's job is one question, asked before anyone trusts a
chart: **"Has the measurement system been checked?"** If nobody can answer, the chart is
not yet evidence.

**Try:** Two statements from a Green Belt ("Cpk is 0.7 on line 2" / "the gauge study
showed 45% of variation is measurement") — learner writes the one-sentence plain-language
translation for a supervisor, and the one follow-up question each statement demands.

---

## 3B.6 Wrap: the Yellow Belt data toolkit in sequence (5 min)

> **Define it** (operational definition) → **collect it** (check sheet, context columns,
> honest conditions) → **focus it** (Pareto, by count and by pain) → **watch it over time**
> (run chart; control chart when a Green Belt provides one) → **describe it honestly**
> (median for skewed data; spread, not just center) → **before trusting it, ask whether
> the measurement was checked.**

**Cumulative check (2 items from Units 1–3A):** process-map altitude; operational
definitions.

**Key takeaways**
- Pareto chooses the battle (chart the pain, go two levels); it never explains it.
- Median run chart + three rules; react to signals, never tamper with noise.
- Center *and* spread; median for skewed data; two humps = two processes.
- Control limits come from the process; specs come from the customer; stable ≠ good.
- Cpk < 1 means defects are being produced now. Always ask whether the measurement system
  was checked.
