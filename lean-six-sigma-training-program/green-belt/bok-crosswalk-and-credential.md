# Green Belt — Body-of-Knowledge Crosswalk & Credential Specification

Two things a hiring manager, a corporate buyer or a procurement reviewer ask about a Green
Belt credential: *what does the holder actually know and do*, and *can I check it*. This
document answers both. It is published, not internal, for the same reason the White Belt
crosswalk is: the program's differentiation is that it shows its scope and its exclusions
instead of letting a résumé imply them.

Part 1 is the coverage map against the IASSC Lean Six Sigma Green Belt body of knowledge,
with an ASQ cross-reference and the exit-competence statement that becomes the badge
description. Part 2 is the credential itself: the three gates, the two names, the badge
metadata, evidence, verification, audit, revocation and recertification.

Companion documents: the level [README](README.md) fixes the calendar, gates and objectives
G1–G8; the [project review rubric](project/review-rubric.md) fixes what "verified" means; the
[credential evidence policy](../program-operations/credential-evidence-policy.md) and the
[terms of certification](../program-operations/terms-of-certification.md) govern Part 2; the
[skills matrix](../README.md) in the program README fixes what belongs to which belt.

---

## Part 1 — Body-of-knowledge crosswalk

### 1.1 What this level claims, and what it does not

Green Belt is a **practitioner credential**. The claim: the holder led a bounded DMAIC project
on a real process, with an independently reviewed result and a sponsor's attestation, and
passed a proctored exam built to the blueprint in the README. The program aligns the
curriculum to the IASSC Lean Six Sigma Green Belt body of knowledge and publishes this map so
the alignment can be checked line by line.

Three things the claim is not:

- **Not an IASSC or ASQ certification.** The program is not affiliated with either body.
  "Aligned" means the program has mapped its own curriculum against their published outlines
  and shows the result here, including the gaps. The credential is the program's own.
- **Not full coverage of the IASSC outline.** The IASSC Green Belt outline includes several
  statistical methods (non-parametric tests, multiple regression, CUSUM and EWMA charts) that
  the program's skills matrix places at Black Belt. They are excluded on purpose, listed in
  §1.4 with the reason, and the exam does not test them. A buyer who needs those methods at
  Green Belt should know that before enrolling anyone.
- **Not a Black Belt in eight weeks.** The exit-competence statement (§1.7) ends with what the
  holder is *not* expected to do. It is written that way so the credential cannot be
  stretched.

In the other direction, the program teaches project leadership that the IASSC outline does not
list: countermeasure selection, pilot design, tollgates, sponsor management, team dynamics
and the ethics of data. §1.5 lists these so the map is honest in both directions.

### 1.2 How to read the map

**Sources, and where this document summarizes.** The IASSC outline is published by IASSC as
the *Universally Accepted Lean Six Sigma Body of Knowledge for Green Belts*, structured as
five phases (1.0 Define to 5.0 Control) with numbered subsections. The rows below follow
that numbering as the program last checked it. Subsection titles are **paraphrased, not
quoted**, and the program's reading of how deep each subsection goes is the program's own
judgement, not IASSC's. The ASQ reference in §1.6 uses the *Certified Six Sigma Green Belt
Body of Knowledge* (2022 edition) at section level, again paraphrased. Both bodies revise
their outlines; the program re-checks this map whenever a change-log entry touches Green
Belt content and whenever either body publishes a revision. If a row's numbering no longer
matches the current IASSC or ASQ document, the topic mapping still stands; report the
mismatch to the assessment lead and it is corrected in the next version. Read the original
documents when exact wording matters — this map is a mapping, not a copy.

**Status.**

| Status | Meaning |
|---|---|
| **Covered** | Taught in weeks 1–8 at the depth the skills matrix sets for Green Belt (P or L), applied on the learner's project, and examined under the blueprint section the objective maps to |
| **Covered (prerequisite)** | Taught at White or Yellow Belt and required by the Green Belt prerequisite or the bridge assessment; used at Green Belt, not re-taught; examined at Green only in the use the note describes |
| **Partially** | Taught at a shallower depth than the outline implies, or only the part of the subsection the skills matrix allows at Green; the note says which part |
| **Excluded** | Not taught, not examined, not required on the project; the reason and the owning level are in §1.4 |

**Phase relocation.** The IASSC outline places some tools in a different phase from where the
program teaches them: fishbone, the C&E matrix and FMEA sit in IASSC Measure, the program
teaches them in Week 5 (Analyze); correlation and regression sit in IASSC Improve, the
program teaches them in Week 6 (Analyze); kanban and poka-yoke sit in IASSC Control, the
program teaches them in Week 7 (Improve). The program's rule is to teach a tool in the week
the learner's project first needs it. Relocation is not a gap; the map marks it Covered with
the week named.

**Objectives.** G1–G8 are the README's objectives, carried on every exam item tag and mapped
to rubric items in each week file. **Where** names the week (Week 1–8), or the White Belt
module (M) or Yellow Belt unit (U) that owns a prerequisite.

### 1.3 Coverage map — IASSC Lean Six Sigma Green Belt

#### 1.0 Define

| IASSC ref | Topic (paraphrased) | Where | Obj. | Status | Note |
|---|---|---|---|---|---|
| 1.1.1 | Meanings of Six Sigma | White M3; Yellow U1 | — | Covered (prerequisite) | Not re-examined at Green |
| 1.1.2 | History of Six Sigma and continuous improvement | White M3 | — | Covered (prerequisite) | Not re-examined at Green |
| 1.1.3 | Deliverables of a Lean Six Sigma project | Week 1; Week 8 | G1, G7, G8 | Covered | The one-page tollgate standard and the closure package are the deliverables |
| 1.1.4 | The problem-solving strategy Y = f(x) | Week 1; Week 5 | G1, G5 | Covered | Introduced with the primary metric; made operational in the C&E matrix |
| 1.1.5 | Voice of the customer, business and employee | Week 1 | G1 | Partially | VOC → CTQ is taught and required (rubric D3). Voice of the business enters through project selection and the charter's business case; voice of the employee through stakeholder analysis. The three voices are not taught as a separate framework |
| 1.1.6 | Six Sigma roles and responsibilities | Yellow U5; Week 1 | G8 | Covered | Roles restated in the charter: sponsor, process owner, team, coach, reviewer |
| 1.2.1 | Defining a process | Week 1 | G1 | Covered | SIPOC at 5–8 steps (rubric D4) |
| 1.2.2 | Critical-to-quality characteristics | Week 1 | G1 | Covered | CTQ tree with a target and a specification basis (D3) |
| 1.2.3 | Cost of poor quality | Week 1; Week 8 | G1, G7 | Partially | Benefit classes (hard, soft, cost avoidance, clinical/service) and Finance validation are taught (C3); the COPQ categories are named in Week 1 as a project-selection lens. A COPQ study is Black Belt (skills matrix: financial validation P at Green, L at Black) |
| 1.2.4 | Pareto analysis | Yellow U3A; Week 5 | G5 | Covered (prerequisite) | Used in Week 5 stratification; examined under C1 only as a graphical tool |
| 1.2.5 | Basic metrics: DPU, DPMO, FTY, RTY, cycle time | Week 2; Week 4 | G2, G4 | Covered | Lead time, cycle time, %C&A and process cycle efficiency in Week 2; DPU, DPMO and sigma level in Week 4. Rolled yield is taught as rolled %C&A across the value stream, with RTY named as the same idea |
| 1.3.1 | Business case and project charter | Week 1 | G1 | Covered | Sponsor-signed before the course starts; rewritten live in the charter clinic (D1, D2) |
| 1.3.2 | Developing project metrics | Week 1; Week 2 | G1, G2 | Covered | Primary metric with its operational definition in the charter; metric definitions at Tollgate 1 |
| 1.3.3 | Financial evaluation and benefits capture | Week 1; Week 8 | G7 | Covered | Selection screen in Week 1; classification, Finance sign-off and the no-double-counting rule in Week 8 (C3) |
| 1.4.1–1.4.3 | Understanding Lean; history of Lean; Lean and Six Sigma together | White M3–M4; Yellow U1 | — | Covered (prerequisite) | Not re-examined at Green |
| 1.4.4 | The seven (eight) wastes | White M5–M7; Yellow U1 | G2 | Covered (prerequisite) | Applied in the Week 2 VSM as non-value-added time; examined under B1 only in that use |
| 1.4.5 | 5S | Yellow U2 | G7 | Covered (prerequisite) | Reappears in Week 8 standard work and visual controls; not re-taught |

#### 2.0 Measure

| IASSC ref | Topic (paraphrased) | Where | Obj. | Status | Note |
|---|---|---|---|---|---|
| 2.1.1 | Cause-and-effect (fishbone) diagrams | Yellow U4; Week 5 | G5 | Covered | Relocated to Analyze. Green Belt depth is fishbone → C&E matrix → checkable causes (A1) |
| 2.1.2 | Process mapping, SIPOC, value stream mapping | Week 1; Week 2 | G1, G2 | Covered | Current-state VSM built on the case, then on the learner's own process; lead time, %C&A and PCE with the basis stated — calendar or working time (M1). Future-state design is Black Belt (§1.4) |
| 2.1.3 | X-Y (cause-and-effect matrix) diagram | Week 5 | G5 | Covered | Relocated to Analyze |
| 2.1.4 | Failure modes and effects analysis | Week 5; Week 7 | G5, G6 | Covered | Working level: severity, occurrence, detection, risk priority, actions; used for cause narrowing (A1) and residual risk (I4). Design FMEA and cross-functional FMEA facilitation are Black Belt |
| 2.2.1 | Basic statistics | Yellow U3B; Week 4 | G4 | Covered | Data types, center and spread, sample versus population |
| 2.2.2 | Descriptive statistics | Week 4 | G4 | Covered | Software-first: read the summary output, then write the sentence |
| 2.2.3 | Normal distribution and normality | Week 4; Week 6 | G4, G5 | Covered | Normality checked graphically and with the software's test before capability and before a t-test or ANOVA. What to do when it fails is in §1.4 (transformation and non-parametric alternatives are Black Belt) |
| 2.2.4 | Graphical analysis | Week 5 | G5 | Covered | Histogram, box plot, scatter, multi-vari (A2) |
| 2.3.1 | Precision and accuracy | Week 3 | G3 | Covered | |
| 2.3.2 | Bias, linearity and stability | Week 3 | G3 | Partially | Taught as concepts and read from a calibration record; a linearity or stability study is not run at Green (skills matrix: MSA P at Green, L at Black) |
| 2.3.3 | Gage repeatability and reproducibility | Week 3 | G3 | Covered | The lab's Gage R&R fails on purpose; %study variation and number of distinct categories interpreted, and the response to a failed system taught (M3 ★) |
| 2.3.4 | Variable and attribute MSA | Week 3 | G3 | Covered | Attribute agreement analysis for pass/fail and coded data (M3 ★) |
| 2.4.1 | Capability analysis | Week 4 | G4 | Covered | Cp, Cpk, Pp, Ppk with the specification source named (M4) |
| 2.4.2 | Concept of stability | Week 4 | G4 | Covered | "Is it stable? then is it capable?" — the lab's title and the rubric's rule (M4) |
| 2.4.3 | Attribute and discrete capability | Week 4 | G4 | Covered | DPMO and sigma level from a p-chart baseline |
| 2.4.4 | Monitoring techniques | Week 4; Week 8 | G4, G7 | Covered | Chart selection by data type in Week 4; sustainment charts in Week 8 |

#### 3.0 Analyze

| IASSC ref | Topic (paraphrased) | Where | Obj. | Status | Note |
|---|---|---|---|---|---|
| 3.1.1 | Multi-vari analysis | Week 5 | G5 | Covered | Positional, cyclical and temporal variation read from the chart (A2) |
| 3.1.2 | Classes of distributions | Week 4; Week 6 | G4, G5 | Partially | Normal, binomial and Poisson named as the reason behind chart choice and test choice; distribution identification and fitting are not taught |
| 3.2.1 | Understanding inference | Week 5; Week 6 | G5 | Covered | |
| 3.2.2 | Sampling techniques and uses | Week 3 | G3 | Covered | Random, stratified and systematic sampling in the data collection plan (M2); sample size by the program's rules of thumb and the software's default, not by a power calculation (§1.4) |
| 3.2.3 | Central limit theorem | Week 4; Week 6 | G4, G5 | Partially | Stated as the reason X̄ charts and confidence intervals behave, and demonstrated in the lab; not derived and not examined beyond that use |
| 3.3.1 | Concepts and goals of hypothesis testing | Week 5 | G5 | Covered | The framework precedes any test (blueprint C1) |
| 3.3.2 | Practical versus statistical significance | Week 6 | G5 | Covered | Every test ends with the effect size and "the sentence you would tell your sponsor"; a p-value alone fails A3 ★ |
| 3.3.3 | Risk: alpha and beta | Week 5; Week 6 | G5 | Partially | Type I and Type II error taught and examined; power and sample-size calculation is Black Belt (§1.4) |
| 3.3.4 | Types of hypothesis test | Week 6 | G5 | Covered | The hypothesis-test selector in the toolkit |
| 3.4.1 | One- and two-sample t-tests | Week 6 | G5 | Covered | Including the paired t-test for before/after comparison (I3 ★) |
| 3.4.2 | One-sample variance test | — | — | Excluded | §1.4 |
| 3.4.3 | One-way ANOVA | Week 6 | G5 | Covered | With the residual and equal-variance checks read from the output |
| 3.5.1–3.5.6 | Non-parametric tests: Mann-Whitney, Kruskal-Wallis, Mood's median, Friedman, one-sample sign, one-sample Wilcoxon | — | — | Excluded | §1.4 |
| 3.5.7 | One- and two-sample proportion tests | Week 6 | G5 | Partially | The two-proportion comparison is taught as the 2 × 2 chi-square, and the selector names the two-proportion test as its equivalent; the one-sample proportion test is named, not practiced |
| 3.5.8 | Chi-square: contingency tables and goodness of fit | Week 6 | G5 | Covered | Contingency tables practiced on the case and on the learner's data; goodness of fit read from output |
| 3.5.9 | Test of equal variances | Week 6 | G5 | Partially | Read from software as the assumption check before a two-sample t-test or ANOVA; not taught as a stand-alone test |

#### 4.0 Improve

| IASSC ref | Topic (paraphrased) | Where | Obj. | Status | Note |
|---|---|---|---|---|---|
| 4.1.1 | Correlation | Week 6 | G5 | Covered | With the rule that a correlation is not a verified cause until the mechanism is tested |
| 4.1.2 | Simple linear regression equations | Week 6 | G5 | Covered | Slope, intercept, R² and the practical sentence (A3 ★ where used) |
| 4.1.3 | Residual analysis (simple regression) | Week 6 | G5 | Covered | Residual plots read from output as the assumption check |
| 4.2.1 | Non-linear regression | — | — | Excluded | §1.4 |
| 4.2.2 | Multiple linear regression | — | — | Excluded | §1.4 |
| 4.2.3 | Confidence and prediction intervals | Week 6 | G5 | Partially | Confidence intervals for a mean, a difference and a proportion are taught and examined; prediction intervals from a regression are not |
| 4.2.4 | Residual analysis (multiple regression) | — | — | Excluded | §1.4 |
| 4.2.5 | Data transformation, Box-Cox | — | — | Excluded | §1.4 |

The IASSC Improve phase is a statistics section. The program's Week 7 (Improve) is about
countermeasures, and is listed in §1.5.

#### 5.0 Control

| IASSC ref | Topic (paraphrased) | Where | Obj. | Status | Note |
|---|---|---|---|---|---|
| 5.1.1 | Control methods for 5S | Yellow U2; Week 8 | G7 | Covered (prerequisite) | 5S audit from Yellow Belt; standard work and visual controls in Week 8 (C2) |
| 5.1.2 | Kanban | Week 7 | G6 | Partially | Pull and kanban in the manufacturing flow module, with queue management (TXN) and patient flow (HC) as the vertical equivalents. Skills matrix P: a Green Belt sizes a simple kanban with support; designing a pull system is Black Belt |
| 5.1.3 | Poka-yoke | Week 7 | G6 | Covered | Mistake-proofing clinic (I4) |
| 5.2.1 | Data collection for SPC | Week 3; Week 8 | G3, G7 | Covered | |
| 5.2.2 | I-MR chart | Week 4 | G4 | Covered | Read and constructed |
| 5.2.3 | X̄-R chart | Week 4 | G4 | Covered | Read and constructed |
| 5.2.4–5.2.6 | u, p and np charts | Week 4 | G4 | Covered | Read and constructed; the program adds the c chart |
| 5.2.7 | X̄-S chart | Week 4 | G4 | Partially | Read and interpreted; construction, and the choice against X̄-R for larger subgroups, is named but not practiced |
| 5.2.8 | CUSUM chart | — | — | Excluded | §1.4 |
| 5.2.9 | EWMA chart | — | — | Excluded | §1.4 |
| 5.2.10 | Control methods | Week 8 | G7 | Covered | |
| 5.2.11 | Control chart anatomy | Week 4 | G4 | Covered | Center line; control limits from the process and their difference from specification limits from the customer; the run rules the program uses |
| 5.2.12 | Subgroups, impact of variation, sampling frequency | Week 4; Week 8 | G4, G7 | Partially | Rational subgrouping taught for the basic charts; subgrouping decisions at scale are Black Belt |
| 5.2.13 | Center line and control limit calculations | Week 4 | G4 | Covered | By hand once for I-MR, then by software |
| 5.3.1 | Cost-benefit analysis | Week 8 | G7 | Covered | Finance validation (C3) |
| 5.3.2 | Elements of the control plan | Week 8 | G7 | Covered | Metric, method, frequency, owner, response (C1 ★) |
| 5.3.3 | Elements of the response plan | Week 8 | G7 | Covered | Named in the control plan and rehearsed against the sustainment chart |

### 1.4 Explicit exclusions, and why

Everything below is out of scope at Green Belt on purpose. The owning level is from the
skills matrix in the program README. Each row says what a Green Belt does instead, because
"not taught" must not mean "stuck".

| Excluded at Green Belt | Where the outlines list it | Owned by | Why it is excluded here | What a Green Belt does instead |
|---|---|---|---|---|
| Design of experiments beyond awareness | ASQ V.A (basic terms, graphs and plots); not in the IASSC Green Belt outline | Black Belt (L) — the centerpiece of that course, with a live practicum | Skills matrix: A at Green. Designing, running and analyzing even a 2² factorial needs blocking, replication and interaction reading that a Green Belt has no project time to practice; taught in passing it produces confident wrong answers | Weeks 6 and 7 teach the boundary: a pilot changes one thing and compares before with after; when two or more factors must move at once, the Green Belt names it as an experiment and escalates to a Black Belt. The exam tests recognizing that boundary, not running the design |
| Multiple linear regression; non-linear regression; logistic regression | IASSC 4.2.1, 4.2.2, 4.2.4; ASQ IV.A (linear only) | Black Belt (P) | Skills matrix: simple regression P at Green, multiple and logistic at Black. Multiple regression without diagnostics is the most common way a cause gets "verified" wrongly | Simple regression on one X; stratified graphical analysis for a second X; escalate when more than one continuous X is in play |
| Non-parametric tests: Mann-Whitney, Kruskal-Wallis, Mood's median, Friedman, sign, Wilcoxon | IASSC 3.5.1–3.5.6 | Black Belt (README: "non-parametric alternatives") | Choosing among them takes judgement about distribution shape and the question asked; the program would rather a Green Belt know what to do when normality fails than half-know six tests | The Week 6 rule: check normality graphically; with larger samples and a mild departure, use the t-test or ANOVA and state the departure; with small samples and a serious departure, report the graphical evidence, state that the assumption failed, and bring the question to the coach or a Black Belt. The selector routes this case to "escalate", and a project that does so honestly earns A4 |
| One-sample variance test | IASSC 3.4.2 | Black Belt | Rarely the question on a Green Belt project; the variance check that matters is read as an assumption (3.5.9) | State the assumption check from the software output |
| Data transformation, Box-Cox; non-normal capability | IASSC 4.2.5; README Black Belt objective 3 | Black Belt | Transforming data changes what the sentence to the sponsor means; a Green Belt should not do it unsupervised | Report capability on the untransformed data with the normality result stated, or report DPMO, which needs no distribution |
| Power and sample-size calculation | IASSC 3.3.3 in full; ASQ IV.B | Black Belt (README objective 3) | Requires an effect-size estimate the learner cannot yet make well | Sample size by the program's rules of thumb and the software's default, with the limit acknowledged (A4) |
| Advanced SPC: CUSUM, EWMA, X̄-S construction, short-run charts, subgrouping at scale | IASSC 5.2.7–5.2.9, 5.2.12 | Black Belt (P) | Skills matrix: advanced SPC not covered at Green. Small-shift detection is a choice a Black Belt makes with the process owner | The basic chart matched to the data type, with the run rules; if a small sustained shift matters, say so in the control plan and ask for help |
| Future-state value stream design | Skills matrix row | Black Belt (L); awareness at Green | Green Belts map the current state and improve one bounded slice; designing the future state moves work across functions | Current-state VSM with the improvement located on it |
| Kaizen event leadership | Skills matrix row; ASQ V.C | Black Belt (L: facilitate); Green co-leads | Facilitation is assessed by observation at Black Belt | Kaizen basics in Week 7; a Green Belt co-leads with a trained facilitator |
| Change leadership and stakeholder strategy | Skills matrix row | Black Belt (L) | Assessed by observed practicum at Black Belt, which Green Belt has no time for | A stakeholder map with a named resistance risk and a planned response (D4); sponsor management threaded through every week |
| Design for Six Sigma / DMADV | ASQ I.C | Black Belt (A); Master Black Belt (P) | A design methodology, not an improvement one | Recognize at Tollgate 1 when a process needs redesign rather than improvement, and say so |
| Total productive maintenance, OEE | ASQ VI.C | Black Belt (README objective 5) | System-level Lean | Named in the manufacturing flow module as a Black Belt tool |
| Simulation (Monte Carlo, discrete event); process mining | Skills matrix rows | Black Belt (A); Master Black Belt (P) | Beyond the level | Awareness mention only where a vertical case would use it |

Two consequences the program states plainly:

1. **The Green Belt exam does not test any excluded method**, except as a "when NOT to use
   this / when to escalate" judgement item, which the blueprint permits under sections C2
   and D.
2. **The project rubric does not reward an excluded method.** A learner who runs a multiple
   regression on their project is scored on whether the cause was verified and the sentence
   is right, not on the method's sophistication. A wrong multiple regression scores lower
   than a right two-sample t-test.

### 1.5 What this program teaches that the IASSC outline does not list

The IASSC Green Belt outline is a statistics-and-tools outline; it does not list the work of
leading a project. The program does, and examines it under blueprint sections D and F.

| Program topic | Where | Obj. | Why it is here |
|---|---|---|---|
| Project selection and scoping; stakeholder analysis | Week 1 | G1, G8 | The charter is signed before the course; scoping is what makes an eight-week project possible |
| Countermeasure generation (SCAMPER, benchmarking) and selection matrices | Week 7 | G6 | Rubric I1: more than one option, chosen against stated criteria, aimed at the verified cause |
| Pilot design: written prediction, identical success measure, stop rule | Week 7 | G6 | Rubric I2 and I3 ★ — the before/after evidence rests on the pilot design |
| Kaizen basics and the vertical flow module | Week 7 | G6 | Pull and setup reduction (MFG), queue management (TXN), patient flow (HC) |
| Standard work written with the people doing the work | Week 8 | G7 | Rubric C2 |
| Tollgates: ten minutes, one page, sponsor in the room | Weeks 2, 4, 6, 8 | G8 | Rubric S1; the A3 is the record, not a deck |
| Sponsor management, team dynamics, resistance basics | Threaded | G8 | Blueprint section F |
| Ethics of data: never remove inconvenient points, never change the operational definition between before and after, never reconstruct a baseline from memory | Threaded; Week 3; Week 7 | G8 | A data-ethics finding stops a review (rubric, reviewer guidance) |
| Storytelling the project | Week 8 | G8 | The tollgate rehearsal |
| Software parity: every analysis in Minitab, Excel and R or Python | Every week | G4, G5 | So the credential does not depend on one vendor's license |

### 1.6 ASQ Certified Six Sigma Green Belt cross-reference (section level)

ASQ's outline is organized differently from IASSC's: six sections, each with an item count on
ASQ's own 100-item exam. The counts below are from the 2022 edition as the program last
checked it, and the subsection lists are paraphrased; confirm both against the current ASQ
document before quoting them to a buyer.

| ASQ section (items) | Subsections as commonly published | Where | Status |
|---|---|---|---|
| I. Overview: Six Sigma and the organization (13) | A. Six Sigma and organizational goals; B. Lean principles in the organization, including value stream mapping; C. Design for Six Sigma methodologies | White, Yellow (prerequisite); Week 1 for project-to-goal linkage; Week 2 for VSM | Partially — I.A and I.B covered; I.C excluded (§1.4) |
| II. Define (23) | A. Project identification; B. Voice of the customer; C. Project management basics; D. Management and planning tools; E. Business results for projects; F. Team dynamics and performance | Week 1; Week 2; Week 8; threaded | Covered, except II.D Partially — the tree diagram (as the CTQ tree) and the prioritization matrix (as the selection matrix) are taught; affinity diagrams, interrelationship digraphs, process decision program charts and activity network diagrams are not |
| III. Measure (23) | A. Process analysis and documentation; B. Probability and statistics; C. Statistical distributions; D. Collecting and summarizing data; E. Measurement system analysis; F. Process and performance capability | Weeks 2–4 | Covered, except III.B and III.C Partially — basic probability and the normal, binomial and Poisson distributions as the basis for chart and test choice; probability rules, the t, F and chi-square distributions as objects in their own right, and distribution fitting are not taught as such |
| IV. Analyze (15) | A. Exploratory data analysis: multi-vari, correlation, linear regression; B. Hypothesis testing: basics; tests for means, variances and proportions; ANOVA; chi-square | Weeks 5–6 | Covered, except tests of variances and the proportion tests Partially (§1.3, rows 3.5.7 and 3.5.9) |
| V. Improve (15) | A. Design of experiments: basic terms, graphs and plots; B. Root cause analysis; C. Lean tools: waste elimination, cycle-time reduction, kaizen | Week 5 (V.B); Week 7 (V.C); DOE awareness in Weeks 6–7 | V.B and V.C Covered; V.A Partially — DOE vocabulary and reading a main-effects plot at awareness level; no design or analysis (§1.4) |
| VI. Control (11) | A. Statistical process control; B. Control plan; C. Lean tools for process control: total productive maintenance, visual controls | Week 4; Week 8 | VI.A and VI.B Covered; VI.C Partially — visual controls from Yellow Belt and Week 8; TPM excluded (§1.4) |

Where ASQ and IASSC differ, the program follows its skills matrix, not either outline. The
visible effect: ASQ's DOE-at-awareness matches the program (A at Green); IASSC's
non-parametrics and multiple regression at Green do not, and are excluded.

### 1.7 Exit-competence statement (what a holder can do)

Standard track:

> A Certified Lean Six Sigma Green Belt has led a bounded DMAIC project on a real process they
> touch, independently reviewed and sponsor-verified. They can write a cause-free charter
> with a sponsor and translate a customer requirement into a measurable CTQ; map the
> current-state value stream and quantify it with lead time, %C&A and process cycle
> efficiency; plan data collection with an operational definition, run a Gage R&R or
> attribute agreement study and act on its result; state stability from the right basic
> control chart before claiming capability, and report Cp/Cpk or DPMO with the specification
> source named; narrow causes with fishbone, C&E matrix and working-level FMEA, read
> stratified graphs, and verify a cause with a t-test, one-way ANOVA, chi-square or simple
> regression, correctly chosen, with assumptions checked and the practical effect stated in
> plain language; select a countermeasure against stated criteria, pilot it with a prediction
> and a stop rule, and show before/after evidence on the same metric and definition; hand a
> control plan with a response plan to a named owner; and present each phase to a sponsor in
> ten minutes on one page. They are not expected to design an experiment, run multiple or
> logistic regression or non-parametric tests, use CUSUM or EWMA charts, design a
> future-state value stream, or lead cross-functional change; a Green Belt who meets such a
> problem names it and escalates it.

Practicum track — the same statement with the first sentence replaced and one sentence added
at the end:

> A Certified Lean Six Sigma Green Belt (Practicum) has led a bounded DMAIC project on a
> simulated process with a real, messy dataset, with the practicum instructor acting as
> sponsor, independently reviewed against the same rubric. […] They have not yet led a
> sponsored project on a live process.

The statement for the holder's track is the badge `description` and the text a hiring
manager sees on verification. It is the README's minimally competent candidate definition,
written for the reader instead of the Angoff panel.

---

## Part 2 — Credential specification

### 2.1 Award criteria (all three gates required)

1. **Exam.** 100 items, 3 hours, proctored — online for individuals, on-site for corporate
   cohorts — assembled to the README blueprint from the 350-item tagged bank. Provisional cut
   80% pending the modified-Angoff panel; once the panel has run, the cut is published as
   "set by modified Angoff, panel of N, [month year]" per the
   [assessment policy](../assessment/standard-setting-and-item-policy.md). One included
   retake after a 14-day study period; the retake form shares ≤ 25% of items with prior
   attempts and never the items previously missed.
2. **Project.** Scored against the published 100-point
   [rubric](project/review-rubric.md) by a certified Black Belt or Master Black Belt
   reviewer who is not the learner's instructor or coach. Pass is **75 points with every
   mandatory item earned**: ★ M3 measurement system analysis attempted, ★ A3 root cause
   verified with data, ★ I3 before/after evidence, ★ C1 control plan handed to a named
   owner. One revise-and-resubmit cycle included. A data-ethics finding stops the review.
3. **Sponsor verification.** The sponsor attests on the program's form
   (`project/sponsor-verification-and-finance-validation.md`) that the project happened on
   the process chartered, that the results are real, and — where money is claimed — that
   Finance validated the figure. On the Practicum track the practicum instructor completes
   the form as acting sponsor, and the badge says so.

The gates can be met in any order; the credential is issued on the date the last one is met.
Project completion may run up to six months after Week 8, with monthly coaching checkpoints
until closure; the credential is withheld until the project closes, the learning is not
(README). A learner who passes the exam but whose project does not close within the six
months keeps the exam result for twelve months from the cohort's end and may bring a
re-scoped or new project to review under the requirements published at their enrollment
(terms §3.3).

The award criteria are the requirements published at enrollment. Any change is logged in the
change log with an effective date and never applied to a cohort already enrolled.

### 2.2 What the credential is called

Two names, and they are different credentials:

- **"Certified Lean Six Sigma Green Belt"** — all three gates met on a real, sponsored
  process (an employer project or a partner-project-pool project).
- **"Certified Lean Six Sigma Green Belt (Practicum)"** — all three gates met on the
  Practicum track's simulated project, scored on the same rubric, with the practicum
  instructor as acting sponsor.

The parenthetical is part of the name on every surface: badge, PDF certificate, verification
page, LMS record, alumni directory. The Practicum credential is not a lesser exam or a lesser
rubric; what it lacks is a live process, a real sponsor and a real sustainment check, and the
name says so. A Practicum holder who later completes a sponsored project — for example
through the partner-project pool — has it reviewed under the standard rubric and sponsor form
and is then issued the standard credential; the Practicum badge stays in their record and is
not replaced silently.

Black Belt admission requires a certified Green Belt **and** one completed DMAIC project on a
real process (program README, §4). The standard credential satisfies both; the Practicum
credential satisfies the first only.

### 2.3 Badge metadata (Open Badges 3.0 / Credly-compatible)

| Field | Value |
|---|---|
| `name` | Certified Lean Six Sigma Green Belt · or · Certified Lean Six Sigma Green Belt (Practicum) |
| `description` | The exit-competence statement for the track (§1.7), verbatim |
| `criteria` | URL to this document's Part 2 |
| `alignment` | Two entries: IASSC Lean Six Sigma Green Belt body of knowledge; ASQ Certified Six Sigma Green Belt body of knowledge. Each links to §1.3 or §1.6 and to the exclusions in §1.4, and carries the words "program-mapped; not an IASSC or ASQ certification" |
| `skills` | DMAIC project leadership; value stream mapping (current state); measurement system analysis; process capability; control charts (basic); hypothesis testing (t-test, ANOVA, chi-square); simple regression; FMEA; mistake-proofing; pilot design; control plans; tollgate presentation |
| `learningHours` | 56 (structured). Project hours (40–60) are learner-reported and carried separately as `projectHours` |
| `track` | `standard` \| `practicum` |
| `assessmentType` | Proctored exam (100 items; cut published with its Angoff date) **+ rubric-reviewed real project by a named independent reviewer + sponsor verification**. Practicum: proctored exam **+ rubric-reviewed simulated project by a named independent reviewer + instructor-as-sponsor verification** |
| `reviewStatus` | `human-reviewed`, always, at Green Belt. The field is kept for consistency with the lower levels; the sampling statement reads "100% of Green Belt projects are reviewed by a named independent reviewer" |
| `projectDomain` | The vertical (`manufacturing-supply-chain` \| `healthcare` \| `transactional-services`) plus a process type in the program's vocabulary — for example "changeover" (MFG), "discharge process" (HC), "order-to-cash invoicing" (TXN). Never the employer's name unless the holder chooses evidence option 3 and the organization consented in the rollout or partner-pool agreement |
| `verifiedImpact` | `sponsor-verified` \| `sponsor-verified, finance-validated` \| `sponsor-verified, mission-metric` (clinical or service impact, no money claimed) \| `simulated` (Practicum). Set from the sponsor form, never from the learner's report |
| `impactClass` | `hard` \| `soft` \| `cost-avoidance` \| `clinical-service` — the rubric C3 classification. The amount is never on the badge |
| `sustained` | `pending` (before the day-90 check) \| `true` \| `false` \| `unreachable` (sponsor did not answer two requests) \| `not-applicable` (Practicum). Set only by the reviewer of record from the sustainment check (§2.3a) |
| `reviewerOfRecord` | The independent reviewer's name and the verification URL of their own credential. Always held in the record; shown on the badge only with the holder's evidence consent (§2.4) |
| `ceu` | Empty until IACET accreditation is granted; then `5.6 IACET CEUs` for awards from the accreditation date forward. Until then the certificate carries the words "5.6 IACET CEUs pending accreditation" and no CEU is claimed (§2.10) |
| `issuedOn` | The date the third gate was met |
| `expires` | `issuedOn` + 3 years; renewed under §2.8 |
| `issuer` | Program issuer profile, with accreditation identifiers as they are granted |

`assessmentType`, `verifiedImpact` and `sustained` are the three fields that separate this
badge from a certificate of attendance, and the reason the metadata is worth designing: each
is true at the level of the individual holder, not the marketing page.

#### 2.3a The `sustained` flag

The flag answers one question the sponsor is asked 90 days after closure (the date the
project passed review), with at least 60 days of live monitoring behind the answer (rubric
C1): *did the control plan hold?* — meaning the monitored metric stayed at the improved level
on the sustainment chart, and the response plan was used when it did not. The reviewer of
record asks; the sponsor answers; the reviewer sets the flag and files the sponsor's answer
in the project record. The flag feeds the program's published sustainment rate on the
[outcomes page](../program-operations/outcomes-page.md) and the badge.

`false` is an outcome, not a fault. A control plan that did not hold after handover says
something about the process, the handover or the organization. It is never grounds for
revocation, never changes the credential, and is shown on the verification page with the
same prominence as `true`. Holders are told this at award so nobody is tempted to shade the
sponsor's answer. `unreachable` is shown as such; the program does not convert silence into
a `true`.

### 2.4 Evidence — the credential that shows the work

With the holder's consent at award — three choices, default *badge only* — the badge carries
an Open Badges 3.0 `evidence` entry, per the
[credential evidence policy](../program-operations/credential-evidence-policy.md). At Green
Belt the evidence item is:

- **The A3** (rubric S1: the A3 or storyboard is the record) after the program's redaction
  pass: problem, baseline, cause verified, countermeasure, before/after evidence, control
  plan. Where the learner used a storyboard, the one-page tollgate summary stands in.
- **The rubric result:** the six section scores (Define 15, Measure 20, Analyze 25,
  Improve 20, Control 15, Storytelling 5), the status of each ★ item in one sentence, and
  whether a revise-and-resubmit cycle was used.
- **The reviewer's feedback**, ≤ 4 sentences, and the reviewer of record's name linked to
  their own credential's verification page.
- **The sponsor verification status** — `verifiedImpact` and `impactClass`. The form itself
  is not published; the sponsor's organization is named only under consent option 3.

Redaction (policy §3) is done by the program before the holder sees the version they are
consenting to: names other than the holder's and the reviewer's, including in images;
customer, patient, supplier and employee identifiers; figures the sponsor marked
commercially sensitive; and anything the reviewer flagged for escalation, which is never
published. The financial amount is treated as commercially sensitive unless the sponsor
released it on the verification form. The holder can change their choice at any time from
their credential page; withdrawing evidence never affects the credential.

On the Practicum track the evidence is the same A3 and scores against the simulated case, and
the entry says "simulated dataset; instructor as sponsor".

### 2.5 Verification page

Every badge carries a public verification URL. It is permanent and stays resolvable if the
holder's account closes (terms §3.7).

**Always shown:** holder name · credential name, including "(Practicum)" where it applies ·
issue date · criteria met, each of the three gates named · `track` · `verifiedImpact` ·
`sustained`, with the date of the day-90 check · `reviewStatus` and the sampling statement
("every Green Belt project is reviewed by a named independent reviewer; 10% of certified
projects are re-reviewed each year, and the agreement rate is published") · recertification
state (`active` \| `inactive` \| `revoked`) with its date · the exit-competence statement ·
a link to this document.

**With evidence consent:** the redacted A3, rendered on the page rather than offered as a
download · the six section scores and the ★ item statuses · the reviewer's feedback · the
reviewer of record's name and verification link · the date of review · `projectDomain` in
the program's vocabulary · under option 3 only, the organization's name.

**Never shown:** the exam score, item-level answers or attempt count; the financial amount
unless the sponsor released it; coaching notes; reflection text; the sponsor form; anything
from another learner in the cohort; and whether this particular project was among the 10%
re-reviewed — audit results are published in aggregate so that an un-audited badge is not
read as a weaker one.

The verification page is the employer's view. The program does not answer employer requests
for more than the page shows, and says so on the page (policy §6).

### 2.6 Annual re-review audit (10%)

The program audits its own reviewers (terms §3.8). Each year the assessment lead draws a
random 10% of the projects certified in the previous twelve months — at least five, or all of
them when fewer than five were certified — stratified by track and vertical where numbers
allow.

1. **Blind re-score.** A calibrated reviewer who was not the original reviewer, instructor or
   coach re-scores the project from the submitted materials without seeing the original
   score.
2. **Sponsor re-contact.** For sampled standard-track projects, the auditor confirms with the
   sponsor that the verification form is theirs and that the day-90 answer stands.
3. **Comparison**, on the rubric's own calibration rule: a difference of more than 5 points
   total, or any disagreement on a ★ item, is a finding.

| Finding | Reviewer | Credential |
|---|---|---|
| Within 5 points; ★ items agree | Nothing; the pair is logged | Unchanged |
| More than 5 points apart; ★ items agree | Original reviewer re-calibrates on the anchor set before their next review | Unchanged |
| A ★ item the original reviewer awarded is not earned in the re-score | A third calibrated reviewer scores blind; two of three decide. If the item was not earned, the original reviewer re-calibrates and their next three reviews are second-read | Unchanged — the holder met the published requirements as the program assessed them, and the error is the program's. The holder is told in writing and offered a no-fee coached resubmission of that item within six months. If they take it, the evidence entry (where attached) shows the updated review; if not, nothing changes |
| Evidence of fabricated data, a forged sponsor signature or another person's project | Not a reviewer matter | Referred to the integrity process (terms §4): the holder sees the evidence and has 14 days to respond before any decision |

The program publishes each year, on the outcomes page with n and period: the sample size, the
agreement rate on ★ items, the mean absolute score difference, and the number of integrity
referrals. A bad year is published like a good one.

### 2.7 Revocation

Grounds, per the [terms of certification](../program-operations/terms-of-certification.md)
§4: proxy completion of the exam; sharing or receiving exam content; fabricated data,
baselines or results; a forged or coerced sponsor verification; submitting another person's
project as one's own; misrepresenting the credential — including presenting a Practicum
credential as a sponsored-project credential, or an `inactive` credential as active, after
one written notice.

Process: the assessment lead — not the instructor, coach or reviewer — puts the evidence to
the holder in writing; the holder has 14 days to respond; outcomes range from a required
resubmission to revocation and, for repeated or severe cases, a bar on future enrollment.
Appeals follow terms §5: a second calibrated reviewer re-scores blind at stage 1; an external
practitioner sits on the stage 2 panel; the stage 2 fee is refunded if the appeal succeeds in
any part.

On revocation the verification URL resolves to "revoked" with a date and nothing else; the
evidence entry is removed; the program does not publish the reason. A revoked Green Belt does
not satisfy Black Belt admission.

What is **not** a ground for revocation: a `sustained` flag of `false` or `unreachable`; a
control plan the organization later abandoned; a re-review score difference; a benefit
estimate Finance later revised; an honest pilot that did not move the metric. None of these
is misconduct, and the program says so here so that no holder is tempted to make a result
look better than it was.

### 2.8 Recertification — the three-year rule

The Green Belt credential expires three years from `issuedOn` and is renewed on evidence,
not on payment (terms §9). Over the three-year cycle the holder records:

- **12 CEUs** — one CEU is ten contact hours, on the IACET basis once accredited and on the
  program's own hours record on the same basis before then — from any mix of: monthly case
  clinics and tool sessions in the alumni community; program showcase attendance; a
  documented new improvement project of any size, including a Yellow-Belt-sized Just-Do-It,
  submitted on the A3 template and completeness-checked (not rubric-scored); coaching a
  Yellow Belt mini-project; a control-plan audit of the holder's own certified project with
  its sustainment chart; reviewer-calibration participation for holders who have become
  reviewers.
- **At least one practice item** among the 12: a new project, a coaching record or a
  control-plan audit. Attendance alone does not renew a practitioner credential.

All of it is earnable at no cost through the alumni community, by design. A modest
administrative fee covers the review of the renewal record and is published with the fees.

On renewal the program issues a fresh assertion with a new `expires`, the original
`issuedOn` retained, and the same verification URL. A lapsed credential moves to `inactive`
on the verification page with the lapse date; it is never deleted, it keeps its evidence, and
it returns to `active` when the current cycle's requirements are met — the program does not
erase work that was genuinely done. Black Belt admission and reviewer roles require an
`active` Green Belt. Practicum credentials renew on the same rule.

### 2.9 What the learner receives

A digital badge; a one-page PDF certificate carrying the credential's full name,
`verifiedImpact` and a verification QR code; a completion record in the LMS transcript; the
Green Belt toolkit in their vertical's vocabulary, including the hypothesis-test selector;
their scored rubric feedback and the reviewer's report; a personalized "Path to Black Belt"
citing their project; and alumni community access with the renewal path in §2.8. On the
standard track the day-90 sustainment result goes to the holder and the sponsor together.
Coaching notes stay with the coach and are never part of the record.

### 2.10 CEUs

5.6 IACET CEUs are **pending accreditation**. Until accreditation is granted no CEU is claimed
on the badge, the certificate or the course description; the words "pending accreditation"
appear wherever the number appears. Once granted, CEUs apply to awards from the accreditation
date forward, not retroactively — a holder from an earlier cohort is told this plainly rather
than left to assume. The 56 structured hours are what the application counts; project hours
are not.

---

*v1.0 · 2026-09-20*
