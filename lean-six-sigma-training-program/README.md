# Lean Six Sigma Training Program — Commercial Design Blueprint

A best-in-class, commercially sellable Lean Six Sigma (LSS) certification program spanning
White Belt → Yellow Belt → Green Belt → Black Belt → Master Black Belt, designed for delivery
to external clients across multiple industries.

> **Course build-out status.** Every level is built against the same eight-component
> delivery model: (1) curriculum & content design, (2) assessment & credentialing,
> (3) learner experience & delivery, (4) instructor & reviewer system, (5) learner support &
> reinforcement, (6) measurement & evidence, (7) corporate deployment, (8) content operations.
>
> - **[White Belt →](white-belt/README.md)** — **all eight components built.** 12 lesson
>   modules with spaced cumulative checks, three vertical production scripts, 80-item tagged
>   item bank plus pre-assessment and retrieval pools, field-exercise rubric with calibrated
>   sampled review, BoK crosswalk and credential spec, production/accessibility/LMS spec,
>   working prototype, kickoff facilitator guide, rollout playbook, reinforcement kit,
>   evaluation plan
> - **[Yellow Belt →](yellow-belt/README.md)** — components 1–2 built: 6 teaching units
>   (3A/3B split), 2 workshop facilitator guides (120 min each), 140-item tagged exam bank,
>   mini-project storyboard + scoring rubric, 5-template toolkit. Components 3–8 pending
> - **[Assessment policy →](assessment/standard-setting-and-item-policy.md)** — modified-Angoff
>   standard setting, item-writing rules, bank sizing, retake overlap, item analysis,
>   pre/post measurement (all levels)
> - **[Program operations →](program-operations/)** — authoring style guide, terms of
>   certification, change log (all levels)
>
> Green Belt and above exist at blueprint level (below) pending build-out.

---

## Design Assumptions (Stated Constraints)

The original brief left constraints open, so this design commits to a defensible set of
assumptions. Change any of these and the sections flagged with ⚙️ will need adjustment.

| Constraint | Assumption made | Rationale |
|---|---|---|
| Certification authority | **Independent brand**, explicitly mapped to the IASSC Universally Accepted Lean Six Sigma Body of Knowledge and cross-walked to the ASQ BoK; pursue accreditation via The Council for Six Sigma Certification (CSSC) provider accreditation and IACET CEU authorization | Owning the credential preserves margin and brand equity; BoK alignment + third-party accreditation answers the "is this real?" employer question |
| Industry verticals | **Multi-industry core with three vertical tracks**: (1) Manufacturing & Supply Chain, (2) Healthcare, (3) Transactional/Services (finance, insurance, back-office, tech ops) | Verticalized case libraries are the single strongest differentiator vs. generic competitors |
| Delivery | **Digital-first hybrid**: self-paced e-learning for White/Yellow; live-virtual cohorts for Green/Black; hybrid (virtual + optional on-site immersion) for Black/MBB; on-site available for corporate contracts at all levels | Maximizes reach and margin while keeping high-touch where credibility demands it |
| Content development budget | **Lean phased build (~$150–250K over 18 months)**: White/Yellow first (revenue engine + lead gen), Green next, Black/MBB last | White/Yellow fund the build; Black/MBB require the least content volume but the most instructor depth |
| Staffing | **Founder-led (MBB-credentialed) + fractional instructor bench**, scaling to 3–5 contracted Black Belt/MBB facilitators by year 2 | Instructor quality is the #1 credibility variable; contractors keep fixed cost low |
| Statistical software | Green Belt and up taught in **both Minitab and Excel/open-source (R or Python optional track)** | Corporate buyers are split; software-agnostic teaching widens the market |

---

## Program Architecture at a Glance

```
White Belt ──► Yellow Belt ──► Green Belt ──► Black Belt ──► Master Black Belt
(awareness)    (contributor)   (project       (advanced      (deployment
 free/low-cost  team member     leader,        practitioner,   leader, coach,
 funnel entry   on projects)    real project   DOE + change    trains/certifies
                                required)      leadership)     others)
```

Two spine principles run through every level:

1. **No certification without demonstrated application** from Green Belt up. A real,
   sponsor-verified project with documented financial or operational impact is the
   non-negotiable backbone of credibility.
2. **Every level is an on-ramp to the next.** Tuition credits, embedded previews, and
   sponsor-side ROI reporting are designed into the product, not bolted on by sales.

---

# Belt-by-Belt Program Design

---

## 1. White Belt — "Foundations of Operational Excellence"

### Target buyer / learner profile
- **Buyer:** Primarily corporate L&D or Ops leadership buying enterprise awareness licenses
  (all-employee rollouts ahead of a CI deployment); secondarily individuals sampling the brand.
  Positioned as a **free or near-free lead-generation asset** for individuals.
- **Learner:** Any employee at any level — frontline staff, admins, new hires, executives who
  need shared vocabulary. **No prerequisites.** No math, no project experience.

### Learning objectives
By completion, the learner can:
1. Define Lean, Six Sigma, and continuous improvement, and explain in one sentence how each
   creates value in *their own* workplace.
2. Identify and name at least 5 of the 8 wastes (DOWNTIME) in a process they personally work in.
3. Describe the five DMAIC phases and state what question each phase answers.
4. Distinguish a process problem from a people problem in a given scenario.
5. Submit one real waste observation from their own job using the provided observation template
   (the "See a Waste" exercise — the program's first application artifact).

### Core curriculum topics
- What is a process; customer, supplier, input, output (SIPOC at awareness level)
- History and philosophy: Toyota Production System, Deming, variation as the enemy
- The 8 wastes (DOWNTIME) with vertical-specific examples (hospital, factory, office)
- Value-added vs. non-value-added work
- 5S introduction (concept level)
- DMAIC as a storyline, not a toolset
- The belt system and where the learner fits in a CI culture

### Delivery format & duration
- **100% self-paced e-learning, 3–4 hours** (12–16 micro-modules of 10–15 min each,
  mobile-friendly, closed-captioned, available in vertical-flavored variants).
- Corporate cohort: same content deployed via LMS/SCORM export with an optional 60-minute live
  kickoff webinar led by a facilitator.

### Practice / application component
- Interactive waste-spotting simulations (click-to-find wastes in a video walkthrough of a
  clinic, plant floor, and office).
- **"See a Waste" field exercise:** learner documents one real waste observation with a photo
  or description and an improvement idea; peer-visible gallery in corporate deployments.
- Templates provided: waste walk checklist, 8-wastes pocket card (print + digital).

### Certification requirements & credibility
- Complete all modules + pass the knowledge check + submit the field exercise (rubric-reviewed:
  10% sampled for individual enrollment, 100% in corporate rollouts, by calibrated reviewers).
- Credential: **"Lean Six Sigma White Belt (Awareness)"** — the parenthetical is part of the
  name on every surface. Open Badges 3.0 metadata carries the exit-competence statement, the
  coverage map, the explicit exclusions, and two fields that a click-through certificate cannot
  honestly populate: `assessmentType` (knowledge check + applied artifact) and a per-learner
  `reviewStatus` (`human-reviewed` vs. `completeness-checked`). Permanent public verification;
  no CEUs claimed at this level, and the course description says so.
- Full specs: [`white-belt/bok-crosswalk-and-credential.md`](white-belt/bok-crosswalk-and-credential.md),
  [`white-belt/field-exercise-rubric.md`](white-belt/field-exercise-rubric.md).

### Assessment method
- 20-question multiple-choice knowledge check assembled to blueprint from an 80-item tagged
  bank, **provisional 70% cut (Angoff panel to confirm)**, unlimited retakes with ≤25%
  overlap; 10-item pre-assessment for test-out and pre/post gain; field exercise
  auto-checked for completeness and **quality-sampled by rubric** (10% of submissions, or
  100% peer-reviewed in corporate deployments) so the badge's "applied exercise" claim is
  defensible.

### Reinforcement & alumni value
- A designed 12-month sequence in which **every touchpoint asks for or reports on an
  observation** — micro-lesson at day 3, peer observation at day 7, waste-walk invitation at
  day 14, organizational theme report at day 30, Just-Do-It triage tool at day 45, 90-day
  pulse and second-observation invitation, then monthly "Waste of the Month" cases.
- Free community tier (forum, template library, monthly tool clinic). No paid tier at this
  level — a White Belt paying a subscription is a bad-faith product.
- Manager reinforcement touches at day 10 and day 45 (corporate).
- No recertification, no CEUs, and deliberately no "advanced White Belt" tier.
- Full kit: [`white-belt/reinforcement/post-course-kit.md`](white-belt/reinforcement/post-course-kit.md).

### Progression pathway (upsell)
- Certificate completion page presents Yellow Belt with a **completion discount valid 30 days**;
  a personalized invitation at day 120, and an anniversary touch that replays the learner's own
  first observation back to them with what happened to it.
- Reviewers are instructed to flag observations revealing a Yellow-Belt-sized problem and say so
  in the feedback — progression starts inside the rubric, not in a sales email.
- Corporate: the rollout dashboard makes the pitch concrete — *"your people found 412 problems;
  180 are local fixes their supervisors can own (Yellow Belt), and 30 cluster into four
  cross-departmental problems with real money attached (a Green Belt cohort, with these
  sponsors)."*

---

## 2. Yellow Belt — "Contributing to Improvement Projects"

### Target buyer / learner profile
- **Buyer:** Split — corporate buyers certifying intact teams/departments (majority of revenue),
  and individual professionals adding a first credential (supervisors, analysts, job-seekers).
- **Learner:** Frontline supervisors, team leads, process operators, clinical staff, back-office
  specialists — people who will **serve on** DMAIC projects and run small local improvements.
  **Prerequisite:** White Belt or the built-in 1-hour bridge module (fee-waived).

### Learning objectives
By completion, the learner can:
1. Map an as-is process they own using a SIPOC and a basic swimlane/process map, validated by
   walking the actual process (not drawing from memory).
2. Apply 5S to a real physical or digital workspace and document before/after with the audit sheet.
3. Collect data with a check sheet and present it in a Pareto chart to prioritize a problem.
4. Write a problem statement that passes the program's "no cause, no blame, no solution" rubric.
5. Participate effectively in a DMAIC project: state what a team member owes the project in each
   phase, and use 5 Whys and fishbone in a facilitated root-cause session.
6. Complete a **"Just-Do-It" local improvement** (small-scope PDCA) and quantify its result.

### Core curriculum topics
- Everything in White Belt at working depth, plus:
- SIPOC and process mapping (swimlane, basic value stream awareness)
- 5S implementation and audit (with digital-5S variant for transactional track)
- PDCA for local improvements
- Basic quality tools: check sheets, Pareto, run charts
- Reading the numbers (IASSC/ASQ YB alignment): center and spread (mean/median/SD as
  concepts, histograms), reading a control chart (limits vs. specs; stable ≠ capable),
  capability (Cpk) and measurement-system awareness at interpretation depth
- Root cause participation tools: 5 Whys, fishbone (Ishikawa)
- Standard work basics; visual management; pull signals in miniature (two-bin kanban)
- Data collection basics: operational definitions, sampling awareness
- Kaizen event participation; why people resist change and the team member's role
- Role of the Yellow Belt on a Green/Black Belt project; effective tollgate participation

### Delivery format & duration
- **Hybrid-lite: 8–10 hours self-paced e-learning + two 90-minute live virtual workshops**
  (process mapping clinic; root-cause simulation). Individual enrollees join monthly public
  workshop sessions; corporate cohorts get private sessions.
- Corporate on-site option: 2-day instructor-led bootcamp (compresses everything, adds a live
  simulation).
- Total: ~12–14 hours over 2–4 weeks.

### Practice / application component
- **Catapult/paper-airplane-style virtual simulation** (or the "pizza order" transactional sim):
  one full improvement cycle in a game environment with real collected data.
- **Required applied mini-project:** the Just-Do-It improvement — a real 5S implementation,
  standard-work fix, or waste elimination in the learner's own work area, documented on a
  one-page A3-lite storyboard.
- Toolkit provided: SIPOC template, swimlane template (Excel/Miro/Lucid formats), 5S audit
  sheet, check sheet + auto-Pareto workbook, A3-lite storyboard, problem-statement rubric.

### Certification requirements & credibility
- Pass the exam **and** submit the mini-project storyboard, which is reviewed against a
  published rubric by a certified instructor (not auto-graded). This is the level where the
  program starts visibly out-rigoring "watch videos, click quiz" competitors.
- Credential: digital badge + PDF certificate; badge metadata lists the applied project.
- **1.2 IACET CEUs** (⚙️ pending accreditation).

### Assessment method
- 40-question exam, scenario-weighted (≥50% of items are "what would you do" scenarios, not
  definitions), assembled to blueprint from a 140-item tagged bank; **provisional 75% cut,
  set formally by modified-Angoff panel** per the program assessment policy; 2 retakes
  included with ≤25% item overlap.
- Mini-project rubric: 5 dimensions (real problem, baseline data, action taken, result measured,
  storyboard clarity), each 0–2; **pass = 7/10 with no dimension at 0.**

### Reinforcement & alumni value
- 90-day post-course email sequence with one micro-challenge per month ("run a Pareto on
  something this week").
- Community tier upgraded to posting rights; monthly open "tool clinic" webinar (recorded).
- Certificate is evergreen; optional annual "Yellow Belt Refresher" micro-course (paid, cheap).

### Progression pathway (upsell)
- The mini-project is the hook: reviewers explicitly flag storyboards that reveal a
  Green-Belt-sized problem ("this problem is bigger than a Just-Do-It — here's what solving it
  with a full DMAIC would look like") with a personalized Green Belt invitation.
- Corporate: quarterly report to the L&D buyer aggregates mini-project results into a savings
  estimate — the Green Belt cohort proposal writes itself.
- Yellow Belt tuition is **100% creditable toward Green Belt within 12 months.**

---

## 3. Green Belt — "Leading DMAIC Projects"

### Target buyer / learner profile
- **Buyer:** Roughly 50/50. Corporate buyers sponsoring cohorts of 8–20 as part of a CI
  deployment (highest LTV); individual professionals (engineers, nurses/quality staff, analysts,
  ops managers) self-funding for career progression, often employer-reimbursed.
- **Learner:** Professionals with process ownership or analyst responsibilities, typically 2+
  years work experience, comfortable with basic Excel.
  **Prerequisites:** Yellow Belt (or bridge assessment) **and — this is the differentiator —
  a real project identified before the course starts**, with a named sponsor who signs a
  one-page project charter agreement. Individual enrollees without employer sponsorship may use
  the program's **partner-project pool** (nonprofit/SMB projects sourced by the program) or a
  rigorously simulated dataset track that leads to a clearly labeled "GB (Practicum)" credential.

### Learning objectives
By completion, the learner can:
1. Scope, charter, and lead a DMAIC project from problem statement to control plan, delivering
   a verified improvement on a real process (target: measurable shift in the primary metric with
   documented baseline vs. post-improvement data).
2. Build and interpret a value stream map and quantify process performance (lead time, %C&A,
   process cycle efficiency).
3. Plan and execute a data collection plan including operational definitions, sampling strategy,
   and a measurement system analysis appropriate to the data type (Gage R&R or attribute
   agreement).
4. Establish baseline capability (Cp/Cpk, sigma level, DPMO) and state process stability from a
   control chart before claiming capability.
5. Isolate root causes using structured tools (fishbone → C&E matrix → hypothesis tests) and
   verify them with data, not opinion — including correct use and plain-language interpretation
   of t-tests, ANOVA, chi-square, correlation/regression (simple), and p-values.
6. Select, pilot, and implement solutions using effort/impact, pilot design, and mistake-proofing.
7. Build a control plan with response plans and hand the process to the owner with a monitored
   control chart.
8. Run effective tollgates: present each phase to a sponsor in ≤10 minutes with a one-page
   summary.

### Core curriculum topics
**Define:** project selection & scoping, charter, stakeholder analysis, VOC → CTQ trees, SIPOC.
**Measure:** process mapping & VSM, data types, operational definitions, data collection plans,
MSA (variable Gage R&R, attribute agreement), baseline capability (Cp/Cpk/Pp/Ppk, DPMO, sigma
level), intro control charts (I-MR, X̄-R, p/np/c/u — reading and constructing the basic ones).
**Analyze:** graphical analysis (histogram, box plot, scatter, multi-vari), fishbone, C&E matrix,
FMEA (working level), hypothesis testing framework, t-tests, one-way ANOVA, chi-square,
correlation and simple linear regression, confidence intervals; **stats taught software-first
with interpretation-first pedagogy** (every test ends with "write the sentence you'd tell your
sponsor").
**Improve:** solution generation (SCAMPER, benchmarking), selection matrices, piloting, poka-yoke,
kaizen event basics, quick intro to pull/kanban and setup reduction for the manufacturing track /
queue management for transactional / patient-flow for healthcare.
**Control:** control plans, SPC in sustainment, standard work, response plans, project closure,
financial validation with Finance sign-off, storytelling the project.
**Threaded throughout:** team dynamics, sponsor management, resistance basics, ethics of data.

### Delivery format & duration
- **Flagship format: live-virtual cohort, 8 weeks.** Weekly rhythm: ~3 hrs self-paced content →
  2.5-hr live instructor session (application labs, not lecture) → project work with the tools
  just learned. ~56 hours total structured learning + 40–60 hours project work.
- The 8-week calendar is phase-locked to DMAIC: learners execute each phase on their real
  project the same week they learn it, with **tollgate reviews at weeks 2, 4, 6, 8** (project
  completion may extend up to 6 months post-course; certification is withheld, not the learning).
- Corporate option: 2×3-day on-site intensives spaced a month apart, plus virtual tollgates.
- Individual self-paced option exists but includes **mandatory live tollgates and 1:1 coaching
  checkpoints** (three 45-min sessions) — there is no zero-human-contact path to Green Belt.

### Practice / application component
- **Capstone: the real project.** Sponsor-signed charter, instructor coaching at each phase,
  and a certified reviewer at each tollgate. This is the product.
- Weekly labs on a continuing vertical case study (learner picks the manufacturing, healthcare,
  or transactional case) with real messy datasets.
- Full **Green Belt toolkit**: charter, VSM (Excel + Miro), data collection plan, MSA workbooks,
  capability calculator, hypothesis-test selector flowchart ("which test do I use?" — the most
  downloaded asset in most LSS programs), FMEA, pilot plan, control plan, A3, tollgate deck
  templates — all in the vertical's vocabulary.
- Minitab or Excel-stats track (⚙️ optional R/Python notebooks for tech-sector cohorts).

### Certification requirements & credibility
Three gates, all required:
1. **Exam** (see below).
2. **Completed project** scored against the published 100-point rubric by a certified Black
   Belt/MBB reviewer **who is not the learner's instructor** (separation of coaching and
   assessment — a key defensibility feature).
3. **Sponsor verification**: sponsor attests the project happened, results are real, and
   (where applicable) Finance validated the impact.
- Credential: "Certified Lean Six Sigma Green Belt," badge metadata includes project domain and
  verified-impact flag. Practicum-track completions are labeled distinctly.
- Aligned to IASSC LSSGB BoK (published crosswalk); **5.6 IACET CEUs** ⚙️.
- Program publishes its **pass rates and audit policy** (random re-review of 10% of certified
  projects annually) — radical transparency as a trust signal.

### Assessment method
- **Exam:** 100 questions, 3 hours, proctored (online proctoring for individuals; on-site for
  corporate). Mix: ~40% scenario judgment, ~35% tool application with data exhibits (read this
  Minitab/Excel output and conclude), ~25% concepts. **Pass: 80%.** One included retake after a
  14-day study period; item banks rotated.
- **Project rubric (100 pts):** Define 15, Measure 20 (MSA attempted = mandatory item),
  Analyze 25 (root cause verified with data = mandatory item), Improve 20 (before/after
  evidence = mandatory item), Control 15, storytelling 5. **Pass: 75 with all mandatory items
  earned.** One revise-and-resubmit cycle included.

### Reinforcement & alumni value
- **90-day sustainment check:** reviewer emails the sponsor at day 90 asking whether the control
  plan held; results feed the program's published outcome stats (and re-engage the account).
- Alumni community full access: monthly case clinics, tool AMAs, job board, template updates.
- **CEU-based renewal every 3 years** (light: 12 CEUs from clinics/webinars/a documented new
  project — designed to be earnable free through the community, so renewal is a retention
  touchpoint, not a shakedown).

### Progression pathway (upsell)
- Black Belt eligibility requires a certified GB project — so every Green Belt is pre-qualified
  and knows it; certificate packet includes a personalized "Path to Black Belt" with their
  project cited.
- Instructors nominate top projects for the annual **program showcase**; nominees get a Black
  Belt scholarship/discount. Corporate buyers see the showcase — it sells the next cohort.
- Green Belt tuition partially creditable (25%) toward Black Belt within 24 months.

---

## 4. Black Belt — "Advanced Practitioner & Change Leader"

### Target buyer / learner profile
- **Buyer:** Majority corporate (organizations building an internal CI function; typically 2–8
  seats per company per year); strong individual segment of career CI professionals
  (quality engineers, CI managers, consultants) — often the program's most motivated learners.
- **Learner:** Experienced Green Belts moving into full-time or majority-time improvement roles.
  **Prerequisites: certified Green Belt (this program or verified external) + one completed
  DMAIC project + sponsor commitment for a Black-Belt-scale project** (cross-functional,
  strategic linkage, target impact threshold e.g. ≥$75K annualized or equivalent
  clinical/service-level impact). External GBs take a calibration assessment; gaps are bridged
  with targeted GB modules, not waived.

### Learning objectives
By completion, the learner can:
1. Lead a cross-functional, strategically linked improvement project to verified financial or
   mission-metric impact, managing a team they don't have authority over.
2. Design, run, and analyze **designed experiments** (full and fractional factorials, including
   blocking, center points, and basic response optimization) on a real or high-fidelity process,
   and translate the results into operating windows.
3. Select and apply advanced statistical methods correctly: multiple regression (with
   diagnostics), binary logistic regression, non-parametric alternatives, power/sample size,
   transformation/non-normal capability — and, more importantly, **recognize when NOT to use
   them.**
4. Deploy the full SPC toolset including EWMA/CUSUM awareness and rational subgrouping decisions.
5. Apply Lean at system level: value stream design (future-state), pull systems, line balancing/
   workload leveling, setup reduction, TPM/OEE (manufacturing) or demand-capacity management
   (healthcare/services).
6. Lead change deliberately: stakeholder strategy, resistance diagnosis, influence without
   authority, executive communication — assessed via observed practicum, not quiz.
7. Coach Green Belts: conduct a tollgate review and give rubric-based feedback (each BB candidate
   formally reviews at least two GB tollgates during the program).
8. Build the financial case: cost of poor quality, benefit types (hard/soft/cost-avoidance),
   working with Finance on validation.

### Core curriculum topics
- Advanced Define/Measure: project selection portfolios, linking to strategy, advanced VOC
  (Kano, basic conjoint awareness), measurement systems for destructive/attribute-complex cases
- Statistics: distribution identification, transformations, non-normal capability, power &
  sample size, multiple & logistic regression, non-parametrics (Mann-Whitney, Kruskal-Wallis,
  Mood's), ANOVA extensions (two-way, GLM awareness)
- **DOE (the centerpiece, ~20% of course time):** factorial design & analysis, fractional
  factorials and confounding, blocking, center points/curvature, sequential experimentation
  strategy, intro response surface methods; taught via live experiments (catapult/helicopter
  physical kit shipped to virtual learners + a process-simulator for transactional cohorts)
- Advanced SPC: chart selection at scale, EWMA/CUSUM, short-run SPC
- Lean systems: future-state VSM, flow/pull design, Little's Law applied, theory of constraints
  basics, kaizen event leadership (candidate must facilitate one)
- Change leadership & influence: Kotter/ADKAR applied, stakeholder mapping at executive level,
  conflict handling, facilitation skills lab, storytelling with data
- DFSS awareness (DMADV overview — full DFSS is an MBB/elective topic)
- Mentoring & coaching fundamentals; running tollgates from the reviewer's chair
- Program economics: CoPQ, benefit classification, Finance partnership

### Delivery format & duration
- **Hybrid: 16 weeks.** ~4 hrs/week self-paced + weekly 2.5-hr live-virtual lab + **two 2-day
  immersion events** (virtual-optional but strongly encouraged in person): one DOE practicum,
  one change-leadership/facilitation practicum with observed role-play. ~100 hours structured
  + 100–150 hours project work.
- Corporate option: 4×4-day on-site waves (the classic model) with virtual coaching between.
- Cohort cap: 16 learners per instructor (facilitation quality is the product at this level).

### Practice / application component
- **Capstone: Black-Belt-scale real project** with monthly 1:1 MBB coaching (six sessions
  included), tollgates with an independent reviewer, Finance-validated results.
- **Live DOE practicum** on physical apparatus or simulator — every candidate designs, runs,
  analyzes, and presents an experiment end-to-end.
- **Kaizen facilitation requirement:** lead one rapid-improvement event (at their employer or a
  partner-pool org), observed or video-reviewed.
- **GB coaching requirement:** formally review two Green Belt tollgates using the program rubric.
- Full BB toolkit: DOE planning canvas, experiment logbook, regression diagnostics checklist,
  benefit-classification guide, stakeholder strategy canvas, kaizen event leader's kit,
  executive readout templates.

### Certification requirements & credibility
All five gates required:
1. Exam (below).
2. Certified capstone project (rubric-scored by independent MBB reviewer; Finance/sponsor
   validation of impact).
3. DOE practicum passed (observed, rubric-scored).
4. Kaizen facilitation completed with observer feedback.
5. Two GB tollgate reviews completed to rubric standard.
- Credential: "Certified Lean Six Sigma Black Belt"; badge metadata lists project impact class,
  DOE practicum, and coaching hours. IASSC LSSBB BoK crosswalk published; **10 IACET CEUs** ⚙️.
- **A named MBB signs each certificate as reviewer of record** — a human reputation attached to
  every credential, which pay-to-pass mills structurally cannot copy.

### Assessment method
- **Exam:** 150 questions, 4 hours, proctored, open-notes/closed-internet (mirrors real practice;
  tests judgment, not memorization). Heavy exhibit interpretation. **Pass: 80%**, one retake.
- **Project rubric:** 150 points across DMAIC + leadership evidence (team management,
  stakeholder navigation documented) + financial validation. **Pass: 120 with all mandatory
  items** (verified root cause, experimental or piloted solution evidence, control plan live at
  ≥60 days, Finance sign-off).
- Practicum components scored pass/redo by observing instructor with structured rubric.

### Reinforcement & alumni value
- **Black Belt Guild:** quarterly advanced masterclasses (RSM deep-dive, simulation modeling,
  AI/process-mining in CI), peer project consulting circles, priority speaking slots at the
  annual showcase.
- Annual project-story submission keeps the outcome database (and marketing engine) fresh.
- **Recertification every 3 years: 24 CEUs + evidence of one completed project or 40 coaching
  hours.** Meaningful but achievable; keeps the credential a living thing.

### Progression pathway (upsell)
- Two forks presented at certification: **(a) Master Black Belt track** for those heading
  toward program leadership; **(b) specialist micro-credentials** (DFSS, process mining/digital
  CI, LSS for AI-era operations) for practitioners staying deep — both keep the alumnus buying.
- BBs who coach in the program's GB cohorts (paid, part-time) accumulate the coaching hours MBB
  candidacy requires — the instructor bench and the MBB pipeline are the same flywheel.

---

## 5. Master Black Belt — "Deployment Leader, Coach & Strategist"

### Target buyer / learner profile
- **Buyer:** Almost entirely corporate (sponsoring their CI leader) or self-funded senior
  consultants building a practice. Low volume, very high price, applications-based admission —
  **selectivity is the product.**
- **Learner:** Certified Black Belts with **≥3 years post-BB experience, ≥5 completed projects
  (2+ as coach/reviewer), and current or imminent responsibility for a CI program or practice.**
  Admission via application + portfolio + interview with the program director. Cohorts of 6–10,
  1–2 per year.

### Learning objectives
By completion, the candidate can:
1. Design and launch (or demonstrably re-architect) an enterprise CI deployment: governance,
   project pipeline, belt development plan, benefits tracking — delivered as a real deployment
   artifact for their organization or client, reviewed by peers and faculty.
2. Deploy **Hoshin Kanri**: build an X-matrix cascade from strategic objectives to improvement
   priorities, and run catchball and monthly review rhythms.
3. Coach and develop belts: demonstrate advanced coaching (GROW-style, technical review, career
   development) in assessed live coaching of real GB/BB candidates.
4. Design and quality-assure training: adult learning principles, curriculum architecture,
   assessment design — each candidate designs and delivers an assessed teaching segment.
5. Command the advanced technical toolkit at "know it or know where to get it" depth: RSM,
   Monte Carlo simulation, queuing/discrete-event simulation awareness, DFSS/DMADV end-to-end,
   process mining, and integration of CI with digital/AI operations.
6. Operate at executive level: build the CI business case, report a benefits portfolio, handle
   executive resistance, integrate CI with strategy, M&A integration and operating-model contexts.
7. Steward the discipline: run project audits, calibrate reviewers, maintain certification
   integrity in their own organization.

### Core curriculum topics
- Deployment architecture: operating models (central/hub-and-spoke/embedded), governance,
  project selection portfolios, benefits realization & Finance integration, CI maturity models
- **Hoshin Kanri / strategy deployment** (X-matrix, catchball, bowling charts, review cadence)
- Advanced statistics capstone topics: RSM, mixture designs awareness, Monte Carlo, simulation
- DFSS (DMADV) practicum
- Coaching mastery: technical coaching, developmental coaching, assessed live practice
- Training design & delivery: instructional design, facilitation mastery, assessment integrity
- Change at scale: culture, middle-management engagement, sustaining systems (leader standard
  work, tiered huddles, gemba routines)
- CI + digital: process mining, automation triage (what to improve vs. automate), AI-era
  operations, data infrastructure for CI
- The MBB as consultant: contracting, executive advisory skills, ethics

### Delivery format & duration
- **6-month hybrid fellowship:** monthly 2-day sessions (alternating in-person and live-virtual;
  ⚙️ fully virtual variant available), monthly 1:1 faculty advising, peer pods of 3 between
  sessions. ~120 hours structured + the deployment capstone (embedded in their real job).
- Deliberately styled as an **executive-education fellowship**, not a course — pricing,
  admissions, and alumni identity all follow from that framing.

### Practice / application component
- **Deployment capstone:** a real deployment plan/re-architecture executed in the candidate's
  organization, with at least one Hoshin cycle artifact and a benefits-tracking mechanism
  stood up. Defended before a faculty + external-examiner panel.
- **Assessed coaching:** minimum 20 documented coaching hours with real GB/BB candidates
  (typically inside this program's cohorts — again the flywheel), two sessions observed and
  rubric-assessed.
- **Teach-back:** design and deliver a 90-minute training segment, assessed on design and
  facilitation.
- **Technical portfolio:** one advanced-methods application (DOE/RSM, simulation, or DFSS)
  documented to publication-lite standard.

### Certification requirements & credibility
- All four components above passed + panel defense of the capstone. **No exam** — at this level
  a multiple-choice test would undermine credibility; the panel defense with an external
  examiner (a respected practitioner from outside the program) is the assessment.
- Credential: "Certified Master Black Belt," conferred at the annual showcase; public directory
  listing of MBBs with capstone abstracts (with employer permission).
- Credibility rests on: selectivity (published admit rate), the external examiner, the public
  portfolio abstracts, and the small-N prestige dynamic.

### Assessment method
- Capstone panel: 45-min presentation + 45-min defense; rubric across deployment design,
  Hoshin application, benefits credibility, and executive readiness; pass/distinction/redo.
- Coaching and teach-back: structured observation rubrics, pass/redo.
- Technical portfolio: reviewed by two faculty, pass/redo.

### Reinforcement & alumni value
- **MBB Council:** the program's faculty pipeline, exam-item review board, and project-audit
  bench are drawn from MBB alumni (paid engagements — alumni value is literally income).
- Annual invite-only MBB summit; co-authorship opportunities on program case publications.
- Recertification: none required; **active-status maintenance** (directory listing) requires
  biennial evidence of practice (coaching, deployment leadership, or teaching).

### Progression pathway
- Terminal belt — progression is into the **program's own ecosystem**: licensed-facilitator
  status (deliver this curriculum under franchise/licensing terms), faculty roles, examiner
  roles, and co-branded consulting referrals. The MBB level converts customers into
  distribution.

---

# Comparison Table Across Belts

| | White | Yellow | Green | Black | Master Black |
|---|---|---|---|---|---|
| **Audience** | All employees; funnel entry | Team leads, frontline supervisors, project team members | Process owners, engineers, analysts leading first projects | Full/majority-time CI practitioners | CI program leaders, senior consultants |
| **Buyer mix** | ~80% corporate licenses / free individual | ~60% corporate / 40% individual | ~50/50 | ~65% corporate / 35% individual | ~90% corporate-sponsored or practice-builders |
| **Price positioning** (individual, USD list) ⚙️ | Free–$49 | $299–$399 | $1,900–$2,500 | $4,500–$6,000 | $12,000–$18,000 (fellowship) |
| **Structured hours** | 3–4 | 12–14 | ~56 (+40–60 project) | ~100 (+100–150 project) | ~120 (+capstone in-role) |
| **Format** | Self-paced | Self-paced + 2 live workshops | 8-wk live-virtual cohort (or 2×3-day on-site) | 16-wk hybrid + 2 immersions | 6-mo hybrid fellowship |
| **Signature tools taught** | 8 wastes, DMAIC awareness, VA/NVA | SIPOC, process maps, 5S, PDCA, Pareto, 5 Whys, fishbone | VSM, MSA, capability, control charts, hypothesis tests, regression (simple), FMEA, control plans | DOE, multiple/logistic regression, advanced SPC, future-state VSM, kaizen leadership, change leadership | Hoshin Kanri, deployment design, RSM/simulation, DFSS, coaching & training design |
| **Project requirement** | Field observation exercise | Real Just-Do-It mini-project (rubric-reviewed) | Real sponsored DMAIC project, independently reviewed + sponsor-verified | BB-scale project + DOE practicum + kaizen facilitation + GB coaching | Enterprise deployment capstone + assessed coaching + teach-back + panel defense |
| **Exam** | 20 Q from 80-item bank; provisional 70% (Angoff) | 40 Q from 140-item bank; provisional 75% (Angoff) | 100 Q proctored; provisional 80% (Angoff) | 150 Q proctored; provisional 80% (Angoff) | None — panel defense w/ external examiner |
| **Certifying authority** | Program credential (awareness badge) | Program credential; IACET CEUs ⚙️ | Program credential; IASSC-BoK-aligned; CSSC-accredited provider ⚙️; independent reviewer | Same + MBB reviewer of record signs | Same + external examiner + public portfolio |
| **Renewal** | None | None (optional refresher) | 3-yr CEU renewal (earnable free) | 3-yr: CEUs + project/coaching evidence | Active-status via practice evidence |

---

# Skills Matrix by Belt Level

Legend: **A** = Awareness (can define/recognize) · **P** = Practitioner (can apply with support)
· **L** = Leads (applies independently on real work) · **M** = Masters/Teaches (coaches others,
assures quality) · — = not covered

| Skill / Tool | White | Yellow | Green | Black | MBB |
|---|:-:|:-:|:-:|:-:|:-:|
| 8 wastes / VA-NVA identification | P | L | L | L | M |
| 5S & visual management | A | L | L | L | M |
| SIPOC & process mapping | A | P | L | L | M |
| Value stream mapping (current state) | — | A | L | L | M |
| Value stream design (future state) | — | — | A | L | M |
| PDCA / Just-Do-It improvement | A | L | L | L | M |
| Problem statements & charters | — | P | L | L | M |
| VOC / CTQ | — | A | P | L | M |
| Data collection & operational definitions | — | P | L | L | M |
| Pareto, run charts, basic graphs | A | P | L | L | M |
| Measurement system analysis (MSA) | — | A | P | L | M |
| Capability analysis (Cp/Cpk, DPMO) | — | A | P | L | M |
| Control charts / SPC | — | A | P | L | M |
| Advanced SPC (EWMA, CUSUM, short-run) | — | — | — | P | L |
| Root cause: 5 Whys, fishbone | — | P | L | L | M |
| FMEA | — | — | P | L | M |
| Hypothesis testing (t, ANOVA, chi-sq) | — | — | P | L | M |
| Regression (simple) | — | — | P | L | M |
| Regression (multiple, logistic) | — | — | — | P | L |
| Design of Experiments | — | — | A | L | M |
| Response surface / advanced DOE | — | — | — | A | P |
| Simulation (Monte Carlo, DES) | — | — | — | A | P |
| Pull systems, flow, Little's Law | — | A | P | L | M |
| Kaizen event participation/leadership | — | P (participate) | P (co-lead) | L (facilitate) | M |
| Control plans & sustainment systems | — | A | L | L | M |
| Financial validation / CoPQ | — | — | P | L | M |
| Change leadership & stakeholder mgmt | — | A | P | L | M |
| Coaching belts / tollgate review | — | — | A | P | M |
| Training design & delivery | — | — | — | A | L |
| Hoshin Kanri / strategy deployment | — | — | — | A | L |
| CI deployment architecture & governance | — | — | — | A | L |
| DFSS / DMADV | — | — | — | A | P |
| Process mining / digital CI | — | — | A | P | L |

---

# Business Model Considerations

### Pricing strategy per belt ⚙️
- **White = free (individual) / licensed (corporate).** Individual White Belt is the top-of-funnel
  asset; corporate White is licensed per-seat (~$15–30/seat at volume, floor pricing for
  enterprise all-employee deals) as part of deployment packages.
- **Yellow = volume tier.** Priced for expense-account/self-approval thresholds ($299–399).
  Corporate cohorts of 20+ at 30–40% seat discount with the private workshop included.
- **Green = core revenue engine.** $1,900–2,500 individual; corporate cohort of 12–16 sold as a
  package (~$28–38K) including private tollgates and sponsor briefings. Anchor against
  university brands (Villanova ~$4K+) as "more rigor, real project, less lecture."
- **Black = premium tier**, $4,500–6,000; corporate packages bundle GB→BB pathways across a year.
- **MBB = executive-ed pricing**, $12–18K, justified by admissions selectivity, faculty ratio,
  and panel model. Never discounted; scholarships instead (protects price integrity).
- Cross-level mechanics: Yellow 100% creditable to Green (12 mo); Green 25% creditable to
  Black (24 mo); showcase scholarships as the only "discount" vocabulary at BB/MBB.

### Cohort vs. self-paced margins
- Self-paced (White/Yellow core): ~90%+ gross margin after platform costs; effectively
  infinite capacity. Its job is funnel + corporate land-and-expand, not profit maximization.
- Live-virtual cohorts (Green): the margin sweet spot — one instructor + one reviewer per 16
  learners; at ~$2,200 avg seat, instructor/review costs run ~15–20% of revenue → ~65–75%
  gross margin with far higher completion rates and referral value than self-paced.
- Hybrid with immersions (Black): venue/kit/1:1 coaching push delivery cost to ~30–35% of
  revenue; still healthy at premium pricing, and BB alumni become paid reviewers (cost becomes
  ecosystem payment).
- MBB fellowship: highest cost ratio (~40%) but priced for margin and, more importantly,
  it *manufactures faculty* — its real return is capacity creation.
- Rule of thumb: **self-paced scales revenue, cohorts create reputation, practica create
  credibility.** Don't chase self-paced margin at Green+ — that's the pay-to-pass trap.

### Corporate bulk licensing
- **Deployment packages, not seat bundles:** sell "Year-1 CI Launch" (all-employee White +
  N Yellow + 1–2 Green cohorts + advisory hours) rather than à-la-carte seats. Aligns to how
  L&D budgets and transformation programs are actually approved.
- Enterprise license terms: 12-month seat pools with rollover, LMS/SCORM delivery or hosted,
  co-branded (never white-labeled at Green+ — the certificate must stay this program's, or
  credential integrity dies), quarterly business reviews reporting project ROI to the buyer.
- Pricing floors by level protect the individual channel; volume discounts come as included
  services (private workshops, sponsor training, dashboards), not deeper seat cuts.
- Later-stage option: **licensed internal facilitators** — client MBBs/BBs certified to deliver
  White/Yellow internally under audit, on a per-completion royalty. High-margin expansion that
  keeps Green+ delivery (and certification authority) in-house.

### Instructor / facilitator staffing model
- **Phase 1 (launch):** founder-MBB delivers Green cohorts and all reviews; contract editors/
  designers build content. One founder can run ~6–8 Green cohorts/year alongside sales.
- **Phase 2 (year 2–3):** fractional bench of 3–5 contracted BB/MBB facilitators, paid per
  cohort (~$4–6K per 8-week Green cohort) + per project review (~$150–250). Recruit from... the
  program's own Black Belt alumni — coaching hours count toward MBB candidacy, so the best
  students become the cheapest, most loyal, best-calibrated faculty.
- **Quality system (non-negotiable):** facilitator certification pathway (shadow → co-teach →
  observed solo), session observation twice yearly, learner NPS per cohort, and **reviewer
  calibration sessions** (all reviewers score the same sample project quarterly; drift is
  retrained). Separation of instructor and assessor roles at Green+ is maintained at all scale
  levels.
- **Phase 3:** regional licensed facilitators for on-site corporate work under franchise terms
  with audit rights.

### Ongoing revenue structure
1. **Renewal/CEU fees** (Green/Black, 3-yr cycle): modest fee + evidence review; designed so
   the *learning* to earn CEUs is free in-community but the *credential maintenance* is paid.
   Predictable, recurring, defensible (ASQ does the same).
2. **Alumni community (freemium):** free tier for all certified belts (forum, template library,
   monthly clinic); paid tier (~$19–29/mo or corporate site license) adds masterclasses,
   project consulting circles, dataset/tool vault, priority coaching. Target 15–20% paid
   conversion of Green+ alumni.
3. **Advanced workshops & micro-credentials:** 1–2 day paid specialties (DFSS, process mining,
   simulation, LSS-for-AI-operations, Finance-for-CI-leaders) sold to the BB/MBB base —
   high-margin, fast to build once the base exists, and they refresh the brand's currency.
4. **Corporate QBR-driven expansion:** sponsor dashboards + annual showcase are structured
   renewal machines — every reported project ROI is the business case for next year's cohorts.
5. **Reviewer/audit services:** certifying *other* organizations' internal belt programs against
   this program's rubric (audit-as-a-service) — a later-stage, credibility-compounding line.

---

# Market Differentiation

**Positioning statement:** *"The certification you have to earn — on your own process, with your
own data, verified by an independent expert and your own sponsor."*

| Competitor archetype | Their weakness | This program's counter |
|---|---|---|
| **ASQ** | Gold-standard exam, but no training-project integration; exam-only credential; slow, institutional | Equal BoK rigor **plus** verified real-project requirement and coaching; faster cohort cadence; modern delivery |
| **IASSC (exam-only body)** | Certifies knowledge, not application, by design | Project + sponsor verification + independent review; publish the crosswalk so buyers see BoK parity |
| **Villanova / university programs** | Expensive, lecture-heavy, projects optional or simulated; university brand does the work | Half the price at Green, phase-locked real project, published outcome data (aggregate verified impact per cohort) |
| **GreyCampus / low-cost online mills** | Pay-to-pass perception; auto-graded everything; no human review | Human independent review, named reviewer-of-record at BB, published pass rates and audit policy — sell *against* the mill category explicitly |
| **SSGI / practitioner-led online** | Solid content, but limited vertical depth and thin post-cert ecosystem | Three verticalized case libraries and templates; alumni flywheel (community → CEUs → faculty pipeline) |
| **Big-consulting academies** | Excellent but only available inside engagements; very expensive | Open-market access to engagement-grade rigor; partner-project pool gives individuals what consultancies give clients |

**The five differentiators, in priority order:**
1. **Application-verified certification** — sponsor sign-off + independent reviewer + published
   audit policy. This is the moat; everything else is supporting.
2. **Vertical fluency** — same BoK, three vocabularies (manufacturing, healthcare,
   transactional): cases, datasets, templates, and instructor matching by industry.
3. **Phase-locked cohort design** — learn Measure the week you measure; tollgates on the
   calendar. Completion rates and time-to-impact become marketable stats.
4. **Outcome transparency** — publish aggregate verified project impact, completion rates, pass
   rates, and 90-day sustainment rates. No major competitor does this; it converts skeptical
   corporate buyers.
5. **Modern relevance** — process mining, automation triage, and AI-era operations content woven
   into BB/MBB (not a bolt-on), signaling the program lives in this decade.

*(Deliberately not differentiators: being cheapest, being fastest-to-certificate. "Faster
time-to-certification" is marketed honestly as faster time-to-**competence** via cohort
structure — racing to hand out certificates is the mill trap.)*

---

# Common Pitfalls in Commercial LSS Programs — and How This Design Avoids Them

| Pitfall | How it kills programs | Design countermeasure |
|---|---|---|
| **Pay-to-pass perception** | Unlimited instant retakes, auto-graded everything, 100% pass rates → employers discount the credential → price collapses | Proctored exams at Green+, human independent project review, published pass rates, random 10% project re-audit, named reviewer of record at BB |
| **Weak or fake project requirements** | "Projects" that are essays or simulations at every level; no one ever verifies impact | Sponsor-signed charters *before* the course, sponsor verification and Finance validation at close, 90-day sustainment check; simulated track exists but is honestly labeled (Practicum) |
| **Poor / inconsistent instructor quality** | One bad facilitator per region quietly destroys corporate renewals | Facilitator certification pathway, cohort caps, observation + NPS per cohort, quarterly reviewer calibration, alumni-sourced faculty pipeline with known provenance |
| **Grade-your-own-homework assessment** | Instructor who coached the project also certifies it → rubber stamp | Structural separation of coach and assessor at Green+; external examiner at MBB |
| **Content decay** | 2010-era curriculum; learners notice; corporate buyers churn | Annual BoK review by the MBB Council; digital/AI-era content at BB+; template library versioned and updated as an alumni benefit |
| **Belt inflation / level creep** | Yellow taught as mini-Green, Green as mini-Black → every credential means less | Hard scope discipline per level (see skills matrix); prerequisites enforced; bridge assessments instead of waivers |
| **Certificate ≠ credential** | No metadata, no verification, no renewal → unverifiable line on a résumé | Open Badges with verifiable metadata, public credential verification page, renewal cycles at Green+ |
| **Funnel starvation** | Premium-only programs with no top-of-funnel die slowly | Free White Belt + creditable Yellow tuition + corporate land-and-expand packages |
| **Founder bottleneck** | Quality collapses (or growth stops) when the founder can't teach every cohort | MBB fellowship deliberately manufactures faculty; licensing model with audit rights for scale-out |
| **Discount spiral** | Corporate procurement grinds seat prices; brand goes down-market | Price floors, value-added (not price-cut) volume concessions, scholarship-not-discount vocabulary at BB/MBB |
| **Certification theater at MBB** | Selling "Master" as just a bigger course destroys the whole ladder's prestige | Application-based admission, published admit rate, panel defense with external examiner, public capstone abstracts |

---

## Build Sequence (Recommendation)

1. **Months 0–4:** White + Yellow (all three vertical flavors of White; one vertical of Yellow
   first — pick the founder's strongest industry). Launch free White Belt immediately as list-builder.
2. **Months 3–8:** Green Belt cohort v1 in the lead vertical; founder-taught; first two cohorts
   at beta pricing in exchange for testimonials and outcome data rights.
3. **Months 6–12:** Second and third vertical case libraries for Yellow/Green; corporate
   deployment package launched; IACET/CSSC accreditation applications in flight.
4. **Months 10–18:** Black Belt v1 (needs certified GBs in the pipeline first — the ladder
   builds its own market); recruit first alumni reviewers.
5. **Month 18+:** MBB fellowship cohort 1 (can admit external BBs); alumni community paid tier;
   advanced workshops.

*The ladder is also the P&L sequence: each level's launch is funded by the level below it and
staffed by the level above it.*
