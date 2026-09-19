# Workshop 2 — Root-Cause Simulation (Facilitator Guide)

**Duration:** 120 minutes, live virtual (extended from 90 on review — five rounds plus a
debrief do not fit in 90 without cutting the debrief, which is where the learning lands) ·
**Class size:** 8–24 (teams of 4–6)
**Prerequisite for attendees:** Units 3 & 4 complete; each brings one real problem statement
drafted in Unit 4.
**Facilitator:** certified program instructor (GB+); producer above 16.

**Workshop outcomes.** Every attendee (1) runs the full Yellow Belt root-cause sequence —
problem statement → fishbone → 5 Whys → verification plan — on a simulated failure under
time pressure, (2) experiences *being wrong confidently* and getting corrected by evidence,
(3) leaves with their own real problem statement peer-graded against the rubric.

## The simulation: "The Late Trucks of Meridian Foods"
A packaged scenario with an **engineered ground truth** the teams must uncover. (Vertical
variants exist — "The Missing Meds of Ward 6," "The Bouncing Invoices of Corvus Insurance" —
identical mechanics, reskinned evidence packs. This guide narrates Meridian.)

**Setup given to teams:** Meridian's distribution center has missed its 7:00 am truck
departure 14 times in the last 30 days (baseline: 2–3 misses/month historically). Customer
fines are mounting. The site manager is sure it's "the new warehouse crew being slow" and
wants overtime approved.

**Engineered ground truth (FACILITATOR ONLY):** a label-printer firmware update 5 weeks ago
slowed batch label printing from ~4 to ~19 minutes; picking now starts late on exactly the
truck lanes whose pick lists print in the second batch; the "slow new crew" actually has
normal pick rates once started. A red-herring trail (two new hires started around the same
time; one genuinely slow picker who was also slow last year) is planted to reward teams that
check evidence and punish teams that vote with the site manager.

**Evidence pack** (cards/boards revealed only on request — this is the core mechanic):
~20 evidence cards including: departure log with timestamps, pick-start times by lane,
pick rates by employee (this month AND last quarter), label print job logs, maintenance/
change log (firmware entry buried among routine items), crew roster with start dates,
security footage summary, shift supervisor interview notes (confidently blames the crew),
printer vendor bulletin. Teams "spend" limited **investigation tokens** (8 per team) to
flip cards — forcing prioritization, mimicking the real cost of verification.

## Run of show

### 0:00–0:10 — Setup & the trap
- Frame: *"Today you'll feel the pull of a confident wrong answer. Your job is to let
  evidence, not seniority, decide."*
- Present the scenario + the site manager's theory. Quick poll: "How plausible is the crew
  theory, gut-only, 1–5?" (Save results — revisited at close.)
- Teams formed; rules: 8 tokens, any card may be requested, facilitator answers only what
  the card says.

### 0:10–0:22 — Round 1: Problem statement (12 min)
Teams draft the problem statement from the scenario brief. Then facilitator shows three
candidate statements — one clean, one with smuggled cause ("because the new crew…"), one
vague ("trucks are always late lately") — teams self-grade theirs against the rubric.
**Checkpoint:** every team must have a cause-free, quantified statement before tokens
unlock. (The scenario brief contains all numbers needed.)

### 0:22–0:50 — Round 2: Fishbone & the token hunt (28 min)
- Teams build a fishbone (board pre-framed with service-variant bones) — minimum 3 bones
  populated, causes as **checkable statements**.
- Teams then rank their top 3 suspicions and start spending tokens to flip evidence cards.
- **Facilitator floats with two jobs:**
  1. Enforce checkability — "'crew morale is low' — what card would prove or disprove that?"
  2. Watch token strategy without steering. Teams that blow 5 tokens confirming the crew
     theory (pick rates, roster, footage) discover the rates are *normal* — expensive,
     instructive. Teams that ask "what changed ~5 weeks ago?" find the change log fast.
     **Do not rescue early.** The pain is the product.

### 0:50–1:15 — Round 3: 5 Whys to ground truth (25 min)
- Each team drills its best-supported suspicion: every "because" must cite a flipped card
  or request a new flip (tokens still finite).
- Chains that stop at "because the crew is slow" get the guardrail question: *"Is that a
  fact you've checked, or the site manager's theory wearing a badge?"*
- Target chain: departures late → picking starts late on lanes X/Y → pick lists print in
  batch 2, printing takes 19 min → printing slowed after firmware update → **actionable
  cause:** untested firmware change altered batch print time; no change-verification step
  exists for shared equipment.
- Teams write: (a) the verified chain, (b) the countermeasure they'd propose, (c) — the
  step that separates Yellow Belts from meeting-attenders — **the verification they'd run
  BEFORE claiming victory** (e.g., roll back / reprint test and time it; predict departure
  recovery; watch 2 weeks of departures).

### 1:15–1:40 — Debrief: the anatomy of a wrong certainty (25 min)
- Reveal ground truth + full evidence map. Teams narrate their token trail — where they
  spent, what misled them, what one card would have saved them.
- Re-run the opening poll question. The gap between the gut poll and the truth **is** the
  lesson; say it plainly: *"The crew theory was free, confident, senior — and wrong. It
  also came with a countermeasure (overtime) that would have cost money and fixed nothing
  while the real cause kept firing."*
- Name the transferable patterns: "what changed, and when?" as the highest-value early
  question; people-theories demand the same evidence as machine-theories; the slow picker
  who was always slow is *common cause* wearing a villain costume (tie back to Unit 3
  tampering).

### 1:40–2:00 — Transfer to reality (20 min)
- Pairs: exchange the **real problem statements** brought from Unit 4; grade each other
  against the rubric (2 min each way); rewrite on the spot.
- Each attendee writes their own next verification step: *"For my problem, the first thing
  I will go check is ___, by ___."* Posted to the cohort channel — instructors follow up
  on these during mini-project coaching.
- Close: mini-project logistics reminder (Unit 5.4), office hours, and the storyboard's
  root-cause section now has a lived reference point.

## Facilitator notes & failure modes
- **A team solves it in 15 minutes** (someone asks for the change log immediately): don't
  flatten them — promote them to *adversarial reviewers*: "Prove it's NOT the crew. What
  evidence would falsify your own theory?" Falsification practice is the advanced lesson.
- **A team refuses to abandon the crew theory even after the rate cards:** let them present
  it in the debrief and have the room, not you, ask the questions. Handle with warmth —
  the room's own poll made the same call at 0:07.
- **Token hoarding** (analysis paralysis, 6 tokens left at 1:00): inject urgency in
  character — "the site manager is approving overtime at the top of the hour unless you
  bring something better."
- **Protect the debrief.** If rounds overrun, cut round 3 short at 1:15 and reveal ground
  truth on schedule; a team that hasn't finished its chain learns *more* from the reveal,
  not less. Never compress the debrief or the transfer block.
- **Virtual logistics:** evidence cards as locked frames the producer duplicates into team
  boards on request; keep a visible token tracker per team; breakout audio must be stable
  before round 2 — the token mechanic dies if requests lag.
- **Corporate cohorts:** offer the vertical variant matching their industry, but consider
  deliberately using an *off-vertical* scenario — teams import fewer pet theories into an
  unfamiliar domain, and the mechanics land cleaner. Facilitator's call; note it in the
  cohort report either way.
