# Content Authoring Style Guide

How every module, unit, item, and template in this program is written. Applies to program
staff, contracted instructional designers, and licensed facilitators authoring local material.

---

## 1. Voice

- **Second person, present tense, active voice.** "You collect the baseline before you change
  anything," not "a baseline should be collected."
- **Plain language, grade 9–10 reading level.** Jargon is defined at first use, then used
  consistently — never avoided. Learners need the vocabulary to be credible at work.
- **Respect the learner's intelligence and their time.** No filler, no throat-clearing
  ("In today's fast-paced business environment…"), no motivational padding.
- **Never condescend to the frontline.** The operator, nurse, and clerk in our examples are
  the most competent people in the room about their own work. Content that implies otherwise
  contradicts Module 1 and will be rejected in review.
- **No fear selling.** We do not sell with "companies that don't improve will die."

## 2. Examples

- **Every example is from one of the three verticals** (manufacturing/supply chain,
  healthcare, transactional/services) and is labeled as such.
- **Realistic numbers, honestly derived.** Elapsed-vs-value ratios, error rates, and cycle
  times are drawn from observed processes or published benchmarks, never invented for drama.
  If a number is illustrative, say so.
- **No one in an example is incompetent, lazy, or a villain.** Every failure traces to a
  design decision. Managers in examples are not caricatures either — they are people
  responding rationally to the system they inherited.
- **No real employer is named** without written permission and a final-cut approval.
- **No patient, customer, or employee data.** Ever, in any form, including "anonymized"
  screenshots.

## 3. Structure

- Modules and units follow **Hook → Teach → Show → Try → Takeaways**.
- **One idea per screen** in e-learning; one idea per paragraph in written material.
- Every module and unit states **behavioral learning objectives** at the top: "By the end,
  the learner can…" followed by an observable verb. Never "understand," "know," or
  "appreciate" — if it cannot be observed, it cannot be assessed, and if it cannot be
  assessed it is not an objective.
- Every unit ends with **Takeaways** (2–4 lines) and, where the spacing schedule requires,
  a **cumulative check** drawing on earlier units.
- Level scope is enforced by the skills matrix and the BoK crosswalks. Teaching a Green Belt
  tool inside a Yellow Belt unit is a defect, not generosity — belt inflation is on the
  program's own list of ways these businesses fail.

## 4. Assessment items

Governed by [`../assessment/standard-setting-and-item-policy.md`](../assessment/standard-setting-and-item-policy.md).
Authoring highlights: one best answer; four parallel options; no "all of the above"; scenario
items ask for a judgment, not a definition; contestable-overlap items require an explicit
discriminator in the stem; numerical items state their basis and units; every item carries its
full tag set before it can enter a bank.

## 5. Terminology (house standard)

| Use | Not | Why |
|---|---|---|
| Non-value-added | "Waste" as a technical classification in VA analysis | "Waste" is the DOWNTIME vocabulary; keep the two frames distinct |
| Necessary non-value-added | "Business value-added" | Clearer to learners; avoids implying the customer values it |
| Operational definition | "Clear definition" | It is a term of art and learners need it |
| Common cause / special cause | "Normal" / "abnormal" variation | Matches the literature learners will encounter |
| Control limits (from the process) / specification limits (from the customer) | Using "limits" alone | The conflation is the single most common statistical error at Yellow Belt |
| Countermeasure | "Solution" | Signals a tested response to a verified cause, not a fix chosen in advance |
| PDCA (noting Deming's PDSA) | PDCA silently | Accuracy; the acknowledgement costs one sentence |
| Master Black Belt | "Master black belt" / "MBB" on first use | Capitalize belt names; spell out before abbreviating |

## 6. Accessibility in authoring

Authors — not just developers — own these: meaningful heading structure; alt text drafted by
the author who knows what the image is *for*; no meaning carried by color alone; no
instruction that assumes a mouse ("drag the item" → "select the item, then select its
category"); tables with real headers; link text that describes its destination.

## 7. Review gates

Nothing ships without all three:
1. **SME review** — technical accuracy, level-appropriate scope, and BoK alignment.
2. **Instructional design review** — objectives observable, structure intact, interactions
   teach rather than decorate, spacing wired.
3. **Accessibility review** — the §6 items plus the production spec's testing gate for
   e-learning.

Assessment items add a **second SME** before entering a bank (policy §2).

## 8. Versioning

- Content files are versioned in git. Every substantive change carries a
  [`change-log.md`](change-log.md) entry.
- Learner-visible material carries a version and date in its footer.
- **Any change to assessment content, cut scores, or certification requirements** is logged
  with its rationale and its effective date, and cannot be applied retroactively to learners
  already in a cohort. Candidates are assessed against the requirements published when they
  enrolled.
