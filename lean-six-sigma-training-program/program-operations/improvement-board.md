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

**On the name.** On a production line the cord stops the line and brings a team leader
within seconds. This cord cannot stop anything, and it does not pretend to. What it keeps
from the original is the half that matters for a course: the report is acknowledged
immediately on screen, it is never wrong to pull, and a named role answers it in the open,
with a cadence you can check.

Rules copied from the shop floor:
- **Pulling the cord is never wrong.** A report that turns out to be a misunderstanding gets
  the status `noted — content clarified` or `noted — not a problem, here's why`, never a
  dismissal.
- **Response cadence is published:** every report reaches `read` within 5 working days and a
  triage status within 15. The board shows the current median. If the program cannot keep
  that cadence it says so on the board, which is the same demand it makes of rollout clients.
- **Reporters are anonymous on the board** by default (initials on request). Their text is
  shown lightly edited for names and identifiers only.

## 2. Statuses (identical to the client observation gallery, on purpose — the rollout
playbook §6 uses the same five)

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
| 8 | Author (self-report) | Learners finish awareness courses with no real observation of their own | `just-do-it` ✓ | Twelve go-see tasks and the process dossier added to every module |
| 9 | Program | Cut score is provisional (70%) until a modified-Angoff panel sits | `noted, not now` | Panel needs ≥ 8 SMEs and the first cohort's item statistics; review date: first cohort close |
| 10 | Program | No empirical item statistics; bank has never met a learner | `noted, not now` | Resolved by the first 200 completions; nothing to do before then |
| 11 | Program | Accessibility gate has been run on the prototype, not on a screen reader with a real user | `escalated to review` | Screen-reader pass with an assistive-technology user before launch; owner: production lead |
| 12 | Program | Narration is a synthesized voice | `noted, not now` | Disclosed in every module footer; studio recording drops in without code changes; decision at first paid cohort |
| 13 | Four-lens review (training / design / LSS / manufacturing) | The coach flagged the program's own worked examples ("accounts payable" had no place word; "twice" read as extra-processing; the healthcare example used "because") | `just-do-it` ✓ | Place vocabulary widened, count words excluded from K7, example rewritten; rule added: every worked example passes the coach clean |
| 14 | Four-lens review | Benchmark library named dossier entries as a data source, contradicting the rule that dossiers are never transmitted | `just-do-it` ✓ | Sources moved to Yellow Belt storyboards and the optional size box; dossier struck as a source |
| 15 | Four-lens review | No safety-hazard recognition in the coach, although the rubric escalates hazards the same day | `just-do-it` ✓ | H1 rule added (manufacturing and healthcare hazard vocabulary); submission path *escalate*; receipt tells the learner to use their site's channel today |
| 16 | Four-lens review | "Andon cord" overpromises — a real cord stops the line and brings a leader in seconds | `noted — not a problem, here's why` | The name stays; the board states plainly what the cord does not do, and keeps the half that matters: instant acknowledgment, never wrong to pull, a named role answers in the open |
| 17 | Four-lens review | "Go look" is the Lean practice of *gemba* / *genchi genbutsu* and should be taught by name | `just-do-it` ✓ | Renamed *go see* program-wide; glossary entry from Module 1; one CERT item added (E13) |
| 18 | Four-lens review | Readiness strip used green for "looks ready," which reads as pass/fail against the spec's own rule | `just-do-it` ✓ | Both states in ink; hazard stripe marks "needs work"; green reserved for the receipt |

## 5. Who owns the board

The content operations role (style guide §8) owns cadence and statuses. The assessment lead
owns anything `escalated to review`. Nobody may close an item without the outcome sentence.
The board is reviewed in the same quarterly meeting as reviewer calibration.
