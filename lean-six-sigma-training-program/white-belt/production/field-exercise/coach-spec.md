# See a Waste — Rubric Coach Specification

*Instant, private, formative feedback while the learner drafts. The verdict stays human.*

**Built form:** [`index.html`](index.html) · **Rubric it serves:**
[`../../field-exercise-rubric.md`](../../field-exercise-rubric.md) · **Form it replaces on
screen:** [`../../templates/see-a-waste.md`](../../templates/see-a-waste.md)

---

## 1. What the coach is, and is not

The coach reads the draft as the learner types and says, next to each field, what a
calibrated reviewer would say first — *"this names a person; describe the process instead,"*
*"you haven't said who it affects."* It is the published rubric, made conversational, at the
moment it is useful.

| The coach does | The coach never does |
|---|---|
| Points at the rubric dimension a draft is weakest on | Scores a submission or predicts a score |
| Names the specific pattern it saw (a cause, a solution, an absolute) | Blocks submission for anything but the Stage 1 completeness checks |
| Offers the rewrite move, not the rewrite | Writes the learner's observation for them |
| Shows a worked example for the learner's vertical and role | Shows the learner's text to anyone |
| Reports *which flags fired* to the program, in aggregate | Transmits the draft text |

The certification decision is the two-stage review in the rubric, unchanged: a completeness
gate, then a calibrated human on the sampled or corporate-reviewed share. The coach's read
is labeled on screen as **"Coach's read — not a score."** That line is not optional and not
restylable.

## 2. The rules

Rule-based, deterministic, inspectable. Every rule maps to a rubric dimension and carries
the learner-facing message verbatim. Advisory unless marked **gate** (Stage 1).

### Box 1 — Where (D1 Real and specific)
| Code | Fires when | Message |
|---|---|---|
| W1 **gate** | fewer than 3 words | Name the process and where it happens. |
| W2 | no place or step word (desk, line, cell, ward, station, shift, queue, inbox, system name, room, bay…) | Where would a camera stand? Add the place or the step. |

### Box 2 — What I observed (D1, D2)
| Code | Fires when | Message |
|---|---|---|
| O1 **gate** | fewer than 2 sentences or 25 words | Describe what you'd see on video — at least two sentences. |
| O2 | blame pattern: named person or group + negative trait; "they/he/she never/always"; second-person accusation; "doesn't care", "lazy", "sloppy", "incompetent", "useless" | This names or blames a person or group. A camera can't see attitude — describe what it would see instead. |
| O3 | cause pattern: "because", "due to", "caused by", "the reason is", "as a result of", "since [clause]" | You've written a cause. At this level an observation records what happens; the "because" is Yellow Belt work. Keep the fact, drop the reason. |
| O4 | solution pattern: "should", "need(s) to", "we could", "if only", "just buy/install/hire", "ought to" | That's a solution. Keep it for box 6, offered as a hypothesis. |
| O5 | absolute: "always", "never", "every time", "constantly", "all the time" | Absolutes read like a complaint. Try a count: "about three times a shift." |
| O6 | vagueness: "a lot", "lots of", "too much", "often", "sometimes", "takes forever" with no number anywhere in the box | Can you put a rough number on that? Even "about" counts. |
| O7 (positive) | a number, time or frequency word present and no O2–O5 fired | Good — this has a count. A reviewer can picture it. |

### Box 3 — Which waste (D3 Waste correctly identified)
| Code | Fires when | Message |
|---|---|---|
| K1 **gate** | none selected | Name at least one waste from DOWNTIME. |
| K2 | walking/searching/clicking/reaching words in box 2 and **Transportation** ticked without **Motion** | Walking, searching, clicking is the *person* moving — that's Motion. Transportation is the work item moving. |
| K3 | moved/sent/carried/forklift/cart/transferred/emailed-to words and **Motion** ticked without **Transportation** | The *work item* is moving here — that's Transportation. Motion is the person. |
| K4 | wait/waiting/idle/queue/on hold and **Waiting** not ticked | Someone or something waits in this observation. Consider Waiting. |
| K5 | rework/wrong/error/mistake/redo/reprint/returned/corrected and **Defects** not ticked | Something came back or was redone. Consider Defects. |
| K6 | pile/backlog/stack/inbox full/queue of/waiting to be and **Inventory** not ticked | Work is piling up between steps. Consider Inventory. |
| K7 | retype/re-enter/twice/again/double/print and type/copy into and **Extra-processing** not ticked | The same work is being done twice. Consider Extra-processing. |
| K8 | 5 or more categories ticked | Five wastes at once is usually a sign of a vague observation. Which two would you defend to a reviewer? |

K2–K7 suggest; they never untick or tick anything.

### Box 4 — Who it affects (D4 Impact named)
| Code | Fires when | Message |
|---|---|---|
| A1 **gate** | empty | Say who is affected and how. |
| A2 | only "the company / the business / management / everyone / the organization" | "The company" is nobody in particular. Who receives this step's output — the next person, the patient, the customer? |
| A3 | a party named but no effect word (delay, wait, late, error, rework, cost, risk, chase, call back, frustrat-, minutes, hours, days, overtime) | You've named who. What do they experience — delay, rework, risk, cost? |

### Boxes 5 and 6 — optional
| Code | Fires when | Message |
|---|---|---|
| S1 (positive) | box 5 contains a number | A rough size makes this actionable. |
| I1 | box 6 phrased as a demand ("must", "should", "need to", "has to") | Offer it as a hypothesis: "I wonder if…" A demand invites a defense; a hypothesis invites a test. |

### Cross-field
| Code | Fires when | Message |
|---|---|---|
| X1 | box 2 is a near-copy of the on-screen worked example (≥ 60% shared 4-grams) | This is close to the worked example. Reviewers see the example too — write yours. |

## 3. The readiness strip

Four cells, D1–D4, each reading **"looks ready"** or **"needs work"** from the rules above
(a dimension is "needs work" while any advisory rule for it is firing). Under the strip, in
the same type size: *Coach's read — not a score. A calibrated reviewer decides.* No numbers,
no percentages, no colors that read as pass/fail.

## 4. Behavior

- Runs on every keystroke, debounced 400 ms; messages appear in a polite live region so a
  screen-reader user hears the newest message once, not on every keystroke.
- Messages sit under the field they concern, in the same order as the rules.
- No rule fires before the learner has typed in that box (no wall of red on an empty form).
- All drafts are saved on the device. Nothing leaves it until **Submit**.
- The Stage 1 gates block submission with the rubric's exact messages and move focus to the
  first failing field. Advisory rules do not block. The O2 blame flag, if still firing at
  submission, routes the submission to 100% human review (rubric §1) and tells the learner so.
- Worked example: picked by the learner's vertical and role, in a panel the learner opens;
  never pre-filled into the form.

## 5. What the program learns from the coach (and what it does not)

On submit, one xAPI `submitted` statement carries: waste categories chosen, review path,
and **the set of coach rule codes that fired at any point and whether each was clear at
submission.** The text is never included. That set is the program's teaching signal:

- O2 firing on > 20% of submissions in a cohort → Module 12's fairness teaching is not
  landing; content review (rubric §1 already triggers this on reviewer findings).
- K2/K3 firing often → Module 6's Motion-vs-Transportation distinction needs a better Show.
- A3 the most frequent flag, as the rubric predicts → confirms the reviewer guidance; if it
  is *not* the most frequent, the rules or the rubric are wrong somewhere, and that goes on
  the improvement board.

Flag rates are published on the outcomes page as a course-quality figure, by rule code,
once n ≥ 50.

## 6. Why rules, not a language model

A rule the learner trips is a rule they can read, in this document, and disagree with by
pulling the cord. A model's opinion cannot be published, calibrated against the reviewer
anchor set, or audited when a learner appeals. If a model is ever used for phrasing, it
will be behind the same rules, its suggestions labeled as suggestions, and the rule set
here still decides what fires. The verdict stays human either way.
