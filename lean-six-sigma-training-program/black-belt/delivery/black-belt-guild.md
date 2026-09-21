# The Black Belt Guild

What happens after the reviewer of record signs. A Black Belt who stops practising loses the
skill inside two years — the fractional design they could write from memory in week 11
becomes a search, the restraint they learned in Module 4 becomes a habit of running whatever
the software offers. The guild is the program's answer: a community where the standard the
rubric set is kept in the hands of the people who earned it, where the next project has
somewhere to be argued about, where the coaching hours that lead to Master Black Belt
candidacy are logged as they are earned, and where the three-year recertification is met by
doing the work rather than by buying content.

Membership is automatic and free for every certified Black Belt of this program, from the
day the credential is issued. Companion documents: the
[instructor, reviewer and coaching system](instructor-reviewer-and-coaching-system.md)
(the coaching bench and the reviewer bench the guild feeds), the
[credential evidence policy](../../program-operations/credential-evidence-policy.md)
(consent and redaction for every story told in public), the
[terms of certification](../../program-operations/terms-of-certification.md) §9
(recertification), and the Green Belt
[facilitator and coaching system](../../green-belt/delivery/facilitator-and-coaching-system.md)
§5 (the community tier below this one).

---

## 1. What the guild is, and what sits behind a fee

| | Guild (free, every certified Black Belt) | Guild Plus (paid tier) |
|---|---|---|
| Peer project consulting circles (§3) | Yes — membership, chairing, the protocol, a Master Black Belt drop-in each quarter | — |
| Quarterly masterclasses (§2) | Recording, dataset and notebook, reflection form; CEUs on the reflection form | Live seat with the lab and the question session |
| Annual showcase (§4) | Attendance; story submission; a speaking slot for accepted stories | Priority speaking slot for accepted stories |
| Green Belt case clinics and tool AMAs | Yes, as at Green Belt; Black Belts are the usual chairs | — |
| Coaching bench and reviewer bench (§5) | Yes — paid *to* the member at the bench rate | — |
| Coaching for your own renewal project | At the bench rate, as capacity allows | Priority booking |
| Specialist micro-credential preparation workshops (§7) | — | Yes |
| Forum, versioned Black Belt template library with update notices, vertical case datasets, job board | Yes | — |

The rule the terms of certification set is repeated here so nobody has to look for it:
**nothing you need to recertify, to join the coaching bench, or to apply for Master Black Belt
candidacy sits behind Guild Plus.** The paid tier buys convenience and the live room; it never
buys a requirement. If a reviewer's feedback names a fork for you (§7), the route into that
fork is open on the free tier.

Forum and circle norm, as at every level: describe the process, never the person or the
employer. A story that names a client without the rollout agreement's permission is removed
and the member is told why, once.

## 2. Quarterly masterclasses

Four a year, three hours each, led by a Master Black Belt from the faculty or the Master
Black Belt council, on a dataset first and a slide second. Each follows the module pattern —
Hook, Teach, Show on one vertical's data, Try on the dataset in the room — and each ends
with the two things every method in this program ends with: the sentence you would tell your
sponsor, and when not to use it.

**Scope, stated so that it is not a defect.** The skills matrix places response surface
methods and simulation at *awareness* for a Black Belt and process mining at *practitioner*;
a Master Black Belt leads them. A masterclass does not change what the Black Belt credential
attests to. It is where an alumnus moves from awareness toward practice on a topic they have
met, with a Master Black Belt beside them, and it is the natural preview of the Master Black
Belt fellowship for those heading that way. Nothing in a masterclass appears on the Black
Belt exam.

| Quarter | Masterclass | What you leave able to do | The "when not to" |
|---|---|---|---|
| Q1 | **Response surface methods, deep-dive** | Take a factorial with significant curvature at the center points, augment it to a central composite design, fit the second-order model, read the contour and the ridge, and state an operating window with its confidence region | When the factorial already found a flat optimum; when the process cannot hold the axial points; when the response is attribute and the sample sizes make the model a decoration |
| Q2 | **Simulation modeling** | Build a Monte Carlo model of a benefit case or a capacity plan from stated distributions, and a discrete-event model of a two-station line or a clinic with arrivals, and read the outputs as distributions rather than point estimates | When Little's Law answers the question on one line; when the input distributions are guesses dressed as data; when the model is being built to end an argument rather than to design a process |
| Q3 | **Process mining and AI in continuous improvement** | Extract an event log from a transactional system, discover the as-run process, compare it to the as-designed map, and locate rework loops and waiting; decide what to improve, what to automate and what to leave alone; know what a machine-learning classifier can and cannot tell you about a cause | When the process has no reliable timestamps (the Module 2 provenance walk applies); when the discovered variant explosion is the measurement system, not the process; when a model predicts well and explains nothing — prediction is not verification, and ★ A2 is not earned by an algorithm |
| Q4 | **Rotating, chosen by the guild council** | The previous year's showcase stories decide it: the topic three or more stories wished they had known — DFSS/DMADV for a new process, mixture designs, short-run and multivariate SPC, benefits realization across a portfolio | Stated by the leader on the day |

*MFG example (illustrative), Q1.* A coatings line's certified project ended at a two-factor
operating window — line speed and oven temperature — with curvature flagged at the center
points and left there, honestly, at Tollgate 4 because the plant would not release the
line for more runs. The Q1 masterclass uses that project's twelve runs, with the member's
consent and the plant unnamed, adds the six axial and center runs the design would need,
and fits the second-order model. The room finds the optimum is not where the factorial's
corner was, and that the ridge runs along a speed–temperature trade-off the plant can choose
on cost. The sentence to the sponsor: "we can hold film thickness within specification at
either of two settings; the faster one costs 4% more gas." The when-not-to: if the plant
still will not release the line for six runs, the factorial's corner is the honest answer
and the masterclass changes nothing.

Each masterclass is recorded within a week and published with its dataset, notebooks (Minitab
project, Excel workbook, R and Python) and a reflection form. The form asks three questions
— what you tried on the dataset, where the method would apply on a process you know, and
where it would not — and earns the same CEUs as the live seat.

## 3. Peer project consulting circles

A circle is five or six Black Belts who meet for 75 minutes a month, online, for a year, and
work one member's live problem each time. It is the guild's core and the reason most members
stay. The circle is not a substitute for a Master Black Belt coach on a certified project;
it is what a Black Belt has for the fourth project, the one with no coach and no tollgate,
which is most of the projects a Black Belt will lead.

### 3.1 Formation

Circles are formed each January and July by the guild council from members who opt in:
mixed verticals on purpose (a healthcare Black Belt hearing a machining problem is the
point), no two members from the same organization, no member who reports to another. A
member who joins mid-year is placed in the next formation; a circle that drops to three
merges. A Master Black Belt from the council drops in once a quarter, listens, and speaks
last.

### 3.2 The protocol (75 minutes)

Chaired by a rotating member; the chair holds the clock and the silence.

| Minutes | Who | What |
|---|---|---|
| 0–10 | Presenter | The problem on one page in the tollgate format: the process, the metric with its operational definition, where the project is, the decision they are facing, the one question they want the circle to work |
| 10–20 | Circle | Clarifying questions only — facts, not suggestions. "What does the chart look like by shift?" is allowed; "have you tried…" is not yet |
| 20–50 | Circle | The circle consults *while the presenter listens and does not speak*, camera off if they prefer. What would the reviewer mark at risk? What is the sophisticated method the presenter is about to run that they do not need? What is the alternative explanation nobody has tested? What would Finance say? The chair keeps the circle on the presenter's question |
| 50–62 | Presenter | Responds: what landed, what they had already ruled out and why, what they will do |
| 62–70 | Chair | Actions written — the presenter's, in their words — and the next presenter named |
| 70–75 | All | One line each: what the case taught you about your own project |

The thirty-minute listening block is the protocol. A presenter who answers every suggestion
as it is made defends the project; a presenter who listens hears it. Circles that skip the
block become status meetings within three months, and the council's quarterly drop-in is
mostly to protect it.

### 3.3 What the circle records

A one-page circle note per session, held by the chair, shared with the circle only: date,
presenter's question, the three most useful sentences, the presenter's actions. Circle notes
are never assessment evidence, never seen by any reviewer, and never leave the circle
without the presenter's consent. A circle may nominate a resolved case to the case clinic
or the showcase; the presenter decides, and the redaction pass runs first.

Circle attendance earns CEUs (§6); presenting earns more. A member who has attended nine of
twelve sessions and presented twice in a year has done the most useful renewal activity the
program offers and has thirteen CEUs to show for it.

## 4. The annual showcase and the project story

### 4.1 The showcase

Once a year, two days, in person with a virtual stream. It is where Green Belt showcase
nominees present, where Master Black Belt credentials are conferred, and where the guild
meets in one room. Black Belt members present in the tollgate format they were certified in:
ten minutes, one page, the same page the reviewer scored, then ten minutes of questions from
the room. Speaking slots go to accepted project stories (§4.2); Guild Plus members are
scheduled first, then the remaining slots are allocated by the guild council on the stories'
merit, which is decided by the council without seeing the tier.

The showcase is not curated for success. A story whose experiment found no significant
effect and whose honest Tollgate 4 re-scoped the project is a showcase story; a story whose
results slide says "60% improvement" with no measurement window is sent back for the window.

### 4.2 The project story — one a year, from every member

Every guild member submits one project story a year, by the end of the third quarter, or a
one-line "nothing to report this year" — which is also data, and which the outcomes page
counts honestly as such. The story is the unit the program's outcome database is built from,
and the annual submission is what keeps that database current instead of frozen at the
certification date.

The story is short and structured:

| Field | What goes in it |
|---|---|
| Vertical and process type | One line; the employer unnamed unless a rollout agreement allows it |
| The problem, in the metric | Baseline, with its operational definition, basis and measurement window |
| The verified cause and how it was verified | Method, effect size, the sentence you told the sponsor; one chart |
| The countermeasure and its evidence | Experiment or pilot; prediction versus result; measurement window; the honest shortfall if there was one |
| The result, as validated | Finance's figure or the mission-metric executive's, in the measured period, with the benefit class — not the candidate's figure, and never annualized on this form |
| Sustainment | Whether the control plan held at the last check, with the date |
| What you would do differently | Two lines |
| Consent choices | Per the credential evidence policy: what may be published, what stays in the database |

A story about the certified capstone is accepted in the first year only; after that it must
be a new project, which is the point. A story that documents a new project with before/after
evidence on the same operational definition is also the **project evidence** for
recertification (§6), so a member who submits a real story every third year has met that
requirement by doing what they were certified to do.

*HC example (illustrative).* A second-year story from a Black Belt in a hospital's quality
department: outpatient infusion chair turnaround, calendar minutes from patient departure to
next patient seated, baseline median 34 minutes over 60 days. Cause verified by a Kruskal-
Wallis comparison across three cleaning-and-restock sequences and a stratified plot by time
of day, effect stated as "the sequence that restocks before cleaning is a median 11 minutes
faster; the afternoon gap is a scheduling effect, not a cleaning one." Countermeasure: the
faster sequence as standard work, piloted on four chairs for six weeks against a written
prediction of 25 minutes; result median 26. Validated as service impact by the infusion
director: 1.4 additional patients per chair-day over the six weeks measured, service class,
not annualized. Sustained at the day-90 check. What she would do differently: run the
attribute agreement study on "departure time" before the baseline, because the stamp turned
out to be entered by the nurse at the next free moment.

Accepted stories are redacted per the policy, go to the case clinic queue and the outcomes
page, and are the pool from which the Q4 masterclass topic and the next year's showcase are
chosen.

## 5. The coaching route to Master Black Belt candidacy

Master Black Belt admission asks for at least three years since Black Belt certification, at
least five completed projects of which at least two were as coach or reviewer, and current or
imminent responsibility for a program or practice; the fellowship then asks for twenty
documented coaching hours with real candidates, two of them observed. The guild is where the
"as coach or reviewer" projects and the hours come from, and it pays for them. The program's
own words: the instructor bench and the Master Black Belt pipeline are the same flywheel.

### 5.1 The coaching bench

A certified Black Belt may join the Green Belt coaching bench from the day of certification,
because requirement 5 has already put them in a calibrated reviewer's chair twice. Onboarding
follows the Green Belt facilitator system's pathway, shortened:

1. **Calibrate** on the Green Belt anchor set — within 5 points on all four, exact on every ★.
2. **Shadow** three checkpoints with a certified coach, with the learners' consent.
3. **Carry four files under supervision** in one cohort: the three checkpoints, monthly
   coaching to closure, coaching notes reviewed by the instructor of record.
4. **Bench.** Coach of record for up to 12 Green Belt files, at the bench rate, in cohorts
   where the conflict rules allow — never a learner you manage or are managed by; never as
   reviewer of any learner you coach.

A member employed by a client organization may coach in that organization's own Green Belt
cohorts once on the bench, under the same rules; coaching is not assessment and the credential's
independence lives with the reviewer, who is never from the client. This is how a corporate
deployment's Black Belts build its internal capacity without spending the credential's
independence, and it is the arrangement the
[corporate deployment playbook](corporate-deployment-playbook.md) §9 relies on.

### 5.2 The reviewer bench

After two Green Belt cohorts coached with a coach–reviewer ★ agreement at or above the
program target, a member may join the **Green Belt reviewer bench** — reviewer of record for
Green Belt files, at the reviewer rate, under the Green Belt system's blind assignment and
conflict rules (never a file from their own organization, ever). Reviewer calibration is
quarterly on the anchor set. A Green Belt file reviewed to signature counts as a project "as
reviewer"; a file coached to closure counts as a project "as coach."

Black Belt files are reviewed only by Master Black Belts. A Black Belt on the Green Belt
reviewer bench may sit as **second reader** on Black Belt tollgate packages — scoring the
same package independently, unsigned, compared afterward — as preparation for the fellowship,
at the assessment lead's invitation.

### 5.3 The coaching-hours log

One log per member, kept in the guild record, exportable to the Master Black Belt
application without retyping:

```
COACHING HOURS LOG
Date · Cohort ID · Role (coach / reviewer / second reader / circle chair / clinic chair) ·
Learner or file ID · Activity (checkpoint 1/2/3, monthly-N, tollgate record, final review,
calibration) · Minutes · Signed off by (instructor of record / assessment lead / guild council)
```

Hours count when signed off by someone other than the member. Circle chairing and clinic
chairing count as coaching hours at half weight, because they are coaching a room rather than
a person, and the fellowship's twenty assessed hours must be 1:1. Projects coached to closure
and files reviewed to signature are counted separately from hours, because the admission
criterion is projects and the fellowship criterion is hours.

*TXN example (illustrative).* A Black Belt in a shared-services organization joins the bench
in the month after certification. Year one: four supervised files in the spring cohort, then
ten files as coach of record in the autumn cohort — three checkpoints and an average of four
monthly checkpoints each, ≈ 4.5 hours per file, 63 logged hours, eight projects closed. Year
two: twelve files coached (≈ 54 hours), reviewer-bench calibration, six Green Belt files
reviewed to signature. Year three: coaches in her own organization's first Green Belt cohort,
chairs a circle, second-reads four Black Belt tollgate packages. At the end of year three she
has over 150 signed hours, twenty-six projects as coach or reviewer, and — because her
organization has now asked her to run its CI function — the third admission criterion. The
application is her log, her stories and her verification page; she has not bought anything.

## 6. Recertification — three years, 24 CEUs plus a project or 40 coaching hours

Black Belt certification renews every three years on **24 renewal CEUs** and **either** one
completed project documented with before/after evidence **or** 40 signed coaching hours. The
renewal CEU is the program's unit — one per contact hour of qualifying activity or its
documented equivalent, stated on the badge — and is not the IACET CEU, which applies to the
course. Every route below is free through the guild; the only charge is the modest
administrative fee for the evidence review stated in the terms of certification §9.

| Activity | Renewal CEUs | Evidence | Free? |
|---|---|---|---|
| Consulting circle session attended | 1 each | Chair's attendance record | Yes |
| Consulting circle case presented | 2 each | Circle note | Yes |
| Circle chaired for a year | 4 | Guild record | Yes |
| Masterclass, live seat | 3 each | Attendance record | No (Guild Plus) |
| Masterclass, recording with the reflection form | 3 each | Reflection form | Yes |
| Masterclass led or co-led | 6 | Guild record | Yes (paid) |
| Green Belt case clinic attended / chaired | 1 / 2 | Attendance record | Yes |
| Showcase attended, live or streamed | 2 per year | Attendance record | Yes |
| Project story accepted and presented | 4 | Showcase record | Yes |
| Coaching-bench or reviewer-bench calibration session | 2 per quarter | Assessment record | Yes (paid) |
| Second reader on Black Belt tollgate packages | 1 per package | Assessment record | Yes |
| External conferences, courses, workshops | 1 per hour, up to 8 | Certificate of attendance | No — and never required |

**The project or the hours.** The project is any completed improvement project of any size
documented on the A3 with a baseline and an after measured on the same operational
definition, sampled for review at 10%; an accepted project story (§4.2) is that evidence. The
coaching hours are 40 signed hours from the log (§5.3) in the three-year window. One Green
Belt cohort coached meets the hours; one real project meets the project. A Black Belt who has
done neither in three years has, by the program's own definition, not practised as a Black
Belt, and the credential moves to `inactive` on the verification page — never deleted,
reinstated on completing the current cycle's requirements, with the reminder sequence
starting at month 30 and stating the CEUs and hours already logged.

Arithmetic, so nobody has to do it: nine circle sessions a year for three years is 27 CEUs;
or two years of circles plus four recorded masterclasses; or one masterclass a quarter on the
recording for two years. Add one story or one cohort coached. The whole cycle is met on the
free tier by a member who shows up and does the work, which is what the credential says they
do.

## 7. Two forks at certification

The reviewer's public feedback names a fork where the capstone points to one; the coach
discusses it at session 6; the guild carries both. Neither is required, and a Black Belt who
chooses neither and leads projects for a decade is the credential's most common and most
useful outcome.

| | **Master Black Belt track** | **Specialist micro-credentials** |
|---|---|---|
| For whom | A Black Belt heading toward program leadership: governance, a portfolio, a belt-development plan, coaching as a job | A practitioner staying deep: the person the organization sends when the problem is technically hard |
| The signal in the capstone | L1 and L2 earned with room to spare; the candidate's decision log shows them running a steering group, not just attending one; the kaizen event report reads like a deployment plan | ★ A2 or ★ I1 earned with unusual method fit; the reviewer's feedback says "this project wanted a central composite design" or "this cause structure is an event-log question" |
| What it asks | Three years, five projects (two as coach or reviewer), program responsibility; then the six-month fellowship: deployment capstone, assessed coaching, teach-back, technical portfolio, panel defence | One applied credential at a time, each assessed on a real artifact reviewed by two faculty, pass/redo, no exam: **DFSS/DMADV** (a new-process design carried through to verified capability), **process mining and digital CI** (an event-log analysis to a verified improvement decision), **Lean Six Sigma for AI-era operations** (a triage of what to improve, what to automate and what to leave, with the measurement system for the automated part) |
| What the guild provides | The coaching bench and the log (§5); circles; the masterclasses as preview; council roles as practice at stewarding the discipline | The Q1–Q3 masterclasses as the entry; Guild Plus preparation workshops; circles where the technically hard cases are brought |
| What it does not change | The Black Belt credential and its recertification stand on their own | Same; a micro-credential is listed on the verification page beside the Black Belt, with its own reviewer of record |

The micro-credential specifications, rubrics and reviewer benches are published separately
when each opens; until then a member interested in one is placed in the matching masterclass
and a circle that has that kind of case.

Choosing: the question the coach asks at session 6 is not "which do you want?" but "in the
capstone, which hour did you most want more of — the steering-group hour or the residuals
hour?" Most people know.

## 8. Governance and what the guild measures about itself

A **guild council** of five certified Black Belts, elected by members each year, with a
Master Black Belt chair appointed by the program. The council forms circles, chooses the Q4
masterclass, reads project stories for the showcase, and hears members' proposals. It has no
assessment role and no access to any assessment record; a council member who joins the
reviewer bench recuses from any showcase decision on a file they reviewed.

Reported to the program annually and on the outcomes page in aggregate:

- Members active in a circle (target ≥ 60% of certified Black Belts in their first three
  years) and circle retention through a full year.
- Project stories submitted, and the honest count of "nothing to report."
- Recertification rate at the three-year mark, and the share met entirely on the free tier
  (the number the program publishes to show the renewal is not a shakedown).
- Coaching-bench conversion: members on the bench within twelve months of certification;
  signed hours per member per year.
- Master Black Belt applications from members, and the admit rate, published as the
  fellowship's selectivity figure.
- Masterclass reflection forms submitted, by quarter; the "where it would not apply" answers
  are read by the council, because they are the best measure of whether the masterclass
  taught restraint as well as method.

None of this ranks members. The guild exists so that a Black Belt three years out can still
say, without looking anything up, what the reviewer would need to see.

---

*v1.0 · 2026-09-20*
