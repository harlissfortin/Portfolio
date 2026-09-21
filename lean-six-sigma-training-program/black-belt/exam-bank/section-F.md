# Black Belt Exam Bank — Section F: Advanced SPC

Part of the Black Belt certification item bank. The blueprint, the minimally competent
candidate statement, the form-assembly constraints and the pool rules are in
[`../exam-bank.md`](../exam-bank.md); item-writing policy is
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).

**Tag format:** `[section · objective · Bloom · vertical · type · pool]` — **B6** deploy
advanced SPC: choose charts at scale, subgroup rationally, design and read EWMA and CUSUM
charts, run short-run charts, and recognize when a plain Shewhart chart or no chart is the
right call. Type: K = concept, S = scenario judgment, X = exhibit interpretation. Correct
option ✅; rationale after the dash.

**Conventions used in these items.** Exhibits are product-neutral, software-style output.
Run rules as in the Green Belt bank: Test 1 = one point beyond 3σ; Test 2 = nine in a row on
one side of the center line; Test 3 = six in a row all increasing or all decreasing.
ARL0 = average number of samples to a false alarm on a stable process; ARL1 = average number
of samples to a signal after a stated shift; ARL values in exhibits are rounded from the
standard published tables. EWMA: z_i = λx_i + (1 − λ)z_{i−1}, z_0 = μ0, steady-state limits
μ0 ± Lσ√(λ ÷ (2 − λ)). Tabular CUSUM: C⁺_i = max(0, x_i − (μ0 + K) + C⁺_{i−1}), C⁻ the
mirror image, K = kσ, H = hσ, signal when C⁺ or C⁻ exceeds H; N⁺ = samples since C⁺ was last
zero; the shifted mean is estimated as μ0 + K + C⁺ ÷ N⁺. Short-run: a nominal
(deviation-from-target) chart plots x − T on one set of limits; a standardized chart plots
(x − T) ÷ σ_part. Rare events: a g chart plots units of opportunity between events, a t chart
plots time between events, and on both an improvement shows as points rising. A p chart has a
lower limit above zero only when n > 9(1 − p) ÷ p; a c chart only when c-bar > 9. The
probability that an X̄ chart with 3σ limits and subgroup size n signals on a given subgroup
after a shift of δσ is ≈ Φ(−3 + δ√n). Control limits come from the process; specification
limits come from the customer.

---

## Section F — Advanced SPC: chart selection, rational subgrouping, EWMA/CUSUM, short-run (42 CERT)

**F1.** Exhibit — eight-spindle drilling machine, one hole per spindle per cycle:
```
X̄-R chart — hole depth (mm), 30 subgroups of 8; subgroup = the 8 holes from one machine cycle
R chart:  R-bar 0.092   UCL 0.170   no tests failed
X̄ chart: center 14.503   UCL 14.538   LCL 14.468   no tests failed
Mean depth by spindle over the 30 cycles: spindle 3 = 14.462, spindle 7 = 14.548, the other six 14.49–14.51
Specification 14.50 ± 0.05; an audit of spindle 3's holes finds 14% below the LSL
```
The correct reading:
A. The process is stable and capable because neither chart signals; the audit result points to a gauge problem, so repeat the MSA before touching the machine · B. Increase the subgroup to 16 by taking two cycles, which tightens the X̄ limits enough to expose the spindle offsets · C. The subgroup mixes eight spindles whose offsets are persistent, so R-bar measures spindle-to-spindle difference rather than common cause and the X̄ limits are inflated; chart each spindle separately (or a group chart of the highest and lowest spindle each cycle) and treat the spindle 3 and 7 offsets as setup problems to correct ✅ · D. Switch to an I-MR chart of the cycle average, which removes the spindle effect from the limits and shows the cycle-to-cycle behavior
`[F · B6 · Analyze · MFG · X · CERT]` — Persistent differences between streams inside a subgroup are the classic wrong subgrouping: they widen the limits and the average hides any one stream; D is closest, because charting cycle averages does put cycle-to-cycle variation in the limits, but the average still cannot show one spindle drifting out of specification.

**F2.** You are designing the subgroup for a control chart. The design rule you apply is:
A. The variation you want the chart to tolerate goes inside the subgroup, and the variation you want it to signal goes between subgroups ✅ · B. Every known source of variation is represented inside the subgroup, so that the limits describe the whole process · C. The subgroup is as large as the sampling budget allows, because a larger n always tightens the limits and improves detection · D. Consecutive units are never placed in the same subgroup, so that the subgroup is a random sample of the interval it represents
`[F · B6 · Understand · NEU · K · CERT]` — Rational subgrouping is a decision about which variation you are willing to call common cause; B is the reversal that produces the wide, silent charts in the multi-stream exhibits, and D describes acceptance-style sampling, which answers a different question.

**F3.** A clinical laboratory runs a control sample on an analyzer four times each morning and wants an X̄-R chart to detect a reagent-lot change, which shifts the mean and then persists. Two subgrouping plans are on the table: four consecutive runs at 07:00, or one run each at 07:00, 09:00, 11:00 and 13:00 combined into one subgroup. You advise:
A. The spread plan, so that the subgroup represents the whole morning the limits will be applied to · B. The consecutive plan, taken at fixed times with several subgroups a day, so that a lot change falls between subgroups and appears on the X̄ chart instead of inflating R and being averaged into a subgroup mean ✅ · C. One run per subgroup on an I-MR chart, because control material is expensive and n = 1 is sufficient for any shift the lab cares about · D. Pool the four runs into a daily average and chart the averages on an I-MR chart, which removes the within-day noise
`[F · B6 · Apply · HC · S · CERT]` — A subgroup should contain only common cause, and a mid-morning lot change inside a spread subgroup inflates R-bar and dilutes the shift; A is the tempting choice because it "represents the morning," but it answers "was the morning acceptable," not "when did the process change."

**F4.** A shared-services center has built 240 I-MR charts, one per queue metric, refreshed hourly with Test 1 only, and e-mails every signal to the analyst team. Analysts report "a dozen or more alarms a day, mostly nothing" and have stopped opening them. Your assessment and action:
A. Add Tests 2 through 8 to every chart so that real shifts are caught earlier and the analysts learn to trust the alarms · B. Widen every chart to 4σ limits, which cuts the false-alarm rate to near zero at no cost to detection · C. Replace the I-MR charts with CUSUMs, which do not produce false alarms because they accumulate evidence before signaling · D. Recognize that 240 charts × 24 samples a day at ARL0 ≈ 370 produce about 16 false alarms a day on a process where nothing has changed; cut the set to the metrics with an owner and a response plan, and choose each chart's ARL0 for the alarm load that owner can act on ✅
`[F · B6 · Evaluate · TXN · S · CERT]` — Alarm fatigue here is arithmetic, not analyst behavior: the design guarantees the alarms; B is the best distractor because wider limits do reduce false alarms, but "at no cost" is false — every widening lengthens ARL1 for the shifts the charts exist to catch.

**F5.** Exhibit — chemical reactor, jacket temperature logged by the control system:
```
I-MR chart — jacket temperature (°C), one reading every 30 s, 480 readings (4 h)
I chart:  center 82.4   UCL 83.1   LCL 81.7
  Test 1: 61 points beyond the limits, occurring in runs of 5–20 consecutive readings
MR chart: MR-bar 0.26   no tests failed
Autocorrelation of the readings: lag-1 r = 0.91   lag-10 r = 0.55   lag-40 r = 0.08
Operator log for the 4 h: no setpoint changes, no control-system alarms
```
The correct reading:
A. Sixty-one signals in 480 readings show a process that changes constantly; escalate to the control engineer to retune the loop · B. The MR chart is quiet, so the I chart signals are genuine; the sampling plan is sound and the operator log is incomplete · C. Widen the limits to ±4σ; densely sampled data always need wider limits · D. Adjacent readings are nearly identical, so MR-bar understates the natural wander of the series and the limits are far too tight; sample at an interval where the autocorrelation is small (about every 20 minutes here) or chart the residuals of a time-series model, then reread ✅
`[F · B6 · Analyze · MFG · X · CERT]` — With lag-1 r = 0.91 the moving range describes the step between near-duplicate readings, not the process spread; B is the reading a quiet MR chart invites, but a quiet MR chart is exactly what positive autocorrelation produces.

**F6.** Exhibit — intensive care unit, central-line infections:
```
c chart — central-line infections per month, 24 months, ≈ 1,100 line-days per month (near-constant)
c-bar 0.42   UCL 2.36   LCL 0 (none)
Test 1: none    Months at zero infections: 16 of 24
Countermeasure (insertion checklist and daily line review) live from month 13
Months 1–12: 8 infections    Months 13–24: 2 infections
```
The sponsor asks whether the chart shows the improvement. Your answer:
A. It cannot: with c-bar 0.42 the lower limit is zero, so no month can signal a decrease, and with 16 months already at zero there is no run to see; chart line-days between infections (g chart) or days between infections (t chart), where improvement shows as longer gaps ✅ · B. Yes: 8 infections to 2 is a 75% reduction, and the run of low months after month 13 is the chart evidence the rubric asks for · C. Not yet: recompute the limits from months 13–24 and wait for a Test 1 signal below the new LCL · D. It cannot: infections are attribute data, and only a p chart with a variable subgroup size can show a decrease in a rare event
`[F · B6 · Analyze · HC · X · CERT]` — A count chart whose center is below 9 has no lower limit and no room for a run rule when most months are already zero; C is the natural instinct, but the recomputed limits (c-bar 0.17) still have LCL = 0, and D moves the same problem to a p chart whose LCL is also zero at this rate.

**F7.** Exhibit — claims processing, average daily cycle time; the team wants to detect a 0.5σ upward drift that a system configuration change is expected to cause, as early as possible:
```
ARL for charts on individual observations, rounded from the standard tables
Shift (σ units):            0.5    1.0    2.0    3.0    ARL0
Shewhart I chart (3σ):      155    44     6.3    2.0    370
EWMA λ = 0.10, L = 2.70:     31    10     3.6    2.4    500
EWMA λ = 0.40, L = 3.05:     71    14     3.5    1.9    500
```
The design you recommend:
A. The Shewhart I chart; its ARL0 of 370 is lower than 500, so it is the more sensitive chart overall · B. EWMA with λ = 0.40, because it is at least as fast as λ = 0.10 at 2σ and 3σ and is simpler to explain · C. EWMA with λ = 0.10; it finds the 0.5σ drift the team cares about in about 31 days against 71 for λ = 0.40 and 155 for the Shewhart chart, and its slightly slower response to a 3σ jump is covered by keeping Shewhart limits on the same chart ✅ · D. Whichever chart has the largest ARL0, since the sponsor has complained about false alarms in the past
`[F · B6 · Analyze · TXN · X · CERT]` — The stated shift is small and sustained, which is what a small λ is for; A confuses ARL0 with sensitivity — a lower ARL0 means more false alarms, not faster detection of a given shift — and B reads the wrong columns for the shift the stem names.

**F8.** Exhibit — paint line, film thickness on one panel per hour:
```
Tabular CUSUM — film thickness (µm)
μ0 = 60.0   σ = 1.0 (from a stable Phase I chart)   k = 0.5 (K = 0.5 µm)   h = 5 (H = 5.0 µm)   C⁺ at hour 0 = 0
Hour:  1     2     3     4     5
x:     60.8  61.3  60.9  61.6  61.2
```
After hour 5, C⁺ is:
A. 3.3 µm, and the chart has not signaled ✅ · B. 5.8 µm, and the chart signaled at hour 5 · C. 0.7 µm, and the chart has not signaled · D. 1.16 µm, and the chart signaled because the average deviation exceeds K
`[F · B6 · Apply · MFG · X · CERT]` — Each step adds (x − 60.5) and never drops below zero: 0.3, 1.1, 1.5, 2.6, 3.3, which is below H = 5.0; B is what you get by forgetting the allowance K, and D compares the wrong quantity to the wrong threshold.

**F9.** Exhibit — hospital pharmacy, daily compounded batch of a drug solution:
```
X̄-R chart — concentration (mg/mL), 30 daily batches; subgroup = 5 syringes drawn from one batch
R chart:  R-bar 0.021   UCL 0.044   no tests failed
X̄ chart: center 5.003   UCL 5.015   LCL 4.991
  Test 1: 11 of 30 batch means beyond the limits, on both sides; no runs or trends
Batch means range 4.96–5.04; specification 5.00 ± 0.25
```
The correct reading:
A. The process is out of control eleven times in thirty days; each batch beyond a limit needs a root-cause investigation before it is released · B. Syringe-to-syringe variation within a well-mixed batch is far smaller than batch-to-batch variation, so limits built from R-bar are too tight for judging batch means; chart the batch means on an I-MR chart (between-batch limits) and keep the R chart for within-batch mixing ✅ · C. Increase the subgroup to 10 syringes per batch, which will bring the X̄ limits closer to what the batch means actually do · D. The 0.25 tolerance is more than ten times the spread of the batch means, so no chart is needed on this process
`[F · B6 · Analyze · HC · X · CERT]` — This is the batch-process form of wrong subgrouping: the within-subgroup variation is real but is not the variation that acts between batches, so a between/within (I-MR-R) structure is needed; C makes the problem worse, because a larger n narrows the X̄ limits further, and D confuses the customer's specification with the process's stability.

**F10.** Exhibit — regional lending, fifteen branches on one group chart:
```
Group chart — loan turnaround, weekly mean (working days) per branch, 15 branches, 12 weeks
Each week the highest and the lowest branch means are plotted; limits from pooled within-branch variation
UCL 6.8   center 4.9   LCL 3.0   No point beyond the limits
Run rule for this chart: the same branch highest (or lowest) four weeks in a row is a signal
Highest branch, weeks 1–12:  B07 B02 B07 B07 B11 B07 B07 B07 B07 B03 B07 B07
Lowest branch, weeks 1–12:   B14 B09 B01 B14 B06 B12 B14 B03 B10 B02 B14 B08
```
The correct reading:
A. All fifteen branches are in control; no point crosses a limit, and the chart has done the job of fifteen separate charts · B. B14 is the branch to study, since the lowest branch shows where the best practice lives · C. The chart is invalid, because the limits should have been computed per branch rather than pooled · D. B07 is the highest of fifteen branches in ten of twelve weeks, including four in a row (weeks 6–9), which the group chart's run rule flags as a stream-specific special cause even though no point is outside the limits; go and see B07 ✅
`[F · B6 · Analyze · TXN · X · CERT]` — A group chart replaces stream-by-stream charts only if you read its run rule, because the same stream topping the chart repeatedly is far less likely by chance than a single point beyond a limit; B is a real observation about B14, but B14 is lowest in five scattered weeks and never four in a row, so it is not the signal the chart flags.

**F11.** An emergency department wants an alarm when boarding hours depart from their usual pattern. The metric is logged every 15 minutes, and adjacent readings are strongly autocorrelated (lag-1 r ≈ 0.9) because boarding builds and clears over hours. The team needs within-day alarms, not a daily figure. You recommend:
A. An I-MR chart of the raw 15-minute readings, with the limits widened to ±4σ to allow for the correlation · B. An I-MR chart of hourly averages, because averaging four readings removes the autocorrelation · C. Fit an EWMA (or a simple time-series model) to the series as a one-step-ahead forecast and put the forecast errors on an I chart; the errors are close to independent, and a signal means boarding has departed from the pattern the series normally follows ✅ · D. Sample once a day at 08:00, when the autocorrelation between readings is negligible
`[F · B6 · Apply · HC · S · CERT]` — Autocorrelation is handled either by sampling far enough apart or by modeling it and charting what is left; D does the first but throws away the within-day alarms the stem requires, and B does not remove correlation — averages of adjacent correlated readings are themselves correlated.

**F12.** An IT service team has about one Severity-1 incident every three weeks and wants a control chart that will show whether a new change-review process reduces them. A team member proposes a c chart of incidents per week. You recommend instead:
A. The weekly c chart as proposed; with c-bar ≈ 0.33 the UCL will be about 2.05, so any week with three or more incidents signals · B. A t chart of days between Severity-1 incidents (or a g chart of changes deployed between them), read with improvement as an upward shift, because a weekly count chart with c-bar 0.33 has LCL = 0 and can never show fewer incidents ✅ · C. A p chart of the proportion of changes causing a Severity-1, with the subgroup size set to 200 changes so that the LCL is above zero · D. A monthly c chart, since about 1.3 incidents a month gives enough events per subgroup for the limits to be symmetrical
`[F · B6 · Apply · TXN · S · CERT]` — A rare-events chart uses the gap between events as the plotted value, so it can show a decrease without waiting for a subgroup large enough to have a lower limit; A is correct about the UCL but blind to the one direction the team cares about, and C fails the n > 9(1 − p) ÷ p test (about 1,800 changes per subgroup at this rate).

**F13.** Exhibit — bottling line, fill weight, one reading per bottle sampled every 10 minutes:
```
EWMA design — fill weight (g), individual readings
Phase I (stable I-MR chart, 60 readings): μ0 = 250.0   σ = 2.0
λ = 0.20   L = 3.0
```
The steady-state control limits of the EWMA chart, to one decimal, are:
A. 244.0 to 256.0 · B. 248.0 to 252.0 ✅ · C. 249.3 to 250.7 · D. 247.3 to 252.7
`[F · B6 · Apply · MFG · X · CERT]` — 250 ± 3 × 2.0 × √(0.2 ÷ 1.8) = 250 ± 2.0; A is the Shewhart 3σ limits, which are wider because the EWMA statistic averages the noise away, and C omits the square root.

**F14.** A CUSUM designed to detect a 1σ shift most quickly uses k = 0.5. The process owner now says the shift worth catching is 2σ and asks what to change. You:
A. Set k = 1.0 (half the shift you want to detect), then choose h from the ARL table to keep the ARL0 the owner has accepted ✅ · B. Set k = 2.0, because k is the shift size in σ units · C. Keep k = 0.5 and double h, so that the chart tolerates the larger shift · D. Set k = 0.25, since a smaller k makes the chart more sensitive to everything
`[F · B6 · Apply · NEU · K · CERT]` — The reference value sits halfway between the in-control mean and the shifted mean you are designing for, and h then sets the false-alarm rate; C leaves the chart tuned for 1σ and merely slows it down, and D tunes it for 0.5σ, which the owner has said is not the concern.

**F15.** A job-shop lathe runs six part numbers in lots of 5–15 pieces, too few for a chart per part. Historical σ of the diameter by part: 0.008, 0.009, 0.010, 0.008, 0.025 and 0.009 mm (the fifth part is a thin-wall bushing). The control plan needs one chart on the lathe. You choose:
A. A deviation-from-nominal chart across all six parts with limits from the pooled moving range, which is the standard short-run chart · B. A separate I-MR chart per part; 5–15 points per lot is enough once a few lots accumulate · C. A standardized chart plotting (x − T) ÷ σ_part with each part's own σ; a nominal chart would set one limit width that is too wide for five parts and too tight for the bushing, whose spread is three times theirs ✅ · D. A chart of the highest-volume part only, since it drives most of the lathe's output
`[F · B6 · Analyze · MFG · S · CERT]` — The nominal chart assumes parts share roughly the same spread, and one part at three times the σ breaks that assumption in both directions; A is what most software offers first, which is why the σ table in the stem is the thing to check before choosing it.

**F16.** A claims-intake process suffers a scanner-queue stall that raises queue wait by about 3σ for 15–30 minutes and then clears itself, roughly twice a shift. The sampling budget is 20 timed claims per 8-hour shift. The sampling plan and chart that catch the stall most often:
A. Four subgroups of 5 every 2 hours on an X̄-R chart; the larger subgroup gives the best sensitivity per point · B. One subgroup of 20 at the end of the shift, which gives the tightest limits · C. An EWMA with λ = 0.05 on four subgroup means, because a small λ gives the earliest detection · D. Twenty individual timings spread through the shift, about one every 24 minutes, on an I-MR chart; a 3σ episode lasting 15–30 minutes is caught by a single point far more often than by a subgroup that arrives every two hours and usually misses the episode entirely ✅
`[F · B6 · Analyze · TXN · S · CERT]` — Frequency beats subgroup size when the special cause is large and brief, because a 3σ shift is caught by one individual point about half the time and the question is whether a sample lands inside the episode at all; C is designed for the opposite case — a small, sustained shift — and a small λ actually slows the response to a brief jump.

**F17.** A customer-onboarding process has 60 parameters on its operations dashboard. Your Analyze phase verified two causes of onboarding delay — hand-off queue age (X1) and the web-form version in use (X2) — and the primary metric is days to activation (Y). For the control strategy you chart:
A. All 60 parameters, so that the control plan is complete and nothing is missed · B. Y only, because the customer experiences Y and the causes are documented in the A3 · C. X1 and X2, each sampled at a frequency matched to how fast it can change, plus Y less often as the check that the verified causes still explain it ✅ · D. The parameters with the longest data history, because their limits will be the most reliable
`[F · B6 · Apply · TXN · S · CERT]` — Controlling the verified inputs is what makes the output predictable, and the output chart confirms that the causal story still holds; B is the common Green Belt plan, and it detects a problem only after customers have already waited.

**F18.** Exhibit — rehabilitation unit, falls with injury:
```
t chart — days between falls with injury, 28 events over 20 months
(limits set by the software's transform for time-between-events data; the plotted scale is days)
center 21 days   UCL 96 days   LCL 0.9 days
Events 1–20: gaps of 3–58 days, no tests failed
Events 21–28 (the most recent eight): 34, 48, 41, 66, 39, 52, 45, 70 days — all above the center line
Test 2 (nine in a row on one side of center): not triggered
Falls-prevention bundle live between events 20 and 21
```
The correct reading for the tollgate:
A. Improvement is confirmed: eight consecutive gaps above the center line after the bundle is the pattern the chart exists to show · B. Not yet a signal: eight is one short of the nine the run rule needs; report the run as promising, say what would confirm it, and note that a t chart accumulates evidence one event at a time, so confirming a real improvement is slow by design ✅ · C. The chart is wrong: an improvement should show as points going down on any control chart, and these are going up · D. Recompute the limits from events 21–28 to reflect the new process and check whether the old center line now falls below the new LCL
`[F · B6 · Analyze · HC · X · CERT]` — The direction is right and the run is short by one, and the honest tollgate statement says exactly that; A is the claim a sponsor wants to hear, and it is the same over-reading of an eight-point run that the Green Belt bank tests, now with the added feature that each new point costs a patient fall.

**F19.** Exhibit — contact center, average daily handle time:
```
EWMA — average daily handle time (s), λ = 0.3, μ0 = 300, σ = 8.1, steady-state limits 289.8–310.2
Day:   1      2      3      4
x:     305    312    309    315
z:     301.5  304.7  306.0  ?
```
The day-4 EWMA value and its status:
A. 308.7; no signal ✅ · B. 310.3; signal, because the four-day average exceeds the UCL · C. 312.3; signal · D. 315; signal, because the raw value exceeds the UCL
`[F · B6 · Apply · TXN · X · CERT]` — z4 = 0.3 × 315 + 0.7 × 306.0 = 308.7, inside 310.2; C swaps the weights, and D compares a raw reading to limits that belong to the smoothed statistic.

**F20.** Exhibit — extrusion line, wall thickness, one reading per hour; the team runs a Shewhart I chart and asks whether a CUSUM would do better against a 1σ shift, which is the shift that produces scrap:
```
ARL (samples), rounded from the standard tables
Shift (σ units):      0 (ARL0)   0.5    1.0    2.0    3.0
CUSUM k = 0.5, h = 4:    168      27    8.4    3.3    2.2
CUSUM k = 0.5, h = 5:    465      38   10.4    4.0    2.6
Shewhart I chart (3σ):   370     155     44    6.3    2.0
```
The change that improves both the false-alarm rate and the detection of a 1σ shift:
A. The h = 4 CUSUM, which is the fastest design in every column that matters · B. Keep the Shewhart chart, since it is best at 3σ and 3σ is what "out of control" means · C. Keep the Shewhart chart but move its limits to 2.5σ, which is what a CUSUM does in effect · D. The h = 5 CUSUM: ARL0 rises from 370 to 465 hours and ARL1 at 1σ falls from 44 to about 10 hours, at the cost of being about half an hour slower on a 3σ jump ✅
`[F · B6 · Evaluate · MFG · X · CERT]` — Read both columns the stem names: h = 5 wins on both, and h = 4 buys 2 hours at 1σ by more than doubling the false alarms (ARL0 168 is one a week); B is right about 3σ but the stem says 1σ is what costs money.

**F21.** Exhibit — document-processing team, five document types run in small batches with different turnaround targets:
```
Deviation-from-target chart (x − T) — batch turnaround (working hours), one chart across 5 types, 40 batches
Limits from the pooled moving range: center 0.0   UCL +3.6   LCL −3.6
Historical σ by type: A 0.9   B 1.0   C 1.1   D 1.0   E 3.4   (type E is 30% of batches)
Test 1: 6 of 40 points beyond the limits; 5 of the 6 are type E
```
The correct reading:
A. The nominal chart's single limit width assumes every type has about the same spread; type E's spread is three times the others, so its points cross the limits as a matter of course — chart (x − T) ÷ σ_type on a standardized chart, or chart type E on its own ✅ · B. Type E has a special cause on five of its batches; investigate each one before changing the chart · C. Widen the limits to ±3σ of type E so that no type produces false signals · D. Remove type E's batches from the chart, because 30% of the data should not be allowed to drive the limits
`[F · B6 · Analyze · TXN · X · CERT]` — A limit set from a pooled σ is a blend that fits none of the types well, and the signals cluster where the spread is largest, which is the chart telling you its assumption failed; B investigates the artefact, and C makes the chart blind to the four types it currently reads correctly.

**F22.** A site runs 50 Shewhart charts, each with ARL0 = 370, all sampled at the same times. With every process stable, the expected number of sampling periods until the first false alarm somewhere on the site is about:
A. 7 ✅ · B. 370 · C. 18,500 · D. 52
`[F · B6 · Apply · NEU · K · CERT]` — Fifty charts each with a 1-in-370 chance per period give a combined chance of about 50 ÷ 370 per period, so 370 ÷ 50 ≈ 7.4 periods; B is the per-chart figure the software reports, and it is the number a control plan quotes when it has not thought about scale.

**F23.** An I-MR chart on positively autocorrelated readings produces false signals because:
A. Autocorrelated data are never normally distributed, and the I chart assumes normality · B. The autocorrelation biases the center line, so the limits are placed around the wrong mean · C. Consecutive readings resemble each other, so the moving ranges are small, σ̂ = MR-bar ÷ d2 is too small, and the limits sit closer to the center than the series' real spread; the signals are an artefact of the limits, not of the process ✅ · D. The run rules count consecutive points, and autocorrelation makes runs longer; Test 1 is unaffected
`[F · B6 · Understand · NEU · K · CERT]` — The moving range estimates the step between neighbors, and when neighbors move together that step understates the spread; D is half right, since runs do lengthen, but the Test 1 false alarms in the autocorrelation exhibits come from the limits, not from the run rules.

**F24.** Which statement about the EWMA weight λ is correct?
A. λ = 1 reduces the EWMA to a Shewhart chart of individuals; a smaller λ gives the statistic longer memory and more sensitivity to small sustained shifts, at the cost of slower response to large abrupt ones ✅ · B. A smaller λ gives faster detection of every shift size, so λ = 0.05 is the safe default · C. λ is set equal to the shift size in σ units that the chart is designed to detect · D. L is always 3, whatever λ is, so the EWMA limits are the Shewhart limits scaled by √λ
`[F · B6 · Understand · NEU · K · CERT]` — λ trades memory for reactivity, and the ARL tables show the crossover at about 2.5σ; B is the misreading that makes teams put λ = 0.05 on a process whose failure mode is a sudden jump.

**F25.** A laboratory manager wants to start a CUSUM on specimen turnaround from the first day of the control phase, with the target set to the 45-minute service-level commitment and σ taken from the analyzer vendor's specification. Your advice:
A. Start the CUSUM now with μ0 = 45 min; a signal on day one shows how far from the commitment the lab runs, which is useful information · B. Start the CUSUM with μ0 = 45 min and h = 10 to allow for the process running above the commitment · C. Use an EWMA instead, since an EWMA does not need a target · D. Establish stability first on an I-MR chart (Phase I), estimate μ0 and σ from that period, then switch to the CUSUM for monitoring; a CUSUM with a specification as its target and an assumed σ accumulates the gap between the process and the customer's wish, not evidence of change ✅
`[F · B6 · Evaluate · HC · S · CERT]` — A CUSUM assumes a known in-control mean and σ and is a Phase II tool; A is the tempting reading, but a chart that signals on day one against a specification is a capability statement dressed as a control chart, and it will keep signaling for as long as the lab is off target.

**F26.** Exhibit — job-shop mill, two parts on one short-run chart:
```
Part P: target T = 25.00 mm   σ_P = 0.020 mm (history, 80 pieces)   today's reading 25.03
Part Q: target T = 40.00 mm   σ_Q = 0.050 mm (history, 60 pieces)   today's reading 40.09
Standardized chart limits ±3. A deviation-from-nominal chart for the same mill has limits ±0.06 mm, computed from part P's history.
```
The correct statement:
A. On the standardized chart both readings are inside the limits (P = 1.5, Q = 1.8); on the nominal chart, Q's +0.09 mm would cross the +0.06 limit and signal, falsely, because those limits carry part P's spread ✅ · B. Q signals on both charts, because 0.09 mm exceeds 0.06 mm whichever chart it is plotted on · C. P = 1.5 and Q = 1.8, so Q is the more worrying of the two and is investigated first · D. Q's standardized value is 4.5, because both parts run on the same mill and therefore share σ = 0.020 mm
`[F · B6 · Apply · MFG · X · CERT]` — Standardizing by each part's own σ is the whole point of the chart; D is the assumption that a nominal chart makes implicitly, and C reads two in-control values as a ranking, which no chart supports.

**F27.** Exhibit — hospital pharmacy, syringe fill weight, subgroups taken six times a day:
```
X̄-R chart — fill weight (g), subgroups of 4 at 07:00, 11:00, 15:00, 19:00, 23:00 and 03:00; 20 days
Shift handover at 07:00 and 19:00: those subgroups contain 2 syringes prepared before and 2 after the handover
R chart:  R-bar 0.31 (handover subgroups average R = 0.58; all other subgroups average R = 0.20); no tests failed
X̄ chart: center 50.02   limits 49.79–50.25   no tests failed
Stratified afterwards by shift: day-shift mean 49.83   night-shift mean 50.21   (the two shifts use different balances)
```
The correct reading:
A. The process is stable across both shifts; the 0.38 g difference is inside the limits and therefore common cause · B. The handover subgroups have a special cause of variation; investigate the handover procedure · C. The handover subgroups contain the between-shift difference, which inflates R-bar and widens the X̄ limits; resubgroup so every subgroup lies within one shift, at which point the day/night offset appears as the between-subgroup signal it is, and check the two balances ✅ · D. Drop the two handover subgroups and read the remaining four per day, which removes the inflation without changing the sampling plan
`[F · B6 · Analyze · HC · X · CERT]` — A subgroup that straddles a known boundary carries the boundary's effect inside it; D would fix the limits but keeps the handover blind spot, and B mistakes the symptom (a large R at handover) for a handover problem when the cause is a between-shift offset.

**F28.** A process has σ = 1.2 days (known from a stable baseline) and an X̄ chart with 3σ limits. The control plan requires that a shift of one standard deviation is caught on the first subgroup after it occurs at least half the time. The smallest subgroup size that meets the requirement is:
A. 4 · B. 9 ✅ · C. 16 · D. 25
`[F · B6 · Apply · NEU · S · CERT]` — Φ(−3 + 1 × √n) reaches 0.50 when √n = 3, so n = 9; A gives Φ(−1) ≈ 0.16, and C (about 0.84) meets the requirement but is not the smallest, which the stem closes off.

**F29.** Exhibit — surgical service, infection rate and volumes:
| Item | Value |
|---|---|
| Surgical-site infection rate, baseline | 2.0% of procedures |
| Procedures per month | 120–180 |
| Control plan requirement | Must be able to show a decrease within the 60-day live-monitoring window |

The chart you specify:
A. A monthly p chart; 120–180 procedures is comfortably above the usual minimum subgroup size · B. A monthly np chart, which has a lower limit above zero when the p chart does not · C. A quarterly p chart, because subgroups of about 450 give a lower limit above zero, accepting that a change takes a year or more to confirm · D. A g chart of procedures between infections, which uses every event as a point, needs no subgroup, and shows improvement as longer gaps ✅
`[F · B6 · Apply · HC · X · CERT]` — At p = 0.02 the p chart needs n > 9 × 0.98 ÷ 0.02 ≈ 441 per subgroup to have any lower limit, which the monthly volume never reaches; C is statistically correct and fails the stem's requirement, and B has the same LCL as the p chart because it is the same chart in counts.

**F30.** A bottle filler's known failure mode is a valve fault that drops fill weight abruptly by about 3σ and stays there until the valve is reseated; no small drifts have been seen in eight months of data. A team member proposes an EWMA with λ = 0.1 "because it is the more sensitive chart." You:
A. Agree; a smaller λ is more sensitive, and sensitivity is what a valve fault needs · B. Agree, but set λ = 0.05 so that the chart is more sensitive still · C. Propose a CUSUM with k = 0.5 and h = 5 instead, which detects every shift size faster than an EWMA · D. Keep a Shewhart I-MR chart with Test 1: a 3σ jump is caught in about two samples by the Shewhart chart and no faster by the EWMA, and after the jump the EWMA carries inertia that slows its return; the EWMA's advantage is for small sustained shifts, which this process does not show ✅
`[F · B6 · Evaluate · MFG · S · CERT]` — "More sensitive" is only true for the shift sizes a small λ is built for; A and B move the chart further from the failure mode the stem describes, and C is wrong on the facts, since neither CUSUM nor EWMA beats Shewhart at 3σ.

**F31.** Exhibit — claims team, upper tabular CUSUM on daily average cycle time:
```
Tabular CUSUM (upper) — cycle time (working days), μ0 = 4.0, σ = 0.5, K = 0.25, H = 2.5 (k = 0.5, h = 5)
Days 1–12: C⁺ = 0 throughout
Day:   13    14    15    16    17    18    19    20
x:     4.4   4.6   4.5   4.7   4.4   4.8   4.6   4.9
C⁺:    0.15  0.50  0.75  1.20  1.35  1.90  2.25  2.90
A Shewhart I chart on the same data has limits 2.5–5.5 working days.
```
The correct reading:
A. The signal on day 20 says day 20 is the special cause; investigate what happened that day · B. Signal on day 20; the shift most likely began about day 13, when C⁺ last left zero (N⁺ = 8), and the new mean is about 4.6 days (μ0 + K + C⁺ ÷ N⁺), a shift of just over 1σ that the Shewhart chart has not flagged with a single point ✅ · C. No signal yet, because no daily value has exceeded μ0 + 3σ = 5.5 days · D. Reset C⁺ to zero and continue; a single crossing of H is common cause unless it happens twice in succession
`[F · B6 · Analyze · TXN · X · CERT]` — The CUSUM gives both the signal and a dated estimate of when the process moved and by how much; A sends the team to the wrong day, and C reads the CUSUM with the Shewhart rule, which is precisely the rule that misses this shift.

**F32.** Before a part can be plotted on a standardized short-run chart, the chart needs:
A. Only a target for the part, since standardizing removes the need for a σ estimate · B. A σ estimate that is the same for every part on the chart, which is what makes the limits ±3 · C. A target and a σ estimate for that part, from its own history or from a similar part family, with every part on the chart made by the same process ✅ · D. At least 25 subgroups of that part, so that its own limits can be computed first
`[F · B6 · Understand · NEU · K · CERT]` — The standardized chart borrows σ from history so that a lot of five pieces can be charted, and it assumes one process behind all the points; B describes the nominal chart's assumption, and D describes what the short-run chart exists to avoid.

**F33.** Three hospitals in a network measure door-to-needle time for stroke patients; weekly means run about 48, 55 and 71 minutes at the three sites. The network team plots the three weekly means as consecutive points on one I-MR chart (site 1, site 2, site 3, site 1, …) "so the sponsor sees one chart." Your advice:
A. Keep it; more points give better limits, and the sponsor asked for one chart · B. Sort the points by site so the sequence is 20 weeks of site 1, then site 2, then site 3, still on one chart · C. Widen the limits to cover the site differences, since the sponsor wants a single view · D. One chart per site with its own limits, and a separate network-level figure for the sponsor; interleaving three processes makes MR-bar measure site-to-site difference, so the limits describe none of the sites and hide a shift at any one of them ✅
`[F · B6 · Analyze · HC · S · CERT]` — Three processes with different means on one chart is the multi-stream error in sequence form; B removes the interleaving but leaves three different means on one center line, so the sorted chart signals at every site boundary and nowhere useful.

**F34.** Exhibit — draft control strategy for a powder-coating line, submitted for rubric item C3:
| Metric | Chart | Subgroup and frequency | Reason given |
|---|---|---|---|
| Film thickness (Y) | X̄-R | 5 consecutive panels every 2 h | "standard" |
| Booth humidity (X1, verified cause) | none — logged only | data historian, continuous | "the historian keeps it" |
| Gun voltage (X2, verified cause) | I-MR | 1 reading per shift | "changes rarely" |
| Cure-oven temperature (X3, not a verified cause) | EWMA λ = 0.1 | every 5 min from the PLC | "an advanced chart shows rigor" |

Your review comment:
A. The strategy is sound; it puts the most advanced chart on the highest-frequency data and keeps the output on a standard chart · B. Move the EWMA to film thickness, since the output deserves the most sensitive chart · C. Chart the verified cause X1 (sampled at an interval where the historian data are not autocorrelated, or as residuals), and replace the X3 EWMA with a log or an audit; an advanced chart on a non-cause fed by 5-minute autocorrelated readings adds alarms without adding control, and every frequency here needs a reason tied to how fast the variable can change ✅ · D. Raise gun voltage to a reading every hour and leave the rest as submitted
`[F · B6 · Evaluate · MFG · X · CERT]` — C3 scores the justification of chart, subgroup and frequency, and this draft charts the wrong X for the wrong reason; D fixes a real but minor gap, and B rewards sophistication where the rubric rewards fit.

**F35.** A billing team monitors the daily average of a strongly right-skewed cycle time (most invoices clear in 1–2 days, a tail runs to 30). The concern is a sustained upward drift after a system migration. An I chart of the daily averages gives several upper signals a month on the stable baseline. You recommend:
A. Keep the I-MR chart and raise its upper limit to 4σ to allow for the skew · B. An EWMA with λ ≈ 0.1–0.2 on the daily averages; the EWMA statistic is a weighted average, which makes it far less sensitive to the skew than a single-point chart, and its strength is exactly the sustained drift the team is watching for ✅ · C. An EWMA with λ = 0.9, so that the chart reacts to each day's value · D. A c chart of the number of invoices over 5 days each day, which removes the skew by counting
`[F · B6 · Apply · TXN · S · CERT]` — Smoothing does two jobs here, robustness to shape and sensitivity to drift; C is an I chart in disguise and keeps the false alarms, and D changes the metric to one the sponsor did not ask about.

**F36.** A Shewhart chart is the better choice than an EWMA or CUSUM when:
A. The shifts that matter are large and abrupt, or the process is still in Phase I where patterns, stratification and stability are being diagnosed ✅ · B. The shifts that matter are small and sustained, because a Shewhart chart with run rules is equivalent to a CUSUM for those · C. The data are autocorrelated, because Shewhart limits are unaffected by autocorrelation · D. The process owner needs the chart with the fewest false alarms per year
`[F · B6 · Understand · NEU · K · CERT]` — Shewhart's advantages are speed on large shifts and the readable point-by-point picture that Phase I diagnosis needs; B overstates the run rules, which add some sensitivity but nowhere near a CUSUM's at 0.5–1σ, and D is not a property of any chart family — ARL0 is a design choice on all of them.

**F37.** A hospital pharmacy compounds about 40 products in batches of 3–20 units; 70% of batches are made by a compounding robot and 30% by hand. The team wants short-run SPC on concentration deviation and proposes one standardized chart for all 40 products. You advise:
A. One standardized chart for all products, since standardizing by each product's σ removes the difference between the two methods · B. One nominal chart per product, which needs about 25 batches of each product before limits exist · C. Two standardized charts, one for the robot and one for manual compounding, each pooling that method's products; a short-run chart assumes one process behind all its points, and the two methods are two processes with different spreads and different causes ✅ · D. A single chart of the robot's batches only, since it makes most of the volume
`[F · B6 · Evaluate · HC · S · CERT]` — Standardization removes differences in level and spread between products, not the fact that two methods fail in different ways; A is the tempting reading of "standardized," and it would hide a robot-specific drift among manual noise or the reverse.

**F38.** A reactor's temperature is held by an automatic PID controller. The team wants an I-MR chart on the temperature "to catch process changes." Your advice:
A. Chart the temperature on the I-MR chart as proposed; a controlled variable is the cleanest data on the line · B. Switch the controller to manual during sampling so that the chart sees the real process · C. Put an EWMA on the temperature, which will detect the small deviations the controller leaves behind · D. Chart the controller's output (steam-valve position, or the adjustment it makes each interval) rather than the temperature; a loop that is holding the temperature moves every disturbance into the manipulated variable, which is where a process change shows ✅
`[F · B6 · Analyze · MFG · S · CERT]` — A well-tuned loop makes the controlled variable look stable by design, so charting it tells you the controller works; C is the sophisticated version of the same mistake, and B trades control of the product for a chart.

**F39.** Exhibit — control-plan extract, customer-onboarding process:
| Metric | Chart | Frequency (subgroup) | How fast the known causes act |
|---|---|---|---|
| Application completeness (defective = any missing field), currently 8% | p chart | monthly (n ≈ 3,000) | Web-form release every 2 weeks |
| Identity-check turnaround (h) | I-MR | daily mean | Vendor outage: hours; staffing: weekly |
| Account-activation errors | c chart | daily | Nightly batch-job configuration |

The mismatch to correct:
A. None; the monthly completeness subgroup of 3,000 is the largest and therefore the most reliable of the three · B. Move application completeness to weekly (n ≈ 700, still well above the 9(1 − p) ÷ p ≈ 104 needed for a lower limit at 8%) or to one subgroup per release; a monthly point can average a bad release across two weeks of good data and delay the alarm by up to a month ✅ · C. Move identity-check turnaround to an hourly subgroup, since vendor outages last hours · D. Move account-activation errors to monthly so that c-bar exceeds 9 and the chart gains a lower limit
`[F · B6 · Evaluate · TXN · X · CERT]` — Frequency follows the cause's clock, and a fortnightly release inside a monthly subgroup is the one row where the clock is slower than the cause; A confuses subgroup size with timeliness, and D trades a daily alarm on a nightly job for a lower limit nobody asked for.

**F40.** For a rare event, you choose between a g chart and a t chart as follows:
A. A t chart whenever the event is rare, because time is always recorded · B. A g chart whenever the event is rare, because counts are easier to chart than dates · C. A g chart when you can count the units of opportunity between events and the rate of opportunities varies (admissions, procedures, deployments), and a t chart when opportunity is effectively continuous in time, so elapsed time is the fair denominator ✅ · D. A u chart, since rare events always have a variable area of opportunity
`[F · B6 · Understand · NEU · K · CERT]` — The denominator has to be the thing that gives the event its chance; A is wrong whenever volume swings, because 30 quiet days and 30 busy days are not the same opportunity, and D returns to a count chart whose lower limit is zero at rare-event rates.

**F41.** Exhibit — CNC lathe, three part numbers on one short-run chart:
```
Deviation-from-nominal chart (x − T), diameter (mm), 40 lots across parts A, B and C
Center line fixed at 0.000 (nominal as target); limits ±0.018 from the pooled moving range
Mean deviation by part: A +0.012   B +0.011   C +0.013
Test 1: none    Test 2: all 40 points above the center line
```
The correct reading:
A. The chart is misconfigured; a short-run chart must use the historical mean deviation as its target so that the run disappears · B. A consistent +0.012 mm offset on all three parts is one cause (tool or work-offset setting), not three; correct the offset at the machine and then chart deviation from nominal — until it is corrected, the run says the process is stable but off target, which is a centering statement about capability, not a stability signal ✅ · C. Three special causes, one per part number, each needing its own investigation · D. Widen the limits to ±0.030 so that the process is shown as capable of the ±0.05 tolerance
`[F · B6 · Analyze · MFG · X · CERT]` — Three parts sharing the same offset point at the machine, not the parts; A hides a fixable offset by redefining the target, which keeps the process off nominal while making the chart look content, and D confuses control limits with specification limits.

**F42.** A candidate's control plan for laboratory turnaround proposes a CUSUM (k = 0.5, h = 5). The lab supervisor who will own the chart says she reads the I-MR chart she already uses and will not read a CUSUM; the shifts that have ever mattered were 2σ or larger. For rubric item C3 the candidate should:
A. Keep the CUSUM, because C3 names EWMA and CUSUM and the reviewer will expect one · B. Run both charts side by side so that the supervisor reads one and the reviewer sees the other · C. Hand the CUSUM to the quality department to read on the supervisor's behalf · D. Specify the I-MR chart with Tests 1–3 and write the reason: the shifts that matter are ≥ 2σ, where Shewhart is as fast as any chart; the owner can read and act on it; and C3 scores the justification of the choice, not its sophistication ✅
`[F · B6 · Evaluate · HC · S · CERT]` — A chart nobody reads is not control, and the rubric asks for the reasoning that names when an advanced chart is and is not warranted; B doubles the alarm load and splits ownership, which is the failure C1 exists to catch.

<!-- Section F tally — keys: A 10 · B 10 · C 11 · D 11 | types: X 19 · S 15 · K 8 | Bloom: Apply 13 · Analyze 15 · Evaluate 8 = 36 of 42 (Understand 6, Remember 0) | verticals: MFG 11 · HC 11 · TXN 11 · NEU 9 | negative stems: 0 | coverage: chart selection at scale F4 F10 F17 F22 F33; autocorrelation F5 F11 F23; rare events (g/t) F6 F12 F18 F29 F40; rational subgrouping (wrong-subgrouping exhibits F1 F9 F27) F2 F3 F16; EWMA F7 F13 F19 F24 F30 F35; CUSUM F8 F14 F20 F25 F31; short-run F15 F21 F26 F32 F37 F41; control strategy F28 F34 F39 F42; "when not to use": X̄-R on mixed streams F1 F33, I-MR on autocorrelated data F5 F23, c or p chart on rare events F6 F12 F29, nominal chart with unequal σ F15 F21, EWMA for abrupt shifts F30, CUSUM in Phase I F25, short-run across two processes F37, SPC on a controlled variable F38, advanced chart on a non-cause F34, advanced chart the owner will not read F42, Shewhart preferred F36 -->

---

v1.0 · 2026-09-20
