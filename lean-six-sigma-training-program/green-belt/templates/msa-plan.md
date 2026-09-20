# Measurement System Analysis Plan — Variable Gage R&R and Attribute Agreement

*Green Belt toolkit · used in week 3 (the MSA lab runs a Gage R&R that fails on purpose),
rubric item ★ M3. Software steps: [`software-parity.md`](software-parity.md).*

## Purpose

Before a number can tell you about the process, you have to know how much of the number is
the measurement. A gauge that varies by half the tolerance from operator to operator will
show "improvement" whenever the operators change and hide a real shift whenever they do
not. Rubric M3 is mandatory for that reason: an MSA is *attempted* on the primary metric,
its result is interpreted, and if the measurement system failed, you show what you did
about it. A failed MSA that you fixed is a stronger submission than a clean one you cannot
explain.

Two studies cover Green Belt work:

| Your primary metric is | Study | What it separates |
|---|---|---|
| A measurement (mm, minutes, grams, dollars read from something) | **Variable Gage R&R** (crossed: every operator measures every part) | Part-to-part variation from repeatability (same person, same part, again) and reproducibility (different people, same part) |
| A judgment (pass/fail, category, "needs correction") | **Attribute agreement analysis** | Within-appraiser consistency, between-appraiser agreement, and agreement with a known standard |

Destructive tests, nested designs, and measurement uncertainty are Black Belt (module M2).
If your metric is destroyed by measuring it (a weld pull test, a sterility culture), plan a
repeatability study on the most homogeneous material you can find and tell your coach.

Timestamps and system-derived metrics still get an MSA — a timestamp audit (observed event
vs recorded time) is the variable form; "does the field mean what we think" is the attribute
form. See the ED example in [`data-collection-plan.md`](data-collection-plan.md).

---

## Part A — Variable Gage R&R plan

### The plan

**Metric / characteristic:** ____________ **Gauge (make, model, resolution):** ____________
**Tolerance (USL − LSL) or process spread to judge against:** ____________
**Parts:** ____ (target 10) chosen to span the **full process range**, not the spec range —
include parts near and beyond both limits · **Operators:** ____ (target 3; the people who
actually measure in production) · **Trials:** ____ (2 or 3) · **Order:** randomized within
each operator, parts blind-labeled · **Method:** ☐ ANOVA (default) ☐ X̄-R
**Study owner:** ________ **Date:** ________ **Where the raw data live:** ________

| Part | Operator A trial 1 | A trial 2 | Operator B trial 1 | B trial 2 | Operator C trial 1 | C trial 2 |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| … | | | | | | |
| 10 | | | | | | |

### Acceptance criteria (state before the study)

| Statistic | Acceptable | Marginal — acceptable with a written reason and a plan | Unacceptable |
|---|---|---|---|
| %GRR of study variation (6σ_GRR / 6σ_total) | < 10% | 10–30% | > 30% |
| %GRR of tolerance (6σ_GRR / (USL − LSL)) | < 10% | 10–30% | > 30% |
| Number of distinct categories (ndc = 1.41 × σ_part / σ_GRR, rounded down) | ≥ 5 | 3–4 | ≤ 2 |

Judge against **tolerance** when the purpose is deciding pass/fail; judge against **study
variation** when the purpose is seeing process change (a project usually needs both). The 6σ
multiplier is the current AIAG convention and the Minitab default; older references use
5.15σ — say which you used, and do not mix them between studies.

### Reading the result

- **Repeatability dominates** (same person cannot repeat): gauge resolution too coarse for
  the tolerance (the gauge should read to at least a tenth of it), gauge wear, unstable
  fixturing, the part moving.
- **Reproducibility dominates** (people differ): no defined method — where to place the
  probe, how much force, which reading to take; different readings of the same scale; one
  operator with a different habit (the operator × part interaction shows this).
- **Part-to-part small** relative to GRR: either the gauge is poor or the parts you chose
  did not span the range. Check the parts first.

### What to do when it fails

1. Do not proceed to capability on this metric; say so on the Tollgate 2 one-pager.
2. Diagnose which component dominates (above) and fix that: write the method, add a fixture,
   replace or re-resolve the gauge, calibrate, train to the method.
3. **Re-run the study**, same parts if possible, and report both results side by side.
4. If the re-run is marginal, state the plan to get it acceptable (a better gauge for the
   final capability claim, for example) and proceed with the caveat written on every chart.
5. If it cannot be fixed within the project, change the metric to one you can measure, and
   re-baseline. A project with a measurement system that cannot see the tolerance has no
   before/after evidence (rubric ★ I3), whatever the charts say.

### Filled example — MFG: bracket hole position

**Metric:** hole-position offset from nominal, mm. **Gauge:** dial caliper against a
locating pin, resolution 0.02 mm. **Tolerance:** ± 0.10 mm (0.20 total). **Parts:** 10
brackets picked from both fixtures across three shifts, offsets from 0.00 to 0.09 mm.
**Operators:** three line inspectors. **Trials:** 2. ANOVA method.

**Study 1 result (illustrative):**

| Source | Standard deviation (mm) | Study variation (6σ, mm) | % of study variation | % of tolerance |
|---|---|---|---|---|
| Total Gage R&R | 0.0173 | 0.104 | 52.6% | 52.0% |
| Repeatability | 0.0090 | 0.054 | 27.3% | 27.0% |
| Reproducibility | 0.0148 | 0.089 | 45.0% | 44.4% |
| Part-to-part | 0.0280 | 0.168 | 85.1% | 84.0% |
| Total variation | 0.0329 | 0.198 | 100% | — |

ndc = 1.41 × 0.0280 / 0.0173 = 2.3 → **2**. **Unacceptable** on every criterion.
Reproducibility dominates; the operator-by-part plot shows inspector B reading consistently
high on the four parts with the largest burr — B seats the pin against the burr, A and C
deburr first with a thumb. Nobody wrote down which was correct. The gauge's 0.02 mm
resolution is also only a tenth of the tolerance, the minimum.

**What was done:** a one-line measurement standard ("deburr with the plastic scraper, seat
pin, read at the 12 o'clock position"), a 5-minute demonstration for all three, and a digital
caliper reading to 0.01 mm.

**Study 2 result, same parts, two weeks later:**

| Source | Standard deviation (mm) | % of study variation | % of tolerance |
|---|---|---|---|
| Total Gage R&R | 0.0072 | 24.9% | 21.6% |
| Repeatability | 0.0060 | 20.8% | 18.0% |
| Reproducibility | 0.0040 | 13.8% | 12.0% |
| Part-to-part | 0.0280 | 96.9% | — |

ndc = 1.41 × 0.0280 / 0.0072 = 5.5 → **5**. **Marginal, accepted with a plan:** the
baseline and pilot charts carry the note "gauge R&R 22% of tolerance"; the final
capability claim at closure is measured on the CMM (a prior study: 6% of tolerance). Both
studies appear on the Tollgate 2 one-pager. The Tollgate 2 sentence: *"Our caliper method
was consuming half the tolerance in measurement noise; after a written method and a better
caliper it consumes about a fifth, which is good enough to see the shift we are looking
for, and the closure claim will be made on the CMM."*

---

## Part B — Attribute agreement analysis plan

### The plan

**Judgment being made:** ____________ (e.g., "invoice needs correction: yes/no"; "wound
stage 1–4"; "call resolved on first contact: yes/no")
**Operational definition the appraisers use (attach it):** ____________
**Items:** ____ (30–50) with **known reference answers** set by an expert panel before the
study; ≥ 30% of items in the "defective" class; include borderline items on purpose
**Appraisers:** ____ (2–3; the people who make this judgment in production) · **Trials:** 2,
items re-ordered between trials, at least a day apart · **Blind:** appraisers do not see the
reference or each other's answers
**Study owner:** ________ **Date:** ________

| Item | Reference | Appraiser A t1 | A t2 | Appraiser B t1 | B t2 | Appraiser C t1 | C t2 |
|---|---|---|---|---|---|---|---|
| 1 | | | | | | | |
| … | | | | | | | |
| 30 | | | | | | | |

### Acceptance criteria (state before the study)

| Statistic | Acceptable | Marginal | Unacceptable |
|---|---|---|---|
| Within appraiser (t1 = t2), % of items | ≥ 90% | 80–90% | < 80% |
| Each appraiser vs reference, % of items (both trials correct) | ≥ 90% | 80–90% | < 80% |
| Between appraisers (all agree, both trials) | ≥ 90% | 80–90% | < 80% |
| All appraisers vs reference | ≥ 90% | 80–90% | < 80% |
| Kappa (agreement beyond chance), where the software prints it | ≥ 0.75 | 0.40–0.75 | < 0.40 |

Report the percentages with their confidence intervals; with 30 items the interval on 90% is
roughly 73–98%, which is why 30 is the floor and 50 is better.

### Reading the result

- **Within-appraiser low:** the definition does not decide borderline cases, so the same
  person decides them differently on different days. Fix the definition.
- **Vs-reference low, within high:** the appraiser is consistent and consistently different
  from the standard — trained to a different rule, or the reference itself is wrong. Check
  the reference panel's reasoning on the disagreements before retraining anyone.
- **Between low, within and vs-reference mixed:** typically one appraiser; look at the
  disagreements by item — they cluster on a *type* of item that the definition does not
  cover.
- **Reference "defective" class too small:** agreement looks high because almost everything
  is a pass. Re-run with the mix above.

### What to do when it fails

1. List every disagreement by item and read the items. The pattern is the finding.
2. Fix the **definition** first (a decision rule, a reference list, a photo standard), then
   the training. Retraining to an ambiguous definition produces the same result.
3. Re-run with the same items; report both results.
4. If the judgment cannot be made reliably, the metric is not fit for the project: consider
   whether a measurement exists underneath the judgment (days late, not "late").

### Filled example — TXN: "invoice needs correction after approval"

**Judgment:** for each invoice, does it contain an error that would require correction after
approval (yes/no)? The project's primary metric is the proportion "yes."
**Definition (v1, as used in the baseline):** "an invoice needs correction if vendor, PO
number, amount or GL coding does not match the purchase order."
**Items:** 30 invoices from Q2, 13 with a reference "yes" set by the AP supervisor and the
procurement analyst together, including 6 borderline cases. **Appraisers:** three AP clerks.
**Trials:** 2, three days apart.

**Study 1 result (illustrative):**

| Statistic | Appraiser A | Appraiser B | Appraiser C | All |
|---|---|---|---|---|
| Within appraiser | 28/30 (93%) | 25/30 (83%) | 29/30 (97%) | — |
| Vs reference (both trials) | 27/30 (90%) | 23/30 (77%) | 28/30 (93%) | — |
| Between appraisers (all agree, both trials) | — | — | — | 21/30 (70%) |
| All vs reference | — | — | — | 20/30 (67%) |
| Fleiss' kappa vs reference | 0.80 | 0.53 | 0.87 | 0.72 |

**Unacceptable** between appraisers and overall. Every one of B's nine disagreements, and
five of the between-appraiser disagreements, is the same item type: the GL code is a valid,
plausible code but not the one the contract specifies. The definition says "does not match
the purchase order," and the PO does not carry a GL code — so "match" was undefined, and B
had reasonably been treating any valid code as a match. The definition, not B, was the
cause.

**What was done:** definition v2 adds "GL coding must equal the code on the vendor contract
schedule (link); a valid but different code is a correction." The contract schedule is
now one click from the entry screen. Ten-minute walkthrough of the six borderline items
with all three clerks.

**Study 2, same 30 items, a week later:** within 29–30/30 for all three; vs reference
28–29/30; between all 27/30 (90%); all vs reference 27/30 (90%); overall kappa 0.86.
**Acceptable.**

**Consequence for the baseline (data ethics):** the baseline had been counted under
definition v1. Because the definition changed, the Q2 baseline was **re-scored under v2**
by the reference panel on a random 300-invoice sample before any pilot comparison; the
correction rate under v2 was 10.4% against 9.8% under v1. The A3 shows both numbers, the
date of the change, and that all pilot comparisons use v2 only.

---

## Common mistakes

- **Choosing parts inside the spec.** Parts that all sit near nominal make part-to-part
  tiny and %GRR huge; parts that span the process range show what the gauge can actually
  resolve. Pick across the range you see on the baseline chart.
- **Operators who do not measure in production.** The engineer with the best technique tells
  you nothing about the shift inspectors' method.
- **Un-randomized, un-blinded trials.** An operator who remembers the last reading repeats it.
- **Rounding.** A study on data rounded to the gauge's coarsest division reports the rounding
  as repeatability. Record every digit the gauge shows.
- **Reporting %GRR without saying against what.** Tolerance and study variation give
  different numbers; the 6σ vs 5.15σ multiplier changes them again. State both choices.
- **Treating "the system captures it" as an exemption.** Rubric M3: "we trust the system" is
  not a reason. Audit the timestamp; check what writes the field.
- **Retraining the appraiser when the definition was the problem.** Look at the
  disagreements by item first. In the example, retraining B to definition v1 would have
  reproduced the failure with a different person.
- **Fixing the definition and keeping the old baseline.** The definition changed, so the
  baseline is re-scored. Changing an operational definition between before and after without
  re-scoring ends the review.
- **Hiding a failed study.** The failed study, the diagnosis, and the re-run are the M3
  evidence. A first-try 8% GRR with no story invites the reviewer to ask how the parts were
  chosen.

*v1.0 · 2026-09-20*
