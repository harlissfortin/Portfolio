# Green Belt Exam Bank — Section C1: Analyze, graphical and cause tools

Part of the Green Belt certification item bank. Blueprint, minimally competent candidate
statement, form-assembly constraints and the other sections are in
[`../exam-bank.md`](../exam-bank.md). Governed by
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).

**Blueprint row:** C1 · 12 per form · 42 in bank · objective **G5** (isolate and verify root
causes with graphical tools and basic hypothesis tests). This section covers the week 5
material: reading histograms, box plots, scatter plots and multi-vari charts; fishbone quality;
C&E matrix scoring; FMEA at working level; and the hypothesis-testing framework, including
choosing the test with the selector. Running and reading the tests themselves is Section C2.

**Tag format:** `[section · objective · Bloom · vertical · type · pool]` — type K = concept,
S = scenario judgment, X = exhibit interpretation. Correct option ✅; the rationale follows the
tag and says why the best distractor is wrong. Exhibits are small tables or software-style
output; where a number is a basis-dependent quantity, the stem fixes the basis.

---

## Section C1 — Analyze: graphical analysis, fishbone, C&E matrix, FMEA, hypothesis framework (42 CERT)

**C1-1.** Two lathes feed one bin of output shafts. The histogram below is 200 shaft diameters measured this week; the specification is 9.97–10.03 mm and the overall mean is 10.001 mm.

| Bin (mm) | 9.96–9.97 | 9.97–9.98 | 9.98–9.99 | 9.99–10.00 | 10.00–10.01 | 10.01–10.02 | 10.02–10.03 | 10.03–10.04 |
|---|---|---|---|---|---|---|---|---|
| Count | 12 | 38 | 31 | 9 | 8 | 30 | 44 | 28 |

Your best next step:
A. Report the process as centered — the overall mean sits on nominal, so the out-of-spec tails are ordinary spread to reduce · B. Merge the data into four wider bins so the shape settles into a single peak before deciding anything · C. Re-plot the histogram stratified by lathe — two peaks with a trough at the mean are the signature of two processes mixed in one bin ✅ · D. Compute Cpk on the pooled data now to quantify the out-of-spec fraction for the sponsor
`[C1 · G5 · Analyze · MFG · X · CERT]` — A bimodal shape with a hollow at the mean means the mean describes neither lathe; option A reads the mean as if the data were one population, which is exactly what the shape rules out.

**C1-2.** A team wants to know whether cycle times drifted upward over the last month. A histogram of the month's cycle times is the wrong tool for that question because:
A. A histogram needs at least 500 observations before its shape can be read with any confidence · B. A histogram discards time order — a run chart or control chart is needed to see drift ✅ · C. A histogram works only for attribute data, and cycle time is continuous · D. A histogram shows the center of a distribution but cannot show its spread
`[C1 · G5 · Understand · NEU · K · CERT]` — Drift is a question about sequence, and the histogram throws sequence away; option A is a myth — shape is readable from a few dozen points, it just cannot show when anything happened.

**C1-3.** Emergency department door-to-provider times (minutes) for 412 visits in one month. Mean 47 min, median 34 min.

| Bin (min) | 0–20 | 20–40 | 40–60 | 60–80 | 80–100 | 100–120 | 120–180 | 180–300 |
|---|---|---|---|---|---|---|---|---|
| Count | 96 | 148 | 79 | 38 | 21 | 12 | 13 | 5 |

The sponsor asks for "the typical wait" and "where to look." Your answer:
A. Typical wait is 47 min; the tail is sampling noise and will average out once another month of data is added · B. Typical wait is 34 min; remove the 18 visits over 120 min before further analysis so they do not distort the tests in week 6 · C. Typical wait cannot be stated until the data are transformed to a symmetric shape and re-plotted · D. Typical wait is about 34 min (the median), and the long right tail — 18 visits over 120 min — is where to look for what those visits have in common ✅
`[C1 · G5 · Analyze · HC · X · CERT]` — With a right-skewed distribution the median is the honest "typical" and the tail is the analysis target, not an inconvenience; option B reports the right center but then discards the very cases that carry the cause.

**C1-4.** Loan applications carry a 5-working-day service-level target. The histogram of 900 recorded processing times shows a dense pile between 4.0 and 4.9 working days, almost nothing between 5.0 and 7.9 days, and a small cluster at 8–10 days. Process staff say the workload is steady. As Green Belt you should first:
A. Check how the timestamp is generated — a cliff exactly at the target with an empty zone beyond it usually means the system or the working practice lets a file be closed and reopened, so the recorded time is being managed, not the work ✅ · B. Report the process as meeting the target for 92% of applications and take the 8% cluster at 8–10 days into Analyze as the problem to solve · C. Treat the 8–10 day cluster as outliers, exclude them from the baseline and recompute the mean and standard deviation · D. Reset the target to 4.9 working days, since the process demonstrably achieves it for almost every application
`[C1 · G5 · Analyze · TXN · S · CERT]` — A distribution that stops dead at a target is a measurement-system finding, not a capability finding; option B takes the data at face value and would build the whole Analyze phase on a number the design of the recording system has shaped.

**C1-5.** Box plots of discharge-order-to-departure time (minutes) by inpatient unit, one month:

| Unit | n | Q1 | Median | Q3 | Upper whisker | Points beyond whisker |
|---|---|---|---|---|---|---|
| 3 East | 58 | 95 | 140 | 210 | 370 | 2 |
| 3 West | 61 | 90 | 135 | 200 | 350 | 1 |
| 4 North | 55 | 150 | 260 | 380 | 600 | 0 |

The reading you carry into the cause-narrowing lab:
A. 3 East is the priority unit — it has the most points beyond the whisker, and extreme cases are where harm concentrates · B. 4 North's median is nearly double the other two units' and its middle 50% is wider; the unit is a stratum to investigate, and the difference should be tested before it is claimed ✅ · C. The three units perform alike, since their sample sizes are nearly equal and none has more than two extreme points · D. The medians show that 4 North's staff work more slowly than the staff on the other two units, which is the cause to report
`[C1 · G5 · Analyze · HC · X · CERT]` — The display locates the variation in a unit, which is where to look next, and a one-way ANOVA in week 6 confirms or refutes it; option D converts a stratum into a people-cause without asking what differs about 4 North's process.

**C1-6.** In a box plot, the box itself spans:
A. The mean plus and minus one standard deviation of the observations · B. The 95% confidence interval for the median of the observations · C. The middle 50% of the observations, from the first to the third quartile ✅ · D. The full range of the observations excluding any points flagged as outliers
`[C1 · G5 · Remember · NEU · K · CERT]` — The box is Q1 to Q3, so its height is the interquartile range; option A describes a parametric summary that the box plot deliberately does not use.

**C1-7.** A team has six measurements per shift across three shifts and draws three box plots to compare the shifts. A better choice is to:
A. Plot an individual-value (dot) plot by shift — with six points per group the quartiles are unstable and the boxes hide as much as they show ✅ · B. Keep the box plots but add the mean as a marker inside each box so center is shown two ways · C. Pool the eighteen values into one box plot, since three groups of six are too few to compare separately · D. Draw one histogram per shift so the shape of each shift's distribution is visible alongside its center
`[C1 · G5 · Apply · NEU · S · CERT]` — Box plots summarize, and with very small groups the summary is less informative than the points themselves; a histogram of six values (option D) has the same problem in a worse form.

**C1-8.** Invoice approval time (working days) before and after a pilot of revised approval routing, 120 invoices in each period, same operational definition and same time basis:

| Period | Q1 | Median | Q3 | Maximum |
|---|---|---|---|---|
| Before | 1.4 | 2.1 | 4.9 | 14.0 |
| After | 1.6 | 2.0 | 2.6 | 5.2 |

The sentence you would tell the sponsor:
A. "The pilot made no difference — the median moved from 2.1 to 2.0 working days, which is within noise" · B. "The pilot cut approval time by 63%, from a maximum of 14 working days to 5.2" · C. "The pilot improved the average approval time, so the routing should be rolled out to all invoice types" · D. "The pilot did not change the typical invoice, but it removed the long tail: the slowest quarter now finishes by 2.6 working days instead of 4.9, and nothing waited beyond a week" ✅
`[C1 · G5 · Analyze · TXN · X · CERT]` — The improvement is in variation, not center, and that is what the customers who waited longest experience; option A reads only the median and misses the whole effect.

**C1-9.** Box plots of order-to-ship time (calendar hours) by weekday show Monday's median at 31 hours against 18–20 hours for the other four days, with similar spread on every day. A team member proposes "Monday" as the root cause. Your response:
A. Agree, and schedule extra picking staff on Mondays as the countermeasure to pilot in week 7 · B. Treat Monday as the stratum where the effect shows, not the cause — ask what differs on Mondays (weekend order backlog, carrier pickup schedule, staffing) and write those as checkable causes ✅ · C. Reject the finding until a hypothesis test in week 6 confirms that the Monday difference is statistically significant · D. Re-plot by week of the month, because a weekday pattern is only meaningful if it also holds by week
`[C1 · G5 · Analyze · MFG · S · CERT]` — Stratification answers where, not why; option C is backward — the test comes after the causes are stated, and the box plot has already done its job of pointing.

**C1-10.** Scatter plot of sealing-bar temperature (°C) against seal strength (N), 40 packs sampled over a week during normal running, temperature range 172–178 °C. Software reports Pearson r = 0.82. The team concludes: "Raise the set point 20 °C to maximize strength." Your correction:
A. r = 0.82 means temperature explains 82% of the strength variation, so the conclusion is justified and the set point should move · B. The correlation is too weak to act on; only an r above 0.9 supports changing a validated set point · C. The plot shows a strong association inside a 6 °C window; it does not show what happens at 196 °C, and it does not prove temperature is the cause — run a controlled comparison at two set points within the safe range before touching the standard ✅ · D. Correlation never supports causal action of any kind, so the team should drop temperature from the cause list
`[C1 · G5 · Analyze · MFG · X · CERT]` — A scatter plot supports inference only within its observed range and cannot by itself rule out a hidden third variable; option A confuses r with r² and treats association as proof.

**C1-11.** Correlation between call-handling time (seconds) and customer effort score, 25 agents, one month:
```
Pearson correlation, all 25 agents:       r = 0.61   p = 0.001
Pearson correlation, excluding agent 17:  r = 0.08   p = 0.70
Agent 17: handling time 812 s (next highest 340 s); effort score 4.9 (next highest 3.6)
```
The correct handling:
A. Investigate agent 17's data point before drawing any conclusion — is it a recording error or a real case? — and report the relationship both with and without it ✅ · B. Report r = 0.61 as the finding; the point is a real observation, and removing data because it is inconvenient is a data-ethics violation · C. Exclude agent 17 as an outlier and report r = 0.08 — one agent cannot be allowed to create a relationship that does not exist for the other 24 · D. Report the average of the two correlations, r = 0.35, since neither figure on its own is clearly the right one
`[C1 · G5 · Analyze · TXN · X · CERT]` — One point is carrying the whole correlation, and the ethical response is to find out what it is and show both analyses, not to pick the one you prefer; option B is right that silent removal is wrong but wrong that a single point should be allowed to make the finding.

**C1-12.** A scatter plot shows a clear U-shape: the output is high at both low and high values of the input and lowest in the middle. Software reports r = 0.03. The correct reading:
A. There is no relationship between the two variables, and the input can be dropped as a cause · B. The sample is too small for the correlation coefficient to be reliable, so more data are needed · C. The data must contain an error, because a visible pattern always produces a large correlation coefficient · D. Pearson r measures linear association only; a real curved relationship exists and should be reported from the plot ✅
`[C1 · G5 · Understand · NEU · K · CERT]` — r near zero rules out a straight-line relationship, not a relationship; option A is the misreading the plot exists to prevent.

**C1-13.** A nurse manager wants to see whether fall rate differs across six inpatient units. A colleague suggests a scatter plot with unit number 1–6 on the horizontal axis and falls per 1,000 patient-days on the vertical. Your advice:
A. Use the scatter plot, and fit a regression line to test whether fall rate trends across the units · B. Unit is a category, not a measurement — use a bar chart or individual-value plot by unit, ordered by rate, so the comparison is between groups rather than along a meaningless number line ✅ · C. Use the scatter plot but compute Spearman rather than Pearson correlation, since unit number is only ordinal · D. Use a histogram of the six rates so the distribution across units is visible in one picture
`[C1 · G5 · Apply · HC · S · CERT]` — A scatter plot needs two continuous variables, and a "trend across unit number" (option A) would be a relationship with an arbitrary label; the question is a group comparison.

**C1-14.** A scatter plot of packaging line speed (packs/min) against seal defects per 1,000 packs shows r = 0.70 across 13 weeks. Line speed was raised in week 6 — the same week a new film supplier's lots started arriving. The defensible next step:
A. Report speed as the verified cause; the correlation is strong, the timing matches, and speed is the variable the team controls · B. Report the film supplier as the cause; supplier changes are the more common cause of seal defects in this kind of line · C. Stratify the plot by film supplier, and if speed and supplier still move together, run a short comparison at both speeds using one film lot — the two causes are confounded in the observational data ✅ · D. Drop the weeks after week 6 from the analysis so the supplier change cannot influence the correlation
`[C1 · G5 · Analyze · MFG · S · CERT]` — Two candidate causes that changed at the same time cannot be separated by looking harder at the same data; option A picks one on the strength of a correlation that supports either equally.

**C1-15.** Multi-vari study on bore diameter (µm from nominal): three consecutive pieces sampled each hour, four positions measured on each piece, six hours on one shift.
```
Family of variation                        Range observed
Within piece (4 positions)                 2–3 µm, no consistent pattern
Piece to piece (3 consecutive pieces)      3–4 µm
Hour to hour (6 hourly samples)            18 µm, steady rise from hour 1 to hour 6
```
Where should cause-hunting concentrate?
A. Time-related causes such as tool wear or thermal growth — the hour-to-hour family is about six times the others and moves in one direction ✅ · B. Fixturing and clamping — the within-piece positions show the process cannot hold shape across the bore · C. Incoming material — piece-to-piece variation shows the stock is inconsistent from bar to bar · D. Nowhere yet — the study must be repeated on a second shift before any family can be named with confidence
`[C1 · G5 · Analyze · MFG · X · CERT]` — The study's purpose is to show which family dominates, and here the temporal family does with a directional signature; option D is caution without a reason, since a 6:1 ratio with a monotonic drift is not a shift-specific artefact to wait on.

**C1-16.** A multi-vari chart is designed to show:
A. Whether the process is capable of meeting its specification limits · B. The strength of the linear relationship between two continuous variables · C. Whether the difference between two groups is statistically significant · D. Which family of variation — within unit, unit to unit, or time to time — is largest, so cause hunting can focus there ✅
`[C1 · G5 · Understand · NEU · K · CERT]` — Multi-vari is a stratified picture of where variation lives; option C describes what the hypothesis tests do after the chart has pointed.

**C1-17.** A team plans a multi-vari study of laboratory result turnaround time (collection to verified result, minutes). The complaint is that turnaround "varies wildly." Their plan: sample 20 consecutive specimens on one analyzer during Tuesday day shift. The plan's main weakness:
A. Twenty specimens is too few for any statistical conclusion about turnaround time · B. One analyzer is fine, but the specimens should be randomly rather than consecutively selected · C. It spans one analyzer, one shift and one day, so it cannot separate analyzer-to-analyzer, shift-to-shift and day-to-day variation — the very families the complaint points to ✅ · D. It measures turnaround time rather than a defect count, so the study cannot be charted
`[C1 · G5 · Apply · HC · S · CERT]` — A multi-vari plan must sample across every family it hopes to compare, over the period in which the problem shows; option B trades consecutive sampling for random and loses the short-term family it was capturing.

**C1-18.** A team wants to run a multi-vari study on "application approved: yes/no" to see whether approvals vary by processor, by batch and by week. Your advice:
A. Proceed — multi-vari handles any data type once the families of variation are defined · B. A multi-vari chart needs a measured value on each unit; with a yes/no outcome, stratify the approval proportion by processor, batch and week instead, using a p-chart or a stratified Pareto ✅ · C. Convert each yes to 1 and each no to 0 and plot the multi-vari on those values so the tool can be used as planned · D. Replace the outcome with each processor's rating of application quality on a 1–10 scale, which is continuous
`[C1 · G5 · Apply · TXN · S · CERT]` — The tool is built for continuous Y and cannot show within-unit and unit-to-unit families on a binary outcome; option C produces a chart of zeros and ones that shows nothing the stratified proportion does not show better.

**C1-19.** Excerpt from a team's fishbone for "medication reconciliation errors on admission":
```
Method        Reconciliation done from memory when the pharmacy list is unavailable after 19:00
Method        The process is broken
Measurement   Pharmacy audit and nursing audit define "error" differently
People        Nurses are rushed
Machine       EHR medication list and pharmacy list do not sync; entries are re-typed
```
Which entry must be resolved before the C&E matrix is scored, and why?
A. "Reconciliation done from memory after 19:00" — it names a time and is checkable, so it should be verified before anything else is scored · B. "The process is broken" — it is the team's honest finding and should be escalated to the sponsor before further work · C. "EHR and pharmacy lists do not sync" — it is an IT cause outside the team's scope and must be handed off first · D. "Pharmacy and nursing audits define error differently" — until one operational definition exists, the error count every other cause is scored against is not trustworthy ✅
`[C1 · G5 · Analyze · HC · X · CERT]` — A disagreement about what counts as the Y undermines every cause on the diagram, so it is a Measure-phase gap to close first; option A picks a good checkable cause, but verifying it against an ill-defined count proves nothing.

**C1-20.** A fishbone diagram is NOT the right tool for which task?
A. Establishing which of the candidate causes actually drives the output ✅ · B. Generating a broad set of possible causes with the people who do the work · C. Organizing the team's suspicions by category so that empty categories are visible · D. Preparing the input list that a C&E matrix will score against the CTQs
`[C1 · G5 · Understand · NEU · K · CERT]` — The fishbone organizes informed opinion; verification takes data, which is why the diagram feeds a matrix and then a test; option D is a legitimate use that some teams skip, not a misuse.

**C1-21.** A fishbone session on late shipments produced 40 causes. The sponsor, who wants momentum, asks the team to "fix the top three by show of hands before next week." Your response as Green Belt:
A. Agree — sponsor support is scarce, the team knows the process, and the top three votes usually contain the real cause · B. Propose narrowing the 40 with a C&E matrix scored against the shipping CTQs to about five to eight causes, then verifying those with data over the next two weeks, and explain that a countermeasure aimed at an unverified cause fails the project review ✅ · C. Refuse to narrow at all until every cause on the diagram has been tested, since narrowing by judgment is what the tools are meant to replace · D. Ask the sponsor to pick the three causes personally, since the sponsor owns the process and carries the accountability
`[C1 · G5 · Apply · MFG · S · CERT]` — The structured path from 40 to a checkable few is the point of the tools, and telling the sponsor why protects the sponsor too; option C is the opposite failure — no project can test 40 causes, and the tools exist to avoid trying.

**C1-22.** On a fishbone for "claim cycle time over 10 working days," the Method bone carries "rework rate at step 4 is 22%." The entry is:
A. A checkable cause ready for the C&E matrix, because it names a step and carries a measured number · B. Blame directed at the step 4 team and should be removed from the diagram · C. An intermediate effect — rework is itself an output of something upstream, so ask what conditions at step 4 produce rework and place those conditions on the diagram ✅ · D. Out of scope, because rework rate belongs on a separate fishbone with its own problem statement
`[C1 · G5 · Analyze · TXN · S · CERT]` — A quantified symptom is still a symptom; option A mistakes having a number for being a cause, and a countermeasure aimed at "rework" would have nothing to act on.

**C1-23.** C&E matrix for a pouch-sealing line; output weights (1–10) come from the CTQ tree; relationship scores use 0/1/3/9.

| Cause (input) | Seal strength (wt 9) | Leak rate (wt 10) | Label legibility (wt 3) | Score |
|---|---|---|---|---|
| Sealing-bar temperature drift | 9 | 9 | 0 | 171 |
| Film supplier lot | 3 | 9 | 0 | 117 |
| Changeover method | 3 | 3 | 9 | 84 |
| Printer ribbon age | 0 | 0 | 9 | 27 |

The correct use of this result:
A. Declare sealing-bar temperature drift the root cause on the strength of the 171 score and design a countermeasure · B. Report to the sponsor that printer ribbon age has been eliminated as a cause of pouch defects · C. Fix temperature drift and film lot in parallel, since both scores exceed 100 and waiting for verification costs a week · D. Verify temperature drift and film lot first, plan changeover method next, and set ribbon age aside unless label legibility matters more to the customer than its weight of 3 says ✅
`[C1 · G5 · Analyze · MFG · X · CERT]` — The matrix orders the verification queue; it proves nothing and eliminates nothing; option C skips verification entirely and mistakes a score threshold for evidence.

**C1-24.** A team scores 20 causes in a C&E matrix and 18 of them land within 10 points of each other. The most likely reason and the fix:
A. The scale was used without anchors — raters gave 3 or 9 to almost every cell — so redefine what 0, 1, 3 and 9 mean with examples and rescore against what the team has actually observed ✅ · B. The causes are genuinely equal in importance, so the team should plan to verify all 20 in week 6 · C. The output weights were too similar, so raise the highest-weighted output to 10 and lower the rest to 1 to force a ranking · D. The team is too small for stable scores, so add more raters from other departments and average their scores
`[C1 · G5 · Apply · HC · S · CERT]` — A matrix that does not discriminate has been scored on sentiment rather than judgment; rescaling the weights (option C) manufactures a ranking without improving the judgments underneath it.

**C1-25.** The number in each cell of a C&E matrix represents:
A. The measured correlation between that cause and that output from the project's data · B. The probability that the cause occurs multiplied by the severity of its effect on the customer · C. The team's judgment of how strongly that cause affects that output, which is then weighted by the output's customer importance and summed across outputs ✅ · D. The cost of removing that cause relative to the benefit of doing so, on a 0–9 scale
`[C1 · G5 · Understand · NEU · K · CERT]` — The matrix is structured opinion that precedes data; option B describes an FMEA row, which is a different tool with a different purpose.

**C1-26.** A team investigating payment posting errors has six months of transaction records in which every candidate cause on the fishbone — processor, payment channel, batch size, time of day, customer segment — is already a recorded field. The team schedules a two-hour C&E matrix session. Your advice:
A. Run the matrix as planned; it is the required step between the fishbone and the hypothesis tests in the Green Belt toolkit · B. Skip the matrix and go straight to stratified charts and tests on the records — the matrix exists to narrow opinion when data do not yet exist, and here they do ✅ · C. Run the matrix, then use its ranking to decide which of the recorded fields can be deleted from the dataset · D. Run the matrix with the data hidden from the team so that their judgment is not biased by the numbers
`[C1 · G5 · Analyze · TXN · S · CERT]` — Scoring opinion when the same causes can be read from data is wasted motion and a weaker basis; option A treats the toolkit as a checklist rather than as a set of tools, each with a condition of use.

**C1-27.** A project charter names laboratory turnaround time (collection to result) as the Y, with result accuracy as a guardrail. The team's C&E matrix:

| Cause (input) | Turnaround time (wt 10) | Result accuracy (wt 8) | Audit compliance (wt 10) | Score |
|---|---|---|---|---|
| Specimen label handwritten | 3 | 9 | 3 | 132 |
| Batch held until 10 specimens | 9 | 0 | 0 | 90 |
| Courier runs every 2 hours | 9 | 0 | 0 | 90 |
| Requisition unsigned | 0 | 0 | 9 | 90 |

What is wrong, and what should change?
A. The scores are miscalculated; handwritten labels should total 120, which changes the order of the bottom three · B. Nothing — handwritten labels affect the most outputs and carry the highest score, so they should be verified first · C. The weights are too close together; reduce audit compliance to 5 so that turnaround dominates the ranking · D. "Audit compliance" is not a CTQ of this charter; it has pushed an unsigned-requisition cause into a tie with the two causes that actually act on turnaround, so restrict the outputs to the charter's Y and guardrail and rescore ✅
`[C1 · G5 · Analyze · HC · X · CERT]` — Outputs in the matrix must be the project's CTQs or the ranking answers a different question; option B verifies the wrong cause first because the matrix quietly changed the project's scope.

**C1-28.** Process FMEA excerpt for a bracket assembly cell (Severity, Occurrence and Detection each rated 1–10; RPN = S × O × D):

| Failure mode | S | O | D | RPN |
|---|---|---|---|---|
| Wrong torque on bracket bolt | 8 | 3 | 6 | 144 |
| Missing washer | 6 | 6 | 2 | 72 |
| Label misprint | 3 | 7 | 4 | 84 |
| Cracked housing shipped | 10 | 2 | 8 | 160 |

Which failure mode should the team address first, and why?
A. Cracked housing shipped — highest RPN, and independently a severity of 10 with a detection of 8 means a harmful failure reaches the customer unseen ✅ · B. Label misprint — highest occurrence, so it generates the most rework and the most visible cost in the cell · C. Missing washer — its low detection score shows it is the easiest to catch, so it is the quickest win to bank · D. Wrong torque on bracket bolt — severity times occurrence is highest once detection, which is only an estimate, is set aside
`[C1 · G5 · Analyze · MFG · X · CERT]` — RPN ranks it first and the severity rule ranks it first regardless of RPN; option C misreads the detection scale, where a low score means detection is good, not that the failure is easy to fix.

**C1-29.** In an FMEA, a Detection score of 9 means:
A. The failure has been detected nine times in the period the team reviewed · B. Current controls are very unlikely to catch the failure before it reaches the next customer ✅ · C. The failure is detected about 90% of the time by the current controls · D. Detection is almost certain, so the failure mode can be moved down the priority list
`[C1 · G5 · Understand · NEU · K · CERT]` — The detection scale runs the "wrong way" — high is bad — and option C is the intuitive inversion that produces backwards priorities.

**C1-30.** Two rows in a specimen-handling FMEA both score RPN 120: "wrong patient label applied" (S 10, O 3, D 4) and "tube under-filled, redraw required" (S 4, O 6, D 5). The team plans to work them in the order they appear on the sheet. Your correction:
A. Equal RPNs mean equal risk, so the order does not matter and the team should take whichever is cheaper · B. Work the under-filled tube first, because it occurs twice as often and the redraws are a daily cost to patients · C. Work the wrong-patient label first regardless of RPN — a severity of 10 is a patient-harm effect, and RPN is a product of three ordinal scales that cannot trade harm against inconvenience ✅ · D. Multiply each RPN by its occurrence score again to break the tie on a consistent basis
`[C1 · G5 · Analyze · HC · S · CERT]` — RPN's arithmetic hides unequal risk behind equal numbers, and severity is the tie-breaker the tool's own guidance names; option B uses one factor alone and picks the wrong one.

**C1-31.** After adding a duplicate-account check, a team re-scores "payment posted to wrong account": Detection falls from 8 to 2. They also lower Severity from 9 to 4 "because it is now caught before the customer sees it." The correct re-scoring:
A. Both changes are right — a failure that is caught has a smaller effect, so its severity is lower · B. Lower Occurrence rather than Severity, since the check reduces how often the failure happens in the first place · C. Leave all three scores unchanged until the check has run for six months and its effect is measured · D. Change Detection only — Severity describes the effect if the failure reaches the customer and does not change with detection controls; Occurrence changes only if the cause is removed ✅
`[C1 · G5 · Apply · TXN · S · CERT]` — Each factor rates one thing, and a control that catches a failure does not change what the failure would do; option B is the second common error, since the check does nothing to the cause.

**C1-32.** An FMEA adds the least value in Analyze when:
A. Six months of failure records exist by mode — a Pareto of observed failures ranks them from data, and opinion-based Occurrence scores would only add noise ✅ · B. The process has many steps, because the FMEA table becomes too long to score in one session · C. Frontline staff are on the team, because their scores are biased toward the failures they saw most recently · D. Severity differs widely across the failure modes, because the RPN then cannot be compared across rows
`[C1 · G5 · Apply · NEU · K · CERT]` — The FMEA's Occurrence column is a stand-in for frequency data the team does not have; option C is backwards — the people who see the failures are the ones who make Occurrence and Detection scores honest.

**C1-33.** FMEA row before and after a countermeasure:
```
Failure mode:  refund issued twice for one claim
Before:        S 7   O 5   D 8    RPN 280
Action:        duplicate-claim check added at posting
After:         S 7   O 5   D 2    RPN 70
```
The sentence you would tell the sponsor:
A. "Risk from double refunds is down 75%, from an RPN of 280 to 70" · B. "A double refund is now caught at posting before the second payment leaves; how often a duplicate is attempted and what it costs when one gets through have not changed, so the next step is to reduce the attempts" ✅ · C. "The double-refund failure mode has been eliminated by the posting check" · D. "Severity can now be re-rated downward, which will bring the RPN below the action threshold"
`[C1 · G5 · Analyze · TXN · X · CERT]` — RPN is not a ratio scale, so a percentage (option A) claims a precision the numbers do not have; saying what changed — detection — and what did not is both accurate and points to the next action.

**C1-34.** During an FMEA session two members rate the severity of "coolant leak at fitting" as 4 and 9. The facilitator's best move:
A. Record the average, 6.5, and move on so the session keeps pace through the remaining rows · B. Record 9 — in an FMEA the higher of two ratings is always used so that risk is never understated · C. Return to the anchored severity scale and ask what the effect on the end customer is if the leak occurs — the disagreement is usually about which effect is being rated, and it is resolved by naming it, not by arithmetic ✅ · D. Defer the row until a design engineer can rate it alone, since severity is an engineering judgment
`[C1 · G5 · Apply · MFG · S · CERT]` — Severity ratings are ordinal and anchored to an effect, so averaging (option A) manufactures a number that describes neither member's judgment.

**C1-35.** A team will test whether a layout change altered mean pick time. In plain words, the null hypothesis is:
A. The layout change reduced mean pick time by at least the amount the team predicted · B. The sample means before and after the change are exactly equal to each other · C. Pick times before and after the change are both normally distributed · D. The layout change made no difference to mean pick time, and any difference in the samples is what sampling variation alone would produce ✅
`[C1 · G5 · Understand · NEU · K · CERT]` — The null is the "nothing happened" claim the data are asked to contradict; option B describes the samples, which are almost never exactly equal, rather than the process.

**C1-36.** A test returns p = 0.03. The correct reading:
A. If there were truly no difference, data at least this far from "no difference" would occur about 3% of the time ✅ · B. There is a 3% probability that the null hypothesis is true, given the data collected · C. There is a 97% probability that the change worked and will keep working · D. The effect is large enough to matter in practice, because 0.03 is well under the 0.05 threshold
`[C1 · G5 · Understand · NEU · K · CERT]` — The p-value is a statement about the data given the null, not about the null given the data; option B is the most common inversion, and it is the one sponsors will repeat if you let it pass.

**C1-37.**
```
Two-Sample T-Test: door-to-needle time (min), Unit A vs Unit B
N:        A = 8       B = 8
Mean:     A = 61.2    B = 52.9     Difference (A − B) = 8.3
95% CI for difference:  (−9.9, 26.5)
T = 0.98     DF = 14     P-Value = 0.341
```
The team writes: "No difference between units — unit eliminated as a cause." The sentence you would tell the sponsor instead:
A. "Unit A is 8.3 minutes slower; the test did not reach significance only because alpha was set too low for a sample this size" · B. "The units perform the same, so we can close this line of inquiry and move on to the remaining causes" · C. "Unit A averaged 8 minutes slower, but with eight cases each the data are consistent with anything from Unit B being 10 minutes slower to Unit A being 26 minutes slower — we cannot tell yet, and need more cases before ruling unit in or out" ✅ · D. "The result is inconclusive because door-to-needle time is not normally distributed, so a different test is needed"
`[C1 · G5 · Analyze · HC · X · CERT]` — Failing to reject is not proof of no difference, and the wide interval shows the study had little power to find one; option B is the Type II error written up as a conclusion.

**C1-38.** A contact center compares mean handling time with and without a new screen layout: 40,000 calls in each arm, difference 1.4 seconds on a mean of 6 minutes 10 seconds, p < 0.001. The layout carries a licence fee per seat. Your reading:
A. The result is highly significant, so the layout should be licensed for every seat without further analysis · B. The difference is real but trivial — 1.4 seconds on a 370-second call is 0.4% — so the decision rests on whether that saving is worth the fee, not on the p-value ✅ · C. The result is unreliable, because a p-value this small only appears when the data have been manipulated or mis-recorded · D. The sample is too large for the test to be valid, so the comparison should be re-run on a random 200 calls per arm
`[C1 · G5 · Analyze · TXN · S · CERT]` — With 80,000 calls a test will detect differences nobody would pay for, and the effect size is the sponsor's number; option A confuses statistical detectability with practical worth.

**C1-39.** A pilot compares scrap rate with a new fixture against the old one over two weeks and reports p = 0.04 at alpha 0.05; the fixture is rolled out. Six months later scrap is back at baseline, and a larger re-study (eight weeks, both fixtures alternated daily) finds a difference of 0.1 percentage points with a 95% CI of −0.3 to +0.5 percentage points. The pilot most plausibly suffered:
A. A Type II error — the pilot missed the fixture's real effect, which the re-study then also failed to find · B. Low power — two weeks was too short a window for the pilot to detect anything reliably · C. A measurement error in the re-study, since the pilot met the alpha threshold and the re-study did not · D. A Type I error — a fixture with no real effect produced a p-value under 0.05, which alpha permits about one time in twenty ✅
`[C1 · G5 · Analyze · MFG · S · CERT]` — The re-study's interval hugs zero, so the original "significant" result was a false positive of the kind alpha allows; option A names the wrong error — a Type II error is missing a real effect, and there was none to miss.

**C1-40.** Abridged hypothesis-test selector from the Green Belt toolkit:
```
Y continuous · X categorical, 2 independent groups    → 2-sample t-test
Y continuous · X categorical, 2 groups, same units     → paired t-test
Y continuous · X categorical, 3 or more groups         → one-way ANOVA
Y continuous · X continuous                            → correlation / simple regression
Y categorical (counts) · X categorical                 → chi-square test of association
Y continuous · one group against a target              → 1-sample t-test
```
The question: "Does the proportion of defective units differ across four sources?" The selector points to:
A. Chi-square test of association — Y is defective yes/no, X is source ✅ · B. One-way ANOVA — there are four groups to compare, which is more than two · C. Two-sample t-test run six times, once for each pair of sources, with the smallest p-value reported · D. Simple regression of defect count on source number, since four sources give four points on a line
`[C1 · G5 · Apply · NEU · X · CERT]` — The selector routes on the data type of Y first, and a yes/no outcome is categorical no matter how many groups X has; option B is the trap of counting groups before asking what kind of Y you have.

**C1-41.** Thirty clerks each process a standard batch with the old form, then the same batch with a redesigned form; batch time in minutes is recorded for each clerk under each form. To test whether the redesign changed batch time, the selector points to:
A. A two-sample t-test on the 30 old-form times against the 30 new-form times, since there are two groups · B. One-way ANOVA with clerk as the factor, since there are 30 groups of two observations each · C. A paired t-test on each clerk's difference, because the same 30 clerks provide both measurements and clerk-to-clerk variation would otherwise swamp the form effect ✅ · D. A chi-square test on the count of clerks who improved against the count who did not
`[C1 · G5 · Apply · TXN · S · CERT]` — Pairing removes the between-clerk variation from the comparison; option A is valid arithmetic but throws that pairing away and can miss a real effect.

**C1-42.** Before running a two-sample t-test comparing mean wait time at two clinics over ten weeks, you plot each clinic's weekly data on an I-MR chart. Clinic B's chart shows a sustained upward shift from week 6, with three rule violations. Your decision:
A. Run the test anyway — the shift is inside the ten-week window, so it is part of Clinic B's performance and belongs in the comparison · B. Do not test yet — Clinic B's data are two processes, not one, so the test would compare Clinic A against a mixture; find what changed in week 6, then compare like periods ✅ · C. Drop weeks 6–10 from Clinic B and run the test on weeks 1–5, when both clinics were stable · D. Switch to a chi-square test on the count of waits over target, which does not assume the process is stable
`[C1 · G5 · Analyze · HC · S · CERT]` — "Stability before capability" applies to Analyze as well: a test assumes each sample comes from one process; option C removes half the data without explaining the shift, which is both a data-ethics failure and a missed cause.

<!--
Section C1 tallies (42 items)
Key position:  A 10 (4,7,11,15,20,24,28,32,36,40) · B 11 (2,5,9,13,18,21,26,29,33,38,42) · C 11 (1,6,10,14,17,22,25,30,34,37,41) · D 10 (3,8,12,16,19,23,27,31,35,39) — max 26%
Type:          S 18 (43%) · X 14 (33%) · K 10 (24%)
Bloom:         Analyze 22 · Apply 11 · Understand 8 · Remember 1 — Apply/Analyze 33/42 = 79%
Vertical:      NEU 12 · MFG 10 · HC 10 · TXN 10 — NEU alone fills the 12-item form quota
Negative stems: 1 (C1-20) = 2.4%
"When NOT to use" coverage: histogram C1-2 · box plot C1-7 · scatter C1-13 · multi-vari C1-18 · fishbone C1-20 · C&E matrix C1-26 · FMEA C1-32 · hypothesis test C1-42
Exhibit arithmetic checked: C1-1 counts sum 200; C1-3 counts sum 412, 18 over 120 min; C1-23 scores 171/117/84/27; C1-27 scores 132/90/90/90; C1-28 RPN 144/72/84/160; C1-30 both 120; C1-33 280 → 70; C1-37 t = 8.3/8.47 = 0.98, df 14, CI = 8.3 ± 2.145 × 8.47; C1-38 1.4/370 = 0.38%
-->

---

v1.0 · 2026-09-20
