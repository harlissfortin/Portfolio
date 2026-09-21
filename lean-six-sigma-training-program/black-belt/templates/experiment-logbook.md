# Experiment Logbook — Run Order, Actuals, Deviations, Environmental Notes

*Black Belt toolkit · opened the day the [`doe-planning-canvas.md`](doe-planning-canvas.md)
is frozen and closed when the analysis file is handed to the reviewer. Kept for the project
experiment and for the practicum experiment. Rubric ★ I1 and M3 — the logbook is what makes
the experiment auditable — with I4 for deviations and S1 for the record. Analysis mechanics:
[`../modules/m5-design-of-experiments.md`](../modules/m5-design-of-experiments.md).*

## Purpose

The canvas says what was supposed to happen. The logbook says what happened. Every experiment
meets a process that has its own ideas: a factor that will not hold its setting, a run
interrupted by a real customer, a month-end surge, an operator who was rightly pulled to a
line-down. None of that ruins an experiment. What ruins an experiment is not knowing it
happened, or deciding a month later which runs to keep once you have seen which ones help.

The logbook carries four things per run — the planned setting, the actual setting and how you
know, the response as recorded, and anything else that moved — and it carries them in the
run order, at the time, in a form you cannot quietly revise. When the residuals-versus-run-order
plot shows a trend, the logbook is where you find the reason. When a reviewer asks why run 6
has 388 observations instead of 250, the logbook answers in one line written on the day.

Three rules, from the program's data-ethics stop:

| Rule | Why |
|---|---|
| Written at the time, in run order, never reconstructed | A logbook filled in from memory after the analysis is a baseline reconstructed from memory |
| Exclusion rules come from the canvas, decided before; a run is flagged, never deleted | A run excluded because its result was inconvenient is the data-ethics stop; a run excluded because a rule written before the experiment says so is provenance |
| The response's operational definition does not change mid-experiment | A shortened proxy for the response is allowed only if the canvas says so and the full-definition value is recorded later on the same rows |

## The logbook

### 1 · Header (copied from the canvas, then frozen)

| | |
|---|---|
| **Experiment number and title; canvas version and date** | |
| **Design** | k factors, runs, blocks, center points, replicates |
| **Response(s), operational definition and version; measurement device id; check-standard reading per block** | |
| **Factor settings and how each is verified** | the controller display, a configuration id, a photograph, a gauge reading — per factor |
| **Randomization seed and the standard-order ↔ run-order table** | attached as page 1 |
| **Who runs, who measures, who keeps the logbook** | roles and initials |
| **Exclusion and re-run rules (from the canvas)** | the only reasons a run may be flagged: written here before run 1 |
| **Stop rule and who decides** | |

### 2 · Pre-run checklist (each block, before the first run)

| Check | Done (initials, time) |
|---|---|
| Nuisance variables held as the canvas says (dryer hours, check weight, configuration frozen, simulator seed list) | |
| Measurement device checked against its standard; reading recorded | |
| Run-order table on the bench, not the standard-order table | |
| Materials or units for the whole block reserved and identified | |
| Everyone in the area knows an experiment is running and what not to touch | |
| The prediction for any confirmation run written before the run | |

### 3 · The run table (one row per run, in run order)

| Run order | Std order | Block | Date, start–stop | Planned settings (A, B, C, D) | Actual settings and how verified | n in run | Response as recorded (units) | Secondary responses / guardrail reading | Deviation from plan — what, when noticed | Environmental and nuisance notes | Status: kept · flagged (rule) · re-run | Initials |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | | | | |
| 2 | | | | | | | | | | | | |
| … | | | | | | | | | | | | |

**Actual settings.** Write what the process did, not what you asked for. A controller that
displays 73 bar when 75 was set is a 73 bar run; the analysis uses coded levels, and the
deviation is a note, but a factor that drifts to the other level's neighborhood is a flag.

**Status.** Every run is *kept* unless a rule from the header applies, in which case it is
*flagged* with the rule number and analyzed both ways, or *re-run* at the end of the block in
a new row with the reason. No row is ever deleted; a crossed-out entry stays legible.

### 4 · Changes to the plan (dated, before they take effect)

| Date | What changed (levels, run count, a factor dropped, a block added) | Why | Agreed by | Effect on the analysis plan |
|---|---|---|---|---|
| | | | | |

### 5 · Nuisance and environment log (events that span runs)

| Date, time | Event | Runs affected | Recorded by |
|---|---|---|---|
| | | | |

### 6 · Confirmation runs

| Run | Settings | Prediction (written first, with interval) | Result | Inside the interval? | Notes |
|---|---|---|---|---|---|
| | | | | | |

### 7 · Data hand-off

| | |
|---|---|
| **Analysis file name and date; software** | |
| **Row count in the file = rows kept + flagged in this logbook** | yes / no — if no, why |
| **Where the raw exports, photographs and configuration screenshots are** | |
| **Logbook closed by, date** | |

---

## Filled example — TXN: dispute rate versus billing validation rules, freight billing

The freight-billing project from [`../project/charter-and-strategic-linkage.md`](../project/charter-and-strategic-linkage.md)
(section 2.3): the designed test on a bounded customer group, weeks 9–11. Numbers are
illustrative and in the observed range for the process.

**Header.** Experiment 2, "Dispute rate versus accessorial validation and proof-of-delivery
attachment, trial customer group G" (canvas v2, frozen week 8). Design: 2² with two
replicates, 8 runs, one block; each run is one day's issued invoices for the 34 customers in
group G, target ≈ 250 invoices. Factors: A = accessorial-charge validation rule at rating
(off / on, verified by the billing system's rule configuration id, screenshot per run);
B = proof-of-delivery image attached to the invoice (no / yes, verified by the attachment
count in the issue report). Response: dispute rate at 21 days — invoices given any dispute
code within 21 calendar days ÷ invoices issued in the run; the canvas records this as a proxy
for the charter's 60-day definition, and the 60-day value is added to every row at day 60
before the analysis is final (a shorter window was needed to fit the cohort calendar; the
21-day window catches 83% of 60-day disputes in the baseline year). Secondary response and
guardrail: invoice issue time (days from delivery to invoice) per run; the stop rule from the
charter (group dispute rate above baseline for two consecutive weeks) with the billing
manager deciding. Randomization seed 20260907; run-order table attached. Roles: billing
specialist (runs; configures the rule with the system administrator), collections analyst
(disputes at day 21 and day 60), Black Belt (logbook). Exclusion rules written before run 1:
(R1) a run in which the rule configuration is found to differ from the plan for more than 10%
of the run's invoices is flagged and analyzed with and without; (R2) a run interrupted by a
system outage of more than two hours is re-run; (R3) a run with fewer than 150 invoices is
flagged.

**Run table (condensed; the full table has 13 columns).**

| Run | Std | Date | Planned A, B | Actual, verified | n issued | Disputes at 21 d (rate) | Issue time, days | Deviation | Environment | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 3 | 8 Sep | off, yes | rule cfg 0 (screenshot); 253/253 attached | 253 | 18 (7.1%) | 1.2 | none | — | kept |
| 2 | 1 | 9 Sep | off, no | cfg 0; 0 attached | 251 | 24 (9.6%) | 1.1 | none | — | kept |
| 3 | 2 | 10 Sep | on, no | cfg 7 — **cfg 7 loaded with the threshold field blank for the first 41 invoices**, noticed 10:40 by the specialist when the rule flagged nothing; corrected, remaining 208 under cfg 7 as planned | 249 | 15 (6.0%) | 1.3 | 41 invoices (16%) under a mis-set rule — R1 | — | **flagged (R1)**: analyzed with and without; the 41 invoices' disputes counted separately (4 of the 15) |
| 4 | 4 | 11 Sep | on, yes | cfg 7; 250/250 | 250 | 8 (3.2%) | 1.4 | none | contracts updated the rate table for one lane at 14:00 (nuisance log) | kept |
| 5 | 2 | 15 Sep | on, no | cfg 7; 0 attached | 256 | 17 (6.6%) | 1.2 | none | — | kept |
| 6 | 4 | 16 Sep | on, yes | cfg 7; 376/388 attached — terminal 3 scanner down 06:00–09:30, 12 invoices issued without images | 388 | 9 (2.3%) | 1.9 | n = 388, not ≈ 250: **month-end surge**; 12 invoices at B = "no" inside a B = "yes" run (3%) | month-end; issue time up because of volume, not the factors | kept (below R1's 10%); surge noted for the residual-vs-run-order plot |
| 7 | 1 | 17 Sep | off, no | cfg 0; 0 attached | 247 | 22 (8.9%) | 1.2 | none | — | kept |
| 8 | 3 | 18 Sep | off, yes | cfg 0; 244/244 | 244 | 19 (7.8%) | 1.2 | none | — | kept |

**Changes to the plan.** 12 Sep: the collections analyst is on leave 22–26 Sep; the day-21
dispute count for runs 5–8 is taken by the collections manager using the same query (query
id DQ-21, attached). Agreed by the Black Belt and the collections manager; no effect on the
analysis plan.

**Nuisance log.** 11 Sep 14:00 — contracts updated lane rates for one customer in group G;
invoices issued after 14:00 on 11 Sep and all later runs use the new rates; 9 of 250 invoices
in run 4 were issued after the update. 16 Sep — month-end: volume 388 against a mean of 250.
16 Sep 06:00–09:30 — terminal 3 scanner outage.

**What the logbook did for the analysis.** Cell means at 21 days: off/no 9.25%, on/no 6.3%,
off/yes 7.45%, on/yes 2.75%. The validation rule's effect is about −3.8 points and the
attachment's about −2.7 points; the interaction (−1.0 points) says the two together remove
more disputes than the sum — the invoices that fail both checks were the ones disputed twice.
Run 3 analyzed with the 41 mis-set invoices removed gives 5.3% instead of 6.0%; the
conclusion does not change, and the reviewer can see that because both numbers are in the
record. Run 6's month-end volume shows on the residual-versus-run-order plot as the one
large residual; the logbook explains it, and issue time (1.9 days) is reported as a volume
effect, not a guardrail failure. *The sentence to the sponsor:* "Validating accessorial
charges at rating and attaching the proof of delivery together cut the 21-day dispute rate
in the trial group from about 9% to about 3% — roughly two thirds of disputes — across eight
days and 2,138 invoices; the 60-day rates, added at day 60, moved from 10.9% to 3.6%. Issue
time did not change except on the month-end day."

**Confirmation.** Three further days with both on, prediction 2.8% (interval 1.6–4.4% at
n ≈ 250), written on 19 Sep: results 3.1%, 2.4%, 3.5%.

---

## Common mistakes

- **The logbook written up on Friday from memory.** It is written at the bench, in run order,
  at the time. A tidy logbook with one handwriting and one pen is the sign.
- **Recording the planned setting as the actual.** The column exists because processes drift.
  Write what the controller, configuration id or gauge said, and how you know.
- **Deleting the bad run.** A run is flagged against a rule written before the experiment and
  analyzed both ways, or re-run in a new row. A row that disappears between the logbook and
  the analysis file is the data-ethics stop.
- **No environment log.** The month-end surge, the rate-table change, the warm afternoon —
  when the residuals-versus-run-order plot shows a pattern, this is the only place the reason
  can be found.
- **Run order missing from the analysis file.** Without it the run-order residual plot cannot
  be drawn and a drifting nuisance is invisible. The run-order column is the first column.
- **A proxy response that quietly becomes the response.** If the canvas allows a shortened
  window, the full-definition value goes on the same rows later and the analysis is repeated
  on it.
- **Confirmation runs with the prediction written afterwards.** The prediction goes in the
  logbook before the run, with its interval; a confirmation that "agrees" with a number written
  later confirms nothing.
- **A changed plan that nobody agreed to.** A level moved on the day, a replicate dropped for
  time — recorded in section 4 with who agreed, or the design the reviewer sees is not the
  design that was run.

## Rubric items evidenced

| Item | What in this logbook evidences it |
|---|---|
| ★ I1 Experimental or piloted solution evidence | Actual settings verified per run; deviations recorded and analyzed both ways; confirmation runs against a prior prediction; the honest reading of run 6 |
| ★ A2 Root cause verified | The run-order and nuisance records that make the residual diagnostics interpretable, so the effects can be believed |
| M3 Data provenance | Every row's origin; flags against pre-written rules; the hand-off check that the file's row count equals the logbook's |
| I4 Implementation management | The change table with owners and dates; the people who did the work configured and ran the trial |
| M1 Measurement systems | The device check per block and the attribute count method named per run |
| S1 The record | A stranger can reconstruct the experiment from page 1 (the run-order table) to section 7 |

*v1.0 · 2026-09-20*
