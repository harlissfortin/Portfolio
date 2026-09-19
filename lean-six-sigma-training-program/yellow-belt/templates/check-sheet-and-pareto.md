# Check Sheet + Auto-Pareto Workbook — Design Guide

*The fillable version is an Excel/Sheets workbook: tally tab feeds an auto-sorted Pareto
(by count and by weighted impact) and a run chart. This page is the design discipline
behind it.*

## Before you collect
1. **Write the question** the data must answer (one sentence, on the sheet itself):
   *"Which ___ are most common / when do ___ happen / where do ___ occur?"*
2. **Define the event operationally** — the new-hire test: could someone apply it alone on
   day one and match your count? Source, threshold, clock.
3. **Choose 5–8 categories** from the process's own vocabulary, each operationally defined,
   plus "Other (describe)". *Rule: Other >~20% of tallies → categories were wrong; revise
   and re-collect.*
4. **Add context columns** — date/time, shift/team, product/order type. Never
   person-identifying columns: this data improves processes, not performance reviews, and
   the team is told so explicitly.
5. **Pilot one day**, fix the sheet, then run the real window (long enough to cover the
   conditions that might matter: shifts, weekdays, product mix).

## The sheet

**Question:** ______________________  **Collector(s):** ______________________
**Period:** ____ to ____  **Where in the flow it's captured:** ______________________

| Category (operational definition attached) | Mon | Tue | Wed | Thu | Fri | **Total** | Impact weight *(min lost / $ / severity)* |
|---|---|---|---|---|---|---|---|
| 1. | | | | | | | |
| 2. | | | | | | | |
| 3. | | | | | | | |
| 4. | | | | | | | |
| 5. | | | | | | | |
| Other (describe overleaf) | | | | | | | |

## Reading the Pareto (workbook draws it)
- Bars descending, "Other" last, cumulative-% line marks the ~80% crossing.
- **Chart twice when severities differ:** by count AND by impact (count × weight). Attack
  the pain chart when they disagree.
- **Go two levels:** Pareto within your chosen bar (by shift, machine, form type…) before
  concluding anything.
- Flat Pareto = no dominant category → recheck categories or suspect a systemic cause.
- The tallest bar tells you **where to look, never why** — hand it to your fishbone/5 Whys,
  don't skip to a fix.
