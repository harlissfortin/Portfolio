# Unit 3A — Data Basics I: Definitions & Collection (1.0 h)

*Unit 3 was split into 3A and 3B on review: the original two-hour block carried five
distinct skills and was the program's densest segment. Sequence: **3A → collect sim data
(embedded, ~30 min, at least one day later) → 3B.** The gap is deliberate — learners
analyze data they collected earlier, not data they just saw.*

**Learning objectives.** By the end of this unit the learner can:
1. Write an operational definition that two different people would apply identically.
2. Choose measurement over count data when both are available, and say why.
3. Design, pilot, and run a check sheet to collect defect/occurrence data on a real
   process, with context columns and honest collection conditions.

---

## 3A.1 Why data, and what kind (25 min)

Opinions about a process are unlimited and free; data is what ends the meeting. But "get
data" hides decisions Yellow Belts must make consciously.

**Data types (this determines every tool downstream):**
- **Count/attribute data** — things you count or classify: defects, errors, yes/no,
  categories. Cheap to collect, less informative per observation.
- **Measurement/continuous data** — things you measure on a scale: minutes, millimeters,
  dollars, temperature. Richer; a smaller sample says more.
Rule of thumb: **if you can measure instead of count, measure.** "Order was late: yes/no"
tells you less than "order took 9.4 days."

**Operational definitions — the unglamorous superpower.** An operational definition
specifies exactly how to decide or measure, so any two people get the same answer. "Late
order" is not a definition. *"Late = shipped after 5:00 pm site time on the promised ship
date recorded in field X"* is. Test: could a new hire apply it, alone, on their first day,
and match your answer? Every data argument you have ever witnessed ("that shouldn't
count!") was an operational definition failing after the fact instead of being agreed
before.

**Sampling awareness (Yellow Belt depth):** you rarely need all the data — you need data
that *fairly represents* the process. Two rules: collect across the conditions that might
matter (shifts, days, staff, product types — don't sample only Tuesday mornings), and
record those conditions alongside each observation so patterns can be seen later. Green
Belts formalize this; Yellow Belts must simply not sample lopsidedly.

**Try:** Rewrite three fuzzy metrics from your vertical ("clean room," "quick response,"
"complete application") as operational definitions; the sim grades them against the
new-hire test with counter-examples.

---

## 3A.2 Check sheets: collection built for the collector (25 min)

A **check sheet** is a form designed so that capturing an event takes one tally mark — and
so the data comes back analysis-ready.

Design steps (template: [`templates/check-sheet-and-pareto.md`](../templates/check-sheet-and-pareto.md)):
1. **Decide the question first.** "Which defect types are most common?" needs a different
   sheet than "when do the errors happen?"
2. **Choose categories from the process's own vocabulary** — 5–8 categories, defined
   operationally, plus "Other (describe)". If Other exceeds ~20%, your categories were
   wrong; revise and re-collect.
3. **Add context columns** you'll wish you had later: date/time, shift, line/team, product
   type. (Cheap now, impossible retroactively.) Not person-identifying columns: the data
   improves processes, not performance reviews, and the team is told so explicitly.
4. **Pilot for one day.** Every check sheet reveals its flaws in the first day —
   ambiguous categories, missing columns, awkward workflow fit.
5. **Make it effortless at the point of work** — paper at the bench, one-tap form on the
   floor, a column in the ticket system. If collection interrupts the work, the data will
   quietly stop.

Honesty conditions: the team must know **why** data is being collected and that it will
never be used to rank or punish people. Data collected under fear is fiction.

**Try:** Design a check sheet for a recurring problem in your own area (the question,
5–8 categories with definitions, context columns). Post it to the cohort channel for a
peer "new-hire test" before you run it.

---

## 3A.3 Wrap → go collect (10 min)

**Cumulative check (2 items from Units 1–2):** SIPOC requirements; the strongest form of
visual control.

**Before Unit 3B:** run the **pizza-order simulation** for 20 virtual orders using the
provided check sheet. The sheet's flaws are planted — an ambiguous category and a missing
"time of day" column. Finding them is the exercise; fixing them and re-running is the
lesson. Your tallies feed Unit 3B's Pareto and run chart, so don't skip it.

**Key takeaways**
- Measure beats count; operational definitions before collection, always.
- Check sheets are designed backwards from the question, then piloted.
- Context columns yes; person columns no; fear-free collection or no data at all.
