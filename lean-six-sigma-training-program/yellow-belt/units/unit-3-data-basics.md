# Unit 3 — Data Basics: Check Sheets, Pareto & Run Charts (2.0 h)

**Learning objectives.** By the end of this unit the learner can:
1. Write an operational definition that two different people would apply identically.
2. Design and run a check sheet to collect defect/occurrence data on a real process.
3. Build a Pareto chart from check-sheet data and use it to choose a focus.
4. Read a run chart: distinguish routine variation from a signal, and resist tampering.

---

## 3.1 Why data, and what kind (20 min)

Opinions about a process are unlimited and free; data is what ends the meeting. But "get
data" hides two decisions Yellow Belts must make consciously:

**Data types (this determines every tool downstream):**
- **Count/attribute data** — things you count or classify: defects, errors, yes/no, categories.
  Cheap to collect, less informative per observation.
- **Measurement/continuous data** — things you measure on a scale: minutes, millimeters,
  dollars, temperature. Richer; a smaller sample says more.
Rule of thumb: **if you can measure instead of count, measure.** "Order was late: yes/no"
tells you less than "order took 9.4 days."

**Operational definitions — the unglamorous superpower.** An operational definition specifies
exactly how to decide or measure, so any two people get the same answer. "Late order" is not
a definition. *"Late = shipped after 5:00 pm site time on the promised ship date recorded in
field X"* is. Test: could a new hire apply it, alone, on their first day, and match your
answer? Every data argument you have ever witnessed ("that shouldn't count!") was an
operational definition failing after the fact instead of being agreed before.

**Sampling awareness (Yellow Belt depth):** you rarely need all the data — you need data that
*fairly represents* the process. Two rules: collect across the conditions that might matter
(shifts, days, staff, product types — don't sample only Tuesday mornings), and record those
conditions alongside each observation so patterns can be seen later. Green Belts formalize
this; Yellow Belts must simply not sample lopsidedly.

**Try:** Rewrite three fuzzy metrics from your vertical ("clean room," "quick response,"
"complete application") as operational definitions; the sim grades them against the
new-hire test with counter-examples.

---

## 3.2 Check sheets: collection built for the collector (25 min)

A **check sheet** is a form designed so that capturing an event takes one tally mark — and so
the data comes back analysis-ready.

Design steps (template: [`templates/check-sheet-and-pareto.md`](../templates/check-sheet-and-pareto.md)):
1. **Decide the question first.** "Which defect types are most common?" needs a different
   sheet than "when do the errors happen?"
2. **Choose categories from the process's own vocabulary** — 5–8 categories, defined
   operationally, plus "Other (describe)". If Other exceeds ~20%, your categories were wrong;
   revise and re-collect.
3. **Add context columns** you'll wish you had later: date/time, shift, line/team, product
   type. (Cheap now, impossible retroactively.)
4. **Pilot for one day.** Every check sheet reveals its flaws in the first day — ambiguous
   categories, missing columns, awkward workflow fit.
5. **Make it effortless at the point of work** — paper at the bench, one-tap form on the
   floor, a column in the ticket system. If collection interrupts the work, the data will
   quietly stop.

Honesty conditions: the team must know **why** data is being collected and that it will
never be used to rank or punish people. Data collected under fear is fiction.

**Try (sim):** Run the pizza-order simulation for 20 virtual orders using the provided check
sheet; the sheet's flaws (an ambiguous category, a missing "time of day" column) are planted
— finding them is the exercise.

---

## 3.3 Pareto: choosing your battle (30 min)

The **Pareto principle**: in most processes, a large majority of the trouble (~80%) comes
from a few of the causes/categories (~20%). A **Pareto chart** is a bar chart sorted tallest
first, with a cumulative-% line, used to pick the vital few and ignore the trivial many —
the single most useful chart in improvement work.

Build rules:
- Bars sorted descending; "Other" always last regardless of size.
- Cumulative line marks where you cross ~80%.
- **Chart the pain, not just the count**, when severities differ wildly: a Pareto by *cost*
  or *time lost* often reorders the bars dramatically. (The sim shows the same data both
  ways: the most *frequent* error is a 2-minute fix; the most *expensive* is #4 by count.)
- **Second-level Pareto:** once the big bar is chosen, Pareto *within* it (top defect by
  machine, by shift, by form type…). Two levels of Pareto is often 80% of an Analyze phase.

Reading rules:
- A flat Pareto (all bars similar) is also an answer: no dominant category — the categories
  may be wrong, or the problem is systemic rather than categorical.
- Pareto shows *where* to look, never *why*. The tallest bar is a door, not a diagnosis.

**Try (sim):** Build the Pareto from your 20-order check sheet (auto-tallied), by count and
then by minutes-lost; state which category you'd attack and defend the choice in one
sentence.

---

## 3.4 Run charts: seeing behavior over time (35 min)

A **run chart** is data plotted in time order with the median drawn as a reference line. It
answers the question a bar chart and an average both hide: **how does this process behave
over time?**

Core concept — **two kinds of variation:**
- **Common-cause (routine) variation:** the ordinary jiggle every process has. It's the voice
  of the process design; you reduce it by *changing the process*.
- **Special-cause (signal) variation:** something changed — a new pattern that ordinary
  jiggle doesn't produce. You address it by *finding what changed*.

Yellow Belt signal rules (simplified, on a run chart with a median):
1. **Shift:** 6+ consecutive points all on one side of the median.
2. **Trend:** 5+ consecutive points all rising (or all falling).
3. **Extreme point:** a point wildly outside everything the process has ever done.
Everything else — a good day here, a bad day there — is routine. Green Belt replaces these
with control-chart limits; the Yellow Belt job is to stop over-reading noise *today*.

**The tampering lesson (the unit's most valuable 10 minutes):** reacting to routine variation
as if it were a signal — "yesterday was bad, everyone tighten up!" — is called **tampering**,
and it provably *increases* variation while exhausting the team. The discipline: no
explanations demanded for individual points inside routine variation; energy goes to shifting
the whole distribution (improvement) or investigating genuine signals.
Also banned: comparing two single points ("errors are up versus last week!"). Two points is
not a trend; the run chart is the antidote to two-point management.

**Try (sim):** Four run charts, one question each: "Signal or routine — and which rule?"
Then the trap exercise: a manager's memo reacting to a routine down-week; learner drafts the
two-sentence run-chart-literate reply.

---

## 3.5 Wrap: your data toolkit in sequence (10 min)

The Yellow Belt data pattern, end to end — also the skeleton of your mini-project's evidence:

> **Define it** (operational definition) → **collect it** (check sheet, context columns,
> honest conditions) → **focus it** (Pareto, by count and by pain) → **watch it over time**
> (run chart, baseline before/after your change).

A mini-project whose storyboard shows this sequence — baseline run chart, Pareto that chose
the target, after-change run chart — is what "data-driven" means at this level.

**Key takeaways**
- Measure beats count; operational definitions before collection, always.
- Check sheets are designed backwards from the question, then piloted.
- Pareto chooses the battle (chart the pain, go two levels); it never explains it.
- Median run chart + three rules; react to signals, never tamper with noise.
