# Unit 4 — Root Cause: Problem Statements, 5 Whys & Fishbone (1.5 h)

**Learning objectives.** By the end of this unit the learner can:
1. Write a problem statement that passes the "no cause, no blame, no solution" rubric.
2. Facilitate-level-participate in a 5 Whys chain: keep it factual, branch it when needed,
   and land on an actionable process cause.
3. Contribute effectively to a fishbone session: generate causes in the right bones,
   convert opinions into checkable statements.
4. Explain why causes must be **verified with evidence** before anything gets fixed.

---

## 4.1 Problem statements: the sentence everything hangs on (25 min)

Improvement efforts inherit the quality of their problem statement. A good one is a
photograph of a gap; a bad one smuggles in the conclusion.

**The rubric** (full version: [`templates/problem-statement-rubric.md`](../templates/problem-statement-rubric.md)) —
a problem statement must contain:
- **What** is wrong, **where**, **since when / how often**, and **how big** (measured or
  honestly estimated), plus **why it matters** (impact on customer/cost/safety);

and must contain **no**:
- **Cause** ("because the scanner is outdated…") — you don't know yet; naming a cause ends
  the search before it starts;
- **Blame** ("…night shift keeps mislabeling…") — blame drives the truth underground;
- **Solution** ("we need a new system for…") — a solution in the problem statement means the
  meeting is over and the investigation never happened. "Lack of X" is a solution wearing a
  trench coat: *"lack of training"* = "the solution is training."

**Before/after examples (one per vertical):**
- ❌ *"Because we're short-staffed, discharge is always a mess and we need a discharge
  coordinator."*
  ✅ *"Since January, 34% of Unit 4 discharges (baseline: 120/mo) occur after 4 pm against a
  noon target, delaying admissions from the ED by a median 3.1 hours."*
- ❌ *"Machining keeps sending us junk brackets and QA needs to inspect 100%."*
  ✅ *"Bracket line B's first-pass yield has averaged 91% over the last 8 weeks (target 98%),
  producing ~140 reworked units/week at ~22 min rework each."*
- ❌ *"AP data entry errors are out of control due to lack of attention to detail."*
  ✅ *"In Q2, 9.8% of manually entered invoices (n=3,120) required correction after approval
  rejection, adding a median 1.8 days to payment and ~11 staff-hours/week."*

Notice what a clean statement does: everyone can agree to it *regardless of what they think
the cause is* — which is exactly what lets the room start investigating together.

**Try:** Six statements to grade against the rubric (three contain a smuggled cause, blame,
or solution — including one "lack of" trap); then write one for a problem in your own area.
This statement can head your mini-project storyboard.

---

## 4.2 5 Whys: drilling, not free-associating (30 min)

**5 Whys** asks "why did that happen?" repeatedly until you reach a cause that is
**actionable at the process level**. Five is a rhythm, not a law — chains land in 3, or 7.

**The technique, with its guardrails:**
1. **Start from the problem statement**, not from an opinion about it.
2. **Each answer must be a fact you could check** — observed, documented, or verifiable —
   not a theory. The chain is only as strong as its weakest "because."
3. **Branch when reality branches.** "Why was the order late?" may honestly have two answers
   (picked late AND carrier missed). Follow both; you have a why-*tree*, and that's fine.
4. **Stop at a cause you can fix with a process change.** Two classic wrong stops:
   - **Stopping at a person** ("because Sam forgot") → keep going: *why was forgetting
     possible/likely?* (no checklist, interrupt-driven workflow, two systems…). A name in
     your chain means you're mid-chain, not done.
   - **Escaping to the cosmos** ("because the economy / because management / because human
     nature") → you've drilled past the process into things you can't act on. Back up one
     level to the last actionable cause.
5. **The countermeasure test:** if fixing your final "why" wouldn't plausibly prevent
   recurrence, the chain is decorative. Walk it backwards with "therefore" — if any link
   reads as a non-sequitur in reverse, it was an assumption, not a cause.

**Worked chain (manufacturing flavor):** Rework spike on bracket line →
why? holes out of position → why? fixture shifted mid-shift → why? clamp doesn't hold
torque → why? clamp checks aren't in the changeover standard → **actionable process cause:**
changeover standard lacks a clamp-torque verification step. (Note where the chain *didn't*
stop: "because the operator didn't notice.")

**Try (sim):** Interactive branching 5 Whys on the vertical case: at each level the learner
picks the next "why" from options (fact vs. theory vs. blame); wrong picks play out their
consequences ("you retrained everyone; the problem returned in 6 weeks") before rewinding.

---

## 4.3 Fishbone: the team's cause map (25 min)

The **fishbone (Ishikawa) diagram** organizes a team's brainstorm of *potential* causes so
that nothing obvious is missed and no single loud theory dominates. Head = the problem
statement (verbatim — no drift). Bones = cause categories:
- Classic **6M** (manufacturing): Man/People, Machine, Method, Material, Measurement,
  Mother-nature/Environment.
- Service variant: People, Process/Procedures, Policies, Place/Environment, Systems/
  Technology, Measurement. (Categories are scaffolding — adapt them; never let the room
  debate taxonomy for 20 minutes.)

**How a Yellow Belt contributes well in the session:**
- Offer causes as **checkable statements** ("labels smear when the printer runs hot"), not
  vibes ("labels are bad"). The facilitator will push everything toward checkability —
  arrive there first.
- **Use the bones to unstick the room:** when ideas dry up, walk a silent bone —
  "we have nothing under Measurement… could the *gauge* be part of this?"
- **Ask 'why' into a bone:** a fishbone entry is often the first link of a mini-5-Whys;
  sub-bones capture the chain.
- **Volunteer for verification.** The session ends by voting/marking the few most-likely
  causes — each of which becomes a **go-check assignment** (pull the data, watch the step,
  test the gauge). Saying "I can check that by Thursday" is the highest-value sentence in
  the room.

**The bridge to evidence (drumbeat of this unit):** a fishbone full of sticky notes is a
map of *suspicions*. Nothing on it is true yet. The team's next move is always verification
— go look, go measure, go test. In DMAIC terms: the fishbone is Analyze's brainstorm;
the check sheet, the run chart, and (at Green Belt) the hypothesis test are Analyze's proof.

**Try (sim):** Sort 18 brainstormed causes onto the right bones for the vertical case; flag
the three that are stated uncheckably and rewrite one of them; pick the two you'd verify
first and say how (watch it / count it / test it).

---

## 4.4 Wrap: the Yellow Belt root-cause sequence (10 min)

> **Clean problem statement** (no cause/blame/solution) → **map the suspects** (fishbone,
> checkable statements) → **drill the likely ones** (5 Whys to an actionable process cause)
> → **verify with evidence** before anyone fixes anything.

Workshop 2 runs this entire sequence live on a simulated failure, in teams, against the
clock — bring your problem statement from 4.1.

**Key takeaways**
- The problem statement is a measured gap, agreeable to all camps; "lack of X" is a solution
  in disguise.
- 5 Whys: facts only, branch honestly, never stop at a name, never escape to the cosmos,
  test with "therefore."
- Fishbone organizes suspicion; evidence convicts. Verification is what separates root-cause
  analysis from group storytelling.
