# Control Plan — Metric, Method, Frequency, Owner, Response Plan, Signature

*Green Belt toolkit · drafted in week 8 for Tollgate 4, handed to the named process owner
after the pilot holds (handover date = day 0 of monitoring), and required to have been live
for at least 30 days at submission — 60 days of the 90 for the `sustained` flag. Rubric
★ C1, with C2 (standard work) and C3 (benefit tracking) referenced. The day-90 question the
sponsor will be asked is in [`../project/sustainment-check.md`](../project/sustainment-check.md).*

## Purpose

A control plan is the document that lets the improvement outlive the project. It says what
will be watched, how, how often, by whom, what reading means "act," and what the action is.
The rubric makes it mandatory (★ C1) because a verified cause and a successful pilot with no
one watching the chart is a project that reverts within a quarter; the program's published
sustainment rate is built on this page. A control plan is not a report; it is a set of
instructions for a person who has the authority to act on them, and it is not a control plan
until that person has signed it.

Three things a control plan controls:

| What | Why it is on the plan |
|---|---|
| **The primary metric (Y)** | So the sponsor and the owner see whether the result is holding — the same chart the project used, continued |
| **The verified cause or its proxy (the X you changed)** | So drift is caught *before* Y moves — the pin diameter, the pharmacy turnaround, the validation rate. This is the row that gives the response plan time to work |
| **The guardrail** | So an improvement in Y is not bought with a loss somewhere else — discarded doses, entry minutes, walk-outs |

## The template

### Header

| | |
|---|---|
| **Process and scope (from the charter)** | start point … stop point; where |
| **Project / Green Belt** | |
| **Process owner (control plan owner)** | name, title — the person who runs the response plan without asking |
| **Sponsor** | |
| **Verified cause and countermeasure (one line each)** | |
| **Standard work reference (C2)** | document id, version, date; who wrote it (roles); training status ____ of ____ by ____ |
| **Handover date (day 0)** | |
| **Review dates** | day 30 (submission threshold) · day 90 (sustainment check) · then ☐ monthly ☐ quarterly at the owner's regular review |
| **Version / date** | limits recalculated only with a written reason and a date, below |

### The plan

| # | Process step | Characteristic (Y · X · guardrail) | Operational definition (ref. and version) | Specification / target and its source | Measurement method and MSA ref. | Sample size and frequency | Control method (chart and limits · check · poka-yoke · audit) | Who monitors | Where recorded / displayed | **Response plan — trigger** | **Response plan — immediate action (contain)** | **Response plan — who acts, within** | **Response plan — escalate to, when** | **Response plan — record and close** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | Y | | | | | | | | | | | | |
| 2 | | X | | | | | | | | | | | | |
| 3 | | X | | | | | | | | | | | | |
| 4 | | guardrail | | | | | | | | | | | | |

### Filling the columns

**Operational definition.** The baseline's, by reference and version. If the definition is
different from the one on the baseline chart, the plan says so and explains why the chart
still reads continuously — otherwise it is the data-ethics stop.

**Specification / target and source.** The customer's limit or the agreed target, with its
source; never the control limits.

**Control method.** In order of strength: a **poka-yoke** that prevents the error (the
validation at entry; the go/no-go gauge in the PM); **detection at source** (a first-piece
check; a huddle-board flag); a **control chart** with named limits and rule set; a **checklist
or audit** at a stated frequency. A chart is the default for Y; the X rows should carry
something stronger than a chart where the project built one.

**Chart and limits.** The chart the project used, continued. Limits are recalculated from the
**post-change stable stage** once it has at least 20–25 points and its own stability
statement, then **frozen** with the date written on the chart; they are recalculated only when
the process is deliberately changed again, with a reason. The rule set is the program's four
rules, named on the chart. Frequency: every point the process produces if the system already
captures it; otherwise a sample the owner can sustain — a plan that asks a charge nurse for
twenty measurements a shift will not be run.

**Response plan — five columns, because "investigate" is not a plan.**

| Column | What goes in it |
|---|---|
| Trigger | The reading, in numbers: "rule 1 or rule 2 on the I chart"; "pin diameter below 9.95 mm"; "adherence below 85% in a week"; "any discarded pack" |
| Immediate action | What contains the problem today, before the cause is known: sort, hold, revert to the previous step, call the supplier |
| Who acts, within | A role with the authority to do it, and a clock — "charge nurse, same shift"; "setter, before the next changeover" |
| Escalate to, when | The next level and the condition — "unit manager if two consecutive weeks"; "sponsor if the response plan has run twice in a month" |
| Record and close | Where the event and its cause are written, and what closes it — the annotation on the chart, the maintenance ticket number, the huddle note |

**Who monitors / where displayed.** A role and a place the team can see. A chart in a
workbook only the Green Belt opens is not monitoring.

### Signatures

| Role | Name | Signature | Date |
|---|---|---|---|
| **Process owner** — *I own this plan. I have the authority to run the response plan without asking, and I know who I escalate to.* | | | |
| Sponsor — *I have named the owner and released the time to run it.* | | | |
| Green Belt — *the chart, limits and definitions are the project's, continued.* | | | |

The owner signs at handover, not at Tollgate 4. Tollgate 4 needs the owner's name and the
handover date; the signature is the C1 evidence at closure. The sponsor attestation
(Part A3 of [`../project/sponsor-verification-and-finance-validation.md`](../project/sponsor-verification-and-finance-validation.md))
confirms the same three facts from the sponsor's side.

---

## Filled example — HC: discharge order-to-departure, unit 4E

**Process and scope:** discharge order signed in the EHR → patient leaves unit 4E (surgical),
all discharges, seven days. **Verified cause (★ A3):** on 4E the pharmacy discharge-medication
turnaround sits on the critical path — order-to-departure rises about one minute per minute
of pharmacy turnaround (slope 1.0, 95% CI 0.9 to 1.1, R² 0.64, n = 302), and 4E's turnaround
averaged 105 minutes against 55 on the units where medications are prepared at order.
**Countermeasure:** discharge medications prepared at the time the order is verified
("meds at order"), with a pharmacy technician assigned to 4E's morning discharge round.
**Pilot (★ I3):** three weeks, 4E daily median order-to-departure fell from 190 to 141 minutes
(prediction 140; comparison unit 6S unchanged at 188). **Standard work (C2):** 4E-SW-014 v1,
"Discharge medication preparation at order," written with two discharge nurses and the unit
pharmacist; 28 of 30 nursing staff trained at handover, remaining 2 by day 14. **Handover
(day 0):** first Monday after Tollgate 4. Numbers are illustrative; the case is the week 4–7
practicum dataset.

| # | Step | Characteristic | Operational definition | Spec / target and source | Measurement, MSA ref. | Sample, frequency | Control method | Who monitors | Recorded / displayed | Trigger | Immediate action | Who acts, within | Escalate to, when | Record and close |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Whole flow | **Y** — order-to-departure, minutes per discharge; daily median | DCP-4E v2 (week 3): start = discharge order signed timestamp; stop = "patient left unit" tracking-board click; calendar minutes; excludes deaths and transfers to another unit | Daily median ≤ 150 min; source: the bed-management committee's discharge standard (agreed at Tollgate 2) | EHR export; timestamp audit 30 events, 97% within ± 5 min (week 3) | Every discharge; daily median plotted each morning for the previous day | **I-MR chart** of the daily median, limits from the 25-day post-change stable stage frozen on day 25: center 141, UCL 195, LCL 87 (MR̄ 20.3); rules 1–4 named on the chart | Charge nurse (plots); nurse manager (reads weekly) | Unit quality board and the 4E discharge workbook | Rule 1 or rule 2 on the I chart; **or** three consecutive days above 150 | Charge nurse checks row 2 and row 3 for the same days; if row 2 is high, calls the pharmacy lead that shift | Charge nurse, same day | Nurse manager if two consecutive weeks with a signal; sponsor if the response plan has run three times in a month | Annotation on the chart with the cause found; huddle note; closed when the chart returns inside limits for 5 days |
| 2 | Pharmacy prepares discharge meds | **X** — pharmacy turnaround, minutes: order verified → meds at bedside, per discharge with meds | Pharmacy system timestamps PHV_TS and BEDSIDE_TS; calendar minutes | Median ≤ 60 min; source: the countermeasure's design (the level the other units run at) | Pharmacy system export; timestamp check 20 events (week 7) | Every discharge with meds; daily median | I-MR of the daily median, post-change limits: center 54, UCL 92, LCL 16; **detection at source:** the technician's 10:00 round sheet flags any verified order older than 45 min | Unit pharmacist (daily); pharmacy lead (weekly) | Pharmacy dashboard; copied to the unit board weekly | Daily median > 92 (rule 1), or rule 2; or any order older than 45 min on the round sheet | Technician escalates the open order to the pharmacist for immediate preparation; if the technician is absent, the pharmacist covers the round | Unit pharmacist, same morning | Pharmacy lead if the technician role is unfilled for > 2 days; sponsor if a staffing change removes the role | Round sheet; annotation; closed when the median is inside limits |
| 3 | Order written | **X** — adherence: % of discharge orders with the "meds at order" flag set at verification | Flag field on the discharge order set, per order | ≥ 90% weekly; source: the standard work | EHR report; attribute check on 20 orders (week 7): 100% match | All orders, weekly % | **p chart** weekly (n ≈ 70), post-change p̄ = 0.94; the flag is a required field in the order set from day 30 (**poka-yoke**, prevention) | Nurse manager | Unit board, weekly | Weekly adherence < 85%, or the required-field build slips past day 30 | Re-brief at the daily huddle; check whether the order set was changed by IT | Nurse manager, within the week | Clinical informatics lead if the field was removed; sponsor if the build date slips twice | Huddle note; IT ticket number; closed when two weeks ≥ 90% |
| 4 | Pharmacy prepares discharge meds | **Guardrail** — discharge medication packs discarded or returned (prepared, then the discharge cancelled or changed) | Count per week from the pharmacy return log; the reason code | ≤ 3 per week; source: pilot harm-watch level (pilot ran at 1–2) | Pharmacy return log | All returns, weekly count | **c chart** weekly, post-change c̄ = 1.4, UCL 5 | Unit pharmacist | Pharmacy dashboard | Any week > 5, or two consecutive weeks > 3 | Review each return's reason code with the discharging team; tighten the "stable protocol" criterion if returns cluster on one order type | Unit pharmacist and nurse manager, within the week | Pharmacy lead and sponsor if returns exceed 5 in two weeks of a month — the countermeasure's cost may exceed its benefit and the design is revisited | Return log; annotated criterion change with date; closed after two weeks ≤ 3 |
| 5 | Monthly | **Audit** — standard work followed as written | 5 discharges observed against 4E-SW-014, checklist | 5 of 5 | Observation | 5 per month | Layered audit by the nurse manager (months 1–3), then quarterly | Nurse manager | Audit sheet in the workbook | Any step not followed | Ask why — the standard may be wrong; fix the standard or re-brief | Nurse manager, the same week | Sponsor if the same step fails twice | Audit sheet; standard revision number if changed |

**Benefit tracking (C3).** Mission metric: 4E bed-hours released = (baseline median − current
median) × discharges per week ÷ 60, reported monthly by the nurse manager from row 1 —
validated by the bed-management director as mission-metric validator; no money is claimed.

**Limits recalculation log.** Day 25: post-change limits set from days 1–25 (stable, no rule
fired); baseline limits (center 190) retired and shown on the chart as the previous stage.

**Signatures.** Process owner: nurse manager, 4E — *signed at handover.* Sponsor: director of
nursing, surgical services. Green Belt.

**The sentence the owner will say at day 90:** *"The plan is being run as written; the daily
median has stayed near 140 for the last 60 days; the response plan triggered once in week 6
when the technician was on leave — the pharmacist covered the round and the chart recovered in
three days; returns are running at one or two a week."*

## Common mistakes

- **A chart with no name, or a name with no authority.** The owner must be able to run the
  response plan without asking. If the named person has to escalate to act, the escalation
  target is the owner.
- **Only Y on the plan.** By the time Y drifts the cause has been back for weeks. Put the X
  you changed on the plan with a control stronger than a chart.
- **"Investigate" as the response.** Five columns: trigger, contain, who and when, escalate,
  record. A reviewer who reads "investigate and take corrective action" scores the row as
  empty.
- **Baseline limits kept forever, or pilot limits set from nine points.** Recalculate from the
  post-change stable stage at 20–25 points, freeze, date, and log any later change with a
  reason.
- **Specification limits on the chart.** The target lives in its own column; the chart's
  limits come from the process. Rule 1 on a spec line is not a signal.
- **A frequency the owner cannot sustain.** Ask the owner what they can do on a bad week, and
  write that.
- **Handing over the workbook instead of the plan.** The plan is signed, displayed, and
  reviewed on a date. A workbook in the Green Belt's drive is the project leaving with the
  Green Belt.
- **No guardrail row.** The improvement is real when it did not cost something you were not
  measuring.
- **A plan written without the people who will run it.** The charge nurse, the setter, the
  clerk — if they did not shape the rows, the rows will not be run. Rubric C2 asks the same of
  the standard work.

## Rubric items evidenced

| Item | What on this plan evidences it |
|---|---|
| ★ C1 Control plan handed to a named owner | Every row: metric, method, frequency, owner, five-column response plan; the owner's signature and the handover date; ≥ 30 days of the chart live at submission |
| C2 Standard work and training | Header: standard reference, who wrote it, training status; row 5 audit |
| C3 Financial or mission-metric validation | The benefit-tracking line: what is measured, by whom, validated by whom, and the benefit class |
| I4 Mistake-proofing and risk | Rows where the control method is a poka-yoke or detection at source; residual risks from the FMEA carried as triggers |
| ★ I3 Before/after evidence | The same chart, continued from baseline through pilot into monitoring, one definition throughout |
| Day-90 `sustained` flag | Rows 1–2 are what the sponsor reads from to answer the sustainment check |

*v1.0 · 2026-09-20*
