# The Program's Own Improvement Board

*A Lean training that practices Lean on itself, in public.*

Every problem reported with the course, every content change and every PDCA cycle on the
program is visible here, with a status, an owner role and a reason. The course already
teaches that a gallery without statuses is a suggestion box; this board holds the program to
the same rule it sets for clients.

**Published at:** the program's public pages (prototype:
[`public/index.html`](public/index.html)). **Feeds from:** the in-course andon cord, learner
L1 free text, reviewer notes, the change log.

---

## 1. The andon cord

Every built module carries a control labeled **"Pull the cord"** — report a problem with this
screen. It is one field ("What's wrong, in your words") plus the screen ID captured
automatically. Nothing else is asked. It emits an xAPI `reported` statement carrying the
screen ID and the free text, and posts to the board queue as `new`.

Rules copied from the shop floor:
- **Pulling the cord is never wrong.** A report that turns out to be a misunderstanding gets
  the status `noted — content clarified` or `noted — not a problem, here's why`, never a
  dismissal.
- **Response cadence is published:** every report reaches `read` within 5 working days and a
  triage status within 15. The board shows the current median. If the program cannot keep
  that cadence it says so on the board, which is the same demand it makes of rollout clients.
- **Reporters are anonymous on the board** by default (initials on request). Their text is
  shown lightly edited for names and identifiers only.

## 2. Statuses (identical to the client observation gallery, on purpose)

`new` → `read` → triaged as one of:

| Status | Meaning | Must carry |
|---|---|---|
| `just-do-it` | Fixed in the next content push | Change-log reference once shipped |
| `PDCA` | A content change is being trialed with a cohort before it is adopted | Plan, the cohort, the check date, the decision |
| `escalated to review` | Needs the assessment lead or an expert review (BoK accuracy, cut score, accessibility) | Reviewer role and due date |
| `noted, not now` | Real, deferred, with the reason | The reason, in one sentence, and the next review date |
| `noted — not a problem, here's why` | Investigated, course is right, explanation owed | The explanation |

An item `new` for more than 30 days is a published failure and is counted on the outcomes
page as such.

## 3. PDCA on content

Content changes bigger than a typo run as recorded PDCA cycles, because the program says
this is how improvement should be done and would be embarrassed to be caught doing
otherwise:

- **Plan:** the problem (linked report or evaluation finding), the hypothesis, the measure
  that would show it worked (an L1 item, an item statistic, a submission-quality rate).
- **Do:** the change, shipped to one cohort or one vertical first where possible.
- **Check:** the measure, read after the cohort closes. Reported honestly, including "no
  detectable difference."
- **Act:** adopt, adjust, or revert, with a change-log entry either way.

## 4. Seeded board

The board opens with the program's real history rather than a blank page. These are the
cycles that have actually run on the White Belt content to date, with their current status.

| # | Reported by | Problem | Status | Outcome / reason |
|---|---|---|---|---|
| 1 | Assessment review | Cut scores set by convention; retake policies impossible against bank sizes | `just-do-it` ✓ | Assessment policy written; White Belt bank 30 → 80, Yellow 44 → 140; retake overlap ≤ 25% — change log 2026-09-19 |
| 2 | Assessment review | White Belt badge claimed an "applied exercise" with no human check behind it | `just-do-it` ✓ | Rubric, two-stage review, 10% / 100% sampling, calibration set |
| 3 | Training-authority review | Yellow Belt skills matrix promised competencies no unit taught | `just-do-it` ✓ | Unit 3 split; Unit 5 kaizen and change content; matrix reconciled |
| 4 | Training-authority review | Workshops overran into the debrief | `just-do-it` ✓ | Both workshops 90 → 120 min with "protect the debrief" rule |
| 5 | Author (self-report) | Module 1 page read as generic e-learning; nothing distinguished it | `just-do-it` ✓ | Redesigned in shop-floor visual language (andon strip, floor tape, hazard stripe) |
| 6 | Author (self-report) | Narration at 185 wpm too fast for instruction | `PDCA` ✓ adopted | Re-synthesized at 163 wpm speech-only; check: within the 140–170 instructional band; adopt |
| 7 | LSS expert review | 94/6 misattributed to Deming's Japan work; special cause defined as "one person" | `just-do-it` ✓ | Attribution corrected to *Out of the Crisis* (1986); special cause redefined; Red Bead and Point 8 added — change log 2026-09-19 |
| 8 | Author (self-report) | Learners finish awareness courses with no real observation of their own | `just-do-it` ✓ | Twelve go-look tasks and the process dossier added to every module |
| 9 | Program | Cut score is provisional (70%) until a modified-Angoff panel sits | `noted, not now` | Panel needs ≥ 8 SMEs and the first cohort's item statistics; review date: first cohort close |
| 10 | Program | No empirical item statistics; bank has never met a learner | `noted, not now` | Resolved by the first 200 completions; nothing to do before then |
| 11 | Program | Accessibility gate has been run on the prototype, not on a screen reader with a real user | `escalated to review` | Screen-reader pass with an assistive-technology user before launch; owner: production lead |
| 12 | Program | Narration is a synthesized voice | `noted, not now` | Disclosed in every module footer; studio recording drops in without code changes; decision at first paid cohort |

## 5. Who owns the board

The content operations role (style guide §8) owns cadence and statuses. The assessment lead
owns anything `escalated to review`. Nobody may close an item without the outcome sentence.
The board is reviewed in the same quarterly meeting as reviewer calibration.
