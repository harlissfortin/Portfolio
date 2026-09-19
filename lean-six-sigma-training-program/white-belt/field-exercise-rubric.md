# "See a Waste" Field Exercise — Scoring Rubric & Review Policy

The White Belt badge claims an **applied exercise**. This rubric is what makes that claim
defensible. Every submission passes an automated completeness check; a defined share is
then scored by a human against this rubric.

**Governed by:** [`../assessment/standard-setting-and-item-policy.md`](../assessment/standard-setting-and-item-policy.md)
**Form:** [`templates/see-a-waste.md`](templates/see-a-waste.md)

---

## 1. Two-stage review

### Stage 1 — Automated completeness gate (100% of submissions)
Blocks submission until all are true. These are *completeness* checks, not quality
judgments, and the learner sees the specific failure.

| Check | Rule | Learner-facing message |
|---|---|---|
| Where | Non-empty, ≥ 3 words | "Name the process and where it happens." |
| Observation | ≥ 2 sentences, ≥ 25 words | "Describe what you'd see on video — at least two sentences." |
| Waste named | ≥ 1 DOWNTIME category selected | "Name at least one waste from DOWNTIME." |
| Affected party | Non-empty | "Say who is affected and how." |
| Blame screen | Flags second-person accusation patterns and named-individual + negative-trait pairs for learner self-review (advisory, non-blocking) | "This reads like it names a person rather than the process. Re-read the fairness self-check before submitting." |

### Stage 2 — Human rubric review (sampling)

| Deployment | Review coverage |
|---|---|
| Individual / open enrollment | **10% random sample**, scored by a certified reviewer. Plus 100% of submissions flagged by the blame screen. |
| Corporate rollout | **100%**, scored by the client's internal CI lead or a program reviewer (this is contracted at rollout; it is also the client's problem inventory, so they want to read them). |
| Audit | Annual re-review of 5% of previously passed submissions, per the program audit policy. |

Sampling is **not** grading-by-luck: a sampled submission scoring 0 on any dimension
triggers coaching and a resubmission request for that learner, and three or more such
findings in a 100-submission window triggers a content review of Module 12 — the assumption
is that a pattern of weak submissions is a teaching failure, not a learner failure.

---

## 2. The rubric

Four dimensions, each **0 / 1 / 2**. **Pass = 5/8 with no dimension at 0.**
White Belt is an awareness credential; the bar is "a real, usable observation," not
analytical sophistication.

### D1 — Real and specific
| | |
|---|---|
| **0** | Hypothetical, generic, copied from course examples, or not from a process the learner touches |
| **1** | Real but vague — could describe any workplace ("there's a lot of waiting in my area") |
| **2** | Real, specific, located: a named process, place, and recognizable moment |

### D2 — Observational, not judgmental
| | |
|---|---|
| **0** | Blames a person or group; or asserts a cause as fact ("because IT never fixed it") |
| **1** | Mostly factual but drifts into interpretation or a hinted culprit |
| **2** | Reads like a camera recorded it; a person involved would agree it is fair and accurate |

### D3 — Waste correctly identified
| | |
|---|---|
| **0** | No plausible relationship between the observation and the category chosen |
| **1** | Defensible but imprecise (e.g., "motion" for a work item being transported) |
| **2** | Category (or categories) fit the observation; multiple wastes named where several genuinely apply |

### D4 — Impact named
| | |
|---|---|
| **0** | No statement of who is affected, or "the company" with nothing concrete |
| **1** | An affected party named, effect vague ("it's frustrating") |
| **2** | Names the customer of that step — internal counts — and what they experience (delay, error, rework, risk, cost) |

**Not scored:** the optional size estimate and the optional idea. They are encouraged and
never penalized, including when the idea turns out to be wrong — at this level an idea is a
hypothesis offered in good faith. A reviewer may comment on them but may not deduct.

---

## 3. Reviewer guidance

- **Score the observation, not the writing.** Grammar, spelling, and English fluency are
  not dimensions. A three-line observation from a shop-floor operator that locates a real
  problem scores 2/2/2/2; a polished paragraph that blames the night shift scores 0 on D2.
- **The most common real failure is D4**, not D2 — learners describe the waste well and
  forget to say who it hurts. Coach it; it is the habit that makes their Yellow Belt
  problem statements work.
- **Resist upgrading "good stories."** A vivid observation that names a colleague is still
  a 0 on D2. That line is the entire reason the exercise is safe to run at scale.
- **Feedback format** (≤ 4 sentences): one thing this observation shows the learner can
  already do; the single highest-leverage improvement; and, where it applies, an explicit
  invitation — *"this problem looks bigger than one observation; here is what a Yellow Belt
  would do with it."* That last sentence is the program's progression pathway operating at
  its earliest point.
- **Escalation:** an observation that surfaces a safety hazard, a regulatory breach, or a
  patient/customer-harm risk is **not** handled in the feedback box. Follow the program
  escalation note (§5) the same day.

---

## 4. Calibration

- Reviewers score the **five-submission anchor set** before their first live review and
  again quarterly. The anchor set holds one exemplar per profile: clean 2/2/2/2; the
  blame-drift case; the vague case; the wrong-category case; and the safety-escalation case.
- Agreement standard: within 1 point of the anchor total on all five, with an exact match
  on every 0. A reviewer outside that re-calibrates with the assessment lead before
  scoring live submissions.
- Corporate CI leads acting as reviewers get the same calibration set as part of rollout
  onboarding — a client reviewer who has not calibrated is not a reviewer.

### Anchor set (abridged; full text with scores lives in the reviewer kit)

| Profile | Scores | The teaching point |
|---|---|---|
| Clean | 2/2/2/2 | Specific, camera-like, right category, internal customer named |
| Blame drift | 2/0/2/1 | Vivid and accurate about the process *and* names a shift as the cause — D2 = 0, fails |
| Vague | 1/2/1/0 | Honest and fair but could be anyone's workplace; no one named as affected |
| Wrong category | 2/2/0/2 | Excellent observation of a worker walking, filed as "transportation" with no plausible link to the work item moving |
| Escalation | — | Observation reveals an unguarded machine; scored normally *and* escalated same day |

---

## 5. Escalation note (reviewers and CI leads)

If a submission describes an imminent safety hazard, a regulatory or patient-safety breach,
or conduct that would harm a person: do not reply in the feedback box, do not post it to the
observation gallery, and route it the same day to the client's named safety/compliance
contact (captured in the rollout agreement) or, for individual learners, reply advising the
learner of their own organization's reporting channel. Log the escalation. The learner is
thanked for surfacing it, always — a program that penalizes the first person to report a
hazard has taught the opposite of what it claims to teach.
