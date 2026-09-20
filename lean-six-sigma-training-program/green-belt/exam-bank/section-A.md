# Green Belt Exam Bank — Section A: Define

Part of the Green Belt bank: blueprint, minimally competent candidate, tag format and pools are in [`../exam-bank.md`](../exam-bank.md).

Correct option ✅; tag line followed by the rationale. Exhibit (X) items show the charter, CTQ tree, stakeholder map, SIPOC or selection matrix the candidate must critique.

---

## Section A — Define (42 CERT)

**A1.** Your sponsor in a shared-services finance team offers three candidate projects: (1) replace the invoicing system — budget approved; (2) reduce invoice-dispute resolution time — median 18 working days, timestamps in the ERP, one team owns the queue; (3) "raise customer satisfaction across the company." The cohort calendar is eight weeks, with closure inside six months. The best selection is:
A. Candidate 1 — the budget is approved, so the project will finish · B. Candidate 3 — the widest scope carries the largest impact · C. Candidate 2 — one owner, one bounded queue, a metric with data already in the system ✅ · D. Candidate 3, narrowed to one department once Measure shows where the pain is
`[A · G1 · Apply · TXN · S · CERT]` — Candidate 1 is an implementation whose countermeasure is already chosen and candidate 3 has no boundaries or metric a Green Belt can own; narrowing it "after Measure" is chartering without a scope, which is why D is the strongest wrong answer.

**A2.** A supervisor reports that a shared printer is loaded with the wrong paper stock about once a week because the two stocks arrive in identical boxes; a labeled shelf would fix it in an afternoon. She asks you to "charter this." Your response:
A. Charter it — a recurring problem is a DMAIC problem by definition · B. Run it as a Just-Do-It — the cause is visible, the fix is cheap and inside the owner's authority ✅ · C. Charter it and skip Measure, since the cause is known · D. Hold it until a Black Belt can review the charter
`[A · G1 · Understand · NEU · S · CERT]` — DMAIC is for problems whose cause is unknown or contested; C keeps the ceremony while removing the evidence, which is the worst of both.

**A3.** A plant's CI steering group scored three Green Belt candidates (1 = poor, 5 = strong; weights in parentheses):

| Candidate | Impact (×3) | Data available (×2) | Fits 6-month closure (×2) | Sponsor engaged (×1) | Weighted total |
|---|---|---|---|---|---|
| P1 Reduce changeover time, Line 4 | 5 | 1 — no changeover timestamps exist | 5 | 5 | 32 |
| P2 Reduce label defects, packaging | 3 | 5 | 4 | 4 | 31 |
| P3 Reduce raw-material stockouts | 5 | 2 | 2 | 5 | 28 |

The team is about to charter P1 on the strength of its total. The soundest reading of the matrix is:
A. P1 stands — the weights were agreed before scoring, so the result is legitimate · B. Re-weight until P2 wins, since the team's preference is itself information · C. Merge P1 and P2 so one project covers both totals · D. Treat data availability as a gate, not a weight — P1 needs a measurement system before it can be chartered on this calendar ✅
`[A · G1 · Analyze · MFG · X · CERT]` — A "5" on impact bought off a "1" on data, but a phase-locked calendar needs a baseline by week 4; option A is wrong because agreeing the weights in advance does not make a knockout criterion tradeable.

**A4.** A charge nurse charters "reduce emergency-department length of stay," which runs from triage through physician assessment, lab, imaging and inpatient bed assignment across five departments. Your coaching at the week-1 charter clinic:
A. Narrow to one bounded segment the learner touches, and flag the full stay as a cross-functional project above Green Belt scope ✅ · B. Keep the scope — the sponsor's pain is the whole stay and the charter should say so · C. Keep the scope but choose the department with the most data as the "pilot" · D. Convert it to a Just-Do-It on inpatient bed assignment
`[A · G1 · Analyze · HC · S · CERT]` — The minimally competent Green Belt leads a bounded project on a process they touch; B is the over-scoping that stalls at Measure, and C picks a slice by convenience rather than by where the customer's delay lives.

**A5.** In week 5 the plant manager asks you to add Line 2 to your chartered Line 4 changeover-time project "since you're already there." Line 2 runs a different product family and has no timestamps. Your best move:
A. Add Line 2 — more scope means more impact at Tollgate 4 · B. Keep the chartered scope, log Line 2 as a follow-on, and re-scope only if the sponsor decides to and re-signs ✅ · C. Add Line 2 without changing the charter and stratify the analysis by line · D. Decline on the grounds that DMAIC charters cannot change after Tollgate 1
`[A · G1 · Apply · MFG · S · CERT]` — Scope is the sponsor's call and a changed scope is a re-signed charter; D confuses "no silent creep" with "no change," which is not a rule anywhere in the method.

**A6.** A clinic director sponsors a project "to implement the new online check-in kiosk so front-desk waits drop." The kiosks are already purchased. You are drafting the charter. The best framing:
A. Write the problem as "no kiosk" and the goal as "kiosk live by week 8" · B. Decline the project, since the countermeasure has already been chosen · C. Charter the rollout as an Improve-only project and skip Define through Analyze · D. Write a cause-free problem statement on front-desk wait and list the kiosk as a candidate countermeasure to test against the verified cause ✅
`[A · G1 · Analyze · HC · S · CERT]` — The director is responding rationally to an asset she already owns, and the charter can honor that without baking the countermeasure into the problem; B walks away from an engaged sponsor when reframing would keep both the project and its honesty.

**A7.** You are a supply-chain analyst at a distribution center. The largest number in your monthly report is scrap on an extrusion line at a sister plant 400 km away, which you have never visited. For your Green Belt project you should:
A. Charter the extrusion scrap — it is the largest number in the report · B. Charter the extrusion scrap and run Measure and Control by video call · C. Charter a process you touch at your own center and hand the extrusion problem to that plant's sponsor as a candidate ✅ · D. Charter both so at least one closes inside six months
`[A · G1 · Apply · MFG · S · CERT]` — Walking the process, running an MSA and handing over a control plan all need presence and ownership; B is wrong because remote coordination fails exactly at those steps, not at the charter.

**A8.** A charter for Tollgate 1 has a problem statement, a goal, in/out scope, team and roles, and a timeline, all sponsor-signed. Against rubric item D2 it still lacks:
A. The primary metric named with its operational definition ✅ · B. A root-cause hypothesis the team will test · C. The countermeasure options under consideration · D. A draft control plan for the process owner
`[A · G1 · Understand · NEU · K · CERT]` — D2 requires the metric and its operational definition so that "how big" and "did it improve" use the same number; B belongs to Analyze, and a charter that contains it has pre-judged the investigation.

**A9.** A draft charter for a vendor-setup project:

| Charter element | Entry |
|---|---|
| Problem statement | "Since March, 22% of new-vendor setups (n = 410) are returned for missing tax forms because requesters don't read the instructions, delaying first payment a median 9 working days." |
| Goal | "Reduce setups returned for missing tax forms from 22% to 8% by 30 November." |
| Primary metric | "% of setups returned at least once — a setup counts as returned when the AP system shows status 'Returned to requester' at any time before approval." |
| Sponsor | Accounts Payable manager (signed) |

The one edit this charter needs before Tollgate 1:
A. Add the countermeasure — rewrite the instructions · B. Remove "because requesters don't read the instructions" — an unverified cause aimed at people ✅ · C. Change the goal from 8% to 0% · D. Replace the operational definition with the simpler "late setups"
`[A · G1 · Analyze · TXN · X · CERT]` — Everything else meets D1 and D2; the cause clause is a statement the requesters cannot sign and sends the team straight to Improve, and A compounds it by adding the countermeasure that clause implies.

**A10.** A draft charter for an inpatient discharge project:

| Charter element | Entry |
|---|---|
| Problem statement | "Since January, the median time from discharge order to the patient leaving Unit 4 is 4.6 hours (n = 612), against a 2-hour target, delaying ED admissions." |
| Goal | "Raise the percentage of Unit 4 discharges completed before noon from 31% to 60% by 31 October." |
| Primary metric | "Discharge lag: minutes from discharge-order timestamp to bed-status 'vacant' timestamp, per discharge." |
| Scope | Unit 4 medical patients; excludes transfers to other facilities |

The defect is:
A. The scope exclusion of transfers is illegitimate · B. The problem statement contains a cause · C. The goal is written on a different measure than the primary metric, so the project's own baseline cannot show the goal met ✅ · D. The 2-hour target should be treated as a control limit
`[A · G1 · Analyze · HC · X · CERT]` — Problem, goal and metric must share one operational definition; D confuses a specification, which comes from the customer, with a control limit, which comes from the process, and A objects to a stated, legitimate exclusion.

**A11.** A draft charter for a powder-coat first-pass-yield project:

| Charter element | Entry |
|---|---|
| Problem statement | "Since Q2, first-pass yield on the Line 3 powder-coat booth averages 91.4% (weekly, 14 weeks) against a 97% standard, costing about 140 rework hours per month." |
| Goal | "Raise first-pass yield to 96% by end of week 8 of the cohort." |
| Team | Green Belt (quality engineer); two booth operators; maintenance technician; Finance analyst (part-time) |
| Sponsor | Plant quality manager (signed) |
| Timeline | Define wk 1 · Measure wk 2–4 · Analyze wk 5–6 · Improve wk 7 · Control wk 8; project closes week 8 |

The most important gap:
A. The Finance analyst does not belong on a Define-phase team · B. The goal should be the 97% standard, not 96% · C. Two operators on the team is one too many for a quality project · D. No process owner is named, and the timeline closes the project in week 8 with no time for live monitoring before handover ✅
`[A · G1 · Analyze · MFG · X · CERT]` — Rubric C1 hands the control plan to a named owner with monitoring live for 30 days, so the booth's production supervisor must be on the team and the timeline is the cohort's, not the project's; B argues a number when the structural gap is ownership.

**A12.** Four candidate problem statements for a cardiology referral project:

| Row | Candidate problem statement |
|---|---|
| 1 | "Cardiology scheduling is understaffed, so referrals wait too long and patients complain." |
| 2 | "Referral waits are unacceptable and must come down by half this year." |
| 3 | "Since April, 38% of primary-care referrals to cardiology (n = 1,240) are not scheduled within 14 calendar days of receipt; the median wait for those is 31 calendar days, and 9% are re-sent by the referring practice." |
| 4 | "We need a central referral coordinator so that cardiology referrals stop waiting." |

Which row passes rubric item D1?
A. Row 1 · B. Row 2 · C. Row 3 ✅ · D. Row 4
`[A · G1 · Apply · HC · X · CERT]` — Row 3 has what, where, since when, how big and why it matters with no cause or solution; row 2 is the strongest distractor because it sounds quantified but carries a goal, not a baseline.

**A13.** Your sponsor, a packaging manager, asks you to add "due to temp-agency turnover on second shift" to the problem statement on label errors. Your best response:
A. Keep the statement cause-free and record turnover as a candidate cause to check in Analyze ✅ · B. Add it — the sponsor signs the charter and owns its wording · C. Add it as a footnote so it is on record without being in the statement · D. Replace it with the more neutral "due to insufficient onboarding"
`[A · G1 · Apply · MFG · S · CERT]` — A cause in the statement commits the team before evidence and points at a group of people; B confuses the sponsor's authority to sign with authorship of causes, which belongs to the data.

**A14.** Writing the charter's "how big," your sponsor says, "Everyone knows about 15% of outbound pallets get rebuilt at the dock — put 15% and move on; we'll measure properly in week 3." Your best response:
A. Write 15% as the baseline; the sponsor's figure is the authoritative one · B. Write "baseline to be measured; sponsor's estimate ≈ 15%, unverified," to be replaced by the measured baseline at Tollgate 2 ✅ · C. Leave "how big" blank until week 3 to avoid recording a guess · D. Write 15% and hold it fixed, because a signed charter is not revised
`[A · G1 · Analyze · MFG · S · CERT]` — A baseline reconstructed from memory never becomes the "before" in a before/after comparison, and the charter is a living document updated at Tollgate 2; A turns an estimate into evidence by writing it in the baseline's place.

**A15.** Your sponsor wants the charter goal to read "reduce loan-application rework by 50%." The baseline is not yet measured and the operational definition of "rework" is still being written. The best way to write the goal now:
A. "Reduce rework by 50%" — a percentage goal needs no baseline · B. Leave the goal empty until Tollgate 2 · C. "Eliminate rework" · D. "Reduce the rework rate (operational definition attached) from the measured baseline to a target set at Tollgate 2; sponsor's provisional intent: −50%" ✅
`[A · G1 · Apply · TXN · S · CERT]` — A goal on an unmeasured baseline can be neither met nor missed; B is wrong because it leaves the sponsor's intent unrecorded when the charter can carry it honestly as provisional.

**A16.** In a Green Belt charter, the person who removes barriers, approves scope changes and signs tollgates, but does not run the process day to day, is the:
A. Process owner · B. Team lead · C. Sponsor ✅ · D. Master Black Belt
`[A · G1 · Remember · NEU · K · CERT]` — The process owner runs the process and receives the control plan; the Master Black Belt coaches and calibrates reviewers but does not sponsor.

**A17.** Which change to a chartered project requires the sponsor to re-sign the charter rather than a note in the project log?
A. Moving the stop point from "invoice approved" to "payment received" ✅ · B. Adding a second operator to the team roster · C. Correcting the spelling of a team member's name · D. Replacing the sponsor's estimated baseline with the measured one at Tollgate 2
`[A · G1 · Understand · NEU · K · CERT]` — Boundaries are the sponsor's decision; D is the update the calendar plans for and is recorded, not re-signed.

**A18.** The "why it matters" line of a problem statement ("delaying first payment a median 9 working days for about 90 vendors a month") differs from a charter's business case in that the business case:
A. Names the root cause the team expects to find · B. Removes the need for a measured baseline · C. Is written by Finance and attached at closure · D. Ties the problem to an organizational priority and classifies the expected benefit for Finance to validate later ✅
`[A · G1 · Understand · NEU · K · CERT]` — The impact line is a fact about the process and the business case is the sponsor's reason to fund it, classified as hard savings, cost avoidance or service impact; C is wrong because Finance validates the claim at closure but does not write the case.

**A19.** Rubric item D4 gives full marks for a stakeholder map only when it includes:
A. Every employee in the department · B. At least one named resistance risk with a planned response ✅ · C. A ranking of stakeholders by seniority · D. Sign-off from each stakeholder listed
`[A · G1 · Remember · NEU · K · CERT]` — A map with no resistance risk is a roster; D is neither practical nor the map's purpose.

**A20.** A Green Belt on Unit 6 maps stakeholders for a project to cut the delay from medication order to first dose:

| Stakeholder | Power over the process | Interest in the outcome | Planned engagement |
|---|---|---|---|
| Pharmacy director | High | High | Monthly email summary |
| Charge nurses (3) | Medium | High | Team members |
| IT analyst (order system) | High | Low | Weekly check-in; approves any order-set change |
| Hospitalists | Medium | Medium | Attend tollgates |

The mismatch to fix first:
A. The pharmacy director — high power, high interest — is only informed monthly; she needs a role in decisions ✅ · B. The IT analyst is over-engaged and should move to a monthly email · C. The charge nurses should be informed rather than seated on the team · D. The hospitalists are low relevance and can be removed from the map
`[A · G1 · Analyze · HC · X · CERT]` — High power with high interest is "manage closely," ideally as co-sponsor; B loosens the one gatekeeper who can block every change to the order set.

**A21.** A stakeholder map for a project on data-entry errors in insurance applications:

| Stakeholder | Position on the project | Resistance risk named | Planned response |
|---|---|---|---|
| Underwriting team lead | Supportive | — | — |
| Data-entry team (6) | Unknown | Fear that error counts will feed performance reviews | Escalate to sponsor |
| Compliance officer | Neutral | Any checklist change needs her approval | Escalate to sponsor |
| Branch managers (4) | Skeptical | Last project added work with no benefit to them | Escalate to sponsor |

The best critique:
A. Resistance risks should not be written down where the stakeholders might read them · B. The map is complete — every risk has a response · C. The risks are named but the responses are not planned; each needs a specific action the team owns ✅ · D. The branch managers should come off the map because they are skeptical
`[A · G1 · Analyze · TXN · X · CERT]` — "Escalate" hands every risk to the person with the least time; for the data-entry team the planned response is an agreement in writing that counts are process measures, never individual ones, shown to them first — D removes stakeholders whose skepticism is a rational reading of their history.

**A22.** During stakeholder analysis a teammate proposes listing a claims scheduler as a "resister" because she keeps her own spreadsheet outside the system and "won't use the official tool." Your best move:
A. Agree, and note her for the sponsor to handle · B. Leave her out of the interviews so the map stays neutral · C. Ask IT to block the spreadsheet so the official tool gets used · D. Reframe: the spreadsheet is a workaround that shows what the official tool fails to do; she is your most informed stakeholder ✅
`[A · G1 · Apply · TXN · S · CERT]` — A workaround is a design signal, not a character trait; C removes the evidence and the goodwill in one move.

**A23.** You have built a power/interest grid for a medication-delay project. A teammate suggests posting it on the project board in the unit break room so everyone can see the plan. The right call:
A. Post it — transparency about the plan builds trust · B. Keep it as a working document for team and sponsor; share the engagement plan, not the classifications ✅ · C. Post it with names removed but roles kept · D. Delete it now that the charter is signed
`[A · G1 · Analyze · HC · S · CERT]` — A wall chart that grades named colleagues by "power" and "interest" damages the relationships it exists to manage; C is the strongest distractor because people identify themselves from roles on a unit of forty staff.

**A24.** The charter scope for your Line 4 changeover project reads "all changeovers on Line 4, both shifts." Your stakeholder map lists the plant manager (sponsor), the day-shift supervisor, two day-shift setup technicians and Planning; second shift does not appear. What you must fix now:
A. Add the second-shift supervisor and a second-shift technician to the map and the team ✅ · B. Nothing — day shift is representative of both shifts · C. Restrict the scope to day shift so the map is complete · D. Ask the plant manager to instruct second shift to follow whatever day shift builds
`[A · G1 · Apply · MFG · S · CERT]` — A standard built by one shift is resisted on the other for a good reason: nobody asked them; C contradicts the chartered scope, and D uses authority where involvement is needed.

**A25.** The purpose of stakeholder analysis in Define is best described as:
A. Ranking who is accountable if the project fails · B. Recording the reporting lines around the process · C. Deciding, for each person or group who can affect or be affected by the change, how and when the team engages them ✅ · D. Assigning the roles that the charter's team section already covers
`[A · G1 · Understand · NEU · K · CERT]` — The analysis is an engagement plan made before the first request is put to anyone; B is an org chart, which lists position but not influence or interest.

**A26.** In a CTQ tree, the level between the customer's stated need ("get my refund quickly") and the measurable characteristic ("refund posted within 5 working days of approval, 95% of refunds") is:
A. The specification limit · B. The driver — what about the need matters to the customer, such as speed of posting or notice of status ✅ · C. The control limit · D. The countermeasure
`[A · G1 · Remember · NEU · K · CERT]` — The driver decomposes the need before the CTQ makes it measurable; A names the target at the bottom of the tree, not the layer above it.

**A27.** A CTQ tree for an outpatient clinic:

| Need (VOC) | Driver | CTQ | Target / basis |
|---|---|---|---|
| "I want to be seen without waiting all morning" | Time to be roomed | Minutes from check-in to roomed | ≤ 20 min for 90% of visits; clinic access standard |
| "I want to be seen without waiting all morning" | Being kept informed | Friendly, attentive front-desk staff | — |
| "I want to be seen without waiting all morning" | Predictability | Appointment starts within 15 min of scheduled time | 85% of visits; patient-survey threshold |

The defect in row 2:
A. The driver is wrong — patients who are waiting are not interested in information · B. Row 2 duplicates row 1 and should be deleted · C. The target should be 100% of visits · D. "Friendly, attentive staff" is a wish, not a measurable characteristic; the driver should resolve to something countable ✅
`[A · G1 · Analyze · HC · X · CERT]` — A CTQ needs a measurable characteristic, a target and a basis — for example "patient told the expected wait at check-in, ≥ 95% of visits"; B throws away a legitimate driver instead of finishing it.

**A28.** A CTQ tree for a mortgage-application project:

| Need (VOC) | Driver | CTQ | Target / basis |
|---|---|---|---|
| "Tell me quickly whether I'm approved" | Decision speed | Working days from complete application to decision | ≤ 10 working days; "what the team can hit today" |
| "Tell me quickly whether I'm approved" | Clarity of status | Applicant receives a status update at each stage change | 100%; regulatory disclosure rule |

Row 1's target line fails because:
A. A target's basis must come from the customer, a contract, a regulation or a benchmark — not from what the process does today ✅ · B. Working days are the wrong unit for a customer-facing CTQ · C. "Decision speed" is too vague to be a driver · D. Ten working days is too generous a target
`[A · G1 · Analyze · TXN · X · CERT]` — Specification limits come from the customer and control limits from the process, and "what we can hit today" is the latter dressed as the former; D argues a different number with no basis, which is the same error.

**A29.** A CTQ tree where the stamping cell's customer is the assembly plant next door:

| Need (VOC — assembly plant) | Driver | CTQ | Target / basis |
|---|---|---|---|
| "Send us brackets we can weld without re-jigging" | Dimensional fit | Hole-to-edge distance 12.0 ± 0.3 mm, every bracket | Assembly weld-fixture drawing |
| "Send us brackets we can weld without re-jigging" | Consistency within a lot | Press tonnage recorded every shift | 100% of shifts; stamping SOP |

Row 2's CTQ:
A. Is fine — press tonnage is what drives dimensional fit · B. Measures the stamping cell's own input, not a characteristic of the bracket the assembly plant receives ✅ · C. Needs a tighter target than 100% of shifts · D. Should be deleted together with its driver
`[A · G1 · Analyze · MFG · X · CERT]` — A CTQ describes the output as the customer experiences it, such as flatness ≤ 0.5 mm on 100% of a lot from the same drawing, and tonnage belongs in Analyze as a candidate cause; A is plausible engineering but short-circuits the investigation.

**A30.** Your team wants to learn why 30% of customers call a second time within 7 days about the same order. A teammate drafts a 20-question satisfaction survey for all 4,000 customers who called last month. The stronger VOC plan:
A. Send the survey — a sample of 4,000 will give precise percentages · B. Skip VOC — the call logs already show who called twice · C. Listen to a sample of repeat calls and interview 8–12 customers first, then survey to quantify the drivers you heard ✅ · D. Ask the agents what the customers want — they hear it all day
`[A · G1 · Apply · TXN · S · CERT]` — Interviews and observation discover drivers; surveys measure drivers you already know, so A produces precise answers to the wrong questions.

**A31.** Your project reduces wrong-part picks from the kitting area to final assembly, another department in the same plant. A teammate says VOC is unnecessary because "there's no customer here." The correct position:
A. Assembly is the customer of kitting; interview its line leads and operators and translate what they need into CTQs with targets from the build schedule ✅ · B. Skip VOC — internal processes have specifications, not customers · C. Use the external customer's warranty data as the voice of the customer · D. Ask Finance to state the requirements, since it owns the cost of wrong picks
`[A · G1 · Apply · MFG · S · CERT]` — Rubric D3 counts internal customers, and "right parts, right quantity, before takt start" is their requirement; C measures an outcome three steps downstream of the kit.

**A32.** A patient-portal comment about outpatient imaging and four proposed translations:

| VOC | Proposed CTQ |
|---|---|
| "Nobody told me I couldn't eat before the scan — I had to come back." | A: "Staff should be more careful with instructions" |
| same | B: "Prep instructions delivered ≥ 48 hours before the appointment and confirmed by patient reply (yes/no); target ≥ 98% of contrast studies; basis: imaging protocol" |
| same | C: "Reduce patient complaints by 50%" |
| same | D: "Patients should read their instructions" |

Which proposal is a correct translation?
A. Proposal A · B. Proposal B ✅ · C. Proposal C · D. Proposal D
`[A · G1 · Apply · HC · X · CERT]` — B names a measurable characteristic of the service with a target and a basis; C is the strongest distractor because it is quantified, but it is a goal, not a characteristic the customer experiences.

**A33.** A CTQ tree is the wrong first tool when:
A. The customer is internal to the organization · B. The process has more than one customer with different needs · C. The customer states the need in words rather than numbers · D. The requirement is already fixed by a regulation or contract with a numeric limit ✅
`[A · G1 · Understand · NEU · K · CERT]` — When the number is given, the work is the operational definition and confirming it is measured, not re-deriving it from interviews; A–C are exactly the cases the tree exists for.

**A34.** For an account-opening project the external customer's VOC is "open it today"; the compliance officer's requirement is "identity verified against two sources before activation." The team wants to drop the compliance line from the CTQ tree because "compliance isn't the customer." The right handling:
A. Drop it — only the external customer's voice defines quality · B. Keep only the compliance CTQ, since it is mandatory · C. Keep both, each with its own basis, and treat the tension as a constraint on Improve ✅ · D. Combine the two into one CTQ that balances speed and verification
`[A · G1 · Analyze · TXN · S · CERT]` — A countermeasure that wins speed by skipping verification fails the project, so both CTQs stay with their bases (interview; regulation); D invents a characteristic nobody asked for.

**A35.** A Green Belt SIPOC is at the right altitude when its Process column has:
A. About five to eight verb-noun steps and no decision diamonds ✅ · B. Every step that will appear on the swimlane map · C. One step per department that touches the work · D. As many steps as the team can name in the session
`[A · G1 · Remember · NEU · K · CERT]` — Rubric D4 sets 5–8 steps; C ties altitude to the org chart, which is how handoffs get hidden inside single steps.

**A36.** A draft SIPOC for kit picking:

| Suppliers | Inputs | Process (as drafted) | Outputs | Customers |
|---|---|---|---|---|
| Planning; Warehouse; Engineering | Pick list; bin locations; BOM revision | 1 Print pick list · 2 Check BOM revision · 3 If revision mismatch, call Engineering · 4 Walk to aisle · 5 Scan bin · 6 If bin empty, go to 4 with alternate location · 7 Count parts · 8 If short, raise shortage ticket and go to 4 · 9 Place in tote · 10 Repeat 4–9 per line · 11 Label tote · 12 Stage tote · 13 If assembly not ready, hold in staging · 14 Deliver tote | Kitted tote; shortage tickets | Final assembly cell; Planning |

The best critique:
A. The Suppliers column is too short for a process this size · B. The Customers column should list the external customer only · C. The Process column is a process map — collapse it to 5–8 steps and save the branches for the swimlane map in Measure ✅ · D. Each step needs a cycle time before the SIPOC is complete
`[A · G1 · Analyze · MFG · X · CERT]` — A SIPOC fixes scope and requirements and is deliberately flat; D adds value-stream data to the wrong tool.

**A37.** Charter and draft SIPOC for a cardiology referral project:

| Element | Charter | SIPOC as drafted |
|---|---|---|
| Start point | Referral received in cardiology scheduling | Primary-care physician decides to refer |
| Stop point | First cardiology appointment attended | Consult note sent back to primary care |
| Customers | Patient; referring practice | Patient; referring practice |

The defect:
A. The SIPOC has too few steps for a cross-department process · B. The SIPOC's start and stop are wider than the charter's on both ends — align it, or take the wider scope back to the sponsor ✅ · C. The Customers column should not list the referring practice · D. Nothing — a SIPOC is meant to be wider than the charter
`[A · G1 · Analyze · HC · X · CERT]` — Charter and SIPOC must agree on boundaries or the team measures a process the sponsor did not charter; C is wrong because the referring practice is a legitimate customer whose requirement is a closed loop.

**A38.** Requirements written for the input "completed expense claim from employee" on a SIPOC:

| Row | Requirement as written |
|---|---|
| 1 | "Claim is good" |
| 2 | "Employee tries their best" |
| 3 | "Claim submitted promptly" |
| 4 | "Receipt attached for every line over $25; cost center coded; submitted within 30 calendar days of the expense date" |

Which row is a usable requirement — one that lets the receiving step say yes or no without judgment?
A. Row 1 · B. Row 2 · C. Row 3 · D. Row 4 ✅
`[A · G1 · Apply · TXN · X · CERT]` — A usable requirement is checkable; row 3 is the strongest distractor because "promptly" sounds like a requirement but has no basis anyone can check.

**A39.** Your team has a signed charter and a SIPOC for purchase-order-to-payment, which crosses Procurement, Receiving, Accounts Payable and the requester. A teammate proposes "adding a row to the SIPOC for every handoff so we can see where invoices stall." The right call:
A. Stop extending the SIPOC — it fixes scope and requirements; handoffs and stalls are for the swimlane and value stream maps in Measure ✅ · B. Add the rows — the SIPOC is the team's only map until Analyze · C. Add cycle times to the SIPOC steps instead of handoff rows · D. Replace the SIPOC with a fishbone on "invoices stall"
`[A · G1 · Analyze · TXN · S · CERT]` — A SIPOC with handoff detail is a poor process map and no longer a SIPOC; D jumps to Analyze before the process has been mapped or measured.

**A40.** A learner on the Practicum track completes the simulated project and passes the exam. On her résumé she may accurately state:
A. "Certified Lean Six Sigma Green Belt" — the exam and rubric are identical · B. "Certified Lean Six Sigma Green Belt (Practicum)" — the credential is distinctly labeled ✅ · C. "Certified Lean Six Sigma Green Belt, verified project" · D. Nothing until she completes a sponsored employer project
`[A · G1 · Understand · NEU · K · CERT]` — The label is the honesty mechanism: the project was simulated and sponsor items were scored by the instructor acting as sponsor; D denies a credential she earned.

**A41.** Through the partner-project pool you are matched with a food-bank nonprofit. Its executive director, who will sign as sponsor, wants the project to cover "everything from donation intake to volunteer scheduling to delivery routes," and mentions a grant report due in four months that must show "process improvement." Your obligation at chartering:
A. Accept the full scope — the partner is doing the program a favor · B. Choose the delivery routes, where the data is easiest to get · C. Charter one bounded process the director ranks first, write in/out scope explicitly, and state what four months can and cannot show ✅ · D. Charter the full scope and narrow it privately after Measure
`[A · G1 · Analyze · TXN · S · CERT]` — A partner sponsor is a real sponsor with a real stake, and the grant report deserves an honest bounded result rather than a promise; D makes the promise and hides the narrowing, which is worse than A because the sponsor never learns the scope changed.

**A42.** A reviewer reads this charter at Tollgate 1:

| Charter element | Entry |
|---|---|
| Track | Employer project |
| Process | Order-to-cash, invoicing team at the learner's employer |
| Sponsor | "Cohort instructor — my manager is too busy to sign; she will sign at the end" |
| Baseline data source | The practicum transactional dataset (invoice-cycle case) "until I get our own ERP extract" |
| Goal | Reduce invoice cycle time from 14.2 to 9 calendar days |

The reviewer's correct ruling:
A. Acceptable — the manager can sign at the end, when there are results to sign for · B. Acceptable if the ERP extract replaces the practicum data by Tollgate 2 · C. Acceptable once the goal is restated as a percentage · D. Not chartered — an employer project needs an employer sponsor signed before week 1 and a baseline from the process itself; otherwise it is a Practicum project and is labeled as one ✅
`[A · G1 · Analyze · NEU · X · CERT]` — The two tracks differ in what is verified, and a simulated dataset standing in for real data on a project claimed as real is a data-ethics stop; B is the strongest distractor because it accepts an unverifiable baseline for the first month and a sponsor who has not agreed to the scope.

<!-- Key tally (42 items): A = 10 · B = 11 · C = 11 · D = 10. Type: S = 17 (40%) · X = 15 (36%) · K = 10 (24%). Bloom: Apply/Analyze = 31 (74%). Vertical: MFG 10 · HC 9 · TXN 11 · NEU 12. Negative stems: 1 (A33). -->
