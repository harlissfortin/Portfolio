# Practicum Case — TXN: Accounts Payable Invoice Entry, Four Intake Channels

*The transactional/services vertical case for the Green Belt live labs (weeks 2–8) and the
Practicum track. Sections 1–3 are the learner's case pack, released piece by piece on the
calendar in [`practicum-track-project.md`](practicum-track-project.md). Section 4 is the
**facilitator answer key**: what is planted and what every analysis returns. Do not hand
section 4, or `data/generate.py`, to learners. The data are simulated to behave like a real
workflow extract; every figure in this file is computed from the CSVs as shipped.*

Level calendar and gates: [`../README.md`](../README.md). Rubric:
[`../project/review-rubric.md`](../project/review-rubric.md). Tollgate pages:
[`../project/tollgate-checklists.md`](../project/tollgate-checklists.md).

**Files** (`data/`): `txn-invoices.csv` (2,053 rows — the sampled invoice log, 5 Jan–3 Jul
2026, extracted 10 Jul 2026) · `txn-pilot.csv` (230 rows, 3–21 Aug 2026 — released after the
pilot design and written prediction are submitted). The attribute agreement study in §1.4 is
printed in this file rather than shipped as a CSV; the numbers in the key are computed from
that table.

---

## 1. The case

### 1.1 The sponsor's brief (as received — it contains two causes and a countermeasure)

> From: manager, accounts payable, shared services. About one invoice in fourteen has to be
> corrected after it has gone to the approver, and I now have three vendors a week calling
> about payments that are late. Two things are going on. Paper is still coming in and paper
> gets keyed wrong. And the two clerks who moved to us from the customer-service desk in the
> January reorganization are still learning — look at the correction report, they are at the
> top of it. I want a second person to check everything those two key before it is released,
> and a refresher session on the paper batches. Keying time is not the issue: it has been
> coming down all year since IT gave us the new capture screen.

Your week 1 job is to take the two causes ("paper", "the two clerks") and the countermeasure
("second-person check") out of the problem statement and keep all three on a list for week 6,
where the data decide whether any of them survives. The sponsor is not guessing wildly: the
two clerks she names really are the top two on the correction report. Week 6 is where you
find out what that is worth.

### 1.2 The process

The shared services centre keys supplier invoices for one manufacturing division. About
**158 invoices arrive on a working day** (illustrative volume from the workflow tool);
twelve clerks (`C01`–`C12`) key them. Invoices arrive on four paths and the path is recorded
on the record:

- **EDI** — the vendor's system posts the invoice into the workflow; a clerk only clears
  exceptions.
- **Portal** — the vendor types the header fields into the supplier portal; a clerk checks
  them against the purchase order and posts.
- **Email-PDF** — the invoice arrives as a PDF in a shared mailbox; a clerk downloads it,
  runs it through capture, corrects what the capture tool read, and keys the rest.
- **Paper-scan** — the mailroom batches paper and scans it, currently twice a working day
  (11:00 and 14:00); the scan joins the same capture step.

After keying, the invoice is matched to the purchase order and the receipt, then routed to an
approver. An approver who finds a field wrong sends it back; the clerk changes the field and
re-releases it. That return is what the workflow records as a **correction**, and it is what
this project is about. Invoices then wait for the payment run and are paid on the vendor's
terms.

The extract is a **systematic sample: every tenth invoice** by arrival sequence, drawn by the
workflow tool's standard report over 26 working weeks. Rates computed on it estimate the
whole stream; counts on it are one tenth of the stream.

**Go-see observations for the week 2 value stream map** (illustrative, from four walked
invoices and work-in-process counts taken at 09:00, 13:00 and 16:00 on three days): shared
mailbox holding 82 emailed invoices on average; mailroom holding 12 paper invoices between
scan runs; approver queue holding about 240 invoices; match step automatic for most invoices
and about 12 minutes by hand when it fails; approval touch about 4 minutes; posting about
1.5 minutes; a returned invoice goes back to the end of the approver queue. The keying times
are in the log.

### 1.3 The customer documents

There are two customers and two documents, and they set different things:

- *AP service agreement with the business, clause 4:* "Invoices are entered complete and
  accurate on first release to the approver. **Target: no more than 3% of invoices corrected
  after release**, measured monthly." This is a target agreed between two internal
  departments, not a physical limit.
- *Supplier terms (per vendor contract):* payment due in **calendar days** from the invoice
  date — net 30 for most groups, net 45 for services contracts. The extract does **not**
  carry a terms column, which matters in week 4.

Keying time has **no** customer document. It is an internal productivity measure. Control
limits for it come from the process; there are no specification limits for it, so there is no
capability to compute on it. Say that out loud at Tollgate 2 — it is the single most common
confusion at this level.

### 1.4 The measurement system

The primary metric is a **classification made by a person**: an approver decides an invoice
needs a field changed, and one of two senior AP analysts records the correction event in the
workflow. So the measurement system study for this project is an **attribute agreement
analysis**, not a Gage R&R: the question is whether two analysts, on two occasions, make the
same call on the same invoice, and whether that call matches a standard.

The study released in week 3: **30 posted invoices**, 10 of which a two-person panel (the AP
supervisor and the vendor-master owner) judged against the purchase order and the receipt as
**needing correction**; both analysts judged all 30 twice, a week apart, in a different
order, blind to the panel and to each other. Definition in force, **v1**: *"the invoice is
complete and accurate as posted."*

| Record | Standard | A pass 1 | A pass 2 | B pass 1 | B pass 2 |
|---|---|---|---|---|---|
| AP01 | needs | needs | needs | needs | needs |
| AP02 | needs | needs | needs | accurate | accurate |
| AP03 | needs | accurate | accurate | needs | needs |
| AP04 | needs | needs | needs | accurate | needs |
| AP05 | needs | needs | needs | needs | needs |
| AP06 | needs | needs | needs | needs | accurate |
| AP07 | needs | needs | needs | accurate | needs |
| AP08 | needs | needs | needs | needs | needs |
| AP09 | needs | needs | needs | needs | needs |
| AP10 | needs | needs | needs | needs | needs |
| AP11 | accurate | accurate | accurate | needs | needs |
| AP12 | accurate | accurate | accurate | accurate | accurate |
| AP13 | accurate | accurate | accurate | accurate | accurate |
| AP14 | accurate | accurate | accurate | accurate | accurate |
| AP15 | accurate | accurate | accurate | needs | accurate |
| AP16 | accurate | accurate | accurate | accurate | accurate |
| AP17 | accurate | accurate | accurate | accurate | accurate |
| AP18 | accurate | accurate | accurate | accurate | accurate |
| AP19 | accurate | accurate | accurate | accurate | accurate |
| AP20 | accurate | accurate | accurate | accurate | accurate |
| AP21 | accurate | accurate | accurate | accurate | accurate |
| AP22 | accurate | accurate | accurate | accurate | accurate |
| AP23 | accurate | accurate | accurate | accurate | accurate |
| AP24 | accurate | accurate | accurate | accurate | accurate |
| AP25 | accurate | accurate | needs | accurate | accurate |
| AP26 | accurate | accurate | accurate | accurate | accurate |
| AP27 | accurate | accurate | accurate | accurate | needs |
| AP28 | accurate | accurate | accurate | accurate | accurate |
| AP29 | accurate | accurate | accurate | accurate | accurate |
| AP30 | accurate | accurate | accurate | accurate | accurate |

Acceptance criteria are in [`../templates/msa-plan.md`](../templates/msa-plan.md) Part B.
Set them before you compute anything.

### 1.5 The change log (released on request in week 4)

The AP and IT change log for the extract window, as kept by the team lead. Most entries are
routine. Two matter.

| Date | Entry |
|---|---|
| 05 Jan | Clerks C07 and C09 join AP from the customer-service desk (January reorganization) |
| 19 Jan | Vendor-master clean-up: 140 duplicate vendor records merged |
| 02 Feb | Workflow tool point release; no field changes |
| 16 Feb | Shared-mailbox rule added: emailed invoices auto-filed by vendor name |
| **06 Apr** | **Capture (OCR) template replaced and the keying screen's field order changed. Applies to Portal, Email-PDF and Paper-scan. EDI is untouched** |
| 20 Apr | Second mailroom scan run added at 11:00 to clear the morning batch |
| 04 May | Approver delegation limit raised from $5,000 to $10,000 |
| 18 May | Vendor portal enrolment campaign opens; 38 vendors invited |
| 08 Jun | Month-end close moved one working day earlier |
| 22 Jun | Two approvers on leave; approvals delegated to the AP supervisor |

### 1.6 Columns

| File | Column | Meaning | Type |
|---|---|---|---|
| invoices, pilot | `invoice_id` | Sampled invoice | ID |
| | `date` | Working day the invoice was keyed (no weekend rows) | Date |
| | `entry_channel` | Portal / Email-PDF / Paper-scan / EDI | Category |
| | `clerk_code` | Clerk who keyed it (`C01`–`C12`) | Category |
| | `vendor_group` | Raw materials / MRO / Services / Freight / Utilities | Category |
| | `entry_minutes` | Keying touch time, **working minutes** from the workflow timer | Continuous |
| | `corrected` | Yes / No — a field was changed after release to the approver | Attribute |
| | `days_to_pay` | **Calendar days** from invoice date to payment release; blank = not yet paid at the 10 Jul extract | Continuous, censored |

---

## 2. Week by week — which data, which tool, which rubric item

| Week | Data | Tool | Software | Rubric |
|---|---|---|---|---|
| 2 | Go-see notes and work-in-process counts; `entry_channel`, `entry_minutes`, `corrected` | SIPOC; current-state value stream map with the four intake paths drawn separately; Little's Law on the three queues; lead time, %C&A, process cycle efficiency with the basis stated; operational definition of the primary metric | Any map tool; a spreadsheet for the timeline and the queue arithmetic | M1, M2, D2 |
| 3 | The §1.4 attribute study | Attribute agreement analysis: within-appraiser, each appraiser vs the standard, between appraisers, all vs standard, kappa; then the definition rewrite and the re-run | Minitab Stat > Quality Tools > Attribute Agreement Analysis · Excel toolkit MSA workbook (kappa by hand) · R `irr::kappa2()`; Python `sklearn.metrics.cohen_kappa_score` or a `pandas.crosstab` and the kappa formula | ★ M3 |
| 4 | `corrected` by week; `entry_minutes` by day and week; the change log | Data audit (duplicate, spellings, blank timers, negative days-to-pay, censoring); p chart with stepped limits; I-MR on weekly mean keying time; DPMO and sigma level on the primary metric; why there is no Cp/Cpk here | Minitab Stat > Control Charts > Attributes Charts > P, and Variables Charts for Individuals > I-MR; Stat > Quality Tools > Capability Analysis > Binomial · Excel toolkit p-chart calculator, `NORM.S.INV` · R `qcc::qcc(type="p", sizes=n)`; Python: the p-chart formula with `numpy`, `scipy.stats.norm.ppf` | M4 |
| 5 | All columns | Pareto of corrections by channel with counts printed; bar charts of rate with n under each bar; box plots of keying time by channel and vendor group; correction rate by channel × vendor group; fishbone → C&E matrix → FMEA; test plan from the selector | Minitab Graph > Bar Chart (of a proportion, with counts), Boxplot (With Groups) · Excel PivotTable · R `ggplot2`; Python `seaborn` | A1, A2 |
| 6 | All columns | Chi-square of `corrected` by channel, then by clerk and by vendor group; two-proportion tests with intervals; Welch t and one-way ANOVA + Tukey on keying time; regression on time; correlation and its confounder | Minitab Stat > Tables > Chi-Square Test for Association; Basic Statistics > 2 Proportions, 2-Sample t; ANOVA > One-Way; Regression · Excel ToolPak, `CHISQ.TEST` · R `chisq.test()`, `prop.test()`, `t.test()`, `aov()` + `TukeyHSD()`, `lm()`; Python `scipy.stats.chi2_contingency`, `statsmodels` `proportions_ztest`, `confint_proportions_2indep`, `scipy.stats.ttest_ind(equal_var=False)`, `f_oneway`, `statsmodels.formula.api.ols` | ★ A3, A4 |
| 7 | Written prediction, then `txn-pilot.csv` | Countermeasure selection against criteria; pilot plan with a power statement and a stop rule; poka-yoke at intake; queue-management module on the approver queue | Pilot plan template; the power calculation in any of the four tools | I1, I2, I4 |
| 8 | Baseline + pilot on one chart | p chart continued with baseline limits; two-proportion test on the channel that was changed; direct standardization for the channel mix; DPMO after; control plan; response plan; standard work; simulated cost table | Same as weeks 4 and 6 | ★ I3, ★ C1, C2, C3, S1 |

**The primary metric, as you should define it by Tollgate 1:** the share of sampled invoices
whose posted record is changed after first release to the approver, flagged in the workflow by
the AP analyst on duty under definition v1, counted per working week on the every-tenth-invoice
sample, and reported as a p chart with stepped limits and as a rate by intake channel.
Guardrails: keying minutes per invoice (working time) and calendar days to pay.

**What you ask for, and when.** The invoice extract in week 2 (given); the attribute study in
week 3 (given); the change log in week 4 (on request — a team that sees keying time fall
through the year and does not ask what changed has not investigated); the pilot file in week 7
(released only after the pilot design and the written prediction are on file); the simulated
cost table in week 8.

---

## 3. What the learner submits by gate

| Gate | On the one page |
|---|---|
| Tollgate 1 (wk 2) | Cause-free problem statement with the 7.3% correction figure and its basis (sampled invoices, every tenth, 26 working weeks); charter with start (invoice arrives on any of the four paths) and stop (invoice released to the approver without a later change); CTQ from the service agreement's 3% target, with the agreement named; SIPOC; stakeholder map naming the two clerks and the approver group as resistance risks with the planned response |
| Tollgate 2 (wk 4) | Attribute agreement result and what was done about it; p chart with stepped limits and the stability statement; DPMO and sigma level with the convention named; the keying-time step change found and dated from the change log; the audit findings — duplicate row, eight spellings, six blank timers, one negative days-to-pay, and the censoring — handled in writing |
| Tollgate 3 (wk 6) | Fishbone → C&E → short list; stratified charts with counts; the channel test with the difference in percentage points, its interval and the plain sentence; the clerk cause and the vendor-group cause tested and shown not to verify, with the smallest difference the data could have seen; the prediction for Improve |
| Tollgate 4 (wk 8) | Selection matrix; pilot plan, prediction and power statement; before/after p chart; mix-adjusted result; control plan with the intake owner named; standard work for the new intake; simulated benefit with its class stated and the guardrail that could not yet be read |

---

## 4. FACILITATOR ANSWER KEY — do not distribute

### 4.1 What is planted

Generated with a fixed seed by `data/generate.py`; re-running reproduces the files exactly.
Every figure below is computed from the shipped CSVs (and, for §4.2, from the table in §1.4).

| Feature | Where | Size | Found by |
|---|---|---|---|
| **Intake channel drives corrections** | `entry_channel`, all 26 weeks | 13.8% Email-PDF vs 5.5% Portal, 7.3% Paper-scan, 1.3% EDI | Pareto with counts; chi-square; two-proportion test |
| **Vendor group drives keying time and payment days, not corrections** | `vendor_group` | Services keys +2.1 min and pays 7.4 to 14.8 calendar days later than the other groups; correction rate p = 0.16 | Box plot; ANOVA + Tukey; the chi-square that does not verify |
| **A correction costs calendar days** | `corrected` vs `days_to_pay` | +7.0 calendar days raw, +6.4 adjusted for vendor group | Welch t; regression with vendor group in the model |
| **Mid-period step and drift in keying time** (6 Apr capture template and field order) | All channels except EDI, from 6 Apr | −0.95 to −1.38 min per invoice at the step, then about −0.23 min per 4-week month | I-MR on weekly means with pre-change limits; the change log; EDI as the comparison channel |
| **What does not verify** | Clerk (`clerk_code`): χ² p = 0.81 — and the sponsor's two named clerks are genuinely the top two of twelve. Vendor group on corrections: p = 0.16. Paper as the error channel: sits exactly on its expected count. Trend in the correction rate: none | — | A4 |
| **Messy data** | One duplicated row (`INV100721`), eight non-standard yes/no spellings, six blank timers, one `days_to_pay` of −12 (`INV100433`), 261 censored `days_to_pay` | 277 rows to explain | Data audit before any chart |
| **Measurement system** | Definition v1 does not say which fields count; appraiser B misses purchase-order cases and false-alarms on description mismatches | Between-appraiser agreement 70% | Attribute agreement analysis |

**What the week 2 map should produce from the go-see notes** (basis: an 8-hour working day,
Monday to Friday; the extract carries no weekend rows). Little's Law on the three queues:
shared mailbox 82 ÷ 46 emailed invoices a working day = **1.8 working days**; approver queue
240 ÷ 158 = **1.5 working days**; mailroom 12 ÷ 23 paper invoices = **0.5 working day**.

| Path | % of volume | Lead time (working days) | Lead time (calendar days) | Touch time (working min) | Process cycle efficiency | %C&A at the approver |
|---|---|---|---|---|---|---|
| EDI | 21.7% | 1.5 | 2.1 | 11.4 | 1.56% | 98.7% |
| Portal | 34.3% | 1.5 | 2.1 | 13.9 | 1.91% | 94.5% |
| Paper-scan | 14.8% | 2.0 | 2.9 | 18.0 | 1.84% | 92.7% |
| **Email-PDF** | 29.3% | **3.3** | **4.6** | 16.5 | **1.04%** | **86.2%** |
| Volume-weighted | 100% | 2.1 | 3.0 | 14.7 | 1.45% | 92.7% |

Touch time is keying (the log's mean for that channel) plus 3 minutes matching, 4 minutes
approval and 1.5 minutes posting. The rework loop adds a second pass through the approver
queue: about 3.0 working days and 18 working minutes. Two points the key expects: the four
channels are four processes, and drawing one "receive invoice" box hides the 1.8 working days
of non-value-added mailbox wait that only emailed invoices carry; and %C&A can only be
computed at the approver step from this log, because no earlier step records a check — which
is a data collection plan item, not an excuse.

### 4.2 Week 3 — the measurement system

Computed from the §1.4 table against the house criteria in
[`../templates/msa-plan.md`](../templates/msa-plan.md) Part B.

| Statistic | Appraiser A | Appraiser B | House band |
|---|---|---|---|
| Within appraiser (pass 1 = pass 2) | 29/30 = **96.7%** | 25/30 = **83.3%** | ≥ 90% acceptable |
| Vs standard, both passes correct | 28/30 = **93.3%** (Wilson CI 79–98%) | 23/30 = **76.7%** (CI 59–88%) | ≥ 90% acceptable |
| Kappa vs standard (60 judgments) | **0.89** | **0.66** | ≥ 0.75 acceptable |
| Missed corrections | 2 of 20 (10%) | 5 of 20 (25%) | — |
| False alarms | 1 of 40 (2.5%) | 4 of 40 (10.0%) | — |
| Between appraisers, all four judgments identical | **21/30 = 70.0%** | | ≥ 90% acceptable |
| All appraisers vs standard | **21/30 = 70.0%** | | ≥ 90% acceptable |

Appraiser A vs B agree on 80.0% of records in each pass (kappa 0.52 and 0.55).
**Verdict: unacceptable.** Between-appraiser agreement (70%) and all-appraisers-vs-standard
(70%) are both below the 80% floor; appraiser B is unacceptable against the standard (76.7%),
marginal on repeatability (83.3%) and marginal on kappa (0.66); appraiser A passes every
criterion individually.
The disagreements are not scattered. Five of the ten records the panel called "needs
correction" were called accurate by someone, and all five turn on the purchase-order field;
the four false alarms are description mismatches that change nothing payable. The definition,
not the people, is the failure — v1 says "complete and accurate" and never says which fields
count.

The sentence: *"Two analysts looking at the same thirty invoices agree with each other and
with the panel on seven in ten; one of them changes his own mind on five of thirty a week
apart. Our correction rate is a real signal about intake, but its absolute level is only as
good as the definition, and the definition does not say which fields count."*

**What the key expects the team to do.** (1) Rewrite the definition. **v2:** *a correction is
a change, after release, to one of four fields — payee, purchase-order number, payable amount,
or cost centre.* (2) Re-run the same 30 records. The re-run: A within 29/30 (96.7%), vs
standard 29/30 (96.7%), kappa 0.96; B within 28/30 (93.3%), vs standard 28/30 (93.3%), kappa
0.93; between appraisers 27/30 (90.0%); all vs standard 27/30 (90.0%). Acceptable, at the
bottom of the band, with 30 records the floor and 50 better next time.
(3) **Do not restate history.** Definition v1 was in force for the whole baseline extract and
stays in force through the pilot, so before and after compare like for like (★ I3). v2 becomes
the standard at handover, with the change dated on the chart and in the control plan. A team
that switches definitions mid-project and compares the halves has a data-ethics stop.

**The attenuation arithmetic, and its limit.** Pooled over both appraisers and passes, v1
misses 17.5% of true corrections and false-alarms on 6.2% of accurate invoices. Misclassification
that behaves the same way in every channel *shrinks* an observed difference by a factor of
(1 − miss − false alarm) = 0.76, so the 8.3-point Email-PDF-to-Portal gap in week 6 is, if
anything, understated — about 11 points if measured cleanly. Run the same arithmetic on the
*level* and it returns an implied true rate of 1.4%, which is not credible, and a Green Belt
should be able to say why: the study items were deliberately loaded with borderline and
defective cases (10 of 30) per the MSA plan, so the false-alarm rate measured on them is an
upper bound and cannot be applied to a stream that is 93% clean. Use the arithmetic for the
direction, never as a correction factor. Under v2 the same arithmetic gives an attenuation of
0.95 — which is what "the measurement system is good enough to act on" looks like.

### 4.3 Week 4 — audit, stability, capability

**Audit.** 2,053 rows. One exact duplicate (`INV100721`, 11 Mar, Paper-scan, C05 — the report
paginated twice). Eight rows carry a non-standard spelling of the flag (`no` twice, `NO`
twice, `n` twice, `N`, `Y`), which must be mapped, not dropped — they are seven No and one
Yes. Six blank
`entry_minutes` (`INV100352`, `INV101478`, `INV101500`, `INV101675`, `INV101773`,
`INV101856` — the timer was not started); exclude them from keying-time statistics only, and
keep them in the correction-rate denominator, because the flag is present. One `days_to_pay`
of **−12** (`INV100433`): impossible, exclude from payment statistics, keep the row.
**261 blank `days_to_pay` (12.7%) are censored, not missing** — the invoice was not yet paid
when the extract ran on 10 July. The censoring is not spread evenly: 0% in January–April,
0.9% in May, 62.6% in June and 98% in the first three days of July. A team that drops blanks
and reports a mean has quietly deleted the slowest recent invoices. Clean n = **2,052**;
payment statistics n = **1,790**.

**Baseline.** Corrections **150 of 2,052 = 7.31%** (Wilson CI 6.26–8.52%), against the service
agreement's 3% target. First-time-right 92.69%. On the sample this is 5.8 corrections a
working week; on the stream, about 58.

**Capability is DPMO here, not Cp/Cpk.** The primary metric is a classification, so there is
no continuous distribution and no Cp/Cpk to compute:

| Measure | Value |
|---|---|
| Defects per million opportunities (one opportunity per invoice) | **73,099** |
| Yield | 92.69% |
| Z-bench (long-term) | 1.45 |
| Sigma level, 1.5-shift convention | **2.95** |

State the convention or the number is unreadable. A per-*opportunity* DPMO (defects ÷ fields
keyed) is not computable from this extract: the log carries a yes/no classification, not a
count of wrong fields. Saying so, and adding the count to the data collection plan, is the
right answer — inventing an opportunity count is not.

**Stability — p chart, 26 weekly subgroups, n from 63 to 100.** p̄ = 7.31%, limits stepped
with n (UCL 15.1% to 17.1%, LCL 0 throughout). **No point beyond the limits; longest run on
one side of the centre line is 6; two points beyond 2 sigma, not consecutive.** The process is
stable and predictable at a rate the customer does not accept — the textbook case for working
on common causes rather than chasing weeks.

The trap is the limits. With a constant average subgroup (n̄ = 78.9) the UCL is 16.10%, and the
week of 19 January — 11 corrections on 67 invoices = 16.42% — is flagged as a special cause.
On its own n of 67 that week's UCL is 16.85% and the point is inside. A team that chases that
week will find nothing in the change log, because there is nothing there.

**The keying-time step.** Keying time is a different story and needs a different chart.
Weekly mean keying minutes for the three capture channels (EDI excluded — the capture
template does not touch it), I chart with limits from the 13 weeks **before** 6 April: centre
7.77 min, limits 6.49 to 9.04. Nothing is out of control before the change. After it:

| Channel | Before 6 Apr | After 6 Apr | Change | Welch t | p |
|---|---|---|---|---|---|
| Portal | 5.92 min (n = 346) | 4.98 (n = 357) | −0.95 (−16.0%) | 6.35 | < 0.001 |
| Email-PDF | 8.65 (n = 306) | 7.28 (n = 292) | −1.38 (−15.9%) | 6.18 | < 0.001 |
| Paper-scan | 10.11 (n = 150) | 8.85 (n = 153) | −1.26 (−12.4%) | 3.65 | < 0.001 |
| **EDI (comparison)** | 2.91 (n = 197) | 2.88 (n = 245) | **−0.03 (−1.0%)** | 0.17 | 0.86 |

Difference-in-differences against EDI: **−1.17 min**; the channel × period interaction is
significant for each capture channel (p ≤ 0.001). On the daily-mean chart the first run of
eight points below the pre-change centre completes on **15 April, eight working days after
the change**; the weekly chart puts five of the last six weeks below the lower control
limit, from 25 May, because the step is followed by a **continued drift**: the post-change regression on
day gives −0.0082 min per calendar day (p = 0.020, R² = 0.007), about −0.23 min per four-week
month, consistent with people learning a re-ordered screen. Monthly means: 7.89, 7.76, 7.64,
6.82, 6.74, 6.31.

Two cautions the key expects. Daily means of 12 invoices are noisy — the pre-change chart
flags 5 January (10.84 min on eight non-EDI invoices, two of them long); the weekly chart is
the right subgroup for this metric and the run rule, not a single point, is what detects the
step. And keying time is **skewed** (skew 0.91, spread falls with the mean, Levene p = 0.0002):
Welch on means, the Mann-Whitney (p = 1.4 × 10⁻¹⁴) and a t-test on logs (ratio of geometric
means 1.18) all agree, so the conclusion is robust; report the mean difference in minutes
because that is what converts to hours.

**Does the capture change touch the correction rate?** No: 7.20% before (72/1,000) and 7.41%
after (78/1,052), z = −0.19, p = 0.85; on Email-PDF alone 12.7% → 14.9%, p = 0.44. The
sponsor's belief that "keying time is not the issue" is right for the wrong reason: keying
time did improve, nobody on the project did it, and it did not make invoices more accurate.

**Capability sentence the key expects:** *"The correction rate is stable at 7.3% — predictable,
common cause, no week out of control in six months — against a 3% target, which means the
system delivers 73,000 defects per million and will keep doing so until something changes.
Keying time fell about 16% in April when IT changed the capture template; that is real, it is
not ours, and it did not change accuracy."*

### 4.4 Week 5 — where the variation lives

| Stratum | n | Corrections | Rate | Keying min (mean / median) | Days to pay (mean) |
|---|---|---|---|---|---|
| **Email-PDF** | 601 | 83 | **13.8%** | 7.98 / 7.5 | 29.8 |
| Paper-scan | 303 | 22 | 7.3% | **9.47 / 9.0** | 29.4 |
| Portal | 703 | 39 | 5.5% | 5.44 / 5.1 | 29.5 |
| EDI | 445 | 6 | **1.3%** | **2.90 / 2.4** | 29.2 |
| Raw materials | 723 | 59 | 8.2% | 5.65 / 5.3 | 28.7 |
| **Services** | 389 | 34 | 8.7% | **8.43 / 7.8** | **37.1** |
| Utilities | 173 | 12 | 6.9% | 5.61 / 5.2 | **22.2** |
| MRO | 528 | 36 | 6.8% | 5.63 / 5.3 | 29.7 |
| Freight | 239 | 9 | 3.8% | 6.20 / 5.9 | 25.6 |
| Clerks C01–C12 | 155–193 each | 8–18 | 5.2–10.2% | — | — |

Email-PDF is **29.3% of the invoices and 55.3% of the corrections**; EDI is 21.7% of the
invoices and 4.0% of the corrections. Paper-scan is 14.8% of invoices and **14.7%** of
corrections — it sits exactly on its expectation, which is the quietest and most useful fact
in the table.

The chart that separates the two vendor-group stories is keying time and payment days side by
side with the correction rate: Services is the slowest to key and by far the slowest to pay,
and its correction rate is ordinary. Channel and vendor group are independent in the extract
(χ² = 13.5, df 12, p = 0.34), so neither effect is the other wearing a different label.
Correction rate by channel within vendor group stays high for Email-PDF in every group
(8.7% to 18.1%).

Expected short list after the C&E matrix: unstructured intake (Email-PDF has no required
fields and no validation at the source); purchase-order data not available to the clerk at
keying; the definition of "correction" (measurement — already being fixed); clerk experience
(the sponsor's cause — kept on the list to be tested, not assumed away); paper handling (the
sponsor's other cause — also kept).

### 4.5 Week 6 — the tests

**Intake channel — verifies.** Chi-square of `corrected` by `entry_channel` on 2,052 invoices:
**χ² = 64.05, df = 3, p < 0.001**, smallest expected count 22.1. Two cells carry it: Email-PDF
contributes 37.5 of the 64.05 (83 corrections against 43.9 expected) and EDI contributes 23.3
(6 against 32.5). Follow-up two-proportion tests with intervals:

| Comparison | Rates | Difference | 95% CI | p |
|---|---|---|---|---|
| Email-PDF vs Portal | 13.81% vs 5.55% | **+8.26 points** | +5.1 to +11.6 | < 0.001 |
| Email-PDF vs EDI | 13.81% vs 1.35% | +12.46 | +9.5 to +15.5 | < 0.001 |
| Email-PDF vs Paper-scan | 13.81% vs 7.26% | +6.55 | +2.2 to +10.4 | 0.004 |
| Portal vs EDI | 5.55% vs 1.35% | +4.20 | +2.1 to +6.3 | < 0.001 |
| **Paper-scan vs Portal** | 7.26% vs 5.55% | +1.71 | **−1.4 to +5.5** | **0.30** |
| Unstructured (email + paper) vs structured (portal + EDI) | 11.62% vs 3.92% | +7.70 | — | < 0.001 |

The sentence: *"Emailed PDFs are corrected 13.8% of the time against 5.5% for portal invoices
— 8.3 points higher, CI 5 to 11.6 points, about two and a half times as often, on 601 and 703
invoices. Emailed PDFs are three in ten of our invoices and more than half of our corrections;
EDI at 1.3% shows what structured intake does. The cause is that the emailed path is the only
one with no required fields and no validation before a person keys it."*

**Paper — does not verify (A4).** Paper is the sponsor's first cause and the data do not
support it: 7.26% against Portal's 5.55%, p = 0.30, and its contribution to the chi-square is
0.0. What paper *is* is the slowest channel to key (9.47 min against 5.44 for Portal) — a
cost and lead-time problem, not an accuracy problem. Sentence for the sponsor: *"Paper is our
slowest channel, not our error channel. A paper project buys time back, not accuracy."*

**Clerk — does not verify (A4), and this is the item worth the most teaching time.** Chi-square
across twelve clerks: **χ² = 6.88, df = 11, p = 0.81**, smallest expected count 11.3. The two
clerks the sponsor named are in fact the top two: C07 at 10.2% (16/157) and C09 at 9.7%
(18/186), against C03 and C10 at 5.2%. Three things make the case:

1. **Pooling the two named clerks against the rest gives 9.91% vs 6.79%, +3.12 points,
   CI +0.10 to +6.91, z = 2.03, p = 0.042** — which is exactly the trap. They were chosen
   *because* they were top of the report. Under a common rate of 7.31%, a simulation of 20,000
   sets of twelve clerks at the observed volumes puts the highest clerk at or above 10.2% in
   **66% of runs**, and the top two pooled at or above 9.91% in **57%**. The observed spread
   between the highest and lowest clerk, 5.0 points, is *smaller* than the 6.5 points you
   would expect by chance alone.
2. **The interval says what the study could have seen.** With about 171 invoices per clerk, a
   clerk would have had to run at roughly **14.5%** — more than seven points above everyone
   else — before the test would find them 80% of the time.
3. **There is no learning curve either.** C07 runs 7.8% in the first half and 12.5% in the
   second; C09 runs 11.6% then 8.0%. Nobody is improving or degrading; this is noise.

Sentence for the sponsor: *"With about 170 invoices each, we would have found a clerk running
seven points above the rest, and we did not find one; the two at the top of the report are
where chance puts the top of a twelve-name report every month. A second-person check on those
two covers about one invoice in six — 26 a working day — to catch what the approver already
catches. The cause is set aside, not declared false."*

**Vendor group — verifies on two metrics, and not on the one that matters (A4).** Correction
rate by vendor group: χ² = 6.60, df = 4, p = 0.16 — no effect, and with 173 invoices in the
smallest group only a rate above about 14.5% would have been detectable. Keying time: one-way
ANOVA F(4, 2041) = 61.7, p < 0.001; Tukey separates **Services** from every other group by
2.2–2.8 minutes and separates none of the others from each other; with channel and period in
the model Services costs **+2.11 min** (CI 1.78 to 2.44), and within the Portal channel alone
Services runs 7.35 vs 4.94 min (+2.41, CI +2.00 to +2.81). Payment days: F(4, 1785) = 289,
p < 0.001; Services 37.1 days against Utilities 22.2 — which is the contract terms, not the
process. Sentence: *"Services invoices take two minutes longer to key and are paid a week
later than most, and they are corrected no more often than anything else. An effect on a
different metric is not a cause of our problem."*

**A correction costs calendar days — verifies as the consequence.** Corrected invoices are
paid at **36.06** calendar days against **29.03** for the rest: **+7.04 days, CI +5.85 to
+8.23**, Welch t = 11.61, p < 0.001, Cohen's d = 1.12 on 125 and 1,665 invoices. Vendor group
is a confounder (Services is slow on both counts), so put it in the model: with vendor group
controlled a correction still costs **+6.44 days (CI 5.56 to 7.32)**, and the effect holds
inside single groups (Raw materials +6.9 days, p < 0.001; Services +6.2 days, p < 0.001).
The walk explains much of it — a returned invoice goes to the back of the approver queue
twice, about 3.0 working days, which is 4.3 of the 7.0 calendar days — and the rest is the
vendor-query loop the log does not time. Say that the gap is unexplained and put that
timestamp in the data collection plan; do not model what you did not measure.

**Do not compute a compliance rate from this extract.** 42.5% of paid invoices are beyond 30
calendar days, but the extract has **no payment-terms column** and services contracts are net
45 — the figure conflates terms with performance. The honest statement is the within-group
comparison above. This is also why days-to-pay is a guardrail here and not the primary metric.

**The correlation trap.** Keying minutes and days to pay correlate at r = 0.213 (p < 0.001,
n = 1,785, R² = 4.5%). Inside Raw materials the same correlation is r = 0.109 (R² = 1.2%). The
pooled correlation is the vendor-group mixture: Services is slow to key *and* slow to pay for
unrelated reasons. A team proposing to speed up keying in order to pay faster has verified a
mixture.

**Trend over time — does not verify.** Correction rate on day index: −0.003 points per day,
p = 0.77, R² ≈ 0 — about half a point across six months, which is nothing.

**Prediction for Improve (I2), written at Tollgate 3:** if emailed invoices are captured with
the same required fields the portal enforces, the Email-PDF correction rate falls from 13.8%
to about **5.5%** (the portal's level, because the mechanism is the same), which at the
current channel mix takes the line from 7.31% to about **4.9%** — still above the 3% target,
because portal and paper corrections remain. Keying time is *not* the success measure: the
April template change is still drifting and would be credited to us.

### 4.6 Weeks 7–8 — the pilot

**Countermeasure in the shipped pack:** the shared mailbox is replaced for emailed vendors by
a structured upload form — vendor number, purchase-order number, invoice number, amount and
tax are required fields, and the form refuses a purchase-order number that is not on the open
list (poka-yoke at the source, prevention rather than detection). The sponsor's second-person
check is written up as the rejected option and why. Three weeks, **3–21 Aug 2026**, all four
channels still sampled the same way, same analysts, definition v1 unchanged.

**The power statement the pilot plan must carry, written before the data arrive.** Detecting
13.8% → 6.9% at 80% power needs about **298 emailed invoices per period**; three weeks yields
about 74 sampled emailed invoices, which gives **46% power**. So the plan says in advance:
the decision rule is direction plus magnitude against the prediction, with a 13-week
monitoring window at roll-out to confirm. Detecting the *line* rate moving 7.3% → 5.3% would
need about 2,360 sampled invoices per period — 30 working weeks. Measure the pilot on the
channel you changed.

**Stop rule:** stop and review if emailed invoice volume falls more than 20% (vendors blocked
rather than helped), if invoices held by the purchase-order check exceed 10% of submissions or
are not cleared within one working day, or if the Email-PDF correction rate exceeds 20% in two
consecutive weeks. Note why the control chart cannot carry the stop rule: at 25 emailed
invoices a week the 3-sigma UCL is 34.5%, too wide to act on. The held-invoice count is the
leading indicator.

**Results.**

| Measure | Baseline | Pilot |
|---|---|---|
| Email-PDF correction rate | 13.81% (83/601) | **6.76% (5/74)**, Wilson CI 2.9–14.9% |
| Email-PDF, size of the fall | — | **7.05 points**; the 95% CI for the fall runs from −1.4 points (a small rise) to +11.9 points; z = 1.70, **p = 0.089** (Fisher p = 0.100) |
| Email-PDF vs the post-6-Apr baseline only | 14.92% (44/295) | a fall of 8.16 points, z = 1.85, p = 0.064 |
| Line correction rate | 7.31% (150/2,052) | 5.65% (13/230), p = 0.355 |
| Line rate, pilot channel rates at the baseline mix | 7.31% | **6.33%** |
| Other three channels (comparison) | 4.62% (67/1,451) | 5.13% (8/156), p = 0.77 |
| Paper-scan | 7.26% (22/303) | 20.83% (5/24) |
| DPMO / sigma level (1.5-shift) | 73,099 / 2.95 | 56,522 / 3.08 |
| Days to pay | 29.5 calendar days (n = 1,790) | **not readable — 0 of 230 paid at extract** |

On the p chart continued with baseline limits, the three pilot weeks read 7.14%, 6.06% and
3.75% against stepped upper limits near 16% — inside the limits, below the centre line three
weeks running, which is a run of three, not a signal. The Email-PDF chart reads 8.0%, 12.5%,
0.0% against an upper limit near 34.5%: the stratified chart on 25 invoices a week cannot see
this change, which is exactly what the power statement predicted.

**Three things the honest reading has to handle.**

1. **The channel that was changed did what was predicted, and the test cannot confirm it.**
   6.76% against a predicted 5.5%, on 74 invoices, p = 0.089. The interval on the fall runs
   from −1.4 points to +11.9 points — it contains zero. The right sentence is *"the emailed
   correction rate halved, consistent with the prediction; with 74 invoices this is not yet
   proof, and the roll-out window is sized to settle it."* Not *"corrections halved
   (p < 0.05)"*, and not *"no significant change."*
2. **Paper-scan spoiled the line number, and it is noise.** Five corrections on 24 paper
   invoices is 20.8% against a 7.26% baseline — an exact binomial p of 0.027 if you test it on
   its own, but it is one of four post-hoc channel comparisons, the pilot did nothing to paper,
   and on its own p chart the point sits inside the upper limit of 23.2% at n = 24. It is also
   why the line rate barely moved: reading only the line rate understates what happened on the
   channel that was changed. Watch paper at roll-out; do not act on it, and do not delete it.
3. **The channel mix moved and the guardrail is unreadable.** Paper fell from 14.8% to 10.4%
   of invoices and portal rose (χ² = 5.33, df 3, p = 0.15 — within chance, but check it).
   Standardizing the pilot's channel rates to the baseline mix gives 6.33% rather than 5.65%,
   and that is the number to report for the line. And nothing in the pilot window had been
   paid by the extract, so the days-to-pay guardrail cannot be read for another four to six
   weeks; the benefit claim waits for it.

**The keying-time trap that fails ★ I3 if it is missed.** Email-PDF keying falls from 7.98 min
(full baseline) to 6.70 in the pilot — 16%, p < 0.001. Against the **last four baseline weeks**
(6.88 min) the same comparison is −0.18 min, p = 0.59. The difference is the April capture
template and its drift, not the upload form. Across the three capture channels: full baseline
7.15 → pilot 5.87 (−17.9%), last four weeks 6.34 → pilot (−7.4%). A team that claims a 16%
productivity gain has claimed IT's work, and has also changed the comparison basis between
before and after — a data-ethics finding, not a rounding argument. The correct handling is to
name the April change, date it on the chart, and compare like for like against the post-change
period.

### 4.7 Response packs for other countermeasures (Practicum track)

The shipped `txn-pilot.csv` is the pack for a countermeasure aimed at the verified intake
cause. For any other countermeasure the practicum instructor generates the pack from
`generate.py`'s `txn_rows()` with the parameter below, dates it, and releases it as the
workflow tool would release an extract. What is scored is the honest reading, not the choice.

| Learner's countermeasure | Aimed at | Parameter | What the pack shows |
|---|---|---|---|
| Structured upload form for emailed invoices (shipped) | Verified cause | `corr_override={"Email-PDF": 0.055}` | Email-PDF 13.8% → about 6%; line to about 5–6%; underpowered on three weeks |
| Purchase-order validation at keying on every channel | Verified cause, applied everywhere | `corr_override` on all four channels at half their rate | Line rate to about **3.65%**; the effect shows on every channel; needs the open-purchase-order feed and an owner for it |
| Move emailed vendors to the portal | Verified cause, by migration | `CHANNELS` shares: Email-PDF 0.30 → 0.12, Portal 0.35 → 0.53 | Line rate to about **5.96%**, and the Email-PDF *rate* is unchanged at 13.8% on whoever is left. The learner must see that the mechanism is mix, not defect rate, and that enrolment takes months |
| Second-person check on C07 and C09 | The sponsor's unverified cause | no change | Nothing moves; keying time rises; "did not work, here is why" earns I3 if the A4 work is shown |
| Eliminate paper | The sponsor's other unverified cause | `CH_CORR["Paper-scan"]` 0.06 → 0.02 | Line rate to about **6.53%**; keying time falls usefully; a team that sold this as an accuracy project has to explain the gap between its prediction and the pack |
| Capture template tuning only | Keying time | already in the baseline from 6 Apr | Keying time falls, correction rate does not move; a team claiming improvement has confused productivity with quality |

### 4.8 Monitoring pack (30 working days after handover) and the planted drift

Generated by the instructor: 30 working days after roll-out of the upload form, same sampling.
Planted: on days 12 and 13 the open-purchase-order feed fails overnight and the form falls
back to accepting free-text purchase-order numbers; emailed corrections return to about 13%
for those two days, then recover on day 14 when the feed is restored.

The response plan has to catch a **two-day** event on a channel that supplies about 5 sampled
invoices a working day. The weekly p chart cannot: at n ≈ 25 the upper limit is near 34%. The
control plan that works watches the **poka-yoke's own counters** — submissions accepted with a
free-text purchase-order number, and invoices held by the check — daily, with the feed owner
named and a one-working-day response. A control plan that monitors only the correction rate
monthly sees one ordinary month and misses it. This exercises ★ C1 and feeds the `sustained`
reading, which on the Practicum track is `not-applicable`.

### 4.9 Simulated cost table (C3 — every figure labelled simulated)

| Item | Basis | Value |
|---|---|---|
| Clerk rework per correction | 14 working minutes at $34/h loaded | $7.93 |
| Approver re-review per correction | 6 working minutes at $52/h loaded | $5.20 |
| Cost per correction | Sum of the two | **$13.13 simulated** |
| Corrections per working week | 789 invoices/week × 7.31% | 58 |
| Current run rate | 58 × $13.13 | $758 per working week · $36,369 over 48 working weeks |
| At the predicted 4.88% | 38 corrections/week | $505 per working week |
| Annual difference, baseline to prediction | 48 working weeks, no annualization beyond | **≈ $12,100 simulated** |
| Clerk hours on corrections at baseline | 58 × 14 min × 48 weeks | 646 hours a year |
| Late-payment exposure | Corrections add 6.4 calendar days to payment (model, vendor group controlled) | Cost avoidance; **not claimed** — the extract has no terms column and no late-fee data |
| Keying time released by the April capture change | 1.19 min × 619 non-EDI invoices/week = 12.3 clerk-hours a working week | **Real and not the project's.** Named in the report, excluded from the claim |

The Finance partner (instructor in role) accepts the basis at Tollgate 2: corrections ×
minutes × loaded rate, soft benefit unless the hours are redeployed and a manager signs for
them, no annualization beyond 48 working weeks, nothing counted for the capture-template
change, nothing counted for days-to-pay until the pilot invoices are paid. A team that reports
"$36,000 a year of rework eliminated" has claimed the whole baseline as a benefit.

### 4.10 Common learner errors the facilitator should expect

- Charting the correction rate with constant-n limits and chasing the week of 19 January.
- Reporting sigma level 2.95 without the 1.5-shift convention, or trying to compute Cp/Cpk on
  a yes/no metric.
- Treating the 261 blank `days_to_pay` as missing data and dropping them, which removes the
  slowest recent invoices.
- Dropping the eight non-standard spellings instead of mapping them (they carry one
  correction), or deleting the duplicate row without logging it.
- Testing the two clerks the sponsor named, finding p = 0.042, and verifying a cause that was
  selected because it was the maximum of twelve.
- Concluding "vendor group matters" from the keying-time ANOVA and aiming a countermeasure at
  Services.
- Claiming the April keying-time improvement, or comparing pilot keying time to the full
  baseline rather than to the post-change period.
- Reading the pilot's line rate (5.65%, p = 0.355) as "no change" and abandoning a
  countermeasure that halved the rate on the channel it touched — or the opposite error,
  reporting "corrections halved" from 74 invoices without the interval.
- Acting on the pilot's Paper-scan 20.8%, or quietly leaving it out of the report.
- Skipping the attribute agreement study because "the workflow records it automatically" —
  the workflow records a person's judgment, and ★ M3 is about that judgment.

---
*v1.0 · 2026-09-20*
