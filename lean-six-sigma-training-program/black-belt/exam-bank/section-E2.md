# Black Belt Exam Bank — Section E2: Fractional, blocked and sequential experiments

Part of the Black Belt certification item bank. Blueprint, minimally competent candidate
statement, tag format and form-assembly rules: [`../exam-bank.md`](../exam-bank.md). Policy:
[`../../assessment/standard-setting-and-item-policy.md`](../../assessment/standard-setting-and-item-policy.md).
Teaching source: [`../modules/m5-design-of-experiments.md`](../modules/m5-design-of-experiments.md)
(sections 5.5–5.12). Project-side requirements these items assess against: rubric items ★ I1
and A3 in [`../project/review-rubric.md`](../project/review-rubric.md).

Section E2 draws **15 items per form** from the **52 CERT items** below. Objective **B5** —
design, run and analyze experiments including fractional and blocked designs, designs with
center points, and a sequential strategy. Full factorial design and analysis, effects,
interactions, residuals and operating windows are Section E1. Response-surface items stay at
the level the minimally competent candidate statement sets: recognize the optimize stage,
describe a central composite design, read a software optimum — not design or analyze one
unaided.

**Reading the exhibits.** Fenced blocks are software-style outputs in the layout Module 5 uses.
Factors are coded −1 (low) and +1 (high); design tables are in standard order and the runs
were executed in a randomized order (within blocks where the design is blocked) recorded in
the logbook unless the stem says otherwise. A **generator** is written as the added column it
defines (D = ABC); the **defining relation** lists every word aliased with the mean; an alias
table's "Estimates" column names the sum of effects a column estimates, and the number beside
it is the **effect** (high mean minus low mean) of that column. Curvature outputs report the
factorial mean ȳF, the center-point mean ȳC and a one-degree-of-freedom F test against pure
error. Minitab prints alias tables, block rows and curvature rows by default; in Excel the
generator columns are built by multiplying the base columns and the defining relation is
written by hand; R (`FrF2`, `aliases`, `fold.design`, `rsm`) and Python (`pyDOE3.fracfact`,
`ccdesign`, `statsmodels`) are named where an item turns on them. Every quantity states its
units and basis in the stem. All outputs are illustrative and internally consistent; none is
from a real employer, and the practicum apparatus (catapult, paper helicopter, transactional
process simulator) is the one described in Module 5.12.

Correct option ✅; tag in brackets; rationale after the dash.

---

## Section E2 — DOE: fractional factorials, confounding and resolution, blocking, center points and curvature, sequential strategy, RSM introduction (52 CERT)

**E2-1.** A wave-solder line has five candidate factors for bridging defects: A preheat temperature, B conveyor speed, C flux density, D solder temperature, E wave height. The process engineer expects, from physics, that preheat × conveyor speed and flux × wave height interact, and wants both estimated cleanly. The line can be borrowed for 16 runs in one shift. Which design do you choose?
A. A 2^(5−2) resolution III screen in 8 runs, with a fold-over if anything looks ambiguous · B. A 2^(5−1) half fraction with E = ABC, so that the two-factor interactions are aliased only with three-factor ones · C. A 2^(5−1) half fraction with E = ABCD — resolution V, 16 runs, every main effect and every two-factor interaction clear of each other, and the three-factor interactions sacrificed ✅ · D. A full 2^5 of 32 runs split across two shifts, because interactions cannot be trusted from a fraction
`[E2 · B5 · Apply · MFG · S · CERT]` — Two named two-factor interactions to read and 16 runs is exactly the resolution V case; B's generator gives I = ABCE, resolution IV, in which AB is aliased with CE — the very pair the engineer wants separated.

**E2-2.** A candidate builds a 2^(4−1) with the generator D = ABC. Which statement about its aliases is correct?
A. AB is aliased with CD (and AC with BD, BC with AD), and each main effect is aliased only with a three-factor interaction ✅ · B. A is aliased with BC, because the generator multiplies A into BC · C. AB is aliased with D, because D was built from an interaction · D. Nothing is aliased: eight runs estimate eight parameters
`[E2 · B5 · Understand · NEU · K · CERT]` — The defining relation is I = ABCD, and multiplying AB into it gives CD; C describes the aliasing of a resolution III generator (D = AB), not this one.

**E2-3.** A helicopter cohort screens five factors in 8 runs: A wing length (7 / 10 cm), B body length (5 / 8 cm), C wing width (3 / 4 cm), D paper weight (80 / 120 gsm), E paper clips (1 / 2). Generators D = AB and E = AC. Response: flight time in seconds from a 2.5 m drop, mean of two stopwatches (agreement checked). Single replicate, runs randomized.

```
2^(5-2) III, generators D = AB, E = AC — defining relation I = ABD = ACE = BCDE
Std   A   B   C   D   E   Flight time (s)      Column   Estimates        Effect
 1   −1  −1  −1  +1  +1      1.98              A        A + BD + CE       0.54
 2   +1  −1  −1  −1  −1      3.23              B        B + AD           -0.09
 3   −1  +1  −1  −1  +1      2.08              C        C + AE           -0.48
 4   +1  +1  −1  +1  −1      2.91              AB       D + AB           -0.16
 5   −1  −1  +1  +1  −1      2.03              AC       E + AC           -0.50
 6   +1  −1  +1  −1  +1      2.19              BC       BC + DE           0.02
 7   −1  +1  +1  −1  −1      2.07              ABC      CD + BE           0.05
 8   +1  +1  +1  +1  +1      2.00              Mean 2.31 s
```

What does the −0.48 s on the C column establish?
A. Wider wings cost about 0.48 s of flight time; the effect is one of the three largest and can be reported · B. Wing width is aliased with paper weight, so the two must be set together · C. The column is inert once the paper-weight effect is subtracted from it · D. Either wider wings cost about 0.5 s, or the wing-length × clip interaction is worth about −0.5 s, or the number is a mixture of the two — the 8 runs cannot separate them, and a fold-over is the next step if the distinction matters ✅
`[E2 · B5 · Analyze · HC · X · CERT]` — In this resolution III design C is aliased with AE, and a wing × clip interaction is physically plausible (Section E1 found one); A reports an aliased sum as a main effect, which is the defect the alias table exists to prevent.

**E2-4.** In a resolution IV fractional factorial:
A. Main effects are aliased with two-factor interactions, so the design is used for screening only · B. Main effects are clear of two-factor interactions, but two-factor interactions are aliased with each other — so a large interaction column names a pair (or string) of candidates, not one ✅ · C. Main effects and two-factor interactions are all clear of each other, and only three-factor interactions are lost · D. Every effect is estimated with half the precision of a full factorial
`[E2 · B5 · Understand · NEU · K · CERT]` — Resolution IV is defined by a shortest word of four letters, which puts main effects with three-factor and two-factor interactions with each other; A is resolution III and C is resolution V.

**E2-5.** A sterile processing department tests its instrument washer with standardized soil-test coupons (no patient instruments): A wash temperature (45 / 65 °C), B detergent dose (2 / 4 mL per L), C load (half / full rack), D wash time (10 / 20 min). Response: residual protein in µg per coupon on a validated swab assay. 2^(4−1), D = ABC, 8 runs randomized.

```
2^(4-1) IV, D = ABC — defining relation I = ABCD
Std   A   B   C   D   Protein (µg)      Column   Estimates     Effect
 1   −1  −1  −1  −1     68.9            A        A + BCD       -9.8
 2   +1  −1  −1  +1     52.8            B        B + ACD       -3.8
 3   −1  +1  −1  +1     55.1            C        C + ABD        5.3
 4   +1  +1  −1  −1     52.1            ABC      D + ABC       -6.3
 5   −1  −1  +1  +1     64.7            AB       AB + CD        0.3
 6   +1  −1  +1  −1     60.7            AC       AC + BD       -0.2
 7   −1  +1  +1  −1     70.3            BC       BC + AD        3.4
 8   +1  +1  +1  +1     54.3            Mean 59.9 µg
```

The department will choose between a 10-minute and a 20-minute cycle for its busiest washer. What do you say about the 3.4 on the BC column?
A. It is either a dose × load interaction or a temperature × time interaction; both are physically plausible, the design cannot tell them apart, and because the cycle-time decision depends on whether temperature and time interact, run the other half fraction (D = −ABC, 8 runs) or a fold-over on A before recommending ✅ · B. It is the dose × load interaction, because the software lists BC first in the alias string · C. It is the temperature × time interaction, because A and D have the largest main effects and interactions tend to belong to large main effects · D. It is noise: 3.4 µg is smaller than every main effect and can be pooled into error
`[E2 · B5 · Analyze · HC · X · CERT]` — A resolution IV alias pair is broken by more runs, not by reading order or heuristics; C is the effect-heredity guess, which is a reasonable prior but is not evidence, and the stem says the decision hangs on it.

**E2-6.** Before a 2^(4−1) on an ultrasonic welder (A amplitude 60 / 80 µm, B weld time 0.3 / 0.5 s, C trigger force 200 / 300 N, D hold time 0.5 / 1.0 s; response pull strength in N), the run sheet is printed from a spreadsheet in which column D was typed by hand from the generator D = ABC.

```
Std    A    B    C    D
 1    −1   −1   −1   −1
 2    +1   −1   −1   +1
 3    −1   +1   −1   +1
 4    +1   +1   −1   −1
 5    −1   −1   +1   +1
 6    +1   −1   +1   +1
 7    −1   +1   +1   −1
 8    +1   +1   +1   +1
```

The Black Belt's check before the first run:
A. The sheet is correct: D alternates in blocks of one, two and four like any factor column · B. Run 5 is wrong — the product of three low signs is negative · C. Run 6 is wrong — A(+1) × B(−1) × C(+1) = −1, so D should be −1; as printed the D column has five highs and three lows, so it is no longer orthogonal to A, B and C and the design would not be the fraction the analysis assumes — correct the sheet, then run ✅ · D. Two runs are wrong, so the design should be rebuilt in software rather than repaired
`[E2 · B5 · Analyze · MFG · X · CERT]` — Every row of a generated column must equal the product it was generated from, and one wrong sign breaks the balance for every effect; B checks the wrong row (run 5 is (−)(−)(+) = +, as printed).

**E2-7.** A hospital laboratory plans a 2^3 on its pneumatic tube route with QC blood samples: A carrier padding, B send speed, C carrier fill. Only four runs can be done per day because the route is needed for real samples, and the laboratory knows that day-to-day sample lots differ. Which run assignment is correct?
A. Standard-order runs 1–4 on day 1 and 5–8 on day 2, randomized within each day · B. Runs where A × B × C = −1 (standard order 1, 4, 6, 7) on one day and those where A × B × C = +1 (2, 3, 5, 8) on the other, randomized within each day, with the three-factor interaction given up to the day difference and the block declared in the analysis ✅ · C. Draw one random order of all eight runs and split it four and four across the days · D. Run all eight on one day by borrowing the route for the afternoon, because blocking loses information
`[E2 · B5 · Apply · HC · S · CERT]` — Blocking a 2^3 in two confounds the highest-order interaction with the block; A lines day up with factor C, and C leaves day to chance, so a lot difference inflates the error term or lands on whichever factor the draw happened to unbalance.

**E2-8.** Heat treatment of shaft coupons: A austenitizing temperature (840 / 870 °C), B quench delay (5 / 15 s), C tempering time (60 / 120 min). Response: hardness in HRC (mean of three indents per coupon on a calibrated tester). Two replicates; a furnace load holds four coupons, so each replicate was split into two loads by A × B × C — four loads in all, declared as blocks; coupons randomized within each load.

```
Analysis of Variance for Hardness (HRC) — 2^3, 2 replicates, 4 blocks
Source         DF       SS       MS        F       P
Blocks          3   22.512    7.504    40.24   0.000
A temp          1    8.266    8.266    44.33   0.001
B delay         1   25.756   25.756   138.13   0.000
C temper        1    3.706    3.706    19.87   0.004
A*B             1    2.641    2.641    14.16   0.009
A*C             1    0.076    0.076     0.41   0.548
B*C             1    0.276    0.276     1.48   0.270
Error           6    1.119    0.187
Total          15   64.349
S = 0.432     Effects (HRC): A +1.44   B −2.54   C −0.96   A*B +0.81
Block means (HRC):  load 1 56.0   load 2 59.0   load 3 56.7   load 4 58.3
```

A reviewer asks what the Blocks row with F = 40 means for the recommendation. The correct answer:
A. Furnace load is the strongest factor in the experiment and should be added to the control plan as a setting · B. The block effect must be reported as a three-factor interaction, because that is what it was confounded with · C. The blocks were unnecessary, because the factor effects are all clearly detected anyway · D. The four loads differed by up to about 3 HRC among themselves; the design took that difference out of the error term instead of leaving it in S, which is why S is 0.43 — but a block is a nuisance you removed, not a lever you set, and it does not go in the recommendation, except as a note that load-to-load variation is large enough to investigate separately ✅
`[E2 · B5 · Analyze · MFG · X · CERT]` — A block row says how much nuisance the design absorbed; A turns a nuisance into a factor, and B mislabels it with the interaction's name, which is the error the blocked analysis exists to avoid.

**E2-9.** The heat-treatment data of E2-8 were re-analyzed by a colleague who did not know the design was blocked, as an ordinary replicated 2^3.

```
Factorial fit: Hardness (HRC) versus A, B, C — 2^3, 2 replicates, N = 16, no blocks
Term          Effect        F       P
A temp         1.438    20.96   0.002
B delay       -2.538    65.31   0.000
C temper      -0.962     9.40   0.015
A*B            0.812     6.70   0.032
A*C            0.138     0.19   0.673
B*C            0.263     0.70   0.427
A*B*C          2.262    51.92   0.000
S = 0.628   residual df = 8
```

The colleague reports "a strong temperature × delay × temper interaction (p < 0.001)". The correct response:
A. There is no such interaction: the runs with A × B × C = +1 were loads 2 and 4 and those with −1 were loads 1 and 3, so the "interaction" of 2.26 HRC is the load difference wearing an interaction's name; the block structure is part of the data and must be declared, which also brings S from 0.63 back to 0.43 and sharpens A × B ✅ · B. The colleague is right, and the blocked analysis hid a real interaction by giving it up to the blocks · C. Both analyses are acceptable; the choice is a matter of which software was used · D. Drop the two furnace loads with the highest means and re-analyze the remaining eight coupons
`[E2 · B5 · Analyze · MFG · X · CERT]` — The confounded interaction is not estimable separately from the block difference, so any analysis that ignores the blocks reads the nuisance as A×B×C; B has the design logic backwards, since the interaction was chosen to be sacrificed precisely because it would carry the nuisance.

**E2-10.** In the accounts-payable process simulator: A batch size (5 / 25 invoices), B second-review threshold ($1,000 / $3,000). Response: mean invoice cycle time in working hours over one simulated week, fresh random seeds per run. 2^2 with two replicates (8 runs) plus four center points at 15 invoices and $2,000; 12 runs randomized.

```
Factorial fit: Cycle time (working h) versus A, B — 2^2, 2 replicates + 4 center points, N = 12
Source          DF       SS       MS        F       P
A batch size     1   47.045   47.045   384.0   0.000
B threshold      1   18.605   18.605   151.9   0.000
A*B              1    2.420    2.420    19.8   0.003
Curvature        1   20.535   20.535   167.6   0.000
Pure error       7    0.857    0.1225
Total           11   89.463
Effects (h): A +4.85   B −3.05   A*B +1.10      ȳ(factorial) = 25.95   ȳ(center) = 23.18
Cell means (h): 5/$1,000 25.6   25/$1,000 29.4   5/$3,000 21.5   25/$3,000 27.4   center 23.2
```

The correct reading:
A. Curvature is significant, so the batch-size and threshold effects cannot be interpreted and the experiment must be repeated with wider levels · B. The center points confirm the model: 23.2 h is inside the range of the corner means · C. The plane fitted to the corners predicts about 26.0 h at the center and the process delivers about 23.2 h there — the surface bows downward in the middle by about 2.8 h, eight times the pure-error standard deviation of 0.35 h — so a first-order model is wrong in the region where a good setting may lie; the corner effects stand as far as they go, and the next design is second-order, with a Master Black Belt involved ✅ · D. The curvature row shows that the A × B interaction is larger than the effects table says
`[E2 · B5 · Analyze · TXN · X · CERT]` — Curvature detected is a decision point about the model's shape, not a verdict on the corner effects; B compares the center mean to the wrong thing, since the test is against the factorial mean (25.95), not the range of corners.

**E2-11.** A sterile processing team designs a 2^2 with A detergent chemistry (enzymatic / alkaline) and B wash temperature (45 / 65 °C), and wants to check for curvature. The Black Belt's correct call:
A. Add four center points at the midpoint of both factors · B. Curvature cannot be checked in any design that contains a categorical factor · C. Replace the detergent factor with a continuous one so that center points can be placed · D. There is no midpoint between two chemistries, so place the center points on temperature only — two or three runs at 55 °C with each detergent — and test curvature in temperature within each chemistry ✅
`[E2 · B5 · Apply · HC · S · CERT]` — Center points need continuous factors, and the fix is to center only the continuous one at each level of the categorical one; A is the software default, which would ask for a detergent that does not exist.

**E2-12.** From a helicopter cohort's 2^2 (A wing length 7 / 9 cm, B wing width 3 / 5 cm) with two replicates and three center points at 8 cm / 4 cm, response flight time in seconds:

```
ȳ(factorial, 8 runs) = 2.400 s     ȳ(center, 3 runs) = 2.357 s
Pure error: SS = 0.0100   df = 6   MS = 0.00166   (s ≈ 0.041 s)
Curvature SS = nF · nC · (ȳF − ȳC)² / (nF + nC)
```

The curvature sum of squares and the conclusion:
A. 0.0018 — the squared difference — giving F ≈ 1.1 and no curvature · B. 0.0040 — 8 × 3 × 0.043² / 11 — giving F ≈ 2.4 on 1 and 6 df (p ≈ 0.17): curvature not detected, and the 0.04 s gap between the two means is about one pure-error standard deviation, so the first-order model stands over this range ✅ · C. 0.0203 — 11 × 0.043² — giving F ≈ 12 and clear curvature · D. 0.044 — 8 × 3 × 0.043² — giving F ≈ 27 and clear curvature
`[E2 · B5 · Apply · HC · X · CERT]` — The formula weights the squared difference by nF·nC/(nF + nC); C and D use the wrong weight and would send the team to a second-order design it does not need.

**E2-13.** A full fold-over of a resolution III fractional factorial is:
A. The same runs repeated in a fresh random order, which supplies pure error · B. The other half of the full factorial, chosen by reversing the sign of one generator · C. The same design with every column's signs reversed; combined with the first fraction it gives a resolution IV design in which every main effect is clear of two-factor interactions, though the two-factor interactions remain aliased among themselves ✅ · D. A second fraction with the factor ranges widened so that main effects become detectable
`[E2 · B5 · Understand · NEU · K · CERT]` — Reversing all signs kills every odd-length word in the defining relation, which is what lifts the resolution from III to IV; B describes the complementary half fraction of a 2^(k−1), which is one design, not the general fold-over.

**E2-14.** A 16-run 2^(7−3) resolution IV screen on a powder-coating line (A gun voltage, B powder flow, C distance, D passes, E booth humidity, F line speed, G cure temperature; response film thickness in µm) found large effects on A and D and a 4.6 µm effect on the column that estimates AD + CG + EF. The engineering question is whether voltage and passes interact; humidity and line speed will be held constant in production. The most economical next step:
A. A full fold-over of all 16 runs, giving 32 runs at resolution IV · B. A fold-over on factor A only — the 16 runs repeated with A's signs reversed — which de-aliases every two-factor interaction involving A, so AD separates from CG and EF at the cost of 16 runs; if the process will always run the same number of passes, the question is moot and no runs are needed ✅ · C. A single replicate of the full 2^7, because only 128 runs can settle an interaction · D. Report AD as the interaction because A and D have the largest main effects
`[E2 · B5 · Apply · MFG · S · CERT]` — A single-factor fold-over targets the interactions of one factor; A spends the same 16 runs and leaves AD aliased with CG and EF, because a full fold-over of a resolution IV design does not raise its resolution.

**E2-15.** A claims team's experiment plan for the process simulator, submitted to the Black Belt's coach before Lab 11. Run budget for the module: 40 simulator-weeks.

| Stage | Design | Runs |
|---|---|---|
| 1 | 2^(6−1) resolution VI on all six candidate factors, single replicate | 32 |
| 2 | "Confirmation of whatever stage 1 finds" | 8 |

The coach's correct feedback:
A. Approve it: resolution VI is the cleanest fraction available and 32 runs is affordable · B. Approve it after adding center points to stage 1 so that curvature is checked at the same time · C. Replace stage 1 with a full 2^6 so that no aliasing at all remains · D. The first design takes 80% of the budget, and a first design is always partly wrong — factors, ranges, response noise; spend about a quarter (an 8- or 16-run resolution IV screen), then let its result decide whether the next stage is a replicated full factorial on the active factors, a fold-over, or nothing ✅
`[E2 · B5 · Evaluate · TXN · X · CERT]` — The quarter-of-budget rule exists because the budget has to survive the first design being wrong; A buys resolution the team cannot use until it knows which factors are worth characterizing.

**E2-16.** A hospital laboratory's 16-run resolution IV screen on specimen-transport factors found three active factors out of six, with no interaction column standing out and no curvature (two center points). The next design in the sequence is:
A. A full 2^3 on the three active factors, replicated, with three or four center points and blocked on day if the runs span days — the characterization stage, where interactions and curvature among the factors that matter are established and an operating window can be stated ✅ · B. A full fold-over of the screen, to confirm that the three inactive factors are really inactive · C. A central composite design on the three active factors, because the next stage after screening is optimization · D. Confirmation runs at the best of the sixteen settings already tried
`[E2 · B5 · Apply · HC · S · CERT]` — Screen → characterize → optimize: the screen identified the factors and the characterization design studies them; C skips the stage that decides whether a second-order model is needed at all.

**E2-17.** From the helicopter 2^2 in E2-12, the first-order model in coded units is flight time (s) = 2.40 + 0.158·x₁ − 0.063·x₂, where x₁ is wing length (7 cm = −1, 9 cm = +1) and x₂ is wing width (3 cm = −1, 5 cm = +1). No curvature was detected. The team takes a steepest-ascent step of Δx₁ = +1 coded unit. Step 1 is built at:
A. Wing length 9.0 cm, wing width 4.4 cm · B. Wing length 9.0 cm, wing width 3.94 cm · C. Wing length 9.0 cm, wing width 3.6 cm — Δx₂ = (−0.063 / 0.158) × 1 = −0.40 coded units, which is −0.4 cm on a 1 cm half-range ✅ · D. Wing length 9.16 cm, wing width 3.94 cm
`[E2 · B5 · Apply · HC · X · CERT]` — Each factor moves in proportion to its coefficient relative to the step factor, then converts to natural units; B moves width by the raw coefficient in cm without scaling it to the step, and A has the sign wrong.

**E2-18.** The helicopter team of E2-17 walks the steepest-ascent path, one build and three timed drops per step (mean flight time in seconds shown; the kit template allows wing lengths up to 12 cm and widths down to 2 cm).

```
Step   Wing length (cm)   Wing width (cm)   Flight time (s)
 0          8.0                4.0               2.37
 1          9.0                3.6               2.55
 2         10.0                3.2               2.71
 3         11.0                2.8               2.80
 4         12.0                2.4               2.74
```

The correct next move:
A. Stop stepping — the response improved for three steps and then fell, so the first-order model has run out — and center a new 2^2 with center points around 11 cm / 2.8 cm, expecting curvature and then a second-order design ✅ · B. Take step 5 at 13 cm / 2.0 cm to confirm that the response really falls · C. Adopt 11 cm / 2.8 cm as the optimum and write it into the control plan · D. Re-fit the first-order model to the five path points and step again along the new coefficients
`[E2 · B5 · Analyze · HC · X · CERT]` — The path ends where improvement stops and a new design starts there; C treats one build per step, with no interval and no confirmation, as an optimum, and B proposes a build outside the template.

**E2-19.** After the simulator experiment in E2-10 (curvature detected, F = 167), a candidate proposes to "follow steepest descent along the coefficients −2.43 and +1.53 until cycle time stops falling". The correct call:
A. Proceed: steepest descent is the standard step after any 2^2 with center points · B. Do not: steepest ascent or descent follows a first-order model, and the center points have just shown that a first-order model is wrong in this region — go straight to a second-order design (the same corners and center points plus axial runs) with a Master Black Belt, rather than walk a path that the model cannot predict ✅ · C. Proceed, but step only in batch size because its coefficient is larger · D. Do not: steepest descent requires categorical factors to be held at their better level first
`[E2 · B5 · Evaluate · TXN · S · CERT]` — Curvature present is the stated case for skipping the path and augmenting to a central composite design; A applies the sequence mechanically to a model the data have already rejected.

**E2-20.** For two continuous factors, a central composite design consists of:
A. The four corner runs and four center points · B. The four corner runs plus eight runs on a 3 × 3 grid · C. Four corner runs, four runs at coded ±1.414 on each axis with the other factor at 0, and four center points — twelve runs · D. The four corner runs of the 2^2, four axial runs at coded ±1.414 on each axis with the other factor at its center, and about five center points — thirteen runs, enough to fit both squared terms and the interaction, with the corners and center points reusable from the characterization design ✅
`[E2 · B5 · Understand · NEU · K · CERT]` — Corners, axial (star) points and center points are the three parts of a CCD, and α = 1.414 makes the two-factor design rotatable; B describes a 3^2 grid, which fits a quadratic but with more runs and no rotatability.

**E2-21.** A candidate's project on an adhesive dispense line (bead width in mm, requirement 2.0 ± 0.2) has reached the point in E2-10's position: two active continuous factors, curvature detected, sponsor waiting. The candidate proposes to design a central composite design, run it and fit the quadratic alone over the weekend, "so the readout is not delayed". The coach's correct guidance:
A. Approve: a 13-run CCD is a small design and the software does the fitting · B. Decline: response-surface work is outside Black Belt scope and the project should stop at the characterization result · C. Have the candidate describe the CCD and the augmentation to the sponsor in a sentence, keep the corner and center runs already done as its first block, and bring in the Master Black Belt for the design and the second-order analysis — running RSM unaided is deliberately outside the minimally competent candidate statement, but recognizing the moment and reading the result is inside it ✅ · D. Substitute a replicated 2^2 with wider levels so that a first-order model fits after all
`[E2 · B5 · Evaluate · MFG · S · CERT]` — The credential expects the candidate to know when the optimize stage has arrived and to work with a Master Black Belt on it; B refuses the stage rather than staffing it, and D tries to make the process straight by changing the range, which is not how surfaces work.

**E2-22.** An infusion-pump validation team needs a second-order model of alarm latency (s) in flow rate and drug concentration. The engineering limit forbids the combination of maximum flow with maximum concentration — the (+1, +1) corner — because it exceeds the pump's rated dose. Which design does the Master Black Belt recommend?
A. A Box-Behnken design, which has no corner runs and places its points at the midpoints of the edges plus the center, so the forbidden corner is never run ✅ · B. A central composite design with the forbidden corner replaced by a center point · C. A central composite design with α reduced to 1.0 so that no run is outside the corners · D. A 3 × 3 full factorial, which places a run at every combination including the corner
`[E2 · B5 · Apply · HC · S · CERT]` — Box-Behnken is the standard second-order design when corners are infeasible; B breaks the CCD's structure and leaves it unable to fit the model, and C still runs the corner.

**E2-23.** An injection-moulding engineer has three factors for a shrinkage study and 16 runs of press time, and asks for a 2^(3−1) "to leave room for replication". The Black Belt's correct response:
A. Agree: a 4-run half fraction with four replicates uses the 16 runs fully · B. Run the full 2^3 with two replicates: with three factors the full factorial is only 8 runs, and the 2^(3−1) is resolution III, aliasing each main effect with a two-factor interaction to save four runs the budget does not need saved ✅ · C. Run the 2^(3−1) with four center points and two replicates · D. Run a 2^(4−1) instead, adding a fourth factor to use the resolution the budget can afford
`[E2 · B5 · Apply · MFG · S · CERT]` — Fractionating at k ≤ 3 sacrifices interactions for a saving that is not worth having; D adds a factor nobody asked about to fill a design, which is the same mistake in the other direction.

**E2-24.** A collections team wants to screen five call-handling factors in the process simulator and can afford 8 runs. Two of the factors — script version and call-back timing — are already expected, from the Green Belt project that preceded this one, to interact strongly. The Black Belt's correct call:
A. Run the 2^(5−2) resolution III screen: aliasing does not matter when the interaction is already known · B. Run the 2^(5−2) and read the script × call-back interaction from whichever column it lands in · C. Run a 2^(5−1) resolution V by borrowing 8 more simulator-weeks from the confirmation budget · D. Do not fractionate to resolution III here: in every 8-run design for five factors the expected interaction is aliased with a main effect, so the design could not read it — drop the two factors already known to interact (set them, and confirm later), and run a full 2^3 on the three genuinely open factors, or find 16 runs for a resolution V design ✅
`[E2 · B5 · Analyze · TXN · S · CERT]` — Expecting a specific two-factor interaction and affording only resolution III is the module's named case for not fractionating; B would attribute the interaction to a main effect, and C spends the confirmation runs the sequence needs.

**E2-25.** A replicated 2^3 on an adhesive (16 coupons) needs adhesive from two lots; lot 1 has enough for 6 coupons and lot 2 for 12. The operator proposes "standard-order runs 1–6 from lot 1, the rest from lot 2".

```
Std   A   B   C   ABC     Std   A   B   C   ABC
 1   −1  −1  −1   −1       5   −1  −1  +1   +1
 2   +1  −1  −1   +1       6   +1  −1  +1   −1
 3   −1  +1  −1   +1       7   −1  +1  +1   −1
 4   +1  +1  −1   −1       8   +1  +1  +1   +1
```

The correct handling:
A. Accept the proposal: two lots of the same adhesive are interchangeable · B. Accept it but add lot as a fourth factor in the analysis · C. Do not block on an unbalanced set — six standard-order runs put five C-low and one C-high coupon in lot 1, so lot would be partly confounded with C; instead use lot 1 for a balanced block of four (the A × B × C = −1 half of one replicate: standard order 1, 4, 6, 7) and lot 2 for the other twelve, declare lot as a block confounded only with A × B × C, and leave two lot-1 coupons unused ✅ · D. Delay the experiment until 16 coupons' worth of one lot is available, because blocking is not possible with unequal lots
`[E2 · B5 · Analyze · MFG · X · CERT]` — A block must hold a balanced set of runs or it confounds with a main effect; B cannot rescue the design because the lot column is unbalanced, and D refuses a design that works.

**E2-26.** A medication-reconciliation study will run a 2^3 on two nursing units, four runs on each. The Black Belt plans to block on unit. The unit managers say the two units differ in patient mix and in how reconciliation is done, and the sponsor's real question is whether the countermeasures work on both kinds of unit. The correct design decision:
A. Do not treat unit as a nuisance to remove — it is a factor the sponsor wants to learn about — so make it factor D and run a 2^4 (16 runs, 8 per unit) or a 2^(4−1) if only 8 runs are possible, so that unit × countermeasure interactions can be seen ✅ · B. Block on unit as planned; the block row will show whether the units differ · C. Run all eight runs on one unit to avoid the complication · D. Block on unit and analyze each unit's four runs separately
`[E2 · B5 · Analyze · HC · S · CERT]` — Blocking removes a nuisance and, by design, cannot estimate its interactions with the factors; B answers "do the units differ" but not "do the countermeasures work on both", which is the question asked.

**E2-27.** For a 2^(4−1) in 8 runs, a candidate must choose between the generators D = AB and D = ABC. The correct choice and the reason:
A. D = AB, because a shorter generator is easier to build by hand and the two designs have the same resolution · B. D = ABC, because its defining relation I = ABCD has a four-letter word — resolution IV, main effects clear of two-factor interactions — while I = ABD is resolution III and aliases A with BD, B with AD and D with AB ✅ · C. D = AB, because it leaves factor C completely unaliased, which is the safer structure · D. Either, because with eight runs and four factors every design estimates the same seven contrasts
`[E2 · B5 · Understand · NEU · K · CERT]` — The longest available generator gives the highest resolution; C is true about C's main effect but ignores that three of the four main effects are then aliased with two-factor interactions.

**E2-28.** Software output for a 16-run screen of six factors in the claims process simulator (A auto-triage, B template, C second-review threshold, D routing rule, E reminder rule, F work-queue order; response mean cycle time in working hours).

```
Fractional Factorial Design — 2^(6-2), 16 runs, resolution IV
Design generators: E = ABC, F = BCD
Defining relation: I = ABCE = BCDF = ADEF
Alias structure (terms up to order 2)
A   B   C   D   E   F   — each clear of two-factor interactions
AB = CE      AC = BE      AD = EF      AE = BC = DF
AF = DE      BD = CF      BF = CD
Effects (h): A −6.2   B −2.9   C +0.4   D −1.1   E −0.3   F +0.5
             AE = BC = DF column: +2.1     all other interaction columns within ±0.6
```

What does the +2.1 h establish?
A. That auto-triage and the reminder rule interact by about 2.1 h · B. That the template and threshold interact, because B is active and C is not · C. That the design's resolution has dropped to III for this column · D. That one of three two-factor interactions — auto-triage × reminder rule, template × threshold, or routing × queue order — or a mixture is worth about +2 h; the six main effects are clear, so the decision is whether the interaction matters to the recommendation and, if so, which fold-over (on A, on B, or on D) would separate them ✅
`[E2 · B5 · Analyze · TXN · X · CERT]` — In resolution IV a two-factor column is a string of aliases, here three; A reads the first name in the string, and B applies effect heredity as if it were a proof.

**E2-29.** A 2^(7−3) resolution IV screen in the application-processing simulator (A intake channel paper / portal, B QA sampling rate 10 / 30%, C template current / redesigned, D reminder rule off / on, E work-queue order FIFO / due date, F approver count 1 / 2, G status notifications off / on). Response: mean cycle time in working hours over a simulated week. 16 runs, single replicate, analyzed with Lenth's method.

```
Effects sorted by size (h)                      Lenth's method (15 effects)
A intake          -4.85     C            0.41     s0  = 1.5 × median|effect| = 1.5 × 0.41 = 0.62
B QA rate          2.92     E           -0.38     PSE = 1.5 × median of |effects| < 1.54 (12 effects) = 0.54
D reminders       -2.61     BD+CF+EG     0.34     ME  = t(0.025, 5) × PSE = 2.571 × 0.54 = 1.39
AF+BG+DE           0.71     AD+CG+EF     0.29
AB+CE+FG           0.63     G           -0.22     Half-normal plot: three points stand off the line
F approvers        0.55     AE+BC+DF    -0.19     (A, B, D); the other twelve lie on it
AC+BE+DG          -0.47     AG+BF+CD    -0.12
                            ABD + …      0.09
```

The candidate's correct next step:
A. Fold over the 16 runs to separate the AF + BG + DE string, because 0.71 h is the largest interaction column · B. Report all seven factors as active because a resolution IV design cannot declare anything inactive · C. Name A, B and D as active (the three beyond ±1.39 h, in agreement with the half-normal plot), record the redesigned template, queue order, approver count and notifications as not detected at this noise level, and characterize A, B and D in a replicated 2^3 with center points ✅ · D. Add four more factors to the next screen, since the first one found only three
`[E2 · B5 · Analyze · TXN · X · CERT]` — Lenth's margin and the half-normal plot agree on three active factors and every interaction string is inside the margin; A spends 16 runs on a column that is inert at this noise level.

**E2-30.** The helicopter cohort of E2-3 ran the full fold-over (8 more runs, every sign reversed) and combined the 16 runs.

```
Combined 16 runs — resolution IV (defining relation I = BCDE)
Effect (s)      A wing length   +0.58     B body length   -0.11     C wing width   -0.21
                D paper weight  -0.16     E clips         -0.52
                AB -0.01   AC +0.02   AD +0.02   AE -0.27   BC+DE -0.01   BD+CE -0.04   BE+CD +0.03
Mean 2.31 s      Cell means (s), A × E:  7 cm/1 clip 2.14   7 cm/2 clips 1.90   10 cm/1 clip 2.99   10 cm/2 clips 2.21
```

What do you tell the practicum observer about what the fold-over bought?
A. "The fold-over confirmed the first eight runs: wing width costs about 0.5 s, as the screen said." · B. "The −0.48 on the screen's C column was two things: wider wings cost about 0.2 s, and the wing-length × clip interaction is about −0.27 s — the second clip costs about 0.24 s on short wings but about 0.78 s on long ones. Long wings with one clip, about 3.0 s, is the setting to characterize; paper weight and body length are small, and the 16 runs answered what the 8 could not." ✅ · C. "All two-factor interactions are now clear, so the model can include every pair." · D. "The fold-over was unnecessary, because the main effects did not change."
`[E2 · B5 · Analyze · HC · X · CERT]` — The fold-over separated a main effect from the interaction that shared its column and gave the conditional effects a sponsor can use; C is wrong because three interaction pairs (BC + DE, BD + CE, BE + CD) remain aliased at resolution IV.

**E2-31.** In the helicopter screen (E2-3) the C column estimated C + AE = −0.48 s. In the fold-over fraction the same column estimated C − AE = +0.06 s. The separated estimates are:
A. C = −0.21 s and AE = −0.27 s — half the sum and half the difference of the two column effects ✅ · B. C = −0.48 s and AE = +0.06 s — the first fraction gives the main effect and the second gives the interaction · C. C = −0.42 s and AE = −0.54 s — the sum and the difference · D. C = −0.21 s and AE = −0.54 s
`[E2 · B5 · Apply · HC · X · CERT]` — Two equations in two unknowns: adding gives 2C and subtracting gives 2AE; C forgets to halve, and D halves one but not the other.

**E2-32.** The defining relation of a design is printed as I = ABD = ACE = BCDE. What does it tell you?
A. That the design has three generators and estimates three-factor interactions · B. That factors D and E are aliased with each other · C. That every word listed is aliased with the mean, that the third word is the product of the first two, that the resolution is III (shortest word three letters), and that the alias of any effect is found by multiplying it into each word — so A is aliased with BD and CE, and C with AE ✅ · D. That the design is a 2^(5−1) half fraction in 16 runs
`[E2 · B5 · Understand · NEU · K · CERT]` — A defining relation is the complete alias generator; D miscounts, since two independent generators (D = AB, E = AC) make it a 2^(5−2) in 8 runs.

**E2-33.** A property-claims team plans replicate 1 of a 2^3 (A auto-triage, B template, C second-review threshold $2,000 / $5,000) over two days, four runs per day, with day declared as a block. The run sheet as drafted:

```
Day 1 (block 1): Std 1, 2, 3, 4  — order randomized within the day
Day 2 (block 2): Std 5, 6, 7, 8  — order randomized within the day
Std   A   B   C          Std   A   B   C
 1   −1  −1  −1           5   −1  −1  +1
 2   +1  −1  −1           6   +1  −1  +1
 3   −1  +1  −1           7   −1  +1  +1
 4   +1  +1  −1           8   +1  +1  +1
```

The Black Belt's correct correction:
A. None — randomizing within the day is what blocking requires · B. Every day-1 run has the $2,000 threshold and every day-2 run has $5,000, so day is completely confounded with C and the block would remove the threshold effect along with it; assign by A × B × C instead — standard order 1, 4, 6, 7 on one day and 2, 3, 5, 8 on the other — so that only the three-factor interaction is confounded with day ✅ · C. Randomize all eight runs across the two days without regard to blocks and let the software sort out the block effect · D. Move factor C out of the experiment, since it cannot be varied within a day
`[E2 · B5 · Analyze · TXN · X · CERT]` — Standard-order halves split on the last factor, so a block built from them confounds a main effect; C abandons the block structure and leaves whatever day difference exists in the error term.

**E2-34.** Blocking in a 2^k experiment:
A. Increases the error degrees of freedom by adding runs under a second condition · B. Removes a known nuisance — day, lot, machine, team — from the error term by confounding it with an interaction you were not going to interpret, so effects are compared against a smaller S; the price is that the confounded interaction cannot be estimated ✅ · C. Replaces randomization for the runs inside each block · D. Turns the nuisance into a factor whose interactions with the others are estimated
`[E2 · B5 · Understand · NEU · K · CERT]` — A block trades an interaction for a cleaner error term; D describes adding the variable as a factor, which is the alternative when the nuisance is a question in its own right.

**E2-35.** Laser marking of stainless tags: A power (20 / 40 W), B mark speed (200 / 400 mm/s), C pulse frequency (20 / 40 kHz). Response: contrast ratio on a calibrated reader. 2^3, single replicate, plus four center points at 30 W / 300 mm/s / 30 kHz; 12 runs randomized.

```
Analysis of Variance for Contrast — 2^3, 1 replicate + 4 center points, N = 12
Source              DF       SS       MS        F       P
Main effects         3    1.842    0.614    68.2    0.003
2-way interactions   3    0.171    0.057     6.3    0.082
3-way interaction    1    0.009    0.009     1.0    0.391
Curvature            1    0.014    0.014     1.6    0.300
Residual error       3    0.027    0.009
  Pure error         3    0.027    0.009
Total               11    2.063
```

A candidate writes: "The p-values cannot be trusted because the design was not replicated." The correct response:
A. The candidate is right: with one replicate the full model is saturated and no test is possible · B. The candidate is right, and the center points should be dropped because they are not part of the 2^3 · C. The four center points supply three degrees of freedom of pure error, so the tests are legitimate — but weak: with 3 df the two-way row at p = 0.08 is inconclusive, not "no interaction", and curvature is not detected; if a two-way interaction would change the recommendation, replicate the corners before deciding ✅ · D. The tests are valid and the two-way interactions can be declared absent at α = 0.05
`[E2 · B5 · Analyze · MFG · X · CERT]` — Center points give a pure-error estimate without replicating the corners, which is one of their two jobs; D turns a low-power non-detection into a finding of absence.

**E2-36.** From the simulator experiment in E2-10, a candidate proposes to run the process at the center setting (15 invoices, $2,000) and writes in the tollgate pack: "Predicted cycle time at this setting from the fitted model: 26.0 h." The reviewer's correct response:
A. Accept: 26.0 h is the fitted plane's value at the center and the model fits the corners with R-Sq above 98% · B. Accept, but widen the prediction interval to allow for curvature · C. Reject the setting: a first-order model cannot be used to predict anywhere but the corners · D. The four center points measured this exact setting at about 23.2 h; the plane's 26.0 h is the number the curvature test just showed to be wrong by 2.8 h — quote the observed center mean with its interval, say that the response surface bends, and say that a second-order design is what will locate the best setting ✅
`[E2 · B5 · Evaluate · TXN · X · CERT]` — When the design has measured a point directly, the measurement outranks a model the data rejected at that point; B keeps a prediction the experiment contradicts and pads it, and C overstates, since a first-order model interpolates correctly when curvature is absent.

**E2-37.** The full output of the helicopter 2^2 with center points (E2-12): A wing length (7 / 9 cm), B wing width (3 / 5 cm), two replicates at the corners plus three center points, flight time in seconds.

```
Source          DF        SS        MS        F       P
A wing length    1   0.19845   0.19845   119.5   0.000
B wing width     1   0.03125   0.03125    18.8   0.005
A*B              1   0.00180   0.00180     1.1   0.338
Curvature        1   0.00403   0.00403     2.4   0.167
Pure error       6   0.00997   0.00166
Effects (s): A +0.315   B −0.125   A*B +0.030     ȳF = 2.400   ȳC = 2.357
```

The correct reading and next step:
A. No curvature detected over this range (a 0.04 s gap, about one pure-error standard deviation) and no interaction, so the first-order model — longer wings help by about 0.3 s, narrower wings by about 0.1 s — stands; since the goal is the longest flight, walk a steepest-ascent path toward longer, narrower wings rather than declaring a corner the optimum ✅ · B. Curvature is present at p = 0.17, which is close enough to matter, so a central composite design is the next step · C. Wing length is the only lever; wing width can be set anywhere · D. The corner at 9 cm / 3 cm is the optimum, because it has the highest cell mean
`[E2 · B5 · Analyze · HC · X · CERT]` — No curvature plus a goal of "more" is the steepest-ascent case; D stops at the edge of the range explored, which is exactly where a first-order model says to keep going.

**E2-38.** A catapult team ran a 2^(5−1) resolution V (E = ABCD, 16 runs, single replicate) on angle, stop position, cup position, bands and projectile. The half-normal plot shows angle, bands, stop and the angle × bands interaction clearly off the line; every other effect lies on it, and the result matches what the team expected from Lab 8. A team member wants to run the other 16 runs "so that we have the full 2^5 and can be sure". The correct call:
A. Run them: the full factorial is always more informative than a half fraction · B. Do not: at resolution V every main effect and every two-factor interaction is already clear of the others, nothing in the result is ambiguous, and the sequential rule is to run more only when the ambiguity matters to the decision — spend the time on confirmation runs at the recommended setting instead ✅ · C. Run half of them (8 runs) as a partial fold-over · D. Run them as a second replicate of the same 16 runs to get pure error
`[E2 · B5 · Evaluate · MFG · S · CERT]` — More runs are bought to resolve a named ambiguity, and there is none; D would buy pure error the half-normal plot has already made unnecessary for the decision, at the cost of the confirmation the rubric requires.

**E2-39.** A branch network wants to screen six counter-service factors in 8 live runs, each run a full day of real customers at one branch, followed by a fold-over week if needed. Three of the six factors are already known from the baseline to be the ones that move waiting time. The Black Belt's correct call:
A. Run the 2^(6−3) resolution III screen: eight days is the minimum cost for six factors · B. Run the screen in two branches at once to halve the calendar time · C. Do not fractionate on live customers here: sixteen days of a screen-plus-fold-over on six factors, three of them already answered, is more disruptive than a full 2^3 on the three open factors (8 days, every effect and interaction clear) — or the screen belongs in the process simulator first, with the live runs kept for confirmation ✅ · D. Run the screen with the three known factors set to their worse level so that the other three show larger effects
`[E2 · B5 · Analyze · TXN · S · CERT]` — A person-facing service where every run is a day of customers is the module's named case against a resolution III screen and fold-over; D sets a known-harmful level on real customers, which Section E1 rules out on its own.

**E2-40.** A helicopter cohort (HC) at the practicum has five factors to study in a half-day session. A helicopter costs one sheet of paper and about two minutes to build; a run (build, drop, time) takes about three minutes. The team is choosing between a 2^(5−2) resolution III in 8 runs and a 2^(5−1) resolution V in 16 runs. The correct choice:
A. The 8-run design, because a screen should always come first · B. The 8-run design with two replicates, which also costs 16 runs and adds pure error · C. Neither: five factors need the full 2^5 · D. The 16-run resolution V — at three minutes and a sheet of paper per run, 16 runs fit the session with room for confirmation drops, and they buy every main effect and every two-factor interaction clear of each other, where the 8-run design would alias each main effect with two-factor interactions the cohort already knows exist (wing length × clips) ✅
`[E2 · B5 · Apply · HC · S · CERT]` — When runs are cheap, resolution is the thing to buy; B spends the same 16 runs on replicating a design whose main effects remain aliased.

**E2-41.** The method of steepest ascent:
A. Follows a first-order model with no curvature by moving every factor in proportion to its coefficient, one trial per step, until the response stops improving — then a new design is centered where it stopped ✅ · B. Runs the factor with the largest effect at progressively higher levels while holding the others at their center · C. Fits a quadratic to the path points and solves for the maximum · D. Repeats the factorial design at a new center chosen by the sponsor
`[E2 · B5 · Understand · NEU · K · CERT]` — The path is the gradient of the first-order model, so every active factor moves together; B is one-factor-at-a-time in disguise, which misses the direction whenever more than one factor matters.

**E2-42.** Steepest-descent path for invoice cycle time in the simulator (batch size and approval threshold), one simulated week per step. The team's daily invoice volume is 45; a batch cannot exceed a day's arrivals.

```
Step   Batch size   Threshold   Cycle time (h)
 0        20         $1,000        18.6
 1        30         $1,300        16.9
 2        40         $1,600        15.9
 3        50         $1,900        (not run)
```

The correct handling at step 3:
A. Run step 3 in the simulator anyway; the simulator does not enforce daily volume · B. Batches of 50 cannot be filled from 45 invoices a day, so clip the path at the constraint (batch ≤ 45), record that the path left the feasible region, and either continue along threshold alone at batch 45 or center the next design at about 40–45 invoices / $1,600 with the constraint written into it ✅ · C. Stop the study at step 2 and adopt 40 invoices / $1,600 as the optimum · D. Re-scale the path so that batch size steps by 5 and threshold by $150, which keeps batch under 45 for longer
`[E2 · B5 · Analyze · TXN · S · CERT]` — A path that leaves the feasible range is clipped to the constraint and the clipping is declared; A optimizes a process nobody can run, and D changes the step size without changing where the path is going.

**E2-43.** Center points in a two-level design:
A. Are extra replicates at the middle setting whose main purpose is to estimate the constant term more precisely · B. Can be placed for any factor by coding its two levels as −1 and +1 and running at 0 · C. Are runs at the mid-level of every continuous factor; their mean is compared with the mean of the factorial runs, and a difference larger than pure error allows is evidence that the surface bends — the same runs also supply a pure-error estimate without replicating the corners ✅ · D. Are required in every screening design so that curvature is settled before the factors are chosen
`[E2 · B5 · Understand · NEU · K · CERT]` — Two jobs, curvature and pure error, and both need a real middle; B invents a midpoint for a categorical factor, which is the error the module names.

**E2-44.** A catapult team's 8-run 2^(7−4) resolution III screen, presented at the practicum: A pull-back angle, B stop position, C cup position, D rubber bands, E projectile, F release (hand / trigger), G arm extension. Response: landing distance in cm.

```
2^(7-4) III, 8 runs, single replicate — Distance (cm)
Column   Estimates                 Effect
A        A + BD + CE + FG           79.5
B        B + AD + CF + EG           31.0
C        C + AE + BF + DG           18.5
D        D + AB + CG + EF           52.0
E        E + AC + BG + DF           11.5
F        F + AG + BC + DE           -3.0
G        G + AF + BE + CD            9.0
```

The candidate's slide says: "Seven main effects estimated. Angle, bands, stop, cup, arm and projectile are active; release method is inert." The observer's correct feedback:
A. Pass: a resolution III screen is designed to estimate main effects, and seven were · B. Pass, but ask for the effects to be converted to coefficients · C. Redo: the design should have been a full 2^7 · D. Redo the reading: every column is a main effect plus three two-factor interactions, and the team already knows from Lab 8 that angle × bands is worth about 20 cm — it sits in the D column, so 52 cm is not "bands"; "release inert" is not shown either, since a main effect and an interaction can cancel; report the columns as provisional, name what each could be, and propose the 8-run fold-over that would clear the main effects ✅
`[E2 · B5 · Evaluate · MFG · X · CERT]` — Resolution III columns are sums, and reading them as main effects is the defect the alias table exists to prevent; A accepts the reading the design cannot support.

**E2-45.** A catapult cohort's run sheet for a 5-factor, 8-run screen (A angle, B stop, C cup, D bands, E projectile) was built by a previous team and the generators were not written down.

```
Std    A    B    C    D    E
 1    −1   −1   −1   +1   +1
 2    +1   −1   −1   −1   +1
 3    −1   +1   −1   +1   −1
 4    +1   +1   −1   −1   −1
 5    −1   −1   +1   −1   −1
 6    +1   −1   +1   +1   −1
 7    −1   +1   +1   −1   +1
 8    +1   +1   +1   +1   +1
```

Reading the generators from the sheet, the defining relation and one consequence:
A. D = AB and E = AC; I = ABD = ACE = BCDE; resolution III; A is aliased with BD and CE · B. D = AC and E = BC; I = ACD = BCE = ABDE; resolution III; the angle column estimates A + CD, and the cup column estimates C + AD + BE — so cup position is aliased with two two-factor interactions at once ✅ · C. D = ABC and E = AB; I = ABCD = ABE = CDE; resolution III; D is clear of two-factor interactions · D. D = BC and E = AC; I = BCD = ACE = ABDE; resolution III; B is aliased with CD
`[E2 · B5 · Analyze · MFG · X · CERT]` — Row by row, D matches A × C and E matches B × C (row 1: (−)(−) = + for both), and multiplying gives the third word; A is the module's textbook generator pair, which this sheet does not use.

**E2-46.** A 2^(4−1) resolution IV (D = ABC) on a powder-coating line must be split across two shifts, four runs each, with shift declared as a block. The engineer judges that flow × distance (BC) and voltage × passes (AD) are the interactions most likely to matter, and that voltage × flow (AB) and distance × passes (CD) are not. The correct blocking:
A. Confound shift with the AB = CD column — the alias pair judged least likely to matter — putting standard order 1, 4, 5, 8 (where A × B = +1) in one shift and 2, 3, 6, 7 in the other, randomized within shift, and write in the record that AB + CD is now indistinguishable from shift ✅ · B. Confound shift with the D column, since D was generated and is already compromised · C. Put standard order 1–4 in one shift and 5–8 in the other, because the fraction is already balanced · D. Do not block: a fraction has no interaction column to spare
`[E2 · B5 · Apply · MFG · S · CERT]` — In a fraction the block must be confounded with a whole alias string, and the least valuable string is chosen and declared; B confounds a main effect with shift, and C confounds C with shift.

**E2-47.** For a 2^(5−1) with E = ABCD (resolution V), the model that can be fitted with every term clear of every other is:
A. Main effects only, because every interaction is aliased with another interaction · B. Main effects and two-factor interactions, but only those involving factor E · C. All five main effects and all ten two-factor interactions, each aliased only with a three- or four-factor interaction assumed negligible; the three-factor interactions are the sacrifice, and with 16 runs the model uses every degree of freedom, so the analysis needs a half-normal plot or center points for error ✅ · D. All terms up to the four-factor interaction, because a half fraction loses only the five-factor interaction
`[E2 · B5 · Understand · NEU · K · CERT]` — Resolution V is the level at which the two-factor-interaction model is safe; D loses count, since a 16-run design cannot estimate 31 effects.

**E2-48.** Response-surface output from the optimize stage of the accounts-payable simulator project (Master Black Belt designed the CCD; the candidate reads it). x₁ = batch size coded from 30–50 invoices (center 40), x₂ = approval threshold coded from $1,400–$1,800 (center $1,600). Response: mean cycle time in working hours per simulated week.

```
Response Surface Regression: Cycle time (h) versus x1, x2 — CCD, 13 runs (4 corners, 4 axial, 5 center)
Term          Coef   SE Coef       T       P
Constant     15.31     0.12   127.6   0.000
x1           -0.42     0.09    -4.7   0.002
x2           -0.28     0.09    -3.1   0.017
x1*x1         1.12     0.10    11.2   0.000
x2*x2         0.46     0.10     4.6   0.002
x1*x2         0.35     0.13     2.7   0.031
S = 0.26   R-Sq = 97.1%   residual df = 7   Lack of fit p = 0.41
Stationary point: minimum at x1 = +0.15, x2 = +0.25  (batch 42 invoices, threshold $1,650)
Predicted mean cycle time at the stationary point: 15.2 h   95% CI (14.9, 15.5)
Contour plot: closed ellipses around the minimum; the 16 h contour spans batch 36–48 at $1,650
```

The sentence for the sponsor, and the candidate's next step:
A. "The best setting is about 42 invoices per batch with a $1,650 threshold, predicted mean cycle time about 15.2 h (plausibly 14.9 to 15.5) against about 18.6 h at today's 20 / $1,000; the surface is a bowl, so anywhere from about 36 to 48 invoices at that threshold stays under 16 h, which gives operations room. Next: five confirmation weeks at 42 / $1,650 with this prediction written down, then a live pilot." ✅ · B. "Batch size squared is the dominant term (t = 11.2), so batch size should be controlled to the nearest invoice." · C. "The model has R-Sq of 97%, so the process will run at 15.2 h once the settings are entered." · D. "Because the interaction term is significant, the two factors cannot be set independently and further runs are needed."
`[E2 · B5 · Evaluate · TXN · X · CERT]` — Reading a software optimum with its interval, the region of acceptable settings from the contour, a comparison to today and a confirmation plan is what the credential expects at this stage; B reads a t-value as an operating instruction, and C treats a model prediction as a guarantee.

**E2-49.** An analyst builds a 2^(5−2) (D = AB, E = AC) in Excel, then adds product columns for every two-factor interaction and runs Data Analysis > Regression on all fifteen columns. Excel returns coefficients of zero with blank standard errors for several terms and a warning about collinearity. The correct explanation and fix:
A. Excel cannot analyze fractional factorials; export the data to Minitab · B. The interaction columns were multiplied in the wrong order; rebuild them and re-run · C. The design needs at least one replicate before a regression can be fitted · D. In this fraction the D column is the A × B column and the E column is the A × C column — identical columns, which no regression can separate — so fit only the seven contrasts the design can estimate (A, B, C, D, E, BC, ABC) and label each with its alias string from the defining relation I = ABD = ACE = BCDE; the "coefficient of D" is the coefficient of D + AB ✅
`[E2 · B5 · Analyze · TXN · S · CERT]` — Aliasing is collinearity by construction, and the analysis must name it rather than ask the software to break it; A moves the problem without understanding it, and Minitab would print the same alias structure.

**E2-50.** A transactional cohort plans an 8-run 2^(6−3) screen in the process simulator to find which of six factors matter; two of the factors are categorical (routing rule, template) and the four continuous ones use wide ranges. A team member proposes adding four center points "so curvature is checked at the same time". The Black Belt's correct call:
A. Leave the center points for the characterization design: the screen's question is which factors matter, curvature will be tested there on the two or three that survive, and with two categorical factors a proper center would need a set of center runs at each of the four routing × template combinations — more runs than the screen itself ✅ · B. Add the four center points at the coded 0 of every column, including the categorical ones · C. Add them, because a screen without center points cannot estimate error · D. Add eight center points, two per categorical combination, and pool them
`[E2 · B5 · Apply · TXN · S · CERT]` — The screen-stage exception to center points, compounded by categorical factors; B places runs at a routing rule and a template that do not exist.

**E2-51.** A candidate's sequential plan for a coating project with six candidate factors and a 64-run budget, submitted at the Lab 11 clinic.

| Stage | Design | Runs | Decision rule written |
|---|---|---|---|
| Screen | 2^(6−2) resolution IV, single replicate, 2 center points | 18 | none |
| Characterize | full 2^3 on the actives, 2 replicates, 4 center points, blocked on day | 20 | none |
| Optimize | central composite design on two factors | 13 | none |
| Confirm | runs at the recommended setting | 5 | none |
| Total | | 56 | |

The coach's correct feedback:
A. Reject: the plan exceeds the quarter rule at every stage · B. Approve as written: the stages are in the right order and the total is inside the budget · C. Replace the screen with a full 2^6 since the budget allows 64 runs · D. Approve the shape (first design under a third of the budget, characterize before optimize, confirmation included) but require a decision rule between stages: characterize only the factors the screen finds; steepest ascent if no curvature, the CCD — reusing the characterization corners and center points as its first block — only if curvature is detected; the run counts after stage 1 are estimates, not commitments ✅
`[E2 · B5 · Evaluate · TXN · X · CERT]` — Sequential means each stage's design is chosen from the previous stage's result, so a plan that fixes the CCD in advance is a schedule, not a sequence; B approves the schedule, and A misreads the rule, which applies to the first design only.

**E2-52.** A 2^3 on a brazing furnace was designed in two blocks of four by A × B × C (two furnace loads). On the day, the operator draws one random order for all eight runs and loads the first four drawn into load 1 and the last four into load 2, and the analysis declares blocks as designed. The Black Belt's correct response:
A. Accept: the runs were randomized, which is what matters · B. Accept, and analyze without blocks since the loads were filled at random · C. Re-run the whole experiment; nothing can be salvaged from a mis-loaded design · D. The loads no longer contain the designed blocks, so the analysis "as designed" is wrong: the actual load membership must be recorded and declared, and because a random four-and-four split is almost never balanced on every factor, the load difference is now partly confounded with whichever effects the draw unbalanced — analyze with the actual loads as the block variable, state which effects are partly confounded, and next time randomize within the designed blocks, not across them ✅
`[E2 · B5 · Evaluate · MFG · S · CERT]` — Randomize within blocks; a draw across blocks destroys the balance the confounded-interaction assignment was built to protect, and the record must show what actually ran; B leaves a real load difference in the error term and, worse, in whichever effect it fell on.

<!--
Key tally (52 items): A = 13 (E2-2, 5, 9, 16, 18, 22, 26, 31, 37, 41, 46, 48, 50) · B = 13 (E2-4, 7, 12, 14, 19, 23, 27, 30, 33, 34, 38, 42, 45) · C = 13 (E2-1, 6, 10, 13, 17, 21, 25, 29, 32, 35, 39, 43, 47) · D = 13 (E2-3, 8, 11, 15, 20, 24, 28, 36, 40, 44, 49, 51, 52)
Type: X = 23 (44%) · S = 19 (37%) · K = 10 (19%)
Bloom: Analyze = 20 · Apply = 13 · Evaluate = 9 · Understand = 10 · Remember = 0 (Apply/Analyze/Evaluate = 42 = 81%)
Vertical: MFG = 14 · HC = 14 · TXN = 14 · NEU = 10
Negative stems: 0
Contexts: helicopter (E2-3, 7, 12, 16, 17, 18, 30, 31, 37, 40) · catapult (E2-38, 44, 45) · process simulator (E2-10, 15, 19, 24, 28, 29, 36, 42, 48, 49, 50, 51) · project processes (the rest)
"When not to" coverage: fractionate (E2-23 k ≤ 3, 24 expected interaction at resolution III, 39 person-facing service, 38 no ambiguity left) · block (E2-25 unbalanced block, 26 nuisance is a factor) · add center points (E2-11 categorical factor, 50 screen stage with categorical factors) · steepest ascent (E2-19 curvature present, 42 path leaves feasible range) · run RSM unaided (E2-21) · Lenth with few effects (E2-29 uses 15 effects; E2-44 has 7 and is read by physics and fold-over instead) · read an aliased column as a main effect (E2-3, 28, 44, 49)
Exhibit data are generated to be internally consistent: column effects in E2-3, 5, 30 and 31 are computed from the design tables shown (fold-over fraction held in the generator script); the blocked and unblocked ANOVAs in E2-8 and E2-9 partition the same 16 observations; the curvature outputs in E2-10, 12, 35 and 37 satisfy SS_curv = nF·nC·(ȳF − ȳC)²/(nF + nC) and sum to their totals; the CCD stationary point in E2-48 solves the printed quadratic; Lenth's ME in E2-29 uses t(0.025, 5) = 2.571.
-->

v1.0 · 2026-09-20
