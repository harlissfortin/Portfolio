# Module 1 — Strategic Define (weeks 1–2 · 8 h self-paced + two 2.5 h live labs)

**Learning objectives.** By the end of this module the learner can:
1. Score a set of candidate projects on a weighted prioritization matrix with stated criteria and capacity limits, and defend which are selected, deferred, routed to Just-Do-It or capital, or rejected.
2. Write a strategic linkage statement that traces the project's primary metric to a named organizational objective through explicit arithmetic, and obtain the sponsor's written confirmation of it.
3. Design, tabulate and interpret a Kano survey (functional/dysfunctional pairs, evaluation table, satisfaction and dissatisfaction coefficients) and translate the result into CTQs with targets and a stated specification basis.
4. State what a conjoint study measures and the two situations in which a Black Belt commissions one rather than running a Kano survey.
5. Write a charter that spans two or more functions, with a decision-rights table and an escalation path that carries time triggers.
6. Launch a cross-functional team of people they do not manage: time contracts through functional heads, working agreements, a kickoff run-of-show, and a first stakeholder strategy canvas.

Rubric items served: D1–D4 and L1 in [`../project/review-rubric.md`](../project/review-rubric.md). Exam section A, objective B1.

---

## 1.1 Portfolios, not projects (week 1 · 60 min)

**Hook.** Your sponsor arrives with three projects and a favorite. At Green Belt you took the one you were given. At Black Belt the question is different: of everything this organization could improve this year with the Black Belt capacity it has, which two or three projects should exist at all, and why is the favorite one of them or not?

**Teach.** A portfolio is the set of projects the organization runs at once, chosen against the same criteria and the same capacity. You build it in four moves.

1. **Generate wide.** Sources: the scorecard's red metrics, cost of poor quality by process, complaint and incident logs, the Yellow Belt rollout's problem list, functional heads' own asks. Ten to twenty candidates is normal.
2. **Triage before scoring.** Three kinds of candidate leave the list immediately, with a note: the **Just-Do-It** (cause already verified, countermeasure known, one function — a Yellow Belt does it this month); the **capital or policy decision** (the answer is a purchase or a rule change, not an investigation — route it to the owner); and the **unmeasurable** (no metric exists and none can be built in the Measure window — return it with the question "what would we count?").
3. **Score what remains** on published, weighted criteria, agreed with the sponsor before scoring and never changed after: strategic linkage 30, annualized impact 25, data and measurement feasibility 15, cross-functional scope 10, implementation risk 10, time to first benefit 10. Score each 1–5 against a written anchor (a 5 on linkage means "moves a metric on the executive scorecard by a stated amount"; a 1 means "no scorecard metric moves").
4. **Fit to capacity and balance.** One Black Belt carries about two projects at once, at 100–150 hours each. If three selected projects all draw on the same constraint resource (one IT analyst, one lab), select two.

The scoring is not the decision; it is the argument the sponsor and the functional heads look at together. Nobody who proposed a project is wrong to have proposed it — they proposed what hurt in their function. The matrix shows which pain the whole organization should spend Black Belt capacity on first.

**Show (MFG).** A contract electronics assembler has two Black Belts and eleven candidates. After triage, eight remain (illustrative scores; weights as above; maximum 500):

| Candidate | Linkage 30 | Impact 25 | Feasibility 15 | Cross-fn 10 | Risk 10 | Time 10 | Total | Decision |
|---|---|---|---|---|---|---|---|---|
| Inbound component defects (purchasing, incoming, assembly) | 5 | 4 | 4 | 5 | 3 | 4 | 430 | Select |
| SMT line changeover time | 4 | 4 | 5 | 2 | 4 | 5 | 405 | Select |
| Finished-goods inventory days | 4 | 5 | 3 | 5 | 2 | 2 | 370 | Defer: needs the same planner as candidate 1 |
| Warranty return diagnosis time | 5 | 3 | 2 | 4 | 3 | 2 | 345 | Defer: no diagnosis timestamps exist yet |
| ERP invoice mismatches | 3 | 2 | 4 | 3 | 4 | 4 | 315 | Route to Green Belt |
| Conformal coat rework | 2 | 3 | 5 | 1 | 4 | 5 | 295 | Route to Green Belt |
| Second reflow oven | 3 | 4 | 3 | 1 | 2 | 1 | 255 | Capital decision, not a project |
| Label print errors | 1 | 1 | 5 | 1 | 5 | 5 | 210 | Just-Do-It (cause known: two label templates) |

The plant manager's favorite was the reflow oven. The matrix does not say the oven is a bad idea; it says buying it is a capital decision that needs a business case, not a DMAIC team.

**Try.** Score the eight-candidate list for your vertical in the case file. Then change one weight by 10 points and see whether the top two change. If they do, write what the sponsor would need to decide to settle the weight.

---

## 1.2 Strategic linkage: the line from your metric to their objective (week 1 · 50 min)

**Hook.** "This project supports our patient-experience goal" is a sentence that has never moved a scorecard. Rubric item D2 asks for a written line from the project's primary metric to a stated organizational objective, with the sponsor's confirmation. That line is arithmetic, not adjectives.

**Teach.** A strategic linkage statement has four parts:
1. **The objective, quoted** from the plan or scorecard the executives actually review, with its target and date.
2. **The project's primary metric**, with its operational definition and baseline. If no measured baseline exists, the statement says it will be measured in week 3 — never estimated from memory.
3. **The mechanism**, as a chain of "therefore" steps, each of which someone could check.
4. **The arithmetic**: if the project hits its target, how much of the objective's gap closes, on the objective's own scale and time basis.

Organizations that run strategy deployment formally (Hoshin Kanri — an awareness topic at this level; Master Black Belts design it) publish these chains. Most do not, so you build the chain and ask the sponsor to sign it. The signature converts a claim into a commitment: if the metric moves, the objective moves.

The linkage test: *if this project fully succeeds, which number on the sponsor's scorecard moves, by how much, by when?* If you cannot answer all three, you have a worthwhile local project, not a Black Belt project. Say so and route it.

**Show (HC).** System objective, quoted from the FY plan: "Left-without-being-seen (LWBS) rate ≤ 2.0% across all emergency departments by fiscal year-end (current 3.4%)." Project primary metric: median boarding time for admitted patients, admission order to departure from the ED, in hours, calendar time, all shifts. Baseline 4.2 h (90 days of bed-management data, validated in Module 2). Target 2.5 h.

The chain: boarding patients occupy ED beds → fewer beds turn over per hour → waiting-room time rises → more patients leave before being seen. The arithmetic: 1,900 admissions per month × 1.7 h saved = 3,230 bed-hours per month, which at 720 hours per bed-month is about 4.5 beds of capacity, or 11% of a 40-bed department. The department's own 18 months of monthly data show LWBS rising about 0.4 percentage points per additional hour of median boarding (illustrative; you would fit it from their data in Module 4). Predicted LWBS after the project: about 2.7%. The statement then says honestly: this project closes roughly half the gap to 2.0%; the rest needs the triage redesign in the portfolio. A sponsor who signs "half" is worth more than one who hears "all" and later learns otherwise.

**Try.** Write the four-part statement for your project on one page. Underline every number and write beside it where it came from. Any number that came from memory becomes a Measure-phase task.

---

## 1.3 Advanced VOC: the Kano model with a worked survey (week 1 · 70 min)

**Hook.** At Green Belt you interviewed customers and built a CTQ tree. The interviews gave you a list. They did not tell you which items customers would punish you for missing and which they would not notice — and in Improve, when you choose between countermeasures, that difference decides what you build.

**Teach.** The **Kano model** (Noriaki Kano, 1984) sorts requirements by how their presence and absence affect satisfaction:
- **Must-be (M):** absence causes dissatisfaction; presence is unnoticed. These set specification limits.
- **One-dimensional (O):** more is better, less is worse. These set targets on a scale.
- **Attractive (A):** presence delights; absence is not held against you. Differentiators, never specifications.
- **Indifferent (I):** neither. Remove from scope.
- **Reverse (R):** presence causes dissatisfaction for this respondent. Usually a segment signal.
- **Questionable (Q):** contradictory answers; check the wording.

**The survey.** Each requirement gets a pair of questions. Functional: "If the portal shows your application status online, how do you feel?" Dysfunctional: "If the portal does not show your application status online, how do you feel?" Five answers each: I like it · I expect it · I am neutral · I can live with it · I dislike it. The pair is classified with the standard evaluation table: like/dislike = O; like paired with expect, neutral or live-with = A; expect, neutral or live-with paired with dislike = M; like/like and dislike/dislike = Q; dislike paired with anything but dislike = R; everything else = I.

**Tally and coefficients.** Count respondents per category for each requirement; the category is the plurality. Then compute the two coefficients (Berger and colleagues, 1993):
- Satisfaction coefficient CS = (A + O) ÷ (A + O + M + I), from 0 to 1: how much satisfaction rises when the requirement is met.
- Dissatisfaction coefficient DS = −(O + M) ÷ (A + O + M + I), from −1 to 0: how much it falls when the requirement is not met.

R and Q are excluded from the denominators and reported separately. Sample size: at least 30 respondents per segment you intend to compare; below that, report categories only. Software: this is tabulation, not inference — Excel pivot table over each column pair; R `table()`; Python `pandas.crosstab`; Minitab Stat > Tables > Cross Tabulation. You code the evaluation table once as a lookup.

**Show (TXN).** A regional bank's commercial-lending team is redesigning its loan-application process. Six requirements, 120 applicants from the last year (illustrative data):

| Requirement | A | O | M | I | R | Q | Category | CS | DS |
|---|---|---|---|---|---|---|---|---|---|
| Online status tracking | 58 | 26 | 8 | 24 | 1 | 3 | A | 0.72 | −0.29 |
| Decision within 5 working days | 10 | 38 | 54 | 12 | 2 | 4 | M | 0.42 | −0.81 |
| Documents requested only once | 22 | 41 | 30 | 20 | 3 | 4 | O | 0.56 | −0.63 |
| Relationship-manager call at submission | 18 | 14 | 6 | 61 | 17 | 4 | I | 0.32 | −0.20 |
| Electronic signature | 6 | 29 | 63 | 17 | 1 | 4 | M | 0.30 | −0.80 |
| Mobile app | 31 | 9 | 3 | 52 | 20 | 5 | I | 0.42 | −0.13 |

Reading it: the decision deadline and e-signature are must-bes with DS near −0.8 — miss them and you lose the customer; exceed them and nobody cheers. "Documents once" is one-dimensional: every re-request costs satisfaction, so it takes a target on a scale. Status tracking is the differentiator (CS 0.72, mild DS); it is a candidate for Improve but gets no specification limit. The relationship-manager call is indifferent overall, but 17 reverse answers are a segment: sole proprietors mostly said A and CFOs of larger firms said R; the mobile app splits the same way. The team dropped both from scope and passed the segment finding to the product owner.

**Translate to CTQs (D4).** Each surviving requirement becomes a CTQ with a metric, a target and a stated basis:

| CTQ | Metric and operational definition | Target | Basis |
|---|---|---|---|
| Decision within 5 working days | Working days from complete application received to decision communicated, per application | ≥ 95% within 5 working days (current 71%) | Must-be: threshold from the survey; 95% set by the sponsor |
| Documents requested once | Applications with ≥ 1 re-request ÷ applications, per month | ≤ 10% (baseline 38%) | One-dimensional: a target on the scale, not a limit |
| E-signature available | Applications completed with e-signature ÷ applications offered it | 100% availability | Must-be: capability requirement |
| Status visible online | Attribute of the future state | Design option for Improve | Attractive: no specification |

**When not to use Kano.** Fewer than 30 respondents per segment (interview instead, and say so). Three business customers who each account for a third of revenue (their words outweigh a survey). Requirements set by regulation (a Kano on legally required items measures nothing you can act on). Features customers cannot picture — Kano assumes they can imagine presence and absence. And never as a substitute for watching the customer use the process.

**Try.** The case file has raw answer pairs for 120 respondents. Build the lookup, tabulate, compute CS and DS, and split by the segment column. One requirement changes category when you split; find it and write the sentence you would tell the sponsor.

---

## 1.4 Conjoint analysis: awareness only (week 1 · 20 min)

**Teach.** A **conjoint study** asks customers to choose between whole offers that differ in several attributes at once (delivery in 2 days at $12 versus 5 days at $7) and estimates from the choices how much each attribute level is worth — a "part-worth" — and the trade-offs between attributes. Kano tells you the category of a requirement; conjoint tells you the exchange rate between requirements.

What a Black Belt needs to know: it requires a designed set of profiles (fractional-factorial thinking, which you meet in Module 5), 150–300 respondents, specialist software or a research partner, and four to eight weeks. You commission one, you do not run one, in two situations: when the project's Improve options trade one one-dimensional requirement against another (speed against price, coverage against cost), or when the sponsor is deciding a service design that will be hard to reverse.

**Show (HC).** An outpatient clinic network choosing between appointment models (same-day slots, evening hours, telehealth, provider continuity) had a research partner run a choice-based conjoint with 240 patients. Provider continuity carried nearly twice the part-worth of evening hours — which reversed the design the clinic managers, reasoning sensibly from complaint volume, had planned. The Black Belt's job was to know the tool existed and to recognize a decision worth its cost.

**Try.** Write three lines: the trade-off in your project a conjoint would settle, what you would do with the answer, and why a Kano survey is or is not enough instead.

---

## 1.5 The charter at scale: decision rights and escalation (week 2 · 60 min)

**Hook.** Your Green Belt charter named the sponsor and the scope. Your Black Belt project crosses four functions, each of which owns decisions your project needs, and none of which reports to you. Rubric item D3 asks for decision rights and an escalation path in writing. Without them the charter is relitigated in week 9, by people acting reasonably on what they think they own.

**Teach.** The Black Belt charter (template: [`../project/charter-and-strategic-linkage.md`](../project/charter-and-strategic-linkage.md)) carries everything the Green Belt charter did, plus:

1. **Cross-functional scope**: the functions in scope, the handoffs between them the project may change, and the ones it may not.
2. **A decision-rights table.** For each class of decision the project will meet, who decides, who is consulted first, who is informed after. Use decision classes, not people's names: "change to an inspection sampling plan," "trial on a production line," "spend up to $5,000," "change to scope." Negotiate the table with the functional heads before the sponsor signs; it is a set of promises they are making.
3. **An escalation path with time triggers.** Escalation is the charter working, not failing. Each trigger names a condition, a clock and a destination: "a decision in the table pending more than 5 working days → sponsor"; "a team member withdrawn for more than two weeks → functional head and sponsor, within 2 working days"; "data access blocked more than 3 working days → sponsor"; "two functions disagree on an operational definition → the Black Belt decides provisionally, sponsor ratifies at the next checkpoint."
4. **Time contracts** for team members (hours per week, for how many weeks), signed by their manager.
5. **The strategic linkage statement** from 1.2, with the sponsor's initials on it.

The Green Belt problem-statement rules still hold and D1 still scores them: cause-free, blame-free, quantified, in the business's own metric.

**Show (MFG).** The inbound-component project from 1.1. Functions in scope: purchasing, incoming inspection, SMT assembly, supplier quality. Out of scope: supplier selection and contract terms. Decision-rights table, abbreviated:

| Decision class | Decides | Consulted first | Informed |
|---|---|---|---|
| Change to incoming sampling plan | Quality manager | Black Belt, assembly supervisor | Purchasing |
| Supplier corrective-action request | Supplier quality engineer | Black Belt, purchasing | Sponsor |
| Production trial on an SMT line (≤ 4 h) | Production manager, with 5 working days' notice | Black Belt, planner | Quality |
| Spend ≤ $5,000 | Sponsor | Black Belt | Finance partner |
| Spend > $5,000 or scope change | Steering group | Sponsor, Black Belt | All functional heads |
| Operational definition of "component defect" | Black Belt, provisionally | All four functions | Sponsor ratifies |

Escalation: the triggers above, plus one written for this project: "if incoming inspection's backlog exceeds two days during a trial, the trial pauses and the sponsor decides within one working day whether to resume." The first time it fired, in week 7, nobody argued about whose call it was.

**Try.** Draft your decision-rights table with at least five decision classes. Give it to a peer with three scenario cards from the case file ("the functional head withdraws your analyst," "the sponsor asks to add a second product line," "two functions define the defect differently"). If your table and escalation path do not answer a card, revise before the clinic.

---

## 1.6 Launching a team you do not manage (week 2 · 55 min)

**Hook.** The members' managers said yes. The members have full-time jobs and know your project is the thing that happens to their Thursday afternoons. Everyone is behaving reasonably. Your job is to make the project the thing they would choose.

**Teach.** Module 8 covers influence and resistance in depth; at launch you need five moves.

1. **Recruit through the manager, with the member.** The time contract is signed by the functional head; the invitation is delivered by you, in person, with the linkage statement — people give time to a purpose they can see on the scorecard.
2. **Write working agreements in the first meeting**, not after the first conflict: decision method (consult, then the Black Belt decides within the table, otherwise escalate), attendance and substitutes, how disagreements about data are settled (go and measure), and a one-line dated decision log — rubric item L1 asks to see it.
3. **Run a kickoff with a run-of-show**, 90 minutes: problem and linkage (15); what each function sees of the problem, spoken by that function (30); scope and decision-rights table read aloud (15); working agreements (20); first two weeks' data tasks with owners (10). The functional heads attend the first 15 minutes and say why they signed.
4. **Complete and date the first stakeholder strategy canvas** ([`../templates/stakeholder-strategy-canvas.md`](../templates/stakeholder-strategy-canvas.md)) before the kickoff. L1 scores the canvas at start and at least one dated revision; the revision is evidence that you looked again, not that you were wrong.
5. **Give people back something in week 2.** A team that measures its own handoff and sees the number is a team that returns.

**Show (HC).** A discharge-before-noon project across nursing, pharmacy, case management, transport and environmental services; the candidate is a quality-department Black Belt with no reports. Time contracts: 2 hours per week for 12 weeks, signed by five managers. At kickoff, pharmacy's account of medication-reconciliation timing surprised nursing, and nursing's account of when the discharge order actually appears surprised case management — thirty minutes no charter could have produced. The first canvas rated transport's supervisor "neutral, low influence." By week 4 the revised canvas read "supportive, high influence": transport controlled the only timestamp the whole process trusted. The dated revision went into the L1 evidence.

**Try.** Write your kickoff run-of-show with minutes and owners. Complete the canvas. List the one thing each team member gets from the project in the first two weeks; if a line is blank, the launch is not ready.

---

## Live lab 1 — Portfolio prioritization lab (week 1 · 150 min · run of show)

**Setup.** Teams of four, one vertical each. Each team receives a twelve-candidate list (case file) with sponsor notes, a capacity statement (two Black Belts, four Green Belts, one IT analyst at 20%) and five stated objectives with targets. Planted in every list: a senior leader's favorite with weak linkage; a Just-Do-It dressed as a project; a capital decision; two candidates that need the same IT analyst; one with no measurable metric; one with the largest dollar figure and a 14-month time to first benefit.

- **0:00–0:15 — Frame and the trap.** Poll: "Rank the top three by gut." Save the poll. Say plainly that the session tests whether the room can let the criteria decide against a confident senior voice.
- **0:15–0:40 — Triage.** Teams remove the Just-Do-It, the capital decision and the unmeasurable, with a one-line note each. Facilitator move: a team scoring all twelve has skipped triage; ask "what would we count?" about the unmeasurable one and let them discover it.
- **0:40–1:20 — Criteria and scoring.** Teams set weights against the objectives, write score anchors, and score. Facilitator floats with one job: every score must point to a fact in the sponsor notes. "Impact 5 — where does the number come from?"
- **1:20–1:50 — Fit and balance, then the pitch.** Teams fit to capacity, find the IT-analyst collision, and prepare a five-minute portfolio pitch: selected, deferred, routed, rejected, each with a reason.
- **1:50–2:15 — The sponsor role-play.** Facilitator plays the sponsor and pushes for the favorite. Failure modes: a team that caves adds the favorite "as a fourth project" and blows capacity; a team that dismisses it loses the sponsor. The move that works: "It scores fourth on the criteria you set; here is what would have to be true for it to score first."
- **2:15–2:30 — Debrief.** Re-run the opening poll. Name the patterns: triage before scoring; weights before scores; capacity is a criterion; the favorite is data about what the sponsor fears. **Protect the debrief:** if scoring overruns, cut the pitch to three minutes; never cut the role-play or the debrief.

## Live lab 2 — Charter-at-scale clinic (week 2 · 150 min · run of show)

**Setup.** Every candidate brings a draft charter, linkage statement, decision-rights table and canvas. Trios; each charter gets 25 minutes: 5 to present, 10 of peer questions keyed to D1–D4, 10 to revise. The facilitator carries the scenario cards.

- **0:00–0:10 — Frame.** The clinic's test is one sentence: can a stranger with this charter answer the scenario card without calling you?
- **0:10–1:25 — Rotation one, three charters.** Peers score D1 (cause-free, quantified), D2 (arithmetic present, sponsor initials), D3 (two or more functions, decision table, triggers with clocks), D4 (method stated, CTQs with basis). Facilitator drops one card per charter. Failure modes: tables written with names instead of decision classes (the person changes roles in month four); escalation with no clock ("escalate if needed"); linkage with adjectives where arithmetic should be. Do not fix them; ask what the card would do to the project.
- **1:25–1:35 — Break.**
- **1:35–2:20 — Rotation two.** Revised charters, new cards. A charter that answered its first card but not its second is normal; note what the second card exposed.
- **2:20–2:30 — Close.** Each candidate states the one change they are taking to the sponsor before the charter is signed at the end of week 2. **Protect the debrief:** if rotation one overruns, drop one charter from rotation two, never the close.

---

## Project work this module (keyed to the rubric)

| Rubric item | Deliverable by end of week 2 |
|---|---|
| D1 Problem and opportunity statement | Cause-free, quantified statement in the business's own metric; baseline flagged as measured or to-be-measured |
| D2 Strategic linkage | Four-part statement with arithmetic; sponsor's initials on the charter |
| D3 Scope and cross-functional charter | Charter signed; functions in and out of scope; decision-rights table (≥ 5 classes); escalation path with time triggers; time contracts signed by managers |
| D4 Advanced VOC | Method stated and run or scheduled (interviews, Kano survey, complaint analysis); CTQ table with targets and specification basis |
| L1 Team and stakeholder navigation | Stakeholder strategy canvas, dated; kickoff held with run-of-show; decision log started |

The first Master Black Belt coaching session falls in week 2; bring all five.

## Coaching prompts

1. "If your project fully succeeds, which number on your sponsor's scorecard moves, by how much, and by when? Show me the arithmetic."
2. "Point to a decision in your charter that you are not allowed to make. Who is, and what happens on day six if they have not made it?"
3. "What did the Kano survey (or your VOC method) tell you that the interviews did not — and which requirement got no specification limit, on purpose?"

## Vertical case dataset (Module 1)

The Black Belt practicum cases are being built alongside this module; until they exist, the Module 1 case files are specified here so facilitators generate them consistently.

- **`m1-portfolio-<mfg|hc|txn>.csv`** — 12 rows, one per candidate. Columns: `candidate_id`, `title`, `proposing_function`, `sponsor_note` (the facts the scores must cite), `estimated_annual_impact_usd` with `impact_basis` (or the clinical/service equivalent), `metric_exists` (yes/no/partial), `functions_in_scope`, `shared_resource`, `months_to_first_benefit`, `linked_objective` (one of five listed objectives, or blank). Planted: one favorite with a blank `linked_objective` and a large impact figure; one Just-Do-It (the note names the verified cause); one capital item; two rows sharing `shared_resource = IT analyst`; one `metric_exists = no`; one `months_to_first_benefit = 14`.
- **`m1-kano-<vertical>.csv`** — 120 respondents × 6 requirements. Columns: `respondent_id`, `segment` (two levels), then `rq<n>_functional` and `rq<n>_dysfunctional` coded 1–5 (like, expect, neutral, live-with, dislike). Planted: one requirement Indifferent overall, Attractive in one segment and Reverse in the other; 3–5 Questionable pairs per requirement; one requirement whose plurality is Must-be by two responses, so the coefficients, not the plurality, carry the decision. The TXN file reproduces the table in 1.3; MFG uses a spare-parts distributor's customers; HC uses an outpatient clinic's patients.
- **`m1-scenario-cards.md`** — nine cards, three per vertical, for the 1.5 Try and the clinic.

## Takeaways

- A Black Belt chooses among projects on published criteria and real capacity; triage first, weights before scores, and the favorite is data about the sponsor.
- Strategic linkage is arithmetic on the sponsor's scale, signed; a project that closes half the gap and says so beats one that promises all of it.
- Kano sorts requirements into limits, targets, differentiators and things to drop; conjoint is commissioned when the trade-off itself is the decision.
- A charter at scale carries decision rights by class and escalation with a clock; a team you do not manage is launched through their managers and kept through what it gives back.

## Cumulative check

None in Module 1 — this is the first module. Module 2 carries the first cumulative check, re-testing this module.

---

v1.0 · 2026-09-20
