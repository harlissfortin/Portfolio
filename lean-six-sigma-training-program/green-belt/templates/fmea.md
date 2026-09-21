# Working-Level FMEA — Failure Mode and Effects Analysis for a Green Belt Project

*Green Belt toolkit · used in week 5 to order the causes you will test (rubric item A1), in
week 7 to re-score risk after mistake-proofing (I4), and in week 8 to seed the control plan's
response rows (★ C1). "Working level" means the ten causes that survived the C&E matrix, not
every step of the process: the full process or design FMEA is Black Belt scope.*

## Purpose

The C&E matrix ranks causes by how strongly the team thinks they drive the CTQs. It does not
ask how bad the failure is when it happens, how often it happens, or whether anyone would
notice. Two causes with the same matrix score can differ by a factor of ten on risk: one
adds twenty minutes of rework, the other pays a supplier twice or sends a patient home
without the right medication. The FMEA adds those three questions and produces a test order
you can defend, a list of Just-Do-Its you should not bother testing, and the risk register
the control plan inherits.

Nothing statistical is computed. The scores are the team's structured judgment; the
occurrence score is the one place the judgment must yield to Measure data where you have it.

## The scales (agree the anchors before scoring)

**Severity (S)** — how bad the *effect* is for the customer, patient or the next step, if the
failure reaches them. Scored once per effect; it does not change when you fix the cause.

| S | Anchor | MFG | HC | TXN |
|---|---|---|---|---|
| 9–10 | Safety, regulatory or legal harm; or the customer stops the line / the service | Escape that fails in the customer's assembly; injury | Patient harm; wrong medication or dose reaches the patient | Duplicate or fraudulent payment; regulatory filing missed |
| 7–8 | Customer or patient notices and is materially affected; significant rework or delay | Customer rejects the lot; 100% sort at the customer | Discharge delayed past the day; readmission risk | Vendor paid late enough to stop supply; customer-facing error |
| 4–6 | Internal rework or delay the customer does not see directly | Part reworked in-house (20–60 min); scrap of one part | Bed blocked for hours; transport re-booked | Invoice returned to the clerk queue; a day added to days-to-pay |
| 2–3 | Minor inconvenience, quickly recovered | A part re-measured; a label reprinted | A form re-printed; a phone call to chase | A field corrected at entry |
| 1 | No noticeable effect | — | — | — |

**Occurrence (O)** — how often the *cause* produces the failure mode. From the baseline data
where the data exist (mark **D** for data); otherwise the team's estimate (mark **E**) and a
plan to get the number.

| O | Frequency | Rule of thumb from Measure |
|---|---|---|
| 9–10 | 1 in 10 units or more | The chart's center line is at or above 10% for this failure mode; or the stratified chart shows it on most units of one group |
| 7–8 | 1 in 10 to 1 in 100 | Visible on the p chart every week |
| 5–6 | 1 in 100 to 1 in 1,000 | A few times a month at your volume |
| 3–4 | 1 in 1,000 to 1 in 10,000 | A few times a year |
| 1–2 | Rarer, or never seen in the baseline window | One special-cause signal in the window scores 2, not 1 |

**Detection (D)** — how likely the *current* control is to catch the failure before it reaches
the customer or the next step. Score the control that actually exists, even if it is a person
noticing; "nobody checks" is a 10 only when it is true.

| D | Current control |
|---|---|
| 9–10 | No control; or the control is downstream of the customer (a complaint, an audit finding) |
| 7–8 | A person is expected to notice, with no prompt, under normal load |
| 5–6 | A downstream inspection or report catches most occurrences after the fact (100% end-of-line gauge; a weekly exception report); or a measurement system whose MSA was marginal |
| 3–4 | Detection at source: a prompt, a shadow board, a validation message the operator sees before the unit leaves the step |
| 1–2 | Prevention: the error cannot be made (fixture accepts one orientation; the form will not submit; the pump library hard-limits the dose) |

**Risk priority number (RPN) = S × O × D**, from 1 to 1,000.

### What RPN can and cannot do

- **It ranks; it does not measure.** The three scales are ordinal — a severity of 8 is not
  twice a 4 — so a 280 is not "twice as risky" as a 140. Use the rank, not the ratio.
- **Equal RPNs are not equal problems.** 7 × 8 × 5 = 280 and 7 × 5 × 8 = 280 differ: the first
  happens often and is half-caught; the second is rarer and nobody would see it. Read the
  three digits, not only the product.
- **Severity overrides.** Any row with S ≥ 8 is acted on — tested or mistake-proofed —
  regardless of RPN. A rare, undetected, severe failure has a low RPN and is exactly the one
  a reviewer will ask about.
- **No thresholds.** "Act above 100" is a rule from another era; the number depends on the
  anchors your team chose. The test order is: RPN rank → severity override → "we already have
  the data" as tiebreaker → Just-Do-Its pulled out and fixed without a test.
- **Newer automotive FMEA practice** (AIAG-VDA, 2019) replaced RPN with an *action priority*
  table for these reasons. Know that it exists; at Green Belt the working-level RPN with the
  rules above is enough, and a reviewer will accept either if the logic is visible.

## The template

**Project:** ______________ **Process (map ref.):** ______________ **Primary metric:** ______________
**Scored by (roles, not names):** ______________ **Date:** ________ **Version:** ☐ week 5 (test order)
☐ week 7 re-score (I4) ☐ week 8 (control plan seed)

| # | Process step (from the map) | Failure mode (what goes wrong) | Effect (on the customer / next step) | S | Cause (checkable statement, from the C&E matrix) | O | D/E | Current control | D | RPN | Decision: test · Just-Do-It · countermeasure · park | Test / action, owner, date | Action taken | S | O | D | RPN after |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | | | | | | | | | |
| 2 | | | | | | | | | | | | | | | | | |
| … | | | | | | | | | | | | | | | | | |
| 10 | | | | | | | | | | | | | | | | | |

Rules for filling it:

1. **One failure mode per row.** A step with three ways to fail gets three rows.
2. **Cause as a checkable statement**, carried over from the C&E matrix unchanged. "Locating
   pin worn beyond 0.05 mm" can be tested; "fixture is bad" cannot.
3. **No row names a person.** Every cause is a design decision someone made rationally. "Setter
   judgment on torque" is a cause only when the next clause is "because no torque is
   specified."
4. **O from data where the baseline has it**, marked D. An estimate is marked E and the row
   carries a note on how the number will be got.
5. **D scores the control that exists today**, before your project. After the countermeasure
   you re-score in the last four columns; the "before" columns are never edited.
6. **The decision column is the output.** *Test* rows go to the test plan in
   [`hypothesis-test-selector.md`](hypothesis-test-selector.md). *Just-Do-It* rows are fixed
   this week, logged, and not tested. *Countermeasure* is filled only after a cause is
   verified (★ A3). *Park* means out of scope or authority, with a proposed home.

## Filled example — MFG: bracket line B, hole-position deviation

**Primary metric:** hole-position deviation from nominal, mm, hand-held gauge at end of line;
CTQ ± 0.25 mm from the customer drawing. **Baseline (Measure):** 1,500 parts over ten weeks,
first-pass fail 6.0%; stratified box plots show fixture F3 running about +0.12 mm and the
night shift with wider spread on every fixture. **Map steps:** load and locate in fixture →
clamp → drill → unload and gauge → record; changeover and tool change as support steps.
Scored by the setter, the day inspector, the line lead and the Green Belt. Numbers are
illustrative; the case is the week 4–7 practicum dataset.

| # | Step | Failure mode | Effect | S | Cause | O | D/E | Current control | D | RPN | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Locate in fixture F3 | Part seats off-datum | Hole out of tolerance; 20 min rework per part; escape risk to customer assembly | 7 | F3 locating pin worn — four years in service, no wear check in the PM schedule | 8 | D — F3 parts fail 9% vs 1% on F1/F2/F4 | 100% end-of-line gauge check | 5 (gauge R&R 35% at week 3, marginal after fix) | **280** | **Test first** — 2-sample t, F3 vs F4 on the same machine; data in hand |
| 2 | Clamp | Clamp under-torqued after changeover | Part shifts under the drill; deviation drifts through the run | 7 | No torque specified at changeover; setter judgment | 5 | E — torque never recorded | None | 8 | **280** | **Test second** — record torque at 25 changeovers, regress mean offset on torque (week 6) |
| 3 | Drill, night shift | Wider spread on all fixtures at night | Fail rate 9% at night vs 1% by day on good fixtures | 6 | Coolant temperature drifts through the night; no warm-up cycle after the 2-hour idle | 6 | E — spread seen (SD 1.6×), mechanism not measured | None | 9 | **324** | **Test** — first-hour vs rest-of-shift comparison on night data; coolant temperature log requested from maintenance |
| 4 | Tool change on M2 | Offset not reset after tool change | Two-day step of +0.15 mm on every M2 part | 7 | Tool-change standard has no "reset offset" step | 2 | D — once in ten weeks (chart signal, days 31–32) | Green Belt saw the chart signal | 6 | 84 | **Just-Do-It** — add the reset step and a first-piece check to the standard; verify at the next tool change |
| 5 | Record | Inspector logs "pass" without a number | Blank in the data; possible escape | 5 | Gauge log accepts a blank value | 2 | D — 5 in 1,500 | None | 10 | 100 | **Just-Do-It** — required field on the log |
| 6 | Record | Value keyed in wrong units (12.50 for 0.125) | An oversize part recorded as a pass | 8 | Free-text numeric field, no range check | 1 | D — 1 in 1,500 | None | 10 | 80 | **Severity override → fix now** — range check ± 1.00 mm on the field |
| 7 | Locate, any fixture | Operator technique differs | Deviation differs by operator | 5 | Operators trained differently across shifts | 3 | E | Line lead observes | 7 | 105 | **Test** — box plot by operator *within* shift; ANOVA. (Week 6 result: no difference; largest gap 0.02 mm, CI −0.02 to 0.06 — rejected, shown under A4) |
| 8 | Drill | Machine M2 runs high | M2 parts out high | 6 | M2 spindle alignment | 4 | E | None | 8 | 192 | **Test with row 1** — M2 parts on F4 equal M1 parts; the "machine" effect is F3. Rejected |
| 9 | Unload | Burr on the datum face | Gauge seats on the burr; false reading | 4 | No deburr step before gauging | 6 | E | Inspector's habit (two of three deburr) | 6 | 144 | **Countermeasure after MSA** — written gauge method (week 3); not a process cause, a measurement one |
| 10 | Changeover | Wrong drill length fitted | Depth wrong, hole position unaffected | 5 | Drills stored unlabeled | 1 | D — none in window | Setter checks | 6 | 30 | **Park** — different CTQ; note to the line's kaizen list |

**Reading the table.** Row 3 has the highest RPN and row 1 the strongest data, so both are
tested and row 1 goes first because the extract exists. Rows 1 and 2 tie at 280 with different
shapes: row 1 is frequent and half-caught, row 2 is uncertain and never caught. Row 6's RPN of
80 would rank ninth; the severity override puts its fix in this week's actions. Rows 4, 5 and 6
are fixed without a test — the FMEA has just paid for itself in causes you will *not* spend
week 6 on.

**Week 6 outcome (for the A3):** row 1 verified — F3 parts sit 0.119 mm further from nominal
than F4 parts on the same machine (95% CI 0.096 to 0.142, n = 187 and 190). Row 2 verified as a
contributor — offset falls 0.004 mm per N·m of clamp torque (CI 0.002 to 0.006), 25
changeovers. Row 3: first-hour night parts were no different from the rest of the night
shift, so "warm-up" is rejected; the night spread is real and its cause needs the coolant
temperature log that maintenance can provide next quarter — **parked with a data request**,
recorded under A4. Rows 7 and 8 rejected and shown.

### Re-scoring after the countermeasure (week 7, rubric I4)

| # | Action taken | S | O | D | RPN after | Residual risk named |
|---|---|---|---|---|---|---|
| 1 | F3 locating pin replaced; pin diameter added to the monthly PM with a go/no-go gauge; first-piece check at every changeover | 7 | 2 | 3 | **42** | PM skipped in a busy month — the control plan's monthly audit row; pin from a different supplier with a different tolerance |
| 2 | Torque specified at 24 N·m; click-type wrench on the kit cart; torque value recorded at changeover | 7 | 2 | 4 | **56** | Wrench uncalibrated or borrowed from another line — wrench on the calibration register; a spare on the cart |
| 3 | No countermeasure yet | 6 | 6 | 9 | 324 | Carried into the control plan as a known, unaddressed cause; follow-on project proposed |

Severity does not change (the effect is the same if it happens); occurrence falls because
the cause is removed; detection improves because the check moved from end-of-line to the
source. The row-3 RPN is unchanged and written on the A3 rather than quietly dropped.

## Common mistakes

- **FMEA before the map.** The steps come from the week 2 current-state map as observed. A
  failure mode on a step that does not exist in the process as worked is fiction.
- **Every D a 10.** "Nobody checks anything" is rarely true; the inspector, the chart, the
  weekly report are controls, weak ones. A 7 with a reason beats a 10 by reflex.
- **O from opinion when the data are on the baseline chart.** The p chart's center line, the
  stratified box plot, the count of signals in the window — use them and mark the row D.
- **Adding, not multiplying — or treating the product as a measurement.** RPN ranks. A 280 is
  ahead of a 192; it is not "1.46 times worse."
- **Applying a threshold.** "Act above 100" would have skipped row 6 (an oversize part passed)
  and tested row 7 (the operator theory). The severity override and the data are the rules.
- **Naming people.** "Inspector B logs blanks" is not a cause; "the log accepts a blank" is.
- **Editing the before-scores after the fix.** The before columns are the record; the after
  columns show the change. A reviewer who sees a before-D of 3 next to "no control existed"
  stops reading.
- **Testing the Just-Do-Its.** A missing required field does not need a hypothesis test. Fix it,
  log it, move on — and say so under A1.
- **Using the FMEA as A3 evidence.** An RPN of 280 is a reason to test, not a result. The
  verification is the week 6 test with its effect size and sentence.

## Rubric items evidenced

| Item | What on this FMEA evidences it |
|---|---|
| A1 Cause generation and narrowing | The ten rows carried from the C&E matrix; the decision column showing why each cause is tested, fixed or parked; the test order stated |
| A4 Honest handling of what did not verify | Rows 3, 7 and 8 carried with their outcomes rather than deleted |
| I4 Mistake-proofing and risk | The re-scored rows with the residual risk named; the unaddressed row left visible |
| ★ C1 Control plan | The after-D controls (PM gauge, first-piece check, torque record) become the control plan's method and response rows ([`control-plan.md`](control-plan.md)) |

*v1.0 · 2026-09-20*
