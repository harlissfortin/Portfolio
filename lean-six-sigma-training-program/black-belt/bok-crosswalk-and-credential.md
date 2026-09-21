# Black Belt — Body-of-Knowledge Crosswalk & Credential Specification

A Black Belt credential is the one a corporate buyer pays most for and checks least. Two
questions decide whether it is worth the money: *what can the holder do that a Green Belt
cannot*, and *who put their name to it*. This document answers both, in public, for the same
reason the Green Belt crosswalk does: the program shows its scope, its exclusions and its
reviewer, instead of letting a résumé imply them.

Part 1 is the coverage map against the IASSC Lean Six Sigma Black Belt body of knowledge,
with the exclusions that belong to Master Black Belt, an ASQ cross-reference and the
exit-competence statement that becomes the badge description. Part 2 is the credential itself:
the five gates, the name, the badge metadata, evidence, verification, audit, revocation,
recertification and the admission assessment for Green Belts certified elsewhere.

Companion documents: the level [README](README.md) fixes the calendar, gates and objectives
B1–B10; the [capstone review rubric](project/review-rubric.md) fixes what "verified" means;
the [charter and strategic linkage template](project/charter-and-strategic-linkage.md) fixes
the scale test; the [credential evidence policy](../program-operations/credential-evidence-policy.md)
and the [terms of certification](../program-operations/terms-of-certification.md) govern Part
2; the [skills matrix](../README.md) in the program README fixes what belongs to which belt;
the [Green Belt crosswalk](../green-belt/bok-crosswalk-and-credential.md) is the prerequisite
document this one builds on.

---

## Part 1 — Body-of-knowledge crosswalk

### 1.1 What this level claims, and what it does not

Black Belt is an **advanced practitioner and change leader credential**. The claim: the holder
led a cross-functional, strategically linked improvement project to Finance- or
mission-metric-validated impact with a team they did not manage; designed, ran and analyzed a
factorial experiment under observation; led a kaizen event under observation; reviewed two
Green Belt tollgates to the reviewer standard; and passed a proctored, open-notes exam built
to the blueprint in the README. A named Master Black Belt signed the certificate as reviewer
of record. The program aligns the curriculum to the IASSC Lean Six Sigma Black Belt body of
knowledge and publishes this map so the alignment can be checked line by line.

Three things the claim is not:

- **Not an IASSC or ASQ certification.** The program is not affiliated with either body.
  "Aligned" means the program has mapped its own curriculum against their published outlines
  and shows the result here, including the gaps. The credential is the program's own.
- **Not a Master Black Belt.** The skills matrix places response-surface and advanced DOE,
  simulation, deployment architecture, Hoshin Kanri, training design and coaching mastery at
  Master Black Belt, and the program teaches them at Black Belt only to the awareness depth
  the matrix allows. §1.4 lists each with the reason. A buyer who needs someone to design a
  deployment or run a response-surface optimization unaided is buying the wrong belt, and
  this document says so before the invoice.
- **Not full coverage of the IASSC outline.** Three of the nine non-parametric items in the
  IASSC Analyze phase (Friedman, one-sample sign, one-sample Wilcoxon) and the one-sample
  variance test are not taught; the second-order model in the IASSC full-factorial section is
  taught to awareness only. Each is in §1.4 with the reason and what the holder does instead.

In the other direction, the IASSC Black Belt outline is a statistics-and-tools outline. It
does not list Lean at system level, change leadership, kaizen leadership, coaching, program
economics or the parts of DOE (blocking, unreplicated designs, sequential strategy) the
program spends most of Module 5 on. §1.5 lists everything the program teaches that the outline
does not, so the map is honest in both directions; the ASQ cross-reference in §1.6 picks most
of it up, because ASQ's outline is organized around the role rather than the toolset.

### 1.2 How to read the map

**Sources, and where this document summarizes.** The IASSC outline is published by IASSC as
the *Universally Accepted Lean Six Sigma Body of Knowledge for Black Belts*, structured as
five phases (1.0 Define to 5.0 Control) with numbered subsections. Its Define, Measure,
Analyze and Control phases are, as the program last checked them, the same numbered
subsections as the Green Belt outline; the Black Belt outline adds three Improve subsections
on designed experiments (4.3 designed experiments, 4.4 full factorial experiments, 4.5
fractional factorial experiments). The rows below follow that numbering as the program last
checked it. Subsection titles are **paraphrased, not quoted**, and the program's reading of
how deep each subsection goes is the program's own judgement, not IASSC's. The ASQ reference
in §1.6 uses the *Certified Six Sigma Black Belt Body of Knowledge* (2022 edition) at section
level, again paraphrased, with the item counts as the program last checked them. Both bodies
revise their outlines; the program re-checks this map whenever a change-log entry touches
Black Belt content and whenever either body publishes a revision. If a row's numbering no
longer matches the current IASSC or ASQ document, the topic mapping still stands; report the
mismatch to the assessment lead and it is corrected in the next version. Read the original
documents when exact wording matters — this map is a mapping, not a copy.

**Status.**

| Status | Meaning |
|---|---|
| **Covered** | Taught in Modules 1–8 at the depth the skills matrix sets for Black Belt (P or L), applied on the capstone or a practicum, and examined under the blueprint section the objective maps to |
| **Covered (prerequisite)** | Taught and examined at Green Belt (or below) and required by the Green Belt prerequisite or the calibration assessment in §2.9; used at Black Belt, not re-taught; examined at Black only in the use the note describes |
| **Partially** | Taught at a shallower depth than the outline implies, or only the part of the subsection the skills matrix allows at Black; the note says which part |
| **Excluded** | Not taught, not examined, not required on the capstone; the reason and the owning level are in §1.4 |

**Phase relocation.** The IASSC outline places some tools in a different phase from where the
program teaches them: confidence and prediction intervals and Box-Cox sit in IASSC Improve,
the program teaches them in Module 3 (weeks 4–5, the Measure baseline); kanban sits in IASSC
Control, the program teaches pull-system design in Module 7; cost-benefit analysis sits in
IASSC Control, the program teaches program economics in Module 8. The program's rule is to
teach a tool in the module the candidate's capstone first needs it. Relocation is not a gap;
the map marks it Covered with the module named.

**Objectives and modules.** B1–B10 are the README's objectives, carried on every exam item
tag and mapped to rubric items in each module file. **Where** names the module and section
(M1 §1.3), the Green Belt week (GB Week 6), or the White Belt module (White M) or Yellow Belt
unit (Yellow U) that owns a prerequisite. Module files: [M1](modules/m1-strategic-define.md) ·
[M2](modules/m2-measurement-systems.md) · [M3](modules/m3-data-foundations.md) ·
[M4](modules/m4-modeling.md) · [M5](modules/m5-design-of-experiments.md) ·
[M6](modules/m6-advanced-spc.md) · [M7](modules/m7-lean-systems.md) ·
[M8](modules/m8-leading-change-and-coaching.md).

### 1.3 Coverage map — IASSC Lean Six Sigma Black Belt

#### 1.0 Define

| IASSC ref | Topic (paraphrased) | Where | Obj. | Status | Note |
|---|---|---|---|---|---|
| 1.1.1–1.1.2 | Meanings and history of Six Sigma and continuous improvement | White M3; Yellow U1 | — | Covered (prerequisite) | Not re-examined at Black |
| 1.1.3 | Deliverables of a Lean Six Sigma project | M1 §1.5; M8 §8.5 | B1, B8 | Covered | The charter at scale, the A3 with appendices (rubric S1) and the one-page executive readout (L2) are the deliverables; the Green Belt tollgate standard is the prerequisite |
| 1.1.4 | The problem-solving strategy Y = f(x) | GB Week 1; M4 §4.1; M5 §5.1 | B4, B5 | Covered | At Black the strategy becomes a model with diagnostics or an experiment; M5 §5.1 is why experiments beat observation for establishing f |
| 1.1.5 | Voice of the customer, business and employee | M1 §1.2–1.4, §1.6 | B1 | Covered | Customer: Kano with a worked survey (§1.3) and conjoint at awareness (§1.4), rubric D4. Business: the strategic linkage statement (§1.2, D2). Employee: launching a team you do not manage (§1.6) and the stakeholder strategy canvas (L1). The three voices are taught as three sections, not as one framework |
| 1.1.6 | Six Sigma roles and responsibilities | M1 §1.5; M8 §8.6 | B1, B8 | Covered | Decision rights and escalation written into the charter (D3); the reviewer's chair and the coach's chair, kept apart (§8.6) |
| 1.2.1 | Defining a process | GB Weeks 1–2; M7 §7.1 | B7 | Covered (prerequisite) | SIPOC and current-state mapping are prerequisite; at Black the process is defined again as a future state (§1.5) |
| 1.2.2 | Critical-to-quality characteristics | GB Week 1; M1 §1.3 | B1 | Covered | CTQs with targets and specification basis from a stated VOC method (D4) |
| 1.2.3 | Cost of poor quality | M8 §8.7 | B9 | Covered | COPQ categories quantified for the capstone's process; benefit classes; Finance partnership (F1, F2). Skills matrix: financial validation L at Black |
| 1.2.4 | Pareto analysis | Yellow U3A; GB Week 5 | — | Covered (prerequisite) | Used in M4 cause narrowing (A1); not re-examined |
| 1.2.5 | Basic metrics: DPU, DPMO, FTY, RTY, cycle time | GB Weeks 2, 4; M3 §3.3; M7 §7.2 | B3, B7 | Covered (prerequisite) | DPMO and sigma level reappear as attribute capability (M3 §3.3); cycle time, throughput and WIP are tied together by Little's Law (M7 §7.2). Examined at Black only in those uses |
| 1.3.1 | Business case and project charter | M1 §1.1, §1.5; charter template | B1 | Covered | Portfolio selection (§1.1) then the charter at scale with decision rights, escalation path and time contracts (§1.5; D1–D3) |
| 1.3.2 | Developing project metrics | M1 §1.2; M3 §3.6 | B1, B3 | Covered | Primary metric in the linkage statement; the baseline statement with distribution and sample size (M2 rubric item) |
| 1.3.3 | Financial evaluation and benefits capture | M1 §1.1; M8 §8.7 | B1, B9 | Covered | Impact threshold at charter (≥ $75K annualized or the clinical/service equivalent); benefit classification, annualization basis, netting of project cost, no double counting (F1 ★, F2) |
| 1.4.1–1.4.3 | Understanding Lean; history of Lean; Lean and Six Sigma together | White M3–M4; Yellow U1 | — | Covered (prerequisite) | Not re-examined at Black |
| 1.4.4 | The seven (eight) wastes | White M5–M7; GB Week 2 | B7 | Covered (prerequisite) | Non-value-added time in the future-state design (M7 §7.1); examined under G only in that use |
| 1.4.5 | 5S | Yellow U2; M7 §7.8 | B7 | Covered (prerequisite) | Reappears inside the kaizen event (day 4 standardize); not re-taught |

#### 2.0 Measure

| IASSC ref | Topic (paraphrased) | Where | Obj. | Status | Note |
|---|---|---|---|---|---|
| 2.1.1 | Cause-and-effect (fishbone) diagrams | Yellow U4; GB Week 5; M4 §4.1 | B4 | Covered (prerequisite) | The cause structure that feeds the model (A1) is prerequisite; at Black the map names the X's the model tests |
| 2.1.2 | Process mapping | GB Weeks 1–2; M7 §7.1–7.3 | B7 | Covered | Current state is prerequisite; future-state design with takt, WIP and balance arithmetic is Black Belt (I3) and is listed in §1.5 because the IASSC outline stops at current state |
| 2.1.3 | X-Y (cause-and-effect matrix) diagram | GB Week 5; M4 §4.1 | B4 | Covered (prerequisite) | Used in A1 narrowing; not re-taught |
| 2.1.4 | Failure modes and effects analysis | GB Weeks 5, 7; M5 §5.4; M7 §7.1 | B5, B7 | Covered | Working-level FMEA is prerequisite. At Black an FMEA is required on the new operating settings (after an experiment) or the future-state steps that change, with mistake-proofing designed in (I2). Skills matrix: FMEA L at Black. Design FMEA as part of DFSS is Master Black Belt (§1.4) |
| 2.2.1–2.2.2 | Basic and descriptive statistics | Yellow U3B; GB Week 4 | — | Covered (prerequisite) | Not re-examined at Black |
| 2.2.3 | Normal distribution and normality | M3 §3.1–3.2 | B3 | Covered | Deeper than the outline implies: distribution identification by probability plot and goodness-of-fit, what to do when normality fails, and when a transformation misleads |
| 2.2.4 | Graphical analysis | GB Week 5; M4 §4.7 | B4 | Covered (prerequisite) | Prerequisite as a tool; at Black it is the reason for restraint — "the question was answerable graphically" earns A3 |
| 2.3.1 | Precision and accuracy | GB Week 3 | — | Covered (prerequisite) | Not re-examined at Black |
| 2.3.2 | Bias, linearity and stability | M2 §2.5 | B2 | Covered | Run, not read: a gage stability chart on a reference sample, bias and linearity checks against reference values across the range, and measurement uncertainty basics by the GUM method. Green Belt read these from a calibration record |
| 2.3.3 | Gage repeatability and reproducibility | M2 §2.2, §2.5 | B2 | Covered | Nested Gage R&R for destructive tests; expanded Gage R&R with site, instrument and day as variance components (M1 rubric item) |
| 2.3.4 | Variable and attribute MSA | M2 §2.3–2.4 | B2 | Covered | Attribute-complex cases: multi-category and ordinal agreement; validation of system-generated data (timestamps, ERP fields) before it is trusted |
| 2.4.1 | Capability analysis | M3 §3.3 | B3 | Covered | Non-normal capability three ways — fitted distribution, transformation, and observed-percentile — with the choice justified (M2 rubric item ★-adjacent) |
| 2.4.2 | Concept of stability | M3 §3.6; M6 §6.2 | B3, B6 | Covered | Stability on the right chart with rational subgrouping justified before any capability claim |
| 2.4.3 | Attribute and discrete capability | M3 §3.3 | B3 | Covered | Binomial and Poisson capability from a stable p or u chart, stated as DPMO or sigma level with the basis named |
| 2.4.4 | Monitoring techniques | M6 §6.1, §6.5 | B6 | Covered | Chart selection at scale and the control strategy for every project metric (C3) |

#### 3.0 Analyze

| IASSC ref | Topic (paraphrased) | Where | Obj. | Status | Note |
|---|---|---|---|---|---|
| 3.1.1 | Multi-vari analysis | GB Week 5; M4 §4.7; M6 §6.2 | B4, B6 | Covered (prerequisite) | Prerequisite as a tool; at Black it feeds the rational-subgrouping decision and the restraint decision |
| 3.1.2 | Classes of distributions | M3 §3.1 | B3 | Covered | Normal, lognormal, Weibull, exponential, binomial and Poisson identified and fitted, with the rule for n < 30 and for data that are a mixture of processes |
| 3.2.1 | Understanding inference | GB Weeks 5–6 | — | Covered (prerequisite) | Not re-examined at Black |
| 3.2.2 | Sampling techniques and uses | M3 §3.4; M6 §6.2 | B3, B6 | Covered | Sample size by a power or precision calculation (M2 rubric item); sampling frequency and subgroup size reasoned for the control strategy (C3) |
| 3.2.3 | Central limit theorem | GB Week 4; M3 §3.5 | B3 | Covered (prerequisite) | The reason confidence intervals behave; examined at Black only through the interval items in section C |
| 3.3.1 | Concepts and goals of hypothesis testing | GB Week 5 | — | Covered (prerequisite) | Not re-taught |
| 3.3.2 | Practical versus statistical significance | Every module; M4 §4.7 | B3, B4 | Covered | Every method ends with the effect size and "the sentence you would tell your sponsor"; a p-value without an effect does not earn A2 ★ |
| 3.3.3 | Risk: alpha and beta | M3 §3.4 | B3 | Covered | Power and sample size calculated for a difference that matters, for means, proportions and ANOVA; the Green Belt gap closed |
| 3.3.4 | Types of hypothesis test | M4 §4.5–4.7 | B4 | Covered | The selector extended to non-parametrics, two-way ANOVA and logistic regression, with "when NOT to model" as a route |
| 3.4.1 | One- and two-sample t-tests | GB Week 6 | — | Covered (prerequisite) | Not re-taught; a two-sample comparison that answers the question outscores a model that did not need to exist (rubric guidance) |
| 3.4.2 | One-sample variance test | — | — | Excluded | §1.4 |
| 3.4.3 | One-way ANOVA | GB Week 6; M4 §4.6 | B4 | Covered | Extended to two-way ANOVA with interaction; general linear model at awareness |
| 3.5.1 | Mann-Whitney | M4 §4.5 | B4 | Covered | With the rule that it compares distributions, not medians, unless shapes match |
| 3.5.2 | Kruskal-Wallis | M4 §4.5 | B4 | Covered | |
| 3.5.3 | Mood's median | M4 §4.5 | B4 | Covered | Chosen over Kruskal-Wallis when outliers, not shape, are the problem |
| 3.5.4 | Friedman | — | — | Excluded | §1.4 |
| 3.5.5 | One-sample sign test | — | — | Excluded | §1.4 |
| 3.5.6 | One-sample Wilcoxon | M4 §4.5 | B4 | Partially | The Wilcoxon signed-rank test is named in the selector as the paired alternative to Mann-Whitney; it is not practiced, and the one-sample form is not taught (§1.4) |
| 3.5.7 | One- and two-sample proportion tests | GB Week 6; M3 §3.4; M4 §4.4 | B3, B4 | Covered | Two-proportion power and sample size in M3; a binary Y with more than one X goes to binary logistic regression in M4 with odds ratios in plain words |
| 3.5.8 | Chi-square: contingency tables and goodness of fit | GB Week 6; M3 §3.1 | B3 | Covered (prerequisite) | Goodness of fit reappears as the distribution-identification statistic in M3 |
| 3.5.9 | Test of equal variances | M4 §4.1; M6 §6.1, §6.4 | B4, B6 | Covered | Levene's test as the assumption check for ANOVA and regression, and as the decision test for pooling streams on one chart or standardizing a short-run chart |

#### 4.0 Improve

| IASSC ref | Topic (paraphrased) | Where | Obj. | Status | Note |
|---|---|---|---|---|---|
| 4.1.1–4.1.3 | Correlation; simple regression equations; residual analysis | GB Week 6 | — | Covered (prerequisite) | Not re-taught; the diagnostics are extended in 4.2.4 |
| 4.2.1 | Non-linear regression | M5 §5.8, §5.10 | B5 | Partially | Curvature is detected with center points and a second-order model is described at awareness (central composite and Box-Behnken designs, contour plots). Fitting non-linear or second-order models is Master Black Belt (§1.4). Polynomial terms in ordinary least squares are not taught as a separate topic |
| 4.2.2 | Multiple linear regression | M4 §4.1–4.3 | B4 | Covered | With diagnostics, VIF and model-selection restraint; a model without diagnostics does not earn A2 ★ |
| 4.2.3 | Confidence and prediction intervals | M3 §3.5 | B3 | Covered | Confidence, prediction and tolerance intervals, and which of the three answers the sponsor's question |
| 4.2.4 | Residual analysis (multiple regression) | M4 §4.1 | B4 | Covered | The four plots and one question; the regression diagnostics checklist in the toolkit |
| 4.2.5 | Data transformation, Box-Cox | M3 §3.2 | B3 | Covered | Box-Cox and Johnson, and when they mislead: a transformation applied to a mixture of two processes hides the stratum that is the cause |
| 4.3.1 | Experiment objectives | M5 §5.1, §5.9 | B5 | Covered | Screen → characterize → optimize as the sequential strategy; the objective fixes the design |
| 4.3.2 | Experimental methods | M5 §5.2, §5.11 | B5 | Covered | Randomization, replication, the run order, the logbook; and when NOT to run an experiment |
| 4.3.3 | Experiment design considerations | M5 §5.2, §5.12; DOE planning canvas | B5 | Covered | Factors, levels, ranges, noise, measurement system checked before the first run; the practicum apparatus and the process simulator |
| 4.4.1 | 2^k full factorial designs | M5 §5.2–5.3; Lab 8; Immersion 1 | B5 | Covered | Designed, run and analyzed on the practicum apparatus by every candidate (gate 3) |
| 4.4.2 | Linear and quadratic mathematical models | M5 §5.3–5.4, §5.8, §5.10 | B5 | Partially | The linear-with-interactions model is fitted and turned into an operating window (§5.4). The quadratic model is reached only as far as detecting curvature with center points (§5.8) and describing the response-surface design that would fit it (§5.10). Skills matrix: response surface A at Black, P at Master Black Belt |
| 4.4.3 | Balanced and orthogonal designs | M5 §5.2 | B5 | Covered | |
| 4.4.4 | Fit, diagnose model, and center points | M5 §5.3, §5.5, §5.8 | B5 | Covered | Effects, ANOVA of effects, residuals; half-normal plots and Lenth's method for unreplicated designs; center points for curvature |
| 4.5.1 | Fractional factorial designs | M5 §5.6; Lab 9 | B5 | Covered | Generators and the defining relation, from 2^(4−1) to 2^(7−3) |
| 4.5.2 | Confounding effects | M5 §5.6 | B5 | Covered | Alias tables written by hand once, then read from software; the ambiguous-table lab |
| 4.5.3 | Experimental resolution | M5 §5.6, §5.9 | B5 | Covered | Resolution III, IV and V and the choice among them as part of the sequential strategy; a fold-over to break aliases is taught as the next step after a resolution III screen |

The IASSC Improve phase is regression and DOE. The program's Improve work also includes
countermeasure design, pilot design, blocking, implementation management and future-state
design, listed in §1.5.

#### 5.0 Control

| IASSC ref | Topic (paraphrased) | Where | Obj. | Status | Note |
|---|---|---|---|---|---|
| 5.1.1 | Control methods for 5S | Yellow U2; GB Week 8 | — | Covered (prerequisite) | Not re-taught |
| 5.1.2 | Kanban | M7 §7.4 | B7 | Covered | Pull-system design and kanban sizing with the arithmetic shown; the Green Belt sized a simple kanban with support, the Black Belt designs the system |
| 5.1.3 | Poka-yoke | GB Week 7; M5 §5.4; M7 §7.1 | B5, B7 | Covered (prerequisite) | Mistake-proofing designed into the new process (I2); not re-taught |
| 5.2.1 | Data collection for SPC | M6 §6.2, §6.5 | B6 | Covered | Subgroup size and sampling frequency as decisions with a cost (C3) |
| 5.2.2–5.2.6 | I-MR, X̄-R, u, p and np charts | GB Week 4 | — | Covered (prerequisite) | Read and constructed at Green; at Black the question is which one, at what scale |
| 5.2.7 | X̄-S chart | M6 §6.1 | B6 | Covered | Chosen over X̄-R for larger subgroups, with the reason; the Green Belt gap closed |
| 5.2.8 | CUSUM chart | M6 §6.3 | B6 | Covered | Designed with h and k for the shift that matters; skills matrix P at Black |
| 5.2.9 | EWMA chart | M6 §6.3 | B6 | Covered | Designed with λ and L; the choice between EWMA and CUSUM, and against a Shewhart chart with run rules, stated with the process owner |
| 5.2.10 | Control methods | M6 §6.5; M7 §7.8 | B6, B7 | Covered | The control strategy (C3) and the 30-, 60- and 90-day follow-up of the kaizen event |
| 5.2.11 | Control chart anatomy | GB Week 4 | — | Covered (prerequisite) | Control limits from the process, specification limits from the customer; not re-taught |
| 5.2.12 | Subgroups, impact of variation, sampling frequency | M6 §6.2 | B6 | Covered | Rational subgrouping as the decision, with a wrong subgroup worked through; multiple-stream processes |
| 5.2.13 | Center line and control limit calculations | GB Week 4; M6 §6.3–6.4 | B6 | Covered (prerequisite) | Basic-chart limits are prerequisite; at Black the calculations are EWMA and CUSUM parameters and standardized short-run limits |
| 5.3.1 | Cost-benefit analysis | M8 §8.7 | B9 | Covered | Benefits classified and netted; Finance sign-off (F1 ★, F2) |
| 5.3.2 | Elements of the control plan | M6 §6.5; GB Week 8 | B6 | Covered | Control plan live ≥ 60 days at submission, process owner signed (C1 ★) |
| 5.3.3 | Elements of the response plan | M6 §6.5; M8 §8.9 | B6, B10 | Covered | Including the response when an automated or AI-assisted step drifts (§8.9) |

### 1.4 Explicit exclusions, and why

Everything below is out of scope at Black Belt on purpose. The owning level is from the
skills matrix in the program README. Each row says what a Black Belt does instead, because
"not taught" must not mean "stuck" — and at this level, "stuck" usually means "brings in a
Master Black Belt and stays in the room".

| Excluded or awareness-only at Black Belt | Where the outlines list it | Owned by | Why it is excluded here | What a Black Belt does instead |
|---|---|---|---|---|
| Response surface methods beyond an introduction: central composite and Box-Behnken design and analysis, steepest ascent, mixture designs, optimization of a second-order model | IASSC 4.4.2 (quadratic models); ASQ VII.A at awareness; program README Master Black Belt topics | Master Black Belt (P); skills matrix: response surface / advanced DOE A at Black | A second-order design is run when the project has reached the optimize stage, after a characterization the Black Belt owns. Running it unaided is not in the minimally competent candidate statement, because a wrong RSM produces a confident operating window on the wrong ridge | M5 §5.10: recognize the optimize stage, describe the CCD to a sponsor in a sentence, read a contour plot and a software-produced optimum with its interval, and bring in a Master Black Belt for the design and the second-order fit. The exam tests recognition and reading, not design (section E2) |
| Simulation: Monte Carlo, discrete-event, queuing models beyond the M/M/1 rule | ASQ VII.B (other improvement tools) at awareness; program README Master Black Belt topics | Master Black Belt (P); skills matrix A at Black | A validated simulation is a project in itself; an unvalidated one is a chart of an opinion. The program would rather a Black Belt design a real experiment or a controlled pilot | M7 §7.2 and §7.6: the utilization–wait profile and the 85% rule; Little's Law and takt arithmetic for capacity; a real pilot with a written prediction. A candidate whose project needs a simulation uses one built and validated by someone qualified, and says so in the record (M5 worked design 4 does exactly this) |
| CI deployment architecture and governance: operating models, belt development plans, benefits-tracking systems, maturity models | ASQ I.A.4 (strategic planning and deployment); program README Master Black Belt objective 1 | Master Black Belt (L); skills matrix A at Black | Designing a deployment is the Master Black Belt capstone. Teaching it at Black would produce deployment plans written by people who have led one project | M1 §1.1: select a project from a portfolio and state where the project sits in the organization's improvement system; the corporate deployment playbook is for buyers, not a candidate deliverable |
| Hoshin Kanri / strategy deployment: X-matrix, catchball, bowling charts, review cadence | ASQ I.A.4; program README Master Black Belt objective 2 | Master Black Belt (L); skills matrix A at Black | A Black Belt links a project to a stated objective; a Master Black Belt designs the cascade the objective came from | M1 §1.2: the strategic linkage statement, sponsor-confirmed (D2); where the organization runs Hoshin, read the X-matrix to find the objective and quote it |
| Training design and delivery: curriculum architecture, assessment design, teach-back | ASQ III.D (team training) at the team level only; program README Master Black Belt objective 4 | Master Black Belt (L); skills matrix A at Black | A Black Belt runs 30-minute just-in-time training inside a kaizen event and coaches one to one; designing a course is a different craft, assessed at Master Black Belt by an observed teach-back | M7 §7.8: just-in-time training, 30 minutes maximum, inside the event; M8 §8.6: coaching by asking |
| Coaching mastery: developmental coaching, assessed live coaching of Black Belt candidates, reviewer calibration leadership | ASQ III.B–C at the team level; program README Master Black Belt objective 3 | Master Black Belt (M); skills matrix: coaching belts / tollgate review P at Black | The Black Belt coaches Green Belts under supervision and sits in the reviewer's chair for two tollgates; calibrating other reviewers and coaching Black Belts requires the hours the Master Black Belt admission demands | Gate 5, and the coaching log that earns L3; the hours count toward Master Black Belt candidacy |
| Design for Six Sigma / DMADV end to end: quality function deployment beyond awareness, TRIZ, design scorecards, tolerance design, Design for X, robust design | IASSC — not listed; ASQ IX.A–C (7 items) | Master Black Belt (P) and the DFSS specialist micro-credential (elective); skills matrix A at Black | A design methodology, not an improvement one. The program README places full DFSS at Master Black Belt or in the elective specialist track, so a Black Belt who wants it deep takes the micro-credential rather than a stretched Module 8 | M8 §8.8: recognize when the verified cause is the design itself — entitlement reached, the capability ceiling set by tolerances or the service model — route the successor project to DMADV, and name the route in the portfolio. The exam tests the routing judgement (section I), not the DMADV tools |
| Multivariate statistics: Hotelling's T² and other multivariate control charts; principal components, factor analysis, discriminant analysis, MANOVA | ASQ VI.A.3 (multivariate tools); not in the IASSC outline | Not in the skills matrix at any core level; Master Black Belt technical portfolio at most | Rarely the question on an improvement project, and never the first tool for it | M6 §6.1: one chart per metric, with the correlation between metrics stated in the control strategy; escalate when several correlated metrics must be monitored jointly |
| Non-parametric tests: Friedman, one-sample sign, one-sample Wilcoxon | IASSC 3.5.4–3.5.6 | Not taught at any core level | The README names three non-parametrics (Mann-Whitney, Kruskal-Wallis, Mood's median) on purpose. Friedman answers a randomized-block question the program answers with a blocked design (M5 §5.7) or two-way ANOVA; the one-sample sign and Wilcoxon tests answer a question about one median that a Black Belt project rarely asks and a confidence interval answers better | The paired Wilcoxon signed-rank is named in the M4 selector as the paired alternative and read from software if needed; for one-sample questions, report the interval on the median from the bootstrap or the software's non-parametric interval, and say so |
| One-sample variance test | IASSC 3.4.2 | Not taught at any core level | The variance question that matters on a project is equal variances across groups or streams (3.5.9), which is taught | Levene's test across groups; a confidence interval on the standard deviation from software when a single-sample question arises |
| Process mining and automation beyond awareness; AI-era operations design | ASQ — not listed; program README Master Black Belt topics; skills matrix: process mining / digital CI P at Black, L at Master Black Belt | Master Black Belt (L) and the digital CI specialist micro-credential (elective) | The Black Belt uses an event log and triages an automation candidate; designing the data infrastructure for CI is deployment work | M8 §8.9: pivot the event log by case, find the loop, triage the automation candidate as a countermeasure with a silent-failure risk line, and put the model's override rate on a p chart. Examined under section I as awareness |

Two consequences the program states plainly:

1. **The Black Belt exam does not test any excluded method**, except as a "when NOT to use
   this / when to escalate" judgement item, which the blueprint requires in sections C, D, E
   and F and permits in I. A section E2 item may ask a candidate to recognize that a project
   has reached the optimize stage and what the next design is; it does not ask them to
   analyze a central composite design.
2. **The capstone rubric does not reward an excluded method.** A candidate who has a Master
   Black Belt run a response-surface design on their project is scored on whether the
   experiment answered the question and the operating window is right (I1 ★), and on the
   honesty of the record about who did what (M3 data provenance). A wrong RSM scores lower
   than a right 2^(4−1). A3 rewards restraint on purpose.

### 1.5 What this program teaches that the IASSC outline does not list

The IASSC Black Belt outline is a statistics-and-DOE outline. It does not list Lean at system
level, leading change, coaching or program economics, which together are 44 of the 150 items
on the program's form (sections G, H and I) and 40 of the rubric's 150 points (I3, I4,
Control at scale, Financial validation, Leadership evidence). The program examines them
because the README's minimally competent candidate is a change leader, not a statistician.

| Program topic | Where | Obj. | Why it is here |
|---|---|---|---|
| Project portfolios and strategic linkage; the impact threshold; team launch without authority | M1 §1.1–1.2, §1.6 | B1 | The charter at scale is signed before week 1; the linkage statement is D2 |
| Kano model with a worked survey; conjoint at awareness | M1 §1.3–1.4 | B1 | Advanced VOC (D4); the outline lists VOC without a method |
| Nested and expanded Gage R&R; attribute-complex agreement; validation of system-generated data; measurement uncertainty basics | M2 | B2 | The outline lists Gage R&R; the capstone's metrics are destructive, ordinal or born in a database |
| Distribution identification and fitting; non-normal capability; power and sample size; prediction and tolerance intervals | M3 | B3 | Where the Green Belt exclusions land; the baseline statement (rubric M2) rests on them |
| Binary logistic regression; multicollinearity and VIF; model-selection restraint; two-way ANOVA with interaction; GLM awareness; when NOT to model | M4 | B4 | A2 ★ and A3; the outline lists multiple regression without diagnostics as a topic |
| Blocking; unreplicated designs with half-normal plots and Lenth's method; sequential experimentation; response surface introduction; when NOT to run an experiment; the DOE practicum on physical apparatus or simulator | M5 §5.5, §5.7, §5.9–5.12; Immersion 1 | B5 | Gate 3; the outline's DOE sections stop at resolution |
| Short-run SPC: nominal and standardized charts; multiple-stream processes; the control strategy at scale | M6 §6.1, §6.4–6.5 | B6 | C3; skills matrix: advanced SPC P at Black |
| Future-state value stream design: the eight design questions, takt, Little's Law, line balancing and workload leveling, pull-system design, setup reduction at leadership level, TPM/OEE or demand–capacity management, theory of constraints basics | M7 §7.1–7.7 | B7 | I3; skills matrix: value stream design L at Black |
| Kaizen event leadership: charter, pre-work, the five days, the 30-day list, follow-up | M7 §7.8; Lab 14 | B7 | Gate 4, observed or video-reviewed |
| Stakeholder strategy at executive level; resistance diagnosis and response (Kotter and ADKAR applied); influence without authority; conflict by type; facilitation skills | M8 §8.1–8.4; Immersion 2 | B8 | L1 ★; assessed by observed practicum, not quiz |
| Executive communication and storytelling with data, honestly | M8 §8.5 | B8 | L2: fifteen minutes, one page, decisions requested and obtained |
| Coaching Green Belts and the reviewer's chair; reviewer calibration on the anchor set | M8 §8.6; Lab 16 | B8 | Gate 5 and L3 |
| Program economics: cost of poor quality, benefit classes, project cost netting, annualization, Finance partnership | M8 §8.7 | B9 | F1 ★, F2; the outline lists financial evaluation without the Finance partner |
| DFSS/DMADV awareness; digital CI awareness (process mining, automation triage, AI-assisted operations as a process step) | M8 §8.8–8.9 | B10 | Routing judgement, examined in section I |
| Ethics of data: never remove inconvenient points, never change the operational definition between before and after, never reconstruct a baseline from memory; data provenance auditable | Threaded; M3 rubric item; M4 §4.7 | B3, B4 | A data-ethics finding stops a review, as at Green Belt |
| Software parity: every analysis in Minitab, Excel (or the Excel stats add-in), and R or Python | Every module | B3–B6 | So the credential does not depend on one vendor's license |

### 1.6 ASQ Certified Six Sigma Black Belt cross-reference (section level)

ASQ's outline is organized around the Black Belt's role rather than the DMAIC toolset: nine
sections, each with an item count on ASQ's own 150-scored-item exam. The counts below are
from the 2022 edition as the program last checked it, and the subsection lists are
paraphrased; confirm both against the current ASQ document before quoting them to a buyer.

| ASQ section (items) | Subsections as commonly published | Where | Status |
|---|---|---|---|
| I. Organization-wide planning and deployment (12) | A. Organization-wide considerations: fundamentals of Six Sigma and Lean; other CI methodologies; business systems and processes; strategic planning and deployment for initiatives. B. Leadership: roles and responsibilities; organizational roadblocks and change management | White, Yellow, Green (prerequisite) for I.A.1–3; M1 §1.1–1.2 for portfolios and linkage; M8 §8.1–8.3 for roadblocks and change | Partially — I.A.4 strategic planning and deployment (Hoshin, deployment architecture) is Master Black Belt (§1.4); the rest Covered |
| II. Organizational process management and measures (10) | A. Impact on stakeholders; B. Benchmarking; C. Business measures: performance measures, financial measures | M1 §1.2, §1.6; M8 §8.7; benchmarking from GB Week 7 | Covered, except II.B Partially — benchmarking as a countermeasure source (prerequisite) and the program's benchmark library; competitive benchmarking as a method is not taught |
| III. Team management (16) | A. Team formation; B. Team facilitation; C. Team dynamics; D. Team training and tools | M1 §1.6; M8 §8.3–8.4; Immersion 2; M7 §7.8 | Covered, except III.D Partially — just-in-time training inside an event; training design is Master Black Belt (§1.4) |
| IV. Define (20) | A. Voice of the customer: customer identification, data collection, requirements; B. Business case and project charter; C. Project management tools: planning, analytical tools, documentation, risk analysis, project closure | M1; charter template; GB Weeks 1–2 (prerequisite); M5 planning canvas and logbook | Covered, except IV.C.2 analytical tools Partially — the management and planning tools (affinity, interrelationship, tree, prioritization matrix, process decision program chart, activity network) are taught only as the CTQ tree and the selection matrix, as at Green Belt; Gantt and critical-path scheduling are used on the implementation plan (I4) without being taught as a topic |
| V. Measure (25) | A. Process characteristics; B. Data collection; C. Measurement systems; D. Basic statistics; E. Probability; F. Process capability | GB Weeks 2–4 (prerequisite); M2; M3 | Covered, except V.E Partially — probability rules and the t, F and chi-square distributions as objects in their own right are not taught; distributions are identified and used (M3 §3.1) |
| VI. Analyze (22) | A. Measuring and modeling relationships: correlation, regression, multivariate tools; B. Hypothesis testing: terminology, statistical vs practical significance, sample size, point and interval estimates, tests for means, variances and proportions, ANOVA, goodness of fit, contingency tables, non-parametric tests; C. FMEA; D. Additional analysis methods: gap analysis, root cause analysis, waste analysis | M3; M4; GB Weeks 5–6 (prerequisite) | Covered, except VI.A.3 multivariate tools Excluded (§1.4), and the non-parametrics and variance tests in VI.B Partially as in §1.3 rows 3.4.2, 3.5.4–3.5.6 |
| VII. Improve (21) | A. Design of experiments: terminology; design principles (power, sample size, balance, replication, order, efficiency, randomization, blocking, interaction, confounding, resolution); planning; one-factor experiments; two-level fractional factorials; full factorials. B. Lean methods: waste elimination; cycle-time reduction; kaizen and kaizen blitz; other improvement tools (TOC, OEE, 5S, SMED, TPM). C. Implementation | M5; Immersion 1; M7; M5 §5.4 and M7 §7.1 for implementation | Covered, except VII.A.4 one-factor experiments Partially — one-factor-at-a-time is taught in §5.1 as the method a factorial replaces, and one-way ANOVA is prerequisite; a one-factor experiment is not designed as such |
| VIII. Control (17) | A. Statistical process control: objectives, selection of variables, rational subgrouping, chart selection, chart analysis; B. Other controls: TPM, visual controls; C. Maintain controls: measurement system reanalysis, control plan; D. Sustain improvements: lessons learned, documentation, training, ongoing evaluation | M6; M7 §7.6; GB Week 8 (prerequisite); rubric C1–C3 | Covered — VIII.C.1 measurement system reanalysis is the control plan's line for re-running the MSA (M2 §2.6, M6 §6.5) |
| IX. Design for Six Sigma framework and methodologies (7) | A. Common DFSS methodologies: DMADV, DMADOV; B. Design for X; C. Robust designs: functional requirements, noise strategies, tolerance design, tolerance and process capability | M8 §8.8 | Partially — IX.A at awareness (recognize and route); IX.B and IX.C Excluded (§1.4: Master Black Belt and the DFSS elective) |

Where ASQ and IASSC differ, the program follows its skills matrix, not either outline. The
visible effect: ASQ's role-based sections I–III, VII.B and VIII.D match what the program
examines in sections G, H and I and the IASSC outline omits; ASQ's DFSS section IX and
multivariate tools sit above the Black Belt line in the skills matrix and are excluded.

### 1.7 Exit-competence statement (what a holder can do)

> A Certified Lean Six Sigma Black Belt has led a cross-functional, strategically linked
> improvement project on a real process to impact that Finance, or the mission-metric
> executive, signed — with a team they did not manage, an independent Master Black Belt
> reviewer of record, and a control plan live for at least 60 days at submission. They can
> select a project from a portfolio and write the line from its metric to a stated
> organizational objective; charter decision rights and an escalation path across functions;
> design a measurement system study for a destructive, attribute-complex or system-generated
> metric and act on its result; identify the distribution behind a baseline, state non-normal
> capability correctly and size a sample by a power calculation; verify a cause with multiple
> or logistic regression with diagnostics, a non-parametric test or a two-way ANOVA — chosen
> to fit the question — and recognize when no model is warranted; design, run and analyze a
> full or fractional factorial experiment with blocking and center points, read confounding
> from the defining relation, and derive an operating window; choose and design the control
> chart a process at scale needs, including EWMA, CUSUM and short-run charts, with rational
> subgrouping reasoned; design a future-state value stream with takt, Little's Law and
> balance arithmetic; lead a kaizen event; diagnose resistance and revise a stakeholder
> strategy; deliver an executive readout in fifteen minutes on one page and obtain the
> decision; review a Green Belt tollgate from the reviewer's chair; and build a benefit case
> with a Finance partner. They are not expected to design or analyze a response-surface
> experiment unaided, build a simulation model, run Design for Six Sigma end to end, design a
> continuous-improvement deployment or a Hoshin cascade, or design and deliver a course; a
> Black Belt who meets such a problem names it, brings in a Master Black Belt, and stays in
> the room.

The statement is the badge `description` and the text a hiring manager sees on verification.
It is the README's minimally competent candidate definition, written for the reader instead
of the Angoff panel, with the four Master Black Belt exclusions from §1.4 added so that the
credential cannot be stretched.

---

## Part 2 — Credential specification

### 2.1 Award criteria (all five gates required)

1. **Exam.** 150 items, 4 hours, proctored, **open notes, closed internet** — online for
   individuals, on-site for corporate cohorts — assembled to the README blueprint from the
   525-item tagged bank ([`exam-bank.md`](exam-bank.md)). Provisional cut 80% pending the
   modified-Angoff panel; once the panel has run, the cut is published as "set by modified
   Angoff, panel of N, [month year]" per the
   [assessment policy](../assessment/standard-setting-and-item-policy.md). One included
   retake after a 14-day study period; the retake form shares ≤ 25% of items with prior
   attempts and never the items previously missed. Open notes means the candidate's own
   notes and the program toolkit; it mirrors practice, and it is why ≈ 45% of the form is
   exhibit interpretation and no item tests recall of a formula.
2. **Capstone project.** Scored against the published 150-point
   [rubric](project/review-rubric.md) by an independent Master Black Belt reviewer who did
   not coach the candidate. Pass is **120 points with every mandatory item earned**: ★ A2 root
   cause verified with an appropriate method, ★ I1 experimental or piloted solution evidence,
   ★ C1 control plan live ≥ 60 days at submission, ★ F1 Finance sign-off (or the mission-metric
   executive's, named), ★ L1 team and stakeholder navigation documented. Feedback within 20
   business days; one revise-and-resubmit cycle included. A data-ethics finding stops the
   review. The reviewer who passes the project is the reviewer of record and signs the
   certificate.
3. **DOE practicum.** At Immersion 1 (week 10) the candidate designs, runs, analyzes and
   presents an experiment end to end on the physical apparatus — the catapult or
   paper-helicopter kit, shipped to virtual learners — or on the process simulator for
   transactional cohorts. Observed by the instructor and scored pass/redo against the
   practicum rubric (`practicum/doe-practicum.md`). A redo is a second observed run at the
   next immersion or a scheduled virtual session, not a re-scoring of the first.
4. **Kaizen facilitation.** The candidate leads one rapid-improvement event at their employer
   or a partner-pool organization, observed live or video-reviewed against the facilitation
   rubric (`practicum/kaizen-facilitation.md`): preparation, facilitation, safety of the
   room, closure. Pass/redo. The event's 30-day follow-up is part of the evidence.
5. **Green Belt coaching.** The candidate formally reviews two Green Belt tollgates using the
   [Green Belt rubric](../green-belt/project/review-rubric.md), seated under a calibrated
   reviewer's supervision after scoring the anchor set, and scored to the reviewer standard
   (`practicum/green-belt-tollgate-reviews.md`): the record, the questions, the silence and
   the feedback. Pass/redo. The candidate never reviews a Green Belt they coach.

The gates can be met in any order; the credential is issued on the date the last one is met.
Project closure may run up to nine months after week 16, with monthly Master Black Belt
coaching until closure; the credential is withheld until the project closes, the learning is
not (README). A candidate who has met gates 1, 3, 4 and 5 but whose project does not close
within the nine months keeps those four results for eighteen months from the cohort's end and
may bring a re-scoped or new project to review under the requirements published at their
enrollment (terms §3.3). Gates 3, 4 and 5 do not expire once passed.

The award criteria are the requirements published at enrollment. Any change is logged in the
change log with an effective date and never applied to a cohort already enrolled.

### 2.2 What the credential is called

One name: **"Certified Lean Six Sigma Black Belt"**.

There is no practicum-track variant at this level, on purpose. Every Black Belt credential
rests on a real, sponsored, cross-functional project with Finance or mission-metric
validation; a simulated project cannot produce the leadership evidence L1 ★ asks for. A
candidate without an employer project uses the partner-project pool, and the badge's
`projectSource` field says `partner-pool`, because the charter names the source — the
credential is the same credential either way, and the source is a fact about the project, not
a tier of the badge.

The Green Belt prerequisite must be the standard credential. A "Certified Lean Six Sigma
Green Belt (Practicum)" satisfies the certified-Green-Belt requirement but not the
completed-DMAIC-project requirement, whatever its issuer; the Green Belt crosswalk says the
same from the other side (§2.2 there). A Green Belt certified elsewhere takes the calibration
assessment in §2.9.

### 2.3 Badge metadata (Open Badges 3.0 / Credly-compatible)

| Field | Value |
|---|---|
| `name` | Certified Lean Six Sigma Black Belt |
| `description` | The exit-competence statement (§1.7), verbatim |
| `criteria` | URL to this document's Part 2 |
| `alignment` | Two entries: IASSC Lean Six Sigma Black Belt body of knowledge; ASQ Certified Six Sigma Black Belt body of knowledge. Each links to §1.3 or §1.6 and to the exclusions in §1.4, and carries the words "program-mapped; not an IASSC or ASQ certification" |
| `skills` | Cross-functional project leadership; strategic linkage; advanced VOC (Kano); advanced measurement system analysis; distribution identification and non-normal capability; power and sample size; multiple and logistic regression with diagnostics; non-parametric tests; two-way ANOVA; design of experiments (full and fractional factorials, blocking, center points); advanced SPC (EWMA, CUSUM, short-run); future-state value stream design; kaizen event leadership; change leadership and stakeholder strategy; executive communication; Green Belt coaching and tollgate review; financial validation with Finance |
| `learningHours` | 100 (structured). Project hours (100–150) are learner-reported and carried separately as `projectHours` |
| `assessmentType` | Proctored open-notes exam (150 items; cut published with its Angoff date) **+ rubric-reviewed real cross-functional project by a named independent Master Black Belt reviewer of record + Finance or mission-metric validation + observed DOE practicum + observed kaizen facilitation + two supervised Green Belt tollgate reviews** |
| `reviewStatus` | `human-reviewed`, always. The sampling statement reads "100% of Black Belt projects are reviewed by a named Master Black Belt reviewer of record; 10% of certified projects are re-reviewed each year, and the agreement rate is published" |
| `reviewerOfRecord` | The Master Black Belt's name and the verification URL of their own credential. **Always shown** on the certificate and the verification page at Black Belt — the README makes the named reviewer part of the credential's claim, so it is not consent-gated as it is at Green Belt. The reviewer's report (not their name) is what evidence consent adds (§2.4) |
| `projectSource` | `employer` \| `partner-pool` |
| `projectDomain` | The vertical (`manufacturing-supply-chain` \| `healthcare` \| `transactional-services`) plus a process type in the program's vocabulary — for example "valve assembly cell" (MFG), "outpatient clinic flow" (HC), "claims intake" (TXN). Never the employer's name unless the holder chooses evidence option 3 and the organization consented in the rollout or partner-pool agreement |
| `verifiedImpact` | `finance-validated` \| `mission-metric-validated` \| `finance-and-mission-validated`. Set from the signed F1 form — the named Finance partner or the sponsor's executive equivalent — never from the candidate's report. There is no `sponsor-verified` alone at Black Belt: F1 ★ makes validation mandatory |
| `impactClass` | `hard` \| `soft` \| `cost-avoidance` \| `revenue` \| `mission-clinical` — the rubric F1 classification; more than one where the project claimed more than one class, each validated. The amount is never on the badge |
| `sustained` | `pending` (before the day-90 check) \| `true` \| `false` \| `unreachable` (sponsor did not answer two requests). Set only by the reviewer of record from the sustainment check (§2.3a) |
| `doePracticum` | `passed`, with the date and the apparatus: `physical-catapult` \| `physical-helicopter` \| `process-simulator`. Whether a redo was used is held in the record and not shown |
| `kaizenFacilitation` | `completed`, with the event's month, the vertical, and the observation mode: `observed` \| `video-reviewed` |
| `tollgateReviews` | `2` — the number of Green Belt tollgates reviewed to standard under supervision |
| `coachingHours` | An integer: the hours of Green Belt coaching and tollgate review the candidate logged during the program and a supervising calibrated reviewer or the Master Black Belt coach countersigned (§2.3b). Learner-logged, program-countersigned |
| `ceu` | Empty until IACET accreditation is granted; then `10 IACET CEUs` for awards from the accreditation date forward. Until then the certificate carries the words "10 IACET CEUs pending accreditation" and no CEU is claimed (§2.11) |
| `issuedOn` | The date the fifth gate was met |
| `expires` | `issuedOn` + 3 years; renewed under §2.8 |
| `issuer` | Program issuer profile, with accreditation identifiers as they are granted |

`reviewerOfRecord`, `verifiedImpact`, `doePracticum`, `kaizenFacilitation` and `coachingHours`
are the five fields that separate this badge from a certificate that says "Black Belt" over a
multiple-choice score. Each is true at the level of the individual holder, and three of the
five carry another named person's signature.

#### 2.3a The `sustained` flag

The flag answers one question the sponsor is asked 90 days after closure (the date the
project passed review): *did the control plan hold?* — meaning the monitored metric stayed at
the improved level on the sustainment chart, and the response plan was used when it did not.
Because C1 ★ requires at least 60 days of live monitoring at submission, the day-90 answer at
Black Belt rests on at least 150 days of monitoring, which is why the program treats it as
evidence and publishes it. The reviewer of record asks; the sponsor answers; the reviewer
sets the flag and files the sponsor's answer in the project record. The flag feeds the
program's published sustainment rate on the
[outcomes page](../program-operations/outcomes-page.md) and the badge.

`false` is an outcome, not a fault. A control plan that did not hold after handover says
something about the process, the handover or the organization. It is never grounds for
revocation, never changes the credential, and is shown on the verification page with the
same prominence as `true`. Holders are told this at award so nobody is tempted to shade the
sponsor's answer. `unreachable` is shown as such; the program does not convert silence into
a `true`.

#### 2.3b What counts as a coaching hour

A coaching hour is an hour spent developing a Green Belt or a team member in one of three
ways, logged with the date, the person's role (never their name on the badge), the checkpoint
or gate, and what they decided — the same log that earns rubric item L3:

- preparing for, sitting in, and writing the feedback for a Green Belt tollgate review under
  supervision (gate 5) — typically 4 to 6 hours per review, illustratively;
- coaching checkpoints with a Green Belt in the program's cohorts, where the candidate holds
  a paid or volunteer coaching seat and never the reviewer's seat for the same person;
- coaching a team member on the capstone, where the log shows a question asked and a decision
  the team member made, not a task assigned.

The supervising calibrated reviewer or the candidate's Master Black Belt coach countersigns
the log at closure; uncountersigned hours are not carried. There is no minimum beyond the two
reviews; the number is what was done. The same hours count toward the Master Black Belt
admission requirement (two or more of five completed projects as coach or reviewer) and toward
the 40-coaching-hour renewal route in §2.8, on the same log.

### 2.4 Evidence — the credential that shows the work

With the holder's consent at award — three choices, default *badge only* — the badge carries
an Open Badges 3.0 `evidence` entry, per the
[credential evidence policy](../program-operations/credential-evidence-policy.md). At Black
Belt the evidence items are the three the policy names:

- **The project abstract**, ≤ 300 words, written by the candidate on the executive readout
  template and redacted by the program: the objective linked to, the problem in the
  business's metric, the baseline with its distribution stated, the cause verified and by
  what method, the experiment or pilot and its result against the prediction, the control
  strategy, and the impact class. Not the A3: at Black Belt the A3 and its appendices run to
  the length of a report, and the abstract is what a hiring manager reads.
- **The reviewer-of-record report**, in the rubric's feedback format: the eight section
  scores (Define and strategic linkage 20, Measure 20, Analyze 30, Improve 30, Control 20,
  Financial validation 10, Leadership evidence 15, Storytelling 5), the status of each ★ item
  in one sentence, two strengths, the highest-leverage fix, the fork named (Master Black Belt
  or specialist), and whether a revise-and-resubmit cycle was used — with the reviewer of
  record's name linked to their own credential's verification page.
- **The sustainment check result:** the `sustained` value, the date of the day-90 check, and
  the sponsor's answer in one sentence as the reviewer filed it. Shown as `pending` until the
  check runs; the entry updates when it does.

Redaction (policy §3) is done by the program before the holder sees the version they are
consenting to: names other than the holder's and the reviewer's, including in images;
customer, patient, supplier and employee identifiers; figures the sponsor or the Finance
partner marked commercially sensitive; and anything the reviewer flagged for escalation,
which is never published. The financial amount is treated as commercially sensitive unless
the sponsor released it on the F1 form; the impact class is not sensitive and is always on
the badge. The DOE practicum record, the kaizen observation record and the tollgate review
records are not evidence items: they are the program's assessment records, and they contain
other people's projects. The holder can change their choice at any time from their credential
page; withdrawing evidence never affects the credential.

### 2.5 Verification page

Every badge carries a public verification URL. It is permanent and stays resolvable if the
holder's account closes (terms §3.7).

**Always shown:** holder name · credential name · issue date · criteria met, each of the five
gates named · the reviewer of record's name and the verification link of their own credential
· `projectSource` · `verifiedImpact` · `impactClass` · `sustained`, with the date of the day-90
check · `doePracticum` with its apparatus · `kaizenFacilitation` with its observation mode ·
`tollgateReviews` · `coachingHours` · `reviewStatus` and the sampling statement ("every Black
Belt project is reviewed by a named Master Black Belt reviewer of record; 10% of certified
projects are re-reviewed each year, and the agreement rate is published") · recertification
state (`active` \| `inactive` \| `revoked`) with its date · the exit-competence statement · a
link to this document.

**With evidence consent:** the redacted project abstract, rendered on the page rather than
offered as a download · the eight section scores and the ★ item statuses · the reviewer of
record's report · the date of review · the sustainment check result with the sponsor's
sentence · `projectDomain` in the program's vocabulary · under option 3 only, the
organization's name.

**Never shown:** the exam score, item-level answers or attempt count; whether the DOE
practicum or any other gate needed a redo; the financial amount unless the sponsor released
it; the names of the Green Belts whose tollgates the holder reviewed, or anything from their
projects; the kaizen event's organization unless it is the holder's own under option 3;
coaching notes; reflection text; the F1 form; anything from another candidate in the cohort;
and whether this particular project was among the 10% re-reviewed — audit results are
published in aggregate so that an un-audited badge is not read as a weaker one.

The verification page is the employer's view. The program does not answer employer requests
for more than the page shows, and says so on the page (policy §6).

### 2.6 Annual re-review audit (10%)

The program audits its own reviewers (terms §3.8) — at Black Belt, its Master Black Belts.
Each year the assessment lead draws a random 10% of the projects certified in the previous
twelve months — at least five, or all of them when fewer than five were certified — stratified
by vertical and project source where numbers allow.

1. **Blind re-score.** A calibrated Master Black Belt who was not the reviewer of record, the
   instructor or the coach re-scores the project from the submitted materials without seeing
   the original score.
2. **Sponsor and Finance re-contact.** The auditor confirms with the sponsor that the
   leadership statement in L1 is theirs and that the day-90 answer stands, and with the named
   Finance partner (or the mission-metric executive) that the F1 signature is theirs and the
   classification was as recorded.
3. **Practicum record read.** The auditor reads the DOE practicum, kaizen observation and
   tollgate review records for the sampled candidate for completeness and for the observer's
   signature. These are pass/redo observations and are not re-scored; a missing signature or
   an undated observation is a finding against the program's records, not the holder.
4. **Comparison**, on the rubric's calibration rule scaled to 150 points: a difference of more
   than 8 points total (the Green Belt rule of 5 in 100, scaled), or any disagreement on a ★
   item, is a finding.

| Finding | Reviewer of record | Credential |
|---|---|---|
| Within 8 points; ★ items agree | Nothing; the pair is logged | Unchanged |
| More than 8 points apart; ★ items agree | Re-calibrates on the anchor set of four before their next review | Unchanged |
| A ★ item the reviewer of record awarded is not earned in the re-score | A third calibrated Master Black Belt scores blind; two of three decide. If the item was not earned, the reviewer of record re-calibrates and their next three reviews are second-read | Unchanged — the holder met the published requirements as the program assessed them, and the error is the program's. The holder is told in writing and offered a no-fee coached resubmission of that item within six months. If they take it, the evidence entry (where attached) shows the updated review; if not, nothing changes |
| A Finance or sponsor signature the signatory does not recognize; evidence of fabricated data, a fabricated event, or another person's project | Not a reviewer matter | Referred to the integrity process (terms §4): the holder sees the evidence and has 14 days to respond before any decision |
| A practicum record missing an observer's signature or date | The observing instructor completes the record from their notes, or the program records that it cannot | Unchanged; the gap is counted in the published audit figures |

A reviewer of record with two ★ findings in one audit year, or a ★ finding upheld by the
third reviewer, is removed from the reviewer bench until re-calibrated and second-read
through three clean reviews; their name stays on the credentials they signed, because the
credential was awarded on the program's assessment and the program owns the error.

The program publishes each year, on the outcomes page with n and period: the sample size, the
agreement rate on ★ items, the mean absolute score difference, the number of practicum
record gaps, and the number of integrity referrals. A bad year is published like a good one.

### 2.7 Revocation

Grounds, per the [terms of certification](../program-operations/terms-of-certification.md)
§4: proxy completion of the exam; sharing or receiving exam content; fabricated data,
baselines or results; a forged or coerced sponsor or Finance signature; a kaizen event or a
coaching log that did not happen as recorded; another person's experiment presented at the
DOE practicum; submitting another person's project as one's own; misrepresenting the
credential — including presenting an `inactive` credential as active, or a Black Belt as a
Master Black Belt, after one written notice.

Process: the assessment lead — not the instructor, coach or reviewer of record — puts the
evidence to the holder in writing; the holder has 14 days to respond; outcomes range from a
required resubmission to revocation and, for repeated or severe cases, a bar on future
enrollment. Appeals follow terms §5: a second calibrated Master Black Belt re-scores blind at
stage 1; an external practitioner sits on the stage 2 panel; the stage 2 fee is refunded if
the appeal succeeds in any part.

On revocation the verification URL resolves to "revoked" with a date and nothing else; the
evidence entry is removed; the program does not publish the reason. A revoked Black Belt does
not satisfy Master Black Belt admission, and the holder is removed from any coaching or
reviewer role in the program. The two Green Belt tollgate reviews the holder sat during the
program were supervised by a calibrated reviewer and the Green Belt credentials that rested
on them stand; the program re-reads those records as a precaution and tells the Green Belts
nothing unless a re-read changes something. Where the revoked holder later served as a Green
Belt reviewer of record, the projects they reviewed are re-scored under §2.6 rules in the next
audit cycle, and the Green Belt credentials stand unless that re-score finds a ★ item unearned
— in which case the Green Belt rule applies: the credential is unchanged and the holder is
offered a coached resubmission.

What is **not** a ground for revocation: a `sustained` flag of `false` or `unreachable`; a
control plan the organization later abandoned; a re-review score difference; a benefit
estimate Finance later revised; an experiment whose operating window the process later moved
off; an honest pilot that did not move the metric; a kaizen event whose 30-day list was not
completed by the organization. None of these is misconduct, and the program says so here so
that no holder is tempted to make a result look better than it was.

### 2.8 Recertification — the three-year rule

The Black Belt credential expires three years from `issuedOn` and is renewed on evidence,
not on payment (terms §9). Over the three-year cycle the holder records both:

- **24 CEUs** — one CEU is ten contact hours, on the IACET basis once accredited and on the
  program's own hours record on the same basis before then. That is 240 hours over 36 months,
  about 80 hours a year: a working Black Belt's practice, recorded, not an evening course.
  Hours count from any mix of: documented improvement projects of any size beyond the one
  below, on the A3 template and completeness-checked; coaching and tollgate review, on the
  §2.3b log; Green Belt or Yellow Belt facilitation or co-instruction in the program's
  cohorts; Black Belt Guild masterclasses (RSM deep-dive, simulation, process mining) and
  peer consulting circles; showcase attendance and presentation; reviewer calibration and
  re-review audit participation for holders on the reviewer bench; Master Black Belt
  fellowship hours for holders who progress; a control-plan audit of the holder's own
  certified project with its sustainment chart.
- **Practice evidence — one of two:** a **completed improvement project** of any size with a
  verified result, submitted on the A3 template and completeness-checked (not rubric-scored)
  — a Green-Belt-scale project counts; or **40 documented coaching hours** on the §2.3b log,
  countersigned by the program (for coaching in its cohorts) or by the holder's own CI lead or
  Master Black Belt (for coaching in the holder's organization). Hours spent on the qualifying
  project or coaching also count toward the 24 CEUs; the practice item is a requirement of
  kind, not a second pool of hours. Attendance alone does not renew a practitioner credential.

All of it is earnable at no cost through the Black Belt Guild and the program's coaching
seats, by design — and the coaching route is the same log that feeds Master Black Belt
candidacy, so the renewal and the progression are one record. A modest administrative fee
covers the review of the renewal record and is published with the fees.

On renewal the program issues a fresh assertion with a new `expires`, the original
`issuedOn` retained, `coachingHours` updated to the cumulative countersigned total, and the
same verification URL. A lapsed credential moves to `inactive` on the verification page with
the lapse date; it is never deleted, it keeps its evidence, and it returns to `active` when
the current cycle's requirements are met — the program does not erase work that was genuinely
done. Master Black Belt admission, reviewer-of-record roles and paid coaching seats require
an `active` Black Belt.

### 2.9 Admission — the calibration assessment for Green Belts certified elsewhere

The README's prerequisite is a certified Green Belt — this program's, or an external one plus
the calibration assessment — and one completed DMAIC project on a real process. The
assessment exists because Green Belt credentials on the market range from an eight-week
project cohort to a two-hour video, and the skills matrix places specific things at Green
(Gage R&R, capability, basic control charts, t-test, ANOVA, chi-square, simple regression,
FMEA, pilot design, control plans) that Modules 2–6 assume on day one. Gaps are **bridged
with targeted Green Belt modules, never waived** — and never used to refuse an applicant who
holds the credential and did the project.

**Who takes it.** Any applicant whose Green Belt was issued by another program or body. A
holder of this program's standard Green Belt with `active` status does not; one with an
`inactive` Green Belt reinstates it first (Green Belt crosswalk §2.8). A Practicum-track Green
Belt from this program takes only Part B, and only once they have a completed sponsored
project to submit.

**Part A — the knowledge form.** 40 items drawn from the Green Belt CERT bank in the Green Belt
blueprint's section proportions, 90 minutes, online with identity verification, under the
Green Belt exam's conditions (closed notes). Items drawn count against the bank's exposure
rule. The form is too short to certify anyone — it is 40 items, not 100 — and it does not: it
locates gaps by section. The result is reported to the applicant by section as *at standard*
(the Green Belt cut applied to the section) or *bridge*; a section with fewer than half its
items correct is always *bridge*, whatever the total.

**Part B — the project read.** The applicant submits their completed DMAIC project on the
Green Belt project summary form (charter, baseline, cause verified, before/after evidence,
control plan) with the sponsor's contact confirmed. A calibrated Green Belt reviewer reads it
against the four Green Belt ★ items — M3 measurement system analysis attempted, A3 root cause
verified with data, I3 before/after evidence, C1 control plan handed to a named owner — and
marks each *evidenced* or *not evidenced*, with the data-ethics line. It is not scored and it
does not produce a Green Belt credential; it tells the program which Black Belt module will
have to do Green Belt work first.

**The bridge plan.** Every *bridge* section and every ★ item *not evidenced* maps to a Green
Belt week module, taken self-paced with its cumulative check and the lab recording, and to the
Black Belt module where the gap would otherwise surface:

| Gap found | Green Belt bridge | Black Belt module that depends on it |
|---|---|---|
| Define section, or a charter without an operational definition | GB Week 1 | M1 §1.5 — the charter at scale rebuilds it |
| Measurement system section, or ★ M3 not evidenced | GB Week 3 | M2 — the nested and expanded studies assume a crossed Gage R&R has been run and read |
| Capability and control charts section | GB Week 4 | M3 §3.3 and M6 §6.1 — non-normal capability and chart selection at scale assume the basic charts and Cp/Cpk |
| Analyze section, or ★ A3 not evidenced | GB Weeks 5–6 | M4 — regression with diagnostics assumes a t-test, ANOVA and simple regression read and written up as a sentence to the sponsor |
| Improve section, or ★ I3 not evidenced | GB Week 7 | M5 §5.11 and I1 ★ — the experiment-or-pilot choice assumes a pilot with a prediction and a stop rule has been run |
| Control section, or ★ C1 not evidenced | GB Week 8 | M6 §6.5 — the control strategy assumes a control plan handed to an owner |

The bridge modules are completed before the Black Belt module that depends on them — the
earliest before week 1 — and are included in the seat, not sold separately. Completion is a
completeness check on the module's cumulative check and its Try exercises, by the Black Belt
instructor; it is not a Green Belt exam and confers nothing. An applicant with bridges in
every section is told plainly that they are looking at most of the Green Belt course before
week 1 and offered the Green Belt cohort instead, with the calibration result carried
forward for twelve months.

**Record.** The calibration result is held in the candidate's record and is never on the
badge, never on the verification page and never shared with an employer beyond "admitted;
bridge modules assigned: n". A candidate who completed bridge modules holds exactly the same
credential as one who did not.

### 2.10 What the learner receives

A digital badge; a one-page PDF certificate carrying the credential's full name, the reviewer
of record's name and signature, `verifiedImpact` and a verification QR code; a completion
record in the LMS transcript; the Black Belt toolkit in their vertical's vocabulary — DOE
planning canvas, experiment logbook, regression diagnostics checklist, benefit-classification
guide, stakeholder strategy canvas, kaizen event leader's kit, executive readout; their scored
rubric feedback and the reviewer of record's report; the DOE practicum, kaizen and tollgate
review records with the observer's feedback; the countersigned coaching log; the two forks
written for them by the reviewer of record — the Master Black Belt track or the specialist
micro-credentials — citing their project; and Black Belt Guild access with the renewal path in
§2.8 and the paid coaching seats. The day-90 sustainment result goes to the holder and the
sponsor together. Coaching notes from the Master Black Belt sessions stay with the coach and
are never part of the record.

### 2.11 CEUs

10 IACET CEUs are **pending accreditation**. Until accreditation is granted no CEU is claimed
on the badge, the certificate or the course description; the words "pending accreditation"
appear wherever the number appears. Once granted, CEUs apply to awards from the accreditation
date forward, not retroactively — a holder from an earlier cohort is told this plainly rather
than left to assume. The 100 structured hours are what the application counts; project hours,
the kaizen event and the coaching hours are not.

---

*v1.0 · 2026-09-20*
