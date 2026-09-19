# Unit 1 — Process Thinking: SIPOC & Process Mapping (2.0 h)

**Learning objectives.** By the end of this unit the learner can:
1. Build a complete SIPOC for a process they own, including customer requirements.
2. Draw an as-is swimlane map of a real process at the right level of detail (8–20 steps).
3. Validate a map by **walking the process** and correcting at least one "work-as-imagined
   vs. work-as-done" gap.
4. Read a value stream map and locate the largest delay.

---

## 1.1 SIPOC as a working tool (25 min)

White Belt introduced SIPOC as a lens. Yellow Belt uses it as the **first artifact of any
improvement effort** — the 20-minute exercise that gets a team aligned on what the process
even is before anyone argues about fixing it.

**Build order matters — work from the middle out:**
1. **P** first: name the process, mark its **start and stop points** ("from receipt of order
   to shipment confirmation"), and list 4–7 high-level steps. Scope fights are won or lost
   here — the start/stop points *are* the scope.
2. **O** then **C**: what comes out, and who receives it. For each customer, add their top
   **requirement** — what makes the output good in their eyes. (This extension, sometimes
   called SIPOC-R, is where quality gets defined.)
3. **I** then **S**: what the process needs, and who provides it. For each input, note what
   makes it *usable* — a bad input requirement is the most common upstream cause of downstream
   pain.

**Rules of thumb:**
- 4–7 process steps. If you have 15, you're mapping (that's the next lesson), not SIPOC-ing.
- No decision diamonds, no exceptions, no arrows looping back — SIPOC is deliberately flat.
- Do it with the people who work the process, in 20–30 minutes, on one page.

**Worked example (healthcare flavor):** SIPOC for "outpatient referral to first appointment."
Start: referral received. Stop: patient seen. Steps: receive → triage → insurance
verification → schedule → remind → check in. Customers: patient (requirement: seen within
14 days, told what to bring), referring physician (requirement: loop closed with a report).
The requirement column immediately exposes that nobody currently measures either requirement
— a finding in itself.

**Try:** Build a SIPOC for a process you personally work in, using
[`templates/sipoc.md`](../templates/sipoc.md). You'll bring this to Workshop 1.

---

## 1.2 Process mapping: seeing the real flow (40 min)

A **process map** shows the actual sequence of steps, decisions, handoffs, and rework loops.
Its job is to make the invisible visible — especially the loops and handoffs everyone has
stopped noticing.

**Symbols — only four to start:**
| Symbol | Meaning |
|---|---|
| Oval | Start / end |
| Rectangle | Activity ("verb + noun": *verify insurance*, *torque bolts*) |
| Diamond | Decision — every diamond needs labeled exits (Yes/No) |
| Arrow | Flow — including the embarrassing ones that go backwards |

**The swimlane format** adds one powerful idea: horizontal lanes, one per role/department/
system. Every time the flow crosses a lane boundary, that's a **handoff** — and handoffs are
where work waits, information drops, and accountability blurs. A swimlane map lets you *count*
them.

**Mapping discipline (this is what separates useful maps from wall decoration):**
1. **Map the AS-IS, not the should-be.** The map records what actually happens, including the
   workaround where Dana keeps a private spreadsheet because the system report is wrong.
2. **Map with the people who do the work** — never from a conference room or an SOP.
3. **Walk the process to validate.** Follow one real work item through the real flow. Every
   map changes when it's walked; the changes are the treasure. The gap between
   *work-as-imagined* and *work-as-done* is precisely where improvement lives.
4. **Right altitude:** 8–20 steps for a Yellow Belt map. If a step hides a whole world
   ("process claim"), it may deserve its own map later — don't drown this one.
5. **Annotate the pain:** once flow is drawn, mark ⚡ where errors occur, ⏱ where work waits
   (with rough times), and 🔁 where rework loops back. Count the handoffs.

**Worked example (transactional flavor):** New-vendor setup mapped across four lanes
(requester, procurement, finance, IT). First draft from the SOP: 9 steps, 3 handoffs. After
walking one real vendor through it: 17 steps, 8 handoffs, 2 rework loops (missing tax form;
duplicate-vendor check failure), and a 4-day wait for a signature that turns out to be
delegated anyway. Elapsed 12 days; touch time under 2 hours.

**Try:** In the sim environment, drag the steps of the scrambled pizza-order process into a
swimlane map, then "walk" an order through it to find the two steps the official map missed.

---

## 1.3 Reading a value stream map (25 min)

A **value stream map (VSM)** is a process map with a stopwatch and a materials/information
overlay: each step carries data (cycle time, wait time, %C&A — the percent of work arriving
**complete & accurate**), and the bottom rail is a **timeline ladder** separating value time
from wait time, totaling into **lead time** vs. **process time**.

Yellow Belts need to *read* one, not build one (that's Green Belt work):
- **Find the biggest number on the wait rail.** That single queue usually dwarfs every
  processing improvement anyone is excited about.
- **Find the worst %C&A.** A step receiving 60% complete-and-accurate work spends nearly half
  its life on corrections and chase-downs — upstream quality is downstream capacity.
- **Compare lead time to process time.** The ratio (process-cycle efficiency) is usually
  under 10% — your White Belt "running clock" story, now in engineering notation.

**Try:** Given a completed VSM of the vertical case (11-day bracket order / 31-day referral /
19-day dispute), answer: where is the largest wait? which step has the worst %C&A? what is
the PCE? Which one thing would you investigate first, and why?

---

## 1.4 Unit wrap & workshop prep (10 min)

**Deliverables to bring to Workshop 1:**
1. Your SIPOC (1.1) — any real process you touch weekly.
2. A first-draft swimlane map of the *same* process, 8–20 steps, honest as-is.
3. One work-as-imagined vs. work-as-done gap you found (or suspect).

**Key takeaways**
- SIPOC first: middle-out, one page, start/stop points define scope, requirements define quality.
- Maps record reality — build them with the workers, then walk them.
- Handoffs (lane crossings) and waits (queue rail) are where the treasure is buried.
- Upstream quality (%C&A) is downstream capacity.
