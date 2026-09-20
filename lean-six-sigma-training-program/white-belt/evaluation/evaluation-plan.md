# White Belt — Evaluation Plan

What we measure, how, and what we do when the numbers are bad. Four levels
(Kirkpatrick/Phillips framing), with the honest constraint stated up front: **White Belt can
carry Levels 1 and 2 rigorously, Level 3 partially, and Level 4 only as an attributed
estimate.** Claiming more than that from a 3.5-hour awareness course is how training vendors
lose the room with a CFO.

---

## Level 1 — Reaction

**Instrument:** 8-item post-course survey, in-course (not emailed — email surveys return 15%
and skew positive). Five-point agreement scale plus two free-text.

| # | Item |
|---|---|
| 1 | I can now name the eight wastes and spot them in my own work |
| 2 | The examples felt relevant to the work I actually do |
| 3 | The course respected my time |
| 4 | I understood what was being asked of me at every point |
| 5 | I believe it is safe to report the problems I observe here |
| 6 | I believe something will be done with what I reported |
| 7 | I would recommend this course to a colleague |
| 8 | The course was accessible to me (captions, keyboard, screen reader, language) |
| F1 | What one thing would you change about this course? |
| F2 | What is the one problem you most want someone to fix? |

**Items 5 and 6 are the ones that matter** and they are not really about the course — they
measure the client's culture and the rollout's credibility. They are reported to the sponsor
verbatim, by department, because a department scoring 2.1 on item 6 has a management problem
that no amount of training will touch.

**Thresholds:** items 1–4, 7 ≥ 4.0 mean. Item 8 ≥ 4.5 with any score ≤ 3 triggering an
individual accessibility follow-up within 2 business days. Items 5–6 have no pass threshold —
they are diagnostic, and a low score triggers a conversation with the sponsor, not a content fix.

## Level 2 — Learning

**Instruments:** the 10-item pre-assessment (PRE pool) before Module 1; the 20-item knowledge
check after; the five cumulative checks in-course; and the field exercise scored on the rubric.

| Metric | Target | Action if missed |
|---|---|---|
| Mean pre/post gain | ≥ 30 percentage points | Investigate whether the pre-test is too easy (ceiling) before assuming a teaching failure |
| First-attempt knowledge-check pass rate | 75–90% | **Above 95%: the exam is too easy** — raise item difficulty, not the cut score, and re-run the Angoff. Below 65%: content or item review |
| Cumulative-check accuracy (spaced retrieval) | ≥ 70% on re-tested items | Below that, the earlier module needs rework — this is the metric that catches shallow learning that the end-of-module checks miss |
| Field exercise pass rate on sampled review | ≥ 90% | Below 85%: treat as a Module 12 teaching failure first, per the rubric's pattern rule |
| Per-item statistics | Per assessment policy §4 | Retire/rewrite flagged items quarterly |

Pre/post gain is reported per cohort, never per learner to a manager.

## Level 3 — Behavior

What a White Belt is supposed to *do* differently is narrow and therefore measurable:
surface problems, in usable form, and keep doing it.

| Metric | Source | Target |
|---|---|---|
| % of completers submitting a usable observation (rubric ≥ 5/8) | Field exercise review | ≥ 90% |
| **% who submit a second, unprompted observation within 90 days** | Observation gallery | ≥ 15% — the single best behavior-change indicator this level has |
| % of observations naming an internal customer (D4 ≥ 1) | Rubric scores | ≥ 85% |
| % of completers recording ≥ 9 of 12 go-see dossier entries | `responded` completion flags (text never transmitted) | ≥ 70% — below this the go-see tasks are being skipped and the transfer claim is not earned |
| 90-day pulse: "Since the course, have you raised a process problem at work?" | 3-item pulse survey at day 90 | ≥ 50% yes |
| Yellow Belt progression rate | Enrollment data | Tracked, not targeted (it is a commercial metric, not a learning one) |

The 90-day pulse also asks *"was it acted on?"* — which measures the client, and is the
leading indicator of whether the second-wave rollout will work.

## Level 4 — Results (stated honestly)

White Belt does not produce validated financial results, and the program says so.
What it produces and can defend:

| Claimed outcome | Evidence basis | How it is labeled |
|---|---|---|
| A documented inventory of process problems | Observation count and theme clusters | Fact |
| Local fixes closed from observations | Client triage log (`just-do-it` closed) | Fact — count, with named examples |
| Estimated annualized time or cost of closed local fixes | Learner-reported frequency × duration | **"Estimate, learner-reported, not Finance-validated"** on every surface |
| Qualified project pipeline for Yellow/Green | Theme clusters with sponsors identified | Fact — pipeline, not savings |
| Culture indicators | L1 items 5–6, 90-day pulse, second-observation rate | Fact — survey data, reported as such |

**Attribution discipline:** improvements delivered by a Yellow or Green Belt project that
originated in a White Belt observation are credited to the project, with the observation noted
as the origin. Double-counting the same savings at two belt levels is the most common way
training ROI claims get destroyed in an audit, and it is prohibited here.

## Program-level aggregation (the transparency asset)

These roll up into the published outcome page that the market-differentiation strategy
depends on, reported annually with the cohort count and the period:

- Completion rate; first-attempt pass rate; mean pre/post gain
- Field exercise pass rate on sampled review, and the sampling rate itself
- % of cohorts meeting the readiness gate at launch (published — it shows we enforce it)
- L1 means for items 1–4 and 7, and the range on items 5–6
- Second-observation-within-90-days rate

Publishing the pass rate and the sampling rate is what makes the rest of the numbers
believable. A program that publishes a 99% pass rate has told the market its exam is
decorative.

The published page itself — slots, definitions, minimum n per figure, and the honest
launch state at n = 0 — is specified in
[`../../program-operations/outcomes-page.md`](../../program-operations/outcomes-page.md)
(prototype: [`../../program-operations/public/index.html`](../../program-operations/public/index.html)).
Two additions to the list above: coach flag rates by rule code (course-quality signal) and
the program's own improvement-board cadence.

## Review cadence

| When | What happens |
|---|---|
| Per cohort | L1 and L2 summary to the sponsor; accessibility follow-ups closed |
| Monthly | Item statistics reviewed; flagged items to the assessment lead |
| Quarterly | Reviewer calibration; content change decisions from F1 free-text themes |
| Annually | Full content review against the BoK crosswalk; published outcome page updated; Angoff re-run if > 30% of the bank has turned over |
