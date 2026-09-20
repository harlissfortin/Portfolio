# Published Outcomes Page — specification

*The numbers a buyer would have to take on trust from any other program, published.*

This page is the homepage-level asset the differentiation strategy depends on. It shows the
program's own results, with definitions and sample sizes, in the honest state they are in —
including, at launch, "no cohorts yet."

**Prototype:** [`public/index.html`](public/index.html) · **Data source:** the evaluation
plan's program-level aggregation · **Cadence:** updated quarterly; each figure carries its
period and n.

---

## 1. What is published, per level

| Figure | Definition | Minimum n to publish | Why a buyer should care |
|---|---|---|---|
| Completion rate | Learners who completed all modules ÷ learners who started Module 1, within 90 days of enrollment | 50 starts | Whether people finish |
| First-attempt pass rate | Passed the knowledge check on attempt 1 ÷ all first attempts | 50 attempts | **A rate above 95% means the exam is decorative.** The program publishes this figure precisely because competitors cannot afford to |
| Eventual pass rate | Passed within the retake allowance ÷ all who attempted | 50 | With the first-attempt figure, shows how much the retakes carry |
| Pre/post gain | Mean post score − mean pre score on matched items, with the pre score | 50 matched pairs | Learning, not attendance |
| Applied-artifact pass rate | Rubric-passed ÷ rubric-reviewed | 30 reviews | Whether people can *do* it |
| **Sampling rate** | Human-reviewed ÷ submitted | always | The number that makes the previous one believable |
| Go-see completion | Learners recording ≥ 9 of 12 dossier entries (completion flags only) ÷ completers | 50 completers | Whether the workplace tasks are done, not skipped — the course's own transfer claim |
| Coach flag rates | Share of submissions where each coach rule fired, by rule code; the safety rule reported separately | 50 submissions | Which lessons are not landing; a rising blame-flag rate is a Module 12 problem, not a learner problem |
| Readiness-gate rate | Corporate rollouts launched with all four gate conditions met ÷ rollouts requested | 5 requests | Shows the program declines launches |
| Triage health | Share of observations still `new` after 30 days, corporate rollouts | 3 rollouts | Whether client organizations respond |
| Second observation within 90 days | White Belt holders submitting a second observation ÷ holders | 100 holders | Behavior change, the only awareness outcome that matters |
| Program board cadence | Median days from andon-cord report to triage status; items `new` > 30 days | always | We keep the rule we set for clients |
| Yellow Belt: verified improvement | Share of rubric-passed mini-projects with a checked, measured result | 30 projects | Application |
| Green Belt and above | Sponsor-verified impact per cohort, Finance-validated where required, with the attribution rule | per blueprint | The moat |

## 2. Rules

1. **Below minimum n, the figure is shown as "n = X, not yet reportable."** The slot is never
   hidden, because a hidden slot is indistinguishable from a bad number.
2. **Definitions are on the page**, one click from every figure, in the words above.
3. **No cohort or client is identifiable.** Figures are program-wide by level; by vertical
   where n allows.
4. **Nothing is annualized or extrapolated.** Periods are stated.
5. **The bad quarter is published.** A figure that gets worse is published with the same
   prominence and a one-line note linking to the improvement-board item that owns it.
6. **Estimates are labeled estimates**, per the evaluation plan's L4 discipline. White and
   Yellow Belt impact figures are learner-reported and say so.
7. The page carries the date of the last update and the name of the role that signed it off
   (assessment lead).

## 3. Launch state

At launch the page shows every slot above with `n = 0` and the sentence: *"This program has
not yet run a live cohort. These are the numbers we will publish, with their definitions.
The first update follows the first cohort's close."* That page goes live before the first
sale, not after the first good quarter.

## 4. What the page refuses to show

- Testimonials in place of numbers.
- "Satisfaction" as a headline figure (L1 is published, below the L2–L3 figures, with items
  5–6 shown as a range because they diagnose client culture, not the course).
- Any figure without its n and period.
- Pass rates without sampling and first-attempt rates alongside.
